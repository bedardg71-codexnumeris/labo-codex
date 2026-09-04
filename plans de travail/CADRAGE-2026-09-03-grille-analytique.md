# Cadrage — la grille analytique reçoit le comportement qu'on lui promet

> **Écrit le 3 septembre 2026 en après-midi, par Cowork, avec Grégoire.**
> **Ce n'est PAS une consigne — rien n'est à coder.** Inventaire mesuré, distinction établie,
> et ce qui reste à trancher.
> Application au moment de l'écriture : **1.113.0**, build `0903-0906`.
>
> ⚠ **REMESURE TOUT avant d'en tirer une consigne** (règle 1).

---

## Le constat qui ouvre le chantier — et il est de Grégoire

> **« Dans les faits, je ne vois pas de différence entre la grille holistique et la grille
> analytique. Y en a-t-il une dans le code ? »**

▣ **Non. Mesuré, avec témoin :**

```bash
grep -rnE "=== ?'holistique'|!== ?'holistique'" js/ | grep -v "option value" | wc -l   # → 0
grep -rnE "=== ?'analytique'|!== ?'analytique'" js/ | grep -v "option value" | wc -l   # → 0
grep -rnE "=== ?'algorithmique'|!== ?'algorithmique'" js/ | wc -l                      # → 17
```

⮕ **Zéro test de comportement sur les deux premiers types ; dix-sept sur le troisième.** Le
témoin dit que le motif trouve bien ce qui existe.
▣ **Le code le dit lui-même**, `js/evaluation-chargement.js:1081` :
`<!-- Interface standard (holistique/analytique) -->` — **un seul écran pour les deux.**

⚠ **Mais l'aide contextuelle promet une différence** (`js/accompagnement-contenu-hover.js:261`) :
*« holistique (tu attribues un niveau global), analytique (tu attribues des points par élément
ou micro-tâche) »*. ⮕ **Le menu offre un choix qui n'en est pas un, et l'aide le décrit comme
s'il en était un.**

↻ **DÉCISION DE GRÉGOIRE, 3 septembre** : *« La grille analytique devrait recevoir le
comportement qu'on lui promet. »* ⛔ **Retirer le choix du menu est donc écarté.**

---

## Ce qu'est vraiment une grille analytique — d'après la sienne, de 2013

*Source : « Évaluation de l'analyse 3 », grille papier qu'il employait avant l'holistique et
l'algorithmique. Elle est la SPÉCIFICATION la plus fiable dont on dispose — pas une
reconstitution.*

▣ **Des points bruts, pas des niveaux.** Sujet amené `/3`, Idée principale `/8`, Explication
`/30` ⮕ TOTAL CONTENU `/70` + QUALITÉ DE LA LANGUE `/30` = NOTE FINALE `/100`.
**Il n'y a nulle part un niveau à attribuer. C'est une arithmétique.**

▣ **Des éléments observables sous chaque critère** — deux ou trois, ordonnés du moins au plus
réussi. Pour « Sujet amené » : *« absent / trop vague / généralisation »* … *« pertinent et
clair / original et intéressant »*.
↻ **Précision de Grégoire, et elle change la nature de la chose** : *« Ce ne sont pas tant des
éléments à cocher. C'est surtout d'avoir une ligne d'éléments observables. Les éléments
observables vont influencer le jugement et le nombre de points qu'on accorde. On pourrait dire
que ce sont des niveaux de réussite. »*
⮕ **Donc ce sont les paliers DE CE CRITÈRE-LÀ, exprimés en mots, et non cochés : lus.**

▣ **Trois choses de plus, qu'aucun des trois types ne sait faire :**
- **des sections** — INTRODUCTION · DÉVELOPPEMENT · CONCLUSION, un regroupement AU-DESSUS des
  critères ;
- **le même critère répété par occurrence** — la colonne « PARAGRAPHES 1 · 2 » : un critère
  évalué deux fois dans la même copie ;
- **des seuils indicatifs en marge** — *42 passable, 49 bien, 56 très bien, 63 excellent*.

⚠ **Et une table de conversion, écrite à la main** : `60% 70% 80% 90%` au-dessus de
`16.8 19.6 22.4 25.2`. **Il convertissait déjà des paliers qualitatifs en points.**

---

## ▣ LA DISTINCTION QUI TIENT — où vit l'échelle, et quelle unité sort

| | l'échelle | ce que le critère produit |
|---|---|---|
| **Holistique** | **une seule, globale à la grille** | un **niveau** |
| **Analytique** | **une par critère**, en mots (les éléments observables), non chiffrée | des **points** |
| **Algorithmique** | **aucune** — un calcul | une **note** |

⮕ **C'est ça que l'holistique ne peut pas faire** : il n'a qu'une échelle, la même pour
« Sujet amené » et pour « Preuve ». **L'analytique donne à chaque critère la sienne.**

