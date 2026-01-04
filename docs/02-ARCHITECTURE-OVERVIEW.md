# Architecture mentale de Codex Numeris

**Version** : 2.0 (post-reorganisation)
**Date** : 1er janvier 2026
**Auteur** : Gregoire Bedard

---

## Vision philosophique

Codex Numeris est un **systeme de suivi de l'apprentissage** qui permet de :
1. Detecter precocement les etudiants a risque
2. Intervenir de facon ciblee selon le modele RaI
3. Suivre l'efficacite des interventions
4. S'adapter a differentes pratiques pedagogiques

**Ce n'est PAS un systeme de notation traditionnel.**
C'est un systeme de **detection et d'intervention preventive**.

---

## Hierarchie conceptuelle (pas technique)

```
TRIMESTRE (conteneur temporel)
    |
COURS (conteneur pedagogique)
    |
GROUPE (cohorte d'etudiants)
    |
ETUDIANTS + PRODUCTIONS + EVALUATIONS
```

Cette hierarchie est **SACREE**. Tout le reste decoule de ca.

**Exemples concrets** :
- Trimestre : A2025, H2026
- Cours : 601-101, 601-102, 601-103
- Groupe : 01, 02, 9999 (demo)
- Etudiants : 30 etudiants dans le groupe 01

---

## Flux de donnees (vision 10,000 pieds)

```
1. ENTREE
   Prof configure : trimestre + cours + groupe
   Prof cree : productions (artefacts, evaluations)

2. SUIVI QUOTIDIEN
   Prof saisit : presences (indices A)
   Prof evalue : productions (notes IDME)

3. CALCUL AUTOMATIQUE
   Systeme genere : indices C (completion) et P (performance)
   Systeme combine : A-C-P -> Engagement

4. DIAGNOSTIC
   Systeme detecte : patterns de risque
   Systeme recommande : interventions RaI (niveaux 1-2-3)

5. INTERVENTION
   Prof consulte : diagnostics + recommandations
   Prof agit : selon niveau RaI identifie
   Prof note : resultats des interventions
```

---

## Principes architecturaux fondamentaux

### 1. Single Source of Truth

**Regle** : Chaque donnee a UNE source qui la genere et la stocke.
**Consequence** : Tous les autres modules LISENT, ne recalculent JAMAIS.

**Pourquoi** : Coherence pedagogique absolue. Un etudiant ne peut pas avoir deux moyennes differentes selon ou on regarde.

**Exemple** :
- `trimestre.js` GENERE -> `calendrierComplet`
- `calendrier-vue.js` LIT -> `calendrierComplet`
- Si `calendrier-vue.js` recalculait -> risque d'incoherence

### 2. Separation par contexte (namespacing)

**Regle** : Les donnees de chaque trimestre sont isolees.
**Format** : `{trimestreId}_{cleOriginal}`

**Pourquoi** : Un prof peut enseigner plusieurs trimestres. Les donnees ne doivent JAMAIS se melanger.

**Exemple** :
- A2025 : `a2025_calendrierComplet`
- H2026 : `h2026_calendrierComplet`
- Jamais de confusion entre les deux

### 3. Delegation aux pratiques

**Regle** : Le calcul des indices P depend de la pratique de notation configuree.
**Mecanisme** : Interface `IPratique` que chaque pratique implemente.

**Pourquoi** : Respect des pratiques pedagogiques. Chaque enseignant a sa methode.

**Pratiques supportees** :
- PAN-Maitrise (IDME + SRPNF) - Gregoire
- Sommative traditionnelle
- PAN-Standards (par objectifs ou artefacts)

### 4. Modules proteges

**Regle** : Certains modules sont la colonne vertebrale et ne peuvent etre modifies sans risque majeur.

**Liste** :
- `config.js` : Configuration globale navigation
- `navigation.js` : Logique de navigation
- `noms_stables.json` : IDs/classes CSS proteges

**Pourquoi** : Une erreur ici casse l'application entiere.

---

## Decisions philosophiques fondamentales

### Pourquoi "Single Source of Truth" ?

**Question** : Pourquoi ne pas permettre a chaque module de calculer ce dont il a besoin ?

**Reponse** : Parce qu'un etudiant ne peut pas avoir deux moyennes differentes selon ou tu regardes. C'est une question de **coherence pedagogique**, pas technique.

