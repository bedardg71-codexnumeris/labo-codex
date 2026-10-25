# Consigne – retouche du statut « Incomplet ; travail en cours » (dimanche 25 octobre 2026)

> Écrite par Cowork le dimanche 25 octobre 2026 à 11 h 31 (Toronto). Suite du verdict `VERDICT-RELECTURE-2026-10-25-statut-incomplet.md` (accepté, avec une retouche).
> **Ordre (décision de Cowork)** : tout de suite, AVANT le lot 2 des bibliothèques : elle finit le lot dont Grégoire se sert aujourd'hui. Sur `main`.

## 0. Avant tout

- Aucune suite ne tourne en arrière-plan (règle 5) ; pas de suite Playwright complète (règle 7).
- Commit de docs seul, fichiers nommés : cette consigne et `VERDICT-RELECTURE-2026-10-25-statut-incomplet.md`.

## 1. Le PDF d'une copie cochée après des niveaux (décision de Cowork, réversible)

Rien n'est vidé en base : les niveaux saisis restent, masqués, comme tu l'as fait (modèle de « Non reçu »). Mais **le PDF d'une évaluation qui porte `travailEnCours` ne montre ni critère ni niveau**, exactement comme celui d'une copie cochée avant tout niveau (ce que tu as mesuré : `criteria: []`, niveau global vide, aucune note). Aucun mot nouveau pour l'élève. La garde vit là où le PDF lit les critères (`construireCriteres` / `construireFeedback`), pas dans l'affichage. Test : cocher la case APRÈS des niveaux, puis lire le PDF construit ; break-test.

## 2. La pastille après décochage

`_poserPastilleTravailEnCours` remet « Importé » d'office. Décochée, la pastille doit reprendre l'état réel de la copie (une copie annotée dit « Annoté »), celui que calcule sa sélection dans `travaux-ui.js`. Pas de calcul d'état recopié : appelle celui qui existe.

## 3. Les spécifications (décision de Grégoire, 11 h 30)

Grégoire a choisi : pendant le délai, la copie incomplète est **mise de côté** dans le C des spécifications, ni acceptable ni non acceptable. **Mesuré par Cowork : c'est déjà le cas.** `calculerDetailsCompletion` et `detecterDefis` (`pratique-pan-specifications.js`) écartent les évaluations sans note, et le dénominateur est fixe (travaux exigés du palier le plus haut). **Ne change pas le code** ; ajoute au banc Vitest un test qui le fixe (une copie incomplète laisse le C des spécifications identique à « pas de copie ») et corrige la phrase de ta demande (« vaut non acceptable ») dans la demande de relecture de cette retouche.

## 4. Inscrire

Le contraste de la famille de pastilles « un geste attendu » (blanc sur `--alerte-bordure-attention`, environ 2,3:1 ; « À réévaluer », « Non verrouillée », « Incomplet ») : une fiche au BACKLOG, une phrase en français d'utilisateur, hors de ce lot.

## 5. Clôture

- **Pas de release, ni verdict, ni push.**
- Demande de relecture : `DEMANDE-RELECTURE-2026-10-25-statut-incomplet-retouche.md`.
- Geste à vérifier à l'écran après la mise en ligne : celui du lot, inchangé. Rien de plus à voir pour Grégoire.
