/**
 * « APPORTER MON MATÉRIEL », LA DISSECTION, LOT 2b — créer sa grille EN NIVEAUX depuis ses étiquettes.
 *
 * Consigne : plans de travail/CONSIGNE-LOT-2026-10-18-dissection-2b-creer-en-niveaux.md (« Ce qu'il faut »).
 *
 * Ce que ce banc verrouille :
 *   N — de la lecture au modèle en niveaux, puis aux objets construits par `materielAssistant.construire`
 *       (le seul constructeur) : (a) compté par niveaux, (n) seulement en niveaux (forme neuve, sans
 *       points), (c) en texte brut — l'échelle (niveaux, codes, plages contiguës, `valeurCalcul` saisies)
 *       et la grille (descripteurs aux codes, `echelleId`, pondérations, description).
 *   P — « des points » par défaut : (a) sans choix reste en points ; le choix « des points » l'emporte sur
 *       des valeurs saisies (break-test « le choix ignoré »).
 *   V — aucun champ prérempli : rien de proposé ni de calculé, même quand des points sont écrits par niveau ;
 *       une valeur saisie suit SON niveau (clés par nom).
 *   W — la pondération : écrite, tirée des points, ou parts égales si aucun critère n'en a.
 *   R — chaque refus : plage, note retenue, code, plus de 20 niveaux, pondération manquante, nom, morceau
 *       sans place ; et les avertissements de plages, tels quels, qui n'empêchent rien.
 *   S — un nom de niveau piégé arrive tel quel dans l'échelle, jamais interprété.
 *
 * Break-tests (faits le 18 oct.) : voir la demande de relecture du lot 2b.
 *
 * Grilles FICTIVES (tests/unit/_helpers/grilles-fictives-dissection.js), jamais le texte d'une grille réelle.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { JSDOM } from 'jsdom';
import { chargerScript } from './_helpers/charger-script.js';
import { GRILLE_A, GRILLE_N, TEXTE_C, enHtml, etiquettes, liensPar } from './_helpers/grilles-fictives-dissection.js';

const fenetreDom = new JSDOM('<!doctype html><html><body></body></html>').window;

let D;
let A;
beforeAll(() => {
    const w = chargerScript('js/materiel-lecture.js', { DOMParser: fenetreDom.DOMParser });
    chargerScript('js/materiel-assistant.js', {}, w);
    chargerScript('js/materiel-dissection-lecture.js', { DOMParser: fenetreDom.DOMParser }, w);
    D = w.materielDissectionLecture;
    A = w.materielAssistant;
});

let compteur = 0;
const ctx = () => ({ id: (pre) => pre + (++compteur), maintenant: '2026-10-18T12:00:00.000Z' });

function comprise(grille) {
    const doc = D.docDepuisPressePapiers({ html: enHtml(grille), texte: '' });
    return D.comprendre(doc, liensPar(D.morceaux(doc).ordre, etiquettes(grille)));
}
function compriseTexte(lignes) {
    const doc = D.docDepuisPressePapiers({ texte: lignes.map((x) => x[0]).join('\n') });
    return D.comprendre(doc, liensPar(D.morceaux(doc).ordre, lignes.map((x) => x[1])));
}

/** Les valeurs saisies, niveau par niveau, dans l'ordre lu : [[min, max, note], …] → { clé: {min, max, note} }. */
function valeurs(R, rangs) {
    const cles = D.clesNiveaux(R), v = {};
    rangs.forEach((r, i) => { v[cles[i]] = { min: r[0], max: r[1], note: r[2] }; });
    return v;
}
const enNiveaux = (R, rangs) => ({ compte: 'niveaux', valeurs: valeurs(R, rangs) });

/** La création possible en niveaux, puis les objets construits. */
function cree(R, saisie, nom) {
    const c = D.creation(R, {}, nom, saisie);
    expect(c.enNiveaux).toBe(true);
    expect(c.raisons).toEqual([]);
    return A.construire(c.modele, ctx());
}

