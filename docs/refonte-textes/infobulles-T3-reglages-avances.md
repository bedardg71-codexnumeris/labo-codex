# Lot T3 — Info-bulles Réglages avancés (préférences, dépistage, données)

**Statut** : Validé (19 avril 2026)  
**Charte de référence** : `plans de travail/PLAN-REFONTE-TEXTES-ACCOMPAGNEMENT.md`, section 1  
**Source des textes actuels** : `docs/AUDIT-TEXTES-AIDE.md`, Partie A  
**Fichier cible** : `js/tooltips-contenu.js`

---

## Préférences

| Clé | Texte réécrit |
|-----|---------------|
| `pref-actions-rlo` | Active trois tampons ou estampes (Repérage, Liaison, Ouverture) que tu poses sur les copies pour observer les gestes cognitifs de tes étudiant·es. Les résultats alimentent le profil RLO et l'export de recherche anonymisé. |
| `pref-affichage-assiduite` | Choisis l'unité d'affichage des totaux de présence et d'assiduité (ex. : en périodes). |
| `pref-affichage-comparatif` | Mode expérimental. Affiche la notation sommative traditionnelle et la notation alternative côte à côte dans les aperçus et le profil individuel. |
| `pref-affichage-developpement` | Affiche le tableau de progression des critères et les graphiques 0-100 % dans la section «Développement des habiletés» du profil individuel. |
| `pref-affichage-graphiques` | Affiche les graphiques de progression dans le temps dans la section «Progression temporelle ACP» du profil individuel. |
| `pref-affichage-solo` | Affiche une carte avec les descriptions des niveaux cognitifs (taxonomie SOLO de Biggs & Collis). Utile pour interpréter la complexité des réponses de tes étudiant·es. |
| `pref-navigation` | Ouvre directement sur le tableau de bord au démarrage, sans passer par la page d'accueil. |
| `pref-outils` | Outils disponibles pendant l'évaluation d'une production. |
| `pref-outils-acp` | Affiche les indices Assiduité (A), Complétion (C) et Performance (P) dans la section «Engagement ACP» du profil individuel. |
| `pref-outils-rai` | Active les niveaux d'intervention RàI et les recommandations personnalisées. Structure le soutien à tes étudiant·es en trois niveaux d'intensité : universel, ciblé, intensif. |
| `pref-tooltips` | Affiche ces descriptions contextuelles au survol. Désactive si tu maîtrises déjà l'application. |
| `pref-visuel` | Effets visuels de l'interface. L'animation des points du tableau de bord peut être désactivée pour réduire les distractions. |

## Dépistage

| Clé | Texte réécrit |
|-----|---------------|
| `depist-decoupler-pr` | Sépare le calcul de la note (P, selon ta pratique) du calcul de risque (R, basé sur les N dernières productions). Recommandé avec la pratique «N meilleurs». |
| `depist-fenetre` | Nombre de dernières productions analysées pour détecter les tendances. Valeur basse = détection précoce. Valeur élevée = détection plus fiable, mais plus tardive. |
| `depist-grille` | La grille de dépistage utilisée pour identifier les forces et les défis. Doit être la même pour toutes les productions du trimestre. |
| `depist-restaurer` | Réinitialise tous les seuils de détection à leurs valeurs par défaut. |
| `depist-seuil-acceptable` | Indice sous lequel la situation est en zone de vigilance (jaune). À surveiller. |
| `depist-seuil-bon` | Indice au-dessus duquel la situation est satisfaisante (vert). |
| `depist-seuil-defi` | Score (%) sous lequel un critère est identifié comme un défi nécessitant attention. Seuil bas = plus exigeant, seuil élevé = moins exigeant. |
| `depist-seuil-direction` | Variation minimale (%) pour afficher une tendance du risque. Contrôle la sensibilité de l'indicateur directionnel. |
| `depist-seuil-fragile` | Indice sous lequel la situation est préoccupante (rouge). Nécessite une intervention. |
| `depist-seuil-progression` | Différence minimale (%) pour signaler une progression ou une régression entre deux productions. Seuil bas = sensible, seuil élevé = moins sensible. |
| `depist-seuils-interpretation` | Seuils de couleur pour les indices A-C-P. Fragile (rouge), Acceptable (jaune), Bon (vert). Détermine les alertes du tableau de bord. |
| `depist-seuils-restaurer` | Réinitialise les seuils d'interprétation à leurs valeurs par défaut (65 / 70 / 75 %). |
| `depist-seuils-visuels` | Lignes pointillées et étiquettes des zones (ex. : Insuffisant, Développement, Maîtrise, Étendu) sur les graphiques de la section «Progression temporelle ACP» du profil individuel. |

## Données

| Clé | Texte réécrit |
|-----|---------------|
| `donnees-capturer` | Capture immédiate de l'état actuel des indices A-C-P. Comme prendre une photo de la situation de ton groupe à cet instant. |
| `donnees-captures` | Tes captures de suivi longitudinal et l'export anonymisé pour la recherche en éducation. |
| `donnees-export-complet` | Toutes tes données : cours, étudiant·es, présences, évaluations. Pour restaurer sur cet appareil ou un autre. |
| `donnees-export-config` | Uniquement tes outils (grilles, échelles, productions, cartouches). Pour partager avec un·e collègue (CC BY-NC-SA). |
| `donnees-export-recherche` | Export anonymisé des indices A-C-P et statistiques agrégées pour la recherche. Aucune donnée nominative incluse. |
| `donnees-gestion-ressources` | Audite et nettoie les ressources pédagogiques accumulées. Sélectionne un type pour afficher la liste. |
| `donnees-import` | Charge une sauvegarde personnelle ou la configuration d'un·e collègue. Le type est détecté automatiquement. |
| `donnees-info-techniques` | Tes données restent sur ton appareil (stockage local). Aucune donnée n'est envoyée sur internet. |
| `donnees-maintenance` | Outils techniques : réinitialisation, informations de stockage et gestion avancée des ressources. |
| `donnees-reconstruire` | Recalcule l'historique des captures depuis le début. Utile après un changement de paramètres de dépistage. |
| `donnees-reinitialiser` | Efface toutes les données et revient à l'état initial. Triple confirmation et mot de passe requis. Irréversible. |
| `donnees-sauvegarde` | Exporte tes données (sauvegarde complète ou configuration pédagogique seule) ou importe un fichier existant. |
| `donnees-snapshots` | Enregistre l'état des indices A-C-P à des moments clés pour suivre l'évolution de ton groupe dans le temps. |
| `donnees-supprimer-captures` | Efface toutes les captures enregistrées. Action irréversible. |
