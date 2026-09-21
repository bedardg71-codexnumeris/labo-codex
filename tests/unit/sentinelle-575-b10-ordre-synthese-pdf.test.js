import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE #575 B10 — l'ordre des niveaux du PDF de rétroaction se lit dans
// l'échelle de l'évaluation, plus dans une table IDME écrite en dur.
//
// CE QUI EXISTAIT AVANT. `synthese-retroaction-data.js` portait
// `ORDRE_NIV = { E:4, M:3, D:2, I:1, '0':0 }` — l'ordre de l'échelle de
// Grégoire —, et s'en servait à trois endroits du bilan REMIS À L'ÉLÈVE :
// le tri des défis (les deux « priorités » affichées), le choix de « ta force »,
// et la ligne « Progrès : X → Y » avec la tendance du parcours.
//
// ⚠ `ORDRE_NIV[code] || 0` NE LEVAIT PAS : il rendait 0. Hors IDME, tous les
// niveaux recevaient donc le même rang, et le défaut était SILENCIEUX —
// les priorités étaient les deux premières du tableau au lieu des deux plus
// faibles, « ta force » revenait au premier critère saisi, et la ligne
// « Progrès » ne pouvait JAMAIS s'afficher. Même défaut, même document, que
// celui corrigé le 28 août dans `evaluation-retroaction.js`.
//
// ⮕ LE MONTAGE DE CE FICHIER EST CHOISI POUR ÇA. Les échelles ci-dessous
// REPRENNENT les lettres I/D/M/E mais dans un AUTRE ordre — cas parfaitement
// réel : rien n'oblige un·e collègue à faire de « E » son niveau le plus haut.
// Une table en dur et une lecture d'échelle donnent alors des réponses
// OPPOSÉES, ce qu'une échelle W-X-Y-Z ne montrerait pas (tous les rangs y
// seraient à 0, donc « pas de tri » — un faux vert par égalité).
//
// ⚠ CE QUI N'EST PAS L'OBJET DE CE FICHIER : « quel niveau est un défi » et
// « quel niveau est maîtrisé » restent testés en toutes lettres dans le module.
// Ce n'est pas un oubli — c'est la marque de maîtrise de #555, qui ne se dérive
// d'aucune échelle. Le test `identite-des-butees` ci-dessous en fige le compte.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const source = readFileSync(path.join(racine, 'js/synthese-retroaction-data.js'), 'utf8');

// ⚠ Le corps EXÉCUTABLE seul : les commentaires de ce module citent `ORDRE_NIV`
// pour expliquer son retrait. Sans ce filtrage, la sentinelle serait satisfaite
// — ou mise en échec — par sa propre documentation.
const codeSeul = source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .map((l) => l.replace(/(^|[^:])\/\/.*$/, '$1'))
    .join('\n');

// Les lettres de Grégoire, l'ordre de quelqu'un d'autre : ici « E » (Émergent)
// est le PLUS FAIBLE et « I » (Intégré) le plus fort — l'inverse exact d'IDME.
const ECHELLE_RENVERSEE = {
    id: 'ECH_RENV',
    nom: 'Émergent → Intégré',
    // #555 lot 2 — les deux repères. Sans eux, `zoneDuNiveau` rend `null` et le
    // module ne rend RIEN : c'est le comportement voulu, et c'est ce qui a fait
    // rougir ce fichier au branchement. Ici : E et M sont des priorités,
    // D est « signalé », I est acquis.
    seuilSuffisance: 'D',
    seuilMaitrise: 'I',
    niveaux: [
        { code: 'E', nom: 'Émergent',   min: 0,  max: 59,  valeurCalcul: 40 },
        { code: 'M', nom: 'Mobilisé',   min: 60, max: 74,  valeurCalcul: 67 },
        { code: 'D', nom: 'Développé',  min: 75, max: 84,  valeurCalcul: 80 },
        { code: 'I', nom: 'Intégré',    min: 85, max: 100, valeurCalcul: 95 }
    ]
};

// Une échelle sans aucune lettre d'IDME, pour la ligne « Progrès » (qui, elle,
// ne bute pas sur #555 : elle ne compare que des rangs).
const ECHELLE_WXYZ = {
    id: 'ECH_WXYZ',
    nom: 'Cotation W-X-Y-Z',
    niveaux: [
        { code: 'W', nom: 'Amorce',    min: 0,  max: 49,  valeurCalcul: 30 },
        { code: 'X', nom: 'En chemin', min: 50, max: 69,  valeurCalcul: 60 },
        { code: 'Y', nom: 'Consolidé', min: 70, max: 89,  valeurCalcul: 80 },
        { code: 'Z', nom: 'Transféré', min: 90, max: 100, valeurCalcul: 95 }
    ]
};

