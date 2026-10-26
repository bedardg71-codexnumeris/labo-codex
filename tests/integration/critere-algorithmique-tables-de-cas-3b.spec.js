import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

// LA TABLE DE CAS, LOT 3b (26 oct. 2026), dans un vrai WebKit, contre le vrai index.html. Consigne
// `plans de travail/CONSIGNE-LOT-2026-10-26-critere-algorithmique-table-de-cas-3b.md`, § 7 ; ébauche validée
// `plans de travail/EBAUCHE-2026-10-26-table-de-cas.html` (`tableEnseignant`). Deux disciplines fictives : « unités
// manquantes » sur « calculs », « erreurs » sur « mots ».
//   · ajouter une table, changer « Selon » (six valeurs, « La part » désactivée sans limite), écrire un texte avec un
//     bloc de la palette, ajouter et retirer un cas, « Voir ce que l'étudiant·e lirait dans ce cas », la simulation ;
//   · « Retirer cette table » : vide, tout de suite ; avec un texte, la carte demande (jamais `confirm()`) ; changer la
//     valeur d'une table écrite demande aussi ;
//   · une VRAIE copie évaluée, mode simple, codes posés dans Annoter : la phrase sous le critère, la mémoire de
//     l'évaluation et le PDF de l'étudiant·e portent le texte des cas atteints ;
//   · 1 440, 1 180, 820 et 700 px : aucun défilement de côté, deux colonnes ou empilées ;
//   · captures (CAPTURES_TABLES_3B=<dossier>) : 1 440, 1 180, 820 px, clair et sombre, une table de chaque sorte
//     (compte, code), sur les deux disciplines.
// ⛔ Aucun `waitForTimeout`.

const SEMER = `async (avecTables) => {
    db.setSync('trimestres', [{ id: 'a2026', nom: 'Automne 2026', annee: 2026, session: 'A', actif: true }]);
    db.setSync('trimestreActif', 'a2026');
    db.setSync('backupNePlusRappeler', 'true');
    const sc = (noms) => noms.map((nom, i) => ({ id: 's' + (i + 1), code: String(i + 1), nom: nom, ponderation: 1 }));
    const tables = (texteCompte, texteCode) => avecTables ? { tablesCas: [
        { id: 't1', selon: 'erreurs', cas: [{ genre: 'zero', texte: 'Aucune : rien à reprendre.' }, { genre: 'max', borne: 2, texte: texteCompte }, { genre: 'audela', texte: '' }] },
        { id: 't2', selon: 'code', cas: [{ genre: 'code', code: '1', texte: texteCode }, { genre: 'code', code: '2', texte: '' }, { genre: 'code', code: '3', texte: '' }, { genre: 'aucun', texte: '' }] }
    ] } : {};
    // security-ok: fixtures littérales écrites par le spec, aucune source externe.
    await db.set(cle('grillesTemplates'), [
        { id: 'GC', nom: 'Laboratoire fictif', dansBibliotheque: true, criteres: [Object.assign(
            { id: 'CC', nom: 'Unités et calculs', type: 'algorithmique', ponderation: 20, nomsAttendus: true, codesSousCriteresSeulement: true,
              noms: { erreurs: { singulier: 'unité manquante', pluriel: 'unités manquantes' }, mots: { singulier: 'calcul', pluriel: 'calculs' } },
              sousCriteres: sc(['Unité absente', 'Unité erronée', 'Chiffres significatifs']),
              modeleFormule: 'penalite_par_erreur', modeleProjection: 'aucune', paramsProjection: {} },
            tables('Peu : {erreurs} {nomErreurs}.', 'Écris l’unité de chaque résultat.')) ] },
        { id: 'GM', nom: 'Rédaction fictive', dansBibliotheque: true, criteres: [Object.assign(
            { id: 'CM', nom: 'Langue écrite', type: 'algorithmique', ponderation: 20, nomsAttendus: true, codesSousCriteresSeulement: true,
              noms: { erreurs: { singulier: 'erreur', pluriel: 'erreurs' }, mots: { singulier: 'mot', pluriel: 'mots' } },
              sousCriteres: sc(['Syntaxe', 'Ponctuation', 'Lexique']),
              modeleFormule: 'penalite_normalisee', paramsFormule: { facteurNormalisation: 500 },
              modeleProjection: 'norme_externe', paramsProjection: { motsReference: 900, erreursTolerees: 30, nomServiceAide: 'Atelier fictif', libelleSignalement: 'Revoir la langue', lienServiceAide: '' },
              paliersProjection: window.projectionAlgo.paliersGabaritNeuf() },
            tables('Une ou deux : relis-toi.', 'Revois la construction de tes phrases.')) ] }
    ]);
    window.afficherSection('conception');
    window.afficherSousSection('conception-grille-criteres');
}`;

