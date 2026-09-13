# Consigne de démarrage – la session Cowork qui prend le relais

> **Réécrite le dimanche 13 septembre 2026, 14 h 25 (Toronto)**, à la clôture d'une journée de **neuf versions** (`1.139.1` à
> `1.140.4`), **six lots** dont cinq livrés et poussés, **huit relectures croisées**, et deux questions tranchées par Grégoire.
> Elle REMPLACE toute version précédente ; celle de midi est archivée sous
> `plans de travail/_ancienne-CONSIGNE-DEMARRAGE-COWORK-2026-09-13-midi.md`.
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

⚠⚠ **TU NE VOIS PAS LE CANAL ENTRE GRÉGOIRE ET CLAUDE CODE.** Arrivé deux fois le 13 : un lot mesuré « pas engagé » était livré
quatre minutes plus tard, et 1.140.3 était en ligne pendant que je la croyais locale. **Devant un écart, remesure avant de
conclure ; la première hypothèse est « ça a avancé », pas « le relais a échoué ».**

⚠ **TU N'ÉCRIS PAS DANS `js/`.** ⚠ **`git --no-optional-locks status`**, jamais `git status` nu.
⚠ **L'horloge du montage est en UTC** : toute heure s'écrit après `TZ=America/Toronto date`, dans la même commande que l'écriture.
✅ **Ce shell A un réseau** (corrigé le 13 : la consigne de midi disait le contraire ; `npm ping` répond). C'est ce qui permet
d'installer `vitest` dans un banc jetable.

### Monter un banc d'essai – DEUX méthodes, et la deuxième n'est pas optionnelle

1. **`git archive <SHA> | tar -x -C "$HOME/rel"`** – l'arbre seul, sans `.git`.
2. **`git clone --shared --branch main <dépôt> "$HOME/rel"`** – 400 Ko, instantané. ⛔ Lecture seule : aucun `gc`, `prune`, `push`.

⚠⚠ **MESURÉ LE 13, ET ÇA A FAILLI ME FAIRE ANNONCER UN FAUX ROUGE** : la suite complète rend **7 essais rouges dans un banc sans
`.git`** (sentinelles anti-cache, pre-push, `.gitignore`, icônes suivies par git). Dans le clone partagé, les mêmes 557 fichiers
sont **verts**. ⮕ **Toute suite complète se prend dans le clone, jamais dans l'archive.**
⚠ Le `tests/node_modules` du Mac porte des binaires macOS : `npm install` dans le banc (2 s), ne lie pas le sien.
⛔ **N'utilise PAS `git worktree`** : l'entrée reste fantôme dans le `.git` de Grégoire.
⚠ **Un `npx vitest` lancé en arrière-plan MEURT à la fin de l'appel** : chaque `device_bash` est un shell neuf. La suite complète
tient en 30 s : lance-la en synchrone avec `timeout 170`.

---

## 2 · À LIRE D'ABORD, DANS CET ORDRE

1. **`OU-EN-EST-ON.md`**, sa tête – où on en est, en gestes d'utilisateur.
2. **`PROTOCOLE.md`** – les règles, dont la 6 (ouverture) et la 8 (verdict Playwright, **Cowork fermé** : c'est GRÉGOIRE qui ferme,
   CLAUDE CODE qui lance ; ta VM pesait 2,9 Go les soirs de panique noyau).
3. **`plans de travail/TRI-2026-09-13-fiches-ouvertes-par-cout.md`** – le tri, et son **jumeau publié** (artefact « Tri du chantier
   Labo Codex », `06cc946c-fb10-4e1c-aa3c-5409dceb0f55`). **Tenir les deux à jour après chaque lot.**
4. **`plans de travail/CONSIGNE-DU-JOUR.md`** – le lot #551, **codé dans l'arbre, pas commité** (§ 4).
5. **`BACKLOG.md`**, l'en-tête et les fiches nommées au § 4 seulement.

⛔ **Ne lis PAS les 150 autres fichiers de `plans de travail/`.** ⛔ Jamais de `Read` par défaut sur `BACKLOG.md`, `SESSION.md`
ou `RELAIS.md` : des centaines de milliers d'octets. En-tête, puis cibler.

---

## 3 · L'ÉTAT MESURÉ – le 13 septembre 2026, 14 h 25 (Toronto)

**Remesure, ne recopie pas** : `cat version.json` · `git --no-optional-locks log --oneline -3 main` ·
`git --no-optional-locks log --oneline -1 origin/main` · `git --no-optional-locks status --porcelain` · `TZ=America/Toronto date`.

