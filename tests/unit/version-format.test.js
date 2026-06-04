import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');

// Sentinelle — verrouille le schéma de version adopté au lancement public
// du 3 juin 2026 (passage de « beta 99.x » au versionnage sémantique).
// Empêche un retour accidentel au format à deux chiffres (ex. « 99.87 »).
describe('Format de version (SemVer)', () => {
    const version = JSON.parse(
        readFileSync(path.join(racineProjet, 'version.json'), 'utf8')
    );

    it('version.json.beta respecte MAJEUR.MINEUR.CORRECTIF', () => {
        expect(version.beta).toMatch(/^\d+\.\d+\.\d+$/);
    });

    it('version.json.build respecte MMJJ-HHMM', () => {
        expect(version.build).toMatch(/^\d{4}-\d{4}$/);
    });
});
