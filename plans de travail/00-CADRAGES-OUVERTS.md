# Les cadrages ouverts — ce qui est pensé mais pas commencé

> **Écrit le 3 septembre 2026 au soir, par Cowork, à la demande de Grégoire.**
> **Motif, dans ses mots** : *« Les documents devraient être référencés dans un document de
> cadrage afin qu'on ne les perde pas de vue. »*
> Application au moment de l'écriture : **1.113.0** en ligne, build `0903-0906`.
>
> ⛔ **CE FICHIER NE PORTE AUCUN CONTENU PROPRE.** C'est une porte d'entrée. Chaque cadrage
> reste la source, et un cadrage ne se résume pas ici — il se lit.
> ⚠ **`plans de travail/` contient plus de cent trente fichiers**, dont l'écrasante majorité
> est exécutée depuis des semaines. **Sans cette page, un cadrage vivant s'y noie.**
>
> ⮕ **Tenu par Cowork.** Un cadrage qui devient une consigne quitte cette liste ; un cadrage
> neuf y entre le jour où il est écrit.

---

## ▣ CE QUI EST OUVERT AUJOURD'HUI — six chantiers, un seul entamé

*Aucun n'empêche un des huit énoncés de la cohorte 1 : ils sont tous parcourus depuis le
3 septembre au matin. Ces quatre-là traitent l'**adoption** et la **justesse**, pas la ligne
d'arrivée qui vient d'être franchie.*

### 1 · Le texte troué — `CADRAGE-2026-09-02-badges-texte-troue.md`
**Composer la phrase que l'élève lira en posant ses variables d'un clic**, au lieu de taper des
accolades. Modèle de Grégoire : la cellule de formule dans Numbers.
▣ **SEUL CHANTIER ENTAMÉ** : l'étape 1 (les quatre énoncés de rétroaction) est livrée et vue à
l'écran. ⏳ Restent les paliers de projection, puis les accolades qui disparaissent, puis les
badges que l'enseignant invente.
⚠ **La palette n'est pas celle du cadrage** : le bloc des énoncés connaît **quatre** repères
(`{critere}`, `{erreurs}`, `{mots}`, `{points}`), pas dix. Mesuré le 3 septembre.

### 2 · Les codes par grille — `CADRAGE-2026-09-03-codes-par-grille.md`
**Les dix codes d'erreurs de français cessent d'être écrits dans le code.** La grille porte sa
liste ; sans liste, on retombe sur les dix — donc **rien à réparer dans les données**.
⛔ **LIRE SA SECTION « NOMENCLATURE » EN PREMIER** : un **code** identifie et compte, un
**tampon** commente et se restitue. Ce cadrage s'appelait « tampons » et c'était faux.
↻ **Tranché** : les codes SONT les sous-critères · les tampons restent **restitués**, pas
interprétés (phase 1).

### 3 · La grille analytique — `CADRAGE-2026-09-03-grille-analytique.md`
**Le menu offre un choix qui n'en est pas un** : `grep` rend **0** test de comportement sur
« holistique » comme sur « analytique », contre **17** sur « algorithmique ».
↻ **Décision** : l'analytique reçoit le comportement promis — des **points** et des **éléments
observables par critère**, là où l'holistique n'a qu'une échelle globale.
▣ **Spécification** : la grille papier de Grégoire, « Évaluation de l'analyse 3 » (2013).
⏳ **Six points ouverts**, dont le mariage avec les pratiques de notation — **laissé ouvert
volontairement** : il se tranchera par un essai sur ses données.

### 4 · L'Inspecteur de sélection — `CADRAGE-2026-09-03-inspecteur-selection-multiple.md`
**Sélectionner plusieurs blocs, et l'Inspecteur n'offre que ce qu'ils ont en commun.**
⛔ **Le piège est nommé dedans** : un champ qui écrit une valeur commune sur toute la sélection
détruit en silence ce qui différait. ⮕ Une voie moins coûteuse y est proposée — n'ouvrir la
sélection multiple qu'aux **gestes**, pas aux **propriétés**.

