# Consigne de démarrage à froid — la session qui prend le relais

> Écrite le **31 août 2026, en fin de matinée**, par `kuekatsheu-f3`, qui a coordonné
> trois sessions parallèles et poussé la release groupée 1.106.13.
> Elle **REMPLACE** `CONSIGNE-DEMARRAGE-2026-08-31.md`, qui parlait de la phase de
> MESURE du plan Conception — cette phase est close, et trois sessions d'exécution
> sont livrées depuis. Tous les chiffres ci-dessous ont été mesurés.
>
> ⚠ **Ce fichier porte un nom sans date, exprès** : deux consignes datées cohabitaient
> à la racine ce matin, dont une du 30 août encore présentée comme courante. Un nom qui
> ne peut pas rôtir vaut mieux qu'une date qu'on oublie de retirer. **La date d'écriture
> est en tête, c'est elle qui fait foi.**

--

Ouvre le dépôt Monitorage_v6. Rituel d'abord : délègue l'audit de début de session
au subagent `audit-debut-session`, puis lis le bloc « POUR LA SESSION QUI PREND LE
RELAIS — 31 AOÛT 2026 » en tête de `RELAIS.md`. On est à la **1.106.13**
(build `0831-0734`).

⚠ **Piège de démarrage payé deux jours de suite** : si ta session s'ouvre dans
`/Users/kuekatsheu` et non dans le dépôt, **les skills et les agents de `.claude/`
ne se chargent PAS, en silence**. Lis leur fichier à la main.

---

## ÉTAT MESURÉ AU 31 AOÛT, FIN DE MATINÉE

- **Tout est poussé.** `main` = `origin/main` = `59afeb70`. Arbre propre, hors les
  deux mêmes fichiers non suivis qu'hier (`_sauvegarde-20260830-1905/` et
  `ETAT-AVANT-REDEMARRAGE-2026-08-30.md`). Leur sort se demande à Grégoire.
- **Vitest 415 fichiers / 4408 tests, code de sortie 0**, sur arbre GELÉ.
- **Playwright WebKit 210 passés, 3 instables, code de sortie 0**, sur le même arbre
  gelé, puis **relancé une seconde fois par `pousser.sh`** sur l'état exact poussé.
  Les trois instables sont **pré-existantes** : `comparateur-pratiques-rendu`,
  `import-pratiques-inter-trimestre-briqueC`, `profil-etudiant-rendu` — dépassement
  de 30 s puis vert en 1,3 s au second essai, le motif documenté dans #534.
  **Ne les chasse pas.**
- **Dernier ID utilisé : #634.**
- Trois sessions ont travaillé sans une seule collision d'index. Lance `ListAgents`
  avant d'écrire à quiconque.

---

## ⏳ CE QUI PORTE UNE DATE — LE **1er SEPTEMBRE 2026**

**#427 + #508.** Décision prise (option A, Grégoire tient la date).
⮕ **Compte les jours toi-même à partir de la date du jour. Ne te fie à aucun mot
relatif écrit ici.** Cette consigne a été rédigée le 31 août au matin.

Deux versants :
- **Ce qui est dû par Grégoire, et par personne d'autre** : les trois noms dans la
  console Cloudflare, la durée de session, la règle `Include` de la policy dormante.
  Il travaillait dessus avec Cowork le 31 août.
- **Ce qui est dû côté code, LE JOUR MÊME** : réécrire au présent le paragraphe
  d'accueil dans `js/accueil.js`. **Les deux textes sont écrits d'avance** au §7 de
  `plans de travail/REFERMAGE-2026-09-01-cloudflare-access.md`.
  ⚠ **Ne l'écris pas en avance** : ce serait mettre en ligne un texte faux jusqu'au
  jour dit. Le bandeau, lui, s'éteint seul.

---

## ⛔ LE MORATOIRE EST TOUJOURS ACTIF, ET CE N'EST PAS UN OUBLI

Le code de **S4 / #622 est livré et poussé**. Archiver un trimestre ne détruit plus
aucun modèle — vérifié en Vitest (14 cas, 7 break-tests rouges) **et dans WebKit**
contre le vrai `index.html` (`tests/integration/archivage-lecture-seule-622.spec.js`,
3 cas, 3 break-tests rouges).