async function ouvrir(page, grilleId, largeur, hauteur, avecTables) {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    page.on('dialog', (d) => { erreurs.push('DIALOGUE : ' + d.message()); d.dismiss().catch(() => {}); });
    await page.setViewportSize({ width: largeur || 1440, height: hauteur || 900 });
    await page.goto(indexHtml);
    await page.waitForFunction(() => window.dbReady === true && window.atelierAlgo && window.tablesCasAlgo, null, { timeout: 20000 });
    await page.evaluate(eval(SEMER), !!avecTables);
    await page.evaluate((id) => window.chargerGrillePourModif(id), grilleId);
    return erreurs;
}

const atelier = (page, id) => page.locator(`#listeCriteres .gabarit-algo[data-critere-id="${id}"]`);
const etape = (page, id, e) => atelier(page, id).locator(`.atelier-algo-etape[data-etape="${e}"]`);
const apercu = (page, id) => atelier(page, id).locator('.apercu-algo');
const cartes = (page, id) => atelier(page, id).locator('.table-cas--enseignant');
const carte = (page, id, n) => cartes(page, id).nth(n || 0);
const rangeesDe = (c) => c.locator('.table-cas-rangee');
const cliquerDom = (loc) => loc.evaluate((el) => el.click());
const changer = (loc, valeur) => loc.evaluate((el, v) => { el.value = v; el.dispatchEvent(new Event('change', { bubbles: true })); }, valeur);
const enBase = (page, g) => page.evaluate(async (id) => ((await db.get(cle('grillesTemplates'))) || []).find((x) => x.id === id).criteres[0], g);
const ouvrirCas = async (page, id) => {
    await cliquerDom(atelier(page, id).locator('.atelier-algo-chaine .bc-etape[data-etape="paliers"]'));
    await expect(etape(page, id, 'paliers')).toHaveAttribute('data-ouverte', '');
};
const quand = (c) => rangeesDe(c).locator('.table-cas-quand').evaluateAll((els) => els.map((e) => e.innerText.replace(/\s+/g, ' ').trim()));
const debord = (page) => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
const actif = (page) => page.evaluate(() => document.activeElement && document.activeElement.id);

