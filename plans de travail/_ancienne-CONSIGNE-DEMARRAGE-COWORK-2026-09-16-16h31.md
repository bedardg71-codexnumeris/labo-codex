# Consigne de démarrage – la session Cowork qui prend le relais

> **Réécrite le mercredi 16 septembre 2026, 16 h 31 (Toronto)**, au bout d'un après-midi de **trois lots du tri** (#651 et #700 en `1.142.15`, #652 et #890 en `1.142.16`) et d'une **revue des questions du dépistage**, rassemblées sur leur propre page.
> Elle REMPLACE toute version précédente ; celle du 16 à 14 h 45 est archivée sous `plans de travail/_ancienne-CONSIGNE-DEMARRAGE-COWORK-2026-09-16-14h45.md`.
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

## 3 · L'ÉTAT MESURÉ – le 16 septembre 2026, 16 h 31 (Toronto)

**Remesure, ne recopie pas** : `cat version.json` · `git --no-optional-locks log --oneline -3 main` ·
`git --no-optional-locks log --oneline -1 origin/main` · `git --no-optional-locks status --porcelain` · `TZ=America/Toronto date`.

- **En ligne : `1.142.15`** (`26d4347f` = `origin/main`) : « Annoter » depuis la liste ouvre la copie avec ses outils après un passage en mode Évaluer (#651, **vérifié par Grégoire dans l'app**) ; retirer toutes les annotations ramène « Nombre d'erreurs » à 0 sans écraser une saisie manuelle (#700).
- ⚠⚠ **COMMITÉE, PAS POUSSÉE à l'écriture : `1.142.16`** (`19604ea4`, puis `57d0c3f0` de docs ; build `0916-1615`). Elle porte #652 (une évaluation dont un critère a quitté sa grille s'ouvre, le **signale et le garde** – décision de Grégoire rapportée par Claude Code, phrase de « Nouvelles » validée par lui) et #890 (drapeau mort `_resterEnModeAnnoter` retiré). **Le verdict Playwright attend que Cowork soit fermé.** ⮕ **À l'ouverture, regarde si `origin/main` a rejoint `main`** avant de dire quoi que ce soit de 1.142.16.
- **Le dernier Vitest rapporté** (Claude Code, sur 1.142.15) : 574 fichiers / 6 437 essais. Non remesuré par Cowork.
- **229 fiches ouvertes au backlog** sur `57d0c3f0` : 230 lignes `- [ ] ` à la racine, moins le gabarit `#XX` de la section « Notes ». **Dernier ID : #890** – la ligne « Dernier ID » en tête de `BACKLOG.md` est la SEULE qui fait foi. ⚠⚠ **NE COMPTE PAS AVEC `^- \[ \] \*\*#`** (des fiches commencent par un emoji) : extrais le premier `#nnn` de chaque ligne `- [ ] ` et compare des ENSEMBLES.
- **QUI POUSSE : Claude Code, par `scripts/pousser.sh`, à la demande de Grégoire. Pas toi.**
- **Aucun retour de la CoP, de l'orthopédagogue ni de Mathieu** dans `Retours des testeurs/` au 16 à 15 h 50 (seuls les rapports de Grégoire). Je ne vois que ce dossier : un retour par courriel m'échappe.

## 4 · CE QUI EST DÛ – dans l'ordre

**a) À l'ouverture** : remesurer ; **regarder si un retour de la CoP, de l'orthopédagogue ou de Mathieu est arrivé** – il passe AVANT le backlog, sans discussion ; et **lire les choix de Grégoire sur la page des questions du dépistage** (point c).

