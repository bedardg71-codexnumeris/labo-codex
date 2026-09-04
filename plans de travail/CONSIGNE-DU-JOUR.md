# Consigne du jour — la CI redevient verte, puis le lot 4 (le gabarit algorithmique se range, et une grille analytique a ses paliers)

> **Écrite le 4 septembre 2026 à 10 h 20 (heure de Toronto, lue par `TZ=America/Toronto date`), par
> Cowork, après la publication de 1.116.**
> **Application au moment de l'écriture : `1.116.0`, build `0904-0729`, EN LIGNE.**
> ▣ **État mesuré à l'écriture** : `HEAD` = `3d7b8dc0` = `origin/main` (témoin :
> `git rev-list --left-right --count origin/main...HEAD` rend `0 0`) ; arbre propre hors les
> fichiers de Cowork de ce matin (ce fichier, l'archive de l'ancien, la consigne de démarrage
> Cowork et quatre cadrages retouchés pour leurs heures). **Ils partent avec ton premier commit.**
> ⚠ **La CI est ROUGE sur `main`** : run GitHub 33869215489, Vitest vert, Playwright 254 / 255 —
> le rouge est `tests/integration/type-grille-lot1.spec.js`, jamais jugé sur Linux (le run de
> 1.115 avait été annulé). Tu l'as mesuré et inscrit dans `SESSION.md` (l. ~318-332). **C'est le §1.**
>
> ⚠ **Si tu lis ceci plus de quelques heures après son écriture, remesure avant d'exécuter.**
> ⚠ **Ton propre bloc de clôture dans `SESSION.md` fait foi sur l'état mesuré ci-dessus.**

---

## Ce que cette consigne produit à l'écran, pour Grégoire

**Rien avant son coup d'œil** : une seule livraison, 1.117, à la fin. Ce qu'il verra alors :
- le gabarit d'un critère algorithmique s'ouvre sur **ses sous-critères**, tout de suite sous la
  rangée du critère ; la formule, le commentaire et la projection sont **trois cartes nommées**,
  repliées ou dépliées selon qu'elles portent la note ou les mots ;
- « Modèle de rétroaction » se lit **« Modèle de commentaire »** ; « Norme externe (épreuve
  uniforme) » se lit **« Projection à l'EUF »** ;
- le menu « Niveau SOLO » d'un critère offre **« Aucun »** ;
- pour une grille analytique, le formulaire de cartouche ne parle plus de « niveaux » mais de
  **paliers en %**, préremplis ; l'éditeur de cartouche titre ses colonnes par les bornes.

---

## 1 · Lis d'abord

1. `PROTOCOLE.md` (règles 1, 2 et 7), puis `OU-EN-EST-ON.md`.
2. **`plans de travail/CADRAGE-2026-09-04-lot-4-gabarit-algorithmique-et-paliers-analytiques.md`**
   — les décisions de Grégoire, volet par volet, et ce qui lui remonte encore. **Il fait foi sur
   ce fichier-ci en cas d'écart.**
3. `plans de travail/CADRAGE-2026-09-03-accordeons-gabarit-algorithmique.md` — les cartes
   repliables : le composant, le piège (le gabarit se redessine à chaque frappe), l'état en
   mémoire, la ligne de partage, et les ajouts du 4 septembre.
4. Ton bloc de clôture de 1.116 dans `SESSION.md` (par `grep -n "1.116" SESSION.md`, jamais en
   entier), pour la CI.

---

## 2 · D'ABORD : la CI redevient verte — le spec du lot 1, pas le code

**Décidé par Cowork (technique)** : une CI rouge sur `main` n'est pas une trouvaille à inscrire,
c'est l'état de vérité du dépôt qui ment (le 2 septembre, « la CI rouge que personne ne lisait »
a été la première des quatre occurrences du vert qui ne prouve rien). **Ça se règle avant le lot 4,
dans un commit à part.**

- Ton hypothèse (SESSION.md) : course de rendu entre `chargerGrillePourModif('G0')` et le rendu
  précédent, sur un runner plus lent ; le clic tombe sur la liste de la grille précédente.
  Rejoue la trace (`npx playwright show-trace`) et **confirme-la ou infirme-la avant de toucher**.