test('calculs · ajouter une table, changer « Selon », un texte avec un bloc, ajouter et retirer un cas, la simulation', async ({ page }) => {
    const erreurs = await ouvrir(page, 'GC', 1440, 1000);
    await ouvrirCas(page, 'CC');
    const cas = etape(page, 'CC', 'paliers');
    await expect(cartes(page, 'CC')).toHaveCount(0);
    await expect(cas.locator('.choix-app dd').first()).toContainText('Pour lui écrire un texte par code, ajoute une table selon « Le code le plus fréquent ».');

    // « + Ajouter une table de cas » : selon le compte, vide ; le focus va à son menu « Selon ».
    await cliquerDom(cas.locator('[data-action="ajouterTableCasAlgo"]'));
    await expect(cartes(page, 'CC')).toHaveCount(1);
    expect(await actif(page)).toBe('tcas-GC-0-t1-selon');
    const c = carte(page, 'CC');
    await expect(c.locator('.table-cas-titre')).toHaveText('Table de cas');
    await expect(c.locator('.table-cas-ou')).toHaveText('L’étudiant·e lit le cas de sa copie sous le critère, après les paliers. Une table neuve naît vide : un cas laissé vide n’ajoute rien à ce que lit l’étudiant·e.');
    await expect(c.locator('.table-cas-entete span')).toHaveText(['Quand', 'L’étudiant·e lit']);
    const options = await c.locator('select option').evaluateAll((els) => els.map((o) => [o.value, o.textContent, o.disabled]));
    expect(options).toEqual([['erreurs', 'Le compte des unités manquantes', false], ['mots', 'Le compte des calculs', false], ['note', 'La note du critère', false],
        ['part', 'La part de la limite (aucune limite)', true], ['moyenne', 'La moyenne de calculs par unité manquante', false], ['code', 'Le code le plus fréquent', false]]);
    expect(await quand(c)).toEqual(['0', 'Jusqu’à Retirer ce cas', 'Au-delà de 2']);
    await expect(c.locator('textarea').first()).toHaveAttribute('placeholder', 'Vide : ce cas n’ajoute rien.');
    expect((await enBase(page, 'GC')).tablesCas).toEqual([{ id: 't1', selon: 'erreurs', cas: [{ genre: 'zero', texte: '' }, { genre: 'max', borne: 2, texte: '' }, { genre: 'audela', texte: '' }] }]);
    await expect(atelier(page, 'CC').locator('.bc-etape[data-etape="paliers"] .bc-info')).toHaveText('1 table');
    await expect(cas.locator('[data-resume]')).toHaveText('Aucune limite, aucun palier · une table selon le compte des unités manquantes');

    // Changer de valeur (aucun texte écrit) : les cas de la nouvelle, sans rien demander.
    await changer(c.locator('select'), 'note');
    await expect.poll(async () => (await enBase(page, 'GC')).tablesCas[0].selon).toBe('note');
    expect(await quand(carte(page, 'CC'))).toEqual(['Sans valeur aucune note calculable', '0 / 20', 'Jusqu’à / 20 Retirer ce cas', 'Au-delà de 10 / 20']);
    await changer(carte(page, 'CC').locator('select'), 'code');
    await expect.poll(async () => (await enBase(page, 'GC')).tablesCas[0].selon).toBe('code');
    expect(await quand(carte(page, 'CC'))).toEqual(['Code 1 Unité absente', 'Code 2 Unité erronée', 'Code 3 Chiffres significatifs', 'Aucun code']);
    await expect(carte(page, 'CC').locator('.table-cas-corps > .table-cas-petit')).toHaveText('À égalité, le premier de ta liste des codes.');
    await expect(carte(page, 'CC').locator('[data-action="ajouterCasTableAlgo"]')).toHaveCount(0);
    await changer(carte(page, 'CC').locator('select'), 'erreurs');
    await expect.poll(async () => (await enBase(page, 'GC')).tablesCas[0].selon).toBe('erreurs');

    // Un bloc de la palette dans le texte du cas « jusqu'à 2 » : la zone le reçoit, la palette nomme la zone.
    const zone = carte(page, 'CC').locator('textarea[data-cas="1"]');
    const vue = zone.locator('xpath=following-sibling::*[1]');
    await vue.evaluate((el) => { el.focus(); window.composeurBadges.placerCaret(el, 0); });
    await expect(atelier(page, 'CC').locator('.palette-algo-cible')).toHaveText('Zone choisie : Table selon le compte des unités manquantes, cas jusqu’à 2');
    await cliquerDom(atelier(page, 'CC').locator('.palette-algo-bloc[data-jeton="{erreurs}"]'));
    await expect.poll(async () => (await enBase(page, 'GC')).tablesCas[0].cas[1].texte).toBe('{erreurs}');
    await changer(carte(page, 'CC').locator('textarea[data-cas="1"]'), 'Peu : {erreurs} {nomErreurs}.');
    await expect.poll(async () => (await enBase(page, 'GC')).tablesCas[0].cas[1].texte).toBe('Peu : {erreurs} {nomErreurs}.');

    // « Voir ce que l'étudiant·e lirait dans ce cas » : la copie réglée, la rangée marquée, le texte avec sa source.
    await cliquerDom(carte(page, 'CC').locator('.table-cas-rangee').nth(1).locator('[data-apercu-geste="cas"]'));
    // La copie fictive de ce critère n'a pas d'étendue (sa formule n'en demande pas) : le message ne dit pas « pour 0 calcul ».
    await expect(apercu(page, 'CC').locator('.apercu-algo-flash')).toHaveText('Copie réglée : 1 unité manquante.');
    await expect(carte(page, 'CC').locator('.table-cas-rangee').nth(1)).toHaveAttribute('data-atteint', '');
    await expect(carte(page, 'CC').locator('.table-cas-rangee').nth(1).locator('[data-cas-ici]')).toBeVisible();
    const segment = apercu(page, 'CC').locator('[data-lecture="pdf"] .apercu-algo-segment').last();
    await expect(segment.locator('.apercu-algo-source')).toHaveText('Table · jusqu’à 2');
    await expect(segment).toContainText('Peu : 1 unité manquante.');
    await cliquerDom(carte(page, 'CC').locator('.table-cas-rangee').nth(0).locator('[data-apercu-geste="cas"]'));
    await expect(carte(page, 'CC').locator('.table-cas-rangee').nth(0)).toHaveAttribute('data-atteint', '');
    await expect(apercu(page, 'CC').locator('[data-lecture="pdf"]')).not.toContainText('Peu :');   // « 0 » n'a pas de texte : rien

    // « + Ajouter un cas » : une borne au-dessus de la dernière, son champ a le focus ; la borne ; « Retirer ce cas ».
    await cliquerDom(carte(page, 'CC').locator('[data-action="ajouterCasTableAlgo"]'));
    await expect(rangeesDe(carte(page, 'CC'))).toHaveCount(4);
    expect(await actif(page)).toBe('tcas-GC-0-t1-borne-2');
    await expect(carte(page, 'CC').locator('#tcas-GC-0-t1-borne-2')).toHaveValue('4');
    await changer(carte(page, 'CC').locator('#tcas-GC-0-t1-borne-2'), '5,5');
    await expect.poll(async () => (await enBase(page, 'GC')).tablesCas[0].cas[2].borne).toBe(5.5);
    expect(await quand(carte(page, 'CC'))).toEqual(['0', 'Jusqu’à Retirer ce cas', 'Jusqu’à Retirer ce cas', 'Au-delà de 5,5']);
    await changer(carte(page, 'CC').locator('#tcas-GC-0-t1-borne-2'), 'cinq');
    await expect.poll(async () => (await enBase(page, 'GC')).tablesCas[0].cas[2].borne).toBe(5.5);   // refusée, rien n'est écrit
    await cliquerDom(carte(page, 'CC').locator('.table-cas-rangee').nth(2).locator('[data-action="retirerCasTableAlgo"]'));
    await expect(rangeesDe(carte(page, 'CC'))).toHaveCount(3);
    expect((await enBase(page, 'GC')).tablesCas[0].cas.map((x) => x.genre)).toEqual(['zero', 'max', 'audela']);
    expect(erreurs).toEqual([]);
});

