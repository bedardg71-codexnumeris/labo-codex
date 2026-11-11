# Protocole de travail — Cowork, Claude Code, Grégoire

> **Arrêté le 1er septembre 2026 au soir, par les trois.** En vigueur à partir de
> la session suivante.
>
> Ce fichier porte **comment nous travaillons ensemble**. Il ne porte ni les
> chantiers (skills), ni les règles du code (`CLAUDE.md`), ni l'état courant
> (la relève de Cowork, hors du dépôt).
>
> **À lire au début de toute session, Cowork ou Claude Code.** C'est le fichier
> de coordination de référence pour les deux.
>
> **Ne rien ajouter ici sans retirer autant. Plafond : 575 lignes** — ce qu'il pesait le 13 septembre 2026 au soir, règles 7 et 8 déplacées vers le rituel de fin de session (mesuré par `wc -l`, pas choisi). C'est le seul texte que les deux sessions lisent en entier à chaque démarrage ; il avait pris 110 lignes le 13.
> Le critère de ce qui part : ce fichier dit QUI FAIT QUOI ET PAR QUEL CANAL ; un skill dit COMMENT BIEN FAIRE UN GESTE. Ce qui part laisse une ligne de renvoi qui nomme le skill.
>
> ↻ **Corrigé le 2 septembre 2026.** Quand le dépôt est monté, Cowork lit `.claude/skills/` (`ls .claude/skills/` rend les skills) : il peut donc VÉRIFIER qu'une règle montée (règle 3) est arrivée à destination, au lieu de la supposer arrivée.

---

## Les trois rôles

- **Grégoire** décide, transmet, et fait tourner l'application sur ses vraies
  données. Il est le SEUL canal entre Cowork et Claude Code : rien ne se propage
  s'il ne relaie pas.
- **Cowork** mesure le dépôt en lecture seule, tient le fil d'une session à
  l'autre, rédige les plans, les consignes et les blocs à relayer. Il écrit dans
  le dépôt les documents de cadrage, rien d'autre.
- **Claude Code** exécute, mesure, teste, commite et pousse. Plusieurs sessions
  écrivent, chacune sur sa branche (règle 5).

### Qui écrit quoi (aligné le 10 novembre 2026)

**Cowork écrit le MANDAT** d'une session, à froid, avec Grégoire : il arrive par le relais. Cowork tient aussi la relève (l'état d'ensemble et les priorités, hors du dépôt) et la page de tri, qui est la console de Grégoire.
**Claude Code écrit `RELAIS.md`** (le journal des sessions entre elles) **et le rapport de sa branche** (`plans de travail/RAPPORT-…`) : des faits datés, rien d'autre.

Motif : une session qui rédige sa propre consigne **se relit elle-même**. Elle
transmet ce qu'elle a vu, pas ce qu'elle a manqué. C'est la relecture croisée,
appliquée au relais.

---

## Le cycle d'un lot — la méthode, du backlog au push (13 septembre 2026)

*Écrit par Cowork à la demande de Grégoire, pour que la journée du 13 septembre se reproduise. Chaque règle ci-dessous porte le fait qui l'a produite, ce jour-là. Ce qui n'a pas été mesuré est nommé comme tel.*

### Ce que le cycle suppose

**Une fiche du backlog est une HYPOTHÈSE datée, pas un article d'inventaire.** Elle décrit ce que quelqu'un a vu, le jour où il l'a vu, dans le fichier où il l'a vu. Trois choses lui arrivent entre son inscription et son ouverture : le défaut se déplace, le défaut meurt, ou Grégoire tranche sa portée sans que la fiche le sache.

Mesure du 13 septembre : **sur trois lots ouverts, trois fiches se sont révélées fausses sur elles-mêmes.**

