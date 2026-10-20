import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GRILLE_N, enHtml } from '../unit/_helpers/grilles-fictives-dissection.js';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

// « APPORTER MON MATÉRIEL », #1119 — revenir à sa dissection après « Créer ma grille » (consigne du 20 oct. 2026),
// dans un vrai WebKit.
//
//   · disséquer (étiquettes, plages des niveaux, nom saisi), créer, « Revenir à ma dissection » → la dissection
//     telle qu'elle était, avec le mot de la reprise ; le nom saisi est là, tel quel (déjà pris : refusé, jamais
//     changé d'office) ; renommé, créé de nouveau → DEUX grilles et deux échelles, la première grille, son
//     échelle et ses cartouches identiques à l'octet près ; le brouillon est resté tout du long ;
//   · à 820 px (iPad) et à 1440 px (Mac) : le bouton fait au moins 44 × 44 px, la page ne défile pas de côté ;
//   · « Coller une autre grille » sur la confirmation efface toujours le brouillon, et le bouton disparaît ;
//   · un brouillon devenu illisible : l'accueil, le mot existant, le brouillon gardé.
//   Break-test (fait le 20 oct.) : un retour qui efface le brouillon (`oublierBrouillon` dans `revenirDissection`)
//   → le premier essai rougit ; une seconde création qui écrase la première (`C.ajouter` qui remplace la liste)
//   → le premier essai rougit. Code restauré.

async function ouvrirConception(page) {
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForFunction(() => window.dbReady === true, null, { timeout: 20000 });
    await page.evaluate(() => {
        db.setSync('trimestres', [{ id: 'a2032', nom: 'Automne 2032', actif: true }]);
        db.setSync('trimestreActif', 'a2032');
        db.setSync('backupNePlusRappeler', 'true');
    });
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForFunction(() => window.dbReady === true, null, { timeout: 20000 });
    // Un témoin, pas un délai (même que la spec du lot 1).
    await page.waitForFunction(() => !!db.getSync('migration_pratiqueId_to_configurable_id_done', false)
        && document.getElementById('materiel-zone-collage')?.dataset.materielBranche === '1', null, { timeout: 20000 });
    await page.evaluate(() => window.afficherSection('conception'));
    await expect(page.locator('#conception-materiel')).toBeVisible();
}

/** Un VRAI événement « coller » sur la zone, avec le HTML au presse-papiers (comme Word ou Pages). */
async function coller(page, html) {
    await page.evaluate((h) => {
        const zone = document.getElementById('materiel-zone-collage');
        const ev = new Event('paste', { bubbles: true, cancelable: true });
        Object.defineProperty(ev, 'clipboardData', { value: { getData: (k) => (k === 'text/html' ? h : '') } });
        zone.dispatchEvent(ev);
    }, html);
}

/** Une étiquette en main, un geste de pointeur sur tous les morceaux dont le texte est dans la liste, puis Échap. */
async function etiqueter(page, type, textes) {
    await page.locator('#dissection-palette [data-param="' + type + '"]').click();
    await page.evaluate((ts) => {
        const blocs = [...document.querySelectorAll('#dissection-contenu .dissection-morceau')].filter((b) => ts.includes(b.textContent));
        const centre = (b) => { b.scrollIntoView({ block: 'center', inline: 'center' }); const r = b.getBoundingClientRect(); return { clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 }; };
        const ev = (t, b) => new PointerEvent(t, Object.assign({ bubbles: true, cancelable: true, pointerId: 7, pointerType: 'touch', isPrimary: true }, centre(b)));
        blocs[0].dispatchEvent(ev('pointerdown', blocs[0]));
        blocs.slice(1).forEach((b) => b.dispatchEvent(ev('pointermove', b)));
        const der = blocs[blocs.length - 1];
        der.dispatchEvent(ev('pointerup', der));
    }, textes);
    await page.keyboard.press('Escape');
}

const CRITERES_N = [1, 2, 3].map((n) => 'Le travail fictif répond à l’attente ' + n);
const NOM = 'Fiche d’appréciation fictive, à corriger';

/** La grille (n) disséquée en niveaux, ses plages saisies, son nom tapé. */
async function dissequer(page) {
    await coller(page, enHtml(GRILLE_N));
    await etiqueter(page, 'titre', ['Fiche d’appréciation fictive']);
    await etiqueter(page, 'niveau', ['À reprendre', 'En voie', 'Atteint']);
    await etiqueter(page, 'critere', CRITERES_N);
    await etiqueter(page, 'ponderation', ['(40 %)', '(35 %)', '(25 %)']);
    const saisies = [['0', '59', '50'], ['60', '79', '70'], ['80', '100', '90']];
    for (let i = 0; i < 3; i++) for (const [k, quoi] of ['min', 'max', 'note'].entries()) await page.locator('#dissection-niv-' + i + '-' + quoi).fill(saisies[i][k]);
    const champ = page.locator('#dissection-nom-grille');
    await champ.fill(NOM);
    await champ.press('Tab');
    await expect.poll(() => page.evaluate(() => db.getSync(cle('brouillonDissection'), null)?.nomSaisi)).toBe(NOM);
}

