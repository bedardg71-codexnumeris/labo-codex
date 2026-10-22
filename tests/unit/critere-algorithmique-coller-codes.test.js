/**
 * ÉTAPE 5 DU CRITÈRE ALGORITHMIQUE — COLLER SA LISTE DE CODES (22 oct. 2026).
 *
 * Consigne : plans de travail/CONSIGNE-LOT-2026-10-22-critere-algorithmique-coller-codes.md (option A, tranchée
 * par Cowork : la liste va dans un critère algorithmique EXISTANT qui n'a pas encore de codes ; rien n'est
 * remplacé ni effacé ; le commentaire passe tel quel).
 *
 * Ce que ce banc verrouille, sur deux disciplines fictives (une rédaction, des calculs de chimie) :
 *   L — LA LECTURE : une rangée par code, son nom, son poids (absent : 1), son commentaire (plusieurs morceaux
 *       gardés, un par ligne) ; un nom sans code n'a pas de place.
 *   R — LES REFUS, qui nomment le code : une liste mêlée à une grille, un code illisible ou en double, un
 *       poids nul, négatif ou au-delà de 100, plus de 30 codes.
 *   D — LES CRITÈRES QUI PEUVENT LA RECEVOIR : le premier critère algorithmique d'une grille, marqué (né depuis
 *       le 21 oct.), sans aucun sous-critère ; les autres, avec leur motif.
 *   E — L'ÉCRITURE : les sous-critères posés (la forme de `ajouterSousCritere`), le reste de la base identique
 *       à l'octet près ; un second ajout refusé (rien ne se remplace) ; un critère disparu ; un trimestre clos.
 *       Le commentaire, piégé, arrive tel quel en base.
 *
 * Break-tests (faits le 22 oct.) : voir la demande de relecture du lot.
 *
 * Listes et grilles FICTIVES.
 */
import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { JSDOM } from 'jsdom';
import { chargerScript } from './_helpers/charger-script.js';
import { LISTE_CODES_REDACTION, LISTE_CODES_CHIMIE, GRILLE_A, enHtml, etiquettes, liensPar } from './_helpers/grilles-fictives-dissection.js';

const fenetreDom = new JSDOM('<!doctype html><html><body></body></html>').window;
const MARQUE = 'codesSousCriteresSeulement';
const K = 'a2032_grillesTemplates';

let D, w, store, compteur;
beforeAll(() => {
    w = chargerScript('js/materiel-lecture.js', { DOMParser: fenetreDom.DOMParser });
    chargerScript('js/materiel-assistant.js', {}, w);
    chargerScript('js/materiel-dissection-lecture.js', { DOMParser: fenetreDom.DOMParser }, w);
    D = w.materielDissectionLecture;
});

function comprise(liste) {
    const doc = D.docDepuisPressePapiers({ html: enHtml(liste), texte: '' });
    return D.comprendre(doc, liensPar(D.morceaux(doc).ordre, etiquettes(liste)));
}
function compriseTexte(lignes) {
    const doc = D.docDepuisPressePapiers({ texte: lignes.map((x) => x[0]).join('\n') });
    return D.comprendre(doc, liensPar(D.morceaux(doc).ordre, lignes.map((x) => x[1])));
}

describe('étape 5 · L — la lecture d’une liste de codes', () => {
    it('L.a une rédaction : code, nom, poids (absent : 1), commentaire tel quel, ses morceaux un par ligne', () => {
        const R = comprise(LISTE_CODES_REDACTION);
        expect(D.estListeDeCodes(R)).toBe(true);
        const c = D.codesCompris(R);
        expect(c.raisons).toEqual([]);
        expect(c.codes).toEqual([
            { code: 'S', nom: 'Syntaxe fictive', poids: 1, commentaire: 'Relis la phrase fictive à voix haute.' },
            { code: 'A', nom: 'Accord fictif', poids: 0.5, commentaire: 'Repère le nom fictif, puis son déterminant.\nVérifie ensuite l’adjectif fictif.' },
            { code: 'P', nom: 'Ponctuation fictive', poids: 1, commentaire: 'Une virgule fictive manque.' }
        ]);
    });

    it('L.b des calculs de chimie : la même lecture, aucun mot de rédaction', () => {
        const c = D.codesCompris(comprise(LISTE_CODES_CHIMIE));
        expect(c.raisons).toEqual([]);
        expect(c.codes.map((k) => [k.code, k.nom, k.poids])).toEqual([['U1', 'Unité manquante', 2], ['CS', 'Chiffres significatifs', 1]]);
    });

    it('L.c un texte brut : l’ordre fait foi ; une « Suite » prolonge un commentaire ; un nom avant tout code n’a pas de place', () => {
        const R = compriseTexte([
            ['Nom orphelin', 'nomcode'],
            ['7', 'code'], ['Code fictif', 'nomcode'], ['1,5', 'poids'], ['Un commentaire fictif', 'commentaire'], ['qui continue.', 'suite']
        ]);
        expect(R.sansPlace).toEqual([{ t: 'Nom orphelin', type: 'nomcode', raison: 'aucun code avant lui' }]);
        expect(D.codesCompris(R).codes).toEqual([{ code: '7', nom: 'Code fictif', poids: 1.5, commentaire: 'Un commentaire fictif qui continue.' }]);
    });

    it('L.d une grille sans code n’est pas une liste de codes', () => {
        expect(D.estListeDeCodes(comprise(GRILLE_A))).toBe(false);
    });
});