- L'ablation de l'ancien éditeur (#520) nommait cinq identifiants dupliqués. Il y en avait **huit**, et l'un des cinq n'était **pas dupliqué du tout**.
- La règle 10 (#858) annonçait trente assertions à router. Il y en avait **quarante-huit**.
- Le périmètre du bandeau (#801), écrit par Cowork le matin même, disait « mener à la carte ». C'est une **modale**, et la carte ne fait que l'ouvrir.

⮕ **Corollaire : aucun lot ne s'ouvre sur une fiche non remesurée.** Le premier livrable d'un lot n'est pas du code, c'est la mesure qui dément ou confirme sa fiche.

### Les six temps

1. **MESURER** (Cowork, lecture seule). Reprendre au code ce que la fiche affirme. Chaque compte s'écrit **avec la commande qui le produit**, pour qu'un tiers puisse le refaire.
2. **CADRER** (Cowork). La consigne va dans un bloc de code, complet, que Grégoire colle ; un fichier `CONSIGNE-LOT-…` seulement si elle est trop longue pour un bloc (règle 6, « Les consignes »). Elle porte : ce que le lot livre, ce que la mesure corrige de la fiche, la portée, les pièges connus, la preuve exigée, ce qui n'entre PAS, et les écritures de backlog dues.
3. **CODER** (Claude Code). Un lot, un commit. Les trouvailles en chemin reçoivent l'une des trois issues de `CLAUDE.md`, nommées dans le rapport.
4. **CONTRE-VÉRIFIER** (Cowork). Reprendre au code ce que le rapport affirme. Voir « Deux méthodes » ci-dessous.
5. **ÉPROUVER** (Claude Code). Suite complète, verdict Playwright pris **Cowork fermé** (règle 8).
6. **LIVRER** (Grégoire). Le `git push`.

⚠ **Le temps 6 se fait depuis le Mac de Grégoire, et par une seule des deux sessions.** **Claude Code pousse**, par `scripts/pousser.sh`, à la demande de Grégoire. **Cowork ne pousse pas** : son shell n'atteint pas le dépôt en SSH (« Host key verification failed », mesuré le 13). ⮕ **Corrigé le 13 au soir, après une affirmation fausse de Cowork** qui avait écrit que personne n'avait la clé : il avait mesuré son propre environnement et conclu sur le rôle. La règle 5, qui disait depuis le 8 août « aucune session ne pousse », est corrigée dans ce sens.

### La boucle — qui passe quoi à qui, et par quoi

**Grégoire est le seul canal.** Cowork et Claude Code ne se parlent pas : chaque passage est un copier-coller qu'il fait. Rien ne se propage s'il ne relaie pas — et rien ne se perd non plus sans qu'il le voie.

Le tour complet, tel qu'il a tourné le 13 septembre :

```
   fiche du backlog
        ↓
   [1] Cowork MESURE le dépôt, et dément la fiche
        ↓  bloc    : la consigne complète, collée par Grégoire
   [2] Claude Code CODE, commite, et RAPPORTE
        ↓  bloc    : ce qu'il a mesuré, ce qu'il a supposé, ses écarts avec la consigne
   [3] Cowork CONTRE-VÉRIFIE au code, et rend un verdict
        ↓  bloc    : vert / retouches, et de quelle NATURE est le verdict
   [4] Claude Code ÉPROUVE (suite complète, Cowork fermé) et commite
        ↓
   [5] Grégoire POUSSE
```

**Deux véhicules, deux emplois qui ne se confondent pas.**

- **Le BLOC** porte le mandat : un bloc de code, complet, sans retours à la ligne manuels, que Grégoire colle. C'est la forme ordinaire.
- **Le FICHIER** (`plans de travail/CONSIGNE-LOT-…`) ne sert que pour une consigne trop longue pour un bloc, et seulement quand Cowork peut écrire sur le Mac. Le bloc dit alors de le lire et **nomme ce qui enverrait le receveur de travers s'il l'ignorait** ; il ne le résume pas, sinon les deux divergent au tour suivant.

**Trois obligations, à chaque passage :**

1. **Nommer ce qu'on a mesuré ET ce qu'on a supposé.** Une supposition nommée se corrige en dix secondes ; une supposition tue se découvre trois jours plus tard.
2. **Remesurer la prémisse reçue avant d'agir dessus.** Une prémisse est périmée par défaut. Mesuré le 13 septembre au démarrage : *tout* ce qu'un relais décrivait comme « restant dû » était déjà commité et poussé — la règle 10, la fiche #858, et jusqu'à la ligne de SHA qu'il demandait de corriger.
3. **Écrire ses écarts avec la consigne reçue**, même quand ils l'améliorent. C'est par là que la consigne suivante s'écrit juste.

### La boucle tourne aussi À REBOURS

Ce n'est pas un cercle, c'est une spirale : **chaque passage corrige la source du passage précédent.**

- La consigne corrige la fiche (trois fois sur trois, le 13 septembre).
- Le rapport corrige la consigne — y compris quand la consigne vient de Cowork : le 13, Claude Code a démenti à la fois le périmètre de #801 (une modale, pas une carte) et le compte de #858 (167, pas 112), tous deux écrits par Cowork le matin même.
- La contre-vérification corrige le rapport — ou se corrige elle-même : le même jour, Cowork a cherché le banc de remplacement dans le mauvais fichier et a dû se démentir.

⮕ **Le relecteur se trompe autant que l'auteur.** La boucle ne vaut pas parce qu'un des trois aurait raison, mais parce qu'aucun des trois n'est cru sur parole. Ce qui circule, ce ne sont pas des verdicts : ce sont des mesures et les commandes qui les produisent.

### Ce qui compose un lot : la GRAPPE, pas le palier

Les fiches sont cotées **rapide / intermédiaire / laborieuse**. Ce palier estime un coût ; **il ne sélectionne rien.**

Ce qui compose un lot, c'est la **grappe** : les fiches qui passent par le même point du code. Une grappe = une sentinelle, un harnais, un jeton. Ce qui décide de l'ORDRE, ce sont deux questions, dans cet ordre :

1. **Est-ce que ça demande quelque chose à Grégoire ?** Un arbitrage, un écran à vérifier, ses données réelles. Si oui, ça attend un moment où il est disponible.
2. **Est-ce que la fiche dit encore vrai ?** Sinon, le lot n'est pas celui qu'on croit.

⚠ **Une grappe n'est pas un lot.** Le 13 septembre, la grappe `js/echelles.js` portait six fiches : une seule était un lot de code. Une était morte (sa source avait été tarie par le lot précédent, sans que personne la ferme), une était hors de portée par un arbitrage de Grégoire vieux de trois semaines, trois attendaient sa disponibilité.

### Deux méthodes, pas deux lectures

**La contre-vérification ne vaut que si elle emploie une méthode DIFFÉRENTE de celle qui a produit l'affirmation.**

Mesure du 13 septembre, et c'est le fait le plus important de cette page : Cowork avait compté 112 découpes fautives avec un `grep` ligne à ligne. La vraie valeur était **167** — cinquante-cinq découpes sont écrites sur deux lignes, et **les deux seules assertions réellement mortes étaient parmi ces cinquante-cinq.** Claude Code l'a trouvé parce qu'il a mesuré **à l'exécution** (une sonde sur les découpes pendant toute la suite) au lieu de relire le texte.

⮕ Si les deux côtés avaient lu le même texte de la même façon, l'erreur passait, et le lot aurait « corrigé » trente cas en laissant les deux vrais défauts en place.

⮕ **Une mesure fausse est pire qu'une mesure absente : elle rassure.** Quand une contre-vérification confirme, elle doit dire par quel chemin — sinon elle n'a fait que relire.

### Trois gestes qui demandent une garde particulière

- **SUPPRIMER une assertion** est le geste le plus risqué d'un lot. Celui qui la retire **nomme son remplaçant, fichier et ligne** ; celui qui relit **vérifie que le remplaçant existe et qu'il ne porte pas lui-même sur une tranche**. Le 13 septembre, la justification était bonne et Cowork a d'abord cherché dans le mauvais fichier : c'est le relecteur qui s'était trompé, pas l'auteur.
- **AJUSTER un banc pour qu'il repasse au vert** est interdit. Un banc qu'on ajuste a cessé de prouver quoi que ce soit. S'il doit changer, il se **réancre délibérément**, avec son motif écrit dans le fichier de test.
- **RENDRE UN VERDICT** exige de dire lequel. Un verdict de **lecture et de mesure** n'est pas un verdict d'**exécution**, et les deux se rendent : le 13 au soir, une session Cowork a rendu #658 **verte par exécution**, une autre a rendu #801 **verte par lecture**, faute d'avoir pu lancer la suite depuis son environnement. ⮕ **N'écris jamais « vert » tout court : écris par quel chemin tu l'as obtenu.** Et ne conclus pas de ce que TON instrument ne peut pas faire à ce que ton RÔLE ne peut pas faire — Cowork s'est trompé deux fois là-dessus le 13.

### Ce que le compte ne mesure pas

Le nombre de fiches ouvertes a été remesuré **cinq fois** — 234, 241, 230, 228, 227 — **sans qu'une seule révision change une décision.** Il monte quand on cherche mieux.

Ce qui se mesure, et ce que l'artefact de tri doit montrer en premier :

1. **Les lots en ligne**, distincts des lots commités — un lot non poussé n'est pas livré.
2. **Ce que la mesure a démenti** à chaque lot : c'est le rendement du dispositif, et c'est ce qui justifie le temps 1.
3. **Ce qui attend Grégoire**, et ce qui n'attend rien de lui.

Le tableau des fiches sert à composer les lots ; il s'adresse aux deux sessions. Le haut de la page s'adresse à Grégoire. Les deux ne se confondent pas.

---

## Règle 1 — Aucune ancre sans sa preuve

**(a) Tout chiffre rendu par un rituel, un audit ou un sous-agent est accompagné
de la commande qui le produit ET d'un témoin**, c'est-à-dire le même motif
rendant autre chose ailleurs.

« Six entrées » est invérifiable. « `git log f480efd3..HEAD -- js/` rend six
entrées » se réfute en trois secondes. « …et `-- .` en rend quatorze » se réfute
en une.

⚠ **Un zéro sans témoin est le cas le plus coûteux : il ressemble à une bonne
nouvelle.** Le témoin doit alors rendre non-zéro sur un périmètre plus large, et
**le périmètre annoncé doit être celui qui a été mesuré**.

**(b) Une connaissance transportée se remesure avant usage.** Un fait retenu d'un
état antérieur, une note de mémoire, un chiffre venu d'une autre architecture :
rien de tout cela n'est une mesure.

Motif : le rituel de début de session a menti le 1er septembre en filtrant sur
l'extension `.js` au lieu du chemin `js/`. Il est l'ancre de confiance de la
session, et rien ne permettait d'en douter. Le même soir, la même erreur de
transport s'est produite deux fois sur deux supports différents (une note de
mémoire périmée sur `release.mjs`, un chiffre importé d'un diaporama GitHub
Copilot dans une architecture où le mécanisme diffère). Le geste correcteur
est identique dans les deux cas, d'où leur réunion ici.

**Ce qui la falsifierait** : si les rapports deviennent illisibles sous les
commandes, ou si personne ne les rejoue jamais.

---

## Règle 2 — Relecture croisée obligatoire pour ce qui ne se reprend pas

**Périmètre** : un déploiement, une release, un format de données qui voyagent
(grilles partagées, imports, exports), et **toute écriture dans les données
réelles de Grégoire**. Libre partout ailleurs, au jugement de Claude Code.

Le critère n'est pas « ça sort de la machine », c'est **« ça ne se reprend
pas »**. Les dégâts historiquement les plus lourds (le revert de durabilité de
`db.js`, les `coursId` des productions, les grilles `h2026` désappariées) n'ont
jamais quitté sa machine. `CLAUDE.md` exige déjà son accord pour écrire dans ses
données ; il n'exigeait pas de second regard.

**Ordre fixe, parce qu'il a un prix en minutes :**

```
commit → relecture croisée → corrections → verdict → push
```

Le verdict Playwright est **toujours le dernier geste avant le push**, jamais
avant la relecture : toute correction issue de la relecture périme un verdict
déjà pris. Le 1er septembre, **cinq lancements ont été gaspillés** pour un seul
verdict utile — quatre verdicts (un mené à terme puis périmé par un `--amend`,
trois arrêtés en cours) et un `npm test` qui lançait Playwright sans qu'on le
sache. Chiffre corrigé après recomptage : le fichier disait « trois », ce qui
sous-comptait l'incident justifiant cette règle.

### La condition, mesurée : cartographier AVANT, pas lire le patch

Une relecture croisée ne vaut que si la relectrice a **cartographié l'état
avant** le lot, plutôt que de lire le patch seul. *Lire un patch seul, c'est
lire ce que l'auteur a décidé de montrer.* La cartographie dit où le risque
naîtrait s'il naissait ; le patch ne dit que ce qui a bougé.

⚠ **Un patch qui vit dans le scratchpad d'une session n'est pas relisible par
une autre.** Le faire transiter explicitement, sans quoi la règle 2 est un vœu.

⮕ **L'argument qui justifie tout le dispositif**, donné par la session qui en a
fait les frais : *on ne voit pas dans son propre code ce qu'on vient d'écrire,
même quand on sait exactement quoi chercher.* Elle avait nommé le risque en
désignant la cible à sa relectrice, dix minutes après l'avoir commis.

**Ce qui la falsifierait** : si sur trois sessions la relecture ne trouve rien
sur ces lots-là, le périmètre est mal choisi.

---

## Règle 3 — Une règle a UNE destination, selon sa nature

*Réécrite le 10 novembre 2026 : la consigne de démarrage, que cette règle tenait courte, est figée.* Ce qui a survécu à trois sessions n'est plus une consigne, c'est une règle : ça monte, et **ça quitte** le mandat, le relais ou le rapport où c'est né.

| Nature | Destination |
|---|---|
| Comment nous trois travaillons ensemble | `PROTOCOLE.md` (ce fichier) |
| Comment on mène un chantier (livrer, tester, noter) | le skill concerné |
| Ce qui gouverne le code | `CLAUDE.md` |

⚠ `CLAUDE.md` a un plafond de 250 lignes : toute promotion vers lui retire autant qu'elle ajoute, et l'arbitrage appartient à qui a le fichier sous les yeux.

**Ce qui la falsifierait** : si le tri fait perdre une leçon chère, le critère
des trois sessions est trop court.

---

## Règle 4 — Le rapport et le relais s'écrivent à la clôture de chaque lot

*Alignée le 10 novembre 2026 : c'était « l'état mesuré » de la consigne de démarrage ; c'est le rapport de la branche, et l'entrée de `RELAIS.md` quand la session en écrit une.*
Pas à la clôture de la session. Une session qui a livré trois lots a écrit trois
fois, chaque fois avec assez de place pour se relire.

Motif : `CLAUDE.md` observait déjà le symptôme sans en connaître la cause. La
pourriture du contexte (la fiabilité baisse à mesure que le contexte grossit,
AVANT que la limite soit atteinte) explique pourquoi la dernière heure d'une
session est le pire moment pour écrire le relais, et c'est le moment où il était
écrit.

**Pas de seuil de contexte.** La proposition initiale en portait un ; retirée
pour une raison décisive : **seul Grégoire voit cette jauge.** Un filet que seule
la personne qu'on veut décharger peut relever n'est pas un filet.

**Signal de remplacement, auto-observable et gratuit** : si Claude Code se
surprend à refaire une mesure déjà faite dans la session, à relire un fichier
déjà lu ou à relancer ce qui vient de tourner, **il écrit son rapport et clôt
le lot**. Deux occurrences documentées le 1er septembre, contre zéro pour le
seuil.

⛔ **RÉFUTÉE ET RETIRÉE, à ne pas reproposer** : la réduction du nombre d'outils. Mesuré le 1er septembre : environ 95 outils visibles dont 81 différés, et un outil différé ne coûte que son nom, pas son schéma.

---

## Règle 5 — Travailler à plusieurs sessions : sept règles

*Promue depuis la consigne de démarrage le 2 septembre 2026 (règle 3). Écrite le
1er septembre à partir des contraintes mécaniques de la pile, qui ne se négocient
pas, et non des incidents.*

⮕ **Le test préalable, avant même de constituer une équipe** : *peut-on nommer
trois mandats dont les ENSEMBLES DE FICHIERS ne se croisent pas ?* Si non, une
seule session. Le travail du 1er septembre (`travaux-ui.js`, `styles.css`,
`index.html`, `tests/`) n'était pas séparable ; trois sessions s'y seraient
piétinées toute la journée.

**1. Plusieurs sessions écrivent dans `js/`, chacune sur sa propre branche partie
de `main`** (10 novembre 2026 ; la règle disait « une seule session écrit dans
`js/` »). Seule la session principale fusionne dans `main`, par groupe de lots ;
elle règle les jetons d'`index.html` à la fusion et lance un seul verdict par groupe.

**2. Une seule session lance une suite.** Toutes les specs ouvrent le même
`index.html` en `file://` et partagent le `localStorage` de cette origine. Deux
suites concurrentes se polluent comme deux workers.

**3. La coordinatrice ne code pas.** Elle alloue les identifiants, tient
`BACKLOG.md`, fait transiter les patches d'une session à l'autre, écrit le relais.
Si elle code, elle devient une quatrième source de collision et plus personne ne
tient la carte.

**4. Chaque mandat NOMME ses fichiers.** Pas « fais #595 », mais « tu touches
`styles.css`, rien d'autre ». Un mandat qui ne nomme pas ses fichiers ne peut pas
être vérifié disjoint.

**5. Seule la session principale pousse sur `main`** (`scripts/pousser.sh`, à la demande de
Grégoire) ; une session du cloud ne pousse que sa propre branche ; Cowork ne pousse pas
(10 novembre 2026). Motif d'origine, le 8 août : deux sessions
parties du même commit, deux « 1.55.0 », les mêmes identifiants.

**6. Une trouvaille hors de ses fichiers ne se corrige JAMAIS.** Elle remonte à la
coordinatrice, qui l'inscrit. C'est l'issue 2 de `CLAUDE.md` appliquée au
parallélisme.

**7. Grégoire ne parle qu'à la coordinatrice.**
⚠ **C'est la règle qui cassera en premier**, et c'est prévisible : il répondra
naturellement à la session qui l'interpelle. Dès qu'il le fait, la coordinatrice
perd la carte et redevient un intermédiaire de plus. Si une session a besoin de
lui, elle passe par elle.

⮕ **Et la règle qui vaut toujours** : *parallélise la LECTURE, sérialise
l'ÉCRITURE.* Deux balayages en lecture seule menés en parallèle le 1er septembre
n'ont demandé aucune coordination et n'ont couru aucun risque. Le triage de
rapports, la documentation, les mesures se séparent proprement. L'écriture dans
`js/` se sépare par branche (règle 1) ; sur une même branche, non.

⚠ **La sérialisation porte aussi sur git, pas seulement sur les fichiers.** Une
session qui commite par `git add -A` emporte le travail des autres dans son
commit, sous son message. **Nommer ses fichiers au commit** fait partie de la
règle 4.

**Ce qui la falsifierait** : si deux sessions travaillent trois jours de suite
sans jamais se heurter, le test préalable est trop strict.

---

## Règle 6 — L'environnement de travail de Grégoire se prépare sans qu'il le demande

*Arrêtée le 2 septembre 2026, après une matinée où il a perdu ses repères : deux
versions livrées, huit consignes relayées, et à 8 h il ne savait plus où il en
était dans son propre projet. Ces règles ne sont pas un confort, ce sont les
conditions pour qu'il décide en connaissance de cause.*

### Ce que Cowork fait à l'OUVERTURE de chaque session, sans qu'on le demande

1. Lire les fichiers de cadrage et **mesurer** l'état réel du dépôt.
2. **Mettre à jour la console** (voir plus bas) et lui dire, en une ligne, ce qui
   y a changé depuis la dernière fois.
3. Rendre l'état **en gestes d'utilisateur**, jamais en compte d'items de backlog.

### L'application : UNE SEULE ADRESSE porte ses données réelles

*Arrêté le 8 septembre 2026, après que #785 eut occupé deux sessions comme un bug
d'enregistrement. Il n'y en avait pas. Grégoire ouvrait Labo Codex à deux adresses
depuis l'automne, saisissait ses présences dans l'une et les cherchait dans l'autre.*

**La règle, dans ses mots :**

> **`https://app.codexnumeris.org` est ma source unique. Le fichier local
> (`file://`) ne porte plus de trimestre réel.**

**Elle nomme l'ADRESSE, jamais le navigateur.** Il avait d'abord écrit « Chrome
comme source unique » : ça ne protège de rien, puisqu'il ouvre les deux adresses
dans Chrome. Le cloisonnement du stockage suit l'**origine** (`file://` contre
`https://…`), pas le logiciel. localStorage et IndexedDB y sont étanches : rien
ne passe de l'une à l'autre, même navigateur, même machine, même écran.

**Deux discriminants sont invisibles à l'écran, pas un** : les données sont
séparées, ET les versions peuvent différer — le local sert son clone du dépôt, le
web la version déployée.

⚠ **Le local n'est pas un banc représentatif.** Trois chemins divergent, mesurés :
`version.json` n'est jamais lu en `file://` (#495, le numéro affiché vient d'un
repli), la détection de mise à jour ne tourne pas (`init-inline.js:446`), le
décodage HEIC est désactivé (`heic-decodeur.js:81`). Éprouver en local ce que ses
collègues vivront en ligne trompe sur ces trois-là.

