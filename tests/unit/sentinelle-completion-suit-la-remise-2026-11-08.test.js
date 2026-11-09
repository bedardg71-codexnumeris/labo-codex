/**
 * SENTINELLE · LA COMPLÉTION SUIT LA REMISE, EN SOMMATIVE (décisions de Grégoire, 8 nov. 2026, 7 h 58 et 7 h 59).
 * Consigne : plans de travail/CONSIGNE-LOT-2026-11-08-completion-suit-la-remise.md ; rapport :
 * plans de travail/RAPPORT-2026-11-09-completion-suit-la-remise.md.
 *
 * Une copie IMPORTÉE (une fiche de `fichiersTravaux`) compte comme remise dès sa réception ; l'évaluation la confirme,
 * ou la corrige (non remise, non recevable). Sans import (copie papier), l'évaluation seule confirme la remise.
 * La sommative seulement : les autres familles gardent la règle d'avant (ne pas étendre sans Grégoire).
 * Le dénominateur ne change pas : une production y entre à la première copie évaluée du groupe.
 *
 * Le cas de la consigne : une production, trois copies importées, une seule évaluée et verrouillée → les deux autres
 * comptent comme remises ; une copie papier, ni importée ni évaluée → elle ne compte pas.
 *
 * Break-tests faits le 9 nov. (chacun rend au moins un essai rouge, puis le code est rétabli) :
 *   · sommative, `remis:` sans les copies reçues (`copiesRecues` → null, la règle d'avant) → 1 rouge ;
 *   · configurable, la même chose → 1 rouge ;
 *   · `FAMILLES_OU_LA_RECEPTION_VAUT_REMISE` étendu à 'STD' → 4 rouges (la famille, la configurable par standards, les
 *     deux captures hors sommative) ;
 *   · `evaluation.verrouillee === false` retiré de `evaluationCorrigeLaReception` → 1 rouge (le brouillon « plagiat » corrige) ;
 *   · captures, C de chaque élève sans les copies reçues → 1 rouge ;
 *   · captures, C du groupe sans `_ajouterRemisesParReception` → 1 rouge.
 * Noms fictifs.
 */
import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';
import { chargerPredicatsCopie } from './_helpers/predicats-copie.js';
import { monter, storeBase } from './_helpers/bac-suivi.js';

const registre = () => chargerScript('js/pratiques/pratique-registre.js', {}, {});

// Un groupe de quatre, fictif : Alice est évaluée ; Bruno et Chloé ont remis par import ; Dario a remis sur papier.
const ALICE = '2000001', BRUNO = '2000002', CHLOE = '2000003', DARIO = '2000005';
const evaluee = (id, da, prod, extra = {}) => Object.assign(
    { id, etudiantDA: da, productionId: prod, noteFinale: 80, niveauFinal: 'M', verrouillee: true, ponderationCouverte: 100, coursId: 'GC1', dateEvaluation: '2026-03-10' }, extra);
const fichier = (id, da, prod, extra = {}) => Object.assign(
    { id, etudiantDA: da, productionId: prod, coursId: 'GC1', groupeCoursId: 'GC1', nomFichier: id + '.pdf', statut: 'actif', blobStatut: 'present', dateImport: '2026-03-02T12:00:00.000Z' }, extra);

