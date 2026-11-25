// =======================================================================
// LA COPIE EXPORTÉE PORTE SES ANNOTATIONS (correctif du 25 nov. 2026)
// =======================================================================
// Retour d'essai de Grégoire (iPad, 24 nov. 2026, 19 h 30) : dans le ZIP de « Exporter des travaux », la version
// « _annote » d'une copie en IMAGE était identique à l'original. Cause : `aplatirAnnotationsImage`
// (js/travaux-archivage.js) appelait le dessin, asynchrone depuis les autocollants, sans l'attendre, puis faisait le
// JPEG aussitôt : rien n'était encore dessiné. Codes, traits, tampons : tout manquait.
//
// Ce banc sème deux copies en image (une JPEG, une PNG) et une copie en PDF, chacune annotée d'un code d'un chiffre
// (« 7 »), d'un trait de stylo et d'un tampon, puis exporte par les trois moteurs qui joignent une version annotée :
// le ZIP d'un·e élève (profil), et la carte « Exporter des travaux » filtrée par élève, par production, ou sans filtre
// (l'archive du groupe). Dans chaque version annotée, il compte les pixels de chaque annotation, dans sa zone : la zone
// est blanche sur l'original.
// Puis la précaution : un dessin qui échoue, ou une image illisible, ne bloque pas l'export et n'est jamais muet ;
// la copie est nommée au bilan, son original reste dans l'archive.
//
// Le stock est semé par l'API de l'application ; `travauxStockage.recupererBlob` est enveloppé pour rendre des blobs
// tenus en mémoire (WebKit refuse un Blob en IndexedDB sous file://, comme dans exporter-des-travaux-une-carte-895).
// Break-tests (25 nov. 2026) : retirer SEULEMENT l'attente du dessin (`await` devant `dessinerAnnotationsSurCanvas`)
// fait rougir les trois premiers essais ; remettre `resolve(null)` sur une image illisible, ou laisser filer
// l'exception du dessin, fait rougir les essais de la précaution.
// ⛔ Élève, production et codes fictifs.

import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

// Les trois annotations et leur zone (fractions de la page), sur une page blanche.
const ZONES = {
    code: { x1: 0.10, y1: 0.10, x2: 0.30, y2: 0.25 },
    trait: { x1: 0.05, y1: 0.55, x2: 0.95, y2: 0.65 },
    tampon: { x1: 0.55, y1: 0.10, x2: 0.85, y2: 0.30 }
};

