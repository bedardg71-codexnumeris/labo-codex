import { describe, it, expect, beforeAll } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// CONSTAT #552 — LA CIBLE D'INTERVENTION D'UN ÉLÈVE EN DIFFICULTÉ EN STRUCTURE
// EST DÉCIDÉE PAR SA MOYENNE EN FRANÇAIS.
//
// ⚠ CE FICHIER EST UN CONSTAT, PAS UNE SENTINELLE. Il ne protège pas un
// correctif : il ÉTABLIT un défaut, pour qu'on cesse d'en discuter par lecture
// de code. Ses attentes décrivent le comportement ACTUEL, celui qu'on juge
// mauvais. Quand #552 sera corrigé, ce fichier doit être RÉÉCRIT — pas
// supprimé, réécrit : les deux cas qu'il monte restent exactement ceux qu'une
// correction doit départager.
//
// CE QUI EST MESURÉ. `determinerCibleIntervention` (`profil-etudiant-calculs.js`)
// calcule `const I = indices3Derniers.francaisMoyen` et le passe à ses QUATRE
// résolveurs de cibles. `I` est un POURCENTAGE 0-100 (`score * 100`), mais les
// seuils comparés sont 17, 18, 20, 21, 25, 27.
//
// ⮕ GRÉGOIRE, LE 27 AOÛT 2026 : « La pondération a déjà été sur 30, ensuite elle
// a été sur 20 à l'H26. » Ce sont donc des NOTES BRUTES sur 30 : 17/30 = 57 %
// (seuil d'échec), 20/30 = 67 %, 27/30 = 90 %. Deux fois périmées — mauvaise
// unité, et calibrées sur une pondération abandonnée.
//
// ⮕ ET UN SECOND DÉFAUT, INDÉPENDANT DE L'UNITÉ : `I` est la moyenne du
// FRANÇAIS, mais elle conditionne les cibles de TOUS les critères
// (`N === 'Structure' && I <= 17`). Il resterait même avec des seuils justes.
//
// LE MONTAGE. Deux élèves dont TOUT est identique — mêmes notes finales, donc
// même performance, donc même pattern ; même Structure au plus bas, donc même
// défi principal. Une seule différence : le niveau de leur critère de langue.
//
// ⚠ POURQUOI `noteFinale` EST FIXÉE ET NON DÉRIVÉE DES CRITÈRES. La performance
// se calcule `somme(noteFinale) / n / 100` — elle ne passe pas par les critères.
// C'est ce qui permet de faire varier le français SANS déplacer le pattern :
// sans cela, les deux cas différeraient par deux causes et la mesure ne
// prouverait rien.
//
// ⚠ ÉCHELLE W/X/Y/Z, JAMAIS A/B/C/D. Le « D » d'A/B/C/D est aussi celui d'IDME,
// et un test qui l'emploie rougit sur son propre fixture. Règle du projet,
// posée au pas 3c-1 de #542.

const ECHELLE = {
    id: 'ECH_552',
    nom: 'Échelle W/X/Y/Z',
    niveaux: [
        { code: 'W', nom: 'Amorce', valeurCalcul: 10 },
        { code: 'X', nom: 'Progression', valeurCalcul: 15 },
        { code: 'Y', nom: 'Consolidé', valeurCalcul: 60 },
        { code: 'Z', nom: 'Rayonnant', valeurCalcul: 90 }
    ]
};

const GRILLE = {
    id: 'GR_552',
    nom: 'Grille de constat',
    criteres: [
        { id: 'c1', nom: 'Structure', ponderation: 40 },
        { id: 'c2', nom: 'Rigueur', ponderation: 40 },
        { id: 'c3', nom: 'Français écrit', ponderation: 20 }
    ]
};

const PRODUCTIONS = [
    { id: 'p1', type: 'artefact-portfolio' },
    { id: 'p2', type: 'artefact-portfolio' },
    { id: 'p3', type: 'artefact-portfolio' }
];

// Trois évaluations identiques à une chose près : le niveau du critère de langue.
function evaluationsAvecLangue(niveauLangue) {
    return PRODUCTIONS.map((p, i) => ({
        id: 'ev' + i,
        etudiantDA: 'TEST552',
        productionId: p.id,
        echelleId: ECHELLE.id,
        // 55 % : sous le seuil `idme.insuffisant` (0,64), donc pattern
        // « Difficulté persistante » dans les DEUX cas. C'est l'invariant du
        // montage.
        noteFinale: 55,
        niveauFinal: 'W',
        retroactionFinale: 'texte présent',   // exigé par calculerMoyennesCriteresRecents
        dateEvaluation: '2026-0' + (i + 1) + '-15',
        criteres: [
            { critereNom: 'Structure', niveauSelectionne: 'W' },      // 0,10 — le plus bas, donc le défi principal
            { critereNom: 'Rigueur', niveauSelectionne: 'Y' },        // 0,60
            { critereNom: 'Français écrit', niveauSelectionne: niveauLangue }
        ]
    }));
}

