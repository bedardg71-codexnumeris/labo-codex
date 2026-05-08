# Plan de refonte UX - Beta 95

**Date de création** : 18 décembre 2025
**Objectif** : Rendre l'interface plus fluide et intuitive
**Approche** : Modifications progressives et testées, une à la fois

---

## Modèle conceptuel : Hiérarchie des données

Avant de modifier l'interface, il est essentiel de bien comprendre la structure logique des données et les relations entre les concepts.

### Définitions

#### TRIMESTRE
Le **trimestre** est l'unité temporelle de base. C'est une période académique définie par des dates (début, fin, remise des notes) pendant laquelle un enseignant offre un ou plusieurs cours.

- **Identifiant** : Code session + année (ex: A2025, H2026, E2026)
- **Cadre temporel** : Dates de début/fin, semaines spéciales (planification, examens)
- **Aménagements** : Congés fériés, événements imprévus, reprises
- **Rôle** : Conteneur racine, porte d'entrée obligatoire pour configurer l'application

**Un trimestre contient** : Un ou plusieurs groupe-cours

#### COURS (système curriculaire)
Le **cours** est une entité du programme d'études. C'est une unité curriculaire définie par un sigle et un titre, indépendante du temps et des étudiants.

- **Identifiant** : Sigle du cours (ex: 601-101, 601-102)
- **Titre** : Nom officiel (ex: "Écriture et littérature")
- **Discipline** : Département ou champ disciplinaire
- **Rôle** : Définition curriculaire, peut être réutilisé d'un trimestre à l'autre

**Un cours est une définition abstraite** — il devient concret quand il est offert à un groupe d'étudiants.

#### GROUPE-COURS (instance pédagogique)
Le **groupe-cours** est l'instance concrète d'un cours offert à un groupe d'étudiants pendant un trimestre donné. C'est l'unité de travail principale de l'enseignant.

- **Identifiant** : Combinaison cours + groupe + trimestre (ex: 601-101-01-H2026)
- **Composition** : Un cours + un numéro de groupe + un trimestre
- **Rôle** : Conteneur de toutes les données pédagogiques actives

**Un groupe-cours contient** :
- Une liste d'étudiants (le groupe)
- Une pratique de notation (approche pédagogique)
- Des productions (travaux à évaluer)
- Des évaluations (notes des étudiants)
- Des présences (assiduité)
- Un horaire (séances de cours)

#### PRATIQUE DE NOTATION
La **pratique de notation** définit l'approche pédagogique d'évaluation utilisée pour un groupe-cours spécifique.

- **Types** : Sommative traditionnelle, PAN-Maîtrise, PAN-Spécifications, etc.
- **Configuration** : Échelle de performance, grille de critères, portfolio, jetons, etc.
- **Rôle** : Détermine comment les apprentissages sont évalués et les indices calculés

**Règle** : Un groupe-cours a exactement UNE pratique de notation.

**Cas particulier** : Un même cours (ex: 601-101) peut avoir des pratiques différentes selon les groupes :
- 601-101 Groupe 01 → PAN-Maîtrise (expérimentation)
- 601-101 Groupe 02 → Sommative traditionnelle (contrôle)

#### MATÉRIEL PÉDAGOGIQUE
Le **matériel pédagogique** regroupe les ressources réutilisables : grilles de critères, échelles de performance, cartouches de rétroaction, productions-types.

- **Portée** : Associé à un groupe-cours (pas au trimestre)
- **Origine** : Créé par l'utilisateur ou importé depuis une bibliothèque (collègues, communauté)
- **Rôle** : Outillage pour l'évaluation

### Schéma hiérarchique

```
TRIMESTRE (A2025, H2026)
│   Période temporelle : dates, semaines spéciales, aménagements
│
└── GROUPE-COURS (instance pédagogique)
    │   Identifiant : 601-101-01-H2026
    │
    ├── Cours (référence curriculaire)
    │   └── 601-101 "Écriture et littérature"
    │
    ├── Groupe (numéro)
    │   └── 01
    │
    ├── Étudiants (liste)
    │   └── 30 étudiants avec DA, nom, prénom
    │
    ├── Pratique de notation (UNE seule)
    │   ├── Type : PAN-Maîtrise
    │   ├── Échelle : IDME
    │   ├── Grille : SRPNF
    │   ├── Portfolio : 5 meilleurs artefacts
    │   └── Jetons : 4 par élève
    │
    ├── Productions (travaux)
    │   ├── Artefact 1 : Analyse littéraire
    │   ├── Artefact 2 : Dissertation
    │   └── ...
    │
    ├── Évaluations (notes)
    │   └── [étudiant × production → note]
    │
    ├── Présences (assiduité)
    │   └── [étudiant × séance → heures]
    │
    └── Horaire (séances)
        └── Lundi 10h-12h, Mercredi 13h-15h
```

### Flux d'importation

#### Nouveau trimestre
1. Créer le trimestre H2026 (dates, aménagements)
2. Importer un cours depuis A2025 (sans étudiants, sans notes)
3. Créer un nouveau groupe (01, 02, etc.)
4. Importer ou créer la liste d'étudiants
5. Associer une pratique de notation (existante ou nouvelle)
6. Associer le matériel pédagogique (grilles, échelles, productions-types)

#### Importation de matériel
- **Mes ressources** : Réutiliser une grille/échelle que j'ai créée
- **Bibliothèque** : Importer une ressource partagée par un collègue
- **Scope** : Le matériel est copié dans le groupe-cours (pas de lien dynamique)

### Conséquences sur l'interface

1. **Porte d'entrée** : L'utilisateur doit d'abord avoir un trimestre actif
2. **Contexte de travail** : Toutes les opérations se font dans le contexte d'un groupe-cours actif
3. **Sélecteur** : L'en-tête devrait montrer le groupe-cours actif (pas juste le cours)
4. **Navigation** : "Mes trimestres" permet de voir/gérer tous les trimestres et leurs groupe-cours

---

## Design de l'onglet "Trimestre"

L'onglet **Trimestre** devient le point d'entrée unique pour toute la configuration temporelle et organisationnelle. Il regroupe tout ce qui définit le contexte de travail de l'enseignant.

### Structure proposée

