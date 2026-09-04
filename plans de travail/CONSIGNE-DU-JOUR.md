# Consigne du jour — le texte troué, étape 2 : les paliers de projection se composent avec des badges

> **Écrite le 4 septembre 2026 en fin d'après-midi, par Cowork, après la clôture du lot 4.**
> **Application au moment de l'écriture : `1.117.1`, build `0904-1507`, EN LIGNE** (run GitHub 33910422885 vert).
> ▣ **État mesuré à l'écriture** : `origin/main` = `main` = `fd2b4ce6` ; arbre propre hors les fichiers de Cowork
> (`OU-EN-EST-ON.md`, ce fichier, l'archive de l'ancien, `00-CADRAGES-OUVERTS.md`, le cadrage « codes par
> grille »). **Ils partent avec ton premier commit.**
> ⚠ **Si tu lis ceci plus de quelques heures après son écriture, remesure avant d'exécuter.**
> ⚠ **Ton propre bloc de clôture dans `SESSION.md` (bloc 24) fait foi sur l'état mesuré ci-dessus.**
> ⚠ **Nouvelle règle 7 (`PROTOCOLE.md`, hier soir)** : on ne retient plus un push pour laisser finir un run
> GitHub ; le jeton local reste le dernier geste avant chaque push.

---

## Ce que cette consigne produit à l'écran, pour Grégoire

Dans le gabarit d'un critère algorithmique, carte « Projection », la phrase **« Ce que l'élève lit »** d'un
palier ne se tape plus avec des accolades : il pose des badges (`erreurs`, `mots`, `projection`, `seuil`,
`service`…) dans sa phrase, comme il le fait déjà pour les quatre énoncés d'observation depuis l'étape 1.
Une prévisualisation lui montre la phrase remplie pour une copie d'exemple. **Rien avant son coup d'œil** :
une seule livraison, 1.118, à la fin.

La maquette est l'artefact « Le texte troué » (favicon 🏷️), sections 2 et 3, que Grégoire a remontré le
4 septembre. ⚠ **Elle montre le geste, pas le comportement** (cadrage, « Les maquettes »).

---

## 1 · Lis d'abord

1. `PROTOCOLE.md` (règles 1, 2 et 7), puis `OU-EN-EST-ON.md`.
2. **`plans de travail/CADRAGE-2026-09-02-badges-texte-troue.md`** — d'abord « ⚠ LA DISTINCTION QUI COMMANDE
   TOUT LE RESTE », puis « ↻ DÉCISION DE GRÉGOIRE — 2 septembre » (les six arrêtés) et « ▣ LE MÉCANISME DE
   GLISSÉ EXISTE DÉJÀ » (⛔ pas de `dragstart`/`drop` : iPadOS).
3. Ton bloc 24 dans `SESSION.md`, par `grep -n "1.117" SESSION.md`, jamais en entier.

---

## 2 · D'ABORD la carte, PAS le code (règle 2 : ce qui voyage)

Le texte d'un palier est enregistré **dans la grille** et voyage avec elle (partage, import, archives). Le
composer avec des jetons change ce format. **Cartographie, rends la carte à Cowork, attends sa relecture
avant d'écrire une ligne de code.** Mesure et écris, avec commande et témoin :

- **a) Ce que l'étape 1 a livré, et ce qui se réemploie tel quel** : `rendreBlocEnoncesAlgo`
  (`grilles.js:3567`), `insererRepereEnonce` (`:5449`), `window.enoncesAlgo.insererRepere`, l'attribut
  `data-jeton`, les repères de `reperesDeCle`. ▣ Mesuré depuis Cowork : c'est un **bouton par repère qui insère
  le jeton au curseur** dans une zone de texte — pas un badge glissé dans une phrase comme la maquette. Dis
  si l'étape 2 reprend ce composeur (recommandation de Cowork : **oui, le même**, un composeur pour tout le
  gabarit ; la maquette « badges dans la phrase » est l'étape 3, les accolades qui disparaissent).
