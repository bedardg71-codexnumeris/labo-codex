# Primo — Parcours de création de matériel pédagogique

## Contexte

Ce document décrit le parcours existant dans l'assistant Primo qui guide les utilisateurs dans la création de matériel pédagogique : échelles de performance, grilles de critères, productions et cartouches de rétroaction. L'objectif est de le rénover pour qu'il devienne un assistant **actif** (qui crée le matériel) plutôt que **passif** (qui décrit comment le faire).

---

## Architecture de Primo

Primo est un assistant conversationnel modal intégré à l'application Monitorage. Il est composé de 5 fichiers :

| Fichier | Rôle |
|---------|------|
| `js/primo-modal.js` | Interface modale (rendu des questions, navigation, validation) |
| `js/primo-questions.js` | Arbre de questions avec branchement conditionnel (`QUESTIONS_PRIMO`) |
| `js/primo-accueil.js` | Écran d'accueil premier lancement + déclencheurs |
| `js/primo-validation-champs.js` | Validation visuelle des champs dans l'interface |
| `js/primo-tooltips.js` | Popups d'aide contextuelle |

### Fonctionnement de la conversation

- Les questions sont dans un tableau `QUESTIONS_PRIMO` (environ 60 questions).
- Chaque question a un `id`, un `texte`, un `type` (text, number, radio, select, instruction, action, message...), et un `sautSi: function(reponses)` qui permet de sauter dynamiquement selon les réponses précédentes.
- La navigation est linéaire (suivant/précédent) avec sauts conditionnels.
- Après l'étape 8, Primo passe en « mode notification » : il se réduit à des bulles en haut à droite pendant que l'utilisateur navigue librement.

---

## Le parcours actuel (étapes 7 à 14)

Le parcours de création de matériel est la seconde moitié de Primo. Il commence après la configuration du cours (étapes 1-6) et se trouve dans `js/primo-questions.js`, lignes 1684 à 1910.

### Étape 7 — Préparation matériel pédagogique
- **Type** : Instruction passive
- **Contenu** : Demande à l'utilisateur d'ouvrir le dossier `materiel-demo/` sur son disque pour y trouver 3 fichiers JSON :
  - `echelle-idme.json` — Échelle de performance IDME (4 niveaux : Insuffisant, En développement, Maîtrisé, Exemplaire)
  - `grille-srpnf.json` — Grille de critères SRPNF (5 critères)
  - `cartouches-srpnf.json` — Cartouches de rétroaction liées à cette grille
- **Problème** : L'utilisateur doit trouver un dossier de fichiers sur son disque. Friction maximale, surtout pour des enseignants peu à l'aise avec la gestion de fichiers.

### Étape 8 — Transition en mode notification
- **Type** : Action automatique (`passerEnModeNotification`)
- **Contenu** : Primo annonce qu'il se transforme en « assistant discret » (notifications en haut à droite) pendant que l'utilisateur navigue librement.
- **Problème** : L'utilisateur perd le contexte du dialogue. Les notifications sont faciles à ignorer.

### Étape 9 — Import de l'échelle IDME
- **Type** : Instruction pas-à-pas (6 sous-étapes textuelles)
- **Contenu** :
  1. Aller dans Matériel → Échelles de performance
  2. Cliquer Nouvelle échelle
  3. Cliquer Options d'import/export
  4. Cliquer Importer une échelle
  5. Sélectionner le fichier `echelle-idme.json`
  6. Confirmer l'importation
- **Problème** : Primo ne fait rien — il décrit la marche à suivre. Aucune validation que l'import a réussi.

### Étape 10 — Import de la grille SRPNF
- **Type** : Instruction pas-à-pas (6 sous-étapes textuelles)
- **Contenu** : Même patron que l'étape 9, mais pour la grille de critères.
- **Problème** : Identique — passif, sans validation.

### Étape 11 — Création d'une production
- **Type** : Instruction pas-à-pas
- **Contenu** :
  1. Aller dans Matériel → Productions
  2. Cliquer Nouvelle production
  3. Remplir le formulaire (titre, description, type, pondération, grille liée)
  4. Sauvegarder
- **Problème** : L'utilisateur doit deviner les bonnes valeurs. Primo ne pré-remplit rien.

### Étape 12 — Création d'une évaluation
- **Type** : 3 sous-questions d'instruction
- **Contenu** :
  1. Aller dans Évaluations → Évaluer une production
  2. Choisir un étudiant et la production créée
  3. Attribuer des niveaux pour chaque critère
  4. Sauvegarder
- **Problème** : Passif. Primo suggère des valeurs spécifiques (« Critère A : M, Critère B : I ») qui ne correspondent pas forcément à la grille importée.

### Étapes 13-14 — Présences, tableau de bord, conclusion
- Visite guidée passive du reste de l'application.
- Questions radio « J'ai essayé / Je vais le faire plus tard ».

---

## Ce que le parcours ne couvre PAS

1. **Cartouches de rétroaction** — Le fichier `cartouches-srpnf.json` est mentionné dans le dossier mais aucune étape ne guide son import ni sa création.
2. **Création assistée** — Primo ne crée jamais rien lui-même. Il se contente de décrire des clics à faire.
3. **Validation** — Primo ne vérifie jamais si le matériel a été créé. L'utilisateur peut cliquer « Suivant » sans rien faire.
4. **Personnalisation** — Les exemples sont codés en dur (IDME, SRPNF). Aucune adaptation au type de pratique choisi aux étapes 1-6.

---

## Objets de matériel pédagogique dans l'application

### Échelle de performance

Une échelle définit les niveaux de maîtrise utilisés pour évaluer (ex : I-D-M-E).