```
┌─────────────────────────────────────────────────────────────────┐
│ TRIMESTRE : Hiver 2026                        [Changer ▼]       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ CADRE RÉGULIER                                              │ │
│ │                                                             │ │
│ │ Bornes du trimestre          Semaines spéciales             │ │
│ │ ├─ Début : 2026-01-19        ├─ Planification : 13-17 oct   │ │
│ │ ├─ Fin cours : 2026-05-15    └─ Examens : 15-22 déc         │ │
│ │ ├─ Fin trimestre : 2026-05-22                               │ │
│ │ └─ Remise notes : 2026-05-31                                │ │
│ │                                                             │ │
│ │ [Sauvegarder le cadre]                                      │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ AMÉNAGEMENTS                                                │ │
│ │                                                             │ │
│ │ Congés fériés et activités     │ Événements imprévus        │ │
│ │ institutionnelles              │                            │ │
│ │ ├─ Fête du travail (férié)     │ Aucun événement déclaré.   │ │
│ │ │   2025-09-01 → reprise 09-04 │                            │ │
│ │ ├─ Journée carrière            │ [+ Ajouter un événement    │ │
│ │ │   2025-11-10                 │    imprévu]                │ │
│ │ └─ [+ Ajouter un événement     │                            │ │
│ │      prévu]                    │                            │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ▼ COURS                                           [+ Ajouter]│ │
│ │                                                             │ │
│ │ Cours sélectionné : [601-101 Écriture et littérature ▼]     │ │
│ │                                                             │ │
│ │ ┌─────────────────────────────────────────────────────────┐ │ │
│ │ │ Sigle : 601-101                                         │ │ │
│ │ │ Titre : Écriture et littérature                         │ │ │
│ │ │ Pondération : 2-2-3                                     │ │ │
│ │ │ Programme : 500.AL Arts, lettres et communication       │ │ │
│ │ │                                                         │ │ │
│ │ │ [Modifier] [Supprimer]                                  │ │ │
│ │ └─────────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ▼ GROUPES                                         [+ Ajouter]│ │
│ │                                                             │ │
│ │ Groupes du cours 601-101 :                                  │ │
│ │                                                             │ │
│ │ ┌───────────────────────────────────────────────────────┐   │ │
│ │ │ Groupe 01                              ★ ACTIF        │   │ │
│ │ │ 30 étudiants • PAN-Maîtrise • Lun-Mer 10h-12h        │   │ │
│ │ │ [Activer] [Modifier] [Gérer étudiants]               │   │ │
│ │ └───────────────────────────────────────────────────────┘   │ │
│ │                                                             │ │
│ │ ┌───────────────────────────────────────────────────────┐   │ │
│ │ │ Groupe 02                                             │   │ │
│ │ │ 28 étudiants • Sommative • Mar-Jeu 13h-15h           │   │ │
│ │ │ [Activer] [Modifier] [Gérer étudiants]               │   │ │
│ │ └───────────────────────────────────────────────────────┘   │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ▼ HORAIRE                                                   │ │
│ │                                                             │ │
│ │ Horaire du groupe actif : 601-101 Groupe 01                 │ │
│ │                                                             │ │
│ │ Séances hebdomadaires :                                     │ │
│ │ ├─ Lundi    10h00 - 12h00  (2h)                            │ │
│ │ └─ Mercredi 10h00 - 12h00  (2h)                            │ │
│ │                                                             │ │
│ │ Total : 4h/semaine • 60h/trimestre (15 semaines)           │ │
│ │                                                             │ │
│ │ [Modifier l'horaire]                                        │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Organisation des sections

| Section | Type | Contenu | Portée |
|---------|------|---------|--------|
| **Cadre régulier** | Fixe (toujours visible) | Dates du trimestre, semaines spéciales | Trimestre |
| **Aménagements** | Fixe (toujours visible) | Congés prévus + événements imprévus | Trimestre |
| **Cours** | Accordéon | Définition des cours (dropdown pour sélection) | Trimestre |
| **Groupes** | Accordéon | Liste des groupes du cours sélectionné | Cours |
| **Horaire** | Accordéon | Séances du groupe actif | Groupe-cours |

### Logique de sélection en cascade

```
Trimestre (dropdown en haut de l'onglet)
    │
    └── Cours (dropdown dans accordéon Cours)
            │
            └── Groupe (liste dans accordéon Groupes)
                    │
                    └── Horaire (affiché pour le groupe actif)
```

**Comportement** :
1. Changer de **trimestre** → Recharge tous les cours de ce trimestre
2. Changer de **cours** (dropdown) → Recharge les groupes de ce cours
3. Cliquer **"Activer"** sur un groupe → Ce groupe devient le groupe-cours actif pour toute l'application, l'horaire se met à jour

### Éléments d'interface

#### Dropdown "Trimestre" (en-tête de l'onglet)
- Position : En haut de l'onglet, bien visible
- Contenu : Liste des trimestres (actifs et archivés)
- Action : Changer de trimestre recharge tout le contenu

#### Dropdown "Cours" (dans accordéon Cours)
- Position : Sous le titre de l'accordéon
- Contenu : Liste des cours du trimestre sélectionné
- Action : Changer de cours met à jour l'accordéon Groupes

#### Cartes de groupes (dans accordéon Groupes)
- Affichage : Cartes compactes avec résumé (nb étudiants, pratique, horaire résumé)
- Actions : Activer, Modifier, Gérer étudiants
- Indicateur : Étoile ou badge "ACTIF" sur le groupe-cours actif

#### Accordéon Horaire
- Contexte : Affiche l'horaire du groupe-cours **actif**
- Dépendance : Se met à jour automatiquement quand on active un autre groupe

### Ce qui est lié à quoi

| Donnée | Liée à | Explication |
|--------|--------|-------------|
| Cadre temporel | Trimestre | Dates partagées par tous les cours du trimestre |
| Aménagements | Trimestre | Congés et événements affectent tout le trimestre |
| Définition cours | Trimestre | Un cours existe dans le contexte d'un trimestre |
| Groupe | Cours | Un groupe est une instance d'un cours |
| Horaire | Groupe-cours | Chaque groupe peut avoir un horaire différent |
| Étudiants | Groupe-cours | La liste d'étudiants appartient au groupe |
| Pratique de notation | Groupe-cours | Chaque groupe peut avoir sa propre pratique |

### Modes d'utilisation

#### Mode assisté (Primo/Wizard)
Pour les nouveaux utilisateurs, un wizard guide la création :
1. Définir le cadre du trimestre (dates)
2. Créer ou importer un cours
3. Créer un groupe pour ce cours
4. Définir l'horaire du groupe
5. Importer les étudiants

#### Mode normal (utilisateurs expérimentés)
Accès direct à toutes les sections via les accordéons. Modification rapide de n'importe quel paramètre sans passer par un wizard.

---

## Design de l'onglet "Pratique de notation"

### Positionnement hiérarchique

La **Pratique de notation** est un onglet **au même niveau** que "Trimestre" dans la sous-navigation des Réglages. Ce n'est PAS une sous-section du trimestre.

```
Réglages (section principale)
    │
    ├── Trimestre        ← Onglet 1 : Configuration temporelle et organisationnelle
    │
    ├── Pratique de notation  ← Onglet 2 : Configuration pédagogique (SÉPARÉ)
    │
    ├── Préférences      ← Onglet 3 : Options d'affichage, seuils, etc.
    │
    └── Données          ← Onglet 4 : Import/Export, snapshots
```

### Justification de la séparation

1. **Complexité** : La pratique de notation est un domaine riche avec de nombreux paramètres (échelle, grille, portfolio, jetons, calcul, etc.). Mélanger cela avec la configuration du trimestre rendrait l'interface confuse.

2. **Autonomie conceptuelle** : La pratique de notation est un choix pédagogique fondamental, distinct de l'organisation temporelle. Un enseignant peut changer de pratique sans toucher au calendrier.

3. **Expérimentation progressive** : Certains enseignants veulent tester les PAN avec un groupe tout en gardant la sommative avec un autre. Cette séparation facilite cette approche.

### Relation avec le groupe-cours

**Règle fondamentale** : Chaque groupe-cours a sa propre pratique de notation.

```
Groupe-cours 601-101-01-H2026
    └── Pratique : PAN-Maîtrise (IDME + SRPNF + Portfolio 5 artefacts)

Groupe-cours 601-101-02-H2026
    └── Pratique : Sommative traditionnelle (moyenne pondérée)
```

**Cas d'usage typiques** :

| Scénario | Configuration |
|----------|---------------|
| Enseignant traditionnel | Tous les groupes en Sommative |
| Enseignant PAN convaincu | Tous les groupes en PAN-Maîtrise |
| Enseignant en transition | Groupe 01 en PAN (expérimentation), Groupe 02 en Sommative (contrôle) |
| Enseignant multi-cours | 601-101 en PAN, 601-102 en Sommative |

### Structure proposée de l'onglet

```
┌─────────────────────────────────────────────────────────────────┐
│ PRATIQUE DE NOTATION                                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Groupe-cours actif : [601-101 Groupe 01 - H2026 ▼]             │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ PRATIQUE ASSOCIÉE                                           │ │
│ │                                                             │ │
│ │ Type : PAN-Maîtrise                     [Changer ▼]        │ │
│ │                                                             │ │
│ │ ┌─────────────────────────────────────────────────────────┐ │ │
│ │ │ Résumé de la configuration                              │ │ │
│ │ │ • Échelle : IDME (4 niveaux)                            │ │ │
│ │ │ • Grille : SRPNF (5 critères)                           │ │ │
│ │ │ • Portfolio : 5 meilleurs artefacts                     │ │ │
│ │ │ • Jetons : 4 par élève (délai, reprise)                 │ │ │
│ │ │ • Calcul : Moyenne des N meilleurs                      │ │ │
│ │ └─────────────────────────────────────────────────────────┘ │ │
│ │                                                             │ │
│ │ [Modifier la pratique]  [Parcourir la bibliothèque]        │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ▼ ÉCHELLE DE PERFORMANCE                                    │ │
│ │   Configuration des niveaux (IDME, lettres, pourcentages)   │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ▼ GRILLE DE CRITÈRES                                        │ │
│ │   Critères d'évaluation et pondérations                     │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ▼ PORTFOLIO                                                 │ │
│ │   Nombre d'artefacts, méthode de sélection                  │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ▼ SYSTÈME DE JETONS                                         │ │
│ │   Types de jetons, quantités, règles                        │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ▼ MÉTHODE DE CALCUL                                         │ │
│ │   Moyenne, pondération, règles spéciales                    │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Éléments clés

#### Dropdown "Groupe-cours actif" (en haut)
- Affiche le groupe-cours actuellement sélectionné
- Permet de basculer rapidement entre les groupes pour voir/modifier leur pratique
- Format : "601-101 Groupe 01 - H2026"

#### Carte "Pratique associée"
- Résumé visuel de la configuration actuelle
- Bouton "Changer" pour sélectionner un autre type de pratique (Sommative, PAN-Maîtrise, etc.)
- Bouton "Modifier" pour accéder aux paramètres détaillés
- Bouton "Parcourir la bibliothèque" pour importer une pratique existante

#### Accordéons de configuration détaillée
Chaque aspect de la pratique a son propre accordéon :
- **Échelle de performance** : Niveaux IDME, lettres, ou pourcentages
- **Grille de critères** : Critères d'évaluation et pondérations
- **Portfolio** : Nombre d'artefacts à retenir, méthode de sélection
- **Système de jetons** : Types, quantités, règles d'utilisation
- **Méthode de calcul** : Formules, pondérations, règles spéciales

### Flux de travail

#### Nouveau groupe-cours
1. Créer le groupe dans l'onglet Trimestre
2. Aller dans l'onglet Pratique de notation
3. Sélectionner le groupe-cours dans le dropdown
4. Choisir ou importer une pratique
5. Personnaliser les paramètres si nécessaire

#### Copier une pratique vers un autre groupe
1. Configurer la pratique pour le Groupe 01
2. Sélectionner le Groupe 02 dans le dropdown
3. Cliquer "Parcourir la bibliothèque" → "Mes pratiques"
4. Importer la pratique du Groupe 01
5. Modifier si nécessaire (ou garder identique)

### Indépendance des pratiques

Chaque groupe-cours a sa **propre copie** de la pratique de notation. Modifier la pratique du Groupe 01 n'affecte PAS celle du Groupe 02.

Cela permet :
- Expérimentation isolée (tester des paramètres sur un groupe)
- Comparaison contrôlée (PAN vs Sommative)
- Évolution progressive (ajuster au fil du trimestre)

---

## Matériel pédagogique : Section principale séparée

### Distinction fondamentale

Le **Matériel pédagogique** n'est PAS dans les Réglages. C'est une **section principale** de l'application, au même niveau que Tableau de bord, Présences, Évaluations, etc.

```
NAVIGATION PRINCIPALE
    │
    ├── Tableau de bord
    ├── Présences
    ├── Évaluations
    ├── Matériel          ← Section principale (PAS dans Réglages)
    ├── Réglages
    └── Aide
```

### Relation avec la Pratique de notation

| Concept | Rôle | Emplacement |
|---------|------|-------------|
| **Pratique de notation** | Définit l'approche pédagogique | Réglages → Pratique de notation |
| **Matériel pédagogique** | Ressources concrètes utilisées par la pratique | Section Matériel (principale) |

**Analogie** :
- La **Pratique** dit : "J'utilise PAN-Maîtrise avec l'échelle IDME et la grille SRPNF"
- Le **Matériel** contient : L'échelle IDME elle-même, la grille SRPNF elle-même

### Contenu de la section Matériel

```
MATÉRIEL (section principale)
    │
    ├── Productions étudiantes
    │   └── Les travaux à évaluer (artefacts, examens, etc.)
    │
    ├── Grilles de critères
    │   └── Comment évaluer (critères, pondérations, descriptions)
    │
    ├── Échelles de performance
    │   └── Avec quels niveaux (IDME, lettres, pourcentages)
    │
    └── Cartouches de rétroaction
        └── Quels commentaires donner (par critère et niveau)
```

### Justification de la séparation

1. **Complexité propre** : Chaque type de matériel (grilles, échelles, etc.) est complexe et mérite son propre espace de gestion.

2. **Réutilisabilité** : Le matériel peut être partagé entre groupe-cours, importé depuis des bibliothèques, exporté vers des collègues. Ce n'est pas juste une "configuration".

3. **Fréquence d'accès** : L'enseignant accède souvent au matériel (créer une production, modifier une grille) mais rarement aux réglages du trimestre.

4. **Clarté conceptuelle** : Réglages = définir le contexte et les règles. Matériel = créer et gérer les outils concrets.

### Lien entre Pratique et Matériel

Quand on configure une pratique de notation, on **référence** du matériel existant :

```
Pratique de notation (Réglages)
    │
    ├── Échelle : [Sélectionner ▼] → Liste depuis section Matériel
    │                                 • IDME (4 niveaux)
    │                                 • Lettres (A-F)
    │                                 • Pourcentages
    │
    ├── Grille : [Sélectionner ▼] → Liste depuis section Matériel
    │                                • SRPNF (5 critères)
    │                                • Ma grille personnalisée
    │
    └── etc.
```

Le matériel est **créé et géré** dans la section Matériel, puis **sélectionné/référencé** dans la configuration de la pratique.

---

## Design de l'onglet "Préférences"

### Rôle

L'onglet **Préférences** permet à l'utilisateur de personnaliser son expérience : quelles fonctionnalités exploiter et quelles informations afficher.

C'est distinct de :
- **Trimestre** = Quand, quoi, qui (configuration du contexte)
- **Pratique de notation** = Comment évaluer (approche pédagogique)
- **Préférences** = Quoi utiliser et voir (expérience utilisateur)

### Structure proposée

```
┌─────────────────────────────────────────────────────────────────┐
│ PRÉFÉRENCES                                                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ OUTILS À EXPLOITER                                          │ │
│ │                                                             │ │
│ │ Activez ou désactivez les fonctionnalités selon vos        │ │
│ │ besoins. Les outils désactivés seront masqués.             │ │
│ │                                                             │ │
│ │ ☑ Dépistage A-C-P                                          │ │
│ │   Indices prédictifs (Assiduité, Complétion, Performance)  │ │
│ │                                                             │ │
│ │ ☑ Détection des patterns                                   │ │
│ │   Identification des tendances récurrentes                 │ │
│ │                                                             │ │
│ │ ☑ Système RàI (Réponse à l'Intervention)                   │ │
│ │   Niveaux d'intervention et recommandations                │ │
│ │                                                             │ │
│ │ ☐ Mode comparatif SOM/PAN                                  │ │
│ │   Afficher les deux pratiques côte à côte (expérimental)   │ │
│ │                                                             │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ AFFICHAGE DES RESSOURCES                                    │ │
│ │                                                             │ │
│ │ Choisissez ce que vous voulez voir dans l'interface.       │ │
│ │                                                             │ │
│ │ ☑ Snapshots (captures de progression)                      │ │
│ │   Historique hebdomadaire des indices                      │ │
│ │                                                             │ │
│ │ ☑ Graphiques d'évolution                                   │ │
│ │   Visualisation de la progression dans le temps            │ │
│ │                                                             │ │
│ │ ☑ Seuils d'interprétation                                  │ │
│ │   Fragile / Acceptable / Bon                               │ │
│ │                                                             │ │
│ │ ☐ Détails techniques                                       │ │
│ │   Formules de calcul, données brutes                       │ │
│ │                                                             │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ SEUILS D'INTERPRÉTATION                                     │ │
│ │                                                             │ │
│ │ Personnalisez les seuils pour l'interprétation des         │ │
│ │ indices A-C-P.                                              │ │
│ │                                                             │ │
│ │ Fragile si inférieur à :     [70] %                        │ │
│ │ Acceptable si inférieur à :  [80] %                        │ │
│ │ Bon si supérieur ou égal à : [85] %                        │ │
│ │                                                             │ │
│ │ [Restaurer les valeurs par défaut]                         │ │
│ │                                                             │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Sections de l'onglet Préférences

| Section | Contenu | Impact |
|---------|---------|--------|
| **Outils à exploiter** | Checkboxes pour activer/désactiver les fonctionnalités | Masque les sections non utilisées dans toute l'application |
| **Affichage des ressources** | Checkboxes pour montrer/masquer des éléments | Simplifie l'interface selon les besoins |
| **Seuils d'interprétation** | Valeurs numériques personnalisables | Affecte les couleurs, diagnostics et recommandations |

### Cas d'usage

| Profil utilisateur | Configuration typique |
|--------------------|----------------------|
| **Enseignant minimaliste** | Désactive RàI, patterns, snapshots. Utilise seulement notes et présences. |
| **Enseignant analytique** | Active tout, y compris détails techniques et mode comparatif. |
| **Enseignant en transition** | Active dépistage A-C-P mais désactive RàI (pas encore prêt). |
| **Enseignant expérimenté PAN** | Active tout sauf mode comparatif (plus besoin de comparer). |

### Portée des préférences

Les préférences sont **globales** (pas par groupe-cours). Elles affectent l'ensemble de l'application pour cet utilisateur.

---

## Récapitulatif : Architecture des Réglages

### Les 4 onglets

```
RÉGLAGES
    │
    ├── 1. TRIMESTRE
    │   └── Configuration temporelle et organisationnelle
    │       • Cadre régulier (dates, semaines spéciales)
    │       • Aménagements (congés, événements)
    │       • Cours (dropdown + détails)
    │       • Groupes (cartes par cours)
    │       • Horaire (lié au groupe actif)
    │
    ├── 2. PRATIQUE DE NOTATION
    │   └── Configuration pédagogique par groupe-cours
    │       • Sélection du groupe-cours
    │       • Type de pratique (Sommative, PAN-Maîtrise, etc.)
    │       • Paramètres détaillés (échelle, grille, portfolio, jetons, calcul)
    │
    ├── 3. PRÉFÉRENCES
    │   └── Personnalisation de l'expérience utilisateur
    │       • Outils à exploiter (dépistage, patterns, RàI)
    │       • Affichage des ressources (snapshots, graphiques)
    │       • Seuils d'interprétation
    │
    └── 4. DONNÉES
        └── Gestion des données
            • Import/Export
            • Snapshots (consultation)
            • Réinitialisation
```

### Ce qui n'est PAS dans Réglages

| Élément | Emplacement | Raison |
|---------|-------------|--------|
| **Matériel pédagogique** | Section principale "Matériel" | Complexité propre, accès fréquent, réutilisabilité |
| **Étudiants** | Géré via Trimestre → Groupes → "Gérer étudiants" | Lié au groupe-cours |
| **Évaluations** | Section principale "Évaluations" | Activité quotidienne, pas configuration |

---

## Principes de design pour l'implémentation

### 1. Dropdowns au lieu de sidebars

**Règle** : Remplacer toutes les sidebars par des menus dropdown.

**Justification** :
- **Optimisation d'espace** : Les sidebars consomment de l'espace horizontal précieux
- **Interface allégée** : Un dropdown est discret, s'ouvre uniquement quand nécessaire
- **Cohérence** : Un seul pattern de sélection dans toute l'application

**Application** :
| Avant (sidebar) | Après (dropdown) |
|-----------------|------------------|
| Liste des pratiques dans sidebar | Dropdown "Pratique active" |
| Liste des trimestres dans sidebar | Dropdown "Trimestre" en haut de l'onglet |
| Liste des cours dans sidebar | Dropdown "Cours sélectionné" dans accordéon |

**Composant dropdown standard** :
```
┌─────────────────────────────────────┐
│ Label : [Valeur sélectionnée    ▼] │
└─────────────────────────────────────┘
         │
         ▼ (au clic)
┌─────────────────────────────────────┐
│ Option 1                            │
│ Option 2                        ✓   │
│ Option 3                            │
│─────────────────────────────────────│
│ + Créer nouveau...                  │
└─────────────────────────────────────┘
```

### 2. Respect strict du Design System

**Règle** : Toute implémentation doit respecter le document de design système situé dans le répertoire principal du projet.

**Éléments à respecter** :
- **Couleurs** : Variables CSS définies (--bleu-principal, --gris-moyen, etc.)
- **Typographie** : Tailles, poids, familles de polices
- **Espacements** : Marges, paddings standardisés
- **Composants** : Boutons, cartes, badges, alertes selon le design system
- **États** : Hover, focus, disabled, active

**Interdit** :
- Styles inline improvisés
- Nouvelles couleurs non définies dans le système
- Composants personnalisés hors design system

### 3. Modals = couche "meta" uniquement

**Règle** : Les modals sont réservées aux fonctions transversales, pas au travail quotidien.

**Les modals servent à** :

| Usage | Exemple |
|-------|---------|
| **Accès aux bibliothèques** | Parcourir et importer des ressources (pratiques, grilles, échelles) |
| **Assistance à l'utilisation** | Wizard Primo, tutoriels guidés, aide contextuelle |
| **Confirmations critiques** | Suppression, réinitialisation, actions irréversibles |
| **Actions rapides transversales** | Changement de groupe-cours actif depuis n'importe où |

**Les modals NE servent PAS à** :

| Usage incorrect | Alternative correcte |
|-----------------|---------------------|
| Formulaire de création de cours | Page/section dans l'onglet Trimestre |
| Configuration complète d'une pratique | Page/section dans l'onglet Pratique de notation |
| Liste des étudiants | Page dédiée accessible via "Gérer étudiants" |
| Modification de matériel | Section Matériel avec accordéons |

**Principe fondamental** :
```
PAGES/SECTIONS = Travail quotidien (création, modification, consultation)
MODALS = Assistance et accès transversal (bibliothèques, aide, confirmations)
```

### 4. Structure des pages

**Règle** : Le contenu principal est affiché dans des pages avec accordéons, pas dans des modals.

**Pattern standard d'une page** :
```
┌─────────────────────────────────────────────────────────────────┐
│ TITRE DE LA PAGE                                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ [Dropdown de contexte si nécessaire]                           │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Section fixe (toujours visible)                             │ │
│ │ Contenu principal ou résumé                                 │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ▼ ACCORDÉON 1                                               │ │
│ │   Contenu détaillé (s'ouvre/ferme au clic)                 │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ► ACCORDÉON 2 (fermé)                                       │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ [Boutons d'action principaux]                                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 5. Récapitulatif des patterns UI

| Élément | Pattern | Usage |
|---------|---------|-------|
| **Sélection** | Dropdown | Choisir parmi une liste (trimestre, cours, groupe, pratique) |
| **Organisation** | Accordéon | Regrouper du contenu détaillé, réduire l'encombrement |
| **Contenu principal** | Page/Section | Travail quotidien, formulaires, listes |
| **Transversal** | Modal | Bibliothèques, aide, confirmations |
| **Actions** | Boutons | Selon design system (primaire, secondaire, danger) |
| **Informations** | Cartes | Résumés, aperçus, items de liste |
| **Feedback** | Alertes/Badges | États, notifications, indicateurs |

---

## État actuel (Beta 94)

L'application fonctionne mais l'expérience utilisateur peut être améliorée, particulièrement dans la section **Réglages** qui contient beaucoup de sous-sections et d'options.

### Points de friction identifiés

1. **Section Réglages surchargée**
   - 9 sous-sections actuelles : Aperçu, Trimestre, Cours, Horaire, Groupe, Pratique de notation, Interprétation, Snapshots, Import/Export
   - Navigation confuse entre configuration initiale et configuration quotidienne
   - Mélange de concepts temporels (trimestre) et pédagogiques (pratique de notation)

2. **Pratique de notation**
   - Les options avancées (jetons, portfolio) sont dans des cartes accordéon
   - Le wizard "mode assisté" est distinct des paramètres avancés "mode normal"
   - Difficulté à retrouver où modifier certains paramètres

3. **Pas de vision d'ensemble**
   - L'utilisateur ne voit pas facilement quel trimestre/cours est actif
   - Pas de sélecteur de cours dans l'en-tête pour basculer rapidement

---

## Principes directeurs

### 1. Changements atomiques
Chaque modification doit être :
- Petite et ciblée
- Testable indépendamment
- Réversible facilement (commit séparé)

### 2. Préserver l'existant
- Ne pas casser ce qui fonctionne
- Garder la compatibilité avec les données existantes
- Les utilisateurs actuels ne doivent pas être perdus

### 3. Deux modes d'utilisation
- **Mode assisté (Primo)** : Pour les nouveaux utilisateurs, wizard guidé
- **Mode normal** : Pour les utilisateurs expérimentés, accès direct aux paramètres

---

## Plan d'implémentation

### Vue d'ensemble

L'implémentation se fait en **6 phases progressives**, chacune autonome et testable indépendamment.

```
Phase 1 : Navigation Réglages (4 onglets)
    ↓
Phase 2 : Onglet Trimestre (refonte complète)
    ↓
Phase 3 : Onglet Pratique de notation (par groupe-cours)
    ↓
Phase 4 : Onglet Préférences
    ↓
Phase 5 : Onglet Données
    ↓
Phase 6 : Sélecteur groupe-cours dans l'en-tête
```

---

### Phase 1 : Restructurer la navigation Réglages

**Objectif** : Passer de 9 sous-sections à 4 onglets

**Fichiers impactés** :
- `js/config.js` : Modifier `configurationsOnglets.reglages`
- `index.html` : Réorganiser les sections HTML

**Tâches** :
- [ ] 1.1 Modifier config.js pour définir les 4 nouveaux onglets
  ```javascript
  'reglages': [
      { id: 'trimestre', label: 'Trimestre' },
      { id: 'pratique-notation', label: 'Pratique de notation' },
      { id: 'preferences', label: 'Préférences' },
      { id: 'donnees', label: 'Données' }
  ]
  ```
- [ ] 1.2 Créer les 4 nouvelles sections HTML (conteneurs vides)
- [ ] 1.3 Masquer les anciennes sous-sections (classe `legacy-hidden`)
- [ ] 1.4 Tester la navigation entre les 4 onglets

**Critères de succès** :
- Les 4 onglets s'affichent dans la sous-navigation
- Cliquer sur un onglet affiche la section correspondante
- Aucune erreur console

**Durée estimée** : 1-2 heures

---

### Phase 2 : Implémenter l'onglet Trimestre

**Objectif** : Créer l'interface complète de configuration du trimestre

**Structure** :
```
Trimestre
├── Dropdown sélection trimestre (en haut)
├── Cadre régulier (fixe)
├── Aménagements (fixe)
├── Accordéon Cours (avec dropdown)
├── Accordéon Groupes (cartes)
└── Accordéon Horaire (lié au groupe actif)
```

**Fichiers impactés** :
- `index.html` : Structure HTML de l'onglet
- `js/trimestre.js` : Logique existante à adapter
- `js/cours.js` : Logique existante à adapter
- `js/groupe.js` : Logique existante à adapter
- `js/horaire.js` : Logique existante à adapter
- `styles.css` : Styles pour accordéons et dropdowns

**Tâches** :
- [ ] 2.1 Créer le dropdown de sélection du trimestre
- [ ] 2.2 Migrer le contenu "Cadre régulier" depuis l'ancienne section
- [ ] 2.3 Migrer le contenu "Aménagements" depuis l'ancienne section
- [ ] 2.4 Créer l'accordéon Cours avec dropdown de sélection
- [ ] 2.5 Créer l'accordéon Groupes avec cartes
- [ ] 2.6 Créer l'accordéon Horaire lié au groupe actif
- [ ] 2.7 Implémenter la logique de cascade (trimestre → cours → groupes → horaire)
- [ ] 2.8 Tester tous les flux

**Critères de succès** :
- Changer de trimestre recharge les cours
- Changer de cours recharge les groupes
- Activer un groupe met à jour l'horaire
- Toutes les données existantes restent accessibles

**Durée estimée** : 4-6 heures

---

### Phase 3 : Implémenter l'onglet Pratique de notation

**Objectif** : Configuration pédagogique par groupe-cours

**Structure** :
```
Pratique de notation
├── Dropdown groupe-cours actif (en haut)
├── Carte résumé de la pratique
├── Accordéon Échelle de performance
├── Accordéon Grille de critères
├── Accordéon Portfolio
├── Accordéon Système de jetons
└── Accordéon Méthode de calcul
```

**Fichiers impactés** :
- `index.html` : Structure HTML de l'onglet
- `js/pratiques.js` : Refactorer pour supporter multi groupe-cours
- `styles.css` : Styles accordéons

**Tâches** :
- [ ] 3.1 Créer le dropdown de sélection groupe-cours
- [ ] 3.2 Créer la carte résumé de la pratique active
- [ ] 3.3 Migrer l'accordéon Échelle depuis la section legacy
- [ ] 3.4 Migrer l'accordéon Grille depuis la section legacy
- [ ] 3.5 Migrer l'accordéon Portfolio depuis la section legacy
- [ ] 3.6 Migrer l'accordéon Jetons depuis la section legacy
- [ ] 3.7 Créer l'accordéon Méthode de calcul
- [ ] 3.8 Implémenter le stockage par groupe-cours
- [ ] 3.9 Bouton "Parcourir bibliothèque" (ouvre modal)
- [ ] 3.10 Tester avec plusieurs groupe-cours

**Critères de succès** :
- Chaque groupe-cours peut avoir sa propre pratique
- Modifier la pratique d'un groupe n'affecte pas les autres
- Les accordéons affichent les bonnes données selon le groupe sélectionné

**Durée estimée** : 4-6 heures

---

### Phase 4 : Implémenter l'onglet Préférences

**Objectif** : Personnalisation de l'expérience utilisateur

**Structure** :
```
Préférences
├── Carte "Outils à exploiter" (checkboxes)
├── Carte "Affichage des ressources" (checkboxes)
└── Carte "Seuils d'interprétation" (inputs)
```

**Fichiers impactés** :
- `index.html` : Structure HTML
- `js/pratiques.js` ou nouveau `js/preferences.js` : Logique
- Tous les modules qui lisent ces préférences

**Tâches** :
- [ ] 4.1 Créer la structure HTML des 3 cartes
- [ ] 4.2 Implémenter les checkboxes "Outils à exploiter"
- [ ] 4.3 Implémenter les checkboxes "Affichage des ressources"
- [ ] 4.4 Migrer les seuils d'interprétation depuis la section legacy
- [ ] 4.5 Sauvegarder les préférences dans localStorage
- [ ] 4.6 Appliquer les préférences au chargement (masquer sections désactivées)
- [ ] 4.7 Tester l'impact sur toute l'application

**Critères de succès** :
- Désactiver RàI masque les sections RàI partout
- Les préférences persistent au rechargement
- Les seuils affectent les couleurs et diagnostics

**Durée estimée** : 2-3 heures

---

### Phase 5 : Implémenter l'onglet Données

**Objectif** : Gestion des données (import/export, snapshots)

**Structure** :
```
Données
├── Carte Import/Export
├── Carte Snapshots (consultation)
└── Carte Réinitialisation (avec confirmation)
```

**Fichiers impactés** :
- `index.html` : Structure HTML
- `js/import-export.js` : Logique existante à réutiliser

**Tâches** :
- [ ] 5.1 Créer la structure HTML
- [ ] 5.2 Migrer l'interface Import/Export depuis la section legacy
- [ ] 5.3 Créer l'interface de consultation des snapshots
- [ ] 5.4 Créer l'interface de réinitialisation avec modal de confirmation
- [ ] 5.5 Tester import/export complet

**Critères de succès** :
- Import/Export fonctionne comme avant
- Les snapshots sont consultables
- La réinitialisation demande confirmation

**Durée estimée** : 2-3 heures

---

### Phase 6 : Sélecteur groupe-cours dans l'en-tête

**Objectif** : Changer de groupe-cours rapidement depuis n'importe où

**Fichiers impactés** :
- `index.html` : Ajouter dropdown dans l'en-tête
- `js/navigation.js` ou nouveau module : Logique de changement
- Tous les modules qui dépendent du groupe actif

**Tâches** :
- [ ] 6.1 Ajouter le dropdown dans l'en-tête HTML
- [ ] 6.2 Populer le dropdown avec les groupe-cours du trimestre actif
- [ ] 6.3 Implémenter le changement de groupe-cours
- [ ] 6.4 Recharger les données pertinentes au changement
- [ ] 6.5 Mettre à jour l'affichage partout
- [ ] 6.6 Tester depuis différentes sections

**Critères de succès** :
- Le dropdown affiche le groupe-cours actif
- Changer de groupe-cours met à jour toutes les données
- Le changement fonctionne depuis n'importe quelle section

**Durée estimée** : 2-3 heures

---

### Phase 7 (optionnelle) : Système d'archivage

**Objectif** : Archiver les trimestres terminés

**Tâches** :
- [ ] 7.1 Ajouter champ `archive: true/false` aux trimestres
- [ ] 7.2 Ajouter bouton "Archiver" sur chaque trimestre
- [ ] 7.3 Filtrer l'affichage (masquer archivés par défaut)
- [ ] 7.4 Ajouter toggle "Afficher les archives"
- [ ] 7.5 Permettre la restauration

**Durée estimée** : 1-2 heures

---

## Ordre d'exécution recommandé

| Ordre | Phase | Priorité | Raison |
|-------|-------|----------|--------|
| 1 | Phase 1 (Navigation) | Critique | Fondation pour tout le reste |
| 2 | Phase 2 (Trimestre) | Haute | Porte d'entrée de la configuration |
| 3 | Phase 3 (Pratique) | Haute | Résout le problème immédiat |
| 4 | Phase 4 (Préférences) | Moyenne | Améliore l'expérience |
| 5 | Phase 5 (Données) | Moyenne | Fonctionnalité existante à migrer |
| 6 | Phase 6 (Sélecteur) | Moyenne | Confort d'utilisation |
| 7 | Phase 7 (Archivage) | Basse | Peut attendre |

**Durée totale estimée** : 15-22 heures de travail

---

## Règles de développement

### Avant chaque phase
1. Créer une branche Git dédiée
2. Documenter l'état actuel (captures d'écran si utile)
3. Définir les critères de succès

