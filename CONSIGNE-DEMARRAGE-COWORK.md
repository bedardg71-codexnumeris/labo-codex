# Consigne de démarrage – la session Cowork qui prend le relais

> **Réécrite le lundi 14 septembre 2026, 18 h 50 (Toronto)**, au bout d'une journée de **cinq versions** (`1.140.7` à `1.140.11`).
> Elle REMPLACE toute version précédente ; celle du 14 à 16 h 20 est archivée sous
> `plans de travail/_ancienne-CONSIGNE-DEMARRAGE-COWORK-2026-09-14-16h20.md`.
>
> ⚠ **Ce fichier porte un nom sans date, exprès.** La date d'écriture est en tête ; c'est elle qui fait foi.
> ⛔ **Il ne porte que ce qui PÉRIME** : l'état mesuré, le mandat, ce qui est dû, et les erreurs déjà payées.

---

## 1 · CE QUE TU ES, ET CE QUE TU N'ES PAS

**Le dispositif est à trois, et les canaux ne se croisent pas.** Grégoire décide, relaie, et fait tourner l'application sur ses
vraies données. **Toi, Cowork** : tu **mesures** le dépôt, tu **rédiges** les consignes de lot, tu **relis** ce qui ne se reprend
pas, tu **publies les artefacts des portes** et tu tiens ses fichiers de cadrage.

⛔ **TU NE PARLES PAS À CLAUDE CODE.** Une consigne va dans un FICHIER (`plans de travail/CONSIGNE-DU-JOUR.md`, l'ancienne archivée
`_ancienne-CONSIGNE-DU-JOUR-<date>-<sujet>.md`) **et** dans le message, dans un **bloc de code** – jamais dans un artefact, jamais
avec des retours à la ligne manuels.

⚠⚠ **TU NE VOIS PAS LE CANAL ENTRE GRÉGOIRE ET CLAUDE CODE, ET TU NE VOIS PAS NON PLUS TOUT LE DÉPÔT.**
⮕ **NOUVEAU, LE 13 AU SOIR, ET C'EST LE PIÈGE LE PLUS COÛTEUX DE LA SEMAINE : Claude Code travaille parfois dans un WORKTREE, sur une
branche non fusionnée. Un fichier qu'il a écrit ET COMMITÉ là n'existe pas dans l'arbre principal – donc pas pour toi.** La porte
terrain de #478 a été annoncée par son chemin ; `ls` ne la trouvait pas, et les deux avaient raison. ⮕ **Devant un fichier annoncé
et absent, l'ordre des hypothèses est : (1) il est en train de l'écrire, (2) il l'a écrit sur une branche ou dans un autre dossier,
(3) le relais a échoué.** Dis-le dans cet ordre-là plutôt que de conclure.
⮕ Le reste tient toujours, et c'est arrivé cinq fois le 13 : devant un écart, remesure, puis demande-toi de QUEL objet chacun parle.
Un verdict se rend sur un SHA : redis lequel.

⚠ **TU N'ÉCRIS PAS DANS `js/`, ni dans `BACKLOG.md`** – tu en proposes le texte, Claude Code l'écrit. `PROTOCOLE.md`,
`CONSIGNE-DEMARRAGE-COWORK.md` et `plans de travail/` sont à TOI : tu les écris, il les commite.
⚠ **`git --no-optional-locks status`**, jamais `git status` nu.
⚠ **L'horloge du montage est en UTC** : toute heure s'écrit après `TZ=America/Toronto date`, dans la même commande que l'écriture.
Le 13 au soir, un état « 23 h » annonçait en fait 19 h.

---

## 2 · TU PEUX LANCER LA SUITE DE TESTS

**Mesuré le 13 à 17 h 35, et refait depuis.** Le `tests/node_modules` du Mac est installé pour macOS ; une installation à neuf, côté
Linux, fonctionne.

