import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// LOT 4 DE LA CARTE — deux fiches sans geste à l'écran (9 oct. 2026)
//
// #970 : la carte démo enseigne le geste d'aujourd'hui. Plus aucun lien
//        « se vérifie par » ; chaque évaluation COCHE l'objectif de sa leçon,
//        que l'activité placée au-dessus d'elle sert. Sa pastille dit ✓.
// #971 : l'index des objectifs se bâtit UNE fois par passe de badges, pas une
//        fois par évaluation. Mesuré par le nombre de lectures des objectifs
//        d'une leçon pendant une sauvegarde : il ne grandit plus avec le
//        nombre d'évaluations de la carte.
//
// Sentinelle COMPORTEMENTALE : le vrai module, des cartes fictives.

function fauxElement() {
    return {
        style: {}, dataset: {}, innerHTML: '', textContent: '', title: '', className: '',
        classList: { add() {}, remove() {}, contains: () => false, toggle() {} },
        setAttribute() {}, getAttribute: () => null, appendChild() {}, remove() {},
        addEventListener() {}, removeEventListener() {},
        querySelector: () => fauxElement(), querySelectorAll: () => [],
        closest: () => null, contains: () => false, offsetWidth: 140, offsetHeight: 50
    };
}

function monter(avecDom) {
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
        getComputedStyle: () => ({ getPropertyValue: () => '' }),
        document: {
            // Avec un DOM : chaque nœud a son élément, et la passe de badges
            // rafraîchit vraiment chaque pastille.
            getElementById: avecDom ? () => fauxElement() : () => null,
            querySelectorAll: () => [], querySelector: () => null,
            addEventListener: () => {}, createElement: fauxElement, createElementNS: fauxElement,
            body: { appendChild() {}, removeChild() {} }
        },
        navigator: {},
        notifications: { succes() {}, erreur() {}, info() {} }
    };
    const win = chargerScript('js/planification-carte.js', globaux);
    win.cle = globaux.cle;
    win.planificationDonnees = {
        getIndex: () => ({ active: 'carte_1', cartes: [{ id: 'carte_1', nom: 'Carte fictive' }] }),
        sauvegarderCarte: () => {},
        chargerCarte: () => null
    };
    return win.planificationCarte;
}

describe('#970 — la carte démo enseigne « l\'évaluation coche ses objectifs »', () => {
    const win = chargerScript('js/demo-namespace.js', { db: { getSync: (k, d) => d, setSync() {} } });
    const demo = win.CARTE_DEMO_ALIGNEMENT.cartes.carte_1;

    it('aucun lien « se vérifie par »', () => {
        expect(demo.liens.filter((l) => l.type === 'se_verifie_par')).toEqual([]);
    });

    it('chaque évaluation coche un objectif de sa leçon, servi au-dessus d\'elle : pastille ✓', () => {
        const api = monter(false);
        demo.noeuds.forEach((n) => api.etat.noeuds.set(n.id, JSON.parse(JSON.stringify(n))));
        demo.liens.forEach((l) => api.etat.liens.set(l.id, Object.assign({}, l)));
        const evaluations = demo.noeuds.filter((n) => n.type === 'evaluation');
        expect(evaluations).toHaveLength(2);
        for (const ev of evaluations) {
            const noeudEv = api.etat.noeuds.get(ev.id);
            const lecon = api.etat.noeuds.get(ev.parent);
            const idsLecon = api.objectifsDeLecon(lecon).map((o) => o.id);
            expect(noeudEv.metadata.objectifsServis.length).toBeGreaterThan(0);
            noeudEv.metadata.objectifsServis.forEach((id) => expect(idsLecon).toContain(id));
            expect(api.evaluerPastilleEvaluation(noeudEv).etat).toBe('avant');
            // Et l'objectif de la leçon est servi (pas l'invitation « aucune activité »).
            expect(api.evaluerObjectif(lecon, idsLecon[0]).etat).not.toBe('invitation');
        }
    });
});

describe('#971 — un index des objectifs par passe de badges', () => {
    /** Lectures des objectifs de la leçon A pendant une sauvegarde, sur une carte à `nbEval` évaluations. */
    function lecturesPendantUneSauvegarde(nbEval) {
        const api = monter(true);
        const ajouter = (n) => {
            api.etat.noeuds.set(n.id, Object.assign({ x: 0, y: 0, parent: null, enfants: [], metadata: {}, cloneSourceId: null }, n));
            if (n.parent) api.etat.noeuds.get(n.parent).enfants.push(n.id);
        };
        ajouter({ id: 'lecA', type: 'lecon', titre: 'Cueillir les nuages', metadata: { semaine: 1 } });
        ajouter({ id: 'lecB', type: 'lecon', titre: 'Peser la brume', metadata: { semaine: 2 } });
        ajouter({ id: 'act', type: 'activite', titre: 'Filet à nuages', parent: 'lecA', metadata: { objectifsServis: ['oA'] } });
        for (let i = 0; i < nbEval; i++) {
            ajouter({ id: 'ev' + i, type: 'evaluation', titre: 'Pesée ' + i, parent: 'lecB', metadata: { objectifsServis: ['oA'] } });
        }
        let lectures = 0;
        const objectifs = [{ id: 'oA', texte: 'Reconnaître un cumulus' }];
        Object.defineProperty(api.etat.noeuds.get('lecA').metadata, 'objectifs', {
            get() { lectures++; return objectifs; }, enumerable: true, configurable: true
        });
        lectures = 0;
        api.definirObjectifsServis('act', ['oA']);
        return lectures;
    }

    it('le nombre de lectures ne dépend pas du nombre d\'évaluations', () => {
        const peu = lecturesPendantUneSauvegarde(2);
        const beaucoup = lecturesPendantUneSauvegarde(40);
        expect(peu).toBeGreaterThan(0);
        expect(beaucoup).toBe(peu);
    });
});
