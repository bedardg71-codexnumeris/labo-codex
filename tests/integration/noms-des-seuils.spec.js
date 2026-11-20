import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

// LES NOMS DES DEUX SEUILS (décision de Grégoire, 19 nov. 2026, 17 h 20 à 17 h 24 ;
// `plans de travail/CONSIGNE-LOT-2026-11-19-noms-des-seuils.md`), au navigateur, en paysage (1 180 × 820), en portrait
// (820 × 1 180) et sur téléphone (390 × 844) :
//   · Conception › Échelles de performance, l'échelle de départ : « Seuils de réussite et de maîtrise », « Seuil minimal
//     de réussite », « Seuil de maîtrise » ; les seuils D et M posés par les menus ;
//   · Conception › Grilles, une grille décrite : la case D dit « Seuil minimal de réussite », la case M « Seuil de
//     maîtrise » ; les deux seuils sur M, les deux étiquettes ; sans seuils, aucune ;
//   · #1294 : la rangée des cases ne s'élargit pas (même largeur avec et sans étiquettes) ; rien ne déborde.
// Échelle de départ semée par l'application ; grille et textes FICTIFS. Captures : CAPTURES_SEUILS=<dossier>.
// ⚠ Chromium (`playwright.chromium.config.js`) n'est pas Safari : un vert ici est un indice, pas un verdict iPad.

const CAPTURES = process.env.CAPTURES_SEUILS;
const ID_DEPART = 'ECHELLE_IDME_DEPART';
const GRILLE = { id: 'GR_BANC_SEUILS', nom: 'Grille fictive des seuils', criteres: [
    { id: 'CR_BANC_S1', nom: 'Repérage fictif des stratégies', type: 'holistique', ponderation: 100,
        descripteurs: { echelleId: ID_DEPART, parNiveau: { D: 'Tu nommes trois stratégies fictives.', M: 'Chaque stratégie fictive laisse une trace.' } } }] };

async function ouvrirApp(page) {
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForFunction(() => window.dbReady === true, null, { timeout: 20000 });
    await page.evaluate(() => {
        db.setSync('trimestres', [{ id: 'a2032', nom: 'Automne 2032', actif: true }]);
        db.setSync('trimestreActif', 'a2032');
        db.setSync('backupNePlusRappeler', 'true');
    });
    await page.reload();
    await page.waitForFunction(() => window.dbReady === true, null, { timeout: 20000 });
    await page.waitForFunction(() => !!db.getSync('migration_pratiqueId_to_configurable_id_done', false), null, { timeout: 20000 });
    await page.evaluate(async (grille) => {
        await assurerEchelleIdmeDeDepart();
        await db.modifier(cle('grillesTemplates'), (lues) => (lues || []).filter((g) => g.id !== grille.id).concat([grille]), []);   // security-ok: banc, grille fictive dans un contexte neuf
        await db.flush();
    }, GRILLE);
}

async function poserSeuils(page, suffisance, maitrise) {
    const refus = await page.evaluate(async ({ id, suffisance, maitrise }) => {
        // L'ordre d'écriture évite un refus transitoire (la réussite au-dessus de la maîtrise) : on retire, puis on pose.
        await ecrireRepereEchelle(id, 'seuilMaitrise', '');
        await ecrireRepereEchelle(id, 'seuilSuffisance', '');
        const r1 = maitrise ? await ecrireRepereEchelle(id, 'seuilMaitrise', maitrise) : null;
        const r2 = suffisance ? await ecrireRepereEchelle(id, 'seuilSuffisance', suffisance) : null;
        await db.flush();
        return [r1 && r1.refuse, r2 && r2.refuse].filter(Boolean);
    }, { id: ID_DEPART, suffisance, maitrise });
    expect(refus).toEqual([]);
}

const carte = (page) => page.locator('#listeCriteres .item-liste').first();
const cases = (page) => carte(page).locator('.grille-attendu > .grille-attendu-niveaux .grille-attendu-niveau');
const rangee = (page) => carte(page).locator('.grille-attendu > .grille-attendu-niveaux');

async function ouvrirGrille(page) {
    await page.evaluate(async (id) => { naviguerVers('conception', 'grille-criteres'); await chargerGrillePourModif(id); }, GRILLE.id);
    await expect(cases(page).first()).toBeVisible();
}

