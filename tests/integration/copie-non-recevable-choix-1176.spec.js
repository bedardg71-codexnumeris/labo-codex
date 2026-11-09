import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

// #1176 (9 nov. 2026) — LE SORT D'UNE COPIE NON RECEVABLE SE CHOISIT SUR LA COPIE (décision 1 de Grégoire, 8 nov.).
// Consigne `plans de travail/CONSIGNE-LOT-2026-11-08-copie-non-recevable-choix.md`, § « Preuve exigée » : le choix
// apparaît au marquage, coché selon la règle de la pratique, et se change pour cette copie.
//   · une sommative SANS règle écrite (pratique existante) : « lui mettre 0 » coché ; le geste « l'écarter » s'enregistre
//     avec la copie, et P devient celui d'une copie non remise (95) ; rouverte, la copie montre son choix ;
//   · une pratique dont la règle est « l'écarter » : coché d'avance ; sans geste, rien ne s'écrit sur la copie ;
//   · « Recevable » : le choix disparaît, et part de la copie.
// ⚠ Cloud (nuit du 8 au 9 nov.) : jouée sous Chromium seulement ; le verdict WebKit se prend sur le Mac.
// Noms fictifs.

const T = 't1176';

const MONTER = `({ T, regle }) => {
    const coursId = 'cours-1176';
    const niveaux = [{ code: 'I', nom: 'Incomplet', min: 0, max: 59, valeurCalcul: 40 }, { code: 'D', nom: 'en Développement', min: 60, max: 74, valeurCalcul: 60 },
        { code: 'M', nom: 'Maîtrisé', min: 75, max: 89, valeurCalcul: 80 }, { code: 'E', nom: 'Étendu', min: 90, max: 100, valeurCalcul: 95 }];
    // security-ok: fixtures littérales du banc, aucune source externe.
    window.db.setSync('trimestres', [{ id: T, nom: 'Trimestre témoin', annee: 2026, session: 'A', actif: true }]);
    window.db.setSync('cours', [{ id: coursId, codeCours: 'FIC176', titre: 'Cours fictif' }]);
    const configuration = { approcheEvaluation: 'sommative' };
    if (regle) configuration.sortCopieNonRecevable = regle;
    window.db.setSync(T + '_pratiquesConfigurables', [{ id: 'som-1176', nom: 'Sommative témoin', type: 'sommative', dansBibliotheque: true,   // security-ok: fixture littérale du banc
        calcul_note: { methode: 'moyenne_ponderee' }, configuration }]);
    window.db.setSync(T + '_groupesCours', [{ id: 'GC1176', trimestreId: T, coursId, groupeNum: '01', pratiqueId: 'som-1176', actif: true }]);
    window.db.setSync(T + '_groupeEtudiants', [{ da: '1176001', nom: 'Fictif', prenom: 'Élève', groupe: '01', coursId, groupeCoursId: 'GC1176' }]);   // security-ok: fixture littérale du banc
    window.db.setSync(T + '_productions', [   // security-ok: fixture littérale du banc
        { id: 'P1', titre: 'Dissertation fictive', type: 'travail', ponderation: 40, grilleId: 'G1176', echelleId: 'E1176', groupeCoursId: 'GC1176' },
        { id: 'P2', titre: 'Examen fictif', type: 'examen', ponderation: 60, grilleId: 'G1176', echelleId: 'E1176', groupeCoursId: 'GC1176' }]);
    window.db.setSync(T + '_grillesTemplates', [{ id: 'G1176', nom: 'Grille témoin', criteres: [{ id: 'c1', nom: 'Analyse', ponderation: 50 }, { id: 'c2', nom: 'Structure', ponderation: 50 }] }]);   // security-ok: fixture littérale du banc
    window.db.setSync(T + '_echellesTemplates', [{ id: 'E1176', nom: 'IDME', niveaux }]);   // security-ok: fixture littérale du banc
    const copie = (id, productionId, n1, n2, note, verrouillee) => ({
        id, etudiantDA: '1176001', productionId, groupeCoursId: 'GC1176', grilleId: 'G1176', echelleId: 'E1176',
        statutRemise: 'evalue', statutIntegrite: 'recevable', dateEvaluation: '2026-10-20T08:00:00.000Z', noteFinale: note, niveauFinal: 'M', verrouillee,
        ponderationCouverte: 100,
        criteres: [{ critereId: 'c1', critereNom: 'Analyse', niveauSelectionne: n1, ponderation: 50, retroaction: '' },
                   { critereId: 'c2', critereNom: 'Structure', niveauSelectionne: n2, ponderation: 50, retroaction: '' }],
        retroactionFinale: 'Rétroaction fictive.' });
    window.db.setSync(T + '_evaluationsSauvegardees', [copie('EV1', 'P1', 'E', 'M', 87.5, false), copie('EV2', 'P2', 'E', 'E', 95, true)]);   // security-ok: fixture littérale du banc
    window.trimestreActif = T;
    window.db.setSync('trimestreActif', T);
    window.db.setSync('infoCours', { id: coursId, codeCours: 'FIC176', groupe: '01', _groupeCoursId: 'GC1176' });   // security-ok: fixture littérale du banc
    window.db.setSync('groupeCoursActif', { id: 'GC1176', trimestreId: T });
}`;

