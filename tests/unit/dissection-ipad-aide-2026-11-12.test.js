/**
 * LA DISSECTION SUR L'IPAD (12 nov. 2026) — l'aide pas à pas, l'exemple étiqueté, `sansPlace` qui garde son morceau.
 *
 * Relais de la conversation du Projet, 12 nov., 6 h 35 (points 3, 4 et 5) :
 *   S — `R.sansPlace` garde l'identifiant du morceau et sa rangée (tableau), `null` en texte brut.
 *   M — `creation(...).manques` et `codesCompris(...).manques` : une sorte par raison, dans l'ordre exact de `raisons`.
 *   A — l'aide suit le PREMIER manque, sur trois grilles fictives : un tableau, un texte brut, un cas mêlé grille et code ;
 *       à chaque manque, une étiquette à prendre (une flèche possible), et le morceau quand l'application le sait.
 *   G — le cas de Grégoire (capture du 11 nov.) : des « / 5 » en « Pondération », aucun critère dans leur rangée
 *       ⇒ « Prends « Critère », puis touche « Introduction » » ; « Poids » posé sur un « / 5 » ⇒ dit de trop, et
 *       « Pondération » proposée.
 *   E — l'exemple : chaque morceau étiqueté, la grille complète (aucun manque), et sans étiquettes, le premier manque.
 *
 * Break-tests (faits le 12 nov.) : `libreDansRangee` rendant toujours null → A.a, G.a rouges ; `codesDeTrop` inversé
 * dans `aideMelange` → A.c, G.b, G.c rouges ; `sansPlace` sans `id` → S.a rouge ; `exempleLiens` qui laisse les points
 * sans étiquette → E.a rouge. Rétablis → 10 verts.
 *
 * Grilles FICTIVES (aucun texte réel).
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { JSDOM } from 'jsdom';
import { chargerScript } from './_helpers/charger-script.js';

const fenetreDom = new JSDOM('<!doctype html><html><body></body></html>').window;

let D;
beforeAll(() => {
    const w = chargerScript('js/materiel-lecture.js', { DOMParser: fenetreDom.DOMParser });
    chargerScript('js/materiel-assistant.js', {}, w);
    chargerScript('js/materiel-dissection-lecture.js', { DOMParser: fenetreDom.DOMParser }, w);
    D = w.materielDissectionLecture;
});

/** Un tableau : chaque rangée, ses cases (textes, une ligne par morceau) ; une case `[n, ...]` : `cs = n`. */
function tableau(rangees) {
    let n = 0;
    return { mode: 'table', rows: rangees.map((r) => r.map((c) => {
        const cs = typeof c[0] === 'number' ? c[0] : 1;
        const lignes = typeof c[0] === 'number' ? c.slice(1) : c;
        return { cs, rs: 1, lines: lignes.map((t) => ({ id: 'm' + (++n), t })) };
    })) };
}
const texte = (lignes) => ({ mode: 'texte', lines: lignes.map((t, i) => ({ id: 'm' + (i + 1), t })) });
const idDe = (doc, t) => { const M = D.morceaux(doc); return M.ordre.find((id) => M.texte[id] === t); };
const liensDe = (doc, paires) => Object.fromEntries(paires.map(([t, type]) => [idDe(doc, t), type]));

/** Le premier manque et son aide, comme la bulle les lit. */
function aideDe(doc, liens) {
    const R = D.comprendre(doc, liens, {});
    const enCodes = D.estListeDeCodes(R);
    const manques = enCodes ? D.codesCompris(R).manques : D.creation(R, { nomsGrilles: [] }, undefined, { compte: 'points', valeurs: {} }).manques;
    return D.aide({ doc, liens, rattachements: {}, manque: manques[0] || null, enCodes });
}

// La grille de la capture, refaite FICTIVE : trois critères sur des rangées, des « / N » en dernière colonne.
const CAPTURE = () => tableau([
    [[3, 'Grille fictive d’analyse']],
    [['Introduction'], ['Sujet amené, posé, divisé'], ['/ 5']],
    [['Développement'], ['Arguments et exemples'], ['/ 30']],
    [['Conclusion'], ['Synthèse et ouverture'], ['/ 5']]
]);

