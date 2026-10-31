import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// =======================================================================
// TRAVAUX — la suppression d'une copie avec son évaluation
// ne perd plus les évaluations des AUTRES cours du trimestre (relecture croisée R3 du lot A
// de l'enregistrement, 26 sept. 2026 ; fiche #958).
// =======================================================================
//
// Avant : les deux gestes lisaient les évaluations par `obtenirDonneesSelonMode` — filtrées par le
// cours actif (et anonymisées en anonymisation) — puis réécrivaient la clé ENTIÈRE avec ce tableau.
// En mode normal, toutes les évaluations des autres cours du trimestre disparaissaient.
// Maintenant : lecture de la base brute. Le pack démo n'a aucune copie : fixture, deux cours.
//
// ⚠ Chaque essai part d'un stockage VIDÉ (les specs partagent l'origine file://). Noms fictifs.

async function fixtureDeuxCours(page) {
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
    await page.waitForFunction(() => window.travauxUI && window.travauxStockage && typeof window.db !== 'undefined', null, { timeout: 30000 });
    page.on('dialog', (d) => d.accept().catch(() => {}));
    await page.evaluate(() => {
        const k = (b) => cle(b);
        // security-ok: fixtures littérales du banc, aucune source externe.
        db.setSync('trimestres', [{ id: 'a2026', nom: 'Automne 2026', annee: 2026, session: 'A', actif: true }]);
        db.setSync('trimestreActif', 'a2026');
        db.setSync('cours', [{ id: 'C1', code: '601-101', nom: 'Cours un' }, { id: 'C2', code: '601-102', nom: 'Cours deux' }]);
        db.setSync('infoCours', { id: 'C1', code: '601-101', nom: 'Cours un' });
        db.setSync(k('groupeEtudiants'), [
            { da: '1234567', prenom: 'Daniel', nom: 'Témoin', groupe: '00001', coursId: 'C1' },
            { da: '7654321', prenom: 'Estelle', nom: 'Voisine', groupe: '00002', coursId: 'C2' }
        ]);
        db.setSync(k('fichiersTravaux'), [{ id: 'F1', etudiantDA: '1234567', productionId: 'P1', nomFichier: 'copie.pdf', coursId: 'C1' }]);
        db.setSync(k('evaluationsSauvegardees'), [
            { id: 'EV_C1', coursId: 'C1', etudiantDA: '1234567', etudiantNom: 'Daniel Témoin', groupe: '00001', productionId: 'P1',
              productionNom: 'Portrait', grilleNom: 'Grille', noteFinale: 80, niveauFinal: 'M', criteres: [],
              retroactionFinale: 'Daniel, première version.', dateEvaluation: '2026-09-10T10:00:00.000Z', verrouillee: false },
            { id: 'EV_C2', coursId: 'C2', etudiantDA: '7654321', etudiantNom: 'Estelle Voisine', groupe: '00002', productionId: 'P9',
              productionNom: 'Essai', grilleNom: 'Grille', noteFinale: 70, niveauFinal: 'D', criteres: [],
              retroactionFinale: 'Autre cours.', dateEvaluation: '2026-09-11T10:00:00.000Z', verrouillee: false }
        ]);
    });
}

const lireEvaluations = (page) => page.evaluate(() => db.getSync(cle('evaluationsSauvegardees'), []) || []);

// 31 oct. 2026 — les deux essais de la bulle « Rétroaction » partent avec elle (consigne des palettes, partie G) : elle
// n'a plus d'écriture à juger. La lecture brute reste jugée ci-dessous par la suppression ; la garde d'anonymisation
// des écritures, par `lot-a-anonymisation-enregistre.spec.js`.

test('supprimer une copie avec son évaluation : l\'évaluation de l\'autre cours survit', async ({ page }) => {
    await fixtureDeuxCours(page);
    // #1007 (2a-2) : doublure « codex à jour ». Ce banc juge la lecture brute, pas la proposition du
    // codex (jugée par sentinelle-1007-propose-codex) ; sans elle, la fenêtre attend une réponse.
    await page.evaluate(() => { Codex.proposerAvantSuppression = async () => true; });
    await page.evaluate(async () => { await travauxUI.supprimerFichierImporte('F1'); });

    const evals = await lireEvaluations(page);
    expect(evals.map(e => e.id)).toEqual(['EV_C2']);
});

