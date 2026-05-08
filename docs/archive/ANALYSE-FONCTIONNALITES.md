# Analyse des fonctionnalites - Monitorage Pedagogique

> **Pour** : Presentation externe Claude Cowork
> **Version analysee** : Beta 95.7
> **Date** : 20 janvier 2026
> **Auteur du projet** : Gregoire Bedard (Cegep de Drummondville, Labo Codex)

---

## I. Presentation generale

### Positionnement

**Monitorage Pedagogique** est une application web autonome (100% client-side) de suivi formatif des apprentissages au niveau collegial. Elle fonctionne entierement hors ligne, ne requiert aucun serveur et conserve toutes les donnees localement.

### Technologies

- **Frontend** : HTML5 / CSS3 / JavaScript ES6+ pur (vanilla JS)
- **Stockage** : IndexedDB (persistance) + localStorage (cache synchrone)
- **Stack** : Zero dependances externes (excepte Chart.js pour visualisations)
- **Compatibilite** : Navigateurs modernes (Safari, Chrome, Firefox, Edge)
- **Licence** : CC BY-NC-SA 4.0 (usage educatif)

### Statistiques du projet

- **Volume** : ~50,000 lignes de code (HTML + CSS + JavaScript)
- **Modules JavaScript** : 54 fichiers
- **Versions Beta** : 95 versions developpees (0.01 -> 0.95)
- **Periode** : Septembre 2024 - Janvier 2026

---

## II. Grandes sections de l'application

### 1. Tableau de bord - Vue d'ensemble pedagogique

**Sous-sections** : Apercu, Liste des individus, Profil, Interventions RaI

#### Concept cle : Indices A-C-P-E

L'application repose sur quatre indices complementaires :

| Indice | Nom | Calcul |
|--------|-----|--------|
| **A** | Assiduite | Heures presentes / heures offertes |
| **C** | Completion | Productions remises / productions attendues |
| **P** | Performance | Niveau de maitrise selon echelle configuree |
| **E** | Engagement | Racine cubique de (A x C x P) |

**Plus-value** : Detection precoce des etudiants a risque avant decrochage.

---

### 2. Presences - Suivi de l'engagement

**Sous-sections** : Apercu, Vue calendaire, Saisie

- Saisie rapide en nombre de periodes
- Etats : Present, Absent, Justifie, Retard
- Calcul automatique des indices d'assiduite
- Vue calendaire avec codes couleur

---

### 3. Evaluations - Gestion des pratiques criteriees

**Sous-sections** : Apercu, Liste des evaluations, Proceder a une evaluation

#### Concepts cles

| Element | Description |
|---------|-------------|
| **Grilles de criteres** | Rubrics personnalises avec ponderation |
| **Echelles de performance** | Taxonomies de maitrise (ex: IDME) |
| **Cartouches de retroaction** | Commentaires predefinis (matrice criteres x niveaux) |
| **Jetons pedagogiques** | Systeme de seconde chance (Delai, Reprise, Aide, Bonus) |

---

### 4. Construction de la note - Architecture evaluative

**Sous-sections** : Apercu, Productions, Grilles, Echelles, Cartouches, Pratiques

#### Configurations supportees

| Pratique | Description |
|----------|-------------|
| **PAN-Maitrise** | N meilleurs artefacts, echelle IDME, portfolio |
| **PAN-Standards** | Productions mappees a des standards/competences |
| **PAN-Specifications** | Criteres graduels avec denotation |
| **Sommative traditionnelle** | Moyenne ponderee classique |

---

### 5. Reglages - Configuration du systeme

**Sous-sections** : Trimestre, Preferences, Donnees

#### Hierarchie de configuration

```
TRIMESTRE (A2025, H2026, etc.)
    |-- COURS (601-101, 601-102, etc.)
    |   +-- GROUPE (01, 02, 9999-demo)
    |       |-- ETUDIANTS
    |       |-- PRODUCTIONS
    |       |-- PRESENCES
    |       +-- EVALUATIONS
    +-- HORAIRE (jours/heures)
```

---

### 6. Aide - Assistance contextualisee

**Sous-sections** : Introduction, Configuration, Formation, Utilisation, Consultation, Reference

#### Systemes d'aide

- **Primo** : Assistant de demarrage (questions guidees, pack de demarrage)
- **Boutons aide** : Aide contextuelle inline (14 themes documentes)

---

## III. Fonctionnalites transversales

### A. Systeme de Reponse a l'Intervention (RaI)

Framework d'interventions pedagogiques progressives :

| Niveau | Cible | Intervention |
|--------|-------|--------------|
| **1 - Universel** | ~80% etudiants | Enseignement standard de qualite |
| **2 - Cible** | ~15% etudiants | Interventions en petit groupe |
| **3 - Intensif** | ~5% etudiants | Soutien individualise |

**Integration** : Detection automatique, planification, suivi, snapshots avant/apres.

---

### B. Patterns de risque detectes automatiquement

