import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

// =====================================================================
// T3 DU CHANTIER DU DÉMO — LE BOUTON DU BANDEAU, ET LE RANGEMENT DIT EN DÉMO
// =====================================================================
//
// Le pendant observable de tests/unit/sentinelle-t3-retirer-les-copies-du-demo.test.js.
//   1. En démo, avec une copie importée (posée par le vrai stockerBlob) : le bandeau vert montre
//      « Retirer la copie (1) » ; la confirmation s'ouvre, « Annuler » a le focus, Entrée ne
//      retire rien ; « Retirer » emporte la copie et cache le bouton. La copie réelle survit.
//   2. Un dossier sur disque branché (sélecteur simulé, le vrai configurerRepertoireFSAPI) : en
//      démo, l'écran d'export dit « Rangement : dans le navigateur » et l'écran d'import ne dit
//      pas « Stockage sur disque actif » ; hors démo, les deux disent le disque.
// Noms fictifs.

const patternsAttendus = [
    /version\.json.*access control/i,
    /Cross origin requests are only supported/i,
    /Not allowed to load local resource.*\.(svg|png)/i
];

async function demarrer(page, { dossier = false } = {}) {
    const erreurs = [];
    page.on('pageerror', (e) => { const m = 'pageerror: ' + e.message; if (!patternsAttendus.some((re) => re.test(m))) erreurs.push(m); });
    if (dossier) {
        // Le sélecteur de dossier, simulé (WebKit n'en a pas) : un dossier en mémoire.
        await page.addInitScript(() => {
            const dossierEnMemoire = () => {
                const d = {
                    kind: 'directory', name: 'Dossier fictif',
                    getDirectoryHandle: async () => d,
                    getFileHandle: async () => ({ createWritable: async () => ({ write: async () => {}, close: async () => {} }), getFile: async () => null }),
                    removeEntry: async () => {}
                };
                return d;
            };
            window.showDirectoryPicker = async () => dossierEnMemoire();
        });
    }
    await page.goto(indexHtml, { timeout: 60000 });
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
    await page.reload({ timeout: 60000 });
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);
    // WebKit refuse un Blob en IndexedDB dans un banc : les octets vont dans un magasin en mémoire.
    await page.evaluate(() => {
        window.__magasin = new Map();
        db.storeBlob = async (enr) => { window.__magasin.set(enr.id, enr); };
        db.getBlob = async (id) => window.__magasin.get(id) || null;
        db.deleteBlob = async (id) => { window.__magasin.delete(id); };
    });
    return erreurs;
}

test('T3 · en démo, « Retirer la copie (1) » : Annuler au focus, puis Retirer ; la copie réelle survit', async ({ page }) => {
    test.setTimeout(120000);
    page.setDefaultTimeout(15000);
    const erreurs = await demarrer(page);
    // Une copie réelle, posée sous un trimestre réel fictif, avant d'entrer dans la démo.
    await page.evaluate(async () => {
        await travauxStockage.stockerBlob('FT_reel_t3', new Blob([new Uint8Array([0x25, 0x50, 0x44, 0x46, 1])], { type: 'application/pdf' }), '0000001', 'P1');
        db.setSync('a2031_fichiersTravaux', [{ id: 'FT_reel_t3', etudiantDA: '0000001', nomFichier: 'copie-fictive-reelle.pdf' }]);
    });
    await page.evaluate(() => activerModeDemo());
    await page.waitForTimeout(3000);
    const bouton = page.locator('#bandeau-demo-retirer-copies');
    await expect(bouton, 'aucune copie importée : pas de bouton').toBeHidden();

    // Une copie importée dans la démo, par le vrai écrivain des copies.
    await page.evaluate(async () => {
        await travauxStockage.stockerBlob('FT_demo_t3', new Blob([new Uint8Array([0x25, 0x50, 0x44, 0x46, 2])], { type: 'application/pdf' }), '9000001', 'P1');
        const liste = travauxStockage.obtenirFichiersTravaux();
        travauxStockage.sauvegarderFichiersTravaux(liste.concat([{ id: 'FT_demo_t3', etudiantDA: '9000001', nomFichier: 'copie-fictive-demo.pdf' }]));
    });
    await expect(bouton).toBeVisible();
    await expect(bouton).toHaveText('Retirer la copie (1)');

    // La confirmation : « Annuler » a le focus, Entrée ne retire rien.
    await bouton.click();
    const fenetre = page.locator('[role="dialog"]').filter({ hasText: 'Retirer la copie importée dans la démo ?' });
    await expect(fenetre).toBeVisible();
    expect(await page.evaluate(() => document.activeElement && document.activeElement.textContent.trim())).toBe('Annuler');
    await page.keyboard.press('Enter');
    await expect(fenetre).toBeHidden();
    expect(await page.evaluate(() => db.getSync('demo_fichiersTravaux', []).map((f) => f.id))).toEqual(['FT_demo_t3']);
    await expect(bouton).toHaveText('Retirer la copie (1)');

    // « Retirer » : la copie du démo part, le bouton se cache ; la réelle survit.
    await bouton.click();
    await page.locator('[role="dialog"] button', { hasText: /^Retirer$/ }).click();
    await expect(bouton).toBeHidden();
    const apres = await page.evaluate(async () => ({
        demo: db.getSync('demo_fichiersTravaux', []).map((f) => f.id),
        blobDemo: !!(await db.getBlob('FT_demo_t3')),
        reelle: db.getSync('a2031_fichiersTravaux', []).map((f) => f.id),
        blobReel: !!(await db.getBlob('FT_reel_t3'))
    }));
    expect(apres).toEqual({ demo: [], blobDemo: false, reelle: ['FT_reel_t3'], blobReel: true });
    expect(erreurs).toEqual([]);
});

test('T3 · dossier branché : en démo, le rangement dit le navigateur ; hors démo, le disque', async ({ page }) => {
    test.setTimeout(120000);
    page.setDefaultTimeout(15000);
    const erreurs = await demarrer(page, { dossier: true });
    expect(await page.evaluate(() => travauxStockage.configurerRepertoireFSAPI())).toBe(true);

    const lire = async () => {
        // Témoin de fraîcheur : le panneau est vidé, il faut qu'il soit redessiné pour être lu.
        await page.evaluate(() => { const q = document.getElementById('travaux-quota-info'); if (q) q.textContent = ''; });
        await page.evaluate(() => window.naviguerVers('evaluations', 'exporter'));
        await page.waitForFunction(() => /Rangement :/.test((document.getElementById('travaux-quota-info') || {}).textContent || ''));
        const rangement = await page.evaluate(() => document.getElementById('travaux-quota-info').textContent.match(/Rangement : [^\n]+/)[0].trim());
        await page.evaluate(() => { const p = document.querySelector('.pipeline-page'); if (p) p.remove(); });
        await page.evaluate(() => window.naviguerVers('evaluations', 'importer'));
        await page.waitForFunction(() => !!document.querySelector('.pipeline-page'));
        const statutDisque = await page.evaluate(() => /Stockage sur disque actif/.test(document.querySelector('.pipeline-page').textContent));
        return { rangement, statutDisque };
    };

    expect(await lire(), 'hors démo : le disque').toEqual({ rangement: 'Rangement : fichiers sur ton disque', statutDisque: true });
    await page.evaluate(() => activerModeDemo());
    await page.waitForTimeout(3000);
    expect(await lire(), 'en démo : le navigateur').toEqual({ rangement: 'Rangement : dans le navigateur', statutDisque: false });
    expect(erreurs).toEqual([]);
});
