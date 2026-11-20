// #1295 (19 nov. 2026) — un glisser rapide entre dans la leçon visée.
//
// Le défaut : `throttleRAF` (js/planification-carte.js) gardait le PREMIER
// `pointermove` d'une image et jetait les suivants, et le relâchement ne
// relisait pas sa propre position. Avec plusieurs mouvements par image — ce que
// fait Playwright par défaut, et une main pressée —, le bloc restait en arrière
// du pointeur et la cible se cherchait sous un bloc périmé : l'activité
// s'arrêtait 34 px sous la leçon (parcours-5, ligne 334). Et l'image en attente
// s'exécutait APRÈS le relâchement, déplaçant le bloc une fois le dépôt jugé.
//
// Ce banc glisse SANS attente entre les mouvements, à la souris (Playwright,
// `steps`) et au doigt (événements de pointeur `touch` envoyés d'un seul
// tenant : tous dans la même image, le cas le plus dur). Il vérifie que
// l'activité entre dans la leçon, et qu'elle ne bouge plus après le relâchement.
// Deux fenêtres : paysage (1180 × 820) et portrait (820 × 1180).
//
// Break-test (19 nov. 2026) : `throttleRAF` remis à sa version d'avant et les
// appels à `vider()` retirés → ROUGE (voir le rapport du lot).
//
// Un CLIC (appui et relâchement, aucun mouvement entre les deux) ne fait rien :
// ni rangement dans la leçon sous le point cliqué, ni aimantation. C'est la garde
// `if (!enAttente && !applique) return` de `vider()`. Sans elle, le relâchement
// rejoue le gestionnaire de mouvement : mesuré le 19 nov. en Chromium, une
// activité qui recouvre 3,9 % d'une leçon y est rangée par un simple clic, et une
// activité à 3 px d'un alignement se décale de 3 px. Break-test : garde retirée
// → les deux essais « un clic » ROUGES.
import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { attendreApplication } from './harness/attendre-application.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

// La carte d'un espace vide, sans la démo : la démo continue de se mettre en
// place après la promesse d'`activerModeDemo` (blocs redessinés, défilement), et
// seule une pause fixe l'attendait. Chaque attente est ici une condition.
const deuxImages = (page) => page.evaluate(() => new Promise((fin) => requestAnimationFrame(() => requestAnimationFrame(fin))));
async function ouvrirCarte(page) {
    await page.goto(indexHtml);
    await attendreApplication(page);
    await page.evaluate(() => {
        document.querySelectorAll('.section.active, .sous-section.active')
            .forEach(el => el.classList.remove('active'));
        document.getElementById('section-conception')?.classList.add('active');
        document.getElementById('conception-carte')?.classList.add('active');
    });
    await page.evaluate(() => window.planificationCarte.initialiser());
    await page.waitForFunction(() => document.getElementById('planif-zone-travail') && window.planificationCarte.etat);
}

/** La carte immobile : la boîte du bloc ne bouge plus pendant cinq images (le recentrage différé est fini). */
const immobile = (page, id) => page.evaluate((id) => new Promise((fin) => {
    let avant = '', calmes = 0;
    const tour = () => {
        const b = document.getElementById(id).getBoundingClientRect();
        const ici = b.left + ',' + b.top + ',' + scrollX + ',' + scrollY;
        calmes = ici === avant ? calmes + 1 : 0;
        avant = ici;
        if (calmes >= 5) fin(); else requestAnimationFrame(tour);
    };
    requestAnimationFrame(tour);
}), id);

/** Les blocs injectés sont dessinés. */
const dessines = (page, ids) => page.waitForFunction((ids) => ids.every((id) => document.querySelector(`[id="${id}"] .planif-noeud-prise`)), ids);