test('mots · « Retirer cette table » : vide, tout de suite ; écrite, la carte demande ; changer la valeur d’une table écrite aussi', async ({ page }) => {
    const erreurs = await ouvrir(page, 'GM', 1440, 1000);
    await ouvrirCas(page, 'CM');
    const cas = etape(page, 'CM', 'paliers');
    await cliquerDom(cas.locator('[data-action="ajouterTableCasAlgo"]'));
    await expect(carte(page, 'CM').locator('select option[value="part"]')).toHaveText('La part de la limite');   // la limite est fixée
    await cliquerDom(carte(page, 'CM').locator('[data-action="retirerTableCasAlgo"]'));
    await expect(cartes(page, 'CM')).toHaveCount(0);
    expect(await enBase(page, 'GM')).not.toHaveProperty('tablesCas');

    // Écrite : la carte demande, « Annuler » garde tout, « Retirer » l'enlève.
    await cliquerDom(cas.locator('[data-action="ajouterTableCasAlgo"]'));
    await changer(carte(page, 'CM').locator('textarea[data-cas="0"]'), 'Aucune erreur : bravo.');
    await expect.poll(async () => (await enBase(page, 'GM')).tablesCas[0].cas[0].texte).toBe('Aucune erreur : bravo.');
    await cliquerDom(carte(page, 'CM').locator('[data-action="retirerTableCasAlgo"]'));
    await expect(carte(page, 'CM').locator('.table-cas-confirmer p')).toHaveText('Retirer cette table et ses textes ?');
    expect(await actif(page)).toBe('tcas-GM-0-t1-confirmer');
    await cliquerDom(carte(page, 'CM').locator('[data-action="annulerTableCasAlgo"]'));
    await expect(carte(page, 'CM').locator('.table-cas-confirmer')).toHaveCount(0);
    expect((await enBase(page, 'GM')).tablesCas[0].cas[0].texte).toBe('Aucune erreur : bravo.');
    await cliquerDom(carte(page, 'CM').locator('[data-action="retirerTableCasAlgo"]'));
    await cliquerDom(carte(page, 'CM').locator('[data-action="confirmerTableCasAlgo"]'));
    await expect(cartes(page, 'CM')).toHaveCount(0);
    expect(await enBase(page, 'GM')).not.toHaveProperty('tablesCas');

    // Changer la valeur d'une table écrite : la carte demande ; « Annuler » garde la valeur et le texte.
    await cliquerDom(cas.locator('[data-action="ajouterTableCasAlgo"]'));
    await changer(carte(page, 'CM').locator('textarea[data-cas="0"]'), 'Aucune erreur : bravo.');
    await expect.poll(async () => (await enBase(page, 'GM')).tablesCas[0].cas[0].texte).toBe('Aucune erreur : bravo.');
    await changer(carte(page, 'CM').locator('select'), 'part');
    await expect(carte(page, 'CM').locator('.table-cas-confirmer p')).toHaveText('Passer à « La part de la limite » remplace les cas de cette table et efface leurs textes ?');
    await expect(carte(page, 'CM').locator('select')).toHaveValue('erreurs');
    await cliquerDom(carte(page, 'CM').locator('[data-action="annulerTableCasAlgo"]'));
    const gardee = (await enBase(page, 'GM')).tablesCas[0];
    expect([gardee.selon, gardee.cas[0].texte]).toEqual(['erreurs', 'Aucune erreur : bravo.']);
    await changer(carte(page, 'CM').locator('select'), 'part');
    await cliquerDom(carte(page, 'CM').locator('[data-action="confirmerTableCasAlgo"]'));
    await expect.poll(async () => (await enBase(page, 'GM')).tablesCas[0].selon).toBe('part');
    expect(await quand(carte(page, 'CM'))).toEqual(['Sans valeur aucune limite, ou rien à rapporter', '0 %', 'Jusqu’à % Retirer ce cas', 'Jusqu’à % Retirer ce cas', 'Au-delà de 100 %']);
    expect((await enBase(page, 'GM')).tablesCas[0].cas.every((x) => x.texte === '')).toBe(true);
    expect(erreurs).toEqual([]);
});