### Pendant le développement
1. Commits fréquents et atomiques
2. Messages de commit descriptifs
3. Tester après chaque modification

### Après chaque phase
1. Tester manuellement tous les flux utilisateur
2. Vérifier qu'il n'y a pas de régression
3. Merger dans main seulement si tout fonctionne
4. Documenter les changements

---

## Notes de session

### 18 décembre 2025

**Contexte** : Échec de la première tentative Beta 95 (trop ambitieuse, perte de contrôle). Retour à Beta 94 stable.

**Travail accompli** :

1. **Modèle conceptuel défini** :
   - Hiérarchie : Trimestre → Cours → Groupe-cours
   - Distinction cours (curriculaire) vs groupe-cours (instance pédagogique)
   - Chaque groupe-cours a sa propre pratique de notation

2. **Architecture des Réglages** :
   - 4 onglets : Trimestre, Pratique de notation, Préférences, Données
   - Matériel pédagogique = section principale séparée (pas dans Réglages)

3. **Principes de design** :
   - Dropdowns au lieu de sidebars
   - Respect strict du Design System
   - Modals = couche meta (bibliothèques, aide) uniquement
   - Pages/sections = travail quotidien

4. **Plan d'implémentation** :
   - 7 phases progressives et autonomes
   - Chaque phase testable indépendamment
   - Durée totale estimée : 15-22 heures

