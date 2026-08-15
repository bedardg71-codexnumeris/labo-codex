# Lot T4 — Info-bulles Construction de la note (productions, grilles, échelles, cartouches, pratiques)

**Statut** : Validé (19 avril 2026)  
**Charte de référence** : `plans de travail/PLAN-REFONTE-TEXTES-ACCOMPAGNEMENT.md`, section 1  
**Source des textes actuels** : `docs/AUDIT-TEXTES-AIDE.md`, Partie A  
**Fichier cible** : `js/tooltips-contenu.js`

---

## Vue d'ensemble

| Clé | Texte réécrit |
|-----|---------------|
| `cn-apercu` | Tes ressources configurées : productions, grilles, échelles, pratiques et cartouches. |
| `cn-bibliotheque` | Gère tes ressources : crée, importe depuis la bibliothèque communautaire, duplique, exporte ou supprime. |
| `cn-ressources` | Nombre total de ressources disponibles (locales et bibliothèque) pour chaque type. |
| `cn-preparer-pdf` | Génère un PDF de la ressource. Choisis la grille et l'échelle, puis prévisualise avant d'imprimer. |

## Productions

| Clé | Texte réécrit |
|-----|---------------|
| `cn-prod-titre` | Définis les productions de tes étudiant·es : travaux et exercices avec pondérations et échéances. |
| `cn-prod-tableau` | Tableau récapitulatif de toutes tes productions : titre, type, pondération et échéance. |
| `cn-prod-type` | Portfolio (conteneur d'artefacts pondéré — les N meilleurs résultats sont retenus), Artefact (production à l'intérieur d'un portfolio) ou Travail (évaluation indépendante). |
| `cn-prod-activite` | Nom de l'activité pédagogique associée à cette production. Clique sur ✏️ pour modifier. |
| `cn-prod-grille` | Associe une grille d'évaluation à cette production. Définit les critères utilisés lors de la correction. |
| `cn-prod-objectif` | Transférable et sans terme : la capacité qui servira à l'artefact suivant, au cours suivant, ailleurs. On ne coche pas un objectif atteint — on en observe la progression. Apparaît dans la rétroaction et le dossier PDF. |
| `cn-prod-tache` | Locale et bornée : ce que l'étudiant·e produit ici — sur quoi, en quelle quantité, sur quel support. Une tâche se termine : on peut cocher qu'elle est faite. Apparaît dans le dossier PDF de rétroaction. |
| `cn-prod-detail-tache` | Les consignes qui rendent la tâche exécutable : étapes, contraintes, format. N'y exige rien que la description de la tâche n'annonce pas — l'étudiant·e planifie son travail à partir de l'annonce. |
| `cn-prod-ponderation` | Poids dans la note finale. L'ensemble des productions se partage le 100 %. |

## Grilles de critères

| Clé | Texte réécrit |
|-----|---------------|
| `cn-grille-titre` | Grilles réutilisables avec critères pondérés. Chaque grille définit les critères d'évaluation d'une production — comme la grille papier que tu utilises déjà pour évaluer. |
| `cn-grille-critere` | Critères avec nom, type, pondération et description. La pondération totale doit atteindre 100 %. |
| `cn-grille-type-critere` | Méthode d'évaluation du critère : holistique (tu attribues un niveau global), analytique (tu attribues des points par élément ou micro-tâche) ou algorithmique (calcul automatique, ex. : français écrit). |
| `cn-grille-ponderation-totale` | Somme des pondérations de tous les critères. Doit atteindre 100 % pour que la grille soit valide. |

## Échelles de performance

| Clé | Texte réécrit |
|-----|---------------|
| `cn-echelle-titre` | Échelles de conversion pourcentage → niveaux de performance. Configure les seuils et les couleurs pour chaque niveau (ex. : Insuffisant, Développement, Maîtrise, Étendu). |
| `cn-echelle-niveau` | Niveaux avec code, nom, plages de pourcentage, valeur ponctuelle et couleur. |
| `cn-echelle-apercu` | Barre colorée montrant les plages de chaque niveau. Vérifie visuellement la cohérence de tes seuils. |
| `cn-echelle-valeur-ponctuelle` | Valeur numérique fixe attribuée à ce niveau pour les calculs de note. |

## Cartouches de rétroaction

| Clé | Texte réécrit |
|-----|---------------|
| `cn-cartouche-titre` | Matrices de commentaires automatiques. Chaque cartouche génère une rétroaction par combinaison critère × niveau — un gabarit de commentaires que tu prépares une fois et qui s'assemble à chaque évaluation. |
| `cn-cartouche-matrice` | Tableau critères × niveaux. Chaque cellule contient un commentaire de rétroaction. L'application assemble automatiquement les commentaires lors de l'évaluation. |
| `cn-cartouche-selectors` | La grille détermine les critères (lignes), l'échelle détermine les niveaux (colonnes) de la matrice. |
| `cn-cartouche-contexte` | Texte introductif optionnel affiché au début de la rétroaction si l'option «Contexte» est cochée. Permet de situer la production dans la progression du cours. |

## Pratiques de notation

| Clé | Texte réécrit |
|-----|---------------|
| `cn-pratique-titre` | Assemblage final de ta pratique : type de notation, échelle, structure des évaluations et système de jetons. C'est la recette complète de ta façon de construire la note. |
| `cn-pratique-type` | SOM = sommative (moyenne pondérée traditionnelle), STD = PAN basée sur des standards (par maîtrise), SPE = PAN basée sur des spécifications (contrat), DEN = dénotation (pratiques réduisant ou éliminant la notation). |
| `cn-pratique-echelle` | Échelle utilisée pour convertir les pourcentages en niveaux (ex. : I-D-M-E). Configurable dans Échelles de performance. |
| `cn-pratique-jetons` | Ressources limitées que tu accordes à tes étudiant·es : Délai (prolonger l'échéance), Reprise (refaire la production) ou Reprise ciblée (reprendre un aspect spécifique). |
| `cn-pratique-discipline` | Discipline académique associée. Filtre les ressources de la bibliothèque par pertinence. |
| `cn-pratique-appliquer` | Définit cette pratique comme configuration active du cours. Conditionne tous les calculs de notes et d'indices. |
| `cn-pratiques-compat` | Pratiques compatibles avec cette ressource : SOM (sommative), STD (PAN-standards), SPE (spécification), DEN (dénotation). |
