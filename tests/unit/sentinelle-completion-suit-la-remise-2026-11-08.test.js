/**
 * SENTINELLE · LA COMPLÉTION SUIT LA REMISE, DANS LES QUATRE FAMILLES (décisions de Grégoire, 8 nov. 2026, 7 h 58 et
 * 7 h 59, en sommative ; étendues aux quatre familles le 9 nov., 9 h 27 à 9 h 30, en Cowork).
 * Consigne : plans de travail/CONSIGNE-LOT-2026-11-08-completion-suit-la-remise.md ; rapport :
 * plans de travail/RAPPORT-2026-11-09-completion-suit-la-remise.md.
 *
 * Une copie IMPORTÉE (une fiche de `fichiersTravaux`) compte comme remise dès sa réception ; l'évaluation la confirme,
 * ou la corrige (non remise, non recevable). Sans import (copie papier), l'évaluation seule confirme la remise.
 * Les quatre familles : la configurable (sommative, standards, spécifications, dénotation), les captures du Suivi, la
 * sommative et les standards codés en dur. PAS les spécifications codées en dur : leur C compte des travaux ACCEPTABLES.
 * Le dénominateur ne change pas : en sommative et dans la configurable, une production y entre à la première copie
 * évaluée du groupe ; dans les standards codés en dur, ce sont les travaux assignés avec une échéance (comme avant).
 *
 * Le cas de la consigne : une production, trois copies importées, une seule évaluée et verrouillée → les deux autres
 * comptent comme remises ; une copie papier, ni importée ni évaluée → elle ne compte pas.
 *
 * Break-tests faits le 9 nov. (chacun rend au moins un essai rouge, puis le code est rétabli) :
 *   · sommative, `remis:` sans les copies reçues (`copiesRecues` → null, la règle d'avant) → 1 rouge ;
 *   · configurable, la même chose → 1 rouge ;
 *   · (lot de la nuit, en sommative seule : la liste étendue à 'STD' rendait 4 rouges ; essais remplacés le 9 nov.) ;
 *   · (9 nov., l'extension) chacun des codes retiré de `FAMILLES_OU_LA_RECEPTION_VAUT_REMISE`, un à la fois : 'STD' →
 *     6 rouges (la famille, la configurable par standards, les standards codés en dur ×2, les deux captures) ; 'SPE' →
 *     4 rouges (la famille, la configurable par spécifications, les deux captures) ; 'DEN' → 4 rouges, de même ;
 *   · (9 nov.) standards codés en dur, `remis:` sans les copies reçues → 2 rouges ;
 *   · (9 nov.) la garde « sans pratique » retirée (`receptionVautRemise` rend vrai sur null) → 3 rouges (la famille, les
 *     deux captures) ;
 *   · `evaluation.verrouillee === false` retiré de `evaluationCorrigeLaReception` → 1 rouge (le brouillon « plagiat » corrige) ;
 *   · la garde du remplacement retirée de `evaluationCorrigeLaReception` → 1 rouge (le doublon réconcilié corrige) ;
 *   · captures, C de chaque élève sans les copies reçues → 1 rouge ;
 *   · captures, C du groupe sans `_ajouterRemisesParReception` → 1 rouge.
 * Noms fictifs.
 */
import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';
import { chargerPredicatsCopie } from './_helpers/predicats-copie.js';
import { monter, storeBase, RACINE } from './_helpers/bac-suivi.js';
import { readFileSync } from 'node:fs';
import path from 'node:path';

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

    it('une fiche orpheline (sans production) ou sans élève n\'est la remise de rien', () => {
        const r = registre();
        const recues = r.lireCopiesRecues([fichier('F1', BRUNO, ''), fichier('F2', '', 'P1'), null]);
        expect(recues.size).toBe(0);
        expect(r.lireCopiesRecues([fichier('F3', CHLOE, 'P1')]).size).toBe(1);   // TÉMOIN
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

    it('une copie REMPLACÉE ne corrige pas : un doublon réconcilié « plagiat » laisse la réception compter', () => {
        // Relecture neuve du 9 nov. : la garde du remplacement n'avait aucun essai. Le doublon (#360) est remplacé par E2,
        // un brouillon qui ne compte pas encore : seule la réception reste, et rien d'actif ne la corrige.
        const r = registre();
        const recues = r.lireCopiesRecues([fichier('F1', BRUNO, 'P1')]);
        const doublon = evaluee('E1', BRUNO, 'P1', { statutIntegrite: 'plagiat', remplaceeParId: 'E2', reconcilieParDoublon: true });
        const remplacante = evaluee('E2', BRUNO, 'P1', { verrouillee: false });
        expect(r.productionRemiseParEleve(BRUNO, 'P1', [doublon, remplacante], recues)).toBe(true);
        // TÉMOIN : le même « plagiat », actif (pas remplacé), corrige.
        const actif = evaluee('E1', BRUNO, 'P1', { statutIntegrite: 'plagiat' });
        expect(r.productionRemiseParEleve(BRUNO, 'P1', [actif, remplacante], recues)).toBe(false);
    });

    it('la famille décide : les quatre familles (9 nov.) ; sans pratique, non', () => {
        const r = registre();
        const pratique = (code) => ({ obtenirCode: () => code });
        expect(['SOM', 'STD', 'SPE', 'DEN'].map(c => r.receptionVautRemise(pratique(c)))).toEqual([true, true, true, true]);
        expect(r.receptionVautRemise(null)).toBe(false);
        expect(r.receptionVautRemise({})).toBe(false);
        expect(r.receptionVautRemise(pratique('???'))).toBe(false);   // TÉMOIN : la liste nomme, elle ne laisse pas tout passer
    });
});

