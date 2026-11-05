import { test, expect } from '@playwright/test';
import { ouvrirCopie, attendre } from './harness/banc-copie-annotation.js';

// =======================================================================
// #1233 (5 nov. 2026) — RÉPARER UNE COPIE DONT UNE PAGE A PERDU SON IMAGE
// =======================================================================
//
// Vécu par Grégoire sur l'iPad (entrée 32 de la file, #1232) : une page blanche. Avant
// #1232, jsPDF recevait la photo en `data:application/octet-stream;base64,…` et collait
// le TEXTE de la data URL dans le flux de l'image (`/Width 0 /Height 0`). La photo est
// intacte dans ce texte. Décision de Grégoire (12 h 34) : un geste de l'usager, codex
// proposé juste avant, sans perte.
//
// Le banc fabrique ce PDF avec le vrai jsPDF : page 1 perdue (un repère rouge en haut
// à gauche, un bleu en bas à droite), page 2 saine, à une autre taille. Il juge :
//  - une copie saine n'affiche aucun message ;
//  - la copie abîmée l'affiche ; le geste propose le codex, puis répare ;
//  - le PDF relu : mêmes pages, mêmes tailles, la page 1 a son image et ses repères,
//    les octets JPEG de la page 2 sont repris tels quels.
// Le stockage est une mémoire du banc (WebKit refuse les blobs en IndexedDB sous file://).

const cliquerDansFenetre = (page, texte) => page.locator('#overlay-ui-dialogue .modal-actions button', { hasText: texte }).click();

async function monterLeBanc(page) {
    const suivi = await ouvrirCopie(page);
    await page.evaluate(async () => {
        const jpeg = async (l, h, dessiner) => {
            const cv = document.createElement('canvas'); cv.width = l; cv.height = h;
            const cx = cv.getContext('2d'); cx.fillStyle = '#ffffff'; cx.fillRect(0, 0, l, h);
            dessiner(cx);
            return new Uint8Array(await (await new Promise((r) => cv.toBlob(r, 'image/jpeg', 0.9))).arrayBuffer());
        };
        const base64 = (o) => { let s = ''; for (let i = 0; i < o.length; i++) s += String.fromCharCode(o[i]); return btoa(s); };
        const photo = await jpeg(400, 300, (cx) => {
            cx.fillStyle = '#ff0000'; cx.fillRect(0, 0, 80, 80);
            cx.fillStyle = '#0000ff'; cx.fillRect(320, 220, 80, 80);
        });
        const saine = await jpeg(200, 260, (cx) => { cx.fillStyle = '#00aa00'; cx.fillRect(60, 80, 80, 100); });
        const { jsPDF } = window.jspdf;
        const fabriquer = (premiere) => {
            const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [400 * 25.4 / 250, 300 * 25.4 / 250] });
            doc.addImage(premiere, 'JPEG', 0, 0, 400 * 25.4 / 250, 300 * 25.4 / 250);
            doc.addPage([200 * 25.4 / 250, 260 * 25.4 / 250], 'portrait');
            doc.addImage('data:image/jpeg;base64,' + base64(saine), 'JPEG', 0, 0, 200 * 25.4 / 250, 260 * 25.4 / 250);
            return doc.output('blob');
        };
        const perdue = fabriquer('data:application/octet-stream;base64,' + base64(photo));
        const intacte = fabriquer('data:image/jpeg;base64,' + base64(photo));
        window.__saine = base64(saine);
        window.__blobs = new Map([['FT_PERDUE', perdue], ['FT_INTACTE', intacte]]);
        const lire = window.travauxStockage.recupererBlob;
        window.travauxStockage.recupererBlob = async function (id) {
            return window.__blobs.has(id) ? window.__blobs.get(id) : lire.apply(this, arguments);
        };
        window.travauxStockage.stockerBlob = async (id, blob) => { window.__blobs.set(id, blob); };
        const fichiers = window.db.getSync(window.cle('fichiersTravaux'));
        const base = fichiers[0];
        fichiers.push(
            { ...base, id: 'FT_PERDUE', nomFichier: 'COURAGEUX_Analyse1_reprise.pdf', typeMIME: 'application/pdf', nombrePages: 2, tailleFichier: perdue.size, estReprise: true },
            { ...base, id: 'FT_INTACTE', nomFichier: 'COURAGEUX_Analyse1_bis.pdf', typeMIME: 'application/pdf', nombrePages: 2, tailleFichier: intacte.size });
        window.db.setSync(window.cle('fichiersTravaux'), fichiers); // security-ok: fixture de test
    });
    return suivi;
}

const ouvrirLaCopie = async (page, id) => {
    await page.evaluate((id) => window.travauxUI.ouvrirFichier(id), id);
    await page.waitForFunction((id) => (window.travauxVisionneuse.getFichierActuel() || {}).id === id, id);
    await attendre(page, 800);
};

