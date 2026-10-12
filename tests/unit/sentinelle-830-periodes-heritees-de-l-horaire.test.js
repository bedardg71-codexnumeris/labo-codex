import { describe, it, expect } from 'vitest';
import { poserSetSyncSiChange } from './_helpers/charger-script.js';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// SENTINELLE #830 — UN HORAIRE D'AVANT #540 COMPTE ENCORE SES PÉRIODES.
//
// L'INCIDENT (Grégoire, 11 sept. 2026, 14 h 17, 1.131.0) : la barre
// « Assiduité (A) » du Suivi du groupe VIDE pour ses deux groupes d'Hiver 2026,
// C et P affichés. Six sondes en lecture seule sur ses données : 29 séances
// complètes, 1617 présences, 32 dates saisies, 29 en commun — et
// `obtenirNombrePeriodesSeance(date)` à 0 pour chacune. Depuis #540 lot E2, le
// nombre de périodes est une donnée SAISIE par séance ; ses horaires de janvier
// ne portent que heureDebut / heureFin / local. Zéro période offerte, zéro
// séance comptée, rien à l'écran.
//
// CE QUI EST VERROUILLÉ ICI :
//   1. `obtenirSeancesHoraire` projette `horaire.periodesParSeance` (le format
//      déclaré par l'utilisateur) sur toute séance sans `nombrePeriodes` —
//      EN LECTURE : l'entité en base n'est pas réécrite ;
//   2. une séance qui a son `nombrePeriodes` le garde ; un horaire sans
//      `periodesParSeance` rend ses séances telles quelles (0 — le refus de
//      répondre de #540 tient) ;
//   3. la génération des séances complètes propage la valeur héritée, et
//      `obtenirNombrePeriodesSeance` (saisie-presences.js) la lit ;
//   4. le repli `obtenirPeriodesPrevuesParHoraire` la lit aussi.
//
// BREAK-TEST VÉRIFIÉ le 11 septembre 2026 — journal en fin de fichier.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(__dirname, '..', '..');
const lire = (rel) => readFileSync(path.join(RACINE, rel), 'utf8');
const clone = (x) => JSON.parse(JSON.stringify(x));

const cle = (k) => (String(k).startsWith('test_') ? k : 'test_' + k);

function dbBanc(store, journal) {
    return {
        getSync: (k, d) => (k in store ? clone(store[k]) : (d !== undefined ? d : null)),
        setSync: (k, v) => { store[k] = clone(v); journal.push({ k, v: clone(v) }); },
        removeSync: (k) => { delete store[k]; },
        get: async (k, d) => (k in store ? clone(store[k]) : (d !== undefined ? d : null)),
        set: async (k, v) => { store[k] = clone(v); journal.push({ k, v: clone(v) }); },
    };
}
function elementDom(id) {
    return { id, _html: '', textContent: '', value: '', style: {}, dataset: {}, hidden: false,
        get innerHTML() { return this._html; }, set innerHTML(v) { this._html = v; },
        classList: { add() {}, remove() {}, contains() { return false; }, toggle() {} },
        querySelector() { return null; }, querySelectorAll() { return []; }, addEventListener() {}, appendChild(c) { return c; },
        setAttribute() {}, getAttribute() { return null; }, closest() { return null; } };
}
function fauxDocument(elements) {
    return { getElementById: (id) => (elements[id] || (elements[id] = elementDom(id))), querySelector: () => null, querySelectorAll: () => [],
        createElement: (t) => elementDom(t), addEventListener() {}, body: elementDom('body'), readyState: 'complete' };
}
function charger(chemin, globaux, win) {
    const code = lire(chemin);
    const { document: doc, ...autres } = globaux;
    const noms = ['window', 'document', 'console', 'localStorage', ...Object.keys(autres)];
    const ls = { getItem() { return null; }, setItem() {}, removeItem() {} };
    const vals = [win, doc, { warn() {}, error() {}, log() {} }, ls, ...Object.values(autres)];
    // eslint-disable-next-line no-new-func
    new Function(...noms, '"use strict";\n' + code)(...vals);
}

/** Un trimestre H2026 de banc : un GC actif, un horaire d'AVANT #540 (format 2 périodes, séances sans nombrePeriodes), 3 jeudis. */
function storeBase() {
    return {
        infoCours: { id: 'C1', nom: 'Cours', groupe: '00008' },
        groupeCoursActif: { id: 'GC1', trimestreId: 'test', coursId: 'C1', groupeNum: '00008', horaireId: 'HOR1' },
        test_groupesCours: [{ id: 'GC1', coursId: 'C1', trimestreId: 'test', actif: true, groupeNum: '00008', horaireId: 'HOR1' }],
        test_horaires: [{ id: 'HOR1', nom: 'Mar-Jeu', groupeAssocie: '00008', periodesParSeance: 2, seances: [
            { jour: 'Mardi', heureDebut: '16:00', heureFin: '18:00', local: '1712' },
            { jour: 'Jeudi', heureDebut: '10:00', heureFin: '12:00', local: '1712' },
        ] }],
        test_calendrierComplet: {
            '2026-01-22': { statut: 'cours', jourSemaine: 'Jeudi', numeroSemaine: 1 },
            '2026-01-27': { statut: 'cours', jourSemaine: 'Mardi', numeroSemaine: 2 },
            '2026-01-29': { statut: 'cours', jourSemaine: 'Jeudi', numeroSemaine: 2 },
        },
        test_dureePeriode: 50,
    };
}

