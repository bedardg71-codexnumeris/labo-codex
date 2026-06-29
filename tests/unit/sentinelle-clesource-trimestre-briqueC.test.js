import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// Brique C du PLAN-namespacing-par-trimestre — 1er pas (cadrage C/D §2.2/§2.4).
//
// cleSource(nomCle, trimestreSourceId) : LECTURE inter-trimestre. Retourne la clé de
// stockage où vivent les données du trimestre NOMMÉ, SANS swap du trimestre actif.
// Le swap pour lire une autre source est l'anti-pattern fragile que la Brique C évite ;
// cleSource est le miroir de cle() paramétré par une source.
//
// Cette sentinelle verrouille DEUX choses :
//   1. le ROUTAGE — copie archivée prioritaire → globale partagée → namespacée pure ;
//   2. l'INVARIANT « sans swap » — lire a2025 ne touche pas h2026 actif.
//
// Break-test : si cleSource ignorait la source et lisait le trimestre actif, les cas
// COPIE ARCHIVÉE et NAMESPACÉ PUR rougiraient (h2026_* au lieu de a2025_*).

function dbDepuisStore(store) {
    return {
        get: async (c) => (c in store ? store[c] : null),
        getSync: (c, d) => (c in store ? store[c] : (d !== undefined ? d : null)),
        set: async (c, v) => { store[c] = v; },
        setSync: (c, v) => { store[c] = v; }
    };
}

function chargerTrimestres(store) {
    return chargerScript('js/trimestres.js', { db: dbDepuisStore(store) });
}

describe('Brique C · cleSource lit un trimestre nommé sans swap', () => {
    it('COPIE ARCHIVÉE — source ≠ actif, copies a2025_* présentes : clé namespacée de la SOURCE', () => {
        const store = {
            trimestres: [{ id: 'h2026', actif: true, archive: false }],
            a2025_grillesTemplates: [{ id: 'GRILLE_A25' }],
            a2025_echellesTemplates: [{ id: 'ECH_A25' }],
            a2025_cartouches_GRILLE_A25: [{ id: 'CART_A25' }]
        };
        const win = chargerTrimestres(store);
        expect(win.cleSource('grillesTemplates', 'a2025')).toBe('a2025_grillesTemplates');
        expect(win.cleSource('echellesTemplates', 'a2025')).toBe('a2025_echellesTemplates');
        expect(win.cleSource('cartouches_GRILLE_A25', 'a2025')).toBe('a2025_cartouches_GRILLE_A25');
    });

    it('ROUTAGE SOURCE — #358 : grilles/échelles namespacées (clé de la source) ; cartouches/cours globales', () => {
        const store = { trimestres: [{ id: 'h2026', actif: true, archive: false }] };
        const win = chargerTrimestres(store);
        // Option A : grilles/échelles ont rejoint CLES_NAMESPACEES → clé namespacée de la SOURCE
        // (même sans copie matérialisée — emplacement canonique du trimestre nommé).
        expect(win.cleSource('grillesTemplates', 'a2025')).toBe('a2025_grillesTemplates');
        expect(win.cleSource('echellesTemplates', 'a2025')).toBe('a2025_echellesTemplates');
        // Restent globales (catalogue commun) : cartouches, cours.
        expect(win.cleSource('cartouches_GRILLE_A25', 'a2025')).toBe('cartouches_GRILLE_A25');
        expect(win.cleSource('cours', 'a2025')).toBe('cours');
    });

    it('NAMESPACÉ PUR — pratiques / modalités / données : toujours préfixé par la SOURCE', () => {
        const store = { trimestres: [{ id: 'h2026', actif: true, archive: false }] };
        const win = chargerTrimestres(store);
        expect(win.cleSource('pratiquesConfigurables', 'a2025')).toBe('a2025_pratiquesConfigurables');
        expect(win.cleSource('modalitesEvaluation', 'a2025')).toBe('a2025_modalitesEvaluation');
        expect(win.cleSource('groupeEtudiants', 'a2025')).toBe('a2025_groupeEtudiants');
    });

    it('SANS SWAP — lire a2025 ne change pas le trimestre actif h2026', () => {
        const store = {
            trimestres: [{ id: 'h2026', actif: true, archive: false }],
            a2025_grillesTemplates: [{ id: 'GRILLE_A25' }]
        };
        const win = chargerTrimestres(store);
        win.cleSource('grillesTemplates', 'a2025');
        win.cleSource('pratiquesConfigurables', 'a2025');
        expect(win.obtenirTrimestreId()).toBe('h2026');
        // #358 : pour le trimestre actif non archivé, cle() rend la clé namespacée (h2026_*).
        expect(win.cle('grillesTemplates')).toBe('h2026_grillesTemplates');
        expect(store.trimestres.find(t => t.id === 'h2026').actif).toBe(true);
    });

    it('GARDE — sans trimestreSourceId : repli sur cle() (pas de clé fantôme)', () => {
        const store = { trimestres: [{ id: 'h2026', actif: true, archive: false }] };
        const win = chargerTrimestres(store);
        expect(win.cleSource('grillesTemplates')).toBe(win.cle('grillesTemplates'));
        expect(win.cleSource('pratiquesConfigurables', '')).toBe(win.cle('pratiquesConfigurables'));
    });
});
