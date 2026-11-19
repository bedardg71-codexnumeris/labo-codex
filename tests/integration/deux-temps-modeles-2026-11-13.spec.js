import { test, expect } from '@playwright/test';
import { releverLaBulle } from './harness/releve-bulle.js';
// La bulle ne couvre jamais ses zones quand une place les laisse libres (Grégoire, 11 nov. 2026) : relevé à chaque essai.
releverLaBulle(test);
import {
    ouvrirEspaceVide, ouvrirPanneau, boutonModele, boutonPratique, bulle, carte, enDemo, peuplerUnTrimestreReel, materiel,
    lireBulle, REMPLIR
} from './harness/deux-temps-de-banc.js';

// =======================================================================
// LOT « LES DEUX TEMPS, LES MODÈLES » (13 NOVEMBRE 2026) — REMIS À JOUR LE 15 NOVEMBRE 2026
// =======================================================================
// Consignes : `plans de travail/CONSIGNE-LOT-2026-11-13-deux-temps-modeles.md`, puis
// `plans de travail/CONSIGNE-2026-11-15-deux-temps-remise-a-jour.md`. Sous WebKit, aux deux orientations de l'iPad
// (1180 × 820 et 820 × 1180).
//   A · le panneau : la liste de dix ; le modèle d'« Évaluer » refuse tant que le deuxième groupe n'existe pas, nomme
//       « Mettre ta classe en place » et met la pulsation sur le bouton de SA Modélisation ; « Le refaire avec ma
//       classe » lance la Pratique guidée par les gardes du panneau.
//   B · (le modèle de bout en bout) : RETIRÉ le 18 nov. 2026 avec l'ancien ordre à neuf étapes. Le modèle refait à
//       dix étapes a son banc : `je-regarde-evaluer-2026-11-18.spec.js`.

const ORIENTATIONS = [[1180, 820], [820, 1180]];

test('« Le refaire avec ma classe » passe par les gardes du panneau : sans classe, le panneau dit pourquoi ; avec, la Pratique guidée part sur les vraies données', async ({ page }) => {
    test.setTimeout(180000);
    await ouvrirEspaceVide(page, 1180, 820);
    const refaire = () => page.evaluate(() => ParcoursClasse.suitesDuModele('evaluer', () => {})[0].action());
    // « Recevoir » a son modèle depuis le 17 nov. 2026 : la fin d'« Évaluer » offre « Voir le parcours suivant ».
    expect(await page.evaluate(() => ParcoursClasse.suitesDuModele('evaluer', () => {}).map((b) => b.libelle))).toEqual(['Le refaire avec ma classe', 'Voir le parcours suivant', 'Terminer']);
    // Sans classe en place : rien ne part ; le panneau s'ouvre et nomme le préalable.
    await refaire();
    await expect(page.locator('#panneau-assistance')).toBeVisible();
    await expect(carte(page, 'evaluer').locator('.assistance-parcours-refus')).toContainText('Mettre ta classe en place');
    await expect(bulle(page)).toHaveCount(0);
    await page.evaluate(() => Assistance.fermerPanneau());
    // Avec une classe : la Pratique guidée part, sur les vraies données.
    await peuplerUnTrimestreReel(page);
    await refaire();
    await expect(bulle(page).locator('.parcours-bulle-rang')).toHaveText('1 sur 9', { timeout: 10000 });
    expect(await enDemo(page)).toBe(false);
    expect(await page.evaluate(() => Assistance.etatDe('evaluer').etat)).toBe('en-cours');
    expect((await lireBulle(page)).boutons, 'en Pratique guidée, la bulle ne remplit rien').not.toContain(REMPLIR);
    await page.evaluate(() => ParcoursMoteur.fermer());
});

for (const [L, H] of ORIENTATIONS) {
    test(`A · ${L} × ${H} : la liste de dix, le refus du modèle d’« Évaluer » sans le deuxième groupe, la pulsation sur la Modélisation à faire d’abord`, async ({ page }) => {
        test.setTimeout(120000);
        await ouvrirEspaceVide(page, L, H);
        await ouvrirPanneau(page);
        expect((await materiel(page)).etudiants).toHaveLength(10);
        for (const b of [boutonModele(page, 'classe'), boutonPratique(page, 'classe'), boutonModele(page, 'evaluer'), boutonPratique(page, 'evaluer')]) {
            expect((await b.boundingBox()).height).toBeGreaterThanOrEqual(44);
            expect(await b.evaluate((el) => el.scrollWidth <= el.clientWidth + 1), 'le libellé tient dans son bouton').toBe(true);
        }
        // Rien ne déborde du panneau, aux deux orientations.
        expect(await page.locator('#panneau-assistance').evaluate((p) => p.scrollWidth <= p.clientWidth + 1)).toBe(true);

        // Le modèle d'« Évaluer » : son préalable est la Modélisation de « Mettre ta classe en place ».
        // Break-test (13 nov. 2026) : `refusModele` retiré de l'enregistrement → ROUGE (le refus manque). Rétabli → vert.
        await expect(boutonModele(page, 'evaluer')).not.toHaveAttribute('aria-disabled', 'true');
        await boutonModele(page, 'evaluer').click();
        await expect(carte(page, 'evaluer').locator('.assistance-parcours-refus')).toContainText('Mettre ta classe en place');
        await expect(boutonModele(page, 'classe')).toHaveClass(/assistance-parcours-bouton--appel/);
        await expect(boutonPratique(page, 'classe')).not.toHaveClass(/assistance-parcours-bouton--appel/);
        await expect(bulle(page)).toHaveCount(0);
        expect(await enDemo(page)).toBe(false);
    });
}
