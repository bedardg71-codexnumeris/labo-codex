# Historique pré-Git du Système de monitorage

Ce document retrace l'évolution de l'application avant son archivage dans Git (octobre 2025).

## Archéologie reconstituée

Les fichiers du répertoire `artefacts 1-95/` permettent de retracer l'évolution complète :

### Phase 0 : Prototypes initiaux (10-20 septembre 2025)

| Date | Fichier | Taille | Description |
|------|---------|--------|-------------|
| 10 sept 2025 | `index10-09-25.html` | 214 KB | Première version archivée |
| 18 sept 2025 | `index18-09-25.html` | 228 KB | Évolution +14 KB |
| 19 sept 2025 | `index19-09-25.html` | 214 KB | Optimisation |
| 19 sept 2025 | `index-19-septembre-2025.html` | 202 KB | Version alternative |
| 20 sept 2025 | `index.html` | 27 KB | Prototype minimal |
| 22 sept 2025 | `index2.html` | 74 KB | Deuxième itération |

**Caractéristiques des prototypes :**
- Titre : "Système de Monitorage - Écriture et littérature (601-101-MQ)"
- Design System v2.0 avec variables CSS
- Palette de couleurs bleus cohérente
- Indicateurs de risque (6 niveaux : minimal → critique)

### Phase 1 : Version monolithique mature (22-28 septembre 2025)

| Date | Fichier | Taille | Description |
|------|---------|--------|-------------|
| 22 sept 2025 | Structure v22-09-25a | — | Documentation architecture |
| 23 sept 2025 | `index3 copie 23-09-2025.html` | 117 KB | Version stable |
| 28 sept 2025 | `index3 BU 28-09-25 avant terminologie.html` | 415 KB | Avant clarification |
| 28 sept 2025 | `index3 28-09-2025c PHASE1-OK.html` | 415 KB | Phase 1 complétée |
| 28 sept 2025 | `index2b(backup).html` | 74 KB | Backup intermédiaire |
| 28 sept 2025 | `index3-html-modulaire.html` | 45 KB | Expérimentation modulaire |

**Croissance rapide : 117 KB → 415 KB en 5 jours** (×3.5)

**Caractéristiques de la version "index3" :**
- Tout le code (HTML, CSS, JavaScript) dans un seul fichier
- Structure : 5 sections principales, 14 sous-sections
- Variables CSS pour la palette de couleurs
- Navigation dynamique avec génération des sous-menus
- Données de démonstration (7 étudiants)
- Environ 1100 lignes de code total (v22-09-25a)

**Expérimentation `index3-html-modulaire.html` :**
- Palette de couleurs alternative (bleu-primaire vs bleu-principal)
- Variables anglicisées (spacing-xs vs espacement-section)
- Titre différent : "Gestion pédagogique - Suivi de classe"
- Cette piste n'a pas été retenue

### Phase 2 : Croissance et complexification (octobre 2025)

| Date | Fichier | Taille | Description |
|------|---------|--------|-------------|
| 6 oct 2025 | `ARCHITECTURE_2025-10-06.md` | 9 KB | Documentation Portfolio |
| 10 oct 2025 | `index 35-M5 10-10-2025a.html` | 577 KB | Beta 35, pic monolithique |

**Nouvelles fonctionnalités Beta 35 (documentées dans ARCHITECTURE_2025-10-06.md) :**
- Système de Portfolio d'apprentissage
- Types de productions : `portfolio` (conteneur) et `artefact-portfolio`
- Profil étudiant avec sélection des N meilleurs artefacts
- Gestion intelligente des pondérations
- Calcul de note provisoire et finale
- Stockage localStorage structuré

**La version Beta 35 atteint 577 KB** : le fichier monolithique devient impossible à maintenir.

### Phase 3 : Migration vers architecture modulaire (15-23 octobre 2025)

| Date | Fichier | Taille | Description |
|------|---------|--------|-------------|
| 10 oct 2025 | `structure modulaire (10 oct).txt` | 1 KB | Plan de migration |
| 15 oct 2025 | `index 50 (modulaire-v15).html` | 169 KB | Début modularisation |
| 17 oct 2025 | `index 60 (modulaire-v16).html` | 186 KB | Architecture v16 |
| 20 oct 2025 | `index 70 (refonte des modules).html` | 183 KB | Refonte modules |
| 23 oct 2025 | `Claude.md créé par claude code.txt` | 8 KB | Premier CLAUDE.md |

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