- Si c'est le spec : rends-le robuste **comme les autres gestes du spec** — attendre le rendu de
  G0 (un élément qui n'existe que pour G0) avant de cliquer, pas un `waitForTimeout`. Break-test :
  le spec doit encore rougir si le comportement du lot 1 se casse (retire la propagation du type
  aux critères neufs → rouge).
- Si c'est le code (un vrai défaut de course qu'un utilisateur lent peut rencontrer) : **arrête-toi
  et dis-le** ; ça remonte, et ça passe avant le lot 4.
- ⚠ Règle 7 : le vert local ne prouve rien — c'est **le run GitHub** qui juge. Pousse ce commit seul
  (c'est un `test:` sans bump, `scripts/release.mjs --build-only` s'il touche `index.html`, sinon
  rien) et **attends le run** avant d'ouvrir le lot 4. Dis son numéro et son verdict.

---

## 3 · Le lot 4, dans l'ordre C → B → A → D — un commit par volet, une livraison à la fin

### Volet C — le gabarit algorithmique se range (`js/grilles.js`, deux gabarits : `:3355-3806` et le second à `:4121`)

Cinq points, tous tranchés par Grégoire sauf le 3 :

1. **Libellés** : « Modèle de rétroaction » → **« Modèle de commentaire »** (`grilles.js:3594`, le
   seul libellé ; la clé sous le menu ne porte pas le mot — vérifie que rien qui voyage ne
   change). Relis les descriptions de cette section pour dire « commentaire » partout où elles
   disent « rétroaction » de CES phrases-là (pas de la cartouche).
   « Norme externe (épreuve uniforme) » → **« Projection à l'EUF »** (`evaluation-projection.js:186`,
   `nom` seulement ; **l'`id` `norme_externe` ne bouge pas**, il voyage avec les grilles partagées).
2. **Ordre** : les **sous-critères** viennent en premier, sous la rangée du critère ; puis la
   formule, le commentaire, la projection. Mesure d'abord ce qui dépend de l'ordre du DOM (les
   `data-critere-index`, les handlers délégués, `afficherCriteresTemp()` à `:5025`) — l'ordre
   change le rendu, pas les données.
3. **Défaut de projection d'un critère neuf** (`evaluation-projection.js:605`, `'norme_externe'`) :
   ⛔ **NE PAS FAIRE tant que la ligne suivante n'est pas remplacée par la décision de Grégoire.**
   `[EN ATTENTE — recommandation de Cowork : 'aucune' ; Grégoire n'a pas tranché]`
   Si tranché « aucune » : source seulement, les critères existants gardent leur modèle ; un cas
   dans une sentinelle (un critère neuf naît sans projection ; un critère existant `norme_externe`
   reste `norme_externe` après rechargement).
4. **Les cartes repliables** — c'est le cadrage « accordéons » qui les spécifie : ouvert ce qui
   porte la note (sous-critères, formule), fermé ce qui porte les mots (commentaire, projection,
   codes) ; **l'état du pli vit en mémoire, par critère et par section, jamais dans la grille** ;
   le composant est celui de Cadre et de l'aide (bascule `pratiques.js:2113`). ⚠ **Le piège** :
   le gabarit se redessine en entier à chaque frappe (`grilles.js:5025, 5039, 5051`) — un pli
   dans le DOM se refermerait sous les doigts ; relis l'état à chaque redessin. Cette étape règle
   aussi l'espace manquant entre formule et projection : **pas de marge ajoutée à part**.
5. Rien dans les données de personne ; aucune sentinelle du calcul ne change.

**Témoins** : une sentinelle Vitest sur les libellés et l'ordre (rendu du gabarit : l'élément des
sous-critères précède celui de la formule ; « Modèle de commentaire » présent ; « Modèle de
rétroaction » absent — témoin : il reste présent là où c'est la cartouche) ; un spec WebKit qui
plie une carte, tape dans un champ, et vérifie que la carte est toujours pliée.

### Volet B — « Aucun » au menu « Niveau SOLO » (`grilles.js:3399` et `:4121`, défaut `:330`)