/** Ce qui doit survivre au retour : l'état de la dissection, sans l'état d'écran. */
const etatGarde = (page) => page.evaluate(() => {
    const e = window.materielDissection.etatCourant();
    return JSON.parse(JSON.stringify({ doc: e.doc, liens: e.liens, coupes: e.coupes, rattachements: e.rattachements, nomSaisi: e.nomSaisi, compte: e.compte, valeurs: e.valeurs }));
});

/** Ce qui s'est écrit dans le trimestre : grilles, échelles, et toutes les cartouches, tel quel (JSON). */
const ecrit = (page) => page.evaluate(() => ({
    grilles: db.getSync(cle('grillesTemplates'), []),
    echelles: db.getSync(cle('echellesTemplates'), []),
    cartouches: Object.fromEntries(db.keysSync().filter((k) => k.startsWith(cle('cartouches_'))).sort().map((k) => [k, JSON.stringify(db.getSync(k, null))]))
}));

const creer = (page) => page.locator('#dissection-creer [data-action="materielDissection.creer"]');
const revenir = (page) => page.locator('.materiel-confirmation [data-action="materiel.revenirDissection"]');
const brouillon = (page) => page.evaluate(() => db.getSync(cle('brouillonDissection'), null));

/** Le bouton : 44 × 44 px au moins ; la page ne défile pas de côté. */
async function mesurer(page) {
    return page.evaluate(() => {
        const b = document.querySelector('.materiel-confirmation [data-action="materiel.revenirDissection"]');
        b.scrollIntoView({ block: 'center' });
        const r = b.getBoundingClientRect();
        return { largeur: r.width, hauteur: r.height, debord: document.documentElement.scrollWidth - document.documentElement.clientWidth };
    });
}