describe('S — `sansPlace` garde son morceau', () => {
    it('S.a : dans un tableau, l’identifiant et la rangée ; en texte brut, la rangée est null', () => {
        const doc = CAPTURE();
        const R = D.comprendre(doc, liensDe(doc, [['/ 5', 'ponderation']]), {});
        expect(R.sansPlace[0]).toMatchObject({ t: '/ 5', type: 'ponderation', id: idDe(doc, '/ 5'), r: 1 });
        const t = texte(['3 points', 'Résumé fidèle']);
        const R2 = D.comprendre(t, liensDe(t, [['3 points', 'points']]), {});
        expect(R2.sansPlace[0]).toMatchObject({ id: 'm1', r: null });
    });
});

describe('M — une sorte par raison, dans l’ordre des raisons', () => {
    it('M.a : `manques` suit `raisons` mot pour mot', () => {
        const doc = CAPTURE();
        const R = D.comprendre(doc, liensDe(doc, [['/ 5', 'ponderation']]), {});
        const c = D.creation(R, { nomsGrilles: [] }, undefined, { compte: 'points', valeurs: {} });
        expect(c.manques.map((m) => m.texte)).toEqual(c.raisons);
        expect(c.manques.map((m) => m.sorte).slice(0, 2)).toEqual(['nom', 'sansPlace']);
    });
});

describe('A — l’aide suit le premier manque, une étiquette à chaque manque', () => {
    it('A.a : un tableau, de bout en bout (titre, critère de la rangée, puis prête)', () => {
        const doc = CAPTURE();
        const etapes = [];
        let liens = liensDe(doc, [['/ 5', 'ponderation'], ['/ 30', 'ponderation']]);
        let a = aideDe(doc, liens);
        etapes.push(a.sorte);
        expect(a).toMatchObject({ sorte: 'nom', etiquette: 'titre', morceau: null });
        liens = { ...liens, [idDe(doc, 'Grille fictive d’analyse')]: 'titre' };
        a = aideDe(doc, liens);
        etapes.push(a.sorte);
        expect(a).toMatchObject({ sorte: 'sansPlace', etiquette: 'critere', morceau: idDe(doc, 'Introduction') });
        liens = { ...liens, [idDe(doc, 'Introduction')]: 'critere' };
        a = aideDe(doc, liens);
        expect(a).toMatchObject({ sorte: 'sansPlace', etiquette: 'critere', morceau: idDe(doc, 'Développement') });
        liens = { ...liens, [idDe(doc, 'Développement')]: 'critere' };
        a = aideDe(doc, liens);
        expect(a).toMatchObject({ sorte: 'pret', cible: 'creer' });
        expect(a.phrase).toBe('Ta grille est prête : touche « Créer ma grille ».');
        expect(etapes).toEqual(['nom', 'sansPlace']);
    });

    it('A.b : un texte brut (le nom, la logique, un critère avant les points, sans morceau deviné)', () => {
        const doc = texte(['Grille fictive de lecture', 'Résumé fidèle', 'Repérage des événements', '3 points']);
        let a = aideDe(doc, {});
        expect(a).toMatchObject({ sorte: 'nom', etiquette: 'titre' });
        let liens = liensDe(doc, [['Grille fictive de lecture', 'titre']]);
        a = aideDe(doc, liens);
        expect(a).toMatchObject({ sorte: 'logique', etiquette: 'points', morceau: null });
        liens = { ...liens, ...liensDe(doc, [['3 points', 'points']]) };
        a = aideDe(doc, liens);
        expect(a).toMatchObject({ sorte: 'sansPlace', etiquette: 'critere', morceau: null });
        expect(a.phrase).toBe('« 3 points » n’a aucun critère avant lui : prends « Critère », puis touche le critère qu’il complète.');
        liens = { ...liens, ...liensDe(doc, [['Résumé fidèle', 'critere']]) };
        a = aideDe(doc, liens);
        expect(a).toMatchObject({ sorte: 'sansPlace', etiquette: 'descripteur' });   // les points n'ont pas encore de réponse
        liens = { ...liens, ...liensDe(doc, [['Repérage des événements', 'descripteur']]) };
        expect(aideDe(doc, liens).sorte).toBe('pret');
    });

    it('A.c : un cas mêlé grille et code (une seule étiquette de code parmi des étiquettes de grille)', () => {
        const doc = CAPTURE();
        const liens = liensDe(doc, [['Grille fictive d’analyse', 'titre'], ['Introduction', 'critere'], ['Développement', 'critere'],
            ['Conclusion', 'critere'], ['/ 5', 'poids'], ['/ 30', 'ponderation']]);
        const a = aideDe(doc, liens);
        expect(a.sorte).toBe('melange');
        expect(a.etiquette).toBe('ponderation');
        expect(a.morceau).toBe(idDe(doc, '/ 5'));
    });
});

