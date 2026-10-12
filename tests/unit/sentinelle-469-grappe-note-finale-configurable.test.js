import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// #469 (11 oct. 2026) — la grappe `calculerNoteFinale` de `PratiqueConfigurable` est retirée :
// aucun appelant (#897, #903), ses cinq méthodes n'étaient appelées que par elle. Ce banc
// empêche qu'elle revienne, et garde `appliquerDoubleVerrou`, seul survivant (réemployé par
// `_appliquerVerrousSommatifs`, #897).
const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const tous = ['js', 'js/pratiques'].flatMap((d) => readdirSync(path.join(racine, d))
    .filter((f) => f.endsWith('.js')).map((f) => readFileSync(path.join(racine, d, f), 'utf8'))).join('\n');

describe('#469 · la grappe de la note finale configurable ne revient pas', () => {
    it('aucune des six méthodes n\'est définie dans js/', () => {
        for (const m of ['calculerNoteFinale', 'calculerParConversionNiveaux', 'calculerMoyennePonderee',
            'calculerParRemplacementProgression', 'appliquerConditionsSpeciales', 'appliquerPlafonnement']) {
            expect(tous, m).not.toMatch(new RegExp(`^\\s+${m}\\s*\\([^)]*\\)\\s*\\{`, 'm'));
        }
    });
    it('TÉMOIN · appliquerDoubleVerrou reste défini et appelé', () => {
        const src = readFileSync(path.join(racine, 'js/pratiques/pratique-configurable.js'), 'utf8');
        expect(src).toMatch(/^\s+appliquerDoubleVerrou\(noteActuelle, evaluations, condition\)\s*\{/m);
        expect(src).toMatch(/this\.appliquerDoubleVerrou\(/);
    });
});

describe('#469 · initialiserPratiquesPredefines ne revient pas', () => {
    it('elle n\'est définie nulle part dans js/ (aucun appelant au retrait, 11 oct. 2026)', () => {
        expect(tous).not.toMatch(/initialiserPratiquesPredefines\s*\(\s*\)\s*\{/);
    });
});
