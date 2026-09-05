# Cadrage — le texte troué : composer la rétroaction algorithmique avec des badges

> **Écrit le 2 septembre 2026 en après-midi, par Cowork, avec Grégoire.**
> **Ce n'est pas une consigne** — rien n'est à coder. C'est une idée de Grégoire, mise au
> net pendant qu'elle est fraîche, avec l'inventaire mesuré de l'écran actuel.
>
> **Maquette manipulable** : artefact « Le texte troué » (favicon 🏷️). Elle ne touche à rien
> dans l'application.

---

## D'où vient l'idée

**Les mots de Grégoire, le 2 septembre :** *« La page du critère algorithmique est vraiment
très complexe, et je crains que cette complexité ne fasse fuir les utilisateurs. […] Elle est
très codage entre guillemets. »*

Son modèle : **la cellule de formule dans Numbers**, où les variables apparaissent comme des
pastilles qu'on manipule, pas comme du texte à taper.

⮕ **Le geste proposé** : l'enseignant écrit sa phrase, et **glisse** dedans les valeurs qu'il
veut voir apparaître. Il compose un *texte troué* et met les badges dans les trous.

▣ **L'idée a déjà sa preuve, et elle date du matin même.** Grégoire a tapé `[service]` au lieu
de `{service}` dans une phrase de recommandation. Le texte avait l'air juste à l'écran, et son
élève aurait lu le crochet. **Un badge ne se tape pas — il se glisse. Cette classe d'erreur
disparaît.**

---

## ⚠ LA DISTINCTION QUI COMMANDE TOUT LE RESTE

Il y a **deux familles de variables**, et elles ne se comportent pas pareil.

| | D'où vient la valeur | Exemples | Varie |
|---|---|---|---|
| **Tu les poses** | Le formulaire, une fois | nom du service, seuil, longueur de référence, facteur | jamais |
| **Elles se remplissent** | La correction, copie par copie | erreurs, mots, projection, niveau, note | à chaque élève |

▣ **Le formulaire actuel EST déjà la frontière.** Tout ce qui y est écrit (600, 900, 30,
« Passerelle + ») est posé par l'enseignant. Et juste en dessous, une phrase de l'écran annonce
l'autre famille : *« Lors de l'évaluation, tu saisiras le nombre d'erreurs et le nombre de mots
de la rédaction. »*

⛔ **Deux couleurs obligatoires.** Si les deux familles se ressemblent, l'enseignant cherchera
un jour où saisir la valeur d'`{erreurs}` — et ne la trouvera pas, parce qu'elle n'existe pas
avant la correction.

↻ **Reformulation exacte, arrêtée avec Grégoire :** il avait d'abord dit *« l'enseignant
détermine la valeur de chacune des variables »*. La formule juste est :
> **L'enseignant détermine la PLACE de chaque variable, et la VALEUR de celles qui lui
> appartiennent. Pour les autres, il choisit seulement s'il veut les montrer.**

---

## L'inventaire de l'écran actuel — mesuré le 2 septembre

Commandes qui l'ont produit, à rejouer :

```bash
grep -n "rendreBlocFormuleAlgo\|rendreBlocProjectionAlgo\|rendreBlocEnoncesAlgo" js/grilles.js
grep -n "libelle: '" js/evaluation-formules.js js/evaluation-projection.js js/evaluation-enonces.js
```

Un critère **algorithmique** ouvre **trois blocs**, rendus par trois fonctions de `js/grilles.js` :

### Bloc 1 · Modèle de formule *(`rendreBlocFormuleAlgo`)*
Un choix parmi trois — **Pénalité normalisée**, **Ratio mots par erreur**, **Pénalité fixe par
erreur** — et **un nombre** par modèle (« Facteur de normalisation », « Ratio visé », « Points
retirés par erreur »).
⮕ **Ce bloc produit la NOTE. Il ne contient aucun texte.**

### Bloc 2 · Modèle de projection *(`rendreBlocProjectionAlgo`)*
Un choix (**Norme externe** / **Aucune projection**), ses paramètres — longueur de référence,
erreurs tolérées, **nom du service d'aide**, lien d'inscription — puis **N paliers**, chacun
avec quatre champs : `Palier` (son nom), `Jusqu'à` (le seuil), **`Ce que l'élève lit`**,
**`Phrase de recommandation (facultative)`**.
⮕ **Ce bloc produit le VERDICT et la phrase qui l'accompagne.**

