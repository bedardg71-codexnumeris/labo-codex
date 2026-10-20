import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// PORTE #1123 — SUR L'IPAD, UN CODE OU UN TAMPON SE POSE AU DOIGT.
//
// Rapport de Grégoire, 20 octobre 2026, 11 h 32 (1.209.0, Safari, iPad) : « Les tampons ne fonctionnent pas. »
// Capture de 11 h 41 : au Pencil, codes, tampon et trait se posent ; au doigt, rien, en silence.
//
// CE QUI SE PASSAIT. `onPointerDown` (js/travaux-annotation.js) rejetait tout toucher du doigt hors de
// l'outil Sélection : le rejet de paume de février, pensé pour le tracé. Un code ou un tampon se pose d'un
// seul toucher ; décision de Grégoire (20 oct.) : le doigt les pose, AU RELÂCHER, s'il n'a ni glissé
// ni été rejoint par un second doigt (pincement). Le tracé garde son rejet de paume, et un doigt qui suit
// le Pencil de moins d'une demi-seconde est la paume.
//
// LA COPIE DE BANC : la recette de #651 (Blob rendu par `recupererBlob` enveloppé), une image 400 × 600.
// Mesuré le 20 oct. : sur le code d'avant, « doigt » et « tampon au doigt » posaient 0 ; ici, 1.
const DA = 'TEST1123';
const PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
const patternsAttendus = [
    /version\.json.*access control/i,
    /Cross origin requests are only supported/i,
    /Not allowed to load local resource.*\.(svg|png)/i,
    // Le montage ne configure ni échelle ni grille : les palettes du mode Évaluer le signalent. Ce n'est
    // pas l'objet de cette porte, qui juge le mode et ses palettes, pas le calcul.
    /Aucune échelle de performance configurée/,
    /Grille introuvable ou sans critères/
];

async function monter(page) {
    const suivi = { dialogues: [], erreurs: [] };
    const estAttendue = (m) => patternsAttendus.some((re) => re.test(m));
    page.on('dialog', (d) => { suivi.dialogues.push(d.message()); d.dismiss().catch(() => {}); });
    page.on('pageerror', (e) => { const m = `pageerror: ${e.message}`; if (!estAttendue(m)) suivi.erreurs.push(m); });
    page.on('console', (msg) => {
        if (msg.type() === 'error') { const m = `console.error: ${msg.text()}`; if (!estAttendue(m)) suivi.erreurs.push(m); }
    });

    await page.goto(indexHtml);
    await page.waitForFunction(() => typeof window.executerActionEval === 'function'
        && window.travauxUI && window.travauxStockage && typeof window.db !== 'undefined');
    await page.evaluate(({ png, da }) => {
        const t = 'test651';
        window.db.setSync('trimestres', [{ id: t, nom: 'Trimestre test', actif: true }]);
        window.db.setSync('trimestreActif', t);
        const coursId = 'cours-651';
        window.db.setSync('cours', [{ id: coursId, codeCours: 'FRA101', titre: 'Écriture et littérature' }]); // security-ok: fixture de test
        window.db.setSync('infoCours', { id: coursId, codeCours: 'FRA101', groupe: '01', _groupeCoursId: 'GC_651' }); // security-ok: fixture de test
        window.db.setSync('groupeCoursActif', { id: 'GC_651', trimestreId: t });
        window.db.setSync(t + '_groupesCours', [{ id: 'GC_651', trimestreId: t, coursId, groupeNum: '01', pratiqueId: 'sommative', actif: true }]);
        window.db.setSync(window.cle('groupeEtudiants'), [{ da, nom: 'Gagnon', prenom: 'Léa', groupe: '01', coursId }]); // security-ok: fixture de test
        window.db.setSync(window.cle('productions'), [{ id: 'p651-1', titre: 'Analyse 1', type: 'travail', ponderation: 100 }]); // security-ok: fixture de test
        window.db.setSync(window.cle('fichiersTravaux'), [{ // security-ok: fixture de test
            id: 'FT651', etudiantDA: da, productionId: 'p651-1', coursId, groupeCoursId: 'GC_651',
            nomFichier: 'GAGNON_TEST1123_Analyse1.png', typeMIME: 'image/png', tailleFichier: 70, nombrePages: 1,
            stockage: 'indexeddb', thumbnailDataUrl: '', dateImport: '2026-02-01T12:00:00.000Z', dateModification: '2026-02-01T12:00:00.000Z',
            source: 'import-local', importePar: 'single', statut: 'present'
        }]);
        // Une évaluation enregistrée sur cette copie : c'est elle que « Consulter » charge.
        window.db.setSync(window.cle('evaluationsSauvegardees'), [{ // security-ok: fixture de test
            id: 'EVAL651', etudiantDA: da, productionId: 'p651-1', fichierId: 'FT651', statutRemise: 'importe', statutIntegrite: 'recevable',
            criteres: [], noteFinale: 80, dateEvaluation: '2026-02-02T12:00:00.000Z', verrouillee: false
        }]);
        const cv = document.createElement('canvas'); cv.width = 400; cv.height = 600;
        const cx = cv.getContext('2d'); cx.fillStyle = '#fff'; cx.fillRect(0, 0, 400, 600);
        const url = cv.toDataURL('image/png'); const b64 = url.split(',')[1];
        const octets = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
        const copie = new Blob([octets], { type: 'image/png' });
        const original = window.travauxStockage.recupererBlob;
        window.travauxStockage.recupererBlob = async function (id) { return id === 'FT651' ? copie : original.apply(this, arguments); };
    }, { png: PNG, da: DA });
    return suivi;
}

