import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = readFileSync(path.resolve(__dirname, '..', '..', 'js/accompagnement.js'), 'utf8');

// SENTINELLE — #305 — la modale d'aide contextuelle (afficherAideContextuelle)
// annonçait « dialogue » sans nom : aria-labelledby pointe vers #aide-ctx-titre,
// mais ce <span> ne contenait que l'icône — le titre de l'entrée n'y était jamais
// injecté (~40 popups). Le correctif injecte aide.titre dans l'en-tête labellisé.
// Sentinelle STATIQUE (le module n'est pas une IIFE testable proprement en jsdom) :
// on verrouille les deux invariants — le pointeur a11y ET l'injection du titre.
describe('#305 — titre dans l\'en-tête labellisé de la modale d\'aide', () => {
    it('la modale est labellisée par #aide-ctx-titre', () => {
        expect(src).toContain("aria-labelledby', 'aide-ctx-titre'");
    });

    it('le span #aide-ctx-titre reçoit aide.titre (plus seulement l\'icône)', () => {
        const ligne = src.split('\n').find(l => l.includes('id="aide-ctx-titre"'));
        expect(ligne).toBeTruthy();
        expect(ligne).toContain('aide.titre');
    });
});
