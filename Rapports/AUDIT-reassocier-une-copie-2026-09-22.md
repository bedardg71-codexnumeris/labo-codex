# Audit — réassocier une copie à une production : quel chemin montre ce qu'on déplace ?

**Date** : 22 septembre 2026, après-midi. **Demande** de Grégoire, après l'incident #931 du matin (Artefact 2 / Artefact 2 (rév)) : « Pourrais-tu effectuer un audit afin de vérifier si l'éditeur permet une manipulation plus claire et plus simple que le recours au bouton « réassocier » dans la liste des évaluations ? »

**Méthode** : lecture seule de `js/liste-evaluations.js`, `js/travaux-ui.js`, `js/travaux-stockage.js` (1.153.2). Aucune exécution. Chaque constat porte sa disposition (règle de `CLAUDE.md`, 1er sept.).

---

## 1. Les quatre chemins, mesurés

| Chemin | Point d'entrée | Ce qu'on VOIT de la copie au moment du geste | Porte de conflit (élève × production déjà occupé) | Écrivain |
|---|---|---|---|---|
| **A. « Réassocier »** (Liste des évaluations, menu Actions) | `associerProductionDepuisListe` (`liste-evaluations.js:1603`) | **Rien** : une modale avec un seul menu « Production ». Ni nom de fichier, ni vignette. | Oui : « Remplacer l'existant ? », qui nomme les deux fichiers depuis #931 ; l'existant part à la corbeille. | `changerProductionFichier` → `reassocierFichier` |
| **B. « Modifier » → éditeur → « Propriétés »** | `ouvrirEditeurDepuisListe` (`:1470`) → `ouvrirEditeurPages` (`travaux-ui.js:6079`) → `ouvrirProprieteFichier` (`liste-evaluations.js:1487`) | **La photo** (toutes les pages, vignettes + aperçu) dans l'éditeur ; puis, dans Propriétés, le **nom du fichier** (éditable), l'élève, la production, l'évaluation. Deux écrans. | **Non.** Propriétés appelle `reassocierFichier` directement (`:1580`), sans `verificationSeule` : deux copies pour le même élève × production peuvent coexister, sans question ni corbeille. | `reassocierFichier` |
| **C. Colonne « Production » du tableau** (Annoter et évaluer, vue tableau) | `changerProductionFichierDepuisTableau` (`travaux-ui.js:7355`) | **Le nom de l'ÉLÈVE et son DA** — pas le nom du fichier, pas de vignette (`genererLigneTableauFichier`, `:2975-2976`). Deux copies d'un même élève = deux lignes identiques, sauf le menu Production. | Oui (même porte que A). Mais le menu **ne suit pas le verdict** : `changerProductionFichier` est appelé sans `await` ; si Grégoire répond « Annuler », le menu affiche la nouvelle production alors que rien n'a changé. | `changerProductionFichier` |
| **D. « Transférer »** | `ouvrirModalTransfert` (`:7104`) | Sans objet : déplace des copies **entre groupes-cours**, pas entre productions. | — | `reassocierFichiersBatch` |

Le lien « Non associé › » de la liste (`liste-evaluations.js:1185`) ouvre Propriétés (B) directement, sans passer par l'éditeur.

## 2. Ce que l'incident du matin a traversé

À 10 h 18, Grégoire a pris le chemin **A** sur une ligne sans copie (le repli aveugle, corrigé en 1.153.2). Puis, à 15 h 25, en réparant, il a repris **A** depuis une autre ligne : même modale sans nom de fichier. Enfin, mes consignes de réparation l'ont envoyé vers **C** en lui disant de reconnaître les lignes « au nom de fichier » — que **C n'affiche pas**. La confusion est structurelle : aucun des chemins qui portent la porte de conflit ne montre la copie, et le seul chemin qui montre la copie n'a pas la porte.

## 3. Réponse à la question

**Oui, l'éditeur (B) est plus clair** : c'est le seul chemin « voir la photo, puis décider ». **Mais il n'est ni plus simple ni plus sûr** : quatre clics et deux écrans (Modifier → Propriétés → Production → Sauvegarder), et son enregistrement contourne la porte de conflit — ce qui, ce matin, aurait laissé deux copies d'Exemple sous Artefact 2 (rév) sans rien dire, plutôt que d'en envoyer une à la corbeille.

Le défaut n'est pas « un chemin de trop », c'est **trois écrivains pour un seul geste**, chacun avec sa part de ce qu'il faudrait : A et C ont la porte, B a la vue. La règle zéro-dette du projet dit la suite : **un seul geste**, qui montre la copie (vignette + nom de fichier), nomme la cible, et passe par la porte.

## 4. Constats et dispositions

| # | Constat | Disposition |
|---|---|---|
| C1 | Aucun chemin ne montre à la fois la copie (vignette, nom de fichier) et la porte de conflit. | **Inscrit #932** — un seul geste de réassociation : la modale Propriétés reçoit la vignette de la première page et le nom de fichier en lecture, enregistre par `changerProductionFichier` (porte), et devient ce qu'ouvrent « Réassocier » (liste) et la colonne Production du tableau. A et C ne gardent pas d'écrivain propre. |
| C2 | Propriétés (B) écrit sans vérifier le conflit : deux copies pour un même élève × production peuvent coexister sans question ni corbeille. | **Inscrit #932** (même lot : B passe par `changerProductionFichier`). |
| C3 | Le tableau (C) : la colonne « Nom » est le nom de l'élève ; deux copies d'un même élève sont indistinguables. | **Inscrit #933** — colonne « Fichier » (nom LÉA ou nom de fichier) dans le tableau, avant la production. Indépendant de #932 ; utile même si C ne réassocie plus. |
| C4 | Le tableau (C) : le menu Production ne suit pas le verdict de la porte (`changerProductionFichier` non attendu) ; un refus laisse un menu qui ment. | **Inscrit #932** (disparaît si C ouvre Propriétés ; sinon `await` + remise du menu). |
| C5 | « Réassocier » (A) sur une ligne sans copie prenait un fichier au hasard. | **Périmé** — corrigé en 1.153.2 (#931). |
| C6 | La grille de badges et le menu déroulant du carrousel restent périmés après une suppression ou une réassociation (le « (3) ANNOTÉ » et la double pastille du matin). | **Déjà inscrit** dans la fiche #931 (non traité). |
| C7 | « Transférer » (D) porte un nom qui laisse croire à un changement de production ; il change de groupe-cours. | **Refusé** — un seul retour ambigu ; à reprendre si un testeur s'y trompe. |

## 5. Ce que l'audit ne mesure pas

Aucune exécution : les quatre chemins sont décrits d'après le code, pas rejoués. Le coût en clics de B est compté sur le code (`Modifier` → `Propriétés` → menu → `Sauvegarder`). La forme de la vignette dans Propriétés (taille, une page) n'est pas arrêtée : c'est un choix d'écran, à trancher au moment de #932 avec `design-interface`.
