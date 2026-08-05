import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// #326 R2/Étape 2 — injection mémoire pour le banc de décision.
// Le moteur lit évaluations/productions via obtenirDonneesSelonMode ; simulerIndices
// peut poser un CORPUS fictif en mémoire (try/finally), consulté en priorité, SANS
// écrire en stockage ni basculer le contexte. Hors simulation : comportement inchangé.
//
// Sentinelle STATIQUE : modes.js exécute initialiserSystemeModes() au chargement
// (touche le DOM) → non chargeable proprement en sandbox Node. On verrouille donc la
// logique d'injection par lecture de source (break-testable).

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const lire = (...p) => readFileSync(path.resolve(__dirname, '..', '..', ...p), 'utf8');

describe('#326 Étape 2 · modes.js — contexte de simulation', () => {
    const src = lire('js', 'modes.js');

    it('expose definir/effacer/obtenir le contexte de simulation', () => {
        expect(src).toMatch(/window\.definirContexteSimulation = definirContexteSimulation/);
        expect(src).toMatch(/window\.effacerContexteSimulation = effacerContexteSimulation/);
        expect(src).toMatch(/window\.obtenirDonneesSimulationOuNull = obtenirDonneesSimulationOuNull/);
    });

    it('seules les clés du corpus (évaluations, productions) sont simulables', () => {
        expect(src).toMatch(/_CLES_SIMULABLES\s*=\s*\['evaluationsSauvegardees',\s*'productions'\]/);
    });

    it('obtenirDonneesSelonMode intercepte AVANT la logique normale, en strippant le namespace', () => {
        const i = src.indexOf('function obtenirDonneesSelonMode(');
        const bloc = src.slice(i, i + 1700);
        // la garde d'injection est présente et lit le contexte
        expect(bloc).toMatch(/if \(_contexteSimulation\)/);
        expect(bloc).toMatch(/_CLES_SIMULABLES\.includes\(cleBaseSim\)/);
        expect(bloc).toMatch(/return _contexteSimulation\[cleBaseSim\]/);
        // l'interception est en TÊTE de fonction (early-return avant toute lecture stockage)
        expect(bloc.indexOf('if (_contexteSimulation)')).toBeGreaterThan(-1);
        expect(bloc.indexOf('if (_contexteSimulation)')).toBeLessThan(600);
    });

    it('l\'injection n\'écrit JAMAIS en stockage (lecture seule)', () => {
        const i = src.indexOf('CONTEXTE DE SIMULATION');
        const bloc = src.slice(i, i + 1600);
        expect(bloc).not.toMatch(/db\.setSync/);
    });
});

describe('#326 Étape 2 · simulerIndices — injection isolée en try/finally', () => {
    const src = lire('js', 'portfolio.js');

    it('accepte un 3ᵉ paramètre donnees', () => {
        expect(src).toMatch(/function simulerIndices\(da, pratiqueId, donnees/);
    });

    it('pose le contexte puis l\'efface en finally, et délègue au cœur interne inchangé', () => {
        const i = src.indexOf('function simulerIndices(');
        const bloc = src.slice(i, i + 900);
        expect(bloc).toMatch(/definirContexteSimulation\(donnees\)/);
        expect(bloc).toMatch(/finally/);
        expect(bloc).toMatch(/effacerContexteSimulation\(\)/);
        expect(src).toMatch(/function _simulerIndicesInterne\(da, pratiqueId\)/);
    });

    it('param absent ⇒ délègue directement (pas de pose de contexte → parité historique)', () => {
        const i = src.indexOf('function simulerIndices(');
        const bloc = src.slice(i, i + 900);
        // dernière instruction = délégation directe au cœur sans contexte
        expect(bloc).toMatch(/return _simulerIndicesInterne\(da, pratiqueId\);\s*\n\}/);
    });
});

describe('#326 Étape 2 · pan-standards — lectures directes routées par l\'injection', () => {
    it('les lectures directes de productions consultent l\'injection (repli db.getSync inchangé)', () => {
        const src = lire('js', 'pratiques', 'pratique-pan-standards.js');
        const occ = src.match(/obtenirDonneesSimulationOuNull\('productions'\)\)\s*\|\|\s*db\.getSync\(cle\('productions'\)/g) || [];
        // #394 (L10, 5 août 2026) : la 3e lecture (fallback configPAN legacy de
        // _lireConfiguration) a été RETIRÉE par décision D1 — la config vient de
        // pratiquesConfigurables. Restent 2 lectures routées : calculerPerformance
        // et _calculerNiveauxParObjectif. Comportement délibérément changé.
        expect(occ.length).toBe(2);
    });
});
