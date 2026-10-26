// #148 (8 août 2026) — le glisser du canevas, converti en Pointer Events.
//
// Deux contrats fonctionnels, les deux gestes du terrain de Grégoire :
//   CAS D : un drag souris déplace un nœud libre ;
//   CAS B : tirer une évaluation hors de sa leçon la détache
//           (« la leçon suit toujours » — observation iPad du 8 août).
//
// Écrite et validée sur le Chromium du conteneur (WebKit n'y est pas
// installable) ; le passage WebKit se confirme à la prochaine CI. Deux
// pièges d'environnement contournés, documentés en place : le bandeau de
// transition du mode démo qui avale les pointerdown, et le re-layout au
// dépôt sur un conteneur de la carte démo (d'où la mesure PENDANT le drag).
import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

async function ouvrirCarte(page) {
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForFunction(() => window.dbReady === true, null, { timeout: 20000 });
    await page.waitForTimeout(800);
    await page.evaluate(async () => { await window.activerModeDemo(); });
    await page.waitForTimeout(1500);
    await page.evaluate(() => {
        document.querySelectorAll('.section.active, .sous-section.active')
            .forEach(el => el.classList.remove('active'));
        document.getElementById('section-conception')?.classList.add('active');
        document.getElementById('conception-carte')?.classList.add('active');
    });
    await page.evaluate(() => window.planificationCarte.initialiser());
    await page.waitForTimeout(400);
    // Le bandeau de transition du mode démo reste posé sur le canevas en
    // headless (vu à elementFromPoint) : il avale les pointerdown. On le retire
    // — il n'est pas l'objet du test.
    await page.evaluate(() => {
        document.getElementById('transition-bandeau')?.remove();
    });
}

// Téléporte un nœud (et ses enfants) vers un point VISIBLE du canevas —
// même idiome que planif-toolbar.spec.js (le bas est masqué par le popup démo).
// ⚠ La page défile d'abord jusqu'au haut du canevas (26 oct. 2026). Le canevas
// commence sous ~550 px de page dans la fenêtre de 720 du banc : un décalage
// fixe sous son bord dépend de tout ce qui est au-dessus. #1148 a grandi la
// barre de la Carte de 28 px (le bas du canevas, lui, n'a pas bougé) et la
// poignée visée est passée sous le bandeau du mode démo, fixé au bas de la
// fenêtre : le pointerdown n'atteignait plus le nœud. On défile comme le fait
// l'utilisateur qui descend jusqu'à sa carte ; les boîtes se lisent APRÈS.
async function teleporter(page, id, ecranX, ecranY) {
    await page.evaluate((args) => {
        const zone = document.getElementById('planif-zone-travail');
        window.scrollBy(0, zone.getBoundingClientRect().top);
        const el = document.getElementById(args.id);
        const zr = zone.getBoundingClientRect();
        const r = el.getBoundingClientRect();
        const api = window.planificationCarte;
        const n = api.etat.noeuds.get(args.id);
        const zoom = api.etat.zoom || 1;
        const dx = ((zr.x + args.ecranX) - r.x) / zoom;
        const dy = ((zr.y + args.ecranY) - r.y) / zoom;
        const bouger = (nid) => {
            const nd = api.etat.noeuds.get(nid);
            if (!nd) return;
            nd.x += dx; nd.y += dy;
            const nel = document.getElementById(nid);
            if (nel) { nel.style.left = nd.x + 'px'; nel.style.top = nd.y + 'px'; }
            (nd.enfants || []).forEach(bouger);
        };
        bouger(args.id);
    }, { id, ecranX, ecranY });
    await page.waitForTimeout(200);
}

