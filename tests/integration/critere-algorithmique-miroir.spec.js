import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// LE CRITÈRE ALGORITHMIQUE, ÉTAPE 1 : LE MIROIR (consigne du 21 oct. 2026, faite le 22), dans un vrai WebKit :
//   · une grille neuve, un critère algorithmique → « Essai sur des copies fictives » paraît sous la formule ;
//     sans pondération, il le dit ; la pondération tapée, les copies paraissent sans redessiner le gabarit ;
//   · la projection réglée, changer le facteur → la note d'une copie change (sans projection, une copie longue
//     du facteur perd un point par erreur quel que soit le facteur : `js/miroir-algo.js`, « La règle des copies ») ;
//   · à 820 px (iPad en portrait), un critère de chimie (fictif) avec des codes pondérés : la copie pondérée,
//     aucun « français », aucun défilement de côté ;
//   · une grille enregistrée : la pondération changée refait le miroir en place (`modifierCritereGrille`).
// BREAK-TESTS (22 oct. 2026, restaurés, `cmp` identique) : l'appel à `suivreMiroirAlgo` retiré du handler de
// création → le premier test rougit ; retiré de `modifierCritereGrille` → le troisième rougit.
// Montage : celui de `critere-algorithmique-etape-0`. Captures : CAPTURES_MIROIR=<dossier>.

async function ouvrir(page) {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    page.on('dialog', (d) => d.dismiss().catch(() => {}));
    await page.goto(indexHtml);
    await page.waitForFunction(() => window.dbReady === true, null, { timeout: 20000 });
    await page.evaluate(() => {
        db.setSync('trimestres', [{ id: 'a2032', nom: 'Automne 2032', actif: true }]);
        db.setSync('trimestreActif', 'a2032');
        db.setSync('backupNePlusRappeler', 'true');
    });
    await page.reload();
    await page.waitForFunction(() => window.dbReady === true && window.miroirAlgo && window.formulesAlgo, null, { timeout: 20000 });
    return erreurs;
}

/** Une grille neuve et son premier critère, algorithmique, nommé. Rend la carte du critère. */
async function critereNeuf(page, nomCritere) {
    await page.evaluate(() => naviguerVers('conception', 'grille-criteres'));
    await page.locator('[data-action="creerNouvelleGrille"]').click();
    await page.locator('#nomGrilleTemplate').fill('Grille fictive du miroir');
    const carte = page.locator('#listeCriteres .item-liste').first();
    await carte.locator('select[data-on-change="modifierTypeCritereTempHandler"]').selectOption('algorithmique');
    const nom = carte.locator('input[data-on-change="modifierCritereTempHandler"][data-champ="nom"]');
    await nom.fill(nomCritere);
    await nom.press('Tab');
    return carte;
}

const lignes = (carte) => carte.locator('.miroir-algo .miroir-algo-copie');
const noteDe = (carte, cle) => carte.locator(`.miroir-algo-copie[data-copie="${cle}"] .miroir-algo-note`);

