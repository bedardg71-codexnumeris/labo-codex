# Demande de relecture – La quatrième retouche de « Une copie non recevable vaut ce que la règle dit » (#1175, 28 octobre 2026)

> Écrite par Claude Code le mercredi 28 octobre 2026, sur `main`. Verdict : `VERDICT-RELECTURE-2026-10-28-copie-non-recevable-note.md`, section « Relecture de la troisième retouche » (Cowork, 8 h 20). Code : `fd66e8ee`. Pas de release, pas de verdict Playwright complet, pas de push.

## En bref

- **Une reprise accordée à une copie non recevable part vide** (`js/evaluation-jetons.js:598-606`) : ni niveaux, ni note, ni rétroaction de son originale. Le prédicat est celui du registre (`evaluationNonRecevable`), lu sur l'originale.
- **Une reprise ordinaire ne change pas** : elle part des niveaux, de la note et de la rétroaction de l'originale, pour qu'on les modifie.
- **L'originale ne bouge pas** (hors les marques du remplacement, posées comme avant).

## 1. La mesure, avant le correctif

Banc fictif, WebKit (`copie-non-recevable-note-28-oct.spec.js`, troisième test). L'originale EV1 porte tout ce qu'une copie évaluée peut porter : E et M (87,5), niveau final « M », portée 100, la rétroaction réécrite, des points (`c1: 9`), des comptes (`c2` : 3 erreurs, 300 mots). Elle est en plagiat, verrouillée, puis reçoit un jeton de reprise. Le témoin EV2 (recevable, E et E, 95) en reçoit un aussi.

| Où | Avant le correctif | Après |
|---|---|---|
| La reprise, en base | E et M, 87,5, « M », portée 100, points, comptes, « Rétroaction fictive. », marque réécrite | `criteres: []`, `pointsAnalytiques: {}`, `donneesAlgorithmiques: {}` ; les cinq autres champs absents |
| La Liste, ligne de la reprise | « À réévaluer », « M », « 87,5 % » | « À réévaluer », « - », « - » |
| Le formulaire de la reprise | menus E et M, « 87,5 % », « M », la rétroaction de l'originale | menus vides, « 0 % », « -- », rétroaction vide |
| La reprise du témoin EV2 | E et E, 95, « M », la rétroaction | inchangée |

## 2. Ce qui se vide, et ce qui reste

**Vidé** (l'état d'un formulaire neuf, `evaluation-chargement.js:491-492` et `:569-571`) : les niveaux des critères avec leurs rétroactions (`criteres`), les points (`pointsAnalytiques`), les comptes (`donneesAlgorithmiques`) ; **retirés** : `noteFinale`, `niveauFinal`, `ponderationCouverte`, `retroactionFinale`, `retroactionReecrite`. La rétroaction suit ce que la cartouche génère pour une évaluation vide : mesuré, une chaîne vide.

**Restent** : la grille, l'échelle, la cartouche, les options d'affichage, le statut de remise (la configuration de la production, pas un jugement de la copie).

**Suppositions** (décidées, à corriger au besoin) :
- `actionsRLO` (le profil ACO, compté sur les tampons de l'annotation) et `dureeEvaluation` restent. Ni l'un ni l'autre n'est un niveau ou une note. Le profil se recalcule à l'enregistrement quand l'observation des actions est activée.
- Le « 0 % » du formulaire d'une reprise vide est celui qu'un formulaire sans niveau affiche (`noteCalculeeCourante` à 0). Je ne l'ai pas comparé à un formulaire neuf ouvert sur une autre copie.
- La garde `typeof evaluationNonRecevable === 'function'` suit l'idiome du module. `index.html` charge le registre (l. 13063) avant les jetons (l. 13202).

**Le stock** : une reprise déjà accordée à une copie non recevable garde les niveaux recopiés. Elle n'est pas réécrite. Même disposition que la réponse A de 8 h 20 : sa réévaluation remplace ces niveaux.

## 3. Les tests

- **Spec WebKit**, troisième test (neuf) : la reprise en base, la reprise du témoin, les deux originales, la ligne de la Liste, le formulaire. Il rougissait avant le correctif (tableau ci-dessus) ; il est vert après.
- **Sentinelle #725** (`sentinelle-725-617-724-720-jetons-de-reprise.test.js`) : le harnais reçoit le **vrai** prédicat du registre (`pratique-configurable.js` puis `pratique-registre.js`). Quatre essais neufs : « plagiat » et « ia » partent vides (grille, échelle et cartouche restent ; l'originale ne bouge pas), et les témoins « recevable » et sans statut partent des niveaux de l'originale. L'essai de la troisième retouche (origine en plagiat) attend maintenant une note absente.
- **Break-test** : deux mutations (la garde à `false` ; la garde à `true`). La première rougit trois essais Vitest et le test WebKit, la seconde deux essais Vitest (les témoins) et le test WebKit : **4 sur 4**. Arbre restauré, contrôlé par sha256.
- Jeton anti-cache : `evaluation-jetons.js?v=20261027b` (le jour du build, comme l'exige `sentinelle-anticache-fichiers-modifies`).
- **Vitest** depuis `tests/` : **839 fichiers, 10 048 essais, verts**.
- **Playwright ciblé** (WebKit) : la spec du lot (3), #1007 2a-2, parcours sommatif du 24 sept., parcours des pratiques du 16 sept., golden master L2-0, #909/#903, Comparateur (rendu), Aide #893 : **21 verts**. **La suite complète n'a pas tourné** : pas de verdict sur HEAD.

## 4. Trouvaille

Aucune neuve. La trouvaille de la troisième retouche (« une reprise reprend les niveaux de son originale ») est celle que cette retouche ferme.

## Pour Grégoire

Rien à trancher. Cowork a annoncé la décision, et tu peux t'y opposer : une reprise accordée après un plagiat ou une IA non autorisée s'ouvre maintenant **vide**, comme une copie jamais évaluée, au lieu de reprendre les niveaux de la copie non recevable.
