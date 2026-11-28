/**
 * LE BANC D'ÉQUIVALENCE DU CALCUL HYBRIDE (temps 1 du lot « calcul hybride unique », 28 nov. 2026).
 *
 * Ce module porte les ENTRÉES du banc (corpus, élèves, réglages) et la LECTURE d'un résultat (sa signature). Il ne
 * porte aucune valeur attendue : les valeurs figées vivent dans
 * `tests/fixtures/equivalence-calcul-hybride-2026-11-28/constantes.json`, écrites une fois avec les fonctions d'avant le
 * lot (commit e303f4768) et jamais recalculées par le code que le banc juge.
 *
 * ⚠ Le harnais charge le VRAI registre, la vraie résolution de la pratique active, portfolio.js, l'instance des standards
 * et profil-etudiant-actions.js. Une session qui déplace le calcul dans un autre fichier ajoute ce fichier à
 * `SCRIPTS_DU_CALCUL` : c'est permis, changer une entrée ou une constante ne l'est pas.
 *
 * Noms d'élèves : aucun. Les élèves sont des DA fictifs (2000001 à 2000008).
 */
import { chargerScript } from './charger-script.js';
import { pontsResolution } from './ponts-resolution.js';

export const ID_PRATIQUE = 'P-banc-hybride';

/** Les scripts du calcul, dans l'ordre de chargement. */
export const SCRIPTS_DU_CALCUL = [
    'js/entites/production-diagnostique.js',
    'js/pratiques/pratique-registre.js',
    'js/pratiques/pratique-pan-standards.js',
    'js/portfolio.js',
    'js/profil-etudiant-actions.js'
];

/* ------------------------------------------------------------------
   LES CORPUS — six productions au pool, rangées hors de l'ordre des numéros (l'ordre de stockage départage
   les égalités et les règles inconnues). Quatre « selection », deux « obligatoire ».
   ------------------------------------------------------------------ */

/** Les six emplacements du pool, dans l'ordre de stockage. */
const ORDRE_STOCKAGE = [3, 1, 2, 6, 4, 5];
const CATEGORIE = { 1: 'selection', 2: 'selection', 3: 'selection', 4: 'selection', 5: 'obligatoire', 6: 'obligatoire' };
/** Pondérations propres des productions SANS artefact (des zéros : le champ laissé vide s'écrit 0). */
const PONDERATION_SANS_ARTEFACT = { 1: 10, 2: 0, 3: 15, 4: 20, 5: 0, 6: 15 };

function productionsDuPool(prefixe, type, avecPonderation, categorieUnique) {
    return ORDRE_STOCKAGE.map(n => {
        const p = { id: prefixe + n, titre: prefixe + n, type, numero: n, categorie: categorieUnique || CATEGORIE[n] };
        if (avecPonderation) p.ponderation = PONDERATION_SANS_ARTEFACT[n];
        return p;
    });
}

/** Les productions hors pool communes : un travail formatif (ancien type, sans écrivain), une diagnostique. */
const FORMATIVE = { id: 'F1', titre: 'F1', type: 'examen-formatif', numero: 7, categorie: null, ponderation: 0 };
const DIAGNOSTIQUE = { id: 'D1', titre: 'D1', type: 'travail', numero: 0, diagnostique: true, ponderation: 5, categorie: 'selection' };
const TERMINALE = { id: 'T', titre: 'T', type: 'terminale', numero: 8, ponderation: 40 };

