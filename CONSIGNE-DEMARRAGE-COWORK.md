# Consigne de démarrage — la session Cowork qui prend le relais

> **Réécrite le 4 septembre 2026 à 17 h (Toronto, lue par `TZ=America/Toronto date`), par la session
> Cowork du 4 septembre, après la clôture du lot 4 (1.117.1).** **Elle REMPLACE toute version précédente.**
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

1. **`PROTOCOLE.md`** — comment vous travaillez tous les trois. **Les sept règles.** ↻ La règle 7 a
   été amendée le 4 septembre : on ne retient plus un push pour laisser finir un run GitHub.
2. **`OU-EN-EST-ON.md`** — où on en est, en gestes d'utilisateur (dix-neuvième passe, 4 septembre 16 h 30).
3. **`plans de travail/CONSIGNE-DU-JOUR.md`** — **écrite, c'est ton mandat** : le texte troué, étape 2
   (les paliers de projection se composent avec des badges). Elle commence par une CARTE de Claude Code,
   pas par du code ; **c'est toi qui relis la carte et qui portes à Grégoire ses deux questions**.
4. **`plans de travail/CADRAGE-2026-09-02-badges-texte-troue.md`** — la source : la distinction qui
   commande tout, les six arrêtés de Grégoire, le mécanisme de glissé qui existe déjà.
5. `plans de travail/_ancienne-CONSIGNE-DU-JOUR-2026-09-04-lot-4-et-release-1.117.md` — **périmée mais
   instructive** : §6 la relecture croisée de Cowork, §7-§9 les huit retouches sorties des trois coups
   d'œil et les mots du changelog, §10 la décision sur la CI.
6. `plans de travail/00-CADRAGES-OUVERTS.md` — la porte d'entrée ; et le cadrage
   `CADRAGE-2026-09-03-codes-par-grille.md`, points 6 à 8 (fusion des deux listes, le mot « observation »).

⛔ **Ne lis PAS les 130 autres fichiers de `plans de travail/`.** L'index du point 6 est la porte
d'entrée ; c'est pour ça qu'il existe.

## 3 · L'ÉTAT MESURÉ — le 4 septembre 2026 à 16 h 55 (Toronto), en lecture seule

⚠ **REMESURE-LE. Il aura vieilli avant que tu le lises.** Commandes :
`git --no-optional-locks log --oneline -3` · `git --no-optional-locks rev-list --left-right --count origin/main...HEAD`
· `cat version.json` · **`TZ=America/Toronto date`** pour toute heure que tu écris.

- **En ligne** : **1.117.1**, build `0904-1507` (`e990e710`) — le lot 4 et le mot « observation ».
  1.117.0 (`4e7a1b03`, 13 h 36) puis 1.117.1 (15 h 07). **Run GitHub 33910422885 vert** (Vitest et
  Playwright WebKit). Deux livraisons dans la journée (1.116 à 7 h 29, 1.117 à 13 h 36).
- **`main` = `origin/main` = `fd2b4ce6`** (`rev-list` rend `0 0`) : la release, le §10 (règle 7 amendée,
  règle des specs dans `docs/securite/TESTS-AUTOMATISES.md` §4), le bloc 24 de `SESSION.md`. `RELAIS.md`
  dit « aucun travail en avance ».
- **Fichiers de Cowork non commités à l'écriture** : `OU-EN-EST-ON.md`, ce fichier, la consigne du jour,
  l'archive de l'ancienne, `00-CADRAGES-OUVERTS.md`, le cadrage « codes par grille ». **Ils partent avec
  le premier commit de Claude Code.** Vérifie : `git --no-optional-locks status --short` ne doit rendre
  que des `??` NFD (erreur 10) et ces ` M` — s'il en rend d'autres, dis-le.
- ⚠ **Le montage Linux de Cowork rend les noms de fichiers en NFD** : des fichiers suivis apparaissent
  `??`, et `ignorés/` n'est pas vu comme ignoré. **Ce ne sont pas des non-suivis.**
- **Sa console** — l'artefact « Les huit gestes » (titre à l'écran : « Ce qu'il reste à faire »).
  **Demande-lui le lien ; ne le devine pas, et n'en fabrique pas une seconde version.** À 16 h 30 elle
  dit 1.117.1 en ligne, lot 4 clos, prochaine séance = texte troué étape 2. ⚠ Sa date affichée dit
  « 15 h 30 » : **corrige-la à l'ouverture** (erreur 14, refaite — voir §6).

