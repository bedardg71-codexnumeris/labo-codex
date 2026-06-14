import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

// #338 — ablation du vieil éditeur de pratique de notation mort (1er passage,
// 14 juin 2026). Les ids DOM de l'ancien formulaire « Pratique de notation »
// (#pratiqueNotation, #typePAN, #btnSauvegarderPratiqueNotation…) n'existent
// plus nulle part : les fonctions qui les servaient tournaient à vide derrière
// des gardes getElementById null. Le 1er passage retire UNIQUEMENT le
// sous-graphe 100 % mort (cœur sûr) ; la « zone grise » appelée par un init
// vivant mais no-op sur DOM absent (chargerModalites, afficherCartesExtras,
// toggleConfig*, la branche v2) est reportée au 2e passage.
//
// Ce verrou couvre deux choses (cf. feedback-fix-perdu-refactoring-extraction :
// tout retrait de dette doit être verrouillé contre la réintroduction) :
//   1. les 8 symboles morts ne reviennent pas dans pratiques.js ;
//   2. le bug dormant `sauvegarderDansConfiguration(cle, …)` — où le paramètre
//      `cle` MASQUAIT la fonction globale window.cle, ce qui aurait crashé
//      (`"portfolio"(...)` n'est pas une fonction) si la fonction avait tourné —
//      ne réapparaît pas.

const SYMBOLES_RETIRES = [
    'attacherEvenementsPratiques',
    'changerPratiqueNotation',
    'afficherConfigurationPAN',   // version sans argument (ombrée par celle à param)
    'updateDescriptionModalite',
    'sauvegarderConfigurationPAN',
    'sauvegarderPratiqueNotation',
    'sauvegarderDansConfiguration'
];

// Fonctions de la « zone grise » + vivantes qui DOIVENT rester (le 1er passage
// ne doit pas les emporter — elles sont atteintes par l'init vivant ou par
// d'autres modules).
const SYMBOLES_CONSERVES = [
    'afficherInfoPAN',
    'afficherOptionsAffichage',
    'afficherParametresPAN',      // rendu en data-action par mettreAJourStatutModalites
    'toggleConfigJetons',
    'toggleConfigPortfolio',
    'afficherCartesExtras',
    'chargerModalites',
    'mettreAJourStatutModalites'
];

let source;

beforeAll(() => {
    source = readFileSync(path.join(racine, 'js/pratiques.js'), 'utf8');
});

describe('#338 · ablation du vieil éditeur de pratique mort (cœur sûr)', () => {

    it('aucun des 8 symboles morts n’est défini ni exporté dans pratiques.js', () => {
        for (const sym of SYMBOLES_RETIRES) {
            expect(source.includes(`function ${sym}(`), `${sym} ne doit plus être défini`).toBe(false);
            expect(source.includes(`window.${sym} =`), `window.${sym} ne doit plus être exporté`).toBe(false);
        }
    });

    it('les fonctions vivantes / zone grise restent définies (pas d’ablation excessive)', () => {
        for (const sym of SYMBOLES_CONSERVES) {
            expect(source.includes(`function ${sym}(`), `${sym} doit rester défini`).toBe(true);
        }
    });

    it('chargerConfigurationPAN n’a plus qu’UNE définition (l’ombre sans argument est retirée)', () => {
        const defs = source.match(/function chargerConfigurationPAN\s*\(/g) || [];
        expect(defs.length).toBe(1);
        // La définition survivante prend un argument (la version à param l2-1255).
        expect(/function chargerConfigurationPAN\s*\(\s*configPAN\s*\)/.test(source)).toBe(true);
    });

    it('plus aucune fonction ne déclare un paramètre `cle` qui masque le helper global window.cle', () => {
        // Le bug dormant : sauvegarderDansConfiguration(cle, valeur) — le
        // paramètre `cle` (une string, p.ex. 'portfolio') masquait la fonction
        // globale cle() de namespacing. À l'intérieur, cle('pratiquesConfigurables')
        // serait devenu "portfolio"('pratiquesConfigurables') → TypeError.
        // Le motif cle('pratiquesConfigurables') reste correct PARTOUT ailleurs,
        // où `cle` est bien le helper global ; ce qu'on interdit, c'est qu'une
        // fonction le re-déclare en paramètre.
        const shadows = source.match(/function +[A-Za-z0-9_]+ *\([^)]*\bcle\b[^)]*\)/g) || [];
        expect(shadows).toEqual([]);
    });
});
