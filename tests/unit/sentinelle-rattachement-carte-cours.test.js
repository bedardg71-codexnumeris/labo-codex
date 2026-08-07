import { describe, it, expect, beforeEach } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// RATTACHEMENT CARTE → COURS — lot 1 (7 août 2026).
//
// Pourquoi le champ existe : la carte vit dans `planification_mindmap`,
// NAMESPACÉ par trimestre — elle est enfermée dans sa session. Le cours est une
// collection GLOBALE (`db.getSync('cours', [])`, jamais préfixée) : 601-101 est
// le même objet d'un trimestre à l'autre. Le `coursId` est donc la seule
// identité de la carte qui survive au changement de trimestre.
//
// Ce que cette sentinelle verrouille EN PRIORITÉ n'est pas « le champ se
// sauvegarde » — ça, c'est l'attestation. C'est le cas où la collection
// partagée bouge SOUS la carte : un cours supprimé ne doit jamais rendre un
// alignement inaccessible, et un rattachement mort ne doit jamais se faire
// passer pour une absence de rattachement. (SKILL_integrite_globaux : filtrer
// par IDENTITÉ contre la collection vivante, jamais par un flag recopié.)

let store;

// ⚠ Les dépendances doivent passer par `globaux` : `chargerScript` les injecte
// en PARAMÈTRES de fonction, et une variable libre du script ne se résout PAS
// contre le faux `window`. Les poser sur l'objet retourné laisse le module
// lever `ReferenceError` en silence dans son try/catch (attrapé au 1er jet :
// l'import inter-trimestre rendait null sans que le test sache pourquoi).
let coursActifCourant;

function monterModule({ interTrimestre = false } = {}) {
    store = {};
    coursActifCourant = null;
    // ⚠ Le faux stockage COPIE en lecture comme en écriture, parce que le vrai
    // sérialise (localStorage / IndexedDB). Un stub qui rend l'objet par
    // référence laisse toute mutation atteindre le stockage sans passer par
    // `sauvegarderIndex()` — et le test « ça persiste » passe alors même quand
    // la sauvegarde a été retirée. C'est ce qu'a révélé le break-test F : la
    // sentinelle attestait une persistance qu'elle ne vérifiait pas.
    const copie = (v) => (v === undefined || v === null ? v : JSON.parse(JSON.stringify(v)));
    const db = {
        getSync: (k, d) => (k in store ? copie(store[k]) : (d !== undefined ? d : null)),
        setSync: (k, v) => { store[k] = copie(v); },
        get: async (k, d) => (k in store ? copie(store[k]) : d),
        set: async (k, v) => { store[k] = copie(v); }
    };
    const globaux = {
        db,
        cle: (k) => `a2026_${k}`,
        obtenirCoursActifId: () => coursActifCourant
    };
    if (interTrimestre) {
        globaux.cleSource = (k, tid) => `${tid}_${k}`;
        globaux.obtenirTrimestres = () => [
            { id: 'h2026', nom: 'Hiver 2026' },
            { id: 'a2026', nom: 'Automne 2026' }
        ];
        globaux.obtenirTrimestreId = () => 'a2026';
    }
    const win = chargerScript('js/planification-donnees.js', globaux);
    win.cle = globaux.cle;
    return win;
}

/** Pose un index de cartes minimal dans le trimestre actif. */
function poserCartes(cartes, active) {
    store['a2026_planification_mindmap'] = {
        index: { active: active || cartes[0].id, compteurCartes: cartes.length, cartes },
        cartes: {}
    };
}

function poserCours(liste) {
    store['cours'] = liste;
}

function indexCourant() {
    return store['a2026_planification_mindmap'].index;
}

