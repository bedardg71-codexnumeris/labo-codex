# Plan de Stabilisation Beta 95

**Objectif** : Déployer une version stable et fonctionnelle pour le trimestre H2026
**Date cible** : 5 janvier 2026
**Durée** : 9 jours (27 décembre 2025 - 5 janvier 2026)

---

## Contexte

La Beta 95 doit être suffisamment robuste pour supporter :
- Plusieurs utilisateurs dans différentes disciplines
- Un trimestre complet sans interventions majeures
- Seulement des mises à jour mineures/esthétiques en cours de session

---

## Phase 1 : Audit Technique (27-29 décembre)

### 1.1 Audit de l'architecture des données

| Vérification | Priorité | Statut |
|-------------|----------|--------|
| Structure `listeCours` vs `infoCours` | Critique | [ ] |
| Liaison `coursId` dans `groupeEtudiants` | Critique | [ ] |
| Liaison `coursId` dans `productions` | Critique | [ ] |
| Liaison `coursId` dans `presences` | Critique | [ ] |
| Liaison `coursId` dans `evaluationsSauvegardees` | Critique | [ ] |
| Génération `trimestreId` cohérente | Haute | [ ] |
| Namespacing des clés par trimestre | Haute | [ ] |
| Intégrité IndexedDB ↔ localStorage cache | Haute | [ ] |

### 1.2 Audit des flux de données

| Flux | Description | Statut |
|------|-------------|--------|
| Création cours (Primo Module 1) | Code, groupe, trimestreId, coursId | [ ] |
| Import étudiants (manuel) | Format, coursId, validation | [ ] |
| Import étudiants (Primo) | Format, coursId, validation | [ ] |
| Création production | Liaison grille, coursId | [ ] |
| Saisie évaluation | Liaison production, étudiant | [ ] |
| Saisie présences | Liaison séances, coursId | [ ] |
| Calcul indices A-C-P | Sources, stockage, rafraîchissement | [ ] |
| Snapshots | Capture, reconstruction, intégrité | [ ] |

### 1.3 Audit des modes d'application

| Mode | Comportement attendu | Statut |
|------|---------------------|--------|
| Normal | Exclut groupe 9999, données réelles | [ ] |
| Assisté (simulation) | Affiche SEULEMENT groupe 9999 | [ ] |
| Anonymisé | Exclut 9999, noms masqués | [ ] |
| Changement de mode | Rechargement correct des données | [ ] |

---

## Phase 2 : Corrections Critiques (29-31 décembre)

### 2.1 Bugs identifiés à corriger

| Bug | Fichier | Priorité | Statut |
|-----|---------|----------|--------|
| Filtrage étudiants par coursId incohérent | modes.js | Critique | [ ] |
| Données démo non chargées (fetch file://) | donnees-demo.js | Critique | [x] |
| Ordre chargement scripts (PACK_DEMARRAGE) | index.html | Critique | [x] |
| Format liste étudiants (colonne Groupe) | primo-questions.js | Haute | [x] |
| Questions manquantes Module 1 (code, groupe) | primo-questions.js | Haute | [x] |
| Génération coursId dans creerCoursInitial | primo-modal.js | Haute | [x] |
| Vérification prérequis Module 2 | primo-accueil.js | Moyenne | [x] |

### 2.2 Améliorations de robustesse

| Amélioration | Description | Priorité |
|-------------|-------------|----------|
| Validation import étudiants | Vérifier format, doublons DA | Haute |
| Migration données existantes | Ajouter coursId aux anciens étudiants | Haute |
| Backup automatique | Avant opérations destructives | Moyenne |
| Logs de diagnostic | Console structurée pour debug | Moyenne |

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

### 3.3 Autres documents

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
| **27 déc** | Vendredi | Audit architecture données |
| **28 déc** | Samedi | Audit flux + modes |
| **29 déc** | Dimanche | Début corrections critiques |
| **30 déc** | Lundi | Corrections + migrations |
| **31 déc** | Mardi | Finalisation corrections |
| **1 jan** | Mercredi | Documentation CLAUDE.md |
| **2 jan** | Jeudi | Documentation + début tests |
| **3 jan** | Vendredi | Tests systématiques |
| **4 jan** | Samedi | Tests + corrections finales |
| **5 jan** | Dimanche | Packaging + déploiement |

---

## Critères de succès

### Obligatoires (bloquants)
- [ ] Création groupe-cours fonctionnelle (Primo Module 1)
- [ ] Import étudiants fonctionnel (manuel + Primo)
- [ ] Évaluations créées et sauvegardées correctement
- [ ] Présences saisies et indices A calculés
- [ ] Indices C et P calculés correctement
- [ ] Export/Import backup fonctionne
- [ ] Changement de cours fonctionne
- [ ] Mode Normal affiche données réelles

### Souhaitables (non bloquants)
- [ ] Mode Assisté fonctionne avec données démo
- [ ] Snapshots et graphiques fonctionnels
- [ ] Documentation à jour
- [ ] Wizard Pratique (Module 4) fonctionnel

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
