# Consigne suivante — un groupe, c'est un numéro DANS un cours (#872, mécanisme B)

> Écrite le 19 septembre 2026 à 15 h 00 (Toronto), par Cowork. **Forme tranchée par Grégoire** (« 1 ») : le menu Groupe du Cadre nomme le cours ; deux cours qui portent chacun un « 00001 » donnent deux entrées ; la liste, le compte et la suppression suivent l'entrée choisie. Écartée : une colonne « Cours » dans la liste (elle montrait le mélange sans l'empêcher).
> **Condition de départ** : `origin/main` porte 1.148.0 avec la retouche « Déjà inscrit·e ce trimestre » (consigne `CONSIGNE-SUIVANTE-retouche-import-1148.md`), poussée. Sinon, arrête-toi et dis-le. Archive `plans de travail/CONSIGNE-DU-JOUR.md` sous `_ancienne-CONSIGNE-DU-JOUR-2026-09-19-retouche-import-1148.md` et renomme ce fichier en `CONSIGNE-DU-JOUR.md`.
> ⚠ **Arbre partagé** : les quatre fichiers de l'autre travail restent hors de l'index ; jeton d'`interpretation-config.js` à `20260910c`.
> **Identifiant** : « Dernier ID utilisé » = #923 à l'écriture ; relis-le et `grep` les deux registres.

---

## 1 · Ce que Grégoire verra

Cadre › Groupe d'étudiant·es, menu **Groupe** : chaque entrée dit son numéro ET son cours. Un enseignant qui a un groupe 00001 dans deux cours voit deux entrées ; la liste ne montre que les élèves de l'entrée choisie ; le nombre d'élèves et « Supprimer le groupe » ne touchent que ce groupe-là.

## 2 · Mesuré par Cowork (lecture de `main` à `f833ab96`) – à remesurer

`js/trimestre-v2-etudiants.js` :
- `populerDropdownGroupesV2` (≈ l. 388) : un `Set` de numéros normalisés, toutes fiches confondues ; suffixes « (démo) », « (vide) » ; valeur persistée `cle('groupeSelectionne')` (`entrerEnDemo` y pré-sélectionne `'0demo'`).
- `getGroupeSelectionneV2` (≈ l. 464) → le numéro seul ; lu par `chargerListeEtudiantsV2` (filtre ≈ l. 201), le formulaire (≈ l. 674), la suppression (≈ l. 1190).
- **Suppression** (≈ l. 1197-1221) : filtre et efface par numéro seul ; depuis #885 la question dit « répartis dans N cours » – elle **efface les deux groupes**.
- `creerNouveauGroupeV2` (≈ l. 702) : le numéro libre est cherché parmi TOUS les numéros du trimestre – impossible de créer un « 00001 » dans le cours B si le cours A en a un (le cas de Mathieu : « un groupe par cours »).
- Ajout à la main : `coursId` = cours actif ; en **édition**, la fiche est réécrite au cours actif (signalé par toi au lot #887, point 6 : aujourd'hui le seul geste qui réattribue un élève, en silence).

## 3 · Ce qui est attendu – décisions techniques de Cowork, à tenir sauf mesure contraire (dis-le)

1. **Identité d'un groupe = (cours, numéro).** Le menu porte une valeur composée (forme à ton jugement, stable et échappée) ; un lecteur unique rend `{ coursId, groupe }`. Tous les lecteurs du §2 passent par lui ; aucun ne compare plus le numéro seul.
2. **Libellé** (lu par des enseignant·es, **proposé par Cowork**, remonte à Grégoire) : « 00001 · <code du cours> », « (démo) » et « (vide) » gardés en suffixe ; une fiche sans cours : « 00001 · sans cours ». Le code du cours seul, pas son nom (largeur du menu sur iPad) ; si deux cours ont le même code, ajoute le nom. Le libellé du cours vient du même helper que la zone d'import (`_libelleCoursRattachementV2`, à factoriser).
3. **Valeur persistée** : l'ancienne forme (numéro seul, dont `'0demo'`) reste lue – elle sélectionne l'entrée si elle est unique, sinon « Tous les groupes ». Aucune donnée réécrite.
4. **Suppression** : n'efface que les fiches du couple (cours, numéro) ; la question nomme le groupe par son libellé ; la mention « répartis dans N cours » disparaît (elle n'a plus d'objet).
5. **Nouveau groupe** : il naît dans le cours actif ; le numéro libre et le refus de doublon se jugent **dans ce cours**. Le libellé « (vide) » suit.
6. **Formulaire d'ajout à la main** : si une entrée du menu est choisie, l'élève est rattaché au **cours de cette entrée** (« un élève ajouté à la main l'est dans la liste qu'on regarde ») et la phrase « Sera rattaché·e à : » le dit ; « Tous les groupes » → cours actif, comme aujourd'hui. **Édition** : la fiche GARDE son `coursId` ; la phrase dit le cours de la fiche. ⮕ Ça retire le seul geste de réattribution : dis-le dans le rapport, Cowork le porte à Grégoire (déplacer un élève d'un cours à l'autre devient impossible depuis l'écran ; à inscrire si tu mesures qu'un parcours en dépendait).
7. **Hors du menu du Cadre, à MESURER et DIRE** : l'étape 3 du groupe-cours (`populerDropdownGroupesAssemblageV2`, `trimestre-v2.js` ≈ l. 245) et le menu de l'horaire (`populerDropdownGroupesHoraireV2`, `trimestre-v2-horaires.js` ≈ l. 666) offrent-ils les numéros de TOUS les cours ? Si l'étape 3 peut filtrer par le cours du groupe-cours en une règle, fais-le (c'est la même confusion) ; sinon inscris. L'horaire : mesure et dis.

## 4 · Arrêts

- Si un autre module lit `groupeSelectionne` ou compare des groupes par numéro seul (présences, Suivi, groupe-cours) et que la valeur composée le casserait : arrête-toi et dis lequel.
- Stock : aucune fiche n'est déplacée ni réécrite (`coursId` vide compris).

## 5 · Preuve

- Banc WebKit par le vrai geste, deux cours portant chacun « 00001 » : deux entrées au menu ; chacune montre ses seuls élèves ; « Supprimer le groupe » sur l'une laisse l'autre intacte ; « + Nouveau groupe » dans le cours B accepte « 00001 » ; ajout à la main sous une entrée du cours B → `coursId` = B ; édition d'une fiche du cours B, cours actif A → `coursId` reste B. Pack démo : `'0demo'` toujours pré-sélectionné.
- Mutations : filtre de liste au numéro seul ; suppression au numéro seul ; doublon jugé sur tout le trimestre ; édition qui réécrit le cours actif ; ancienne valeur persistée ignorée. Chacune rouge.
- Vitest complet depuis `tests/`. Verdict Playwright par `pousser.sh`, Cowork fermé. Porte terrain : aucune a priori (le banc voit tout) ; si le menu déborde à 768 px, dis-le.
- Version : à ton jugement ; entrée de « Nouvelles » proposée, elle remonte à Grégoire par Cowork.

## 6 · Rapport

En gestes d'utilisateur : les libellés posés et ce que tu as supposé, la mesure du §3.7, la conséquence du §3.6 sur la réattribution, ce qui n'est pas mesuré, les chemins à commiter. `OU-EN-EST-ON.md`, `RELAIS.md` ; inscris ou coche la fiche du mécanisme B (#872) avec son « vérifié comment ».
