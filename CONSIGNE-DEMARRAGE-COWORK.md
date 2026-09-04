# Consigne de démarrage — la session Cowork qui prend le relais

> **Réécrite le 4 septembre 2026 vers 10 h, par la session Cowork du 4 septembre au matin, pendant
> que Claude Code publiait 1.116.** **Elle REMPLACE toute version précédente.**
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

1. **`PROTOCOLE.md`** — comment vous travaillez tous les trois. **Les sept règles.**
2. **`OU-EN-EST-ON.md`** — où on en est, en gestes d'utilisateur.
3. **`plans de travail/CADRAGE-2026-09-04-lot-4-gabarit-algorithmique-et-paliers-analytiques.md`**
   — **le lot 4, ton mandat** : huit retours de Grégoire du 4 septembre, tranchés ou mesurés,
   rangés en quatre volets. ⛔ Ce n'est PAS une consigne : tu cartographies, puis tu écris
   `plans de travail/CONSIGNE-DU-JOUR.md`.
4. **`plans de travail/CONSIGNE-DU-JOUR.md`** — celle du 4 septembre, **périmée mais instructive** :
   ses §5 à §8 sont les trois retouches et la release de 1.116, avec la cause mesurée de chaque.
   Tu la remplaces en entier quand tu écris le lot 4 (l'ancienne s'archive sous
   `_ancienne-CONSIGNE-DU-JOUR-<date>.md`, comme celle du 3).
5. `plans de travail/CONSIGNES-2026-09-03-lots-des-trois-types-de-grille.md` — les trois lots
   livrés, **les relectures croisées de Cowork** et « ce que le coup d'œil a ouvert » (la source
   du lot 4).
6. `plans de travail/00-CADRAGES-OUVERTS.md` — les sept cadrages, porte d'entrée.

⛔ **Ne lis PAS les 130 autres fichiers de `plans de travail/`.** L'index du point 6 est la porte
d'entrée ; c'est pour ça qu'il existe.

## 3 · L'ÉTAT MESURÉ — le 4 septembre 2026 vers 10 h, en lecture seule, PENDANT la release

⚠ **REMESURE-LE. Ce paragraphe a été écrit pendant que Claude Code publiait ; il est périmé par
construction.** Commandes : `git --no-optional-locks log --oneline -3`,
`git --no-optional-locks rev-list --left-right --count origin/main...HEAD`, `cat version.json`.

- **Au moment de l'écriture** : `HEAD` = `f485ea34`, **cinq commits devant `origin/main`** (lot 3,
  deux retouches du PDF et du champ, la régression de la réouverture), tous relus par Cowork ;
  `version.json` disait déjà **1.116.0**, build `0904-0729`, et `js/changelog-data.js` était
  modifié non commité — **le §8 de la consigne du jour était en cours d'exécution**.
- **Ce que tu dois trouver si tout s'est bien passé** : `origin/main` = `main`, un commit de
  release `release(1.116.0)` en tête, `rev-list` rend `0 0`, et le bloc de clôture de Claude Code
  dans `SESSION.md` (lis-le par `grep -n "1.116" SESSION.md`, jamais en entier) dit le run GitHub.
  ⛔ **Si `rev-list` ne rend pas `0 0`, la publication n'est pas finie** : demande à Grégoire où
  Claude Code en est avant d'écrire quoi que ce soit.
- **Quatre fichiers de cadrage de Cowork** étaient modifiés dans l'arbre à l'écriture
  (`CONSIGNE-DEMARRAGE-COWORK.md`, `00-CADRAGES-OUVERTS.md`, les cadrages « collections »,
  « accordéons ») plus **deux fichiers neufs** (le cadrage du lot 4 ; ce fichier-ci réécrit). Le §8
  demandait à Claude Code de les emporter avec le commit de release. **Vérifie qu'ils y sont**
  (`git --no-optional-locks status --short` doit ne rendre que des `??` ; s'il rend des ` M`,
  ce sont des décisions de Grégoire non commitées — le dire, et les faire commiter avec le lot 4).
