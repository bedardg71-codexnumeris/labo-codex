# Consigne de démarrage – la session Cowork qui prend le relais

> **Réécrite le dimanche 13 septembre 2026, 15 h 35 (Toronto)**, à la clôture d'une journée de **dix versions** (`1.139.1` à
> `1.140.5`), **sept lots** dont six livrés et poussés, **onze relectures croisées**, et deux questions tranchées par Grégoire.
> Elle REMPLACE toute version précédente ; celle de 14 h 25 est archivée sous
> `plans de travail/_ancienne-CONSIGNE-DEMARRAGE-COWORK-2026-09-13-14h25.md`.
>
> ⚠ **Ce fichier porte un nom sans date, exprès.** La date d'écriture est en tête ; c'est elle qui fait foi.
> ⛔ **Il ne porte que ce qui PÉRIME** : l'état mesuré, le mandat, ce qui est dû, et les erreurs déjà payées.

---

## 1 · CE QUE TU ES, ET CE QUE TU N'ES PAS

**Le dispositif est à trois, et les canaux ne se croisent pas.** Grégoire décide, relaie, et fait tourner l'application sur ses
vraies données. **Toi, Cowork** : tu **mesures** le dépôt en lecture seule, tu **rédiges** les consignes de lot, tu **relis** ce qui
ne se reprend pas, tu publies les artefacts des portes et tu tiens ses fichiers de cadrage.

⛔ **TU NE PARLES PAS À CLAUDE CODE.** Une consigne va dans un FICHIER (`plans de travail/CONSIGNE-DU-JOUR.md`, l'ancienne archivée
`_ancienne-CONSIGNE-DU-JOUR-<date>-<sujet>.md`) **et** dans le message, dans un **bloc de code** – jamais dans un artefact, jamais
avec des retours à la ligne manuels.

⚠⚠ **TU NE VOIS PAS LE CANAL ENTRE GRÉGOIRE ET CLAUDE CODE.** Arrivé **quatre fois** le 13 : un lot mesuré « pas engagé » était
livré quatre minutes plus tard ; 1.140.3 était en ligne pendant qu'on la croyait locale ; le lot #551 attendait son commit et
l'avait déjà ; et **le sommet de la branche #520 a changé de SHA après que j'aie rendu mon verdict dessus**. ⮕ **Devant un écart,
remesure avant de conclure ; la première hypothèse est « ça a avancé », pas « le relais a échoué ». Et un verdict se rend sur un
SHA : redis lequel, et revérifie qu'il est encore le sommet.**

⚠ **TU N'ÉCRIS PAS DANS `js/`, ni dans `BACKLOG.md`, ni dans `PROTOCOLE.md`** – tu en proposes le texte, Claude Code l'écrit.
⚠ **`git --no-optional-locks status`**, jamais `git status` nu.
⚠ **L'horloge du montage est en UTC** : toute heure s'écrit après `TZ=America/Toronto date`, dans la même commande que l'écriture.
✅ **Ce shell A un réseau** (`npm ping` répond). C'est ce qui permet d'installer `vitest` dans un banc jetable.

### Monter un banc d'essai – DEUX méthodes, et la deuxième n'est pas optionnelle

1. **`git archive <SHA> | tar -x -C "$HOME/rel"`** – l'arbre seul, sans `.git`.
2. **`git clone --shared --branch <branche> <dépôt> "$HOME/rel"`** – 400 Ko, instantané. ⛔ Lecture seule : aucun `gc`, `prune`, `push`.

⚠⚠ **La suite complète rend 7 essais ROUGES dans un banc sans `.git`** (sentinelles anti-cache, pre-push, `.gitignore`, icônes
suivies par git). Dans le clone partagé, les mêmes fichiers sont **verts**. ⮕ **Toute suite complète se prend dans le clone.**
⚠ Le `tests/node_modules` du Mac porte des binaires macOS : `npm install` dans le banc (2 s), ne lie pas le sien.
⛔ **N'utilise PAS `git worktree`** : l'entrée reste fantôme dans le `.git` de Grégoire.
⚠ **Un `npx vitest` lancé en arrière-plan MEURT à la fin de l'appel** : chaque `device_bash` est un shell neuf. La suite complète
tient en 27 s : lance-la en synchrone avec `timeout 170`. **Et efface ton banc à la fin.**

