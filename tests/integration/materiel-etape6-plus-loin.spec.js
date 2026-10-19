import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');
// 19 oct. 2026 : l'assistant en sept étapes est RETIRÉ ; la confirmation et « Aller plus loin » restent (la
// dissection y aboutit). La grille en points se crée désormais par la création réelle (`materielCreation.creer`),
// à partir du modèle que l'assistant en produisait, figé ; la confirmation s'ouvre par `materiel.montrerCreee`.
const EN_POINTS = JSON.parse(readFileSync(path.join(__dirname, '..', 'fixtures', 'materiel', 'modeles-assistant-figes.json'), 'utf8')).modeles['plus-loin · en points'];

// « APPORTER MON MATÉRIEL », ÉTAPE 6 DU PLAN « PRÊT POUR LUNDI » (consigne du 17 oct. 2026), dans un vrai WebKit.
//
//   · une grille en points créée → sa confirmation → l'encadré « Aller plus loin avec ta grille »
//     paraît sous les cartes ; son lien ouvre l'aide existante « Type de critère d'évaluation »,
//     l'assistance active (le défaut) comme désactivée (bouton « Assistance ») ; « Fermer » la referme.
// ⛔ Textes inventés : aucun mot d'une grille réelle.

async function ouvrirConception(page) {
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForFunction(() => window.dbReady === true, null, { timeout: 20000 });
    await page.evaluate(() => {
        db.setSync('trimestres', [{ id: 'a2032', nom: 'Automne 2032', actif: true }]);
        db.setSync('trimestreActif', 'a2032');
        db.setSync('backupNePlusRappeler', 'true');
    });
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForFunction(() => window.dbReady === true, null, { timeout: 20000 });
    // Un témoin, pas un délai : le dernier drapeau des migrations de démarrage (main.js, auDbReady)
    // et la zone de collage qui écoute « coller » (materiel.js, au DOMContentLoaded).
    await page.waitForFunction(() => !!db.getSync('migration_pratiqueId_to_configurable_id_done', false)
        && document.getElementById('materiel-zone-collage')?.dataset.materielBranche === '1', null, { timeout: 20000 });
    await page.evaluate(() => window.afficherSection('conception'));
    await expect(page.locator('#conception-materiel')).toBeVisible();
}

/** La grille créée, puis sa confirmation — le chemin de la dissection, lot 2a. */
async function creerEtConfirmer(page, modele) {
    const erreur = await page.evaluate(async (m) => {
        const r = await window.materielCreation.creer(m);
        if (r.erreur) return r.erreur;
        window.materiel.montrerCreee(r.resume);
        return null;
    }, modele);
    expect(erreur).toBeNull();
}

for (const assistance of [true, false]) test('étape 6 · après une grille en points, « Aller plus loin » paraît et son lien ouvre l’aide des trois types — assistance ' + (assistance ? 'active' : 'désactivée'), async ({ page }) => {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    await ouvrirConception(page);
    await page.evaluate((a) => window.accompagnement.definirActif(a), assistance);
    expect(await page.evaluate(() => document.body.classList.contains('aide-contextuelle-active'))).toBe(assistance);
    await creerEtConfirmer(page, EN_POINTS);
    await expect(page.locator('#materiel-titre-cree')).toBeVisible();

    const encadre = page.locator('.materiel-plus-loin');
    await expect(encadre).toBeVisible();
    await expect(encadre.locator('h3')).toHaveText('Aller plus loin avec ta grille');
    await expect(encadre.locator('p')).toHaveText([
        'Ta grille note chaque critère en points. Labo Codex pourrait t’aider à suivre la progression de tes étudiant·es à partir d’elle, par exemple en décrivant, pour un critère, ce qu’on attend à chaque niveau.',
        'Un critère peut s’évaluer de trois façons : holistique (par niveaux), analytique (par points) ou algorithmique (par un calcul).'
    ]);
    const lien = encadre.getByRole('button', { name: 'Les trois façons d’évaluer un critère' });
    await expect(lien).toBeVisible();
    const boite = await lien.boundingBox();
    expect(boite.height).toBeGreaterThanOrEqual(44);   // cible tactile (iPad)

    await lien.click();
    const aide = page.locator('.aide-contextuelle-modal.active');
    await expect(aide).toBeVisible();
    await expect(aide.locator('#aide-ctx-titre')).toHaveText(/Type de critère d’évaluation/);
    await expect(aide.locator('.primo-popup-body')).toContainText('Holistique');
    await expect(aide.locator('.primo-popup-body')).toContainText('Analytique');
    await expect(aide.locator('.primo-popup-body')).toContainText('Algorithmique');
    await aide.locator('[data-action="fermerAideContextuelle"]').click();
    await expect(page.locator('.aide-contextuelle-modal.active')).toHaveCount(0);
    await expect(page.locator('#materiel-titre-cree')).toBeVisible();
    expect(erreurs).toEqual([]);
});
