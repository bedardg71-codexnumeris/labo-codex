# Plan — Consolidation de l'onboarding (retrait des systèmes redondants)

**Date** : 21 avril 2026
**Statut** : Cadrage complet, implémentation non démarrée
**Déclencheur** : régression observée en terrain iPad (LOG UX 21 avril) où la modale Primo « PARCOURS MODULAIRE » s'est réveillée à cause d'un changement de défaut de préférence. Symptôme d'une dette structurelle : plusieurs systèmes d'onboarding coexistent, chacun avec sa propre logique de déclenchement.

---

## 1. Principe directeur — Stabilité zéro-dette

Ce principe s'applique à ce plan mais aussi à tous les chantiers futurs du projet.

> **Dans un projet sans base d'utilisateurs**, il n'y a pas de contrainte de rétro-compatibilité au-delà de la **préservation des données personnelles du développeur** (qui fait des backups Codex réguliers). Tout nouveau chantier **retire ce qu'il remplace**, il ne l'empile pas à côté. Si un refactoring améliore la stabilité, il est non seulement permis mais **attendu**. La stabilité prime sur la vitesse de livraison.

**Conséquences opérationnelles** :
- Quand un nouveau système est introduit pour remplacer un ancien, le chantier n'est pas fini tant que l'ancien n'est pas retiré.
- Le code « on garde au cas où » est proscrit — du code qui n'est appelé par rien ne peut avoir que deux destins : être rebranché explicitement, ou être supprimé.
- Les preferences, flags localStorage et data-actions sont auditées à chaque changement de défaut pour détecter les régressions latentes (cas d'école : ma propre régression du 21 avril, où `estTourGuideActif` redirigé vers `accompagnementActif` (défaut `true`) a réveillé `primo-accueil.js` qui restait silencieux grâce au défaut `false` précédent).
- Ce principe est à rappeler dans `CLAUDE.md` à la prochaine mise à jour documentaire.

---

## 2. Contexte historique (pour ancrer les décisions)

**Primo** était à l'origine un **wizard complet d'onboarding conversationnel**
qui accompagnait l'utilisateur dans ses premiers pas (assemblage du groupe-cours,
choix de pratique, création du matériel, etc.). L'expérience **n'a pas été
concluante** — les utilisateurs testeurs ne trouvaient pas le flow fluide ou
pédagogiquement pertinent.

Conséquence : le wizard a été démantelé progressivement. La **seule partie
encore valable** est le **wizard de pratique de notation** (configurer la
pratique : pondération, grille, échelle, cartouches) — probablement accessible
via `demarrerWizard` ou `wizard-pratique-v2.js`. Le reste de Primo (accueil
modulaire, modules 1→6 affichés dans la capture IMG_6093 du 21 avril) est
du **legacy d'une expérience abandonnée**, maintenu sporadiquement par
osmose (ex. le refacto `classeur → codex` du 14 mars a touché 374 occurrences
sur 11 fichiers dont certains primo, non parce que primo était encore utilisé
mais parce qu'il fallait éviter les incohérences de vocabulaire partout).

**Implication directe pour ce plan** :
- Le **wizard de pratique de notation** est à **préserver** et à
  identifier précisément dans l'audit (probablement `js/wizard-pratique-v2.js`
  ou équivalent). Il doit survivre à la consolidation, éventuellement être
  promu au rang de module autonome.
- Le **reste de Primo** (accueil modulaire, 6 modules, parcours
  conversationnel) est du code à **retirer sans regret** — l'expérience
  utilisateur qu'il visait a été abandonnée.

## 3. Inventaire de la dette actuelle

### 3.1 Systèmes d'onboarding coexistants

