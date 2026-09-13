# Consigne de démarrage – la session Cowork qui prend le relais

> **Réécrite le dimanche 13 septembre 2026, début d'après-midi (Toronto)**, par la session Cowork du 13, à la clôture d'une journée de
> **six versions** (`1.139.1` à `1.140.1`), **trois lots** dont deux livrés, **quatre relectures croisées** et un tri complet du chantier.
> Elle REMPLACE toute version précédente ; celle du 12 est archivée sous
> `plans de travail/_ancienne-CONSIGNE-DEMARRAGE-COWORK-2026-09-12.md`.
>
> ⚠ **Ce fichier porte un nom sans date, exprès.** La date d'écriture est en tête ; c'est elle qui fait foi.
> ⛔ **Il ne porte que ce qui PÉRIME** : l'état mesuré, le mandat, ce qui est dû, et les erreurs déjà payées. Ce qui a survécu à trois
> sessions monte dans `PROTOCOLE.md` et quitte ce fichier.

---

## 1 · CE QUE TU ES, ET CE QUE TU N'ES PAS

**Le dispositif est à trois, et les canaux ne se croisent pas.** Grégoire décide, relaie, et fait tourner l'application sur ses vraies
données. **Toi, Cowork** : tu **mesures** le dépôt en lecture seule, tu **rédiges** les consignes de lot, tu **relis** ce qui ne se
reprend pas, tu publies les artefacts des portes et tu tiens ses fichiers de cadrage.

⛔ **TU NE PARLES PAS À CLAUDE CODE.** Une consigne va dans un FICHIER (`plans de travail/CONSIGNE-DU-JOUR.md`, l'ancienne archivée
`_ancienne-CONSIGNE-DU-JOUR-<date>-<sujet>.md`) **et** dans le message, dans un **bloc de code** – jamais dans un artefact, jamais avec
des retours à la ligne manuels. Au-dessus du bloc, une ou deux phrases disent ce que la consigne va produire à l'écran.
⚠ **Le fichier n'est pas facultatif** : le message disparaît avec la conversation, le fichier reste pour la session suivante.

⚠⚠ **TU NE VOIS PAS LE CANAL ENTRE GRÉGOIRE ET CLAUDE CODE.** Il lui écrit directement, et il change d'avis. Devant un écart entre ce
que tu as relayé et ce que le dépôt porte, **la première hypothèse est « il a tranché autrement depuis », pas « le relais a échoué »**.
⚠ **Un SHA qu'on te donne n'est pas forcément le sommet de la branche** : mesuré le 13 sept., deux commits de plus l'attendaient, dont
un correctif d'incident. **Vérifie le sommet avant de relire, et dis-le si tu relis autre chose que ce qu'on t'a nommé.**

⚠ **TU N'ÉCRIS PAS DANS `js/`.** Un fichier temporaire va dans `$HOME`, hors du dossier de Grégoire.
⚠ **`git --no-optional-locks status`**, jamais `git status` nu.
⚠ **Ce shell n'a pas de réseau** : `origin/main` est la dernière valeur connue de ce Mac.
⚠ **L'horloge du montage est en UTC** : toute heure s'écrit après `TZ=America/Toronto date`, dans la même commande que l'écriture.

### Comment monter un banc d'essai sans toucher au dépôt de Grégoire (13 sept.)

Pour éprouver un lot par des mutations, il faut un arbre jetable. **Deux façons, dans cet ordre :**

1. **`git archive <SHA> | tar -x -C "$HOME/rel"`** – l'arbre seul, sans `.git`. Suffit quand les bancs n'ont pas besoin d'historique.
   Restauration d'un fichier muté : `git show <SHA>:<chemin> > "$HOME/rel/<chemin>"`.
2. **`git clone --shared --branch <branche> <dépôt> "$HOME/rel"`** – quand les bancs lisent l'historique (sentinelles anti-cache).
   404 Ko, instantané, parce que les objets ne sont pas copiés. ⛔ Lecture seule : aucun `gc`, `prune`, `push` ni réécriture dedans.

