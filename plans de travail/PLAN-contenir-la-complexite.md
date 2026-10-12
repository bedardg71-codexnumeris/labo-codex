# Contenir la complexité : un cliquet sur les fonctions

> **Statut : PROPOSÉ, non lancé.** Rédigé le 12 octobre 2026 par Claude Code (session du nuage), à la
> demande de Grégoire : « développe le chantier contenir ». **Aucun code n'a été touché** : les chiffres
> ci-dessous viennent d'une maquette jetable, exécutée hors du dépôt.
>
> **Source** : `ETAT-PROJET.md` §00 (grille d'audit remesurée, tableau de bord de la complexité).
> **Hors de la ligne d'arrivée** de `OBJECTIF-COHORTE-1.md` : ce chantier ne change rien à l'application,
> il ajoute un banc. Il relève de l'objectif que Grégoire a fixé le 11 octobre : contrôler la complexité.

---

## 1. Le but

« Contenir » est le premier des trois chantiers candidats du §00.6 (contenir, simplifier, assainir) :
**empêcher la complexité de remonter pendant qu'on la réduit.** Sans lui, une simplification est reprise
par la croissance. C'est ce qui s'est passé depuis mai (mesuré, §00) :

- `genererSectionMobilisationEngagement`, actée en mai comme héritage « sous N=50 », est passée de 43 à 64 ;
- `executerImportSelectif` est passée de 118 à 130 ;
- les fonctions à complexité > 30 sont passées de 80 (25 mai) à 91 ;
- `planification-carte.js` a presque doublé (4 536 → 8 267 lignes de code).

---

## 2. Ce que les mesures disent

Maquette du 12 octobre, sur `304c3b58` (1.198.0), avec `acorn` 8.19.

### 2.1 Fidélité : la maquette retrouve exactement la mesure du §00

| Indicateur | Maquette (acorn) | Référence (§00) |
|---|--:|--:|
| Fonctions mesurées | 13 240 | 13 240 (ESLint 8.57) |
| Fonctions dont la complexité diffère d'ESLint | **0** | — |
| Fonctions cyc > 15 / > 30 / max | 465 / 91 / 130 | 465 / 91 / 130 |
| Lignes de code (`js/`) | 152 050 | 151 094 (cloc) |
| Fichiers > 1 000 lignes de code | 36 | 36 |
| Durée | 1,8 s pour 208 fichiers | — |

Les lignes de code sont les lignes qui portent au moins un jeton. L'écart avec cloc est de 0,7 % ; le plus
grand est dans `travaux-outils.js` (+429, des chaînes sur plusieurs lignes que cloc classe autrement).

### 2.2 Friction : combien de commits chaque règle aurait arrêtés

Sur les **30 commits qui touchent `js/` du 9 au 11 octobre** (lots 1 à 7 ; c'est tout l'historique du clone
du nuage, qui est superficiel) :

| Règle | Commits qui l'auraient fait échouer |
|---|:-:|
| Un fichier de plus de 1 000 lignes ne grossit pas | **21 / 30** (16 sans `changelog-data.js`) |
| Aucun fichier ne franchit 1 000 lignes | 0 / 30 |
| Une fonction au-dessus de 30 ne monte pas | 3 / 30 |
| Aucune fonction ne franchit 30 | 0 / 30 |
| Le nombre de fonctions au-dessus de 15 ne monte pas | 2 / 30 |

Les trois hausses au-dessus de 30 : `executerImportSelectif` 133 → 134, `assainirObjet` 42 → 43,
`actionExporterSelection` 35 → 37.

**Lecture.** Geler la taille des gros fichiers arrêterait plus d'un commit sur deux, presque tous des
correctifs : ce serait un frein, pas un garde-fou. Les règles sur les fonctions n'arrêtent presque rien, et
chaque fois à l'endroit précis où la question mérite d'être posée : « extraire, plutôt qu'ajouter une
branche de plus ? »

⚠ **Limite** : trois jours de lots. L'échantillon peut se remesurer sur tout l'historique, depuis le clone
complet du Mac, si Grégoire le veut avant de décider.

---

## 3. Ce que le cliquet garde

### 3.1 Bloquant

Ces règles tournent dans Vitest, donc au hook pré-push et dans le job `vitest` de la CI, à chaque push.

1. **Aucune fonction neuve au-dessus de 30.** Les 91 fonctions actuelles sont figées une à une ; leur
   complexité ne peut que descendre.
2. **Le nombre de fonctions au-dessus de 15 ne peut que descendre** (465 au 11 octobre).
3. **Aucun fichier ne franchit 1 000 lignes de code.** Les fichiers de données en sont exclus par leur
   nom : `changelog-data.js`, qui grossit à chaque release par construction, et `pack-demo-10.js`.

**La liste suit le code** (même règle que `sentinelle-858`) : quand une fonction figée descend, le banc
échoue tant que sa valeur n'est pas abaissée. Sans cette règle, le cliquet ne cliquerait jamais.

**Une hausse assumée reste possible**, mais elle s'écrit : on relève la valeur de la fonction dans la liste,
avec une ligne qui dit pourquoi. La croissance devient une décision visible dans le diff, que Cowork lit à la
relecture. C'est la convention de `TOLEREES` dans `sentinelle-858` et de `SEUIL_SUSPECTS_MAX` dans
`lint-securite.test.js`, le cliquet `innerHTML` qui existe déjà.

### 3.2 Non bloquant, mais mesuré

4. **La taille des 36 gros fichiers.** Le module de mesure l'imprime avec le reste. **Option, à décider par
   Grégoire** : une ligne dans le relais de chaque release (« complexité : Δ lignes des gros fichiers, Δ > 15,
   Δ > 30 »). Elle ajoute un geste au rituel de release, que Cowork partage.

---

## 4. Comment (choix techniques, tranchés ici)

- **Une seule source de mesure** : `tests/unit/_helpers/complexite.js`. Le banc l'importe ; lancé à la main
  (`node tests/unit/_helpers/complexite.js`), il imprime les chiffres du §00.3 qu'il sait calculer. Il vit
  dans `tests/` parce que sa dépendance s'y trouve : un module placé dans `scripts/` ne la trouverait pas.
- **Parseur : `acorn`**, en `devDependency` de `tests/`. Aucune dépendance propre, jamais chargé par
  l'application. Écartés : ESLint (des dizaines de dépendances pour une seule règle) ; `rollup/parseAst`,
  déjà installé mais par Vitest, qu'une montée de version pourrait retirer sans prévenir.
- **Définition de la complexité** : celle de la règle `complexity` d'ESLint 8.57, comme en mai. +1 par
  `if`, `?:`, `&&` / `||` / `??`, `for` / `for…in` / `for…of`, `while` / `do…while`, `catch`, `case` avec
  test, affectation logique (`&&=`, `||=`, `??=`). Le chaînage optionnel et les paramètres par défaut ne
  comptent pas (ESLint 9 les compte) : c'est ce qui garde la comparaison possible avec mai.
- **Identité d'une fonction figée** : fichier + nom (déclaration, variable, propriété ou affectation). 84 des
  91 en ont un. Les 7 rappels anonymes (`groupe.js`, `impact-jetons.js`, `liste-evaluations.js` ×3,
  `main.js`, `travaux-ui.js`) sont figés par fichier, comme une liste de valeurs.
- **Exclusion nommée** : `js/pratiques/pratique-interface.js`, de la documentation sous l'extension `.js`,
  que le parseur refuse. Le banc vérifie que la liste des fichiers non analysables est exactement celle-là :
  un fichier qui deviendrait illisible ne doit pas sortir de la mesure en silence.
- **Garde-fous du banc** (règle 10 de `PROTOCOLE.md`) : il affirme avoir lu plus de 200 fichiers et plus de
  10 000 fonctions. **Break-tests avant le commit** : une fonction témoin à 31 fait rougir ; une fonction
  figée qui monte sans que sa valeur soit relevée fait rougir ; une fonction figée qui descend sans que la liste suive fait rougir.
- **Coût** : environ 2 s de plus sur une suite Vitest d'environ 136 s.
- **Fichiers touchés** : `tests/package.json` et `tests/package-lock.json` (acorn), le module, le banc.
  **Aucun fichier de `js/`, ni `index.html`, ni `styles.css`.** Pas de release : rien n'est visible à l'usage.

---

## 5. Ce qui n'est pas dans ce lot

- **Cycles et couplage (3.3)** : porter en `node` les scripts Python de mai, en corrigeant le défaut de
  `DEFINE_RE` (§00.3), dans le même module. Lot 2 possible ; pas maintenant, parce que 19 des 37 cycles sont
  internes aux familles découpées en mai et que leur lecture reste à faire.
- **Duplication** : elle baisse déjà (1,44 % → 1,12 %), et jscpd est une dépendance lourde.
- **Réduire les points chauds** : chantier « simplifier ». **Analyse statique de sécurité** : chantier
  « assainir ».

---

## 6. Ce qui revient à Grégoire

1. **Lancer ou non, et quand.** Le cliquet change la façon de travailler de Cowork et de Claude Code : une
   hausse sur une fonction figée devient une décision écrite, environ une fois par journée de lots si
   l'échantillon du §2.2 est représentatif.
2. **L'option du §3.2** : une ligne de complexité dans le relais de chaque release, oui ou non.
3. **Qui l'implémente** : la session du Mac, dans la file de Cowork, ou une session du nuage sur une branche.

Le chantier n'a pas de numéro au BACKLOG : il en recevra un s'il est lancé (règle du 24 août : il bloquerait
alors un chantier en cours).
