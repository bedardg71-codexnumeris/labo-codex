# Protocole de travail — Cowork, Claude Code, Grégoire

> **Arrêté le 1er septembre 2026 au soir, par les trois.** En vigueur à partir de
> la session suivante.
>
> Ce fichier porte **comment nous travaillons ensemble**. Il ne porte ni les
> chantiers (skills), ni les règles du code (`CLAUDE.md`), ni l'état courant
> (`OU-EN-EST-ON.md`, `CONSIGNE-DEMARRAGE-PROCHAINE-SESSION.md`).
>
> **À lire au début de toute session, Cowork ou Claude Code.** C'est le seul
> fichier de coordination que les deux peuvent lire : Cowork n'a pas accès à
> `.claude/skills/`.
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
