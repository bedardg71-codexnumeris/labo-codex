# Rapport `/ultrareview` — Lot 1 (Frontière E/S et sécurité)

**PR auditée** : [#3](https://github.com/bedardg71-codexnumeris/Monitorage_v6/pull/3) — branche `review/lot-1-securite`
**Date** : 29 avril 2026
**Lignes auditées** : 11 900 sur 7 modules (`db.js`, `codex.js`, `import-export.js`, `reserve.js`, `reserve-ouvrir.js`, `travaux-import.js`, `travaux-stockage.js`)
**Statut du run** : Phase de **déduplication crashée** côté Anthropic. Les 20 findings vérifiés ci-dessous sont valides — récupérés depuis la web UI avant expiration de la session.

**Pipeline observé** :
- ✅ Configuration
- ✅ Rechercher — 26 candidats
- ✅ Vérifier — 20 confirmés · 6 réfutés
- ❌ Déduplication — crash à 10:52:02

**Action Anthropic recommandée** : ouvrir un ticket support pour récupérer le run gratuit consommé (output partiel uniquement, pas de rapport propre généré).

---

## 🔴 Critiques — XSS et bypass d'échappement (4)

| # | Fichier:ligne | Description | Règle violée |
|---|---|---|---|
| C1 | `js/codex.js:1830` | XSS via `codex name` dans `_actualiserMenu` (innerHTML non échappé) | SKILL_Securite §9.1.1 |
| C2 | `js/travaux-stockage.js:783` | `chargerThumbnailsConteneur` injecte une URL brute dans innerHTML — XSS via code importé | SKILL_Securite §9.1.1 |
| C3 | `js/reserve-ouvrir.js:415` | Champs non échappés dans la liste des versements (innerHTML) | SKILL_Securite §9.1.1 |
| C4 | `js/travaux-import.js:55` | `validerMagicBytes` retourne `true` sur erreur de lecture — défait le check de sécurité | SKILL_Securite §9.1.4 |

## 🔴 Critiques — Validation de fichiers contournée (4)

| # | Fichier:ligne | Description | Règle violée |
|---|---|---|---|
| C5 | `js/codex.js:470` | `chargerCodex` stocke des blobs sans appeler `validerMagicBytes` | SKILL_Securite §9.1.4 |
| C6 | `js/travaux-import.js:1067` | `reimporterFichier` skip `validerMagicBytes` (incohérence sécuritaire avec import normal) | SKILL_Securite §9.1.4 |
| C7 | `js/codex.js:617` | `lireManifeste` skip `validerZipSecurite` sur API publique | SKILL_Securite §9.1.3 |
| C8 | `js/codex.js:595` | `validerCodex` skip schema validation sur `donnees.json` | SKILL_Securite §9.1.2 |

## 🔴 Critiques — Perte de données silencieuse (3)

| # | Fichier:ligne | Description | Impact |
|---|---|---|---|
| C9 | `js/codex.js:1175` | Auto-save efface `modificationsDepuis` AVANT que l'écriture FSAPI réussisse | Perte des modifs si écriture échoue |
| C10 | `js/travaux-stockage.js:190` | `stockerBlob` échoue silencieusement si blob > 20 Mo, métadonnées orphelines | Production marquée enregistrée mais blob absent |
| C11 | `js/db.js:1081` | `_migrerMonitorageFichiers` perd des données sur migration partielle | Migration legacy non atomique |

---

## 🟠 Élevés — Intégrité, signatures, identité (5)

| # | Fichier:ligne | Description | Règle violée |
|---|---|---|---|
| H1 | `js/reserve.js:970` | `meta.json` manque le hash SHA-256 de `donnees.json` | SKILL_Securite §4.3 + §9.2.7 |
| H2 | `js/travaux-import.js:35` | Signature WebP impossible à valider (slice 8 octets, mauvais offset) | SKILL_Securite §9.1.4 |
| H3 | `js/travaux-import.js:51` | Signature HEIC trop permissive — accepte tout ISO BMFF (MP4 inclus) | SKILL_Securite §9.1.4 |
| H4 | `js/codex.js:1511` | `_fusionnerTravaux` utilise substring-matching sur `f.id` — peut faussement inclure d'autres fichiers | Intégrité données |
| H5 | `js/codex.js:299` | `cleFT.find()` ne capture qu'un trimestre — blobs des autres trimestres ignorés | Intégrité multi-trimestres |

---

## 🟡 Moyens (4)

| # | Fichier:ligne | Description |
|---|---|---|
| M1 | `js/reserve-ouvrir.js:710` | Marqueurs internes `_refGrille` / `_refEchelle` persistés en bibliothèque après réimport |
| M2 | `js/codex.js:2068` | `actionRenommer` appelle `_marquerModification` (typo / undefined) |
| M3 | `js/codex.js:305` | Extension blob fallback utilise tout le nom de fichier quand pas de point |
| M4 | `js/reserve.js:510` | `_collecterDonnees` progress callback ne se déclenche que pour clés inconnues |

---

## ⚪ Réfutés par les agents (6 — pour traçabilité)

Ces candidats ont été identifiés à la phase Rechercher mais réfutés à la phase Vérifier — pas de correctif requis :

- `js/codex.js:2070` — actionRenommer calls undefined _marquerModification (ReferenceError)
- `js/codex.js:449` — chargerCodex strips all _-prefixed keys, asymmetric with genererCodex export
- `js/codex.js:250` — Codex export filters _codex_* but import filters _* (round-trip data loss)
- `js/codex.js:2070` — actionRenommer() throws ReferenceError on _marquerModification
- `js/codex.js:2068` — actionRenommer() throws ReferenceError on undefined _marquerModification
- `js/codex.js:297` — Multi-trimester codex export/import only exports/restores ONE trimester's blobs

---

## Plan de remédiation suggéré

**Lot remediation 1 — XSS** (C1, C2, C3) : audit innerHTML + ajout systématique `echapperHtml()` aux 3 sites identifiés. Tester avec une grille importée contenant `<script>` dans le nom.

**Lot remediation 2 — Validation fichiers** (C4, C5, C6, C7, C8, H2, H3) : refonte de `validerMagicBytes` (return false sur erreur, fix WebP, durcir HEIC) + audit appelants pour s'assurer qu'aucune voie d'import ne contourne la validation.

**Lot remediation 3 — Perte de données** (C9, C10, C11) : transactionnalité — état effacé seulement après confirmation d'écriture, surfacer les erreurs `> 20 Mo`, migration atomique avec rollback.

**Lot remediation 4 — Intégrité Réserve** (H1, H4, H5, M1) : ajouter `donnees_json_sha256` à `meta.json`, corriger substring-matching, fix multi-trimestres dans `cleFT.find()`, nettoyer marqueurs internes au réimport.

**Lot remediation 5 — Petits bugs** (M2, M3, M4) : fix typo `_marquerModification`, robustifier extension blob, corriger callback progress.

---

## Notes méthodologiques

- Les findings sont structurés autour des règles 9.1-9.4 du `SKILL_Securite_donnees.md` — l'audit valide que le skill est bien instancié dans le code.
- Plusieurs findings (C5-C8, H2-H3) confirment que la frontière de sécurité décrite dans le skill a des trous concrets — le skill devra être mis à jour si certains contournements sont conscients (ex. réimport interne vs import externe).
- Les 6 réfutés concernent tous `js/codex.js` et plusieurs sont des doublons mal détectés par la phase Rechercher — c'est précisément ce que la phase Déduplication aurait nettoyé si elle n'avait pas planté.
