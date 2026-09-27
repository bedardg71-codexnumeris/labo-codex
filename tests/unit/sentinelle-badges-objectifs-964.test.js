import { describe, it, expect, beforeEach } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// #964 — « MES BADGES SUIVENT MES OBJECTIFS » (27 sept. 2026)
//
// Décision didactique de Grégoire : une évaluation se relie UNIQUEMENT à des
// objectifs, cochés dans son Inspecteur — ceux de sa leçon ou d'une leçon
// placée avant elle (choix du 27 sept.). Un seul geste, un seul signal.
//
// Ce que cette sentinelle garde :
//   (a) une carte qui n'utilise que des liens « se vérifie par » (et un ancien
//       verbe lu comme tel) garde EXACTEMENT ses états, Exposé mis à part —
//       l'état attendu a été mesuré en exécutant le code de `main` (df359bf)
//       sur la même carte, puis figé ici ;
//   (b) une carte qui n'utilise que des objectifs cochés : les badges des
//       évaluations et les ⚠ se lèvent ;
//   (c) un objectif coché par une évaluation d'une AUTRE leçon (placée après
//       celle de l'objectif) : il compte, et le geste qui le coche est borné
//       aux leçons placées avant l'évaluation ;
//   plus le retrait du geste (aucun verbe vers une évaluation, message qui
//   oriente), la duplication d'une leçon, l'export du plan.
//
// Sentinelle COMPORTEMENTALE : le vrai module, des cartes fictives.

let api;
let win;
let toasts;

function fauxElement() {
    const el = {
        style: {}, dataset: {}, innerHTML: '', textContent: '',
        classList: { add() {}, remove() {}, contains: () => false, toggle() {} },
        setAttribute() {}, getAttribute: () => null, appendChild() {}, remove() {},
        addEventListener() {}, removeEventListener() {},
        querySelector: () => null, querySelectorAll: () => [],
        closest: () => null, contains: () => false, offsetWidth: 140, offsetHeight: 50
    };
    return el;
}

function monter() {
    toasts = [];
    const store = {};
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
        setTimeout: () => 0,
        document: {
            getElementById: () => null, querySelectorAll: () => [], querySelector: () => null,
            addEventListener: () => {}, createElement: fauxElement, createElementNS: fauxElement,
            body: { appendChild(el) { if (el && el.className === 'planif-toast-lien') toasts.push(el.textContent); }, removeChild() {} }
        },
        navigator: {},
        notifications: { succes() {}, erreur() {}, info() {} }
    };
    win = chargerScript('js/planification-carte.js', globaux);
    win.cle = globaux.cle;
    win.planificationDonnees = {
        getIndex: () => ({ active: 'carte_1', cartes: [{ id: 'carte_1', nom: 'Carte fictive' }] }),
        sauvegarderCarte: () => {},
        chargerCarte: () => null
    };
    api = win.planificationCarte;
}

function noeud(id, type, titre, extras) {
    const n = Object.assign(
        { id, type, titre, x: 0, y: 0, parent: null, enfants: [], metadata: {}, cloneSourceId: null },
        extras || {}
    );
    api.etat.noeuds.set(id, n);
    if (n.parent) api.etat.noeuds.get(n.parent).enfants.push(id);
    return n;
}
const lien = (id, source, cible, type) => api.etat.liens.set(id, { id, source, cible, type });
const lecon = (id, titre, semaine, rang, objectifs, extras) => noeud(id, 'lecon', titre, Object.assign({
    metadata: Object.assign({ objectifs }, semaine ? { semaine } : {}, rang ? { rangSeance: rang } : {})
}, extras || {}));

/** Tous les états visibles : badges (amont, aval, ⚠) et pastilles d'objectifs. */
function etats() {
    const r = {};
    for (const [id, n] of api.etat.noeuds) {
        const b = api.evaluerBadge(n);
        r[id] = [b.entree.valide ? '✓' : '!', b.sortie.valide ? '✓' : '!', b.avertissement ? '⚠' : ''].join('');
        if (n.type === 'lecon') {
            for (const o of api.objectifsDeLecon(n)) r[id + ':' + o.id] = api.evaluerObjectif(n, o.id).etat;
        }
    }
    return r;
}