test('une grille neuve : le miroir paraît sous la formule, suit la pondération en place, et le facteur change une note', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    const erreurs = await ouvrir(page);
    const carte = await critereNeuf(page, 'Français écrit');
    const base = () => page.evaluate(() => JSON.stringify(db.getSync(cle('grillesTemplates'), [])));
    const baseAvant = await base();
    const miroir = carte.locator('.miroir-algo');
    await expect(miroir).toBeVisible();
    await expect(miroir.locator('.miroir-algo-titre')).toHaveText('Essai sur des copies fictives');
    // Sous « Formule appliquée », dans la carte « Formule »
    const avant = await carte.locator('[data-pli$=":formule"]').evaluate((c) => {
        const f = [...c.querySelectorAll('p')].find((p) => p.textContent.includes('Formule appliquée'));
        const m = c.querySelector('.miroir-algo');
        return !!(f && m && (f.compareDocumentPosition(m) & Node.DOCUMENT_POSITION_FOLLOWING));
    });
    expect(avant).toBe(true);
    // Un critère neuf naît à 0 : le miroir le dit
    await expect(miroir.locator('.miroir-algo-vide')).toContainText('Donne une pondération à ce critère');

    // ↻ Étape 2a (22 oct. 2026) : un critère neuf naît sans noms ; « Partir de la liste du français écrit » les pose.
    await carte.locator('[data-action="initialiserSousCriteresParDefaut"]').click();
    await expect(carte.locator('.noms-algo input[data-nom-paire="erreurs"][data-nom-forme="singulier"]')).toHaveValue('erreur');

    // La pondération : le miroir se refait EN PLACE, sans redessiner le gabarit (le champ suivant garde le focus)
    const ponderation = carte.locator('input[data-on-change="modifierPonderationCritereTempHandler"]');
    await ponderation.fill('30');
    await ponderation.press('Tab');
    await expect(lignes(carte)).toHaveCount(3);
    await expect(noteDe(carte, 'aucune')).toHaveText('30/30 (100 %)');
    await expect(carte.locator('.miroir-algo-copie[data-copie="aucune"] .miroir-algo-donnees')).toHaveText('0 erreur, 500 mots');
    await expect(carte.locator('.miroir-algo-copie[data-copie="beaucoup"]')).toContainText('la note touche le plancher');

    // La projection réglée (l'épreuve à 900 mots), puis le facteur changé : la note d'une copie change
    await carte.locator('[data-pli$=":projection"] .accordeon-header').click();
    await carte.locator('select[data-on-change="modifierModeleProjectionTempHandler"]').selectOption('norme_externe');
    await expect(carte.locator('.miroir-algo-copie[data-copie="aucune"] .miroir-algo-donnees')).toHaveText('0 erreur, 900 mots');
    const noteAvant = await noteDe(carte, 'quelques').textContent();
    const facteur = carte.locator('input[data-on-change="modifierParamFormuleTempHandler"][data-param-cle="facteurNormalisation"]');
    await facteur.fill('250');
    await facteur.press('Tab');
    await expect(noteDe(carte, 'quelques')).not.toHaveText(noteAvant);
    // Rien n'est écrit en base avant « Créer la grille »
    expect(await base()).toBe(baseAvant);
    if (process.env.CAPTURES_MIROIR) {
        await facteur.fill('500');
        await facteur.press('Tab');
        await carte.locator('[data-pli$=":formule"]').screenshot({ path: path.join(process.env.CAPTURES_MIROIR, 'miroir-1440-francais.png') });
    }
    expect(erreurs).toEqual([]);
});

