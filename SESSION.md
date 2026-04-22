# SESSION — État au 22 avril 2026 soir (post-revert Phase 5)

**Date** : 22 avril 2026
**Dernier build** : `0422-1828` · Beta 99.22
**Branche** : `main` (pushée)
**Statut** : **Plan 1 Autonomisation — Phases 1 à 4 LIVRÉES et acquises** (`602bacf`). Phase 5 tentée l'après-midi, revert après échec terrain. Le mode démo legacy (`entrerEnDemo`/`quitterDemo`) est réactif. Prochaine tentative Phase 5 plus tard, selon les règles du post-mortem.

---

## 🚀 Consigne de démarrage pour la prochaine session

À copier-coller au début de la prochaine session :

```
cd /Users/kuekatsheu/Documents/GitHub/Monitorage_v6

Contexte : tentative Phase 5 (retrait mode démo legacy) reverted le 22
avril soir après 10 commits infructueux. Le mode démo legacy est réactif.
Build actuel : 0422-1828, Beta 99.22, pushé sur main. Branche backup
backup/phase5-tentative-22avril-2026 conserve le travail tenté.

Lis dans cet ordre :
1. SESSION.md (ce fichier, état complet)
2. docs/POST-MORTEM-PHASE5-22-AVRIL.md (leçons tirées, règles à suivre)
3. plans de travail/PLAN-AUTONOMISATION-UTILISATEUR.md (plan initial +
   section « Leçons tirées de la tentative du 22 avril »)
4. MEMORY.md (auto-mémoire, voir section Session 22 avril après-midi)
5. memory/feedback_cache_busters.md (RÈGLE : bumper ?v= dans le même
   commit que la modif .js, sinon Safari iPad masque le bug)
6. memory/feedback_no_debt.md (principe directeur du projet)
7. memory/project_autonomisation_utilisateur.md (section « Tentative
   Phase 5 » à jour)

Si la prochaine tentative Phase 5 est programmée : adopter les 6 règles
du post-mortem §5. Sous-phase par sous-phase. Cache-busters en premier
réflexe. Test iPad à chaque étape. Cartographier flows démo par entité
AVANT retrait (Phase 4.B avait oublié le GC — à corriger). Valider
lectures namespace de bout en bout si on modifie les pointeurs.
```

---

## 1. Ce qui a été tenté aujourd'hui après-midi (revert)

### Commits originaux (présents sur branche backup uniquement)

| Build | SHA | Livrable |
|---|---|---|
| 0422-1201 | `7c8cc8e` | 5.A — retrait donnees-demo.js + migration-phase5.js |
| 0422-1305 | `d945d74` | 5.B — retrait estEnModeDemo + filtrerEtudiantsParMode |
| 0422-1411 | `c66cbff` | Fix listener direct checkbox (diag erroné, workaround) |
| 0422-1432 | `7f6685d` | 5.B-bis — flow Dupliquer GC démo |
| 0422-1448 | `c12e720` | Fix listener direct select GC (workaround) |
| 0422-1500 | `4f5e110` | Diag console.warn (retiré ensuite) |
| 0422-1508 | `1c070c3` | Bump cache-buster trimestre-v2.js (vraie cause) |
| 0422-1520 | `e57c992` | Fix bouton Enregistrer démo + carte résumé |
| 0422-1529 | `fa85a97` | Bump cache-busters massif (11 fichiers) |
| 0422-1541 | `253ce0d` | 5.B-ter — activation GC démo au toggle |

### Revert (sur main)

- `76a55fb` (b0422-1828) — Doc post-mortem + leçons dans le plan
- `7e47f4e` (b0422-1828) — Restauration 18 fichiers à 602bacf

### Ce qui a été appris

Voir `docs/POST-MORTEM-PHASE5-22-AVRIL.md` pour le détail. Synthèse :