export const CORPUS = {
    // Avec artefacts : conteneur pondéré 60, terminale 40.
    ART: {
        slot: 'A',
        productions: () => [
            { id: 'PF', titre: 'PF', type: 'portfolio', ponderation: 60 },
            ...productionsDuPool('A', 'artefact-portfolio', false),
            FORMATIVE, TERMINALE, DIAGNOSTIQUE
        ]
    },
    // Avec artefacts, et deux marques « obligatoire » qui ne sont pas au pool : un travail (hors artefacts) et la
    // terminale (#339).
    ART_OBL_HORS: {
        slot: 'A',
        productions: () => [
            { id: 'PF', titre: 'PF', type: 'portfolio', ponderation: 60 },
            ...productionsDuPool('A', 'artefact-portfolio', false),
            { id: 'X1', titre: 'X1', type: 'travail', numero: 9, categorie: 'obligatoire', ponderation: 10 },
            FORMATIVE, Object.assign({}, TERMINALE, { categorie: 'obligatoire' }), DIAGNOSTIQUE
        ]
    },
    // Sans artefact : la terminale pondérée 40, le pool au complément (60).
    SANS: {
        slot: 'P',
        productions: () => [...productionsDuPool('P', 'travail', true), FORMATIVE, TERMINALE, DIAGNOSTIQUE]
    },
    // Sans artefact ni terminale : le pool vaut 100 %.
    SANS_T: {
        slot: 'P',
        productions: () => [...productionsDuPool('P', 'travail', true), FORMATIVE, DIAGNOSTIQUE]
    },
    // La mesure de l'arrêt « Toutes » : tout le pool marqué « obligatoire » (le bloc Obligatoires seul, que le calcul
    // d'aujourd'hui sait faire), et tout le pool marqué « selection » (le bloc Sélection seul).
    ART_TOUT_OBL: {
        slot: 'A',
        productions: () => [
            { id: 'PF', titre: 'PF', type: 'portfolio', ponderation: 60 },
            ...productionsDuPool('A', 'artefact-portfolio', false, 'obligatoire'),
            FORMATIVE, TERMINALE, DIAGNOSTIQUE
        ]
    },
    ART_TOUT_SEL: {
        slot: 'A',
        productions: () => [
            { id: 'PF', titre: 'PF', type: 'portfolio', ponderation: 60 },
            ...productionsDuPool('A', 'artefact-portfolio', false, 'selection'),
            FORMATIVE, TERMINALE, DIAGNOSTIQUE
        ]
    },
    SANS_TOUT_OBL: {
        slot: 'P',
        productions: () => [...productionsDuPool('P', 'travail', true, 'obligatoire'), FORMATIVE, TERMINALE, DIAGNOSTIQUE]
    }
};

/* ------------------------------------------------------------------
   LES ÉLÈVES — chacun porte un cas. `s1`…`s6` désignent les emplacements du pool, `f` le formatif, `t` la
   terminale, `d` la diagnostique. Les copies sont listées dans l'ORDRE DE STOCKAGE voulu.
   ------------------------------------------------------------------ */

export const ELEVES = {
    // Toutes les copies, notes distinctes, terminale notée.
    2000001: [['s1', 72], ['s2', 85], ['s3', 64], ['s4', 90], ['s5', 78], ['s6', 81], ['f', 55], ['t', 88], ['d', 99]],
    // Égalité à la coupure : trois 80, stockées hors de l'ordre des numéros ; pas de terminale.
    2000002: [['s4', 80], ['s2', 80], ['s3', 80], ['s1', 70], ['s5', 66]],
    // Des manques : s2 (sélection) et s5 (obligatoire) non remises.
    2000003: [['s1', 60], ['s3', 75], ['s6', 82], ['s4', 68], ['t', 70]],
    // Non recevables : s1 (plagiat) et s6 (IA) sortent du pool ; la terminale non recevable vaut 0.
    2000004: [['s1', 90, { statutIntegrite: 'plagiat' }], ['s2', 77], ['s3', 69], ['s4', 74], ['s5', 88],
        ['s6', 71, { statutIntegrite: 'ia' }], ['t', 95, { statutIntegrite: 'plagiat' }]],
    // Reprises : s1 remplacée par une reprise qui compte ; s2 dont la reprise est un brouillon (l'originale compte) ;
    // s3 en brouillon seul ; s5 de portée nulle ; s6 doublée d'une copie réconciliée (#360) ; s4 « travail en cours ».
    2000005: [
        ['s1', 50, { id: 'R-o1', remplaceeParId: 'R-r1' }], ['s1', 83, { id: 'R-r1', repriseDeId: 'R-o1' }],
        ['s2', 62, { id: 'R-o2', remplaceeParId: 'R-r2' }], ['s2', 95, { id: 'R-r2', repriseDeId: 'R-o2', verrouillee: false }],
        ['s3', 99, { verrouillee: false }],
        ['s4', 80, { travailEnCours: true }],
        ['s5', 74, { ponderationCouverte: 0 }],
        ['s6', 40, { id: 'R-d6', remplaceeParId: 'R-v6', reconcilieParDoublon: true }], ['s6', 79, { id: 'R-v6' }],
        ['t', 76]
    ],
    // Peu de copies : une sélection, une obligatoire ; pas de terminale.
    2000006: [['s2', 71], ['s5', 84]],
    // Aucune copie au pool : la terminale seule.
    2000007: [['t', 77]],
    // Le formatif d'abord, puis trois copies du pool.
    2000008: [['f', 95], ['s1', 58], ['s4', 66], ['s6', 73], ['t', 64]]
};

