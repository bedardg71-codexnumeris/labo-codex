import { expect } from '@playwright/test';

/**
 * 14 nov. 2026 (essai novice de Grégoire, lot 4b) — « Évaluer une première production » s'ouvre sur deux bulles,
 * « Pourquoi étiqueter » puis « Tu apprends aussi », avant « Ta grille ». La bulle n'offre plus l'exemple ni
 * « Passer à ma grille » (lot 4c : ses deux boutons sont sur la page). Les bancs qui commencent le parcours passent
 * par ici : deux fois « Continuer », jusqu'à « Ta grille », devant l'accueil de « Mon matériel ».
 */
export async function passerLOuverture(page) {
    const bulle = page.locator('#parcours-bulle');
    for (const titre of ['Pourquoi étiqueter', 'Tu apprends aussi']) {
        await expect(bulle.locator('.parcours-bulle-titre')).toHaveText(titre, { timeout: 10000 });
        await expect(bulle.locator('.parcours-bulle-rang')).toHaveText('1 sur 9');
        await bulle.getByRole('button', { name: 'Continuer' }).click();
    }
    await expect(bulle.locator('.parcours-bulle-titre')).toHaveText('Ta grille', { timeout: 10000 });
}

/** Les deux boutons de l'exemple, sur la page d'accueil de « Mon matériel » (renommés le 14 nov. 2026). */
export const boutonExemple = (page, lequel) => page.locator('#materiel-accueil [data-action="materiel.ouvrirExemple"][data-param="' + lequel + '"]');