const copieEnBase = (page) => page.evaluate((t) => (window.db.getSync(t + '_evaluationsSauvegardees', []) || []).find(e => e.id === 'EV1'), T);

async function ouvrir(page, regle) {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(indexHtml);
    await page.waitForFunction(() => window.dbReady === true && typeof window.modifierEvaluation === 'function'
        && typeof window.calculerEtStockerIndicesCP === 'function' && typeof window.afficherChoixCopieNonRecevable === 'function', null, { timeout: 20000 });
    // Le rappel de sauvegarde s'ouvre 1,5 s après le chargement et couvre l'écran : reporté avant qu'il ne parte.
    await page.evaluate(() => window.backupReminder && window.backupReminder.definirProchainRappel(30));
    await page.evaluate('(' + MONTER + ')(' + JSON.stringify({ T, regle }) + ')');
    await page.evaluate(() => { window.afficherSection('evaluations'); window.modifierEvaluation('EV1'); });
    await attendreRepos(page);
    // Le rappel de sauvegarde couvre l'écran au démarrage (les autres specs à clic le retirent de même).
    await page.evaluate(() => { document.getElementById('overlay-backup-reminder')?.remove(); document.getElementById('transition-bandeau')?.remove(); });
}

async function attendreRepos(page) {
    await page.waitForFunction(() => window.evaluationEnCours && window.evaluationEnCours.idModification === 'EV1'
        && (document.getElementById('selectProduction1') || {}).value === 'P1' && typeof window.noteCalculeeCourante === 'number'
        && !window._timerAutoSave && !window._modifierEvaluationEnCours && window._autoSaveSuspendu !== true, null, { timeout: 20000 });
}

/** Attend que la copie en base porte ces valeurs (l'auto-sauvegarde écrit après son délai). La CSP interdit `new Function`. */
const attendreCopie = (page, attendu) => page.waitForFunction(({ t, attendu }) => {
    const e = (window.db.getSync(t + '_evaluationsSauvegardees', []) || []).find(x => x.id === 'EV1');
    return !!e && Object.entries(attendu).every(([k, v]) => e[k] === v);
}, { t: T, attendu }, { timeout: 15000 });

/** Attend que le bloc du choix soit montré (ou caché). */
const attendreBloc = (page, visible) => page.waitForFunction((v) => {
    const b = document.getElementById('divSortNonRecevable');
    return !!b && (b.offsetParent !== null && !b.classList.contains('u-hide')) === v;
}, visible, { timeout: 15000 });

const poserStatut = (page, statut) => page.evaluate((v) => {
    const s = document.getElementById('statutIntegrite');
    s.value = v;
    s.dispatchEvent(new Event('change', { bubbles: true }));
}, statut);

/** Ce que l'écran montre du choix : visible, coché, les mots, le choix porté par la copie. */
const choixVu = (page) => page.evaluate(() => {
    const bloc = document.getElementById('divSortNonRecevable');
    const txt = (id) => (document.getElementById(id) || {}).textContent || '';
    return {
        visible: !!bloc && bloc.offsetParent !== null && !bloc.classList.contains('u-hide'),
        coche: document.getElementById('sortNonRecevableEcarter').checked ? 'ecarter' : (document.getElementById('sortNonRecevableZero').checked ? 'zero' : null),
        ecarter: txt('libelleSortNonRecevableEcarter'), zero: txt('libelleSortNonRecevableZero'), aide: txt('aideSortNonRecevable'),
        choixCopie: bloc ? bloc.getAttribute('data-choix-copie') : null
    };
});

