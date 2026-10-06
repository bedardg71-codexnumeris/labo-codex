import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// #1014 (consigne de Cowork du 2 oct. 2026, 17 h 56) — LE CODEX EMPORTE TOUS LES FICHIERS QUE
// L'APPLICATION DÉSIGNE.
//
// Mesuré avant le lot : le codex n'emportait que les fichiers des copies de travail. Une copie
// mise à la corbeille, ou un fichier de la Modélisation, gardait sa ligne dans les données du
// codex, mais son fichier restait dans le navigateur ; ouvert ailleurs, le codex rendait une
// corbeille et une Modélisation sans fichiers.
//
// LES RÈGLES JUGÉES ICI :
//   1. Une copie mise à la corbeille (par `deplacerEnCorbeille`, le geste du bouton) et un fichier
//      de la Modélisation partent dans le codex, et reviennent, lisibles, à son ouverture dans un
//      espace neuf. La copie sortie de la corbeille s'ouvre.
//   2. L'avertissement des copies manquantes ne compte que les copies de travail : un fichier de
//      corbeille ou de Modélisation manquant ne l'ouvre pas.
//   3. Un codex d'avant ce lot (des lignes de corbeille et de Modélisation, sans leurs fichiers)
//      s'ouvre comme avant : complet, sans bilan d'ouverture incomplète.
//   4. Le fichier d'un codex qui déclare ces familles et qui manque compte au bilan comme celui
//      d'une copie.
//
// CE QUE CE BANC NE JUGE PAS : les fichiers vivent dans un magasin en mémoire (le contexte
// éphémère de WebKit ne stocke pas de Blob dans IndexedDB) ; le fichier de Modélisation est semé
// sous la forme qu'écrit `ouvrirFichierLocal` (modelisation.js), sans passer par le sélecteur.

const PNG_1PX = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
const ACTIVE = 'FT_banc_1014_active';
const JETEE = 'FT_banc_1014_corbeille';
const MODELE = 'FM_banc_1014_modele';

async function demarrer(page) {
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
}

/** Le magasin des fichiers, en mémoire, posé avant tout dépôt. */
async function poserLeMagasin(page) {
    await page.evaluate(() => {
        window.__fichiers = new Map();
        db.storeBlob = async (enr) => { window.__fichiers.set(enr.id, enr); };
        db.getBlob = async (id) => window.__fichiers.get(id) || null;
    });
}

/**
 * Le codex du banc, par le vrai `Codex.generer`. `absents` : des ids dont le fichier n'est pas
 * dans le magasin au moment d'écrire. Rend le fichier (base64), les entrées `travaux/`, le
 * manifeste, et les appels de l'avertissement.
 */
async function fabriquerCodex(page, { absents = [] } = {}) {
    return page.evaluate(async ({ png, ACTIVE, JETEE, MODELE, absents }) => {
        const octets = Uint8Array.from(atob(png), (c) => c.charCodeAt(0));
        const fichier = () => new Blob([octets], { type: 'image/png' });
        db.setSync(cle('groupeEtudiants'), [{ da: '9001014', nom: 'Fictif', prenom: 'Alix', groupe: '00001' }]);
        db.setSync(cle('fichiersTravaux'), [ACTIVE, JETEE].map((id, i) => ({
            id, nomFichier: 'copie-' + (i + 1) + '.png', typeMIME: 'image/png',
            etudiantDA: '9001014', productionId: 'PROD_banc_1014', blobStatut: 'present'
        })));
        db.setSync(cle('fichiersModelisation'), [{
            id: MODELE, nomFichier: 'modele.png', typeMIME: 'image/png', tailleFichier: octets.length,
            source: 'modelisation', thumbnailDataUrl: '', dateImport: new Date().toISOString()
        }]);
        for (const id of [ACTIVE, JETEE, MODELE]) {
            if (!absents.includes(id)) await travauxStockage.stockerBlob(id, fichier(), '9001014', 'PROD_banc_1014', { notifier: false });
        }
        // Le geste du bouton « Mettre à la corbeille ».
        if (!travauxStockage.deplacerEnCorbeille(JETEE)) throw new Error('le banc n\'a pas pu jeter la copie');
        await db.flush();

        window.SecuriteExportPreview.previewZipEtConfirmer = async () => true;
        const avertissements = [];
        const codex = await Codex.generer({
            nom: 'Codex du banc 1014',
            confirmerCopiesManquantes: async (manquantes, attendues) => { avertissements.push({ manquantes, attendues }); return true; }
        });
        const zip = await JSZip.loadAsync(await codex.blob.arrayBuffer());
        const entrees = Object.keys(zip.files).filter((n) => n.indexOf('travaux/') === 0 && !n.endsWith('/')).sort();
        const manifeste = JSON.parse(await zip.file('codex-manifeste.json').async('string'));
        const o = new Uint8Array(await codex.blob.arrayBuffer());
        let binaire = '';
        for (let i = 0; i < o.length; i += 0x8000) binaire += String.fromCharCode.apply(null, o.subarray(i, i + 0x8000));
        return {
            b64: btoa(binaire), entrees, manifeste, avertissements,
            cles: { corbeille: cle('corbeilleFichiers'), modelisation: cle('fichiersModelisation'), copies: cle('fichiersTravaux') }
        };
    }, { png: PNG_1PX, ACTIVE, JETEE, MODELE, absents });
}

