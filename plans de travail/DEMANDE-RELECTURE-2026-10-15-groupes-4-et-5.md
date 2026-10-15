# Demande de relecture – les décisions des groupes 4 et 5 : un seul moteur de note, le zéro fantôme, le seuil des spécifications, la mesure « avant » d'une intervention

> Claude Code, 15 oct. 2026, 13 h 35 (Toronto, mesuré par `date`). Consigne de Cowork de 13 h 11
> (`CONSIGNE-LOT-2026-10-15-groupes-4-et-5.md`). Base : `5d726dc3`. Lot : `d69115d3`.
> Aucun push, aucune release, aucun verdict Playwright. Vitest complet (depuis `tests/`) :
> 757 fichiers, 8 814 tests verts.

## Ce que le lot fait, et ce qu'il ne fait pas

| Point | État | Où |
|---|---|---|
| #339, un seul moteur | **Fait.** `calculerNoteAvecCategories` et son appel retirés ; son golden master aussi. | `js/portfolio.js`, `js/pratiques/pratique-pan-standards.js` |
| #339, le zéro fantôme | **Fait.** La terminale ne compte plus parmi les obligatoires en notes finales. | `js/profil-etudiant-actions.js` (`_selectionnerArtefactsHybride`) |
| #935 | **Fait.** Sans seuil : 100 % partout ; un 0 écrit reste 0. | moteur, adoption, formulaire (et la valeur du champ dans `index.html`), assistant |
| #836 | **Vérifié**, rien à corriger (ci-dessous). | — |
| #777 | **Source faite ; bouton NON construit** : la prémisse ne tient pas (question 1). | `js/interventions.js` |
| #1016 | **Suspendu** par la garde de la consigne (question 2). | — |
| BACKLOG | 8 lignes posées telles quelles (#777, #836, #821, #742, #36, #35, #935, #339) et une ligne de lot sous #777. Cochées : #742, #36, #35, #935, #339. Ouvertes : #777, #836, #821, #1016. La ligne de #1016 n'est pas posée : elle dit l'aide corrigée. | `BACKLOG.md` |

Sentinelles neuves, chacune rougie par sa mutation (restauration vérifiée par empreinte) :
`sentinelle-339-terminale-obligatoire-zero-fantome` (garde `p.id !== terminalId` retirée → 72,7 au lieu
de 82,15), `sentinelle-935-seuil-specifications-par-defaut-100` (`|| 60` remis → deux rouges),
`sentinelle-777-mesure-avant-non-calculable` (P recopié sans regarder `noteConstructible` → 0 au lieu de null).
Une preuve textuelle de N6 épinglait l'ancienne ligne de l'assistant : mise à jour, même intention.

## #339 – le banc avant/après

Script WebKit jetable sur le pack démo, capturé sur `5d726dc3` avant toute écriture dans `js/`. Le pack
démo n'a aucune configuration hybride : le banc en construit trois sur la pratique `demo-std-litt`
(artefacts 1-6 en sélection, 7-9 obligatoires, 4 retenues, 65/35) :
- H1 : catégories seules ;
- H2 : H1 + terminale cochée « obligatoire » ;
- H3 : H1 + une obligatoire non remise (DEMO004) et une copie plagiée (DEMO007).

Le banc ajoute la démo telle quelle (C0). Chaque configuration est jouée en provisoire ET en final. Il lit, pour chacun des 10 élèves :
- la note et le portfolio du profil ;
- C, P et `noteConstructible` stockés ;
- `simulerIndices` sous les 5 pratiques (Comparateur, export) ;
- le P historique à 3 dates ;
- le texte rendu du profil ;
- le CSV de l'export.

- **Retrait seul** : 2 416 feuilles, **0 différence**, 0 erreur de page.
- **Retrait + zéro fantôme** : 61 feuilles visibles changent, **toutes dans H2 en final**, toutes vers le haut (10 élèves sur 10, aucune baisse) ; le final rejoint le provisoire, sauf DEMO004 (55,67 contre 65,68 : une vraie obligatoire non remise, qui compte toujours pour zéro). DEMO007 : 80,18 → 84,40 (provisoire : 84,40).
- Ma configuration n'est pas la S1 de Cowork (je ne l'avais pas) : je n'ai pas reproduit 85,53 → 66,65, j'ai reproduit le mécanisme.

**Notes de cet automne** : seules les notes FINALES d'une pratique hybride dont la terminale est cochée « obligatoire » changent, vers le haut ; tant que « notes finales » n'est pas coché, rien ne bouge. Non mesuré : si la pratique de Grégoire coche sa terminale (ses données).

**Laissé tel quel, à trancher par Cowork** : l'écran des catégories (`pratiques-gestion.js:2778`) compte encore la terminale cochée dans sa division de la pondération des obligatoires (« 35 % ÷ N »). Il le faisait déjà contre le calcul provisoire. Pas de BACKLOG (aucun symptôme vécu). Deux voies : retirer la terminale des cases cochables, ou l'exclure du compte de l'écran.

## #836 – vérifié