▣ **Ce que la structure actuelle offre déjà** : un critère porte `ponderation` (11 sites), et
les sous-critères portent eux aussi une pondération — **visible à l'écran de Grégoire, à 1 sur
chacun de ses onze sous-critères.**
⚠ **Mais `ponderation` n'est pas « des points »** : c'est un poids relatif. **Ne pas confondre
les deux au moment de coder** — `/3` et `/30` ne sont pas des poids, ce sont des maximums.

⚠ **Les sous-critères sont saisis pour tous les types et lus par le seul chemin
algorithmique** (`js/evaluation-calcul.js:438`, où ils servent de catégories de codes
d'erreurs). ⮕ **Pour un critère holistique ou analytique, ce qu'on écrit là n'est lu par
personne.** L'analytique leur donnerait un emploi — **à condition de trancher si les éléments
observables SONT les sous-critères ou une troisième chose.** *(voir ci-dessous)*

---

## ↻ LE PRINCIPE ARRÊTÉ — 3 septembre

> **« La grille devrait être applicable indépendamment de la pratique de notation. »**

▣ **Le code sépare déjà les deux axes** : le type vit dans la grille ; la pratique vit dans
`pratiquesConfigurables` (skill `pratiques-notation`, §2 — familles SOM / STD / SPE / DEN).
**La grille dit comment on juge un travail ; la pratique dit comment les jugements deviennent
une note finale.**

⛔ **Donc aucune grille ne doit être réservée à une pratique**, ni l'inverse.

⚠ **LE POINT DE FRICTION, ET IL EST RÉEL** : une pratique lit une **unité**. PAN-Standards
travaille sur des **niveaux** ; l'analytique produit des **points**. ⮕ **Tant que personne ne
dit comment « 24 sur 30 » devient un niveau, les deux ne s'emboîtent pas.**
▣ **Grégoire ne l'a jamais essayé** : *« J'ai changé de grille et de pratique en même temps. Je
n'ai jamais considéré que je pouvais faire une somme de points et en même temps une pratique
alternative. Il faudrait que j'essaye. »*
⮕ ⛔ **CETTE QUESTION RESTE OUVERTE, VOLONTAIREMENT.** Elle se tranchera par un essai sur ses
données, pas par une décision d'architecture. **Ne pas la refermer d'office en interdisant une
combinaison.**

⮕ **Posture à tenir** (skill `pratiques-notation`, §2 bis) : *l'outil est pluraliste, aucune
famille n'est « la bonne », et aucun texte d'interface ne les hiérarchise.* ▣ **L'analytique
est la pratique majoritaire de la profession** — dans ses mots. **C'est une raison suffisante
pour qu'elle fonctionne bien, indépendamment de ce que Grégoire pratique lui-même.**

---

## Ce qui reste à trancher — avec lui, PAS seul

1. **Les éléments observables sont-ils les sous-critères existants, ou une nouvelle chose ?**
   ⚠ Les sous-critères servent déjà de catégories de codes au chemin algorithmique. **Leur
   donner un second sens est un risque de collision** — à mesurer avant de choisir.
2. **Points ou pondération ?** Un critère analytique porte-t-il un maximum (`/8`) en plus de
   son poids, ou le poids EST-il le maximum ? ⚠ **La somme doit tomber juste** : sa grille
   fait 70 + 30 = 100.
3. **Les sections** (Introduction · Développement · Conclusion) : dans ce chantier, ou plus
   tard ? ⮕ **Elles n'existent nulle part** et ajoutent un niveau à la structure de données.
4. **Le critère répété par occurrence** (« Paragraphes 1 · 2 ») : dans ce chantier, ou jamais ?
5. **Les seuils indicatifs en marge** — sont-ils une aide au jugement à porter dans l'écran, ou
   un artefact du papier ?
6. **Ce que l'analytique fait des grilles existantes.** ⛔ **Aucune grille de Grégoire n'est de
   type analytique aujourd'hui au sens plein** — le type existe, mais ne fait rien. ⮕ **Une
   grille marquée « analytique » aujourd'hui se comporte comme une holistique. Lui donner le
   nouveau comportement CHANGERAIT son écran d'évaluation.** ⚠ **À mesurer avant de livrer :
   combien de grilles portent le type `analytique` dans ses données réelles ?** *Tarir n'est pas
   réparer.*

---

## Ce que ce cadrage ne dit pas

⛔ **Aucune décision de faire ce chantier n'est prise**, et aucun effort n'a été mesuré.
⚠ **Il n'empêche aucun des huit énoncés** — ils sont tous parcourus depuis ce matin.
⮕ **Sa place dans l'ordre appartient à Grégoire.** Élément de son jugement : l'analytique est
ce que la majorité de ses collègues pratique, et la communauté se réunit le **14 septembre**.
