import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

// ⚠ PROPOSITION EN ATTENTE (25 nov. 2026) — ce banc vit ici, hors de la suite, parce qu'il est ROUGE sans le correctif,
// et que le correctif élargit le lot (toutes les annotations d'une copie en image, pas seulement les codes) : il attend
// l'accord de Grégoire. Pour l'appliquer : `git apply "plans de travail/PROPOSITION-2026-11-25-copie-exportee-annotee/correctif.diff"`,
// puis remettre ce fichier dans tests/integration/ (ses chemins y sont calculés). Mesuré : rouge sur main et sur la branche
// (0 pixel rouge sur la version annotée de l'image), vert avec le correctif (14 325) ; la version PDF est verte partout.
//
// LA COPIE EXPORTÉE PORTE SES ANNOTATIONS (retour d'essai de Grégoire, iPad, 24 nov. 2026, 19 h 10 à 19 h 30).
//
// Geste de l'essai : trois codes posés sur la copie, « Évaluation › Exporter », « Exporter des travaux », « Télécharger » ;
// dans le ZIP, la version « _annote » était identique à l'original, sans pastille.
// Ce banc rejoue l'export par la fonction de l'écran (`travauxArchivage.exporterParEtudiant`, versions annotées
// demandées) sur deux copies : une IMAGE (le chemin `aplatirAnnotationsImage`) et un PDF (`rendrePDFAvecAnnotations`).
// Chacune porte un code d'un chiffre (« 7 », que la grille ne connaît pas), deux codes en lettres et un trait. On compte,
// dans la version annotée, les pixels de la couleur des annotations (rouge #c62828) : l'original n'en a aucun.
// ⛔ Codes fictifs seulement (K-A, QRST) ; élève et production fictifs.

const SOUS_CRITERES = [['K-A', 1], ['QRST', 16]].map(([code, n]) => ({ id: 'sc_' + n, code, nom: 'Code fictif ' + n, ponderation: 1, retroaction: '' }));

async function monter(page) {
    page.on('dialog', (d) => d.dismiss().catch(() => {}));
    await page.goto(indexHtml);
    await page.waitForFunction(() => window.travauxArchivage && window.travauxStockage && window.travauxAnnotation
        && typeof window.db !== 'undefined' && typeof JSZip !== 'undefined' && window.jspdf && window.pdfjsLib);
    await page.evaluate(async (sousCriteres) => {
        const t = 'testexport';
        db.setSync('trimestres', [{ id: t, nom: 'Trimestre fictif', actif: true }]);
        db.setSync('trimestreActif', t);
        const coursId = 'cours-fictif';
        db.setSync('cours', [{ id: coursId, codeCours: 'FIC101', titre: 'Cours fictif' }]); // security-ok: fixture de test
        db.setSync('infoCours', { id: coursId, codeCours: 'FIC101', groupe: '01', _groupeCoursId: 'GC_FIC' }); // security-ok: fixture de test
        db.setSync('groupeCoursActif', { id: 'GC_FIC', trimestreId: t });
        db.setSync(t + '_groupesCours', [{ id: 'GC_FIC', trimestreId: t, coursId, groupeNum: '01', pratiqueId: 'sommative', actif: true }]);
        db.setSync(cle('groupeEtudiants'), [{ da: 'FICTIF01', nom: 'Fictif', prenom: 'Alpha', groupe: '01', coursId }]); // security-ok: fixture de test
        db.setSync(cle('grillesTemplates'), [{ id: 'G_F', nom: 'Grille fictive', // security-ok: fixture de test
            criteres: [{ id: 'CR_F', nom: 'Codes fictifs', type: 'algorithmique', ponderation: 100, codesSousCriteresSeulement: true, sousCriteres }] }]);
        db.setSync(cle('productions'), [{ id: 'P_FIC', titre: 'Production fictive', type: 'travail', ponderation: 10, grilleId: 'G_F' }]); // security-ok: fixture de test
        const base = { etudiantDA: 'FICTIF01', productionId: 'P_FIC', coursId, groupeCoursId: 'GC_FIC', tailleFichier: 100, nombrePages: 1,
            stockage: 'indexeddb', thumbnailDataUrl: '', dateImport: '2026-11-24T12:00:00.000Z', dateModification: '2026-11-24T12:00:00.000Z',
            source: 'import-local', importePar: 'single', statut: 'present' };
        db.setSync(cle('fichiersTravaux'), [ // security-ok: fixture de test
            Object.assign({ id: 'FT_IMG', nomFichier: 'copie-fictive.png', typeMIME: 'image/png' }, base),
            Object.assign({ id: 'FT_PDF', nomFichier: 'copie-fictive.pdf', typeMIME: 'application/pdf' }, base)
        ]);
        // Les deux copies : une page blanche, en image et en PDF.
        const cv = document.createElement('canvas'); cv.width = 800; cv.height = 1100;
        const cx = cv.getContext('2d'); cx.fillStyle = '#fff'; cx.fillRect(0, 0, 800, 1100);
        const image = await new Promise((ok) => cv.toBlob(ok, 'image/png'));
        const doc = new window.jspdf.jsPDF({ unit: 'pt', format: [612, 792] });
        doc.text('Copie fictive', 72, 72);
        const pdf = doc.output('blob');
        const blobs = { FT_IMG: image, FT_PDF: pdf };
        const original = travauxStockage.recupererBlob;
        travauxStockage.recupererBlob = async function (id) { return blobs[id] || original.apply(this, arguments); };
        // Les annotations, enregistrées comme Annoter les enregistre.
        const formes = ['errfr_7', 'errfr_K-A', 'errfr_QRST'].map((type, i) => ({ id: 'SH_' + i, type, color: '#c62828', lineWidth: 3,
            x1: 0.2 + i * 0.25 - 0.04, x2: 0.2 + i * 0.25 + 0.04, y1: 0.2 - 0.03, y2: 0.2 + 0.03 }));
        const trait = { tool: 'stylo', color: '#c62828', lineWidth: 6, points: [{ x: 0.1, y: 0.5 }, { x: 0.9, y: 0.5 }] };
        for (const id of ['FT_IMG', 'FT_PDF']) {
            travauxStockage.sauvegarderAnnotationFichier({ id: 'ANN_' + id, fichierId: id, pages: { 0: { strokes: [trait], textAnnotations: [], shapes: formes, stickers: [] } } });
        }
    }, SOUS_CRITERES);
}

