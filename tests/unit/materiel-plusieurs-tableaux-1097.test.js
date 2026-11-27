/**
 * #1097 (27 nov. 2026, décision de Grégoire) — UNE GRILLE COLLÉE EN PLUSIEURS TABLEAUX.
 *
 * Avant : `lireHtml` (js/materiel-lecture.js) ne lisait que la 1re <table> d'un collage ; le texte des
 * tableaux suivants arrivait en un bloc, après tout le reste, et leurs critères n'existaient pas pour la
 * dissection (Conception › Mon matériel).
 * Désormais : tous les tableaux sont lus à la suite, dans l'ordre du collage ; le texte entre deux
 * tableaux garde sa place, en une rangée pleine largeur, étiquetable comme le reste.
 *
 *   M — plusieurs tableaux : les critères des trois, dans l'ordre ; le texte d'entre deux à sa place ;
 *       une case fusionnée ne déborde pas sur le tableau suivant.
 *   U — un seul tableau : exactement ce que la lecture rendait avant ce lot.
 *
 * Grilles FICTIVES, de la forme d'une grille en encadrés (une partie par tableau).
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { JSDOM } from 'jsdom';
import { chargerScript } from './_helpers/charger-script.js';

const fenetreDom = new JSDOM('<!doctype html><html><body></body></html>').window;

let L;
let D;
beforeAll(() => {
    const w = chargerScript('js/materiel-lecture.js', { DOMParser: fenetreDom.DOMParser });
    chargerScript('js/materiel-dissection-lecture.js', { DOMParser: fenetreDom.DOMParser }, w);
    L = w.materielLecture;
    D = w.materielDissectionLecture;
});

const ligne = (cases) => '<tr>' + cases.map((t) => '<td><p class=MsoNormal>' + t + '</p></td>').join('') + '</tr>';
const TROIS_TABLEAUX =
    '<div class=WordSection1>' +
    '<p class=MsoNormal>Grille fictive en encadrés</p>' +
    '<table class=MsoTableGrid>' + ligne(['Critères', 'Excellent', 'Faible']) + ligne(['Thèse fictive', 'Claire et nuancée.', 'Absente.']) + '</table>' +
    '<p class=MsoNormal>Partie 2 : la langue</p>' +
    '<table class=MsoTableGrid>' + ligne(['Critères', 'Excellent', 'Faible']) + ligne(['Syntaxe fictive', 'Sans faute.', 'Fautive.'])
        + ligne(['Lexique fictif', 'Précis.', 'Vague.']) + '</table>' +
    '<p class=MsoNormal>Relis la consigne avant de remettre.</p>' +
    '<table class=MsoTableGrid>' + ligne(['Présentation fictive', 'Soignée.', 'Négligée.']) + '</table>' +
    '<p class=MsoNormal>Total sur 100</p>' +
    '</div>';

const ETIQUETTES = {
    'Grille fictive en encadrés': 'titre',
    'Partie 2 : la langue': 'section',
    Excellent: 'niveau', Faible: 'niveau',
    'Thèse fictive': 'critere', 'Syntaxe fictive': 'critere', 'Lexique fictif': 'critere', 'Présentation fictive': 'critere',
    'Claire et nuancée.': 'descripteur', 'Absente.': 'descripteur', 'Sans faute.': 'descripteur', 'Fautive.': 'descripteur',
    'Précis.': 'descripteur', 'Vague.': 'descripteur', 'Soignée.': 'descripteur', 'Négligée.': 'descripteur'
};

/** Colle, puis étiquette chaque morceau d'après son texte : la grille comprise. */
function disseque(html) {
    const doc = D.docDepuisPressePapiers({ html, texte: '' });
    const M = D.morceaux(doc);
    const liens = {};
    M.ordre.forEach((id) => { if (ETIQUETTES[M.texte[id]]) liens[id] = ETIQUETTES[M.texte[id]]; });
    return { doc, M, R: D.comprendre(doc, liens) };
}

