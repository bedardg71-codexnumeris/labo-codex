# Textes proposés – Comparateur : la synthèse de chaque pratique

> Claude Code, 21 nov. 2026. Branche `lot/comparateur-synthese`. **Tout ce qui suit est une PROPOSITION, non arrêtée** :
> ces mots vivent sur l'aperçu jusqu'à ce que Grégoire les corrige. « Tu » pour l'enseignant·e. « CIB » ne s'affiche
> nulle part ; « Par standards » s'affiche STD (mesuré à l'écran, voir le rapport).

## Le seul mot neuf

| N° | Où | Texte proposé | Note |
|---|---|---|---|
| S1 | Labo › Exploration des pratiques, sous le menu de chaque colonne : le libellé du volet replié | Ce que règle cette pratique | Le libellé du mandat. Second choix, plus court sur iPad en portrait (le libellé y tient sur deux lignes à 820 px) : « Ses réglages ». |

## Les textes repris tels quels (aucun mot neuf)

| N° | Où | Texte | Source |
|---|---|---|---|
| S2 | Corps du volet, pratique enregistrée | La section « Configuration – <type> » du récapitulatif de l'assistant, mot pour mot (titre de la section compris) | `genererSectionConfiguration`, wizard-pratique-v2.js (source unique) |
| S3 | Corps du volet, famille de base (« Sommative », « Par sélection de productions », « Spécifications » du menu) et pratique sommative enregistrée | Sa description courte, telle quelle : « Sommative (Traditional Grading) - Moyenne pondérée des évaluations », « Par sélection de productions - Des niveaux (ex. I-D-M-E) ; la note retient certaines productions », « PAN-Spécifications (Specifications Grading) - Évaluation dichotomique par forfaits » ; ou la description que l'enseignant·e a écrite, si elle existe | `obtenirDescriptionCourtePratique`, pratiques-gestion.js |

## Ce que Grégoire pourrait vouloir changer (questions, pas des textes)

| N° | Question | Proposé |
|---|---|---|
| Q1 | Les descriptions courtes (S3) mêlent l'anglais et un trait d'union (« Sommative (Traditional Grading) - … ») : les garder telles quelles ici ? | Oui pour ce lot (le mandat dit « tel quel ») ; leur révision touche aussi Conception › Pratiques, où elles s'affichent déjà |
| Q2 | Le titre de la section du volet répète la famille (« Configuration – Par standards ») sous un menu qui la nomme déjà | Le garder : c'est le mot pour mot demandé |
