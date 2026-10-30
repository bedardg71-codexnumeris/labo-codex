# Verdict de relecture – Le lot 1 des seuils : une seule source par famille (b6b74585, 6ffed46a)

> Cowork, vendredi 30 octobre 2026, 11 h 05 (Toronto), sur `main` = `2ded97b0` (7 commits non poussés). Lecture faite par une session de relecture indépendante, en lecture seule, à partir de la cartographie de `5272f92a` ; Cowork a revérifié au commit `6ffed46a` les constats 1, 2, 3 et 6. Rien exécuté : ni Vitest, ni Playwright, ni break-test.

## Verdict

**Pas accepté tel quel.** Rien en sécurité, aucune écriture dans les réglages enregistrés, plus aucun lecteur d'`idme` dans `js/`, jetons de cache bumpés. Mais le lot n'est pas fini (constats 1, 2, 6, 7) et une règle de sens est livrée sans décision (constat 3, **en attente de Grégoire**).

## À finir dans le lot (c'est le lot, pas une trouvaille)

1. **Aperçu, barre P** (`js/tableau-bord-apercu.js:897`, `:1966-1972`). `calculerDistributionPerformance` rend `null` dès que `reperesPerformance().echelle` manque (sommative, spécifications, échelles divergentes). La branche `else if (nbSansNote > 0)` dit alors « La note du cours ne se construit pas encore : il n'y a rien à répartir » sous une moyenne affichée ; sans élève sans note, la répartition disparaît sans un mot (contre #775). Séparer « pas d'échelle unique » de « personne n'a de note ». La phrase neuve va dans la liste des mots à valider. Ajouter le test du cas.
2. **Les textes du panneau des seuils contredisent le lot** : `index.html:8899` « Remettre les valeurs par défaut (70 · 80 · 85) » (le bouton pose 85 · 90 · 95 ; lire les défauts à la source, comme l'Aide) ; `:8897` « couleur des colonnes A, C, P, M » et `:8903` « Assiduité, Complétion, Performance et Mobilisation » (P ne suit plus ces seuils, D3) ; `js/accompagnement-contenu-hover.js:176` « Fragile / Acceptable / Bon ». Propositions à ajouter à la liste des mots à valider ; une sentinelle sur le libellé du bouton.
6. **Le pack de démo** (`js/pack-demo-10.js:18`) : les repères D et M ajoutés, `_metadata.version` resté à « 21.2 » ; `demo-namespace.js:297-299` ne repeuple que si la version change. Qui a déjà ouvert la démo ne les reçoit pas (les totems du 29 oct. non plus). Bumper la version.
7. **Moins graves, mais écrits par ce lot** :
   - `styles.css:13437-13445` : le dégradé de `.barre-indicateur` est toujours écrasé par le style en ligne (seul emploi `tableau-bord-apercu.js:2211`). Le retirer.
   - `js/etudiants.js:338` relit les repères pour chaque ligne (appel `:1203`), contre la règle du module (« à lire UNE fois par rendu »). Les passer une fois.
   - `sentinelle-lot-F-860`, A4 : la moitié comportementale ne peut pas échouer (tous les P à 80). Donner des P qui départagent.

## En attente de Grégoire

> **Tranché le 30 oct. à 11 h 33** (constat 3) : les repères de l'échelle des copies se lisent dans toutes les pratiques. Voir § 4 de `CONSIGNE-LOT-2026-10-30-retouches-seuils-et-niveau.md`.

3. **Sommative et spécifications : P n'a pas d'échelle** (`js/contexte-qualification.js:161-162`). Le rapport la marque « à Grégoire », le code la livre déjà. Ce n'est pas D1-D6 : c'est la règle du 27 août (`lireEchelleNoteGlobale`, la note du cours) étendue aux signaux. Pour un·e enseignant·e en sommative : P jamais jaune, pas de niveau 2 entre 60 et la maîtrise, « Difficulté émergente » inatteignable. Cinq sentinelles recalées sur elle : `audit-onglet-suivi` B2, B3, C4, F1 et `sentinelle-lot-A-737`. Sa réponse décide si elles rebasculent. Recommandation de Cowork : une seule règle pour toutes les pratiques (les repères de l'échelle des copies quand elle en porte, sinon la note de passage).

## Inscrire et continuer

4. **Un seul repère posé** (`js/contexte-qualification.js:237-266`). Seul « Suffisant à partir de » : tout P au-dessus est jaune, jusqu'à 100 %, alors que le RàI le met au niveau 1 ; non dit, non testé. Le sens du jaune sans maîtrise reviendra à Grégoire.
5. **L'échelle « du groupe » est celle du trimestre** (`:164-168`) : les copies ne sont pas filtrées par `groupeCoursId` ; second résolveur, à côté de `obtenirEchelleCommuneDesEvaluations` (`profil-etudiant-calculs.js:703`) ; `raison` n'est lu par aucun écran. Deux groupes-cours aux échelles différentes : tout P retombe à 60 %, sans message.
- `synthese-retroaction-data.js:1623`, `SEUIL_POINTS_PRIORITE = 60` (PDF des élèves, #941) : D4 l'englobe-t-il ? Question de sens, n'y pas toucher sans Grégoire.

## Commenter et oublier

- `js/interventions.js:1475` compare le score arrondi, le RàI la valeur brute (64,5 à 64,99 avec D à 65).
- `scripts/mesures-depistage/rejeu-rai.mjs:56` lit encore `obtenirSeuil('idme.*')` (TypeError sans `idme`).
- `pratique-sommative.js:507-527` garde 0,60 à 0,85, sans appelant à l'écran depuis #551 ; le message de commit « plus aucun 64, 65 ou 70 dans le code » est donc inexact.
- `reinitialiserSeuilsInterpretation` (`interpretation-config.js:186`), exportée sans appelant, antérieure au lot ; elle effacerait `idme`.

## Conforme (mesuré au commit)

Seul `setSync` touché : l'auto-guérison existante (`interpretation-config.js:159-163`), qui garde maintenant les clés hors modèle. Fonctions retirées sans appelant restant. Échappement du bilan depuis `6ffed46a`. Libellés de filtre numériques ; Aide par `textContent`. 14 fichiers `js/` modifiés, 14 jetons neufs. Recalages conformes à D1-D6 : 821a, lot-C-744, 15-oct, lot-B, 2c-bis, 2d, 541, 542, 555-d, 555-replis, 746-551, lot-5-cadrage-11, sous-onglets, 749. La sentinelle neuve charge les vrais modules et évite les plages qui coïncident.

## Non vérifié

Le rendu Safari et iPad ; le vert des suites ; sur ses données : si l'échelle de ses copies d'automne porte ses deux repères, si ses copies tombent sur une seule échelle, s'il a des seuils enregistrés (alors D1 ne change rien chez lui avant « Restaurer »).
