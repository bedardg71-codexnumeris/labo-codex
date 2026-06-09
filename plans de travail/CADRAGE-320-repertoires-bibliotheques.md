# Cadrage #320 — Répertoires de classement dans les bibliothèques

> **Statut** : cadrage (conception), 9 juin 2026. Décisions par défaut prises avec Grégoire ;
> à valider avant d'écrire le Lot 0. Auteur du cadrage : Claude Code.
> **Origine** : idée Grégoire (5 juin, réflexion Comparateur — `NOTE-COWORK-comparateur-pratiques.md` q.7).
> L'enseignant accumule ses essais de pratiques dans la bibliothèque ; il veut **créer des
> répertoires** pour les classer (ses hypothèses, les pratiques reçues de collègues, etc.).
> « Même chose dans toutes les bibliothèques d'ailleurs. »

---

## 1. Objectif

Permettre à l'utilisateur de **créer des répertoires (dossiers)** pour ranger les items d'une
bibliothèque, et de **voir les items regroupés par répertoire** à l'affichage. Le classement est
une commodité d'organisation — il **ne change ni la valeur, ni la visibilité, ni le contenu** des
items.

## 1bis. Pour qui — généricité (clarifié 9 juin)

Fonctionnalité destinée à **tout utilisateur de Labo Codex**, pas au développeur en particulier.
Labo Codex étant **mono-utilisateur par instance** (pas de comptes ni de serveur — chaque
enseignant a sa copie locale), « pour tous les utilisateurs » signifie : **chaque instance
dispose du système de rangement, chaque enseignant crée ses propres répertoires.**

Exigences de généricité (conformes au principe « outil pluraliste, rien de la pratique perso de
Grégoire codé en dur ») :

- `repertoiresBibliotheques` **vide au premier lancement** — page blanche, l'utilisateur nomme ses
  dossiers librement.
- **Aucune catégorie codée en dur** (pas de « SOM/STD/SPE », pas de structure système imposée). Les
  noms cités dans ce doc (« Essais SOM », « Reçues de collègues ») sont des **exemples**, pas des
  valeurs livrées.
- Seul groupe non créé par l'utilisateur : « Non classées » — neutre, purement calculé.
- **Mode démo** : *(à confirmer)* un unique répertoire d'exemple dans le pack démo pour rendre la
  fonctionnalité visible aux expérimentateurs ; zéro au premier lancement réel.

## 2. Décisions actées (par défaut, à valider)

| Décision | Choix | Justification |
|---|---|---|
| **Sémantique** | **Dossiers exclusifs** — 1 item dans au plus 1 répertoire | Sens premier de « répertoire » ; UX et stockage plus simples ; regroupement visuel sans recoupement |
| **Périmètre initial** | **Pratiques de notation** | Origine de l'idée ; architecture pensée transversale pour étendre ensuite |
| **Stockage** | **Collection séparée** `repertoiresBibliotheques`, jamais un champ sur l'item | Respecte `SKILL_integrite_globaux` : on ne greffe pas de métadonnée de classement sur des items globaux partagés (sources hétérogènes) |
| **Portée du classement** | Le **pool** de la bibliothèque (pratiques personnalisées), pas la sélection active | C'est là qu'on accumule les essais à ranger |
| **Versionnage** | `minor` (nouvelle fonctionnalité) | — |

## 3. État du terrain (cartographie)

- **Clé à classer** : `bibliothequePratiques` (GLOBALE, non namespacée — `js/pratiques-bibliotheque.js:20`).
  Tableau de pratiques personnalisées. Items au schéma commun `{id, nom, auteur, isDemo, inspireDe,
  dansBibliotheque, description}`.
- **Ne PAS classer** : les gabarits prédéfinis (`MODELES_PRATIQUES_PREDEFINIS`, en dur) ni
  `pratiquesConfigurables` (namespacé, pratiques actives du trimestre).
- **Points d'itération de l'affichage** (modale biblio pratiques) : gabarits filtrés
  (`pratiques-bibliotheque.js:1003`) puis personnalisées filtrées (`:1012`). Le regroupement par
  répertoire s'insère sur **les personnalisées**.
