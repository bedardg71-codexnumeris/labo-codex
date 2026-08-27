import { describe, it, expect, beforeAll } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE #542 lot 1 — A4 : « défis communs » n'est plus TOUJOURS VIDE.
//
// CE QUI EXISTAIT AVANT, ET QUE PERSONNE NE TESTAIT.
//
// `analyserSousGroupe` (`js/interventions.js`) alimente l'analyse des besoins
// communs d'un sous-groupe. Sa liste `defisCommuns` ne pouvait PAS se remplir.
// Trois causes indépendantes, qui produisaient le même silence et se masquaient
// l'une l'autre — corriger une seule n'aurait rien débloqué.
//
//   CAUSE 1 — une comparaison à `undefined`.
//     `const seuils = chargerSeuilsInterpretation();`
//     `if (score !== null && score < seuils.acceptable)`
//     `acceptable` n'est pas à la racine : elle vit sous
//     `interpretation.acceptable` (`interpretation-config.js:55`).
//     `score < undefined` est TOUJOURS faux. Même famille que #541 : une
//     comparaison qui ne lève rien et rend un verdict rassurant.
//
//   CAUSE 2 — deux unités. Les performances sont des moyennes de POURCENTAGES
//     (0-100) ; les seuils valent 0-1. `32 < 0.70` est faux, exactement comme
//     `32 < undefined`. Réparer la seule clé aurait laissé le tableau vide.
//
//   CAUSE 3 — `evaluation.criteres` lu comme un DICTIONNAIRE alors que c'est un
//     TABLEAU (`evaluation-sauvegarde.js:135`). `Object.keys` rendait
//     `['0','1','2'…]`, `performances['0']` valait `undefined`, et RIEN n'était
//     jamais collecté : toutes les moyennes valaient `null`. Le plan classait ce
//     constat « C1 » au lot 4 sans voir qu'il co-causait A4.
//
// ⮕ SUR LE SEUIL EMPLOYÉ. Le plan prescrivait `interpretation.acceptable` ; le
// correctif prend `obtenirSeuil('defiSpecifique')`. Les deux valent 0,70
// aujourd'hui — le choix ne change aucun chiffre, il change ce qui bouge le jour
// où Grégoire règle un seuil. `defiSpecifique` est LE seuil « en dessous duquel
// un critère est un défi » : c'est son rôle documenté, il est exposé dans les
// préférences, et c'est déjà celui des trois autres sites qui identifient un
// défi (`profil-etudiant-calculs.js:528, 659, 1038`). `interpretation.*` est le
// jeu A-C-M, sans UI depuis #299. On converge plutôt que de faire diverger le
// tableau de bord des profils.
//
// ⮕ CE QUI RESTE EN DUR, ET N'EST PAS CORRIGÉ ICI (lot 4, B3/B4) : les cinq
// noms de critères de Grégoire. Une autre grille ne remplit toujours rien.
// C'est mesuré ci-dessous plutôt que tu par un test complaisant.

let win;
let evaluationsEnBase = [];
let seuilDefi = 0.70;

// Une échelle « pratique » : ce que rend `convertirNiveauEnPourcentage`, sur
// 0-100. C'est la moitié du défaut — les seuils, eux, sont sur 0-1.
const POURCENTAGES = { I: 32, D: 69.5, M: 79.5, E: 92.5, '0': 0 };

beforeAll(() => {
    const stubs = {
        db: {
            get: async () => null,
            getSync: (k, defaut) => (defaut !== undefined ? defaut : null),
            set: async () => {},
            setSync: () => {}
        },
        cle: (k) => 'test_' + k,
        echapperHtml: (s) => String(s == null ? '' : s),
        obtenirDonneesSelonMode: (quoi) =>
            (quoi === 'evaluationsSauvegardees' ? evaluationsEnBase : []),
        obtenirPreference: () => null,
        obtenirEtudiantsCoursActif: () => [],
        obtenirSeuil: (chemin) => (chemin === 'defiSpecifique' ? seuilDefi : null),
        // Volontairement conforme au VRAI module : `acceptable` n'existe PAS à
        // la racine. Un stub complaisant qui la poserait ferait passer le code
        // d'avant le correctif — et la sentinelle ne servirait à rien.
        chargerSeuilsInterpretation: () => ({
            defiSpecifique: seuilDefi,
            interpretation: { excellent: 0.85, bon: 0.80, acceptable: 0.70 }
        }),
        convertirNiveauEnPourcentage: (niveau) => POURCENTAGES[String(niveau).toUpperCase()] ?? 0,
        calculerTousLesIndices: () => ({ A: 0, C: 0, P: 0 }),
        determinerNiveauRaiPedagogique: () => ({ niveau: 1, pattern: 'Stable' }),
        calculerProgressionArtefacts: () => null,
        estEtudiantExclu: () => false,
        filtrerEtudiantsParMode: (arr) => arr,
        estModeeLectureSeule: () => false
    };
    win = chargerScript('js/interventions.js', stubs);
});