⛔ **C'est la DEUXIÈME fois en un mois.** Le 9 août, #154 disait déjà « chaque
navigateur est une île » : la réparation #346 avait soigné sa copie Safari, sa
copie Chrome ne l'avait jamais reçue. **Devant un symptôme de données qui
manquent ou qui reviennent, la première question n'est pas « quel bug ? » mais
« quelle instance ? ».** Poser la question coûte dix secondes ; ne pas la poser a
coûté deux sessions d'enquête et deux hypothèses réfutées.

▣ **Pour mesurer sans rien écrire** : `scripts/diagnostic-785-presences-deux-instances.js`,
à coller dans la console de CHAQUE instance. Il rend une signature comparable
(trimestre · date · groupe-cours · nombre d'élèves · périodes) et **aucune donnée
personnelle** — ni DA, ni nom, ni note. Il ne sait pas écrire, et ça ne doit pas
changer.

### La console : la page de tri

*Alignée le 10 novembre 2026. Elle s'appelait « Les huit gestes » et se donnait pour la vue d'`OU-EN-EST-ON.md`, figé depuis.*
C'est un artefact publié, que tient Cowork. **Il n'y en a qu'une.** Ne jamais en fabriquer une seconde : deux pages qui divergent seraient pires que rien. Si son adresse manque, la demander plutôt que de la deviner.

Elle porte **ce qui reste ouvert**, ce qui attend une décision de lui, et ce qu'il doit aller voir à l'écran.

⛔ **RÈGLE ARRÊTÉE PAR GRÉGOIRE LE 2 SEPTEMBRE 2026 — ON FAIT COURT, ET CE QUI EST
FINI DISPARAÎT.** Ses mots : *« Quand un point est fini, on le retire. On le compte
comme du travail fait, mais on ne l'affiche plus. On passe au point suivant. »*

⮕ **Un geste fini est RETIRÉ de la page et COMPTÉ.** Les preuves et le détail restent au
dépôt, dans le rapport de la branche et dans `RELAIS.md` — la page n'est pas l'archive,
elle est la vue de ce qui reste.
⚠ **Le motif, et il est plus grave qu'une préférence de forme** : le 2 septembre au
matin, il a dit être en **surcharge cognitive** — trop d'information, impossible de
retenir, donc impossible de décider. **Une page qui accumule redevient illisible en
une semaine.** La page était passée de 730 lignes à 200 le jour où cette règle est née.

⮕ **Cowork la met à jour à la fin de chaque lot**, et annonce en une ligne ce qui
y a changé. C'est le travail de Cowork, pas le sien.

### Les six règles de forme

**1. Jamais un numéro de fiche sans sa phrase en français.** « #690 » ne lui dit
rien ; « les trois pratiques offertes qui se déclarent en chimie et en maths » lui
dit tout. La console porte les deux côte à côte, parce que le terminal, lui,
n'affiche que les numéros.

**2. Les blocs à relayer sont écrits pour Claude Code, pas pour lui.** Il n'a pas
à les lire. **Une phrase au-dessus** doit dire ce que le bloc va produire, en
français d'utilisateur. Rien d'autre n'est à comprendre.

**3. Chaque lot se termine à l'écran, pas dans un rapport.** Quand c'est livré :
quel onglet ouvrir, ce qui devrait être différent, et une question à laquelle il
répond en trente secondes. C'est sa façon de vérifier depuis toujours — celle des
chroniques — et aucun banc vert ne la remplace.

**4. Une seule livraison par séance, à la fin, et il regarde avant.** Le rythme
des machines n'est pas le sien. Deux versions livrées avant huit heures du matin
sur une application que des gens utilisent est un défaut de méthode, pas une
performance.

**5. Une seule décision principale par séance.** Les décisions de fond se prennent
à froid, pas en rafale au milieu d'un lot.

**6. Pas de raccourci de métier sans sa traduction.** « colle le bloc », « pousse »,
« le verdict » : chacun se dit en clair la première fois qu'il apparaît dans une
séance.

### Les consignes : un bloc complet ; un fichier seulement quand le bloc ne suffit pas

*Réécrit le 10 novembre 2026 : c'est la pratique actuelle, et la préférence de Grégoire. Le 2 septembre, après un bloc **tronqué à la copie** (Claude Code avait reçu une demi-consigne sans que personne puisse s'en apercevoir), la règle était l'inverse : tout par fichier.*

