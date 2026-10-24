import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// PORTE #761 — DANS LE PROFIL, LA VIGNETTE D'UN TRAVAIL MÈNE À LA VISIONNEUSE, PAS À UNE PAGE VIDE.
//
// Rapport de bug de Grégoire, 6 septembre 2026, 7 h 32 (1.123.0, Chrome, Mac) : « J'ai cliqué sur le
// travail d'un élève pour le consulter et on me mène à une page vide. » Section active au moment du
// rapport : suivi > suivi-profil ; gestes : « Travaux soumis » dans la barre latérale du profil, puis
// clic sur l'image d'un travail.
//
// CE QUI SE PASSAIT. La vignette porte `data-action="travauxUI.ouvrirFichier"`. Depuis la refonte de la
// sous-navigation d'Évaluations (e24f0960, 18 février 2026), `ouvrirFichier` n'appelle que
// `afficherSousSection('evaluations-annoter')` — et `afficherSousSection` (navigation.js) ne bascule
// JAMAIS la section parente : elle retire « active » à toutes les sous-sections (dont `#suivi-profil`)
// et l'ajoute à `#evaluations-annoter`, qui vit dans une section cachée. La section Suivi reste
// affichée, sans aucune sous-section active : une page vide. Les trois autres entrées hors section
// (liste des évaluations ×2, « Annoter et évaluer » du profil) faisaient elles-mêmes
// `afficherSection('evaluations')` puis attendaient l'initialisation du module (200 à 500 ms) avant
// d'ouvrir ; la vignette, non.
//
// POURQUOI AU NAVIGATEUR. C'est un état du DOM (quelle section porte « active », et si une sous-section
// active y vit) et une course de minuteries (l'initialisation du module à +100 ms) : un banc Vitest
// ne les voit pas. Cette spec doit être ROUGE avant le correctif (Évaluations n'est jamais active)
// et VERTE après (Évaluations › Annoter active, la copie marquée « en cours » dans la barre).
//
// Aucun `page.click` ni `waitForTimeout` (règle du 4 septembre, §4.1 bis) : la vignette est cliquée par
// `el.click()` — le vrai dispatcher `data-action` de main.js —, et on attend des RENDUS.

const patternsAttendus = [
    /version\.json.*access control/i,
    /Cross origin requests are only supported/i,
    /Not allowed to load local resource.*\.(svg|png)/i,
    // La copie de banc n'a pas de fichier binaire : la visionneuse le dit et s'arrête. Ce n'est pas
    // l'objet de cette porte, qui juge l'ARRIVÉE dans la visionneuse, pas le rendu de la copie.
    /\[Travaux-Visionneuse\] Blob introuvable/
];

