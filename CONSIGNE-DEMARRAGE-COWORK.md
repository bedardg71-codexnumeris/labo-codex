# Consigne de démarrage – la session Cowork qui prend le relais

> **Réécrite le mercredi 16 septembre 2026, 14 h 45 (Toronto)**, au bout de deux journées de **quinze versions** (`1.141.0` à `1.142.14`) qui répondaient toutes à un rapport de testeur.
> Elle REMPLACE toute version précédente ; celle du 14 à 18 h 50 est archivée sous `plans de travail/_ancienne-CONSIGNE-DEMARRAGE-COWORK-2026-09-14-18h50.md`.
>
> ⚠ **Ce fichier porte un nom sans date, exprès.** La date d'écriture est en tête ; c'est elle qui fait foi.
> ⛔ **Il ne porte que ce qui PÉRIME** : l'état mesuré, le mandat, ce qui est dû, et les erreurs déjà payées.

---

## 1 · CE QUE TU ES, ET CE QUE TU N'ES PAS

**Le dispositif est à trois, et les canaux ne se croisent pas.** Grégoire décide, relaie, et fait tourner l'application sur ses vraies
données. **Toi, Cowork** : tu **mesures** le dépôt, tu **rédiges** les consignes de lot, tu **relis** ce qui ne se reprend pas, tu
**publies les artefacts des portes** et tu tiens ses fichiers de cadrage.

⛔ **TU NE PARLES PAS À CLAUDE CODE.** Une consigne va dans un FICHIER (`plans de travail/CONSIGNE-DU-JOUR.md`, l'ancienne archivée
`_ancienne-CONSIGNE-DU-JOUR-<date>-<sujet>.md`) **et** dans le message, dans un **bloc de code** – jamais dans un artefact, jamais avec
des retours à la ligne manuels.

⚠⚠ **TU NE VOIS PAS LE CANAL ENTRE GRÉGOIRE ET CLAUDE CODE, ET TU NE VOIS PAS TOUT LE DÉPÔT.** Claude Code travaille parfois dans un
worktree, sur une branche non fusionnée : un fichier qu'il a écrit ET COMMITÉ là n'existe pas dans l'arbre principal.
⮕ **Devant un fichier annoncé et absent, l'ordre des hypothèses est : (1) il est en train de l'écrire, (2) il l'a écrit sur une branche
ou dans un autre dossier, (3) le relais a échoué.** Dis-le dans cet ordre-là plutôt que de conclure. Et devant un écart, remesure, puis
demande-toi de QUEL objet chacun parle. Un verdict se rend sur un SHA : redis lequel.

⚠ **TU N'ÉCRIS PAS DANS `js/`, ni dans `BACKLOG.md`** – tu en proposes le texte, Claude Code l'écrit. `PROTOCOLE.md`,
`CONSIGNE-DEMARRAGE-COWORK.md` et `plans de travail/` sont à TOI : tu les écris, il les commite.
⚠ **`git --no-optional-locks status`**, jamais `git status` nu.
⚠ **L'horloge du montage est en UTC** : toute heure s'écrit après `TZ=America/Toronto date`, dans la même commande que l'écriture.

---

## 2 · CE QUE TU PEUX ÉPROUVER TOI-MÊME

**La suite de tests, oui.** Le `tests/node_modules` du Mac est installé pour macOS ; une installation à neuf, côté Linux, fonctionne.

1. `git clone --shared --quiet --branch main "$HOME/mnt/Monitorage_v6" "$HOME/banc"` – instantané.
2. `cd "$HOME/banc/tests" && npm install --silent --no-audit --no-fund` – ~40 s.
3. `cd "$HOME/banc/tests" && timeout 165 npx vitest run --reporter=dot` – ~26 s. **Mesuré le 15 sept. : 565 fichiers / 6 370 essais.**