describe('La règle (pratique-registre.js)', () => {
    it('une copie reçue par import est remise ; sans réception (null : autre famille), seule l\'évaluation confirme', () => {
        const r = registre();
        const recues = r.lireCopiesRecues([fichier('F1', BRUNO, 'P1')]);
        expect(r.productionRemiseParEleve(BRUNO, 'P1', [], recues)).toBe(true);
        expect(r.productionRemiseParEleve(BRUNO, 'P1', [], null)).toBe(false);          // la règle d'avant
        expect(r.productionRemiseParEleve(DARIO, 'P1', [], recues)).toBe(false);        // papier, pas encore évalué
        expect(r.productionRemiseParEleve(BRUNO, 'P2', [], recues)).toBe(false);        // reçue pour P1, pas pour P2
        expect(r.productionRemiseParEleve(DARIO, 'P1', [evaluee('E', DARIO, 'P1')], recues)).toBe(true);   // l'évaluation confirme
    });

    it('une fiche orpheline (sans production) ou à la corbeille n\'est la remise de rien', () => {
        const r = registre();
        const recues = r.lireCopiesRecues([fichier('F1', BRUNO, ''), fichier('F2', CHLOE, 'P1', { statut: 'corbeille' }), null]);
        expect(recues.size).toBe(0);
    });

    it('l\'évaluation enregistrée corrige la réception : non recevable (plagiat, IA) ou « Non reçu » ; pas un brouillon', () => {
        const r = registre();
        const recues = r.lireCopiesRecues([fichier('F1', BRUNO, 'P1')]);
        const corrigee = (extra) => r.productionRemiseParEleve(BRUNO, 'P1', [evaluee('E', BRUNO, 'P1', extra)], recues);
        expect(corrigee({ statutIntegrite: 'plagiat' })).toBe(false);
        expect(corrigee({ statutIntegrite: 'ia', noteFinale: null })).toBe(false);      // écartée : sans note, le statut suffit
        expect(corrigee({ statutRemise: 'non-recu', noteFinale: 0 })).toBe(false);
        expect(corrigee({ statutRemise: 'non-remis' })).toBe(false);
        // Un brouillon ne compte nulle part (16 sept.) : il ne corrige pas, la réception tient.
        expect(corrigee({ statutIntegrite: 'plagiat', verrouillee: false })).toBe(true);
        // TÉMOINS : une évaluation recevable confirme ; « soupçon » n'est pas un statut non recevable.
        expect(corrigee({})).toBe(true);
        expect(corrigee({ statutIntegrite: 'soupcon' })).toBe(true);
    });

    it('la famille décide : la sommative seulement', () => {
        const r = registre();
        const pratique = (code) => ({ obtenirCode: () => code });
        expect(['SOM', 'STD', 'SPE', 'DEN'].map(c => r.receptionVautRemise(pratique(c)))).toEqual([true, false, false, false]);
        expect(r.receptionVautRemise(null)).toBe(false);
        expect(r.receptionVautRemise({})).toBe(false);
    });
});

