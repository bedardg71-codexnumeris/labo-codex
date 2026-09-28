import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE — #321 — « note différée » (couche 1 PRÉN) : bascule manuelle
// globale qui masque les notes PAR TRAVAIL (remplacées par un badge
// « note différée »), sans altérer aucun calcul ni la note finale de session.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
function lire(f) { return readFileSync(path.join(racine, f), 'utf8'); }

// --- Volet PRÉFÉRENCE (comportemental) ---
function chargerPrefs(prefsStockees) {
    const store = { preferencesUtilisateur: prefsStockees || {} };
    const db = {
        getSync: (cle, def) => (cle in store ? store[cle] : def),
        setSync: (cle, val) => { store[cle] = val; },
        get: async (cle, def) => (cle in store ? store[cle] : def),
        set: async () => {}
    };
    return chargerScript('js/preferences.js', { db });
}

describe('#321 — préférence noteDifferee + helpers', () => {
    it('défaut : noteDifferee est false → noteDiffereeActive() === false', () => {
        const win = chargerPrefs({});
        expect(win.obtenirPreference('noteDifferee')).toBe(false);
        expect(win.noteDiffereeActive()).toBe(false);
    });

    it('activée : noteDiffereeActive() === true', () => {
        const win = chargerPrefs({ noteDifferee: true });
        expect(win.noteDiffereeActive()).toBe(true);
    });

    it('badgeNoteDifferee() rend un repère HTML statique (CSP-safe)', () => {
        const win = chargerPrefs({});
        const badge = win.badgeNoteDifferee();
        expect(badge).toContain('badge-note-differee');
        expect(badge).toContain('note différée');
        expect(badge).not.toContain('onclick');
    });
});

// --- Volet SITES D'AFFICHAGE (statique) : chaque note PAR TRAVAIL est gardée ---
describe('#321 — les notes par travail passent par le masque', () => {
    it('liste des évaluations : le % est gardé par noteDiffereeActive()', () => {
        const src = lire('js/liste-evaluations.js');
        expect(src).toMatch(/noteDiffereeActive\(\)\s*\)\s*\n?\s*\?\s*badgeNoteDifferee\(\)/);
    });

    it('profil : les notes par artefact utilisent badgeNoteDifferee()', () => {
        const src = lire('js/profil-etudiant-sections-affichage.js');
        // au moins les 5 sites profil routés
        const occ = (src.match(/badgeNoteDifferee\(\)/g) || []).length;
        expect(occ).toBeGreaterThanOrEqual(5);
    });

    it('portfolio : la note par artefact de carte est gardée', () => {
        const src = lire('js/portfolio.js');
        expect(src).toContain('badgeNoteDifferee()');
        expect(src).toContain('noteDiffereeActive');
    });
});

// --- Volet RÉGLAGE UI (statique) : checkbox + load/save ---
describe('#321 — réglage Préférences câblé', () => {
    it('index.html expose la checkbox v2-pref-note-differee', () => {
        expect(lire('index.html')).toContain('id="v2-pref-note-differee"');
    });

    it('preferences-v2.js charge ET sauvegarde la préférence', () => {
        const src = lire('js/preferences-v2.js');
        expect(src).toContain("obtenirPreference('noteDifferee')");
        // ↻ Lot E3 (28 sept. 2026) : `definir` enveloppe `definirPreference` pour que le témoin commun parle.
        expect(src).toContain("definir('noteDifferee', document.getElementById('v2-pref-note-differee')?.checked === true)");
        expect(src).toContain("const definir = (cle, valeur) => { resultats.push(definirPreference(cle, valeur) !== false); };");
    });
});
