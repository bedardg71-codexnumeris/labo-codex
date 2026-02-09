# Plan de travail — Panneau « Séances »

**Module** : Planification pédagogique (Module 7 de Monitorage v2)
**Date** : Février 2026
**Statut** : Spécification pour implémentation
**Prototype** : `docs/planification/prototype-carte-mentale.html`

---

## 1. Résumé

Le panneau « Séances » remplace l'actuel panneau « Calendrier » du prototype.
Il transforme la carte mentale (vision conceptuelle) en canevas de leçon
opérationnel (vision pédagogique) en assemblant automatiquement les données
de la carte mentale et des modules existants (Construction de la note, Réglages).

**Changement immédiat** : renommer le bouton `Calendrier` → `Séances` dans le
prototype et dans toute la codebase.

---

## 2. Architecture du panneau

### 2.1 Structure globale

```
┌─────────────────────────────────────────────────────┐
│  PANNEAU SÉANCES                                     │
│                                                      │
│  ┌─ Sélecteur de séquence / leçon ───────────────┐  │
│  │  [Séquence 1 ▾]  →  [Leçon 1.1 ▾]            │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
│  ┌─ En-tête automatique ─────────────────────────┐  │
│  │  📅 Mardi 28 janvier 2026, 13h00-14h30        │  │
│  │  📍 Local B-204                                │  │
│  │  👥 Groupe 00002                               │  │
│  │  (auto-dérivé de Réglages)                     │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
│  ┌─ Objectif d'apprentissage ────────────────────┐  │
│  │  « Au terme de la leçon, l'élève sera          │  │
│  │    capable de... »                              │  │
│  │  [formulation éditable, pré-remplie depuis     │  │
│  │   les liens vise/mobilise de la carte]         │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
│  ┌─ Connaissances préalables à vérifier ─────────┐  │
│  │  (auto-dérivées des liens prerequis_de         │  │
│  │   rattachés aux connaissances de la leçon)     │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
│  ┌─ Productions associées ───────────────────────┐  │
│  │  (auto-dérivées de Construction de la note     │  │
│  │   via les liens evalue_par et                  │  │
│  │   productionsAssociees de la séquence)         │  │
│  │  Ex: « Examen partiel 1 (15%) — Grille SRPNF »│  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
│  ┌─ ☐ Enseignement explicite ────────────────────┐  │
│  │  (checkbox — si coché, ouvre 5 sections)       │  │
│  │                                                │  │
│  │  ▸ 1. Ouverture de la leçon                   │  │
│  │  ▸ 2. Modelage                                │  │
│  │  ▸ 3. Pratique guidée                         │  │
│  │  ▸ 4. Pratique autonome                       │  │
│  │  ▸ 5. Clôture de la leçon                     │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
│  ┌─ Vue calendrier (semaines) ───────────────────┐  │
│  │  (vue existante du prototype, conservée)       │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### 2.2 Sections détaillées

#### A. Sélecteur de séquence / leçon
- Dropdown peuplé depuis les nœuds de type `sequence` et `lecon` de la carte
- Sélectionner une séquence filtre les leçons qu'elle contient
- Sélectionner une leçon affiche son canevas complet

#### B. En-tête automatique (dates, heures, locaux)
- **Source** : `{trim}_calendrierComplet` + `{trim}_horaire` (module Réglages)
- **Logique** : leçon.semaine → date exacte via calendrier ; horaire → heure + local
- **Groupes** : un plan de cours s'applique à tous les groupes ; l'en-tête affiche
  le groupe actuellement sélectionné dans l'application, ou tous les groupes
  si aucun n'est sélectionné
- **Graceful degradation** : si l'horaire n'est pas encore configuré, la section
  affiche « Horaire non configuré — voir Réglages » avec un lien

#### C. Objectif d'apprentissage
- **Source** : liens `vise` (leçon → compétence) et connaissances `mobilise`
  directement associées à la leçon sur la carte mentale
- **Pré-remplissage** : formulation générée à partir des noms des compétences
  et connaissances ciblées, précédée de « Au terme de la leçon, l'élève sera
  capable de... »
- **Éditable** : l'enseignant peut reformuler librement (verbes observables
  et mesurables : écrire, résoudre, dessiner — pas « comprendre » ou « connaître »)
- **Persistance** : une fois édité manuellement, le texte personnalisé est sauvegardé
  et n'est plus écrasé par les changements de liens sur la carte

#### D. Connaissances préalables à vérifier
- **Source** : liens `prerequis_de` rattachés aux connaissances associées à la leçon
- **Logique** : si la leçon L vise la connaissance K, et que K a un prérequis P,
  alors P apparaît dans cette section
- **Affichage** : liste des prérequis avec indication de la connaissance ciblée
  (ex: « Factorisation → requis pour : Équations du 2e degré »)
- **Note pédagogique** : le prérequis de la leçon N est souvent l'objectif de
  la leçon N-1. Cette section aide l'enseignant à vérifier en ouverture de leçon
  que les acquis antérieurs sont en place.

#### E. Productions associées
- **Source** : `{trim}_productions` (module Construction de la note)
- **Lien** : via `productionsAssociees[]` de la séquence parente, ou liens
  `evalue_par` sur la carte mentale
- **Affichage** : nom de la production, type (examen, travail, quiz...),
  pondération (%), grille associée s'il y en a une
- **Lecture seule** : les productions sont créées dans Construction de la note,
  le panneau les affiche mais ne les modifie pas (lecteur bienveillant)

#### F. Checkbox « Enseignement explicite »
- **Comportement** : non coché par défaut. Quand coché, déploie 5 accordéons
- **Persistance** : l'état du checkbox est sauvegardé par leçon
- **Extensible** : d'autres approches pédagogiques pourront être ajoutées
  comme checkboxes supplémentaires (classe inversée, APP, etc.)

##### Les 5 étapes (accordéons dépliables) :

**1. Ouverture de la leçon**
   - Interventions sociales positives
   - Captation de l'attention des apprenants
   - Présentation et justification de l'objectif (auto : reprend l'objectif ci-dessus)
   - Présentation du plan de la leçon
   - Vérification des connaissances préalables (auto : reprend la section D)
   - Champs texte libres pour les notes de l'enseignant

**2. Modelage**
   - Démonstration et description des stratégies et contenus
   - Présentation du contexte d'utilisation (pourquoi / quand / où)
   - Présentation d'exemples et de contre-exemples
   - Mise en évidence des aspects importants
   - Aide-mémoire (éventuellement)
   - Champs texte libres

**3. Pratique guidée**
   - Animation d'une activité de pratique guidée collective
   - Gestion de la participation, vérification compréhension, rétroactions
   - Évaluation formative
   - Champs texte libres

**4. Pratique autonome**
   - Réenseignement / différenciation / tutorat
   - Animation d'exercices individuels
   - Vérification compréhension, rétroactions, renforcements positifs
   - Retrait graduel des aides
   - Champs texte libres

**5. Clôture de la leçon**
   - Activité d'objectivation et de métacognition (synthèse)
   - Aide-mémoire (si non fait au modelage)
   - Présentation de l'objectif de la prochaine leçon
   - Exercices individuels / poursuite de la pratique
   - Champs texte libres

**Référence** : Canevas adapté de Archer & Hughes (2011), Bissonnette et al. (2016),
Gauthier et al. (2013), Goeke (2009). Voir `docs/sur l'enseignement explicite/planification_leçon_assemblé.pdf`.

