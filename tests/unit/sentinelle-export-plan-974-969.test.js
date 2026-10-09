import { describe, it, expect, beforeEach } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// #974 et #969 — L'EXPORT DU PLAN DIT VRAI (lot 4 de la carte, 9 oct. 2026)
//
// #974 (décision de Grégoire, 9 oct.) : la leçon parente fait foi, mais un bloc
// qui ne sert que les objectifs d'une AUTRE leçon (un clone, un bloc déplacé)
// n'a plus la case « Objectifs servis » vide : l'export écrit « Aucun objectif
// de cette leçon », dans ses trois sorties (texte, Markdown, tableau).
// Une référence morte (#968) et un bloc qui ne sert rien gardent la case vide.
//
// #969 : l'échelle d'une production vit sur la PRODUCTION (`echelleId`), pas
// sur la grille. L'export la disait « Aucune échelle » pour toute production.
//
// Sentinelle COMPORTEMENTALE : le vrai module, une carte fictive.

let api;
let win;
let store;

function fauxElement() {
    return {
        style: {}, dataset: {}, innerHTML: '', textContent: '',
        classList: { add() {}, remove() {}, contains: () => false, toggle() {} },
        setAttribute() {}, getAttribute: () => null, appendChild() {}, remove() {},
        addEventListener() {}, removeEventListener() {},
        querySelector: () => null, querySelectorAll: () => [],
        closest: () => null, contains: () => false, offsetWidth: 140, offsetHeight: 50
    };
}

