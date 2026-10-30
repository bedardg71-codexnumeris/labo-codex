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
        'Remplace les noms réels de tes étudiant·es par « Élève 1 », « Élève 2 »… Utile quand tu présentes ton écran en réunion ou en formation.',
    'entete-signaler-bug':
        'Signale un problème technique OU envoie un commentaire sur l\'application — la fenêtre porte les deux modes. Le rapport, affiché avant l’envoi, porte la version, l’appareil et le navigateur, le nombre d’étudiant·es, de cours et de productions, tes 20 dernières actions et les 20 dernières erreurs. Une action garde le début du texte cliqué : relis le rapport avant de l’envoyer.',

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
        'Affiche le tableau de progression des critères et les graphiques 0-100\u00a0% dans la section «Développement des habiletés» du profil individuel.',
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
        'Active les niveaux d\'intervention RàI et les recommandations personnalisées. Structure le soutien à tes étudiant·es en trois niveaux d\'intensité : universel, préventif, intensif.',
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
        'À partir de ce seuil, le profil écrit « Absences rares » (A) et « Travaux manquants rares » (C). Dans la liste des étudiant·es, un chiffre entre le seuil précédent et celui-ci est jaune.',
    'depist-seuil-bon':
        'À partir de ce seuil, le profil écrit « Aucune absence ou presque » (A) et « Aucun travail manquant ou presque » (C). Dans la liste des étudiant·es, un chiffre à partir de ce seuil est bleu ; entre le seuil précédent et celui-ci, vert.',
    'depist-seuil-defi':
        'Score (%) sous lequel un critère est identifié comme un défi nécessitant attention. Seuil bas = plus exigeant, seuil élevé = moins exigeant. Règle le dépistage seulement.',
    'depist-seuil-direction':
        'Variation minimale de la moyenne d\'un critère, d\'une fenêtre d\'analyse à la précédente (la même, décalée d\'une production), pour afficher une flèche (→ ou ←) après ce critère.',
    'depist-seuil-fragile':
        'À partir de ce seuil, le profil écrit « Quelques absences » (A) et « Quelques travaux manquants » (C) ; sous lui, « Absences très fréquentes » et « Travaux manquants très fréquents ». Dans la liste des étudiant·es, un chiffre sous ce seuil est rouge.',
    'depist-seuil-progression':
        'Différence minimale (%) pour signaler une progression ou une régression entre deux productions. Seuil bas = sensible, seuil élevé = moins sensible.',
    'depist-seuils-interpretation':
        'Seuils de couleur pour les indices A et C, en quatre paliers. P suit les repères de ton échelle. Détermine les alertes du tableau de bord.',
    'depist-seuils-restaurer':
        'Réinitialise les seuils d\'interprétation à leurs valeurs par défaut.',
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
        'Deux fichiers sans données d\'étudiant·es, un .json et un LISEZMOI.txt : tes grilles, échelles, productions et cartouches, et quelques réglages de ta pratique. Pour partager avec des collègues (CC BY-NC-SA).',
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
        'Efface toutes les données et revient à l\'état initial. Un codex à part d’abord, deux confirmations, puis la saisie de « EFFACER ». Irréversible.',
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
        'Poids dans la note finale. L\'ensemble des productions se partage le 100\u00a0%.',
    'cn-prod-echeance':
        'Date limite de remise. Conditionne la génération des snapshots, le calcul de C (complétion) et P (performance), et la gestion des travaux remis ou non remis. Elle peut être posée d\'avance : tant que « Consignes transmises » est décochée, la production reste « à planifier » et rien n\'est dû. Clique sur l\'icône d\'info pour plus de détails.',
    'cn-prod-echeance-mg':
        'Date limite propre à ce groupe-cours. Elle peut être posée d\'avance : décoche la case tant que ce groupe n\'a pas reçu la production (échéance neutralisée). Clique sur l\'icône d\'info pour plus de détails.',

    // --- Grilles de critères ---

    'cn-grille-titre':
        'Grilles réutilisables avec critères pondérés. Chaque grille définit les critères d\'évaluation d\'une production — comme la grille papier que tu utilises déjà pour évaluer.',
    'cn-grille-critere':
        'Critères avec nom, type, pondération et description. La pondération totale doit atteindre 100\u00a0%.',
    // C2, validé G. 20 oct. 2026, 9 h 23 (plans de travail/TEXTES-2026-10-20-bareme.md).
    'cn-grille-type-critere':
        'Méthode d’évaluation du critère : holistique (tu attribues un niveau de l’échelle), analytique (tu attribues des points, que son barème décrit) ou algorithmique (une formule calcule la note à partir de ce que tu comptes).',
    // #1120, lot 2 (20 oct. 2026) : les bulles du barème d'un critère analytique (grilles.js, `trancheBaremeHtml`).
    // E1 à E6, validés G. 20 oct. 9 h 23, tels quels.
    'bareme-tranche-nom':
        'Facultatif : un mot pour reconnaître la tranche, comme « Partiel ».',
    'bareme-tranche-points':
        'Un nombre (3 ou 2,5) ou deux bornes (3 à 4), de 0 à la pondération du critère. Deux tranches ne se chevauchent pas.',
    'bareme-tranche-texte':
        'Ce qu’on attend d’une copie qui obtient ces points.',
    'bareme-ajouter-tranche':
        'Ajoute une tranche au bas du barème. Elle s’enregistre aussitôt et reste « à compléter » jusqu’à ce que tu lui donnes ses points.',
    'bareme-a-completer':
        'Cette tranche n’a pas encore de points : donne-les-lui pour qu’elle compte dans le barème.',
    'bareme-hors-bareme':
        'Ces points dépassent la pondération du critère, qui a baissé depuis : corrige les points de la tranche, ou la pondération.',
    // #1120, lot 3 (27 oct. 2026) : le barème à l'évaluation (evaluation-chargement.js, `_saisiePointsHtml`).
    // H1, H3 et H4, validés G. 27 oct. 10 h 31 (plans de travail/TEXTES-2026-10-27-bareme-evaluation.md), tels quels.
    'bareme-eval':
        'Touche la tranche qui décrit la copie, puis ses points.',
    'bareme-eval-hors-bareme':
        'Aucune tranche ne couvre ces points : l’étudiant·e lira le chiffre seul.',
    'bareme-eval-a-completer':
        'Cette tranche n’a pas encore de points : tu la complètes dans Grilles de critères.',
    'cn-grille-ponderation-totale':
        'Somme des pondérations de tous les critères. Doit atteindre 100\u00a0% pour que la grille soit valide.',

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
        'Ressources limitées que tu accordes à tes étudiant·es : Délai (prolonger l\'échéance) ou Reprise (refaire la production).',
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
        'Résultat calculé en temps réel : le pourcentage pondéré, et son niveau dans l\'échelle de l\'évaluation.',
    'eval-niveau-idme':
        'Niveau calculé automatiquement. Modifie uniquement si nécessaire.',
    'eval-col-niveau':
        'Le niveau de chaque évaluation, dans l\'échelle qu\'elle emploie.',
    'eval-statut-remise':
        'Indique si la production a été remise. Conditionne le calcul de l\'indice de complétion (C).',
    'eval-integrite':
        'Recevable ou non. Une copie non recevable (plagiat, IA non autorisée) compte comme non remise dans la complétion ; dans la note, son sort dépend de ta pratique (Aide › « Travail NON RECEVABLE »).',
    'eval-francais-ecrit':
        'La note de ce critère se calcule par une formule. Le champ de ce que tu comptes se remplit avec les codes que tu poses dans Annoter, ou se tape ; celui de ce à quoi tu le rapportes se tape. Les deux portent les noms que tu as donnés au critère dans la grille. La rétroaction se compose avec les phrases écrites dans la grille.',
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
        'Choisit le format affiché dans la rétroaction : note chiffrée (ex. 78\u00a0%) ou niveau de performance (lettre, ex. M).',

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
        'Télécharge un ZIP regroupant tous les travaux d\'une production. Pratique pour garder une copie d\'une évaluation complète.',
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

    // --- Textes relus par Grégoire (15 oct. 2026) : « Tout importer » (bloc 2) ---
    // ↻ Échelles et productions : « dans ta bibliothèque », texte corrigé par Grégoire le 25 oct. 2026 (leur
    // import écrit dans la bibliothèque, pas dans le trimestre actif ; #1156, consigne du lot 3, § 3.2).
    'import-trimestre-tout-grilles':
        'Copie toutes les grilles de ce trimestre dans ton trimestre actif, avec leurs rétroactions. Les originales restent intactes.',
    'import-trimestre-tout-echelles':
        'Copie toutes les échelles de ce trimestre dans ta bibliothèque. Les originales restent intactes.',
    'import-trimestre-tout-cartouches':
        'Copie toutes les cartouches de ce trimestre dans ton trimestre actif. Les originales restent intactes.',
    'import-trimestre-tout-productions':
        'Copie toutes les productions de ce trimestre dans ta bibliothèque. Les originales restent intactes.',
    'import-trimestre-tout-pratiques':
        'Copie toutes les pratiques de ce trimestre dans ton trimestre actif. Les originales restent intactes. Vérifie ensuite leur échelle et leur grille.',

    // --- Textes relus par Grégoire (15 oct. 2026) : les étapes de l'assistant de pratique (bloc 3, #18) ---
    'wizard-etape-regles-sommative':
        'Les règles s’ajoutent à la moyenne pondérée. Sans règle, chaque évaluation compte selon sa pondération.',
    'wizard-etape-config-sommative-regles':
        'Le verrou plafonne la note finale quand l’évaluation choisie n’atteint pas le seuil, même si la moyenne est plus haute.',
    'wizard-etape-approche-evaluation':
        'En standards, la note se construit sur le portfolio ; à l’étape suivante, tu choisis quels artefacts comptent.',
    'wizard-etape-config-portfolio':
        'Ici, tu dis quels artefacts comptent : les N meilleurs, tous, les N derniers, ou les N meilleurs plus les obligatoires. Les autres restent visibles, mais n’entrent pas dans la note.',
    'wizard-etape-config-specifications':
        'Un travail est « acceptable » quand son résultat atteint ce seuil. À 100\u00a0%, toutes ses spécifications doivent être respectées.',
    'wizard-etape-config-jetons':
        'Un jeton de délai donne quelques jours de plus pour remettre un travail ; un jeton de reprise permet de refaire un travail déjà évalué. Tu fixes combien chaque étudiant·e en reçoit.',
    'wizard-etape-choix-modele-bundles':
        'Un forfait dit ce qu’il faut réussir pour obtenir une note. La note finale est celle du plus haut forfait atteint.',
    'wizard-etape-config-denotation':
        'La note finale est celle que tu poses. Les cibles cochées la justifient ; la suggestion calculée n’est qu’un repère.',
    'wizard-etape-echelle-performance':
        'L’échelle traduit chaque niveau (par exemple I, D, M, E) en pourcentage. C’est elle qui transforme un niveau en points.',
    'wizard-etape-grille-criteres':
        'La grille donne les critères avec lesquels tu évalues chaque copie. Tu peux la choisir plus tard, dans Conception › Grilles de critères.',
    'wizard-etape-recapitulatif':
        'Rien n’est créé avant que tu confirmes. Tu pourras tout modifier ensuite.',

    // --- Observer (indices A-C-P) ---

    'tdb-observer':
        'Indices A-C-P du groupe. Chaque barre place les étudiant·es selon un indice : plus un point est à droite, plus l\'indice est haut. Pour A, la droite veut dire « Aucune absence ou presque », la gauche « Absences très fréquentes » ; pour C, « Aucun travail manquant ou presque » et « Travaux manquants très fréquents ».',
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
        'Progression sur les critères multistructurels (fondations SOLO) identifiés dans ta grille. Complémentaire au niveau RàI, qui situe la note du cours à ce jour devant le seuil minimal de réussite.',
    'tdb-rai':
        'Niveau d\'intervention d’après la note du cours à ce jour, devant le seuil minimal de réussite de ton échelle (la note de passage, sans ce repère). Sous ce seuil, niveau 2 ; niveau 3 avec une difficulté sur un critère de fondation. « Difficulté persistante » donne au moins le niveau 2, même avant la note. Le pattern des derniers artefacts (3 par défaut), qui lit tous les critères de ta grille de référence sauf ceux marqués « Aucun », nomme le besoin. Complémentaire au suivi des fondamentaux, qui cible uniquement les critères multistructurels.',
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
        'Filtre par trajectoire détectée : progression stable, défi spécifique, difficulté émergente, difficulté persistante, non-participation (présent·e, rien de remis), ou données insuffisantes (rien encore de jugeable).',
    'liste-recherche':
        'Recherche un·e étudiant·e par nom, prénom ou numéro d\'admission (DA).',
    'liste-col-sa':
        'Services adaptés. Une coche indique que l\'étudiant·e bénéficie d\'un plan de services.',
    'liste-col-interv':
        'Interventions documentées pour cet·te étudiant·e. Clique pour consulter l\'historique.',

    // --- Profil étudiant·e ---

    'profil-selecteur':
        'Choisis un·e étudiant·e. Les flèches ‹ et › parcourent la liste dans l\'ordre alphabétique.',
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
        'Consulte la bibliothèque pour importer, exporter, dupliquer ou supprimer une carte ; choisis la carte affichée, ouvre le menu Actions (nouvelle carte, cours rattaché, export du plan, décloner la sélection), puis annule ou rétablis le dernier geste.',

    // --- Catégories pédagogiques ---

    'planif-pouvoir-enseigner':
        'Cadre curriculaire : compétence ministérielle et idées maîtresses de ton cours.',
    'planif-quoi-enseigner':
        'Quoi enseigner : types de connaissances (Anderson) — factuelle, conceptuelle, procédurale et métacognitive.',
    'planif-comment-enseigner':
        'Comment enseigner : exposés, activités, soutien et occasions de révision — tout ce qui occupe le temps de classe, le tien comme celui de tes étudiant·es.',
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
    // « Apporter mon matériel » — réécrite après le retrait de l'assistant (A1, validé par Grégoire le 19 oct. 2026, 19 h 01).
    'nav-conception-materiel':
        'Apporte une grille que tu as déjà, copiée depuis Word, Pages ou un autre traitement de texte : tu montres à l’application ce que veut dire chaque morceau, puis elle la range dans tes grilles de critères.',
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
        'Exporte les PDF annotés aux étudiant·es et allège le stockage.',

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
        'Deux études de ton groupe, « Dynamique des corrélations » et « Impact des jetons sur la performance » : des pistes de réflexion, pas des preuves.',
    'nav-labo-rythme':
        'Tes durées d\'évaluation par activité, l\'estimation de ta charge et sa planification.',
    'nav-labo-bilan':
        'Composer et exploiter un bilan réflexif de fin de trimestre auprès des étudiant·es.',

    // --- Planification ---

    // `nav-planification` retiré le 9 août 2026 (#421) : la section
    // « Planification » a disparu à la réorganisation de la navigation du
    // 3 avril 2026 et la clé n'était plus ancrée nulle part.
    'nav-conception-alignement':
        'Carte d\'alignement : visualise les liens objectifs → activités → évaluations, et exporte le plan du cours.',

    // --- Labo ---

    'nav-labo':
        'Analyser ta démarche : observation, modélisation, exploration des pratiques, rythme de travail, études, bilan réflexif et suivi longitudinal.',
    'nav-labo-modelisation':
        'Ouvre un document (PDF, JPG, PNG ; HEIC selon le navigateur) pour le projeter et l\'annoter devant le groupe.',
    // #1152, lot 5 (texte n° 9, validé par Grégoire le 28 oct. 2026, 14 h 36) : les deux sous-onglets sans bulle.
    'nav-labo-comparateur':
        'Ce que deux ou trois pratiques de notation feraient des mêmes parcours, sur des profils fictifs ou sur ton groupe.',
    'nav-labo-longitudinal':
        'Inscris le dossier d\'un·e étudiant·e au registre, et retrouve ses résultats dans les cours suivants.',
    'nav-suivi-animation':
        'Questions flash, tirage au sort et formation d\'équipes pour l\'animation en classe.',

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
        'Marque qui est présent·e à cette séance. Chaque changement s’enregistre tout seul, et les étudiant·es que tu n’as pas marqué·es comptent présent·es. Les présences alimentent le taux d’assiduité de chaque étudiant·e et le suivi du groupe.',
    'presences-date':
        'La séance dont tu saisis les présences. Les flèches « Précédent » / « Suivant » passent d’une séance de cours à l’autre.',
    'presences-tri':
        'Ordonne la liste — par nom, ou par assiduité pour repérer d’un coup d’œil qui s’absente le plus.',
    'presences-presence-col':
        'Marque la présence de chaque étudiant·e à cette séance. « Tous » met tout le groupe présent d’un coup ; tu ajustes ensuite les absences.',
    'presences-total-periodes':
        'Nombre de périodes (ou d’heures) de présence comptées pour l’étudiant·e à cette séance.',
    'presences-assiduite-col':
        'Taux de présence de l’étudiant·e sur les seules séances saisies. Une séance « non saisie » n’y entre pas ; tant qu’aucune séance ne compte, l’assiduité est inconnue.',

    // =================================================================
    // CONCEPTION › APPORTER MON MATÉRIEL (C1 à C11, validés par Grégoire le 19 oct. 2026, 19 h 01)
    // Les six dernières clés sont posées en JavaScript par js/materiel-dissection.js.
    // =================================================================

    'materiel-essayer-exemple':
        'Ouvre une grille fictive, pour essayer l’étiquetage sans ton propre document.',
    'materiel-taper-main':
        'Mène à Grilles de critères, pour composer une grille directement dans l’application.',
    'materiel-coller-autre':
        'Retire cette grille et ses étiquettes de l’écran, pour en coller une autre. Les grilles que tu as déjà créées ne changent pas.',
    'materiel-retirer-etiquettes':
        'Enlève toutes les étiquettes posées sur cette grille, pour recommencer l’étiquetage. Le texte collé reste.',
    'materiel-annuler-coupe':
        'Recolle le dernier morceau que tu as coupé.',
    'materiel-terminer':
        'Repose ce que tu as en main : une étiquette, « Couper » ou « Rattacher ». La touche Échap fait la même chose.',
    'materiel-outil-couper':
        'Quand une case porte deux choses sur une même ligne (un critère et ses points, par exemple), touche l’endroit entre les deux : le morceau devient deux, que tu étiquettes chacun.',
    'materiel-outil-rattacher':
        'Quand un nom s’étend sur plusieurs lignes, touche ses morceaux : l’application les lit comme un seul texte, dans l’ordre de ta grille.',
    'materiel-nom-grille':
        'Ce nom s’imprime sur le PDF que tes étudiant·es reçoivent après l’évaluation.',
    'materiel-compte':
        'Ta grille porte des points et des niveaux : choisis lequel donne le résultat d’une copie. Avec les niveaux, tu diras ensuite la note que vaut chacun.',
    'materiel-creer':
        'Range ta grille dans Grilles de critères, et ses niveaux dans Échelles de performance s’il y en a. Tu pourras ensuite la modifier là, comme toute autre grille.'

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
