# Dossier d'intégration — Module Planification pédagogique

**Destinataire** : Claude Code
**Auteur** : Grégoire Bédard (Cégep de Drummondville)
**Date** : 7 février 2026
**Version** : 1.0

---

## Table des matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Architecture de l'application cible](#2-architecture-de-lapplication-cible)
3. [Le prototype — ce qui existe déjà](#3-le-prototype--ce-qui-existe-déjà)
4. [Le panneau Séances — ce qui doit être construit](#4-le-panneau-séances--ce-qui-doit-être-construit)
5. [Flux de données inter-modules](#5-flux-de-données-inter-modules)
6. [Pseudocode d'auto-dérivation](#6-pseudocode-dauto-dérivation)
7. [Page d'accueil — nouvelles cartes](#7-page-daccueil--nouvelles-cartes)
8. [Étapes d'implémentation](#8-étapes-dimplémentation)
9. [Principes et contraintes](#9-principes-et-contraintes)
10. [Fichiers à créer et modifier](#10-fichiers-à-créer-et-modifier)
11. [Références documentaires](#11-références-documentaires)

---

## 1. Vue d'ensemble

### Qu'est-ce que ce module ?

Le module **Planification pédagogique** s'ajoute comme **7e onglet**
(« Planification ») dans la navigation principale de Monitorage v2,
aux côtés de : Tableau de bord, Présences, Évaluations, Construction
de la note, Boîte à outils, Aide.

Il comporte **deux vues internes** au sein du même onglet :

- Le **Planificateur** est la carte mentale : l'enseignant crée et relie
  ses objectifs (compétences, idées maîtresses, connaissances, prérequis,
  stratégies) et ses activités (séquences, leçons, activités, soutiens,
  révisions) au niveau conceptuel, sans contrainte temporelle. Les liens
  entre les deux zones matérialisent l'alignement pédagogique (constructive
  alignment de Biggs).

- L'**Organisateur** est le panneau Séances : le plan conceptuel y est
  transposé dans la réalité du trimestre. Les leçons sont placées dans
  les semaines, les dates/heures/locaux apparaissent automatiquement,
  le canevas opérationnel s'assemble à partir de la carte et des données
  des modules Réglages et Construction de la note.

Dans le code, ces deux vues correspondent à deux sous-modules :
le Planificateur gère le canvas, les nœuds, les liens SVG et les zones ;
l'Organisateur gère le panneau latéral avec le sélecteur de leçon,
l'objectif, les prérequis, les productions, les étapes méthodologiques
et la vue calendrier. L'enseignant bascule de l'un à l'autre.

### Comportement de l'Organisateur

Quand l'enseignant sélectionne une leçon dans l'Organisateur, le panneau
affiche toujours une section **« Objectif de la leçon »** pré-remplie à
partir de l'idée maîtresse associée à cette leçon sur le Planificateur.
L'enseignant peut reformuler cet objectif librement ; sa version
personnalisée est alors sauvegardée et n'est plus écrasée par les mises
à jour de la carte. Un bouton « Réinitialiser » permet de revenir à
l'auto-dérivation.

Sous l'objectif, un accordéon **« Cœur de la leçon »** affiche les
activités, soutiens et révisions rattachés à cette leçon sur le
Planificateur. C'est le contenu de base, toujours visible.

Sous le Cœur de la leçon, un checkbox **« Enseignement explicite »** est
disponible, non coché par défaut. Lorsque l'enseignant le coche, la
structure du panneau se détaille :

```
┌─ Objectif de la leçon ──────────────────────────┐
│  « Au terme de la leçon, l'élève sera capable    │
│    de... » [pré-rempli depuis l'idée maîtresse]  │
└──────────────────────────────────────────────────┘

☑ Enseignement explicite

  ☑ Ouverture
  │  └─ [accordéon : champs texte libres]
  │
  ☑ Modélisation
  │  └─ [accordéon : champs texte + activités glissées ici]
  │
  ☑ Pratique guidée
  │  └─ [accordéon : champs texte + activités glissées ici]
  │
  ☐ Pratique autonome
  │  └─ (grisé — non utilisé pour cette leçon)
  │
  ☐ Clôture
     └─ (grisé — non utilisé pour cette leçon)
```

**Trois niveaux de détail** selon l'engagement de l'enseignant :

1. **Sans le checkbox** : l'Organisateur affiche l'objectif (dérivé de
   l'idée maîtresse) + le Cœur de la leçon (liste des activités, soutiens
   et révisions en vrac). Suffisant pour un usage rapide.

2. **Avec le checkbox, étapes sélectionnées** : les 5 étapes de
   l'enseignement explicite apparaissent, chacune avec son propre checkbox.
   L'enseignant coche uniquement les étapes présentes dans sa leçon
   (une leçon peut être seulement de la modélisation, ou seulement de
   la pratique guidée). Les étapes non cochées restent visibles mais
   grisées — c'est aussi une information pédagogique utile.

3. **Avec les étapes remplies** : l'enseignant glisse ses activités dans
   l'étape de son choix (Modélisation, Pratique guidée ou Pratique
   autonome) et rédige ses notes dans les champs texte libres de chaque
   étape (gestes professionnels, matériel, consignes, rétroactions).

Les activités, soutiens et révisions issus du Planificateur apparaissent
dans les étapes cochées parmi Modélisation, Pratique guidée et Pratique
autonome. L'enseignant les place manuellement dans l'étape de son choix
— pas de répartition automatique, car c'est l'intention pédagogique qui
dicte le placement.

Le contenu de ces champs est sauvegardé par leçon et sera exportable
ultérieurement — soit vers un autre module de l'application, soit en
format texte ou PDF — pour constituer la planification pédagogique
complète de l'enseignant.

**Référence** : les 5 étapes sont adaptées du canevas de Archer & Hughes
(2011), Bissonnette et al. (2016), Gauthier et al. (2013), Goeke (2009).
Voir `docs/sur l'enseignement explicite/planification_leçon_assemblé.pdf`.

### Qu'est-ce qui existe déjà ?

Un **prototype HTML autonome** (`prototype-carte-mentale.html`, ~3400 lignes)
contient le Planificateur fonctionnel : zones, types de nœuds, conteneurs,
liens SVG, sauvegarde localStorage, zoom, scroll, et une vue calendrier
basique. Un bloc de commentaires en tête du fichier documente le contexte.

Ce qui doit être **construit** : l'Organisateur enrichi (objectif auto-dérivé,
Cœur de la leçon, checkbox enseignement explicite avec 5 étapes à cocher,
intégration inter-modules).

Ce qui doit être **adapté** : le prototype doit être transposé dans
l'architecture Monitorage v2 (IIFE, window.*, db.js, fichiers séparés).

---

## 2. Architecture de l'application cible

### Stack technique

- SPA monolithique client-side pur (aucun serveur)
- Vanilla JavaScript ES6+ (pas de framework, pas de bundler)
- Pattern IIFE + `'use strict'` par fichier
- Exports via `window.*` (ex: `window.gestionPresences = {...}`)
- ~50 000 lignes : `index.html` (~15 500), `styles.css` (~13 750), 93 fichiers JS
- Stockage : IndexedDB (persistant) + localStorage (cache) via `db.js`
- Namespace par trimestre : `window.cle('key')` → `'h2026_key'`
- Navigation : classList active + typeof checks
- Confidentialité totale : les données ne quittent jamais la machine

### Fichiers protégés (NE PAS MODIFIER sauf ajouts précis)

- `config.js` → ajouter uniquement l'entrée de navigation du module
- `navigation.js` → ajouter uniquement la route `planification/*`
- `noms_stables.json` → lecture seule

### Hiérarchie de données

```
TRIMESTRE (h2026, a2025...)
  └─ COURS (un plan de cours unique par cours)
      └─ GROUPES (héritent du plan — pas de duplication)
          ├─ ÉLÈVES
          ├─ PRODUCTIONS (Construction de la note)
          └─ ÉVALUATIONS
```

**Fondamental** : un plan de cours s'applique à TOUS les groupes d'un même
cours. Les données de Planification ne sont jamais dupliquées par groupe.

### Modules existants

| Module | Fonction | Données clés |
|--------|----------|-------------|
| Tableau de bord | Indices A-C-P-E, vue d'ensemble | Agrège tout |
| Présences | Suivi des présences et de l'engagement | `{trim}_presences` |
| Évaluations | Évaluation critériée des productions | `{trim}_evaluations` |
| Construction de la note | Architecture évaluative (productions, grilles, échelles) | `{trim}_productions`, `grillesTemplates` |
| Boîte à outils | Outils complémentaires | — |
| Aide | Aide contextuelle | — |

---

## 3. Le prototype — ce qui existe déjà

### Fichier

`docs/planification/prototype-carte-mentale.html` — fichier HTML autonome
avec CSS et JS intégrés, zéro dépendance externe.

### Système de zones

Le canvas (10 000 × 6 000 px) est divisé en deux zones par une ligne
pointillée verticale :

| Zone | Fond | Types de nœuds |
|------|------|----------------|
| Gauche (Objectifs) | Indigo très léger | competence, idee-maitresse, connaissance, prerequis, strategie |
| Droite (Activités) | Orange très léger | sequence, lecon, activite, soutien, revision |

Constantes :
```
ZONE_LIMITE_X = 0    (frontière = axe vertical central en données)
ZONE_MARGE = 40      (marge douce en pixels-données)
OFFSET_X = 5000      (le point 0,0 est au centre exact du canvas)
OFFSET_Y = 3000
```

### Types de nœuds (10 types)

| Type | Zone | Conteneur | Peut contenir |
|------|------|-----------|---------------|
| competence | gauche | non | — |
| idee-maitresse | gauche | non | — |
| connaissance | gauche | non | — |
| prerequis | gauche | non | — |
| strategie | gauche | non | — |
| sequence | droite | **OUI** | lecon, activite, soutien, revision |
| lecon | droite | **OUI** | activite, soutien, revision |
| activite | droite | non | — |
| soutien | droite | non | — |
| revision | droite | non | — |

Règles de contenance :
- Séquence peut contenir tout sauf une autre séquence
- Leçon ne contient que les non-conteneurs (activite, soutien, revision)
- L'imbrication Leçon dans Séquence est permise
- Les enfants d'un conteneur suivent leur parent sans contrainte de zone

### Détection de conteneur

La fonction `trouverConteneurPour` utilise `clientVersData()` + coordonnées
en données (**PAS** `getBoundingClientRect()` qui retourne des valeurs
incorrectes avec CSS `zoom` dans Safari). En cas de conteneurs imbriqués,
le plus petit (par aire) est préféré.

### Structure HTML

```
header (titre + palette de boutons sur deux lignes)
  └─ palette : deux groupes (Objectifs / Activités) séparés par un flex spacer
#zone-wrapper
  ├─ #guides-overlay (non scrollable, messages d'aide par zone)
  └─ #zone-travail (scrollable)
      └─ #espace (canvas zoomable via CSS zoom)
          ├─ fonds de zone, séparateur, labels
          ├─ SVG (liens Bézier)
          └─ #couche-noeuds (transform: translate(5000px, 3000px))
footer (boutons : zoom, export, Séances, Recentrer)
```

### Fonctionnalités existantes

- Création de nœuds par clic sur les boutons de la palette
- Déplacement par drag & drop avec contraintes de zone
- Conteneurs : drop d'un nœud sur un conteneur compatible (feedback visuel bleu)
- Liens SVG : clic sur le connecteur (●) puis clic sur le nœud cible
- Zoom : CSS zoom sur `#espace`, boutons +/- dans le footer
- Panneau de détail : clic sur un nœud ouvre un panneau latéral
- Panneau calendrier : vue semaine par semaine, export JSON/CSV
- Sauvegarde localStorage : cartes multiples, sélecteur
- Bouton Recentrer (⊕) + raccourci ⌘1
- Guides de zone en overlay fixe (non affectés par scroll/zoom)

---

## 4. L'Organisateur (panneau Séances) — ce qui doit être construit

### Contexte

Le bouton **« Calendrier »** du prototype doit être renommé **« Séances »**.
Ce panneau est l'**Organisateur** : il transpose le plan conceptuel du
Planificateur dans la réalité du trimestre en assemblant automatiquement
un canevas de leçon à partir de la carte mentale et des modules existants.

### Structure du panneau

```
┌─────────────────────────────────────────────────────────┐
│  ORGANISATEUR (panneau Séances)                          │
│                                                          │
│  ┌─ Sélecteur ──────────────────────────────────────┐   │
│  │  [Séquence 1 ▾]  →  [Leçon 1.1 ▾]              │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌─ En-tête automatique ────────────────────────────┐   │
│  │  📅 Mardi 28 janvier 2026, 13h00-14h30           │   │
│  │  📍 Local B-204  👥 Groupe 00002                  │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌─ Objectif de la leçon ───────────────────────────┐   │
│  │  « Au terme de la leçon, l'élève sera capable     │   │
│  │    de... »  [pré-rempli depuis l'idée maîtresse]  │   │
│  │  [éditable] [↺ Réinitialiser]                     │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌─ Connaissances préalables à vérifier ────────────┐   │
│  │  (auto-dérivées des liens prerequis_de)           │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌─ Productions associées ──────────────────────────┐   │
│  │  (auto-dérivées de Construction de la note)       │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌─ Cœur de la leçon ──────────────────────────────┐   │
│  │  [activités, soutiens, révisions issus de la      │   │
│  │   carte — toujours visible]                       │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ☐ Enseignement explicite                                │
│  ┌──────────────────────────────────────────────────┐   │
│  │  (si coché, remplace Cœur de la leçon par :)      │   │
│  │                                                    │   │
│  │  ☑ Ouverture                                      │   │
│  │  │  └─ [accordéon : champs texte libres]          │   │
│  │  ☑ Modélisation                                   │   │
│  │  │  └─ [accordéon + activités glissées ici]       │   │
│  │  ☑ Pratique guidée                                │   │
│  │  │  └─ [accordéon + activités glissées ici]       │   │
│  │  ☐ Pratique autonome                              │   │
│  │  │  └─ (grisé — non utilisé pour cette leçon)     │   │
│  │  ☐ Clôture                                        │   │
│  │     └─ (grisé — non utilisé pour cette leçon)     │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌─ Vue calendrier (semaines) ──────────────────────┐   │
│  │  (vue existante du prototype, conservée)          │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### A. Sélecteur de séquence / leçon

- Dropdown peuplé depuis les nœuds de type `sequence` et `lecon` du Planificateur
- Sélectionner une séquence filtre les leçons qu'elle contient
- Sélectionner une leçon affiche son canevas complet

### B. En-tête automatique (dates, heures, locaux)

- **Source** : `{trim}_calendrierComplet` + `{trim}_horaire` (module Réglages)
- **Logique** : leçon.semaine → date exacte via calendrier ; horaire → heure + local
- **Groupes** : l'en-tête affiche le groupe actuellement sélectionné dans
  l'application, ou tous les groupes si aucun n'est sélectionné
- **Graceful degradation** : si l'horaire n'est pas encore configuré, afficher
  « Horaire non configuré — voir Réglages » avec un lien

### C. Objectif de la leçon

- **Source** : l'**idée maîtresse** associée à cette leçon sur le Planificateur.
  C'est l'Organisateur qui fait ce transfert : l'idée maîtresse conceptuelle
  devient l'objectif opérationnel de la leçon.
- **Pré-remplissage** : formulation précédée de « Au terme de la leçon,
  l'élève sera capable de... », dérivée du titre de l'idée maîtresse
- **Éditable** : l'enseignant peut reformuler librement avec des verbes
  observables et mesurables (écrire, résoudre, dessiner — pas « comprendre »)
- **Persistance** : une fois édité manuellement, le texte personnalisé est
  sauvegardé et n'est plus écrasé. Un bouton « Réinitialiser » permet de
  revenir à l'auto-dérivation.

### D. Connaissances préalables à vérifier

- **Source** : liens `prerequis_de` rattachés aux connaissances associées à la leçon
- **Logique** : si la leçon L vise la connaissance K, et que K a un prérequis P,
  alors P apparaît dans cette section
- **Affichage** : liste des prérequis avec indication de la connaissance ciblée
  (ex: « Factorisation → requis pour : Équations du 2e degré »)
- **Note pédagogique** : le prérequis de la leçon N est souvent l'objectif de
  la leçon N-1

### E. Productions associées

- **Source** : `{trim}_productions` (module Construction de la note)
- **Lien** : via `productionsAssociees[]` de la séquence parente, ou liens
  `evalue_par` sur le Planificateur
- **Affichage** : nom de la production, type (examen, travail, quiz...),
  pondération (%), grille associée
- **Lecture seule** : les productions sont créées dans Construction de la note,
  l'Organisateur les affiche mais ne les modifie pas

### F. Cœur de la leçon (sans enseignement explicite)

Quand le checkbox « Enseignement explicite » n'est **PAS** coché, un
accordéon **« Cœur de la leçon »** affiche simplement la liste des
activités, soutiens et révisions rattachés à cette leçon sur le
Planificateur. C'est un résumé en vrac du contenu de la leçon.

### G. Checkbox « Enseignement explicite » et les 5 étapes

Quand le checkbox est **coché**, le « Cœur de la leçon » est remplacé
par une vue structurée en **5 étapes**, chacune avec son propre checkbox.
L'enseignant coche uniquement les étapes présentes dans sa leçon (une
leçon peut être seulement de la modélisation, ou seulement de la pratique
guidée). Les étapes non cochées restent visibles mais grisées.

- **Persistance** : l'état du checkbox principal et des checkboxes d'étapes
  est sauvegardé par leçon
- **Extensible** : d'autres approches pédagogiques pourront être ajoutées
  comme checkboxes supplémentaires (classe inversée, APP, etc.)

Les activités, soutiens et révisions issus du Planificateur apparaissent
dans les étapes cochées parmi Modélisation, Pratique guidée et Pratique
autonome. **L'enseignant les place manuellement dans l'étape de son choix**
— pas de répartition automatique, car c'est l'intention pédagogique qui
dicte le placement.

**Les 5 étapes** (adaptées de Archer & Hughes, 2011 ; Bissonnette et al.,
2016 ; Gauthier et al., 2013 ; Goeke, 2009 —
voir `docs/sur l'enseignement explicite/planification_leçon_assemblé.pdf`) :

**1. Ouverture**
- Interventions sociales positives
- Captation de l'attention des apprenants
- Présentation et justification de l'objectif (auto : reprend l'objectif)
- Présentation du plan de la leçon
- Vérification des connaissances préalables (auto : reprend la section D)
- Champs texte libres pour les notes de l'enseignant

**2. Modélisation**
- Démonstration et description des stratégies et contenus
- Présentation du contexte d'utilisation (pourquoi / quand / où)
- Présentation d'exemples et de contre-exemples
- Mise en évidence des aspects importants
- Aide-mémoire (éventuellement)
- **Zone de dépôt** : l'enseignant y glisse les activités pertinentes
- Champs texte libres

**3. Pratique guidée**
- Animation d'une activité de pratique guidée collective
- Gestion de la participation, vérification compréhension, rétroactions
- Évaluation formative
- **Zone de dépôt** : activités, soutiens
- Champs texte libres

**4. Pratique autonome**
- Réenseignement / différenciation / tutorat
- Animation d'exercices individuels
- Vérification compréhension, rétroactions, renforcements positifs
- Retrait graduel des aides
- **Zone de dépôt** : activités, révisions
- Champs texte libres

**5. Clôture**
- Activité d'objectivation et de métacognition (synthèse)
- Aide-mémoire (si non fait à la modélisation)
- Présentation de l'objectif de la prochaine leçon
- Exercices individuels / poursuite de la pratique
- Champs texte libres

### H. Vue calendrier (conservée)

- La vue semaine par semaine existante dans le prototype est conservée
- Elle permet d'assigner les séquences et leçons à des semaines
- L'export JSON/CSV est maintenu

---

## 5. Flux de données inter-modules

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
       leconId: {
         objectifPersonnalise: string | null,
         enseignementExplicite: boolean,
         etapes: {
           ouverture:        { active: bool, contenu: string, activites: [] },
           modelisation:     { active: bool, contenu: string, activites: [] },
           pratiqueGuidee:   { active: bool, contenu: string, activites: [] },
           pratiqueAutonome: { active: bool, contenu: string, activites: [] },
           cloture:          { active: bool, contenu: string, activites: [] }
         }
       }
     }
```

### Clés localStorage lues (autres modules)

| Clé | Module source | Usage dans le panneau |
|-----|---------------|----------------------|
| `{trim}_calendrierComplet` | Réglages | Dates des semaines |
| `{trim}_horaire` | Réglages | Heures, jours, locaux |
| `{trim}_groupesCours` | Réglages | Noms des groupes |
| `{trim}_productions` | Construction | Productions étudiantes |
| `grillesTemplates` | Construction | Noms des grilles associées |

### Clés localStorage écrites (ce module)

| Clé | Contenu |
|-----|---------|
| `{trim}_planification_seances` | Canevas de leçon (objectifs, étapes, etc.) |
| `{trim}_planification_mindmap` | Carte mentale (nœuds + liens) |
| `{trim}_planification_sequences` | Séquences avec semaines assignées |
| `{trim}_planification_lecons` | Leçons |
| `{trim}_planification_carteUI` | Cache UI de la carte |

---

## 6. Pseudocode d'auto-dérivation

### 6.1 Objectif de la leçon (dérivé de l'idée maîtresse)

```javascript
function deriverObjectif(leconId) {
  // 0. Vérifier si l'enseignant a saisi un objectif personnalisé
  //    Si oui, il prend le dessus sur l'auto-dérivation.
  const seanceData = chargerSeance(leconId);
  if (seanceData?.objectifPersonnalise) {
    return seanceData.objectifPersonnalise;
  }

  // 1. Trouver l'idée maîtresse associée à cette leçon
  //    via les liens de la carte mentale (leçon → vise → idée maîtresse)
  const ideeMaitresse = etat.liens
    .filter(l => l.noeudSource === leconId && l.type === 'vise')
    .map(l => etat.noeuds.get(l.noeudCible))
    .find(n => n?.type === 'idee-maitresse');

  if (ideeMaitresse) {
    return `Au terme de la leçon, l'élève sera capable de ${ideeMaitresse.titre.toLowerCase()}.`;
  }

  // 2. Fallback : utiliser les compétences et connaissances associées
  const competencesVisees = etat.liens
    .filter(l => l.noeudSource === leconId && l.type === 'vise')
    .map(l => etat.noeuds.get(l.noeudCible));

  const activites = getEnfants(leconId);
  const connaissances = activites.flatMap(a =>
    etat.liens
      .filter(l => l.noeudSource === a.id && l.type === 'mobilise')
      .map(l => etat.noeuds.get(l.noeudCible))
  );

  const elements = [...competencesVisees, ...connaissances]
    .map(n => n.titre.toLowerCase());

  if (elements.length === 0) return '';
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

### 6.2 Prérequis à vérifier

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

### 6.3 Dates et horaire

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

// Le groupe actif vient de l'état global de Monitorage.
// En prototype, simuler avec un <select> dans le panneau.
function getGroupeActif() {
  // En intégration : window.navigation.groupeActif ou équivalent
  const select = document.getElementById('select-groupe');
  return select?.value || null;
}
```

### 6.4 Productions associées

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

### 6.5 Cœur de la leçon (activités du Planificateur)

```javascript
// Récupérer les activités, soutiens et révisions enfants de la leçon
function deriverCoeurLecon(leconId) {
  const enfants = getEnfants(leconId);
  return enfants.filter(n =>
    ['activite', 'soutien', 'revision'].includes(n.type)
  );
}
```

### 6.6 Enseignement explicite (checkbox principal + checkboxes par étape)

```javascript
const ETAPES_ENSEIGNEMENT_EXPLICITE = [
  'ouverture', 'modelisation', 'pratiqueGuidee', 'pratiqueAutonome', 'cloture'
];

function toggleEnseignementExplicite(leconId, estCoche) {
  const seanceData = chargerSeance(leconId) || {};
  seanceData.enseignementExplicite = estCoche;

  // Initialiser les étapes si première activation
  if (estCoche && !seanceData.etapes) {
    seanceData.etapes = {};
    for (const etape of ETAPES_ENSEIGNEMENT_EXPLICITE) {
      seanceData.etapes[etape] = {
        active: true,       // checkbox de l'étape (coché par défaut)
        contenu: '',        // notes de l'enseignant
        activites: []       // IDs des activités glissées dans cette étape
      };
    }
  }

  sauvegarderSeance(leconId, seanceData);

  // UI : si coché, masquer Cœur de la leçon, afficher les 5 étapes
  //       si décoché, masquer les 5 étapes, afficher Cœur de la leçon
  const coeur = document.getElementById('coeur-lecon');
  const explicite = document.getElementById('etapes-explicite');
  if (coeur) coeur.style.display = estCoche ? 'none' : 'block';
  if (explicite) explicite.style.display = estCoche ? 'block' : 'none';
}

// Activer/désactiver une étape individuelle
function toggleEtape(leconId, nomEtape, estActive) {
  const seanceData = chargerSeance(leconId) || {};
  if (seanceData.etapes?.[nomEtape]) {
    seanceData.etapes[nomEtape].active = estActive;
    sauvegarderSeance(leconId, seanceData);
  }
  // UI : étape active → accordéon normal ; inactive → grisé, replié
  const etapeEl = document.getElementById(`etape-${nomEtape}`);
  if (etapeEl) etapeEl.classList.toggle('etape-inactive', !estActive);
}

// Glisser une activité dans une étape
function assignerActiviteAEtape(leconId, activiteId, nomEtape) {
  const seanceData = chargerSeance(leconId) || {};
  if (!seanceData.etapes?.[nomEtape]) return;

  // Retirer l'activité des autres étapes d'abord
  for (const etape of ETAPES_ENSEIGNEMENT_EXPLICITE) {
    if (seanceData.etapes[etape]?.activites) {
      seanceData.etapes[etape].activites =
        seanceData.etapes[etape].activites.filter(id => id !== activiteId);
    }
  }

  // Ajouter dans l'étape cible
  seanceData.etapes[nomEtape].activites.push(activiteId);
  sauvegarderSeance(leconId, seanceData);
}

function sauvegarderContenuEtape(leconId, nomEtape, contenu) {
  const seanceData = chargerSeance(leconId) || {};
  if (!seanceData.etapes) seanceData.etapes = {};
  if (!seanceData.etapes[nomEtape]) seanceData.etapes[nomEtape] = {};
  seanceData.etapes[nomEtape].contenu = contenu;
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

---

## 7. Page d'accueil — nouvelles cartes

Ajouter deux cartes sur la page d'accueil (« Que souhaitez-vous faire ? »),
en suivant le pattern existant (emoji + titre action + description courte) :

**Carte 1 :**
> 🗺️ **Planifier mon cours**
> Organiser les séquences, leçons et activités sur la carte mentale.

**Carte 2 :**
> 👤 **Consulter un profil étudiant**
> Voir la progression, les présences et les résultats d'un élève.

Les cartes existantes utilisent un « langage d'intention » — des verbes
d'action décrivant ce que l'enseignant veut faire, pas des noms de modules.

---

## 8. Étapes d'implémentation

### Phase 1 : Renommage et restructuration (prototype)

1. Renommer le bouton `Calendrier` → `Séances` dans le prototype HTML
2. Renommer les identifiants CSS/JS (`panneau-calendrier` → `panneau-seances`)
3. Restructurer le panneau pour accueillir les nouvelles sections
4. Conserver la vue calendrier (semaines) comme sous-section en bas

### Phase 2 : Sections auto-dérivées (prototype)

5. Ajouter le sélecteur séquence/leçon en haut du panneau
6. Implémenter la section « Objectif d'apprentissage » avec pré-remplissage
   et persistance de l'édition manuelle
7. Implémenter la section « Connaissances préalables à vérifier »
8. Ajouter la section « Productions associées » (lecture seule, données
   simulées dans le prototype)

### Phase 3 : Enseignement explicite (prototype)

9. Ajouter le checkbox « Enseignement explicite »
10. Implémenter les 5 accordéons avec leurs sous-sections
11. Sauvegarder l'état du checkbox et le contenu des champs texte par leçon

### Phase 4 : Intégration dans Monitorage v2

12. Extraire le JS dans des fichiers séparés (IIFE, `window.*`)
13. Brancher les lectures inter-modules sur les vraies clés localStorage :
    - `{trim}_calendrierComplet` et `{trim}_horaire` → en-tête automatique
    - `{trim}_productions` et `grillesTemplates` → productions associées
14. Gérer le sélecteur de groupe (horaire du groupe sélectionné)
15. Sauvegarder via `db.js` avec namespace `cle('planification_seances')`

### Phase 5 : Page d'accueil

16. Ajouter les deux cartes (Planifier mon cours, Consulter un profil étudiant)

---

## 9. Principes et contraintes

### Principes architecturaux

- **Single Source of Truth** : le panneau LIT les données des autres modules,
  il n'écrit que ses propres clés (`{trim}_planification_*`)
- **Lecteur bienveillant** : si une donnée n'est pas encore disponible
  (horaire non configuré, productions non créées), afficher un message
  discret, pas un blocage
- **Remplissage progressif** : les sections auto-dérivées se mettent à jour
  chaque fois que le panneau est ouvert
- **Édition manuelle prioritaire** : quand l'enseignant personnalise un champ
  auto-dérivé (ex: objectif), sa version est sauvegardée et prend le dessus

### Contraintes techniques

- **Pattern IIFE** : `(function() { 'use strict'; ... })();`
- **Exports** : `window.planificationSeances = { ... }`
- **Pas de dépendances externes** : vanilla JS uniquement
- **CSS zoom** (pas transform scale) pour le zoom du canvas
- **clientVersData()** pour la conversion viewport → données (pas getBoundingClientRect)
- **Namespace strict** : toutes clés = `{trim}_planification_*`

### Décisions UX prises

- Deux zones (gauche/droite) : reflète QUOI vs COMMENT enseigner
  (alignement pédagogique de Biggs)
- Palette dans le header (pas dans le canvas) : accès constant sans scroll/zoom
- Guides en overlay fixe (pas dans le canvas) : visibles sans scroll/zoom
- Canvas centré (OFFSET_X=5000) : scrollbars à 50%, séparateur centré
- Checkbox enseignement explicite : facultatif, n'impose pas une approche unique
- Panneau Séances : assemblage automatique, pas de double saisie

---

## 10. Fichiers à créer et modifier

### Créer

| Fichier | Responsabilité |
|---------|----------------|
| `planification.js` | Orchestration module, navigation interne |
| `planification-carte.js` | Éditeur carte mentale (adapté du prototype) |
| `planification-donnees.js` | Modèle de données, CRUD, validation |
| `planification-seances.js` | Panneau Séances, auto-dérivation, accordéons |

### Modifier (légèrement)

| Fichier | Changement |
|---------|-----------|
| `config.js` | Ajouter `{ id: 'planification', label: 'Planification', icon: 'sitemap' }` |
| `navigation.js` | Ajouter route `planification/*` |
| `index.html` | Ajouter `<section id="planification">` + cartes accueil |
| `styles.css` | Ajouter les styles du module |

---

## 11. Références documentaires

| Document | Chemin relatif | Contenu |
|----------|----------------|---------|
| **Prototype** | `docs/planification/prototype-carte-mentale.html` | Code fonctionnel (~3400 lignes) avec bloc de contexte en tête |
| **Ce dossier** | `docs/planification/DOSSIER-INTEGRATION-PLANIFICATION.md` | Le présent document |
| **Plan panneau** | `docs/planification/PLAN-PANNEAU-SEANCES.md` | Plan détaillé du panneau Séances |
| **Architecture intégration** | `docs/planification/planification/references/architecture-integration.md` | Flux de données, modèles de données, clés de stockage |
| **Cadre théorique** | `docs/planification/planification/references/cadre-theorique.md` | Fondements pédagogiques |
| **Exemple 601-101** | `docs/planification/planification/references/exemple-601-101.md` | Cas d'usage concret (Français 101) |
| **SKILL planification** | `docs/planification/planification/SKILL.md` | Guide d'implémentation détaillé |
| **Canevas Bissonnette** | `docs/sur l'enseignement explicite/planification_leçon_assemblé.pdf` | Canevas de planification de leçon en 5 étapes |
| **Architecture Monitorage** | `rapports créés par Claude Code/ARCHITECTURE.md` | Architecture complète de l'application |
