/* ===============================
   BILAN RÉFLEXIF — Données de référence
   Questionnaire démo + résultats simulés
   =============================== */

var BILAN_REFLEXIF_DATA = (function() {
'use strict';

// === Échelle Likert 4 niveaux ===
var ECHELLE_LIKERT4 = [
    { valeur: 4, label: 'Tout \u00e0 fait d\u2019accord' },
    { valeur: 3, label: 'Plut\u00f4t d\u2019accord' },
    { valeur: 2, label: 'Plut\u00f4t en d\u00e9saccord' },
    { valeur: 1, label: 'Pas du tout d\u2019accord' }
];

// Mapping texte → valeur numérique (FR + EN)
var MAPPING_LIKERT = {
    'tout \u00e0 fait d\u2019accord': 4, 'tout a fait d\'accord': 4,
    'plut\u00f4t d\u2019accord': 3, 'plutot d\'accord': 3,
    'plut\u00f4t en d\u00e9saccord': 2, 'plutot en desaccord': 2,
    'pas du tout d\u2019accord': 1, 'pas du tout d\'accord': 1,
    'strongly agree': 4, 'agree': 3, 'disagree': 2, 'strongly disagree': 1,
    '4': 4, '3': 3, '2': 2, '1': 1
};

// === Couleurs Likert (variables CSS) ===
var COULEURS_LIKERT = {
    4: { variable: '--vert-succes',   fallback: '#34c759', label: 'Tout \u00e0 fait' },
    3: { variable: '--vert-leger',    fallback: '#3aaa8a', label: 'Plut\u00f4t' },
    2: { variable: '--orange-accent', fallback: '#c8a060', label: 'Plut\u00f4t en d\u00e9saccord' },
    1: { variable: '--rouge-erreur',  fallback: '#e84057', label: 'Pas du tout' }
};

// === Blocs thématiques préconstruits ===
var BLOCS_DEMO = [
    {
        id: 'bloc_evaluation',
        titre: 'Syst\u00e8me d\u2019\u00e9valuation',
        actif: true,
        questions: [
            { id: 'q_eval_01', texte: 'Le syst\u00e8me d\u2019\u00e9valuation me permet de me situer dans mon apprentissage.', type: 'likert4', obligatoire: true, personnalisee: false },
            { id: 'q_eval_02', texte: 'Les crit\u00e8res d\u2019\u00e9valuation sont clairs et compr\u00e9hensibles.', type: 'likert4', obligatoire: true, personnalisee: false },
            { id: 'q_eval_03', texte: 'Les \u00e9valuations refl\u00e8tent bien ce qui a \u00e9t\u00e9 enseign\u00e9.', type: 'likert4', obligatoire: true, personnalisee: false },
            { id: 'q_eval_04', texte: 'Je comprends comment ma note finale est calcul\u00e9e.', type: 'likert4', obligatoire: true, personnalisee: false },
            { id: 'q_eval_ouvert', texte: 'As-tu des commentaires sur le syst\u00e8me d\u2019\u00e9valuation\u00a0?', type: 'ouvert', obligatoire: false, personnalisee: false }
        ]
    },
    {
        id: 'bloc_retroaction',
        titre: 'R\u00e9troaction et accompagnement',
        actif: true,
        questions: [
            { id: 'q_retro_01', texte: 'Les r\u00e9troactions re\u00e7ues me permettent de m\u2019am\u00e9liorer.', type: 'likert4', obligatoire: true, personnalisee: false },
            { id: 'q_retro_02', texte: 'Je re\u00e7ois les r\u00e9troactions dans un d\u00e9lai raisonnable.', type: 'likert4', obligatoire: true, personnalisee: false },
            { id: 'q_retro_03', texte: 'L\u2019enseignant est disponible quand j\u2019ai besoin d\u2019aide.', type: 'likert4', obligatoire: true, personnalisee: false },
            { id: 'q_retro_04', texte: 'Je me sens \u00e0 l\u2019aise de poser des questions en classe.', type: 'likert4', obligatoire: true, personnalisee: false },
            { id: 'q_retro_ouvert', texte: 'As-tu des commentaires sur l\u2019accompagnement re\u00e7u\u00a0?', type: 'ouvert', obligatoire: false, personnalisee: false }
        ]
    },
    {
        id: 'bloc_pedagogie',
        titre: 'Approche p\u00e9dagogique',
        actif: true,
        questions: [
            { id: 'q_peda_01', texte: 'Les activit\u00e9s en classe m\u2019aident \u00e0 comprendre la mati\u00e8re.', type: 'likert4', obligatoire: true, personnalisee: false },
            { id: 'q_peda_02', texte: 'Le rythme du cours me convient.', type: 'likert4', obligatoire: true, personnalisee: false },
            { id: 'q_peda_03', texte: 'Les consignes des travaux sont claires.', type: 'likert4', obligatoire: true, personnalisee: false },
            { id: 'q_peda_04', texte: 'Le mat\u00e9riel p\u00e9dagogique (notes, documents, pr\u00e9sentations) est utile.', type: 'likert4', obligatoire: true, personnalisee: false },
            { id: 'q_peda_ouvert', texte: 'As-tu des suggestions pour am\u00e9liorer l\u2019approche p\u00e9dagogique\u00a0?', type: 'ouvert', obligatoire: false, personnalisee: false }
        ]
    },
    {
        id: 'bloc_metacognition',
        titre: 'M\u00e9tacognition et autor\u00e9gulation',
        actif: true,
        questions: [
            { id: 'q_meta_01', texte: 'Ce cours m\u2019a aid\u00e9 \u00e0 mieux comprendre comment j\u2019apprends.', type: 'likert4', obligatoire: true, personnalisee: false },
            { id: 'q_meta_02', texte: 'Je suis capable d\u2019identifier mes forces et mes d\u00e9fis dans cette mati\u00e8re.', type: 'likert4', obligatoire: true, personnalisee: false },
            { id: 'q_meta_03', texte: 'J\u2019ai d\u00e9velopp\u00e9 de meilleures strat\u00e9gies de travail gr\u00e2ce \u00e0 ce cours.', type: 'likert4', obligatoire: true, personnalisee: false }
        ]
    },
    {
        id: 'bloc_transfert',
        titre: 'Transfert des apprentissages',
        actif: true,
        questions: [
            { id: 'q_trans_01', texte: 'Je vois le lien entre ce que j\u2019apprends dans ce cours et d\u2019autres contextes.', type: 'likert4', obligatoire: true, personnalisee: false },
            { id: 'q_trans_02', texte: 'Les apprentissages de ce cours me seront utiles dans mes \u00e9tudes futures.', type: 'likert4', obligatoire: true, personnalisee: false },
            { id: 'q_trans_03', texte: 'Je peux appliquer ce que j\u2019ai appris dans des situations nouvelles.', type: 'likert4', obligatoire: true, personnalisee: false }
        ]
    },
    {
        id: 'bloc_efficacite',
        titre: 'Sentiment d\u2019efficacit\u00e9',
        actif: true,
        questions: [
            { id: 'q_effi_01', texte: 'Je me sens comp\u00e9tent dans cette mati\u00e8re.', type: 'likert4', obligatoire: true, personnalisee: false },
            { id: 'q_effi_02', texte: 'J\u2019ai confiance en ma capacit\u00e9 de r\u00e9ussir ce cours.', type: 'likert4', obligatoire: true, personnalisee: false },
            { id: 'q_effi_03', texte: 'Mes efforts dans ce cours portent leurs fruits.', type: 'likert4', obligatoire: true, personnalisee: false },
            { id: 'q_effi_04', texte: 'Je sais quoi faire quand je rencontre une difficult\u00e9.', type: 'likert4', obligatoire: true, personnalisee: false },
            { id: 'q_effi_ouvert', texte: 'Comment d\u00e9crirais-tu ton exp\u00e9rience globale dans ce cours\u00a0?', type: 'ouvert', obligatoire: false, personnalisee: false }
        ]
    },
    {
        id: 'bloc_climat',
        titre: 'Climat de classe',
        actif: true,
        questions: [
            { id: 'q_clim_01', texte: 'Le climat de classe est respectueux et propice \u00e0 l\u2019apprentissage.', type: 'likert4', obligatoire: true, personnalisee: false },
            { id: 'q_clim_02', texte: 'Je me sens \u00e0 l\u2019aise de participer aux discussions en classe.', type: 'likert4', obligatoire: true, personnalisee: false },
            { id: 'q_clim_03', texte: 'Les interactions entre \u00e9tudiants sont enrichissantes.', type: 'likert4', obligatoire: true, personnalisee: false }
        ]
    },
    {
        id: 'bloc_preparation',
        titre: 'Pr\u00e9paration pour la suite',
        actif: true,
        questions: [
            { id: 'q_prep_01', texte: 'Ce cours m\u2019a bien pr\u00e9par\u00e9 pour la suite de mon parcours.', type: 'likert4', obligatoire: true, personnalisee: false },
            { id: 'q_prep_02', texte: 'Je me sens mieux outill\u00e9 qu\u2019au d\u00e9but du trimestre.', type: 'likert4', obligatoire: true, personnalisee: false },
            { id: 'q_prep_03', texte: 'Je recommanderais cette approche p\u00e9dagogique \u00e0 d\u2019autres \u00e9tudiants.', type: 'likert4', obligatoire: true, personnalisee: false },
            { id: 'q_prep_ouvert', texte: 'Si tu avais un conseil \u00e0 donner aux prochains \u00e9tudiants de ce cours, quel serait-il\u00a0?', type: 'ouvert', obligatoire: false, personnalisee: false }
        ]
    }
];

// === Questionnaire démo complet ===
function creerQuestionnaireDemoComplet() {
    return {
        id: 'questionnaire_demo',
        titre: 'Bilan de fin de trimestre (mod\u00e8le)',
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString(),
        blocs: JSON.parse(JSON.stringify(BLOCS_DEMO)),
        questionsPersonnalisees: []
    };
}

// === Données démo (30 répondants simulés) ===
function genererResultatsDemo() {
    var NB_REPONDANTS = 30;

    // Distributions réalistes par bloc
    // Format: [nb_4, nb_3, nb_2, nb_1] pour 30 répondants
    var distributions = {
        // Évaluation — bloc solide
        'q_eval_01': [10, 15, 4, 1],
        'q_eval_02': [12, 14, 3, 1],
        'q_eval_03': [9, 16, 4, 1],
        'q_eval_04': [11, 13, 5, 1],
        // Rétroaction — bloc solide
        'q_retro_01': [13, 13, 3, 1],
        'q_retro_02': [8, 14, 6, 2],
        'q_retro_03': [14, 12, 3, 1],
        'q_retro_04': [11, 14, 4, 1],
        // Pédagogie — bon
        'q_peda_01': [12, 14, 3, 1],
        'q_peda_02': [9, 13, 6, 2],
        'q_peda_03': [10, 15, 4, 1],
        'q_peda_04': [11, 14, 4, 1],
        // Métacognition — signal FAIBLE volontaire (pour montrer la détection)
        'q_meta_01': [4, 10, 11, 5],
        'q_meta_02': [6, 12, 8, 4],
        'q_meta_03': [3, 9, 12, 6],
        // Transfert — moyen
        'q_trans_01': [8, 14, 6, 2],
        'q_trans_02': [9, 13, 6, 2],
        'q_trans_03': [7, 12, 8, 3],
        // Efficacité — bon
        'q_effi_01': [10, 14, 5, 1],
        'q_effi_02': [12, 13, 4, 1],
        'q_effi_03': [11, 14, 4, 1],
        'q_effi_04': [9, 13, 6, 2],
        // Climat — très bon
        'q_clim_01': [15, 12, 2, 1],
        'q_clim_02': [13, 13, 3, 1],
        'q_clim_03': [11, 14, 4, 1],
        // Préparation — bon
        'q_prep_01': [10, 15, 4, 1],
        'q_prep_02': [12, 13, 4, 1],
        'q_prep_03': [11, 14, 4, 1]
    };

    // Réponses ouvertes simulées
    var reponsesOuvertes = {
        'q_eval_ouvert': [
            'Le syst\u00e8me est clair, je sais toujours o\u00f9 j\u2019en suis.',
            'J\u2019aurais aim\u00e9 plus de d\u00e9tails sur les crit\u00e8res au d\u00e9but.',
            'C\u2019est bien, mais les pond\u00e9rations pourraient \u00eatre mieux expliqu\u00e9es.',
            'Tr\u00e8s appr\u00e9ci\u00e9 de pouvoir suivre ma progression.',
            'Rien \u00e0 dire, c\u2019\u00e9tait transparent.'
        ],
        'q_retro_ouvert': [
            'Les commentaires sont tr\u00e8s utiles et personnalis\u00e9s.',
            'Parfois un peu long avant de recevoir la r\u00e9troaction.',
            'J\u2019aurais aim\u00e9 plus de r\u00e9troaction \u00e0 l\u2019oral en classe.',
            'Excellent suivi, merci !',
            'Les r\u00e9troactions \u00e9crites sont d\u00e9taill\u00e9es et constructives.'
        ],
        'q_peda_ouvert': [
            'Les ateliers pratiques sont vraiment aidants.',
            'Le rythme est parfois rapide pour les nouveaux concepts.',
            'J\u2019aimerais plus d\u2019exemples concrets.',
            'Bonne vari\u00e9t\u00e9 d\u2019activit\u00e9s.',
            'Les discussions en classe sont enrichissantes.'
        ],
        'q_effi_ouvert': [
            'Je me sens beaucoup plus confiant qu\u2019au d\u00e9but du trimestre.',
            'C\u2019\u00e9tait difficile au d\u00e9but mais \u00e7a s\u2019est am\u00e9lior\u00e9.',
            'J\u2019ai encore du travail \u00e0 faire, mais je vois mes progr\u00e8s.',
            'Ce cours m\u2019a donn\u00e9 confiance en mes capacit\u00e9s.',
            'Exp\u00e9rience globalement positive, j\u2019ai beaucoup appris.'
        ],
        'q_prep_ouvert': [
            'Commencez les lectures d\u00e8s le d\u00e9but, \u00e7a vaut la peine.',
            'Posez des questions, l\u2019enseignant est vraiment l\u00e0 pour aider.',
            'Ne sous-estimez pas les travaux pratiques.',
            'C\u2019est un cours exigeant mais formateur.',
            'Gardez vos notes \u00e0 jour, \u00e7a aide pour la r\u00e9vision.'
        ]
    };

    // Construire les réponses agrégées
    var reponses = {};

    // Questions Likert
    var labels = ['Tout \u00e0 fait d\u2019accord', 'Plut\u00f4t d\u2019accord', 'Plut\u00f4t en d\u00e9saccord', 'Pas du tout d\u2019accord'];
    for (var qId in distributions) {
        if (!distributions.hasOwnProperty(qId)) continue;
        var dist = distributions[qId];
        var distribution = {};
        var somme = 0;
        for (var i = 0; i < 4; i++) {
            distribution[labels[i]] = dist[i];
            somme += dist[i] * (4 - i);
        }
        reponses[qId] = {
            type: 'likert4',
            distribution: distribution,
            nbReponses: NB_REPONDANTS,
            scoreMoyen: Math.round((somme / NB_REPONDANTS) * 100) / 100
        };
    }

    // Questions ouvertes
    for (var qOuvId in reponsesOuvertes) {
        if (!reponsesOuvertes.hasOwnProperty(qOuvId)) continue;
        reponses[qOuvId] = {
            type: 'ouvert',
            reponses: reponsesOuvertes[qOuvId],
            nbReponses: reponsesOuvertes[qOuvId].length
        };
    }

    return {
        id: 'resultats_demo',
        questionnaireId: 'questionnaire_demo',
        dateImport: new Date().toISOString(),
        source: 'Donn\u00e9es de d\u00e9monstration',
        nbRepondants: NB_REPONDANTS,
        reponses: reponses
    };
}

// === Colonnes CSV à ignorer (métadonnées de formulaire) ===
var COLONNES_IGNOREES_PATTERNS = [
    /^id$/i, /^#$/i, /^horodatage/i, /^timestamp/i,
    /^date/i, /^heure/i, /^adresse/i, /^email/i,
    /^courriel/i, /^nom$/i, /^pr[eé]nom$/i, /^name$/i,
    /^score$/i, /^note$/i, /^total$/i
];

// ================================================
// === PARCOURS D'APPRENTISSAGE — Données de référence ===
// ================================================

// Émotions par défaut
var EMOTIONS_PAR_DEFAUT = [
    'Fiert\u00e9', 'Satisfaction', 'Curiosit\u00e9', 'Soulagement', 'Surprise',
    'Confusion', 'Stress', 'D\u00e9couragement', 'Indiff\u00e9rence', 'Ennui'
];

// Échelle d'effort (5 niveaux — ce n'est PAS du Likert)
var ECHELLE_EFFORT = [
    { valeur: 1, label: 'Tr\u00e8s facile' },
    { valeur: 2, label: 'Facile' },
    { valeur: 3, label: 'Mod\u00e9r\u00e9' },
    { valeur: 4, label: 'Exigeant' },
    { valeur: 5, label: 'Tr\u00e8s exigeant' }
];

// Questions transversales (fin de parcours)
var QUESTIONS_TRANSVERSALES = [
    {
        id: 'momentPivot',
        texte: 'Quelle activit\u00e9 a \u00e9t\u00e9 un moment pivot dans ton apprentissage\u00a0? Pourquoi\u00a0?',
        type: 'ouvert',
        defautActif: true
    },
    {
        id: 'changementVision',
        texte: 'Y a-t-il un cours ou un moment du trimestre qui a chang\u00e9 ta fa\u00e7on de voir les choses\u00a0?',
        type: 'ouvert',
        defautActif: true
    },
    {
        id: 'coursManques',
        texte: 'As-tu manqu\u00e9 des cours\u00a0? Si oui, pour quelle(s) raison(s)\u00a0?',
        type: 'choix_multiple_ouvert',
        choix: ['Maladie', 'Surcharge d\u2019autres cours', 'D\u00e9motivation', 'Travail', 'Raisons personnelles', 'Autre'],
        defautActif: true
    },
    {
        id: 'conseilFuturs',
        texte: 'Quel conseil donnerais-tu aux futurs \u00e9tudiants de ce cours\u00a0?',
        type: 'ouvert',
        defautActif: true
    }
];

// Types d'activités
var TYPES_ACTIVITE = [
    { id: 'production', label: 'Production \u00e9valu\u00e9e' },
    { id: 'cours', label: 'Cours / activit\u00e9 en classe' },
    { id: 'evenement', label: '\u00c9v\u00e9nement / autre' }
];

// Créer un parcours vide
function creerParcoursVide() {
    return {
        id: 'parcours_' + Date.now().toString(36),
        activites: [],
        emotionsDisponibles: EMOTIONS_PAR_DEFAUT.slice(),
        questionsTransversales: {
            momentPivot: true,
            changementVision: true,
            coursManques: true,
            conseilFuturs: true
        }
    };
}

// API publique
return {
    ECHELLE_LIKERT4: ECHELLE_LIKERT4,
    MAPPING_LIKERT: MAPPING_LIKERT,
    COULEURS_LIKERT: COULEURS_LIKERT,
    BLOCS_DEMO: BLOCS_DEMO,
    COLONNES_IGNOREES_PATTERNS: COLONNES_IGNOREES_PATTERNS,
    EMOTIONS_PAR_DEFAUT: EMOTIONS_PAR_DEFAUT,
    ECHELLE_EFFORT: ECHELLE_EFFORT,
    QUESTIONS_TRANSVERSALES: QUESTIONS_TRANSVERSALES,
    TYPES_ACTIVITE: TYPES_ACTIVITE,
    creerQuestionnaireDemoComplet: creerQuestionnaireDemoComplet,
    genererResultatsDemo: genererResultatsDemo,
    creerParcoursVide: creerParcoursVide
};

})();
