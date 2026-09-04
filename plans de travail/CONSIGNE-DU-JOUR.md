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
   ↻ **TRANCHÉ par Grégoire le 4 septembre 2026 vers 15 h 40 : « Par défaut, c'est réglé à
   “sans projection” ».** Donc `'aucune'` pour un critère neuf ; les critères existants gardent leur
   modèle. C.3 est ouvert : à faire, avec son cas de sentinelle.
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
fichier avant de les écrire à l'écran.**
↻ **ARRÊTÉS par Grégoire le 4 septembre 2026 vers 15 h 50** (« Je suis d'accord avec l'ensemble ») :
- le champ : « Paliers (bornes en %) » ; le coin de la matrice : « Critère / Palier » ;
- les titres de colonnes : les bornes de l'échelle, **forme exacte** (« 0–64,99 % »), confirmée après
  précision que les chiffres sont ceux de l'échelle de l'utilisateur, jamais du code ;
- le menu SOLO : « Aucun » ; sa phrase d'aide **SANS la dernière phrase** (« C'est le choix d'une méthode
  traditionnelle, sans taxonomie. » est retirée — l'aide ne qualifie pas le choix du collègue) ;
- le tableau de bord : « Aucun critère multistructurel dans la grille de dépistage : le suivi des
  fondations ne surveille rien. »
⮕ Une seule retouche de code : couper la dernière phrase de l'aide sous le menu SOLO (volet B). Le reste est
déjà à l'écran tel quel.

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

▣ **Plus rien n'est `[EN ATTENTE]` dans ce fichier** : C.3 et les libellés sont tranchés (§3, §6). Ils se
débloquent par Cowork, qui les écrit ici avec la décision de Grégoire. **Tu ne les devines pas.**

## 5 · Ce que tu rends à Cowork

La carte de B (neuf lecteurs, disposition de chacun), la carte de A (où le type se lit, où les
bornes vivent, ce qui voyage), et le numéro du run GitHub du §2 avec son verdict.

---

## 6 · Relecture croisée de Cowork sur le lot 4 (`eaad7ce1`, cinq commits devant `origin/main`)

> Écrite par Cowork le 4 septembre 2026 vers 15 h 30, cartes A et B lues AVANT les patchs, puis les
> diffs de `0385eadb` (A, obligatoire), `df07fa51` (B) et `c18318b7` (C).

**Verdict : rien à corriger.** Ce que j'ai vérifié, et le témoin :
- **A** — les bornes que l'éditeur affiche sont `n.min` / `n.max` de l'échelle source, les mêmes champs
  que le lot 3 lit pour déduire le niveau (`git show b4039828 -- js/` : `pct >= Number(n.min) && pct <=
  Number(n.max)`) : ce que la colonne titre est bien ce qui ouvre la cartouche. La copie (code, nom), la
  clé `critereId_niveau` et `echelleId` ne bougent pas dans le diff. `typeGrilleAffiche` (`grilles.js:3247`)
  rend `''` sur une grille mixte sans type : les niveaux restent, comme la carte le dit.
- **B** — les deux seuls appelants de `libelleNiveauSOLO` (`profil-etudiant-calculs.js:2030`,
  `interventions.js:715`) tolèrent le libellé vide ; la 4e valeur de l'export du trimestre (`type`,
  `niveau_solo`) n'a **aucun lecteur dans l'application** (`grep -rn "niveau_solo\|'fondamental'" js/`
  hors `trimestres.js` : objectifs.js et le pack de démo seulement, sans rapport).
- **C** — `id: 'norme_externe'` intact (`evaluation-projection.js:185`) ; les plis sont relevés avant chaque
  redessin et vivent en mémoire, clé `<id du critère>:<section>`, jamais dans la grille.

**Trois réserves inscrites, pas corrigées** (issue 2) :
1. (A) Sur une grille analytique dont l'échelle de départ est dans la base, remettre le menu sur
   « — Échelle — » la resélectionne aussitôt (`onChangeSelectionCartouche`) : le champ ne peut pas rester
   vide. Il est obligatoire de toute façon ; à regarder si quelqu'un s'en plaint.
2. (A) Le modèle texte et l'export texte d'une cartouche (`lignesMatriceCartouche`, `cartouches.js:2769`)
   nomment encore les niveaux par leur nom sur une grille analytique. Lu par l'enseignant, pas l'élève.
3. (C) Un critère sans identifiant (grilles d'avant le 2 septembre, non réparées chez les autres
   enseignants) partage sa clé de pli avec ses semblables.

**Ordre qui reprend** : réponses de Grégoire aux deux points (C.3 ci-dessous, les mots de A et B), coup
d'œil, verdict au jeton, release MINEURE 1.117, push.

---

## 7 · Deux retouches du coup d'œil de Grégoire (4 septembre 2026, vers 16 h 15, sur `d022372b`)