| Système | Fichier(s) | Lignes | Statut actuel | Destin proposé |
|---|---|---|---|---|
| **Accueil V3** | `js/accueil.js` | ~620 | Créé 19 avril. Bannière + 3 CTA + grille 4×2 + 4 demi-cartes. | **Conservé** — devient l'unique point d'entrée d'onboarding |
| **Tour guidé 6 étapes** | `js/accompagnement.js` (sous-section TOUR) | intégré | Créé 19 avril. Panneau flottant bas-droit, auto sur `sectionAffichee`. | **Conservé** — accompagnement in-context |
| **Primo modulaire** | `js/primo-accueil.js` + `js/primo-modal.js` | ~620 + ~2520 = ~3140 | Maintenu jusqu'au 14 mars 2026 (refacto codex). Auto-trigger désactivé le 21 avril midi (commit `8940088`). | **Retiré** — ses fonctions utiles sont migrées |
| **Tutoriel interactif** | `js/tutoriel-interactif.js` | ~520 | Chargé mais son déclencheur à auditer. | **Retiré** si redondant, sinon migré |
| **Parcours d'apprentissage** | `js/parcours-apprentissage.js` | ~1200 | Orchestration + modales réutilisant `.modal-bienvenue-*` CSS | **Audit** — à simplifier si redondant |
| **Bienvenue modal (obsolète)** | `js/modal-bienvenue.js` | supprimé 20 avril | Fichier déjà retiré, CSS résiduel | **Nettoyage CSS** si plus aucun consommateur |
| **Primo questions/champs** | `js/primo-questions.js`, `js/primo-validation-champs.js` | ? | Partie du flow Primo modulaire | **Retiré** avec Primo modulaire |

**Total retirable estimé** : ~5000 lignes de code (~4000 JS + ~500 CSS associé + cleanup assorti).

### 3.2 Fonctions globales exposées par le primo (à auditer)

Depuis `js/primo-accueil.js` et `js/primo-modal.js`, exposées sur `window` :

```
window.initialiserPrimoAccueil       → obsolète après retrait auto-trigger
window.reafficherAccueilPrimo        → auditer callers
window.fermerModalAccueil            → auditer callers
window.naviguerVersImportDemo        → auditer callers (mentionne démo)
window.demarrerConfigComplete        → auditer callers
window.demarrerWizard                → auditer callers
window.demarrerCreationMateriel      → auditer callers
window.demarrerCodex                 → auditer (Codex a un bouton d'en-tête dédié)
window.demarrerEvaluation            → auditer callers
window.explorerLibrement             → auditer callers
window.consulterAide                 → auditer (Aide a un accès nav dédié)
window.ouvrirModalConversationnel    → auditer callers (primo-modal)
```

Chaque fonction doit avoir un destin explicite :
- **A** : migrer dans un autre module si elle est la seule à offrir cette fonctionnalité
- **B** : remplacer par un accès via accueil V3 ou tour guidé
- **C** : supprimer si redondante avec ce qui existe déjà

### 3.3 Data-actions référencés dans l'HTML

À auditer : `grep -r "data-action=\"primo\." js/ index.html`. Tout `data-action` pointant vers une fonction qu'on supprime doit être migré ou retiré en même temps.

### 3.4 Préférences et flags à nettoyer

Au retrait des modules, auditer et nettoyer :
- Préfs liées (`obtenirPreference` / `definirPreference`) spécifiques au primo
- Flags localStorage (`bienvenue_vu`, `premierLancement_*`, etc.)
- Si un utilisateur (toi) a des flags posés, migration silencieuse au démarrage

---

## 4. Phases de livraison

### Phase 1 — Audit exhaustif des appels

**Objectif** : dresser pour chaque fonction exposée par primo / tutoriel-interactif / parcours-apprentissage une carte complète des callers.

**Livrable** : un fichier `docs/AUDIT-ONBOARDING-21-AVRIL.md` (temporaire, retiré en Phase 8) listant pour chaque fonction :
- Fichiers qui l'appellent (via `grep`)
- HTML `data-action` qui la référencent
- Pour chaque caller, décision A/B/C (§2.2)

