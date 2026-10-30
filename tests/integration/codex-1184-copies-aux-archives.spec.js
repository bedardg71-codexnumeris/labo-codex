import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// #1184 (29 oct. 2026) — LE CODEX DE L'IPAD EMPORTAIT LES COPIES DÉJÀ AUX ARCHIVES.
//
// Le cas de Grégoire : le codex du Mac (355 Mo) porte la marque `_copiesAuxArchives` des 394
// copies d'H2026 ; l'iPad l'ouvre, garde les fichiers d'H2026 d'un codex plus ancien, et son
// codex suivant pèse 1,46 Go. Deux causes : l'ouverture n'installait pas la marque (aucune clé
// `_…` n'était écrite), l'écriture emportait tout fichier présent sans la regarder.
//
// CE QUE CE BANC JUGE, par le vrai `Codex.generer` et le vrai `Codex.charger` :
//   1. l'écriture n'emporte ni le fichier ni la vignette d'une copie marquée, même présente ;
//      l'avertissement des copies manquantes ne paraît pas ; le manifeste compte ce que le ZIP
//      contient. Une copie non marquée part toujours (témoin : sans marque, les deux partent).
//   2. ouvrir un codex qui porte la marque l'installe, à la place de la marque locale ; une
//      marque levée (`{}`) lève celle de l'appareil ; un codex sans marque (d'avant #1028) ne
//      touche pas la marque locale.
//
// CE QU'IL NE JUGE PAS : les fichiers vivent dans un magasin en mémoire (le contexte éphémère de
// WebKit ne stocke pas de Blob dans IndexedDB) ; « lever » lui-même est jugé par Vitest
// (sentinelle-1028) ; le vrai corpus de Grégoire (geste à l'écran après la mise en ligne).

const PNG_1PX = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
const ARCHIVEE = 'FT_banc_1184_archivee';
const VIVE = 'FT_banc_1184_vive';
const CLE = '_copiesAuxArchives';
const MARQUE = { h2031: { dossier: 'archives-banc', uuid: 'uuid-banc-1184', date: '2026-10-14T23:24:00.000Z', ids: { [ARCHIVEE]: true } } };
const MARQUE_LOCALE = { a2030: { dossier: 'autre-dossier', uuid: 'uuid-local', date: '2026-09-01T00:00:00.000Z', ids: { FT_banc_1184_locale: true } } };

/** Démarre l'application et attend que le stockage soit prêt (un événement, pas un délai). */
async function demarrer(page) {
    page.setDefaultTimeout(15000);
    await page.goto(indexHtml);
    await page.waitForFunction(() => typeof window.auDbPret === 'function' && !!window.Codex && !!window.ReserveCopies);
    await page.evaluate(() => new Promise((r) => window.auDbPret(r)));
    await page.evaluate(() => {
        window.__fichiers = new Map();
        db.storeBlob = async (enr) => { window.__fichiers.set(enr.id, enr); };
        db.getBlob = async (id) => window.__fichiers.get(id) || null;
        window.SecuriteExportPreview.previewZipEtConfirmer = async () => true;
    });
}

/** Deux copies, leurs fichiers et leurs vignettes dans l'espace ; `marque` (ou rien) écrite. */
async function semer(page, marque) {
    await page.evaluate(async ({ png, ARCHIVEE, VIVE, CLE, marque }) => {
        const octets = Uint8Array.from(atob(png), (c) => c.charCodeAt(0));
        db.setSync(cle('groupeEtudiants'), [{ da: '9001184', nom: 'Fictif', prenom: 'Alix', groupe: '00001' }]);
        db.setSync(cle('fichiersTravaux'), [ARCHIVEE, VIVE].map((id, i) => ({
            id, nomFichier: 'copie-' + (i + 1) + '.png', typeMIME: 'image/png',
            etudiantDA: '9001184', productionId: 'PROD_banc_1184', blobStatut: 'present'
        })));
        for (const id of [ARCHIVEE, VIVE]) {
            await travauxStockage.stockerBlob(id, new Blob([octets], { type: 'image/png' }), '9001184', 'PROD_banc_1184', { notifier: false });
            await db.set('thumbnail_' + id, 'data:image/png;base64,' + png);
        }
        if (marque === null) await db.remove(CLE); else await db.set(CLE, marque);
        await db.flush();
    }, { png: PNG_1PX, ARCHIVEE, VIVE, CLE, marque });
}

