import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// AIMANTATION + BARRE D'ALIGNEMENT (11 août 2026, demande de Grégoire).
//
// ⚠ POURQUOI CES CAS SONT ICI ET PAS EN VITEST : ils exigent un canevas
// réellement mis en page et un vrai geste de pointeur. Deux pièges de harnais
// se sont présentés en les écrivant, tous deux consignés ci-dessous, parce
// qu'ils produisaient un test qui PASSE sans avoir rien exercé :
//   · saisir un bloc en son CENTRE ne le déplace pas — le titre y est en
//     `contenteditable`, et `pointerdown` refuse explicitement d'y démarrer
//     un glissement ;
//   · un bloc hors de la fenêtre ne peut pas être saisi, et le clic échoue en
//     silence tant qu'on ne recadre pas.

const patternsAttendus = [
    /version\.json.*access control/i,
    /Cross origin requests are only supported/i,
    /Not allowed to load local resource/i
];
const estErreurAttendue = (msg) => patternsAttendus.some((re) => re.test(msg));

async function ouvrirCarte(page, noeuds) {
    const erreurs = [];
    page.on('pageerror', (e) => {
        const m = `pageerror: ${e.message}`;
        if (!estErreurAttendue(m)) erreurs.push(m);
    });
    page.on('dialog', (d) => d.dismiss().catch(() => {}));

    await page.setViewportSize({ width: 1400, height: 1500 });
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForFunction(() => window.dbReady === true, null, { timeout: 20000 });
    await page.waitForTimeout(800);
    await page.evaluate(() => window.naviguerVers('conception', 'carte'));
    await page.waitForTimeout(1200);
    await page.evaluate((n) => window.planificationCarte.injecterNoeuds(n), noeuds);
    await page.evaluate(() => window.planificationCarte.recentrerVue());
    await page.waitForTimeout(400);
    return erreurs;
}

const bloc = (id, titre, x, y) => ({
    id, type: 'lecon', titre, x, y, parent: null, enfants: [], metadata: {}
});

const positions = (page) => page.evaluate(() => {
    const o = {};
    for (const [id, n] of window.planificationCarte.etat.noeuds) o[id] = [Math.round(n.x), Math.round(n.y)];
    return o;
});

test('⚠ un bloc glissé près d’un autre COLLE, et un guide dit pourquoi', async ({ page }) => {
    const erreurs = await ouvrirCarte(page, [
        bloc('planif-noeud_ref', 'REF', 400, 300),
        bloc('planif-noeud_mob', 'MOB', 400, 600)
    ]);

    // Saisir près du BORD : le centre porte le titre éditable.
    const prise = await page.evaluate(() => {
        const r = document.getElementById('planif-noeud_mob').getBoundingClientRect();
        return [Math.round(r.left + 6), Math.round(r.top + 6)];
    });

    await page.mouse.move(prise[0], prise[1]);
    await page.mouse.down();

    // Loin du repère : aucune aimantation, aucun guide.
    // ⚠ 300 ms de repos AVANT de mesurer (réparation sur mesure, relevé Mac du
    // 18 août 2026) : en WebKit headless la mesure à 80 ms rendait 426 au lieu
    // de 440 — 14 px manquants sur un geste de +40, la position d'une frame
    // INTERMÉDIAIRE, le drag étant throttlé par requestAnimationFrame. Même
    // classe (et même correctif) que le CAS D de planif-drag-pointer-148, qui
    // repasse au vert en WebKit depuis. Le repos garantit que le DERNIER
    // pointermove a passé sa frame ; l'assertion exacte, elle, ne bouge pas.
    await page.mouse.move(prise[0] + 40, prise[1] - 10, { steps: 6 });
    await page.waitForTimeout(300);
    const loin = await positions(page);
    expect(loin['planif-noeud_mob'][0]).toBe(440);
    expect(await page.locator('.planif-guide-alignement').count()).toBe(0);

    // À 4 px du bord gauche de REF : le bloc est ramené dessus.
    await page.mouse.move(prise[0] + 4, prise[1] - 10, { steps: 6 });
    await page.waitForTimeout(300);
    const proche = await positions(page);
    expect(proche['planif-noeud_mob'][0]).toBe(400);

    // Et le guide relie visiblement les DEUX blocs.
    const guides = await page.evaluate(() => Array.from(
        document.querySelectorAll('.planif-guide-alignement')
    ).map((l) => ({
        x1: Math.round(+l.getAttribute('x1')),
        y1: Math.round(+l.getAttribute('y1')),
        y2: Math.round(+l.getAttribute('y2'))
    })));
    expect(guides.length).toBeGreaterThanOrEqual(1);
    expect(guides[0].x1).toBe(400);
    expect(guides[0].y1).toBeLessThan(300);
    expect(guides[0].y2).toBeGreaterThan(600);

    await page.mouse.up();
    await page.waitForTimeout(200);
    // Le guide n'est pas une décoration permanente.
    expect(await page.locator('.planif-guide-alignement').count()).toBe(0);
    expect(erreurs).toEqual([]);
});