describe('étape 5 · R — les refus nomment le code', () => {
    const avec = (lignes) => D.codesCompris(compriseTexte(lignes)).raisons;

    it('R.a une liste mêlée à une grille', () => {
        expect(avec([['Critère fictif', 'critere'], ['S', 'code']])[0]).toMatch(/^une liste de codes seule/);
    });

    it('R.b un code illisible, un code en double, un poids nul ou négatif, un poids au-delà de 100', () => {
        expect(avec([['Code 1', 'code'], ['S', 'code'], ['S', 'code'], ['Z', 'code'], ['0', 'poids'], ['N', 'code'], ['-2', 'poids'], ['L', 'code'], ['150', 'poids']])).toEqual([
            'des codes faits de lettres, de chiffres, de « - » ou de « _ », 20 caractères au plus (« Code 1 »)',
            'des codes différents (« S » en double)',
            'un poids plus grand que 0 (« Z » et « N »)',
            'un poids de 100 au plus (« L »)'
        ]);
    });

    it('R.c plus de 30 codes ; aucun code', () => {
        const trop = Array.from({ length: 31 }, (_, i) => ['C' + i, 'code']);
        expect(avec(trop)).toEqual(['au plus 30 codes (ta liste en a 31)']);
        expect(avec([['Un commentaire fictif', 'commentaire']])).toContain('au moins un code : surligne chaque code avec l’étiquette « Code »');
    });
});

const regles = { critereQuiRecoit: (g) => (g.criteres || []).find((c) => c && c.type === 'algorithmique') || null, marque: MARQUE };
function grillesBanc() {
    return [
        { id: 'G1', nom: 'Grille fictive de rédaction', criteres: [
            { id: 'C1', nom: 'Contenu fictif', type: 'holistique', ponderation: 60 },
            { id: 'C2', nom: 'Langue fictive', type: 'algorithmique', ponderation: 40, formule: 'f', [MARQUE]: true },
            { id: 'C3', nom: 'Second algorithmique', type: 'algorithmique', ponderation: 0, [MARQUE]: true }
        ] },
        { id: 'G2', nom: 'Grille fictive de chimie', criteres: [
            { id: 'C4', nom: 'Calculs fictifs', type: 'algorithmique', ponderation: 20, [MARQUE]: true, sousCriteres: [{ id: 'SC_1', code: 'X', nom: 'Déjà là', ponderation: 1, retroaction: '' }] }
        ] },
        { id: 'G3', nom: 'Grille d’avant le 21 oct.', criteres: [{ id: 'C5', nom: 'Langue d’avant', type: 'algorithmique', ponderation: 30 }] }
    ];
}

describe('étape 5 · D — les critères qui peuvent recevoir la liste', () => {
    it('D.a le premier critère algorithmique marqué et sans sous-critère ; les autres avec leur motif ; les autres types ignorés', () => {
        expect(D.destinationsCodes(grillesBanc(), regles).map((d) => [d.critereId, d.motif])).toEqual([
            ['C2', null],
            ['C3', D.MOTIFS_CODES.pasLePremier],
            ['C4', D.MOTIFS_CODES.dejaDesSousCriteres],
            ['C5', D.MOTIFS_CODES.repli]
        ]);
    });

    it('D.b un sous-critère de pondération 0 (pas un code) suffit à refuser : rien n’est remplacé', () => {
        const g = grillesBanc();
        g[0].criteres[1].sousCriteres = [{ id: 'SC_0', code: '0', nom: 'Aucune erreur', ponderation: 0, retroaction: '' }];
        expect(D.destinationsCodes(g, regles)[0].motif).toBe(D.MOTIFS_CODES.dejaDesSousCriteres);
    });
});

