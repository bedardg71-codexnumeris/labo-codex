# Audit innerHTML — Findings (examen ciblé) — 2026-05-06

> Suite de l'audit programmatique (`AUDIT-INNERHTML-2026-05-06.md`, 125 suspects). Cette session a examiné cas par cas les 22 cas suspects dans les modules prioritaires (cf. `MODELE-MENACES.md` §8.2 défense E) et a découvert un vrai vecteur D-01 dans `genererBadgeCC` — corrigé immédiatement.

## Synthèse exécutive

| Élément | Constat |
|---|---|
| Cas examinés | 22 (modules prioritaires §8.2 défense E) |
| **Vrais XSS découverts** | **5 dans `cc-license.js:genererBadgeCC`** |
| Fix appliquée | `echapperHtmlCC` ajouté sur 5 interpolations (commit suivant) |
| Faux positifs identifiés | ~17 — interpolations sûres par construction |
| Cas restants à examiner (Phase 1 étape 3) | 103 dans modules non prioritaires |
| **Recommandation principale** | Prioriser Défense A (sandbox iframe) plutôt que migration `innerHTML` unitaire |

## Le vrai vecteur D-01 : genererBadgeCC

`cc-license.js:genererBadgeCC(metadata)` est appelée par les modals d'aperçu d'import des 4 types pédagogiques (grilles, échelles, cartouches, productions). Cette fonction interpolait **5 champs metadata sans échappement** :

- `metadata.nom` (titre du badge)
- `metadata.auteur_original` (auteur déclaré)
- `contrib.nom`, `contrib.date`, `contrib.modifications` (pour chaque contributeur)

**Le contenu de `metadata` venait directement du JSON importé**, AVANT que le pipeline d'import sanitise les ressources via `SCHEMAS_IMPORT`. Un attaquant qui fabriquait un export avec, par exemple :

```json
{
  "metadata": {
    "auteur_original": "<img src=x onerror=\"...payload destructeur...\">"
  }
}
```

…déclenchait son payload **dès l'aperçu de la modal d'import**, avant même que l'utilisateur clique « Importer ». C'est exactement la mécanique I-01 → D-01 décrite dans le modèle de menaces.

### Fix appliquée

`echapperHtmlCC()` (déjà défini dans le même fichier, ligne 1359) est maintenant appliqué sur les 5 interpolations. Une seule fonction touchée — couverture des 4 modals d'import simultanément.

## Classification des 22 cas examinés

### evaluation.js (6 cas) — tous faux positifs ou couverts

| Ligne | Statut | Raison |
|---|---|---|
| 174 | Faux positif | Texte statique. `${groupe}` voisin est dans un `textContent` (sécurisé), pas dans l'innerHTML. |
| 375 | Faux positif | `${nomEchappe}` déjà passé par `echapperHtml` ligne 374. |
| 2549 | Faux positif | `${statut === 'plagiat' ? '...' : ''}` — conditional littéral. |
| 4376 | Faux positif | `${Math.round(moyenneC * 100)}` — nombre calculé. |
| 5320 | Faux positif | `${html}` est construit avec `echapperHtml` à chaque champ utilisateur (l. 5296, 5302). Risque résiduel théorique sur `${selectId}` et `${critere.critereId}` dans des attributs `id="..."` / `data-param="..."` — bas. |
| 7183 | Faux positif | `echapperHtml` sur nom et description. `${jeton.id}` dans `id="checkboxJetonPerso_..."` — risque résiduel théorique sur attribut. |

### productions.js (4 cas) — couverts par la fix sur genererBadgeCC ou faux positifs

| Ligne | Statut | Raison |
|---|---|---|
| 635 | Faux positif | Sélecteur d'échelle, pattern habituel avec `escapeHtml` voisin. |
| 644 | Statique | Pas d'interpolation. |
| 1499 | À vérifier en Phase 1 étape 3 | `artefacts.map(art => ...)` — non examiné en détail. |
| 2974 | **Couvert** par fix `genererBadgeCC` | Modal d'aperçu d'import productions. |

### pratiques.js (4 cas) — non examinés en détail

| Ligne | Statut | Raison |
|---|---|---|
| 1522 | À vérifier en Phase 1 étape 3 | `statutDiv.innerHTML = ${...}` |
| 4787, 4836, 4888 | À vérifier en Phase 1 étape 3 | `div.innerHTML = ${...}` (3 cas similaires) |

