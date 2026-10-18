/**
 * « APPORTER MON MATÉRIEL », LA DISSECTION, LOT 9b — la garde de la note, pour les critères marqués « à compléter ».
 *
 * Consigne : plans de travail/CONSIGNE-LOT-2026-10-18-dissection-9b-la-garde.md (décision de Grégoire, 18 oct.,
 * 18 h 32 : la garde ne vise que les critères MARQUÉS au moment où l'absence est écrite, à partir de maintenant).
 *
 * Ce que ce banc verrouille :
 *   G — `calculerPortee` : un critère marqué est hors note (motif « ponderation-a-completer ») et l'évaluation
 *       commencée est incomplète, avec ou sans niveau ; un critère NON marqué sans pondération (le stock) est
 *       calculé comme avant ; un 0, aussi. Les phrases de l'écran et le texte du refus le nomment.
 *   M — la marque posée : par la création de la dissection ; par les trois gestionnaires du champ « Points »
 *       de Grilles de critères (vidé → `null` + marque ; un nombre → la marque retirée).
 *   V — la marque voyage : l'import sélectif ramène `null` à 0 mais garde la marque (et la garde s'applique
 *       encore) ; un aller-retour JSON (codex, export complet, partage vers les grilles actives) la garde.
 *
 * Break-tests (faits le 18 oct.) : la garde qui ignore la marque (`if (false)`) → G.a, G.e, V.a, V.a bis et V.b
 * rouges ; `poserPonderation` qui écrit `null` sans poser la marque → M.b et M.c rouges ; la marque retirée du
 * schéma d'import → V.a rouge.
 *
 * Grilles FICTIVES, jamais le texte d'une grille réelle.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { JSDOM } from 'jsdom';
import { chargerScript } from './_helpers/charger-script.js';
import { GRILLE_D7, enHtml, etiquettes, liensPar, decouperD } from './_helpers/grilles-fictives-dissection.js';

const fenetreDom = new JSDOM('<!doctype html><html><body></body></html>').window;

let calcul;
let D;
let A;
let importExport;
beforeAll(() => {
    calcul = chargerScript('js/evaluation-calcul.js', { valeurNumeriqueDuNiveau: () => undefined }, { addEventListener() {}, removeEventListener() {} });
    const w = chargerScript('js/materiel-lecture.js', { DOMParser: fenetreDom.DOMParser });
    chargerScript('js/materiel-assistant.js', {}, w);
    chargerScript('js/materiel-dissection-lecture.js', { DOMParser: fenetreDom.DOMParser }, w);
    D = w.materielDissectionLecture;
    A = w.materielAssistant;
    importExport = chargerScript('js/import-export.js');
});

/** Une portée : les niveaux choisis par id de critère, la valeur de chaque niveau. */
const VALEURS = { I: 40, D: 65, M: 80, E: 95 };
const portee = (criteres, niveaux) => calcul.calculerPortee(criteres, (c) => niveaux[c.id] || '', (c, n) => VALEURS[n]);

