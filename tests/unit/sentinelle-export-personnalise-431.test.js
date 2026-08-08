import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// =======================================================================
// SENTINELLE — le niveau d'export PERSONNALISÉ (#431)
// =======================================================================
//
// Besoin exprimé par Grégoire (8 août, capture Numbers à l'appui) : cocher
// les contenus, choisir l'ordre, se conformer aux gabarits départementaux.
// Décisions actées (plan #431) :
//   • l'ordre porte sur les CONTENUS (4 sections / groupes de colonnes),
//     JAMAIS sur la structure séquences → leçons ;
//   • UN réglage mémorisé (préférence exportPlanPersonnalise), normalisé à
//     la lecture ;
//   • config jamais réglée → on part du preset « En classe » ;
//   • les presets restent des CONTRATS intouchés (harnais 424).

let win;
let exporteur;
let prefStore; // ce que window.obtenirPreference sert au module

function fauxElement() {
    return {
        style: {}, dataset: {}, innerHTML: '', textContent: '',
        classList: { add() {}, remove() {}, contains: () => false, toggle() {} },
        setAttribute() {}, getAttribute: () => null, appendChild() {}, remove() {},
        addEventListener() {}, removeEventListener() {},
        querySelector: () => fauxElement(), querySelectorAll: () => [],
        closest: () => null, contains: () => false, offsetWidth: 140, offsetHeight: 50
    };
}

