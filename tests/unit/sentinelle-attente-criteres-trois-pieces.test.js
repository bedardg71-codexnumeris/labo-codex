import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Sentinelle LES TROIS PIÈCES DE L'ÉCRAN D'ÉVALUATION (1er septembre 2026, §4-1
// du PLAN-2026-09-01).
//
// L'écran d'évaluation a besoin de TROIS pièces pour rendre ses critères :
// grille (QUOI évaluer) + échelle (AVEC QUELS NIVEAUX) + cartouche (AVEC QUELS
// COMMENTAIRES). Son texte d'attente n'en nommait que DEUX — « Sélectionne une
// grille et une cartouche » — et omettait précisément la seule sans laquelle
// RIEN ne s'affiche. Un nouvel enseignant choisissait sa grille, ne voyait rien
// bouger, et le texte lui disait qu'il ne manquait qu'une cartouche.
//
// ⚠ CE QUE CE BANC GARDE, ET QU'AUCUNE RELECTURE NE TIENDRA : le texte vit à
// DEUX endroits (le littéral JS et le HTML statique d'`index.html`, qui ne peut
// appeler aucun JS pour son état initial). Deux sources dérivent toujours. Ici,
// elles ne peuvent plus : le banc exige qu'elles disent le même mot à le mot.
//
// Break-test mené le 1er septembre 2026, sur la source EN MÉMOIRE (jamais sur
// les fichiers de `js/`), les DEUX côtés mutés séparément :
//   · retirer « échelle de performance » du littéral JS   → A rougit ;
//   · remettre l'ancien texte à deux pièces dans index.html → B rougit ;
//   · changer un seul mot d'un seul des deux côtés         → B rougit.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');

const srcChargement = readFileSync(path.join(racine, 'js/evaluation-chargement.js'), 'utf8');
const srcEvaluation = readFileSync(path.join(racine, 'js/evaluation.js'), 'utf8');
const srcIndex = readFileSync(path.join(racine, 'index.html'), 'utf8');

/** Le littéral de MESSAGE_ATTENTE_CRITERES, tel qu'il est écrit dans le module. */
function litteralJs(source = srcChargement) {
    const m = source.match(/const MESSAGE_ATTENTE_CRITERES\s*=\s*'([^']+)'/);
    expect(m, 'MESSAGE_ATTENTE_CRITERES introuvable — le banc a perdu sa cible').not.toBeNull();
    return m[1];
}

/** Le texte visible du placeholder statique de #listeCriteresGrille1. */
function texteIndex(source = srcIndex) {
    const zone = source.match(/<div id="listeCriteresGrille1"[\s\S]*?<\/div>/);
    expect(zone, '#listeCriteresGrille1 introuvable dans index.html').not.toBeNull();
    // Les commentaires HTML citent le nom de la constante : les retirer AVANT
    // de lire le texte, sinon le banc lit sa propre note de bas de page.
    const sansCommentaires = zone[0].replace(/<!--[\s\S]*?-->/g, '');
    const p = sansCommentaires.match(/<p[^>]*>([\s\S]*?)<\/p>/);
    expect(p, 'aucun <p> de texte d\'attente dans #listeCriteresGrille1').not.toBeNull();
    return p[1].replace(/\s+/g, ' ').trim();
}

describe('§4-1 · le texte d\'attente de l\'écran d\'évaluation nomme ses TROIS pièces', () => {

    it('A · le littéral JS nomme la grille, l\'échelle ET la cartouche', () => {
        const texte = litteralJs();
        expect(texte, 'la grille n\'est pas nommée').toMatch(/grille/i);
        expect(texte, 'L\'ÉCHELLE n\'est pas nommée — c\'est le défaut d\'origine').toMatch(/échelle de performance/i);
        expect(texte, 'la cartouche n\'est pas nommée').toMatch(/cartouche/i);
    });

    it('B · index.html dit EXACTEMENT le même texte que le littéral JS', () => {
        expect(texteIndex()).toBe(litteralJs());
    });

    it('C · plus aucun site n\'écrit l\'ancien texte à deux pièces', () => {
        const ancien = 'Sélectionne une grille et une cartouche';
        expect(srcEvaluation, 'evaluation.js écrit encore le texte à deux pièces').not.toContain(ancien);
        expect(srcChargement, 'evaluation-chargement.js écrit le texte à deux pièces').not.toContain(ancien);
        // ⚠ index.html porte AUSSI l'aperçu PDF (`export-pdf.js`), un autre écran
        // avec son propre texte à deux pièces : on ne l'assèche pas ici, on borne
        // l'assertion à la zone des critères de l'évaluation.
        const zone = srcIndex.match(/<div id="listeCriteresGrille1"[\s\S]*?<\/div>/)[0];
        expect(zone).not.toContain(ancien);
    });

    it('D · les deux sites de evaluation.js passent par la source unique', () => {
        const appels = srcEvaluation.match(/window\.ecrireAttenteCriteres\(window\.MESSAGE_ATTENTE_CRITERES\)/g) || [];
        expect(appels.length, 'reinitialiserEvaluation ET reinitialiserFormulaire doivent y passer').toBe(2);
    });

    it('E · la constante et son écrivain sont exportés — sans quoi evaluation.js appelle du vide', () => {
        expect(srcChargement).toContain('window.MESSAGE_ATTENTE_CRITERES = MESSAGE_ATTENTE_CRITERES;');
        expect(srcChargement).toContain('window.ecrireAttenteCriteres = ecrireAttenteCriteres;');
    });
});
