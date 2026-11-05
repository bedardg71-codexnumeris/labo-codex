import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// =======================================================================
// « + AJOUTER DES PAGES » GARDE UNE PHOTO DE TÉLÉPHONE DROITE (5 nov. 2026)
// =======================================================================
//
// Vécu par Grégoire (Mac, Chrome, 1.233.0) : dans « Modifier », une photo de
// téléphone ajoutée par « + Ajouter des pages » s'enregistrait couchée à 90° et
// étirée, avec ou sans réglage ; l'aperçu de l'éditeur, lui, paraissait droit.
//
// Une photo de téléphone stocke ses pixels « couchés » et dit, dans son EXIF
// (balise Orientation), comment les redresser. Le navigateur applique cette
// balise quand il décode l'image (aperçu, dimensions lues par `new Image()`) ;
// jsPDF, lui, colle les octets JPEG tels quels, et un PDF ne connaît pas l'EXIF.
//
// ⚠ LA PREUVE PORTE SUR LE PDF RELU APRÈS « ENREGISTRER », JAMAIS SUR L'APERÇU :
// c'est l'aperçu qui a trompé tout le monde. Le PDF est relu par
// `travauxStockage.recupererBlob` après l'écriture d'« Enregistrer », puis rendu par
// pdf.js ; on y juge les proportions de la page ET la place de deux repères.
// (Seul le stockage est une mémoire du banc — WebKit refuse les blobs en
// IndexedDB sous file:// ; l'éditeur, la palette et `reassemblerPages` sont les vrais.)
//
// La photo est fabriquée en mémoire : 300 × 200 pixels stockés (couchée), un
// carré ROUGE en haut à gauche et un BLEU en haut à droite des pixels stockés,
// EXIF « orientation 6 » (pivoter de 90° dans le sens horaire pour l'afficher).
// Vue droite, elle fait 200 × 300 ; le rouge est en HAUT À DROITE, le bleu en
// BAS À DROITE. Couchée et étirée (le défaut), le rouge tombe en haut à gauche.

const patternsAttendus = [
    /version\.json.*access control/i,
    /Cross origin requests are only supported/i,
    /Not allowed to load local resource.*\.(svg|png)/i,
    /Failed to load resource/i
];

function brancher(page) {
    const etat = { erreurs: [], dialogues: [] };
    const estAttendue = (m) => patternsAttendus.some((re) => re.test(m));
    page.on('pageerror', (e) => { const m = `pageerror: ${e.message}`; if (!estAttendue(m)) etat.erreurs.push(m); });
    page.on('console', (msg) => { if (msg.type() === 'error') { const m = `console.error: ${msg.text()}`; if (!estAttendue(m)) etat.erreurs.push(m); } });
    page.on('dialog', (d) => { etat.dialogues.push(d.message()); d.dismiss().catch(() => {}); });
    return etat;
}

async function demarrer(page) {
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(800);
    await page.evaluate(async () => {
        localStorage.clear();
        sessionStorage.clear();
        if (window.db && db.memoryCache) db.memoryCache.clear();
        await new Promise((res) => {
            const req = indexedDB.deleteDatabase('LaboCodexDB');
            req.onsuccess = req.onerror = req.onblocked = () => res();
            setTimeout(res, 1500);
        });
    });
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);
    await page.evaluate(() => activerModeDemo());
    await page.waitForTimeout(3000);
}

/**
 * Une copie fictive d'une page (JPEG droit, sans EXIF) dans la vraie base.
 * `sansType` : le blob stocké n'a pas de type, comme après l'ouverture d'un codex
 * (`entree.async('blob')`) ; la page porte alors un repère rouge en haut à gauche
 * et un bleu en bas à droite.
 */
