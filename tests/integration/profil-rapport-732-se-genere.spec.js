import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// PORTE #732 — LE RAPPORT DU PROFIL SE GÉNÈRE, ET SON P EST CELUI DU PROFIL.
//
// Audit de l'onglet Suivi, 5 septembre 2026, constat B-5. `genererRapportAPI`
// (profil-etudiant-rapport.js) appelait `obtenirDetailsAssiduite` par son nom nu depuis
// une autre IIFE, et la fonction n'était exportée sur `window` par aucun fichier de js/ :
// depuis le refactor du 18 mai 2026, le bouton « Rapport » écrivait dans la zone de texte
// « Erreur lors de la génération du rapport : obtenirDetailsAssiduite is not defined ».
// Et quand on lui prêtait un pont, ses nombres n'étaient pas ceux du profil : « 75 %
// (4 meilleurs artefacts) » là où la note du cours dit 77 ; « 0 remises / 0 productions ».
//
// POURQUOI AU NAVIGATEUR. L'état de départ était DÉDUIT du source (une portée d'IIFE), pas
// vu. Un banc Vitest qui charge les fichiers dans un même faux `window` ne peut pas
// reproduire cette frontière : il faut la page réelle. Cette spec doit être ROUGE avant le
// correctif (le message d'erreur) et VERTE après (un rapport dont le P est celui affiché).
//
// Aucun clic souris simulé ni attente chronométrée (règle du 4 septembre, §4.1 bis) : le chemin de l'utilisateur
// — ouvrir le profil, aller à « Rapport » — est joué par les fonctions que les data-action
// appellent, et on attend le RENDU (la zone de texte remplie), pas une durée.

const patternsAttendus = [
    /version\.json.*access control/i,
    /Cross origin requests are only supported/i,
    /Not allowed to load local resource.*\.(svg|png)/i
];