## 4 · CE QUI EST DÛ — dans l'ordre

### a) La consigne du jour est ÉCRITE — Grégoire ne colle qu'une ligne
Elle demande à Claude Code une **carte** (`plans de travail/CARTE-2026-09-0X-texte-troue-etape-2.md`) avant
toute ligne de code : ce que l'étape 1 a livré et se réemploie ; ce que la projection SAIT par élève, donc
quels jetons peuvent se remplir ; le préfixe engendré « Tu fais en moyenne 1 erreur à chaque N mots » ; où
les textes du palier s'enregistrent et ce qu'une version antérieure chez un collègue rend d'un jeton inconnu ;
d'où viennent les copies d'exemple de la prévisualisation. **Quand la carte arrive : tu la relis (règle 2,
le texte du palier voyage avec la grille), puis tu portes à Grégoire les deux questions** — les NOMS des
jetons que ses collègues liront (propose le texte), et le sort du préfixe engendré (ce que l'élève lit).
Puis tu écris le §3 de la consigne (l'ordre des volets) et tu le lui dis en une ligne.
▣ **Mesuré par Cowork le 4 au soir, à ne pas redécouvrir** : l'étape 1 est un bouton par repère qui insère
le jeton au curseur (`insererRepereEnonce`, `grilles.js:5449`), pas un badge glissé dans la phrase ; le texte
d'un palier ne connaît aujourd'hui qu'UN jeton, `{service}` (`evaluation-projection.js:71`), et seulement
dans `texteAide`. La maquette en montre sept.

### b) Un cadrage design à écrire à froid (pas de consigne avant)
`00-CADRAGES-OUVERTS.md`, « inscrit ailleurs » : un seul bouton de suppression (la corbeille) et un seul
geste d'ordre (les chevrons) HORS de l'éditeur de grille — mesuré par Claude Code : ✕ rouge dans la
bibliothèque (1) et la pratique de notation v2 (3), pile « Ordre » dans l'éditeur d'échelles (3) — et une
règle d'empilement en portrait iPad pour la grille à deux colonnes (le formulaire de groupe-cours n'en a
pas ; les paliers l'ont empruntée telle quelle). Skill `design-interface`. Quand Grégoire le demande, ou
quand l'après-texte-troué s'ouvre.

### c) Fin de lot : `OU-EN-EST-ON.md`, sa console, ce fichier
La règle 6 : tu les mets à jour sans qu'il le demande, et tu lui dis en une ligne ce qui y a changé.

### d) Ce qui reste ouvert par ailleurs
`00-CADRAGES-OUVERTS.md` — le 3 (grille analytique) et le 7 (lot 4) sont exécutés ; le 1 (texte troué,
étape 2) est le prochain ; les codes par grille ont gagné trois points le 4 septembre (où l'utilisateur
cherche le réglage · une seule liste sous-critères + codes · le mot « observation »). ⏳ Inscrit, pas
corrigé, par Claude Code : les paliers « en apposition » du gabarit neuf jamais servis ; le tri des paliers
à la saisie ; deux aides qui disent encore « Description » ; les trois réserves de la relecture du lot 4.

## 5 · COMMENT GRÉGOIRE VEUT QU'ON LUI PARLE

*Ce ne sont pas des préférences de style. Ce sont les conditions pour qu'il puisse décider.*

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

### ▣ Et un motif qui est revenu SEPT fois en trois jours
**« Ce que Grégoire demande existe déjà, ailleurs, sous un autre nom. »** L'écran de
personnalisation des codes, les bornes d'échelle, le seuil de réussite, les collections de
paramètres, les paliers d'une grille analytique (l'échelle), « Aucune projection », et le 4 septembre
la personnalisation des codes d'annotation (Annoter › palette, et la case « utiliser ces sous-critères
comme codes » qu'il avait sous les yeux). ⮕ **Avant de cadrer un mécanisme neuf, cherche s'il existe déjà.** Le plus souvent,
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
sera vingt personnes, **dans dix jours**. **Toujours rien pour les recueillir** — et c'est le seul point
de cette page que personne n'a encore pris.
