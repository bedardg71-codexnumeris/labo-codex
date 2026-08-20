import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';

// =======================================================================
// SENTINELLE #459 — dupliquer DIT ce qu'il fait, un ⇧ ignoré se signale
// =======================================================================
//
// Terrain du 20 août 2026 (porte types-familles, rangée 1.2) : Grégoire
// tient ⇧⌥ sur une LEÇON et obtient « Copie indépendante créée » — il
// conclut que ⇧⌥ ne clone pas du tout. Le mécanisme était sain (un
// conteneur se copie TOUJOURS, décision du 6 août ; le clone est réservé
// aux feuilles — prouvé au Chromium : feuille+⇧ → cloneSourceId posé),
// mais l'app avalait son ⇧ sans un mot, et le chemin feuille était MUET
// des deux côtés (seul l'indicateur 🧬 distinguait clone et copie).
//
// Ce qui est verrouillé (statique, source sans commentaires, motifs ancrés) :
//   A. la branche conteneur TRANSMET `lie` — sans quoi le toast ne peut
//      pas savoir qu'un clone a été demandé ;
//   B. le toast conteneur a ses DEUX variantes, et celle du ⇧ ignoré dit
//      pourquoi (« ne se clone jamais … réservé aux blocs simples ») ;
//   C. le chemin feuille annonce le clone (« Clone lié créé ») — il était
//      muet, et un clone silencieux est indiscernable d'une copie.

function source() {
    return readFileSync(new URL('../../js/planification-carte.js', import.meta.url), 'utf-8')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\/\/[^\n]*/g, '');
}

describe('#459 · dupliquer dit ce qu\'il fait', () => {

    it('A · la branche conteneur transmet `lie` au chemin profond', () => {
        const s = source();
        expect(s).toMatch(/return dupliquerConteneurEnProfondeur\(noeudId, silencieux, lie\);/);
        expect(s).toMatch(/^function dupliquerConteneurEnProfondeur\(noeudId, silencieux, cloneDemande\)/m);
    });

    it('B · le toast conteneur a ses deux variantes, et le ⇧ ignoré se dit', () => {
        const s = source();
        expect(s).toMatch(/cloneDemande\s*\n?\s*\?\s*'Copie indépendante créée — une leçon ou une séquence ne se clone jamais/);
        expect(s).toMatch(/réservé aux blocs simples/);
    });

    it('C · le chemin feuille annonce le clone créé', () => {
        const s = source();
        expect(s).toMatch(/cloneSourceId\s*\n?\s*\?\s*'Clone lié créé/);
    });
});
