# Consigne de démarrage — la session Cowork qui prend le relais

> **Réécrite le 5 septembre 2026 en soirée (Toronto), par la session Cowork du 5 septembre, après la livraison de 1.122.0
> (cinquième du jour) et la clôture de la journée d'audits.** **Elle REMPLACE toute version précédente.**
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

1. **`PROTOCOLE.md`** — les sept règles.
2. **`OU-EN-EST-ON.md`** — en gestes d'utilisateur. Sa section « L'ÉVALUATION » porte la journée du 5 : deux audits, deux lots,
   tout vu par Grégoire ; et un renvoi à la série d'audits.
3. **`plans de travail/00-CADRAGES-OUVERTS.md`**, section **« La série d'audits cadrés »** — trois audits, un ordre, une règle de
   fermeture. C'est le fil de ta séance.
4. **`CONSIGNE-DEMARRAGE-PROCHAINE-SESSION.md`** et **`plans de travail/CONSIGNE-PROCHAINE-SEANCE.md`** — ce que Claude Code fait
   dans la séance qui te précède ou qui tourne pendant la tienne : un mot sous la note du cours, puis **l'audit de l'onglet Suivi**.
5. Les deux rapports fermés, pour le format et la méthode que le troisième doit tenir :
   `Rapports/AUDIT-moteur-evaluation-2026-09-05.md` (en-tête, vue d'ensemble, § « Rien d'appliqué ») et
   `Rapports/AUDIT-pratique-de-notation-2026-09-05.md` (vue d'ensemble). Et le prompt du troisième :
   `Rapports/prompts-audit/PROMPT-AUDIT-onglet-suivi-2026-09-05.md` — c'est le contrat que tu vérifieras.

⛔ **Ne lis PAS les 130 autres fichiers de `plans de travail/`.**

## 3 · L'ÉTAT MESURÉ — le 5 septembre 2026 en soirée (Toronto), en lecture seule

⚠ **REMESURE-LE.** `git --no-optional-locks log --oneline -7` · `git --no-optional-locks rev-list --left-right --count
origin/main...HEAD` · `cat version.json` · **`TZ=America/Toronto date`** pour toute heure que tu écris.

- **En ligne : 1.122.0**, build `0905-1722`. `main` = `origin/main` = `12df341a`. **Run GitHub 33994473211 vert** (Vitest et
  Playwright WebKit), premier run complet vert depuis 1.120.0 ; il juge aussi 1.121.0. Vitest 477 fichiers / 5 332 cas.
- **Cinq livraisons le 5** : 1.118, 1.119, 1.120 (matin, les grilles) ; **1.121** (15 h 30, trois trous du moteur d'évaluation :
  échelle introuvable, effacement des codes, auto-save et bilan — #697-#699) ; **1.122** (17 h 22, la note du cours ne compte plus
  les brouillons #706, les spécifications calculent #708, cache d'indices vide → `null` #709).
- **La série d'audits** : 1 (moteur d'évaluation) et 2 (pratique de notation) exécutés, fermés, corrigés, le 1 vu à l'écran par
  Grégoire, le 2 pas encore. **Le 3 (onglet Suivi) est le mandat de la prochaine séance Claude Code.** En attente d'arbitrage
  après le 14 : #700-#705 (audit 1), #710-#721 (audit 2), le cadrage « non remis par famille ».
- **Fichiers de Cowork dans l'arbre, non commités** (contenu de leur auteur, Claude Code les commet tels quels) :
  `CONSIGNE-DEMARRAGE-PROCHAINE-SESSION.md`, ce fichier, `plans de travail/00-CADRAGES-OUVERTS.md`,
  `plans de travail/CADRAGE-2026-09-05-non-remis-par-famille.md`, `plans de travail/CONSIGNE-PROCHAINE-SEANCE.md`.
- **Sa console** — l'artefact « Les huit gestes » (titre à l'écran « Ce qu'il reste à faire »), mise à jour à 16 h 40 avec la série
  d'audits ; **demande le lien, n'en fabrique pas une seconde.** Un renommage du nom de galerie en « Ce qu'il reste à faire » est
  proposé à Grégoire, pas tranché : ne le fais pas sans son oui.
- ⚠ NFD : `git status` depuis Cowork montre `??` des fichiers suivis (`Modèle de consigne…`, `jean-françois/`, `projet de
  développement/`, `ignorés/`). Tous suivis (`git -c core.quotepath=off ls-files`). Ce n'est pas un défaut.

## 4 · CE QUI EST DÛ — dans l'ordre

### a) Ton mandat : recevoir le rapport d'audit de l'onglet Suivi, et faire ce que Cowork a fait deux fois le 5

Grégoire te collera le compte rendu de Claude Code. **La procédure, telle qu'elle a tenu deux fois** :

1. **Remesure avant de lire le compte rendu** : branche d'audit présente ? (`git branch --list 'audit/*'`), rapport déposé
   (`Rapports/AUDIT-onglet-suivi-<date>.md`, dans l'arbre ou par `git show <branche>:<chemin>`), `js/` intact
   (`git diff --stat origin/main..<branche> -- js/` doit rendre **rien**), arbre revenu sur `main`.
2. **Relecture croisée, pas relecture du résumé** : lis l'en-tête, la vue d'ensemble, les constats **critiques et majeurs**, la
   frontière (flux B et C : ce que le Suivi lit des deux moteurs), et **« ce que je n'ai pas regardé »**. Recoupe au `grep` au
   moins le mécanisme de chaque « corriger maintenant » proposé — le 5, un grep a confirmé `tableBundles`/`forfaits` en trente
   secondes ; c'est ce qui a permis de recommander sans deviner. **Vérifie que le prompt a été tenu** : quatre élèves de banc
   dont un **sans aucune évaluation**, la sortie du volet confidentiel cherchée dans chaque flux de G (même quand le résultat est
   « rien »), les dispositions écrites dans `ultrareview-lot-6` et dans l'audit du 27 août. Un flux sauté est un constat.
3. **L'arbitrage, à Grégoire, en UN tour** : les « corriger maintenant » proposés, avec **ta recommandation motivée** pour chacun
   (règle : un élève ou un enseignant peut lire un chiffre faux, ou une donnée sensible sort → corriger ; sinon inscrire). Ce qui
   est une **règle** (un seuil, ce que vaut un palier sans données) n'est pas un défaut : inscrire, après le 14. **Un seul objet par
   tour** — s'il y a trois décisions, présente-les ensemble avec une recommandation chacune et UNE question ; ne reviens pas
   dessus trois tours plus tard.
4. **Le relais**, une fois qu'il a tranché : un lot, l'ordre, la preuve exigée (sentinelle break-testée ; spec WebKit AVANT le
   correctif quand l'état de départ est déduit), les dispositions à écrire DANS le rapport, la fusion de la branche (documents et
   banc), release, **verdict du run GitHub lu avant tout autre push**, et le geste que Grégoire ira voir à l'écran.
5. **Relecture croisée du lot livré** sur le diff réel (pas le compte rendu), puis `OU-EN-EST-ON.md` (une ligne, « vérifié
   comment », et « éprouvé par Grégoire » quand il l'a vu), la série d'audits dans `00-CADRAGES-OUVERTS.md`, sa console.

⚠ **Ce qui est propre à cet audit-là** : la seconde moitié de sa question est la **confidentialité** (services adaptés,
sous-catégories médicales, notes de présences). Un constat de sortie d'une donnée sensible est **corriger maintenant** sans
attendre le 14, quelle que soit sa rareté. Et un **palier 3 attribué faute de données** l'est aussi : il enverrait quelqu'un en
intervention intensive parce qu'on ne sait rien de lui.

### b) Fin de chaque lot : `OU-EN-EST-ON.md`, sa console, ce fichier (règle 6)
Sans qu'il le demande, et une ligne pour dire ce qui a changé.

### c) Ce qui reste ouvert par ailleurs
**Après le 14** : l'arbitrage des dispositions #700-#705 et #710-#721 (deux rapports d'audit, dispositions écrites dedans), le
cadrage « non remis par famille » (règle de Grégoire : zéro en sommative, ignoré en « meilleures notes » si le minimum est
atteint — « propre à l'utilisateur »), le recalcul quand une échelle change, l'Inspecteur de sélection, repasser le dépôt en
public. **Non daté** : la synthèse des rétroactions dans le PDF (mesurer d'abord ce que le PDF rend). **Personne ne l'a pris** :
recueillir ce qui sortira du 14 (un gabarit et un canal ; le canal est sa décision). **Dû par Grégoire** : deux gestes à l'écran sur
1.122.0 (le profil d'un élève avec un brouillon ; « Modèle simple » qui donne 90 et 70 au lieu de 0).


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
