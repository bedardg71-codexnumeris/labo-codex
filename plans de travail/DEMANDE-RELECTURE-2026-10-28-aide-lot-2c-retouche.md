# Demande de relecture – L'Aide, lot 2c : la retouche (#1152)

> Claude Code, mercredi 28 octobre 2026, sur `main`. Verdict : `VERDICT-RELECTURE-2026-10-28-aide-lot-2c.md`. Commit de la retouche : `2692fd48`. Non poussé, pas de release.

## En bref

- Retouches **1, 3, 4, 5 et 6 faites**, mot pour mot.
- Retouche **2 arrêtée** : la mesure dit que la copie non recevable **ne vaut pas 0**. C'est la condition d'arrêt du verdict ; la question remonte à Grégoire (§ 2). Les phrases de la procédure et de la ligne sommative ne sont pas touchées.
- Tests : Vitest complet **9 993 sur 9 993** (+1, l'essai d'ordre) ; Playwright ciblé **8 sur 8** (`aide-lot-2c-1152`, `aide-forme-1152`, `bareme-2-aide`, `aide-exporter-archiver-893`, `aide-lot-2a-1152`, `aide-lot-2b-1152`). Verdict complet non lancé.

## 1. Ce qui est fait

| Retouche | Ce qui change |
|---|---|
| 1 – l'ordre | `liste-evaluations` passe deuxième, après `preparer-importer`. Sentinelle neuve : la constante suit, et un essai neuf lit l'ordre des sous-onglets dans `js/config.js` et le compare aux lignes « Navigation : Évaluation → … » des cartes, dans l'ordre du DOM. Sentinelle de la forme : `PLACES.evaluation` et son commentaire. Spec : les deux premiers titres à l'écran. |
| 3 | « Une copie peut être non remise, non recevable, soupçonnée ou incomplète. » |
| 4 | « La note dépend de ta pratique ; par exemple, en sommative, il n'y entre pas ; en standards hybride, […] » |
| 5 | Le bloc « Travail INCOMPLET », mot pour mot du verdict. |
| 6 | La validation du 28 oct., 5 h 49 (« on garde »), notée dans le commentaire HTML de `liste-evaluations`, `jetons-reprise` et `irrecevables`. |

**Break-test** : l'ancien ordre remis dans `index.html` rougit les trois essais d'ordre (la sentinelle neuve, deux ; la forme, un ; la spec, un). Un premier jet de l'essai neuf lisait l'ordre de la constante et restait vert sur l'ancien ordre : corrigé pour lire le DOM, puis rejoué rouge.

## 2. La retouche 2 : la mesure, et pourquoi elle s'arrête

**Montage** (spec jetable, retirée après) : une copie évaluée E et M sur deux critères à 50 %, avec les cinq niveaux de l'Échelle de départ (PS, I, D, M, E) ; ouverte par la copie ; « Intégrité académique » passée à « Non recevable (Plagiat) » ; puis « Verrouiller l'évaluation ». Production de pondération 10, élève fictif.

**Faits mesurés**

| | Avant | Après « Plagiat » | Après le verrou |
|---|---|---|---|
| Menus des critères | E, M | **E, M** (allumés) | E, M (éteints par le verrou) |
| Choix offerts | « », PS, I, D, M, E | idem : aucun « 0 » | idem |
| `noteCalculeeCourante` | 87,5 | **87,5** | 87,5 |
| `noteFinale` en base | 87,5 | 87,5 | **87,5**, verrouillée |

Le message s'affiche : « Les critères sont automatiquement à 0. Cette évaluation sera exclue des calculs de moyenne. »
En sommative : `evaluationEntreDansLaNote` = vrai, `evaluationCompteCommeRemise` = faux, `PratiqueSommative.calculerPerformance` = **0,875**. La copie compte donc **à 87,5 % dans P**, et comme non remise dans C.

**La cause, au code** : `changerStatutIntegrite` cherche `select[id^="critere"]` (`js/evaluation-sauvegarde.js:607`) ; les menus s'appellent `eval_<id>` (`js/evaluation-chargement.js:1184, 1219, 1232, 1408, 1418`). Le sélecteur ne trouve rien : ni le `'0'` ni le `disabled` ne sont posés. Même avec un bon sélecteur, `'0'` n'est pas une option de l'Échelle de départ.

**Inférence (non mesurée au navigateur)** : aucun module de `js/pratiques/` ne lit `statutIntegrite` pour la note — seul `evaluationCompteCommeRemise` (C) le lit, via `evaluationNonRecevable`. Les lignes « en spécifications… » et « en standards… » de l'entrée pourraient donc être fausses elles aussi. À mesurer avant d'y toucher.

**Pourquoi c'est à Grégoire** : c'est un défaut du calcul, hors de ce lot. Il peut toucher des notes de l'automne 2026 : toute copie non recevable verrouillée compte à sa note calculée dans P. Le stock (les copies déjà marquées chez Grégoire) n'est pas mesurable d'ici : il vit dans son navigateur.

## 3. Ce que la retouche 2 laisse

Dans `irrecevables`, deux phrases restent telles quelles en attendant la décision : « en sommative, elle vaut 0, sauf si une reprise la remplace » et « Non recevable, tous les critères passent à « 0 - Aucun » ». Elles décrivent l'intention, pas le comportement mesuré.

## 4. Trouvailles

- Le défaut du § 2 : **remonté à Grégoire**, non inscrit au BACKLOG en attendant sa décision (ce qu'une copie non recevable doit valoir dans la note, et le sort du stock).
- Le message « Cette évaluation sera exclue des calculs de moyenne » est vrai pour la moyenne de la Liste (`js/liste-evaluations.js:604`), faux pour la note du cours : même décision.

## 5. À relire

Les cinq retouches faites contre le verdict ; la mesure du § 2 (rejouable : le montage est décrit ci-dessus) ; l'essai d'ordre neuf.
