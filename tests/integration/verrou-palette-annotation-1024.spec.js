import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// LE VERROU AUSSI DANS LA PALETTE ANNOTATION (24 oct. 2026).
//
// Demande de Grégoire (24 oct., 8 h 51) : « Parfois, après enregistrement, j'ai besoin d'ajouter un
// commentaire, un tampon ou un code et je dois toujours faire le détour par la palette d'évaluation
// pour déverrouiller la copie. » La palette Annotation porte le même bouton que Paramètres :
// « Déverrouiller l'évaluation » / « Verrouiller l'évaluation », caché sans évaluation.
// Ce que ce banc juge : le bouton dit l'état de la copie AFFICHÉE (pas celui du formulaire, qui en
// mode Annoter reste celui de la dernière copie évaluée, #1142) ; il déverrouille et verrouille par
// la porte unique (lot C) ; verrouiller depuis Annoter ne touche que l'évaluation de la copie
// affichée. Montage du banc #1142 (deux copies d'une production, A : 1 code, B : 11) et une
// troisième copie, C, sans évaluation. Noms fictifs (règle 6).

const PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
const T = 't1024v';

async function monter(page, { verrouillee }) {
    const erreurs = [];
    page.on('console', (m) => { if (m.type() === 'error') erreurs.push(m.text()); });
    page.on('pageerror', (e) => erreurs.push(`pageerror: ${e.message}`));
    page.on('dialog', (d) => { erreurs.push(`dialogue: ${d.message()}`); d.dismiss().catch(() => {}); });
    await page.goto(indexHtml);
    await page.waitForFunction(() => typeof window.db !== 'undefined' && window.db.ready && window.travauxUI && window.travauxStockage
        && typeof window.travauxUI.ouvrirFichier === 'function', null, { timeout: 30000 });
    await page.evaluate(() => { if (window.backupReminder) window.backupReminder.desactiverRappels(); });
    await page.evaluate(({ png, T, verrouillee }) => {
        // security-ok: fixtures littérales du banc, aucune source externe.
        const coursId = 'cours-1024v';
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
        window.db.setSync(T + '_groupesCours', [{ id: 'GC1024', trimestreId: T, coursId, groupeNum: '01', pratiqueId: 'sommative', actif: true }]);
        window.db.setSync(T + '_groupeEtudiants', [
            { da: 'TESTA1024', nom: 'Fictif', prenom: 'Alpha', groupe: '01', coursId, groupeCoursId: 'GC1024' },
            { da: 'TESTB1024', nom: 'Simulacre', prenom: 'Bêta', groupe: '01', coursId, groupeCoursId: 'GC1024' },
            { da: 'TESTC1024', nom: 'Chimère', prenom: 'Gamma', groupe: '01', coursId, groupeCoursId: 'GC1024' }
        ]);
        window.db.setSync(T + '_productions', [
            { id: 'p1024', titre: 'Analyse', type: 'travail', ponderation: 60, grilleId: 'G1024', echelleId: 'E1024', groupeCoursId: 'GC1024' }
        ]);
        window.db.setSync(T + '_grillesTemplates', [{ id: 'G1024', nom: 'Grille témoin', type: 'holistique', criteres: crit }]);
        window.db.setSync(T + '_echellesTemplates', [{ id: 'E1024', nom: 'IDME', niveaux }]);
        const evaluation = (id, da, nb, pct, niv) => ({
            id, etudiantDA: da, productionId: 'p1024', groupeCoursId: 'GC1024', coursId,
            grilleId: 'G1024', echelleId: 'E1024', statutRemise: 'evalue', statutIntegrite: 'recevable',
            dateEvaluation: '2026-10-15T08:00:00.000Z', noteFinale: 80, niveauFinal: 'M', verrouillee,
            criteres: [
                { critereId: 'c1', critereNom: 'Contenu', niveauSelectionne: 'M', ponderation: 80, retroaction: '' },
                { critereId: 'c2', critereNom: 'Français écrit', niveauSelectionne: niv, ponderation: 20, retroaction: 'PHRASE ' + nb }
            ],
            donneesAlgorithmiques: { c2: { erreurs: nb, mots: 600, noteCalculee: 0, pourcentage: pct, niveau: niv, retroaction: 'PHRASE ' + nb } },
            retroactionFinale: '', retroactionReecrite: false,
            pointsAnalytiques: {}, optionsAffichage: { description: true, objectif: false, tache: false, adresse: false, contexte: false, affichageNote: 'complet' }
        });
        window.db.setSync(T + '_evaluationsSauvegardees', [evaluation('EVA1024', 'TESTA1024', 1, 95, 'E'), evaluation('EVB1024', 'TESTB1024', 11, 45, 'I')]);
        const fichier = (id, da) => ({
            id, etudiantDA: da, productionId: 'p1024', coursId, groupeCoursId: 'GC1024',
            nomFichier: 'FICTIF_' + da + '_Analyse.png', typeMIME: 'image/png', tailleFichier: 70, nombrePages: 1,
            stockage: 'indexeddb', thumbnailDataUrl: '', dateImport: '2026-10-01T12:00:00.000Z', dateModification: '2026-10-01T12:00:00.000Z',
            source: 'import-local', importePar: 'single', statut: 'present'
        });
        window.db.setSync(T + '_fichiersTravaux', [fichier('FTA1024', 'TESTA1024'), fichier('FTB1024', 'TESTB1024'), fichier('FTC1024', 'TESTC1024')]);
        const codes = (n) => { const s = []; for (let i = 0; i < n; i++) s.push({ id: 'S' + i, type: 'errfr_syntaxe', x: 1, y: 1 }); return s; };
        const annotation = (fid, da, n) => ({ id: 'ANN_' + fid, fichierId: fid, etudiantDA: da, productionId: 'p1024',
            pages: { 1: { shapes: codes(n), textAnnotations: [], stickers: [] } }, version: 1,
            dateCreation: '2026-10-15T08:00:00.000Z', dateModification: '2026-10-15T08:00:00.000Z' });
        window.db.setSync(T + '_annotationsTravaux', [annotation('FTA1024', 'TESTA1024', 1), annotation('FTB1024', 'TESTB1024', 11)]);
        window.trimestreActif = T;
        window.db.setSync('trimestreActif', T);
        window.db.setSync('infoCours', { id: coursId, codeCours: 'FRA101', groupe: '01', _groupeCoursId: 'GC1024' });
        window.db.setSync('groupeCoursActif', { id: 'GC1024', trimestreId: T });
        const octets = Uint8Array.from(atob(png), (c) => c.charCodeAt(0));
        const copie = new Blob([octets], { type: 'image/png' });
        const original = window.travauxStockage.recupererBlob;
        window.travauxStockage.recupererBlob = async function (id) { return /^FT[ABC]1024$/.test(id) ? copie : original.apply(this, arguments); };
    }, { png: PNG, T, verrouillee });
    return erreurs;
}