/** Les pixels rouges (la couleur des annotations) de l'image d'un blob : PNG ou JPEG directement, PDF par pdf.js. */
const ROUGES = `async ([b64, type]) => {
    const octets = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    const c = document.createElement('canvas');
    if (type === 'pdf') {
        const pdf = await pdfjsLib.getDocument({ data: octets }).promise;
        const p = await pdf.getPage(1);
        const v = p.getViewport({ scale: 1 });
        c.width = v.width; c.height = v.height;
        await p.render({ canvasContext: c.getContext('2d'), viewport: v }).promise;
    } else {
        const img = new Image();
        await new Promise((ok, ko) => { img.onload = ok; img.onerror = ko; img.src = URL.createObjectURL(new Blob([octets])); });
        c.width = img.width; c.height = img.height;
        c.getContext('2d').drawImage(img, 0, 0);
    }
    const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
    let rouges = 0;
    for (let k = 0; k < d.length; k += 4) if (d[k] > 150 && d[k + 1] < 90 && d[k + 2] < 90) rouges++;
    return { rouges, largeur: c.width, hauteur: c.height };
}`;

test('« Exporter des travaux », versions annotées : la copie en image et la copie en PDF portent leurs codes et leur trait', async ({ page }) => {
    test.setTimeout(90000);
    await monter(page);
    const zip = await page.evaluate(async () => {
        const r = await travauxArchivage.exporterParEtudiant('FICTIF01', { inclureAnnotes: true });
        const z = await JSZip.loadAsync(r.blob);
        const sortie = {};
        for (const nom of Object.keys(z.files)) {
            if (z.files[nom].dir) continue;
            const o = await z.file(nom).async('uint8array');
            let bin = '';
            for (let i = 0; i < o.length; i += 0x8000) bin += String.fromCharCode.apply(null, o.subarray(i, i + 0x8000));
            sortie[nom] = btoa(bin);
        }
        return { echecs: r.echecs, fichiers: sortie };
    });
    const noms = Object.keys(zip.fichiers);
    console.log('ZIP →', JSON.stringify({ echecs: zip.echecs, noms }));
    const annotes = noms.filter((n) => /_annote/.test(n));
    expect(annotes.length, 'deux versions annotées : l’image et le PDF').toBe(2);
    const mesures = {};
    for (const n of noms) mesures[n] = await page.evaluate(eval(ROUGES), [zip.fichiers[n], /\.pdf$/i.test(n) ? 'pdf' : 'image']).catch((e) => ({ erreur: String(e) }));
    console.log('ROUGES →', JSON.stringify(mesures));
    for (const n of noms.filter((x) => !/_annote/.test(x))) expect(mesures[n].rouges, n + ' : l’original n’a pas d’annotation (témoin)').toBe(0);
    for (const n of annotes) expect(mesures[n].rouges, n + ' : la version annotée porte les codes et le trait').toBeGreaterThan(1500);
});
