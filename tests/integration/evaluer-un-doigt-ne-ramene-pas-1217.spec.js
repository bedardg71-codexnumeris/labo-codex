import { test, expect } from '@playwright/test';
import { ouvrirCopie, compteAnnotations, attendre } from './harness/banc-copie-annotation.js';

// #1217 — EN ÉVALUER, TOUCHER LA COPIE DU DOIGT NE RAMÈNE PLUS EN ANNOTER (consigne du 2 nov. 2026).
//
// Rapport de Grégoire, 2 nov., 8 h 04 (iPad, Safari 27.2, 1.230.0, « gênant ») : « En mode Évaluer, aussitôt que je
// touche au canevas je retombe en mode Annoter. » En Évaluer, il relit et fait défiler la copie à deux doigts.
// Sous Sélection, le premier doigt passait jusqu'à `avantPremiereAnnotation()` ; sous un code ou un tampon, le toucher
// posait (#1123) et basculait. Un défilement à deux doigts commence par un doigt : il basculait avant le second.
//
// La règle : en Évaluer, un doigt parcourt la copie, il n'annote jamais. Le stylet annote et ramène en Annoter ;
// en Annoter, rien ne change.
//
// ⚠ CE BANC NE PROUVE PAS LE GESTE : le WebKit de bureau n'a ni doigt ni stylet. Les événements sont fabriqués
// (`pointerType`, `isPrimary`, et les `touches` du défilement) et envoyés au canevas d'annotation. Le geste réel
// passe par la porte terrain.

const pointeur = (page, nom, type, id, primaire, fx = 0.4, fy = 0.4) => page.evaluate(({ nom, type, id, primaire, fx, fy }) => {
    const c = document.getElementById('travaux-canvas-annotation');
    const r = c.getBoundingClientRect();
    c.dispatchEvent(new PointerEvent(nom, { bubbles: true, cancelable: true, pointerType: type, pointerId: id, isPrimary: primaire,
        button: 0, buttons: nom === 'pointerup' ? 0 : 1, clientX: r.left + r.width * fx, clientY: r.top + r.height * fy }));
}, { nom, type, id, primaire, fx, fy });

const toucher = (page, nom, doigts, leves = []) => page.evaluate(({ nom, doigts, leves }) => {
    const liste = (l) => l.map((d) => ({ clientX: d.x, clientY: d.y, touchType: 'direct' }));
    const ev = new Event(nom, { bubbles: true, cancelable: true });
    ev.touches = liste(doigts); ev.changedTouches = liste(leves);
    document.getElementById('travaux-canvas-annotation').dispatchEvent(ev);
}, { nom, doigts, leves });

const mode = (page) => page.evaluate(() => window.travauxUI.getModeCourant());
const defilement = (page) => page.evaluate(() => {
    const c = document.getElementById('travaux-canvas-container');
    return { x: c.scrollLeft, y: c.scrollTop };
});

async function enEvaluer(page) {
    await ouvrirCopie(page);
    await page.evaluate(() => window.travauxUI.basculerMode('evaluer'));
    await page.waitForFunction(() => window.travauxUI.getModeCourant() === 'evaluer');
    await attendre(page, 600);
}
const choisirCode = (page) => page.evaluate(() => {
    if (!document.getElementById('travaux-palette-erreurs-fr')) window.travauxOutils.togglePaletteErreursFrancais();
    const el = document.querySelector('.travaux-errfr-item'); el.click();
    return el.dataset.param;
});
const choisirTampon = (page) => page.evaluate(() => {
    if (!document.getElementById('travaux-palette-tampons')) window.travauxOutils.togglePaletteAutocollants();
    document.querySelector('#travaux-palette-tampons .travaux-autocollant-item[data-action="travauxOutils.setAutocollantActif"]').click();
});
const toucherUnDoigt = async (page) => {
    await pointeur(page, 'pointerdown', 'touch', 11, true);
    await pointeur(page, 'pointerup', 'touch', 11, true);
};
// Le défilement à deux doigts, tel que Safari l'envoie : le premier doigt, puis le second, puis le glissé.
const defilerDeuxDoigts = async (page) => {
    await pointeur(page, 'pointerdown', 'touch', 21, true, 0.4, 0.4);
    await toucher(page, 'touchstart', [{ x: 300, y: 500 }]);
    await pointeur(page, 'pointerdown', 'touch', 22, false, 0.6, 0.4);
    await toucher(page, 'touchstart', [{ x: 300, y: 500 }, { x: 400, y: 500 }]);
    await toucher(page, 'touchmove', [{ x: 300, y: 440 }, { x: 400, y: 440 }]);
    await toucher(page, 'touchend', [], [{ x: 300, y: 440 }, { x: 400, y: 440 }]);
    await pointeur(page, 'pointerup', 'touch', 22, false, 0.6, 0.4);
    await pointeur(page, 'pointerup', 'touch', 21, true, 0.4, 0.4);
};

test.describe('#1217 · en Évaluer, un doigt parcourt la copie sans revenir en Annoter', () => {
    test.beforeEach(async ({ page }) => { await page.setViewportSize({ width: 1180, height: 820 }); });

    test('sous Sélection, un toucher laisse en Évaluer et ne sélectionne rien', async ({ page }) => {
        await enEvaluer(page);
        await page.evaluate(() => window.travauxOutils.setOutilActif('selection'));
        await toucherUnDoigt(page);
        await attendre(page, 300);
        expect(await mode(page)).toBe('evaluer');
    });

    test('sous Sélection, un défilement à deux doigts laisse en Évaluer, et la copie défile', async ({ page }) => {
        await enEvaluer(page);
        await page.evaluate(() => window.travauxOutils.setOutilActif('selection'));
        const avant = await defilement(page);
        await defilerDeuxDoigts(page);
        await attendre(page, 300);
        expect(await mode(page)).toBe('evaluer');
        expect((await defilement(page)).y).toBe(avant.y + 60);
    });

    test('un code actif : un toucher ne pose rien et laisse en Évaluer ; deux doigts non plus', async ({ page }) => {
        await enEvaluer(page);
        await choisirCode(page);
        await toucherUnDoigt(page);
        await defilerDeuxDoigts(page);
        await attendre(page, 300);
        expect(await mode(page)).toBe('evaluer');
        expect(await compteAnnotations(page)).toEqual({ shapes: 0, stickers: 0, strokes: 0 });
    });

    test('un tampon actif : un toucher ne pose rien et laisse en Évaluer', async ({ page }) => {
        await enEvaluer(page);
        await choisirTampon(page);
        await toucherUnDoigt(page);
        await attendre(page, 300);
        expect(await mode(page)).toBe('evaluer');
        expect((await compteAnnotations(page)).stickers).toBe(0);
    });

    test('le stylet, lui, pose le tampon et ramène en Annoter', async ({ page }) => {
        await enEvaluer(page);
        await choisirTampon(page);
        await pointeur(page, 'pointerdown', 'pen', 31, true);
        await pointeur(page, 'pointerup', 'pen', 31, true);
        await attendre(page, 300);
        expect(await mode(page)).toBe('annoter');
        expect((await compteAnnotations(page)).stickers).toBe(1);
    });

    test('en Annoter, rien ne change : un toucher sous un tampon le pose (#1123)', async ({ page }) => {
        await ouvrirCopie(page);
        await choisirTampon(page);
        await toucherUnDoigt(page);
        await attendre(page, 300);
        expect(await mode(page)).toBe('annoter');
        expect((await compteAnnotations(page)).stickers).toBe(1);
    });
});
