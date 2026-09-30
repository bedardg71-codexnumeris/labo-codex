import { test, expect } from '@playwright/test';
import { mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// =======================================================================
// LOT A2 DU CHANTIER DES ARCHIVES — « VÉRIFIER » UNE ARCHIVE, LE GESTE DE L'ÉCRAN (30 sept. 2026)
// =======================================================================
//
// Réglages › Données › Archives : la ligne d'un groupe archivé porte « Non vérifiée » et un bouton
// « Vérifier ». En mode fichier (Safari), le clic ouvre le sélecteur de fichier ; l'usager désigne
// le .zip de l'archive ; l'application le relit copie par copie, dit « Archive vérifiée », et la
// ligne dit « Vérifiée le JOUR ». L'état survit à un rechargement. Une copie altérée dans le
// fichier → « Archive incomplète », et la ligne redit « Non vérifiée ».
//
// Ce que ce banc juge : le VRAI bouton (dispatcher data-action), le VRAI sélecteur (intercepté par
// Playwright), la vraie fenêtre, le vrai tableau, sous WebKit. Le contenu de la vérification est
// jugé par Vitest (sentinelle-lot-A2-verifier-archive.test.js).
//
// Pack démo, noms fictifs ; les copies sont des octets aléatoires posés par une fixture (le pack
// démo n'a aucune copie). Le fichier de l'archive est écrit dans un dossier temporaire sous tests/.

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

async function demarrerDemo(page) {
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
    await page.evaluate(() => activerModeDemo());
    await page.waitForTimeout(3000);
}

/** Trois copies fictives sous le premier groupe de la démo ; le magasin les rend depuis la mémoire de la page. */
async function poserCopies(page) {
    return page.evaluate(() => {
        const gc = Reserve.listerGroupesVersables()[0];
        const octets = (n, g) => { const u = new Uint8Array(n); let x = g; for (let i = 0; i < n; i++) { x = (x * 1103515245 + 12345) >>> 0; u[i] = x >>> 24; } return u; };
        window.__copies = { FT_v1: new Blob([octets(120000, 1)]), FT_v2: new Blob([octets(64000, 2)]), FT_v3: new Blob([octets(9000, 3)]) };
        const fiches = [
            { id: 'FT_v1', nomFichier: 'copie-fictive-1.pdf', etudiantDA: '0000001', productionId: 'P1', groupeCoursId: gc.id, tailleFichier: 120000, blobStatut: 'present' },
            { id: 'FT_v2', nomFichier: 'copie-fictive-2.jpg', etudiantDA: '0000002', productionId: 'P1', groupeCoursId: gc.id, tailleFichier: 64000, blobStatut: 'present' },
            { id: 'FT_v3', nomFichier: 'copie-fictive-3.png', etudiantDA: '0000003', productionId: 'P1', groupeCoursId: gc.id, tailleFichier: 9000, blobStatut: 'present' }
        ];
        db.setSync(cle('fichiersTravaux'), fiches);
        window.travauxStockage.recupererBlob = async (id) => window.__copies[id] || null;
        return { gc, trimestre: obtenirTrimestreId() };
    });
}

/** Archive le groupe en mode fichier, sans téléchargement réel : le Blob est gardé dans la page, puis écrit sur le disque. */
async function archiverVersDisque(page, gc, trimestre, chemin) {
    const rendu = await page.evaluate(async ({ id, trimestre }) => {
        window.SecuriteExportPreview.previewZipEtConfirmer = async () => true;
        window.FichierSortant.telecharger = (blob, nom) => { window.__archive = { blob, nom }; return { methode: 'banc' }; };
        window.FichierSortant.confirmerTelechargement = async () => true;
        const r = await Reserve.verserGroupeCours(trimestre, id);
        const u8 = new Uint8Array(await window.__archive.blob.arrayBuffer());
        let s = ''; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000));
        return { succes: r && r.succes, dossier: r && r.dossier, uuid: r && r.uuid, base64: btoa(s), nom: window.__archive.nom };
    }, { id: gc.id, trimestre });
    expect(rendu.succes).toBe(true);
    writeFileSync(chemin, Buffer.from(rendu.base64, 'base64'));
    return rendu;
}

