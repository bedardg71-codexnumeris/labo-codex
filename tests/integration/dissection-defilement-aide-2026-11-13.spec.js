// =======================================================================
// LA GRILLE NE REMONTE PLUS (13 nov. 2026) — dans un vrai WebKit, à 820 × 1180
// =======================================================================
// Rapport de bug de Grégoire, 13 nov. 2026, 16 h 46, iPad Safari 27.2, 820 × 1180, Conception › Mon matériel : « à chaque
// fois que je clique sur un élément, l'affichage de la grille remonte en haut de la page ».
// Cause : `finSurlignage` remettait à zéro les repères de l'amenée après CHAQUE geste d'étiquetage ; au redessin suivant,
// `aide()` ramenait le canevas vers le morceau que la carte « Ta grille, pas à pas » désigne (le premier manque), et la
// légende vers l'étiquette désignée. Qui étiquetait ailleurs était ramené à chaque geste.
//   D1 · carte ouverte, premier manque en haut (un « / 2 » seul dans sa rangée) ; le canevas et la légende défilés vers le
//        bas, trois morceaux du bas étiquetés : après chaque geste, ni le canevas ni la légende n'ont bougé (à 1 px près) ;
//   D2 · un geste dans le canevas qui CHANGE le morceau désigné ne fait pas défiler le canevas non plus ; l'interrupteur
//        de la carte, fermé puis rouvert (la personne agit sur la carte), l'y amène.
//   D3 · le croisement avec `lot/etiquette-sous-total` (fusion du 13 nov.) : carte ouverte, canevas défilé vers le bas,
//        « Sous-total » pris dans la légende et posé sur « / 180 » : le morceau la porte, la lecture le compte, et ni le
//        canevas ni la légende n'ont bougé.
// Break-tests : `plans de travail/RAPPORT-2026-11-13-dissection-defilement-aide.md`. Grille FICTIVE ; aucun nom réel.
import { test, expect } from '@playwright/test';
import { ouvrirEspaceVide, bulle } from './harness/classe-de-banc.js';

const L = 820, H = 1180;
const TITRE = 'Ta grille, pas à pas';
const norm = (t) => String(t).replace(/[  ]/g, ' ').replace(/\s+/g, ' ').trim();
const etiquette = (type) => `#dissection-palette .dissection-etiquette[data-type="${type}"]`;

// Une grille fictive assez longue pour défiler : un titre, deux « / N » seuls dans leur rangée en haut, 40 critères.
const N = 40;
const LONGUE = '<table><tr><td colspan="3">Grille fictive longue</td></tr>'
    + '<tr><td colspan="3">/ 2</td></tr>'
    + '<tr><td colspan="3">/ 3</td></tr>'
    + Array.from({ length: N }, (x, i) => `<tr><td>Critère fictif ${i + 1}</td><td>Ce que la copie fictive ${i + 1} montre</td><td>/ ${i + 4}</td></tr>`).join('')
    + '</table>';

// La même, fermée par une rangée de sous-total (D3) ; « / 180 » n'est le texte d'aucun autre morceau.
const LONGUE_SOUS_TOTAL = LONGUE.replace('</table>', '<tr><td colspan="2">Sous-total fictif</td><td>/ 180</td></tr></table>');

async function ouvrir(page, html = LONGUE) {
    // Sous un banc, l'interrupteur arrive fermé (`navigator.webdriver`, js/materiel-aide.js) : ce banc éteint le drapeau.
    await page.addInitScript(() => {
        Object.defineProperty(Navigator.prototype, 'webdriver', { get: () => false });
        try { if (!localStorage.getItem('laboCodex.vue')) localStorage.setItem('laboCodex.vue', 'etendue'); } catch (e) { /* rien */ }
    });
    await ouvrirEspaceVide(page, L, { hauteur: H });
    await page.evaluate(() => naviguerVers('conception', 'materiel'));
    await expect(bulle(page).locator('.parcours-bulle-titre')).toHaveText(TITRE, { timeout: 10000 });
    await page.evaluate((h) => {
        const zone = document.getElementById('materiel-zone-collage');
        const ev = new Event('paste', { bubbles: true, cancelable: true });
        Object.defineProperty(ev, 'clipboardData', { value: { getData: (k) => (k === 'text/html' ? h : '') } });
        zone.dispatchEvent(ev);
    }, html);
    await expect(page.locator('#materiel-dissection')).toBeVisible();
}

const gesteEst = (page, texte) => expect.poll(async () => norm(await bulle(page).locator('.parcours-bulle-geste').textContent()),
    { message: 'la ligne du geste', timeout: 5000 }).toBe(texte);
