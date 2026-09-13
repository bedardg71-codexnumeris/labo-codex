# Consigne de démarrage – la session Cowork qui prend le relais

> **Réécrite le dimanche 13 septembre 2026, 18 h 30 (Toronto)**, à la fermeture d'une journée de **onze versions** (`1.139.1` à
> `1.140.6`) et **dix lots, tous en ligne**. Elle REMPLACE toute version précédente ; celle de 18 h est archivée sous
> `plans de travail/_ancienne-CONSIGNE-DEMARRAGE-COWORK-2026-09-13-18h.md`.
>
> ⚠ **Ce fichier porte un nom sans date, exprès.** La date d'écriture est en tête ; c'est elle qui fait foi.
> ⛔ **Il ne porte que ce qui PÉRIME** : l'état mesuré, le mandat, ce qui est dû, et les erreurs déjà payées.

---

## 1 · CE QUE TU ES, ET CE QUE TU N'ES PAS

**Le dispositif est à trois, et les canaux ne se croisent pas.** Grégoire décide, relaie, et fait tourner l'application sur ses
vraies données. **Toi, Cowork** : tu **mesures** le dépôt, tu **rédiges** les consignes de lot, tu **relis** ce qui ne se reprend
pas, tu publies les artefacts des portes et tu tiens ses fichiers de cadrage.

⛔ **TU NE PARLES PAS À CLAUDE CODE.** Une consigne va dans un FICHIER (`plans de travail/CONSIGNE-DU-JOUR.md`, l'ancienne archivée
`_ancienne-CONSIGNE-DU-JOUR-<date>-<sujet>.md`) **et** dans le message, dans un **bloc de code** – jamais dans un artefact, jamais
avec des retours à la ligne manuels.

⚠⚠ **TU NE VOIS PAS LE CANAL ENTRE GRÉGOIRE ET CLAUDE CODE.** Arrivé **cinq fois** le 13 : un lot mesuré « pas engagé » était livré
quatre minutes plus tard ; 1.140.3 était en ligne pendant qu'on la croyait locale ; le lot #551 attendait son commit et l'avait
déjà ; le sommet de la branche #520 a changé de SHA après mon verdict ; et **à 17 h j'ai annoncé « le push est fait » sur une
prémisse qui disait le contraire – j'avais raison sur 1.140.6, mais Claude Code parlait d'un AUTRE push, celui du lot en vol.**
⮕ **Devant un écart, remesure, puis demande-toi de QUEL objet chacun parle. La première hypothèse est « ça a avancé », la seconde
est « ce n'est pas la même chose », et « le relais a échoué » vient en dernier.** Un verdict se rend sur un SHA : redis lequel.

⚠ **TU N'ÉCRIS PAS DANS `js/`, ni dans `BACKLOG.md`** – tu en proposes le texte, Claude Code l'écrit. `PROTOCOLE.md`,
`CONSIGNE-DEMARRAGE-COWORK.md` et `plans de travail/` sont à TOI : tu les écris, il les commite.
⚠ **`git --no-optional-locks status`**, jamais `git status` nu.
⚠ **L'horloge du montage est en UTC** : toute heure s'écrit après `TZ=America/Toronto date`, dans la même commande que l'écriture.

---

## 2 · ⚠⚠ CE QUI A CHANGÉ LE 13 AU SOIR : TU PEUX LANCER LA SUITE

**La version précédente de ce fichier affirmait le contraire, et elle avait tort.** Le §5 disait que les dépendances de `tests/`
sont installées pour macOS et que rollup ne charge pas son binding natif depuis ton environnement. **C'est vrai du
`tests/node_modules` du Mac, et c'est tout** : une installation à neuf, côté Linux, fonctionne. Mesuré le 13 à 17 h 35.

### La recette, en trois commandes

1. `git clone --shared --quiet --branch main "$HOME/mnt/Monitorage_v6" "$HOME/banc"` – 400 Ko, instantané.
2. `cd "$HOME/banc/tests" && npm install --silent --no-audit --no-fund` – ~40 s, dépendances Linux.
3. `cd "$HOME/banc/tests" && timeout 165 npx vitest run --reporter=dot` – **36 s, 559 fichiers, 6 337 essais.**

