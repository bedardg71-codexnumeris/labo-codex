# Consigne de démarrage — la session Cowork qui prend le relais

> **Réécrite le 6 septembre 2026, 10 h 10 (Toronto), par la session Cowork du 6 au matin, après la mesure du PDF, quatre correctifs de
> Grégoire (1.123.2 → 1.123.5) et le cadrage du quatrième audit (les six sous-onglets de Suivi).** **Elle REMPLACE toute version précédente.**
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
2. **`OU-EN-EST-ON.md`** — sections « L'ÉVALUATION » et « LE SUIVI », puis la matinée du 6 (mesure du PDF, 1.123.1 → 1.123.5).
3. **`Rapports/AUDIT-onglet-suivi-2026-09-05.md`**, l'en-tête seulement : le tableau des dispositions (#730 à #754). C'est l'état de
   référence de la chaîne des indices du Suivi.
4. **`Rapports/MESURE-ce-que-l-eleve-lit-dans-le-pdf-2026-09-06.md`** — trois documents, sept blocs ; C1 et C2 corrigés (1.123.1), F1 (#759)
   et F2 (#760) inscrits ; **deux bilans = deux implémentations du même texte** : c'est la première question du cadrage de la synthèse.
5. **`plans de travail/CONSIGNE-DU-JOUR.md`** (écrite le 6 à 10 h 07) et **`Rapports/prompts-audit/PROMPT-AUDIT-sous-onglets-suivi-2026-09-06.md`** —
   le quatrième audit cadré : six sous-onglets, trois axes (logique propre, affichage, sauvegardes), sans coder. **S'il est déposé, lis
   le rapport `Rapports/AUDIT-sous-onglets-suivi-2026-09-XX.md` : c'est ton premier mandat (§4 a).**

⛔ **Ne lis PAS les 130 autres fichiers de `plans de travail/`.**

## 3 · L'ÉTAT MESURÉ — le 6 septembre 2026 à 10 h 09 (Toronto), depuis le Mac, en lecture seule

⚠ **REMESURE-LE.** `git --no-optional-locks log --oneline -7` · `git --no-optional-locks rev-parse --short origin/main` ·
`cat version.json` · `git --no-optional-locks -c core.quotepath=off status --short | grep -v '^??'` · **`TZ=America/Toronto date`**.

- **En ligne : 1.123.5**, build `0906-0902` (`aea9d144`) ; **`main` = `origin/main` = `2fb1facf`**, arbre propre sauf
  `plans de travail/CONSIGNE-DU-JOUR.md` (modifiée par Cowork à 10 h 07 : la consigne de l'audit, l'ancienne archivée à côté sous
  `_ancienne-CONSIGNE-DU-JOUR-2026-09-06-mesure-pdf.md`, à commettre par Claude Code avec son premier commit).
- **Le run serveur de 1.123.5 (`34035446544`) est vert de bout en bout** — Vitest et Playwright WebKit. **La spec du rapport du profil
  (#732) est jugée** : elle a passé avec lui. Les runs de 1.123.2/3/4 ont été annulés par la poussée suivante (concurrence du workflow),
  Vitest vert à chaque fois avant l'annulation.
- **La matinée du 6, dans l'ordre** : le rapatriement de la clôture (`886d9828`, relu par Cowork : ce que le patch du Mac avait de plus
  y est) ; la mesure du PDF sans coder (`d5f911b0`) ; deux textes faux que l'élève lit, corrigés le jour même sur décision de Grégoire
  (1.123.1, `89bcf4a9` : « 63.5 %% » → « 63.5 % » ; le bilan copié vers Léa ne prend plus la copie en cours pour sa propre précédente,
  #757/#758 — relecture croisée de Cowork sur le diff : rien à corriger) ; puis **quatre défauts trouvés par Grégoire sur ses données**
  (SUIVI-BUGS #533-#536, tous de lui, pas des testeurs) corrigés en 1.123.2 → 1.123.5 : vignette d'un travail → page vide (#761),
  « Appliquer au cours actif » n'assignait pas (#762), le Cadre ne montrait pas la pratique appliquée (#763), « Copier tout » incomplet
  sans cartouche et spécifique coupée à 120 caractères (#764).
- **#759 (collage Léa sans sauts de ligne)** : Cowork a recommandé l'option 2 (patch 1.123.6 après avoir mesuré où les sauts se perdent —
  si c'est Léa qui les avale, inscrire sans correctif). **Grégoire n'a pas dit s'il l'a relayée.** Si `version.json` dit 1.123.6, c'est fait.
- **Les coups d'œil à l'écran** : Grégoire a vu le Suivi du groupe en « En attente », le bouton « Rapport », la dernière ligne du texte
  copié (un seul « % »), et « Copier tout » en trois blocs sur 1.123.5. **Quatre gestes attendent un cas réel** (règle du 6, §5) : le
  profil avec brouillon (1.122), la pratique « Modèle simple » (1.122), la reprise réussie (1.123), le bilan avec artefact antérieur (1.123.1).
- **Les trois audits cadrés sont fermés** ; le quatrième est cadré, pas exécuté. Reste à trancher par Grégoire, quand il le voudra,
  **une règle à la fois avec une recommandation** : #700-#705 (moteur), #710-#729 (note du cours), #735-#754 (Suivi), le cadrage
  « non remis par famille ». Trois touchent ce que l'orthopédagogue lira, à proposer en premier : le brouillon compté comme remis et
  la garde qui s'ouvre dessus (#737), les deux paliers sur un même profil (#744), l'anonymisation qui n'anonymise pas le volet (#751).
- **Sa console** — l'artefact « Les huit gestes » (titre à l'écran « Ce qu'il reste à faire »), republiée par Cowork à 9 h 57 ; **plus aucun
  geste dû à l'écran**. **Demande le lien, n'en fabrique pas une seconde** (la galerie n'en a qu'une). Le renommage n'est pas tranché.
- ⚠ La première republication de la matinée a été **refusée par le filtre de permissions** de la session ; Grégoire a redonné l'ordre en
  collant l'URL, et ça a passé. Si ça se reproduit : le dire en une phrase, ne pas contourner.
- ⚠ NFD : `git status` depuis Cowork montre `??` des fichiers suivis (`Modèle de consigne…`, `jean-françois/`, `projet de
  développement/`, `ignorés/`). Tous suivis. Ce n'est pas un défaut.

## 4 · CE QUI EST DÛ — dans l'ordre

### a) Ton mandat d'ouverture : relire le rapport du quatrième audit, puis tenir la console
1. Remesure (§3). **Si `Rapports/AUDIT-sous-onglets-suivi-2026-09-XX.md` est déposé** : relis-le sur le diff réel de la branche
   (`audit/sous-onglets-suivi-2026-09-06`, fusionnée ou non) — chaque « corriger maintenant » a-t-il son attendu / obtenu et sa phrase
   de français ? `js/` est-il intact ? — puis propose à Grégoire **le tableau des « corriger maintenant » en UN tour**, avec une
   recommandation par ligne, comme le 5 au soir (quatre correctifs, une question). Ce qui est règle attend ; ce qui est défaut se
   corrige le jour même (§5).
   **S'il n'est pas déposé** : redonne la ligne à coller — `Lis « plans de travail/CONSIGNE-DU-JOUR.md » et exécute-la.` — et dis en
   deux phrases ce qu'elle produit (un rapport en six sections, rien de neuf à l'écran).
2. Console : après le lot correctif de l'audit, retirer ce qui est livré, ajouter les gestes à voir **que ses données permettent**
   (les autres vont sous « attendent un cas réel »).

### b) Ce qui attend Grégoire, et que tu proposes UNE chose à la fois, avec une recommandation
- **Recueillir ce qui sortira du 14** — personne ne l'a pris, et c'est dans huit jours. **Propose-lui un gabarit de retour à
  corriger** (un texte, pas une question) : le geste essayé, ce que le collègue attendait, ce qu'il a vu, sur quelles données.
  **Le canal (courriel, formulaire, la rencontre elle-même) est SA décision** ; ne le choisis pas. ⚠ Le rapport de bogue intégré
  existe déjà (`BUG_grégoire_2026-09-06_*.txt`, lu par Claude Code ce matin) : **cherche s'il suffit avant de proposer un gabarit neuf**
  — onzième occurrence possible de « ça existe déjà ».
- **La synthèse des rétroactions dans le PDF** — son prochain accent, non daté. **La mesure est faite.** Le cadrage commence par UNE
  question : le bilan du texte Léa est une seconde implémentation du bilan du PDF — les ramener à une seule, laquelle ? Propose-la
  avec une recommandation, quand il ouvre le sujet, pas avant.
- **Les règles inscrites** (§3) — seulement quand il le demande ; ne les remonte pas en rafale.

### c) Fin de chaque lot : `OU-EN-EST-ON.md`, sa console, ce fichier (règle 6). Sans qu'il le demande, une ligne pour dire ce qui a changé.

### d) Dû par Grégoire, à ne pas coder à sa place
Le canal des retours du 14 ; l'arbitrage des règles inscrites ; le renommage de la page ; les quatre gestes qui attendent un cas réel.

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

- ⚠ **Nouveau le 6 au matin, dans ses mots : il ne crée pas de données fictives pour vérifier un geste à l'écran.** Un geste que la
  configuration de son groupe-cours actif ne permet pas (une reprise réussie, une pratique « Modèle simple ») **attend un cas réel** — les
  retours des testeurs, ou son trimestre quand il y arrive. ⮕ **La console ne lui doit que ce que ses données permettent de voir** ; le
  reste va sous « attendent un cas réel », avec la phrase qui dit que la sentinelle et le break-test le prouvent déjà.

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

### Et le 6 au matin — Cowork, deux choses rattrapées, une payée

30. **La console lui a compté « cinq gestes dus » puis « sept », dont quatre que ses données ne permettent pas** (un élève qui a
    repris et réussi, une pratique « Modèle simple » sur Projet + Examen…). C'est lui qui l'a dit, en une phrase, et il a dû
    l'expliquer. ⮕ **Avant de porter un geste « dû par toi », demande-toi si SON groupe-cours actif le permet sans données fictives.**
    Sinon, « attend un cas réel ».
31. **Presque écrit que « les testeurs rapportent enfin »** (quatre bogues en une matinée). Vérifié dans `SUIVI-BUGS.md` avant
    d'écrire : les quatre venaient de Grégoire lui-même. L'angle mort tient. ⮕ **Qui a rapporté se lit dans la colonne « source »,
    pas dans le nombre de fiches.**
32. **Une republication d'artefact refusée par le filtre de la session**, dite en une phrase, sans contournement ; Grégoire a redonné
    l'ordre. ⮕ Rien à changer, c'est la bonne conduite ; noté pour que la prochaine session ne s'y perde pas.
33. **Ce qui a tenu** : C1/C2 arbitrés en un tour (recommandation (a), les deux le jour même — sa règle du 5) ; la relecture croisée sur
    le diff réel avant de mettre la console à jour ; le quatrième audit cadré comme COMPLÉMENT du troisième, périmètre recompté au
    `grep`, et non comme une redite ; l'heure lue dans la même commande que l'écriture, à chaque fois.

---

## 7 · LA DATE QUI COMPTE

**Le 14 septembre 2026, dans huit jours** — la communauté de pratique se réunit pour la première fois, une vingtaine de membres.
**Ce n'est pas la date où ces gens arrivent : c'est celle où ils se parlent.**

⚠ **L'angle mort tient toujours** : tout ce qui est ouvert vient de Grégoire ; **les quatre bogues du 6 au matin sont les siens**, le
dernier retour de testeur date du 26 août. Cinq correctifs et un audit cadré sont sortis d'une matinée, et **toujours rien pour
recueillir ce que vingt personnes diront le 14**. C'est le seul point que personne n'a pris, et c'est le premier de ton §4 b.
