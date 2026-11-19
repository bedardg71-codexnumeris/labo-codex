import { test, expect } from '@playwright/test';
import { ouvrirCopie, compteAnnotations, attendre } from './harness/banc-copie-annotation.js';

// lot/dessiner-au-doigt (18 nov. 2026, vécu par Grégoire sur l'iPad : sans crayon, rien ne se trace).
// Le choix « Dessiner au doigt », éteint par défaut. Écran tactile, iPad couché (1180 × 820) et debout (820 × 1180).
//
// DEUX CHEMINS, selon le navigateur :
//  · CHROMIUM : de VRAIS gestes tactiles (CDP `Input.dispatchTouchEvent`). Le navigateur produit lui-même les
//    événements de pointeur et de toucher, et décide du défilement natif selon le `touch-action` du canevas.
//    Mesuré le 19 nov. : sur la copie, choix éteint, un doigt seul ne fait RIEN (ni trait ni défilement : le canevas
//    est à `touch-action: none` depuis toujours) ; hors de la copie, le même glissé défile (169 px).
//  · WEBKIT (le Mac de Grégoire) : pas de CDP. Les événements sont fabriqués et envoyés au canevas, comme
//    annotation-deux-doigts-page.spec.js : ils jugent la logique, pas le geste. Le geste réel : la porte terrain.

const ID_CANEVAS = 'travaux-canvas-annotation';

const defilement = (page) => page.evaluate(() => {
    const c = document.getElementById('travaux-canvas-container');
    return { x: c.scrollLeft, y: c.scrollTop };
});

/** Cadre la copie dans l'écran, à droite de la palette d'annotation ; rend le point où poser le premier doigt. */
async function cadrer(page) {
    const depart = await page.evaluate((id) => {
        const c = document.getElementById('travaux-canvas-container');
        window.scrollTo(0, document.scrollingElement.scrollHeight);
        const k = document.getElementById(id).getBoundingClientRect();
        const r = c.getBoundingClientRect();
        // À droite de la palette d'annotation (200 px, à 12 px du bord) : un doigt posé sur elle ne touche pas la copie.
        c.scrollLeft += k.left - r.left - 240;
        c.scrollTop += k.top - r.top - 60;
        // Le premier point où les deux doigts (le second 120 px à droite) et le glissé (160 px de plus) tombent sur la
        // copie, et non sur une palette (en Évaluer, debout, les palettes d'Évaluer en couvrent une part).
        const canevas = document.getElementById(id);
        const b = canevas.getBoundingClientRect();
        const libre = (x, y) => [0, 120, 160, 280].every((dx) => document.elementFromPoint(x + dx, y) === canevas);
        for (let y = b.top + 160; y < Math.min(b.bottom, window.innerHeight) - 60; y += 20) {
            for (let x = Math.max(b.left, 0) + 20; x + 300 < Math.min(b.right, window.innerWidth); x += 20) {
                if (libre(x, y)) return { x, y, surLaCopie: getComputedStyle(canevas).pointerEvents === 'auto' };
            }
        }
        return { surLaCopie: false };
    }, ID_CANEVAS);
    expect(depart.surLaCopie, 'les doigts se posent sur la copie, qui écoute, et non sur une palette').toBe(true);
    return depart;
}

/** La copie ouverte en Annoter, l'outil choisi, la copie cadrée. */
async function preparer(page, outil) {
    await ouvrirCopie(page);
    await page.evaluate((o) => window.travauxOutils.setOutilActif(o), outil);
    return cadrer(page);
}

/**
 * Joue des IMAGES de doigts posés (chacune : [{ id, x, y }]) : un doigt qui apparaît se pose, qui bouge glisse, et tous
 * se lèvent à la fin. Chromium : un vrai geste (CDP). WebKit : des événements fabriqués, pointeur et toucher, envoyés
 * au canevas (le toucher monte jusqu'au conteneur, qui déplace la page à deux doigts).
 */
