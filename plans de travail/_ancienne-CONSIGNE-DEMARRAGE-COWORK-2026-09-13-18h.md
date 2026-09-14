# Consigne de démarrage – la session Cowork qui prend le relais

> **Réécrite le dimanche 13 septembre 2026, 18 h (Toronto)**, à la clôture d'une journée de **onze versions** (`1.139.1` à
> `1.140.6`), **neuf lots** dont sept en ligne, et une méthode enfin écrite. Elle REMPLACE toute version précédente ; celle de
> 15 h 35 est archivée sous `plans de travail/_ancienne-CONSIGNE-DEMARRAGE-COWORK-2026-09-13-15h35.md`.
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
2. **`PROTOCOLE.md`** – **commence par sa section « Le cycle d'un lot »** : c'est notre méthode, du backlog au push, écrite le
   13 septembre. Puis les règles, dont la 6 (ouverture) et la 8 (verdict Playwright, **Cowork fermé** : **c'est GRÉGOIRE qui
   ferme**, pas toi – tu ne peux pas te fermer toi-même ; Claude Code lance).
3. **`plans de travail/TRI-2026-09-13-fiches-ouvertes-par-cout.md`** – le tri, et son **jumeau publié** (artefact « Tri du chantier
   Labo Codex », `06cc946c-fb10-4e1c-aa3c-5409dceb0f55`). **Tenir les deux à jour après chaque lot.**
4. **`plans de travail/CONSIGNE-DU-JOUR.md`** – le lot en cours (§ 4). Son archive du jour est dans le même dossier.
5. **`BACKLOG.md`**, l'en-tête et les fiches nommées au § 4 seulement.

⛔ **Ne lis PAS les 150 autres fichiers de `plans de travail/`.** ⛔ Jamais de `Read` par défaut sur `BACKLOG.md`, `SESSION.md`
ou `RELAIS.md` : des centaines de milliers d'octets. En-tête, puis cibler.

---

## 3 · L'ÉTAT MESURÉ – le 13 septembre 2026, 18 h (Toronto)

**Remesure, ne recopie pas** : `cat version.json` · `git --no-optional-locks log --oneline -3 main` ·
`git --no-optional-locks log --oneline -1 origin/main` · `git --no-optional-locks status --porcelain` ·
`grep -cE '^- \[ \] ' BACKLOG.md` · `TZ=America/Toronto date`.

- **`main` = `d7e88b5c`, CINQ commits au-dessus d'`origin/main`, qui est resté à `1.140.5`.**
- **`version.json` porte `1.140.6` / `0913-1642`. Cette version N'EST PAS EN LIGNE.**
- ⛔ **LE PUSH N'EST PAS DANS NOS MAINS.** Le dépôt est en SSH (`git@github.com:…`) et ni Cowork ni Claude Code n'a la clé —
  mesuré le 13 : « Host key verification failed ». **Claude Code commite, Grégoire pousse.** La ligne des trois rôles de
  `PROTOCOLE.md` qui dit que Claude Code « pousse » est inexacte, et le sait.
