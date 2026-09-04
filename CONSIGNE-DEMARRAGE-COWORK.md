# Consigne de démarrage — la session Cowork qui prend le relais

> **Réécrite le 4 septembre 2026 au soir, par la session Cowork du 4 septembre, à la clôture du lot 2.**
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

1. **`PROTOCOLE.md`** — comment vous travaillez tous les trois. **Les sept règles.**
2. **`OU-EN-EST-ON.md`** — où on en est, en gestes d'utilisateur.
3. **`plans de travail/CONSIGNE-DU-JOUR.md`** — le mandat de Claude Code pour la séance (le lot 3),
   écrit par la session du 4 septembre. **C'est ce que tu relis en premier quand il livre.**
4. **`plans de travail/CONSIGNES-2026-09-03-lots-des-trois-types-de-grille.md`** — les arrêtés, le
   hors-périmètre, les trois lots, et **ta cartographie + ta relecture du lot 2**, sous le lot 2.
5. `plans de travail/00-CADRAGES-OUVERTS.md` — les cinq autres chantiers, aucun entamé.

⛔ **Ne lis PAS les 130 autres fichiers de `plans de travail/`.** L'index du point 5 est la porte
d'entrée ; c'est pour ça qu'il existe.

---

## 3 · L'ÉTAT MESURÉ — le 4 septembre 2026 au soir, en lecture seule

⚠ **REMESURE-LE. Il aura vieilli avant que tu le lises.**

- **En ligne** : **1.115.0**, build `0903-2103` (`version.json`) — le lot 1 des grilles, avec sa
  retouche (le menu dit ce qui est enregistré, la déduction se dit à côté).
- **`main` est à `37660b76`**, **un commit devant `origin/main`, non poussé** — c'est le **lot 2**
  (l'analytique se saisit en points). Relu par Cowork : rien à corriger. **Il ne se publie PAS
  seul** (voir §4).
- **Les fichiers de cadrage sont au dépôt** depuis `16dfc5eb`. **Six fichiers modifiés non
  commités** à la clôture (les deux consignes de démarrage, `OU-EN-EST-ON.md`, `SESSION.md`, la
  consigne du jour, la consigne des lots) : **ils partent avec le commit du lot 3.** Non suivis,
  décision de Grégoire en attente : `Retours des testeurs/jean-françois/`, `ignorés/`,
  `docs/projet de développement/`, un `.txt` de modèle, `.claude/settings.local.json`.
- **Sa console** — l'artefact « Les huit gestes » — porte ce qui est ouvert. **Demande-lui le
  lien ; ne le devine pas, et n'en fabrique pas une seconde version.**

---

## 4 · CE QUI EST DÛ — dans l'ordre

### a) Le lot 3, puis UNE publication pour les lots 2 et 3
**Décision de Grégoire, 4 septembre au soir** : *« publier les lots 2 et 3 ensemble à la prochaine
séance »*. ▣ **Motif mesuré** : dans le lot 2, un critère analytique n'entre pas dans
`evaluation.criteres[]` ; le PDF de l'élève (`travaux-export-pdf.js:949`) liste les critères depuis
ce tableau, donc il omettrait le critère analytique alors que la note le compte. Le lot 3 le règle.
⮕ **Le mandat est écrit** : `plans de travail/CONSIGNE-DU-JOUR.md` (4 septembre au soir). Il lève
la ligne « n'ouvre pas le lot 3 avant que Grégoire ait vu le lot 2 », ajoute l'exigence du
`criteres[]`, et fait imprimer **« 24 / 30 »** au PDF de l'élève, jamais le niveau. **Grégoire ne
colle qu'une ligne** : *« Lis « plans de travail/CONSIGNE-DU-JOUR.md » et exécute-la. »*
⚠ Le lot 3 ne porte pas de mesures, exprès. Cartographie-le avant qu'une ligne s'écrive (règle 2).

### b) Puis, dans l'ordre : coup d'œil de Grégoire sur les DEUX lots, relecture croisée du lot 3, verdict au jeton, release MINEURE (1.116), push
Le changelog 1.116 porte les deux lots ; ses mots sont à Grégoire. Le coup d'œil du lot 2 n'a pas
encore eu lieu : le champ « sur 30 » est-il lisible et à sa place, sur Mac et sur iPad ?

### c) Ce qui reste ouvert par ailleurs
`plans de travail/00-CADRAGES-OUVERTS.md` en tient la liste.

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
