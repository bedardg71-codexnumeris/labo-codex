import { test, expect } from '@playwright/test';
import { ouvrirCopie, compteAnnotations, pointCanevas } from './harness/banc-copie-annotation.js';

// CONSIGNE DU 31 OCT. 2026, PARTIE H — LE TRAIT DES FORMES FERMÉES ET LE POLYGONE SOMMET PAR SOMMET.
// Rendu mesuré aux pixels, à l'écran et par la fonction du PDF que lisent les élèves.

// De vrais clics : la copie doit être à l'écran, hors des palettes (Annotation à gauche, Codes et Tampons à droite).
const ouvrir = async (page) => {
    await page.setViewportSize({ width: 1600, height: 1300 });
    const suivi = await ouvrirCopie(page);
    await page.evaluate(() => {
        const c = document.getElementById('travaux-canvas-container');
        const k = document.getElementById('travaux-canvas-document').getBoundingClientRect();
        const r = c.getBoundingClientRect();
        c.scrollLeft += k.left - r.left - 300;
        c.scrollTop += k.top - r.top - 30;
    });
    return suivi;
};

const choisir = (page, ...ids) => page.evaluate((ids) => ids.forEach((id) => window.travauxOutils.setOutilActif(id)), ids);
const glisser = async (page, de, a) => {
    const p = await pointCanevas(page, de[0], de[1]), q = await pointCanevas(page, a[0], a[1]);
    await page.mouse.move(p.x, p.y);
    await page.mouse.down();
    await page.mouse.move(q.x, q.y, { steps: 3 });
    await page.mouse.up();
};
const toucher = async (page, f) => { const p = await pointCanevas(page, f[0], f[1]); await page.mouse.click(p.x, p.y); };
const formes = (page) => page.evaluate(() => {
    const s = window.travauxAnnotation.getAnnotationCourante();
    return s && s.pages ? Object.values(s.pages).flatMap((p) => p.shapes || []) : [];
});

// Compte les pixels dessinés d'une forme, par la fonction du PDF et sur un canevas blanc de 600 × 600.
const pixelsPDF = (page, forme) => page.evaluate(async (forme) => {
    const c = document.createElement('canvas'); c.width = 600; c.height = 600;
    const ctx = c.getContext('2d');
    await window.travauxExportPDF.dessinerAnnotationsSurCtx(ctx, 600, 600, { strokes: [], textAnnotations: [], stickers: [], shapes: [forme] }, 1);
    const d = ctx.getImageData(0, 0, 600, 600).data;
    let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 40) n++;
    // Hors du tracé plein : les pixels à plus de 3 px du contour mathématique du cercle (centre 0,5 ; rayon 0,3).
    let loin = 0;
    for (let y = 0; y < 600; y++) for (let x = 0; x < 600; x++) {
        if (d[(y * 600 + x) * 4 + 3] > 40 && Math.abs(Math.hypot(x - 300, y - 300) - 180) > 3) loin++;
    }
    return { n, loin };
}, forme);
const pixelsEcran = (page) => page.evaluate(() => {
    const c = document.getElementById('travaux-canvas-annotation');
    const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
    let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 40) n++;
    return n;
});

const CERCLE = { id: 'A', type: 'cercle', color: '#ff0000', lineWidth: 4, x1: 0.2, y1: 0.2, x2: 0.8, y2: 0.8 };

