# Consigne du jour — une seule source, une seule façon de choisir, et un badge qui dit vrai

> **Écrite le 3 septembre 2026 à 16 h 15 (heure de Grégoire), par Cowork, avec lui.**
> **Application au moment de l'écriture : `1.113.0`, build `0903-0906`.**
> ▣ **État mesuré** : `HEAD` = `74e22bd0`, **5 commits devant `origin/main`**, non poussés —
> témoin, `HEAD..origin/main` rend **0**. Arbre : `OU-EN-EST-ON.md` et `PROTOCOLE.md` sont à
> Cowork, **ne les commite pas**.
>
> ⚠ **CETTE CONSIGNE VIENT DU COUP D'ŒIL DE GRÉGOIRE**, pas d'une mesure de Cowork. Il a
> regardé l'écran des lots 1 et 2, et il a vu deux choses que les essais ne pouvaient pas voir.
>
> ⛔ **Cinq commits attendent déjà d'être poussés.** ⮕ **Ce lot les rejoint, il ne les
> précède pas.** Si tu juges que la pile devient trop haute, dis-le.
>
> ⚠ **REMESURE** (règle 1). Les lignes citées ont été relevées en lecture seule à 16 h.

---

## A · Une seule façon de choisir une couleur

▣ **Ce que Grégoire a vu** : deux sélecteurs de couleur coexistent, et ils ne suivent pas la
même convention.

| où | ce que c'est |
|---|---|
| **palette des codes** (Annoter) | **12 pastilles prédéfinies + « Personnalisé… »** qui ouvre le sélecteur du système (`js/travaux-outils.js`, `choisirCouleurPalette` / `ouvrirCouleurPerso`) |
| **sous-critères** (Conception, écran neuf du lot 2) | `<input type="color">` **nu** — `js/grilles.js:4083`. Spectre complet, RGB, pipette. **Aucune convention.** |

▣ **Le module de la palette énonce lui-même le principe** (`js/travaux-outils.js:118`) :
*« permettre une couleur hors-palette tout en gardant la convention 12 couleurs prédéfinies »*.
⮕ **L'écran neuf a pris la porte de sortie sans la maison.**

↻ **DEMANDE DE GRÉGOIRE** : *« Simplifier le choix des couleurs, et conserver le système
prédéfini dans la palette pour monter des collections. »*

⮕ **À faire** : le champ **Couleur** des sous-critères adopte le sélecteur de la palette — les
douze pastilles, plus « Personnalisé… ».

⛔ **NE DUPLIQUE PAS LE SÉLECTEUR.** Il existe. **Mesure s'il est appelable depuis Conception ;
s'il ne l'est pas, extrais-le en UNE fonction appelée des deux côtés.** *Une définition, deux
appels* — comme `detacherDeLaFamille`.
⚠ **La liste des douze est UNE constante partagée, pas une copie.** ▣ **Si tu en trouves déjà
deux copies dans le dépôt, dis-le : c'est le doublon d'origine, et il explique le reste.**
⚠ **Les couleurs déjà choisies hors des douze restent affichées telles quelles.** ⛔ **On change
le CHOIX, pas ce qui est enregistré.** *Tarir n'est pas réparer.*

---

## B · Une seule source de vérité pour les codes — et l'écran le DIT

### La règle, arrêtée par Grégoire

> **« Il faut une SSOT. C'est maintenant la grille. »**
> ⮕ Précisé par lui, et c'est la formulation qui fait foi :
> **« Une grille analytique pourrait utiliser les mêmes codes. Donc les paramètres de la
> palette sont INDÉPENDANTS de la grille. Mais dans une grille algorithmique, si l'on coche
> "Utiliser ces sous-critères comme codes d'annotation", les paramètres de la palette sont en
> LECTURE SEULE, dont la source est la grille. »**

▣ **La SSOT n'est pas « un seul écran ». C'est UNE SEULE SOURCE PAR COPIE.**

| la copie | qui commande | ce que la palette fait |
|---|---|---|
| gouvernée par une grille (case cochée, `codesDepuisSousCriteres`) | **la grille, seule** | **lecture seule** — elle dit d'où viennent les codes |
| sans grille | **le repli** (les dix, avec la personnalisation globale) | **éditable, comme aujourd'hui** |

