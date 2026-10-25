import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// LE CRITÈRE ALGORITHMIQUE FAIT CE QUE SON ÉCRAN DIT (consigne du 21 oct. 2026), dans un vrai WebKit :
//   · une grille fictive à deux poids (Syntaxe 1, Ponctuation 0,5 ; « Aucune erreur » 0), ses codes tirés des
//     sous-critères ; la copie ouverte (`travaux-fichier-ouvert`), sept codes posés (3 de syntaxe, 4 de
//     ponctuation) → « Nombre d'erreurs » dit 7, la note suit 5 ; la phrase et la ligne du PDF disent
//     « 7 erreurs (5 après pondération) » ;
//   · la même grille, poids à 1 : l'évaluation et le PDF sont, à l'octet près, ceux d'un 7 tapé à la main
//     — le chemin d'hier, que ce lot ne touche pas ;
//   · un critère algorithmique en création reçoit ses sous-critères (#1131), rien en base avant « Créer la grille ».
// Les montages : celui de #672 (l'évaluation rendue par `cartoucheSelectionnee`) et celui de la palette
// (`codes-par-grille-palette`, la copie ouverte par l'évènement). Grilles et textes FICTIFS.
// Captures : CAPTURES_ALGO=<dossier> les écrit (PDF pondéré, PDF à poids 1).

const MONTER = `(poidsPonctuation) => {
    const k = (b) => cle(b);
    // security-ok: fixtures littérales écrites par le spec, aucune source externe.
    db.setSync(k('grillesTemplates'), [{ id: 'G_ALGO', nom: 'Grille fictive à deux poids', dansBibliotheque: true, criteres: [{
        id: 'CR_ALGO', nom: 'Français écrit', type: 'algorithmique', ponderation: 20, facteurNormalisation: 500,
        codesDepuisSousCriteres: true, sousCriteres: [
            { id: 'sc_0', code: '0', nom: 'Aucune erreur', ponderation: 0, retroaction: '' },
            { id: 'sc_1', code: '1', nom: 'Syntaxe', ponderation: 1, retroaction: '' },
            { id: 'sc_3', code: '3', nom: 'Ponctuation', ponderation: poidsPonctuation, retroaction: '' }] }] }]);
    // security-ok: fixture littérale du spec, aucune source externe.
    db.setSync(k('echellesTemplates'), [{ id: 'ECH_F', nom: 'Échelle fictive', niveaux: [
        { code: 'I', nom: 'Incomplet', min: 0, max: 59 }, { code: 'D', nom: 'en Développement', min: 60, max: 74 },
        { code: 'M', nom: 'Maîtrisé', min: 75, max: 89 }, { code: 'E', nom: 'Étendu', min: 90, max: 100 }] }]);
    // security-ok: fixture littérale du spec, aucune source externe.
    db.setSync(k('cartouches_G_ALGO'), [{ id: 'CART_F', nom: 'Cartouche fictive', criteres: [{ id: 'CR_ALGO' }], niveaux: [{ code: 'M', nom: 'Maîtrisé', min: 75, max: 89 }] }]);
    db.setSync(k('modalitesEvaluation'), { activerCategorisationErreurs: false });
    // security-ok: fixture littérale du spec, aucune source externe.
    db.setSync(k('productions'), [{ id: 'P_ALGO', titre: 'Dissertation fictive', grilleId: 'G_ALGO', echelleId: 'ECH_F', cartoucheId: 'CART_F' }]);
    // #1142 — la copie annotée existe : le compte des codes n'entre que dans l'évaluation de SA copie.
    // security-ok: fixture littérale du spec, aucune source externe.
    db.setSync(k('fichiersTravaux'), [{ id: 'F_ALGO', etudiantDA: 'DA-F', productionId: 'P_ALGO', nomFichier: 'FICTIF.png', typeMIME: 'image/png' }]);
    evaluationEnCours = { etudiantDA: 'DA-F', productionId: 'P_ALGO', grilleId: 'G_ALGO', echelleId: 'ECH_F', cartoucheId: 'CART_F',
        criteres: {}, donneesAlgorithmiques: {}, statutRemise: 'evalue' };
    document.getElementById('selectEchelle1').innerHTML = '<option value="ECH_F">Échelle fictive</option>';
    document.getElementById('remiseProduction1').innerHTML = '<option value="recu">Reçu</option>';   // le montage de #672
    const selC = document.getElementById('selectCartoucheEval');
    selC.innerHTML = '<option value="CART_F">Cartouche fictive</option>';
    selC.value = 'CART_F';
    cartoucheSelectionnee();
    return !!document.getElementById('eval_erreurs_CR_ALGO');
}`;

