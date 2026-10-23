import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// #1142 (23 oct. 2026) — LE COMPTE D'ERREURS D'UNE COPIE ÉCRIT DANS L'ÉVALUATION D'UNE AUTRE.
//
// Vécu par Grégoire (PDF refait d'une copie de l'Artefact 4) : « 11 erreurs sur 600 mots → 9,00/20 »
// dans la ligne du calcul, « Ta rédaction contient 1 erreur » dans la phrase, niveau E, note juste.
// Mesuré par Cowork : 21 copies sur 24, chacune portant dans `donneesAlgorithmiques` le compte de la
// copie SUIVANTE du tableau. DEUX DÉFAUTS, reproduits ici avant tout correctif :
//   (1) LA SOURCE. Au passage à la copie suivante (`travauxUI.ouvrirFichier`), `activerAnnotation`
//       charge les annotations de la suivante et pousse leur total dans le champ partagé
//       `eval_erreurs_<critère>` pendant que l'évaluation en cours est encore la précédente : le
//       calcul l'y écrit. Évaluations ouvertes : l'enregistrement automatique réécrit la précédente
//       en entier (compte, phrase, note) — mesuré au banc avant correctif : 1 → 11.
//   (2) LE VERROU CONTOURNÉ. Au reverrouillage (« Note chiffrée » cochée, le geste de Grégoire à
//       6 h 57), `sauvegarderEvaluationModifiee` rangeait dans la base l'OBJET même du pivot. Au-delà
//       de 25 Ki, la base vit dans le cache mémoire de `db` : le calcul de (1) réécrivait l'évaluation
//       VERROUILLÉE en place — compte faux, phrase et note intactes. Exactement le symptôme vécu.
// ⚠ Le banc attend `db.ready` : écrites avant, les fixtures vont en localStorage et le cache mémoire
//   n'existe jamais (le défaut (2) y est invisible — mesuré en le montant). Noms fictifs (règle 6).

const PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
const T = 't1142';

/**
 * Deux copies d'une même production : A porte 1 code, B en porte 11. `volumineuse` : une troisième
 * évaluation, d'une autre production, fait passer la base au-delà de 25 Ki (le cache mémoire, la forme
 * de toute vraie base) — ni A ni B : leur rétroaction est réécrite par les gestes.
 */
