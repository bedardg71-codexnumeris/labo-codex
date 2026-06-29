import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// Sentinelle des HELPERS de résolution namespacée des modèles (#358, Option A).
//
// CE QU'ELLE VERROUILLE :
//   1. toutesGrillesTravail / toutesEchellesTravail — UNION DÉDUPLIQUÉE des
//      `<trim>_grillesTemplates` / `<trim>_echellesTemplates` de tous les trimestres
//      vivants (sites POOL_INTER_TRIMESTRE). Premier gagnant sur collision d'id.
//      NE consulte PAS le catalogue de gabarits.
//   2. resoudreModeleParId — résolution PAR ID grade-bearing : trimestre ACTIF d'abord
//      (cle()), puis REPLI sur l'union inter-trimestre. Un id créé dans un autre
//      trimestre (ex. grille de dépistage h2026 lue depuis a2025) doit rester résoluble.
//
// BREAK-TEST (SKILL_verification_adverse, P2) : neutraliser le repli pool dans
// resoudreModeleParId (retourner null au lieu de chercher dans _toutesModelesTravail)
// fait ROUGIR « résout un id d'un AUTRE trimestre ». Restreindre l'union à un seul
// trimestre fait rougir « union dédupliquée multi-trimestre ».

function dbDepuisStore(store) {
    return {
        get: async (c) => (c in store ? store[c] : null),
        getSync: (c, d) => (c in store ? store[c] : (d !== undefined ? d : null)),
        set: async (c, v) => { store[c] = v; },
        setSync: (c, v) => { store[c] = v; }
    };
}

// h2026 ACTIF, a2025 ARCHIVÉ. Chacun porte ses modèles namespacés ; G_DUP existe dans
// les deux avec un contenu DIVERGENT (test du « premier gagnant »).
function storeBase() {
    return {
        trimestres: [
            { id: 'h2026', actif: true, archive: false },
            { id: 'a2025', actif: false, archive: true }
        ],
        h2026_grillesTemplates: [
            { id: 'G_H', nom: 'Grille H2026' },
            { id: 'G_DUP', nom: 'DUP côté h2026' }
        ],
        a2025_grillesTemplates: [
            { id: 'G_A', nom: 'Grille A2025' },
            { id: 'G_DUP', nom: 'DUP côté a2025' }
        ],
        h2026_echellesTemplates: [{ id: 'E_H', niveaux: 4 }],
        a2025_echellesTemplates: [{ id: 'E_A', niveaux: 6 }]
    };
}

function charger(store) {
    return chargerScript('js/trimestres.js', { db: dbDepuisStore(store) });
}

describe('#358 · helpers de résolution namespacée des modèles', () => {
    it('toutesGrillesTravail — union DÉDUPLIQUÉE multi-trimestre (premier gagnant sur collision)', () => {
        const win = charger(storeBase());
        const grilles = win.toutesGrillesTravail();
        const ids = grilles.map(g => g.id).sort();
        expect(ids).toEqual(['G_A', 'G_DUP', 'G_H']);                 // G_DUP une seule fois
        // Premier gagnant = h2026 (en tête de obtenirTrimestres()).
        expect(grilles.find(g => g.id === 'G_DUP').nom).toBe('DUP côté h2026');
    });

    it('toutesEchellesTravail — union des échelles de tous les trimestres', () => {
        const win = charger(storeBase());
        expect(win.toutesEchellesTravail().map(e => e.id).sort()).toEqual(['E_A', 'E_H']);
    });

    it('resoudreModeleParId — trimestre ACTIF d’abord (G_H résout depuis h2026)', () => {
        const win = charger(storeBase());
        const g = win.resoudreModeleParId('grille', 'G_H');
        expect(g && g.nom).toBe('Grille H2026');
    });

    it('resoudreModeleParId — REPLI POOL : un id d’un AUTRE trimestre reste résoluble', () => {
        const win = charger(storeBase());
        // G_A / E_A n'existent QUE dans a2025 (archivé, non actif) → seul le repli pool les trouve.
        expect(win.resoudreModeleParId('grille', 'G_A')?.nom).toBe('Grille A2025');
        expect(win.resoudreModeleParId('echelle', 'E_A')?.niveaux).toBe(6);
    });

    it('resoudreModeleParId — collision d’id : la version du trimestre ACTIF gagne', () => {
        const win = charger(storeBase());
        expect(win.resoudreModeleParId('grille', 'G_DUP')?.nom).toBe('DUP côté h2026');
    });

    it('resoudreModeleParId — id inconnu / id vide → null (ne consulte pas le catalogue)', () => {
        const win = charger(storeBase());
        expect(win.resoudreModeleParId('grille', 'G_INCONNU')).toBeNull();
        expect(win.resoudreModeleParId('echelle', '')).toBeNull();
        expect(win.resoudreModeleParId('grille', null)).toBeNull();
    });
});
