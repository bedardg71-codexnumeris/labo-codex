import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { attendreApplication } from './harness/attendre-application.js';

// =======================================================================
// LE VERROU DES PARCOURS, PAR PARCOURS — 16 NOVEMBRE 2026 (plans de travail/CONSIGNE-2026-11-16-decouvrir-en-ligne.md)
// =======================================================================
// « Découvrir » seul est ouvert. Ce banc est le SEUL qui charge l'application telle qu'elle est livrée
// (`parcoursFermes: true` : le harnais ne rouvre rien) ; les autres bancs rouvrent tous les parcours en mémoire.
// AUCUN CHEMIN NE MÈNE À UN PARCOURS FERMÉ. Les entrées, une à une :
//   · le panneau « Assistance » : une seule carte, « Découvrir » ; « À venir » dessous ; ni « Je regarde », ni
//     « Nous faisons », ni « Remettre la démo à neuf » ;
//   · la porte « Tu enseignes ? » de l'accueil : Cadre › Trimestre, sans parcours ;
//   · la reprise : un parcours fermé resté « en cours » sur l'appareil (le stock d'avant le 15 nov.) n'est ni offert
//     ni compté ;
//   · la fin de « Découvrir » : « Explorer la démo par moi-même » et « Terminer », rien d'autre ; « Terminer » rend
//     l'application comme le parcours l'a trouvée ;
//   · `lancerParcours` (« Parcours suivant ») refuse chaque parcours fermé.
// Remplace parcours-fermes-2026-11-15.spec.js (la fermeture en entier).
// Break-tests (16 nov. 2026), chacun ROUGE puis rétabli, dans js/assistance.js :
//   · `parcours: offerts,` → `parcours: function () { return registre.slice(); },` → la porte de l'accueil lance
//     « Mettre ta classe en place », et la fin de « Découvrir » offre ses trois suites ;
//   · `if (!estOuvert(id)) return false;` retiré de `lancerParcours` → un parcours fermé part ;
//   · `offerts().forEach(` → `registre.forEach(` dans `remplirListe` → neuf cartes au panneau.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');
const FERMES = ['classe', 'evaluer', 'recevoir', 'monter', 'donnees', 'lire-ta-classe', 'commentaires', 'notation-alternative'];

async function ouvrirEspaceVide(page, largeur = 1180) {
    page.on('dialog', (d) => d.accept().catch(() => {}));
    await page.setViewportSize({ width: largeur, height: 900 });
    await page.goto(indexHtml);
    await attendreApplication(page, { parcoursFermes: true });
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
    await attendreApplication(page, { parcoursFermes: true });
    await page.evaluate(() => { window.afficherSection('accueil'); window.afficherAccueil(); window.scrollTo(0, 0); });
}

const bulle = (page) => page.locator('#parcours-bulle');
const moteurActif = (page) => page.evaluate(() => !!(window.ParcoursMoteur.actif && window.ParcoursMoteur.actif()));

