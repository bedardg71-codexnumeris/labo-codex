/**
 * accompagnement-contenu-hover.js
 * Catalogue de contenu pour le mode `hover` (info-bulles au survol/long-press/focus).
 * Source : docs/refonte-textes/infobulles-T1-*.md à T11-*.md (validé 19 avril 2026).
 * Convention : tutoiement, guillemets français, apostrophes typographiques.
 *
 * Pousse les ~283 entrées dans CATALOGUE_ACCOMPAGNEMENT via
 * window.accompagnement.ajouterEntrees(). DOIT être chargé APRÈS
 * js/accompagnement.js.
 */
(function() {
'use strict';

const TOOLTIPS = {

    // =================================================================
    // T1 — EN-TÊTE
    // =================================================================

    // --- Bandeau d'identification ---

    'entete-mode-affichage':
        'Masque les noms réels de tes étudiant·es (noms fictifs ou numéros). Utile quand tu présentes ton écran en réunion ou en formation.',
    'entete-signaler-bug':
        'Signale un problème technique OU envoie un commentaire sur l\'application — la fenêtre porte les deux modes. Le numéro de build part automatiquement avec ton message.',

    // --- Groupe-cours ---

    'entete-groupe-cours':
        'Choisis le groupe sur lequel tu travailles. Tout l\'écran (présences, évaluations, tableau de bord) s\'ajuste au groupe sélectionné.',

    // --- Codex ---

    'entete-codex':
        'Ton cahier de travail portable sur clé USB : toutes tes données dans un fichier que tu mets à jour et ouvres toi-même. Pastille verte : ton codex est à jour. Orange : il n\'a pas tes derniers changements.',

    // --- Assistance ---

    'entete-tour-guide':
        'Visite guidée : un parcours en quelques étapes pour découvrir les grandes sections de l’application.',

    // --- Réglages ---

    'entete-reglages':
        'Configure ici ton trimestre, ton cours, tes groupes et ton horaire — les mêmes informations que dans ton plan de cours.',

    // --- Soutien ---

    'entete-soutien':
        'Plusieurs façons de soutenir Labo Codex : rejoindre la communauté de pratique, en parler à tes collègues, suivre le blogue ou contribuer financièrement.',

    // =================================================================
    // T2 — RÉGLAGES — Configuration de base
    // =================================================================

    // --- Panneaux ---

    'reglages-gestion-trimestres':
        'Ton calendrier du trimestre. Les dates que tu entres ici (début, fin, congés, imprévus) génèrent automatiquement la grille de toutes tes séances.',
    // Consigne du 12 sept. 2026 (les étiquettes) : deux natures, nommées par le point unique js/mots-nature.js.
    'reglages-cours':
        'Ton cours ou ton ' + motsNature('service').objetLong + ' — ce que l’application affiche partout. Un cours d’' +
        motsNature('cours').nature.toLowerCase() + ' porte les informations du devis ministériel (code, compétence, pondération) ; un ' +
        motsNature('service').objetLong + ' n’a que son nom.',
    'reglages-enseignant':
        'Ton profil. Ton nom apparaîtra dans le sélecteur de groupe-cours et sur les ressources que tu partages.',
    'reglages-groupe-etudiants':
        'Ta liste d\'étudiant·es. Tu peux les ajouter séparément ou les importer depuis un tableur ou Omnivox. Le marqueur SA identifie ceux et celles qui sont inscrit·es aux Services adaptés.',
    'reglages-horaire':
        'L\'horaire de ton groupe : jours, heures, locaux. Combiné au calendrier du trimestre, il génère automatiquement la grille de tes séances.',
    'reglages-cours-ponderation-heures':
        'Pondération = théorie–laboratoire–travail personnel, en heures par semaine. ' +
        '(Théorie + labo) × 15 = les heures d\'enseignement (présence en classe). ' +
        'Une heure d\'enseignement correspond à une période à l\'horaire (50 à 55 min selon ' +
        'le collège), pas à 60 minutes d\'horloge. En session intensive, c\'est ce total ' +
        'd\'heures qui reste l\'invariant, pas le rythme hebdomadaire.',
    'reglages-groupe-cours':
        // #842 (12 sept. 2026) : les deux natures, nommées par le point unique js/mots-nature.js.
        'Ton espace de travail pour le trimestre — tu relies ici ton cours ou ton ' + motsNature('service').objetLong + ', ton groupe, ton horaire et ta façon de construire la note. C\'est le groupe-cours actif qui détermine ce que tu vois partout dans l\'application.',

    // --- Champs Trimestre ---

    'reglages-trim-identification':
        'Le nom et la période de ton trimestre (ex. : Hiver 2026). Sert de repère dans toute l\'application.',
    'reglages-trim-bornes':
        'Les dates clés de ton trimestre : début, fin des cours, remise des notes. Le calendrier des séances se calcule à partir de ces dates.',
    'reglages-trim-semaines-speciales':
        'Semaines de planification et d\'examens. Ces semaines sont exclues du décompte des séances régulières.',
    'reglages-trim-conges':
        'Tes congés fériés et leurs reprises. Le calendrier des séances s\'ajuste automatiquement.',
    'reglages-trim-imprevus':
        'Annulations, fermetures, maladie, météo — tout ce qui n\'était pas prévu. Le calendrier des séances s\'ajuste.',

    // --- Champs Cours ---

    'reglages-cours-competence':
        'La compétence de ton cours — le code et l\'énoncé qu\'on retrouve dans le devis ministériel ou le plan-cadre.',
    'reglages-cours-elements':
        'Les éléments de compétence de ton cours — les sous-objectifs que tes étudiant·es doivent atteindre. Servent de référence pour tes évaluations.',

    // --- Champs Groupe ---

    'reglages-etudiants-sa':
        'Coche les étudiant·es inscrit·es aux Services adaptés (diagnostic posé par un·e professionnel·le). Ce marqueur est visible dans le suivi et les interventions.',
    // #735 (lot D) — mots de Grégoire (17 sept. 2026), à ne pas retoucher.
    'reglages-etudiants-date-arrivee':
        'Facultatif : pour un·e étudiant·e arrivé·e en cours de trimestre. L\'assiduité se compte à partir de cette date.',
    'reglages-etudiants-import':
        'Importe ta liste d\'étudiant·es en lot : colle depuis le système de gestion institutionnel ou un tableur, ou charge un fichier CSV. Le format attendu est affiché dans le panneau d\'import.',

    // --- Champs Horaire ---

    'reglages-horaire-periodes':
        'Combien de périodes par séance et combien de temps dure chaque période. Le volume hebdomadaire se calcule automatiquement.',

    // --- Champs Groupe-cours ---

    'reglages-gc-nom-genere':
        'Nom généré à partir de ton trimestre, cours, groupe, horaire et profil. C\'est ce nom qui apparaît dans le sélecteur en haut de l\'écran.',
    'reglages-gc-pratique':
        'Ta façon de calculer la note finale pour ce groupe : moyenne sommative traditionnelle ou pratique alternative (meilleurs résultats retenus dans un portfolio, par exemple).',

    // --- Bibliothèque ---

    'reglages-bibliotheque':
        'Tes ressources réutilisables d\'un trimestre à l\'autre (trimestres, cours, horaires, grilles…). Choisis une ressource existante ou crées-en une nouvelle.',

    // =================================================================
    // T3 — RÉGLAGES — Avancés (préférences, dépistage, données)
    // =================================================================

    // --- Préférences ---

    'pref-actions-rlo':
        'Active trois tampons ou estampes (Repérage, Liaison, Ouverture) que tu poses sur les copies pour observer les gestes cognitifs de tes étudiant·es. Les résultats alimentent le profil ACO et l\'export de recherche anonymisé.',
    'pref-affichage-developpement':
        'Affiche le tableau de progression des critères et les graphiques 0-100 % dans la section «Développement des habiletés» du profil individuel.',
    'pref-affichage-graphiques':
        'Affiche les graphiques de progression dans le temps dans la section «Progression temporelle ACP» du profil individuel.',
    'pref-affichage-solo':
        'Affiche une carte avec les descriptions des niveaux cognitifs (taxonomie SOLO de Biggs & Collis). Utile pour interpréter la complexité des réponses de tes étudiant·es.',
    'pref-navigation':
        'Ouvre directement sur le tableau de bord au démarrage, sans passer par la page d\'accueil.',
    'pref-outils':
        'Outils disponibles pendant l\'évaluation d\'une production.',
    'pref-outils-acp':
        'Affiche les indices Assiduité (A), Complétion (C) et Performance (P) dans la section «Engagement ACP» du profil individuel.',
    'pref-outils-rai':
        'Active les niveaux d\'intervention RàI et les recommandations personnalisées. Structure le soutien à tes étudiant·es en trois niveaux d\'intensité : universel, ciblé, intensif.',
    'pref-tooltips':
        'Affiche ces descriptions contextuelles au survol. Désactive si tu maîtrises déjà l\'application.',
    'pref-visuel':
        'Effets visuels de l\'interface. L\'animation des points du tableau de bord peut être désactivée pour réduire les distractions.',

    // --- Dépistage ---

    'depist-fenetre':
        'Nombre de dernières productions analysées pour détecter les tendances. Valeur basse = détection précoce. Valeur élevée = détection plus fiable, mais plus tardive.',
    'depist-grille':
        'La grille de dépistage utilisée pour identifier les forces et les défis. Doit être la même pour toutes les productions du trimestre.',
    'depist-restaurer':
        'Réinitialise tous les seuils de détection à leurs valeurs par défaut.',
    'depist-seuil-acceptable':
        'Indice sous lequel la situation est en zone de vigilance (jaune). À surveiller.',
    'depist-seuil-bon':
        'Indice au-dessus duquel la situation est satisfaisante (vert).',
    'depist-seuil-defi':
        'Score (%) sous lequel un critère est identifié comme un défi nécessitant attention. Seuil bas = plus exigeant, seuil élevé = moins exigeant. Règle le dépistage seulement.',
    'depist-seuil-direction':
        'Variation minimale de la moyenne d\'un critère, d\'une fenêtre d\'analyse à la précédente (la même, décalée d\'une production), pour afficher une flèche (→ ou ←) après ce critère.',
    'depist-seuil-fragile':
        'Indice sous lequel la situation est préoccupante (rouge). Nécessite une intervention.',
    'depist-seuil-progression':
        'Différence minimale (%) pour signaler une progression ou une régression entre deux productions. Seuil bas = sensible, seuil élevé = moins sensible.',
    'depist-seuils-interpretation':
        'Seuils de couleur pour les indices A-C-P. Fragile (rouge), Acceptable (jaune), Bon (vert). Détermine les alertes du tableau de bord.',
    'depist-seuils-restaurer':
        'Réinitialise les seuils d\'interprétation à leurs valeurs par défaut (70 / 80 / 85 %).',
    'depist-seuils-visuels':
        'Lignes pointillées et étiquettes des niveaux de ton échelle (ex. : Incomplet, Développement, Maîtrise, Étendu) sur le graphique par critère du profil individuel et sur les trajectoires du Suivi du groupe, en mode Habiletés. Les indices A-C-P (profil et groupe) et la note finale n\'en portent pas : un pourcentage agrégé ne se situe pas dans une échelle de performance.',

    // --- Données ---

    'donnees-capturer':
        'Capture immédiate de l\'état actuel des indices A-C-P. Comme prendre une photo de la situation de ton groupe à cet instant.',
    'donnees-captures':
        'Tes captures de suivi longitudinal et l\'export anonymisé pour la recherche en éducation.',
    'donnees-codex':
        'Ouvre un codex ou une configuration partagée, ou exporte ta configuration pédagogique pour la partager. Pour mettre ton travail en sûreté ou le transporter, mets ton codex à jour : menu Codex, en haut de l\'écran.',
    'donnees-codex-ouvrir':
        'Ouvre un codex ou une configuration partagée. Le type est détecté automatiquement.',
    'donnees-codex-data':
        'Format léger sans blobs (5–30 Mo), multi-trimestres, pour la recherche longitudinale au Labo. À venir : extraction depuis tes Archives.',
    'donnees-voute':
        'Importe les ressources partagées par tes collègues (fichiers .lcz signés). Chaque fichier est vérifié : structure, signature, continuité de la clé de la personne.',
    'donnees-config-export':
        'ZIP léger sans données étudiants : grilles, échelles, productions, cartouches. Pour partager avec un·e collègue (CC BY-NC-SA).',
    'donnees-export-recherche':
        'Export anonymisé des indices A-C-P et statistiques agrégées pour la recherche. Aucune donnée nominative incluse.',
    'donnees-gestion-ressources':
        'Audite et nettoie les ressources pédagogiques accumulées. Sélectionne un type pour afficher la liste.',
    'donnees-info-techniques':
        'Tes données restent sur ton appareil (stockage local). Aucune donnée n\'est envoyée sur internet.',
    'donnees-maintenance':
        'Outils techniques : réinitialisation, informations de stockage et gestion avancée des ressources.',
    'donnees-reconstruire':
        'Recalcule l\'historique des captures depuis le début. Utile après un changement de paramètres de dépistage.',
    'donnees-reinitialiser':
        'Efface toutes les données et revient à l\'état initial. Triple confirmation et mot de passe requis. Irréversible.',
    'donnees-snapshots':
        'Enregistre l\'état des indices A-C-P à des moments clés pour suivre l\'évolution de ton groupe dans le temps.',
    'donnees-supprimer-captures':
        'Efface toutes les captures enregistrées. Action irréversible.',

    // =================================================================
    // T4 — CONSTRUCTION DE LA NOTE
    // =================================================================

    // --- Vue d'ensemble ---

    'cn-apercu':
        'Tes ressources configurées : productions, grilles, échelles, pratiques et cartouches.',
    'cn-bibliotheque':
        'Gère tes ressources : crée, importe depuis la bibliothèque communautaire, duplique, exporte ou supprime.',
    'cn-ressources':
        'Nombre total de ressources disponibles (locales et bibliothèque) pour chaque type.',
    'cn-preparer-pdf':
        'Génère un PDF de la ressource. Choisis la grille et l\'échelle, puis prévisualise avant d\'imprimer.',

    // --- Productions ---

    'cn-prod-titre':
        'Définis les productions de tes étudiant·es : travaux et exercices avec pondérations et échéances.',
    'cn-prod-tableau':
        'Tableau récapitulatif de toutes tes productions : titre, type, pondération et échéance.',
    'cn-prod-type':
        'Portfolio (conteneur d\'artefacts pondéré — ta pratique décide lesquels comptent), Artefact (production à l\'intérieur d\'un portfolio) ou Travail (évaluation indépendante).',
    'cn-prod-activite':
        'Nom de l\'activité pédagogique associée à cette production. Clique sur ✏\ufe0f pour modifier.',
    'cn-prod-grille':
        'Associe une grille d\'évaluation à cette production. Définit les critères utilisés lors de la correction.',
    'cn-prod-objectif':
        'Transférable et sans terme : la capacité qui servira à l\'artefact suivant, au cours suivant, ailleurs. On ne coche pas un objectif atteint — on en observe la progression. Apparaît dans la rétroaction et le dossier PDF.',
    'cn-prod-tache':
        'Locale et bornée : ce que l\'étudiant·e produit ici — sur quoi, en quelle quantité, sur quel support. Une tâche se termine : on peut cocher qu\'elle est faite. Apparaît dans le dossier PDF de rétroaction.',
    'cn-prod-detail-tache':
        'Les consignes qui rendent la tâche exécutable : étapes, contraintes, format. N\'y exige rien que la description de la tâche n\'annonce pas — l\'étudiant·e planifie son travail à partir de l\'annonce.',
    'cn-prod-ponderation':
        'Poids dans la note finale. L\'ensemble des productions se partage le 100 %.',
    'cn-prod-echeance':
        'Date limite de remise. Conditionne la génération des snapshots, le calcul de C (complétion) et P (performance), et la gestion des travaux remis ou non remis. Elle peut être posée d\'avance : tant que « Consignes transmises » est décochée, la production reste « à planifier » et rien n\'est dû. Clique sur l\'icône d\'info pour plus de détails.',
    'cn-prod-echeance-mg':
        'Date limite propre à ce groupe-cours. Elle peut être posée d\'avance : décoche la case tant que ce groupe n\'a pas reçu la production (échéance neutralisée). Clique sur l\'icône d\'info pour plus de détails.',

    // --- Grilles de critères ---

    'cn-grille-titre':
        'Grilles réutilisables avec critères pondérés. Chaque grille définit les critères d\'évaluation d\'une production — comme la grille papier que tu utilises déjà pour évaluer.',
    'cn-grille-critere':
        'Critères avec nom, type, pondération et description. La pondération totale doit atteindre 100 %.',
    'cn-grille-type-critere':
        'Méthode d\'évaluation du critère : holistique (tu attribues un niveau global), analytique (tu attribues des points par élément ou micro-tâche) ou algorithmique (calcul automatique, ex. : français écrit).',
    'cn-grille-ponderation-totale':
        'Somme des pondérations de tous les critères. Doit atteindre 100 % pour que la grille soit valide.',

    // --- Échelles de performance ---

    'cn-echelle-titre':
        'Échelles de conversion pourcentage → niveaux de performance. Configure les seuils et les couleurs pour chaque niveau (ex. : Incomplet, Développement, Maîtrise, Étendu).',
    'cn-echelle-niveau':
        'Chaque niveau porte DEUX traductions opposées : la plage dit dans quel niveau tombe un pourcentage, la valeur ponctuelle dit ce que vaut ce niveau quand il faut un chiffre. Les deux sont obligatoires, avec le code, le nom et la couleur.',
    'cn-echelle-apercu':
        'Barre colorée montrant les plages de chaque niveau. Vérifie visuellement la cohérence de tes seuils.',
    // #528 — le survol dit la RELATION, pas seulement la définition : c'est elle
    // qui manquait à quelqu'un qui monte sa première échelle.
    'cn-echelle-valeur-ponctuelle':
        'Ce que vaut ce niveau quand il faut un chiffre (bulletin, note finale). La plage, elle, dit l\'inverse : dans quel niveau tombe un pourcentage. Les deux sont obligatoires — le milieu de la plage est un calcul, pas ton jugement.',

    // --- Cartouches de rétroaction ---

    'cn-cartouche-titre':
        'Matrices de commentaires automatiques. Chaque cartouche génère une rétroaction par combinaison critère × niveau — un gabarit de commentaires que tu prépares une fois et qui s\'assemble à chaque évaluation.',
    'cn-cartouche-matrice':
        'Tableau critères × niveaux. Chaque cellule contient un commentaire de rétroaction. L\'application assemble automatiquement les commentaires lors de l\'évaluation.',
    'cn-cartouche-selectors':
        'La grille détermine les critères (lignes), l\'échelle détermine les niveaux (colonnes) de la matrice.',
    'cn-cartouche-contexte':
        'Texte introductif optionnel affiché au début de la rétroaction si l\'option «Contexte» est cochée. Permet de situer la production dans la progression du cours.',

    // --- Pratiques de notation ---

    'cn-pratique-titre':
        'Assemblage final de ta pratique : type de notation, échelle, structure des évaluations et système de jetons. C\'est la recette complète de ta façon de construire la note.',
    'cn-pratique-type':
        'SOM = sommative (moyenne pondérée traditionnelle), STD = PAN basée sur des standards (par maîtrise), SPE = PAN basée sur des spécifications (contrat), DEN = dénotation (pratiques réduisant ou éliminant la notation).',
    'cn-pratique-echelle':
        'Échelle utilisée pour convertir les pourcentages en niveaux (ex. : I-D-M-E). Configurable dans Échelles de performance.',
    'cn-pratique-jetons':
        'Ressources limitées que tu accordes à tes étudiant·es : Délai (prolonger l\'échéance), Reprise (refaire la production) ou Reprise ciblée (reprendre un aspect spécifique).',
    'cn-pratique-discipline':
        'Discipline académique associée. Filtre les ressources de la bibliothèque par pertinence.',
    'cn-pratique-appliquer':
        'Définit cette pratique comme configuration active du cours. Conditionne tous les calculs de notes et d\'indices.',

    // =================================================================
    // T5 — ÉVALUATIONS
    // =================================================================

    // --- Liste des évaluations ---

    'eval-liste':
        'Toutes les évaluations du groupe : résultats, niveaux IDME, jetons et accès aux dossiers PDF.',
    'eval-liste-resume':
        'Résultats totaux, évaluations recevables (les non-recevables sont exclues), moyenne du groupe et nombre de productions.',
    'eval-filtre-production':
        'Filtre les évaluations par production. Permet de voir les résultats d\'un seul travail à la fois.',
    'eval-filtre-statut':
        'Filtre par statut de progression : non reçu, reçu, importé, annoté, évalué, non verrouillée (ne compte pas encore dans la note) — ou par type de jeton.',

    // --- Interface d'évaluation ---

    'eval-page':
        'Interface d\'évaluation critériée. Sélectionne les paramètres à gauche, évalue et prévisualise la rétroaction à droite.',
    'eval-panneau-criteres':
        'Liste des critères de la grille sélectionnée. Attribue un niveau à chaque critère pour calculer la note finale.',
    'eval-grille':
        'Grille critériée avec pondérations. Détermine les critères affichés pour cette évaluation.',
    'eval-echelle':
        'Échelle de conversion pourcentage → niveau IDME. Seuils configurables dans les échelles de performance.',
    'eval-cartouche':
        'Cartouche de rétroaction associée à cette production. Détermine le vocabulaire et le ton des commentaires générés automatiquement.',
    'eval-critere':
        'Évalue ce critère en attribuant un niveau. La rétroaction est générée automatiquement selon la cartouche.',
    'eval-note-finale':
        'Résultat calculé en temps réel : pourcentage pondéré et niveau IDME correspondant.',
    'eval-niveau-idme':
        'Niveau calculé automatiquement. Modifie uniquement si nécessaire (ex. : reprise ciblée).',
    'eval-col-niveau':
        'Niveau IDME : I = Incomplet, D = Développement, M = Maîtrise, E = Étendu.',
    'eval-statut-remise':
        'Indique si la production a été remise. Conditionne le calcul de l\'indice de complétion (C).',
    'eval-integrite':
        'Recevable ou non. Les travaux non recevables (plagiat, IA non autorisée) sont exclus des calculs de moyenne et de l\'indice P.',
    'eval-francais-ecrit':
        'Évaluation algorithmique du français écrit : saisis les codes d\'erreurs et le nombre de mots. Le calcul et la rétroaction sont générés automatiquement à partir de tes formulations.',
    'eval-codes-erreurs':
        'Codes numériques des erreurs, séparés par points-virgules. Consulte la grille pour la correspondance codes → catégories.',
    'eval-modifier-attribution':
        'Corrige l\'attribution automatique : change l\'étudiant·e ou la production associée à ce fichier.',
    'eval-btn-reinitialiser':
        'Efface le formulaire d\'évaluation en cours et restaure les valeurs par défaut. Tes sélections de grille et d\'échelle sont conservées.',
    'eval-btn-supprimer':
        'Supprime définitivement cette évaluation. La production reviendra au statut précédent. Irréversible.',

    // --- Jetons ---

    'eval-jetons':
        'Délai (orange), Reprise (vert) ou Reprise ciblée (violet). Permet à l\'étudiant·e de démontrer à nouveau sa compétence ou son habileté.',
    'eval-col-jeton':
        'Type de jeton : D = Délai, R = Reprise, RC = Reprise ciblée. Permet à l\'étudiant·e de démontrer à nouveau sa compétence ou son habileté.',
    'eval-jeton-delai':
        'Prolonge l\'échéance de remise. L\'évaluation porte sur la même production, remise plus tard selon une entente convenue.',
    'eval-jeton-reprise':
        'L\'étudiant·e reprend entièrement la production pour démontrer à nouveau sa compétence. La nouvelle évaluation remplace la précédente.',

    // --- Actions du formulaire d'évaluation (#18, déploiement 13 mai 2026) ---

    'eval-btn-sauvegarder':
        'L\'évaluation s\'enregistre toute seule pendant que tu évalues. La verrouiller la fait compter dans la note ; une évaluation verrouillée se déverrouille par ce même bouton ou par le cadenas.',
    'eval-profil-rapide':
        'Ouvre le profil de l\'étudiant·e dans un nouvel onglet. Pratique pour consulter l\'historique sans perdre l\'évaluation en cours.',
    'eval-btn-regenerer-retro':
        'Regénère la rétroaction à partir de la cartouche actuelle et des niveaux sélectionnés. ⚠️ Écrase les modifications manuelles du texte.',
    'eval-affichage-note-choix':
        'Choisit le format affiché dans la rétroaction : note chiffrée (ex. 78 %) ou niveau de performance (lettre, ex. M).',

    // --- Rétroaction ---

    'eval-retroaction':
        'Rétroaction générée automatiquement. Modifie le texte au besoin, puis copie dans le presse-papier.',
    'eval-retroaction-options':
        'Sections à inclure dans la rétroaction : Description, Objectif, Tâche, Adresse (interpellation) et Contexte d\'apprentissage.',
    'eval-retro-adresse':
        'Ajoute une interpellation personnalisée au début de la rétroaction (ex. : «Bonjour [Prénom]»). Humanise le commentaire écrit.',
    'eval-retro-contexte':
        'Inclut le texte de contexte d\'apprentissage défini dans la cartouche. Situe la rétroaction dans la progression du cours.',
    'eval-retro-description':
        'Inclut un rappel du contexte de la production (titre et description) dans la rétroaction remise à l\'étudiant·e.',
    'eval-retro-objectif':
        'Inclut l\'objectif d\'apprentissage visé par la production. Rappelle à l\'étudiant·e ce qui devait être démontré.',
    'eval-retro-tache':
        'Inclut le rappel de la tâche demandée. Situe la rétroaction par rapport aux consignes initiales.',

    // =================================================================
    // T6 — TRAVAUX (import, annotation, archivage)
    // =================================================================

    // --- Import et pipeline ---

    'travaux-production':
        'Sélectionne la production (travail, examen) que tu es en train d\'évaluer. Les fichiers importés seront associés à cette production.',
    'travaux-pipeline-optimisation':
        'Traitements automatiques appliqués aux images : balance des blancs, uniformisation DPI selon le sélecteur, compression JPEG. Les fichiers d\'un même étudiant pour une même production sont regroupés (multi-pages). Les PDF sont importés tels quels.',
    'travaux-fsapi-config':
        'Stocke les fichiers importés directement sur le disque au lieu de la base du navigateur, ce qui lève ses limites de taille. Disponible seulement dans les navigateurs qui le permettent — ni Safari, ni Firefox, ni aucun navigateur de tablette. Par défaut, l\'accès au dossier est redemandé à chaque démarrage : c\'est un choix de sécurité, qu\'on peut lever dans Réglages > Préférences > Sécurité. Choisis un dossier local et stable, hors d\'un dossier synchronisé (iCloud, OneDrive) : un fichier évincé vers le nuage n\'est plus lisible.',

    // --- Actions sur les travaux ---

    'travaux-btn-annoter':
        'Mode annotation : surligne, écris et appose des tampons / estampes ou des codes spécifiques directement sur la copie de l\'étudiant·e.',
    'travaux-btn-evaluer':
        'Mode évaluation : ouvre les panneaux de critères et de paramètres pour évaluer cette production selon la grille.',
    'travaux-evaluer':
        'Ouvre l\'interface d\'évaluation avec l\'étudiant·e et la production présélectionnés. Tu pourras appliquer une grille de critères et générer une rétroaction.',
    'travaux-btn-reimporter':
        'Remplace un fichier allégé par l\'original complet, à re-déposer. Ne concerne que les copies allégées avant le retrait de cette fonctionnalité.',

    // --- Archivage et export ---

    'travaux-archivage-etudiant':
        'Télécharge un ZIP contenant tous les travaux d\'un·e étudiant·e. Utile pour remettre un dossier complet en fin de session.',
    'travaux-archivage-production':
        'Télécharge un ZIP regroupant tous les travaux d\'une production. Pratique pour archiver une évaluation complète.',
    'travaux-archivage-inclure-annotes':
        'Ajoute les versions annotées (avec surlignage, commentaires et tampons) au ZIP. Décoche pour n\'exporter que les originaux.',
    'travaux-archivage-inclure-evals':
        'Ajoute un fichier de rétroaction pour chaque évaluation complétée. Pratique pour la remise aux étudiant·es.',

    // =================================================================
    // T7 — TABLEAU DE BORD — Aperçu
    // =================================================================

    // --- Navigation et vue d'ensemble ---

    'tdb-apercu':
        'Portrait complet de ton groupe-cours : indices d\'apprentissage, patterns, interventions et graphiques de développement.',
    'tdb-sous-nav':
        'Quatre vues : aperçu du groupe, liste des individus, profil étudiant·e et interventions RàI.',
    'tdb-zones-couleur':
        'Fragile (30-47,5 %), Modéré (47,5-65 %), Favorable (65-82,5 %), Très favorable (≥ 82,5 %).',

    // --- Observer (indices A-C-P) ---

    'tdb-observer':
        'Indices A-C-P du groupe. Chaque barre positionne les étudiant·es sur une échelle qui décrit son contexte d\'apprentissage observé, allant de Fragile à Très favorable.',
    'tdb-selecteur-indice':
        'Choisis l\'indice à visualiser : Assiduité (A), Complétion (C) ou Performance (P).',
    'tdb-assiduite':
        'Taux de présence aux séances. Chaque point représente un·e étudiant·e.',
    'tdb-completion':
        'Taux de remise des travaux. La corrélation C×P indique le lien entre la remise et les résultats.',
    'tdb-performance':
        'Résultats aux évaluations par niveaux. La performance peut être notée avec un chiffre ou une lettre (ex. : Incomplet, Développement, Maîtrise, Étendu).',
    'tdb-liste-individus':
        'Vue détaillée de chaque étudiant·e avec ses indices individuels.',
    'tdb-profil':
        'Fiche individuelle d\'un·e étudiant·e : trajectoire, indices et historique.',

    // --- Graphiques ---

    'tdb-dev-groupe':
        'Évolution d\'un indice dans le temps pour tout le groupe. Chaque ligne représente un·e étudiant·e.',
    'tdb-graphique-groupe':
        'Graphique longitudinal du groupe. Clique sur une courbe pour la verrouiller.',
    'tdb-selecteur-eleve-groupe':
        'Isole la trajectoire d\'un·e étudiant·e sur le graphique du groupe.',
    'tdb-dev-individuel':
        'Résultats par production. Chaque point représente un·e étudiant·e sur une activité. Les trajectoires isolées méritent attention.',
    'tdb-graphique-individuel':
        'Résultats par activité d\'apprentissage. Les zones denses révèlent les tendances du groupe.',
    'tdb-selecteur-eleve-indiv':
        'Isole la trajectoire d\'un·e étudiant·e sur le graphique des productions.',
    'tdb-impact-jetons':
        'Compare la trajectoire P avec et sans jeton de reprise. ■ = production avec jeton, □ = sans.',
    'tdb-selecteur-eleve-jetons':
        'Affiche la courbe P individuelle d\'un·e étudiant·e ayant utilisé un jeton de reprise.',

    // --- Patterns et RàI ---

    'tdb-patterns':
        'Progression sur les critères multistructurels (fondations SOLO) identifiés dans ta grille. Complémentaire au modèle RàI, qui regarde spécifiquement la performance globale et certains aspects comportementaux (mobilisation observée).',
    'tdb-rai':
        'Niveau d\'intervention selon la performance globale (indice P, tous critères). Complémentaire au suivi des fondamentaux, qui cible uniquement les critères multistructurels.',
    'tdb-intervenir':
        'Suivi de l\'apprentissage des fondamentaux (taxonomie SOLO) et répartition par niveaux d\'intervention RàI.',
    'tdb-interventions-rai':
        'Gestion des interventions par niveau RàI : universel, préventif, intensif.',

    // =================================================================
    // T8 — TABLEAU DE BORD — Liste, profil, interventions
    // =================================================================

    // --- Liste des individus ---

    'liste-titre':
        'Liste complète des étudiant·es avec indices A-C-P, patterns et niveaux RàI. Filtrable et triable.',
    'liste-filtres':
        'Filtre par groupe, programme, niveau RàI ou pattern. Le champ de recherche accepte nom, prénom ou DA.',
    'liste-filtre-rai':
        'Filtre par niveau d\'intervention : Tous, Niveau 1 (universel), Niveau 2 (préventif), Niveau 3 (intensif).',
    'liste-filtre-pattern':
        'Filtre par trajectoire détectée : progression stable, défi spécifique, difficulté émergente ou persistante.',
    'liste-recherche':
        'Recherche un·e étudiant·e par nom, prénom ou numéro d\'admission (DA).',
    'liste-col-sa':
        'Services adaptés. Une coche indique que l\'étudiant·e bénéficie d\'un plan de services.',
    'liste-col-interv':
        'Interventions documentées pour cet·te étudiant·e. Clique pour consulter l\'historique.',

    // --- Profil étudiant·e ---

    'profil-selecteur':
        'Choisis un·e étudiant·e. Les boutons Préc./Suiv. parcourent la liste séquentiellement.',
    'profil-nav-observations':
        'Sept vues d\'observation : productions, mobilisation, progression, habiletés, accompagnement, travaux, rapport.',
    'profil-productions':
        'Liste des productions avec description, jeton, note, date et accès direct à l\'évaluation.',
    'profil-col-jeton':
        'Jeton de reprise : permet à l\'étudiant·e de reprendre une production pour démontrer à nouveau sa compétence ou son habileté.',
    'profil-mobilisation':
        'Vue d\'ensemble des composantes A et C : présence en classe et remise des travaux. Indique comment l\'étudiant·e se mobilise dans le cours.',
    'profil-progression':
        'Évolution des indices A-C-P au fil des semaines. Marqueurs : ○ artefact dû, ● jeton appliqué, ▼ intervention RàI. Zones : Incomplet, Développement, Maîtrise, Étendu.',
    'profil-habiletes':
        'Graphique d\'évolution des critères ou habiletés (si évaluations avec détails). Marqueurs : ● jeton, ▼ intervention. Forces et défis par critère.',
    'profil-accompagnement':
        'Analyse RàI, contexte d\'apprentissage, structure SOLO et historique des interventions.',
    'profil-accomp-contexte':
        'Assiduité et complétion de l\'étudiant·e. Interprétation du contexte d\'apprentissage après les premières remises.',
    'profil-accomp-rai':
        'Performance globale et progression par critère. Détermine le niveau d\'intervention suggéré.',
    'profil-accomp-solo':
        'Analyse des réponses selon la taxonomie SOLO (Biggs & Collis). Identifie les forces et les défis structurels.',
    'profil-historique':
        'Interventions RàI documentées pour cet·te étudiant·e. Crée une nouvelle intervention depuis le profil.',
    'profil-travaux':
        'Travaux soumis par l\'étudiant·e. Les fichiers sont importés depuis Travaux > Import.',
    'profil-rapport':
        'Rapport textuel configurable. Coche les sections à inclure et copie dans le presse-papier.',
    'profil-rapport-sections':
        'Coche les sections souhaitées : Identification, Assiduité, Complétion, Performance, Jetons, Date.',

    // --- Données confidentielles ---

    'profil-confidentiel':
        'Données confidentielles stockées localement : parcours, défis, diagnostic, notes.',
    'profil-conf-parcours':
        'ÉPGC (étudiant·e de première génération au cégep) et historique du cours antérieur (ces données sont facultatives).',
    'profil-conf-diagnostic':
        'Services adaptés (d\'après la liste des étudiant·es, Cadre › Trimestre), catégorie et sous-catégorie du diagnostic. Confidentiel.',

    // --- Interventions RàI ---

    'interv-titre':
        'Planification et suivi des interventions RàI de niveaux 2 et 3. Crée, consulte et documente.',
    'interv-btn-planifier':
        'Crée une nouvelle intervention de niveau 2 (préventif) ou 3 (intensif) pour un groupe ou un individu.',
    'interv-carte':
        'Fiche d\'une intervention : statut, niveau, aperçu du sous-groupe (patterns, RàI, notes individuelles).',
    'interv-apercu-sous-groupe':
        'Agrégation des profils du sous-groupe : patterns d\'apprentissage, niveaux RàI et notes individuelles.',
    'interv-criteres-cibles':
        'Critères de la grille de dépistage ciblés par l\'intervention. Précochés selon les défis communs du sous-groupe. Le compteur montre combien d\'étudiant·es sont en défi pour chaque critère.',
    'interv-objectif-vise':
        'Objectif mesurable de l\'intervention. La suggestion est basée sur le critère ciblé le plus faible et le prochain seuil IDME atteignable.',
    'interv-niveaux-rai':
        'Répartition des niveaux RàI (1, 2, 3) dans le sous-groupe ciblé par l\'intervention.',
    'interv-patterns':
        'Répartition des patterns détectés dans le sous-groupe ciblé par l\'intervention.',
    'interv-notes-individuelles':
        'Tes observations pour chaque étudiant·e lors de l\'intervention.',
    'interv-presences-notes':
        'Coche les présent·es et documente tes observations individuelles. Le badge indique le niveau RàI.',
    'interv-gestion-absences':
        'Lie l\'intervention à une séance. Les absences sont motivées automatiquement (congé motivé). Attention, ce peut être différent du système de gestion institutionnel.',
    'interv-bilan':
        'Bilan post-intervention. Comparaison automatique avant/après sur les critères ciblés. L\'«avant» est capturé au premier enregistrement, l\'«après» est calculé en temps réel.',

    // =================================================================
    // T9 — CONCEPTION — Carte d'alignement
    // =================================================================
    // Révisé le 9 août 2026 (#421) contre l'interface réelle de la 1.60.0.
    // Quatre clés RETIRÉES : `planif-alignement` et `planif-sous-nav` (aucune
    // ancre dans le DOM — la sous-nav est servie par `nav-conception-alignement`,
    // T11) ; `planif-barre-outils` et `planif-filtres` (les filtres d'affichage
    // ont été retirés du canevas par #420, et ces deux clés n'étaient plus
    // ancrées nulle part). Le catalogue ne décrit que ce qui existe.

    // --- Vue d'ensemble ---

    'planif-selecteur-cours':
        'Choisis la carte à afficher. Un cours peut en avoir plusieurs ; « Cours rattaché… » dit à quel cours celle-ci appartient.',
    'planif-aide':
        'Ouvre le guide de la carte (9 pages, panneau flottant indépendant).',

    // --- Canevas et outils ---

    'planif-canevas':
        'Espace de travail de la carte. Glisse des nœuds (les éléments de ton cours), crée des liens, organise visuellement ton enseignement.',
    'planif-palette':
        'Glisse un élément vers le canevas pour l\'ajouter à la carte. Glisse un bloc sur la corbeille pour le supprimer. Un bloc posé n\'est pas figé : le menu de son en-tête le change en un autre type de la MÊME famille, sans perdre son titre, sa durée ni ses liens.',
    'planif-boutons-action':
        'Choisis la carte affichée, ouvre le menu Actions (nouvelle carte, cours rattaché, imports, export du plan, décloner la sélection) et annule le dernier geste.',
    'planif-zoom':
        'Niveau de zoom courant. Zoome à la molette ou au pincement ; le menu « Vue » offre « Recentrer la carte » (R) et « Tout voir ».',

    // --- Catégories pédagogiques ---

    'planif-pouvoir-enseigner':
        'Cadre curriculaire : compétence ministérielle et idées maîtresses de ton cours.',
    'planif-quoi-enseigner':
        'Quoi enseigner : types de connaissances (Anderson) — factuelle, conceptuelle, procédurale et métacognitive.',
    'planif-comment-enseigner':
        'Comment enseigner : exposés, activités, soutien et occasions de révision — tout ce qui occupe le temps de classe, le tien comme celui de tes élèves.',
    'planif-enseignement-explicite':
        'Les cinq étapes du modèle : Ouverture, Modélisation, Pratique guidée, Pratique autonome, Clôture. Ce sont des activités à part entière — elles se placent dans une leçon, et rien ne t\'oblige à les utiliser.',
    'planif-structure':
        'Quand enseigner : la séquence regroupe des leçons qui poursuivent les mêmes idées maîtresses ; c\'est la leçon qui porte sa semaine. Ces deux-là n\'ont PAS de menu de type dans leur en-tête : elles ne sont pas interchangeables, une leçon portant une semaine et un rang de séance qu\'une séquence n\'a pas.',
    'planif-design-apprentissages':
        'Vérification : l\'évaluation ferme la boucle – coche dans son Inspecteur les objectifs qu\'elle vérifie, ceux de sa leçon ou d\'une leçon placée avant elle. Le menu de son en-tête choisit sa visée : formative ou certificative. Tant que tu n\'as rien choisi, tes exports écrivent « Évaluation », comme avant.',

    // --- Nœuds ---

    'planif-panneau-proprietes':
        'Inspecteur : ce qui se règle sur le bloc sélectionné — titre, description, et selon son type la semaine, la leçon d\'accueil, les objectifs qu\'il sert, son niveau cognitif ou sa rétroaction. Le TYPE du bloc, lui, se change directement dans son en-tête sur la carte.',
    'planif-titre-noeud':
        'Nom du nœud tel qu\'il apparaît sur la carte.',
    'planif-description-noeud':
        'Notes ou précisions sur cet élément. Champ libre.',
    // ⚠ CETTE INFOBULLE DISAIT L'INVERSE DE CE QUE FAIT LE BOUTON (16 août 2026).
    // Elle affirmait « Crée un clone… les modifications se propagent à toutes
    // les copies » sur un bouton devenu « Copier », qui produit précisément une
    // copie INDÉPENDANTE. Une infobulle fausse est pire qu'une infobulle
    // absente : elle est crue.
    'planif-cloner':
        'Crée une copie INDÉPENDANTE de ce bloc : la modifier ne touchera pas l\'original. Raccourci : ⌥ en glissant le bloc, ou ⌘D.',
    'planif-cloner-lie':
        'Crée un CLONE lié : titre, durée et type se propagent entre toutes ses instances, et un 🧬 apparaît sur chacune. Raccourci : ⇧⌥ en glissant, ou ⇧⌘D. Réservé aux blocs simples — une séquence ou une leçon se copie toujours à l\'indépendant.',
    'planif-detacher-clone':
        'Rend le bloc sélectionné indépendant de son original : il cesse de le suivre, et l\'original cesse de le suivre. Rien n\'est supprimé et son contenu ne change pas — décloner arrête ce qui se propagerait ensuite, sans défaire ce qui s\'est déjà propagé. Sur l\'original, ce sont tous ses clones qui deviennent indépendants.',
    'planif-supprimer-noeud':
        'Supprime ce nœud et ses liens de la carte.',

    // =================================================================
    // T11 — NAVIGATION principale et sous-navigation
    // =================================================================

    // --- Général ---

    'nav-accueil':
        'Retour à la page d\'accueil.',
    'nav-aide':
        'Documentation et ressources d\'aide.',

    // --- Réglages ---

    'nav-calendrier-trimestre':
        'Configuration du trimestre, du cours, de ton profil, du groupe d\'étudiant·es, de l\'horaire et du groupe-cours.',
    'nav-calendrier-vue':
        'Calendrier du trimestre : tableau des mois, jours de cours, congés et reprises.',
    'nav-conception-pratiques':
        'Assemble ta pratique de notation complète (SOM, STD, SPE, DEN) en associant échelle, structure et jetons.',
    'nav-reg-preferences':
        'Personnalise ton interface : outils actifs, ressources affichées, effets visuels et comportement de navigation.',
    'nav-labo-accompagnement':
        'Outils d\'observation des apprentissages (SOLO, actions RLO, ACP) et configuration du dépistage RàI (seuils de détection et d\'interprétation).',
    'nav-reg-donnees':
        'Codex, restauration, captures A-C-P, export anonymisé, réinitialisation et maintenance.',
    'nav-reg-apropos':
        'Informations sur l\'application et sa version.',

    // --- Structure (anciennement Construction de la note) ---

    'nav-construction':
        'Configuration de l\'évaluation : productions, grilles, échelles, cartouches et pratiques de notation.',
    'nav-conception-productions':
        'Définis les productions de tes étudiant·es : portfolios, artefacts et travaux avec pondérations et échéances.',
    'nav-conception-grilles':
        'Crée des grilles réutilisables avec critères nommés, typés et pondérés.',
    'nav-conception-echelles':
        'Configure les échelles de performance : seuils, valeurs ponctuelles, couleurs et aperçu visuel.',
    'nav-conception-cartouches':
        'Crée des matrices de commentaires automatiques (critères × niveaux) pour la rétroaction différenciée.',

    // --- Évaluations et travaux ---

    'nav-evaluations':
        'Évaluation des productions : grilles critériées, niveaux de performance et rétroaction différenciée automatique.',
    'nav-eval-liste':
        'Tableau exhaustif des évaluations : résultats, niveaux de performance, jetons et dossiers PDF.',
    'nav-eval-importer':
        'Importe les travaux de tes étudiant·es (PDF, images) et prépare les fichiers (rotation, assemblage).',
    'nav-eval-annoter':
        'Annote les copies et évalue selon la grille de critères, sur le même document.',
    'nav-eval-exporter':
        'Exporte les PDF annotés aux étudiant·es, archive le trimestre et allège le stockage.',

    // --- Présences ---

    'nav-presences':
        'Suivi de l\'assiduité : statistiques de présence, calendrier des séances et saisie des présences.',
    'nav-suivi-saisie':
        'Saisis les présences et absences pour chaque séance du groupe.',

    // --- Tableau de bord et suivi ---

    'nav-tableau-bord':
        'Vue d\'ensemble du groupe : indices A-C-P, patterns d\'apprentissage, niveaux RàI et profils individuels.',
    'nav-suivi-groupe':
        'Observer les indices A-C-P, les patterns, les niveaux RàI et le développement du groupe via des graphiques.',
    'nav-suivi-liste':
        'Tableau complet des étudiant·es avec indices, patterns et niveaux RàI. Filtrable et triable par colonne.',
    'nav-suivi-profil':
        'Fiche individuelle d\'un·e étudiant·e : productions, mobilisation, progression, habiletés, accompagnement et rapport.',
    'nav-suivi-interventions':
        'Planifie et documente les interventions RàI de niveaux 2 (préventif) et 3 (intensif).',
    'nav-suivi-rencontres':
        'Tiens tes rencontres d’orthopédagogie, individuelles ou en sous-groupe : date, participants, notes par élève, bilan. Un ' + motsNature('service').objetLong + ' se crée ici en trois questions.',
    'nav-labo-etudes':
        'Analyse les résultats de ta démarche pédagogique : graphiques de progression, corrélations et trajectoires.',
    'nav-labo-rythme':
        'Rythme des évaluations : portrait des copies imposées vs restantes par étudiant et par production.',
    'nav-labo-bilan':
        'Composer et exploiter un bilan réflexif de fin de trimestre auprès des étudiants.',

    // --- Planification ---

    // `nav-planification` retiré le 9 août 2026 (#421) : la section
    // « Planification » a disparu à la réorganisation de la navigation du
    // 3 avril 2026 et la clé n'était plus ancrée nulle part.
    'nav-conception-alignement':
        'Carte d\'alignement : visualise les liens objectifs → activités → évaluations, et exporte le plan du cours.',

    // --- Labo ---

    'nav-labo':
        'Utilitaires complémentaires pour l\'enseignement en classe.',
    'nav-labo-modelisation':
        'Démonstrations interactives et modélisations visuelles pour illustrer des concepts en classe.',
    'nav-suivi-animation':
        'Tirage au sort aléatoire et questions flash pour l\'animation en classe.',

    // --- Labo > Études ---

    'labo-correlations-longitudinales':
        'Corrélation de Pearson (r, axe gauche) entre A↔P et C↔P par séance — plus r est élevé, plus l\'indice prédit P. ■ = séance avec dépôt de production, ▼ = intervention de groupe. Les courbes P·[intervention] (axe droit, %) suivent la moyenne P des étudiant·es ciblé·es — compare-les à P contrôle pour estimer l\'effet de l\'intervention.',

    // =================================================================
    // COMPLÉMENT — clés présentes dans index.html, non couvertes par T1-T11
    // =================================================================

    // --- Onglets principaux (navigation) ---

    'nav-conception':
        'L\'onglet «\u00a0Conception\u00a0» regroupe la conception de tes outils d\'évaluation : productions, grilles, échelles, cartouches et pratiques de notation.',
    'nav-calendrier':
        'L\'onglet «\u00a0Cadre\u00a0» regroupe la configuration de ton espace de travail : trimestre, cours, profil, étudiant·es, horaire et assemblage du groupe-cours.',
    'nav-suivi':
        'L\'onglet «\u00a0Suivi\u00a0» regroupe le portrait du groupe : liste des individus, profil étudiant·e, interventions RàI et laboratoire d\'analyse.',

    // --- Thème de l’interface ---

    'pref-theme':
        'Bascule entre le mode clair et le mode sombre selon tes préférences visuelles et l\'environnement d\'utilisation.',

    // =================================================================
    // ARCHIVES — Création et ouverture (modales Réserve)
    // =================================================================

    'reserve-select-trimestre':
        'Trimestre du groupe-cours à archiver.',
    'reserve-select-groupe':
        'Groupe-cours qui sera archivé. Tous les groupes que tu as enseignés peuvent être archivés.',
    'reserve-bouton-verser':
        'Crée une copie du groupe-cours dans tes archives. Geste manuel, ne supprime rien dans ton codex de travail.',
    'reserve-bouton-changer-dossier':
        'Change le dossier d\'archives sélectionné (Chrome et Edge seulement).',
    'reserve-ouvrir-toggle-copie':
        'Active la recopie des items déjà présents dans ta bibliothèque active : ils recevront un nouvel identifiant et le suffixe «\u00a0— copie\u00a0».',
    'reserve-ouvrir-bouton-reimporter':
        'Recopie les items cochés dans tes bibliothèques actives. L’archive d\'origine reste figé.',

    // =================================================================
    // T12 — BOÎTE À OUTILS / ANIMATION (#18)
    // =================================================================

    // --- Cartes d'outils ---

    'outil-questions-flash':
        'Affiche une question au hasard pour relancer la discussion ou vérifier la compréhension en classe. L’engrenage te permet de gérer tes questions et leurs catégories.',
    'outil-tirage':
        'Désigne un·e étudiant·e au hasard pour distribuer la parole équitablement. L’engrenage règle le nombre à tirer, la remise et les exclusions.',

    // --- Paramètres du tirage ---

    'outil-tirage-nombre':
        'Combien d’étudiant·es tirer d’un seul coup (de 1 à 5).',
    'outil-tirage-remise':
        'Avec remise : une même personne peut ressortir à plusieurs tirages. Sans remise : chacun·e n’est tiré·e qu’une fois, jusqu’à ce que le groupe soit épuisé, puis réinitialisé.',
    'outil-tirage-exclusion':
        'Décoche un·e étudiant·e pour l’exclure du tirage (absent·e, déjà passé·e…). Les exclusions sont conservées jusqu’à la réinitialisation.',

    // =================================================================
    // T13 — PRÉSENCES (#18)
    // =================================================================

    'presences-saisie':
        'Marque qui est présent·e à cette séance. Chaque changement s’enregistre tout seul, et les élèves que tu n’as pas marqué·es comptent présent·es. Les présences alimentent le taux d’assiduité de chaque étudiant·e et le suivi du groupe.',
    'presences-date':
        'La séance dont tu saisis les présences. Les flèches « Précédent » / « Suivant » passent d’une séance de cours à l’autre.',
    'presences-tri':
        'Ordonne la liste — par nom, ou par assiduité pour repérer d’un coup d’œil qui s’absente le plus.',
    'presences-presence-col':
        'Marque la présence de chaque étudiant·e à cette séance. « Tous » met tout le groupe présent d’un coup ; tu ajustes ensuite les absences.',
    'presences-total-periodes':
        'Nombre de périodes (ou d’heures) de présence comptées pour l’étudiant·e à cette séance.',
    'presences-assiduite-col':
        'Taux de présence cumulé de l’étudiant·e depuis le début du trimestre.'

};

// Chaque entrée `cle: texte` devient `cle: { hover: texte }` dans
// CATALOGUE_ACCOMPAGNEMENT.
const entrees = {};
for (const cle in TOOLTIPS) {
    if (Object.prototype.hasOwnProperty.call(TOOLTIPS, cle)) {
        entrees[cle] = { hover: TOOLTIPS[cle] };
    }
}
window.accompagnement.ajouterEntrees(entrees);

})();
