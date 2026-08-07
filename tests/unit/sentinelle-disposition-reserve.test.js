import { describe, it, expect, beforeEach } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// DISPOSITION DE LA RÉSERVE « NON PLANIFIÉ » (7 août 2026).
//
// Proposition de Grégoire du 6 août, tranchée le 7 : offrir DEUX dispositions
// et laisser l'utilisateur choisir selon son écran.
//   'bas'    — la réserve sous la grille (défaut historique) ;
//   'gauche' — la réserve en colonne à côté, où elle cesse de défiler avec la
//              grille : on y PUISE des pastilles pendant que la grille défile.
//
// ⚠ CE QUE CETTE SENTINELLE VERROUILLE EN PRIORITÉ : que le GLISSER ne connaisse
// pas la disposition. Le dépôt « ici = désancrer » repose sur l'attribut
// `data-grille-semaine=""` ; un mode qui le changerait casserait le dépôt en
// silence, sans qu'aucun test de rendu ne bouge.
//
// (L'arithmétique du plancher de largeur — sans lequel la colonne ne laisse
// qu'une pastille par rangée — est verrouillée dans
// `sentinelle-largeur-planificateur`, volet 3.)

let store;
let elements;
let prefs;

function monterModule() {
    store = {};
    prefs = {};
    elements = {
        'planif-sommaire': { innerHTML: '', querySelector: () => null, querySelectorAll: () => [] }
    };
    const db = {
        getSync: (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
        setSync: (k, v) => { store[k] = v; },
        get: async (k, d) => (k in store ? store[k] : d),
        set: async (k, v) => { store[k] = v; }
    };
    const fauxElement = () => ({
        style: {}, dataset: {}, innerHTML: '', textContent: '',
        classList: { add() {}, remove() {}, contains: () => false, toggle() {} },
        setAttribute() {}, getAttribute: () => null, appendChild() {}, remove() {},
        addEventListener() {}, removeEventListener() {},
        querySelector: () => fauxElement(), querySelectorAll: () => [],
        closest: () => null, contains: () => false, offsetWidth: 140, offsetHeight: 50
    });
    const fauxDocument = {
        getElementById: (id) => elements[id] || null,
        querySelectorAll: () => [], addEventListener: () => {},
        createElement: fauxElement, createElementNS: fauxElement,
        body: { appendChild() {}, removeChild() {} }
    };
    const win = chargerScript('js/planification-carte.js', {
        db,
        cle: (k) => `a2026_${k}`,
        echapperHtml: (t) => String(t ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'),
        requestAnimationFrame: (fn) => { fn(); return 0; },
        document: fauxDocument,
        obtenirPreference: (k) => prefs[k],
        definirPreference: (k, v) => { prefs[k] = v; }
    });
    win.cle = (k) => `a2026_${k}`;
    win.planificationDonnees = { getIndex: () => ({ active: 'carte_1' }), sauvegarderCarte: () => {}, chargerCarte: () => null };
    return win.planificationCarte;
}

function poser(api, id, type, { titre = type, parent = null, enfants = [], metadata = {} } = {}) {
    api.etat.noeuds.set(id, { id, type, titre, x: 0, y: 0, parent, enfants, metadata, cloneSourceId: null });
}

function poserCadre() {
    store['a2026_calendrierComplet'] = {
        '2026-08-20': { statut: 'cours', numeroSemaine: 1 },
        '2026-08-27': { statut: 'cours', numeroSemaine: 2 }
    };
}

/** Une carte avec une leçon placée et une leçon en réserve. */
function poserCarteMixte(api) {
    poser(api, 'planif-l1', 'lecon', { titre: 'Placée', metadata: { semaine: 1 } });
    poser(api, 'planif-lx', 'lecon', { titre: 'En réserve', metadata: {} });
}

const rendu = () => elements['planif-sommaire'].innerHTML;

let api;
beforeEach(() => { api = monterModule(); poserCadre(); });

describe('Disposition · la préférence', () => {
    it('le défaut est « bas » — la disposition historique', () => {
        expect(api.dispositionReserve()).toBe('bas');
    });

    it('une valeur inconnue retombe sur « bas » plutôt que de casser le rendu', () => {
        prefs.planifReserveDisposition = 'diagonale';
        expect(api.dispositionReserve()).toBe('bas');
    });

    it('la bascule permute et MÉMORISE', () => {
        api.basculerDispositionReserve();
        expect(prefs.planifReserveDisposition).toBe('gauche');
        expect(api.dispositionReserve()).toBe('gauche');

        api.basculerDispositionReserve();
        expect(prefs.planifReserveDisposition).toBe('bas');
    });
});

describe('Disposition · le rendu', () => {
    it('en « bas », la réserve suit la grille et il n’y a pas d’enveloppe', () => {
        poserCarteMixte(api);
        api.mettreAJourPlanificateur();
        const html = rendu();

        expect(html).not.toContain('planif-cotecote');
        expect(html).not.toContain('planif-reserve-colonne');
        // La grille vient AVANT la réserve.
        expect(html.indexOf('planif-grille-rangee')).toBeLessThan(html.indexOf('planif-grille-nonplanifie'));
    });

    it('en « gauche », la réserve PRÉCÈDE la grille dans une enveloppe', () => {
        prefs.planifReserveDisposition = 'gauche';
        poserCarteMixte(api);
        api.mettreAJourPlanificateur();
        const html = rendu();

        expect(html).toContain('planif-cotecote');
        expect(html).toContain('planif-reserve-colonne');
        // C'est l'ORDRE qui produit la colonne de gauche.
        expect(html.indexOf('planif-grille-nonplanifie')).toBeLessThan(html.indexOf('planif-grille-rangee'));
    });

    it('l’enveloppe est refermée — un div ouvert casserait tout ce qui suit', () => {
        prefs.planifReserveDisposition = 'gauche';
        poserCarteMixte(api);
        api.mettreAJourPlanificateur();
        const html = rendu();

        const ouvertures = (html.match(/<div/g) || []).length;
        const fermetures = (html.match(/<\/div>/g) || []).length;
        expect(ouvertures).toBe(fermetures);
    });

    it('les deux dispositions rendent les MÊMES éléments — seul l’ordre change', () => {
        poserCarteMixte(api);
        api.mettreAJourPlanificateur();
        const bas = rendu();

        prefs.planifReserveDisposition = 'gauche';
        api.mettreAJourPlanificateur();
        const gauche = rendu();

        ['Placée', 'En réserve'].forEach((t) => {
            expect(bas).toContain(t);
            expect(gauche).toContain(t);
        });
        // Autant de rangées de semaine d'un côté que de l'autre.
        const compter = (h) => (h.match(/planif-grille-rangee/g) || []).length;
        expect(compter(gauche)).toBe(compter(bas));
    });

    it('sans rien en réserve, aucune colonne vide n’est fabriquée', () => {
        prefs.planifReserveDisposition = 'gauche';
        poser(api, 'planif-l1', 'lecon', { titre: 'Placée', metadata: { semaine: 1 } });
        api.mettreAJourPlanificateur();

        expect(rendu()).not.toContain('planif-grille-nonplanifie');
    });
});

describe('Disposition · le GLISSER ne doit pas la connaître', () => {
    it('la cible de dépôt « désancrer » est identique dans les deux modes', () => {
        // C'est LE point critique : le dépôt repose sur `data-grille-semaine=""`.
        // Un mode qui changerait cet attribut casserait le désancrage en
        // silence — le rendu paraîtrait juste, le geste ne ferait plus rien.
        poserCarteMixte(api);

        api.mettreAJourPlanificateur();
        expect(rendu()).toContain('planif-grille-nonplanifie" data-grille-semaine=""');

        prefs.planifReserveDisposition = 'gauche';
        api.mettreAJourPlanificateur();
        expect(rendu()).toContain('planif-reserve-colonne" data-grille-semaine=""');
    });

    it('les rangées gardent leur numéro de semaine en mode colonne', () => {
        prefs.planifReserveDisposition = 'gauche';
        poserCarteMixte(api);
        api.mettreAJourPlanificateur();

        expect(rendu()).toContain('data-grille-semaine="1"');
        expect(rendu()).toContain('data-grille-semaine="2"');
    });
});
