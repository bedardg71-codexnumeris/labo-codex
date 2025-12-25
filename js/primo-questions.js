/**
 * PRIMO QUESTIONS - Structure des questions conversationnelles
 *
 * Définit toutes les questions que Primo pose pour configurer l'application.
 * Chaque question est liée à un champ spécifique dans les formulaires de Réglages.
 *
 * VERSION : 1.0
 * DATE : 27 novembre 2025
 * AUTEUR : Grégoire Bédard (Labo Codex) avec Claude
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
                description: 'Productions évaluées conforme/non-conforme, note selon forfait (ensemble de travaux) complété.',
                disabled: true,
                disabledMessage: 'Bientôt disponible'
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

    // Question commune PAN (Maîtrise et Spécifications)
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
            return pratique !== 'pan-standards' && pratique !== 'pan-specifications';
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
            return (pratique !== 'pan-standards' && pratique !== 'pan-specifications') || portfolio !== 'oui';
        }
    },

    // MODE EXPERT : 4 variantes PAN-Standards (traces sélectives)
    {
        id: 'construction-note-expert',
        texte: 'Comment veux-tu construire la note finale ?',
        type: 'radio',
        options: [
            {
                value: 'n-meilleurs',
                label: 'N meilleures productions',
                description: 'La note est basée sur les N meilleures productions. Ex: Grégoire Bédard (Littérature).'
            },
            {
                value: 'n-recents',
                label: 'N productions les plus récentes',
                description: 'Valorise l\'état actuel des apprentissages plutôt que les difficultés initiales.'
            },
            {
                value: 'grille-profils',
                label: 'Grille de profils de niveaux',
                description: 'Conversion du profil global (combinaison de niveaux) → %. Ex: Bruno V. (Chimie).'
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
            // Afficher seulement si PAN-Standards + mode expert + portfolio oui
            return pratique !== 'pan-standards' || mode !== 'expert' || portfolio !== 'oui';
        }
    },

    // MODE EXPLORATION : 3 grandes orientations simplifiées
    {
        id: 'construction-note-exploration',
        texte: 'Quelle orientation préfères-tu pour le calcul de la note ?',
        type: 'radio',
        options: [
            {
                value: 'valoriser-progres',
                label: '📈 Valoriser le progrès',
                description: 'Seuls les meilleurs travaux comptent. Les erreurs du début ne pénalisent pas.'
            },
            {
                value: 'considerer-ensemble',
                label: '📊 Considérer l\'ensemble',
                description: 'Tous les travaux contribuent à la note. Vision globale de la progression.'
            },
            {
                value: 'indecis',
                label: '🤔 Je ne sais pas encore',
                description: 'On utilise un défaut et tu pourras ajuster plus tard dans les Réglages.'
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
            { value: 'lundi', label: 'Lundi' },
            { value: 'mardi', label: 'Mardi' },
            { value: 'mercredi', label: 'Mercredi' },
            { value: 'jeudi', label: 'Jeudi' },
            { value: 'vendredi', label: 'Vendredi' }
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
        type: 'select',
        options: [
            { value: '08:00', label: '08:00' },
            { value: '09:00', label: '09:00' },
            { value: '10:00', label: '10:00' },
            { value: '11:00', label: '11:00' },
            { value: '12:00', label: '12:00' },
            { value: '13:00', label: '13:00' },
            { value: '14:00', label: '14:00' },
            { value: '15:00', label: '15:00' },
            { value: '16:00', label: '16:00' },
            { value: '17:00', label: '17:00' },
            { value: '18:00', label: '18:00' }
        ],
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
        type: 'select',
        options: [
            { value: '09:00', label: '09:00' },
            { value: '10:00', label: '10:00' },
            { value: '11:00', label: '11:00' },
            { value: '12:00', label: '12:00' },
            { value: '13:00', label: '13:00' },
            { value: '14:00', label: '14:00' },
            { value: '15:00', label: '15:00' },
            { value: '16:00', label: '16:00' },
            { value: '17:00', label: '17:00' },
            { value: '18:00', label: '18:00' },
            { value: '19:00', label: '19:00' }
        ],
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
            { value: 'lundi', label: 'Lundi' },
            { value: 'mardi', label: 'Mardi' },
            { value: 'mercredi', label: 'Mercredi' },
            { value: 'jeudi', label: 'Jeudi' },
            { value: 'vendredi', label: 'Vendredi' }
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
        type: 'select',
        options: [
            { value: '08:00', label: '08:00' },
            { value: '09:00', label: '09:00' },
            { value: '10:00', label: '10:00' },
            { value: '11:00', label: '11:00' },
            { value: '12:00', label: '12:00' },
            { value: '13:00', label: '13:00' },
            { value: '14:00', label: '14:00' },
            { value: '15:00', label: '15:00' },
            { value: '16:00', label: '16:00' },
            { value: '17:00', label: '17:00' },
            { value: '18:00', label: '18:00' }
        ],
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
        type: 'select',
        options: [
            { value: '09:00', label: '09:00' },
            { value: '10:00', label: '10:00' },
            { value: '11:00', label: '11:00' },
            { value: '12:00', label: '12:00' },
            { value: '13:00', label: '13:00' },
            { value: '14:00', label: '14:00' },
            { value: '15:00', label: '15:00' },
            { value: '16:00', label: '16:00' },
            { value: '17:00', label: '17:00' },
            { value: '18:00', label: '18:00' },
            { value: '19:00', label: '19:00' }
        ],
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
            { value: 'lundi', label: 'Lundi' },
            { value: 'mardi', label: 'Mardi' },
            { value: 'mercredi', label: 'Mercredi' },
            { value: 'jeudi', label: 'Jeudi' },
            { value: 'vendredi', label: 'Vendredi' }
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
        type: 'select',
        options: [
            { value: '08:00', label: '08:00' },
            { value: '09:00', label: '09:00' },
            { value: '10:00', label: '10:00' },
            { value: '11:00', label: '11:00' },
            { value: '12:00', label: '12:00' },
            { value: '13:00', label: '13:00' },
            { value: '14:00', label: '14:00' },
            { value: '15:00', label: '15:00' },
            { value: '16:00', label: '16:00' },
            { value: '17:00', label: '17:00' },
            { value: '18:00', label: '18:00' }
        ],
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
        type: 'select',
        options: [
            { value: '09:00', label: '09:00' },
            { value: '10:00', label: '10:00' },
            { value: '11:00', label: '11:00' },
            { value: '12:00', label: '12:00' },
            { value: '13:00', label: '13:00' },
            { value: '14:00', label: '14:00' },
            { value: '15:00', label: '15:00' },
            { value: '16:00', label: '16:00' },
            { value: '17:00', label: '17:00' },
            { value: '18:00', label: '18:00' },
            { value: '19:00', label: '19:00' }
        ],
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
        texte: '**Ajout des étudiants**\n\nConsulte le système de gestion des apprentissages de ton établissement pour récupérer la liste de tes élèves. Nous allons la copier-coller à la prochaine étape.\n\nSi tu préfères utiliser une liste fictive, tu trouveras un fichier **etudiants-demo.csv** dans le dossier **materiel-demo/** que tu peux ouvrir et copier-coller.',
        type: 'instruction',
        champsCibles: [],
        validation: { requis: false }
    },

    {
        id: 'etudiants-liste',
        texte: 'Parfait ! Colle ta liste ici (DA, Nom, Prénom, Programme par ligne, séparés par virgules ou tabulations).',
        type: 'textarea',
        placeholder: 'Ex:\n1234567,Tremblay,Sophie,506.A0\n2345678,Gagnon,Marc,200.B1',
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

            lignes.forEach(ligne => {
                ligne = ligne.trim();
                if (ligne === '') return;

                // Support virgules ou tabulations
                const separateur = ligne.includes('\t') ? '\t' : ',';
                const parts = ligne.split(separateur).map(p => p.trim());

                if (parts.length >= 3) {
                    etudiants.push({
                        da: parts[0],
                        nom: parts[1],
                        prenom: parts[2],
                        programme: parts[3] || '',
                        courriel: parts[4] || ''
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
        texte: '**Étape 1 : Importer l\'échelle de performance**\n\n1️⃣ Va dans **Matériel → Échelles de performance**\n2️⃣ Clique sur **Nouvelle échelle**\n3️⃣ Clique sur **Options d\'import/export**\n4️⃣ Clique sur **Importer une échelle**\n5️⃣ Sélectionne le fichier **test-echelle-idme.json** dans le dossier **materiel-demo**\n6️⃣ Confirme l\'importation\n\nTu devrais voir apparaître **Échelle IDME Test** avec 2 niveaux (I et M).\n\nClique **"Suivant →"** quand c\'est fait.',
        type: 'instruction',
        champsCibles: [],
        validation: { requis: false }
    },

    // ========================================================================
    // ÉTAPE 10 : IMPORT MANUEL DE LA GRILLE SRPNF (MODE NOTIFICATION)
    // ========================================================================
    {
        id: 'importer-grille-srpnf',
        texte: '**Étape 2 : Importer la grille d\'évaluation**\n\n1️⃣ Va dans **Matériel → Grilles de critères**\n2️⃣ Clique sur **Nouvelle grille**\n3️⃣ Clique sur **Options d\'import/export**\n4️⃣ Clique sur **Importer des grilles**\n5️⃣ Sélectionne le fichier **test-grille-srpnf.json** dans le dossier **materiel-demo**\n6️⃣ Confirme l\'importation\n\nTu devrais voir apparaître **Grille Test** avec 2 critères (Critère A et B).\n\nClique **"Suivant →"** quand c\'est fait.',
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
        texte: '**Consulte un profil individuel**\n\n1️⃣ Clique sur **Liste des étudiants**\n2️⃣ Choisis n\'importe qui\n\nTu vois :\n• Son engagement (A-C-P)\n• Ses forces et défis SRPNF\n• Ses productions évaluées\n• Recommandations d\'intervention\n\nC\'est le cœur du système de monitorage !\n\nTu as exploré un profil ?',
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

// ============================================================================
// EXPORTS
// ============================================================================

window.obtenirQuestion = obtenirQuestion;
window.obtenirToutesLesQuestions = obtenirToutesLesQuestions;
window.obtenirQuestionsActives = obtenirQuestionsActives;
window.validerReponse = validerReponse;
window.transformerReponse = transformerReponse;
window.obtenirOptions = obtenirOptions;

console.log('✅ Module primo-questions.js chargé (' + QUESTIONS_PRIMO.length + ' questions)');
