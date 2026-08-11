import { describe, it, expect, beforeEach } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// ⌘D DUPLIQUE TOUTE LA MULTI-SÉLECTION (11 août 2026, demande de Grégoire en
// préparant son 601-101 : « je voudrais pouvoir dupliquer d'un coup plusieurs
// éléments sélectionnés »).
//
// ▣ Ce n'était pas un manque isolé, c'était une ASYMÉTRIE. `Supprimer` traite
// la multi-sélection en lot depuis longtemps ; ⌘D ne regardait que
// `etat.selection`. Le défaut était MUET : on allumait cinq blocs, on appuyait,
// on en obtenait un — sans message, sans rien qui dise pourquoi. Même famille
// que les trois défauts silencieux du cycle du 10 août.
//
// ⚠ L'invariant qui coûte cher si on le perd : on ne duplique que les RACINES.
// Un conteneur copie déjà ses descendants. Sélectionner une leçon ET l'une de
// ses activités, sans filtre, produirait une copie de l'activité EN PLUS de
// celle qui vit déjà dans la leçon copiée — un orphelin que rien ne rattache
// et que personne ne verrait avant de le trouver dans la carte.

let store;

// Le stub de `document` du helper rend un objet trop pauvre pour
// `attacherEvenements` (pas de `querySelector`), et le clonage d'une FEUILLE
// construit un vrai élément. On enrichit donc l'élément factice : chaque
// requête rend un autre factice plutôt que `null`, ce qui laisse le module
// traverser ses branches sans jamais déréférencer du vide. On ne teste pas le
// DOM ici — on teste les DONNÉES — mais il doit survivre au passage.
function elementFactice() {
    const el = {
        style: {},
        dataset: {},
        classList: { add() {}, remove() {}, contains: () => false, toggle: () => false },
        addEventListener() {}, removeEventListener() {},
        setAttribute() {}, getAttribute: () => null, removeAttribute() {},
        appendChild(n) { return n; }, removeChild(n) { return n; }, remove() {},
        insertBefore(n) { return n; },
        getBoundingClientRect: () => ({ left: 0, top: 0, width: 140, height: 50, right: 140, bottom: 50 }),
        offsetWidth: 140, offsetHeight: 50, offsetTop: 0, offsetLeft: 0,
        innerHTML: '', textContent: '', children: [], childNodes: [],
        closest: () => null, contains: () => false, focus() {}, blur() {}
    };
    el.querySelector = () => elementFactice();
    el.querySelectorAll = () => [];
    return el;
}

function documentFactice() {
    return {
        addEventListener() {}, removeEventListener() {},
        querySelector: () => null,
        querySelectorAll: () => [],
        getElementById: () => null,
        createElement: () => elementFactice(),
        createElementNS: () => elementFactice(),
        body: Object.assign(elementFactice(), { appendChild(n) { return n; } }),
        documentElement: elementFactice()
    };
}