const attendre = (page, ms) => page.evaluate((d) => new Promise((r) => setTimeout(r, d)), ms);
const compte = (page) => page.evaluate(() => {
  const s = window.travauxAnnotation.getAnnotationCourante(); const p = s && s.pages ? Object.values(s.pages) : [];
  const n = (k) => p.reduce((t, x) => t + ((x[k] || []).length), 0);
  return { shapes: n('shapes'), stickers: n('stickers'), strokes: n('strokes') };
});
// Un geste : suite d'événements { t: 'down'|'move'|'up'|'cancel', type, id, primary, dx, dy } au centre du canvas
const geste = (page, evs) => page.evaluate((evs) => {
  const c = document.getElementById('travaux-canvas-annotation'); const r = c.getBoundingClientRect();
  const nom = { down: 'pointerdown', move: 'pointermove', up: 'pointerup', cancel: 'pointercancel' };
  for (const e of evs) c.dispatchEvent(new PointerEvent(nom[e.t], { bubbles: true, cancelable: true, pointerType: e.type,
    pointerId: e.id || 1, isPrimary: e.primary !== false, button: 0, buttons: e.t === 'up' ? 0 : 1,
    clientX: r.left + r.width / 2 + (e.dx || 0), clientY: r.top + r.height / 2 + (e.dy || 0) }));
}, evs);
const tap = (type, id = 1) => [{ t: 'down', type, id }, { t: 'up', type, id }];
const choisirCode = (page) => page.evaluate(() => { const el = document.querySelector('.travaux-errfr-item'); el.click(); return el.dataset.param; });
const choisirAuto = (page) => page.evaluate(() => { const el = document.querySelector('#travaux-palette-tampons .travaux-autocollant-item[data-action="travauxOutils.setAutocollantActif"]'); el.click(); return el.dataset.param; });
async function ouvrir(page) {
  const suivi = await monter(page);
  await page.evaluate(() => window.afficherSection('evaluations'));
  await page.waitForFunction(() => !!document.querySelector('#section-evaluations.active') && window.travauxUI.getModeCourant() === 'annoter', null, { timeout: 10000 });
  await attendre(page, 400);
  await page.evaluate(() => window.executerActionEval({ value: 'annoter|FT651|p651-1' }));
  await page.waitForFunction(() => !!document.querySelector('#evaluations-annoter.sous-section.active'), null, { timeout: 10000 });
  await attendre(page, 2000);
  await page.evaluate(() => { const o = document.getElementById('overlay-backup-reminder'); if (o) o.remove(); });
  return suivi;
}

const glisse = [{ t: 'down', type: 'touch' }, { t: 'move', type: 'touch', dx: 30 }, { t: 'up', type: 'touch', dx: 30 }];
const pincement = [{ t: 'down', type: 'touch', id: 1 }, { t: 'down', type: 'touch', id: 2, primary: false, dx: 50 },
    { t: 'up', type: 'touch', id: 2 }, { t: 'up', type: 'touch', id: 1 }];

test.describe('#1123 · un code ou un tampon se pose au doigt', () => {
    test('un toucher pose un code ; glisser, pincer ou un geste repris par Safari ne pose rien', async ({ page }) => {
        const suivi = await ouvrir(page);
        await choisirCode(page);
        await geste(page, tap('touch'));
        expect(await compte(page)).toEqual({ shapes: 1, stickers: 0, strokes: 0 });
        await geste(page, glisse);
        await geste(page, pincement);
        await geste(page, [{ t: 'down', type: 'touch' }, { t: 'cancel', type: 'touch' }]);
        expect(await compte(page)).toEqual({ shapes: 1, stickers: 0, strokes: 0 });
        expect(suivi.dialogues).toEqual([]);
    });

    test('un toucher pose un tampon (autocollant)', async ({ page }) => {
        await ouvrir(page);
        await choisirAuto(page);
        await geste(page, tap('touch'));
        expect(await compte(page)).toEqual({ shapes: 0, stickers: 1, strokes: 0 });
    });

    test('la paume : un doigt juste après le Pencil ne pose rien ; le Pencil pose toujours', async ({ page }) => {
        await ouvrir(page);
        await choisirCode(page);
        await geste(page, tap('pen', 9));
        await geste(page, tap('touch', 3));
        expect(await compte(page)).toEqual({ shapes: 1, stickers: 0, strokes: 0 });
    });

    test('témoin : avec le stylo, le doigt reste ignoré (rejet de paume du tracé)', async ({ page }) => {
        await ouvrir(page);
        await page.evaluate(() => window.travauxOutils.setOutilActif('stylo'));
        await geste(page, [{ t: 'down', type: 'touch' }, { t: 'move', type: 'touch', dx: 40 }, { t: 'up', type: 'touch', dx: 40 }]);
        expect(await compte(page)).toEqual({ shapes: 0, stickers: 0, strokes: 0 });
    });
});
