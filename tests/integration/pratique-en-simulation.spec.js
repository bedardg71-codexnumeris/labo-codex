import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

// 23 nov. 2026 — UNE PRATIQUE « PAR STANDARDS » EN SIMULATION, À CÔTÉ DE LA PRATIQUE OFFICIELLE D'UN GROUPE, dans
// l'application réelle (plan : `plans de travail/PLAN-2026-11-23-pratique-en-simulation.md`). L'unitaire
// (sentinelle-pratique-en-simulation) juge la lecture du lien, les gardes et la fusion ; ici, les gestes de bout en bout :
// poser la simulation dans la fiche du groupe-cours, l'ouvrir depuis le tableau de notation, inscrire, annuler, observer,
// la retirer, la reposer. Et LA PREUVE : avec une simulation posée et des niveaux inscrits, tout ce que la pratique
// officielle produit est identique, octet pour octet, à ce qu'il était avant.
// Le groupe du banc a pour pratique officielle une « Par sélection de productions ». Noms fictifs.
// Jugé sous Chromium dans le conteneur (playwright.chromium.config.js) ; Safari et l'iPad restent dus au Mac.
//
// BREAK-TESTS (23 nov. 2026), sur « LA PREUVE » :
//   1. `SimulationPratique.ouvrir` bascule `groupesCours[].pratiqueId` sur la pratique simulée (la fuite n° 1 du rapport de
//      mesure) : rouge dès le bandeau (la pratique officielle n'est plus « Sélection fictive »).
//   2. `_inscrireCase` change la note d'une évaluation en passant : rouge à `expect(apres).toBe(avant)`.
//   L'instantané comparé porte de vraies valeurs (mesuré : notes 88 et 38, une note non constructible, les niveaux de
//   dépistage 1 et 2, le CSV, un document PDF de 306 Ko).

const T = 'a2026';
const GC = 'GC_SIM';
const ZOE = '2300001';
const YAN = '2300002';
const LEA = '2300003';

const CINQ = [['0', 'Données insuffisantes', 0, 'var(--gris-moyen)'], ['1', 'En apprentissage', 25, 'var(--niveau-attention-critique)'],
    ['2', 'Ça y est presque', 50, 'var(--niveau-attention-modere)'], ['3', 'Acquis', 75, 'var(--niveau-attention-minimal)'], ['4', 'Avancé', 100, 'var(--niveau-attention-nul)']]
    .map(([code, nom, v, couleur], i) => ({ code, nom, valeurCalcul: v, min: i * 20, max: i * 20 + 19, couleur }));

