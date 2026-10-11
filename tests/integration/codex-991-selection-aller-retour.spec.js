import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// #991 (lot 5, consigne de Cowork du 11 oct. 2026) — « EXPORTER UNE SÉLECTION » FABRIQUE SON FICHIER
// COMME « METTRE À JOUR LE CODEX ».
//
// Mesuré avant le lot (WebKit 26.4, 1,25 Go de copies fictives) : la sélection passait par
// `zip.generateAsync`, copies comprises, pic de la page à 6,4 Go. Elle passe désormais par
// `FichierSortant.assemblerZip` : les copies sont rangées par référence, sans être lues en mémoire
// (pic égal au repos de la page). Mesure : `plans de travail/MESURE-2026-10-11-lot5-memoire.md`.
//
// LES RÈGLES JUGÉES ICI :
//   1. Les copies sont RANGÉES (méthode 0), les textes compressés : c'est la marque d'assemblerZip.
//   2. Le fichier s'ouvre, dans un espace neuf, exactement comme le même contenu fabriqué à
//      l'ancienne (tout compressé par JSZip) : mêmes clés, mêmes valeurs, mêmes copies octet pour
//      octet, même bilan.
//   3. Une copie listée deux fois ne fait qu'une entrée (le dernier dépôt l'emporte, comme JSZip).
//
// CE QUE CE BANC NE JUGE PAS : la mémoire (mesurée à part, au banc jetable) ; le partage (la
// destination est une poignée qui garde ce qu'on lui écrit). Les fichiers vivent dans un magasin en
// mémoire (le contexte éphémère de WebKit ne stocke pas de Blob dans IndexedDB). Noms fictifs.

const IDS = ['FT_banc_991_a', 'FT_banc_991_b', 'FT_banc_991_c'];
const DOUBLE = 'FT_banc_991_double';

async function demarrer(page) {
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    await page.evaluate(() => {
        window.__fichiers = new Map();
        db.storeBlob = async (enr) => { window.__fichiers.set(enr.id, enr); };
        db.getBlob = async (id) => window.__fichiers.get(id) || null;
    });
}

/** La sélection, par le vrai `actionExporterSelection` ; rend le fichier en base64 et ses entrées. */
async function exporterLaSelection(page) {
    return page.evaluate(async ({ IDS, DOUBLE }) => {
        // Un en-tête de PDF : l'ouverture refuse une copie dont les octets magiques ne le sont pas.
        const octets = (graine, n) => {
            const o = new Uint8Array(n);
            for (let i = 0; i < n; i++) o[i] = (graine * 31 + i * 7) & 0xFF;
            o.set(new TextEncoder().encode('%PDF-1.4\n'), 0);
            return o;
        };
        const ligne = (id, i) => ({ id, nomFichier: 'copie-' + i + '.pdf', typeMIME: 'application/pdf', etudiantDA: '9000991', productionId: 'PROD_banc_991', blobStatut: 'present' });
        db.setSync('h2032_groupeEtudiants', [{ da: '9000991', nom: 'Fictif', prenom: 'Alix', groupe: '00001' }]);
        db.setSync('a2032_groupeEtudiants', [{ da: '9000992', nom: 'Fictif', prenom: 'Camille', groupe: '00002' }]);
        db.setSync('h2032_fichiersTravaux', [ligne(IDS[0], 0), ligne(IDS[1], 1), ligne(DOUBLE, 9)]);
        db.setSync('a2032_fichiersTravaux', [ligne(IDS[2], 2), ligne(DOUBLE, 9)]);
        for (let i = 0; i < IDS.length; i++) {
            await travauxStockage.stockerBlob(IDS[i], new Blob([octets(i + 1, 5000 + i * 1000)], { type: 'application/pdf' }), '9000991', 'PROD_banc_991', { notifier: false });
        }
        await travauxStockage.stockerBlob(DOUBLE, new Blob([octets(9, 4096)], { type: 'application/pdf' }), '9000991', 'PROD_banc_991', { notifier: false });
        await db.flush();

        uiDialogues.demanderSaisie = async () => 'tous';
        uiDialogues.confirmerAction = async () => true;
        let recu = null;
        window.showSaveFilePicker = async () => ({
            kind: 'file', name: 'selection.zip',
            createWritable: async () => ({ write: async (b) => { recu = b; }, abort: async () => {}, close: async () => {} })
        });
        await Codex.actionExporterSelection();
        if (!recu) return null;
        const sources = {};
        for (const id of IDS.concat([DOUBLE])) {
            const h = new Uint8Array(await crypto.subtle.digest('SHA-256', await window.__fichiers.get(id).blob.arrayBuffer()));
            sources[id] = Array.from(h, (x) => x.toString(16).padStart(2, '0')).join('');
        }
        const entrees = await ReserveVerifier.lireRepertoireZip(recu);
        const o = new Uint8Array(await recu.arrayBuffer());
        let binaire = '';
        for (let i = 0; i < o.length; i += 0x8000) binaire += String.fromCharCode.apply(null, o.subarray(i, i + 0x8000));
        return {
            b64: btoa(binaire), sources,
            entrees: entrees.filter((e) => !e.dir).map((e) => ({ nom: e.nom, methode: e.methode })).sort((x, y) => (x.nom < y.nom ? -1 : 1))
        };
    }, { IDS, DOUBLE });
}