async function monter(page, { verrouillee, volumineuse, enregistreB = 11 }) {
    const erreurs = [];
    page.on('console', (m) => { if (m.type() === 'error') erreurs.push(m.text()); });
    page.on('pageerror', (e) => erreurs.push(`pageerror: ${e.message}`));
    page.on('dialog', (d) => { erreurs.push(`dialogue: ${d.message()}`); d.dismiss().catch(() => {}); });
    await page.goto(indexHtml);
    await page.waitForFunction(() => typeof window.db !== 'undefined' && window.db.ready && window.travauxUI && window.travauxStockage
        && typeof window.travauxUI.ouvrirFichier === 'function', null, { timeout: 30000 });
    await page.evaluate(({ png, T, verrouillee, volumineuse, enregistreB }) => {
        // security-ok: fixtures littérales du banc, aucune source externe.
        const coursId = 'cours-1142';
        const crit = [
            { id: 'c1', nom: 'Contenu', ponderation: 80, type: 'holistique' },
            { id: 'c2', nom: 'Français écrit', ponderation: 20, type: 'algorithmique', formule: 'nombre d\'erreurs / nombre de mots' }
        ];
        const niveaux = [
            { code: 'I', nom: 'Insuffisant', min: 0, max: 54, valeurCalcul: 40 },
            { code: 'D', nom: 'En développement', min: 55, max: 74, valeurCalcul: 65 },
            { code: 'M', nom: 'Maîtrisé', min: 75, max: 89, valeurCalcul: 80 },
            { code: 'E', nom: 'Étendu', min: 90, max: 100, valeurCalcul: 95 }
        ];
        window.db.setSync('trimestres', [{ id: T, nom: 'Trimestre témoin', annee: 2026, session: 'A', actif: true }]);
        window.db.setSync('cours', [{ id: coursId, codeCours: 'FRA101', titre: 'Écriture et littérature' }]);
        window.db.setSync(T + '_groupesCours', [{ id: 'GC1142', trimestreId: T, coursId, groupeNum: '01', pratiqueId: 'sommative', actif: true }]);
        window.db.setSync(T + '_groupeEtudiants', [
            { da: 'TESTA1142', nom: 'Fictif', prenom: 'Alpha', groupe: '01', coursId, groupeCoursId: 'GC1142' },
            { da: 'TESTB1142', nom: 'Simulacre', prenom: 'Bêta', groupe: '01', coursId, groupeCoursId: 'GC1142' }
        ]);
        window.db.setSync(T + '_productions', [
            { id: 'p1142', titre: 'Analyse', type: 'travail', ponderation: 60, grilleId: 'G1142', echelleId: 'E1142', groupeCoursId: 'GC1142' }
        ]);
        window.db.setSync(T + '_grillesTemplates', [{ id: 'G1142', nom: 'Grille témoin', type: 'holistique', criteres: crit }]);
        window.db.setSync(T + '_echellesTemplates', [{ id: 'E1142', nom: 'IDME', niveaux }]);
        const evaluation = (id, da, nb, pct, niv) => ({
            id, etudiantDA: da, productionId: 'p1142', groupeCoursId: 'GC1142', coursId,
            grilleId: 'G1142', echelleId: 'E1142', statutRemise: 'evalue', statutIntegrite: 'recevable',
            dateEvaluation: '2026-10-15T08:00:00.000Z', noteFinale: 80, niveauFinal: 'M', verrouillee,
            criteres: [
                { critereId: 'c1', critereNom: 'Contenu', niveauSelectionne: 'M', ponderation: 80, retroaction: '' },
                { critereId: 'c2', critereNom: 'Français écrit', niveauSelectionne: niv, ponderation: 20, retroaction: 'PHRASE ' + nb }
            ],
            donneesAlgorithmiques: { c2: { erreurs: nb, mots: 600, noteCalculee: 0, pourcentage: pct, niveau: niv, retroaction: 'PHRASE ' + nb } },
            retroactionFinale: '', retroactionReecrite: false,
            pointsAnalytiques: {}, optionsAffichage: { description: true, objectif: false, tache: false, adresse: false, contexte: false, affichageNote: 'complet' }
        });
        const evals = [evaluation('EVA1142', 'TESTA1142', 1, 95, 'E'), evaluation('EVB1142', 'TESTB1142', enregistreB, 45, 'I')];
        if (volumineuse) {
            const z = evaluation('EVZ1142', 'TESTZ1142', 0, 100, 'E');
            z.productionId = 'pAutre1142';
            z.retroactionFinale = 'x'.repeat(40000);
            evals.push(z);
        }
        window.db.setSync(T + '_evaluationsSauvegardees', evals);
        const fichier = (id, da) => ({
            id, etudiantDA: da, productionId: 'p1142', coursId, groupeCoursId: 'GC1142',
            nomFichier: 'FICTIF_' + da + '_Analyse.png', typeMIME: 'image/png', tailleFichier: 70, nombrePages: 1,
            stockage: 'indexeddb', thumbnailDataUrl: '', dateImport: '2026-10-01T12:00:00.000Z', dateModification: '2026-10-01T12:00:00.000Z',
            source: 'import-local', importePar: 'single', statut: 'present'
        });
        window.db.setSync(T + '_fichiersTravaux', [fichier('FTA1142', 'TESTA1142'), fichier('FTB1142', 'TESTB1142')]);
        const codes = (n) => { const s = []; for (let i = 0; i < n; i++) s.push({ id: 'S' + i, type: 'errfr_syntaxe', x: 1, y: 1 }); return s; };
        const annotation = (fid, da, n) => ({ id: 'ANN_' + fid, fichierId: fid, etudiantDA: da, productionId: 'p1142',
            pages: { 1: { shapes: codes(n), textAnnotations: [], stickers: [] } }, version: 1,
            dateCreation: '2026-10-15T08:00:00.000Z', dateModification: '2026-10-15T08:00:00.000Z' });
        window.db.setSync(T + '_annotationsTravaux', [annotation('FTA1142', 'TESTA1142', 1), annotation('FTB1142', 'TESTB1142', 11)]);
        window.trimestreActif = T;
        window.db.setSync('trimestreActif', T);
        window.db.setSync('infoCours', { id: coursId, codeCours: 'FRA101', groupe: '01', _groupeCoursId: 'GC1142' });
        window.db.setSync('groupeCoursActif', { id: 'GC1142', trimestreId: T });
        const octets = Uint8Array.from(atob(png), (c) => c.charCodeAt(0));
        const copie = new Blob([octets], { type: 'image/png' });
        const original = window.travauxStockage.recupererBlob;
        window.travauxStockage.recupererBlob = async function (id) { return /^FT[AB]1142$/.test(id) ? copie : original.apply(this, arguments); };
    }, { png: PNG, T, verrouillee, volumineuse, enregistreB });
    return erreurs;
}

