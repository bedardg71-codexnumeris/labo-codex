import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE #578 (29 août 2026) — LE DIAGNOSTIC « GRILLES AVEC / SANS
// echelleId » DIT-IL VRAI ?
//
// Grégoire a arbitré #578 en option A : MESURER AVANT DE CODER. Le chiffre que
// rend `_diagnostiquerEchellesGrilles` décide si une cartouche neuve peut
// prendre ses colonnes de `grille.echelleId` sans se retrouver vide. Un
// diagnostic qui compte peut rendre « 0 » pour deux raisons opposées : parce
// qu'il n'y a rien, ou parce qu'il ne lit rien (#506, #511, banc du 28 août).
// Les deux se ressemblent à l'écran. Ce banc tient donc les bords suivants :
//   A — sur des données réelles à deux trimestres, il VOIT chaque grille, la
//       classe (sans / résolue / introuvable) et rend des comptes exacts ;
//   B — une clé globale partagée par deux trimestres n'est comptée qu'une fois ;
//   C — il lit la SOURCE RÉELLE (`db.get`), pas le cache du trimestre actif ;
//   D — il n'écrit jamais.

/* ------------------------------------------------------------------ harnais */

function elementFictif(valeur = '') {
    return {
        value: valeur, innerHTML: '', textContent: '', checked: false,
        style: {}, dataset: {},
        classList: { add() {}, remove() {}, contains: () => false },
        querySelectorAll: () => [], querySelector: () => null,
        appendChild() {}, addEventListener() {}, focus() {}, closest: () => null
    };
}

function monter(store) {
    const ecritures = [];
    const lecturesSync = [];
    const els = {};
    const doc = {
        getElementById: (id) => (els[id] || (els[id] = elementFictif())),
        querySelector: () => null, querySelectorAll: () => [], addEventListener() {},
        createElement: () => elementFictif()
    };
    const globaux = {
        db: {
            // Source RÉELLE : seule voie qui rend les grilles et les échelles.
            get: async (k, d) => (k in store ? JSON.parse(JSON.stringify(store[k])) : (d !== undefined ? d : null)),
            // Cache du trimestre actif : ne connaît que `trimestres`. Un diagnostic
            // qui lirait les grilles par ici compterait des zéros.
            getSync: (k, d) => { lecturesSync.push(k); return k === 'trimestres' ? store.trimestres : (d !== undefined ? d : null); },
            set: async (k) => { ecritures.push(k); },
            setSync: (k) => { ecritures.push(k); },
            modifier: async (k) => { ecritures.push(k); }
        },
        cle: (k) => 'a2026_' + k,
        echapperHtml: (t) => String(t == null ? '' : t),
        alert: () => {}, confirm: () => true,
        notifications: { succes() {}, erreur() {}, info() {}, warning() {} },
        genererIdUnique: (p) => p + 'x',
        GabaritsUtils: new Proxy({}, { get: () => (() => []) }),
        BibliothequeUI: new Proxy({}, { get: () => (() => '') }),
        cartoucheActuel: null,
        document: doc
    };
    const win = chargerScript('js/cartouches.js', globaux);
    return { win, ecritures, lecturesSync };
}

const STORE_DEUX_TRIMESTRES = () => ({
    trimestres: [{ id: 'a2025', actif: false }, { id: 'a2026', actif: true }],
    // a2025 : trimestre archivé, copie namespacée (prioritaire sur la globale)
    a2025_grillesTemplates: [
        { id: 'G_OLD', nom: 'Ancienne', echelleId: 'ECH_DISPARUE' }
    ],
    a2025_echellesTemplates: [{ id: 'ECH_A', nom: 'A' }],
    // a2026 : pas de copie → clé globale partagée
    grillesTemplates: [
        { id: 'GRILLE_GENERIQUE', nom: 'Générique', echelleId: 'ECHELLE_GENERIQUE', estDemo: true },
        { id: 'G_1', nom: 'Dissertation', criteres: [] },
        { id: 'G_2', nom: 'Analyse', echelleId: 'ECH_2026' }
    ],
    echellesTemplates: [{ id: 'ECHELLE_GENERIQUE' }, { id: 'ECH_2026' }]
});

