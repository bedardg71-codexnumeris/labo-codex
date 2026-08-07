import { describe, it, expect, beforeEach } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// RÉSERVE OUVERTE du 6 août, corrigée le 7 août — l'ancrage HORS CADRE.
//
// Une leçon dont `metadata.semaine` ne correspond à aucune rangée de la grille
// DISPARAISSAIT : les rangées n'accueillent que leur propre numéro, et la zone
// « Non planifié » n'attrapait que `semaine === null`. Deux chemins y menaient —
// le champ « Semaine » de l'inspecteur (aucun attribut `max`) et l'import
// Markdown (`val >= 1`, sans borne haute) ; seul le glisser était protégé.
//
// Décision Grégoire (7 août) : RETOMBER dans « Non planifié », et non borner la
// saisie. La valeur reste donc écrite — si le Cadre du trimestre s'étend plus
// tard, la leçon reprend sa rangée d'elle-même. C'est ce que cette sentinelle
// verrouille, avec la facette que la réserve ne mentionnait pas : le cadre est
// TROUÉ (une semaine de planification n'a pas de numéro), donc une semaine
// manquante au milieu disparaissait au même titre qu'une semaine au-delà.

let store;
let elements;

function monterModule() {
    store = {};
    elements = {
        'planif-sommaire': {
            innerHTML: '',
            querySelector: () => null,
            querySelectorAll: () => []
        }
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
        querySelector: () => fauxElement(),
        querySelectorAll: () => [],
        closest: () => null, contains: () => false,
        offsetWidth: 140, offsetHeight: 50
    });
    const fauxDocument = {
        getElementById: (id) => elements[id] || null,
        querySelectorAll: () => [],
        addEventListener: () => {},
        createElement: fauxElement,
        createElementNS: fauxElement,
        body: { appendChild() {}, removeChild() {} }
    };
    const win = chargerScript('js/planification-carte.js', {
        db,
        cle: (k) => `a2026_${k}`,
        echapperHtml: (t) => String(t ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'),
        requestAnimationFrame: (fn) => { fn(); return 0; },
        document: fauxDocument
    });
    win.cle = (k) => `a2026_${k}`;
    win.planificationDonnees = { getIndex: () => ({ active: 'carte_1' }), sauvegarderCarte: () => {}, chargerCarte: () => null };
    return win.planificationCarte;
}

function poser(api, id, type, { titre = type, x = 0, y = 0, parent = null, enfants = [], metadata = {} } = {}) {
    api.etat.noeuds.set(id, { id, type, titre, x, y, parent, enfants, metadata, cloneSourceId: null });
}

/**
 * Cadre TROUÉ, calqué sur un vrai trimestre : semaines 1-2-3, puis une semaine
 * de planification SANS numéro, puis la semaine 5. Le numéro 4 n'a donc AUCUNE
 * rangée alors qu'il est inférieur au maximum — c'est le cas qu'une simple
 * borne haute (`semaine <= max`) laisserait passer.
 */
function poserCadreTroue() {
    store['a2026_calendrierComplet'] = {
        '2026-08-20': { statut: 'cours', numeroSemaine: 1 },
        '2026-08-27': { statut: 'cours', numeroSemaine: 2 },
        '2026-09-03': { statut: 'cours', numeroSemaine: 3 },
        '2026-09-10': { statut: 'semaine-planification' },
        '2026-09-17': { statut: 'cours', numeroSemaine: 5 }
    };
}

/** Le fragment HTML de la zone « Non planifié », ou '' si elle n'est pas rendue. */
function zoneNonPlanifie(html) {
    const i = html.indexOf('planif-grille-nonplanifie');
    return i === -1 ? '' : html.slice(i);
}

/** Le fragment de la grille AVANT la zone « Non planifié ». */
function zoneGrille(html) {
    const i = html.indexOf('planif-grille-nonplanifie');
    return i === -1 ? html : html.slice(0, i);
}