// UNE VRAIE COPIE ÉVALUÉE — le montage de `critere-algorithmique-dit-vrai` (l'évaluation rendue par `cartoucheSelectionnee`,
// la copie ouverte par l'évènement, les codes posés par Annoter), sur une grille dont le critère porte deux tables.
const MONTER_EVAL = `() => {
    const k = (b) => cle(b);
    // security-ok: fixtures littérales écrites par le spec, aucune source externe.
    db.setSync(k('grillesTemplates'), [{ id: 'G_T', nom: 'Grille fictive à tables', dansBibliotheque: true, criteres: [{
        id: 'CR_T', nom: 'Langue écrite', type: 'algorithmique', ponderation: 20, facteurNormalisation: 500, codesDepuisSousCriteres: true,
        sousCriteres: [{ id: 'sc_1', code: '1', nom: 'Syntaxe', ponderation: 1, retroaction: '' }, { id: 'sc_3', code: '3', nom: 'Ponctuation', ponderation: 1, retroaction: '' }],
        tablesCas: [
            { id: 't1', selon: 'code', cas: [{ genre: 'code', code: '1', texte: 'Revois ta syntaxe.' }, { genre: 'code', code: '3', texte: 'Ta ponctuation, d’abord.' }, { genre: 'aucun', texte: '' }] },
            { id: 't2', selon: 'erreurs', cas: [{ genre: 'zero', texte: '' }, { genre: 'max', borne: 5, texte: '' }, { genre: 'audela', texte: 'Plus de cinq : {erreurs} sur {mots}.' }] }
        ] }] }]);
    // security-ok: fixture littérale du spec, aucune source externe.
    db.setSync(k('echellesTemplates'), [{ id: 'ECH_F', nom: 'Échelle fictive', niveaux: [
        { code: 'I', nom: 'Incomplet', min: 0, max: 59 }, { code: 'D', nom: 'en Développement', min: 60, max: 74 },
        { code: 'M', nom: 'Maîtrisé', min: 75, max: 89 }, { code: 'E', nom: 'Étendu', min: 90, max: 100 }] }]);
    // security-ok: fixture littérale du spec, aucune source externe.
    db.setSync(k('cartouches_G_T'), [{ id: 'CART_F', nom: 'Cartouche fictive', criteres: [{ id: 'CR_T' }], niveaux: [{ code: 'M', nom: 'Maîtrisé', min: 75, max: 89 }] }]);
    db.setSync(k('modalitesEvaluation'), { activerCategorisationErreurs: false });
    // security-ok: fixture littérale du spec, aucune source externe.
    db.setSync(k('productions'), [{ id: 'P_T', titre: 'Rédaction fictive', grilleId: 'G_T', echelleId: 'ECH_F', cartoucheId: 'CART_F' }]);
    // security-ok: fixture littérale du spec, aucune source externe.
    db.setSync(k('fichiersTravaux'), [{ id: 'F_T', etudiantDA: 'DA-F', productionId: 'P_T', nomFichier: 'FICTIF.png', typeMIME: 'image/png' }]);
    evaluationEnCours = { etudiantDA: 'DA-F', productionId: 'P_T', grilleId: 'G_T', echelleId: 'ECH_F', cartoucheId: 'CART_F',
        criteres: {}, donneesAlgorithmiques: {}, statutRemise: 'evalue' };
    document.getElementById('selectEchelle1').innerHTML = '<option value="ECH_F">Échelle fictive</option>';
    document.getElementById('remiseProduction1').innerHTML = '<option value="recu">Reçu</option>';
    const selC = document.getElementById('selectCartoucheEval');
    selC.innerHTML = '<option value="CART_F">Cartouche fictive</option>';
    selC.value = 'CART_F';
    cartoucheSelectionnee();
    // La copie ouverte, sept codes posés (3 de syntaxe, puis 4 de ponctuation), 400 mots.
    window.dispatchEvent(new CustomEvent('travaux-fichier-ouvert', { detail: { fichier: { id: 'F_T', productionId: 'P_T' } } }));
    const shapes = [];
    for (let i = 0; i < 3; i++) shapes.push({ type: 'errfr_1', x: i, y: 1 });
    for (let i = 0; i < 4; i++) shapes.push({ type: 'errfr_3', x: i, y: 2 });
    window.travauxAnnotation.getAnnotationCourante = () => ({ id: 'A_T', fichierId: 'F_T', pages: { 1: { shapes } } });
    window.dispatchEvent(new CustomEvent('travaux-annotation-modifiee'));
    const mots = document.getElementById('eval_mots_CR_T');
    mots.value = '400';
    mots.dispatchEvent(new Event('input', { bubbles: true }));
    const memo = JSON.parse(JSON.stringify(evaluationEnCours.donneesAlgorithmiques.CR_T || null));
    const ev = { id: 'EV_F', etudiantDA: 'DA-F', productionId: 'P_T', grilleId: 'G_T', echelleId: 'ECH_F', cartoucheId: 'CART_F',
        statutRemise: 'remis', statutIntegrite: 'recevable', dateEvaluation: '2026-10-26T12:00:00.000Z',
        criteres: [{ critereId: 'CR_T', critereNom: 'Langue écrite', niveauSelectionne: memo && memo.niveau, ponderation: 20, retroaction: memo && memo.retroaction }],
        donneesAlgorithmiques: { CR_T: memo }, noteFinale: memo && memo.pourcentage, niveauFinal: memo && memo.niveau };
    const html = window.syntheseRetroactionRendu.rendreSyntheseHTML(window.syntheseRetroactionData.construireFeedback(ev, { id: 'F_T' }, null));
    return { champ: document.getElementById('eval_erreurs_CR_T').value, sous: document.getElementById('comm_CR_T').textContent, memo, html };
}`;