#### G. Vue calendrier (conservée)
- La vue semaine par semaine existante dans le prototype est conservée
- Elle permet d'assigner les séquences et leçons à des semaines
- L'export JSON/CSV est maintenu

---

## 3. Flux de données inter-modules

```
CARTE MENTALE (zone gauche + zone droite)
  │
  │  liens vise, mobilise, prerequis_de, evalue_par
  │
  ▼
PANNEAU SÉANCES ◄──── RÉGLAGES (calendrier, horaire, groupes)
  │                         └─ {trim}_calendrierComplet
  │                         └─ {trim}_horaire
  │                         └─ {trim}_groupesCours
  │
  │              ◄──── CONSTRUCTION DE LA NOTE (productions, grilles)
  │                         └─ {trim}_productions
  │                         └─ grillesTemplates
  │
  ▼
DONNÉES SAUVEGARDÉES
  └─ {trim}_planification_seances : {
       leconId: string,
       objectifPersonnalise: string | null,
       enseignementExplicite: boolean,
       etapes: {
         ouverture: string,
         modelage: string,
         pratiqueGuidee: string,
         pratiqueAutonome: string,
         cloture: string
       }
     }
```

### 3.1 Clés localStorage lues (autres modules)

| Clé | Module source | Usage dans le panneau |
|-----|---------------|----------------------|
| `{trim}_calendrierComplet` | Réglages | Dates des semaines |
| `{trim}_horaire` | Réglages | Heures, jours, locaux |
| `{trim}_groupesCours` | Réglages | Noms des groupes |
| `{trim}_productions` | Construction | Productions étudiantes |
| `grillesTemplates` | Construction | Noms des grilles associées |

