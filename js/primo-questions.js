/**
 * PRIMO QUESTIONS - Structure des questions conversationnelles
 *
 * Définit toutes les questions que Primo pose pour configurer l'application.
 * Chaque question est liée à un champ spécifique dans les formulaires de Réglages.
 *
 * VERSION : 1.3
 * DATE : 26 décembre 2025
 * AUTEUR : Grégoire Bédard (Labo Codex) avec Claude
 *
 * CHANGELOG :
 * - 1.3 (26 déc 2025) : Refonte Module 1 et Module 2 (Beta 95)
 *   - Ajout question code du cours (code-cours)
 *   - Ajout question numéro de groupe (numero-groupe)
 *   - Format liste étudiants : DA, Groupe, Nom, Prénom, Programme
 *   - Étudiants créés avec coursId
 *   - Correction références fichiers Module 2 (echelle-idme.json, grille-srpnf.json)
 * - 1.2 (26 déc 2025) : Mode exploratoire PAN-Spécifications (Beta 95)
 *   - Question choix de modèle (3 prédéfinis + personnalisé)
 *   - Question confirmation avec résumé dynamique du modèle choisi
 *   - Support texte dynamique (fonction) dans question confirmation
 *   - Support actionApres pour appliquer modèle automatiquement
 * - 1.1 (25 déc 2025) : Ajout questions PAN-Spécifications (Beta 95)
 *   - Activation option pan-specifications (plus disabled)
 *   - 7 nouvelles questions : seuil acceptabilité, jetons délai/reprise, info bundles
 *   - Exclusion des questions portfolio pour pan-specifications (utilise bundles)
 * - 1.0 (27 nov 2025) : Version initiale avec PAN-Standards + variantes par-objectifs
 */

// ============================================================================
// STRUCTURE DES QUESTIONS
// ============================================================================

/**
 * Structure d'une question :
 * {
 *     id: string,                  // ID unique
 *     texte: string,               // Question affichée (tutoiement)
 *     type: string,                // Type d'input (text, select, date, textarea, radio, checkbox, file)
 *     options: array,              // Pour select/radio (optionnel)
 *     champsCibles: array,         // Champs localStorage à remplir
 *     validation: object,          // Règles de validation (optionnel)
 *     aide: string,                // Texte d'aide contextuel (optionnel)
 *     placeholder: string,         // Placeholder pour inputs (optionnel)
 *     sautSi: function,            // Fonction pour sauter des questions selon contexte (optionnel)
 *     transformation: function     // Fonction pour transformer la valeur avant stockage (optionnel)
 * }
 */