let win;
let evaluationsCourantes = [];

beforeAll(() => {
    const stubs = {
        db: {
            get: async () => null,
            getSync: (k, defaut) => {
                if (k === 'test_echellesTemplates') return [ECHELLE];
                if (k === 'test_grillesTemplates') return [GRILLE];
                return defaut !== undefined ? defaut : null;
            },
            set: async () => {},
            setSync: () => {}
        },
        cle: (k) => 'test_' + k,
        echapperHtml: (s) => String(s == null ? '' : s),
        obtenirDonneesSelonMode: (k) => {
            if (k === 'evaluationsSauvegardees') return evaluationsCourantes;
            if (k === 'productions') return PRODUCTIONS;
            return [];
        },
        obtenirPreference: (k) => (k === 'grilleReferenceDepistage' ? 'GR_552' : null),
        definirPreference: () => {},
        obtenirTypePratiqueActive: () => 'standards',
        // Mobilisation franche : ni décrochage, ni « fragile », pour que la
        // cible vienne des résolveurs et non d'un court-circuit en amont.
        calculerTousLesIndices: () => ({ A: 90, C: 90, P: 55, M: 0, E: 0 }),
        obtenirSeuil: (chemin) => ({
            'defiSpecifique': 0.75,
            'idme.insuffisant': 0.64,
            'idme.developpement': 0.75
        })[chemin],
        chargerSeuilsInterpretation: () => ({}),
        obtenirEtudiantsCoursActif: () => [],
        afficherNotificationCopiee: () => {},
        afficherSection: () => {},
        afficherSousSection: () => {},
        estEtudiantExclu: () => false,
        filtrerEtudiantsParMode: (arr) => arr,
        estModeeLectureSeule: () => false,
        genererSeancesCompletes: () => {},
        calculerEtSauvegarderIndicesAssiduite: () => {},
        calculerEtStockerIndicesCP: () => {}
    };
    win = chargerScript('js/profil-etudiant-helpers.js', stubs);
    // ⚠ LES EXPORTS DE `helpers.js` REPASSÉS EN GLOBAUX. Le sandbox de
    // `chargerScript` évalue chaque module dans sa propre `new Function` : les
    // fonctions de helpers.js ne sont PAS dans le scope lexical de calculs.js,
    // qui les appelle pourtant par leur nom nu (`obtenirNombreProductionsPourPatterns`,
    // `obtenirGrilleReferenceDepistage`, `interpreterMobilisation`…). Sans ce
    // ré-injection, le test échoue en ReferenceError sur la PREMIÈRE d'entre
    // elles et n'atteint jamais ce qu'il mesure.
    chargerScript('js/profil-etudiant-calculs.js', { ...stubs, ...win }, win);
});