### Bloc 3 · Modèle de rétroaction *(`rendreBlocEnoncesAlgo`)*
Un choix entre **Générique (nom du critère)** et **Français écrit (formulations d'origine)**,
puis **quatre textes** : `Décompte des erreurs`, `Défi prioritaire`, `Quand tout est maîtrisé`,
`Aucune annotation`.
⮕ **Ce bloc produit les PHRASES engendrées sous le critère et dans le PDF de l'élève.**

---

## La transposition, champ par champ

| Champ actuel | Devient | Note |
|---|---|---|
| Modèle de formule *(le choix)* | **inchangé** — reste une liste | ce n'est pas du texte |
| Facteur / ratio / points retirés | **inchangé** — reste un nombre | ⮕ mais **devient un badge posable** dans les textes |
| Modèle de projection *(le choix)* | **inchangé** | |
| Longueur de référence, erreurs tolérées | **inchangé** — nombres | ⮕ **badges posables** |
| Nom du service d'aide, lien | **inchangé** — textes courts | ⮕ **badges posables** |
| Palier : son nom, son seuil | **inchangé** | |
| **Palier : « Ce que l'élève lit »** | **composeur à badges** | × N paliers |
| **Palier : « Phrase de recommandation »** | **composeur à badges** | × N paliers |
| Modèle de rétroaction *(le choix)* | ⚠ **change de nature** — voir plus bas | |
| **Les quatre énoncés** | **composeur à badges** | décompte, priorité, concentré, aucune |

▣ **Compte** : `2 × N paliers + 4` champs de texte deviennent des composeurs. Avec les quatre
paliers d'une grille type, ça fait **douze**.

### ⛔ CE QUI NE SE TRANSPOSE PAS, ET C'EST LE BLOC 1

**Le modèle de formule ne contient aucun texte.** Un choix parmi trois, et un nombre. Il n'y a
rien à trouer. ⮕ **Il reste un formulaire, et c'est bien ainsi** : c'est lui qui calcule la
note, et une note ne se compose pas à la main.
⚠ **Ne pas chercher à l'uniformiser avec le reste par cohérence visuelle.** Deux natures
différentes ont le droit d'avoir deux formes.

### ▣ LA VRAIE PRISE : le « modèle de rétroaction » cesse d'être un menu

Aujourd'hui, l'enseignant **choisit entre deux formulations toutes faites** : « Générique » ou
« Français écrit ». S'il n'est ni l'un ni l'autre, il choisit la moins fausse.
⮕ **Avec les badges, il écrit la sienne.** Les deux modèles deviennent des **points de départ à
dupliquer**, pas une liste où il faut se ranger.
⮕ **C'est le gain le plus direct sur l'énoncé 4** — plus personne ne lit dans son interface une
discipline qui n'est pas la sienne, parce que la phrase est la sienne.

---

## La palette de badges — première proposition

↻ **Tranché par Grégoire le 2 septembre : palette FIXE d'abord.** Des badges conçus par nous,
documentés par nous. Les badges personnalisés viendront **dans une version ultérieure**, quand
l'usage aura été éprouvé.
**Son motif, dans ses mots :** *« Quand il saura comment bien les utiliser, et que nous aurons
testé le tout. »*
⮕ **Motif complémentaire, de Cowork :** une palette fixe se documente — chaque badge peut porter
sa phrase d'explication. Des badges inventés par chacun, personne ne peut les documenter à sa
place, et l'écran redevient du codage.

**Famille « tu les poses »** — depuis le formulaire :
`{service}` · `{lien}` · `{seuil}` · `{longueur}` · `{facteur}`

**Famille « elles se remplissent »** — depuis la correction :
`{erreurs}` · `{mots}` · `{projection}` · `{niveau}` · `{note}`

---

## Ce qui reste ouvert — à trancher avec Grégoire, PAS à décider seul

1. **Tous les badges sont-ils offerts dans tous les champs ?** `{niveau}` a-t-il un sens dans
   « Aucune annotation » ? Un badge offert là où il ne peut rien valoir est un piège.
2. **Que fait un badge sans valeur ?** ▣ **La règle existe déjà dans le code** et elle est
   fine : une phrase où le jeton est en apposition (« … de ton collège : {service}. ») perd
   l'apposition ; une phrase où il est complément (« t'inscrire au {service}. ») **tombe en
   entier**, plutôt que de servir « t'inscrire au . » à un élève. ⮕ **La réutiliser, ne pas la
   réinventer.**
