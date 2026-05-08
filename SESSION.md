# SESSION — État au 8 mai 2026 (Défense A — sandbox iframe planifiée, prête à démarrer)

**Date** : 8 mai 2026
**Dernier build** : `0508-0615` · Beta **99.36** (poussée sur origin/main)
**Branche** : `main` (à jour avec origin)
**Statut** : Plan Défense A (Phase 1 sécurité) validé et sauvegardé. Prêt à démarrer SP1 du chantier. Validation à l'usage des défenses du 6 mai 100 % passée le matin du 8 mai (2 fixes terrain en route).

---

## ⚙️ Mises à jour matinales du 8 mai 2026 (avant le démarrage Défense A)

Trois activités intercalées avant l'ouverture du chantier sandbox iframe :

### 1. Validation à l'usage des défenses du 6 mai (étapes 1, 2, 3) — 100 % passée

- ✅ **Étape 1 — Backup Codex** (filet de sécurité avant tests). 318 fichiers, ZIP téléchargé. 2 bugs trouvés et corrigés en route (voir #2 et #3 ci-dessous).
- ✅ **Étape 2.1 — Toggle FSAPI** dans Réglages > Préférences > Sécurité. Visible et fonctionnel.
- ✅ **Étape 2.2 — Modale K-β preview** (cliquer Annuler) : ferme proprement, aucune création.
- ✅ **Étape 2.3 — Migration FSAPI silencieuse** : passée au premier boot (8 mai), pas d'accroc.
- ✅ **Étape 3 — Round-trip import config** : fonctionne, mais l'UI n'est pas alignée sur le design system → #263 ajouté au backlog.

### 2. Bug terrain Défense K — whitelist `codex-manifeste.json` (commit `ba2e897`, b0508-0605)

L'export Codex normal était bloqué : ma whitelist du 6 mai supposait `manifeste.json` mais la constante `NOM_MANIFESTE` dans `codex.js:25` est `codex-manifeste.json` (lecture du code en surface au lieu de vérifier la valeur de la constante). Whitelist étendue à `codex-manifeste.json` + `classeur-manifeste.json` (legacy). **Leçon enregistrée** dans `feedback_securite_tests.md` : pour toute whitelist/schéma/validation de structure, tester un vrai usage avant commit.

### 3. Bug UX K-β — overlay progression non réaffiché (commit `ca53aba`, b0508-0615)

Après le clic « Télécharger » sur la modale K-β preview, l'overlay de progression était masqué et jamais ré-affiché → utilisateur attend dans le noir pendant la compression du ZIP (peut-être plusieurs minutes avec 318 fichiers). Fix appliquée sur `codex.js` et `reserve.js` : appel à `_afficherProgression(...)` après confirmation pour montrer la compression jusqu'au téléchargement.

### 4. Backlog #263 ajouté + étendu (commits `6c82c55` + `551b1af`)

Aligner l'UI des modales sécurité sur `design-system.html`. Couvre 3 modales + 1 notification :
- K-β preview (`js/securite-export-preview.js`) — overlay + boutons à classer.
- `demanderMetadonneesConfigComplete` (`js/cc-license.js:842`, « Partager ma pratique complète ») — placeholders peu lisibles, contraste textarea, accents manquants (« complete », « pratique », etc.).
- Carte Sécurité dans Réglages > Préférences — vérifier cohérence.
- Notification de succès enrichie sceau SHA-256 — vérifier rendu.

Effort estimé 2-3 h. Hors scope Défense A — à traiter séparément.

---

---

## 🚀 Consigne de démarrage pour la prochaine session

À copier-coller au début de la prochaine session :

```
cd /Users/kuekatsheu/Documents/GitHub/Monitorage_v6

Contexte : Démarrage du chantier Défense A — Sandbox iframe pour
l'aperçu d'objets importés (Phase 1 sécurité, recommandation
principale du rapport E-β du 6 mai). Plan complet validé par
Grégoire le 8 mai 2026.

LECTURE OBLIGATOIRE AVANT DE CODER :

1. plans de travail/PLAN-DEFENSE-A-SANDBOX-IFRAME.md
   ← Plan complet, autonome, déjà validé (4 décisions UX/archi
   prises). Contient l'API du composant, le srcdoc minimal, le
   filtrage postMessage, les 5 sous-phases détaillées, les critères
   de réussite. C'EST LE DOCUMENT DE RÉFÉRENCE PRINCIPAL.

2. docs/securite/MODELE-MENACES.md §7 D-01 (défense P1) + §8.2 Phase 1

3. docs/securite/audits/AUDIT-INNERHTML-FINDINGS-2026-05-06.md
   (recommandation E-β qui justifie ce chantier)

4. CLAUDE.md — conventions, règles sécurité (echapperHtml, data-action,
   classList.add('actif'), db.setSync, Safari file://)

5. SESSION.md — ce fichier

DÉCISIONS DÉJÀ VALIDÉES (cf. PLAN §3) :
  1. Périmètre v1 = 6 modals d'aperçu d'import (grilles, échelles,
     productions, cartouches, pratiques, tampons). Aperçus internes
     (evaluation.js, wizard-pratique-v2.js) hors scope v1.
  2. Mécanisme = iframe srcdoc (HTML inline, pas de blob:).
  3. echapperHtmlCC dans genererBadgeCC du 6 mai conservé (défense
     en profondeur).
  4. Style iframe = variables CSS du DS injectées dans le srcdoc.

ACTION IMMÉDIATE — DÉMARRER SP1 :
  - Créer la branche : git checkout -b feature/securite-defense-a-sandbox
  - Créer js/securite-apercu-sandbox.js (composant complet, ~200-300 l.)
  - Créer prototype-apercu-sandbox.html à la racine (démo + test
    payload XSS)
  - Ajouter le tag <script> dans index.html (après init-inline)
  - Test manuel : injecter <img src=x onerror=...> et vérifier
    qu'aucun effet ne touche le parent
  - Validation visuelle Safari Mac (Cmd+Q + rouvrir)

SP2 (intégration 6 modals) après validation SP1.
SP3-SP5 (tests sécurité, doc, PR) après SP2.

WORKFLOW DE CHANTIER (rappel) :
1. SP1 = composant autonome livrable seul. Demander beta + commit
   après validation visuelle.
2. SP2 = un fichier à la fois, validation visuelle entre chaque,
   commit par fichier ou par lot de 2-3.
3. SP3 = tests sécurité documentés dans docs/securite/audits/
4. SP4 = MODELE-MENACES v1.4 (D-01/X-01/I-01 → Bon ou Complet)
5. SP5 = PR + /ultrareview (vaut le coup pour un chantier sécurité)
       + merge --merge --delete-branch.

À chaque commit final :
  - Bumper version.json + js/init-inline.js + cache-buster init-inline
  - Ajouter le tag pour js/securite-apercu-sandbox.js dans index.html
    (la première fois seulement)
  - Le hook pré-commit (Défense J) bloque les innerHTML non échappés
    et avertit sur les écritures vers les clés sensibles. ATTENTION :
    le composant sandbox utilise innerHTML/srcdoc avec contenu
    contrôlé — préparer une justification pour le hook si nécessaire.

CONTRAINTES TECHNIQUES (rappel CLAUDE.md) :
- echapperHtml() obligatoire sur innerHTML avec données utilisateur
  (mais l'iframe sandbox neutralise ce besoin pour son contenu)
- Zéro handler inline → data-action / data-on-change / data-on-input
- console.warn / console.error uniquement (pas console.log en prod)
- Modales : classList.add('actif') (PAS 'visible')
- db.setSync pour petites métadonnées (PAS db.set async)
- Variables CSS du DS, tester modes clair ET sombre
- Safari Mac/iPad cibles ; Cmd+Q + rouvrir entre les sous-phases

ÉTAT BACKLOG (autres items en attente, ne pas confondre avec ce chantier) :
  - #257 v2.B Mode consultation namespace temporaire (~5-6 h)
  - #256-bis Aide aux 8 autres modales (~1 j)
  - #262 Clarifier le nommage des exports
  - Défense I (tests automatisés) et C (wrapper destructif) Phase 1
  - Test iPad refonte nav + nouveaux modules codex data
```

---

## Récap détaillé de la session du 6 mai 2026 (après-midi)

### 13 commits livrés (b0506-1300 → b0506-1530)

| # | Commit | Chantier | Build |
|---|---|---|---|
| 1 | `f9f6865` | Audit baseline + B-α sanitisation profonde | 0506-1300 |
| 2 | `f27180a` | Backlog #262 — clarifier nommage exports | — |
| 3 | `48c1a2d` | Défense J — hook pré-commit | — |
| 4 | `d0a0903` | Défense D — révocation FSAPI | 0506-1335 |
| 5 | `a9eadae` | Défense P-α — sanitisation tampons | 0506-1345 |
| 6 | `404b924` | Défense H — sceau SHA-256 | 0506-1400 |
| 7 | `0218d07` | Défense K — whitelist exports | 0506-1430 |
| 8 | `eb636f5` | MODELE-MENACES v1.2 (Phase 0 livrée) | — |
| 9 | `c431ae4` | B-β — passage obligé `ajouter*` | 0506-1450 |
| 10 | `d0a00e3` | K-β — preview UI export | 0506-1505 |
| 11 | `0628129` | E-α — script audit innerHTML | — |
| 12 | `cef2fbc` | E-α correctif (escapeHtml + multi-ligne) | — |
| 13 | `d9bc49c` | **E-β — fix critique XSS dans `genererBadgeCC`** | 0506-1530 |

### Trouvaille majeure

L'audit `innerHTML` (E-β) a permis d'attraper un vrai vecteur D-01 critique caché dans `cc-license.js:genererBadgeCC` — fonction qui ne fait pas d'`innerHTML` elle-même mais dont le retour est interpolé par les modals d'aperçu d'import des 4 types pédagogiques (grilles, échelles, cartouches, productions). 5 champs metadata interpolés sans échappement. Un attaquant qui fabriquait un export avec un payload dans `metadata.auteur_original` déclenchait son code dès l'aperçu, avant même que l'utilisateur clique « Importer ». Fix unique sur `genererBadgeCC` couvre les 4 modals simultanément.

### Décisions de scope

- **B-α scope α** : ajout des sous-schémas et ingestion centralisée pour les 6 bibliothèques. Renvoi de B-β au même jour pour ne pas laisser de dette.
- **B-β** : `pratique.configuration` modélisé en `{ type: 'object' }` brut (pas exhaustivement modélisé — trade-off accepté car contenu structurel, peu exposé au XSS direct).
- **P-α scope révisé** : pas de migration vers le format ZIP (le scope §8.1 « unifier sur le pipeline ZIP commun » a été simplifié — sanitisation au canal isolé directement, format JSON préservé pour l'utilisateur).
- **K-β** : modale construite via `createElement` + `textContent` (pas d'`innerHTML` interpolé, CSP-compatible).
- **E** : audit programmatique a généré 125 cas suspects mais l'examen ciblé a montré que la dette `innerHTML` réelle est faible — la majorité des suspects sont des faux positifs (interpolations sûres par construction). Recommandation : prioriser Défense A (sandbox iframe) en Phase 1 plutôt que migrer 103 cas un par un.

### Fichiers nouveaux (artifacts de session)

- `docs/securite/MODELE-MENACES.md` v1.3 — modèle de menaces complet
- `docs/securite/HOOKS-PRE-COMMIT.md` — usage du hook
- `docs/securite/audits/AUDIT-2026-05-06.md` — baseline a priori (0 trouvaille)
- `docs/securite/audits/AUDIT-INNERHTML-2026-05-06.md` — rapport audit programmatique
- `docs/securite/audits/AUDIT-INNERHTML-FINDINGS-2026-05-06.md` — examen ciblé + fix critique
- `js/securite-prefs.js` — orchestrateur préférence FSAPI
- `js/securite-hash.js` — Web Crypto SHA-256 sur les exports
- `js/securite-export-validation.js` — whitelist structure
- `js/securite-export-preview.js` — preview UI avant download
- `scripts/audit-bibliotheques-securite.js` — audit a priori
- `scripts/audit-innerhtml.sh` — audit dette innerHTML (ré-exécutable)
- `scripts/hooks/pre-commit` — hook installé via `core.hooksPath`
- `scripts/install-hooks.sh` — installateur de hooks

### Fichiers modifiés (significatifs)

- `js/db.js` — préférence FSAPI + helpers
- `js/import-export.js` — schémas enrichis + sceau + validation export
- `js/codex.js` — validation + preview avant compression ZIP
- `js/reserve.js` — préférence FSAPI + validation + preview
- `js/cc-license.js` — fix critique `genererBadgeCC`
- `js/grilles-bibliotheque.js` — passage obligé B-β
- `js/echelles-bibliotheque.js` — passage obligé B-β
- `js/cartouches-bibliotheque.js` — passage obligé B-β
- `js/pratiques-bibliotheque.js` — passage obligé B-β
- `js/productions-bibliotheque.js` — passage obligé B-β
- `js/tampons-bibliotheque.js` — passage obligé B-β + sanitisation + preview
- `js/changelog-data.js` — entrée Beta 99 enrichie sécurité
- `BACKLOG.md` — entrée #262 ajoutée

---

## Notes pour la prochaine session

- **Chantier suivant validé** : Défense A — Sandbox iframe (Phase 1 sécurité). Plan complet dans `plans de travail/PLAN-DEFENSE-A-SANDBOX-IFRAME.md`. 4 décisions UX/archi déjà prises. Action immédiate : SP1 (composant `js/securite-apercu-sandbox.js` + démo + tag script).
- **Validation à l'usage** (chantier sécurité du 6 mai) : plusieurs modifications attendent une validation terrain (test fonctionnel d'import round-trip pour B-α, comportement de la migration FSAPI au boot, preview UI utilisable, etc.). Aucune ne devrait casser le flux normal — fallbacks safes partout.
- **iPad** : non testé. Le toggle FSAPI dans Réglages > Préférences > Sécurité doit être visible et fonctionnel. La preview UI doit s'afficher correctement.
- **MODELE-MENACES.md v1.3** : reflète l'état post-session du 6 mai. Les statuts défense par scénario sont à jour (D-03 à Bon, X-02 à Bon, autres à Partiel). Sera bumpé à v1.4 après livraison Défense A (D-01/X-01/I-01 → Bon ou Complet).
