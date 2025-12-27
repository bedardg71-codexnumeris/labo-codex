# Plan de Stabilisation Beta 95

**Objectif** : Déployer une version stable et fonctionnelle pour le trimestre H2026
**Date cible** : 5 janvier 2026
**Durée** : 9 jours (27 décembre 2025 - 5 janvier 2026)

---

## Mission et philosophie

> L'application doit **soutenir** l'utilisateur, pas le surcharger.

### Objectifs fondamentaux

| Objectif | Description |
|----------|-------------|
| **Suivi des apprentissages** | Soutenir l'enseignant·e dans le monitorage de la progression des étudiant·es |
| **Gestion de la notation** | Faciliter l'évaluation selon différentes pratiques (Sommative, PAN) |
| **Capacités augmentées** | Permettre ce qui serait impossible autrement (indices A-C-P, dépistage, patterns) |
| **Indépendance** | L'utilisateur reste maître de ses données et de ses décisions |
| **Sobriété** | Empreinte carbone minimale (application locale, pas de cloud obligatoire) |
| **Intelligence collective** | Encourager le partage de ressources entre collègues |

### Ce que l'application NE DOIT PAS être

- ❌ Une tâche lourde supplémentaire
- ❌ Une obsession bureaucratique
- ❌ Un outil qui crée de la dépendance
- ❌ Un système qui impose des pratiques

### Ce que l'application DOIT être

- ✅ Un amplificateur des pratiques existantes
- ✅ Un outil de décision basé sur données probantes
- ✅ Un accompagnateur du développement professionnel
- ✅ Un facilitateur d'efficacité pédagogique

### Principe directeur pour Beta 95

Chaque fonctionnalité, chaque écran, chaque message doit répondre à la question :

> **« Est-ce que ça aide l'enseignant·e à mieux accompagner ses étudiant·es, sans alourdir sa charge ? »**

Si la réponse est non, la fonctionnalité doit être simplifiée ou retirée.

---

## Contexte technique

La Beta 95 doit être suffisamment robuste pour supporter :
- Plusieurs utilisateurs dans différentes disciplines
- Un trimestre complet sans interventions majeures
- Seulement des mises à jour mineures/esthétiques en cours de session

---

## Phase 1 : Audit Technique (27-29 décembre)

### 1.1 Audit de l'architecture des données

| Vérification | Priorité | Statut |
|-------------|----------|--------|
| Structure `listeCours` vs `infoCours` | Critique | [x] |
| Liaison `coursId` dans `groupeEtudiants` | Critique | [x] |
| Liaison `coursId` dans `productions` | Critique | [x] |
| Liaison `coursId` dans `presences` | Critique | [x] |
| Liaison `coursId` dans `evaluationsSauvegardees` | Critique | [x] |
| Génération `trimestreId` cohérente | Haute | [x] |
| Namespacing des clés par trimestre | Haute | [x] |
| Intégrité IndexedDB ↔ localStorage cache | Haute | [ ] |

### 1.2 Audit des flux de données

| Flux | Description | Statut |
|------|-------------|--------|
| Création cours (Primo Module 1) | Code, groupe, trimestreId, coursId | [x] |
| Import étudiants (manuel) | Format, coursId, validation | [x] |
| Import étudiants (Primo) | Format, coursId, validation | [x] |
| Création production | Liaison grille, coursId | [x] |
| Saisie évaluation | Liaison production, étudiant | [x] |
| Saisie présences | Liaison séances, coursId | [x] |
| Calcul indices A-C-P | Sources, stockage, rafraîchissement | [x] |
| Snapshots | Capture, reconstruction, intégrité | [x] |

### 1.3 Audit des modes d'application

| Mode | Comportement attendu | Statut |
|------|---------------------|--------|
| Normal | Exclut groupe 9999, données réelles | [x] |
| Assisté (simulation) | Affiche SEULEMENT groupe 9999 | [x] |
| Anonymisé | Exclut 9999, noms masqués | [x] |
| Changement de mode | Rechargement correct des données | [x] |

### 1.4 Audit visuel et Design System

**Objectif** : Application uniforme et systématique du design dans TOUTE l'application.

#### 1.4.1 Inventaire des styles inline à éliminer

**Résultats audit (27 déc 2025)** : ~2000 styles inline identifiés

