/* ===============================
   BIBLIOTHÈQUE DE CARTOUCHES DE RÉTROACTION
   ✅ CRÉATION (8 décembre 2025)

   Cartouches de rétroaction organisées par discipline
   Utilisées pour la bibliothèque partagée dans le gestionnaire de cartouches

   Structure par discipline:
   - Chimie
   - Philosophie
   - Mathématiques
   - Littérature
   - Biologie

   Licence: Creative Commons BY-NC-SA 4.0
   Auteur: Primo Primavera
   =============================== */

window.CARTOUCHES_BIBLIOTHEQUE = {
    // ===========================
    // CHIMIE
    // ===========================
    chimie: [
        {
            id: 'chimie-cartouche-rapport-labo',
            nom: 'Rétroactions rapport de laboratoire',
            discipline: 'Chimie',
            auteur: 'Primo Primavera',
            etablissement: '',
            description: 'Commentaires pour les rapports de laboratoire en chimie',
            grilleId: 'chimie-grille-rapport-labo',
            contexte: 'Rapport de laboratoire en chimie',
            criteres: [
                { id: 'protocole', nom: 'Protocole expérimental' },
                { id: 'resultats', nom: 'Résultats et observations' },
                { id: 'analyse', nom: 'Analyse et interprétation' },
                { id: 'presentation', nom: 'Présentation' }
            ],
            niveaux: [
                { code: 'I', nom: 'Insuffisant' },
                { code: 'D', nom: 'Développement' },
                { code: 'M', nom: 'Maîtrisé' },
                { code: 'E', nom: 'Étendu' }
            ],
            commentaires: {
                'protocole_I': 'Le protocole expérimental est incomplet ou absent. Décris les étapes de manipulation avec plus de détails.',
                'protocole_D': 'Le protocole est présent mais manque de précision. Ajoute des quantités exactes et des conditions expérimentales.',
                'protocole_M': 'Bon protocole, clair et reproductible. Les étapes sont bien décrites.',
                'protocole_E': 'Excellent protocole! Très détaillé et professionnel. Tu as même anticipé des sources d\'erreur possibles.',

                'resultats_I': 'Les résultats sont absents ou incomplets. Présente toutes tes observations sous forme de tableau ou graphique.',
                'resultats_D': 'Les résultats sont présents mais leur présentation pourrait être améliorée. Utilise des unités appropriées.',
                'resultats_M': 'Bonne présentation des résultats. Les données sont claires et bien organisées.',
                'resultats_E': 'Excellente présentation! Les résultats sont complets, précis et faciles à interpréter.',

                'analyse_I': 'L\'analyse est absente ou très superficielle. Explique ce que signifient tes résultats.',
                'analyse_D': 'L\'analyse est présente mais reste descriptive. Approfondie l\'interprétation de tes observations.',
                'analyse_M': 'Bonne analyse. Tu relies tes résultats aux concepts théoriques vus en classe.',
                'analyse_E': 'Analyse remarquable! Tu démontres une compréhension approfondie et fais des liens pertinents.',

                'presentation_I': 'La présentation nécessite beaucoup d\'amélioration. Soigne la mise en page et corrige les fautes.',
                'presentation_D': 'La présentation est acceptable mais pourrait être plus soignée. Vérifie l\'orthographe.',
                'presentation_M': 'Bonne présentation générale. Le rapport est clair et bien structuré.',
                'presentation_E': 'Présentation impeccable! Le rapport est professionnel et agréable à lire.'
            },
            verrouille: false,
            dansBibliotheque: false
        }
    ],

    // ===========================
    // PHILOSOPHIE
    // ===========================
    philosophie: [
        {
            id: 'philo-cartouche-dissertation',
            nom: 'Rétroactions dissertation philosophique',
            discipline: 'Philosophie',
            auteur: 'Primo Primavera',
            etablissement: '',
            description: 'Commentaires pour les dissertations en philosophie',
            grilleId: 'philo-grille-dissertation',
            contexte: 'Dissertation philosophique',
            criteres: [
                { id: 'problematique', nom: 'Problématique' },
                { id: 'argumentation', nom: 'Argumentation' },
                { id: 'conceptualisation', nom: 'Conceptualisation' },
                { id: 'structure', nom: 'Structure' }
            ],
            niveaux: [
                { code: 'I', nom: 'Insuffisant' },
                { code: 'D', nom: 'Développement' },
                { code: 'M', nom: 'Maîtrisé' },
                { code: 'E', nom: 'Étendu' }
            ],
            commentaires: {
                'problematique_I': 'La problématique n\'est pas claire ou absente. Formule une question philosophique précise.',
                'problematique_D': 'La problématique est présente mais pourrait être plus précise. Affine ta question centrale.',
                'problematique_M': 'Bonne problématique, claire et pertinente. Tu cernes bien l\'enjeu philosophique.',
                'problematique_E': 'Excellente problématique! Très bien formulée et profonde.',

                'argumentation_I': 'L\'argumentation est faible ou incohérente. Développe des arguments solides avec des exemples.',
                'argumentation_D': 'L\'argumentation est présente mais manque de profondeur. Renforce tes arguments avec plus de justifications.',
                'argumentation_M': 'Bonne argumentation. Les arguments sont cohérents et bien développés.',
                'argumentation_E': 'Argumentation remarquable! Très rigoureuse et convaincante.',

                'conceptualisation_I': 'Les concepts ne sont pas définis ou mal utilisés. Clarifie les notions philosophiques employées.',
                'conceptualisation_D': 'Les concepts sont présents mais leur utilisation manque de précision. Définis-les plus clairement.',
                'conceptualisation_M': 'Bonne conceptualisation. Les notions sont bien comprises et correctement utilisées.',
                'conceptualisation_E': 'Excellente maîtrise conceptuelle! Les notions sont définies avec précision et rigueur.',

                'structure_I': 'La structure de la dissertation est problématique. Organise ton texte en introduction, développement et conclusion.',
                'structure_D': 'La structure est présente mais pourrait être plus claire. Améliore les transitions entre les parties.',
                'structure_M': 'Bonne structure. Le texte est bien organisé et facile à suivre.',
                'structure_E': 'Structure exemplaire! Le cheminement de la pensée est limpide et cohérent.'
            },
            verrouille: false,
            dansBibliotheque: false
        }
    ],

    // ===========================
    // MATHÉMATIQUES
    // ===========================
    mathematiques: [
        {
            id: 'math-cartouche-resolution',
            nom: 'Rétroactions résolution de problèmes',
            discipline: 'Mathématiques',
            auteur: 'Primo Primavera',
            etablissement: '',
            description: 'Commentaires pour la résolution de problèmes mathématiques',
            grilleId: 'math-grille-resolution',
            contexte: 'Résolution de problèmes mathématiques',
            criteres: [
                { id: 'comprehension', nom: 'Compréhension du problème' },
                { id: 'demarche', nom: 'Démarche de résolution' },
                { id: 'calculs', nom: 'Exactitude des calculs' },
                { id: 'justification', nom: 'Justification' }
            ],
            niveaux: [
                { code: 'I', nom: 'Insuffisant' },
                { code: 'D', nom: 'Développement' },
                { code: 'M', nom: 'Maîtrisé' },
                { code: 'E', nom: 'Étendu' }
            ],
            commentaires: {
                'comprehension_I': 'Tu ne sembles pas avoir compris le problème. Relis l\'énoncé attentivement et identifie les données.',
                'comprehension_D': 'Ta compréhension du problème est partielle. Assure-toi d\'avoir identifié toutes les informations pertinentes.',
                'comprehension_M': 'Bonne compréhension du problème. Tu as bien saisi ce qui est demandé.',
                'comprehension_E': 'Excellente compréhension! Tu as parfaitement cerné tous les aspects du problème.',

                'demarche_I': 'La démarche n\'est pas claire ou inappropriée. Explique comment tu comptes résoudre le problème étape par étape.',
                'demarche_D': 'Ta démarche est partiellement appropriée. Certaines étapes manquent de clarté ou de logique.',
                'demarche_M': 'Bonne démarche de résolution. Les étapes sont claires et logiques.',
                'demarche_E': 'Démarche exemplaire! Très bien structurée et efficace.',

                'calculs_I': 'Les calculs comportent de nombreuses erreurs. Revois les opérations de base et vérifie ton travail.',
                'calculs_D': 'Quelques erreurs de calcul présentes. Fais attention aux signes et aux priorités d\'opérations.',
                'calculs_M': 'Bons calculs, précis et sans erreur majeure.',
                'calculs_E': 'Calculs impeccables! Aucune erreur, présentation très soignée.',

                'justification_I': 'Les étapes ne sont pas justifiées. Explique pourquoi tu fais chaque opération.',
                'justification_D': 'Certaines étapes manquent de justification. Ajoute des explications pour clarifier ta démarche.',
                'justification_M': 'Bonnes justifications. On comprend bien ton raisonnement.',
                'justification_E': 'Justifications exemplaires! Chaque étape est parfaitement expliquée et argumentée.'
            },
            verrouille: false,
            dansBibliotheque: false
        }
    ],

    // ===========================
    // LITTÉRATURE
    // ===========================
    litterature: [
        {
            id: 'litt-cartouche-analyse',
            nom: 'Rétroactions analyse littéraire',
            discipline: 'Littérature',
            auteur: 'Primo Primavera',
            etablissement: '',
            description: 'Commentaires pour les analyses de textes littéraires',
            grilleId: 'litt-grille-analyse',
            contexte: 'Analyse de texte littéraire',
            criteres: [
                { id: 'these', nom: 'Thèse et idée directrice' },
                { id: 'procedes', nom: 'Identification des procédés' },
                { id: 'explication', nom: 'Explication et interprétation' },
                { id: 'langue', nom: 'Qualité de la langue' }
            ],
            niveaux: [
                { code: 'I', nom: 'Insuffisant' },
                { code: 'D', nom: 'Développement' },
                { code: 'M', nom: 'Maîtrisé' },
                { code: 'E', nom: 'Étendu' }
            ],
            commentaires: {
                'these_I': 'La thèse n\'est pas claire ou absente. Formule une idée directrice précise sur le sens du texte.',
                'these_D': 'La thèse est présente mais manque de clarté ou de précision. Affine ton interprétation.',
                'these_M': 'Bonne thèse, claire et pertinente. Tu proposes une interprétation cohérente du texte.',
                'these_E': 'Excellente thèse! Très bien formulée et nuancée.',

                'procedes_I': 'Les procédés littéraires ne sont pas identifiés ou sont mal nommés. Repère les figures de style et les techniques narratives.',
                'procedes_D': 'Quelques procédés sont identifiés mais il en manque plusieurs. Approfondis ton relevé.',
                'procedes_M': 'Bonne identification des procédés. Tu as repéré les éléments importants du texte.',
                'procedes_E': 'Relevé exhaustif et précis! Tu maîtrises très bien les procédés littéraires.',

                'explication_I': 'L\'explication des procédés est absente ou très superficielle. Explique l\'effet produit par chaque procédé.',
                'explication_D': 'L\'explication reste descriptive. Analyse davantage l\'effet des procédés sur le sens du texte.',
                'explication_M': 'Bonne explication. Tu analyses bien le lien entre les procédés et le sens.',
                'explication_E': 'Explication remarquable! Analyse fine et interprétation approfondie.',

                'langue_I': 'La qualité de la langue nécessite beaucoup d\'amélioration. Relis-toi et corrige les fautes.',
                'langue_D': 'Quelques erreurs de langue nuisent à la clarté. Fais attention à la syntaxe et à l\'orthographe.',
                'langue_M': 'Bonne qualité de la langue. Le texte est clair et bien écrit.',
                'langue_E': 'Excellente maîtrise de la langue! Le style est fluide et agréable.'
            },
            verrouille: false,
            dansBibliotheque: false
        }
    ],

    // ===========================
    // BIOLOGIE
    // ===========================
    biologie: [
        {
            id: 'bio-cartouche-labo',
            nom: 'Rétroactions rapport de laboratoire',
            discipline: 'Biologie',
            auteur: 'Primo Primavera',
            etablissement: '',
            description: 'Commentaires pour les rapports de laboratoire en biologie',
            grilleId: 'bio-grille-labo',
            contexte: 'Rapport de laboratoire en biologie',
            criteres: [
                { id: 'hypothese', nom: 'Hypothèse' },
                { id: 'methode', nom: 'Méthode expérimentale' },
                { id: 'observations', nom: 'Observations' },
                { id: 'conclusion', nom: 'Conclusion' }
            ],
            niveaux: [
                { code: 'I', nom: 'Insuffisant' },
                { code: 'D', nom: 'Développement' },
                { code: 'M', nom: 'Maîtrisé' },
                { code: 'E', nom: 'Étendu' }
            ],
            commentaires: {
                'hypothese_I': 'L\'hypothèse est absente ou non vérifiable. Formule une prédiction claire basée sur la théorie.',
                'hypothese_D': 'L\'hypothèse est présente mais manque de précision. Formule-la de manière plus spécifique.',
                'hypothese_M': 'Bonne hypothèse, claire et testable. Elle s\'appuie bien sur les connaissances théoriques.',
                'hypothese_E': 'Excellente hypothèse! Très bien formulée et justifiée scientifiquement.',

                'methode_I': 'La méthode n\'est pas décrite ou est inappropriée. Explique comment tu as procédé étape par étape.',
                'methode_D': 'La méthode est décrite mais manque de détails. Ajoute les quantités et les conditions expérimentales.',
                'methode_M': 'Bonne description de la méthode. Le protocole est clair et reproductible.',
                'methode_E': 'Méthode exemplaire! Protocole très détaillé et rigoureux.',

                'observations_I': 'Les observations sont absentes ou très incomplètes. Note tous les résultats obtenus.',
                'observations_D': 'Les observations sont présentes mais leur présentation pourrait être améliorée. Utilise des tableaux ou graphiques.',
                'observations_M': 'Bonnes observations. Les résultats sont bien présentés et complets.',
                'observations_E': 'Observations excellentes! Présentation claire, précise et professionnelle.',

                'conclusion_I': 'La conclusion est absente ou ne répond pas à l\'hypothèse. Indique si ton hypothèse est confirmée ou infirmée.',
                'conclusion_D': 'La conclusion est présente mais manque d\'analyse. Explique pourquoi tu obtiens ces résultats.',
                'conclusion_M': 'Bonne conclusion. Tu interprètes bien tes résultats en lien avec l\'hypothèse.',
                'conclusion_E': 'Conclusion remarquable! Analyse approfondie avec liens théoriques pertinents.'
            },
            verrouille: false,
            dansBibliotheque: false
        }
    ]
};