### 3.2 Clés localStorage écrites (ce module)

| Clé | Contenu |
|-----|---------|
| `{trim}_planification_seances` | Données des canevas de leçon |
| `{trim}_planification_mindmap` | Carte mentale (nœuds + liens) |
| `{trim}_planification_sequences` | Séquences avec semaines assignées |

---

## 4. Logique d'auto-dérivation

### 4.1 Objectif d'apprentissage

```javascript
function deriverObjectif(leconId) {
  // 0. Vérifier si l'enseignant a saisi un objectif personnalisé
  //    Si oui, il prend le dessus sur l'auto-dérivation.
  const seanceData = chargerSeance(leconId);
  if (seanceData?.objectifPersonnalise) {
    return seanceData.objectifPersonnalise;
  }

  // 1. Trouver les liens 'vise' partant de cette leçon
  const competencesVisees = etat.liens
    .filter(l => l.noeudSource === leconId && l.type === 'vise')
    .map(l => etat.noeuds.get(l.noeudCible));

  // 2. Trouver les connaissances mobilisées par les activités de la leçon
  const activites = getEnfants(leconId);
  const connaissances = activites.flatMap(a =>
    etat.liens
      .filter(l => l.noeudSource === a.id && l.type === 'mobilise')
      .map(l => etat.noeuds.get(l.noeudCible))
  );

  // 3. Générer la formulation auto-dérivée
  const elements = [...competencesVisees, ...connaissances]
    .map(n => n.titre.toLowerCase());

  return `Au terme de la leçon, l'élève sera capable de ${elements.join(', ')}.`;
}

// Sauvegarder l'objectif quand l'enseignant le modifie manuellement
function sauvegarderObjectifPersonnalise(leconId, texte) {
  const seanceData = chargerSeance(leconId) || {};
  seanceData.objectifPersonnalise = texte;
  sauvegarderSeance(leconId, seanceData);
}

