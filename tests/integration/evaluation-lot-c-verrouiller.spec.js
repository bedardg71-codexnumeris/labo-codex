import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// LOT C DE L'ENREGISTREMENT (D1, Grégoire, 26 sept. 2026, « c'est bon, je garde ») — L'ÉVALUATION D'UNE COPIE.
//
//  (a) le nombre d'erreurs, le nombre de mots et l'intégrité s'enregistrent tout seuls : on change la valeur,
//      on passe à l'élève suivant sans autre geste, la valeur est en base et le témoin a dit « Enregistré » ;
//  (b) « Verrouiller l'évaluation » et le cadenas passent par la MÊME porte, avec ses vérifications : une
//      évaluation dont l'échelle ne se résout pas est refusée par le cadenas aussi ; un seul message par geste ;
//  (c) déverrouiller retire l'évaluation de la note du cours, reverrouiller la remet ;
//  (d) un chargement (par la copie) n'écrit rien.
// La Liste (« Non verrouillée », son aide) : evaluation-926 ; le profil et le bilan : profil-896, profil-921.
//
// Montage : celui du banc #959 (trajet de la copie rejoué, un critère algorithmique). Noms fictifs.

const patternsAttendus = [
    /version\.json.*access control/i,
    /Cross origin requests are only supported/i,
    /Not allowed to load local resource.*\.(svg|png)/i,
    /Failed to load resource/i
];

function brancherEcouteurs(page) {
    const erreurs = [];
    const estAttendue = (m) => patternsAttendus.some((re) => re.test(m));
    page.on('pageerror', (e) => { const m = `pageerror: ${e.message}`; if (!estAttendue(m)) erreurs.push(m); });
    page.on('console', (msg) => { if (msg.type() === 'error') { const m = `console.error: ${msg.text()}`; if (!estAttendue(m)) erreurs.push(m); } });
    page.on('dialog', (d) => { erreurs.push(`dialogue: ${d.message()}`); d.dismiss().catch(() => {}); });
    return erreurs;
}

async function viderLeStockage(page) {
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(800);
    await page.evaluate(async () => {
        localStorage.clear();
        if (window.db && db.memoryCache) db.memoryCache.clear();
        await new Promise((res) => {
            const req = indexedDB.deleteDatabase('LaboCodexDB');
            req.onsuccess = req.onerror = req.onblocked = () => res();
            setTimeout(res, 1500);
        });
    });
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);
}

function evaluationSemee(surcharge) {
    return Object.assign({
        id: 'EVC', etudiantDA: '1234567', etudiantNom: 'Daniel Témoin', groupe: '00007', groupeCoursId: 'GC1',
        productionId: 'PC', productionNom: 'Portrait témoin', grilleId: 'GC', grilleNom: 'Grille témoin mixte',
        echelleId: 'EC', cartoucheId: '', statutRemise: 'annote', statutIntegrite: 'recevable', notesIntegrite: '',
        dateEvaluation: '2026-09-04T10:00:00.000Z', verrouillee: false,
        criteres: [
            { critereId: 'c1', critereNom: 'Contenu', niveauSelectionne: 'E', retroaction: '', ponderation: 80 },
            { critereId: 'c3', critereNom: 'Français écrit', niveauSelectionne: 'M', retroaction: '', ponderation: 20 }
        ],
        noteFinale: 92, ponderationCouverte: 100, niveauFinal: 'E', retroactionFinale: 'Rétroaction de la copie.',
        donneesAlgorithmiques: { c3: { erreurs: 7, mots: 460 } }
    }, surcharge || {});
}