⛔ **NE RETIRE PAS L'ÉDITION DU REPLI.** ▣ **Motif** : les dix portent les noms courts de
Grégoire — « Accord GV », « Accord PP » — ses couleurs et son ordre, dans
`personnalisationErreursFr` et `ordreErreursFr`. **Appliquer « SSOT = la grille » à la lettre
lui retirerait la seule façon de les régler.** Le module le dit déjà
(`js/codes-annotation.js:43`) : ce sont *« les clés globales que l'écran Annoter › palette
continue de régler »*.

### Ce qui manque, et c'est le travail

**Aujourd'hui la palette n'annonce rien.** Quand une copie est gouvernée par sa grille, elle
affiche encore ses champs de nom et de couleur **comme s'ils comptaient**.
⮕ **C'est exactement le silence que les huit énoncés ont passé deux jours à supprimer** : un
écran qui laisse croire qu'un geste aura un effet.

↻ **LA PHRASE, ARRÊTÉE PAR GRÉGOIRE — écris-la telle quelle :**

```
Les codes de cette copie viennent de sa grille « X ». Pour les modifier, ouvre la grille.
```

▣ **Motif de son choix, en une ligne** : *quelqu'un qui lit ça veut agir, pas comprendre
l'architecture.* Une seconde formulation, qui expliquait ce que l'écran sert encore, a été
écartée pour cette raison.
⚠ **« X » est le nom réel de la grille.** ⛔ **Ne mets pas d'identifiant.**
⮕ **Ce que tu décides seul** : la forme (bandeau, encart), et si les champs sont grisés ou
masqués. ⚠ **Dis ce que tu as choisi.**

---

## C · Les cases « Pratiques compatibles » partent, et le badge dit enfin quelque chose de vrai

⛔ **VOLET DÉTACHABLE. Si le lot devient trop gros, fais A et B, commite, et dis que C attend.**

### Ce qui est mesuré

▣ **Les cases ne font RIEN.** `pratiquesCompatibles` rend **29 lectures hors `grilles.js`**, et
le motif qui cherche un filtre, une garde ou un refus autour d'elles rend **0**. Ce sont des
lectures d'affichage et de transport (import/export).
▣ **Confirmé par Grégoire** : *« Les cases ici sont sans conséquence. Elles ne font que nommer
l'intention de l'auteur. Elles pourraient disparaître et ça n'aurait aucun effet. »*
⚠ **Une fonction `filtrerParPratique` existe** (`js/gabarits-utils.js:88`) — **personne ne
l'appelle pour bloquer**. Quelqu'un avait prévu ce filtrage. **Mesure ses appelants avant de
décider de son sort**, et applique les trois issues de `CLAUDE.md`.

▣ **CINQ OBJETS PORTENT CES CASES, pas seulement les grilles** :
`lirePratiquesSelectionnees` est appelé pour **`grille`, `cartouche`, `echelle`, `objectifs`,
`production`**. Le badge est rendu sur les mêmes, plus la liste des productions.

### ↻ CE QUE GRÉGOIRE A TRANCHÉ

> **« Il serait mieux de les retirer. »** puis, sur le périmètre : **« Tout d'un coup. Les
> grilles sont indépendantes des pratiques de toute façon. »**

1. **La SAISIE part des cinq objets.** L'écran n'offre plus de cocher une pratique.
2. **Les grilles gagnent un badge déduit** — voir ci-dessous.
3. **Les quatre autres objets perdent leur badge**, sans remplaçant. ▣ **Accepté par lui** :
   rien ne permet de déduire une pratique d'une échelle ou d'une cartouche.

### ⛔ CE QUI NE DOIT PAS BOUGER — le champ reste dans les données

**On retire la SAISIE, pas le CHAMP.** `pratiquesCompatibles` vit dans ses grilles enregistrées,
et il **voyage dans les imports-exports** (`js/import-export.js`, validé en `arrayStrings`).
⛔ **Ne le supprime d'aucune donnée. Ne l'écris plus, c'est tout.** ⚠ **Le schéma d'import et de
partage continue de l'accepter** — une grille reçue d'un collègue en version antérieure le
portera. *Tarir n'est pas réparer.*

