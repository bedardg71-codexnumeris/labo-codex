# 📚 Index de la documentation - Monitorage v6

**Projet** : Système de Monitorage Pédagogique
**Version** : Beta 0.71 - Refonte modulaire
**Date** : 23 octobre 2025
**Responsable** : Grégoire Bédard

---

## 🎯 Vue d'ensemble

Cette documentation complète couvre **tous les aspects** de l'application de monitorage pédagogique :
- **23 modules JavaScript** (21 chargés + 2 utilitaires)
- **1 fichier HTML** principal (3351 lignes)
- **1 fichier CSS** (1472 lignes)
- **1 registre JSON** des noms protégés

**Total documenté** : ~25 000 lignes de code

---

## 📂 Structure de la documentation

### Documents principaux

| Fichier | Description | Lignes |
|---------|-------------|--------|
| [CLAUDE.md](CLAUDE.md) | Instructions projet, architecture, conventions | 217 |
| [README_PROJET.md](README_PROJET.md) | Vue d'ensemble du projet | - |
| [COLLAB_RULES.txt](COLLAB_RULES.txt) | Règles de collaboration | - |
| [structure-modulaire.txt](structure-modulaire.txt) | Architecture modulaire | - |
| **[DOC_INDEX.md](DOC_INDEX.md)** | **Ce fichier - Index complet** | - |

---

## 🔧 Architecture et configuration

### HTML et CSS

| Document | Type | Lignes | Description |
|----------|------|--------|-------------|
| [DOC_index-71.md](DOC_index-71.md) | HTML | 3351 | Point d'entrée, structure complète de l'application |
| [DOC_styles.css](DOC_styles.css) | CSS | 1472 | Système de design, variables, composants |
| [DOC_NOMS_STABLES.json](DOC_NOMS_STABLES.json) | JSON | 217 | Registre des noms protégés (IDs, classes, fonctions) |

---

## 📦 Modules JavaScript par catégorie

### 🔵 CONFIGURATION (2 modules)

| Module | Type | Lignes | Rôle | Documentation |
|--------|------|--------|------|---------------|
| config.js | CONFIG | 128 | Variables globales, configuration navigation | [DOC_config.js](DOC_config.js) |
| navigation.js | CONFIG | 375 | Gestion navigation sections/sous-sections | [DOC_navigation.js](DOC_navigation.js) |

---

### 🟢 MODULES SOURCES (générateurs de données)

Ces modules **génèrent et stockent** les données dans localStorage. Ce sont les **sources uniques de vérité**.

| Module | Génère | Lignes | Description | Documentation |
|--------|--------|--------|-------------|---------------|
| trimestre.js | `calendrierComplet` | 605 | Calendrier scolaire complet (124 jours) | [DOC_trimestre.js](DOC_trimestre.js) |
| saisie-presences.js | `presences`, `indicesAssiduiteDetailles` | 631 | Saisie présences + calcul indice A | [DOC_saisie-presences.js](DOC_saisie-presences.js) |
| productions.js | `listeGrilles` ⚠️ | 873 | Productions/évaluations (nom historique trompeur) | [DOC_productions.js](DOC_productions.js) |
| grilles.js | `grillesTemplates` | 505 | Grilles de critères SRPNF | [DOC_grilles.js](DOC_grilles.js) |
| echelles.js | `echellesTemplates` | 327 | Échelles de performance SOLO/IDME | [DOC_echelles.js](DOC_echelles.js) |
| cartouches.js | `cartouchesTemplates` | 180 | Cartouches de rétroaction | [DOC_cartouches.js](DOC_cartouches.js) |
| horaire.js | `seancesHoraire` | 245 | Horaire des séances | [DOC_horaire.js](DOC_horaire.js) |
| groupe.js | `groupeEtudiants` | 412 | Liste des étudiants | [DOC_groupe.js](DOC_groupe.js) |
| cours.js | `informationsCours` | 142 | Informations du cours | [DOC_cours.js](DOC_cours.js) |
| pratiques.js | `modalitesEvaluation` | 505 | Pratiques de notation PAN | [DOC_pratiques.js](DOC_pratiques.js) |

⚠️ **Note** : `listeGrilles` est un nom historique. Cette clé stocke les **PRODUCTIONS**, pas les grilles de critères.

---

### 🔵 MODULES LECTEURS (consommateurs de données)

Ces modules **lisent** les données générées par les modules sources et les **affichent**.

