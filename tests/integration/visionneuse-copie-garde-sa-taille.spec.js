import { test, expect } from '@playwright/test';
import { ouvrirCopie, attendre } from './harness/banc-copie-annotation.js';

// LA COPIE GARDE SA TAILLE D'OUVERTURE (consigne du 2 nov. 2026).
//
// Depuis que la zone de travail tient dans l'écran (`67e2f649`, 1er nov.), son cadre est plus court de 241 px, et
// l'ajustement à la hauteur ouvrait la copie 43 % plus étroite. Mesuré sur `6ab4f080` (la 1.229.0), à 1180 × 820,
// hors plein écran, l'image 400 × 600 du banc s'ouvre à 440 px de large (le PDF lettre, 510) ; sur `46a0830d`, 279.
// La copie doit retrouver cette largeur, la zone restant dans l'écran, et son bas s'atteindre dans le cadre.
//
// 3 NOV. 2026 — LA PAGE DÉFILE DE NOUVEAU (Grégoire, sur l'iPad) : la zone remplit l'écran une fois la page défilée, son
// cadre est plus haut que celui de la 1.229.0, et c'est lui qui sert. La copie s'ouvre donc ajustée à ce cadre, plus large
// qu'en 1.229.0 (sa lisibilité, la largeur, compte d'abord : 2 nov.) ; la largeur de la 1.229.0 reste un plancher.

const LARGEUR_1229 = 440;
/** La largeur de l'image 400 × 600 du banc ajustée à la hauteur réelle : celle de la zone du document, que la visionneuse
 *  ajuste (`_obtenirConteneurZoom`, marge de 40 retirée, `_zoomAjuste`). */
const largeurAjusteeAuCadre = (m) => (m.hauteurZoneDocument - 40) * 400 / 600;

const mesure = (page) => page.evaluate(() => {
    const k = document.getElementById('travaux-canvas-document').getBoundingClientRect();
    const r = document.getElementById('travaux-canvas-container').getBoundingClientRect();
    return { largeur: k.width, basDoc: k.bottom, basCadre: r.bottom, hauteurCadre: r.height,
        hauteurZoneDocument: document.getElementById('travaux-conteneur-document').clientHeight,
        pageDefile: document.scrollingElement.scrollHeight > window.innerHeight };
});

test.describe('La copie garde sa taille d’ouverture', () => {
    test.beforeEach(async ({ page }) => {
        await page.setViewportSize({ width: 1180, height: 820 });
    });

    test('hors plein écran, à 1180 × 820, elle s’ouvre ajustée au cadre réel, jamais plus étroite qu’en 1.229.0', async ({ page }) => {
        await ouvrirCopie(page);
        const m = await mesure(page);
        expect(Math.abs(m.largeur - largeurAjusteeAuCadre(m))).toBeLessThanOrEqual(2);
        expect(m.largeur).toBeGreaterThanOrEqual(LARGEUR_1229 - 2);
        expect(m.pageDefile).toBe(true); // la page défile de nouveau (3 nov. 2026)
    });

    test('« Ajuster » après un zoom revient à cette largeur', async ({ page }) => {
        await ouvrirCopie(page);
        const ouverture = (await mesure(page)).largeur;
        await page.evaluate(() => window.travauxVisionneuse.zoomAvant());
        await attendre(page, 400);
        expect((await mesure(page)).largeur).toBeGreaterThan(ouverture * 1.05); // témoin : le zoom a eu lieu
        await page.evaluate(() => window.travauxVisionneuse.zoomAjuster());
        await attendre(page, 400);
        expect(Math.abs((await mesure(page)).largeur - ouverture)).toBeLessThanOrEqual(2);
    });

    test('la molette, puis deux doigts, atteignent le bas de la page dans le cadre', async ({ page }) => {
        await ouvrirCopie(page);
        const r = await page.evaluate(() => {
            const c = document.getElementById('travaux-canvas-container').getBoundingClientRect();
            return { x: c.left + c.width / 2, y: c.top + c.height / 2 };
        });
        await page.mouse.move(r.x, r.y);
        for (let i = 0; i < 20; i++) await page.mouse.wheel(0, 200);
        await attendre(page, 300);
        let m = await mesure(page);
        expect(m.basDoc).toBeLessThanOrEqual(m.basCadre + 1);

        // Retour en haut, puis deux doigts vers le haut (fabriqués : le WebKit de bureau n'a pas de toucher).
        await page.evaluate(() => window.travauxVisionneuse.scrollerEnHaut());
        expect((await mesure(page)).basDoc).toBeGreaterThan((await mesure(page)).basCadre);
        await page.evaluate(() => {
            const cible = document.getElementById('travaux-canvas-annotation');
            const envoyer = (nom, y, leves) => {
                const ev = new Event(nom, { bubbles: true, cancelable: true });
                const doigts = [{ clientX: 300, clientY: y, touchType: 'direct' }, { clientX: 400, clientY: y, touchType: 'direct' }];
                ev.touches = leves ? [] : doigts; ev.changedTouches = leves ? doigts : [];
                cible.dispatchEvent(ev);
            };
            envoyer('touchstart', 700); envoyer('touchmove', 300); envoyer('touchend', 300, true);
        });
        m = await mesure(page);
        expect(m.basDoc).toBeLessThanOrEqual(m.basCadre + 1);
    });

    test('en plein écran, « Ajuster » suit le cadre entier, comme dans la 1.229.0', async ({ page }) => {
        await ouvrirCopie(page);
        await page.evaluate(() => window.travauxUI.togglePleinEcran());
        await page.evaluate(() => window.travauxVisionneuse.zoomAjuster());
        await attendre(page, 400);
        // Mesuré sur `6ab4f080` comme sur `46a0830d` : 520 px. Le correctif ne doit pas y ajouter sa hauteur.
        expect(Math.abs((await mesure(page)).largeur - 520)).toBeLessThanOrEqual(2);
    });
});
