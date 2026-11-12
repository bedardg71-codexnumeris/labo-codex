// =======================================================================
// LA BULLE DU PARCOURS VA À DROITE (12 nov. 2026) — dans un vrai WebKit, à 1180 × 820 et à 820 × 1180
// =======================================================================
// Vécu par Grégoire (iPad Air en paysage, Safari, aperçu n° 21, 12 nov., 12 h 54) : « la carte de l'assistance n'est pas
// déplaçable vers la droite. Elle semble bloquer au centre. » Trois captures : la bulle (380 px) posée à left ≈ 433, soit
// 820 − 8 − 380, sur un écran de 1180 ; le cadre de la bulle croyait la page large de 820.
// Le moteur lit désormais la largeur sur la mise en page (`document.documentElement.clientWidth`), ni sur innerWidth
// (qui suit, sous Safari iPad, la partie visible) ni sur un écran gardé ; et la cible d'un toucher écoute la fin de son
// toucher (un `touchend` dont la cible a quitté le DOM ne remonte plus à `window` : le compte des doigts restait à 2).
//   L1 · la bulle se pose d'elle-même à droite de la grille quand elle y a la place, et sa poignée la mène au bord droit ;
//   L2 · break-test : innerWidth forcé à 820 dans une page de 1180, puis un toucher à deux doigts dont la cible quitte le
//        DOM avant son `touchend` : la bulle se pose encore, et se glisse jusqu'au bord droit.
// Break-tests : voir le rapport du lot (`plans de travail/RAPPORT-2026-11-12-dissection-ipad.md`).
// Grille FICTIVE ; noms d'étudiant·es fictifs (classe-de-banc.js).
import { test, expect } from '@playwright/test';
import { ouvrirEspaceVide, mettreLaClasseEnPlace, attendreEtape, bulle, capture } from './harness/classe-de-banc.js';

const DOSSIER = process.env.CAPTURES_PARCOURS || '';
const TAILLES = [[1180, 820], [820, 1180]];
const MARGE = 8;

const GRILLE = '<table><tr><td colspan="3">Grille fictive de lecture</td></tr>'
    + '<tr><td>Introduction</td><td>Sujet amené, posé, divisé</td><td>/ 5</td></tr>'
    + '<tr><td>Développement</td><td>Arguments et exemples</td><td>/ 30</td></tr>'
    + '<tr><td>Conclusion</td><td>Synthèse et ouverture</td><td>/ 10</td></tr></table>';

/** « Évaluer une première production », étape « Ta grille », la grille fictive collée. */
async function aTaGrille(page, L, H) {
    await ouvrirEspaceVide(page, L, { hauteur: H });
    await mettreLaClasseEnPlace(page);
    await page.evaluate(() => Assistance.parcours().find((p) => p.id === 'evaluer').lancer(0));
    await attendreEtape(page, 1, 9, 'Ta grille', { focus: false });
    await bulle(page).getByRole('button', { name: 'Passer à ma grille' }).click();
    await expect(page.locator('#materiel-accueil')).toBeVisible();
    await page.evaluate((h) => {
        const zone = document.getElementById('materiel-zone-collage');
        const ev = new Event('paste', { bubbles: true, cancelable: true });
        Object.defineProperty(ev, 'clipboardData', { value: { getData: (k) => (k === 'text/html' ? h : '') } });
        zone.dispatchEvent(ev);
    }, GRILLE);
    await expect(page.locator('#materiel-dissection')).toBeVisible();
}

const rectBulle = (page) => page.evaluate(() => {
    const r = document.getElementById('parcours-bulle').getBoundingClientRect();
    return { left: Math.round(r.left), right: Math.round(r.right), top: Math.round(r.top), largeur: Math.round(r.width) };
});

/** Le bord droit de la grille (le texte collé) : la bulle « à droite de la grille » commence au-delà. */
const droiteGrille = (page) => page.evaluate(() => Math.round(document.getElementById('dissection-contenu').getBoundingClientRect().right));

/** Glisse la bulle par sa poignée, au pointeur `type`, de `dx` px vers la droite (au-delà de l'écran s'il le faut). */
async function glisserADroite(page, type, dx) {
    await page.evaluate(([t, d]) => {
        const p = document.querySelector('#parcours-bulle .parcours-bulle-poignee');
        const r = p.getBoundingClientRect();
        const x = r.left + r.width / 2, y = r.top + r.height / 2;
        const o = (cx) => ({ bubbles: true, cancelable: true, pointerId: 41, pointerType: t, isPrimary: true, button: 0, buttons: 1, clientX: cx, clientY: y });
        p.dispatchEvent(new PointerEvent('pointerdown', o(x)));
        p.dispatchEvent(new PointerEvent('pointermove', o(x + d / 2)));
        p.dispatchEvent(new PointerEvent('pointermove', o(x + d)));
        p.dispatchEvent(new PointerEvent('pointerup', o(x + d)));
    }, [type, dx]);
}

