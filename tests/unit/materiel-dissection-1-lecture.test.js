/**
 * « APPORTER MON MATÉRIEL », LA DISSECTION, LOT 1 — lire une grille collée en morceaux, et comprendre
 * les étiquettes que l'enseignant y pose.
 *
 * Consigne : plans de travail/CONSIGNE-LOT-2026-10-18-dissection-1-etiqueter.md (« Ce qu'il faut », 1 et 4).
 *
 * Ce que ce banc verrouille :
 *   L — LIRE : chaque ligne d'une case est un morceau (paragraphe, saut de ligne), avec sa rangée, sa
 *       colonne et ses fusions ; le texte à tabulations est un tableau ; le texte brut d'un PDF, des
 *       lignes dans l'ordre ; le texte autour du tableau reste à l'écran.
 *   A — la grille (a) : des sections à niveaux nommés, des points par niveau, un total.
 *   B — la grille (b) : des réponses en lignes et leurs points, des critères sans nom, une « Suite »,
 *       une pondération « /2 » : aucun morceau sans place.
 *   C — le texte brut (c) : rattachement par l'ordre.
 *   X — les cas limites : chacun finit « sans place », avec sa raison, jamais en erreur.
 *   S — SÉCURITÉ : un <img onerror> collé n'est que lu ; la feuille l'écrit en texte (break-test).
 *
 * Grilles FICTIVES (tests/unit/_helpers/grilles-fictives-dissection.js), de la forme des deux grilles
 * réelles, jamais leur texte.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { JSDOM } from 'jsdom';
import { chargerScript } from './_helpers/charger-script.js';
import { GRILLE_A, GRILLE_B, TEXTE_C, enHtml, etiquettes, liensPar } from './_helpers/grilles-fictives-dissection.js';

const fenetreDom = new JSDOM('<!doctype html><html><body></body></html>').window;

let D;
let vue;
beforeAll(() => {
    const w = chargerScript('js/materiel-lecture.js', { DOMParser: fenetreDom.DOMParser });
    chargerScript('js/materiel-dissection-lecture.js', { DOMParser: fenetreDom.DOMParser }, w);
    D = w.materielDissectionLecture;
    w.addEventListener = () => {};   // le resize et le scroll des flèches, sans objet ici
    chargerScript('js/materiel-dissection.js', { document: fenetreDom.document }, w);
    vue = w.materielDissection;
});

/** Coller une grille fictive, puis poser ses étiquettes : la grille comprise. */
function disseque(grille) {
    const doc = D.docDepuisPressePapiers({ html: enHtml(grille), texte: '' });
    const M = D.morceaux(doc);
    return { doc, M, R: D.comprendre(doc, liensPar(M.ordre, etiquettes(grille))) };
}

describe('L — lire le collage en morceaux', () => {
    it('L.a — un paragraphe, un saut de ligne : un morceau chacun, avec la place de sa case', () => {
        const doc = D.docDepuisPressePapiers({ html:
            '<table><tr><td rowspan="2"><p>Critère fictif</p><p>· Indice un</p>Indice deux<br>Indice trois</td><td colspan="2">Haut</td></tr>' +
            '<tr><td>Gauche</td><td>Droite</td></tr></table>' });
        expect(doc.mode).toBe('table');
        const M = D.morceaux(doc);
        expect(M.ordre.map((id) => M.texte[id])).toEqual(['Critère fictif', '· Indice un', 'Indice deux', 'Indice trois', 'Haut', 'Gauche', 'Droite']);
        const place = (t) => M.pos[M.ordre.find((id) => M.texte[id] === t)];
        expect(place('Indice trois')).toEqual({ r: 0, c: 0, cs: 1, rs: 2, k: 3 });
        expect(place('Haut')).toEqual({ r: 0, c: 1, cs: 2, rs: 1, k: 0 });
        // La case fusionnée sur deux rangées décale la rangée suivante d'une colonne.
        expect(place('Gauche')).toMatchObject({ r: 1, c: 1 });
        expect(place('Droite')).toMatchObject({ r: 1, c: 2 });
    });

    it('L.b — le texte autour du tableau reste à l’écran, sur une rangée de toute la largeur', () => {
        const doc = D.docDepuisPressePapiers({ html: '<p>Titre fictif avant</p><table><tr><td>A</td><td>B</td></tr><tr><td>C</td><td>D</td></tr></table><p>Note après</p>' });
        expect(doc.rows[0]).toEqual([{ cs: 2, rs: 1, lines: [expect.objectContaining({ t: 'Titre fictif avant' })] }]);
        expect(doc.rows[doc.rows.length - 1][0].lines[0].t).toBe('Note après');
        expect(doc.rows[doc.rows.length - 1][0].cs).toBe(2);
    });

    it('L.c — du texte à tabulations : un tableau ; du texte brut : des lignes dans l’ordre', () => {
        const tab = D.docDepuisPressePapiers({ texte: 'Critère\tNiveau 1\tNiveau 2\nClarté\tFlou\tNet' });
        expect(tab.mode).toBe('table');
        expect(tab.rows).toHaveLength(2);
        const brut = D.docDepuisPressePapiers({ texte: 'Grille fictive\n\n  Clarté   du propos \r\nPropos confus' });
        expect(brut).toEqual({ mode: 'texte', lines: [{ id: 'm1', t: 'Grille fictive' }, { id: 'm2', t: 'Clarté du propos' }, { id: 'm3', t: 'Propos confus' }] });
    });

    it('L.d — un HTML sans tableau ni texte brut : ses blocs, ligne par ligne ; rien de lisible : null', () => {
        const doc = D.docDepuisPressePapiers({ html: '<style>p{}</style><p>Premier</p><div>Deuxième<br>Troisième</div>' });
        expect(doc.lines.map((l) => l.t)).toEqual(['Premier', 'Deuxième', 'Troisième']);
        expect(D.docDepuisPressePapiers({ html: '', texte: '   \n ' })).toBeNull();
        expect(D.docDepuisPressePapiers(null)).toBeNull();
    });

    it('L.e — l’exemple de l’application est une grille à sections et niveaux, sans étiquette', () => {
        const doc = D.exempleDoc();
        const R = D.comprendre(doc, {});
        expect(doc.mode).toBe('table');
        expect(R.sansEtiquette).toBe(D.morceaux(doc).ordre.length);
        expect(R.criteres).toEqual([]);
    });
});