---

## 2 · À LIRE D'ABORD, DANS CET ORDRE

1. **`OU-EN-EST-ON.md`**, sa tête – où on en est, en gestes d'utilisateur.
2. **`PROTOCOLE.md`** – les règles, dont la 6 (ouverture) et la 8 (verdict Playwright, **Cowork fermé** : **c'est GRÉGOIRE qui
   ferme**, pas toi – tu ne peux pas te fermer toi-même ; Claude Code lance).
3. **`plans de travail/TRI-2026-09-13-fiches-ouvertes-par-cout.md`** – le tri, et son **jumeau publié** (artefact « Tri du chantier
   Labo Codex », `06cc946c-fb10-4e1c-aa3c-5409dceb0f55`). **Tenir les deux à jour après chaque lot.**
4. **`plans de travail/CONSIGNE-DU-JOUR.md`** – le lot #520, **codé, relu, en attente de fusion** (§ 4).
5. **`BACKLOG.md`**, l'en-tête et les fiches nommées au § 4 seulement.

⛔ **Ne lis PAS les 150 autres fichiers de `plans de travail/`.** ⛔ Jamais de `Read` par défaut sur `BACKLOG.md`, `SESSION.md`
ou `RELAIS.md` : des centaines de milliers d'octets. En-tête, puis cibler.

---

## 3 · L'ÉTAT MESURÉ – le 13 septembre 2026, 15 h 32 (Toronto)

**Remesure, ne recopie pas** : `cat version.json` · `git --no-optional-locks log --oneline -3 main` ·
`git --no-optional-locks log --oneline -1 origin/main` · `git --no-optional-locks status --porcelain` ·
`git --no-optional-locks log --oneline -1 claude/520-ancien-systeme-echelles` · `TZ=America/Toronto date`.

- **`main` = `origin/main` = `c5d0f366`, version `1.140.5`, build `0913-1457`. Rien en attente de push. Arbre propre.**
- **Une branche vit à côté** : `claude/520-ancien-systeme-echelles` = **`d4e2923f`**, deux commits au-dessus de `main`,
  **jamais fusionnée, jamais poussée**. C'est tout le travail en vol.
- **Dix versions livrées le 13** : `1.139.1` à `1.139.4` · `1.140.0` (#853) · `1.140.1` (chaîne anti-cache) · `1.140.2` (#746,
  #551 garde, #542) · `1.140.3` (#847) · `1.140.4` (#657) · `1.140.5` (#551, la suggestion sans lettre).
- **228 fiches ouvertes** au BACKLOG de `main`. ⚠ **Le compte se prend à la RACINE** : `grep -c '^- \[ \]'` donne 229, **moins le
  gabarit de la section « Notes »**. Écris le compte avec la commande qui le produit, à côté.
- **29 de ces 228 portent le verrou « après le 14 »**, posé par Grégoire lui-même.
- **Dernier ID utilisé : #857**, fusionnée dans #553. **#858 est réservé pour la fiche des tranches nues – PAS ENCORE INSCRIT.**
- **Suite complète sur `d4e2923f`, dans le clone partagé : 558 fichiers, 6 337 essais, verts.**
- **`QUESTIONS-EN-ATTENTE-2026-09-13.md` est périmé** : les quatre questions sont closes. **Ne le ressers pas.**

---

## 4 · CE QUI EST DÛ – dans l'ordre

**a) À l'ouverture (règle 6)** : remesurer, et vérifier sur quelle branche est l'arbre de travail.