// ---------------------------------------------------------------------------
// (a) Carte héritée : seulement des liens « se vérifie par »
// ---------------------------------------------------------------------------

/** Cours fictif « Jardinage lunaire ». */
function carteHeritee() {
    noeud('comp', 'competence', 'Cultiver sous la Lune');
    noeud('im1', 'idee-maitresse', 'Les marées de sève');
    noeud('im2', 'idee-maitresse', 'Le compost d’étoiles');
    lien('l1', 'comp', 'im1', 'se_decline_en');
    lien('l2', 'comp', 'im2', 'se_decline_en');
    lecon('lec1', 'Semer au premier quartier', 1, 1, [{ id: 'o1', texte: 'Nommer les phases' }, { id: 'o2', texte: 'Planifier un semis' }]);
    lecon('lec2', 'Récolter à la pleine lune', 2, 1, [{ id: 'o3', texte: 'Juger une récolte' }]);
    lien('l3', 'im1', 'lec1', 'se_concretise_dans');
    lien('l4', 'im2', 'lec2', 'se_concretise_dans');
    noeud('k1', 'factuelle', 'Les quatre phases', { parent: 'lec1' });
    noeud('a1', 'activite', 'Calendrier de semis', { parent: 'lec1', metadata: { objectifsServis: ['o1'] } });
    noeud('x1', 'expose', 'Exposé : la sève', { parent: 'lec1', metadata: { objectifsServis: ['o2'] } });
    noeud('e1', 'evaluation', 'Quiz des phases', { parent: 'lec1' });
    lien('l5', 'k1', 'a1', 's_acquiert_par');
    lien('l6', 'a1', 'e1', 'se_verifie_par');
    noeud('k2', 'conceptuelle', 'Maturité d’un fruit', { parent: 'lec2' });
    noeud('a2', 'activite', 'Tri des récoltes', { parent: 'lec2', metadata: { objectifsServis: ['o3'] } });
    noeud('e2', 'evaluation', 'Bilan de récolte', { parent: 'lec2' });
    lien('l7', 'k2', 'a2', 's_acquiert_par');
    // Un ancien verbe, lu comme « se vérifie par » (VERBES_COMPAT).
    lien('l8', 'k2', 'e2', 'evalue_par');
    noeud('e3', 'evaluation', 'Évaluation orpheline', { parent: 'lec2' });
}

// Mesuré le 27 sept. 2026 en exécutant le code de `main` (df359bf) sur cette
// carte. SEUL l'Exposé change avec #964 : il rejoint le calcul des activités,
// et, n'étant relié à aucune connaissance, passe de ✓✓ à !!.
const ETATS_HERITES_AVANT = {
    'comp': '✓✓', 'im1': '✓✓', 'im2': '✓✓',
    'lec1': '✓✓', 'lec1:o1': 'verifie', 'lec1:o2': 'servi',
    'lec2': '✓✓', 'lec2:o3': 'servi',
    'k1': '✓✓', 'a1': '✓✓', 'x1': '✓✓', 'e1': '✓✓',
    'k2': '✓✓', 'a2': '✓✓', 'e2': '✓✓', 'e3': '!✓'
};

describe('#964 (a) — une carte héritée garde ses états, Exposé mis à part', () => {
    beforeEach(() => { monter(); carteHeritee(); });

    it('mêmes badges, mêmes ⚠, mêmes pastilles qu\'avant le lot ; l\'Exposé seul change', () => {
        const attendu = Object.assign({}, ETATS_HERITES_AVANT, { 'x1': '!!' });
        expect(etats()).toEqual(attendu);
    });

    it('les liens déjà tracés restent stockés et affichés avec leur verbe, ancien verbe compris', () => {
        expect(api.etat.liens.size).toBe(8);
        const libelles = api.getLiensDeNoeud('e2').map((l) => l.lienLabel);
        expect(libelles).toEqual(['se vérifie par']);
        expect(api.TYPES_LIENS.some((t) => t.id === 'se_verifie_par')).toBe(true);
    });
});