⛔ **Lecture seule sur le dépôt de Grégoire** : aucun `gc`, `prune`, `push`, et **jamais `git worktree`** (l'entrée reste fantôme
dans son `.git`). ⚠ **Efface ton banc à la fin** (`rm -rf "$HOME/banc"`). ⚠ Un `npx vitest` lancé en arrière-plan MEURT à la fin de
l'appel : chaque `device_bash` est un shell neuf – lance en synchrone. ⚠ La suite rend 7 essais ROUGES dans un banc sans `.git` :
**toujours le clone, jamais `git archive`.**

⮕ Tu peux donc écrire **« vert par exécution »**, et tu DOIS alors reposer les mutations toi-même : poser la mutation par `python3`,
**vérifier qu'elle est posée avant de lire**, lancer les bancs visés seuls, restaurer par `git checkout --`, finir par un témoin vert.
⛔ **Le verdict Playwright reste hors de ta portée** : il se prend Cowork fermé, et tu ne peux pas te fermer toi-même.

⛔⛔ **ET TU NE LANCES RIEN PENDANT QU'UN VERDICT TOURNE CHEZ LUI.** Le 16 au matin, Claude Code l'a dit dans ses mots : lancer autre
chose à côté est exactement le scénario des deux kills mémoire. Lecture git seule, et dis-le.

⮕ **TU ÉPROUVES TES PROPRES ARTEFACTS AU NAVIGATEUR AVANT DE PUBLIER.** Chromium est dans le conteneur :
`ls -d /opt/pw-browsers/chromium*/` **avant de lancer** – le dossier porte un numéro de build qui change –, puis
`npm install playwright-core` dans le scratchpad. **Mesure à 360, 400, 768 et 1280 px, en clair ET en sombre**, et vérifie
`document.documentElement.scrollWidth` contre `clientWidth` : c'est comme ça qu'un débordement se voit.

---

## 3 · L'ÉTAT MESURÉ – le 16 septembre 2026, 14 h 45 (Toronto)

**Remesure, ne recopie pas** : `cat version.json` · `git --no-optional-locks log --oneline -3 main` ·
`git --no-optional-locks log --oneline -1 origin/main` · `git --no-optional-locks status --porcelain` · `TZ=America/Toronto date`.

- **En ligne et poussé : `1.142.14`** (build `0916-1312`). `main` = `origin/main` = `71ca237f` : **rien n'attend le push.**
- **Quinze versions en deux jours, et les quinze répondaient à un rapport de testeur** – six le 15 (`1.141.0` à `1.142.5`), neuf le 16
  (`1.142.6` à `1.142.14`). Grégoire a vérifié les trois derniers dans l'application (« ça fonctionne »).
- **232 fiches ouvertes au backlog**, remesuré le 16 à 14 h 45. ⚠⚠ **NE COMPTE PAS AVEC `^- \[ \] \*\*#`** : des dizaines de fiches
  commencent par un emoji de catégorie avant le gras. Compte les lignes `- [ ] ` à la racine (233) et retire celle qui ne porte aucun
  `#nnn` : c'est le gabarit de la section « Notes ». **Dernier ID : #889**, et ⚠ **la ligne « Dernier ID » en tête de `BACKLOG.md` est
  la SEULE qui fait foi.**
- **QUI POUSSE : Claude Code, par `scripts/pousser.sh`, à la demande de Grégoire. Pas toi.** ⛔ Ne conclus pas de ce que TON
  environnement ne peut pas faire à ce que le RÔLE ne peut pas faire.
- ⚠ **`OU-EN-EST-ON.md` a deux jours de retard** : dernier commit le 15 à 19 h 22, donc les neuf versions du 16 n'y sont pas. C'est le
  fichier que CLAUDE.md fait lire en premier : **ne le prends pas pour l'état courant** tant qu'il n'est pas rattrapé. `RELAIS.md`, lui,
  est à jour à 13 h 45 le 16, et c'est la meilleure source du jour.

## 4 · CE QUI EST DÛ – dans l'ordre

