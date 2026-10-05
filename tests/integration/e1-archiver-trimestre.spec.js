import { test, expect } from '@playwright/test';
import { mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import JSZip from 'jszip';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// =======================================================================
// E1 (#1022) — ARCHIVER UN TRIMESTRE CLOS ENTIER, LE GESTE DE L'ÉCRAN (4 oct. 2026)
// =======================================================================
//
// Bibliothèque des trimestres, carte d'un trimestre clos, menu ⋮ : « Archiver le trimestre… ».
// La fenêtre dit ce qui part ; « Archiver » fabrique l'archive (mode fichier sous WebKit, comme
// Safari) ; la liste des archives (Réglages › Données › Archives) gagne une ligne « Trimestre
// entier », que « Vérifier » dit intacte, puis incomplète après un octet altéré.
//
// Ce que ce banc juge : le VRAI menu (dispatcher data-action), la VRAIE fenêtre, le vrai tableau,
// à la largeur d'un iPad en portrait, sous WebKit ; et le fichier produit, relu par JSZip (CRC
// vérifiés) : les clés du trimestre seulement, ses séances vivantes, ses copies corbeille comprise.
// Le contenu fin (empreintes, témoins) est jugé par Vitest (sentinelle-e1-archiver-trimestre.test.js).
//
// Noms fictifs ; les copies sont des octets posés par le banc, rendues par le magasin de la page.

const IPAD_PORTRAIT = { width: 820, height: 1180 };

const patternsAttendus = [
    /version\.json.*access control/i,
    /Cross origin requests are only supported/i,
    /Not allowed to load local resource.*\.(svg|png)/i,
    /Failed to load resource/i
];

function brancherEcouteurs(page) {
    const erreurs = [];
    const estAttendue = (m) => patternsAttendus.some((re) => re.test(m));
    page.on('pageerror', (e) => { const m = `pageerror: ${e.message}`; if (!estAttendue(m)) erreurs.push(m); });
    page.on('console', (msg) => { if (msg.type() === 'error') { const m = `console.error: ${msg.text()}`; if (!estAttendue(m)) erreurs.push(m); } });
    page.on('dialog', (d) => d.accept().catch(() => {}));
    return erreurs;
}

/** Un espace vierge, puis deux trimestres fictifs : a2032 actif, h2032 clos. */
async function poserEspace(page) {
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(800);
    await page.evaluate(async () => {
        localStorage.clear();
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
    await page.evaluate(() => {
        const ecrire = (k, v) => db.setSync(k, v);
        ecrire('trimestres', [
            { id: 'a2032', nom: 'Automne 2032', actif: true },
            { id: 'h2032', nom: 'Hiver 2032', archive: true, dateFin: '2032-05-20' }
        ]);
        ecrire('cours', [{ id: 'C1', codeCours: '601-101-MQ', nomCours: 'Cours fictif' }]);
        ecrire('h2032_groupesCours', [{ id: 'GC_H1', coursId: 'C1', groupeNum: '1' }, { id: 'GC_H2', coursId: 'C1', groupeNum: '2' }]);
        ecrire('h2032_groupeEtudiants', [
            { da: '0000001', nom: 'Élève fictive Une', groupe: '1' },
            { da: '0000002', nom: 'Élève fictif Deux', groupe: '2' },
            { da: '0000009', nom: 'Élève fictif Doubleur', groupe: '2' }
        ]);
        ecrire('h2032_evaluationsSauvegardees', [{ id: 'EV1', etudiantDA: '0000001', note: 80 }]);
        ecrire('h2032_fichiersTravaux', [
            { id: 'FT_h1', nomFichier: 'copie-une.pdf', etudiantDA: '0000001', groupeCoursId: 'GC_H1', tailleFichier: 120000 },
            { id: 'FT_h2', nomFichier: 'copie-deux.pdf', etudiantDA: '0000009', groupeCoursId: 'GC_H2', tailleFichier: 64000 }
        ]);
        ecrire('h2032_corbeilleFichiers', [
            { id: 'FT_hc', nomFichier: 'jetee.pdf', etudiantDA: '0000002', groupeCoursId: 'GC_H2', tailleFichier: 9000, dateSuppression: '2032-03-01T00:00:00.000Z' }
        ]);
        ecrire('seancesCompletes_gc_GC_H1', [{ id: 'S1' }]);
        ecrire('seancesCompletes_gc_GC_H2', [{ id: 'S2' }]);
        ecrire('a2032_groupesCours', [{ id: 'GC_A1', coursId: 'C1', groupeNum: '1' }]);
        ecrire('a2032_groupeEtudiants', [{ da: '0000009', nom: 'Élève fictif Doubleur', groupe: '1' }]);
        ecrire('seancesCompletes_gc_GC_A1', [{ id: 'SA' }]);
    });
    await page.waitForTimeout(800);
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2500);
}

/** Les copies, rendues par le magasin de la page (à reposer après un rechargement). */
async function poserCopies(page) {
    await page.evaluate(() => {
        const octets = (n, g) => { const u = new Uint8Array(n); let x = g; for (let i = 0; i < n; i++) { x = (x * 1103515245 + 12345) >>> 0; u[i] = x >>> 24; } return u; };
        window.__copies = { FT_h1: new Blob([octets(120000, 1)]), FT_h2: new Blob([octets(64000, 2)]), FT_hc: new Blob([octets(9000, 3)]) };
        window.travauxStockage.recupererBlob = async (id) => window.__copies[id] || null;
    });
}

const tableau = (page) => page.locator('#reserve-reglages-table-conteneur');

async function rafraichirTableau(page) {
    await page.evaluate(() => ReserveReglages.rafraichir());
    await page.waitForTimeout(300);
}

async function verifierParLeBouton(page, dossier, fichier) {
    const attente = page.waitForEvent('filechooser', { timeout: 15000 });
    await page.evaluate((d) => {
        document.querySelector('[data-action="ReserveVerifier.actionVerifier"][data-param="' + d + '"]').click();
    }, dossier);
    const selecteur = await attente;
    await selecteur.setFiles(fichier);
    const fenetre = page.locator('#overlay-ui-dialogue');
    await expect(fenetre).toBeVisible({ timeout: 15000 });
    const titre = await fenetre.locator('#ui-dialogue-titre').innerText();
    const message = await fenetre.locator('.modal-section').innerText();
    await fenetre.locator('.modal-actions button').first().click();
    await expect(fenetre).toHaveCount(0);
    await rafraichirTableau(page);
    return { titre, message };
}

test.describe('E1 — « Archiver le trimestre… » depuis la bibliothèque des trimestres (mode fichier, largeur iPad)', () => {
    test.setTimeout(150000);
    test.use({ viewport: IPAD_PORTRAIT });

    test('le menu d\'un trimestre clos offre le geste ; la fenêtre dit ce qui part ; l\'archive porte le trimestre seul ; la liste dit « Trimestre entier » ; « Vérifier » intacte puis abîmée', async ({ page }) => {
        page.setDefaultTimeout(15000);
        const erreurs = brancherEcouteurs(page);
        await poserEspace(page);
        await poserCopies(page);

        // Le fichier reste dans la page (pas de vrai téléchargement) ; l'aperçu et le « Il y est » acceptés.
        await page.evaluate(() => {
            window.SecuriteExportPreview.previewZipEtConfirmer = async () => true;
            window.FichierSortant.telecharger = (blob, nom) => { window.__archive = { blob, nom }; return { methode: 'banc' }; };
            window.FichierSortant.confirmerTelechargement = async () => true;
        });

        // 0. La liste aux trois boutons « Exporter les données » (#1006) n'a pas de conteneur dans la page.
        expect(await page.locator('#listeTrimestreGestion').count()).toBe(0);

        // 1. La bibliothèque : la carte close porte le geste dans son menu ; la carte en cours, non.
        await page.evaluate(() => ouvrirBibliothequeTrimestreV2());
        const modale = page.locator('#modalBibliothequeTrimestres');
        await expect(modale).toBeVisible();
        const geste = modale.locator('[data-action="ReserveTrimestre.actionArchiver"]');
        await expect(geste).toHaveCount(1);
        await expect(geste).toHaveAttribute('data-param', 'h2032');
        await modale.locator('[data-param="biblio-menu-h2032"]').click();
        await expect(geste).toBeVisible();
        await expect(geste).toHaveText('Archiver le trimestre…');
        const boite = await geste.boundingBox();
        expect(boite.x).toBeGreaterThanOrEqual(0);
        expect(boite.x + boite.width).toBeLessThanOrEqual(IPAD_PORTRAIT.width);
        expect(boite.height).toBeGreaterThanOrEqual(32); // cible tactile

        // 2. La fenêtre : ce qui part, et ce qui reste.
        await geste.click();
        const fenetre = page.locator('#overlay-ui-dialogue');
        await expect(fenetre).toBeVisible();
        await expect(fenetre.locator('#ui-dialogue-titre')).toHaveText('Archiver Hiver 2032 ?');
        await expect(fenetre.locator('.modal-section')).toHaveText(
            'L\'archive emporte tout le trimestre : 3 étudiant·es, 2 groupes, 3 copies (dont 1 à la corbeille), environ 188,5 Ko.\n' +
            'Rien n\'est retiré de l\'application : le trimestre reste là, clos.');
        const largeur = await page.evaluate(() => document.documentElement.scrollWidth);
        expect(largeur).toBeLessThanOrEqual(IPAD_PORTRAIT.width);
        const avant = await page.evaluate(async () => { const o = {}; for (const k of await db.keys()) o[k] = JSON.stringify(await db.get(k)); return o; });
        await fenetre.locator('.modal-actions button', { hasText: 'Archiver' }).click();
        await page.waitForFunction(() => window.__archive && window.__archive.blob, null, { timeout: 30000 });
        await page.waitForTimeout(800);

        // 3. Le fichier : relu par JSZip, CRC vérifiés.
        const rendu = await page.evaluate(async () => {
            const u8 = new Uint8Array(await window.__archive.blob.arrayBuffer());
            let s = ''; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000));
            return { base64: btoa(s), nom: window.__archive.nom };
        });
        expect(rendu.nom).toMatch(/^archive-h2032-trimestre-\d{4}-\d\d-\d\d\.zip$/);
        const octetsZip = Buffer.from(rendu.base64, 'base64');
        const zip = await JSZip.loadAsync(octetsZip, { checkCRC32: true });
        const base = 'trimestres/h2032-trimestre/';
        const donnees = JSON.parse(await zip.file(base + 'donnees.json').async('string'));
        const meta = JSON.parse(await zip.file(base + 'meta.json').async('string'));
        expect(Object.keys(donnees).filter((k) => !k.startsWith('h2032_')).sort()).toEqual(['seancesCompletes_gc_GC_H1', 'seancesCompletes_gc_GC_H2']);
        expect(Object.keys(donnees)).toEqual(expect.arrayContaining(['h2032_groupeEtudiants', 'h2032_fichiersTravaux', 'h2032_corbeilleFichiers', 'seancesCompletes_gc_GC_H1', 'seancesCompletes_gc_GC_H2']));
        expect(Object.keys(zip.files).filter((n) => n.startsWith(base + 'travaux/') && !zip.files[n].dir).sort())
            .toEqual([base + 'travaux/FT_h1.pdf', base + 'travaux/FT_h2.pdf', base + 'travaux/FT_hc.pdf']);
        expect(meta).toMatchObject({ type_archive: 'trimestre', trimestre: 'h2032', contenu: { nombre_fichiers_corbeille: 1, nombre_etudiants: 3 } });
        expect(Object.keys(meta.integrite.cles_sha256).sort()).toEqual(Object.keys(donnees).sort());

        // 4. Rien n'a changé dans les données ; seule la liste des archives a une entrée de plus.
        const apres = await page.evaluate(async () => { const o = {}; for (const k of await db.keys()) o[k] = JSON.stringify(await db.get(k)); return o; });
        const changees = Object.keys(apres).filter((k) => apres[k] !== avant[k]);
        expect(changees).toEqual(['_manifesteReserve']);

        // 5. La liste : « Trimestre entier », « Non vérifiée », pas de « Faire revenir ».
        const dossierTmp = path.join(__dirname, '.tmp-e1');
        mkdirSync(dossierTmp, { recursive: true });
        const fichier = path.join(dossierTmp, rendu.nom);
        try {
            writeFileSync(fichier, octetsZip);
            await rafraichirTableau(page);
            const ligne = tableau(page).locator('tr', { hasText: 'Trimestre entier' });
            await expect(ligne).toHaveCount(1);
            await expect(ligne).toContainText('h2032');
            await expect(ligne).toContainText('Non vérifiée');

            const ok = await verifierParLeBouton(page, 'h2032-trimestre', fichier);
            expect(ok.titre).toBe('Archive vérifiée');
            expect(ok.message).toBe('Les 3 copies et les données du trimestre sont présentes et intactes.');
            await expect(ligne).toContainText(/Vérifiée le \d{1,2} \S+ \d{4}/);
            await expect(ligne.locator('[data-action="ReserveRevenir.actionFaireRevenir"]')).toHaveCount(0);

            // 6. Un octet altéré dans la copie de la corbeille.
            const u8 = readFileSync(fichier);
            const nomCopie = Buffer.from('travaux/FT_hc.pdf');
            u8[u8.indexOf(nomCopie) + nomCopie.length + 500] ^= 0x01;
            writeFileSync(fichier, u8);
            const ko = await verifierParLeBouton(page, 'h2032-trimestre', fichier);
            expect(ko.titre).toBe('Archive incomplète');
            expect(ko.message).toContain('1 copies sur 3 manquent ou ne concordent pas. Archive de nouveau ce trimestre.');
            expect(ko.message).toContain('1 copie altérée');
            await expect(ligne).toContainText('Non vérifiée');
        } finally {
            rmSync(dossierTmp, { recursive: true, force: true });
        }
        expect(erreurs).toEqual([]);
    });
});
