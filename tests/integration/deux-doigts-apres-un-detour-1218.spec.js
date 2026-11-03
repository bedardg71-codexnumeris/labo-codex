import { test, expect } from '@playwright/test';
import { ouvrirCopie, attendre } from './harness/banc-copie-annotation.js';

// #1218 — DEUX DOIGTS FONT DÉFILER LA COPIE APRÈS UN DÉTOUR (rapport de Grégoire du 2 nov. 2026, 19 h 30, iPad,
// Safari 27.2, 1.231.0, « gênant ») : « Je ne peux pas scroller dans la page d'annotation et d'évaluation. »
//
// La cause : les gestes de la visionneuse (deux doigts, pincement, molette) visent UN cadre, le dernier désigné. La vue
// côte à côte (une évaluation consultée hors d'Évaluer) et la Modélisation désignent le leur ; la visionneuse d'Annoter,
// créée une seule fois, ne se redésignait pas au retour. Deux doigts sur sa copie annulaient le défilement natif et
// faisaient défiler le cadre du détour, caché ou retiré : rien ne bougeait, en Annoter comme en Évaluer.
// Mesuré rouge sur le code d'avant (le défilement reste où il est).
//
// ⚠ CE BANC NE PROUVE PAS LE GESTE : les événements tactiles sont fabriqués et envoyés au canevas d'annotation, comme
// dans `annotation-deux-doigts-page.spec.js`. Il juge quel cadre défile. Le geste réel passe par la porte terrain.

const toucher = (page, nom, doigts, leves = []) => page.evaluate(({ nom, doigts, leves }) => {
    const liste = (l) => l.map((d) => ({ clientX: d.x, clientY: d.y, touchType: 'direct' }));
    const ev = new Event(nom, { bubbles: true, cancelable: true });
    ev.touches = liste(doigts);
    ev.changedTouches = liste(leves);
    document.getElementById('travaux-canvas-annotation').dispatchEvent(ev);
}, { nom, doigts, leves });

const defilement = (page) => page.evaluate(() => {
    const c = document.getElementById('travaux-canvas-container');
    return { x: c.scrollLeft, y: c.scrollTop };
});

// Le défilement part d'une valeur non nulle, pour qu'il puisse aller dans les deux sens.
const glisserDeuxDoigts = async (page, dx, dy) => {
    await page.evaluate(() => {
        const c = document.getElementById('travaux-canvas-container');
        c.scrollLeft = 200; c.scrollTop = 100;
    });
    await toucher(page, 'touchstart', [{ x: 300, y: 300 }, { x: 400, y: 300 }]);
    await toucher(page, 'touchmove', [{ x: 300 + dx, y: 300 + dy }, { x: 400 + dx, y: 300 + dy }]);
    await toucher(page, 'touchend', [], [{ x: 300 + dx, y: 300 + dy }, { x: 400 + dx, y: 300 + dy }]);
};

/** La vue côte à côte, ouverte puis refermée par son bouton, comme depuis la liste des évaluations. */
const detourParLaVueCoteACote = async (page, { fermer }) => {
    await page.evaluate(async () => {
        const grille = document.createElement('div');
        grille.id = 'grille-detour-1218';
        document.getElementById('section-evaluations').appendChild(grille);
        await window.travauxUI.ouvrirVueCoteACote('FT651', grille);
    });
    await attendre(page, 800);
    if (fermer) await page.evaluate(() => window.travauxUI.fermerVueCoteACote());
};

/** Un autre cadre désigné aux gestes, comme le fait la Modélisation à l'ouverture d'un modèle. */
const detourParUnAutreCadre = (page) => page.evaluate(() => {
    const cadre = document.createElement('div');
    cadre.className = 'travaux-canvas-container';
    cadre.innerHTML = '<div class="travaux-canvas-wrapper"></div>';
    document.body.appendChild(cadre);
    window.travauxVisionneuse.configurerGestesZoom(cadre);
    cadre.remove();
});

/** Revenir à la copie par la liste des évaluations (« Annoter »), sans reconstruire la visionneuse. */
const revenirALaCopie = async (page) => {
    await page.evaluate(() => window.executerActionEval({ value: 'annoter|FT651|p651-1' }));
    await attendre(page, 1500);
};

test.describe('#1218 — deux doigts font défiler la copie après un détour', () => {
    test('après la vue côte à côte refermée, en Annoter', async ({ page }) => {
        await ouvrirCopie(page);
        await detourParLaVueCoteACote(page, { fermer: true });
        await revenirALaCopie(page);
        expect(await page.evaluate(() => document.querySelectorAll('#travaux-canvas-container').length)).toBe(1);
        await glisserDeuxDoigts(page, -40, -30);
        expect(await defilement(page)).toEqual({ x: 240, y: 130 });
    });

    test('après la vue côte à côte restée ouverte, en Annoter', async ({ page }) => {
        await ouvrirCopie(page);
        await detourParLaVueCoteACote(page, { fermer: false });
        await revenirALaCopie(page);
        await glisserDeuxDoigts(page, -40, -30);
        expect(await defilement(page)).toEqual({ x: 240, y: 130 });
    });

    test('après un autre cadre désigné (Modélisation), en Annoter puis en Évaluer', async ({ page }) => {
        await ouvrirCopie(page);
        await detourParUnAutreCadre(page);
        await revenirALaCopie(page);
        await glisserDeuxDoigts(page, -40, -30);
        expect(await defilement(page)).toEqual({ x: 240, y: 130 });

        await page.evaluate(() => window.travauxUI.basculerMode('evaluer'));
        await page.waitForFunction(() => window.travauxUI.getModeCourant() === 'evaluer');
        await attendre(page, 600);
        await glisserDeuxDoigts(page, 40, 30);
        expect(await defilement(page)).toEqual({ x: 160, y: 70 });
    });

    test('rouvrir la copie n’ajoute aucun écouteur au cadre', async ({ page }) => {
        // `configurerGestesZoom` est maintenant rappelée à chaque copie ouverte : sur un cadre déjà équipé, elle le
        // redésigne sans reposer ses écouteurs. Le navigateur ignore un écouteur nommé posé deux fois, pas un écouteur
        // anonyme (`configurerPan` en pose un sur le cadre, et un sur `window`) : sans la garde, chaque copie en ajouterait.
        await ouvrirCopie(page);
        await page.evaluate(() => {
            const cadre = document.getElementById('travaux-canvas-container');
            const original = EventTarget.prototype.addEventListener;
            window.__poses1218 = 0;
            EventTarget.prototype.addEventListener = function () {
                if (this === cadre) window.__poses1218++;
                return original.apply(this, arguments);
            };
            window.__retablir1218 = () => { EventTarget.prototype.addEventListener = original; };
        });
        // Témoin : l'espion voit bien une pose sur le cadre.
        expect(await page.evaluate(() => {
            document.getElementById('travaux-canvas-container').addEventListener('focus', function () {});
            return window.__poses1218;
        })).toBe(1);
        await revenirALaCopie(page);
        await revenirALaCopie(page);
        expect(await page.evaluate(() => { window.__retablir1218(); return window.__poses1218; })).toBe(1);
    });
});