// Une évaluation telle qu'elle est RÉELLEMENT sauvegardée : `criteres` est un
// tableau d'objets, jamais un dictionnaire.
function evaluation(da, niveauxParCritere) {
    return {
        etudiantDA: da,
        echelleId: 'ECH_1',
        retroactionFinale: 'texte',
        criteres: Object.keys(niveauxParCritere).map((nom, i) => ({
            critereId: 'C' + i,
            critereNom: nom,
            niveauSelectionne: niveauxParCritere[nom],
            ponderation: 20
        }))
    };
}

describe('#542 A4 · les défis communs d\'un sous-groupe se comptent vraiment', () => {

    it('un élève faible sur tous ses critères produit CINQ défis — le cas qui rendait vide', () => {
        // AVANT le correctif : `{}`. Trois fois plutôt qu'une.
        evaluationsEnBase = [evaluation('111', {
            'Structure': 'I', 'Rigueur': 'I', 'Plausibilité': 'I', 'Nuance': 'I', 'Français': 'I'
        })];

        const analyse = win.analyserSousGroupe(['111']);

        expect(analyse.defisCommuns).not.toEqual({});
        expect(analyse.defisCommuns).toEqual({
            'Structure': 1, 'Rigueur': 1, 'Plausibilité': 1, 'Nuance': 1, 'Français': 1
        });
    });

    it('un élève qui maîtrise n\'a AUCUN défi — le correctif ne crée pas de faux positifs', () => {
        evaluationsEnBase = [evaluation('111', {
            'Structure': 'M', 'Rigueur': 'E', 'Plausibilité': 'M', 'Nuance': 'E', 'Français': 'M'
        })];
        expect(win.analyserSousGroupe(['111']).defisCommuns).toEqual({});
    });

    it('le seuil discrimine : « D » (69,5 %) est un défi, « M » (79,5 %) n\'en est pas un', () => {
        evaluationsEnBase = [evaluation('111', {
            'Structure': 'D', 'Rigueur': 'M', 'Plausibilité': 'D', 'Nuance': 'M', 'Français': 'E'
        })];
        expect(win.analyserSousGroupe(['111']).defisCommuns).toEqual({
            'Structure': 1, 'Plausibilité': 1
        });
    });

    it('le seuil est CONFIGURABLE : le déplacer déplace les défis', () => {
        // La règle d'or du projet : aucune valeur métier en dur. Si 0,70
        // revenait dans le corps de la fonction, ce test le dirait.
        evaluationsEnBase = [evaluation('111', {
            'Structure': 'D', 'Rigueur': 'M', 'Plausibilité': 'E', 'Nuance': 'M', 'Français': 'M'
        })];

        seuilDefi = 0.85; // exigence relevée : « M » à 79,5 % devient un défi
        expect(win.analyserSousGroupe(['111']).defisCommuns).toEqual({
            'Structure': 1, 'Rigueur': 1, 'Nuance': 1, 'Français': 1
        });

        seuilDefi = 0.30; // exigence abaissée : plus rien n'est un défi
        expect(win.analyserSousGroupe(['111']).defisCommuns).toEqual({});

        seuilDefi = 0.70;
    });

    it('les défis s\'ADDITIONNENT sur le sous-groupe — c\'est ce que « commun » veut dire', () => {
        evaluationsEnBase = [
            evaluation('111', { 'Structure': 'I', 'Rigueur': 'M', 'Plausibilité': 'M', 'Nuance': 'M', 'Français': 'M' }),
            evaluation('222', { 'Structure': 'I', 'Rigueur': 'I', 'Plausibilité': 'M', 'Nuance': 'M', 'Français': 'M' }),
            evaluation('333', { 'Structure': 'M', 'Rigueur': 'M', 'Plausibilité': 'M', 'Nuance': 'M', 'Français': 'M' })
        ];
        const analyse = win.analyserSousGroupe(['111', '222', '333']);
        expect(analyse.nbEtudiants).toBe(3);
        expect(analyse.defisCommuns).toEqual({ 'Structure': 2, 'Rigueur': 1 });
    });

    it('plusieurs évaluations d\'un même élève sont MOYENNÉES, pas empilées', () => {
        // Un « I » (32 %) et un « E » (92,5 %) font 62,25 % : sous le seuil,
        // donc un défi — compté UNE fois, parce que c'est un élève.
        evaluationsEnBase = [
            evaluation('111', { 'Structure': 'I', 'Rigueur': 'M', 'Plausibilité': 'M', 'Nuance': 'M', 'Français': 'M' }),
            evaluation('111', { 'Structure': 'E', 'Rigueur': 'M', 'Plausibilité': 'M', 'Nuance': 'M', 'Français': 'M' })
        ];
        expect(win.analyserSousGroupe(['111']).defisCommuns).toEqual({ 'Structure': 1 });
    });

    it('`criteres` est lu comme un TABLEAU : la forme réellement sauvegardée', () => {
        // Le cœur de la cause 3. Sur le code d'avant, `Object.keys` rendait des
        // INDICES et rien n'était jamais collecté — donc `{}`, quel que soit le
        // seuil. Ce test échouerait mot pour mot avant le 27 août 2026.
        evaluationsEnBase = [{
            etudiantDA: '111',
            echelleId: 'ECH_1',
            retroactionFinale: 'texte',
            criteres: [
                { critereId: 'C0', critereNom: 'Structure', niveauSelectionne: 'I', ponderation: 20 }
            ]
        }];
        expect(win.analyserSousGroupe(['111']).defisCommuns).toEqual({ 'Structure': 1 });
    });

    it('accents et casse ne font pas échouer la correspondance', () => {
        // « Plausibilite » sans accent, « FRANÇAIS » en capitales : la
        // normalisation est la même que celle de `calculerMoyennesCriteres`.
        evaluationsEnBase = [evaluation('111', {
            'plausibilite': 'I', 'FRANÇAIS': 'I'
        })];
        expect(win.analyserSousGroupe(['111']).defisCommuns).toEqual({
            'Plausibilité': 1, 'Français': 1
        });
    });

    it('un niveau vide ou absent est IGNORÉ, il ne compte pas comme 0', () => {
        evaluationsEnBase = [{
            etudiantDA: '111',
            echelleId: 'ECH_1',
            retroactionFinale: 'texte',
            criteres: [
                { critereNom: 'Structure', niveauSelectionne: '' },
                { critereNom: 'Rigueur', niveauSelectionne: null },
                { critereNom: 'Nuance', niveauSelectionne: 'M' }
            ]
        }];
        // Aucun défi : les deux premiers n'ont pas de niveau, le troisième est
        // maîtrisé. Un vide traité comme un 0 aurait produit deux faux défis.
        expect(win.analyserSousGroupe(['111']).defisCommuns).toEqual({});
    });

    it('une évaluation SANS rétroaction finale n\'entre pas dans le calcul', () => {
        evaluationsEnBase = [
            Object.assign(evaluation('111', { 'Structure': 'I' }), { retroactionFinale: '' })
        ];
        expect(win.analyserSousGroupe(['111']).defisCommuns).toEqual({});
    });

    it('CONSTAT MESURÉ, PAS CORRIGÉ (lot 4, B3/B4) : une autre grille ne remplit rien', () => {
        // Les cinq clés de `performances` sont les critères de Grégoire, en dur.
        // Un utilisateur avec une grille « Analyse / Synthèse » n'obtient aucun
        // défi commun — et ce n'est PAS le correctif A4 qui doit le régler.
        // Ce test verrouille l'état connu : le jour où le lot 4 le corrige, il
        // devient rouge, et c'est le signal attendu.
        evaluationsEnBase = [evaluation('111', { 'Analyse': 'I', 'Synthèse': 'I' })];
        expect(win.analyserSousGroupe(['111']).defisCommuns).toEqual({});
    });
});