const QUATRE = [['0', '59', '40'], ['60', '69', '65'], ['70', '84', '77'], ['85', '100', '92']];
const TROIS = [['0', '59', '50'], ['60', '79', '70'], ['80', '100', '90']];

describe('N — de la lecture à l’échelle et à la grille en niveaux', () => {
    it('N.a — (a) compté par niveaux : l’échelle saisie, la grille aux codes, les points restent sous le descripteur', () => {
        const R = comprise(GRILLE_A);
        expect(D.bilan(R).logique).toBe('deux');
        const o = cree(R, enNiveaux(R, QUATRE));
        expect(o).not.toHaveProperty('cartouche');   // ↻ #1152, lot 5 : plus de cartouche
        const e = o.echelle;
        expect(e.nom).toBe('Échelle – Carnet d’observation fictif');
        expect(e.niveaux.map((n) => [n.code, n.nom, n.min, n.max, n.valeurCalcul])).toEqual([
            ['E', 'Ébauché', 0, 59.99, 40], ['D', 'Développé', 60, 69.99, 65], ['S', 'Solide', 70, 84.99, 77], ['A', 'Accompli', 85, 100, 92]
        ]);
        const g = o.grille;
        expect(g.nom).toBe('Carnet d’observation fictif');
        expect(g.description).toBe('Noter des observations et en dégager une idée d’ensemble.');
        expect('type' in g).toBe(false);
        expect(g.criteres.map((c) => c.type)).toEqual(Array(6).fill('holistique'));
        expect(g.criteres.map((c) => c.ponderation)).toEqual([5, 10, 5, 10, 5, 15]);
        expect(g.criteres[0].nom).toBe('Première section : recueil – L’étudiant·e accomplit la tâche fictive 1');
        expect(g.criteres[0].sousCriteres.map((s) => s.nom)).toEqual(['Indice observable 1.1', 'Indice observable 1.2']);
        expect(g.criteres[0].descripteurs).toEqual({ echelleId: e.id, parNiveau: {
            E: 'Tâche 1 absente', D: 'Tâche 1, palier 2\n3', S: 'Tâche 1, palier 3\n4', A: 'Tâche 1, palier 4\n5'
        } });
        expect(g.criteres[5].descripteurs.parNiveau.S).toBe('Tâche 6, palier 3\n11-12-13');
    });

    it('N.b — (n) seulement en niveaux, sans points : aucun choix demandé, pondérations écrites', () => {
        const R = comprise(GRILLE_N);
        expect(D.bilan(R).logique).toBe('niveaux');
        expect(D.enNiveaux(R)).toBe(true);
        const o = cree(R, { valeurs: valeurs(R, TROIS) });
        expect(o.echelle.niveaux.map((n) => [n.code, n.nom, n.min, n.max, n.valeurCalcul])).toEqual([
            ['A', 'À reprendre', 0, 59.99, 50], ['E', 'En voie', 60, 79.99, 70], ['AT', 'Atteint', 80, 100, 90]
        ]);
        const g = o.grille;
        expect(g.nom).toBe('Fiche d’appréciation fictive');
        expect(g.criteres.map((c) => [c.nom, c.ponderation])).toEqual([
            ['Le travail fictif répond à l’attente 1', 40], ['Le travail fictif répond à l’attente 2', 35], ['Le travail fictif répond à l’attente 3', 25]
        ]);
        expect(g.criteres[1].descripteurs).toEqual({ echelleId: o.echelle.id, parNiveau: {
            A: 'Attente 2 : à reprendre', E: 'Attente 2 : en voie', AT: 'Attente 2 : atteint'
        } });
        expect('description' in g).toBe(false);
    });

    it('N.c — (c) un texte brut : niveaux par l’ordre, mêmes codes, la ligne des points', () => {
        const R = compriseTexte(TEXTE_C);
        const o = cree(R, enNiveaux(R, TROIS));
        expect(o.echelle.niveaux.map((n) => [n.code, n.nom])).toEqual([['I', 'Insuffisant'], ['R', 'Réussi'], ['E', 'Excellent']]);
        expect(o.grille.criteres.map((c) => [c.nom, c.ponderation])).toEqual([['Clarté du propos', 4], ['Tenue de la langue', 2]]);
        expect(o.grille.criteres[0].descripteurs.parNiveau).toEqual({ I: 'Propos confus\n0-1', R: 'Propos suivi\n2-3', E: 'Propos limpide\n4' });
    });

    it('N.d — (c) sans ses points : en niveaux d’emblée, pondérations en parts égales', () => {
        const R = compriseTexte(TEXTE_C.filter((x) => x[1] !== 'points'));
        expect(D.bilan(R).logique).toBe('niveaux');
        const o = cree(R, { valeurs: valeurs(R, TROIS) });
        expect(o.grille.criteres.map((c) => c.ponderation)).toEqual([50, 50]);
        expect(o.grille.criteres[1].descripteurs.parNiveau).toEqual({ I: 'Erreurs nombreuses', R: 'Quelques erreurs', E: 'Langue soignée' });
    });

    it('N.e — la virgule décimale et le « % » sont acceptés, comme dans l’assistant', () => {
        const R = compriseTexte(TEXTE_C);
        const o = cree(R, enNiveaux(R, [['0', '59,5', '45,5 %'], ['59,51', '79,9', '70'], ['80', '100 %', '90']]));
        expect(o.echelle.niveaux.map((n) => [n.min, n.max, n.valeurCalcul])).toEqual([[0, 59.5, 45.5], [59.51, 79.9, 70], [80, 100, 90]]);
    });
});

