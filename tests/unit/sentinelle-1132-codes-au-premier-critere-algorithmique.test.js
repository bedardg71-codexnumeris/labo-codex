/**
 * SENTINELLE #1132 — DEUX CRITÈRES ALGORITHMIQUES : LES CODES NE VONT QU'AU PREMIER, ET L'ÉCRAN LE DIT
 * (22 oct. 2026).
 *
 * Mesuré : un code posé s'écrit `errfr_<code>` sur la copie, sans son critère ; `mettreAJourCompteursErreurs`
 * le verse au premier champ « Nombre d'erreurs », et `codesAnnotation` lit le premier critère algorithmique.
 * Router chaque code vers son critère demande de changer le modèle de données, et une règle pour deux
 * critères qui portent le même numéro (l'élève le lit dans le cercle). Décision de Grégoire (22 oct.) :
 * DIRE LA LIMITE ; le calcul ne change pas, rien n'est écrit ; la fiche reste ouverte.
 *
 *   A — `enoncesAlgo.criteresAlgorithmiques` : tous, dans l'ordre ; `critereAlgorithmique` reste le premier.
 *   B — l'éditeur de grille (édition ET création) : un critère algorithmique qui n'est pas le premier n'a
 *       plus la case des codes (elle ne ferait rien) et nomme celui qui les reçoit ; le premier le dit aussi.
 *       Une grille à un seul critère algorithmique ne change pas d'un mot.
 *   C — Annoter : la phrase de l'engrenage (copie gouvernée) nomme le critère qui reçoit les codes.
 *
 * Break-tests (22 oct. 2026, restaurés, `cmp` identique) : `if (destination.ailleurs)` neutralisé dans
 * `rendreActivationCodes` → B.a, B.b et B.d rougissent (la case revient sur le second critère) ; la phrase
 * ajoutée neutralisée dans `_phraseSourceCodes` → C.a rougit.
 */
import { describe, it, expect } from 'vitest';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const require = createRequire(import.meta.url);
const echapper = (t) => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const SC = [
    { id: 'sc_1', code: '1', nom: 'Thèse non dégagée', ponderation: 1, retroaction: '' },
    { id: 'sc_2', code: '2', nom: 'Concept flou', ponderation: 1, retroaction: '' }
];
const algo = (id, nom) => ({ id, nom, type: 'algorithmique', ponderation: 20, codesDepuisSousCriteres: true,
    sousCriteres: JSON.parse(JSON.stringify(SC)) });
const HOLISTIQUE = { id: 'CH', nom: 'Structure', type: 'holistique', ponderation: 60 };
const DEUX = { id: 'G2', nom: 'Philo', dansBibliotheque: true, criteres: [HOLISTIQUE, algo('CA', 'Rigueur'), algo('CB', 'Langue')] };
const UN = { id: 'G1', nom: 'Philo', dansBibliotheque: true, criteres: [HOLISTIQUE, algo('CA', 'Rigueur')] };

/* ------------------------------------------------------------------ l'éditeur de grille */

function fauxElement() {
    return {
        value: '', innerHTML: '', textContent: '', style: {}, dataset: {},
        classList: { add() {}, remove() {}, contains: () => false, toggle() {} },
        querySelectorAll: () => [], querySelector: () => null,
        addEventListener() {}, appendChild() {}, setAttribute() {}, focus() {}
    };
}

