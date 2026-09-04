# Note — « Détacher de sa famille » existe, mais pas là où on le cherche

> **Écrite le 2 septembre 2026 en soirée, par Cowork, à la demande de Grégoire.**
> **Aucune fonction ne manque. Rien n'est à coder pour rendre le geste possible.**
> ⮕ Ce qui manque est un **emplacement**, et la trouvaille est *comment* le manque s'est
> manifesté.

---

## Ce qui s'est passé

Grégoire travaillait sa carte d'alignement pédagogique. Il a sélectionné un bloc marqué **🧬**
(« 2 instances · Voir les autres »), ouvert **l'Inspecteur**, et demandé : *« J'aimerais avoir la
possibilité de "décloner" une carte. »*

▣ **La fonction existe, entière, depuis le 16 août 2026.**

## La mesure

```bash
grep -n "detacherDeLaFamille" js/planification-carte.js
grep -n "planif-btn-detacher-clone" index.html
```

· **`detacherDeLaFamille(noeudIds)`** — `js/planification-carte.js:3628`. Elle désindexe le clone,
  remet `cloneSourceId` à `null`, recalcule l'indicateur 🧬 de l'original **et** des membres
  restants, enregistre un point d'annulation, et rend le nombre de blocs détachés.
· **Le bouton** — `index.html:4184`, `id="planif-btn-detacher-clone"`, libellé
  **« Détacher de sa famille de clones »**, avec son infobulle.
· **Son emplacement** : le **menu Actions** de la carte, entre « Nettoyer les repères de semaine »
  et « Liens : contourner les blocs ».
· Il agit sur la **multisélection**, se **désactive** quand rien de sélectionné n'appartient à une
  famille, et **dit ce qu'il a fait** : *« Bloc détaché — il ne suivra plus son original, et son
  original ne le suivra plus. Son contenu est inchangé. »*

▣ **Rien à corriger dans le comportement. Il est complet, prudent et bien écrit.**

## Le défaut, et il est petit mais net

**L'Inspecteur d'un nœud offre trois gestes de la famille de clones et pas le quatrième :**

| dans l'Inspecteur | |
|---|---|
| « 2 instances · Voir les autres » | ▣ il ANNONCE la famille |
| **Copier** | créer une copie indépendante |
| **Cloner (lié)** | créer un membre de plus |
| **Supprimer ce nœud** | retirer ce membre |
| *— absent —* | **quitter la famille sans rien détruire** |

⮕ **L'Inspecteur nomme la famille, puis n'offre pas d'en sortir.** Celui qui la voit là cherche
la sortie là. C'est exactement ce qui est arrivé.

▣ **Et le mot « décloner » n'existe nulle part dans l'application** : le geste s'appelle
« détacher ». Un utilisateur qui cherche le premier ne trouve pas le second.

## Ce qu'il y aurait à faire — petit

**Ajouter le bouton « Détacher de sa famille » à l'Inspecteur**, à côté de « Cloner (lié) », visible
seulement quand le nœud porte un `cloneSourceId` ou qu'il a des clones.
⛔ **Sans dupliquer la logique** : le même `detacherDeLaFamille`, le même toast, la même annulation.
⚠ **Et sans retirer celui du menu Actions** — il sert la multisélection, que l'Inspecteur ne couvre
pas.

## ⛔ Ce que ça vaut, et quand

**Ça n'empêche aucun des huit énoncés.** La carte d'alignement n'est sur aucun d'eux, et le geste
est déjà possible.
⮕ **Issue 2 de `CLAUDE.md` — inscrire et continuer.** Ce n'est pas un chantier, c'est une ligne à
prendre le jour où quelqu'un touchera l'Inspecteur pour une autre raison.

⚠ **Mais il porte une leçon plus large que lui**, et c'est pour elle que cette note existe :
▣ **Grégoire a cherché au bon endroit et n'a pas trouvé.** C'est le même motif que la journée du
2 septembre a répété trois fois ailleurs — *quelque chose existe, et personne ne va le chercher là
où il est*. La CI rouge que personne ne lisait, le verdict Playwright jamais consulté, et
maintenant un bouton dans le mauvais menu.
⮕ **L'auteur de l'application est celui qui la connaît le mieux.** S'il ne trouve pas, personne
d'autre ne trouvera.
