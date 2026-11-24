# Textes proposés – « Tampons d'observation », lot 1 (régler)

> Claude Code, 24 nov. 2026. Consigne de lot : Cowork, « Gestion des pratiques de notation 5 », 24 nov., 13 h 55.
> **Tout ce qui suit est une PROPOSITION, sauf A1** (la phrase acceptée par Grégoire le 22 nov., reprise mot pour mot).
> Ces mots vivent sur l'aperçu (branche `lot/tampons-observation-1-regler`) jusqu'à ce que Grégoire les corrige ; rien
> n'est en ligne. **Une ligne par texte**, avec l'endroit où on le lit. Les textes sont tous réunis au même endroit du
> code (`MOTS_OBSERVATION` et `AIDE_TAMPON_OBSERVATION`, `js/travaux-outils.js` ; le libellé de fusion, `js/codex.js`) :
> une correction se fait en une ligne.
> « X » : le nom que l'enseignant·e a donné à sa catégorie. « N » : un nombre.
> Ces textes ne se montrent que si une pratique par cibles existe dans le trimestre actif (voir le rapport, § 2).

## Les questions (une réponse de Grégoire change le texte)

| N° | Question | Proposé |
|---|---|---|
| Q1 | Le libellé de la case, à côté du nom de chaque catégorie (C1) | **« D'observation »**, seul : le nom de la catégorie est juste à gauche, la rangée se lit « Ce que je vois en classe · D'observation ». Second choix, plus long : « Catégorie d'observation » |
| Q2 | La seconde phrase de l'aide C2, « Rien d'autre ne change pour l'instant. » | Vraie dans ce lot (aucun autre écran ne lit le réglage) ; elle devra partir au lot suivant. Elle peut aussi partir tout de suite |
| Q3 | Le champ du critère : « Critère (facultatif) » (T1) | Le mot « facultatif » dans le libellé plutôt que dans l'aide, pour qu'il se lise sans chercher. Second choix : « Critère », et « facultatif » dans l'aide seulement |
| Q4 | La fenêtre s'appelle déjà « Rétroactions — Observations », une catégorie fournie s'appelle « Observations », et l'export d'un jeu s'intitule déjà « Tampons d'observation » pour TOUS les tampons (ces trois textes existent, je n'y ai pas touché) | Je ne propose rien : c'est la question 5 du rapport de mesure du 24 nov. (« observation » a déjà plusieurs sens à l'écran). Le lot ajoute un sens de plus, sur la même fenêtre |

## La fenêtre des tampons (Annotation › Tampons), en haut : la liste des catégories

| N° | Où | Texte |
|---|---|---|
| C1 | Case à cocher, à droite du nom de chaque catégorie (fournie ou à soi) | D'observation |
| C2 | Aide, sous « Tu enseignes plus d'un cours ? … » | Coche « D'observation » pour une catégorie dont les tampons disent ce que tu vois l'étudiant·e faire. Rien d'autre ne change pour l'instant. |

## La fenêtre des tampons, plus bas : la section d'une catégorie d'observation

| N° | Où | Texte |
|---|---|---|
| A1 | Sous le nom de la catégorie, au-dessus de ses tampons (**accepté le 22 nov., mot pour mot**) | Un tampon d'observation nomme ce que tu vois l'étudiant·e faire. La cause, tu la chercheras avec elle ou lui. |
| A2 | Aide du champ du critère, juste sous A1 (une fois par catégorie, pas à chaque tampon) | Si ce tampon se rapporte à un critère d'une de tes cibles, écris-le ou choisis-le dans la liste. Tu peux laisser vide. |
| T1 | Libellé du champ, dans la rangée de chaque tampon (entre son nom et son texte de rétroaction) | Critère (facultatif) |
| T2 | Suggestions du champ (liste déroulante du navigateur) | Aucun mot de l'application : ce sont les textes des critères de tes cibles, tels que tu les as écrits |

## Les annonces pour lecteur d'écran (dites quand la case change, jamais affichées)

| N° | Quand | Texte |
|---|---|---|
| L1 | La case d'une catégorie vient d'être cochée | « X » est maintenant une catégorie d'observation. Chacun de ses tampons peut déclarer un critère. |
| L2 | La case vient d'être décochée | « X » n'est plus une catégorie d'observation. Les critères déjà écrits sont gardés, mais ne sont plus montrés. |

## L'import d'un jeu de tampons

| N° | Où | Texte |
|---|---|---|
| I1 | Fenêtre « Importer cette bibliothèque de tampons ? », à la suite du compte existant (« 12 tampon(s), 4 catégorie(s) »), seulement si le fichier en porte | , dont 1 catégorie d'observation |
| I2 | Même endroit, au pluriel | , dont N catégories d'observation |
| I3 | Même fenêtre (inchangé, pour mémoire : il couvre désormais aussi les deux réglages) | Les tampons actuels seront remplacés. |

## La fusion de deux codex (fenêtre de fusion)

| N° | Où | Texte |
|---|---|---|
| F1 | Le nom de la donnée quand elle arrive ou diffère entre deux codex | tes catégories de tampons d'observation |
| F2 | Où elle se règle (même mot que pour les autres données des tampons) | Annotation › Tampons |
| F3 | Le nom d'une de ses entrées | catégorie |

## Ce que le lot n'a pas eu à écrire

- Aucun message d'erreur : un critère trop long est coupé à 200 caractères par le champ lui-même, un critère vide n'est
  simplement pas gardé.
- Aucune ligne de Nouvelles (rien ne part en ligne).
- Le mot « marque » n'est employé nulle part.
