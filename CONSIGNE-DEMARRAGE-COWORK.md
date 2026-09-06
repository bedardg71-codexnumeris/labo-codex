# Consigne de démarrage — la session Cowork qui prend le relais

> **Réécrite le 6 septembre 2026, 6 h 19 (Toronto), par la session Cowork du 5 septembre au soir, après le lot du Suivi (1.123.0), la
> clôture faite à distance et le redémarrage du Mac.** **Elle REMPLACE toute version précédente.**
>
> ⚠ **Ce fichier porte un nom sans date, exprès.** La date d'écriture est en tête ; c'est elle qui fait foi.
> ⛔ **Il ne porte que ce qui PÉRIME** : l'état mesuré, le mandat, ce qui est dû, et les erreurs déjà payées. Ce qui a survécu
> à trois sessions monte dans `PROTOCOLE.md` et quitte ce fichier.

---

## 1 · CE QUE TU ES, ET CE QUE TU N'ES PAS

**Le dispositif est à trois, et les canaux ne se croisent pas.** Grégoire décide, relaie, et fait tourner l'application sur ses
vraies données. **Toi, Cowork** : tu **mesures** le dépôt en lecture seule, tu **rédiges** les consignes, tu **relis** ce qui ne
se reprend pas, et tu tiens ses fichiers de cadrage et sa console. **Claude Code exécute** et livre.

⛔ **TU NE PARLES PAS À CLAUDE CODE.** Ce que tu as à lui transmettre va dans un **bloc de code**, dans le message, précédé de
« Pour Claude Code, à relayer » — **jamais dans un artefact**, **jamais avec des retours à la ligne manuels**. Une consigne longue
va dans un FICHIER (`plans de travail/CONSIGNE-DU-JOUR.md`) et le bloc ne porte qu'une ligne.
⚠ **TU N'ÉCRIS PAS DANS `js/`.** Un fichier temporaire va dans `$HOME` ; ce qui doit rester à portée de Claude Code va dans
`_to_delete/` (ignoré par git). ⚠ **`git --no-optional-locks status`**, jamais `git status` nu : le verrou bloque Claude Code.
⚠ **Ce shell n'a pas de réseau** : `git fetch` échoue, `origin/main` est la dernière valeur POUSSÉE DEPUIS CE MAC. Une session
Claude Code à distance peut avoir poussé plus loin sans que ce Mac le sache — voir §3.

---

## 2 · À LIRE D'ABORD, DANS CET ORDRE

1. **`PROTOCOLE.md`** — les sept règles.
2. **`OU-EN-EST-ON.md`** — sections « L'ÉVALUATION » et « LE SUIVI » : les trois audits et leurs lots.
3. **`plans de travail/00-CADRAGES-OUVERTS.md`**, section « La série d'audits cadrés » — les trois sont fermés ; ce qui reste
   est ce qu'ils ont inscrit.
4. **`Rapports/AUDIT-onglet-suivi-2026-09-05.md`**, l'en-tête seulement : le tableau des dispositions arrêtées (corrigé /
   inscrit / tenu / commenté, avec les fiches #730 à #754). C'est l'état de référence du Suivi.