describe('étape 5 · E — l’écriture', () => {
    let C;
    beforeEach(() => {
        compteur = 0;
        store = new Map([[K, grillesBanc()]]);
        const db = {
            getSync: (k, d) => (store.has(k) ? JSON.parse(JSON.stringify(store.get(k))) : d),
            modifier: async (k, f, d) => { const r = await f(store.has(k) ? JSON.parse(JSON.stringify(store.get(k))) : d); if (r !== undefined) store.set(k, r); return r; }
        };
        Object.assign(w, {
            db, cle: (k) => 'a2032_' + k, estTrimestreArchive: () => false,
            genererIdUnique: (p) => p + 'banc' + (++compteur),
            enoncesAlgo: { critereAlgorithmique: regles.critereQuiRecoit },
            codesAnnotation: { MARQUE }
        });
        chargerScript('js/materiel-creation.js', { db }, w);
        C = w.materielCreation;
    });

    it('E.a les codes deviennent les sous-critères du critère, tels quels ; rien d’autre ne change', async () => {
        const avant = JSON.parse(JSON.stringify(store.get(K)));
        const piege = '<img src=x onerror="window.__piege=1"> Relis « ta » phrase.';
        const codes = [{ code: 'S', nom: 'Syntaxe <b>fictive</b>', poids: 1, commentaire: piege }, { code: 'A', nom: 'Accord fictif', poids: 0.5, commentaire: '' }];
        const r = await C.ajouterCodes('G1', 'C2', codes);
        expect(r).toEqual({ resume: { grille: 'Grille fictive de rédaction', critere: 'Langue fictive', nombre: 2 } });
        const apres = store.get(K);
        expect(apres[0].criteres[1].sousCriteres).toEqual([
            { id: 'SC_banc1', code: 'S', nom: 'Syntaxe <b>fictive</b>', ponderation: 1, retroaction: piege },
            { id: 'SC_banc2', code: 'A', nom: 'Accord fictif', ponderation: 0.5, retroaction: '' }
        ]);
        // Le reste, à l'octet près : la formule, la pondération, la marque, les autres critères et grilles.
        delete apres[0].criteres[1].sousCriteres;
        expect(JSON.stringify(apres)).toBe(JSON.stringify(avant));
    });

    it('E.b collée deux fois : la seconde est refusée, rien n’est remplacé', async () => {
        await C.ajouterCodes('G1', 'C2', [{ code: 'S', nom: '', poids: 1, commentaire: '' }]);
        const une = JSON.stringify(store.get(K));
        const r = await C.ajouterCodes('G1', 'C2', [{ code: 'T', nom: '', poids: 1, commentaire: '' }]);
        expect(r).toEqual({ erreur: C.MESSAGES_CODES.refuse(D.MOTIFS_CODES.dejaDesSousCriteres) });
        expect(JSON.stringify(store.get(K))).toBe(une);
    });

    it('E.c un critère refusé, un critère disparu, un trimestre clos : rien n’est écrit', async () => {
        const avant = JSON.stringify(store.get(K));
        expect((await C.ajouterCodes('G3', 'C5', [{ code: 'S', nom: '', poids: 1, commentaire: '' }])).erreur).toBe(C.MESSAGES_CODES.refuse(D.MOTIFS_CODES.repli));
        expect((await C.ajouterCodes('G1', 'C9', [{ code: 'S', nom: '', poids: 1, commentaire: '' }])).erreur).toBe(C.MESSAGES_CODES.introuvable);
        w.estTrimestreArchive = () => true;
        expect((await C.ajouterCodes('G1', 'C2', [{ code: 'S', nom: '', poids: 1, commentaire: '' }])).erreur).toBe(C.MESSAGES.clos);
        expect(JSON.stringify(store.get(K))).toBe(avant);
    });

    it('E.d de la lecture à la base : la liste de chimie, ses codes posables par `codes-annotation`', async () => {
        const g = grillesBanc();
        g[1].criteres[0].sousCriteres = [];   // un critère de chimie qui attend ses codes
        store.set(K, g);
        expect((await C.ajouterCodes('G2', 'C4', D.codesCompris(comprise(LISTE_CODES_CHIMIE)).codes)).resume.nombre).toBe(2);
        const ca = chargerScript('js/codes-annotation.js', { db: { getSync: () => null } }, { enoncesAlgo: { critereAlgorithmique: regles.critereQuiRecoit } });
        const liste = ca.codesAnnotation.listeCodes(store.get(K)[1]);
        expect(liste.map((k) => [k.id, k.nom, k.poids, k.retroaction])).toEqual([
            ['errfr_U1', 'Unité manquante', 2, 'Écris l’unité de chaque résultat fictif.'],
            ['errfr_CS', 'Chiffres significatifs', 1, 'Arrondis au nombre de chiffres significatifs des données fictives.']
        ]);
    });
});
