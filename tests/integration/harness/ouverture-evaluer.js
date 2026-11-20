/**
 * Les deux boutons de l'exemple, sur la page d'accueil de « Mon matériel » (renommés le 14 nov. 2026).
 *
 * 20 nov. 2026 (plans de travail/CONSIGNE-2026-11-20-essai-parcours.md, section D) : `passerLOuverture` est retiré. Les
 * deux bulles d'ouverture d'« Évaluer une première production » (« Pourquoi étiqueter », « Tu apprends aussi ») sont
 * parties avec l'ancienne étape 1 ; l'étiquetage est la bulle 5 du « Nous faisons » neuf, que joue
 * `harness/nous-faisons-evaluer-de-banc.js`. Les bancs de l'étiquetage entrent par la page (la carte « Ta grille, pas
 * à pas », `ouvrirLaCarteDeLaPage`) ou par cette bulle 5.
 */
import { expect } from '@playwright/test';
import { ouvrirEspaceVide, bulle } from './classe-de-banc.js';

export const boutonExemple = (page, lequel) => page.locator('#materiel-accueil [data-action="materiel.ouvrirExemple"][data-param="' + lequel + '"]');

/** Le titre de la carte d'aide de la page (`js/materiel-aide.js`). */
export const TITRE_DE_LA_CARTE = 'Ta grille, pas à pas';

/**
 * Un espace vide, en vue étendue, où la personne a laissé allumé l'interrupteur « M'accompagner pour étiqueter ma
 * grille » ; puis Conception › « Mon matériel », devant la carte d'aide de la page (sans parcours : aucun « n sur N »).
 * La carte porte la ligne du geste, le complément, les flèches et le halo de `js/materiel-aide.js` : ce que portait
 * l'ancienne étape 1 du parcours devant l'étiquetage.
 */
export async function ouvrirLaCarteDeLaPage(page, largeur, hauteur) {
    await page.addInitScript(() => {
        try { if (!localStorage.getItem('laboCodex.aideMateriel')) localStorage.setItem('laboCodex.aideMateriel', JSON.stringify({ ouvert: true })); } catch (e) { /* rien */ }
        try { if (!localStorage.getItem('laboCodex.vue')) localStorage.setItem('laboCodex.vue', 'etendue'); } catch (e) { /* rien */ }
    });
    await ouvrirEspaceVide(page, largeur, { hauteur });
    await page.evaluate(() => naviguerVers('conception', 'materiel'));
    await expect(bulle(page).locator('.parcours-bulle-titre')).toHaveText(TITRE_DE_LA_CARTE, { timeout: 10000 });
    await expect(bulle(page).locator('.parcours-bulle-rang')).toHaveCount(0);
    await expect(page.locator('#materiel-accueil')).toBeVisible();
}
