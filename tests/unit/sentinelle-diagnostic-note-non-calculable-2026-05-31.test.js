import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// #128 (31 mai 2026, Grégoire) — message DIAGNOSTIQUE du « non calculable ».
// L'enseignant doit comprendre POURQUOI : assignation à corriger, config incomplète,
// ou famille pas encore calculée par l'app (ses données restant cohérentes). Brique de
// la future fonction « simuler / comparer des pratiques sur les mêmes données ».

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const actions = readFileSync(path.join(racineProjet, 'js', 'profil-etudiant-actions.js'), 'utf8');

describe('#128 · diagnostic du « non calculable »', () => {
    it('un helper de diagnostic existe et est branché sur le retour d\'erreur', () => {
        expect(actions).toMatch(/function _diagnostiquerNoteNonCalculable\(\)/);
        expect(actions).toMatch(/erreur:\s*_diagnostiquerNoteNonCalculable\(\)/);
    });

    it('distingue les 4 causes (aucune assignation / introuvable / famille non branchée / config incomplète)', () => {
        expect(actions).toMatch(/Aucune pratique de notation .* assignée/);
        expect(actions).toMatch(/introuvable dans la bibliothèque/);
        expect(actions).toMatch(/type Sommative/);
        expect(actions).toMatch(/type Spécifications/);
        expect(actions).toMatch(/configuration de portfolio.*absente ou incomplète/);
    });

    it('branche par famille via le type normalisé ET la méthode de calcul', () => {
        expect(actions).toMatch(/famille === 'sommative' \|\| methode === 'moyenne_ponderee'/);
        expect(actions).toMatch(/famille === 'specifications' \|\| methode === 'specifications'/);
        expect(actions).toMatch(/normaliserIdPratique\(pratiqueData\.type \|\| ''\)/);
    });

    it('le message « famille non branchée » rassure sur la cohérence des données (pas un bug)', () => {
        // Le cœur du retour Grégoire : ce n'est pas l'app qui « bug », ni ses données.
        expect(actions).toMatch(/Tes données sont cohérentes/);
    });
});
