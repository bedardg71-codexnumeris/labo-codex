import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

// LOT `descripteurs-grille` (18 nov. 2026) — LES DESCRIPTEURS DE NIVEAU DANS L'ÉDITEUR DE GRILLES, au navigateur,
// sur l'iPad en long (1 180 × 820) et en haut (820 × 1 180), au doigt, séparément :
//   · « + Nouvelle grille », un nom, un critère holistique composé à la main : « Ce qui est attendu à chaque
//     niveau » montre une case par niveau de l'échelle, vide ; le niveau D se décrit EN CRÉATION ; « Créer la
//     grille » l'emporte ; le niveau M se décrit EN MODIFICATION ; la page RECHARGÉE retrouve les deux textes, à
//     leur place, et le stockage porte `{ echelleId, parNiveau: { D, M } }` ;
//   · changer d'échelle ne supprime rien : les deux textes passent sous « Textes gardés d’une autre échelle »,
//     et reviennent à leur place au retour ; aucun débord horizontal ; aucune erreur de page.
// L'échelle décrite est celle de départ (IDME), semée par l'application ; la seconde est fictive. Grilles et textes
// FICTIFS. Captures, clair et sombre : CAPTURES_DESCRIPTEURS=<dossier> pour les écrire.
// ⚠ Chromium (`playwright.chromium.config.js`) n'est pas Safari : un vert ici est un indice, pas un verdict iPad.

const CAPTURES = process.env.CAPTURES_DESCRIPTEURS;
const NOM = 'Grille fictive des descripteurs';
const ID_DEPART = 'ECHELLE_IDME_DEPART';
const FICTIVE = { id: 'ECH_FICTIVE_TROIS', nom: 'Échelle fictive à trois paliers', niveaux: [
    { code: 'P1', nom: 'Palier un', min: 0, max: 59 }, { code: 'P2', nom: 'Palier deux', min: 60, max: 84 }, { code: 'P3', nom: 'Palier trois', min: 85, max: 100 }] };
const TEXTE_D = 'Situe l’œuvre fictive dans son contexte, sans encore la nuancer.';
const TEXTE_M = 'Nuance l’analyse fictive par deux exemples bien choisis.';

async function attendreApp(page) {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForFunction(() => window.dbReady === true, null, { timeout: 20000 });
    await page.waitForFunction(() => !!db.getSync('migration_pratiqueId_to_configurable_id_done', false), null, { timeout: 20000 });
}

async function ouvrirGrillesDeCriteres(page) {
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForFunction(() => window.dbReady === true, null, { timeout: 20000 });
    await page.evaluate(() => {
        db.setSync('trimestres', [{ id: 'a2032', nom: 'Automne 2032', actif: true }]);
        db.setSync('trimestreActif', 'a2032');
        db.setSync('backupNePlusRappeler', 'true');
    });
    await page.reload();
    await attendreApp(page);
    // L'échelle de départ (semée par l'application), puis une seconde, fictive : le menu « Niveaux de l’échelle » paraît.
    await page.evaluate(async (fictive) => {
        await assurerEchelleIdmeDeDepart();
        await db.modifier(cle('echellesTemplates'), (lues) => (lues || []).concat([fictive]), []);   // security-ok: banc, une échelle fictive dans un contexte neuf
        await db.flush();
        naviguerVers('conception', 'grille-criteres');
    }, FICTIVE);
    await expect(page.locator('[data-action="creerNouvelleGrille"]')).toBeVisible();
}

const lesGrilles = (page) => page.evaluate(() => db.getSync(cle('grillesTemplates'), []));
const carte = (page) => page.locator('#listeCriteres .item-liste').first();
const cases = (page) => carte(page).locator('.grille-attendu > .grille-attendu-niveaux .grille-attendu-niveau');
const caseDe = (page, code) => carte(page).locator(`.grille-attendu-niveau textarea[data-niveau="${code}"]`);
const menu = (page) => carte(page).locator('.grille-attendu-echelle select');

async function capturer(page, nom) {
    if (!CAPTURES) return;
    const v = page.viewportSize();
    for (const mode of ['sombre', 'clair']) {
        await page.evaluate((m) => document.body.classList.toggle('mode-clair', m === 'clair'), mode);
        await carte(page).locator('.grille-attendu').scrollIntoViewIfNeeded();
        await carte(page).screenshot({ path: path.join(CAPTURES, `${nom}-${v.width}x${v.height}-${mode}.png`) });
    }
    await page.evaluate(() => document.body.classList.remove('mode-clair'));
}