**Le relais va dans un bloc de code, complet, sans retours à la ligne manuels, collé par Grégoire.**

**Un fichier `plans de travail/CONSIGNE-LOT-…` ne sert que pour une consigne trop longue pour un bloc, et seulement quand Cowork peut écrire sur le Mac.** Le bloc dit alors de le lire. Deux conditions pour ce fichier :

**1. Il porte SA DATE ET SON HEURE d'écriture en tête, et la version de
l'application à ce moment-là.** Le nom ne peut pas rôtir ; le contenu, oui. Une
consigne qui date de plus de quelques heures **se signale au lieu de s'exécuter** :
l'état du dépôt a pu changer entre-temps.

**2. Claude Code commite ce fichier AVEC son lot.** La consigne est la spécification
du lot : les séparer, c'est perdre la trace de ce qui avait été demandé. C'est
l'exception à la règle du commit séparé pour les fichiers de Cowork.

Dans les deux cas, Cowork dit à Grégoire en une phrase ce que la consigne va produire à l'écran (règle de forme 2).

### La mesure d'efficacité

Efficace ne veut pas dire « beaucoup livré ». Ça veut dire : **à la fin de la
journée, Grégoire sait ce qui a changé et pourquoi.** Une journée qui livre moins
mais qu'il peut reprendre le lendemain sans tout reconstruire vaut mieux.