5. **`plans de travail/CONSIGNE-PROCHAINE-SEANCE.md`** — ce que Claude Code fait dans la séance qui te précède ou qui tourne
   pendant la tienne (rapatrier la clôture sur le Mac, puis mesurer ce que le PDF de l'élève rend, sans coder).

⛔ **Ne lis PAS les 130 autres fichiers de `plans de travail/`.**

## 3 · L'ÉTAT MESURÉ — le 6 septembre 2026 à 6 h 11 (Toronto), depuis le Mac, en lecture seule

⚠ **REMESURE-LE.** `git --no-optional-locks log --oneline -7` · `git --no-optional-locks rev-parse --short origin/main` ·
`cat version.json` · `git --no-optional-locks -c core.quotepath=off status --short | grep -v '^??'` · **`TZ=America/Toronto date`**.

- **En ligne : 1.123.0**, build `0905-2025` (`507b7229`, poussée le 5 à 20 h 41). Le lot du Suivi (#730 à #734) : une reprise ne
  compte plus deux fois dans le dépistage ; « Non-participation » seulement quand un travail est dû ET qu'une copie du groupe est
  évaluée (règle de Grégoire, 5 sept.) ; le rapport du profil se génère et lit la même source que le profil ; règle 1 sur trois
  lignes ; les courbes P des archives sont celles de l'élève. Relecture croisée de Cowork sur le diff : rien à corriger, une réserve
  inscrite (la garde s'ouvre sur un brouillon, #731 → #737).
- **Sur GitHub, `main` = `0896e535`** (clôture réécrite et poussée à distance, SESSION 30, après le redémarrage du Mac).
  **Sur le Mac, `main` = `origin/main` = `c4ac5ae3`** (correctif de la spec #732, poussé le 5 à 23 h 45), avec **trois brouillons
  non commités** (`OU-EN-EST-ON.md`, `RELAIS.md`, `SESSION.md`) — copie sauvée dans `_to_delete/brouillons-cloture-5-sept-mac.patch`.
  **Le rapatriement est la première chose que Claude Code fait sur le Mac** (consigne de la prochaine séance, temps 0). Tant qu'il
  n'est pas fait, `git log` sur le Mac ment de un commit.
- **Les runs GitHub** : `34001941420` (1.123.0) rouge par la spec neuve seule, tout le reste vert — **le code du lot est jugé** ;
  `34009795798` (`c4ac5ae3`) rouge par perte du runner (« shutdown signal ») après 220 tests verts sur 264, 0 rouge — la spec
  corrigée n'est **ni prouvée ni infirmée**. Décidé par Cowork : pas de relance, le prochain push la juge (règle 7, ajout du 4 sept.).
  Si ce run-là rougit sur `profil-rapport-732-se-genere.spec.js`, c'est la spec, pas l'application.
- **Les trois audits cadrés sont fermés**, dispositions écrites dans chaque rapport. Reste à trancher par Grégoire, quand il le
  voudra, **une règle à la fois avec une recommandation** : #700-#705 (moteur), #710-#729 (note du cours), #735-#754 (Suivi), le
  cadrage « non remis par famille ». Trois touchent ce que l'orthopédagogue lira, à proposer en premier : le brouillon compté comme
  remis et la garde qui s'ouvre dessus (#737), les deux paliers sur un même profil (#744), le mode anonymisation qui n'anonymise pas
  le volet confidentiel (#751).
- **Sa console** — l'artefact « Les huit gestes » (titre à l'écran « Ce qu'il reste à faire »), republiée le 6 à 6 h 15 ; Claude Code
  l'a aussi republiée à 0 h 35 depuis sa session à distance (fusion propre). **Demande le lien, n'en fabrique pas une seconde.** Le
  renommage du nom de galerie n'est pas tranché.
- ⚠ NFD : `git status` depuis Cowork montre `??` des fichiers suivis (`Modèle de consigne…`, `jean-françois/`, `projet de
  développement/`, `ignorés/`). Tous suivis. Ce n'est pas un défaut.

## 4 · CE QUI EST DÛ — dans l'ordre

### a) Ton mandat d'ouverture : relire le rapatriement, puis tenir la console
1. Remesure (§3). Si `main` sur le Mac est passé à `0896e535` ou plus loin et que les trois documents ne sont plus modifiés, le
   rapatriement est fait : relis le commit de réconciliation (ce que le patch du Mac avait de plus est-il dans les blocs commis ?)
   et dis-le en une ligne. Sinon, redonne la ligne à coller : `Lis « plans de travail/CONSIGNE-PROCHAINE-SEANCE.md » et exécute-la.`
2. Console : retire « rapatrier la clôture » quand c'est fait ; retire chaque geste à l'écran quand Grégoire dit l'avoir vu (cinq
   sont dus : deux sur 1.122, trois sur 1.123 — la liste est sur la page).

### b) Ce qui attend Grégoire, et que tu proposes UNE chose à la fois, avec une recommandation
- **Recueillir ce qui sortira du 14** — personne ne l'a pris, et c'est dans huit jours. **Propose-lui un gabarit de retour à
  corriger** (un texte, pas une question) : ce qu'un collègue écrit après avoir essayé un geste — le geste, ce qu'il attendait, ce
  qu'il a vu, sur quelles données. **Le canal (courriel, formulaire, la rencontre elle-même) est SA décision** ; ne le choisis pas.
- **La synthèse des rétroactions dans le PDF** — son prochain accent, non daté. Avant tout cadrage, Claude Code MESURE ce que le
  PDF rend (consigne de la prochaine séance, temps 2). Quand le rapport de mesure est déposé, tu le relis et tu lui proposes un
  cadrage court, une décision à la fois.
- **Les règles inscrites** (§3) — seulement quand il le demande ; ne les remonte pas en rafale.

### c) Fin de chaque lot : `OU-EN-EST-ON.md`, sa console, ce fichier (règle 6). Sans qu'il le demande, une ligne pour dire ce qui a changé.

### d) Dû par Grégoire, à ne pas coder à sa place
Les cinq gestes à l'écran (console) ; le canal des retours du 14 ; l'arbitrage des règles inscrites ; le renommage de la page.

## 5 · COMMENT GRÉGOIRE VEUT QU'ON LUI PARLE

*Ce ne sont pas des préférences de style. Ce sont les conditions pour qu'il puisse décider.*

- ⚠⚠ **Ce qui le met en surcharge n'est PAS la quantité de travail d'une séance, c'est la quantité d'information par TOUR.** Une
  séance peut avoir dix tours et trois lots ; **chaque tour n'a qu'un objet**. Il prend ses pauses lui-même.
- **UNE SEULE IDÉE PAR RÉPONSE.** ⚠ C'est la règle qui se perd en session longue — **revérifie-la avant chaque réponse.**
- **Pose ta question au moment où elle se pose**, et **ne reviens jamais trois tours plus tard** sur un item présenté avant. Ce qui
  doit attendre va dans un fichier ou dans sa console.
- **Toujours une recommandation argumentée**, jamais un exposé d'options neutre. **Propose-lui un texte à corriger** plutôt que de
  lui demander d'en composer un. **Jamais un numéro de fiche sans sa phrase en français** ; les numéros entre parenthèses, en fin
  de ligne. Tutoiement, guillemets français, réponse courte d'abord.
- ⚠ **Nouveau le 5 au soir, dans ses mots : « Les corrections ne se font pas après le 14 septembre, elles se font ce soir. »**
  Un « corriger maintenant » proposé par un audit se fait le jour même ; **ne propose plus « après le 14 » pour un correctif**. Ce
  qui reste après le 14, ce sont les RÈGLES à trancher, pas les défauts. (L'erreur 21 du 4 sept., refaite dans la consigne du 5 :
  c'est lui qui l'a corrigée, encore.)

### Ce qui remonte jusqu'à lui, et rien d'autre
La **didactique** · ses **données réelles** · les **mots que ses élèves et ses collègues lisent** · ce qui **l'engage publiquement**.
⮕ **Tout le reste, tu le tranches seul et tu le dis en une ligne, en nommant ce que tu as supposé.** Le 5 au soir, ça a tenu :
l'arbitrage de quatre correctifs a pris UN tour et UNE question (la règle didactique de « Non-participation »).

---

## 6 · LES ERREURS QUE COWORK A DÉJÀ PAYÉES — ne les refais pas

*Les 2 et 3 septembre. Elles sont écrites parce qu'elles se ressemblent toutes.*

1. **Une consigne d'hier promue sans remesure.** Le rapport portait déjà ses dispositions depuis
   la veille, et le site visé était corrigé. C'est Claude Code qui l'a signalé. ⮕ **Règle 1 :
   remesure avant de relayer, même ton propre texte de la veille.**
2. **Un zéro annoncé sans son témoin** — deux fois. « Il n'y a rien » n'est pas une mesure tant
   que la commande qui rend zéro n'est pas montrée. ⮕ **Aucune ancre sans sa preuve ET son
   témoin.**
3. **« Neuf autres plans » annoncés sur la foi d'un `head -14`.** Il y en avait 126.
4. **Un manque annoncé sans avoir lu le bloc jusqu'au bout.** La consigne du lot 1 exigeait
   d'ajouter `type` au schéma d'import — **il y était déjà** (`js/import-export.js:737`) ; le
   schéma commence à 610 et finit à 748, et la lecture s'était arrêtée en chemin. **Claude Code a
   vérifié au lieu d'obéir, et il a eu raison.** ⮕ **Une consigne peut se tromper. Dis-lui de
   mesurer, pas de te croire.**
5. **La nomenclature confondue.** Un **code** identifie et compte (rattaché aux sous-critères) ;
   un **tampon** commente et se restitue. Un cadrage entier et un module portaient le mauvais nom.

### Et le 4 septembre — quatre choses qui n'ont PAS coûté, parce qu'elles ont été mesurées à temps

6. **Un bloc relayé n'est pas un bloc appliqué.** Grégoire avait transmis la décision du menu ;
   Claude Code avait lancé la suite et n'avait rien changé. Mesuré avant de le croire :
   `grep "critères sont tous" js/` rendait 0 avec son témoin. ⮕ **Après un relais, remesure
   ce qui devait changer, pas ce que le rapport dit.**
7. **En relayant une décision, Cowork l'avait ÉTENDUE** (la ligne parlerait aussi quand les types
   divergent). C'était son ajout, pas la décision. Retiré quand la note de la session précédente
   a montré l'écart. ⮕ **Relaie la décision au mot ; ce que tu ajoutes, tu le nommes comme tien.**
8. **Un `grep` littéral qui rend zéro sur un nom CONSTRUIT.** `data-on-input` n'apparaît nulle part
   dans `main.js`, parce que l'attribut y est assemblé (`'data-on-' + eventType`, `main.js:1330`).
   Un zéro qui ressemblait à un défaut bloquant. ⮕ **Devant un zéro, cherche la construction
   avant d'annoncer l'absence.**
9. **Le badge MIXTE que Grégoire croyait fautif** : Cowork a dit « je ne retrouve pas ce
   comportement dans le code » et a demandé un regard de trente secondes, au lieu d'inventer une
   cause. C'était une erreur de manipulation. ⮕ **Ne pas retrouver, c'est une réponse.**

10. **Trois dossiers annoncés « non suivis » qui l'étaient** (4 septembre au soir, corrigé le 4 au
    matin). Le montage Linux de Cowork rend les noms de fichiers en **NFD** (`franc\u0327ois`) ;
    le dépôt les suit en **NFC** (`français`, `core.precomposeunicode=true`). `git status` depuis
    Cowork montre donc comme non suivis des fichiers suivis, et comme non ignorés des dossiers
    ignorés — et une question est montée jusqu'à Grégoire pour rien. ⮕ **Devant un « non suivi »
    qui porte un accent, normalise en NFC et cherche dans `git ls-files` avant de l'annoncer.**

11. **Une consigne qui nommait « le PDF de l'élève » sans avoir mesuré combien de textes l'élève
    lit.** La consigne du lot 3 visait un site ; il y en avait **quatre** (l'aperçu enseignant,
    la synthèse PDF, le texte copié vers LÉA, et le bilan — **deux bilans distincts**, un dans
    l'app, un dans le PDF). Deux retouches, trouvées par Grégoire à l'écran, pas par la
    relecture. ⮕ **« Ce que l'élève lit » est un PÉRIMÈTRE à mesurer (grep des rendus), pas un
    fichier.**
12. **Un banc vert sur une grille MIXTE ne prouve rien pour une grille ENTIÈREMENT analytique.**
    Le spec du lot 3 rouvrait une copie dont le premier critère avait un menu ; la régression
    (timeout au rechargement, cadenas absent) ne se voyait que si le PREMIER critère est
    analytique. Trouvée par Grégoire, cause mesurée par Cowork en un `grep`
    (`attendreSelectsCriteres`). ⮕ **Quand un lot change ce qui ENTRE dans une structure, le banc
    doit couvrir le cas où la structure n'a QUE du neuf.**
13. **Deux questions montées à Grégoire pour rien, parce que la mesure aurait suffi** : les
    dossiers « non suivis » (erreur 10), et « distinguer la pénalité de la projection » — l'option
    « Aucune projection » existait (`evaluation-projection.js:232`). **Six fois en trois jours**,
    ce qu'il demande existe déjà sous un autre nom. ⮕ **Avant de remonter une question, `grep`
    la demande dans `js/` ; la réponse y est une fois sur deux.**

14. **Des heures écrites de mémoire au lieu d'être lues.** Cowork a daté ses fichiers « 9 h 30 »,
    « 9 h 45 », « 10 h » alors que l'horloge de Toronto disait 7 h 25 à 7 h 40 (témoin : le
    build `0904-0729` et le push `7a197996` à 7 h 32). Corrigé après coup, dans sept fichiers.
    ⮕ **Toute heure qu'on écrit se lit d'abord : `TZ=America/Toronto date`.** L'horloge du montage
    est en UTC ; la date en tête d'un fichier « fait foi » — elle doit donc être mesurée.

15. **Deux leviers de CI proposés à Grégoire sans avoir lu `tests.yml`** (4 septembre, 16 h) : les shards
    et les runs parallèles. Le fichier portait, en commentaire, la décision du 2 septembre qui les
    écartait (« ils raccourcissent l'attente, pas la facture ») et le quota déjà épuisé. Retirés au tour
    suivant, dit comme une correction. ⮕ **Avant de proposer sur la CI, lis `tests.yml` : ses commentaires
    sont un journal de décisions.**
16. **L'erreur 14, REFAITE le jour même** : Cowork a daté sa relecture « 15 h 30 », les retouches « 16 h 15 »,
    « 17 h », les mots « 17 h 50 » — les commits disent 11 h 20, 12 h, 13 h, 14 h 15. **Quatre heures
    d'écart, et Claude Code a recopié « 17 h 50 » dans un message de commit.** Corrigé le soir dans quatre
    fichiers ; la console porte encore « 15 h 30 ». ⮕ **`TZ=America/Toronto date` AVANT chaque heure
    écrite, sans exception.** Une heure « vers » qui n'a pas été lue est une heure fausse.
17. **Sept retouches pliées dans la release parce qu'elles sont nées du coup d'œil.** Le code du lot 4 a
    pris 48 min ; 2 h 20 de retouches ont suivi, une seule corrigeait quelque chose de cassé. Grégoire a
    situé l'attente ailleurs (la CI) et a gardé sa règle d'une livraison par séance ; la proposition
    « cassé → maintenant, envie → lot suivant » **n'a pas été adoptée** — elle vit dans la consigne du
    texte troué comme ordre de séance, pas comme règle. ⮕ **Ne la présente pas comme acquise.**

### Et le 4 septembre au soir — Cowork, cinq erreurs, toutes corrigées après coup

18. **Un fichier écrit dans `js/`** — interdit à Cowork. En comparant l'ancien et le nouveau module de projection,
    Cowork a copié l'ancien dans `js/_ep_avant_tmp.js` pour le charger par `require`. `rm` est refusé depuis
    le montage ; déplacé dans `_to_delete/` (ignoré). ⮕ **Un fichier temporaire va dans `$HOME`, et un module
    ancien se charge par un chemin absolu hors du dépôt.** Dit à Grégoire au tour suivant.
19. **L'erreur 14, refaite DEUX fois le même soir** : « 18 h 55 » écrit à 18 h 38, « 19 h 15 » écrit à 19 h 12.
    Corrigé les deux fois, mais après coup. ⮕ **`TZ=America/Toronto date` dans la même commande que l'écriture,
    et l'heure recopiée depuis sa sortie, jamais tapée.**
20. **La console a dit « cadré, pas commencé » d'un mécanisme livré la veille** (les codes par grille,
    `codes-annotation.js`, quatre commits du 3). La page précédente le disait déjà, Cowork l'a recopié sans
    mesurer. Trouvé en préparant la consigne du 5. ⮕ **Huitième occurrence du motif « ça existe déjà »** — et
    la première où c'est la console elle-même qui se trompait. Avant de porter un item « cadré », `git log
    --oneline -- <fichier du cadrage>` et `grep` du mécanisme dans `js/`.
21. **« Après le 14 » décidé pour Grégoire, sur une lecture fausse de sa surcharge** (voir §5). Il a corrigé :
    la maturité au 14 est SA priorité ; ce qui reste après, c'est ce qui ne peut pas servir avant (le recalcul
    sans évaluations). ⮕ **L'adoption est sa décision, pas une variable de charge.**
22. **L'étape 3 du texte troué appelée « finition »** sans avoir relu la carte, qui la nomme « les badges dans
    la phrase », un composeur neuf. Corrigé au tour suivant. ⮕ **Un chantier ne se qualifie qu'après lecture
    de sa carte.**

### Et le 5 septembre — quatre choses, deux payées, deux rattrapées

23. **La console a oublié un lot que Grégoire venait de décider** (l'étape 3, 8 h 59 → 9 h 01) : il a dû demander « as-tu
    ajouté l'étape 3 au menu du jour ? ». ⮕ **Une décision de Grégoire va dans la console au tour même où elle est prise**, pas
    au prochain lot.
24. **Une phrase lue par les collègues, proposée et jamais relayée** (« #581 », 7 h 50) : 1.118 puis 1.119 sont parties avec.
    Rangée dans le cadrage « Bilan », mais c'est un mot d'utilisateur qui attend depuis deux livraisons. ⮕ **Une correction de
    mots proposée à Grégoire a besoin de SA réponse avant la release ; sinon, la redemander au moment des mots du changelog.**
25. **Deux heures TAPÉES et rattrapées avant publication** (Cowork : « 8 h 05 » à 8 h 03 ; « 8 h 50 » pour une décision prise
    entre 8 h 53 et 8 h 58) ; et **une tapée par Claude Code** dans une carte (« 9 h 35 » à 9 h 27), vue à la relecture.
    ⮕ L'erreur 14 en est à sa **septième occurrence** en deux jours : **lire l'heure dans la même commande que l'écriture**.
26. **Le mécanisme d'aperçu de PR existait pour exactement le besoin du jour** (éprouver sur iPad avant la fusion,
    `netlify.toml` l. 29-31) et il a été retrouvé en lisant le fichier, pas de mémoire. ⮕ **Dixième occurrence de « ça existe
    déjà »**, cette fois payante : lire la configuration avant de proposer une voie.

### ▣ Et un motif qui est revenu HUIT fois en trois jours
**« Ce que Grégoire demande existe déjà, ailleurs, sous un autre nom. »** L'écran de
personnalisation des codes, les bornes d'échelle, le seuil de réussite, les collections de
paramètres, les paliers d'une grille analytique (l'échelle), « Aucune projection », et le 4 septembre
la personnalisation des codes d'annotation (Annoter › palette, et la case « utiliser ces sous-critères
comme codes » qu'il avait sous les yeux), et le 4 au soir **les codes par grille eux-mêmes, livrés la veille et
portés « cadré » par la console**. ⮕ **Avant de cadrer un mécanisme neuf, cherche s'il existe déjà.** Le plus souvent,
ce qui manque n'est pas le mécanisme : c'est le chemin pour le trouver.

---


### Et le 5 septembre au soir, puis le 6 au matin — trois choses, une payée

27. **Un relais qui supposait que Claude Code tournait SUR LE MAC.** La session de clôture a tourné à distance (branche
    `claude/closure-…`, dépôt cloné) : elle a vu un arbre propre à `2a05b188`, pendant que les trois brouillons de clôture, écrits par
    la session interrompue, restaient sur le Mac. Elle a réécrit la clôture depuis les commits et l'a poussée ; le Mac est resté un
    commit derrière, avec ses brouillons. Rattrapé par Cowork au réveil (patch sauvé, consigne de rapatriement). ⮕ **Un relais nomme
    OÙ la session tourne, et ce qu'elle trouvera dans l'arbre à cet endroit-là.** Et « `main` = `origin/main` » mesuré depuis ce
    shell sans réseau ne dit rien de GitHub : c'est la dernière valeur poussée depuis CE Mac.
28. **« Après le 14 » écrit une seconde fois pour des correctifs** (consigne du 5 au soir, §4 c). Grégoire l'a corrigé en une phrase.
    ⮕ Voir §5 ; c'est l'erreur 21, et elle a coûté un tour.
29. **Ce qui a tenu** : quatre correctifs arbitrés en un tour, une seule question (didactique), le relais dans un fichier, la relecture
    croisée sur le diff réel avant la release, le geste à l'écran nommé avant le push. **Et un run perdu par le serveur lui-même**
    (« shutdown signal » après 220 tests) : ce n'est ni la spec ni le code — **un run coupé n'est pas un run rouge**, il ne prouve rien
    dans aucun sens.

---

## 7 · LA DATE QUI COMPTE

**Le 14 septembre 2026, dans huit jours** — la communauté de pratique se réunit pour la première fois, une vingtaine de membres.
**Ce n'est pas la date où ces gens arrivent : c'est celle où ils se parlent.**

⚠ **L'angle mort tient toujours** : tout ce qui est ouvert vient de Grégoire ; le dernier retour de testeur date du 26 août. Le 5,
trois audits et cinq correctifs sont sortis d'une seule journée, et **toujours rien pour recueillir ce que vingt personnes diront le
14**. C'est le seul point que personne n'a pris, et c'est le premier de ton §4 b.