**Prochaine étape** : Phase 2 - Implémenter l'onglet Trimestre

### Session 2 - 18 décembre 2025 (suite)

**Phase 1 complétée** : Restructuration navigation Réglages

**Modifications apportées** :

1. **config.js** (ligne 57-62) :
   - Ancienne configuration : 9 sous-sections (apercu, trimestre, cours, horaire, groupe, pratique-notation, interpretation, snapshots, import-export)
   - Nouvelle configuration : 4 onglets (trimestre, pratique-notation, preferences, donnees)

2. **index.html** :
   - Anciennes sous-sections renommées avec suffixe `-legacy` et classe `legacy-hidden` :
     * `reglages-apercu` → `reglages-apercu-legacy`
     * `reglages-trimestre` → `reglages-trimestre-legacy`
     * `reglages-cours` → `reglages-cours-legacy`
     * `reglages-horaire` → `reglages-horaire-legacy`
     * `reglages-groupe` → `reglages-groupe-legacy`
     * `reglages-pratique-notation` → `reglages-pratique-notation-legacy`
     * `reglages-interpretation` → `reglages-interpretation-legacy`
     * `reglages-snapshots` → `reglages-snapshots-legacy`
     * `reglages-import-export` → `reglages-import-export-legacy`
   - 4 nouvelles sections créées (lignes 7453-7537) :
     * `reglages-trimestre` : Placeholder Phase 2
     * `reglages-pratique-notation` : Placeholder Phase 3
     * `reglages-preferences` : Placeholder Phase 4
     * `reglages-donnees` : Placeholder Phase 5

