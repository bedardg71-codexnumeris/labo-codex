import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// =======================================================================
// LOT F DE L'ENREGISTREMENT (D4, D0) — LE RAPPEL MÈNE À LA COPIE DE SECOURS ;
// UNE ARCHIVE ANNULÉE N'EST PLUS LISTÉE (29 sept. 2026)
// =======================================================================
//
// (1) Retiré au lot I (#985, D8) : le rappel ne mène plus à la copie de secours, mais au
//     codex. Son banc : lot-i-rappel-mene-au-codex.spec.js.
// (2) Codex › Archiver sous Safari (mode ZIP, pas d'accès direct au disque) : l'archive était
//     inscrite à la liste AVANT l'aperçu ; un aperçu annulé la laissait listée sans fichier.
//     Elle n'est inscrite qu'après le téléchargement.
// (3) Lot A1 du chantier des archives (30 sept. 2026) : le téléchargement LANCÉ ne suffit plus.
//     L'application ne peut pas savoir s'il s'est terminé : c'est l'usager qui dit « Il y est ».
//     Sans ce mot, rien au registre, et l'écran ne dit pas « Groupe archivé ». L'adresse du
//     fichier n'est plus libérée aussitôt. Le contenu du fichier est jugé par Vitest
//     (sentinelle-lot-A1-archive-sans-copier.test.js).
//
// Pack démo, noms fictifs. Aucun fichier n'est écrit (aperçu annulé, ou téléchargement
// intercepté par le navigateur de test).

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

test.describe('Lot F — rappel de la copie de secours, et archive annulée', () => {
    test.setTimeout(120000);

    test('(2) Codex › Archiver en mode ZIP : un aperçu annulé ne laisse aucune archive dans la liste', async ({ page }) => {
        const erreurs = brancherEcouteurs(page);
        await demarrerDemo(page);
        const avant = await page.evaluate(() => Object.keys(Reserve.lireManifesteLocal().archives));
        const gc = await page.evaluate(() => Reserve.listerGroupesVersables()[0]);
        expect(gc && gc.id).toBeTruthy();

        // Aperçu annulé : ni archive listée, ni message de réussite.
        await page.evaluate(() => { window.SecuriteExportPreview.previewZipEtConfirmer = async () => false; });
        const rendu = await page.evaluate((id) => Reserve.verserGroupeCours(obtenirTrimestreId(), id), gc.id);
        expect(rendu).toBeNull();
        expect(await page.evaluate(() => Object.keys(Reserve.lireManifesteLocal().archives))).toEqual(avant);
        expect(await page.evaluate(() => Object.keys(db.getSync('_manifesteReserve', { archives: {} }).archives || {}))).toEqual(avant);

        // Aperçu accepté : le fichier part ; la fenêtre « Téléchargement lancé » attend l'usager.
        await page.evaluate(() => {
            window.SecuriteExportPreview.previewZipEtConfirmer = async () => true;
            window.__adressesLiberees = 0;
            const liberer = URL.revokeObjectURL;
            URL.revokeObjectURL = function (u) { window.__adressesLiberees++; return liberer.call(URL, u); };
            // Une annonce de réussite ne reste que 3 s à l'écran : un « elle n'y est pas » qui réessaie
            // finirait toujours par passer. On consigne donc chaque annonce, pour la juger sans attendre.
            window.__reussitesAnnoncees = [];
            const succes = window.notifications.succes;
            window.notifications.succes = function (titre) { window.__reussitesAnnoncees.push(titre); return succes.apply(this, arguments); };
        });
        const reussites = () => page.evaluate(() => window.__reussitesAnnoncees);
        const listees = () => page.evaluate(() => Object.keys(Reserve.lireManifesteLocal().archives));
        const annonce = page.locator('.notification-avec-icone').filter({ hasText: 'Groupe archivé' });
        const fenetre = page.locator('#overlay-ui-dialogue').filter({ hasText: 'Téléchargement lancé' });

        let telechargement = page.waitForEvent('download', { timeout: 30000 });
        let versement = page.evaluate((id) => Reserve.verserGroupeCours(obtenirTrimestreId(), id).then((r) => r && r.succes), gc.id);
        await telechargement;
        await expect(fenetre).toBeVisible();
        await expect(fenetre).toContainText('se trouve dans tes Téléchargements');
        // (3) Tant que l'usager n'a rien dit : ni liste, ni « Groupe archivé », ni adresse libérée.
        expect(await listees()).toEqual(avant);
        expect(await reussites()).toEqual([]);
        expect(await page.evaluate(() => window.__adressesLiberees)).toBe(0);

        // « Il n'y est pas », puis « Fermer » : le groupe n'est pas archivé, et l'écran le dit.
        await page.getByRole('button', { name: 'Il n\'y est pas' }).click();
        const refus = page.locator('#overlay-ui-dialogue').filter({ hasText: 'Groupe non archivé' });
        await expect(refus).toBeVisible();
        await expect(refus).toContainText('n\'a pas été enregistré');
        await refus.getByRole('button', { name: 'Fermer' }).click();
        expect(await versement).toBe(false);
        expect(await listees()).toEqual(avant);
        expect(await reussites()).toEqual([]);

        // « Il n'y est pas », « Réessayer » : le fichier repart ; « Il y est » : listée, annoncée.
        telechargement = page.waitForEvent('download', { timeout: 30000 });
        versement = page.evaluate((id) => Reserve.verserGroupeCours(obtenirTrimestreId(), id).then((r) => r && r.succes), gc.id);
        await telechargement;
        await page.getByRole('button', { name: 'Il n\'y est pas' }).click();
        const secondTelechargement = page.waitForEvent('download', { timeout: 30000 });
        await refus.getByRole('button', { name: 'Réessayer' }).click();
        const fichier = await secondTelechargement;
        expect(fichier.suggestedFilename()).toMatch(/^archive-.+\.zip$/);
        expect(await listees()).toEqual(avant);
        expect(await reussites()).toEqual([]);
        await page.getByRole('button', { name: 'Il y est' }).click();
        expect(await versement).toBe(true);
        const apres = await listees();
        expect(apres.length).toBe(avant.length + 1);
        await expect(annonce.first()).toBeVisible();
        expect(await reussites()).toEqual(['Groupe archivé : fichier téléchargé']);
        expect(await page.evaluate(() => window.__adressesLiberees)).toBe(0);
        expect(erreurs).toEqual([]);
    });
});