const QUESTIONS_PRIMO = [
    // ========================================================================
    // ÉTAPE 1 : UTILISATEUR ET COURS (6 questions essentielles)
    // ========================================================================
    {
        id: 'nom-utilisateur',
        texte: 'Salut, je suis Primo ! Je vais t\'assister dans la configuration des paramètres de l\'application.\n\nToi, quel est ton nom ?',
        type: 'text',
        placeholder: 'Ton prénom',
        champsCibles: [
            { cle: 'infoCours', champ: 'enseignant' }
        ],
        validation: {
            requis: true,
            minLength: 2
        }
    },

    {
        id: 'courriel-utilisateur',
        texte: 'Quel est ton courriel professionnel ?',
        type: 'text',
        placeholder: 'Ex: prenom.nom@cegep.qc.ca',
        champsCibles: [
            { cle: 'infoCours', champ: 'courriel' }
        ],
        validation: {
            requis: false,
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            messageErreur: 'Format de courriel invalide'
        },
        aide: 'Optionnel. Sera inclus dans les métadonnées lors du partage de matériel pédagogique.'
    },

    {
        id: 'site-utilisateur',
        texte: 'As-tu un site web professionnel ou une page de ressources à partager ?',
        type: 'text',
        placeholder: 'Ex: https://monsite.com',
        champsCibles: [
            { cle: 'infoCours', champ: 'siteWeb' }
        ],
        validation: {
            requis: false,
            pattern: /^https?:\/\/.+/,
            messageErreur: 'Le lien doit commencer par http:// ou https://'
        },
        aide: 'Optionnel. Permet aux collègues de te contacter ou d\'explorer tes ressources.'
    },

    {
        id: 'titre-cours',
        texte: 'Quel est le titre du cours que tu veux configurer ?',
        type: 'text',
        placeholder: 'Ex: Écriture et littérature',
        champsCibles: [
            { cle: 'infoCours', champ: 'titre' }
        ],
        validation: {
            requis: true,
            minLength: 3
        }
    },

    {
        id: 'code-cours',
        texte: 'Quel est le code du cours ?',
        type: 'text',
        placeholder: 'Ex: 601-101-MQ',
        champsCibles: [
            { cle: 'infoCours', champ: 'code' }
        ],
        validation: {
            requis: true,
            pattern: /^\d{3}-\d{3}(-[A-Z]{2})?$/,
            messageErreur: 'Format attendu : 601-101 ou 601-101-MQ'
        },
        aide: 'Le code officiel du cours tel qu\'il apparaît dans ton horaire (ex: 601-101-MQ).'
    },

    {
        id: 'trimestre',
        texte: 'C\'est pour quel trimestre ?',
        type: 'select',
        options: [
            { value: 'Hiver', label: 'Hiver' },
            { value: 'Été', label: 'Été' },
            { value: 'Automne', label: 'Automne' }
        ],
        champsCibles: [
            { cle: 'infoCours', champ: 'session' }
        ],
        validation: {
            requis: true
        }
    },

    {
        id: 'annee',
        texte: 'Quelle année ?',
        type: 'select',
        options: function() {
            // Générer les 3 prochaines années (à partir de 2026 minimum)
            const anneeActuelle = new Date().getFullYear();
            const anneeDepart = anneeActuelle < 2026 ? 2026 : anneeActuelle;
            return [
                { value: anneeDepart, label: anneeDepart.toString() },
                { value: anneeDepart + 1, label: (anneeDepart + 1).toString() },
                { value: anneeDepart + 2, label: (anneeDepart + 2).toString() }
            ];
        },
        champsCibles: [
            { cle: 'infoCours', champ: 'annee' }
        ],
        validation: {
            requis: true
        }
    },

    {
        id: 'numero-groupe',
        texte: 'Quel est le numéro de ton groupe ?',
        type: 'text',
        placeholder: 'Ex: 00094 ou 94',
        champsCibles: [
            { cle: 'infoCours', champ: 'groupe' }
        ],
        validation: {
            requis: true,
            pattern: /^\d{1,5}$/,
            messageErreur: 'Entrer un numéro de groupe (1 à 5 chiffres)'
        },
        aide: 'Le numéro de groupe tel qu\'il apparaît dans Clara ou ton système de gestion.',
        transformation: function(valeur) {
            // Normaliser en format 5 chiffres avec zéros
            return valeur.padStart(5, '0');
        }
    },

    // ========================================================================
    // ÉTAPE 2 : PRATIQUE DE NOTATION
    // Taxonomie : Sommative + 3 PAN (Standards, Spécifications, Dénotation)
    // ========================================================================
    {
        id: 'pratique-notation',
        texte: 'Quelle pratique de notation veux-tu mettre en place ?',
        type: 'radio',
        options: [
            {
                value: 'sommative',
                label: 'Sommative (pratique traditionnelle)',
                description: 'Moyenne pondérée de toutes les évaluations. Point de comparaison avec les PAN.'
            },
            {
                value: 'pan-standards',
                label: 'PAN-Standards',
                description: 'Niveaux de maîtrise par standard/objectif, meilleur résultat retenu.'
            },
            {
                value: 'pan-specifications',
                label: 'PAN-Spécifications',
                description: 'Productions évaluées acceptable/non-acceptable selon spécifications claires. Note selon forfait (bundle) de travaux complété.'
            },
            {
                value: 'pan-denotation',
                label: 'PAN-Dénotation',
                description: 'Sans notes pendant le cours, rétroaction qualitative uniquement.',
                disabled: true,
                disabledMessage: 'Bientôt disponible'
            }
        ],
        champsCibles: [
            { cle: 'modalitesEvaluation', champ: 'pratique' }
        ],
        validation: {
            requis: true
        }
    },

    // Question de bifurcation : Expert vs Exploration (seulement pour PAN-Standards)
    {
        id: 'mode-configuration',
        texte: 'Comment te sens-tu par rapport à cette pratique ?',
        type: 'radio',
        options: [
            {
                value: 'expert',
                label: '🎯 J\'ai une idée claire',
                description: 'Ma pratique est définie, documentée ou déjà expérimentée. Je veux configurer précisément.'
            },
            {
                value: 'exploration',
                label: '🔍 Je veux explorer',
                description: 'Je découvre cette pratique ou je veux expérimenter. Guidez-moi avec les grandes orientations.'
            }
        ],
        champsCibles: [
            { cle: 'modalitesEvaluation', champ: 'modeConfiguration' }
        ],
        validation: {
            requis: true
        },
        sautSi: function(reponses) {
            const pratique = reponses['pratique-notation'];
            return pratique === 'sommative';
        }
    },

    // ========================================================================
    // BRANCHE PAN-SPÉCIFICATIONS (Beta 95)
    // Basée sur François A.-H. et Linda B. Nilson
    // ========================================================================
    {
        id: 'specifications-intro',
        texte: '**Bienvenue dans PAN-Spécifications !** 📋\n\nCette pratique repose sur des principes clairs :\n\n• **Évaluation binaire** : Chaque travail est acceptable ou non-acceptable\n• **Spécifications** : Des critères observables définissent ce qui est acceptable\n• **Forfaits (bundles)** : La note finale dépend de l\'ensemble de travaux complétés\n• **Révisions** : Les travaux peuvent être améliorés jusqu\'à devenir acceptables\n\nOn va configurer les paramètres essentiels ensemble.',
        type: 'info',
        champsCibles: [],
        sautSi: function(reponses) {
            return reponses['pratique-notation'] !== 'pan-specifications';
        }
    },

    {
        id: 'specifications-seuil',
        texte: 'Quel est le seuil d\'acceptabilité (%) pour qu\'un travail soit considéré **acceptable** ?',
        type: 'number',
        placeholder: '75',
        champsCibles: [
            { cle: 'modalitesEvaluation', champ: 'specifications.seuilAcceptable' }
        ],
        validation: {
            requis: true,
            min: 50,
            max: 100
        },
        aide: 'Typiquement 75%. Un travail qui respecte toutes les spécifications atteint ce seuil. Sinon, il doit être révisé.',
        sautSi: function(reponses) {
            return reponses['pratique-notation'] !== 'pan-specifications';
        }
    },

    {
        id: 'specifications-jetons',
        texte: 'Veux-tu utiliser un système de **jetons** ?',
        type: 'radio',
        options: [
            {
                value: 'oui',
                label: 'Oui, utiliser des jetons',
                description: 'Les étudiants reçoivent des jetons pour obtenir des délais ou reprises supplémentaires.'
            },
            {
                value: 'non',
                label: 'Non, pas de jetons',
                description: 'Les délais et reprises sont gérés différemment (politique du cours).'
            }
        ],
        champsCibles: [
            { cle: 'modalitesEvaluation', champ: 'specifications.jetonsActifs' }
        ],
        validation: {
            requis: true
        },
        aide: 'Les jetons responsabilisent les étudiants en leur donnant un contrôle sur les extensions et reprises.',
        sautSi: function(reponses) {
            return reponses['pratique-notation'] !== 'pan-specifications';
        }
    },

    {
        id: 'specifications-jetons-delai-nombre',
        texte: 'Combien de **jetons délai** chaque étudiant reçoit-il ?',
        type: 'number',
        placeholder: '2',
        champsCibles: [
            { cle: 'modalitesEvaluation', champ: 'specifications.jetons.delai.nombre' }
        ],
        validation: {
            requis: true,
            min: 0,
            max: 10
        },
        aide: 'François utilise 2 jetons. Un jeton = une extension de délai sans justification requise.',
        sautSi: function(reponses) {
            const pratique = reponses['pratique-notation'];
            const jetons = reponses['specifications-jetons'];
            return pratique !== 'pan-specifications' || jetons !== 'oui';
        }
    },

    {
        id: 'specifications-jetons-delai-duree',
        texte: 'Combien de **jours** d\'extension donne chaque jeton délai ?',
        type: 'number',
        placeholder: '7',
        champsCibles: [
            { cle: 'modalitesEvaluation', champ: 'specifications.jetons.delai.dureeJours' }
        ],
        validation: {
            requis: true,
            min: 1,
            max: 30
        },
        aide: 'Typiquement 7 jours. C\'est le nombre de jours ajoutés à la date de remise originale.',
        sautSi: function(reponses) {
            const pratique = reponses['pratique-notation'];
            const jetons = reponses['specifications-jetons'];
            return pratique !== 'pan-specifications' || jetons !== 'oui';
        }
    },

    {
        id: 'specifications-jetons-reprise-nombre',
        texte: 'Combien de **jetons reprise** chaque étudiant reçoit-il ?',
        type: 'number',
        placeholder: '2',
        champsCibles: [
            { cle: 'modalitesEvaluation', champ: 'specifications.jetons.reprise.nombre' }
        ],
        validation: {
            requis: true,
            min: 0,
            max: 10
        },
        aide: 'Un jeton reprise permet de resoumettre un travail non-acceptable après révision.',
        sautSi: function(reponses) {
            const pratique = reponses['pratique-notation'];
            const jetons = reponses['specifications-jetons'];
            return pratique !== 'pan-specifications' || jetons !== 'oui';
        }
    },

    // MODE EXPERT : Rediriger vers Réglages
    {
        id: 'specifications-info-bundles-expert',
        texte: 'Parfait ! Tu pourras configurer tes **forfaits (bundles)** dans Réglages → Pratique de notation.\n\nChaque forfait définit :\n• Les travaux requis pour l\'atteindre\n• La note associée (ex: Forfait A → 100%)\n\nL\'interface te permettra de créer tes propres types de travaux et forfaits.',
        type: 'info',
        champsCibles: [],
        sautSi: function(reponses) {
            const pratique = reponses['pratique-notation'];
            const mode = reponses['mode-configuration'];
            return pratique !== 'pan-specifications' || mode !== 'expert';
        }
    },

    // MODE EXPLORATOIRE : Choix de modèle prédéfini
    {
        id: 'specifications-modele',
        texte: 'Quel modèle de forfaits veux-tu utiliser ?',
        type: 'radio',
        options: [
            {
                value: 'modele-francois',
                label: 'Modèle François (recommandé)',
                description: '3 types de travaux (Prise de position, Test, Portfolio) avec 3 forfaits (A-B-C). Idéal pour les sciences.'
            },
            {
                value: 'modele-simple',
                label: 'Modèle simple',
                description: '2 types de travaux (Projet, Examen) avec 2 forfaits (Réussite, Excellence). Pour commencer simplement.'
            },
            {
                value: 'modele-litterature',
                label: 'Modèle littérature',
                description: '3 types (Analyse, Dissertation, Portfolio) avec 3 forfaits gradués. Pour les cours de français/littérature.'
            },
            {
                value: 'personnalise',
                label: 'Personnalisé',
                description: 'Tu créeras tes propres types et forfaits dans Réglages → Pratique de notation.'
            }
        ],
        champsCibles: [
            { cle: 'modalitesEvaluation', champ: 'specifications.modeleChoisi' }
        ],
        validation: {
            requis: true
        },
        aide: 'Les modèles prédéfinis configurent automatiquement les types de travaux et forfaits. Tu peux toujours les modifier ensuite dans Réglages.',
        sautSi: function(reponses) {
            const pratique = reponses['pratique-notation'];
            const mode = reponses['mode-configuration'];
            return pratique !== 'pan-specifications' || mode !== 'exploration';
        },
        // Action spéciale : appliquer le modèle après la réponse
        actionApres: function(reponse) {
            if (reponse && reponse !== 'personnalise') {
                if (typeof window.appliquerModeleSpecifications === 'function') {
                    window.appliquerModeleSpecifications(reponse);
                }
            }
        }
    },

    // Confirmation du modèle appliqué
    {
        id: 'specifications-confirmation-modele',
        texte: function(reponses) {
            const modele = reponses['specifications-modele'];
            if (modele === 'modele-francois') {
                return '✅ **Modèle François appliqué !**\n\n**Types de travaux** :\n• Prise de position (argumentatif)\n• Test (connaissances)\n• Portfolio (dossier)\n\n**Forfaits** :\n• **A (100%)** : 2 prises de position + 2 tests + 1 portfolio\n• **B (80%)** : 2 prises de position + 1 test + 1 portfolio\n• **C (60%)** : 1 prise de position + 1 test\n\nTu peux modifier cette configuration dans Réglages → Pratique de notation.';
            } else if (modele === 'modele-simple') {
                return '✅ **Modèle simple appliqué !**\n\n**Types de travaux** :\n• Projet\n• Examen\n\n**Forfaits** :\n• **Réussite (70%)** : 1 projet + 1 examen réussi\n• **Excellence (90%)** : 2 projets + 1 examen réussi\n\nTu peux modifier cette configuration dans Réglages → Pratique de notation.';
            } else if (modele === 'modele-litterature') {
                return '✅ **Modèle littérature appliqué !**\n\n**Types de travaux** :\n• Analyse littéraire\n• Dissertation\n• Portfolio de lecture\n\n**Forfaits** :\n• **A (100%)** : 2 analyses + 1 dissertation + 1 portfolio\n• **B (80%)** : 2 analyses + 1 dissertation\n• **C (60%)** : 1 analyse + 1 dissertation\n\nTu peux modifier cette configuration dans Réglages → Pratique de notation.';
            } else {
                return 'Tu pourras configurer tes propres types de travaux et forfaits dans **Réglages → Pratique de notation**.';
            }
        },
        type: 'info',
        champsCibles: [],
        sautSi: function(reponses) {
            const pratique = reponses['pratique-notation'];
            const mode = reponses['mode-configuration'];
            return pratique !== 'pan-specifications' || mode !== 'exploration';
        }
    },

    // ========================================================================
    // NOUVELLE BIFURCATION : Artefacts vs Objectifs (Beta 95)
    // ========================================================================
    {
        id: 'approche-evaluation',
        texte: 'Comment veux-tu structurer l\'évaluation de tes étudiants ?',
        type: 'radio',
        options: [
            {
                value: 'par-artefacts',
                label: '📁 Par artefacts (portfolio)',
                description: 'Les étudiants soumettent des productions (artefacts) évaluées avec une grille de critères. Note basée sur les N meilleures.'
            },
            {
                value: 'par-objectifs',
                label: '🎯 Par objectifs d\'apprentissage',
                description: 'Tu définis des objectifs spécifiques. La note finale dépend du niveau de maîtrise atteint sur chaque objectif.'
            }
        ],
        champsCibles: [
            { cle: 'modalitesEvaluation', champ: 'approcheEvaluation' },
            { cle: 'modalitesEvaluation', champ: 'varianteCalcul' }
        ],
        validation: {
            requis: true
        },
        aide: 'L\'approche par artefacts est idéale pour les cours avec dossiers d\'apprentissage. L\'approche par objectifs convient aux cours structurés par compétences spécifiques.',
        sautSi: function(reponses) {
            const pratique = reponses['pratique-notation'];
            return pratique !== 'pan-standards';
        }
    },

    // ========================================================================
    // BRANCHE PAR-OBJECTIFS : Configuration des 4 modes (Beta 95)
    // ========================================================================
    {
        id: 'mode-calcul-objectifs',
        texte: 'Quel mode de calcul veux-tu utiliser pour la note finale ?',
        type: 'radio',
        options: [
            {
                value: 'comptage',
                label: '🔢 Comptage d\'objectifs (Bruno V.)',
                description: 'Note = nombre d\'objectifs maîtrisés. Objectifs « essentiels » vs « complémentaires ». Plafond si essentiels non maîtrisés.'
            },
            {
                value: 'moyenne-ponderee',
                label: '⚖️ Moyenne pondérée (Michel B.)',
                description: 'Note = moyenne des niveaux × pondération de chaque objectif. Chaque objectif a un poids différent.'
            },
            {
                value: 'seuils-critiques',
                label: '📊 Seuils critiques (Xavier C.-T.)',
                description: 'Tous les objectifs doivent atteindre niveau 3+. Bonus pour niveau 4. Règles non-linéaires.'
            },
            {
                value: 'holistique',
                label: '🎨 Holistique (Isabelle M.)',
                description: 'Suggestion statistique (mode, médiane, moyenne) + validation par ton jugement professionnel.'
            }
        ],
        champsCibles: [
            { cle: 'modalitesEvaluation', champ: 'parObjectifs.modeCalcul' }
        ],
        validation: {
            requis: true
        },
        sautSi: function(reponses) {
            const pratique = reponses['pratique-notation'];
            const approche = reponses['approche-evaluation'];
            return pratique !== 'pan-standards' || approche !== 'par-objectifs';
        }
    },

    {
        id: 'objectifs-seuil-maitrise',
        texte: 'Quel est le seuil de maîtrise (%) pour considérer un objectif comme « Maîtrisé » ?',
        type: 'number',
        placeholder: '75',
        champsCibles: [
            { cle: 'modalitesEvaluation', champ: 'parObjectifs.comptage.seuilMaitrise' }
        ],
        validation: {
            requis: true,
            min: 50,
            max: 100
        },
        aide: 'Typiquement 75%. Un objectif est considéré maîtrisé si la note est ≥ ce seuil.',
        sautSi: function(reponses) {
            const approche = reponses['approche-evaluation'];
            const mode = reponses['mode-calcul-objectifs'];
            return approche !== 'par-objectifs' || mode !== 'comptage';
        }
    },

    {
        id: 'objectifs-plafond-essentiel',
        texte: 'Si un objectif essentiel n\'est pas maîtrisé, quelle est la note maximale possible ?',
        type: 'number',
        placeholder: '55',
        champsCibles: [
            { cle: 'modalitesEvaluation', champ: 'parObjectifs.comptage.plafondSiEssentielNonMaitrise' }
        ],
        validation: {
            requis: true,
            min: 0,
            max: 60
        },
        aide: 'Typiquement 55%. C\'est le plafond automatique si un objectif « essentiel » n\'est pas maîtrisé.',
        sautSi: function(reponses) {
            const approche = reponses['approche-evaluation'];
            const mode = reponses['mode-calcul-objectifs'];
            return approche !== 'par-objectifs' || mode !== 'comptage';
        }
    },

    // ========================================================================
    // MODE MOYENNE PONDÉRÉE (Michel B.)
    // ========================================================================
    {
        id: 'objectifs-info-moyenne-ponderee',
        texte: 'Avec la **moyenne pondérée**, chaque objectif aura un poids configurable. La note finale sera calculée selon la formule :\n\n**Note = Σ (niveau × pondération) / Σ pondérations**\n\nTu pourras définir les pondérations de chaque objectif dans Réglages → Pratique de notation.',
        type: 'info',
        champsCibles: [],
        sautSi: function(reponses) {
            const approche = reponses['approche-evaluation'];
            const mode = reponses['mode-calcul-objectifs'];
            return approche !== 'par-objectifs' || mode !== 'moyenne-ponderee';
        }
    },

    // ========================================================================
    // MODE SEUILS CRITIQUES (Xavier C.-T.)
    // ========================================================================
    {
        id: 'objectifs-niveau-minimum',
        texte: 'Quel est le niveau minimum que **tous** les objectifs doivent atteindre ?',
        type: 'number',
        placeholder: '3',
        // ✅ CORRECTION (4 jan 2026) : Harmoniser avec les noms des formulaires Trimestre
        champsCibles: [
            { cle: 'modalitesEvaluation', champ: 'parObjectifs.seuilsCritiques.seuilReussite' }
        ],
        validation: {
            requis: true,
            min: 1,
            max: 4
        },
        aide: 'Typiquement niveau 3 (Maîtrisé). Si un objectif est sous ce niveau, des règles non-linéaires s\'appliquent.',
        sautSi: function(reponses) {
            const approche = reponses['approche-evaluation'];
            const mode = reponses['mode-calcul-objectifs'];
            return approche !== 'par-objectifs' || mode !== 'seuils-critiques';
        }
    },

    {
        id: 'objectifs-note-base',
        texte: 'Quelle est la note de base (%) quand **tous** les objectifs atteignent le niveau minimum ?',
        type: 'number',
        placeholder: '80',
        // ✅ CORRECTION (4 jan 2026) : Harmoniser avec les noms des formulaires Trimestre
        champsCibles: [
            { cle: 'modalitesEvaluation', champ: 'parObjectifs.seuilsCritiques.noteBaseReussite' }
        ],
        validation: {
            requis: true,
            min: 60,
            max: 100
        },
        aide: 'Typiquement 80%. C\'est la note obtenue si tous les objectifs sont au niveau requis.',
        sautSi: function(reponses) {
            const approche = reponses['approche-evaluation'];
            const mode = reponses['mode-calcul-objectifs'];
            return approche !== 'par-objectifs' || mode !== 'seuils-critiques';
        }
    },

    {
        id: 'objectifs-bonus-niveau4',
        texte: 'Quel bonus (%) accorder pour chaque objectif au niveau 4 (Étendu) ?',
        type: 'number',
        placeholder: '3.33',
        champsCibles: [
            { cle: 'modalitesEvaluation', champ: 'parObjectifs.seuilsCritiques.bonusNiveau4' }
        ],
        validation: {
            requis: true,
            min: 0,
            max: 10
        },
        aide: 'Typiquement 3.33% par objectif niveau 4. Avec 6 objectifs, cela permet d\'atteindre 100% (80% + 6×3.33%).',
        sautSi: function(reponses) {
            const approche = reponses['approche-evaluation'];
            const mode = reponses['mode-calcul-objectifs'];
            return approche !== 'par-objectifs' || mode !== 'seuils-critiques';
        }
    },

    {
        id: 'objectifs-info-seuils-critiques',
        texte: 'Avec les **seuils critiques**, des règles non-linéaires s\'appliquent si certains objectifs n\'atteignent pas le niveau requis :\n\n• **1 objectif niveau 2** → Note plafonnée à 55%\n• **2+ objectifs niveau 2 OU 1+ niveau 1** → Note plafonnée à 50%\n\nCes règles sont strictes pour garantir la maîtrise minimale.',
        type: 'info',
        champsCibles: [],
        sautSi: function(reponses) {
            const approche = reponses['approche-evaluation'];
            const mode = reponses['mode-calcul-objectifs'];
            return approche !== 'par-objectifs' || mode !== 'seuils-critiques';
        }
    },

    // ========================================================================
    // MODE HOLISTIQUE (Isabelle M.)
    // ========================================================================
    {
        id: 'objectifs-methode-suggestion',
        texte: 'Quelle méthode statistique veux-tu utiliser comme **suggestion** de note ?',
        type: 'radio',
        options: [
            {
                value: 'mode',
                label: 'Mode (niveau le plus fréquent)',
                description: 'Le niveau qui apparaît le plus souvent parmi les objectifs.'
            },
            {
                value: 'mediane',
                label: 'Médiane (niveau central)',
                description: 'Le niveau au milieu quand les objectifs sont triés.'
            },
            {
                value: 'moyenne',
                label: 'Moyenne (niveau moyen)',
                description: 'La moyenne arithmétique des niveaux atteints.'
            }
        ],
        champsCibles: [
            { cle: 'modalitesEvaluation', champ: 'parObjectifs.holistique.methodeSuggestion' }
        ],
        validation: {
            requis: true
        },
        aide: 'Cette méthode génère une suggestion que tu pourras ajuster selon ton jugement professionnel.',
        sautSi: function(reponses) {
            const approche = reponses['approche-evaluation'];
            const mode = reponses['mode-calcul-objectifs'];
            return approche !== 'par-objectifs' || mode !== 'holistique';
        }
    },

    {
        id: 'objectifs-info-holistique',
        texte: 'Avec le mode **holistique**, le système te propose une note basée sur la méthode statistique choisie, mais **tu gardes le dernier mot**.\n\nTon jugement professionnel peut prendre en compte :\n• Le contexte de l\'étudiant\n• La progression observée\n• Des facteurs qualitatifs non mesurés',
        type: 'info',
        champsCibles: [],
        sautSi: function(reponses) {
            const approche = reponses['approche-evaluation'];
            const mode = reponses['mode-calcul-objectifs'];
            return approche !== 'par-objectifs' || mode !== 'holistique';
        }
    },

    // ========================================================================
    // MESSAGE FINAL POUR TOUS LES MODES PAR-OBJECTIFS
    // ========================================================================
    {
        id: 'objectifs-info-configuration',
        texte: 'Parfait ! Tu pourras configurer tes objectifs d\'apprentissage dans **Réglages → Pratique de notation** après avoir terminé cette configuration initiale.',
        type: 'info',
        champsCibles: [],
        sautSi: function(reponses) {
            const approche = reponses['approche-evaluation'];
            return approche !== 'par-objectifs';
        }
    },

    // ========================================================================
    // BRANCHE PAR-ARTEFACTS : Questions portfolio existantes
    // ========================================================================

    // Question portfolio - Seulement pour PAN-Standards par-artefacts
    {
        id: 'utiliser-portfolio',
        texte: 'Veux-tu utiliser un dossier d\'apprentissage (portfolio) ?',
        type: 'radio',
        options: [
            { value: 'oui', label: 'Oui', description: 'Les étudiants soumettent plusieurs artefacts au fil du trimestre.' },
            { value: 'non', label: 'Non', description: 'Évaluations ponctuelles sans dossier cumulatif.' }
        ],
        champsCibles: [
            { cle: 'modalitesEvaluation', champ: 'utiliserPortfolio' }
        ],
        validation: {
            requis: true
        },
        aide: 'Le portfolio permet aux étudiants de soumettre plusieurs versions améliorées de leurs travaux.',
        sautSi: function(reponses) {
            const pratique = reponses['pratique-notation'];
            const approche = reponses['approche-evaluation'];
            // Sauter si PAN-Spécifications (utilise bundles, pas portfolio) ou par-objectifs (Beta 95)
            if (pratique === 'pan-specifications') return true;
            if (pratique === 'pan-standards' && approche === 'par-objectifs') return true;
            return pratique !== 'pan-standards';
        }
    },

    {
        id: 'n-artefacts',
        texte: 'Combien d\'artefacts (exercices/travaux) veux-tu que les étudiants soumettent dans leur portfolio ?',
        type: 'number',
        placeholder: 'Ex: 7',
        champsCibles: [
            { cle: 'modalitesEvaluation', champ: 'nArtefactsPAN' }
        ],
        validation: {
            requis: true,
            min: 1,
            max: 50
        },
        aide: 'Nombre total d\'artefacts que les étudiants devront soumettre durant le trimestre (généralement entre 3 et 12).',
        sautSi: function(reponses) {
            const pratique = reponses['pratique-notation'];
            const portfolio = reponses['utiliser-portfolio'];
            const approche = reponses['approche-evaluation'];
            // Sauter si PAN-Spécifications ou par-objectifs (Beta 95)
            if (pratique === 'pan-specifications') return true;
            if (pratique === 'pan-standards' && approche === 'par-objectifs') return true;
            return pratique !== 'pan-standards' || portfolio !== 'oui';
        }
    },

    {
        id: 'n-artefacts-retenus',
        texte: 'Combien d\'artefacts seront retenus pour calculer la **note finale** ?',
        type: 'number',
        placeholder: 'Ex: 7',
        champsCibles: [
            { cle: 'modalitesEvaluation', champ: 'nArtefactsRetenus' }
        ],
        validation: {
            requis: true,
            min: 1,
            max: 50
        },
        aide: 'À la fin du trimestre, seuls les N meilleurs artefacts détermineront la note finale. Exemple : 7 meilleurs sur 12 soumis.',
        sautSi: function(reponses) {
            const pratique = reponses['pratique-notation'];
            const portfolio = reponses['utiliser-portfolio'];
            const approche = reponses['approche-evaluation'];
            // Sauter si PAN-Spécifications (bundles déterminent la note) ou par-objectifs (Beta 95)
            if (pratique === 'pan-specifications') return true;
            if (pratique === 'pan-standards' && approche === 'par-objectifs') return true;
            return pratique !== 'pan-standards' || portfolio !== 'oui';
        }
    },

    {
        id: 'reprises-permises',
        texte: 'Les étudiants peuvent-ils resoumettre un artefact amélioré ?',
        type: 'radio',
        options: [
            {
                value: 'oui-illimite',
                label: 'Oui, sans limite',
                description: 'L\'étudiant peut resoumettre autant de fois qu\'il le souhaite jusqu\'à la fin du trimestre.'
            },
            {
                value: 'oui-limite',
                label: 'Oui, mais limité',
                description: 'L\'étudiant peut resoumettre un nombre limité de fois (ex: 2 reprises par artefact).'
            },
            {
                value: 'non',
                label: 'Non',
                description: 'Chaque artefact est évalué une seule fois, sans possibilité de reprise.'
            }
        ],
        champsCibles: [
            { cle: 'modalitesEvaluation', champ: 'reprisesPermises' }
        ],
        validation: {
            requis: true
        },
        aide: 'Les reprises permettent aux étudiants de démontrer leur progression.',
        sautSi: function(reponses) {
            const pratique = reponses['pratique-notation'];
            const portfolio = reponses['utiliser-portfolio'];
            const approche = reponses['approche-evaluation'];
            // Sauter si PAN-Spécifications (utilise jetons) ou par-objectifs (Beta 95)
            if (pratique === 'pan-specifications') return true;
            if (pratique === 'pan-standards' && approche === 'par-objectifs') return true;
            return pratique !== 'pan-standards' || portfolio !== 'oui';
        }
    },

    {
        id: 'minimum-avant-calcul',
        texte: 'Combien d\'artefacts doivent être soumis avant d\'afficher une **note formative** ?',
        type: 'number',
        placeholder: 'Ex: 3',
        champsCibles: [
            { cle: 'modalitesEvaluation', champ: 'minimumAvantCalcul' }
        ],
        validation: {
            requis: true,
            min: 1,
            max: 20
        },
        aide: 'Une note formative (provisoire) apparaît après ce seuil. Elle donne un aperçu de la progression avant la note finale.',
        sautSi: function(reponses) {
            const pratique = reponses['pratique-notation'];
            const portfolio = reponses['utiliser-portfolio'];
            const approche = reponses['approche-evaluation'];
            // Sauter si PAN-Spécifications (bundles, pas note formative) ou par-objectifs (Beta 95)
            if (pratique === 'pan-specifications') return true;
            if (pratique === 'pan-standards' && approche === 'par-objectifs') return true;
            return pratique !== 'pan-standards' || portfolio !== 'oui';
        }
    },

    // MODE EXPERT : 4 variantes PAN-Standards (traces sélectives) - Seulement pour approche par-artefacts
    {
        id: 'construction-note-expert',
        texte: 'Comment veux-tu construire la note finale ?',
        type: 'radio',
        options: [
            {
                value: 'n-meilleurs',
                label: 'N meilleures évaluations',
                description: 'La note est basée sur les N meilleures évaluations (travaux, entrevues, etc.).'
            },
            {
                value: 'n-recents',
                label: 'N évaluations les plus récentes',
                description: 'Valorise l\'état actuel des apprentissages plutôt que les difficultés initiales.'
            },
            {
                value: 'grille-profils',
                label: 'Grille de profils (ex: « 3M + 2M+ → 85% »)',
                description: 'La note finale dépend de la combinaison de niveaux atteints sur tous les standards. Ex: 3 Maîtrisé + 2 Au-delà des attentes → 85%.'
            },
            {
                value: 'autre',
                label: 'Autre méthode',
                description: 'Tu pourras décrire ta méthode dans les Réglages.'
            }
        ],
        champsCibles: [
            { cle: 'modalitesEvaluation', champ: 'varianteCalcul' }
        ],
        validation: {
            requis: true
        },
        aide: 'Chaque méthode a ses avantages. Tu pourras affiner dans Réglages → Pratique de notation.',
        sautSi: function(reponses) {
            const pratique = reponses['pratique-notation'];
            const mode = reponses['mode-configuration'];
            const portfolio = reponses['utiliser-portfolio'];
            const approche = reponses['approche-evaluation'];
            // Sauter si par-objectifs (Beta 95) - le mode est déjà configuré
            if (pratique === 'pan-standards' && approche === 'par-objectifs') return true;
            // Afficher seulement si PAN-Standards + mode expert + portfolio oui
            return pratique !== 'pan-standards' || mode !== 'expert' || portfolio !== 'oui';
        }
    },

    // MODE EXPLORATION : 3 orientations alignées avec les options Expert - Seulement pour approche par-artefacts
    {
        id: 'construction-note-exploration',
        texte: 'Quelle orientation préfères-tu pour le calcul de la note ?',
        type: 'radio',
        options: [
            {
                value: 'meilleure-demonstration',
                label: '🎯 Ce qui compte, c\'est ta meilleure démonstration',
                description: 'Les meilleures évaluations déterminent la note. Les erreurs du début ne pénalisent pas.'
            },
            {
                value: 'etat-actuel',
                label: '📈 Ce qui compte, c\'est où tu en es maintenant',
                description: 'Les évaluations récentes déterminent la note. Valorise la progression.'
            },
            {
                value: 'explorer',
                label: '🔍 Je veux explorer les options',
                description: 'On utilise un défaut et tu pourras ajuster dans les Réglages.'
            }
        ],
        champsCibles: [
            { cle: 'modalitesEvaluation', champ: 'orientationCalcul' }
        ],
        validation: {
            requis: true
        },
        aide: 'Pas de mauvais choix ! Tu pourras toujours affiner dans Réglages → Pratique de notation.',
        sautSi: function(reponses) {
            const pratique = reponses['pratique-notation'];
            const mode = reponses['mode-configuration'];
            const portfolio = reponses['utiliser-portfolio'];
            const approche = reponses['approche-evaluation'];
            // Sauter si par-objectifs (Beta 95) - le mode est déjà configuré
            if (pratique === 'pan-standards' && approche === 'par-objectifs') return true;
            // Afficher seulement si PAN-Standards + mode exploration + portfolio oui
            return pratique !== 'pan-standards' || mode !== 'exploration' || portfolio !== 'oui';
        }
    },

    // ========================================================================
    // ÉTAPE 3 : BORNES DU TRIMESTRE (2 questions essentielles)
    // ========================================================================
    {
        id: 'trimestre-debut',
        texte: 'Quelle est la date de début du trimestre ?',
        type: 'date',
        champsCibles: [
            { cle: 'cadreCalendrier', champ: 'dateDebut' }
        ],
        validation: {
            requis: true
        }
    },

    {
        id: 'trimestre-fin',
        texte: 'Et la date de fin ?',
        type: 'date',
        champsCibles: [
            { cle: 'cadreCalendrier', champ: 'finCours' },
            { cle: 'cadreCalendrier', champ: 'dateFin' },
            { cle: 'cadreCalendrier', champ: 'finTrimestre' }
        ],
        validation: {
            requis: true,
            apres: 'trimestre-debut'
        }
    },

    // ========================================================================
    // ÉTAPE 4 : HORAIRE DES SÉANCES (3-7 questions selon nombre de séances)
    // ========================================================================
    {
        id: 'nombre-seances',
        texte: 'Combien de séances de cours as-tu par semaine avec ce groupe ?',
        type: 'radio',
        options: [
            {
                value: '1',
                label: '1 séance par semaine',
                description: 'Une seule plage horaire hebdomadaire'
            },
            {
                value: '2',
                label: '2 séances par semaine',
                description: 'Deux rencontres distinctes (ex: lundi + jeudi)'
            },
            {
                value: '3',
                label: '3 séances par semaine',
                description: 'Trois rencontres distinctes'
            }
        ],
        champsCibles: [
            { cle: 'horaireHebdomadaire', champ: 'nombreSeances' }
        ],
        validation: {
            requis: true
        },
        aide: 'Une séance = une plage horaire où tu rencontres physiquement ton groupe.'
    },

    {
        id: 'horaire-jour1',
        texte: 'Séance 1 - Quel jour de la semaine ?',
        type: 'select',
        options: [
            { value: 'Lundi', label: 'Lundi' },
            { value: 'Mardi', label: 'Mardi' },
            { value: 'Mercredi', label: 'Mercredi' },
            { value: 'Jeudi', label: 'Jeudi' },
            { value: 'Vendredi', label: 'Vendredi' }
        ],
        champsCibles: [
            { cle: 'horaireHebdomadaire', champ: 'jour1' }
        ],
        validation: {
            requis: true
        }
    },

    {
        id: 'horaire-heure1-debut',
        texte: 'Séance 1 - À quelle heure commence-t-elle ?',
        type: 'time',  // ✅ MODIF (Beta 96 - Souhait Bruno) : Permettre heures non piles
        placeholder: '08:00',
        champsCibles: [
            { cle: 'horaireHebdomadaire', champ: 'heure1Debut' }
        ],
        validation: {
            requis: true
        }
    },

    {
        id: 'horaire-heure1-fin',
        texte: 'Séance 1 - À quelle heure finit-elle ?',
        type: 'time',  // ✅ MODIF (Beta 96 - Souhait Bruno) : Permettre heures non piles
        placeholder: '12:00',
        champsCibles: [
            { cle: 'horaireHebdomadaire', champ: 'heure1Fin' }
        ],
        validation: {
            requis: true,
            apres: 'horaire-heure1-debut'
        }
    },

    // Questions conditionnelles si 2 ou 3 séances
    {
        id: 'horaire-jour2',
        texte: 'Séance 2 - Quel jour ?',
        type: 'select',
        options: [
            { value: 'Lundi', label: 'Lundi' },
            { value: 'Mardi', label: 'Mardi' },
            { value: 'Mercredi', label: 'Mercredi' },
            { value: 'Jeudi', label: 'Jeudi' },
            { value: 'Vendredi', label: 'Vendredi' }
        ],
        champsCibles: [
            { cle: 'horaireHebdomadaire', champ: 'jour2' }
        ],
        validation: {
            requis: true
        },
        sautSi: function(reponses) {
            const nb = reponses['nombre-seances'];
            return nb !== '2' && nb !== '3';
        }
    },

    {
        id: 'horaire-heure2-debut',
        texte: 'Séance 2 - À quelle heure commence-t-elle ?',
        type: 'time',  // ✅ MODIF (Beta 96 - Souhait Bruno) : Permettre heures non piles
        placeholder: '13:00',
        champsCibles: [
            { cle: 'horaireHebdomadaire', champ: 'heure2Debut' }
        ],
        validation: {
            requis: true
        },
        sautSi: function(reponses) {
            const nb = reponses['nombre-seances'];
            return nb !== '2' && nb !== '3';
        }
    },

    {
        id: 'horaire-heure2-fin',
        texte: 'Séance 2 - À quelle heure finit-elle ?',
        type: 'time',  // ✅ MODIF (Beta 96 - Souhait Bruno) : Permettre heures non piles
        placeholder: '16:00',
        champsCibles: [
            { cle: 'horaireHebdomadaire', champ: 'heure2Fin' }
        ],
        validation: {
            requis: true,
            apres: 'horaire-heure2-debut'
        },
        sautSi: function(reponses) {
            const nb = reponses['nombre-seances'];
            return nb !== '2' && nb !== '3';
        }
    },

    // Questions conditionnelles si 3 séances
    {
        id: 'horaire-jour3',
        texte: 'Séance 3 - Quel jour ?',
        type: 'select',
        options: [
            { value: 'Lundi', label: 'Lundi' },
            { value: 'Mardi', label: 'Mardi' },
            { value: 'Mercredi', label: 'Mercredi' },
            { value: 'Jeudi', label: 'Jeudi' },
            { value: 'Vendredi', label: 'Vendredi' }
        ],
        champsCibles: [
            { cle: 'horaireHebdomadaire', champ: 'jour3' }
        ],
        validation: {
            requis: true
        },
        sautSi: function(reponses) {
            return reponses['nombre-seances'] !== '3';
        }
    },

    {
        id: 'horaire-heure3-debut',
        texte: 'Séance 3 - À quelle heure commence-t-elle ?',
        type: 'time',  // ✅ MODIF (Beta 96 - Souhait Bruno) : Permettre heures non piles
        placeholder: '14:00',
        champsCibles: [
            { cle: 'horaireHebdomadaire', champ: 'heure3Debut' }
        ],
        validation: {
            requis: true
        },
        sautSi: function(reponses) {
            return reponses['nombre-seances'] !== '3';
        }
    },

    {
        id: 'horaire-heure3-fin',
        texte: 'Séance 3 - À quelle heure finit-elle ?',
        type: 'time',  // ✅ MODIF (Beta 96 - Souhait Bruno) : Permettre heures non piles
        placeholder: '17:00',
        champsCibles: [
            { cle: 'horaireHebdomadaire', champ: 'heure3Fin' }
        ],
        validation: {
            requis: true,
            apres: 'horaire-heure3-debut'
        },
        sautSi: function(reponses) {
            return reponses['nombre-seances'] !== '3';
        }
    },

    // ========================================================================
    // ÉTAPE 5 : LISTE DES ÉTUDIANTS (2 questions)
    // ========================================================================
    {
        id: 'etudiants-methode',
        texte: '**Ajout des étudiants**\n\nConsulte le système de gestion des apprentissages de ton établissement pour récupérer la liste de tes élèves.\n\nLe format attendu est : **DA, Groupe, Nom, Prénom, Programme** (séparés par virgules ou tabulations).\n\n<button onclick="copierListeEtudiantsFictifs()" class="btn btn-secondaire" style="margin-top: 10px;">📋 Copier une liste fictive (10 étudiants)</button>\n\n<small>Tu pourras coller cette liste à l\'étape suivante pour tester l\'application.</small>',
        type: 'instruction',
        champsCibles: [],
        validation: { requis: false }
    },

    {
        id: 'etudiants-liste',
        texte: 'Parfait ! Colle ta liste ici (DA, Groupe, Nom, Prénom, Programme par ligne).',
        type: 'textarea',
        placeholder: 'Ex:\n1234567,00094,Tremblay,Sophie,506.A0\n2345678,00094,Gagnon,Marc,200.B1',
        champsCibles: [
            { cle: 'groupeEtudiants', champ: null }
        ],
        validation: {
            requis: true
        },
        transformation: function(valeur) {
            if (!valeur || valeur.trim() === '') return [];

            const lignes = valeur.split('\n');
            const etudiants = [];

            // Récupérer le coursId depuis infoCours (créé à l'étape précédente)
            const infoCours = typeof db !== 'undefined' ? db.getSync('infoCours', {}) : {};
            const coursId = infoCours.id || null;
            const groupeDefaut = infoCours.groupe || '';

            lignes.forEach(ligne => {
                ligne = ligne.trim();
                if (ligne === '') return;

                // Support virgules ou tabulations
                const separateur = ligne.includes('\t') ? '\t' : ',';
                const parts = ligne.split(separateur).map(p => p.trim());

                if (parts.length >= 4) {
                    // Format: DA, Groupe, Nom, Prénom, Programme, Courriel
                    const groupe = parts[1] ? parts[1].padStart(5, '0') : groupeDefaut;
                    etudiants.push({
                        da: parts[0],
                        groupe: groupe,
                        nom: parts[2],
                        prenom: parts[3],
                        programme: parts[4] || '',
                        courriel: parts[5] || '',
                        coursId: coursId
                    });
                }
            });

            return etudiants;
        }
    },

    // ========================================================================
    // ÉTAPE 6 : CONFIRMATION CRÉATION DU GROUPE ET FIN PARCOURS COURT
    // ========================================================================
    {
        id: 'confirmation-groupe',
        texte: '🎉 **Bravo !** Tu as terminé la configuration de base !\n\n✅ Cours créé\n✅ Trimestre configuré\n✅ Horaire défini\n✅ Groupe d\'étudiants créé',
        type: 'message',
        champsCibles: [],
        validation: {
            requis: false
        },
        finParcoursCourt: true  // Indicateur pour retourner au menu
    },

    // ========================================================================
    // ÉTAPE 7 : PRÉPARATION MATÉRIEL PÉDAGOGIQUE
    // ========================================================================
    {
        id: 'intro-materiel',
        texte: 'Des collègues ont créé du matériel pédagogique pour toi et l\'ont partagé sous licence libre (CC BY-NC-SA 4.0). C\'est une caractéristique de cette application : la collaboration entre enseignant·es ! 🤝\n\nTu vas trouver ce matériel dans le dossier **materiel-demo/** :\n\n📁 materiel-demo/\n   ├── echelle-idme.json\n   ├── grille-srpnf.json\n   └── cartouches-srpnf.json\n\nOuvre ce dossier dans une autre fenêtre, on va en avoir besoin ! 📂',
        type: 'instruction',
        champsCibles: [],
        validation: {
            requis: false
        },
        aide: 'Le dossier materiel-demo/ se trouve à la racine du projet.'
    },

    {
        id: 'confirmation-dossier-ouvert',
        texte: 'As-tu ouvert le dossier **materiel-demo/** ?',
        type: 'radio',
        options: [
            { value: 'oui', label: 'Oui, c\'est ouvert !' },
            { value: 'aide', label: 'J\'ai besoin d\'aide pour le trouver' }
        ],
        champsCibles: [],
        validation: {
            requis: true
        }
    },

    {
        id: 'aide-dossier',
        texte: 'Le dossier **materiel-demo/** se trouve au même endroit que le fichier index 92.html.\n\nSi tu utilises le Finder (macOS), tu peux faire un clic droit sur le fichier index 92.html et choisir «Afficher dans le Finder».\n\nC\'est bon, tu l\'as trouvé ?',
        type: 'radio',
        options: [
            { value: 'oui', label: 'Oui, trouvé !' },
            { value: 'non', label: 'Non, je continue sans' }
        ],
        champsCibles: [],
        validation: {
            requis: false
        },
        sautSi: function(reponses) {
            return reponses['confirmation-dossier-ouvert'] === 'oui';
        }
    },

    // ========================================================================
    // ÉTAPE 8 : PASSAGE EN MODE GUIDÉ (NOTIFICATIONS)
    // ========================================================================
    {
        id: 'transition-mode-guide',
        texte: '**Maintenant, place à la pratique !**\n\nJe vais te guider pas à pas pour créer ta première production et évaluation directement dans l\'application.\n\nJe vais me transformer en **assistant discret** (notifications en haut à droite) pendant que tu navigues librement.\n\nUtilise le bouton **"Suivant →"** en bas à droite pour avancer dans les étapes.\n\nC\'est parti !',
        type: 'action',
        action: 'passerEnModeNotification',
        champsCibles: [],
        validation: { requis: false }
    },

    // ========================================================================
    // ÉTAPE 9 : IMPORT MANUEL DE L'ÉCHELLE IDME (MODE NOTIFICATION)
    // ========================================================================
    {
        id: 'importer-echelle-idme',
        texte: '**Étape 1 : Importer l\'échelle de performance**\n\n1️⃣ Va dans **Matériel → Échelles de performance**\n2️⃣ Clique sur **Nouvelle échelle**\n3️⃣ Clique sur **Options d\'import/export**\n4️⃣ Clique sur **Importer une échelle**\n5️⃣ Sélectionne le fichier **echelle-idme.json** (dans le dossier de données de démonstration)\n6️⃣ Confirme l\'importation\n\nTu devrais voir apparaître **Échelle IDME** avec 4 niveaux (I, D, M, E).\n\nClique **"Suivant →"** quand c\'est fait.',
        type: 'instruction',
        champsCibles: [],
        validation: { requis: false }
    },

    // ========================================================================
    // ÉTAPE 10 : IMPORT MANUEL DE LA GRILLE SRPNF (MODE NOTIFICATION)
    // ========================================================================
    {
        id: 'importer-grille-srpnf',
        texte: '**Étape 2 : Importer la grille d\'évaluation**\n\n1️⃣ Va dans **Matériel → Grilles de critères**\n2️⃣ Clique sur **Nouvelle grille**\n3️⃣ Clique sur **Options d\'import/export**\n4️⃣ Clique sur **Importer des grilles**\n5️⃣ Sélectionne le fichier **grille-srpnf.json** (dans le dossier de données de démonstration)\n6️⃣ Confirme l\'importation\n\nTu devrais voir apparaître **Grille SRPNF** avec 5 critères.\n\nClique **"Suivant →"** quand c\'est fait.',
        type: 'instruction',
        champsCibles: [],
        validation: { requis: false }
    },

    // ========================================================================
    // ÉTAPE 11 : CRÉATION D'UNE PRODUCTION (MODE NOTIFICATION)
    // ========================================================================
    {
        id: 'creer-production-guidee',
        texte: '**Étape 3 : Créer ta production**\n\n1️⃣ Va dans **Matériel → Productions**\n2️⃣ Clique sur **Nouvelle production**\n3️⃣ Remplis le formulaire :\n   • **Titre** : Ce que tu veux (ex: "Analyse littéraire")\n   • **Description** : Une courte description\n   • **Type** : Artefact portfolio\n   • **Pondération** : 15 à 25%\n   • **Grille liée** : **Grille Test** (celle que tu as importée)\n4️⃣ Sauvegarde !\n\nMaintenant ta production est liée à la grille d\'évaluation !\n\nClique **"Suivant →"** quand c\'est fait.',
        type: 'instruction',
        champsCibles: [],
        validation: { requis: false }
    },

    // ========================================================================
    // ÉTAPE 12 : CRÉATION D'UNE ÉVALUATION (MODE NOTIFICATION)
    // ========================================================================
    {
        id: 'navigation-evaluations',
        texte: '**Étape 4 : Accéder aux évaluations**\n\n1️⃣ Va dans **Évaluations → Procéder à une évaluation**\n2️⃣ Clique sur **Nouvelle évaluation**\n\nQuand c\'est fait, clique sur **"Suivant →"** en bas à droite.',
        type: 'instruction',
        champsCibles: [],
        validation: { requis: false }
    },

    {
        id: 'selection-etudiant',
        texte: '**Étape 5 : Choisir un étudiant et la production**\n\n1️⃣ Choisis n\'importe quel étudiant de ta liste\n2️⃣ Sélectionne la production que tu viens de créer\n\nTu devrais maintenant voir le formulaire d\'évaluation avec :\n✅ **Échelle IDME Test** (niveaux I et M)\n✅ **Grille Test** (critères A et B)\n\n**Tout est là ! Le matériel importé est bien disponible.**\n\nClique **"Suivant →"** quand tu vois tout ça.',
        type: 'instruction',
        champsCibles: [],
        validation: { requis: false }
    },

    {
        id: 'attribuer-niveaux',
        texte: '**Étape 6 : Évaluer**\n\nAttribue des niveaux pour chaque critère :\n• **Critère A** : M (Maîtrisé)\n• **Critère B** : I (Insuffisant)\n\nUne note est calculée automatiquement !\n\nTu peux aussi ajouter des commentaires si tu veux.\n\nSauvegarde l\'évaluation, puis clique **"Suivant →"**.',
        type: 'instruction',
        champsCibles: [],
        validation: { requis: false }
    },

    // ========================================================================
    // FIN DE LA SÉQUENCE "ÉVALUER" - RETOUR AU MENU
    // ========================================================================
    {
        id: 'fin-sequence-evaluer',
        texte: '**Bravo !** Tu as terminé la séquence d\'évaluation !\n\n✅ Échelle de performance importée\n✅ Grille de critères importée\n✅ Production créée\n✅ Évaluation complétée',
        type: 'message',
        champsCibles: [],
        validation: { requis: false },
        finParcoursEvaluer: true  // Indicateur pour retourner au menu
    },

    // ========================================================================
    // ÉTAPE 11 : IMPORT DES DONNÉES COMPLÈTES (MAGIE)
    // ========================================================================
    {
        id: 'intro-magie',
        texte: '**Tour de magie ! 🎩✨**\n\nMaintenant je vais remplir automatiquement ton groupe fictif avec :\n• 50+ évaluations déjà complétées\n• Présences variées (assidus, absents, entre-deux)\n• Productions diversifiées\n• Indices A-C-P calculés\n\nComme ça, tu peux explorer toutes les fonctionnalités de l\'application sans avoir à tout saisir manuellement !\n\nPrêt·e pour la magie ?',
        type: 'radio',
        options: [
            { value: 'oui', label: 'Oui, allons-y !' },
            { value: 'non', label: 'Non, je préfère continuer sans' }
        ],
        champsCibles: [
            { cle: 'tutoriel', champ: 'importDonneesDemo' }
        ],
        validation: {
            requis: true
        }
    },

    {
        id: 'execution-import-demo',
        texte: 'Import des données de démonstration en cours...',
        type: 'action',
        action: 'importerDonneesDemo',
        champsCibles: [],
        validation: {
            requis: false
        },
        sautSi: function(reponses) {
            return reponses['intro-magie'] !== 'oui';
        }
    },

    {
        id: 'confirmation-import-demo',
        texte: '✅ **Données importées !**\n\nTon groupe fictif contient maintenant :\n• 10 étudiants\n• 5 productions évaluées\n• 12 semaines de présences\n• Indices de risque calculés\n\nPassons maintenant à la saisie des présences !',
        type: 'instruction',
        champsCibles: [],
        validation: {
            requis: false
        },
        sautSi: function(reponses) {
            return reponses['intro-magie'] !== 'oui';
        }
    },

    // ========================================================================
    // ÉTAPE 12 : SAISIE DES PRÉSENCES
    // ========================================================================
    {
        id: 'saisie-presences',
        texte: '**Apprenons à saisir les présences**\n\n1️⃣ Va dans **Suivi → Saisie des présences**\n2️⃣ Choisis une date récente\n3️⃣ Tu vois la liste de tes étudiants\n\nEssaie de modifier quelques présences.\n\nLes indices d\'assiduité (A) se recalculent automatiquement !\n\nTu as essayé ?',
        type: 'radio',
        options: [
            { value: 'oui', label: 'Oui, j\'ai essayé !' },
            { value: 'sauter', label: 'Je vais le faire plus tard' }
        ],
        champsCibles: [
            { cle: 'tutoriel', champ: 'presencesModifiees' }
        ],
        validation: {
            requis: true
        }
    },

    // ========================================================================
    // ÉTAPE 13 : TABLEAU DE BORD
    // ========================================================================
    {
        id: 'tableau-bord',
        texte: '**Découvre le tableau de bord**\n\n1️⃣ Va dans **Suivi → Tableau de bord**\n\nTu vois maintenant :\n• Indicateurs globaux (moyennes A-C-P)\n• Étudiants à risque (niveau RàI)\n• Patterns détectés (défis, blocages)\n\nC\'est ici que tu identifies qui a besoin d\'aide !\n\nTu y es ?',
        type: 'radio',
        options: [
            { value: 'oui', label: 'Oui' },
            { value: 'sauter', label: 'Je vais y aller plus tard' }
        ],
        champsCibles: [],
        validation: {
            requis: true
        }
    },

    {
        id: 'profil-individuel',
        texte: '**Consulte un profil individuel**\n\n1️⃣ Clique sur **Liste des étudiants**\n2️⃣ Choisis n\'importe qui\n\nTu vois :\n• Son engagement (A-C-P)\n• Ses forces et défis SRPNF\n• Ses productions évaluées\n• Recommandations d\'intervention\n\nC\'est le cœur du système de suivi !\n\nTu as exploré un profil ?',
        type: 'radio',
        options: [
            { value: 'oui', label: 'Oui, j\'ai exploré !' },
            { value: 'sauter', label: 'Je vais le faire plus tard' }
        ],
        champsCibles: [
            { cle: 'tutoriel', champ: 'profilExplore' }
        ],
        validation: {
            requis: true
        }
    },

    // ========================================================================
    // ÉTAPE 14 : CONCLUSION
    // ========================================================================
    {
        id: 'fin',
        texte: '**Bravo, tu as terminé !**\n\nTu sais maintenant :\n✅ Configurer l\'application\n✅ Importer du matériel pédagogique\n✅ Créer et évaluer des productions\n✅ Saisir les présences\n✅ Consulter le tableau de bord\n✅ Analyser les profils individuels',
        type: 'message',
        champsCibles: [],
        validation: {
            requis: false
        }
    }
];