1. `git clone --shared --quiet --branch main "$HOME/mnt/Monitorage_v6" "$HOME/banc"` – 400 Ko, instantané.
2. `cd "$HOME/banc/tests" && npm install --silent --no-audit --no-fund` – ~40 s.
3. `cd "$HOME/banc/tests" && timeout 165 npx vitest run --reporter=dot` – **36 s, 559 fichiers, 6 337 essais.**

⛔ **Lecture seule sur le dépôt de Grégoire** : aucun `gc`, `prune`, `push`. ⛔ **N'utilise PAS `git worktree`** : l'entrée reste
fantôme dans son `.git`. ⚠ **Efface ton banc à la fin** (`rm -rf "$HOME/banc"`).
⚠ Un `npx vitest` lancé en arrière-plan MEURT à la fin de l'appel : chaque `device_bash` est un shell neuf. Lance en synchrone.
⚠ La suite rend 7 essais ROUGES dans un banc sans `.git`. ⮕ **Toujours le clone, jamais `git archive`.**

⮕ Tu peux donc écrire **« vert par exécution »**, et tu DOIS alors reposer les mutations toi-même. Poser la mutation par `python3`,
**vérifier qu'elle est posée avant de lire**, lancer les bancs visés seuls, restaurer par `git checkout --`, finir par un témoin vert.
⛔ **Le verdict Playwright reste hors de ta portée** : il se prend Cowork fermé, et tu ne peux pas te fermer toi-même.

⮕ **ET TU ÉPROUVES TES PROPRES ARTEFACTS AVANT DE PUBLIER.** Le conteneur a Chromium (`/opt/pw-browsers/chromium-1194/chrome-linux/chrome` (⚠ le dossier porte un numéro de build, vérifié le 14 sept. : `ls -d /opt/pw-browsers/chromium*/` avant de lancer),
avec `npm install playwright-core` dans le scratchpad). Le 13, le bouton « Copier mes résultats » d'une porte terrain était cassé
– la note écrite en cas d'échec n'entrait pas dans le relevé – et **seul le passage au navigateur l'a montré.** C'est le trou que
ce bouton existe pour boucher.

---

## 3 · L'ÉTAT MESURÉ – le 14 septembre 2026, 18 h 46 (Toronto)

**Remesure, ne recopie pas** : `cat version.json` · `git --no-optional-locks log --oneline -3 main` ·
`git --no-optional-locks log --oneline -1 origin/main` · `git --no-optional-locks status --porcelain` · `TZ=America/Toronto date`.

- **En ligne : `1.140.10`** (`origin/main` = `66113966`). ⚠⚠ **DEUX COMMITS ATTENDENT LE PUSH** : `f48170d7` (#863) puis
  `2122f6dd` (#864), tous deux sous l'étiquette `1.140.11` / build `0914-1843`. Grégoire a choisi de pousser par
  `scripts/pousser.sh`, Cowork fermé, le 14 en fin de journée. **Si `origin/main` est encore à `66113966` à ton ouverture,
  le push n'a pas eu lieu : demande-le avant toute autre chose.**
- **Cinq lots livrés le 14** : le graphique des indices sans paliers (1.140.7), le parcours de rentrée d'un trait (1.140.8),
  les pseudonymes dans la liste du Cadre (1.140.9), les treize doubles `class` d'`index.html` (1.140.10), et le retrait du
  verrouillage des cartouches (1.140.11, en attente).
- **225 fiches ouvertes**, remesuré le 14 à 18 h 46. ⚠⚠ **NE COMPTE PAS AVEC `^- \[ \] \*\*#`** : 72 fiches commencent par
  un emoji de catégorie avant le gras. Compte les lignes `- [ ] ` à la racine (226) et retire celle qui ne porte aucun
  `#nnn` : c'est le gabarit de la section « Notes ». **Dernier ID : #864.**
- ⚠ **Vérifie la ligne « Dernier ID » en tête de `BACKLOG.md`** : c'est la SEULE qui fait foi.
- **QUI POUSSE : Claude Code, par `scripts/pousser.sh`, à la demande de Grégoire. Pas toi.** ⛔ Ne conclus pas de ce que TON
  environnement ne peut pas faire à ce que le RÔLE ne peut pas faire.

## 4 · CE QUI EST DÛ – dans l'ordre

**a) À l'ouverture** : remesurer, et **regarder si le push a eu lieu** (§ 3).

**b) LA COMMUNAUTÉ DE PRATIQUE A VU L'APPLICATION LE 14 AU MATIN – présentée, pas utilisée.** Personne n'a encore ouvert
l'outil sur ses propres données, et **les retours arriveront dans la semaine**. Un retour d'un membre passe AVANT le
backlog, sans discussion. L'orthopédagogue a ouvert l'application le 14 ; son retour a la même priorité.

