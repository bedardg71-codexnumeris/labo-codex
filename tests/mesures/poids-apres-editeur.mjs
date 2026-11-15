// MESURE — le poids d'une copie fictive avant et après l'éditeur de pages
// (15 nov. 2026, lot/editeur-pages-definition, retouche 4 : 9,8 Mo à l'import, 8,3 Mo aux Propriétés).
//
// Usage, depuis tests/ :   node mesures/poids-apres-editeur.mjs [racine d'un arbre]
//
// Quatre cas, sur une copie de quatre pages bruitées (aucune donnée réelle) :
//   PDF de l'application, pages réordonnées ; le même, une page pivotée ;
//   PDF d'un autre producteur, pages réordonnées ; le même, une page pivotée.
// Le script rend le poids avant et après l'enregistrement de l'éditeur.

import { webkit } from '@playwright/test';
import path from 'node:path';

const racine = path.resolve(process.argv[2] || '..');
const navigateur = await webkit.launch();
const page = await navigateur.newPage();
page.on('dialog', (d) => d.dismiss().catch(() => {}));
await page.goto('file://' + path.join(racine, 'index.html'));
await page.waitForFunction(() => window.travauxUI && window.travauxStockage && window.travauxImport && typeof window.db !== 'undefined');

await page.evaluate(async () => {
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

    const { jsPDF } = window.jspdf;
    const mm = 25.4 / 250;
    const cotes = [[1800, 2300], [2200, 1900], [1600, 3000], [1800, 2400]];
    let doc = null;
    for (const [l, h] of cotes) {
        const cv = document.createElement('canvas'); cv.width = l; cv.height = h;
        const cx = cv.getContext('2d');
        const image = cx.createImageData(l, h);
        for (let i = 0; i < image.data.length; i += 4) {
            const g = 225 + Math.floor(Math.random() * 30);
            image.data[i] = g; image.data[i + 1] = g; image.data[i + 2] = g - 6; image.data[i + 3] = 255;
        }
        cx.putImageData(image, 0, 0);
        const octets = new Uint8Array(await (await new Promise((r) => cv.toBlob(r, 'image/jpeg', 0.97))).arrayBuffer());
        cv.width = 0;
        const o = l > h ? 'landscape' : 'portrait';
        if (!doc) doc = new jsPDF({ orientation: o, unit: 'mm', format: [l * mm, h * mm] });
        else doc.addPage([l * mm, h * mm], o);
        doc.addImage(octets, 'JPEG', 0, 0, l * mm, h * mm);
    }
    const pdf = doc.output('blob');
    const o = new Uint8Array(await pdf.arrayBuffer());
    const motif = Array.from('/Producer (jsPDF', (c) => c.charCodeAt(0));
    for (let i = o.length - motif.length; i >= 0; i--) {
        if (motif.every((c, k) => o[i + k] === c)) { o[i + 11] = 0x78; break; }   // « jsPDF » → « xsPDF »
    }
    const autre = new Blob([o], { type: 'application/pdf' });

    window.__blobs = new Map();
    window.travauxStockage.recupererBlob = async (id) => window.__blobs.get(id) || null;
    window.travauxStockage.stockerBlob = async (id, blob) => { window.__blobs.set(id, blob); };
    const fiche = (id, blob) => ({
        id, etudiantDA: 'MESURE01', productionId: 'p-m', coursId: 'cours-m', groupeCoursId: 'GC_M',
        nomFichier: 'FICTIVENOM_' + id + '.pdf', typeMIME: 'application/pdf', tailleFichier: blob.size, nombrePages: 4,
        stockage: 'indexeddb', thumbnailDataUrl: '', dateImport: '2026-02-01T12:00:00.000Z', dateModification: '2026-02-01T12:00:00.000Z',
        source: 'import-local', importePar: 'single', statut: 'present'
    });
    const cas = { APP_ORDRE: pdf, APP_PIVOT: pdf, AUTRE_ORDRE: autre, AUTRE_PIVOT: autre };
    for (const [id, blob] of Object.entries(cas)) window.__blobs.set(id, blob);
    window.db.setSync(window.cle('fichiersTravaux'), Object.entries(cas).map(([id, blob]) => fiche(id, blob)));
    if (!document.getElementById('evaluations-contenu-import')) {
        const c = document.createElement('div'); c.id = 'evaluations-contenu-import'; document.body.appendChild(c);
    }
});

