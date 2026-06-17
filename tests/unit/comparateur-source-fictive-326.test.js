import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// #326 R4a — le banc tourne sur des PROFILS FICTIFS GÉNÉRÉS (R2) injectés en
// lecture seule, par défaut, sans mode démo. Sentinelle STATIQUE : le rendu DOM du
// comparateur n'est pas exerçable en sandbox Node → on verrouille le CÂBLAGE par
// lecture de source (break-testable). La justesse visuelle = passe terrain (R6).

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = readFileSync(path.resolve(__dirname, '..', '..', 'js', 'comparateur-pratiques.js'), 'utf8');

describe('#326 R4a · source fictive générée + injection', () => {
    it('le corpus fictif est généré par R2 (ProfilsTypesGenerateur.genererCorpus)', () => {
        expect(src).toMatch(/function _corpusActif\(\)/);
        expect(src).toMatch(/ProfilsTypesGenerateur\.genererCorpus\(/);
    });

    it('l\'échelle qui pilote les profils est résolue (pratique de réf, sinon 1ʳᵉ échelle)', () => {
        expect(src).toMatch(/function _echelleActiveComparateur\(\)/);
        expect(src).toMatch(/echellesTemplates/);
    });

    it('les notes passent par simulerIndices AVEC le corpus injecté', () => {
        const i = src.indexOf('function _note(');
        const bloc = src.slice(i, i + 250);
        expect(bloc).toMatch(/simulerIndices\(da, pratiqueId, _corpusInjection\(\)\)/);
    });

    it('le récit de la fiche injecte aussi le corpus', () => {
        expect(src).toMatch(/simulerIndices\(da, c\.id, _corpusInjection\(\)\)/);
    });

    it('la matrice itère les profils ACTIFS (générés ou repli démo)', () => {
        expect(src).toMatch(/_profilsActifs\(\)\.forEach/);
        expect(src).toMatch(/function _profilsActifs\(\)/);
    });

    it('_donnees lit le corpus en source fictive (colonne niveau / fiche)', () => {
        const i = src.indexOf('function _donnees(');
        const bloc = src.slice(i, i + 600);
        expect(bloc).toMatch(/var corpus = _corpusActif\(\)/);
        expect(bloc).toMatch(/productions: corpus\.productions/);
    });

    it('rendreComparateur ne dépend plus du mode démo (garde = corpus disponible)', () => {
        // l'ouverture conditionne la vue sur _corpusActif(), pas sur estEnDemo()
        const i = src.indexOf("hote.innerHTML = '<div id=\"exploration-arbre-hote\">");
        const bloc = src.slice(i, i + 700);
        expect(bloc).toMatch(/if \(_corpusActif\(\)\)/);
        expect(bloc).not.toMatch(/if \(estEnDemo\(\)\)/);
    });

    it('l\'injection reste lecture seule : aucune écriture db dans le module comparateur', () => {
        expect(src).not.toMatch(/db\.setSync|db\.set\(/);
    });
});
