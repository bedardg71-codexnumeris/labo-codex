import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

// 21 nov. 2026 — LA PRATIQUE « PAR STANDARDS », LOTS 3 ET 4 : LE NIVEAU RETENU, PUIS LA NOTE, dans l'application réelle
// (rapport : `plans de travail/RAPPORT-2026-11-21-moteur-cibles-3-4.md`). L'unitaire (sentinelle-par-standards-lots-3-4)
// juge les règles une à une ; ici, les écrans et les lecteurs de la note : le tableau des cibles (la case retenue, la
// colonne de la note, l'historique), le profil (section « Cibles »), la liste des étudiant·es, l'export des résultats
// finaux, la fiche de la pratique (le double seuil), l'arrêt des notes. Une note absente ne s'affiche « 0 » nulle part.
// Noms fictifs. Jugé sous Chromium dans le conteneur (playwright.chromium.config.js) ; Safari reste dû au Mac.

const T = 'a2026';
const GC = 'GC_CIB34';
const ZOE = '2100001';
const YAN = '2100002';
const LEA = '2100003';

const CINQ = [['0', 'Données insuffisantes', 0, 'var(--gris-moyen)'], ['1', 'En apprentissage', 25, 'var(--niveau-attention-critique)'],
    ['2', 'Ça y est presque', 50, 'var(--niveau-attention-modere)'], ['3', 'Acquis', 75, 'var(--niveau-attention-minimal)'], ['4', 'Avancé', 100, 'var(--niveau-attention-nul)']]
    .map(([code, nom, v, couleur], i) => ({ code, nom, valeurCalcul: v, min: i * 20, max: i * 20 + 19, couleur }));

/** Zoé : 4 puis 2 (Analyser), 3 (Structurer), 1 (Dissertation, terminale) ; Yan : 3 et une remarque ; Léa : rien, mais une évaluation à 95. */
function inscriptionsDuBanc() {
    const I = (id, da, cibleId, niveau, date, extra) => Object.assign({ id, type: 'inscription', da, ensembleId: 'ENSC_CIB34', cibleId, niveau,
        echelleId: niveau === null ? null : 'ECH_CIB34', date, horodatage: date + 'T12:00:00.000Z', productionId: null, noteBreve: niveau === null ? 'À l’oral, ça vient.' : '', criteres: [] }, extra || {});
    return [I('a1', ZOE, 'cible_a', '4', '2026-10-01', { productionId: 'P1', noteBreve: 'Très bonne analyse.' }), I('a2', ZOE, 'cible_a', '2', '2026-11-10'),
        I('a3', ZOE, 'cible_b', '3', '2026-10-05'), I('a4', ZOE, 'cible_c', '1', '2026-11-01'),
        I('b1', YAN, 'cible_a', '3', '2026-10-01'), I('b2', YAN, 'cible_b', null, '2026-10-03')];
}