test('CAS D — un drag souris déplace un nœud libre', async ({ page }) => {
    await ouvrirCarte(page);
    await page.evaluate(() => {
        window.planificationCarte.injecterNoeuds([
            { id: 'p148d', type: 'activite', titre: 'Preuve 148 D', x: 600, y: 300 }
        ]);
    });
    await page.waitForTimeout(400);
    await teleporter(page, 'p148d', 320, 120);

    const avant = await page.evaluate(() => {
        const n = window.planificationCarte.etat.noeuds.get('p148d');
        return { x: n.x, y: n.y };
    });
    // ⚠ Saisir le bloc par sa POIGNÉE ⠿ (coin supérieur gauche, 1.85-1.86) :
    // le centre de l'en-tête porte désormais le MENU DE TYPE (1.86), qui
    // stoppe la propagation par conception — y pointer ne glisse pas (#456).
    const prise = await page.locator('#p148d .planif-noeud-prise').boundingBox();
    expect(prise).not.toBeNull();
    const px = prise.x + prise.width / 2;
    const py = prise.y + prise.height / 2;
    await page.mouse.move(px, py);
    await page.mouse.down();
    // Pas espacés d'attentes : le drag est throttlé par requestAnimationFrame,
    // et le headless ne produit pas de frame entre des moves consécutifs.
    for (let i = 1; i <= 7; i++) {
        await page.mouse.move(px + i * 20, py + i * 13);
        await page.waitForTimeout(40);
    }
    // Laisser le DERNIER pointermove passer son requestAnimationFrame avant de
    // mesurer : mesuré trop tôt, l'état rend la position d'une frame
    // intermédiaire — le 18 août, le test échouait à la frontière exacte
    // (+100 mesuré pour un seuil strict à +100, 5 frames sur 7 traitées).
    await page.waitForTimeout(250);
    // Mesurer PENDANT le drag : au relâchement, un dépôt sur un conteneur de
    // la carte démo re-layouterait le bloc et fausserait la position.
    const pendant = await page.evaluate(() => {
        const n = window.planificationCarte.etat.noeuds.get('p148d');
        return { x: n.x, y: n.y };
    });
    await page.mouse.up();
    await page.waitForTimeout(300);

    expect(pendant.x).toBeGreaterThan(avant.x + 100);
    expect(pendant.y).toBeGreaterThan(avant.y + 50);
});

test('CAS B — tirer une évaluation HORS de sa leçon la détache (le geste du terrain)', async ({ page }) => {
    await ouvrirCarte(page);
    await page.evaluate(() => {
        window.planificationCarte.injecterNoeuds([
            { id: 'p148L', type: 'lecon', titre: 'Leçon preuve', x: 600, y: 300, enfants: ['p148E'] },
            { id: 'p148E', type: 'evaluation', titre: 'Éval preuve', x: 630, y: 380, parent: 'p148L' }
        ]);
    });
    await page.waitForTimeout(400);
    await teleporter(page, 'p148L', 320, 60);
    // Téléporter l'ÉVALUATION elle-même : positionnée relativement à la leçon,
    // elle finissait sous le popup du mode démo (bas d'écran) — pointerdown
    // n'atteignait jamais le nœud (diagnostic aux compteurs : down=0).
    await teleporter(page, 'p148E', 350, 130);

    const parentAvant = await page.evaluate(() =>
        window.planificationCarte.etat.noeuds.get('p148E').parent);
    expect(parentAvant).toBe('p148L');

    const box = await page.locator('#p148E').boundingBox();
    expect(box).not.toBeNull();
    // Saisir l'ÉVALUATION par son en-tête et la tirer loin à droite, hors leçon.
    await page.mouse.move(box.x + 12, box.y + 8);
    await page.mouse.down();
    for (let i = 1; i <= 10; i++) {
        await page.mouse.move(box.x + 12 + i * 48, box.y + 8 + i * 4);
        await page.waitForTimeout(40);
    }
    await page.mouse.up();
    await page.waitForTimeout(400);

    // Le geste du terrain est « SORTIR de sa leçon » : atterrir libre OU dans
    // un autre conteneur de la carte démo sont deux extractions réussies.
    const parentApres = await page.evaluate(() =>
        window.planificationCarte.etat.noeuds.get('p148E').parent);
    expect(parentApres).not.toBe('p148L');
});
