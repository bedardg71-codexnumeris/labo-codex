# SESSION — État au 21 avril 2026 fin d'après-midi

**Date** : 21 avril 2026
**Dernier build** : `0421-1448` · Beta 99.21
**Branche** : `main`
**Statut** : **Consolidation onboarding LIVRÉE (Phases 1→8)**. ~6400 lignes retirées, principe « stabilité zéro-dette » inscrit dans CLAUDE.md. Test terrain iPad/Safari à effectuer sur build ≥ 0421-1448.

---

## 1. Consolidation onboarding livrée (8 commits)

| Build | SHA | Phase | Livrable |
|---|---|---|---|
| 0421-1425 | `cfee015` | 1 + 3 | Audit + retrait primo-* (4 modules, ~5700 l.) |
| 0421-1431 | `337855b` | 4 | Retrait tutoriel-interactif (530 l.) |
| 0421-1432 | `f796d93` | 5A | Retrait parcours-apprentissage (1280 l. + carte Réglages + 5 call-sites) |
| 0421-1439 | `2dc86e1` | 6 | Migration silencieuse flags orphelins (primo_accueil_vu, bienvenue_vu) |
| 0421-1441 | `dbbb72e` | 7 | Nettoyage CSS orphelin (~575 l. styles.css) |
| 0421-1448 | (ce commit) | 8 | Doc + principe zéro-dette dans CLAUDE.md |

**Total retiré** : ~5750 l. JS + ~75 l. HTML + ~575 l. CSS = **~6400 lignes**.

### Modules supprimés

- `js/primo-accueil.js` (631 l.)
- `js/primo-modal.js` (2518 l.)
- `js/primo-questions.js` (2306 l.)
- `js/primo-validation-champs.js` (281 l.)
- `js/tutoriel-interactif.js` (530 l.)
- `js/parcours-apprentissage.js` (1280 l.)

### Modules préservés

- `js/wizard-pratique-v2.js` (2566 l.) — accessible via accueil V3 carte « pratique » + Réglages › Pratique
- `js/accueil.js` (317 l.) — entry point V3 unique
- `js/accompagnement.js` (1667 l.) — tour guidé 6 étapes + popups d'aide ✴️ (`.primo-aide`/`.primo-popup`/`.primo-overlay` conservés)

---

## 2. Architecture onboarding actuelle (Beta 99.21 post-consolidation)

**Un seul flow d'onboarding** :

1. **Accueil V3** (`js/accueil.js`) = entry point au démarrage
   - Bannière de bienvenue + 3 CTA + grille 4×2 raccourcis + 4 demi-cartes (Sauvegarder, Nouveautés, Accompagnement, Données démo)
   - Carte « pratique de notation » → `ouvrirWizardPratique()` → wizard-pratique-v2
2. **Tour guidé 6 étapes** (intégré à `js/accompagnement.js`) = accompagnement in-context, panneau bas-droit, auto sur `sectionAffichee`
3. **Flèches didactiques** (`js/fleches-didactiques.js`) = signalétique pédagogique sur points d'action
4. **Popups d'aide ✴️** (gérés par `js/accompagnement.js`) = `.primo-aide` cliquables partout dans l'app

### Préférence unique

`accompagnementActif` (défaut `true`) — pilote en bloc tour guidé, popups ✴️, flèches didactiques.

### Migration silencieuse au démarrage

Dans `js/main.js` (listener `db-ready`), nettoyage idempotent des flags orphelins (`primo_accueil_vu`, `bienvenue_vu`) via flag `migration_onboarding_v6_21_done`.

---

## 3. Principe directeur ancré

**« Stabilité zéro-dette »** inscrit dans `CLAUDE.md` (section « Principes directeurs »). Synthèse :

> Pas de base d'utilisateurs → aucune contrainte de rétro-compat hors préservation des données personnelles. Tout chantier retire ce qu'il remplace, pas d'empilement. Refactoring permis si ça améliore la stabilité. Pas de report « post-AQPC ».

Voir aussi : `memory/feedback_no_debt.md`.

---

## 4. À tester sur build ≥ 0421-1448 (terrain iPad/Mac Safari)

Critères d'acceptation du chantier :

- [ ] Installation vierge : **un seul** écran d'onboarding au 1er démarrage (accueil V3). Aucune modale Primo / parcours / tutoriel.
- [ ] Console silencieuse au démarrage (pas de `ReferenceError`).
- [ ] Wizard de pratique de notation fonctionne depuis : (a) accueil V3 carte « pratique », (b) Réglages › Pratique.
- [ ] Tous les flows métier (Réglages / Structure / Évaluations / Suivi) fonctionnent sans régression.
- [ ] Données personnelles (trimestres H2026/A2025) intactes.
- [ ] Au 1er démarrage post-migration, les flags `primo_accueil_vu` et `bienvenue_vu` ont disparu de localStorage et IDB.

---

## 5. Plans en cours

| Plan | Statut | Priorité | Remarque |
|---|---|---|---|
| PLAN-CONSOLIDATION-ONBOARDING.md | ✅ **Livré** | — | Phases 1→8 closes |
| PLAN-AUTONOMISATION-UTILISATEUR.md | Phase 1 livrée | Moyenne | Phase 2+ peut démarrer maintenant (socle propre) |
| PLAN-PARTAGE-RESSOURCES.md | Cadré | Basse | Attend autonomisation Phase 6+ |

Ordre logique respecté : consolidation (✅) → autonomisation (en cours) → partage.

---

## 6. Préservation des données personnelles

Grégoire fait des backups Codex réguliers. Les données personnelles (trimestres réels H2026/A2025, grilles, évaluations, productions) sont **intouchables** dans tout chantier — la seule rétro-compat obligatoire. La migration silencieuse de la Phase 6 ne touche QUE les flags orphelins (`primo_accueil_vu`, `bienvenue_vu`), jamais les données métier.

---

## 7. Conventions opérationnelles

- **Build** : format `MMJJ-HHMM` (Toronto). Bump à chaque commit. Beta fixe pour une journée.
- **Demander le numéro de beta** à Grégoire avant chaque commit ; ne jamais renuméroter automatiquement.
- **Avant chaque commit** : mettre à jour `version.json` + fallback `js/init-inline.js` (BUILD_ID).
- **CSP strict** : `script-src 'self'`, zéro inline, zéro eval.
- **iPad Safari file://** : cache busters `?v=` INOPÉRANTS. Pour tester en local, Cmd+Q Safari pour forcer rechargement.
- **Sécurité** : voir CLAUDE.md § « Règles de sécurité » — `echapperHtml` obligatoire sur innerHTML, `validerZipSecurite` sur imports, etc.
- **Principe zéro-dette** : voir CLAUDE.md § « Principes directeurs » — appliquer à chaque chantier.

---

## 8. Documents archivés (notes d'obsolescence ajoutées Phase 8)

Ces documents décrivent l'état pré-consolidation et sont conservés comme archive historique :

- `NOTES-DE-VERSION.md` — section « Assistant actif de creation de materiel pedagogique » marquée OBSOLETE
- `docs/Rapport - Flux de configuration (0207).md` — marqué OBSOLETE en tête
- `docs/audit-premier-contact.md` — marqué OBSOLETE en tête

Le livrable temporaire `docs/AUDIT-ONBOARDING-21-AVRIL.md` (Phase 1) a été retiré comme prévu.
