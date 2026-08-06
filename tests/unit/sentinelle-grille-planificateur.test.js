import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// LOT 2 du planificateur en grille (plan du 6 août 2026).
//
// D2 : une rangée par semaine, numérotée à gauche. D5 : les rangées DÉRIVENT
// du calendrier généré par le Cadre du trimestre (parcours chronologique de
// `calendrierComplet`) — la grille ne redemande jamais le nombre de semaines.
// Q1/Q2 : tout ce qui n'a pas d'ancrage vit dans la zone « Non planifié ».
//
// Zéro-dette du même lot : la « Vue calendrier » (rendu de la carte recyclé
// par genererSeancesHTML puis ROGNÉ en post-traitement DOM par organisateur)
// est RETIRÉE — le plan la qualifiait d'irrécupérable pour un planificateur.
// Cette sentinelle verrouille aussi son absence.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const sourceCarte = readFileSync(path.join(racineProjet, 'js', 'planification-carte.js'), 'utf8');
const sourceOrganisateur = readFileSync(path.join(racineProjet, 'js', 'organisateur.js'), 'utf8');
const sourceIndex = readFileSync(path.join(racineProjet, 'index.html'), 'utf8');

// --- Sandbox avec conteneur mesurable ----------------------------------
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
    const fauxDocument = {
        getElementById: (id) => elements[id] || null,
        querySelectorAll: () => [],
        addEventListener: () => {},
        createElement: () => ({ style: {}, classList: { add() {}, remove() {} }, setAttribute() {}, appendChild() {} }),
        body: {}
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

// Calendrier minimal : Sem. 1, Sem. 2, semaine de planification, Sem. 3,
// examens. Les clés sont VOLONTAIREMENT insérées dans le désordre : l'ordre
// des rangées doit venir d'un TRI chronologique des dates, jamais de l'ordre
// d'insertion de l'objet (piège réel : un calendrier régénéré partiellement
// n'a aucune garantie d'ordre).
function poserCalendrier() {
    store['a2026_calendrierComplet'] = {
        '2026-09-08': { statut: 'cours', numeroSemaine: 3 },
        '2026-08-27': { statut: 'cours', numeroSemaine: 2 },
        '2026-09-15': { statut: 'semaine-examens' },
        '2026-08-20': { statut: 'cours', numeroSemaine: 1 },
        '2026-09-02': { statut: 'semaine-planification' },
        '2026-09-01': { statut: 'semaine-planification' }
    };
}

describe('lot 2 · rangées dérivées du calendrier (D5)', () => {
    let api;
    beforeEach(() => { api = monterModule(); });

    it('les rangées suivent l’ordre CHRONOLOGIQUE réel, semaines spéciales incluses', () => {
        poserCalendrier();
        poser(api, 'planif-l1', 'lecon', { titre: 'Accueil', parent: 'planif-s1', metadata: { semaine: 1 } });
        poser(api, 'planif-s1', 'sequence', { titre: 'Ouverture', enfants: ['planif-l1'] });

        api.mettreAJourPlanificateur();
        const html = elements['planif-sommaire'].innerHTML;

        // Les 3 semaines numérotées + 2 rangées spéciales, dans l'ordre.
        const nums = [...html.matchAll(/planif-grille-num">([^<]+)</g)].map((m) => m[1]);
        expect(nums).toEqual(['1', '2', '—', '3', '—']);
        expect(html.indexOf('Semaine de planification')).toBeGreaterThan(-1);
        expect(html.indexOf("Semaine d'examens")).toBeGreaterThan(html.indexOf('Semaine de planification'));
        // Aucun avis de repli : la source est le cadre.
        expect(html).not.toContain('planif-grille-avis');
    });

    it('sans calendrier, repli sur les semaines saisies + avis explicite', () => {
        poser(api, 'planif-l1', 'lecon', { titre: 'Accueil', metadata: { semaine: 4 } });

        api.mettreAJourPlanificateur();
        const html = elements['planif-sommaire'].innerHTML;

        const nums = [...html.matchAll(/planif-grille-num">([^<]+)</g)].map((m) => m[1]);
        expect(nums).toEqual(['1', '2', '3', '4']);
        expect(html).toContain('planif-grille-avis');
        expect(html).toContain('Cadre du trimestre');
    });
});

describe('lot 2 · contenu des rangées et zone « Non planifié » (Q1/Q2)', () => {
    let api;
    beforeEach(() => { api = monterModule(); poserCalendrier(); });

    it('une séquence apparaît sur la rangée de son DÉBUT, une leçon sur SA semaine', () => {
        poser(api, 'planif-l1', 'lecon', { titre: 'Accueil', parent: 'planif-s1', metadata: { semaine: 1 } });
        poser(api, 'planif-l2', 'lecon', { titre: 'Diagnostic', parent: 'planif-s1', metadata: { semaine: 3 } });
        poser(api, 'planif-s1', 'sequence', { titre: 'Ouverture', enfants: ['planif-l1', 'planif-l2'] });

        api.mettreAJourPlanificateur();
        const html = elements['planif-sommaire'].innerHTML;

        const rangees = html.split('planif-grille-rangee');
        const r1 = rangees.find((r) => r.includes('num">1<'));
        const r3 = rangees.find((r) => r.includes('num">3<'));
        expect(r1).toContain('Ouverture');       // séquence à son début
        expect(r1).toContain('Accueil');          // leçon de la semaine 1
        expect(r1).not.toContain('Diagnostic');
        expect(r3).toContain('Diagnostic');       // leçon de la semaine 3
        expect(r3).not.toContain('data-param="planif-s1"'); // la séquence n'est pas dupliquée
        // Étendue affichée sur la séquence (elle s'étale 1–3).
        expect(html).toContain('Sem. 1–3');
    });

    it('séquence vide et leçon sans semaine tombent dans « Non planifié »', () => {
        poser(api, 'planif-s9', 'sequence', { titre: 'Sem. 9 -', enfants: [] });
        poser(api, 'planif-lx', 'lecon', { titre: 'Errante', metadata: {} });

        api.mettreAJourPlanificateur();
        const html = elements['planif-sommaire'].innerHTML;

        const zone = html.slice(html.indexOf('planif-grille-nonplanifie'));
        expect(zone).toContain('Sem. 9 -');
        expect(zone).toContain('Errante');
    });

    it('les gestes de navigation de la palette sont conservés', () => {
        poser(api, 'planif-l1', 'lecon', { titre: 'Accueil', parent: 'planif-s1', metadata: { semaine: 1 } });
        poser(api, 'planif-s1', 'sequence', { titre: 'Ouverture', enfants: ['planif-l1'] });

        api.mettreAJourPlanificateur();
        const html = elements['planif-sommaire'].innerHTML;

        expect(html).toContain('data-action="planificationCarte.ouvrirSequence"');
        expect(html).toContain('data-action="planificationCarte.naviguerSommaireLecon"');
    });

    it('le déroulé d’une leçon se déplie (niveau de détail réglable)', () => {
        poser(api, 'planif-a1', 'activite', { titre: 'Atelier', parent: 'planif-l1', metadata: { duree: 50 } });
        poser(api, 'planif-l1', 'lecon', { titre: 'Accueil', parent: 'planif-s1', enfants: ['planif-a1'], metadata: { semaine: 1 } });
        poser(api, 'planif-s1', 'sequence', { titre: 'Ouverture', enfants: ['planif-l1'] });

        api.mettreAJourPlanificateur();
        let html = elements['planif-sommaire'].innerHTML;
        expect(html).toContain('planificationCarte.basculerDetailLecon');
        expect(html).not.toContain('Atelier');

        api.basculerDetailLecon('planif-l1');
        html = elements['planif-sommaire'].innerHTML;
        expect(html).toContain('Atelier');
        expect(html).toContain('50 min');

        api.basculerDetailLecon('planif-l1');
        expect(elements['planif-sommaire'].innerHTML).not.toContain('Atelier');
    });

    it('voie A : une sous-séquence garde son chemin et n’apparaît qu’une fois', () => {
        poser(api, 'planif-l1', 'lecon', { titre: 'Accueil', parent: 'planif-sA', metadata: { semaine: 2 } });
        poser(api, 'planif-sA', 'sequence', { titre: 'Ouverture', parent: 'planif-th', enfants: ['planif-l1'] });
        poser(api, 'planif-th', 'sequence', { titre: 'Thème 1', enfants: ['planif-sA'] });

        api.mettreAJourPlanificateur();
        const html = elements['planif-sommaire'].innerHTML;

        expect(html).toContain('Thème 1 › Ouverture');
        expect((html.match(/data-param="planif-sA"/g) || [])).toHaveLength(1);
    });
});

describe('lot 2 · zéro-dette — l’ancienne Vue calendrier est morte', () => {
    it('plus AUCUNE trace du rendu recyclé ni du post-traitement DOM', () => {
        expect(sourceCarte).not.toMatch(/genererSeancesHTML/);
        expect(sourceCarte).not.toMatch(/genererLeconBloc/);
        expect(sourceOrganisateur).not.toMatch(/rafraichirCalendrier/);
        expect(sourceOrganisateur).not.toMatch(/ajouterDatesAuxLecons/);
        expect(sourceIndex).not.toMatch(/org-calendrier-contenu/);
        expect(sourceIndex).not.toMatch(/planif-org-calendrier/);
    });

    it('la palette s’appelle Planificateur et rend la grille', () => {
        expect(sourceIndex).toMatch(/⠿<\/span>Planificateur</);
        expect(sourceCarte).toMatch(/function mettreAJourPlanificateur\(\)/);
        expect(sourceCarte).not.toMatch(/function mettreAJourSommaire\(\)/);
    });

    it('l’en-tête de dates réelles de l’Organisateur SURVIT (il n’était pas la Vue calendrier)', () => {
        expect(sourceOrganisateur).toMatch(/function ancrageLeconPourDates/);
    });
});
