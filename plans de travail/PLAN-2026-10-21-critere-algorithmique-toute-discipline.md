# Plan – Le critère algorithmique, pour toute discipline : une étape préalable et cinq étapes

> Cowork, mercredi 21 octobre 2026, 9 h 23 (Toronto, mesuré par `date`), sur `main` à `6992bec4` (non poussé, relu à 9 h 16). Ordre approuvé par Grégoire à 9 h 20 ; principe des deux noms (occurrences, étendue) approuvé à 9 h 28. Sources : les pistes de 8 h 44 à 9 h 11 dans `MESURE-2026-10-21-critere-algorithmique.md`, et le code de `main`, lu en lecture seule. Ce plan ne se code pas d'un bloc : chaque étape aura sa consigne.

## Où en est le plan (tenu à jour à chaque lot ; dernière mise à jour : 22 oct. 2026, 17 h 35)

Chaque étape a, ou aura, sa consigne dans `plans de travail/CONSIGNE-LOT-<date>-critere-algorithmique-<étape>.md`, sa demande et son verdict de relecture. Une session qui reprend lit ce tableau, puis le dernier verdict.

| Étape | État | Ce qu'il faut pour la lancer |
|---|---|---|
| 0. Ce qui est faux, ce qui nomme le français par défaut | **fait** (`a32bdb41`, relu) ; mots : `904f1a02` et `21357b6a`, relus ; textes réglés par Grégoire (`TEXTES-2026-10-21-critere-algorithmique.md`) ; la liste du français écrit est la sienne (décision de 9 h 57) | — |
| 1. Le miroir | **à faire en premier, le 22 oct.** : consigne prête (`CONSIGNE-LOT-2026-10-21-critere-algorithmique-miroir.md`), non lancée le 21 (le créneau a servi à la note à la norme française). Sa limite de 12 h 30 ne vaut que pour le 21 : à la reprise, l'en-tête « ⏱ » est à ignorer, le reste vaut tel quel, sur le `main` du jour | — |
| 2. La palette, et les deux noms de l'enseignant | **2a (les deux noms) codé le 22 oct.**, en relecture (`DEMANDE-RELECTURE-2026-10-22-critere-algorithmique-noms.md`) ; textes provisoires à soumettre (`TEXTES-2026-10-22-noms-critere-algorithmique.md`). **2b (la palette) à faire** | **Décisions de Grégoire** : les noms par défaut d'un critère neuf (ce qu'on compte, ce à quoi on le rapporte) ; l'accord de « une fois pondérée(s) » avec un nom masculin. ⮕ **Décision 1 de Grégoire, 22 oct. 2026, 16 h 59 : aucun nom par défaut.** Un critère neuf naît avec ses deux noms à remplir, au singulier et au pluriel, comme ses sous-critères, un exemple grisé dans le champ (par ex. « unité manquante / calcul ») ; « Partir de la liste du français écrit » les remplit (« erreur », « mot ») ; un critère existant se LIT « erreur » et « mot », rien n'est réécrit ; tant que les noms manquent, Annoter le dit et invite à les écrire, comme pour les sous-critères (recommandation de Cowork, retenue telle quelle). ⮕ **Décision 2 de Grégoire, 22 oct. 2026, 17 h : la parenthèse ne s'accorde plus** : « 5 erreurs (3,5 après pondération) sur 400 mots », juste avec tout nom, masculin ou féminin, singulier ou pluriel ; elle remplace « (3,5 une fois pondérées) », arrêté le 21 oct. à 8 h 39, pour tous les critères ; les PDF déjà remis gardent l'ancienne forme (recommandation de Cowork, retenue telle quelle). Cowork les lui soumet au début de l'étape, une à la fois. Reprend aussi : les champs « Nombre d'erreurs », « Nombre de mots », la ligne du PDF, le paragraphe D3 de la section 5c, la phrase des deux modèles sous la formule. |
| 3. La table de cas | à faire, après 2 | **Décision de Grégoire** : les textes par défaut des cas. |
| 4. Les calculs que l'enseignant compose | à faire, après 3 | **Décision de Grégoire** : ce que veulent dire les calculs tout faits (didactique). Seule étape qui touche le calcul d'une note. |
| 5. Coller sa liste de codes | **codé le 22 oct.**, en relecture (consigne `CONSIGNE-LOT-2026-10-22-critere-algorithmique-coller-codes.md`, option A tranchée par Cowork) ; les textes de l'écran sont provisoires, à valider par Grégoire | — |
| La page « critères algorithmiques » du guide « Construire ton matériel d'évaluation » | à écrire par Cowork (le document du guide est un doc Claude, « Guide – Construire ton matériel d'évaluation (brouillon) ») | Rien : l'écran dit vrai depuis l'étape 0. Grégoire la corrige. Elle décrit l'écran d'aujourd'hui ; chaque étape la met à jour. |

