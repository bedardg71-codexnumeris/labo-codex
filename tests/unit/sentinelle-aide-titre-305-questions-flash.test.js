import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = readFileSync(path.resolve(__dirname, '..', '..', 'js/boite-outils.js'), 'utf8');

// SENTINELLE — #305 (reliquat) — la modale « Gestion des Questions Flash »
// (modal-params-questions) portait role="dialog" aria-modal="true" mais AUCUN
// nom accessible : les lecteurs d'écran l'annonçaient « dialogue » sans titre.
// Sa jumelle modal-params-tirage est, elle, labellisée (titre-modal-params).
// Le correctif aligne les deux : aria-labelledby pointe vers le <h2> titré.
// Sentinelle STATIQUE (le module construit le HTML par template string).
describe('#305 reliquat — nom accessible de la modale Questions Flash', () => {
    it('la modale est labellisée par #titre-modal-questions', () => {
        const ligne = src.split('\n').find(l => l.includes('id="modal-params-questions"'));
        expect(ligne).toBeTruthy();
        expect(ligne).toContain('aria-labelledby="titre-modal-questions"');
    });

    it('le titre <h2> porte bien l\'id référencé', () => {
        expect(src).toContain('<h2 id="titre-modal-questions">');
    });

    it('la jumelle modal-params-tirage reste labellisée (non-régression)', () => {
        const ligne = src.split('\n').find(l => l.includes('id="modal-params-tirage"'));
        expect(ligne).toBeTruthy();
        expect(ligne).toContain('aria-labelledby="titre-modal-params"');
    });
});
