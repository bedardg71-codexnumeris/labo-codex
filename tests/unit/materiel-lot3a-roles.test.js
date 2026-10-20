/**
 * « APPORTER MON MATÉRIEL », LOT 3a — dire à l'application ce qu'est chaque partie du tableau.
 *
 * Consigne : plans de travail/CONSIGNE-LOT-2026-10-17-apporter-mon-materiel-3a-roles.md (« Les bancs »).
 *
 * ⚰ 19 oct. 2026 : l'assistant en sept étapes est RETIRÉ (CONSIGNE-LOT-2026-10-19-retrait-ancien-assistant.md),
 * avec sa lecture d'un tableau en rôles. Partis avec lui : D (déplier), G et P (la lecture et ce qu'elle
 * proposait), M (les rôles), S (son étape « Ce que contient ton tableau »), R.b et R.c. Ce qui reste éprouve
 * la lecture du collage (`lireHtml`, que la dissection emploie) et la logique commune (`calculs`, `construire`,
 * `coder`), sur les modèles que l'assistant produisait, figés avant son retrait.
 *
 * Ce que ce banc verrouille :
 *   R — RETOURS À LA LIGNE : un paragraphe, un élément de liste, un <br> donnent un `\n` ;
 *       les retours du source HTML ne sont que des blancs.
 *   K — CE QUE LA CRÉATION ATTEND d'une grille à parts égales, et d'une suite sans critère.
 *   C — CODES : complétés en repli ; requis, uniques sans la casse, 1 à 4 caractères, sans souligné ;
 *       modifier un titre ne touche pas un code repris ou saisi.
 *   F — FORME : critère et sous-critères créés ont la forme de l'éditeur (`grilles.js`).
 *
 * ⛔ Aucun texte de la grille réelle de Grégoire : tâches, descripteurs et noms sont inventés.
 */
import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { JSDOM } from 'jsdom';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';
import { fige } from './_helpers/modeles-assistant-figes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const fenetreDom = new JSDOM('<!doctype html><html><body></body></html>').window;

let w, L, A;
let compteur = 0;
beforeAll(() => {
    w = chargerScript('js/materiel-lecture.js', { DOMParser: fenetreDom.DOMParser });
    chargerScript('js/materiel-assistant.js', {}, w);
    L = w.materielLecture; A = w.materielAssistant;
});
beforeEach(() => { w.cle = (k) => 'a2032_' + k; });

/** Les tâches de la grille fictive (même forme que celle de Grégoire, textes inventés), dans son modèle figé. */
const CRITERES = [
    { nom: 'COMPRÉHENSION DU CORPUS', taches: ['Résumer chaque extrait', 'Situer l’époque', 'Nommer le narrateur'] },
    { nom: 'TRAVAIL DES CITATIONS', taches: ['Choisir une citation courte', 'L’introduire', 'La commenter', 'Donner la page', 'Éviter la paraphrase'] },
    { nom: 'STRUCTURE DE L’ANALYSE', taches: ['Annoncer le plan', 'Une idée par paragraphe', 'Relier les parties', 'Conclure', 'Ouvrir', 'Relire le tout', 'Titrer'] },
    { nom: 'CLARTÉ DE L’EXPRESSION', taches: ['Phrases complètes', 'Vocabulaire juste', 'Ponctuation soignée', 'Registre constant'] }
];
const fictive = () => fige('lot 3a · la grille fictive');
const exemple = () => fige('lot 3a · l’exemple');

describe('lot 3a · R — les retours à la ligne d’une case survivent', () => {
    it('R.a <p>, <li>, <br> : un retour chacun ; lignes vides resserrées ; retours du source = blancs', () => {
        const lu = L.lireHtml('<table><tr><td>C</td><td>A</td></tr><tr><td>\n  un\n  mot\n</td>' +
            '<td><p>Un</p><p>&nbsp;</p><ul><li>deux</li><li>trois</li></ul>quatre<br><br>cinq</td></tr></table>');
        expect(lu.rangees[1][0].t).toBe('un mot');
        expect(lu.rangees[1][1].t).toBe('Un\ndeux\ntrois\nquatre\ncinq');
    });

});

describe('lot 3a · K — ce que la création attend', () => {
    it('G.e parts égales (le document n’en donne pas) ; la création n’attend que plages et notes', () => {
        const m = fictive();
        m.niveaux.forEach((n, j) => {
            n.min = { valeur: String(j * 25), etat: 'saisi' };
            n.max = { valeur: String(j * 25 + 24), etat: 'saisi' };
            n.note = { valeur: String(j * 25 + 12), etat: 'saisi' };
        });
        expect(A.calculs(m).manquants).toEqual([]);
    });

    it('M.d une « Suite du critère » sans critère au-dessus est signalée dans « Avant de créer, il reste »', () => {
        expect(A.calculs(fige('lot 3a · une suite orpheline')).manquants)
            .toContain('un critère au-dessus de la rangée 4 (« Suite du critère »), à l’étape « Ce que contient ton tableau »');
    });
});