/** Le même contenu, fabriqué comme avant #991 : chaque entrée compressée par JSZip. */
async function refabriquerALAncienne(page, b64) {
    return page.evaluate(async (b64) => {
        const zip = await JSZip.loadAsync(Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)));
        const o = await zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE', compressionOptions: { level: 6 } });
        let binaire = '';
        for (let i = 0; i < o.length; i += 0x8000) binaire += String.fromCharCode.apply(null, o.subarray(i, i + 0x8000));
        return btoa(binaire);
    }, b64);
}

/** Ouvre le fichier dans un espace neuf, par le vrai `Codex.charger` ; rend ce qui est revenu. */
async function ouvrirDansUnEspaceNeuf(browser, b64) {
    const contexte = await browser.newContext();
    const page = await contexte.newPage();
    page.setDefaultTimeout(15000);
    await demarrer(page);
    const rendu = await page.evaluate(async ({ b64, ids }) => {
        const resultat = await Codex.charger(new File([Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))], 'selection.zip', { type: 'application/zip' }));
        const empreinte = async (id) => {
            const blob = await travauxStockage.recupererBlob(id);
            if (!blob) return null;
            const h = new Uint8Array(await crypto.subtle.digest('SHA-256', await blob.arrayBuffer()));
            return Array.from(h, (x) => x.toString(16).padStart(2, '0')).join('');
        };
        const copies = {};
        for (const id of ids) copies[id] = await empreinte(id);
        const s = resultat.stats;
        const cles = ['h2032_groupeEtudiants', 'a2032_groupeEtudiants', 'h2032_fichiersTravaux', 'a2032_fichiersTravaux'];
        return {
            stats: { nbBlobs: s.nbBlobs, nbBlobsAttendus: s.nbBlobsAttendus, incomplet: s.incomplet },
            donnees: Object.fromEntries(cles.map((c) => [c, db.getSync(c, null)])),
            copies
        };
    }, { b64, ids: IDS.concat([DOUBLE]) });
    await contexte.close();
    return rendu;
}

test.describe('#991 — « Exporter une sélection » passe par assemblerZip', () => {
    test('les copies sont rangées, et le fichier s\'ouvre exactement comme celui d\'avant', async ({ page, browser }) => {
        page.setDefaultTimeout(15000);
        await demarrer(page);
        const sortie = await exporterLaSelection(page);
        expect(sortie, 'la sélection a été écrite').not.toBeNull();

        const copiesDuFichier = sortie.entrees.filter((e) => e.nom.indexOf('travaux/') === 0);
        expect(copiesDuFichier.map((e) => e.nom), 'une entrée par copie, la copie listée deux fois comprise une seule fois')
            .toEqual(IDS.concat([DOUBLE]).map((id) => 'travaux/' + id + '.pdf').sort());
        expect(copiesDuFichier.every((e) => e.methode === 0), 'les copies sont rangées sans compression (assemblerZip)').toBe(true);
        expect(sortie.entrees.filter((e) => e.nom.indexOf('travaux/') !== 0).every((e) => e.methode === 8), 'les textes restent compressés').toBe(true);

        const ancien = await refabriquerALAncienne(page, sortie.b64);
        const duLot = await ouvrirDansUnEspaceNeuf(browser, sortie.b64);
        const dAvant = await ouvrirDansUnEspaceNeuf(browser, ancien);

        expect(duLot.stats, 'l\'ouverture est complète (la copie listée deux fois se restaure deux fois)').toEqual({ nbBlobs: 5, nbBlobsAttendus: 5, incomplet: false });
        expect(duLot.copies, 'chaque copie est revenue, octet pour octet').toEqual(sortie.sources);
        expect(new Set(Object.values(sortie.sources)).size, 'témoin : quatre copies distinctes').toBe(4);
        expect(duLot.donnees['h2032_groupeEtudiants'], 'les données de la sélection sont revenues').toEqual([{ da: '9000991', nom: 'Fictif', prenom: 'Alix', groupe: '00001' }]);
        expect(duLot, 'le fichier du lot s\'ouvre comme le même contenu fabriqué à l\'ancienne').toEqual(dAvant);
    });
});
