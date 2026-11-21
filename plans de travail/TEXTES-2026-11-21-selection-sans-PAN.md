# Textes – la pratique « Par sélection de productions » n'est plus dite « PAN »

> **Dictés par Grégoire le 21 nov. 2026 (remarque à 7 h 42, décision à 7 h 44)**, relayés par Cowork :
> `CONSIGNE-LOT-2026-11-21-moteur-cibles-1-corrections-2.md`.
> **La règle** : l'application n'affirme plus que la pratique « Par sélection de productions » est une PAN, et n'affirme
> pas non plus qu'elle n'en est pas une, ni qu'elle est hybride. Aucun texte ne dit « PAN » de cette pratique.
> *Origine : choix de Grégoire, 21 nov. 2026 ; les sources ne tranchent pas.* Ses mots : « La preuve n'est pas faite que
> SEL est vraiment une PAN. On dirait une pratique hybride entre PAN et SOM. Demeurons prudent dans l'affirmation. »
> **Ce fichier REMPLACE, pour les repères A1, A2, A3, F3, F4, F10, P1 et P2 seulement, les citations de
> `TEXTES-2026-11-20-selection-de-productions.md`, qui reste intact** (numéros 8, 10, 12, 17, 18 et 19 de la liste du
> relais du 20 nov. : 19 couvre F10, P1, P2 et donc E1). Les descriptions de A1 et A2 ne changent pas. Le repère T2
> remplace de même le texte 2 de `TEXTES-2026-10-29-standards-lot-3.md`, et H1, H2 les titres des blocs de l'Aide
> (`TEXTES-2026-10-28-aide-sept-trous.md`), restés intacts.
> **Relu par** `tests/unit/sentinelle-renommage-selection-productions.test.js`, `sentinelle-standards-sans-portfolio.test.js`
> et `sentinelle-sel-sans-pan-2026-11-21.test.js` : chaque ligne `> …` d'une section est un texte posé tel quel.

## A1 · js/wizard-pratique-v2.js · le récapitulatif de l'assistant : le nom, puis la description (inchangée)

> Par sélection de productions
> Tu évalues chaque production par niveaux (ex. : I-D-M-E). La note se construit à partir des productions que ta règle retient, pas de la moyenne de toutes.

## A2 · js/wizard-pratique-v2.js · la carte de la voie rapide : le nom, puis la description (inchangée)

> Par sélection de productions
> Des niveaux (ex. I-D-M-E) ; la note retient certaines productions.

## A3 · js/wizard-pratique-v2.js · le titre du récapitulatif

> Configuration – Par sélection de productions

## F3 · index.html · le menu « Type » de la fiche, lu aussi par l'étape « Méthode »

> Par sélection de productions

## F4 · index.html · l'encadré de la configuration

> Par sélection de productions : la note retient les résultats de l'étudiant·e selon ta « Construction de la note » : les meilleurs, les plus récents ou tous. S'il y a une évaluation terminale, elle compte au poids de sa pondération.

## F10 · js/pratiques/pratique-pan-standards.js · le nom affiché quand la pratique n'a pas de nom à elle (aussi E1, l'export)

> Par sélection de productions

## P1 · js/profil-etudiant-actions.js · le profil, note non calculée

> Par sélection de productions

## P2 · js/profil-etudiant-actions.js · le profil, note calculée

> Par sélection de productions

## G1 · js/pratiques-gestion.js · la bulle du badge SEL

> Par sélection de productions : des niveaux (ex. I-D-M-E) ; la note retient certaines productions.

## G2 · js/pratiques-gestion.js · la bulle du badge PAN (sans liste de sigles)

> Pratique alternative de notation.

## G5 · js/accompagnement-contenu-hover.js · la bulle de « Type de pratique »

> SOM = sommative (moyenne pondérée traditionnelle), STD = PAN par standards (un niveau par cible d'apprentissage), SEL = par sélection de productions (la note retient certaines productions), SPE = PAN basée sur des spécifications (contrat), DEN = dénotation (pratiques réduisant ou éliminant la notation).

## T2 · js/productions.js · la bulle du type « Évaluation terminale » (remplace le texte 2 de `TEXTES-2026-10-29-standards-lot-3.md`, qui reste intact)

> Production qui clôt le trimestre ; une seule par trimestre, et facultative. Par sélection de productions, elle entre dans le calcul avec sa pondération (par exemple 40 %), le reste allant aux artefacts du portfolio ou, sans artefact, aux productions retenues (par exemple 60 %).

## H1 · index.html · Aide › Conception, « Choisir ta pratique de notation » : le titre du bloc (le paragraphe, validé le 29 oct., ne change pas)

> Par sélection de productions

## H2 · index.html · Aide › Conception, « Comment ta pratique construit la note » : le titre en gras du bloc (le reste, validé le 29 oct., ne change pas)

> Par sélection de productions.

## Le nom de famille, là où il s'affiche (bibliothèque, ligne sous le titre de la fiche, aperçu de la bibliothèque)

`FAMILLES_TAXONOMIQUES.standards` (`js/pratiques-gestion.js`) : le nom est « Par sélection de productions », sans
« PAN-Standards », sans « (Standards-Based Grading) », sans préfixe « PAN – ». Le résumé qui le suit sur la fiche et dans
l'aperçu de la bibliothèque disait « Maîtrise de standards/objectifs » ; il reprend les mots acceptés de la carte de la
voie rapide (D5, A2 ci-dessus), sans le point final, comme les résumés des autres familles. *Supposé par Claude Code,
à valider* : la consigne ne dictait que le nom.

## Remplacements simples (point 5 de la consigne), même règle

Là où l'ancienne pratique était nommée « PAN-Standards » ou « PAN – Standards » à l'écran et que la phrase reste juste
avec le nom seul. En minuscules dans une phrase, comme les textes acceptés V1, V2, V6 et M1 (« pratiques par sélection de
productions ») ; entre guillemets là où la minuscule se lirait comme une action (le Comparateur).

| Où | Devient |
|---|---|
| `js/etudiants.js`, l'aide des indices, titre | Méthodes de calcul des indices (pratique active : Par sélection de productions) |
| `js/etudiants.js`, l'aide des indices, P | → **Par sélection de productions** : Moyenne des N meilleurs … |
| `js/etudiants.js`, l'aide des indices, résumé | … selon la pratique pédagogique choisie (Sommative, Par sélection de productions, ou autre). |
| `js/comparateur-pratiques.js`, la note de l'Exploration | … Pour certaines pratiques — surtout « Par sélection de productions » — une note peut s'afficher à 0 … |
| `js/donnees-v2.js`, le type d'une ressource partagée (`pan-standards`) | Par sélection de productions |
| `js/profil-etudiant-actions.js`, diagnostic d'une sommative | … se calcule par portfolio, propre aux pratiques par sélection de productions : … |
| `js/profil-etudiant-actions.js`, deux diagnostics | Pratique par sélection de productions, mais … |
| `js/profil-etudiant-sections-affichage.js`, « Méthodologie de calcul » | Pratique de notation active : Par sélection de productions |
| `index.html`, la carte « Note » des échelles | … est utilisée dans la pratique par sélection de productions. |
| `js/pack-demo-10.js`, la pratique de la démo | Par sélection de productions (démo) |
