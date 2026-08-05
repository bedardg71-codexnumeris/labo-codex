import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// SENTINELLE-CLIQUET #402 (L11) — calculerNoteFinaleMultiObjectifs RETIRÉE
// (audit 5 août 2026) : somme pondérée jamais normalisée par poidsTotal (un
// objectif sans note dégonflait la note mécaniquement ; Σpoids ≠ 100 faussait
// l'échelle) ET zéro appelant hors module (grep js/ + index.html + tests).
// Ablation zéro-dette plutôt que correction d'un mort.
// Break-test = mutation INVERSE (réintroduire le symbole → ROUGE).

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = readFileSync(
    path.resolve(__dirname, '..', '..', 'js', 'portfolio.js'), 'utf8');

describe('#402 · cliquet — calculerNoteFinaleMultiObjectifs ne revient pas', () => {
    it('plus de définition ni d\'export window', () => {
        expect(src).not.toMatch(/function calculerNoteFinaleMultiObjectifs/);
        expect(src).not.toMatch(/window\.calculerNoteFinaleMultiObjectifs\s*=/);
    });

    it('la trace d\'ablation est en place (le motif apparaît en commentaire seulement)', () => {
        expect(src).toMatch(/#402 \(L11.*calculerNoteFinaleMultiObjectifs RETIRÉE/s);
    });
});
