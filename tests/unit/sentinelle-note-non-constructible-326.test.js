import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE — #326 (sous-item) — distinguer un « 0 » LÉGITIME d'une note
// NON CONSTRUCTIBLE au banc de décision. Avant : simulerIndices forçait P=0
// quand aucun calcul n'aboutissait (P_decimal null) → le banc affichait « 0 »,
// indiscernable d'un vrai zéro. Maintenant le moteur expose `noteConstructible`
// et le banc affiche « — non constructible » au lieu d'un 0 trompeur.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const srcBanc = readFileSync(path.join(racine, 'js/comparateur-pratiques.js'), 'utf8');

// --- Volet MOTEUR (comportemental) : simulerIndices.noteConstructible ---
function chargerPortfolio(performance) {
    const fakePratique = {
        calculerCompletion: () => 0.5,
        calculerPerformance: () => performance,   // 0, null, ou un décimal
        decrireCalcul: () => null
    };
    const win = chargerScript('js/portfolio.js', {
        obtenirPratiqueParId: () => fakePratique,
        db: { getSync: (_c, d) => d, setSync: () => {}, get: async () => null, set: async () => {} }
    });
    return win;
}

describe('#326 — simulerIndices expose noteConstructible', () => {
    it('un 0 calculé est CONSTRUCTIBLE (noteConstructible: true, P: 0)', () => {
        const win = chargerPortfolio(0);
        const r = win.simulerIndices('DA1', 'prat-1');
        expect(r.P).toBe(0);
        expect(r.noteConstructible).toBe(true);   // vrai zéro, pas « non constructible »
    });

    it('aucun calcul possible (performance null) → NON constructible (P forcé à 0)', () => {
        const win = chargerPortfolio(null);
        const r = win.simulerIndices('DA1', 'prat-1');
        expect(r.P).toBe(0);
        expect(r.noteConstructible).toBe(false);  // cœur du sous-item
    });

    it('une note réelle est constructible (ex. 0,42 → P: 42)', () => {
        const win = chargerPortfolio(0.42);
        const r = win.simulerIndices('DA1', 'prat-1');
        expect(r.P).toBe(42);
        expect(r.noteConstructible).toBe(true);
    });
});

// --- Volet BANC (statique) : rendu « non constructible » + CSV ---
describe('#326 — le banc affiche « non constructible » au lieu d\'un 0 trompeur', () => {
    it('_note retourne le résultat complet (pour lire noteConstructible)', () => {
        expect(srcBanc).toMatch(/return simulerIndices\(da, pratiqueId, _corpusInjection\(\)\) \|\| null;/);
    });

    it('la matrice rend une branche « non constructible » quand !r.noteConstructible', () => {
        expect(srcBanc).toMatch(/if \(!r\.noteConstructible\)/);
        expect(srcBanc).toMatch(/comparateur-nonconstr-mot/);
        expect(srcBanc).toMatch(/non constructible/);
    });

    it('un vrai 0 reste affiché comme nombre (r.P)', () => {
        expect(srcBanc).toMatch(/comparateur-note">' \+ r\.P/);
    });

    it('le CSV écrit « non constructible » (distinct du vide et d\'un 0)', () => {
        expect(srcBanc).toMatch(/r\.noteConstructible \? r\.P : 'non constructible'/);
    });
});