- ⚠ **Le montage Linux de Cowork rend les noms de fichiers en NFD** : des fichiers suivis
  (`Retours des testeurs/jean-françois/`, `docs/projet de développement/`, le `.txt` de modèle)
  apparaissent `??`, et `ignorés/` n'est pas vu comme ignoré. **Ce ne sont pas des non-suivis.**
  Détail à l'erreur 10, §6.
- **Sa console** — l'artefact « Les huit gestes » (titre à l'écran : « Ce qu'il reste à faire »).
  **Demande-lui le lien ; ne le devine pas, et n'en fabrique pas une seconde version.** Elle
  portait à 10 h l'item des grilles « ton coup d'œil » : il est fait ; **mets-la à jour à
  l'ouverture** (règle 6) — 1.116 en ligne, l'item des grilles disparaît, le lot 4 entre.

## 4 · CE QUI EST DÛ — dans l'ordre

### a) Clore 1.116 dans les fichiers de Grégoire
Si la publication est finie (§3) : **`OU-EN-EST-ON.md`** — la ligne des trois types de grille
passe à « en ligne dans 1.116 » avec sa phrase « vérifié comment » (les mesures sont dans le
bloc de clôture de Claude Code, `SESSION.md`, et dans les relectures de Cowork) ; **sa console**
idem. ⚠ Ce que Grégoire a vu à l'écran le 4 septembre est écrit dans la consigne des lots
(retours 1 à 8) — c'est la preuve « éprouvé par Grégoire ».

### b) Le lot 4 — cartographier, puis écrire la consigne
Le cadrage (§2, point 3) porte les décisions ; **aucune mesure n'y dépasse les lignes citées**.
Avant d'écrire `CONSIGNE-DU-JOUR.md` :
- cartographie les quatre volets (A paliers, B SOLO « Aucun », C gabarit, D PDF) — où chaque
  chose se lit et s'écrit, et ce qui voyage (A touche la cartouche : format qui voyage → relecture
  croisée due, règle 2) ;
- **remonte à Grégoire ce que le cadrage nomme comme lui appartenant**, en lui **proposant un
  texte** : le défaut de projection (« Aucune projection » recommandé, **pas tranché**), la grille
  MIXTE dans le formulaire de cartouche, et les libellés neufs que ses collègues liront ;
- puis écris la consigne dans l'ordre que le cadrage propose (C → B → A → D), **une seule
  livraison à la fin, après son coup d'œil**, en 1.117.
⚠ Le lot 4 ne porte pas de mesures, exprès. **Cartographie-le avant qu'une ligne s'écrive.**

### c) Ce qui reste ouvert par ailleurs
`plans de travail/00-CADRAGES-OUVERTS.md` en tient la liste — sept cadrages, le 3 exécuté.
⏳ Et le bandeau « Niveau général » du PDF sur une grille entièrement analytique : **gardé** sur
recommandation de Cowork (c'est le niveau de la copie, pas d'un critère) ; Grégoire n'a pas
contredit. Si un collègue s'en étonne, c'est une décision, pas un défaut.

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

### ▣ Et un motif qui est revenu SIX fois en trois jours
**« Ce que Grégoire demande existe déjà, ailleurs, sous un autre nom. »** L'écran de
personnalisation des codes, les bornes d'échelle, le seuil de réussite, les collections de
paramètres, les paliers d'une grille analytique (l'échelle), « Aucune projection ». ⮕ **Avant de cadrer un mécanisme neuf, cherche s'il existe déjà.** Le plus souvent,
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
↻ **4 septembre** : le canal a fonctionné aujourd'hui, mais **avec Grégoire seul** — huit
retours en une matinée, trois retouches et un lot 4 en sont sortis. Le 14, ce sera vingt
personnes. **Toujours rien pour les recueillir.**
