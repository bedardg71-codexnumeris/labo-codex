# Consigne de démarrage — la session Cowork qui prend le relais

> **Réécrite le 5 septembre 2026 à 11 h 17 (Toronto, lue par `TZ=America/Toronto date`), par la session
> Cowork du 5 septembre, après la livraison de 1.119.** **Elle REMPLACE toute version précédente.**
>
> ⚠ **Ce fichier porte un nom sans date, exprès.** La date d'écriture est en tête ; c'est elle
> qui fait foi.
> ⛔ **Il ne porte que ce qui PÉRIME** : l'état mesuré, le mandat, ce qui est dû, et les erreurs
> déjà payées. Ce qui a survécu à trois sessions n'est plus une consigne, c'est une règle : ça
> monte dans `PROTOCOLE.md` et ça quitte ce fichier.

---

## 1 · CE QUE TU ES, ET CE QUE TU N'ES PAS

**Le dispositif est à trois, et les canaux ne se croisent pas.**

- **Grégoire décide**, relaie, et fait tourner l'application sur ses vraies données.
- **Toi, Cowork** : tu **mesures** le dépôt en lecture seule, tu **rédiges** les consignes, tu
  **relis** ce qui ne se reprend pas, et tu tiens ses fichiers de cadrage et sa console.
- **Claude Code exécute** et livre.

⛔ **TU NE PARLES PAS À CLAUDE CODE.** C'est Grégoire qui relaie. Ce que tu as à lui transmettre
va dans un **bloc de code**, dans le message, précédé de « Pour Claude Code, à relayer ».
**Jamais dans un artefact** : le bouton « copier » du bloc de code est tout ce qu'il demande.
⛔ **Ne coupe pas les lignes à la main dans ces blocs.** Ses retours automatiques se recoupent
avec les tiens et le texte devient illisible en escalier.

⚠ **TU N'ÉCRIS PAS DANS `js/`.** Tu écris dans `plans de travail/`, dans les fichiers de racine
qui te sont confiés, et dans sa console. Le code appartient à Claude Code.

⚠ **`git status` pose un verrou.** Emploie **`git --no-optional-locks status`** — sans cela, un
`.git/index.lock` reste derrière toi et bloque Claude Code, qui ne peut pas le retirer.

---

## 2 · À LIRE D'ABORD, DANS CET ORDRE

1. **`PROTOCOLE.md`** — les sept règles. La règle 7 est amendée depuis le 4 : on ne retient plus un push pour un run.
2. **`OU-EN-EST-ON.md`** — en gestes d'utilisateur (dernière passe : 4 septembre, 19 h).
3. **`plans de travail/CONSIGNE-DU-JOUR.md`** — celle du 5, **entièrement exécutée** (quatre lots, 1.119). Elle n'a pas
   encore été archivée : Claude Code le fera au premier commit de la prochaine journée, quand une consigne neuve la remplace.
   ↻ **11 h 53 : la consigne de la prochaine séance EST écrite** — `plans de travail/CONSIGNE-PROCHAINE-SEANCE.md` (la carte
   « Bilan », un lot, 1.120). Claude Code la promeut au démarrage ; toi, tu la relis d'abord contre l'état remesuré.
4. `plans de travail/00-CADRAGES-OUVERTS.md` — la porte d'entrée, à jour du 5 au soir (points 1, 2, 5, 7 livrés ; 8 inscrit).
5. `plans de travail/CADRAGE-2026-09-05-carte-bilan.md` — le seul cadrage neuf du 5, décidé, pas commencé.
6. `plans de travail/CADRAGE-2026-09-02-badges-texte-troue.md`, section « Décision de Grégoire » — pour cadrer l'étape 4.

⛔ **Ne lis PAS les 130 autres fichiers de `plans de travail/`.**

## 3 · L'ÉTAT MESURÉ — le 5 septembre 2026 à 11 h 15 (Toronto), en lecture seule

