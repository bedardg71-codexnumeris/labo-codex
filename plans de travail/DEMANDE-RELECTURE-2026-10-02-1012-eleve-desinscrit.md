# Demande de relecture – #1012, un élève supprimé ne revient plus par un ancien fichier

> Écrite par Claude Code le 2 octobre 2026, vers 12 h 50 (Toronto, mesurée par `date`), sur la consigne de Cowork de 11 h 28 (ouverte à 12 h 30).
> Branche locale `fix/1012-eleve-desinscrit`, partie de `main` à `cc3d92e6` (les fichiers de Cowork commités tels quels). **Ni release, ni push.** Version : 1.174.3, inchangée.
> Ce chemin écrit les données de l'usager : relecture croisée avant toute release (règle 2).

## Pour Grégoire, en trois lignes

- **Ce qui est codé** : quand tu supprimes un élève dans le Cadre, l'application garde son DA. Ensuite, un ancien fichier ouvert par « Ouvrir un Codex… » de Réglages › Données ne ramène plus rien de lui : ni sa fiche, ni ses copies, ni ses notes, ni ses présences, ni ses annotations. Le décrochage, l'inactivité et la réactivation ne gardent rien : l'élève reste dans ta liste.
- **Où un élève supprimé apparaît encore** : ses copies (la Liste des évaluations, en « Fichier non associé » ; le module Travaux, en « Inconnu » ; le PDF d'une copie), l'export recherche (anonymisé), et ton codex, qui garde tout. Ses notes, sa moyenne et ses présences ne s'affichent plus. Le détail est au § 5. Rien n'est corrigé.
- **Ce qui t'attend** : rien avant la relecture de Cowork. Ensuite, la ligne des « Nouvelles » (§ 10).
- **Ce que j'ai supposé** : si tu ajoutes de nouveau un élève supprimé à ta liste (même DA), il n'est plus écarté. Je considère qu'il est réinscrit (§ 3).

## 1 · D'abord

La consigne de Cowork et l'ancienne consigne archivée sont commitées telles quelles sur `main` (`cc3d92e6`, non poussé). `guide-alignement-actuel.md` et `Claude outputs/` (septembre) restent non suivis, hors de tout commit.

**Mesuré à l'ouverture** :
- Deux fonctions suppriment : `supprimerEtudiantV2` (`js/trimestre-v2-etudiants.js`, par `modifierEtAnnoncer`) et `supprimerEtudiant` (`js/groupe.js`, un `filter`).
- **`groupe.js` n'a plus de bouton** : son tableau `#students-tbody` n'existe pas dans `index.html`. Il n'écrit donc pas la trace ; c'est inscrit (issue 2).
- Le seul geste vivant est le menu « Supprimer » de la liste du Cadre.

## 2 · La trace

- **La clé** : `<trim>_elevesDesinscrits`, inscrite à `CLES_NAMESPACEES` (`js/trimestres.js`) et à `docs/DATA-OWNERSHIP.md`. C'est une liste de `{ da, date }` (date ISO).
- **Qui l'écrit** : seul `supprimerEtudiantV2`, et seulement si la fiche a bien été retirée (`supprime`). Si le DA est déjà dans la trace, la date est mise à jour.
- **Une écriture ou deux** : `db` n'écrit pas deux clés d'un même geste (pas de transaction à plusieurs clés). La trace est donc écrite **après** le retrait de la fiche, par `modifierEtAnnoncer` en mode `discret` : le témoin ne dit pas « Enregistré » deux fois, mais il dit l'échec. **Si la trace échoue, l'import se comporte comme avant** (l'élève peut revenir) ; jamais l'inverse. Avec l'ordre opposé, un échec du retrait aurait laissé une trace pour un élève toujours inscrit : ses notes d'un ancien fichier n'entreraient plus, sans rien dire.
- **Le voyage** : la trace part dans le codex (qui lit toutes les clés, sauf `_codex_*`) et dans l'export d'une sélection (qui prend les clés du préfixe du trimestre). Mesuré au banc : « Mettre à jour le codex » écrit la trace dans le fichier tenu.
- **Aucun mot neuf à l'écran.** La question « Supprimer X ? » est inchangée.

## 3 · La règle de l'import par cases

Avant toute fusion, pour chaque clé du fichier, le **trimestre de la clé** (son préfixe, celui que l'import écrit) donne les élèves écartés :

> écartés = DA de `<trim>_elevesDesinscrits` **qui ne sont pas** dans `<trim>_groupeEtudiants` de l'espace.

`ecarterElevesDesinscrits` retire alors du fichier :

| Famille | Écartée par |
|---|---|
| Étudiants | `da` |
| Présences | `da` |
| Notes | `etudiantDA` |
| Copies (« Fichiers travaux ») | `etudiantDA`, **avant** `_ajouterCopiesImportees` : la copie n'entre pas et son fichier n'est pas déposé au magasin. Une copie de l'élève déjà dans l'espace, sans fichier au magasin, ne reprend pas non plus le sien. |
| Annotations | `etudiantDA`, ou, si l'annotation ne porte pas de DA, la copie annotée (`fichierId` d'une copie de l'élève, dans le fichier ou dans l'espace) |

**Supposition (la mienne)** : un DA de la trace qui est de nouveau dans la liste n'est plus écarté. Un élève réinscrit (ajouté de nouveau, même DA) redevient un élève comme un autre. J'ai préféré cette règle, lue au moment de l'import, à un effacement de la trace par chaque geste d'ajout (formulaire, import de liste, import par cases). Elle ne touche aucun autre geste. Si Grégoire veut qu'un réinscrit ne récupère pas ses anciennes données, c'est une autre règle, et c'est à lui de la trancher.

**Ce qui reste de l'élève dans l'espace n'est pas effacé** (mesuré au banc : son évaluation et sa présence d'avant restent).

**Une valeur qui n'est pas une liste** (`evaluations` ou `notesEtudiants` en dictionnaire, deux clés sans lecteur) n'est pas filtrée. Elle n'entre que si l'espace n'a rien sous cette clé (règle des quatre cases).

## 4 · Ouvrir un codex entier (point 5 de la consigne)

Ouvrir un codex entier restaure un état complet, trace comprise. Un codex écrit **avant** la suppression ramène donc l'élève, puisqu'il ramène tout ce que l'espace avait ce jour-là, y compris une trace sans lui. C'est voulu : une restauration est un retour en arrière délibéré. Rien n'est touché.

## 5 · Où ce qui reste d'un élève supprimé apparaît encore (point 4 ; lu, non exécuté ; rien n'est corrigé)

La règle générale, lue dans le code : une vue qui part de la liste des élèves (`obtenirEtudiantsCoursActif()`, `groupeEtudiants`) ne le montre plus. Une vue qui lit une collection directement le garde.

| Lieu | Verdict | Lecture déterminante |
|---|---|---|
| Liste des évaluations, lignes de notes | disparaît | `js/liste-evaluations.js` ~927 (part des élèves) |
| Liste des évaluations, copies | **reste visible**, « Fichier non associé », DA brut | ~1106-1158 (#612, `etudiantManquant`) |
| Liste des évaluations, compteurs « N résultat(s) », « N productions » | **reste compté** (ces lignes de copies) | ~594-603 ; la moyenne, elle, disparaît |
| Tableau de bord : élèves, priorités, dépistage | disparaît | `tableau-bord-apercu.js`, `signalement-depistage.js` |
| Tableau de bord : seuils « en attente » du groupe | **reste compté** (toutes les présences et évaluations) ; effet faible | `tableau-bord-apercu.js` ~1649-1657 |
| Export recherche (`exporterFormatRecherche`) | **reste visible**, anonymisé | `trimestres.js` ~2095-2104 |
| CSV de synthèse des résultats finaux | disparaît | `export-resultats-finaux.js` ~131 |
| PDF d'une copie | **reste visible** (`dossier_<DA>_…`) | `travaux-export-pdf.js` ~798-863 |
| Codex | **reste** : tout est écrit | `codex.js` ~351-400 |
| Module Travaux, liste des copies | **reste visible**, « Inconnu » | `travaux-ui.js`, `travaux-stockage.js` ~425 |
| Saisie des présences | disparaît | `saisie-presences.js` ~1465 |

Ce que Grégoire attend, c'est que l'élève « disparaisse avec son dossier ». L'écart tient dans ses copies, dans l'export recherche, dans le codex et dans deux compteurs. Cet écart est inscrit sous #1012 (issue 2).

## 6 · Source et stock

Ce lot tarit la source pour les suppressions faites **après** lui. Avant, rien ne gardait la trace d'un élève supprimé : chez qui en a déjà supprimé, un ancien fichier peut encore le ramener, et rien ne permet de reconnaître depuis l'espace qui avait été supprimé. Rien n'est réparé, et c'est la limite que la consigne nomme.

## 7 · La preuve

- **Banc par le geste** (`tests/integration/codex-1012-ancien-zip-par-la-case.spec.js`, nouveau `describe`) :
  - **(5)** : un codex tenu, le trimestre `a2031` actif. Camille est supprimée par le vrai menu « Supprimer » de sa ligne dans le Cadre, la question acceptée. La trace porte son DA. Ensuite, un ancien `.zip` qui porte Camille et Bao, chacun avec une copie (et son fichier), une évaluation, une présence et une annotation ; une annotation de Camille sans DA, sur sa copie ; tout coché. **Rien de Camille n'entre ; tout de Bao entre ; un seul dépôt au magasin, celui de la copie de Bao** ; ce qui restait de Camille dans l'espace ne bouge pas. « Mettre à jour le codex » écrit la trace dans le fichier tenu. La trace survit à un rechargement.
  - **(6) témoins** : Camille en décrochage par le vrai menu « Remarque » : aucune trace n'est écrite. Le même fichier, tout coché : sa fiche de l'espace reste telle quelle (l'espace l'emporte), et sa copie, son évaluation, sa présence et ses annotations entrent, comme avant le lot. Ensuite, l'inactivité et la réactivation n'écrivent pas de trace non plus.
  - Les cinq essais d'avant du même spec restent verts (7 sur 7).
- **Vitest** (`tests/unit/import-1012-eleve-desinscrit.test.js`, 10 essais) : la règle des écartés (réinscription, DA numérique, trace illisible), chaque famille, l'annotation par la copie, la valeur qui n'est pas une liste. Deux verrous de structure : l'import écarte les cinq familles **avant** leur fusion ; seul `supprimerEtudiantV2` écrit la trace, après le `splice` et seulement si `supprime`.
- **Mutations** : douze, toutes rouges. Chaque fichier a été restauré par copie, et son empreinte vérifiée. Neuf rougissent le banc au navigateur ET Vitest ; M2 rougit Vitest seul (le banc ne joue pas de réinscription) ; M7, M11 et M12 rougissent le banc seul.

  | Mutation | Vitest | Navigateur |
  |---|---|---|
  | M1 · rien n'est écarté | rouge | rouge |
  | M2 · la réinscription est ignorée | rouge | vert |
  | M3 · « Supprimer » n'écrit pas la trace | rouge | rouge |
  | M4 · le décrochage écrit la trace | rouge | rouge |
  | M5 · l'annotation n'est plus écartée par sa copie | rouge | rouge |
  | M6 · copies non écartées | rouge | rouge |
  | M7 · clé retirée du registre (`cle()` la rend nue) | vert | rouge |
  | M8 · présences non écartées | rouge | rouge |
  | M9 · notes non écartées | rouge | rouge |
  | M10 · fiche non écartée | rouge | rouge |
  | M11 · les copies du fichier ne servent pas à écarter les annotations | vert | rouge |
  | M12 · trace lue au trimestre actif, pas au trimestre de la clé | vert | rouge |
- **Vitest complet** : 672 fichiers, 7 929 essais, verts.
- **Une sentinelle réancrée par ce lot** : `sentinelle-lot-D-735-743-750-assiduite-qui-manque` (g) lisait la ligne qui suit `parseValeur` dans la case « Étudiants ». Elle admet maintenant l'appel à `ecarterElevesDesinscrits`, qui est un `filter` et garde les fiches entières. Ce qu'elle vérifie ne change pas : la fiche voyage entière, sans liste de champs.
- **Bancs voisins, sans reprise** : `lot-i-bis-anciens-fichiers-s-ouvrent` et `import-cartouche-renommee-654`, 7 essais verts.
- **Pas pris** : la suite complète au navigateur (au verdict, avant un push).

## 8 · Écarts avec la consigne

1. **« Dans la même écriture que le retrait de la fiche »** : le mécanisme ne le permet pas. L'ordre retenu et sa raison sont au § 2.
2. **La réinscription** (§ 3) : la consigne ne la nomme pas. C'est ma supposition.
3. **`groupe.js`** : pas de bouton, donc pas de trace (§ 1).

## 9 · Ce qui reste inféré, ce qui n'est pas fait

- **Chrome et son vrai magasin** : le banc tourne dans WebKit, avec un magasin en mémoire.
- **Le mode anonymisation** : non joué au banc. La suppression lit le DA stocké (`e.da === da` sur la liste réelle), donc la trace porte le vrai DA (inféré).
- **L'aperçu de l'import** compte encore l'élève supprimé dans « N étudiant(s) » du fichier : il décrit le fichier, pas ce qui entrera. Le bilan, lui, ne compte que ce qui est entré.

**Mots qui pourraient venir, à ne pas poser sans Grégoire** : le bilan pourrait dire « N élève(s) désinscrit(s) écarté(s) ». Deux propositions :
- (a) « 1 élève supprimé de ta liste n'a pas été ramené. »
- (b) « Rien n'est revenu de 1 élève que tu avais supprimé. »

Ce lot ne pose ni l'une ni l'autre.

## 10 · Proposition pour les Nouvelles (à accepter par Grégoire)

Release `patch` (1.174.4) ; la ligne entre dans l'entrée 1.174 :

> **Un élève que tu supprimes ne revient plus par un ancien fichier.** Quand tu ouvres un ancien fichier par « Ouvrir un Codex… », rien de lui n'entre : ni sa fiche, ni ses copies, ni ses notes, ni ses présences, ni ses annotations. Cela vaut pour les élèves supprimés à partir de cette version ; le décrochage ne change rien.

## 11 · Inscriptions faites à `BACKLOG.md`

Sous #1012, dans le même commit que le lot : le lot codé ; `supprimerEtudiant` de `groupe.js` sans bouton ; le relevé du § 5.
