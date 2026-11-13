// =======================================================================
// L'ÉTIQUETTE « SOUS-TOTAL » (13 nov. 2026) — « Apporter mon matériel », dans un vrai WebKit, à 820 × 1180
// =======================================================================
// Retour terrain de Grégoire (13 nov. 2026, iPad) : une grille à quatre tableaux fermés chacun par un sous-total, un
// grand total et une conversion ; « Total » posé partout donnait « ton total : 197 : écart ».
//   S1 · « Sous-total » est dans la légende, juste avant « Total », avec sa couleur à elle ; posée sur « /18 », le morceau
//        la porte et la pastille « Sous-totaux ✓ » dit que les critères au-dessus donnent bien 18 ;
//   S2 · la grille entière étiquetée : une seule pastille « Sous-totaux ✓ », et « ton total : 58,5 ✓ » ;
//   S3 · une tranche en écart : une pastille pour elle, « Sous-total de 20 : ses critères donnent 18 : écart », et pas
//        de « Sous-totaux ✓ ».
// La lecture elle-même : `tests/unit/materiel-dissection-sous-total-2026-11-13.test.js`.
// Break-tests : `plans de travail/RAPPORT-2026-11-13-etiquette-sous-total.md`. Grille FICTIVE ; aucun nom réel.
import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { enHtml, etiquettes } from '../unit/_helpers/grilles-fictives-dissection.js';
import { grilleSousTotaux } from '../unit/_helpers/grille-fictive-sous-totaux.js';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

const etiquette = (type) => `#dissection-palette .dissection-etiquette[data-type="${type}"]`;
const constats = (page) => page.locator('#dissection-constats .dissection-constat');
const norm = (t) => String(t).replace(/[  ]/g, ' ');

async function ouvrir(page, grille) {
    await page.setViewportSize({ width: 820, height: 1180 });
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
    await page.waitForFunction(() => !!db.getSync('migration_pratiqueId_to_configurable_id_done', false)
        && document.getElementById('materiel-zone-collage')?.dataset.materielBranche === '1', null, { timeout: 20000 });
    await page.evaluate(() => window.afficherSection('conception'));
    await expect(page.locator('#conception-materiel')).toBeVisible();
    await page.evaluate((h) => {
        const zone = document.getElementById('materiel-zone-collage');
        const ev = new Event('paste', { bubbles: true, cancelable: true });
        Object.defineProperty(ev, 'clipboardData', { value: { getData: (k) => (k === 'text/html' ? h : '') } });
        zone.dispatchEvent(ev);
    }, enHtml(grille));
    await expect(page.locator('#materiel-dissection')).toBeVisible();
    // Les morceaux de la page, dans l'ordre de lecture : un par étiquette de la grille fictive.
    await expect(page.locator('#dissection-contenu .dissection-morceau')).toHaveCount(etiquettes(grille).length);
}

/** Une étiquette prise dans la légende, puis un vrai geste de pointeur sur chaque morceau (par son rang de lecture). */
async function poser(page, type, rangs) {
    await page.click(etiquette(type));
    await expect(page.locator(etiquette(type))).toHaveAttribute('aria-pressed', 'true');
    await page.evaluate((rs) => {
        const blocs = [...document.querySelectorAll('#dissection-contenu .dissection-morceau')];
        rs.forEach((i) => {
            const b = blocs[i];
            b.scrollIntoView({ block: 'center', inline: 'center' });
            const r = b.getBoundingClientRect();
            const o = { bubbles: true, cancelable: true, pointerId: 7, pointerType: 'mouse', isPrimary: true, clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 };
            b.dispatchEvent(new PointerEvent('pointerdown', o));
            b.dispatchEvent(new PointerEvent('pointerup', o));
        });
    }, rangs);
}

/** Toute la grille fictive étiquetée comme un·e enseignant·e le ferait, étiquette par étiquette. */
async function toutEtiqueter(page, grille) {
    const types = etiquettes(grille), parType = {};
    types.forEach((t, i) => { if (t) (parType[t] = parType[t] || []).push(i); });
    for (const t of Object.keys(parType)) await poser(page, t, parType[t]);
    expect(await page.evaluate(() => Object.keys(materielDissection.etatCourant().liens).length)).toBe(types.filter(Boolean).length);
}

const textes = async (page) => (await constats(page).allTextContents()).map(norm);