describe('P — « des points » par défaut', () => {
    it('P.a — (a) sans choix : en points, comme au lot 2a (ni échelle, ni plage)', () => {
        const R = comprise(GRILLE_A);
        for (const saisie of [undefined, {}, { compte: 'points' }]) {
            const c = D.creation(R, {}, undefined, saisie);
            expect(c.enNiveaux).toBe(false);
            expect(c.raisons).toEqual([]);
            const o = A.construire(c.modele, ctx());
            expect(o.echelle).toBeNull();
            expect(o.grille.type).toBe('analytique');
        }
    });

    it('P.b — « des points » coché l’emporte sur des valeurs saisies (break-test : le choix ignoré)', () => {
        const R = comprise(GRILLE_A);
        const c = D.creation(R, {}, undefined, { compte: 'points', valeurs: valeurs(R, QUATRE) });
        expect(c.enNiveaux).toBe(false);
        expect(c.modele.enPoints).toBe(true);
        expect(A.construire(c.modele, ctx()).echelle).toBeNull();
    });
});

describe('V — aucun champ prérempli, et chaque saisie suit son niveau', () => {
    it('V.a — rien de proposé ni de calculé, même avec des points écrits par niveau', () => {
        const R = comprise(GRILLE_A);
        const m = D.modele(R, undefined, { compte: 'niveaux' });
        expect(m.niveaux.map((n) => [n.min.valeur, n.max.valeur, n.note.valeur])).toEqual(Array(4).fill(['', '', '']));
        expect(m.niveaux.every((n) => n.min.etat === 'remplir' && n.max.etat === 'remplir' && n.note.etat === 'remplir')).toBe(true);
        const m2 = D.modele(comprise(GRILLE_N), undefined, {});
        expect(m2.niveaux.map((n) => [n.min.valeur, n.max.valeur, n.note.valeur])).toEqual(Array(3).fill(['', '', '']));
    });

    it('V.b — un niveau étiqueté de plus, avant les autres : chaque saisie reste à son niveau', () => {
        const lignes = TEXTE_C.filter((x) => x[1] !== 'points');
        const R1 = compriseTexte(lignes);
        const v = valeurs(R1, TROIS);
        const R2 = compriseTexte([lignes[0], ['Absent', 'niveau'], ...lignes.slice(1)]);
        expect(R2.niveaux).toEqual(['Absent', 'Insuffisant', 'Réussi', 'Excellent']);
        const m = D.modele(R2, undefined, { valeurs: v });
        expect(m.niveaux.map((n) => [n.titre.valeur, n.min.valeur, n.note.valeur])).toEqual([
            ['Absent', '', ''], ['Insuffisant', '0', '50'], ['Réussi', '60', '70'], ['Excellent', '80', '90']
        ]);
    });

    it('V.c — deux niveaux du même nom ont chacun leur clé', () => {
        const R = { niveaux: ['Partiel', 'Partiel', 'Complet'] };
        const cles = D.clesNiveaux(R);
        expect(new Set(cles).size).toBe(3);
    });
});

