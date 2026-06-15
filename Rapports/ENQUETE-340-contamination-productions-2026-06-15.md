# Enquête #340 — Contamination de `productions` au changement de trimestre

**Date** : 15 juin 2026
**Statut** : enquête de fond livrée + garde-fou actif posé (décision Grégoire)
**Incident terrain** : 12 juin 2026 (réparé en console le jour même, ~12h40)

---

## 1. Rappel du symptôme

Séquence déclenchante (Grégoire, 12 juin) : session dans le trimestre **archivé A25**
avec « Permission d'écriture » (~04h-06h, saisie dans une évaluation) → quitter A25,
revenir à **H2026** → hard refresh (~11h30). Résultat : `h2026_productions` contenait
les **11 productions d'A25** (`coursId COURS1766455789356`) dans **les deux couches**
(localStorage ET IndexedDB), à la place des 10 artefacts sains
(`coursId h2026-601-101-MQ-00001`). Cascade : profil « Aucune production configurée »,
`indicesCP non disponible`, note finale `null` pour les 51 étudiant·es.

Contamination **limitée** à `h2026_productions` (balayage `h2026_*` = 1 clé).

---

## 2. Mécanisme structurel confirmé (lecture du code)

`getCleProductions()` retourne `cle('productions')`, et `cle()` se résout
**dynamiquement** selon le trimestre actif courant (`trimestres[].actif`).
`changerTrimestreActif` (`js/trimestres.js:362`) bascule ce flag de façon
**synchrone et immédiate** ; il ne *flush* aucune écriture pendante et n'annule
aucun timer avant la bascule.

Conséquence : tout **read-modify-write asynchrone** de la forme

```js
const arr = await db.get(getCleProductions());  // lu sous A25
// … await … (le trimestre bascule vers H26 ici)
await db.set(getCleProductions(), arr);          // écrit sous H26 → CONTAMINATION
```

