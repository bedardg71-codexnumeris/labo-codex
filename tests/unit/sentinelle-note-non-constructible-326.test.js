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

// Harnais T1 : injecte AUSSI calculerDetailsNoteFinale (le chemin riche STD).
// `detailsNote` = ce que rend calculerDetailsNoteFinale : `null` (famille non-STD au
// sens réel) ou un objet (famille STD : { noteFinale, erreur?, recit? }). `code` = la
// famille rendue par instance.obtenirCode() — c'est le DISCRIMINATEUR du moteur ('STD'
// → la note portfolio riche est autoritative).
function chargerPortfolioRiche({ detailsNote, performance, code }) {
    const fakePratique = {
        calculerCompletion: () => 0.5,
        calculerPerformance: () => performance,
        decrireCalcul: () => null
    };
    if (code) fakePratique.obtenirCode = () => code;
    const win = chargerScript('js/portfolio.js', {
        obtenirPratiqueParId: () => fakePratique,
        calculerDetailsNoteFinale: () => detailsNote,
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

describe('#326 T1 — un échec du chemin riche STD n\'est PLUS masqué par le repli', () => {
    it('STD échoué (noteFinale null + erreur) → NON constructible, MÊME si calculerPerformance rendrait 0', () => {
        // Le break-test : sur l\'ancien code, le repli calculerPerformance(=>0) masquait
        // l\'échec → P:0, noteConstructible:true (le « 0 » trompeur du terrain T1).
        const win = chargerPortfolioRiche({
            code: 'STD',
            detailsNote: { noteFinale: null, erreur: 'config portfolio absente', recit: null },
            performance: 0
        });
        const r = win.simulerIndices('DA1', 'std-incomplete');
        expect(r.noteConstructible).toBe(false);     // cœur T1 : plus de 0 trompeur
        expect(r.details).toBeTruthy();               // l\'erreur de config reste accessible
        expect(r.details.erreur).toBe('config portfolio absente');
    });

    it('STD réussi (noteFinale 75) → constructible ; le repli n\'est PAS consulté', () => {
        // calculerPerformance rendrait 0,99 mais ne doit pas être utilisé.
        const win = chargerPortfolioRiche({
            code: 'STD',
            detailsNote: { noteFinale: 75, recit: { famille: 'STD' } },
            performance: 0.99
        });
        const r = win.simulerIndices('DA1', 'std-ok');
        expect(r.P).toBe(75);
        expect(r.noteConstructible).toBe(true);
    });

    it('famille NON-STD (calculerDetailsNoteFinale rend null) → repli calculerPerformance LÉGITIME', () => {
        // SOM/SPE/DEN : la note vient du repli — ne doit pas régresser.
        const win = chargerPortfolioRiche({ code: 'SOM', detailsNote: null, performance: 0.6 });
        const r = win.simulerIndices('DA1', 'som-1');
        expect(r.P).toBe(60);
        expect(r.noteConstructible).toBe(true);
    });

    it('famille NON-STD sans donnée (null des deux côtés) → non constructible', () => {
        const win = chargerPortfolioRiche({ code: 'SOM', detailsNote: null, performance: null });
        const r = win.simulerIndices('DA1', 'som-vide');
        expect(r.noteConstructible).toBe(false);
    });

    it('garde-fou : une STD dont le repli rendrait un nombre mais dont le chemin riche a échoué reste NON constructible (même avec un mock objet-null, le discriminateur est la famille)', () => {
        // Ce cas verrouille le choix « famille » (vs « objet vs null ») : un objet
        // {noteFinale:null} pour une NON-STD (pas d\'obtenirCode STD) NE bloque PAS le repli.
        const win = chargerPortfolioRiche({ code: 'SOM', detailsNote: { noteFinale: null }, performance: 0.55 });
        const r = win.simulerIndices('DA1', 'som-objet-null');
        expect(r.P).toBe(55);                 // repli légitime pour une non-STD
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
