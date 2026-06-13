import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// #325 — carte « Sources et remerciements » dans Réglages → À propos.
// Décisions Grégoire (6 juin 2026) : registre remerciement + sources, nommage
// mixte, garde-fou anti-sur-attribution en dernière ligne. Contenu statique.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = readFileSync(path.join(racineProjet, 'index.html'), 'utf8');

describe('#325 · carte Sources et remerciements', () => {
    it('la carte est présente avec ses deux blogues crédités', () => {
        expect(indexHtml).toContain('Sources et remerciements');
        expect(indexHtml).toContain('Grading for Growth');
        expect(indexHtml).toContain('Pratiques alternatives de notation');
    });

    it('le garde-fou anti-sur-attribution clôt la carte', () => {
        expect(indexHtml).toContain('elle ne les repr&eacute;sente pas, et toute erreur d&rsquo;interpr&eacute;tation m&rsquo;appartient');
    });
});