async function scenario(page) {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    await ouvrirGrillesDeCriteres(page);
    const niveaux = await page.evaluate((id) => db.getSync(cle('echellesTemplates'), []).find((e) => e.id === id).niveaux, ID_DEPART);
    const noms = niveaux.map((n) => n.nom);
    const iD = niveaux.findIndex((n) => n.code === 'D'), iM = niveaux.findIndex((n) => n.code === 'M');
    expect(iD).toBeGreaterThan(-1);
    expect(iM).toBeGreaterThan(-1);

    // Une grille composée à la main : son nom, un critère holistique nommé.
    await page.locator('[data-action="creerNouvelleGrille"]').tap();
    await page.locator('#nomGrilleTemplate').fill(NOM);
    await expect(carte(page).locator('select[data-on-change="modifierTypeCritereTempHandler"]')).toHaveValue('holistique');
    const nomCritere = carte(page).locator('input[data-on-change="modifierCritereTempHandler"][data-champ="nom"]');
    await nomCritere.fill('Pertinence fictive');
    await nomCritere.press('Tab');
    const ponderation = carte(page).locator('input[data-on-change="modifierPonderationCritereTempHandler"]');
    await ponderation.fill('100');
    await ponderation.press('Tab');

    // EN CRÉATION : une case par niveau, vide ; l'échelle de départ choisie au menu ; D décrit.
    await expect(carte(page).locator('.grille-attendu-titre').first()).toHaveText('Ce qui est attendu à chaque niveau');
    await menu(page).selectOption(ID_DEPART);
    await expect(cases(page).locator('strong')).toHaveText(noms);
    for (const t of await cases(page).locator('textarea').all()) await expect(t).toHaveValue('');
    await caseDe(page, 'D').fill(TEXTE_D);
    await caseDe(page, 'D').press('Tab');
    await capturer(page, 'creation');
    await page.locator('#btnCreerGrille').tap();
    await expect.poll(async () => (await lesGrilles(page)).filter((g) => g.nom === NOM).length).toBe(1);
    const id = (await lesGrilles(page)).find((g) => g.nom === NOM).id;
    expect((await lesGrilles(page)).find((g) => g.id === id).criteres[0].descripteurs).toEqual({ echelleId: ID_DEPART, parNiveau: { D: TEXTE_D } });

    // EN MODIFICATION : M décrit.
    const ouvrir = () => page.evaluate(async (id) => { naviguerVers('conception', 'grille-criteres'); await chargerGrillePourModif(id); }, id);
    await ouvrir();
    await expect(caseDe(page, 'D')).toHaveValue(TEXTE_D);
    await caseDe(page, 'M').fill(TEXTE_M);
    await caseDe(page, 'M').press('Tab');
    await expect.poll(async () => (await lesGrilles(page)).find((g) => g.id === id).criteres[0].descripteurs?.parNiveau?.M).toBe(TEXTE_M);

    // RECHARGÉE : les deux textes, à leur place.
    await page.evaluate(() => db.flush());
    await page.reload();
    await attendreApp(page);
    await ouvrir();
    await expect(menu(page)).toHaveValue(ID_DEPART);
    const attendu = noms.map((_, i) => (i === iD ? TEXTE_D : i === iM ? TEXTE_M : ''));
    await expect.poll(() => cases(page).locator('textarea').evaluateAll((ts) => ts.map((t) => t.value))).toEqual(attendu);
    expect((await lesGrilles(page)).find((g) => g.id === id).criteres[0].descripteurs).toEqual({ echelleId: ID_DEPART, parNiveau: { D: TEXTE_D, M: TEXTE_M } });
    await capturer(page, 'rechargee');

    // CHANGER D'ÉCHELLE ne supprime rien : les deux textes gardés, par leur code ; le retour les remet à leur place.
    await menu(page).selectOption(FICTIVE.id);
    await expect(cases(page).locator('strong')).toHaveText(FICTIVE.niveaux.map((n) => n.nom));
    await expect(carte(page).locator('.grille-attendu-hors .grille-attendu-niveau strong')).toHaveText(['D', 'M']);
    expect(await carte(page).locator('.grille-attendu-hors textarea').evaluateAll((ts) => ts.map((t) => t.value))).toEqual([TEXTE_D, TEXTE_M]);
    expect((await lesGrilles(page)).find((g) => g.id === id).criteres[0].descripteurs).toEqual({ echelleId: FICTIVE.id, parNiveau: { D: TEXTE_D, M: TEXTE_M } });
    await capturer(page, 'autre-echelle');
    await menu(page).selectOption(ID_DEPART);
    await expect.poll(() => cases(page).locator('textarea').evaluateAll((ts) => ts.map((t) => t.value))).toEqual(attendu);
    await expect(carte(page).locator('.grille-attendu-hors')).toHaveCount(0);

    // Aucun débord horizontal ; aucune erreur de page.
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
    expect(await carte(page).evaluate((el) => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(1);
    expect(erreurs).toEqual([]);
}

test.describe('iPad en long', () => {
    test.use({ hasTouch: true, viewport: { width: 1180, height: 820 } });
    test('descripteurs · une grille composée à la main, deux niveaux décrits, rechargée : les textes à leur place ; changer d’échelle ne perd rien', async ({ page }) => {
        await scenario(page);
    });
});

test.describe('iPad en haut', () => {
    test.use({ hasTouch: true, viewport: { width: 820, height: 1180 } });
    test('descripteurs · une grille composée à la main, deux niveaux décrits, rechargée : les textes à leur place ; changer d’échelle ne perd rien', async ({ page }) => {
        await scenario(page);
    });
});
