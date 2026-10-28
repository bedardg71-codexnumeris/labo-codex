# Consigne – Des standards sans portfolio ni terminale : mesurer, puis planifier (urgent ; lecture seule)

> Écrite par Cowork le mercredi 28 octobre 2026 à 14 h 57 (Toronto, mesuré par `date`). **Lancée en parallèle de la session des correctifs de la note** (`CONSIGNE-LOT-2026-10-28-construction-de-la-note-correctifs.md`, décidé par Cowork à 15 h 04 à la demande de Grégoire), **avant** les lots 4 et 5 de l'Aide : Grégoire juge ce chantier urgent (28 oct., 14 h 55). Ce fichier ne remplace aucune autre consigne : n'y touche pas.
> Source : `DECISIONS-2026-10-28-construction-de-la-note.md`, § « Chantier de Grégoire » et « Le point de départ » (décidé à 14 h 56). Principe de Grégoire (21 oct.) : ne jamais coder Labo Codex pour une discipline ; (28 oct.) : ne pas coder en dur sa pratique.

## 0. Avant tout

- **Lecture seule** : aucun fichier de `js/`, d'`index.html` ni de `styles.css` ne change. Un banc jetable est permis.
- **Ne committe rien** : une autre session code les correctifs E1 à E7 en même temps, sur le même dépôt et la même branche. Ton plan reste non suivi ; la consigne du lot 4 de l'Aide le committera avec ce fichier.
- Les sites que ces correctifs touchent (E7 surtout : le « provisoire » d'une pratique Standards sans terminale) changent pendant ta mesure : décris-les d'après la consigne des correctifs et dis-le, sans les corriger ni les bancer.

## 1. Mesurer : tout ce qui suppose un portfolio ou une terminale dans une pratique Standards

Le calcul (le chemin riche, `calculerDetailsNoteFinale`, et l'instance, `pratique-pan-standards.js`), mais aussi **tout ce qui l'entoure** : l'assistant (« Nombre d'artefacts à soumettre », « Minimum d'artefacts… », la « Construction de la note ») ; la pratique (`pratiques-gestion.js`, les cases des catégories, la « Construction de la note ») ; les productions (les types « Artefact d'un portfolio », « Portfolio », « Évaluation terminale », `ponderationPropre`) ; le profil (le panneau Portfolio, « Engagement ACP ») ; le PDF (« Artefacts à venir », note provisoire) ; l'export ; le Comparateur et les profils fictifs ; le dépistage et la RàI (`calculerPerformanceRecente`, les trois derniers artefacts) ; les captures ; les sentinelles qui épinglent ce comportement. Pour chaque site : ce qu'il suppose, ce qu'il ferait d'une pratique sans artefacts ni terminale (mesuré sur banc quand c'est possible).

## 2. Planifier

`plans de travail/PLAN-2026-10-28-standards-sans-portfolio.md` : des lots courts, chacun avec ce que l'utilisateur voit, sur le point de départ décidé :
- le calcul prend les productions que la pratique désigne, quel que soit leur type ; par défaut, toutes les productions évaluées sauf les diagnostiques ;
- l'évaluation terminale est facultative ;
- on étend la désignation existante (`production.categorie`, les cases des catégories) plutôt que d'en inventer une ;
- **une pratique existante garde exactement sa note** (preuve : le banc de la mesure du 28 oct. et un essai sur une pratique comme celle de Grégoire, artefacts + portfolio + terminale) ; aucune donnée réécrite.

Le plan nomme **chaque mot neuf** que l'utilisateur lira (libellés, textes de l'assistant, de la pratique, de l'Aide) : ils iront à Grégoire avant le code. Il nomme aussi les questions de didactique qui restent (par exemple : ce que « Portfolio » veut dire quand il n'est plus obligatoire ; si la note Standards doit un jour lire les niveaux, E5), sans les trancher.

Pas de release, de verdict ni de push.
