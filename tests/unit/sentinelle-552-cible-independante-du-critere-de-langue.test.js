import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { chargerScript } from './_helpers/charger-script.js';
import { chargerPredicatsCopie } from './_helpers/predicats-copie.js';   // lot A (16 sept. 2026) : les deux prédicats réels du registre

// SENTINELLE #552 · #535 · #537 — LA CIBLE D'INTERVENTION NE VIENT PLUS NI DE LA
// MOYENNE EN LANGUE, NI DU NOM D'UN CRITÈRE, NI D'UN SEUIL ÉCRIT DANS LE CODE.
//
// ⚠ CE FICHIER ÉTAIT UN CONSTAT (`constat-552-cible-rai-pilotee-par-le-francais`).
// Il a été RÉÉCRIT le 27 août 2026, pas supprimé : le montage qu'il porte reste
// exactement celui qu'une correction devait départager, et c'est lui qui prouve
// maintenant qu'elle tient. Son nom a suivi — un fichier qui affirme « pilotée
// par le français » alors qu'il prouve l'inverse est un mauvais libellé sur un
// contenu juste.
//
// LE DÉFAUT, tel qu'il vivait jusqu'au 27 août. `determinerCibleIntervention`
// calculait `const I = indices3Derniers.francaisMoyen` et le passait à QUATRE
// résolveurs de cibles, où il conditionnait les branches de TOUS les critères :
//     if (N === 'Structure' && I <= 17) { … }        // I = la moyenne en LANGUE
// `I` est un pourcentage 0-100 ; les seuils 17 / 18 / 20 / 21 / 25 / 27 sont des
// notes brutes sur 30, calibrées sur une pondération abandonnée à H2026. Deux
// fois périmées, et appliquées à des critères qui n'ont rien à voir avec la langue.
//
// CE QUI EST TENU MAINTENANT :
//   1. Trois élèves identiques en tout sauf leur note de langue reçoivent la
//      MÊME intensité, et leur difficulté réelle est nommée dans les trois cas.
//   2. Aucun nom de critère de Grégoire, aucun des six seuils, aucun vocabulaire
//      d'intervention ne subsiste dans le code de la cible.
//   3. Une grille qui ne ressemble en rien à la sienne produit une cible
//      complète — c'est la moitié #535/#537 du chantier.
//   4. Le niveau SOLO affiché est celui que l'utilisateur a CONFIGURÉ sur son
//      critère, pas un niveau deviné depuis son nom.
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

// La grille de Grégoire — celle qui porte le critère de langue.
const GRILLE_LANGUE = {
    id: 'GR_552',
    nom: 'Grille de constat',
    criteres: [
        { id: 'c1', nom: 'Structure', ponderation: 40 },
        { id: 'c2', nom: 'Rigueur', ponderation: 40 },
        { id: 'c3', nom: 'Français écrit', ponderation: 20 }
    ]
};

// Une grille qui ne ressemble en rien à la sienne : aucun critère commun, aucun
// critère de langue, et un niveau SOLO configuré qui n'est pas le défaut.
const GRILLE_ETRANGERE = {
    id: 'GR_552_ETR',
    nom: 'Grille d\'un autre programme',
    criteres: [
        { id: 'e1', nom: 'Méthode', ponderation: 20, niveauSOLO: 'relationnel' },
        { id: 'e2', nom: 'Résultats', ponderation: 40, niveauSOLO: 'multistructurel' },
        { id: 'e3', nom: 'Discussion', ponderation: 40, niveauSOLO: 'multistructurel' }
    ]
};

const PRODUCTIONS = [
    { id: 'p1', type: 'artefact-portfolio' },
    { id: 'p2', type: 'artefact-portfolio' },
    { id: 'p3', type: 'artefact-portfolio' }
];