describe('Le cas de la consigne, dans chaque classe et chaque famille qui compte des remises', () => {
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
    // La sommative codée en dur et la configurable de chaque famille : le même dénominateur (la première copie évaluée).
    const PRATIQUES = [
        ['js/pratiques/pratique-sommative.js', 'PratiqueSommative', { id: 'sommative', objectifs: [], tableBundles: [] }],
        ['js/pratiques/pratique-configurable.js', 'PratiqueConfigurable', { id: 'som-banc', type: 'sommative' }],
        ['js/pratiques/pratique-configurable.js', 'PratiqueConfigurable', { id: 'std-banc', type: 'standards' }],
        ['js/pratiques/pratique-configurable.js', 'PratiqueConfigurable', { id: 'spe-banc', type: 'specifications' }],
        ['js/pratiques/pratique-configurable.js', 'PratiqueConfigurable', { id: 'den-banc', type: 'denotation' }]
    ];
    PRATIQUES.forEach(([fichierJs, classeJs, config]) => {
        const classe = classeJs + ' (' + config.type + ')';
        it(`${classe} : Bruno et Chloé, importés et pas encore évalués, sont remis (1/1) ; Dario, sur papier, ne l'est pas (0/1)`, () => {
            const s = store();
            const c = (da) => { const d = instance(fichierJs, classeJs, s, config).calculerDetailsCompletion(da); return [d.remis, d.total]; };
            expect(c(ALICE)).toEqual([1, 1]);
            expect(c(BRUNO)).toEqual([1, 1]);
            expect(c(CHLOE)).toEqual([1, 1]);
            expect(c(DARIO)).toEqual([0, 1]);
        });

        it(`${classe} : TÉMOIN, sans les fiches importées, Bruno et Chloé retombent à 0/1 (la règle d'avant)`, () => {
            const s = store({ fichiers: false });
            const d = instance(fichierJs, classeJs, s, config).calculerDetailsCompletion(BRUNO);
            expect([d.remis, d.total]).toEqual([0, 1]);
        });

        it(`${classe} : le dénominateur ne bouge pas, des copies importées sans aucune évaluation n'y font pas entrer la production`, () => {
            const s = store();
            s.test_evaluationsSauvegardees = [];
            expect(instance(fichierJs, classeJs, s, config).calculerDetailsCompletion(BRUNO)).toBeNull();
        });

        it(`${classe} : l'évaluation corrige, Bruno marqué plagiat et Chloé « Non reçu » ne sont plus remis`, () => {
            const s = store();
            s.test_evaluationsSauvegardees.push(evaluee('E_BRUNO', BRUNO, 'P1', { statutIntegrite: 'plagiat' }));
            s.test_evaluationsSauvegardees.push(evaluee('E_CHLOE', CHLOE, 'P1', { statutRemise: 'non-recu', noteFinale: 0 }));
            const c = (da) => { const d = instance(fichierJs, classeJs, s, config).calculerDetailsCompletion(da); return [d.remis, d.total]; };
            expect(c(BRUNO)).toEqual([0, 1]);
            expect(c(CHLOE)).toEqual([0, 1]);
        });
    });

    // LES STANDARDS CODÉS EN DUR (une pratique « standards » absente de la bibliothèque) : leur dénominateur est autre,
    // les travaux ASSIGNÉS avec une échéance, qu'une copie soit évaluée ou non. Il ne change pas ; seul ce qui compte comme
    // remis change. Mesuré le 9 nov. : avant l'extension, Bruno et Chloé, importés, étaient à 0/1 ; après, 1/1.
    const STANDARDS_DUR = ['js/pratiques/pratique-pan-standards.js', 'PratiquePANStandards', { id: 'standards' }];
    it('PratiquePANStandards (codée en dur) : Bruno et Chloé importés sont remis (1/1) ; Dario, sur papier, 0/1', () => {
        const s = store();
        const c = (da) => { const d = instance(...STANDARDS_DUR.slice(0, 2), s, STANDARDS_DUR[2]).calculerDetailsCompletion(da); return [d.remis, d.total]; };
        expect(c(ALICE)).toEqual([1, 1]);
        expect(c(BRUNO)).toEqual([1, 1]);
        expect(c(CHLOE)).toEqual([1, 1]);
        expect(c(DARIO)).toEqual([0, 1]);
    });

    it('PratiquePANStandards (codée en dur) : le dénominateur ne bouge pas ; sans aucune évaluation, l\'import compte déjà (1/1), Dario 0/1', () => {
        // Ce que l'extension change ICI de plus qu'ailleurs : le travail assigné est au dénominateur avant toute évaluation
        // (c'était déjà le cas), donc la copie importée compte dès sa réception, sans attendre une première évaluation.
        const s = store();
        s.test_evaluationsSauvegardees = [];
        const c = (da) => { const d = instance(...STANDARDS_DUR.slice(0, 2), s, STANDARDS_DUR[2]).calculerDetailsCompletion(da); return [d.remis, d.total]; };
        expect(c(BRUNO)).toEqual([1, 1]);
        expect(c(DARIO)).toEqual([0, 1]);
        // TÉMOIN : sans les fiches importées, la règle d'avant (0/1).
        const sans = store({ fichiers: false });
        const d = instance(...STANDARDS_DUR.slice(0, 2), sans, STANDARDS_DUR[2]).calculerDetailsCompletion(BRUNO);
        expect([d.remis, d.total]).toEqual([0, 1]);
    });

    it('PratiquePANStandards (codée en dur) : l\'évaluation corrige, Bruno marqué plagiat n\'est plus remis', () => {
        const s = store();
        s.test_evaluationsSauvegardees.push(evaluee('E_BRUNO', BRUNO, 'P1', { statutIntegrite: 'plagiat' }));
        const d = instance(...STANDARDS_DUR.slice(0, 2), s, STANDARDS_DUR[2]).calculerDetailsCompletion(BRUNO);
        expect([d.remis, d.total]).toEqual([0, 1]);
    });

    // LES SPÉCIFICATIONS CODÉES EN DUR : leur C n'est pas une part de remises, c'est la part des travaux ACCEPTABLES du
    // palier le plus haut. Une copie reçue n'y est pas encore jugée : l'extension n'y entre pas, leur sens ne change pas.
    it('PratiquePanSpecifications (codée en dur) : inchangée, une copie importée et non évaluée n\'y compte pas', () => {
        const s = store();
        const inst = instance('js/pratiques/pratique-pan-specifications.js', 'PratiquePanSpecifications', s,
            { id: 'pan-specifications', tableBundles: [{ noteFixe: 85, requis: { travail: 2 } }], types: [] });
        expect(inst.calculerDetailsCompletion(BRUNO)).toBeNull();   // aucune évaluation de Bruno : rien à juger
        const src = readFileSync(path.join(RACINE, 'js/pratiques/pratique-pan-specifications.js'), 'utf8');
        expect(/lireCopiesRecues|productionRemiseParEleve|fichiersTravaux/.test(src)).toBe(false);
    });
});

