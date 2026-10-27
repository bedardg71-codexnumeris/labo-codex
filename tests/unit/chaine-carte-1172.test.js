/**
 * #1172 — LA CHAÎNE D'ÉTAPES DE LA CARTE D'ALIGNEMENT (26 oct. 2026).
 * Consigne : plans de travail/CONSIGNE-LOT-2026-10-26-chaine-carte-alignement.md ; étapes validées par Grégoire
 * le 26 oct., 21 h 14 à 21 h 16 : ce qui est PRÉSENT dans la carte, sans ordre prescrit.
 *
 * `etapesChaineCarte(noeuds)` (planification-carte.js), fonction pure :
 *   carte vide ; chaque type seul ; un clone non compté ; une leçon à l'objectif vide ; une étape de
 *   l'enseignement explicite comptée comme activité ; une carte sans compétence mais complète ailleurs ;
 * puis `rangPageGuide` : chaque étape mène à la page du guide qui porte son id.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

let carte;

function fauxElement() {
    return {
        style: {}, dataset: {}, classList: { add() {}, remove() {}, contains: () => false, toggle() {} },
        setAttribute() {}, getAttribute: () => null, appendChild() {}, remove() {},
        addEventListener() {}, querySelector: () => null, querySelectorAll: () => [], closest: () => null
    };
}

beforeAll(() => {
    const win = chargerScript('js/planification-carte.js', {
        db: { getSync: (k, d) => d },
        cle: (k) => k,
        echapperHtml: (t) => String(t ?? ''),
        document: {
            getElementById: () => null, querySelectorAll: () => [], querySelector: () => null,
            addEventListener: () => {}, createElement: fauxElement, createElementNS: fauxElement,
            body: { appendChild() {}, removeChild() {} }
        },
        navigator: {}
    });
    carte = win.planificationCarte;
});

let compteur = 0;
const noeud = (type, extra = {}) => ({ id: 'planif-' + (++compteur), type, titre: 'Bloc fictif', parent: null,
    enfants: [], metadata: {}, cloneSourceId: null, ...extra });
const lecon = (textes) => noeud('lecon', { metadata: { objectifs: textes.map((t, i) => ({ id: 'obj-' + i, texte: t })) } });
const etapes = (noeuds) => carte.etapesChaineCarte(noeuds);
const parId = (liste, id) => liste.find(e => e.id === id);
const reglees = (liste) => liste.filter(e => e.reglee).map(e => e.id);

describe('#1172 · les sept étapes de la carte', () => {
    it('A. carte vide : sept étapes, dans l\'ordre de la structure, toutes « à poser » (« à écrire » pour les objectifs)', () => {
        const e = etapes([]);
        expect(e.map(x => [x.id, x.libelle, x.arrivee])).toEqual([
            ['competence', 'Compétence', false], ['idees-maitresses', 'Idées maîtresses', false],
            ['lecons', 'Leçons', false], ['objectifs', 'Objectifs', false],
            ['connaissances', 'Connaissances', false], ['activites', 'Activités', false],
            ['evaluations', 'Évaluations', true]]);
        expect(reglees(e)).toEqual([]);
        expect(e.map(x => x.info)).toEqual(['à poser', 'à poser', 'à poser', 'à écrire', 'à poser', 'à poser', 'à poser']);
        expect(etapes(undefined).length).toBe(7);
        // Aucun ton : la chaîne ne juge pas l'alignement (§ 3.1).
        expect(e.every(x => !x.ton)).toBe(true);
    });

    it('B. chaque type seul règle sa seule étape, avec le compte', () => {
        const cas = [
            ['competence', 'competence', '1 compétence'],
            ['idee-maitresse', 'idees-maitresses', '1 idée maîtresse'],
            ['factuelle', 'connaissances', '1 connaissance'],
            ['metacognitive', 'connaissances', '1 connaissance'],
            ['activite', 'activites', '1 activité'],
            ['expose', 'activites', '1 activité'],
            ['evaluation', 'evaluations', '1 évaluation']
        ];
        cas.forEach(([type, id, info]) => {
            const e = etapes([noeud(type)]);
            expect(reglees(e), type).toEqual([id]);
            expect(parId(e, id).info, type).toBe(info);
        });
        // Une leçon sans objectif : Leçons seule.
        const e = etapes([lecon([])]);
        expect(reglees(e)).toEqual(['lecons']);
        expect(parId(e, 'lecons').info).toBe('1 leçon');
        expect(parId(e, 'objectifs').info).toBe('à écrire');
    });

    it('C. le pluriel : 12 leçons, 2 idées maîtresses, 3 objectifs sur deux leçons', () => {
        const e = etapes([...Array.from({ length: 12 }, () => lecon([])), noeud('idee-maitresse'), noeud('idee-maitresse'),
            lecon(['Analyser un poème', 'Repérer une figure']), lecon(['Rédiger une introduction'])]);
        expect(parId(e, 'lecons').info).toBe('14 leçons');
        expect(parId(e, 'idees-maitresses').info).toBe('2 idées maîtresses');
        expect(parId(e, 'objectifs').info).toBe('3 objectifs');
    });

    it('D. un clone ne compte pas : il partage l\'identité de sa source', () => {
        const source = noeud('activite');
        const clone = noeud('activite', { cloneSourceId: source.id });
        expect(parId(etapes([source, clone]), 'activites').info).toBe('1 activité');
        // Une leçon clonée : ses objectifs ne comptent qu'une fois, elle aussi.
        const l = lecon(['Analyser un poème']);
        const lClone = { ...l, id: 'planif-clone-l', cloneSourceId: l.id };
        const e = etapes([l, lClone]);
        expect(parId(e, 'lecons').info).toBe('1 leçon');
        expect(parId(e, 'objectifs').info).toBe('1 objectif');
        // Un clone dont la source n'est pas dans la liste compte, une fois, pour elle.
        const orphelins = [noeud('evaluation', { cloneSourceId: 'planif-absent' }), noeud('evaluation', { cloneSourceId: 'planif-absent' })];
        expect(parId(etapes(orphelins), 'evaluations').info).toBe('1 évaluation');
    });

    it('E. une leçon dont l\'objectif est vide (ou blanc) ne règle pas Objectifs', () => {
        const e = etapes([lecon(['', '   '])]);
        expect(parId(e, 'objectifs')).toMatchObject({ reglee: false, info: 'à écrire' });
        expect(parId(etapes([lecon(['', 'Comparer deux textes'])]), 'objectifs')).toMatchObject({ reglee: true, info: '1 objectif' });
        // Objectifs portés par autre chose qu'une leçon : non lus (`objectifsDeLecon` ne vaut que pour les leçons).
        expect(parId(etapes([noeud('activite', { metadata: { objectifs: [{ id: 'o', texte: 'X' }] } })]), 'objectifs').reglee).toBe(false);
    });

    it('F. les cinq étapes de l\'enseignement explicite sont des activités ; la séquence n\'est pas une étape', () => {
        ['ouverture', 'modelisation', 'pratique-guidee', 'pratique-autonome', 'cloture', 'soutien', 'revision'].forEach(type => {
            expect(reglees(etapes([noeud(type)])), type).toEqual(['activites']);
        });
        expect(reglees(etapes([noeud('sequence')]))).toEqual([]);
    });

    it('G. sans compétence mais complète ailleurs : l\'ordre n\'est pas exigé, les étapes suivantes restent réglées', () => {
        const e = etapes([noeud('idee-maitresse'), lecon(['Analyser un poème']), noeud('conceptuelle'),
            noeud('pratique-guidee'), noeud('evaluation')]);
        expect(reglees(e)).toEqual(['idees-maitresses', 'lecons', 'objectifs', 'connaissances', 'activites', 'evaluations']);
        expect(parId(e, 'competence')).toMatchObject({ reglee: false, info: 'à poser' });
    });
});

describe('#1172 · chaque étape mène à la page du guide qui porte son id', () => {
    it('H. les sept ids sont posés sur GUIDE_PAGES, aux pages 2 à 8 du tableau de la consigne', () => {
        const attendu = { competence: 'Commence par le pourquoi', 'idees-maitresses': 'Ce que l’étudiant doit retenir',
            lecons: 'Organise dans le temps', objectifs: 'Ce que la leçon vise', connaissances: 'Ce que tu enseignes concrètement',
            activites: 'Comment l’étudiant va apprendre', evaluations: 'Vérifie que c’est acquis' };
        etapes([]).forEach(e => {
            const rang = carte.rangPageGuide(e.id);
            expect(rang, e.id).toBeGreaterThan(0);
            expect(carte.GUIDE_PAGES[rang].titre, e.id).toBe(attendu[e.id]);
        });
    });

    it('I. un id inconnu ramène à la première page', () => {
        expect(carte.rangPageGuide('inconnu')).toBe(0);
        expect(carte.rangPageGuide(undefined)).toBe(0);
    });
});
