import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { attendreApplication } from './harness/attendre-application.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

// DES CODES D'ANNOTATION EN LETTRES, LISIBLES PARTOUT — lot 1 (24 nov. 2026,
// `plans de travail/RAPPORT-2026-11-24-codes-en-lettres-lot-1.md`).
//
// Une grille dont les codes ont deux ou trois caractères en lettres, tiret compris. L'application les
// comptait déjà ; ce banc juge qu'ils se LISENT :
//   1. le cercle sur la copie, dans le PDF et sous le curseur : le code entier tient dans le cercle
//      (aucun pixel blanc hors du disque, aucun sur son bord) ;
//   2. la pastille de la palette étendue : le code tient sur une ligne, dans sa pastille, sans
//      recouvrir le nom voisin ;
//   3. la grille refuse à la saisie un code accentué, et un code qui ne diffère d'un autre que par la
//      casse ; et l'écran d'une grille déjà enregistrée dit la vraie raison d'un code qui ne se pose pas
//      (plus « pondération 0 » pour un code accentué).
//
// ⛔ CONFIDENTIALITÉ : le jeu de codes est FICTIF (consigne du 24 nov.), quatorze codes nommés « Code
// fictif 1 » à « Code fictif 14 ». Aucun autre.
//
// Chaque essai a été vu ROUGE sur `main` (5a2bc31be) avant la correction ; le rapport en garde les chiffres.

const CODES = ['K-A', 'K-B', 'K-C', 'M-A', 'M-B', 'M-C', 'T-A', 'T-B', 'T-C', 'V-A', 'V-B', 'QRS', 'W-A', 'W-B'];
const SOUS_CRITERES = CODES.map((code, i) => ({
    id: 'sc_f' + (i + 1), code, nom: 'Code fictif ' + (i + 1), ponderation: 1, retroaction: ''
}));

const patternsAttendus = [
    /version\.json.*access control/i,
    /Cross origin requests are only supported/i,
    /Not allowed to load local resource.*\.(svg|png)/i,
    /Aucune échelle de performance configurée/,
    /Grille introuvable ou sans critères/,
    /The operation is insecure/
];

/** Une vraie copie ouverte en Annoter, dont la production porte la grille des quatorze codes fictifs. */
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
    }, SOUS_CRITERES);
    await page.evaluate(() => window.afficherSection('evaluations'));
    await page.waitForFunction(() => !!document.querySelector('#section-evaluations.active') && window.travauxUI.getModeCourant() === 'annoter', null, { timeout: 10000 });
    await page.evaluate(() => window.executerActionEval({ value: 'annoter|FT_FIC|P_FIC' }));
    await page.waitForFunction(() => !!document.querySelector('#evaluations-annoter.sous-section.active'), null, { timeout: 10000 });
    await page.waitForFunction(() => !!document.querySelector('.travaux-errfr-item[data-param="errfr_K-A"]'), null, { timeout: 10000 });
    await page.evaluate(() => { const o = document.getElementById('overlay-backup-reminder'); if (o) o.remove(); });
    return erreurs;
}

// La mesure d'un code dessiné dans son cercle, sur un canevas TRANSPARENT (le calque d'annotation, ou le
// canevas d'essai du PDF) : tout pixel peint au-delà du disque (r + 1, l'anticrénelage du bord) est du texte
// qui déborde — blanc sur la page blanche, donc rogné à l'œil. `bord` compte le blanc sur la couronne
// intérieure (au-delà de 0,96 r) : un texte qui touche le bord se lit coupé. `dedans` est le garde de
// non-vide (règle 10) : le code est bien écrit.
// Les formes posées au banc : un code par place, espacés, chacun dans un carré de 0,1 de la largeur (le
// rayon est indifférent : la taille du texte suit le rayon). « errfr_7 », que la grille ne connaît pas,
// garde son chiffre : c'est le TÉMOIN, un code d'un caractère qui tient, avant comme après.
// ⚠ Installées par `page.evaluate` (qui passe outre la CSP) : un `eval` DANS la page est refusé par la CSP
// (`script-src 'self'`), mesuré le 24 nov. sur l'essai du curseur.
async function installerMesures(page) {
    await page.evaluate(() => {
        window.__bancLettres = {
            mesurer(canvas, cx, cy, r) {
                const ctx = canvas.getContext('2d');
                const x0 = Math.max(0, Math.floor(cx - 2.5 * r)), y0 = Math.max(0, Math.floor(cy - 1.8 * r));
                const w = Math.min(canvas.width - x0, Math.ceil(5 * r)), h = Math.min(canvas.height - y0, Math.ceil(3.6 * r));
                const d = ctx.getImageData(x0, y0, w, h).data;
                let dehors = 0, bord = 0, dedans = 0;
                for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
                    const k = (j * w + i) * 4;
                    if (!d[k + 3]) continue;
                    const dist = Math.hypot(x0 + i + 0.5 - cx, y0 + j + 0.5 - cy);
                    const blanc = d[k] > 200 && d[k + 1] > 200 && d[k + 2] > 200 && d[k + 3] > 128;
                    if (dist > r + 1) dehors++;
                    else if (blanc && dist > r * 0.96) bord++;
                    else if (blanc) dedans++;
                }
                return { dehors, bord, dedans };
            },
            formes(W, H, types) {
                return types.map((type, i) => {
                    const cxN = 0.15 + (i % 4) * 0.22, cyN = 0.12 + Math.floor(i / 4) * 0.2;
                    const dx = 0.05, dy = 0.05 * W / H;
                    return { id: 'SH_' + i, type, color: '#c62828', lineWidth: 3, x1: cxN - dx, y1: cyN - dy, x2: cxN + dx, y2: cyN + dy };
                });
            }
        };
    });
}
const TYPES = ['errfr_K-A', 'errfr_QRS', 'errfr_W-B', 'errfr_M-C', 'errfr_7'];

