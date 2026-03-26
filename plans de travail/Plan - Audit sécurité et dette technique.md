# Plan d'audit — Sécurité et dette technique
> **Horodatage** : 26 mars 2026, 16h30 (Toronto)
> **Version** : Beta 98.9 (Build 2503-1135)
> **Prérequis** : Phases 5-6 terminées (~933 handlers inline migrés, CSP `script-src 'self'` active)

## Contexte
Cet audit croise le plan Cowork (6 axes) avec l'exploration technique (3 agents, ~180k lignes analysées). Objectif : zéro dette technique, architecture solide et pérenne.

---

## Phase 1 — Corrections immédiates (code)

### Lot A — Sécurité des imports (~45 min)
**Fichiers** : `js/import-export.js`, `js/travaux-import.js`, `js/codex.js`

Créer une **fonction centralisée `validerZipSecurite(zip)`** (dans import-export.js ou un utilitaire) qui encapsule les 3 contrôles. Tout futur import ZIP passera par cette fonction.

- **A1** : Vérification taille décompressée (sommer les entrées, rejeter si > 2 Go)
- **A2** : Magic bytes images/PDF (PNG `89504E47`, PDF `25504446`, JPEG `FFD8FF`)
- **A3** : Rejet entrées ZIP avec `..` ou commençant par `/`

### Lot B — Gestion d'erreurs (~20 min)
**Fichiers** : `js/db.js` (3), `js/organisateur.js` (2), `js/planification-carte.js` (2), `js/travaux-import.js` (1), `js/travaux-ui.js` (1), `js/travaux-visionneuse.js` (1)

- **B1** : 7 catch vides → `console.warn('contexte: raison', ex)` + commentaire d'intention
- **B2** : db.js QuotaExceeded → notification utilisateur visible (pas juste console)

### Lot C — Fuites mémoire (~15 min)
**Fichiers** : `js/rapport-bug.js`, `js/travaux-visionneuse.js`

- **C1** : Ajouter `URL.revokeObjectURL()` manquants (2 cas identifiés)

### Lot D1 — XSS innerHTML : corrections confirmées (~15 min)
**Fichier** : `js/boite-outils.js`

6 vulnérabilités identifiées (lignes 297, 307, 329, 701, 730, 748) : noms d'étudiants et texte de questions injectés sans `echapperHtml()`. Correction directe.

### Lot D2 — XSS innerHTML : triage fichiers exposés (temps variable)
**Fichiers** : les 9 fichiers les plus exposés — `cartouches.js` (58), `trimestre-v2.js` (58), `evaluation.js` (49), `travaux-ui.js` (43), `productions.js` (39), `profil-etudiant.js` (37), `echelles.js` (30), `grilles.js` (28), `pratiques.js` (24)

Pour chaque fichier : distinguer HTML statique (OK) / données utilisateur non échappées (à corriger) / cas ambigus (à discuter). Livrable = liste triée, pas « tout corrigé ».

---

## Phase 2 — Audit lecture seule

### Lot E-arch — Décisions architecturales (à discuter ensemble, ~30 min)
**Produit** : constats + recommandations, nécessite aval avant action.

- **E1** : Écritures async `setSync()` — risque réel de perte à la fermeture onglet. Évaluer `beforeunload` flush vs. acceptation documentée.
- **E2** : Cohérence cache dual `syncToLocalStorageCache()` — cas de désynchronisation localStorage ↔ IndexedDB.

### Lot E-fact — Vérifications factuelles (~15 min)
**Produit** : réponses oui/non.

- **E3** : Double-stringify (db.js:193-207) encore nécessaire avec le code actuel, ou vestige retirable?
- **E4** : Codex — manifeste validé? Auto-save FSAPI crash-safe (écriture atomique ou corruptible)? Path traversal dans ZIP?

### Lot F — Architecture SSoT + intégrité (~40 min pour F1, ~15 min F2-F3)

- **F1** : Indices A-C-P-E — vérifier qu'ils ne sont jamais recalculés en dehors de leurs modules sources. Croiser `indices.js`, `profil-etudiant.js`, `tableau-bord-apercu.js`, `graphiques-progression.js`, `evaluation.js`. **30-40 min.**
- **F2** : Fichiers protégés intacts (config.js, navigation.js, noms_stables.json)
- **F3** : Données démo filtrées à l'export (groupe 9999, Primo Primavera)

---

## Phase 3 — Garde-fous pérennes

### Lot H — Règles de non-régression
Ajouter à `CLAUDE.md` :

1. **Règle innerHTML** : « Tout `innerHTML` avec des données utilisateur (noms, texte libre, imports) DOIT utiliser `echapperHtml()`. Pas d'exception. »
2. **Règle console.log** : « Nouveau code = `console.warn`/`console.error` uniquement. Les `console.log` de debug doivent être retirés avant commit. »
3. **Règle imports** : « Tout import ZIP passe par `validerZipSecurite(zip)`. »

### Lot G — Nettoyage console.log (optionnel, ~60 min)
2781 occurrences dans 102 fichiers. Si fait, supprimer les `console.log` de debug en gardant `console.warn`/`console.error` intentionnels.

---

## Vérification finale

- Import ZIP normal + ZIP bombe (taille décompressée > 2 Go)
- Import image valide + fichier renommé .jpg (magic bytes invalides)
- **Test résilience setSync** : écrire via `setSync()`, fermer l'onglet immédiatement (DevTools > kill), rouvrir, vérifier si la donnée a survécu dans IndexedDB
- Console navigateur : 0 erreur CSP
- Navigation complète : accueil → réglages → évaluations → travaux → profil → export
