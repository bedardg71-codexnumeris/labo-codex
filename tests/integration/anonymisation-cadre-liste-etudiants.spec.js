import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// =======================================================================
// ANONYMISATION — la liste d'élèves du Cadre (14 sept. 2026)
// =======================================================================
//
// Signalé par Grégoire pendant la première rencontre de la CoP : en mode
// anonymisation, Cadre › Trimestre › « Groupe d'étudiant·es » montrait les vrais
// noms, même après un rechargement. Mesuré sur le pack démo dans Chrome avant le
// correctif : « DEMO004 0demo Césaire Aimé » en mode normal ET en anonymisation.
//
// ⚠ Chaque essai part d'un stockage VIDÉ (les specs partagent l'origine file://).

const NOMS_REELS = ['Césaire', 'Curie', 'Kahlo'];

async function packDemoSurLeCadre(page) {
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
    await page.waitForTimeout(1500);
    await page.evaluate(() => activerModeDemo());
    await page.waitForTimeout(800);
    await page.reload();
    await page.waitForTimeout(2000);
    await page.evaluate(() => naviguerVers('calendrier', 'trimestre'));
    await expect(page.locator('#v2-listeEtudiants tbody tr').first()).toBeAttached({ timeout: 5000 });
}

const texteListe = (page) => page.evaluate(() => document.getElementById('v2-listeEtudiants').textContent);

test('en anonymisation, la liste du Cadre ne montre aucun vrai nom — les menus gardent le vrai DA', async ({ page }) => {
    await packDemoSurLeCadre(page);

    // Témoin : en mode normal, les vrais noms sont là (sinon l'essai ne prouverait rien).
    const avant = await texteListe(page);
    for (const nom of NOMS_REELS) expect(avant).toContain(nom);

    await page.evaluate(() => changerMode('anonymisation'));
    await page.waitForTimeout(800);

    const apres = await texteListe(page);
    for (const nom of NOMS_REELS) expect(apres, `« ${nom} » affiché en anonymisation`).not.toContain(nom);
    // Les menus d'action visent toujours l'élève réel.
    const das = await page.locator('#v2-listeEtudiants select[data-da]').evaluateAll((els) => els.map((e) => e.dataset.da));
    expect(das).toContain('DEMO004');

    // Un aller-retour d'écran redessine la liste par chargerListeEtudiantsV2 : toujours anonyme.
    // (Pas d'essai après rechargement : sur le pack démo, l'entrée en démo remet le mode à
    // « normal » — mesuré le 14 sept. — et l'essai ne prouverait plus rien.)
    await page.evaluate(() => naviguerVers('suivi', 'liste'));
    await page.waitForTimeout(500);
    await page.evaluate(() => naviguerVers('calendrier', 'trimestre'));
    await page.waitForTimeout(800);
    const apresAllerRetour = await texteListe(page);
    for (const nom of NOMS_REELS) expect(apresAllerRetour).not.toContain(nom);
});

// Réancré le 26 sept. 2026 (lot A de l'enregistrement, D5 de Grégoire) : « Modifier » n'est plus
// refusé en anonymisation. Le formulaire s'ouvre, l'identité y est vide et non modifiable.
test('en anonymisation, « Modifier » ouvre la fiche sans le vrai nom : DA, nom et prénom masqués', async ({ page }) => {
    await packDemoSurLeCadre(page);
    await page.evaluate(() => changerMode('anonymisation'));
    await page.waitForTimeout(800);

    await page.locator('#v2-listeEtudiants select[data-da="DEMO004"]').first().selectOption('editer');
    await page.waitForTimeout(400);
    for (const id of ['#v2-etudiantDA', '#v2-etudiantNom', '#v2-etudiantPrenom']) {
        expect(await page.locator(id).inputValue()).toBe('');
        await expect(page.locator(id)).toBeDisabled();
        await expect(page.locator(id)).toHaveAttribute('placeholder', 'Masqué en anonymisation');
    }
    // ↻ Lot E2 (D3) : une fiche existante s'enregistre au changement — plus de bouton « Enregistrer
    // les modifications » ; « Fermer » ramène au formulaire d'ajout.
    await expect(page.locator('#v2-btnSoumettreEtudiant')).toBeHidden();
    await expect(page.locator('#v2-btnAnnulerEdition')).toHaveText('Fermer');
});