describe('Rattachement · la porte d’écriture', () => {
    let win, api;
    beforeEach(() => { win = monterModule(); api = win.planificationDonnees; });

    it('rattache, relit, et détache', () => {
        poserCartes([{ id: 'carte_1', nom: 'Alignement' }]);
        poserCours([{ id: 'c-601', code: '601-101' }]);

        expect(api.obtenirCoursDeCarte('carte_1')).toBe(null);

        expect(api.definirCoursDeCarte('carte_1', 'c-601')).toBe(true);
        expect(api.obtenirCoursDeCarte('carte_1')).toBe('c-601');

        expect(api.definirCoursDeCarte('carte_1', null)).toBe(true);
        expect(api.obtenirCoursDeCarte('carte_1')).toBe(null);
    });

    it('le rattachement SURVIT — il est écrit dans le stockage, pas seulement en mémoire', () => {
        poserCartes([{ id: 'carte_1', nom: 'Alignement' }]);
        poserCours([{ id: 'c-601', code: '601-101' }]);
        api.definirCoursDeCarte('carte_1', 'c-601');

        // Relecture par un module fraîchement monté sur le MÊME stockage.
        const donneesEcrites = store['a2026_planification_mindmap'];
        expect(donneesEcrites.index.cartes[0].coursId).toBe('c-601');
    });

    it('détacher RETIRE la clé au lieu de poser une valeur vide', () => {
        poserCartes([{ id: 'carte_1', nom: 'A', coursId: 'c-601' }]);
        api.definirCoursDeCarte('carte_1', null);
        expect('coursId' in indexCourant().cartes[0]).toBe(false);
    });

    it('une écriture sans changement ne réécrit pas le stockage', () => {
        poserCartes([{ id: 'carte_1', nom: 'A', coursId: 'c-601' }]);
        expect(api.definirCoursDeCarte('carte_1', 'c-601')).toBe(false);
    });

    it('une carte inconnue ne crée rien', () => {
        poserCartes([{ id: 'carte_1', nom: 'A' }]);
        expect(api.definirCoursDeCarte('carte_FANTOME', 'c-601')).toBe(false);
        expect(indexCourant().cartes).toHaveLength(1);
    });
});

describe('Rattachement · quand la collection globale bouge sous la carte', () => {
    let win, api;
    beforeEach(() => { win = monterModule(); api = win.planificationDonnees; });

    it('un cours SUPPRIMÉ rend la résolution nulle — la carte, elle, reste intacte', () => {
        poserCartes([{ id: 'carte_1', nom: 'Alignement', coursId: 'c-601' }]);
        poserCours([]); // le cours a disparu du codex

        expect(api.resoudreCoursDeCarte('carte_1')).toBe(null);
        // L'ID reste écrit : on ne purge pas la saisie de l'enseignant parce
        // qu'une autre collection a bougé.
        expect(api.obtenirCoursDeCarte('carte_1')).toBe('c-601');
        expect(indexCourant().cartes[0].nom).toBe('Alignement');
    });

    it('un rattachement ORPHELIN se distingue d’une absence de rattachement', () => {
        poserCartes([
            { id: 'carte_1', nom: 'Orpheline', coursId: 'c-disparu' },
            { id: 'carte_2', nom: 'Jamais rattachée' }
        ]);
        poserCours([{ id: 'c-601', code: '601-101' }]);

        // Les deux résolvent à null — c'est justement pourquoi il faut les
        // distinguer autrement, sinon l'interface dirait « Aucun » à l'une
        // comme à l'autre et effacerait la trace d'un choix réel.
        expect(api.resoudreCoursDeCarte('carte_1')).toBe(null);
        expect(api.resoudreCoursDeCarte('carte_2')).toBe(null);

        expect(api.rattachementOrphelin('carte_1')).toBe(true);
        expect(api.rattachementOrphelin('carte_2')).toBe(false);
    });

    it('le cours revient → le rattachement se rétablit tout seul', () => {
        poserCartes([{ id: 'carte_1', nom: 'A', coursId: 'c-601' }]);
        poserCours([]);
        expect(api.rattachementOrphelin('carte_1')).toBe(true);

        // Réimport du cours (restauration Codex, réserve…) : rien à réassigner.
        poserCours([{ id: 'c-601', code: '601-101' }]);
        expect(api.rattachementOrphelin('carte_1')).toBe(false);
        expect(api.resoudreCoursDeCarte('carte_1').code).toBe('601-101');
    });

    it('une collection `cours` absente ou malformée ne fait rien exploser', () => {
        poserCartes([{ id: 'carte_1', nom: 'A', coursId: 'c-601' }]);
        // Pas de clé 'cours' du tout.
        expect(() => api.resoudreCoursDeCarte('carte_1')).not.toThrow();
        expect(api.resoudreCoursDeCarte('carte_1')).toBe(null);

        store['cours'] = { pas: 'un tableau' };
        expect(() => api.resoudreCoursDeCarte('carte_1')).not.toThrow();
        expect(api.resoudreCoursDeCarte('carte_1')).toBe(null);
    });
});