/**
 * Obtenir toutes les cartouches de la bibliothèque (toutes disciplines)
 * @returns {Array} Tableau de toutes les cartouches disponibles
 */
function obtenirToutesLesCartouchesBibliotheque() {
    const toutes = [];
    Object.keys(window.CARTOUCHES_BIBLIOTHEQUE).forEach(discipline => {
        toutes.push(...window.CARTOUCHES_BIBLIOTHEQUE[discipline]);
    });
    return toutes;
}

/**
 * Obtenir les cartouches d'une discipline spécifique
 * @param {string} discipline - Nom de la discipline (chimie, philosophie, etc.)
 * @returns {Array} Tableau des cartouches de cette discipline
 */
function obtenirCartouchesParDiscipline(discipline) {
    return window.CARTOUCHES_BIBLIOTHEQUE[discipline] || [];
}

/**
 * Obtenir la liste des disciplines disponibles pour les cartouches
 * @returns {Array} Tableau des noms de disciplines
 */
function obtenirDisciplinesDisponiblesCartouches() {
    return Object.keys(window.CARTOUCHES_BIBLIOTHEQUE).map(key => {
        // Capitaliser la première lettre
        return key.charAt(0).toUpperCase() + key.slice(1);
    });
}

// Exporter les fonctions
window.obtenirToutesLesCartouchesBibliotheque = obtenirToutesLesCartouchesBibliotheque;
window.obtenirCartouchesParDiscipline = obtenirCartouchesParDiscipline;
window.obtenirDisciplinesDisponiblesCartouches = obtenirDisciplinesDisponiblesCartouches;
