/**
 * #674 · UN CRITÈRE NAÎT AVEC SON IDENTIFIANT
 *
 * Mesuré le 2 septembre 2026 sur les données de Grégoire (sonde en lecture seule,
 * `scripts/diagnostic-674-ids-criteres.js`) : quatre des cinq critères de
 * « Grille-5 FR-ALGO A26 » ont `id: undefined`. L'éditeur de grille EN LIGNES
 * (`ajouterCritereGrille`, grilles.js) poussait `{ nom: 'Nouveau critère', type,
 * ponderation, description }` sans identifiant. Il travaille par index et ne voyait
 * rien. L'écran d'évaluation, la note, la cartouche, le PDF et la réouverture d'une
 * copie travaillent PAR IDENTIFIANT : quatre critères sans `id` y deviennent UN SEUL
 * (`eval_undefined`), le niveau choisi sur l'un est lu sur le premier, et les
 * jugements portés sur les trois autres ne sont jamais enregistrés.
 *
 * Deux gardes :
 *   1. la vraie fonction, extraite de `grilles.js` et exécutée : le critère ajouté
 *      porte un identifiant distinct ;
 *   2. statique, sur tout `js/grilles.js` : aucun `criteres.push({ … })` sans `id:`
 *      dans l'objet poussé — pour qu'un second éditeur ne refasse pas la même faute.
 *
 * ⚠ Tarir n'est pas réparer : ce test ne touche aucune grille existante. Le stock se
 * mesure avec `scripts/diagnostic-674-criteres-sans-id.js`, et se répare sur décision
 * de Grégoire.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const src = readFileSync(path.join(racineProjet, 'js', 'grilles.js'), 'utf8');

function elementDom() {
    return {
        value: '', textContent: '', innerHTML: '', checked: false, style: {}, dataset: {},
        classList: { add() {}, remove() {}, contains() { return false; }, toggle() { return false; } },
        closest() { return null; }, querySelector() { return null; }, querySelectorAll() { return []; },
        appendChild() {}, replaceChildren() {}, remove() {}, setAttribute() {}, getAttribute() { return null; },
        addEventListener() {}, focus() {}
    };
}

/**
 * Charge `grilles.js` (une IIFE qui exporte `window.ajouterCritereGrille`) dans le
 * bac à sable. `db.modifier` est rejoué sur une liste en mémoire ; rien n'est écrit.
 */
function monter(grilles) {
    let n = 0;
    const ecritures = [];
    let etat = grilles;   // la base en mémoire : chaque écriture nourrit la lecture suivante
    const db = {
        modifier: async (k, fn) => {
            const resultat = fn(JSON.parse(JSON.stringify(etat)));
            if (resultat !== undefined) { etat = resultat; ecritures.push({ k, v: resultat }); }
            return resultat;
        },
        getSync: (k, d) => (d !== undefined ? d : null), setSync() {}, get: async () => null, set: async () => {}
    };
    const document = {
        getElementById: () => elementDom(), querySelector: () => null, querySelectorAll: () => [],
        createElement: () => elementDom(), addEventListener() {}, removeEventListener() {},
        body: elementDom(), documentElement: elementDom()
    };
    const win = chargerScript('js/grilles.js', {
        document, db,
        cle: (k) => 'test_' + k,
        genererIdUnique: (p) => p + 'T' + (++n),
        echapperHtml: (s) => String(s == null ? '' : s),
        notifications: { succes() {}, erreur() {}, info() {}, warning() {} },
        obtenirDonneesSelonMode: () => [],
        obtenirPreference: () => null
    }, {
        addEventListener() {}, removeEventListener() {},
        // Le rendu de l'éditeur (`afficherCriteresGrille`) appelle ces deux fabriques de
        // boutons sur `window` ; elles vivent dans un autre module.
        boutonRetirerBloc: () => '', boutonsReordonnerBloc: () => ''
    });
    return { ajouter: win.ajouterCritereGrille, ecritures };
}

describe('#674 · un critère naît avec son identifiant (éditeur de grille en lignes)', () => {
    it('la vraie `ajouterCritereGrille` pousse un critère AVEC un identifiant « CR_… »', async () => {
        const { ajouter, ecritures } = monter([{ id: 'G1', nom: 'Grille', criteres: [{ id: 'CR_a', nom: 'Existant', ponderation: 50 }] }]);
        await ajouter('G1');
        expect(ecritures, 'la grille doit être réécrite une fois').toHaveLength(1);
        const criteres = ecritures[0].v.find((g) => g.id === 'G1').criteres;
        expect(criteres).toHaveLength(2);
        expect(criteres[1].nom).toBe('Nouveau critère');
        expect(criteres[1].id, 'le critère ajouté doit porter un identifiant').toMatch(/^CR_/);
        expect(criteres[1].id).not.toBe(criteres[0].id);
    });

    it('deux ajouts de suite donnent deux identifiants DISTINCTS — c\'est ce qui les rend évaluables séparément', async () => {
        const { ajouter, ecritures } = monter([{ id: 'G1', nom: 'Grille', criteres: [] }]);
        await ajouter('G1');
        await ajouter('G1');   // part de l'état réécrit par le premier
        expect(ecritures).toHaveLength(2);
        const criteres = ecritures[1].v.find((g) => g.id === 'G1').criteres;
        expect(criteres.map((c) => c.id).every((id) => typeof id === 'string' && id.startsWith('CR_'))).toBe(true);
        expect(new Set(criteres.map((c) => c.id)).size).toBe(2);
    });

    it('témoin — une grille inconnue ne fait rien écrire', async () => {
        const { ajouter, ecritures } = monter([{ id: 'G1', nom: 'Grille', criteres: [] }]);
        await ajouter('G_INCONNUE');
        expect(ecritures).toEqual([]);
    });

    it('statique — aucun `criteres.push({ … })` de grilles.js ne pousse un objet sans `id:`', () => {
        // ↻ Lot 4, C.3 (4 sept. 2026) : une naissance peut passer par `avecProjectionNeuve({ … })`,
        // qui pose « aucune projection » sur un critère algorithmique neuf — le motif l'accepte,
        // ce qu'il tient ne change pas.
        const motif = /criteres\.push\((?:avecProjectionNeuve\()?\{/g;
        const fautifs = [];
        let m;
        let compte = 0;
        while ((m = motif.exec(src)) !== null) {
            compte++;
            // L'objet poussé : de `{` à la première `})` qui le ferme.
            const debut = m.index + m[0].length - 1;
            const fin = src.indexOf('})', debut);
            const objet = src.slice(debut, fin);
            if (!/(^|[\s{,])id\s*:/.test(objet)) {
                fautifs.push(src.slice(0, m.index).split('\n').length);
            }
        }
        // Une seule naissance par objet littéral dans grilles.js (le chemin modal pousse
        // une variable déjà pourvue d'un identifiant, `sauvegarderCritere`).
        expect(compte, 'témoin : le motif doit trouver au moins une naissance de critère').toBeGreaterThanOrEqual(1);
        expect(fautifs, 'critères poussés sans identifiant aux lignes : ' + fautifs.join(', ')).toEqual([]);
    });
});
