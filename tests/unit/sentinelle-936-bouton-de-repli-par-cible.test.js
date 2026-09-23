import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Sentinelle statique — #936 (23 sept. 2026). Les barres de palettes portent
// PLUSIEURS `.palette-flottante-toggle` (roue, ↔, ↕, puis − ). Chercher le bouton
// de repli par `querySelector('.palette-flottante-toggle')` rend le PREMIER : la
// roue de la palette Annotation devenait « − » / « + ». Le banc Playwright
// annotation-zoom-gauche-palette-engrenage-936 fait le geste sur deux des cinq
// sites ; les trois autres (activer/désactiver l'annotation, auto-dépli de la
// Rétroaction) ne se rejouent pas sans copie importée : ce verrou les couvre.

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const dossier = path.join(racine, 'js');

function fichiersJs(dir) {
    return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
        e.isDirectory() ? fichiersJs(path.join(dir, e.name)) : e.name.endsWith('.js') ? [path.join(dir, e.name)] : []);
}

describe('sentinelle · bouton de repli trouvé par sa cible (#936)', () => {
    it('aucun module ne prend le premier `.palette-flottante-toggle` / `.travaux-palette-toggle` d’une barre', () => {
        const fautifs = [];
        for (const f of fichiersJs(dossier)) {
            const src = readFileSync(f, 'utf8');
            if (/querySelector\(\s*['"]\.(palette-flottante-toggle|travaux-palette-toggle)['"]\s*\)/.test(src)) {
                fautifs.push(path.relative(racine, f));
            }
        }
        expect(fautifs).toEqual([]);
    });
});
