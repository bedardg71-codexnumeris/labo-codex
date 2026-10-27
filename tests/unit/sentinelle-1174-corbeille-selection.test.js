import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';
import { tranche } from './_helpers/tranche.js';

// SENTINELLE #1174 (27 oct. 2026) — « METTRE À LA CORBEILLE (N) » : UNE QUESTION,
// PUIS UNE SEULE ÉCRITURE PAR LISTE.
//
// Vécu le 27 oct. : 22 copies cochées sur « Artefact 5 », supprimées une à une par
// « Actions… → Supprimer ». Décision de Grégoire (9 h 01) : toutes les copies cochées
// partent, y compris celles déjà évaluées.
//
// Deux bords :
//   R — le récapitulatif est PUR : ce qui part, les copies évaluées (leur note reste),
//       celles liées à une reprise ; son HTML échappe et ne montre jamais un DA.
//   S — `deplacerEnCorbeilleLot` (travaux-stockage.js RÉEL) : une écriture par liste,
//       la même date pour tout le lot, un id absent ignoré, le compte rendu ; et
//       `deplacerEnCorbeille` n'est qu'un appel du lot (un seul chemin).
//
// Break-test (27 oct.), huit défenses cassées une à une, huit rouges : évaluée jamais vue
// (R.c), reprise jamais vue (R.e), le DA en repli (R.g), nom non échappé (R.g), une écriture
// par copie (S.a), une date par copie (S.a), le compte des ids voulus (S.b), écrire à vide (S.c).
// Données FICTIVES.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const lire = (rel) => readFileSync(path.join(racineProjet, rel), 'utf8');