**Commit** : documentation d'audit, zéro changement de code.

### Phase 2 — Migration des appels valides

**Objectif** : toutes les fonctionnalités qui doivent être conservées ont maintenant un chemin d'accès propre via l'accueil V3, le tour guidé, ou un bouton dédié déjà présent.

Exemples anticipés :
- `demarrerCodex` → déjà accessible via bouton Codex en en-tête. Migration : aucun besoin de path Primo.
- `demarrerWizard` (pratique de notation) → migrer vers un CTA dans Réglages › Pratique si encore pertinent.
- `demarrerCreationMateriel` → remplacé par le mode exercice prévu dans PLAN-AUTONOMISATION-UTILISATEUR.md.
- `consulterAide` → accès direct via l'onglet Aide dans la nav, pas besoin de wrapper.

**Commit** : un commit par fonction migrée, ou un commit groupé par famille.

### Phase 3 — Retrait physique des modules primo

- Suppression de `js/primo-accueil.js`
- Suppression de `js/primo-modal.js`
- Suppression de `js/primo-questions.js`, `js/primo-validation-champs.js` (s'il existent encore)
- Retrait des `<script src>` correspondants dans `index.html`
- Retrait de tout CSS primo spécifique dans `styles.css` si orphelin confirmé

**Commit** : suppression des fichiers + retrait des includes.

### Phase 4 — Retrait du tutoriel interactif

- Audit de `js/tutoriel-interactif.js` — s'il est redondant avec tour guidé 6 étapes, suppression
- S'il a une fonctionnalité unique (introspection de la démo, par exemple), migration vers tour guidé ou accueil V3
- Retrait du `<script src>` et CSS associé

**Commit** : analogue à Phase 3.

### Phase 5 — Simplification de parcours-apprentissage.js

- Audit des modules qu'il orchestre
- Les modales qu'il crée réutilisent le CSS `.modal-bienvenue-*` — à évaluer si ces flows sont encore pertinents
- Simplification ou suppression selon l'audit

**Commit** : à dimensionner selon le périmètre.

### Phase 6 — Nettoyage des préférences et flags

- Retrait des preferences spécifiques aux modules supprimés (dans `preferences.js` DEFAUTS)
- Migration silencieuse idempotente au démarrage pour nettoyer les flags localStorage des anciens utilisateurs (ici : toi et tes backups Codex)

**Commit** : changement dans preferences.js + flag de migration.

### Phase 7 — Nettoyage CSS orphelin

- Recensement des sélecteurs CSS devenus morts après le retrait
- `.modal-bienvenue-*` en particulier — si parcours-apprentissage.js est simplifié au point de ne plus les utiliser, suppression
- Autres classes `.primo-*`, `.wizard-*`, etc.

**Commit** : nettoyage CSS.

### Phase 8 — Documentation

- Mise à jour `SESSION.md`
- Mise à jour de la mémoire projet
- Retrait du fichier `docs/AUDIT-ONBOARDING-21-AVRIL.md` (document temporaire)
- Ajout explicite du **principe directeur « stabilité zéro-dette »** à `CLAUDE.md` pour qu'il soit rappelé dans chaque future session
- Guide dans Aide si des chemins d'entrée ont changé

**Commit** : docs.

---

## 5. Critères d'acceptation

Sur iPad Safari et Mac Safari, mode clair et sombre :

1. Au 1er démarrage d'une installation vierge : **un seul** écran d'onboarding apparaît — l'accueil V3. Aucune modale de type Primo, tutoriel interactif ou parcours modulaire ne s'affiche.
2. Toutes les fonctionnalités conservées (Codex, pratique de notation, démo, aide) sont accessibles depuis l'accueil V3 ou la barre de navigation principale, sans wrapper legacy.
3. Aucun fichier JS, CSS ou data-action orphelin ne subsiste dans le code.
4. Le principe directeur « stabilité zéro-dette » est inscrit dans CLAUDE.md.
5. Aucune régression fonctionnelle : les données utilisateur existantes (trimestres, cours, grilles, etc.) restent intactes, les flows Réglages/Structure/Évaluations/Suivi fonctionnent comme avant.
6. La console ne jette aucune erreur liée à des fonctions manquantes après le nettoyage.

---

## 6. Risques

- **Appels cachés via `data-action` dans l'HTML** : un bouton HTML quelque part peut référencer `primo.XXX` sans que le grep sur le JS ne le capture directement. **Défense** : grep multi-pattern dans Phase 1 incluant `data-action=` dans tous les `.html`.
- **Fonctions métier cachées dans les modules supprimés** : ex. un algo de validation spécifique qui vivrait dans `primo-validation-champs.js`. **Défense** : audit ligne par ligne de chaque fichier avant suppression.
- **Migration rate de flags** : toi, développeur, as des flags posés par l'ancien système. **Défense** : script de migration au démarrage, idempotent, silencieux.
- **Perte de fonctionnalité** : si on supprime trop agressivement et qu'une fonctionnalité utile disparaît, il faudra la réimplémenter. **Défense** : Phase 1 audit exhaustif, décisions A/B/C explicites avant toute suppression.

---

## 7. Hors périmètre

- **Nouveaux flows d'onboarding** : ce chantier est un nettoyage, pas une création. Les nouveaux flows viendront des plans PLAN-AUTONOMISATION-UTILISATEUR.md et PLAN-PARTAGE-RESSOURCES.md.
- **Refonte de l'accueil V3** : il reste l'unique point d'entrée, mais son design actuel n'est pas modifié ici.
- **Tour guidé** : reste intact dans ce chantier (géré par PLAN-AUTONOMISATION-UTILISATEUR.md).

---

## 8. Lien avec les autres plans

- **PLAN-AUTONOMISATION-UTILISATEUR.md** : certaines fonctionnalités actuellement dans Primo (ex. `demarrerCreationMateriel`) seront **remplacées** par le mode « prendre comme modèle » décrit dans ce plan. Ordre logique : ce plan de consolidation d'abord (nettoie le legacy), puis PLAN-AUTONOMISATION peut construire sur un socle propre.
- **PLAN-PARTAGE-RESSOURCES.md** : pas d'interaction directe.

---

## Suivi du chantier

| Phase | État | Commit | Notes |
|---|---|---|---|
| Phase 1 — Audit exhaustif | ✅ Livré | `cfee015` (audit dans le commit Phase 3) | docs/AUDIT-ONBOARDING-21-AVRIL.md (retiré Phase 8) |
| Phase 2 — Migration appels valides | ✅ Sans objet | — | Audit Phase 1 a établi qu'aucun caller externe ne survit (suppression atomique possible) |
| Phase 3 — Retrait primo-* | ✅ Livré | `cfee015` | 4 fichiers (~5700 l.) + dead code main.js + db.js SSOT |
| Phase 4 — Retrait tutoriel-interactif | ✅ Livré | `337855b` | 530 l. + bloc défensif navigation.js |
| Phase 5A — Suppression parcours-apprentissage | ✅ Livré | `f796d93` | 1280 l. + carte Réglages + 5 call-sites |
| Phase 6 — Nettoyage préfs et flags | ✅ Livré | `2dc86e1` | Migration silencieuse v6.21 dans main.js (db-ready) |
| Phase 7 — Nettoyage CSS orphelin | ✅ Livré | `dbbb72e` | ~575 l. styles.css (.primo-champ, .modal-bienvenue, .parcours-*) |
| Phase 8 — Documentation + CLAUDE.md | ✅ Livré | (ce commit) | Principe zéro-dette inscrit dans CLAUDE.md |

**Total retiré** : ~5750 l. JS + ~75 l. HTML + ~575 l. CSS = **~6400 lignes**.