const gesteContient = (page, texte) => expect.poll(async () => norm(await bulle(page).locator('.parcours-bulle-geste').textContent()),
    { message: 'la ligne du geste', timeout: 5000 }).toContain(texte);

const prendre = (page, type) => page.locator(etiquette(type)).evaluate((b) => { if (b.getAttribute('aria-pressed') !== 'true') b.click(); });

/** Un toucher sur un morceau, là où il est : ce banc ne fait JAMAIS défiler lui-même (pas de `scrollIntoView`). */
async function toucher(page, texte) {
    const ok = await page.evaluate((t) => {
        const b = [...document.querySelectorAll('#dissection-contenu .dissection-morceau')].find((x) => x.textContent === t);
        if (!b) return 'absent';
        const r = b.getBoundingClientRect(), c = document.getElementById('dissection-canevas').getBoundingClientRect();
        if (r.top < c.top || r.bottom > c.bottom) return 'hors du canevas';
        const o = { bubbles: true, cancelable: true, pointerId: 3, pointerType: 'mouse', isPrimary: true, clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 };
        b.dispatchEvent(new PointerEvent('pointerdown', o));
        b.dispatchEvent(new PointerEvent('pointerup', o));
        return 'touché';
    }, texte);
    expect(ok, 'morceau « ' + texte + ' »').toBe('touché');
}

const defilements = (page) => page.evaluate(() => {
    const c = document.getElementById('dissection-canevas'), p = document.getElementById('dissection-palette');
    return { canevas: c.scrollTop, legende: p.scrollTop };
});
/** Deux images, puis le tour du moteur : la carte a eu le temps de redessiner (et, avant le correctif, de ramener). */
const laisserRedessiner = (page) => page.evaluate(() => new Promise((ok) => requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(ok, 250)))));

async function auBas(page) {
    await page.evaluate(() => {
        const c = document.getElementById('dissection-canevas'), p = document.getElementById('dissection-palette');
        c.scrollTop = c.scrollHeight; p.scrollTop = p.scrollHeight;
    });
    await laisserRedessiner(page);
}

async function etiqueterLeHaut(page) {
    await prendre(page, 'titre');
    await toucher(page, 'Grille fictive longue');
    await prendre(page, 'ponderation');
    await toucher(page, '/ 2');
    await gesteContient(page, '« / 2 » est seul dans sa rangée');
}

test(`D1 · ${L} × ${H} : trois morceaux étiquetés en bas, le canevas et la légende ne bougent pas`, async ({ page }) => {
    test.setTimeout(180000);
    await ouvrir(page);
    await etiqueterLeHaut(page);
    const etendue = await page.evaluate(() => { const c = document.getElementById('dissection-canevas'); return c.scrollHeight - c.clientHeight; });
    expect(etendue, 'la grille fictive dépasse le canevas : il défile').toBeGreaterThan(300);

    // La personne descend dans sa grille (et dans la légende), puis étiquette trois morceaux du bas.
    await auBas(page);
    const depart = await defilements(page);
    expect(depart.canevas, 'le canevas est défilé vers le bas').toBeGreaterThan(300);
    await prendre(page, 'critere');
    await laisserRedessiner(page);
    expect((await defilements(page)).canevas, 'prendre une étiquette ne déplace pas le canevas').toBeCloseTo(depart.canevas, 0);
    const avant = await defilements(page);
    for (const n of [N, N - 1, N - 2]) {
        await toucher(page, 'Critère fictif ' + n);
        await laisserRedessiner(page);
        const apres = await defilements(page);
        expect(Math.abs(apres.canevas - avant.canevas), `après « Critère fictif ${n} », le canevas n’a pas bougé (${avant.canevas} → ${apres.canevas})`).toBeLessThanOrEqual(1);
        expect(Math.abs(apres.legende - avant.legende), `après « Critère fictif ${n} », la légende n’a pas bougé (${avant.legende} → ${apres.legende})`).toBeLessThanOrEqual(1);
    }
    // Les trois étiquettes sont bien posées (le banc n'a pas mesuré un geste sans effet), et la carte désigne toujours le haut.
    expect(await page.evaluate(() => Object.values(materielDissection.etatCourant().liens).filter((t) => t === 'critere').length)).toBe(3);
    await gesteContient(page, '« / 2 » est seul dans sa rangée');
});

