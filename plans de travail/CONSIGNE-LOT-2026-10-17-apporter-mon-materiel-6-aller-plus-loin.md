# Consigne – « Apporter mon matériel », étape 6 du plan : « Aller plus loin avec ta grille »

> Écrite par Cowork le samedi 17 octobre 2026 à 12 h 07 (Toronto, mesuré par `date`). Étape 6 de `PLAN-2026-10-17-pret-pour-lundi.md`. Textes **validés par Grégoire à 12 h 07** (« C'est très bien »).
> Skills : `labo-codex`, `design-interface`, `integrite-globaux`, `verification-adverse`.

## Pourquoi

Posture du 17 oct. (cadrage) : accepter la grille telle quelle, puis proposer, au conditionnel et sans jugement sur le travail de l'enseignant·e, une structure qui permette de mieux suivre les apprentissages. Orientation de Grégoire (9 h 42) : présenter les trois types de critères que l'application exploite. **Première forme, modeste** : un encadré d'information, aucun comportement neuf, aucune conversion de la grille.

## L'assise (mesurée par Cowork)

L'aide « Type de critère d'évaluation » existe déjà (`accompagnement-contenu-popup.js`, clé `grille-type-critere-detail`, ~1107 : holistique, analytique, algorithmique) et s'ouvre dans Grilles de critères par `<span class="primo-aide" data-target="grille-type-critere-detail">` (`grilles.js` ~3406, ~4780). **Réemploie ce mécanisme** pour le lien ; aucun texte d'aide neuf.

## Ce que Grégoire verra

Sur l'écran de confirmation, après « Créer ma grille », sous les cartes : un encadré « Aller plus loin avec ta grille », dont le premier paragraphe dépend de la grille créée, et un lien qui ouvre l'aide existante sur les trois types de critères.

## Les textes, validés (mot pour mot)

- Titre : **Aller plus loin avec ta grille**
- Grille en points (`resume.enPoints`) : « Ta grille note chaque critère en points. Labo Codex pourrait t'aider à suivre la progression de tes étudiant·es à partir d'elle, par exemple en décrivant, pour un critère, ce qu'on attend à chaque niveau. »
- Grille à niveaux : « Ta grille décrit ce qu'on attend à chaque niveau. Labo Codex pourrait t'aider à suivre la progression de tes étudiant·es à partir d'elle, par exemple en associant une rétroaction à chaque niveau. »
- Dans les deux cas : « Un critère peut s'évaluer de trois façons : holistique (par niveaux), analytique (par points) ou algorithmique (par un calcul). »
- Lien : « Les trois façons d'évaluer un critère » → l'aide `grille-type-critere-detail`.

Une grille à niveaux **dont les cases étaient des rétroactions** (une cartouche vient d'être créée) : le paragraphe « à niveaux » parlerait d'associer une rétroaction qui l'est déjà. Dans ce cas, n'affiche que la phrase commune et le lien (supposition de Cowork, à dire à Grégoire en une ligne dans ton rapport).

## Les bancs

Vitest : le bon paragraphe selon la grille (points, niveaux, niveaux avec rétroactions) ; textes exacts ; le lien porte `data-target="grille-type-critere-detail"` ; mutation par essai. Playwright, lancée seule dans WebKit : créer une grille en points, l'encadré paraît, le lien ouvre l'aide. Break-test pour chaque essai neuf.

## La méthode

Commit, Vitest complet, demande `plans de travail/DEMANDE-RELECTURE-2026-10-17-apporter-mon-materiel-6-aller-plus-loin.md`. Bump du bloc de jetons. Aucun push, aucune release, aucune vérification complète (étape 8). Rapport court à Grégoire.
