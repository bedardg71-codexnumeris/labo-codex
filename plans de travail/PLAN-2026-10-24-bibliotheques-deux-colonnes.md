# Plan – Les bibliothèques en deux colonnes (24 octobre 2026)

> Écrit par Cowork le samedi 24 octobre 2026 vers 20 h (Toronto), sur `main` = `914a0d31`.
> Né de l'audit `AUDIT-2026-10-24-apparence-des-bibliotheques.md` (captures dans `captures-2026-10-24-audit-bibliotheques/`) et de l'ébauche 1 : https://claude.ai/artifact/Ei1tPHTr1egbRmdTUR7jTm, copiée dans le dépôt sous `MAQUETTE-2026-10-24-bibliotheque-deux-colonnes.html` (à ouvrir dans un navigateur : les boutons répondent, rien n'est enregistré).
> **Le codage est fait par Claude Code** (Grégoire, 19 h 50). Cowork rédige les consignes, relit, rend les verdicts.
> ⏸ **En attente, rien n'est lancé** (Grégoire, 19 h 59) : beaucoup de lots attendent déjà, et une seule session de Claude Code travaille à la fois. Le chantier est inscrit dans la page du tri, en troisième place de « Ensuite, dans l'ordre », avant la refonte de l'Aide. Il se lance en collant la ligne de la consigne du lot 1.

## Les décisions de Grégoire (24 oct.)

- 19 h 40 : « oui » à l'ébauche sur le principe des deux colonnes, à partir de la bibliothèque des grilles.
- 19 h 49 : « cette simplification est vraiment très efficace. »
- 19 h 50 : « je les garde », **les mots, mot pour mot** :
  - les colonnes : **« Dans ce trimestre »**, **« Dans ta bibliothèque »** ;
  - le passage : **« Garder dans ma bibliothèque → »**, **« ← Utiliser dans ce trimestre »** ;
  - dans ⋮ : **« Retirer de ce trimestre »**, **« Supprimer de ma bibliothèque »**.
- Les autres textes de l'ébauche (les phrases sous les colonnes, « Tout garder dans ma bibliothèque », « Importer ou exporter ▾ », « ✓ Aussi dans ta bibliothèque », « ✓ Déjà dans ce trimestre ») ont été **vus** par Grégoire dans l'ébauche, pas validés un à un. On les reprend tels quels ; tout écart passe par la demande de relecture, et Cowork le soumet à Grégoire.

## Ce que la mesure a établi (commandes rejouables)

1. **Six bibliothèques rangent leur colonne de gauche par trimestre** : productions, grilles, échelles, cartouches, pratiques, cartes d'alignement.
   `grep -n "^| \`\(productions\|grillesTemplates\|echellesTemplates\|pratiquesConfigurables\|planification_mindmap\)\`" docs/DATA-OWNERSHIP.md` (toutes NS) ; les cartouches : `docs/DATA-OWNERSHIP.md` l. 72 (`cartouches_[grilleId]`, NS depuis D1) et `js/cartouches.js` l. ~3721 (`cle(\`cartouches_${grille.id}\`)`).
2. **Deux bibliothèques ont deux endroits, mais pas par trimestre** :
   - les cours : `cours` est global (`DATA-OWNERSHIP.md` l. 121) ; les deux sections sont la même liste, partagée par un drapeau (`js/cours.js` l. ~296-298 : `dansBibliotheque !== false` / `=== false`) ;
   - les tampons : `tamponsPersonnalises` est global (`DATA-OWNERSHIP.md` l. 151) ; « Mes tampons » est la palette d'Annoter.
   ⮕ « Dans ce trimestre » y serait **faux**. Leurs mots de colonne attendent Grégoire, au lot 5.