**Mais la LEVÉE est une décision de Grégoire, et il ne l'a pas prise.** T4.4 reste
ouverte pour cette seule raison. Ne lève pas le moratoire à sa place, et ne le
présente pas comme une formalité.

⮕ **Et lever (a) « archiver » ne rendrait pas (b) et (c) inutiles.** Deux choses que
S4 n'a PAS réparées, vérifiées le 31 août :
- **Le fichier « Exporter » n'a toujours aucun chemin de restauration.**
  `type: 'archive-trimestre'` n'apparaît qu'une fois dans tout le dépôt, à l'écriture.
- **Le snapshot d'archivage n'a toujours AUCUN LECTEUR.** Grep de `snapshot_`,
  `snapshotRessources`, `isolationArchive` dans tout `js/` : la clé est écrite et
  jamais relue.

⮕ **Donc la bonne façon de dire ce que S4 répare n'est pas « le filet fonctionne
maintenant ».** C'est : **il n'y a plus rien à rattraper, parce que plus rien n'est
détruit.** Le snapshot complété ne servira que le jour où quelqu'un écrira un chemin
de restauration. **Ne le présente jamais comme une sauvegarde.**

---

## OÙ EN EST LE PLAN CONCEPTION

Le **tableau d'état** en tête de
`plans de travail/PLAN-modele-objets-conception-2026-08-30.md` est la seule vue
d'ensemble. Ne crois pas un `LIVRÉ` sur parole : vérifie dans `main`.

| | |
|---|---|
| **LIVRÉ** | S0 · S1/Z1 · S2/Z2 · S3/Z3 · **S4 (code)** · **S7** · **S8** |
| **RESTE** | **S5** · **S6** · S9 · S10 · S11 · S12 |

⚠ **LA NUMÉROTATION N'EST PAS UNE BARRE DE PROGRESSION.** S7 et S8 n'ont pas été pris
parce qu'ils venaient ensuite : ils ont été pris parce que c'étaient les **deux seuls
qui pouvaient tourner en parallèle de S4 sans écrire dans les mêmes fichiers**. On a
sauté par-dessus S5 et S6 délibérément. **Le prochain, c'est S5.**

---

## ⚠⚠ S5 / #623 — CE QU'IL FAUT SAVOIR AVANT DE L'OUVRIR

**C'est la seule session du plan qui migre les données réelles de Grégoire, et la
migration SUPPRIME les clés nues après copie.** Lis tout ce qui suit avant d'écrire
une ligne.

### La spécification vit au §6.3 du rapport Z1

`Rapports/AUDIT-conception-Z1-cartouches-archivage-2026-08-30.md`, §6.3 (B4).
**Quatre volets indissociables** — appliqués séparément, (a) et (b) sans (c) font
**perdre des cartouches au désarchivage** :
- **(a)** le routage : `cle()` et `cleSource()` cessent de traiter `cartouches_` comme
  une clé globale, et la famille composée `cartouches_<grilleId>` prend le namespace
  de sa grille ;
- **(b)** la migration au boot dans `js/main.js`, **après** le bloc
  `migration_modeles_namespacees_done` — l'ordre est contraint ;
- **(c)** les deux fonctions d'archivage de `js/trimestres.js`, **dans le même
  commit** ;
- **(d)** ~24 clés littérales dans `cartouches.js` plus une vingtaine ailleurs, et les
  **quinze énumérations par préfixe** de Z1-S1.

### ⚠ LE DIFF DE Z1 EST PÉRIMÉ SUR UN POINT, ET C'EST S4 QUI L'A PÉRIMÉ

Le §6.3(c) montre l'ancien code avec `nbCartouchesCopies`. **S4 a déjà réécrit ce
bloc** : `creerSnapshotRessources` construit désormais un `cartouchesSnapshot`
`{grilleId: [...]}` **tout en gardant** la copie `db.setSync` et le compteur.
⮕ Ce que S5 doit y faire : la boucle doit **lire `${trimestreId}_cartouches_<id>`**
au lieu de la clé nue, et **retirer le `db.setSync`** (elle se copierait sur
elle-même) ainsi que `nbCartouchesCopies`. **Ouvre le code, ne recopie pas le diff.**
Un diff d'audit est une esquisse, jamais une spécification.

