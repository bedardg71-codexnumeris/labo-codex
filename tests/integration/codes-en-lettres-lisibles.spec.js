import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { attendreApplication } from './harness/attendre-application.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

// DES CODES D'ANNOTATION EN LETTRES, LISIBLES PARTOUT — lot 1 (24 nov. 2026,
// `plans de travail/RAPPORT-2026-11-24-codes-en-lettres-lot-1.md`), et sa suite de 17 h 55 (la pastille).
//
// Une grille dont les codes ont deux, trois ou quatre caractères en lettres, tiret compris. L'application les
// comptait déjà ; ce banc juge qu'ils se LISENT :
//   1. sur la copie, dans le PDF et sous le curseur : un code d'un ou deux caractères garde le cercle d'hier ; un
//      code de trois ou quatre caractères se dessine dans une PASTILLE, son texte à la taille d'un chiffre, centrée
//      sur le point touché, le texte dedans ; un code plus long (le stock seulement) dans une pastille plafonnée ;
//   2. toucher, déplacer, dupliquer, effacer, sélectionner au rectangle et redimensionner suivent la pastille ;
//   3. la pastille de la palette étendue : sur une ligne, sans recouvrir le nom, les noms alignés en colonne ;
//   4. la page de synthèse du PDF tient quatre caractères dans sa pastille ;
//   5. la grille refuse à la saisie un code accentué, un code qui ne diffère d'un autre que par la casse, et un
//      code de cinq caractères ou plus ; l'écran d'une grille enregistrée dit la vraie raison d'un code qui ne se pose pas.
//
// ↻ RÉANCRÉ LE 24 NOV. À 18 H (décision de Grégoire, 17 h 45) : les essais 1 à 3 exigeaient que le texte tienne
//   dans le CERCLE, en rapetissant ; à trois caractères, il devenait trop petit pour se lire d'un coup d'œil.
//   Ils exigent maintenant la PASTILLE, le texte à la taille d'un chiffre. Le cercle des codes d'un ou deux
//   caractères reste celui de `main`, au pixel (le témoin « 7 », et la comparaison du rapport).
//
// ⛔ CONFIDENTIALITÉ : le jeu de codes est FICTIF (consignes du 24 nov.) : quatorze codes de trois caractères au plus,
// trois de quatre (« Code fictif 15 » à « 17 »), « ABCDE » pour le refus, « ABCDEF » pour le stock, semé et jamais
// tapé. Aucun autre.

const CODES = ['K-A', 'K-B', 'K-C', 'M-A', 'M-B', 'M-C', 'T-A', 'T-B', 'T-C', 'V-A', 'V-B', 'QRS', 'W-A', 'W-B', 'K-AB', 'QRST', 'W-12'];
const SOUS_CRITERES = CODES.map((code, i) => ({
    id: 'sc_f' + (i + 1), code, nom: 'Code fictif ' + (i + 1), ponderation: 1, retroaction: ''
}));
// Le stock : un code plus long que quatre, enregistré avant la règle (semé, jamais tapé).
const STOCK = { id: 'sc_stock', code: 'ABCDEF', nom: 'Code fictif ancien', ponderation: 1, retroaction: '' };

const patternsAttendus = [
    /version\.json.*access control/i,
    /Cross origin requests are only supported/i,
    /Not allowed to load local resource.*\.(svg|png)/i,
    /Aucune échelle de performance configurée/,
    /Grille introuvable ou sans critères/,
    /The operation is insecure/
];