// Pose un nœud (et ses enfants) à un point de l'ESPACE LIBRE du canevas : ni sous
// la palette « Planificateur » (à gauche), ni sous la grille du Planificateur (à
// droite ; en portrait, elle occupe le haut du canevas). Mesuré le 19 nov. :
// paysage, libre entre x 243 et x 748 ; portrait, seulement sous y 784. Un bloc
// posé dessous ne reçoit pas le pointerdown — le banc jugerait la palette.
async function teleporter(page, id, dx0, dy0) {
    await page.evaluate((a) => {
        const zone = document.getElementById('planif-zone-travail');
        window.scrollBy(0, zone.getBoundingClientRect().top);
        const zr = zone.getBoundingClientRect();
        const bord = (sel) => { const e = document.querySelector(sel); const r = e && e.getBoundingClientRect(); return r && r.width > 0 && r.height > 0 ? r : null; };
        const pal = bord('#planif-palette'), nav = bord('#planif-palette-nav');
        let libre = { l: (pal ? pal.right : zr.left) + 20, t: zr.top + 20 };
        if (nav && nav.left - libre.l < 480) libre = { l: libre.l, t: nav.bottom + 20 };
        const r = document.getElementById(a.id).getBoundingClientRect();
        const api = window.planificationCarte;
        const zoom = api.etat.zoom || 1;
        const dx = ((libre.l + a.dx0) - r.x) / zoom;
        const dy = ((libre.t + a.dy0) - r.y) / zoom;
        const bouger = (nid) => {
            const nd = api.etat.noeuds.get(nid);
            if (!nd) return;
            nd.x += dx; nd.y += dy;
            const nel = document.getElementById(nid);
            if (nel) { nel.style.left = nd.x + 'px'; nel.style.top = nd.y + 'px'; }
            (nd.enfants || []).forEach(bouger);
        };
        bouger(a.id);
    }, { id, dx0, dy0 });
    await deuxImages(page);
}

/** Ce qui est sous un point : le banc vérifie qu'il saisit bien le bloc et vise bien la leçon. */
const sous = (page, p) => page.evaluate((p) => {
    const e = document.elementFromPoint(p.x, p.y);
    const n = e && e.closest('.planif-noeud');
    return n ? n.id : (e ? 'hors bloc : ' + String(e.className).slice(0, 40) : 'rien');
}, p);

const centre = (page, sel) => page.evaluate((s) => {
    const b = document.querySelector(s).getBoundingClientRect();
    return { x: b.left + b.width / 2, y: b.top + b.height / 2 };
}, sel);
/** Un point de la zone d'accueil d'une leçon où c'est bien elle qui reçoit le pointeur (un bloc de la démo peut en couvrir le centre). */
const pointDeLaLecon = (page, id) => page.evaluate((id) => {
    const b = document.querySelector(`[id="${id}"] .planif-noeud-zone`).getBoundingClientRect();
    for (const fy of [0.5, 0.3, 0.7, 0.15, 0.85]) {
        for (const fx of [0.5, 0.3, 0.7, 0.15, 0.85]) {
            const x = b.left + b.width * fx, y = b.top + b.height * fy;
            const e = document.elementFromPoint(x, y);
            if (e && e.closest('.planif-noeud') && e.closest('.planif-noeud').id === id) return { x, y };
        }
    }
    return { x: b.left + b.width / 2, y: b.top + b.height / 2 };
}, id);

const parentDe = (page, id) => page.evaluate((i) => window.planificationCarte.etat.noeuds.get(i).parent || null, id);
const positionDe = (page, id) => page.evaluate((i) => {
    const n = window.planificationCarte.etat.noeuds.get(i);
    return { x: n.x, y: n.y };
}, id);

/** Le glisser du doigt : pointerdown, douze pointermove, pointerup, d'un seul tenant (une seule image). */
async function glisserAuDoigt(page, de, vers) {
    await page.evaluate(({ de, vers }) => {
        const opts = (x, y) => ({ bubbles: true, cancelable: true, composed: true, clientX: x, clientY: y,
            pointerId: 7, pointerType: 'touch', isPrimary: true, button: 0, buttons: 1 });
        const cible = document.elementFromPoint(de.x, de.y);
        cible.dispatchEvent(new PointerEvent('pointerdown', opts(de.x, de.y)));
        for (let i = 1; i <= 12; i++) {
            const x = de.x + (vers.x - de.x) * i / 12, y = de.y + (vers.y - de.y) * i / 12;
            (document.elementFromPoint(x, y) || document).dispatchEvent(new PointerEvent('pointermove', opts(x, y)));
        }
        (document.elementFromPoint(vers.x, vers.y) || document).dispatchEvent(
            new PointerEvent('pointerup', { ...opts(vers.x, vers.y), buttons: 0 }));
    }, { de, vers });
}