> Grégoire a parcouru les quatre écrans : *« C'est très bien, beaucoup plus clair. »* Deux retouches,
> toutes deux dans le gabarit (volets B et C) ; rien dans les données, rien dans le calcul. Commite AVEC ce
> fichier, puis il regarde une seconde fois, courte ; ensuite verdict au jeton, release 1.117, push.

**a) « Aucun » en TÊTE du menu « Niveau SOLO »**, avant « Multistructurel » — aux deux menus (`grilles.js`,
création et édition). Le défaut d'un critère neuf ne bouge pas (toujours multistructurel : l'ordre des
options change, pas la valeur sélectionnée). Adapter le cas de la sentinelle du volet B qui vérifie la
position de l'option.

**b) Les paliers de projection (carte « Projection ») prennent trop de hauteur** — ce qu'il voit, capture à
l'appui : chaque palier empile sur quatre rangées « Palier » + « Jusqu'à », « Ce que l'élève lit »,
« Phrase de recommandation », puis la note « Écris {service}… » ; et le champ du nom est trop étroit —
« Sans erreur » s'affiche « Sans erre ». Ce qu'il demande : **condenser en mettant les champs côte à côte,
sur le modèle du formulaire « Modifier le groupe-cours »** (deux colonnes, étiquette au-dessus de chaque
champ, une rangée par paire) ; **et agrandir un peu le champ du nom du palier**.

Ce que je retiens comme forme, à ajuster par toi (skill `design-interface`, mesure d'abord le gabarit) :
- rangée 1 : **Palier** (nom, assez large pour « Sans erreur » entier) · **Jusqu'à** (avec sa ligne
  « soit 1 erreur / 100 mots » dessous) · le bouton ✕ à droite ;
- rangée 2, deux colonnes : **Ce que l'élève lit** · **Phrase de recommandation (facultative)** — zones de
  texte plus basses (deux lignes) ;
- la note « Écris {service}… » **une seule fois**, sous la carte « Projection », pas sous chaque palier
  (elle est identique à chaque palier).
- Sur iPad en portrait, les deux colonnes s'empilent, comme le fait le formulaire du groupe-cours (mesure
  comment il le fait et emprunte le même mécanisme, pas une nouvelle règle CSS).
- Rien d'autre ne change : les champs, leurs noms, ce qui est enregistré, le redessin à chaque frappe (les
  plis se relisent, §3 C.4).

Témoins : le spec WebKit du volet C plie, tape et vérifie déjà ; ajoute-lui que le nom « Sans erreur » est
lisible en entier (largeur du champ ≥ largeur du texte) ; un cas de sentinelle sur l'ordre des options SOLO.
Break-test sur les deux.

**c) Un seul bouton de suppression dans l'éditeur de grille : la corbeille.** Captures de Grégoire : les
critères et les productions ont la corbeille grise en coin (icône seule) ; les sous-critères et les paliers
de projection ont un gros bouton rouge « ✕ ». Il veut la corbeille partout **dans l'éditeur de grille**
(critères, sous-critères, paliers, codes) — même icône, même place (en coin, à droite), même comportement
qu'aujourd'hui (ce que chaque suppression fait et dit ne change pas : #647 et sœurs restent). Cible
tactile iPad ≥ 44 px autour de l'icône (skill `design-interface`), pas d'icône minuscule.

**d) Un seul geste pour changer l'ordre : les chevrons de la liste des productions.** Capture : dans les
productions, « ∧ ∨ » à droite du nom, sur la même ligne que la corbeille ; dans les critères, une pile
« Ordre » verticale à gauche avec deux flèches empilées. Il veut le modèle des productions **dans l'éditeur
de grille**, partout où un élément se réordonne (critères, sous-critères, paliers si ordonnables, codes).
Même fonctions de déplacement qu'aujourd'hui : c'est le rendu qui change, pas la donnée ni l'ordre
enregistré.

⚠ **Périmètre** : l'éditeur de grille seulement (écran Conception › Grilles, les deux gabarits). Un
alignement de TOUTE l'application sur corbeille + chevrons serait un cadrage design à part ; mesure et dis,
en une ligne, combien d'autres écrans portent encore le « ✕ » rouge ou la pile « Ordre », pour que Cowork
le cadre. Ne les touche pas.

Témoins pour c) et d) : le spec WebKit du volet C supprime un sous-critère et un palier par la corbeille et
déplace un critère par le chevron ; la sentinelle du volet C vérifie qu'aucun bouton « ✕ » de suppression ne
reste dans les deux gabarits rendus. Break-test.

**Ordre** : a) b) c) d) dans un ou deux commits, avec ce fichier ; second coup d'œil de Grégoire (le gabarit
entier, Mac et iPad) ; verdict au jeton ; release 1.117 ; push.