- **Un lot est EN COURS d'écriture** au moment où ceci s'écrit : la grappe `js/echelles.js` (#658, #659). Arbre sale
  (`index.html`, `js/echelles.js`, `styles.css`, bancs). **Ne le relis pas avant que Claude Code l'ait rapporté.**
- **Ma section neuve de `PROTOCOLE.md` — « Le cycle d'un lot » — n'est PAS commitée.** C'est un fichier de cadrage, donc à moi
  de l'écrire et à Claude Code de la commiter.
- **226 fiches ouvertes.** `grep -cE '^- \[ \] ' BACKLOG.md` donne **227**, moins le gabarit de la section « Notes ».
  ⚠ Le compte a été révisé **cinq fois** — 234, 241, 230, 228, 227 — **sans qu'une seule révision change une décision.**
  Écris-le avec sa commande, et ne t'en sers pas pour mesurer l'avancement.
- **29 de ces fiches portent le verrou « après le 14 »**, posé par Grégoire lui-même.
- **Dernier ID utilisé : #859.** Vérifie la ligne « Dernier ID » en tête de `BACKLOG.md` : c'est la SEULE qui fait foi.
- **Neuf lots depuis le tri du 13.** Sept en ligne ; deux commités non poussés (#858, #801 en 1.140.6).

---

## 4 · CE QUI EST DÛ – dans l'ordre

**a) À l'ouverture (règle 6)** : remesurer, et **regarder si l'arbre est sale** — une session de code peut être en vol.

**b) LE PUSH EST LE PREMIER POINT, ET IL EST À GRÉGOIRE.** Cinq commits attendent, dont une release prête. Tant qu'il n'a pas
poussé, **rien de la journée du 13 après 1.140.5 n'existe pour ses testeurs**, et l'artefact de tri le dit en tête. Rappelle-le
une fois, en une ligne, sans y revenir.

**c) LE LOT DES ÉCHELLES, quand Claude Code le rapportera.** Sa consigne est dans `plans de travail/CONSIGNE-DU-JOUR.md`.
⚠ **Son diff en cours SUPPRIME un banc** (`tests/unit/sentinelle-522-lot2a-niveaux-echelle-serialises.test.js`). C'est le geste
le plus risqué d'un lot : **exige qu'il NOMME le banc qui reprend la couverture, fichier et ligne, et vérifie que ce
remplaçant ne porte pas lui-même sur une tranche.** Le 13, dans le même cas, j'avais d'abord cherché dans le mauvais fichier :
le remplaçant existait, c'est moi qui m'étais trompé. Cherche par le CONTENU (`grep -rln` sur le symbole), pas par le nom du
fichier.

**d) APRÈS LES ÉCHELLES, IL N'Y A PLUS RIEN QUI NE PASSE PAS PAR LUI.** Mesuré le 13 : la grappe `js/echelles.js` portait six
fiches, une seule était un lot de code. Ce qui reste demande son arbitrage, ses données réelles, ou un écran à vérifier.
⮕ **Ne sonde pas le backlog fichier par fichier pour en trouver un autre** : ça coûte un tour pour la même réponse.

**e) LES DEUX DATES, MAINTENANT IMMÉDIATES** : **lundi 14**, l'orthopédagogue ouvre l'application sur son poste. **Mardi 15**, la
communauté de pratique découvre l'accueil neuf. ⮕ **Un retour d'elle ou d'un collègue passe AVANT le backlog, sans discussion.**
⚠ Et ils verront `origin/main`, pas `main` : **si le push n'est pas fait, ils verront 1.140.5.**

