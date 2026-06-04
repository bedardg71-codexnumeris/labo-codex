import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Correctif légal (4 juin 2026, brief refonte-textes-divers.md §2) : le badge
// CC BY-NC-SA listait « L'utiliser commercialement » sous « Tu peux : », ce qui
// CONTREDIT la condition « Pas d'usage commercial (NC) ». Erreur de contenu légal.
// Sentinelle = verrou : la licence est NC, aucune permission d'usage commercial
// ne doit réapparaître dans la liste des droits.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const src = readFileSync(path.join(racineProjet, 'js', 'cc-license.js'), 'utf8');

describe('cc-license · cohérence NC (pas d\'usage commercial)', () => {
    it('conserve la condition « Pas d\'usage commercial (NC) »', () => {
        expect(src).toMatch(/Pas d'usage commercial \(NC\)/);
    });

    it('n\'annonce AUCUNE permission « utiliser commercialement » dans les droits', () => {
        expect(src).not.toMatch(/<li>[^<]*utiliser commercialement/i);
    });

    it('reste une licence CC BY-NC-SA', () => {
        expect(src).toMatch(/CC BY-NC-SA/);
    });
});