test(`D2 · ${L} × ${H} : le morceau désigné change à la suite d’un geste dans le canevas, le canevas ne bouge pas ; l’interrupteur de la carte l’y amène`, async ({ page }) => {
    test.setTimeout(180000);
    await ouvrir(page);
    await etiqueterLeHaut(page);
    // Un second « / N » seul dans sa rangée, en haut, puis la personne descend.
    await toucher(page, '/ 3');
    await laisserRedessiner(page);
    await auBas(page);
    const avant = await defilements(page);
    expect(avant.canevas).toBeGreaterThan(300);
    // « / 2 » perd son étiquette par un geste… fait d'en bas ? Il est hors de vue : le geste qui change le morceau désigné
    // se fait par l'état, comme le ferait un toucher (même chemin : `choisir`, puis le pointeur sur le morceau).
    await page.evaluate(() => {
        const c = document.getElementById('dissection-canevas'), garde = c.scrollTop;
        const b = [...document.querySelectorAll('#dissection-contenu .dissection-morceau')].find((x) => x.textContent === '/ 2');
        c.scrollTop = 0;
        const r = b.getBoundingClientRect();
        const o = { bubbles: true, cancelable: true, pointerId: 3, pointerType: 'mouse', isPrimary: true, clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 };
        b.dispatchEvent(new PointerEvent('pointerdown', o));
        b.dispatchEvent(new PointerEvent('pointerup', o));
        c.scrollTop = garde;   // dans la même tâche : la personne est restée en bas, le redessin vient ensuite
    });
    await gesteContient(page, '« / 3 » est seul dans sa rangée');
    await laisserRedessiner(page);
    const apres = await defilements(page);
    expect(Math.abs(apres.canevas - avant.canevas), `le morceau désigné a changé, le canevas n’a pas bougé (${avant.canevas} → ${apres.canevas})`).toBeLessThanOrEqual(1);

    // La personne agit sur la carte : fermée, puis rouverte par son interrupteur. Le canevas va au morceau désigné.
    const bascule = page.locator('#materiel-aide-bascule');
    await bascule.evaluate((b) => b.click());
    await expect(bulle(page)).toHaveCount(0);
    await bascule.evaluate((b) => b.click());
    await expect(bulle(page).locator('.parcours-bulle-titre')).toHaveText(TITRE);
    await expect.poll(async () => (await defilements(page)).canevas, { message: 'la carte rouverte amène « / 3 » dans le canevas' }).toBeLessThan(avant.canevas - 100);
    const vu = await page.evaluate(() => {
        const b = [...document.querySelectorAll('#dissection-contenu .dissection-morceau')].find((x) => x.textContent === '/ 3');
        const r = b.getBoundingClientRect(), c = document.getElementById('dissection-canevas').getBoundingClientRect();
        return r.top >= c.top && r.bottom <= c.bottom;
    });
    expect(vu, '« / 3 » se voit dans le canevas').toBe(true);
});

test(`D3 · ${L} × ${H} : « Sous-total » posé en bas, carte ouverte, le canevas et la légende ne bougent pas`, async ({ page }) => {
    test.setTimeout(180000);
    await ouvrir(page, LONGUE_SOUS_TOTAL);
    await etiqueterLeHaut(page);
    await auBas(page);
    expect((await defilements(page)).canevas, 'le canevas est défilé vers le bas').toBeGreaterThan(300);
    await prendre(page, 'soustotal');
    await expect(page.locator(etiquette('soustotal'))).toHaveAttribute('aria-pressed', 'true');
    await laisserRedessiner(page);
    const avant = await defilements(page);
    await toucher(page, '/ 180');
    await laisserRedessiner(page);
    const apres = await defilements(page);
    expect(Math.abs(apres.canevas - avant.canevas), `après « Sous-total » sur « / 180 », le canevas n’a pas bougé (${avant.canevas} → ${apres.canevas})`).toBeLessThanOrEqual(1);
    expect(Math.abs(apres.legende - avant.legende), `après « Sous-total » sur « / 180 », la légende n’a pas bougé (${avant.legende} → ${apres.legende})`).toBeLessThanOrEqual(1);
    // L'étiquette est bien posée (le banc n'a pas mesuré un geste sans effet) : le morceau la porte, la lecture la compte.
    await expect(page.locator('#dissection-contenu .dissection-morceau.dis-t-soustotal')).toHaveText('/ 180');
    expect(await page.evaluate(() => Object.values(materielDissection.etatCourant().liens).filter((t) => t === 'soustotal').length)).toBe(1);
    await gesteContient(page, '« / 2 » est seul dans sa rangée');
});