const stock = (page, id) => page.evaluate(({ T, id }) => {
    const e = window.db.getSync(T + '_evaluationsSauvegardees', []).find(x => x.id === id);
    return { verrouillee: e.verrouillee, erreurs: e.donneesAlgorithmiques.c2.erreurs };
}, { T, id });

/** Le bouton de la palette Annotation : null s'il est caché (sa ligne porte `u-hide`), sinon ses mots. */
const boutonAnnotation = (page) => page.evaluate(() => {
    const b = document.getElementById('travaux-annot-btn-verrou');
    if (!b || b.parentElement.classList.contains('u-hide') || b.offsetParent === null) return null;
    return b.textContent.trim();
});
const boutonParametres = (page) => page.evaluate(() => (document.getElementById('btnVerrouillerEvaluation') || {}).textContent.trim());

async function attendreCopie(page, da) {
    await page.waitForFunction((da) => window.evaluationEnCours && window.evaluationEnCours.etudiantDA === da
        && !!window.evaluationEnCours.idModification, da, { timeout: 15000 });
    await page.waitForTimeout(3500);
    await page.waitForFunction(() => !window._timerAutoSave, null, { timeout: 10000 });
}

async function allerAAnnoter(page) {
    await page.evaluate(() => window.naviguerVers('evaluations', 'annoter'));
    await page.waitForFunction(() => !!document.querySelector('#evaluations-contenu-fichiers [data-fichier-id="FTA1024"]'), null, { timeout: 10000 });
}

