// #1295 (19 nov. 2026) — le relâchement d'un glisser prend la position RÉELLE du pointeur.
//
// Le défaut : `throttleRAF` (js/planification-carte.js) gardait le PREMIER `pointermove` de chaque
// image et jetait les suivants, et le relâchement ne relisait pas sa propre position. Quand
// plusieurs mouvements tombent dans la même image (WebKit les livre un à un ; une image lente en
// accumule), le dépôt se jugeait sur un point en retard : une activité glissée vite dans une leçon
// n'y entrait pas (banc parcours-5 sur le Mac, 5 rouges sur 5 : l'activité 34 px sous la leçon).
// Puis l'image en attente s'appliquait APRÈS le dépôt et redéplaçait le bloc, déjà enregistré.
//
// ⚠ Pourquoi des événements fabriqués, dans UNE tâche. Le Chromium du conteneur aligne les
// mouvements de la souris sur les images : `page.mouse.move` n'en livre qu'un par image, et le
// défaut ne s'y voit jamais (mesuré le 19 nov. : 12 mouvements, 12 appliqués). Ce qui le révèle,
// c'est l'état que WebKit produit : plusieurs mouvements dans la même image, puis le relâchement
// avant l'image suivante. Dispatcher la rafale dans une seule tâche produit exactement cet état,
// de façon déterministe, dans les deux moteurs.
// ⚠ Les cibles se jugent par le CALCUL (coordonnées → carte), pas par un test d'atteinte : un
// événement fabriqué n'est pas routé selon ce qui se trouve sous lui, et la carte ne l'utilise pas.
//
// Break-test (19 nov.) : l'ancien `throttleRAF` remis et les appels au relâchement retirés → ROUGE
// sur chacun des essais ci-dessous, aux deux tailles.
import { test, expect } from '@playwright/test';
import { attendreApplication } from './harness/attendre-application.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

async function ouvrirCarteVide(page) {
    await page.goto(indexHtml);
    await attendreApplication(page);
    await page.evaluate(() => {
        document.querySelectorAll('.section.active, .sous-section.active').forEach((el) => el.classList.remove('active'));
        document.getElementById('section-conception')?.classList.add('active');
        document.getElementById('conception-carte')?.classList.add('active');
        window.planificationCarte.initialiser();
        window.planificationCarte.nouvelleCarte('Banc 1295');
    });
    await expect(page.locator('#planif-zone-travail')).toBeVisible();
    await deuxImages(page);
}

/** Deux images : ce qu'une image en attente devait faire est fait (le correctif ou le défaut s'y montre). */
const deuxImages = (page) => page.evaluate(() => new Promise((fin) => requestAnimationFrame(() => requestAnimationFrame(fin))));

/** Pose des nœuds, puis les amène (avec leurs enfants) à des points de l'écran relatifs au canevas. */
async function poser(page, noeuds, places) {
    await page.evaluate((n) => window.planificationCarte.injecterNoeuds(n), noeuds);
    await deuxImages(page);   // injecterNoeuds recentre la vue à l'image suivante
    await page.evaluate((pl) => {
        const zone = document.getElementById('planif-zone-travail');
        window.scrollBy(0, zone.getBoundingClientRect().top);
        const api = window.planificationCarte;
        const zr = zone.getBoundingClientRect();
        const z = api.etat.zoom || 1;
        const bouger = (nid, dx, dy) => {
            const nd = api.etat.noeuds.get(nid);
            if (!nd) return;
            nd.x += dx; nd.y += dy;
            const el = document.getElementById(nid);
            if (el) { el.style.left = nd.x + 'px'; el.style.top = nd.y + 'px'; }
            (nd.enfants || []).forEach((c) => bouger(c, dx, dy));
        };
        for (const [id, ex, ey] of pl) {
            const r = document.getElementById(id).getBoundingClientRect();
            bouger(id, ((zr.x + ex) - r.x) / z, ((zr.y + ey) - r.y) / z);
        }
    }, places);
}

const centre = (page, sel) => page.evaluate((s) => {
    const b = document.querySelector(s).getBoundingClientRect();
    return { x: b.left + b.width / 2, y: b.top + b.height / 2 };
}, sel);