**b) LE LOT #520 EST RELU ET VERT, IL ATTEND SA FUSION.** Il retire le bloc « ANCIEN SYSTÈME » des échelles d'`index.html`
(8 identifiants dupliqués → 0) et, avec lui, `sauvegarderConfigEchelle` et `changerTypeEchelle`, devenues mortes.
**Il reste : le verdict Playwright complet, Cowork fermé — puis la fusion sur `main`, puis le push. PAS DE RELEASE** (aucun geste
d'utilisateur ne change).
⚠ **Mon verdict a été rendu sur `b07df06e` ; le sommet est `d4e2923f`.** J'ai lu le delta : quatre lignes qui ajoutent au bord C
le garde de non-vide de la règle 10, sur son propre découpage. **Le verdict tient.** Ne le reprends pas à zéro ; contente-toi de
vérifier que le sommet n'a pas encore bougé.

**c) DEUX TEXTES APPROUVÉS PAR GRÉGOIRE, PAS ENCORE DANS LE DÉPÔT** – relayés à Claude Code vers 15 h 30 :
la **règle 10** de `PROTOCOLE.md` (« une assertion négative se porte sur une tranche dont on a prouvé qu'elle n'est pas vide »)
et la **fiche #858** (30 assertions à réparer, une fonction de découpe qui refuse, un cliquet contre `slice(indexOf(`).
⮕ **`grep -c '^## Règle 10' PROTOCOLE.md` et `grep -c '#858' BACKLOG.md` avant de refaire quoi que ce soit** : à 15 h 32 les deux
rendaient 0. S'ils rendent 0 encore, redemande à Grégoire de les relayer ; **ne les réécris pas de mémoire, les textes sont dans
la conversation du 13 et ils sont approuvés au mot près.**

**d) UNE LIGNE PÉRIMÉE DANS LE RELAIS POUSSÉ** : `c5d0f366` cite `6fbd5414` comme SHA de #520. Il a changé deux fois depuis
(`7afa62b9`, puis `d4e2923f`). Claude Code doit le corriger dans le relais qui suivra le push de #520.

**e) LES DEUX DATES** : **lundi 14**, l'orthopédagogue ouvre l'application sur son poste – ce qui casse chez elle se saura par un
courriel, pas par une porte. **Mardi 15**, la communauté de pratique (une vingtaine) découvre l'accueil neuf. **1.140.5 est en
ligne : tout ce qui avait une date est livré.** ⮕ **Un retour d'elle ou d'un collègue passe AVANT le backlog, sans discussion.**

**f) Ce qui attend son mois d'usage, et ne se rouvre pas** : #836, #838, #839, #840, les 29 fiches « après le 14 », et **#742**
(bornes d'alerte, verrou du 13). Ne propose pas de les avancer.

**g) Tenir le tri à jour** – le markdown ET l'artefact jumeau, comptes repris sur `main`.

### ⛔ Ne cherche pas de lot dans le backlog

**La règle de sélection – ni arbitrage ni vérification à l'écran – a épuisé le chantier ; #520 était le dernier.** Mesuré trois
fois le 13 : `js/interventions.js`, `js/profil-etudiant-calculs.js` et `index.html` sont vides de lots codables sans lui.
⮕ **Ne sonde plus fichier par fichier** : ça coûte un tour pour la même réponse. **Le prochain lot est #858, et il attend d'être
inscrit.** Après lui, il n'y a rien qui ne passe par Grégoire ou par le 14.

---

## 5 · LES ERREURS QUE J'AI PAYÉES LE 13 – ne les refais pas

1. ⚠⚠ **J'AI GÉNÉRALISÉ DEPUIS UN ÉCHANTILLON.** J'ai lu le bloc « Conteneurs cachés pour compatibilité » d'`index.html`, j'y ai
   compté huit `<div>` vides, et j'ai écrit que **les huit** identifiants dupliqués étaient des souches. **Sept l'étaient** ;
   `nomEchelleTemplate` (l. 5188) est le vrai champ « Nom de l'échelle ». Le bloc contenait un neuvième id sans rapport.
   ⮕ **Quand tu écris « les N sont tous X », vérifie les N, pas un bloc qui en contient à peu près N.** Claude Code m'a corrigé.
2. **J'AI PORTÉ UN COMPTE FAUX PARCE QUE MON `grep` NE VOYAIT PAS UN CAS À CHEVAL SUR DEUX LIGNES** (5 balises à double `class`
   sur 17 ; la sentinelle en comptait 6 sur 19). ⮕ **Quand une sentinelle fige une liste, c'est ELLE qui fait foi, pas ton grep.**