beforeAll(() => {
    const store = {
        'a2026_productions': [
            { id: 'prod-dissert', nom: 'Dissertation critique', estActive: true, type: 'travail', ponderation: 25, grilleId: 'grille-1', dateEcheance: '2026-10-15' }
        ],
        'a2026_grillesTemplates': [{ id: 'grille-1', nom: 'Grille SRPNF', echelleId: 'ech-1' }],
        'a2026_echellesTemplates': [{ id: 'ech-1', nom: 'Échelle IDME' }]
    };
    const db = {
        getSync: (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
        setSync: (k, v) => { store[k] = v; },
        get: async (k, d) => (k in store ? store[k] : d),
        set: async (k, v) => { store[k] = v; }
    };
    const globaux = {
        db,
        cle: (k) => `a2026_${k}`,
        echapperHtml: (t) => String(t ?? ''),
        requestAnimationFrame: (fn) => { fn(); return 0; },
        navigator: {},
        document: {
            getElementById: () => null,
            querySelectorAll: () => [], querySelector: () => null,
            addEventListener: () => {},
            createElement: fauxElement, createElementNS: fauxElement,
            body: { appendChild() {}, removeChild() {} }
        }
    };
    win = chargerScript('js/planification-carte.js', globaux);
    win.cle = globaux.cle;
    win.planificationDonnees = {
        getIndex: () => ({ active: 'carte_1', cartes: [{ id: 'carte_1', nom: 'Français 601-101' }] }),
        sauvegarderCarte: () => {},
        chargerCarte: () => null
    };
    // La préférence est servie par CE stub — le module doit passer par lui.
    win.obtenirPreference = (cle) => (cle === 'exportPlanPersonnalise' ? prefStore : null);
    chargerScript('js/planification-export.js', globaux, win);
    exporteur = win.planificationExport;

    // Fixture minimale : 1 séquence, 1 leçon complète, 1 orpheline.
    const api = win.planificationCarte;
    api.etat.noeuds.clear();
    api.etat.liens.clear();
    function noeud(id, type, titre, extras) {
        const n = Object.assign(
            { id, type, titre, x: 0, y: 0, parent: null, enfants: [], metadata: {}, cloneSourceId: null },
            extras || {}
        );
        api.etat.noeuds.set(id, n);
        return n;
    }
    const seq = noeud('seq-1', 'sequence', 'Le récit réaliste');
    const l1 = noeud('lecon-1', 'lecon', 'L’incipit', {
        parent: 'seq-1',
        metadata: { semaine: 3, objectifs: [{ id: 'obj-1', texte: 'Analyser un incipit réaliste' }] }
    });
    noeud('act-1', 'activite', 'Atelier d’analyse en équipe', {
        parent: 'lecon-1', metadata: { duree: 45, retroaction: 'orale' }
    });
    noeud('conn-1', 'conceptuelle', 'Le narrateur omniscient', { parent: 'lecon-1' });
    noeud('eval-1', 'evaluation', 'Évaluation de l’incipit', {
        parent: 'lecon-1', metadata: { duree: 30, productionId: 'prod-dissert' }
    });
    l1.enfants = ['act-1', 'conn-1', 'eval-1'];
    seq.enfants = ['lecon-1'];
    noeud('lecon-orph', 'lecon', 'Récupération libre');
});

beforeEach(() => { prefStore = null; });

describe('#431 · sans réglage mémorisé, le Personnalisé part d’« En classe »', () => {
    it('même contenu que le preset : objectifs, activités, durées, rétroactions', () => {
        const doc = exporteur.genererExport('personnalise', 'texte');
        expect(doc).toContain('Niveau : Personnalisé');
        expect(doc).toContain('Analyser un incipit réaliste');
        expect(doc).toContain('Atelier d’analyse en équipe');
        expect(doc).toContain('45 min');
        expect(doc).toContain('Rétroaction : Orale');
        // et pas les contenus de la preuve
        expect(doc).not.toContain('Le narrateur omniscient');
    });

    it('la production sort dans SA section, plus sous l’élément', () => {
        const doc = exporteur.genererExport('personnalise', 'texte');
        expect(doc).toContain('Évaluation : Dissertation critique (25 %)');
    });
});

describe('#431 · les cases filtrent', () => {
    it('activites décochée → les activités disparaissent, le reste tient', () => {
        prefStore = { contenus: { activites: false } };
        const doc = exporteur.genererExport('personnalise', 'texte');
        expect(doc).not.toContain('Atelier d’analyse en équipe');
        expect(doc).toContain('Analyser un incipit réaliste');
    });

    it('evaluations décochée → les lignes ◆ partent, la production de la leçon RESTE', () => {
        prefStore = { contenus: { evaluations: false } };
        const doc = exporteur.genererExport('personnalise', 'texte');
        expect(doc).not.toContain('◆ [Évaluation]');
        // La production est une information de la LEÇON (section productions).
        expect(doc).toContain('Dissertation critique (25 %)');
    });

    it('connaissances cochée → elles entrent, même hors preuve', () => {
        prefStore = { contenus: { connaissances: true } };
        const doc = exporteur.genererExport('personnalise', 'texte');
        expect(doc).toContain('Le narrateur omniscient');
    });
});

describe('#431 · l’ordre réordonne les sections — jamais la structure', () => {
    it('texte : « productions » avant « objectifs » inverse leurs blocs', () => {
        prefStore = { ordre: ['productions', 'objectifs', 'deroulement', 'liens'] };
        const doc = exporteur.genererExport('personnalise', 'texte');
        const iProd = doc.indexOf('Dissertation critique');
        const iObj = doc.indexOf('Objectifs :');
        expect(iProd).toBeGreaterThan(-1);
        expect(iObj).toBeGreaterThan(-1);
        expect(iProd).toBeLessThan(iObj);
        // La structure, elle, ne bouge pas : la séquence chapeaute la leçon.
        expect(doc.indexOf('SÉQUENCE : Le récit réaliste')).toBeLessThan(doc.indexOf('LEÇON : L’incipit'));
    });

    it('TSV : l’ordre des groupes de colonnes suit la config, préfixe fixe', () => {
        prefStore = { ordre: ['productions', 'deroulement', 'objectifs', 'liens'] };
        const entetes = exporteur.genererExport('personnalise', 'tsv').split('\n')[0].split('\t');
        expect(entetes.slice(0, 3)).toEqual(['Séquence', 'Leçon', 'Semaine']);
        expect(entetes.indexOf('Production')).toBeLessThan(entetes.indexOf('Type'));
        expect(entetes.indexOf('Type')).toBeLessThan(entetes.indexOf('Objectifs'));
    });

    it('markdown : les sections suivent l’ordre aussi', () => {
        prefStore = { ordre: ['deroulement', 'objectifs', 'productions', 'liens'] };
        const doc = exporteur.genererExport('personnalise', 'markdown');
        expect(doc.indexOf('**Déroulement**')).toBeLessThan(doc.indexOf('**Objectifs**'));
    });
});

describe('#431 · la config est normalisée — jamais crue sur parole', () => {
    it('ids inconnus retirés, sections manquantes rajoutées en queue', () => {
        const cfg = exporteur.normaliserConfigPersonnalisee({ ordre: ['pirate', 'liens', 'liens'] });
        expect(cfg.ordre).toEqual(['liens', 'objectifs', 'deroulement', 'productions']);
    });

    it('drapeaux non booléens remplacés par le départ « En classe »', () => {
        const cfg = exporteur.normaliserConfigPersonnalisee({ contenus: { objectifs: 'oui', liens: true } });
        expect(cfg.contenus.objectifs).toBe(true);  // défaut En classe
        expect(cfg.contenus.liens).toBe(true);      // valeur fournie
        expect(cfg.contenus.connaissances).toBe(false);
    });

    it('config d’ESSAI (aperçu de la modale) prioritaire sur la préférence', () => {
        prefStore = { contenus: { activites: false } };
        const doc = exporteur.genererExport('personnalise', 'texte', { contenus: { activites: true } });
        expect(doc).toContain('Atelier d’analyse en équipe');
    });
});
