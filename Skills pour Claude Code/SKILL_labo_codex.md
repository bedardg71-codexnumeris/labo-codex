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
  mentale, leçons), voir SKILL_Alignement.md. Pour le dépistage et le modèle
  RàI, voir SKILL_RaI.md. Pour la sécurité et l'anonymisation des données,
  voir SKILL_Securite_donnees.md.
---

# SKILL : Labo Codex — Application et développement

> **Dernière mise à jour** : 26 avril 2026 (Beta 99.25)

## 1. CONTEXTE DU PROJET

**Labo Codex** (anciennement « Monitorage Pédagogique ») est une application web SPA
de suivi des apprentissages développée par Grégoire Bédard, enseignant de
littérature au Cégep de Drummondville. Elle soutient sa pratique et, à terme,
celle d'enseignants du réseau collégial québécois dans plusieurs disciplines.

**État actuel** : Beta 99.25 (build 0425-1916) — phase de nettoyage complet (Phase 6)
**Objectif** : Version 1.0 open-source (AGPL v3), présentation AQPC juin 2026
**Dépôt** : GitHub (commits fréquents, peu de branches)
**Fonctionnement** : 100 % hors-ligne, pas de serveur requis

---

## 2. STACK ET ARCHITECTURE

### Stack
- HTML5 / CSS3 / JavaScript ES6+ pur — aucun framework
- Dépendances externes (toutes dans `libs/`) :
  - Chart.js + chartjs-plugin-annotation (graphiques)
  - jsPDF + jspdf-autotable (génération PDF)
  - html2canvas (rasterisation HTML → image pour synthèse de rétroaction)
  - JSZip (codex, export, réserve)
  - pdf.js + pdf.worker (lecture de PDF dans le navigateur)
- 100 % hors-ligne : IndexedDB (persistant, plusieurs GB) + localStorage (cache synchrone)
- Orchestration stockage : `db.js` (abstraction hybride localStorage / IndexedDB / memoryCache)
- SPA monolithique : `index.html` (~16 500 l.), `styles.css` (~22 000 l.), 102 modules JS (~176 000 l.)

### Principes architecturaux — INVIOLABLES

| Principe | Règle |
|----------|-------|
| **SSOT** (Single Source of Truth) | Chaque donnée a UNE source. Les autres modules lisent, ne recalculent jamais. |
| **Namespacing par trimestre** | Toutes les données préfixées via `window.cle('nomCle')` (ex: `h2026_groupeEtudiants`) |
| **Communication indirecte** | Les modules ne se parlent JAMAIS directement. Uniquement via localStorage/IndexedDB. |
| **Délégation aux pratiques** | Le calcul des indices dépend de la pratique configurée (interface `IPratique`). |
| **Bibliothèque + Assemblage** | Entités réutilisables (non namespacées) assemblées pour un contexte précis. |
| **Stabilité zéro-dette** | Tout nouveau chantier RETIRE ce qu'il remplace. Pas d'alias « au cas où », pas de code mort. Voir CLAUDE.md pour les détails. |

### Hiérarchie conceptuelle (sacrée)
```
TRIMESTRE (A2025, H2026)
  └── COURS (601-101, 601-102)
       └── GROUPE-COURS (gr00001, gr00002, 9999-démo)
            └── ÉTUDIANTS + PRODUCTIONS + ÉVALUATIONS
```

### Pattern des modules

Tous les modules utilisent le pattern IIFE :
```javascript
(function() {
'use strict';
// ... code du module ...
window.NomModule = { ... };
})();
```

Les modules ne s'importent pas entre eux — ils communiquent via `window.*` et `db.getSync()`.

### Modules principaux

