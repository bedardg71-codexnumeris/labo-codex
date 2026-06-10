# Plan de chantier — Import codex sur iPad : pré-vol, rétention, journalisation

**Date** : 10 juin 2026
**Référence** : `Rapports/analyse-saturation-import-codex-ipad-2026-06-10.md` (diagnostic, révisé v2)
**Périmètre retenu** : pistes 1-2-3-5 du rapport. La piste 4 (décompression en flux, retrait de JSZip à l'import) est **explicitement hors périmètre** — le pic RAM transitoire de JSZip (~2,5-3 Go pour un codex de 1 Go) subsistera après ce chantier.
**Lien backlog** : item **#334** (créé 10 juin 2026) ; la session A livre et ferme **#295** (seuils de stockage à l'import), absorbé par #334.

---

## 0. Découvertes d'audit ayant orienté la conception

Ces points corrigent ou précisent le rapport initial (intégrés dans sa révision v2) :

- **D1** — `navigator.storage.persist()` est déjà appelé (`travaux-stockage.js` l. 1349-1351) mais seulement à l'ouverture du module Travaux, résultat ignoré. `estimerQuota()` existe et est exporté (l. 824-842, 1419). Le pré-vol doit **réutiliser** cet existant, pas le dupliquer.
- **D2** — Dans `db.set`, l'écriture IDB est awaited avant le cache localStorage : un quota IDB rejette la promesse et l'import avorte bruyamment. Le fallback `memoryCache` ne concerne que le cache synchrone (donnée déjà persistée). Il n'y a donc rien à « remonter au caller » côté `db.set` ; le travail de la piste 3 porte sur les blobs ignorés et le message d'abandon.
- **D3** — Purge généralisée du `memoryCache` **inapplicable** : 608 call-sites `getSync` dans 60 fichiers ; les grosses clés (`evaluationsSauvegardees`, `fichiersTravaux`…) sont lues synchroniquement partout et `getSync` ne peut pas relire IDB. `memoryCache` est par conception le tiers synchrone des grosses clés. Seule clé purgeable sans risque : `_codex_snapshot_avant` (lectures exclusivement async, `codex.js` l. 2324 et 2485).
- **D4** — La fusion 3-way (`_analyserFusion`, l. 1064-1156) n'utilise jamais les **valeurs** de l'ancêtre : uniquement présence de clé et comparaisons `JSON.stringify(...) !== jsonAncetre`. Un **index de hachés** `{clé: sha256(json)}` remplace donc le dataset intégral à sémantique strictement identique — quelques Ko au lieu de plusieurs Mo, et la duplication RAM disparaît avec (la clé repasse sous le seuil 200 Ko).
- **D5** — `syncToLocalStorageCache` recharge le snapshot intégral en `memoryCache` à chaque boot (db.js l. 602-622) : la duplication RAM était permanente, pas seulement post-import. Réglé par D4.
- **D6** — Angle mort : si `entry._data.uncompressedSize` est absent (signalé dans MODELE-MENACES.md l. 722), `validerZipSecurite` somme 0 → le pré-vol croirait le codex gratuit. Fallback nécessaire.
- **D7** — Décision rollback : **non**. Un rollback exigerait de retenir les valeurs antérieures de toutes les clés — exactement la double rétention que la piste 2 élimine. Filets réels : le ZIP source dans Fichiers + le codex précédent. Compromis : échec dur en phase données (noyau cohérent obligatoire), tolérance journalisée en phase blobs (indépendants, ré-import comblera).

---

## Session A — Pré-vol stockage + avertissement ZIP (pistes 1 et 5)

**À livrer en premier : règle le cas rapporté.** Shippable seule.

### A.1 `js/import-export.js` (l. 21-57)
- `validerZipSecurite` retourne `{valide, erreur, tailleDecompressee}`. Les 5 callers audités (codex.js l. 659, 732 ; import-export.js l. 892 ; reserve-ouvrir.js l. 88 ; codex-data.js l. 168) ne lisent que `.valide`/`.erreur` → ajout non cassant.
- Test : étendre `tests/unit/validation-zip.test.js` (champ présent, somme correcte, 0 quand `_data` absent).

### A.2 `js/codex.js` — `validerCodex` (l. 640-710)
- Propager `validation._tailleDecompressee` (convention des champs internes `_zip`, `_manifeste`).

### A.3 `js/codex.js` — pré-vol dans `chargerCodex` (après l. 498-501, avant l'étape 2)
- Fonction **pure** testable : `evaluerPrevolStockage(tailleDecompressee, tailleZip, estimation)` → `{verdict: 'ok'|'refus'|'inconnu', besoin, disponible, manque}`.
- **Marge : facteur 1,5 + plancher de 100 Mo libres post-import.** Justification : double écriture JSON tant que la session C n'est pas livrée ; enrobage structured-clone/SQLite WebKit (~10-20 %) ; `estimate()` arrondi volontairement par WebKit ; coussin de fonctionnement. Conserver 1,5 même après C (fragmentation), documenté.
- **Fallback D6** : si `tailleDecompressee === 0` → besoin estimé `fichierZip.size × 3` (blobs quasi incompressibles, JSON ~×5 ; ×3 = borne conservatrice), avec « environ » dans le message.
- **`estimate()` absent** → verdict `'inconnu'`, non bloquant, `console.warn` ; la session B sert de filet. Si `quota < 500 Mo` (heuristique navigation privée) : ajouter « Si tu navigues en privé, rouvre l'app dans une fenêtre normale. »
- **`persist()`** : ne pas dupliquer l'appel du module Travaux. Dans le pré-vol : `navigator.storage.persisted()`, et si non persistant, `persist()` juste avant l'import (geste utilisateur frais = meilleures chances d'octroi, et c'est le moment où ça compte). Refus → `console.warn`.
- **Refus** : `_masquerProgression()` + `throw new Error(message)` — `actionOuvrir` (l. 2138-2141) affiche déjà `e.message`. Message quoi/pourquoi/quoi faire :
  > « Espace insuffisant pour ouvrir ce codex. Il a besoin d'environ {X}, mais Safari n'accorde que {Y} à l'application parce que l'appareil est presque plein. Libère environ {Z} (Réglages → Général → Stockage iPad), puis réessaie. Astuce : les anciens ZIP de codex dans Fichiers prennent beaucoup de place. »
  > Z = manque × 2 : le quota WebKit est une *fraction* de l'espace libre ; libérer 1 Go ne rend pas 1 Go de quota. Rester sur « environ ».

### A.4 Piste 5 — `actionOuvrir` (l. 2128-2137)
- Enrichir le `confirm` post-succès : « Codex chargé. Le fichier ZIP d'origine ({taille}) reste dans Fichiers — tu peux le supprimer pour récupérer de l'espace. Recharger la page pour appliquer les données ? ». Texte brut dans `confirm`/`alert` → pas d'`echapperHtml` requis.

### Tests et validation A
- Vitest : `tests/unit/sentinelle-prevol-stockage-2026-06.test.js` (cas ok/refus/inconnu/taille 0/plancher) + extension `validation-zip.test.js`. Module sensible touché → `cd tests && npm test`.
- **Mac** : import normal inchangé ; refus forcé via stub `navigator.storage.estimate` en console.
- **iPad** : cas réel — l'appareil saturé doit **refuser avec message** ; un petit codex doit passer.
- **Version** : `node scripts/release.mjs minor`. Fermer #295.

---

## Session B — Import journalisé (piste 3)

Shippable seule ; après A (le pré-vol réduit les cas que B rapporte).

### B.1 `js/codex.js` — `chargerCodex`
- Boucle blobs (l. 566-599) : compteurs `blobsRefusesMagic`, `blobsEchecs` `[{id, raison}]` (distinguer `QuotaExceededError`), `blobsAbsentsDuZip` ; `nbBlobsAttendus = fichiers.length`.
- Boucle données (l. 526-548) : try/catch ciblé sur `db.set` ; sur quota → `throw` enrichi : « L'espace s'est rempli pendant l'import ({i}/{n} clés écrites). Les données sont partielles : libère de l'espace puis rouvre ton codex (le ZIP est toujours dans Fichiers). »
- Fin (l. 616-623) : `stats.incomplet` ; libellé « Import terminé — incomplet » au lieu de « Codex chargé ! » si échecs.
- `actionOuvrir` : si incomplet → `notifications.warning` (`utils-notifications.js` l. 118) + bilan : combien de fichiers manquent, pourquoi, quoi faire (« libère de l'espace puis rouvre le même ZIP : l'import réécrit tout et complétera les fichiers manquants »).
- À vérifier en implémentation : marquer `blobStatut` des entrées `fichiersTravaux` en échec (mécanisme existant, cf. `migrerBlobStatut`, travaux-stockage.js l. 1354) pour que la visionneuse affiche l'état manquant.

### B.2 `js/travaux-stockage.js` — anti-spam notifications
- `stockerBlob` émet `notifications.erreur` par blob (l. 197, 221) → avalanche en import massif raté. Ajouter `options = {notifier: true}` ; `chargerCodex` passe `false` et journalise lui-même. Auditer les autres callers (`travaux-import.js`, `_fusionnerTravaux`) — défaut `true`, comportement inchangé.

### Tests et validation B
- Vitest sur fonction pure `construireBilanImport(stats)`.
- **Mac** : codex avec un blob aux magic bytes corrompus → bilan le déclare.
- **iPad** : import passant le pré-vol de justesse → bilan honnête.
- **Version** : minor.

---

## Session C — Snapshot 3-way en index haché (piste 2a)

**Le cœur du chantier, isolé dans sa propre session.** Indépendante de A/B.

### Call-sites audités (exhaustif : `CLE_SNAPSHOT_AVANT` + littéraux `_codex_snapshot_avant`, `_classeur_snapshot_avant`)
Écritures : l. 346 (`genererCodex`), 603 (`chargerCodex`). Lectures **async uniquement** : l. 2324, 2485. Suppression : l. 844 (`fermerCodex`). Migration de nom : l. 106-127 (générique, compatible tout format). Aucun `getSync`, aucune autre référence js/tests.

### C.1 `js/codex.js` uniquement
- `_indexerSnapshot(donnees)` async → `{__format: 'codex-snapshot-hash-v1', cles: {cle: sha256hex(JSON.stringify(valeur))}}` (exclure les clés `_*`, comme l'actuel l. 1085). Réutiliser un utilitaire SHA-256 existant si présent (`js/signature.js`, `cc-license.js`), sinon helper local sur `crypto.subtle.digest`.
- l. 346 et 603 : écrire l'index au lieu du dataset → la clé tombe à quelques Ko, localStorage normal, plus jamais `memoryCache`. **Aucune modification de db.js pour 2a.**
- Lecture via `_lireSnapshotAvant()` : ancien format (objet sans `__format`) → conversion à la volée par `_indexerSnapshot`. Migration de données tolérée par CLAUDE.md ; pas un alias de compat (l'ancien format n'est plus jamais écrit).
- `_analyserFusion` : 3e paramètre = l'index ; `jsonAncetre` → `hashAncetre`, comparaisons `sha256(jsonLocal) !== hashAncetre`. Devient async (ses deux callers le sont déjà). Logique de branchement (l. 1101-1152) inchangée.
- Migration one-shot au boot (à côté de `_migrerClesClasseurVersCodex`, l. 86) : convertir un gros snapshot legacy en IDB — sinon un utilisateur qui n'enregistre jamais garde la duplication.

### Risques (nommés franchement)
La fusion 3-way est la fonctionnalité la plus sensible du module. Faux positifs/négatifs de hash ⇒ faux conflits ou détections manquées. Mitigations : (1) le code actuel repose déjà sur l'égalité `JSON.stringify` — le hash en est l'image fidèle ; (2) suite Vitest dédiée sur `_analyserFusion` couvrant chaque branche (ajout local/externe, modif/modif, suppression/modif, ancêtre legacy, ancêtre absent → diff 2 parties) avec résultats identiques à l'ancien algorithme sur jeu synthétique ; (3) `crypto.subtle` requiert un contexte sécurisé (https/localhost) — vérifier le cas `file://` si applicable.

### Validation C
- **Mac** : scénario fusion complet avant/après + comparaison (#243).
- **iPad** : scénario allégé + console : `window._storageStats.memoryCache.nbCles` diminue au boot ; `(await db.get('_codex_snapshot_avant')).__format` présent.
- **Version** : minor (format interne local ; le format ZIP du codex est inchangé — pas un major).

---

## Session D — Politique memoryCache + harmonisation db.set (piste 2b)

Après C. Livrable principal : **la décision documentée** (D3 : pas d'éviction générale possible).

### D.1 `js/db.js`
- `set()` (l. 246-276) : harmoniser avec `setSync` — si `_estimateSize(value) > SEUIL_IDB_FIRST`, ne pas tenter localStorage (éviter le throw systématique), aller droit à `memoryCache.set` + `removeItem`. Comportement observable identique, chemin plus propre.
- Extraire la constante `SEUIL_IDB_FIRST` dupliquée (l. 589 et 961) en constante unique (zéro-dette : retirer les deux littéraux).
- **Pas d'éviction LRU** : `getSync` ne peut pas réhydrater depuis IDB. Règle à consigner dans `docs/DATA-OWNERSHIP.md` : « toute purge memoryCache doit prouver qu'aucun getSync ne lit la clé ».

### D.2 Documentation
- `docs/DATA-OWNERSHIP.md` : format `codex-snapshot-hash-v1`, règle memoryCache.
- `js/changelog-data.js` : entrée consolidée (couleur bleu) : « Import de codex : vérification d'espace avant l'ouverture, bilan honnête en cas d'import incomplet, rappel du ZIP source ».
- Fermer #295 dans `BACKLOG.md` (si pas déjà fait en session A).

### Tests et validation D
- Playwright `tests/integration/` : clé > 200 Ko via `db.set` → absente de localStorage, lisible par `getSync` et par `db.get` après reload.
- **Mac/iPad** : smoke test général ; sur iPad, session de travail normale post-import sans rechargements intempestifs.
- **Version** : patch (interne).

---

## Ordre de livraison

| Ordre | Session | Dépend de | Shippable seule | Traite |
|-------|---------|-----------|-----------------|--------|
| 1 | A — pré-vol + ZIP | — | Oui | Cas rapporté (quota, disque plein) |
| 2 | B — journal | A (de préférence) | Oui | Échecs silencieux |
| 3 | C — snapshot haché | — | Oui (session isolée) | Duplication IDB + RAM |
| 4 | D — memoryCache + doc | C | Oui | Hygiène + décision documentée |

**Hors de portée assumé** : le pic RAM transitoire de JSZip (piste 4). Même avec quota sain, un import géant peut encore déclencher jetsam sur iPad. À rappeler dans les bilans de session pour ne pas survendre le chantier.

**Données testeur à recueillir en parallèle** (valident le diagnostic sans bloquer) : `navigator.storage.estimate()` sur l'appareil, espace libre exact, onglet rechargé vs import « terminé » incohérent.