/** Une vraie copie ouverte en Annoter, dont la production porte la grille des codes fictifs (et le code ancien). */
async function ouvrirCopieFictive(page) {
    const erreurs = [];
    const estAttendue = (m) => patternsAttendus.some((re) => re.test(m));
    page.on('dialog', (d) => d.dismiss().catch(() => {}));
    page.on('pageerror', (e) => { const m = `pageerror: ${e.message}`; if (!estAttendue(m)) erreurs.push(m); });
    await page.goto(indexHtml);
    await page.waitForFunction(() => typeof window.executerActionEval === 'function'
        && window.travauxUI && window.travauxStockage && typeof window.db !== 'undefined');
    await page.evaluate((sousCriteres) => {
        const t = 'testlettres';
        window.db.setSync('trimestres', [{ id: t, nom: 'Trimestre fictif', actif: true }]);
        window.db.setSync('trimestreActif', t);
        const coursId = 'cours-fictif';
        window.db.setSync('cours', [{ id: coursId, codeCours: 'FIC101', titre: 'Cours fictif' }]); // security-ok: fixture de test
        window.db.setSync('infoCours', { id: coursId, codeCours: 'FIC101', groupe: '01', _groupeCoursId: 'GC_FIC' }); // security-ok: fixture de test
        window.db.setSync('groupeCoursActif', { id: 'GC_FIC', trimestreId: t });
        window.db.setSync(t + '_groupesCours', [{ id: 'GC_FIC', trimestreId: t, coursId, groupeNum: '01', pratiqueId: 'sommative', actif: true }]);
        window.db.setSync(window.cle('groupeEtudiants'), [{ da: 'FICTIF01', nom: 'Fictif', prenom: 'Alpha', groupe: '01', coursId }]); // security-ok: fixture de test
        window.db.setSync(window.cle('grillesTemplates'), [{ // security-ok: fixture de test
            id: 'G_FICTIVE', nom: 'Grille fictive',
            criteres: [{ id: 'CR_F', nom: 'Codes fictifs', type: 'algorithmique', ponderation: 100,
                codesSousCriteresSeulement: true, sousCriteres: sousCriteres }]
        }]);
        window.db.setSync(window.cle('productions'), [{ id: 'P_FIC', titre: 'Production fictive', type: 'travail', ponderation: 100, grilleId: 'G_FICTIVE' }]); // security-ok: fixture de test
        window.db.setSync(window.cle('fichiersTravaux'), [{ // security-ok: fixture de test
            id: 'FT_FIC', etudiantDA: 'FICTIF01', productionId: 'P_FIC', coursId, groupeCoursId: 'GC_FIC',
            nomFichier: 'FICTIF_Production.png', typeMIME: 'image/png', tailleFichier: 70, nombrePages: 1,
            stockage: 'indexeddb', thumbnailDataUrl: '', dateImport: '2026-11-24T12:00:00.000Z', dateModification: '2026-11-24T12:00:00.000Z',
            source: 'import-local', importePar: 'single', statut: 'present'
        }]);
        const cv = document.createElement('canvas'); cv.width = 800; cv.height = 1100;
        const cx = cv.getContext('2d'); cx.fillStyle = '#fff'; cx.fillRect(0, 0, 800, 1100);
        const b64 = cv.toDataURL('image/png').split(',')[1];
        const octets = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
        const copie = new Blob([octets], { type: 'image/png' });
        const original = window.travauxStockage.recupererBlob;
        window.travauxStockage.recupererBlob = async function (id) { return id === 'FT_FIC' ? copie : original.apply(this, arguments); };
    }, SOUS_CRITERES.concat([STOCK]));
    await page.evaluate(() => window.afficherSection('evaluations'));
    await page.waitForFunction(() => !!document.querySelector('#section-evaluations.active') && window.travauxUI.getModeCourant() === 'annoter', null, { timeout: 10000 });
    await page.evaluate(() => window.executerActionEval({ value: 'annoter|FT_FIC|P_FIC' }));
    await page.waitForFunction(() => !!document.querySelector('#evaluations-annoter.sous-section.active'), null, { timeout: 10000 });
    await page.waitForFunction(() => !!document.querySelector('.travaux-errfr-item[data-param="errfr_K-A"]'), null, { timeout: 10000 });
    await page.evaluate(() => { const o = document.getElementById('overlay-backup-reminder'); if (o) o.remove(); });
    await installerMesures(page);
    return erreurs;
}

// La mesure d'un code dessiné, sur un canevas TRANSPARENT (le calque d'annotation, le canevas d'essai du PDF, le
// curseur), autour du point (cx, cy), pour un cercle de rayon r :
//   · gauche, droite : l'étendue de la COULEUR de part et d'autre du point (un cercle : r ; une pastille : plus) ;
//   · haut, bas : l'étendue verticale de la couleur (le cercle et la pastille ont la même hauteur) ;
//   · encre : la hauteur, en pixels, du texte blanc — la taille à laquelle le code se lit ;
//   · dedans : le nombre de pixels blancs, garde de non-vide (règle 10) ;
//   · auBord : les pixels blancs dont un voisin est hors de la forme (transparent) : du texte qui déborde ou touche.
// ⚠ Installées par `page.evaluate` (qui passe outre la CSP) : un `eval` DANS la page est refusé par la CSP.
async function installerMesures(page) {
    await page.evaluate(() => {
        window.__bancLettres = {
            mesurer(canvas, cx, cy, r) {
                const ctx = canvas.getContext('2d');
                const x0 = Math.max(0, Math.floor(cx - 4 * r)), y0 = Math.max(0, Math.floor(cy - 2 * r));
                const w = Math.min(canvas.width - x0, Math.ceil(8 * r)), h = Math.min(canvas.height - y0, Math.ceil(4 * r));
                const d = ctx.getImageData(x0, y0, w, h).data;
                const a = (i, j) => (i < 0 || j < 0 || i >= w || j >= h) ? 0 : d[(j * w + i) * 4 + 3];
                let gauche = 0, droite = 0, haut = 0, bas = 0, dedans = 0, auBord = 0, encreMin = Infinity, encreMax = -Infinity;
                for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
                    const k = (j * w + i) * 4;
                    if (d[k + 3] < 128) continue;
                    const x = x0 + i + 0.5 - cx, y = y0 + j + 0.5 - cy;
                    const blanc = d[k] > 200 && d[k + 1] > 200 && d[k + 2] > 200;
                    if (blanc) {
                        dedans++;
                        encreMin = Math.min(encreMin, j); encreMax = Math.max(encreMax, j);
                        if (a(i - 1, j) < 128 || a(i + 1, j) < 128 || a(i, j - 1) < 128 || a(i, j + 1) < 128) auBord++;
                    } else {
                        gauche = Math.max(gauche, -x); droite = Math.max(droite, x);
                        haut = Math.max(haut, -y); bas = Math.max(bas, y);
                    }
                }
                return { gauche: +gauche.toFixed(1), droite: +droite.toFixed(1), haut: +haut.toFixed(1), bas: +bas.toFixed(1),
                    encre: dedans ? encreMax - encreMin + 1 : 0, dedans, auBord };
            },
            // Les formes posées au banc : un code par place, espacés, chacun dans un carré de 0,06 de la largeur (le rayon
            // est indifférent : tout suit le rayon). « errfr_7 », que la grille ne connaît pas, garde son chiffre : c'est
            // le TÉMOIN, un code d'un caractère dans un cercle, avant comme après.
            formes(W, H, types) {
                return types.map((type, i) => {
                    const cxN = 0.13 + (i % 4) * 0.25, cyN = 0.08 + Math.floor(i / 4) * 0.13;
                    const dx = 0.03, dy = 0.03 * W / H;
                    return { id: 'SH_' + i, type, color: '#c62828', lineWidth: 3, x1: cxN - dx, y1: cyN - dy, x2: cxN + dx, y2: cyN + dy };
                });
            }
        };
    });
}