```javascript
{
  id: 'echelle-idme',
  nom: 'Échelle IDME',
  niveaux: [
    { niveau: 1, label: 'Insuffisant',        abreviation: 'I', couleur: '#ff9800' },
    { niveau: 2, label: 'En développement',    abreviation: 'D', couleur: '#ffc107' },
    { niveau: 3, label: 'Maîtrisé',           abreviation: 'M', couleur: '#4caf50' },
    { niveau: 4, label: 'Exemplaire',          abreviation: 'E', couleur: '#2196f3' }
  ]
}
```

**Stockage** : `echellesTemplates` (tableau d'échelles dans IndexedDB).

### Grille de critères

Une grille définit les critères d'évaluation avec leurs descriptions et pondérations.

```javascript
{
  id: 'grille-srpnf',
  nom: 'Grille SRPNF',
  description: 'Grille basée sur les critères SRPNF',
  criteres: [
    { nom: 'Situation du problème',    description: '...', poids: 20 },
    { nom: 'Raisonnement',            description: '...', poids: 20 },
    { nom: 'Procédures',              description: '...', poids: 20 },
    { nom: 'Notation formelle',        description: '...', poids: 20 },
    { nom: 'Fonctions langagières',    description: '...', poids: 20 }
  ],
  dateCreation: '2025-11-27T...'
}
```

**Stockage** : `grillesTemplates` (tableau de grilles dans IndexedDB).

### Production

Une production est un travail à évaluer (examen, dissertation, portfolio, etc.).

```javascript
{
  id: 'PROD-PRIMO-1707000000',
  titre: 'Analyse littéraire',
  description: 'Analyse d\'un texte narratif',
  type: 'artefact',     // quiz | travail | examen | artefact | portfolio
  ponderation: 20,       // Poids dans la note finale (1-100)
  objectif: '...',       // Objectif d'apprentissage visé
  tache: '...',          // Description de la tâche
  grilleId: 'grille-srpnf',  // Grille liée pour l'évaluation
  verrouille: false
}
```

**Stockage** : `productions` (tableau de productions dans IndexedDB, préfixé par trimestre).

### Cartouche de rétroaction

Une cartouche est un modèle de rétroaction pré-rédigée associée à un critère de grille et un niveau d'échelle. Elle permet de générer automatiquement une rétroaction personnalisée.

```javascript
{
  id: 'cartouche-srpnf-c1-n3',
  grilleId: 'grille-srpnf',
  critereIndex: 0,           // Index du critère dans la grille
  niveau: 3,                 // Niveau d'échelle (1-4)
  texte: 'Tu as correctement identifié la situation-problème et formulé une hypothèse pertinente.',
  couleur: '#4caf50',
  auteur: 'Grégoire Bédard'
}
```

**Stockage** : `cartouchesRetroaction` (tableau dans IndexedDB). Chaque cartouche fait le pont entre un critère de grille et un niveau d'échelle pour offrir une rétroaction pré-rédigée.

### Relations entre les objets

```
Échelle de performance (ex: IDME — 4 niveaux)
    ↕ utilisée par
Grille de critères (ex: SRPNF — 5 critères)
    ↕ liée à
Production (ex: Analyse littéraire — 20%)
    ↕ évaluée via
Évaluation individuelle (étudiant × production × niveaux par critère)
    ↕ génère
Rétroaction (assemblée depuis les cartouches : critère × niveau attribué)

Cartouches de rétroaction = matrice (critères × niveaux)
    → Pour chaque combinaison critère + niveau, un texte de rétroaction pré-rédigé
```

---

## Problèmes à résoudre

### 1. L'assistant est passif
Primo **décrit** ce que l'utilisateur doit faire au lieu de **le faire avec lui**. Un enseignant novice se retrouve seul à chercher les bons boutons dans une interface qu'il ne connaît pas.

### 2. Dépendance aux fichiers JSON externes
L'import de matériel repose sur des fichiers JSON dans un dossier `materiel-demo/`. C'est un obstacle technique inutile — l'assistant devrait pouvoir créer le matériel directement.

### 3. Aucune adaptation au contexte
Le parcours propose toujours la même échelle (IDME) et la même grille (SRPNF), quel que soit le type de pratique choisi. Si l'utilisateur a choisi « Sommative » aux étapes 1-6, il n'a pas besoin d'une échelle de niveaux.

### 4. Les cartouches sont oubliées
Aucune étape ne guide la création ni l'import des cartouches de rétroaction, alors qu'elles sont essentielles pour générer des rétroactions automatiques.

### 5. Aucune validation
Primo ne vérifie jamais si le matériel a été créé. L'utilisateur peut traverser tout le parcours sans rien produire.

### 6. Textes obsolètes
Références à « index 92.html », « Grille Test », « Critère A et B » — ne correspondent plus à l'état actuel de l'application.

---

## Vision de la rénovation

Transformer ce parcours passif en un **assistant actif** qui :

1. **Crée le matériel directement** dans l'application (pas de fichiers JSON à importer)
2. **Pose des questions concrètes** pour personnaliser chaque objet (« Comment s'appelle ton échelle ? Combien de niveaux ? »)
3. **Adapte le parcours** au type de pratique choisi (Sommative → pas d'échelle ; PAN-Standards → échelle + grille ; PAN-Spécifications → grille de spécifications)
4. **Inclut les cartouches** comme étape naturelle après la grille
5. **Valide** que chaque objet a bien été créé avant de passer à l'étape suivante
6. **Propose des modèles** de départ (comme le wizard V2 le fait déjà pour la grille de base à 4 critères)