async function jouer(page, browserName, images) {
    if (browserName === 'chromium') {
        const cdp = await page.context().newCDPSession(page);
        let avant = 0;
        for (const pts of images) {
            await cdp.send('Input.dispatchTouchEvent', { type: pts.length > avant ? 'touchStart' : 'touchMove', touchPoints: pts });
            avant = pts.length;
        }
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        await cdp.detach();
    } else {
        await page.evaluate(({ images, id }) => {
            const c = document.getElementById(id);
            const pointeur = (nom, p) => c.dispatchEvent(new PointerEvent(nom, { bubbles: true, cancelable: true, pointerType: 'touch',
                pointerId: p.id, isPrimary: p.id === 1, button: 0, buttons: nom === 'pointerup' ? 0 : 1, clientX: p.x, clientY: p.y }));
            const toucher = (nom, presents, changes) => {
                const ev = new Event(nom, { bubbles: true, cancelable: true });
                ev.touches = presents.map((p) => ({ clientX: p.x, clientY: p.y, touchType: 'direct' }));
                ev.changedTouches = changes.map((p) => ({ clientX: p.x, clientY: p.y, touchType: 'direct' }));
                c.dispatchEvent(ev);
            };
            let avant = [];
            for (const pts of images) {
                const neufs = pts.filter((p) => !avant.some((q) => q.id === p.id));
                neufs.forEach((p) => pointeur('pointerdown', p));
                if (neufs.length) toucher('touchstart', pts, neufs);
                const bougent = pts.filter((p) => avant.some((q) => q.id === p.id));
                bougent.forEach((p) => pointeur('pointermove', p));
                if (bougent.length) toucher('touchmove', pts, bougent);
                avant = pts;
            }
            avant.forEach((p) => pointeur('pointerup', p));
            toucher('touchend', [], avant);
        }, { images, id: ID_CANEVAS });
    }
    await attendre(page, 300);
}

/** Un glissé de `doigts` (1 ou 2, le second 120 px à droite) de (dx, dy), en dix pas. */
const glisser = (page, browserName, depart, doigts, dx, dy) => jouer(page, browserName, Array.from({ length: 11 }, (_, i) =>
    Array.from({ length: doigts }, (_, n) => ({ id: n + 1, x: depart.x + n * 120 + dx * i / 10, y: depart.y + dy * i / 10 }))));

/** Un trait du crayon (fabriqué : aucun banc n'a de crayon), de (dx, 0), au point donné. */
const traitDuCrayon = (page, depart, dx) => page.evaluate(({ depart, dx, id }) => {
    const c = document.getElementById(id);
    const envoyer = (nom, x) => c.dispatchEvent(new PointerEvent(nom, { bubbles: true, cancelable: true, pointerType: 'pen',
        pointerId: 9, isPrimary: true, button: 0, buttons: nom === 'pointerup' ? 0 : 1, pressure: 0.5, clientX: x, clientY: depart.y }));
    envoyer('pointerdown', depart.x);
    for (let i = 1; i <= 10; i++) envoyer('pointermove', depart.x + dx * i / 10);
    envoyer('pointerup', depart.x + dx);
}, { depart, dx, id: ID_CANEVAS });

const allumer = (page, allume) => page.evaluate((a) => window.annotationDoigt.definirAllume(a), allume);