async function monter(page) {
    page.on('dialog', (d) => d.dismiss().catch(() => {}));
    await page.goto(indexHtml);
    await page.waitForFunction(() => window.travauxArchivage && window.travauxStockage && window.travauxExportPDF
        && window.travauxOutils && typeof window.db !== 'undefined' && typeof JSZip !== 'undefined' && window.jspdf && window.pdfjsLib);
    await page.evaluate(async () => {
        const t = 'testexport';
        db.setSync('trimestres', [{ id: t, nom: 'Trimestre fictif', actif: true }]);
        db.setSync('trimestreActif', t);
        const coursId = 'cours-fictif';
        db.setSync('cours', [{ id: coursId, codeCours: 'FIC101', titre: 'Cours fictif' }]); // security-ok: fixture de test
        db.setSync('infoCours', { id: coursId, codeCours: 'FIC101', groupe: '01', _groupeCoursId: 'GC_FIC' }); // security-ok: fixture de test
        db.setSync('groupeCoursActif', { id: 'GC_FIC', trimestreId: t });
        db.setSync(t + '_groupesCours', [{ id: 'GC_FIC', trimestreId: t, coursId, groupeNum: '01', pratiqueId: 'sommative', actif: true }]);
        db.setSync(cle('groupeEtudiants'), [{ da: 'FICTIF01', nom: 'Fictif', prenom: 'Alpha', groupe: '01', coursId }]); // security-ok: fixture de test
        db.setSync(cle('productions'), [{ id: 'P_FIC', titre: 'Production fictive', type: 'travail', ponderation: 10 }]); // security-ok: fixture de test
        const base = { etudiantDA: 'FICTIF01', productionId: 'P_FIC', coursId, groupeCoursId: 'GC_FIC', tailleFichier: 100, nombrePages: 1,
            stockage: 'indexeddb', thumbnailDataUrl: '', dateImport: '2026-11-24T12:00:00.000Z', dateModification: '2026-11-24T12:00:00.000Z',
            source: 'import-local', importePar: 'single', statut: 'present' };
        db.setSync(cle('fichiersTravaux'), [ // security-ok: fixture de test
            Object.assign({ id: 'FT_JPG', nomFichier: 'copie-fictive-a.jpg', typeMIME: 'image/jpeg' }, base),
            Object.assign({ id: 'FT_PNG', nomFichier: 'copie-fictive-b.png', typeMIME: 'image/png' }, base),
            Object.assign({ id: 'FT_PDF', nomFichier: 'copie-fictive-c.pdf', typeMIME: 'application/pdf' }, base)
        ]);
        // Les copies : une page blanche, en JPEG, en PNG et en PDF.
        const cv = document.createElement('canvas'); cv.width = 800; cv.height = 1100;
        const cx = cv.getContext('2d'); cx.fillStyle = '#fff'; cx.fillRect(0, 0, 800, 1100);
        const jpeg = await new Promise((ok) => cv.toBlob(ok, 'image/jpeg', 0.95));
        const png = await new Promise((ok) => cv.toBlob(ok, 'image/png'));
        const doc = new window.jspdf.jsPDF({ unit: 'pt', format: [612, 792] });
        const pdf = doc.output('blob');
        window.__blobsDuBanc = { FT_JPG: jpeg, FT_PNG: png, FT_PDF: pdf };
        const original = travauxStockage.recupererBlob;
        travauxStockage.recupererBlob = async function (id) {
            return Object.prototype.hasOwnProperty.call(window.__blobsDuBanc, id) ? window.__blobsDuBanc[id] : original.apply(this, arguments);
        };
        // Le tampon porte une image personnalisée (le geste « Personnaliser » d'un tampon) : sous file://, l'image SVG
        // par défaut d'un tampon « teinte » le canevas (origine opaque) et l'export échoue au banc ; servie en https,
        // l'application n'a pas ce problème. Une image en data: se dessine partout.
        const motif = document.createElement('canvas'); motif.width = 64; motif.height = 64;
        const mx = motif.getContext('2d'); mx.fillStyle = '#000'; mx.fillRect(8, 8, 48, 48);
        db.setSync('personnalisationObservations', { 'obs-rupture': { imageBase64: motif.toDataURL('image/png') } });
        travauxOutils.appliquerPersonnalisations();
        // Les annotations, enregistrées comme Annoter les enregistre : un code d'un chiffre, un trait, un tampon.
        const page0 = {
            shapes: [{ id: 'SH_7', type: 'errfr_7', color: '#c62828', lineWidth: 3, x1: 0.16, x2: 0.24, y1: 0.15, y2: 0.20 }],
            strokes: [{ tool: 'stylo', color: '#1565c0', lineWidth: 6, points: [{ x: 0.1, y: 0.6 }, { x: 0.9, y: 0.6 }] }],
            textAnnotations: [],
            stickers: [{ id: 'STK_1', autocollantId: 'obs-rupture', x: 0.62, y: 0.14, width: 0.16, height: 0.12,
                tint: travauxOutils.obtenirCouleurCategorieAutocollant('obs-rupture') }]
        };
        for (const id of ['FT_JPG', 'FT_PNG', 'FT_PDF']) {
            travauxStockage.sauvegarderAnnotationFichier({ id: 'ANN_' + id, fichierId: id, pages: { 0: page0 } });
        }
    });
}

/** Dans la page : les fichiers du ZIP, et pour chacun les pixels encrés (non blancs) de chaque zone. */
const MESURER = async ({ b64Zip, zones }) => {
    const z = await JSZip.loadAsync(Uint8Array.from(atob(b64Zip), (c) => c.charCodeAt(0)));
    const sortie = {};
    for (const nom of Object.keys(z.files)) {
        if (z.files[nom].dir || !/\.(jpe?g|png|pdf)$/i.test(nom)) continue;
        const octets = await z.file(nom).async('uint8array');
        const c = document.createElement('canvas');
        let entete = '';
        for (let i = 0; i < 4; i++) entete += octets[i].toString(16).padStart(2, '0');
        if (/\.pdf$/i.test(nom)) {
            const doc = await pdfjsLib.getDocument({ data: octets }).promise;
            const p = await doc.getPage(1);
            const v = p.getViewport({ scale: 1 });
            c.width = v.width; c.height = v.height;
            await p.render({ canvasContext: c.getContext('2d'), viewport: v }).promise;
        } else {
            const img = new Image();
            await new Promise((ok, ko) => { img.onload = ok; img.onerror = ko; img.src = URL.createObjectURL(new Blob([octets])); });
            c.width = img.width; c.height = img.height;
            c.getContext('2d').drawImage(img, 0, 0);
        }
        const ctx = c.getContext('2d');
        const encres = {};
        for (const [cle, r] of Object.entries(zones)) {
            const x = Math.round(r.x1 * c.width), y = Math.round(r.y1 * c.height);
            const d = ctx.getImageData(x, y, Math.round((r.x2 - r.x1) * c.width), Math.round((r.y2 - r.y1) * c.height)).data;
            let n = 0;
            for (let k = 0; k < d.length; k += 4) if (d[k] < 200 || d[k + 1] < 200 || d[k + 2] < 200) n++;
            encres[cle] = n;
        }
        sortie[nom] = { encres, entete };
    }
    return sortie;
};