// Trois évaluations identiques, dont les niveaux par critère sont fournis.
// ⚠ `noteFinale` est FIXÉE et non dérivée des critères : la performance se
// calcule `somme(noteFinale) / n / 100` et ne passe pas par eux. C'est ce qui
// permet de faire varier un critère SANS déplacer le pattern — sans cela, deux
// cas différeraient par deux causes et la mesure ne prouverait rien.
function evaluations(niveauxParCritere) {
    return PRODUCTIONS.map((p, i) => ({
        id: 'ev' + i,
        etudiantDA: 'TEST552',
        productionId: p.id,
        echelleId: ECHELLE.id,
        noteFinale: 55,
        niveauFinal: 'W',
        retroactionFinale: 'texte présent',   // exigé par calculerMoyennesCriteresRecents
        dateEvaluation: '2026-0' + (i + 1) + '-15',
        criteres: Object.keys(niveauxParCritere).map((nom) => ({
            critereNom: nom,
            niveauSelectionne: niveauxParCritere[nom]
        }))
    }));
}

// Le montage de langue : Structure au plus bas dans les trois cas, seule la
// langue bouge.
function evaluationsAvecLangue(niveauLangue) {
    return evaluations({ 'Structure': 'W', 'Rigueur': 'Y', 'Français écrit': niveauLangue });
}

const racine = path.resolve(process.cwd(), '..');

