# Textes – trois familles à l'écran : PAN, Cumulative, Hybride (27 novembre 2026)

> **Décisions de Grégoire le 27 nov. 2026 (14 h 07 à 14 h 21)**, relayées par Cowork dans le mandat du lot
> `lot/familles-cum-hyb-2026-11-27` (rapport : `RAPPORT-2026-11-27-familles-cum-hyb.md`). « Sommative » s'appelle
> « Cumulative » (badge CUM) ; « Par sélection de productions » s'appelle « Hybride » (badge HYB) ; les PAN gardent le
> sigle de leur pratique (STD, SPE, DEN). Affichage seulement : aucun calcul, aucun identifiant, aucune donnée ne change.
> **Statut des mots : PROPOSÉS** (Grégoire peut les corriger avant la fusion), sauf la description de la famille
> cumulative (repère C1), **acceptée par Grégoire à 14 h 19**. Un mot corrigé se corrige ICI et à sa source ; les
> sentinelles qui relisent ce fichier suivent.
> **Ce fichier REMPLACE, pour les repères qu'il porte seulement**, les citations de
> `TEXTES-2026-11-20-selection-de-productions.md`, `TEXTES-2026-11-21-selection-sans-PAN.md` et
> `TEXTES-2026-11-22-vue-simple-porte-par-standards.md`, qui restent intacts (mêmes noms de repères).
> **Relu par** `tests/unit/sentinelle-renommage-selection-productions.test.js`, `sentinelle-sel-sans-pan-2026-11-21.test.js`
> et `sentinelle-standards-sans-portfolio.test.js` : chaque ligne `> …` d'une section est un texte posé tel quel.
> Les textes du parcours (26 à 28 du mandat) se lisent dans `tests/unit/_helpers/familles-cum-hyb-2026-11-27.js`.

## C1 · js/wizard-pratique-v2.js · le récapitulatif de l'assistant, famille cumulative : le nom, puis la description (ACCEPTÉE, 14 h 19)

> Cumulative
> Ta note finale est le cumul pondéré de tes évaluations. C'est la méthode traditionnelle, souvent appelée sommative.

## C2 · js/wizard-pratique-v2.js · la carte de la voie rapide, famille cumulative : le nom, puis la description

> Cumulative (CUM)
> Note finale par cumul pondéré des évaluations.

## V1 · js/vue-simple.js · la carte « Ta pratique » de l'accueil (étape 2)

> Choisis un modèle : par standards, par spécifications ou hybride. Tu règles ensuite ce qui construit la note.

## V2 · js/vue-simple.js · la note sous le sélecteur de groupe (`groupeMotAutres`)

> Un groupe dont la pratique n’est ni par standards, ni par spécifications, ni hybride se suit en vue étendue.

## V3 · js/vue-simple.js · le titre du modèle, donc le nom de la pratique créée

> Hybride

## V5 · js/vue-simple.js · « Ta pratique », pratique d'une autre famille (`pratiqueAutre`)

> La pratique de ce groupe n’est ni par standards, ni par spécifications, ni hybride : elle se règle en vue étendue.

## V6 · js/vue-simple.js · le tableau, pratique d'une autre famille (`tableau.autreFamille`)

> Le tableau sert aux pratiques par standards, par spécifications et hybrides. La pratique de ce groupe se suit en vue étendue.

## T1 · js/tableau-notation.js · le tableau de notation, autre famille

> Le tableau de notation sert aux pratiques hybrides et par spécifications. Pour la pratique de ce groupe-cours, la Liste reste la vue de tes évaluations.

## A1 · js/wizard-pratique-v2.js · le récapitulatif de l'assistant : le nom, puis la description

> Hybride
> Tu évalues chaque production par niveaux (ex. : I-D-M-E). La note se construit à partir des productions que ta règle retient ; d'autres peuvent compter d'office.

## A2 · js/wizard-pratique-v2.js · la carte de la voie rapide : le nom, puis la description (inchangée)

> Hybride (HYB)
> Des niveaux (ex. I-D-M-E) ; la note retient certaines productions.

## A3 · js/wizard-pratique-v2.js · le titre du récapitulatif

> Configuration – Hybride

## A6 · js/accompagnement-contenu-hover.js · la bulle de l'étape « Approche » (hors de la liste du mandat ; même règle que le texte 19)

> En pratique hybride, la note se construit sur le portfolio ; à l’étape suivante, tu choisis quels artefacts comptent.

## M1 · js/wizard-pratique-v2.js · la notification de l'assistant

> Choisis une échelle de performance (IDME) avant de créer cette pratique hybride. Reviens à l'étape « Échelle de performance ».

## F3 · index.html · le menu « Type » de la fiche, lu aussi par l'étape « Méthode »

> Hybride

## F4 · index.html · l'encadré de la configuration

> Hybride : la note retient les résultats de l'étudiant·e selon ta « Construction de la note » : les meilleurs, les plus récents ou tous. S'il y a une évaluation terminale, elle compte au poids de sa pondération.

## F10 · js/pratiques/pratique-pan-standards.js · le nom affiché quand la pratique n'a pas de nom à elle (aussi E1, l'export)

> Hybride

## P1 · js/profil-etudiant-actions.js · le profil, note non calculée

> Hybride

## P2 · js/profil-etudiant-actions.js · le profil, note calculée

> Hybride

## M5 · js/pratiques/pratique-registre.js · terminale seule : sans artefact, puis avec artefacts

> Seule l'évaluation terminale a une note. En pratique hybride, la note du cours s'appuie aussi sur les productions retenues : elle ne se calcule pas sur la terminale seule.
> Seule l'évaluation terminale a une note. En pratique hybride, la note du cours s'appuie aussi sur les artefacts du portfolio : elle ne se calcule pas sur la terminale seule.

## G1 · js/pratiques-gestion.js · la bulle du badge HYB

> Hybride : des niveaux (ex. I-D-M-E) ; la note retient certaines productions.

## G5 · js/accompagnement-contenu-hover.js · la bulle de « Type de pratique »

> CUM = cumulative (moyenne pondérée traditionnelle, souvent dite sommative), HYB = hybride (des niveaux ; la note retient certaines productions), STD = PAN par standards (un niveau par cible d'apprentissage), SPE = PAN basée sur des spécifications (contrat), DEN = dénotation (pratiques réduisant ou éliminant la notation).

## T2 · js/productions.js · la bulle du type « Évaluation terminale »

> Production qui clôt le trimestre ; une seule par trimestre, et facultative. En pratique hybride, elle entre dans le calcul avec sa pondération (par exemple 40 %), le reste allant aux artefacts du portfolio ou, sans artefact, aux productions retenues (par exemple 60 %).

## H1 · index.html · Aide › Conception, « Choisir ta pratique de notation » : le titre du bloc

> Hybride

## H2 · index.html · Aide › Conception, « Comment ta pratique construit la note » : le titre en gras du bloc

> Hybride.

## D1 · index.html, js/wizard-pratique-v2.js · le mode de sélection à deux blocs (valeur interne `hybride`, inchangée)

> Deux blocs (N meilleures + Obligatoires)

## La ligne de Nouvelles (au rapport, PAS au changelog : elle part avec la release)

> Les pratiques se rangent maintenant en trois familles : cumulative (CUM), hybride (HYB) et alternatives (PAN : STD, SPE, DEN). « Sommative » s'appelle « Cumulative » et « Par sélection de productions » s'appelle « Hybride ». Seuls les noms changent : tes pratiques, tes réglages et tes notes restent les mêmes. Une pratique que tu as déjà créée garde son nom.