| Module | Lit | Lignes | Description | Documentation |
|--------|-----|--------|-------------|---------------|
| calendrier-vue.js | `calendrierComplet` | 248 | Affichage visuel du calendrier | [DOC_calendrier-vue.js](DOC_calendrier-vue.js) |
| tableau-bord-apercu.js | `indicesAssiduiteDetailles` | 380 | Tableau de bord avec métriques | [DOC_tableau-bord-apercu.js](DOC_tableau-bord-apercu.js) |

---

### 🟣 MODULES HYBRID (SOURCE + LECTEUR + AFFICHAGE)

Ces modules combinent plusieurs rôles : ils génèrent des données ET les affichent.

| Module | Génère | Lit | Lignes | Description | Documentation |
|--------|--------|-----|--------|-------------|---------------|
| evaluation.js | `evaluationsSauvegardees`, `indicesEvaluation` | productions, grilles, echelles | 1749 | Évaluations individuelles | [DOC_evaluation.js](DOC_evaluation.js) |
| liste-evaluations.js | `indicesEvaluation.completion` | evaluations, productions | 631 | Liste évaluations + calcul indice C | [DOC_liste-evaluations.js](DOC_liste-evaluations.js) |
| portfolio.js | `portfoliosEleves` | productions, evaluations | 280 | Portfolio + sélection artefacts | [DOC_portfolio.js](DOC_portfolio.js) |
| profil-etudiant.js | ⚠️ Doublon | Toutes sources | 1218 | Profil complet étudiant | [DOC_profil-etudiant.js](DOC_profil-etudiant.js) |
| etudiants.js | - | groupeEtudiants | 163 | Liste étudiants | [DOC_etudiants.js](DOC_etudiants.js) |

⚠️ **Doublon** : `profil-etudiant.js` contient des fonctions dupliquées avec `portfolio.js` (lignes 435-633)

---

### 🟡 MODULES SYSTÈME (infrastructure critique)

| Module | Type | Lignes | Description | Documentation |
|--------|------|--------|-------------|---------------|
| modes.js | SYSTÈME | 605 | 3 modes (Normal, Simulation, Anonymisation) | [DOC_modes.js](DOC_modes.js) |
| main.js | INITIALISATION | 224 | Point d'entrée, initialisation de tous les modules | [DOC_main.js](DOC_main.js) |

---

### 🔧 MODULES UTILITAIRES

| Module | Type | Lignes | Description | Documentation |
|--------|------|--------|-------------|---------------|
| import-export.js | UTILITAIRE | 245 | Import/export JSON, backup | [DOC_import-export.js](DOC_import-export.js) |
| statistiques.js | UTILITAIRE | 180 | Calculs statistiques | [DOC_statistiques.js](DOC_statistiques.js) |
| ~~notation.js~~ | ~~DOUBLON~~ | ~~327~~ | **SUPPRIMÉ** - Doublon de pratiques.js | ❌ Supprimé le 23 oct 2025 |

---

## 📊 Statistiques globales

### Par type de module

| Type | Nombre | Lignes totales |
|------|--------|----------------|
| CONFIGURATION | 2 | 503 |
| SOURCE | 10 | 4425 |
| LECTEUR | 2 | 628 |
| HYBRID | 5 | 4041 |
| SYSTÈME | 2 | 829 |
| UTILITAIRE | 2 | 425 |
| **TOTAL** | **23** | **~10 851** |

### Par fonctionnalité

| Fonctionnalité | Modules concernés | Total lignes |
|----------------|-------------------|--------------|
| Navigation | config, navigation, main | 727 |
| Calendrier/Présences | trimestre, calendrier-vue, saisie-presences, horaire | 1729 |
| Évaluations | productions, grilles, echelles, cartouches, evaluation, liste-evaluations, portfolio | 4650 |
| Étudiants | groupe, etudiants, profil-etudiant | 1793 |
| Configuration | cours, pratiques, modes | 1252 |
| Utilitaires | import-export, statistiques | 425 |

---

## ⚠️ Problèmes connus documentés

### 🔴 Critiques (à résoudre en priorité)

| # | Problème | Impact | Fichiers concernés | Documentation |
|---|----------|--------|-------------------|---------------|
| 1 | **Doublon profil-etudiant.js vs portfolio.js** | Code dupliqué (150+ lignes), maintenance difficile | profil-etudiant.js (435-633), portfolio.js | [DOC_profil-etudiant.js](DOC_profil-etudiant.js) §8.1 |
| 2 | **Nom trompeur `listeGrilles`** | Confusion, stocke les PRODUCTIONS pas les grilles | productions.js, NOMS_STABLES.json | [DOC_NOMS_STABLES.json](DOC_NOMS_STABLES.json) §5.1 |
| 3 | **Indice P (Performance) pas calculé** | Fonctionnalité manquante selon CLAUDE.md | portfolio.js | [DOC_portfolio.js](DOC_portfolio.js) §10 |