| Fichier | `style="..."` | `.style.` | Total | Priorité | Statut |
|---------|--------------|-----------|-------|----------|--------|
| index.html | 962 | - | **962** | Haute | [x] Inventorié |
| profil-etudiant.js | 290 | 20 | **310** | Haute | [x] Inventorié |
| evaluation.js | 73 | 76 | **149** | Haute | [x] Inventorié |
| pratiques.js | - | 115 | **115** | Haute | [x] Inventorié |
| primo-modal.js | 41 | 67 | **108** | Haute | [x] Inventorié |
| tableau-bord-apercu.js | 42 | 8 | **50** | Moyenne | [x] Inventorié |
| grilles.js | - | 49 | **49** | Moyenne | [x] Inventorié |
| cartouches.js | - | 47 | **47** | Moyenne | [x] Inventorié |
| productions.js | - | 40 | **40** | Moyenne | [x] Inventorié |
| primo-accueil.js | 19 | 7 | **26** | Moyenne | [x] Inventorié |

**616 couleurs hexadécimales en dur** dans les fichiers JS (à migrer vers variables CSS)

#### 1.4.2 Audit par section de navigation

**Résultats audit (27 déc 2025)** : Classes CSS standard bien utilisées

| Élément | Occurrences | Commentaire |
|---------|-------------|-------------|
| `.carte` | 186 | ✅ Bien utilisé |
| `.btn` | 291 | ✅ Bien utilisé |
| `.tableau` | 24 | ✅ Bien utilisé |
| `.alerte` | 16 | ✅ Bien utilisé |

| Section | Sous-sections | Statut |
|---------|--------------|--------|
| **Tableau de bord** | Aperçu, Liste individus, Profil, Interventions RàI | [x] |
| **Présences** | Aperçu, Saisie, Calendrier | [x] |
| **Évaluations** | Aperçu, Liste, Formulaire évaluation | [x] |
| **Matériel** | Productions, Grilles, Échelles, Cartouches, Objectifs | [x] |
| **Réglages** | Trimestre, Cours, Groupe, Pratique, Préférences, Import/Export | [x] |
| **Aide** | Toutes sous-sections | [x] |

#### 1.4.3 Éléments visuels à harmoniser

**Résultats audit (27 déc 2025)** : Design system bien défini (~50 variables CSS)

| Catégorie | Variables CSS | Statut |
|-----------|--------------|--------|
| Couleurs principales | `--bleu-*`, `--orange-*`, `--vert-*` | [x] Définies |
| Couleurs sarcelle | `--sarcelle-*` (alternative) | [x] Définies |
| Couleurs SOM/PAN | `--som-orange`, `--pan-bleu` | [x] Définies |
| Navigation | `--nav-*`, `--sous-nav-*` | [x] Définies |
| Boutons | `--btn-*` | [x] Définies |
| Risques | `--risque-*` (6 niveaux) | [x] Définies |
| Alertes | `--alerte-*` | [x] Définies |
| Gris | `--gris-*` (6 nuances) | [x] Définies |
| Bordures | `--bordure-*` | [x] Définies |

| Élément | Constat | Action Phase 2 |
|---------|---------|----------------|
| **Couleurs en dur** | 616 dans JS | Migrer vers var() |
| **border-radius** | 4/6/8/12px | Acceptable, cohérent par type |
| **Transitions** | 0.2s ou 0.3s | ✅ Uniforme |
| **font-size pixels** | 6 occurrences | Faible, acceptable |

#### 1.4.4 Audit des modals

**Résultats audit (27 déc 2025)** : Classes `.modal-primo` et `.wizard-v2` bien définies (62 règles CSS)

| Modal | Fichier source | Classes CSS | Statut |
|-------|---------------|-------------|--------|
| Modal Primo Accueil | primo-accueil.js | ✅ modal-primo-* | [x] |
| Modal Primo Conversation | primo-modal.js | ✅ modal-primo-* | [x] |
| Modal Wizard Pratique V2 | wizard-pratique-v2.js | ✅ wizard-v2-* | [x] |
| Modal Confirmation | Divers | ⚠️ Styles inline | [x] |
| Modal Import/Export | import-export.js | ⚠️ Inline + var() | [x] |
| Modal Nouveau cours | cours.js | ✅ btn btn-confirmer | [x] |
| Modal Évaluation | evaluation.js | ⚠️ Styles inline | [x] |