**c) UNE SEULE RANGÉE RESTE À LA PORTE DE #787** : la marge sous « Enregistrer / ↺ » dans le panneau **Paramètres** de
Évaluation › Annoter et évaluer. Elle se vérifie sur la **1.140.10 déjà en ligne**. La rangée du bouton « Déverrouiller »
est **sans objet** depuis #864. Artefact : « Les espacements de 1.140.10 ».

**d) ⚠ UNE TROUVAILLE MESURÉE ET NON ENCORE INSCRITE – ne la perds pas.** #787 a éteint la dette des doubles attributs
`class` dans `index.html`, **mais elle continue dans les gabarits HTML écrits en JavaScript : sept balises**, mesurées le 14
au soir – deux dans `js/cartouches.js` (dont l'une est partie avec #864, **remesure**), une dans `js/grilles.js`, trois dans
`js/productions.js`, une dans `js/profil-etudiant-sections-affichage.js`. Les trois classes perdues (`u-mr-10`, `u-mt-10`,
`hover-opaque`) sont toutes définies. **Le cliquet de #787 ne balaie qu'`index.html`.** ⮕ Inscrire et continuer ; ce n'est
pas urgent.

**e) #860 ATTEND UNE DÉCISION DE GRÉGOIRE, et ne se code pas avant.** Deux graphiques de groupe – le faisceau de l'indice P
et les trajectoires en mode « note finale » – dessinent encore les paliers d'une échelle sous des pourcentages agrégés.
**La décision du 13 sur le graphique individuel ne s'y étend pas d'office.** Pose-lui la question avec une recommandation.

**f) #862 ATTEND SES MOTS.** La forme est tranchée : un encadré court dans l'Aide plus un lien vers
`https://codexnumeris.org/labo-codex-ou-vivent-vos-donnees` (publiée le 14, lisible sans compte, vérifié). **Ancre
mesurée** : Aide › carte « Qu'est-ce que Labo Codex ? », au paragraphe « Où vont tes données ? ». ⚠ Les mots reviennent à
Grégoire : **propose un texte à corriger**. L'Aide tutoie, la page publique vouvoie.

**g) Ce qui reste de #478, et qui n'est PAS un quick-win** : la création d'un trimestre passe encore par des `prompt()`
natifs, l'aide du groupe-cours est un `alert()`, et le compte « X/5 configurés » est écrit en dur (porté par #836 et #475).

**h) Ce qui attend son mois d'usage, et ne se rouvre pas** : #836, #838, #839, #840, **#742**, **#586**, et le STOCK de #659.

**i) Tenir le tri à jour** – le markdown `plans de travail/TRI-2026-09-13-fiches-ouvertes-par-cout.md` ET l'artefact jumeau
« Tri du chantier Labo Codex ». ⚠ **Un seul des deux Cowork à la fois**, sinon la page et le markdown divergent.

**j) `verification-adverse` NE S'EST PAS CHARGÉ SEUL** au rituel de clôture du 13. La règle 10 reste dans `PROTOCOLE.md` :
deux « oui » consécutifs pour l'en sortir, et le compteur est à zéro.

## 5 · LES ERREURS QUE J'AI PAYÉES – ne les refais pas

