import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// Règles 1 et 5 de CLAUDE.md (consigne de Cowork du 2 oct. 2026, 17 h 56, volet B) — LA FENÊTRE
// DES RAPPORTS DE BUG ARCHIVÉS N'INTERPRÈTE RIEN DE CE QU'ELLE AFFICHE.
//
// Mesuré à l'inventaire de #1007 : `ouvrirModalRapportsArchives` (js/rapport-bug.js) injectait le
// prénom, la description et l'id d'un rapport bruts, l'id dans un attribut `data-param`. Ces
// archives voyagent dans le codex : un codex reçu pouvait porter un prénom qui crée un élément.
//
// Ce banc ouvre la vraie fenêtre sur une archive dont chaque champ porte du HTML, et juge le DOM :
// aucun élément créé, aucun gestionnaire exécuté, aucun attribut ajouté, le texte lu tel quel, et
// les deux boutons rendent l'id d'origine au dispatcher.

const PIEGE_PRENOM = '<img src=x onerror="window.__piege=\'prenom\'">';
const PIEGE_DESCRIPTION = '<img src=y onerror="window.__piege=\'description\'"><b>gras</b>';
const PIEGE_ID = 'RB_1" data-injecte="oui';

test('les champs d\'une archive sortent échappés : aucun élément créé', async ({ page }) => {
    page.setDefaultTimeout(15000);
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    const rendu = await page.evaluate(async ({ prenom, description, id }) => {
        db.setSync('rapportsBugArchives', [{ id, prenom, description, date: '<i>date</i>', rapport: 'texte', type: 'bug' }]);
        ouvrirModalRapportsArchives();
        await new Promise((r) => setTimeout(r, 300));
        const modale = document.getElementById('modalRapportsArchives');
        const carte = modale.querySelector('#listeRapportsArchives > div');
        return {
            piege: window.__piege || null,
            imagesInjectees: modale.querySelectorAll('img[src="x"], img[src="y"]').length,
            gras: carte.querySelectorAll('b, i').length,
            attributsInjectes: modale.querySelectorAll('[data-injecte]').length,
            prenomLu: carte.querySelector('strong').textContent,
            descriptionLue: carte.querySelector('p').textContent.trim(),
            params: Array.from(carte.querySelectorAll('button[data-param]')).map((b) => b.dataset.param)
        };
    }, { prenom: PIEGE_PRENOM, description: PIEGE_DESCRIPTION, id: PIEGE_ID });

    expect(rendu.piege, 'aucun gestionnaire exécuté').toBeNull();
    expect(rendu.imagesInjectees, 'aucune image créée par le prénom ni la description').toBe(0);
    expect(rendu.gras, 'aucune balise de la description ni de la date').toBe(0);
    expect(rendu.attributsInjectes, 'l\'id ne referme pas son attribut').toBe(0);
    expect(rendu.prenomLu).toBe(PIEGE_PRENOM);
    expect(rendu.descriptionLue).toBe(PIEGE_DESCRIPTION);
    expect(rendu.params, 'les boutons rendent l\'id d\'origine').toEqual([PIEGE_ID, PIEGE_ID]);
});