async function installer(page, { simulation = null, pratiqueOfficielle = 'sel-sim' } = {}) {
    await page.goto(indexHtml);
    await page.waitForFunction(() => window.dbReady === true && window.TableauCibles && window.SimulationPratique && window.ObservationCibles, null, { timeout: 20000 });
    await page.evaluate(({ T, GC, ZOE, YAN, LEA, niveaux, simulation, pratiqueOfficielle }) => {
        // security-ok: fixtures littérales du banc, aucune source externe.
        const coursId = 'cours-sim';
        const G = '00001';   // la fiche du groupe-cours offre les numéros de groupe sur cinq chiffres
        if (window.backupReminder) window.backupReminder.desactiverRappels();   // le rappel de sauvegarde couvrirait les fenêtres du banc
        const echelle = { id: 'ECH_SIM', nom: 'Échelle fictive', niveaux };
        const ensemble = (id, noms) => ({ id, coursId, cibles: noms.map((n, i) => ({ id: id + '_c' + i, etiquette: n, enonce: n + ' : énoncé fictif.', poids: 1, terminale: false,
            criteres: i === 0 ? [{ id: id + '_k1', texte: 'Relève trois procédés', essentiel: true }] : [] })) });
        const parStandards = (id, nom, ensembleId) => ({ id, nom, type: 'cibles', calcul_note: { methode: 'niveaux_par_cible' }, dansBibliotheque: true,
            configuration: { type: 'cibles', ensembleCiblesId: ensembleId, echelleId: echelle.id, niveauSansDonnee: '0' } });
        window.db.setSync('trimestres', [{ id: T, nom: 'Trimestre fictif', annee: 2026, session: 'A', actif: true }]);
        window.db.setSync('cours', [{ id: coursId, codeCours: 'FRA101', titre: 'Cours fictif', nomCours: 'Cours fictif' }]);
        window.db.setSync('enseignants', [{ id: 'ENS_SIM', prenom: 'Camille', nom: 'Fictive' }]);
        window.db.setSync(T + '_groupesCours', [Object.assign({ id: GC, nom: 'Groupe fictif', trimestreId: T, coursId, groupeNum: G, horaireId: 'HOR_SIM', enseignantId: 'ENS_SIM',
            pratiqueId: pratiqueOfficielle, actif: true }, simulation ? { simulationPratiqueId: simulation } : {})]);
        window.db.setSync(T + '_horaires', [{ id: 'HOR_SIM', nom: 'Horaire fictif', coursId, groupeAssocie: G, seances: [] }]);
        window.db.setSync(T + '_groupeEtudiants', [
            { da: ZOE, nom: 'Fictive', prenom: 'Zoé', groupe: G, coursId, groupeCoursId: GC },
            { da: YAN, nom: 'Inventé', prenom: 'Yan', groupe: G, coursId, groupeCoursId: GC },
            { da: LEA, nom: 'Imaginaire', prenom: 'Léa', groupe: G, coursId, groupeCoursId: GC }]);
        window.db.setSync(T + '_echellesTemplates', [echelle]);
        window.db.setSync(T + '_ensemblesCibles', [ensemble('ENSC_SIM', ['Analyser', 'Structurer']), ensemble('ENSC_OFF', ['Lire', 'Rédiger'])]);
        window.db.setSync(T + '_pratiquesConfigurables', [
            { id: 'sel-sim', nom: 'Sélection fictive', type: 'standards', dansBibliotheque: true, calcul_note: { methode: 'conversion_niveaux' }, echelle: { echelle_id: echelle.id, echelle_nom: echelle.nom, niveaux },
                configuration: { type: 'standards', echelleId: echelle.id, portfolio: { nombreARetenir: 2, minimumCompletion: 1, methodeSelection: 'meilleurs' } } },
            parStandards('cib-sim', 'Standards à simuler', 'ENSC_SIM'),
            parStandards('cib-off', 'Standards officiels', 'ENSC_OFF'),
            parStandards('cib-jumelle', 'Standards jumeaux', 'ENSC_OFF')]);
        const P = (id, numero, type) => ({ id, titre: 'Production ' + numero, type, numero, groupeCoursId: GC, ponderation: 10, dateEcheance: '2026-10-0' + numero, echelleId: echelle.id });
        window.db.setSync(T + '_productions', [P('P1', 1, 'artefact-portfolio'), P('P2', 2, 'artefact-portfolio'), P('P3', 3, 'artefact-portfolio')]);
        const E = (id, da, productionId, note, niveau) => ({ id, etudiantDA: da, productionId, noteFinale: note, niveauFinal: niveau, verrouillee: true, statutRemise: 'remis',
            dateEvaluation: '2026-10-10', echelleId: echelle.id, groupeCoursId: GC, coursId });
        window.db.setSync(T + '_evaluationsSauvegardees', [E('EV1', ZOE, 'P1', 75, '3'), E('EV2', ZOE, 'P2', 100, '4'), E('EV3', ZOE, 'P3', 50, '2'),
            E('EV4', YAN, 'P1', 50, '2'), E('EV5', YAN, 'P2', 25, '1')]);
        window.db.setSync(T + '_inscriptionsCibles', []);
        window.trimestreActif = T;
        window.db.setSync('trimestreActif', T);
        window.db.setSync('infoCours', { id: coursId, codeCours: 'FRA101', groupe: G, _groupeCoursId: GC });
        window.db.setSync('groupeCoursActif', { id: GC, trimestreId: T });
        if (window.invaliderCachePratique) window.invaliderCachePratique();
    }, { T, GC, ZOE, YAN, LEA, niveaux: CINQ, simulation, pratiqueOfficielle });
}

async function ouvrirTableau(page) {
    await page.evaluate(() => { window.afficherSection('evaluations'); window.afficherSousSection('evaluations-liste'); window.TableauNotation.afficher(); });
    await expect(page.locator('#tableau-notation-hote .tn-titre')).toBeVisible();
}