// ============================================================================
// FONCTIONS UTILITAIRES
// ============================================================================

/**
 * Obtient une question par son ID
 */
function obtenirQuestion(id) {
    return QUESTIONS_PRIMO.find(q => q.id === id);
}

/**
 * Obtient toutes les questions
 */
function obtenirToutesLesQuestions() {
    return QUESTIONS_PRIMO;
}

/**
 * Filtre les questions selon les réponses précédentes
 * (gère les sauts conditionnels)
 */
function obtenirQuestionsActives(reponses = {}) {
    return QUESTIONS_PRIMO.filter(q => {
        if (typeof q.sautSi === 'function') {
            return !q.sautSi(reponses);
        }
        return true;
    });
}

/**
 * Valide une réponse selon les règles de validation
 */
function validerReponse(questionId, valeur, reponses = {}) {
    const question = obtenirQuestion(questionId);
    if (!question || !question.validation) return { valide: true };

    const validation = question.validation;
    const erreurs = [];

    // Validation requis
    if (validation.requis && (!valeur || valeur.toString().trim() === '')) {
        erreurs.push('Cette question est obligatoire.');
    }

    // Validation minLength
    if (validation.minLength && valeur && valeur.length < validation.minLength) {
        erreurs.push(`Minimum ${validation.minLength} caractères requis.`);
    }

    // Validation min/max (nombres)
    if (validation.min !== undefined && parseFloat(valeur) < validation.min) {
        erreurs.push(`La valeur doit être au moins ${validation.min}.`);
    }
    if (validation.max !== undefined && parseFloat(valeur) > validation.max) {
        erreurs.push(`La valeur doit être au maximum ${validation.max}.`);
    }

    // Validation apres (dates/heures)
    if (validation.apres) {
        const valeurReference = reponses[validation.apres];
        if (valeurReference && valeur <= valeurReference) {
            erreurs.push('Cette valeur doit être postérieure à la précédente.');
        }
    }

    // Validation superieur (nombres)
    if (validation.superieur) {
        const valeurReference = parseFloat(reponses[validation.superieur]);
        if (!isNaN(valeurReference) && parseFloat(valeur) <= valeurReference) {
            erreurs.push('Cette valeur doit être supérieure à la précédente.');
        }
    }

    return {
        valide: erreurs.length === 0,
        erreurs: erreurs
    };
}