const stock = (page, id) => page.evaluate(({ T, id }) => {
    const e = window.db.getSync(T + '_evaluationsSauvegardees', []).find(x => x.id === id);
    return { erreurs: e.donneesAlgorithmiques.c2.erreurs, phrase: e.criteres[1].retroaction, note: e.noteFinale, verrouillee: e.verrouillee };
}, { T, id });
const champ = (page) => page.evaluate(() => (document.getElementById('eval_erreurs_c2') || {}).value);

/** L'évaluation de la copie est chargée (pivot, id) et l'enregistrement automatique est retombé. */
async function attendreCopie(page, da) {
    await page.waitForFunction((da) => window.evaluationEnCours && window.evaluationEnCours.etudiantDA === da
        && !!window.evaluationEnCours.idModification, da, { timeout: 15000 });
    await page.waitForTimeout(3500);   // le compteur relancé à +2 s par `afficherPalettesEval`, puis l'enregistrement à +1,5 s
    await page.waitForFunction(() => !window._timerAutoSave, null, { timeout: 10000 });
}

/** Le chemin de Grégoire : Annoter, la copie A, « Évaluer ». */
async function ouvrirAEnModeEvaluer(page) {
    await page.evaluate(() => window.naviguerVers('evaluations', 'annoter'));
    await page.waitForFunction(() => !!document.querySelector('#evaluations-contenu-fichiers [data-fichier-id="FTA1142"]'), null, { timeout: 10000 });
    await page.evaluate(() => window.travauxUI.ouvrirFichier('FTA1142'));
    await page.waitForFunction(() => (window.travauxVisionneuse.getFichierActuel() || {}).id === 'FTA1142', null, { timeout: 10000 });
    await page.waitForTimeout(800);
    await page.evaluate(() => window.travauxUI.basculerMode('evaluer'));
    await attendreCopie(page, 'TESTA1142');
}

/** Passer à la copie suivante : le clic sur son badge (`travauxUI.ouvrirFichier`), en mode Évaluer. */
async function passerAB(page) {
    await page.evaluate(() => window.travauxUI.ouvrirFichier('FTB1142'));
    await attendreCopie(page, 'TESTB1142');
}

const sansBruit = (erreurs) => erreurs.filter((m) => !/favicon|ERR_FILE_NOT_FOUND/.test(m));

test('#1142 · (1) évaluations ouvertes : passer de A à B ne donne pas à A le compte de B', async ({ page }) => {
    const erreurs = await monter(page, { verrouillee: false, volumineuse: false });
    await ouvrirAEnModeEvaluer(page);
    const avant = await stock(page, 'EVA1142');
    await passerAB(page);
    const apres = await stock(page, 'EVA1142');
    // AVANT LE CORRECTIF : 11, et la phrase « 11 erreurs », et la note de 11 erreurs.
    expect.soft(avant.erreurs).toBe(1);
    expect.soft(apres.erreurs, 'A garde son compte').toBe(1);
    expect.soft(apres.phrase, 'A garde sa phrase').toBe(avant.phrase);
    expect.soft(apres.note, 'A garde sa note').toBe(avant.note);
    expect.soft(await champ(page), 'le champ porte le compte de B').toBe('11');
    expect(sansBruit(erreurs)).toEqual([]);
});

