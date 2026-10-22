/**
 * #1125 — GESTE 2 DU BARÈME : une grille à niveaux nommés et à points, apportée dans « Apporter mon
 * matériel », se crée avec un BARÈME juste (22 oct. 2026).
 *
 * Consigne : plans de travail/CONSIGNE-LOT-2026-10-22-bareme-geste-2-dissection.md. Le symptôme, vécu par
 * Grégoire le 20 oct. (13 h 56) dans « Journal de lecture » : les points des tranches au bout du texte, le
 * champ Points vide, d'où les « à compléter ».
 *
 * Ce que ce banc verrouille :
 *   J — L'EXEMPLE du module (le Journal de lecture, fictif), étiqueté comme dans la spec WebKit : chaque
 *       critère porte un barème — le nom du niveau, ses points en nombres (« 3-4 » : de 3 à 4), son texte
 *       SANS les points ; « Insuffisant », sans points, reste « à compléter » (rien d'inventé) ; la
 *       lecture unique (`bareme.tranchesDuCritere`) rend ce qui est écrit, et chaque points désigne sa tranche.
 *   P — PLUSIEURS morceaux « Points » dans une case se réunissent en une plage ; une case qui n'a que des
 *       points garde sa tranche (texte vide).
 *   N — CE QUI NE CHANGE PAS : sans niveaux, des réponses sous leurs clés de points ; en niveaux (« les
 *       deux », choix « niveaux »), la ligne des points reste dans le texte de l'échelle.
 *
 * Break-tests (faits le 22 oct.) : voir la demande de relecture du lot.
 *
 * Grilles et textes FICTIFS.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { JSDOM } from 'jsdom';
import { chargerScript } from './_helpers/charger-script.js';

const fenetreDom = new JSDOM('<!doctype html><html><body></body></html>').window;

let D, A, B;
beforeAll(() => {
    const w = chargerScript('js/materiel-lecture.js', { DOMParser: fenetreDom.DOMParser });
    chargerScript('js/materiel-assistant.js', {}, w);
    chargerScript('js/materiel-dissection-lecture.js', { DOMParser: fenetreDom.DOMParser }, w);
    chargerScript('js/bareme.js', {}, w);
    D = w.materielDissectionLecture;
    A = w.materielAssistant;
    B = w.bareme;
});

let compteur = 0;
const ctx = () => ({ id: (pre) => pre + (++compteur), maintenant: '2026-10-22T12:00:00.000Z' });
const lu = (c) => c.bareme.map((t) => [t.nom, t.pointsMin, t.pointsMax, t.texte]);

/** L'exemple du module, chaque morceau étiqueté par son texte (les mêmes étiquettes que `bareme-1.spec.js`). */
function exempleEtiquete() {
    const doc = D.exempleDoc();
    const M = D.morceaux(doc);
    const PAR_TEXTE = {
        section: ['PARTIE A : COMPRÉHENSION', 'PARTIE B : RÉFLEXION'],
        niveau: ['Insuffisant', 'Partiel', 'Satisfaisant', 'Remarquable'],
        critere: ['L’étudiant·e résume l’œuvre avec justesse', 'L’étudiant·e relève des procédés d’écriture',
            'L’étudiant·e relie l’œuvre aux notions du cours', 'L’étudiant·e exprime une appréciation argumentée'],
        descripteur: ['Résumé absent ou erroné', 'Résume quelques événements', 'Résume l’essentiel', 'Résume avec précision et concision',
            'Aucun procédé relevé', 'Relève un procédé', 'Relève quelques procédés', 'Relève et illustre plusieurs procédés',
            'Liens absents', 'Établit un lien', 'Établit quelques liens', 'Établit des liens nombreux et pertinents',
            'Appréciation absente', 'Donne une opinion', 'Justifie son opinion', 'Argumente avec nuance'],
        points: ['2', '3-4', '5', '3', '4', '4-5', '6-7', '8-10', '6-8', '9-10'],
        total: ['TOTAL : / 30'],
        titre: ['Journal de lecture']
    };
    const liens = {};
    M.ordre.forEach((id) => {
        const t = Object.keys(PAR_TEXTE).find((k) => PAR_TEXTE[k].includes(M.texte[id]));
        if (t) liens[id] = t;
    });
    return D.comprendre(doc, liens);
}