/** « Mettre à jour le codex », par le vrai `Codex.generer` : ce que le ZIP contient. */
async function ecrire(page) {
    return page.evaluate(async ({ png }) => {
        const avertissements = [];
        const codex = await Codex.generer({
            nom: 'Codex du banc 1184',
            confirmerCopiesManquantes: async (manquantes, attendues) => { avertissements.push({ manquantes, attendues }); return true; }
        });
        const zip = await JSZip.loadAsync(await codex.blob.arrayBuffer());
        const json = await zip.file('donnees.json').async('string');
        const donnees = JSON.parse(json);
        const manifeste = JSON.parse(await zip.file('codex-manifeste.json').async('string'));
        const o = new Uint8Array(await codex.blob.arrayBuffer());
        let binaire = '';
        for (let i = 0; i < o.length; i += 0x8000) binaire += String.fromCharCode.apply(null, o.subarray(i, i + 0x8000));
        const taillePng = atob(png).length;
        return {
            b64: btoa(binaire),
            avertissements,
            entrees: Object.keys(zip.files).filter((n) => n.indexOf('travaux/') === 0 && !n.endsWith('/')).sort(),
            vignettes: Object.keys(donnees).filter((c) => c.indexOf('thumbnail_') === 0).sort(),
            vignettesAuManifeste: manifeste.contenu.cles.filter((c) => c.indexOf('thumbnail_') === 0).sort(),
            marque: donnees._copiesAuxArchives === undefined ? 'absente' : donnees._copiesAuxArchives,
            manifeste: { fichiers: manifeste.contenu.nombreFichiersTravaux, taille: manifeste.contenu.tailleTotaleOctets },
            tailleDuJson: new Blob([json]).size,
            taillePng
        };
    }, { png: PNG_1PX });
}

/** Le codex `b64`, retouché par `retoucher(donnees)` s'il le faut, rendu en base64. */
async function retoucherLeCodex(page, b64, retouche) {
    return page.evaluate(async ({ b64, retouche, CLE }) => {
        const zip = await JSZip.loadAsync(Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)));
        const donnees = JSON.parse(await zip.file('donnees.json').async('string'));
        if (retouche === 'sansMarque') delete donnees[CLE];
        zip.file('donnees.json', JSON.stringify(donnees));
        const o = await zip.generateAsync({ type: 'uint8array' });
        let binaire = '';
        for (let i = 0; i < o.length; i += 0x8000) binaire += String.fromCharCode.apply(null, o.subarray(i, i + 0x8000));
        return btoa(binaire);
    }, { b64, retouche, CLE });
}

/** Ouvre le codex dans un autre contexte dont la marque locale est `locale` ; rend la marque après. */
async function ouvrirAilleurs(browser, b64, locale) {
    const contexte = await browser.newContext();
    const page = await contexte.newPage();
    await demarrer(page);
    await page.evaluate(async ({ CLE, locale }) => { await db.set(CLE, locale); await db.flush(); }, { CLE, locale });
    const temoin = await page.evaluate(async (CLE) => db.get(CLE, null), CLE);
    expect(temoin, 'témoin : la marque locale est posée avant l\'ouverture').toEqual(locale);
    const apres = await page.evaluate(async ({ b64, CLE, ARCHIVEE }) => {
        const octets = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
        const r = await Codex.charger(new File([octets], 'codex-1184.zip', { type: 'application/zip' }));
        return {
            marque: await db.get(CLE, null),
            marqueSync: db.getSync(CLE, null),
            auxArchives: ReserveCopies.estAuxArchives(ARCHIVEE),
            absents: r.stats.blobsAbsentsDuZip.slice()
        };
    }, { b64, CLE, ARCHIVEE });
    await contexte.close();
    return apres;
}

