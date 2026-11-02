import { test, expect } from '@playwright/test';
import { ouvrirCopie, compteAnnotations, attendre } from './harness/banc-copie-annotation.js';

// PARTIE B DE LA CONSIGNE DU 31 OCT. 2026 — DEUX DOIGTS DÉPLACENT LA PAGE, QUEL QUE SOIT L'OUTIL (iPad).
//
// ⚠ CE BANC NE PROUVE PAS LE GESTE. Le WebKit de bureau n'a pas de toucher : les événements sont fabriqués, avec
// leurs `touches`, et envoyés au canevas. Il juge la logique (quelle distance, quels doigts, quel outil). Le geste
// réel passe par la porte terrain. Mesuré le 31 oct. : rouge sur le code d'avant (la page ne bouge pas).

// `doigts` : [{ x, y, type? }], en coordonnées de la fenêtre.
const toucher = (page, nom, doigts, leves = []) => page.evaluate(({ nom, doigts, leves }) => {
    const liste = (l) => l.map((d) => ({ clientX: d.x, clientY: d.y, touchType: d.type || 'direct' }));
    const ev = new Event(nom, { bubbles: true, cancelable: true });
    ev.touches = liste(doigts);
    ev.changedTouches = liste(leves);
    document.getElementById('travaux-canvas-annotation').dispatchEvent(ev);
}, { nom, doigts, leves });

const defilement = (page) => page.evaluate(() => {
    const c = document.getElementById('travaux-canvas-container');
    return { x: c.scrollLeft, y: c.scrollTop };
});
// La page part d'un défilement non nul, pour qu'elle puisse aller dans les deux sens.
const preparer = async (page, outil) => {
    await ouvrirCopie(page);
    await page.evaluate((outil) => {
        window.travauxOutils.setOutilActif(outil);
        const c = document.getElementById('travaux-canvas-container');
        c.scrollLeft = 200; c.scrollTop = 100;
    }, outil);
};
const glisserDeuxDoigts = async (page, dx, dy) => {
    await toucher(page, 'touchstart', [{ x: 300, y: 300 }, { x: 400, y: 300 }]);
    await toucher(page, 'touchmove', [{ x: 300 + dx, y: 300 + dy }, { x: 400 + dx, y: 300 + dy }]);
    await toucher(page, 'touchend', [], [{ x: 300 + dx, y: 300 + dy }, { x: 400 + dx, y: 300 + dy }]);
};