describe('#552 · la cible d\'intervention est pilotée par la moyenne en français', () => {

    it('GARDE ANTI-SILENCE · le montage produit bien le même pattern et le même défi dans les deux cas', () => {
        // Sans cette garde, deux cibles différentes pourraient venir d'un
        // pattern différent, et le test « prouverait » un défaut qui n'est pas
        // celui qu'on mesure. C'est le piège nommé au pas 3c-1 de #542 : un
        // montage qui rate sa cible rend un test vert qui n'a rien exercé.
        for (const niveauLangue of ['X', 'Y']) {
            evaluationsCourantes = evaluationsAvecLangue(niveauLangue);

            const indices = win.calculerIndicesNDerniersArtefacts('TEST552', true);
            expect(indices.nbArtefacts, 'les trois évaluations doivent être vues').toBe(3);
            expect(indices.performance, 'la performance doit rester à 0,55 — sous le seuil « insuffisant »')
                .toBeCloseTo(0.55, 5);

            const moyennes = win.calculerMoyennesCriteresRecents('TEST552');
            expect(moyennes, 'le calcul des moyennes par critère doit aboutir').not.toBeNull();

            const diagnostic = win.diagnostiquerForcesChallenges(moyennes);
            expect(diagnostic.principalDefi, 'un défi principal doit être identifié').not.toBeNull();
            expect(diagnostic.principalDefi.nom, 'le défi principal doit être Structure dans les DEUX cas')
                .toBe('Structure');
        }
    });

    it('LE CONSTAT · français faible → RàI 3 avec CAF ; français correct → RàI 1 « à clarifier »', () => {
        // Cas A — langue au niveau X (0,15) : `francaisMoyen` vaut 15, donc
        // `I <= 17` est vrai et la branche Structure de « difficulté
        // persistante » répond.
        evaluationsCourantes = evaluationsAvecLangue('X');
        const cibleLangueFaible = win.determinerCibleIntervention('TEST552');

        // Cas B — langue au niveau Y (0,60) : `francaisMoyen` vaut 60. AUCUNE
        // bande ne matche (elles s'arrêtent à 27), le résolveur rend `null`, et
        // l'élève tombe dans le repli générique de fin de fonction.
        evaluationsCourantes = evaluationsAvecLangue('Y');
        const cibleLangueCorrecte = win.determinerCibleIntervention('TEST552');

        // ⮕ MÊME ÉLÈVE, MÊME DIFFICULTÉ, MÊME PATTERN — DEUX CIBLES.
        expect(cibleLangueFaible.pattern, 'le pattern doit être identique des deux côtés')
            .toBe(cibleLangueCorrecte.pattern);
        expect(cibleLangueFaible.pattern).toBe('Difficulté persistante');

        expect(cibleLangueFaible.niveau, 'français faible : intervention intensive').toBe(3);
        expect(cibleLangueFaible.cible).toContain('Structure');
        expect(cibleLangueFaible.cible).toContain('CAF');

        expect(cibleLangueCorrecte.niveau, 'français correct : l\'élève retombe au niveau le plus léger').toBe(1);
        expect(cibleLangueCorrecte.cible, 'et sa difficulté en Structure n\'est plus nommée du tout')
            .not.toContain('Structure');

        // ⮕ L'ASSERTION QUI PORTE LE CONSTAT : les deux ne sont pas seulement
        // différentes, elles sont OPPOSÉES en intensité — 3 contre 1.
        expect(cibleLangueFaible.niveau).toBeGreaterThan(cibleLangueCorrecte.niveau);
    });

    it('LA CAUSE · seule la moyenne du critère de langue a changé entre les deux cas', () => {
        evaluationsCourantes = evaluationsAvecLangue('X');
        const bas = win.calculerIndicesNDerniersArtefacts('TEST552', true);

        evaluationsCourantes = evaluationsAvecLangue('Y');
        const haut = win.calculerIndicesNDerniersArtefacts('TEST552', true);

        expect(bas.francaisMoyen, 'niveau X → 15 % — sous la borne 17').toBeCloseTo(15, 5);
        expect(haut.francaisMoyen, 'niveau Y → 60 % — au-dessus de TOUTES les bandes (max 27)').toBeCloseTo(60, 5);

        // Et tout le reste est identique : c'est ce qui fait de `francaisMoyen`
        // la seule variable explicative.
        expect(bas.performance).toBeCloseTo(haut.performance, 5);
        expect(bas.idmeMoyen).toBeCloseTo(haut.idmeMoyen, 5);
        expect(bas.nbArtefacts).toBe(haut.nbArtefacts);
    });

    it('L\'UNITÉ · aucune note réelle sur 20 ne peut plus atteindre la bande haute 21-27', () => {
        // Grégoire note le critère de langue sur 20 depuis H2026. Exprimée en
        // pourcentage, une note sur 20 vaut de 0 à 100 — mais les bandes du
        // code s'arrêtent à 27, et rien entre 28 et 100 n'est prévu. La bande
        // « 21 à 27 » ne peut donc être atteinte que par un élève entre 21 %
        // et 27 %, c'est-à-dire en échec franc — alors qu'elle décrit, dans le
        // code, la situation la MOINS grave des trois.
        evaluationsCourantes = evaluationsAvecLangue('Z');   // 90 %
        const excellent = win.calculerIndicesNDerniersArtefacts('TEST552', true);
        expect(excellent.francaisMoyen, 'un élève excellent en langue est à 90, très au-delà de 27')
            .toBeCloseTo(90, 5);

        const cible = win.determinerCibleIntervention('TEST552');
        expect(cible.niveau, 'et il reçoit le même repli générique que celui à 60 %').toBe(1);
    });
});