function evaluationsDuCorpus(corpus) {
    const slot = CORPUS[corpus].slot;
    const productionDe = (cle) => {
        if (cle === 'f') return 'F1';
        if (cle === 't') return 'T';
        if (cle === 'd') return 'D1';
        return slot + cle.slice(1);
    };
    const evaluations = [];
    Object.keys(ELEVES).forEach(da => {
        ELEVES[da].forEach(([cle, note, extra], i) => {
            const pid = productionDe(cle);
            if (corpus === 'SANS_T' && pid === 'T') return;   // pas de terminale dans ce corpus
            const e = Object.assign({
                id: 'E' + da + '-' + i, etudiantDA: da, productionId: pid, noteFinale: note,
                niveauFinal: 'M', verrouillee: true, ponderationCouverte: 100, statutIntegrite: 'recevable',
                remplaceeParId: null, dateEvaluation: '2026-10-' + String(10 + i).padStart(2, '0')
            }, extra || {});
            if (extra && extra.id) e.id = da + '-' + extra.id;
            if (extra && extra.remplaceeParId) e.remplaceeParId = da + '-' + extra.remplaceeParId;
            if (extra && extra.repriseDeId) e.repriseDeId = da + '-' + extra.repriseDeId;
            evaluations.push(e);
        });
    });
    return evaluations;
}

/* ------------------------------------------------------------------
   LES RÉGLAGES
   ------------------------------------------------------------------ */

const CONFORMITE = {
    actif: true,
    plafonds: [
        { deficit: 1, seuilMax: 75, niveauCode: 'M', echec: false },
        { deficit: 2, seuilMax: 65, niveauCode: 'D', echec: false },
        { deficit: 3, seuilMax: null, niveauCode: null, echec: true }
    ]
};

/** Les modes hors deux blocs. « inconnue » : une valeur qu'aucune branche ne connaît (l'ordre de stockage, coupé à N). */
export const MODES_SIMPLES = ['meilleurs', 'derniers', 'recents', 'recents-meilleurs', 'tous', 'hybride', 'inconnue'];

/**
 * La configuration d'un cas.
 * @param {object} r - { mode, n, finale, conformite, categories ('aucune' | 'pleines' | 'minimales' | 'moitie'),
 *   nSelection, exclues }
 */
export function configurationDuCas(r) {
    const conf = {
        type: 'standards',
        portfolio: {
            methodeSelection: r.mode,
            nombreARetenir: r.n,
            minimumCompletion: 6,
            reglesConformite: r.conformite ? CONFORMITE : { actif: false }
        },
        notesFinales: !!r.finale
    };
    if (r.categories === 'pleines') {
        conf.categories = { actif: true, selection: { nombreARetenir: r.nSelection, ponderation: 65 }, obligatoires: { ponderation: 35 } };
    } else if (r.categories === 'moitie') {
        conf.categories = { actif: true, selection: { nombreARetenir: r.nSelection, ponderation: 50 }, obligatoires: { ponderation: 50 } };
    } else if (r.categories === 'minimales') {
        conf.categories = { actif: true };
    } else if (r.categories === 'inactives') {
        // Le reste d'une hybride éteinte : les catégories sont là, inactives.
        conf.categories = { actif: false, selection: { nombreARetenir: r.nSelection, ponderation: 65 }, obligatoires: { ponderation: 35 } };
    }
    if (r.exclues) conf.productionsExclues = r.exclues.slice();
    return conf;
}