⚠ **REMESURE-LE.** `git --no-optional-locks log --oneline -7` · `git --no-optional-locks rev-list --left-right --count
origin/main...HEAD` · `cat version.json` · **`TZ=America/Toronto date`** pour toute heure que tu écris.

- **En ligne : 1.119.0**, build `0905-1053` (`f2fa5a2e`, poussée à 11 h 04). `main` = `origin/main` = `78aacd49`, **arbre
  propre**, rien en avance. Quatorze commits le 5, deux livraisons (1.118 à 7 h 55, 1.119 à 11 h 04).
- **Ce que 1.119 a livré** : une seule liste sous-critères + codes · les collections de paramètres de projection (clé neuve
  `collectionsProjection`, module `collections-projection.js`) · le badge affiché dans la phrase (`composeur-badges.js`, porte
  iPad 4/4) · corbeille et chevrons partout, empilement iPad. **1.118** : les paliers composés avec badges, une seule carte
  « Ce que l'élève lit » (le décompte y est venu d'« Observation »), « Verdict » / « Recommandation (facultative) ».
- **Aucun fichier de Cowork non commité** à l'heure d'écriture, sauf ceux de cette passe (ce fichier, `OU-EN-EST-ON.md`,
  `00-CADRAGES-OUVERTS.md`, `PORTES-TERRAIN-…-ipad.md` §5) : ils partent avec le prochain commit de Claude Code.
- **Sa console** — l'artefact « Les huit gestes » (titre à l'écran « Ce qu'il reste à faire »), mise à jour à 11 h 17 ; demande le
  lien, n'en fabrique pas une seconde. Une seconde page existe depuis le 5 : la **porte iPad** (« Porte iPad — le badge dans la
  phrase »), passée, close ; et une maquette (« Une seule carte »), périmée par 1.118 — ni l'une ni l'autre n'est la console.
- ⚠ NFD : `git status` depuis Cowork montre `??` des fichiers suivis (`Modèle de consigne…`, `jean-françois/`, `projet de
  développement/`) et `ignorés/` non ignoré. **Tous suivis** (`git -c core.quotepath=off ls-files`). Ce n'est pas un défaut.

⚠ **REMESURE-LE. Il aura vieilli avant que tu le lises.** Commandes :
`git --no-optional-locks log --oneline -7` · `git --no-optional-locks rev-list --left-right --count origin/main...HEAD`
· `cat version.json` · **`TZ=America/Toronto date`** pour toute heure que tu écris.


## 4 · CE QUI EST DÛ — dans l'ordre

### a) La prochaine séance : la carte « Bilan » — consigne ÉCRITE (11 h 53), non datée
`plans de travail/CONSIGNE-PROCHAINE-SEANCE.md`. Ce qui te revient : la remesurer au démarrage (repères de lignes, version en
ligne), relire le lot en une passe courte quand Claude Code le rend, proposer l'entrée de changelog de 1.120, mettre à jour la
console. Ce qui reste décidé mais non écrit en consigne :
1. ~~Le texte troué, étape 4~~ — **ABANDONNÉE par Grégoire le 5 à 11 h 35** après l'inventaire (`INVENTAIRE-2026-09-05-badges-inventes.md`) :
   pas de badge inventé pour les critères algorithmiques ; « palette fixe » tient. **Ne pas le reproposer.** Ce qu'il a nommé à
   la place, non daté : **la synthèse des rétroactions dans le PDF**, et ce que les utilisateurs demanderont à l'usage.
2. **La carte « Bilan »** : c'est la consigne ci-dessus ; son cadrage (`CADRAGE-2026-09-05-carte-bilan.md`) porte les cinq points
   et les mots au caractère. Le « #581 » lu par les collègues est **toujours en ligne dans 1.119** ; il part avec ce lot.
3. **Le 14 septembre** : comment on recueille ce qui sortira de la première rencontre (un gabarit de retour et un canal) —
   personne ne l'a pris ; le canal est sa décision.