test('une vraie copie évaluée · codes posés dans Annoter : la phrase sous le critère et le PDF portent le texte des cas atteints', async ({ page }) => {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    await page.goto(indexHtml);
    await page.waitForFunction(() => window.dbReady === true && window.travauxOutils && window.syntheseRetroactionData && window.tablesCasAlgo, null, { timeout: 20000 });
    const r = await page.evaluate('(' + MONTER_EVAL + ')()');
    expect(r.champ).toBe('7');
    // Le code 3 (quatre fois) est le plus fréquent ; 7 erreurs dépasse 5. Après la projection, dans l'ordre des tables.
    expect(r.sous.endsWith(' Ta ponctuation, d’abord. Plus de cinq : 7 sur 400.')).toBe(true);
    expect(r.memo.retroaction).toBe(r.sous);
    expect(r.html).toContain('Ta ponctuation, d’abord. Plus de cinq : 7 sur 400.');
    if (process.env.CAPTURES_TABLES_3B) {
        const p = await page.context().newPage();
        await p.setContent(r.html);
        await p.locator('body').screenshot({ path: path.join(process.env.CAPTURES_TABLES_3B, 'pdf-copie-evaluee.png') });
        await p.close();
    }
    expect(erreurs).toEqual([]);
});

// Deux colonnes tant que la table a la place (au-dessus de 560 px de large), empilées sinon ; aucun défilement de côté.
for (const [largeur, hauteur, empilee] of [[1440, 900, false], [1180, 820, false], [820, 1180, true], [700, 900, true]]) {
    test(`${largeur} px · les tables de l’enseignant·e, sans défilement de côté ; les rangées ${empilee ? 's’empilent' : 'en deux colonnes'}`, async ({ page }) => {
        const erreurs = await ouvrir(page, 'GM', largeur, hauteur, true);
        await ouvrirCas(page, 'CM');
        await expect(cartes(page, 'CM')).toHaveCount(2);
        const r = rangeesDe(carte(page, 'CM')).nth(1);
        await r.scrollIntoViewIfNeeded();
        const colonnes = await r.evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(' ').length);
        expect(colonnes).toBe(empilee ? 1 : 2);
        await expect(carte(page, 'CM').locator('.table-cas-entete')).toBeVisible({ visible: !empilee });
        expect(await debord(page), 'aucun défilement de côté').toBeLessThanOrEqual(0);
        for (const sel of ['[data-apercu-geste="cas"]', '.table-cas-seuil', 'select']) {
            const h = await carte(page, 'CM').locator(sel).first().evaluate((el) => el.getBoundingClientRect().height);
            expect(h, sel).toBeGreaterThanOrEqual(40);
        }
        const ajout = await etape(page, 'CM', 'paliers').locator('[data-action="ajouterTableCasAlgo"]').evaluate((el) => el.getBoundingClientRect().height);
        expect(ajout).toBeGreaterThanOrEqual(40);
        expect(erreurs).toEqual([]);
    });
}