| Groupe | Fichiers clés | Description |
|--------|---------------|-------------|
| Infrastructure | `db.js`, `config.js`, `navigation.js`, `main.js`, `init-inline.js` | Stockage, config navigation, dispatcher d'actions |
| Indices A-C-P | `indices.js` | Module centralisé unique — ne JAMAIS recalculer les indices ailleurs |
| Suivi apprentissages | `profil-etudiant.js`, `graphiques-progression.js`, `tableau-bord-apercu.js`, `saisie-presences.js`, `portfolio.js` | Portrait étudiant, visualisation, assiduité, sélection portfolio |
| Travaux / Annotation | `travaux-ui.js`, `travaux-annotation.js`, `travaux-import.js`, `travaux-stockage.js`, `travaux-export-pdf.js`, `travaux-visionneuse.js` | Import, stockage, annotation, visualisation des productions |
| Évaluation | `evaluation.js`, `evaluation-jetons.js`, `liste-evaluations.js` | Saisie des niveaux IDME, jetons, gestion des évaluations |
| Synthèse rétroaction | `synthese-retroaction-data.js`, `synthese-retroaction-rendu.js` | Pipeline HTML rasterisé via html2canvas (Beta 99, avril 2026) |
| Données | `codex.js`, `import-export.js`, `reserve.js` | Codex (ZIP portable), import/export, réserve (archivage) |
| Trimestre / Cours | `trimestre-v2.js`, `trimestres.js`, `cours.js`, `horaire.js`, `groupe.js` | Gestion de la session, des cours et des groupes |
| Planification | `planification-carte.js`, `planification.js`, `planification-donnees.js`, `organisateur.js` | Carte mentale, séquences, organisateur de leçons |
| Pratiques de notation | `pratiques.js`, `pratique-notation-v2.js`, 12 modules dans `js/pratiques/` | Configuration et calcul selon la pratique choisie |
| Dépistage / RàI | `snapshots.js`, `interventions.js`, `correlations-longitudinales.js` | Snapshots de progression, interventions RàI, analyse longitudinale |
| Bibliothèques | `grilles-bibliotheque.js`, `echelles-bibliotheque.js`, `productions-bibliotheque.js`, `cartouches-bibliotheque.js`, `tampons-bibliotheque.js`, `pratiques-bibliotheque.js`, `planification-bibliotheque.js` | Gestion des entités réutilisables |

---

## 3. ÉCOSYSTÈME DES DONNÉES

> **Document fondateur** : `docs/architecture/ECOSYSTEME-DONNEES.md` (26 avril 2026)

Quatre concepts distincts avec des vocations, formats et cycles de vie propres :

| Concept | Vocation | Format | Portée |
|---------|----------|--------|--------|
| **Codex** | Espace de travail actif | `.codex.zip` (DEFLATE) | 1 trimestre |
| **Réserve** | Archive personnelle locale (jamais purgée) | Répertoire sur disque | Tous les trimestres, par groupe-cours |
| **Codex data** | Format léger pour la recherche | `.codex-data.json` | 1 ou N groupes combinés |
| **Voûte** | Bibliothèque partagée entre enseignants | À définir | Multi-utilisateurs |

**Verbes** : ouvrir/enregistrer (codex), verser (→ réserve), extraire (→ codex data),
charger (→ Labo), anonymiser, déposer (→ voûte), emprunter (← voûte).

**Granularité** : la Réserve est organisée par **groupe-cours**, pas par trimestre.
Convention de nommage : `{trimestre}-{cours}-gr{groupe}` (ex. `a2025-601-101-gr00001`).
Chaque versement porte un UUID v4 unique.

> **Spécification technique** : `docs/architecture/SPEC-RESERVE-V1.md`
> **Sécurité des données** : `Skills pour Claude Code/SKILL_Securite_donnees.md`

---

## 4. CADRE PÉDAGOGIQUE DANS L'APPLICATION

> **Cadre théorique complet** : voir `SKILL_Ecosysteme_classe.md` pour les fondements
> (ELLAC, SOLO, PAN), les cartouches de rétroaction et le manuel élève.
> **Dépistage et intervention** : voir `SKILL_RaI.md`.

### Flux de données pédagogiques
```
1. CONFIGURATION → Trimestre + Cours + Groupe + Productions
2. SUIVI         → Présences (indice A), Évaluation productions (niveaux IDME)
3. CALCUL AUTO   → Indices C (complétion), P (performance)
4. DIAGNOSTIC    → A + C + P → Patterns de risque, IPB, portraits dynamiques
5. INTERVENTION  → Prof consulte, agit (paliers RàI 1-2-3)
```

### Indices A-C-P

Tous les indices sont calculés dans `indices.js` (module centralisé).
**Ne jamais recalculer les indices ailleurs.**

| Indice | Nom | Source | Description |
|--------|-----|--------|-------------|
| A | Assiduité | `saisie-presences.js` → `indices.js` | Taux de présence aux cours |
| C | Complétion | `portfolio.js` → `indices.js` | Taux de remise des artefacts |
| P | Performance | Pratique configurée → `indices.js` | Note composite selon la pratique active |

**Note historique** : l'indice E (Engagement, corrélation Pearson A-C-P) a été retiré.
La fonction `calculerCorrelationPearson` reste disponible dans `indices.js` comme
utilitaire, mais ne produit plus d'indice affiché.

**Calcul de P** :
P dépend de la pratique de notation configurée. Pour la pratique de Grégoire
(PAN-Standards avec portfolio) :
- Portfolio configurable : nombre d'artefacts à retenir, mode de sélection
  (`meilleurs`, `recents`, `recents-meilleurs`, `tous`)
- Artefacts obligatoires (terminaux) configurables
- La configuration se fait via `modalitesEvaluation.configPAN.portfolio`

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

