# Consigne de démarrage – la session Cowork qui prend le relais

> **Réécrite le lundi 14 septembre 2026, 16 h 20 (Toronto)**, au bout d'une journée de **trois versions** (`1.140.7` à `1.140.9`)
> et **deux portes terrain passées**. Elle REMPLACE toute version précédente ; celle du 13 à 18 h 30 est archivée sous
> `plans de travail/_ancienne-CONSIGNE-DEMARRAGE-COWORK-2026-09-13-18h30.md`.
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
— la note écrite en cas d'échec n'entrait pas dans le relevé — et **seul le passage au navigateur l'a montré.** C'est le trou que
ce bouton existe pour boucher.

---

## 3 · L'ÉTAT MESURÉ – le 14 septembre 2026, 16 h 10 (Toronto)

**Remesure, ne recopie pas** : `cat version.json` · `git --no-optional-locks log --oneline -3 main` ·
`git --no-optional-locks log --oneline -1 origin/main` · `git --no-optional-locks status --porcelain` · `TZ=America/Toronto date`.

- **Version `1.140.9` / `0914-1250`, EN LIGNE** (`origin/main` = `8d782387`).
- ⚠ **UN COMMIT ATTEND LE PUSH** : `e5d5ccc7`, la page publique « où vivent les données ». `main` a un commit d'avance.
- **Treize lots en ligne depuis le tri du 13.** Les trois d'aujourd'hui : le graphique des indices sans paliers (1.140.7), le
  parcours de rentrée d'un trait (1.140.8), les pseudonymes dans la liste du Cadre en anonymisation (1.140.9).
- **225 fiches ouvertes**, remesuré le 14 à 16 h 10. ⚠⚠ **NE COMPTE PAS AVEC `^- \[ \] \*\*#`** : ce motif rend **153**, parce que
  72 fiches commencent par un emoji de catégorie avant le gras. Compte les lignes `- [ ] ` à la racine (226) et retire celle qui ne
  contient aucun `#nnn` : c'est le gabarit de la section « Notes ». **Dernier ID : #861.**
- ⚠ **Vérifie la ligne « Dernier ID » en tête de `BACKLOG.md`** : c'est la SEULE qui fait foi.
- ⚠ **Deux sessions Cowork ont travaillé en parallèle le 13 au soir.** Vérifie qui a écrit en dernier avant de reprendre un fichier
  de cadrage — `git log -1 --format='%h %ad %s' -- <fichier>`.
- **QUI POUSSE : Claude Code, par `scripts/pousser.sh`, à la demande de Grégoire. Pas toi.** ⛔ Ne conclus pas de ce que TON
  environnement ne peut pas faire à ce que le RÔLE ne peut pas faire.

---

## 4 · CE QUI EST DÛ – dans l'ordre

**a) À l'ouverture** : remesurer, et **regarder si l'arbre est sale** — une session de code peut être en vol.

**b) ⚠ DEMAIN MARDI 15, LA COMMUNAUTÉ DE PRATIQUE OUVRE L'APPLICATION.** Elle fera le parcours de rentrée sur des postes vierges,
celui que 1.140.8 vient de corriger. **Un retour d'un membre passe AVANT le backlog, sans discussion.** L'orthopédagogue, elle, a
ouvert l'application lundi ; son retour a la même priorité.

**c) #860 ATTEND UNE DÉCISION DE GRÉGOIRE, et ne se code pas avant.** Deux graphiques de groupe — le faisceau de l'indice P et les
trajectoires en mode « note finale » — dessinent encore les paliers d'une échelle sous des pourcentages agrégés. **La décision du
13 sur le graphique individuel ne s'y étend pas d'office** : elle a été prise pour un canvas nommé. Pose-lui la question quand il
est disponible, avec une recommandation.

**d) CE QUI RESTE DE #478, et qui n'est PAS un quick-win** : la création d'un trimestre passe encore par des `prompt()` natifs,
l'aide du groupe-cours est un `alert()`, et le compte « X/5 configurés » est écrit en dur. **Ce dernier a été mesuré et remonté** :
sur un service, l'horaire est facultatif depuis #842, donc quatre éléments obligatoires et non cinq — porté par #836 et #475, pas
par #478.

**e) Ce qui attend son mois d'usage, et ne se rouvre pas** : #836, #838, #839, #840, **#742**, **#586**, et le STOCK de #659.

**f) Tenir le tri à jour** – le markdown `plans de travail/TRI-2026-09-13-fiches-ouvertes-par-cout.md` ET l'artefact jumeau.
⚠ **Un seul des deux Cowork à la fois**, sinon la page et le markdown divergent.

**g) `verification-adverse` NE S'EST PAS CHARGÉ SEUL** au rituel de clôture du 13. La règle 10 reste donc dans `PROTOCOLE.md` :
il faut **deux « oui »** consécutifs pour l'en sortir, et le compteur est à zéro.

---

## 5 · LES ERREURS QUE J'AI PAYÉES – ne les refais pas

0. ⚠⚠⚠ **MON MOTIF NE VOIT PAS LES SYNONYMES. QUATRE FOIS EN DEUX JOURS.**
   (a) `grep` ligne à ligne : 5 balises comptées, 6 réelles ; puis 112 découpes comptées, **167** réelles — et les deux seules
   assertions mortes étaient parmi les 55 invisibles.
   (b) Mon balayage ne distinguait pas le commentaire du code : j'ai signalé une règle CSS orpheline **qui n'existe pas**.
   (c) Le 14 : j'ai compté **153** fiches ouvertes au lieu de **225**, parce que mon motif exigeait `- [ ] **#nnn` et que 72 fiches
   commencent par un emoji.
   ⮕ **Quand un nombre te surprend, c'est ton instrument qu'il faut mesurer, pas le monde.** Compte deux fois, par deux chemins,
   et **dis dans ta mesure par quelle transformation tu as lu.**

