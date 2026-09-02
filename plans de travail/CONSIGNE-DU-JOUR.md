# Consigne du jour — six essais qui ne peuvent pas juger sur Linux cessent d'y rougir

> **Écrite le 2 septembre 2026 en soirée, par Cowork, avec Grégoire.**
> Elle REMPLACE la consigne de la CI en deux jobs, exécutée, poussée et **dont le verdict est
> tombé** : Vitest vert, Playwright **rouge sur six specs**, run `33671445284`, commit `5f6eb365`.
>
> ⚠ **Remesure `HEAD` avant d'exécuter** (règle 1).
> Un fichier non commité dans l'arbre : `plans de travail/CADRAGE-2026-09-02-badges-texte-troue.md`
> — **ne le commite pas**, il est à Grégoire.

---

## Le mandat, et pourquoi il passe AVANT le cinquième geste

Le lot précédent a rendu la CI capable de juger. **Elle a jugé, et elle est rouge sur six
essais.** ▣ **Cinq des six étaient DÉJÀ nommés rouges dans l'en-tête de `tests.yml` le 18 août**,
pour la même cause : glisser-déposer et mise en page du planificateur **sous WebKit Linux, qui
n'est pas le Safari de macOS**. Les 239 passent sur la machine de Grégoire.

⮕ **Ces six ne mesurent donc rien d'utile là où elles tournent** — et elles rendent le verdict
rouge en permanence.

⚠⚠ **C'est le piège de la journée, sous une autre forme.** La CI a été rouge deux jours, Grégoire
a regardé, et il a répondu « je ne vois pas de rouge ». **Un rouge qui dure cesse d'être un
signal.** Le laisser une semaine annulerait tout le travail du 2 septembre.

⮕ **Motif de l'ordre, décidé par Grégoire** : le cinquième geste est plus important, mais ce
lot-ci protège l'instrument qui dira si le cinquième est réussi. Vingt minutes.

## Les six

| spec | ce qu'elle voit échouer |
|---|---|
| `bandeau-non-modal-508` | les clics ne traversent pas le bandeau |
| `planif-alignement` | un bloc glissé à +40 px se fait aimanter |
| `planif-drag-pointer-148` | ×2 — un glissé souris ne déplace pas le nœud |
| `planif-toolbar` | la barre ne commande qu'une palette au lieu de deux |
| `portes-relais-cadre` | un champ n'est pas atteignable en son centre |

▣ **Toutes rouges deux fois sur deux** (`retries: 1`) — donc **échecs francs, pas instabilité.**

---

## Ce que tu fais

### ⮕ L'EXCLUSION VA DANS LA CI, PAS DANS LES SPECS

⛔ **Ne touche à aucun des cinq fichiers de spec.** Ils sont justes ; c'est la plateforme qui
diffère. Un `skip` écrit dans le fichier suivrait la spec partout, **y compris sur le macOS de
Grégoire où elle est la seule à mesurer quelque chose.**

⮕ **Exclus-les à l'étape Playwright de la CI**, et là seulement. `tests/package.json` porte
`"test:int": "playwright test"` ; `playwright.config.js` a `testDir: './integration'`.
⮕ **Le mécanisme est à toi** — un `--grep-invert`, un `testIgnore` conditionné par une variable
d'environnement posée par le job, un projet Playwright distinct. **Tranche et dis pourquoi en une
ligne.** ⛔ Pas d'action tierce.

⚠ **Critère de choix, et il tranche à lui seul** : `cd tests && npm run test:int` **sur la machine
de Grégoire doit continuer de lancer les 239**, sans variable à poser, sans drapeau à retenir. Si
ton mécanisme l'oblige à taper quoi que ce soit de plus, il est mauvais.

### ⛔ LA GARDE — ET C'EST TOUT LE LOT

**Un essai non jugé ne doit jamais ressembler à un essai vert.**

⮕ **Le job doit DIRE, dans sa sortie, combien d'essais n'ont pas été jugés et pourquoi.** Pas en
commentaire dans un fichier : **dans ce que le rituel d'ouverture lit.**
⮕ **Et la ligne du matin (`§2.1` du skill) doit la reprendre.** Elle dit aujourd'hui trois états ;
il lui en faut un quatrième : *jugé-vert · jugé-rouge · non jugé (job sauté) · **jugé partiellement,
N essais exclus de cette plateforme***.

⚠ **Sans cette ligne, ce lot est une régression déguisée en correction** : on aurait acheté du vert
en cachant six rouges. C'est exactement ce que la config refuse déjà de faire ailleurs — voir le
commentaire de `retries: 1` : *« Monter ce chiffre reviendrait à acheter du vert. »*

### Le cliquet

`tests/unit/sentinelle-ci-paths-ignore.test.js` garde déjà les optimisations de CI.
⮕ **Ajoute-lui un cas** : *la liste des exclus est celle-ci, nommément, et pas une de plus.*
⚠ **C'est la garde contre la dérive** — celle qui empêche qu'on ajoute un septième nom un jour où
il rougit, sans que personne ne l'ait décidé. **Une exclusion qui peut grandir en silence finit par
tout exclure.**

### Le journal

`tests.yml` porte un journal daté. ⮕ **Entrée courte** : la date, le verdict du run
`33671445284` (233 passés / 6 échoués en 32 min 35), la cause — WebKit Linux ≠ Safari macOS, déjà
nommée le 18 août — et **ce à quoi on renonce** : *le planificateur n'est plus jugé
automatiquement nulle part ; son filet devient la passe locale sur macOS.*