// ---------------------------------------------------------------------------
// (b) Carte neuve : seulement des objectifs cochés sur les évaluations
// ---------------------------------------------------------------------------

function carteObjectifs() {
    noeud('comp', 'competence', 'Cultiver sous la Lune');
    noeud('im1', 'idee-maitresse', 'Les marées de sève');
    lien('l1', 'comp', 'im1', 'se_decline_en');
    lecon('lec1', 'Semer au premier quartier', 1, 1, [{ id: 'o1', texte: 'Nommer les phases' }]);
    lien('l2', 'im1', 'lec1', 'se_concretise_dans');
    noeud('k1', 'factuelle', 'Les quatre phases', { parent: 'lec1' });
    noeud('a1', 'activite', 'Calendrier de semis', { parent: 'lec1', metadata: { objectifsServis: ['o1'] } });
    lien('l3', 'k1', 'a1', 's_acquiert_par');
    noeud('e1', 'evaluation', 'Quiz des phases', { parent: 'lec1' });
}

describe('#964 (b) — les objectifs cochés lèvent les badges et les ⚠', () => {
    beforeEach(() => { monter(); carteObjectifs(); });

    it('sans objectif coché : l\'évaluation est à « ! », l\'idée maîtresse et la compétence portent ⚠', () => {
        const e = etats();
        expect(e['e1']).toBe('!✓');
        expect(e['im1']).toBe('✓✓⚠');
        expect(e['comp']).toBe('✓✓⚠');
        expect(e['lec1:o1']).toBe('servi');
    });

    it('l\'évaluation coche l\'objectif de sa leçon : ✓, les ⚠ se lèvent, la pastille passe à « vérifié »', () => {
        api.definirObjectifsServis('e1', ['o1']);
        const e = etats();
        expect(e['e1']).toBe('✓✓');
        expect(api.evaluerBadge(api.etat.noeuds.get('e1')).entree.message).toBe('Vérifie 1 objectif');
        expect(e['im1']).toBe('✓✓');
        expect(e['comp']).toBe('✓✓');
        expect(e['lec1:o1']).toBe('verifie');
    });

    it('la leçon reliée par sa SÉQUENCE lève aussi le ⚠ de l\'idée maîtresse', () => {
        api.etat.liens.delete('l2');
        noeud('seq', 'sequence', 'Printemps');
        const l = api.etat.noeuds.get('lec1');
        l.parent = 'seq';
        api.etat.noeuds.get('seq').enfants.push('lec1');
        lien('l9', 'im1', 'seq', 'se_concretise_dans');
        expect(etats()['im1']).toBe('✓✓⚠');
        api.definirObjectifsServis('e1', ['o1']);
        expect(etats()['im1']).toBe('✓✓');
    });

    it('sans bloc qui sert l\'objectif, la pastille reste « ! » même s\'il est vérifié', () => {
        api.definirObjectifsServis('a1', []);
        api.definirObjectifsServis('e1', ['o1']);
        expect(etats()['lec1:o1']).toBe('invitation');
    });
});

// ---------------------------------------------------------------------------
// (c) Un objectif coché par une évaluation d'une AUTRE leçon
// ---------------------------------------------------------------------------

function carteDeuxLecons() {
    carteObjectifs();
    lecon('lec0', 'Préparer le sol', 1, null, [{ id: 'o0', texte: 'Décrire un sol' }], { x: -100 });
    lecon('lec2', 'Récolter à la pleine lune', 3, 2, [{ id: 'o3', texte: 'Juger une récolte' }]);
    noeud('e2', 'evaluation', 'Bilan de récolte', { parent: 'lec2' });
    lecon('lec3', 'Même semaine, séance A', 3, 1, [{ id: 'o4', texte: 'Arroser à la rosée' }]);
    lecon('lec4', 'Plus tard', 5, 1, [{ id: 'o5', texte: 'Conserver les graines' }]);
    lecon('lecX', 'Sans semaine', null, null, [{ id: 'o6', texte: 'Rêver le jardin' }]);
}

