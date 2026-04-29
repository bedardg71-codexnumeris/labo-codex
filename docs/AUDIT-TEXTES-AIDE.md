# Audit exhaustif des textes d'aide — Labo Codex

**Date** : 18 avril 2026  
**Application** : Système de suivi des apprentissages (Labo Codex v99.19)  
**Périmètre** : Textes d'aide côté utilisateur (enseignants)  

## Table des matières

1. [Info-bulles (data-tooltip)](#partie-a--info-bulles-data-tooltip)
2. [Popups (aide contextuelle)](#partie-b--popups-aide-contextuelle)
3. [Tour guidé](#partie-c--tour-guidé)

---

## Partie A — Info-bulles (data-tooltip)

**Total** : 279 entrées  
**Format** : Affichées au survol des éléments avec `data-tooltip="clé"`  
**Source** : `js/tooltips-contenu.js`

### EN-TÊTE — Bandeau d'identification

| Clé | Texte |
|-----|-------|
| `entete-logo` | codexnumeris.org — Blog dans lequel est décrite l'exploration du Système de suivi des apprentissages. « Réfléchir, expérimenter, partager. » |
| `entete-version` | Version actuelle du système. Le numéro de build permet d'identifier précisément la version lors d'un signalement de bogue. |
| `entete-mode-affichage` | Bascule entre l'affichage des noms réels (Normal) et des noms fictifs ou numéros (Anonymisation) pour protéger l'identité des étudiants lors de présentations publiques. |
| `entete-signaler-bug` | Signaler un problème technique. Pense à noter le numéro de build affiché dans le bandeau pour faciliter le diagnostic. |

### EN-TÊTE — Contexte de travail

| Clé | Texte |
|-----|-------|
| `entete-pratique` | Pratique de notation active pour ce cours et cette session. Le code identifie le modèle d'évaluation (ex, : PAN-SDT), le cours (ex. : Litt) et la session (ex. : H26). |
| `entete-semaine` | Semaine courante du trimestre et date du jour. Situe l'enseignant dans la progression de la session. |

### EN-TÊTE — Groupe-cours

| Clé | Texte |
|-----|-------|
| `entete-groupe-cours` | Sélectionner le groupe-cours sur lequel travailler. Toutes les données affichées (présences, évaluations, tableau de bord) s'ajustent au groupe choisi. |

### EN-TÊTE — Codex

| Clé | Texte |
|-----|-------|
| `entete-codex` | Le codex est ton « cloud personnel » sur clé USB. Il regroupe toutes tes données dans un seul fichier portable que tu peux transporter entre tes appareils (ordinateur → USB → tablette → USB → ordinateur). La pastille verte indique que tout est enregistré ; la pastille orange signale des modifications non sauvegardées. Le codex doit être manuellement exporté sur la clé USB. |

### EN-TÊTE — Réglages

| Clé | Texte |
|-----|-------|
| `entete-reglages` | Réglages de base : configuration du trimestre actif, du cours, du groupe-cours, de l'horaire et des préférences. |

### RÉGLAGES — Panneaux

| Clé | Texte |
|-----|-------|
| `reglages-gestion-trimestres` | Configurer le trimestre actif : dates, bornes, semaines spéciales, congés et événements imprévus. Ces informations définissent le calendrier de tout le système. |
| `reglages-cours` | Définir le cours enseigné : code, compétence ministérielle et éléments de compétence. Ces informations sont le point d'ancrage de l'alignement pédagogique. |
| `reglages-enseignant` | Profil de l'enseignant. Ces informations servent de métadonnées pour les ressources partagées et s'affichent dans le sélecteur de groupe-cours. |
| `reglages-groupe-etudiants` | Gérer la liste des étudiants : ajout manuel, import en lot (CSV/Excel/Omnivox). Le marqueur SA identifie les étudiants inscrits aux Services adaptés. |
| `reglages-horaire` | Configurer l'horaire d'un groupe : jours, heures, locaux, nombre de périodes. L'horaire et le calendrier du trimestre génèrent automatiquement la grille des séances. |
| `reglages-groupe-cours` | Assembler un groupe-cours en réunissant trimestre, cours, groupe, horaire, enseignant et pratique de notation. Le groupe-cours actif détermine les données affichées dans toute l'application. |

### RÉGLAGES — Champs Trimestre

| Clé | Texte |
|-----|-------|
| `reglages-trim-identification` | Ces informations identifient le trimestre et préfixent les données stockées. |
| `reglages-trim-bornes` | Les dates de début, de fin, de fin des cours réguliers et de remise des notes définissent le calendrier sur lequel s'appuient les semaines et les séances. |
| `reglages-trim-semaines-speciales` | Semaine de planification et semaine d'examens. Ces semaines sont traitées différemment dans le calcul des séances et la planification. |
| `reglages-trim-conges` | Congés fériés avec dates et reprises associées. Ajuste automatiquement le calendrier des séances. |
| `reglages-trim-imprevus` | Événements non planifiés (annulations, fermetures, maladie, météo) qui ajustent le calendrier des séances. |

### RÉGLAGES — Champs Cours

| Clé | Texte |
|-----|-------|
| `reglages-cours-competence` | Code et énoncé de la compétence ministérielle visée par le cours. Point d'ancrage de l'alignement pédagogique. |
| `reglages-cours-elements` | Sous de la compétences à développer durant le cours. Servent de référence pour la planification et les évaluations. |

### RÉGLAGES — Champs Groupe

| Clé | Texte |
|-----|-------|
| `reglages-etudiants-sa` | Services adaptés — Marqueur pour les étudiants inscrits présentant un diagnostic posé par un·e profesionnel·le. |
| `reglages-etudiants-import` | Importer des étudiants en lot : coller depuis un tableur/système de gestion institutionnel ou charger un fichier CSV/TSV. Format : DA, Groupe, Nom, Prénom, Programme, (vide), SA. |

### RÉGLAGES — Champs Horaire

| Clé | Texte |
|-----|-------|
| `reglages-horaire-periodes` | Le nombre de séances × périodes par séance détermine le volume hebdomadaire. La durée d'une période s'applique à tous les horaires. |

### RÉGLAGES — Champs Groupe-cours

| Clé | Texte |
|-----|-------|
| `reglages-gc-nom-genere` | Nom généré automatiquement à partir des 5 éléments assemblés. C'est ce nom qui apparaît dans le sélecteur de groupe-cours en en-tête. |
| `reglages-gc-pratique` | Pratique de notation associée à ce groupe-cours. Détermine les règles de construction de la note (ex. : sommative traditionnelle ou PAN basée sur des standards). |

### RÉGLAGES — Bibliothèque

| Clé | Texte |
|-----|-------|
| `reglages-bibliotheque` | Bibliothèque d'entités réutilisables. Sélectionne une entité existante ou crées-en une nouvelle. Permet de réutiliser des configurations d'un trimestre à l'autre. |

### RÉGLAGES — Préférences

| Clé | Texte |
|-----|-------|
| `pref-actions-rlo` | Active l'observation des gestes cognitifs Repérage, Liaison et Ouverture via des tampons posés sur les productions. Alimente le profil RLO agrégé par évaluation et l'export de recherche anonymisé. |
| `pref-affichage-assiduite` | Choisir comment afficher les totaux de présence et d'assiduité (ex. : en périodes). |
| `pref-affichage-comparatif` | Mode expérimental. Affiche les deux pratiques de notation (Sommative et PAN) côte à côte dans les aperçus et le profil individuel. |
| `pref-affichage-developpement` | Tableau de progression des critères et graphiques Chart.js 0-100 %. Affiché dans la section « Développement des habiletés » du profil individuel. |
| `pref-affichage-graphiques` | Graphiques Chart.js de progression dans le temps. Affichés dans la section « Progression temporelle ACP » du profil individuel. |
| `pref-affichage-solo` | Affiche une carte avec les descriptions détaillées basées sur la taxonomie SOLO. Utile pour interpréter le niveau cognitif des apprentissages. |
| `pref-navigation` | Court-circuiter la page d'accueil pour ouvrir directement sur le tableau de bord au démarrage. |
| `pref-outils` | Outils qui s'activent pendant l'évaluation d'une production. |
| `pref-outils-acp` | Indices de l'historique Assiduité, Complétion et Performance. Affichés dans la section « Engagement ACP » du profil individuel. |
| `pref-outils-rai` | Niveaux d'intervention et recommandations personnalisées. Structure le soutien aux étudiants en trois niveaux d'intensité (universel, ciblé, intensif). |
| `pref-tooltips` | Affiche des descriptions contextuelles au survol des éléments de l'interface. Désactiver si tu maîtrises déjà l'application. |
| `pref-visuel` | Effets visuels de l'interface. L'animation des points du tableau de bord peut être désactivée pour réduire les distractions. |

### RÉGLAGES — Dépistage

| Clé | Texte |
|-----|-------|
| `depist-decoupler-pr` | Séparer le calcul de la note (P, selon la pratique) du calcul de risque (R, basé sur les N dernières productions). Recommandé avec « N meilleurs ». |
| `depist-fenetre` | Nombre de dernières productions analysées pour détecter les tendances. Valeur basse = détection précoce. Valeur élevée = détection plus fiable mais tardive. |
| `depist-grille` | Grille utilisée pour identifier les forces et défis. Doit être la même pour tous les production du trimestre. |
| `depist-restaurer` | Réinitialiser tous les seuils de détection à leurs valeurs par défaut. |
| `depist-seuil-acceptable` | Indice sous lequel la situation est en zone de vigilance (jaune). À surveiller. |
| `depist-seuil-bon` | Indice au-dessus duquel la situation est satisfaisante (vert). |
| `depist-seuil-defi` | Score (%) sous lequel un critère est identifié comme un défi nécessitant attention. Bas = plus exigeant, élevé = moins exigeant. |
| `depist-seuil-direction` | Variation minimale (%) pour afficher une tendance du risque. Contrôle la sensibilité de l'indicateur directionnel. |
| `depist-seuil-fragile` | Indice sous lequel la situation est considérée préoccupante (rouge). Nécessite une intervention. |
| `depist-seuil-progression` | Différence minimale (%) pour signaler une progression ou régression entre deux artefacts. Bas = sensible, élevé = moins sensible. |
| `depist-seuils-interpretation` | Seuils de couleur pour les indices A-C-P. Fragile (rouge), Acceptable (jaune), Bon (vert). Détermine les alertes du tableau de bord. |
| `depist-seuils-restaurer` | Réinitialiser les seuils d'interprétation à leurs valeurs par défaut (65/70/75%). |
| `depist-seuils-visuels` | Lignes pointillées et étiquettes de zones (Insuffisant / Développement / Maîtrise / Étendu) sur les graphiques Chart.js de la section « Progression temporelle ACP » du profil individuel. |

### RÉGLAGES — Données

| Clé | Texte |
|-----|-------|
| `donnees-capturer` | Capture manuelle immédiate de l'état actuel des indices. |
| `donnees-captures` | Snapshots de suivi longitudinal et export anonymisé pour la recherche en éducation. |
| `donnees-export-complet` | Toutes les données : cours, étudiants, présences, évaluations. Pour restaurer sur cet appareil ou un autre. |
| `donnees-export-config` | Uniquement les outils (grilles, échelles, productions, cartouches). Pour partager avec des collègues (CC BY-NC-SA). |
| `donnees-export-recherche` | Export anonymisé des indices A-C-P et statistiques agrégées pour la recherche. Aucune donnée nominative incluse. |
| `donnees-gestion-ressources` | Auditer et nettoyer les ressources pédagogiques accumulées. Sélectionner un type pour afficher la liste. |
| `donnees-import` | Charger une sauvegarde personnelle ou la configuration d'un collègue. Le type sera détecté automatiquement. |
| `donnees-info-techniques` | Stockage local (IndexedDB + localStorage), JSON lisible, aucune donnée envoyée sur internet. |
| `donnees-maintenance` | Outils techniques : réinitialisation, informations de stockage et gestion avancée des ressources. |
| `donnees-reconstruire` | Recalcule l'historique des captures depuis le début. Utile après un changement de paramètres. |
| `donnees-reinitialiser` | Efface toutes les données et revient à l'état initial. Triple confirmation + mot de passe requis. Irréversible. |
| `donnees-sauvegarde` | Exporter tes données (sauvegarde complète ou configuration pédagogique seule) ou importer un fichier existant. |
| `donnees-snapshots` | Enregistre l'état des indices A-C-P à des moments clés pour le suivi longitudinal. |
| `donnees-supprimer-captures` | Efface toutes les captures enregistrées. Action irréversible. |

### PLANIFICATION — Alignement

| Clé | Texte |
|-----|-------|
| `planif-aide` | Ouvrir le guide de la carte mentale (7 pages, panneau flottant indépendant). |
| `planif-alignement` | Carte mentale interactive pour construire visuellement l'alignement pédagogique du cours. |
| `planif-barre-outils` | Contrôles de zoom, filtres d'affichage et options de vue du canevas. |
| `planif-boutons-action` | Ajouter, supprimer, couper, copier et coller des nœuds sur le canevas. |
| `planif-canevas` | Espace de travail de la carte mentale. Glisser des éléments, créer des liens, organiser visuellement le cours. |
| `planif-cloner` | Créer un clone de ce nœud. Les modifications se propagent à toutes les copies. |
| `planif-comment-enseigner` | Dispositifs d'enseignement : activités, soutien et révision. |
| `planif-description-noeud` | Notes ou précisions sur cet élément. Champ libre. |
| `planif-design-apprentissages` | Évaluations et productions : lier les objectifs aux moyens d'évaluation. |
| `planif-filtres` | Filtrer l'affichage des nœuds et des liens sur le canevas. |
| `planif-palette` | Glisser un élément vers le canevas pour l'ajouter à la carte mentale. |
| `planif-panneau-proprietes` | Propriétés du nœud sélectionné : titre, description, clonage et suppression. |
| `planif-pouvoir-enseigner` | Cadre curriculaire : compétence ministérielle et idées maîtresses du cours. |
| `planif-quoi-enseigner` | Types de connaissances (Anderson) : factuelle, conceptuelle, procédurale et métacognitive. |
| `planif-selecteur-cours` | Choisir le cours à planifier. Chaque cours a sa propre carte d'alignement. |
| `planif-sous-nav` | Deux vues complémentaires : la carte mentale d'alignement et l'organisateur du cours. |
| `planif-structure` | Organisation temporelle : séquences (semaines) et leçons (séances). |
| `planif-supprimer-noeud` | Supprimer ce nœud et ses liens de la carte. |
| `planif-titre-noeud` | Nom de l'élément pédagogique tel qu'il apparaît sur la carte. |
| `planif-zoom` | Ajuster le niveau de zoom du canevas. |

### PLANIFICATION — Organisateur

| Clé | Texte |
|-----|-------|
| `orga-alerte-alignement` | Incohérence d'alignement détectée : une évaluation ou un objectif n'est pas encore relié à une production. |
| `orga-coeur-lecon` | Activités pédagogiques de la leçon. Associer des productions pour compléter l'alignement. |
| `orga-connaissances-prealables` | Savoirs préalables à vérifier ou revoir avant d'aborder cette leçon. |
| `orga-enseignement-explicite` | Structure en 5 phases : ouverture, modelage, pratique guidée, pratique autonome, objectivation. |
| `orga-entete-lecon` | Groupes-cours auxquels cette leçon s'applique, avec leurs plages horaires. |
| `orga-item-a-revoir` | Élément préalable à revoir en début de séance avant de poursuivre. |
| `orga-lien-pedagogique` | Connexion vers un autre élément de la carte mentale (compétence, prérequis, stratégie, etc.). |
| `orga-objectif` | Ce que l'élève sera capable de faire au terme de la leçon. |
| `orga-productions` | Productions et travaux évaluatifs liés aux activités de cette leçon. |
| `orga-selecteur-lecon` | Sélectionner une leçon pour afficher son plan détaillé. |
| `orga-selecteur-production` | Associer une production (travail évaluatif) à cette activité. |
| `orga-selecteur-sequence` | Filtrer par séquence pour restreindre la vue calendrier. |
| `orga-sous-nav` | Vue textuelle et structurée des données de la carte mentale. Sélectionner une séquence et une leçon pour afficher son plan. |
| `orga-vue-calendrier` | Vue hiérarchique textuelle des séquences, séances et activités avec leurs liens pédagogiques. |

### TABLEAU DE BORD — Aperçu

| Clé | Texte |
|-----|-------|
| `tdb-apercu` | Portrait complet du groupe-cours : indices d'apprentissage, patterns, interventions et graphiques de développement. |
| `tdb-assiduite` | Taux de présence aux séances. Chaque point = un étudiant. |
| `tdb-completion` | Taux de remise des travaux. La corrélation C×P indique le lien entre remise et résultats. |
| `tdb-dev-groupe` | Évolution d'un indice dans le temps pour tout le groupe. Chaque ligne = un étudiant. |
| `tdb-dev-individuel` | Résultats par production. Chaque point = un étudiant sur une activité. Les trajectoires isolées méritent attention. |
| `tdb-graphique-groupe` | Graphique longitudinal du groupe. Cliquer sur une courbe pour la verrouiller. |
| `tdb-graphique-individuel` | Résultats par activité d'apprentissage. Les zones denses révèlent les tendances du groupe. |
| `tdb-impact-jetons` | Compare la trajectoire P des étudiants ayant utilisé un jeton de reprise à ceux n'en ayant pas utilisé. ■ = séance avec jeton, □ = sans. |
| `tdb-intervenir` | Suivi de l'apprentissage des fondamentaux (SOLO) et répartition par niveaux d'intervention RàI. |
| `tdb-interventions-rai` | Gestion des interventions par niveau RàI : universel, préventif, intensif. |
| `tdb-liste-individus` | Vue détaillée de chaque étudiant avec ses indices individuels. |
| `tdb-observer` | Indices A-C-P du groupe. Chaque barre positionne les étudiants dans un contexte allant de Fragile à Très favorable. |
| `tdb-patterns` | Progression sur les critères multistructurels (fondations SOLO) identifiés dans ta grille. Complémentaire au modèle RàI qui regarde la performance globale. |
| `tdb-performance` | Résultats aux évaluations par niveaux : Insuffisant ou incomplet, en Développement, Maîtrisé, Étendu. |
| `tdb-profil` | Fiche individuelle d'un étudiant : trajectoire, indices et historique. |
| `tdb-rai` | Niveau d'intervention selon la performance globale (indice P, tous critères). Complémentaire au suivi des fondamentaux qui cible les critères multistructurels. |
| `tdb-selecteur-eleve-groupe` | Isoler la trajectoire d'un étudiant spécifique sur le graphique du groupe. |
| `tdb-selecteur-eleve-indiv` | Isoler la trajectoire d'un étudiant spécifique sur le graphique des productions. |
| `tdb-selecteur-eleve-jetons` | Afficher la courbe P individuelle d'un étudiant ayant utilisé un jeton de reprise. |
| `tdb-selecteur-indice` | Choisir l'indice à visualiser : Assiduité, Complétion ou Performance. |
| `tdb-sous-nav` | Quatre vues : aperçu du groupe, liste des individus, profil étudiant et interventions RàI. |
| `tdb-zones-couleur` | Fragile (0-64%), Modéré (65-74%), Favorable (75-85%), Très favorable (≥85%). Seuils configurables dans Réglages. |

### TABLEAU DE BORD — Liste des individus

| Clé | Texte |
|-----|-------|
| `liste-titre` | Liste complète des étudiants avec indices A-C-P, patterns et niveaux RàI. Filtrable et triable. |
| `liste-filtres` | Filtrer par groupe, programme, niveau RàI ou pattern. Le champ recherche accepte nom, prénom ou DA. |
| `liste-filtre-rai` | Filtrer par niveau d'intervention : Tous, Niveau 1 (universel), Niveau 2 (préventif), Niveau 3 (intensif). |
| `liste-filtre-pattern` | Filtrer par trajectoire détectée : progression stable, défi spécifique, difficulté émergente ou persistante. |
| `liste-recherche` | Rechercher un étudiant par nom, prénom ou numéro d'admission (DA). |
| `liste-col-sa` | Services adaptés. Une coche indique que l'étudiant bénéficie d'un plan de services. |
| `liste-col-interv` | Interventions documentées pour cet étudiant. Cliquer pour consulter l'historique. |

### TABLEAU DE BORD — Profil étudiant

| Clé | Texte |
|-----|-------|
| `profil-accomp-contexte` | Assiduité et complétion de l'étudiant. Interprétation du contexte après les premières remises. |
| `profil-accomp-rai` | Performance globale et progression par critère. Détermine le niveau d'intervention suggéré. |
| `profil-accomp-solo` | Analyse des réponses selon la taxonomie SOLO (Biggs & Collis). Identifie forces et défis structurels. |
| `profil-accompagnement` | Analyse RàI, contexte d'apprentissage, structure SOLO et historique des interventions. |
| `profil-col-jeton` | Jeton de reprise : permet à l'étudiant de reprendre une production pour améliorer son résultat. |
| `profil-conf-diagnostic` | Services adaptés, catégorie et sous-catégorie du diagnostic. Confidentiel. |
| `profil-conf-lecteur` | Évaluation des compétences de lecture : structure, rigueur, plausibilité, nuance, français. |
| `profil-conf-parcours` | ÉPGC (Étudiant·e de première génération au cégep) et historique du cours antérieur. |
| `profil-confidentiel` | Données confidentielles stockées localement : parcours, défis, portrait spécifique, diagnostic, notes. |
| `profil-habiletes` | Graphique d'évolution des critères (si évaluations avec détails). Marqueurs : ● jeton, ▼ intervention. Forces/défis par critère. |
| `profil-historique` | Interventions RàI documentées pour cet étudiant. Créer une nouvelle intervention depuis le profil. |
| `profil-mobilisation` | Vue d'ensemble des composantes A et C : présence en classe et remise des travaux. Indique comment l'élève se mobilise dans le cours. |
| `profil-nav-observations` | Sept vues d'observation : productions, mobilisation, progression, habiletés, accompagnement, travaux, rapport. |
| `profil-productions` | Liste des productions avec description, jeton, note, date et accès direct à l'évaluation. |
| `profil-progression` | Évolution des indices A-C-P au fil des semaines. Marqueurs : ○ artefact dû, ● jeton appliqué, ▼ intervention RàI. Zones : Incomplet, en Développement, Maîtrisé, Étendu. |
| `profil-rapport` | Rapport textuel configurable. Cocher les sections à inclure et copier dans le presse-papier. |
| `profil-rapport-sections` | Cocher les sections souhaitées : Identification, Assiduité, Complétion, Performance, Jetons, Date. |
| `profil-selecteur` | Choisir un étudiant. Les boutons Préc./Suiv. parcourent la liste séquentiellement. |
| `profil-travaux` | Travaux soumis par l'étudiant. Les fichiers sont importés depuis Travaux > Import. |

### TABLEAU DE BORD — Interventions RàI

| Clé | Texte |
|-----|-------|
| `interv-apercu-sous-groupe` | Agrégation des profils du sous-groupe : patterns d'apprentissage, niveaux RàI et notes individuelles. |
| `interv-bilan` | Bilan post-intervention. Comparaison automatique avant/après sur les critères ciblés. L'« avant » est capturé au moment de la première sauvegarde, l'« après » est calculé en temps réel. |
| `interv-btn-planifier` | Créer une nouvelle intervention de niveau 2 (préventif) ou 3 (intensif) pour un groupe ou un individu. |
| `interv-carte` | Fiche d'une intervention : statut, niveau, aperçu du sous-groupe (patterns, RàI, notes individuelles). |
| `interv-criteres-cibles` | Critères de la grille de dépistage ciblés par l'intervention. Pré-cochés selon les défis communs du sous-groupe. Le compteur montre combien d'étudiants sont en défi pour chaque critère. |
| `interv-gestion-absences` | Lier l'intervention à une séance. Les non-participants sont marqués absents motivés (congé). |
| `interv-niveaux-rai` | Répartition des niveaux RàI (1, 2, 3) dans le sous-groupe ciblé par l'intervention. |
| `interv-notes-individuelles` | Observations de l'enseignant pour chaque étudiant lors de l'intervention. |
| `interv-objectif-vise` | Objectif mesurable de l'intervention. La suggestion est basée sur le critère ciblé le plus faible et le prochain seuil IDME atteignable. |
| `interv-patterns` | Répartition des patterns détectés dans le sous-groupe ciblé par l'intervention. |
| `interv-presences-notes` | Cocher les présents et documenter les observations individuelles. Le badge indique le niveau RàI. |
| `interv-titre` | Planification et suivi des interventions RàI de niveaux 2 et 3. Créer, consulter et documenter. |

### ÉVALUATIONS

| Clé | Texte |
|-----|-------|
| `eval-apercu` | Statistiques synthétiques : taux de complétion moyen, productions réalisées et productions configurées. |
| `eval-btn-reinitialiser` | Efface le formulaire d'évaluation en cours et restaure les valeurs par défaut. Les sélections de grille et d'échelle sont conservées. |
| `eval-btn-supprimer` | Supprime définitivement cette évaluation. La production reviendra au statut précédent. Action irréversible. |
| `eval-cartouche` | Modèle de rétroaction générale automatique adapté au type de production. Détermine le vocabulaire et le ton des commentaires. |
| `eval-codes-erreurs` | Codes numériques des erreurs séparés par points-virgules. Voir la grille pour la correspondance codes → catégories. |
| `eval-col-jeton` | Type de jeton : D = Délai, R = Reprise, RC = Reprise ciblée. Mécanisme de différenciation. |
| `eval-col-niveau` | Niveau IDME : I = Incomplet ou insuffisant, D = en Développement, M = Maîtrisé, E = Étendu. |
| `eval-critere` | Évaluer le critère en attribuant un niveau. La rétroaction générale est générée automatiquement selon la cartouche. |
| `eval-echelle` | Échelle de conversion pourcentage → niveau IDME. Seuils configurables dans Réglages. |
| `eval-filtre-production` | Filtrer les évaluations par production. Permet de voir les résultats d'un seul travail à la fois. |
| `eval-filtre-statut` | Filtrer par statut de progression : non reçu, reçu, importé, annoté, évalué, ou par type de jeton. |
| `eval-francais-ecrit` | Évaluation algorithmique : saisir les codes d'erreurs et le nombre de mots. Calcul et rétroaction automatiques. |
| `eval-grille` | Grille critériée avec pondérations. Détermine les critères affichés pour l'évaluation. |
| `eval-integrite` | Recevable ou non. Les travaux non recevables (plagiat, IA non autorisée) sont exclus des calculs de moyenne et de l'indice P. |
| `eval-jeton-delai` | Prolonge l'échéance de remise. L'évaluation porte sur la même production, remise plus tard. |
| `eval-jeton-reprise` | L'étudiant reprend entièrement la production. La nouvelle évaluation remplace la note. |
| `eval-jeton-reprise-ciblee` | L'étudiant reprend un aspect spécifique ciblé par l'enseignant. Le niveau IDME peut être ajusté et plafonné. |
| `eval-jetons` | Délai (orange), Reprise (vert) ou Reprise ciblée (violet). Permet à l'étudiant de démontrer sa progression. |
| `eval-liste` | Toutes les évaluations du groupe : résultats, niveaux IDME, jetons et accès aux dossiers PDF. |
| `eval-liste-resume` | Résultats totaux, évaluations recevables (exclut les non-recevables), moyenne du groupe et nombre de productions. |
| `eval-modifier-attribution` | Corriger l'attribution automatique : changer l'étudiant ou la production associée à ce fichier. |
| `eval-niveau-idme` | Niveau calculé automatiquement. Modifier uniquement si nécessaire (ex. : reprise ciblée). |
| `eval-note-finale` | Résultat calculé en temps réel : pourcentage pondéré et niveau IDME correspondant. |
| `eval-page` | Interface d'évaluation critériée. Sélectionner les paramètres à gauche, évaluer et prévisualiser la rétroaction à droite. |
| `eval-panneau-criteres` | Liste des critères de la grille sélectionnée. Attribue un niveau à chaque critère pour calculer la note finale. |
| `eval-productions-configurees` | Nombre total de productions définies dans la construction de la note. Inclut portfolios, artefacts, production et travaux. |
| `eval-productions-realisees` | Nombre de productions pour lesquelles au moins une évaluation a été enregistrée dans le groupe. |
| `eval-retro-adresse` | Ajoute une interpellation personnalisée au début de la rétroaction (ex. : Bonjour [Prénom]). Humanise le commentaire écrit. |
| `eval-retro-contexte` | Inclut le texte de contexte d'apprentissage défini dans la cartouche. Situe la rétroaction dans la progression du cours. |
| `eval-retro-description` | Inclut un rappel du contexte de la production (titre et description de l'artefact) dans la rétroaction remise à l'étudiant. |
| `eval-retro-objectif` | Inclut l'objectif d'apprentissage visé par la production. Aide l'étudiant à se rappeler ce qu'il devait démontrer. |
| `eval-retro-tache` | Inclut le rappel de la tâche demandée. Situe la rétroaction par rapport aux consignes initiales. |
| `eval-retroaction` | Rétroaction générée automatiquement. Modifier le texte si nécessaire, puis copier dans le presse-papier. |
| `eval-retroaction-options` | Sections à inclure : Description, Objectif, Tâche, Adresse (interpellation) et Contexte d'apprentissage. |
| `eval-stats-groupe` | Indicateurs clés du groupe-cours : complétion, productions réalisées et nombre d'artefacts configurés. |
| `eval-statut-remise` | Indiquer si la production a été remise. Conditionne le calcul de l'indice de complétion (C). |
| `eval-taux-completion` | Moyenne des taux de remise individuels. Correspond à l'indice C (Complétion) du Tableau de bord. |
| `eval-travaux-importes` | Nombre de fichiers de travaux stockés et prêts à être annotés ou évalués. |
| `eval-travaux-preparation` | Nombre de fichiers en file d'attente dans le pipeline d'importation, prêts à être traités et importés. |

### TRAVAUX (Import, annotation, export)

| Clé | Texte |
|-----|-------|
| `travaux-archivage-alleger` | Convertit les originaux déjà exportés en fac-similés légers (niveaux de gris, 800px). Libère de l'espace de stockage sans perdre les annotations. |
| `travaux-archivage-etudiant` | Télécharge un fichier ZIP contenant tous les travaux d'un étudiant. Utile pour remettre un dossier complet en fin de session. |
| `travaux-archivage-inclure-annotes` | Ajoute les versions annotées (avec surlignage, commentaires et tampons) au fichier ZIP. Décocher pour n'exporter que les originaux. |
| `travaux-archivage-inclure-evals` | Ajoute un fichier de rétroaction pour chaque évaluation complétée. Pratique pour la remise aux étudiants. |
| `travaux-archivage-production` | Télécharge un fichier ZIP regroupant tous les travaux d'une production. Pratique pour archiver une évaluation complète. |
| `travaux-archivage-semestre` | Archive complète de tous les travaux du trimestre en un seul fichier ZIP. Recommandé en fin de session pour la conservation. |
| `travaux-btn-alleger` | Remplace l'original par un fac-similé encore plus léger (niveaux de gris, 800px). Réduit l'espace de stockage. Les annotations sont conservées. |
| `travaux-btn-annoter` | Mode annotation : surligner, écrire et apposer des tampons directement sur la copie de l'étudiant. |
| `travaux-btn-evaluer` | Mode évaluation : ouvre les panneaux de critères et de paramètres pour évaluer cette production selon la grille. |
| `travaux-btn-reimporter` | Remplace le fichier allégé par l'original complet. Utile si tu as besoin de revoir les détails de la copie originale. |
| `travaux-evaluer` | Ouvre l'interface d'évaluation avec l'étudiant et la production pré-sélectionnés. Tu pourras appliquer une grille de critères et générer une rétroaction. |
| `travaux-fsapi-config` | Stocke les fichiers importés directement sur le disque local au lieu d'IndexedDB. Recommandé sur ordinateur pour éviter les limites de stockage du navigateur. |
| `travaux-pipeline-optimisation` | Les images sont optimisées automatiquement (uniformisation de la résolution DPI, compression JPEG). Les PDF sont importés tels quels. |
| `travaux-production` | Sélectionne la production (travail, examen) que tu es en train d'évaluer. Les fichiers importés seront associés à cette production pour l'évaluation. |

### CONSTRUCTION DE LA NOTE

| Clé | Texte |
|-----|-------|
| `cn-apercu` | Décompte des ressources configurées : productions, grilles, échelles, pratiques et cartouches. |
| `cn-bibliotheque` | Gérer les ressources : créer, importer depuis la bibliothèque communautaire, dupliquer, exporter ou supprimer. |
| `cn-cartouche-contexte` | Texte introductif optionnel affiché au début de la rétroaction si l'option « Contexte » est cochée. |
| `cn-cartouche-matrice` | Tableau critères × niveaux. Chaque cellule est un commentaire général de rétroaction. Assemblage automatique lors de l'évaluation. |
| `cn-cartouche-selectors` | La grille détermine les critères (lignes), l'échelle détermine les niveaux (colonnes) de la matrice. |
| `cn-cartouche-titre` | Matrices de commentaires généraux automatiques. Chaque cartouche génère une rétroaction générale par critère × niveau. |
| `cn-echelle-apercu` | Barre colorée montrant les plages de chaque niveau. Vérifie visuellement la cohérence des seuils. |
| `cn-echelle-niveau` | Niveaux avec code, nom, plages de pourcentage, valeur ponctuelle et couleur. |
| `cn-echelle-titre` | Échelles de conversion pourcentage → niveaux de performance. Configurer les seuils et couleurs. |
| `cn-echelle-valeur-ponctuelle` | Valeur numérique fixe attribuée au niveau pour les calculs de note. |
| `cn-grille-critere` | Critères avec nom, type, pondération et description. La pondération totale doit atteindre 100%. |
| `cn-grille-ponderation-totale` | Somme des pondérations de tous les critères. Doit atteindre 100% pour que la grille soit valide. |
| `cn-grille-titre` | Grilles réutilisables avec critères pondérés. Chaque grille définit les critères d'évaluation d'une production. |
| `cn-grille-type-critere` | Méthode d'évaluation : Holistique (attribution manuelle d'un niveau) ou Algorithmique (calcul automatique). |
| `cn-pratique-appliquer` | Définir cette pratique comme configuration active du cours. Conditionne tous les calculs de notes et indices. |
| `cn-pratique-discipline` | Discipline académique associée. Filtre les ressources de la bibliothèque par pertinence. |
| `cn-pratique-echelle` | Échelle IDME utilisée pour convertir les pourcentages en niveaux. Configurable dans Échelles de performance. |
| `cn-pratique-jetons` | Ressources limitées (Délai, Reprise, Reprise ciblée) pour adapter le parcours évaluatif de l'étudiant. |
| `cn-pratique-titre` | Assemblage final : type de pratique, échelle, structure des évaluations et système de jetons. |
| `cn-pratique-type` | SOM = Sommative (moyenne pondérée), STD = PAN basée sur des standards (ou par maitrise), SPE = PAN basée sur des spécification (ou contrat), DEN = Dénotation basée sur des pratiques réduisant ou éliminant la notation. |
| `cn-pratiques-compat` | Pratiques compatibles : SOM = Sommative, STD = PAN-Standards, SPE = Spécification, DEN = Dénotation. |
| `cn-preparer-pdf` | Générer un PDF de la ressource. Choisir la grille et l'échelle, puis prévisualiser. |
| `cn-prod-activite` | Nom de l'activité pédagogique associée à cette production. Cliquer sur ✏️ pour modifier. |
| `cn-prod-grille` | Associer une grille d'évaluation à cette production. Définit les critères utilisés lors de l'évaluation. |
| `cn-prod-objectif` | Ce que l'étudiant sera capable de faire. Utilisé dans la rétroaction et le dossier PDF. |
| `cn-prod-ponderation` | Poids dans la note finale. Les exercices et travaux se partagent le 100%. |
| `cn-prod-tableau` | Tableau récapitulatif de toutes les productions : titre, type, pondération et échéance. |
| `cn-prod-tache` | Ce qui est demandé à l'étudiant. Apparaît dans le dossier PDF de rétroaction. |
| `cn-prod-titre` | Définir les productions étudiantes : travaux et exercices avec pondérations et échéances. |
| `cn-prod-type` | Portfolio (conteneur d'artefacts pondéré), Artefact (production du portfolio) ou Travail (évaluation indépendante). |
| `cn-ressources` | Nombre total de ressources disponibles (locales + bibliothèque) pour chaque type. |

### NAVIGATION PRINCIPALE

| Clé | Texte |
|-----|-------|
| `nav-accueil` | Retour à la page d'accueil du système. |
| `nav-aide` | Documentation, tutoriels et ressources d'aide. |
| `nav-apercu` | Observer les indices A-C-P, les patterns, les niveaux RàI et le développement du groupe via des graphiques. |
| `nav-bao-modelisation` | Démonstrations interactives et modélisations visuelles pour illustrer des concepts. |
| `nav-bao-tirage` | Tirage au sort aléatoire et questions flash pour l'animation en classe. |
| `nav-boite-outils` | Utilitaires complémentaires pour l'enseignement. |
| `nav-construction` | Configuration de l'évaluation : productions, grilles, échelles, cartouches et pratiques de notation. |
| `nav-ctx-bilan` | Bilan réflexif de la démarche pédagogique : forces, défis et pistes d'amélioration. |
| `nav-ctx-calendrier` | Calendrier du trimestre : grilles mensuelles, jours de cours, congés et reprises. |
| `nav-ctx-pratiques` | Assembler une pratique complète (SOM, STD, SPE, DEN) en associant échelle, structure et jetons. |
| `nav-ctx-trimestre` | Configuration du trimestre, du cours, de l'enseignant, du groupe d'étudiants, de l'horaire et du groupe-cours. |
| `nav-eval-annoter` | Annoter les copies et évaluer selon la grille de critères, sur le même document. |
| `nav-eval-exporter` | Exporter les PDF annotés aux étudiants, archiver le semestre et alléger le stockage. |
| `nav-eval-importer` | Importer les travaux des étudiants (PDF, images) et préparer les fichiers (rotation, assemblage). |
| `nav-eval-liste` | Tableau exhaustif des évaluations : résultats, niveaux de performance, jetons et dossiers PDF. |
| `nav-evaluations` | Évaluation des productions : grilles critériées, niveaux de performance et rétroaction différenciée automatique. |
| `nav-planification` | Planification pédagogique : alignement objectifs-activités-évaluations et organisation des leçons. |
| `nav-presences` | Suivi de l'assiduité : statistiques de présence, calendrier des séances et saisie des présences. |
| `nav-reg-apropos` | Informations sur l'application et sa version. |
| `nav-reg-depistage` | Outils d'observation des apprentissages (SOLO, Actions RLO) et configuration du dépistage RàI (seuils de détection et d'interprétation). |
| `nav-reg-donnees` | Sauvegarde, restauration, snapshots A-C-P, export anonymisé, réinitialisation et maintenance. |
| `nav-reg-preferences` | Personnaliser l'interface : outils actifs, ressources affichées, effets visuels et comportement de navigation. |
| `nav-str-alignement` | Carte mentale interactive : visualiser l'alignement objectifs → activités → évaluations. |
| `nav-str-cartouches` | Créer des matrices de commentaires automatiques (critères × niveaux) pour la rétroaction différenciée. |
| `nav-str-echelles` | Configurer les échelles de performance : seuils, valeurs ponctuelles, couleurs et aperçu visuel. |
| `nav-str-grilles` | Créer des grilles réutilisables avec critères nommés, typés et pondérés. |
| `nav-str-organisateur` | Calendrier des séquences sur 15 semaines et plans de leçons avec enseignement explicite en 5 phases. |
| `nav-str-productions` | Définir les productions étudiantes : portfolio, artefacts et travaux avec pondérations et échéances. |
| `nav-suivi-interventions` | Planifier et documenter les interventions RàI de niveaux 2 (préventif) et 3 (intensif). |
| `nav-suivi-labo` | Analyser les résultats de la démarche pédagogique : graphiques de progression, corrélations et trajectoires. |
| `nav-suivi-liste` | Tableau complet des étudiants avec indices, patterns et niveaux RàI. Filtrable et triable par colonne. |
| `nav-suivi-profil` | Fiche individuelle d'un étudiant : productions, mobilisation, progression, habiletés, accompagnement et rapport. |
| `nav-suivi-saisie` | Saisir les présences et absences pour chaque séance du groupe. |
| `nav-tableau-bord` | Vue d'ensemble du groupe : indices A-C-P, patterns d'apprentissage, niveaux RàI et profils individuels. |

---

## Partie B — Popups (aide contextuelle)

**Format** : Icônes 📍 qui affichent une modale d'aide au clic  
**Nombre** : 8 entrées pédagogiques et didactiques  

### Construction de la note — Productions

**ID** : `conseil-productions`

**Texte** :

> **Conseil pratique :** Assure-toi que la somme des pondérations totalise 100%. Pour les portfolios, définis d'abord le nombre d'artefacts
> à retenir (ex: les 3 meilleurs sur 9). Les artefacts individuels n'ont pas de pondération propre, c'est le portfolio
> conteneur qui définit la pondération globale. Pense à verrouiller les productions une fois finalisées pour éviter
> les modifications accidentelles.

### Construction de la note — Grilles

**ID** : `conseil-grilles`

**Texte** :

> **Conseil pratique :** Pour le critère Français, tu peux utiliser le type algorithmique avec la formule (nb_erreurs / nb_mots) × 100.
> Les grilles peuvent être dupliquées et modifiées pour créer des variantes adaptées à différents types
> de productions. Pense à nommer tes grilles de façon descriptive (ex: "Grille analyse littéraire", "Grille laboratoire").
> La somme des pondérations des critères doit totaliser 100%.

### Construction de la note — Cartouches

**ID** : `conseil-retroactions`

**Texte** :

> **Conseil pratique :** Les commentaires peuvent avoir entre 50 et 75 mots environ. Rédige-les de façon personnelle
> et constructive. Chaque cellule de la matrice correspond à un commentaire pour un niveau de
> performance donné sur un critère spécifique. Tu peux utiliser les codes de ta grille (ex. : I, D, M, E) et
> le format proposé pour structurer tes commentaires. Les cartouches peuvent être verrouillées
> une fois finalisées.

### Tableau de bord — Liste

**ID** : `conseil-liste-etudiants`

**Texte** :

> **Conseil pratique :**
> Pour ajouter, modifier ou supprimer des étudiants, allez dans **Réglages › Groupe**.

### Réglages — Cours

**ID** : `conseil-cours`

**Texte** :

> **Conseil pratique :**
> • **Cours actif :** Un seul cours peut être actif à la fois. Le cours
> actif est utilisé comme référence dans toute l'application
> • **Verrouillage :** Verrouillez un cours terminé pour éviter les
> modifications accidentelles
> • **Duplication :** Dupliquez un cours pour créer rapidement une
> nouvelle session en modifiant seulement l'année
> • **Code de cours :** Format habituel : XXX-XXX-XX
> (département-numéro-pondération)
> • **Format horaire :** Définit comment les heures sont réparties dans
> la semaine (utilisé pour le calendrier)

### Réglages — Horaire

**ID** : `conseil-horaire`

**Texte** :

> **Conseil pratique :**
> • **Format 2×2h :** Idéal pour deux périodes de cours séparées dans
> la semaine (ex: lundi et jeudi)
> • **Format 1×4h :** Convient aux cours intensifs d'une seule période
> continue
> • **Format 1×3h :** Convient aux cours d'une seule période
> continue
> • **Heure de début/fin :** Respecte le format 24h (ex: 13:00, pas
> 1:00 PM)
> • **Reprises :** Les séances de reprise seront automatiquement
> ajoutées lors de la configuration des congés imprévus dans la section
> Trimestre
> • **Modification :** Tu peux modifier le format horaire en tout
> temps. Les séances existantes seront supprimées et devront être recréées

### Réglages — Groupe d'étudiants

**ID** : `conseil-groupe`

**Texte** :

> **Conseil pratique :**
> • **Champ Groupe :** Permet d'organiser tes étudiants si tu as
> plusieurs groupes (ex: Groupe 1, Groupe 2). Utilise le filtre en haut pour afficher un groupe
> spécifique.
> • **Import CSV/TSV :** Format attendu avec 7 colonnes : DA, Groupe,
> Nom, Prénom, Programme, Nom du programme, SA. Les colonnes peuvent être séparées par des virgules ou des
> tabulations. Une colonne peut être ajoutée manuellement après l'import.
> • **Copier-coller :** Tu peux copier directement depuis Excel ou
> Google Sheets. La prévisualisation te permet de vérifier avant d'importer.
> • **Modification :** Utilise l'icône pour modifier un·e
> étudiant·e, ou pour le·la supprimer.
> • **Export :** Exporte ta liste au format CSV pour backup ou partage.
> Le fichier peut ensuite être réimporté.
> • **Réinitialisation :** Attention ! Le bouton « Réinitialiser »
> supprime **tous les étudiants**. Cette action est irréversible.
> • **Lien avec les autres sections :** La liste configurée ici est
> automatiquement disponible dans l'onglet « Étudiants › Liste des individus » pour la gestion des
> portfolios.

### Réglages — Dépistage

**ID** : `conseil-interpretation`

**Texte** :

> **Conseil pratique :**
> • **Stockage :** Les seuils sont sauvegardés dans localStorage
> • **Portée :** Les modifications affectent tous les calculs immédiatement
> • **Valeurs par défaut :**
> • Progression : 5 points (%)
> • Direction risque : 5 points (%)
> • Défi SRPNF : 70%
> • **Impact :** Les seuils influencent les diagnostics RàI, patterns et recommandations

---

## Partie C — Tour guidé

### Activation
**Préférence** : `tourGuide` (booléen, défaut : false)
**Localisation** : Checkbox « Mode assistance » dans l'accueil
**Code** : `js/accueil.js`, `js/modes.js`, `js/preferences.js`

### Fonctionnement
Le tour guidé n'est **pas un scénario séquentiel**. C'est un toggle global :

- **Quand activé** : Affiche les icônes 📍 (popup-aide) partout dans l'interface
- **Quand désactivé** : Masque les icônes 📍
- **Info-bulles** : Restent toujours visibles au survol (indépendantes du tour)
- **Interaction** : L'utilisateur navigue librement et clique sur les icônes pour découvrir les sections

---

**Audit généré le** : 18 avril 2026, révisé par Grégoire le 19 avril 2026
**Fichier** : `docs/AUDIT-TEXTES-AIDE.md`
**Version référencée** : Beta 99.11 (Build 0411-2010)

