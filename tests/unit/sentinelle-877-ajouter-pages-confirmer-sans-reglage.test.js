import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// #877 (15 sept. 2026, 19 h 01) — « Je veux ajouter des pages à un pdf et rien
// ne se passe. »
//
// Parcours : éditeur de pages › « + Ajouter des pages » › choix du fichier ›
// poste de préparation en mode ad hoc (`queueOffset === -1`) › « Confirmer les
// réglages spécifiques » SANS avoir appliqué de réglage. `confirmer()` avait une
// sortie anticipée « rien à traiter » qui fermait la modale et rafraîchissait
// l'import — sans rappeler l'éditeur. Les pages n'étaient jamais insérées ;
// « Passer » fonctionnait, lui.
//
// Sentinelle STATIQUE, comme #559 : `ouvrir()` passe par du rendu canvas hors
// de portée d'un test unitaire. Elle verrouille l'invariant : dans la branche
// « rien à traiter », le mode ad hoc sort par `passer()` AVANT `fermer()`.
//
// Corps extrait jusqu'à la fonction SUIVANTE, commentaires retirés : une
// fenêtre fixe rougit au premier commentaire ajouté (leçon de #876 sur #314).

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const source = readFileSync(path.resolve(__dirname, '..', '..', 'js', 'travaux-preparation.js'), 'utf8');

function corpsDe(nomFonction) {
    const debut = source.search(new RegExp('(async )?function ' + nomFonction + '\\('));
    expect(debut, nomFonction + ' introuvable').toBeGreaterThan(-1);
    const suivante = source.indexOf('\n    function ', debut + 1);
    const suivanteAsync = source.indexOf('\n    async function ', debut + 1);
    const bornes = [suivante, suivanteAsync].filter(i => i > -1);
    const fin = bornes.length ? Math.min(...bornes) : undefined;
    return source.slice(debut, fin)
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\/\/.*$/gm, '');
}

describe('#877 — « Confirmer » sans réglage ajoute les pages en mode ad hoc', () => {

    it('la branche « rien à traiter » sort par passer() en mode ad hoc, AVANT fermer()', () => {
        const corps = corpsDe('confirmer');
        const branche = corps.match(/if \(aTraiter\.length === 0\) \{([\s\S]*?)\n        \}/);
        expect(branche, 'branche « rien à traiter » introuvable').not.toBeNull();
        const b = branche[1];
        expect(b).toMatch(/queueOffset\s*===\s*-1/);
        const posPasser = b.indexOf('passer()');
        const posFermer = b.indexOf('fermer()');
        expect(posPasser, 'passer() absent de la branche').toBeGreaterThan(-1);
        expect(posPasser, 'passer() doit précéder fermer()').toBeLessThan(posFermer);
    });

    it('passer() rappelle l\'éditeur avec les fichiers en mode ad hoc (ce sur quoi le correctif s\'appuie)', () => {
        const corps = corpsDe('passer');
        expect(corps).toMatch(/const modeAdHoc = \(queueOffset === -1\)/);
        expect(corps).toContain('callbackToCall(fichiersCopie)');
    });

    it('contrôle : hors mode ad hoc, la branche ferme et rafraîchit l\'import comme avant', () => {
        const corps = corpsDe('confirmer');
        const branche = corps.match(/if \(aTraiter\.length === 0\) \{([\s\S]*?)\n        \}/)[1];
        expect(branche).toContain('fermer()');
        expect(branche).toContain('rafraichirImportTravaux');
    });
});