⛔ **N'utilise PAS `git worktree`** : le montage ne permet pas d'effacer le verrou d'initialisation, et l'entrée reste fantôme dans le
`.git` de Grégoire (arrivé le 13 ; il a fallu qu'il la retire à la main).
⚠ Le `tests/node_modules` du Mac porte des binaires macOS : sur un banc Linux, réinstalle `vitest` dans le banc, ne lie pas le sien.

---

## 2 · À LIRE D'ABORD, DANS CET ORDRE

1. **`OU-EN-EST-ON.md`**, sa tête – où on en est, en gestes d'utilisateur.
2. **`PROTOCOLE.md`** – les règles, dont la 6 (ce que tu fais à l'ouverture) et la 8 (verdict Playwright, Cowork fermé).
3. **`plans de travail/TRI-2026-09-13-fiches-ouvertes-par-cout.md`** – le tri du chantier : les 234 fiches ouvertes classées par coût de
   preuve, groupées par point du code, avec le **journal des lots** et ce que chaque relecture a trouvé. **C'est le document de
   pilotage ; il a un jumeau publié (artefact « Tri du chantier Labo Codex »), filtrable.**
4. **`plans de travail/QUESTIONS-EN-ATTENTE-2026-09-13.md`** – les quatre questions fermées qui attendent Grégoire. ⛔ **Ne les lui
   repose pas de toi-même** : elles sortent quand il a de l'attention disponible, pas quand tu ouvres la session.
5. **`plans de travail/CONSIGNE-DU-JOUR.md`** – le lot 3 (les interventions), écrit, **pas engagé**. Si Claude Code ne l'a pas exécuté,
   redonne la ligne ; s'il l'a fait, relis son commit (§ 4).
6. **`BACKLOG.md`**, l'en-tête et les fiches nommées au § 4 seulement.

⛔ **Ne lis PAS les 150 autres fichiers de `plans de travail/`.** ⛔ Ne fais jamais un `Read` par défaut sur `BACKLOG.md`, `SESSION.md`
ou `RELAIS.md` : ils pèsent des centaines de milliers d'octets. En-tête, puis cibler.

---

## 3 · L'ÉTAT MESURÉ – le 13 septembre 2026, début d'après-midi (Toronto), en lecture seule

**Remesure, ne recopie pas** : `cat version.json` · `git --no-optional-locks log --oneline -3 main` ·
`git --no-optional-locks status --porcelain` · `git rev-parse --abbrev-ref HEAD` · `TZ=America/Toronto date`.

- **`main` = `f1898c0a`, version `1.140.1`, build `0913-1244`.**
- ⚠ **L'ARBRE DE TRAVAIL N'EST PAS SUR `main`** : il est resté sur `claude/853-delai-sur-reprise` (`8ff669c0`), dont le `version.json`
  dit `1.139.4`. Signalé à Grégoire le 13 ; **remesure-le, il l'a peut-être remis depuis.** S'il ouvre l'application en local depuis
  cet arbre, il voit une version périmée et un backlog sans les quatre fiches fermées par le lot 2.
- **Six versions livrées le 13** : `1.139.1` (le bandeau de version dit la version du code qui tourne) · `1.139.2` (pack démo à dix
  élèves) · `1.139.3` (vue « tous groupes » + **lot 1**, les jetons de reprise) · `1.139.4` (l'Artefact 9 du pack démo) ·
  `1.140.0` (**#853**, le délai sur une reprise devient un réglage) · `1.140.1` (**lot 2**, la chaîne anti-cache).
- **234 fiches ouvertes** au BACKLOG de `main` (235 cases `- [ ]` moins le gabarit de la section « Notes »). Concordance exacte avec le
  tri. **Dernier ID : #856.**
- **Fermées aujourd'hui par les lots** : #617, #720, #724, #725 (lot 1) · #853 · #675, #547, #600, #826 (lot 2).
- **Restées ouvertes exprès** : **#721** (jetons personnalisés – sortie du lot 1, arbitrage de didactique) · **#827** (sortie du lot 2,
  symptôme conditionnel à une décision que rien n'exige) · **#602** (seule la moitié *lecture* est livrée ; poser les jetons touche des
  écrans) · **#854** (cause profonde de #853 : le moteur lit la configuration de l'assistant en premier, le formulaire de gestion n'est
  jamais consulté pour ces pratiques).
- **Non commités, de Cowork** : `CONSIGNE-DEMARRAGE-COWORK.md` (ce fichier), `plans de travail/TRI-2026-09-13-…md`,
  `plans de travail/QUESTIONS-EN-ATTENTE-2026-09-13.md`, `plans de travail/CONSIGNE-DU-JOUR.md` et son archive.
  **La consigne du jour dit à Claude Code de les commettre.**

---

## 4 · CE QUI EST DÛ – dans l'ordre

**a) À l'ouverture (règle 6)** : remesurer, et **vérifier sur quelle branche est l'arbre de travail** (§ 3).

**b) Le lot 3, « les interventions d'un élève suivent son groupe »** – `plans de travail/CONSIGNE-DU-JOUR.md`, écrit et non engagé.
Deux gestes dans `js/interventions.js`, zéro question pour Grégoire. S'il est livré quand tu ouvres : **relis-le** – le banc neuf de
`obtenirInterventionsEtudiant` doit exister (aucun ne l'éprouvait avant), et ses trois précautions de montage doivent y être.

**c) LA DATE QUI COMPTE : LUNDI 14** – l'orthopédagogue ouvre l'application sur son poste. Elle n'aura ni tes yeux ni les siens : ce qui
casse chez elle se saura par un courriel, pas par une porte. **Et mardi 15, la communauté de pratique (une vingtaine) découvre
l'accueil neuf.** ⮕ C'est ce calendrier qui rend Q1 du fichier des questions urgente : les deux exemples gris du formulaire
d'intervention citent encore les critères de Grégoire, et vingt collègues les liront.

