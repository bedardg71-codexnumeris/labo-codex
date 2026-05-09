# Lot T7 — Info-bulles Tableau de bord — Aperçu

**Statut** : Validé (19 avril 2026)  
**Charte de référence** : `plans de travail/PLAN-REFONTE-TEXTES-ACCOMPAGNEMENT.md`, section 1  
**Source des textes actuels** : `docs/AUDIT-TEXTES-AIDE.md`, Partie A  
**Fichier cible** : `js/tooltips-contenu.js`

---

## Navigation et vue d'ensemble

| Clé | Texte réécrit |
|-----|---------------|
| `tdb-apercu` | Portrait complet de ton groupe-cours : indices d'apprentissage, patterns, interventions et graphiques de développement. |
| `tdb-sous-nav` | Quatre vues : aperçu du groupe, liste des individus, profil étudiant·e et interventions RàI. |
| `tdb-zones-couleur` | Fragile (0-64 %), Modéré (65-74 %), Favorable (75-85 %), Très favorable (≥ 85 %). Seuils configurables dans Réglages. |

## Observer (indices A-C-P)

| Clé | Texte réécrit |
|-----|---------------|
| `tdb-observer` | Indices A-C-P du groupe. Chaque barre positionne les étudiant·es sur une échelle qui décrit son contexte d'apprentissage observé, allant de Fragile à Très favorable. |
| `tdb-selecteur-indice` | Choisis l'indice à visualiser : Assiduité (A), Complétion (C) ou Performance (P). |
| `tdb-assiduite` | Taux de présence aux séances. Chaque point représente un·e étudiant·e. |
| `tdb-completion` | Taux de remise des travaux. La corrélation C×P indique le lien entre la remise et les résultats. |
| `tdb-performance` | Résultats aux évaluations par niveaux. La performance peut être notée avec un chiffre ou une lettre (ex. : Insuffisant ou incomplet, en Développement, Maîtrisé, Étendu). |
| `tdb-liste-individus` | Vue détaillée de chaque étudiant·e avec ses indices individuels. |
| `tdb-profil` | Fiche individuelle d'un·e étudiant·e : trajectoire, indices et historique. |

## Graphiques

| Clé | Texte réécrit |
|-----|---------------|
| `tdb-dev-groupe` | Évolution d'un indice dans le temps pour tout le groupe. Chaque ligne représente un·e étudiant·e. |
| `tdb-graphique-groupe` | Graphique longitudinal du groupe. Clique sur une courbe pour la verrouiller. |
| `tdb-selecteur-eleve-groupe` | Isole la trajectoire d'un·e étudiant·e sur le graphique du groupe. |
| `tdb-dev-individuel` | Résultats par production. Chaque point représente un·e étudiant·e sur une activité. Les trajectoires isolées méritent attention. |
| `tdb-graphique-individuel` | Résultats par activité d'apprentissage. Les zones denses révèlent les tendances du groupe. |
| `tdb-selecteur-eleve-indiv` | Isole la trajectoire d'un·e étudiant·e sur le graphique des productions. |
| `tdb-impact-jetons` | Compare la trajectoire P avec et sans jeton de reprise. ■ = production avec jeton, □ = sans. |
| `tdb-selecteur-eleve-jetons` | Affiche la courbe P individuelle d'un·e étudiant·e ayant utilisé un jeton de reprise. |

## Patterns et RàI

| Clé | Texte réécrit |
|-----|---------------|
| `tdb-patterns` | Progression sur les critères multistructurels (fondations SOLO) identifiés dans ta grille. Complémentaire au modèle RàI, qui regarde spécifiquement la performance globale et certains aspects comportementaux (mobilisation observée). |
| `tdb-rai` | Niveau d'intervention selon la performance globale (indice P, tous critères). Complémentaire au suivi des fondamentaux, qui cible uniquement les critères multistructurels. |
| `tdb-intervenir` | Suivi de l'apprentissage des fondamentaux (taxonomie SOLO) et répartition par niveaux d'intervention RàI. |
| `tdb-interventions-rai` | Gestion des interventions par niveau RàI : universel, préventif, intensif. |