test.describe('Deux doigts déplacent la page', () => {
    for (const outil of ['stylo', 'selection', 'texte', 'cercle']) {
        test(`outil ${outil} : la page suit les doigts`, async ({ page }) => {
            await preparer(page, outil);
            const avant = await defilement(page);
            await glisserDeuxDoigts(page, -40, -30);
            expect(await defilement(page)).toEqual({ x: avant.x + 40, y: avant.y + 30 });
            expect(await compteAnnotations(page)).toEqual({ shapes: 0, stickers: 0, strokes: 0 });
        });
    }

    test('un doigt seul ne déplace rien', async ({ page }) => {
        await preparer(page, 'stylo');
        const avant = await defilement(page);
        await toucher(page, 'touchstart', [{ x: 300, y: 300 }]);
        await toucher(page, 'touchmove', [{ x: 260, y: 270 }]);
        expect(await defilement(page)).toEqual(avant);
    });

    test('le Pencil posé : ce n’est pas deux doigts, et juste après, ce sont les paumes', async ({ page }) => {
        await preparer(page, 'stylo');
        const avant = await defilement(page);
        await toucher(page, 'touchstart', [{ x: 300, y: 300, type: 'stylus' }, { x: 400, y: 300 }]);
        await toucher(page, 'touchmove', [{ x: 260, y: 270, type: 'stylus' }, { x: 360, y: 270 }]);
        await toucher(page, 'touchend', [], [{ x: 260, y: 270, type: 'stylus' }, { x: 360, y: 270 }]);
        await glisserDeuxDoigts(page, -40, -30);
        expect(await defilement(page)).toEqual(avant);
        await attendre(page, 600);
        await glisserDeuxDoigts(page, -40, -30);
        expect(await defilement(page)).toEqual({ x: avant.x + 40, y: avant.y + 30 });
    });

    test('un doigt de plus ou de moins ne fait pas sauter la page', async ({ page }) => {
        await preparer(page, 'stylo');
        const avant = await defilement(page);
        await toucher(page, 'touchstart', [{ x: 300, y: 300 }, { x: 400, y: 300 }]);
        await toucher(page, 'touchmove', [{ x: 280, y: 300 }, { x: 380, y: 300 }]);
        await toucher(page, 'touchstart', [{ x: 280, y: 300 }, { x: 380, y: 300 }, { x: 500, y: 500 }]);
        await toucher(page, 'touchmove', [{ x: 280, y: 300 }, { x: 380, y: 300 }, { x: 500, y: 500 }]);
        expect((await defilement(page)).x).toBe(avant.x + 20);
    });

    test('sous l’outil Sélection, le second doigt défait ce que le premier avait commencé', async ({ page }) => {
        await ouvrirCopie(page);
        const etat = await page.evaluate(() => new Promise((fin) => {
            const c = document.getElementById('travaux-canvas-annotation');
            const r = c.getBoundingClientRect();
            const envoyer = (nom, id, primaire, x, y) => c.dispatchEvent(new PointerEvent(nom, { bubbles: true, cancelable: true,
                pointerType: 'touch', pointerId: id, isPrimary: primaire, button: 0, buttons: 1, clientX: r.left + x, clientY: r.top + y }));
            const p = window.travauxAnnotation.getAnnotationCourante();
            p.pages[0] = { strokes: [], stickers: [], textAnnotations: [], shapes: [{ id: 'SH_1', type: 'rectangle', color: '#000000', lineWidth: 2,
                x1: 40 / r.width, y1: 40 / r.height, x2: 120 / r.width, y2: 120 / r.height }] };
            window.travauxOutils.setOutilActif('selection');
            const avant = p.pages[0].shapes[0].x1;
            envoyer('pointerdown', 1, true, 42, 80);
            envoyer('pointermove', 1, true, 70, 80);
            const pendant = window.travauxAnnotation.getAnnotationCourante().pages[0].shapes[0].x1;
            envoyer('pointerdown', 2, false, 200, 200);
            envoyer('pointermove', 1, true, 120, 80);
            envoyer('pointerup', 1, true, 120, 80);
            envoyer('pointerup', 2, false, 200, 200);
            fin({ avant, pendant, apres: window.travauxAnnotation.getAnnotationCourante().pages[0].shapes[0].x1 });
        }));
        expect(etat.pendant).not.toBe(etat.avant); // témoin : le premier doigt avait bien commencé à déplacer
        expect(etat.apres).toBe(etat.avant);
    });

    test('le pincement et le glissé cohabitent : un glissé ne zoome pas, un pincement oui, et rien ne saute à la fin', async ({ page }) => {
        await preparer(page, 'stylo');
        // Le document bien dans le cadre : hors du cadre, le point visé tombe hors de la page, et le défilement
        // bute à zéro au re-rendu, ce qui n'est pas ce qu'on juge ici.
        await page.evaluate(() => {
            const c = document.getElementById('travaux-canvas-container');
            const k = document.getElementById('travaux-canvas-document').getBoundingClientRect();
            const r = c.getBoundingClientRect();
            c.scrollLeft += k.left - r.left - 300;
            c.scrollTop += k.top - r.top - 60;
        });
        // Le point visé est pris DANS la page visible, d'après le document et non en pixels fixes (2 nov. 2026) : le
        // 1er nov., le cadre raccourci de 241 px avait mis le point fixe (450, 600) hors de la page (fx = 1,08).
        // Le glissé de 120 px vers la gauche qui suit le pousse vers la droite de la page : il part du tiers.
        const { vise, largeurAvant } = await page.evaluate(() => {
            const k = document.getElementById('travaux-canvas-document').getBoundingClientRect();
            const r = document.getElementById('travaux-canvas-container').getBoundingClientRect();
            const g = Math.max(k.left, r.left), d = Math.min(k.right, r.right);
            const h = Math.max(k.top, r.top), b = Math.min(k.bottom, r.bottom);
            return { vise: { x: g + (d - g) / 3, y: (h + b) / 2 }, largeurAvant: k.width };
        });
        const geste = (nom, scale) => page.evaluate(({ nom, scale, vise }) => {
            const ev = new Event(nom, { bubbles: true, cancelable: true });
            ev.scale = scale; ev.pageX = vise.x; ev.pageY = vise.y;
            document.getElementById('travaux-canvas-annotation').dispatchEvent(ev);
        }, { nom, scale, vise });
        const apercu = () => page.evaluate(() => document.getElementById('travaux-canvas-wrapper').style.transform);
        const estSafari = await page.evaluate(() => typeof GestureEvent !== 'undefined');
        test.skip(!estSafari, 'Le chemin Safari exige GestureEvent.');

        await toucher(page, 'touchstart', [{ x: 300, y: 300 }, { x: 400, y: 300 }]);
        await geste('gesturestart', 1);
        await geste('gesturechange', 1.03);
        expect(await apercu()).toBe(''); // sous le seuil : ils glissent

        // Le seuil franchi à 1,1, l'échelle repart de 1 ; 1,65 vaut donc un zoom de 1,5.
        await geste('gesturechange', 1.1);
        await geste('gesturechange', 1.65);
        expect(await apercu()).toBe('scale(1.5)');

        // L'aperçu : où est le point fixe, une fois la page défilée ? Il doit rester là après le re-rendu.
        const fraction = () => page.evaluate((vise) => {
            const k = document.getElementById('travaux-canvas-document').getBoundingClientRect();
            return { fx: (vise.x - k.left) / k.width, fy: (vise.y - k.top) / k.height };
        }, vise);
        await toucher(page, 'touchmove', [{ x: 180, y: 300 }, { x: 280, y: 300 }]);
        const f1 = await fraction();
        await geste('gestureend', 1.65);
        await toucher(page, 'touchend', [], [{ x: 180, y: 300 }, { x: 280, y: 300 }]);
        await attendre(page, 800);
        expect(await apercu()).toBe('');
        const f2 = await fraction();
        // Témoins : le zoom a bien eu lieu (1,5 attendu ; un rapport, et non une largeur, qui suivrait la taille du cadre),
        // et le point fixe est jugé dans la page.
        const largeurApres = await page.evaluate(() => document.getElementById('travaux-canvas-document').getBoundingClientRect().width);
        expect(largeurApres / largeurAvant).toBeGreaterThan(1.4);
        for (const f of [f1, f2]) {
            expect(f.fx).toBeGreaterThan(0); expect(f.fx).toBeLessThan(1);
            expect(f.fy).toBeGreaterThan(0); expect(f.fy).toBeLessThan(1);
        }
        // Sans le recalage, le document saute de (1,5 − 1) × 120 px ; sur une page d'environ 600 px, 10 %.
        expect(Math.abs(f2.fx - f1.fx)).toBeLessThan(0.01);
        expect(Math.abs(f2.fy - f1.fy)).toBeLessThan(0.01);
    });
});