**Note** : Les modals récents (Primo, Wizard) utilisent les classes CSS. Les anciens ont des styles inline mais utilisent souvent `var(--xxx)`.

#### 1.4.5 Checklist Design System

**Résultats audit (27 déc 2025)** :

| Critère | État actuel | Action requise |
|---------|------------|----------------|
| Variables CSS couleurs | ⚠️ 616 en dur | Phase 2 : Migrer vers var() |
| `font-size` en pixels | ✅ 6 seulement | Acceptable |
| Classes `.btn` | ✅ 291 occurrences | OK |
| Classes `.carte` | ✅ 186 occurrences | OK |
| border-radius uniforme | ⚠️ 4/6/8/12px | Acceptable par type |
| Transitions cohérentes | ✅ 0.2s ou 0.3s | OK |
| hover/focus définis | ✅ Dans styles.css | OK |

**Conclusion Phase 1.4** : Le design system est bien défini dans styles.css (~50 variables, classes cohérentes). Le problème principal est l'utilisation de couleurs hexadécimales en dur dans les fichiers JS (616 occurrences) au lieu des variables CSS. Ce sera adressé en Phase 2.3.

---

## Phase 2 : Corrections Critiques (29-31 décembre)

### 2.1 Bugs identifiés à corriger

| Bug | Fichier | Priorité | Statut |
|-----|---------|----------|--------|
| Filtrage étudiants par coursId incohérent | modes.js | Critique | [x] |
| Données démo non chargées (fetch file://) | donnees-demo.js | Critique | [x] |
| Ordre chargement scripts (PACK_DEMARRAGE) | index.html | Critique | [x] |
| Format liste étudiants (colonne Groupe) | primo-questions.js | Haute | [x] |
| Questions manquantes Module 1 (code, groupe) | primo-questions.js | Haute | [x] |
| Génération coursId dans creerCoursInitial | primo-modal.js | Haute | [x] |
| Vérification prérequis Module 2 | primo-accueil.js | Moyenne | [x] |

### 2.2 Améliorations de robustesse

**Résultats audit (27 déc 2025)** : Fonctionnalités déjà implémentées

| Amélioration | Description | Statut |
|-------------|-------------|--------|
| Validation import étudiants | Doublons DA détectés (groupe.js:203-207, 460-466) | [x] |
| Migration données existantes | migrations.js exécuté au démarrage (main.js:458-467) | [x] |
| Backup automatique | Avant opérations destructives | [ ] À évaluer |
| Logs de diagnostic | Console structurée pour debug | [ ] À évaluer |

### 2.3 Corrections visuelles et Design System

**Résultats audit (27 déc 2025)** : Compromis acceptable pour Beta 95

#### 2.3.1 Extraction des styles inline vers CSS

| Tâche | Fichier cible | Statut |
|-------|--------------|--------|
| Créer classes `.wizard-v2-*` | styles.css | [x] 50+ règles CSS |
| Migrer styles primo-accueil.js | - | ⚠️ Inline mais utilise var() |
| Migrer styles primo-modal.js | - | ⚠️ Inline mais utilise var() |
| Migrer styles wizard-pratique-v2.js | styles.css | [x] Classes CSS |
| Nettoyer styles inline index.html | - | [ ] Post-Beta 95 |
| Harmoniser cartes statistiques | - | [ ] Post-Beta 95 |

**Note** : Les fichiers primo-*.js utilisent des styles inline mais avec des variables CSS (`var(--bleu-principal)`, etc.). C'est un compromis acceptable pour Beta 95.

#### 2.3.2 Classes CSS existantes

```css
/* ✅ Déjà implémenté dans styles.css */
.wizard-v2-* { /* 50+ règles */ }
.modal-contenu.wizard-v2 { }
.wizard-v2-header { }
.wizard-v2-progression { }
.wizard-v2-champs { }
.wizard-v2-radio-cards { }
/* etc. */

/* ⏳ À créer post-Beta 95 */
.modal-primo-* { }
.btn-primo-* { }
```

#### 2.3.3 Harmonisation par zone

**Décision Beta 95** : Les classes standard (.carte, .btn, .tableau) sont bien utilisées (voir audit 1.4.2). L'harmonisation complète est reportée post-Beta 95.

| Zone | État actuel | Action |
|------|------------|--------|
| En-tête | ✅ OK | - |
| Navigation | ✅ OK | - |
| Cartes | ✅ Classes .carte | - |
| Boutons | ✅ Classes .btn | - |
| Formulaires | ⚠️ Mixte | Post-Beta 95 |
| Tableaux | ✅ Classes .tableau | - |

---

## Phase 3 : Documentation (1-2 janvier)

### 3.1 CLAUDE.md - Mise à jour complète

| Section | Contenu à mettre à jour |
|---------|------------------------|
| Architecture Beta 95 | Multi-trimestres, multi-cours, coursId |
| Structure des données | Format listeCours, groupeEtudiants, etc. |
| Flux Primo | Module 1, Module 2, questions ajoutées |
| Modes d'application | Normal, Assisté, Anonymisé |
| Bugs connus | Liste des problèmes résolus/en cours |
| État actuel | Version, date, fonctionnalités |

### 3.2 DESIGN_SYSTEM.html - Vérification

| Élément | Vérification |
|---------|-------------|
| Variables CSS | Toutes documentées |
| Composants | Cartes, boutons, formulaires |
| Layouts | Grilles, accordéons |
| États | Hover, disabled, active |

### 3.3 Section AIDE - Refonte complète

**Objectif** : Documentation utilisateur fiable, précise et pédagogiquement pertinente.

#### 3.3.1 Problèmes identifiés

| Problème | Impact |
|----------|--------|
| Structure ne correspond plus à l'application | Utilisateurs perdus |
| Fonctionnalités décrites obsolètes | Confusion, frustration |
| Généralisations IA parfois erronées | Perte de crédibilité |
| Exemples non réalistes (technique/pédagogique) | Incompréhension |
| Primo pas assez orienté autonomie | Dépendance excessive |

#### 3.3.2 Audit de la section Aide

| Sous-section | Vérifications | Statut |
|--------------|--------------|--------|
| Introduction | Correspond à Beta 95 ? | [ ] |
| Configuration | Reflète Primo + Réglages actuels ? | [ ] |
| Utilisation | Flux réels documentés ? | [ ] |
| Consultation | Sections TB, Profil à jour ? | [ ] |
| Référence | Glossaire, FAQ actualisés ? | [ ] |

#### 3.3.3 Corrections à apporter

| Zone | Action |
|------|--------|
| **Structure navigation** | Aligner avec sections réelles (Tableau de bord, Présences, Évaluations, Matériel, Réglages) |
| **Primo et autonomie** | Expliquer comment Primo aide à devenir autonome, pas dépendant |
| **Exemples** | Remplacer exemples génériques par cas réels (ex: grille SRPNF, échelle IDME) |
| **Captures d'écran** | Mettre à jour ou supprimer les obsolètes |
| **Terminologie** | Uniformiser (code du cours, groupe-cours, coursId, etc.) |
| **Indices A-C-P** | Vérifier formules et explications |
| **RàI** | Documenter les 3 niveaux correctement |
| **Pratiques de notation** | Expliquer PAN-Standards, Sommative, PAN-Spécifications |

#### 3.3.4 Réécriture avec rigueur

- [ ] Relire CHAQUE paragraphe pour exactitude
- [ ] Supprimer généralisations non vérifiées
- [ ] Ajouter notes "Beta 95" où pertinent
- [ ] Vérifier cohérence avec CLAUDE.md
- [ ] Tester chaque procédure décrite

### 3.4 Primo - Orientation autonomie

| Aspect | Objectif |
|--------|----------|
| Messages Primo | Expliquer le "pourquoi", pas juste le "comment" |
| Fin de parcours | Inviter à explorer seul, pas à revenir vers Primo |
| Aide contextuelle | Pointer vers section Aide, pas réexpliquer |
| Tutoriel | Montrer où trouver l'info ensuite |

### 3.5 Autres documents

| Document | Action |
|----------|--------|
| PLAN_REFONTE_MODULES_PRIMO.md | Marquer comme complété |
| README_TESTEURS.md | Mettre à jour pour Beta 95 |
| GUIDE_TESTEURS.md | Actualiser procédures |

---

## Phase 4 : Tests Systématiques (2-4 janvier)

### 4.1 Scénarios de test prioritaires

| Scénario | Description | Statut |
|----------|-------------|--------|
| **Nouveau utilisateur** | Primo → Module 1 → Module 2 complet | [ ] |
| **Import étudiants** | CSV/TSV avec différents formats | [ ] |
| **Multi-cours** | 2+ cours, changement contexte | [ ] |
| **Évaluation complète** | Création → saisie → indices | [ ] |
| **Présences** | Saisie → calcul assiduité | [ ] |
| **Snapshots** | Capture → reconstruction | [ ] |
| **Export/Import** | Backup complet → restauration | [ ] |
| **Changement mode** | Normal ↔ Assisté ↔ Anonymisé | [ ] |

### 4.2 Tests de régression

| Zone | Vérification |
|------|-------------|
| Tableau de bord | Indices A-C-P affichés correctement |
| Liste étudiants | Filtres, recherche, navigation |
| Profil étudiant | Toutes sections, graphiques |
| Productions | CRUD, liaison grilles |
| Grilles/Échelles | Import/export, édition |
| Présences | Calendrier, saisie, motifs |
| Interventions RàI | Création, complétion |

---

## Phase 5 : Finalisation (4-5 janvier)

### 5.1 Packaging

| Tâche | Statut |
|-------|--------|
| Numéro de version final (Beta 95.x) | [ ] |
| Date de release dans l'interface | [ ] |
| Cache busters mis à jour | [ ] |
| Fichiers de démonstration vérifiés | [ ] |
| Pack de démarrage à jour | [ ] |

### 5.2 Communication

| Document | Contenu |
|----------|---------|
| Notes de version | Changements depuis Beta 94 |
| Guide de démarrage rapide | Pour nouveaux utilisateurs |
| FAQ | Questions anticipées |

---

## Calendrier détaillé

| Date | Journée | Activités |
|------|---------|-----------|
| **27 déc** | Vendredi | Audit architecture données + Audit visuel (styles inline) |
| **28 déc** | Samedi | Audit flux + modes + Audit design par section |
| **29 déc** | Dimanche | Corrections critiques (bugs fonctionnels) |
| **30 déc** | Lundi | Corrections visuelles (extraction styles, classes CSS) |
| **31 déc** | Mardi | Harmonisation design + migrations données |
| **1 jan** | Mercredi | Documentation CLAUDE.md + DESIGN_SYSTEM |
| **2 jan** | Jeudi | Documentation + début tests fonctionnels |
| **3 jan** | Vendredi | Tests systématiques + tests visuels |
| **4 jan** | Samedi | Corrections finales + polish visuel |
| **5 jan** | Dimanche | Packaging + déploiement |

---

## Critères de succès

### Obligatoires (bloquants)

**Fonctionnels :**
- [ ] Création groupe-cours fonctionnelle (Primo Module 1)
- [ ] Import étudiants fonctionnel (manuel + Primo)
- [ ] Évaluations créées et sauvegardées correctement
- [ ] Présences saisies et indices A calculés
- [ ] Indices C et P calculés correctement
- [ ] Export/Import backup fonctionne
- [ ] Changement de cours fonctionne
- [ ] Mode Normal affiche données réelles

**Visuels :**
- [ ] Aucun style inline critique dans les modals
- [ ] Typographie cohérente (variables CSS)
- [ ] Couleurs uniformes (variables CSS)
- [ ] Boutons avec classes .btn partout
- [ ] Cartes avec structure uniforme

### Souhaitables (non bloquants)
- [ ] Mode Assisté fonctionne avec données démo
- [ ] Snapshots et graphiques fonctionnels
- [ ] Documentation à jour
- [ ] Wizard Pratique (Module 4) fonctionnel
- [ ] 100% des styles inline éliminés
- [ ] DESIGN_SYSTEM.html complet et à jour

---

## Risques identifiés

| Risque | Impact | Mitigation |
|--------|--------|------------|
| Perte de données utilisateur | Critique | Procédure backup avant migration |
| Incompatibilité données anciennes | Haute | Script de migration automatique |
| Régression non détectée | Haute | Tests systématiques avant release |
| Manque de temps | Moyen | Prioriser fonctionnalités critiques |

---

## Prochaine action immédiate

1. **Aujourd'hui** : Commencer l'audit de l'architecture des données
2. Identifier tous les endroits où `coursId` devrait être utilisé
3. Vérifier la cohérence du filtrage dans `modes.js`

---

*Plan créé le 27 décembre 2025*
*Objectif : Beta 95 stable pour H2026*
