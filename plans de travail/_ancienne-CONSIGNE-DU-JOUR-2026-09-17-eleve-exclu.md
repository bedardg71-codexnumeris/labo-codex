# Consigne suivante – l'élève exclu (lot 32 : lot E du dépistage, #745)

> Écrite le 17 septembre 2026, 11 h 47 (Toronto), par Cowork, après le push de 1.142.27.
> **Condition de départ** : `git log origin/main` (pas `git log`) doit montrer `1.142.27` (`f99f5325`) ; sinon, arrête-toi et signale-le. Puis archive `plans de travail/CONSIGNE-DU-JOUR.md` sous `_ancienne-CONSIGNE-DU-JOUR-2026-09-17-un-seul-palier.md` et renomme `plans de travail/CONSIGNE-SUIVANTE-eleve-exclu.md` en `CONSIGNE-DU-JOUR.md`.

Mandat : le lot E de `plans de travail/CADRAGE-2026-09-16-regles-du-depistage.md`. Règle tranchée par Grégoire le 16 au soir, mots choisis le 17 au matin : **aucune question ne l'attend**, sauf la phrase de « Nouvelles » et toute phrase de l'Aide que tu réécrirais.

## 1 · La règle (#745)

- **Élève exclu par statut** (`estEtudiantExclu`, `main.js:111` : inactif, décrochage, abandon) : son profil se calcule avec la règle de **SA pratique** (celle du groupe-cours), comme un élève actif ; il **affiche son statut** ; il reste **hors des moyennes et statistiques du groupe**.
- **Élève qui n'est plus dans le groupe** (DA absent de la liste) : « hors groupe », **sans calcul**.
- **Mots, tels quels** :
  - exclu par statut, sous le nom dans le profil : **« <libellé du statut> · hors des moyennes du groupe »** – le libellé vient de `libelleStatutEtudiant` (`main.js:125` : Inactivité, Décrochage, Abandon) ; exemple : « Décrochage · hors des moyennes du groupe » ;
  - absent du groupe, sans calcul : **« N'est plus dans le groupe »** (reprend la mention des Interventions, `interventions.js:720`).

## 2 · Ce que Cowork a lu `[lecture]`, à remesurer

- **La cause** : les indices stockés ne contiennent pas les exclus – A (`indices.js:~270`, `etudiantsActifs`) et C/P (`portfolio.js:~685`). `calculerTousLesIndices` (`indices.js:~484`) tombe alors dans le repli « à la volée » : **A = 0** (aucune entrée), **P = `calculerPerformancePAN`** (`indices.js:420`, « les 3 meilleures notes » sans sélection de portfolio), quelle que soit la pratique. Constats D-5 et F-2 de l'audit du 5 sept. `[exécuté]` : un exclu à P 70 là où sa pratique dit 62,5.
- **Le choix d'implémentation est à toi** (calculer les exclus avec les actifs et filtrer à la lecture des moyennes, ou calculer l'exclu à part par sa pratique) ; dis lequel et pourquoi. Contraintes : **aucune moyenne, statistique, courbe de groupe ni relevé hebdomadaire ne doit changer** pour un groupe qui a un exclu – liste les lecteurs de moyenne (`grep -rn` sur `estEtudiantExclu` et sur les lecteurs de `indicesAssiduite` / `indicesCP`) et prouve-le.
- **Le repli « à la volée »** : s'il n'a plus de chemin vivant une fois les exclus calculés, retire-le (`calculerPerformancePAN` compris, s'il n'a plus d'appelant) – zéro-dette. S'il en garde un, nomme-le.
- **Où le mot paraît** : l'en-tête du profil (nom) – la liste des étudiants porte déjà le statut en clair (`etudiants.js:~1186`, #749 lot 2), ne la change pas. Cherche les chemins réels qui ouvrent le profil d'un DA absent du groupe (Interventions ? Évaluations ?) ; s'il n'y en a aucun, dis-le et n'invente pas d'écran.
- ⛔ **Arrêt** : si calculer un exclu par sa pratique donne, pour un chemin réel, un résultat que la règle du 16 ne tranche pas (par exemple : une pratique dont la note dépend du rang ou de la moyenne du groupe, ou un exclu sans aucune présence ni copie), arrête-toi sur ce cas et rapporte-le, quel que soit le stock : il remonte à Grégoire. Le reste du lot peut continuer.
- **Stock** : les indices sont des caches recalculés ; dis si un indice d'exclu est ÉCRIT ailleurs (snapshot, relevé hebdomadaire, intervention) et s'il y garde sa valeur. N'y écris rien.

## 3 · Au passage, sans mot, sans release si c'est seul

- **Trou de preuve de la relecture du lot 31** (en tête de la section 1.142.27 de `RELAIS.md`) : dans `sentinelle-790-signalement-vient-du-gabarit`, volet B, le cas « une copie de production DIAGNOSTIQUE lève bien un signalement » ne marque aucune production comme diagnostique. Donne-lui une production `P_DIAG` portant `diagnostique: true`, visible par le module par les deux chemins qu'un filtre emprunterait (un `db` de banc qui la rend sous `cle('productions')`, et le contexte). La mutation N1 de Cowork (écarter dans `pourEleve` les copies dont la production lue par `db.getSync(cle('productions'))` porte `diagnostique === true`, sans le mot `ProductionDiagnostique`) doit rougir.

## Preuve

- Sentinelle du lot, sur un groupe à trois élèves dont un en « Décrochage » avec présences et copies : le profil de l'exclu rend A, C et P **de sa pratique** (au moins sommative et standards), pas « 3 meilleures » ni A = 0 ; l'en-tête écrit « Décrochage · hors des moyennes du groupe » ; les moyennes et statistiques du groupe sont **identiques** avec et sans l'exclu calculé. Un DA absent du groupe : « N'est plus dans le groupe », aucun indice calculé.
- Break-test : l'exclu retombe dans le repli ; l'exclu entre dans une moyenne du groupe ; le libellé écrit en dur au lieu de `libelleStatutEtudiant`. Des essais de COMPORTEMENT : une mutation qui garde le texte exigé et change le calcul doit rougir.
- Banc WebKit si le pack démo porte un exclu (sinon, dis-le).
- Vitest depuis `tests/`, puis le verdict Playwright, Cowork fermé. **Porte terrain : aucune attendue.** Si la ligne ajoutée sous le nom change la mise en page de l'en-tête, mesure-la à 768 px et dis-le.

## Livraison

Patch `1.142.28` par `scripts/release.mjs`. **Phrase de « Nouvelles », et toute phrase réécrite dans l'Aide** : propose-les à Grégoire avant de les figer. Puis `OU-EN-EST-ON.md`, `RELAIS.md`, le backlog (#745), le cadrage (lot E livré), le markdown du tri. **Commite aussi les fichiers de Cowork** : la consigne renommée et son archive, et l'ajout de Cowork en tête de la section 1.142.27 de `RELAIS.md` (relecture du lot 31). Push par `scripts/pousser.sh`, puis signale à Cowork que c'est poussé.