async function poserCopie(page, sansType = false) {
    await page.evaluate(async (sansType) => {
        const id = 'COPIE_BANC_PHOTO';
        const da = '9000101';
        const canevas = document.createElement('canvas');
        canevas.width = 200; canevas.height = 260;
        const ctx = canevas.getContext('2d');
        ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, 200, 260);
        if (sansType) {
            ctx.fillStyle = '#ff0000'; ctx.fillRect(0, 0, 50, 50);
            ctx.fillStyle = '#0000ff'; ctx.fillRect(150, 210, 50, 50);
        }
        const avecType = await new Promise((r) => canevas.toBlob(r, 'image/jpeg', 0.9));
        const jpeg = sansType ? new Blob([await avecType.arrayBuffer()]) : avecType;
        db.setSync(cle('fichiersTravaux'), (db.getSync(cle('fichiersTravaux'), []) || []).concat([{   // security-ok: fixture fictive du banc
            id, etudiantDA: da, productionId: 'PROD_BANC', nomFichier: id + '.jpg', typeMIME: 'image/jpeg',
            tailleFichier: jpeg.size, nombrePages: 1, dateImport: new Date().toISOString(), statut: 'importe'
        }]));
        // WebKit refuse les blobs en IndexedDB sous file:// : le stockage du banc est une
        // mémoire. Le PDF relu plus bas est l'octet près celui que « Enregistrer » y a écrit.
        window.__blobs = new Map([[id, jpeg]]);
        travauxStockage.stockerBlob = async (cleBlob, blob) => { window.__blobs.set(cleBlob, blob); };
        travauxStockage.recupererBlob = async (cleBlob) => window.__blobs.get(cleBlob) || null;
        await db.flush();
        afficherSection('evaluations');
        afficherSousSection('evaluations-importer');
    }, sansType);
    await page.waitForFunction(() => !!document.getElementById('evaluations-contenu-import'));
    // Sous Chrome, la section se redessine encore un moment après son affichage et
    // emporterait l'éditeur ouvert trop tôt.
    await page.waitForTimeout(3000);
}

/** La photo couchée + EXIF orientation 6, en octets (base64) pour le sélecteur de fichiers. */
async function fabriquerPhotoOrientation6(page) {
    return page.evaluate(async () => {
        const c = document.createElement('canvas');
        c.width = 300; c.height = 200;
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, 300, 200);
        ctx.fillStyle = '#ff0000'; ctx.fillRect(0, 0, 70, 70);       // stocké : haut-gauche
        ctx.fillStyle = '#0000ff'; ctx.fillRect(230, 0, 70, 70);     // stocké : haut-droite
        const jpeg = new Uint8Array(await (await new Promise((r) => c.toBlob(r, 'image/jpeg', 0.95))).arrayBuffer());
        // APP1 « Exif » : TIFF gros-boutiste, un IFD d'une entrée, Orientation (0x0112) = 6.
        const app1 = [0xFF, 0xE1, 0x00, 0x22,
            0x45, 0x78, 0x69, 0x66, 0x00, 0x00,
            0x4D, 0x4D, 0x00, 0x2A, 0x00, 0x00, 0x00, 0x08,
            0x00, 0x01,
            0x01, 0x12, 0x00, 0x03, 0x00, 0x00, 0x00, 0x01, 0x00, 0x06, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00];
        const sortie = new Uint8Array(jpeg.length + app1.length);
        sortie.set(jpeg.subarray(0, 2), 0);              // SOI
        sortie.set(app1, 2);
        sortie.set(jpeg.subarray(2), 2 + app1.length);
        // Le navigateur doit la voir DROITE (200 × 300) : sinon le banc ne fabrique pas ce qu'il dit.
        const vue = await new Promise((res, rej) => {
            const img = new Image();
            img.onload = () => res({ l: img.naturalWidth, h: img.naturalHeight });
            img.onerror = rej;
            img.src = URL.createObjectURL(new Blob([sortie], { type: 'image/jpeg' }));
        });
        let bin = '';
        for (let i = 0; i < sortie.length; i++) bin += String.fromCharCode(sortie[i]);
        return { base64: btoa(bin), vue };
    });
}

/** Le PDF relu dans la base après « Enregistrer » : proportions et couleurs aux repères de la page n. */
async function lirePageEnregistree(page, n) {
    return lirePagePDF(page, n, null);
}

