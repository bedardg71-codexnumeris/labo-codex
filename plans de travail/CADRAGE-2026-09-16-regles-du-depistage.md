# Cadrage — les règles du dépistage, tranchées le 16 septembre

> **Écrit le 16 septembre 2026, 17 h 30 (Toronto), par Cowork.** Pas une consigne : une file de six lots, à promouvoir un par un.
> **Source des décisions** : la page « Questions du dépistage » (https://claude.ai/artifact/TyZfhhuGqCWb3ZBVzz2RAJ), onze questions tirées de `Rapports/AUDIT-onglet-suivi-2026-09-05.md` (les « règles de l'audit 3 », #735-#754, jusqu'ici « après le 14, à trancher avec toi ») et revues par lecture sur 1.142.15.
> **Grégoire a répondu entre 17 h 18 et 17 h 21 : onze fois l'option A, qui était chaque fois la recommandation de Cowork, sans nuance écrite.** ⚠ La justesse didactique de ces règles repose donc sur les critères que Cowork a écrits sous chaque question (repris ci-dessous) : si un lot fait apparaître un cas que ces critères n'avaient pas vu, il remonte à Grégoire au lieu d'être tranché par analogie.
> Chaque fiche du backlog porte sa décision (ligne « ✅ TRANCHÉ … 16 sept. »).

## Ce qui vaut pour les six lots

- **Rien n'écrit dans les données de quelqu'un.** Ces décisions changent ce que l'application calcule et affiche ; un champ neuf (lot D) est facultatif et vide par défaut.
- **Chaque constat se remesure avant d'être corrigé** : la revue du 16 a lu le code, sans rejouer les exemples marqués « déduit du code ».
- **Les mots que les collègues lisent remontent avant la release** : ils sont listés lot par lot. La phrase de « Nouvelles » aussi.
- **Ne se rouvrent pas ici** : les bornes et les noms des bandes de contexte (#821, rencontre avec l'orthopédagogue) ; les seuils d'alerte des interventions (#742, gelés jusqu'aux usages d'octobre) ; la note d'un non-remis, famille par famille (`CADRAGE-2026-09-05-non-remis-par-famille.md`) ; le volet complétion de #871 (mesure due d'abord).

## Les lots, dans l'ordre recommandé

L'ordre va du moins coûteux au plus large ; A et D touchent le plus d'écrans.

| Lot | Ce que Grégoire verra | Règle tranchée | Fiches | Ce qui remonte à lui |
|---|---|---|---|---|
| **F** · Les écrans du groupe — ✅ **LIVRÉ en 1.142.21** (16 sept., ≈ 21 h 15) | plus de bandes I/D/M/E sous les courbes du groupe ; un filtre d'engagement qui retient ce que le profil déclare | bandes retirées (motif du 13 sept.) ; filtre = assiduité OU complétion sous 70 % | #860, #828 (+ #575 close) | le **nouveau libellé du filtre** — « A ou C < 70% », validé par lui le 16 au soir ; l'Aide des trajectoires et l'aide de la préférence des seuils : **proposées**, pas validées |
| **B** · Un critère lu une seule fois — ✅ **LIVRÉ en 1.142.18** (`4ef65597`, 16 sept., ≈ 18 h 50) | un critère en points lu à sa note (22/30 n'est plus un défi) ; un critère SOLO « Aucun » jamais proposé comme défi ni comme cible | le dépistage lit la note obtenue ; « Aucun » sort de tout le dépistage | #739, #740 | rien — phrase de « Nouvelles » validée par lui |
| **C** · Un seul palier | la carte RàI donne seule l'intensité, partout (profil, filtres, bilan) ; le palier « Insuffisant » disparaît du code | carte RàI seule ; palier retiré, aucune borne ne bouge | #744, #822 | **le mot qui remplace l'un des deux « Difficulté émergente »** |
| **A** · Les mêmes copies partout — ✅ **LIVRÉ en 1.142.19** (16 sept., ≈ 19 h 45) | note, complétion, dépistage et carte RàI lisent les mêmes copies ; un non-remis ne gonfle plus la complétion | une copie compte quand elle est enregistrée, avec ou sans commentaire final ; la complétion ne compte jamais un non-remis ; « Non reçu » reconnu comme « Non remis » | #737, #741, #718, #738 (volet complétion) | rien, sauf si le libellé d'un écran doit changer |
| **E** · L'élève exclu | son profil calculé par sa pratique, son statut affiché, hors des moyennes du groupe | calcul par sa pratique ; « hors groupe » sans calcul s'il a quitté le groupe | #745 | **les mots du statut** (précédent du lot 5 du cadrage 11 : « (n'est plus dans le groupe) ») |
| **D** · L'assiduité qui manque | un arrivant tardif n'hérite plus des absences d'avant ; un tiret au lieu de 100 % tant que rien n'est noté ; les deux moyennes du groupe s'accordent | date d'arrivée facultative sur la fiche ; assiduité inconnue avant la première présence | #735, #750, #743 | **le libellé du champ « date d'arrivée »** ; une porte terrain probable (fiche d'élève, iPad) |

### Lot F — livré le 16 sept. (1.142.21)

Remesuré avant de coder : `creerAnnotationsZones` et `creerAnnotationsZonesIDME` toujours sans appelant ; après le retrait des zones des deux graphiques, `ZONES_IDME`, `obtenirEchelleUtilisateur` et le repli sans argument de `genererZonesDepuisEchelle` n'avaient plus de lecteur vivant — retirés ; l'identifiant `'M'` du filtre n'est écrit nulle part — gardé. **Ce que la mesure a corrigé du texte de départ** : aucun graphique ne dessine de « zones colorées en arrière-plan » (le plugin de fond est vide depuis #240), seulement des lignes pointillées et des lettres de niveaux — les trois aides le disent ainsi. **Cas hors des critères de la page, tranché par Claude Code et nommé** : un A ou un C absent (`null`) n'est pas « sous 70 » — mais aujourd'hui l'enrichissement ne produit jamais `null` (0 ou 100) ; la garde attend le tiret du lot D, noté sous #830. Stock : rien d'écrit. Détail : fiches #860 et #828, `RELAIS.md`.

### Lot B — livré le 16 sept. (1.142.18)

Remesuré avant de coder : les sept fonctions du relevé sont aux lignes dites ; le champ des points est `ponderation`, pas `pointsMax`. Un seul filtre « Aucun » (`estCritereSurveilleParDepistage`, helpers) et une seule lecture d'un critère (`scoreCritereEvaluation`, la source des courbes). Cas hors des critères de la page, tranché par Claude Code et nommé : sans grille de dépistage choisie, le défi spécifique lit tout, comme avant (rien ne dit lequel est « Aucun »). Stock : les interventions enregistrées avec un critère « Aucun » ciblé ne sont pas réécrites. Détail : fiches #739 et #740, RELAIS.md.

### Lot A — livré le 16 sept. (1.142.19)

Remesuré avant de coder : les six filtres `e.retroactionFinale` de `profil-etudiant-calculs.js` sont aux lignes dites (709, 784, 948, 1002, 1045, 1608) ; `evaluationEntreDansLaNote` dit R1 (enregistrée, non remplacée, avec note, portée non nulle) — il n'a pas été réécrit, il est devenu LE lecteur ; `calculerCompletion` de SOM et de la configurable ne lisaient pas `statutRemise`, STD (578) et les snapshots (236, 278, 638) ne lisaient que « non-remis ». **Ce que la mesure a corrigé du relevé** : deux lecteurs de plus ne passaient pas par R1 (la performance des N derniers artefacts, `calculerIndicesNDerniersArtefacts`, et la garde « une copie évaluée » du jugement de non-participation) ; `_calculerMoyennesCriteresRecents` de STD est bien dormant (aucun appelant hors `js/pratiques/`), laissé tel quel. Deux prédicats dans `pratique-registre.js` : `evaluationEntreDansLaNote` (#706, R1) et `evaluationNonRemise` (« non-remis » ou « non-recu », R2). Le statut « Non reçu » : 0 copie à niveaux dans le pack démo et les bancs ; un chemin réel existe (évaluer, repasser « Non reçu », enregistrer) — remonté à Grégoire avec une sonde, sans arrêter le lot. Stock : les snapshots déjà écrits gardent leur valeur. Aucun mot neuf ; phrase de « Nouvelles » PROPOSÉE (pas validée). Détail : fiches #737, #741, #718, #738, RELAIS.md.

## Les critères retenus, dans les mots de la page

- **A** : un seul ensemble de copies pour l'assiduité, la complétion, la performance et le palier RàI ; un brouillon n'est pas encore le jugement de l'enseignant ; ce sont les niveaux des critères, pas le commentaire, qui portent ce jugement. La complétion mesure la remise, pas la note : un 0 inscrit n'est pas un travail remis.
- **B** : un seul chiffre par copie sur tout le profil ; une valeur continue suit mieux les progrès. Un critère sans niveau SOLO n'a rien à dire au dépistage.
- **C** : une seule intensité à l'écran ; le modèle du dépistage désigne déjà la carte RàI comme source unique. Le palier « Insuffisant » n'a jamais servi, et son mot qualifie la personne alors que les bandes décrivent un état du contexte (décision du 10 sept.).
- **D** : juste pour l'arrivant sans effacer les absences réelles d'un élève inscrit ; ne pas afficher une donnée qui n'existe pas ; les gardes au cas par cas ont déjà montré qu'on en oublie.
- **E** : le code l'annonce déjà (« résultats jusqu'à la dernière présence, hors des moyennes ») ; l'élève qui décroche est celui qu'on veut relancer.
- **F** : cohérence avec la décision du 13 sept. ; on filtre sur ce qu'on lit au profil, sans valeur invisible.

## Tranché par Cowork sur la même page, non contesté

- La branche « Décrochage » de la cible d'intervention, que rien n'atteint, part comme code mort (#554).
- Les couleurs des pastilles de défi restent des constantes documentées ; #677 se ferme (le seuil de « force » suit le réglage depuis le 10 sept.).
- « Non reçu » est reconnu par les calculs (lot A, avec #738).
