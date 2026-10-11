import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { tranche } from './_helpers/tranche.js';

// #1037 (11 oct. 2026) — la bibliothèque des trimestres parle par les fenêtres et notifications de
// l'application. Restent natifs, et seulement eux, les trois gestes de l'archivage (« Clore »,
// « Rouvrir », archiver le trimestre actif) : sous moratoire (#622). Le parcours « Supprimer… »
// est jugé par sentinelle-suppression-trimestre-361 et par la spec 1007 (X1).
const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const src = readFileSync(path.join(racine, 'js', 'trimestre-v2-liste.js'), 'utf8');
const natifs = (t) => (t.match(/(?<![\w.])(alert|confirm|prompt)\(/g) || []).length;

describe('#1037 · aucun dialogue natif hors de l\'archivage', () => {
    const MORATOIRE = [
        ['function confirmerArchivage(', 'function confirmerDesarchivage('],
        ['function confirmerDesarchivage(', 'function afficherFormulaireTrimestreActif('],
        ['function archiverTrimestreActif(', 'async function confirmerSuppressionTrimestre(']
    ];
    it('les natifs restants vivent tous dans les trois gestes sous moratoire', () => {
        const dansMoratoire = MORATOIRE.map(([d, f]) => natifs(tranche(src, d, f))).reduce((a, b) => a + b, 0);
        expect(dansMoratoire).toBeGreaterThan(0);
        expect(natifs(src)).toBe(dansMoratoire);
    });
    it('« Supprimer… » et la bibliothèque vide n\'en ont plus', () => {
        expect(natifs(tranche(src, 'async function confirmerSuppressionTrimestre(', 'function changerTrimestreActifV2('))).toBe(0);
        expect(natifs(tranche(src, 'function ouvrirBibliothequeTrimestreV2(', 'function fermerModalBibliothequeTrimestres('))).toBe(0);
    });
});