/**
 * Transforme une réponse selon la fonction de transformation
 */
function transformerReponse(questionId, valeur) {
    const question = obtenirQuestion(questionId);
    if (!question) return valeur;

    if (typeof question.transformation === 'function') {
        return question.transformation(valeur);
    }

    return valeur;
}

/**
 * Obtient les options d'une question (gère les fonctions)
 */
function obtenirOptions(questionId) {
    const question = obtenirQuestion(questionId);
    if (!question || !question.options) return [];

    if (typeof question.options === 'function') {
        return question.options();
    }

    return question.options;
}

/**
 * Copie une liste d'étudiants fictifs dans le presse-papier
 * Utilisé par le bouton dans la question 'etudiants-methode'
 */
function copierListeEtudiantsFictifs() {
    const listeFictive = `DA,Groupe,Nom,Prénom,Programme
1234579,00001,Boucher,Charles,506.A0
1234582,00001,Cissé,Fatou,410.B0
1234585,00001,Côté,Florence,200.B1
1234588,00001,Diallo,Olivier,300.M1
1234591,00001,Dubé,Samuel,410.D0
1234594,00001,Fortin,Nathan,410.D0
1234597,00001,Gagnon,Léa,506.A0
1234600,00001,Lavoie,Emma,200.B1
1234603,00001,Nguyen,Minh,300.M1
1234606,00001,Roy,Thomas,410.B0`;

    navigator.clipboard.writeText(listeFictive).then(() => {
        // Afficher confirmation
        if (typeof showToast === 'function') {
            showToast('Liste copiée ! Tu peux la coller à l\'étape suivante.', 'success');
        } else {
            alert('Liste copiée dans le presse-papier !');
        }
    }).catch(err => {
        console.error('Erreur copie presse-papier:', err);
        alert('Impossible de copier. Voici la liste à copier manuellement :\n\n' + listeFictive);
    });
}

// ============================================================================
// EXPORTS
// ============================================================================

window.copierListeEtudiantsFictifs = copierListeEtudiantsFictifs;
window.obtenirQuestion = obtenirQuestion;
window.obtenirToutesLesQuestions = obtenirToutesLesQuestions;
window.obtenirQuestionsActives = obtenirQuestionsActives;
window.validerReponse = validerReponse;
window.transformerReponse = transformerReponse;
window.obtenirOptions = obtenirOptions;

console.log('✅ Module primo-questions.js chargé (' + QUESTIONS_PRIMO.length + ' questions)');
