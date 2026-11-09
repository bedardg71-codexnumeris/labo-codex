import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// LE RELEVÉ DU STOCK (scripts/releve-stock-deux-liens.js) — il se lancera sur le Mac, au moment de la
// fusion, pour dire combien de propositions « Relier » Grégoire verra. Un relevé qui compte autre chose
// que ce que l'écran propose mentirait avec assurance : ce banc le CONFRONTE aux fonctions de la carte
// elles-mêmes (`objectifsARelierPourEvaluation`, `peutRelierCompetence`), carte par carte, sur un jeu
// fictif qui passe par chaque branche. Et il vérifie que le relevé n'écrit rien.

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const source = readFileSync(path.join(racine, 'scripts', 'releve-stock-deux-liens.js'), 'utf8');
const module_ = { exports: {} };
new Function('module', source)(module_);
const { releverStockDeuxLiens } = module_.exports;

const lecon = (id, semaine, rangSeance, objectifs, enfants) => ({
    id, type: 'lecon', titre: 'Leçon ' + id, parent: null, enfants: enfants || [], cloneSourceId: null, x: 0, y: 0,
    metadata: Object.assign({}, semaine ? { semaine } : {}, rangSeance ? { rangSeance } : {}, { objectifs })
});
const evaluation = (id, parent, productionId, objectifsServis) => ({
    id, type: 'evaluation', titre: 'Éval ' + id, parent, enfants: [], cloneSourceId: null, x: 0, y: 0,
    metadata: Object.assign({}, productionId ? { productionId } : {}, objectifsServis ? { objectifsServis } : {})
});
const competence = (id, titre, extra) => Object.assign({
    id, type: 'competence', titre, parent: null, enfants: [], cloneSourceId: null, x: 0, y: 0, metadata: {}
}, extra || {});

const JEU = {
    cours: [
        { id: 'c1', nature: 'cours', competence: 'Analyser des textes fictifs', numeroCompetence: '4EF0' },
        { id: 'c2', nature: 'cours', competence: '' },
        { id: 's1', nature: 'service' }
    ],
    productions: [{ id: 'PN', objectif: 'Objectif de la clé nue' }],
    a2026_productions: [
        { id: 'P1', objectif: 'Analyser un poème  fictif' },
        { id: 'P2', objectif: 'Écrire un texte fictif' },
        { id: 'P3', objectif: '' }
    ],
    a2026_planification_mindmap: {
        index: { active: 'k1', cartes: [{ id: 'k1', coursId: 'c1' }, { id: 'k2', coursId: 'c2' }, { id: 'k3' }, { id: 'k4', coursId: 's1' }, { id: 'k5', coursId: 'c1' }] },
        cartes: {
            k1: { noeuds: [
                // L1 (semaine 1) est AVANT L2 (semaine 2) ; L3 (semaine 3) est après ; L0 n'a pas de semaine.
                lecon('L1', 1, 1, [{ id: 'o1', texte: 'Analyser un poème fictif' }, { id: 'o2', texte: 'Autre' }]),
                lecon('L2', 2, 1, [{ id: 'o3', texte: 'Analyser un poème fictif' }, { id: 'o4', texte: 'Écrire un texte fictif', productionId: 'P2' }], ['E1', 'E2', 'E3']),
                lecon('L3', 3, 1, [{ id: 'o5', texte: 'Analyser un poème fictif' }]),
                lecon('L0', null, null, [{ id: 'o6', texte: 'Analyser un poème fictif' }]),
                evaluation('E1', 'L2', 'P1'),                    // propose o3 (sa leçon) et o1 (avant) : 2
                evaluation('E2', 'L2', 'P1', ['o5']),            // + o5, déjà coché dans une leçon d'après : 3
                evaluation('E3', 'L2', 'P2'),                    // o4 est déjà lié : 0
                evaluation('E4', null, 'P1', ['o6']),            // hors leçon, mais o6 coché : 1
                evaluation('E5', null, 'PX'),                    // production introuvable : 0
                evaluation('E6', null, 'P3'),                    // production sans objectif : 0
                competence('C1', 'analyser des textes  fictifs'),  // identique (casse, espaces) : un texte
                competence('C2', 'Mon titre à moi'),               // deux textes
                competence('C3', 'Mon titre à moi', { cloneSourceId: 'C2' })   // clone : même bloc
            ] },
            k2: { noeuds: [competence('C4', 'X')] },             // fiche sans compétence
            k3: { noeuds: [competence('C5', 'X')] },             // carte sans cours
            k4: { noeuds: [competence('C6', 'X')] },             // service
            k5: { noeuds: [                                      // une compétence déjà liée : l'autre n'est pas proposée
                competence('C7', 'Analyser des textes fictifs', { metadata: { lieFicheCours: true } }),
                competence('C8', 'Une deuxième compétence')
            ] }
        }
    },
    a2025_planification_mindmap: { index: { cartes: [{ id: 'k9' }] }, cartes: { k9: { noeuds: [
        lecon('L9', 1, 1, [{ id: 'o9', texte: 'Objectif de la clé nue' }], ['E9']),
        evaluation('E9', 'L9', 'PN')
    ] } } }
};