test('#1119 · créer, revenir à sa dissection telle quelle, la recréer : deux grilles, la première intacte', async ({ page }) => {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    await page.setViewportSize({ width: 820, height: 1180 });
    await ouvrirConception(page);
    await dissequer(page);
    const avant = await etatGarde(page);
    expect(avant.nomSaisi).toBe(NOM);
    const depart = await ecrit(page);   // le trimestre a déjà son matériel de départ : on compte ce qui s'ajoute
    expect(Object.keys(avant.valeurs)).toHaveLength(3);

    await creer(page).click();
    await expect(page.locator('#materiel-titre-cree')).toHaveText('Ta grille « ' + NOM + ' » est créée');
    const premier = await ecrit(page);
    expect(premier.grilles).toHaveLength(depart.grilles.length + 1);
    expect(premier.echelles).toHaveLength(depart.echelles.length + 1);
    const g1 = premier.grilles[premier.grilles.length - 1];
    const brouillonApresCreation = await brouillon(page);
    expect(brouillonApresCreation).not.toBeNull();

    // Le bouton, secondaire, à côté de « Coller une autre grille » ; au doigt sur l'iPad, puis au Mac.
    await expect(revenir(page)).toHaveText('Revenir à ma dissection');
    await expect(revenir(page)).toHaveClass(/btn-secondaire/);
    await expect(page.locator('.materiel-confirmation .materiel-retours [data-action="materiel.recommencer"]')).toHaveText('Coller une autre grille');
    const ipad = await mesurer(page);
    expect(ipad.hauteur).toBeGreaterThanOrEqual(44);
    expect(ipad.largeur).toBeGreaterThanOrEqual(44);
    expect(ipad.debord).toBeLessThanOrEqual(0);
    await page.screenshot({ path: test.info().outputPath('1119-confirmation-820.png') });
    await page.setViewportSize({ width: 1440, height: 900 });
    const mac = await mesurer(page);
    expect(mac.hauteur).toBeGreaterThanOrEqual(44);
    expect(mac.debord).toBeLessThanOrEqual(0);
    await page.setViewportSize({ width: 820, height: 1180 });

    // Revenir : la dissection telle qu'elle était, le mot de la reprise, le brouillon intact.
    await revenir(page).click();
    await expect(page.locator('#materiel-dissection')).toBeVisible();
    await expect(page.locator('#materiel-accueil')).toBeHidden();
    await expect(page.locator('.materiel-confirmation')).toHaveCount(0);
    await expect(page.locator('#dissection-statut')).toHaveText('Dissection reprise telle que tu l’as laissée.');
    await expect(page.locator('#dissection-titre')).toBeFocused();
    expect(await etatGarde(page)).toEqual(avant);
    await expect(page.locator('#dissection-contenu .dissection-morceau[data-type="critere"]')).toHaveCount(3);
    expect(await brouillon(page)).toEqual(brouillonApresCreation);

    // Le nom saisi, tel quel : déjà pris, refusé — jamais changé d'office, aucun « (2) ».
    const champ = page.locator('#dissection-nom-grille');
    await expect(champ).toHaveValue(NOM);
    await expect(creer(page)).toBeDisabled();
    await expect(page.locator('#dissection-creer-raisons')).toContainText('« ' + NOM + ' » existe déjà dans ce trimestre');
    expect(await ecrit(page)).toEqual(premier);

    // L'enseignant corrige, et crée de nouveau : une SECONDE grille ; la première, à l'octet près.
    await champ.fill('Fiche d’appréciation fictive, corrigée');
    await creer(page).click();
    await expect(page.locator('#materiel-titre-cree')).toHaveText('Ta grille « Fiche d’appréciation fictive, corrigée » est créée');
    const second = await ecrit(page);
    expect(second.grilles).toHaveLength(premier.grilles.length + 1);
    expect(JSON.stringify(second.grilles.slice(0, premier.grilles.length))).toBe(JSON.stringify(premier.grilles));
    const g2 = second.grilles[second.grilles.length - 1];
    expect(g2.id).not.toBe(g1.id);
    expect(g2.nom).toBe('Fiche d’appréciation fictive, corrigée');
    expect(g1.nom).toBe(NOM);
    // Une autre échelle, la première intacte ; aucune cartouche de la première touchée.
    expect(second.echelles).toHaveLength(premier.echelles.length + 1);
    expect(JSON.stringify(second.echelles.slice(0, premier.echelles.length))).toBe(JSON.stringify(premier.echelles));
    expect(premier.echelles.map((e) => e.id)).not.toContain(second.echelles[second.echelles.length - 1].id);
    for (const [k, v] of Object.entries(premier.cartouches)) expect(second.cartouches[k]).toBe(v);
    // Le brouillon reste (le nom corrigé y est), et le bouton est encore offert.
    expect((await brouillon(page))?.nomSaisi).toBe('Fiche d’appréciation fictive, corrigée');
    await expect(revenir(page)).toBeVisible();
    expect(erreurs).toEqual([]);
});

test('#1119 · « Coller une autre grille » sur la confirmation efface toujours le brouillon, et le bouton disparaît', async ({ page }) => {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    await ouvrirConception(page);
    await dissequer(page);
    const nb = await page.evaluate(() => db.getSync(cle('grillesTemplates'), []).length);
    await creer(page).click();
    await expect(revenir(page)).toBeVisible();
    await page.locator('.materiel-confirmation [data-action="materiel.recommencer"]').click();
    await expect(page.locator('#materiel-accueil')).toBeVisible();
    await expect(page.locator('#materiel-dissection')).toBeHidden();
    await expect(page.locator('[data-action="materiel.revenirDissection"]')).toHaveCount(0);
    await expect.poll(() => brouillon(page)).toBeNull();
    expect(await page.evaluate(() => db.getSync(cle('grillesTemplates'), []).length)).toBe(nb + 1);
    expect(erreurs).toEqual([]);
});

test('#1119 · un brouillon devenu illisible : l’accueil, le mot existant, le brouillon gardé', async ({ page }) => {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    await ouvrirConception(page);
    await dissequer(page);
    await creer(page).click();
    await expect(revenir(page)).toBeVisible();
    const abime = { format: 'dissection-9', doc: 'abîmé' };
    await page.evaluate((b) => db.setSync(cle('brouillonDissection'), b), abime);   // security-ok: banc, brouillon abîmé exprès dans un contexte neuf
    await revenir(page).click();
    await expect(page.locator('#materiel-accueil')).toBeVisible();
    await expect(page.locator('#materiel-dissection')).toBeHidden();
    await expect(page.locator('#materiel-erreur')).toHaveText('Ta dissection précédente n’a pas pu être relue : elle reste gardée telle quelle. Colle une grille pour en commencer une autre ; elle la remplacera.');
    await expect(page.locator('#materiel-zone-collage')).toBeFocused();
    expect(await brouillon(page)).toEqual(abime);
    expect(erreurs).toEqual([]);
});
