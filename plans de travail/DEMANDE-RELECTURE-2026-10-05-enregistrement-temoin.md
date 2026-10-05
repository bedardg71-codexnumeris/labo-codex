# Demande de relecture – chantier de l'enregistrement, lot 1 : le témoin dit vrai et se voit (#962, #986)

> Claude Code, 5 octobre 2026, ≈ 12 h 40 (Toronto). Branche `claude/enregistrement-temoin`, un commit sur `main` à `521ae21f`. **Ni poussée ni publiée** (consigne de Cowork de 12 h 01, point 5).

## 1 · Ce qui change à l'écran

- **#962** : quand une écriture dans IndexedDB échoue après coup (mémoire pleine, transaction avortée, connexion perdue), le témoin dit « Non enregistré » et reste affiché. Avant, il disait « Enregistré » et la donnée se perdait au rechargement. Pour une grosse clé (évaluations, fichiers de travaux), « Enregistré » n'apparaît qu'après le commit.
- **#986** : sur l'iPad, le témoin remonte au-dessus du clavier à l'écran, et suit le clavier quand il s'ouvre ou se ferme. Rien ne change sur le Mac, même avec un zoom au pincement.

## 2 · Ce que j'ai mesuré avant de coder

| Mesure | Résultat |
|---|---|
| Échec provoqué au banc | Trois voies : connexion fermée par `db.db.close()` (la vraie, `transaction()` lève `InvalidStateError`), quota (`_setIndexedDB` doublé, rejet `QuotaExceededError`), transaction avortée (connexion simulée au banc Vitest). |
| Témoin avant le lot, connexion fermée, grosse clé (sonde WebKit) | « Enregistré » affiché, aucun échec visible ; seul un `console.warn`. **Confirme la fiche.** |
| Gestes qui écrivent une grosse clé | `evaluationsSauvegardees` (dix sites dans `evaluation.js` et `evaluation-chargement.js`, dont l'enregistrement automatique), `fichiersTravaux` (`travaux-stockage.js`, `migration-diagnostic.js`), tous par `sauvegarderDonneesSelonMode` ou `db.setSync`. |
| Délai du commit (WebKit de bureau, valeur de la forme des évaluations) | 0,1 Mo : 1 ms · 1 Mo : 1 ms · 5 Mo : 1 ms · 20 Mo : 4 ms (la sérialisation de `setSync` coûte, elle, 27 ms à 20 Mo). **Bien sous la seconde.** L'iPad sera plus lent ; je ne peux pas le mesurer d'ici (porte terrain, rangée 3). |
| Petite clé (mesure qui **élargit** la décision 1) | Au démarrage, `syncToLocalStorageCache` réécrit localStorage avec la valeur d'IndexedDB : un échec IndexedDB sur une petite clé se perd **aussi** au rechargement. Le signal d'échec vaut donc pour toutes les clés ; seul le report de « Enregistré » est réservé aux grosses. |

## 3 · Les décisions techniques, et ce que j'ai supposé

1. **`db.js`** : `_trackWrite` garde, par clé, le commit attendu de la dernière écriture synchrone (`db.commitEnAttente(cle)` → `{ commit, grosse }`), et dit tout échec à un abonné unique, `db.surEchecEcriture` (même forme que `surEcriture`, #447 : `db.js` émet, `modes.js` s'abonne).
2. **`modes.js`** : un point unique, `_annoncerEnregistre`, sert les trois écrivains annonceurs (`sauvegarderDonneesSelonMode`, `modifierEtAnnoncer`, `ecrireEtAnnoncer`) :
   - grosse clé → « Enregistré » au commit ;
   - petite clé qui porte le « Non enregistré » affiché → idem (une écriture suivante ne l'efface pas avant SON commit) ;
   - autre petite clé → « Enregistré » tout de suite, **comme avant** ;
   - commit échoué → « Non enregistré – ‹geste› : ‹raison› ».
   L'abonné de `db` dit aussi l'échec (sans geste) pour les écritures directes et discrètes : il passe en premier, le texte avec le geste le remplace ensuite (ordre des réactions d'une même promesse, garanti).
3. **L'événement du codex** (`donnees-enregistrees`) part tout de suite, comme avant, même quand « Enregistré » attend : la donnée a changé dans l'application.
4. **`modifierEtAnnoncer`** passe par `db.set`, qui attend déjà le commit : rien ne change pour lui.
5. **#986** : `bottom: calc(16px + var(--temoin-hauteur-clavier))`, la variable posée depuis `innerHeight − visualViewport.height − offsetTop`, recalculée à chaque `resize`/`scroll` du `visualViewport` et à chaque affichage. Échelle ≠ 1 (zoom) → 0.
6. **Durée de 2 s gardée.** Le témoin suit le clavier en direct, donc le mouvement du clavier ne raccourcit pas le temps où il est visible. Je ne peux pas mesurer d'ici si 2 s suffisent sur l'iPad réel : c'est la rangée 2 de la porte.

**Supposé** : « reste affiché » vaut aussi pour un échec d'une écriture que l'usager n'a pas faite (une écriture discrète, une migration). Un échec ne se tait jamais, et `sauvegarderDonneesSelonMode` le disait déjà ainsi pour les échecs synchrones.

## 4 · Les tests

- **Vitest** `tests/unit/sentinelle-962-echec-idb-se-dit.test.js` (11 essais) : `db.js` RÉEL sur une connexion simulée (avortement, connexion fermée, commit, dernière écriture), et `modes.js` RÉEL (grosse clé avant et après commit, échec avec geste, petite clé après un échec, petite clé seule, abonné, `ecrireEtAnnoncer`).
- **WebKit** `tests/integration/temoin-enregistrement-962-986.spec.js` (7 essais, **35/35 sur cinq répétitions**) : connexion réellement fermée sur une grosse clé (« Non enregistré » avec le geste, toujours là après 2,6 s) ; quota puis écriture retenue (aucun « Enregistré » avant la libération du commit, l'échec reste, puis « Enregistré » et l'échec part) ; petite clé immédiate ; à 820 × 1180, clavier simulé de 400 px (le témoin à 16 px du bas de la zone visible), clavier qui s'ouvre puis se ferme pendant un « Non enregistré », zoom ×2 sur le Mac.
- **Mutations** (neuf, toutes rouges, chaque rouge lu sur l'essai qui la vise) : signal de `db` retiré (Vitest) ; échec du commit muet dans `modes` (Vitest + WebKit) ; abonné muet (Vitest) ; « Enregistré » avant le commit d'une grosse clé (Vitest + WebKit) ; petite clé qui efface l'échec avant son commit (Vitest seul : au navigateur, la seconde écriture est grosse) ; CSS sans la variable, calcul à 0, écouteur `resize` retiré (WebKit) ; zoom pris pour un clavier (WebKit).
- **Vitest complet** et **bancs WebKit voisins du témoin** (lots A, B, C, D, E1-E3, G, #1012) : voir le § 7.

Défaut corrigé en chemin dans MON banc : la doublure de `visualViewport` posait ses accesseurs par `Object.assign`, qui les lit une seule fois au lieu de les recopier, et `ouvrirVide` fermait la connexion pendant le démarrage (`pageerror` intermittents). Corrigés avant les mutations définitives.

## 5 · Trouvailles en chemin

- **#1029 inscrit** (issue 2) : une connexion IndexedDB perdue n'est jamais rouverte (`db.js` n'a ni `onclose` ni réouverture). Désormais l'usager voit « Non enregistré » à chaque écriture jusqu'au rechargement, ce qui est honnête, mais ne répare rien.
- **Non inscrit** : un échec de **suppression** IndexedDB d'arrière-plan (`removeSync`) reste un `console.warn`. La fiche et la décision portent sur l'écriture, et le témoin n'annonce pas les suppressions. À trancher par Cowork si on l'ajoute au chantier.
- **Mesuré, rien à faire** : un seul `db.set` est lancé sans attendre son résultat (`travaux-stockage.js:734`, vignette), et il a son `.catch`.

## 6 · Les mots, pour Grégoire

**Aucun texte nouveau ni changé.** L'échec réutilise les raisons existantes du lot B : « Non enregistré : le navigateur a refusé l'écriture. » et « Non enregistré : la mémoire du navigateur est pleine. Pour libérer de la place : … », précédées du geste quand l'écrivain le donne (« Non enregistré – Verrouillage de l'évaluation : … »).

## 7 · Vérifications

- Vitest complet (depuis `tests/`) : **683 fichiers, 8216 essais verts** (un rouge en route, corrigé : la sentinelle #595 des variables CSS fantômes voyait `--temoin-hauteur-clavier` sans déclaration CSS ; déclarée sur `.temoin-enregistrement`).
- Bancs WebKit du témoin et voisins (962-986, lot B, présences lot D, anonymisation lot A, verrouiller lot C, codex lot G, E1, E2, E3, #1012) : **92 essais verts, aucun instable**, en 13,2 min.
- **Suite Playwright complète : non lancée** (≈ 45 min). Elle est due avant le push, au trajet de livraison.

## 8 · Porte terrain (iPad), à publier par Cowork

| # | Geste | Attendu |
|---|---|---|
| 1 | Présences ou évaluation : toucher un champ texte pour ouvrir le clavier, saisir, laisser l'enregistrement se faire. | « Enregistré » visible **au-dessus du clavier**, en bas à gauche. |
| 2 | Même geste, regarder « Enregistré » pendant qu'il s'affiche. | Lisible assez longtemps (2 s). Si c'est trop court, le dire. |
| 3 | Évaluer une copie (grosse clé) avec enregistrement automatique. | « Enregistré » paraît sans délai perceptible. |
| 4 | Fermer le clavier pendant qu'un message est affiché. | Le message redescend en bas à gauche. |
| 5 | Sur le Mac, n'importe quelle saisie. | Rien n'a changé : en bas à gauche, à 16 px du bord. |
