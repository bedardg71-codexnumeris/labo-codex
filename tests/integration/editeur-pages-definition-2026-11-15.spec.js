import { test, expect } from '@playwright/test';
import { ouvrirCopie, attendre } from './harness/banc-copie-annotation.js';

// =======================================================================
// 15 nov. 2026 — L'ÉDITEUR DE PAGES NE RÉDUIT PLUS LA DÉFINITION
// =======================================================================
//
// Vécu par Grégoire sur l'iPad (1.247.0) : une copie de deux pages, dont une photo de
// 2 728 × 1 748 px, floue dans Annoter même à 400 %. Il avait inversé l'ordre de ses pages
// dans l'éditeur. `decomposerPDF` redessinait chaque page à 1 000 px de large (JPEG 0,85),
// et `pivoterPageEditeur` pivotait cette image déjà réduite.
//
// L'invariant : ouvrir l'éditeur, réordonner, retirer ou pivoter, enregistrer, et chaque
// page restante a les mêmes pixels qu'avant (côtés inversés pour un pivot). Une page qu'on
// n'a pas touchée garde ses OCTETS : elle n'est pas réencodée.
//
// Le banc fabrique la copie comme l'import le fait (`reassemblerPages`, le vrai jsPDF) à
// partir de deux images fictives, et relit le PDF stocké avec pdf.js : les pixels de
// l'image posée sur chaque page, pas la taille de la page. Le stockage est une mémoire du
// banc (WebKit refuse les blobs en IndexedDB sous file://).

const GRANDE = [2728, 1748];
const PETITE = [1700, 2200];