0. ⚠⚠⚠ **MON MOTIF NE VOIT PAS LES SYNONYMES. CINQ FOIS EN TROIS JOURS.**
   5 balises comptées, 6 réelles ; 112 découpes, **167** réelles ; **153** fiches au lieu de **225**, parce que le motif
   exigeait `- [ ] **#nnn` et que 72 fiches commencent par un emoji ; un balayage qui ne distinguait pas le commentaire du
   code ; et le 14 au soir, **6 candidats rendus dont 4 faux** – mon motif ne distinguait pas une classe qui cache TOUJOURS
   d'une classe qui cache SELON UN ÉTAT.
   ⮕ **Quand un nombre te surprend, c'est ton instrument qu'il faut mesurer, pas le monde.** Compte deux fois, par deux
   chemins, et **dis dans ta mesure par quelle transformation tu as lu.**

1. ⚠⚠ **J'AI PRIS LA LIMITE DE MON INSTRUMENT POUR UNE LIMITE DU MONDE.** Mon shell n'atteint pas le dépôt en SSH → j'ai
   écrit que personne n'avait la clé. Le 14 : `codexnumeris.org` rendait 403 **depuis mon proxy** ; la page était en ligne
   et lisible. ⮕ **Écris ce que TU as mesuré, avec l'outil que tu as employé** – et quand un outil refuse, essaie l'autre
   (le conteneur, le shell de l'appareil, WebFetch) avant de conclure.

2. ⚠⚠⚠ **J'AI NOMMÉ DEUX ÉCRANS QUE JE N'AVAIS PAS REGARDÉS – ET C'EST LA FAUTE LA PLUS COÛTEUSE DU 14.**
   (a) J'ai écrit « le groupe **Sauvegarder / Réinitialiser** » dans une porte terrain. Ces mots venaient d'un
   **commentaire HTML**, pas de l'écran : les boutons s'appellent « Enregistrer » et « ↺ ». Grégoire a répondu « je ne sais
   pas de quoi tu parles », avec raison.
   (b) J'ai donné « le bouton **Verrouillée / Modifiable** de la bibliothèque » comme geste à poser. Ce bouton vit dans
   **deux fonctions que rien n'appelle**. Il n'existe pas à l'écran.
   ⮕ **Un écran se nomme par ce qu'il AFFICHE, jamais par un commentaire, un identifiant ou un nom de fonction.** Et avant
   de donner un geste à poser : **vérifie que la fonction qui le rend a un appelant vivant.**

3. ⚠ **J'AI ANNONCÉ UN CHANGEMENT VISIBLE QUI N'EXISTAIT PAS.** J'ai averti Grégoire qu'un bouton passerait en pleine
   largeur. Claude Code l'a mesuré : une règle plus précise lui donnait déjà toute la largeur. ⮕ **Une conséquence visuelle
   se mesure dans le navigateur, elle ne se déduit pas d'une classe CSS.**

4. ⚠ **TROIS COMPTES DE RANGÉES ANNONCÉS COURTS**, dont le 14 : « quatre rangées » pour une porte qui en portait **cinq et
   une décision**. ⮕ **Recompte les rangées d'une porte avant de publier.**

5. **J'AI CHERCHÉ UN BANC PAR SON NOM DE FICHIER AU LIEU DE SON CONTENU.** ⮕ `grep -rln` sur le SYMBOLE, jamais `ls | grep`.

6. **J'AI FAIT INSCRIRE UN DOUBLON** (#857 = #553). ⮕ Avant d'inscrire une trouvaille, `grep` le backlog sur ses mots-clés.

7. **UN CHEMIN D'OUTIL PÉRIME SANS PRÉVENIR.** Le 14, `/opt/pw-browsers/chromium/…` n'existait plus : le dossier porte un
   numéro de build. ⮕ `ls -d /opt/pw-browsers/chromium*/` avant de lancer.

### Ce qui a tenu, et qu'il faut refaire
- **LA PORTE TERRAIN A TROUVÉ CE QU'AUCUN TEST NE POUVAIT TROUVER – DEUX FOIS LE 14, EN CASCADE.** « Je ne vois aucune
  option de verrouillage » a donné #863 (un bandeau caché par une classe que le code ne retirait jamais), puis, le même
  refus répété, **#864 : tout le verrouillage des cartouches était mort**. ⮕ **Quand une vérification ne trouve pas son
  écran, c'est parfois l'écran qui manque. Ne conclus pas « il a mal cherché ».**
- **UN LOT ÉVITÉ VAUT UN LOT LIVRÉ, et un chantier SUPPRIMÉ vaut mieux encore.** Le 14 : le bilan PDF était déjà livré
  depuis quinze jours ; et #863, corrigé le matin, a été **retiré le soir** parce que la question qu'il réparait n'existait
  plus. Le correctif était juste. ⮕ **Avant de réparer, demande si l'objet a lieu d'être.**
- **Mesurer avant de cadrer.** Sur tous les lots du 13 et du 14, la mesure a démenti la fiche.
- **Éprouver ses propres artefacts au navigateur avant de publier.** Le 14, le bouton « Copier mes résultats » a été essayé
  avec une rangée en échec et une note : le relevé copié portait bien la note, les non-répondues et la décision. C'est le
  trou du 13, et il est bouché.
- **Dire quand une de ses propres hypothèses est réfutée.** Fait une dizaine de fois par jour. Chaque fois : une ligne, et
  un lot évité.

## 6 · COMMENT GRÉGOIRE VEUT QU'ON LUI PARLE

- ⚠⚠ **Ce qui le met en surcharge n'est PAS la quantité de travail, c'est la quantité d'information par TOUR.** Une séance peut avoir
  quarante tours ; **chaque tour n'a qu'UN objet.** ⚠ C'est la règle qui se perd en session longue – **revérifie-la avant chaque réponse.**
- **Pose ta question au moment où elle se pose**, et **ne reviens jamais trois tours plus tard** sur un item présenté avant.
- **Toujours une recommandation argumentée**, jamais un exposé d'options neutre. **Propose-lui un texte à corriger.** Tutoiement,
  guillemets français, tiret demi-cadratin, réponse courte d'abord.
- **Les numéros de fiches ne lui disent rien** : rends l'avancement en gestes d'utilisateur, les numéros entre parenthèses en fin de ligne.
- ⚠ **Il corrige bien, et souvent contre toi.** Le 13, ma recommandation sur les zones du graphique était « garde l'échelle du
  trimestre et arrête le repli muet » ; il a répondu « suppression pure », et il avait raison – je réparais un objet qui n'avait pas
  lieu d'être. **Quand il tranche contre toi, cherche d'abord ce qui le rend juste.**

### Ce qui remonte jusqu'à lui, et rien d'autre
La **didactique** · ses **données réelles** · les **mots que ses élèves et ses collègues lisent** · ce qui **l'engage publiquement**.
⮕ **Tout le reste, tu le tranches seul et tu le dis en une ligne, en nommant ce que tu as supposé.**

⚠ **Une chose qu'il est SEUL à pouvoir faire, et ce n'est pas un arbitrage : fermer Cowork** avant le verdict Playwright.
Demande-le en une phrase, et donne-lui le bloc de relais AVANT qu'il ferme – après, tu n'es plus là.

---

## 7 · CE QUI ATTEND UN MOMENT CALME

**Deux stocks, et ni l'un ni l'autre ne se répare d'office** – ce sont ses données réelles.
1. **#520** : l'ablation a tari une écriture qui aplatissait la clé nue `configEchelle` à chaque chargement d'échelle.
2. **#659** : plus aucun lecteur ni écrivain des clés nues `niveauxEchelle` et `configEchelle`. Elles sont **inertes** chez qui les a,
   et elles voyagent dans toute sauvegarde Codex.

3. **#864** : les cartouches déjà en base gardent leur champ `verrouille`, devenu **inerte** – plus aucun lecteur dans `js/`
   hors des sept schémas d'échange, qui l'acceptent et l'ignorent. Assumé le 14, pas un défaut.

⮕ **La source est tarie ; le stock ne l'est pas.** Ça se mesure et ça se propose. Ne le rouvre pas avant qu'il en parle.