### 🟡 Modérés (amélioration code)

| # | Problème | Impact | Fichiers concernés | Documentation |
|---|----------|--------|-------------------|---------------|
| 4 | Animation `slideDown` dupliquée | Maintenance, poids CSS | styles.css (510-520, 690-699) | [DOC_styles.css](DOC_styles.css) §10.1 |
| 5 | CSS embarqué dupliqué dans HTML | Maintenance, incohérence possible | index 71, styles.css | [DOC_index-71.md](DOC_index-71.md) §7.1 |
| 6 | Variables CSS non utilisées | Code mort | styles.css | [DOC_styles.css](DOC_styles.css) §10.3 |
| 7 | Doublon `listeEtudiants` vs `groupeEtudiants` | Confusion | config.js, groupe.js | [DOC_NOMS_STABLES.json](DOC_NOMS_STABLES.json) §5.2 |
| 8 | Clés échelles multiples mal documentées | Confusion (4 clés différentes) | echelles.js | [DOC_NOMS_STABLES.json](DOC_NOMS_STABLES.json) §5.3 |

### 🟢 Mineurs (cosmétique)

| # | Problème | Impact | Fichiers concernés |
|---|----------|--------|-------------------|
| 9 | Code mort dans evaluation.js | Lignes dupliquées | evaluation.js (314-335, 791-803, etc.) |
| 10 | Code mort dans modes.js | Fonctions dupliquées | modes.js (465-547, 574-601) |
| 11 | Section Étudiants manquante | Incohérence documentation | index 71, NOMS_STABLES.json |

---

## ✅ Problèmes résolus

| Date | Problème | Solution | Documentation |
|------|----------|----------|---------------|
| 23 oct 2025 | **notation.js doublon de pratiques.js** | Supprimé notation.js (327 lignes) et 2 initialisations dans main.js | Session de documentation |

---

## 🗺️ Roadmap et prochaines étapes

### Phase 1 : Nettoyage du code (1-2 jours)

- [ ] **Supprimer doublon profil-etudiant.js** (lignes 435-633)
  - Faire appeler portfolio.js au lieu de dupliquer
  - Tester profil étudiant
  - Commit

- [ ] **Nettoyer styles.css**
  - Supprimer animation `slideDown` dupliquée
  - Commenter variables CSS non utilisées
  - Supprimer CSS embarqué dans index 71 (si redondant)

- [ ] **Clarifier noms localStorage**
  - Ajouter commentaires `⚠️ NOM HISTORIQUE` pour `listeGrilles`
  - Documenter usage exact des 4 clés échelles
  - Supprimer `listeEtudiants` si non utilisé

### Phase 2 : Fonctionnalités manquantes (2-3 jours)

- [ ] **Implémenter calcul indice P**
  - Créer fonction `calculerIndicePerformance()` dans portfolio.js
  - Générer clé `indicesCP` avec structure `{da: {indiceC, indiceP}}`
  - Intégrer au profil étudiant
  - Tester calcul de risque complet : `R = 1 - (A × C × P)`

- [ ] **Refondre horaire.js**
  - Générer `seancesCompletes` comme source unique
  - Gérer reprises (ex: "Horaire du lundi" le jeudi)
  - API : `obtenirSeancesCompletes()`

### Phase 3 : Tests et validation (1 jour)

- [ ] **Créer scripts de test**
  - Script validation architecture
  - Script vérification NOMS_STABLES.json
  - Tests fonctionnels (navigation, saisie, calculs)

- [ ] **Tests cross-browser**
  - Safari (macOS, iOS)
  - Chrome (macOS, Windows)
  - Firefox

### Phase 4 : Documentation utilisateur (1 jour)

- [ ] **Guide utilisateur**
  - Guide de démarrage rapide
  - Tutoriels vidéo (optionnel)
  - FAQ

- [ ] **README complet**
  - Installation
  - Utilisation
  - Architecture
  - Contribution

---

## 📖 Comment utiliser cette documentation

### Pour comprendre un module