async function monterLeBanc(page) {
    const suivi = await ouvrirCopie(page);
    await page.evaluate(async ([grande, petite]) => {
        const jpeg = (l, h, dessiner) => {
            const cv = document.createElement('canvas'); cv.width = l; cv.height = h;
            const cx = cv.getContext('2d'); cx.fillStyle = '#ffffff'; cx.fillRect(0, 0, l, h);
            dessiner(cx, l, h);
            return new Promise((r) => cv.toBlob(r, 'image/jpeg', 0.9));
        };
        // Page A : un repère rouge en haut à gauche, un bleu en bas à droite.
        const a = await jpeg(grande[0], grande[1], (cx, l, h) => {
            cx.fillStyle = '#ff0000'; cx.fillRect(0, 0, l * 0.2, h * 0.2);
            cx.fillStyle = '#0000ff'; cx.fillRect(l * 0.8, h * 0.8, l * 0.2, h * 0.2);
        });
        // Page B : un repère vert au milieu.
        const b = await jpeg(petite[0], petite[1], (cx, l, h) => { cx.fillStyle = '#00aa00'; cx.fillRect(l * 0.4, h * 0.4, l * 0.2, h * 0.2); });
        const binaire = async (blob) => { const o = new Uint8Array(await blob.arrayBuffer()); let s = ''; for (let i = 0; i < o.length; i += 0x8000) s += String.fromCharCode.apply(null, o.subarray(i, i + 0x8000)); return s; };
        window.__octets = { a: await binaire(a), b: await binaire(b) };
        window.__binaire = binaire;

        window.__blobs = new Map();
        const lire = window.travauxStockage.recupererBlob;
        window.travauxStockage.recupererBlob = async function (id) {
            return window.__blobs.has(id) ? window.__blobs.get(id) : lire.apply(this, arguments);
        };
        window.travauxStockage.stockerBlob = async (id, blob) => { window.__blobs.set(id, blob); };

        const fichiers = window.db.getSync(window.cle('fichiersTravaux'));
        const base = fichiers[0];
        for (const id of ['FT_ORDRE', 'FT_PIVOT', 'FT_RETRAIT']) {
            const pdf = await window.travauxImport.reassemblerPages([{ blob: a }, { blob: b }]);
            window.__blobs.set(id, pdf);
            fichiers.push({ ...base, id, evaluationId: '', nomFichier: 'COURAGEUX_' + id + '.pdf', typeMIME: 'application/pdf', nombrePages: 2, tailleFichier: pdf.size });
        }
        // Une copie d'avant ce lot : sa page 1 est un PNG (l'ancien pivot en écrivait), que le
        // lecteur sans perte ne reprend pas. Elle passe par le repli (rendu pdf.js).
        const { jsPDF } = window.jspdf;
        const mm = 25.4 / 250;
        const cv = document.createElement('canvas'); cv.width = 1200; cv.height = 900;
        const cx = cv.getContext('2d'); cx.fillStyle = '#ffffff'; cx.fillRect(0, 0, 1200, 900);
        cx.fillStyle = '#ff0000'; cx.fillRect(0, 0, 240, 180);
        const ancien = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [1200 * mm, 900 * mm] });
        ancien.addImage(cv.toDataURL('image/png'), 'PNG', 0, 0, 1200 * mm, 900 * mm);
        ancien.addPage([grande[0] * mm, grande[1] * mm], 'landscape');
        ancien.addImage(new Uint8Array(await a.arrayBuffer()), 'JPEG', 0, 0, grande[0] * mm, grande[1] * mm);
        const blobAncien = ancien.output('blob');
        window.__blobs.set('FT_ANCIEN', blobAncien);
        fichiers.push({ ...base, id: 'FT_ANCIEN', evaluationId: '', nomFichier: 'COURAGEUX_FT_ANCIEN.pdf', typeMIME: 'application/pdf', nombrePages: 2, tailleFichier: blobAncien.size });

        // Un PDF de texte, resté en PDF : une page Lettre, sans image.
        const texte = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'letter' });
        texte.text('Copie fictive, tapée au clavier.', 72, 100);
        window.__pdfTexte = texte.output('blob');
        window.__blobs.set('FT_TEXTE', window.__pdfTexte);
        fichiers.push({ ...base, id: 'FT_TEXTE', evaluationId: '', nomFichier: 'COURAGEUX_FT_TEXTE.pdf', typeMIME: 'application/pdf', nombrePages: 1, tailleFichier: window.__pdfTexte.size });
        window.__pdfNumerise = window.__blobs.get('FT_ORDRE');

        // Le même PDF numérisé, pris pour celui d'un autre producteur (le numériseur d'un élève) :
        // le lecteur de l'application le refuse, la définition se lit autrement.
        const o = new Uint8Array(await window.__pdfNumerise.arrayBuffer());
        const motif = Array.from('/Producer (jsPDF', (c) => c.charCodeAt(0));
        for (let i = o.length - motif.length; i >= 0; i--) {
            if (motif.every((c, k) => o[i + k] === c)) { o[i + 11] = 0x78; break; }   // « jsPDF » → « xsPDF »
        }
        window.__pdfAutre = new Blob([o], { type: 'application/pdf' });
        window.__blobs.set('FT_AUTRE', window.__pdfAutre);
        fichiers.push({ ...base, id: 'FT_AUTRE', evaluationId: '', nomFichier: 'COURAGEUX_FT_AUTRE.pdf', typeMIME: 'application/pdf', nombrePages: 2, tailleFichier: window.__pdfAutre.size });

        window.db.setSync(window.cle('fichiersTravaux'), fichiers); // security-ok: fixture de test
    }, [GRANDE, PETITE]);
    return suivi;
}

/** Le PDF stocké relu : pour chaque page, les pixels de son image, ses repères, et si les octets d'origine y sont. */
const lireLePDF = (page, id) => page.evaluate(async (id) => {
    const blob = window.__blobs.get(id);
    const texte = await window.__binaire(blob);
    const pdf = await pdfjsLib.getDocument({ data: await blob.arrayBuffer() }).promise;
    const pages = [];
    for (let n = 1; n <= pdf.numPages; n++) {
        const p = await pdf.getPage(n);
        const ops = await p.getOperatorList();
        const images = [];
        ops.fnArray.forEach((fn, i) => { if (fn === pdfjsLib.OPS.paintImageXObject) images.push([ops.argsArray[i][1], ops.argsArray[i][2]]); });
        const base = p.getViewport({ scale: 1 });
        const vp = p.getViewport({ scale: 300 / base.width });
        const c = document.createElement('canvas'); c.width = Math.round(vp.width); c.height = Math.round(vp.height);
        const ctx = c.getContext('2d');
        await p.render({ canvasContext: ctx, viewport: vp }).promise;
        const couleur = (fx, fy) => {
            const d = ctx.getImageData(Math.round(fx * c.width), Math.round(fy * c.height), 1, 1).data;
            if (d[0] > 170 && d[1] < 100 && d[2] < 100) return 'rouge';
            if (d[2] > 170 && d[0] < 100 && d[1] < 100) return 'bleu';
            if (d[1] > 120 && d[0] < 100 && d[2] < 100) return 'vert';
            if (d[0] > 200 && d[1] > 200 && d[2] > 200) return 'blanc';
            return 'autre';
        };
        pages.push({ pixels: images.length === 1 ? images[0] : images, points: [Math.round(base.width), Math.round(base.height)],
            hautGauche: couleur(0.08, 0.08), hautDroite: couleur(0.92, 0.08), basDroite: couleur(0.92, 0.92), basGauche: couleur(0.08, 0.92), milieu: couleur(0.5, 0.5) });
    }
    return { pages, octetsA: texte.includes(window.__octets.a), octetsB: texte.includes(window.__octets.b) };
}, id);

