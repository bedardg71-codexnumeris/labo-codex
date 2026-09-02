# Plan — « Annoter et évaluer », avant la chronique

> **Écrit le 2 septembre 2026 à 11 h 50 (heure de Drummondville), par Cowork, avec Grégoire.**
> **Ce n'est pas une consigne** : c'est le plan dont les consignes sortiront, une par séance
> (règle 6). La consigne en cours porte le geste 4 et ne doit pas être remplacée.
>
> **Déclencheur, dans ses mots** : « ma troisième chronique sur l'importation sera publiée
> demain, suivra ensuite la chronique sur l'évaluation. Alors je voudrais évidemment que
> cette partie de l'application fonctionne bien. »
>
> **Périmètre arrêté par lui, le 2 septembre** : le sous-onglet **« Annoter et évaluer »** —
> l'écran de correction lui-même : l'annotation, la grille, les niveaux, la rétroaction,
> l'enregistrement. Le PDF et l'export viendront dans une chronique suivante.

---

## ⚠ LE CROISEMENT AVEC LE LOT EN COURS — à savoir avant de planifier une mesure

`js/evaluation-projection.js` est **dans les deux chantiers** :
· le geste 4 le modifie (l. **163**, **211**, **213** — le mot « français ») ;
· l'écran d'annotation le lit, via `js/evaluation-calcul.js` et `js/evaluation-enonces.js`.

⮕ **Toute mesure prise sur ce fichier avant l'atterrissage du geste 4 est périmée d'avance.**
Ce plan n'y touche pas, et aucune de ses trois étapes n'en dépend.
⮕ **Témoin de la règle de parallélisme** (`PROTOCOLE.md`) : une seule session écrit dans
`js/`. Cowork ne fait que mesurer ; c'est Claude Code qui écrit, un lot à la fois.

---

## CE QUI EST DÉJÀ ÉTABLI — ne pas le refaire

*Mesuré depuis Cowork le 2 septembre entre 11 h 30 et 11 h 50. Chaque ligne porte sa commande.*

### Les « vingt items » : le compte est exact, et la correspondance est complète

Le rapport `Rapports/AUDIT-evaluation-onglet-2026-08-25.md` porte **A1-A2** (2 critiques),
**B1-B13** (13 majeurs) et **C1-C5** (5 de design) = **20**. Sa section **D — « Mineurs
(condensé) » — n'est PAS dans les vingt.**

| Constat | Fiche | État au backlog |
|---|---|---|
| A1 · « Vider la corbeille » déborde | **#556** | livré 28 août |
| A2 · `supprimerEvaluation` en double | **#557** | livré 28 août |
| B1, B2, B3 · la file d'import ne survit pas au rechargement | **#558** | livré |
| B4 · la case marque un fichier étranger | **#559** | livré |
| B5, B8 · suppressions trop larges + garde des modes contourné | **#560** | livré 29 août |
| B6 · réassociation avec jeton de reprise | **#561** | livré 29 août |
| B7 · échappement incomplet dans la Liste | **#562** | livré 29 août |
| B9 · décocher « Reprise ciblée » ne retire rien | **#563** | livré 29 août |
| B10 · l'auto-save ne couvre que les critères | **#564** | livré |
| B11, B12 · un échec avorte le lot ; la synthèse manque en silence | **#565** | livré |
| B13 · écart d'anonymisation + compteur menteur | **#566** | livré 29 août |
| C1 · variables CSS fantômes | **#567** | livré (4 remplacées ; les 78 autres → **#595, ouvert**) |
| C2 · cibles tactiles < 44 px | **#568** | livré 29 août |
| C3 · écran Exporter hors design system | **#569** | livré 29 août |
| C4 · flèches de tri illisibles en mode clair | **#570** | livré 29 août |
| C5 · PDF de rétroaction | **#571** | livré 29 août (les tailles restent, par décision) |
| *(section D, hors des vingt)* | **#572** | déclaré **clos** le 29 août |