/** [nom du niveau, étiquettes] de chaque case, dans l'ordre de l'échelle. */
const lire = (page) => cases(page).evaluateAll((cs) => cs.map((c) => [c.querySelector('strong').textContent,
    [...c.querySelectorAll('.grille-attendu-seuil')].map((s) => s.textContent)]));

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
    await ouvrirApp(page);

    // L'ÉCRAN DE L'ÉCHELLE : le bloc des seuils, ses deux menus ; les seuils posés par les menus.
    await page.evaluate(async (id) => { naviguerVers('conception', 'echelle-performance'); await chargerEchellePourModif(id); }, ID_DEPART);
    const bloc = page.locator('.echelle-reperes-grille').locator('..');
    await expect(bloc.locator('h4')).toHaveText('Seuils de réussite et de maîtrise');
    await expect(bloc.locator('label')).toHaveText(['Seuil minimal de réussite', 'Seuil de maîtrise']);
    await expect(bloc).not.toContainText('Repère');
    await bloc.locator('select[data-champ="seuilMaitrise"]').selectOption('M');
    await bloc.locator('select[data-champ="seuilSuffisance"]').selectOption('D');
    await expect.poll(() => page.evaluate((id) => { const e = db.getSync(cle('echellesTemplates'), []).find((x) => x.id === id); return [e.seuilSuffisance, e.seuilMaitrise]; }, ID_DEPART))
        .toEqual(['D', 'M']);

    // SANS SEUILS d'abord : aucune étiquette ; la largeur de la rangée sert de témoin (#1294).
    await poserSeuils(page, '', '');
    await ouvrirGrille(page);
    expect((await lire(page)).every(([, e]) => e.length === 0)).toBe(true);
    const largeurSans = (await rangee(page).boundingBox()).width;

    // AVEC SEUILS : D et M portent leur étiquette, à côté du nom.
    await poserSeuils(page, 'D', 'M');
    await ouvrirGrille(page);
    const lu = await lire(page);
    expect(lu.filter(([, e]) => e.length)).toEqual([['Développement', ['Seuil minimal de réussite']], ['Maîtrise', ['Seuil de maîtrise']]]);
    expect(lu.filter(([, e]) => !e.length).length, 'les autres niveaux, rien').toBe(lu.length - 2);
    // #1294 : la rangée ne s'élargit pas ; aucune case, ni la carte, ni la page ne débordent.
    expect((await rangee(page).boundingBox()).width).toBeCloseTo(largeurSans, 0);
    expect(await cases(page).evaluateAll((cs) => cs.map((c) => c.scrollWidth - c.clientWidth).filter((d) => d > 1))).toEqual([]);
    expect(await carte(page).evaluate((el) => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
    // L'étiquette ne dépasse pas sa case.
    const debords = await cases(page).evaluateAll((cs) => cs.flatMap((c) => [...c.querySelectorAll('.grille-attendu-seuil')]
        .map((s) => s.getBoundingClientRect().right - c.getBoundingClientRect().right)).filter((d) => d > 0.5));
    expect(debords).toEqual([]);
    await capturer(page, 'etiquettes');

    // LES DEUX SEUILS SUR LE MÊME NIVEAU : les deux étiquettes, sur la case M.
    await poserSeuils(page, 'M', 'M');
    await ouvrirGrille(page);
    expect((await lire(page)).filter(([, e]) => e.length)).toEqual([['Maîtrise', ['Seuil minimal de réussite', 'Seuil de maîtrise']]]);
    expect((await rangee(page).boundingBox()).width).toBeCloseTo(largeurSans, 0);
    expect(await carte(page).evaluate((el) => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(1);
    await capturer(page, 'deux-seuils-meme-niveau');

    expect(erreurs).toEqual([]);
}

for (const [nom, viewport] of [['paysage', { width: 1180, height: 820 }], ['portrait', { width: 820, height: 1180 }], ['téléphone', { width: 390, height: 844 }]]) {
    test.describe(nom, () => {
        test.use({ hasTouch: true, viewport });
        test('noms des seuils · l’écran de l’échelle ; les étiquettes des cases de niveau (avec, sans, sur le même niveau) ; la rangée ne s’élargit pas', async ({ page }) => {
            test.setTimeout(120000);
            await scenario(page);
        });
    });
}