- **`main` = `origin/main` = `53eb0de9`, version `1.140.4`, build `0913-1400`. Rien en attente de push.** L'arbre est sur `main`.
- **Neuf versions livrées le 13** : `1.139.1` à `1.139.4` (bandeau de version, pack démo à dix élèves, vue « tous groupes »,
  jetons de reprise, Artefact 9) · `1.140.0` (#853) · `1.140.1` (chaîne anti-cache) · `1.140.2` (#746, #551 garde, #542) ·
  `1.140.3` (#847, les exemples gris) · `1.140.4` (#657, un fichier `js/` neuf ne peut plus entrer sans être chargé).
- **230 fiches ouvertes** au BACKLOG de `main`. ⚠ **Le compte se prend à la RACINE** : `grep -c '^- \[ \]'` moins le gabarit de la
  section « Notes ». Compter les cases indentées donne 234, un faux que ce fichier et l'artefact ont porté une demi-journée.
- **29 de ces 230 portent le verrou « après le 14 »**, posé par Grégoire lui-même.
- **Dernier ID : #857**, et c'est un **doublon de #553** – voir § 5.
- **Les quatre questions en attente sont toutes closes.** Q1 livrée (#847), Q3 répondue par le code (#746, le profil suit le
  groupe), Q2 tranchée (#742, option C), Q4 tranchée (#551, « la quatrième voie »). `QUESTIONS-EN-ATTENTE-2026-09-13.md` est
  périmé : **ne le ressers pas**.

---

## 4 · CE QUI EST DÛ – dans l'ordre

**a) À l'ouverture (règle 6)** : remesurer, et vérifier sur quelle branche est l'arbre de travail.

**b) LE LOT #551 EST DANS L'ARBRE, NON COMMITÉ** – mesuré à 14 h 23 : `js/interventions.js` (les trois chaînes, faites),
`js/changelog-data.js`, `scripts/release.mjs` (le commentaire sur le repère de bump), et les deux bancs
(`sentinelle-746-551`, `sentinelle-lot-5-interventions-cadrage-11`). **Il attend son commit, puis TA RELECTURE CROISÉE, puis la
release patch AVEC entrée « Nouvelles », puis le verdict et le push.** La consigne est au § 4 de `CONSIGNE-DU-JOUR.md`.
⚠ **À vérifier en priorité dans cette relecture** : le bloc B de `sentinelle-lot-5-interventions-cadrage-11` prouvait que le bilan
et la suggestion bougent ENSEMBLE quand un seuil se déplace. Ce couplage passait par la lettre, qui disparaît. **S'il ne tient plus
que sur une chaîne remplacée, le cas survit mais la preuve est morte.**

**c) LES DEUX DATES** : **lundi 14**, l'orthopédagogue ouvre l'application sur son poste – ce qui casse chez elle se saura par un
courriel, pas par une porte. **Mardi 15**, la communauté de pratique (une vingtaine) découvre l'accueil neuf. 1.140.4 est en ligne :
ce qui avait une date est livré.

**d) Ce qui attend son mois d'usage, et ne se rouvre pas** : #836, #838, #839, #840, plus les 29 fiches « après le 14 », plus
**#742** (bornes d'alerte, verrou posé le 13 : elles ne deviennent réglables que si un usage réel le réclame). Ne propose pas de
les avancer.

**e) Tenir le tri à jour** – le markdown ET l'artefact jumeau, comptes repris sur `main`.

---

## 5 · LES ERREURS QUE J'AI PAYÉES LE 13 – ne les refais pas

1. ⚠⚠ **J'AI FAIT INSCRIRE UN DOUBLON.** `#857` (le nom « français » écrit en dur) **est `#553`**, ouverte depuis le 27 août, avec
   une mesure du 31 août qui va plus loin que la mienne : les normalisations sont DÉJÀ identiques, le désaccord est entre deux
   chaînes SOURCE, et retirer le rabotage sans savoir d'où vient l'autre clé casserait l'appariement. ⮕ **Avant d'inscrire une
   trouvaille, `grep` le backlog sur ses mots-clés.** Le compteur qui monte parce qu'on cherche mieux est ce que Grégoire déteste
   le plus. *(La fusion de #857 dans #553 est dans la consigne du jour, § 6.)*
2. **J'AI ANNONCÉ DEUX COMPTES FAUX** (234 ici, 241 dans l'artefact) en comptant des sous-cases indentées et des fiches livrées.
   ⮕ Un compte s'écrit avec la commande qui le produit, à côté.