describe('lot 3a · C — les codes de niveau se corrigent', () => {
    const avecCodes = (codes) => {
        const m = exemple();
        m.niveaux.forEach((n, j) => { n.code = { valeur: codes[j], etat: codes[j] ? 'saisi' : 'remplir' }; });
        return m;
    };
    const manques = (m) => A.calculs(m).manquants.filter(t => /code/.test(t));

    it('C.a requis, uniques sans tenir compte de la casse, 1 à 4 caractères, sans souligné', () => {
        expect(manques(avecCodes(['E', 'S', 'A', 'I']))).toEqual([]);
        expect(manques(avecCodes(['E', '', 'A', 'I']))).toEqual(['le code d’un niveau']);
        expect(manques(avecCodes(['E', 'e', 'A', 'I']))).toEqual(['un code différent pour chaque niveau (deux niveaux ont le même code : « e »)']);
        expect(manques(avecCodes(['E', 'e', 'E', 'I']))).toEqual(['un code différent pour chaque niveau (des niveaux ont le même code : « e »)']);
        expect(manques(avecCodes(['E', 'e', 'A', 'a']))).toEqual(['un code différent pour chaque niveau (des niveaux ont le même code : « e », « a »)']);
        expect(manques(avecCodes(['EXCEL', 'S', 'A_1', 'I']))).toEqual(['un code de 1 à 4 caractères, sans « _ », pour 2 niveaux']);
    });

    it('C.b complétés en repli seulement : un code repris ou saisi n’est jamais recalculé, les complétés l’évitent', () => {
        const n = (titre, code) => ({ titre: { valeur: titre, etat: 'repris' }, code });
        const r = L.coder([n('Excellent', { valeur: 'E', etat: 'complete' }), n('Émergent', { valeur: 'X', etat: 'saisi' }), n('Faible'), n('Fort', { valeur: 'f', etat: 'repris' })]);
        expect(r.map(x => [x.code.valeur, x.code.etat])).toEqual([['E', 'complete'], ['X', 'saisi'], ['FA', 'complete'], ['f', 'repris']]);
    });

    it('C.c modifier un titre ne touche pas un code saisi ; un code complété suit son titre', () => {
        const m = exemple();
        m.niveaux[0].code = { valeur: 'TB', etat: 'saisi' };
        m.niveaux[0].titre = { valeur: 'Remarquable', etat: 'saisi' };
        m.niveaux[1].titre = { valeur: 'Passable', etat: 'saisi' };
        const r = L.coder(m.niveaux);
        expect(r[0].code).toEqual({ valeur: 'TB', etat: 'saisi' });
        expect(r[1].code).toEqual({ valeur: 'P', etat: 'complete' });
    });

    it('C.d le code construit est celui saisi, sans blancs, dans l’échelle et dans les descripteurs', () => {
        const m = exemple();
        m.niveaux[0].code = { valeur: ' tb ', etat: 'saisi' };
        const o = A.construire(m, { id: (p) => p + (++compteur), maintenant: '2026-10-17T12:00:00.000Z' });
        expect(o.echelle.niveaux[0].code).toBe('tb');
        expect(Object.keys(o.grille.criteres[0].descripteurs.parNiveau)[0]).toBe('tb');
    });
});

describe('lot 3a · F — critère et sous-critères ont la forme de l’éditeur', () => {
    const grilles = readFileSync(path.join(racine, 'js', 'grilles.js'), 'utf8');
    /** Les clés d'un littéral d'objet du source, entre `debut` et la première `fin`. */
    function cles(debut, fin) {
        const i = grilles.indexOf(debut);
        expect(i, debut).toBeGreaterThan(0);
        const bloc = grilles.slice(i + debut.length, grilles.indexOf(fin, i + debut.length));
        return [...bloc.matchAll(/^\s*(\w+):/gm)].map(x => x[1]).sort();
    }

    it('F.a les clés d’un critère créé à la main (« Créer l’objet critère »), plus son id', () => {
        const editeur = cles('// Créer l\'objet critère\n    const critere = {', '\n    };');
        const o = A.construire(exemple(), { id: (p) => p + (++compteur), maintenant: 'x' });
        const sansFacultatifs = Object.keys(o.grille.criteres[0]).filter(k => k !== 'descripteurs').sort();
        expect(sansFacultatifs).toEqual([...editeur, 'id'].sort());
        // #1117 (19 oct. 2026) : « aucun » dans tous les cas — la dissection ne choisit pas la complexité SOLO.
        expect(o.grille.criteres[0]).toMatchObject({ description: '', formule: '', niveauSOLO: 'aucun', verrouille: false, type: 'holistique' });
        expect(o.grille.criteres[0]).not.toHaveProperty('sousCriteres');   // aucun : absent, comme à l'éditeur
    });

    it('F.b un sous-critère : les clés et les défauts d’« ajouterSousCritere », dans l’ordre des lignes', () => {
        const editeur = cles('g.criteres[critereIndex].sousCriteres.push({', '\n        });');
        const o = A.construire(fictive(), { id: (p) => p + (++compteur), maintenant: 'x' });
        const sc = o.grille.criteres[2].sousCriteres;
        expect(sc.map(s => Object.keys(s).sort())).toEqual(sc.map(() => editeur));
        expect(sc.map(s => [s.code, s.nom, s.ponderation, s.retroaction])).toEqual(CRITERES[2].taches.map((t, k) => [String(k), t, 1, '']));
        expect(sc.every(s => /^SC_/.test(s.id))).toBe(true);
    });

    it('F.c au-delà de 30 sous-critères (borne du partage), la création est refusée et le dit', () => {
        const m = fictive();
        m.criteres[0].sousCriteres = Array.from({ length: 31 }, (x, k) => 'tâche ' + k);
        expect(A.calculs(m).manquants).toContain('au plus 30 sous-critères par critère');
    });
});