const FENETRES = [
    { nom: 'paysage', width: 1180, height: 820 },
    { nom: 'portrait', width: 820, height: 1180 }
];

for (const f of FENETRES) {
    test.describe(`#1295 · glisser rapide (${f.nom}, ${f.width} × ${f.height})`, () => {
        test.use({ viewport: { width: f.width, height: f.height } });

        async function poserLeconEtActivite(page) {
            await ouvrirCarte(page);
            await page.evaluate(() => window.planificationCarte.injecterNoeuds([
                { id: 'g1295L', type: 'lecon', titre: 'Leçon visée', x: 600, y: 300 },
                { id: 'g1295A', type: 'activite', titre: 'Activité glissée', x: 900, y: 300 }
            ]));
            await dessines(page, ['g1295L', 'g1295A']);
            await immobile(page, 'g1295L');
            await teleporter(page, 'g1295L', 0, 0);
            await teleporter(page, 'g1295A', 260, 170);
            await immobile(page, 'g1295A');
            expect(await parentDe(page, 'g1295A')).toBeNull();
        }

        test('à la souris, mouvements rapprochés : l’activité libre entre dans la leçon et ne bouge plus', async ({ page }) => {
            await poserLeconEtActivite(page);
            const de = await centre(page, '#g1295A .planif-noeud-prise');
            const vers = await pointDeLaLecon(page, 'g1295L');
            expect(await sous(page, de)).toBe('g1295A');
            expect(await sous(page, vers)).toBe('g1295L');
            await page.mouse.move(de.x, de.y);
            await page.mouse.down();
            await page.mouse.move(vers.x, vers.y, { steps: 12 });   // aucune attente : plusieurs mouvements par image
            await page.mouse.up();
            await expect.poll(() => parentDe(page, 'g1295A')).toBe('g1295L');
            // Aucune image en attente ne déplace le bloc après le relâchement.
            const apres = await positionDe(page, 'g1295A');
            await deuxImages(page);   // une image en attente se serait exécutée ici
            await deuxImages(page);
            expect(await positionDe(page, 'g1295A')).toEqual(apres);
        });

        test('au doigt, tous les mouvements dans la même image : l’activité libre entre dans la leçon', async ({ page }) => {
            await poserLeconEtActivite(page);
            const de = await centre(page, '#g1295A .planif-noeud-prise');
            const vers = await pointDeLaLecon(page, 'g1295L');
            expect(await sous(page, de)).toBe('g1295A');
            expect(await sous(page, vers)).toBe('g1295L');
            await glisserAuDoigt(page, de, vers);
            await expect.poll(() => parentDe(page, 'g1295A')).toBe('g1295L');
        });

        test('à la souris, une activité déménage d’une leçon à l’autre', async ({ page }) => {
            await ouvrirCarte(page);
            await page.evaluate(() => window.planificationCarte.injecterNoeuds([
                { id: 'g1295L1', type: 'lecon', titre: 'Leçon de départ', x: 600, y: 300, enfants: ['g1295E'] },
                { id: 'g1295E', type: 'activite', titre: 'Activité qui déménage', x: 630, y: 380, parent: 'g1295L1' },
                { id: 'g1295L2', type: 'lecon', titre: 'Leçon d’arrivée', x: 1100, y: 300 }
            ]));
            await dessines(page, ['g1295L1', 'g1295E', 'g1295L2']);
            await immobile(page, 'g1295L1');
            await teleporter(page, 'g1295L1', 0, 0);
            await teleporter(page, 'g1295E', 30, 70);
            await teleporter(page, 'g1295L2', 280, 0);
            await immobile(page, 'g1295L2');
            expect(await parentDe(page, 'g1295E')).toBe('g1295L1');
            const de = await centre(page, '#g1295E .planif-noeud-prise');
            const vers = await pointDeLaLecon(page, 'g1295L2');
            expect(await sous(page, de)).toBe('g1295E');
            expect(await sous(page, vers)).toBe('g1295L2');
            await page.mouse.move(de.x, de.y);
            await page.mouse.down();
            await page.mouse.move(vers.x, vers.y, { steps: 12 });
            await page.mouse.up();
            await expect.poll(() => parentDe(page, 'g1295E')).toBe('g1295L2');
        });

        // Le clic qu'on éprouve : appui et relâchement au même point, sans mouvement entre
        // les deux, à la souris puis au doigt. Rien ne doit changer, ni parent ni position.
        async function cliquerPuisToucher(page, p) {
            await page.mouse.move(p.x, p.y);   // avant l'appui : le geste n'écoute pas encore
            await page.mouse.down();
            await page.mouse.up();
            await deuxImages(page);
            await deuxImages(page);
            await page.evaluate((p) => {
                const o = (b) => ({ bubbles: true, cancelable: true, composed: true, clientX: p.x, clientY: p.y,
                    pointerId: 8, pointerType: 'touch', isPrimary: true, button: 0, buttons: b });
                const c = document.elementFromPoint(p.x, p.y);
                c.dispatchEvent(new PointerEvent('pointerdown', o(1)));
                c.dispatchEvent(new PointerEvent('pointerup', o(0)));
            }, p);
            await deuxImages(page);
            await deuxImages(page);
        }
        const boiteDe = (page, id) => page.evaluate((i) => {
            const b = document.getElementById(i).getBoundingClientRect();
            return { l: b.left, t: b.top, r: b.right, b: b.bottom, w: b.width, h: b.height };
        }, id);

        test('un clic sur une activité libre qui recouvre un coin de leçon ne l’y range pas', async ({ page }) => {
            await poserLeconEtActivite(page);
            const L = await boiteDe(page, 'g1295L');
            // Le coin haut-gauche de l'activité sur le coin bas-droit de la leçon : elles ne
            // se recouvrent que sur 30 × 20 px.
            await teleporter(page, 'g1295A', L.w - 30, L.h - 20);
            await immobile(page, 'g1295A');
            const A = await boiteDe(page, 'g1295A');
            const recouvre = Math.max(0, Math.min(A.r, L.r) - Math.max(A.l, L.l)) * Math.max(0, Math.min(A.b, L.b) - Math.max(A.t, L.t));
            expect(recouvre).toBeGreaterThan(0);
            expect(recouvre / (A.w * A.h)).toBeLessThan(0.5);   // le filet de recouvrement ne la prend pas
            const p = { x: L.r - 12, y: L.b - 8 };               // dans la leçon, sur l'activité
            expect(await sous(page, p)).toBe('g1295A');
            expect(await parentDe(page, 'g1295A')).toBeNull();
            const avant = await positionDe(page, 'g1295A');
            await cliquerPuisToucher(page, p);
            expect(await parentDe(page, 'g1295A')).toBeNull();
            expect(await positionDe(page, 'g1295A')).toEqual(avant);
        });

        test('un clic sur une activité libre près d’un alignement ne l’aimante pas', async ({ page }) => {
            await poserLeconEtActivite(page);
            const L = await boiteDe(page, 'g1295L');
            // Bord gauche à 3 px de celui de la leçon (seuil d'aimant : 6 px), sous elle, sans la toucher.
            await teleporter(page, 'g1295A', 3, L.h + 80);
            await immobile(page, 'g1295A');
            const A = await boiteDe(page, 'g1295A');
            expect(Math.abs(A.l - L.l - 3)).toBeLessThan(0.5);
            expect(A.t).toBeGreaterThan(L.b);
            const p = { x: A.l + A.w / 2, y: A.t + A.h / 2 };
            expect(await sous(page, p)).toBe('g1295A');
            const avant = await positionDe(page, 'g1295A');
            await cliquerPuisToucher(page, p);
            expect(await parentDe(page, 'g1295A')).toBeNull();
            expect(await positionDe(page, 'g1295A')).toEqual(avant);
        });
    });
}