3. **J'AI CADRÉ UN LOT SUR UNE PISTE QUE LA MESURE RÉFUTAIT.** Proposé à Grégoire de lire le niveau « dans l'échelle de chacun » ;
   la grille de dépistage dit les CRITÈRES, pas l'échelle, et l'éditeur n'écrit jamais d'`echelleId` (mesuré sur ses trois
   trimestres, `js/cartouches.js:438-450`). ⮕ **Mesurer la source d'une donnée AVANT de la promettre dans une question.**
4. **J'AI ÉCRIT UNE INTERDICTION QUI A FAILLI BLOQUER LE LOT SUIVANT.** La consigne #847 disait « si ces assertions bougent,
   RECULER » ; la consigne #551 exige précisément qu'elles bougent. ⮕ **Une interdiction de consigne vaut POUR SON LOT. Quand une
   consigne renverse la précédente, écris-le en tête, en la citant** – sinon Claude Code s'arrête, et il a raison.
5. **J'AI CRU UN JOURNAL DE BREAK-TESTS SUR UN COMPTE** (3 rouges annoncés, 2 mesurés). ⮕ La divergence venait de MA mutation, pas
   du compte. **Repose la mutation à l'endroit exact où elle a été posée** avant d'annoncer un écart.

### Ce qui a tenu, et qu'il faut refaire
- **Mesurer avant de cadrer.** Sur six lots, la mesure a corrigé la fiche à chaque fois : #847 annonçait deux sites, il y en avait
  trois ; #746 en nommait six, deux avaient déménagé ; #657 disait « aucun défaut », il y avait quatre cas à classer.
- **Refaire les mutations soi-même**, et **regarder ce qui reste VERT** : c'est là qu'était la trouvaille du 13 (un cas vrai par
  construction depuis le 10 sept., découvert parce qu'une assertion négative sur une tranche vide ne peut pas rougir).
- **Dire quand une de ses propres hypothèses est réfutée.** Fait quatre fois le 13 ; chaque fois ça a coûté une ligne et évité un lot.

---

## 6 · COMMENT GRÉGOIRE VEUT QU'ON LUI PARLE

- ⚠⚠ **Ce qui le met en surcharge n'est PAS la quantité de travail, c'est la quantité d'information par TOUR.** Une séance peut
  avoir quarante tours ; **chaque tour n'a qu'UN objet.** ⚠ C'est la règle qui se perd en session longue – **revérifie-la avant
  chaque réponse.** Le 13, il a demandé deux questions d'un coup : je n'en ai posé qu'une, en disant pourquoi. C'était juste.
- **Pose ta question au moment où elle se pose**, et **ne reviens jamais trois tours plus tard** sur un item présenté avant.
- **Toujours une recommandation argumentée**, jamais un exposé d'options neutre. **Propose-lui un texte à corriger.** Tutoiement,
  guillemets français, tiret demi-cadratin, réponse courte d'abord.
- **RÈGLE DE SÉLECTION DES LOTS** : prendre ceux qui **ne lui demandent ni arbitrage ni vérification à l'écran**.
  ⚠ **Mesuré le 13 : cette règle a épuisé le chantier.** Deux fichiers qu'il a nommés (`js/interventions.js`, puis
  `js/profil-etudiant-calculs.js`) étaient VIDES de lots codables. ⮕ **Ne sonde plus fichier par fichier** : ça coûte un tour à
  chaque fois pour la même réponse. Ce qui reste passe par lui ou par le 14.
- ⚠ **Il corrige bien, et souvent contre toi.** Quand il propose un mot, cherche d'abord ce qui le rend juste.

### Ce qui remonte jusqu'à lui, et rien d'autre
La **didactique** · ses **données réelles** · les **mots que ses élèves et ses collègues lisent** · ce qui **l'engage publiquement**.
⮕ **Tout le reste, tu le tranches seul et tu le dis en une ligne, en nommant ce que tu as supposé.**

---

## 7 · DEUX LEÇONS DUES À `PROTOCOLE.md` (survivantes, à faire monter)

Elles ne périment pas, donc elles n'ont rien à faire ici. **À proposer à Grégoire au prochain moment calme :**

1. **Une assertion NÉGATIVE sur une tranche vide est vraie par construction.** Tout banc qui découpe un fichier avant d'y chercher
   une absence doit porter un garde de non-vide sur sa tranche. Mesuré le 13 : un cas vivait ainsi depuis le 10 septembre.
2. **Avant d'inscrire une trouvaille au backlog, vérifier qu'elle n'y est pas déjà** (§ 5.1).
