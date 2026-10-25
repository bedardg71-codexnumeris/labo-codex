# Demande de relecture – « + Nouvelle cartouche » renommait la cartouche ouverte ; changer la grille d'une cartouche la dédoublait (#1153, source de #1144)

> Claude Code, samedi 24 octobre 2026, 21 h 35. Consigne : `CONSIGNE-LOT-2026-10-24-cartouche-nouvelle-renomme.md`.
> Parti de `998e73c1` (le lot 3b commité, `main` à jour, aucune suite en cours ; fichiers du § 3 non touchés par une autre session). Commit de docs `83b40784`, puis le commit du lot.
> **Ni release, ni verdict Playwright complet, ni push** : au signal de Grégoire.

## 1. Les trois essais, rouges avant correctif (WebKit, noms fictifs)

`tests/integration/cartouche-nouvelle-renomme-1153.spec.js`. Une cartouche « Cartouche témoin » sous la grille A (deux critères, huit commentaires, un contexte), une grille B qui partage un critère par l'id (Structure) et un par le nom seulement (Langue), plus un critère à elle (Style).

| Cas | Avant le correctif (mesuré) | Deux copies ? |
|---|---|---|
| (a) même grille | La matrice « neuve » montre les huit commentaires de l'ouverte. « Créer » **renomme** l'ouverte (« Cartouche neuve ») et **efface son contexte**. Aucune cartouche neuve. | Non : une seule, abîmée. |
| (a) autre grille | La question « Changer de grille va reconfigurer la matrice » paraît en pleine création. « Créer » écrit `CART_NR` sous la clé de B, avec ses huit commentaires aux ids de A ; l'originale reste sous A. | **Oui** : même id sous deux clés. |
| (b) changer la grille d'une cartouche ouverte | La question paraît, puis **rien n'est écrit**. En modification, il n'y a pas de bouton « Créer », et l'enregistrement automatique refuse d'écrire une cartouche absente de la nouvelle clé. La fiche reste hors de toute clé ; une frappe s'y perd (l'avertissement de #573 le dit). | Non. |

**Sur l'hypothèse de Cowork** : (a)-autre grille reproduit le mécanisme (1) de #1144, avec le même id sous deux clés, le `grilleId` changé, les commentaires non remappés et la source non retirée. (b) ne le reproduit pas à lui seul. ⚠ **Ce qui n'est pas reproduit** : sur ce chemin, la copie porte les critères de la grille choisie (ils sont relus sur la grille), alors que les deux copies mesurées chez Grégoire portaient les mêmes critères, ceux de G4H. J'ai écarté une piste : une grille dupliquée garde-t-elle les ids de ses critères ? Non, `dupliquerGrille` leur donne des ids neufs. Un second geste ou un état plus ancien reste possible. La ligne #1144 de `SUIVI-BUGS.md` le dit : (1) fermée, avec cette réserve écrite ; (2) toujours ouverte.

## 2. Ce que le lot change (`js/cartouches.js`)

1. **`creerNouvelleCartouche`** remet `cartoucheActuel` (et `window.cartoucheActuel`) à `null`. La matrice s'ouvre vide, sur un id neuf.
2. **`traiterChangementDeGrilleCartouche`** (sortie de `onChangeSelectionCartouche`, qui serait sinon passée de 14 à 20 en complexité) :
   - Cartouche **enregistrée** (`cartoucheEstEnBase`) : les mots du `confirm` sont ceux de la consigne. On appelle ensuite `copierCartouchePourGrille`, qui écrit la copie par la file (`modifierEtAnnoncer`, geste « Copier la cartouche »), rafraîchit le menu, puis ouvre la copie. Si l'on refuse ou si la copie échoue, le menu de la grille revient à l'originale.
   - Cartouche **en création** : la question et le comportement d'avant, inchangés.
3. **`forgerCopieCartouchePourGrille`** (pure, exportée pour Vitest) :
   - l'id neuf ;
   - `grilleId` = la grille choisie ;
   - les commentaires par `cartoucheCorrespondance.rattacher` (par id, puis par nom ; rien de jeté) ;
   - `idOriginal` retiré (#586, comme `dupliquerCartouche`) ;
   - les dates de création et de modification posées à maintenant.
4. `initialiserNouveauCartoucheAvecEchelle` n'a pas changé de code. Seul son commentaire dit maintenant quelles fiches y arrivent.
5. `sauvegarderCartouche` n'a pas changé : avec la remise à zéro, « Créer » écrit bien un id neuf.

`?.id || genererIdUnique` : revérifié par `grep`, une seule occurrence dans `js/`, celle-ci.

## 3. Les décisions que j'ai prises seul (à valider)

1. **La copie porte TOUS les critères de la grille choisie**, dans son ordre, puis ceux de l'originale restés sans correspondant. `rattacher` ne rendait que les critères de la source. La matrice ayant une ligne par critère de la cartouche, la copie n'aurait eu **aucune ligne pour « Style »**, le critère propre à B (mesuré : l'essai butait sur la case absente). C'est aussi la forme qu'aurait une cartouche neuve créée sur B.
2. **Le nom** : celui de l'originale est gardé, sauf s'il est déjà pris sous la grille choisie (même normalisation que `normaliserNom`). La copie reçoit alors le nom que donne `nommerCopie`. On n'écrase rien et on ne crée aucun homonyme (piège 2, mesuré dans l'essai 4).
3. **`metadata_cc` gardé** : la copie reste l'œuvre de la même autrice ou du même auteur. `dupliquerCartouche` le retire, parce qu'il en fait « un original de l'utilisateur » avec `inspireDe` ; ici, c'est la même cartouche portée sur une autre grille. À trancher si Cowork lit autrement la règle CC.
4. **Quand `rattacher` n'est pas sûr** (deux critères visent le même critère cible, ou des clés se superposeraient), la copie n'est pas faite et une alerte le dit. **Ces mots sont les miens, à relire** : « La copie n'a pas été faite : des commentaires de cette cartouche se superposeraient dans la grille choisie. L'originale reste telle quelle. »
5. Le libellé du témoin d'enregistrement, « Copier la cartouche », est aussi le mien.

## 4. Les pièges du § 4

1. **Stock** : rien n'est écrit chez qui que ce soit. Chez Grégoire, la copie du mécanisme (1) est déjà rangée (console `CartouchesDecalees`, 24 oct. au matin).
2. **Doublon de nom** : la copie ne passe pas par `sauvegarderCartouche`, donc ni question ni écrasement. Avec un homonyme sous B, il reste intact à l'octet près, et la copie prend un nom de copie (essai 4).
3. **La chaîne** suit la fiche neuve et la copie. Après la copie, son étape « Grille » lit les 3 critères de B (essai 3). Le cas de la fiche neuve est déjà couvert au lot 3b.
4. **Les productions** qui portent l'originale la gardent : la production est identique avant et après (essai 3).
5. **Sécurité** : aucun `innerHTML` ajouté, aucun handler inline, aucun `console.log`.

## 5. Preuve

- **Playwright** (`cartouche-nouvelle-renomme-1153.spec.js`, 5 essais) : 4 rouges avant, 5 verts après. Le cinquième (une cartouche en création change simplement de grille) est vert avant comme après : il garde l'ancien comportement.
  - Copie de (b) : un id neuf ; l'originale identique à l'octet près, avant et après, même après une frappe dans la copie ; les commentaires de Structure (par l'id) et de Langue (par le nom) sont dans la copie ; la fiche ouverte est la copie, et le menu la montre.
  - « + Nouvelle » ouvre une matrice vide (8 cases sur A, 12 sur B).
- **Vitest** (`cartouche-copie-pour-grille-1153.test.js`, 5 essais) : la fonction pure.
- **Break-test** : 8 mutations, toutes attrapées. Les deux de M2 ont été rejouées après l'extraction.

| Mutation | Attrapée par |
|---|---|
| M1, sans la remise à zéro | Playwright, 3 rouges |
| M2, `cartoucheEstEnBase` remplacé par `true` | Playwright, 1 rouge |
| M2, `cartoucheEstEnBase` remplacé par `false` | Playwright, 2 rouges |
| M3, sans les critères de la grille | Vitest et Playwright |
| M4, sans le renommage de l'homonyme | Vitest et Playwright |
| M5, sans le clonage | Vitest |
| M6, sans le retrait d'`idOriginal` | Vitest |
| M7, sans le refus quand le rattachement n'est pas sûr | Vitest |

- **Vitest complet** : 818 fichiers, 9 661 tests verts.
- **Deux cliquets suivis** :
  - `sentinelle-522`, C.b : 12 → 13 écritures par la file, la treizième étant la copie, motif écrit.
  - `sentinelle-contenir-complexite` : reste à 447, grâce à l'extraction plutôt qu'à une hausse du cliquet.
- **Bancs Playwright voisins** (les 21 specs cartouches, chaînes, lot E1, menu des bibliothèques, paliers, nouvelle fiche après exemple) : 108 verts, 1 instable. Il s'agit d'un `page.goto` en retard sur l'essai des échelles du lot 3b, vert à la reprise, sans lien avec ce lot.
- **Pas de verdict Playwright complet** : il attend le signal de Grégoire.

## 6. Ce que je demande à Cowork de relire

Le § 3 : les cinq décisions, surtout les critères complets de la copie (1) et `metadata_cc` (3). Les mots de l'alerte de refus (4) remontent à Grégoire s'ils doivent changer.