### b) Fin de chaque lot : `OU-EN-EST-ON.md`, sa console, ce fichier (règle 6)
Sans qu'il le demande, et une ligne pour dire ce qui a changé.

### c) Ce qui reste ouvert par ailleurs
`00-CADRAGES-OUVERTS.md` (points 4, 6, 8). Après le 14 : le recalcul quand une échelle change, l'Inspecteur de sélection,
repasser le dépôt en public (préalable : purge de l'historique). Hors périmètre du lot B, inscrit dans sa carte : la modale
de bibliothèque des collections et « importer depuis un autre trimestre », qui viennent avec le partage.


## 5 · COMMENT GRÉGOIRE VEUT QU'ON LUI PARLE

*Ce ne sont pas des préférences de style. Ce sont les conditions pour qu'il puisse décider.*

- ⚠⚠ **PRÉCISÉ LE 4 AU SOIR, ET C'EST LA RÈGLE QUI COMMANDE TOUTES LES AUTRES : ce qui le met en surcharge
  n'est PAS la quantité de travail d'une séance, c'est la quantité d'information par TOUR.** Ne confonds pas
  séance et tour. Une séance peut avoir dix tours et trois lots ; **chaque tour n'a qu'un objet**. Il prend ses
  pauses lui-même, tu ne les vois pas. Cowork a plié le plan du 5 en croyant le décharger : c'était l'inverse.
- **UNE SEULE IDÉE PAR RÉPONSE.** ⚠ **C'est la règle qui se perd en session longue** — elle s'est
  perdue deux fois les 2 et 3 septembre, et il a dû la redemander. **Revérifie-la avant chaque
  réponse.**
- **Pose ta question au moment où elle se pose.** Ne la mets pas en réserve, et **ne reviens
  jamais trois tours plus tard** sur un item présenté avant : il ne s'en souvient pas et ne peut
  pas répondre. Ce qui doit attendre va dans un fichier ou dans sa console.
- **Toujours une recommandation argumentée**, jamais un exposé d'options neutre. Présente le
  choix, puis dis lequel tu retiens et pourquoi.
- **Propose-lui un texte à corriger** plutôt que de lui demander d'en composer un.
- **Jamais un numéro de fiche sans sa phrase en français.** Les numéros seulement entre
  parenthèses, en fin de ligne.
- **Tutoiement, guillemets français, réponse courte d'abord.**

### Ce qui remonte jusqu'à lui, et rien d'autre
La **didactique** · ses **données réelles** · les **mots que ses élèves lisent** · ce qui
**l'engage publiquement**.
⮕ **Tout le reste, tu le tranches seul et tu le dis en une ligne, en nommant ce que tu as
supposé.** Il arbitrait une quinzaine de décisions par séance et terminait ses journées épuisé :
c'est lui qui a changé ce défaut, le 1er septembre.

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

## 7 · LA DATE QUI COMPTE

**Le 14 septembre 2026** — la communauté de pratique se réunit pour la première fois, une
vingtaine de membres. **Ce n'est pas la date où ces gens arrivent : c'est celle où ils se
parlent.**

⚠ **L'angle mort nommé le 3 septembre, et il tient toujours** : les six chantiers ouverts viennent
**tous de Grégoire**. `Retours des testeurs/` contient huit dossiers, et le plus récent fichier
date du **26 août**. Le canal des retours est à sec, et ça ne se voit pas parce qu'il alimente le
plan tout seul. **Rien ne prévoit encore comment on récolte ce qui sortira du 14.**
↻ **4 septembre** : le canal a fonctionné, mais **avec Grégoire seul** — seize retours en une journée,
trois retouches, un lot 4, huit retouches de plus, et trois points de cadrage en sont sortis. Le 14, ce
sera vingt personnes, **dans neuf jours**. **Toujours rien pour les recueillir** — et c'est le seul point
de cette page que personne n'a encore pris.
