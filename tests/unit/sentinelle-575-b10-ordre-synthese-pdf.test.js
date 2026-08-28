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
        echellesComparables: calculs.echellesComparables
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

    it('trie les défis du plus faible au plus fort SELON L\'ÉCHELLE, pas selon IDME', () => {
        // Dans `ECHELLE_RENVERSEE`, « D » (Développé, 75-84) est PLUS FORT que
        // « I » (non — « I » y est Intégré, 85-100). Le seul défi lisible comme
        // « le plus faible » entre D et I est donc D. La table retirée disait
        // l'inverse : I=1 passait devant D=2.
        const win = chargerData([ECHELLE_RENVERSEE], []);
        const bilan = bilanDe(win, evaluation({
            echelleId: 'ECH_RENV',
            criteres: [critere('Analyse', 'I'), critere('Plausibilite', 'D')]
        }));

        // Le filtre `I || D` de #555 retient les deux ; c'est l'ORDRE qui est en jeu.
        expect(bilan.concentration.priorites).toHaveLength(2);
        expect(bilan.concentration.priorites[0]).toContain('Plausibilite');
        expect(bilan.concentration.priorites[1]).toContain('Analyse');
    });

    it('un niveau que l\'échelle ne connaît pas se range en DERNIER, pas en premier', () => {
        // Avant, un code inconnu valait 0 — le rang le plus bas — et devenait la
        // priorité n° 1 de l'élève. `rangOuDernier` le met en fin de file.
        const win = chargerData([ECHELLE_RENVERSEE], []);
        const bilan = bilanDe(win, evaluation({
            echelleId: 'ECH_RENV',
            criteres: [critere('Inconnu', 'D'), critere('Analyse', 'I')]
        }));
        // 'D' (75-84) et 'I' (85-100) sont tous deux lisibles ici : D d'abord.
        expect(bilan.concentration.priorites[0]).toContain('Inconnu');

        // Échelle absente : plus AUCUN rang ne se lit, l'ordre d'origine tient et
        // aucun code n'est promu par un rang inventé.
        const winSansEchelle = chargerData([], []);
        const bilanSansEchelle = bilanDe(winSansEchelle, evaluation({
            echelleId: 'ECH_DISPARUE',
            criteres: [critere('Premier', 'D'), critere('Second', 'I')]
        }));
        expect(bilanSansEchelle.concentration.priorites[0]).toContain('Premier');
    });

    it('un défi SANS rang lisible passe DERRIÈRE celui qui en a un', () => {
        // `ECHELLE_SANS_I` ne connaît pas « I ». Ce critère franchit quand même
        // la butée #555 (`I || D` = un défi), mais l'échelle ne lui donne aucun
        // rang : il ne peut pas devenir la priorité n° 1 de l'élève. Avant, un
        // code inconnu valait 0 — le rang le plus bas — et passait devant tout.
        const win = chargerData([ECHELLE_SANS_I], []);
        const bilan = bilanDe(win, evaluation({
            echelleId: 'ECH_SANS_I',
            criteres: [critere('SansRang', 'I'), critere('AvecRang', 'D')]
        }));

        expect(bilan.concentration.priorites).toHaveLength(2);
        expect(bilan.concentration.priorites[0]).toContain('AvecRang');
        expect(bilan.concentration.priorites[1]).toContain('SansRang');
    });

    // ── 2. « TA FORCE » ──────────────────────────────────────────────────────

    it('« ta force » est le critère le plus haut DE L\'ÉCHELLE', () => {
        // « M » (Mobilisé, 60-74) et « E » (Émergent, 0-59) sont tous deux
        // acceptés par la butée #555 (`=== 'M' || === 'E'`). Le plus HAUT des
        // deux, dans cette échelle, est M. La table retirée choisissait E (=4).
        const win = chargerData([ECHELLE_RENVERSEE], []);
        const bilan = bilanDe(win, evaluation({
            echelleId: 'ECH_RENV',
            criteres: [critere('Analyse', 'E'), critere('Plausibilite', 'M')]
        }));
        expect(bilan.recurrents.force).toContain('Plausibilite');
        expect(bilan.recurrents.force).not.toContain('Analyse');
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

    it('« étendre tes compétences vers… » nomme le niveau LE PLUS HAUT de l\'échelle', () => {
        // Avant : « vers le niveau É (transfert à d'autres contextes) », écrit en
        // dur — le dernier niveau de l'échelle de Grégoire, dans le PDF d'un·e
        // autre. Ici, le plus haut de `ECHELLE_RENVERSEE` est « I / Intégré ».
        const anterieure = evaluation({
            id: 'EV_ANCIENNE', echelleId: 'ECH_RENV', dateEvaluation: '2026-04-01',
            criteres: [critere('Analyse', 'M'), critere('Plausibilite', 'E')]
        });
        const win = chargerData([ECHELLE_RENVERSEE], [anterieure]);
        const bilan = bilanDe(win, evaluation({
            echelleId: 'ECH_RENV',
            criteres: [critere('Analyse', 'M'), critere('Plausibilite', 'E')]
        }));

        expect(bilan.concentration.tousMaitrises).toBe(true);
        expect(bilan.concentration.messageGlobal).toContain('vers le niveau Intégré');
        expect(bilan.concentration.messageGlobal).not.toContain('niveau É');
        expect(bilan.concentration.messageGlobal).not.toContain('transfert à d\'autres contextes');
    });

    it('sans échelle résolue, la phrase s\'arrête au lieu de nommer un niveau', () => {
        const anterieure = evaluation({
            id: 'EV_ANCIENNE', echelleId: 'ECH_DISPARUE', dateEvaluation: '2026-04-01',
            criteres: [critere('Analyse', 'M')]
        });
        const win = chargerData([], [anterieure]);
        const bilan = bilanDe(win, evaluation({
            echelleId: 'ECH_DISPARUE', criteres: [critere('Analyse', 'M')]
        }));

        expect(bilan.concentration.messageGlobal).toContain('Tu peux aider tes collègues.');
        expect(bilan.concentration.messageGlobal).not.toContain('vers le niveau');
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

    it('identite-des-butees — les comparaisons de #555 restent au compte connu', () => {
        // ⚠ CE TEST CONSTATE, IL NE PROTÈGE PAS. Il fige ce qui reste : SIX sites,
        // QUATORZE comparaisons. Il rougira le jour où #555 (la marque de
        // maîtrise) les retirera — et c'est le signal voulu. Ne pas le
        // « réparer » en changeant les chiffres : le corriger, c'est retirer les
        // comparaisons.
        //
        // ⚠ `!==` COMPTE AUTANT QUE `===`, et l'oublier a coûté une mesure fausse
        // en écrivant ce fichier : `construireForce` filtre par
        // `!== 'M' && !== 'E'`, un site entier qu'un motif en `===` seul rate.
        const motif = /[!=]==\s*'[IDME0]'/g;
        const sites = codeSeul.split('\n').filter((l) => new RegExp(motif.source).test(l));
        expect(sites).toHaveLength(6);
        expect(codeSeul.match(motif) || []).toHaveLength(14);
    });
});