- **Fonctions de retrait** d'une pratique de la biblio : `~:668-706` — c'est là que doit se brancher
  le nettoyage de cohérence (retirer l'id des répertoires).
- **Module partagé** : `js/bibliotheque-ui.js` rend les cartes (`renderCarteDisponible:636`,
  `renderMenuActions:509`) et gère déjà un **regroupement par discipline** (sous-titres `h4`) côté
  pool — modèle à réutiliser pour les en-têtes de répertoire.
- **Aucune notion de dossier/tag** n'existe aujourd'hui. Pas de recherche par nom.

## 4. Modèle de données

Nouvelle clé **globale** `repertoiresBibliotheques` (cohérent avec des biblios globales — un essai
classé le reste quel que soit le trimestre actif) :

```js
[
  {
    id: 'rep_1780000000000',   // id stable, généré (jamais Date.now() dans un test)
    nom: 'Essais SOM',          // libellé utilisateur (échappé à l'affichage)
    biblio: 'pratiques',        // discriminant pour l'extension transversale future
    itemIds: ['prat_abc', 'prat_def'],  // ids d'items de bibliothequePratiques
    ordre: 0                    // ordre d'affichage des répertoires
  }
]
```

**Invariants** (maintenus à l'écriture, vérifiés par sentinelle) :

1. **Exclusivité** : un `itemId` apparaît dans **au plus un** répertoire de la même `biblio`.
   L'assignation retire l'id de tout autre répertoire avant de l'ajouter.
2. **Non-destruction** : `bibliothequePratiques` et ses items ne sont **jamais** modifiés par le
   classement. Supprimer un répertoire ≠ supprimer ses items (ils repassent en « Non classées »).
3. **Tolérance aux orphelins** : un `itemId` qui ne correspond plus à aucune pratique (item supprimé
   hors hook) est **ignoré à l'affichage**, pas une erreur.
4. **Groupe virtuel** « Non classées » : non stocké ; calculé = items du pool absents de tout
   `itemIds`.

## 5. Conformité `SKILL_integrite_globaux` (checklist 4 points)

- **2.1 Collision d'IDs** : `repertoiresBibliotheques` est une clé neuve → aucune collision. Les
  `itemIds` référencent des ids existants ; les ids de répertoire sont préfixés `rep_`.
- **2.2 Flags** : le classement **ne filtre jamais la visibilité**. Les seuls filtres de visibilité
  restent `filtrerParModeDemo` et `dansBibliotheque`. On range **par identité** (itemIds), jamais par
  flag posé sur l'item.
- **2.3 Type** : `repertoiresBibliotheques` = tableau d'objets ; unique lecteur = l'affichage biblio.
  Écriture explicite d'un tableau.
- **2.4 Réversibilité** : opération non destructive (on ne touche pas aux items). Aucun snapshot
  requis ; supprimer un répertoire est réversible de fait (les items restent).

## 6. UX (au périmètre pratiques)

- **Gérer les répertoires** : petite zone en tête de la modale biblio pratiques — créer (champ nom +
  bouton), renommer, supprimer. Style du design-system (variables CSS, 2 modes).
- **Affichage groupé** : pratiques personnalisées rendues sous des en-têtes de répertoire (réutilise
  le pattern `h4` de la discipline) + groupe « Non classées ». Les gabarits prédéfinis restent dans
  leur section actuelle, inchangés.
- **Assigner** : via le menu ⋮ de chaque carte → « Classer dans › [répertoires] / Nouveau… /
  Retirer du répertoire ». (`renderMenuActions` accepte déjà des actions `data-action`.)
- **Filtre** (optionnel, Lot 3) : sélecteur « Répertoire : [Tous / … ] » en tête, comme le filtre
  discipline existant.
- **Hors v1** : glisser-déposer (plus complexe, et fragile sur iPad — cible tactile/scroll).

## 7. Découpage en lots

| Lot | Contenu | Test |
|---|---|---|
| **L0** | Modèle + CRUD pur dans `pratiques-bibliotheque.js` : `creer/renommer/supprimer` un répertoire, `assigner/retirer` un item (invariant exclusif + nettoyage orphelins). Hook de nettoyage dans les fonctions de retrait d'une pratique. Aucune UI. | Sentinelle Vitest : exclusivité + non-destruction + cohérence à la suppression d'item |
| **L1** | UI de gestion (créer/renommer/supprimer un répertoire) dans la modale biblio pratiques | Rendu (Playwright) |
| **L2** | Affichage groupé des personnalisées par répertoire + « Non classées » + action « Classer dans… » au menu ⋮ | Rendu |
| **L3** *(option)* | Filtre par répertoire + **généralisation transversale** : extraire un helper `bibliotheque-ui.js` réutilisable (groupage par répertoire) pour préparer grilles/échelles | Unit + rendu |
| **L4** | Validation terrain (Mac + iPad, 2 modes) + release `minor` | — |

## 8. Garde-fous

- `echapperHtml()` sur les noms de répertoire (donnée utilisateur) ; `data-action` (CSP, zéro handler inline).
- ≥ 1 test par lot (règle CLAUDE.md).
- Zéro-dette : pas d'alias, le classement ne duplique aucun filtre existant.
- Le classement ne touche jamais `bibliothequePratiques`.

## 9. Points à confirmer avant L0

1. **Gabarits prédéfinis** : non classables (en dur) — confirmer qu'on ne range que les pratiques
   personnalisées. *(reco : oui)*
2. **Clé globale vs par-trimestre** : `repertoiresBibliotheques` globale. *(reco : oui)*
3. **Sémantique** : dossiers exclusifs. *(reco par défaut retenue ; tags = refonte si besoin terrain)*

## 10. Extension transversale (au-delà du périmètre)

Le champ `biblio` et (au L3) le helper de `bibliotheque-ui.js` rendent l'extension aux autres
bibliothèques (grilles, échelles, cartouches, productions, planification, tampons) **additive** :
même collection `repertoiresBibliotheques`, nouveau `biblio: 'grilles'`, nouveaux points de greffe
dans le module concerné. Pas de refonte. À planifier comme chantiers distincts.
