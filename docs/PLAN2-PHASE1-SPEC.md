# Plan 2 Phase 1 — Spécification d'implémentation

**Statut** : spec livrée le 24 avril 2026, prête à coder.
**Dépend de** : Plan 1 Autonomisation (complet). Hooks dans `docs/HOOKS-PLAN2.md`.
**Plan source** : `plans de travail/PLAN-PARTAGE-RESSOURCES.md`.
**Objectif Phase 1** : format de package `.codex-share.zip` + validation stricte, **sans UI**. Tests manuels via console.

Les Phases 2 à 8 sont cadrées dans `PLAN-PARTAGE-RESSOURCES.md` §8. Ce document détaille uniquement la Phase 1 pour la rendre prête à implémenter.

---

## 1. Périmètre Phase 1

Livrer :
- Un **module de sérialisation** (`js/partage-format.js`) qui produit le contenu d'un package partageable depuis les données internes Labo Codex.
- Un **module de validation** (`js/partage-validation.js`) qui vérifie l'intégrité d'un package reçu avant toute intégration.
- Des **schémas JSON fermés** pour chaque type d'entité (grille, échelle, cartouche, production, pratique).
- La **constante `labo-codex-partage-v1`** comme version de format.
- Des **tests manuels via console** (`window._testPartagePhase1()`) qui vérifient les 14 critères d'acceptation.

Ne livre PAS (à faire en Phase 2+) :
- UI d'export (modale de confirmation, bouton « Exporter pour partager »)
- UI d'import (file picker, modale de prévisualisation)
- Génération effective du ZIP téléchargeable (réservé à Phase 2 avec JSZip)
- Pipeline de merge dans le namespace `partage_*`

---

## 2. Architecture

### 2.1 Nouveaux fichiers

| Fichier | Rôle | Taille estimée |
|---|---|---|
| `js/partage-format.js` | `construirePackage(itemsRacine, options)` sérialise vers un objet conforme `labo-codex-partage-v1` | ~200 l. |
| `js/partage-validation.js` | `validerPackage(pkgObj)` applique les 6 niveaux de contrôle, retourne `{valide, erreurs, preview}` | ~300 l. |
| `js/partage-schemas.js` | Schémas fermés par type d'entité (structure attendue, champs obligatoires, limites) | ~150 l. |

### 2.2 Modules existants réutilisés