1. **Cache-busters `?v=` à bumper dans le même commit qu'une modif `.js`** — règle n°1. Sans ça Safari iPad sert la cache, les nouvelles fonctions ne tournent pas, et le symptôme ressemble à un bug iOS natif.
2. **Une sous-phase à la fois** avec validation terrain iPad+Mac entre chaque. Pas d'empilement.
3. **Parcours utilisateur formalisé** avant retrait : écrire clic par clic le parcours attendu, valider avec Grégoire que la modélisation pédagogique est servie.
4. **Cartographier flows démo par entité** avant retrait. Phase 4.B avait oublié le GC — il n'avait pas de bibliothèque visuelle séparée, donc les options démo `disabled=true` le rendaient inactionnable.
5. **Tester iPad dès la première sous-phase** — les bugs de cache se révèlent d'abord sur iPad.
6. **Valider lectures namespace de bout en bout** : si on route via pointeurs vers `demo_*`, vérifier que toutes les lectures effectives retournent les données attendues.

---

## 2. État acquis (Phases 1 à 4, présent dans 602bacf, intact après revert)

- **Phase 1** — Namespace `demo_*` permanent via `js/demo-namespace.js` et `cleDemo()`. Flag `demo-version-installee`. Données pack démo dans demo_* dès le 1er run.
- **Phase 2** — Sélecteurs à 2 sections (Mes documents / Démo) dans 11 dropdowns. Options démo préfixées `demo-` avec optgroup visuel.
- **Phase 3** — Fork + attribution `inspireDe` sur cartes biblio (5 modules). Panneau métadonnées CC avec ligne « Inspiré de ».
- **Phase 4.A** — Identité CC utilisateur (`obtenirIdentiteCCUtilisateur()`) distincte de l'enseignant métier (`obtenirNomEnseignantActif()` réservé PDF). 9 call-sites migrés.
- **Phase 4.B** — Formulaires démo lecture seule sur 5 formulaires (grille, échelle, cartouche, production, pratique matériel) + bouton « Dupliquer pour créer ma X » + fork via `BibliothequeUI.forkerItem`.
- **Phase 4.C** — Interdiction des références mixtes à la sauvegarde via `verifierReferencesPasDemo`. 3 points de save gardés (GC, évaluation ×2, pratique).

---

## 3. Ce qui reste à faire (revu)

| Phase | État | Notes |
|---|---|---|
| 5 — Retrait mode démo legacy | **Tentée, revert** | Règles du post-mortem à suivre pour la prochaine tentative. GC démo à inclure dans Phase 4.B-bis d'abord (flow Dupliquer pour GC). |
| 6 — Documentation | À faire | Dépend de 5 |
| 7 — Préparation Plan 2 | À faire | Dépend de 5 |

---

## 4. Mode démo actif (legacy, depuis le revert)

Le mode démo fonctionne comme avant le chantier Phase 5 :
- Cocher « Données démo » sur l'accueil → `entrerEnDemo()` charge le pack démo dans les globaux, active le trimestre démo, bandeau vert « Mode démonstration » en bas
- Aperçu se peuple naturellement
- Décocher → `quitterDemo()` décharge, restaure l'état précédent

Code : `js/donnees-demo.js` (restauré), bandeau HTML dans `index.html`, listener `data-on-change="toggleDemoHandler"` dans `js/accueil.js`.

---

## 5. Conventions opérationnelles (inchangées)

- **Build** : format `MMJJ-HHMM` Toronto. Bump à chaque commit. Beta fixe journée.
- **Cache-busters** : bumper `?v=` dans `index.html` pour chaque `.js` modifié, dans le MÊME commit. Règle post-mortem Phase 5.
- **Demander numéro de beta** avant chaque commit ; ne jamais renuméroter auto.
- **version.json** + fallback `js/init-inline.js` BUILD_ID à chaque commit.
- **CSP strict** : `script-src 'self'`. Violations Cloudflare/beacon attendues.
- **Principe zéro-dette** (CLAUDE.md §Principes directeurs) : appliquer partout.

---

## 6. Préservation des données personnelles

Grégoire fait des backups Codex réguliers. Données personnelles (trimestres réels H2026/A2025, grilles, évaluations, productions) **intouchables**. Le revert Phase 5 a restauré le mode démo legacy donc `entrerEnDemo`/`quitterDemo` gèrent le snapshot/restore de manière robuste comme auparavant.
