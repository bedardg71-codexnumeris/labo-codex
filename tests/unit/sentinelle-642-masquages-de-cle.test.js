import { describe, it, expect } from 'vitest';
import { readFileSync, mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { masquagesDeCle, masquagesActifs } from './_helpers/masquages-cle.js';

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

// TRI DU LOT 23 (12 oct. 2026) — LES MASQUAGES QUI RESTENT SONT VOULUS, ET VOICI POURQUOI.
// 139 sites mesurés : 138 sont INERTES (aucun appel `cle(…)` dans leur portée : un paramètre
// nommé `cle` dans un `forEach`, une boucle sur des clés, une clé de stockage locale). Un seul ne
// l'était pas, l'alias `const cle = window.cle || (k => k)` de `mettreAJourBarreContexte`
// (trimestre-v2.js) : retiré. La règle est désormais celle-ci, vérifiée site par site : un
// masquage est toléré tant qu'aucun appel `cle(` ne vit dans sa portée. Le compte par fichier
// reste un cliquet qui descend.
describe('#642 · le tri : aucun masquage n\'a d\'appel cle( dans sa portée', () => {
    it('zéro masquage actif dans js/', () => {
        expect(masquagesActifs(racine)).toEqual([]);
    });
    it('TÉMOIN — un alias qui appelle, fabriqué, est vu ; un paramètre inerte ne l\'est pas', () => {
        const dossier = mkdtempSync(path.join(tmpdir(), 'masquages-actifs-642-'));
        try {
            mkdirSync(path.join(dossier, 'js', 'pratiques'), { recursive: true });
            writeFileSync(path.join(dossier, 'js', 'banc.js'), [
                'function inerte(cle) { return cle.length; }',
                'function actif() {',
                '    const cle = window.cle || (k => k);',
                '    return cle(\'productions\');',
                '}',
                'const f = (a, cle) => cle(a);'
            ].join('\n'));
            expect(masquagesActifs(dossier).sort()).toEqual(['js/banc.js:3', 'js/banc.js:6']);
        } finally {
            rmSync(dossier, { recursive: true, force: true });
        }
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