3. **styles.css** (ligne 297) :
   - Ajout classe `.legacy-hidden { display: none !important; }`

**Résultat** : Navigation Réglages affiche maintenant 4 onglets avec conteneurs vides prêts pour les phases suivantes

---

**Phase 2 complétée** : Implémentation onglet Trimestre

**Structure HTML créée** (index.html, lignes 7458-7680) :
- Dropdown sélection trimestre avec bouton "+ Nouveau"
- Carte "Cadre régulier" : Bornes du trimestre + Semaines spéciales
- Carte "Aménagements" : Congés prévus/imprévus + Données démo
- Accordéon "Cours" : Dropdown + Zone détails
- Accordéon "Groupes" : Liste des groupes avec boutons Activer/Gérer
- Accordéon "Horaire" : Affichage horaire du groupe actif

**Styles CSS ajoutés** (styles.css, lignes 995-1044) :
- `.carte.accordeon` : Structure accordéon avec header cliquable
- `.accordeon-header` : En-tête avec gradient bleu
- `.accordeon-chevron` : Animation rotation lors ouverture/fermeture
- `.accordeon-contenu` : Transition fluide du contenu
- `.carte.accordeon.ferme` : État fermé de l'accordéon

**JavaScript créé** :
- `js/trimestre-v2.js` (nouveau fichier, ~500 lignes)
  * `initialiserTrimestreV2()` : Initialisation au chargement
  * `chargerCadreCalendrierV2()` / `sauvegarderCadreCalendrierV2()` : Gestion cadre
  * `chargerEvenementsPrevusV2()` / `chargerEvenementsImprevusV2()` : Événements
  * `chargerDropdownCoursV2()` / `changerCoursSelectionneV2()` : Gestion cours
  * `chargerGroupesCoursV2()` / `activerGroupeV2()` : Gestion groupes
  * `chargerHoraireGroupeActifV2()` : Affichage horaire