describe('A — sections à niveaux nommés, points par niveau, total', () => {
    it('3 sections, 6 critères, 4 niveaux ; somme des pondérations = total ; les deux logiques', () => {
        const { R } = disseque(GRILLE_A);
        expect(R.sansPlace).toEqual([]);
        expect(R.sansEtiquette).toBe(0);
        expect(R.titre).toEqual(['Carnet d’observation fictif']);
        expect(R.description).toEqual(['Noter des observations et en dégager une idée d’ensemble.']);
        expect(R.niveaux).toEqual(['Ébauché', 'Développé', 'Solide', 'Accompli']);
        expect(new Set(R.criteres.map((c) => c.section.nom)).size).toBe(3);
        expect(R.criteres).toHaveLength(6);
        expect(R.criteres.map((c) => c.pondDeduite)).toEqual([5, 10, 5, 10, 5, 15]);
        const c2 = R.criteres[1];
        expect(c2.sous).toEqual(['Indice observable 2.1', 'Indice observable 2.2']);
        expect(c2.niv[0]).toEqual({ desc: ['Tâche 2 absente'], pts: [] });
        expect(c2.niv[1].pts).toEqual([[6, 7]]);
        expect(R.criteres[5].niv[2].pts).toEqual([[11, 13]]);
        const b = D.bilan(R);
        expect(b).toMatchObject({ somme: 50, jusqua: 50, totalOk: true, logique: 'deux' });
    });
});

describe('B — réponses en lignes et leurs points, sans niveaux nommés', () => {
    it('un critère nommé, puis deux critères sans nom coupés où les points remontent ; aucun morceau sans place', () => {
        const { R } = disseque(GRILLE_B);
        expect(R.sansPlace).toEqual([]);
        expect(R.sansEtiquette).toBe(0);
        expect(R.niveaux).toEqual([]);
        expect(R.criteres.map((c) => c.nom)).toEqual(['Question 1 : le sens du passage fictif', null, null]);
        expect(R.aNommer).toBe(2);
        expect(R.criteres[0].section).toBeNull();
        expect(R.criteres[1].section.nom).toBe('Partie B : le vocabulaire fictif');
        expect(R.criteres[2].section).toBe(R.criteres[1].section);
        expect(R.criteres[1].reponses.map((r) => [r.desc, r.pts])).toEqual([
            ['Définit les trois termes', [[3, 3]]],
            ['Définit deux termes', [[2, 2]]],
            ['Définit un seul terme, ou en donne un exemple sans le définir', [[1, 1]]],
            ['Aucun terme défini', [[0, 0]]]
        ]);
        expect(R.criteres[2].reponses.map((r) => r.pts[0][1])).toEqual([1, 0.5, 0]);
        expect(R.criteres.map((c) => [c.pond, c.pondDeduite])).toEqual([[null, 4], [null, 3], [2, null]]);
        expect(D.bilan(R)).toMatchObject({ somme: 9, logique: 'points', totalOk: null });
    });
});

