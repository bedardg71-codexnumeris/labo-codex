import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// F1 (exercice d'alignement 601-101, 6 août 2026) — L'objectif de leçon était
// introuvable : il vivait dans `planification_seances` (clé NUE partagée entre
// tous les trimestres ET la démo, dictionnaire PLAT par id de leçon alors que
// ces ids ne sont uniques que PAR CARTE — #367 / rouge D1 de l'audit du 5 août),
// et n'était visible que dans une vue qui MASQUE la carte. Le badge 🎯 qui
// aurait pu le signaler n'apparaissait QUE si un objectif existait déjà : pour
// découvrir la fonction, il fallait s'en être déjà servi.
//
// Correctif : l'objectif vit désormais sur le nœud (`metadata.objectif`), donc
// dans `planification_mindmap` — clé propre du module, namespacée par trimestre,
// qui suit les clones, copies et imports inter-trimestre.
//
// Cette sentinelle verrouille :
//   A. le comportement de la migration (fonctionnel, sur la VRAIE fonction) ;
//   B. les invariants de rendu et de routage (source, couplage DOM assumé).

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const source = readFileSync(path.join(racineProjet, 'js', 'planification-carte.js'), 'utf8');

// --- Sandbox ------------------------------------------------------------
let store;
let cartesSauvees;
let indexCourant;

