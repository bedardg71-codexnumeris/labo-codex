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

⚠ **Ne pas coder avant que Grégoire ait tranché.** Le §6 du plan liste le devenir des seuils
`idme.*` comme « à trancher dans ce lot, pas avant » — c'est ici que ça se joue.

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

**Ouvert au backlog, dans l'ordre où ça devient gênant :**

- **#545** — pourquoi l'échelle a été ré-orphelinée. **Tant qu'on ne le sait pas, la réparation du
  26 peut se défaire.** C'est le plus urgent des trois.
- **#544** — les 44 `ECHELLE_DEMO` de H2026. Un `await oracle542('ECHELLE_DEMO')` suffit à savoir.
- **#543** — les 56 évaluations dont la note ne se recalcule pas (deux causes distinctes).
- **#546** — le « jugement suspendu » n'est plus saisissable depuis #526. **À trancher avec Grégoire.**