async function semer(page, evaluation) {
    await viderLeStockage(page);
    await page.waitForFunction(() => typeof window.demarrerEvaluationDepuisFichier === 'function' && typeof window.db !== 'undefined');
    await page.evaluate(async ({ evaluation }) => {
        const k = (b) => (typeof cle === 'function' ? cle(b) : b);
        // security-ok: fixtures littérales du banc, aucune source externe.
        window.db.setSync('trimestres', [{ id: 'a2026', nom: 'Automne 2026', annee: 2026, session: 'A', actif: true }]);
        window.db.setSync('trimestreActif', 'a2026');
        window.db.setSync('groupeCoursActif', { id: 'GC1', trimestreId: 'a2026', nom: 'Groupe 00007' });
        window.db.setSync(k('groupeEtudiants'), [ // security-ok: fixture littérale du banc
            { da: '1234567', prenom: 'Daniel', nom: 'Témoin', groupe: '00007', groupeCoursId: 'GC1' },
            { da: '7654321', prenom: 'Berthe', nom: 'Voisine', groupe: '00007', groupeCoursId: 'GC1' }
        ]);
        window.db.setSync(k('grillesTemplates'), [{ id: 'GC', nom: 'Grille témoin mixte', criteres: [ // security-ok: fixture littérale du banc
            { id: 'c1', nom: 'Contenu', ponderation: 80, description: 'Le fond.' },
            { id: 'c3', nom: 'Français écrit', ponderation: 20, type: 'algorithmique', facteurNormalisation: 500, description: 'La langue.' }
        ] }]);
        window.db.setSync(k('echellesTemplates'), [{ id: 'EC', nom: 'IDME témoin', niveaux: [ // security-ok: fixture littérale du banc
            { code: 'I', nom: 'Insuffisant', min: 0, max: 54, valeurCalcul: 40 },
            { code: 'D', nom: 'En développement', min: 55, max: 74, valeurCalcul: 65 },
            { code: 'M', nom: 'Maîtrisé', min: 75, max: 89, valeurCalcul: 82 },
            { code: 'E', nom: 'Étendu', min: 90, max: 100, valeurCalcul: 95 }
        ] }]);
        window.db.setSync(k('productions'), [{ id: 'PC', titre: 'Portrait témoin', grilleId: 'GC', echelleId: 'EC', groupeCoursId: 'GC1' }]); // security-ok: fixture littérale du banc
        window.db.setSync(k('evaluationsSauvegardees'), evaluation ? [evaluation] : []);
        window.chargerListeEtudiantsEval();
        window.chargerGroupesEval();
        window.chargerProductionsDansSelect();
        window.chargerGrillesDansSelect();
        window.chargerEchellePerformance();
        // Le cadenas, posé AVANT l'ouverture comme le font les palettes (`poserBoutonVerrou`) : ici, dans
        // l'en-tête du panneau Paramètres (chemin sans copie, #868) — le même bouton, la même fonction.
        window.travauxUI.equiperFormulaireSansCopie();
        // Les deux voix de l'écran : les messages et le témoin commun.
        window.__messages = [];
        ['succes', 'erreur'].forEach((t) => {
            const o = window.notifications[t].bind(window.notifications);
            window.notifications[t] = function (...a) { window.__messages.push(t + ':' + a.join(' | ')); return o(...a); };
        });
        window.__enregistres = 0;
        const oe = window.temoinEnregistrement.enregistre.bind(window.temoinEnregistrement);
        window.temoinEnregistrement.enregistre = function (...a) { window.__enregistres++; return oe(...a); };
    }, { evaluation });
}

// Le trajet de la copie (banc #959) : `demarrerEvaluationDepuisFichier`, le statut « importe », la production.
async function ouvrirParLaCopie(page, da) {
    await page.evaluate((da) => {
        window.demarrerEvaluationDepuisFichier({ id: 'F' + da, etudiantDA: da, productionId: 'PC', nomFichier: 'copie.pdf' });
        const selE = document.getElementById('selectEtudiantEval');
        selE.value = da;
        window.chargerEvaluationsEtudiant();
        const selR = document.getElementById('remiseProduction1');
        selR.value = 'importe';
        window.changerStatutRemise(1);
        const selP = document.getElementById('selectProduction1');
        selP.value = 'PC';
        selP.dispatchEvent(new Event('change', { bubbles: true }));
    }, da);
}

async function attendreCopieChargee(page, { idAttendu = 'EVC' } = {}) {
    await page.waitForFunction((id) => window.evaluationEnCours
        && (id === null || window.evaluationEnCours.idModification === id)
        && window._autoSaveSuspendu !== true && !(window._chargementsEvaluationEnCours > 0)
        && !!document.getElementById('eval_erreurs_c3'), idAttendu, { timeout: 10000 });
    await page.waitForTimeout(700);
}