test('la barre d’alignement n’apparaît qu’à partir de DEUX blocs', async ({ page }) => {
    const erreurs = await ouvrirCarte(page, [
        bloc('planif-noeud_a', 'A', 100, 100),
        bloc('planif-noeud_b', 'B', 143, 320)
    ]);

    const visible = () => page.locator('#planif-barre-alignement.planif-barre-visible').count();

    await page.evaluate(() => {
        const a = window.planificationCarte;
        a.etat.multiSelection.clear();
        a.etat.multiSelection.add('planif-noeud_a');
        a.majBarreAlignement();
    });
    expect(await visible()).toBe(0);

    await page.evaluate(() => {
        const a = window.planificationCarte;
        a.etat.multiSelection.add('planif-noeud_b');
        a.majBarreAlignement();
    });
    expect(await visible()).toBe(1);

    // ⚠ Et elle est réellement DANS la fenêtre — l'oubli de l'offset du
    // canevas l'envoyait à des milliers de pixels dehors, « visible » et
    // injoignable.
    const dansLaFenetre = await page.evaluate(() => {
        const r = document.getElementById('planif-barre-alignement').getBoundingClientRect();
        return r.left >= 0 && r.top >= 0
            && r.right <= window.innerWidth && r.bottom <= window.innerHeight;
    });
    expect(dansLaFenetre).toBe(true);
    expect(erreurs).toEqual([]);
});

test('les six commandes alignent, et ⌘Z défait le geste entier', async ({ page }) => {
    const erreurs = await ouvrirCarte(page, [
        bloc('planif-noeud_a', 'A', 100, 100),
        bloc('planif-noeud_b', 'B', 143, 320),
        bloc('planif-noeud_c', 'C', 187, 540)
    ]);

    await page.evaluate(() => {
        const a = window.planificationCarte;
        a.etat.multiSelection.clear();
        ['planif-noeud_a', 'planif-noeud_b', 'planif-noeud_c']
            .forEach((i) => a.etat.multiSelection.add(i));
        a.majBarreAlignement();
    });

    // Les six boutons respectent la cible tactile de l'iPad.
    const tailles = await page.evaluate(() => Array.from(
        document.querySelectorAll('.planif-btn-aligner')
    ).map((b) => {
        const r = b.getBoundingClientRect();
        return [Math.round(r.width), Math.round(r.height)];
    }));
    expect(tailles).toHaveLength(6);
    for (const [l, h] of tailles) {
        expect(l).toBeGreaterThanOrEqual(44);
        expect(h).toBeGreaterThanOrEqual(44);
    }

    await page.click('.planif-btn-aligner[data-mode="gauche"]');
    await page.waitForTimeout(200);
    const apresG = await positions(page);
    expect(new Set(Object.values(apresG).map((v) => v[0])).size).toBe(1);

    await page.click('.planif-btn-aligner[data-mode="milieu"]');
    await page.waitForTimeout(200);
    const centres = await page.evaluate(() => Array.from(
        window.planificationCarte.etat.noeuds.values()
    ).map((n) => {
        const b = window.planificationCarte.bornesNoeud(n);
        return Math.round((b.haut + b.bas) / 2);
    }));
    expect(new Set(centres).size).toBe(1);

    // Un seul cran d'annulation par commande.
    await page.evaluate(() => window.planificationCarte.annuler());
    await page.waitForTimeout(200);
    expect(await positions(page)).toEqual(apresG);
    expect(erreurs).toEqual([]);
});