function monterEditeur(grilles) {
    const store = { a2026_grillesTemplates: JSON.parse(JSON.stringify(grilles)) };
    const elements = {};
    const document = {
        getElementById: (id) => (elements[id] || (elements[id] = fauxElement())),
        querySelector: () => null, querySelectorAll: () => [],
        body: { appendChild() {}, removeChild() {} }, createElement: () => fauxElement(),
        addEventListener() {}, removeEventListener() {}
    };
    const db = {
        getSync: (k, d) => (k in store ? store[k] : d), setSync() {}, get: async (k, d) => (k in store ? store[k] : d), set: async () => {},
        modifier: async (k, mutateur, defaut) => { const r = await mutateur(k in store ? store[k] : defaut); if (r !== undefined) store[k] = r; return r; }
    };
    const globaux = {
        db, document, cle: (k) => 'a2026_' + k, echapperHtml: echapper,
        genererIdUnique: (p) => (p || 'ID_') + Math.random().toString(36).slice(2, 8),
        alert() {}, confirm: () => true, notifications: { succes() {}, erreur() {}, info() {}, avertissement() {} },
        BibliothequeUI: { obtenirAuteurActif: () => 'banc', forgerInspireDe: () => null, filtrerParModeDemo: (l) => l, repertoires: { rendre() {} } },
        obtenirIdentiteCCUtilisateur: () => 'banc', grilleTemplateActuelle: null
    };
    const win = chargerScript('js/ui-blocs.js', globaux);
    chargerScript('js/grilles.js', globaux, win);
    win.bareme = chargerScript('js/bareme.js').bareme;
    win.formulesAlgo = require(path.join(racine, 'js/evaluation-formules.js'));
    win.enoncesAlgo = require(path.join(racine, 'js/evaluation-enonces.js'));
    win.projectionAlgo = require(path.join(racine, 'js/evaluation-projection.js'));
    win.codesAnnotation = require(path.join(racine, 'js/codes-annotation.js'));
    win.estRessourceSupprimee = () => false;
    win.IDS_GABARITS_HARDCODES = [];
    return { win, liste: () => document.getElementById('listeCriteres').innerHTML };
}

/** Le HTML d'un critère, de son champ de nom au champ de nom suivant. */
function blocDuCritere(html, nom) {
    const marque = `value="${nom}"`;
    const i = html.indexOf(marque);
    if (i < 0) return '';
    const j = html.indexOf('data-champ="nom" style="font-weight: 500;"', i + marque.length);
    return html.slice(i, j < 0 ? undefined : j);
}

const CASE = 'Utiliser ces sous-critères comme codes d\'annotation';
const caseCochable = (bloc) => /data-on-change="modifierCodesDepuisSousCriteresHandler"/.test(bloc);

describe('#1132 · A — les critères algorithmiques d’une grille', () => {
    const e = require(path.join(racine, 'js/evaluation-enonces.js'));
    it('tous, dans l’ordre ; le premier reste celui de critereAlgorithmique', () => {
        expect(e.criteresAlgorithmiques(DEUX).map((c) => c.id)).toEqual(['CA', 'CB']);
        expect(e.critereAlgorithmique(DEUX).id).toBe('CA');
        expect(e.criteresAlgorithmiques(UN).map((c) => c.id)).toEqual(['CA']);
        expect(e.criteresAlgorithmiques(null)).toEqual([]);
        expect(e.criteresAlgorithmiques({ criteres: [null, HOLISTIQUE] })).toEqual([]);
        expect(e.critereAlgorithmique({ criteres: [] })).toBe(null);
    });
});