/** La matrice : une liste de cas { nom, corpus, reglages }. */
export function matrice() {
    const cas = [];
    const ajouter = (corpus, reglages) => {
        const deuxBlocs = reglages.categories && reglages.categories !== 'inactives';
        const morceaux = [corpus, deuxBlocs
            ? 'deux-blocs-' + reglages.categories + '-N' + (reglages.nSelection === undefined ? '-' : reglages.nSelection)
                + ' (portfolio ' + reglages.mode + ')'
            : reglages.mode + '-N' + reglages.n];
        if (reglages.categories === 'inactives') morceaux.push('categories-inactives');
        morceaux.push(reglages.finale ? 'finale' : 'provisoire');
        if (reglages.conformite) morceaux.push('conformite');
        if (reglages.exclues) morceaux.push('exclues-' + reglages.exclues.join('+'));
        cas.push({ nom: morceaux.join(' · '), corpus, reglages });
    };
    ['ART', 'SANS', 'SANS_T'].forEach(corpus => {
        MODES_SIMPLES.forEach(mode => {
            [3, 6, 9].forEach(n => ajouter(corpus, { mode, n, finale: false }));
            ajouter(corpus, { mode, n: 6, finale: true });
            ajouter(corpus, { mode, n: 6, finale: false, conformite: true });
        });
        // Le reste d'une hybride éteinte (catégories inactives) ne change rien : deux modes suffisent à le dire.
        ['meilleurs', 'tous'].forEach(mode => ajouter(corpus, { mode, n: 3, finale: true, categories: 'inactives', nSelection: 2 }));
        [2, 4, 6].forEach(nSelection => [false, true].forEach(finale =>
            ajouter(corpus, { mode: 'meilleurs', n: 6, finale, categories: 'pleines', nSelection })));
        [false, true].forEach(finale => {
            ajouter(corpus, { mode: 'hybride', n: 6, finale, categories: 'moitie', nSelection: 4 });
            ajouter(corpus, { mode: 'meilleurs', n: 6, finale, categories: 'minimales' });
            ajouter(corpus, { mode: 'meilleurs', n: 6, finale, categories: 'pleines', nSelection: 4, conformite: true });
            ajouter(corpus, { mode: 'tous', n: 6, finale, categories: 'pleines', nSelection: 4 });
        });
    });
    // Les productions écartées par la pratique (sans artefact seulement ; l'hybride les ignore).
    ['SANS', 'SANS_T'].forEach(corpus => {
        MODES_SIMPLES.forEach(mode => [false, true].forEach(finale =>
            ajouter(corpus, { mode, n: 3, finale, exclues: ['P4', 'F1', 'P-inconnue'] })));
        [false, true].forEach(finale =>
            ajouter(corpus, { mode: 'meilleurs', n: 6, finale, categories: 'pleines', nSelection: 2, exclues: ['P4', 'P5'] }));
    });
    // Avec artefacts, les productions écartées n'agissent pas (le pool est fait d'artefacts).
    [false, true].forEach(finale => ajouter('ART', { mode: 'meilleurs', n: 3, finale, exclues: ['A4', 'A5'] }));
    // Les marques « obligatoire » hors du pool (travail, terminale).
    [2, 4].forEach(nSelection => [false, true].forEach(finale =>
        ajouter('ART_OBL_HORS', { mode: 'meilleurs', n: 6, finale, categories: 'pleines', nSelection })));
    [false, true].forEach(finale => ajouter('ART_OBL_HORS', { mode: 'tous', n: 6, finale }));
    // L'arrêt « Toutes » : le même corpus sous « tous » et sous le bloc Obligatoires seul ; la Sélection seule sous
    // « N meilleures » et sous le bloc Sélection seul.
    ['ART_TOUT_OBL', 'SANS_TOUT_OBL'].forEach(corpus => [false, true].forEach(finale => {
        ajouter(corpus, { mode: 'tous', n: 6, finale });
        ajouter(corpus, { mode: 'meilleurs', n: 6, finale, categories: 'pleines', nSelection: 4 });
    }));
    [3, 6, 9].forEach(n => [false, true].forEach(finale => {
        ajouter('ART_TOUT_SEL', { mode: 'meilleurs', n, finale });
        ajouter('ART_TOUT_SEL', { mode: 'meilleurs', n: 6, finale, categories: 'pleines', nSelection: n });
    }));
    return cas;
}

/* ------------------------------------------------------------------
   LE HARNAIS ET LA SIGNATURE
   ------------------------------------------------------------------ */