Si `profil-etudiant.js` calcule une moyenne de 75% et `tableau-bord.js` calcule 76%, lequel est le vrai ? C'est inacceptable pedagogiquement.

### Pourquoi le namespacing ?

**Question** : Pourquoi ne pas simplement ecraser les anciennes donnees ?

**Reponse** : Parce qu'un prof peut enseigner A2025 puis H2026. Les donnees ne doivent JAMAIS se melanger. C'est une question de **separation des contextes**.

Un etudiant de A2025 ne doit jamais apparaitre dans les listes de H2026 par accident.

### Pourquoi les pratiques modulaires ?

**Question** : Pourquoi ne pas coder en dur PAN-Maitrise puisque c'est ta pratique ?

**Reponse** : Parce que chaque prof a sa pedagogie. L'application doit s'adapter, pas l'inverse. C'est une question de **respect des pratiques**.

Si l'application impose PAN-Maitrise, elle ne sert qu'a Gregoire. Si elle s'adapte, elle sert a tout le reseau collegial.

---

## Ce qui peut changer vs ce qui est immuable

### IMMUABLE (architecture fondamentale)

Ces elements ne peuvent PAS changer sans reecrire l'application :

- Hierarchie Trimestre -> Cours -> Groupe -> Etudiants
- Single Source of Truth
- Separation par coursId
- Interface IPratique pour les pratiques
- Indices A-C-P comme base du diagnostic

### FLEXIBLE (implementation)

Ces elements peuvent evoluer sans casser l'architecture :

- Comment on calcule les indices (delegue aux pratiques)
- Comment on affiche l'information (UI)
- Ou on stocke les donnees (localStorage -> IndexedDB -> ?)
- Quelles pratiques de notation on supporte
- Format d'import/export

---

## Pour futurs contributeurs

### Ce que tu peux faire

- Ajouter une nouvelle pratique de notation (implementer IPratique)
- Ameliorer l'interface utilisateur
- Optimiser les calculs
- Ajouter des graphiques/visualisations
- Ameliorer l'export de donnees
- Traduire l'interface

### Ce que tu ne peux PAS faire

- Casser le Single Source of Truth
- Melanger les donnees de differents trimestres
- Coder en dur des calculs de pratiques dans indices-cp.js
- Modifier les modules proteges sans discussion
- Changer la hierarchie Trimestre -> Cours -> Groupe

---

## Architecture technique (pour developpeurs)

### Stockage des donnees

**Systeme hybride** (Beta 91.1+) :
- `IndexedDB` : Stockage persistant asynchrone (plusieurs GB)
- `localStorage` : Cache synchrone pour performance (acces 0ms)
- `db.js` : API unifiee qui orchestre les deux

### Communication entre modules

**Regle** : Les modules ne se parlent JAMAIS directement.
**Mecanisme** : Communication via localStorage uniquement.

```
trimestre.js (SOURCE)
    | stocke dans
localStorage.calendrierComplet
    | lu par
calendrier-vue.js (LECTEUR)
```

### Systeme de pratiques

**Architecture** :
```
indices-cp.js (orchestrateur)
    | appelle
pratique-registre.js
    | retourne instance
pratique-pan-maitrise.js | pratique-sommative.js | ...
    | calcule
indices C et P specifiques a la pratique
```

---

## Histoire du projet (contexte pour comprendre l'etat actuel)

### Aout-novembre 2025 : Developpement initial
- Tableur Numbers -> Application web
- Developpement avec Claude Sonnet 4.5 (plan Max 5x)
- Architecture initiale sans namespacing

### Novembre 2025 : Pivot architectural
- Passage a Claude Code (Max 20x)
- Introduction du systeme de pratiques modulaires
- Introduction du namespacing (Beta 95)

### Decembre 2025 : Stabilisation
- Donnees A2025 = legacy pre-namespacing (15 semaines)
- Migration partielle vers namespacing
- Etat hybride persistant (identifie 31 dec 2025)

### Janvier 2026 (prevu) : Tests reseau
- Stabilisation complete
- Migration A2025 finalisee
- Tests avec collegues du reseau

### Juin 2026 (objectif) : Presentation AQPC
- Version 1.0 stable
- Open-source (licence AGPL v3)

---

**Cette architecture est le fruit de 5 mois d'experimentation et de 95 versions beta.**
**Elle reflete des choix pedagogiques autant que techniques.**
**Respecte-la, et le projet restera coherent.**