⮕ **Le « 19 réglés » se vérifie donc**, à cette nuance près : **#560** a livré le garde des
modes, **pas la règle métier de la portée** — c'est le partiel, et il attend une décision de
Grégoire (« que doit emporter la suppression d'un fichier ? »).

### Les trois constats d'« Annoter » tiennent — remesurés par contenu, pas par numéro de ligne

- **B8** — `grep -rn "db\.setSync(cle(" js/evaluation*.js js/travaux-annotation.js` rend **0**.
  ▣ **Témoin** : `db.setSync` vit encore dans quinze autres fichiers du dépôt, donc le zéro
  mesure quelque chose. Les écritures passent par `sauvegarderDonneesSelonMode` (23 appels).
- **B9** — réglé par **#563**, et mieux que corrigé : la case qui APPLIQUAIT le jeton est
  retirée, la branche autrefois muette avertit (`console.warn` + `notifications.info`), et le
  JSDoc de `retirerJetonDepuisSidebar` dit le manque au lieu de promettre trois types.
- **B10** — réglé par **#564** : `retroactionModifiee()` arme le debounce, câblé par
  `data-on-input`. ⚠ **Résidu nommé dans le code**, pas un défaut : les générations
  automatiques de rétroaction passent par `.value = …`, qui ne déclenche pas `input`. Seule une
  frappe arme le debounce.

---

## ▣ LA TROUVAILLE — la fiche qui a fermé la section D a compté trois sites ; il y en a quatre

**C'est le cœur de ce plan, et c'est une CORRECTION MAINTENANT** (issue 1 de `CLAUDE.md`) :
ça touche le parcours qu'on est en train de livrer, celui de la chronique.

`#572` dit, dans le code comme au backlog :

> `// #572 — LA VALEUR CALCULÉE EST LA SOURCE, l'écran n'en est que l'affichage.`
> « la note finale n'est plus relue depuis le DOM (`parseFloat(textContent)`, **trois sites**)
> mais depuis `noteCalculeeCourante` »

**Mesure, à rejouer :**

```bash
grep -rn "noteCalculeeCourante" js/ --include=*.js
grep -rn "parseFloat(.*noteProduction1" js/ --include=*.js
```

▣ **Trois sites écrivent bien la valeur calculée** : `evaluation-sauvegarde.js:209`,
`evaluation-chargement.js:1452`, `evaluation-chargement.js:1476`.
▣ **Un quatrième relit toujours l'écran** — `js/evaluation.js:1784`, dans
`_lireChampsDOMMod`, appelé **une seule fois**, à `js/evaluation.js:1959` :

```js
noteFinale: parseFloat(document.getElementById('noteProduction1').textContent) || 0,
```

⮕ **`evaluation.js:1959` est le chemin de MODIFICATION d'une évaluation existante** (il pose
`verrouillee: true` et écrit par `sauvegarderDonneesSelonMode('evaluationsSauvegardees', …)`).
Autrement dit : **rouvrir une copie déjà corrigée et la réenregistrer réécrit sa note depuis
l'affichage.**

### ⛔ ET LA SENTINELLE EST VERTE, PARCE QU'ELLE NE REGARDE QUE DEUX FICHIERS

`tests/unit/sentinelle-572-mineurs-liste-annoter-design.test.js`, cas
*« le calcul pose noteCalculeeCourante (nombre ou null), et plus personne ne relit le DOM »* :

```js
for (const [nom, src] of [['evaluation-sauvegarde', sauvegarde], ['evaluation-chargement', chargement]]) {
    expect(src, nom).not.toMatch(/parseFloat\([^)]*noteProduction1/);
```

**`evaluation.js` n'est pas dans la liste.** Le titre du cas dit « plus personne » ; il vérifie
deux fichiers sur trois. ⮕ **C'est la leçon du matin, mot pour mot** : *un cas qui touche une
donnée ne la garde pas forcément ; « il y a un test dessus » ne dit pas lequel des invariants il
tient.* Et sa variante de ce matin aussi : **un « fini quand » qui cherche un MOT dans une liste
de fichiers choisie à la main se trompe de cible.**