**d) Ce qui attend son mois d'usage, et ne se rouvre pas avant** : #836 (tout est manuel pour un mois), #839, #840, #838. C'est sa règle
du 11 ; ne propose pas de les avancer.

**e) Tenir le tri à jour après chaque lot** : `plans de travail/TRI-2026-09-13-…md` **et** son artefact jumeau. Les comptes se reprennent
sur le `BACKLOG.md` de **`main`**, pas sur l'arbre de travail.

---

## 5 · COMMENT GRÉGOIRE VEUT QU'ON LUI PARLE

*Ce ne sont pas des préférences de style. Ce sont les conditions pour qu'il puisse décider.*

- ⚠⚠ **Ce qui le met en surcharge n'est PAS la quantité de travail d'une séance, c'est la quantité d'information par TOUR.** Une séance
  peut avoir quarante tours et quatre lots ; **chaque tour n'a qu'un objet**.
- **UNE SEULE IDÉE PAR RÉPONSE.** ⚠ C'est la règle qui se perd en session longue – **revérifie-la avant chaque réponse.**
- **Pose ta question au moment où elle se pose**, et **ne reviens jamais trois tours plus tard** sur un item présenté avant.
  ⮕ Ce qui doit attendre **se range dans un fichier**, pas dans la conversation. C'est à ça que sert
  `QUESTIONS-EN-ATTENTE-2026-09-13.md`.
- **Toujours une recommandation argumentée**, jamais un exposé d'options neutre. **Propose-lui un texte à corriger** plutôt que de lui
  demander d'en composer un. Tutoiement, guillemets français, tiret demi-cadratin, réponse courte d'abord.
- **RÈGLE DE SÉLECTION DES LOTS (13 sept., durable)** : prendre ceux qui **ne lui demandent ni arbitrage ni vérification à l'écran** –
  il travaille en parallèle, son attention disponible est limitée. Ce qui attend une décision de sa part se garde pour un moment où il
  est disponible. ⚠ **Quand il demande lui-même un lot qui ne respecte pas cette règle** (arrivé le 13 : « le lot qui touche
  `js/interventions.js`, 6/6 »), sa demande prime – mais **mesure d'abord** : sur six fiches, deux avaient changé de fichier, une était
  périmée, deux attendaient une décision. Le lot réel faisait deux gestes.
- **Les corrections se font le jour même**, pas après le 14.
- ⚠ **Il corrige bien, et souvent contre toi.** Quand il propose un mot, cherche d'abord ce qui le rend juste, puis mesure ce qui le
  rend faux. Les fois où Cowork l'a contredit utilement, c'était sur une **mesure**, jamais sur un goût.

### Ce qui remonte jusqu'à lui, et rien d'autre
La **didactique** · ses **données réelles** · les **mots que ses élèves et ses collègues lisent** · ce qui **l'engage publiquement**.
⮕ **Tout le reste, tu le tranches seul et tu le dis en une ligne, en nommant ce que tu as supposé.**