⛔ **Lecture seule sur le dépôt de Grégoire** : aucun `gc`, `prune`, `push`. ⛔ **N'utilise PAS `git worktree`** : l'entrée reste
fantôme dans son `.git`. ⚠ **Efface ton banc à la fin** (`rm -rf "$HOME/banc"`).
⚠ **Un `npx vitest` lancé en arrière-plan MEURT à la fin de l'appel** : chaque `device_bash` est un shell neuf. Lance en synchrone.
⚠ **La suite complète rend 7 essais ROUGES dans un banc sans `.git`** (sentinelles anti-cache, pre-push, `.gitignore`, icônes
suivies par git). Dans le clone partagé, les mêmes fichiers sont **verts**. ⮕ **Toujours le clone, jamais `git archive`.**

### Ce que ça change à ton verdict, et ce que ça ne change pas

⮕ **« Vert par lecture et remesure, break-tests non reposés » n'a plus lieu d'être.** Tu peux écrire **« vert par exécution »**,
et tu DOIS alors reposer les mutations toi-même : un journal de mutations n'est pas une preuve ; le rouge que tu obtiens
toi-même en est une. Le patron qui a marché le 13 : poser la mutation par `python3`, **vérifier qu'elle est posée avant de lire**,
lancer les bancs visés seuls (2 s), restaurer par `git checkout --`, et finir par un témoin vert.

⛔ **Ce que ça ne change PAS : le verdict Playwright reste hors de ta portée** – il se prend **Cowork fermé**, et tu ne peux pas te
fermer toi-même. C'est Claude Code qui le lance, et Grégoire qui ferme.

---

## 3 · L'ÉTAT MESURÉ – le 13 septembre 2026, 23 h (Toronto)

**Remesure, ne recopie pas** : `cat version.json` · `git --no-optional-locks log --oneline -3 main` ·
`git --no-optional-locks log --oneline -1 origin/main` · `git --no-optional-locks status --porcelain` ·
`grep -cE '^- \[ \] ' BACKLOG.md` · `TZ=America/Toronto date`.

- **`main` = `origin/main` = `b108723f`. TOUT EST POUSSÉ. Version `1.140.6` / `0913-1642`, EN LIGNE.**
- **Dix lots depuis le tri du 13, tous en ligne.** Onze versions livrées, de `1.139.1` à `1.140.6`.
- ⚠ **QUI POUSSE : Claude Code, par `scripts/pousser.sh`, à la demande de Grégoire. Pas toi.** Ton shell n'atteint pas le
  dépôt en SSH. ⛔ **Ne conclus pas de ce que TON environnement ne peut pas faire à ce que le RÔLE ne peut pas faire** —
  tu t'es trompé deux fois là-dessus le 13, sur le push et sur l'exécution des bancs.
- **224 fiches ouvertes.** `grep -cE '^- \[ \] ' BACKLOG.md` rend **225** cases ; **224 portent un numéro**, la 225e est le
  gabarit de la section « Notes ». ⚠ **Sept comptes annoncés dans la journée — 234, 241, 230, 228, 227, 226, 224 — et pas un
  n'a changé une décision.** Refais la soustraction, ne la recopie pas, et ne t'en sers pas pour mesurer l'avancement.
- **Vérifie la ligne « Dernier ID » en tête de `BACKLOG.md`** : c'est la SEULE qui fait foi.
- ⚠ **DEUX SESSIONS COWORK ONT TRAVAILLÉ EN PARALLÈLE le 13 au soir**, sur le tri et sur les relectures. Vérifie qui a écrit
  en dernier avant de reprendre un fichier de cadrage — `git log -1 --format='%h %ad %s' -- <fichier>`.
- **Trois fichiers de cadrage attendent d'être commités** : `PROTOCOLE.md` (section neuve « Le cycle d'un lot », plus deux
  corrections), `CONSIGNE-DEMARRAGE-COWORK.md` (celui-ci), `plans de travail/CONSIGNE-DU-JOUR.md` (lot des échelles, livré).

---

## 4 · CE QUI EST DÛ – dans l'ordre

**a) À l'ouverture (règle 6)** : remesurer, et **regarder si l'arbre est sale** — une session de code peut être en vol, et une
autre session Cowork peut avoir écrit avant toi.