test('le panneau « Assistance » : « Découvrir » seul, « À venir » dessous, le reste inchangé', async ({ page }) => {
    await ouvrirEspaceVide(page);
    // Le registre porte bien les neuf parcours : huit sont fermés, pas absents.
    expect(await page.evaluate((ids) => ids.map((id) => window.Assistance.estOuvert(id)), FERMES)).toEqual(FERMES.map(() => false));
    expect(await page.evaluate(() => window.Assistance.parcours().map((p) => p.id))).toEqual(['decouvrir']);
    await expect(page.locator('#assistance-menu-rang')).toHaveText('1 sur 1');

    await page.evaluate(() => window.ouvrirPanneauAssistance());
    const panneau = page.locator('#panneau-assistance');
    await expect(panneau).toBeVisible();
    await expect(panneau.locator('#assistance-parcours-liste > li')).toHaveCount(1);
    await expect(panneau.locator('[data-parcours="decouvrir"] .assistance-parcours-bouton')).toHaveText('Commencer');
    for (const id of FERMES) await expect(panneau.locator(`[data-parcours="${id}"]`)).toHaveCount(0);
    // « À venir », sous la liste ; les parcours fermés ne sont pas nommés.
    await expect(panneau.locator('#assistance-a-venir')).toHaveText('À venir');
    expect(await page.evaluate(() => {
        const l = document.getElementById('assistance-parcours-liste').getBoundingClientRect(), a = document.getElementById('assistance-a-venir').getBoundingClientRect();
        return a.top >= l.bottom;
    }), '« À venir » est sous la liste').toBe(true);
    await expect(panneau).not.toContainText('Mettre ta classe en place');
    await expect(panneau).not.toContainText('Évaluer une première production');
    // Ni modèle, ni pratique guidée, ni remise à neuf de la démo (elle sert les modèles).
    await expect(panneau.locator('.assistance-modele-bouton')).toHaveCount(0);
    await expect(panneau.locator('#assistance-demo-neuf')).toHaveCount(0);
    await expect(panneau.locator('.assistance-parcours-bouton')).toHaveCount(1);

    // Ce qui reste : le titre, « Aide dans les pages » et son interrupteur, qui bascule toujours. Échap ferme.
    await expect(panneau.locator('#assistance-titre')).toHaveText('Assistance');
    const inter = panneau.locator('#assistance-interrupteur');
    const avant = await inter.getAttribute('aria-checked');
    await inter.click();
    await expect(inter).not.toHaveAttribute('aria-checked', avant);
    await inter.click();
    await expect(inter).toHaveAttribute('aria-checked', avant);
    await page.keyboard.press('Escape');
    await expect(panneau).toHaveCount(0);
});

test('aucun chemin ne mène à un parcours fermé : « Parcours suivant », la porte de l’accueil, la reprise', async ({ page }) => {
    await ouvrirEspaceVide(page);
    // `lancerParcours` (« Parcours suivant », à la fin d'un parcours) refuse chaque parcours fermé.
    const lu = await page.evaluate((ids) => ({
        lances: ids.map((id) => window.Assistance.lancerParcours(id)),
        suivant: window.Assistance.suivantDe('decouvrir'),
        actif: !!window.ParcoursMoteur.actif()
    }), FERMES);
    expect(lu.lances).toEqual(FERMES.map(() => false));
    expect(lu.suivant, 'rien ne suit « Découvrir »').toBeNull();
    expect(lu.actif).toBe(false);
    await expect(bulle(page)).toHaveCount(0);
    await expect(page.locator('#panneau-assistance')).toHaveCount(0);

    // La porte « Tu enseignes ? » : plus de parcours, mais elle ne reste pas muette.
    await page.click('#accueil-portes .accueil-porte:first-child .accueil-porte-bouton');
    await expect(page.locator('#calendrier-trimestre')).toBeVisible();
    await expect(bulle(page)).toHaveCount(0);
    expect(await moteurActif(page)).toBe(false);

    // LA REPRISE : un parcours fermé resté « en cours » sur l'appareil (commencé avant le 15 nov.), un modèle aussi.
    await page.evaluate(() => {
        window.Assistance.definirEtat('classe', 'en-cours', 3);
        window.Assistance.definirEtatModele('classe', 'en-cours', 2);
        window.Assistance.definirEtat('evaluer', 'fait', 0);
    });
    await expect(page.locator('#assistance-menu-rang'), 'le rang du menu ne compte que « Découvrir »').toHaveText('1 sur 1');
    await page.evaluate(() => window.ouvrirPanneauAssistance());
    const panneau = page.locator('#panneau-assistance');
    await expect(panneau.locator('#assistance-parcours-liste > li')).toHaveCount(1);
    await expect(panneau.getByRole('button', { name: 'Reprendre' })).toHaveCount(0);
    await expect(panneau.getByRole('button', { name: 'Refaire' })).toHaveCount(0);
    await expect(panneau.getByRole('button', { name: 'Je regarde' })).toHaveCount(0);
    await expect(panneau.getByRole('button', { name: 'Nous faisons' })).toHaveCount(0);
    expect(await page.evaluate(() => window.Assistance.lancerParcours('classe'))).toBe(false);
    expect(await moteurActif(page)).toBe(false);
});