function compriseTexte(lignes, saisie) {
    const doc = D.docDepuisPressePapiers({ texte: lignes.map((x) => x[0]).join('\n') });
    const R = D.comprendre(doc, Object.fromEntries(D.morceaux(doc).ordre.map((id, i) => [id, lignes[i][1]])));
    return { R, creation: D.creation(R, {}, undefined, saisie) };
}

describe('#1125 · J — l’exemple du module se crée avec son barème', () => {
    it('J.a chaque tranche : le nom du niveau, ses points en nombres, son texte sans les points', () => {
        const c = D.creation(exempleEtiquete(), {});
        expect(c.enNiveaux).toBe(false);
        expect(c.raisons).toEqual([]);
        const g = A.construire(c.modele, ctx()).grille;
        expect(g.criteres.map((cr) => cr.ponderation)).toEqual([5, 5, 10, 10]);
        expect(lu(g.criteres[0])).toEqual([
            ['Insuffisant', null, null, 'Résumé absent ou erroné'],
            ['Partiel', 2, 2, 'Résume quelques événements'],
            ['Satisfaisant', 3, 4, 'Résume l’essentiel'],
            ['Remarquable', 5, 5, 'Résume avec précision et concision']
        ]);
        expect(lu(g.criteres[3])).toEqual([
            ['Insuffisant', null, null, 'Appréciation absente'],
            ['Partiel', 4, 5, 'Donne une opinion'],
            ['Satisfaisant', 6, 8, 'Justifie son opinion'],
            ['Remarquable', 9, 10, 'Argumente avec nuance']
        ]);
        // Aucun texte ne garde un chiffre : les points ne tombent plus dans le texte.
        expect(g.criteres.flatMap((cr) => cr.bareme.map((t) => t.texte)).some((t) => /\d/.test(t))).toBe(false);
        expect(g.criteres.some((cr) => 'descripteurs' in cr)).toBe(false);
        // Ce qu'écrit la création entre par les refus de structure, à l'import comme à l'écriture.
        g.criteres.forEach((cr) => expect(B.refusStructure(cr.bareme)).toBeNull());
    });

    it('J.b la lecture unique rend ce qui est écrit ; des points désignent leur tranche ; « Insuffisant » reste à compléter', () => {
        const g = A.construire(D.creation(exempleEtiquete(), {}).modele, ctx()).grille;
        const cr = g.criteres[2];
        const tranches = B.tranchesDuCritere(cr);
        expect(tranches).toEqual(cr.bareme);
        expect(B.aCompleter(tranches[0])).toBe(true);
        expect(B.trancheDesPoints(tranches, 6).nom).toBe('Satisfaisant');
        expect(B.trancheDesPoints(tranches, 4.5).nom).toBe('Partiel');
        expect(B.trancheDesPoints(tranches, 0)).toBeNull();
        expect(B.ligneEleve(tranches[3])).toBe('8-10 points : Établit des liens nombreux et pertinents');
    });
});

