/**
 * Statut « Incomplet ; travail en cours » (consigne de Cowork du 25 oct. 2026, décisions de Grégoire).
 *
 * L'élève n'a pas eu le temps de finir ; l'enseignant lui donne un délai SANS jeton. Tant que le
 * statut est posé (`travailEnCours: true` sur l'évaluation) :
 *   · la copie n'entre JAMAIS dans la note, verrouillée ou non (`evaluationEntreDansLaNote`) ;
 *   · elle compte comme REMISE pour l'indice C, dans les trois familles qui comptent des productions
 *     et dans les deux calculs des snapshots (`evaluationCompteCommeRemise`, la règle unique).
 * Les prédicats sont ceux de js/ (pas une copie). Noms fictifs.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';
import { chargerPredicatsCopie } from './_helpers/predicats-copie.js';
import { monter, storeBase } from './_helpers/bac-suivi.js';
import { tranche } from './_helpers/tranche.js';

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const source = (rel) => readFileSync(path.join(RACINE, rel), 'utf8');
const clone = (x) => JSON.parse(JSON.stringify(x));

const registre = () => chargerScript('js/pratiques/pratique-registre.js', {}, {});

const ANA = '2000001', BEA = '2000002';
const evalue = (id, da, prod, extra = {}) => Object.assign(
    { id, etudiantDA: da, productionId: prod, noteFinale: 80, niveauFinal: 'M', verrouillee: true, ponderationCouverte: 100, coursId: 'GC1', dateEvaluation: '2026-03-10' }, extra);
// La copie de Bea, posée « Incomplet ; travail en cours » : sans note, non verrouillée (l'auto-save l'écrit ainsi).
const incomplete = (id, da, prod, extra = {}) => Object.assign(
    { id, etudiantDA: da, productionId: prod, noteFinale: null, niveauFinal: '', verrouillee: false, travailEnCours: true, coursId: 'GC1', dateEvaluation: '2026-03-10' }, extra);

describe('Statut incomplet · la règle (pratique-registre.js)', () => {
    it('ne compte jamais dans la note — même verrouillée avec une note (un fichier importé, un ancien geste)', () => {
        const r = registre();
        expect(r.evaluationEntreDansLaNote(incomplete('E', BEA, 'P1'))).toBe(false);
        expect(r.evaluationEntreDansLaNote(incomplete('E', BEA, 'P1', { verrouillee: true, noteFinale: 90, ponderationCouverte: 100 }))).toBe(false);
        // TÉMOIN : la même copie sans le statut entre dans la note.
        expect(r.evaluationEntreDansLaNote(evalue('E', BEA, 'P1', { noteFinale: 90 }))).toBe(true);
    });

    it('compte comme remise pour C, sans note ni verrou ; pas une fois remplacée, ni non recevable', () => {
        const r = registre();
        expect(r.evaluationCompteCommeRemise(incomplete('E', BEA, 'P1'))).toBe(true);
        expect(r.evaluationCompteCommeRemise(incomplete('E', BEA, 'P1', { remplaceeParId: 'E2' }))).toBe(false);
        expect(r.evaluationCompteCommeRemise(incomplete('E', BEA, 'P1', { statutIntegrite: 'plagiat' }))).toBe(false);
        // TÉMOIN : sans le statut, la même copie sans note n'est pas une remise.
        const sansStatut = incomplete('E', BEA, 'P1'); delete sansStatut.travailEnCours;
        expect(r.evaluationCompteCommeRemise(sansStatut)).toBe(false);
        // Seul le booléen `true` compte.
        expect(r.evaluationCompteCommeRemise(incomplete('E', BEA, 'P1', { travailEnCours: 'true' }))).toBe(false);
    });

    it('sans le statut, la règle unique rend exactement l\'ancienne conjonction des trois prédicats (aucun autre chiffre ne bouge)', () => {
        const r = registre();
        const cas = [
            evalue('A', ANA, 'P1'),
            evalue('B', ANA, 'P1', { verrouillee: false }),
            evalue('C', ANA, 'P1', { noteFinale: null }),
            evalue('D', ANA, 'P1', { statutRemise: 'non-recu', noteFinale: 0 }),
            evalue('E', ANA, 'P1', { statutRemise: 'non-remis' }),
            evalue('F', ANA, 'P1', { statutIntegrite: 'ia' }),
            evalue('G', ANA, 'P1', { statutIntegrite: 'soupcon' }),
            evalue('H', ANA, 'P1', { remplaceeParId: 'X' }),
            evalue('I', ANA, 'P1', { ponderationCouverte: 0 }),
            evalue('J', ANA, 'P1', { travailEnCours: false })
        ];
        for (const e of cas) {
            const avant = r.evaluationEntreDansLaNote(e) && !r.evaluationNonRemise(e) && !r.evaluationNonRecevable(e);
            expect([e.id, r.evaluationCompteCommeRemise(e)]).toEqual([e.id, avant]);
        }
    });
});

describe('Statut incomplet · les trois familles qui comptent des productions', () => {
    // P1 est évaluée pour Ana (elle entre au dénominateur) ; Bea porte « Incomplet ; travail en cours ».
    function store({ statut = true } = {}) {
        const s = storeBase();
        s.test_productions = [{ id: 'P1', titre: 'Analyse 1', type: 'travail', ponderation: 20, dateEcheance: '2026-03-01', coursId: 'GC1' }];
        const copieBea = incomplete('E_BEA', BEA, 'P1');
        if (!statut) delete copieBea.travailEnCours;
        s.test_evaluationsSauvegardees = [evalue('E_ANA', ANA, 'P1'), copieBea];
        return s;
    }
    function instance(fichier, classe, s, config) {
        const b = monter(s, { modules: ['js/entites/production-diagnostique.js', { chemin: fichier, internes: [] }] });
        const inst = Object.create(b.win[classe].prototype);
        inst.config = config;
        return inst;
    }
    const FAMILLES = [
        ['js/pratiques/pratique-sommative.js', 'PratiqueSommative', { id: 'test', objectifs: [], tableBundles: [] }],
        ['js/pratiques/pratique-pan-standards.js', 'PratiquePANStandards', { id: 'test', objectifs: [], tableBundles: [] }],
        ['js/pratiques/pratique-configurable.js', 'PratiqueConfigurable', { id: 'test', famille: 'sommative' }]
    ];
    FAMILLES.forEach(([fichier, classe, config]) => {
        it(`${classe} — la copie incomplète est remise (1/1) ; sans le statut, elle ne l'est pas (0/1)`, () => {
            const avec = instance(fichier, classe, store(), config).calculerDetailsCompletion(BEA);
            expect([avec.remis, avec.total]).toEqual([1, 1]);
            const sans = instance(fichier, classe, store({ statut: false }), config).calculerDetailsCompletion(BEA);
            expect([sans.remis, sans.total]).toEqual([0, 1]);
        });
    });

    it('PratiqueSommative — la note de Bea est celle d\'avant la copie : la production n\'y entre pas, même verrouillée avec une note', () => {
        const s = store();
        s.test_productions.push({ id: 'P2', titre: 'Analyse 2', type: 'travail', ponderation: 20, dateEcheance: '2026-03-15', coursId: 'GC1' });
        s.test_evaluationsSauvegardees.push(evalue('E_BEA_2', BEA, 'P2', { noteFinale: 60 }));
        // La copie incomplète de Bea porte une note et un verrou (un fichier importé) : elle reste dehors.
        Object.assign(s.test_evaluationsSauvegardees[1], { noteFinale: 100, verrouillee: true, ponderationCouverte: 100 });
        const inst = instance('js/pratiques/pratique-sommative.js', 'PratiqueSommative', s, { id: 'test', objectifs: [], tableBundles: [] });
        expect(inst.calculerPerformance(BEA)).toBeCloseTo(0.6, 5);
        // TÉMOIN : sans le statut, la même copie tire la note vers le haut.
        delete s.test_evaluationsSauvegardees[1].travailEnCours;
        const temoin = instance('js/pratiques/pratique-sommative.js', 'PratiqueSommative', s, { id: 'test', objectifs: [], tableBundles: [] });
        expect(temoin.calculerPerformance(BEA)).toBeCloseTo(0.8, 5);
    });
});

describe('Statut incomplet · les deux calculs de C des snapshots', () => {
    // Même montage que sentinelle-726 (les vrais prédicats de copie, snapshots.js réel).
    const ELEVES = [{ da: ANA, nom: 'Fictif', prenom: 'Ana', groupe: '01' }, { da: BEA, nom: 'Fictif', prenom: 'Bea', groupe: '01' }];
    const PRODUCTIONS = [{ id: 'P1', titre: 'Analyse 1', type: 'travail', dateEcheance: '2026-03-01' }];
    async function releve(evaluations) {
        const store = { test_evaluationsSauvegardees: evaluations, test_productions: PRODUCTIONS, infoCours: { id: 'GC1', _groupeCoursId: 'GC1' } };
        const db = { getSync: (k, d) => (k in store ? clone(store[k]) : (d !== undefined ? d : null)), setSync() {}, get: async (k) => (k in store ? clone(store[k]) : null),
            set: async (k, v) => { store[k] = clone(v); }, useIndexedDB: false, memoryCache: new Map(),
            modifier: async (k, mutateur, d = null) => { const r = await mutateur(k in store ? clone(store[k]) : d); if (r !== undefined) store[k] = clone(r); return r; } };
        const win = { addEventListener() {}, removeEventListener() {}, dateLocaleYMD: () => '2026-05-15' };
        chargerPredicatsCopie(win);
        chargerScript('js/snapshots.js', { db, cle: (k) => 'test_' + k, echapperHtml: (s) => String(s),
            obtenirDonneesSelonMode: (k) => clone(store['test_' + String(k).replace(/^test_/, '')] || []),
            calculerAssiduite: () => ({ indice: 1, periodesPresentes: 20, periodesOffertes: 20, nombreSeances: 10 }),
            obtenirEcheanceEffective: (p) => ({ date: p.dateEcheance || null, assignee: true }),
            obtenirCalendrierComplet: () => ({}), obtenirSeancesCompletes: () => ({}),
            obtenirEtudiantsCoursActif: () => clone(ELEVES), estEtudiantExclu: () => false,
            notifications: { succes() {}, erreur() {}, info() {} } }, win);
        return win.capturerSnapshotSeance('2026-03-16', null, { numeroSemaine: 10 });
    }
    const cDe = (s, da) => (s.etudiants.find((e) => String(e.da) === da) || {}).C;

    it('le C de Bea (historique) et le C du groupe (dernier travail) la comptent comme remise', async () => {
        const s = await releve([evalue('E_ANA', ANA, 'P1'), incomplete('E_BEA', BEA, 'P1')]);
        expect(cDe(s, BEA)).toBe(100);
        expect(s.groupe.moyenneC).toBe(100);
    });

    it('TÉMOIN : sans le statut, la même copie sans note n\'est pas une remise (C de Bea 0, groupe 50)', async () => {
        const copie = incomplete('E_BEA', BEA, 'P1'); delete copie.travailEnCours;
        const s = await releve([evalue('E_ANA', ANA, 'P1'), copie]);
        expect(cDe(s, BEA)).toBe(0);
        expect(s.groupe.moyenneC).toBe(50);
    });
});

describe('Statut incomplet · les écrans et l\'enregistrement lisent la même règle', () => {
    it('la case de la palette Paramètres porte le libellé de Grégoire, mot pour mot, et arme le geste', () => {
        const html = source('index.html');
        const bloc = tranche(html, 'id="travailEnCours"', '</label>');
        expect(bloc).toContain('data-on-change="changerTravailEnCours"');
        expect(bloc).toContain('<span>Incomplet ; travail en cours</span>');
    });

    it('l\'auto-save écrit le statut sans niveau, retire la note, et ne réécrit pas les critères masqués', () => {
        const src = source('js/evaluation-chargement.js');
        const corps = tranche(src, 'function _autoSauvegarderCriteres(', 'function _lireIntegriteEcran(');
        expect(corps).toContain('if (!aDesNiveaux && !integriteSignalee && !travailEnCours) return;');
        expect(corps).toContain('if (aDesNiveaux && !travailEnCours) _majEvaluationExistanteAutoSave(');
        const maj = tranche(src, 'function _majTravailEnCoursAutoSave(', '/**');
        expect(maj).toContain('evaluation.noteFinale = null;');
        expect(maj).toContain('delete evaluation.travailEnCours;');
    });

    it('la porte du verrouillage refuse une copie incomplète, avant toute autre vérification', () => {
        const corps = tranche(source('js/evaluation-sauvegarde.js'), 'function sauvegarderEvaluation() {', 'window._annulerAutoSaveEnAttente();');
        expect(corps).toContain('if (refuserVerrouTravailEnCours()) return;');
    });
});