describe('Les captures du Suivi suivent la remise, dans les quatre familles (snapshots.js)', () => {
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
            resoudrePratiqueActive: () => (code ? { etat: 'ok', pratique: { obtenirCode: () => code } } : { etat: 'aucune', pratique: null }),
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

    it('dans les trois autres familles aussi, le C historique de Bruno importé vaut 100 ; sans sa fiche, 0', () => {
        ['STD', 'SPE', 'DEN'].forEach(code => {
            expect([code, bac(code).calculerIndicesHistoriques(BRUNO, '2026-03-16').C]).toEqual([code, 100]);
            expect([code, bac(code, { fichiers: false }).calculerIndicesHistoriques(BRUNO, '2026-03-16').C]).toEqual([code, 0]);
        });
    });

    it('sans pratique résolue, la capture garde la règle d\'avant : 0', () => {
        expect(bac(null).calculerIndicesHistoriques(BRUNO, '2026-03-16').C).toBe(0);
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
            resoudrePratiqueActive: () => (code ? { etat: 'ok', pratique: { obtenirCode: () => code } } : { etat: 'aucune', pratique: null }),
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

    it('dans les trois autres familles, le C du groupe compte Bruno importé : 100 % ; sans sa fiche, 50 %', async () => {
        for (const code of ['STD', 'SPE', 'DEN']) {
            expect([code, (await releve(code)).groupe.moyenneC]).toEqual([code, 100]);
            expect([code, (await releve(code, { fichiers: false })).groupe.moyenneC]).toEqual([code, 50]);
        }
    });

    it('sans pratique résolue, le C du groupe garde la règle d\'avant : 50 %', async () => {
        expect((await releve(null)).groupe.moyenneC).toBe(50);
    });
});