const base = (page) => page.evaluate(() => JSON.parse(JSON.stringify(
    (window.db.getSync(cle('evaluationsSauvegardees'), []) || []))));
const evc = async (page) => (await base(page)).find((e) => e.id === 'EVC');

// Un geste de l'usager : la valeur, puis l'évènement que le clavier ou le menu émet.
async function saisir(page, id, valeur, evenement) {
    await page.evaluate(({ id, valeur, evenement }) => {
        window.__enregistres = 0;
        const el = document.getElementById(id);
        el.value = valeur;
        el.dispatchEvent(new Event(evenement, { bubbles: true }));
    }, { id, valeur, evenement });
}

test('lot C (a) · nombre d\'erreurs et nombre de mots : changés, puis élève suivant sans autre geste → en base, et le témoin a dit « Enregistré »', async ({ page }) => {
    test.setTimeout(90000);
    const erreurs = brancherEcouteurs(page);
    await semer(page, evaluationSemee());
    await ouvrirParLaCopie(page, '1234567');
    await attendreCopieChargee(page);

    await saisir(page, 'eval_erreurs_c3', '13', 'input');
    await saisir(page, 'eval_mots_c3', '520', 'input');
    // Élève suivant AVANT la fin du délai de 1,5 s : l'écriture en attente part au changement.
    await ouvrirParLaCopie(page, '7654321');
    await page.waitForTimeout(300);
    const e = await evc(page);
    expect(e.donneesAlgorithmiques.c3.erreurs, 'nombre d\'erreurs en base').toBe(13);
    expect(e.donneesAlgorithmiques.c3.mots, 'nombre de mots en base').toBe(520);
    expect(e.verrouillee, 'toujours non verrouillée : rien ne verrouille en passant').toBe(false);
    expect(await page.evaluate(() => window.__enregistres), 'le témoin commun a dit « Enregistré »').toBeGreaterThan(0);
    expect(erreurs).toEqual([]);
});

for (const cas of [
    { quoi: 'le statut', gestes: [['statutIntegrite', 'plagiat', 'change']], attendu: { statutIntegrite: 'plagiat', notesIntegrite: '' } },
    { quoi: 'les notes', semis: { statutIntegrite: 'soupcon' }, gestes: [['notesIntegrite', 'Passage repris d\'un corrigé', 'input']],
        attendu: { statutIntegrite: 'soupcon', notesIntegrite: 'Passage repris d\'un corrigé' } }
]) {
    test(`lot C (a) · l'intégrité, ${cas.quoi} : changé, puis élève suivant sans autre geste → en base`, async ({ page }) => {
        test.setTimeout(90000);
        const erreurs = brancherEcouteurs(page);
        await semer(page, evaluationSemee(cas.semis));
        await ouvrirParLaCopie(page, '1234567');
        await attendreCopieChargee(page);

        for (const [id, valeur, evenement] of cas.gestes) await saisir(page, id, valeur, evenement);
        await ouvrirParLaCopie(page, '7654321');
        await page.waitForTimeout(300);
        const e = await evc(page);
        expect({ statutIntegrite: e.statutIntegrite, notesIntegrite: e.notesIntegrite }).toEqual(cas.attendu);
        // L'écran de la copie suivante (remis à « recevable » par #959) n'a rien écrit dans la précédente.
        expect(await page.evaluate(() => document.getElementById('statutIntegrite').value)).toBe('recevable');
        expect(await page.evaluate(() => window.__enregistres)).toBeGreaterThan(0);
        expect(erreurs).toEqual([]);
    });
}

test('lot C (a) · le nombre d\'erreurs, puis rechargement dans la seconde et demie : l\'écriture en attente part avant', async ({ page }) => {
    test.setTimeout(90000);
    const erreurs = brancherEcouteurs(page);
    await semer(page, evaluationSemee());
    await ouvrirParLaCopie(page, '1234567');
    await attendreCopieChargee(page);
    // L'écouteur est posé par l'initialisation d'Annoter, faite dès qu'une copie s'ouvre (travaux-ui.js).
    await page.evaluate(() => window.travauxAnnotation.initialiser());
    await saisir(page, 'eval_erreurs_c3', '21', 'input');
    // L'évènement que le navigateur émet avant de recharger (travaux-annotation.js l'écoute).
    const e = await page.evaluate(() => {
        window.dispatchEvent(new Event('beforeunload'));
        return (window.db.getSync(cle('evaluationsSauvegardees'), []) || []).find((x) => x.id === 'EVC');
    });
    expect(e.donneesAlgorithmiques.c3.erreurs).toBe(21);
    expect(erreurs).toEqual([]);
});

