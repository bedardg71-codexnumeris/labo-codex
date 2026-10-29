import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mesurerDepot, mesurerSource, figer, resumer, NON_ANALYSABLES_ATTENDUS } from './_helpers/complexite.js';

// =====================================================================
// CONTENIR LA COMPLEXITÉ (lot 24, 12 oct. 2026) — plans de travail/PLAN-contenir-la-complexite.md
// =====================================================================
// Empêcher la complexité de remonter pendant qu'on la réduit. Mesure : complexite.js (définition
// d'ESLint 8.57, celle de mai). Relevé sur main à la fin du lot 23 : 204 fichiers, 12 962
// fonctions, 455 au-dessus de 15, 89 au-dessus de 30, maximum 130 (`executerImportSelectif`).
// (La référence de mai comptait aussi js/_archives/entites-ui.js, que l'application ne charge pas :
// 53 fonctions, 2 au-dessus de 15. Sur 1.198.0, avec lui, la mesure retrouve exactement 13 240 /
// 465 / 91 / 130.)
//
// BLOQUANT
//   1. Aucune fonction NEUVE au-dessus de 30 ; les existantes sont figées une à une
//      (tests/fixtures/cliquets/complexite-fonctions-30.json) et ne peuvent que descendre.
//   2. Le nombre de fonctions au-dessus de 15 ne peut que descendre.
// LA LISTE SUIT LE CODE (comme sentinelle-858) : une fonction qui descend, ou qui passe sous 30,
// fait rougir tant que la liste n'est pas abaissée — sinon le cliquet ne cliquerait jamais.
// UNE HAUSSE ASSUMÉE s'écrit : relever la valeur dans la liste, ET ajouter ici une ligne à
// HAUSSES_ASSUMEES qui dit pourquoi. La croissance devient une décision visible dans le diff.
//
// NON BLOQUANT : la taille des fichiers (plus de 1 000 lignes de code) et la somme des complexités
// au-dessus de 15 — imprimées par `node tests/unit/_helpers/complexite.js`. Si le compte au-dessus
// de 15 baisse et que la somme ne bouge pas, la complexité a été déplacée, pas réduite.

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const FIGE = JSON.parse(readFileSync(path.join(racine, 'tests', 'fixtures', 'cliquets', 'complexite-fonctions-30.json'), 'utf8'));
const AU_DESSUS_DE_15 = 445;   // #1182 (29 oct. 2026) : −1, la fusion copie par copie — `_resoudreConflits` (23), `_fusionnerTravaux` (19) et `actionFusionner` (26) passent sous 16, `_valeurApresFusion` et `_nommerElement` (18) entrent ; l'ancienne `_analyserFusion` (56) devient la neuve (29), `chargerCodex` 83 → 77 (le snapshot de référence parti) · étape 4a du critère algorithmique (27 oct. 2026) : −1, le registre des calculs lit ses paramètres par `_valeurParam` (l'anonyme de `normaliser`, 16, passe sous 15) ; l'évaluateur neuf est coupé en fonctions sous 15 ; `calculerNoteAlgorithmiqueSimple` 21 → 19 (la garde `utiliseMots` partie) · #1151 (24 oct. 2026) : −2, `afficherProfilComplet` (32) délègue la rangée à `_rendreRangeeProfil`, `changerSectionProfil` perd son `switch` pour la table `SECTIONS_PROFIL` · #1148 (24 oct. 2026) : −1, `afficherSyntheseGroupeCours` (18, sans appelant) part avec les synthèses de la barre latérale du Cadre · #1147 (24 oct. 2026) : −2, `genererBadgeCaracteristiques` part avec la barre latérale, `chargerProductionPourModif` passe sous 15 (son surlignage devient `MenuSelection.marquer`) · le verrou dans la palette Annotation (24 oct. 2026) : le déverrouillage sort de `basculerVerrouillageEvaluationCourante` en noyau partagé (`_deverrouillerEvaluation`) — complexité déplacée, pas réduite · étape 2a (22 oct. 2026) : `construireConcentration` 16 → 15, ses accords passent par `nombreEtNom` · #1055 (15 oct. 2026) : creerNouvelleProduction passe par la remise à neuf commune
const M = mesurerDepot(racine);   // une seule mesure pour tout le banc (≈ 0,5 s)

/** « fichier : nom » → raison. Vide au relevé du 12 oct. 2026. */
const HAUSSES_ASSUMEES = {
    // Le type de schéma `tablesCas` : un `case` d'une ligne, qui délègue à `_assainirTablesCas` (le registre des tables
    // de cas écarte une table illisible ; le type `array` aurait coercé une borne illisible en 0). +1, le minimum.
    'js/import-export.js : assainirObjet': 'lot 3b de la table de cas (26 oct. 2026) : 43 → 44, le type `tablesCas`',
    // La garde du groupe-cours qui naît sans ses élèves : un `if` d'une ligne, qui délègue à
    // `_groupeSansSesElevesAccepteV2` (la question, « Annuler » qui remet la fiche). +1, le minimum.
    'js/trimestre-v2-groupes-cours.js : sauvegarderGroupeCoursV2': '#1038 (26 oct. 2026) : 33 → 34, la garde du groupe-cours sans ses élèves',
    // La cause d'une note Standards qui manque rejoint `erreur` (`erreurConfiguration || causeNoteAbsente`) ; la cause, la
    // formule et les copies remplacées sortent en fonctions (`_causeNoteAbsenteStd`, `_formuleRecitStd`,
    // `_copiesRemplaceesDuPoolStd`). +1, le minimum.
    'js/profil-etudiant-actions.js : calculerDetailsNoteFinale': 'lot 1 des standards sans portfolio (28 oct. 2026) : 48 → 49, la cause dans `erreur`'
};