test('à 820 px, un critère de chimie aux codes pondérés : la copie pondérée, aucun « français », aucun défilement de côté', async ({ page }) => {
    await page.setViewportSize({ width: 820, height: 1180 });
    const erreurs = await ouvrir(page);
    const carte = await critereNeuf(page, 'Unités et chiffres significatifs');
    // Les réglages d'un laboratoire fictif : 12 calculs de référence, des codes qui ne pèsent pas tous 1.
    await page.evaluate(() => {
        const c = window.tempCriteres[0];
        c.ponderation = 20;
        formulesAlgo.appliquerAuCritere(c, 'penalite_normalisee', { facteurNormalisation: 12 });
        c.sousCriteres = [
            { id: 'SC1', code: '1', nom: 'Unité manquante', ponderation: 1.5 },
            { id: 'SC2', code: '2', nom: 'Chiffres significatifs', ponderation: 0.5 },
            { id: 'SC3', code: '3', nom: 'Arrondi', ponderation: 1 }
        ];
        afficherCriteresTemp();
    });
    expect(await page.evaluate(() => codesAnnotation.donneSesCodes(window.tempCriteres[0]))).toBe(true);
    const miroir = carte.locator('.miroir-algo');
    // ↻ Étape 2a (22 oct. 2026) : sans ses noms, le miroir lit le repli ; on les tape dans les quatre champs,
    // au clavier (le focus suit d'un champ à l'autre malgré le redessin).
    await expect(carte.locator('.noms-algo-invitation')).toBeVisible();
    const champNom = (paire, forme) => carte.locator(`.noms-algo input[data-nom-paire="${paire}"][data-nom-forme="${forme}"]`);
    for (const [paire, forme, valeur] of [['erreurs', 'singulier', 'unité manquante'], ['erreurs', 'pluriel', 'unités manquantes'],
        ['mots', 'singulier', 'calcul'], ['mots', 'pluriel', 'calculs']]) {
        await champNom(paire, forme).fill(valeur);
        await champNom(paire, forme).press('Tab');
    }
    await expect(carte.locator('.noms-algo-invitation')).toHaveCount(0);
    expect(await page.evaluate(() => window.tempCriteres[0].noms)).toEqual({
        erreurs: { singulier: 'unité manquante', pluriel: 'unités manquantes' }, mots: { singulier: 'calcul', pluriel: 'calculs' } });
    await expect(lignes(carte)).toHaveCount(4);
    await expect(carte.locator('.miroir-algo-copie[data-copie="ponderee"]')).toContainText('après pondération');
    await expect(carte.locator('.miroir-algo-copie[data-copie="aucune"] .miroir-algo-donnees')).toHaveText('0 unité manquante, 12 calculs');
    expect((await miroir.textContent()).toLowerCase()).not.toContain('français');
    const debord = await page.evaluate(() => {
        const m = document.querySelector('#listeCriteres .miroir-algo');
        const lignesDebordent = [...m.querySelectorAll('.miroir-algo-copie')].some((l) => l.scrollWidth > l.clientWidth + 1);
        return { page: document.documentElement.scrollWidth - document.documentElement.clientWidth, bloc: m.scrollWidth - m.clientWidth, lignesDebordent };
    });
    expect(debord.page).toBeLessThanOrEqual(0);
    expect(debord.bloc).toBeLessThanOrEqual(0);
    expect(debord.lignesDebordent).toBe(false);
    if (process.env.CAPTURES_MIROIR) await miroir.screenshot({ path: path.join(process.env.CAPTURES_MIROIR, 'miroir-820-chimie.png') });
    expect(erreurs).toEqual([]);
});

test('une grille enregistrée : changer la pondération du critère refait le miroir en place, avec la nouvelle note', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    const erreurs = await ouvrir(page);
    await page.evaluate(() => {
        // security-ok: fixture littérale du spec, aucune source externe.
        db.setSync(cle('grillesTemplates'), [{ id: 'G_MIROIR', nom: 'Grille fictive enregistrée', criteres: [
            { id: 'CR_M', nom: 'Rigueur des calculs', type: 'algorithmique', ponderation: 30, modeleFormule: 'penalite_par_erreur',
              paramsFormule: { pointsParErreur: 1 }, modeleProjection: 'aucune', paramsProjection: {} }
        ] }]);
    });
    await page.evaluate(async () => { naviguerVers('conception', 'grille-criteres'); await chargerGrillePourModif('G_MIROIR'); });
    const carte = page.locator('#listeCriteres .item-liste').first();
    await expect(noteDe(carte, 'beaucoup')).toContainText('0/30 (0 %)');
    await expect(carte.locator('.miroir-algo-copie[data-copie="beaucoup"] .miroir-algo-donnees')).toHaveText('30 erreurs, champ « Mots » vide');   // ↻ étape 2a : le nom du champ
    const pond = carte.locator('input[data-on-change="modifierCritereGrilleHandler"][data-champ="ponderation"]');
    await pond.fill('20');
    await pond.press('Tab');
    await expect(carte.locator('.miroir-algo-copie[data-copie="beaucoup"] .miroir-algo-donnees')).toHaveText('20 erreurs, champ « Mots » vide');
    await expect(noteDe(carte, 'aucune')).toHaveText('20/20 (100 %)');
    expect(erreurs).toEqual([]);
});