/** La copie ouverte, sept codes posés, 400 mots ; l'évaluation et le PDF de l'élève. */
const POSER_CODES = `() => {
    window.dispatchEvent(new CustomEvent('travaux-fichier-ouvert', { detail: { fichier: { id: 'F_ALGO', productionId: 'P_ALGO' } } }));
    const shapes = [];
    for (let i = 0; i < 3; i++) shapes.push({ type: 'errfr_1', x: i, y: 1 });
    for (let i = 0; i < 4; i++) shapes.push({ type: 'errfr_3', x: i, y: 2 });
    window.travauxAnnotation.getAnnotationCourante = () => ({ id: 'A_ALGO', fichierId: 'F_ALGO', pages: { 1: { shapes } } });
    window.dispatchEvent(new CustomEvent('travaux-annotation-modifiee'));
    const mots = document.getElementById('eval_mots_CR_ALGO');
    mots.value = '400';
    mots.dispatchEvent(new Event('input', { bubbles: true }));
    return null;
}`;

/** Le chemin d'hier : 7 tapé à la main, sans code posé. */
const TAPER = `() => {
    const e = document.getElementById('eval_erreurs_CR_ALGO');
    e.value = '7';
    e.dispatchEvent(new Event('input', { bubbles: true }));
    const mots = document.getElementById('eval_mots_CR_ALGO');
    mots.value = '400';
    mots.dispatchEvent(new Event('input', { bubbles: true }));
    return null;
}`;

const LIRE = `() => {
    const memo = JSON.parse(JSON.stringify(evaluationEnCours.donneesAlgorithmiques.CR_ALGO || null));
    const ev = { id: 'EV_F', etudiantDA: 'DA-F', productionId: 'P_ALGO', grilleId: 'G_ALGO', echelleId: 'ECH_F', cartoucheId: 'CART_F',
        statutRemise: 'remis', statutIntegrite: 'recevable', dateEvaluation: '2026-10-21T12:00:00.000Z',
        criteres: [{ critereId: 'CR_ALGO', critereNom: 'Français écrit', niveauSelectionne: memo && memo.niveau, ponderation: 20, retroaction: memo && memo.retroaction }],
        donneesAlgorithmiques: { CR_ALGO: memo }, noteFinale: memo && memo.pourcentage, niveauFinal: memo && memo.niveau };
    const fb = window.syntheseRetroactionData.construireFeedback(ev, { id: 'F_ALGO' }, null);
    const html = window.syntheseRetroactionRendu.rendreSyntheseHTML(fb);
    const ligne = (html.match(/\\d+ erreurs[^<]*sur \\d+ mots/) || [null])[0];
    return { champ: document.getElementById('eval_erreurs_CR_ALGO').value, memo, ligne, html,
        formule5: window.formulesAlgo.calculer({ type: 'algorithmique', facteurNormalisation: 500 }, { ponderation: 20, erreurs: 5, mots: 400 }).note,
        formule7: window.formulesAlgo.calculer({ type: 'algorithmique', facteurNormalisation: 500 }, { ponderation: 20, erreurs: 7, mots: 400 }).note };
}`;

async function ouvrir(page) {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    page.on('dialog', (d) => d.dismiss().catch(() => {}));
    await page.goto(indexHtml);
    await page.waitForFunction(() => window.dbReady === true && window.travauxOutils && window.syntheseRetroactionData, null, { timeout: 20000 });
    return erreurs;
}

async function capturerPdf(page, html, fichier) {
    const p = await page.context().newPage();
    await p.setContent(html);
    await p.locator('body').screenshot({ path: fichier });
    await p.close();
}

test('poids 1 et 0,5 · sept codes posés : la note suit 5, l’élève lit « 7 erreurs (5 après pondération) »', async ({ page }) => {
    const erreurs = await ouvrir(page);
    expect(await page.evaluate('(' + MONTER + ')(0.5)'), 'DÉCOR : le critère algorithmique est rendu en mode simple').toBe(true);
    await page.evaluate('(' + POSER_CODES + ')()');
    const r = await page.evaluate('(' + LIRE + ')()');
    expect(r.champ, '« Nombre d’erreurs » dit le nombre brut').toBe('7');
    expect(r.memo).toMatchObject({ erreurs: 7, sommePonderee: 5, mots: 400, noteCalculee: r.formule5 });
    expect(r.formule5).not.toBe(r.formule7);
    expect(r.memo.retroaction).toContain('Ta rédaction contient 7 erreurs de français (5 après pondération) pour 400 mots.');
    expect(r.ligne).toBe('7 erreurs (5 après pondération) sur 400 mots');
    expect(r.html).toContain('7 erreurs de français (5 après pondération) pour 400 mots.');
    if (process.env.CAPTURES_ALGO) await capturerPdf(page, r.html, path.join(process.env.CAPTURES_ALGO, 'pdf-poids-1-et-0-5.png'));
    expect(erreurs).toEqual([]);
});