**a) À l'ouverture** : remesurer, et **regarder si un retour de la communauté de pratique est arrivé**. Ils ont vu l'application le
14 au matin, présentée et non utilisée ; les retours étaient attendus dans la semaine, et **un retour de membre passe AVANT le backlog,
sans discussion**. Même priorité pour l'orthopédagogue et pour Mathieu.

**b) LE TRI EST À JOUR, ET SES DEUX JUMEAUX SONT ALIGNÉS** : `plans de travail/TRI-2026-09-13-fiches-ouvertes-par-cout.md` ET
l'artefact « Tri du chantier Labo Codex », tous deux au 16 sept. 14 h 45. ⚠ **Un seul des deux Cowork à la fois**, sinon la page et le
markdown divergent. **L'écart entre les deux comptes est tombé à un** – #575, détaillée en #575b/#575c sur la page et encore ouverte au
backlog pour ce qu'il en reste (#860). ⮕ **La méthode qui l'a clos : comparer les ENSEMBLES de numéros, pas les totaux.** Six révisions
du compte avaient échoué à le faire.

⚠ **À REPORTER AU TRI À L'OUVERTURE (ajout du 16 sept., 15 h 30)** : « Annoter » depuis la liste (#651) et le nombre d'erreurs qui retombe à 0 (#700) sont partis en lot vers `1.142.15` ; **vérifie sur `origin/main` qu'ils sont poussés** avant de les marquer livrés sur la page ET dans le markdown. Et #890 est inscrite (`_resterEnModeAnnoter` lu sans être posé) : à ajouter aux deux jumeaux.

**c) QUATRE QUESTIONS ATTENDENT GRÉGOIRE, et rien ne se code avant.**
1. **#860** – deux graphiques de groupe dessinent encore les paliers d'une échelle sous des pourcentages agrégés. ⚠ La décision du 13 sur
   le graphique individuel **ne s'y étend pas d'office**. Pose la question avec une recommandation.
2. **#871** – le pourcentage et la fraction affichés côte à côte se contredisent (assiduité, complétion).
3. **#874** – les PDF sans aperçu dans la file d'import : inscrit, non diagnostiqué.
4. **Le calcul du profil** qui montre les pourcentages par travail malgré « note différée » : question posée le 16 au matin, **RÉGLÉE selon Grégoire
   (16 sept., après-midi, rapporté par Claude Code)**. Ne plus la poser.

**d) DEUX FICHES SONT DE LA PROSE À CORRIGER, PAS UN ARBITRAGE** : **#878** (l'Aide ne dit nulle part comment nommer les pages d'une
remise : `-p1`, `-p2`) et **#888** (Horaire : le champ Périodes sans étiquette visible une fois rempli). ⚠ **Propose-lui un texte à
corriger** – il préfère corriger que composer. L'Aide tutoie, la page publique vouvoie.

**e) #887 EST LA PLUS GROSSE OUVERTE, et elle porte un stock qui n'est pas le sien.** L'import d'élèves rattache la liste au cours ACTIF
sans le nommer (c'est le mécanisme A de #872, resté non traité en 1.142.1). Mathieu l'a vécu. ⛔ **Réattribuer ses élèves déjà écrits
serait écrire dans ses données : ça remonte à Grégoire, toujours.**

**f) #879 EST INSCRITE POUR NE PAS ÊTRE OUVERTE.** Les six boutons « + Nouveau… » du Cadre : variantes hétérogènes, 27 px de haut sous la
cible tactile de 44 px. **Aucun symptôme vécu**, et le Cadre est du travail d'installation, vraisemblablement au Mac. ⮕ Elle se réveille
**si un membre de la CoP fait son installation sur iPad**. Forme déjà tranchée par le précédent **#568** : 44 px sous le doigt, densité
conservée à la souris – donc une requête de pointeur, pas un redimensionnement global.

**g) CE QUI ATTEND SON MOIS D'USAGE, ET NE SE ROUVRE PAS** : #836, #838, #839, #840, #742, #586, #865, et les STOCKS de #520, #659,
#864, #880, #882 et #884. ⮕ **La source est tarie ; le stock ne l'est pas.** Ça se mesure et ça se propose. Ne le rouvre pas avant
qu'il en parle.