/** Proportions et repères de la page n d'un PDF : celui de la copie du banc, ou `window[globale]`. */
async function lirePagePDF(page, n, globale) {
    return page.evaluate(async ([n, globale]) => {
        const blob = globale ? window[globale] : await travauxStockage.recupererBlob('COPIE_BANC_PHOTO');
        const pdf = await pdfjsLib.getDocument({ data: await blob.arrayBuffer() }).promise;
        const p = await pdf.getPage(n);
        const base = p.getViewport({ scale: 1 });
        const viewport = p.getViewport({ scale: 400 / base.width });
        const c = document.createElement('canvas');
        c.width = Math.round(viewport.width); c.height = Math.round(viewport.height);
        await p.render({ canvasContext: c.getContext('2d'), viewport }).promise;
        const ctx = c.getContext('2d');
        const couleur = (fx, fy) => {
            const d = ctx.getImageData(Math.round(fx * c.width), Math.round(fy * c.height), 1, 1).data;
            if (d[0] > 170 && d[1] < 100 && d[2] < 100) return 'rouge';
            if (d[2] > 170 && d[0] < 100 && d[1] < 100) return 'bleu';
            if (d[0] > 200 && d[1] > 200 && d[2] > 200) return 'blanc';
            return 'autre(' + d[0] + ',' + d[1] + ',' + d[2] + ')';
        };
        return {
            ratio: Math.round((base.width / base.height) * 1000) / 1000,
            hautGauche: couleur(0.1, 0.07),
            hautDroite: couleur(0.9, 0.07),
            basDroite: couleur(0.9, 0.93),
            basGauche: couleur(0.1, 0.93)
        };
    }, [n, globale]);
}

const nombreDePages = (page) => page.evaluate(async () => {
    const blob = await travauxStockage.recupererBlob('COPIE_BANC_PHOTO');
    return (await pdfjsLib.getDocument({ data: await blob.arrayBuffer() }).promise).numPages;
});

/** « + Ajouter des pages » avec `n` exemplaires de la photo ; « Balance des blancs » sur la PREMIÈRE seulement. */
async function ajouterLesPhotos(page, photo, n, avecBalance) {
    await page.evaluate(() => travauxUI.ouvrirEditeurPages('COPIE_BANC_PHOTO'));
    await page.waitForFunction(() => document.querySelectorAll('.editeur-page-item').length === 1, null, { timeout: 15000 });
    // Le champ de fichiers que crée le bouton est retenu au lieu d'ouvrir la fenêtre du
    // système (Chrome ne la signale pas toujours à Playwright) ; les photos y sont déposées.
    await page.evaluate(() => {
        const clicOrigine = HTMLInputElement.prototype.click;
        HTMLInputElement.prototype.click = function () {
            if (this.type === 'file') { window.__champFichiers = this; return; }
            return clicOrigine.call(this);
        };
    });
    await page.locator('[data-action="travauxUI.ajouterPagesEditeur"]').first().click();
    const champ = await page.waitForFunction(() => window.__champFichiers || null);
    const octets = Buffer.from(photo.base64, 'base64');
    await champ.asElement().setInputFiles(Array.from({ length: n }, (_, k) => (
        { name: 'photo-fictive-' + (k + 1) + '.jpg', mimeType: 'image/jpeg', buffer: octets })));
    await page.locator('#prep-btn-confirmer').waitFor({ state: 'visible' });
    if (avecBalance) {
        // Le geste réel, sur la photo affichée (la première) : le bouton, puis un clic sur le blanc.
        await page.locator('#prep-btn-balance').click();
        await page.locator('#prep-canvas-overlay').click();
    }
    await page.locator('#prep-btn-confirmer').click();
    await page.waitForFunction((t) => document.querySelectorAll('.editeur-page-item').length === t, 1 + n, { timeout: 30000 });
}

async function enregistrer(page, nbPages) {
    await page.evaluate(() => travauxUI.sauvegarderEdition());
    await expect.poll(() => page.evaluate(() => (db.getSync(cle('fichiersTravaux'), []) || [])
        .find((f) => f.id === 'COPIE_BANC_PHOTO').nombrePages), { timeout: 30000 }).toBe(nbPages);
}

/** La photo vue droite : 200 × 300, rouge en haut à droite, bleu en bas à droite. */
const DROITE = { ratio: 0.667, hautGauche: 'blanc', hautDroite: 'rouge', basDroite: 'bleu', basGauche: 'blanc' };