test('Porte #761 · la vignette d\'un travail, dans le profil, mène à Évaluations › Annoter et évaluer', async ({ page }) => {
    const erreurs = [];
    const estAttendue = (m) => patternsAttendus.some((re) => re.test(m));
    page.on('pageerror', (e) => { const m = `pageerror: ${e.message}`; if (!estAttendue(m)) erreurs.push(m); });
    page.on('console', (msg) => {
        if (msg.type() === 'error') { const m = `console.error: ${msg.text()}`; if (!estAttendue(m)) erreurs.push(m); }
    });
    page.on('dialog', (d) => d.dismiss().catch(() => {}));

    await page.goto(indexHtml);
    await page.waitForFunction(() => typeof window.afficherProfilComplet === 'function' && typeof window.changerSectionProfil === 'function'
        && window.travauxUI && typeof window.travauxUI.ouvrirFichier === 'function' && typeof window.db !== 'undefined');

    const montage = await page.evaluate(() => {
        const trimestreId = 'test761';
        window.db.setSync('trimestres', [{ id: trimestreId, nom: 'Trimestre test', actif: true }]);
        window.db.setSync('trimestreActif', trimestreId);
        const coursId = 'cours-761';
        window.db.setSync('infoCours', { id: coursId, codeCours: 'FRA101', groupe: '01', _groupeCoursId: 'GC_761' }); // security-ok: fixture de test, littéral du fichier
        window.db.setSync('groupeCoursActif', { id: 'GC_761', trimestreId });
        window.db.setSync(trimestreId + '_groupesCours', [{ id: 'GC_761', trimestreId, coursId, groupeNum: '01', pratiqueId: 'sommative', actif: true }]);
        window.db.setSync(window.cle('groupeEtudiants'), [{ da: 'TEST761', nom: 'Roy', prenom: 'Camille', groupe: '01', coursId }]); // security-ok: fixture de test
        window.db.setSync(window.cle('productions'), [{ id: 'p761-1', titre: 'Analyse 1', type: 'travail', ponderation: 50, dateEcheance: '2026-02-01' }]); // security-ok: fixture de test
        // Un travail importé pour cet élève (les métadonnées seules : la porte juge l'arrivée, pas le rendu).
        window.db.setSync(window.cle('fichiersTravaux'), [{ // security-ok: fixture de test
            id: 'FT761', etudiantDA: 'TEST761', productionId: 'p761-1', coursId, groupeCoursId: 'GC_761',
            nomFichier: 'ROY_TEST761_Analyse1.pdf', typeMIME: 'application/pdf', tailleFichier: 1234, nombrePages: 1,
            stockage: 'indexeddb', thumbnailDataUrl: '', dateImport: '2026-02-01T12:00:00.000Z', dateModification: '2026-02-01T12:00:00.000Z',
            source: 'import-local', importePar: 'single', statut: 'present'
        }]);
        // Ouvrir un profil le rend UNE fois depuis #754 (lot 4 du cadrage 11 ; trois avant) : on compte les
        // rendus pour cliquer APRÈS, comme l'enseignant qui regarde la page avant d'y toucher.
        window.__rendus761 = 0;
        const original = window.afficherProfilComplet;
        window.afficherProfilComplet = function () { window.__rendus761 += 1; return original.apply(this, arguments); };
        try {
            // L'enseignant est dans l'onglet Suivi (le rapport le dit : section active suivi > suivi-profil).
            // Ouvrir un profil n'active que la SOUS-section : la section, c'est l'onglet qui la donne.
            window.afficherSection('suivi');
            window.afficherProfilComplet('TEST761');
        } catch (e) {
            return { erreur: 'rendu planté : ' + e.message };
        }
        return { ok: true };
    });
    expect(montage.erreur, `Erreur de montage : ${montage.erreur}`).toBeUndefined();

    // Le rendu du profil passé (un seul, #754), la section « Travaux soumis » est demandée (le clic de la
    // barre latérale), et sa vignette attendue.
    await page.waitForFunction(() => window.__rendus761 >= 1 && !window._profilAutoChargement && !!document.querySelector('#contenuProfilEtudiant .rangee-selection-profil'), null, { timeout: 10000 });
    await page.evaluate(() => window.changerSectionProfil('travaux'));
    await page.waitForFunction(() => !!document.querySelector('#suivi-profil .travaux-grille-item[data-action="travauxUI.ouvrirFichier"][data-param="FT761"]'), null, { timeout: 10000 });

    // Le point de départ, tel que le rapport le dit : Suivi › Profil.
    const depart = await page.evaluate(() => ({
        section: (document.querySelector('.section.active') || {}).id || null,
        sousSection: (document.querySelector('.sous-section.active') || {}).id || null
    }));
    expect(depart).toEqual({ section: 'section-suivi', sousSection: 'suivi-profil' });

    // Le geste de l'enseignant : le clic sur la vignette (dispatcher `data-action` réel).
    await page.evaluate(() => { document.querySelector('#suivi-profil .travaux-grille-item[data-param="FT761"]').click(); });

    // AVANT le correctif : `#section-suivi` reste active sans aucune sous-section active — la page vide ;
    // `#section-evaluations` ne devient jamais active, et cette attente expire.
    const arrivee = await (await page.waitForFunction(() => {
        const section = document.querySelector('.section.active');
        const sousSection = document.querySelector('.sous-section.active');
        if (!section || !sousSection) return null;
        if (section.id !== 'section-evaluations' || sousSection.id !== 'evaluations-annoter') return null;
        return { section: section.id, sousSection: sousSection.id, sousSectionDansLaSection: section.contains(sousSection) };
    }, null, { timeout: 10000 })).jsonValue();
    expect(arrivee).toEqual({ section: 'section-evaluations', sousSection: 'evaluations-annoter', sousSectionDansLaSection: true });

    // Puis la copie s'ouvre APRÈS l'initialisation du module (pas en course avec elle) : la barre des
    // copies la marque « en cours ». C'est `ouvrirFichier` lui-même qui pose ce marqueur, après son arrivée.
    await page.waitForFunction(() => !!document.querySelector('.annot-badge[data-fichier-id="FT761"].actif'), null, { timeout: 10000 });

    // Et rien ne ramène au profil ni ne laisse une section sans sous-section : l'état tient après les
    // minuteries (initialisation à +100 ms, ouverture différée à +500 ms, rendus du profil).
    const etatFinal = await page.evaluate(() => new Promise((resolve) => setTimeout(() => resolve({
        sections: Array.from(document.querySelectorAll('.section.active')).map(s => s.id),
        sousSection: (document.querySelector('.section.active .sous-section.active') || {}).id || null,
        badgeEnCours: !!document.querySelector('.annot-badge[data-fichier-id="FT761"].actif')
    }), 900)));
    expect(etatFinal).toEqual({ sections: ['section-evaluations'], sousSection: 'evaluations-annoter', badgeEnCours: true });
    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});