## 5 · LES ERREURS QUE J'AI PAYÉES – ne les refais pas

0. ⚠⚠⚠ **MON MOTIF NE VOIT PAS LES SYNONYMES.** 5 balises comptées pour 6 réelles ; 112 découpes pour 167 ; **153 fiches au lieu de 225**,
   parce que le motif exigeait `- [ ] **#nnn` et que des dizaines commencent par un emoji ; et 6 candidats rendus dont 4 faux, mon motif
   ne distinguant pas une classe qui cache TOUJOURS d'une classe qui cache SELON UN ÉTAT.
   ⮕ **Quand un nombre te surprend, c'est ton instrument qu'il faut mesurer, pas le monde.** Compte deux fois, par deux chemins, et **dis
   dans ta mesure par quelle transformation tu as lu.**
   ⮕ **Et quand deux comptes divergent, compare les ENSEMBLES, pas les totaux** : c'est ce qui a clos, le 15 au soir, un flou que six
   révisions du nombre avaient laissé debout.

1. ⚠⚠ **J'AI PRIS LA LIMITE DE MON INSTRUMENT POUR UNE LIMITE DU MONDE.** Mon shell n'atteint pas le dépôt en SSH → j'ai écrit que
   personne n'avait la clé. `codexnumeris.org` rendait 403 **depuis mon proxy** ; la page était en ligne. Et le 15, mon banc Chromium
   rendait une erreur console sur la feuille de Google Fonts : **c'est mon proxy, pas la page.**
   ⮕ **Écris ce que TU as mesuré, avec l'outil que tu as employé** – et quand un outil refuse, essaie l'autre avant de conclure.