- `js/pratiques.js` : Ajout `toggleAccordeonV2()` (lignes 4929-4943)

**Synchronisation avec données existantes** :
- Les champs v2- utilisent les mêmes clés localStorage que l'ancienne interface
- `cadreCalendrier`, `evenementsPrevus`, `evenementsImprevus`, `infoCours`, `groupeEtudiants`, `horaireHebdo`
- Modifications dans un onglet reflétées dans l'autre

**Fonctionnalités temporairement déléguées à l'ancienne interface** :
- Ajout/modification événements (formulaires complexes)
- Édition cours détaillée
- Gestion étudiants
- Configuration horaire

**Prochaine étape** : Phase 3 - Implémenter l'onglet Pratique de notation

---

**Phase 3 complétée** : Implémentation onglet Pratique de notation

**Structure HTML créée** (index.html, lignes 7682-7960) :
- Dropdown sélection groupe-cours actif
- Carte "Pratique associée" : Résumé de la configuration + Type de pratique
- Accordéon "Options d'affichage" : Mode comparatif, SOLO, RàI, grille de référence
- Accordéon "Configuration du portfolio" : Modalité de sélection, nombre d'artefacts
- Accordéon "Système de jetons" : Nombre, délai, reprise, reprise ciblée
- Accordéon "Méthode de calcul" : Résumé des formules par type
- Bouton "Sauvegarder toutes les configurations"