test.describe('codes en lettres · lot 1 — lisibles partout', () => {
    test('1 · sur la copie, le code entier tient dans son cercle', async ({ page }) => {
        const erreurs = await ouvrirCopieFictive(page);
        await installerMesures(page);
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
                return Object.assign({ type: f.type, rayon: Math.round(rayon) }, window.__bancLettres.mesurer(canvas, cx, cy, rayon));
            });
        }, { types: TYPES });
        console.log('COPIE →', JSON.stringify(r));
        for (const m of r) {
            expect(m.rayon, 'le cercle a une taille mesurable').toBeGreaterThan(15);
            expect(m.dedans, m.type + ' : le code est écrit (garde de non-vide)').toBeGreaterThan(20);
            expect(m.dehors, m.type + ' : rien ne déborde du cercle').toBe(0);
            expect(m.bord, m.type + ' : rien ne touche le bord').toBe(0);
        }
        expect(erreurs).toEqual([]);
    });

    test('2 · dans le PDF, le code entier tient dans son cercle', async ({ page }) => {
        await ouvrirCopieFictive(page);
        await installerMesures(page);
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
                return Object.assign({ type: f.type, rayon: Math.round(rayon) }, window.__bancLettres.mesurer(canvas, cx, cy, rayon));
            });
        }, { types: TYPES });
        console.log('PDF →', JSON.stringify(r));
        for (const m of r) {
            expect(m.dedans, m.type + ' : le code est écrit (garde de non-vide)').toBeGreaterThan(20);
            expect(m.dehors, m.type + ' : rien ne déborde du cercle').toBe(0);
            expect(m.bord, m.type + ' : rien ne touche le bord').toBe(0);
        }
    });

    test('3 · sous le curseur, le code entier tient dans son cercle', async ({ page }) => {
        await ouvrirCopieFictive(page);
        await installerMesures(page);
        const r = [];
        for (const code of ['K-A', 'QRS', 'W-B']) {
            r.push(await page.evaluate(async ({ code }) => {
                document.querySelector('.travaux-errfr-item[data-param="errfr_' + code + '"]').click();
                const curseur = document.getElementById('travaux-canvas-annotation').style.cursor;
                const m = /url\("?(data:image\/png;base64,[^")]+)"?\)/.exec(curseur);
                if (!m) return { code, curseur };
                const img = new Image();
                await new Promise((ok, ko) => { img.onload = ok; img.onerror = ko; img.src = m[1]; });
                const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
                c.getContext('2d').drawImage(img, 0, 0);
                // Le curseur : un disque de rayon (taille / 2 − 1), centré.
                return Object.assign({ code, taille: img.width }, window.__bancLettres.mesurer(c, img.width / 2, img.height / 2, img.width / 2 - 1));
            }, { code }));
        }
        console.log('CURSEUR →', JSON.stringify(r));
        for (const m of r) {
            expect(m.taille, m.code + ' : un curseur dessiné').toBe(32);
            expect(m.dedans, m.code + ' : le code est écrit (garde de non-vide)').toBeGreaterThan(10);
            expect(m.dehors, m.code + ' : rien ne déborde du cercle').toBe(0);
            expect(m.bord, m.code + ' : rien ne touche le bord').toBe(0);
        }
    });

    test('4 · la pastille de la palette étendue tient le code sur une ligne, sans recouvrir le nom', async ({ page }) => {
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
        expect(r.items.map((i) => i.code)).toEqual(CODES);
        for (const i of r.items) {
            expect(i.lignes, i.code + ' : une seule ligne').toBe(1);
            expect(i.dansLaPastille, i.code + ' : le code reste dans sa pastille').toBe(true);
            expect(i.avantLeNom, i.code + ' : la pastille ne recouvre pas le nom').toBe(true);
            expect(i.hauteur, i.code + ' : la pastille garde sa hauteur').toBe(20);
        }
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
        expect(r.items).toHaveLength(14);
        for (const i of r.items) {
            expect(i.largeurTuile, i.code + ' : une tuile mesurable').toBeGreaterThan(20);
            expect(i.dansLaTuile, i.code + ' : la pastille reste dans sa tuile').toBe(true);
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

    test('6 · un code accentué : refusé à la saisie, et l\'écran d\'une grille enregistrée dit la vraie raison', async ({ page }) => {
        await page.goto(indexHtml);
        await attendreApplication(page);
        // Une grille déjà enregistrée qui porte un code accentué (le stock) : il ne se pose pas, et la note
        // le dit en le nommant — plus « pondération 0 », qui est faux : tous pèsent 1.
        const stock = SOUS_CRITERES.map((sc, i) => (i === 13 ? Object.assign({}, sc, { code: 'É-B' }) : sc));
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
