---
name: labo-codex
description: >
  Utiliser ce skill pour toute demande liée à Labo Codex : développement de
  fonctionnalités, révision de code, cohérence de l'interface, architecture,
  rédaction de documentation ou validation de décisions. Déclencher dès que
  Grégoire mentionne Labo Codex, une de ses composantes (modules, pratiques,
  indices, travaux, annotation), ou demande une réflexion sur l'application.
  Pour le cadre théorique (ELLAC, SOLO, PAN, cartouches), voir
  SKILL_Ecosysteme_classe.md. Pour le module Alignement (planification, carte
  mentale, leçons), voir SKILL_Alignement.md.
---

# SKILL : Labo Codex — Application et développement

## 1. CONTEXTE DU PROJET

**Labo Codex** (anciennement «Monitorage Pédagogique») est une application web SPA
de suivi des apprentissages développée par Grégoire Bédard, enseignant de
littérature au Cégep de Drummondville. Elle soutient sa pratique et, à terme,
celle d'enseignants du réseau collégial québécois dans plusieurs disciplines.

**État actuel** : Beta 98.3 (build 0228-2100) — phase de tests réseau janv.-mai 2026  
**Objectif** : Version 1.0 open-source (AGPL v3), présentation AQPC juin 2026  
**Déploiement** : Netlify + Cloudflare Access — app.codexnumeris.org (max 50 utilisateurs)  
**Dépôt** : GitHub (commits fréquents, peu de branches, déploiement continu)

---

## 2. STACK ET ARCHITECTURE

### Stack
- HTML5 / CSS3 / JavaScript ES6+ pur — aucun framework
- Seule dépendance externe : Chart.js (graphiques)
- 100% hors-ligne : IndexedDB (persistant, plusieurs GB) + localStorage (cache synchrone)
- Orchestration stockage : `db.js`
- SPA monolithique : `index.html` (~18 000 l.), `styles.css` (~21 000 l.), 107 modules JS (~169 000 l. au total)

### Principes architecturaux — INVIOLABLES

| Principe | Règle |
|----------|-------|
| **SSOT** (Single Source of Truth) | Chaque donnée a UNE source. Les autres modules lisent, ne recalculent jamais. |
| **Namespacing par trimestre** | Toutes les données préfixées via `window.cle('nomCle')` (ex: `h2026_groupeEtudiants`) |
| **Communication indirecte** | Les modules ne se parlent JAMAIS directement. Uniquement via localStorage/IndexedDB. |
| **Délégation aux pratiques** | Le calcul des indices dépend de la pratique configurée (interface `IPratique`). |
| **Bibliothèque + Assemblage** | Entités réutilisables (non namespacées) assemblées pour un contexte précis. |

### Hiérarchie conceptuelle (sacrée)
```
TRIMESTRE (A2025, H2026)
  └── COURS (601-101, 601-102)
       └── GROUPE (01, 02, 9999-démo)
            └── ÉTUDIANTS + PRODUCTIONS + ÉVALUATIONS
```

### Modules principaux

| Groupe | Fichiers clés | Taille |
|--------|---------------|--------|
| Suivi apprentissages | `profil-etudiant.js`, `indices.js`, `graphiques-progression.js`, `tableau-bord-apercu.js`, `saisie-presences.js`, `portfolio.js` | ~20 000 l. |
| Travaux / Annotation / Évaluation | `travaux-ui.js`, `travaux-annotation.js`, `evaluation.js`, `export-pdf.js` | ~28 000 l. |
| Trimestre / Cours / Groupes | `trimestre-v2.js`, `cours.js`, `horaire.js`, `groupe.js` | — |
| Planification | `planification-carte.js`, `planification.js`, `organisateur.js` | — |
| Pratiques de notation | `pratiques.js`, `pratique-notation-v2.js`, `pratiques-materiel.js` | ~5 500 l. |
| Modélisation | `modelisation.js` | — |
| Infrastructure | `db.js`, `config.js`, `navigation.js`, `main.js` | — |

