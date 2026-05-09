# Rapport `/ultrareview` — Lot 4a (Évaluation cœur)

**PR auditée** : [#6](https://github.com/bedardg71-codexnumeris/Monitorage_v6/pull/6) — branche `review/lot-4a-evaluation`
**Date** : 1er mai 2026
**Lignes auditées** : ~11 060 sur 3 modules (`evaluation.js`, `liste-evaluations.js`, `evaluation-jetons.js`)
**Statut du run** : ⚠️ Phase **Déduplication crashée** (à 19:39:35). Les 11 findings vérifiés ci-dessous sont valides — récupérés depuis la web UI avant que la session soit archivée.

**Pipeline observé** :
- ✅ Configuration
- ✅ Rechercher — 37 candidats
- ✅ Vérifier — **11 confirmés · 26 réfutés** (taux de réfutation 70 %, signe d'audit rigoureux)
- ❌ Déduplication — 11 problèmes (crash)

**Observation clé** : tous les findings concernent **`js/evaluation-jetons.js`** (832 lignes). Aucun finding sur `evaluation.js` ni `liste-evaluations.js` — soit ces modules sont propres, soit la phase Rechercher s'est concentrée sur le système de jetons.

---

## 11 findings confirmés

### 🔴 Normal — bugs avec impact data (8)

| # | Fichier:ligne | Description |
|---|---|---|
| N1 | `js/evaluation-jetons.js:678` | `appliquerJetonRepriseCiblee` n'enforce pas le quota de jetons |
| N2 | `js/evaluation-jetons.js:317` | Reprise hérite des flags `jetonDelaiApplique` de l'originale → double-comptage |
| N3 | `js/evaluation-jetons.js:419` | `retirerJetonReprise` : branche « garder reprise » laisse `remplaceeParId` orphelin sur l'originale |
| N4 | `js/evaluation-jetons.js:692` | `appliquerJetonRepriseCiblee` bypasse `obtenirConfigJetons` et casse le format v2 |
| N5 | `js/evaluation-jetons.js:324` | `appliquerJetonReprise` ne nettoie pas `remplaceeParId` / `archivee` / `dateArchivage` de l'originale |
| N6 | `js/evaluation-jetons.js:549` | `obtenirStatutJetonsEtudiant` performs side-effect write on read |
| N7 | `js/evaluation-jetons.js:616` | Opérations jetons custom utilisent `db.setSync` directement, bypassant `sauvegarderDonneesSelonMode` (SSOT) |
| N8 | `js/evaluation-jetons.js:330` | `appliquerJetonReprise` : si `archiverOriginale=false`, `repriseDeId` pointe vers ID supprimé |

### 🟠 Élevé — défense en profondeur / cohérence (3)

| # | Fichier:ligne | Description |
|---|---|---|
| H1 | `js/evaluation-jetons.js:530` | `obtenirTousTypesJetons` lit une clé inexistante `config.nombreParEleve` |
| H2 | `js/evaluation-jetons.js:430` | Notification de succès affichée **avant** save dans `retirerJetonReprise` (l'utilisateur croit avoir sauvé même si l'écriture échoue) |
| H3 | `js/evaluation-jetons.js:602` | `attribuerJetonPersonnalise` écrit dans le mauvais store pour les jetons prédéfinis |

---

## Patterns récurrents identifiés

L'audit révèle 4 axes de fragilité dans `evaluation-jetons.js` :

1. **Symétrie cassée originale ↔ reprise** (N3, N5, N8) — cleanup incomplet ou inversé. Quand on archive/garde/retire, certains champs (`remplaceeParId`, `archivee`, `dateArchivage`, `repriseDeId`) ne sont pas mis à jour de façon symétrique sur les deux entités.

2. **Bypass de la config canonique** (N4, H1) — la logique ne consulte pas `obtenirConfigJetons` ou lit des clés inexistantes. Suggère que le module a évolué sans mettre à jour ses lecteurs.

3. **Validation manquante** (N1, H2) — quota non enforcé sur reprise ciblée, notification de succès avant confirmation d'écriture.

4. **Violation SSOT** (N6, N7, H3) — écritures dans le mauvais store, side effects dans des fonctions `obtenir*`, bypass de la couche `sauvegarderDonneesSelonMode`.

---

## Plan de remédiation suggéré

| Phase | Findings | Effort estimé | Stratégie |
|---|---|---|---|
| 1 — Symétrie | N3, N5, N8 | 1h30 | Centraliser un helper `transitionEvaluation(originale, reprise, mode)` qui gère les 3 modes (archiver / garder / retirer) avec setters atomiques |
| 2 — Validation | N1, H2 | 45min | `appliquerJetonRepriseCiblee` : ajouter le check du quota comme dans `appliquerJetonReprise`. `retirerJetonReprise` : await save avant notification |
| 3 — Config canonique | N4, H1 | 30min | Faire passer `appliquerJetonRepriseCiblee` par `obtenirConfigJetons`. Corriger le nom de clé dans `obtenirTousTypesJetons` |
| 4 — SSOT | N6, N7, H3 | 1h30 | Remplacer `db.setSync` par `sauvegarderDonneesSelonMode`. Supprimer le side effect dans `obtenirStatutJetonsEtudiant` (le calculer à la lecture, sauvegarder dans un autre flux) |

**Effort total** : ~4 heures pour Lot 4a.

---

## Notes méthodologiques

- **Pipeline crashé à `Déduplication`** : les 11 findings sont vérifiés (les 26 réfutés ont déjà été écartés). Pas de tri manuel à faire ici, contrairement au Lot 3.
- **Distribution sur un seul fichier** (`evaluation-jetons.js`) : suggère que ce module a une dette technique concentrée — typiquement un module qui a évolué par accumulation sans refactoring.
- **Les 26 réfutés** sont parfois des doublons des 11 confirmés (mêmes lignes, descriptions différentes) — la dédup aurait probablement fusionné certains. Acceptable en l'état.