| Pattern | Caracteristiques | Action recommandee |
|---------|------------------|-------------------|
| **Stable** | Tous indices >= 65% | Maintenir l'engagement |
| **Defi specifique** | Un ou deux indices faibles | Intervention ciblee |
| **Blocage emergent** | Chute recente (2-3 semaines) | Intervention rapide |
| **Blocage critique** | Tous indices < 40% depuis longtemps | Intervention intensive |

---

### C. Portfolio d'apprentissage

Modalites de selection :
- **Meilleurs** : N meilleurs artefacts
- **Recents** : N plus recents
- **Hybride** : N meilleurs parmi top 50%
- **Tous** : Moyenne complete

---

### D. Modes d'affichage

| Mode | Usage |
|------|-------|
| **Normal** | Donnees reelles |
| **Simulation** | What-if (non persistant) |
| **Anonymisation** | Projections en classe |
| **Assiste** | Interface simplifiee pour debutants |

---

## IV. Concepts pedagogiques sous-jacents

### 1. Taxonomie SOLO

| Niveau SOLO | Code IDME | Pourcentage |
|-------------|-----------|-------------|
| Prestructurel/Unistructurel | **I**nsuffisant | < 64% |
| Multistructurel | **D**eveloppement | 65-74% |
| Relationnel | **M**aitrise | 75-84% |
| Abstrait etendu | **E**tendu | >= 85% |

### 2. Monitorage pedagogique

Trois piliers :
1. **Observation** : Mesurer A-C-P regulierement
2. **Diagnostic** : Interpreter les patterns de risque
3. **Action** : Intervenir selon le niveau RaI

### 3. Pratiques d'Approche par Niveau (PAN)

Principes :
- Evaluer la **maitrise atteinte**, pas la moyenne
- Utiliser N meilleurs artefacts
- Feedback base sur criteres explicites
- Progression visible (de I vers M vers E)

---

## V. Points forts et plus-values

### Pour l'enseignant

| Fonctionnalite | Benefice |
|----------------|----------|
| Indices A-C-P-E | Vue holistique de l'engagement |
| Detection patterns | Identifie precocement les a-risque |
| RaI integre | Recommande actions adaptees |
| Evaluation criteriee | Shift sommative vers formative |
| Retroaction rapide | Cartouches reduisent temps de correction |
| Portfolio | Equite : tous peuvent atteindre 100% |
| Hors ligne | Aucune connexion requise |
| Donnees locales | Confidentialite totale |

### Pour l'etablissement

| Aspect | Benefice |
|--------|----------|
| Prediction | Identifie a-risque avant abandon |
| Interventions systematiques | RaI structure |
| Pas de cout logiciel | Gratuit et open-source |
| Conformite | Donnees jamais quittent l'etablissement |

### Pour l'etudiant

| Aspect | Benefice |
|--------|----------|
| Transparence | Criteres et seuils clairs |
| Feedback continu | Sait ou il stand |
| Pas de penalite | Jetons permettent reprises |
| Equite | Memes criteres pour tous |

---

## VI. Differenciation par rapport aux concurrents

### vs. Plateformes SaaS (Tableau, PowerBI)

- Hors ligne
- Donnees locales (confidentialite)
- Zero cout

### vs. Cahier Notes (Excel)

- Automatisation des calculs
- Detection patterns et RaI
- Portfolio et jetons
- Snapshots longitudinaux

### vs. LMS (Moodle, Brightspace)

- Hors ligne
- Specialise pedagogie (pas gestion contenu)
- Monitorage proactif
- Multi-pratiques (PAN vs sommative)

---

## VII. Pitch synthetique

### Version 1 minute

**Monitorage Pedagogique** est une application gratuite hors ligne qui aide les enseignants au collegial a identifier precocement les etudiants a risque. Elle fonctionne en mesurant 3 indices (Assiduite, Completion, Performance) et recommande automatiquement des interventions pedagogiques adaptees. Pas de serveur, pas d'abonnement, donnees 100% confidentielles.

### Points cles par audience

**Chercheur/Scientifique** :
- Fondee sur taxonomie SOLO et modele RaI
- Snapshots permettent etudier efficacite interventions
- Donnees longitudinales pour recherche

**Techno** :
- 100% vanilla JS (zero dependances)
- Architecture modulaire (pratiques plug-and-play)
- Stockage hybride IndexedDB/localStorage

**Pedagogue** :
- Shift sommative vers formative
- Support PAN (equite, transparence)
- RaI systematise (prediction + intervention)

**Gestionnaire** :
- Zero cout logiciel
- Autonomie totale
- Confidentialite garantie
- Ameliore retention

---

## VIII. Ressources

### Pour tester

1. Telecharger : https://github.com/bedardg71-codexnumeris/Monitorage_v6
2. Ouvrir : `index.html` dans navigateur
3. Charger : donnees de demo via Reglages
4. Explorer : Tableau de bord, profils, interventions

### Documentation

- `DEMARRAGE_RAPIDE.md` : Setup en 5 minutes
- `GUIDE_TESTEURS.md` : Scenarios complets
- Section AIDE : Contextualisee dans l'app

---

**Document genere le 20 janvier 2026**
**Basee sur l'analyse de Monitorage Pedagogique Beta 95.7**
