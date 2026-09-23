/**
 * SENTINELLE #706 — UN BROUILLON N'ENTRE PAS DANS LA NOTE DU COURS, et le profil le dit.
 *
 * Règle arrêtée par Grégoire le 5 septembre 2026, après l'audit de la pratique de notation
 * (Rapports/AUDIT-pratique-de-notation-2026-09-05.md, constat C-1 ; H-1 du premier audit) :
 * une évaluation NON VERROUILLÉE (brouillon de l'auto-save #674, reprise pas encore
 * réévaluée, copie déverrouillée), ou dont la portée `ponderationCouverte` est nulle,
 * n'entre pas dans la note du cours — dans les QUATRE familles et dans les DEUX systèmes
 * (calculerDetailsNoteFinale et chaque calculerPerformance). Le profil et l'export disent
 * combien ont été écartées : « 2 évaluations non enregistrées, non comptées ».
 *
 * Les quatre élèves de banc de l'audit, AVANT le correctif (mesuré au banc) :
 *   SOM  C2 : le brouillon « 95 sur 50 % » comptait 95 → 87,5  (sans lui : 8830/101 = 87,43)
 *   STD  C4 : il entrait en tête de sélection → 83,2       (sans lui : 79,45)
 *   SPE  C5 : il rendait un examen acceptable → A = 100    (sans lui : B = 80)
 *   DEN     : jamais touché → 78
 * APRÈS : les nombres sans le brouillon, et le compte des écartées à côté.
 *
 * Break-test attendu : faire rendre `true` à evaluationEntreDansLaNote pour une évaluation
 * `verrouillee: false` → les quatre premiers cas rougissent.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';
import { pontsResolution } from './_helpers/ponts-resolution.js';   // lot N1a (21 sept. 2026)

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const clone = (x) => JSON.parse(JSON.stringify(x));
const r2 = (x) => (typeof x === 'number' ? Math.round(x * 100) / 100 : x);

const DA = { SOM: '1000001', STD: '1000002', SPE: '1000003', DEN: '1000004' };
const E1 = { id: 'E1', nom: 'IDME banc', niveaux: [
    { code: 'I', nom: 'Insuffisant', min: 0, max: 54, valeurCalcul: 40 },
    { code: 'D', nom: 'En développement', min: 55, max: 74, valeurCalcul: 65 },
    { code: 'M', nom: 'Maîtrisé', min: 75, max: 89, valeurCalcul: 82 },
    { code: 'E', nom: 'Étendu', min: 90, max: 100, valeurCalcul: 95 } ] };

function ev(id, da, productionId, noteFinale, niveauFinal, extra) {
    return Object.assign({ id, etudiantDA: da, productionId, noteFinale, niveauFinal, echelleId: 'E1', grilleId: 'G1',
        ponderationCouverte: 100, verrouillee: true, dateEvaluation: '2026-02-01T12:00:00.000Z', retroactionFinale: 'R.',
        statutIntegrite: 'recevable', statutRemise: 'remis',
        criteres: [{ critereId: 'c1', critereNom: 'Contenu', niveauSelectionne: niveauFinal, ponderation: 100 }] }, extra || {});
}
// Le brouillon « 95 sur 50 % » de #674 (non verrouillé) ; le brouillon « 0 sur 50 % » ; la portée nulle verrouillée (E-3 / fossile #697).
const BROUILLON95 = { noteFinale: 95, niveauFinal: 'E', ponderationCouverte: 50, verrouillee: false };
const BROUILLON0 = { noteFinale: 0, niveauFinal: '0', ponderationCouverte: 50, verrouillee: false };
const PORTEE_NULLE = { noteFinale: 0, niveauFinal: '--', ponderationCouverte: 0, verrouillee: true };

function jeuSOM(brouillon) {
    return { pratiqueId: 'som-banc',
        pratiques: [{ id: 'som-banc', nom: 'SOM banc', type: 'sommative', calcul_note: { methode: 'moyenne_ponderee' }, configuration: {} }],
        productions: [{ id: 'P1', titre: 'Dissertation', type: 'travail', ponderation: 40 }, { id: 'P2', titre: 'Examen', type: 'examen', ponderation: 60 },
            { id: 'P3', titre: 'Exercice', type: 'travail', ponderation: 0 }, { id: 'P4', titre: 'Quiz', type: 'quiz' }],
        evaluations: [ev('EV_S1', DA.SOM, 'P1', 84, 'M'),
            ev('EV_S2_OLD', DA.SOM, 'P2', 50, 'I', { remplaceeParId: 'EV_S2_NEW', archivee: true }),
            ev('EV_S2_NEW', DA.SOM, 'P2', 90, 'E', { repriseDeId: 'EV_S2_OLD', jetonRepriseApplique: true }),
            ev('EV_S3', DA.SOM, 'P3', 70, 'D'),
            ev('EV_S4', DA.SOM, 'P4', 0, '0', brouillon || BROUILLON0)] };
}
function jeuSTD(brouillon, opts = {}) {
    const productions = [{ id: 'PORT', titre: 'Portfolio', type: 'portfolio', ponderation: 60, regles: { nombreARetenir: 4, minimumCompletion: 1 } },
        { id: 'TERM', titre: 'Analyse finale', type: 'terminale', ponderation: 40, numero: 7, dateEcheance: '2026-05-01' }];
    for (let i = 1; i <= 6; i++) productions.push({ id: 'A' + i, titre: 'Artefact ' + i, type: 'artefact-portfolio', numero: i, ponderation: 0, dateEcheance: '2026-02-1' + i });
    const evaluations = [ev('EV_A1', DA.STD, 'A1', 85, 'M'), ev('EV_A2', DA.STD, 'A2', 60, 'D'), ev('EV_A3', DA.STD, 'A3', 78, 'M'),
        ev('EV_A4_OLD', DA.STD, 'A4', 90, 'E', { remplaceeParId: 'EV_A4_NEW', archivee: true }),
        ev('EV_A4_NEW', DA.STD, 'A4', 70, 'D', { repriseDeId: 'EV_A4_OLD', jetonRepriseApplique: true }),
        ev('EV_A5', DA.STD, 'A5', 78, 'M'), ev('EV_A6', DA.STD, 'A6', 0, '0', brouillon || BROUILLON0),
        ev('EV_TERM', DA.STD, 'TERM', 82, 'M', opts.terminaleBrouillon ? BROUILLON95 : {})];
    return { pratiqueId: 'std-banc',
        pratiques: [{ id: 'std-banc', nom: 'STD banc', type: 'standards', calcul_note: { methode: 'conversion_niveaux' },
            configuration: { type: 'standards', echelleId: 'E1', portfolio: { nombreARetenir: 4, minimumCompletion: 1, methodeSelection: 'meilleurs', reglesConformite: { actif: false } }, notesFinales: false } }],
        productions, evaluations };
}
function jeuSPE(brouillon) {
    return { pratiqueId: 'spe-banc',
        pratiques: [{ id: 'spe-banc', nom: 'SPE banc', type: 'specifications', calcul_note: { methode: 'specifications' },
            configuration: { type: 'specifications',
                typesTravaux: [{ id: 'dissertation', nom: 'Dissertation', seuilAcceptable: 70 }, { id: 'examen', nom: 'Examen', seuilAcceptable: 70 }, { id: 'dossier', nom: 'Dossier', seuilAcceptable: 70 }],
                tableBundles: [{ noteFixe: 100, label: 'A', requis: { dissertation: 2, examen: 2, dossier: 1 } }, { noteFixe: 80, label: 'B', requis: { dissertation: 2, examen: 1, dossier: 1 } },
                    { noteFixe: 70, label: 'C+', requis: { dissertation: 1, examen: 1, dossier: 1 } }, { noteFixe: 60, label: 'C', requis: { dissertation: 1, examen: 1 } }, { noteFixe: 50, label: 'F', requis: null }] } }],
        productions: [{ id: 'D1', type: 'dissertation' }, { id: 'D2', type: 'dissertation' }, { id: 'X1', type: 'examen' }, { id: 'X2', type: 'examen' }, { id: 'F1', type: 'dossier' }],
        evaluations: [ev('EV_D1', DA.SPE, 'D1', 80, 'M'), ev('EV_D2_OLD', DA.SPE, 'D2', 60, 'D', { remplaceeParId: 'EV_D2_NEW' }),
            ev('EV_D2_NEW', DA.SPE, 'D2', 75, 'M', { repriseDeId: 'EV_D2_OLD', jetonRepriseApplique: true }), ev('EV_X1', DA.SPE, 'X1', 90, 'E'),
            ev('EV_X2', DA.SPE, 'X2', 0, '0', brouillon || BROUILLON0), ev('EV_F1', DA.SPE, 'F1', 72, 'D')] };
}
function jeuDEN(brouillon) {
    return { pratiqueId: 'den-banc',
        pratiques: [{ id: 'den-banc', nom: 'DEN banc', type: 'denotation', calcul_note: { methode: 'jugement_global' },
            configuration: { type: 'denotation', modeDEN: 'eliminee', objectifs: [{ id: 'cible-1', nom: 'Lire' }, { id: 'cible-2', nom: 'Écrire' }], suggestion: { methode: 'mode' } } }],
        productions: [{ id: 'W1', type: 'travail' }, { id: 'W2', type: 'travail' }],
        evaluations: [ev('EV_W1', DA.DEN, 'W1', 85, 'M'), ev('EV_W2', DA.DEN, 'W2', 0, '0', brouillon || BROUILLON0)],
        jugements: { 'den-banc': { [DA.DEN]: { ciblesAtteintes: { 'cible-1': true, 'cible-2': true }, noteFinale: 78, justification: 'x', date: '2026-05-01' } } } };
}

function monter(jeu) {
    const store = {
        groupeCoursActif: { id: 'GC1', trimestreId: 'test' },
        test_groupesCours: [{ id: 'GC1', trimestreId: 'test', pratiqueId: jeu.pratiqueId }],
        test_pratiquesConfigurables: clone(jeu.pratiques), test_productions: clone(jeu.productions), test_evaluationsSauvegardees: clone(jeu.evaluations),
        test_echellesTemplates: [clone(E1)], test_groupeEtudiants: Object.values(DA).map(da => ({ da, nom: 'N', prenom: 'P', groupe: '01' })),
        test_jugementsDenotation: clone(jeu.jugements || {}), test_modalitesEvaluation: {}, test_portfoliosEleves: {}
    };
    const db = { getSync: (k, d) => (k in store ? clone(store[k]) : (d !== undefined ? d : null)), setSync: (k, v) => { store[k] = clone(v); }, get: async (k, d) => (k in store ? clone(store[k]) : d), set: async () => {} };
    const cle = (k) => 'test_' + k;
    const OBJETS = ['indicesCP', 'indicesAssiduite', 'jugementsDenotation', 'portfoliosEleves', 'modalitesEvaluation'];
    const obtenirDonneesSelonMode = (k) => { const kb = k.startsWith('test_') ? k.slice(5) : k; return ('test_' + kb) in store ? clone(store['test_' + kb]) : (OBJETS.includes(kb) ? {} : []); };
    const win = { addEventListener() {}, removeEventListener() {}, obtenirTrimestreId: () => 'test' };
    const fwd = (nom) => (...a) => win[nom](...a);
    const globaux = { db, cle, obtenirDonneesSelonMode, sauvegarderDonneesSelonMode: (k, v) => { store['test_' + k] = clone(v); return true; },
        estEtudiantExclu: () => false, echapperHtml: (s) => String(s == null ? '' : s), obtenirPreference: () => null,
        obtenirPratiqueActiveGroupeCours: () => store.test_groupesCours[0].pratiqueId, ...pontsResolution(win, () => store.test_groupesCours[0].pratiqueId),
        resoudreModeleParId: (type, id) => clone((store['test_' + (type === 'echelle' ? 'echellesTemplates' : 'grillesTemplates')] || []).find(m => m && m.id === id) || null),
        obtenirPratiqueParId: fwd('obtenirPratiqueParId'), obtenirTypePratiqueActive: fwd('obtenirTypePratiqueActive'), normaliserIdPratique: fwd('normaliserIdPratique'),
        obtenirConfigPratiqueActive: fwd('obtenirConfigPratiqueActive'), obtenirConfigCategories: fwd('obtenirConfigCategories'), calculerNoteAvecCategories: fwd('calculerNoteAvecCategories'),
        calculerDetailsNoteFinale: fwd('calculerDetailsNoteFinale'), compterEvaluationsEcarteesDeLaNote: fwd('compterEvaluationsEcarteesDeLaNote'), evaluationEntreDansLaNote: fwd('evaluationEntreDansLaNote') };
    chargerScript('js/pratiques/pratique-configurable.js', globaux, win);
    chargerScript('js/pratiques/pratique-registre.js', Object.assign({ PratiqueConfigurable: win.PratiqueConfigurable }, globaux), win);
    chargerScript('js/pratiques/pratique-manager.js', Object.assign({ PratiqueConfigurable: win.PratiqueConfigurable }, globaux), win);
    chargerScript('js/pratiques/pratique-sommative.js', globaux, win);
    chargerScript('js/pratiques/pratique-pan-standards.js', globaux, win);
    chargerScript('js/pratiques/pratique-pan-specifications.js', globaux, win);
    chargerScript('js/pratiques/denotation-jugements.js', globaux, win);
    chargerScript('js/portfolio.js', globaux, win);
    chargerScript('js/profil-etudiant-actions.js', globaux, win);
    chargerScript('js/export-resultats-finaux.js', globaux, win);
    return { win, store };
}
/** La phrase du profil, exposée depuis l'IIFE de sections-affichage (les MOTS que l'enseignant lit). */
function phraseDuProfil() {
    let code = readFileSync(path.join(RACINE, 'js/profil-etudiant-sections-affichage.js'), 'utf8');
    const fin = code.lastIndexOf('})();');
    code = code.slice(0, fin) + '\n;window.__phrase = _phraseEvaluationsEcartees;\n' + code.slice(fin);
    const win = { addEventListener() {}, removeEventListener() {} };
    const stubs = { db: { getSync: (k, d) => (d !== undefined ? d : null), setSync() {}, get: async () => null, set: async () => {} }, cle: (k) => 'test_' + k,
        echapperHtml: (s) => String(s == null ? '' : s), obtenirDonneesSelonMode: () => [], obtenirPreference: () => null };
    const storage = () => ({ _d: {}, getItem(k) { return k in this._d ? this._d[k] : null; }, setItem(k, v) { this._d[k] = String(v); }, removeItem(k) { delete this._d[k]; }, clear() { this._d = {}; } });
    const doc = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], createElement: () => ({ style: {}, classList: { add() {}, remove() {}, contains() { return false; }, toggle() { return false; } }, setAttribute() {}, appendChild() {}, addEventListener() {} }), addEventListener() {}, removeEventListener() {}, body: { addEventListener() {}, appendChild() {}, setAttribute() {}, getAttribute() { return null; }, classList: { add() {}, remove() {}, contains() { return false; }, toggle() { return false; } }, style: {} }, documentElement: { addEventListener() {} } };
    new Function('window', 'document', 'console', 'localStorage', 'sessionStorage', ...Object.keys(stubs), '"use strict";\n' + code)(win, doc, console, storage(), storage(), ...Object.values(stubs));
    return win.__phrase;
}

