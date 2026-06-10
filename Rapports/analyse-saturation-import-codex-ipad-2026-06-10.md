# Analyse — Saturation de l'espace sur iPad à l'import d'un codex (~1 Go)

**Date** : 10 juin 2026
**Backlog** : **#334** (absorbe #295) — plan d'implémentation : `Rapports/plan-chantier-import-codex-ipad-2026-06-10.md`
**Contexte** : Bêta publique 1.7.1 (build 0610-0915). Échec rapporté pendant l'import d'un codex d'environ 1 Go sur iPad ; l'application devient inutilisable. Appareil concerné : disque presque plein.
**Méthode** : lecture du code (`js/codex.js`, `js/db.js`, `js/travaux-stockage.js`, `js/import-export.js`), aucun test sur appareil. Les numéros de lignes correspondent à l'état du dépôt au 10 juin 2026.
**Révision v2 (même jour)** : contre-audit lors de la planification. Deux corrections : `persist()`/`estimerQuota()` existent déjà (§1.2) et le comportement de `db.set` en cas de quota IDB était mal décrit (§1.3, §3a). Les passages corrigés sont marqués *(corrigé v2)*.

---

## 1. Faits établis (lecture du code)

### 1.1 Pipeline d'import entièrement en mémoire

L'import d'un codex (`chargerCodex`, `js/codex.js` ~l. 490-630) procède ainsi :

1. **Lecture intégrale du fichier** en `ArrayBuffer` via `_lireCommeArrayBuffer` (l. 651, 1683), puis `JSZip.loadAsync(buffer)` (l. 652). Le buffer (~1 Go pour le codex rapporté) reste référencé par l'objet `zip` jusqu'à la fin de l'import, car l'extraction des blobs (étape 4) en dépend.
2. **Extraction de `donnees.json`** en chaîne (`async('string')`, l. 521) puis `JSON.parse` (l. 522) : deux copies supplémentaires coexistent (chaîne + objet).
3. **Écriture clé par clé** via `db.set` (l. 538). Dans `db.js`, toute valeur > 200 Ko est écrite en IndexedDB **et** conservée dans `memoryCache`, une `Map` sans aucune politique d'éviction (l. 614-619). Les grosses clés résident donc en RAM en permanence après l'import.
4. **Extraction des blobs travaux** un par un (`async('blob')`, l. 572), validés par magic bytes, puis stockés via `travauxStockage.stockerBlob` → `db.storeBlob` en IndexedDB. La voie FSAPI (fichiers sur disque hors quota navigateur) est inactive sur Safari iPad — `showDirectoryPicker` n'existe pas sur WebKit. Les ~1 Go de blobs entrent donc dans le quota WebKit de l'origine.
5. **Snapshot de fusion 3-way** : `db.set(CLE_SNAPSHOT_AVANT, donnees)` (l. 603) restocke l'intégralité du dataset JSON comme clé unique. Cette clé dépasse nécessairement 200 Ko : elle est dupliquée en IndexedDB **et** retenue dans `memoryCache`. Duplication permanente, pas seulement au pic.

### 1.2 Garde-fous existants et leurs angles morts

- `validerZipSecurite` (`js/import-export.js` l. 21-51) vérifie path traversal et plafonne la taille décompressée à **2 Go** — un seuil pensé contre les zip bombs, pas contre les limites réelles d'un iPad. Elle calcule déjà la taille décompressée totale (l. 38-41) : l'information existe mais n'est confrontée à aucune mesure de l'espace disponible.
- `stockerBlob` plafonne chaque blob à 20 Mo (`js/travaux-stockage.js` l. 190-202) — limite unitaire, aucune limite cumulative.
- **Aucun pré-vol à l'import** *(corrigé v2)* : les briques existent pourtant déjà. `estimerQuota()` (wrapper de `navigator.storage.estimate()`, `travaux-stockage.js` l. 824-842, exporté l. 1419) est consommé par l'UI Travaux mais jamais par l'import. `navigator.storage.persist()` est appelé dans `initialiserStockageTravaux()` (l. 1349-1351), mais seulement quand l'utilisateur ouvre le module Travaux — pas au boot, pas à l'import — et son résultat est ignoré.

### 1.3 Gestion d'échec : silencieuse et incohérente

- *(corrigé v2)* Dans `db.set` (`db.js` l. 246-276), l'écriture IndexedDB (l. 253) est *awaited avant* la tentative localStorage ; le fallback `memoryCache` du catch (l. 262-267) ne couvre que le cache localStorage, la donnée étant déjà persistée en IDB. Un vrai quota IDB **rejette** la promesse : l'import avorte bruyamment (alerte générique dans `actionOuvrir`)… en laissant un état partiellement écrit, sans message expliquant quoi faire. La voie réellement volatile (`setSync` → `_trackWrite`, échec IDB = simple `console.warn`) n'est pas utilisée par l'import.
- Un échec d'écriture de blob pendant l'import est rattrapé par blob avec un simple `console.warn` « blob ignoré » (`codex.js` l. 587-589). L'import continue et se déclare réussi.
- Conséquence : sur un appareil saturé, deux scénarios — abandon brutal à mi-parcours avec données partielles et message générique, ou import « réussi » avec blobs manquants silencieux. Dans les deux cas, codex incohérent sans diagnostic utilisable pour l'utilisateur.