async function installer(page, { configuration = {}, terminale = true, inscriptions = inscriptionsDuBanc() } = {}) {
    await page.goto(indexHtml);
    await page.waitForFunction(() => window.dbReady === true && window.TableauCibles && window.NoteCibles && window.ProfilCibles, null, { timeout: 20000 });
    await page.evaluate(({ T, GC, ZOE, YAN, LEA, niveaux, configuration, terminale, inscriptions }) => {
        // security-ok: fixtures littérales du banc, aucune source externe.
        const coursId = 'cours-cib34';
        const echelle = { id: 'ECH_CIB34', nom: 'Échelle fictive', niveaux };
        const ensemble = { id: 'ENSC_CIB34', coursId, cibles: [
            { id: 'cible_a', etiquette: 'Analyser', enonce: 'Analyser un texte littéraire.', poids: 1, terminale: false, criteres: [{ id: 'k1', texte: 'Relève trois procédés', essentiel: true }] },
            { id: 'cible_b', etiquette: 'Structurer', enonce: 'Organiser un propos.', poids: 1, terminale: false, criteres: [] },
            { id: 'cible_c', etiquette: 'Dissertation', enonce: 'Rédiger une dissertation.', poids: 2, terminale, criteres: [] }] };
        window.db.setSync('trimestres', [{ id: T, nom: 'Trimestre fictif', annee: 2026, session: 'A', actif: true }]);
        window.db.setSync('cours', [{ id: coursId, codeCours: 'FRA101', titre: 'Cours fictif' }]);
        window.db.setSync(T + '_groupesCours', [{ id: GC, trimestreId: T, coursId, groupeNum: '01', pratiqueId: 'cib-34', actif: true }]);
        window.db.setSync(T + '_groupeEtudiants', [
            { da: ZOE, nom: 'Fictive', prenom: 'Zoé', groupe: '01', coursId, groupeCoursId: GC },
            { da: YAN, nom: 'Inventé', prenom: 'Yan', groupe: '01', coursId, groupeCoursId: GC },
            { da: LEA, nom: 'Imaginaire', prenom: 'Léa', groupe: '01', coursId, groupeCoursId: GC }]);
        window.db.setSync(T + '_echellesTemplates', [echelle]);
        window.db.setSync(T + '_ensemblesCibles', [ensemble]);
        window.db.setSync(T + '_pratiquesConfigurables', [{ id: 'cib-34', nom: 'Par standards fictive', type: 'cibles', calcul_note: { methode: 'niveaux_par_cible' },
            dansBibliotheque: true, configuration: Object.assign({ type: 'cibles', ensembleCiblesId: ensemble.id, echelleId: echelle.id, niveauSansDonnee: '0' }, configuration) }]);
        window.db.setSync(T + '_productions', [{ id: 'P1', titre: 'Analyse 1', type: 'travail', numero: 1, groupeCoursId: GC, ponderation: 10, dateEcheance: '2026-10-01' }]);
        // Une évaluation saisie « par habitude » : la note par cibles ne la lit pas (Léa n'a aucune inscription).
        window.db.setSync(T + '_evaluationsSauvegardees', [{ id: 'EV1', etudiantDA: LEA, productionId: 'P1', noteFinale: 95, niveauFinal: '4', verrouillee: true, statutRemise: 'remis', dateEvaluation: '2026-10-02' }]);
        window.db.setSync(T + '_inscriptionsCibles', inscriptions);
        window.trimestreActif = T;
        window.db.setSync('trimestreActif', T);
        window.db.setSync('infoCours', { id: coursId, codeCours: 'FRA101', groupe: '01', _groupeCoursId: GC });
        window.db.setSync('groupeCoursActif', { id: GC, trimestreId: T });
    }, { T, GC, ZOE, YAN, LEA, niveaux: CINQ, configuration, terminale, inscriptions });
}

async function ouvrirTableau(page) {
    await page.evaluate(() => { window.afficherSection('evaluations'); window.afficherSousSection('evaluations-liste'); window.TableauNotation.afficher(); });
    await expect(page.locator('.tc-tableau')).toBeVisible();
}
/** « 0 % » comme nombre entier, pas la fin de « 100 % » ni de « 50 % ». */
const ZERO_POURCENT = /(^|[^\d,])0\s%/;
const rangee = (page, nom) => page.locator('.tc-tableau tbody tr', { has: page.locator('.tn-eleve', { hasText: nom }) });

test('le tableau : la case montre le niveau retenu, « Données insuffisantes » sans donnée, et la colonne de la note (plafonnée, en attente)', async ({ page }) => {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    await installer(page, { configuration: { doubleSeuil: { actif: true, seuil: 60, plafond: 55 } } });
    await ouvrirTableau(page);
    await expect(page.locator('.tc-col-note')).toHaveText('Note');
    const zoe = rangee(page, 'Zoé Fictive');
    await expect(zoe.locator('.tc-case[data-cible="cible_a"] .tc-case-niveau')).toHaveText('4');   // pas 2, le dernier inscrit
    await expect(zoe.locator('.tc-case[data-cible="cible_a"] .tc-case-compte')).toHaveText('2');
    // (100 + 75 + 2 × 25) ÷ 4 = 56,25 ; la terminale à 25 est sous 60 : plafonnée à 55.
    await expect(zoe.locator('.tc-cellule-note')).toHaveText('55 %plafonnée');
    const lea = rangee(page, 'Léa Imaginaire');
    await expect(lea.locator('.tc-case')).toHaveText(['Données insuffisantes', 'Données insuffisantes', 'Données insuffisantes']);
    await expect(lea.locator('.tc-cellule-note')).toHaveText('En attenteAnalyser, Structurer, Dissertation');   // l'évaluation à 95 n'est pas lue
    await expect(rangee(page, 'Yan Inventé').locator('.tc-cellule-note')).toHaveText('En attenteStructurer, Dissertation');
    await expect(page.locator('.tc-legende').first()).toHaveText('Une case montre le niveau retenu : le meilleur niveau inscrit, qui ne redescend pas. Le petit nombre dit combien d’inscriptions elle porte.');
    // La cible tactile d'une case sans donnée : 44 px au moins, dans les deux sens.
    const boite = await lea.locator('.tc-case').first().boundingBox();
    expect(boite.width).toBeGreaterThanOrEqual(44);
    expect(boite.height).toBeGreaterThanOrEqual(44);
    expect(erreurs).toEqual([]);
});