describe('C — un texte brut : rattachement par l’ordre', () => {
    const coller = (lignes) => {
        const doc = D.docDepuisPressePapiers({ texte: lignes.map((x) => x[0]).join('\n') });
        return { doc, R: D.comprendre(doc, liensPar(D.morceaux(doc).ordre, lignes.map((x) => x[1]))) };
    };

    it('chaque réponse prend le niveau de son rang, ses points la suivent', () => {
        const { doc, R } = coller(TEXTE_C);
        expect(doc.mode).toBe('texte');
        expect(R.sansPlace).toEqual([]);
        expect(R.niveaux).toEqual(['Insuffisant', 'Réussi', 'Excellent']);
        expect(R.criteres.map((c) => c.nom)).toEqual(['Clarté du propos', 'Tenue de la langue']);
        expect(R.criteres[0].niv).toEqual({ 0: { desc: ['Propos confus'], pts: [[0, 1]] }, 1: { desc: ['Propos suivi'], pts: [[2, 3]] }, 2: { desc: ['Propos limpide'], pts: [[4, 4]] } });
        expect(D.bilan(R)).toMatchObject({ somme: 6, logique: 'deux' });
    });

    it('une réponse de plus que de niveaux : sans place, avec sa raison', () => {
        const { R } = coller([...TEXTE_C, ['Langue exemplaire', 'descripteur']]);
        expect(R.sansPlace).toEqual([{ t: 'Langue exemplaire', type: 'descripteur', raison: 'plus de réponses que de niveaux' }]);
    });
});

describe('X — les cas limites finissent « sans place », jamais en erreur', () => {
    it('X.a — des « Points » sans réponse', () => {
        const { R } = disseque([
            [{ l: [['Critère fictif', 'critere']] }, { l: [] }],
            [{ l: [] }, { l: [['3 points', 'points']] }]
        ]);
        expect(R.sansPlace).toEqual([{ t: '3 points', type: 'points', raison: 'aucune réponse pour ces points' }]);
        expect(R.criteres).toHaveLength(1);
    });

    it('X.b — une « Suite » sans rien avant elle', () => {
        const { R } = disseque([
            [{ l: [['la fin d’une phrase', 'suite']] }, { l: [['Critère fictif', 'critere']] }],
            [{ l: [['Réponse', 'descripteur']] }, { l: [['1', 'points']] }]
        ]);
        expect(R.sansPlace).toEqual([{ t: 'la fin d’une phrase', type: 'suite', raison: 'aucun morceau à compléter avant elle' }]);
    });

    it('X.c — un « Descripteur » sans critère quand des niveaux sont nommés', () => {
        const { R } = disseque([
            [{ l: [['Critères', null]] }, { l: [['Faible', 'niveau']] }, { l: [['Fort', 'niveau']] }],
            [{ l: [['Rien ici', null]] }, { l: [['Réponse orpheline', 'descripteur']] }, { l: [['Autre réponse', 'descripteur']] }]
        ]);
        expect(R.sansPlace.map((s) => [s.t, s.raison])).toEqual([
            ['Réponse orpheline', 'aucun critère avant lui'],
            ['Autre réponse', 'aucun critère avant lui']
        ]);
        expect(R.criteres).toEqual([]);
        expect(R.sansEtiquette).toBe(2);
    });

    it('X.d — une pondération ou des points sans nombre ; une étiquette inconnue compte comme absente', () => {
        const doc = D.docDepuisPressePapiers({ texte: 'Critère fictif\nbeaucoup\nRéponse\nquelques-uns\nAutre' });
        const ids = D.morceaux(doc).ordre;
        const R = D.comprendre(doc, { [ids[0]]: 'critere', [ids[1]]: 'ponderation', [ids[2]]: 'descripteur', [ids[3]]: 'points', [ids[4]]: 'inexistant' });
        expect(R.sansPlace.map((s) => s.raison)).toEqual(['aucun nombre', 'aucun nombre']);
        expect(R.sansEtiquette).toBe(1);
    });
});

describe('S — un collage piégé n’est que lu', () => {
    const PIEGE = '<script>window.__pirate = 1;</script><table><tr><td>Critère<img src="x" onerror="window.__pirate = 2"></td><td>A</td></tr>' +
        '<tr><td><b>&lt;img src=y onerror=alert(1)&gt;</b></td><td>1</td></tr></table>';

    it('S.a — la lecture ne retient que le texte : ni balise, ni script', () => {
        const doc = D.docDepuisPressePapiers({ html: PIEGE });
        const json = JSON.stringify(doc);
        expect(json).not.toContain('__pirate');
        expect(json).not.toContain('onerror="');
        expect(D.morceaux(doc).ordre.map((id) => D.morceaux(doc).texte[id])).toEqual(['Critère', 'A', '<img src=y onerror=alert(1)>', '1']);
    });

    // Break-test (fait le 18 oct.) : `b.innerHTML = L.t` au lieu de `textContent` dans la feuille → une <img> apparaît, rouge.
    it('S.b — la feuille écrit un texte qui ressemble à du HTML comme du texte, jamais comme des balises', () => {
        const doc = D.docDepuisPressePapiers({ html: PIEGE });
        const feuille = vue.construireFeuille(doc);
        expect(feuille.querySelectorAll('img, script, b')).toHaveLength(0);
        expect(feuille.textContent).toContain('<img src=y onerror=alert(1)>');
        expect(feuille.querySelectorAll('.dissection-morceau')).toHaveLength(4);
    });
});