describe('Le cas de la consigne, dans les deux classes qui calculent C en sommative', () => {
    // P1 : trois copies importées (Alice, Bruno, Chloé), une seule évaluée et verrouillée (Alice). Dario : papier, rien.
    function store({ fichiers = true } = {}) {
        const s = storeBase();
        s.test_productions = [{ id: 'P1', titre: 'Analyse 1', type: 'travail', ponderation: 20, dateEcheance: '2026-03-01', coursId: 'GC1' }];
        s.test_evaluationsSauvegardees = [evaluee('E_ALICE', ALICE, 'P1')];
        s.test_fichiersTravaux = fichiers ? [fichier('F_A', ALICE, 'P1'), fichier('F_B', BRUNO, 'P1'), fichier('F_C', CHLOE, 'P1')] : [];
        return s;
    }
    function instance(fichierJs, classe, s, config) {
        const b = monter(s, { modules: ['js/entites/production-diagnostique.js', { chemin: fichierJs, internes: [] }] });
        const inst = Object.create(b.win[classe].prototype);
        inst.config = config;
        return inst;
    }
    const SOMMATIVES = [
        ['js/pratiques/pratique-sommative.js', 'PratiqueSommative', { id: 'sommative', objectifs: [], tableBundles: [] }],
        ['js/pratiques/pratique-configurable.js', 'PratiqueConfigurable', { id: 'som-banc', type: 'sommative' }]
    ];
    SOMMATIVES.forEach(([fichierJs, classe, config]) => {
        it(`${classe} : Bruno et Chloé, importés et pas encore évalués, sont remis (1/1) ; Dario, sur papier, ne l'est pas (0/1)`, () => {
            const s = store();
            const c = (da) => { const d = instance(fichierJs, classe, s, config).calculerDetailsCompletion(da); return [d.remis, d.total]; };
            expect(c(ALICE)).toEqual([1, 1]);
            expect(c(BRUNO)).toEqual([1, 1]);
            expect(c(CHLOE)).toEqual([1, 1]);
            expect(c(DARIO)).toEqual([0, 1]);
        });

        it(`${classe} : TÉMOIN, sans les fiches importées, Bruno et Chloé retombent à 0/1 (la règle d'avant)`, () => {
            const s = store({ fichiers: false });
            const d = instance(fichierJs, classe, s, config).calculerDetailsCompletion(BRUNO);
            expect([d.remis, d.total]).toEqual([0, 1]);
        });

        it(`${classe} : le dénominateur ne bouge pas, des copies importées sans aucune évaluation n'y font pas entrer la production`, () => {
            const s = store();
            s.test_evaluationsSauvegardees = [];
            expect(instance(fichierJs, classe, s, config).calculerDetailsCompletion(BRUNO)).toBeNull();
        });

        it(`${classe} : l'évaluation corrige, Bruno marqué plagiat et Chloé « Non reçu » ne sont plus remis`, () => {
            const s = store();
            s.test_evaluationsSauvegardees.push(evaluee('E_BRUNO', BRUNO, 'P1', { statutIntegrite: 'plagiat' }));
            s.test_evaluationsSauvegardees.push(evaluee('E_CHLOE', CHLOE, 'P1', { statutRemise: 'non-recu', noteFinale: 0 }));
            const c = (da) => { const d = instance(fichierJs, classe, s, config).calculerDetailsCompletion(da); return [d.remis, d.total]; };
            expect(c(BRUNO)).toEqual([0, 1]);
            expect(c(CHLOE)).toEqual([0, 1]);
        });
    });

    it('les autres familles gardent la règle d\'avant : une configurable par standards ne compte pas l\'import (0/1)', () => {
        const s = store();
        const d = instance('js/pratiques/pratique-configurable.js', 'PratiqueConfigurable', s, { id: 'std-banc', type: 'standards' }).calculerDetailsCompletion(BRUNO);
        expect([d.remis, d.total]).toEqual([0, 1]);
    });
});

