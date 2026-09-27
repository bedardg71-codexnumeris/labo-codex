import { describe, it, expect, beforeEach } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// #965 — « MON ÉVALUATION ME DIT SI ELLE ARRIVE TROP TÔT » (27 sept. 2026)
//
// Chaque évaluation porte une pastille : ! (aucun objectif coché), ✕ (un
// objectif vérifié n'est servi par aucun bloc), ⚠ (servi seulement après
// elle), ✓ (tout est enseigné avant). Textes et symboles validés par Grégoire.
// « Avant » : semaine, puis rang de séance ; dans la MÊME leçon, l'ordre des
// blocs du haut vers le bas (choix de Grégoire du 27 sept.). Leçon sans
// semaine : on ne conclut pas (« avant », marqué inconclusif).
//
// Sentinelle COMPORTEMENTALE : le vrai module, une carte fictive
// (« Apiculture martienne »). Calcul en lecture seule : vérifié en fin de banc.

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


const pastille = (id) => api.evaluerPastilleEvaluation(api.etat.noeuds.get(id));

/** Leçons en semaines 2, 4 (séances A et B) et 6 ; une sans semaine. */
function carte() {
    lecon('s2', 'Semaine 2', 2, 1, [{ id: 'oA', texte: 'Nommer les ruches' }, { id: 'oJ', texte: 'Jamais servi' }]);
    lecon('s4a', 'Semaine 4 A', 4, 1, [{ id: 'oM', texte: 'Même séance, autre leçon' }]);
    lecon('s4', 'Semaine 4 B', 4, 2, [{ id: 'oB', texte: 'Peser le miel' }, { id: 'oH', texte: 'Au-dessus' }, { id: 'oL', texte: 'En dessous' }]);
    lecon('s4b', 'Semaine 4 B, autre leçon', 4, 2, [{ id: 'oS', texte: 'Même séance' }]);
    lecon('s6', 'Semaine 6', 6, 1, [{ id: 'oT', texte: 'Tardif' }]);
    lecon('sX', 'Sans semaine', null, null, [{ id: 'oX', texte: 'Sans semaine' }]);
    noeud('b2', 'activite', 'Bloc S2', { parent: 's2', metadata: { objectifsServis: ['oA'] } });
    noeud('b4a', 'activite', 'Bloc S4 A', { parent: 's4a', metadata: { objectifsServis: ['oM'] } });
    // Dans la leçon de l'évaluation : un bloc AU-DESSUS, l'évaluation, un bloc EN DESSOUS.
    noeud('hH', 'activite', 'Au-dessus', { parent: 's4', metadata: { objectifsServis: ['oH'] } });
    noeud('ev', 'evaluation', 'Examen du rucher', { parent: 's4' });
    noeud('hL', 'expose', 'En dessous', { parent: 's4', metadata: { objectifsServis: ['oL'] } });
    noeud('b4b', 'activite', 'Bloc même séance', { parent: 's4b', metadata: { objectifsServis: ['oS'] } });
    noeud('b6', 'activite', 'Bloc S6', { parent: 's6', metadata: { objectifsServis: ['oT'] } });
    noeud('bX', 'activite', 'Bloc sans semaine', { parent: 'sX', metadata: { objectifsServis: ['oX'] } });
}
const cocher = (ids) => api.definirObjectifsServis('ev', ids);

describe('#965 — les six cas de la consigne', () => {
    beforeEach(() => { monter(); carte(); });

    it('servi en semaine 2, évalué en semaine 4 : ✓', () => {
        cocher(['oA']);
        expect(pastille('ev').etat).toBe('avant');
    });
    it('servi en semaine 6, évalué en semaine 4 : ⚠', () => {
        cocher(['oT']);
        expect(pastille('ev').etat).toBe('apres');
    });
    it('jamais servi : ✕', () => {
        cocher(['oJ']);
        expect(pastille('ev').etat).toBe('nonEnseigne');
    });
    it('évaluation sans objectif : !', () => {
        expect(pastille('ev').etat).toBe('aucun');
    });
    it('servi dans la même séance, dans une autre leçon : ✓', () => {
        cocher(['oS']);
        expect(pastille('ev').etat).toBe('avant');
    });
    it('deux objectifs, l\'un ✓ et l\'autre ✕ : ✕', () => {
        cocher(['oA', 'oJ']);
        expect(pastille('ev').etat).toBe('nonEnseigne');
    });
});