function monter(store) {
    const journal = [];
    const db = poserSetSyncSiChange(dbBanc(store, journal));   // #1040
    const elements = {};
    const document = fauxDocument(elements);
    const win = { addEventListener() {}, obtenirTrimestreId: () => 'test', trimestreActif: 'test', cle, db,
        dateLocaleYMD: () => '2026-09-11', DUREE_PERIODE_DEFAUT: 50 };
    const base = { document, db, cle, echapperHtml: (s) => String(s == null ? '' : s), echapperAttribut: (s) => String(s == null ? '' : s),
        obtenirCoursActifId: () => 'C1', obtenirTrimestreId: () => 'test',
        obtenirDonneesSelonMode: (k) => clone(store[cle(k)] === undefined ? null : store[cle(k)]),
        sauvegarderDonneesSelonMode: (k, v) => db.setSync(cle(k), v),
        notifications: { succes() {}, erreur() {}, info() {}, warning() {} },
        obtenirInfosJourCalendrier: (d) => (store.test_calendrierComplet || {})[d] || null,
        estEtudiantExclu: () => false, obtenirEtudiantsCoursActif: () => [],
        setTimeout: () => 0, clearTimeout() {}, requestAnimationFrame: () => 0,
    };
    for (const [k, v] of Object.entries(base)) if (!(k in win)) win[k] = v;
    charger('js/horaire.js', base, win);
    // saisie-presences.js lit les exports d'horaire.js sur window : on les passe en globaux nommés.
    const avecHoraire = Object.assign({}, base, {
        obtenirSeancesHoraire: win.obtenirSeancesHoraire, obtenirSeancesCompletes: win.obtenirSeancesCompletes,
        cleSeancesCompletes: win.cleSeancesCompletes, genererSeancesCompletes: win.genererSeancesCompletes,
        obtenirDureePeriode: win.obtenirDureePeriode, obtenirSeancesJour: win.obtenirSeancesJour,
    });
    let saisieChargee = true;
    try { charger('js/saisie-presences.js', avecHoraire, win); } catch (e) { saisieChargee = false; win.__erreurSaisie = e; }
    return { win, store, journal, saisieChargee };
}

describe('#830 · l\'horaire résolu hérite du format déclaré', () => {
    it('une séance sans nombrePeriodes reçoit periodesParSeance — en lecture, l\'entité reste intacte', () => {
        const b = monter(storeBase());
        const seances = b.win.obtenirSeancesHoraire('C1');
        expect(seances.map(s => s.nombrePeriodes)).toEqual([2, 2]);
        expect(b.store.test_horaires[0].seances.map(s => s.nombrePeriodes)).toEqual([undefined, undefined]);
        expect(b.journal.filter(j => j.k === 'test_horaires')).toEqual([]);
    });

    it('une séance qui a son nombrePeriodes le garde ; sans periodesParSeance, rien n\'est inventé', () => {
        const store = storeBase();
        store.test_horaires[0].seances[0].nombrePeriodes = 3;
        const b = monter(store);
        expect(b.win.obtenirSeancesHoraire('C1').map(s => s.nombrePeriodes)).toEqual([3, 2]);
        const store2 = storeBase();
        delete store2.test_horaires[0].periodesParSeance;
        const b2 = monter(store2);
        expect(b2.win.obtenirSeancesHoraire('C1').map(s => s.nombrePeriodes)).toEqual([undefined, undefined]);
    });

    it('les séances complètes générées portent la valeur héritée', () => {
        const b = monter(storeBase());
        const sc = b.win.genererSeancesCompletes(null);
        const dates = Object.keys(sc).sort();
        expect(dates).toEqual(['2026-01-22', '2026-01-27', '2026-01-29']);
        expect(sc['2026-01-22'][0].nombrePeriodes).toBe(2);
        expect(sc['2026-01-27'][0].nombrePeriodes).toBe(2);
    });

    it('obtenirNombrePeriodesSeance et obtenirPeriodesPrevuesParHoraire rendent 2, plus 0 (le cas réel)', () => {
        const b = monter(storeBase());
        expect(b.saisieChargee, 'saisie-presences.js ne se charge pas : ' + (b.win.__erreurSaisie && b.win.__erreurSaisie.message)).toBe(true);
        b.win.genererSeancesCompletes(null);
        expect(b.win.obtenirNombrePeriodesSeance('2026-01-22')).toBe(2);
        expect(b.win.obtenirPeriodesPrevuesParHoraire('2026-01-27')).toBe(2);
        // Sans format déclaré : 0, comme #540 le veut.
        const store2 = storeBase(); delete store2.test_horaires[0].periodesParSeance;
        const b2 = monter(store2);
        b2.win.genererSeancesCompletes(null);
        expect(b2.win.obtenirNombrePeriodesSeance('2026-01-22')).toBe(0);
    });
});

// ---------------------------------------------------------------------------
// JOURNAL DU BREAK-TEST (11 septembre 2026)
//   `projeterPeriodesParSeance` remise à `return horaire.seances;` : les quatre
//   essais ROUGES (nombrePeriodes undefined, 0 périodes). Remis.
// ---------------------------------------------------------------------------