describe('Rattachement · la fabrique d’entrée d’index', () => {
    let win, api;
    beforeEach(() => { win = monterModule(); api = win.planificationDonnees; });

    it('une carte créée hérite du cours ACTIF', () => {
        coursActifCourant = 'c-601';
        const entree = api.creerEntreeIndex('carte_9', 'Neuve');
        expect(entree.coursId).toBe('c-601');
        expect(entree.id).toBe('carte_9');
        expect(entree.nom).toBe('Neuve');
        expect(entree.dateCreation).toBeTruthy();
    });

    it('sans cours actif, la carte naît SANS champ — pas avec un coursId vide', () => {
        coursActifCourant = null;
        const entree = api.creerEntreeIndex('carte_9', 'Neuve');
        expect('coursId' in entree).toBe(false);
    });

    it('l’initialisation d’un codex neuf passe par la fabrique', () => {
        coursActifCourant = 'c-601';
        const index = api.initialiserSiNecessaire();
        expect(index.cartes[0].coursId).toBe('c-601');
    });
});

describe('Rattachement · il SUIT la carte d’un trimestre à l’autre', () => {
    let win, api;
    beforeEach(() => {
        win = monterModule({ interTrimestre: true });
        api = win.planificationDonnees;
    });

    it('importer la carte du trimestre précédent conserve SON cours, pas le cours actif', () => {
        // C'est le geste que Grégoire refait chaque session (#368).
        store['h2026_planification_mindmap'] = {
            index: { active: 'carte_1', compteurCartes: 1, cartes: [{ id: 'carte_1', nom: '601-101', coursId: 'c-601' }] },
            cartes: { carte_1: { compteur: 0, compteurLiens: 0, noeuds: [], liens: [] } }
        };
        poserCartes([{ id: 'carte_1', nom: 'Vide' }]);
        poserCours([{ id: 'c-601', code: '601-101' }, { id: 'c-602', code: '602-102' }]);
        coursActifCourant = 'c-602'; // un AUTRE cours est actif au moment de l'import

        const nouvelId = api.importerCarteDepuisTrimestre('h2026', 'carte_1');
        expect(nouvelId).toBeTruthy();
        expect(api.obtenirCoursDeCarte(nouvelId)).toBe('c-601');
    });

    it('si le cours de la source n’existe plus ici, on retombe sur le cours actif', () => {
        store['h2026_planification_mindmap'] = {
            index: { active: 'carte_1', compteurCartes: 1, cartes: [{ id: 'carte_1', nom: 'X', coursId: 'c-MORT' }] },
            cartes: { carte_1: { compteur: 0, compteurLiens: 0, noeuds: [], liens: [] } }
        };
        poserCartes([{ id: 'carte_1', nom: 'Vide' }]);
        poserCours([{ id: 'c-602', code: '602-102' }]);
        coursActifCourant = 'c-602';

        const nouvelId = api.importerCarteDepuisTrimestre('h2026', 'carte_1');
        // Un id mort vaut moins que le cours actif : on ne recopie pas.
        expect(api.obtenirCoursDeCarte(nouvelId)).toBe('c-602');
    });
});