test('la fin de « Découvrir » : « Explorer la démo par moi-même » et « Terminer », rien d’autre ; « Terminer » rend l’application comme avant', async ({ page }) => {
    await ouvrirEspaceVide(page);
    await page.evaluate(() => window.ouvrirPanneauAssistance());
    await page.locator('#panneau-assistance [data-parcours="decouvrir"] .assistance-parcours-bouton').click();
    await expect(bulle(page).locator('.parcours-bulle-rang')).toHaveText('1 sur 8', { timeout: 15000 });
    expect(await page.evaluate(() => estEnModeDemo()), '« Découvrir » a ouvert la démo').toBe(true);
    await expect(page.locator('#groupe-affichage-principal')).toHaveText('601-101 · gr. 0demo');

    await page.evaluate(() => window.ParcoursMoteur.allerA(7));
    await expect(bulle(page).locator('.parcours-bulle-rang')).toHaveText('8 sur 8');
    await expect(bulle(page).locator('.parcours-bulle-titre')).toHaveText('Poser ton cadre');
    await expect(bulle(page).locator('.parcours-bulle-boutons button')).toHaveText(['Explorer la démo par moi-même', 'Terminer']);
    await expect(bulle(page).locator('.parcours-bulle-boutons button.btn-principal'), 'aucun bouton mis en avant').toHaveCount(0);
    await expect(bulle(page)).not.toContainText('parcours suivant');
    await expect(bulle(page)).not.toContainText('Commencer avec ma classe');
    await expect(bulle(page).locator('.parcours-bulle-atteint')).toContainText('Objectif atteint');

    // « Terminer » : le parcours est fait ; la démo, qu'il avait ouverte, se referme ; aucun parcours ne part.
    await bulle(page).getByRole('button', { name: 'Terminer', exact: true }).click();
    await expect(bulle(page)).toHaveCount(0);
    await expect.poll(() => page.evaluate(() => estEnModeDemo())).toBe(false);
    expect(await page.evaluate(() => window.Assistance.etatDe('decouvrir').etat)).toBe('fait');
    expect(await moteurActif(page)).toBe(false);
    // Fait, le menu ne porte plus de rang ; le panneau offre « Refaire », et toujours rien d'autre.
    await expect(page.locator('#assistance-menu-rang')).toHaveText('');
    await page.evaluate(() => window.ouvrirPanneauAssistance());
    await expect(page.locator('#panneau-assistance .assistance-parcours-bouton')).toHaveText(['Refaire']);

    // « Explorer la démo par moi-même » : la démo reste ouverte, aucun parcours ne part.
    await page.locator('#panneau-assistance [data-parcours="decouvrir"] .assistance-parcours-bouton').click();
    await expect(bulle(page).locator('.parcours-bulle-rang')).toHaveText('1 sur 8', { timeout: 15000 });
    await page.evaluate(() => window.ParcoursMoteur.allerA(7));
    await expect(bulle(page).locator('.parcours-bulle-rang')).toHaveText('8 sur 8');
    await bulle(page).getByRole('button', { name: 'Explorer la démo par moi-même', exact: true }).click();
    await expect(bulle(page)).toHaveCount(0);
    expect(await page.evaluate(() => estEnModeDemo())).toBe(true);
    expect(await moteurActif(page)).toBe(false);
});

test('le lien « Assistance » de « À propos » ouvre toujours le panneau', async ({ page }) => {
    await ouvrirEspaceVide(page);
    await page.locator('#banniere-bienvenue .apropos-lien', { hasText: 'Assistance' }).click();
    await expect(page.locator('#panneau-assistance #assistance-a-venir')).toBeVisible();
    await expect(page.locator('#panneau-assistance [data-parcours="decouvrir"]')).toBeVisible();
});