describe('#965 — la règle retenue par Grégoire, et les bords', () => {
    beforeEach(() => { monter(); carte(); });

    it('même leçon : un bloc placé AU-DESSUS de l\'évaluation est enseigné avant (✓)', () => {
        cocher(['oH']);
        expect(pastille('ev').etat).toBe('avant');
    });
    it('même leçon : un bloc placé EN DESSOUS n\'est servi qu\'après (⚠)', () => {
        cocher(['oL']);
        expect(pastille('ev').etat).toBe('apres');
    });
    it('même semaine, séance antérieure : ✓', () => {
        cocher(['oM']);
        expect(pastille('ev').etat).toBe('avant');
    });
    it('servi avant ET après : compté avant (✓)', () => {
        // Un bloc ne sert que les objectifs de SA leçon : le seul cas réel est
        // dans la leçon de l'évaluation, un bloc au-dessus et un en dessous.
        api.definirObjectifsServis('hL', ['oL', 'oH']);
        cocher(['oH']);
        expect(pastille('ev').etat).toBe('avant');
        // Contre-épreuve : le bloc du dessus ne le sert plus → ⚠.
        api.definirObjectifsServis('hH', []);
        expect(pastille('ev').etat).toBe('apres');
    });
    it('une évaluation n\'enseigne pas : un objectif coché seulement par des évaluations reste ✕', () => {
        // Une autre évaluation, placée AVANT, coche l'objectif jamais servi ;
        // l'évaluation courante coche aussi un objectif de sa propre leçon que
        // personne ne sert. Aucune des deux ne compte comme bloc qui l'enseigne.
        noeud('eAvant', 'evaluation', 'Quiz précoce', { parent: 's2', metadata: { objectifsServis: ['oJ'] } });
        cocher(['oJ']);
        expect(pastille('ev').etat).toBe('nonEnseigne');
        cocher(['oB']);
        expect(pastille('ev').etat).toBe('nonEnseigne');
    });
    it('le pire l\'emporte : ⚠ et ✓ donnent ⚠, ✕ et ⚠ donnent ✕', () => {
        cocher(['oA', 'oT']);
        expect(pastille('ev').etat).toBe('apres');
        cocher(['oT', 'oJ']);
        expect(pastille('ev').etat).toBe('nonEnseigne');
    });
    it('leçon sans semaine : on ne conclut pas — « avant », marqué inconclusif', () => {
        cocher(['oX']);
        const p = pastille('ev');
        expect(p.etat).toBe('avant');
        expect(p.inconclusif).toBe(true);
        cocher(['oA']);
        expect(pastille('ev').inconclusif).toBe(false);
    });
    it('les liens « se vérifie par » hérités ne créent aucun objectif vérifié : !', () => {
        lien('lh', 'b2', 'ev', 'se_verifie_par');
        lien('lh2', 'b2', 'ev', 'evalue_par');
        expect(pastille('ev').etat).toBe('aucun');
        // … et le badge de l'évaluation, lui, reste comme au lot précédent.
        expect(api.evaluerBadge(api.etat.noeuds.get('ev')).entree.valide).toBe(true);
    });
});

describe('#965 — les textes validés, et la lecture seule', () => {
    beforeEach(() => { monter(); carte(); });

    it('les quatre infobulles sont celles de la consigne, mot pour mot', () => {
        expect(api.LEGENDE_PASTILLES_EVALUATION.map((l) => [api.SYMBOLES_PASTILLE_EVALUATION[l.etat], l.libelle])).toEqual([
            ['!', 'Aucun objectif relié : cette évaluation ne dit pas ce qu\'elle vérifie.'],
            ['\u2715', 'Un objectif vérifié n\'est servi par aucun bloc : il n\'a pas été enseigné.'],
            ['\u26A0', 'Un objectif vérifié n\'est servi qu\'après cette évaluation.'],
            ['\u2713', 'Chaque objectif vérifié a été enseigné avant cette évaluation.']
        ]);
        cocher(['oT']);
        expect(pastille('ev').message).toBe('Un objectif vérifié n\'est servi qu\'après cette évaluation.');
    });

    it('la pastille est rendue dans l\'en-tête du bloc Évaluation, et seulement là', () => {
        cocher(['oA']);
        const html = api.contenuNoeudHTML(api.etat.noeuds.get('ev'));
        expect(html).toContain('planif-eval-pastille--avant');
        expect(html.indexOf('planif-eval-pastille')).toBeLessThan(html.indexOf('planif-noeud-titre'));
        expect(api.contenuNoeudHTML(api.etat.noeuds.get('b2'))).not.toContain('planif-eval-pastille');
    });

    it('calculer ne modifie ni la carte ni ses liens', () => {
        cocher(['oA', 'oT', 'oJ', 'oX']);
        lien('lh', 'b2', 'ev', 'se_verifie_par');
        const avant = JSON.stringify([...api.etat.noeuds.entries()]) + JSON.stringify([...api.etat.liens.entries()]);
        for (const id of ['ev']) pastille(id);
        api.contenuNoeudHTML(api.etat.noeuds.get('ev'));
        expect(JSON.stringify([...api.etat.noeuds.entries()]) + JSON.stringify([...api.etat.liens.entries()])).toBe(avant);
    });
});
