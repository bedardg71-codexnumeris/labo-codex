# Lot T5 — Info-bulles Évaluations (saisie, jetons, rétroaction, statuts)

**Statut** : Validé (19 avril 2026)  
**Charte de référence** : `plans de travail/PLAN-REFONTE-TEXTES-ACCOMPAGNEMENT.md`, section 1  
**Source des textes actuels** : `docs/AUDIT-TEXTES-AIDE.md`, Partie A  
**Fichier cible** : `js/tooltips-contenu.js`

---

## Aperçu et statistiques

| Clé | Texte réécrit |
|-----|---------------|
| `eval-apercu` | Statistiques synthétiques du groupe : taux de complétion moyen, productions réalisées et productions configurées. |
| `eval-stats-groupe` | Indicateurs clés du groupe-cours : complétion, productions réalisées et nombre de productions configurées. |
| `eval-taux-completion` | Moyenne des taux de remise individuels. Correspond à l'indice C (Complétion) du tableau de bord. |
| `eval-productions-configurees` | Nombre total de productions définies dans la construction de la note. Inclut portfolios, artefacts et travaux. |
| `eval-productions-realisees` | Nombre de productions pour lesquelles au moins une évaluation a été enregistrée dans le groupe. |
| `eval-travaux-importes` | Nombre de fichiers de travaux stockés et prêts à être annotés ou évalués. |
| `eval-travaux-preparation` | Nombre de fichiers en attente d'importation, prêts à être traités. |

## Liste des évaluations

| Clé | Texte réécrit |
|-----|---------------|
| `eval-liste` | Toutes les évaluations du groupe : résultats, niveaux IDME, jetons et accès aux dossiers PDF. |
| `eval-liste-resume` | Résultats totaux, évaluations recevables (les non-recevables sont exclues), moyenne du groupe et nombre de productions. |
| `eval-filtre-production` | Filtre les évaluations par production. Permet de voir les résultats d'un seul travail à la fois. |
| `eval-filtre-statut` | Filtre par statut de progression : non reçu, reçu, importé, annoté, évalué — ou par type de jeton. |

## Interface d'évaluation

| Clé | Texte réécrit |
|-----|---------------|
| `eval-page` | Interface d'évaluation critériée. Sélectionne les paramètres à gauche, évalue et prévisualise la rétroaction à droite. |
| `eval-panneau-criteres` | Liste des critères de la grille sélectionnée. Attribue un niveau à chaque critère pour calculer la note finale. |
| `eval-grille` | Grille critériée avec pondérations. Détermine les critères affichés pour cette évaluation. |
| `eval-echelle` | Échelle de conversion pourcentage → niveau IDME. Seuils configurables dans les échelles de performance. |
| `eval-cartouche` | Cartouche de rétroaction associée à cette production. Détermine le vocabulaire et le ton des commentaires générés automatiquement. |
| `eval-critere` | Évalue ce critère en attribuant un niveau. La rétroaction est générée automatiquement selon la cartouche. |
| `eval-note-finale` | Résultat calculé en temps réel : pourcentage pondéré et niveau IDME correspondant. |
| `eval-niveau-idme` | Niveau calculé automatiquement. Modifie uniquement si nécessaire (ex. : reprise ciblée). |
| `eval-col-niveau` | Niveau IDME : I = Insuffisant ou incomplet, D = en Développement, M = Maîtrisé, E = Étendu. |
| `eval-statut-remise` | Indique si la production a été remise. Conditionne le calcul de l'indice de complétion (C). |
| `eval-integrite` | Recevable ou non. Les travaux non recevables (plagiat, IA non autorisée) sont exclus des calculs de moyenne et de l'indice P. |
| `eval-francais-ecrit` | Évaluation algorithmique du français écrit : saisis les codes d'erreurs et le nombre de mots. Le calcul et la rétroaction sont générés automatiquement à partir de tes formulations. |
| `eval-codes-erreurs` | Codes numériques des erreurs, séparés par points-virgules. Consulte la grille pour la correspondance codes → catégories. |
| `eval-modifier-attribution` | Corrige l'attribution automatique : change l'étudiant·e ou la production associée à ce fichier. |
| `eval-btn-reinitialiser` | Efface le formulaire d'évaluation en cours et restaure les valeurs par défaut. Tes sélections de grille et d'échelle sont conservées. |
| `eval-btn-supprimer` | Supprime définitivement cette évaluation. La production reviendra au statut précédent. Irréversible. |

## Jetons

| Clé | Texte réécrit |
|-----|---------------|
| `eval-jetons` | Délai (orange), Reprise (vert) ou Reprise ciblée (violet). Permet à l'étudiant·e de démontrer à nouveau sa compétence ou son habileté. |
| `eval-col-jeton` | Type de jeton : D = Délai, R = Reprise, RC = Reprise ciblée. Permet à l'étudiant·e de démontrer à nouveau sa compétence ou son habileté. |
| `eval-jeton-delai` | Prolonge l'échéance de remise. L'évaluation porte sur la même production, remise plus tard selon une entente convenue. |
| `eval-jeton-reprise` | L'étudiant·e reprend entièrement la production pour démontrer à nouveau sa compétence. La nouvelle évaluation remplace la précédente. |
| `eval-jeton-reprise-ciblee` | L'étudiant·e reprend un aspect spécifique que tu as ciblé pour démontrer sa maîtrise. Le niveau IDME peut être ajusté et plafonné. |

## Rétroaction

| Clé | Texte réécrit |
|-----|---------------|
| `eval-retroaction` | Rétroaction générée automatiquement. Modifie le texte au besoin, puis copie dans le presse-papier. |
| `eval-retroaction-options` | Sections à inclure dans la rétroaction : Description, Objectif, Tâche, Adresse (interpellation) et Contexte d'apprentissage. |
| `eval-retro-adresse` | Ajoute une interpellation personnalisée au début de la rétroaction (ex. : «Bonjour [Prénom]»). Humanise le commentaire écrit. |
| `eval-retro-contexte` | Inclut le texte de contexte d'apprentissage défini dans la cartouche. Situe la rétroaction dans la progression du cours. |
| `eval-retro-description` | Inclut un rappel du contexte de la production (titre et description) dans la rétroaction remise à l'étudiant·e. |
| `eval-retro-objectif` | Inclut l'objectif d'apprentissage visé par la production. Rappelle à l'étudiant·e ce qui devait être démontré. |
| `eval-retro-tache` | Inclut le rappel de la tâche demandée. Situe la rétroaction par rapport aux consignes initiales. |