const LONGS = ['errfr_K-A', 'errfr_QRS', 'errfr_W-B', 'errfr_M-C', 'errfr_K-AB', 'errfr_QRST', 'errfr_W-12'];
const TYPES = LONGS.concat(['errfr_ABCDEF', 'errfr_7']);

/** Les jugements communs à la copie et au PDF : `r` est la liste mesurée, dans l'ordre de TYPES. */
function jugerFormes(r) {
    const par = Object.fromEntries(r.map((m) => [m.type, m]));
    const temoin = par.errfr_7;
    // Le témoin : un cercle (sa couleur s'étend d'un rayon de chaque côté), le texte dedans.
    expect(temoin.dedans, 'témoin : le chiffre est écrit').toBeGreaterThan(20);
    expect(Math.abs(temoin.droite - temoin.rayon), 'témoin : un cercle').toBeLessThanOrEqual(1.5);
    expect(temoin.auBord, 'témoin : le chiffre ne touche pas le bord').toBe(0);
    for (const type of LONGS) {
        const m = par[type];
        expect(m.dedans, type + ' : le code est écrit (garde de non-vide)').toBeGreaterThan(20);
        expect(m.encre, type + ' : le texte à la taille d’un chiffre').toBeGreaterThanOrEqual(temoin.encre - 1);
        expect(m.droite, type + ' : une pastille, plus large que le cercle').toBeGreaterThan(m.rayon + 2);
        expect(Math.abs(m.droite - m.gauche), type + ' : centrée sur le point touché').toBeLessThanOrEqual(1.5);
        expect(Math.max(m.haut, m.bas), type + ' : la hauteur du cercle').toBeLessThanOrEqual(m.rayon + 1.5);
        expect(m.auBord, type + ' : le texte reste dans la pastille').toBe(0);
    }
    // Le stock (plus de quatre caractères) : une pastille plafonnée, le texte plus petit pour y tenir.
    const s = par.errfr_ABCDEF;
    expect(s.dedans, 'ABCDEF : le code est écrit').toBeGreaterThan(20);
    expect(s.droite, 'ABCDEF : une pastille').toBeGreaterThan(s.rayon + 2);
    expect(s.droite, 'ABCDEF : plafonnée (quatre caractères larges, sous 2,4 fois le rayon)').toBeLessThanOrEqual(s.rayon * 2.4);
    expect(s.encre, 'ABCDEF : le texte rapetisse pour tenir').toBeLessThan(temoin.encre);
    expect(s.auBord, 'ABCDEF : le texte reste dans la pastille').toBe(0);
}

