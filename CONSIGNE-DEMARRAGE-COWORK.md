# Consigne de démarrage — la session Cowork qui prend le relais

> **Écrite le 4 septembre 2026, par la session Cowork du 2-3 septembre, avant sa fermeture.**
> **Elle REMPLACE toute version précédente.**
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

1. **`PROTOCOLE.md`** — comment vous travaillez tous les trois. **Les six règles.**
2. **`OU-EN-EST-ON.md`** — où on en est, en gestes d'utilisateur.
3. **`plans de travail/00-CADRAGES-OUVERTS.md`** — les **six** chantiers pensés, un seul entamé.
4. **`OBJECTIF-COHORTE-1.md`** — les huit énoncés. **Ils sont tous parcourus depuis le
   3 septembre au matin, et Grégoire les a tous vus à l'écran.**

⛔ **Ne lis PAS les 130 autres fichiers de `plans de travail/`.** L'écrasante majorité est
exécutée depuis des semaines. L'index du point 3 est la porte d'entrée ; c'est pour ça qu'il
existe.

---

## 3 · L'ÉTAT MESURÉ — le 4 septembre 2026, en lecture seule

⚠ **REMESURE-LE. Il aura vieilli avant que tu le lises.**

- **En ligne** : **1.114.1**, build `0903-1858` (`version.json`).
- **`main` est à `a6187760`**, **un commit devant `origin/main`, non poussé** — c'est le **lot 1**
  du chantier des grilles. Il attend que Grégoire le voie à l'écran (règle 6).
- **Les trois défauts iPad sont fermés à son doigt** sur 1.114.1 : les couleurs de la palette se
  choisissent, « Personnalisé… » ouvre le sélecteur natif, un repère ne coupe plus un mot.
- **Sa console** — l'artefact « Les huit gestes » — porte ce qui est ouvert. **Demande-lui le
  lien ; ne le devine pas, et n'en fabrique pas une seconde version.** Deux consoles qui divergent
  seraient pires que rien.

---

## 4 · CE QUI EST DÛ — dans l'ordre

### a) Le premier geste : relayer une décision déjà prise
⚠ **Le bloc de relais a été remis à Grégoire le 4 septembre, avant la fermeture de la session précédente. DEMANDE-LUI s'il l'a transmis** — s'il l'a fait, ce point est clos ; sinon, réécris-le à partir de ce qui suit, en remesurant.

Grégoire a tranché le 4 septembre au matin, sur le menu « Type de la grille » livré au lot 1 :
**le menu affiche ce qui est ENREGISTRÉ** (« Non précisé » sur ses grilles actuelles), et **la
déduction se dit en clair, en petit texte, à CÔTÉ du menu** — « Tes critères sont tous
holistiques. »
▣ **Motif** : le menu ne distinguait pas un type *déclaré* d'un type *déduit*, et il aurait pu
croire une grille déclarée alors qu'elle ne porte rien.
⛔ **Il avait d'abord proposé une couleur** (vert = déclaré, orange = déduit). **Écarté, et le
motif est mesuré** : dans son système, l'orange veut déjà dire « avertissement »
(`docs/aide-contextuelle-contenu-revue.md:15`) — or « déduit » est l'état NORMAL de toutes ses
grilles et de celles de ses collègues. Et une couleur seule ne porte jamais une information :
vert/orange est la paire que les daltonismes fréquents ne distinguent pas.

### b) Le lot 1 attend son passage à l'écran
Le « fini quand » est dans `plans de travail/CONSIGNES-2026-09-03-lots-des-trois-types-de-grille.md` :
trois critères analytiques sans rien cocher, un passé en algorithmique qui fait basculer le badge
à **MIXTE**, puis un aller-retour export/import qui conserve le type.

### c) Puis les lots 2 et 3 — dans ce fichier de consignes
⚠ **Le lot 2 touche `calculerNote()`, qui produit les notes de ses élèves.** **Relecture croisée
de Cowork OBLIGATOIRE** (règle 2) : *ça ne se reprend pas.*
⚠ **Les lots 2 et 3 ne portent PAS de mesures**, exprès — seulement les questions à mesurer. Un
chiffre relevé le 3 septembre et lu plus tard serait un souvenir présenté comme une mesure.

### d) Ce qui reste ouvert par ailleurs
`plans de travail/00-CADRAGES-OUVERTS.md` en tient la liste à jour — le texte troué, les codes par
grille, la grille analytique, l'Inspecteur de sélection, les collections de paramètres, les
accordéons du gabarit.

---

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

### ▣ Et un motif qui est revenu QUATRE fois en deux jours
**« Ce que Grégoire demande existe déjà, ailleurs, sous un autre nom. »** L'écran de
personnalisation des codes, les bornes d'échelle, le seuil de réussite, les collections de
paramètres. ⮕ **Avant de cadrer un mécanisme neuf, cherche s'il existe déjà.** Le plus souvent,
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