1. ⚠⚠ **J'AI PRIS LA LIMITE DE MON INSTRUMENT POUR UNE LIMITE DU MONDE.** Mon shell n'atteint pas le dépôt en SSH → j'ai écrit que
   personne n'avait la clé. Les bancs ne s'exécutaient pas chez moi → j'ai écrit que Cowork ne peut pas lancer la suite. Un fichier
   ne s'ouvrait pas → j'ai failli écrire qu'il n'avait pas été écrit. ⮕ **Écris ce que TU as mesuré, avec l'outil que tu as employé.**

2. **J'AI RECOPIÉ UN COMPTE AU LIEU DE REFAIRE LA SOUSTRACTION.** ⮕ Quand l'arithmétique ne retombe pas, ce n'est pas l'arithmétique.

3. ⚠⚠ **J'AI CHERCHÉ UN BANC PAR SON NOM DE FICHIER AU LIEU DE SON CONTENU.** ⮕ `grep -rln` sur le SYMBOLE, jamais `ls | grep`.

4. **J'AI GÉNÉRALISÉ DEPUIS UN ÉCHANTILLON.** ⮕ Quand tu écris « les N sont tous X », vérifie les N.

5. **J'AI FAIT INSCRIRE UN DOUBLON** (#857 = #553). ⮕ Avant d'inscrire une trouvaille, `grep` le backlog sur ses mots-clés.

6. **J'AI ÉCRIT UN PÉRIMÈTRE SANS MESURER CE QU'IL DÉSIGNAIT.** ⮕ Un périmètre nomme du code qu'on a lu, pas un écran qu'on imagine.

7. ⚠ **DEUX COMPTES DE RANGÉES ANNONCÉS COURTS** : une porte annoncée à six en portait sept, une autre annoncée à cinq en portait
   sept. Les deux fois, le total oubliait le préalable et les cases doublées. ⮕ **Recompte les rangées d'une porte avant de publier.**

### Ce qui a tenu, et qu'il faut refaire
- **Mesurer avant de cadrer.** Sur les lots du 13 et du 14, **la mesure a démenti la fiche à chaque fois**. Le 14, elle a fait mieux :
  le chantier choisi par Grégoire — le bilan PDF — était **déjà livré depuis quinze jours**, et ses treize traces au grep étaient
  toutes des commentaires documentant leur propre retrait. **Un lot évité vaut un lot livré.**
- **Deux méthodes, pas deux lectures.** J'ai lu le texte ; Claude Code a contre-vérifié par l'historique et par 16 mutations.
  ⮕ **Quand ta contre-vérification confirme, dis par quel chemin — sinon tu n'as fait que relire.**
- **La porte terrain rend ce qu'aucun test ne peut rendre.** Celle de #478 a trouvé que la bulle disparaissait avant qu'on ait lu la
  seconde phrase — celle qui portait l'information ajoutée. Le correctif ratait sa cible, et rien d'automatique ne l'aurait dit.
- **Dire quand une de ses propres hypothèses est réfutée.** Fait une dizaine de fois par jour. Chaque fois : une ligne, et un lot évité.

---

## 6 · COMMENT GRÉGOIRE VEUT QU'ON LUI PARLE

- ⚠⚠ **Ce qui le met en surcharge n'est PAS la quantité de travail, c'est la quantité d'information par TOUR.** Une séance peut avoir
  quarante tours ; **chaque tour n'a qu'UN objet.** ⚠ C'est la règle qui se perd en session longue – **revérifie-la avant chaque réponse.**
- **Pose ta question au moment où elle se pose**, et **ne reviens jamais trois tours plus tard** sur un item présenté avant.
- **Toujours une recommandation argumentée**, jamais un exposé d'options neutre. **Propose-lui un texte à corriger.** Tutoiement,
  guillemets français, tiret demi-cadratin, réponse courte d'abord.
- **Les numéros de fiches ne lui disent rien** : rends l'avancement en gestes d'utilisateur, les numéros entre parenthèses en fin de ligne.
- ⚠ **Il corrige bien, et souvent contre toi.** Le 13, ma recommandation sur les zones du graphique était « garde l'échelle du
  trimestre et arrête le repli muet » ; il a répondu « suppression pure », et il avait raison — je réparais un objet qui n'avait pas
  lieu d'être. **Quand il tranche contre toi, cherche d'abord ce qui le rend juste.**

### Ce qui remonte jusqu'à lui, et rien d'autre
La **didactique** · ses **données réelles** · les **mots que ses élèves et ses collègues lisent** · ce qui **l'engage publiquement**.
⮕ **Tout le reste, tu le tranches seul et tu le dis en une ligne, en nommant ce que tu as supposé.**

⚠ **Une chose qu'il est SEUL à pouvoir faire, et ce n'est pas un arbitrage : fermer Cowork** avant le verdict Playwright.
Demande-le en une phrase, et donne-lui le bloc de relais AVANT qu'il ferme – après, tu n'es plus là.

---

## 7 · CE QUI ATTEND UN MOMENT CALME

**Deux stocks, et ni l'un ni l'autre ne se répare d'office** — ce sont ses données réelles.
1. **#520** : l'ablation a tari une écriture qui aplatissait la clé nue `configEchelle` à chaque chargement d'échelle.
2. **#659** : plus aucun lecteur ni écrivain des clés nues `niveauxEchelle` et `configEchelle`. Elles sont **inertes** chez qui les a,
   et elles voyagent dans toute sauvegarde Codex.

⮕ **La source est tarie ; le stock ne l'est pas.** Ça se mesure et ça se propose. Ne le rouvre pas avant qu'il en parle.
