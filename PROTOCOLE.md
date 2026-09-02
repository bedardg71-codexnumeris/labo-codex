# Protocole de travail — Cowork, Claude Code, Grégoire

> **Arrêté le 1er septembre 2026 au soir, par les trois.** En vigueur à partir de
> la session suivante.
>
> Ce fichier porte **comment nous travaillons ensemble**. Il ne porte ni les
> chantiers (skills), ni les règles du code (`CLAUDE.md`), ni l'état courant
> (`OU-EN-EST-ON.md`, `CONSIGNE-DEMARRAGE-PROCHAINE-SESSION.md`).
>
> **À lire au début de toute session, Cowork ou Claude Code.** C'est le fichier
> de coordination de référence pour les deux.
>
> ↻ **Corrigé le 2 septembre 2026.** Ce fichier affirmait que « Cowork n'a pas
> accès à `.claude/skills/` ». C'est faux quand le dépôt est monté : `ls
> .claude/skills/` rend les quinze skills, lisibles. Témoin du périmètre : le
> même `ls` sur un dossier hors du montage échoue. La conséquence pratique est
> que Cowork peut VÉRIFIER si une promotion de la règle 3 est bien arrivée à
> destination, au lieu de la supposer arrivée. Le 2 septembre, les deux
> promotions déjà arrêtées visaient des sections périmées.
>
> Produit par une révision contradictoire : Cowork a proposé quatre règles,
> Claude Code en a réfuté une, amendé deux et resserré une. Ce qui suit est ce
> qui a survécu à la contradiction, pas ce qui a été proposé.

---

## Les trois rôles

- **Grégoire** décide, transmet, et fait tourner l'application sur ses vraies
  données. Il est le SEUL canal entre Cowork et Claude Code : rien ne se propage
  s'il ne relaie pas.
- **Cowork** mesure le dépôt en lecture seule, tient le fil d'une session à
  l'autre, rédige les plans, les consignes et les blocs à relayer. Il écrit dans
  le dépôt les documents de cadrage, rien d'autre.
- **Claude Code** exécute, mesure, teste, commite et pousse. Une seule session
  écrit à la fois.

### Qui écrit quoi dans la consigne de démarrage

**Claude Code rend l'ÉTAT MESURÉ** : des faits datés, rien d'autre.
**Cowork écrit le MANDAT** et la séquence, à froid, avec Grégoire.

Motif : une session qui rédige sa propre consigne **se relit elle-même**. Elle
transmet ce qu'elle a vu, pas ce qu'elle a manqué. C'est la relecture croisée,
appliquée au relais.

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

C'est la règle « vérifié comment » d'`OU-EN-EST-ON.md`, étendue des états aux
mesures, et des sessions aux sous-agents.

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

## Règle 3 — La consigne ne porte que ce qui périme

`CONSIGNE-DEMARRAGE-PROCHAINE-SESSION.md` ne porte que **l'état mesuré, le
mandat et ce qui est dû**. Ce qui a survécu à trois sessions n'est plus une
consigne, c'est une règle : ça monte, et **ça quitte la consigne**.

**Destination par défaut de la promotion, selon la nature :**

| Nature | Destination |
|---|---|
| Comment nous trois travaillons ensemble | `PROTOCOLE.md` (ce fichier) |
| Comment on mène un chantier (livrer, tester, noter) | le skill concerné |
| Ce qui gouverne le code | `CLAUDE.md` |

⚠ `CLAUDE.md` a un plafond de 250 lignes et il y est. Sans destination par
défaut, la règle 3 remplit le seul fichier qui ne peut pas grossir.

⚠ **Le nom de `CONSIGNE-DEMARRAGE-PROCHAINE-SESSION.md` est sans date, exprès.**
La date d'écriture est en tête du fichier, et c'est elle qui fait foi. Un nom qui
ne peut pas rôtir vaut mieux qu'une date qu'on oublie de retirer.

**Ce qui la falsifierait** : si le tri fait perdre une leçon chère, le critère
des trois sessions est trop court.

---

## Règle 4 — L'état mesuré s'écrit à la clôture de chaque lot

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
déjà lu ou à relancer ce qui vient de tourner, **il écrit l'état mesuré et clôt
le lot**. Deux occurrences documentées le 1er septembre, contre zéro pour le
seuil.

⛔ **RÉFUTÉE ET RETIRÉE, à ne pas reproposer** : la réduction du nombre d'outils.
Mesuré le 1er septembre : environ 95 outils visibles dont 81 différés, et un
outil différé ne coûte que son nom, pas son schéma. La comparaison « 17 outils
contre 52 » venait d'une installation où tous les schémas sont chargés d'emblée.
Le mécanisme ne tient pas ici.

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

**1. Une seule session écrit dans `js/`.** Tout changement dans `js/` oblige à
bumper le bloc de jetons d'`index.html` (le hook l'exige) : deux sessions s'y
heurtent mécaniquement, quel que soit leur soin.

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

**5. Aucune session ne pousse. La coordinatrice pousse.** C'est le 8 août en une
ligne : deux sessions parties du même commit, deux « 1.55.0 », les mêmes
identifiants.

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
`js/`, non.

⚠ **La sérialisation porte aussi sur git, pas seulement sur les fichiers.** Une
session qui commite par `git add -A` emporte le travail des autres dans son
commit, sous son message. **Nommer ses fichiers au commit** fait partie de la
règle 4.

**Ce qui la falsifierait** : si deux sessions travaillent trois jours de suite
sans jamais se heurter, le test préalable est trop strict.

---

## Ce qui reste hors protocole

**Le canal unique n'est pas automatisé, et c'est délibéré.** Le 1er septembre, le
seul jugement que ni Cowork ni Claude Code n'aurait pu rendre (`minor` ou
`patch`, et la distinction avec le `minor` attendu par le §4.3 de #668) était
celui de Grégoire. Le goulot est aussi le garde-fou.

**Ce qui remonte jusqu'à lui ne change pas** (détail dans `CLAUDE.md`) : la
didactique, ses données réelles, les mots que ses élèves et ses utilisateurs
lisent, ce qui l'engage publiquement. La règle 2 ajoute un second regard sur la
troisième catégorie ; elle ne lui retire pas l'arbitrage.

## La question restée ouverte

La règle 3 pousse du contenu vers le haut ; `CLAUDE.md` a un plafond et il y est.
La destination par nature résout le cas courant, pas le cas où la leçon vaut pour
toute session quel que soit le chantier. Quand ça arrivera, il faudra retirer
autant qu'on ajoute, et l'arbitrage appartient à qui a le fichier sous les yeux.

↻ **Premier paiement, 2 septembre 2026.** Le tri de la consigne a promu deux
leçons vers `CLAUDE.md` (« push réussi ≠ suite verte » et les notes A2025/H2026 non
rouvertes) et il a fallu retirer autant : quatre lignes de §Avant chaque commit qui
recopiaient le §4 de `fin-de-session`, et l'étape 5 de §Procédure de développement,
qui est intégralement ce rituel. `CLAUDE.md` est passé de 246 à **250 lignes,
exactement au plafond**. La prochaine promotion vers lui exigera un retrait
délibéré, pas une compression.