### Le badge neuf — sur les grilles seulement

**Il ne nomme plus une pratique. Il nomme la COMPOSITION de la grille**, déduite des types de
ses critères. ▣ **Décision de Grégoire** : *« Le type quand il est unique, "Mixte" sinon. »*

| la grille | le badge |
|---|---|
| tous ses critères sont algorithmiques | **ALGO** |
| tous holistiques | **HOLIS** |
| tous analytiques | **ANALY** |
| plusieurs types | **MIXTE** |
| aucun critère | *(rien)* |

⚠ **Les libellés exacts sont à Grégoire** — ceux du tableau sont une proposition. **Montre-lui
ce que tu écris avant de commiter si tu t'en écartes.**

▣ **Motif, et il est mesuré à l'écran** : **Grégoire encode déjà cette information à la main
dans ses noms de grilles** — « G5 FR-**HOLIS** A26 », « G5 FR-**ALGO** A26 », « G1 FR-**ALGO
seul** A26 ». ⮕ **Le badge le dispense de le faire, et il dit vrai même quand un type de critère
change après coup.**
⮕ **C'est l'esprit de tout ce qui a été livré aujourd'hui : l'écran annonce ce qui EST, pas ce
qu'on a déclaré.**

⚠ **`genererBadgesPratiques` est appelé sur six sites** (3 dans `grilles.js`, et un dans
`cartouches.js`, `echelles.js`, `objectifs.js`, `productions-liste.js`). ⮕ **Ne le détourne
pas** : les cinq autres objets n'ont pas de critères. **Une fonction neuve pour les grilles, et
les appels des autres objets rendent une chaîne vide.**

---

## Fini quand

**Un enseignant sait toujours d'où viennent les codes qu'il voit, et n'a jamais deux endroits
pour régler la même chose.**

▣ **Le témoin** : sur une copie dont la grille a la case cochée, la palette affiche la phrase et
n'édite plus. Sur une copie sans grille, elle édite exactement comme avant.
▣ **Le témoin négatif, qui compte autant** : les dix codes de repli restent **modifiables**, et
la personnalisation de Grégoire (noms courts, couleurs, ordre) est intacte au caractère près.
▣ **Le témoin du sélecteur** : `grep -c "type=\"color\"" js/grilles.js` rend **0**, et le
compte des appels au sélecteur de la palette a augmenté d'autant.
▣ **Le témoin du volet C** : `grep -rn "lirePratiquesSelectionnees" js/` ne rend plus que sa
définition — **zéro appelant**. ⚠ **Et le témoin INVERSE, qui compte autant** :
`grep -rn "pratiquesCompatibles" js/import-export.js` rend **le même compte qu'avant**. **Si
celui-là a bougé, tu as touché au transport des données.**

---

## L'ordre

1. **Rapporte le verdict de GitHub sur `1.113.0`**, et **dis où en est la pile des 5 commits**.
2. **A d'abord** (le sélecteur) — c'est le plus petit, et il ne touche pas la logique.
3. **Puis B.**
4. **C en dernier, et seulement si le lot reste tenable.** ⛔ **Il touche cinq écrans : c'est
   celui qui peut faire déborder.** Mieux vaut trois lots vérifiables qu'un lot que Grégoire ne
   peut pas parcourir.
5. Ce lot touche `js/` ⮕ **bump du bloc de jetons d'`index.html`**.
6. `cd tests && npm run test:unit` pour travailler ; **`npm test` complet avant de dire que
   c'est prêt.** ⚠ Vitest se lance **depuis `tests/`**.
7. ⛔ **Tu commites, puis tu t'arrêtes.**
8. **Ce fichier se commite avec ton lot.** Nomme tes fichiers ; pas de `git add -A`.

⮕ **CE QUE GRÉGOIRE DOIT ALLER VOIR** : ouvrir la palette des codes sur une copie **dont la
grille a la case cochée** — elle doit afficher la phrase et ne plus éditer. Puis sur une copie
**sans grille** — elle doit éditer comme avant, avec ses noms courts intacts. ⚠ **Ne rien
modifier**, lire suffit.