**b) LE TRI : DEUX FICHES À REPORTER, APRÈS LE PUSH SEULEMENT.** `plans de travail/TRI-2026-09-13-fiches-ouvertes-par-cout.md` ET l'artefact « Tri du chantier Labo Codex » (https://claude.ai/artifact/1qhNTJjv1peETqedTQr6bN) sont alignés au 16 à 16 h 30 **sur 1.142.15** : page 230 entrées ouvertes, backlog 231 sur `26d4347f`, écart = {#575} seul.
⮕ **Quand `1.142.16` est sur `origin/main`** : marquer #652 et #890 « livré 1.142.16 » sur les DEUX jumeaux (FICHES de la page ; lignes de fiche, compte et journal du markdown), ajouter le lot 21 au journal, remesurer par ensembles (attendu : page 228, backlog 229, écart {#575}).
⚠ **La page lit `INSCRITES_DEPUIS`** (fiches inscrites après le 13 sept.) pour les cases d'avancement du haut (« 81 · sur 95 · 14 closes », demandé par Grégoire le 16) : **toute fiche ajoutée à `FICHES` s'ajoute aussi à cette liste.** Départ du 13 sept. : 246 rangées (dont #575b/#575c).
⚠ **Un seul Cowork à la fois** sur ces deux fichiers. ⚠ **Mesure la page à 360, 400, 768 et 1280 px, en clair et en sombre**, avant chaque publication (`scrollWidth` contre `clientWidth`). Pour republier : lis-la (`Artifact` `read`), construis sur la version rendue, **retire l'enveloppe** (`<!doctype>…<body>` et les `</body></html>` de fin, la page en portait deux) avant de publier.

**c) LES ONZE QUESTIONS DU DÉPISTAGE ATTENDENT GRÉGOIRE, SUR LEUR PAGE – ne les repose pas en conversation.**
Page « Questions du dépistage » : https://claude.ai/artifact/TyZfhhuGqCWb3ZBVzz2RAJ (capacité `db`, écriture réservée aux éditeurs). Ses choix s'enregistrent dans la collection **`decisions`**, un document par question (`choix`, `note`, `quand`, `question`). **Lis-les avec l'outil `ArtifactData`, action `list`, collection `decisions`.** À 16 h 31 : **aucune réponse encore.** Il travaille en parallèle (il corrige des copies) : il y répondra à son rythme.
⮕ **Quand des réponses arrivent** : une question tranchée = un lot à cadrer. **Remesure avant de cadrer** – la revue du 16 est une LECTURE du code sur `26d4347f` par trois sous-agents, ses détails ne sont écrits nulle part ailleurs que dans les fiches du backlog. Ordre suggéré : « quelles copies comptent » d'abord (#737, #741, #718 : un seul périmètre de copies, il conditionne les autres), puis « points ou niveau » et « SOLO Aucun » ensemble (#739, #740 : les mêmes six calculs).
Les onze et leurs fiches : copies comptées (#737, #741, #718) · non remis dans la complétion (#738) · points ou niveau (#739) · SOLO « Aucun » (#740) · quel palier prime (#744) · palier « Insuffisant » (#822) · arrivée tardive (#735, #750) · aucune présence saisie (#743) · élève exclu (#745) · bandes d'échelle des courbes de groupe (#860) · filtre « A+C < 65 % » (#828).
**Tranché par Cowork et écrit au bas de la page** (Grégoire peut le contester) : #554 (branche « Décrochage » morte : à retirer) ; #677 (à fermer : le seuil de force suit déjà #817, les pastilles 60/50 restent des constantes documentées) ; #738 (`'non-recu'`, écrit par le menu depuis février, n'est reconnu par AUCUN calcul, qui cherchent `'non-remis'` : défaut technique, à corriger avec la question).
**Hors de la page** : #871 est **tranchée depuis le 15 au soir** pour l'assiduité (« 90 % (22,5 / 25) », prête à coder) ; la complétion attend **la mesure de DEMO015** que Grégoire a demandée, non faite. #821 attend l'orthopédagogue ; #742 attend ses usages d'octobre.
⮕ **Un lot sans question qui peut partir tout de suite : le volet assiduité de #871** (tranché, quatre sites d'affichage, source seulement). Et la mesure de DEMO015, qui est une mesure, pas une question.

**c ter) AUTRES QUESTIONS HORS DÉPISTAGE** : **#874** (les PDF sans aperçu dans la file d'import : inscrit, non diagnostiqué – un diagnostic, puis peut-être une question). La question « profil et note différée » est **réglée** : ne plus la poser. **La porte #884** (perspective et rognage après rechargement) est **reportée par Grégoire au prochain artefact, vers le 23-30 sept.**

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