3. **Deux bibliothèques n'ont qu'une liste** : trimestres (`js/trimestre-v2-liste.js` l. ~281) et groupes-cours (`js/trimestre-v2-groupes-cours.js` l. ~1087).
4. **Les dix fenêtres passent par `BibliothequeUI.creerModal`** (`js/bibliotheque-ui.js` l. ~1361), qui reçoit de chaque module des fragments HTML tout faits avec des styles en ligne : `grep -n "BibliothequeUI.creerModal(" js/*.js`. C'est la source de la cacophonie (audit, « Une cause commune »).
5. **Prendre une grille de la bibliothèque crée un nouvel objet dans le trimestre** (`ajouterGrilleIndividuelle`, `js/grilles.js` l. ~2569 : nouvel `id`, `idOriginal` = la source). La bibliothèque est un magasin séparé (`CLE_BIBLIOTHEQUE_GRILLES`, `js/grilles-bibliotheque.js` l. 26).
6. **Une rangée du trimestre porte aujourd'hui TROIS gestes, pas deux** (`js/grilles.js`, `preparerDonneesBibliothequeGrilles`) :
   - « Retirer » → `retirerGrilleDeBibliotheque` : pose `dansBibliotheque = false` sur la grille du trimestre ; elle quitte le menu de l'écran, **ses données restent** ;
   - « Supprimer » → `supprimerGrilleDefinitivement` : supprime la grille du trimestre (porte de sortie) **et** la retire de la bibliothèque ;
   - et, côté bibliothèque, « Supprimer » → `supprimerGrilleDeBibliothequePartagee` (codex proposé, confirmation).
   ⮕ **Supposition de Cowork, à confirmer par la demande de relecture du lot 1** : « Retirer de ce trimestre » nomme le premier ; « Supprimer de ma bibliothèque » nomme le troisième ; le deuxième garde son libellé existant, « Supprimer définitivement » (déjà dans l'app, en `title`), en rouge, dans ⋮.
7. **Une vingtaine de bancs touchent la fenêtre de bibliothèque** : `grep -rlE "modalBibliothequeGrilles|afficherBibliothequeGrilles|Ajouter à ma sélection|biblio-carte|renderCarteSelection|renderCarteDisponible|Grilles dans ta sélection" tests/integration tests/unit` (20 fichiers le 24 oct.), dont les sentinelles #291 (doublons), #458, #468, #476 (garde d'identité), #793.

## Le principe technique (décidé par Cowork)

**Le composant impose la structure ; les modules ne fournissent plus que des données.** Un nouveau point d'entrée dans `js/bibliotheque-ui.js` (nom au choix de Claude Code) reçoit : le titre, l'aide, les gestes du menu « Importer ou exporter », et pour chaque colonne son titre, sa phrase et ses rangées (nom, ligne en clair, aperçu, geste de passage ou état calme, gestes de ⋮). Il rend tout avec des classes de `styles.css` et les jetons des deux modes, **sans style en ligne**. Les fonctions de données des modules ne changent pas.

`creerModal`, `renderCarteSelection` et `renderCarteDisponible` restent tant qu'une bibliothèque s'en sert, et **partent au dernier lot qui migre** (zéro dette).

## Les lots, dans l'ordre

| Lot | Ce que l'utilisateur voit | Fiche | État |
|---|---|---|---|
| 1. Le composant et les grilles | Conception › Grilles de critères › « Consulter la bibliothèque » : la fenêtre de l'ébauche, deux colonnes, rangées compactes, aperçu des critères, « Importer ou exporter ▾ », dossiers et « Masquer » en haut de la bibliothèque. Les neuf autres fenêtres ne changent pas. | #1154 | **codé, en relecture** (25 oct., Claude Code) : `ae34b7cd` sur la branche `bibliotheques-deux-colonnes` ; demande `DEMANDE-RELECTURE-2026-10-25-bibliotheques-deux-colonnes-1.md` ; captures `captures-2026-10-25-bibliotheques-deux-colonnes-1/` |
| 2. Échelles et cartouches | Les mêmes deux colonnes. Les cartouches gardent leur regroupement par grille, en intertitres dans chaque colonne ; « Filtrer par grille » rejoint la barre de la bibliothèque. | #1155 | à cadrer après le verdict du lot 1 |
| 3. Productions et pratiques | Idem. L'encadré « Pour éditer une pratique, transfère-la… » disparaît : les deux colonnes le disent. À la fin du lot, l'aide « Comment fonctionne la bibliothèque » est réécrite (texte proposé par Claude Code, **validé par Grégoire**). | #1156 | à cadrer |
| 4. Cartes d'alignement | Idem (« Partager » devient le passage « Garder dans ma bibliothèque → » si la mesure confirme que c'est le même geste). | #1157 | à cadrer |
| 5. Cours et tampons | Deux colonnes, **avec d'autres mots que « Dans ce trimestre »** : à proposer par Cowork et **à valider par Grégoire avant la consigne** (mesure n° 2). | #1158 | attend Grégoire |
| 6. Trimestres et groupes-cours, puis le retrait | Une seule liste, mais les rangées compactes, les couleurs et les mots communs : tutoiement (« Gérez » parti), ni « dropdown » ni emoji, « Actif » lisible. Mots proposés par Cowork, validés par Grégoire. **Puis le retrait** : `creerModal`, `renderCarteSelection`, `renderCarteDisponible`, le CSS `biblio-carte-*` orphelin. | #1159 | à cadrer |

**Pourquoi cet ordre** : le lot 1 éprouve le composant sur une seule fenêtre, celle de l'ébauche ; les lots 2 à 4 sont les cinq autres bibliothèques par trimestre, que les mots validés couvrent sans question ; le lot 5 attend des mots ; le lot 6 ferme le chantier en retirant l'ancien.

**La livraison** : pas de release avant la fin du lot 3, pour que les six bibliothèques de la Conception changent ensemble (sinon, pendant quelques jours, deux grammaires cohabitent dans le même onglet). Le moment reste celui de Grégoire (règle 7). Chaque lot dépose ses captures (Mac 1440 clair et sombre, iPad 820) : c'est par elles que Grégoire voit l'avancement avant la mise en ligne.

## Les règles qui valent pour tous les lots

- **Un seul lot à la fois** dans `js/` : le lot 3b des chaînes d'étapes et la refonte de l'Aide (#1152) touchent aussi `styles.css`, `index.html` et des modules voisins.
- **Aucun geste neuf, aucun geste perdu** : chaque geste d'aujourd'hui retrouve une place (passage, ⋮, menu de l'en-tête, barre de la bibliothèque) et garde son action ; seuls la place et le libellé changent.
- **Aucune donnée écrite autrement** : les fonctions de données, les clés de stockage, la garde d'identité (#476) et la clé de préférence `biblio-masquer-deja-present` ne changent pas. Un chemin d'écriture modifié : on s'arrête et on le dit.
- **Les bancs se réancrent délibérément**, motif écrit dans le fichier de test, jamais ajustés pour repasser au vert ; un banc réancré prouve qu'il peut encore échouer (break-test).
- Pas de badges de code (HOLIS, STD…), pas de puce d'identifiant hors doublon signalé, pas de « (s) », pas d'emoji ; le tutoiement partout.

## Hors du plan

- La rangée de sélection au-dessus de la fiche, et les chaînes d'étapes (plan du 24 oct. midi).
- Les confirmations de « Retirer » et « Supprimer » : elles restent ce qu'elles sont. Les confirmations dans la rangée de l'ébauche étaient illustratives.
- Ce que la mesure n° 6 laisse ouvert (une grille retirée qui n'est pas dans la bibliothèque réapparaît-elle quelque part ?) : à mesurer au lot 1, et à inscrire s'il y a un défaut, pas à corriger dans ce chantier.