function monterModule() {
    store = {};
    const db = {
        getSync: (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
        setSync: (k, v) => { store[k] = v; },
        get: async (k, d) => (k in store ? store[k] : d),
        set: async (k, v) => { store[k] = v; }
    };
    const win = chargerScript('js/planification-carte.js', {
        db,
        document: documentFactice(),
        cle: (k) => `a2026_${k}`,
        echapperHtml: (t) => String(t === null || t === undefined ? '' : t),
        requestAnimationFrame: (fn) => { fn(); return 0; }
    });
    win.cle = (k) => `a2026_${k}`;
    win.planificationDonnees = {
        getIndex: () => ({ active: 'carte_1', cartes: [{ id: 'carte_1', nom: 'Test' }] }),
        sauvegarderCarte: () => {},
        chargerCarte: () => null
    };
    return win.planificationCarte;
}

function poser(api, id, type, { titre = type, x = 0, y = 0, parent = null, enfants = [], metadata = {} } = {}) {
    api.etat.noeuds.set(id, { id, type, titre, x, y, parent, enfants, metadata, cloneSourceId: null });
}

function selectionner(api, ...ids) {
    api.etat.multiSelection.clear();
    ids.forEach((id) => api.etat.multiSelection.add(id));
}

describe('⌘D · duplication de la multi-sélection', () => {
    let api;
    beforeEach(() => { api = monterModule(); });

    it('trois blocs sélectionnés donnent TROIS copies', () => {
        poser(api, 'planif-a1', 'activite', { titre: 'Tapawan', x: 10, y: 10 });
        poser(api, 'planif-a2', 'activite', { titre: 'Modelage', x: 10, y: 80 });
        poser(api, 'planif-a3', 'activite', { titre: 'Clôture', x: 10, y: 150 });
        selectionner(api, 'planif-a1', 'planif-a2', 'planif-a3');

        const avant = api.etat.noeuds.size;
        const copies = api.dupliquerSelection();

        expect(copies).toHaveLength(3);
        expect(api.etat.noeuds.size).toBe(avant + 3);
        // Les titres sont préservés, un par original.
        const titres = copies.map((id) => api.etat.noeuds.get(id).titre).sort();
        expect(titres).toEqual(['Clôture', 'Modelage', 'Tapawan']);
    });

    it('les copies DEVIENNENT la sélection — le geste suivant porte sur elles', () => {
        poser(api, 'planif-a1', 'activite', { x: 0, y: 0 });
        poser(api, 'planif-a2', 'activite', { x: 0, y: 60 });
        selectionner(api, 'planif-a1', 'planif-a2');

        const copies = api.dupliquerSelection();

        expect(Array.from(api.etat.multiSelection).sort()).toEqual([...copies].sort());
        expect(api.etat.multiSelection.has('planif-a1')).toBe(false);
        expect(api.etat.multiSelection.has('planif-a2')).toBe(false);
    });

    it('⚠ un conteneur ET son enfant sélectionnés : UNE seule copie, pas d’orphelin', () => {
        poser(api, 'planif-act', 'activite', { titre: 'Tapawan', parent: 'planif-lec' });
        poser(api, 'planif-lec', 'lecon', { titre: 'Leçon 1A', enfants: ['planif-act'] });
        selectionner(api, 'planif-lec', 'planif-act');

        const avant = api.etat.noeuds.size;   // 2
        api.dupliquerSelection();

        // La copie de la leçon embarque son activité : +2 nœuds, pas +3.
        expect(api.etat.noeuds.size).toBe(avant + 2);

        // Et surtout : aucune activité copiée ne pend dans le vide.
        const orphelines = [];
        for (const [, nd] of api.etat.noeuds) {
            if (nd.type === 'activite' && !nd.parent) orphelines.push(nd.id);
        }
        expect(orphelines).toEqual([]);
    });

    it('un seul instantané d’undo pour tout le lot — ⌘Z défait le geste entier', () => {
        poser(api, 'planif-a1', 'activite', { x: 0, y: 0 });
        poser(api, 'planif-a2', 'activite', { x: 0, y: 60 });
        poser(api, 'planif-a3', 'activite', { x: 0, y: 120 });
        selectionner(api, 'planif-a1', 'planif-a2', 'planif-a3');

        api.dupliquerSelection();
        expect(api.etat.noeuds.size).toBe(6);

        api.annuler();
        expect(api.etat.noeuds.size).toBe(3);
    });

    it('sélection SIMPLE : le chemin d’origine est intact', () => {
        poser(api, 'planif-a1', 'activite', { titre: 'Tapawan', x: 30, y: 40 });
        api.etat.multiSelection.clear();
        api.etat.selection = 'planif-a1';

        const copies = api.dupliquerSelection();

        expect(copies).toHaveLength(1);
        expect(api.etat.noeuds.size).toBe(2);
        // Le décalage de courtoisie du clonage unitaire est conservé (+60/+60) :
        // sans lui la copie naît EXACTEMENT sous l'original et paraît absente.
        const copie = api.etat.noeuds.get(copies[0]);
        expect(copie.x).toBe(90);
        expect(copie.y).toBe(100);
    });

    it('rien de sélectionné : aucun nœud créé, aucune erreur', () => {
        poser(api, 'planif-a1', 'activite', {});
        api.etat.multiSelection.clear();
        api.etat.selection = null;

        expect(api.dupliquerSelection()).toEqual([]);
        expect(api.etat.noeuds.size).toBe(1);
    });
});