test('sommative sans règle écrite : « lui mettre 0 » coché au marquage ; le geste « l\'écarter » voyage avec la copie, P = 95', async ({ page }) => {
    test.setTimeout(120000);
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    page.on('dialog', (d) => { erreurs.push('DIALOGUE : ' + d.message()); d.dismiss().catch(() => {}); });
    await ouvrir(page, null);

    expect((await choixVu(page)).visible, 'recevable : aucun choix à montrer').toBe(false);
    await poserStatut(page, 'plagiat');
    await attendreBloc(page, true);
    const vu = await choixVu(page);
    // eslint-disable-next-line no-console
    console.log('1176 · au marquage :', JSON.stringify(vu));
    expect(vu).toMatchObject({ visible: true, coche: 'zero', choixCopie: '' });
    expect(vu.ecarter).toContain('n\'entre pas dans la moyenne');
    expect(vu.zero).toContain('compte pour 0 dans la moyenne');
    expect(vu.aide).toContain('lui mettre 0');

    // Le geste : un clic sur « l'écarter », comme à l'écran (cible de 44 px).
    await page.click('#sortNonRecevableEcarter');
    expect(await choixVu(page)).toMatchObject({ coche: 'ecarter', choixCopie: 'ecarter' });
    // Le geste s'enregistre tout seul (auto-sauvegarde), avec le statut.
    await attendreCopie(page, { sortCopieNonRecevable: 'ecarter', statutIntegrite: 'plagiat' });
    const hauteur = await page.evaluate(() => document.getElementById('sortNonRecevableEcarter').closest('label').getBoundingClientRect().height);
    expect(hauteur, 'cible tactile ≥ 44 px').toBeGreaterThanOrEqual(44);

    // Verrouiller : la copie porte son statut ET son choix ; P suit la copie écartée (comme non remise) : 95.
    await page.evaluate(() => window.basculerVerrouillageEvaluationCourante());
    await attendreCopie(page, { verrouillee: true });
    const base = await copieEnBase(page);
    expect({ statut: base.statutIntegrite, choix: base.sortCopieNonRecevable, verrouillee: base.verrouillee, note: base.noteFinale })
        .toEqual({ statut: 'plagiat', choix: 'ecarter', verrouillee: true, note: 87.5 });
    const P = await page.evaluate((t) => { window.calculerEtStockerIndicesCP(); return window.db.getSync(t + '_indicesCP', {})['1176001'].actuel.P; }, T);
    expect(P, '(95 × 60) / 60 : la copie écartée sort, comme une copie non remise').toBe(95);

    // Rouverte APRÈS UN RECHARGEMENT (l'écran repart de rien) : la copie montre SON choix, pas la règle de la pratique.
    await page.reload();
    await page.waitForFunction(() => window.dbReady === true && typeof window.modifierEvaluation === 'function'
        && typeof window.afficherChoixCopieNonRecevable === 'function', null, { timeout: 20000 });
    await page.evaluate(() => { window.afficherSection('evaluations'); window.modifierEvaluation('EV1'); });
    await attendreRepos(page);
    expect(await choixVu(page)).toMatchObject({ visible: true, coche: 'ecarter', choixCopie: 'ecarter' });
    expect((await copieEnBase(page)).sortCopieNonRecevable, 'rouvrir ne l\'efface pas').toBe('ecarter');
    expect(erreurs).toEqual([]);
});

