# CONSIGNE — #542 lot 3 : délier le dépistage de l'échelle de Grégoire

> Rédigée le **mercredi 26 août 2026 au soir**, au terme de la séance des lots 0, 1 et 2.
> Codage prévu le **jeudi 27 août au matin**.
> Plan de référence : `plans de travail/PLAN-SOLO-echelle-et-depistage.md` §2-D5 et §4-Lot 3.

---

## 0. À lire d'abord, avant toute chose

**Fais l'audit factuel avant de croire cette consigne.** Elle a été écrite le soir du 26 ;
une session parallèle (#540, kuekatsheu-fc) travaille dans le même dépôt et a clos son
chantier pendant la séance. `git log`, `git status`, puis `cd tests && npx vitest run`.

⚠ **Les numéros de ligne de ce document seront périmés.** Re-localise chaque site avant
d'éditer — `grep -n`, jamais un numéro recopié.

**Ce qui est acquis et ne se rouvre pas** (décisions de Grégoire, 26 août) :

| Décision | Conséquence pour le lot 3 |
|---|---|
| Les deux SOLO restent, on **ajoute** | Ne PAS déplacer SOLO du critère vers l'échelle : l'IPB ne surveille que les critères « fondations », et le perdre produirait des faux positifs en série |
| `description` n'est pas remplacée | Elle part dans les PDF remis aux élèves |
| Le niveau « 0 » est un **jugement suspendu** | Pas une performance nulle |

---

## 1. Ce que le lot 3 doit faire, en une phrase

Le dépistage doit cesser de connaître « IDME », « 0,64 » et « Structure ».
Il doit savoir seulement : *ce niveau-ci est étiqueté unistructurel, donc l'élève est à risque.*

**Chemin actuel :**

1. niveau choisi → score numérique (`valeurCalcul`)
2. moyenne des scores
3. moyenne comparée à **0,64 / 0,75 / 0,85** (`interpretation-config.js`)
4. verdict I/D/M/E → phrase d'interprétation SOLO **codée en dur**

**Chemin visé :**

3′. la moyenne est située dans les **plages `min`/`max` de l'échelle de l'évaluation**
4′. le niveau obtenu livre son **étiquette `niveauSOLO`** (livrée par le lot 2), qui donne l'interprétation

⚠ **Ce qui restera numérique, et pourquoi.** Agréger plusieurs évaluations exige une moyenne,
donc des nombres. Ce qui doit disparaître n'est pas le calcul, c'est le fait que les **bornes**
viennent d'ailleurs que de l'échelle de l'utilisateur.

---

## 2. Ce que le lot 2 t'a laissé, et qu'il faut savoir

- Le champ **`niveauSOLO` existe désormais sur les niveaux d'échelle**, facultatif, cinq valeurs :
  `prestructurel`, `unistructurel`, `multistructurel`, `relationnel`, `abstrait_etendu`, ou vide.
- Producteur unique des options : `optionsNiveauSOLOEchelle()` (`js/echelles.js`), exporté sur
  `window`, avec la constante `NIVEAUX_SOLO_ECHELLE`.
- **Le seed livré est étiqueté. Les échelles de Grégoire, NON** — le champ y naît vide.

⮕ **Conséquence dure, à traiter en premier** : le jour du codage, **aucune des échelles réelles de
Grégoire ne porte d'étiquette SOLO**. Un lot 3 qui lirait `niveauSOLO` sans repli rendrait le
dépistage muet chez lui — exactement le défaut A2/A3 qu'on vient de refermer.

⮕ **Donc : le lot 3 commence par une porte, pas par du code.** Grégoire doit étiqueter son échelle
« 0-IDME » dans l'éditeur (cinq menus, deux minutes) — OU on décide que l'étiquette est facultative
et que son absence a un comportement défini et DIT. Voir §5.

---

## 3. Les sites, à re-localiser

| Quoi | Où (26 août au soir) |
|---|---|
| Les seuils `idme.*` | `js/interpretation-config.js:38-44` |
| Situer une moyenne dans un niveau | `obtenirNiveauIDMEDepuisPourcentage`, `js/profil-etudiant-helpers.js` (corrigé par #541) |
| Les quatre descriptions SOLO en dur | `js/profil-etudiant-sections-affichage.js` — `interpreterScoreIDME`, + une borne `0.85` en dur |
| **B9 — à SUPPRIMER** | `obtenirNiveauSOLO()`, `js/trimestres.js` — redevine SOLO depuis le **nom** d'un critère et **contredit** le champ que l'utilisateur configure |
| Le pattern d'apprentissage | `identifierPatternActuel`, `js/profil-etudiant-calculs.js` — lit `idme.insuffisant` et `idme.developpement` |
| Le niveau RàI | `determinerNiveauRaiPedagogique`, même fichier — lit les trois seuils |

---

## 4. Ce que la séance du 26 a appris, et qui change le lot 3

**Les seuils en dur SONT les plages de Grégoire, au chiffre près.** Mesuré sur ses données :

```
son échelle :  D 65–74   M 75–84   E 85–100
idme.*      :  0,64      0,75      0,85
```

⮕ **Le lot 3 ne changera donc RIEN pour lui, et tout pour quelqu'un d'autre.** C'est la meilleure
justification du lot — et aussi son piège : **on ne pourra pas valider le correctif sur ses
données**, puisque l'ancien et le nouveau chemin y donnent le même résultat. La validation devra
passer par une échelle A/B/C/D fabriquée dans un test.

**Un chevauchement de plages existe dans son échelle réelle**, et le lot 3 doit le regarder en face :

```
0   plage 0–0
I   plage 0–64      ← les deux contiennent 0
```

`calculerNote` prend le **premier** niveau dont la plage contient la valeur (`niveaux.find(...)`).
Une note de 0 rend donc `0`, pas `I`. C'est le comportement actuel — **ne pas le changer par
inadvertance**. Si le lot 3 réécrit la mise en plage, ce cas doit avoir son test.

**Et les plages ne couvrent pas tout.** `calculerNote` a déjà un repli « niveau le plus proche »
pour les valeurs qui ne tombent dans aucune plage (bornes non contiguës, arrondis). Le lot 3 doit
décider s'il le reprend ou s'il rend `null` — et **le dire**, dans les deux cas.

---

## 5. La décision à prendre AVANT de coder

**Une seule, fermée, et elle commande tout le reste.**

> Quand un niveau d'échelle n'a **pas** d'étiquette SOLO — ce qui est le cas de TOUTES les échelles
> réelles aujourd'hui — que fait le dépistage ?

| Option | Ce que ça donne |
|---|---|
| **A — Grégoire étiquette son échelle d'abord** | Le lot 3 lit `niveauSOLO` sans repli. Propre, mais bloque tant que la porte n'est pas passée, et laisse tout autre utilisateur devant un dépistage muet |
| **B — L'étiquette est facultative, l'absence est DITE** | Le dépistage situe la moyenne dans les plages (ça marche sans étiquette) et affiche le **nom du niveau** au lieu d'une phrase SOLO, en signalant que l'interprétation SOLO n'est pas configurée |
| **C — Repli sur les seuils `idme.*`** | Ce qu'on vient de passer la séance à retirer. À écarter, sauf argument neuf |

⮕ **Recommandation** : **B**. Elle sépare proprement les deux moitiés du problème — situer une
moyenne (qui ne demande que des plages, présentes partout) et l'interpréter (qui demande une
étiquette, facultative). Et elle est la seule qui rende le dépistage juste pour un utilisateur
qui n'a jamais entendu parler de SOLO.

### ✅ DÉCISION DE GRÉGOIRE — **B**, prise le jeudi 27 août 2026 au matin

**L'étiquette SOLO est facultative, et son absence est DITE.**

| Le lot 3 fait | Le lot 3 ne fait pas |
|---|---|
| Situer la moyenne dans les plages `min`/`max` de l'échelle de l'évaluation — présentes partout, y compris chez un utilisateur qui ignore SOLO | Exiger que Grégoire étiquette son échelle avant que le dépistage fonctionne (option A) |
| Interpréter par `niveauSOLO` quand l'étiquette est là | Retomber sur `idme.*` quand elle manque (option C) |
| Afficher le **nom du niveau atteint** quand elle manque, et signaler que l'interprétation SOLO n'est pas configurée | Rester muet, ou inventer une phrase |

⮕ **Ce que B engage pour le pas 5** (« devenir des seuils `idme.*` ») : B ne leur laisse **aucun rôle de repli**.
Leur disparition devient l'hypothèse par défaut ; ce qui reste à mesurer, c'est **qui les lit encore**.

⮕ **Ce que B engage pour la validation** : le §4 prévient qu'aucun résultat de dépistage ne changera
chez Grégoire — ancien et nouveau chemin y donnent la même chose. **Le message d'absence d'étiquette
est donc le SEUL comportement du lot 3 observable sur ses données**, puisque ses échelles n'en portent
aucune (§2). C'est lui, et lui seul, qu'une porte terrain doit regarder. Le reste se prouve sur
l'échelle A/B/C/D fabriquée en test.

⚠ **Ne pas coder avant que Grégoire ait tranché.** Le §6 du plan liste le devenir des seuils
`idme.*` comme « à trancher dans ce lot, pas avant » — c'est ici que ça se joue.
⮕ **Levé le 27 août : la décision est prise, voir ci-dessus.**

---

## 6. Découpage proposé

1. **Situer une moyenne dans les plages de l'échelle de l'évaluation** — fonction nouvelle, testée
   sur une échelle A/B/C/D, avec le cas du chevauchement à 0 et le cas hors plage.
2. **Interpréter le niveau obtenu par son `niveauSOLO`** — et le comportement tranché au §5 quand
   l'étiquette manque.
3. **Retirer les quatre descriptions en dur** et la borne `0.85`.
4. **Supprimer B9** (`obtenirNiveauSOLO()`), qui contredit le champ configuré.
5. **Trancher le devenir des seuils `idme.*`** : repli ou disparition.

**Ne pas enchaîner plus de deux de ces pas dans une matinée.**

---

### ✅ PAS 1 ET 2 FAITS — 27 août 2026, matin (`4d04dd21`, `750e7c3f`)

La consigne autorisait deux pas ; deux ont été faits, et le troisième n'a pas été entamé.

| Pas | État | Ce qui a été livré |
|---|---|---|
| **1** | ✅ | `situerPourcentageDansEchelle(pourcentage, echelle)` — `profil-etudiant-helpers.js`. Première plage contenante gagne · hors plage → `null`, sans repli « plus proche » · borne vide ≠ borne zéro. 11 tests, 4 break-tests rouges. |
| **2** | ✅ | `interpreterNiveauAtteint(niveau)` — même fichier. Étiquette SOLO présente → sa description ; absente → **le nom du niveau, et l'absence dite**. Les 4 descriptions rapatriées dans `NIVEAUX_SOLO_ECHELLE` (`echelles.js`). 9 tests, 4 break-tests rouges. |
| **3a** | ✅ | `obtenirEchelleResolue` — la résolution d'une échelle séparée de sa réduction en table. Refactor no-op, 11 tests, 4 break-tests rouges. |
| **3b** | ✅ | **C'est la PRATIQUE qui dit dans quoi sa note globale se lit** (correction de Grégoire). `obtenirEchelleNoteGlobale(da)` au contrat + les trois pratiques + le helper `obtenirEchelleCommuneDesEvaluations`. 11 tests. |
| **3c-1** | ✅ | **La performance GLOBALE est branchée** — elle demande son échelle à la pratique, situe, interprète. Le ternaire `pct >= 85 ? …` de cette ligne est retiré. Spec WebKit, 2 break-tests rouges. **Premier pas du lot qui change l'écran.** |
| **3c-2** | ✅ | Le niveau **par critère** est branché sur l'échelle commune des évaluations. ⮕ **Source DIFFÉRENTE de 3c-1, et c'est le point** : la note GLOBALE la demande à la pratique, un CRITÈRE est évalué par l'échelle — même en sommative, chaque critère reçoit un niveau avant d'être converti en note. **Plus aucun ternaire `pct >= 85` dans le fichier.** |
| **3c-3** | ✅ | **Fait le 27 août, fin de matinée.** DEUX des quatre morceaux étaient du CODE MORT et ont été supprimés, pas branchés · la carte « Observation de la structure » rend désormais **un bloc par niveau de l'échelle** (décision de Grégoire). Détail ci-dessous. |
| **4** | ⏳ | Supprimer `obtenirNiveauSOLO()` (`trimestres.js`). |
| **5** | ⏳ | Trancher le devenir des seuils `idme.*`. B ne leur laisse aucun rôle de repli. |

✅ **LA PERFORMANCE GLOBALE EST BRANCHÉE DEPUIS LE PAS 3c-1** (27 août). Vérifiée sur les
données réelles de Grégoire : « Performance globale (P) : **D 72 %** », le code venant de son
échelle. Le reste de la carte — le niveau par critère, les descriptions SOLO, les bornes
`0.85` — n'est **pas encore branché** et calcule toujours avec les valeurs écrites dans le
code.

⚠ **Chez Grégoire, les deux moitiés donnent le MÊME résultat**, parce que les bornes
recopiées dans le code sont exactement les siennes. L'écart n'apparaîtrait que chez un
utilisateur qui note autrement — c'est la meilleure justification du chantier, et son piège :
**il ne peut pas être validé sur ses données.**

🔧 **UN `ReferenceError` LATENT TROUVÉ ET CORRIGÉ EN CHEMIN (27 août).** Le repli de
`obtenirPratiqueActuelle` (`profil-etudiant-helpers.js`) instanciait
**`PratiquePANMaitrise`** — une classe qui n'existe nulle part : elle s'appelle
`PratiquePANStandards`. Ce n'est PAS du code mort : `obtenirPratiqueParId` rend `null`
quand une pratique configurable a été supprimée, ou quand sa construction a levé et que le
`catch` de `pratique-registre.js` l'a rattrapée — le repli prend alors la main et fait
tomber TOUT le profil de l'élève.
⮕ **Il bloquait le pas 3c**, qui doit passer par `obtenirPratiqueActuelle()` pour demander
son échelle à la pratique. D'où sa correction ici plutôt qu'une inscription au backlog.
⮕ **Trouvé par un test, pas par une lecture** : `new w.PratiquePANMaitrise()` a échoué
dans la sentinelle du pas 3b. J'avais lu cette fonction deux fois sans voir le nom.
Reproduit (registre stubbé à `null` → « ReferenceError : PratiquePANMaitrise is not
defined ») **avant** d'être corrigé. Verrouillé par
`tests/unit/sentinelle-542-repli-pratique-actuelle.test.js`, break-test rouge vérifié.

⏳ ~~**DÛ PAR GRÉGOIRE avant le pas 3**~~ ✅ **FAIT le 27 août** : la description de « préstructurel » —
**« Aucun aspect pertinent n'est traité »**. Seul texte écrit à neuf de tout le lot :
l'ancien code n'en produisait que quatre pour cinq niveaux SOLO. C'est du vocabulaire
pédagogique, pas de la mécanique.

⮕ **CE QUE LE PAS 3 DOIT SAVOIR, ET QUI N'ÉTAIT PAS DANS CETTE CONSIGNE.** Le §3 listait
les seuils `idme.*` et les quatre descriptions. Il en manquait un, trouvé en lisant le
code : `profil-etudiant-sections-affichage.js`, dans la carte « Performance globale (P) »,
écrit **`pct >= 85 ? 'E' : pct >= 75 ? 'M' : pct >= 65 ? 'D' : 'I'`** — les bornes de
Grégoire en clair dans un ternaire, sans même passer par `obtenirSeuil`. Il ne se voit pas
en cherchant `idme.` : le re-localiser au pas 3 par la valeur `>= 85`, pas par le nom du
seuil.

⮕ **ET UN CINQUIÈME SITE, TROUVÉ LE 27 EN RELISANT LE FICHIER DÉPLOYÉ — le plus gros des
deux.** `interpreterPerformance`, dans `profil-etudiant-helpers.js` (~ligne 744), porte
**quatre seuils en dur ET quatre descriptions SOLO reformulées** :

| Seuil en dur | Description | Ce que c'est, en fait |
|---|---|---|
| `p >= 0.85` | « Maîtrise étendue des compétences avec transfert à d'autres contextes » | abstrait étendu |
| `p >= 0.75` | « Maîtrise globale avec liens établis entre les concepts » | relationnel |
| `p >= 0.65` | « Points pertinents identifiés, liens à consolider » | multistructurel |
| `p >= 0.40` | « Compréhension superficielle, renforcement nécessaire » | unistructurel |

⚠ **L'asymétrie qui le démasque, et qui est dans le même fichier, à vingt lignes d'écart** :
ses deux voisines `interpreterCompletion` et `interpreterAssiduite` lisent leurs seuils par
`obtenirSeuil('interpretation.*')`. `interpreterPerformance`, seule des trois, ne consulte
**rien** — ses quatre valeurs sont écrites dans le code. Elle est exportée sur `window` et
son résultat s'affiche.

⮕ **ET UN SIXIÈME SITE, LE PLUS GROS, TROUVÉ LE 27 AOÛT SUR UNE CAPTURE DE GRÉGOIRE.**
La carte **« Observation de la structure des résultats d'apprentissage »**
(`profil-etudiant-sections-affichage.js`, ~1100-1200) porte à elle seule :

- **un TROISIÈME jeu de descriptions SOLO en dur**, plus long et plus riche que les deux
  autres — « À ce niveau multistructurel, l'étudiant·e peut se concentrer sur plusieurs
  points pertinents à la fois. Cependant, il/elle les considère indépendamment. » ;
- **les codes IDME écrits dans le texte** : « En développement (D) », « Incomplet (I) »,
  « Maîtrisé et étendu (E) » ;
- **le mapping seuil → niveau SOLO en dur** : `valeur >= idme.insuffisant && < seuilDeveloppement`
  signifie « multistructurel », et rien ne le dit à l'utilisateur.

⚠ **LA DÉCISION QUE ÇA OUVRE, ET QUI EST POUR GRÉGOIRE.** Le dépôt contient donc **trois
formulations concurrentes** des mêmes niveaux SOLO : celles d'`interpreterScoreIDME`
(courtes), celles d'`interpreterPerformance` (autres), et celles-ci (longues, les plus
pédagogiques). Le pas 3c doit n'en garder **qu'une**, dans `NIVEAUX_SOLO_ECHELLE`. Laquelle
est un choix de vocabulaire, pas de mécanique — **ne pas trancher à sa place**.