/** Ouvre le codex dans un espace neuf (autre contexte), par le vrai `Codex.charger`. */
async function ouvrirDansUnEspaceNeuf(browser, b64, nom = 'codex-1014.zip') {
    const contexte = await browser.newContext();
    const page = await contexte.newPage();
    page.setDefaultTimeout(15000);
    await demarrer(page);
    await poserLeMagasin(page);
    const avant = await page.evaluate(() => ({ copies: db.getSync(cle('fichiersTravaux'), null), fichiers: window.__fichiers.size }));
    expect(avant, 'témoin : l\'espace neuf est vide').toEqual({ copies: null, fichiers: 0 });
    const rendu = await page.evaluate(async ({ b64, nom, ACTIVE, JETEE, MODELE }) => {
        const octets = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
        const resultat = await Codex.charger(new File([octets], nom, { type: 'application/zip' }));
        const lisible = async (id) => {
            const blob = await travauxStockage.recupererBlob(id);
            if (!blob) return false;
            return window.travauxImport.validerMagicBytes(blob);
        };
        const s = resultat.stats;
        return {
            stats: { nbBlobs: s.nbBlobs, nbBlobsAttendus: s.nbBlobsAttendus, incomplet: s.incomplet, absents: s.blobsAbsentsDuZip.slice().sort() },
            lisibles: { active: await lisible(ACTIVE), corbeille: await lisible(JETEE), modele: await lisible(MODELE) },
            corbeille: db.getSync(cle('corbeilleFichiers'), []).map((f) => f.id),
            modelisation: db.getSync(cle('fichiersModelisation'), []).map((f) => f.id),
            bilan: s.incomplet ? Codex.construireBilanImport(s) : null
        };
    }, { b64, nom, ACTIVE, JETEE, MODELE });
    return { contexte, page, rendu };
}