- **b) Ce que la projection SAIT par élève, donc ce qu'un jeton peut remplir** : `_resultat`
  (`evaluation-projection.js:~505`) porte `ratio`, `motsParErreur`, `seuilMotsParErreur`, `palier`, et les
  `params` (`nomServiceAide`) ; le nombre d'erreurs et de mots de la copie sont en amont. ▣ Aujourd'hui le
  texte d'un palier ne connaît qu'**UN** jeton, `{service}` (`JETON_SERVICE`, `:71`), et seulement dans
  `texteAide`. ⚠ La maquette en montre sept (`service`, `seuil`, `longueur`, `erreurs`, `mots`,
  `projection`, `niveau`) ; **liste ceux que le moteur peut réellement remplir**, avec la valeur exacte de
  chacun (ex. `projection` = « 14 erreurs pour 900 mots » ou « 14 » ?). Les **noms** des jetons remontent à
  Grégoire (mots que les collègues lisent) : propose-les dans la carte, Cowork les lui porte.
- **c) Le préfixe ENGENDRÉ** : « Tu fais en moyenne 1 erreur à chaque N mots. » (`_resultat`, `prefixe`) est
  ajouté par le code devant le verdict, jamais écrit par l'enseignant. Avec des jetons, l'arrêté 3 dit que
  **l'enseignant écrit la phrase entière**. Deux voies : le préfixe devient un jeton (`{moyenne}` ?) que le
  gabarit neuf place dans son texte de départ, et un texte SANS jeton garde le préfixe engendré (les grilles
  existantes ne changent pas) ; ou le préfixe reste toujours. **Mesure ce que les grilles existantes
  perdraient dans chaque voie, et recommande ; la décision est à Grégoire** (ce que l'élève lit).
- **d) Où les deux textes du palier s'enregistrent et se lisent** (`texte`, `texteAide` ; `_paliersRetenus`,
  `:296`, et ce que le partage/l'import projettent) : un jeton inconnu d'une version antérieure de
  l'application chez un collègue — que rend-il ? (il lit `{erreurs}` tel quel ?). Dis-le : c'est le risque de
  ce lot.
- **e) La prévisualisation** (arrêtés 4 et 5) : au niveau du gabarit, sur des copies d'exemple, dont une
  non corrigée. Mesure d'où les copies d'exemple peuvent venir sans toucher aux données de personne (le pack
  de démonstration ? trois copies fictives codées dans le gabarit ?) et propose.

**Ce que tu rends à Cowork** : `plans de travail/CARTE-2026-09-0X-texte-troue-etape-2.md` avec a-e, et les
deux questions à Grégoire (les noms des jetons ; le préfixe engendré). **Puis tu attends.**

---

## 3 · Après la carte et les décisions — l'écriture, un commit par volet

> ↻ **Écrit le 4 septembre 2026 à 17 h 20 (Toronto), par Cowork, après relecture de la carte
> `CARTE-2026-09-04-texte-troue-etape-2.md`** (cinq mesures rejouées, rien à lui opposer) **et les deux
> réponses de Grégoire** (17 h 15). L'état mesuré n'a pas bougé : `fd2b4ce6`, 1.117.1, jeton local vert sur
> ce commit.

### Les deux décisions de Grégoire — au mot

1. **Les noms des badges, arrêtés (« ça va ! »)** : posés (bleu) `service` · `seuil` · `longueur` ;
   remplis (vert) `erreurs` · `mots` · `moyenne` · `projection` · `palier`. `palier` remplace le
   `niveau` de la maquette. Le niveau IDME, la note, le lien du service et le facteur ne sont pas offerts.
2. **Le préfixe engendré devient le badge `moyenne` (« oui »)** : une phrase de palier **sans aucun jeton
   connu du registre** garde le préfixe engendré tel quel (les grilles existantes ne changent pas) ; **dès
   qu'elle porte un jeton, elle est entière**. Discriminant : « aucun jeton connu », pas « aucune
   accolade ». Sous les paliers, une ligne : « Une phrase sans badge est précédée de “Tu fais en moyenne
   1 erreur à chaque N mots.” Dès qu'elle porte un badge, elle est entière : c'est toi qui l'écris. »

### Ce qui reste arrêté (inchangé)
- le composeur de l'étape 1 sert aux deux champs de chaque palier (« Ce que l'élève lit », « Phrase de
  recommandation ») — un composeur à deux registres, la pose commune ; `{service}` reste ce qu'il est ;
- **le mot est « observation »** dans le gabarit (jamais « rétroaction ») ;
- un texte enregistré sans jeton se rend exactement comme avant (témoins : le golden #668 et le spec des
  énoncés passent sans modification) ;
- `{projection}` rend le nombre seul (décision de Claude Code, carte §b) ; `{s}` accorde le pluriel après
  `{erreurs}` comme dans les énoncés ;