describe('ancrage hors cadre · la leçon retombe dans « Non planifié »', () => {
    let api;
    beforeEach(() => { api = monterModule(); poserCadreTroue(); });

    it('une semaine AU-DELÀ du cadre ne fait plus disparaître la leçon', () => {
        poser(api, 'planif-lx', 'lecon', { titre: 'Égarée', metadata: { semaine: 42 } });

        api.mettreAJourPlanificateur();
        const html = elements['planif-sommaire'].innerHTML;

        // Le cœur de la réserve : elle est VISIBLE quelque part.
        expect(html).toContain('Égarée');
        expect(zoneNonPlanifie(html)).toContain('Égarée');
        expect(zoneGrille(html)).not.toContain('Égarée');
    });

    it('une semaine dans un TROU du cadre retombe aussi (facette n° 2)', () => {
        // 4 < 5 : une borne haute `semaine <= maxSemaine` la croirait valide.
        poser(api, 'planif-lt', 'lecon', { titre: 'Dans le trou', metadata: { semaine: 4 } });

        api.mettreAJourPlanificateur();
        const html = elements['planif-sommaire'].innerHTML;

        expect(zoneNonPlanifie(html)).toContain('Dans le trou');
        expect(zoneGrille(html)).not.toContain('Dans le trou');
    });

    it('la pastille dit POURQUOI — « Non planifié » ne doit pas avoir l’air d’un effacement', () => {
        poser(api, 'planif-lx', 'lecon', { titre: 'Égarée', metadata: { semaine: 42 } });

        api.mettreAJourPlanificateur();
        const zone = zoneNonPlanifie(elements['planif-sommaire'].innerHTML);

        expect(zone).toContain('Sem. 42 hors cadre');
    });

    it('la saisie de l’enseignant N’EST PAS effacée par le repli', () => {
        poser(api, 'planif-lx', 'lecon', { titre: 'Égarée', metadata: { semaine: 42 } });

        api.mettreAJourPlanificateur();

        // Décision Grégoire : retomber à l'affichage, pas borner à l'écriture.
        expect(api.etat.noeuds.get('planif-lx').metadata.semaine).toBe(42);
    });

    it('la leçon REPREND sa rangée quand le cadre s’étend (auto-guérison)', () => {
        poser(api, 'planif-lx', 'lecon', { titre: 'Égarée', metadata: { semaine: 5 } });

        // Cadre initial SANS la semaine 5.
        store['a2026_calendrierComplet'] = {
            '2026-08-20': { statut: 'cours', numeroSemaine: 1 }
        };
        api.mettreAJourPlanificateur();
        expect(zoneNonPlanifie(elements['planif-sommaire'].innerHTML)).toContain('Égarée');

        // Le Cadre du trimestre gagne la semaine 5 : rien d'autre ne bouge.
        poserCadreTroue();
        api.mettreAJourPlanificateur();
        const html = elements['planif-sommaire'].innerHTML;

        expect(zoneGrille(html)).toContain('Égarée');
        expect(zoneNonPlanifie(html)).not.toContain('Égarée');
        expect(html).not.toContain('hors cadre');
    });

    it('une SÉQUENCE dont l’étendue commence hors cadre retombe elle aussi', () => {
        poser(api, 'planif-lx', 'lecon', { titre: 'Égarée', parent: 'planif-sx', metadata: { semaine: 42 } });
        poser(api, 'planif-sx', 'sequence', { titre: 'Bloc perdu', enfants: ['planif-lx'] });

        api.mettreAJourPlanificateur();
        const html = elements['planif-sommaire'].innerHTML;

        // ⚠ NE PAS chercher le TITRE de la séquence : la leçon l'affiche déjà
        // comme étiquette de contexte, ce qui satisfaisait l'assertion sans que
        // la séquence soit rendue (faux positif attrapé au break-test du
        // 7 août). Seul son propre identifiant de bloc fait foi.
        const marqueur = 'data-grille-type="sequence" data-grille-id="planif-sx"';
        expect(zoneNonPlanifie(html)).toContain(marqueur);
        expect(zoneGrille(html)).not.toContain(marqueur);
    });
});

describe('ancrage hors cadre · non-régression du cas normal', () => {
    let api;
    beforeEach(() => { api = monterModule(); poserCadreTroue(); });

    it('une leçon DANS le cadre reste sur sa rangée, sans pastille', () => {
        poser(api, 'planif-l1', 'lecon', { titre: 'Accueil', metadata: { semaine: 3 } });

        api.mettreAJourPlanificateur();
        const html = elements['planif-sommaire'].innerHTML;

        expect(zoneGrille(html)).toContain('Accueil');
        expect(html).not.toContain('hors cadre');
    });

    it('une leçon SANS semaine reste dans « Non planifié », sans pastille', () => {
        poser(api, 'planif-l0', 'lecon', { titre: 'Errante', metadata: {} });

        api.mettreAJourPlanificateur();
        const html = elements['planif-sommaire'].innerHTML;

        expect(zoneNonPlanifie(html)).toContain('Errante');
        expect(html).not.toContain('hors cadre');
    });

    it('en mode REPLI (aucun cadre), rien n’est hors cadre — les rangées viennent des leçons', () => {
        store['a2026_calendrierComplet'] = {};
        poser(api, 'planif-lx', 'lecon', { titre: 'Égarée', metadata: { semaine: 42 } });

        api.mettreAJourPlanificateur();
        const html = elements['planif-sommaire'].innerHTML;

        // Le repli fabrique les rangées 1..42 : la leçon a une rangée d'accueil.
        expect(zoneGrille(html)).toContain('Égarée');
        expect(html).not.toContain('hors cadre');
    });
});
