import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Correctif meta.duree (signalement du rituel de fin de session du 4 août 2026,
// pré-approuvé dans plans de travail/AUDIT-2026-08-05-consigne.md §4) —
// L'inspecteur de planification injectait meta.duree BRUT dans l'attribut
// value= de l'input durée. meta.duree est une métadonnée persistée qui peut
// provenir d'un import (bibliothèque d'alignements, import inter-trimestre) :
// une valeur non numérique pouvait sortir de l'attribut (CSP en filet pour le
// script, pas pour l'injection d'attributs). La coercition parseInt garantit
// qu'il ne sort de cette interpolation qu'un entier ou ''.
// Sentinelle = verrou contre la réintroduction du patron hérité.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const carte = readFileSync(path.join(racineProjet, 'js', 'planification-carte.js'), 'utf8');

describe('meta.duree · l\'inspecteur coerce la durée avant injection dans value=', () => {
    it('l\'input durée passe par parseInt(meta.duree, 10)', () => {
        expect(carte).toMatch(/id="planif-duree-min" value="' \+ \(parseInt\(meta\.duree, 10\) \|\| ''\)/);
    });

    it('ne réintroduit pas l\'injection brute de meta.duree dans value=', () => {
        expect(carte).not.toMatch(/value="' \+ \(meta\.duree \|\| ''\)/);
    });
});