3. **Et la préposition ?** ⚠ « t'inscrire **au** Centre d'aide » se dit ; « t'inscrire **au**
   Passerelle + » ne se dit pas. **Aucun code ne peut deviner le genre d'un nom que
   l'utilisateur n'a pas encore écrit.** Un badge ne règle pas ça. Faut-il que le badge porte un
   avertissement, ou laisse-t-on la phrase entièrement libre comme aujourd'hui ?
4. **Les douze composeurs à l'écran en même temps** — est-ce plus simple ou moins ? La maquette
   n'en montre qu'un.
5. **iPad.** Le glisser-déposer au doigt n'est pas le glisser-déposer à la souris. ⮕ **Le clic
   pour insérer au curseur doit rester le chemin principal**, le glissé étant le confort.
6. **Les textes existants.** Les grilles déjà écrites portent des phrases sans badges. Elles
   doivent continuer de fonctionner telles quelles — **tarir n'est pas réparer**, et ici il n'y
   a même rien à tarir.

---

## Ce que ce cadrage ne dit pas

⛔ **Aucune décision de faire ce chantier n'est prise.** L'ordre du jour reste les huit énoncés,
et celui-ci n'en débloque aucun directement — il rend un écran plus habitable, ce qui est un
enjeu d'adoption, pas de justesse.
⛔ **Aucune estimation d'effort n'est écrite ici**, parce qu'aucune n'a été mesurée.
⚠ **La maquette n'est pas une spécification** : elle montre le geste, pas le comportement de
l'application. Tout ce qu'elle affiche est un exemple.

---

## ↻ DÉCISION DE GRÉGOIRE — 2 septembre 2026, en fin d'après-midi

> **« Terminons les chantiers que nous avons commencés. Ce sera déjà ça de réglé. Ensuite,
> nous créerons la nouvelle grille algorithmique avec le modèle que nous venons d'inventer. »**

⮕ **Ce chantier est CADRÉ mais PAS À L'ORDRE DU JOUR.** Il passe **après** les deux énoncés
encore ouverts — l'énoncé 5 (la note qui rend 0,0 % en silence) et l'énoncé 8 (la portée des
suppressions).

**Le motif, argumenté et retenu :** ce chantier ne débloque aucun des huit énoncés. Il traite
un risque d'**adoption**, pas de **justesse**. ⮕ *Un enseignant qui reste et dont la note est
fausse est un problème plus grave qu'un enseignant qui trouve l'écran compliqué : le second se
plaint, le premier ne sait pas.*

⚠ **Ce qui pourrait renverser cet ordre, et qui appartient à Grégoire seul** : s'il juge, en
voyant sa communauté de pratique le 14 septembre, que l'écran algorithmique est un obstacle à
l'entrée pour la cohorte. Il a vu ces gens ; aucune session ne peut mesurer ça à sa place.

↻ **DÉCISION DE GRÉGOIRE — 5 septembre 2026, 11 h 35** : **l'étape 4 (les badges qu'on invente) est ABANDONNÉE pour les
critères algorithmiques.** Ses mots : « nous allons laisser tomber cette partie pour les critères algorithmiques et nous
allons nous concentrer plus tard sur la synthèse des rétroactions dans le PDF. Nous verrons également si, à l'usage, les
utilisateurs font des remarques ou expriment des besoins. » ⮕ L'arrêté 2 du 2 septembre (« palette fixe ») **tient**.
L'inventaire qui a fondé la décision : `INVENTAIRE-2026-09-05-badges-inventes.md`. Ce qui rouvrirait le sujet : un besoin
nommé par un utilisateur, pas une idée de session.