Un élève de service sans séance a `A: null` (depuis #743). Chaque lecteur de l'assiduité a été relevé dans les écrans suivants :
- profil (carte Assiduité, méthodologie, Accompagnement, Contexte d'apprentissage, alerte Mobilisation) ;
- rapport ;
- Suivi (prioritaires, barres A, non-participation) ;
- Liste ;
- courbes ;
- registre longitudinal ;
- Rencontres.

Partout, A s'affiche en tiret, est exclu, ou n'est pas lu. Le palier RàI n'en dépend pas : `null > 0` est faux, ce qui donne « En attente » et jamais « Non-participation ». Un seul calcul convertit A en 0 (`interpreterMobilisation(null / 100)`, `profil-etudiant-calculs.js:2109`), mais seule sa branche « Décrochage », qui dépend du statut, est lue.

Exécuté : les sentinelles #743/#750 et #731 (15 tests verts). Inféré à la lecture : le reste. Aucun test ne monte un contexte de service (trou de couverture, sans conséquence observable).

## Question 1 (#777) – le bouton n'a rien à recalculer qu'un écran lise

Mesuré au code :
- Les deux sites cités par la fiche sont déjà taris :
  - les captures hebdomadaires écrivent `P: null` depuis #716 (22 sept.), et « Recalculer les captures » les refait, chacune à sa date ;
  - `capturerSnapshotIntervention` et `mettreAJourSnapshotIntervention` n'ont aucun appelant (code mort, déjà relevé à l'inventaire du lot F du 29 sept.).
- La seule mesure d'intervention vivante est `intervention.snapshotAvant[da]`, écrite par la fiche. Elle portait le 0, et ce lot la tarit. Mais aucun écran ne lit son `P` : le bilan avant/après lit `criteres` ; les trajectoires des corrélations, les courbes et les jetons lisent les captures hebdomadaires et écartent déjà les `null`.
- Il n'existe pas de mesure « après » stockée : l'après du bilan se calcule à l'affichage.

Un bouton « Recalculer les mesures des interventions » réécrirait donc dans ses données un nombre qu'aucun écran ne montre, et aucune porte terrain ne peut faire « voir une intervention de septembre dont la mesure "avant" dit "non calculable" ». Je ne l'ai pas construit ; pas de porte terrain non plus.

- **A (recommandé)** : pas de bouton. #777 se coche : la source est tarie, le stock n'a pas de lecteur, et le stock des captures hebdomadaires se répare déjà par « Recalculer les captures ».
- **B** : le bouton quand même, pour un lecteur futur. Proposition :
  - **Emplacement** : Réglages › Captures et recherche, sous « Recalculer les captures ».
  - **Libellé** : « Recalculer les mesures des interventions ».
  - **Aide** : « Refait, pour chaque intervention, la note de chaque élève telle qu'elle se calculait à la date de l'intervention. Une note qui ne se calculait pas encore s'écrit "non calculable". Tes interventions, leurs notes individuelles et leurs bilans ne changent pas. »
  - **Avant l'écriture** : la fenêtre qui propose le codex.
- **C** : cesser d'écrire `snapshotAvant[da].P` (un champ sans lecteur). Il voyage pourtant dans le registre longitudinal et la correction de DA.

## Question 2 (#1016) – « courbes de progression » n'est pas le nom de l'écran

Le P historique s'affiche sous le titre « **Progression temporelle ACP** » (section du profil, `profil-etudiant-sections-affichage.js:2096`, `:2662`, Réglages `index.html:8857`), et les Réglages parlent de « **graphiques de progression** ». « Courbes de progression » n'apparaît qu'au bandeau des consignes non transmises de l'évaluation (`evaluation.js:2407`). L'aide n'est pas touchée. Mots à arrêter : garder « courbes de progression » (et le bandeau reste cohérent avec l'aide), ou « graphiques de progression » (le mot des Réglages).

## Ce qui reste hors du lot (les trois issues)

| Trouvaille | Issue |
|---|---|
| `capturerSnapshotIntervention`, `mettreAJourSnapshotIntervention` sans appelant (snapshots.js) | 3, déjà à l'inventaire du lot F |
| Code sans appelant qui afficherait un faux chiffre d'assiduité s'il revivait (`genererSectionMobilisation`, `genererSectionAssiduite`, `pratique-sommative.js:466`) | 3 |
| Le tri de la Liste par assiduité compare un A inconnu comme 0 (`etudiants.js:1070`) : un ordre, pas un chiffre | 3 |
| Le gabarit « Modèle simple » porte 75 : c'est un seuil écrit, il le garde | — |

## Lignes des Nouvelles proposées

- « **Note finale d'un portfolio hybride** : une évaluation terminale cochée parmi les obligatoires ne compte plus pour zéro dans les notes finales. Elle garde sa propre pondération. »
- « **Notation par spécifications** : sans seuil réglé, une copie est satisfaisante quand toutes ses spécifications sont respectées (100 %), partout. »

## À noter pour la suite

- Non commités, pas à moi :
  - `plans de travail/CONSIGNE-DU-JOUR.md`, modifié : le verdict de 13 h 10 ;
  - `DECISIONS-2026-10-15-groupe-6.md`, écrit à 13 h 25.
- `DECISIONS-2026-10-15-groupe-5.md` a été commité dans son état de 13 h 23. Il contient les lignes de #810 et #33 : elles ne sont pas posées, elles partent avec le prochain lot, selon la note de Cowork.