function monterModule({ index = { active: 'carte_1' }, sauvegardeLance = false } = {}) {
    store = {};
    cartesSauvees = [];
    indexCourant = index;

    const db = {
        getSync: (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
        setSync: (k, v) => { store[k] = v; },
        get: async (k, d) => (k in store ? store[k] : d),
        set: async (k, v) => { store[k] = v; }
    };

    const planificationDonnees = {
        getIndex: () => indexCourant,
        sauvegarderCarte: (id, donnees) => {
            if (sauvegardeLance) throw new Error('échec de persistance simulé');
            cartesSauvees.push({ id, donnees });
        },
        chargerCarte: () => null
    };

    const win = chargerScript('js/planification-carte.js', {
        db,
        cle: (k) => `a2026_${k}`
    });
    // Le module namespace ses clés via `window.cle(...)` : le sandbox doit le
    // porter sur le faux window, pas seulement comme global.
    win.cle = (k) => `a2026_${k}`;
    win.planificationDonnees = planificationDonnees;
    return win.planificationCarte;
}

function poserLecon(api, id, metadata = {}) {
    api.etat.noeuds.set(id, { id, type: 'lecon', titre: 'Leçon', metadata, enfants: [], parent: null });
}

// =======================================================================
// A. MIGRATION — comportement réel
// =======================================================================
describe('F1 · migration des objectifs vers metadata.objectif', () => {
    let api;
    beforeEach(() => { api = monterModule(); });

    it('bascule un objectif de l’ancienne clé vers le nœud', () => {
        poserLecon(api, 'planif-n1');
        store['a2026_planification_seances'] = {
            'planif-n1': { objectifPersonnalise: 'Repérer les marqueurs de relation' }
        };

        const migres = api.migrerObjectifsVersMetadata();

        expect(migres).toBe(1);
        expect(api.etat.noeuds.get('planif-n1').metadata.objectif)
            .toBe('Repérer les marqueurs de relation');
    });

    it('retire l’ancienne source après migration (une seule vérité)', () => {
        poserLecon(api, 'planif-n1');
        store['a2026_planification_seances'] = {
            'planif-n1': { objectifPersonnalise: 'Objectif A', notes: 'garder ces notes' }
        };

        api.migrerObjectifsVersMetadata();

        const seances = store['a2026_planification_seances'];
        expect(seances['planif-n1'].objectifPersonnalise).toBeUndefined();
        // Les notes NE sont PAS touchées : elles restent dans cette clé
        // jusqu'à ce que #367 soit tranché.
        expect(seances['planif-n1'].notes).toBe('garder ces notes');
    });

    it('est idempotente : ne réécrit pas un objectif déjà porté par le nœud', () => {
        poserLecon(api, 'planif-n1', { objectif: 'Objectif déjà migré' });
        store['a2026_planification_seances'] = {
            'planif-n1': { objectifPersonnalise: 'Vieille valeur' }
        };

        expect(api.migrerObjectifsVersMetadata()).toBe(0);
        expect(api.etat.noeuds.get('planif-n1').metadata.objectif).toBe('Objectif déjà migré');
    });

    it('ignore les objectifs vides et les nœuds qui ne sont pas des leçons', () => {
        poserLecon(api, 'planif-vide');
        api.etat.noeuds.set('planif-act', {
            id: 'planif-act', type: 'activite', metadata: {}, enfants: [], parent: null
        });
        store['a2026_planification_seances'] = {
            'planif-vide': { objectifPersonnalise: '   ' },
            'planif-act': { objectifPersonnalise: 'ne devrait pas migrer' }
        };

        expect(api.migrerObjectifsVersMetadata()).toBe(0);
        expect(api.etat.noeuds.get('planif-vide').metadata.objectif).toBeUndefined();
        expect(api.etat.noeuds.get('planif-act').metadata.objectif).toBeUndefined();
    });

    it('ne purge JAMAIS l’ancienne source si la sauvegarde échoue', () => {
        api = monterModule({ sauvegardeLance: true });
        poserLecon(api, 'planif-n1');
        store['a2026_planification_seances'] = {
            'planif-n1': { objectifPersonnalise: 'Objectif à ne pas perdre' }
        };

        expect(api.migrerObjectifsVersMetadata()).toBe(0);
        expect(store['a2026_planification_seances']['planif-n1'].objectifPersonnalise)
            .toBe('Objectif à ne pas perdre');
    });

    it('ne migre rien s’il n’y a pas de carte active (sauvegarder() serait un no-op silencieux)', () => {
        api = monterModule({ index: null });
        poserLecon(api, 'planif-n1');
        store['a2026_planification_seances'] = {
            'planif-n1': { objectifPersonnalise: 'Objectif à ne pas perdre' }
        };

        expect(api.migrerObjectifsVersMetadata()).toBe(0);
        // La garde protège contre la perte sèche : rien muté, rien purgé.
        expect(api.etat.noeuds.get('planif-n1').metadata.objectif).toBeUndefined();
        expect(store['a2026_planification_seances']['planif-n1'].objectifPersonnalise)
            .toBe('Objectif à ne pas perdre');
    });
});

// =======================================================================
// B. LECTURE — l'objectif se lit sur le nœud
// =======================================================================
describe('F1 · objectifDeLecon lit le nœud, jamais l’ancienne clé', () => {
    let api;
    beforeEach(() => { api = monterModule(); });

    it('retourne l’objectif porté par metadata', () => {
        expect(api.objectifDeLecon({ metadata: { objectif: 'Analyser un texte' } }))
            .toBe('Analyser un texte');
    });

    it('retourne une chaîne vide quand rien n’est posé (jamais undefined)', () => {
        expect(api.objectifDeLecon({ metadata: {} })).toBe('');
        expect(api.objectifDeLecon({})).toBe('');
        expect(api.objectifDeLecon(null)).toBe('');
    });
});

// =======================================================================
// C. RENDU ET ROUTAGE — invariants de source (couplage DOM assumé)
// =======================================================================
describe('F1 · invariants de rendu et de routage', () => {
    it('le badge 🎯 est rendu pour TOUTE leçon, pas seulement celles qui ont un objectif', () => {
        // Cause racine de F1 : l'ancien badge était conditionné à la présence
        // d'un objectif, donc la fonction ne se découvrait jamais.
        expect(source).toMatch(/estLecon\s*\n?\s*\?\s*'<span class="planif-badge-objectif'/);
        expect(source).toContain('planif-badge-objectif--vide');
    });

    it('ne réintroduit pas l’ancien badge conditionné aux données de séances', () => {
        expect(source).not.toMatch(/_seancesDOM\[n\.id\]\.objectifPersonnalise/);
        expect(source).not.toContain('var _seancesDOM');
    });

    it('la vue leçon route le champ « objectif » vers le nœud, pas vers CLE_SEANCES', () => {
        expect(source).toMatch(/data-champ="objectif"/);
        expect(source).toMatch(/if \(champ === 'objectif'\)[\s\S]{0,260}noeud\.metadata\.objectif = /);
        // L'ancien champ ne doit plus être écrit par la vue leçon.
        expect(source).not.toMatch(/data-champ="objectifPersonnalise"/);
    });

    it('la saisie sur la carte écrit dans metadata.objectif', () => {
        expect(source).toMatch(/donnees\.metadata\.objectif = objectifEl\.textContent/);
    });

    it('le badge n’enclenche pas le déplacement du bloc', () => {
        // Le mousedown du bloc démarre le drag : le badge doit l'intercepter.
        expect(source).toMatch(/badgeObjectif\.addEventListener\('mousedown'[\s\S]{0,120}stopPropagation/);
    });
});