test('Porte #732 · le bouton « Rapport » du profil produit un rapport dont le P est celui du profil', async ({ page }) => {
    const erreurs = [];
    const estAttendue = (m) => patternsAttendus.some((re) => re.test(m));
    page.on('pageerror', (e) => { const m = `pageerror: ${e.message}`; if (!estAttendue(m)) erreurs.push(m); });
    page.on('console', (msg) => {
        if (msg.type() === 'error') { const m = `console.error: ${msg.text()}`; if (!estAttendue(m)) erreurs.push(m); }
    });
    page.on('dialog', (d) => d.dismiss().catch(() => {}));

    await page.goto(indexHtml);
    await page.waitForFunction(() => typeof window.afficherProfilComplet === 'function' && typeof window.changerSectionProfil === 'function' && typeof window.db !== 'undefined');

    const montage = await page.evaluate(() => {
        // Le trimestre d'abord : `window.cle()` préfixe par le trimestre actif.
        const trimestreId = 'test732';
        window.db.setSync('trimestres', [{ id: trimestreId, nom: 'Trimestre test', actif: true }]);
        window.db.setSync('trimestreActif', trimestreId);
        const coursId = 'cours-732';
        window.db.setSync('infoCours', { id: coursId, codeCours: 'FRA101', groupe: '01', _groupeCoursId: 'GC_732' }); // security-ok: fixture de test, littéral du fichier
        window.db.setSync('groupeCoursActif', { id: 'GC_732', trimestreId });
        window.db.setSync(trimestreId + '_groupesCours', [{ id: 'GC_732', trimestreId, coursId, groupeNum: '01', pratiqueId: 'sommative', actif: true }]);
        window.db.setSync(window.cle('groupeEtudiants'), [{ da: 'TEST732', nom: 'Roy', prenom: 'Camille', groupe: '01', coursId }]); // security-ok: fixture de test
        window.db.setSync(window.cle('productions'), [ // security-ok: fixture de test
            { id: 'p732-1', titre: 'Analyse 1', type: 'travail', ponderation: 50, dateEcheance: '2026-02-01' },
            { id: 'p732-2', titre: 'Analyse 2', type: 'travail', ponderation: 50, dateEcheance: '2026-03-01' }
        ]);
        const echelle = { id: 'E732', nom: 'IDME test', seuilMaitrise: 'M', niveaux: [
            { code: 'I', nom: 'Insuffisant', min: 0, max: 64, valeurCalcul: 40 }, { code: 'D', nom: 'En développement', min: 65, max: 74, valeurCalcul: 65 },
            { code: 'M', nom: 'Maîtrisé', min: 75, max: 84, valeurCalcul: 75 }, { code: 'E', nom: 'Étendu', min: 85, max: 100, valeurCalcul: 100 } ] };
        window.db.setSync(window.cle('echellesTemplates'), [echelle]); // security-ok: fixture de test
        window.db.setSync(window.cle('grillesTemplates'), [{ id: 'G732', nom: 'Grille test', criteres: [{ id: 'c1', nom: 'Structure', ponderation: 100, niveauSOLO: 'multistructurel' }] }]); // security-ok: fixture de test
        if (typeof window.definirPreference === 'function') window.definirPreference('grilleReferenceDepistage', 'G732');
        // Deux copies notées 60 et 80 : note du cours sommative (60 × 50 + 80 × 50) / 100 = 70.
        window.db.setSync(window.cle('evaluationsSauvegardees'), [ // security-ok: fixture de test
            { id: 'ev732-1', etudiantDA: 'TEST732', productionId: 'p732-1', echelleId: 'E732', grilleId: 'G732', noteFinale: 60, niveauFinal: 'I', ponderationCouverte: 100, verrouillee: true, groupe: '01',
              dateEvaluation: '2026-02-01T12:00:00.000Z', retroactionFinale: 'Rétroaction.', criteres: [{ critereId: 'c1', critereNom: 'Structure', niveauSelectionne: 'I', ponderation: 100 }] },
            { id: 'ev732-2', etudiantDA: 'TEST732', productionId: 'p732-2', echelleId: 'E732', grilleId: 'G732', noteFinale: 80, niveauFinal: 'M', ponderationCouverte: 100, verrouillee: true, groupe: '01',
              dateEvaluation: '2026-03-01T12:00:00.000Z', retroactionFinale: 'Rétroaction.', criteres: [{ critereId: 'c1', critereNom: 'Structure', niveauSelectionne: 'M', ponderation: 100 }] }
        ]);
        try {
            window.afficherProfilComplet('TEST732');
            window.changerSectionProfil('rapport');   // ce que le clic sur « Rapport » dans la barre latérale appelle
        } catch (e) {
            return { erreur: 'rendu planté : ' + e.message };
        }
        // Ce que le profil AFFICHE comme P : la même source que la Liste et le Suivi du groupe.
        if (typeof window.calculerEtStockerIndicesCP === 'function') window.calculerEtStockerIndicesCP();
        return { P: window.calculerTousLesIndices('TEST732').P };
    });
    expect(montage.erreur, `Erreur de montage : ${montage.erreur}`).toBeUndefined();

    // Le rapport s'écrit au rendu de la section (post-rendu T+100 ms → restaurerPreferencesRapport → genererEtAfficherRapport).
    // On attend la zone de texte REMPLIE, pas une durée — et on la LIT DANS LA MÊME ÉVALUATION. Ouvrir un profil le rend
    // trois fois (#754) : afficherProfilComplet → afficherSousSection('suivi-profil') → auto-chargement de navigation.js à
    // T+100 ms, puis le MutationObserver de profil-etudiant-sections-affichage.js à T+100 ms ; chaque rendu remplace la zone
    // de texte par une vide, que son propre T+100 remplit à nouveau. Mesuré : vide 7 ms → remplie 108 ms → vide 212 ms →
    // remplie 317 ms. Sur le runner GitHub (run 34001941420, 1.123.0), une lecture séparée de l'attente tombait dans la
    // fenêtre vide — « Received string: "" » aux deux essais — alors que l'instantané de la trace portait le rapport complet.
    const rapport = await (await page.waitForFunction(() => {
        const t = document.getElementById('textarea-rapport-TEST732');
        return (t && t.value && t.value.length > 0) ? t.value : null;
    }, null, { timeout: 10000 })).jsonValue();

    // AVANT le correctif : « Erreur lors de la génération du rapport :\n\nobtenirDetailsAssiduite is not defined ».
    expect(rapport, rapport).not.toMatch(/Erreur lors de la génération du rapport/);
    expect(rapport).toMatch(/^Camille Roy \(DA: TEST732\)/);
    expect(montage.P).toBe(70);
    expect(rapport, rapport).toContain(`Performance : ${montage.P}\u00A0%`);
    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});