describe('Les captures du Suivi suivent la sommative (snapshots.js)', () => {
    const PRODUCTIONS = [{ id: 'P1', titre: 'Analyse 1', type: 'travail', dateEcheance: '2026-03-01' }];
    function bac(code, { fichiers = true } = {}) {
        const store = {
            test_evaluationsSauvegardees: [evaluee('E_ALICE', ALICE, 'P1')],
            test_productions: PRODUCTIONS,
            test_fichiersTravaux: fichiers ? [fichier('F_B', BRUNO, 'P1')] : [],
            infoCours: { id: 'GC1', _groupeCoursId: 'GC1' }
        };
        const lire = (k) => JSON.parse(JSON.stringify(store['test_' + String(k).replace(/^test_/, '')] || []));
        const db = { getSync: (k, d) => (k in store ? JSON.parse(JSON.stringify(store[k])) : (d !== undefined ? d : null)), setSync() {}, get: async (k) => (k in store ? store[k] : null), set: async () => {}, useIndexedDB: false, memoryCache: new Map() };
        const win = { addEventListener() {}, removeEventListener() {}, dateLocaleYMD: () => '2026-05-15' };
        chargerPredicatsCopie(win);
        chargerScript('js/entites/production-diagnostique.js', {}, win);
        chargerScript('js/snapshots.js', { db, cle: (k) => 'test_' + k, echapperHtml: (s) => String(s),
            obtenirDonneesSelonMode: lire,
            calculerAssiduite: () => ({ indice: 1 }),
            obtenirEcheanceEffective: (p) => ({ date: p.dateEcheance || null, assignee: true }),
            resoudrePratiqueActive: () => ({ etat: 'ok', pratique: { obtenirCode: () => code } }),
            definirContexteSimulation() {}, effacerContexteSimulation() {}, calculerNoteDuCours: () => null,
            arrondirIndiceSurCent: (x) => Math.round(x * 100),
            obtenirCalendrierComplet: () => ({}), obtenirSeancesCompletes: () => ({}), obtenirEtudiantsCoursActif: () => [], estEtudiantExclu: () => false,
            notifications: { succes() {}, erreur() {}, info() {} } }, win);
        return win;
    }

    it('en sommative, le C historique de Bruno, importé et pas encore évalué, vaut 100 ; sans sa fiche, 0', () => {
        expect(bac('SOM').calculerIndicesHistoriques(BRUNO, '2026-03-16').C).toBe(100);
        expect(bac('SOM', { fichiers: false }).calculerIndicesHistoriques(BRUNO, '2026-03-16').C).toBe(0);
    });

    it('hors sommative, la capture garde la règle d\'avant : 0', () => {
        expect(bac('STD').calculerIndicesHistoriques(BRUNO, '2026-03-16').C).toBe(0);
    });

    // Le C du groupe d'une capture : le taux de remise du dernier travail dû (#726). Alice évaluée, Bruno importé.
    async function releve(code, { fichiers = true, evaluationsEnPlus = [] } = {}) {
        const store = {
            test_evaluationsSauvegardees: [evaluee('E_ALICE', ALICE, 'P1'), ...evaluationsEnPlus],
            test_productions: PRODUCTIONS,
            test_fichiersTravaux: fichiers ? [fichier('F_B', BRUNO, 'P1')] : [],
            infoCours: { id: 'GC1', _groupeCoursId: 'GC1' }
        };
        const clone = (x) => JSON.parse(JSON.stringify(x));
        const db = { getSync: (k, d) => (k in store ? clone(store[k]) : (d !== undefined ? d : null)), setSync() {}, get: async (k) => (k in store ? clone(store[k]) : null),
            set: async (k, v) => { store[k] = clone(v); }, useIndexedDB: false, memoryCache: new Map(),
            modifier: async (k, mutateur, d = null) => { const r = await mutateur(k in store ? clone(store[k]) : d); if (r !== undefined) store[k] = clone(r); return r; } };
        const win = { addEventListener() {}, removeEventListener() {}, dateLocaleYMD: () => '2026-05-15' };
        chargerPredicatsCopie(win);
        chargerScript('js/entites/production-diagnostique.js', {}, win);
        chargerScript('js/snapshots.js', { db, cle: (k) => 'test_' + k, echapperHtml: (s) => String(s),
            obtenirDonneesSelonMode: (k) => clone(store['test_' + String(k).replace(/^test_/, '')] || []),
            calculerAssiduite: () => ({ indice: 1 }),
            obtenirEcheanceEffective: (p) => ({ date: p.dateEcheance || null, assignee: true }),
            resoudrePratiqueActive: () => ({ etat: 'ok', pratique: { obtenirCode: () => code } }),
            definirContexteSimulation() {}, effacerContexteSimulation() {}, calculerNoteDuCours: () => null,
            arrondirIndiceSurCent: (x) => Math.round(x * 100),
            obtenirCalendrierComplet: () => ({}), obtenirSeancesCompletes: () => ({}),
            obtenirEtudiantsCoursActif: () => [{ da: ALICE, nom: 'Fictive', prenom: 'Alice', groupe: '01' }, { da: BRUNO, nom: 'Fictif', prenom: 'Bruno', groupe: '01' }],
            estEtudiantExclu: () => false,
            notifications: { succes() {}, erreur() {}, info() {} } }, win);
        return win.capturerSnapshotSeance('2026-03-16', null, { numeroSemaine: 10 });
    }

    it('en sommative, le C du groupe compte Bruno importé : 100 % ; sans sa fiche, 50 % ; marqué plagiat, 50 %', async () => {
        expect((await releve('SOM')).groupe.moyenneC).toBe(100);
        expect((await releve('SOM', { fichiers: false })).groupe.moyenneC).toBe(50);
        expect((await releve('SOM', { evaluationsEnPlus: [evaluee('E_BRUNO', BRUNO, 'P1', { statutIntegrite: 'plagiat' })] })).groupe.moyenneC).toBe(50);
    });

    it('hors sommative, le C du groupe garde la règle d\'avant : 50 %', async () => {
        expect((await releve('STD')).groupe.moyenneC).toBe(50);
    });
});