**Mesure avant d'écrire, et rends la carte à Cowork** : les neuf fichiers qui lisent `niveauSOLO`
(`echelles.js` 11, `profil-etudiant-calculs.js` 9, `grilles.js` 9, `trimestres.js` 6,
`profil-etudiant-helpers.js` 2, `import-export.js` 2, `tableau-bord-apercu.js` 1,
`partage-schemas.js` 1, `interventions.js` 1 — `grep -rn -c "niveauSOLO" js/`) : pour chacun, *que
fait-il d'une valeur « aucun » ?* « Aucun » veut dire **ce critère ne nourrit pas la lecture
SOLO** ; chaque lecteur doit savoir le sauter **sans que le critère disparaisse de la note**.
`partage-schemas.js` et `import-export.js` : la valeur doit passer à l'import et au partage
(format qui voyage → mesure, et dis-le).
⚠ **Question qui remonte à Grégoire, avec ta mesure** : que dit l'écran de dépistage d'une copie
dont TOUS les critères sont « Aucun » ? Propose-lui la phrase.

### Volet A — les paliers d'une grille analytique (`js/cartouches.js`, `index.html:5452`)

**Décision de Grégoire : la voie (a)** — l'échelle reste le mécanisme des paliers ; pour une
grille analytique elle se présente comme des paliers en %, préremplie, et l'éditeur de cartouche
titre ses colonnes par les bornes.

**Mesure avant d'écrire, et rends la carte à Cowork** (ce volet touche la cartouche, **format qui
voyage** → relecture croisée obligatoire, règle 2) :
- comment le formulaire de cartouche connaît le type de la grille choisie (`grille.type` depuis
  le lot 1, ou déduit des critères quand « Non précisé ») ; `cartouches.js` ne lit `.type` qu'une
  fois — dis où ;
- la cartouche **copie** les niveaux de l'échelle à la création (`cartouches.js:471`,
  `niveaux.map(n => ({code, nom}))`) et l'éditeur les lit depuis cette copie (`:620`, `:630`,
  `:1281`, `:1291`) : **les bornes n'y sont pas**. Pour titrer les colonnes par les bornes, soit
  la copie les emporte (le format de la cartouche change → dis-le, c'est ce qui voyage), soit
  l'éditeur les relit sur l'échelle source. **Tranche, et dis ce que tu as supposé** ; la clé
  `critereId_niveau` ne change pas ;
- ce qu'affiche une grille **MIXTE** (des critères à niveaux ET à points) : ⚠ si ce n'est pas
  évident après mesure, ça remonte à Grégoire ;
- le préremplissage : l'échelle de départ (`ECHELLE_IDME_DEPART`, `echelles.js:584`) si elle est
  dans la base, sinon rien de prérempli — dis-le.

**Les mots que les collègues liront** — Cowork les propose à Grégoire, tu ne les inventes pas :
le libellé du champ pour une grille analytique (« Paliers (bornes en %) » proposé), et la forme
des titres de colonnes (« 0–64 % », « 65–79 % »… proposée). **Attends qu'ils soient dans ce
fichier avant de les écrire à l'écran.** `[EN ATTENTE — libellés à confirmer par Grégoire]`

### Volet D — après A seulement

Produire le PDF d'une copie **avec** cartouche sur une grille analytique et regarder la rangée du
critère : si l'espace à droite du chiffre reste vide avec un commentaire, c'est du design (skill
`design-interface`) et ça se cadre ; sinon c'était le symptôme de A. **Rien à coder d'office.**

---

## 4 · L'ordre de la séance, et il ne se négocie pas

```
§2 : la CI verte (commit à part, poussé, run jugé)
  → volet C commité → volet B (carte à Cowork, puis code) commité
  → volet A (carte à Cowork → décisions de Grégoire → code) commité
  → relecture croisée de Cowork (A obligatoire ; C et B au jugement)
  → corrections
  → coup d'œil de Grégoire (le gabarit rangé · « Aucun » · la cartouche d'une grille analytique)
  → verdict au jeton → release MINEURE 1.117, UNE entrée de changelog dont les mots sont à lui → push
```

⛔ **Deux points sont `[EN ATTENTE]` dans ce fichier** (C.3 et les libellés de A). Ils se
débloquent par Cowork, qui les écrit ici avec la décision de Grégoire. **Tu ne les devines pas.**

## 5 · Ce que tu rends à Cowork

La carte de B (neuf lecteurs, disposition de chacun), la carte de A (où le type se lit, où les
bornes vivent, ce qui voyage), et le numéro du run GitHub du §2 avec son verdict.