describe('#706 · un brouillon n\'entre pas dans la note du cours — les quatre familles, les deux systèmes', () => {
    it('SOM · le brouillon « 95 sur 50 % » ne compte plus : 87,43 (8830/101), par l\'instance ET par la configurable ; le récit le nomme « évaluation non enregistrée · non comptée »', () => {
        const b = monter(jeuSOM(BROUILLON95));
        const som = b.win.obtenirPratiqueParId('sommative');
        expect(r2(som.calculerPerformance(DA.SOM) * 100)).toBe(87.43);                       // avant : 87,5
        expect(r2(b.win.obtenirPratiqueParId('som-banc').calculerPerformance(DA.SOM) * 100)).toBe(87.43);
        const ecartee = som.decrireCalcul(DA.SOM).resultats.find(x => x.sort === 'ecarte');
        expect(ecartee).toMatchObject({ label: 'Quiz', note: 95, detail: 'évaluation non enregistrée · non comptée' });
        expect(b.win.compterEvaluationsEcarteesDeLaNote(DA.SOM)).toEqual({ brouillons: 1, sansPortee: 0, total: 1 });
    });
    it('SOM · le brouillon « 0 sur 50 % » ne pèse plus 0 : 87,43 aussi (avant : 86,57)', () => {
        const b = monter(jeuSOM(BROUILLON0));
        expect(r2(b.win.obtenirPratiqueParId('sommative').calculerPerformance(DA.SOM) * 100)).toBe(87.43);
    });
    it('STD · le brouillon « 95 » n\'entre plus en tête de sélection : 79,45 par le chemin riche ET par l\'instance ; `ecartees` porté par les détails', () => {
        const b = monter(jeuSTD(BROUILLON95));
        const d = b.win.calculerDetailsNoteFinale(DA.STD);
        expect(r2(d.noteFinale)).toBe(79.45);                                                   // avant : 83,2
        expect(d.portfolio.artefactsRetenus.map(a => a.productionId)).not.toContain('A6');
        expect(d.ecartees).toEqual({ brouillons: 1, sansPortee: 0, total: 1 });
        expect(d.recit.resultats.find(x => x.label === 'Artefact 6')).toMatchObject({ sort: 'ecarte', detail: 'évaluation non enregistrée · non comptée' });
        expect(r2(b.win.obtenirPratiqueParId('standards').calculerPerformance(DA.STD) * 100)).toBe(79.45);
        const s = b.win.simulerIndices(DA.STD, 'std-banc');
        expect([s.P, r2(s.noteFinale), s.ecartees.total]).toEqual([79, 79.45, 1]);
    });
    it('STD · une terminale en brouillon n\'est pas une terminale : note provisoire, pool seul (77,75)', () => {
        const b = monter(jeuSTD(BROUILLON0, { terminaleBrouillon: true }));
        const d = b.win.calculerDetailsNoteFinale(DA.STD);
        expect(r2(d.noteFinale)).toBe(77.75);
        expect(d.estProvisoire).toBe(true);
        expect(d.ecartees.total).toBe(2);
        expect(r2(b.win.obtenirPratiqueParId('standards').calculerPerformance(DA.STD) * 100)).toBe(77.75);
    });
    it('SPE · le brouillon « 95 » ne rend plus un examen acceptable : B (80), plus A (100) ; le brouillon 0 : 80 aussi', () => {
        const b95 = monter(jeuSPE(BROUILLON95)), b0 = monter(jeuSPE(BROUILLON0));
        expect(b95.win.obtenirPratiqueParId('spe-banc').calculerPerformance(DA.SPE) * 100).toBe(80);     // avant : 100
        expect(b0.win.obtenirPratiqueParId('spe-banc').calculerPerformance(DA.SPE) * 100).toBe(80);
        expect(b95.win.obtenirPratiqueParId('specifications').calculerPerformance(DA.SPE)).toBeNull(); // l'instance registre, jamais configurée (A-4) : aucune note (lot N4 ; avant : 0,5)
    });
    it('SPE · un élève qui n\'a QUE des brouillons n\'a pas de note (null), pas un palier d\'échec', () => {
        const jeu = jeuSPE(BROUILLON95); jeu.evaluations = jeu.evaluations.filter(e => e.id === 'EV_X2');
        const b = monter(jeu);
        expect(b.win.obtenirPratiqueParId('spe-banc').calculerPerformance(DA.SPE)).toBeNull();
    });
    it('DEN · rien ne change : 78, avec ou sans brouillon', () => {
        expect(monter(jeuDEN(BROUILLON95)).win.obtenirPratiqueParId('den-banc').calculerPerformance(DA.DEN)).toBe(0.78);
        expect(monter(jeuDEN(BROUILLON0)).win.obtenirPratiqueParId('den-banc').calculerPerformance(DA.DEN)).toBe(0.78);
    });
    it('la portée NULLE verrouillée (évaluation enregistrée sans aucun critère, fossile #697) est écartée aussi, et comptée à part', () => {
        const b = monter(jeuSOM(PORTEE_NULLE));
        expect(r2(b.win.obtenirPratiqueParId('sommative').calculerPerformance(DA.SOM) * 100)).toBe(87.43);
        expect(b.win.compterEvaluationsEcarteesDeLaNote(DA.SOM)).toEqual({ brouillons: 0, sansPortee: 1, total: 1 });
    });
    it('une évaluation d\'AVANT le 2 septembre (sans portée déclarée, sans verrou déclaré) compte comme avant', () => {
        const jeu = jeuSOM(); const ancienne = jeu.evaluations.find(e => e.id === 'EV_S4');
        delete ancienne.ponderationCouverte; delete ancienne.verrouillee; ancienne.noteFinale = 70; ancienne.niveauFinal = 'D';
        const b = monter(jeu);
        // (84×40 + 90×60 + 70×1 + 70×1) / 102 = 8900 / 102 = 87,25
        expect(r2(b.win.obtenirPratiqueParId('sommative').calculerPerformance(DA.SOM) * 100)).toBe(87.25);
        expect(b.win.compterEvaluationsEcarteesDeLaNote(DA.SOM).total).toBe(0);
    });
    it('la règle est UNE fonction, et elle dit non aux quatre cas', () => {
        const { win } = monter(jeuSOM());
        const f = win.evaluationEntreDansLaNote;
        expect(f({ noteFinale: 84, verrouillee: true, ponderationCouverte: 100 })).toBe(true);
        expect(f({ noteFinale: 84 })).toBe(true);
        expect(f({ noteFinale: 95, verrouillee: false, ponderationCouverte: 50 })).toBe(false);
        expect(f({ noteFinale: 0, verrouillee: true, ponderationCouverte: 0 })).toBe(false);
        expect(f({ noteFinale: 84, remplaceeParId: 'x' })).toBe(false);
        expect(f({ noteFinale: null })).toBe(false);
    });
});