describe('G — la garde de la note', () => {
    it('G.a — un critère marqué est hors note, même avec un niveau : l’évaluation est incomplète', () => {
        const criteres = [{ id: 'C1', nom: 'Idées fictives', ponderation: 24 }, { id: 'C2', nom: 'Nuances fictives', ponderation: null, ponderationACompleter: true }];
        const p = portee(criteres, { C1: 'M', C2: 'D' });
        expect(p.incomplete).toBe(true);
        expect(p.criteresHorsNote).toEqual([{ critereId: 'C2', nom: 'Nuances fictives', ponderation: 0, motif: 'ponderation-a-completer', niveau: 'D' }]);
        expect(p.criteresComptes.map((x) => x.critere.id)).toEqual(['C1']);
        const sans = portee(criteres, { C1: 'M' });
        expect(sans.incomplete).toBe(true);
        expect(sans.criteresHorsNote[0].niveau).toBe('');
    });

    it('G.b — LE STOCK : un critère ancien sans pondération, NON marqué, est calculé comme avant (hors de la note, en silence)', () => {
        [null, undefined, NaN, ''].forEach((absente) => {
            const criteres = [{ id: 'C1', nom: 'Idées fictives', ponderation: 24 }, { id: 'C2', nom: 'Nuances fictives', ponderation: absente }];
            const p = portee(criteres, { C1: 'M' });
            expect(p.incomplete).toBe(false);
            expect(p.criteresHorsNote).toEqual([]);
            expect(p.ponderationCouverte).toBe(24);
        });
    });

    it('G.c — un critère à 0, non marqué, comme avant : jamais hors note', () => {
        const p = portee([{ id: 'C1', nom: 'A', ponderation: 24 }, { id: 'C2', nom: 'B', ponderation: 0 }], { C1: 'M' });
        expect(p.incomplete).toBe(false);
        expect(p.criteresHorsNote).toEqual([]);
    });

    it('G.d — une évaluation qui n’a encore aucun niveau n’est pas incomplète : elle est vide (comme la garde existante)', () => {
        const p = portee([{ id: 'C1', nom: 'A', ponderation: 24 }, { id: 'C2', nom: 'B', ponderation: null, ponderationACompleter: true }], {});
        expect(p.commencee).toBe(false);
        expect(p.incomplete).toBe(false);
    });

    it('G.e — le refus d’enregistrer (et la synthèse) nomment le critère sans pondération', () => {
        const p = portee([{ id: 'C1', nom: 'Idées fictives', ponderation: 24 }, { id: 'C2', nom: 'Nuances fictives', ponderation: null, ponderationACompleter: true }], { C1: 'M' });
        expect(calcul.texteCriteresHorsNote(p)).toBe('sans pondération : Nuances fictives');
    });
});

/* ------------------------------------------------------------------ Grilles de critères (harnais de #516) */