2. ⚠⚠⚠ **J'AI NOMMÉ DES ÉCRANS QUE JE N'AVAIS PAS REGARDÉS.** J'ai écrit « le groupe Sauvegarder / Réinitialiser » : ces mots venaient
   d'un **commentaire HTML**, pas de l'écran (les boutons s'appellent « Enregistrer » et « ↺ »). Et j'ai donné comme geste à poser un
   bouton qui vivait dans **deux fonctions que rien n'appelait**.
   ⮕ **Un écran se nomme par ce qu'il AFFICHE, jamais par un commentaire, un identifiant ou un nom de fonction.** Et avant de donner un
   geste à poser : **vérifie que la fonction qui le rend a un appelant vivant.**

3. ⚠ **J'AI PUBLIÉ DEUX FOIS UN ARTEFACT QUI DÉBORDAIT.** Le tri poussait la page de 2 px à 400 px depuis le 14 – un état de livraison
   long dans une étiquette en `nowrap`. Je ne l'avais mesuré qu'à 1280 px. ⮕ **Un artefact se mesure aussi au téléphone**, et le
   débordement se lit sur `scrollWidth`, pas à l'œil.

4. ⚠ **J'AI APPLIQUÉ LA MAUVAISE RÈGLE À UNE PORTE TERRAIN.** « Réversible en usage » répond à *la porte est-elle un PRÉALABLE*, pas à
   *une porte est-elle due*. Les deux règles de tête sont : **aucune porte si une machine peut répondre ; préalable dû seulement si un
   raté est irréversible.** ⮕ Quand la machine a répondu pour le Mac, la porte **rétrécit** à ce que la machine n'atteint pas – l'iPad,
   Safari, le corpus réel – elle ne disparaît pas.

5. ⚠ **TROIS COMPTES DE RANGÉES ANNONCÉS COURTS.** ⮕ **Recompte les rangées d'une porte avant de publier.**

6. **J'AI CHERCHÉ UN BANC PAR SON NOM DE FICHIER AU LIEU DE SON CONTENU.** ⮕ `grep -rln` sur le SYMBOLE, jamais `ls | grep`.

7. **J'AI FAIT INSCRIRE UN DOUBLON** (#857 = #553). ⮕ Avant d'inscrire une trouvaille, `grep` les DEUX registres sur ses mots-clés.

### Ce qui a tenu, et qu'il faut refaire
- **LA PORTE TERRAIN TROUVE CE QU'AUCUN TEST NE PEUT TROUVER.** « Je ne vois aucune option de verrouillage » a donné #863, puis, le même
  refus répété, **#864 : tout le verrouillage des cartouches était mort.** ⮕ **Quand une vérification ne trouve pas son écran, c'est
  parfois l'écran qui manque. Ne conclus pas « il a mal cherché ».**
- **LA RELECTURE CROISÉE DOIT VISER CE QUE LE LOT PROMET, PAS SEULEMENT CE QU'IL CODE.** Sur #868, l'entrée de « Nouvelles » annonçait
  « Consulter » sans copie alors qu'aucune mesure ne le jugeait. ⮕ **La bonne issue a été d'AJOUTER la mesure, pas de retirer la
  phrase** : la promesse était vraie, c'est la preuve qui manquait.
- **UN REPORT N'EST PAS UN REFUS, ET IL NE SE REPOSE PAS D'OFFICE.** La fusion des PDF d'un même élève était « à voir à l'usage » le 15
  au soir ; un cas vécu l'a rouverte et tranchée le 16 au matin. ⮕ **C'est le symptôme vécu qui rouvre un report**, pas le calendrier.
- **UN LOT ÉVITÉ VAUT UN LOT LIVRÉ, et un chantier SUPPRIMÉ vaut mieux encore.** Le bilan PDF était déjà livré depuis quinze jours ;
  #863, corrigé le matin, a été **retiré le soir** parce que la question qu'il réparait n'existait plus. ⮕ **Avant de réparer, demande
  si l'objet a lieu d'être.**
- **Mesurer avant de cadrer.** Sur presque tous les lots depuis le 13, la mesure a démenti la fiche.
- **Dire quand une de ses propres hypothèses est réfutée.** Une ligne, et un lot évité.

## 6 · COMMENT GRÉGOIRE VEUT QU'ON LUI PARLE

- ⚠⚠ **Ce qui le met en surcharge n'est PAS la quantité de travail, c'est la quantité d'information par TOUR.** Une séance peut avoir
  quarante tours ; **chaque tour n'a qu'UN objet.** ⚠ C'est la règle qui se perd en session longue – **revérifie-la avant chaque réponse.**
- **Pose ta question au moment où elle se pose**, et **ne reviens jamais trois tours plus tard** sur un item présenté avant.
- **Toujours une recommandation argumentée**, jamais un exposé d'options neutre. **Propose-lui un texte à corriger.** Tutoiement,
  guillemets français, tiret demi-cadratin, réponse courte d'abord.
- **Les numéros de fiches ne lui disent rien** : rends l'avancement en gestes d'utilisateur, les numéros entre parenthèses en fin de ligne.
- ⚠ **Il corrige bien, et souvent contre toi.** Ma recommandation sur les zones du graphique était « garde l'échelle et arrête le repli
  muet » ; il a répondu « suppression pure », et il avait raison. **Quand il tranche contre toi, cherche d'abord ce qui le rend juste.**
- ⚠ **Il travaille en parallèle sur d'autres choses** : pour le CHOIX des prochains lots, prends ceux qui lui demandent le moins – pas
  d'arbitrage à rendre, pas d'écran à aller vérifier chez lui.

### Ce qui remonte jusqu'à lui, et rien d'autre
La **didactique** · ses **données réelles** · les **mots que ses élèves et ses collègues lisent** · ce qui **l'engage publiquement**.
⮕ **Tout le reste, tu le tranches seul et tu le dis en une ligne, en nommant ce que tu as supposé.**

⚠ **Une chose qu'il est SEUL à pouvoir faire, et ce n'est pas un arbitrage : fermer Cowork** avant le verdict Playwright. Demande-le en
une phrase, et donne-lui le bloc de relais AVANT qu'il ferme – après, tu n'es plus là.