describe('#706 · le profil et l\'export DISENT combien ont été écartées', () => {
    it('l\'export porte une colonne « Non comptées » : 1 pour l\'élève au brouillon, vide quand la simulation ne le sait pas', () => {
        const b = monter(jeuSTD(BROUILLON95));
        const X = b.win._exportResultats;
        expect(X.ENTETES_SYNTHESE[10]).toBe('Non comptées');
        const ligne = X.construireLignesSynthese([{ da: DA.STD, nom: 'N', prenom: 'P' }], { pratiqueId: 'std-banc' }, b.win.simulerIndices)[0];
        expect(ligne.slice(8)).toEqual([79, 'final', 1]);
        const sans = X.construireLignesSynthese([{ da: DA.STD, nom: 'N', prenom: 'P' }], { pratiqueId: 'x' }, () => ({ P: 80, noteConstructible: true }))[0];
        expect(sans[10]).toBe('');
    });
    it('les mots du profil : « 2 évaluations non enregistrées, non comptées » · « 1 évaluation sans critère évalué, non comptée » (mot arrêté par Grégoire le 5 sept. 2026 : sans « aucun ») ; rien quand rien n\'est écarté', () => {
        const phrase = phraseDuProfil();
        expect(phrase({ brouillons: 2, sansPortee: 0, total: 2 })).toContain('2 évaluations non enregistrées, non comptées');
        expect(phrase({ brouillons: 1, sansPortee: 0, total: 1 })).toContain('1 évaluation non enregistrée, non comptée');
        expect(phrase({ brouillons: 0, sansPortee: 1, total: 1 })).toContain('1 évaluation sans critère évalué, non comptée');
        expect(phrase({ brouillons: 0, sansPortee: 2, total: 2 })).toContain('2 évaluations sans critère évalué, non comptées');
        expect(phrase({ brouillons: 1, sansPortee: 1, total: 2 })).not.toContain('aucun');
        expect(phrase({ brouillons: 1, sansPortee: 1, total: 2 })).toContain(' · ');
        expect(phrase({ brouillons: 0, sansPortee: 0, total: 0 })).toBe('');
        expect(phrase(null)).toBe('');
        expect(phrase({ brouillons: 1, sansPortee: 0, total: 1 }, 'note-finale-message-provisoire')).toMatch(/^<div class="note-finale-message-provisoire">/);
    });
});
