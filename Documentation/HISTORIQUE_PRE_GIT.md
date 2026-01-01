# Historique pré-Git du Système de monitorage

Ce document retrace l'évolution de l'application avant son archivage dans Git (octobre 2025).

## Archéologie reconstituée

Les fichiers du répertoire `artefacts 1-95/` permettent de retracer l'évolution :

### Phase 1 : Version monolithique (septembre 2025)

| Date | Fichier | Taille | Description |
|------|---------|--------|-------------|
| 23 sept 2025 | `index3 copie 23-09-2025.html` | 117 KB | Version précoce, structure de base |
| 28 sept 2025 | `index3 BU 28-09-25 avant terminologie.html` | 415 KB | Backup avant clarification terminologie |
| 28 sept 2025 | `index3 28-09-2025c PHASE1-OK.html` | 415 KB | Phase 1 complétée |
| 28 sept 2025 | `index2b(backup).html` | 74 KB | Backup intermédiaire |

**Caractéristiques de la version monolithique :**
- Tout le code (HTML, CSS, JavaScript) dans un seul fichier
- Structure : 5 sections principales, 14 sous-sections
- Variables CSS pour la palette de couleurs
- Navigation dynamique avec génération des sous-menus
- Données de démonstration (7 étudiants)
- Environ 1100 lignes de code total

### Phase 2 : Croissance et complexification (octobre 2025)

| Date | Fichier | Taille | Description |
|------|---------|--------|-------------|
| 10 oct 2025 | `index 35-M5 10-10-2025a.html` | 577 KB | Version Beta 35, pic de complexité |

**Nouvelles fonctionnalités Beta 35 (documentées dans ARCHITECTURE_2025-10-06.md) :**
- Système de Portfolio d'apprentissage
- Types de productions : `portfolio` (conteneur) et `artefact-portfolio`
- Profil étudiant avec sélection des N meilleurs artefacts
- Gestion intelligente des pondérations
- Calcul de note provisoire et finale
- Stockage localStorage structuré

**La version Beta 35 atteint 577 KB** : le fichier monolithique devient difficile à maintenir.

### Phase 3 : Migration vers architecture modulaire (15-20 octobre 2025)

| Date | Fichier | Taille | Description |
|------|---------|--------|-------------|
| 15 oct 2025 | `index 50 (modulaire-v15).html` | 169 KB | Début de la modularisation |
| 17 oct 2025 | `index 60 (modulaire-v16).html` | 186 KB | Architecture modulaire v16 |
| 20 oct 2025 | `index 70 (refonte des modules).html` | 183 KB | Refonte des modules |

**Passage de 577 KB à 169-186 KB** : le code JavaScript est extrait dans des fichiers séparés.

**Structure modulaire planifiée (10 oct 2025) :**
```
js/
├── 01-config.js         # Configuration et variables globales
├── 02-navigation.js     # Gestion sections/sous-sections
├── 03-etudiants.js      # Étudiants et portfolios
├── 04-productions.js    # Productions et évaluations
├── 05-grilles.js        # Grilles de critères
├── 06-echelles.js       # Échelles de performance
├── 07-cartouches.js     # Cartouches de rétroaction
├── 08-cours.js          # Gestion des cours
├── 09-calendrier.js     # Calendrier scolaire
├── 10-horaire.js        # Horaire des cours
├── 11-groupe.js         # Listes des étudiants
├── 12-pratiques.js      # Pratiques de notation
├── 13-import-export.js  # Import/export de données
├── 14-statistiques.js   # Calculs statistiques
├── 15-utilitaires.js    # Fonctions utilitaires
└── 99-main.js           # Point d'entrée
```

### Phase 4 : Version Git (à partir du 20 octobre 2025)

À partir de la Beta 70, le projet est versionné avec Git. L'historique détaillé est disponible via `git log`.

## Documents de référence archivés

| Fichier | Contenu |
|---------|---------|
| `ARCHITECTURE_2025-10-06.md` | Architecture technique, nouvelles fonctionnalités Portfolio |
| `Structure détaillée du code index3 v22-09-25a.txt` | Cartographie complète du code monolithique |
| `structure modulaire (10 oct).txt` | Plan de migration vers modules |
| `Terminologie correcte du projet.txt` | Clarification Production vs Évaluation |

## Évolution de la terminologie

Une clarification importante a été faite le 28 septembre 2025 :

**Ce que fait l'élève :**
- **Production** = Le travail/devoir que l'élève remet

**Ce que fait l'enseignant :**
- **Grille** = Le modèle avec critères et pondérations
- **Évaluation** = L'action d'évaluer une production avec une grille
- **Rétroaction** = Les commentaires donnés à l'élève

## Chronologie résumée

```
Septembre 2025
├── 22 sept : Version de base v22-09-25a (structure initiale)
├── 23 sept : index3 copie (117 KB)
└── 28 sept : Phase 1 OK, clarification terminologie (415 KB)

Octobre 2025
├── 6 oct  : Architecture Portfolio documentée
├── 10 oct : Beta 35 (577 KB) - pic de complexité monolithique
├── 15 oct : Beta 50 - début modularisation (169 KB)
├── 17 oct : Beta 60 - architecture modulaire v16 (186 KB)
└── 20 oct : Beta 70 - refonte modules, début Git (183 KB)

Novembre 2025
├── 5-16 nov : Sprint présentation AQPC (109 commits)
├── 19 nov : Présentation Communauté de pratique PAN
└── 25-26 nov : Migration IndexedDB (Beta 91.1)

Décembre 2025
├── 3 déc  : Système 100% universel (Beta 93)
├── 10-12 déc : Système snapshots (Beta 94)
├── 18 déc : Refonte UX Réglages (Beta 95)
└── 27 déc : Stabilisation H2026

Janvier 2026
└── 1er janv : Beta 95 stable pour H2026
```

## Leçons apprises

1. **Architecture monolithique** : Fonctionnelle jusqu'à ~300 KB, devient difficile à maintenir au-delà
2. **Modularisation** : Essentielle pour la collaboration et la maintenance
3. **Documentation** : Les fichiers d'architecture et de structure sont précieux pour comprendre l'évolution
4. **Terminologie** : Clarifier le vocabulaire dès le début évite les confusions

---

*Document créé le 1er janvier 2026 à partir de l'archéologie du répertoire `artefacts 1-95/`*