test('lot C (d) · un chargement par la copie n\'écrit rien, même sur une évaluation « IA » aux champs algorithmiques', async ({ page }) => {
    test.setTimeout(90000);
    const erreurs = brancherEcouteurs(page);
    const semee = evaluationSemee({ statutIntegrite: 'ia', notesIntegrite: 'Note d\'intégrité' });
    await semer(page, semee);
    const avant = JSON.stringify(await base(page));
    await ouvrirParLaCopie(page, '1234567');
    await attendreCopieChargee(page);
    await page.waitForTimeout(2000);   // au-delà du délai de 1,5 s
    expect(await base(page), 'la base est intacte après l\'ouverture').toEqual(JSON.parse(avant));
    expect(await page.evaluate(() => window.__enregistres), 'aucune écriture').toBe(0);
    expect(erreurs).toEqual([]);
});

test('lot C (b) · le cadenas passe par la porte de « Verrouiller l\'évaluation » : sans échelle résolue, refusé par les deux', async ({ page }) => {
    test.setTimeout(90000);
    const erreurs = brancherEcouteurs(page);
    await semer(page, evaluationSemee({ echelleId: 'ECHELLE_ABSENTE' }));
    await ouvrirParLaCopie(page, '1234567');
    await attendreCopieChargee(page);
    // L'échelle introuvable reste celle de l'évaluation (#697) : rien ne la résout.
    await page.evaluate(() => { document.getElementById('selectEchelle1').value = 'ECHELLE_ABSENTE'; if (window.evaluationEnCours) window.evaluationEnCours.echelleId = 'ECHELLE_ABSENTE'; });

    for (const bouton of ['btnVerrouPalette', 'btnVerrouillerEvaluation']) {
        const r = await page.evaluate((bouton) => {
            window.__messages = [];
            document.getElementById(bouton).click();
            return window.__messages.slice();
        }, bouton);
        expect(r.filter((m) => m.startsWith('erreur:Échelle introuvable')), `${bouton} : refus nommé`).toHaveLength(1);
        expect(r.filter((m) => m.startsWith('succes:')), `${bouton} : aucun succès`).toEqual([]);
        expect((await evc(page)).verrouillee, `${bouton} : non verrouillée`).toBe(false);
    }
    expect(erreurs).toEqual([]);
});

test('lot C (b)(c) · verrouiller par le cadenas, un seul message ; déverrouiller par le bouton ; la note retire puis remet l\'évaluation', async ({ page }) => {
    test.setTimeout(90000);
    const erreurs = brancherEcouteurs(page);
    await semer(page, evaluationSemee());
    await ouvrirParLaCopie(page, '1234567');
    await attendreCopieChargee(page);
    const compte = () => page.evaluate(() => window.evaluationEntreDansLaNote(
        (window.db.getSync(cle('evaluationsSauvegardees'), []) || []).find((e) => e.id === 'EVC')));
    expect(await compte(), 'non verrouillée : hors de la note').toBe(false);

    const etat = () => page.evaluate(() => ({
        bouton: document.getElementById('btnVerrouillerEvaluation').textContent.trim(),
        boutonEteint: document.getElementById('btnVerrouillerEvaluation').disabled,
        cadenas: document.getElementById('btnVerrouPalette').title
    }));
    expect(await etat()).toEqual({ bouton: 'Verrouiller l\'évaluation', boutonEteint: false, cadenas: 'Non verrouillée – clique pour verrouiller' });

    const cliquer = (id) => page.evaluate((id) => { window.__messages = []; document.getElementById(id).click(); return window.__messages.slice(); }, id);

    const verrou = await cliquer('btnVerrouPalette');
    expect(verrou, 'un seul message pour le verrouillage').toEqual(['succes:Évaluation verrouillée : Daniel Témoin – Portrait témoin']);
    expect((await evc(page)).verrouillee).toBe(true);
    expect(await compte(), 'verrouillée : dans la note').toBe(true);
    expect(await etat()).toEqual({ bouton: 'Déverrouiller l\'évaluation', boutonEteint: false, cadenas: 'Verrouillée – clique pour déverrouiller' });

    const deverrou = await cliquer('btnVerrouillerEvaluation');
    expect(deverrou).toEqual(['succes:Évaluation déverrouillée : Daniel Témoin – Portrait témoin']);
    expect((await evc(page)).verrouillee).toBe(false);
    expect(await compte(), 'déverrouillée : hors de la note').toBe(false);

    const reverrou = await cliquer('btnVerrouillerEvaluation');
    expect(reverrou).toEqual(['succes:Évaluation verrouillée : Daniel Témoin – Portrait témoin']);
    expect(await compte(), 'reverrouillée : dans la note').toBe(true);
    expect((await base(page)).length, 'aucun doublon').toBe(1);
    expect(erreurs).toEqual([]);
});