/**
 * Le geste de WebKit : appui, `pas` mouvements dans la MÊME tâche (donc la même image), puis la fin
 * (`pointerup` ou `pointercancel`) avant l'image suivante. Rend l'état du nœud `lire` au relâchement.
 */
async function rafale(page, { appui, surMouvement = null, de, vers, pas = 12, pointeur = 'mouse', fin = 'pointerup', lire }) {
    return page.evaluate((o) => {
        const ev = (type, x, y) => new PointerEvent(type, {
            bubbles: true, cancelable: true, composed: true, clientX: x, clientY: y,
            pointerId: o.pointeur === 'mouse' ? 1 : 7, isPrimary: true, pointerType: o.pointeur,
            button: type === 'pointermove' ? -1 : 0, buttons: type === 'pointerdown' || type === 'pointermove' ? 1 : 0
        });
        document.querySelector(o.appui).dispatchEvent(ev('pointerdown', o.de.x, o.de.y));
        const cible = o.surMouvement ? document.querySelector(o.surMouvement) : document;
        for (let i = 1; i <= o.pas; i++) {
            cible.dispatchEvent(ev('pointermove', o.de.x + (o.vers.x - o.de.x) * i / o.pas, o.de.y + (o.vers.y - o.de.y) * i / o.pas));
        }
        cible.dispatchEvent(ev(o.fin, o.vers.x, o.vers.y));
        const n = o.lire ? window.planificationCarte.etat.noeuds.get(o.lire) : null;
        return n ? { parent: n.parent, x: n.x, y: n.y } : null;
    }, { appui, surMouvement, de, vers, pas, pointeur, fin, lire });
}

const lireNoeud = (page, id) => page.evaluate((i) => {
    const n = window.planificationCarte.etat.noeuds.get(i);
    return { parent: n.parent, x: n.x, y: n.y };
}, id);

const surlignagesRestes = (page) => page.evaluate(() =>
    document.querySelectorAll('.planif-conteneur-survol, .planif-noeud-zone.planif-survol').length);

