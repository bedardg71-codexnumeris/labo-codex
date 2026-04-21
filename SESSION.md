# SESSION — État au 21 avril 2026 après-midi

**Date** : 21 avril 2026
**Dernier build** : `0421-1430` · Beta 99.21
**Branche** : `main`
**Statut** : Console silencieuse sur fraîche installation. 2 bugs audit terrain (LOG UX 21 avril) corrigés. Triptyque CC cadré, Plan 1 Phase 1 livrée. **Prêt à démarrer le chantier de consolidation onboarding (PLAN-CONSOLIDATION-ONBOARDING.md Phase 1 audit exhaustif).**

---

## 🚀 Consigne de démarrage pour la prochaine session

À copier-coller au début de la prochaine session :

```
cd /Users/kuekatsheu/Documents/GitHub/Monitorage_v6

Contexte : on vient de libérer la fenêtre de contexte (clear) pour
démarrer le chantier de consolidation onboarding avec le maximum de
marge. Build actuel : 0421-1430, Beta 99.21, poussé sur origin.

Lis dans cet ordre :
1. SESSION.md (état complet, bilan, consigne)
2. MEMORY.md (auto-mémoire)
3. memory/feedback_no_debt.md (PRINCIPE DIRECTEUR : stabilité zéro-dette)
4. memory/project_consolidation_onboarding.md (chantier à attaquer)
5. plans de travail/PLAN-CONSOLIDATION-ONBOARDING.md (plan détaillé, 8 phases)

Puis :
6. memory/project_autonomisation_utilisateur.md (Plan 1 CC, Phase 1 livrée)
7. memory/project_partage_ressources.md (Plan 2 CC, pas démarré)

Principe cardinal qui guide TOUT chantier (feedback_no_debt.md) :
« Dans un projet sans base d'utilisateurs, il n'y a pas de contrainte
  de rétro-compatibilité au-delà de la préservation des données
  personnelles du développeur (qui fait des backups Codex réguliers).
  Tout nouveau chantier retire ce qu'il remplace, il ne l'empile pas
  à côté. La stabilité prime sur la vitesse de livraison. »

Action concrète à démarrer :
- PLAN-CONSOLIDATION-ONBOARDING.md Phase 1 — audit exhaustif
- Créer docs/AUDIT-ONBOARDING-21-AVRIL.md (temporaire) listant pour
  chaque fonction exposée par primo-accueil.js / primo-modal.js /
  tutoriel-interactif.js / parcours-apprentissage.js :
  · les fichiers qui l'appellent (grep)
  · les data-action HTML qui la référencent (grep index.html)
  · la décision A (migrer) / B (remplacer par accueil V3 ou tour guidé)
    / C (supprimer, redondant)

Contrainte de préservation :
- Le wizard de pratique de notation est le SEUL rescapé valable de
  l'expérience Primo. À identifier précisément et préserver.
- Probablement dans js/wizard-pratique-v2.js ou équivalent.

Convention de build : MMJJ-HHMM (Toronto). Demande le numéro de beta
à Grégoire avant chaque commit — ne jamais renuméroter
automatiquement. Beta fixe pour une journée, seul le build change.
```

---

## 1. État du projet

### Architecture actuelle (Beta 99.21)

**Accompagnement unifié** (livré le 20 avril) :
- `js/accompagnement.js` (~1600 l.) — moteur unique avec 5 modes (hover, autoReveal, popup, tour, terme)
- `js/accompagnement-contenu-{hover,popup,terme}.js` — catalogues de contenu
- `css/accompagnement.css` (~1050 l.) — styles unifiés
- Préférence unique `accompagnementActif` (défaut `true`)

**Namespace démo permanent** (livré le 21 avril matin, Plan 1 Phase 1) :
- `js/demo-namespace.js` — initialise `demo_*` au premier run, idempotent via `demo-version-installee`
- Pack `pack-demo-20.js` utilisé comme source
- Attribution `Demo Labo Codex` posée sur les entités structurantes
- Invisible côté UI — Phase 2 exposera ça via sélecteurs à 2 sections

