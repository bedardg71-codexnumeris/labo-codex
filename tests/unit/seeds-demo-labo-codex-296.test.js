import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// #296 — tri catégoriel des seeds « Labo Codex ».
// Décision Grégoire (19 juin) : les gabarits/défauts/exemples (legacy
// 'Labo Codex') = contenu fonctionnel → VISIBLES pour tous ; seuls les items
// d'infra démo portent 'Demo Labo Codex' ; le résidu michel-calcul-diff supprimé.
// estItemDemo ne matche donc plus que 'Demo Labo Codex'.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const lire = (f) => readFileSync(path.join(racine, f), 'utf8');

describe('#296 — estItemDemo ne masque plus le contenu « Labo Codex »', () => {
    const win = chargerScript('js/bibliotheque-ui.js');
    const estItemDemo = win.BibliothequeUI.estItemDemo;

    it('un item legacy « Labo Codex » N’EST PLUS démo (redevient visible)', () => {
        expect(estItemDemo({ auteur: 'Labo Codex' })).toBe(false);
    });
    it('un item « Demo Labo Codex » reste démo (masqué hors démo)', () => {
        expect(estItemDemo({ auteur: 'Demo Labo Codex' })).toBe(true);
    });
    it('le flag isDemo prime toujours', () => {
        expect(estItemDemo({ isDemo: true })).toBe(true);
        expect(estItemDemo({ isDemo: true, auteur: 'Labo Codex' })).toBe(true);
    });
    it('item nul ou sans auteur → non démo', () => {
        expect(estItemDemo(null)).toBe(false);
        expect(estItemDemo({})).toBe(false);
    });
});

describe('#296 — état des seeds après migration', () => {
    it('estItemDemo ne compare plus à « Labo Codex », seulement « Demo Labo Codex »', () => {
        const src = lire('js/bibliotheque-ui.js');
        expect(src).toMatch(/auteur === 'Demo Labo Codex'/);
        expect(src).not.toMatch(/auteur === 'Labo Codex'/);
    });

    it('demo-namespace : infra démo re-taguée « Demo Labo Codex »', () => {
        const src = lire('js/demo-namespace.js');
        expect(src).not.toMatch(/auteur: 'Labo Codex'/);
        expect(src).toMatch(/auteur: 'Demo Labo Codex'/);
    });

    it('le résidu michel-calcul-diff est supprimé (fonction + id)', () => {
        const src = lire('js/objectifs.js');
        expect(src).not.toContain('creerEnsembleCalculDiff');
        expect(src).not.toContain("id: 'objectifs-michel-calcul-diff'");
    });

    it('les gabarits/exemples gardent « Labo Codex » (désormais visibles)', () => {
        // Non régression : on n'a PAS touché leur auteur — ils redeviennent
        // visibles via la finalisation du filtre, pas par un re-tag de masse.
        expect(lire('js/gabarits-utils.js')).toMatch(/auteur: 'Labo Codex'/);
        expect(lire('js/pratiques/pratiques-predefines.js')).toMatch(/auteur: 'Labo Codex'/);
    });
});