for (const [largeur, hauteur] of [[1180, 820], [820, 1180]]) {
    test.describe(`#1295 — le relâchement prend la position du pointeur (${largeur} × ${hauteur})`, () => {
        test.beforeEach(async ({ page }) => {
            await page.setViewportSize({ width: largeur, height: hauteur });
            await ouvrirCarteVide(page);
        });

        test('CAS D, à la souris : une activité glissée vite dans une leçon y entre, au point du relâchement', async ({ page }) => {
            await poser(page, [
                { id: 'gL', type: 'lecon', titre: 'Leçon du banc', x: 0, y: 0 },
                { id: 'gA', type: 'activite', titre: 'Activité du banc', x: 0, y: 0 }
            ], [['gL', 380, 60], ['gA', 120, 360]]);
            const zone = await centre(page, '[id="gL"] > .planif-noeud-zone');
            const de = await centre(page, '[id="gA"] .planif-noeud-prise');
            const auLacher = await rafale(page, { appui: '[id="gA"] .planif-noeud-prise', de, vers: zone, lire: 'gA' });
            expect(auLacher.parent, 'l’activité est dans la leçon dès le relâchement').toBe('gL');
            await deuxImages(page);
            expect((await lireNoeud(page, 'gA')).parent).toBe('gL');
            expect(await surlignagesRestes(page), 'aucune leçon ne reste surlignée après le dépôt').toBe(0);
        });

        test('CAS D, au doigt : la même rafale, en pointeur tactile', async ({ page }) => {
            await poser(page, [
                { id: 'gL', type: 'lecon', titre: 'Leçon du banc', x: 0, y: 0 },
                { id: 'gA', type: 'activite', titre: 'Activité du banc', x: 0, y: 0 }
            ], [['gL', 380, 60], ['gA', 120, 360]]);
            const zone = await centre(page, '[id="gL"] > .planif-noeud-zone');
            const de = await centre(page, '[id="gA"] .planif-noeud-prise');
            const auLacher = await rafale(page, { appui: '[id="gA"] .planif-noeud-prise', de, vers: zone, pointeur: 'touch', lire: 'gA' });
            expect(auLacher.parent).toBe('gL');
            await deuxImages(page);
            expect(await surlignagesRestes(page)).toBe(0);
        });

        test('CAS D, posé à côté de tout : le bloc s’arrête sous le pointeur, et rien ne le déplace après', async ({ page }) => {
            await poser(page, [
                { id: 'gA', type: 'activite', titre: 'Activité du banc', x: 0, y: 0 }
            ], [['gA', 120, 120]]);
            const avant = await lireNoeud(page, 'gA');
            const zoom = await page.evaluate(() => window.planificationCarte.etat.zoom || 1);
            const de = await centre(page, '[id="gA"] .planif-noeud-prise');
            const vers = { x: de.x + 180, y: de.y + 210 };
            const auLacher = await rafale(page, { appui: '[id="gA"] .planif-noeud-prise', de, vers, lire: 'gA' });
            expect(auLacher.x).toBeCloseTo(avant.x + 180 / zoom, 0);
            expect(auLacher.y).toBeCloseTo(avant.y + 210 / zoom, 0);
            await deuxImages(page);
            const apres = await lireNoeud(page, 'gA');
            expect({ x: apres.x, y: apres.y }, 'aucune image en attente ne redéplace le bloc après le dépôt').toEqual({ x: auLacher.x, y: auLacher.y });
        });

        test('CAS D, geste annulé (`pointercancel`) : le dernier mouvement reçu s’applique, rien après', async ({ page }) => {
            await poser(page, [
                { id: 'gA', type: 'activite', titre: 'Activité du banc', x: 0, y: 0 }
            ], [['gA', 120, 120]]);
            const avant = await lireNoeud(page, 'gA');
            const zoom = await page.evaluate(() => window.planificationCarte.etat.zoom || 1);
            const de = await centre(page, '[id="gA"] .planif-noeud-prise');
            const vers = { x: de.x + 150, y: de.y + 90 };
            const auLacher = await rafale(page, { appui: '[id="gA"] .planif-noeud-prise', de, vers, pointeur: 'touch', fin: 'pointercancel', lire: 'gA' });
            expect(auLacher.x).toBeCloseTo(avant.x + 150 / zoom, 0);
            expect(auLacher.y).toBeCloseTo(avant.y + 90 / zoom, 0);
            await deuxImages(page);
            const apres = await lireNoeud(page, 'gA');
            expect({ x: apres.x, y: apres.y }).toEqual({ x: auLacher.x, y: auLacher.y });
        });

        test('CAS B : une activité tirée vite d’une leçon vers une autre y déménage', async ({ page }) => {
            await poser(page, [
                { id: 'gL1', type: 'lecon', titre: 'Première leçon', x: 0, y: 0, enfants: ['gA'] },
                { id: 'gA', type: 'activite', titre: 'Activité du banc', x: 0, y: 0, parent: 'gL1' },
                { id: 'gL2', type: 'lecon', titre: 'Seconde leçon', x: 0, y: 0 }
            ], [['gL1', 80, 60], ['gL2', 420, 300]]);
            const zone = await centre(page, '[id="gL2"] > .planif-noeud-zone');
            const de = await centre(page, '[id="gA"] .planif-noeud-prise');
            const auLacher = await rafale(page, { appui: '[id="gA"] .planif-noeud-prise', de, vers: zone, lire: 'gA' });
            expect(auLacher.parent).toBe('gL2');
            await deuxImages(page);
            expect(await surlignagesRestes(page)).toBe(0);
        });

        test('CAS C : une leçon glissée vite dans une séquence y entre', async ({ page }) => {
            await poser(page, [
                { id: 'gS', type: 'sequence', titre: 'Séquence du banc', x: 0, y: 0 },
                { id: 'gL', type: 'lecon', titre: 'Leçon du banc', x: 0, y: 0 }
            ], [['gS', 380, 60], ['gL', 100, 380]]);
            const zone = await centre(page, '[id="gS"] > .planif-noeud-zone');
            const de = await centre(page, '[id="gL"] .planif-noeud-prise');
            const auLacher = await rafale(page, { appui: '[id="gL"] .planif-noeud-prise', de, vers: zone, lire: 'gL' });
            expect(auLacher.parent).toBe('gS');
            await deuxImages(page);
            expect(await surlignagesRestes(page)).toBe(0);
        });

        test('groupe : deux blocs sélectionnés, glissés vite, arrivent tous deux au point du relâchement', async ({ page }) => {
            await poser(page, [
                { id: 'gA', type: 'activite', titre: 'Premier bloc', x: 0, y: 0 },
                { id: 'gB', type: 'activite', titre: 'Second bloc', x: 0, y: 0 }
            ], [['gA', 120, 100], ['gB', 120, 220]]);
            await page.evaluate(() => {
                const api = window.planificationCarte;
                for (const id of ['gA', 'gB']) {
                    api.etat.multiSelection.add(id);
                    document.getElementById(id).classList.add('selected');
                }
            });
            const avantA = await lireNoeud(page, 'gA');
            const avantB = await lireNoeud(page, 'gB');
            const zoom = await page.evaluate(() => window.planificationCarte.etat.zoom || 1);
            const de = await centre(page, '[id="gA"] .planif-noeud-prise');
            await rafale(page, { appui: '[id="gA"] .planif-noeud-prise', de, vers: { x: de.x + 200, y: de.y + 60 } });
            const a = await lireNoeud(page, 'gA');
            const b = await lireNoeud(page, 'gB');
            expect(a.x).toBeCloseTo(avantA.x + 200 / zoom, 0);
            expect(b.x).toBeCloseTo(avantB.x + 200 / zoom, 0);
            expect(b.y).toBeCloseTo(avantB.y + 60 / zoom, 0);
        });

        test('poignée de taille : la taille enregistrée est celle du relâchement, et rien ne la change après', async ({ page }) => {
            await poser(page, [
                { id: 'gA', type: 'activite', titre: 'Activité du banc', x: 0, y: 0 }
            ], [['gA', 120, 120]]);
            const avant = await page.evaluate(() => document.getElementById('gA').offsetWidth);
            const zoom = await page.evaluate(() => window.planificationCarte.etat.zoom || 1);
            const de = await centre(page, '[id="gA"] .planif-noeud-poignee');
            await rafale(page, { appui: '[id="gA"] .planif-noeud-poignee', surMouvement: '[id="gA"] .planif-noeud-poignee', de, vers: { x: de.x + 120, y: de.y + 40 } });
            const auLacher = await page.evaluate(() => ({
                largeur: window.planificationCarte.etat.noeuds.get('gA').metadata.largeur,
                affichee: document.getElementById('gA').offsetWidth
            }));
            expect(auLacher.largeur).toBeGreaterThanOrEqual(Math.round(avant + 120 / zoom) - 2);
            await deuxImages(page);
            expect(await page.evaluate(() => document.getElementById('gA').offsetWidth), 'la taille affichée reste celle enregistrée').toBe(auLacher.largeur);
        });

        test('sélection au rectangle : le cadre disparaît au relâchement et ne reparaît pas', async ({ page }) => {
            await poser(page, [
                { id: 'gA', type: 'activite', titre: 'Activité du banc', x: 0, y: 0 }
            ], [['gA', 300, 200]]);
            const r = await page.evaluate(() => {
                const b = document.getElementById('gA').getBoundingClientRect();
                return { l: b.left, t: b.top, r: b.right, b: b.bottom };
            });
            await rafale(page, { appui: '#planif-espace', de: { x: r.l - 60, y: r.t - 60 }, vers: { x: r.r + 30, y: r.b + 30 } });
            const lireCadre = () => page.evaluate(() => document.getElementById('planif-rect-selection').style.display);
            expect(await lireCadre(), 'le cadre est retiré au relâchement').toBe('none');
            expect(await page.evaluate(() => window.planificationCarte.etat.selection), 'le bloc couvert est choisi').toBe('gA');
            await deuxImages(page);
            const cadre = await lireCadre();
            expect(cadre, 'aucune image en attente ne fait reparaître le cadre').toBe('none');
        });
    });
}