---

## ⚠ CE QUE CE LOT NE RÈGLE PAS, ET QUI DOIT ÊTRE INSCRIT

**La vraie question reste ouverte** : ces gestes de pointeur se comportent-ils réellement
autrement sous WebKit Linux, ou les specs présument-elles une géométrie de macOS ? ⮕ **Personne
ne l'a mesuré.** C'est un autre lot, il n'est pas urgent — aucun des six ne touche les huit
gestes — mais **il ne doit pas disparaître avec le rouge.** *Inscris-le* (issue 2 de `CLAUDE.md`).

⛔ **N'essaie PAS de les réparer dans ce lot.** Ce serait un chantier de plusieurs heures sur du
code qui ne bloque aucun énoncé.

## Fini quand

1. `cd tests && npm run test:int` sur la machine de Grégoire lance toujours **239**.
2. Après le push, la commande du rituel rend **`success`** sur le commit poussé.
3. ▣ **Et le témoin qui compte plus que le vert** : la sortie du job **nomme les six**, et la ligne
   du matin dit qu'ils n'ont pas été jugés.
   ⚠ **Un vert sans cette mention est un échec de ce lot**, pas un succès.

## L'ordre

- **Rien dans `js/`** ⮕ pas de bump de jetons, pas de release.
- Ce lot touche `tests/` (le cliquet) : `cd tests && npm run test:unit` avant de dire que c'est prêt.
- Règle 6 : **tu commites, puis tu t'arrêtes.**
- ⚠ **Exception nommée** : le verdict ne se prend qu'APRÈS le push, puisque c'est la CI qu'on
  règle. Grégoire pousse, **puis** tu lis et tu rapportes.
- ⮕ **Ce que Grégoire doit aller voir : RIEN à l'écran.** Dis-le-lui.
- Ce fichier se commite avec ton lot.

---

# ✅ EXÉCUTÉE — 2 septembre 2026, 15 h 55 → 16 h 25 · committée, NON poussée

**Remesure** : HEAD `5f6eb365`, poussé — conforme. Quatre fichiers non suivis dans
`plans de travail/` (CADRAGE, CONSIGNE-PROCHAINE, EBAUCHE, NOTE) : **tous laissés hors du
commit**, ils ne sont pas mon lot.

## Le mécanisme, tranché : `grepInvert` dans `playwright.config.js`, sous une variable que seule la CI pose

`EXCLUS_WEBKIT_LINUX` = six paires `{ fichier, titre }` ; `grepInvert` n'est construit que si
`PW_EXCLURE_WEBKIT_LINUX=1`, posée par l'étape Playwright de `tests.yml` et nulle part
ailleurs (ni `package.json`). **Pourquoi là** : la liste vit dans UN fichier lisible par le
cliquet et par le job ; et sur macOS, `npm run test:int` lance les 239 sans rien à taper —
mesuré : `--list` rend **239** sans la variable, **233** avec. Aucun spec touché.

### ⚠ La trouvaille qui a changé le lot — attrapée par le cliquet, pas par la CI
Ma première version excluait **par fichier**. Le cliquet a rougi : « expected 6 to be 17 ».
**Les cinq fichiers portent 17 essais** ; six sont rouges, **onze sont verts** et mesurent
quelque chose sur Linux. Exclure par fichier les aurait sacrifiés sans le dire. ⮕ Exclusion
**par titre exact**, un motif `fichier.*titre` par essai — et un `diff` des deux `--list`
prouve que les six manquants sont exactement les six rouges du run 33671445284.

### La garde — le job DIT
Une étape nommée **`6 essais NON JUGÉS ici (5 specs, WebKit Linux ≠ Safari macOS)`**
précède Playwright : elle lit la liste depuis le config, l'écrit dans le log et dans le
résumé du job, et **échoue si son nom ne correspond plus à la liste**. Jouée en local sous
bash : `essais=6 specs=5`, garde OK. Le rituel (`§2.1`) porte un **quatrième état** —
*jugé partiellement, N essais exclus de cette plateforme* — avec la commande qui lit ce nom
d'étape, et la phrase : **un vert Playwright sur GitHub est un vert sur 233, pas 239.**

### Le cliquet — bloc 3, cinq cas
La liste est celle-ci nommément ; chaque titre existe encore tel quel dans son fichier (un
titre reformulé ferait revenir le rouge : mieux vaut le savoir ici) ; sans variable
`grepInvert` est `undefined` et chaque motif matche son essai sans déborder sur un voisin ;
le nom d'étape compte juste ; la variable n'est posée que sur l'étape Playwright de la CI.
**Break-tests** : une 7ᵉ entrée → **rouge** ; le compte du nom d'étape → **rouge**. 13/13.

**Journal** : point (5) de `tests.yml`. **Inscrit, pas réglé** : personne n'a mesuré si ces
gestes se comportent vraiment autrement sous WebKit Linux ; ces six ne sont plus jugés
automatiquement nulle part, leur filet est la passe locale macOS. Suite : **437 / 4724**.

## Fini quand — après le push de Grégoire
Ce push touche `tests/` et `tests.yml` → Playwright tourne, sur 233. Attendu : `success`
sur les deux jobs, **et** le nom d'étape « 6 essais NON JUGÉS » visible dans le job
Playwright. Un vert sans cette mention serait un échec du lot. Rien à voir à l'écran.