describe('#964 (c) — un objectif vérifié par une évaluation d\'une autre leçon', () => {
    beforeEach(() => { monter(); carteDeuxLecons(); });

    it('il compte : l\'évaluation a son ✓, la pastille de la leçon d\'origine passe à « vérifié », le ⚠ se lève', () => {
        api.definirObjectifsServis('e2', ['o1']);
        const e = etats();
        expect(e['e2']).toBe('✓✓');
        expect(e['lec1:o1']).toBe('verifie');
        expect(e['im1']).toBe('✓✓');
    });

    it('l\'Inspecteur propose sa leçon, puis les leçons placées avant elle, de la plus proche à la plus ancienne', () => {
        const ids = api.leconsProposeesAEvaluation(api.etat.noeuds.get('e2')).map((l) => l.id);
        // lec3 : semaine 3, séance A, avant la séance B de l'évaluation ;
        // lec1 et lec0 : semaine 1 (lec0 sans séance : la semaine suffit).
        expect(ids).toEqual(['lec2', 'lec3', 'lec1', 'lec0']);
        expect(ids).not.toContain('lec4');   // placée après
        expect(ids).not.toContain('lecX');   // sans semaine : jamais « avant »
    });

    it('une évaluation dans une leçon sans semaine ne voit que sa leçon ; hors leçon, aucune', () => {
        noeud('eX', 'evaluation', 'Évaluation rêveuse', { parent: 'lecX' });
        expect(api.leconsProposeesAEvaluation(api.etat.noeuds.get('eX')).map((l) => l.id)).toEqual(['lecX']);
        noeud('eL', 'evaluation', 'Évaluation libre');
        expect(api.leconsProposeesAEvaluation(api.etat.noeuds.get('eL'))).toEqual([]);
    });

    it('un objectif coché dont la leçon passe APRÈS l\'évaluation reste compté (rien ne s\'efface en silence)', () => {
        api.definirObjectifsServis('e2', ['o1']);
        api.etat.noeuds.get('lec1').metadata.semaine = 6;
        expect(api.objectifsVerifiesPar(api.etat.noeuds.get('e2'))).toEqual(['o1']);
        expect(etats()['lec1:o1']).toBe('verifie');
    });

    it('un objectif retiré de sa leçon ne compte plus', () => {
        api.definirObjectifsServis('e2', ['o1']);
        api.etat.noeuds.get('lec1').metadata.objectifs = [];
        expect(api.objectifsVerifiesPar(api.etat.noeuds.get('e2'))).toEqual([]);
        expect(etats()['e2']).toBe('!✓');
    });

    function ligneObjectif(leconId, objectifId) {
        const leconEl = { id: leconId };
        return {
            querySelector: () => ({ getAttribute: () => objectifId }),
            closest: () => leconEl
        };
    }

    it('le glisser sur un objectif d\'une leçon placée AVANT le coche', () => {
        expect(api.deposerLienSurObjectif('e2', ligneObjectif('lec1', 'o1'))).toBe(true);
        expect(api.etat.noeuds.get('e2').metadata.objectifsServis).toEqual(['o1']);
        expect(toasts.pop()).toBe('Objectif coché : cette évaluation le vérifie désormais.');
    });

    it('le glisser sur un objectif d\'une leçon placée APRÈS est refusé, sans rien écrire', () => {
        expect(api.deposerLienSurObjectif('e2', ligneObjectif('lec4', 'o5'))).toBe(true);
        expect(api.etat.noeuds.get('e2').metadata.objectifsServis).toBeUndefined();
        expect(toasts.pop()).toBe('Une évaluation coche les objectifs de sa leçon ou d’une leçon placée avant elle.');
    });

    it('dupliquer la leçon garde, sur l\'évaluation copiée, l\'objectif d\'une leçon précédente', () => {
        api.definirObjectifsServis('e2', ['o1', 'o3']);
        api.dupliquerConteneurEnProfondeur('lec2');
        const copies = [...api.etat.noeuds.values()].filter((n) => n.type === 'evaluation' && n.id !== 'e2' && n.titre === 'Bilan de récolte');
        expect(copies).toHaveLength(1);
        const ids = copies[0].metadata.objectifsServis;
        expect(ids).toHaveLength(2);
        expect(ids[0]).toBe('o1');                 // leçon précédente : gardé tel quel
        expect(ids[1]).not.toBe('o3');             // sa propre leçon : suit la copie
    });
});

