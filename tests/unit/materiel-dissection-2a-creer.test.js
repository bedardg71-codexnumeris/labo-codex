/**
 * « APPORTER MON MATÉRIEL », LA DISSECTION, LOT 2a — créer sa grille EN POINTS depuis ses étiquettes.
 *
 * Consigne : plans de travail/CONSIGNE-LOT-2026-10-18-dissection-2a-creer-en-points.md (« Ce qu'il faut »).
 *
 * Ce que ce banc verrouille :
 *   M — de la lecture au modèle, puis à l'objet construit par `materielAssistant.construire` (le seul
 *       constructeur) : grilles fictives (a), (b), (c) — critères, pondérations, sous-critères, clés et
 *       textes de `parNiveau` (sans niveaux) ou tranches du barème (niveaux nommés, #1125), préfixe de
 *       section, « Critère N », description de la grille.
 *   R — chaque refus (point 2) : sans Titre, un morceau sans place, aucun point, les mots de
 *       `calculs(m).manquants`, plus de 20 réponses ; le total qui ne tombe pas juste n'empêche rien.
 *       (Une grille seulement en niveaux : lot 2b, `materiel-dissection-2b-niveaux.test.js`.)
 *   U — la « Suite » après des Points ou une Pondération (point 4, trouvaille 1 du lot 1).
 *   S — un collage piégé : son texte arrive tel quel dans l'objet, jamais interprété.
 *
 *   C1, C3 — corrections du verdict du 18 oct. : l'ordre des réponses (clés avec unité), le nom de la grille.
 *
 * Break-tests (faits le 18 oct.) : la garde du « sans place » retirée de `creation` → R.b rouge ; la
 * ligne des points retirée de `texteDuNiveau` → M.a et M.c rouges (22 oct., #1125 : la ligne des points
 * remise dans le texte d'une tranche → M.a et M.c rouges) ; `x.suite = null` remis pour
 * tous les types → U.a et U.b rouges.
 *
 * Grilles FICTIVES (tests/unit/_helpers/grilles-fictives-dissection.js), jamais le texte d'une grille réelle.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { JSDOM } from 'jsdom';
import { chargerScript } from './_helpers/charger-script.js';
import { GRILLE_A, GRILLE_B, TEXTE_C, enHtml, etiquettes, liensPar } from './_helpers/grilles-fictives-dissection.js';

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
/** La création possible, puis l'objet construit. */
function cree(R, contexte, nom) {
    const c = D.creation(R, contexte, nom);
    expect(c.enNiveaux).toBe(false);
    expect(c.raisons).toEqual([]);
    return A.construire(c.modele, ctx());
}

const B_AVEC_TITRE = [[{ cs: 2, l: [['Questionnaire fictif', 'titre']] }], ...GRILLE_B];