function lireCodeSansCommentaires(chemin) {
    const brut = fs.readFileSync(path.join(racine, chemin), 'utf8');
    const sansBlocs = brut.replace(/\/\*[\s\S]*?\*\//g, '');
    return sansBlocs
        .split('\n')
        .filter((ligne) => !/^\s*\/\//.test(ligne))
        .join('\n');
}

let win;
let grilleCourante = GRILLE_LANGUE;
let evaluationsCourantes = [];

beforeAll(() => {
    const stubs = {
        db: {
            get: async () => null,
            getSync: (k, defaut) => {
                if (k === 'test_echellesTemplates') return [ECHELLE];
                if (k === 'test_grillesTemplates') return [GRILLE_LANGUE, GRILLE_ETRANGERE];
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
        obtenirPreference: (k) => (k === 'grilleReferenceDepistage' ? grilleCourante.id : null),
        definirPreference: () => {},
        obtenirTypePratiqueActive: () => 'standards',
        // Mobilisation franche : ni décrochage, ni « critique », pour que la
        // cible vienne du dépistage et non d'un court-circuit en amont.
        calculerTousLesIndices: () => ({ A: 90, C: 90, P: 55, M: 0, E: 0 }),
        obtenirSeuil: (chemin) => ({
            'defiSpecifique': 0.75
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
    // 30 oct. 2026 : la note de passage, seule borne d'une échelle sans repères (celle du banc), vit dans interpretation-config.js.
    chargerScript('js/interpretation-config.js', stubs, win);
    // #821 lot A (10 sept. 2026) : `interpreterMobilisation`, que calculs.js appelle,
    // vit dans contexte-qualification.js — chargé dans le même sandbox, avant calculs.
    chargerScript('js/contexte-qualification.js', stubs, win);
    // ⚠ LES EXPORTS DE `helpers.js` REPASSÉS EN GLOBAUX. Le sandbox de
    // `chargerScript` évalue chaque module dans sa propre `new Function` : les
    // fonctions de helpers.js ne sont PAS dans le scope lexical de calculs.js,
    // qui les appelle pourtant par leur nom nu (`obtenirNombreProductionsPourPatterns`,
    // `obtenirGrilleReferenceDepistage`, `interpreterMobilisation`…). Sans cette
    // ré-injection, le test échoue en ReferenceError sur la PREMIÈRE d'entre
    // elles et n'atteint jamais ce qu'il mesure.
    chargerScript('js/profil-etudiant-calculs.js', { ...stubs, ...win }, win);
    chargerPredicatsCopie(win);
});

describe('#552 · la cible d\'intervention ne vient plus du critère de langue', () => {

    it('GARDE ANTI-SILENCE · le montage produit bien le même pattern et le même défi dans les trois cas', () => {
        // Sans cette garde, une intensité identique pourrait venir d'un montage
        // qui a raté sa cible, et le test « prouverait » une correction qui n'a
        // rien exercé. C'est le piège nommé au pas 3c-1 de #542.
        grilleCourante = GRILLE_LANGUE;
        for (const niveauLangue of ['X', 'Y', 'Z']) {
            evaluationsCourantes = evaluationsAvecLangue(niveauLangue);

            const indices = win.calculerIndicesNDerniersArtefacts('TEST552', true);
            expect(indices.nbArtefacts, 'les trois évaluations doivent être vues').toBe(3);
            expect(indices.performance, 'la performance doit rester à 0,55 dans les trois cas')
                .toBeCloseTo(0.55, 5);

            const moyennes = win.calculerMoyennesCriteresRecents('TEST552');
            expect(moyennes, 'le calcul des moyennes par critère doit aboutir').not.toBeNull();

            const diagnostic = win.diagnostiquerForcesChallenges(moyennes);
            expect(diagnostic.principalDefi, 'un défi principal doit être identifié').not.toBeNull();
            expect(diagnostic.principalDefi.nom, 'le défi principal doit être Structure dans les TROIS cas')
                .toBe('Structure');
        }
    });

    it('LE CORRECTIF · trois notes de langue, une seule intensité — et la difficulté est nommée à chaque fois', () => {
        grilleCourante = GRILLE_LANGUE;

        // Les trois niveaux qui départageaient tout : 15 % (sous l'ancien seuil
        // 17), 60 % et 90 % (au-delà de TOUTES les anciennes bandes, qui
        // s'arrêtaient à 27).
        const cibles = ['X', 'Y', 'Z'].map((niveauLangue) => {
            evaluationsCourantes = evaluationsAvecLangue(niveauLangue);
            return win.determinerCibleIntervention('TEST552');
        });

        // ⮕ L'ASSERTION QUI PORTE LE CHANTIER : l'intensité ne bouge plus.
        // Avant, c'était 3 pour le premier et 1 pour les deux autres.
        expect(cibles[0].niveau, 'langue à 15 %').toBe(cibles[1].niveau);
        expect(cibles[1].niveau, 'langue à 60 %').toBe(cibles[2].niveau);
        expect(cibles[0].niveau, 'trois artefacts consécutifs sous le seuil de défi, sans progression')
            .toBe(3);

        for (const cible of cibles) {
            // La difficulté réelle est NOMMÉE — avant, celle du deuxième et du
            // troisième disparaissait de leur cible.
            expect(cible.cible, 'la difficulté en Structure doit être nommée').toContain('Structure');
            // Et rien n'est PRESCRIT : « l'app fournit les données, l'enseignant
            // prend les décisions » (skill `depistage-rai`).
            expect(cible.cible, 'aucun service d\'un réseau particulier').not.toContain('CAF');
            expect(cible.cible, 'aucune prescription d\'intervention').not.toContain('Remédiation');
            expect(cible.cible, 'aucune prescription d\'intervention').not.toContain('Pratique guidée');
        }

        // Le pattern reste ce que le tableau de bord consomme, inchangé.
        expect(cibles[0].pattern).toBe('Difficulté persistante');
        expect(cibles[0].pattern).toBe(cibles[2].pattern);
    });

    it('LA CAUSE · `francaisMoyen` et les six seuils ont disparu du code de la cible', () => {
        // ⮕ POURQUOI CE TEST RETIRE LES COMMENTAIRES. Le retrait est documenté
        // sur place et cite les seuils disparus, comme trace. Un grep naïf
        // rougirait sur la documentation du correctif au lieu du correctif.
        const code = lireCodeSansCommentaires('js/profil-etudiant-calculs.js');

        expect(code, '`I = francaisMoyen` est revenu dans la cible')
            .not.toMatch(/const\s+I\s*=\s*indices3Derniers\.francaisMoyen/);

        // #537 — la notion elle-même a disparu du fichier, pas seulement sa
        // lecture par la cible : plus de `francaisMoyen` rendu par les indices,
        // plus de critère reconnu par son nom.
        expect(code, '`francaisMoyen` est revenu dans les indices').not.toContain('francaisMoyen');
        expect(code, '`NOM_CRITERE_LANGUE` est revenu').not.toContain('NOM_CRITERE_LANGUE');

        for (const resolveur of [
            '_resoudreCibleDifficultePersistante',
            '_resoudreCibleDifficulteEmergente',
            '_resoudreCibleDefiSpecifique',
            '_resoudreCibleStable'
        ]) {
            expect(code, `le résolveur ${resolveur} est revenu`).not.toContain(resolveur);
        }

        // Les six seuils, dans leur forme exacte de comparaison.
        for (const seuil of ['17', '18', '20', '21', '25', '27']) {
            expect(code, `un seuil \`I ${seuil}\` est revenu`)
                .not.toMatch(new RegExp('I\\s*[<>]=?\\s*' + seuil + '\\b'));
        }

        // Et le vocabulaire d'intervention du réseau de Grégoire.
        for (const mot of ['CAF', 'Dépistage SA', 'Pratique guidée en', 'Remédiation en']) {
            expect(code, `le vocabulaire « ${mot} » est revenu`).not.toContain(mot);
        }

        // #537 — le DERNIER nom de critère en dur du chantier : l'exclusion du
        // critère « Français » de la carte « Observation de la structure ».
        // Grégoire l'a tranchée le 27 août ; son critère y apparaît désormais.
        const affichage = lireCodeSansCommentaires('js/profil-etudiant-sections-affichage.js');
        expect(affichage, 'l\'exclusion du critère « Français » est revenue')
            .not.toMatch(/c\.nom\s*!==\s*'Français'/);
    });

    it('#535 · une grille sans aucun critère de Grégoire produit une cible complète', () => {
        // C'est la moitié du chantier que le montage de langue ne peut pas
        // prouver : les quatre résolveurs ne connaissaient que « Structure »,
        // « Rigueur », « Plausibilité », « Nuance » et « Français ». Une grille
        // « Méthode / Résultats / Discussion » ne matchait AUCUNE branche et
        // tombait dans le repli générique — sans que sa difficulté soit nommée.
        grilleCourante = GRILLE_ETRANGERE;
        evaluationsCourantes = evaluations({ 'Méthode': 'W', 'Résultats': 'X', 'Discussion': 'Y' });

        const cible = win.determinerCibleIntervention('TEST552');

        expect(cible.cible, 'le critère en défi de CETTE grille doit être nommé').toContain('Méthode');
        expect(cible.niveau, 'et son intensité doit être calculée, pas repliée sur le minimum').toBe(3);
    });

    it('#537 · le niveau SOLO affiché est celui que l\'utilisateur a configuré', () => {
        // `Méthode` porte `niveauSOLO: 'relationnel'` dans la grille. Le libellé
        // doit le lire, pas le deviner depuis le nom — c'est le défaut B9, retiré
        // de `trimestres.js` au pas 4 du lot 3 de #542, et qui vivait encore ici.
        grilleCourante = GRILLE_ETRANGERE;
        evaluationsCourantes = evaluations({ 'Méthode': 'W', 'Résultats': 'X', 'Discussion': 'Y' });

        const cible = win.determinerCibleIntervention('TEST552');
        expect(cible.cible, 'le niveau SOLO configuré doit apparaître').toContain('relationnel');

        // Le contre-test : un critère SANS étiquette reçoit le défaut
        // « multistructurel » — le même que `calculerIPB` et l'éditeur de grilles.
        expect(win.libelleNiveauSOLO(undefined)).toBe('multistructurel');
        expect(win.libelleNiveauSOLO('abstrait_etendu')).toBe('abstrait étendu');
    });
});