test.describe('#1014 — le codex emporte la corbeille et la Modélisation', () => {
    test.beforeEach(async ({ page }) => {
        page.setDefaultTimeout(15000);
        await demarrer(page);
        await poserLeMagasin(page);
    });

    test('une copie à la corbeille et un fichier de Modélisation partent dans le codex et reviennent, lisibles', async ({ page, browser }) => {
        const codex = await fabriquerCodex(page);
        // Mesuré le 2 oct. 2026 : `fichiersModelisation` passe par cle() mais n'est pas au registre de
        // trimestres.js ; la clé reste nue, donc globale. Le codex l'emporte sous les deux formes.
        expect(codex.cles.modelisation, 'la Modélisation est une clé globale (nue)').toBe('fichiersModelisation');
        expect(codex.entrees, 'les trois fichiers sont dans le codex').toEqual([
            'travaux/' + MODELE + '.png', 'travaux/' + JETEE + '.png', 'travaux/' + ACTIVE + '.png'
        ].sort());
        expect(codex.avertissements, 'rien ne manque : pas d\'avertissement').toEqual([]);

        const { contexte, page: ailleurs, rendu } = await ouvrirDansUnEspaceNeuf(browser, codex.b64);
        expect(rendu.stats, 'l\'ouverture est complète').toEqual({ nbBlobs: 3, nbBlobsAttendus: 3, incomplet: false, absents: [] });
        expect(rendu.corbeille).toEqual([JETEE]);
        expect(rendu.modelisation).toEqual([MODELE]);
        expect(rendu.lisibles, 'chaque fichier est revenu et se lit').toEqual({ active: true, corbeille: true, modele: true });

        // La copie sortie de la corbeille s'ouvre.
        const restauree = await ailleurs.evaluate(async (id) => {
            travauxStockage.restaurerDeCorbeille(id);
            const f = db.getSync(cle('fichiersTravaux'), []).find((x) => x.id === id);
            const blob = await travauxStockage.recupererBlob(id);
            return { dansLesCopies: !!f, lisible: !!blob && await window.travauxImport.validerMagicBytes(blob) };
        }, JETEE);
        expect(restauree).toEqual({ dansLesCopies: true, lisible: true });
        await contexte.close();
    });

    test('« Exporter une sélection » emporte aussi la corbeille et la Modélisation', async ({ page }) => {
        await fabriquerCodex(page);
        const sortie = await page.evaluate(async () => {
            // Deux trimestres : la sélection en exige deux. Les dialogues répondent « tous »,
            // puis « Continuer » ; la destination est une poignée qui garde ce qu'on lui écrit.
            // T2 du chantier du démo (G1, 6 oct. 2026) : le démo ne compte plus parmi eux — il
            // était, sur cette page sans trimestre actif, le premier des deux.
            db.setSync('h2032_groupeEtudiants', [{ da: '9001015', nom: 'Fictif', prenom: 'Camille', groupe: '00002' }]);
            db.setSync('a2032_groupeEtudiants', [{ da: '9001016', nom: 'Fictif', prenom: 'Dominique', groupe: '00003' }]);
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
            const zip = await JSZip.loadAsync(await recu.arrayBuffer());
            const manifeste = JSON.parse(await zip.file('codex-manifeste.json').async('string'));
            return {
                selection: manifeste.exportSelectif === true,
                listes: manifeste.contenu.listesDeFichiers || null,
                clesDuDemo: Object.keys(JSON.parse(await zip.file('donnees.json').async('string'))).filter((c) => c.indexOf('demo_') === 0),
                entrees: Object.keys(zip.files).filter((n) => n.indexOf('travaux/') === 0 && !n.endsWith('/')).sort()
            };
        });
        expect(sortie, 'la sélection a été écrite').not.toBeNull();
        expect(sortie.selection).toBe(true);
        expect(sortie.listes).toEqual(['fichiersTravaux', 'corbeilleFichiers', 'fichiersModelisation']);
        expect(sortie.clesDuDemo, 'T2 : la sélection n\'emporte pas le démo').toEqual([]);
        expect(sortie.entrees).toEqual([
            'travaux/' + MODELE + '.png', 'travaux/' + JETEE + '.png', 'travaux/' + ACTIVE + '.png'
        ].sort());
    });

    test('l\'avertissement ne compte que les copies de travail', async ({ page }) => {
        const sansAutres = await fabriquerCodex(page, { absents: [JETEE, MODELE] });
        expect(sansAutres.avertissements, 'corbeille et Modélisation manquantes : pas d\'avertissement').toEqual([]);
        expect(sansAutres.entrees).toEqual(['travaux/' + ACTIVE + '.png']);
    });

    test('l\'avertissement, témoin : une copie de travail manquante l\'ouvre, comptée seule', async ({ page }) => {
        const sansCopie = await fabriquerCodex(page, { absents: [ACTIVE, MODELE] });
        expect(sansCopie.avertissements).toEqual([{ manquantes: 1, attendues: 1 }]);
    });

    test('un codex d\'avant ce lot s\'ouvre comme avant : complet, sans bilan', async ({ page, browser }) => {
        // Le codex d'avant : les lignes de corbeille et de Modélisation sans leurs fichiers, et un
        // manifeste qui ne déclare pas les listes qu'il emporte.
        const codex = await fabriquerCodex(page);
        const ancien = await page.evaluate(async ({ b64, JETEE, MODELE }) => {
            const zip = await JSZip.loadAsync(Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)));
            zip.remove('travaux/' + JETEE + '.png');
            zip.remove('travaux/' + MODELE + '.png');
            const manifeste = JSON.parse(await zip.file('codex-manifeste.json').async('string'));
            delete manifeste.contenu.listesDeFichiers;
            manifeste.contenu.nombreFichiersTravaux = 1;
            zip.file('codex-manifeste.json', JSON.stringify(manifeste, null, 2));
            const o = await zip.generateAsync({ type: 'uint8array' });
            let binaire = '';
            for (let i = 0; i < o.length; i += 0x8000) binaire += String.fromCharCode.apply(null, o.subarray(i, i + 0x8000));
            return btoa(binaire);
        }, { b64: codex.b64, JETEE, MODELE });

        const { contexte, rendu } = await ouvrirDansUnEspaceNeuf(browser, ancien, 'codex-d-avant.zip');
        expect(rendu.stats, 'comme avant : la seule copie de travail attendue est revenue').toEqual({ nbBlobs: 1, nbBlobsAttendus: 1, incomplet: false, absents: [] });
        expect(rendu.bilan).toBeNull();
        expect(rendu.corbeille, 'les lignes reviennent, comme avant').toEqual([JETEE]);
        expect(rendu.lisibles).toEqual({ active: true, corbeille: false, modele: false });
        await contexte.close();
    });

    test('un fichier de Modélisation déclaré mais absent compte au bilan comme une copie', async ({ page, browser }) => {
        const codex = await fabriquerCodex(page);
        const amputé = await page.evaluate(async ({ b64, MODELE }) => {
            const zip = await JSZip.loadAsync(Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)));
            zip.remove('travaux/' + MODELE + '.png');
            const o = await zip.generateAsync({ type: 'uint8array' });
            let binaire = '';
            for (let i = 0; i < o.length; i += 0x8000) binaire += String.fromCharCode.apply(null, o.subarray(i, i + 0x8000));
            return btoa(binaire);
        }, { b64: codex.b64, MODELE });

        const { contexte, rendu } = await ouvrirDansUnEspaceNeuf(browser, amputé);
        expect(rendu.stats).toEqual({ nbBlobs: 2, nbBlobsAttendus: 3, incomplet: true, absents: [MODELE] });
        expect(rendu.bilan && rendu.bilan.titre, 'le bilan d\'une ouverture incomplète est rendu').toBeTruthy();
        await contexte.close();
    });
});
