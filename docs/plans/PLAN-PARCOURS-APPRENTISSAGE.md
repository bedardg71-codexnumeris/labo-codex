# Plan de design — Parcours d'apprentissage unifié

**Auteur** : Grégoire Bédard (Cégep de Drummondville) + Claude Code
**Date** : 15 février 2026
**Version** : 1.0
**Statut** : Phase 2 implémentée (Beta 97.7, build 0115-0908)

---

## Table des matières

1. [Problème](#1-problème)
2. [Vision](#2-vision)
3. [Inventaire de l'existant](#3-inventaire-de-lexistant)
4. [Les deux modes d'apprentissage](#4-les-deux-modes-dapprentissage)
5. [Architecture du parcours](#5-architecture-du-parcours)
6. [Carte des jalons](#6-carte-des-jalons)
7. [Comportement de chaque mécanisme par mode](#7-comportement-de-chaque-mécanisme-par-mode)
8. [Registre de progression](#8-registre-de-progression)
9. [Interface utilisateur](#9-interface-utilisateur)
10. [Fichiers concernés](#10-fichiers-concernés)
11. [Étapes d'implémentation](#11-étapes-dimplémentation)
12. [Principes de design](#12-principes-de-design)

---

## 1. Problème

### Constat

L'application dispose de **10+ mécanismes d'assistance** qui fonctionnent
individuellement mais ne sont pas coordonnés :

- Un modal de bienvenue qui offre un choix binaire
- Un système Primo modulaire (5 modules conversationnels)
- Un tutoriel interactif en 7 étapes (mode démo)
- Un guidage de configuration en 5 étapes (partiellement legacy)
- 969 info-bulles contextuelles
- Un système d'aide contextuelle modale
- Des encarts de guidage en mode démo
- Des données de démonstration complètes
- Une section Aide en 6 sous-sections
- Des marqueurs pédagogiques 📌 éparpillés

### Ce qui manque

- **Pas de fil conducteur** : l'utilisateur ne sait jamais où il en est
- **Pas de progression visible** : aucun jalon, aucun sentiment d'avancement
- **Pas de certification** : jamais de moment « tu es autonome maintenant »
- **Pas de différenciation** : même approche pour tous les profils d'apprentissage
- **Pas d'orchestration** : les mécanismes ne se parlent pas entre eux

### Métaphore

L'utilisateur a besoin de trois choses :
1. **Une carte** 🗺️ — voir les grandes zones du territoire
2. **Des repères** 📍 — savoir où il se trouve dans sa progression
3. **Une boussole** 🧭 — naviguer de façon autonome

---

## 2. Vision

Un **parcours d'apprentissage unifié** qui :

- Propose deux modes adaptés au profil de l'utilisateur
- Orchestre les mécanismes existants sans les remplacer
- Offre une progression visible avec des jalons numérotés
- Certifie l'autonomie quand les bases sont maîtrisées
- Reste discret pour les utilisateurs expérimentés

Le système ne crée pas de nouveaux mécanismes d'aide — il ajoute
une **couche d'orchestration** qui coordonne ce qui existe déjà.

---

## 3. Inventaire de l'existant

### Mécanismes actifs

| Mécanisme | Fichiers | Déclenchement | Portée |
|---|---|---|---|
| Modal bienvenue | `modal-bienvenue.js` | Premier lancement | Choix initial |
| Primo (tour modulaire) | `primo-*.js` (5 fichiers) | Auto premier lancement / bouton 🧭 | 5 modules conversationnels |
| Tutoriel interactif | `tutoriel-interactif.js` | Auto après import démo | 7 étapes linéaires |
| Guidage configuration | `guidage.js` | Manuel / auto-resume | 5 étapes de setup |
| Tooltips | `tooltips.js` + `tooltips-contenu.js` | Survol souris (400ms) | 969 clés contextuelles |
| Aide contextuelle | `aide-contextuelle.js` + contenu | Bouton `.btn-aide-contextuelle` | Modales détaillées |
| Guidage démo | `guidage-demo.js` | Auto en mode démo | Encarts par section |
| Données démo | `donnees-demo.js` + `pack-demo-20.js` | Bouton accueil | Sandbox complète |
| Wizard pratique | `wizard-pratique-v2.js` | Via Primo MODULE 4 | 8 étapes de création |
| Section Aide | Navigation > Aide | Manuel | 6 sous-sections référence |

### Mécanismes partiellement legacy

| Mécanisme | État | Action proposée |
|---|---|---|
| Guidage configuration (`guidage.js`) | Legacy (Mode Guidé déprécié) | Réhabiliter dans le parcours explicite |
| Aide contextuelle (Mode Assisté) | En révision de contenu | Intégrer au parcours, rendre accessible hors Mode Assisté |

---

## 4. Les deux modes d'apprentissage

### Choix initial

Au premier lancement, après le modal de bienvenue, l'utilisateur choisit
son mode d'apprentissage. Ce choix est **réversible** à tout moment via
Réglages > Préférences.

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│   Comment préfères-tu apprendre un nouvel outil ?    │
│                                                      │
│   ┌────────────────────────┐  ┌────────────────────┐ │
│   │                        │  │                    │ │
│   │  🗺️ Étape par étape    │  │  🧭 Par            │ │
│   │                        │  │     exploration    │ │
│   │  Je te guide à travers │  │                    │ │
│   │  chaque fonction dans  │  │  Tu explores       │ │
│   │  l'ordre. Tu avances   │  │  librement avec    │ │
│   │  à ton rythme, une     │  │  des données de    │ │
│   │  étape à la fois.      │  │  démo. L'aide est  │ │
│   │                        │  │  toujours là si    │ │
│   │  ~30 minutes au total  │  │  tu en as besoin.  │ │
│   │                        │  │                    │ │
│   └────────────────────────┘  └────────────────────┘ │
│                                                      │
│   Tu pourras changer d'avis à tout moment            │
│   dans Réglages > Préférences.                       │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### Mode A — Enseignement explicite (📋 Étape par étape)

**Philosophie** : « Je te montre, tu fais. »

- Le système propose activement l'étape suivante
- Les modules Primo se déclenchent dans l'ordre du parcours
- L'aide contextuelle s'affiche proactivement à chaque nouvelle section
- Les tooltips sont affichés aux moments clés (pas seulement au survol)
- La progression est visible en permanence
- Ton directif et structurant

### Mode B — Apprentissage par découverte (🧭 Par exploration)

**Philosophie** : « Explore, je suis là si tu as besoin. »

- Les données de démo sont chargées immédiatement
- L'utilisateur explore librement le bac à sable
- Les tooltips restent disponibles au survol (comportement actuel)
- L'aide contextuelle est accessible par bouton seulement
- La progression est visible mais discrète (pas de notifications proactives)
- Le bouton 🧭 rappelle que le tour guidé est disponible
- Ton suggestif et léger

---

## 5. Architecture du parcours

### Structure à deux niveaux

Le parcours est organisé en **chapitres** et en **jalons** :

```
CHAPITRE (grand geste)
  └── Jalon ① (étape concrète et validable)
  └── Jalon ②
  └── Jalon ③
```

Les chapitres représentent les grands gestes de l'enseignant.
Les jalons sont des étapes concrètes dont l'accomplissement peut
être détecté automatiquement ou confirmé manuellement.

### Les 5 chapitres

```
┌─────────────────────────────────────────────────────────────────┐
│                    PARCOURS MONITORAGE                          │
│                                                                 │
│  CONFIGURER ──→ CONSTRUIRE ──→ PLANIFIER ──→ ENSEIGNER ──→ 🧭 │
│  ton cours      ta note        ta session    au quotidien       │
│                                                                 │
│  Passage        Matériel +     Alignement    Présences +        │
│  obligé         pratique de    + séances     évaluations +      │
│                 notation       (optionnel)   suivi              │
│                                                                 │
│  ① ② ③          ④ ⑤ ⑥ ⑦       ⑧ ⑨          ⑩ ⑪ ⑫            │
└─────────────────────────────────────────────────────────────────┘
```

### Dépendances entre chapitres

```
CONFIGURER ─── obligatoire ───→ CONSTRUIRE
                                    │
                          ┌─────────┼──────────┐
                          ▼         ▼          ▼
                     PLANIFIER  ENSEIGNER   (direct)
                     (optionnel)   │
                                   ▼
                              AUTONOMIE 🧭
```

- **Configurer** est toujours le premier chapitre (pas de données sans configuration)
- **Construire** est requis avant d'évaluer (pas de notes sans grilles/productions)
- **Planifier** est optionnel mais précieux (alignement pédagogique)
- **Enseigner** est le chapitre quotidien (présences, évaluations, suivi)
- **Autonomie** est le jalon final (certification que les bases sont acquises)

---

## 6. Carte des jalons

### Chapitre 1 — CONFIGURER (passage obligé)

| Jalon | Étape | Détection automatique | Mécanisme mobilisé |
|---|---|---|---|
| ① | Créer un trimestre (dates, session) | Trimestre existe dans IndexedDB | Guidage configuration (étape 1-2) |
| ② | Configurer un cours (sigle, titre) | Cours existe | Guidage configuration (étape 1) |
| ③ | Créer un groupe-cours avec étudiants | Groupe avec ≥1 étudiant | Guidage configuration (étape 4) |

**Validation du chapitre** : Un groupe-cours fonctionnel existe
(trimestre + cours + étudiants).

### Chapitre 2 — CONSTRUIRE (matériel + pratique)

| Jalon | Étape | Détection automatique | Mécanisme mobilisé |
|---|---|---|---|
| ④ | Créer une pratique de notation | Pratique existe pour le groupe | Primo MODULE 4 / Wizard pratique |
| ⑤ | Créer une grille de critères | ≥1 grille existe | Tooltips ciblés + aide contextuelle |
| ⑥ | Créer une échelle de niveaux | ≥1 échelle existe | Tooltips ciblés |
| ⑦ | Créer une production (travail) | ≥1 production existe | Aide contextuelle |

**Validation du chapitre** : Le matériel de base est en place
(pratique + grille + échelle + production).

### Chapitre 3 — PLANIFIER (optionnel mais précieux)

| Jalon | Étape | Détection automatique | Mécanisme mobilisé |
|---|---|---|---|
| ⑧ | Créer un alignement pédagogique | ≥1 nœud dans la carte | Primo MODULE 3 (à activer) |
| ⑨ | Organiser les séances du trimestre | ≥1 séance planifiée | Tooltips ciblés |

**Validation du chapitre** : L'alignement est amorcé.
Ce chapitre peut être sauté — il sera suggéré ultérieurement.

### Chapitre 4 — ENSEIGNER (quotidien)

| Jalon | Étape | Détection automatique | Mécanisme mobilisé |
|---|---|---|---|
| ⑩ | Prendre les présences d'une séance | ≥1 entrée de présence | Tutoriel interactif (adapté) |
| ⑪ | Évaluer une production | ≥1 évaluation saisie | Primo MODULE 2 |
| ⑫ | Consulter le tableau de bord | Page visitée avec données | Guidage démo (adapté) |

**Validation du chapitre** : L'utilisateur a fait le cycle complet
au moins une fois (présence + évaluation + consultation).

### Jalon final — AUTONOMIE 🧭

| Jalon | Étape | Détection | Ce qui se passe |
|---|---|---|---|
| 🧭 | Certification d'autonomie | Chapitres 1 + 2 + 4 validés | Message de félicitation + passage en mode autonome |

Le passage en mode autonome signifie :
- Le guidage proactif s'arrête (même en mode explicite)
- Les tooltips et l'aide contextuelle restent disponibles
- L'utilisateur peut relancer le parcours via Réglages > Préférences
- Un indicateur discret rappelle que l'aide existe (bouton 🧭)

---

## 7. Comportement de chaque mécanisme par mode

### Tableau comparatif

| Mécanisme | Mode Explicite 📋 | Mode Découverte 🧭 |
|---|---|---|
| **Modal bienvenue** | Choix du mode → lancement séquentiel | Choix du mode → chargement démo |
| **Primo** | Modules proposés dans l'ordre des jalons | Accessible via 🧭, jamais imposé |
| **Tutoriel interactif** | Déclenché au jalon ⑩ (présences) | Déclenché après import démo (actuel) |
| **Guidage configuration** | Réhabilité pour jalons ① ② ③ | Désactivé (l'utilisateur explore) |
| **Tooltips** | Proactifs aux moments clés + survol | Survol seulement (comportement actuel) |
| **Aide contextuelle** | Proposée à chaque nouvelle section | Accessible par bouton seulement |
| **Guidage démo** | Utilisé comme exercice guidé | Affiché en mode démo (comportement actuel) |
| **Données démo** | Proposées au jalon ⑩ comme exercice | Chargées dès le choix du mode |
| **Wizard pratique** | Déclenché au jalon ④ | Accessible via Construction > Pratiques |
| **Section Aide** | Signalée activement une fois | Disponible dans la navigation |
| **Barre de progression** | Visible en permanence | Visible dans un panneau dédié (Aide ou Accueil) |

### Transitions entre modes

L'utilisateur peut basculer entre les modes à tout moment :
- **Explicite → Découverte** : Le guidage proactif s'arrête, la progression acquise est conservée
- **Découverte → Explicite** : Le système reprend au prochain jalon non validé
- **Tout mode → Autonome** : Automatique quand les jalons essentiels sont complétés

---

## 8. Registre de progression

### Structure de données

Stocké dans localStorage avec namespace trimestre :

```javascript
// Clé : parcours_progression (pas namespacée — globale à l'utilisateur)
{
    mode: 'explicite',        // 'explicite' | 'decouverte' | 'autonome'
    dateDebut: '2026-02-15',

    chapitres: {
        configurer: {
            jalons: {
                'creer-trimestre':    { fait: true,  date: '2026-02-15', auto: true },
                'configurer-cours':   { fait: true,  date: '2026-02-15', auto: true },
                'creer-groupe':       { fait: false, date: null,         auto: true }
            },
            complete: false
        },
        construire: {
            jalons: {
                'creer-pratique':     { fait: false, date: null, auto: true },
                'creer-grille':       { fait: false, date: null, auto: true },
                'creer-echelle':      { fait: false, date: null, auto: true },
                'creer-production':   { fait: false, date: null, auto: true }
            },
            complete: false
        },
        planifier: {
            jalons: {
                'creer-alignement':   { fait: false, date: null, auto: true },
                'organiser-seances':  { fait: false, date: null, auto: true }
            },
            complete: false,
            optionnel: true
        },
        enseigner: {
            jalons: {
                'prendre-presences':  { fait: false, date: null, auto: true },
                'evaluer-production': { fait: false, date: null, auto: true },
                'consulter-tdb':      { fait: false, date: null, auto: true }
            },
            complete: false
        }
    },

    autonome: false,
    dateAutonomie: null
}
```

### Détection automatique des jalons

Chaque jalon a un critère de validation vérifiable programmatiquement :

```javascript
const CRITERES_JALONS = {
    'creer-trimestre':    () => !!localStorage.getItem('trimestre_actuel'),
    'configurer-cours':   () => { /* vérifier existence cours dans IndexedDB */ },
    'creer-groupe':       () => { /* vérifier groupe avec ≥1 étudiant */ },
    'creer-pratique':     () => { /* vérifier pratique existe */ },
    'creer-grille':       () => { /* vérifier ≥1 grille */ },
    'creer-echelle':      () => { /* vérifier ≥1 échelle */ },
    'creer-production':   () => { /* vérifier ≥1 production */ },
    'creer-alignement':   () => { /* vérifier ≥1 nœud carte */ },
    'organiser-seances':  () => { /* vérifier ≥1 séance */ },
    'prendre-presences':  () => { /* vérifier ≥1 entrée présence */ },
    'evaluer-production': () => { /* vérifier ≥1 évaluation */ },
    'consulter-tdb':      () => { /* vérifier visite tableau de bord */ }
};
```

### Quand vérifier

La vérification se fait :
- À chaque changement de section (navigation)
- Après chaque sauvegarde de données (événement applicatif)
- Au chargement de l'application

Quand un jalon passe à `fait: true`, le système :
1. Met à jour le registre
2. En mode explicite : affiche une notification de progression
3. Vérifie si le chapitre est complet
4. Si chapitre complet : propose le chapitre suivant (explicite) ou met à jour silencieusement (découverte)
5. Vérifie si l'autonomie est atteinte

---

## 9. Interface utilisateur

### 9.1 Indicateur de progression (permanent)

Un indicateur discret dans l'en-tête ou la page d'accueil :

```
Mode explicite (visible en permanence) :
┌─────────────────────────────────────────────┐
│ Ton parcours : ④ Créer une pratique ─ 3/12  │
│ ●●●○○○○○○○○○                               │
└─────────────────────────────────────────────┘

Mode découverte (visible sur la page d'accueil) :
┌─────────────────────────────────────────────┐
│ Progression : 3 étapes complétées sur 12    │
│ ●●●○○○○○○○○○                               │
└─────────────────────────────────────────────┘
```

### 9.2 Panneau de parcours (page d'accueil ou section Aide)

Vue complète de la progression avec les 5 chapitres :

```
┌─────────────────────────────────────────────────────────────┐
│              TON PARCOURS MONITORAGE                        │
│                                                             │
│  CONFIGURER                                    ✅ Complété  │
│  ① Créer un trimestre ...................... ✅             │
│  ② Configurer un cours .................... ✅             │
│  ③ Créer un groupe-cours .................. ✅             │
│                                                             │
│  CONSTRUIRE                                    ▶ En cours   │
│  ④ Créer une pratique de notation ......... ○  ← Tu es ici │
│  ⑤ Créer une grille de critères ........... ○              │
│  ⑥ Créer une échelle de niveaux ........... ○              │
│  ⑦ Créer une production ................... ○              │
│                                                             │
│  PLANIFIER                                     ○ Optionnel  │
│  ⑧ Créer un alignement pédagogique ........ ○             │
│  ⑨ Organiser les séances .................. ○              │
│                                                             │
│  ENSEIGNER                                     🔒 Verrouillé│
│  ⑩ Prendre les présences .................. ○              │
│  ⑪ Évaluer une production ................. ○              │
│  ⑫ Consulter le tableau de bord ........... ○              │
│                                                             │
│  ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──   │
│  🧭 AUTONOMIE — Complète les chapitres 1, 2 et 4           │
│     pour débloquer la navigation autonome.                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 9.3 Notification de jalon complété

En mode explicite, quand un jalon est validé :

```
┌──────────────────────────────────────────┐
│ ✅ Étape ③ complétée !                   │
│ Ton groupe-cours est prêt.               │
│                                          │
│ Prochaine étape :                        │
│ ④ Créer une pratique de notation         │
│                                          │
│ [Continuer →]        [Plus tard]         │
└──────────────────────────────────────────┘
```

En mode découverte, notification discrète (toast) :

```
┌──────────────────────────────────────────┐
│ ✅ ③ Groupe-cours créé — 3/12            │
└──────────────────────────────────────────┘
```

### 9.4 Certification d'autonomie

Quand les chapitres 1, 2 et 4 sont complétés :

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│  🧭  Tu as ta boussole !                             │
│                                                      │
│  Tu maîtrises les fonctions essentielles de          │
│  Monitorage. Tu peux maintenant naviguer de          │
│  façon autonome.                                     │
│                                                      │
│  L'aide reste toujours disponible :                  │
│  • Survole un élément pour voir son info-bulle       │
│  • Clique sur 🧭 pour relancer un tour guidé        │
│  • Consulte la section Aide pour la référence        │
│                                                      │
│  [C'est parti ! →]                                   │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## 10. Fichiers concernés

### Nouveau fichier à créer

| Fichier | Rôle |
|---|---|
| `js/parcours-apprentissage.js` | Registre de progression, orchestration, détection des jalons, notifications |

### Fichiers existants à modifier

| Fichier | Modification |
|---|---|
| `modal-bienvenue.js` | Ajouter le choix du mode d'apprentissage après le modal actuel |
| `primo-accueil.js` | Consulter le registre pour proposer le bon module au bon moment |
| `tutoriel-interactif.js` | Brancher sur le jalon ⑩ en mode explicite |
| `guidage.js` | Réhabiliter pour les jalons ① ② ③ en mode explicite |
| `tooltips.js` | Ajouter un mode proactif (affichage sans survol) pour mode explicite |
| `aide-contextuelle.js` | Rendre accessible hors Mode Assisté, brancher sur jalons |
| `guidage-demo.js` | Adapter les encarts selon le mode |
| `donnees-demo.js` | Chargement automatique en mode découverte |
| `accueil.js` | Afficher le panneau de parcours sur la page d'accueil |
| `navigation.js` | Appeler la vérification des jalons à chaque changement de section |
| `index.html` | Ajouter les conteneurs UI (barre de progression, panneau de parcours) |
| `styles.css` | Styles pour les nouveaux composants UI |

### Fichiers à ne PAS modifier

| Fichier | Raison |
|---|---|
| `js/config.js` | Zone protégée |
| `js/navigation.js` | Modification minimale (un appel de vérification seulement) |
| `noms_stables.json` | Zone protégée |

---

## 11. Étapes d'implémentation

### Phase 1 — Fondations (prioritaire)

1. **Créer `parcours-apprentissage.js`**
   - Registre de progression (structure de données)
   - Fonctions de détection des jalons (critères automatiques)
   - API : `verifierJalon()`, `getProgression()`, `getMode()`, `setMode()`
   - Événement `jalon-complete` pour notifier les autres modules

2. **Modifier `modal-bienvenue.js`**
   - Ajouter le choix du mode d'apprentissage (explicite / découverte)
   - Stocker le choix dans le registre

3. **Ajouter l'indicateur de progression**
   - Barre discrète dans l'en-tête (mode explicite) ou page d'accueil (mode découverte)
   - Panneau complet sur la page d'accueil

### Phase 2 — Orchestration mode explicite

4. **Brancher le guidage configuration** sur les jalons ① ② ③
5. **Brancher Primo** pour proposer les modules dans l'ordre des jalons
6. **Ajouter les notifications de jalon complété**
7. **Brancher le tutoriel interactif** sur le jalon ⑩

### Phase 3 — Orchestration mode découverte

8. **Chargement automatique de la démo** au choix du mode
9. **Toast discrets** pour la progression
10. **Rappel 🧭** visible mais non intrusif

### Phase 4 — Certification

11. **Détection de l'autonomie** (chapitres 1 + 2 + 4 validés)
12. **Modal de certification** 🧭
13. **Passage en mode autonome** (arrêt du guidage proactif)

### Phase 5 — Polissage

14. **Préférence dans Réglages** pour changer de mode
15. **Possibilité de réinitialiser** le parcours
16. **Test avec les testeurs** et ajustements

---

## 12. Principes de design

### Ne rien jeter

Chaque mécanisme existant a sa place. Le parcours ne remplace rien —
il orchestre. Un seul nouveau fichier (`parcours-apprentissage.js`)
coordonne tout.

### Respecter l'autonomie

Le système doit savoir **se taire**. L'utilisateur expérimenté ne doit
jamais être ralenti par le parcours. Le mode autonome désactive tout
guidage proactif.

### Détecter plutôt que demander

Privilégier la détection automatique des jalons (vérifier IndexedDB)
plutôt que demander à l'utilisateur de confirmer manuellement. Le
système sait si un trimestre existe — pas besoin de demander.

### Pratiquer ce qu'on prêche

L'outil enseigne la différenciation pédagogique aux enseignants. Il
doit lui-même différencier son approche selon le profil de
l'utilisateur. Le choix entre enseignement explicite et apprentissage
par découverte en est la démonstration directe.

### Progresser, pas bloquer

Le chapitre « Planifier » est optionnel. Le chapitre « Enseigner »
ne devrait pas être verrouillé indéfiniment — si l'utilisateur tente
d'évaluer sans grille, le système explique ce qui manque et propose
de le créer, plutôt que de simplement bloquer.

### Un variateur, pas un interrupteur

Les deux modes ne sont pas des systèmes séparés. C'est un seul système
avec un **variateur d'intensité** : le mode explicite pousse l'aide
activement, le mode découverte la rend disponible passivement, le mode
autonome la met en arrière-plan.

---

*Document généré le 15 février 2026.*
*Prochaine étape : validation par Grégoire, puis implémentation Phase 1.*
