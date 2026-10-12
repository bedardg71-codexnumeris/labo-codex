import { describe, it, expect } from 'vitest';
import { readFileSync, mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { masquagesDeCle } from './_helpers/masquages-cle.js';

// =====================================================================
// #642 — LES MASQUAGES DU HELPER `cle()` (11 oct. 2026)
// =====================================================================
// Un nom local `cle` couvre toute sa portée : un `cle('…')` à l'intérieur vise la variable, pas
// le namespacing. Le grep d'avant ne voyait pas `function f(cle)`. Le détecteur couvre les cinq
// formes de la fiche ; ce CLIQUET fige le compte par fichier du jour (139 dans 52 fichiers) : un
// fichier ne peut pas en gagner, et un compte qui baisse doit être reporté dans la liste.
// Mettre à jour : tests/fixtures/cliquets/masquages-cle-642.json.

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const fige = JSON.parse(readFileSync(path.join(racine, 'tests', 'fixtures', 'cliquets', 'masquages-cle-642.json'), 'utf8'));

describe('#642 · cliquet des masquages de cle()', () => {
    const mesure = masquagesDeCle(racine);
    it('aucun fichier n\'en gagne (renomme le masquage, jamais un alias de cle)', () => {
        const hausses = Object.keys(mesure).filter((f) => mesure[f] > (fige[f] || 0)).map((f) => `${f} : ${fige[f] || 0} → ${mesure[f]}`);
        expect(hausses).toEqual([]);
    });
    it('un compte qui baisse est reporté dans la liste figée (le cliquet descend)', () => {
        const baisses = Object.keys(fige).filter((f) => (mesure[f] || 0) < fige[f]).map((f) => `${f} : ${fige[f]} → ${mesure[f] || 0}`);
        expect(baisses).toEqual([]);
    });
});

describe('#642 · TÉMOIN — le détecteur voit les cinq formes, et pas une valeur par défaut', () => {
    it('cinq masquages comptés, la valeur par défaut et le commentaire ignorés', () => {
        const dossier = mkdtempSync(path.join(tmpdir(), 'masquages-642-'));
        try {
            mkdirSync(path.join(dossier, 'js', 'pratiques'), { recursive: true });
            writeFileSync(path.join(dossier, 'js', 'banc.js'), [
                'function lire(cle) { return cle; }',
                'const f = (a, cle) => a + cle;',
                'const g = cle => cle;',
                'let cle = 1;',
                'for (const cle of liste) {}',
                'function avecDefaut(k = cle("x")) { return k; }',
                '// function commentee(cle) {}'
            ].join('\n'));
            expect(masquagesDeCle(dossier)).toEqual({ 'js/banc.js': 5 });
        } finally {
            rmSync(dossier, { recursive: true, force: true });
        }
    });
});