/** Lance un des moteurs d'export dans la page ; rend le ZIP (base64), les échecs et les copies exportées. */
async function exporter(page, moteur) {
    return page.evaluate(async (moteur) => {
        const r = moteur === 'profil'
            ? await travauxArchivage.exporterParEtudiant('FICTIF01', { inclureAnnotes: true })
            : await travauxArchivage.exporterTravaux(moteur === 'eleve' ? { da: 'FICTIF01' } : moteur === 'production' ? { productionId: 'P_FIC' } : {});
        const o = new Uint8Array(await r.blob.arrayBuffer());
        let bin = '';
        for (let i = 0; i < o.length; i += 0x8000) bin += String.fromCharCode.apply(null, o.subarray(i, i + 0x8000));
        return { b64Zip: btoa(bin), echecs: r.echecs, exportes: r.exportes };
    }, moteur);
}

for (const moteur of ['profil', 'eleve', 'production', 'archive']) {
    test(`« ${moteur} » : la version annotée d’une copie en image (JPEG, PNG) porte le code, le trait et le tampon ; le PDF aussi`, async ({ page }) => {
        test.setTimeout(90000);
        await monter(page);
        const r = await exporter(page, moteur);
        const m = await page.evaluate(MESURER, { b64Zip: r.b64Zip, zones: ZONES });
        console.log(moteur + ' →', JSON.stringify({ echecs: r.echecs, mesures: m }));
        expect(r.echecs, 'aucun échec').toEqual([]);
        const noms = Object.keys(m);
        const originaux = noms.filter((n) => !/_annote/.test(n));
        const annotes = noms.filter((n) => /_annote/.test(n));
        expect(originaux.length, 'les trois originaux').toBe(3);
        expect(annotes.length, 'les trois versions annotées').toBe(3);
        for (const n of originaux) expect(m[n].encres, n + ' : l’original est blanc dans les trois zones (témoin)').toEqual({ code: 0, trait: 0, tampon: 0 });
        for (const n of annotes) {
            expect(m[n].encres.code, n + ' : le code « 7 »').toBeGreaterThan(300);
            expect(m[n].encres.trait, n + ' : le trait de stylo').toBeGreaterThan(1000);
            expect(m[n].encres.tampon, n + ' : le tampon').toBeGreaterThan(300);
        }
    });
}

test('précaution : un dessin qui échoue ne bloque pas l’export et n’est pas muet ; l’original reste dans l’archive', async ({ page }) => {
    test.setTimeout(60000);
    await monter(page);
    // Le dessin des copies en image échoue. (Le PDF passe par la fonction interne de travaux-export-pdf.js, que cette
    // enveloppe ne touche pas : il part entier, témoin.)
    await page.evaluate(() => {
        travauxExportPDF.dessinerAnnotationsSurCtx = async function () { throw new Error('dessin impossible (banc)'); };
    });
    const r = await Promise.race([
        exporter(page, 'eleve'),
        new Promise((ok) => setTimeout(() => ok('BLOQUÉ'), 20000))
    ]);
    expect(r, 'l’export rend la main').not.toBe('BLOQUÉ');
    const m = await page.evaluate(MESURER, { b64Zip: r.b64Zip, zones: ZONES });
    console.log('dessin en échec →', JSON.stringify({ echecs: r.echecs, exportes: r.exportes, noms: Object.keys(m) }));
    expect(r.echecs.length, 'les deux copies en image sont nommées au bilan').toBe(2);
    for (const e of r.echecs) expect(e).toMatch(/version annotée n’a pas pu être produite/);
    expect(Object.keys(m).filter((n) => /copie-fictive-[ab]\./.test(n) && !/_annote/.test(n)).length, 'leurs originaux sont dans l’archive').toBe(2);
    expect(r.exportes, 'seul le PDF est marqué exporté').toEqual(['FT_PDF']);
});

test('précaution : une image illisible n’est plus sautée en silence ; le bilan la nomme', async ({ page }) => {
    test.setTimeout(60000);
    await monter(page);
    await page.evaluate(() => { window.__blobsDuBanc.FT_JPG = new Blob([new Uint8Array([1, 2, 3, 4, 5])], { type: 'image/jpeg' }); });
    const alertes = [];
    page.removeAllListeners('dialog');
    page.on('dialog', (d) => { alertes.push(d.message()); d.dismiss().catch(() => {}); });
    // Le geste de la carte « Exporter des travaux », « Télécharger », filtré sur l'élève fictive.
    await page.evaluate(() => travauxArchivage.lancerExport({ da: 'FICTIF01' }));
    await expect.poll(() => alertes.length, { timeout: 20000 }).toBeGreaterThan(0);
    console.log('bilan →', JSON.stringify(alertes));
    expect(alertes[0]).toMatch(/2 exporté\(s\) sur 3, 1 en échec/);
    expect(alertes[0]).toMatch(/copie-fictive-a\.jpg — sa version annotée n’a pas pu être produite \(l’original est dans l’archive\)/);
});
