import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// =======================================================================
// LA FENÊTRE D'APERÇU DU CODEX DIT « METTRE À JOUR LE CODEX » (24 oct. 2026)
// =======================================================================
//
// Retour de Grégoire (24 oct., 8 h 45) : avant d'écrire le codex, la fenêtre d'aperçu titrait
// « Confirmer l'export codex » et proposait « Télécharger ». Depuis D4 (26 sept. 2026), le codex
// a un seul verbe. Mots validés (8 h 46) : titre « Mettre à jour le codex », bouton
// « Mettre à jour ». La fenêtre est commune (js/securite-export-preview.js) : l'archive, la
// configuration pédagogique et la bibliothèque de tampons sont de vrais téléchargements et
// gardent « Confirmer l'export … » et « Télécharger ».
//
// Ce que ce banc juge : la VRAIE fenêtre, ouverte par les vrais gestes — le menu Codex
// (« Mettre à jour le codex », « Enregistrer sous »), le codex à part avant une suppression
// (« Écrire le codex à part » / « Écrire », Grégoire, 24 oct., 9 h 01), et l'archive d'un
// groupe (Reserve.verserGroupeCours) ; et le « i » commun (« Ce que contient le fichier »). Chaque fois : on lit, puis « Annuler » — rien n'est écrit.
//
// Pack démo, noms fictifs.

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

/** Lit le titre et le bouton de confirmation de la fenêtre d'aperçu ouverte, puis « Annuler ». */
async function lireEtAnnuler(page) {
    const modale = page.locator('.export-preview-modal');
    await expect(modale).toBeVisible({ timeout: 30000 });
    const lu = {
        titre: (await modale.locator('h2.modal-titre').innerText()).trim(),
        bouton: (await modale.locator('.btn-confirmer').innerText()).trim()
    };
    await modale.locator('.btn-annuler').click();
    await expect(modale).toHaveCount(0);
    return lu;
}

const MOTS_DU_CODEX = { titre: 'Mettre à jour le codex', bouton: 'Mettre à jour' };

/** Le « i » de la fenêtre ouverte : son nom lu par le lecteur d'écran, et le titre de l'aide qu'il ouvre. */
async function lireAide(page) {
    await expect(page.locator('.export-preview-modal')).toBeVisible({ timeout: 30000 });
    const nom = await page.locator('.export-preview-modal .btn-aide-contextuelle').getAttribute('aria-label');
    await page.evaluate(() => document.querySelector('.export-preview-modal .btn-aide-contextuelle').click());
    await expect(page.locator('#aide-ctx-titre')).toBeVisible({ timeout: 5000 });
    const titre = (await page.locator('#aide-ctx-titre').innerText()).trim();
    await page.evaluate(() => window.fermerAideContextuelle());
    return { nom, titre };
}

test.describe('Fenêtre d\'aperçu — les mots du codex, et ceux des vrais téléchargements', () => {
    test.setTimeout(150000);

    test('le menu Codex (« Mettre à jour le codex », « Enregistrer sous ») dit « Mettre à jour » ; le codex à part, « Écrire » ; l\'archive garde « Confirmer l\'export archive » et « Télécharger » ; le « i » ouvre « Ce que contient le fichier »', async ({ page }) => {
        const erreurs = brancherEcouteurs(page);
        await demarrerDemo(page);

        // 1. Menu Codex › « Mettre à jour le codex ».
        await page.click('#btn-codex');
        await page.click('#codex-menu [data-action="Codex.actionEnregistrer"]');
        // Le « i » : une seule aide pour tous les appelants, sans « export » ni « téléchargement » (24 oct.).
        expect(await lireAide(page)).toEqual({ nom: 'Aide : ce que contient le fichier', titre: 'Ce que contient le fichier' });
        expect(await lireEtAnnuler(page)).toEqual(MOTS_DU_CODEX);

        // 2. Menu Codex › « Enregistrer sous » : même verbe (D4).
        await page.click('#btn-codex');
        await page.click('#codex-menu [data-action="Codex.actionEnregistrerSous"]');
        expect(await lireEtAnnuler(page)).toEqual(MOTS_DU_CODEX);

        // 3. Le codex à part avant une suppression : la fenêtre de choix, puis l'aperçu. Il n'écrit
        //    pas dans le codex tenu : ses propres mots (Grégoire, 24 oct., 9 h 01).
        const aPart = page.evaluate(() => Codex.ecrireAPartAvantSuppression('Phrase fictive de banc.'));
        const choix = page.locator('#overlay-ui-dialogue');
        await expect(choix).toBeVisible({ timeout: 15000 });
        await choix.locator('.modal-actions button', { hasText: 'Écrire le codex à part' }).click();
        expect(await lireEtAnnuler(page)).toEqual({ titre: 'Écrire le codex à part', bouton: 'Écrire' });
        expect(await aPart).toBe(false);

        // 4. L'archive d'un groupe : un vrai téléchargement, mots inchangés.
        const archive = page.evaluate(async () => {
            window.FichierSortant.telecharger = () => { window.__telecharge = true; return { methode: 'banc' }; };
            const gc = Reserve.listerGroupesVersables()[0];
            return Reserve.verserGroupeCours(obtenirTrimestreId(), gc.id);
        });
        expect(await lireEtAnnuler(page)).toEqual({ titre: 'Confirmer l\'export archive', bouton: 'Télécharger' });
        const rendu = await archive;
        expect(rendu && rendu.succes).not.toBe(true);
        expect(await page.evaluate(() => window.__telecharge === true)).toBe(false);

        expect(erreurs).toEqual([]);
    });
});