// ---------------------------------------------------------------------------------------------------------------
// L1 — posée à droite d'elle-même, glissée jusqu'au bord droit
// ---------------------------------------------------------------------------------------------------------------
for (const [L, H] of TAILLES) {
    for (const type of ['mouse', 'touch']) {
        test(`L1 · ${L} × ${H} · ${type} : la bulle se pose à droite de la grille quand elle y a la place, et va au bord droit`, async ({ page }) => {
            await aTaGrille(page, L, H);
            const pl = await page.evaluate(() => ParcoursMoteur.placement());
            expect(pl.zoom).toBe(false);
            expect(pl.cadre.droite, 'le cadre de la bulle va jusqu’au bord droit de la page').toBe(L - MARGE);
            const r = await rectBulle(page);
            const grille = await droiteGrille(page);
            if (L - MARGE - grille >= r.largeur) {
                expect(r.left, 'assez de place à droite de la grille : la bulle s’y pose').toBeGreaterThanOrEqual(grille);
            }
            if (L === 1180) expect(r.left, 'paysage : plus loin que 820 − 8 − 380 (le symptôme)').toBeGreaterThan(820 - MARGE - 380);
            await capture(page, DOSSIER, `l1-posee-${L}x${H}-${type}`);
            // Ramenée à gauche, puis glissée bien au-delà du bord droit : elle s'arrête au bord droit.
            await glisserADroite(page, type, -L);
            expect((await rectBulle(page)).left).toBe(MARGE);
            await glisserADroite(page, type, 2 * L);
            const apres = await rectBulle(page);
            expect(apres.right, 'glissée par sa poignée, jusqu’au bord droit').toBeGreaterThanOrEqual(L - MARGE - 1);
            expect(apres.right).toBeLessThanOrEqual(L - MARGE + 1);
            await capture(page, DOSSIER, `l1-glissee-${L}x${H}-${type}`);
        });
    }
}

// ---------------------------------------------------------------------------------------------------------------
// L2 — break-test : innerWidth à 820 dans une page de 1180, et un toucher à deux doigts dont la cible quitte le DOM
// ---------------------------------------------------------------------------------------------------------------
test.describe('L2 · au doigt (contexte tactile)', () => {
test.use({ hasTouch: true });
test('L2 · 1180 × 820 : innerWidth faux et deux doigts « restés posés » ne bloquent ni la place ni le glisser', async ({ page }) => {
    await aTaGrille(page, 1180, 820);
    // innerWidth suit la partie visible (le cas soupçonné sur l'iPad) : la page, elle, reste large de 1180.
    await page.evaluate(() => {
        Object.defineProperty(window, 'innerWidth', { configurable: true, get: () => 820 });
        window.dispatchEvent(new Event('resize'));
    });
    // Deux doigts sur un élément de la page, qui quitte le DOM avant la fin du toucher.
    await page.evaluate(() => {
        const el = document.createElement('div');
        el.style.cssText = 'position:fixed;left:600px;top:400px;width:40px;height:40px';
        document.body.appendChild(el);
        // (WebKit refuse `new Touch` : un événement du même type, avec ses listes de doigts.)
        const ev = (type, n) => {
            const e = new Event(type, { bubbles: true, cancelable: true });
            const doigts = Array.from({ length: n }, (_, i) => ({ identifier: i + 1, target: el, clientX: 610 + i, clientY: 410 }));
            Object.defineProperty(e, 'touches', { value: doigts });
            return e;
        };
        el.dispatchEvent(ev('touchstart', 2));
        el.remove();
        el.dispatchEvent(ev('touchend', 0));
    });
    await expect.poll(() => page.evaluate(() => ParcoursMoteur.placement().zoom), { message: 'le compte des doigts revient à 0' }).toBe(false);
    const pl = await page.evaluate(() => ParcoursMoteur.placement());
    expect(pl.cadre.droite, 'le cadre ne suit pas innerWidth').toBe(1180 - MARGE);
    // La sonde la replace encore (le moteur ne se croit plus sous le zoom) : posée à droite de 820.
    await expect.poll(async () => (await rectBulle(page)).left).toBeGreaterThan(820 - MARGE - 380);
    await glisserADroite(page, 'touch', 2400);
    const r = await rectBulle(page);
    expect(r.right, 'glissée jusqu’au bord droit de la page, pas de innerWidth').toBeGreaterThanOrEqual(1180 - MARGE - 1);
    expect(r.right).toBeLessThanOrEqual(1180 - MARGE + 1);
    const svg = await page.evaluate(() => document.querySelector('.parcours-fleches').getAttribute('width'));
    expect(svg, 'la couche des flèches couvre la page entière').toBe('1180');
});
});