**Premier CLAUDE.md (23 octobre 2025) :**
- Version Beta 0.71 (Index 50 10-10-2025a)
- 23 modules JavaScript documentés avec ordre de priorité
- Système d'indices A-C-P avec notion SOM vs PAN
- Règles de collaboration LLM strictes
- Terminologie "Risque d'échec" (avant changement vers "Engagement")

### Phase 4 : Version Git (à partir du 20 octobre 2025)

À partir de la Beta 70, le projet est versionné avec Git. L'historique détaillé est disponible via `git log`.

## Documents de référence archivés

| Fichier | Date | Contenu |
|---------|------|---------|
| `Structure détaillée du code index3 v22-09-25a.txt` | 22 sept | Cartographie code monolithique (176 lignes) |
| `Terminologie correcte du projet.txt` | 28 sept | Clarification Production vs Évaluation |
| `ARCHITECTURE_2025-10-06.md` | 6 oct | Architecture Portfolio (315 lignes) |
| `structure modulaire (10 oct).txt` | 10 oct | Plan migration modules |
| `Claude.md créé par claude code.txt` | 23 oct | Premier CLAUDE.md (194 lignes) |

## Évolution de la terminologie

Une clarification importante a été faite le 28 septembre 2025 :

**Ce que fait l'élève :**
- **Production** = Le travail/devoir que l'élève remet

**Ce que fait l'enseignant :**
- **Grille** = Le modèle avec critères et pondérations
- **Évaluation** = L'action d'évaluer une production avec une grille
- **Rétroaction** = Les commentaires donnés à l'élève

## Évolution des tailles de fichiers

```
10 sept : 214 KB (prototype initial)
18 sept : 228 KB (+7%)
22 sept : 74 KB  (refonte index2)
23 sept : 117 KB (index3 stable)
28 sept : 415 KB (×3.5 en 5 jours) ← Phase 1 OK
10 oct  : 577 KB (×1.4 - pic monolithique) ← Limite atteinte
15 oct  : 169 KB (modularisation - JS externalisé)
20 oct  : 183 KB (Beta 70 - Git)
```

## Chronologie résumée

```
Septembre 2025
├── 10 sept : Première version archivée (214 KB)
├── 18-19 sept : Itérations rapides (214-228 KB)
├── 20 sept : Prototype minimal (27 KB)
├── 22 sept : index2 stable (74 KB), documentation architecture
├── 23 sept : index3 copie (117 KB)
└── 28 sept : Phase 1 OK, clarification terminologie (415 KB)

Octobre 2025
├── 6 oct  : Architecture Portfolio documentée
├── 10 oct : Beta 35 (577 KB) - pic de complexité monolithique
├── 15 oct : Beta 50 - début modularisation (169 KB)
├── 17 oct : Beta 60 - architecture modulaire v16 (186 KB)
├── 20 oct : Beta 70 - refonte modules, début Git (183 KB)
└── 23 oct : Premier CLAUDE.md créé (Beta 0.71)

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
2. **Croissance rapide** : 117 KB → 577 KB en 17 jours (×5) nécessite une refonte
3. **Modularisation** : Essentielle pour la collaboration et la maintenance
4. **Documentation** : Les fichiers d'architecture et de structure sont précieux pour comprendre l'évolution
5. **Terminologie** : Clarifier le vocabulaire dès le début évite les confusions
6. **Expérimentation** : Certaines pistes (index3-html-modulaire) sont abandonnées, c'est normal

## Statistiques finales des artefacts

| Catégorie | Nombre | Description |
|-----------|--------|-------------|
| Fichiers HTML | 12 | Versions de l'application |
| Documents MD | 1 | Architecture Portfolio |
| Documents TXT | 4 | Structure, terminologie, CLAUDE.md |
| **Total** | **17** | Artefacts pré-Git |

---

*Document mis à jour le 1er janvier 2026 à partir de l'archéologie complète du répertoire `artefacts 1-95/`*