### Échelle IDME et critères SRPNF (résumé)

**IDME** : I (0.01–0.64), D (0.65–0.74), M (0.75–0.84), E (0.85–1.00) — alignés SOLO.
Seuil critique : 0.75 garantit ≥60 % au cours suivant.

**SRPNF** : Structure, Rigueur, Plausibilité, Nuance, Français.
S/R/F = fondations multistructurelles ; P = relationnel ; N = abstrait étendu.

> **Définitions complètes et validation empirique** : voir `SKILL_Ecosysteme_classe.md`.

### Workflow enseignant dans l'application

1. **Collecter** artefacts (via LÉA/Omnivox)
2. **Évaluer** chaque critère SRPNF (expertise professionnelle → niveaux IDME)
3. **Saisir** dans Labo Codex (clic sur niveaux I/D/M/E)
4. **Assembler** rétroaction (cartouche automatique, personnalisable)
5. **Consulter** indices A-C-P et portrait dynamique des fondamentaux
6. **Identifier** élèves en difficulté (IPB ≥ 2 sur les fondamentaux S-R-F)
7. **Intervenir** de façon ciblée (paliers RàI 1-2-3)
8. **Diffuser** rétroaction vers plateforme LÉA (synthèse PDF rasterisée)

---

## 5. PRATIQUES DE NOTATION SUPPORTÉES

L'application supporte 4 familles. Les identifiants techniques sont stables.
12 modules dans `js/pratiques/` (~7 200 lignes au total).

### 5.1 Sommative (traditionnelle)
- **Identifiant** : `sommative`
- **Calcul** : Moyenne pondérée de toutes les évaluations
- **Usage** : Point de comparaison ; incluse pour faciliter la transition vers les PAN
- **Fichier** : `js/pratiques/pratique-sommative.js`

### 5.2 PAN-Standards
- **Identifiant** : `pan-standards`
- **Échelle** : Niveaux de maîtrise discrets (ex: IDME)
- **Calcul** : Conversion du profil de niveaux en % — 4 modes configurables :
  - **Comptage** (Bruno V.) : grille nb objectifs maîtrisés → note
  - **Moyenne pondérée** (Michel B.) : moyenne des niveaux × pondération
  - **Seuils critiques** (Xavier C.-T.) : tous objectifs ≥ niveau 3
  - **Holistique** (Isabelle M.) : suggestion statistique + jugement professionnel
- **Variante par-objectifs** : standards évalués individuellement, meilleur résultat retenu
- **Portfolio** : configurable (nombre à retenir, mode de sélection, artefacts obligatoires)
- **Reprises** : Multiples, niveau non-rétrogradable
- **Fichiers** : `js/pratiques/pratique-pan-standards.js`, `js/pratiques/pratique-pan-objectifs.js`

### 5.3 PAN-Spécifications
- **Identifiant** : `pan-specifications`
- **État** : **Complet** (V2.0, décembre 2025)
- **Échelle** : Dichotomique (Conforme / Non-conforme)
- **Calcul** : Note fixe selon forfait complété (ex: C=60%, B=80%, A=100%)
- **Reprises** : Illimitées jusqu'à conformité
- **Référence terrain** : François A.-H., Chimie, Cégep André-Laurendeau
- **Fichier** : `js/pratiques/pratique-pan-specifications.js`

### 5.4 PAN-Dénotation
- **Identifiant** : `pan-denotation`
- **État** : **Non implémenté** (aucun fichier créé)
- **Principe** : Rétroaction qualitative uniquement ; jugement global en fin de cours
- **Références** : Blum (2020), Stommel (2023)

### Fichiers pratiques (infrastructure)
```
js/pratiques/pratique-interface.js          # Interface commune IPratique
js/pratiques/pratique-configurable.js       # Configuration générique
js/pratiques/pratique-registre.js           # Registre des pratiques disponibles
js/pratiques/pratique-manager.js            # Gestion de la pratique active
js/pratique-notation-v2.js                  # Interface de configuration (UI)
js/wizard-pratique-v2.js                    # Assistant de configuration
```

**Principe de conception** : L'application ne doit pas imposer une pratique. Elle offre
des options configurables qui accommodent des approches différentes. Le jugement
professionnel prime toujours sur l'algorithme.

---

## 6. SYNTHÈSE DE RÉTROACTION (Beta 99, avril 2026)

Pipeline de génération du PDF de rétroaction pour les étudiants.

**Architecture** :
```
synthese-retroaction-data.js  (module data pur, ~340 l.)
  → construireFeedback() assemble le shape Feedback depuis les sources existantes
synthese-retroaction-rendu.js (module rendu HTML, ~450 l.)
  → rendreSyntheseHTML() produit du HTML/CSS inline
travaux-export-pdf.js
  → ajouterPageSynthese() rastérise via html2canvas, ajoute au PDF
```