---

## 6 · CE QUE LES QUATRE RELECTURES DU 13 SEPTEMBRE ONT APPRIS

Toutes de la même famille : **une affirmation n'est pas une preuve, et un essai vert ne prouve pas ce qu'il prétend.**

1. **UN ESSAI PEUT PASSER POUR LA MAUVAISE RAISON.** Un autre garde-fou intercepte avant celui qu'on croit éprouver. Mesuré deux fois :
   la moitié `remplaceeParId` d'une garde restait verte sous mutation parce que la limite par production répondait à sa place ; et
   l'essai « déjà remplacée » n'assertait que le TYPE de la notification, jamais son titre. ⮕ **Toute consigne de lot doit nommer, pour
   chaque correctif, LA MUTATION QUI ISOLE le contrôle neuf** – et le montage qui écarte les garde-fous voisins.
2. **UN ESSAI PEUT PASSER À VIDE.** Le harnais garantit lui-même ce que l'assertion prétend vérifier : six assertions sur un magasin
   qu'aucun chemin du code ne pouvait toucher ; et une assertion sur une classe CSS que le faux DOM ne portait pas au départ, donc vraie
   même quand la ligne d'affichage n'existait plus. ⮕ **Demande-toi toujours : cette assertion peut-elle rougir ?** Si le harnais la
   rend vraie par construction, elle gonfle la couverture et ne protège rien.
3. **LE GOULOT EST LU DANS LA FICHE, PAS MESURÉ DANS LE CODE.** Trois fois sur trois lots, une fiche nommait un fichier que son défaut
   avait quitté (#689, #742, #542). ⮕ **Avant d'ouvrir un lot, vérifie que ses fiches vivent encore là où elles le disent.** Trente
   secondes, et deux fois sur trois ça a changé la composition du lot.
4. **LES COMPTES DE BREAK-TESTS D'UN JOURNAL NE SONT PAS REPRODUCTIBLES SI LA MUTATION N'EST PAS DÉCRITE.** Trois fois, un journal
   annonçait un nombre de rouges que la reproduction n'a pas retrouvé (11 contre 8 ; 3 contre 1 ; 1 contre 3). ⮕ **Refais les mutations
   toi-même.** Un chiffre de preuve qu'on ne peut pas reproduire n'est pas une preuve.
5. **UNE FICHE PEUT ÊTRE COCHÉE ALORS QUE LE CODE N'EST PAS LIVRÉ.** #853 a été cochée au BACKLOG pendant que son commit dormait sur sa
   branche, avec un correctif d'interface encore dû. ⮕ **Une case cochée se vérifie contre `main`, pas contre la fiche.**
6. **UN CORRECTIF PEUT SURVIVRE DANS SON PROPRE REPLI.** Le lot anti-cache corrigeait un repère git faux, et son repli de secours
   reproduisait exactement le même défaut sur un dépôt jeune. ⮕ **Relis les branches de secours d'un correctif avec la même sévérité
   que son chemin principal.**

### Ce qui a tenu, et qu'il faut refaire
- **Mesurer avant de cadrer.** Sur trois lots, la mesure a corrigé la fiche à chaque fois : une fiche à moitié périmée, deux fiches qui
  sont le même geste, une moitié seulement livrable, deux fiches déménagées, une moitié déjà réparée.
- **Sortir une fiche d'un lot AVANT de coder** quand elle demande un arbitrage ou étend la portée. Fait trois fois (#721, #827, la
  moitié « poser les jetons » de #602) ; chaque fois, le lot est resté livrable dans la journée.
- **Nommer le stock sans jamais le réparer d'office.** « Tarir n'est pas réparer » : le compter en lecture seule, l'écrire dans le
  journal du commit, et laisser la décision à Grégoire.
- **Ranger les questions dans un fichier** plutôt que de les poser dans la conversation quand il n'a pas l'attention pour elles.
- **Dire quand une de ses propres hypothèses est réfutée par la mesure.** Deux fois le 13 : un risque d'accordéon masqué et un risque
  d'appel trop précoce, tous deux inexistants. Le dire coûte une ligne et vaut mieux qu'un silence.