test('lot C · copie neuve : « IA » posé avant tout niveau s\'enregistre (non verrouillée), et le cadenas ouvert apparaît', async ({ page }) => {
    test.setTimeout(90000);
    const erreurs = brancherEcouteurs(page);
    await semer(page, null);
    await ouvrirParLaCopie(page, '1234567');
    await attendreCopieChargee(page, { idAttendu: null });
    expect(await page.evaluate(() => document.getElementById('btnVerrouPalette').style.display), 'copie neuve : pas de cadenas').toBe('none');

    await saisir(page, 'statutIntegrite', 'ia', 'change');
    await page.waitForTimeout(2000);
    const b = await base(page);
    expect(b).toHaveLength(1);
    expect(b[0]).toMatchObject({ etudiantDA: '1234567', productionId: 'PC', statutIntegrite: 'ia', verrouillee: false });
    expect(await page.evaluate(() => ({
        id: window.evaluationEnCours.idModification,
        cadenas: document.getElementById('btnVerrouPalette').style.display
    }))).toEqual({ id: b[0].id, cadenas: '' });
    expect(erreurs).toEqual([]);
});

// R1 (relecture de Cowork, 27 sept.) — L'ÉVALUATION CRÉÉE EN CHEMIN NE PASSE PAS À L'ÉLÈVE SUIVANT. L'écriture
// en attente part au changement d'élève, quand le menu porte déjà le suivant : son id ne doit pas devenir celui
// de l'écran (`_signalerEvaluationCreeeAutoSave` compare les menus), sinon « Verrouiller l'évaluation » sur le
// suivant verrouillerait l'évaluation du précédent.
for (const cas of [
    { quoi: '« IA » posé', geste: ['statutIntegrite', 'ia', 'change'] },
    { quoi: 'un niveau choisi', geste: ['eval_c1', 'E', 'change'] }
]) {
    test(`lot C · R1 copie neuve, ${cas.quoi}, élève suivant avant 1,5 s : l'id ne suit pas, le verrou du suivant ne touche pas le précédent`, async ({ page }) => {
        test.setTimeout(90000);
        const erreurs = brancherEcouteurs(page);
        await semer(page, null);
        await ouvrirParLaCopie(page, '1234567');
        await attendreCopieChargee(page, { idAttendu: null });

        await saisir(page, ...cas.geste);
        await ouvrirParLaCopie(page, '7654321');
        await attendreCopieChargee(page, { idAttendu: null });

        const premiere = (await base(page)).find((e) => e.etudiantDA === '1234567');
        expect(premiere, 'l\'évaluation du premier est en base').toBeTruthy();
        expect(premiere.verrouillee).toBe(false);
        expect(await page.evaluate(() => (window.evaluationEnCours || {}).idModification), 'l\'écran du second n\'a pas son id')
            .not.toBe(premiere.id);

        await page.evaluate(() => document.getElementById('btnVerrouillerEvaluation').click());
        await page.waitForTimeout(500);
        const apres = (await base(page)).find((e) => e.id === premiere.id);
        expect(apres.verrouillee, 'le verrou du second ne touche pas l\'évaluation du premier').toBe(false);
        expect(apres.etudiantDA).toBe('1234567');
        expect(erreurs.filter((m) => !m.startsWith('dialogue:'))).toEqual([]);
    });
}