### Ce que ça produit — inféré par lecture, PAS ENCORE EXÉCUTÉ

⚠ **Aucun de ces deux effets n'a été reproduit à l'écran.** Ils se déduisent du code lu. **Les
reproduire est la première tâche du temps 2, avant tout correctif.**

1. **L'arrondi.** L'affichage est posé par `evaluation-calcul.js:917` :
   `pourcentage.toFixed(1) + ' %'`. Modifier une évaluation stockerait donc la note **arrondie
   au dixième**, pas la valeur calculée. Écart max 0,05 point — petit, mais c'est exactement ce
   que #572 déclarait avoir supprimé.
2. **Le zéro.** Si l'élément n'affiche pas un nombre à cet instant — `--`, vide, ou un rendu
   différé (le motif #321 est nommé dans le commentaire de #572) — `parseFloat` rend `NaN`, et
   le `|| 0` écrit **0**.
   ⮕ **C'est le zéro silencieux de #674, par une deuxième porte.** Et les trois chemins
   « corrigés » ne sont pas indemnes : `evaluation-calcul.js:806` pose
   `noteCalculeeCourante = null` quand rien n'est calculable, et `evaluation-sauvegarde.js:209`
   comme `evaluation-chargement.js:1476` retombent alors sur `: 0`.
   **Les quatre chemins écrivent 0 quand la note n'est pas calculable, par deux mécanismes.**

---

## LE PLAN, EN TROIS TEMPS

*Une seule décision principale par séance (règle 6) : ces trois temps sont trois séances, pas
un lot. L'ordre est celui du risque, pas de la commodité.*

### TEMPS 1 — fermer l'audit du 25 août pour de bon *(une demi-séance, aucune décision de Grégoire)*

`CLAUDE.md` : *« Un audit n'est pas terminé quand il est déposé. Il l'est quand chaque constat
porte, DANS le fichier d'audit, l'une de trois dispositions : inscrit (n°), refusé (motif),
périmé. »* Mesuré le 1er septembre : sur 51 rapports, **22 sans suite**. Celui-ci en est un —
**il ne porte aucune disposition**, et le compte des livraisons vit ailleurs (backlog,
`OU-EN-EST-ON.md`).

1. Inscrire les dispositions dans `Rapports/AUDIT-evaluation-onglet-2026-08-25.md` lui-même,
   d'après la table ci-dessus. **Elle est faite : c'est de la transcription, pas de la
   recherche.**
2. Marquer **#560** *partiel* et dire ce qui manque (la règle métier de la portée, due par
   Grégoire), plutôt que « livré ».
3. Marquer **C1/#567** *partiel* → renvoi à **#595** (78 variables CSS fantômes, ouvert) et
   **#679** (rien ne vérifie qu'une classe CSS employée existe).
4. **Corriger la ligne fausse** : #572 dit « trois sites » ; il y en a quatre. La disposition de
   la section D devient *partiel*, avec le renvoi au temps 2.

⮕ **Fini quand** : chaque constat A1-A2, B1-B13, C1-C5 et la section D portent leur disposition
dans le fichier d'audit, et le fichier dit sa base de remesure (1.109.x, 2 septembre) à côté de
sa base d'audit (1.99.0, 25 août).

### TEMPS 2 — le quatrième site, puis le calcul de la note *(une séance)*

**a) Reproduire avant de corriger.** Les deux effets ci-dessus sont **lus, pas exécutés**.
⮕ Un test qui rejoue le chemin de modification et vérifie ce qui atterrit dans
`evaluationsSauvegardees` : rouge d'abord, avec la valeur non arrondie sous les yeux.
⚠ Et un cas qui met l'affichage dans l'état non numérique — c'est ce cas-là qui départage
« arrondi bénin » et « zéro qui remplace une note ».

**b) Corriger le quatrième site** : `_lireChampsDOMMod` lit `window.noteCalculeeCourante`,
comme ses trois sœurs.

