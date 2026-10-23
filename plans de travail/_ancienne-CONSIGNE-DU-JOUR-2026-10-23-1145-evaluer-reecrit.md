# Consigne du jour – #1145 : « Évaluer » qui réécrit une évaluation ; ranger la cartouche du plan sous G4H (vendredi 23 octobre 2026)

> Écrite par Cowork le vendredi 23 octobre 2026 à 17 h 31 (Toronto, mesuré par `date`), sur `main` = `origin/main` = `5f9942b0` (1.216.1 en ligne). Elle remplace l'état neutre de 16 h 16, archivé sous `_ancienne-CONSIGNE-DU-JOUR-2026-10-23-neutre-1.216.1.md`.
> Retour testeur : priorité absolue. Deux rapports de Grégoire (17 h 25 et 17 h 29, 1.216.1, Chrome), collés dans Cowork, non déposés au dépôt ; l'essentiel est recopié ici.

## 0. Avant tout

- Aucune suite ne tourne en arrière-plan (règle 5).
- Un commit de docs seul, fichiers nommés : cette consigne et son archive.

## 1. #1145 : passer en mode Évaluer a réécrit une évaluation, sans « Enregistrer »

### Ce que Cowork a mesuré (ses données, Chrome, lecture seule d'IndexedDB depuis `version.json`, 17 h 13 à 17 h 30)

- Évaluation `EVAL_1792773349593_19_83234a3351c4` (Artefact 5, une copie anonymisée, non verrouillée), créée à 12 h 35 vide : `criteres: []`, note 0, cartouche « Plan de rédaction (refonte A26) », grille G5H.
- **À 17:11:14.278 (`dateModification` 21:11:14.278Z), elle est réécrite** : `cartoucheId` → `CART_1787615324805_16_ed44924d5142` (« Carte mentale A26 (refonte A26) », cartouche de **G4H**) ; `criteres` → les quatre ids de **G4H** (`CR17592642064900.*`) à D, I, D, D ; `noteFinale` 58.75 ; `grilleId` reste G5H. **`heureModification` reste « 12 h 36 » et le `journal` n'a aucune entrée neuve** : ce n'est pas le chemin de « Enregistrer ».
- **Le rapport de 17 h 25** : `[17:11:03] clic #productionCartouche` (la production Artefact 5 est enregistrée à 21:11:03.690Z, mesuré), `[17:11:09] .nav-label`, `[17:11:10] button`, `[17:11:13] #travaux-btn-actions`, **`[17:11:14] #travaux-btn-evaluer [travauxUI.basculerMode]`** — la seconde de l'écriture —, puis `#selectCartoucheEval` ×2. Les actions plus anciennes sont sorties de la fenêtre de vingt.
- Les mêmes ids, les mêmes niveaux (D, I, D, D) et la même cartouche se trouvent dans trois évaluations d'**autres** élèves (Artefact 2 (rév) ×2, Artefact 3 (rév) ×1, septembre et 1er oct.). **Origine non prouvée** : une évaluation venue d'une autre copie est l'hypothèse de Cowork, pas un fait.
- **Le rapport de 17 h 29** : un second passage par les réglages de la production (`chargerProductionPourModif`), puis `[17:28:15] basculerMode` Évaluer : **aucune réécriture** cette fois (mesuré : rien d'écrit après 21:11:14Z).

### Ce qui est demandé

- Trouve le chemin qui écrit dans `evaluationsSauvegardees` au passage en mode Évaluer (ou dans la seconde qui suit) sans passer par la sauvegarde, et d'où viennent la cartouche et les niveaux écrits. Pistes, non exclusives : la restauration des choix mémorisés (`selectionsCache`, `attacherEvenementsMemorisation`, `poserCartoucheParChargeur`), les critères hors grille (#652), le pivot `evaluationEnCours` d'une copie précédente (famille de #671 et #1142). Reproduis-le au banc avant de corriger.
- Tarir, avec un test qui échoue sans le correctif (break-test).
- **Le stock, mesuré, jamais réparé d'office** : une signature possible d'une écriture hors « Enregistrer » est un `dateModification` dont l'heure locale ne correspond pas à `heureModification`. Si elle tient, une fonction de console en lecture seule, sur le modèle de `ComptesErreurs`, liste les évaluations concernées du trimestre actif. **Rien n'est écrit dans ses données** : l'évaluation de 17 h 11 sera refaite par Grégoire.
- **Ne touche à aucune donnée de Grégoire.**

## 2. Ranger la cartouche du plan sous G4H (décision de Grégoire, 17 h 25 et 17 h 29)

Ses mots : « habituellement je n'évalue pas le français dans un plan […] La grille à 4 critères est donc la bonne » ; puis « Je ne suis pas capable d'avoir la cartouche du plan avec la grille à 4 critères ». Le rattachement par le nom à G5H, que `CartouchesDecalees.verifier({ reparer: true })` ferait aujourd'hui, **est donc faux pour cette cartouche**.

- Règle générale, à porter dans `js/cartouches-decalees.js` : **une cartouche dont tous les critères sont ceux d'UNE autre grille existante du trimestre est RANGÉE sous cette grille, telle quelle** (contenu inchangé, `grilleId` mis à jour, retirée de la clé d'origine dans la même écriture, rien de jeté). Le rattachement par le nom ne sert qu'aux cartouches dont les critères ne sont ceux d'aucune grille existante. La mesure (sans paramètre) dit, pour chaque cartouche, « ranger sous X » ou « rattacher à X ».
- Si l'application a déjà un geste qui change la grille d'une seule cartouche, lis-le d'abord : c'est peut-être lui qui a produit le décalage du 30 sept. (#1144, source ouverte).
- Attendu sur ses données : « Plan de rédaction (refonte A26) » → **ranger sous G4H Sans français (refonte A26)** ; « Rédaction (refonte A26) » → rattacher à G5M (inchangé).
- Banc et break-test.

## 3. Clôture

- #1145 dans `SUIVI-BUGS.md`.
- **Pas de release, ni verdict, ni push** : elle suivra la relecture de Cowork et la ligne des Nouvelles validée par Grégoire.
- Demande de relecture : `DEMANDE-RELECTURE-2026-10-23-1145-evaluer-reecrit.md`.
- Termine par le geste à vérifier à l'écran, et par ce que Grégoire fera lui-même après la mise en ligne : mettre l'Artefact 5 sur G4H dans les réglages de la production ; lancer les deux réparations de console avec un codex à jour ; réévaluer la copie de 17 h 11.