**Onboarding** :
- Accueil V3 (`js/accueil.js`) = entry point principal (bannière + 3 CTA + grille 4×2 + 4 demi-cartes)
- Tour guidé 6 étapes (intégré à accompagnement.js) = accompagnement in-context

### Ce qui reste dans le code mais ne devrait plus y être

Ces modules sont **obsolètes** (leur fonctionnalité a été soit abandonnée, soit remplacée par accueil V3) mais **physiquement présents** dans le code, avec des appels résiduels possibles :

- `js/primo-accueil.js` (~620 l.) — auto-trigger désactivé commit `8940088`, mais fichier encore là
- `js/primo-modal.js` (~2520 l.) — wizard conversationnel legacy
- `js/primo-questions.js`, `js/primo-validation-champs.js` — si encore présents
- `js/tutoriel-interactif.js` (~520 l.) — à auditer pour redondance
- `js/parcours-apprentissage.js` (~1200 l.) — orchestration + modales réutilisant `.modal-bienvenue-*` CSS

**Wizard de pratique de notation** (`js/wizard-pratique-v2.js` ?) : le SEUL rescapé valable de l'expérience Primo. À préserver.

**Total retirable estimé** : ~5000 lignes (JS + CSS associé) — c'est le périmètre de PLAN-CONSOLIDATION-ONBOARDING.md.

### Console console sur fraîche installation (Beta 99.21)

**Avant le nettoyage** (ce matin, sur build 0421-1355) : ~30 messages
**Après** (build 0421-1405) : 1 seul `[Info]` Safari (anti-fingerprinting vs Cloudflare challenge token, hors contrôle)

---

## 2. Travail fait aujourd'hui (21 avril 2026)

### Commits de la journée (11 commits)

| Build | SHA | Livrable |
|---|---|---|
| 0421-0705 | `38d90a3` | Triptyque CC : plans autonomisation + partage |
| 0421-0730 | `16e0b76` | **PLAN 1 Phase 1** : namespace demo_* permanent |
| 0421-0745 | `4dc8751` | Traces session + commentaire préventif CSS |
| 0421-1320 | `8940088` | **Fix audit 21 avril** : Primo régression + backup user vierge |
| 0421-1335 | `4175892` | Plan consolidation onboarding + principe zéro-dette |
| 0421-1355 | `c6478b2` | Nettoyage console : prefs transitions + DEMO-TRACE + source maps |
| 0421-1405 | `94e6dfd` | Silence au démarrage : 9 warnings « installation vierge » retirés |
| 0421-1430 | (ce commit) | SESSION.md mis à jour pour clear context |

### Événements marquants

**Régression Primo identifiée** (LOG UX 21 avril IMG_6093) : modale « PARCOURS MODULAIRE » auto-affichée sur fraîche installation. Root cause : commit `51e5cdc` (hier, chantier 3 pref unique) a redirigé `estTourGuideActif` vers `obtenirPreference('accompagnementActif')` dont le défaut est `true`. Avant, l'ancienne pref `tourGuide` avait un défaut `false` qui tenait silencieusement la modale à l'écart. La régression a été corrigée en désactivant l'auto-trigger (commit `8940088`), mais elle a révélé une **dette structurelle** plus large — d'où le plan de consolidation.

**Principe « stabilité zéro-dette » formalisé** (feedback_no_debt.md + PLAN-CONSOLIDATION-ONBOARDING.md §1) : à appliquer à tous les chantiers futurs. À inscrire dans CLAUDE.md lors de la Phase 8 du chantier de consolidation.