## 2. Bilan chiffré (inférences)

Ces ordres de grandeur sont déduits du code, non mesurés sur appareil.

**Pic RAM pendant l'import** : ArrayBuffer du ZIP (~1 Go) + structures internes JSZip + chaîne JSON + objet parsé + grosses clés accumulées dans `memoryCache`. Estimation : **2,5 à 3 Go** simultanés pour un codex de 1 Go.

**Occupation disque si l'import aboutit** : ZIP source conservé dans Fichiers (~1 Go) + blobs en IndexedDB (~1 Go) + données JSON en IndexedDB en double (clés individuelles + snapshot `CLE_SNAPSHOT_AVANT`). Soit **plus de 2 Go ajoutés** à l'occupation de l'appareil pour importer un codex de 1 Go.

## 3. Diagnostic

Deux mécanismes se superposent ; sur l'appareil rapporté (disque presque plein), les deux sont plausibles simultanément.

**a) Quota WebKit dynamique.** Safari calcule le quota de stockage d'une origine en proportion de l'espace disque *libre*. Disque presque plein → quota minuscule → `QuotaExceededError` dès les premières écritures. *(corrigé v2)* Selon la phase atteinte : abandon brutal pendant l'écriture des clés JSON (état partiel, message générique), ou « blobs ignorés » silencieux pendant la phase fichiers (import déclaré réussi, travaux absents). Dans les deux cas l'app paraît cassée sans diagnostic.

**b) Pic mémoire.** 2,5-3 Go dépassent vraisemblablement ce que iPadOS tolère pour un processus WebContent ; jetsam recharge l'onglet en plein import, laissant un état à moitié écrit.

**Incertitudes signalées** : les seuils exacts (formule de quota WebKit, limite jetsam sur iPad Air M1) ne sont pas documentés publiquement avec précision et varient selon les versions d'iPadOS. Un relevé de `navigator.storage.estimate()` sur l'appareil du testeur permettrait de départager la part quota de la part mémoire. Le scénario a) est cohérent avec le symptôme rapporté (échec pendant l'import, disque presque plein) ; le scénario b) deviendrait dominant sur un appareil au disque sain.

## 4. Pistes de correction

Par ordre d'impact estimé sur le cas rapporté :

| # | Chantier | Effort | Traite |
|---|----------|--------|--------|
| 1 | **Pré-vol stockage** : `navigator.storage.estimate()` + taille décompressée (déjà calculée par `validerZipSecurite`) avant toute écriture ; refus avec message actionnable (« libérez X Go ») ; demande de `navigator.storage.persist()` | Faible | Quota (cas rapporté) |
| 2 | **Éliminer la double rétention** : ne plus stocker `CLE_SNAPSHOT_AVANT` en intégral (hash ou compression), purger `memoryCache` des grosses clés après écriture IndexedDB réussie | Faible-moyen | Quota + RAM résidente |
| 3 | **Import journalisé** : compter les blobs ignorés et les écritures tombées en fallback, afficher un bilan honnête, au mieux rollback en cas d'échec partiel | Moyen | Incohérence silencieuse |
| 4 | **Décompression en flux** : lire les entrées ZIP une par une via `Blob.slice` + `DecompressionStream('deflate-raw')` (natif Safari 16.4+, conforme à la contrainte zéro-dépendance), en remplacement de JSZip côté import | Élevé | Pic RAM (gros codex, disque sain) |
| 5 | **Côté produit** : avertir que le ZIP source reste dans Fichiers après import et suggérer sa suppression | Trivial | Occupation réelle ×2 |

Remarques d'arbitrage :

- Les pistes 1-3 suffisent vraisemblablement pour le cas rapporté et transforment un échec silencieux en refus explicite — gain immédiat pour les testeurs.
- La piste 4 est le seul traitement de fond du pic mémoire ; elle implique de retirer JSZip du chemin d'import (principe zéro-dette : remplacer, pas empiler). L'export resterait sur JSZip dans un premier temps, ce qui crée une asymétrie temporaire à documenter.
- La piste 2 touche `CLE_SNAPSHOT_AVANT`, utilisé par la fusion 3-way : auditer les call-sites avant de changer le format (cf. règle d'audit des régressions latentes, CLAUDE.md).

## 5. Données à recueillir auprès du testeur

1. `navigator.storage.estimate()` exécuté dans la console de l'app sur l'iPad concerné (quota et usage réels).
2. Espace libre exact de l'appareil (Réglages → Général → Stockage iPad).
3. Comportement observé : onglet rechargé pendant l'import (indice mémoire) vs import « terminé » mais app incohérente (indice quota).
