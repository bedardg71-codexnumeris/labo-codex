/**
 * PRIMO QUESTIONS - Structure des questions conversationnelles
 *
 * Définit toutes les questions du tour guidé pour configurer l'application.
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

(function() {
'use strict';

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

// ============================================================================
// FONCTIONS UTILITAIRES POUR DÉTECTION DE CONFIG EXISTANTE
// ============================================================================

/**
 * Récupère les informations enseignant existantes
 * @returns {Object|null} Infos enseignant ou null si non configuré
 */
function obtenirEnseignantExistant() {
    // Vérifier d'abord dans la liste des enseignants (Beta 95.2)
    const enseignants = db.getSync('enseignants', []);

    if (enseignants.length > 0) {
        return enseignants[0]; // Premier enseignant
    }

    // Fallback sur infoCours
    const infoCours = db.getSync('infoCours', {});

    if (infoCours.enseignant) {
        return {
            prenom: infoCours.enseignant,
            courriel: infoCours.courriel || '',
            siteWeb: infoCours.siteWeb || ''
        };
    }

    return null;
}

/**
 * Récupère les cours existants (aligné sur Trimestre - Beta 95.2)
 * Utilise listeCours global et filtre par trimestre actif (SST)
 * @returns {Array} Liste des cours du trimestre actif
 */
function obtenirCoursExistants() {
    // Lire depuis listeCours global (même source que Trimestre)
    const tousCours = db.getSync('listeCours', []);

    // Obtenir le trimestre actif
    const trimestreActifId = (typeof obtenirTrimestreId === 'function')
        ? obtenirTrimestreId()
        : ((typeof db !== 'undefined' && db.getSync) ? db.getSync('trimestreActif', '') : '');

    if (!trimestreActifId) return tousCours;

    // Filtrer par trimestre (même logique que Trimestre)
    const deriverTrimestreId = (cours) => {
        if (!cours) return null;
        if (cours.trimestreId) return cours.trimestreId;
        if (cours.session && cours.annee) {
            const s = cours.session.length === 1 ? cours.session.toLowerCase() : cours.session.charAt(0).toLowerCase();
            return s + cours.annee;
        }
        if (cours.session && /^[AHE]\d{4}$/i.test(cours.session)) {
            return cours.session.toLowerCase();
        }
        return null;
    };

    return tousCours.filter(c => {
        const trimestreDerive = deriverTrimestreId(c);
        return trimestreDerive === trimestreActifId || trimestreDerive === null;
    });
}