test('S1 · « Sous-total » dans la légende, avant « Total », à sa couleur ; posée sur « /18 », la pastille le dit', async ({ page }) => {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    const grille = grilleSousTotaux();
    await ouvrir(page, grille);
    const legende = await page.evaluate(() => [...document.querySelectorAll('#dissection-palette .dissection-etiquette:not(.dissection-outil)')].map((b) => b.getAttribute('data-type')));
    expect(legende.length).toBe(17);
    expect(legende.indexOf('soustotal'), '« Sous-total » juste avant « Total »').toBe(legende.indexOf('total') - 1);
    const bouton = page.locator(etiquette('soustotal'));
    await expect(bouton.locator('.dissection-etiquette-nom')).toHaveText('Sous-total');
    await expect(bouton.locator('.dissection-etiquette-aide')).toHaveText('Le total d’une partie de la grille');
    expect((await bouton.boundingBox()).height, 'cible tactile').toBeGreaterThanOrEqual(44);
    // Sa couleur n'est celle d'aucune autre étiquette de grille (sombre, puis clair).
    for (const clair of [false, true]) {
        const couleurs = await page.evaluate((c) => {
            document.body.classList.toggle('mode-clair', c);
            const o = {};
            document.querySelectorAll('#dissection-palette .dissection-etiquette:not(.dissection-outil)').forEach((b) => { o[b.getAttribute('data-type')] = getComputedStyle(b).getPropertyValue('--dis-c').trim(); });
            return o;
        }, clair);
        expect(couleurs.soustotal, 'une couleur est définie').toMatch(/^#[0-9a-f]{6}$/i);
        const memes = Object.keys(couleurs).filter((k) => k !== 'soustotal' && couleurs[k] === couleurs.soustotal);
        expect(memes, (clair ? 'clair' : 'sombre') + ' : aucune autre étiquette n’a sa couleur').toEqual([]);
    }
    await page.evaluate(() => document.body.classList.remove('mode-clair'));

    // Les deux critères du premier tableau et leurs pondérations, puis le geste rendu à Grégoire : « Sous-total », « /18 ».
    const types = etiquettes(grille);
    const rang = (texte, n = 0) => page.evaluate(([t, k]) => [...document.querySelectorAll('#dissection-contenu .dissection-morceau')].map((b, i) => (b.textContent === t ? i : -1)).filter((i) => i >= 0)[k], [texte, n]);
    await poser(page, 'critere', [await rang('Idée fictive A'), await rang('Idée fictive B')]);
    await poser(page, 'ponderation', [await rang('/10'), await rang('/8')]);
    expect((await textes(page)).some((t) => t.indexOf('Sous-tota') === 0), 'sans « Sous-total » posé, aucune pastille de sous-total').toBe(false);
    const r18 = await rang('/18');
    expect(types[r18]).toBe('soustotal');
    await poser(page, 'soustotal', [r18]);
    await expect(page.locator('#dissection-contenu .dissection-morceau').nth(r18)).toHaveClass(/dis-t-soustotal/);
    await expect(page.locator('#dissection-constats .dissection-constat-ok', { hasText: 'Sous-totaux ✓' })).toHaveCount(1);
    // Sans « Total », le total visé est la somme des sous-totaux : ici 18, la somme des deux pondérations.
    expect(await textes(page)).toContain('Somme des pondérations : 18 · ton total : 18 ✓');
    expect(erreurs).toEqual([]);
});

test('S2 · la grille entière étiquetée : une seule pastille « Sous-totaux ✓ », et le total de 58,5 tombe juste', async ({ page }) => {
    const grille = grilleSousTotaux();
    await ouvrir(page, grille);
    await toutEtiqueter(page, grille);
    const t = await textes(page);
    expect(t).toContain('Somme des pondérations : 58,5 · ton total : 58,5 ✓');
    expect(t.filter((x) => x.indexOf('Sous-tota') === 0)).toEqual(['Sous-totaux ✓']);
    await expect(page.locator('#dissection-constats .dissection-constat-ecart')).toHaveCount(0);
    await expect(page.locator('#dissection-contenu .dis-t-soustotal')).toHaveCount(4);
    await expect(page.locator('#dissection-contenu .dis-t-total')).toHaveCount(1);
});

test('S3 · une tranche en écart : sa pastille nomme le sous-total et ce que donnent ses critères', async ({ page }) => {
    const grille = grilleSousTotaux({ premier: '20' });
    await ouvrir(page, grille);
    await toutEtiqueter(page, grille);
    const t = await textes(page);
    expect(t.filter((x) => x.indexOf('Sous-tota') === 0)).toEqual(['Sous-total de 20 : ses critères donnent 18 : écart']);
    await expect(page.locator('#dissection-constats .dissection-constat-ecart', { hasText: 'Sous-total de 20' })).toHaveCount(1);
    expect(t).toContain('Somme des pondérations : 58,5 · ton total : 58,5 ✓');
});