**b) LES DEUX DÉPLACEMENTS DE DOCUMENTATION**, arrêtés avec Grégoire le 13 au soir et **amendés par la contre-vérification de
Claude Code** : les règles 7 et 8 partent vers le skill `fin-de-session-labo-codex` ; **la règle 10 NE PART PAS** tant que
`verification-adverse` ne s'est pas chargé seul au moins une fois. Le détail est dans le bloc du 13 à 23 h.

**c) LE CHANTIER DES ÉCHELLES EST CLOS** : #658 et #659 livrés et poussés (`f17bfa27`). Ne les rouvre pas.

**d) IL N'Y A PLUS DE LOT QUI NE PASSE PAS PAR GRÉGOIRE.** Mesuré trois fois le 13. ⮕ **Ne sonde pas le backlog fichier par
fichier pour en trouver un** : ça coûte un tour pour la même réponse.

**e) LES DEUX DATES, MAINTENANT IMMÉDIATES** : **lundi 14**, l'orthopédagogue ouvre l'application sur son poste. **Mardi 15**,
la communauté de pratique découvre l'accueil neuf. ⮕ **Un retour d'elle ou d'un collègue passe AVANT le backlog, sans
discussion.** 1.140.6 est en ligne : tout ce qui avait une date est livré.

**f) Ce qui attend son mois d'usage, et ne se rouvre pas** : #836, #838, #839, #840, les fiches « après le 14 », **#742**,
**#586** (arbitrage du 28 août : les cinq familles ensemble), et le STOCK de #659 — ce qui est déjà écrit dans sa base se
mesure et se propose, ne s'écrit pas.

**g) Tenir le tri à jour** – le markdown ET l'artefact jumeau, comptes repris sur `main`. ⚠ **Un seul des deux Cowork à la
fois**, sinon la page et le markdown divergent, ce qui est arrivé le 13 au soir.

---

## 5 · LES ERREURS QUE J'AI PAYÉES LE 13 – ne les refais pas

0. ⚠⚠⚠ **J'AI PRIS LA LIMITE DE MON INSTRUMENT POUR UNE LIMITE DU MONDE — TROIS FOIS LE MÊME JOUR.**
   (a) Mon `grep` ne voyait pas ce qui tient sur deux lignes : 112 découpes comptées, **167** réelles.
   (b) Mon shell n'atteint pas le dépôt en SSH, et j'ai écrit que **personne** n'avait la clé : Claude Code pousse depuis le Mac.
   (c) Les bancs ne s'exécutent pas chez moi, et j'ai écrit que **Cowork** ne peut pas lancer la suite : une autre session Cowork
   a rendu un verdict par exécution le soir même.
   ⮕ **Écris ce que TU as mesuré, avec l'outil que tu as employé. Ne généralise jamais de ton environnement à ton rôle.**

**Les quatre premières sont la MÊME erreur** : *j'ai compté sans dire par quelle transformation je lisais.*

1. ⚠⚠⚠ **MON `grep` NE VOIT PAS CE QUI TIENT SUR DEUX LIGNES.** Le matin : 5 balises comptées, **6** réelles. L'après-midi : 112
   découpes comptées, **167** réelles — et les deux seules assertions mortes étaient parmi les 55 invisibles.
   ⮕ **Un `grep -rn` lit LIGNE À LIGNE.** Pour un motif qui peut s'écrire sur deux lignes, lis le CONTENU ENTIER (`python3` avec
   `re.S`, ou `grep -Pzo`), **et dis dans ta mesure laquelle des deux tu as employée.**
2. ⚠⚠ **MON BALAYAGE NE DISTINGUAIT PAS LE COMMENTAIRE DU CODE.** Le soir : j'ai signalé une règle CSS `.outils-rangee` orpheline.
   **Elle n'existe pas** — l'unique occurrence est dans un commentaire qui explique pourquoi elle est partie. Claude Code l'a relevé.
   ⮕ **Avant d'affirmer qu'un symbole survit, retire les commentaires et recompte** (`re.sub(r'/\*.*?\*/','',t,flags=re.S)`).