**Principe** : « La synthèse est un reformatage, pas une production. » Aucun nouveau
champ dans le modèle de données, aucun calcul nouveau. Sections sans donnée masquées
automatiquement.

**Choix technique** : HTML rasterisé via html2canvas plutôt que reproduction en jsPDF
natif. Le design est trop dense pour du PDF natif. Inconvénient : texte non
sélectionnable — acceptable car usage cible = consultation sur cellulaire.

---

## 7. WORKFLOW DE DÉVELOPPEMENT

### Comment Grégoire travaille
- **Claude Code (terminal)** : modifications directes dans le code, commits Git
- **Cowork (ce contexte)** : conception, validation, planification, rédaction
- **Échanges** : plans produits en Cowork sont envoyés à Claude Code via SESSION.md ;
  analyses de code de Claude Code peuvent être apportées en Cowork pour révision
- **VS Code** : consultation du code ; édition manuelle rare

### Workflow Git
- Peu de branches, commits fréquents, main uniquement
- **Local** : données réelles de classe (présences, évaluations) — backups manuels (USB + iCloud)
- **version.json** : source de vérité pour la version (`{"build":"MMJJ-HHMM","beta":"XX.X"}`)
- **Cache-busters** : bumper `?v=` dans `index.html` pour chaque `.js` modifié

### Exigences qualité du code
1. **Efficacité et performance** — résultats corrects et rapides
2. **Lisibilité** — code navigable par un non-développeur accompagné
3. **Maintenabilité** — modules cohérents, sans duplication
4. **SSOT strict** — aucun doublon de fonctions ni de données
5. **Stabilité zéro-dette** — tout nouveau chantier retire ce qu'il remplace.
   Pas d'alias « au cas où », pas de code mort « pour plus tard ».
   Refactoring permis si ça rend le code plus propre.

---

## 8. RÔLE DE L'AGENT DANS CE CONTEXTE (Cowork)

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

## 9. RÉFÉRENCE VISUELLE

**`design-system.html`** (racine du projet) est la source de vérité pour :
- Palette de couleurs (modes sombre et clair)
- Surfaces, ombres, border-radius
- Boutons, formulaires, cartes, en-têtes, tableaux, alertes, badges

**Règles** : utiliser les variables CSS de `styles.css`, ne jamais inventer de couleurs
en dur, vérifier la conformité dans les deux modes. Voir CLAUDE.md pour les détails.

---

## 10. COORDINATION AVEC LES AUTRES SKILLS

| Skill | Rôle | Quand le consulter |
|-------|------|--------------------|
| `SKILL_Ecosysteme_classe.md` | Cadre pédagogique : ELLAC, SOLO, PAN, cartouches SRPNF×IDME, manuel élève | Rédaction de cartouches, validation pédagogique, conception d'artefacts |
| `SKILL_Alignement.md` | Module Alignement : carte mentale, leçons, séquences, design curriculaire | Travail sur le module Planification, cohérence objectifs-activités-évaluations |
| `SKILL_RaI.md` | Dépistage SOLO, IPB, diagnostic croisé, patterns, interventions RàI | Travail sur les indices, les portraits dynamiques, les interventions |
| `SKILL_Securite_donnees.md` | Sécurité, anonymisation, intégrité, modèle de menaces, Loi 25 | Tout travail sur les données (codex, réserve, import/export, anonymisation) |

**Plugin Productivité** : Les skills `memory-management` et `task-management` gèrent
le glossaire et les tâches de développement. Le vocabulaire pédagogique du glossaire
provient de `SKILL_Ecosysteme_classe.md` ; les étiquettes de modules dans les tâches
correspondent aux modules décrits dans ce skill (section 2).

**Documents d'architecture** :
- `docs/architecture/ECOSYSTEME-DONNEES.md` — les 4 concepts de données
- `docs/architecture/SPEC-RESERVE-V1.md` — spécification technique de reserve.js
- `docs/00-START-HERE.md` — point d'entrée obligatoire pour Claude Code
- `docs/DATA-OWNERSHIP.md` — registre de propriété des clés de stockage

---

## HISTORIQUE

| Date       | Changement |
|------------|------------|
| 2026-02-28 | Création (Beta 98.3) |
| 2026-04-26 | Refonte complète. Retrait indice E, mise à jour version (99.25), ajout écosystème de données (Codex/Réserve/Codex data/Voûte), PAN-Spécifications marqué complet, portfolio configurable, ajout synthèse de rétroaction, principe zéro-dette, 8 libs documentées, 102 modules / ~176 000 lignes, références croisées aux 5 skills, section design system. |