### Ce qui est ARRÊTÉ, et qu'une session future ne réouvre pas

1. **Deux familles de badges**, visuellement distinctes : ceux que l'enseignant pose, ceux qui
   se remplissent en corrigeant. Le formulaire est la frontière.
2. **Palette fixe d'abord.** Badges personnalisés dans une version ultérieure.
3. **L'enseignant écrit la phrase entière.** Le modèle fourni est un point de départ qu'il peut
   démolir. ⮕ **Conséquence, corrigée le 2 septembre :** le problème de la préposition
   (« t'inscrire **au** Passerelle + ») **disparaît** — il ne subsiste que comme règle
   d'écriture pour NOS modèles de départ, qui doivent tenir avec n'importe quel nom (d'où le
   deux-points).
4. **La prévisualisation est AU NIVEAU DU GABARIT**, pas champ par champ. Motif mesuré : ce que
   l'élève lit vient de **deux blocs à la fois** — le décompte du bloc 3, le verdict et la
   recommandation du bloc 2. Une prévisualisation par champ montrerait des morceaux.
5. **Elle exige des copies d'exemple.** On ne rend pas `{erreurs}` sans un élève. Au moins une
   copie non corrigée parmi elles, pour montrer ce qui se passe quand un badge n'a pas de valeur.
6. **Le bloc 1 (modèle de formule) ne se transpose pas** et ne doit pas être uniformisé avec le
   reste : aucun texte, rien à trouer.

### Le rapprochement que Grégoire a fait, et qu'il faut garder

**La cartouche de rétroaction est déjà une table** : *(critère × niveau) → un texte*. Le
composeur est la même table, à deux différences près : le texte n'est plus figé, et la
condition n'est plus le niveau mais le palier calculé.
⮕ **Même forme : une condition, puis un texte troué.** Les deux écrans pourraient un jour
n'être qu'un seul mécanisme. ⛔ **Ce n'est pas une décision, c'est une piste** — personne ne l'a
mesurée, et elle n'est pas dans ce chantier.

### Les maquettes

- **« Le texte troué »** (favicon 🏷️) — le geste, manipulable : glisser, déplacer, retirer.
- **« Les trois blocs »** (favicon 🧩) — la transposition champ par champ, et la
  prévisualisation à sa place.

⚠ **Aucune des deux n'est une spécification.** Elles montrent le geste, pas le comportement.

### ▣ LE MÉCANISME DE GLISSÉ EXISTE DÉJÀ DANS LE DÉPÔT — mesuré le 2 septembre

**Intuition de Grégoire :** *« Il y a peut-être des mécanismes que nous utilisons déjà dans la
carte mentale qui sert à l'alignement pédagogique. »* ▣ **Vérifiée, et elle tient.**

```bash
for m in dragstart pointerdown pointermove setPointerCapture touchstart mousedown; do
  printf "%-20s %s\n" "$m" "$(grep -c "$m" js/planification-carte.js)"; done
```

| | compte |
|---|---|
| `pointerdown` | **31** |
| `pointermove` | **28** |
| `setPointerCapture` | **3** |
| `dragstart` | 1 |
| `touchstart` | 1 |
| `mousedown` | 5 |

⮕ **La carte suit le POINTEUR, pas le glisser-déposer HTML5.** Elle traite donc le doigt et la
souris de la même façon — et Grégoire l'a éprouvée lui-même sur son iPad.

⛔ **NE PAS RÉIMPLÉMENTER AVEC `dragstart`/`drop`.** La maquette « Le texte troué » les emploie
parce que c'est une maquette ; le glisser-déposer HTML5 est capricieux sur iPadOS. **Le patron
à reprendre est celui de `planification-carte.js`.**

⚠ **Ce qui ne se reprend PAS tel quel, et c'est la moitié du travail** : la carte déplace un
objet sur un plan. Ici, il faut viser **une position dans du texte** — le point d'insertion,
calé au bord d'un mot. La partie « suivre le doigt » se reprend ; la partie « où ça tombe dans
la phrase » est neuve.

⮕ **Et le clic pour insérer au curseur reste le chemin principal**, quoi qu'il arrive : il
fonctionne partout, sans geste à apprendre.