/** Monte la chaîne du calcul sur un cas ; rend le faux window. */
export function monterLeCas(cas) {
    const store = {
        productions: CORPUS[cas.corpus].productions(),
        evaluationsSauvegardees: evaluationsDuCorpus(cas.corpus),
        groupeEtudiants: Object.keys(ELEVES).map(da => ({ da })),
        pratiquesConfigurables: [{
            id: ID_PRATIQUE, nom: 'Pratique du banc', type: 'standards',
            configuration: configurationDuCas(cas.reglages)
        }],
        modalitesEvaluation: {}
    };
    const db = {
        getSync: (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
        setSync: (k, v) => { store[k] = v; },
        get: async (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
        set: async (k, v) => { store[k] = v; }
    };
    const cle = (k) => k;
    const obtenirDonneesSelonMode = (k) => (k in store ? store[k] : null);
    const win = { addEventListener() {}, removeEventListener() {} };
    const ponts = {
        db, cle, obtenirDonneesSelonMode,
        estEtudiantExclu: () => false,
        contexteImposeNoteProvisoire: () => false,
        obtenirTypePratiqueActive: () => 'standards',
        obtenirPratiqueActiveGroupeCours: () => ID_PRATIQUE,
        ...pontsResolution(win, () => ID_PRATIQUE),
        obtenirPratiqueParId: (...a) => win.obtenirPratiqueParId(...a),
        obtenirConfigPratiqueActive: (...a) => win.obtenirConfigPratiqueActive(...a),
        obtenirConfigCategories: (...a) => win.obtenirConfigCategories(...a),
        calculerDetailsNoteFinale: (...a) => win.calculerDetailsNoteFinale(...a),
        PratiqueConfigurable: function () {}
    };
    SCRIPTS_DU_CALCUL.forEach(script => chargerScript(script, ponts, win));
    return win;
}

const ABREGE_SORT = { compte: 'c', obligatoire: 'o', ecarte: 'e', remplace: 'r' };

/**
 * La signature d'un résultat de `calculerDetailsNoteFinale` : ce que le banc fige.
 * La note et la moyenne du pool en nombres exacts (JSON les rend sans perte), les productions retenues DANS L'ORDRE,
 * le récit (production : sort), la clé et le libellé de la méthode (le PDF lit « hybride (catégories) » comme une clé),
 * le plafonnement, le statut provisoire, et la cause d'une note absente.
 */
export function signature(d) {
    if (d === null || d === undefined) return null;
    const p = d.portfolio;
    return {
        note: d.noteFinale,
        moyenne: p ? p.moyenne : null,
        retenues: p ? p.artefactsRetenus.map(a => a.productionId) : null,
        notesRetenues: p ? p.artefactsRetenus.map(a => a.note) : null,
        evaluees: p ? p.nombreEvalues : null,
        recit: d.recit ? d.recit.resultats.map(r => r.label + ':' + (ABREGE_SORT[r.sort] || r.sort)) : null,
        methode: p ? p.methodeSelection : null,
        methodeCle: p ? p.methodeSelectionCle : null,
        plafond: (p && p.plafonnement) ? [p.plafonnement.deficit, p.plafonnement.seuilMax, p.plafonnement.echec, p.plafonnement.moyenneOriginale] : null,
        terminale: d.terminal ? d.terminal.note : null,
        provisoire: d.estProvisoire,
        finale: d.estFinale === undefined ? null : d.estFinale,
        erreur: d.erreur || null
    };
}

/** Les signatures d'un cas, par DA. */
export function signaturesDuCas(cas) {
    const win = monterLeCas(cas);
    const out = {};
    Object.keys(ELEVES).forEach(da => { out[da] = signature(win.calculerDetailsNoteFinale(da)); });
    return out;
}

/** L'ordre des champs d'une signature compacte (le fichier de constantes la range ainsi). */
export const CHAMPS_COMPACTS = ['note', 'moyenne', 'retenues', 'evaluees', 'recit', 'methode', 'methodeCle', 'plafond',
    'terminale', 'provisoire', 'finale', 'erreur'];

/**
 * La signature compacte : un tableau dans l'ordre de `CHAMPS_COMPACTS`, les listes jointes par des virgules, le texte
 * d'une erreur remplacé par sa clé du dictionnaire `erreurs` (un texte absent du dictionnaire reste en clair, préfixé :
 * il fait échouer la comparaison et se lit dans le message).
 */
export function compacter(sig, erreurs) {
    if (sig === null) return null;
    const cleErreur = (texte) => {
        if (texte === null) return null;
        const cle = Object.keys(erreurs).find(k => erreurs[k] === texte);
        return cle || ('TEXTE INCONNU : ' + texte);
    };
    return CHAMPS_COMPACTS.map(champ => {
        const v = sig[champ];
        if (champ === 'erreur') return cleErreur(v);
        if (Array.isArray(v) && champ !== 'plafond') return v.join(',');
        return v;
    });
}