const QUESTIONS_PRIMO = [
    // ========================================================================
    // ÉTAPE 1 : UTILISATEUR (avec détection config existante)
    // ========================================================================

    // ✅ NOUVEAU (8 janvier 2026) : Détection profil enseignant existant
    {
        id: 'enseignant-config-existante',
        texte: function() {
            const ens = obtenirEnseignantExistant();
            if (!ens) return '';

            const nom = ens.prenom || ens.nom || 'Enseignant';
            const courriel = ens.courriel ? `\n• Courriel : **${ens.courriel}**` : '';

            return `Un profil enseignant est déjà configuré :\n\n` +
                   `• Nom : **${nom}**${courriel}\n\n` +
                   `Souhaites-tu utiliser ce profil pour ce groupe-cours ?`;
        },
        type: 'radio',
        options: [
            {
                value: 'oui',
                label: 'Oui, c\'est moi !',
                description: 'Utiliser le profil existant'
            },
            {
                value: 'non',
                label: 'Non, créer un nouveau profil',
                description: 'Entrer de nouvelles informations'
            }
        ],
        champsCibles: [],
        validation: { requis: true },
        sautSi: function() {
            const ens = obtenirEnseignantExistant();
            return !ens || !ens.prenom;
        }
    },

    {
        id: 'nom-utilisateur',
        texte: function(reponses) {
            // Message d'accueil seulement si pas de profil existant
            if (!reponses['enseignant-config-existante']) {
                return 'Bienvenue ! Ce guide va t\'assister dans la configuration des paramètres de l\'application.\n\nQuel est ton nom ?';
            }
            return 'Quel est ton nom ?';
        },
        type: 'text',
        placeholder: 'Ton prénom',
        champsCibles: [
            { cle: 'infoCours', champ: 'enseignant' }
        ],
        validation: {
            requis: true,
            minLength: 2
        },
        sautSi: function(reponses) {
            return reponses['enseignant-config-existante'] === 'oui';
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
        aide: 'Optionnel. Sera inclus dans les métadonnées lors du partage de matériel pédagogique.',
        sautSi: function(reponses) {
            return reponses['enseignant-config-existante'] === 'oui';
        }
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
        aide: 'Optionnel. Permet aux collègues de te contacter ou d\'explorer tes ressources.',
        sautSi: function(reponses) {
            return reponses['enseignant-config-existante'] === 'oui';
        }
    },

    // ========================================================================
    // ÉTAPE 2 : COURS (avec détection cours existants)
    // ========================================================================

    // ✅ NOUVEAU (8 janvier 2026) : Détection cours existants
    {
        id: 'cours-config-existante',
        texte: function() {
            const cours = obtenirCoursExistants();
            if (!cours || cours.length === 0) return '';

            // Lister les cours existants (max 3)
            const listeCours = cours.slice(0, 3).map(c => {
                const code = c.code || c.sigle || '?';
                const titre = c.titre || c.nom || 'Sans titre';
                return `• **${code}** - ${titre}`;
            }).join('\n');

            const etPlus = cours.length > 3 ? `\n• ... et ${cours.length - 3} autre(s)` : '';

            return `Tu as déjà ${cours.length} cours configuré${cours.length > 1 ? 's' : ''} :\n\n` +
                   `${listeCours}${etPlus}\n\n` +
                   `Veux-tu utiliser un de ces cours ou en créer un nouveau ?`;
        },
        type: 'radio',
        options: [
            {
                value: 'existant',
                label: 'Utiliser un cours existant',
                description: 'Choisir parmi mes cours'
            },
            {
                value: 'nouveau',
                label: 'Créer un nouveau cours',
                description: 'Entrer les informations d\'un nouveau cours'
            }
        ],
        champsCibles: [],
        validation: { requis: true },
        sautSi: function() {
            const cours = obtenirCoursExistants();
            return !cours || cours.length === 0;
        }
    },

    // Sélection du cours existant
    {
        id: 'cours-existant-selection',
        texte: 'Quel cours veux-tu utiliser ?',
        type: 'select',
        options: function() {
            const cours = obtenirCoursExistants();
            return cours.map(c => ({
                value: c.id || c.code || c.sigle,
                label: `${c.code || c.sigle || '?'} - ${c.titre || c.nom || 'Sans titre'}`
            }));
        },
        champsCibles: [],
        validation: { requis: true },
        sautSi: function(reponses) {
            return reponses['cours-config-existante'] !== 'existant';
        },
        // Action après sélection : copier les infos du cours sélectionné
        // ✅ CORRECTION (8 jan 2026) : Copier vers les clés que creerCoursInitial() attend
        actionApres: function(valeur, reponses) {
            const cours = obtenirCoursExistants();
            const coursChoisi = cours.find(c => (c.id || c.code || c.sigle) === valeur);
            if (coursChoisi) {
                // Copier vers les mêmes clés que les questions manuelles
                reponses['titre-cours'] = coursChoisi.titre || coursChoisi.nom || '';
                reponses['code-cours'] = coursChoisi.code || coursChoisi.sigle || '';
                reponses['numero-groupe'] = coursChoisi.groupe || '00001';
                console.log('[Guide] Cours existant sélectionné:', reponses['code-cours']);
            }
        }
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
        },
        sautSi: function(reponses) {
            return reponses['cours-config-existante'] === 'existant';
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
        aide: 'Le code officiel du cours tel qu\'il apparaît dans ton horaire (ex: 601-101-MQ).',
        sautSi: function(reponses) {
            return reponses['cours-config-existante'] === 'existant';
        }
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
    // Basée sur Linda B. Nilson (Specifications Grading)
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
                label: '🔢 Comptage d\'objectifs',
                description: 'Note = nombre d\'objectifs maîtrisés. Objectifs « essentiels » vs « complémentaires ». Plafond si essentiels non maîtrisés.'
            },
            {
                value: 'moyenne-ponderee',
                label: '⚖️ Moyenne pondérée',
                description: 'Note = moyenne des niveaux × pondération de chaque objectif. Chaque objectif a un poids différent.'
            },
            {
                value: 'seuils-critiques',
                label: '📊 Seuils critiques',
                description: 'Tous les objectifs doivent atteindre niveau 3+. Bonus pour niveau 4. Règles non-linéaires.'
            },
            {
                value: 'holistique',
                label: '🎨 Holistique',
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
    // MODE MOYENNE PONDÉRÉE
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
    // MODE SEUILS CRITIQUES
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
    // MODE HOLISTIQUE
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

    // ========================================================================
    // 🆕 CATÉGORIES SÉLECTION/OBLIGATOIRES (Beta 95.4)
    // Permet de distinguer des productions "pool" vs "toujours comptées"
    // ========================================================================
    {
        id: 'utiliser-categories',
        texte: 'Veux-tu distinguer des productions **Sélection** (N meilleures retenues) et **Obligatoires** (toujours comptées) ?',
        type: 'radio',
        options: [
            {
                value: 'oui',
                label: 'Oui, j\'ai des productions obligatoires',
                description: 'Ex: évaluation finale toujours comptée, portfolio = N meilleures'
            },
            {
                value: 'non',
                label: 'Non, toutes mes productions sont dans le même pool',
                description: 'Toutes les productions sont traitées de la même façon'
            }
        ],
        champsCibles: [
            { cle: 'modalitesEvaluation', champ: 'utiliserCategories' }
        ],
        validation: {
            requis: true
        },
        aide: 'Cette option est utile si tu as des évaluations finales (examen, certification) qui doivent toujours compter, même si le reste du portfolio utilise les N meilleures.',
        sautSi: function(reponses) {
            const pratique = reponses['pratique-notation'];
            const portfolio = reponses['utiliser-portfolio'];
            const approche = reponses['approche-evaluation'];
            // Afficher seulement pour PAN-Standards avec portfolio par-artefacts
            if (pratique !== 'pan-standards') return true;
            if (approche === 'par-objectifs') return true;
            if (portfolio !== 'oui') return true;
            return false;
        }
    },

    {
        id: 'categories-selection-nombre',
        texte: 'Combien de productions **Sélection** seront retenues pour le calcul ?',
        type: 'number',
        placeholder: 'Ex: 4',
        champsCibles: [
            { cle: 'modalitesEvaluation', champ: 'categories.selection.nombreARetenir' }
        ],
        validation: {
            requis: true,
            min: 1,
            max: 20
        },
        aide: 'Les N meilleures productions marquées "Sélection" seront retenues. Ex: 4 meilleures sur 8 artefacts.',
        sautSi: function(reponses) {
            return reponses['utiliser-categories'] !== 'oui';
        }
    },

    {
        id: 'categories-selection-ponderation',
        texte: 'Quel pourcentage de la note finale pour les productions **Sélection** ?',
        type: 'number',
        placeholder: '65',
        champsCibles: [
            { cle: 'modalitesEvaluation', champ: 'categories.selection.ponderation' }
        ],
        validation: {
            requis: true,
            min: 0,
            max: 100
        },
        aide: 'Ex: 65% pour le portfolio (Sélection) + 35% pour l\'évaluation finale (Obligatoire) = 100%',
        sautSi: function(reponses) {
            return reponses['utiliser-categories'] !== 'oui';
        }
    },

    {
        id: 'categories-obligatoires-ponderation',
        texte: 'Quel pourcentage pour les productions **Obligatoires** ?',
        type: 'number',
        placeholder: '35',
        champsCibles: [
            { cle: 'modalitesEvaluation', champ: 'categories.obligatoires.ponderation' }
        ],
        validation: {
            requis: true,
            min: 0,
            max: 100
        },
        aide: 'Les productions Obligatoires comptent toujours (note = 0 si non remise). Ex: certification finale.',
        sautSi: function(reponses) {
            return reponses['utiliser-categories'] !== 'oui';
        }
    },

    {
        id: 'categories-obligatoires-nombre',
        texte: 'Combien de productions **Obligatoires** prévois-tu ?',
        type: 'number',
        placeholder: 'Ex: 2',
        champsCibles: [
            { cle: 'modalitesEvaluation', champ: 'categories.obligatoires.nombre' }
        ],
        validation: {
            requis: true,
            min: 1,
            max: 10
        },
        aide: 'Les productions Obligatoires sont toujours comptées dans la note (ex: examen final, certification). Note = 0 si non remise.',
        sautSi: function(reponses) {
            return reponses['utiliser-categories'] !== 'oui';
        }
    },

    {
        id: 'categories-info-validation',
        texte: function(reponses) {
            const pondSel = parseInt(reponses['categories-selection-ponderation']) || 0;
            const pondObl = parseInt(reponses['categories-obligatoires-ponderation']) || 0;
            const totalPond = pondSel + pondObl;

            const nSel = parseInt(reponses['categories-selection-nombre']) || 4;
            const nObl = parseInt(reponses['categories-obligatoires-nombre']) || 2;
            const totalProd = nSel + nObl;

            if (totalPond === 100) {
                return `✅ **Configuration validée !**\n\n` +
                    `📊 **Construction de la note**\n` +
                    `• Sélection : **${nSel} meilleures** retenues → **${pondSel}%**\n` +
                    `• Obligatoires : **${nObl} production${nObl > 1 ? 's' : ''}** → **${pondObl}%**\n\n` +
                    `**Total : ${totalProd} productions pour 100%**`;
            } else if (totalPond < 100) {
                return `⚠️ **Attention** : Le total des pondérations est de **${totalPond}%** (inférieur à 100%).\n\n` +
                    `📊 Construction prévue : ${nSel} meilleures + ${nObl} obligatoire${nObl > 1 ? 's' : ''} = **${totalProd} productions**\n\n` +
                    `Tu pourras ajuster dans **Réglages → Pratique de notation**.`;
            } else {
                return `❌ **Attention** : Le total des pondérations dépasse 100% (**${totalPond}%**).\n\n` +
                    `📊 Construction prévue : ${nSel} meilleures + ${nObl} obligatoire${nObl > 1 ? 's' : ''} = **${totalProd} productions**\n\n` +
                    `Tu devras ajuster dans **Réglages → Pratique de notation**.`;
            }
        },
        type: 'info',
        champsCibles: [],
        sautSi: function(reponses) {
            return reponses['utiliser-categories'] !== 'oui';
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
    // ÉTAPE 3 : BORNES DU TRIMESTRE (2-3 questions selon config existante)
    // ========================================================================

    // ✅ NOUVEAU (8 janvier 2026) : Détection config trimestre existante
    {
        id: 'trimestre-config-existante',
        texte: function() {
            // Récupérer les infos du trimestre actif
            const cadre = db.getSync('cadreCalendrier', {});
            const trimestreActif = db.getSync('trimestreActif', null);

            const nomTrimestre = trimestreActif?.nom || 'Le trimestre actif';
            const dateDebut = cadre.dateDebut || '';
            const dateFin = cadre.finCours || cadre.finTrimestre || '';

            // Formater les dates pour affichage
            const formatDate = (d) => {
                if (!d) return '?';
                const date = new Date(d + 'T12:00:00');
                return date.toLocaleDateString('fr-CA', { day: 'numeric', month: 'long' });
            };

            return `**${nomTrimestre}** est déjà configuré :\n\n` +
                   `• Début : **${formatDate(dateDebut)}**\n` +
                   `• Fin : **${formatDate(dateFin)}**\n\n` +
                   `Veux-tu utiliser ces dates pour ce groupe-cours ?`;
        },
        type: 'radio',
        options: [
            {
                value: 'oui',
                label: 'Oui, utiliser ces dates',
                description: 'Les dates du trimestre sont déjà bonnes'
            },
            {
                value: 'non',
                label: 'Non, modifier les dates',
                description: 'Je veux entrer de nouvelles dates'
            }
        ],
        champsCibles: [],
        validation: {
            requis: true
        },
        // N'afficher que si le trimestre a déjà des dates configurées
        sautSi: function() {
            const cadre = db.getSync('cadreCalendrier', {});
            // Sauter si PAS de dates configurées
            return !cadre.dateDebut || !cadre.finCours;
        }
    },

    {
        id: 'trimestre-debut',
        texte: 'Quelle est la date de début du trimestre ?',
        type: 'date',
        champsCibles: [
            { cle: 'cadreCalendrier', champ: 'dateDebut' }
        ],
        validation: {
            requis: true
        },
        // ✅ NOUVEAU (8 janvier 2026) : Sauter si l'utilisateur veut réutiliser la config existante
        sautSi: function(reponses) {
            return reponses['trimestre-config-existante'] === 'oui';
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
        },
        // ✅ NOUVEAU (8 janvier 2026) : Sauter si l'utilisateur veut réutiliser la config existante
        sautSi: function(reponses) {
            return reponses['trimestre-config-existante'] === 'oui';
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
        type: 'time',  // ✅ MODIF (Beta 95.2 - Souhait Bruno) : Permettre heures non piles
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
        type: 'time',  // ✅ MODIF (Beta 95.2 - Souhait Bruno) : Permettre heures non piles
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
        type: 'time',  // ✅ MODIF (Beta 95.2 - Souhait Bruno) : Permettre heures non piles
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
        type: 'time',  // ✅ MODIF (Beta 95.2 - Souhait Bruno) : Permettre heures non piles
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
        type: 'time',  // ✅ MODIF (Beta 95.2 - Souhait Bruno) : Permettre heures non piles
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
        type: 'time',  // ✅ MODIF (Beta 95.2 - Souhait Bruno) : Permettre heures non piles
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
    // MODULE MATÉRIEL : CRÉATION ACTIVE DE MATÉRIEL PÉDAGOGIQUE
    // Remplace les anciennes étapes 7-14 passives (Beta 97.5+)
    // Lancé via le module "Créer du matériel" du tour guidé
    // ========================================================================

    // M1 — Détection du contexte (pratique de notation)
    {
        id: 'materiel-intro',
        texte: 'Détection de la pratique de notation en cours...',
        type: 'action',
        action: 'detecterContexteMateriel',
        champsCibles: [],
        validation: { requis: false }
    },

    // M1b — Aucune pratique configurée → message d'orientation
    {
        id: 'materiel-pas-configure',
        texte: 'Aucune pratique de notation n\'est configurée.\n\nPour créer du matériel pédagogique, configure d\'abord ta pratique de notation via le **Module 4 : Créer ma pratique de notation** du tour guidé.\n\nTu peux fermer cette fenêtre et lancer le Module 4.',
        type: 'message',
        champsCibles: [],
        validation: { requis: false },
        finParcoursMateriel: true,
        sautSi: function(reponses) {
            return reponses['materiel-pratique-detectee'] && reponses['materiel-pratique-detectee'] !== 'aucune';
        }
    },

    // M1c — Résumé du contexte détecté
    {
        id: 'materiel-contexte',
        texte: function(reponses) {
            var pratique = reponses['materiel-pratique-detectee'];
            var labels = {
                'sommative': 'Sommative',
                'pan-standards': 'PAN-Standards',
                'pan-specifications': 'PAN-Spécifications'
            };
            var label = labels[pratique] || pratique;
            var detail = '';
            if (pratique === 'sommative') {
                detail = '\n\nEn pratique sommative, une grille de critères et une production seront créées (pas d\'échelle de performance).';
            } else if (pratique === 'pan-standards') {
                detail = '\n\nEn PAN-Standards, le parcours complet sera proposé : échelle de performance, grille de critères, production et cartouches de rétroaction.';
            } else if (pratique === 'pan-specifications') {
                detail = '\n\nEn PAN-Spécifications, une grille de spécifications et une production seront créées.';
            }
            return 'Pratique détectée : **' + label + '**' + detail;
        },
        type: 'instruction',
        champsCibles: [],
        sautSi: function(reponses) {
            return !reponses['materiel-pratique-detectee'] || reponses['materiel-pratique-detectee'] === 'aucune';
        }
    },

    // M2 — Choix d'échelle de performance (PAN seulement)
    {
        id: 'materiel-echelle-choix',
        texte: 'Quelle échelle de performance souhaites-tu utiliser ?',
        type: 'radio',
        options: [
            {
                value: 'idme',
                label: 'IDME (Incomplet / en Développement / Maîtrisé / Étendu)',
                description: 'Échelle à 4 niveaux, la plus courante en PAN-Standards.'
            },
            {
                value: 'abcd',
                label: 'ABCD (4 niveaux lettres)',
                description: 'Échelle à 4 niveaux avec notation par lettres.'
            },
            {
                value: 'personnaliser',
                label: 'Personnaliser',
                description: 'Créer une échelle sur mesure avec tes propres niveaux.'
            }
        ],
        champsCibles: [],
        validation: { requis: true },
        sautSi: function(reponses) {
            var p = reponses['materiel-pratique-detectee'];
            return p === 'sommative' || p === 'pan-specifications' || p === 'aucune' || !p;
        }
    },

    // M2a — Nom personnalisé de l'échelle
    {
        id: 'materiel-echelle-nom',
        texte: 'Comment souhaites-tu appeler ton échelle ?',
        type: 'text',
        placeholder: 'Ex: Mon échelle de performance',
        champsCibles: [],
        validation: { requis: true, minLength: 2 },
        sautSi: function(reponses) {
            return reponses['materiel-echelle-choix'] !== 'personnaliser';
        }
    },

    // M2b — Nombre de niveaux
    {
        id: 'materiel-echelle-niveaux',
        texte: 'Combien de niveaux comporte ton échelle ?',
        type: 'number',
        placeholder: '4',
        champsCibles: [],
        validation: { requis: true, min: 2, max: 6 },
        sautSi: function(reponses) {
            return reponses['materiel-echelle-choix'] !== 'personnaliser';
        }
    },

    // M2c — Noms des niveaux
    {
        id: 'materiel-echelle-noms-niveaux',
        texte: 'Nommez chaque niveau du plus faible au plus fort (un par ligne).',
        type: 'textarea',
        placeholder: 'Ex:\nIncomplet\nen Développement\nMaîtrisé\nÉtendu',
        champsCibles: [],
        validation: { requis: true },
        sautSi: function(reponses) {
            return reponses['materiel-echelle-choix'] !== 'personnaliser';
        }
    },

    // M2-action — Création de l'échelle
    {
        id: 'materiel-echelle-creer',
        texte: 'Création de l\'échelle en cours...',
        type: 'action',
        action: 'creerEchelleDepuisParcours',
        champsCibles: [],
        validation: { requis: false },
        sautSi: function(reponses) {
            var p = reponses['materiel-pratique-detectee'];
            return p === 'sommative' || p === 'pan-specifications' || p === 'aucune' || !p;
        }
    },

    // M3 — Confirmation échelle
    {
        id: 'materiel-echelle-confirmation',
        texte: function(reponses) {
            var nom = reponses['materiel-echelle-nom-cree'] || 'Échelle';
            var nb = reponses['materiel-echelle-nb-niveaux-crees'] || '4';
            return '✅ Échelle **' + nom + '** créée avec ' + nb + ' niveaux.\n\nTu pourras la modifier dans **Matériel → Échelles de performance**.';
        },
        type: 'instruction',
        champsCibles: [],
        sautSi: function(reponses) {
            var p = reponses['materiel-pratique-detectee'];
            return p === 'sommative' || p === 'pan-specifications' || p === 'aucune' || !p;
        }
    },

    // M4 — Grille de critères
    {
        id: 'materiel-grille-choix',
        texte: 'Souhaites-tu créer une grille de critères d\'évaluation ?',
        type: 'radio',
        options: [
            {
                value: 'base',
                label: 'Grille de base (4 critères à 25%)',
                description: 'Critères génériques : Compréhension, Démarche, Communication, Esprit critique.'
            },
            {
                value: 'personnaliser',
                label: 'Personnaliser',
                description: 'Définir tes propres critères d\'évaluation.'
            },
            {
                value: 'passer',
                label: 'J\'en ai déjà une',
                description: 'Passer cette étape.'
            }
        ],
        champsCibles: [],
        validation: { requis: true },
        sautSi: function(reponses) {
            return reponses['materiel-pratique-detectee'] === 'aucune' || !reponses['materiel-pratique-detectee'];
        }
    },

    // M4a — Nombre de critères
    {
        id: 'materiel-grille-nb-criteres',
        texte: 'Combien de critères d\'évaluation souhaites-tu ?',
        type: 'number',
        placeholder: '4',
        champsCibles: [],
        validation: { requis: true, min: 1, max: 10 },
        sautSi: function(reponses) {
            return reponses['materiel-grille-choix'] !== 'personnaliser';
        }
    },

    // M4b — Noms des critères
    {
        id: 'materiel-grille-noms-criteres',
        texte: 'Nommez chaque critère (un par ligne).',
        type: 'textarea',
        placeholder: 'Ex:\nCompréhension du sujet\nQualité de la démarche\nCommunication\nEsprit critique',
        champsCibles: [],
        validation: { requis: true },
        sautSi: function(reponses) {
            return reponses['materiel-grille-choix'] !== 'personnaliser';
        }
    },

    // M4-action — Création de la grille
    {
        id: 'materiel-grille-creer',
        texte: 'Création de la grille en cours...',
        type: 'action',
        action: 'creerGrilleDepuisParcours',
        champsCibles: [],
        validation: { requis: false },
        sautSi: function(reponses) {
            var p = reponses['materiel-pratique-detectee'];
            return reponses['materiel-grille-choix'] === 'passer' || p === 'aucune' || !p;
        }
    },

    // M4-confirmation
    {
        id: 'materiel-grille-confirmation',
        texte: function(reponses) {
            var nom = reponses['materiel-grille-nom-cree'] || 'Grille';
            var nb = reponses['materiel-grille-nb-criteres-crees'] || '4';
            return '✅ Grille **' + nom + '** créée avec ' + nb + ' critères.\n\nTu pourras la modifier dans **Matériel → Grilles de critères**.';
        },
        type: 'instruction',
        champsCibles: [],
        sautSi: function(reponses) {
            var p = reponses['materiel-pratique-detectee'];
            return reponses['materiel-grille-choix'] === 'passer' || p === 'aucune' || !p;
        }
    },

    // M5 — Production : titre
    {
        id: 'materiel-production-titre',
        texte: 'Comment s\'appelle ta première évaluation ?',
        type: 'text',
        placeholder: 'Ex: Examen mi-session, Analyse littéraire...',
        champsCibles: [],
        validation: { requis: true, minLength: 2 },
        sautSi: function(reponses) {
            return reponses['materiel-pratique-detectee'] === 'aucune' || !reponses['materiel-pratique-detectee'];
        }
    },

    // M5b — Type de production
    {
        id: 'materiel-production-type',
        texte: 'Quel type d\'évaluation ?',
        type: 'radio',
        options: [
            { value: 'travail', label: 'Travail', description: 'Travail remis (dissertation, rapport, etc.)' },
            { value: 'examen', label: 'Examen', description: 'Examen en classe ou en ligne' },
            { value: 'projet', label: 'Projet', description: 'Projet de longue durée' },
            { value: 'quiz', label: 'Quiz', description: 'Évaluation courte' }
        ],
        champsCibles: [],
        validation: { requis: true },
        sautSi: function(reponses) {
            return reponses['materiel-pratique-detectee'] === 'aucune' || !reponses['materiel-pratique-detectee'];
        }
    },

    // M5c — Pondération
    {
        id: 'materiel-production-ponderation',
        texte: 'Quelle est la pondération de cette évaluation ?',
        type: 'number',
        placeholder: '25',
        valeurDefaut: '25',
        champsCibles: [],
        validation: { requis: true, min: 1, max: 100 },
        aide: 'Poids dans la note finale (en %).',
        sautSi: function(reponses) {
            return reponses['materiel-pratique-detectee'] === 'aucune' || !reponses['materiel-pratique-detectee'];
        }
    },

    // M5-action — Création de la production
    {
        id: 'materiel-production-creer',
        texte: 'Création de la production en cours...',
        type: 'action',
        action: 'creerProductionDepuisParcours',
        champsCibles: [],
        validation: { requis: false },
        sautSi: function(reponses) {
            return reponses['materiel-pratique-detectee'] === 'aucune' || !reponses['materiel-pratique-detectee'];
        }
    },

    // M6 — Cartouches de rétroaction (PAN + échelle + grille existent)
    {
        id: 'materiel-cartouches-choix',
        texte: 'Souhaites-tu préparer des modèles de rétroaction ?',
        type: 'radio',
        options: [
            {
                value: 'oui',
                label: 'Oui, créer une cartouche vide',
                description: 'Crée la matrice critère × niveau avec des textes vides à compléter.'
            },
            {
                value: 'non',
                label: 'Plus tard',
                description: 'Tu pourras les créer plus tard dans Matériel → Cartouches.'
            }
        ],
        champsCibles: [],
        validation: { requis: true },
        aide: 'Les cartouches sont des textes pré-rédigés pour chaque combinaison critère/niveau.',
        sautSi: function(reponses) {
            var pratique = reponses['materiel-pratique-detectee'];
            var echelleCreee = reponses['materiel-echelle-id-cree'];
            var grilleCreee = reponses['materiel-grille-id-cree'];
            // Cartouches uniquement si PAN + échelle + grille créées
            return pratique === 'sommative' || pratique === 'pan-specifications' || !echelleCreee || !grilleCreee;
        }
    },

    // M6-action — Création de la cartouche
    {
        id: 'materiel-cartouches-creer',
        texte: 'Création de la cartouche en cours...',
        type: 'action',
        action: 'creerCartoucheDepuisParcours',
        champsCibles: [],
        validation: { requis: false },
        sautSi: function(reponses) {
            return reponses['materiel-cartouches-choix'] !== 'oui';
        }
    },

    // M7 — Récapitulatif
    {
        id: 'materiel-recapitulatif',
        texte: function(reponses) {
            var resume = '**Récapitulatif du matériel créé :**\n\n';
            if (reponses['materiel-echelle-nom-cree']) {
                resume += '✅ Échelle : **' + reponses['materiel-echelle-nom-cree'] + '**\n';
            }
            if (reponses['materiel-grille-nom-cree']) {
                resume += '✅ Grille : **' + reponses['materiel-grille-nom-cree'] + '**\n';
            }
            if (reponses['materiel-production-titre']) {
                resume += '✅ Production : **' + reponses['materiel-production-titre'] + '**\n';
            }
            if (reponses['materiel-cartouches-choix'] === 'oui') {
                resume += '✅ Cartouche de rétroaction créée\n';
            }
            if (!reponses['materiel-echelle-nom-cree'] && !reponses['materiel-grille-nom-cree'] && !reponses['materiel-production-titre']) {
                resume += 'Aucun matériel créé lors de ce parcours.\n';
            }
            resume += '\nTu peux modifier ce matériel dans la section **Matériel** de l\'application.';
            return resume;
        },
        type: 'message',
        champsCibles: [],
        validation: { requis: false },
        finParcoursMateriel: true
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

    // [Chantier 1 — 6 fev 2026] question 'execution-import-demo' supprimee (demantelement demo)

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


})();