**Console nettoyée** : chaque warning devait être justifié ou silencieux. 9 warnings « installation vierge » convertis en silent returns (avec conservation des warnings pour les cas d'anomalie réelle — ex. données présentes mais cours actif absent).

---

## 3. Ce qui vient (PLAN-CONSOLIDATION-ONBOARDING.md)

### Phase 1 — Audit exhaustif

Créer `docs/AUDIT-ONBOARDING-21-AVRIL.md` (fichier temporaire, retiré en Phase 8) qui dresse pour chaque fonction globale exposée par les modules à retirer :

**Fonctions à auditer** (depuis primo-accueil.js et primo-modal.js) :
```
window.initialiserPrimoAccueil
window.reafficherAccueilPrimo
window.fermerModalAccueil
window.naviguerVersImportDemo
window.demarrerConfigComplete
window.demarrerWizard             ← probablement à préserver (pratique de notation)
window.demarrerCreationMateriel
window.demarrerCodex
window.demarrerEvaluation
window.explorerLibrement
window.consulterAide
window.ouvrirModalConversationnel
```

Pour chaque fonction :
1. `grep -rE "nomFonction\b"` dans `js/` — qui l'appelle ?
2. `grep -E 'data-action="nomFonction"'` dans `index.html` et `js/` — HTML qui y pointe ?
3. Décision : A (migrer vers autre module) / B (remplacer par accueil V3 ou tour guidé) / C (supprimer, redondant)

**Livrable Phase 1** : le fichier audit + un plan de migration concret pour Phase 2.

### Phases suivantes

- Phase 2 — Migration des appels valides
- Phase 3 — Retrait primo-accueil + primo-modal
- Phase 4 — Retrait tutoriel-interactif
- Phase 5 — Simplification parcours-apprentissage
- Phase 6 — Nettoyage prefs + flags localStorage
- Phase 7 — Nettoyage CSS orphelin (incluant `.modal-bienvenue-*` si parcours-apprentissage ne les utilise plus)
- Phase 8 — Documentation + inscription du principe zéro-dette dans CLAUDE.md

### Critères d'acceptation globaux

1. Un seul flow d'onboarding au démarrage (accueil V3)
2. Toutes les fonctionnalités conservées accessibles via accueil V3 / nav
3. Aucun fichier JS/CSS/data-action orphelin
4. Principe zéro-dette inscrit dans CLAUDE.md
5. Données utilisateur intactes
6. Console sans erreur

---

## 4. Plans en cours et priorités

| Plan | Statut | Priorité | Remarque |
|---|---|---|---|
| PLAN-CONSOLIDATION-ONBOARDING.md | **À démarrer** | **Haute** | Phase 1 audit — débloque les phases suivantes |
| PLAN-AUTONOMISATION-UTILISATEUR.md | Phase 1 livrée | Moyenne | Phase 2+ après consolidation |
| PLAN-PARTAGE-RESSOURCES.md | Cadré | Basse | Attend autonomisation Phase 6+ |

Ordre logique : consolidation (nettoyage) → autonomisation (construction sur socle propre) → partage (extension).

---

## 5. Préservation des données personnelles

Grégoire fait des backups Codex réguliers. Les données personnelles (trimestres réels H2026/A2025, grilles, évaluations, productions) sont **intouchables** dans tout chantier — la seule rétro-compat obligatoire. Les namespaces démo (`demo_*`) et éventuels résidus d'anciens systèmes sont libres d'être manipulés.

---

## 6. Conventions opérationnelles

- **Build** : format `MMJJ-HHMM` (Toronto). Bump à chaque commit. Beta fixe pour une journée.
- **Demander le numéro de beta** à Grégoire avant chaque commit ; ne jamais renuméroter automatiquement.
- **Avant chaque commit** : mettre à jour `version.json` + fallback `js/init-inline.js` (lignes ~132-133).
- **CSP strict** : `script-src 'self'`, zéro inline, zéro eval. Les violations Cloudflare/beacon sont attendues et bloquées — OK.
- **iPad Safari file://** : cache busters `?v=` INOPÉRANTS. Pour tester en local, Cmd+Q Safari pour forcer rechargement.
- **Security** : voir CLAUDE.md § « Règles de sécurité » — echapperHtml obligatoire sur innerHTML, validerZipSecurite sur imports, etc.