/** Compare deux relevés { fichier: { nom: cyc | [cyc…] } } : hausses, neuves, baisses (à reporter). */
function comparer(fige, mesure) {
    const hausses = [], neuves = [], baisses = [];
    const liste = (v) => (Array.isArray(v) ? v : [v]);
    for (const [f, noms] of Object.entries(mesure)) {
        for (const [nom, v] of Object.entries(noms)) {
            const actuelles = liste(v), figees = fige[f] && fige[f][nom] !== undefined ? liste(fige[f][nom]) : [];
            actuelles.forEach((c, i) => {
                if (i >= figees.length) neuves.push(`${f} : ${nom} (${c})`);
                else if (c > figees[i]) hausses.push(`${f} : ${nom} ${figees[i]} → ${c}`);
                else if (c < figees[i]) baisses.push(`${f} : ${nom} ${figees[i]} → ${c}`);
            });
            figees.slice(actuelles.length).forEach((c) => baisses.push(`${f} : ${nom} ${c} → sous 31 (ou partie)`));
        }
    }
    for (const [f, noms] of Object.entries(fige)) {
        for (const [nom, v] of Object.entries(noms)) {
            if (!mesure[f] || mesure[f][nom] === undefined) liste(v).forEach((c) => baisses.push(`${f} : ${nom} ${c} → sous 31 (ou partie)`));
        }
    }
    return { hausses, neuves, baisses };
}

describe('Contenir · garde-fous de la mesure (règle 10 du PROTOCOLE)', () => {
    const m = M;
    it('la mesure a lu tout js/ : plus de 200 fichiers, plus de 10 000 fonctions', () => {
        expect(m.fichiers).toBeGreaterThan(200);
        expect(m.fonctions.length).toBeGreaterThan(10000);
    });
    it('les seuls fichiers non analysables sont ceux qu\'on nomme (un fichier illisible ne sort pas en silence)', () => {
        expect(m.nonAnalysables).toEqual(NON_ANALYSABLES_ATTENDUS);
    });
});

describe('Contenir · règle 1 — aucune fonction neuve au-dessus de 30 ; les figées ne montent pas', () => {
    const { hausses, neuves, baisses } = comparer(FIGE, figer(M));
    it('aucune fonction NEUVE au-dessus de 30 (extraire plutôt qu\'ajouter une branche)', () => {
        expect(neuves).toEqual([]);
    });
    it('aucune fonction figée ne monte sans que sa hausse soit écrite (relever la liste ET HAUSSES_ASSUMEES)', () => {
        expect(hausses).toEqual([]);
    });
    it('la liste suit le code : une fonction qui descend ou passe sous 31 est reportée', () => {
        expect(baisses).toEqual([]);
    });
});

describe('Contenir · règle 2 — le nombre de fonctions au-dessus de 15 ne monte pas', () => {
    const r = resumer(M);
    it(`au plus ${AU_DESSUS_DE_15}, et le compte figé suit le code quand il descend`, () => {
        expect(r.auDessusDe15).toBe(AU_DESSUS_DE_15);
    });
});

describe('Contenir · TÉMOINS — la définition est celle d\'ESLint 8.57', () => {
    it('chaque point de décision compte une fois ; une fonction imbriquée est mesurée à part', () => {
        const src = `function f(a, b = 1) {
            if (a) {} else if (b) {}
            const c = a ? 1 : 2;
            const d = (a && b || c) ?? 0;
            for (;;) { break; } for (const x in a) {} for (const x of a) {}
            while (a) { a--; } do { b--; } while (b);
            try {} catch (e) {}
            switch (a) { case 1: break; case 2: break; default: break; }
            a ||= 1; b &&= 2; c ??= 3;
            const g = () => { if (a) {} };
            return a?.b?.c;
        }`;
        const [f, g] = mesurerSource(src);
        // 1 + if×2 + ?:×1 + logiques×3 + boucles×3 + while/do×2 + catch×1 + case×2 + affectations×3 = 18
        expect(f).toMatchObject({ nom: 'f', cyc: 18 });
        expect(g).toMatchObject({ nom: 'g', cyc: 2 });
    });
    it('une fonction à 31 est vue au-dessus de 30, avec son nom d\'affectation', () => {
        const src = 'window.trop = function () {\n' + Array.from({ length: 30 }, (_, i) => `    if (x === ${i}) {}`).join('\n') + '\n};';
        const [f] = mesurerSource(src);
        expect(f).toMatchObject({ nom: 'trop', cyc: 31 });
        const fige = {}, mesure = { 'js/banc.js': { trop: 31 } };
        expect(comparer(fige, mesure).neuves).toEqual(['js/banc.js : trop (31)']);
    });
    it('une figée qui monte est une hausse ; une figée qui descend doit être reportée', () => {
        const fige = { 'js/a.js': { f: 40, '(anonyme)': [35, 32] } };
        expect(comparer(fige, { 'js/a.js': { f: 41, '(anonyme)': [35, 32] } }).hausses).toEqual(['js/a.js : f 40 → 41']);
        expect(comparer(fige, { 'js/a.js': { f: 39, '(anonyme)': [35] } }).baisses)
            .toEqual(['js/a.js : f 40 → 39', 'js/a.js : (anonyme) 32 → sous 31 (ou partie)']);
    });
});

describe('Contenir · les hausses assumées ont une raison', () => {
    it('chaque entrée de HAUSSES_ASSUMEES nomme une fonction figée, et dit pourquoi', () => {
        for (const [cle, raison] of Object.entries(HAUSSES_ASSUMEES)) {
            const [f, nom] = cle.split(' : ');
            expect(FIGE[f] && FIGE[f][nom] !== undefined, cle).toBe(true);
            expect(String(raison).length, cle).toBeGreaterThan(20);
        }
    });
});