test('#1142 · (2) le geste de Grégoire, base au-delà de 25 Ki : déverrouiller A, « Note chiffrée », reverrouiller, passer à B', async ({ page }) => {
    const erreurs = await monter(page, { verrouillee: true, volumineuse: true });
    await ouvrirAEnModeEvaluer(page);
    await page.evaluate(() => window.basculerVerrouillageEvaluationCourante());   // déverrouiller
    await page.waitForTimeout(500);
    await page.evaluate(() => {
        const lettre = document.getElementById('affichageNoteLettre1');
        lettre.checked = true; lettre.dispatchEvent(new Event('change', { bubbles: true }));
        const chiffree = document.getElementById('affichageNoteComplet1');
        chiffree.checked = true; chiffree.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await page.waitForTimeout(2500);
    await page.evaluate(() => window.basculerVerrouillageEvaluationCourante());   // reverrouiller
    await page.waitForTimeout(1500);
    const reverrouillee = await stock(page, 'EVA1142');
    await passerAB(page);
    const apres = await stock(page, 'EVA1142');
    // AVANT LE CORRECTIF : { erreurs: 11, phrase: « … 1 erreur … », note intacte, verrouillee: true }.
    expect.soft(reverrouillee.verrouillee).toBe(true);
    expect.soft(reverrouillee.erreurs).toBe(1);
    expect.soft(apres, 'l\'évaluation verrouillée de A n\'a pas bougé').toEqual(reverrouillee);
    expect(sansBruit(erreurs)).toEqual([]);
});

/**
 * Verdict de Cowork (23 oct., 9 h 32) — L'INVARIANT POUR TOUTE L'ÉVALUATION. Le défaut est d'une classe : tout
 * objet de la base que le pivot tient par référence peut être réécrit en place. Le témoin parcourt TOUS les objets
 * imbriqués de l'évaluation enregistrée (`criteres` et ses entrées, `optionsAffichage`, `donneesAlgorithmiques`…)
 * et des deux pivots, et rend le chemin de chaque objet partagé : « pivot.x ↔ base.y ».
 */
const TEMOIN_PARTAGES = `(T) => {
    const e = window.db.getSync(T + '_evaluationsSauvegardees', []).find(x => x.id === 'EVA1142');
    if (!e) return null;
    const base = new Map();
    const parcourirBase = (o, chemin) => {
        if (!o || typeof o !== 'object' || base.has(o)) return;
        base.set(o, chemin);
        Object.keys(o).forEach(k => parcourirBase(o[k], chemin + '.' + k));
    };
    parcourirBase(e, 'base');
    const partages = [];
    const vus = new Set();
    const parcourirPivot = (o, chemin) => {
        if (!o || typeof o !== 'object' || vus.has(o)) return;
        vus.add(o);
        if (base.has(o)) { partages.push(chemin + ' ↔ ' + base.get(o)); return; }
        Object.keys(o).forEach(k => parcourirPivot(o[k], chemin + '.' + k));
    };
    parcourirPivot(window.evaluationEnCours, 'window.evaluationEnCours');
    parcourirPivot(evaluationEnCours, 'evaluationEnCours');   // eslint-disable-line no-undef
    return { partages, objetsEnBase: base.size, cacheMemoire: window.db.memoryCache.has(T + '_evaluationsSauvegardees') };
}`;

test('#1142 · le pivot et la base ne partagent aucun objet, à aucune profondeur : ni à l\'ouverture, ni après le verrouillage', async ({ page }) => {
    await monter(page, { verrouillee: true, volumineuse: true });
    await page.evaluate('window.__temoin1142 = ' + TEMOIN_PARTAGES);
    // À l'ouverture : `verifierEtChargerEvaluationExistante` d'abord (l'alias de lecture), avant « Modifier ».
    await page.evaluate(() => window.naviguerVers('evaluations', 'annoter'));
    await page.waitForFunction(() => !!document.querySelector('#evaluations-contenu-fichiers [data-fichier-id="FTA1142"]'), null, { timeout: 10000 });
    await page.evaluate(() => window.travauxUI.ouvrirFichier('FTA1142'));
    await page.waitForFunction(() => (window.travauxVisionneuse.getFichierActuel() || {}).id === 'FTA1142', null, { timeout: 10000 });
    await page.waitForTimeout(800);
    await page.evaluate((T) => {
        window.__ouverture1142 = { releves: 0, partages: [] };
        window.__espion1142 = setInterval(() => {
            const p = window.evaluationEnCours;
            if (!p || p.etudiantDA !== 'TESTA1142') return;
            const r = window.__temoin1142(T);
            if (!r) return;
            window.__ouverture1142.releves++;
            r.partages.forEach(c => { if (!window.__ouverture1142.partages.includes(c)) window.__ouverture1142.partages.push(c); });
        }, 10);
    }, T);
    await page.evaluate(() => window.travauxUI.basculerMode('evaluer'));
    await attendreCopie(page, 'TESTA1142');
    const ouverture = await page.evaluate(() => { clearInterval(window.__espion1142); return window.__ouverture1142; });
    await page.evaluate(() => window.basculerVerrouillageEvaluationCourante());   // déverrouiller
    await page.waitForTimeout(500);
    await page.evaluate(() => window.basculerVerrouillageEvaluationCourante());   // reverrouiller
    await page.waitForTimeout(1500);
    const apresVerrou = await page.evaluate((T) => window.__temoin1142(T), T);
    expect.soft(ouverture.releves, 'l\'espion a observé l\'ouverture').toBeGreaterThan(0);
    expect.soft(ouverture.partages, 'aucun objet partagé à l\'ouverture').toEqual([]);
    expect.soft(apresVerrou.cacheMemoire, 'la base vit dans le cache mémoire (la forme de toute vraie base)').toBe(true);
    // Témoin de profondeur : `criteres` et ses deux entrées, `optionsAffichage`, `donneesAlgorithmiques` et `.c2`, `pointsAnalytiques`…
    expect.soft(apresVerrou.objetsEnBase, 'le témoin parcourt bien les objets imbriqués').toBeGreaterThanOrEqual(8);
    expect(apresVerrou.partages, 'aucun objet partagé après le verrouillage').toEqual([]);
});

test('#1142 · non-régression : la copie ouverte reçoit SON compte, même si son évaluation enregistrée en porte un autre', async ({ page }) => {
    // B enregistrée avec 3 (le stock faux), ses annotations en portent 11, B ouverte : le compteur pose 11.
    await monter(page, { verrouillee: false, volumineuse: false, enregistreB: 3 });
    await ouvrirAEnModeEvaluer(page);
    await passerAB(page);
    expect.soft(await champ(page)).toBe('11');
    expect((await stock(page, 'EVB1142')).erreurs).toBe(11);
});

test('#1142 · non-régression : un code posé sur la copie ouverte en mode Évaluer suit dans le champ et dans son évaluation', async ({ page }) => {
    await monter(page, { verrouillee: false, volumineuse: true });
    await ouvrirAEnModeEvaluer(page);
    await passerAB(page);
    await page.evaluate(() => {
        const a = window.travauxAnnotation.getAnnotationCourante();
        a.pages[1].shapes.push({ id: 'S_NEUF', type: 'errfr_accord', x: 2, y: 2 });
        window.dispatchEvent(new CustomEvent('travaux-annotation-modifiee'));
    });
    await page.waitForTimeout(2500);
    expect.soft(await champ(page)).toBe('12');
    expect((await stock(page, 'EVB1142')).erreurs).toBe(12);
    expect((await stock(page, 'EVA1142')).erreurs).toBe(1);
});