écrit le tableau périmé (lu sous l'ancien namespace) sous le **nouveau**
namespace si le trimestre bascule pendant la fenêtre `await`.

`db.set`/`db.setSync` écrivent IDB **et** localStorage : une seule écriture
fautive explique la corruption des deux couches.

---

## 3. Audit des écrivains de `productions` (corrigé)

⚠️ Correction d'un contre-sens fréquent : la **fenêtre de course n'existe
qu'entre le `get` et le `set`**. Les `await` situés *après* le `set` (rafraîchis-
sement d'UI) ne participent pas à la corruption.

| Fichier:ligne | Fonction | `await` ENTRE get et set ? | Verdict |
|---|---|---|---|
| productions.js:1148→1151 | `supprimerProduction` (résidu) | non (filter sync) | SÛR |
| productions.js:1181→1192 | `verrouillerEvaluation` | non | SÛR |
| productions.js:1231→1236 | `monterEvaluation` | non | SÛR |
| productions.js:1264→1269 | `descendreEvaluation` | non | SÛR |
| productions.js:1902→1913 | `migrerProductionsVersBibliotheque` | micro-fenêtre du `db.get` seul | quasi-sûr |
| productions.js:2205→2211 | `window.supprimerProduction` | non | SÛR |
| **productions-bibliotheque-ui.js:242→268** | **`ajouterProductionIndividuelle`** | **OUI (`await obtenirToutesLesProductionsBibliotheque()` l.247)** | **VULNÉRABLE** |
| productions-bibliotheque-ui.js:511→520 | `retirerProductionDeBibliotheque` | non | SÛR |
| productions-bibliotheque-ui.js:538→550 | `supprimerProductionDefinitivement` | non | SÛR |
| productions-bibliotheque-ui.js:588→621 | `dupliquerProductionBibliotheque` | non | SÛR |
| productions-bibliotheque-ui.js:642→668 | `ajouterProductionsABibliotheque` | non | SÛR |
| productions-liste.js:35→43 | `dupliquerEtEditerProduction` | non + **déjà capture-once** | SÛR |
| productions-liste.js:~→319 | `dupliquerProduction` | non | SÛR |
| productions-liste.js:364→367 | `supprimerProductionActive` | non | SÛR |
| productions-import-export.js:239→263 | `importerProductionModifiee` | non | SÛR |
| productions-import-export.js:600→619 | `sauvegarderMigrationCategories` | non | SÛR |
| migrations.js:930→942 | `migrerDescriptionVersActivite` | non (synchrone) | SÛR |

**Conclusions de l'audit** :

1. Un seul écrivain présente une vraie fenêtre de course intra-fonction :
   `ajouterProductionIndividuelle`. **Corrigé** par capture-once (clé lue une
   seule fois, réutilisée pour le `set`).
2. **Aucun cache global** de productions en mémoire (pas de `window.productions`,
   pas de variable module-level). La corruption vient donc d'une **écriture au
   mauvais namespace**, pas d'un cache périmé.
3. **Le chemin de sauvegarde d'évaluation n'écrit jamais `productions`**
   (`_autoSauvegarderCriteres` n'écrit que `evaluationsSauvegardees`,
   `evaluation-chargement.js:1347`). Le scénario terrain (« saisie dans une
   éval » → quitter) **n'est donc PAS expliqué** par un écrivain `productions`
   intra-fonction connu.

**Verdict honnête** : l'écrivain fautif exact du terrain **n'est pas prouvable
par analyse statique seule**. Hypothèses résiduelles à départager par
instrumentation runtime : (a) une réécriture déclenchée par la cascade de
`changerTrimestreActifV2` / `rafraichirVuesApresCours` ; (b) une interaction
avec le **quota localStorage saturé** (découvert pendant la réparation : une
écriture de 12 Ko a été refusée par quota et basculée en memoryCache+IDB) ;
(c) un écrivain hors `js/` (console, import) au mauvais moment.

---

## 4. Décision et correctif livré (15 juin 2026)

**Décision Grégoire** : garde-fou **actif** + détecteur (et non simple diagnostic).

### 4.1 Garde-fou au point de persistance (le vrai fix, indépendant de l'écrivain)

- `js/db.js` : registre générique de **gardes d'écriture** par clé de base
  (`enregistrerGardeEcriture`, `_ecritureAutorisee`). `set` (async) et `setSync`
  consultent la garde **avant toute persistance** (localStorage, memoryCache, IDB)
  et **abandonnent silencieusement** l'écriture si elle est refusée — la donnée
  saine est ainsi **préservée** —, en journalisant la **pile d'appel du fautif**.
- `js/productions-namespace-garde.js` (nouveau module, domaine-agnostique côté db) :
  garde métier pour `productions`. Résout `coursId → trimestreId` via la collection
  **globale** `cours` et **bloque** une écriture de `<T>_productions` dont le
  contenu appartient à un autre trimestre.

**Anti-faux-positifs** (l'ajout d'un item de bibliothèque inter-trimestres peut
conserver un `coursId` étranger) : on ne bloque que la **signature de la
corruption** — un tableau qui ne contient **aucune** production native du
trimestre cible mais des productions étrangères, soit **≥ 2** étrangères, soit
en **remplacement** d'un tableau qui contenait du natif. L'ajout d'**un seul**
item étranger, ou la présence d'au moins un item natif, reste autorisé.

### 4.2 Capture-once

`ajouterProductionIndividuelle` (`productions-bibliotheque-ui.js`) capture
`getCleProductions()` une seule fois (lecture **et** écriture sous la même clé) :
la seule vraie vulnérabilité intra-fonction est fermée.

### 4.3 Sentinelle

`tests/unit/sentinelle-namespace-productions-340.test.js` (11 cas, **break-testée**) :
signature exacte du terrain bloquée, dump 100 % étranger bloqué, écritures
légitimes (natif, ajout biblio, démo sans `coursId`, cours inconnu) autorisées,
+ ratchet statique du câblage `db.js`.

---

## 5. Effet attendu sur le terrain

- La corruption #340 **ne peut plus se persister** : à l'instant où un écrivain
  (quel qu'il soit) tente d'écrire les productions A25 sous `h2026_productions`,
  la garde **refuse** et **journalise sa pile** → on **prouvera** enfin l'écrivain
  fautif au prochain déclenchement, sans perdre de données.
- Le quota localStorage saturé du Mac (condition aggravante) reste à traiter au
  titre de #334 (le Mac est concerné, pas seulement l'iPad).

## 6. Suites

- Confirmation terrain : reproduire la séquence A25→H26 et vérifier qu'aucune
  contamination ne survient + relever la pile d'appel si la garde se déclenche.
- Étendre le patron de garde à d'autres collections namespacées sensibles
  (`evaluationsSauvegardees`, `groupeEtudiants`) si l'instrumentation révèle le
  même mécanisme ailleurs.
- Optionnel : faire de la garde une assertion `console.error` *et* un toast
  utilisateur discret si elle se déclenche en production (à arbitrer).