// Réinitialiser pour revenir à l'auto-dérivation
function reinitialiserObjectif(leconId) {
  const seanceData = chargerSeance(leconId) || {};
  seanceData.objectifPersonnalise = null;
  sauvegarderSeance(leconId, seanceData);
}
```

### 4.2 Prérequis à vérifier

```javascript
function deriverPrealables(leconId) {
  // 1. Trouver les connaissances associées à cette leçon
  const connaissancesIds = getConnaissancesAssociees(leconId);

  // 2. Pour chaque connaissance, trouver ses prérequis
  return connaissancesIds.flatMap(cid => {
    const prereqs = etat.liens
      .filter(l => l.noeudCible === cid && l.type === 'prerequis_de')
      .map(l => ({
        prerequis: etat.noeuds.get(l.noeudSource),
        pourConnaissance: etat.noeuds.get(cid)
      }));
    return prereqs;
  });
}
```

### 4.3 Dates et horaire

```javascript
function deriverHoraire(leconId, groupeId) {
  const lecon = etat.noeuds.get(leconId);
  const semaine = lecon.semaine; // assignée via le calendrier

  // Lire les données de Réglages
  const calendrier = JSON.parse(
    localStorage.getItem(cle('calendrierComplet'))
  );
  const horaire = JSON.parse(
    localStorage.getItem(cle('horaire'))
  );

  if (!calendrier || !horaire || !semaine) return null;

  // Trouver la date de début de la semaine
  const semaineData = calendrier.semaines[semaine - 1];
  // Croiser avec l'horaire du groupe
  const coursHoraire = horaire[groupeId];

  return {
    date: semaineData.dateDebut,
    jour: coursHoraire.jour,
    heure: coursHoraire.heure,
    local: coursHoraire.local
  };
}
```

### 4.4 Productions associées

```javascript
function deriverProductions(leconId) {
  // 1. Trouver la séquence parente
  const sequenceId = getParentConteneur(leconId);
  const sequence = etat.noeuds.get(sequenceId);

  // 2. Liens evalue_par directs depuis la carte
  const liensEval = etat.liens
    .filter(l => l.noeudSource === leconId && l.type === 'evalue_par')
    .concat(
      etat.liens.filter(l => l.noeudSource === sequenceId && l.type === 'evalue_par')
    );

  // 3. Lire les productions depuis Construction de la note
  const productions = JSON.parse(
    localStorage.getItem(cle('productions'))
  ) || [];

  // 4. Matcher par ID ou par productionsAssociees (avec dédoublonnage)
  const ids = new Set([
    ...liensEval.map(l => l.noeudCible),
    ...(sequence?.productionsAssociees || [])
  ]);

  return productions.filter(p => ids.has(p.id));
}
```

### 4.5 Enseignement explicite (checkbox et accordéons)

```javascript
// Structure de données pour l'enseignement explicite par leçon
// Sauvegardée dans {trim}_planification_seances
const ETAPES_ENSEIGNEMENT_EXPLICITE = [
  'ouverture', 'modelage', 'pratiqueGuidee', 'pratiqueAutonome', 'cloture'
];

function toggleEnseignementExplicite(leconId, estCoche) {
  const seanceData = chargerSeance(leconId) || {};
  seanceData.enseignementExplicite = estCoche;

  // Initialiser les étapes si première activation
  if (estCoche && !seanceData.etapes) {
    seanceData.etapes = {};
    for (const etape of ETAPES_ENSEIGNEMENT_EXPLICITE) {
      seanceData.etapes[etape] = '';
    }
  }

  sauvegarderSeance(leconId, seanceData);

  // Afficher ou masquer les 5 accordéons dans le DOM
  const conteneur = document.getElementById('etapes-explicite');
  if (conteneur) conteneur.style.display = estCoche ? 'block' : 'none';
}

function sauvegarderEtape(leconId, nomEtape, contenu) {
  const seanceData = chargerSeance(leconId) || {};
  if (!seanceData.etapes) seanceData.etapes = {};
  seanceData.etapes[nomEtape] = contenu;
  sauvegarderSeance(leconId, seanceData);
}

// Fonctions utilitaires de persistance
function chargerSeance(leconId) {
  const toutes = JSON.parse(
    localStorage.getItem(cle('planification_seances'))
  ) || {};
  return toutes[leconId] || null;
}