test('la fenêtre d\'une case : le niveau retenu en clair, et le dernier niveau plus bas dit dans le texte', async ({ page }) => {
    await installer(page);
    await ouvrirTableau(page);
    await rangee(page, 'Zoé Fictive').locator('.tc-case[data-cible="cible_a"]').click();
    const f = page.locator('.tc-fenetre');
    await expect(f.locator('.tc-retenu .tc-retenu-ligne').first()).toHaveText('Niveau retenu : 4 · Avancé, inscrit le 1 octobre 2026.');
    await expect(f.locator('.tc-retenu-plus-bas')).toHaveText('Le dernier niveau inscrit, 2 · Ça y est presque (le 10 novembre 2026), est plus bas : le niveau retenu ne redescend pas.');
    await expect(f.locator('.tc-entree-retenu')).toHaveCount(1);
});

test('le profil, section « Cibles » : la note et son récit, puis chaque cible et ses inscriptions ; « Pas encore de note » sans chiffre', async ({ page }) => {
    await installer(page);
    await page.evaluate((da) => { window.afficherSection('suivi'); window.afficherProfilComplet(da); }, ZOE);
    await page.locator('[data-action="changerSectionProfil"][data-param="cibles"]').click();
    await expect(page.locator('.pc-note-valeur')).toHaveText('Note actuelle 56,3 %');
    await expect(page.locator('.pc-moyenne')).toHaveText('Moyenne pondérée des niveaux retenus : 56,3 %.');
    await expect(page.locator('.pc-recit tbody tr')).toHaveCount(3);
    await expect(page.locator('.pc-seuil')).toHaveCount(0);   // le double seuil est éteint d'office
    await expect(page.locator('.pc-cible').first().locator('.tc-retenu')).toContainText('Production : Analyse 1');
    await expect(page.locator('.pc-cible').first().locator('.tc-retenu')).toContainText('Rétroaction : Très bonne analyse.');
    await expect(page.locator('.pc-cible [data-tc="annuler"]')).toHaveCount(0);
    await page.evaluate((da) => window.afficherProfilComplet(da), LEA);
    await page.locator('[data-action="changerSectionProfil"][data-param="cibles"]').click();
    await expect(page.locator('.pc-note-valeur')).toHaveText('Pas encore de note.');
    await expect(page.locator('.pc-attente-liste li')).toHaveCount(3);
    await expect(page.locator('.pc-recit')).not.toContainText(ZERO_POURCENT);   // (l'aide, elle, dit la règle : « 0 % à l'arrêt des notes »)
});