### 5 · Les collections de paramètres — `CADRAGE-2026-09-03-collections-de-parametres.md`
**Enregistrer un jeu de paliers sous un nom (« EUF ») et le retrouver dans une grille neuve**, au
lieu de repartir des défauts à chaque critère algorithmique.
⛔ **LA DEMANDE VISAIT LE MAUVAIS MENU** : l'EUF n'est pas une **formule** (combien l'élève perd),
c'est une **projection** (où il se situe) — et ce choix existe déjà, sous le nom « Norme externe
(épreuve uniforme) ». Les fondre referait le défaut que septembre vient de défaire.
▣ **Ce qui manque est ailleurs** : le registre des modèles est une liste fermée dans le code.
L'enseignant règle, mais **n'enregistre pas sous un nom**.
↻ **Le mécanisme d'accueil existe** : la bibliothèque range déjà quatre familles d'objets nommés
(grilles, échelles, pratiques, productions). Une échelle **est** déjà une collection de paramètres.
⚠ **Un point ouvert, pour Grégoire** : copie ou lien. Une collection corrigée doit-elle changer ce
qu'un élève a déjà lu ? **Recommandation : la copie** — une phrase, contrairement à un niveau, se
réécrit en silence.

### 6 · Replier le gabarit algorithmique — `CADRAGE-2026-09-03-accordeons-gabarit-algorithmique.md`
**Le gabarit du critère algorithmique est trop long** ; ses sections se replient en bandes bleues,
comme dans Cadre et dans l'aide. ▣ **Le composant existe** — une bascule unique
(`pratiques.js:2113`) et une délégation qui a déjà remplacé 78 gestionnaires écrits à la main.
↻ **Tranché par Grégoire** : **ouvert ce qui porte la note** (modèle de formule, paramètres,
sous-critères) · **fermé ce qui porte les mots** (énoncés, paliers de projection, codes).
⚠ **Le piège est nommé, et il ne se voit qu'en tapant** : le gabarit se redessine en entier à
chaque frappe (`grilles.js:5025`, `5039`, `5051`). Un pli qui vit dans le DOM se refermerait sous
les doigts. ⮕ **L'état vit en mémoire, jamais dans les données de la grille.**

---

## ⏳ INSCRIT AILLEURS, ET QUI N'A PAS DE CADRAGE

- **Corriger une échelle, avec recalcul proposé** — décidé le 3 septembre, dans
  `plans de travail/DECISION-2026-09-03-echelle-remplacement.md`. **Jamais automatique** :
  *« il permet d'informer l'utilisateur des conséquences de son geste »*.
- **Dire qu'un document reçu est une copie** (#696), au partage ou à la réception — pas dans une
  fenêtre de suppression.
- **Un remplacement d'échelle interrompu** : l'ancienne survit et relancer termine le travail,
  **mais l'écran ne le dit pas**. Inscrit sous #648.
- **Les essais à la main sur iPad.** Le dernier point de « ce qui n'appartient qu'à Grégoire ».

---

## ⛔ CADRAGES ANCIENS — à trier, pas à exécuter

*Ils sont dans le même dossier et se confondent avec les vivants. **Aucun n'a été remesuré.**
⚠ Avant d'en ouvrir un : vérifier qu'il n'a pas été exécuté depuis.*

| fichier | date | état |
|---|---|---|
| `CADRAGE-2026-09-01-front-evaluations-et-code-en-dur.md` | 1er sept. | à remesurer |
| `CADRAGE-320-repertoires-bibliotheques.md` | — | à remesurer |
| `CADRAGE-327-classement-transversal-biblios.md` | — | à remesurer |
| `CADRAGE-briques-C-D-namespacing.md` | 26 juin | ▣ le namespacing a été livré depuis — **probablement périmé** |
| `CADRAGE-guides-pedagogiques-post-AQPC.md` | 2 juin | à remesurer |
| `CADRAGE-premier-essai-verification-adverse-338.md` | — | à remesurer |

---

## Comment cette page se tient

▣ **Un cadrage entre ici le jour où il est écrit**, avec une ligne : ce qu'il vise, et ce qui y
est tranché.
▣ **Il en sort quand il devient une consigne** — et la consigne, elle, vit dans
`plans de travail/CONSIGNE-DU-JOUR.md`, une seule à la fois.
⚠ **Ce fichier ne dit jamais l'état du code.** Pour ça : `OU-EN-EST-ON.md` et le dépôt. **Une
ligne d'ici qui contredit une mesure a tort.**