/** Le PDF de FT_PERDUE relu : tailles et repères de chaque page, et son texte brut. */
const lireLePDF = (page) => page.evaluate(async () => {
    const octets = new Uint8Array(await window.__blobs.get('FT_PERDUE').arrayBuffer());
    let texte = '';
    for (let i = 0; i < octets.length; i++) texte += String.fromCharCode(octets[i]);
    const pdf = await pdfjsLib.getDocument({ data: octets.slice() }).promise;
    const pages = [];
    for (let n = 1; n <= pdf.numPages; n++) {
        const p = await pdf.getPage(n);
        const base = p.getViewport({ scale: 1 });
        const vp = p.getViewport({ scale: 400 / base.width });
        const c = document.createElement('canvas'); c.width = Math.round(vp.width); c.height = Math.round(vp.height);
        await p.render({ canvasContext: c.getContext('2d'), viewport: vp }).promise;
        const ctx = c.getContext('2d');
        const couleur = (fx, fy) => {
            const d = ctx.getImageData(Math.round(fx * c.width), Math.round(fy * c.height), 1, 1).data;
            if (d[0] > 170 && d[1] < 100 && d[2] < 100) return 'rouge';
            if (d[2] > 170 && d[0] < 100 && d[1] < 100) return 'bleu';
            if (d[1] > 120 && d[0] < 100 && d[2] < 100) return 'vert';
            if (d[0] > 200 && d[1] > 200 && d[2] > 200) return 'blanc';
            return 'autre';
        };
        pages.push({ l: Math.round(base.width * 100) / 100, h: Math.round(base.height * 100) / 100,
            hautGauche: couleur(0.1, 0.1), basDroite: couleur(0.9, 0.9), milieu: couleur(0.5, 0.5) });
    }
    return { pages, perdue: /\/Width 0\b/.test(texte), saineIntacte: texte.includes(atob(window.__saine)) };
});

test.describe('#1233 — réparer une copie dont une page a perdu son image', () => {
    test.setTimeout(120000);

    test('copie saine : aucun message ; copie abîmée : le message, le codex proposé, puis la page rendue sans perte', async ({ page }) => {
        const suivi = await monterLeBanc(page);
        const bandeau = page.locator('.travaux-bandeau-image-perdue');

        await ouvrirLaCopie(page, 'FT_INTACTE');
        await expect(bandeau).toHaveCount(0);

        const avant = await lireLePDF(page);
        expect(avant.perdue).toBe(true);
        expect(avant.pages[0].hautGauche).toBe('blanc');   // la page blanche vécue

        await ouvrirLaCopie(page, 'FT_PERDUE');
        await expect(bandeau).toHaveCount(1);
        await bandeau.locator('button').click();
        // Aucun codex au banc : la fenêtre « sans codex ». « Annuler » n'écrit rien.
        await expect(page.locator('#overlay-ui-dialogue')).toBeVisible();
        await cliquerDansFenetre(page, 'Annuler');
        await attendre(page, 1500);   // une écriture qui ignorerait le refus aurait le temps d'arriver
        expect((await lireLePDF(page)).perdue).toBe(true);

        await bandeau.locator('button').click();
        await cliquerDansFenetre(page, 'Réparer sans codex');
        await expect.poll(async () => (await lireLePDF(page)).perdue, { timeout: 20000 }).toBe(false);

        const apres = await lireLePDF(page);
        expect(apres.pages.map((p) => [p.l, p.h])).toEqual(avant.pages.map((p) => [p.l, p.h]));
        expect(apres.pages[0]).toMatchObject({ hautGauche: 'rouge', basDroite: 'bleu' });
        expect(apres.pages[1]).toMatchObject({ milieu: 'vert' });
        expect(apres.saineIntacte).toBe(true);
        const fiche = await page.evaluate(() => window.travauxStockage.obtenirFichierParId('FT_PERDUE'));
        expect(fiche.tailleFichier).toBe(await page.evaluate(() => window.__blobs.get('FT_PERDUE').size));
        // La copie rouverte : plus de message.
        await page.waitForFunction(() => (window.travauxVisionneuse.getFichierActuel() || {}).id === 'FT_PERDUE');
        await attendre(page, 800);
        await expect(bandeau).toHaveCount(0);
        // Seule erreur attendue : la fabrication du PDF abîmé. jsPDF, qui ne reconnaît pas la
        // data URL, tente de la charger, et la CSP le refuse — c'est le défaut lui-même.
        expect(suivi.erreurs.filter((m) => !/Refused to connect to data:application\/octet-stream/.test(m))).toEqual([]);
    });
});
