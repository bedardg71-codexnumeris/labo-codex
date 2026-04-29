# Plan — Désaturation localStorage (analyse et précisions)

**Date** : 27 mars 2026
**Objectif** : Ramener localStorage sous 2 Mo, éliminer les pertes de données au Cmd+Q

---

## Verdict global

Le plan est **solide et bien priorisé**. Les 3 chantiers critiques (1a, 1b, 2a) règlent effectivement les problèmes concrets. Quelques précisions et corrections ci-dessous.

---

## Phase 1a — Extraire les thumbnails

### Analyse
- **6 fichiers** consomment `thumbnailDataUrl`, pas 2 :
  - `travaux-ui.js` (24 refs) — badges fichiers dans la visionneuse, pipeline import
  - `travaux-import.js` (8 refs) — génération thumbnail à l'import
  - `modelisation.js` (4 refs) — vue modélisation
  - `travaux-preparation.js` (2 refs) — préparation images
  - `profil-etudiant.js` (1 ref) — section travaux soumis
  - `travaux-stockage.js` (1 ref) — dans `ajouterFichierTravail()`

### Précisions au plan
- **Store IDB** : utiliser le store `keyvalue` existant avec clé `thumbnail_{FT_id}` plutôt que le store `fichiers` (qui contient les blobs PDF/images). Les thumbnails sont petits (~5-15 Ko chacun) et doivent être chargés indépendamment.
- **API** : ajouter `travauxStockage.obtenirThumbnail(fichierId)` (async) et `travauxStockage.stockerThumbnail(fichierId, dataUrl)`.
- **Migration** : boucle sur tous les fichiers, pour chaque `thumbnailDataUrl` non vide → `stockerThumbnail(id, url)` puis effacer le champ. À exécuter une seule fois (flag `_migration_thumbnails_done`).
- **Chargement** : les thumbnails sont affichés dans des `<img>` — on peut utiliser un placeholder pendant le chargement async. Pattern : `src="placeholder.svg"` → `obtenirThumbnail(id).then(url => img.src = url)`.
- **Risque** : faible. Les thumbnails sont cosmétiques. Si le chargement async échoue, l'icône placeholder s'affiche.

### Estimation de gain
- 184 fichiers × ~18 Ko moyen de thumbnail base64 ≈ **3.3 Mo** récupérés
- `fichiersTravaux` passerait de 3.8 Mo à ~500 Ko → **rentre dans localStorage**

---

## Phase 1b — Flush IDB dans `beforeunload`

### Analyse
- `navigator.sendBeacon` ne sert qu'à envoyer des données réseau, **pas** à écrire en IDB. Il ne convient pas ici.
- `event.returnValue` affiche un dialogue de confirmation au départ — intrusif et non garanti sur Safari.
- Les écritures IDB sont des transactions qui survivent au `beforeunload` si elles ont été **initiées** avant l'événement. Le problème n'est pas que l'écriture est coupée, c'est que `setSync` lance l'écriture IDB en fire-and-forget (`_setIndexedDB` est async sans await dans `setSync`).

### Précision au plan
- **Meilleure approche** : dans `setSync()`, quand le quota localStorage est dépassé, stocker la promesse IDB dans un `Set` (`this._pendingWrites`). Dans `beforeunload`, si des écritures sont pendantes, retourner un `returnValue` pour tenter de laisser le temps aux transactions de finir. En parallèle, ajouter `db.flush()` (async) que le code peut appeler explicitement avant un rechargement voulu.
- **Alternative pragmatique** : puisque le pré-chargement IDB (`_prechargerDepuisIDB`) existe maintenant, le seul cas problématique est un Cmd+Q dans les ~200ms après un `setSync`. C'est rare. On peut accepter ce risque résiduel avec un warning dans la doc.

---

## Phase 1c — Nettoyer les appels directs à localStorage

### Précision
- Vérifier que ces 7 fichiers n'utilisent pas `localStorage` pour des raisons spécifiques (ex: `sessionStorage` pour l'état pipeline, ou `localStorage` pour des clés non-namespacées partagées entre trimestres).
- Les clés comme `travaux-pipeline-production` et `travaux-jeton-production` (ajoutées dans cette session) utilisent `sessionStorage` intentionnellement — elles ne doivent PAS migrer vers `db.setSync`.