**Nouveauté Beta 98.3** : `indices.js` — module centralisé pour les indices A-C-P-E
(consolidation d'une logique auparavant dispersée; ne jamais recalculer les indices ailleurs).

---

## 3. CADRE PÉDAGOGIQUE DANS L'APPLICATION

> **Cadre théorique complet** : voir `SKILL_Ecosysteme_classe.md` pour les fondements
> (ELLAC, SOLO, PAN), les cartouches de rétroaction et le manuel élève.

### Flux de données pédagogiques
```
1. CONFIGURATION → Trimestre + Cours + Groupe + Productions
2. SUIVI         → Présences (indice A), Évaluation productions (notes IDME)
3. CALCUL AUTO   → Indices C (complétion), P (performance)
4. DIAGNOSTIC    → A + C + P → Engagement (E), patterns de risque RàI
5. INTERVENTION  → Prof consulte, agit (niveaux 1-2-3)
```

### Indices A-C-P-E

Tous les indices sont calculés dans `indices.js` (module centralisé, Beta 98.3+).
Ne jamais recalculer les indices ailleurs.

| Indice | Nom | Source | Description |
|--------|-----|--------|-------------|
| A | Assiduité | `saisie-presences.js` → `indices.js` | Taux de présence aux cours |
| C | Complétion | `portfolio.js` → `indices.js` | Taux de remise des artefacts |
| P | Performance | Pratique configurée → `indices.js` | Voir détail ci-dessous |
| E | Engagement | Corrélation Pearson A-C-P → `indices.js` | Cohérence entre assiduité, complétion et performance |

**Calcul de P (pratique actuelle de Grégoire, H2026)** :
- Portfolio de 10 artefacts : A1 à A10
- P = note composite basée sur les **4 meilleurs résultats parmi A1-A8** + **A9 et A10** (obligatoires, terminaux)
- Chaque artefact retenu pèse ~16-17% de la note finale
- **En cours de trimestre**, P est un indicateur temporaire de la performance actuelle
- **En fin de trimestre**, P est transposée en note chiffrée certificative

**Note** : Ce calcul dépend de la pratique de notation configurée (ici PAN-Standards
avec sélection portfolio). D'autres pratiques calculent P différemment. Voir section 4.

### Suivi des apprentissages sur les fondamentaux (S, R, F)

Le suivi porte sur les **fondamentaux multistructurels** : Structure (S), Rigueur (R)
et Français (F). Plausibilité et Nuance sont exclues (nécessitent d'abord la maîtrise
des fondations).

**Principe** : le diagnostic est **par artefact**, pas en moyenne. Chaque production
génère un score SRF pondéré (0.35×S + 0.35×F + 0.30×R). C'est la **trajectoire**
de ces scores qui révèle le portrait d'apprentissage, pas leur moyenne.

**Seuils par artefact** (ancrés sur l'échelle IDME) :
- ≥ 0.75 : Fondamentaux maîtrisés (niveau M+)
- 0.65–0.74 : Zone de développement (niveau D)
- < 0.65 : Fondamentaux insuffisants (niveau I)

**Indice de persistance (IPB)** : nombre d'artefacts consécutifs récents où les
fondamentaux sont sous le seuil de maîtrise (< 0.75). C'est la différence entre un
mauvais jour et une difficulté réelle.
- IPB = 1 : Signal à surveiller
- IPB = 2 : Intervention ciblée recommandée
- IPB ≥ 3 : Intervention intensive

**Portrait dynamique** (croisement IPB × direction) :

| IPB | Direction | Diagnostic | Vocabulaire |
|-----|-----------|------------|-------------|
| 0 | — | Fondamentaux solides | **Maîtrise acquise** |
| 1 | ↗ depuis < 0.65 | Amélioration récente | **Difficulté résolue** |
| 1 | → ou ↘ | Premier signal | **Difficulté émergente** |
| 2 | ↗ | Scores en hausse | **Progression** |
| 2 | → | Stabilité sous le seuil | **Plateau** (consolidation ou stagnation — jugement pro.) |
| 2 | ↘ | Détérioration | **Difficulté constante** |
| ≥ 3 | → ou ↘ | Persistance confirmée | **Difficulté persistante** |

**Philosophie** : Le vocabulaire est descriptif, pas alarmiste. « Plateau » n'est pas un
verdict négatif — un D stable peut être une consolidation avant un bond vers M.
L'enseignant interprète le portrait avec son jugement professionnel.

**Note historique** : Le concept de « blocage » dans le tableur originel (A2024-A2025)
utilisait les codes ordinaux I=1, D=2, M=3, E=4 avec des seuils à 1.5/2.0/2.5.
L'application utilise les valeurs IDME normalisées (I=0.40, D=0.65, M=0.75, E=1.00)
avec le seuil M=0.75 comme ancrage empirique validé (données 101→102).

### Logique d'interprétation des patterns

**Premier tour — Contexte comportemental (A-C-P)** :
- P stable + A/C maintenus → Consolidation (engagement soutenu)
- P stable + A/C en baisse → Stagnation (désengagement progressif)
- P en hausse + A/C maintenus/hausse → Amélioration (mobilisation croissante)
- P en baisse + A/C en baisse → Régression (décrochage)

**Second tour — Dynamique cognitive (SRPNF)** :
Diagnostic par artefact sur les N derniers (fenêtre glissante, configurable) :
IPB (persistance sous le seuil 0.75), direction (↗→↘), forces récurrentes (≥ 0.75),
défis récurrents (< 0.75), déplacements entre artefacts.

### Workflow enseignant dans l'application

1. **Collecter** artefacts (via LÉA)
2. **Évaluer** chaque critère SRPNF (expertise professionnelle → niveaux IDME)
3. **Saisir** dans Labo Codex (clic sur niveaux I/D/M/E)
4. **Assembler** rétroaction (cartouche automatique, personnalisable)
5. **Consulter** indices A-C-P-E et portrait dynamique des fondamentaux
6. **Identifier** élèves en difficulté (IPB ≥ 2 sur les fondamentaux S-R-F)
7. **Intervenir** de façon ciblée (niveaux RàI 1-2-3)
8. **Diffuser** rétroaction vers plateforme LÉA

**Actions selon le portrait dynamique** :
- **Difficulté persistante** (IPB ≥ 3) : Rencontre individuelle, plan d'intervention, référence services
- **Difficulté constante** (IPB = 2, ↘) : Intervention ciblée, remédiation sur le défi identifié
- **Plateau** (IPB = 2, →) : Observer — consolidation ou stagnation ? Jugement professionnel
- **Progression** (IPB = 2, ↗) : Encourager, maintenir la dynamique
- **Difficulté résolue** (IPB = 1, ↗) : Renforcement positif, surveiller la stabilité
- **Maîtrise acquise** (IPB = 0) : Valorisation, défis supplémentaires si souhaité

### Échelle IDME et critères SRPNF (résumé)

**IDME** : I (0.01–0.64), D (0.65–0.74), M (0.75–0.84), E (0.85–1.00) — alignés SOLO.
Seuil critique : 0.75 garantit ≥60% au cours suivant.

**SRPNF** : Structure, Rigueur, Plausibilité, Nuance, Français.
S/R/F = fondations multistructurelles ; P = relationnel ; N = abstrait étendu.

> **Définitions complètes et validation empirique** : voir `SKILL_Ecosysteme_classe.md`, Partie 1.

---

## 4. PRATIQUES DE NOTATION SUPPORTÉES

L'application supporte 4 familles. Les identifiants techniques sont stables.

### 4.1 Sommative (traditionnelle)
- **Identifiant** : `sommative`
- **Calcul** : Moyenne pondérée de toutes les évaluations
- **Usage** : Point de comparaison; incluse pour faciliter la transition vers les PAN

### 4.2 PAN-Standards
- **Identifiant** : `pan-standards` (ex: `pan-maitrise`, `alternative` → migration automatique)
- **Échelle** : Niveaux de maîtrise discrets (ex: IDME)
- **Calcul** : Conversion du profil de niveaux en % — 4 modes configurables :
  - **Comptage** (Bruno V.) : grille nb objectifs maîtrisés → note
  - **Moyenne pondérée** (Michel B.) : moyenne des niveaux × pondération
  - **Seuils critiques** (Xavier C.-T.) : tous objectifs ≥ niveau 3
  - **Holistique** (Isabelle M.) : suggestion statistique + jugement professionnel
- **Variante par-objectifs** : standards évalués individuellement, meilleur résultat retenu
- **Reprises** : Multiples, niveau non-rétrogradable
- **Pratique de Grégoire** : Sélection automatique des N meilleurs artefacts (portfolio)

### 4.3 PAN-Spécifications
- **Identifiant** : `pan-specifications`
- **Échelle** : Dichotomique (Conforme / Non-conforme)
- **Calcul** : Note fixe selon forfait complété (ex: C=60%, B=80%, A=100%)
- **Reprises** : Illimitées jusqu'à conformité
- **Référence terrain** : François A.-H., Chimie, Cégep André-Laurendeau

### 4.4 PAN-Dénotation
- **Identifiant** : `pan-denotation`
- **État** : À implémenter (`js/pratiques/pratique-pan-denotation.js` à créer)
- **Principe** : Rétroaction qualitative uniquement; jugement global en fin de cours
- **Références** : Blum (2020), Stommel (2023)

### Fichiers pratiques
```
js/pratiques/pratique-sommative.js
js/pratiques/pratique-pan-standards.js   ← inclut les 4 modes par-objectifs
js/pratique-notation-v2.js               ← interface de configuration
js/pratiques/pratique-pan-specifications.js  ← à compléter
js/pratiques/pratique-pan-denotation.js     ← à créer
```

**Principe de conception** : L'application ne doit pas imposer une pratique. Elle offre
des options configurables qui accommodent des approches différentes. Le jugement
professionnel prime toujours sur l'algorithme.

---

## 5. WORKFLOW DE DÉVELOPPEMENT

### Comment Grégoire travaille
- **Claude Code** : modifications directes dans le code, commits Git
- **CoWork (ce contexte)** : conception, validation, planification, rédaction
- **Échanges possibles** : plans produits ici sont envoyés à Claude Code pour exécution; analyses de code de Claude Code peuvent être apportées ici pour révision
- **VS Code** : consultation du code; édition manuelle rare depuis Claude Code

### Workflow Git
- Peu de branches, commits fréquents, push → déploiement Netlify
- **Local** : données réelles de classe (présences, évaluations) — backups réguliers
- **En ligne** : expérimentation; IndexedDB effacée librement

### Exigences qualité du code
1. **Efficacité et performance** — résultats corrects et rapides
2. **Lisibilité** — code navigable par un non-développeur accompagné
3. **Maintenabilité** — modules cohérents, sans duplication
4. **SSOT strict** — aucun doublon de fonctions ni de données
5. **Dette technique** — résolue au fur et à mesure, pas accumulée

---

## 6. RÔLE DE L'AGENT DANS CE CONTEXTE (CoWork)

### Ce que Grégoire vient chercher ici
- **Conception** : architecture de nouvelles fonctionnalités, intégration de modules
- **Validation** : vérification de la cohérence pédagogique et technique des décisions
- **Rédaction** : documentation, chroniques, matériel de formation
- **Remise en question** : critique constructive des choix avant implémentation
- **Vision** : cohésion globale de l'application, accessibilité pour utilisateurs novices

### Ce que l'agent NE fait PAS ici
- Modifier directement le code (c'est Claude Code qui exécute)
- Supposer la structure exacte du code sans qu'elle soit fournie
- Proposer des solutions qui brisent les principes architecturaux

### Posture de l'agent
- **Station météo, pas pilote automatique** : l'application révèle des conditions,
  le prof décide. L'agent suit la même logique : il analyse et propose, Grégoire tranche.
- Distinguer clairement : fait établi / inférence / extrapolation
- Signaler quand l'information manque plutôt que de compléter par supposition
- Critiquer de façon argumentée, éviter la complaisance
- Prioriser la cohérence de l'ensemble sur l'élégance locale d'une fonctionnalité

### Portée multidisciplinaire (prospective)
Les utilisateurs cibles (automne 2026+) enseignent en philosophie, chimie, histoire,
biologie, etc. Toute conception doit éviter les présupposés propres à la littérature.
Les données empiriques sur d'autres disciplines sont absentes pour l'instant —
ne pas extrapoler sans le signaler.

---

## 7. RÉFÉRENCES DOCUMENTAIRES

| Document | Contenu | Emplacement |
|----------|---------|-------------|
| `Description_de_LaboCodex` | Architecture, modules, historique, état Beta 98.3 | Banque de connaissances |
| `SKILL_101.md` | Cadre pédagogique 601-101-MQ, ELLAC, SRPNF, IDME | Banque de connaissances |
| `DESC-Taxonomie des quatre familles...` | Taxonomy PAN complète avec exemples terrain | Banque de connaissances |
| `Voisardetal37224.pdf` | Article Pédagogie collégiale sur les PAN | Banque de connaissances |
| Chroniques Codex Numeris | Expérimentations pédagogiques publiées | codexnumeris.org |

**Chercheurs clés** : Clark & Talbert (2023), Nilson (2015), Blum (2020),
V., Cormier & A.-H. (2024), Steve Bissonnette (enseignement explicite)

---

## 8. COORDINATION AVEC LES AUTRES SKILLS

| Skill | Rôle | Quand le consulter |
|-------|------|--------------------|
| `SKILL_Ecosysteme_classe.md` | Cadre pédagogique : ELLAC, SOLO, PAN, cartouches SRPNF×IDME, manuel élève | Rédaction de cartouches, validation pédagogique, conception d'artefacts |
| `SKILL_Alignement.md` | Module Alignement : carte mentale, leçons, séquences, design curriculaire | Travail sur le module Planification, cohérence objectifs-activités-évaluations |

**Plugin Productivité** : Les skills `memory-management` et `task-management` gèrent
le glossaire et les tâches de développement. Le vocabulaire pédagogique du glossaire
provient de `SKILL_Ecosysteme_classe.md` ; les étiquettes de modules dans les tâches
correspondent aux modules décrits dans ce skill (section 2).
