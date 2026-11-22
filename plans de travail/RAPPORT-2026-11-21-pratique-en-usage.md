# Rapport — lot pratique-en-usage (21 nov. 2026) : la mesure, et un arrêt avant de bâtir

Mandat : protéger une pratique en usage, et permettre de préparer une pratique à venir. **Ce rapport porte le point A (la mesure). Rien n'est bâti : aucun fichier de `js/` n'est touché sur cette branche.** La raison est dite plus bas : ce lot dépend de deux lots qui ne sont pas encore dans `main`.

## En tête

**Branche** : `lot/pratique-en-usage`, partie de `origin/main` à `16360f43c` (1.253.0). Arbre : `../labo-codex-pratique-en-usage`. Aucune PR : il n'y a pas de code à regarder.

### Point A — les voies qui écrivent une pratique existante (lu dans le code, sur main)

Trois écrans écrivent les règles d'une pratique déjà enregistrée. Aucune de ces voies ne demande quoi que ce soit avant d'écrire, sauf la question du retrait d'une cible qui porte des niveaux inscrits.

| Écran | Voie | Quand elle écrit |
|---|---|---|
| Assistant, en modification | Le dernier bouton (« Appliquer à la pratique ») : la pratique entière est réécrite sous la même identité | Au bouton seulement ; « Annuler » n'écrit rien |
| Assistant, « Par standards » | L'ensemble de cibles est réécrit sous la même identité, avant la pratique | Au même bouton |
| Fiche (Conception › Pratiques) | Dix champs du formulaire (nom du type, échelle, grille, seuils, portfolio, double seuil, notes finalisées, cibles de la dénotation…) passent par une seule fonction | Au fur et à mesure, à chaque champ quitté |
| Fiche | Nom, description, discipline (deux jeux de fonctions : l'actuel et un plus ancien) | Au fur et à mesure |
| Fiche, spécifications | Types de productions : ajouter, modifier, supprimer ; forfaits : ajouter, modifier, modifier un travail, supprimer (sept fonctions) | Au fur et à mesure |
| Fiche, sélection de productions | « Cette production compte » (une case par production) | À chaque case |
| Vue simple, écran Pratique | Les niveaux de l'échelle, la règle (sélection de productions), les spécifications, « cette colonne compte » : une seule fonction d'écriture, quatre appelants | À chaque geste |
| Vue simple, « Par standards » | Les cibles (renommer, ajouter, retirer) : l'ensemble est réécrit | À chaque geste |

À part, et hors du verrou : ce qui crée (assistant, adoption, duplication, import, partage), ce qui retire ou supprime une pratique, et quatre migrations de démarrage (jetons manquants, établissement, drapeau de bibliothèque) qui réécrivent la collection sans changer une règle de calcul.

**Total : environ vingt-cinq fonctions d'écriture, dans `js/wizard-pratique-v2.js`, `js/pratiques-gestion.js` et `js/vue-simple.js`. Il n'existe aucun point de passage commun.**

### Les deux verrous à imiter (lu)

- **Évaluations** : le verrou est enregistré sur l'évaluation. Elle s'ouvre en lecture seule ; « Déverrouiller » est un seul bouton dont le libellé suit l'état ; une notification dit ce qui vient de changer.
- **Présences** : le verrou est enregistré par date ; « Verrouiller la saisie » / « Déverrouiller la saisie », un seul bouton.

Les deux s'enregistrent. Une pratique en usage aurait donc un déverrouillage qui s'enregistre lui aussi, jusqu'à ce qu'on la reverrouille. C'est ce que je proposerais ; ce n'est pas tranché.

### « En usage » : la définition que je proposerais

Une pratique est en usage quand **au moins un groupe-cours la désigne** (`groupesCours[].pratiqueId`) **et que ce groupe a des résultats**. Ce qui compte comme résultat, par famille :

| Famille | Un résultat, c'est |
|---|---|
| Sommative, sélection de productions, spécifications | Au moins une évaluation enregistrée pour un·e étudiant·e du groupe |
| Par standards | Au moins une inscription non annulée sur l'ensemble de cibles de la pratique, pour un·e étudiant·e du groupe |
| Dénotation | Au moins une note finale posée, ou une cible confirmée, pour un·e étudiant·e du groupe |

Une pratique désignée par un groupe encore vide reste libre : on la règle en début de session sans verrou.
**Ce que « résultat » veut dire en dénotation touche la pédagogie : à confirmer par Grégoire.**

### Pourquoi je n'ai pas bâti

**Ce lot s'appuie sur deux lots qui attendent le regard de Grégoire, et qui touchent les mêmes fichiers.**

1. « Enregistrer comme nouvelle pratique » doit donner à une « Par standards » son propre ensemble de cibles, copié, sans les inscriptions. Cette copie existe déjà, éprouvée : `EnsemblesCibles.emporter` et `deposer`, sur `lot/pratique-std-voyage` (PR 48). Sur `main`, elle n'existe pas. Partir de `main`, comme le mandat le demande, voudrait dire l'écrire une seconde fois.
2. Le bouton et la ligne des groupes se posent dans l'assistant, que `lot/modele-par-standards` (PR 52) vient de modifier, et que deux autres sessions modifient aussi (`lot/comparateur-synthese`, `lot/retirer-guides-pratiques`). La fiche, elle, est modifiée par la PR 48.
3. Le verrou doit couvrir les vingt-cinq voies ou aucune : un verrou qui en oublie une promet une protection qu'il ne donne pas. C'est un lot long, à faire sur une base qui ne bouge pas sous lui.

La règle du projet du 8 août (« deux sessions parties du même commit ont livré deux 1.55.0 ») s'applique : quatre branches partent déjà de `16360f43c`.

### Le découpage que je proposerais, une fois la base arrêtée

| Lot | Contenu | Risque |
|---|---|---|
| 1 | La définition « en usage » (un module pur, lecture seule) et la ligne qui nomme les groupes, dans l'assistant en modification et sur la fiche. Le libellé du bouton (point E), proposé | Faible : rien n'est empêché, rien n'est écrit |
| 2 | « Enregistrer comme nouvelle pratique » dans l'assistant, avec la copie de l'ensemble pour « Par standards » | Moyen : dépend de la PR 48 |
| 3 | Le verrou : les vingt-cinq voies, les champs en lecture seule dans les trois écrans, le déverrouillage qui nomme les groupes | Élevé : c'est le cœur, et il se fait d'un bloc |

### Mesuré, lu, non vu

**Lu** : tout ce qui précède, dans le code de `main`. **Mesuré** : rien n'a été joué. **Non vu** : aucun écran.

### Trouvaille

| Trouvaille | Statut | Disposition |
|---|---|---|
| « Dupliquer » une pratique « Par standards » depuis la fiche (`dupliquerPratiqueMateriel`) copie la pratique sans son ensemble : la copie et l'original partagent les mêmes cibles. Déjà notée au rapport du voyage | Lu | Inscrire (issue 2) ; le lot 2 ci-dessus la corrige au passage |
