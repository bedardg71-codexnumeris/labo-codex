import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Sentinelle statique — bug #142 (10 juin 2026).
// Quand localStorage est saturé, `_codex_etat` est refoulé en IndexedDB
// seulement ; à DOMContentLoaded la lecture synchrone de initialiserCodex
// tombe sur du vide (la sync IDB → cache n'a pas fini) → « Aucun codex
// actif » alors que les données sont chargées. Fix : relecture de l'état à
// `db-ready` (avec garde window.dbReady si l'événement est déjà passé).
// Cette sentinelle verrouille la présence du patron dans initialiserCodex
// (cf. feedback-fix-perdu-refactoring-extraction).

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

describe('sentinelle · relecture de _codex_etat après db-ready (#142)', () => {
    const source = readFileSync(path.join(racine, 'js', 'codex.js'), 'utf8');

    // Périmètre : le corps de initialiserCodex (jusqu'à la fonction suivante).
    const debut = source.indexOf('function initialiserCodex()');
    const fin = source.indexOf('function _sauvegarderEtat()');
    const corps = source.slice(debut, fin);

    it('initialiserCodex existe et précède _sauvegarderEtat', () => {
        expect(debut).toBeGreaterThan(-1);
        expect(fin).toBeGreaterThan(debut);
    });

    it('relit CLE_ETAT_CODEX à db-ready quand la lecture initiale est vide', () => {
        expect(corps).toContain("addEventListener('db-ready'");
        // La relecture doit viser la clé d'état (pas un autre usage de db-ready).
        const blocRelecture = corps.slice(corps.indexOf('relireEtatTardif'));
        expect(blocRelecture).toContain('CLE_ETAT_CODEX');
    });

    it('gère le cas où db-ready est déjà passé (garde window.dbReady)', () => {
        expect(corps).toContain('window.dbReady');
    });

    it('ne ré-écrase pas un état activé entre-temps par un geste utilisateur', () => {
        expect(corps).toContain('if (_etat.actif) return;');
    });
});