8. ⚠⚠ **J'AI DONNÉ UNE INFÉRENCE POUR UN FAIT, À GRÉGOIRE, EN LUI PROPOSANT UN LOT.** Le 16 à 15 h 50, j'ai écrit que #652 était « vraisemblablement déjà corrigée » parce que le message d'erreur avait quitté le code le 4 sept. La mesure suivante l'a réfuté : ce correctif visait un champ qui n'existait pas encore le jour du rapport. ⮕ **Avant d'annoncer qu'une fiche est réglée, date le correctif CONTRE la date du symptôme** (`git log -S` sur le symbole que le correctif introduit). Et quand ça tombe, dis-le à Grégoire en une phrase, dans le tour suivant.
9. ⚠ **DEUX SUPPOSITIONS DE CONSIGNE RÉFUTÉES DANS LA MÊME HEURE.** Sur #651, « la vignette du profil restaurait le mode Évaluer avant #761 » : faux, elle menait à une page vide. Et « défaut : inscrire » pour une trouvaille sans symptôme contredisait la règle du 24 août (**un item n'entre que s'il a un symptôme vécu ou bloque un chantier**) : #890 est entrée par ma faute. ⮕ **Relis la règle d'entrée au BACKLOG avant d'écrire « inscrire » dans une consigne** ; pour du code mort sans symptôme, le défaut est « commenter, ou retirer dans le lot qui passe là ».
10. **LA TABLE DU TRI DISAIT « À TOI » POUR UNE FICHE DÉJÀ TRANCHÉE** (#871, tranchée le 15 au soir, listée en attente le 16). ⮕ **Avant de présenter une question à Grégoire, cherche dans le bloc de la fiche ET dans `RELAIS.md` le mot « tranché ».**

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
- **LA REVUE PAR SOUS-AGENTS, EN LECTURE SEULE, PENDANT QUE CLAUDE CODE CODE.** Trois agents, un groupe de fiches chacun, interdits de lancer quoi que ce soit : ils ont trouvé deux fiches en partie périmées (#677, #744), une contradiction entre l'Aide et le code (#740), un défaut technique caché dans une question (#738, `'non-recu'`). ⮕ **Une question se remesure avant de se poser.**
- **UNE PAGE DE DÉCISIONS QUI ENREGISTRE, PLUTÔT QUE ONZE TOURS DE CONVERSATION.** Il tranche à son rythme, sur l'iPad s'il veut, et on relit ses choix par `ArtifactData`. C'est la règle « une idée par tour » appliquée à un paquet de questions.
- **L'AVANCEMENT CONTRE LE DÉPART, DEMANDÉ PAR LUI.** Les cases du tri disent « il reste 81, sur 95 vues passer, 14 closes ». ⚠ Il mesure ses progrès par les parcours, pas par les compteurs : garde les deux avertissements de la page (le total monte quand on inscrit ; les laborieuses avancent peu parce qu'on choisit les lots qui lui demandent le moins).
- **UN LOT AJOUTÉ AVANT LE VERDICT, SUR LE MÊME PARCOURS** (#700 derrière #651) : un seul verdict Playwright, un seul Cowork fermé. ⮕ Pas plus d'un : chaque ajout retarde la mise en ligne du premier.


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

- ⚠ **Le 16 après-midi, il corrige des copies en parallèle** et a demandé des lots simples. Préfère les lots sans question, sans écran à vérifier, dans **l'Évaluation** (où il travaille) ou le **Dépistage** (son prochain article, labo #6).

### Ce qui remonte jusqu'à lui, et rien d'autre
La **didactique** · ses **données réelles** · les **mots que ses élèves et ses collègues lisent** · ce qui **l'engage publiquement**.
⮕ **Tout le reste, tu le tranches seul et tu le dis en une ligne, en nommant ce que tu as supposé.**

⚠ **Une chose qu'il est SEUL à pouvoir faire, et ce n'est pas un arbitrage : fermer Cowork** avant le verdict Playwright. Demande-le en
une phrase, et donne-lui le bloc de relais AVANT qu'il ferme – après, tu n'es plus là.
