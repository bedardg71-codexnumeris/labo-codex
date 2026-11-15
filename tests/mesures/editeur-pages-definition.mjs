// MESURE — l'éditeur de pages sur une copie fictive de quatre pages de 4 000 x 3 000 px
// (15 nov. 2026, lot/editeur-pages-definition).
//
// Usage, depuis tests/ :
//     node mesures/editeur-pages-definition.mjs <racine d'un arbre du dépôt>
//
// Le script ouvre l'application de l'arbre donné (WebKit de Playwright), fabrique la copie
// avec le vrai jsPDF, puis chronomètre : ouvrir l'éditeur, inverser deux pages, enregistrer.
// Pendant chaque geste il relève, toutes les 100 ms, la mémoire résidente des processus
// WebContent de ce WebKit (`ps`) ; il rend le pic au-dessus du niveau d'avant le geste.
// Il relit enfin le PDF enregistré : les pixels de l'image de chaque page.
//
// Il ne lit aucune donnée réelle : élève, production et images sont fictifs. Il se lance
// sur deux arbres (avant et après la correction) ; rien n'y dépend du code corrigé.
//
// ⚠ WebKit du Mac n'est pas Safari de l'iPad : les durées et la mémoire donnent un ordre
// de grandeur et un rapport avant/après, pas le chiffre de l'iPad.

import { webkit } from '@playwright/test';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const racine = path.resolve(process.argv[2] || '..');
const PAGES = 4;
const COTES = [4000, 3000];

/** Mémoire résidente (Mo) des processus WebContent du WebKit de Playwright. */
function memoire() {
    const sortie = spawnSync('ps', ['-axo', 'rss=,command='], { encoding: 'utf8' }).stdout || '';
    return sortie.split('\n')
        .filter((l) => /WebContent/.test(l) && /playwright/i.test(l))
        .reduce((t, l) => t + parseInt(l.trim().split(/\s+/)[0], 10) / 1024, 0);
}

/** Un geste chronométré, avec le pic de mémoire au-dessus du niveau de départ. */
async function mesurer(nom, geste) {
    const depart = memoire();
    let pic = depart;
    const releve = setInterval(() => { pic = Math.max(pic, memoire()); }, 100);
    const t0 = Date.now();
    await geste();
    const duree = Date.now() - t0;
    clearInterval(releve);
    pic = Math.max(pic, memoire());
    return { geste: nom, 'durée (ms)': duree, 'départ (Mo)': Math.round(depart), 'pic au-dessus (Mo)': Math.round(pic - depart) };
}

const navigateur = await webkit.launch();
const page = await navigateur.newPage();
page.on('dialog', (d) => d.dismiss().catch(() => {}));
await page.goto('file://' + path.join(racine, 'index.html'));
await page.waitForFunction(() => window.travauxUI && window.travauxStockage && window.travauxImport && typeof window.db !== 'undefined');

const poids = await page.evaluate(async ([nombre, cotes]) => {
    // security-ok: jeu d'essai littéral d'une mesure, aucune source externe.
    const t = 'mesure';
    window.db.setSync('trimestres', [{ id: t, nom: 'Trimestre de mesure', actif: true }]);
    window.db.setSync('trimestreActif', t);
    window.db.setSync('cours', [{ id: 'cours-m', codeCours: 'FRA101', titre: 'Cours fictif' }]);
    window.db.setSync('infoCours', { id: 'cours-m', codeCours: 'FRA101', groupe: '01', _groupeCoursId: 'GC_M' });
    window.db.setSync('groupeCoursActif', { id: 'GC_M', trimestreId: t });
    window.db.setSync(t + '_groupesCours', [{ id: 'GC_M', trimestreId: t, coursId: 'cours-m', groupeNum: '01', pratiqueId: 'sommative', actif: true }]);
    window.db.setSync(window.cle('groupeEtudiants'), [{ da: 'MESURE01', nom: 'Fictivenom', prenom: 'Fictiprenom', groupe: '01', coursId: 'cours-m' }]);
    window.db.setSync(window.cle('productions'), [{ id: 'p-m', titre: 'Devoir fictif', type: 'travail', ponderation: 100 }]);

    // Quatre « photos » : du papier bruité et des lignes d'écriture, pour un poids de JPEG vraisemblable.
    const { jsPDF } = window.jspdf;
    const mm = 25.4 / 250;
    let doc = null;
    for (let n = 0; n < nombre; n++) {
        const cv = document.createElement('canvas'); cv.width = cotes[0]; cv.height = cotes[1];
        const cx = cv.getContext('2d');
        const image = cx.createImageData(cotes[0], cotes[1]);
        for (let i = 0; i < image.data.length; i += 4) {
            const g = 225 + Math.floor(Math.random() * 30);
            image.data[i] = g; image.data[i + 1] = g; image.data[i + 2] = g - 6; image.data[i + 3] = 255;
        }
        cx.putImageData(image, 0, 0);
        cx.strokeStyle = '#1a2a6c'; cx.lineWidth = 3;
        for (let y = 200; y < cotes[1] - 100; y += 90) {
            cx.beginPath(); cx.moveTo(200, y);
            for (let x = 200; x < cotes[0] - 200; x += 14) cx.lineTo(x, y + Math.sin(x / 9 + n) * 14 + Math.random() * 8);
            cx.stroke();
        }
        const octets = new Uint8Array(await (await new Promise((r) => cv.toBlob(r, 'image/jpeg', 0.9))).arrayBuffer());
        cv.width = 0;
        if (!doc) doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [cotes[0] * mm, cotes[1] * mm] });
        else doc.addPage([cotes[0] * mm, cotes[1] * mm], 'landscape');
        doc.addImage(octets, 'JPEG', 0, 0, cotes[0] * mm, cotes[1] * mm);
    }
    const pdf = doc.output('blob');
    doc = null;

    window.__blobs = new Map([['FT_MESURE', pdf]]);
    window.travauxStockage.recupererBlob = async (id) => window.__blobs.get(id) || null;
    window.travauxStockage.stockerBlob = async (id, blob) => { window.__blobs.set(id, blob); };
    window.db.setSync(window.cle('fichiersTravaux'), [{
        id: 'FT_MESURE', etudiantDA: 'MESURE01', productionId: 'p-m', coursId: 'cours-m', groupeCoursId: 'GC_M',
        nomFichier: 'FICTIVENOM_Devoir.pdf', typeMIME: 'application/pdf', tailleFichier: pdf.size, nombrePages: nombre,
        stockage: 'indexeddb', thumbnailDataUrl: '', dateImport: '2026-02-01T12:00:00.000Z', dateModification: '2026-02-01T12:00:00.000Z',
        source: 'import-local', importePar: 'single', statut: 'present'
    }]);
    if (!document.getElementById('evaluations-contenu-import')) {
        const c = document.createElement('div'); c.id = 'evaluations-contenu-import'; document.body.appendChild(c);
    }
    return pdf.size;
}, [PAGES, COTES]);