test('poids à 1 · les mêmes codes : évaluation et PDF identiques, à l’octet près, à un 7 tapé à la main', async ({ page }) => {
    const erreurs = await ouvrir(page);
    expect(await page.evaluate('(' + MONTER + ')(1)')).toBe(true);
    await page.evaluate('(' + POSER_CODES + ')()');
    const codes = await page.evaluate('(' + LIRE + ')()');

    const hier = await ouvrir(page);
    expect(await page.evaluate('(' + MONTER + ')(1)')).toBe(true);
    await page.evaluate('(' + TAPER + ')()');
    const tape = await page.evaluate('(' + LIRE + ')()');

    expect(codes.memo).not.toHaveProperty('sommePonderee');
    expect(JSON.stringify(codes.memo)).toBe(JSON.stringify(tape.memo));
    expect(codes.html).toBe(tape.html);
    expect(codes.ligne).toBe('7 erreurs sur 400 mots');
    expect(codes.memo.retroaction).toContain('Ta rédaction contient 7 erreurs de français pour 400 mots.');
    if (process.env.CAPTURES_ALGO) await capturerPdf(page, codes.html, path.join(process.env.CAPTURES_ALGO, 'pdf-poids-a-1.png'));
    expect(erreurs.concat(hier)).toEqual([]);
});

test('#1131 · un critère algorithmique en création reçoit ses sous-critères ; rien en base avant « Créer la grille »', async ({ page }) => {
    const erreurs = await ouvrir(page);
    await page.evaluate(() => {
        db.setSync('trimestres', [{ id: 'a2032', nom: 'Automne 2032', actif: true }]);
        db.setSync('trimestreActif', 'a2032');
        db.setSync('backupNePlusRappeler', 'true');
    });
    await page.reload();
    await page.waitForFunction(() => window.dbReady === true, null, { timeout: 20000 });
    await page.evaluate(() => naviguerVers('conception', 'grille-criteres'));
    const avant = await page.evaluate(() => JSON.stringify(db.getSync(cle('grillesTemplates'), [])));
    await page.locator('[data-action="creerNouvelleGrille"]').click();
    await page.locator('#nomGrilleTemplate').fill('Grille algorithmique fictive');
    const carte = page.locator('#listeCriteres .item-liste').first();
    await carte.locator('select[data-on-change="modifierTypeCritereTempHandler"]').selectOption('algorithmique');
    await expect(carte).not.toContainText('Les sous-critères se définissent une fois la grille enregistrée.');
    // ↻ #1150 lot 4 (24 oct.) : l'atelier s'ouvre sur « Ce que l'élève lit », une seule étape ouverte. Les
    // sous-critères vivent dans l'étape « Codes » : l'enseignant l'ouvre d'un clic sur son en-tête (mesuré le 25 oct.).
    const bouton = carte.locator('[data-action="initialiserSousCriteresParDefaut"]');
    await expect(bouton).toBeHidden();
    await carte.locator('.atelier-algo-etape[data-etape="codes"] .atelier-algo-etape-tete').click();
    await expect(bouton).toBeVisible();
    await bouton.click();
    await expect(carte.locator('.sous-critere-item')).toHaveCount(10);   // ↻ lot de mots (21 oct.) : la liste de Grégoire, codes 1 à 10
    await carte.locator('.sous-criteres-btn-ajouter-liste').click();
    await expect(carte.locator('.sous-critere-item')).toHaveCount(11);
    // ↻ Étape 0 (21 oct.) : né marqué, le critère tire ses codes de ses sous-critères — pas de case à cocher.
    await expect(carte.locator('input[data-on-change="modifierCodesDepuisSousCriteresHandler"]')).toHaveCount(0);
    await page.evaluate(() => db.flush());
    expect(await page.evaluate(() => JSON.stringify(db.getSync(cle('grillesTemplates'), [])))).toBe(avant);
    await page.locator('#btnCreerGrille').click();
    await expect.poll(() => page.evaluate(() => (db.getSync(cle('grillesTemplates'), []).find((g) => g.nom === 'Grille algorithmique fictive') || {}).criteres)).toBeTruthy();
    const c = await page.evaluate(() => db.getSync(cle('grillesTemplates'), []).find((g) => g.nom === 'Grille algorithmique fictive').criteres[0]);
    expect(c.type).toBe('algorithmique');
    expect(c.codesSousCriteresSeulement).toBe(true);
    expect(c.sousCriteres.map((s) => s.code)).toEqual(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11']);
    expect(erreurs).toEqual([]);
});