---

## Phase 2a — Seuil IDB-first

### Analyse
- Bon choix. Le seuil de 200 Ko est raisonnable.
- **Précision** : `_estimateSize(value)` existe déjà dans `db.js`. L'appeler AVANT `_setLocalStorage` pour sauter localStorage si > seuil. Ça élimine l'overhead du try/catch QuotaExceeded.
- **Impact** : aucun changement de comportement pour le code appelant. `getSync()` retourne les mêmes données (depuis memoryCache au lieu de localStorage).

---

## Phase 2b — Source de vérité

### Analyse
- Juste une clarification documentaire. Pas de changement de code.
- Résumé : **petites clés** = localStorage (synchrone, rapide), **grosses clés** = IDB + memoryCache (seul endroit viable).

---

## Phase 2c — Éliminer la double synchronisation

### Analyse
- `_prechargerDepuisIDB()` (notre fix) et `syncToLocalStorageCache()` font effectivement un travail redondant.
- `syncToLocalStorageCache()` est plus complète : elle lit TOUTES les clés IDB et tente de les écrire dans localStorage.
- `_prechargerDepuisIDB()` ne charge que les clés ABSENTES de localStorage.
- **Précision** : fusionner les deux dans `syncToLocalStorageCache()` en ajoutant le fallback memoryCache (qui est déjà là aux lignes 634-641). Puis supprimer `_prechargerDepuisIDB()`.
- **Attention au timing** : `_prechargerDepuisIDB()` s'exécute dans `_initIndexedDB()` (synchrone au démarrage). `syncToLocalStorageCache()` s'exécute plus tard. Il faut s'assurer que le pré-chargement arrive assez tôt pour que les premiers `getSync()` trouvent les données.

---

## Phase 2d — Audit `evaluationsSauvegardees`

### Analyse
- 6.3 Ko/évaluation est raisonnable. Les champs volumineux sont `retroactionFinale` (texte libre, ~200-500 caractères) et `criteres[]` (4-5 objets).
- `donneesAlgorithmiques` est vide pour la plupart des évaluations (seulement utilisé pour le français écrit algorithmique).
- **Verdict** : pas de compression facile. Le seuil IDB-first (2a) est la bonne solution.

---

## Phase 3a — Diagnostic storage

### Précision
- `window._storageStats` est compatible avec la règle "pas de console.log" du projet.
- Ajouter aussi dans le rapport de bug (`rapport-bug.js`) une section "État stockage" avec taille localStorage et nombre de clés en memoryCache.

---

## Phase 3b — Notification quota

### Précision
- Utiliser `afficherNotificationErreur()` existante, une seule fois par session (pas à chaque `setSync`).
- Flag `_quotaAlertShown` pour éviter le spam.

---

## Phase 3c — Test de résistance

### Précision
- Peut être basé sur le pack démo existant (`js/pack-demo-20.js`) en le multipliant.
- Tester spécifiquement : rechargement après import massif, cohérence `getSync` vs IDB, temps de `syncToLocalStorageCache`.

---

## Ordre de priorité confirmé

| Priorité | Chantier | Effort | Impact |
|----------|----------|--------|--------|
| 1 | 1a — Thumbnails | Moyen (2-3h) | Élimine 3.3 Mo |
| 2 | 2a — Seuil IDB-first | Faible (30min) | Architecture propre |
| 3 | 1b — Flush beforeunload | Faible (30min) | Sécurité données |
| 4 | 2c — Fusionner syncs | Faible (30min) | Simplification |
| 5 | 1c — Nettoyer localStorage | Faible (1h) | Hygiène |
| 6 | 3b — Notification quota | Faible (15min) | UX |
| 7 | 2b — Documentation | Trivial | Clarté |
| 8 | 2d — Audit évaluations | Investigation | Optionnel |
| 9 | 3a — Diagnostic | Faible (30min) | Debug |
| 10 | 3c — Test résistance | Moyen (1-2h) | Filet sécurité |