**JavaScript créé** :
- `js/pratique-notation-v2.js` (nouveau fichier, ~500 lignes)
  * `initialiserPratiqueNotationV2()` : Initialisation au chargement
  * `chargerDropdownGroupeCoursV2()` : Liste des groupe-cours
  * `chargerDropdownGrillesV2()` : Liste des grilles de référence
  * `chargerValeursDepuisStorage()` : Lecture depuis modalitesEvaluation
  * `sauvegarderOptionsAffichageV2()` / `sauvegarderPortfolioV2()` / `sauvegarderJetonsV2()` : Sauvegarde
  * `mettreAJourResumePratique()` : Résumé visuel de la configuration
  * `modifierPratiqueV2()` / `ouvrirBibliothequePratiquesV2()` : Redirection vers legacy

**Synchronisation avec données existantes** :
- Utilise la clé `modalitesEvaluation` du localStorage
- Compatible avec l'ancienne interface (même structure de données)
- Redirection vers interface legacy pour édition avancée

**Fonctionnalités temporairement déléguées à l'ancienne interface** :
- Wizard de création de pratique
- Bibliothèque des pratiques
- Configuration avancée (règles de conformité, catégorisation erreurs)

---

## Phase 2 : Reconnexion des fonctionnalités (18 décembre 2025)

