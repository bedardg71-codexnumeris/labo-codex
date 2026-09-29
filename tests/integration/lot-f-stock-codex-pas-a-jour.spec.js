import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// =======================================================================
// LOT F — LE STOCK : UN CODEX ACTIF D'AVANT LE LOT EST POSÉ « PAS À JOUR », UNE FOIS
// =======================================================================
//
// Décision de Grégoire (29 sept. 2026, option b de la demande de relecture) : avant le lot,
// rien ne marquait les changements, et un codex actif disait « à jour » depuis sa dernière
// écriture, même après des semaines de travail. Au premier chargement de la nouvelle
// version, un état actif écrit avant le lot (sans `temoinFiable`) devient « pas à jour ».
// Seul `_codex_etat` est écrit ; sans codex actif, rien.
//
// Ce banc éprouve, sur le vrai code :
//   (a) premier chargement → « pas à jour », et l'état porte maintenant le drapeau ;
//   (b) second chargement → inchangé (la date du marquage ne bouge pas) ;
//   (c) après « Mettre à jour le codex », un chargement laisse le codex « à jour » (la
//       marque n'est pas rejouée à chaque chargement) ;
//   (d) sans codex actif → `_codex_etat` n'est pas réécrit ;
//   (e) l'état relu tard, depuis IndexedDB seulement (#142) → marqué aussi.
//
// Faux `showSaveFilePicker` et aperçu accepté : aucune écriture disque. Noms fictifs.

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

async function viderLeStockage(page) {
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
    await recharger(page);
}

async function recharger(page) {
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(4000);
}

async function lireTemoinCodex(page) {
    return page.evaluate(() => {
        Codex.toggleMenu();
        const el = document.querySelector('#codex-menu-statut-haut .codex-statut-etat');
        const texte = el ? el.textContent.replace('◉', '').trim() : null;
        Codex.toggleMenu();
        return { texte, pasAJour: Codex.etat().modificationsNonSauvees };
    });
}

const A_JOUR = 'Ton codex est à jour';
const PAS_A_JOUR = 'Ton codex n\'a pas tes derniers changements';

// Un état écrit par une version d'avant le lot : actif, « à jour », sans drapeau.
const ETAT_AVANT_LOT_F = {
    actif: true, nom: 'Codex fictif', derniereSauvegarde: '2026-09-01T12:00:00.000Z',
    modificationsDepuis: null, manifeste: null
};

test.describe('Lot F — le stock : un codex actif d\'avant le lot est posé « pas à jour »', () => {
    test.setTimeout(120000);

    test('premier chargement, second chargement, puis mise à jour du codex', async ({ page }) => {
        const erreurs = brancherEcouteurs(page);
        await viderLeStockage(page);
        await page.evaluate((etat) => db.setSync('_codex_etat', etat), ETAT_AVANT_LOT_F);

        // (a) Premier chargement de la nouvelle version.
        await recharger(page);
        expect(await lireTemoinCodex(page)).toEqual({ texte: PAS_A_JOUR, pasAJour: true });
        const apres1 = await page.evaluate(() => db.getSync('_codex_etat', null));
        expect(apres1.temoinFiable).toBe(true);
        expect(typeof apres1.modificationsDepuis).toBe('string');
        expect(apres1.nom).toBe('Codex fictif');
        expect(apres1.derniereSauvegarde).toBe(ETAT_AVANT_LOT_F.derniereSauvegarde);

        // (b) Second chargement : rien ne bouge.
        await recharger(page);
        expect(await lireTemoinCodex(page)).toEqual({ texte: PAS_A_JOUR, pasAJour: true });
        const apres2 = await page.evaluate(() => db.getSync('_codex_etat', null));
        expect(apres2.modificationsDepuis).toBe(apres1.modificationsDepuis);

        // (c) « Mettre à jour le codex », puis un chargement : le codex reste à jour.
        await page.evaluate(() => {
            window.__ecrituresFichier = 0;
            window.showSaveFilePicker = async () => ({
                createWritable: async () => ({
                    write: async () => {},
                    close: async () => { window.__ecrituresFichier++; },
                    abort: async () => {}
                })
            });
            window.SecuriteExportPreview.previewZipEtConfirmer = async () => true;
        });
        await page.evaluate(() => Codex.actionEnregistrer());
        await page.waitForFunction(() => window.__ecrituresFichier === 1, null, { timeout: 30000 });
        await page.waitForFunction(() => !Codex.etat().modificationsNonSauvees, null, { timeout: 10000 });
        await recharger(page);
        expect(await lireTemoinCodex(page)).toEqual({ texte: A_JOUR, pasAJour: false });

        expect(erreurs).toEqual([]);
    });

    test('sans codex actif, rien n\'est écrit ; l\'état relu tard depuis IndexedDB est marqué', async ({ page }) => {
        const erreurs = brancherEcouteurs(page);
        await viderLeStockage(page);

        // (d) Un codex fermé, d'avant le lot : l'état n'est pas réécrit.
        const ferme = { actif: false, nom: '', derniereSauvegarde: null, modificationsDepuis: null, manifeste: null };
        await page.evaluate((etat) => db.setSync('_codex_etat', etat), ferme);
        await recharger(page);
        expect(await page.evaluate(() => db.getSync('_codex_etat', null))).toEqual(ferme);
        expect(await page.evaluate(() => Codex.etat().actif)).toBe(false);

        // (e) Un état actif présent en IndexedDB seulement (localStorage saturé, #142).
        await page.evaluate(async (etat) => {
            await db.set('_codex_etat', etat);
            localStorage.removeItem('_codex_etat');
        }, ETAT_AVANT_LOT_F);
        expect(await page.evaluate(() => localStorage.getItem('_codex_etat'))).toBeNull();
        await recharger(page);
        expect(await lireTemoinCodex(page)).toEqual({ texte: PAS_A_JOUR, pasAJour: true });
        expect((await page.evaluate(() => db.getSync('_codex_etat', null))).temoinFiable).toBe(true);

        expect(erreurs).toEqual([]);
    });
});
