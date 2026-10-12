import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// #536 (11 oct. 2026) — `idmeMoyen` rendait 0 quand aucun niveau final n'était convertible, au lieu
// de « pas de donnée ». Mesure : AUCUN lecteur (seuls ses deux producteurs le nommaient). Le champ
// est retiré, avec sa conversion des niveaux finaux et `_tablePour` (pratique-pan-standards.js),
// qui n'avait plus d'autre appelant. Ce banc empêche qu'il revienne sans lecteur.
const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const fichiers = (dossier) => readdirSync(path.join(racine, dossier)).filter((f) => f.endsWith('.js')).map((f) => path.join(dossier, f));

describe('#536 · le champ sans lecteur est parti', () => {
    const tous = [...fichiers('js'), ...fichiers('js/pratiques')];
    it('plus aucun `idmeMoyen` ni `_tablePour` dans js/', () => {
        const porteurs = tous.filter((f) => /idmeMoyen\s*:|const idmeMoyen|_tablePour\s*\(/.test(readFileSync(path.join(racine, f), 'utf8')));
        expect(porteurs).toEqual([]);
    });
});