⮕ **Conséquence pour le pas 3** : le lot ne peut pas se dire fini en ne traitant que
`interpreterScoreIDME`. Ce sont **deux jeux de descriptions SOLO parallèles**, aux seuils
différents (`0,64` contre `0,40` pour le bas de l'échelle), qui décrivent la même chose et
peuvent se contredire à l'écran pour un même élève.

---

## 7. Précautions, apprises à mes dépens le 26

- **Chaque correctif porte sa sentinelle, avec break-test ROUGE vérifié**, restauration confirmée
  par `diff -q`. Les défauts A1 et A4 ont survécu à des milliers de tests verts parce que rien
  n'appelait les fonctions fautives.
- **Ne jamais reporter un total de tests qui n'a pas été lu à l'écran APRÈS le dernier changement.**
  C'est arrivé deux fois le 26 (`aa880dfa`, `c1d92a0f`) — la seconde annonce « 3615/3615 » alors que
  la mesure réelle était 3614/3615.
- **Un chiffre juste rangé sous un mauvais libellé est un chiffre faux.** Quatre fois en une soirée
  (sonde du lot 0, `542bis`, `542ter`, dry-run de la réparation). Avant d'écrire une conclusion,
  relire ce que la mesure porte VRAIMENT.
- **Index git partagé** : `git add -N <neufs>` puis `git commit --only <chemins>` dans la MÊME
  commande. Si un fichier partagé (comme `index.html`) porte le travail d'une autre session,
  isoler son propre hunk et `git apply --cached`.
- **Vitest se lance depuis `tests/`**, jamais de la racine.
- **Aucun bump de build** tant que l'application de Grégoire est ouverte en `file://`. Le `?v=` d'un
  fichier modifié, en revanche, se pose — valeur donnée par
  `node scripts/release.mjs --build-only --dry-run`, et **celle de ses fichiers seulement**.

---

## 8. État à la reprise

- `main`, arbre propre au moment d'écrire. **Rien n'est poussé** — plusieurs commits d'avance.
- **Vitest 3614/3615.** L'unique rouge est `styles.css` à l'anti-cache (`?v=20260826d` inchangé),
  fichier de #540 commité par `565b130d` — **hors périmètre #542**, à signaler à kuekatsheu-fc.
- Playwright non relancé en fin de séance.

⮕ **AUDIT DU JEUDI 27 AOÛT, 5 h 20 — trois des lignes ci-dessus sont périmées.**

- **Tout est poussé.** `origin/main` = `HEAD` = `2aff7198`, `git log origin/main..HEAD` est vide.
  Le « rien n'est poussé » ci-dessus a été écrit avant le push de 22 h 25.
- **Vitest est VERT : 3615/3615**, 338 fichiers — mesure lue à l'écran ce matin, après le dernier
  commit et sans changement depuis. Le rouge `styles.css` a été refermé par `2aff7198`, et sa cause
  — l'anti-cache attrapé trop tard — est inscrite en **#547**.
- **Playwright toujours pas relancé** : cette ligne-là tient. Baseline connue = 1 échec (`#530`).
- Version inchangée — `1.101.1`, build `0826-1658`. **Le bump reste dû.**
- Prochain ID libre : **#548**, vérifié au `BACKLOG.md` ce matin et non recopié d'un document.

**Ouvert au backlog, dans l'ordre où ça devient gênant :**

- **#545** — pourquoi l'échelle a été ré-orphelinée. **Tant qu'on ne le sait pas, la réparation du
  26 peut se défaire.** C'est le plus urgent des trois.
- **#544** — les 44 `ECHELLE_DEMO` de H2026. Un `await oracle542('ECHELLE_DEMO')` suffit à savoir.
- **#543** — les 56 évaluations dont la note ne se recalcule pas (deux causes distinctes).
- **#546** — le « jugement suspendu » n'est plus saisissable depuis #526. **À trancher avec Grégoire.**

---

### ✅ PAS 3c-3 FAIT — 27 août 2026, fin de matinée

**Le pas annonçait quatre morceaux. Deux n'ont pas été branchés : ils étaient morts.**
C'est la trouvaille du pas, et elle change ce que « retirer les seuils » voulait dire ici.

| Morceau annoncé | Ce que la vérification a montré | Geste |
|---|---|---|
| `interpreterScoreIDME` + 4 descriptions courtes | Son seul consommateur, `patternTexte`, était **assigné et jamais lu** — deux occurrences dans tout le fichier, la déclaration et la réassignation. Le badge affiché à l'écran est `niveauRai.pattern`, qui ne passe pas par là. | **Supprimée**, avec `patternTexte`. 3 lectures `idme.*` en moins. |
| `interpreterPerformance` + 4 seuils + 4 descriptions | Ses **deux** appelants rangeaient le résultat dans un `interpP` que rien ne lisait. Grep récursif sur tout le dépôt : 2 appels, 1 définition, 1 export, 1 ligne de sentinelle. Aucun appel dynamique par nom. **La consigne la donnait pour vivante — « son résultat s'affiche » — et c'était faux.** | **Supprimée**, avec ses 2 appels, son export `window` et sa ligne dans la sentinelle d'exports. |
| Les bornes `0.85` | Toutes dans la carte SOLO. | Parties avec elle. |
| La carte « Observation de la structure » | Le vrai morceau, et le seul qui demandait de la conception. | **Réécrite.** |

⮕ **CE QUI SE SERAIT PASSÉ SI ON AVAIT SUIVI LA CONSIGNE À LA LETTRE** : on aurait branché
sur l'échelle de l'utilisateur deux fonctions qui n'atteignent aucun écran — c'est-à-dire
rendu vivant du code mort, en croyant appliquer la règle zéro-dette. **Vérifier les
consommateurs avant de brancher n'est pas une précaution, c'est ce qui décide du geste.**

#### La carte, telle qu'elle est maintenant

✅ **DÉCISION DE GRÉGOIRE (27 août) : « un bloc par niveau ».** Les quatre en-têtes
« Forces exceptionnelles / Forces identifiées / Défis en développement / Défis critiques »
disparaissent. Chaque bloc porte le **nom que l'utilisateur a donné à son niveau**, sa
couleur, et les critères qui y tombent.

| | |
|---|---|
| **Ce qui situe** | `obtenirEchelleCommuneDesEvaluations` — un critère est évalué PAR l'échelle de la grille, quelle que soit la pratique. Même source qu'au pas 3c-2, et **différente** de celle de la note globale (3c-1), qui la demande à la pratique. |
| **Ce qui interprète** | `interpreterNiveauAtteint`, donc l'étiquette SOLO du niveau. Absente → le nom du niveau, et l'absence est dite **une fois**, pas une fois par bloc. |
| **L'ordre des blocs** | Par borne `min` décroissante — **pas** l'ordre du tableau `niveaux` : rien n'oblige l'utilisateur à saisir ses niveaux dans l'ordre, et un ordre de saisie n'est pas un ordre de mérite. |
| **Les niveaux non atteints** | N'apparaissent pas. La carte montre la structure **observée**, pas l'échelle en entier. |
| **Sans échelle commune** | La carte affiche la CAUSE (`aucune-evaluation`, `echelle-non-resolue`, échelles divergentes) au lieu de l'ancien « Aucune force ni défi identifié selon la taxonomie SOLO » — un verdict rassurant là où rien n'avait pu être comparé, exactement le défaut A2/A3 refermé par le lot 1. |
| **Les critères hors plage** | Nommés sous les blocs. `situerPourcentageDansEchelle` rend `null` sans repli « niveau le plus proche » (pas 1) : l'absence se dit, elle ne se comble pas. |
| **Les couleurs** | Celles des niveaux de l'utilisateur, **filtrées** : une couleur d'échelle est une donnée utilisateur qui part dans un attribut `style`, et `echapperHtml` n'y neutralise pas l'injection CSS. Seul un hexadécimal est accepté ; `#RGB` est développé plutôt que rejeté. |

**Deux comportements PRÉSERVÉS tels quels**, et il faut savoir qu'ils sont délibérés :

- Le critère **« Français » reste écarté**, son nom toujours écrit dans le code. C'est un
  jugement pédagogique de Grégoire — un critère linguistique ne dit rien de la structure
  cognitive — mais c'est aussi un nom de critère en dur, du ressort de **#529**. Le lot 3
  retire des seuils ; il ne change pas ce qui est observé.
- Les critères à **valeur 0 restent exclus**. Le « 0 » est un **jugement suspendu**, pas une
  performance nulle. L'ancien code les écartait déjà ; le regroupement par niveau les aurait
  fait tomber dans le niveau « 0 » de l'échelle de Grégoire (plage 0-0) et affichés comme un
  résultat.

**Deux options écartées, et pourquoi** — pour qui voudrait les rouvrir :

- *Forces/Défis dérivés de l'étiquette SOLO* (relationnel et au-dessus = force). La règle
  « relationnel = force » serait une valeur métier de retour dans le code, et elle resterait
  muette tant qu'aucune échelle n'est étiquetée — le cas de **toutes** les échelles réelles.
- *Un champ « ce niveau marque la maîtrise » sur l'échelle*. Pas écartée sur le fond — elle
  servirait aussi à **#549**, dont les consignes de cartouche cherchent ce seuil — mais elle
  ajoute un champ, un écran d'édition et une migration. C'est un chantier, pas un pas.

#### Ce qui le verrouille

| Test | Ce qu'il tient |
|---|---|
| `tests/unit/sentinelle-542-3c3-depistage-sans-seuils.test.js` | 4 tests. `interpreterPerformance` absente du `window` (**et ses deux voisines toujours là** — une suppression trop large les emporterait sans que rien ne le dise) · aucune lecture `obtenirSeuil('idme.*')` · aucun en-tête figé ni libellé IDME dans le code · les 4 descriptions concurrentes disparues, **et la table `NIVEAUX_SOLO_ECHELLE` portant toujours les siennes**. ⚠ Le test **retire les commentaires avant de chercher** : les retraits sont documentés sur place et citent le code disparu ; un grep naïf rougirait sur la trace du correctif. |
| `tests/integration/depistage-542-3c3-carte-structure.spec.js` | 2 specs WebKit sur une échelle **W/X/Y/Z** à trois niveaux atteints. Aucun en-tête figé ni libellé IDME · les trois blocs nommés par l'utilisateur · le niveau non atteint sans bloc · les descriptions venues de l'étiquette · **et le cas sans étiquette** : le nom reste, l'absence est dite, une seule fois. |

**Break-tests ROUGES vérifiés** : 4 sur la sentinelle (export réintroduit, seuil `idme.*`
réintroduit, en-tête figé réintroduit, description réintroduite) et 2 sur la spec (titre de
bloc redevenu figé ; avis d'étiquette rendu muet). Restauration confirmée par `diff -q` dans
les deux cas.

**Mesure à l'écran après le dernier changement** : Vitest **3693/3693, 346 fichiers**.
⚠ Ce total inclut les **15 tests d'une session parallèle** (#547, anti-cache au pre-commit)
qui travaillait dans le même arbre au même moment — son fichier était rouge à 10 h 22 et vert
à 10 h 26. Le chiffre est celui de l'arbre partagé à cet instant, pas celui de ce chantier
seul. Playwright : les 2 specs neuves passent ; la suite entière n'a pas été relancée.

**Anti-cache posé** (#547) : `profil-etudiant-helpers.js` `20260827c → d`,
`profil-etudiant-sections-affichage.js` `20260827e → f`. Aucun bump de version ni de build —
la session `file://` de Grégoire est ouverte.

#### Ce qui reste au lot

- **Pas 4** — supprimer `obtenirNiveauSOLO()` (`trimestres.js`), qui redevine SOLO depuis le
  NOM d'un critère et contredit le champ configuré.
- **Pas 5** — le devenir des seuils `idme.*`. ⮕ **Le pas 3c-3 change la donne** : le dépistage
  ne les lit plus du tout. Ce qui reste à mesurer, c'est **qui les lit encore ailleurs**.
- **Le geste de Grégoire** — étiqueter son échelle « 0-IDME » en SOLO. Tant qu'il ne l'a pas
  fait, la carte affichera ses noms de niveaux et l'avis d'étiquette manquante : **c'est le
  comportement attendu, pas une panne.**