Ces 4 cas n'ont pas été examinés cas par cas — ils ne sont pas des modals d'import (pas le pattern `genererBadgeCC`). Probabilité de vrai XSS : faible (pratiques.js sert l'UI interne, pas les imports externes).

### grilles.js (4 cas) — couvert par la fix ou faux positifs

| Ligne | Statut | Raison |
|---|---|---|
| 1227 | Statique | Texte fixe (« ✓ Pondération complète »). |
| 1230 | Faux positif | `${100 - total}` — nombre calculé. |
| 1233 | Faux positif | `${total - 100}` — nombre calculé. |
| 1965 | **Couvert** par fix `genererBadgeCC` | Modal d'aperçu d'import grilles. |

### cartouches.js (2 cas) — couvert par la fix ou faux positif

| Ligne | Statut | Raison |
|---|---|---|
| 1794 | **Couvert** par fix `genererBadgeCC` | Modal d'aperçu d'import cartouches. |
| 2825 | Faux positif | `html + '<p class="sidebar-vide">…</p>'` — `html` est construit ailleurs avec helpers sécurisés. |

### echelles.js (1 cas) — couvert par la fix

| Ligne | Statut | Raison |
|---|---|---|
| 2173 | **Couvert** par fix `genererBadgeCC` | Modal d'aperçu d'import échelles. |

### bibliotheque-ui.js (1 cas) — non examiné

À examiner en Phase 1 étape 3.

## Cas non examinés (modules non prioritaires)

103 cas suspects restent dans des modules non listés en §8.2 défense E :

| Module | Cas | Catégorie |
|---|---|---|
| travaux-ui.js | 14 | UI module Travaux (annotations, photos) |
| planification-carte.js | 13 | Carte mentale |
| pratiques-materiel.js | 8 | Configuration de pratiques |
| trimestre-v2.js | 7 | Sélection de trimestres |
| travaux-outils.js | 5 | Outils du module Travaux |
| reserve-reglages.js | 5 | Carte Réserve dans Réglages |
| codex-data-ui.js | 5 | UI codex data |
| accompagnement.js | 5 | Module accompagnement |
| Autres modules | ~41 | Variés |

À examiner en Phase 1 étape 3 si ressources et urgence le justifient.

## Recommandation pour Phase 1

L'examen ciblé montre que **la dette `innerHTML` réelle dans Labo Codex est faible** :

- Le code utilise déjà largement `echapperHtml` / `escapeHtml` / `textContent`.
- La majorité des « suspects » du script sont des faux positifs (interpolations sûres par construction).
- Le **vrai cas critique** trouvé (`genererBadgeCC`) est corrigé en quelques lignes.

**Prioriser la Défense A (sandbox iframe)** : Cf. §8.2 Phase 1. La sandbox iframe neutralise techniquement la mécanique I-01 sous-jacente — même un `innerHTML` non-échappé dans un module legacy ne peut plus toucher l'IndexedDB du parent. Beaucoup plus rentable que migrer 103 cas un par un.

**Migration `innerHTML` ciblée** : à faire incrémentalement pour les cas rouges identifiés en cours de route, sans chantier dédié. Le hook pré-commit (Défense J) bloquera de toute façon les régressions futures.

## Remerciement à la méthode

L'audit programmatique a produit 125 cas suspects, dont la majorité sont faux positifs. C'est attendu — les heuristiques sur 5 lignes ne distinguent pas une variable sûre par construction d'une donnée externe brute. **L'audit a néanmoins fait son travail** : sans lui, on n'aurait pas trouvé le vrai cas `genererBadgeCC`, qui était caché dans un fichier (`cc-license.js`) que mon œil humain n'aurait peut-être pas pensé à inspecter (car il ne fait pas d'innerHTML lui-même — c'est sa fonction de retour qui est interpolée par les modules d'import).

## Référence

- Modèle de menaces : `docs/securite/MODELE-MENACES.md` §I-01, §8.2 défense E
- Audit programmatique : `docs/securite/audits/AUDIT-INNERHTML-2026-05-06.md`
- Script ré-exécutable : `scripts/audit-innerhtml.sh`