// Une échelle qui connaît « D » mais PAS « I » — le seul montage où un code
// franchit la butée #555 (`I || D` = un défi) SANS avoir de rang à lire.
const ECHELLE_SANS_I = {
    id: 'ECH_SANS_I',
    nom: 'Trois paliers aux lettres familières',
    seuilSuffisance: 'M',
    seuilMaitrise: 'E',
    niveaux: [
        { code: 'D', nom: 'Départ',   min: 0,  max: 64, valeurCalcul: 50 },
        { code: 'M', nom: 'Milieu',   min: 65, max: 84, valeurCalcul: 75 },
        { code: 'E', nom: 'Excellent', min: 85, max: 100, valeurCalcul: 95 }
    ]
};

// La MÊME échelle que `ECHELLE_WXYZ`, recréée sous un identifiant neuf en
// gardant l'ancien dans `idOriginal` — l'état exact du trimestre de Grégoire
// après la réparation de #542, et la cause de la porte terrain 2.7.
const ECHELLE_RESTAUREE = {
    id: 'ECH_WXYZ_V2',
    idOriginal: 'ECH_WXYZ',
    nom: 'Cotation W-X-Y-Z (restaurée)',
    niveaux: ECHELLE_WXYZ.niveaux
};

// Deux échelles aux MÊMES codes mais aux repères différents : le seul montage
// qui distingue « lu dans son échelle » de « lu dans l'échelle courante ».
const ECHELLE_INDULGENTE = {
    id: 'ECH_INDULGENTE', nom: 'Maîtrise à partir de X',
    seuilMaitrise: 'X',
    niveaux: [
        { code: 'W', nom: 'Amorce', min: 0, max: 49, valeurCalcul: 30 },
        { code: 'X', nom: 'Milieu', min: 50, max: 79, valeurCalcul: 65 },
        { code: 'Y', nom: 'Haut',   min: 80, max: 100, valeurCalcul: 90 }
    ]
};
const ECHELLE_EXIGEANTE = {
    id: 'ECH_EXIGEANTE', nom: 'Maîtrise à partir de Y',
    seuilMaitrise: 'Y',
    niveaux: ECHELLE_INDULGENTE.niveaux
};

const ECHELLE_TIERS = {
    id: 'ECH_TIERS',
    nom: 'Barème à trois paliers',
    niveaux: [
        { code: 'W', nom: 'Début',  min: 0,  max: 59, valeurCalcul: 40 },
        { code: 'X', nom: 'Milieu', min: 60, max: 79, valeurCalcul: 70 },
        { code: 'Y', nom: 'Fin',    min: 80, max: 100, valeurCalcul: 90 }
    ]
};

/** Le vrai `profil-etudiant-calculs.js` : ce fichier ne stubbe aucune règle. */
function chargerCalculs(echelles) {
    return chargerScript('js/profil-etudiant-calculs.js', {
        db: {
            getSync: (k, d) => (String(k).indexOf('echellesTemplates') !== -1 ? echelles : (d !== undefined ? d : null)),
            get: async () => null, set: async () => {}, setSync: () => {}
        },
        cle: (k) => 'test_' + k,
        obtenirDonneesSelonMode: () => [],
        obtenirPreference: () => null,
        obtenirSeuil: () => null,
        obtenirPratiqueParId: () => null,
        obtenirTypePratiqueActive: () => 'standards'
    });
}

function chargerData(echelles, evaluationsEnBase) {
    const calculs = chargerCalculs(echelles);
    return chargerScript('js/synthese-retroaction-data.js', {
        db: {
            getSync: (k, d) => (d !== undefined ? d : null),
            get: async () => null, set: async () => {}, setSync: () => {}
        },
        cle: (k) => 'test_' + k,
        obtenirDonneesSelonMode: (cleBase) =>
            (cleBase === 'evaluationsSauvegardees' ? (evaluationsEnBase || []) : []),
        obtenirTrimestreActif: () => ({ id: 'T1', nom: 'H2026' }),
        obtenirEtudiantsCoursActif: () => [],
        obtenirGroupesCours: () => [],
        travauxStockage: { obtenirAnnotationFichier: () => null },
        travauxOutils: { AUTOCOLLANTS: [] },
        obtenirPreference: () => null,
        // Les VRAIS lecteurs, pas des doublures : c'est tout l'objet du lot.
        obtenirEchelleResolue: calculs.obtenirEchelleResolue,
        niveauDuCodeDansEchelle: calculs.niveauDuCodeDansEchelle,
        niveauxOrdonnesDeLEchelle: calculs.niveauxOrdonnesDeLEchelle,
        echellesComparables: calculs.echellesComparables,
        // #555 lot 2 — le VRAI lecteur de zones, pas une doublure.
        zoneDuNiveau: calculs.zoneDuNiveau
    });
}