describe('M — de la lecture à la grille construite', () => {
    it('M.a — (a) sections et niveaux nommés : une tranche du barème par niveau, ses points en nombres (#1125)', () => {
        const o = cree(comprise(GRILLE_A));
        expect(o.echelle).toBeNull();
        expect(o.cartouche).toBeNull();
        const g = o.grille;
        expect(g.nom).toBe('Carnet d’observation fictif');
        expect(g.description).toBe('Noter des observations et en dégager une idée d’ensemble.');
        expect(g.type).toBe('analytique');
        expect(g.criteres.map((c) => c.nom)).toEqual([
            'Première section : recueil – L’étudiant·e accomplit la tâche fictive 1',
            'Première section : recueil – L’étudiant·e accomplit la tâche fictive 2',
            'Deuxième section : classement – L’étudiant·e accomplit la tâche fictive 3',
            'Deuxième section : classement – L’étudiant·e accomplit la tâche fictive 4',
            'Troisième section : synthèse – L’étudiant·e accomplit la tâche fictive 5',
            'Troisième section : synthèse – L’étudiant·e accomplit la tâche fictive 6'
        ]);
        expect(g.criteres.map((c) => c.ponderation)).toEqual([5, 10, 5, 10, 5, 15]);
        expect(g.criteres.every((c) => c.type === 'analytique')).toBe(true);
        expect(g.criteres[0].sousCriteres.map((s) => s.nom)).toEqual(['Indice observable 1.1', 'Indice observable 1.2']);
        // #1125 (22 oct. 2026) : un BARÈME, une tranche par niveau — son nom, ses points en nombres (sans points :
        // `null`, « à compléter »), son texte SANS la ligne des points ; ni `descripteurs`, ni échelle.
        const lu = (c) => c.bareme.map((t) => [t.nom, t.pointsMin, t.pointsMax, t.texte]);
        expect(lu(g.criteres[0])).toEqual([
            ['Ébauché', null, null, 'Tâche 1 absente'],
            ['Développé', 3, 3, 'Tâche 1, palier 2'],
            ['Solide', 4, 4, 'Tâche 1, palier 3'],
            ['Accompli', 5, 5, 'Tâche 1, palier 4']
        ]);
        // « 11-12-13 » : de 11 à 13.
        expect(lu(g.criteres[5])[2]).toEqual(['Solide', 11, 13, 'Tâche 6, palier 3']);
        expect(g.criteres.every((c) => !('descripteurs' in c) && c.bareme.every((t) => /^TR_/.test(t.id)))).toBe(true);
        expect(new Set(g.criteres.flatMap((c) => c.bareme.map((t) => t.id))).size).toBe(g.criteres.length * 4);
    });

    it('M.b — (b) des réponses sans niveaux : une clé par réponse, ses points tels qu’écrits ; « Critère N »', () => {
        const g = cree(comprise(B_AVEC_TITRE)).grille;
        expect(g.nom).toBe('Questionnaire fictif');
        expect('description' in g).toBe(false);
        expect(g.criteres.map((c) => c.nom)).toEqual([
            'Question 1 : le sens du passage fictif',
            'Partie B : le vocabulaire fictif – Critère 1',
            'Partie B : le vocabulaire fictif – Critère 2'
        ]);
        expect(g.criteres.map((c) => c.ponderation)).toEqual([4, 3, 2]);
        expect(g.criteres[0].descripteurs.parNiveau).toEqual({
            '4 points': 'Réponse juste et complète', '2 points': 'Réponse juste, mais incomplète', '0 point': 'Réponse absente ou fausse'
        });
        expect(g.criteres[1].descripteurs.parNiveau).toEqual({
            '3 points': 'Définit les trois termes', '2 points': 'Définit deux termes',
            '1 point': 'Définit un seul terme, ou en donne un exemple sans le définir', '0 point': 'Aucun terme défini'
        });
        expect(g.criteres[2].descripteurs.parNiveau).toEqual({ '1 point': 'Donne un exemple juste', '0,5 point': 'Donne un exemple approximatif', '0 point': 'Ne donne aucun exemple' });
        expect(g.criteres.some((c) => c.sousCriteres)).toBe(false);
    });

    it('M.c — (c) un texte brut : niveaux par l’ordre, les mêmes tranches', () => {
        const g = cree(compriseTexte(TEXTE_C)).grille;
        expect(g.nom).toBe('Grille d’exposé fictive');
        expect(g.criteres.map((c) => [c.nom, c.ponderation])).toEqual([['Clarté du propos', 4], ['Tenue de la langue', 2]]);
        expect(g.criteres[0].bareme.map((t) => [t.nom, t.pointsMin, t.pointsMax, t.texte])).toEqual([
            ['Insuffisant', 0, 1, 'Propos confus'], ['Réussi', 2, 3, 'Propos suivi'], ['Excellent', 4, 4, 'Propos limpide']]);
    });

    it('M.d — une réponse sans points prend « Réponse N » ; deux clés identiques se distinguent par « (2) »', () => {
        const R = compriseTexte([
            ['Grille fictive', 'titre'], ['Critère fictif', 'critere'],
            ['Tout juste', 'descripteur'], ['2', 'points'],
            ['Presque juste', 'descripteur'], ['2', 'points'],
            ['Hors sujet', 'descripteur']
        ]);
        const par = cree(R).grille.criteres[0].descripteurs.parNiveau;
        expect(par).toEqual({ '2 points': 'Tout juste', '2 points (2)': 'Presque juste', 'Réponse 3': 'Hors sujet' });
    });

    it('M.e — une description de critère et une pondération écrite l’emportent sur celle tirée des points', () => {
        const R = compriseTexte([
            ['Grille fictive', 'titre'], ['Critère fictif', 'critere'], ['Ce que le critère regarde.', 'description'],
            ['/ 10', 'ponderation'], ['Tout juste', 'descripteur'], ['4', 'points']
        ]);
        const c = cree(R).grille.criteres[0];
        expect(c.description).toBe('Ce que le critère regarde.');
        expect(c.ponderation).toBe(10);
    });
});

