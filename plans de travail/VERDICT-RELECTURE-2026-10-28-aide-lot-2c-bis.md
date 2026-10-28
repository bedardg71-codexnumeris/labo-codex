# Verdict de relecture – L'Aide, lot 2c bis : le Suivi (#1152)

> Cowork, mercredi 28 octobre 2026, 12 h 05 (Toronto, mesuré par `date`), sur `main` = `c397bc47`. Lu : la demande de relecture, le texte visible des onze entrées au HEAD ; vingt-quatre libellés cités cherchés dans `index.html` hors de l'Aide et dans `js/` (tous trouvés, « A ou C < 70 % » étant construit à la borne, `js/tableau-bord-apercu.js:445`) ; D4 contre `js/contexte-qualification.js:207-215` ; le tri de « Détails » (`js/tableau-bord-apercu.js:349-372`) ; le tri de la Liste des étudiant·es (`js/etudiants.js:1496`). Playwright non rejoué.

## Verdict

**Accepté, avec une retouche.** Les corrections du dossier et de la remesure sont faites ; D13 est posée mot pour mot ; les bornes de la RàI sont dites fixes (D3) sans rien trancher de #551 ; l'ordre retenu (les sous-onglets, le suivi des fondamentaux au Suivi du groupe, où il s'affiche) est accepté, et la correction sur le profil (le suivi des fondamentaux n'y paraît plus, #552) est juste. Les quatre tests adaptés le sont par décision, cités.

## La retouche (Claude Code)

1. **« Détails »** (`tableau-bord`) : deux affirmations ne tiennent pas.
   - « C'est le seul endroit où l'application range les étudiant·es » : la Liste des étudiant·es se trie aussi, par ses colonnes, dont le pattern et la RàI (`js/etudiants.js:709, 1496`). L'erreur vient de la consigne de Cowork, qui reprenait le dossier.
   - « par ordre d'urgence » : c'est le nom d'une fonction (`js/tableau-bord-apercu.js:353`), pas un mot de l'écran ; c'est le vocabulaire qui jugeait l'élève, retiré le 15 oct. (`js/contexte-qualification.js:120-123`, #821).
   - La phrase de remplacement : **en attente des mots de Grégoire** (§ ci-dessous).
2. **Les mots de Grégoire** (§ ci-dessous), une fois rendus : quatre titres neufs, la phrase D4, la phrase de « Détails ».

## Les mots de Grégoire

**Validés par Grégoire le 28 oct. 2026 à 12 h 07** (« on garde »), mot pour mot ; note la validation dans le commentaire HTML de chaque entrée touchée.

- Les quatre titres neufs : « Consulter le suivi du groupe », « Lire le profil d'un·e étudiant·e », « Les mots qui décrivent A et C », « Questions flash, tirage au sort et équipes ».
- D4, telle que la demande la donne : « La couleur du badge « Contexte d'apprentissage » suit trois paliers fixes, 85, 75 et 65 %, que A et C doivent atteindre ensemble. Le rappel « Mobilisation » de la carte RàI paraît dès que A ou C passe sous 75 %. »
- **« Détails »**, qui remplace le paragraphe actuel de `tableau-bord` (retouche 1) : « « Détails » montre A, C et P sur chaque étudiant·e, et un clic sur l'un d'eux ouvre son profil. Les filtres « P < 65 % », « A ou C < 70 % », « Suivi » et « RàI 2-3 » se combinent : ils ne gardent que les étudiant·es qui répondent à tous, et mettent en tête ceux qui cumulent les plus grands écarts ; sans filtre, l'ordre est alphabétique. » La sentinelle du lot suit (plus de « seul endroit », plus d'« urgence » ; « A ou C < 70 % » lu à la borne).

**« Incomplet », deux sens (décision de Cowork, annoncée à Grégoire)** : rien ne change. Le niveau I et le statut d'une copie ne se croisent pas sur une même rangée (une copie « Incomplet » n'a ni note ni niveau), et l'étudiant·e ne lit que le niveau. L'Aide écrit le statut en entier (« Incomplet ; travail en cours ») et recopie la pastille « Incomplet » là où l'écran la montre. La question est close.

Un commit pour la retouche, un pour les docs ; demande de relecture : `plans de travail/DEMANDE-RELECTURE-2026-10-28-aide-lot-2c-bis-retouche.md`. Pas de release, de verdict ni de push sans le signal de Grégoire.

## Les suppositions de la demande

- « Seul endroit où l'application range » : levée par la retouche 1.
- La définition de C, celle de la sommative : retenue ; l'entrée la dit « les travaux comptés », que chaque famille compte selon le registre (`evaluationEntreDansLaNote`, `pratique-registre.js`). À remesurer par le glossaire (lot 3) si une famille compte autrement.

## Trouvailles

- Les quatre textes d'écran du Suivi, inscrits au lot 5 : conformes.
- Deux vocabulaires pour les niveaux RàI : « Universel, Préventif, Intensif » dans le profil, « Groupe ciblé », « Individuel » dans la fiche d'intervention ; l'Aide recopie chacun là où il paraît. Déjà relevé le 15 oct. ; au lot 5 s'il n'y est pas.


## Relecture de la retouche (Cowork, 28 oct., 12 h 44)

> Sur `main` = `81baa318`. Lu : le diff de `967a365f` (`index.html`, la sentinelle du lot).

**Acceptée sans retouche. Le lot 2c bis est clos côté relecture.** La phrase de « Détails » est celle de Grégoire, mot pour mot. La nuance de Claude Code est juste et retenue telle quelle : pour « Suivi » et « RàI 2-3 », l'écran additionne un poids tiré du diagnostic ou du niveau ; « écarts » s'y lit au sens large (ce qui éloigne l'étudiant·e de ce que le filtre attend). Ce sont les mots validés de Grégoire : ils restent.