**f) Ce qui attend son mois d'usage, et ne se rouvre pas** : #836, #838, #839, #840, les 29 fiches « après le 14 », **#742**
(bornes d'alerte), **#586** (arbitrage du 28 août : les cinq familles ensemble, pas les échelles seules), et le STOCK de #659
(ce qui est déjà écrit dans sa base — on mesure, on propose, on n'écrit pas).

**g) Tenir le tri à jour** – le markdown ET l'artefact jumeau, comptes repris sur `main`.
---

## 5 · LES ERREURS QUE J'AI PAYÉES LE 13 – ne les refais pas

1. ⚠⚠⚠ **LA MÊME ERREUR DEUX FOIS DANS LA JOURNÉE : MON `grep` NE VOIT PAS CE QUI TIENT SUR DEUX LIGNES.**
   Le matin, j'ai compté 5 balises à double `class` sur 17 ; la sentinelle en comptait **6 sur 19**. L'après-midi, j'ai compté
   112 découpes fautives dans `tests/` ; il y en avait **167**, et **les deux seules assertions réellement mortes étaient parmi
   les 55 que ma commande ne voyait pas.** Même cause, même jour, deux fois.
   ⮕ **Un `grep -rn` lit LIGNE À LIGNE. Pour compter un motif qui peut s'écrire sur deux lignes, lis le CONTENU ENTIER**
   (`python3` avec `re.S`, ou `grep -Pzo`), et dis dans ta mesure laquelle des deux tu as employée.
   ⮕ **Et surtout : une mesure fausse est pire qu'une mesure absente. Elle rassure.**
2. ⚠⚠ **J'AI GÉNÉRALISÉ DEPUIS UN ÉCHANTILLON.** J'ai lu un bloc de huit `<div>` vides et écrit que **les huit** identifiants
   dupliqués étaient des souches. **Sept l'étaient.** ⮕ **Quand tu écris « les N sont tous X », vérifie les N.**
3. ⚠⚠ **J'AI CHERCHÉ UN BANC PAR SON NOM DE FICHIER AU LIEU DE SON CONTENU.** Claude Code avait supprimé un essai en disant que
   « la sentinelle d'ablation de #418 » tenait la couverture ; j'ai regardé dans `sentinelle-418-*.test.js` et conclu trop vite
   que rien ne couvrait. Le vrai banc était `sentinelle-ablation-vue-lecon-filtrage.test.js`, né dans le commit de #418.
   ⮕ **`grep -rln` sur le symbole, jamais `ls | grep` sur le numéro.**
4. **J'AI RECOPIÉ UN COMPTE AU LIEU DE REFAIRE LA SOUSTRACTION.** Deux fois : 230 → 229 → 228 le matin, puis une page de tri qui
   ne retombait plus sur le backlog le soir — et c'est cet écart d'une unité qui m'a fait voir que j'avais fermé une fiche à
   tort (#551, dont seule une partie était livrée). ⮕ **Quand l'arithmétique ne retombe pas, ce n'est pas l'arithmétique.**
5. ⚠⚠ **J'AI FAIT INSCRIRE UN DOUBLON** (#857 = #553). ⮕ **Avant d'inscrire une trouvaille, `grep` le backlog sur ses mots-clés.**
6. **J'AI ÉCRIT UN PÉRIMÈTRE SANS MESURER CE QU'IL DÉSIGNAIT.** Pour #801 j'ai écrit « un bouton qui MÈNE à la carte, défilement
   et focus ». C'est une **modale**, et la carte ne fait que l'ouvrir : il n'y avait ni défilement ni focus à écrire.
   ⮕ **Un périmètre nomme du code qu'on a lu, pas un écran qu'on imagine.**
7. **UNE INTERDICTION DE CONSIGNE VAUT POUR SON LOT.** Quand une consigne renverse la précédente, écris-le en tête, en la citant.

### Ce qui a tenu, et qu'il faut refaire
- **Mesurer avant de cadrer.** Sur les trois lots du 13, **la mesure a démenti la fiche trois fois sur trois** — cinq identifiants
  annoncés contre huit, trente assertions annoncées contre quarante-huit, une carte annoncée qui était une fenêtre.
  **C'est le rendement du dispositif. C'est ce qui justifie le temps que prend le §1 du cycle.**
- **Deux méthodes, pas deux lectures.** Claude Code a trouvé mon erreur de comptage parce qu'il a mesuré **à l'exécution** au lieu
  de relire le texte. ⮕ **Quand ta contre-vérification confirme, dis par quel chemin — sinon tu n'as fait que relire.**
- **Reposer les mutations soi-même.** Un journal de mutations n'est pas une preuve ; le rouge que tu obtiens toi-même en est une.
- **Dire de quelle NATURE est ton verdict.** Tu ne peux pas lancer la suite : les dépendances de `tests/` sont installées pour
  macOS et rollup ne charge pas son binding natif depuis ton environnement (mesuré le 13). ⮕ **« Vert par lecture et remesure,
  break-tests non reposés » — jamais « vert » tout court.**
- **Dire quand une de ses propres hypothèses est réfutée.** Fait huit fois le 13. Chaque fois : une ligne, et un lot évité.
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