test.describe('Le trait des formes fermées', () => {
    test('la dernière ligne choisie donne son trait, et le segment de ce trait reste marqué', async ({ page }) => {
        await ouvrir(page);
        const marque = () => page.evaluate(() => [...document.querySelectorAll('#travaux-palette-flottante .trait-courant')].map((b) => b.dataset.outil));
        // Au départ : plein, sans propriété.
        await choisir(page, 'cercle');
        expect(await marque()).toEqual(['fleche']);
        await glisser(page, [0.2, 0.2], [0.4, 0.4]);
        await choisir(page, 'pointille', 'cercle');
        expect(await marque()).toEqual(['pointille']);
        expect(await page.evaluate(() => document.querySelector('[data-outil="pointille"]').classList.contains('actif'))).toBe(false);
        await glisser(page, [0.5, 0.2], [0.7, 0.4]);
        await choisir(page, 'ondule', 'rectangle');
        expect(await marque()).toEqual(['ondule']);
        await glisser(page, [0.2, 0.5], [0.4, 0.7]);
        const [a, b, c] = await formes(page);
        expect(a.trait).toBeUndefined();
        expect(b).toMatchObject({ type: 'cercle', trait: 'pointille' });
        expect(c).toMatchObject({ type: 'rectangle', trait: 'ondule' });
        // Une ligne active : pas de marque secondaire, et elle ne reçoit pas de propriété `trait`.
        await choisir(page, 'fleche');
        expect(await marque()).toEqual([]);
    });

    test('les extrémités n’ont pas d’effet sur une forme fermée', async ({ page }) => {
        await ouvrir(page);
        await page.evaluate(() => window.travauxOutils.setFlechePointes('double'));
        await choisir(page, 'cercle');
        await glisser(page, [0.2, 0.2], [0.4, 0.4]);
        expect((await formes(page))[0].pointes).toBeUndefined();
    });

    test('dans le PDF de l’élève : plein, pointillé, vague se distinguent aux pixels ; sans trait, comme avant', async ({ page }) => {
        await ouvrir(page);
        const plein = await pixelsPDF(page, CERCLE);
        const pointille = await pixelsPDF(page, { ...CERCLE, trait: 'pointille' });
        const vague = await pixelsPDF(page, { ...CERCLE, trait: 'ondule' });
        expect(plein.n).toBeGreaterThan(1000);
        expect(plein.loin).toBe(0);
        expect(pointille.n).toBeLessThan(plein.n * 0.8);
        expect(pointille.loin).toBe(0);
        expect(vague.loin).toBeGreaterThan(200);
        // Rectangle et polygone passent par la même fonction.
        const rect = { ...CERCLE, type: 'rectangle' };
        expect((await pixelsPDF(page, { ...rect, trait: 'pointille' })).n).toBeLessThan((await pixelsPDF(page, rect)).n * 0.8);
    });

    test('à l’écran : un cercle pointillé a moins de pixels que le plein', async ({ page }) => {
        await ouvrir(page);
        await choisir(page, 'cercle');
        await glisser(page, [0.2, 0.3], [0.8, 0.7]);
        const plein = await pixelsEcran(page);
        await page.evaluate(() => window.travauxAnnotation.annuler());
        await choisir(page, 'pointille', 'cercle');
        await glisser(page, [0.2, 0.3], [0.8, 0.7]);
        const pointille = await pixelsEcran(page);
        expect(plein).toBeGreaterThan(100);
        expect(pointille).toBeLessThan(plein * 0.85);
    });

    test('témoin : une ligne pointillée se sélectionne toujours sur son tracé', async ({ page }) => {
        await ouvrir(page);
        await choisir(page, 'pointille');
        await glisser(page, [0.2, 0.3], [0.7, 0.3]);
        await choisir(page, 'selection');
        await toucher(page, [0.45, 0.3]);
        expect(await page.evaluate(() => document.getElementById('travaux-btn-supprimer').disabled)).toBe(false);
    });

    test('dupliquer et déplacer une forme ondulée gardent son trait', async ({ page }) => {
        await ouvrir(page);
        await choisir(page, 'ondule', 'cercle');
        await glisser(page, [0.2, 0.2], [0.5, 0.5]);
        await choisir(page, 'selection');
        await toucher(page, [0.2, 0.35]);
        await page.evaluate(() => window.travauxAnnotation.dupliquerSelection());
        const f = await formes(page);
        expect(f.map((x) => x.trait)).toEqual(['ondule', 'ondule']);
    });
});

