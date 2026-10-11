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
    const gestion = lire('js/pratiques-gestion.js');

    it('donnees-v2 · badge des familles routé vers genererBadgePratiqueHTML', () => {
        expect(donneesV2).toMatch(/genererBadgePratiqueHTML/);
        // L'ancienne table locale {pan-standards: "<span…std…", …} a disparu.
        expect(donneesV2).not.toMatch(/'pan-standards':\s*'<span class="badge-type-pratique badge-type-std">/);
        expect(donneesV2).not.toMatch(/'denominateur':/); // clé boguée retirée
    });

    // L'essai « pratique-notation-v2 · aucune table de badge locale » est tombé avec le
    // fichier, retiré le 11 oct. 2026 (#469).

    it('pratiques-gestion · code dérivé du registre (typeMapping local retiré)', () => {
        expect(gestion).toMatch(/obtenirRepresentationPratiqueStricte/);
        // La table locale typeMapping {sommative:'SOM', standards:'STD', …} a disparu.
        expect(gestion).not.toMatch(/const typeMapping = \{\s*\n\s*'sommative':\s*'SOM'/);
    });
});

describe('Session B Lot 3 · routage code + nettoyage couleurs', () => {
    const mainJs = lire('js/main.js');
    const etudiants = lire('js/etudiants.js');
    const gabarits = lire('js/gabarits-utils.js');

    it('main.js · genererBadgePratique dérive le code du registre (if/else famille retiré)', () => {
        expect(mainJs).toMatch(/obtenirCodePratique\(typePAN\)/);
        // L'ancien escalier if/else (typePAN === 'specifications' …) a disparu.
        expect(mainJs).not.toMatch(/typePAN === 'specifications'/);
    });

    it('etudiants.js · le badge de liste (sans appelant, lisait PRATIQUE_DEFAUT) est RETIRÉ au lot N1b (21 sept. 2026) — ni lui ni son escalier', () => {
        expect(etudiants).not.toMatch(/genererBadgePratiqueListeEtudiants/);
        expect(etudiants).not.toMatch(/classePratique = 'spe'/);
    });

    it('gabarits-utils.js · table de couleurs en dur (divergente) retirée — zéro-dette', () => {
        // Plus de définition ni d'export de COULEURS_PRATIQUES (seul le commentaire subsiste).
        expect(gabarits).not.toMatch(/const COULEURS_PRATIQUES = \{/);
        expect(gabarits).not.toMatch(/'STD': '#17a2b8'/);
    });
});