1. Consulter [DOC_INDEX.md](DOC_INDEX.md) (ce fichier)
2. Trouver le module dans les tableaux ci-dessus
3. Cliquer sur le lien de documentation
4. Lire les sections 1-4 (Vue d'ensemble, Type, Données, API)

### Pour modifier un module

1. Lire **section 9 - Règles de modification** de la documentation du module
2. Vérifier [NOMS_STABLES.json](DOC_NOMS_STABLES.json) pour les noms protégés
3. Vérifier [CLAUDE.md](CLAUDE.md) pour les conventions
4. Suivre le workflow : AVANT → PENDANT → APRÈS

### Pour déboguer

1. Lire **section 8 - Problèmes connus** de la documentation du module
2. Consulter **section 7 - Tests et vérification** pour les diagnostics
3. Utiliser les scripts de diagnostic fournis dans la doc

### Pour ajouter une fonctionnalité

1. Identifier le module concerné (SOURCE, LECTEUR, HYBRID?)
2. Vérifier les dépendances dans **section 5**
3. Respecter l'architecture "Single Source of Truth"
4. Mettre à jour NOMS_STABLES.json si nouveaux noms publics

---

## 🔍 Navigation rapide

### Par ordre alphabétique

- [cartouches.js](DOC_cartouches.js)
- [config.js](DOC_config.js)
- [cours.js](DOC_cours.js)
- [echelles.js](DOC_echelles.js)
- [etudiants.js](DOC_etudiants.js)
- [evaluation.js](DOC_evaluation.js)
- [grilles.js](DOC_grilles.js)
- [groupe.js](DOC_groupe.js)
- [horaire.js](DOC_horaire.js)
- [import-export.js](DOC_import-export.js)
- [index 71 (refonte des modules).html](DOC_index-71.md)
- [liste-evaluations.js](DOC_liste-evaluations.js)
- [main.js](DOC_main.js)
- [modes.js](DOC_modes.js)
- [navigation.js](DOC_navigation.js)
- [NOMS_STABLES.json](DOC_NOMS_STABLES.json)
- [portfolio.js](DOC_portfolio.js)
- [pratiques.js](DOC_pratiques.js)
- [productions.js](DOC_productions.js)
- [profil-etudiant.js](DOC_profil-etudiant.js)
- [saisie-presences.js](DOC_saisie-presences.js)
- [statistiques.js](DOC_statistiques.js)
- [styles.css](DOC_styles.css)
- [tableau-bord-apercu.js](DOC_tableau-bord-apercu.js)
- [trimestre.js](DOC_trimestre.js)
- [calendrier-vue.js](DOC_calendrier-vue.js)

### Par ordre de chargement (index 71)

1. [config.js](DOC_config.js) - Configuration
2. [navigation.js](DOC_navigation.js) - Navigation
3. [trimestre.js](DOC_trimestre.js) - Calendrier
4. [tableau-bord-apercu.js](DOC_tableau-bord-apercu.js) - Tableau de bord
5. [etudiants.js](DOC_etudiants.js) - Étudiants
6. [productions.js](DOC_productions.js) - Productions
7. [grilles.js](DOC_grilles.js) - Grilles
8. [echelles.js](DOC_echelles.js) - Échelles
9. [cartouches.js](DOC_cartouches.js) - Cartouches
10. [cours.js](DOC_cours.js) - Cours
11. [calendrier-vue.js](DOC_calendrier-vue.js) - Vue calendaire
12. [saisie-presences.js](DOC_saisie-presences.js) - Saisie présences
13. [horaire.js](DOC_horaire.js) - Horaire
14. [groupe.js](DOC_groupe.js) - Groupe
15. [pratiques.js](DOC_pratiques.js) - Pratiques
16. [import-export.js](DOC_import-export.js) - Import/Export
17. [statistiques.js](DOC_statistiques.js) - Statistiques
18. [profil-etudiant.js](DOC_profil-etudiant.js) - Profil
19. [liste-evaluations.js](DOC_liste-evaluations.js) - Liste évaluations
20. [modes.js](DOC_modes.js) - Modes
21. [evaluation.js](DOC_evaluation.js) - Évaluation
22. [portfolio.js](DOC_portfolio.js) - Portfolio
23. [main.js](DOC_main.js) - Initialisation

---

## 📞 Support et ressources

### Ressources pédagogiques

- **Labo Codex** : https://codexnumeris.org/apropos
- **Revue Pédagogie collégiale** : Printemps-été 2024, hiver 2025
- **Guide de monitorage complet** : Grégoire Bédard

### Licence

**Creative Commons BY-NC-SA 4.0**
- ✅ Partage et adaptation autorisés (usage non commercial)
- ✅ Attribution requise
- ✅ Redistribution sous même licence

### Contact

**Responsable** : Grégoire Bédard
**Projet** : Système de Monitorage Pédagogique
**Version** : Beta 0.71 - Refonte modulaire

---

**Dernière mise à jour de cet index** : 23 octobre 2025
**Total de fichiers documentés** : 26 fichiers
**Total de lignes documentées** : ~25 000 lignes