// L'import d'un PDF seul : le fichier déposé et le fichier enregistré, octet pour octet.
const importe = await page.evaluate(async () => {
    const source = window.__blobs.get('AUTRE_ORDRE');
    window.db.setSync(window.cle('fichiersTravaux'), window.db.getSync(window.cle('fichiersTravaux')).filter((f) => f.id !== 'APP_ORDRE'));
    const fiches = window.db.getSync(window.cle('fichiersTravaux'));
    window.db.setSync(window.cle('fichiersTravaux'), []);   // aucun doublon : l'import écrit
    window.travauxImport.viderFileDAttente();
    window.travauxImport.ajouterFichiersEnAttente([new File([source], 'Fictivenom_Devoir.pdf', { type: 'application/pdf' })]);
    const file = () => window.travauxImport.obtenirFileDAttente();
    for (let i = 0; i < 200 && !file().every((f) => f.definitionPDF); i++) await new Promise((r) => setTimeout(r, 100));
    const f = file()[0];
    const annonce = f.tailleFichier;
    f.etudiantDA = 'MESURE01'; f.productionId = 'p-m'; f.pipelineStatut = 'identifie';
    const resultat = await window.travauxImport.importerTous(null, () => {});
    const ecrites = window.db.getSync(window.cle('fichiersTravaux'));
    const blob = ecrites[0] ? window.__blobs.get(ecrites[0].id) : null;
    const memes = async (x, y) => { const a = new Uint8Array(await x.arrayBuffer()), b = new Uint8Array(await y.arrayBuffer()); return a.length === b.length && a.every((v, i) => v === b[i]); };
    const r = { importes: resultat.importes, 'déposé': source.size, 'annoncé à l’écran': annonce, 'fiche': ecrites[0] && ecrites[0].tailleFichier, 'mêmes octets': blob ? await memes(source, blob) : null };
    window.db.setSync(window.cle('fichiersTravaux'), fiches.concat([{ ...fiches[0], id: 'APP_ORDRE', tailleFichier: window.__blobs.get('APP_ORDRE').size }]));
    return r;
});
console.log('Import d’un PDF seul :', JSON.stringify(importe));

const releves = [];
for (const id of ['APP_ORDRE', 'APP_PIVOT', 'AUTRE_ORDRE', 'AUTRE_PIVOT']) {
    const avant = await page.evaluate((i) => window.__blobs.get(i).size, id);
    await page.evaluate((i) => window.travauxUI.ouvrirEditeurPages(i), id);
    await page.waitForFunction(() => document.querySelectorAll('.editeur-page-item').length === 4, null, { timeout: 120000 });
    if (/ORDRE/.test(id)) await page.evaluate(() => window.travauxUI.descendrePageEditeur(0));
    else await page.evaluate(() => window.travauxUI.pivoterPageEditeur(1));
    await page.waitForTimeout(500);
    await page.evaluate(() => window.travauxUI.sauvegarderEdition());
    await page.waitForFunction(() => !document.querySelector('.editeur-pages-conteneur'), null, { timeout: 120000 });
    const apres = await page.evaluate((i) => ({
        blob: window.__blobs.get(i).size,
        fiche: window.db.getSync(window.cle('fichiersTravaux')).find((f) => f.id === i).tailleFichier
    }), id);
    releves.push({ cas: id, 'avant (octets)': avant, 'après (octets)': apres.blob, 'fiche après': apres.fiche, 'écart (%)': Math.round((apres.blob - avant) / avant * 1000) / 10 });
}
await navigateur.close();
console.log('Arbre mesuré : ' + racine);
console.table(releves);