describe('W — la pondération en niveaux', () => {
    it('W.a — la pondération écrite l’emporte sur celle tirée des points', () => {
        const R = compriseTexte([TEXTE_C[0], ...TEXTE_C.slice(1, 5), ['/ 30', 'ponderation'], ...TEXTE_C.slice(5)]);
        const o = cree(R, enNiveaux(R, TROIS));
        expect(o.grille.criteres.map((c) => c.ponderation)).toEqual([30, 2]);
    });

    it('W.b — un critère avec, un critère sans : la pondération d’un critère, nommé (lot 5), à compléter sans bloquer (lot 9)', () => {
        const lignes = TEXTE_C.filter((x) => x[1] !== 'points');
        const R = compriseTexte([...lignes.slice(0, 5), ['/ 30', 'ponderation'], ...lignes.slice(5)]);
        const c = D.creation(R, {}, undefined, enNiveaux(R, TROIS));
        expect(c.raisons).toEqual([]);
        expect(c.aCompleter).toEqual(['la pondération d’un critère (« Tenue de la langue »)']);
    });
});

describe('R — quand « Créer ma grille » est refusé en niveaux, et pourquoi', () => {
    it('R.a — rien de saisi : la plage et la note retenue de chaque niveau', () => {
        const R = comprise(GRILLE_N);
        expect(D.creation(R, {}, undefined, {}).raisons).toEqual(['la plage de notes de 3 niveaux', 'la note retenue de 3 niveaux']);
    });

    it('R.b — une plage à l’envers, une note retenue absente, une valeur qui n’est pas un nombre', () => {
        const R = comprise(GRILLE_N);
        expect(D.creation(R, {}, undefined, { valeurs: valeurs(R, [['59', '0', '50'], ['60', '79', ''], ['80', '100', 'neuf']]) }).raisons)
            .toEqual(['la plage de notes d’un niveau', 'la note retenue de 2 niveaux']);
    });

    it('R.c — un code fautif (cinq niveaux du même nom : « ABCD2 ») ; plus de 20 niveaux', () => {
        const cinq = compriseTexte([['Grille fictive', 'titre'], ...Array(5).fill(['Abcd', 'niveau']), ['Critère fictif', 'critere'], ['/ 10', 'ponderation']]);
        expect(cinq.niveaux).toEqual(['Abcd']);   // un texte brut ne garde qu'une fois un même nom
        const tableau = [[{ l: [['Grille fictive', 'titre']] }, ...Array(5).fill(null).map(() => ({ l: [['Abcd', 'niveau']] }))],
            [{ l: [['Critère fictif', 'critere'], ['/ 10', 'ponderation']] }, ...Array(5).fill(null).map(() => ({ l: [] }))]];
        const R5 = comprise(tableau);
        const v5 = Array(5).fill(['0', '100', '50']).map((x, i) => [String(i * 20), String(i * 20 + 19), String(i * 20 + 10)]);
        expect(D.creation(R5, {}, undefined, { valeurs: valeurs(R5, v5) }).raisons).toEqual(['un code de 1 à 4 caractères, sans « _ », pour un niveau']);

        const lettres = 'ABCDEFGHIJKLMNOPQRSTU'.split('');
        const R21 = compriseTexte([['Grille fictive', 'titre'], ...lettres.map((l) => [l, 'niveau']), ['Critère fictif', 'critere'], ['/ 10', 'ponderation']]);
        const v21 = lettres.map((l, i) => [String(i * 4), String(i * 4 + 3), String(i * 4 + 1)]);
        expect(D.creation(R21, {}, undefined, { valeurs: valeurs(R21, v21) }).raisons).toEqual(['au plus 20 niveaux (ta grille en a 21)']);
    });

    it('R.d — les refus du lot 2a valent aussi en niveaux : le nom, un morceau sans place', () => {
        const R = comprise(GRILLE_N);
        expect(D.creation(R, {}, '  ', { valeurs: valeurs(R, TROIS) }).raisons).toEqual(['un nom pour ta grille']);
        const lignes = TEXTE_C.filter((x) => x[1] !== 'points');
        const Rp = compriseTexte([...lignes, ['Langue exemplaire', 'descripteur']]);
        expect(D.creation(Rp, {}, undefined, { valeurs: valeurs(Rp, TROIS) }).raisons).toEqual(['une place pour le morceau étiqueté listé plus bas']);
    });

    it('R.e — les avertissements de plages et de note retenue, tels quels, n’empêchent rien', () => {
        const R = comprise(GRILLE_N);
        const chevauche = D.creation(R, {}, undefined, { valeurs: valeurs(R, [['0', '60', '50'], ['60', '79', '70'], ['80', '100', '90']]) });
        expect(chevauche.raisons).toEqual([]);
        expect(chevauche.avertissements).toEqual(['Les plages « À reprendre » et « En voie » se chevauchent (60 et 60\u00A0%) : une même note tomberait dans deux niveaux. Il pourrait être utile de les ajuster.']);
        const trou = D.creation(R, {}, undefined, { valeurs: valeurs(R, [['0', '50', '40'], ['60', '79', '95'], ['80', '100', '90']]) });
        expect(trou.raisons).toEqual([]);
        expect(trou.avertissements).toEqual([
            'Il y a un trou entre « À reprendre » (jusqu’à 50\u00A0%) et « En voie » (dès 60\u00A0%) : certaines notes ne tomberaient dans aucun niveau. Il pourrait être utile de les ajuster.',
            'La note retenue de « En voie » (95\u00A0%) est hors de sa plage : il pourrait être utile de la vérifier.'
        ]);
        expect(D.creation(R, {}, undefined, { valeurs: valeurs(R, TROIS) }).avertissements).toEqual([]);
        // En points : aucun avertissement de plage (il n'y en a pas).
        expect(D.creation(comprise(GRILLE_A)).avertissements).toEqual([]);
    });
});

describe('S — un nom de niveau piégé arrive tel quel dans l’échelle', () => {
    it('S.a — du HTML dans un nom de niveau reste du texte', () => {
        const R = compriseTexte([['Grille fictive', 'titre'], ['<img src=x onerror=alert(1)>', 'niveau'], ['Atteint', 'niveau'],
            ['Critère fictif', 'critere'], ['Rien de fait', 'descripteur'], ['Tout est fait', 'descripteur']]);
        const o = cree(R, { valeurs: valeurs(R, [['0', '59', '40'], ['60', '100', '80']]) });
        expect(o.echelle.niveaux.map((n) => [n.code, n.nom])).toEqual([['I', '<img src=x onerror=alert(1)>'], ['A', 'Atteint']]);
        expect(o.grille.criteres[0].descripteurs.parNiveau).toEqual({ I: 'Rien de fait', A: 'Tout est fait' });
    });
});
