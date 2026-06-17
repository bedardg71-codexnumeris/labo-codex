import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// #326 R1 — sentinelle de la migration boot estEssai → estMaquette.
// La migration vit inline dans la séquence de boot de main.js (patron des autres
// migrations namespacing). Sentinelle STATIQUE : garde contre son retrait
// accidentel et vérifie ses invariants (idempotence par flag, réécriture du flag,
// suppression de l'ancien champ — pas d'alias dormant, zéro-dette).

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = readFileSync(path.resolve(__dirname, '..', '..', 'js', 'main.js'), 'utf8');

function blocMigration() {
    const i = src.indexOf('migration_estEssai_to_estMaquette_done');
    expect(i, 'migration estEssai→estMaquette introuvable dans main.js').toBeGreaterThan(-1);
    // Fenêtre de ~1500 caractères autour de la première occurrence (le bloc complet).
    return src.slice(i - 200, i + 1300);
}

describe('#326 R1 · migration boot estEssai → estMaquette', () => {
    it('est gardée par un flag idempotent', () => {
        expect(src).toMatch(/if\s*\(\s*!db\.getSync\(\s*'migration_estEssai_to_estMaquette_done'/);
        expect(src).toMatch(/db\.setSync\(\s*'migration_estEssai_to_estMaquette_done',\s*true\s*\)/);
    });

    it('réécrit estEssai:true → estMaquette:true puis SUPPRIME l\'ancien champ (pas d\'alias)', () => {
        const bloc = blocMigration();
        expect(bloc).toMatch(/p\.estMaquette\s*=\s*true/);
        expect(bloc).toMatch(/delete\s+p\.estEssai/);
        expect(bloc).toMatch(/hasOwnProperty\.call\(\s*p,\s*'estEssai'\s*\)/);
    });

    it('couvre la clé globale ET les clés namespacées par trimestre', () => {
        const bloc = blocMigration();
        expect(bloc).toMatch(/'pratiquesConfigurables'/);
        expect(bloc).toMatch(/\$\{t\.id\}_pratiquesConfigurables/);
    });
});