describe('#1097 · M — plusieurs tableaux dans un collage', () => {
    it('M.a LE CAS QUI PORTE LE SENS : les critères des trois tableaux, dans l\'ordre du collage', () => {
        const { R } = disseque(TROIS_TABLEAUX);
        expect(R.criteres.map((c) => c.nom)).toEqual(['Thèse fictive', 'Syntaxe fictive', 'Lexique fictif', 'Présentation fictive']);
        expect(R.niveaux).toEqual(['Excellent', 'Faible']);
        // Chaque descripteur sous le niveau de sa colonne, dans le dernier tableau aussi.
        expect(R.criteres[3].niv[0].desc).toEqual(['Soignée.']);
        expect(R.criteres[3].niv[1].desc).toEqual(['Négligée.']);
        expect(R.criteres[1].niv[0].desc).toEqual(['Sans faute.']);
    });

    it('M.b le texte entre deux tableaux garde sa place, et un titre de partie ouvre la section', () => {
        const { M, R } = disseque(TROIS_TABLEAUX);
        expect(M.ordre.map((id) => M.texte[id])).toEqual([
            'Grille fictive en encadrés',
            'Critères', 'Excellent', 'Faible', 'Thèse fictive', 'Claire et nuancée.', 'Absente.',
            'Partie 2 : la langue',
            'Critères', 'Excellent', 'Faible', 'Syntaxe fictive', 'Sans faute.', 'Fautive.', 'Lexique fictif', 'Précis.', 'Vague.',
            'Relis la consigne avant de remettre.',
            'Présentation fictive', 'Soignée.', 'Négligée.',
            'Total sur 100'
        ]);
        // Avant ce lot, le même texte venait dans le même ordre, mais chaque paragraphe des tableaux 2 et 3 en
        // rangée pleine largeur : ses colonnes perdues, ses niveaux aussi.
        const place = (t) => M.pos[M.ordre.filter((id) => M.texte[id] === t).pop()];
        expect(place('Négligée.')).toMatchObject({ c: 2, cs: 1 });
        expect(place('Syntaxe fictive')).toMatchObject({ c: 0, cs: 1 });
        expect(R.criteres[0].section).toBeNull();
        expect(R.criteres[1].section).toEqual({ nom: 'Partie 2 : la langue' });
        expect(R.criteres[2].section).toBe(R.criteres[1].section);
    });

    it('M.c le texte d\'entre deux est une rangée pleine largeur, à son rang', () => {
        const lu = L.lireHtml(TROIS_TABLEAUX);
        expect(lu.rangees).toHaveLength(6);
        expect(lu.avant).toEqual(['Grille fictive en encadrés']);
        expect(lu.entre).toEqual({ 2: ['Partie 2 : la langue'], 5: ['Relis la consigne avant de remettre.'] });
        expect(lu.apres).toEqual(['Total sur 100']);
        const doc = D.docDepuisPressePapiers({ html: TROIS_TABLEAUX, texte: '' });
        const rangee = doc.rows.find((row) => row.length === 1 && row[0].lines[0].t === 'Partie 2 : la langue');
        expect(rangee[0].cs).toBe(3);
    });

    it('M.d une case fusionnée au bas d\'un tableau ne déborde pas sur le suivant', () => {
        const html = '<table><tr><td>Critère A fictif</td><td>Haut</td></tr><tr><td rowspan="4">Fusionnée</td><td>Bas</td></tr></table>'
            + '<table><tr><td>Critère B fictif</td><td>Seul</td></tr><tr><td>Critère C fictif</td><td>Autre</td></tr></table>';
        expect(L.lireHtml(html).rangees[1][0].rspan).toBe(1);
        const M = D.morceaux(D.docDepuisPressePapiers({ html, texte: '' }));
        const place = (t) => M.pos[M.ordre.find((id) => M.texte[id] === t)];
        expect(place('Critère B fictif')).toMatchObject({ r: 2, c: 0 });
        expect(place('Seul')).toMatchObject({ r: 2, c: 1 });
    });

    it('M.e un tableau pris dans la case d\'un autre reste le texte de cette case', () => {
        const lu = L.lireHtml('<table><tr><td>C</td><td>A</td></tr><tr><td>X</td><td><table><tr><td>dedans</td></tr></table></td></tr></table>');
        expect(lu.entre).toBeUndefined();
        expect(lu.rangees[1][1].t).toBe('dedans');
    });
});

describe('#1097 · U — un seul tableau : rien ne change', () => {
    // Relevé sur le code d'avant ce lot (27 nov. 2026), puis gardé tel quel : le même collage doit rendre
    // la même lecture, au champ près (aucun `entre`, la légende en tête de `avant`, les fusions telles quelles).
    const UN_TABLEAU =
        '<p>Avant fictif</p><table><caption>Légende fictive</caption>' +
        '<tr><td>Critères</td><td colspan="2">Niveaux</td></tr>' +
        '<tr><td rowspan="3">Thèse fictive</td><td>Bien<br>et nuancé</td><td>Faible</td></tr>' +
        '<tr><td>x</td><td>y</td></tr></table><p>Après fictif</p>';

    it('U.a la lecture du HTML est celle d\'avant, champ pour champ', () => {
        expect(L.lireHtml(UN_TABLEAU)).toEqual({
            rangees: [
                [{ t: 'Critères', span: 1, rspan: 1 }, { t: 'Niveaux', span: 2, rspan: 1 }],
                [{ t: 'Thèse fictive', span: 1, rspan: 3 }, { t: 'Bien\net nuancé', span: 1, rspan: 1 }, { t: 'Faible', span: 1, rspan: 1 }],
                [{ t: 'x', span: 1, rspan: 1 }, { t: 'y', span: 1, rspan: 1 }]
            ],
            avant: ['Légende fictive', 'Avant fictif'],
            apres: ['Après fictif']
        });
    });

    it('U.b le document disséqué est celui d\'avant', () => {
        expect(D.docDepuisPressePapiers({ html: UN_TABLEAU, texte: '' })).toEqual({ mode: 'table', rows: [
            [{ cs: 3, rs: 1, lines: [{ id: 'm1', t: 'Légende fictive' }] }],
            [{ cs: 3, rs: 1, lines: [{ id: 'm2', t: 'Avant fictif' }] }],
            [{ cs: 1, rs: 1, lines: [{ id: 'm3', t: 'Critères' }] }, { cs: 2, rs: 1, lines: [{ id: 'm4', t: 'Niveaux' }] }],
            [{ cs: 1, rs: 2, lines: [{ id: 'm5', t: 'Thèse fictive' }] }, { cs: 1, rs: 1, lines: [{ id: 'm6', t: 'Bien' }, { id: 'm7', t: 'et nuancé' }] },
                { cs: 1, rs: 1, lines: [{ id: 'm8', t: 'Faible' }] }],
            [{ cs: 1, rs: 1, lines: [{ id: 'm9', t: 'x' }] }, { cs: 1, rs: 1, lines: [{ id: 'm10', t: 'y' }] }],
            [{ cs: 3, rs: 1, lines: [{ id: 'm11', t: 'Après fictif' }] }]
        ] });
    });
});