for (const ecran of [{ width: 1180, height: 820 }, { width: 820, height: 1180 }]) {
    test.describe(`Dessiner au doigt — écran tactile ${ecran.width} × ${ecran.height}`, () => {
        test.use({ hasTouch: true, viewport: ecran });

        test('éteint (le défaut) : le doigt ne trace pas, et sur la copie il fait ce qu’il faisait', async ({ page, browserName }) => {
            const depart = await preparer(page, 'surligneur');
            expect(await page.evaluate(() => window.annotationDoigt.estAllume()), 'éteint par défaut').toBe(false);
            const avant = await defilement(page);
            await glisser(page, browserName, depart, 1, 160, -120);
            expect(await compteAnnotations(page)).toEqual({ shapes: 0, stickers: 0, strokes: 0 });
            // Sur la copie, le canevas garde `touch-action: none` (mesuré le 19 nov. : un doigt seul n'y défile pas).
            expect(await page.evaluate((id) => getComputedStyle(document.getElementById(id)).touchAction, ID_CANEVAS)).toBe('none');
            expect(await defilement(page)).toEqual(avant);
        });

        test('allumé : un trait de surligneur au doigt s’écrit', async ({ page, browserName }) => {
            const depart = await preparer(page, 'surligneur');
            await allumer(page, true);
            await glisser(page, browserName, depart, 1, 160, 0);
            expect(await compteAnnotations(page)).toEqual({ shapes: 1, stickers: 0, strokes: 0 });
            const forme = await page.evaluate(() => window.travauxAnnotation.getAnnotationCourante().pages[0].shapes[0]);
            expect(forme.type).toBe('surligneur');
            expect(forme.x2).toBeGreaterThan(forme.x1);   // témoin : le trait suit le doigt
        });

        test('allumé : deux doigts déplacent la page sans rien tracer', async ({ page, browserName }) => {
            const depart = await preparer(page, 'surligneur');
            await allumer(page, true);
            const avant = await defilement(page);
            await glisser(page, browserName, depart, 2, -40, -30);
            expect(await compteAnnotations(page)).toEqual({ shapes: 0, stickers: 0, strokes: 0 });
            const apres = await defilement(page);
            expect(apres.x).toBeGreaterThan(avant.x);
            expect(apres.y).toBeGreaterThan(avant.y);
        });

        test('allumé : un second doigt qui rejoint un trait en cours l’annule', async ({ page, browserName }) => {
            const depart = await preparer(page, 'surligneur');
            await allumer(page, true);
            const un = (i) => ({ id: 1, x: depart.x + 10 * i, y: depart.y });
            const images = [0, 1, 2, 3, 4, 5].map((i) => [un(i)]);
            for (let i = 6; i <= 10; i++) images.push([un(i), { id: 2, x: depart.x + 120, y: depart.y + 10 * (i - 5) }]);
            await jouer(page, browserName, images);
            expect(await compteAnnotations(page)).toEqual({ shapes: 0, stickers: 0, strokes: 0 });
            // Et rien n'en reste peint : le trait commencé s'efface de l'écran (sans quoi un fantôme y reste).
            expect(await page.evaluate((id) => {
                const c = document.getElementById(id);
                const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
                let opaques = 0;
                for (let i = 3; i < d.length; i += 4) if (d[i]) opaques++;
                return opaques;
            }, ID_CANEVAS)).toBe(0);
        });

        test('allumé : le crayon garde la priorité, la paume ne marque pas, puis le doigt trace de nouveau', async ({ page, browserName }) => {
            const depart = await preparer(page, 'surligneur');
            await allumer(page, true);
            await traitDuCrayon(page, { x: depart.x, y: depart.y + 200 }, 120);
            expect(await compteAnnotations(page), 'témoin : le crayon trace').toEqual({ shapes: 1, stickers: 0, strokes: 0 });
            await glisser(page, browserName, depart, 1, 160, 0);   // dans le délai de paume : la paume
            expect(await compteAnnotations(page)).toEqual({ shapes: 1, stickers: 0, strokes: 0 });
            await attendre(page, 600);
            await glisser(page, browserName, depart, 1, 160, 0);
            expect(await compteAnnotations(page)).toEqual({ shapes: 2, stickers: 0, strokes: 0 });
        });

        test('allumé : le crayon posé pendant un trait du doigt le remplace ; un geste repris par Safari ne s’écrit pas', async ({ page }) => {
            const depart = await preparer(page, 'surligneur');
            await allumer(page, true);
            // Des événements fabriqués, dans les deux navigateurs : aucun banc n'a de crayon, ni ne sait faire reprendre
            // un geste par le navigateur (pointercancel).
            const resultat = await page.evaluate(({ depart, id }) => {
                const c = document.getElementById(id);
                const r = c.getBoundingClientRect();
                const envoyer = (nom, type, pid, x, y) => c.dispatchEvent(new PointerEvent(nom, { bubbles: true, cancelable: true, pointerType: type,
                    pointerId: pid, isPrimary: true, button: 0, buttons: nom === 'pointerup' || nom === 'pointercancel' ? 0 : 1, pressure: 0.5, clientX: x, clientY: y }));
                const formes = () => window.travauxAnnotation.getAnnotationCourante().pages[0].shapes;
                // 1. Le doigt trace (la paume), le crayon se pose : le trait du crayon seul s'écrit, là où va le crayon.
                envoyer('pointerdown', 'touch', 1, depart.x, depart.y);
                envoyer('pointermove', 'touch', 1, depart.x + 40, depart.y);
                envoyer('pointerdown', 'pen', 9, depart.x, depart.y + 60);
                envoyer('pointermove', 'pen', 9, depart.x + 100, depart.y + 60);
                envoyer('pointermove', 'touch', 1, depart.x + 160, depart.y + 120);
                envoyer('pointerup', 'pen', 9, depart.x + 100, depart.y + 60);
                envoyer('pointerup', 'touch', 1, depart.x + 160, depart.y + 120);
                const apresCrayon = formes().map((f) => ({ x2: Math.round(f.x2 * c.width + r.left), y2: Math.round(f.y2 * c.height + r.top) }));
                // 2. Plus tard, un trait du doigt que le navigateur reprend (pointercancel) : rien ne s'écrit.
                return new Promise((fin) => setTimeout(() => {
                    envoyer('pointerdown', 'touch', 2, depart.x, depart.y);
                    envoyer('pointermove', 'touch', 2, depart.x + 120, depart.y);
                    envoyer('pointercancel', 'touch', 2, depart.x + 120, depart.y);
                    fin({ apresCrayon, total: formes().length });
                }, 600));
            }, { depart, id: ID_CANEVAS });
            expect(resultat.apresCrayon).toEqual([{ x2: Math.round(depart.x + 100), y2: Math.round(depart.y + 60) }]);
            expect(resultat.total).toBe(1);
        });

        test('allumé, en Évaluer : aucun doigt n’annote, et la copie reste en Évaluer (#1217)', async ({ page, browserName }) => {
            await preparer(page, 'surligneur');
            await allumer(page, true);
            await page.evaluate(() => window.travauxUI.basculerMode('evaluer'));
            await attendre(page, 400);
            // L'outil repris en Évaluer : le canevas écoute de nouveau (le crayon y annote et ramène en Annoter, #1217).
            await page.evaluate(() => window.travauxOutils.setOutilActif('surligneur'));
            expect(await page.evaluate(() => window.travauxUI.getModeCourant())).toBe('evaluer');
            const depart = await cadrer(page);
            await glisser(page, browserName, depart, 1, 160, 0);
            expect(await compteAnnotations(page)).toEqual({ shapes: 0, stickers: 0, strokes: 0 });
            expect(await page.evaluate(() => window.travauxUI.getModeCourant())).toBe('evaluer');
        });
    });
}

