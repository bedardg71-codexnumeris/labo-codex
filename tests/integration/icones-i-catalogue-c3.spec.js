import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { f6Html } from '../unit/_helpers/grilles-fictives-5b.js';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

// RELECTURE DE COWORK DU 17 OCT. 2026 (C3), dans un vrai WebKit : l'icône « i » du type de critère, dans
// Grilles de critères, désigne une clé du catalogue (`grille-type-critere-detail`) sans élément de ce
// nom ; elle n'ouvrait rien. Elle ouvre maintenant l'aide « Type de critère d'évaluation ».
// Chemin : la grille fictive F6 créée par « Apporter mon matériel », puis « La voir dans Grilles de
// critères ». Assistance active (le défaut).
// ⚠ 18 oct. 2026 (la dissection, lot 1) : l'assistant en sept étapes est DÉBRANCHÉ de l'onglet ; plus
// aucun collage ne l'ouvre. La grille se crée donc par les mêmes fonctions qu'il appelait (lecture,
// préparation, passages écartés, `materielCreation.creer`), puis s'ouvre comme `materiel.voir` l'ouvre.
// À re-router par la dissection quand elle créera (lot 2).

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

/** F6 lue, préparée, ses passages écartés, créée ; puis ouverte dans Grilles de critères. */
async function creerEtOuvrir(page, html) {
    const r = await page.evaluate(async (h) => {
        const lu = window.materielLecture.charger(window.materielLecture.lireHtml(h), 'colle');
        let m = window.materielAssistant.preparer(lu.modele);
        m.aClasser.forEach((a) => { m = window.materielAssistant.ecarter(m, a.id); });
        const cree = await window.materielCreation.creer(m);
        if (cree.erreur) return { erreur: cree.erreur };
        window.afficherSousSection('conception-grille-criteres');
        await window.ouvrirGrilleDepuisListe(cree.resume.ids.grille);
        return { erreur: null };
    }, html);
    expect(r.erreur).toBeNull();
}

test('C3 · dans Grilles de critères, le « i » du type de critère ouvre l’aide des trois types', async ({ page }) => {
    const erreurs = [], avertissements = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    page.on('console', (m) => { if (m.type() === 'warning' && /target non trouvé/.test(m.text())) avertissements.push(m.text()); });
    await ouvrirConception(page);
    expect(await page.evaluate(() => document.body.classList.contains('aide-contextuelle-active'))).toBe(true);
    await creerEtOuvrir(page, f6Html());

    const icone = page.locator('#listeCriteres .primo-aide[data-target="grille-type-critere-detail"]').first();
    await expect(icone).toBeVisible();
    await icone.click();
    const aide = page.locator('.aide-contextuelle-modal.active');
    await expect(aide).toBeVisible();
    await expect(aide.locator('#aide-ctx-titre')).toHaveText(/Type de critère d’évaluation/);
    await expect(aide.locator('.primo-popup-body')).toContainText('Algorithmique');
    await aide.locator('[data-action="fermerAideContextuelle"]').click();
    await expect(page.locator('.aide-contextuelle-modal.active')).toHaveCount(0);
    expect(avertissements).toEqual([]);
    expect(erreurs).toEqual([]);
});
