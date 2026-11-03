import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// LE BANC DES PALETTES D'ANNOTATION (31 oct. 2026) — la recette de #651 et #1123, mise en commun :
// une vraie copie ouverte en mode Annoter, l'application entière, une image 400 × 600 servie par
// `recupererBlob` (WebKit refuse le Blob en IndexedDB au banc). Élève et production fictifs.
const DA = 'TEST1209';
const patternsAttendus = [
    /version\.json.*access control/i,
    /Cross origin requests are only supported/i,
    /Not allowed to load local resource.*\.(svg|png)/i,
    /Aucune échelle de performance configurée/,
    /Grille introuvable ou sans critères/,
    // En `file://`, l'image d'un tampon « salit » le canevas du curseur : `toDataURL` refuse. Banc seulement :
    // en ligne, les images sont de la même origine. Le curseur reste celui d'avant, rien d'autre ne casse.
    /The operation is insecure/
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
    await page.evaluate(({ da }) => {
        const t = 'test651';
        window.db.setSync('trimestres', [{ id: t, nom: 'Trimestre test', actif: true }]);
        window.db.setSync('trimestreActif', t);
        const coursId = 'cours-651';
        window.db.setSync('cours', [{ id: coursId, codeCours: 'FRA101', titre: 'Écriture et littérature' }]); // security-ok: fixture de test
        window.db.setSync('infoCours', { id: coursId, codeCours: 'FRA101', groupe: '01', _groupeCoursId: 'GC_651' }); // security-ok: fixture de test
        window.db.setSync('groupeCoursActif', { id: 'GC_651', trimestreId: t });
        window.db.setSync(t + '_groupesCours', [{ id: 'GC_651', trimestreId: t, coursId, groupeNum: '01', pratiqueId: 'sommative', actif: true }]);
        window.db.setSync(window.cle('groupeEtudiants'), [{ da, nom: 'Courageux', prenom: 'Condor', groupe: '01', coursId }]); // security-ok: fixture de test
        window.db.setSync(window.cle('productions'), [{ id: 'p651-1', titre: 'Analyse 1', type: 'travail', ponderation: 100 }]); // security-ok: fixture de test
        window.db.setSync(window.cle('fichiersTravaux'), [{ // security-ok: fixture de test
            id: 'FT651', etudiantDA: da, productionId: 'p651-1', coursId, groupeCoursId: 'GC_651',
            nomFichier: 'COURAGEUX_Analyse1.png', typeMIME: 'image/png', tailleFichier: 70, nombrePages: 1,
            stockage: 'indexeddb', thumbnailDataUrl: '', dateImport: '2026-02-01T12:00:00.000Z', dateModification: '2026-02-01T12:00:00.000Z',
            source: 'import-local', importePar: 'single', statut: 'present'
        }]);
        window.db.setSync(window.cle('evaluationsSauvegardees'), [{ // security-ok: fixture de test
            id: 'EVAL651', etudiantDA: da, productionId: 'p651-1', fichierId: 'FT651', statutRemise: 'importe', statutIntegrite: 'recevable',
            criteres: [], noteFinale: 80, dateEvaluation: '2026-02-02T12:00:00.000Z', verrouillee: false
        }]);
        const cv = document.createElement('canvas'); cv.width = 400; cv.height = 600;
        const cx = cv.getContext('2d'); cx.fillStyle = '#fff'; cx.fillRect(0, 0, 400, 600);
        const b64 = cv.toDataURL('image/png').split(',')[1];
        const octets = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
        const copie = new Blob([octets], { type: 'image/png' });
        const original = window.travauxStockage.recupererBlob;
        window.travauxStockage.recupererBlob = async function (id) { return id === 'FT651' ? copie : original.apply(this, arguments); };
    }, { da: DA });
    return suivi;
}

export const attendre = (page, ms) => page.evaluate((d) => new Promise((r) => setTimeout(r, d)), ms);

/** La copie ouverte en mode Annoter. Rend le suivi { dialogues, erreurs }. */
export async function ouvrirCopie(page) {
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

export const compteAnnotations = (page) => page.evaluate(() => {
    const s = window.travauxAnnotation.getAnnotationCourante();
    const p = s && s.pages ? Object.values(s.pages) : [];
    const n = (k) => p.reduce((t, x) => t + ((x[k] || []).length), 0);
    return { shapes: n('shapes'), stickers: n('stickers'), strokes: n('strokes') };
});

/** Un point du canevas d'annotation, en coordonnées de la fenêtre (fx, fy : fractions de sa largeur et sa hauteur).
 *  3 nov. 2026 (#1219) : la page défile de nouveau, et la copie s'ouvre plus large, donc plus haute ; un point visé
 *  sous le bord de la fenêtre ne recevait aucun geste. Quand le canevas dépasse le bas de la fenêtre, la page défile
 *  jusqu'au bout — la position où l'on travaille, où la zone occupe l'écran — avant de mesurer. La décision tient au
 *  canevas, pas au point : les deux points d'un même glissé sont mesurés dans la même position (le second ne fait
 *  plus défiler, la page étant déjà au bout). */
export const pointCanevas = (page, fx = 0.5, fy = 0.5) => page.evaluate(([fx, fy]) => {
    const canevas = document.getElementById('travaux-canvas-annotation');
    if (canevas.getBoundingClientRect().bottom > window.innerHeight) window.scrollTo(0, document.scrollingElement.scrollHeight);
    const r = canevas.getBoundingClientRect();
    return { x: r.left + r.width * fx, y: r.top + r.height * fy };
}, [fx, fy]);
