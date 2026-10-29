# Consigne – Des standards sans portfolio, lot 3 : les Productions ne poussent plus vers une terminale (29 octobre 2026)

> Écrite par Cowork le jeudi 29 octobre 2026 à 8 h 54 (Toronto, mesuré par `date`), sur `main` = `ef36494b` (non poussé). Ne remplace aucune autre consigne. Un seul lot qui écrit à la fois : vérifie qu'aucune autre instance n'écrit dans `js/`.
> Plan : `PLAN-2026-10-28-standards-sans-portfolio.md`, § 3, lot 3. Les mots : `plans de travail/TEXTES-2026-10-29-standards-lot-3.md`, **deux textes validés par Grégoire (8 h 52 et 8 h 53), à poser mot pour mot**. Lots 1 et 2 acceptés.

## 0. Avant tout

- Rituel de début de session ; aucune suite qui tourne.
- Commit de docs seul : ce fichier, `TEXTES-2026-10-29-standards-lot-3.md`, `VERDICT-RELECTURE-2026-10-29-guidage-demo.md`. Pas les fichiers d'une autre instance.

## 1. Ce que l'utilisateur verra

Dans une pratique Standards **sans aucun « Artefact »**, les Productions n'exigent plus de pondération et ne poussent plus vers une évaluation terminale : l'encadré « À vérifier » dit ce que fait le calcul (texte 1). La définition du type « Évaluation terminale » dit qu'elle est facultative (texte 2). **Pour la pratique de Grégoire (avec artefacts), l'encadré ne change pas.** Aucune donnée réécrite.

## 2. Le mandat

1. **La pondération** (`raisonChampsObligatoiresProduction`, `js/productions.js:~419`) : en Standards (famille de la pratique active), « la pondération est requise : plus de 0 % » ne s'applique plus, quel que soit le type ; les autres familles ne changent pas. Mesure comment la fonction connaît la famille active sans dépendre du DOM.
2. **L'encadré « À vérifier »** (`validerProductionsStd`, `:~349-409`) : quand aucune production n'est de type « Artefact », les règles 3a, 3b et 5 cèdent la place au **texte 1**, une seule ligne, sans `productionId` (aucun bouton de conversion). **À mesurer** : l'avertissement « L'évaluation terminale … n'a pas de pondération : la note finale n'est pas constructible » est-il encore vrai sans artefact, après le lot 1 ? S'il l'est, il reste ; sinon il part, et dis-le. Avec au moins un artefact : **tout reste tel quel**, mot pour mot (épinglé).
3. **La définition « Évaluation terminale »** (`:~2606`) : le **texte 2**, après le titre en gras inchangé ; « % » avec l'insécable.
4. **La définition « Artefact »** (`:~2605`) : « allez dans » devient « va dans » (l'application tutoie ; décision de Cowork), rien d'autre.
5. Les trouvailles : les trois issues de `CLAUDE.md`, « inscrire » par défaut. Rien des lots 4 et 5.

## 3. Les tests

- Les sentinelles #394 (règles 3 et 5) suivent par décision, en citant ce fichier ; leurs cas **avec** artefacts restent tels quels.
- **Une section neuve** dans `sentinelle-standards-sans-portfolio` : CHIM (sans artefact) → la ligne du texte 1, **lue dans le fichier TEXTES**, et aucun des anciens avertissements ; une production à pondération 0 s'enregistre en Standards et reste refusée en Sommative ; GREG (avec artefacts) → les avertissements d'avant, épinglés sur l'ancien code. Le texte 2, lu dans TEXTES, paraît dans la définition.
- **Break-test** (arbre restauré par sha256) : l'ancien `validerProductionsStd` → CHIM rougit, GREG reste vert.
- Vitest depuis `tests/` ; un essai Playwright ciblé (l'encadré d'une pratique sans artefact, WebKit), on attend l'élément, jamais `waitForTimeout`.

## 4. Clôture

`BACKLOG.md` (#1178, lot 3 coché) ; demande de relecture `plans de travail/DEMANDE-RELECTURE-2026-10-29-standards-sans-portfolio-lot-3.md` (avant → après pour CHIM et GREG, la mesure du point 2.2). Un commit pour le code, un pour les docs. Pas de release, de verdict ni de push sans le signal de Grégoire.