describe('C1 — l’ordre des réponses survit à l’objet et à JSON', () => {
    // Break-test (fait le 18 oct.) : `avecUnite` rendant l'écrit tel quel → C1.a rouge (« 0 » passe devant).
    it('C1.a — (b) : les clés dans l’ordre de lecture, avant et après un aller-retour JSON', () => {
        const g = cree(comprise(B_AVEC_TITRE)).grille;
        const attendu = [['4 points', '2 points', '0 point'], ['3 points', '2 points', '1 point', '0 point'], ['1 point', '0,5 point', '0 point']];
        expect(g.criteres.map((c) => Object.keys(c.descripteurs.parNiveau))).toEqual(attendu);
        const relu = JSON.parse(JSON.stringify(g));
        expect(relu.criteres.map((c) => Object.keys(c.descripteurs.parNiveau))).toEqual(attendu);
    });

    it('C1.b — l’unité au singulier sous 2 ; « 1,5 », « 2 » ; les autres écritures telles quelles', () => {
        const R = compriseTexte([
            ['Grille fictive', 'titre'], ['Critère fictif', 'critere'],
            ['A', 'descripteur'], ['3-4', 'points'], ['B', 'descripteur'], ['2', 'points'],
            ['C', 'descripteur'], ['1,5', 'points'], ['D', 'descripteur'], ['/1', 'points']
        ]);
        expect(Object.keys(cree(R).grille.criteres[0].descripteurs.parNiveau)).toEqual(['3-4', '2 points', '1,5 point', '/1']);
    });
});

describe('C3 — le champ « Nom de ta grille »', () => {
    it('C3.a — prérempli avec le Titre étiqueté', () => {
        const R = comprise(B_AVEC_TITRE);
        expect(D.nomPropose(R)).toBe('Questionnaire fictif');
        expect(D.creation(R).modele.nom.valeur).toBe('Questionnaire fictif');
    });

    it('C3.b — une fois modifié, le champ l’emporte, Titre étiqueté ou non', () => {
        expect(D.creation(comprise(B_AVEC_TITRE), {}, '  Autre nom fictif ').modele.nom.valeur).toBe('Autre nom fictif');
        const sansTitre = D.creation(comprise(GRILLE_B), {}, 'Nom tapé');
        expect(sansTitre.raisons).toEqual([]);
        expect(cree(comprise(GRILLE_B), {}, 'Nom tapé').grille.nom).toBe('Nom tapé');
    });

    it('C3.c — un nom déjà pris se corrige dans le champ, sans « (2) » ajouté', () => {
        const R = comprise(B_AVEC_TITRE);
        expect(D.creation(R, { nomsGrilles: ['Questionnaire fictif'] }).raisons).toEqual(['un autre nom de grille : « Questionnaire fictif » existe déjà dans ce trimestre']);
        const c = D.creation(R, { nomsGrilles: ['Questionnaire fictif'] }, 'Questionnaire fictif, automne');
        expect(c.raisons).toEqual([]);
        expect(c.modele.nom.valeur).toBe('Questionnaire fictif, automne');
    });
});