- `js/bibliotheque-ui.js` — `estItemDemo`, `forgerInspireDe`, `formaterAttribution`.
- `js/cc-license.js` — `obtenirIdentiteCCUtilisateur` (pour l'export).
- `js/import-export.js` — `validerZipSecurite`, `validerMagicBytes` (Phase 2 lorsqu'on manipulera le ZIP réel ; Phase 1 traite uniquement les objets JSON).

### 2.3 Dépendances à ajouter dans `index.html`

```html
<script src="js/partage-schemas.js?v=YYYYMMDDNN"></script>
<script src="js/partage-format.js?v=YYYYMMDDNN"></script>
<script src="js/partage-validation.js?v=YYYYMMDDNN"></script>
```

Placer après `cc-license.js` et `bibliotheque-ui.js`, avant `import-export.js`.

---

## 3. Format `labo-codex-partage-v1`

### 3.1 Structure de haut niveau

```json
{
    "format": "labo-codex-partage-v1",
    "manifest": { ... },
    "entites": {
        "grilles": [ { ... } ],
        "echelles": [ { ... } ],
        "cartouches": [ { ... } ],
        "productions": [ { ... } ],
        "pratiques": [ { ... } ]
    },
    "references": [ { ... } ],
    "medias": [ { ... } ]
}
```

- `format` : littéralement `"labo-codex-partage-v1"` (constante). Rejet si différent.
- `manifest` : métadonnées CC + auteur. Schéma §3.2.
- `entites` : dictionnaire par type. Seuls les types listés en §3.3 sont acceptés.
- `references` : graphe des liens entre entités (ex. grille → échelle). Schéma §3.4.
- `medias` : catalogue des fichiers binaires (images, PDFs) associés aux productions. Vide en Phase 1 (Phase 2 gèrera les médias).

### 3.2 Schéma `manifest`

```json
{
    "licence": "CC BY-NC-SA 4.0",
    "licence_url": "https://creativecommons.org/licenses/by-nc-sa/4.0/",
    "dateExport": "2026-04-21T10:30:00Z",
    "auteur": {
        "nom": "Grégoire Bédard",
        "courriel": "gregoire@example.org",
        "institution": "Cégep de Drummondville",
        "discipline": "Littérature"
    },
    "item_principal": {
        "type": "grille",
        "id": "GRILLE1759243306842"
    },
    "chaineAttribution": [
        { "niveau": 0, "auteur": "Labo Codex", "nomItem": "Grille d'analyse littéraire" }
    ]
}
```

**Champs obligatoires** : `licence`, `dateExport`, `auteur.nom`, `item_principal.type`, `item_principal.id`.
**Champs optionnels** : `auteur.courriel`, `auteur.institution`, `auteur.discipline`, `chaineAttribution`.

**Contraintes** :
- `licence` DOIT être exactement `"CC BY-NC-SA 4.0"` (constante).
- `auteur.nom` ne peut pas valoir `"Demo Labo Codex"` (chaîne technique réservée, rejet brutal).
- `auteur.nom` max 200 car.
- `dateExport` format ISO 8601.

### 3.3 Schémas des entités (résumé — détail dans `partage-schemas.js`)

| Type | Champs obligatoires | Limites |
|---|---|---|
| grille | `id`, `nom`, `criteres[]` | nom ≤ 200, max 50 critères |
| echelle | `id`, `nom`, `niveaux[]` | nom ≤ 200, max 10 niveaux |
| cartouche | `id`, `grilleId`, `niveau`, `descripteurs[]` | max 10 descripteurs |
| production | `id`, `titre`, `grilleId` | titre ≤ 200, description ≤ 2000 |
| pratique | `id`, `nom`, `configuration` | nom ≤ 200 |

Pour chaque entité, les **champs interdits** sont : `isDemo`, `estDemo`, `auteur` (écrasé par manifest), `_internal*` (tout champ commençant par `_`).

### 3.4 Schéma `references`

```json
{
    "depuis": { "type": "grille", "id": "GRILLE_XXX" },
    "vers": { "type": "echelle", "id": "ECHELLE_YYY" },
    "nature": "utilise"
}
```

`nature` ∈ `["utilise", "reprend", "derive_de"]`.

Les références doivent être **cohérentes** : tous les IDs référencés doivent exister dans `entites` du même package. Sinon rejet.

---

## 4. Validation — les 6 niveaux

### Niveau 1 — Structure de haut niveau

- Objet non null, clés attendues (`format`, `manifest`, `entites`), pas de clés extra.
- `format === "labo-codex-partage-v1"`.
- **Échec = rejet avec erreur `FORMAT_INVALIDE`**.

### Niveau 2 — Manifest

- Respect du schéma §3.2.
- `licence === "CC BY-NC-SA 4.0"`.
- `auteur.nom !== "Demo Labo Codex"`.
- `dateExport` parsable en `Date` valide.
- `item_principal.type` ∈ types autorisés.
- `item_principal.id` existe dans `entites`.
- **Échec = rejet avec erreur `MANIFEST_INVALIDE` + détail**.

### Niveau 3 — Schéma fermé par entité

Pour chaque type présent dans `entites` :
- Tous les items respectent le schéma (champs obligatoires présents, types corrects, limites respectées).
- **Aucun champ non listé dans le schéma**. Ex. si un item grille contient `foo: "bar"`, rejet.
- Pas de champs interdits (`isDemo`, `estDemo`, `_internal*`).
- **Échec = rejet avec erreur `ENTITE_INVALIDE` + type/id + champ fautif**.

### Niveau 4 — Intégrité référentielle

- Chaque `reference.depuis.id` existe dans `entites[reference.depuis.type]`.
- Chaque `reference.vers.id` existe dans `entites[reference.vers.type]`.
- Pas de référence circulaire.
- **Échec = rejet avec erreur `REFERENCE_ORPHELINE` ou `REFERENCE_CIRCULAIRE`**.

### Niveau 5 — Sanitization

- Tout champ texte (nom, description, titre, libellé) passé par `echapperHtml()`.
- Si un champ contient du HTML brut (balises), re-échappement automatique (pas de rejet — l'affichage sera neutralisé mais l'import continue).
- Les champs `configuration` des pratiques (qui peuvent contenir des structures imbriquées) : tous les strings internes sont sanitizés récursivement.

### Niveau 6 — Attribution « Demo Labo Codex » réservée

- Toute occurrence de `"Demo Labo Codex"` dans n'importe quel champ `auteur` (manifest ou `chaineAttribution`) = rejet.
- Tout item dont `id.startsWith("demo-")` = rejet.
- Tout item dont `isDemo: true` ou `estDemo: true` était présent : le flag est retiré, pas de rejet (sanitization silencieuse).
- **Échec = rejet avec erreur `USURPATION_DEMO`**.

### Retour de `validerPackage(pkgObj)`

```js
{
    valide: false,
    erreurs: [
        { niveau: 3, code: "ENTITE_INVALIDE", type: "grille", id: "GR_123", champ: "criteres[2].ponderation", message: "Valeur 120 hors limites [0, 100]" }
    ],
    preview: null  // null si invalide
}
```

Ou en cas de succès :

```js
{
    valide: true,
    erreurs: [],
    preview: {
        nomItemPrincipal: "Grille d'argumentation",
        auteurNom: "Martin X.",
        dateExport: "2026-04-15T10:30:00Z",
        nbEntites: { grilles: 1, echelles: 3, cartouches: 4, productions: 0, pratiques: 0 },
        chaineAttribution: [...]
    }
}
```

---

## 5. API publique Phase 1

### `partageFormat.construirePackage(itemPrincipal, options)`

- **Arguments** :
  - `itemPrincipal` : objet entité (ex. une grille) pris depuis `grillesTemplates`.
  - `options` : `{ inclureDependances: true, identiteAuteur: obtenirIdentiteCCUtilisateur() }`.
- **Retourne** : objet `labo-codex-partage-v1` complet (pas un ZIP — la sérialisation ZIP est Phase 2).
- **Effet** : aucun (pas d'écriture).

### `partageValidation.validerPackage(pkgObj)`

- **Argument** : objet prétendu `labo-codex-partage-v1` (ex. parsé depuis un JSON reçu).
- **Retourne** : `{valide, erreurs, preview}` (voir §4).
- **Effet** : aucun (pas d'intégration).

### `partageSchemas.SCHEMA_ENTITE[type]`

- Exposé pour inspection et pour documentation.
- Exemple : `partageSchemas.SCHEMA_ENTITE.grille` retourne `{champsObligatoires: [...], champsInterdits: [...], limites: {...}}`.

---

## 6. Tests manuels Phase 1

Fonction `window._testPartagePhase1()` à ajouter dans `partage-validation.js` (style similaire à `_verifierPreDemo` du legacy).

Elle exécute 14 scénarios :

1. `construirePackage` d'une grille démo → résultat valide selon `validerPackage`.
2. `construirePackage` inclut bien les échelles référencées quand `inclureDependances: true`.
3. `validerPackage` rejette un objet vide.
4. Rejette un `format` différent.
5. Rejette un manifest sans `auteur.nom`.
6. Rejette un `auteur.nom === "Demo Labo Codex"`.
7. Rejette une grille avec un champ inconnu.
8. Rejette une référence orpheline.
9. Détecte une référence circulaire (grille A → grille A).
10. Accepte un item avec un flag `isDemo: true` et le **retire** silencieusement dans `preview`.
11. Sanitize un champ texte contenant du HTML brut.
12. Préserve une `chaineAttribution` multi-niveaux dans `preview`.
13. Respecte la limite de 50 critères par grille.
14. Respecte la limite de 200 caractères sur `nom`.

La fonction log une synthèse `console.warn('[Test Phase 1] X/14 tests réussis')` et retourne `true` / `false`.

---

## 7. Ordre d'implémentation recommandé

1. **`js/partage-schemas.js`** (2 h) : définir les schémas fermés par type. Pas de dépendance. Exposer `window.partageSchemas`.
2. **`js/partage-validation.js`** (3 h) : implémenter `validerPackage` avec les 6 niveaux + `_testPartagePhase1`. Dépend de schemas.
3. **`js/partage-format.js`** (2 h) : implémenter `construirePackage`. Dépend des schemas pour vérifier la conformité de sa propre sortie.
4. **Intégration `index.html`** (15 min) : 3 nouveaux `<script>`, cache-busters, ordre correct.
5. **Test manuel** : ouvrir la console, exécuter `_testPartagePhase1()`, s'assurer que 14/14 passent.

**Total estimé** : 7 h d'implémentation + 1 h de test. Découper en 3 commits :
- Commit 1 : `partage-schemas.js`
- Commit 2 : `partage-validation.js` + tests
- Commit 3 : `partage-format.js` + intégration index.html

---

## 8. Critères d'acceptation Phase 1 (sans UI)

| # | Critère | Vérification |
|---|---|---|
| 1 | Construire un package depuis une grille utilisateur et valider le résultat | `_testPartagePhase1()` test 1 |
| 2 | Rejeter un package sans `format` ou avec format incorrect | Test 3-4 |
| 3 | Rejeter un package avec auteur `Demo Labo Codex` | Test 6 |
| 4 | Rejeter un item avec champ inconnu | Test 7 |
| 5 | Rejeter une référence orpheline | Test 8 |
| 6 | Sanitizer le HTML dans les champs texte | Test 11 |
| 7 | Retirer silencieusement les flags `isDemo` | Test 10 |
| 8 | Préserver `chaineAttribution` multi-niveaux | Test 12 |
| 9 | Respecter toutes les limites de taille (critères, niveaux, texte) | Tests 13-14 |
| 10 | Tous les tests passent en < 500 ms | Performance |

Dès que ces 10 critères sont verts en console, Phase 1 est close. Phase 2 (pipeline d'export ZIP avec UI) peut démarrer.

---

## 9. Décisions à valider avec Grégoire avant de coder

- **Limite de taille du package complet** : 50 Mo ou plus strict ?
- **Médias en Phase 1** : confirme-t-on qu'on les reporte à Phase 2, ou on prévoit déjà la structure dans `entites.productions[].medias[]` ?
- **Format de `chaineAttribution`** : préserve-t-on les accents et caractères spéciaux dans les noms (oui par défaut via UTF-8), ou on normalise ?
- **Identifiants** : les IDs dans le package doivent-ils être réattribués à l'import (évite les collisions) ou conservés ? Recommandation : conserver les IDs d'origine dans le package + documenter que l'import Phase 3 les ré-attribuera.

---

Prochaine étape avant implémentation : validation des 4 points §9 par Grégoire, puis démarrage du commit 1 (`partage-schemas.js`).