describe('#1125 · P — les points d’une case', () => {
    it('P.a deux morceaux « Points » dans une case : une seule plage, de la plus petite à la plus grande valeur', () => {
        const { creation } = compriseTexte([
            ['Grille fictive', 'titre'], ['Faible', 'niveau'], ['Fort', 'niveau'], ['Critère fictif', 'critere'],
            ['Peu de choses', 'descripteur'], ['1', 'points'],
            ['Beaucoup de choses', 'descripteur'], ['3', 'points'], ['4', 'points']
        ]);
        expect(creation.raisons).toEqual([]);
        const g = A.construire(creation.modele, ctx()).grille;
        expect(lu(g.criteres[0])).toEqual([['Faible', 1, 1, 'Peu de choses'], ['Fort', 3, 4, 'Beaucoup de choses']]);
    });

    it('P.b une case qui n’a que des points garde sa tranche, texte vide ; une case vide n’en donne aucune', () => {
        const { creation } = compriseTexte([
            ['Grille fictive', 'titre'], ['Faible', 'niveau'], ['Moyen', 'niveau'], ['Fort', 'niveau'], ['Critère fictif', 'critere'],
            ['Peu de choses', 'descripteur'], ['0', 'points'], ['Beaucoup de choses', 'descripteur']
        ]);
        const m = creation.modele;
        // Le texte brut range les descripteurs dans l'ordre des niveaux : le modèle est retouché au banc pour
        // laisser « Moyen » sans texte, avec des points seuls.
        m.criteres[0].cases = [{ valeur: 'Peu de choses', etat: 'repris' }, { valeur: '', etat: 'vide' }, { valeur: 'Beaucoup de choses', etat: 'repris' }];
        m.criteres[0].pointsParCase = [[0, 0], [2, 2], null];
        const g = A.construire(m, ctx()).grille;
        expect(lu(g.criteres[0])).toEqual([['Faible', 0, 0, 'Peu de choses'], ['Moyen', 2, 2, ''], ['Fort', null, null, 'Beaucoup de choses']]);
        m.criteres[0].pointsParCase = [[0, 0], null, null];
        expect(lu(A.construire(m, ctx()).grille.criteres[0]).map((t) => t[0])).toEqual(['Faible', 'Fort']);
    });
});

describe('#1125 · N — ce qui ne change pas', () => {
    it('N.a sans niveaux : des réponses sous leurs clés de points, lues juste par `bareme.lireCle`', () => {
        const { creation } = compriseTexte([
            ['Grille fictive', 'titre'], ['Critère fictif', 'critere'],
            ['Tout juste', 'descripteur'], ['2', 'points'], ['À moitié', 'descripteur'], ['1', 'points']
        ]);
        const cr = A.construire(creation.modele, ctx()).grille.criteres[0];
        expect(cr).not.toHaveProperty('bareme');
        expect(cr.descripteurs).toEqual({ parNiveau: { '2 points': 'Tout juste', '1 point': 'À moitié' } });
        expect(B.tranchesDuCritere(cr).map((t) => [t.pointsMin, t.texte])).toEqual([[2, 'Tout juste'], [1, 'À moitié']]);
    });

    it('N.b « les deux », créée en niveaux : la ligne des points reste dans le texte de l’échelle, aucun barème', () => {
        const lignes = [
            ['Grille fictive', 'titre'], ['Faible', 'niveau'], ['Fort', 'niveau'], ['Critère fictif', 'critere'],
            ['Peu de choses', 'descripteur'], ['0-1', 'points'], ['Beaucoup de choses', 'descripteur'], ['2', 'points']
        ];
        const R = compriseTexte(lignes).R;
        const cles = D.clesNiveaux(R);
        const saisie = { compte: 'niveaux', valeurs: { [cles[0]]: { min: '0', max: '59', note: '40' }, [cles[1]]: { min: '60', max: '100', note: '80' } } };
        const c = D.creation(R, {}, undefined, saisie);
        expect(c.enNiveaux).toBe(true);
        expect(c.modele.criteres[0]).not.toHaveProperty('pointsParCase');
        const o = A.construire(c.modele, ctx());
        expect(o.grille.criteres[0]).not.toHaveProperty('bareme');
        expect(Object.values(o.grille.criteres[0].descripteurs.parNiveau)).toEqual(['Peu de choses\n0-1', 'Beaucoup de choses\n2']);
    });
});
