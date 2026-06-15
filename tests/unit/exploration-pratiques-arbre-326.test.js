import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// Axe D — Exploration des pratiques (#326), lot D-0.
// `construireArbrePratiques` (pur) reconstruit la forêt de filiation par
// `inspireDe.sourceId` : souches (racines) → variantes → sous-variantes.
// Invariants visés (SPEC §3.1/§5) :
//   - une souche = pas de sourceId, ou source absente (filiation orpheline /
//     legacy sans id) ;
//   - profondeur libre ;
//   - jamais de perte de pratique ni de boucle infinie sur un cycle.

function charger() {
    return chargerScript('js/pratiques/pratiques-exploration.js');
}

function idsRacines(foret) {
    return foret.map((n) => n.pratique.id).sort();
}

describe('Exploration des pratiques · arbre de filiation (D-0)', () => {
    it('regroupe les variantes sous leur souche via inspireDe.sourceId', () => {
        const { ExplorationPratiques } = charger();
        const pratiques = [
            { id: 'souche', nom: 'Souche' },
            { id: 'v1', nom: 'Variante 1', inspireDe: { sourceId: 'souche' } },
            { id: 'v2', nom: 'Variante 2', inspireDe: { sourceId: 'souche' } },
            { id: 'v1a', nom: 'Sous-variante', inspireDe: { sourceId: 'v1' } }
        ];
        const foret = ExplorationPratiques.construireArbrePratiques(pratiques);

        expect(idsRacines(foret)).toEqual(['souche']);
        const racine = foret[0];
        expect(racine.enfants.map((n) => n.pratique.id).sort()).toEqual(['v1', 'v2']);
        const v1 = racine.enfants.find((n) => n.pratique.id === 'v1');
        expect(v1.enfants.map((n) => n.pratique.id)).toEqual(['v1a']); // profondeur libre
    });

    it('traite comme racine une filiation legacy sans sourceId', () => {
        const { ExplorationPratiques } = charger();
        const pratiques = [
            { id: 'a', nom: 'A' },
            // filiation antérieure {nom, auteur, date} sans id → ignorée (racine)
            { id: 'b', nom: 'B', inspireDe: { nom: 'A', auteur: 'X', date: '2026-01-01' } }
        ];
        const foret = ExplorationPratiques.construireArbrePratiques(pratiques);
        expect(idsRacines(foret)).toEqual(['a', 'b']);
        expect(foret.every((n) => n.enfants.length === 0)).toBe(true);
    });

    it('promeut en racine une variante dont la source est absente du jeu', () => {
        const { ExplorationPratiques } = charger();
        const pratiques = [
            { id: 'orpheline', nom: 'Orpheline', inspireDe: { sourceId: 'disparue' } }
        ];
        const foret = ExplorationPratiques.construireArbrePratiques(pratiques);
        expect(idsRacines(foret)).toEqual(['orpheline']);
    });

    it('ne boucle pas et ne perd aucune pratique sur un cycle', () => {
        const { ExplorationPratiques } = charger();
        const pratiques = [
            { id: 'a', nom: 'A', inspireDe: { sourceId: 'b' } },
            { id: 'b', nom: 'B', inspireDe: { sourceId: 'a' } }
        ];
        const foret = ExplorationPratiques.construireArbrePratiques(pratiques);
        // Toutes les pratiques restent atteignables (aucune perdue).
        const tous = new Set();
        (function parcourir(ns) { ns.forEach((n) => { tous.add(n.pratique.id); parcourir(n.enfants); }); })(foret);
        expect([...tous].sort()).toEqual(['a', 'b']);
    });

    it('renvoie une forêt vide sur une entrée vide ou invalide', () => {
        const { ExplorationPratiques } = charger();
        expect(ExplorationPratiques.construireArbrePratiques([])).toEqual([]);
        expect(ExplorationPratiques.construireArbrePratiques(null)).toEqual([]);
        expect(ExplorationPratiques.construireArbrePratiques(undefined)).toEqual([]);
    });
});