3. **J'AI RECOPIÉ UN COMPTE AU LIEU DE REFAIRE LA SOUSTRACTION** : la consigne disait 230 fiches, la mesure en donnait 229 puis 228.
4. **J'AI SOUPÇONNÉ UNE ERREUR SANS LIRE LA CONVENTION** : l'entrée « Nouvelles » de #551 était au bon endroit, la règle « une
   entrée par version MINEURE » est écrite en tête de `changelog-data.js`. ⮕ **Lis la convention du fichier avant de crier.**
5. ⚠⚠ **J'AI FAIT INSCRIRE UN DOUBLON** (#857 = #553, ouverte depuis le 27 août). ⮕ **Avant d'inscrire une trouvaille, `grep` le
   backlog sur ses mots-clés.** Fait pour #858, qui est propre.
6. **UNE INTERDICTION DE CONSIGNE VAUT POUR SON LOT.** Quand une consigne renverse la précédente, écris-le en tête, en la citant –
   sinon Claude Code s'arrête, et il a raison.

### Ce qui a tenu, et qu'il faut refaire
- **Reposer les mutations soi-même.** Trois fois le 13, ça a changé la conclusion : la mutation `Mf` a prouvé que le couplage
  bilan/suggestion de #551 vivait encore ; la mutation `M3` (renommer une fonction) a montré que le bord C de #520 tenait sur les
  deux bouts. **Un journal de mutations n'est pas une preuve ; le rouge que tu obtiens toi-même en est une.**
- **Mesurer avant de cadrer.** Sur sept lots, la mesure a corrigé la fiche à chaque fois. #520 nommait cinq identifiants dont un
  qui n'était pas dupliqué ; il y en avait huit.
- **Dire quand une de ses propres hypothèses est réfutée.** Fait six fois le 13. Chaque fois : une ligne, et un lot évité.
- **Restaurer le fichier muté et le prouver** (`cmp`), puis effacer le banc.

---

## 6 · COMMENT GRÉGOIRE VEUT QU'ON LUI PARLE

- ⚠⚠ **Ce qui le met en surcharge n'est PAS la quantité de travail, c'est la quantité d'information par TOUR.** Une séance peut
  avoir quarante tours ; **chaque tour n'a qu'UN objet.** ⚠ C'est la règle qui se perd en session longue – **revérifie-la avant
  chaque réponse.**
- **Pose ta question au moment où elle se pose**, et **ne reviens jamais trois tours plus tard** sur un item présenté avant.
- **Toujours une recommandation argumentée**, jamais un exposé d'options neutre. **Propose-lui un texte à corriger.** Tutoiement,
  guillemets français, tiret demi-cadratin, réponse courte d'abord.
- **Les numéros de fiches ne lui disent rien** : rends l'avancement en gestes d'utilisateur, les numéros entre parenthèses en fin
  de ligne.
- **Le 13, il travaillait en parallèle sur autre chose.** Pour le choix des lots, prends ceux qui ne lui demandent ni arbitrage ni
  écran à vérifier.
- ⚠ **Il corrige bien, et souvent contre toi.** Quand il propose un mot, cherche d'abord ce qui le rend juste.

### Ce qui remonte jusqu'à lui, et rien d'autre
La **didactique** · ses **données réelles** · les **mots que ses élèves et ses collègues lisent** · ce qui **l'engage publiquement**.
⮕ **Tout le reste, tu le tranches seul et tu le dis en une ligne, en nommant ce que tu as supposé.**

⚠ **Une chose qu'il est SEUL à pouvoir faire, et ce n'est pas un arbitrage : fermer Cowork** avant le verdict Playwright. Tu ne
peux pas te fermer toi-même. Demande-le en une phrase, et donne-lui le bloc de relais AVANT qu'il ferme – après, tu n'es plus là.

---

## 7 · CE QUI ATTEND UN MOMENT CALME

**Une seule chose reste en réserve** : la décision sur le **stock** de #520. L'ablation a tari une écriture qui aplatissait la clé
nue `configEchelle` (`notePassage` et `codesPersonnalises` remis à vide) à chaque chargement d'échelle. **La source est tarie ; le
stock déjà aplati ne l'est pas**, chez Grégoire comme dans toute sauvegarde Codex (`codex.js` exporte toutes les clés). C'est
**ses données réelles** : ça se propose, ça ne se répare pas d'office. La fiche #520 le dit ; ne le rouvre pas avant qu'il en parle.