Inscrits sans lot, hors plan : deux critères algorithmiques dans une grille, seul le premier reçoit les codes (#1132) ; le mode Catégories, sans écran, et la démo dont les vingt évaluations sont dans ce mode (#1133).

## Le principe qui gouverne tout (Grégoire, 9 h 20)

« Ce qu'il faut toujours prendre en considération ici, c'est de ne pas coder pour une discipline particulière. Dans les exemples qui sont donnés, on parle toujours de littérature, de rédaction, de correction de texte. Évidemment que pour un enseignant en chimie, ces choses ne s'appliquent pas. Donc, il faut toujours garder une perspective générale et s'assurer de ne rien coder en dur en fonction d'une discipline précise. »

Ce principe a déjà un passé dans le code : les formules (#667), la projection (#668) et les phrases (#581, modèle « Générique » par défaut depuis le 2 sept.) sont remontées dans la grille, et le code n'en garde que la mécanique. **Il reste le pas le plus profond : les données elles-mêmes parlent de rédaction.** Le critère compte des « erreurs » et les rapporte à des « mots ». En chimie, on compte peut-être des unités manquantes sur douze calculs ; en musique, des fautes de rythme sur trente-deux mesures ; ailleurs, des réussites plutôt que des erreurs.

**Recommandation de Cowork** : le critère compte des *occurrences* (les codes posés sur la copie, ou un nombre tapé) et peut les rapporter à une *étendue* de la copie (mots, calculs, mesures, questions, ou rien). **L'enseignant nomme ces deux données**, au singulier et au pluriel, comme il nomme ses sous-critères ; « erreur » et « mot » deviennent les noms d'un critère de rédaction, plus des mots du code. Les identifiants enregistrés (`erreurs`, `mots`) restent tels quels : un identifiant n'est pas un libellé (même règle que le préfixe `errfr_`, `codes-annotation.js`). Aucune donnée existante ne se réécrit.

## Ce qui reste écrit pour la rédaction (mesuré le 21 oct.)

| Où | Quoi | Étape |
|---|---|---|
| `synthese-retroaction-rendu.js` l. 383 | la ligne du PDF écrit en dur « N erreurs sur M mots », pour tout critère algorithmique : un élève de chimie lit « mots » | 0 |
| `evaluation-chargement.js` l. 1140-1176, 1350 | les champs « Nombre d'erreurs », « Nombre de mots » | 2 |
| `evaluation-enonces.js` l. 195-197, 241 | les repères « nombre d'erreurs », « nombre de mots » ; la phrase générique, « … erreur{s} pour {mots} mots » (texte lu par l'élève, arrêté par Grégoire le 2 sept.) | 2 |
| `evaluation-formules.js` | les trois formules, écrites en erreurs et en mots | 4 |
| `grilles.js` l. 5455-5535 | les onze sous-critères par défaut sont des catégories du français (« Continue de t'exercer en français écrit ») | 0 (le bouton le dit) |
| `codes-annotation.js` l. 164 (`_repli`) | tant que le critère n'a pas activé « codes d'annotation », Annoter offre les dix codes du français : un critère neuf de chimie les reçoit | 0 |
| `grilles.js` l. 4451 | le bouton « Utiliser sous-critères par défaut (0-10) » donne les onze catégories du français sans le dire | 0 |
| `evaluation-projection.js` l. 870 | sans projection, la copie fictive du gabarit vaut « 3 erreurs, 300 mots » | 1 |
| `accompagnement-contenu-hover.js` l. 354, 359 | l'infobulle « Niveau IDME » et celle du badge (`eval-francais-ecrit`) | 0 |
| `interventions.js` l. 1355 | la clé `francais` (#857, déjà inscrite) | hors plan |

Déjà général, à garder : un critère neuf naît sans projection (`gabaritNeuf`, `poserDefautNeuf`, `evaluation-projection.js` l. 812-825 ; « Projection à l'EUF » n'est que le défaut de LECTURE des critères d'avant #668) ; un critère neuf naît sans sous-critères ; les copies fictives du gabarit tirent leurs nombres des réglages de la grille (`copiesExemple`, `motsReference`, `erreursTolerees`) ; les noms des codes viennent des sous-critères de la grille (`codesAnnotation`).

## Le garde-fou commun

Chaque étape a son banc dans **deux disciplines fictives au moins, dont une sans texte** (ex. : une rédaction ; des calculs de chimie comptés en unités manquantes sur N calculs). Une étape qui ne passe que pour la rédaction n'est pas faite. Dans `js/`, rien ne nomme une discipline hors d'un modèle que l'enseignant choisit (comme `discipline_francais`).

## Les étapes

### 0. Avant les cinq : ce qui est faux, et ce qui nomme le français par défaut

- Les aides fausses (constats 1, 2, 3, 12 de la mesure) et le texte par défaut lu par l'élève (constat 6). Cowork rédige, Grégoire corrige.
- La ligne du PDF : le point décimal (« 13.75/20 ») à côté de la virgule (« 3,5 ») ; « 1 erreurs ». Ses noms en dur (« erreurs », « mots ») attendent l'étape 2, où l'enseignant nomme ses données.
- Un critère algorithmique neuf ne reçoit plus les dix codes du français dans Annoter : il naît marqué, sur le modèle de `gabaritNeuf` ; tant qu'il n'a pas de sous-critères, Annoter invite à les définir. Le bouton des onze sous-critères dit qu'il donne la liste du français écrit. **Tranché par Cowork à 9 h 30**, conséquence directe du principe de 9 h 20.
- Stock : un critère existant garde ce qu'il porte, les dix codes de repli compris (des collègues les emploient en cours de trimestre). Seule la naissance change.

### 1. Le miroir

- **Existe** : sous chaque palier, « L'élève lira : … (copie fictive, N erreurs pour M mots) » (`grilles.js` l. 4030-4065).
- **Ajoute** : la note obtenue ; des copies aux extrêmes (aucune occurrence, quelques-unes, beaucoup ; une copie sans étendue) ; une copie fictive dont les codes ont des poids différents, pour voir la somme pondérée.
- Lecture seule du moteur : rien ne change dans le calcul d'une note.

### 2. La palette latérale, et les deux noms de l'enseignant

- **Existe** : les repères (`REPERES`, `evaluation-enonces.js`), en rangées « Poser : » au-dessus de chaque champ, sous leur nom de code ; leurs deux couleurs expliquées dans un paragraphe.
- **Devient** : une palette unique, chaque bloc nommé en mots et décrit, en deux groupes (« Ce que tu écris dans la grille », « Ce qui se remplit à la correction ») ; insertion au curseur dans un champ libre. Modèle : la palette de la dissection (`D.TYPES` : nom, aide, précision, groupe). Sur l'iPad, toucher la palette ne doit pas faire perdre le curseur.
- C'est ici qu'entrent les deux noms de l'enseignant : les blocs, les champs de l'évaluation et la ligne du PDF portent ses mots. **Revient à Grégoire** : les noms par défaut d'un critère neuf.
- ⚠ L'accord : la parenthèse d'aujourd'hui, « (5 une fois pondérées) », s'accorde avec « erreurs », au féminin. Avec un nom masculin choisi par l'enseignant (« 7 défauts »), elle serait fausse : elle doit prendre le genre du nom, ou se dire sans accord. **Revient à Grégoire**, avec les noms par défaut.

### 3. La table de cas

- **Existe** : les paliers (un texte selon le ratio) ; les choix que l'application fait sans les montrer (l'« Observation » du sous-critère dominant, la tendance, la réussite).
- **Devient** : une table « si la valeur est…, ce texte », chaque texte dans son champ. La valeur qui choisit est n'importe quel bloc (une donnée, un calcul), pas seulement le ratio. Les choix silencieux s'y affichent et se modifient.
- Stock : une table existante (les paliers) se lit comme aujourd'hui. **Revient à Grégoire** : les textes par défaut des cas.

### 4. Les calculs que l'enseignant compose

- La formule de la note devient un calcul parmi d'autres, composé de blocs nommés ; les trois modèles et la projection deviennent des calculs tout faits qu'on choisit ou qu'on retouche. Composer le sien est une fonction experte (interface progressive, principe du 19 oct.).
- Garde-fou : une donnée manquante ou nulle dit ce qu'elle vaut, par un cas que l'enseignant écrit, jamais « #DIV/0! ».
- Seule étape qui touche le moteur de la note. Une note enregistrée garde sa valeur (garde du 21 oct.). **Revient à Grégoire** : ce que veulent dire les calculs tout faits.

### 5. Coller sa liste de codes

- Une liste (code, nom, poids, commentaire) collée d'un tableau et étiquetée comme une grille dans « Apporter mon matériel ». Indépendante des autres étapes : elle peut se glisser entre deux.

## Banc d'essai final

Refaire avec l'outil les phrases d'un ancien classeur Numbers de Grégoire (assembler, choisir), **puis** celles d'un critère fictif d'une discipline sans texte. Si la seconde demande un détour, le principe de 9 h 20 n'est pas tenu.