test.describe('#1184 — le codex et les copies aux archives', () => {
    test('l\'écriture n\'emporte ni le fichier ni la vignette d\'une copie marquée, même présente', async ({ page }) => {
        await demarrer(page);

        // Témoin : sans marque, les deux copies et leurs vignettes partent.
        await semer(page, null);
        const sansMarque = await ecrire(page);
        expect(sansMarque.entrees, 'témoin : sans marque, les deux fichiers partent').toEqual(['travaux/' + ARCHIVEE + '.png', 'travaux/' + VIVE + '.png']);
        expect(sansMarque.vignettes).toEqual(['thumbnail_' + ARCHIVEE, 'thumbnail_' + VIVE]);

        // Le cas de l'iPad : la copie marquée a encore son fichier et sa vignette.
        await semer(page, MARQUE);
        const avecMarque = await ecrire(page);
        expect(avecMarque.entrees, 'le fichier de la copie marquée ne part pas ; l\'autre part').toEqual(['travaux/' + VIVE + '.png']);
        expect(avecMarque.vignettes, 'sa vignette non plus').toEqual(['thumbnail_' + VIVE]);
        expect(avecMarque.vignettesAuManifeste, 'le manifeste ne la nomme pas').toEqual(['thumbnail_' + VIVE]);
        expect(avecMarque.avertissements, 'aucune copie dite manquante').toEqual([]);
        expect(avecMarque.marque, 'la marque voyage').toEqual(MARQUE);
        expect(avecMarque.manifeste, 'le manifeste compte ce que le ZIP contient').toEqual({
            fichiers: 1, taille: avecMarque.tailleDuJson + avecMarque.taillePng
        });
        // Le fichier et la vignette restent sur l'appareil : le lot ne retire rien (stock assumé).
        const restent = await page.evaluate(async (id) => ({
            fichier: !!(await travauxStockage.recupererBlob(id)),
            vignette: (await db.get('thumbnail_' + id, null)) !== null
        }), ARCHIVEE);
        expect(restent).toEqual({ fichier: true, vignette: true });
    });

    test('ouvrir un codex qui porte la marque l\'installe, à la place de la marque locale', async ({ page, browser }) => {
        await demarrer(page);
        await semer(page, MARQUE);
        const codex = await ecrire(page);
        const apres = await ouvrirAilleurs(browser, codex.b64, MARQUE_LOCALE);
        expect(apres.marque, 'la marque du codex remplace la locale').toEqual(MARQUE);
        expect(apres.marqueSync).toEqual(MARQUE);
        expect(apres.auxArchives, 'la copie est aux archives sur l\'appareil qui ouvre').toBe(true);
        expect(apres.absents, 'elle n\'est pas « absente du ZIP »').toEqual([]);
    });

    test('ouvrir un codex dont la marque est levée (`{}`) lève celle de l\'appareil', async ({ page, browser }) => {
        await demarrer(page);
        await semer(page, {});
        const codex = await ecrire(page);
        expect(codex.marque, 'la marque levée voyage, vide').toEqual({});
        const apres = await ouvrirAilleurs(browser, codex.b64, MARQUE);
        expect(apres.marque).toEqual({});
        expect(apres.auxArchives).toBe(false);
    });

    test('ouvrir un codex sans marque (d\'avant #1028) ne touche pas la marque locale', async ({ page, browser }) => {
        await demarrer(page);
        await semer(page, MARQUE);
        const codex = await ecrire(page);
        const ancien = await retoucherLeCodex(page, codex.b64, 'sansMarque');
        const apres = await ouvrirAilleurs(browser, ancien, MARQUE_LOCALE);
        expect(apres.marque, 'la marque locale ne bouge pas').toEqual(MARQUE_LOCALE);
    });
});
