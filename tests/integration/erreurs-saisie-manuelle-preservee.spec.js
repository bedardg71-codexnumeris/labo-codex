import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// Sentinelle (terrain, 3 juin 2026) — Le nombre d'erreurs saisi À LA MAIN dans
// un critère algorithmique ne doit PAS être écrasé par 0 quand aucun tampon
// d'erreur (errfr_*) n'est posé. mettreAJourCompteursErreurs propageait son
// total sans condition (total = 0 sans tampons) et était appelée avant chaque
// sauvegarde (_forcerRecalculAlgorithmiqueAvantSauvegarde), effaçant la saisie.
//
// Zone fragile : un fix défensif voisin (#110 v3) a déjà été perdu lors d'un
// refactoring. Cette sentinelle verrouille la garde `total > 0`.

test('Sentinelle · saisie manuelle du nombre d\'erreurs préservée quand aucun tampon (total=0)', async ({ page }) => {
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(400);

    const r = await page.evaluate(() => {
        if (typeof window.travauxOutils === 'undefined'
            || typeof window.travauxOutils.mettreAJourCompteursErreurs !== 'function'
            || typeof window.travauxOutils.compterErreursFrancais !== 'function') {
            return { erreur: 'travauxOutils.mettreAJourCompteursErreurs absent' };
        }

        // Préparer le DOM minimal attendu par la fonction :
        // - la palette des codes d'erreurs (sinon early-return) ;
        // - un champ « Nombre d'erreurs » d'un critère algorithmique, saisi à la main.
        if (!document.getElementById('travaux-palette-erreurs-fr')) {
            const pal = document.createElement('div');
            pal.id = 'travaux-palette-erreurs-fr';
            document.body.appendChild(pal);
        }
        const input = document.createElement('input');
        input.type = 'number';
        input.id = 'eval_erreurs_SENTINELLE';
        input.value = '12'; // saisie manuelle de l'enseignant·e
        document.body.appendChild(input);

        // Précondition : aucun tampon d'erreur → total doit être 0.
        const compteurs = window.travauxOutils.compterErreursFrancais();
        const total = Object.keys(compteurs).reduce((s, k) => s + (compteurs[k] || 0), 0);

        // Appel direct (équivalent de ce que fait _forcerRecalculAlgorithmique-
        // AvantSauvegarde avant chaque sauvegarde).
        window.travauxOutils.mettreAJourCompteursErreurs();

        return { total, valeurApres: document.getElementById('eval_erreurs_SENTINELLE').value };
    });

    expect(r.erreur, `Erreur eval : ${r.erreur}`).toBeUndefined();
    // Précondition : aucun tampon.
    expect(r.total).toBe(0);
    // La saisie manuelle « 12 » doit être préservée (et NON écrasée par 0).
    expect(r.valeurApres).toBe('12');
});