describe('#1132 · B — l’éditeur de grille dit où vont les codes', () => {
    it('B.a en ÉDITION, deux critères : le second n’a plus la case et nomme le premier ; le premier dit qu’il est seul', () => {
        const { win, liste } = monterEditeur([DEUX]);
        win.afficherCriteresGrille(JSON.parse(JSON.stringify(DEUX)));
        const html = liste();
        const second = blocDuCritere(html, 'Langue');
        const premier = blocDuCritere(html, 'Rigueur');
        expect(second).not.toBe('');
        expect(caseCochable(second)).toBe(false);
        expect(second).toContain('Les codes posés dans Annoter ne vont pas à ce critère : ils vont tous au premier critère algorithmique de la grille, « Rigueur ». Pour celui-ci, le nombre se tape à la correction.');
        expect(caseCochable(premier)).toBe(true);
        expect(premier).toContain('Il est le seul à les recevoir : cette grille a 2 critères algorithmiques, et les codes posés vont tous au premier.');
    });

    it('B.b en CRÉATION, la même chose', () => {
        const { win, liste } = monterEditeur([]);
        win.tempCriteres = JSON.parse(JSON.stringify(DEUX.criteres));
        win.afficherCriteresTemp();
        const html = liste();
        expect(caseCochable(blocDuCritere(html, 'Langue'))).toBe(false);
        expect(blocDuCritere(html, 'Langue')).toContain('ils vont tous au premier critère algorithmique de la grille, « Rigueur »');
        expect(blocDuCritere(html, 'Rigueur')).toContain('Il est le seul à les recevoir');
    });

    it('B.c un seul critère algorithmique : rien ne change, pas un mot de plus', () => {
        const { win, liste } = monterEditeur([UN]);
        win.afficherCriteresGrille(JSON.parse(JSON.stringify(UN)));
        const html = liste();
        expect(html).toContain(CASE);
        expect(html).not.toContain('Il est le seul à les recevoir');
        expect(html).not.toContain('ne vont pas à ce critère');
    });

    it('B.d le nom du premier critère est échappé', () => {
        const piege = JSON.parse(JSON.stringify(DEUX));
        piege.criteres[1].nom = 'Rigueur <b>x</b>';
        const { win, liste } = monterEditeur([piege]);
        win.afficherCriteresGrille(piege);
        expect(blocDuCritere(liste(), 'Langue')).toContain('« Rigueur &lt;b&gt;x&lt;/b&gt; »');
    });
});

/* ------------------------------------------------------------------ Annoter */

function monterAnnoter(grille) {
    const ecoutes = {};
    const win = { addEventListener: (n, f) => { (ecoutes[n] = ecoutes[n] || []).push(f); }, removeEventListener() {} };
    chargerScript('js/evaluation-enonces.js', {}, win);
    chargerScript('js/codes-annotation.js', { db: { getSync: () => null } }, win);
    const ajoutes = [];
    const document = {
        getElementById: () => null, querySelector: () => null, querySelectorAll: () => [],
        createElement: () => ({ innerHTML: '', style: {}, classList: { add() {}, remove() {} }, addEventListener() {}, remove() {} }),
        body: { appendChild: (el) => ajoutes.push(el) }, addEventListener() {}
    };
    class ImageStub { constructor() { this.src = ''; } addEventListener() {} removeEventListener() {} }
    chargerScript('js/travaux-outils.js', { db: { ready: false, getSync: () => null, setSync() {} }, Image: ImageStub, document, echapperHtml: echapper,
        travauxAnnotation: { getAnnotationCourante: () => null } }, win);
    win.codesAnnotation.grilleDeCopie = () => JSON.parse(JSON.stringify(grille));
    (ecoutes['travaux-fichier-ouvert'] || []).forEach((f) => f({ detail: { fichier: { id: 'F1' } } }));
    win.travauxOutils.ouvrirEditionRetroErreursFr();
    return ajoutes.map((el) => el.innerHTML).join('');
}

describe('#1132 · C — Annoter nomme le critère qui reçoit les codes', () => {
    it('C.a deux critères : la phrase de l’engrenage le dit', () => {
        const html = monterAnnoter(DEUX);
        expect(html).toContain('Les codes de cette copie viennent de sa grille « Philo ». Pour les modifier, ouvre la grille.');
        expect(html).toContain('Ils vont tous au critère « Rigueur », le premier des 2 critères algorithmiques de la grille.');
    });

    it('C.b un seul : la phrase de Grégoire, telle quelle', () => {
        const html = monterAnnoter(UN);
        expect(html).toContain('Les codes de cette copie viennent de sa grille « Philo ». Pour les modifier, ouvre la grille.');
        expect(html).not.toContain('Ils vont tous au critère');
    });
});