test.describe('codes en lettres · lot 1 — lisibles partout', () => {
    test('1 · sur la copie : un chiffre dans son cercle, trois ou quatre caractères dans une pastille', async ({ page }) => {
        const erreurs = await ouvrirCopieFictive(page);
        const r = await page.evaluate(({ types }) => {
            const canvas = document.getElementById('travaux-canvas-annotation');
            const W = canvas.width, H = canvas.height;
            const ann = window.travauxAnnotation.getAnnotationCourante();
            const page0 = ann.pages[0] || (ann.pages[0] = { strokes: [], textAnnotations: [], shapes: [], stickers: [] });
            page0.shapes = window.__bancLettres.formes(W, H, types);
            window.travauxAnnotation.reRendreAnnotations();
            return page0.shapes.map((f) => {
                const cx = (f.x1 + f.x2) / 2 * W, cy = (f.y1 + f.y2) / 2 * H;
                const rayon = Math.min(Math.abs(f.x2 - f.x1) * W, Math.abs(f.y2 - f.y1) * H) / 2;
                return Object.assign({ type: f.type, rayon: +rayon.toFixed(1) }, window.__bancLettres.mesurer(canvas, cx, cy, rayon));
            });
        }, { types: TYPES });
        console.log('COPIE →', JSON.stringify(r));
        expect(r[0].rayon, 'le cercle a une taille mesurable').toBeGreaterThan(12);
        jugerFormes(r);
        expect(erreurs).toEqual([]);
    });

    test('2 · dans le PDF : la même règle que la copie', async ({ page }) => {
        await ouvrirCopieFictive(page);
        const r = await page.evaluate(async ({ types }) => {
            // Le canevas d'une page du PDF : `dessinerAnnotationsSurCtx` est ce qui y peint les annotations,
            // au double (EXPORT_SCALE). Transparent ici, pour voir ce qui déborde.
            const canvas = document.createElement('canvas'); canvas.width = 1600; canvas.height = 2200;
            const ctx = canvas.getContext('2d');
            const shapes = window.__bancLettres.formes(canvas.width, canvas.height, types);
            await window.travauxExportPDF.dessinerAnnotationsSurCtx(ctx, canvas.width, canvas.height, { shapes, strokes: [], textAnnotations: [], stickers: [] }, 2);
            return shapes.map((f) => {
                const cx = (f.x1 + f.x2) / 2 * canvas.width, cy = (f.y1 + f.y2) / 2 * canvas.height;
                const rayon = Math.min(Math.abs(f.x2 - f.x1) * canvas.width, Math.abs(f.y2 - f.y1) * canvas.height) / 2;
                return Object.assign({ type: f.type, rayon: +rayon.toFixed(1) }, window.__bancLettres.mesurer(canvas, cx, cy, rayon));
            });
        }, { types: TYPES });
        console.log('PDF →', JSON.stringify(r));
        jugerFormes(r);
    });

    test('3 · sous le curseur : une pastille élargit l’image, le point actif au centre, le texte à la taille d’hier', async ({ page }) => {
        await ouvrirCopieFictive(page);
        const r = [];
        for (const code of ['K-A', 'QRS', 'W-B', 'K-AB', 'QRST', 'W-12']) {
            r.push(await page.evaluate(async ({ code }) => {
                document.querySelector('.travaux-errfr-item[data-param="errfr_' + code + '"]').click();
                const curseur = document.getElementById('travaux-canvas-annotation').style.cursor;
                const m = /url\("?(data:image\/png;base64,[^")]+)"?\)\s+(\d+)\s+(\d+)/.exec(curseur);
                if (!m) return { code, curseur };
                const img = new Image();
                await new Promise((ok, ko) => { img.onload = ok; img.onerror = ko; img.src = m[1]; });
                const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
                c.getContext('2d').drawImage(img, 0, 0);
                return Object.assign({ code, largeur: img.width, hauteur: img.height, pointX: +m[2], pointY: +m[3] },
                    window.__bancLettres.mesurer(c, img.width / 2, img.height / 2, img.height / 2 - 1));
            }, { code }));
        }
        console.log('CURSEUR →', JSON.stringify(r));
        for (const m of r) {
            expect(m.hauteur, m.code + ' : la hauteur d’hier').toBe(32);
            expect(m.largeur, m.code + ' : une pastille élargit l’image').toBeGreaterThan(32);
            expect(m.pointX, m.code + ' : le point actif au centre').toBe(Math.round(m.largeur / 2));
            expect(m.pointY, m.code + ' : le point actif au centre').toBe(16);
            expect(m.dedans, m.code + ' : le code est écrit (garde de non-vide)').toBeGreaterThan(10);
            // La police d'hier est de 18 px : une capitale grasse y fait 13 px (12 au moins, toute police). Rapetissé
            // dans le cercle (17 h 38), « K-A » n'en faisait plus que 10.
            expect(m.encre, m.code + ' : le texte à la taille d’hier').toBeGreaterThanOrEqual(12);
            expect(m.auBord, m.code + ' : le texte reste dans la pastille').toBe(0);
        }
    });

    test('3 bis · toucher, déplacer, dupliquer, effacer, sélectionner au rectangle, redimensionner : la pastille entière', async ({ page }) => {
        await ouvrirCopieFictive(page);
        // Un grand « K-AB » (carré enregistré de 0,1 de la largeur) : sa pastille déborde son carré de part et d'autre
        // plus loin que la marge du toucher (0,02). On le touche par son bout droit, hors du carré et de la marge.
        const pose = await page.evaluate(() => {
            const canvas = document.getElementById('travaux-canvas-annotation');
            const ann = window.travauxAnnotation.getAnnotationCourante();
            const p0 = ann.pages[0] || (ann.pages[0] = { strokes: [], textAnnotations: [], shapes: [], stickers: [] });
            const W = canvas.width, H = canvas.height, d = 0.05;
            p0.shapes = [{ id: 'SH_GRAND', type: 'errfr_K-AB', color: '#c62828', lineWidth: 3, x1: 0.5 - d, x2: 0.5 + d, y1: 0.3 - d * W / H, y2: 0.3 + d * W / H }];
            window.travauxAnnotation.reRendreAnnotations();
            // Le bout droit de la couleur, mesuré au calque (pas calculé par l'application).
            const m = window.__bancLettres.mesurer(canvas, 0.5 * W, 0.3 * H, d * W);
            window.travauxOutils.setOutilActif('selection');
            return { W, H, d, boutDroit: m.droite / W };
        });
        console.log('POSE →', JSON.stringify(pose));
        expect(pose.boutDroit, 'la pastille déborde le carré et la marge du toucher').toBeGreaterThan(pose.d + 0.02 + 0.005);
        const xTouche = 0.5 + pose.boutDroit - 0.006;   // dans la couleur, près du bout
        const geste = (evs) => page.evaluate((evs) => {
            const c = document.getElementById('travaux-canvas-annotation'); const r = c.getBoundingClientRect();
            const nom = { down: 'pointerdown', move: 'pointermove', up: 'pointerup' };
            for (const e of evs) c.dispatchEvent(new PointerEvent(nom[e.t], { bubbles: true, cancelable: true, pointerType: 'mouse',
                pointerId: 1, isPrimary: true, button: 0, buttons: e.t === 'up' ? 0 : 1,
                clientX: r.left + r.width * e.x, clientY: r.top + r.height * e.y }));
        }, evs);
        const formes = () => page.evaluate(() => window.travauxAnnotation.getAnnotationCourante().pages[0].shapes.map((f) => ({
            x1: +f.x1.toFixed(4), x2: +f.x2.toFixed(4), y1: +f.y1.toFixed(4), y2: +f.y2.toFixed(4) })));

        // Toucher le bout, puis glisser : la forme suit.
        await geste([{ t: 'down', x: xTouche, y: 0.3 }, { t: 'move', x: xTouche + 0.1, y: 0.3 }, { t: 'up', x: xTouche + 0.1, y: 0.3 }]);
        const deplace = await formes();
        console.log('DÉPLACÉE →', JSON.stringify(deplace));
        expect(deplace[0].x1, 'toucher le bout de la pastille la sélectionne, glisser la déplace').toBeCloseTo(0.55, 3);
        // Dupliquer puis effacer la sélection.
        await page.evaluate(() => window.travauxAnnotation.dupliquerSelection());
        expect((await formes()).length, 'dupliquer').toBe(2);
        await page.evaluate(() => window.travauxAnnotation.supprimerSelection());
        expect((await formes()).length, 'effacer').toBe(1);

        // Le rectangle de sélection qui ne couvre QUE le bout de la pastille (hors du carré) la prend. Il part du vide,
        // au-delà du bout et de la marge du toucher : sinon, ce serait un toucher, donc un déplacement.
        await geste([{ t: 'down', x: 0.95, y: 0.02 }, { t: 'up', x: 0.95, y: 0.02 }]);   // désélectionner (clic dans le vide)
        const centre = async () => { const f = (await formes())[0]; return { x: (f.x1 + f.x2) / 2, y: (f.y1 + f.y2) / 2, f }; };
        const c1 = await centre();
        const bout = c1.x + pose.boutDroit;
        await geste([{ t: 'down', x: bout + 0.03, y: c1.y - 0.01 }, { t: 'move', x: bout - 0.01, y: c1.y + 0.01 }, { t: 'up', x: bout - 0.01, y: c1.y + 0.01 }]);
        await page.evaluate(() => window.travauxAnnotation.dupliquerSelection());
        expect((await formes()).length, 'le rectangle sur le bout de la pastille la sélectionne').toBe(2);
        await page.evaluate(() => window.travauxAnnotation.supprimerSelection());

        // Redimensionner par la poignée du coin du CADRE (celui de la pastille) : sans saut au premier geste, le centre
        // reste, le carré enregistré garde ses proportions.
        const c2 = await centre();
        const avant = c2.f;
        await geste([{ t: 'down', x: c2.x + pose.boutDroit - 0.004, y: c2.y }, { t: 'up', x: c2.x + pose.boutDroit - 0.004, y: c2.y }]);   // sélectionner
        // Le coin bas-droit du cadre de la pastille : au bout droit dessiné, au bas du carré.
        const coinX = c2.x + pose.boutDroit, coinY = Math.max(avant.y1, avant.y2);
        await geste([{ t: 'down', x: coinX, y: coinY }, { t: 'move', x: coinX, y: coinY }]);
        const sansSaut = (await formes())[0];
        const loin = { x: c2.x + (coinX - c2.x) * 1.5, y: c2.y + (coinY - c2.y) * 1.5 };
        await geste([{ t: 'move', x: loin.x, y: loin.y }, { t: 'up', x: loin.x, y: loin.y }]);
        const apres = (await formes())[0];
        console.log('REDIM →', JSON.stringify({ avant, sansSaut, apres }));
        expect(sansSaut, 'saisir la poignée ne fait rien sauter').toEqual(avant);
        expect((apres.x1 + apres.x2) / 2, 'le centre reste').toBeCloseTo((avant.x1 + avant.x2) / 2, 3);
        expect((apres.y1 + apres.y2) / 2, 'le centre reste').toBeCloseTo((avant.y1 + avant.y2) / 2, 3);
        expect((apres.x2 - apres.x1) / (avant.x2 - avant.x1), 'il grandit').toBeCloseTo(1.5, 1);
        // Deux décimales : les coordonnées lues sont arrondies à quatre (`formes`), le rapport en hérite.
        expect((apres.y2 - apres.y1) / (apres.x2 - apres.x1), 'ses proportions restent').toBeCloseTo((avant.y2 - avant.y1) / (avant.x2 - avant.x1), 2);
    });

    test('4 · la palette étendue : chaque code sur une ligne, sans recouvrir le nom, les noms alignés (trois et quatre caractères)', async ({ page }) => {
        await ouvrirCopieFictive(page);
        const r = await page.evaluate(() => {
            const palette = document.getElementById('travaux-palette-erreurs-fr');
            return {
                compacte: palette ? palette.classList.contains('codes-compacte') : null,
                items: [...document.querySelectorAll('#travaux-palette-erreurs-fr .travaux-errfr-item')].map((item) => {
                    const pastille = item.querySelector('.travaux-errfr-numero');
                    const nom = item.querySelector('.travaux-errfr-nom');
                    const plage = document.createRange(); plage.selectNodeContents(pastille);
                    const lignes = new Set([...plage.getClientRects()].map((x) => Math.round(x.top))).size;
                    const t = plage.getBoundingClientRect(), p = pastille.getBoundingClientRect(), n = nom.getBoundingClientRect();
                    return {
                        code: pastille.textContent, lignes,
                        dansLaPastille: t.left >= p.left - 0.5 && t.right <= p.right + 0.5 && t.top >= p.top - 0.5 && t.bottom <= p.bottom + 0.5,
                        avantLeNom: t.right <= n.left + 0.5 && p.right <= n.left + 0.5,
                        hauteur: Math.round(p.height), largeur: +p.width.toFixed(1), nomGauche: +n.left.toFixed(1)
                    };
                })
            };
        });
        console.log('PALETTE →', JSON.stringify(r));
        expect(r.compacte, 'la palette s\'ouvre en version étendue').toBe(false);
        expect(r.items.map((i) => i.code)).toEqual(CODES.concat(['ABCDEF']));
        for (const i of r.items) {
            expect(i.lignes, i.code + ' : une seule ligne').toBe(1);
            expect(i.dansLaPastille, i.code + ' : le code reste dans sa pastille').toBe(true);
            expect(i.avantLeNom, i.code + ' : la pastille ne recouvre pas le nom').toBe(true);
            expect(i.hauteur, i.code + ' : la pastille garde sa hauteur').toBe(20);
        }
        // Trois et quatre caractères : une seule colonne de noms (capture du 24 nov. : M-A poussait son nom de 7 px).
        const colonne = new Set(r.items.filter((i) => i.code.length >= 3 && i.code.length <= 4).map((i) => i.nomGauche));
        expect([...colonne], 'les noms des codes de trois et quatre caractères commencent à la même abscisse').toHaveLength(1);
    });

    test('4 bis · la version compacte n’hérite pas de la gélule : chaque code reste dans sa tuile', async ({ page }) => {
        await ouvrirCopieFictive(page);
        const r = await page.evaluate(() => {
            const id = 'travaux-palette-erreurs-fr';
            if (!document.getElementById(id).classList.contains('codes-compacte')) window.travauxOutils.basculerVersionPalette(id);
            return {
                compacte: document.getElementById(id).classList.contains('codes-compacte'),
                items: [...document.querySelectorAll('#' + id + ' .travaux-errfr-item')].map((item) => {
                    const t = item.getBoundingClientRect(), p = item.querySelector('.travaux-errfr-numero').getBoundingClientRect();
                    return { code: item.dataset.param, largeurTuile: +t.width.toFixed(1),
                        dansLaTuile: p.left >= t.left - 0.5 && p.right <= t.right + 0.5 && p.top >= t.top - 0.5 && p.bottom <= t.bottom + 0.5 };
                })
            };
        });
        console.log('COMPACTE →', JSON.stringify(r));
        expect(r.compacte).toBe(true);
        expect(r.items).toHaveLength(18);
        for (const i of r.items) {
            expect(i.largeurTuile, i.code + ' : une tuile mesurable').toBeGreaterThan(20);
            expect(i.dansLaTuile, i.code + ' : la pastille reste dans sa tuile').toBe(true);
        }
    });

    test('4 ter · la page de synthèse du PDF : quatre caractères dans leur pastille, sur une ligne', async ({ page }) => {
        await page.goto(indexHtml);
        await attendreApplication(page);
        const r = await page.evaluate(async () => {
            // Les deux codes les plus fréquents, rendus par la page de synthèse elle-même, sur fond noir pour voir le blanc.
            const html = window.syntheseRetroactionRendu.rendreSyntheseHTML({
                scale: [], criteria: [], stamps: [], errorsTotal: 5, errorsLabel: 'Codes fictifs',
                errors: [
                    { code: 'QRST', name: 'Code fictif 16', count: 3, color: '#c62828', retroaction: '' },
                    { code: '7', name: 'Témoin', count: 2, color: '#1565c0', retroaction: '' }
                ]
            });
            const hote = document.createElement('div');
            hote.style.cssText = 'position:fixed;left:0;top:0;z-index:99999;background:#000;';
            hote.innerHTML = html;   // security-ok: rendu de l'application, données littérales du banc
            document.body.appendChild(hote);
            // La pastille : la première case de chaque ligne de la liste des erreurs (une grille à trois colonnes).
            const pastilles = [...hote.querySelectorAll('div[style*="grid-template-columns"]')]
                .filter((l) => l.children.length === 3 && /^\d+px 1fr 26px$/.test(l.style.gridTemplateColumns))
                .map((l) => l.children[0]);
            return pastilles.map((p) => {
                const plage = document.createRange(); plage.selectNodeContents(p);
                const lignes = new Set([...plage.getClientRects()].map((x) => Math.round(x.top))).size;
                const t = plage.getBoundingClientRect(), b = p.getBoundingClientRect();
                const nom = p.nextElementSibling ? p.nextElementSibling.getBoundingClientRect() : null;
                return { code: p.textContent, lignes, hauteur: Math.round(b.height),
                    dedans: t.left >= b.left - 0.5 && t.right <= b.right + 0.5,
                    avantLeNom: !nom || b.right <= nom.left + 0.5 };
            });
        });
        console.log('SYNTHÈSE →', JSON.stringify(r));
        expect(r.map((p) => p.code)).toEqual(['QRST', '7']);
        for (const p of r) {
            expect(p.lignes, p.code + ' : une ligne').toBe(1);
            expect(p.hauteur, p.code + ' : la hauteur d’hier').toBe(18);
            expect(p.dedans, p.code + ' : le code dans sa pastille').toBe(true);
            expect(p.avantLeNom, p.code + ' : la pastille avant le nom').toBe(true);
        }
    });

    // L'écran de la grille, ouvert en modification sur une grille de banc.
    const OUVRIR_GRILLE = `async (sousCriteres) => {
        db.setSync('trimestres', [{ id: 'a2026', nom: 'Automne 2026', annee: 2026, session: 'A', actif: true }]);
        db.setSync('trimestreActif', 'a2026');
        await db.set(cle('grillesTemplates'), [{ // security-ok: fixture littérale du spec
            id: 'G_FICTIVE', nom: 'Grille fictive', dansBibliotheque: true,
            criteres: [{ id: 'CR_F', nom: 'Codes fictifs', type: 'algorithmique', ponderation: 100,
                codesSousCriteresSeulement: true, sousCriteres: sousCriteres }]
        }]);
        window.afficherSection('conception');
        window.afficherSousSection('conception-grille-criteres');
        await window.chargerGrillePourModif('G_FICTIVE');
        return document.querySelectorAll('#listeCriteres .sous-critere-input-code').length;
    }`;
    const SAISIR_CODE = `async ({ index, valeur }) => {
        const champ = document.querySelectorAll('#listeCriteres .sous-critere-input-code')[index];
        champ.value = valeur;
        champ.dispatchEvent(new Event('change', { bubbles: true }));
        await new Promise((ok) => setTimeout(ok, 400));
        const g = (await db.get(cle('grillesTemplates')))[0];
        const apres = document.querySelectorAll('#listeCriteres .sous-critere-input-code')[index];
        return {
            ecrit: g.criteres[0].sousCriteres[index].code,
            refuse: !!(apres && apres.classList.contains('champ-refuse')) || champ.classList.contains('champ-refuse'),
            temoin: (document.querySelector('.temoin-enregistrement, #temoin-enregistrement') || {}).textContent || ''
        };
    }`;

    test('5 · la grille refuse à la saisie un code qui ne diffère d\'un autre que par la casse', async ({ page }) => {
        await page.goto(indexHtml);
        await attendreApplication(page);
        // Treize des quatorze codes : « W-B » reste libre, pour le témoin.
        expect(await page.evaluate(eval(OUVRIR_GRILLE), SOUS_CRITERES.slice(0, 13))).toBe(13);
        // Le témoin : un code distinct de tous les autres s'écrit.
        const libre = await page.evaluate(eval(SAISIR_CODE), { index: 2, valeur: 'W-B' });
        console.log('CASSE, témoin →', JSON.stringify(libre));
        expect(libre.ecrit).toBe('W-B');
        expect(libre.refuse).toBe(false);
        // « k-a » ne diffère de « K-A » (rang 0) que par la casse : refusé, rien n'est écrit.
        const casse = await page.evaluate(eval(SAISIR_CODE), { index: 1, valeur: 'k-a' });
        console.log('CASSE →', JSON.stringify(casse));
        expect(casse.ecrit, 'le code d\'avant reste').toBe('K-B');
        expect(casse.refuse, 'le champ dit son refus').toBe(true);
        // Le même code, au même rang, qui ne change que de casse : ce n'est pas un doublon.
        const soi = await page.evaluate(eval(SAISIR_CODE), { index: 0, valeur: 'k-a' });
        expect(soi.ecrit).toBe('k-a');
        expect(soi.refuse).toBe(false);
    });

    test('5 bis · quatre caractères au plus à la saisie ; un code ancien plus long reste posable', async ({ page }) => {
        await page.goto(indexHtml);
        await attendreApplication(page);
        // La grille enregistrée porte « ABCDEF » (le stock, semé) : la note n'en dit rien, il se pose.
        expect(await page.evaluate(eval(OUVRIR_GRILLE), SOUS_CRITERES.slice(0, 13).concat([STOCK]))).toBe(14);
        const note = await page.locator('#listeCriteres .sous-criteres-codes-note').first().textContent();
        expect(note, 'le code ancien se pose').toContain('ces 14 sous-critères');
        // Le témoin : quatre caractères s'écrivent.
        const quatre = await page.evaluate(eval(SAISIR_CODE), { index: 2, valeur: 'QRST' });
        expect(quatre.ecrit).toBe('QRST');
        expect(quatre.refuse).toBe(false);
        // Cinq : refusé, et le témoin dit pourquoi.
        const cinq = await page.evaluate(eval(SAISIR_CODE), { index: 1, valeur: 'ABCDE' });
        console.log('CINQ →', JSON.stringify(cinq));
        expect(cinq.ecrit, 'le code d\'avant reste').toBe('K-B');
        expect(cinq.refuse, 'le champ dit son refus').toBe(true);
        expect(cinq.temoin, 'la phrase dit quatre').toMatch(/quatre caractères/);
        // Le code ancien, retouché sans changer, n'est pas refusé (sa ligne garde ce qu'elle a).
        const ancien = await page.evaluate(eval(SAISIR_CODE), { index: 13, valeur: 'ABCDEF' });
        expect(ancien.ecrit).toBe('ABCDEF');
        expect(ancien.refuse, 'un code ancien, laissé tel quel, n’est pas refusé').toBe(false);
    });

    test('6 · un code accentué : refusé à la saisie, et l\'écran d\'une grille enregistrée dit la vraie raison', async ({ page }) => {
        await page.goto(indexHtml);
        await attendreApplication(page);
        // Une grille déjà enregistrée qui porte un code accentué (le stock) : il ne se pose pas, et la note
        // le dit en le nommant — plus « pondération 0 », qui est faux : tous pèsent 1.
        const stock = SOUS_CRITERES.slice(0, 14).map((sc, i) => (i === 13 ? Object.assign({}, sc, { code: 'É-B' }) : sc));
        expect(await page.evaluate(eval(OUVRIR_GRILLE), stock)).toBe(14);
        const note = await page.locator('#listeCriteres .sous-criteres-codes-note').first().textContent();
        console.log('NOTE →', note);
        expect(note).toContain('ces 13 sous-critères');
        expect(note, 'la fausse raison n\'est plus donnée').not.toContain('pondération 0');
        expect(note, 'la note nomme le code qui ne se pose pas').toContain('É-B');
        // À la saisie : « É-A » est refusé, rien n'est écrit.
        const accent = await page.evaluate(eval(SAISIR_CODE), { index: 1, valeur: 'É-A' });
        console.log('ACCENT →', JSON.stringify(accent));
        expect(accent.ecrit, 'le code d\'avant reste').toBe('K-B');
        expect(accent.refuse, 'le champ dit son refus').toBe(true);
    });
});