const ouvrirLEditeur = async (page, id) => {
    await page.evaluate((id) => window.travauxUI.ouvrirEditeurPages(id), id);
    await expect(page.locator('.editeur-page-item')).toHaveCount(2, { timeout: 20000 });
};
const enregistrer = async (page, id) => {
    const avant = await page.evaluate((id) => window.__blobs.get(id), id).then(() => page.evaluate((id) => window.__blobs.get(id).size, id));
    await page.evaluate(() => window.travauxUI.sauvegarderEdition());
    await expect(page.locator('.editeur-pages-conteneur')).toHaveCount(0, { timeout: 30000 });
    return avant;
};

test.describe('15 nov. 2026 — l’éditeur de pages garde la définition', () => {
    test.setTimeout(180000);

    test('inverser l’ordre des pages, enregistrer : chaque page a ses pixels, et ses octets', async ({ page }) => {
        const suivi = await monterLeBanc(page);
        const avant = await lireLePDF(page, 'FT_ORDRE');
        expect(avant.pages.map((p) => p.pixels)).toEqual([GRANDE, PETITE]);   // le banc dit vrai

        await ouvrirLEditeur(page, 'FT_ORDRE');
        await page.evaluate(() => window.travauxUI.descendrePageEditeur(0));
        await enregistrer(page, 'FT_ORDRE');

        const apres = await lireLePDF(page, 'FT_ORDRE');
        expect(apres.pages.map((p) => p.pixels)).toEqual([PETITE, GRANDE]);
        expect(apres.pages[0]).toMatchObject({ milieu: 'vert' });
        expect(apres.pages[1]).toMatchObject({ hautGauche: 'rouge', basDroite: 'bleu' });
        // Aucune page n'a été modifiée : aucune n'est réencodée.
        expect([apres.octetsA, apres.octetsB]).toEqual([true, true]);
        expect(suivi.erreurs).toEqual([]);
    });

    test('retirer une page, enregistrer : la page restante a ses pixels, et ses octets', async ({ page }) => {
        const suivi = await monterLeBanc(page);
        await ouvrirLEditeur(page, 'FT_RETRAIT');
        await page.evaluate(() => window.travauxUI.supprimerPageEditeur(1));
        await page.evaluate(() => { window.Codex.proposerAvantSuppression = async () => true; });   // le codex n'est pas le sujet
        await enregistrer(page, 'FT_RETRAIT');

        const apres = await lireLePDF(page, 'FT_RETRAIT');
        expect(apres.pages.map((p) => p.pixels)).toEqual([GRANDE]);
        expect([apres.octetsA, apres.octetsB]).toEqual([true, false]);
        expect(suivi.erreurs).toEqual([]);
    });

    test('pivoter une page, enregistrer : mêmes pixels, côtés inversés ; l’autre page garde ses octets', async ({ page }) => {
        const suivi = await monterLeBanc(page);
        await ouvrirLEditeur(page, 'FT_PIVOT');
        await page.evaluate(() => window.travauxUI.pivoterPageEditeur(0));
        await attendre(page, 1500);
        // La vignette de l'éditeur est debout, elle aussi.
        const vignette = await page.evaluate(() => { const i = document.querySelector('.editeur-page-item img.editeur-page-thumb'); return i.naturalHeight > i.naturalWidth; });
        expect(vignette).toBe(true);
        await enregistrer(page, 'FT_PIVOT');

        const apres = await lireLePDF(page, 'FT_PIVOT');
        expect(apres.pages.map((p) => p.pixels)).toEqual([[GRANDE[1], GRANDE[0]], PETITE]);
        // Un quart de tour horaire : le rouge du haut à gauche passe en haut à droite, le bleu en bas à gauche.
        expect(apres.pages[0]).toMatchObject({ hautDroite: 'rouge', basGauche: 'bleu', hautGauche: 'blanc' });
        expect(apres.pages[1]).toMatchObject({ milieu: 'vert' });
        expect([apres.octetsA, apres.octetsB]).toEqual([false, true]);
        expect(suivi.erreurs).toEqual([]);
    });

    test('une page que le lecteur sans perte ne reprend pas (PNG d’avant ce lot) garde ses pixels par le repli', async ({ page }) => {
        const suivi = await monterLeBanc(page);
        const avant = await lireLePDF(page, 'FT_ANCIEN');
        expect(avant.pages.map((p) => p.pixels)).toEqual([[1200, 900], GRANDE]);

        await ouvrirLEditeur(page, 'FT_ANCIEN');
        const sansPerte = await page.evaluate(async () => (await window.travauxImport.decomposerPDF('FT_ANCIEN')).map((p) => p.sansPerte));
        expect(sansPerte).toEqual([false, true]);
        await page.evaluate(() => window.travauxUI.descendrePageEditeur(0));
        await enregistrer(page, 'FT_ANCIEN');

        const apres = await lireLePDF(page, 'FT_ANCIEN');
        expect(apres.pages.map((p) => p.pixels)).toEqual([GRANDE, [1200, 900]]);
        expect(apres.pages[1]).toMatchObject({ hautGauche: 'rouge' });
        expect(apres.octetsA).toBe(true);
        expect(suivi.erreurs).toEqual([]);
    });

    test('l’éditeur n’affiche que des vignettes : aucune image de plus de 1 000 px dans la page', async ({ page }) => {
        await monterLeBanc(page);
        await ouvrirLEditeur(page, 'FT_ORDRE');
        const cotes = await page.evaluate(() => Array.from(document.querySelectorAll('.editeur-pages-conteneur img'))
            .filter((i) => i.src.startsWith('data:image/jpeg')).map((i) => Math.max(i.naturalWidth, i.naturalHeight)));
        expect(cotes.length).toBe(3);   // deux vignettes, un aperçu
        expect(Math.max(...cotes)).toBeLessThanOrEqual(1000);
    });

    test('les Propriétés disent les pixels de chaque page ; une page de texte dit son format', async ({ page }) => {
        const suivi = await monterLeBanc(page);
        const lignes = async (id) => {
            await page.evaluate((id) => window.ouvrirProprieteFichier(id), id);
            const liste = page.locator('#prop-fichier-definition li');
            await expect(liste.first()).toBeVisible({ timeout: 20000 });
            const textes = await liste.allTextContents();
            const meta = await page.locator('.prop-fichier-apercu-meta').textContent();
            await page.evaluate(() => document.getElementById('proprietes-fichier-overlay').remove());
            return { textes, meta };
        };
        const numerise = await lignes('FT_ORDRE');
        expect(numerise.textes).toEqual(['Page 1 : 2728 x 1748 px', 'Page 2 : 1700 x 2200 px']);
        expect(numerise.meta).toMatch(/2 pages · [\d,]+ (Ko|Mo)/);   // le poids du fichier
        expect((await lignes('FT_TEXTE')).textes).toEqual(['Page 1 : Lettre (page de texte)']);
        // Le PDF d'un autre producteur : les mêmes pixels, dans l'ordre des pages.
        expect((await lignes('FT_AUTRE')).textes).toEqual(numerise.textes);
        // Une copie restée en image : ses pixels (celle du banc fait 400 x 600).
        expect((await lignes('FT651')).textes[0]).toBe('Page 1 : 400 x 600 px');
        expect(suivi.erreurs).toEqual([]);
    });

    test('l’écran d’import dit la définition d’un PDF numérisé et d’un PDF de texte, dans les deux colonnes', async ({ page }) => {
        const suivi = await monterLeBanc(page);
        const r = await page.evaluate(async () => {
            // Un troisième PDF : deux pages numérisées de même définition.
            const a = await (await window.travauxImport.decomposerPDF('FT_ORDRE'))[0].blob;
            const pareil = await window.travauxImport.reassemblerPages([{ blob: a }, { blob: a }]);
            window.travauxImport.viderFileDAttente();
            window.travauxImport.ajouterFichiersEnAttente([
                new File([window.__pdfNumerise], 'Fictivenom_Alma_9000001_Devoir_1.pdf', { type: 'application/pdf' }),
                new File([window.__pdfTexte], 'Fictivenom_Basile_9000002_Devoir_1.pdf', { type: 'application/pdf' }),
                new File([pareil], 'Fictivenom_Clara_9000003_Devoir_1.pdf', { type: 'application/pdf' }),
                new File([window.__pdfAutre], 'Fictivenom_Denis_9000004_Devoir_1.pdf', { type: 'application/pdf' })
            ]);
            // À l'import, aucune image n'est décodée pour dire la définition : pdf.js ne lit aucune liste d'opérations.
            let listesLues = 0;
            const proto = Object.getPrototypeOf(await (await pdfjsLib.getDocument({ data: await window.__pdfTexte.arrayBuffer() }).promise).getPage(1));
            const lireListe = proto.getOperatorList;
            proto.getOperatorList = function () { listesLues++; return lireListe.apply(this, arguments); };
            const file = () => window.travauxImport.obtenirFileDAttente();
            for (let i = 0; i < 200 && !file().every((f) => f.definitionPDF); i++) await new Promise((r) => setTimeout(r, 100));
            window.travauxUI.afficherImport();
            await new Promise((r) => setTimeout(r, 800));   // le rafraîchissement différé des aperçus
            const conteneur = document.getElementById('evaluations-contenu-import');
            const lire = (sel) => Array.from(conteneur.querySelectorAll(sel)).map((e) => e.textContent.trim());
            const originaux = lire('.pipeline-meta-resolution:not([id])');
            const apercu = lire('.pipeline-meta-resolution[id^="pipeline-res-cible-"]');
            window.travauxImport.viderFileDAttente();
            proto.getOperatorList = lireListe;
            return { originaux, apercu, listesLues };
        });
        expect(r.originaux).toEqual([
            'PDF, 2 pages · la plus petite : 1700 x 2200 px',
            'PDF, 1 page · Lettre',
            'PDF, 2 pages · 2728 x 1748 px',
            'PDF, 2 pages · la plus petite : 1700 x 2200 px'
        ]);
        expect(r.listesLues).toBe(0);
        expect(r.apercu).toEqual(r.originaux.map((mots) => mots + ' (aucun traitement)'));
        expect(suivi.erreurs).toEqual([]);
    });

    test('le gabarit de « Rés. max. » suit l’orientation de l’image', async ({ page }) => {
        await monterLeBanc(page);
        const r = await page.evaluate(() => {
            const d = (w, h, dpi) => { const x = window.travauxUI.dimensionsResMax(w, h, dpi); return [x.w, x.h]; };
            return { couchee: d(2728, 1748, 200), debout: d(1748, 2728, 200), grandeCouchee: d(4000, 3000, 200), grandeDebout: d(3000, 4000, 200),
                lettreCouchee: d(2400, 1600, 200), lettreDebout: d(1600, 2400, 200) };
        });
        // À 200 ppp, 11 x 17 po fait 2 200 x 3 400 : l'image de Grégoire y tient, couchée comme debout.
        expect(r.couchee).toEqual([2728, 1748]);     // elle devenait 2 200 x 1 410
        expect(r.debout).toEqual([1748, 2728]);
        // Une image trop grande est réduite pareillement dans les deux sens.
        expect(r.grandeCouchee).toEqual([2933, 2200]);
        expect(r.grandeDebout).toEqual([2200, 2933]);
        // Sous 2 500 px : Lettre, 1 700 x 2 200.
        expect(r.lettreCouchee).toEqual([2200, 1467]);
        expect(r.lettreDebout).toEqual([1467, 2200]);
    });

    test('réunir à l’import ne réduit pas la définition d’un PDF ; l’Aperçu ne dit « aucun traitement » que si c’est vrai', async ({ page }) => {
        const suivi = await monterLeBanc(page);
        const r = await page.evaluate(async ([grande]) => {
            // Un élève fictif remet trois fichiers pour la même production : le PDF d'un numériseur
            // (autre producteur), un PDF de l'application, une photo. Un autre élève remet un PDF seul.
            const photo = await new Promise((res) => { const cv = document.createElement('canvas'); cv.width = 1500; cv.height = 1100;
                const cx = cv.getContext('2d'); cx.fillStyle = '#ffffff'; cx.fillRect(0, 0, 1500, 1100); cv.toBlob(res, 'image/jpeg', 0.9); });
            const nom = (i) => 'Fictivenom_Alma_9000001_Devoir_1__Remis_le_2026-11-02_10h00m0' + i + 's';
            window.travauxImport.viderFileDAttente();
            window.travauxImport.ajouterFichiersEnAttente([
                new File([window.__pdfAutre], nom(1) + '.pdf', { type: 'application/pdf' }),
                new File([window.__pdfNumerise], nom(2) + '.pdf', { type: 'application/pdf' }),
                new File([photo], nom(3) + '.jpg', { type: 'image/jpeg' }),
                new File([window.__pdfTexte], 'Fictivenom_Basile_9000002_Devoir_1__Remis_le_2026-11-02_10h00m05s.pdf', { type: 'application/pdf' })
            ]);
            const file = () => window.travauxImport.obtenirFileDAttente();
            for (let i = 0; i < 200 && !file().every((f) => f.definitionPDF || !f.estPDF); i++) await new Promise((res) => setTimeout(res, 100));
            window.travauxUI.afficherImport();
            await new Promise((res) => setTimeout(res, 800));
            const conteneur = document.getElementById('evaluations-contenu-import');
            const apercu = Array.from(conteneur.querySelectorAll('.pipeline-meta-resolution[id^="pipeline-res-cible-"]')).map((e) => e.textContent.trim());

            const groupe = Array.from(window.travauxImport.regrouperParDocument().values()).find((g) => g.length === 3);
            const reuni = groupe ? await window.travauxImport.assemblerPDFGroupe(groupe, 250) : null;
            window.travauxImport.viderFileDAttente();
            if (!reuni) return { apercu, pixels: null };
            window.__blobs.set('FT_REUNI', reuni);
            const texte = await window.__binaire(reuni);
            return { apercu, octetsA: texte.includes(window.__octets.a), octetsB: texte.includes(window.__octets.b) };
        }, [GRANDE]);

        // Les deux PDF réunis ne disent plus « aucun traitement » ; le PDF seul le dit encore.
        expect.soft(r.apercu[0]).toBe('PDF, 2 pages · la plus petite : 1700 x 2200 px (réuni en un seul PDF)');
        expect.soft(r.apercu[1]).toBe('PDF, 2 pages · la plus petite : 1700 x 2200 px (réuni en un seul PDF)');
        expect.soft(r.apercu[3]).toBe('PDF, 1 page · Lettre (aucun traitement)');

        // Le PDF réuni : cinq pages, dans l'ordre des fichiers, chacune à ses pixels.
        const reuni = await lireLePDF(page, 'FT_REUNI');
        expect(reuni.pages.map((p) => p.pixels)).toEqual([GRANDE, PETITE, GRANDE, PETITE, [1500, 1100]]);
        expect(reuni.pages[0]).toMatchObject({ hautGauche: 'rouge', basDroite: 'bleu' });
        // Une page de PDF garde sa taille physique (#880) : 2 728 px à 250 ppp font 786 points.
        expect(reuni.pages.slice(0, 4).map((p) => p.points)).toEqual([[786, 503], [490, 634], [786, 503], [490, 634]]);
        // Les pages du PDF de l'application y sont avec leurs octets.
        expect([r.octetsA, r.octetsB]).toEqual([true, true]);
        expect(suivi.erreurs).toEqual([]);
    });
});
