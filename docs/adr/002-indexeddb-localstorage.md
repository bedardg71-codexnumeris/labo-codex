# ADR-002 : Stockage hybride IndexedDB + localStorage

**Statut** : Acté rétroactivement
**Date de décision originale** : octobre-novembre 2025 (formalisation : 14 mai 2026)
**Auteur** : Grégoire Bédard

---

## Contexte

L'application doit persister :
- Configurations utilisateur (préférences, grilles, échelles, cartouches) — petites clés (~kilo-octets).
- Listes d'étudiants, présences, évaluations — moyennes à grandes (~centaines de kilo-octets à plusieurs méga-octets).
- Fichiers de travaux étudiants importés (PDF, images, vignettes) — potentiellement plusieurs centaines de méga-octets.

Le mode 100 % hors-ligne (cf. ADR-003) interdit le recours à un serveur ou à un service de stockage distant. Les seules options navigateur disponibles sont `localStorage` (~5-10 Mo selon le navigateur, API synchrone) et `IndexedDB` (quota beaucoup plus large, plusieurs Go selon le navigateur, API asynchrone).

`localStorage` est plus simple à utiliser mais quota dur et bloque le main thread. `IndexedDB` lève le quota mais oblige à un code asynchrone partout. Aucun module synchrone du code historique n'avait été conçu pour de l'async.

---

## Décision

**Architecture hybride implémentée dans `js/db.js`** :

- **Petites clés (< 200 Ko)** : stockées dans `localStorage`. Source de vérité, accès synchrone (`db.getSync`, `db.setSync`).
- **Grandes clés (> quota localStorage)** : stockées dans IndexedDB + cache mémoire (`memoryCache`). Source de vérité IDB, accès synchrone via le cache mémoire.
- **Préchargement au démarrage** : `_prechargerDepuisIDB()` hydrate `memoryCache` avec les clés IDB connues avant que l'app commence à lire.
- **Synchronisation localStorage ← IDB** : `syncToLocalStorageCache()` fait suivre IDB → localStorage quand le quota le permet, sinon retombe sur `memoryCache` uniquement.

Les **clés critiques en quota** (`h2026_fichiersTravaux` ~3,8 Mo, `h2026_evaluationsSauvegardees` ~1,2 Mo en Safari `file://`) sont toujours servies depuis IDB.

---

## Conséquences

### Positives

- **API d'application reste synchrone** (`db.getSync`, `db.setSync`) — pas de propagation `await` partout.
- **Quota effectif déplafonné** : on peut stocker des centaines de Mo de travaux étudiants sans casser.
- **Cache localStorage opportuniste** : lectures rapides en synchrone tant que le quota n'est pas atteint.
- **Fallback gracieux** : si localStorage sature (Safari `file://` notamment), le memoryCache prend le relais sans interrompre l'utilisateur.

### Négatives

- **Complexité du module `db.js`** : trois sources possibles (localStorage / IDB / memoryCache) à synchroniser. Bugs subtils possibles si une écriture passe outre l'API et tape directement `localStorage.setItem`.
- **Mémoire vive** : le `memoryCache` peut atteindre plusieurs Mo, surtout sur iPad. À surveiller.
- **Démarrage** : `_prechargerDepuisIDB()` ajoute un délai au boot — typiquement 100-500 ms selon le volume.
- **Aucun mécanisme de transaction** entre localStorage et IDB : un crash entre `localStorage.setItem` et `idb.put` peut produire une divergence (rare en pratique, à monitorer).

### Neutres

- **Quota IDB Safari iPad** : varie selon la version iOS et l'usage. Pas de garantie ferme — d'où la stratégie de fallback sur memoryCache.
- **Format des clés** : `cle('nom')` produit un nom préfixé par le trimestre (cf. ADR-011 namespacing). `db.js` est trimestre-agnostique.

---

## Alternatives considérées

### Option A : localStorage seul

Aurait été le plus simple. **Écartée** quand `h2026_fichiersTravaux` a dépassé 1 Mo en mars 2026 — Safari `file://` plafonne à ~5 Mo et bloque toute écriture ultérieure sans avertissement clair.

### Option B : IndexedDB seul, API asynchrone partout

Aurait été le plus propre du point de vue contrats. **Écartée** parce qu'elle aurait demandé une réécriture massive de tous les modules synchrones existants (`grilles.js`, `productions.js`, `pratiques-*.js`), pour un gain marginal en pratique.

### Option C : OPFS (Origin Private File System)

Stockage de fichiers binaires en API moderne. **Écartée** en 2025 parce que le support Safari `file://` était insuffisant et que le mainteneur n'avait pas la bande passante d'absorber une API supplémentaire.

---

## Références

- `js/db.js` (en-tête de fichier — historique des transitions).
- `CLAUDE.md` §"Stockage" — déclaration officielle.
- `docs/DATA-OWNERSHIP.md` — registre des clés et leurs propriétaires.
- `plans de travail/Plan - Désaturation localStorage (analyse).md` — chantier futur d'extraction des vignettes.

---

## Notes de révision

À réviser si :
- Le quota IDB Safari iPad devient stable et permettrait de simplifier en « IDB seul ».
- OPFS atteint une maturité de support cross-browser permettant d'extraire les vignettes hors de `db.js`.

---

**Source du format** : Michael Nygard, *Documenting Architecture Decisions* (2011).