function monter() {
    store = {};
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
            body: { appendChild() {}, removeChild() {} }
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
    chargerScript('js/planification-export.js', { db }, win);
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

/** Cours fictif « Astronomie des potagers ». */
function carteFictive() {
    noeud('lecA', 'lecon', 'Lire les comètes', { metadata: { semaine: 1, rangSeance: 1, objectifs: [{ id: 'oA', texte: 'Nommer une comète' }] } });
    noeud('lecB', 'lecon', 'Arroser sous Vénus', { metadata: { semaine: 2, rangSeance: 1, objectifs: [{ id: 'oB', texte: 'Doser un arrosage' }] } });
    noeud('aOrig', 'activite', 'Carnet des comètes', { parent: 'lecA', metadata: { objectifsServis: ['oA'] } });
    // Le clone de « Carnet des comètes », posé dans la leçon B : il porte
    // encore l'objectif de la leçon A.
    noeud('aClone', 'activite', 'Carnet des comètes (copie)', { parent: 'lecB', cloneSourceId: 'aOrig', metadata: { objectifsServis: ['oA'] } });
    noeud('aMort', 'activite', 'Arrosoir oublié', { parent: 'lecB', metadata: { objectifsServis: ['oRetire'] } });
    noeud('aRien', 'activite', 'Pause tisane', { parent: 'lecB' });
    noeud('aB', 'activite', 'Doser à la pipette', { parent: 'lecB', metadata: { objectifsServis: ['oB'] } });
    noeud('aMixte', 'activite', 'Arroser les comètes', { parent: 'lecB', metadata: { objectifsServis: ['oA', 'oB'] } });
    noeud('eB', 'evaluation', 'Journal d’arrosage', { parent: 'lecB', metadata: { productionId: 'P1' } });
    noeud('eA', 'evaluation', 'Atlas des comètes', { parent: 'lecA', metadata: { productionId: 'P2' } });
    noeud('eA2', 'evaluation', 'Croquis lunaire', { parent: 'lecA', metadata: { productionId: 'P3' } });

    store.a2026_grillesTemplates = [
        { id: 'G-AST', nom: 'Grille des astres' }   // sans echelleId : l'éditeur n'en écrit pas
    ];
    store.a2026_echellesTemplates = [
        { id: 'ECH-GEN', nom: 'Échelle générique' },
        { id: 'ECH-COM', nom: 'Échelle des comètes' },
        { id: 'ECH-LUNE-copie', idOriginal: 'ECH-LUNE', nom: 'Échelle des lunes' }
    ];
    store.a2026_productions = [
        { id: 'P1', titre: 'Journal d’arrosage', ponderation: 20, grilleId: 'G-AST', echelleId: 'ECH-COM' },
        { id: 'P2', titre: 'Atlas des comètes', ponderation: 30, grilleId: 'G-AST' },
        { id: 'P3', titre: 'Croquis lunaire', ponderation: 10, echelleId: 'ECH-LUNE' }
    ];
}

const element = (plan, titreLecon, titre) => {
    const l = plan.leconsOrphelines.find((x) => x.titre === titreLecon);
    return l.elements.find((el) => el.titre === titre);
};

describe('#974 — un bloc qui ne sert que l\'objectif d\'une autre leçon', () => {
    beforeEach(() => { monter(); carteFictive(); });

    it('la structure : le clone le dit, la référence morte et le bloc sans objectif se taisent', () => {
        const plan = win.planificationExport.construirePlan();
        expect(element(plan, 'Arroser sous Vénus', 'Carnet des comètes (copie)').objectifsHorsLecon).toBe(true);
        expect(element(plan, 'Arroser sous Vénus', 'Arrosoir oublié').objectifsHorsLecon).toBe(false);
        expect(element(plan, 'Arroser sous Vénus', 'Pause tisane').objectifsHorsLecon).toBe(false);
        expect(element(plan, 'Arroser sous Vénus', 'Doser à la pipette').objectifsServis).toEqual(['Doser un arrosage']);
        // Un bloc qui sert AUSSI un objectif de sa leçon n'est pas « hors leçon ».
        const mixte = element(plan, 'Arroser sous Vénus', 'Arroser les comètes');
        expect(mixte.objectifsServis).toEqual(['Doser un arrosage']);
        expect(mixte.objectifsHorsLecon).toBe(false);
        // L'original, dans SA leçon, garde son objectif.
        expect(element(plan, 'Lire les comètes', 'Carnet des comètes').objectifsServis).toEqual(['Nommer une comète']);
    });

    it('le tableau : colonne « Objectifs servis »', () => {
        const tsv = win.planificationExport.genererExport('alignement', 'tsv');
        const lignes = tsv.split('\n');
        const entete = lignes[0].split('\t');
        const col = entete.indexOf('Objectifs servis');
        expect(col).toBeGreaterThan(-1);
        const cellule = (titre) => lignes.find((l) => l.split('\t').includes(titre)).split('\t')[col];
        expect(cellule('Carnet des comètes (copie)')).toBe('Aucun objectif de cette leçon');
        expect(cellule('Arrosoir oublié')).toBe('');
        expect(cellule('Pause tisane')).toBe('');
        expect(cellule('Doser à la pipette')).toBe('Doser un arrosage');
    });

    it('le texte : « Sert : »', () => {
        const txt = win.planificationExport.genererExport('alignement', 'texte');
        expect(txt).toContain('Carnet des comètes (copie)\n  │   Sert : Aucun objectif de cette leçon\n');
        expect(txt.match(/Aucun objectif de cette leçon/g)).toHaveLength(1);
        expect(txt).toContain('Sert : Doser un arrosage');
    });

    it('le Markdown : « sert : »', () => {
        const md = win.planificationExport.genererExport('alignement', 'markdown');
        expect(md).toMatch(/Carnet des comètes \(copie\)\n {4}- sert : Aucun objectif de cette leçon\n/);
        expect(md.match(/Aucun objectif de cette leçon/g)).toHaveLength(1);
    });
});

describe('#969 — l\'export dit l\'échelle de la production', () => {
    beforeEach(() => { monter(); carteFictive(); });

    it('l\'échelle vient de la production, pas de la grille', () => {
        const plan = win.planificationExport.construirePlan();
        const p1 = element(plan, 'Arroser sous Vénus', 'Journal d’arrosage').production;
        expect(p1.nomGrille).toBe('Grille des astres');
        expect(p1.nomEchelle).toBe('Échelle des comètes');
        // Une copie importée répond par son idOriginal ; sans grille, l'échelle se lit quand même.
        const p3 = element(plan, 'Lire les comètes', 'Croquis lunaire').production;
        expect(p3.nomEchelle).toBe('Échelle des lunes');
        expect(p3.nomGrille).toBe('Aucune grille');
        // Une production sans échelle garde « Aucune échelle ».
        expect(element(plan, 'Lire les comètes', 'Atlas des comètes').production.nomEchelle).toBe('Aucune échelle');
    });

    it('le tableau : colonne « Échelle »', () => {
        const tsv = win.planificationExport.genererExport('alignement', 'tsv');
        const lignes = tsv.split('\n');
        const col = lignes[0].split('\t').indexOf('Échelle');
        const cellule = (titre) => lignes.find((l) => l.split('\t').includes(titre)).split('\t')[col];
        expect(cellule('Journal d’arrosage')).toBe('Échelle des comètes');
        expect(cellule('Atlas des comètes')).toBe('Aucune échelle');
    });
});