**Ce qui la falsifierait** : s'il dit se sentir freiné plutôt que situé, le curseur
est mal placé et c'est lui qui le déplace.

---

## Ce qui reste hors protocole

**Le canal unique n'est pas automatisé, et c'est délibéré.** Le 1er septembre, le
seul jugement que ni Cowork ni Claude Code n'aurait pu rendre (`minor` ou
`patch`, et la distinction avec le `minor` attendu par le §4.3 de #668) était
celui de Grégoire. Le goulot est aussi le garde-fou.

**Ce qui remonte jusqu'à lui ne change pas** (détail dans `CLAUDE.md`) : la
didactique, ses données réelles, les mots que lisent ses étudiant·es (règle 13
pour ceux que lit seulement l'enseignant·e), ce qui l'engage publiquement. La règle 2 ajoute un second regard sur la
troisième catégorie ; elle ne lui retire pas l'arbitrage.

---

## Règle 7 — la cadence des verdicts : les lots le jour, un seul verdict le soir (11 octobre 2026)

**Décision de Grégoire (11 oct. 2026, de vive voix)** : le verdict Playwright mobilise tout son Mac pendant environ une heure et l'empêche de travailler en parallèle.

1. **Pendant la journée**, les lots s'enchaînent, chacun avec sa relecture croisée par Cowork (règle 2), ses break-tests et Vitest complet. **Aucun verdict Playwright, aucune release.** Les lots relus s'accumulent.
2. **Le soir**, au signal de Grégoire (sa journée est finie ; Chrome, Safari et Cowork fermés ; Mac sur secteur), **une seule release** groupe tout ce qui a passé la relecture, avec **un seul verdict complet**, pris sur le commit de release (jamais sur un commit antérieur). Push seulement si vert. Si le verdict rougit, les commits séparés disent quel lot : le nommer.
3. **La nuit**, le Mac reste ouvert, branché, sans mise en veille : le verdict peut tourner pendant que Grégoire dort. Un Mac endormi ou sous pression mémoire fait échouer le verdict ou redémarrer la machine : **vérifier le secteur et la charge avant de lancer**, et le dire s'ils ne conviennent pas.
4. **Exception** : un défaut gênant peut aller en ligne tout de suite, à la demande de Grégoire, avec son verdict à ce moment-là. Un lot qui touche une zone sous les règles de sécurité (`import-export.js`, `db.js`, `travaux-stockage.js`) garde son verdict obligatoire : il attend celui du soir.
5. **Un lot codé pendant qu'une release attend** se fait sur une branche partie de `main` ; il ne rejoint `main` qu'après la mise en ligne de la release, et part dans la suivante (premier cas : `lot8-cadre`, 11 oct. 2026). Motif : si le verdict rougit, on sait dans quel paquet chercher.

*Ancien contenu de la règle 7 (« un vert local ne prouve rien sur ce que la CI exécute ») : déplacé le 13 septembre 2026 vers le skill `fin-de-session-labo-codex`, §4.6.1 (geste de clôture).*

## Règle 8 — le verdict Playwright local ne se prend pas à deux outils ouverts (12 septembre 2026)

⮕ Le geste (quand le verdict se lance, et quand il attend le lendemain) est déplacé le 13 septembre 2026 vers le skill `fin-de-session-labo-codex`, §4.6.2.
**Reste ici, parce que c'est de la coordination : c'est GRÉGOIRE qui ferme Cowork, pas Cowork lui-même.** Claude Code le lui dit avant de lancer le verdict (« ferme Cowork, je lance le verdict »), et Grégoire rouvre Cowork après.

## Règle 9 — un seul compteur pour les fiches et les bugs, et le lien entre les deux (12 septembre 2026)

**Fait mesuré le 12 septembre au soir** : `SUIVI-BUGS.md` et `BACKLOG.md` numérotaient dans le même espace sans compteur commun —
123 numéros désignent à la fois un bug et une fiche. La réparation de #631 et #632 a été tracée sous le bug 831, lu comme la fiche
#831 : les deux fiches sont restées ouvertes au BACKLOG.

**La règle** (décision de Grégoire, option C de `Rapports/PROPOSITION-numerotation-bugs-testeurs-2026-09-12.md`) :
1. **Un seul compteur** : la ligne « Dernier ID utilisé » en tête de `BACKLOG.md`. Une fiche ET un bug testeur y prennent leur
   numéro, et cette ligne se met à jour dans le même commit. Aucun numéro ne resert.
2. **Le lien** : une ligne de SUIVI-BUGS qui répare ce que décrit une fiche NOMME la fiche (« ferme #631 »), et la case de la fiche
   se coche dans le même commit.
3. Les 123 homonymes anciens sont listés en tête de SUIVI-BUGS ; on ne les renumérote pas.

## Règle 10 — une assertion négative se porte sur une tranche dont on a prouvé qu'elle n'est pas vide (13 septembre 2026)

*Promue depuis la consigne de démarrage (§7), écrite le 13 septembre à partir de deux cas trouvés le même jour, sur deux lots sans rapport.*

**Une assertion négative sur une tranche vide est vraie par construction.** Un banc qui découpe un fichier avant d'y chercher une ABSENCE ne prouve rien tant qu'il n'a pas montré que sa tranche contient quelque chose. Le défaut se voit d'autant moins que le banc reste VERT : c'est la seule famille de défauts qui ne peut pas se signaler.

⮕ **Tout `not.toContain` ou `not.toMatch` porté sur une tranche porte, dans le même essai, un garde de non-vide** — `expect(tranche.length).toBeGreaterThan(N)`, avec un N choisi pour ce que la tranche doit contenir, jamais zéro.

⚠ **L'idiome qui produit le défaut est toujours le même** : `source.slice(source.indexOf(début), source.indexOf(fin))`. Un marqueur qui disparaît rend −1 ; la tranche est vide ou inversée, et tout ce qui suit passe. **Le marqueur est précisément ce qu'un refactor déplace** — c'est-à-dire le moment où l'on a le plus besoin du banc.

**Mesuré le 13 septembre sur les 665 fichiers d'essai** : 142 tranches portent une assertion négative de texte ; **82 ont leur garde, 60 ne l'ont pas**, et 30 de celles-là sont découpées par `indexOf`. La règle n'est donc pas neuve, elle est appliquée une fois sur deux. La réparation des 30 et le cliquet qui rendra la règle mécanique sont à #858.

**Ce qu'elle coûte** : une ligne par essai. **Ce qu'elle rend** : qu'un vert veuille dire quelque chose. Un cas a vécu du 10 au 13 septembre sans que personne le sache.

---

## Règle 11 — on n'ouvre pas un chantier sans écrire l'état de celui qu'on quitte (30 septembre 2026)

*Acceptée par Grégoire le 30 septembre à 17 h 28, après son constat : « on a dérivé un peu trop vite ».*

**Le 30 septembre, trois chantiers étaient ouverts en même temps** (la carte d'alignement et l'enregistrement, le codex, les archives), et la page du tri n'en montrait qu'un. Chaque passage avait sa raison : un échec sur ses vraies données le matin, puis la borne de 2 Go du codex. Aucun n'avait laissé de trace de ce qu'il interrompait. Grégoire a découvert l'empilement en posant la question.

⮕ **Avant d'ouvrir un chantier, Cowork écrit sur la page du tri l'état de celui qu'on quitte : « clos », ou « suspendu, il reste X »**, X dit en gestes d'utilisateur. La même ligne va dans la relève de Cowork.

**Elle n'empêche pas de changer de cap** : un retour de testeur passe toujours avant tout, et Grégoire décide de l'ordre. Elle oblige à voir ce qu'on laisse. **Un plan qui nomme des lots restants est un chantier ouvert** tant que la page ne dit pas le contraire : à l'ouverture d'une session, Cowork compte les plans ouverts, pas seulement le lot en cours.

**Ce qu'elle coûte** : une entrée sur la page. **Ce qu'elle rend** : que « où en est-on » ait une seule réponse.

---

## Règle 12 — deux règles montées de la consigne de démarrage, figée le 10 novembre 2026

*`CONSIGNE-DEMARRAGE-PROCHAINE-SESSION.md` est figée depuis le 10 novembre 2026 (elle ne se lit plus, ne s'écrit plus ; le mandat arrive par le relais). Ses règles de parallélisme étaient déjà ici, à la règle 5, depuis le 2 septembre. Deux règles encore appliquées n'avaient pas d'autre domicile ; les voici mot pour mot, avec leur date.*

**9 octobre 2026** — **Règle de Grégoire (9 oct., 14 h 42)** : d'abord ce qui se fait sans lui, puis la qualité (robustesse, logique).

**22 octobre 2026** — ⚠ **Le port 22 vers github.com est bloqué sur ce réseau** : `pousser.sh` a poussé par le port 443 (`GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=url.ssh://git@ssh.github.com:443/.insteadOf GIT_CONFIG_VALUE_0=git@github.com:`), sans toucher à la configuration.

---

## Règle 13 — les mots : ce qui attend le oui de Grégoire, ce qui part tel quel (10 novembre 2026)

**Décision de Grégoire (10 nov. 2026, 8 h 43)** : il garde, bornée, sa règle du 11 septembre (« un mot proposé sans réponse vaut tel quel »).

- **Un mot que lisent les étudiant·es** (le PDF, la rétroaction, tout ce qu'ils reçoivent) **attend le oui de Grégoire.**
- **Un mot que lit seulement l'enseignant·e à l'écran**, proposé « à corriger si tu veux, sinon c'est celui-là », **part tel quel s'il ne répond pas, et reste corrigeable ensuite.**

---

## Règle 14 — un bug vu sur l'iPad : corrigé dans le cloud, fusionné et mis en ligne sur le Mac (10 novembre 2026)

**Norme fixée par Grégoire (10 nov. 2026, 18 h)**, premier cas : PR n° 15, `lot/bandeau-preparer`, fusionnée le soir même.

- **Dans le cloud** : une conversation du Projet répertorie le bug et le corrige sur une branche partie de `origin/main`, avec son banc et son break-test, et ouvre une pull request. Le cloud n'écrit ni `SUIVI-BUGS.md` ni `BACKLOG.md` : il propose la ligne de suivi dans le corps de la PR.
- **Sur le Mac, par la session principale** : la fusion (`git merge --no-ff`) dans le `main` local, le passage sous WebKit, le numéro au registre (compteur de `BACKLOG.md`, règle 9, qui avance ici) et la mise en ligne.
- ⛔ **Jamais de fusion par l'application GitHub** : Netlify publie chaque `main`, si bien qu'elle mettrait le correctif en ligne aussitôt, sans verdict WebKit, et ferait diverger le `main` local. La PR se ferme d'elle-même au push de `main`.