### Contexte

Les Phases 1-5 ont créé la structure visuelle des 4 onglets mais plusieurs fonctionnalités existantes dans les sections legacy ne sont pas reconnectées. L'application a perdu des capacités fonctionnelles.

### Analyse des écarts

#### ✅ Fonctionnel (9 éléments)
- Trimestre : bornes du trimestre, semaines spéciales
- Préférences : mode comparatif, SOLO, RàI, grille référence
- Données : import/export complet, config pédagogique, stats snapshots

#### ⚠️ Placeholders - HTML existe, JS incomplet (5 éléments)
- Pratique : type de pratique, échelle, configuration portfolio
- Données : boutons d'action snapshots (dans accordéon mais non connectés)

#### ❌ Absentes de v2 (13 éléments)

| Section legacy | Fonctionnalités manquantes |
|----------------|---------------------------|
| `reglages-cours-legacy` | Configuration cours, bibliothèque cours |
| `reglages-horaire-legacy` | Gestion des séances, ajout/suppression |
| `reglages-groupe-legacy` | Gestion étudiants, import CSV, export, filtrage |
| `reglages-interpretation-legacy` | Seuils configurables, découpler P/R, fenêtre patterns |
| `reglages-snapshots-legacy` | Actions : capture manuelle, reconstruction, nettoyage |
| `reglages-pratique-notation-legacy` | Bibliothèque pratiques, wizard, catégorisation erreurs |

---

### Plan de reconnexion

#### R1. Onglet Trimestre - Accordéon Cours
**Objectif** : Reconnecter la configuration du cours actif

**Fonctions à connecter** :
- `afficherFormCours()` : Formulaire création/édition cours
- `sauvegarderCours()` : Sauvegarde configuration
- `ouvrirModalBibliothequeCours()` : Bibliothèque de cours

**Tâches** :
- [ ] R1.1 Ajouter formulaire cours dans accordéon (sigle, titre, pondération, enseignant)
- [ ] R1.2 Connecter bouton "Modifier" au formulaire
- [ ] R1.3 Connecter bouton "Bibliothèque" à `ouvrirModalBibliothequeCours()`
- [ ] R1.4 Afficher résumé du cours actif quand accordéon fermé

---

#### R2. Onglet Trimestre - Accordéon Groupes
**Objectif** : Reconnecter la gestion des étudiants

**Fonctions à connecter** :
- `ouvrirImportEtudiants()` : Import CSV/TSV
- `exporterEtudiants()` : Export liste étudiants
- `ajouterEtudiant()` : Ajout manuel
- `filtrerParGroupe()` : Filtrage par groupe

**Tâches** :
- [ ] R2.1 Ajouter boutons "Importer CSV" et "Exporter" dans chaque carte groupe
- [ ] R2.2 Connecter bouton "Gérer étudiants" vers section Étudiants ou modal
- [ ] R2.3 Afficher compteur étudiants dans résumé groupe

---

#### R3. Onglet Trimestre - Accordéon Horaire
**Objectif** : Reconnecter la configuration des séances

**Fonctions à connecter** :
- `afficherFormAjoutSeance()` : Formulaire ajout séance
- `sauvegarderSeance()` : Sauvegarde séance
- `supprimerSeance()` : Suppression séance
- `nettoyerDoublons()` : Nettoyage doublons

**Tâches** :
- [ ] R3.1 Afficher liste des séances configurées dans accordéon
- [ ] R3.2 Ajouter bouton "+ Ajouter une séance"
- [ ] R3.3 Connecter formulaire (jour, heure début, durée)
- [ ] R3.4 Permettre suppression de séances existantes

---

#### R4. Onglet Trimestre - Aménagements
**Objectif** : Reconnecter la gestion des congés et reprises

**Fonctions à connecter** :
- `ajouterEvenementPrevu()` : Ajout congé prévu
- `ajouterEvenementImprevu()` : Ajout congé imprévu
- `supprimerEvenement()` : Suppression événement

**Tâches** :
- [ ] R4.1 Vérifier que les listes d'événements s'affichent
- [ ] R4.2 Connecter boutons "+ Ajouter" aux fonctions existantes
- [ ] R4.3 Permettre suppression d'événements

---

#### R5. Onglet Pratique de notation
**Objectif** : Compléter les fonctionnalités de configuration

**Fonctions à connecter** :
- `ouvrirModalBibliothequePratiques()` : Bibliothèque pratiques
- `ouvrirWizardPratique()` : Assistant création pratique
- `activerPratiqueAffichee()` : Activation pratique

**Tâches** :
- [ ] R5.1 Ajouter bouton "Bibliothèque des pratiques"
- [ ] R5.2 Ajouter bouton "Assistant de création" (wizard)
- [ ] R5.3 Compléter `sauvegarderStructureV2()` pour portfolio
- [ ] R5.4 Compléter `sauvegarderJetonsV2()` pour système jetons
- [ ] R5.5 Vérifier synchronisation avec `modalitesEvaluation`

---

#### R6. Onglet Préférences - Seuils d'interprétation
**Objectif** : Reconnecter la configuration des seuils

**Fonctions à connecter** :
- `sauvegarderSeuil()` : Sauvegarde seuil individuel
- `mettreAJourAffichageSeuil()` : Mise à jour affichage slider

**Tâches** :
- [ ] R6.1 Vérifier que les inputs seuils (fragile, acceptable, bon) fonctionnent
- [ ] R6.2 Ajouter slider "Fenêtre d'analyse patterns" (nombre productions)
- [ ] R6.3 Ajouter option "Découpler P et R" si pertinent
- [ ] R6.4 Connecter bouton "Restaurer défauts"

---

#### R7. Onglet Données - Actions Snapshots
**Objectif** : Reconnecter les actions sur les snapshots

**Fonctions à connecter** :
- `capturerSnapshotManuel()` : Capture immédiate
- `lancerReconstructionRetroactive()` : Reconstruction historique
- `confirmerNettoyageSnapshots()` : Suppression avec confirmation

**Tâches** :
- [ ] R7.1 Vérifier que les boutons dans l'accordéon appellent les bonnes fonctions
- [ ] R7.2 Tester capture manuelle
- [ ] R7.3 Tester reconstruction rétroactive
- [ ] R7.4 Tester suppression avec confirmation

---

### Ordre de priorité recommandé

| Priorité | Phase | Raison |
|----------|-------|--------|
| 1 | R7 (Snapshots) | Boutons déjà présents, juste vérifier connexion |
| 2 | R6 (Seuils) | Éléments déjà présents dans Préférences |
| 3 | R4 (Aménagements) | Partiellement fonctionnel |
| 4 | R3 (Horaire) | Nécessaire pour calendrier/présences |
| 5 | R2 (Groupes) | Nécessaire pour gestion étudiants |
| 6 | R1 (Cours) | Configuration de base |
| 7 | R5 (Pratique) | Fonctionnalités avancées |

---

### Critères de succès global

- [ ] Toutes les fonctionnalités de Beta 94 sont accessibles dans Beta 95
- [ ] Aucune section legacy n'est nécessaire pour l'usage quotidien
- [ ] Les données existantes restent compatibles
- [ ] Pas de régression fonctionnelle