3. **MON FILTRE SUR LA FORME D'UN NUMÉRO EN RATAIT DEUX** (#521 et #523, barrés). ⮕ **Compte les lignes, pas les formes.**
4. **J'AI RECOPIÉ UN COMPTE AU LIEU DE REFAIRE LA SOUSTRACTION.** ⮕ **Quand l'arithmétique ne retombe pas, ce n'est pas
   l'arithmétique.** C'est un écart d'une unité qui m'a fait voir que j'avais fermé #551 à tort.
5. ⚠⚠ **J'AI CHERCHÉ UN BANC PAR SON NOM DE FICHIER AU LIEU DE SON CONTENU.** ⮕ **`grep -rln` sur le SYMBOLE, jamais `ls | grep`
   sur le numéro.** (Le soir, la même situation s'est bien passée : les six fonctions du banc supprimé ont été cherchées par leur
   nom dans 1 031 fichiers, contenu entier. C'est le bon geste.)
6. ⚠⚠ **J'AI GÉNÉRALISÉ DEPUIS UN ÉCHANTILLON** — « les huit sont des souches » ; sept l'étaient.
   ⮕ **Quand tu écris « les N sont tous X », vérifie les N.**
7. ⚠⚠ **J'AI FAIT INSCRIRE UN DOUBLON** (#857 = #553). ⮕ **Avant d'inscrire une trouvaille, `grep` le backlog sur ses mots-clés.**
8. **J'AI ÉCRIT UN PÉRIMÈTRE SANS MESURER CE QU'IL DÉSIGNAIT** (#801 : une modale, pas une carte).
   ⮕ **Un périmètre nomme du code qu'on a lu, pas un écran qu'on imagine.**

### Ce qui a tenu, et qu'il faut refaire
- **Mesurer avant de cadrer.** Sur les lots du 13, **la mesure a démenti la fiche à chaque fois** — cinq identifiants annoncés
  contre huit, trente assertions contre quarante-huit, une carte qui était une fenêtre, une fiche (#659) dont le correctif
  n'avait plus d'objet. **C'est le rendement du dispositif.**
- **Deux méthodes, pas deux lectures.** Claude Code a trouvé mon erreur de comptage en mesurant **à l'exécution** au lieu de
  relire le texte. Le soir, l'inverse : l'hébergeur a tranché ce que git ne pouvait pas dire.
  ⮕ **Quand ta contre-vérification confirme, dis par quel chemin — sinon tu n'as fait que relire.**
- **Dire quand une de ses propres hypothèses est réfutée.** Fait une dizaine de fois le 13. Chaque fois : une ligne, et un lot évité.
- **Dire de quelle NATURE est ton verdict** (voir §2) : « par exécution », « par lecture », « par un tiers ».

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
- **Pour le choix des lots, prends ceux qui ne lui demandent ni arbitrage ni écran à vérifier.** Le 13, il travaillait en parallèle
  sur autre chose. ⚠ Mais voir §4b : ce vivier est épuisé, et c'est le terrain qui rouvrira le robinet.
- ⚠ **Il corrige bien, et souvent contre toi.** Quand il propose un mot, cherche d'abord ce qui le rend juste.

### Ce qui remonte jusqu'à lui, et rien d'autre
La **didactique** · ses **données réelles** · les **mots que ses élèves et ses collègues lisent** · ce qui **l'engage publiquement**.
⮕ **Tout le reste, tu le tranches seul et tu le dis en une ligne, en nommant ce que tu as supposé.**

⚠ **Une chose qu'il est SEUL à pouvoir faire, et ce n'est pas un arbitrage : fermer Cowork** avant le verdict Playwright.
Demande-le en une phrase, et donne-lui le bloc de relais AVANT qu'il ferme – après, tu n'es plus là.

---

## 7 · CE QUI ATTEND UN MOMENT CALME

**Deux stocks, et ni l'un ni l'autre ne se répare d'office** — ce sont ses données réelles.
1. **#520** : l'ablation a tari une écriture qui aplatissait la clé nue `configEchelle` à chaque chargement d'échelle.
2. **#659** : depuis #658, **plus aucun lecteur ni écrivain** des clés nues `niveauxEchelle` et `configEchelle`. Elles sont
   **inertes** chez qui les a, et elles voyagent dans toute sauvegarde Codex (`codex.js` exporte toutes les clés).

⮕ **La source est tarie ; le stock ne l'est pas.** Ça se mesure et ça se propose. Ne le rouvre pas avant qu'il en parle.