test.describe('Le polygone, sommet par sommet', () => {
    const Q = [[0.2, 0.2], [0.6, 0.2], [0.6, 0.6], [0.2, 0.6]];

    test('quatre touchers, puis le premier sommet : un quadrilatère se ferme, entier à l’annulation', async ({ page }) => {
        const suivi = await ouvrir(page);
        await choisir(page, 'polygone');
        for (const s of Q) await toucher(page, s);
        expect((await compteAnnotations(page)).shapes).toBe(0);  // pas encore
        await toucher(page, Q[0]);
        const [f] = await formes(page);
        expect(f.type).toBe('polygone');
        expect(f.sommets).toHaveLength(4);
        expect(f.x1).toBeCloseTo(0.2, 1);
        expect(f.x2).toBeCloseTo(0.6, 1);
        await page.evaluate(() => window.travauxAnnotation.annuler());
        expect((await compteAnnotations(page)).shapes).toBe(0);
        expect(suivi.erreurs).toEqual([]);
    });

    test('moins de trois sommets ne crée rien', async ({ page }) => {
        await ouvrir(page);
        await choisir(page, 'polygone');
        await toucher(page, Q[0]);
        await toucher(page, Q[1]);
        await toucher(page, Q[0]);
        expect((await compteAnnotations(page)).shapes).toBe(0);
        await toucher(page, Q[2]);
        await toucher(page, Q[0]);
        expect((await formes(page))[0].sommets).toHaveLength(3); // le toucher sur le premier n'avait rien posé
    });

    test('pendant le tracé, Annuler retire le dernier sommet ; son bouton est actif', async ({ page }) => {
        await ouvrir(page);
        await choisir(page, 'polygone');
        const bouton = () => page.evaluate(() => document.getElementById('travaux-btn-undo').disabled);
        expect(await bouton()).toBe(true);
        await toucher(page, Q[0]);
        await toucher(page, Q[1]);
        await toucher(page, Q[2]);
        expect(await bouton()).toBe(false);
        await page.evaluate(() => document.getElementById('travaux-btn-undo').click());
        await toucher(page, Q[3]);
        await toucher(page, Q[0]);
        const [f] = await formes(page);
        expect(f.sommets).toHaveLength(3);
        expect(f.sommets[2].y).toBeCloseTo(0.6, 1);
        expect(f.sommets[2].x).toBeCloseTo(0.2, 1);
    });

    test('changer d’outil, ou Échap, abandonne un polygone non fermé', async ({ page }) => {
        await ouvrir(page);
        await choisir(page, 'polygone');
        await toucher(page, Q[0]); await toucher(page, Q[1]); await toucher(page, Q[2]);
        await choisir(page, 'stylo');
        await choisir(page, 'polygone');
        await toucher(page, Q[3]); await toucher(page, Q[2]);
        await page.keyboard.press('Escape');
        expect(await page.evaluate(() => document.getElementById('travaux-btn-undo').disabled)).toBe(true);
        await toucher(page, Q[0]); await toucher(page, Q[1]); await toucher(page, Q[2]); await toucher(page, Q[0]);
        expect((await formes(page)).map((f) => f.sommets.length)).toEqual([3]);
    });

    test('un segment d’aperçu suit le pointeur', async ({ page }) => {
        await ouvrir(page);
        await choisir(page, 'polygone');
        await toucher(page, Q[0]);
        const avant = await pixelsEcran(page);
        const p = await pointCanevas(page, 0.7, 0.7);
        await page.mouse.move(p.x, p.y);
        expect(await pixelsEcran(page)).toBeGreaterThan(avant);
    });

    test('le doigt ne pose pas de sommet (rejet de la paume)', async ({ page }) => {
        await ouvrir(page);
        await choisir(page, 'polygone');
        const r = await page.evaluate(() => {
            const c = document.getElementById('travaux-canvas-annotation'); const b = c.getBoundingClientRect();
            c.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true, pointerType: 'touch', pointerId: 1, isPrimary: true, button: 0, clientX: b.left + 50, clientY: b.top + 50 }));
            c.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, cancelable: true, pointerType: 'touch', pointerId: 1, isPrimary: true, button: 0, clientX: b.left + 50, clientY: b.top + 50 }));
            return document.getElementById('travaux-btn-undo').disabled;
        });
        expect(r).toBe(true);
    });

    test('sélection sur son tracé, déplacement, duplication et suppression ; ses sommets suivent', async ({ page }) => {
        await ouvrir(page);
        await choisir(page, 'polygone');
        for (const s of Q) await toucher(page, s);
        await toucher(page, Q[0]);
        await choisir(page, 'selection');
        // Sur le côté de fermeture, et non sur le cadre.
        await toucher(page, [0.2, 0.4]);
        const avant = (await formes(page))[0].sommets.map((s) => ({ ...s }));
        await glisser(page, [0.4, 0.2], [0.5, 0.3]);
        const apres = (await formes(page))[0];
        expect(apres.sommets[0].x).toBeCloseTo(avant[0].x + 0.1, 1);
        expect(apres.sommets[2].y).toBeCloseTo(avant[2].y + 0.1, 1);
        expect(apres.x1).toBeCloseTo(apres.sommets[0].x, 5);
        await page.evaluate(() => window.travauxAnnotation.dupliquerSelection());
        const [o, d] = await formes(page);
        expect(d.sommets[0].x).not.toBe(o.sommets[0].x);
        expect(d.id).not.toBe(o.id);
        expect(d.sommets).not.toBe(o.sommets);
        await page.evaluate(() => window.travauxAnnotation.supprimerSelection());
        expect((await formes(page))).toHaveLength(1);
    });

    test('dans le PDF : le polygone se dessine, en plein, en pointillé et en vague', async ({ page }) => {
        await ouvrir(page);
        const P = { id: 'P', type: 'polygone', color: '#ff0000', lineWidth: 4, x1: 0.2, y1: 0.2, x2: 0.8, y2: 0.8,
            sommets: [{ x: 0.2, y: 0.2 }, { x: 0.8, y: 0.2 }, { x: 0.8, y: 0.8 }, { x: 0.2, y: 0.8 }] };
        const plein = (await pixelsPDF(page, P)).n;
        const pointille = (await pixelsPDF(page, { ...P, trait: 'pointille' })).n;
        const vague = (await pixelsPDF(page, { ...P, trait: 'ondule' })).n;
        expect(plein).toBeGreaterThan(1000);
        expect(pointille).toBeLessThan(plein * 0.8);
        expect(vague).toBeGreaterThan(plein);
    });
});