describe('G — le cas de la capture de Grégoire (11 nov.)', () => {
    it('G.a : « / 5 » en « Pondération », aucun critère dans sa rangée ⇒ prends « Critère », puis touche « Introduction »', () => {
        const doc = CAPTURE();
        const liens = liensDe(doc, [['Grille fictive d’analyse', 'titre'], ['/ 5', 'ponderation'], ['/ 30', 'ponderation']]);
        const a = aideDe(doc, liens);
        expect(a.phrase).toBe('« / 5 » n’a aucun critère dans sa rangée : prends « Critère », puis touche « Introduction ».');
    });

    it('G.b : « Poids » sur un « / 5 » : dit de trop, ce qu’il veut dire, et « Pondération » à sa place', () => {
        const doc = CAPTURE();
        const liens = liensDe(doc, [['Grille fictive d’analyse', 'titre'], ['Introduction', 'critere'], ['/ 5', 'poids']]);
        const a = aideDe(doc, liens);
        expect(a.phrase).toBe('« Poids » sert aux listes de codes (ce que pèse un code posé) : pour le poids d’un critère, prends « Pondération », puis touche « / 5 ».');
        expect(a).toMatchObject({ etiquette: 'ponderation', morceau: idDe(doc, '/ 5') });
    });

    it('G.c : une liste de codes avec une étiquette de grille de trop : celle-ci est nommée, à retirer', () => {
        const doc = tableau([[['S'], ['Syntaxe'], ['2']], [['O'], ['Orthographe'], ['1']], [['Total : 3']]]);
        const liens = liensDe(doc, [['S', 'code'], ['Syntaxe', 'nomcode'], ['2', 'poids'], ['O', 'code'], ['Orthographe', 'nomcode'], ['Total : 3', 'total']]);
        const a = aideDe(doc, liens);
        expect(a).toMatchObject({ sorte: 'melange', etiquette: 'total', morceau: idDe(doc, 'Total : 3'), retirer: true });
        expect(a.phrase).toBe('« Total » sert aux grilles, pas aux listes de codes : prends « Total », puis touche « Total : 3 » pour la retirer.');
    });
});

describe('E — l’exemple d’« Essayer avec un exemple »', () => {
    it('E.a : étiqueté en entier, chaque morceau porte une étiquette et la grille est prête', () => {
        const doc = D.exempleDoc();
        const liens = D.exempleLiens(doc);
        expect(Object.keys(liens).length).toBe(D.morceaux(doc).ordre.length);
        const R = D.comprendre(doc, liens, {});
        expect(R.sansEtiquette).toBe(0);
        expect(R.criteres.map((c) => c.nom)).toHaveLength(4);
        expect(R.niveaux).toEqual(['Insuffisant', 'Partiel', 'Satisfaisant', 'Remarquable']);
        expect(D.bilan(R)).toMatchObject({ total: 30, totalOk: true });
        expect(aideDe(doc, liens).sorte).toBe('pret');
    });

    it('E.b : sans étiquettes (« faire l’exercice soi-même »), l’aide commence par le nom', () => {
        expect(aideDe(D.exempleDoc(), {})).toMatchObject({ sorte: 'nom', etiquette: 'titre' });
    });
});

describe('« Composer ma grille » remplace « Partir de zéro » (Grégoire, 11 nov., 8 h 58)', () => {
    // Break-test (12 nov.) : « Partir de zéro » remis dans un commentaire de js/materiel.js → rouge.
    it('aucun « Partir de zéro » dans index.html ni dans js/', async () => {
        const { readFileSync, readdirSync } = await import('node:fs');
        const path = await import('node:path');
        const racine = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
        const fichiers = ['index.html'].concat(readdirSync(path.join(racine, 'js'), { recursive: true })
            .filter((f) => String(f).endsWith('.js')).map((f) => path.join('js', String(f))));
        const avec = fichiers.filter((f) => readFileSync(path.join(racine, f), 'utf8').includes('Partir de zéro'));
        expect(avec).toEqual([]);
    });
});
