# Cadrage — l'Inspecteur travaille sur une sélection, pas sur un bloc

> **Écrit le 3 septembre 2026 au matin, par Cowork, avec Grégoire.**
> **Ce n'est PAS une consigne — rien n'est à coder.** C'est une idée de Grégoire, mise au net
> pendant qu'elle est fraîche, avec l'inventaire mesuré de l'écran actuel.
> Application au moment de l'écriture : **1.111.2**, build `0903-0544`.
>
> ⛔ **Ça n'empêche aucun des huit énoncés.** À prendre quand ils seront finis, ou le jour où
> quelqu'un ouvre l'Inspecteur pour une autre raison.

---

## D'où vient l'idée

**Elle naît d'un problème plus petit qu'elle.** Grégoire voulait retirer « Détacher de sa
famille de clones » du menu Actions pour ne le garder que dans l'Inspecteur, où vit déjà
« Cloner (lié) ». Mesure faite : le bouton du menu Actions agit sur la **multisélection**, que
l'Inspecteur ne couvre pas. Le retirer aurait supprimé le déclonage en lot.

▣ **Sa réponse, et c'est elle le cadrage** : *« On pourrait imaginer qu'il est possible de
sélectionner plusieurs items. Et quand on ouvre l'inspecteur, il ne présente que ce que les
items ont en commun et ne rend modifiable que ces éléments. Si cinq éléments ont en commun
d'être des clones, le clonage ou le déclonage apparaît possible. Par contre, puisque ces items
ont probablement des noms différents, on ne peut pas modifier d'un coup tous les noms. »*

⮕ **C'est le modèle des éditeurs à inspecteur** — Numbers et Keynote, qui sont ses références
de travail, Figma, Sketch. **L'inspecteur décrit une SÉLECTION, pas un objet.**

---

## Ce que ça règle, et ce n'est pas qu'une commodité

▣ **La commande cesse d'exister en double.** Aujourd'hui, un geste sur plusieurs blocs vit dans
le menu Actions et un geste sur un bloc vit dans l'Inspecteur. **Deux endroits, deux libellés
possibles, deux occasions de diverger.**
▣ **Le manque d'origine disparaît de lui-même.** L'Inspecteur annonce la famille de clones
(« 2 instances · Voir les autres ») et n'offre pas d'en sortir. Un inspecteur qui décrit une
sélection offre les gestes qui s'appliquent à elle — le déclonage en fait partie.
▣ **Grégoire a cherché au bon endroit et n'a pas trouvé.** C'est la leçon de la note du
2 septembre, et elle vaut plus que le bouton : *l'auteur de l'application est celui qui la
connaît le mieux ; s'il ne trouve pas, personne d'autre ne trouvera.*

---

## L'état mesuré de l'Inspecteur — à rejouer avant de coder

Le panneau vit dans `index.html`, sous `id="planif-panneau"`. Ses parties, mesurées :

| id | ce qu'il porte |
|---|---|
| `planif-panneau-titre` | le nom du bloc |
| `planif-panneau-type` | son type |
| `planif-panneau-duree` *(à confirmer)* | sa durée |
| `planif-panneau-description` | son texte libre |
| `planif-panneau-pastille` | sa couleur / son repère |
| `planif-panneau-clone-info` | **« N instances · Voir les autres »** — il ANNONCE la famille |
| `planif-panneau-extra` | le reste |

▣ **Le geste de déclonage, lui, est déjà multiple** : `detacherDeLaFamille(noeudIds)`
(`js/planification-carte.js:3628`) prend **une liste**, calcule l'ensemble à détacher avant
d'écrire, et rend le nombre de blocs traités. **La fonction n'a rien à apprendre ; c'est
l'écran qui ne sait pas lui parler.**

⚠ **Remesure tout ça** : ces identifiants ont été relevés par Cowork en lecture seule, et les
lignes de ce fichier bougent souvent.

---

## ⛔ LE PIÈGE, ET C'EST LUI QUI DÉCIDE SI LE CHANTIER EST BON

**Un champ qui affiche une valeur commune et l'écrit sur toute la sélection détruit en silence
ce qui différait.**

Cinq blocs aux noms différents, un champ « titre » qui montre le premier nom parce qu'il faut
bien montrer quelque chose, un clic ailleurs, et les cinq portent le même nom. **Rien ne
signale la perte, et l'annulation est le seul recours.**

⮕ **La règle à tenir** : un champ dont les valeurs diffèrent affiche « valeurs multiples » (ou
son équivalent visuel) et **n'écrit rien tant que l'utilisateur ne l'a pas modifié
délibérément**. C'est la différence entre « je n'ai pas touché ce champ » et « j'ai voulu cette
valeur pour tous ».

⚠ **C'est là que ce genre d'inspecteur se rate, et ça se teste mal** : le cas dangereux n'est
pas un clic, c'est un non-clic.

▣ **Deux catégories, à ne pas confondre :**
- **Les PROPRIÉTÉS** (titre, durée, description) — écriture en lot dangereuse, règle ci-dessus.
- **Les GESTES** (cloner, décloner, supprimer) — ils s'appliquent naturellement à un ensemble,
  et ne détruisent rien qu'on n'ait demandé. **Ce sont eux qui motivent le chantier.**

⮕ **Une voie moins coûteuse existe, et elle mérite d'être pesée** : n'ouvrir la sélection
multiple qu'aux GESTES, et laisser les propriétés au bloc unique. On gagne tout ce que Grégoire
cherche, sans le piège. **À trancher par lui.**

---

## Ce qui reste à décider avant d'en faire une consigne

⏳ **Le libellé du geste.** Grégoire a arrêté le 3 septembre : *« décloner »*, pas *« détacher
de sa famille »*. Motif : *« rendre réversible le clonage, plutôt que de prolonger la métaphore
génétique ou généalogique »*.
⚠ **Le risque du mot, nommé et non résolu** : « décloner » peut se lire « supprimer le clone ».
Le geste ne détruit rien. ⮕ **Le texte à côté doit dire ce qui NE se passe pas.**

⏳ **La portée du chantier** : gestes seulement, ou propriétés aussi (voir le piège).

⏳ **Ce qu'un inspecteur multiple montre quand la sélection est hétérogène** — cinq blocs dont
trois sont clonés : le déclonage s'offre-t-il pour les trois, ou se désactive-t-il ?
▣ Le comportement actuel du menu Actions est mesuré et peut servir de précédent : il se
désactive quand **rien** de sélectionné n'appartient à une famille, et traite ce qui s'applique
sinon. **C'est déjà une réponse : agir sur ce qui s'applique.**

---

## Le geste minimal, si on ne fait pas le chantier

**Le même libellé aux deux endroits.** « Décloner » dans le menu Actions et « Décloner » dans
l'Inspecteur, appelant la même fonction, sans dupliquer la logique, sans retirer celui du menu
— il sert le lot.

▣ **C'est ce que Grégoire a retenu pour aujourd'hui.** Ce cadrage attend son tour.