test.describe('Dessiner au doigt — l’interrupteur de la palette', () => {
    test.use({ hasTouch: true, viewport: { width: 1180, height: 820 } });

    test('sur un écran tactile, l’interrupteur est dans la compacte et l’étendue, et son état se garde', async ({ page }) => {
        await ouvrirCopie(page);
        const libelle = page.locator('#travaux-palette-flottante .annot-doigt-interrupteur');
        await expect(libelle).toHaveCount(1);
        await expect(libelle).toContainText('Dessiner au doigt');
        const boite = await libelle.boundingBox();
        expect(boite.height).toBeGreaterThanOrEqual(44);
        await libelle.click();
        expect(await page.evaluate(() => window.annotationDoigt.estAllume())).toBe(true);
        expect(await page.evaluate(() => JSON.parse(localStorage.getItem('laboCodex.dessinerAuDoigt')))).toEqual({ allume: true });
        // L'autre version de la palette : le même état, coché.
        const compacteAvant = await page.evaluate(() => document.getElementById('travaux-palette-flottante').classList.contains('annotation-compacte'));
        await page.evaluate(() => window.travauxOutils.basculerVersionPalette('travaux-palette-flottante'));
        expect(await page.evaluate(() => document.getElementById('travaux-palette-flottante').classList.contains('annotation-compacte'))).toBe(!compacteAvant);
        await expect(page.locator('#travaux-palette-flottante .annot-doigt-interrupteur')).toHaveCount(1);
        await expect(page.locator('#travaux-palette-flottante .annot-doigt .interrupteur-case')).toBeChecked();
        await page.locator('#travaux-palette-flottante .annot-doigt-interrupteur').click();
        expect(await page.evaluate(() => JSON.parse(localStorage.getItem('laboCodex.dessinerAuDoigt')))).toEqual({ allume: false });
    });
});

test.describe('Dessiner au doigt — sans écran tactile (le Mac)', () => {
    test.use({ hasTouch: false });

    test('l’interrupteur n’y est pas', async ({ page }) => {
        await ouvrirCopie(page);
        await expect(page.locator('#travaux-palette-flottante')).toHaveCount(1);
        await expect(page.locator('.annot-doigt-interrupteur')).toHaveCount(0);
    });
});