⮕ Et **`purgerCopiesModelesArchive` doit perdre sa branche cartouches dans le MÊME
commit** (`js/trimestres.js`, `const { grilleIds } = identifierTemplatesUtilises(id);`
suivi de la boucle `retirer(...)`). Elle est correcte AUJOURD'HUI parce que les
cartouches sont globales ; namespacées, elle effacerait la seule donnée du trimestre
désarchivé. **C'est exactement la perte que #358/#359 ont déjà corrigée pour les
grilles.**

### ⚠⚠ LA SAUVEGARDE PRÉALABLE N'A PAS D'INSTRUMENT VÉRIFIÉ. C'EST LE VRAI BLOQUANT.

Le plan et le rapport exigent tous deux une « sauvegarde préalable PAR COPIE
obligatoire » avant S5. **Personne n'a encore établi AVEC QUOI.** Mesuré le 31 août,
en lisant `js/import-export.js:3215` :

`exporterConfigurationComplete()` **n'est pas une sauvegarde fidèle** :
1. il ramasse les cartouches par `key.startsWith('cartouches_')` — **les clés NUES
   uniquement**. Avant migration c'est bon ; **après migration, il en trouverait ZÉRO,
   en silence** (les clés deviennent `<trim>_cartouches_<id>`). C'est une seizième
   énumération par préfixe, de la même famille que les quinze de Z1-S1 —
   **vérifie si elle est dans leur liste, elle pourrait y manquer** ;
2. il **FILTRE** par `filtrerRessourcesNonDemo`, une heuristique. Ce qu'elle juge
   « démo ou importé » ne part pas dans le fichier ;
3. il lit grilles / échelles / productions par `cle(...)`, donc **le seul trimestre
   ACTIF**.

⮕ **L'autre candidat, non vérifié, est le Codex** (`js/codex.js` :
`actionExporterSelection`, et surtout `actionFusionner`, qui est le seul chemin de
RETOUR que j'aie vu). **Le vérifier est la première tâche de S5, avant toute écriture.**

⮕ **Le critère à satisfaire, et il est simple à énoncer** : produire un fichier, puis
démontrer qu'on peut en **restaurer les `cartouches_*` dans une base vide**. Tant que
ce trajet aller-retour n'est pas démontré, **la migration ne s'exécute pas sur les
données de Grégoire** — parce qu'elle supprime les clés nues à la fin, et qu'il n'y a
pas d'annulation.

### Ce que la migration fera à Automne 2025, et il faut le DIRE avant

Automne 2025 est archivé et n'a **aucune** copie `a2025_cartouches_*` (mesuré, §3 de
Z1). Aujourd'hui `cle()` retombe pour lui sur la clé globale, et ses écrans
d'évaluation lisent déjà cette clé nue. **Copier la collection globale vers
`a2025_cartouches_X` préserve donc exactement ce qu'il affiche** — relocalisation à
contenu identique, rien de visible ne change. C'est la bonne issue, mais elle doit
être annoncée à Grégoire, pas subie.

⮕ Question ouverte, à trancher **par une LECTURE et non par une exécution** :
pourquoi a2025 n'a-t-il pas ses copies ? Trois explications tiennent au code (§6.3 de
Z1) et **la troisième serait un défaut à part entière** (un désarchivage qui purge,
puis un drapeau `archive` reposé par un chemin qui ne repasse pas par
`creerSnapshotRessources`). Un coup d'œil à `trimestre.dateFin` et
`trimestre.snapshotRessources` d'a2025 suffit à départager.

### Le reste du cadre S5

- **Sentinelle** : deux trimestres portant la même grille ; écrire une cartouche dans
  H2026 ; asserter qu'A2025 ne la voit pas. Puis archiver **puis désarchiver** A2025
  et asserter que ses cartouches sont **toujours là** — c'est le break-test de (c) :
  remettre la purge doit rendre ROUGE.
- **Vitest ne voit pas le rendu.** La barre latérale des cartouches et la matrice sont
  du rendu : Playwright/WebKit est dû, en plus.
- ⚠ **`cartouches.js:230` d'abord** (Z1-M3) : il y a un `const cle` **local** qui
  masque la fonction `cle()`. Le renommer AVANT d'envelopper quoi que ce soit, sinon
  `TypeError`.

---