/** Ce que la CARTE propose, carte par carte, par ses propres fonctions. */
function ceQueLaCartePropose(trimestre, carteId) {
    const donnees = JEU[trimestre + '_planification_mindmap'];
    const entree = donnees.index.cartes.find(e => e.id === carteId);
    const store = JSON.parse(JSON.stringify(JEU));
    const db = {
        getSync: (k, d) => (k in store ? JSON.parse(JSON.stringify(store[k])) : (d !== undefined ? d : null)),
        setSync: (k, v) => { store[k] = v; }, get: async () => null, set: async () => {}
    };
    const win = chargerScript('js/planification-carte.js', {
        db, cle: (k) => trimestre + '_' + k,
        echapperHtml: (t) => String(t == null ? '' : t),
        document: { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], addEventListener: () => {},
            createElement: () => ({ style: {}, classList: { add() {}, remove() {} }, setAttribute() {}, appendChild() {} }) }
    });
    win.cle = (k) => trimestre + '_' + k;
    win.planificationDonnees = {
        getIndex: () => ({ active: carteId, cartes: donnees.index.cartes }),
        sauvegarderCarte: () => {}, chargerCarte: () => null,
        resoudreCoursDeCarte: () => (entree.coursId ? store.cours.find(c => c.id === entree.coursId) || null : null)
    };
    const api = win.planificationCarte;
    JSON.parse(JSON.stringify(donnees.cartes[carteId].noeuds)).forEach(n => api.etat.noeuds.set(n.id, n));
    api.reconstruireIndexClones();
    const noeuds = [...api.etat.noeuds.values()];
    const fiche = api.ficheCompetenceCarte();
    return {
        propositionsRelierObjectif: noeuds.filter(n => n.type === 'evaluation')
            .reduce((s, n) => s + api.objectifsARelierPourEvaluation(n).length, 0),
        blocsRelierCompetence: noeuds.filter(n => api.peutRelierCompetence(n)).length,
        dontDeuxTextesDifferents: noeuds.filter(n => api.peutRelierCompetence(n)
            && api.sectionCompetenceInspecteurHTML(n, fiche).indexOf('planif-panneau-texte-fiche') !== -1).length
    };
}

describe('Relevé du stock · deux liens', () => {
    const gele = JSON.stringify(JEU);
    const r = releverStockDeuxLiens((k) => (k in JEU ? JEU[k] : null), Object.keys(JEU));

    it('n’écrit rien', () => {
        expect(JSON.stringify(JEU)).toBe(gele);
    });

    it('compte exactement ce que la carte proposera, carte par carte', () => {
        const attendu = { propositionsRelierObjectif: 0, blocsRelierCompetence: 0, dontDeuxTextesDifferents: 0 };
        Object.keys(JEU.a2026_planification_mindmap.cartes).forEach((k) => {
            const c = ceQueLaCartePropose('a2026', k);
            Object.keys(attendu).forEach((cle) => { attendu[cle] += c[cle]; });
        });
        const t = r.trimestres.a2026;
        expect({ propositionsRelierObjectif: t.propositionsRelierObjectif, blocsRelierCompetence: t.blocsRelierCompetence,
            dontDeuxTextesDifferents: t.dontDeuxTextesDifferents }).toEqual(attendu);
        // Et les valeurs du jeu, posées à la main (E1 : 2, E2 : 3, E4 : 1 ; C1, C2, C3 — pas C8 :
        // sa carte a déjà une compétence liée, une seule l'est par carte).
        expect(attendu).toEqual({ propositionsRelierObjectif: 6, blocsRelierCompetence: 3, dontDeuxTextesDifferents: 2 });
    });

    it('les autres comptes : objectifs distincts, fiches sans compétence, blocs sans fiche, déjà liés', () => {
        const t = r.trimestres.a2026;
        expect(t.objectifsARelier).toBe(4);              // o1, o3, o5, o6
        expect(t.evaluationsAvecProposition).toBe(3);
        expect(t.competencesARelier).toBe(2);            // C1, C2 (C3 en est le clone)
        expect(t.blocsFicheSansCompetence).toBe(1);      // C4
        expect(t.blocsSansFiche).toBe(2);                // C5, C6
        expect(t.dejaLies).toEqual({ objectifs: 1, competences: 1 });
        expect(t.detail.every(d => !('texte' in d) && !('titre' in d))).toBe(true);
    });

    it('un trimestre sans productions propres lit la clé nue, comme la carte', () => {
        expect(r.trimestres.a2025.propositionsRelierObjectif).toBe(1);
        expect(ceQueLaCartePropose('a2025', 'k9').propositionsRelierObjectif).toBe(1);
    });
});
