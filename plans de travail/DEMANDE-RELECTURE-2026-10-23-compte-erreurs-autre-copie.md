# Demande de relecture – #1142 : le compte d'erreurs d'une copie écrit dans l'évaluation d'une autre

> Claude Code, vendredi 23 octobre 2026 (Toronto). Pour Cowork (`PROTOCOLE.md`, règle 2 : une écriture dans les données réelles). Consigne exécutée : `CONSIGNE-DU-JOUR.md` de 8 h 24.
> Commit sur `main`, **non poussé**, fichiers nommés un par un. Pas de verdict complet (consigne § 4 : il se prend à la release, avec l'étape 2b).
> Désignation des copies : identifiants d'évaluation et nombres seulement.

## 1. Reproduit d'abord (mandat 1)

Banc WebKit `tests/integration/compte-erreurs-autre-copie-1142.spec.js`. Deux copies d'une production, A avec 1 code, B avec 11 ; le geste : Annoter, A, « Évaluer », puis le badge de B (`travauxUI.ouvrirFichier`). Mesuré **avant** tout correctif :

| Cas | A après le passage à B |
|---|---|
| Évaluations ouvertes | `erreurs` 11, phrase « 11 erreurs… », note de 11 : réécrite en entier par l'enregistrement automatique. |
| Verrouillées, sans geste | 1 : intacte. |
| Verrouillées, base > 25 Ki, le geste de 6 h 57 (déverrouiller, « Note chiffrée », reverrouiller, passer à B) | **`erreurs` 11, phrase « 1 erreur », `noteFinale` intacte, `verrouillee: true`** : le symptôme vécu, à l'identique. |

⚠ Le cas 3 n'apparaît qu'avec une base au-delà de 25 Ki (cache mémoire de `db`) **et** des fixtures écrites après `db.ready` : le premier banc écrivait avant, tout allait en localStorage, et il restait vert. Toute vraie base de trimestre dépasse 25 Ki.

## 2. Les deux causes (et l'hypothèse de Cowork)

1. **La source — l'hypothèse de Cowork, confirmée.** Instrumenté : au passage A → B, `activerAnnotation` (travaux-ui.js, dans `ouvrirFichier`) charge les annotations de B et appelle `mettreAJourCompteursErreurs` alors que `evaluationEnCours` est encore A et que le champ porte la marque `data-da` de A — la garde #671 passe, puisque panneau et pivot s'accordent ; ce sont les **annotations** qui viennent d'ailleurs. Le calcul écrit 11 dans le pivot de A.
2. **Le verrou contourné — ce que l'hypothèse n'expliquait pas.** Une évaluation verrouillée n'est jamais réécrite par l'enregistrement automatique (garde « Phase 0 A25 »). Mais `sauvegarderEvaluationModifiee` (evaluation.js, au reverrouillage) rangeait dans la base **l'objet même** `evaluationEnCours.donneesAlgorithmiques`. Au-delà de 25 Ki, `db.getSync` rend l'objet du cache mémoire : base et pivot partageaient l'objet, et le calcul de (1) réécrivait l'évaluation verrouillée **en place**, sans passer par aucun enregistrement. Même alias en lecture : `verifierEtChargerEvaluationExistante` (evaluation.js:687).

**Pourquoi `noteFinale` n'a pas suivi** (consigne § 2, lu dans le code) : seuls les chemins d'enregistrement écrivent `noteFinale` ; la mutation en place n'en est pas un. Aucun lecteur hors de l'écran ne recalcule une note depuis `donneesAlgorithmiques` : le PDF en tire la ligne du calcul (le symptôme), la portée y lit `pourcentage` pour juger la complétude, le dépistage EUF lit `totalErreurs` (mode des codes). Inférence non mesurée : une copie contaminée **rouverte** affiche à l'écran, avant le compteur de +2 s, une note calculée sur le compte faux ; la rouvrir pour la modifier recalcule depuis les codes avant tout enregistrement (`_forcerRecalculAlgorithmiqueAvantSauvegarde` relance le compteur).

## 3. La source tarie (mandat 2)

| Quoi | Où |
|---|---|
| La garde sur l'écriture : le total des codes n'entre dans le champ (donc dans aucun calcul) que si la copie annotée — élève et production — est celle des DEUX pivots (le nom nu que le calcul écrit, et `window`). Sinon rien ne s'écrit ; le compteur relancé à +2 s par `afficherPalettesEval` pose le bon compte quand l'évaluation est la bonne. Une identité comparée, aucune horloge, comme #671. | `js/travaux-outils.js`, `mettreAJourCompteursErreurs` ; le prédicat `copieEstCelleDeLEvaluationEnCours`, `js/evaluation-calcul.js` |
| Le pivot et la base ne partagent plus aucun objet : copies profondes de `donneesAlgorithmiques` et `pointsAnalytiques` aux deux lectures et aux quatre écritures (`pointsAnalytiques` : même défaut, mêmes lignes). | `js/evaluation.js` (l. 681-687 et `sauvegarderEvaluationModifiee`), `js/evaluation-sauvegarde.js`, `js/evaluation-chargement.js` (enregistrement automatique) |
| Une seule règle de comptage des codes, exportée pour la mesure du stock ; une seule construction de la phrase du mode simple (`phraseDecompteAlgo`), pour l'écran et la réparation. `_projectionEUF` reste le seul site de `projectionAlgo.calculer` (paramètre facultatif : le critère résolu). | `travaux-outils.js` (`compterCodesAnnotation`), `evaluation-calcul.js` |

## 4. Le stock, mesuré sans rien écrire (mandat 3) et la réparation écrite, pas lancée (mandat 4)

`js/comptes-erreurs-stock.js`, chargé par index.html. À la console : `await ComptesErreurs.verifier()` ; la réparation : `await ComptesErreurs.verifier({ reparer: true })`, refusée sans `Codex.estAJour()` (exposé pour l'occasion dans `codex.js`). Trimestre actif seulement ; refus net sous `a2025` et `h2026`.

**La règle de proposition — posée par Claude Code, à relire.** Pour chaque critère algorithmique en mode simple : une valeur v ≠ enregistré est proposée si toutes les sources lisibles parmi {phrase, codes posés} donnent v (au moins une), **et** si le niveau du critère **et** `noteFinale` redonnent v (par `formulesAlgo`, `niveauDuPourcentage` et `porteeDepuisEvaluation`, la règle de `calculerNote`, plafond de reprise ciblée compris ; tolérance 0,01). Sinon : listée sans proposition, avec le motif. Choix nommés :
- la phrase se relit par l'énoncé « décompte » du critère, mention « (x après pondération) » retirée ; une phrase de cartouche ne se relit pas (null) ;
- « codes posés » vaut null sans aucun code (un compte tapé à la main reste possible) et pour un 2e critère algorithmique de la grille (les annotations ne remplissent que le premier champ) ;
- les poids (21 oct.) : la valeur est lue par la somme pondérée des codes puis par le brut, et la première lecture où niveau et note s'accordent l'emporte ;
- le mode des codes par catégorie n'est pas examiné : son champ n'est pas celui que les annotations remplissent.

La réparation réécrit `donneesAlgorithmiques[c]` (compte, note calculée, pourcentage, niveau, phrase) des seules proposées, par le calcul de l'application, sur une copie du tableau (un échec d'écriture ne laisse rien en mémoire) ; ni `criteres`, ni `noteFinale`, ni le verrou.

## 5. Les preuves

- **Banc de reproduction** (5 essais) vert après correctif. **Break-tests** : la garde retirée → l'essai (1) et la non-régression « un code posé » rougissent ; les copies retirées → l'invariant « aucun objet partagé » rougit ; les deux retirées → l'essai (2), c'est l'état mesuré avant correctif.
- **Mesure du stock** `tests/integration/comptes-erreurs-stock-1142.spec.js` (4 essais) : faux trimestre, une saine, deux décalées (11 → 1 ; 2 → 26, verrouillée), deux ambiguës (phrase ≠ codes ; niveau et note qui redonnent l'enregistré). Rend exactement les deux décalées avec leur valeur, les deux ambiguës sans proposition, **zéro écriture** (témoin sur `db.setSync`, base identique à l'octet). Réparation : refusée sans codex à jour ; avec, une seule écriture, seules les deux `donneesAlgorithmiques` changent, la phrase réparée est celle que l'élève a lue ; remesurée, plus rien à proposer. Refus sous H2026. **Break-tests** (5) : mesure qui écrit, réparation qui touche `noteFinale`, codex non exigé, accord niveau/note ignoré, trimestre fermé accepté — chacun rougit.
- **Vitest** depuis `tests/` : 9 540 sur 9 540, 810 fichiers. Trois sentinelles ajustées à la forme du code, sans rien relâcher : `sentinelle-lot2-analytique-points` (son motif reconnaît aussi la forme copiée `JSON.parse(JSON.stringify(…))` ; témoin ≥ 3 inchangé) ; #668 et le texte troué F.a passent sans retouche (site unique de projection gardé).
- **WebKit du périmètre** : 48 specs (Annoter, visionneuse, évaluation, critère algorithmique, rétroaction, témoins d'enregistrement), 195 essais : 190 verts, 2 skipped, et :
  - `critere-algorithmique-dit-vrai` (2 essais) **rouges par mon lot**, deux fois sur deux : le banc simulait une annotation sur un fichier `F_ALGO` absent de la base, et la garde refuse une copie introuvable quand une évaluation est ouverte. Correction de la **fixture** (le fichier de la copie, élève et production), pas de la garde : 3 sur 3 ensuite.
  - `critere-algorithmique-palette` (iPad, l. 173) **instable, sans lien avec ce lot** : rouge aussi sur le code de `53cb39b8` seul (mes fichiers mis de côté, 1 fois sur 2). Inscrit **#1143** (issue 2) : il bloque le verdict de l'étape 2b.
- **Anti-cache** : jetons `20261022` + lettre jamais servie pour ce chemin (la sentinelle veut le jour du build `1022-1833`).
- **Complexité** (HEAD `53cb39b8` → ce commit) : au-dessus de 15 : 453 → 453 ; au-dessus de 30 : 86 → 86 (maximum 130) ; somme au-dessus de 15 : 11 411 → 11 410 ; fichiers de plus de 1 000 lignes 37 → 37, leurs lignes 88 648 → 88 654 (Δ +6).
- **Non fait** : le verdict Playwright complet ; la mesure sur les données de Grégoire (elle demande le code déployé).

## 6. Ce qui reste à Grégoire

1. **D'ici au déploiement**, le défaut est toujours en ligne : passer d'une copie à l'autre en mode Évaluer peut encore écrire. Recharger la page entre deux copies devrait l'éviter (le pivot repart vide, et le calcul ne tourne pas sans pivot) — inférence lue dans le code, non mesurée au banc.
2. Après déploiement : `await ComptesErreurs.verifier()` dans la console de l'onglet. Il verra une ligne par compte à réparer — « EVAL_… · ‹critère› : 2 → 26 — phrase 26, codes posés 26, niveau I et note 64 redonnent 26 ; l'enregistré 2 redonnerait E et 82,33 » — puis les copies « SANS PROPOSITION », à trancher lui-même.
3. Sur son accord, après un codex à jour : `await ComptesErreurs.verifier({ reparer: true })` ; puis refaire les PDF des copies réparées.

## 7. Trouvailles hors du lot

- **Les deux pivots** (`let evaluationEnCours` de config.js et `window.evaluationEnCours`) sont deux objets distincts, déjà nommé par `etatVivantEvaluationEnCours` (#699). Issue 2 du protocole : ce n'est pas la cause de #1142, la garde compare les deux. Non inscrit : aucun symptôme vécu propre.
- **Le dépistage EUF** (`entites/signalement-depistage.js`) ne lit que `totalErreurs` (le mode des codes) : en mode simple, il ne voit pas `erreurs`. Issue 3 : constat de lecture, sans conséquence observée, non mesuré ; rien d'écrit dans le code.