## APRÈS S5

- **S6 / #624** — politique de suppression et orphelins. **Après S5**, et l'ordre est
  motivé : `donnees-v2.js:1564` devient correct **tout seul** une fois S5 livrée.
  Absorbe la réparation **#542**. ⮕ L'écart le plus actionnable est vérifié :
  `supprimerGrilleActive` (`js/grilles.js:3933`) ne vérifie AUCUNE dépendance, alors
  que son jumeau `supprimerEchelleActive` délègue en deux lignes au chemin gardé —
  **le patron existe déjà six lignes plus haut, il n'y a rien à inventer.**
- **S9 / #627** — remaps d'import. **Libre dès maintenant** (ne dépend que de S2, qui
  est livré). Bon candidat si S5 doit attendre la sauvegarde.
- **S10 / #628** — retrait du legacy. ⚠ **Le retrait en bloc est impossible tel quel** :
  suivre la séquence D1 → D2 → D3 → D4 du §3 de Z3, où **D2 est un refactor**, pas une
  suppression. ⮕ S7 y a versé une mesure complète (les quatre appelants, le JSDoc qui
  décrit une UI disparue, le piège de l'expando qui PERSISTE sur un `<div>`).
  ⚠⚠ **Couplage à ne pas découvrir en route** : le cas **E.a** de
  `tests/unit/sentinelle-625-etats-edition-purges.test.js` exerce la branche que S10
  doit retirer. **Il doit partir AVEC elle.**
- **S11 / #629** — mineurs, dont le §6.4 de Z1 (M1+M2) que S4 n'a **pas** absorbé
  volontairement : c'est un retrait de redondance dont la sentinelle doit rester
  **VERTE** après mutation — une autre nature de preuve, qu'on ne mêle pas au diff qui
  lève un moratoire.
- **S12** — tests sur appareil, avec Grégoire.
- **Hors plan** : **#631/#632** (les 408 évaluations gelées). ⮕ **Rien ne se dégrade en
  attendant** — c'est un gel, pas une perte, et les trois chemins d'écriture refusent.
  ⮕ **NE PURGE AUCUN des 16 « magasins fantômes » de cartouches** : onze sont la seule
  trace restante des trois grilles disparues. ⮕ La reprise est une **MESURE, pas un
  diff** : combien des 408 portent un `criteres[]` non vide.
- **Neufs du 31 août** : **#633** (fusionner les deux `annulerFormProduction` — les
  DEUX sont vivantes, la fusion change quatre sites d'appel et répare un défaut
  latent ; test manuel dû) et **#634** (le repli kebab n'a jamais fonctionné ; le
  corriger serait un changement de comportement déguisé en coquille — arbitrage
  métier, pas une typo).

---

## ⚠⚠ TROIS CONSTATS DE L'AUDIT DU 30 AOÛT SONT FAUX

Inscrits dans `BACKLOG.md`, section « Constats de l'audit du 30 août RÉFUTÉS ».
Un audit dont on retire un constat sans le dire redevient une source qu'on ne peut
plus recouper.

- **M11 — `planificationCarte.etat` A des consommateurs.** `planification-export.js`
  le lit aux l.336, 363, 375 : c'est **l'export du plan de cours**, plus quatre
  sentinelles. Le retirer casserait les deux.
- **M5 — `sauvegarderModeCalculObjectifs` a un appelant** (`pratique-notation-v2.js:367`)
  **et n'est pas exportée** : fonction privée inerte, pas un export mort.
- **`js/pratique-interface.js` n'a jamais existé.** Le vrai chemin est
  `js/pratiques/pratique-interface.js` — **un fichier de DOCUMENTATION jamais servi**
  (contrat `IPratique`). **Ne le supprime pas parce qu'il ne se charge pas.**

---

## PIÈGES DÉJÀ PAYÉS — ne les réapprends pas

· ⚠⚠ **`chargerScript` passe les variables de MODULE en PARAMÈTRES du sandbox.** Une
  réassignation interne est invisible depuis le test, et un `win.X = {…}` posé par le
  test n'atteint jamais le code : **`expect(win.grilleTemplateActuelle).toBeNull()`
  passe sur `undefined`** sans rien vérifier. Un pointeur de module se teste par son
  **EFFET**, posé par le vrai chemin d'entrée. ⮕ Trouvé dans un banc qui rendait
  **déjà six rouges** : **un rouge obtenu quelque part ne dit rien de ce que les
  AUTRES cas assertent.**