function sauvegarderSeance(leconId, data) {
  const toutes = JSON.parse(
    localStorage.getItem(cle('planification_seances'))
  ) || {};
  toutes[leconId] = data;
  localStorage.setItem(cle('planification_seances'), JSON.stringify(toutes));
}
```

### 4.6 Sélection du groupe (en-tête automatique)

```javascript
// Le groupe actuellement sélectionné dans l'application est accessible
// via l'état global de Monitorage. Dans le prototype, on simule avec
// un sélecteur dans le panneau.
function getGroupeActif() {
  // En intégration : lire depuis l'état global de navigation
  // Ex: window.navigation.groupeActif ou équivalent
  // En prototype : lire depuis un <select> dans le panneau
  const select = document.getElementById('select-groupe');
  return select?.value || null;
}
```

---

## 5. Étapes d'implémentation

### Phase 1 : Renommage et restructuration (prototype)
1. Renommer le bouton `Calendrier` → `Séances` dans le prototype HTML
2. Renommer les identifiants CSS/JS associés (`panneau-calendrier` → `panneau-seances`)
3. Restructurer le panneau existant pour accueillir les nouvelles sections
4. Conserver la vue calendrier (semaines) comme sous-section en bas du panneau

### Phase 2 : Sections auto-dérivées (prototype)
5. Ajouter le sélecteur séquence/leçon en haut du panneau
6. Implémenter la section « Objectif d'apprentissage » avec pré-remplissage
7. Implémenter la section « Connaissances préalables à vérifier »
8. Ajouter la section « Productions associées » (lecture seule, données simulées
   dans le prototype puisque Construction de la note n'est pas disponible)

### Phase 3 : Enseignement explicite (prototype)
9. Ajouter le checkbox « Enseignement explicite » dans l'en-tête de la leçon
10. Implémenter les 5 accordéons avec leurs sous-sections
11. Sauvegarder l'état du checkbox et le contenu des champs texte par leçon

### Phase 4 : Intégration dans Monitorage v2
12. Extraire le JS du panneau dans `planification-seances.js` (IIFE, window.*)
13. Brancher les lectures inter-modules sur les vraies clés localStorage :
    - `{trim}_calendrierComplet` et `{trim}_horaire` → en-tête automatique
    - `{trim}_productions` et `grillesTemplates` → productions associées
14. Gérer le sélecteur de groupe (afficher l'horaire du groupe sélectionné)
15. Sauvegarder via `db.js` avec namespace `cle('planification_seances')`

### Phase 5 : Page d'accueil
16. Ajouter deux nouvelles cartes sur la page d'accueil :
    - 🗺️ **Planifier mon cours** — Organiser les séquences, leçons et activités
      sur la carte mentale.
    - 👤 **Consulter un profil étudiant** — Voir la progression, les présences
      et les résultats d'un élève.

---

## 6. Principes à respecter

- **Single Source of Truth** : le panneau LIRE les données des autres modules,
  il n'écrit que ses propres clés (`{trim}_planification_*`)
- **Lecteur bienveillant** : si une donnée n'est pas encore disponible
  (horaire non configuré, productions non créées), afficher un message
  discret, pas un blocage
- **Remplissage progressif** : les sections auto-dérivées se mettent à jour
  chaque fois que le panneau est ouvert, reflétant l'état actuel de la carte
  et des autres modules
- **Édition manuelle prioritaire** : quand l'enseignant personnalise un champ
  auto-dérivé (ex: objectif), sa version est sauvegardée et prend le dessus
- **Pattern IIFE** : `(function() { 'use strict'; ... })();`
- **Exports** : `window.planificationSeances = { ... }`
- **Pas de dépendances externes** : vanilla JS uniquement

---

## 7. Références documentaires

| Document | Chemin | Contenu |
|----------|--------|---------|
| Prototype | `docs/planification/prototype-carte-mentale.html` | Code fonctionnel avec bloc de contexte |
| Architecture intégration | `docs/planification/planification/references/architecture-integration.md` | Flux de données, modèles, clés |
| Canevas Bissonnette | `docs/sur l'enseignement explicite/planification_leçon_assemblé.pdf` | Canevas de planification de leçon (5 étapes) |
| Architecture Monitorage | `rapports créés par Claude Code/ARCHITECTURE.md` | Architecture complète de l'application |
| Cadre théorique | `docs/planification/planification/references/cadre-theorique.md` | Fondements pédagogiques |
| SKILL planification | `docs/planification/planification/SKILL.md` | Guide d'implémentation |
