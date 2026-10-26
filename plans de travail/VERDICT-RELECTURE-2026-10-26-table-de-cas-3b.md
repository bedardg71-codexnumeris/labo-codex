# Verdict de relecture – La table de cas, lot 3b (26 oct. 2026)

> Cowork, lundi 26 octobre 2026, 15 h 30 (Toronto, mesuré par `date`). Relu : `DEMANDE-RELECTURE-2026-10-26-table-de-cas-3b.md`, `PORTES-TERRAIN-2026-10-26-table-de-cas-3b.md`, `27d5d610` (la liste des fichiers ; les interpolations ajoutées dans `js/grilles.js` ; les identifiants de `js/tables-cas-algo.js`, `ID_VALIDE`, `CODE_VALIDE`, `rangees`), les gardes de l'enregistrement automatique (`js/evaluation-chargement.js` l. 1759-1775, `js/evaluation-retroaction.js` l. 417).
> **Pas relancé par Cowork** : Vitest, WebKit. Les captures sont dans le dépôt ; la preuve de la copie évaluée (phrase, mémoire, PDF) est acceptée sur la spec.

## Verdict : **accepté, sans retouche**

Le cœur de l'étape 3 est là : sous les paliers, des tables qui choisissent un texte selon une valeur de la copie, dans les deux modes, jusqu'au PDF ; une donnée qui n'existe qu'avec une table et qui voyage. Un critère sans table lit ce qu'il lisait, à l'octet. **L'étape 3 du plan est faite.**

## 1. Les écarts à la consigne : Claude Code a raison sur les deux

1. **La moyenne sans limite** (point 5 de la demande). La consigne la faisait sortir du calcul de projection : sans limite fixée, elle serait toujours restée « Sans valeur ». **L'erreur était dans la consigne** ; l'ébauche faisait déjà le calcul juste. Accepté.
2. **La note bornée** (point 4) : la note que l'évaluation retient, pas `noteCalculee` qui descend sous 0. Sans ce choix, le cas « 0 » d'une table selon la note n'aurait jamais été atteint avec une pénalité fixe. Accepté.

## 2. Les sept décisions (D1 à D7) : toutes acceptées par Cowork

| | Décision | Cowork |
|---|---|---|
| D1 | Changer « Selon » d'une table écrite demande confirmation | **Accepté** : changer de valeur efface les textes ; règle de Grégoire du 20 sept. Mots lus par l'enseignant·e. |
| D2 | La table du code suit la liste des codes, sans rien perdre | **Accepté.** |
| D3 | Deux règles d'égalité pour un critère existant (l'atelier : le premier à atteindre ; « principalement » : le premier compté) | **Accepté tel quel** : ce sont les deux règles d'aujourd'hui, gardées par le lot 3a pour le stock ; les aligner changerait ce que lisent des copies déjà évaluées. Aucun critère existant n'a de table. Rien à inscrire sans symptôme vécu. |
| D4 | « Copie réglée : 1 unité manquante. » sans étendue | **Accepté.** |
| D5 | Le menu « Selon » à 40 px, comme les menus de la bibliothèque | **Accepté.** |
| D6 | « La borne est un nombre, 0 ou plus. » | **Accepté.** |
| D7 | Le mode Catégories reçoit les tables | **Accepté** : la consigne le demandait (§ 3.3) ; le § 8 excluait l'écran qui active ce mode (#1133), pas son moteur. Lecture juste. |

**Le partage refuse un paquet dont une table est illisible** (point 1), quand l'import par fichier l'écarte : **accepté**. C'est la règle du barème ; une table illisible n'arrive que d'un paquet abîmé ou forgé, et un refus dit quelque chose là où un retrait silencieux ne dirait rien.

## 3. Ce que Cowork a vérifié

1. **Le cliquet #467 (80 → 105)** : les vingt-cinq interpolations nouvelles sont des identifiants de table (`${tid}`, contraints à `[A-Za-z0-9_-]` par `ID_VALIDE`), des noms de gestionnaires (`${geste}`), des fragments construits par le code, la valeur d'une option tirée de la liste fermée des six valeurs, et des clés de cas (`code:` + un code filtré par `CODE_VALIDE`). Aucun texte de l'enseignant·e n'est interpolé brut.
2. Aucun gestionnaire en ligne, aucun `console.log`, aucun `innerHTML =` ajouté.
3. **Le piège 2, lu** : pendant le chargement d'une évaluation, l'enregistrement automatique se tait (`_autoSaveSuspendu`, 500 ms ; `_chargementsEvaluationEnCours`, #960). Le recalcul que déclenche ensuite le compteur d'Annoter suit le même chemin qu'une limite ou un palier modifiés après coup : ce lot n'ouvre pas de chemin neuf. Une copie verrouillée ne s'écrit pas. Rien à faire sans symptôme vécu.
4. **#1169** (une grille partagée perd le signalement d'un palier et son texte) : inscrite, non corrigée. Juste : défaut d'avant ce lot, hors de son parcours, aucun symptôme vécu.

## 4. Portes terrain : aucune due

Même jugement que pour le lot 3a : les trois gestes (un bloc posé au doigt dans un cas, le menu « Selon » dans Safari, la confirmation de retrait) sont du comportement et du confort ; rien n'écrit dans des données sans geste, et « Retirer cette table » demande avant d'effacer. Règle 2 du skill `portes-terrain`. Les sept décisions sont prises par Cowork. **Pas d'artefact** ; les trois gestes restent des angles morts, à observer en usage sur l'iPad.

## 5. La suite

1. Les Nouvelles de la version qui portera 3a et 3b : Cowork propose le texte, Grégoire le corrige.
2. Le verdict complet (en dix morceaux), la release et le push : au signal de Grégoire, le soir, Cowork et Safari fermés.
3. L'étape 4 du plan (les calculs que l'enseignant·e compose) attend la décision de Grégoire sur ce que veulent dire les calculs tout faits.