function echapperHtmlReel(texte) {
    if (texte == null) return '';
    return String(texte).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

const A5 = 'PROD_A5';
const ETUDIANTS = [
    { da: '2000001', nom: 'Exemple', prenom: 'Sara' },
    { da: '2000002', nom: 'Roy', prenom: 'Camille' },
    { da: '2000003', nom: 'Gagnon', prenom: 'Léa' }
];
const FICHIERS = [
    { id: 'F1', etudiantDA: '2000001', productionId: A5, nomFichier: 'sara.pdf' },
    { id: 'F2', etudiantDA: '2000002', productionId: A5, nomFichier: 'camille.pdf', evaluationId: 'EV2' },
    { id: 'F3', etudiantDA: '2000003', productionId: A5, nomFichier: 'lea.pdf' }
];
const EVAL_NOTEE = { id: 'EV2', etudiantDA: '2000002', productionId: A5, criteres: [{ id: 'C1' }], noteFinale: 48.8 };

function chargerListe() {
    const globaux = {
        db: { get: async () => null, getSync: (k, d) => (d !== undefined ? d : null), set: async () => {}, setSync: () => {} },
        cle: (k) => 'test_' + k,
        echapperHtml: echapperHtmlReel,
        obtenirLibelleStatut: (s) => s,
        obtenirDonneesSelonMode: () => [],
        setTimeout: () => 0,
        notifications: { succes() {}, erreur() {}, info() {}, warning() {} }
    };
    return chargerScript('js/liste-evaluations.js', globaux, { addEventListener() {}, removeEventListener() {}, pluriel: (n, s, p) => (n > 1 ? p : s) });
}

/* --------------------------------------------------------- R — récapitulatif pur */

describe('#1174 · R — le récapitulatif compte ce qui part et nomme ce qui reste', () => {
    const win = chargerListe();
    const recap = (ids, donnees) => win._composerRecapCorbeille(ids, Object.assign({ fichiers: FICHIERS, evaluations: [], etudiants: ETUDIANTS }, donnees || {}));

    it('R.a sélection vide : rien à déplacer, rien à nommer', () => {
        const r = recap([]);
        expect(r.aDeplacer).toEqual([]);
        expect(r.evaluees).toEqual([]);
        expect(r.reprises).toEqual([]);
    });

    it('R.b aucune évaluée : toutes partent, aucun bloc ne s\'affiche', () => {
        const r = recap(['F1', 'F3']);
        expect(r.aDeplacer.map(c => c.fichierId)).toEqual(['F1', 'F3']);
        expect(r.evaluees).toEqual([]);
        expect(r.reprises).toEqual([]);
        const html = win._genererRecapCorbeilleHTML(r);
        expect(html).toContain('pendant 30 jours');
        expect(html).not.toContain('déjà évaluée');
        expect(html).not.toContain('reprise');
    });

    it('R.c une évaluée : elle part aussi, et le HTML la nomme', () => {
        const r = recap(['F1', 'F2', 'F3'], { evaluations: [EVAL_NOTEE] });
        expect(r.aDeplacer).toHaveLength(3);
        expect(r.evaluees.map(c => c.fichierId)).toEqual(['F2']);
        const html = win._genererRecapCorbeilleHTML(r);
        expect(html).toContain('1 copie déjà évaluée');
        expect(html).toContain('leur évaluation et leur note restent dans la liste, sans copie liée');
        expect(html).toContain('<li>Camille Roy</li>');
    });

    it('R.d une évaluation sans critère (jeton seul) ne compte pas comme évaluée', () => {
        const r = recap(['F2'], { evaluations: [{ id: 'EV2', etudiantDA: '2000002', productionId: A5, criteres: [] }] });
        expect(r.evaluees).toEqual([]);
    });

    it('R.e une copie liée à une reprise est nommée ; un doublon réconcilié ne l\'est pas', () => {
        const reprise = [{ id: 'EV3', etudiantDA: '2000003', productionId: A5, remplaceeParId: 'EV3R' }, { id: 'EV3R', etudiantDA: '2000003', productionId: A5, repriseDeId: 'EV3' }];
        const r = recap(['F1', 'F3'], { evaluations: reprise });
        expect(r.reprises.map(c => c.fichierId)).toEqual(['F3']);
        const html = win._genererRecapCorbeilleHTML(r);
        expect(html).toContain('1 copie liée à une reprise.');
        expect(html).toContain('ni la reprise ni le statut « remplacée »');
        const doublon = recap(['F3'], { evaluations: [{ id: 'EV3', etudiantDA: '2000003', productionId: A5, remplaceeParId: 'X', reconcilieParDoublon: true }] });
        expect(doublon.reprises).toEqual([]);
    });

    it('R.f un id absent est ignoré, un id répété compte une fois', () => {
        const r = recap(['F1', 'ABSENT', 'F1']);
        expect(r.aDeplacer.map(c => c.fichierId)).toEqual(['F1']);
    });

    it('R.g un élève introuvable ne sort jamais son DA ; un nom est échappé', () => {
        const r = recap(['F1', 'F2'], { etudiants: [{ da: '2000002', prenom: '<b>Cam', nom: 'Roy' }], evaluations: [EVAL_NOTEE, { id: 'EVX', etudiantDA: '2000001', productionId: A5, criteres: [{}] }] });
        expect(r.aDeplacer[0].nomEleve).toBe('Copie sans élève');
        const html = win._genererRecapCorbeilleHTML(r);
        expect(html).not.toContain('2000001');
        expect(html).toContain('&lt;b&gt;Cam Roy');
        expect(html).not.toContain('<b>Cam');
    });

    it('R.h la barre porte le bouton, branché par data-action', () => {
        const html = lire('index.html');
        expect(html).toMatch(/id="eval-btn-corbeille-selection" data-action="mettreSelectionALaCorbeille"/);
        expect(typeof win.mettreSelectionALaCorbeille).toBe('function');
    });
});

/* --------------------------------------------------------- S — une seule écriture */

function stockage(fichiers, corbeille) {
    const store = { test_fichiersTravaux: JSON.parse(JSON.stringify(fichiers)), test_corbeilleFichiers: JSON.parse(JSON.stringify(corbeille || [])) };
    const ecritures = {};
    const db = {
        getSync: (k, d) => (k in store ? JSON.parse(JSON.stringify(store[k])) : d),
        setSync: (k, v) => { ecritures[k] = (ecritures[k] || 0) + 1; store[k] = JSON.parse(JSON.stringify(v)); return true; }
    };
    const w = chargerScript('js/travaux-stockage.js', {
        db, cle: (k) => 'test_' + k, Image: function () {},
        document: { createElement: () => ({ getContext: () => null }) }, navigator: { storage: null }
    });
    return { S: w.travauxStockage, store, ecritures };
}

describe('#1174 · S — deplacerEnCorbeilleLot écrit une fois chaque liste', () => {
    it('S.a N copies : une écriture par liste, N lignes dans la corbeille avec la même date', () => {
        const { S, store, ecritures } = stockage(FICHIERS, [{ id: 'VIEUX', dateSuppression: '2026-10-01T00:00:00.000Z' }]);
        expect(S.deplacerEnCorbeilleLot(['F1', 'F2', 'F3'])).toBe(3);
        expect(ecritures).toEqual({ test_fichiersTravaux: 1, test_corbeilleFichiers: 1 });
        expect(store.test_fichiersTravaux).toEqual([]);
        const nouveaux = store.test_corbeilleFichiers.filter(f => f.id !== 'VIEUX');
        expect(nouveaux.map(f => f.id)).toEqual(['F1', 'F2', 'F3']);
        expect(new Set(nouveaux.map(f => f.dateSuppression)).size).toBe(1);
        expect(nouveaux[1].evaluationId).toBe('EV2');   // les métadonnées voyagent intactes
        expect(store.test_corbeilleFichiers[0]).toEqual({ id: 'VIEUX', dateSuppression: '2026-10-01T00:00:00.000Z' });
    });

    it('S.b un id absent est ignoré ; les autres copies restent', () => {
        const { S, store } = stockage(FICHIERS);
        expect(S.deplacerEnCorbeilleLot(['F2', 'ABSENT'])).toBe(1);
        expect(store.test_fichiersTravaux.map(f => f.id)).toEqual(['F1', 'F3']);
        expect(store.test_corbeilleFichiers.map(f => f.id)).toEqual(['F2']);
    });

    it('S.c rien à déplacer : rien n\'est écrit', () => {
        const { S, ecritures } = stockage(FICHIERS);
        expect(S.deplacerEnCorbeilleLot(['ABSENT'])).toBe(0);
        expect(S.deplacerEnCorbeilleLot([])).toBe(0);
        expect(ecritures).toEqual({});
    });

    it('S.d deplacerEnCorbeille passe par le lot (un seul chemin) et rend toujours un booléen', () => {
        const { S, store } = stockage(FICHIERS);
        expect(S.deplacerEnCorbeille('F1')).toBe(true);
        expect(S.deplacerEnCorbeille('ABSENT')).toBe(false);
        expect(store.test_corbeilleFichiers.map(f => f.id)).toEqual(['F1']);
        const corps = tranche(lire('js/travaux-stockage.js'), 'function deplacerEnCorbeille(id)', 'function deplacerEnCorbeilleLot(');
        expect(corps).toContain('deplacerEnCorbeilleLot([id])');
        expect(corps).not.toMatch(/sauvegarder|\.push\(/);
    });
});