await new Promise((r) => setTimeout(r, 3000));   // la fabrication de la copie retombe avant la mesure

const releves = [];
// La lecture de la définition (écran d'import, Propriétés) : absente de l'arbre d'avant.
if (await page.evaluate(() => typeof window.travauxImport.definitionDuPDF === 'function')) {
    releves.push(await mesurer('lire la définition (PDF de l’application)', () => page.evaluate(() => window.travauxImport.definitionDuPDF(window.__blobs.get('FT_MESURE')))));
    // Le même PDF, pris pour celui d'un autre producteur : la lecture de l'écran d'import, puis celle de pdf.js.
    await page.evaluate(async () => {
        const o = new Uint8Array(await window.__blobs.get('FT_MESURE').arrayBuffer());
        const motif = Array.from('/Producer (jsPDF', (c) => c.charCodeAt(0));
        for (let i = o.length - motif.length; i >= 0; i--) {
            if (motif.every((c, k) => o[i + k] === c)) { o[i + 11] = 0x78; break; }   // « jsPDF » → « xsPDF »
        }
        window.__autre = new Blob([o], { type: 'application/pdf' });
    });
    releves.push(await mesurer('lire la définition (autre PDF, écran d’import)', () => page.evaluate(() => window.travauxImport.definitionDuPDF(window.__autre, { sansOrdre: true }))));
    releves.push(await mesurer('lire la définition (autre PDF, par pdf.js)', () => page.evaluate(() => window.travauxImport.definitionDuPDF(window.__autre))));
}
releves.push(await mesurer('ouvrir l’éditeur', async () => {
    await page.evaluate(() => window.travauxUI.ouvrirEditeurPages('FT_MESURE'));
    await page.waitForFunction((n) => document.querySelectorAll('.editeur-page-item').length === n, PAGES, { timeout: 120000 });
}));
const ecran = await page.evaluate(() => Array.from(document.querySelectorAll('.editeur-pages-conteneur img'))
    .filter((i) => i.src.startsWith('data:')).reduce((t, i) => t + i.src.length, 0));
await page.evaluate(() => window.travauxUI.descendrePageEditeur(0));
releves.push(await mesurer('enregistrer', async () => {
    await page.evaluate(() => window.travauxUI.sauvegarderEdition());
    await page.waitForFunction(() => !document.querySelector('.editeur-pages-conteneur'), null, { timeout: 120000 });
}));

const apres = await page.evaluate(async () => {
    const blob = window.__blobs.get('FT_MESURE');
    const pdf = await pdfjsLib.getDocument({ data: await blob.arrayBuffer() }).promise;
    const pixels = [];
    for (let n = 1; n <= pdf.numPages; n++) {
        const ops = await (await pdf.getPage(n)).getOperatorList();
        ops.fnArray.forEach((fn, i) => { if (fn === pdfjsLib.OPS.paintImageXObject) pixels.push(ops.argsArray[i][1] + ' x ' + ops.argsArray[i][2]); });
    }
    return { pixels, poids: blob.size };
});

await navigateur.close();

const mo = (o) => (o / 1048576).toFixed(1) + ' Mo';
console.log('Arbre mesuré : ' + racine);
console.log('Copie fictive : ' + PAGES + ' pages de ' + COTES.join(' x ') + ' px, PDF de ' + mo(poids));
console.table(releves);
console.log('Images gardées à l’écran par l’éditeur (data URL) : ' + mo(ecran));
console.log('PDF enregistré : ' + mo(apres.poids) + ' ; pixels des pages : ' + apres.pixels.join(' | '));