describe('R — quand « Créer ma grille » est refusé, et pourquoi', () => {
    it('R.a — aucun nom (ni Titre, ni champ) : « un nom pour ta grille », une seule fois', () => {
        expect(D.creation(comprise(GRILLE_B)).raisons).toEqual(['un nom pour ta grille']);
        expect(D.creation(comprise(B_AVEC_TITRE), {}, '   ').raisons).toEqual(['un nom pour ta grille']);
    });

    it('R.b — un morceau étiqueté sans place empêche de créer', () => {
        const c = D.creation(compriseTexte([...TEXTE_C, ['Langue exemplaire', 'descripteur']]));
        expect(c.raisons).toEqual(['une place pour le morceau étiqueté listé plus bas']);
    });

    it('R.c — ni points ni niveaux : il manque des points ou des niveaux', () => {
        const c = D.creation(compriseTexte([['Grille fictive', 'titre'], ['Critère fictif', 'critere']]));
        expect(c.enNiveaux).toBe(false);
        expect(c.raisons[0]).toBe('des points ou des niveaux : surligne ce que vaut chaque réponse avec l’étiquette « Points », ou le nom de chaque niveau avec l’étiquette « Niveau »');
    });

    it('R.d — les mots de calculs(m).manquants, tels quels : points non entiers, nom déjà pris', () => {
        const R = compriseTexte([['Grille d’exposé fictive', 'titre'], ['Critère fictif', 'critere'], ['Réponse', 'descripteur'], ['2,5', 'points']]);
        expect(D.creation(R, { nomsGrilles: ['Grille d’exposé fictive'] }).raisons).toEqual([
            'un autre nom de grille : « Grille d’exposé fictive » existe déjà dans ce trimestre',
            'des points en nombre entier de 0 à 100 pour un critère'
        ]);
    });

    it('R.e — plus de 20 réponses dans un critère', () => {
        const lignes = [['Grille fictive', 'titre'], ['Critère fictif', 'critere']];
        for (let k = 21; k >= 1; k--) lignes.push(['Réponse ' + k, 'descripteur'], [String(k), 'points']);
        expect(D.creation(compriseTexte(lignes)).raisons).toEqual(['au plus 20 réponses par critère (« Critère fictif » en a 21)']);
    });

    it('R.g — un total qui ne tombe pas juste n’empêche pas de créer', () => {
        const R = comprise(GRILLE_A.map((row, i) => (i === GRILLE_A.length - 1 ? [{ cs: 5, l: [['TOTAL : / 60', 'total']] }] : row)));
        expect(D.bilan(R).totalOk).toBe(false);
        expect(D.creation(R).raisons).toEqual([]);
    });
});

describe('U — une « Suite » après des Points ou une Pondération (trouvaille 1 du lot 1)', () => {
    it('U.a — (b), les points sur la première rangée, la « Suite » sur la seconde : aucun morceau sans place', () => {
        const b = GRILLE_B.map((row) => row);
        b[7] = [{ l: [['Définit un seul terme, ou en donne', 'descripteur']] }, { l: [['1', 'points']] }];
        b[8] = [{ l: [['un exemple sans le définir', 'suite']] }, { l: [] }];
        const R = comprise(b);
        expect(R.sansPlace).toEqual([]);
        expect(R.criteres[1].reponses[2].desc).toBe('Définit un seul terme, ou en donne un exemple sans le définir');
        expect(R.criteres[1].reponses[2].pts).toEqual([[1, 1]]);
    });

    it('U.b — une « Suite » après une Pondération complète le nom du critère', () => {
        const R = compriseTexte([['Clarté du', 'critere'], ['/ 4', 'ponderation'], ['propos', 'suite']]);
        expect(R.sansPlace).toEqual([]);
        expect(R.criteres[0].nom).toBe('Clarté du propos');
        expect(R.criteres[0].pond).toBe(4);
    });
});

describe('S — un collage piégé arrive tel quel dans l’objet, jamais interprété', () => {
    it('S.a — titre, critère, réponse et points qui ressemblent à du HTML restent du texte', () => {
        const html = '<script>window.__pirate = 1;</script><table>' +
            '<tr><td><p>&lt;img src=x onerror=alert(1)&gt;</p></td><td></td></tr>' +
            '<tr><td><p>Critère &lt;b&gt;gras&lt;/b&gt;<img src="y" onerror="window.__pirate = 2"></p></td><td></td></tr>' +
            '<tr><td><p>&lt;script&gt;x()&lt;/script&gt;</p></td><td><p>&lt;i&gt;3&lt;/i&gt;</p></td></tr></table>';
        const doc = D.docDepuisPressePapiers({ html });
        const types = ['titre', 'critere', 'descripteur', 'points'];
        const R = D.comprendre(doc, liensPar(D.morceaux(doc).ordre, types));
        const g = cree(R).grille;
        expect(g.nom).toBe('<img src=x onerror=alert(1)>');
        expect(g.criteres[0].nom).toBe('Critère <b>gras</b>');
        expect(g.criteres[0].descripteurs.parNiveau).toEqual({ '<i>3</i>': '<script>x()</script>' });
        expect(JSON.stringify(g)).not.toContain('__pirate');
    });
});
