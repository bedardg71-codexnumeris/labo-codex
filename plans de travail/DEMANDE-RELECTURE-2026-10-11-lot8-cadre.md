# Demande de relecture – lot 8 : le Cadre, les petits défauts sans décision

> Claude Code, 11 octobre 2026, 9 h 17 (Toronto, `date`). Consigne : `plans de travail/CONSIGNE-DU-JOUR.md` (Cowork, 8 h 58, et fiche urgente de 9 h 13).
> **Branche `lot8-cadre`**, partie de `main` à `e24a2d0f` ; `main` n'a reçu aucun commit du lot. Huit commits, non poussés, pas de release (la mise en ligne de ce lot est prévue demain, à part).

## 1 · Ce qui change pour l'usager

- **« Recalculer les captures » ne perd plus les captures des interventions** (#1049, fiche urgente). Avant, un clic effaçait pour de bon les captures avant/après de chaque intervention RàI.
- Le **trimestre actif** n'offre plus « Clore », qui était toujours refusé (#1018). Sa carte n'a plus de menu ⋮.
- Au démarrage, quand le stockage du navigateur est presque plein (le cas de l'iPad), **la saisie des présences attend que le trimestre soit connu** : elle n'écrit plus dans des clés sans trimestre et retrouve ses élèves (#990).
- **« Fermer » un horaire** ne le rouvre plus en édition au retour dans le Cadre (#477).
- Un trimestre en double dans la liste n'apparaît plus deux fois dans le menu « Trimestre » du groupe-cours, et l'application ne réécrit plus cette liste à chaque lecture (#477).
- **Le nom d'un groupe-cours suit** le code de son cours et les séances de son horaire ; enregistrer un horaire ou un cours refait le menu, la carte et l'en-tête (#472).
- Le badge **« X/5 configurés »** ne compte plus un enseignant ou une pratique supprimés (#475).
- **Modifier le profil d'un collègue ne fait plus de lui « mon profil »** (#474).

**Aucun mot d'écran changé ni ajouté.**

## 2 · La remesure d'abord (fiches d'août)

Faite au code actuel, constat par constat, par un agent de lecture puis vérifiée aux sites cités (`plans de travail/AUDIT-cadre-trimestre-2026-08-20.md`). **Aucune fiche morte** : les six constats tenaient.

| Fiche | Constat | Au code actuel |
|---|---|---|
| #477 | CT-16 | tenait, sauf le toast « Modifications annulées » (disparu) |
| #477 | CT-19 | tenait, et plus large : un nom jumeau faisait réécrire et avertir à chaque `cle()`, sans jamais converger |
| #477 | CT-22 | tenait (relevés comptés sous l'id du groupe-cours ; clés « (sans trimestre)_… » lues) |
| #472 | CT-03 | tenait (nom figé ; aucun rafraîchissement ; l'en-tête recalculait déjà son propre libellé) |
| #474 | CT-10 | tenait ; aggravation lue au code (§ 5) |
| #475 | CT-14 | tenait pour l'enseignant et la pratique (cours et horaire déjà résolus) |

**#990** : reproduit sous WebKit seulement **avec le localStorage rempli** (sans cela, « trimestres » y revient avant l'initialisation et le banc reste vert sur le code d'avant). **#1049** : reproduit au banc sur le code d'avant (`interventions: []`).

## 3 · Ce qui est fait, commit par commit, et les suppositions

| Commit | Fiche | Ce qui change |
|---|---|---|
| `7b9d5bbd`, `ee231214` | #1018 | « Clore » retiré de la branche « actif » de `genererCarteTrim` ; le verrou des mots (#1002) compte un seul « Clore » |
| `927d9b5d` | #990 | `initialiserModuleSaisiePresences` par `window.auDbPret` (`js/main.js`) |
| `f587ee00` | #477 | `_fermerFormHoraireV2` oublie `horaireSelectionne` ; `obtenirTrimestres` et `enumererTrimestres` dédoublonnent par id **à la lecture**, sans réécrire ; menu « Trimestre » du groupe-cours par `obtenirTrimestres` ; diagnostic : relevé → cours de son groupe-cours ; recensement : préfixe vide pour une clé nue |
| `162cf991` | #472 | `nomGroupeCours(gc)` (pure, à partir des ids) pour l'aperçu et l'affichage ; `rafraichirAffichageGroupesCoursV2` après écriture ou suppression d'un horaire ou d'un cours |
| `697b378a` | #475 | `_enseignantExistePourGC`, `_pratiqueExistePourGC` |
| `59dd80ac` | #474 | marqueur `profilEnseignant.enseignantId` |
| `ae2c2976` | #1049 | la reconstruction vide les seules hebdomadaires ; `interventions` et `dernierSnapshotIntervention` restent ; dans la file de la clé |

Suppositions, une ligne chacune :
- **#477** : deux trimestres de même nom et d'ids différents sont deux trimestres (le dédoublonnage par nom est retiré). Les écrivains (créer, activer, clore) écrivaient déjà une liste dédoublonnée par id : inchangé. La mémoïsation de la fiche n'est pas faite : sans réécriture, le coût est celui d'un `filter`.
- **#477** : les autres lectures brutes de `trimestres` prennent le premier trouvé (`find`), comme le dédoublonnage ; seul le menu affichait la liste entière.
- **#472** : `gc.nom` s'écrit encore à l'enregistrement et sert de repli (`reserve.js` en extrait le code du cours) ; le libellé de l'en-tête, qui a son propre format, n'est pas touché.
- **#475** : le dénominateur reste 5 ; la pratique, « facultative » au formulaire, y compte encore (question de produit, non tranchée).
- **#475** : une pratique compte si elle est dans les pratiques du trimestre (ids legacy normalisés), au registre prédéfini ou au démo ; aucune instance construite.
- **#474** : sans copie, **le premier profil créé est celui de l'utilisateur** ; une copie d'avant ce lot désigne le profil de **même courriel**. Le marqueur ne s'écrit que par un geste qui écrivait déjà la copie, jamais au chargement.
- **#990** : un poste sans aucun trimestre garde son comportement (rien n'est lu « trop tôt » : il n'y a rien à lire).
- **#1049** : le correctif touche la seule reconstruction ; « Nettoyer » (`confirmerNettoyageSnapshots`) n'est pas mesuré dans ce lot.

## 4 · Les bancs, et ce qu'ils peuvent faire rougir

| Banc | Essais | Break-test |
|---|---|---|
| `trimestres-1018-clore-pas-sur-l-actif` (WebKit) | 1 | code d'avant → rouge (« Clore » trouvé sur l'actif) ; capture d'écran regardée |
| `presences-990-saisie-attend-db-ready` (WebKit) | 1 | code d'avant → rouge : avertissement, clé nue `calendrierComplet`, lignes manquantes (assertions souples, toutes lues) |
| `sentinelle-477-petit-lot-cadre` | 6 | code d'avant → 5 rouges (le témoin A.0 reste vert) |
| `sentinelle-472-nom-groupe-cours-recalcule` | 4 | code d'avant → 4 rouges ; la carte qui relit `gc.nom` → 2 |
| `sentinelle-475-badge-compte-sur-resolution` | 5 | code d'avant → 3 rouges ; registre neutralisé → 1 |
| `sentinelle-474-mon-profil-marque` | 4 | code d'avant → 3 rouges ; marque ignorée → 1 (essai 2 bis, ajouté parce que la règle du courriel couvrait les autres) |
| `sentinelle-1049-recalculer-garde-les-interventions` | 2 | code d'avant → rouge (`[]`) ; `dernierSnapshotIntervention` remis à null → rouge |

Vitest complet, depuis `tests/` : **716 fichiers, 8 546 essais verts**, aucune erreur hors essais. Bancs WebKit neufs et voisins (#749) verts ; pas de suite Playwright complète.

**Ordre des commits** : la fiche urgente est arrivée alors que #474 était fini et vérifié ; #474 a été commité juste avant elle. #1049 est le premier commit fait **après** la réception de la fiche.

## 5 · Ce qui revient à Grégoire (par Cowork)

- **#474, la purge** : effacer `profilEnseignant` quand on supprime ce profil. Non fait (suppression de donnée). ⚠ Lu au code, non reproduit : sans elle, `chargerProfilEnseignantV2` recopie la copie dans `enseignants` si son courriel n'y est plus. Un profil supprimé peut donc ressusciter au chargement suivant, avec un nouvel id.
- **#1049, le stock** : les captures d'intervention déjà effacées chez les utilisateurs ne se récupèrent pas (sauf depuis un codex ou une archive d'avant le clic).
- **#990, le stock** : les clés nues déjà écrites chez Grégoire ne sont pas nettoyées.

## 6 · Trouvailles

| Trouvaille | Issue |
|---|---|
| `--vert-principal` n'est défini nulle part : le badge « Actif » du trimestre est presque illisible (six fichiers l'emploient) | **Inscrite : #1050** |
| `archiverTrimestreActif` (`trimestre-v2-liste.js`) n'a aucun appelant | **Inscrire et continuer** : notée à #1018, pour #469 |
| `afficherSyntheseGroupeCours` (`trimestre-v2-cours.js`), jumeau du badge, n'a aucun appelant | **Inscrire et continuer** : notée à #475, pour #469 |
| `recenserDependancesCours` : pour une clé nue, le recensement compte désormais les élèves réellement présents ; la suppression d'un cours peut donc être refusée là où elle passait | **Commenter et oublier** : plus prudent, cas d'un stock d'avant le namespacing |

## 7 · Proposition d'un item de Nouvelles (pour la release de demain)

« « Recalculer les captures » garde les captures des interventions ; le Cadre affiche des noms de groupes-cours et des compteurs à jour, et ne propose plus de clore le trimestre actif. »