function monterGrilles(grilles) {
    const store = { 'a2026_grillesTemplates': grilles };
    const globaux = {
        db: {
            get: async (k) => (k in store ? store[k] : null),
            getSync: (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
            set: async (k, v) => { store[k] = v; },
            setSync: (k, v) => { store[k] = v; },
            modifier: async (k, mutateur, defaut) => {
                const valeur = (k in store ? store[k] : defaut);
                const resultat = await mutateur(valeur);
                if (resultat === undefined) return undefined;
                store[k] = resultat;
                return resultat;
            }
        },
        cle: (k) => 'a2026_' + k,
        echapperHtml: (t) => String(t == null ? '' : t),
        alert: () => {}, confirm: () => true,
        notifications: { succes() {}, erreur() {}, info() {}, avertissement() {} },
        grilleTemplateActuelle: null,
        calculerEtAfficherTotalPonderation: () => {},
        document: {
            getElementById: () => null, querySelector: () => null,
            querySelectorAll: () => [], addEventListener() {},
            createElement: () => ({ style: {}, classList: { add() {}, remove() {} } })
        }
    };
    const win = chargerScript('js/temoin-enregistrement.js', { document: globaux.document });
    win.temoinEnregistrement = { enregistre() {}, fermer() {}, nonEnregistre() {} };
    chargerScript('js/grilles.js', globaux, win);
    return { win, store };
}

/** Un champ « Points » de Grilles de critères, tel que le dispatcher le passe au gestionnaire. */
const champ = (valeur, data) => ({
    value: valeur,
    dataset: Object.assign({ champ: 'ponderation' }, data),
    hasAttribute: (a) => a === 'data-parse-int',
    classList: { add() {}, remove() {}, contains: () => false }
});

describe('M — la marque posée et retirée', () => {
    it('M.a — la création de la dissection marque chaque critère sans pondération, et lui seul', () => {
        const doc = D.docDepuisPressePapiers({ html: enHtml(GRILLE_D7), texte: '' });
        const e = decouperD(D, { doc, liens: liensPar(D.morceaux(doc).ordre, etiquettes(GRILLE_D7)) });
        const g = A.construire(D.creation(D.comprendre(e.doc, e.liens), {}).modele, { id: (p) => p + Math.random(), maintenant: '2026-10-18T12:00:00.000Z' }).grille;
        expect(g.criteres.map((c) => !!c.ponderationACompleter)).toEqual([false, false, false, false, false, false, false, true, true]);
        expect(g.criteres.filter((c) => 'ponderationACompleter' in c).map((c) => c.ponderation)).toEqual([null, null]);
    });

    it('M.b — grille existante : vider « Points » écrit `null` et pose la marque ; un nombre la retire', async () => {
        const { win, store } = monterGrilles([{ id: 'G1', nom: 'Grille fictive', criteres: [{ id: 'C1', nom: 'A', ponderation: 24 }, { id: 'C2', nom: 'B', ponderation: 10 }] }]);
        await win.modifierCritereGrilleHandler(champ('', { grilleId: 'G1', critereIndex: '1' }));
        await new Promise((r) => setTimeout(r, 0));
        expect(store.a2026_grillesTemplates[0].criteres[1]).toMatchObject({ ponderation: null, ponderationACompleter: true });
        await win.modifierCritereGrilleHandler(champ('6', { grilleId: 'G1', critereIndex: '1' }));
        await new Promise((r) => setTimeout(r, 0));
        expect(store.a2026_grillesTemplates[0].criteres[1].ponderation).toBe(6);
        expect('ponderationACompleter' in store.a2026_grillesTemplates[0].criteres[1]).toBe(false);
        // L'autre critère n'est jamais marqué.
        expect('ponderationACompleter' in store.a2026_grillesTemplates[0].criteres[0]).toBe(false);
    });

    it('M.c — grille neuve (critères temporaires), par les deux gestionnaires : même règle', () => {
        const { win } = monterGrilles([]);
        win.tempCriteres = [{ id: 'T1', nom: 'A', ponderation: 0 }, { id: 'T2', nom: 'B', ponderation: 0 }];
        win.modifierCritereTempHandler(champ('', { critereIndex: '0' }));
        win.modifierPonderationCritereTempHandler(champ('', { critereIndex: '1' }));
        expect(win.tempCriteres.map((c) => [c.ponderation, c.ponderationACompleter])).toEqual([[null, true], [null, true]]);
        win.modifierCritereTempHandler(champ('12', { critereIndex: '0' }));
        win.modifierPonderationCritereTempHandler(champ('0', { critereIndex: '1' }));
        expect(win.tempCriteres.map((c) => [c.ponderation, 'ponderationACompleter' in c])).toEqual([[12, false], [0, false]]);
    });
});

describe('V — la marque voyage', () => {
    const marquee = () => ({ id: 'G1', nom: 'Grille fictive', criteres: [{ id: 'C1', nom: 'A', ponderation: 24 }, { id: 'C2', nom: 'B', ponderation: null, ponderationACompleter: true }] });

    it('V.a — l’import sélectif (`assainirObjet`, liste blanche) ramène `null` à 0 mais garde la marque : la garde s’applique encore', () => {
        const g = importExport.assainirObjet(marquee(), importExport.SCHEMAS_IMPORT.grille);
        expect(g.criteres[1]).toEqual({ id: 'C2', nom: 'B', ponderation: 0, ponderationACompleter: true });
        expect(portee(g.criteres, { C1: 'M', C2: 'M' }).incomplete).toBe(true);
    });

    it('V.a bis — l’import JSON de la Bibliothèque (`assainirImportJson`) garde `null` et la marque', () => {
        const g = importExport.assainirImportJson(marquee(), 'grille');
        expect(g.criteres[1]).toMatchObject({ ponderation: null, ponderationACompleter: true });
        expect(portee(g.criteres, { C1: 'M' }).incomplete).toBe(true);
    });

    it('V.b — un aller-retour JSON (codex, export complet, partage vers les grilles actives) garde la valeur et la marque', () => {
        const g = JSON.parse(JSON.stringify(marquee()));
        expect(g.criteres[1]).toEqual({ id: 'C2', nom: 'B', ponderation: null, ponderationACompleter: true });
        expect(portee(g.criteres, { C1: 'M' }).incomplete).toBe(true);
    });
});