function evaluation(attrs) {
    return Object.assign({
        id: 'EV_COURANTE', etudiantDA: '111', grilleId: 'G1',
        dateEvaluation: '2026-05-10', productionNom: 'Labo 3',
        criteres: []
    }, attrs);
}

function critere(nom, niveau) {
    return { critereId: 'c_' + nom, critereNom: nom, niveauSelectionne: niveau, ponderation: 25 };
}

function bilanDe(win, evalCourante) {
    return win.syntheseRetroactionData.construireFeedback(evalCourante, { id: 'F1' }, null).bilan;
}

describe('#575 B10 · l\'ordre du bilan remis à l\'élève vient de SON échelle', () => {

    // ── 1. LE TRI DES DÉFIS ──────────────────────────────────────────────────

    it('trie les priorités du plus faible au plus fort SELON L\'ÉCHELLE, pas selon IDME', () => {
        // Dans `ECHELLE_RENVERSEE`, « E » (Émergent) est le plus FAIBLE et « M »
        // (Mobilisé) vient juste au-dessus : les deux sont sous le seuil de
        // suffisance, donc deux priorités. Attendu : E d'abord.
        // ⮕ La table retirée disait exactement l'inverse — E=4, M=3.
        const win = chargerData([ECHELLE_RENVERSEE], []);
        const bilan = bilanDe(win, evaluation({
            echelleId: 'ECH_RENV',
            criteres: [critere('Analyse', 'M'), critere('Plausibilite', 'E')]
        }));

        expect(bilan.concentration.priorites).toHaveLength(2);
        expect(bilan.concentration.priorites[0]).toContain('Plausibilite');
        expect(bilan.concentration.priorites[1]).toContain('Analyse');
    });

    it('un code que l\'échelle ne connaît pas n\'entre dans AUCUNE zone', () => {
        // ⮕ #555 lot 2 a fait disparaître l'objet des deux cas précédents (« un
        // niveau illisible se range en dernier ») : un code sans zone n'est plus
        // trié du tout, puisqu'il n'entre ni dans les priorités ni dans les
        // signalés. Le repli `Infinity` de `rangOuDernier` est devenu
        // inatteignable et a été retiré avec le lot. Ce qui reste à prouver est
        // plus fort : un code étranger ne se range nulle part, ni par défaut ni
        // par hasard.
        const win = chargerData([ECHELLE_RENVERSEE], []);
        const bilan = bilanDe(win, evaluation({
            echelleId: 'ECH_RENV',
            criteres: [critere('Inconnu', 'ZZZ'), critere('Analyse', 'E')]
        }));

        expect(bilan.concentration.priorites).toHaveLength(1);
        expect(bilan.concentration.priorites[0]).toContain('Analyse');
        expect(bilan.concentration.signales).toEqual([]);
        expect(bilan.concentration.tousMaitrises).toBe(false);
        expect(bilan.recurrents.force).toBe('');
    });

    it('la zone intermédiaire existe : « signalé » n\'est ni une priorité ni un acquis', () => {
        // La distinction que Grégoire a demandée : « D » est réel mais non
        // durable. Il sort des priorités remises à l'élève sans devenir un acquis.
        const win = chargerData([ECHELLE_RENVERSEE], []);
        const bilan = bilanDe(win, evaluation({
            echelleId: 'ECH_RENV',
            criteres: [critere('Analyse', 'E'), critere('Plausibilite', 'D')]
        }));

        expect(bilan.concentration.priorites).toHaveLength(1);
        expect(bilan.concentration.priorites[0]).toContain('Analyse');
        expect(bilan.concentration.signales).toHaveLength(1);
        expect(bilan.concentration.signales[0]).toContain('Plausibilite');
        expect(bilan.concentration.tousMaitrises).toBe(false);
    });

    // ── 2. « TA FORCE » ──────────────────────────────────────────────────────

    it('« ta force » est le critère le plus haut, ET il doit être ACQUIS', () => {
        // Dans `ECHELLE_RENVERSEE`, « I » (Intégré) est le plus haut et le seul
        // acquis ; « D » (Développé) est signalé. La table retirée aurait choisi
        // D — elle donnait I=1 et D=2.
        const win = chargerData([ECHELLE_RENVERSEE], []);
        const bilan = bilanDe(win, evaluation({
            echelleId: 'ECH_RENV',
            criteres: [critere('Analyse', 'D'), critere('Plausibilite', 'I')]
        }));
        expect(bilan.recurrents.force).toContain('Plausibilite');
        expect(bilan.recurrents.force).not.toContain('Analyse');
    });

    it('aucune force quand le meilleur critère n\'est que SIGNALÉ', () => {
        // ⮕ #555 lot 2. « Signalé » est réel mais non durable : l'annoncer comme
        // une force dirait à l'élève qu'il peut s'en détourner. Avant ce lot, la
        // seule condition était d'être « M ou E ».
        const win = chargerData([ECHELLE_RENVERSEE], []);
        const bilan = bilanDe(win, evaluation({
            echelleId: 'ECH_RENV',
            criteres: [critere('Analyse', 'E'), critere('Plausibilite', 'D')]
        }));
        expect(bilan.recurrents.force).toBe('');
    });

    it('aucune force annoncée quand AUCUN niveau ne se lit dans l\'échelle', () => {
        // Avant : tous les critères à 0, `acc` initialisé à -1, donc le PREMIER
        // du tableau devenait « ta force ». L'ordre de saisie décidait.
        const win = chargerData([], []);
        const bilan = bilanDe(win, evaluation({
            echelleId: 'ECH_DISPARUE',
            criteres: [critere('Analyse', 'M'), critere('Plausibilite', 'E')]
        }));
        expect(bilan.recurrents.force).toBe('');
    });

    it('« maîtrisés DEPUIS PLUS D\'UNE PRODUCTION » lit l\'historique dans SON échelle', () => {
        // ⚠ Cas trouvé par le BREAK-TEST : lire l'évaluation précédente dans
        // l'échelle COURANTE laissait la sentinelle verte. Ici, « X » est acquis
        // sous l'échelle indulgente et ne l'est PAS sous l'exigeante — l'élève a
        // donc atteint la maîtrise cette fois-ci, mais pas la précédente.
        const anterieure = evaluation({
            id: 'EV_ANCIENNE', echelleId: 'ECH_EXIGEANTE', dateEvaluation: '2026-04-01',
            criteres: [critere('Analyse', 'X')]
        });
        const win = chargerData([ECHELLE_INDULGENTE, ECHELLE_EXIGEANTE], [anterieure]);
        const bilan = bilanDe(win, evaluation({
            echelleId: 'ECH_INDULGENTE', criteres: [critere('Analyse', 'X')]
        }));

        expect(bilan.concentration.tousMaitrises).toBe(true);
        // Lu dans l'échelle exigeante, le passé n'était PAS maîtrisé.
        expect(bilan.concentration.messageGlobal).toContain('Continue sur cette lancée');
        // ⚠ F4-1 — « d'un artefact » est devenu « d'une production » : l'ancienne
        // assertion serait restée verte par vacuité, quelle que soit la branche.
        expect(bilan.concentration.messageGlobal).not.toContain("depuis plus d'");
    });

    it('« tu as progressé » lit l\'état ANTÉRIEUR dans l\'échelle de l\'époque', () => {
        // ⚠ Second cas trouvé par le break-test, sur la même faute de lecture.
        // « X » était une PRIORITÉ sous l'échelle exigeante d'alors ; il serait
        // déjà « acquis » sous l'échelle indulgente d'aujourd'hui. Lire le passé
        // avec le barème du présent effacerait un progrès réel.
        const anterieure = evaluation({
            id: 'EV_ANCIENNE', echelleId: 'ECH_EXIGEANTE', dateEvaluation: '2026-04-01',
            productionNom: 'Labo 1', niveauFinal: 'X',
            criteres: [critere('Analyse', 'X')]
        });
        const win = chargerData([ECHELLE_INDULGENTE, ECHELLE_EXIGEANTE], [anterieure]);
        const bilan = bilanDe(win, evaluation({
            echelleId: 'ECH_INDULGENTE', niveauFinal: 'Y',
            criteres: [critere('Analyse', 'Y')]
        }));

        expect(bilan.recurrents.ameliorations).toContain('Analyse');
    });

    it('RÉGRESSION 28 août : « signalé → acquis » DOIT être annoncé', () => {
        // ⚠⚠ Le lot 2 avait traduit « avant = I ou D » par « avant = priorité »,
        // ce qui excluait la zone intermédiaire : sur l'échelle de Grégoire,
        // D → M et D → E cessaient d'être annoncés. La règle juste est
        // « avant ≠ acquis ». Le break-test ne l'avait pas vu — il mutait le
        // côté DROIT de la condition, jamais le gauche.
        const anterieure = evaluation({
            id: 'EV_ANCIENNE', echelleId: 'ECH_RENV', dateEvaluation: '2026-04-01',
            productionNom: 'Labo 1', niveauFinal: 'D',
            criteres: [critere('Analyse', 'D')]        // D = signalé
        });
        const win = chargerData([ECHELLE_RENVERSEE], [anterieure]);
        const bilan = bilanDe(win, evaluation({
            echelleId: 'ECH_RENV', niveauFinal: 'I',
            criteres: [critere('Analyse', 'I')]        // I = acquis
        }));

        expect(bilan.recurrents.ameliorations).toContain('Analyse');
    });

    it('un état antérieur INCONNU n\'est pas « non acquis » : aucun progrès annoncé', () => {
        // ⚠ CAS CONSTRUIT APRÈS UN BREAK-TEST RESTÉ VERT. Une première version
        // mettait les deux évaluations sur une échelle SANS repères : les deux
        // zones valaient `null`, et le côté DROIT de la condition suffisait à
        // faire passer le test. Il faut un `null` à GAUCHE et un `'acquis'` à
        // DROITE — donc DEUX échelles : l'ancienne sans repères, la neuve avec.
        // Sans cette garde, `null !== 'acquis'` annoncerait un progrès qu'on n'a
        // pas mesuré, à chaque élève dont une évaluation précède la pose des
        // repères. C'est le cas de TOUT LE TRIMESTRE EN COURS de Grégoire.
        const anterieure = evaluation({
            id: 'EV_ANCIENNE', echelleId: 'ECH_WXYZ', dateEvaluation: '2026-04-01',
            productionNom: 'Labo 1', niveauFinal: 'W',
            criteres: [critere('Analyse', 'W')]       // ECH_WXYZ : aucun repère → null
        });
        const win = chargerData([ECHELLE_WXYZ, ECHELLE_RENVERSEE], [anterieure]);
        const bilan = bilanDe(win, evaluation({
            echelleId: 'ECH_RENV', niveauFinal: 'I',
            criteres: [critere('Analyse', 'I')]       // ECH_RENV : I = acquis
        }));

        expect(bilan.recurrents.ameliorations).toBe('');
    });

    it('« priorité → signalé » est annoncé, mais AUTREMENT : il faut consolider', () => {
        // ⮕ DÉCISION DE GRÉGOIRE, 28 août 2026, sur trois options proposées.
        // Ce passage — sortir de l'insuffisance — est le plus difficile, et il
        // n'est pas durable. Le taire laissait croire qu'il ne comptait pas ; le
        // confondre avec un acquis, qu'il était réglé. Ses mots, littéralement.
        const anterieure = evaluation({
            id: 'EV_ANCIENNE', echelleId: 'ECH_RENV', dateEvaluation: '2026-04-01',
            productionNom: 'Labo 1', niveauFinal: 'E',
            criteres: [critere('Analyse', 'E')]        // E = priorité
        });
        const win = chargerData([ECHELLE_RENVERSEE], [anterieure]);
        const bilan = bilanDe(win, evaluation({
            echelleId: 'ECH_RENV', niveauFinal: 'D',
            criteres: [critere('Analyse', 'D')]        // D = signalé
        }));

        expect(bilan.recurrents.ameliorations).toContain('Analyse');
        expect(bilan.recurrents.ameliorations).toContain('beaux progrès');
        expect(bilan.recurrents.ameliorations).toContain('consolider');
        // ⚠ Et surtout PAS confondu avec un acquis.
        expect(bilan.recurrents.ameliorations).not.toContain('Tu as progressé en');
    });

    it('« consolider » exige un PROGRÈS, pas seulement un état signalé', () => {
        // ⚠ Cas trouvé par le break-test : retirer la condition sur l'état
        // ANTÉRIEUR laissait la sentinelle verte. Sans elle, un critère qui
        // stagne — ou qui RÉGRESSE d'acquis à signalé — recevrait « tu as fait
        // de beaux progrès ». Dire un progrès à qui a reculé est pire que se taire.
        const anterieure = evaluation({
            id: 'EV_ANCIENNE', echelleId: 'ECH_RENV', dateEvaluation: '2026-04-01',
            productionNom: 'Labo 1', niveauFinal: 'D',
            criteres: [critere('Stagne', 'D'), critere('Recule', 'I')]
        });
        const win = chargerData([ECHELLE_RENVERSEE], [anterieure]);
        const bilan = bilanDe(win, evaluation({
            echelleId: 'ECH_RENV', niveauFinal: 'D',
            criteres: [critere('Stagne', 'D'), critere('Recule', 'D')]
        }));

        expect(bilan.recurrents.ameliorations).toBe('');
    });

    it('les deux natures de progrès cohabitent sans se confondre', () => {
        // Un critère devenu acquis ET un autre seulement consolidé : deux
        // phrases, deux listes disjointes, jamais le même critère dans les deux.
        const anterieure = evaluation({
            id: 'EV_ANCIENNE', echelleId: 'ECH_RENV', dateEvaluation: '2026-04-01',
            productionNom: 'Labo 1', niveauFinal: 'E',
            criteres: [critere('Analyse', 'E'), critere('Rigueur', 'E')]
        });
        const win = chargerData([ECHELLE_RENVERSEE], [anterieure]);
        const bilan = bilanDe(win, evaluation({
            echelleId: 'ECH_RENV', niveauFinal: 'I',
            criteres: [critere('Analyse', 'I'), critere('Rigueur', 'D')]
        }));

        const texte = bilan.recurrents.ameliorations;
        expect(texte).toContain('Tu as progressé en Analyse');
        expect(texte).toContain('En Rigueur, tu as fait de beaux progrès');
        // Analyse est acquise : elle ne doit pas figurer dans « à consolider ».
        expect(texte).not.toMatch(/En [^,]*Analyse[^,]*, tu as fait/);
    });


    // ── 3. LA LIGNE « PROGRÈS » ET LA TENDANCE ───────────────────────────────

    it('annonce le progrès sur une échelle SANS AUCUNE lettre IDME', () => {
        // Le cas que la table rendait impossible : hors IDME, `ORDRE_NIV` rendait
        // 0 des deux côtés, `ordreAct > ordrePre` était toujours faux.
        const precedente = evaluation({
            id: 'EV_ANCIENNE', echelleId: 'ECH_WXYZ', niveauFinal: 'X',
            dateEvaluation: '2026-04-01', productionNom: 'Labo 1'
        });
        const win = chargerData([ECHELLE_WXYZ], [precedente]);
        const bilan = bilanDe(win, evaluation({ echelleId: 'ECH_WXYZ', niveauFinal: 'Z' }));

        expect(bilan.recurrents.progression).toContain('Progrès : X → Z');
        expect(bilan.recurrents.progression).toContain('Labo 1');
    });

    it('n\'annonce AUCUN progrès entre deux barèmes qui existent tous les deux', () => {
        // Le 3e niveau d'une échelle à quatre et le 3e d'une échelle à trois ne
        // disent pas la même chose. C'est le seul cas que la garde refuse.
        const precedente = evaluation({
            id: 'EV_ANCIENNE', echelleId: 'ECH_TIERS', niveauFinal: 'W',
            dateEvaluation: '2026-04-01', productionNom: 'Labo 1'
        });
        const win = chargerData([ECHELLE_WXYZ, ECHELLE_TIERS], [precedente]);
        const bilan = bilanDe(win, evaluation({ echelleId: 'ECH_WXYZ', niveauFinal: 'Z' }));

        expect(bilan.recurrents.progression).toBe('');
    });

    it('une échelle précédente INTROUVABLE est une absence, pas un autre barème', () => {
        // ⮕ La correction de la porte terrain 2.7, et la raison pour laquelle la
        // garde ne compare pas les ids bruts : chez Grégoire, l'échelle courante
        // a été RECRÉÉE par la réparation de #542 sous un identifiant neuf,
        // pendant que ses évaluations d'H2026 en désignent un ancien. Comparer
        // les ids aurait effacé la ligne « Progrès » chez tous ses élèves.
        const precedente = evaluation({
            id: 'EV_ANCIENNE', echelleId: 'ECH_EFFACEE', niveauFinal: 'X',
            dateEvaluation: '2026-04-01', productionNom: 'Labo 1'
        });
        const win = chargerData([ECHELLE_WXYZ], [precedente]);
        const bilan = bilanDe(win, evaluation({ echelleId: 'ECH_WXYZ', niveauFinal: 'Z' }));

        expect(bilan.recurrents.progression).toContain('Progrès : X → Z');
    });

    it('deux identifiants qui résolvent vers la MÊME échelle sont comparables', () => {
        // ⮕ LE CŒUR DE LA PORTE TERRAIN 2.7. L'échelle a été recréée sous un id
        // neuf (`idOriginal` garde l'ancien), pendant que les évaluations
        // d'H2026 désignent encore l'ancien. Comparer les ids BRUTS conclurait
        // « deux barèmes » et effacerait la ligne « Progrès » chez tous les
        // élèves de Grégoire. C'est l'échelle RÉSOLUE qui tranche.
        const precedente = evaluation({
            id: 'EV_ANCIENNE', echelleId: 'ECH_WXYZ', niveauFinal: 'X',
            dateEvaluation: '2026-04-01', productionNom: 'Labo 1'
        });
        const win = chargerData([ECHELLE_RESTAUREE], [precedente]);
        const bilan = bilanDe(win, evaluation({ echelleId: 'ECH_WXYZ_V2', niveauFinal: 'Z' }));

        expect(bilan.recurrents.progression).toContain('Progrès : X → Z');
    });

    it('un niveau ANTÉRIEUR étranger à l\'échelle n\'est pas un progrès', () => {
        // Sans la garde `ordrePre == null`, le rang absent se lit 0 en
        // comparaison et TOUT devient un progrès : l'élève recevait
        // « Progrès : QQQ → Z » sur un code que son échelle ne nomme même pas.
        const precedente = evaluation({
            id: 'EV_ANCIENNE', echelleId: 'ECH_WXYZ', niveauFinal: 'QQQ',
            dateEvaluation: '2026-04-01', productionNom: 'Labo 1'
        });
        const win = chargerData([ECHELLE_WXYZ], [precedente]);
        const bilan = bilanDe(win, evaluation({ echelleId: 'ECH_WXYZ', niveauFinal: 'Z' }));

        expect(bilan.recurrents.progression).toBe('');
    });

    it('la tendance ÉCARTE les évaluations d\'un autre barème au lieu de les compter 0', () => {
        // `ORDRE_NIV[…] || 0` faisait entrer chaque évaluation étrangère dans la
        // moyenne avec la valeur du plancher : le parcours paraissait plus faible
        // qu'il ne l'était, et le verdict basculait.
        const anciennes = [
            evaluation({ id: 'A1', echelleId: 'ECH_WXYZ', niveauFinal: 'Y', dateEvaluation: '2026-04-03', productionNom: 'Labo 2' }),
            evaluation({ id: 'A2', echelleId: 'ECH_TIERS', niveauFinal: 'W', dateEvaluation: '2026-04-02', productionNom: 'Labo 1b' }),
            evaluation({ id: 'A3', echelleId: 'ECH_WXYZ', niveauFinal: 'Y', dateEvaluation: '2026-04-01', productionNom: 'Labo 1' })
        ];
        const win = chargerData([ECHELLE_WXYZ, ECHELLE_TIERS], anciennes);
        const bilan = bilanDe(win, evaluation({ echelleId: 'ECH_WXYZ', niveauFinal: 'Z' }));

        // Trois rangs comparables retenus (Z=4, Y=3, Y=3), l'intrus écarté.
        expect(bilan.recurrents.tendance).toContain('Parcours sur 3 productions');
    });

    it('aucune tendance quand le code de l\'élève est étranger à son échelle', () => {
        const precedente = evaluation({
            id: 'EV_ANCIENNE', echelleId: 'ECH_WXYZ', niveauFinal: 'X',
            dateEvaluation: '2026-04-01', productionNom: 'Labo 1'
        });
        const win = chargerData([ECHELLE_WXYZ], [precedente]);
        const bilan = bilanDe(win, evaluation({ echelleId: 'ECH_WXYZ', niveauFinal: 'ZZZ' }));

        expect(bilan.recurrents.progression).toBe('');
        expect(bilan.recurrents.tendance).toBe('');
    });

    // ── 4. LE NIVEAU VISÉ, NOMMÉ PAR L'ÉCHELLE ───────────────────────────────

    it('« maîtrisés depuis plus d\'une production » ne nomme AUCUN niveau', () => {
        // Avant #575 : « vers le niveau É (transfert à d'autres contextes) », écrit
        // en dur — le dernier niveau de l'échelle de Grégoire, dans le PDF d'un·e
        // autre. #575 B10 l'avait dérivé du sommet de l'échelle (« vers le niveau
        // Intégré ») ; F4-1 (21 sept. 2026) retire la mention : la phrase validée
        // par Grégoire ne nomme plus de niveau du tout. Texte exact et jumelage
        // avec l'écran : `sentinelle-f4-1-bilan-mots-eleve`.
        // ⚠ « tous maîtrisés » exige que TOUTES les zones soient ACQUISES : seul
        // « I » l'est dans cette échelle.
        const anterieure = evaluation({
            id: 'EV_ANCIENNE', echelleId: 'ECH_RENV', dateEvaluation: '2026-04-01',
            criteres: [critere('Analyse', 'I'), critere('Plausibilite', 'I')]
        });
        const win = chargerData([ECHELLE_RENVERSEE], [anterieure]);
        const bilan = bilanDe(win, evaluation({
            echelleId: 'ECH_RENV',
            criteres: [critere('Analyse', 'I'), critere('Plausibilite', 'I')]
        }));

        expect(bilan.concentration.tousMaitrises).toBe(true);
        expect(bilan.concentration.messageGlobal).toContain("depuis plus d'une production");
        expect(bilan.concentration.messageGlobal).not.toContain('Intégré');
        expect(bilan.concentration.messageGlobal).not.toContain('vers le niveau');
        expect(bilan.concentration.messageGlobal).not.toContain('niveau É');
        expect(bilan.concentration.messageGlobal).not.toContain('transfert à d\'autres contextes');
    });

    it('sans échelle, RIEN n\'est conclu — ni priorité, ni maîtrise, ni force', () => {
        // ⮕ #555 lot 2 a durci ce cas, et c'est voulu : avant, l'absence
        // d'échelle laissait quand même le module trancher par les lettres. Une
        // échelle qui ne se résout pas — ou qui ne porte aucun repère — ne dit
        // rien, et le bilan ne dit rien non plus. C'est le principe déclaré en
        // tête du module, appliqué jusqu'au bout.
        const anterieure = evaluation({
            id: 'EV_ANCIENNE', echelleId: 'ECH_DISPARUE', dateEvaluation: '2026-04-01',
            criteres: [critere('Analyse', 'M')]
        });
        const win = chargerData([], [anterieure]);
        const bilan = bilanDe(win, evaluation({
            echelleId: 'ECH_DISPARUE', criteres: [critere('Analyse', 'M')]
        }));

        expect(bilan.concentration.tousMaitrises).toBe(false);
        expect(bilan.concentration.priorites).toEqual([]);
        expect(bilan.concentration.signales).toEqual([]);
        expect(bilan.concentration.messageGlobal).toBe('');
        expect(bilan.recurrents.force).toBe('');
    });

    // ── 5. RATCHETS ──────────────────────────────────────────────────────────

    it('`ORDRE_NIV` et ses valeurs ne reviennent pas dans le code exécutable', () => {
        expect(codeSeul).not.toMatch(/ORDRE_NIV/);
        // La forme exacte de la table retirée, quel que soit le nom qu'on lui donne.
        expect(codeSeul).not.toMatch(/'E'\s*:\s*4\s*,\s*'M'\s*:\s*3/);
        expect(codeSeul).not.toMatch(/E\s*:\s*4\s*,\s*M\s*:\s*3/);
        // Le niveau visé du message « tous maîtrisés » : nommé par l'échelle, pas écrit.
        expect(codeSeul).not.toContain('niveau É');
        expect(codeSeul).not.toContain('transfert à d\'autres contextes');
    });

    it('AUCUN code IDME n\'est plus comparé dans ce module — le compte est ZÉRO', () => {
        // ⮕ CE TEST A CHANGÉ DE NATURE LE 28 AOÛT, ET C'ÉTAIT LE SIGNAL VOULU.
        // Il CONSTATAIT « 6 sites / 14 comparaisons » et annonçait qu'il
        // rougirait le jour où #555 les retirerait. Ce jour est venu : Grégoire
        // a posé ses deux repères, `zoneDuNiveau` a remplacé les lettres, et le
        // compte est tombé à zéro.
        //
        // ⚠ Il n'a PAS été « réparé » en changeant le chiffre — la consigne était
        // explicite. Il est devenu un RATCHET : plus aucune lettre ne revient.
        const motif = /[!=]==\s*'[IDME0]'/g;
        expect(codeSeul.match(motif)).toBeNull();
        // Et la table d'ordre ne revient pas non plus, sous quelque nom que ce soit.
        expect(codeSeul).not.toMatch(/ORDRE_NIV/);
        expect(codeSeul).not.toMatch(/E\s*:\s*4\s*,\s*M\s*:\s*3/);
    });
});