/** Ouvrir une copie (le clic sur son badge), dans le mode courant. */
async function ouvrir(page, id) {
    await page.evaluate((id) => window.travauxUI.ouvrirFichier(id), id);
    await page.waitForFunction((id) => (window.travauxVisionneuse.getFichierActuel() || {}).id === id, id, { timeout: 10000 });
    await page.waitForTimeout(800);
}

/** Le vrai clic sur le bouton. Le rappel de sauvegarde, qui peut s'ouvrir par-dessus, est retiré d'abord. */
async function cliquerVerrou(page) {
    await page.evaluate(() => { const o = document.getElementById('overlay-backup-reminder'); if (o) o.remove(); });
    await page.click('#travaux-annot-btn-verrou');
}

const sansBruit = (erreurs) => erreurs.filter((m) => !/favicon|ERR_FILE_NOT_FOUND/.test(m));

test.setTimeout(120000);

test('verrou · Annoter une copie verrouillée : « Déverrouiller l\'évaluation », le clic déverrouille, Paramètres dit la même chose en passant à Évaluer, et au retour', async ({ page }) => {
    const erreurs = await monter(page, { verrouillee: true });
    await allerAAnnoter(page);
    await ouvrir(page, 'FTA1024');
    expect(await boutonAnnotation(page)).toBe('Déverrouiller l\'évaluation');

    await cliquerVerrou(page);
    await page.waitForTimeout(500);
    expect.soft(await stock(page, 'EVA1024')).toEqual({ verrouillee: false, erreurs: 1 });
    expect.soft(await stock(page, 'EVB1024'), 'B n\'a pas bougé').toEqual({ verrouillee: true, erreurs: 11 });
    expect.soft(await boutonAnnotation(page)).toBe('Verrouiller l\'évaluation');

    await page.evaluate(() => window.travauxUI.basculerMode('evaluer'));
    await attendreCopie(page, 'TESTA1024');
    expect.soft(await boutonParametres(page), 'Paramètres, en Évaluer').toBe('Verrouiller l\'évaluation');

    await page.evaluate(() => window.travauxUI.basculerMode('annoter'));
    await page.waitForTimeout(500);
    expect.soft(await boutonAnnotation(page), 'Annotation, de retour').toBe('Verrouiller l\'évaluation');
    expect(sansBruit(erreurs)).toEqual([]);
});

test('verrou · le bouton suit la copie affichée : sans évaluation il se cache, sur une copie verrouillée il dit « Déverrouiller »', async ({ page }) => {
    const erreurs = await monter(page, { verrouillee: true });
    await allerAAnnoter(page);
    await ouvrir(page, 'FTA1024');
    // Le formulaire porte A, déverrouillée depuis Évaluer : en Annoter, il le reste en passant aux autres copies.
    await page.evaluate(() => window.travauxUI.basculerMode('evaluer'));
    await attendreCopie(page, 'TESTA1024');
    await page.evaluate(() => window.basculerVerrouillageEvaluationCourante());
    await page.waitForTimeout(500);
    await page.evaluate(() => window.travauxUI.basculerMode('annoter'));
    await page.waitForTimeout(500);
    expect.soft(await boutonAnnotation(page), 'A, déverrouillée').toBe('Verrouiller l\'évaluation');

    await ouvrir(page, 'FTC1024');
    expect.soft(await boutonAnnotation(page), 'C, sans évaluation : caché').toBe(null);

    await ouvrir(page, 'FTB1024');
    expect.soft(await boutonAnnotation(page), 'B, verrouillée (le formulaire porte encore A)').toBe('Déverrouiller l\'évaluation');

    // La palette régénérée par une personnalisation (le bouton renaît caché) : il retrouve l'état de B.
    await page.evaluate(() => window.travauxOutils.rafraichirPalettesApresPersonnalisation());
    expect.soft(await boutonAnnotation(page), 'B, après régénération de la palette').toBe('Déverrouiller l\'évaluation');
    expect(sansBruit(erreurs)).toEqual([]);
});