test('captures · 1 440, 1 180, 820 px, clair et sombre, une table de chaque sorte, sur les deux disciplines', async ({ page }) => {
    test.skip(!process.env.CAPTURES_TABLES_3B, 'captures sur demande : CAPTURES_TABLES_3B=<dossier>');
    test.setTimeout(240000);
    const dossier = process.env.CAPTURES_TABLES_3B;
    for (const [g, id, nom] of [['GC', 'CC', 'calculs'], ['GM', 'CM', 'mots']]) {
        for (const [largeur, hauteur] of [[1440, 900], [1180, 820], [820, 1180]]) {
            for (const mode of ['clair', 'sombre']) {
                await ouvrir(page, g, largeur, hauteur, true);
                await page.evaluate((m) => document.body.classList.toggle('mode-clair', m === 'clair'), mode);
                await ouvrirCas(page, id);
                await cliquerDom(rangeesDe(carte(page, id)).nth(1).locator('[data-apercu-geste="cas"]'));
                await carte(page, id).evaluate((el) => { el.scrollIntoView(); window.scrollBy(0, -110); });
                await page.waitForFunction(() => {
                    const a = document.querySelector('#listeCriteres .gabarit-algo');
                    return document.getAnimations().every((x) => x.playState !== 'running' || !x.effect || !x.effect.target
                        || !(x.effect.target.contains(a) || a.contains(x.effect.target)));
                });
                await page.screenshot({ path: path.join(dossier, `tables-${nom}-${largeur}-${mode}.png`) });
            }
        }
    }
});