/**
 * Tout ce que la pratique OFFICIELLE produit pour le groupe, en un texte : la désignation, la note et sa décomposition
 * (`simulerIndices` sur la pratique désignée, la source de l'export), les indices C et P recalculés et rangés, le
 * dépistage (indices et niveau de RàI), le CSV des résultats, les notes du tableau officiel, et la note que porte le PDF
 * d'une copie. Les horodatages du recalcul sont retirés : ils changent d'un appel à l'autre, simulation ou non.
 */
async function instantaneOfficiel(page) {
    return page.evaluate(async ({ T, ZOE }) => {
        const sansHorloge = (x) => JSON.parse(JSON.stringify(x, (k, v) => (/^(date|dateCalcul|horodatage|timestamp|derniereMiseAJour)$/.test(k) ? undefined : v)));
        window.calculerEtStockerIndicesCP();
        const etudiants = window.obtenirEtudiantsCoursActif();
        const idActif = window.obtenirIdPratiqueActive();
        const designation = window.designerPratiqueActive();
        const pdf = await window.travauxExportPDF.genererDocSyntheseSeule(ZOE, 'P1');
        return JSON.stringify({
            designation: { etat: designation.etat, id: designation.id, idBrut: designation.idBrut, famille: designation.famille },
            notes: etudiants.map(e => sansHorloge(window.simulerIndices(e.da, idActif))),
            indicesCP: sansHorloge(window.db.getSync(T + '_indicesCP')),
            depistage: etudiants.map(e => [sansHorloge(window.calculerTousLesIndices(e.da)), window.determinerNiveauRaiPedagogique(e.da)]),
            csv: window._exportResultats.genererCSVSynthese(etudiants, { groupe: '00001', cours: 'FRA101', trimestre: 'A2026', pratiqueId: idActif, pratiqueCode: 'SEL',
                pratiqueNom: 'Sélection fictive', notesFinales: false }, window.simulerIndices),
            tableau: window.TableauNotation.notesDuGroupe(),
            pdf: pdf ? { type: typeof pdf, texte: JSON.stringify(pdf, (k, v) => (typeof v === 'function' ? undefined : v)).replace(/"(CreationDate|ModDate|creationDate|id|fileId)":"[^"]*"/g, '') } : null,
            evaluations: window.db.getSync(T + '_evaluationsSauvegardees'),
            productions: window.db.getSync(T + '_productions'),
            groupeCoursActif: window.db.getSync('groupeCoursActif'),
            infoCours: window.db.getSync('infoCours')
        });
    }, { T, ZOE });
}

/** La fiche du groupe-cours du banc, ouverte ; puis le champ « Simulation » posé sur une valeur (la fiche s'enregistre au changement). */
async function poserDansLaFiche(page, valeur) {
    await page.evaluate(({ GC, valeur }) => {
        window.chargerGroupeCoursV2();
        const menu = document.getElementById('v2-selectGroupeCours');
        menu.value = GC;
        menu.dispatchEvent(new Event('change', { bubbles: true }));
        const champ = document.getElementById('v2-gc-simulation');
        champ.value = valeur;
        champ.dispatchEvent(new Event('change', { bubbles: true }));
    }, { GC, valeur });
}
const groupeRange = (page) => page.evaluate(({ T }) => window.db.getSync(T + '_groupesCours')[0], { T });
const sim = (page) => page.locator('#tableau-simulation-hote');
const rangee = (page, nom) => sim(page).locator('.tc-tableau tbody tr', { has: page.locator('.tn-eleve', { hasText: nom }) });

async function ouvrirSimulation(page) {
    await ouvrirTableau(page);
    await page.locator('#tableau-simulation-entree [data-sim="ouvrir"]').click();
    await expect(sim(page).locator('.tc-tableau')).toBeVisible();
}

async function inscrire(page, nom, cible, code, texte) {
    await rangee(page, nom).locator(`.tc-case[data-cible="${cible}"]`).click();
    const f = page.locator('.tc-fenetre');
    await expect(f.locator('.modal-titre .sim-marque')).toHaveText('Simulation');
    await f.locator(`.tc-niveau input[value="${code}"]`).check();
    if (texte) await f.locator('.tc-retroaction').fill(texte);
    await f.locator('[data-tc="inscrire"]').click();
    await expect(page.locator('.tc-fenetre')).toHaveCount(0);
}

test('un groupe sans simulation : aucune entrée, aucun écran, et sa forme au stock est celle d\'avant', async ({ page }) => {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    await installer(page);
    await ouvrirTableau(page);
    await expect(page.locator('#tableau-simulation-entree')).toBeEmpty();
    await expect(sim(page)).toBeHidden();
    await expect(page.locator('#tableau-notation-hote .tn-tableau')).toBeVisible();
    await expect(page.locator('.sim-marque')).toHaveCount(0);
    expect(await page.evaluate(() => window.SimulationPratique.ouvrir())).toBe(false);
    // La fiche enregistrée sans simulation n'ajoute pas le champ au groupe-cours.
    await poserDansLaFiche(page, '');
    expect(Object.keys(await groupeRange(page))).not.toContain('simulationPratiqueId');
    expect(erreurs).toEqual([]);
});

test('poser la simulation dans la fiche : seules les « Par standards » sont offertes ; la pratique officielle ne bouge pas', async ({ page }) => {
    await installer(page);
    await poserDansLaFiche(page, 'cib-sim');
    const options = await page.locator('#v2-gc-simulation option').allTextContents();
    expect(options).toEqual(['— Aucune simulation —', 'Standards à simuler', 'Standards officiels', 'Standards jumeaux']);
    await expect(page.locator('#v2-gc-simulation-libelle')).toHaveText('7. Simulation (facultatif)');
    const gc = await groupeRange(page);
    expect([gc.pratiqueId, gc.simulationPratiqueId]).toEqual(['sel-sim', 'cib-sim']);
    // Les miroirs du groupe-cours ne portent pas le lien.
    const miroirs = await page.evaluate(() => JSON.stringify([window.db.getSync('groupeCoursActif'), window.db.getSync('infoCours')]));
    expect(miroirs).not.toContain('cib-sim');
    // L'entrée paraît au tableau de notation, SOUS le tableau officiel, qui reste celui de la pratique officielle.
    await ouvrirTableau(page);
    await expect(page.locator('#tableau-notation-hote .tn-tableau')).toBeVisible();
    await expect(page.locator('#tableau-notation-hote .tc-tableau')).toHaveCount(0);
    await expect(page.locator('#tableau-simulation-entree .sim-marque')).toHaveText('Simulation');
    await expect(page.locator('#tableau-simulation-entree .sim-entree-texte')).toHaveText('Ce groupe a une pratique en simulation : « Standards à simuler ».');
});

test('la fiche refuse, en mots : la pratique de notation elle-même, et une pratique qui partage ses cibles', async ({ page }) => {
    await installer(page, { pratiqueOfficielle: 'cib-off' });
    await poserDansLaFiche(page, 'cib-off');
    expect((await groupeRange(page)).simulationPratiqueId).toBeUndefined();
    await expect(page.locator('#v2-gc-simulation')).toHaveValue('');   // la fiche est remise au stock
    await poserDansLaFiche(page, 'cib-jumelle');
    expect((await groupeRange(page)).simulationPratiqueId).toBeUndefined();
    await poserDansLaFiche(page, 'cib-sim');
    expect((await groupeRange(page)).simulationPratiqueId).toBe('cib-sim');
});

test('LA PREUVE : simulation posée, niveaux inscrits, observation consignée, inscription annulée ; la sortie officielle est identique, octet pour octet', async ({ page }) => {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    await installer(page);
    const avant = await instantaneOfficiel(page);
    expect(JSON.parse(avant).notes.some(n => n && n.noteConstructible), 'le banc a au moins une note officielle construite : la comparaison porte sur des nombres').toBe(true);

    await poserDansLaFiche(page, 'cib-sim');
    await ouvrirSimulation(page);
    // La marque, en permanence : le bandeau, le titre du tableau ; le tableau officiel et l'entrée sont cachés.
    await expect(sim(page).locator('.sim-bandeau .sim-marque')).toHaveText('Simulation');
    await expect(sim(page).locator('.sim-bandeau-texte')).toHaveText('Rien de ce qui s’inscrit ici ne compte dans la note du groupe. Sa pratique de notation reste « Sélection fictive ».');
    await expect(sim(page).locator('.tn-titre')).toHaveText('Simulation Tableau des cibles');
    await expect(page.locator('#tableau-notation-hote')).toBeHidden();
    // Aucun bouton d'export sous la simulation.
    await expect(sim(page).locator('[data-action="exporterSyntheseResultatsCSV"]')).toHaveCount(0);

    // Inscrire des niveaux : le tableau qui se redessine est celui de la simulation, et il la garde.
    await inscrire(page, 'Zoé Fictive', 'ENSC_SIM_c0', '4', 'Note de l’enseignant, pour lui.');
    await expect(rangee(page, 'Zoé Fictive').locator('.tc-case[data-cible="ENSC_SIM_c0"] .tc-case-niveau')).toHaveText('4');
    await expect(sim(page).locator('.sim-bandeau .sim-marque')).toBeVisible();
    await inscrire(page, 'Zoé Fictive', 'ENSC_SIM_c1', '3');
    await inscrire(page, 'Yan Inventé', 'ENSC_SIM_c0', '1');
    await expect(rangee(page, 'Zoé Fictive').locator('.tc-cellule-note')).toHaveText('88 %');   // (100 + 75) ÷ 2 = 87,5, arrondi comme l'indice P

    // Annuler une inscription : elle reste, barrée ; le tableau de la simulation suit.
    await rangee(page, 'Yan Inventé').locator('.tc-case[data-cible="ENSC_SIM_c0"]').click();
    await page.locator('.tc-fenetre [data-tc="annuler"]').click();
    await page.locator('#overlay-ui-dialogue textarea, #overlay-ui-dialogue input[type="text"]').first().fill('Erreur de case');
    await page.locator('#overlay-ui-dialogue button', { hasText: 'Annuler l’inscription' }).click();
    await expect(page.locator('.tc-fenetre .tc-entree--annulee')).toHaveCount(1);
    await page.locator('.tc-fenetre .modal-actions [data-tc="fermer"]').click();
    await expect(rangee(page, 'Yan Inventé').locator('.tc-case[data-cible="ENSC_SIM_c0"] .tc-case-niveau')).toHaveCount(0);

    // Observer : la marque au titre, une observation consignée, puis le tableau de la simulation, toujours.
    await sim(page).locator('[data-tc="observer"]').click();
    const o = page.locator('.oc-fenetre');
    await expect(o.locator('.modal-titre .sim-marque')).toHaveText('Simulation');
    await o.locator('.oc-tuile[data-cible="ENSC_SIM_c0"]').click();
    await o.locator('[data-oc="commencer"]').click();
    await expect(o.locator('.modal-titre .sim-marque')).toHaveText('Simulation');
    await o.locator('.tc-coche--oui').first().click();
    await o.locator('.oc-note').fill('Vu en équipe.');
    await o.locator('[data-oc="inscrire"]').click();
    await o.locator('.modal-fermer').click();
    await expect(page.locator('.oc-fenetre')).toHaveCount(0);
    await expect(sim(page).locator('.tc-tableau')).toBeVisible();
    await expect(page.locator('#tableau-notation-hote')).toBeHidden();

    // Tout est allé sous l'ensemble de la simulation, et nulle part ailleurs.
    const stock = await page.evaluate(({ T }) => window.db.getSync(T + '_inscriptionsCibles'), { T });
    expect(stock.map(i => i.type)).toEqual(['inscription', 'inscription', 'inscription', 'annulation', 'inscription']);
    expect([...new Set(stock.map(i => i.ensembleId))]).toEqual(['ENSC_SIM']);

    // Revenir au tableau officiel, puis LA COMPARAISON.
    await sim(page).locator('[data-sim="fermer"]').click();
    await expect(page.locator('#tableau-notation-hote .tn-tableau')).toBeVisible();
    await expect(sim(page)).toBeHidden();
    const apres = await instantaneOfficiel(page);
    expect(apres).toBe(avant);
    expect((await groupeRange(page)).pratiqueId).toBe('sel-sim');
    expect(erreurs).toEqual([]);
});

test('retirer la simulation, puis la reposer : le même tableau, toutes les inscriptions ; rouvrir la sous-section montre l\'officiel', async ({ page }) => {
    await installer(page, { simulation: 'cib-sim' });
    await ouvrirSimulation(page);
    await inscrire(page, 'Zoé Fictive', 'ENSC_SIM_c0', '3', 'Première trace.');
    await inscrire(page, 'Léa Imaginaire', 'ENSC_SIM_c1', '2');
    // Le tableau tel qu'il s'ouvre (un rendu neuf : après une inscription, la case écrite garde le focus et son tabindex).
    await sim(page).locator('[data-sim="fermer"]').click();
    await page.locator('#tableau-simulation-entree [data-sim="ouvrir"]').click();
    const tableauAvant = await sim(page).locator('.tc-tableau').innerHTML();
    expect(tableauAvant).toContain('tc-case-niveau');
    const stockAvant = await page.evaluate(({ T }) => JSON.stringify(window.db.getSync(T + '_inscriptionsCibles')), { T });

    // Rouvrir la sous-section : toujours le tableau officiel ; la simulation s'ouvre par son entrée.
    await ouvrirTableau(page);
    await expect(sim(page)).toBeHidden();
    await expect(page.locator('#tableau-notation-hote .tn-tableau')).toBeVisible();

    // Retirer : plus d'entrée, plus d'écran ; le stock des inscriptions n'a pas bougé.
    await poserDansLaFiche(page, '');
    expect(Object.keys(await groupeRange(page))).not.toContain('simulationPratiqueId');
    await ouvrirTableau(page);
    await expect(page.locator('#tableau-simulation-entree')).toBeEmpty();
    expect(await page.evaluate(({ T }) => JSON.stringify(window.db.getSync(T + '_inscriptionsCibles')), { T })).toBe(stockAvant);

    // Reposer : le même tableau, à l'octet.
    await poserDansLaFiche(page, 'cib-sim');
    await ouvrirSimulation(page);
    expect(await sim(page).locator('.tc-tableau').innerHTML()).toBe(tableauAvant);
    await rangee(page, 'Zoé Fictive').locator('.tc-case[data-cible="ENSC_SIM_c0"]').click();
    await expect(page.locator('.tc-fenetre .tc-entree-note')).toHaveText('Première trace.');
});

test('la pratique simulée est supprimée : « Aucune simulation », dit en clair ; ses inscriptions restent ; la fiche garde le lien', async ({ page }) => {
    await installer(page, { simulation: 'cib-sim' });
    await ouvrirSimulation(page);
    await inscrire(page, 'Zoé Fictive', 'ENSC_SIM_c0', '3');
    await page.evaluate(({ T }) => {
        window.db.setSync(T + '_pratiquesConfigurables', window.db.getSync(T + '_pratiquesConfigurables').filter(p => p.id !== 'cib-sim'));
        if (window.invaliderCachePratique) window.invaliderCachePratique();
    }, { T });
    await ouvrirTableau(page);
    await expect(sim(page)).toBeHidden();
    await expect(page.locator('#tableau-simulation-entree [data-sim="ouvrir"]')).toHaveCount(0);
    await expect(page.locator('#tableau-simulation-entree .sim-entree-texte')).toHaveText('Aucune simulation. La pratique que ce groupe avait en simulation n’existe plus dans ce trimestre. Les niveaux et les observations inscrits sous elle sont gardés. La simulation se choisit dans la fiche du groupe-cours.');
    expect(await page.evaluate(({ T }) => window.db.getSync(T + '_inscriptionsCibles').length, { T })).toBe(1);
    // La fiche montre le lien comme « Pratique supprimée » ; l'enregistrer pour une autre raison ne le retire pas.
    await page.evaluate(({ GC }) => {
        window.chargerGroupeCoursV2();
        const menu = document.getElementById('v2-selectGroupeCours');
        menu.value = GC;
        menu.dispatchEvent(new Event('change', { bubbles: true }));
    }, { GC });
    await expect(page.locator('#v2-gc-simulation option:checked')).toHaveText('Pratique supprimée');
    await page.evaluate(() => document.getElementById('v2-gc-pratique').dispatchEvent(new Event('change', { bubbles: true })));
    expect((await groupeRange(page)).simulationPratiqueId).toBe('cib-sim');
});

test('la vue étendue seulement : le bandeau de retour a une cible tactile de 44 px ; la marque se lit sans survol', async ({ page }) => {
    await installer(page, { simulation: 'cib-sim' });
    await ouvrirSimulation(page);
    const boite = await sim(page).locator('.sim-revenir').boundingBox();
    expect(Math.round(boite.height)).toBeGreaterThanOrEqual(44);   // 43,999996 mesuré : un arrondi de sous-pixel
    await expect(sim(page).locator('.sim-marque').first()).toBeVisible();
    expect(await sim(page).locator('.sim-marque').first().getAttribute('title')).toBeNull();
});
