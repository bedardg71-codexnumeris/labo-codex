import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GESTES_PROPOSES } from './_helpers/gestes-proposes-2026-11-11.js';

// Les lignes du geste proposées le 11 nov. 2026 (complément de 12 h 05) : chacune est posée, telle quelle, dans son
// parcours. Un mot changé dans le code sans la liste (ou l'inverse) rougit : la liste est ce que Grégoire relit.
const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

describe('les lignes du geste proposées le 11 nov. 2026', () => {
    const cas = Object.entries(GESTES_PROPOSES).flatMap(([f, gs]) => gs.map((g) => [f, g]));
    it.each(cas)('%s : « %s » est posée telle quelle', (fichier, geste) => {
        const source = readFileSync(path.join(racine, fichier), 'utf8');
        expect(source).toContain(JSON.stringify(geste));
    });
});