test('les lecteurs : la liste écrit « — » (jamais « 0 % »), l\'export dit « non constructible » et sa cause', async ({ page }) => {
    await installer(page);
    const r = await page.evaluate(({ T }) => {
        window.calculerEtStockerIndicesCP();
        const etus = window.db.getSync(T + '_groupeEtudiants');
        const csv = window._exportResultats.genererCSVSynthese(etus, { groupe: '01', cours: 'FRA101', trimestre: 'A2026', pratiqueId: 'cib-34', pratiqueCode: 'STD',
            pratiqueNom: 'Par standards fictive', notesFinales: false }, window.simulerIndices);
        return { csv, icp: window.db.getSync(T + '_indicesCP') };
    }, { T });
    expect(r.icp[ZOE].actuel).toMatchObject({ P: 56, noteConstructible: true });
    expect(r.icp[LEA].actuel).toMatchObject({ noteConstructible: false });
    const lignes = r.csv.split('\r\n');
    expect(lignes.find(l => l.startsWith(ZOE))).toContain(',56,provisoire,');
    expect(lignes.find(l => l.startsWith(LEA))).toContain(',,"non constructible – Pas encore de note : les cibles « Analyser », « Structurer », « Dissertation » sont sans donnée.');
    await page.evaluate(() => { window.afficherSection('suivi'); window.afficherSousSection('suivi-liste'); });
    const lea = page.locator('#tbody-suivi-liste tr', { hasText: 'Imaginaire' });
    await expect(lea).toBeVisible();
    await expect(lea).not.toContainText(ZERO_POURCENT);   // Léa a une copie (C à 100 %) et aucune note : P se lit « — »
    await expect(page.locator('#tbody-suivi-liste tr', { hasText: 'Fictive' })).toContainText('56 %');
    await expect(page.locator('#moy-p')).toHaveText('moy=56 %');   // Léa n'entre pas dans la moyenne
});

test('l\'arrêt des notes : « Notes finalisées » cochée, une cible sans donnée compte pour 0 % ; l\'export dit « final »', async ({ page }) => {
    await installer(page, { configuration: { notesFinales: true } });
    await ouvrirTableau(page);
    await expect(rangee(page, 'Léa Imaginaire').locator('.tc-cellule-note')).toHaveText('0 %');   // un vrai 0 : décidé à l'arrêt
    await expect(rangee(page, 'Yan Inventé').locator('.tc-cellule-note')).toHaveText('19 %');     // 75 ÷ 4 = 18,75
    await expect(page.locator('.tc-legende', { hasText: 'Notes finalisées' })).toBeVisible();
    const csv = await page.evaluate(({ T }) => window._exportResultats.genererCSVSynthese(window.db.getSync(T + '_groupeEtudiants'),
        { groupe: '01', cours: 'FRA101', trimestre: 'A2026', pratiqueId: 'cib-34', pratiqueCode: 'STD', pratiqueNom: 'Par standards fictive', notesFinales: true }, window.simulerIndices), { T });
    expect(csv).toContain(LEA + ',Imaginaire,Léa,01,FRA101,A2026,STD,Par standards fictive,0,final,');
});

test('la fiche de la pratique : le double seuil, éteint au départ ; allumé, son seuil et son plafond ; sans cible terminale, il ne s\'allume pas et l\'écran dit pourquoi', async ({ page }) => {
    await installer(page);
    await page.evaluate(() => window.ouvrirReglagesPratique('cib-34'));
    const caseDS = page.locator('#mat-cibles-double-seuil');
    await expect(caseDS).toBeVisible();
    await expect(caseDS).not.toBeChecked();
    await expect(caseDS).toBeEnabled();
    await expect(page.locator('#mat-cibles-double-seuil-motif')).toBeHidden();
    await expect(page.locator('#mat-cibles-seuils')).toBeHidden();
    await caseDS.check();
    await expect(page.locator('#mat-cibles-seuils')).toBeVisible();
    await expect(page.locator('#mat-cibles-seuil')).toHaveValue('60');
    await expect(page.locator('#mat-cibles-plafond')).toHaveValue('55');
    await expect.poll(() => page.evaluate(({ T }) => window.db.getSync(T + '_pratiquesConfigurables')[0].configuration.doubleSeuil, { T }))
        .toEqual({ actif: true, seuil: 60, plafond: 55 });
    // La même pratique, sans cible terminale.
    await installer(page, { terminale: false });
    await page.evaluate(() => window.ouvrirReglagesPratique('cib-34'));
    await expect(page.locator('#mat-cibles-double-seuil')).toBeDisabled();
    await expect(page.locator('#mat-cibles-double-seuil-motif')).toHaveText('Aucune cible n\'est terminale : le double seuil ne peut pas s\'allumer. Marque au moins une cible « Cible terminale » dans l\'assistant.');
});