/* ----------------------------------------------------------------------- A */

describe('#578 · A — deux trimestres, trois statuts, comptes exacts', () => {
    it('voit chaque grille et la classe sans / résolue / introuvable', async () => {
        const { win } = monter(STORE_DEUX_TRIMESTRES());
        const r = await win._diagnostiquerEchellesGrilles();

        expect(r.total).toBe(4);
        expect(r.avec).toBe(3);
        expect(r.sans).toBe(1);
        expect(r.resolues).toBe(2);
        expect(r.introuvables).toBe(1);

        const statut = Object.fromEntries(r.lignes.map(l => [l.grilleId, l.statut]));
        expect(statut).toEqual({
            G_OLD: 'introuvable',
            GRILLE_GENERIQUE: 'resolue',
            G_1: 'sans',
            G_2: 'resolue'
        });
    });

    it('la copie namespacée prime sur la clé globale, et la démo est marquée', async () => {
        const { win } = monter(STORE_DEUX_TRIMESTRES());
        const r = await win._diagnostiquerEchellesGrilles();
        const old = r.lignes.find(l => l.grilleId === 'G_OLD');
        expect(old.cle).toBe('a2025_grillesTemplates');
        expect(old.cleEchelles).toBe('a2025_echellesTemplates');
        expect(r.lignes.find(l => l.grilleId === 'GRILLE_GENERIQUE').demo).toBe(true);
        expect(r.lignes.find(l => l.grilleId === 'G_1').demo).toBe(false);
    });
});

/* ----------------------------------------------------------------------- B */

describe('#578 · B — une clé partagée n\'est comptée qu\'une fois', () => {
    it('deux trimestres sans copie lisent la même clé globale : un seul compte', async () => {
        const store = STORE_DEUX_TRIMESTRES();
        delete store.a2025_grillesTemplates;
        delete store.a2025_echellesTemplates;
        const { win } = monter(store);
        const r = await win._diagnostiquerEchellesGrilles();

        expect(r.total).toBe(3);
        expect(Object.keys(r.parCle)).toEqual(['grillesTemplates']);
        expect(r.parCle.grillesTemplates.trimestres).toEqual(['a2025', 'a2026']);
        expect(r.parCle.grillesTemplates).toMatchObject({ total: 3, avec: 2, sans: 1, resolues: 2, introuvables: 0 });
    });
});

/* ----------------------------------------------------------------------- C */

describe('#578 · C — il lit la source réelle, pas le cache', () => {
    it('les grilles ne viennent JAMAIS de getSync', async () => {
        const { win, lecturesSync } = monter(STORE_DEUX_TRIMESTRES());
        const r = await win._diagnostiquerEchellesGrilles();
        expect(r.total).toBe(4);
        expect(lecturesSync.filter(k => k !== 'trimestres')).toEqual([]);
    });

    it('sans aucune clé lisible, il rend zéro ET aucune clé — pas un zéro muet', async () => {
        const { win } = monter({ trimestres: [{ id: 'a2026', actif: true }] });
        const r = await win._diagnostiquerEchellesGrilles();
        expect(r.total).toBe(0);
        expect(r.parCle).toEqual({});
        expect(r.lignes).toEqual([]);
    });
});

/* ----------------------------------------------------------------------- D */

describe('#578 · D — lecture seule', () => {
    it('aucune écriture, sur des données à deux trimestres', async () => {
        const { win, ecritures } = monter(STORE_DEUX_TRIMESTRES());
        await win._diagnostiquerEchellesGrilles();
        expect(ecritures).toEqual([]);
    });
});