// ---------------------------------------------------------------------------
// Le retrait du geste
// ---------------------------------------------------------------------------

describe('#964 — tracer vers une évaluation est refusé, et le message dit le bon geste', () => {
    beforeEach(() => { monter(); });

    const TYPES_AMONT = ['idee-maitresse', 'factuelle', 'conceptuelle', 'procedurale', 'metacognitive',
        'activite', 'soutien', 'revision', 'expose', 'ouverture', 'modelisation',
        'pratique-guidee', 'pratique-autonome', 'cloture', 'competence', 'lecon', 'sequence'];

    it('aucun type ne résout de verbe vers une évaluation, dans un sens ou dans l\'autre', () => {
        for (const t of TYPES_AMONT) {
            noeud('s', t, 'Source'); noeud('c', 'evaluation', 'Cible');
            expect(api.resoudreVerbe('s', 'c'), t + ' → évaluation').toBeNull();
            expect(api.resoudreVerbe('c', 's'), 'évaluation → ' + t).toBeNull();
            api.etat.noeuds.delete('s'); api.etat.noeuds.delete('c');
        }
    });

    it('le message oriente vers les objectifs, dans les deux sens du tracé', () => {
        noeud('a', 'activite', 'A'); noeud('e', 'evaluation', 'E');
        api.afficherMenuLien(0, 0, 'a', 'e');
        api.afficherMenuLien(0, 0, 'e', 'a');
        expect(toasts).toEqual([
            'Une évaluation se relie à ses objectifs : ouvre son Inspecteur et coche ceux qu’elle vérifie.',
            'Une évaluation se relie à ses objectifs : ouvre son Inspecteur et coche ceux qu’elle vérifie.'
        ]);
        expect(api.etat.liens.size).toBe(0);
    });

    it('un autre lien impossible garde son message d\'origine', () => {
        noeud('l', 'lecon', 'L'); noeud('c', 'competence', 'C');
        api.afficherMenuLien(0, 0, 'l', 'c');
        expect(toasts).toEqual(['Ce lien n\'est pas possible entre Leçon et Compétence.']);
    });

    it('les autres verbes automatiques sont intacts', () => {
        noeud('k', 'factuelle', 'K'); noeud('a', 'activite', 'A');
        expect(api.resoudreVerbe('k', 'a').verbe).toBe('s_acquiert_par');
        noeud('im', 'idee-maitresse', 'IM'); noeud('l', 'lecon', 'L');
        expect(api.resoudreVerbe('im', 'l').verbe).toBe('se_concretise_dans');
    });
});

// ---------------------------------------------------------------------------
// L'export du plan dit ce que l'évaluation vérifie, leçon précédente comprise
// ---------------------------------------------------------------------------

describe('#964 — l\'export du plan', () => {
    it('écrit l\'objectif d\'une leçon précédente vérifié par l\'évaluation', () => {
        monter();
        carteDeuxLecons();
        api.definirObjectifsServis('e2', ['o1', 'o3']);
        chargerScript('js/planification-export.js', { db: { getSync: (k, d) => d } }, win);
        const plan = win.planificationExport.construirePlan();
        const lecons = plan.leconsOrphelines;
        const l2 = lecons.find((l) => l.titre === 'Récolter à la pleine lune');
        const ev = l2.elements.find((el) => el.titre === 'Bilan de récolte');
        expect(ev.objectifsServis).toEqual(['Nommer les phases', 'Juger une récolte']);
    });
});