const tableau = (page) => page.locator('#reserve-reglages-table-conteneur');

async function rafraichirTableau(page) {
    await page.evaluate(() => ReserveReglages.rafraichir());
    await page.waitForTimeout(300);
}

/** Le vrai bouton « Vérifier » de la ligne, cliqué par script (le panneau des Réglages n'est pas ouvert) ; le sélecteur est intercepté. */
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

test.describe('Lot A2 — « Vérifier » une archive depuis l\'écran Archives (mode fichier)', () => {
    test.setTimeout(150000);

    test('la ligne dit « Non vérifiée » ; « Vérifier » + le fichier → « Archive vérifiée », « Vérifiée le … » ; survit au rechargement ; un fichier altéré → « Archive incomplète », « Non vérifiée »', async ({ page }) => {
        const erreurs = brancherEcouteurs(page);
        await demarrerDemo(page);
        const { gc, trimestre } = await poserCopies(page);

        const dossierTmp = path.join(__dirname, '.tmp-lot-a2');
        mkdirSync(dossierTmp, { recursive: true });
        const fichier = path.join(dossierTmp, 'archive-banc.zip');
        try {
            const archive = await archiverVersDisque(page, gc, trimestre, fichier);

            // 1. La ligne, avant : « Non vérifiée » et le bouton « Vérifier ».
            await rafraichirTableau(page);
            await expect(tableau(page)).toContainText('Non vérifiée');
            await expect(tableau(page).locator('[data-action="ReserveVerifier.actionVerifier"]')).toHaveText('Vérifier');
            expect(await tableau(page).innerText()).not.toContain('Vérifiée le');

            // 2. Le geste : le sélecteur, le fichier, la fenêtre, la ligne.
            const ok = await verifierParLeBouton(page, archive.dossier, fichier);
            expect(ok.titre).toBe('Archive vérifiée');
            expect(ok.message).toBe('Les 3 copies sont présentes et intactes, et les données concordent.');
            await expect(tableau(page)).toContainText(/Vérifiée le \d{1,2} \S+ \d{4}/);
            expect(await tableau(page).innerText()).not.toContain('Non vérifiée');
            const retenu = await page.evaluate((d) => db.getSync('_manifesteReserve').archives[d].verification, archive.dossier);
            expect(retenu).toMatchObject({ etat: 'verifiee', nombre_copies: 3, uuid: archive.uuid });
            expect(retenu.meta_sha256).toMatch(/^[0-9a-f]{64}$/);

            // 3. Un rechargement : l'état est relu du stockage.
            await page.reload();
            await page.waitForLoadState('domcontentloaded');
            await page.waitForTimeout(2500);
            await rafraichirTableau(page);
            await expect(tableau(page)).toContainText(/Vérifiée le \d{1,2} \S+ \d{4}/);

            // 4. Un octet altéré dans une copie (la structure du ZIP reste valide : la copie est rangée telle quelle).
            const u8 = readFileSync(fichier);
            const position = u8.indexOf(Buffer.from('travaux/FT_v1.pdf')) + 'travaux/FT_v1.pdf'.length + 500;
            u8[position] ^= 0x01;
            writeFileSync(fichier, u8);
            await poserCopies(page); // le magasin de la page est reposé après le rechargement (la couverture lit les fiches, pas les copies)
            const ko = await verifierParLeBouton(page, archive.dossier, fichier);
            expect(ko.titre).toBe('Archive incomplète');
            expect(ko.message).toContain('1 copies sur 3 manquent ou ne concordent pas. Archive de nouveau ce groupe.');
            expect(ko.message).toContain('1 altérées');
            await expect(tableau(page)).toContainText('Non vérifiée');
            expect(await tableau(page).innerText()).not.toContain('Vérifiée le');
            expect(await page.evaluate((d) => db.getSync('_manifesteReserve').archives[d].verification.etat, archive.dossier)).toBe('incomplete');
        } finally {
            rmSync(dossierTmp, { recursive: true, force: true });
        }
        expect(erreurs).toEqual([]);
    });
});