**c) Réorienter la sentinelle, ne pas l'élargir bêtement.** ⮕ Ce qu'elle doit garder :
*aucun fichier de `js/` ne relit la note depuis `#noteProduction1`* — la liste des fichiers se
DÉDUIT du dépôt, elle ne s'écrit pas à la main. Break-test : réintroduire le `parseFloat` dans
`evaluation.js` doit la faire rougir ; aujourd'hui, ça ne change rien.

**d) Puis l'audit de la zone jamais regardée.** L'en-tête du 25 août dit son périmètre :
*« enregistrements, logique, PDF de rétroaction et design »*. **Le calcul de la note n'y est
pas.** La chaîne fait 2 500 lignes : `evaluation-calcul.js` (1046), `evaluation-projection.js`
(642, ⚠ **attendre l'atterrissage du geste 4**), `evaluation-enonces.js` (450),
`evaluation-formules.js` (362).
⮕ **La question directrice, une seule** : *par quels chemins une note peut-elle être écrite
sans être calculée, ou calculée sur une pondération incomplète ?* **#674 est dans cette zone**,
et sa forme est déjà tranchée : persister `ponderationTotal` à côté de `noteFinale` — **pas**
un état « brouillon / conclue », explicitement écarté.
⚠ **TARIR N'EST PAS RÉPARER** : les notes déjà écrites chez les gens ne bougent pas. On mesure,
on sépare, on propose. ⛔ Et les notes d'A2025 et d'H2026 ne se rouvrent pas.

### TEMPS 3 — le parcours exécuté, celui de la chronique *(une séance, et une partie est à Grégoire)*

**Le manque, nommé** : vingt constats lus, **zéro écran parcouru**. C'est ce qui sépare « fait »
d'« éprouvé par Grégoire », et c'est la chronique qui tranche.

1. **Un parcours Playwright** qui va au bout d'une correction : ouvrir une copie, annoter, poser
   les niveaux, écrire la rétroaction, enregistrer, **rouvrir et réenregistrer**, et vérifier
   que la note stockée est la note calculée. ▣ **Le dépôt en porte déjà 82** dans
   `tests/integration/`, dont `triptyque-seme-produit-une-note.spec.js` et
   `evaluation-chargement.spec.js` : **le patron existe, ne le réinvente pas.**
2. **Le passage à la main de Grégoire**, que rien ne remplace : l'écran réel, sur Mac **et sur
   iPad** — ce sont deux parcours, pas un.
3. ⮕ **La ligne d'`OU-EN-EST-ON.md` ne passe pas à « fait » sans sa phrase « vérifié comment »**,
   et elle ne passe à « éprouvé par Grégoire » que par un passage réel dans l'écran.

---

## CE QUI EST DÛ PAR GRÉGOIRE, ET QUE CE PLAN NE PEUT PAS CONTOURNER

- **La règle métier de #560** : que doit emporter la suppression d'un fichier ? Elle bloque le
  partiel du 25 août et le geste 8.
- **Le passage à la main** sur Mac et sur iPad, au temps 3.
- **Le parcours exact de la chronique**, s'il se précise en l'écrivant : c'est lui le test de
  réception, et il peut élargir le périmètre.

## CE QUI N'EST PAS DANS CE PLAN, ET POURQUOI

*Issue 2 de `CLAUDE.md` — inscrire et continuer. C'est le défaut.*

- **Le PDF de rétroaction et l'export** (#565, #566, #571 livrés ; C5 partiel par décision) :
  hors du périmètre arrêté, ils relèvent d'une chronique suivante.
- **#595** (78 variables CSS fantômes) et **#679** (rien ne vérifie qu'une classe existe) :
  réels, hors du parcours de correction.
- **#596** (six clés `sessionStorage` non namespacées) : sorti de #572, ouvert, hors périmètre.
- **La hiérarchie h2/h3** : porte terrain jamais relevée, du confort, aucun des huit énoncés.