· ⚠ **Le hook anti-cache compare l'`index.html` STAGÉ à celui de HEAD.** Un bump de
  jeton commité **à part** fait échouer le commit suivant : **le jeton voyage dans le
  MÊME commit que son fichier `js/`**. À plusieurs sessions, le coordinateur bumpe et
  **lève l'interdit** sur `index.html` pour ce commit-là — il ne commite pas le bump.
  ⮕ Et **ignore le conseil affiché par le hook** (« incrémenter la lettre ») : le
  jeton porte le **jour du BUILD**.
· ⚠ **Retirer du code mort emporte parfois l'unique SUJET d'une assertion voisine.**
  Trois cliquets ont dû suivre S8. Sur #389, le bon geste a été de **SCINDER** la liste
  en deux familles — pas de la raccourcir, ce qui l'affaiblit sans laisser trace du
  pourquoi.
· ⚠ **Un break-test doit muter chaque CÔTÉ**, y compris celui d'une **réfutation** :
  sans ça, un constat réfuté reste une note de bas de page au lieu d'une garde.
· ⚠⚠ **UN MOTIF RECONNU N'EST PAS UN FAIT MESURÉ.** Le 31 août, `f3` a lu
  « `20260830i -> 20260831a` » dans la sortie de `release.mjs`, reconnu le trou #547,
  et annoncé à Grégoire un défaut **qui n'existait pas** : le commit `15ef1c45` avait
  bien bumpé le jeton. Une session pair a aussitôt proposé une théorie élégante
  par-dessus. ⮕ **Le commit intermédiaire se lit AVANT de conclure**, et un fait reçu
  de seconde main se vérifie ou s'annonce conditionnel. **Deux sessions peuvent se
  confirmer l'une à l'autre une prémisse que ni l'une ni l'autre n'a ouverte.**
· **Une porte terrain n'existe que si AUCUNE machine ne peut répondre**, et le défaut
  par défaut est d'écrire le test même s'il coûte plus cher à la session. T4.3 a été
  **supprimée** et remplacée par une spec WebKit — qui répond mieux, puisqu'elle relit
  le contenu du fichier téléchargé.
· **`[]` est TRUTHY.** `db.getSync(k, [])` ne peut jamais rendre une valeur fausse :
  tout repli `||` derrière lui est mort. `getSync(key, defaultValue = null)`.
· **Deux identifiants en double : `getElementById` rend LE PREMIER du document.**
· **Un grep ment dans les deux sens** — et `data-action` vit aussi dans le HTML
  **GÉNÉRÉ** par le JS, pas seulement dans `index.html`.
· Vitest ne voit pas le rendu ; il se lance **depuis `tests/`** ; **lis le CODE DE
  SORTIE**, pas « passed ». Node n'a pas d'IndexedDB. Ferme GitHub Desktop avant
  Playwright.
· `git commit -m "…"` : zsh exécute les backticks. Toujours `-F -` avec `<<'EOF'`.
· Sur les fichiers PARTAGÉS, `--stat` repère un fichier étranger, **pas un bloc
  étranger** : lis le diff stagé ENTIER.
· **Inscris un `#NNN` dans `BACKLOG.md` AVANT de l'employer. Dernier utilisé : #634.**

---

## PROPOSE-LUI UN CHOIX FERMÉ ENTRE

**(a)** **#427 + #508** si la date du jour est le 1er septembre ou après — c'est le
seul item qui porte une DATE, et le versant code est court.
**(b)** **S5 / #623** — le prochain du plan. ⚠ **Sa première tâche n'est pas la
migration, c'est de trouver et démontrer l'instrument de sauvegarde.** Sans lui, on
n'exécute rien sur ses données.
**(c)** **S9 / #627** — libre, indépendant, sans décision en attente. Bon candidat si
S5 doit attendre, ou si la journée est courte.
**(d)** **La mesure préalable de #632** — courte, en lecture seule, et elle débloque
tout le reste de #631.

⮕ **Une seule décision principale par session.** S5 et S6 ne se mènent jamais en
parallèle : mêmes fichiers.
