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

## 5 · Retouche du coup d'œil de Grégoire — l'aperçu vient sous chaque palier (4 septembre, 18 h 38)

> **Relecture croisée de Cowork sur `dccaf3d2` : rien à corriger** (format qui voyage intact — `git diff
> origin/main..HEAD -- js/import-export.js js/partage-schemas.js js/partage-validation.js js/evaluation-calcul.js`
> rend zéro ; texte sans jeton rendu à l'identique par l'ancien et le nouveau module ; les deux décisions
> appliquées au mot ; `echapperHtml` aux deux sites de rendu). Les quatre choix pris seuls sont retenus.
>
> **Coup d'œil de Grégoire** : les phrases sont « très naturelles ». Ce qui cloche, c'est LA PLACE de
> l'aperçu : on compose dans le palier, on lit le résultat dans une autre carte, plus bas, repliée.
> **Décision de Grégoire (« ça va, bonne recommandation »)** : l'aperçu vient sous chaque palier.
> C'est une correction du lot, pas une envie : l'aperçu est la moitié de ce lot (arrêtés 4 et 5).

**Ce que Grégoire verra** : dans la carte « Projection », directement sous les deux zones de chaque palier,
une ligne grise « L'élève lira : » suivie de la phrase remplie pour la copie fictive de ce palier (décompte
du bloc 3 puis projection, comme aujourd'hui), mise à jour à chaque frappe. En bas de la carte
« Projection », une seule ligne : « Copie non corrigée : aucune phrase avant la correction. » La carte
« Ce que l'élève lira » n'existe plus.

**Ce qui est arrêté** :
- un seul fichier de code : `js/grilles.js` (plus `styles.css` si la ligne a besoin d'une classe, et
  `index.html` pour le bump des jetons) ; `evaluation-projection.js` ne bouge pas — `copiesExemple` sert
  tel quel, la copie de chaque palier se retrouve par sa `cle` ;
- rendu pur, aucun état ; le gabarit se redessine à chaque frappe, l'aperçu suit ;
- la ligne du badge inconnu (orange) reste sous le palier, AU-DESSUS de la ligne « L'élève lira : » ;
- la note « aucune donnée d'élève ; l'aperçu ne montre pas la rétroaction du sous-critère dominant » reste,
  une fois, en bas de la carte « Projection », avec la ligne de la copie non corrigée ;
- `echapperHtml` sur tout texte rendu ;
- les sentinelles de l'aperçu (`sentinelle-texte-troue-etape-2-apercu.test.js`) se déplacent avec lui : même
  cas, nouveau site — dis lesquels ont dû changer et pourquoi, break-test sur au moins un ;
- le spec WebKit du volet 4 lit l'aperçu à sa nouvelle place ; ⛔ toujours pas de `page.click` à l'aveugle
  ni `waitForTimeout`.

**Un commit**, puis rends-le : Cowork relit en une passe courte, Grégoire regarde, verdict au jeton,
release mineure 1.118 (les mots du changelog sont à lui, Cowork les lui proposera), push.

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

## 6 · Le lendemain matin, 5 septembre — finir 1.118, puis passer à la journée (écrit le 4 à 19 h 12, par Cowork)

> Grégoire a arrêté sa journée le 4 à 19 h, la retouche du §5 rendue ou en cours. **Rien n'est poussé** : `main`
> a cinq (ou six) commits d'avance, 1.117.1 reste en ligne. Cet ordre est celui du matin, dans l'ordre.

1. **Remesure** (`git --no-optional-locks log --oneline -7`, `cat version.json`, `git status --short`) et dis en
   une ligne où en est la retouche du §5 : rendue (quel commit) ou pas.
2. Si elle n'est pas rendue : fais-la (§5), un commit, rapport à Cowork.
3. **Cowork relit la retouche** (une passe courte : l'aperçu sous chaque palier, `echapperHtml`, les sentinelles
   déplacées), puis **coup d'œil de Grégoire** (Conception › Grilles › un critère algorithmique › carte
   « Projection » : la ligne « L'élève lira : » sous chaque palier, qui change quand il tape).
4. **Les mots du changelog** : Cowork propose à Grégoire l'entrée de 1.118 (elle DOIT nommer la contrainte
   « corrige avec l'application à jour ») ; il corrige ; tu l'écris telle quelle.
5. Verdict au jeton (`scripts/pousser.sh`), **release MINEURE 1.118**, push. On n'attend pas le run (règle 7).
6. **Puis, sans autre consigne** : archive ce fichier sous
   `plans de travail/_ancienne-CONSIGNE-DU-JOUR-2026-09-04-texte-troue-etape-2.md`, renomme
   `plans de travail/CONSIGNE-2026-09-05.md` en `plans de travail/CONSIGNE-DU-JOUR.md`, et commence son lot A.
   Les deux fichiers partent avec le premier commit du lot A.

## 7 · Retouches du coup d'œil de Grégoire — 5 septembre, 6 h 50 (Toronto), par Cowork — AVANT la livraison de 1.118

