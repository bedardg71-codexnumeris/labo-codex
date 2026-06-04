import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Session B (#303) Lot 2 — routage des badges de pratique vers le registre (source
// unique) + SUPPRESSION des tables locales dupliquées (principe zéro-dette). Ces
// sentinelles empêchent la réapparition des tables retirées et verrouillent l'usage
// des helpers du registre. Lots restants (terrain) : main.js, etudiants.js, gabarits-utils.js.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const lire = (rel) => readFileSync(path.join(racineProjet, rel), 'utf8');

describe('Session B Lot 2 · routage des représentations', () => {
    const donneesV2 = lire('js/donnees-v2.js');
    const notationV2 = lire('js/pratique-notation-v2.js');
    const gestion = lire('js/pratiques-gestion.js');

    it('donnees-v2 · badge des familles routé vers genererBadgePratiqueHTML', () => {
        expect(donneesV2).toMatch(/genererBadgePratiqueHTML/);
        // L'ancienne table locale {pan-standards: "<span…std…", …} a disparu.
        expect(donneesV2).not.toMatch(/'pan-standards':\s*'<span class="badge-type-pratique badge-type-std">/);
        expect(donneesV2).not.toMatch(/'denominateur':/); // clé boguée retirée
    });

    it('pratique-notation-v2 · badge piloté par obtenirRepresentationPratiqueStricte', () => {
        expect(notationV2).toMatch(/obtenirRepresentationPratiqueStricte/);
        // L'ancien badgeConfig {sommative:{classe:'som'…}} a disparu.
        expect(notationV2).not.toMatch(/'pan-standards':\s*\{\s*classe:\s*'std'/);
    });

    it('pratiques-gestion · code dérivé du registre (typeMapping local retiré)', () => {
        expect(gestion).toMatch(/obtenirRepresentationPratiqueStricte/);
        // La table locale typeMapping {sommative:'SOM', standards:'STD', …} a disparu.
        expect(gestion).not.toMatch(/const typeMapping = \{\s*\n\s*'sommative':\s*'SOM'/);
    });
});