- un jeton **inconnu** reste en place au rendu et **se dit dans le gabarit** (ligne orange sous le palier,
  carte §d) ; un jeton connu non fourni disparaît avec son espace de tête ;
- ⛔ pas de `dragstart`/`drop` ; ⛔ rien dans les données de personne ; ⛔ aucune sentinelle du calcul ne change.

### L'ordre des volets — un commit par volet, dans cet ordre

**Volet 1 — le registre** (`js/evaluation-projection.js` seul). Les huit jetons déclarés dans le module de
la projection (nom, famille posé/rempli, valeur exacte de la carte §b) ; `_texteDuPalier` remplit `texte` ET
`texteAide` ; le préfixe engendré n'apparaît que si `texte` ne porte aucun jeton connu ; `{s}`. Sentinelle
Vitest en Node sur le module réel : chaque jeton sur les quatre couples de la carte (0/460, 4/460, 15/584,
59/460), le cas « Sans erreur » (`moyenne` vide → le jeton part avec son espace), le texte sans jeton qui
rend l'octet près ce qu'il rend aujourd'hui, le jeton inconnu laissé en place — **break-testée** (fais
échouer chaque cas une fois, dis comment). Témoin : le golden #668 et `grep -c "projectionAlgo.calculer"
js/evaluation-calcul.js` toujours 1.

**Volet 2 — le gabarit** (`js/grilles.js`, `js/evaluation-enonces.js`, `styles.css`, `index.html` pour le
bump des jetons). `insererRepere` ouvert d'un 5e paramètre `palette` (les neuf cas de l'étape 1 ne bougent
pas) ; `insererRepereEnonce` ouvert d'un chemin d'écriture par `dataset` (`palierIndex` + `champ` →
`_muterPalier`) ; la palette rendue sur les deux zones de chaque palier, mêmes classes, même `data-action`,
mêmes gardes iPad ; la note « Écris {service}… » tombe ; la ligne sous les paliers (décision 2) ; la ligne
orange du jeton inconnu. Mesure et dis ce que font 16 palettes sur un gabarit à six paliers (question 4 du
cadrage) : si c'est illisible, une seule palette par palier au-dessus des deux zones, et dis-le comme ton choix.

**Volet 3 — l'aperçu** (`js/grilles.js`). Une carte « Ce que l'élève lira » sous « Projection » : copies
fictives dérivées des paliers (une par palier, plus une non corrigée), décompte du bloc 3 puis texte de
projection, dans l'ordre de `_construireRetroactionAlgoCategories` ; une ligne dit ce que l'aperçu ne montre
pas (la rétroaction du sous-critère dominant). Rendu pur, aucun état dans la grille.

**Volet 4 — le spec WebKit** (`tests/integration/`). Poser deux jetons dans un palier par le bouton,
enregistrer, rouvrir, lire l'aperçu d'une copie d'exemple. ⛔ Aucun `page.click` à l'aveugle ni
`waitForTimeout` (règle du 4 septembre) : `grep -n "page.click\|waitForTimeout"` sur le spec rend zéro.

**Puis** : relecture croisée de Cowork (format qui voyage : obligatoire), coup d'œil de Grégoire, verdict au
jeton, release MINEURE 1.118 avec UNE entrée de changelog dont les mots sont à lui — et qui **nomme la
contrainte** « corrige avec l'application à jour » (carte §d : un onglet 1.117 qui corrige une grille 1.118
écrit `{erreurs}` dans l'évaluation).

▣ **Ce que Grégoire verra à l'écran quand c'est livré** : dans le gabarit d'un critère algorithmique, carte
« Projection », chaque palier a ses boutons de badges au-dessus de ses deux zones ; en dessous, la carte
« Ce que l'élève lira » montre une phrase par palier, remplie, et une copie non corrigée sans projection.

## 4 · L'ordre de la séance

```
carte (§2) → relecture de Cowork → décisions de Grégoire (noms des jetons, préfixe)
  → code, un commit par volet → relecture croisée (format qui voyage : obligatoire)
  → coup d'œil de Grégoire : ce qui est cassé se corrige, ce qui est une envie va au lot suivant
  → verdict au jeton → release MINEURE 1.118, UNE entrée de changelog dont les mots sont à lui → push
```

⛔ Hors périmètre, cadré ailleurs : la fusion des listes sous-critères + codes (cadrage codes par grille,
points 7-8) ; le cadrage design (corbeille, chevrons, empilement iPad) ; les badges que l'enseignant invente
(étape 3+).
