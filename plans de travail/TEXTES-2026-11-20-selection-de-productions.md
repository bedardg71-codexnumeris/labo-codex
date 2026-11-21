# Textes – La pratique « Standards » devient « Par sélection de productions »

> **Tous acceptés par Grégoire le 20 nov. 2026 à 20 h 44, mot pour mot.** Relais de Cowork :
> `CONSIGNE-LOT-2026-11-20-renommer-selection-productions.md`. Inventaire d'origine :
> `INVENTAIRE-2026-11-20-renommer-productions-retenues.md` (les repères V, T, A, M, F, P viennent de lui).
> Vingt textes : là où on choisit cette pratique et là où on la nomme. Le reste de l'aide, du glossaire et des
> parcours attend. Aucun calcul, aucun identifiant, aucune donnée ne change : le badge reste « STD ».
> **Ce fichier est relu par `tests/unit/sentinelle-renommage-selection-productions.test.js`** et par
> `sentinelle-standards-sans-portfolio.test.js` : chaque ligne `> …` est un texte posé tel quel. Il REMPLACE, pour
> ces textes seulement, les citations de `TEXTES-2026-10-29-standards-lot-5.md` (textes 1 et 7), qui reste intact.

## V1 · js/vue-simple.js · la carte « Ta pratique » de l'accueil

> Choisis un modèle, par sélection de productions ou par spécifications, et la règle qui construit la note.

## V2 · js/vue-simple.js · la note sous le sélecteur de groupe

> Un groupe dont la pratique n'est ni par sélection de productions ni par spécifications se suit en vue étendue.

## V3 · js/vue-simple.js · le titre du modèle, donc le nom de la pratique créée

> Par sélection de productions

## V4 · js/vue-simple.js · le bouton du modèle

> Choisir ce modèle

## V5 · js/vue-simple.js · l'écran Pratique, autre famille

> La pratique de ce groupe n'est ni par sélection de productions ni par spécifications : elle se règle en vue étendue.

## V6 · js/vue-simple.js · le tableau, autre famille

> Le tableau sert aux pratiques par sélection de productions et par spécifications. La pratique de ce groupe se suit en vue étendue.

## T1 · js/tableau-notation.js · le tableau de notation, autre famille

> Le tableau de notation sert aux pratiques par sélection de productions et par spécifications. Pour la pratique de ce groupe-cours, la Liste reste la vue de tes évaluations.

## A1 · js/wizard-pratique-v2.js · le récapitulatif de l'assistant : le nom, puis la description

> PAN – Sélection de productions
> Tu évalues chaque production par niveaux (ex. : I-D-M-E). La note se construit à partir des productions que ta règle retient, pas de la moyenne de toutes.

## A2 · js/wizard-pratique-v2.js · la carte de la voie rapide : le nom (sans code), puis la description

> PAN – Sélection de productions
> Des niveaux (ex. I-D-M-E) ; la note retient certaines productions.

## A3 · js/wizard-pratique-v2.js · le titre du récapitulatif

> Configuration PAN – Sélection de productions

## A4 · js/pratiques/pratique-registre.js · l'étape « Approche », avec artefacts

> Cette pratique s'appuie sur le portfolio : c'est la progression à travers les artefacts qui construit la note.

## A5 · js/pratiques/pratique-registre.js · l'étape « Approche », sans artefact

> Ici, la note repose sur plusieurs productions : à l'étape suivante, tu choisis lesquelles elle retient (les meilleures, les dernières ou toutes).

## A6 · js/accompagnement-contenu-hover.js · la bulle de l'étape « Approche »

> Par sélection de productions, la note se construit sur le portfolio ; à l'étape suivante, tu choisis quels artefacts comptent.

## M1 · js/wizard-pratique-v2.js · la notification de l'assistant

> Choisis une échelle de performance (IDME) avant de créer cette pratique par sélection de productions. Reviens à l'étape « Échelle de performance ».

## F3 · index.html · le menu « Type » de la fiche, lu aussi par l'étape « Méthode »

> PAN – Sélection de productions

## F4 · index.html · l'encadré de la configuration

> PAN – Sélection de productions : la note retient les résultats de l'étudiant·e selon ta « Construction de la note » : les meilleurs, les plus récents ou tous. S'il y a une évaluation terminale, elle compte au poids de sa pondération.

## F10 · js/pratiques/pratique-pan-standards.js · le nom affiché quand la pratique n'a pas de nom à elle (aussi E1, l'export)

> PAN – Sélection de productions

## P1 · js/profil-etudiant-actions.js · le profil, note non calculée

> PAN – Sélection de productions

## P2 · js/profil-etudiant-actions.js · le profil, note calculée

> PAN – Sélection de productions

## M5 · js/pratiques/pratique-registre.js · terminale seule : sans artefact, puis avec artefacts

> Seule l'évaluation terminale a une note. Par sélection de productions, la note du cours s'appuie aussi sur les productions retenues : elle ne se calcule pas sur la terminale seule.
> Seule l'évaluation terminale a une note. Par sélection de productions, la note du cours s'appuie aussi sur les artefacts du portfolio : elle ne se calcule pas sur la terminale seule.

## La ligne des Nouvelles, acceptée, à garder pour la release (pas écrite dans `js/changelog-data.js` par ce lot)

La pratique « Standards » s'appelle maintenant « Par sélection de productions ». Le nom dit ce que fait le calcul : chaque production reçoit un niveau et la note se construit à partir de celles que ta règle retient. Tes pratiques, tes réglages et tes notes ne changent pas. Une pratique que tu avais nommée toi-même garde son nom.