test.describe('« + Ajouter des pages » : une photo de téléphone s\'enregistre droite', () => {
    test.setTimeout(180000);
    test.beforeEach(async ({ page }) => { page.setDefaultTimeout(15000); });

    test('sans réglage : le PDF enregistré a les proportions de la photo vue droite, et ses repères à leur place', async ({ page }) => {
        const ecoute = brancher(page);
        await demarrer(page);
        await poserCopie(page);
        const photo = await fabriquerPhotoOrientation6(page);
        expect(photo.vue).toEqual({ l: 200, h: 300 });

        await ajouterLesPhotos(page, photo, 1, false);
        await enregistrer(page, 2);

        expect(await nombreDePages(page)).toBe(2);
        expect(await lirePageEnregistree(page, 2)).toEqual(DROITE);
        expect(ecoute.dialogues).toEqual([]);
        expect(ecoute.erreurs).toEqual([]);
    });

    // Le geste vécu à 5 h 56 : deux photos ajoutées ensemble, « Balance des blancs » appliquée.
    // Le réglage ne vaut que pour la photo où on l'a fait ; l'autre part sans opération.
    test('deux photos, « Balance des blancs » sur la première : les deux pages enregistrées sont droites', async ({ page }) => {
        const ecoute = brancher(page);
        await demarrer(page);
        await poserCopie(page);
        const photo = await fabriquerPhotoOrientation6(page);

        await ajouterLesPhotos(page, photo, 2, true);
        await enregistrer(page, 3);

        expect(await nombreDePages(page)).toBe(3);
        expect(await lirePageEnregistree(page, 2)).toEqual(DROITE);   // avec le réglage
        expect(await lirePageEnregistree(page, 3)).toEqual(DROITE);   // sans réglage
        expect(ecoute.dialogues).toEqual([]);
        expect(ecoute.erreurs).toEqual([]);
    });

    // Vécu par Grégoire sur l'iPad (5 nov., 9 h 57) : une copie d'une seule photo, venue
    // par un codex, passée par « Modifier » ; sa page 1 s'enregistrait blanche. Le blob
    // sans type se lisait en `data:application/octet-stream;base64,…`, que jsPDF 2.5.1 ne
    // reconnaît pas (son motif `\w*\/\w*` refuse le tiret) : il collait le texte de la
    // data URL comme s'il s'agissait des octets, d'où une image `/Width 0 /Height 0`.
    test('une copie d\'une photo en blob sans type : sa page 1 enregistrée garde son image', async ({ page }) => {
        const ecoute = brancher(page);
        await demarrer(page);
        await poserCopie(page, true);
        const photo = await fabriquerPhotoOrientation6(page);

        await ajouterLesPhotos(page, photo, 1, false);
        await enregistrer(page, 2);

        const texte = await page.evaluate(async () => {
            const octets = new Uint8Array(await (await travauxStockage.recupererBlob('COPIE_BANC_PHOTO')).arrayBuffer());
            let s = '';
            for (let i = 0; i < octets.length; i++) s += String.fromCharCode(octets[i]);
            return s;
        });
        expect(texte).not.toContain('/Width 0');
        expect(texte).not.toContain('data:');
        expect(await lirePageEnregistree(page, 1)).toEqual(
            { ratio: 0.769, hautGauche: 'rouge', hautDroite: 'blanc', basDroite: 'bleu', basGauche: 'blanc' });
        expect(await lirePageEnregistree(page, 2)).toEqual(DROITE);
        expect(ecoute.dialogues).toEqual([]);
        expect(ecoute.erreurs).toEqual([]);
    });

    // L'autre appelant de la même source : l'import groupé d'images en un PDF. Une photo
    // sous 1400 px n'y est pas recompressée, et partait donc avec ses octets couchés.
    test('import groupé : une petite photo à EXIF part droite dans le PDF assemblé', async ({ page }) => {
        const ecoute = brancher(page);
        await demarrer(page);
        const photo = await fabriquerPhotoOrientation6(page);
        await page.evaluate(async (b64) => {
            const bin = atob(b64);
            const octets = new Uint8Array(bin.length);
            for (let i = 0; i < bin.length; i++) octets[i] = bin.charCodeAt(i);
            const fichier = new Blob([octets], { type: 'image/jpeg' });
            window.__pdfGroupe = await travauxImport.assemblerPDFGroupe([{ fichier, estPDF: false, estImage: true }], 250);
        }, photo.base64);

        expect(await lirePagePDF(page, 1, '__pdfGroupe')).toEqual(DROITE);
        expect(ecoute.erreurs).toEqual([]);
    });
});