> **Décision de Grégoire (6 h 50)** : la livraison n'est pas urgente, on corrige d'abord, **une seule livraison à la fin**.
> Coup d'œil fait sur `7ff78ced` : l'aperçu sous chaque palier fonctionne, la recommandation aussi. ⚠ Elle suit au
> `change` (en quittant le champ), pas à chaque frappe : c'est le bon mécanisme (un redessin à chaque frappe perdrait le
> curseur) ; le « mise à jour à chaque frappe » du §5 était une erreur de mots de Cowork. **Ne change pas ça.**
> ⚠ Cowork n'a PAS relu `grilles.js` au-delà de `rendreBlocProjectionAlgo` : les numéros de lignes ci-dessous sont
> des repères mesurés à 6 h 30, **remesure avant de toucher**.

**Ce que Grégoire verra** (carte « Projection » d'un critère algorithmique) : l'aide sur les badges **en haut de la
carte**, avant le premier palier, en trois phrases courtes ; dans chaque palier, les deux zones s'appellent
**« Verdict »** et **« Recommandation (facultative) »** ; sous chaque palier, la ligne grise s'intitule **« L'élève lira
(décompte, puis tes deux phrases) : »** et montre **en gris ce qui est engendré** (le décompte et, s'il y a lieu, le
préfixe « Tu fais en moyenne 1 erreur à chaque N mots. ») et **dans l'encre normale ce qu'il a écrit** (verdict et
recommandation, remplis). Les deux notes du bas (copie non corrigée, copies fictives) restent en bas.

**Ce qui l'a motivé** : deux endroits disaient « ce que l'élève lit / lira » et rien ne montrait que la ligne grise est
fabriquée à partir des deux zones ; l'aide sur les badges était à six paliers de la rangée « Poser : ».

**Trois retouches, UN commit. Périmètre : `js/grilles.js`, `styles.css`, `index.html` (bump). ⛔ `evaluation-projection.js`
ne bouge pas ; aucune donnée ne change.**

1. **Les étiquettes** (`grilles.js:~3908` et `:~3917`, les deux `<label>` du palier) : « Ce que l'élève lit » →
   **« Verdict »** ; « Phrase de recommandation (facultative) » → **« Recommandation (facultative) »** (mots de Grégoire,
   6 h 35). Mesure d'abord `grep -n "Ce que l'élève lit\|Phrase de recommandation" js/ tests/` : l'aide de la carte cite
   « dans « Ce que l'élève lit » » (à corriger en « dans « Verdict » ») ; les commentaires de code restent tels quels ;
   dis si une sentinelle ou un spec porte l'ancien libellé.

2. **La composition visible** (`ligneApercu`, `grilles.js:~3865`) : la ligne rend **deux segments**, chacun passé par
   `echapperHtml`. **Gris** (`palier-apercu-engendre`, `--gris-moyen`) = le décompte du bloc 3, puis `projection.prefixe`
   s'il est non vide. **Encre normale** (`palier-apercu-ecrit`, `--texte-principal`) = `projection.texte` privé de son
   préfixe. Mesure : `_resultat` (`evaluation-projection.js:~672`) rend `prefixe` ET `texte` où `texte` = préfixe + ' ' +
   verdict(+recommandation) ; retire le préfixe par sa longueur (`texte.slice(prefixe.length).trim()`), pas par regex.
   Verdict et recommandation restent **un seul segment** : les séparer exigerait de changer le module de projection —
   hors périmètre, dis-le si tu y vois un défaut. Étiquette de la ligne : **« L'élève lira (décompte, puis tes deux
   phrases) : »**. Classes dans `styles.css`, rien en `style=` inline neuf.

3. **L'aide en haut** (`grilles.js:~3945`, le `<small>` qui précède le bouton « + Ajouter un palier ») : déplacée
   **en tête de carte, avant le premier palier**, resserrée à trois phrases (texte de départ, Grégoire le reprend au coup
   d'œil) : « Un clic sur un badge le pose dans la zone du palier où est le curseur — sans curseur, dans « Verdict ». Les
   badges bleus sont écrits dans la grille ; les verts se remplissent à la correction, copie par copie, et un badge sans
   valeur disparaît. Sans badge, la phrase est précédée de « Tu fais en moyenne 1 erreur à chaque N mots » ; avec un
   badge, elle est entière : c'est toi qui l'écris. » Les deux `<small>` du bas (`basApercu`) restent en bas.

**Témoins** : la sentinelle `sentinelle-texte-troue-etape-2-apercu.test.js` (B.a lit l'étiquette « L'élève lira : »,
B.d la place de la note, D.b l'échappement) et le spec WebKit `texte-troue-paliers-projection.spec.js` (lit « L'élève
lira : ») **suivent** ; dis lesquels ont dû changer et pourquoi ; **break-test** sur au moins un cas — le verdict rendu
dans le segment gris doit rougir. Si `sentinelle-lot4-C-gabarit-algo-range.test.js` porte les anciens libellés, adapte-la.
⛔ Toujours pas de `page.click` à l'aveugle ni `waitForTimeout`. Format qui voyage : `git diff -- js/evaluation-projection.js
js/import-export.js js/partage-schemas.js` rend zéro ; golden #668 sans modification.

**Puis** : rapport à Cowork (une passe courte), coup d'œil de Grégoire, **les mots du changelog** (Cowork les lui propose ;
ton brouillon de 6 h 09 est la base, avec les nouveaux libellés), verdict au jeton, release MINEURE 1.118, push — puis le
§6 s'applique tel quel à partir de son point 6.
