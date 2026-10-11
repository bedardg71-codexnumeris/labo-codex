---
name: labo-codex
description: >
  Utiliser ce skill pour toute demande liée à Labo Codex : développement de
  fonctionnalités, révision de code, cohérence de l'interface, architecture,
  rédaction de documentation ou validation de décisions. Déclencher dès que
  Grégoire mentionne Labo Codex, une de ses composantes (modules, pratiques,
  indices, travaux, annotation), ou demande une réflexion sur l'application.
  Pour le cadre théorique (ELLAC, SOLO, PAN, cartouches), voir
  le skill `ecosysteme-classe`. Pour le module Alignement (planification, carte
  mentale, leçons), voir le skill `alignement`. Pour le dépistage et le modèle
  RàI, voir le skill `depistage-rai`. Pour la sécurité et l'anonymisation des données,
  voir le skill `securite-donnees`.
---

# SKILL : Labo Codex — Application et développement

> **Dernière mise à jour** : 3 juillet 2026 (#363 — principe Bibliothèque + Assemblage
> réconcilié avec le namespacing #358 : gabarits partagés vs modèles de travail namespacés).
> **Version** : SemVer, **source unique = `version.json`** (« Bêta publique » est un libellé
> d'affichage, pas le numéro). Ne pas figer un numéro ici — toujours lire `version.json`.

## 1. CONTEXTE DU PROJET

**Labo Codex** (anciennement « Monitorage Pédagogique ») est une application web SPA
de suivi des apprentissages développée par Grégoire Bédard, enseignant de
littérature au Cégep de Drummondville. Elle soutient sa pratique et, à terme,
celle d'enseignants du réseau collégial québécois dans plusieurs disciplines.

**État actuel** : Bêta publique en SemVer (numéro courant dans `version.json`) — lancement
public le 3 juin 2026, phase de nettoyage complet (Phase 6)
**Objectif** : version open-source (AGPL v3), présentation AQPC juin 2026
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
- SPA monolithique : `index.html` (~16 500 l.), `styles.css` (~22 000 l.), ~170 modules JS
  (~200 000 l. ; chiffre indicatif — compter par `find js -name '*.js' | wc -l` au besoin)

### Principes architecturaux — INVIOLABLES

| Principe | Règle |
|----------|-------|
| **SSOT** (Single Source of Truth) | Chaque donnée a UNE source. Les autres modules lisent, ne recalculent jamais. |
| **Namespacing par trimestre** | Toutes les données préfixées via `window.cle('nomCle')` (ex: `h2026_groupeEtudiants`) |
| **Communication indirecte** | Les modules ne se parlent JAMAIS directement. Uniquement via localStorage/IndexedDB. |
| **Délégation aux pratiques** | Le calcul des indices dépend de la pratique configurée (interface `IPratique`). |
| **Bibliothèque + Assemblage** | Entités réutilisables assemblées pour un contexte précis. ⚠ Depuis #358 (28 juin 2026), deux régimes : les GABARITS de départ (`bibliothequeGrilles`/`bibliothequeEchelles`, `cours`, `enseignants`) restent partagés ; les modèles de TRAVAIL (`grillesTemplates`, `echellesTemplates`, `pratiquesConfigurables`, `modalitesEvaluation`) sont NAMESPACÉS par trimestre (`cle()`). |
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
| Pratiques de notation | `pratiques.js`, `pratiques-gestion.js`, les modules de `js/pratiques/` (compter par `ls`) ; `pratique-notation-v2.js` est chargé mais mort (#469) | Configuration et calcul selon la pratique choisie |
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
> **Sécurité des données** : le skill `securite-donnees`

---

## 4. CADRE PÉDAGOGIQUE DANS L'APPLICATION

> **Cadre théorique complet** : voir le skill `ecosysteme-classe` pour les fondements
> (ELLAC, SOLO, PAN), les cartouches de rétroaction et le manuel élève.
> **Dépistage et intervention** : voir le skill `depistage-rai`.

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
P dépend de la pratique de notation configurée. Pour la pratique STD (par standards,
portfolio) : nombre d'artefacts à retenir, mode de sélection (`meilleurs`, `recents`,
`recents-meilleurs`, `tous`), artefacts terminaux configurables. La config portfolio est
lue **uniquement** depuis `pratiquesConfigurables` (depuis la Phase G2-a, 24 mai 2026 —
plus de `modalitesEvaluation.configPAN.portfolio`). Détail technique (résolution, deux
systèmes de calcul, `simulerIndices`, pièges) : **le skill `pratiques-notation` §5/§10.**

### Suivi des fondamentaux, IPB et portraits dynamiques

Le suivi porte sur les **fondamentaux multistructurels** S-R-F (score par artefact
`0.35×S + 0.35×F + 0.30×R`), **par artefact et non en moyenne** : c'est la **trajectoire**
qui révèle le portrait. L'**indice de persistance (IPB)**, les seuils, le tableau des
portraits dynamiques (IPB × direction) et le vocabulaire descriptif appartiennent au
**dépistage RàI** → **voir le skill `depistage-rai`** (ne pas dupliquer ici).

**Échelle IDME / critères SRPNF** (rappel minimal) : I (0.01–0.64), D (0.65–0.74),
M (0.75–0.84), E (0.85–1.00), alignés SOLO ; 0.75 = seuil garantissant ≥60 % au cours
suivant. SRPNF = Structure, Rigueur, Plausibilité, Nuance, Français. **Définitions
complètes et validation empirique** : le skill `ecosysteme-classe`.

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

> **Moteur de calcul, résolution, simulation et pièges** : voir
> le skill `pratiques-notation` (volet technique). Cette section n'est qu'un aperçu.
> Les identifiants ci-dessous sont les libellés legacy ; les **id canoniques neutres**
> (`sommative`/`standards`/`specifications`/`denotation`, sans préfixe `pan-`) datent de
> la canonicalisation Session A — détail dans le skill dédié.

L'application supporte 4 familles. Les modules de `js/pratiques/` se comptent par
`ls js/pratiques/` ; ne pas figer le nombre (il était écrit « 14 », et périmait).

### 5.1 Sommative (traditionnelle)
- **Identifiant** : `sommative`
- **Calcul** : Moyenne pondérée de toutes les évaluations
- **Usage** : Point de comparaison ; incluse pour faciliter la transition vers les PAN
- **Fichier** : `js/pratiques/pratique-sommative.js`

### 5.2 PAN-Standards
- **Identifiant** : `standards` (l'ancien `pan-standards` se résout au registre, avec les défauts de la famille — #711)
- **Échelle** : Niveaux de maîtrise discrets (ex: IDME)
- **Calcul** : conversion du profil de niveaux en %, sur les artefacts retenus par le portfolio
  (nombre à retenir, mode de sélection). ⚠ Les quatre modes « par objectifs » (comptage,
  moyenne pondérée, seuils critiques, holistique) sont **retirés** par #435 (9 août 2026) ;
  seuls `_calculerNiveauxParObjectif` et `suggererNoteHolistique` survivent, pour la
  suggestion holistique de la dénotation.
- **Variante par-objectifs** : foldée dans Standards (Session C Lot 4, 5 juin 2026), puis
  **retirée** avec son routage par #435 ; une pratique stockée qui la porte s'ouvre sur son
  `methodeSelection` réel (lecture seule, `console.warn`).
- **Portfolio** : configurable (nombre à retenir, mode de sélection, artefacts obligatoires)
- **Reprises** : Multiples, niveau non-rétrogradable
- **Fichier** : `js/pratiques/pratique-pan-standards.js`

### 5.3 PAN-Spécifications
- **Identifiant** : `specifications` (l'ancien `pan-specifications` se résout au registre)
- **État** : **Complet** (V2.0, décembre 2025)
- **Échelle** : Dichotomique (Conforme / Non-conforme)
- **Calcul** : Note fixe selon forfait complété (ex: C=60%, B=80%, A=100%)
- **Reprises** : Illimitées jusqu'à conformité
- **Référence terrain** : François A.-H., Chimie, Cégep André-Laurendeau
- **Fichier** : `js/pratiques/pratique-pan-specifications.js`

### 5.4 PAN-Dénotation (DEN)
- **Identifiant** : `denotation` (badge famille « PAN » ; académiquement = **PRÉN**)
- **État** : **implémenté** (couche 2, #318, 8 juin 2026)
- **Calcul** : la note finale est un **jugement SAISI** par l'enseignant, gardé par
  l'atteinte des cibles (une cible non confirmée plafonne à 59 ; toutes confirmées → la
  note saisie). Pas de saisie → non calculable, jamais un zéro.
- **Fichiers** : `js/pratiques/denotation-jugements.js`, `js/pratiques/denotation-saisie-ui.js` ;
  moteur `_calculerPerformanceDenotation` dans `js/pratiques/pratique-configurable.js`
- **Références** : Blum (2020), Stommel (2023) ; détail technique : le skill `pratiques-notation` §8

### Fichiers pratiques (infrastructure)
```
js/pratiques/pratique-interface.js          # Interface commune IPratique
js/pratiques/pratique-configurable.js       # Configuration générique
js/pratiques/pratique-registre.js           # Registre des pratiques disponibles
js/pratiques/pratique-manager.js            # Gestion de la pratique active
js/pratique-notation-v2.js                  # MORT : ses 14 cibles n'existent plus dans la page (#469, 11 oct. 2026)
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
5. **Stabilité zéro-dette** — tout nouveau chantier retire ce qu'il remplace (détails : CLAUDE.md)

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

**`design-system.html`** (racine) = source de vérité visuelle (palette sombre/clair,
surfaces, composants). Règles complètes (variables CSS de `styles.css`, pas de couleur
en dur, conformité dans les deux modes, accessibilité) : **voir CLAUDE.md**.

---

## 10. COORDINATION AVEC LES AUTRES SKILLS

| Skill | Rôle | Quand le consulter |
|-------|------|--------------------|
| le skill `pratiques-notation` | Moteur de calcul des pratiques : résolution, deux systèmes de calcul, `simulerIndices`, configs exécutables, pièges | Tout chantier touchant `js/pratiques/`, le calcul de la note ou la simulation/comparaison de pratiques |
| le skill `ecosysteme-classe` | Cadre pédagogique : ELLAC, SOLO, PAN, cartouches SRPNF×IDME, manuel élève | Rédaction de cartouches, validation pédagogique, conception d'artefacts |
| le skill `alignement` | Module Alignement : carte mentale, leçons, séquences, design curriculaire | Travail sur le module Planification, cohérence objectifs-activités-évaluations |
| le skill `depistage-rai` | Dépistage SOLO, IPB, diagnostic croisé, patterns, interventions RàI | Travail sur les indices, les portraits dynamiques, les interventions |
| le skill `securite-donnees` | Sécurité, anonymisation, intégrité, modèle de menaces, Loi 25 | Tout travail sur les données (codex, réserve, import/export, anonymisation) |

**Plugin Productivité** : Les skills `memory-management` et `task-management` gèrent
le glossaire et les tâches de développement. Le vocabulaire pédagogique du glossaire
provient du skill `ecosysteme-classe` ; les étiquettes de modules dans les tâches
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
| 2026-04-26 | Refonte complète. Retrait indice E, écosystème de données (Codex/Réserve/Codex data/Voûte), PAN-Spécifications complet, portfolio configurable, synthèse de rétroaction, principe zéro-dette, 8 libs, références croisées aux 5 skills, section design system. |
| 2026-06-11 | Corrections factuelles. Version → renvoi `version.json` (SemVer ; fin du figé « Beta 99.25 »). §4 : config portfolio lue depuis `pratiquesConfigurables` (plus `configPAN.portfolio`) ; IPB/portraits → renvoi le skill `depistage-rai`. §5 : DEN passé « non implémenté » → **implémenté** (#318) ; compte `js/pratiques/` corrigé (14) ; comptes modules/lignes rendus indicatifs. §7/§9 zéro-dette + design system → renvois CLAUDE.md. |