test('règle « l\'écarter » : cochée d\'avance au marquage ; sans geste, rien ne s\'écrit sur la copie ; « Recevable » retire le choix', async ({ page }) => {
    test.setTimeout(120000);
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    page.on('dialog', (d) => { erreurs.push('DIALOGUE : ' + d.message()); d.dismiss().catch(() => {}); });
    await ouvrir(page, 'ecarter');

    await poserStatut(page, 'ia');
    await attendreBloc(page, true);
    expect(await choixVu(page)).toMatchObject({ visible: true, coche: 'ecarter', choixCopie: '' });
    expect((await choixVu(page)).aide).toContain('l\'écarter');
    await attendreCopie(page, { statutIntegrite: 'ia' });
    const base = await copieEnBase(page);
    expect(base.statutIntegrite, 'l\'intégrité s\'enregistre toute seule (lot C)').toBe('ia');
    expect('sortCopieNonRecevable' in base, 'aucun geste : la copie suit la règle, aucun champ').toBe(false);

    // Un choix, puis « Recevable » : le bloc se cache et le choix part de la copie.
    await page.click('#sortNonRecevableZero');
    await attendreCopie(page, { sortCopieNonRecevable: 'zero' });
    await poserStatut(page, 'recevable');
    await attendreBloc(page, false);
    await attendreCopie(page, { statutIntegrite: 'recevable' });
    const apres = await copieEnBase(page);
    expect([apres.statutIntegrite, 'sortCopieNonRecevable' in apres]).toEqual(['recevable', false]);
    expect(erreurs).toEqual([]);
});

test('réglages de la pratique : la règle se lit cochée ; un autre champ ne l\'écrit pas ; le geste l\'écrit, et la copie la suit', async ({ page }) => {
    test.setTimeout(120000);
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    page.on('dialog', (d) => { erreurs.push('DIALOGUE : ' + d.message()); d.dismiss().catch(() => {}); });
    await ouvrir(page, null);
    const pratiqueEnBase = () => page.evaluate((t) => (window.db.getSync(t + '_pratiquesConfigurables', []) || []).find(p => p.id === 'som-1176'), T);

    // Le lien « Réglages de la pratique » : Conception → Pratiques de notation → la pratique.
    await page.evaluate(() => window.ouvrirReglagesPratique('som-1176'));
    await page.waitForFunction(() => {
        const g = document.getElementById('mat-sort-non-recevable');
        return !!g && g.offsetParent !== null && (document.getElementById('mat-pratique-nom') || {}).value === 'Sommative témoin';
    }, null, { timeout: 15000 });
    await page.evaluate(() => { document.getElementById('overlay-backup-reminder')?.remove(); document.getElementById('transition-bandeau')?.remove(); });
    const lu = () => page.evaluate(() => ({
        visible: document.getElementById('mat-sort-non-recevable').offsetParent !== null,
        ecarter: document.getElementById('mat-sort-non-recevable-ecarter').checked,
        zero: document.getElementById('mat-sort-non-recevable-zero').checked
    }));
    expect(await lu(), 'sommative sans règle écrite : lue « lui mettre 0 »').toEqual({ visible: true, ecarter: false, zero: true });

    // Un AUTRE champ du formulaire s'enregistre : la règle lue ne s'écrit pas (décision 5 : la lecture n'est pas une écriture).
    await page.click('#mat-notes-finales');
    await page.waitForFunction((t) => ((window.db.getSync(t + '_pratiquesConfigurables', []) || [])[0] || {}).configuration?.notesFinales === true, T, { timeout: 15000 });
    const apresAutre = await pratiqueEnBase();
    expect(apresAutre.configuration.notesFinales, 'l\'autre champ s\'est bien enregistré').toBe(true);
    expect(apresAutre.configuration).not.toHaveProperty('sortCopieNonRecevable');

    // Le geste sur la règle l'écrit.
    await page.click('#mat-sort-non-recevable-ecarter');
    await page.waitForFunction((t) => ((window.db.getSync(t + '_pratiquesConfigurables', []) || [])[0] || {}).configuration?.sortCopieNonRecevable === 'ecarter', T, { timeout: 15000 });

    // La copie marquée sans choix suit la règle de sa pratique : P = 95, comme si elle n'avait pas été remise.
    await page.evaluate((t) => {
        const cleE = t + '_evaluationsSauvegardees';
        const l = window.db.getSync(cleE, []);
        l.find(e => e.id === 'EV1').statutIntegrite = 'plagiat';
        window.db.setSync(cleE, l);   // security-ok: fixture du banc
    }, T);
    const P = await page.evaluate((t) => { window.calculerEtStockerIndicesCP(); return window.db.getSync(t + '_indicesCP', {})['1176001'].actuel.P; }, T);
    expect(P).toBe(95);
    expect(erreurs).toEqual([]);
});