test('verrou · verrouiller depuis Annoter verrouille l\'évaluation de la copie affichée, et aucune autre', async ({ page }) => {
    const erreurs = await monter(page, { verrouillee: false });
    await allerAAnnoter(page);
    await ouvrir(page, 'FTA1024');
    await page.evaluate(() => window.travauxUI.basculerMode('evaluer'));
    await attendreCopie(page, 'TESTA1024');
    await page.evaluate(() => window.travauxUI.basculerMode('annoter'));
    await page.waitForTimeout(500);

    // (a) La copie affichée est celle du formulaire (A) : la porte, telle quelle.
    expect(await boutonAnnotation(page)).toBe('Verrouiller l\'évaluation');
    await cliquerVerrou(page);
    await page.waitForFunction((T) => window.db.getSync(T + '_evaluationsSauvegardees', []).find(x => x.id === 'EVA1024').verrouillee === true, T, { timeout: 10000 });
    expect.soft(await stock(page, 'EVA1024')).toEqual({ verrouillee: true, erreurs: 1 });
    expect.soft(await stock(page, 'EVB1024'), 'B n\'a pas bougé').toEqual({ verrouillee: false, erreurs: 11 });
    expect.soft(await boutonAnnotation(page)).toBe('Déverrouiller l\'évaluation');

    // (b) Annoter, la copie B : le formulaire porte encore A. Verrouiller charge B, puis passe la porte.
    await ouvrir(page, 'FTB1024');
    expect(await boutonAnnotation(page)).toBe('Verrouiller l\'évaluation');
    await cliquerVerrou(page);
    await page.waitForFunction((T) => window.db.getSync(T + '_evaluationsSauvegardees', []).find(x => x.id === 'EVB1024').verrouillee === true, T, { timeout: 20000 });
    await page.waitForTimeout(1000);
    expect.soft(await stock(page, 'EVB1024'), 'B verrouillée, avec SON compte').toEqual({ verrouillee: true, erreurs: 11 });
    expect.soft(await stock(page, 'EVA1024'), 'A n\'a pas bougé').toEqual({ verrouillee: true, erreurs: 1 });
    expect.soft(await boutonParametres(page), 'Paramètres (B chargée)').toBe('Déverrouiller l\'évaluation');
    expect(sansBruit(erreurs)).toEqual([]);
});

test('verrou · le chargement de l\'évaluation n\'aboutit pas : rien n\'est verrouillé, et c\'est dit', async ({ page }) => {
    const erreurs = await monter(page, { verrouillee: false });
    await allerAAnnoter(page);
    await ouvrir(page, 'FTA1024');
    await page.evaluate(() => window.travauxUI.basculerMode('evaluer'));
    await attendreCopie(page, 'TESTA1024');
    await page.evaluate(() => window.travauxUI.basculerMode('annoter'));
    await page.waitForTimeout(500);
    await ouvrir(page, 'FTB1024');

    // La panne : les deux chargeurs de l'évaluation (celui des menus, puis `modifierEvaluation`) ne
    // chargent rien. Le canal d'échec est écouté, pas remplacé.
    await page.evaluate(() => {
        window.verifierEtChargerEvaluationExistante = () => {};
        window.modifierEvaluationParId = () => {};
        window.__echecs = [];
        const erreur = window.notifications.erreur;
        window.notifications.erreur = function (titre) { window.__echecs.push(titre); return erreur.apply(this, arguments); };
    });
    await cliquerVerrou(page);
    await page.waitForFunction(() => window.__echecs.length > 0, null, { timeout: 25000 });
    expect.soft(await page.evaluate(() => window.__echecs)).toEqual(['L\'évaluation n\'a pas été verrouillée : son chargement n\'a pas abouti.']);
    expect.soft(await stock(page, 'EVB1024'), 'B non verrouillée').toEqual({ verrouillee: false, erreurs: 11 });
    expect.soft(await stock(page, 'EVA1024'), 'A n\'a pas bougé').toEqual({ verrouillee: false, erreurs: 1 });
    expect(sansBruit(erreurs)).toEqual([]);
});
