# Audit qualité du code — Monitorage v6

> **Date** : 28 février 2026 | **Version** : Beta 98.2
> **Portée** : 5 modules critiques (audit approfondi) + modules secondaires (survol) + CSS
> **Axes** : Architecture/SSOT, Code mort/duplication, Robustesse/erreurs, Performance/mémoire
> **Nature** : Diagnostic uniquement — aucun code modifié

---

## Résumé exécutif

| Module | CRITIQUE | MODÉRÉ | MINEUR | Verdict |
|--------|----------|--------|--------|---------|
| **Vérification architecturale** | 1 | 5 | 3 | IndexedDB parallèle dans travaux-stockage |
| **Travaux** (10 fichiers) | 3 | 6 | 4 | Blobs sans limites, promesses non gérées |
| **Évaluation** (5 fichiers) | 7 | 18 | 17 | Module le plus problématique — mélange SSOT |
| **Trimestre** (5 fichiers) | 3 | 4 | 5 | Namespacing incomplet (6 clés manquantes) |
| **Planification** (4 fichiers) | 4 | 15 | 6 | Drag sans throttle, code legacy prototype |
| **Suivi apprentissages** (7 fichiers) | 3 | 5 | 4 | Duplication calculs indices, division/0 |
| **Autres modules** (survol) | 2 | 7 | 6 | Variable non nettoyée (import-export) |
| **CSS** | 1 | 3 | 2 | 1 119 styles inline |
| **TOTAL** | **24** | **63** | **47** | **134 constats** |

---

## Étape 1 — Vérification architecturale

### 🔴 CRITIQUE

**ARC-01 — IndexedDB parallèle contourne db.js**
- **Fichier** : `travaux-stockage.js:51, 132, 147`
- `indexedDB.open('MonitorageFichiers', DB_VERSION)` ouvre sa propre base au lieu de passer par `db.js`
- Les données fichiers sont isolées du cache hybride localStorage/IndexedDB
- **Recommandation** : Créer une API blob dans db.js ou fusionner les deux bases

### 🟡 MODÉRÉ

**ARC-02** — `travaux-ui.js:27-88` : localStorage/sessionStorage directs pour état UI (`travaux-panneaux-largeurs`, `travaux-filtre-production`, etc.) sans `cle()`
**ARC-03** — `rapport-bug.js:83-1378` : Métadonnées testeur non namespacées (`bugTicketsConfirmes`, `prenomTesteurBug`)
**ARC-04** — `organisateur.js:233-243` : Sélections UI non namespacées (`org_selections`)
**ARC-05** — `statistiques.js:214` : Itération brute `localStorage.length` (exception documentée, acceptable)
**ARC-06** — `pratiques.js`, `groupe.js` : sessionStorage sans `cle()` (`pratiqueSelectionnee`, `etudiantEnModification`)

### 🟢 Points positifs

- **Noms stables** : 0 doublons, usage correct des 10 clés définies
- **Namespacing** : 95% des données métier passent par `cle()` via `db.js`
- **SSOT** : Globalement respecté hors exceptions ci-dessus

---

## Étape 2 — Module Travaux

> 10 fichiers audités : travaux-ui.js, travaux-annotation.js, travaux-outils.js, travaux-visionneuse.js, travaux-import.js, travaux-preparation.js, travaux-stockage.js, travaux-archivage.js, travaux-export-pdf.js, liste-evaluations.js

### 🔴 CRITIQUE

**TRV-01 — Deadlock UI si preRendreAdjacentes() throw**
- **Fichier** : `travaux-visionneuse.js:160-215`
- `enRendu = true` n'est jamais reset à `false` si `preRendreAdjacentes()` lance une exception après le try/catch principal
- **Recommandation** : Wrapper dans try/catch ou utiliser `finally { enRendu = false; }`

**TRV-02 — Promesses fire-and-forget**
- **Fichier** : `travaux-import.js:336-337`
- `genererThumbnailQueue(prepare)` appelé sans `await` ni `.catch()` — erreurs silencieuses
- **Recommandation** : Ajouter `.catch(err => console.error(...))`

**TRV-03 — Blobs stockés sans limite de taille**
- **Fichier** : `travaux-stockage.js:259-293`
- Aucune vérification de taille avant `store.put(enregistrement)`. IndexedDB ~50 MB par origin.
- Les PDFs ne sont pas compressés (contrairement aux images)
- **Recommandation** : Ajouter validation de taille + avertissement utilisateur

### 🟡 MODÉRÉ

**TRV-04** — `travaux-annotation.js:305-306` : `annotationCourante` peut être null → `null.pages` = TypeError
**TRV-05** — `travaux-annotation.js:85-98` : Race condition potentielle sur `annotationActive` pendant événement async
**TRV-06** — Couplage direct inter-modules via `window.travauxX` (fragile, dépend de l'ordre de chargement)
**TRV-07** — Métadonnées fichiers dupliquées entre localStorage et IndexedDB (risque de désynchronisation)
**TRV-08** — `travaux-outils.js:1104-1110` : `classList.toggle()` dans boucle = N reflows
**TRV-09** — `travaux-annotation.js:594-701` : `getBoundingClientRect()` à chaque `pointermove` (~100+/sec sur tablette)

### 🟢 Points positifs

- Cache de pages pré-rendues (Map, max 5) bien implémenté
- Nettoyage symétrique addEventListener/removeEventListener dans annotation
- Deep copy des annotations bien gérée

---

## Étape 3 — Module Évaluation

> 5 fichiers audités : evaluation.js (6 500L), evaluation-jetons.js (833L), pratique-notation-v2.js (1 960L), pratiques-materiel.js (2 755L), export-pdf.js (2 963L) — Total : 15 166 lignes

### 🔴 CRITIQUE

**EVL-01 — Mélange incohérent des sources de lecture (root cause bug #71)**
- **Fichier** : `evaluation.js` (16 appels `db.getSync()` directs vs 8 appels `obtenirDonneesSelonMode()`)
- Les fonctions de modification utilisent `db.getSync()` tandis que l'affichage utilise `obtenirDonneesSelonMode()` → données divergentes selon le mode (assisté/simulation)
- `modifierEvaluation()` lit via mode MAIS cherche dans source directe
- **Recommandation** : Choisir UNE source et l'utiliser systématiquement (16 appels à harmoniser)

**EVL-02 — Perte de données inter-trimestre**
- **Fichier** : `evaluation.js:2018, 3576, 4181, 5026`
- Basculer de groupe-cours A (h2026) vers B (a2025) : les évaluations de h2026 disparaissent du tableau car `cle()` retourne une clé différente
- **Recommandation** : Ajouter vérification trimestre lors du chargement des évaluations

**EVL-03 — Pas de validation référentielle avant sauvegarde**
- **Fichier** : `evaluation.js:1891`
- `sauvegarderEvaluation()` n'a pas de validation (contrairement à `sauvegarderEvaluationModifiee()` ligne 5057) → référence brisée si étudiant supprimé
- **Recommandation** : Ajouter validation `etudiant` existe avant sauvegarde

**EVL-04 — Double sauvegarde bypass mode (jetons)**
- **Fichier** : `evaluation-jetons.js:171, 226, 362, 466, 758, 797`
- `db.setSync()` direct au lieu de `sauvegarderDonneesSelonMode()` → jetons s'appliquent aux vraies données en mode assisté
- **Recommandation** : Utiliser `sauvegarderDonneesSelonMode()` dans tout evaluation-jetons.js

**EVL-05 — Sérialisation JSON coûteuse dans jetons**
- **Fichier** : `evaluation-jetons.js:325`
- `JSON.parse(JSON.stringify(evaluationOriginale))` à chaque jeton de reprise (deep clone bloquant)
- **Recommandation** : Utiliser `structuredClone()`

**EVL-06 — Console.log debug non supprimés**
- **Fichier** : `evaluation.js:1551-1623`
- ~20 `console.log('🔍 DEBUG ...')` dans `calculerNote()` → spamme la console (300+ logs par session)
- **Recommandation** : Supprimer ou remplacer par `console.debug()`

**EVL-07 — Fonctions fantômes FIXME**
- **Fichier** : `evaluation.js:6251-6252`
- `gererCheckboxJetonDelai`, `gererCheckboxJetonReprise` commentées avec FIXME, jamais définies

### 🟡 MODÉRÉ

**EVL-08** — Couplage bidirectionnel evaluation.js ↔ jetons (mutations indirectes de `evaluationEnCours` non visibles)
**EVL-09** — Source unique pour "pratiques actives" floue (répartie entre 3 fichiers)
**EVL-10** — Grille supprimée post-création → `grille.criteres.forEach()` crash
**EVL-11** — Mode anonymisé contourné par les jetons (`db.getSync()` direct)
**EVL-12** — Recalcul `calculerEtStockerIndicesCP()` 5× si 5 jetons appliqués
**EVL-13** — `attendreOption()` avec polling actif (setInterval 100ms × 20)
**EVL-14** — Fonction vidée `afficherDescriptionTaxonomiqueMat()` gardée pour "compatibilité"
**EVL-15** — Variable `enChargementFormulaire` settée mais jamais lue
**EVL-16** — Code mort : `repairerEvaluationsProblematiques()` (115 lignes, 0 appels)

---

## Étape 4 — Module Trimestre

> 5 fichiers audités : trimestre-v2.js (6 311L), trimestres.js (1 834L), cours.js (1 704L), horaire.js (1 689L), groupe.js (1 238L)

### 🔴 CRITIQUE

**TRM-01 — 6 clés manquantes dans CLES_NAMESPACEES**
- **Fichier** : `trimestres.js:23-50`, `trimestre-v2.js:1290-1300`
- Clés non namespacées par trimestre : `listeCours`, `cours`, `infoCours`, `groupeCoursActif`, `horaireSelectionne`, `pratiqueParDefaut`
- Impact : basculer de H2026 → A2025 affiche les cours du dernier trimestre chargé
- **Recommandation** : Décider pour chaque clé (global vs trimestre-spécifique) et documenter

**TRM-02 — Double source de vérité pour "cours"**
- **Fichier** : `trimestre-v2.js:1290-1291`
- `db.getSync('listeCours', [])` ET `db.getSync('cours', [])` coexistent + fusion
- Migration Beta 95.2 de `listeCours` → `cours` incomplète
- **Recommandation** : Garder UNE clé, nettoyer le code de migration

**TRM-03 — infoCours singleton global non réinitialisé**
- **Fichier** : `trimestre-v2.js:1300, 1523`
- `infoCours` est un singleton global qui persiste lors du changement de trimestre
- Suppression de cours ne nettoie pas toujours `infoCours` → pointe vers un cours fantôme
- **Recommandation** : Ajouter `db.setSync('infoCours', null)` lors de suppression + changement trimestre

### 🟡 MODÉRÉ

**TRM-04** — `seancesHoraire_${coursId}` non namespacé par trimestre (collision si même coursId)
**TRM-05** — Frontière `CLES_GLOBALES` vs `CLES_NAMESPACEES` mal documentée
**TRM-06** — Cas "aucun trimestre actif" : `cle()` retourne la clé brute → données mélangées
**TRM-07** — Code de migration `cours.js:49-117` exécuté à chaque chargement (à nettoyer si complété)

### 🟢 Points positifs

- Pattern bibliothèque+assemblage respecté
- Fallbacks legacy bien documentés (commentaires)
- Gestion multi-cours fonctionnelle

---

## Étape 5 — Module Planification

> 4 fichiers audités : planification-carte.js (2 284L), planification.js (71L), planification-donnees.js (209L), organisateur.js (1 238L)

### 🔴 CRITIQUE

**PLN-01 — Code legacy organisateur appelle fonctions inexistantes**
- **Fichier** : `planification-carte.js:4553-4581`
- Variables legacy `orgSelectSequence`, `orgSelectLecon`, etc. initialisées
- Fonctions `peuplerSelecteurLecons`, `afficherLeconOrganisateur` référencées mais définies dans organisateur.js, pas ici
- **Recommandation** : Nettoyer le code legacy du prototype

**PLN-02 — Index des clones fragmenté**
- **Fichier** : `planification-carte.js:43, 1316-1393`
- `_cloneIndex` = Map manuelle gérée en parallèle de `etat.noeuds` → risque de désynchronisation
- `_reconstruireCloneIndex()` coûteux, appelé 2×/chargement
- **Recommandation** : Intégrer dans la structure de données existante

**PLN-03 — Drag multi-sélection sans throttle**
- **Fichier** : `planification-carte.js:2631-2649`
- `onMoveGroupe(e2)` recalcule positions pour CHAQUE nœud de multiSelection à chaque `mousemove` (60fps)
- Si 50 nœuds sélectionnés → 50 × `mettreAJourLiens()` par frame = N² recalculs
- **Recommandation** : Throttle via `requestAnimationFrame`

**PLN-04 — 7 méthodes non publiques appelées par organisateur.js**
- **Fichier** : `organisateur.js:361, 547, 554, 555, 602, 613, 1049`
- `getLiensDeNoeud()`, `obtenirLabelNoeud()`, `obtenirCouleurNoeud()`, `trouverIdeesMaitressesAncetres()`, `chargerProductions()`, `afficherDetailsProduction()`, `genererSeancesHTML()`
- Doivent exister sur `window.planificationCarte`
- **Recommandation** : Vérifier et documenter l'API publique du moteur carte

### 🟡 MODÉRÉ

**PLN-05** — 4 tables de verbes disjointes (`VERBES_AUTO`, `VERBES_HORIZONTAUX`, `MIGRATION_VERBES`, `VERBES_COMPAT`) — maintenance complexe
**PLN-06** — Remap ID fragile (`noeud_1` → `planif-noeud_1`) : copier-coller triple
**PLN-07** — Récursion sans limite de profondeur (anti-cycle `visited` existe mais pas de `depth` check)
**PLN-08** — `offsetWidth/offsetHeight` non fiables quand module caché (`display:none`)
**PLN-09** — Listeners `wheel`/`gesture`/`touch` jamais supprimés (mitigé par flag `etat.initialise`)
**PLN-10** — `mettreAJourLiens()` itère TOUS les liens même pour un seul nœud modifié
**PLN-11** — Undo/Redo clone le state complet (pas de diffing) — 50 snapshots × N nœuds en mémoire
**PLN-12** — `basculerEE()` suppose `productionsSection` existe dans le DOM (insertBefore risque exception)
**PLN-13** — Accès direct `carte.etat.noeuds` depuis organisateur.js (couplage fort)

### 🟢 Points positifs

- planification-donnees.js : couche données exemplaire (try/catch, null-safe, migration propre)
- planification.js : orchestrateur léger et bien structuré
- Gardes anti-cycle (#125) fonctionnels
- État avec Map/Set bien utilisés

---

## Étape 6 — Modules Suivi des apprentissages

> 7 fichiers audités : profil-etudiant.js (8 866L), graphiques-progression.js (4 619L), tableau-bord-apercu.js (3 210L), saisie-presences.js (2 450L), portfolio.js (1 183L), presences-apercu.js (385L), evaluations-apercu.js (155L) — Total : ~20 868 lignes

### 🔴 CRITIQUE

**SUI-01 — Duplication des calculs de Performance (P)**
- **Fichiers** : `profil-etudiant.js:2564-2604` vs `portfolio.js` (logique implicite)
- profil-etudiant.js réimplémente manuellement `calculerPerformancePAN()` (sélections portfolio + tri + moyenne)
- portfolio.js utilise l'abstraction `pratique.calculerPerformance(da)`
- Divergence : portfolio.js gère multi-objectifs, profil-etudiant.js non
- **Recommandation** : Centraliser dans un futur `indices.js`

**SUI-02 — Division par zéro potentielle**
- **Fichier** : `profil-etudiant.js:2602`
- `reduce((sum, note) => sum + note, 0) / meilleuresNotes.length` — si toutes les évaluations n'ont pas `noteFinale`, `meilleuresNotes` peut être vide
- **Recommandation** : Ajouter `if (meilleuresNotes.length === 0) return 0;` avant ligne 2601

**SUI-03 — Modification présences ne met pas à jour indices C-P-E**
- **Fichier** : `saisie-presences.js:72`
- Après sauvegarde de l'indice A (Assiduité), `calculerEtStockerIndicesCP()` n'est PAS appelé
- L'indice E (Engagement) = (A×C×P)^(1/3) reflète une ancienne valeur de A
- **Recommandation** : Ajouter `if (typeof calculerEtStockerIndicesCP === 'function') calculerEtStockerIndicesCP();` après ligne 72

### 🟡 MODÉRÉ

**SUI-04** — Incohérence entre `calculerTousLesIndices()` (profil-etudiant.js:396) et `calculerIndicesEtudiant()` (tableau-bord-apercu.js:1086) — fallbacks divergents
**SUI-05** — `themeChanged` listener non nettoyé (graphiques-progression.js:4602)
**SUI-06** — Lectures `db.getSync()` répétées en boucle dans tableau-bord-apercu.js (~150× pour 150 étudiants)
**SUI-07** — Clé `etudiantsSuivis` non namespacée via `cle()` (tableau-bord-apercu.js:39)
**SUI-08** — Pas de lazy-loading dans profil-etudiant.js (DOM 5K+ éléments pour un profil complexe)

### 🟢 Points positifs

- Clés de stockage métier (`indicesCP`, `indicesAssiduite`, `portfoliosEleves`, `presences`) namespacées via `cle()`
- `chart.destroy()` bien implémenté dans graphiques-progression.js
- 70+ patterns défensifs (null checks) — fréquence acceptable
- Changement de groupe gère le nettoyage des DA obsolètes

### Faisabilité d'un module `indices.js` centralisé

**Recommandation : OUI, fortement recommandé.** Le module devrait centraliser :

| Fonction | Source actuelle | Destination |
|----------|----------------|-------------|
| `calculerPerformancePAN(da)` | profil-etudiant.js:2564 | indices.js |
| `calculerTousLesIndices(da, pratique)` | profil-etudiant.js:396 | indices.js |
| `calculerIndicesEtudiant(da)` | tableau-bord-apercu.js:1086 | indices.js |
| `calculerEtSauvegarderIndicesAssiduite()` | saisie-presences.js:36 | indices.js |
| `calculerEtStockerIndicesCP()` | portfolio.js:596 | indices.js |
| `obtenirIndicesCP(da, pratique)` | portfolio.js | indices.js (reader) |
| `calculerCorrelationPearson()` | tableau-bord + etudiants | indices.js (dédupliqué) |

---

## Étape 7 — Survol des autres modules

> 9 fichiers examinés : accueil.js, aide-contextuelle.js, guidage.js, etudiants.js, groupe.js, donnees-v2.js, import-export.js, preferences-v2.js, modelisation.js + db.js, main.js

### 🔴 CRITIQUE

**AUT-01 — Variable non nettoyée après import**
- **Fichier** : `import-export.js:604-641`
- `configCompleteEnAttente` (variable globale) jamais nettoyée après import → fuite de données si importations multiples dans la même session
- **Recommandation** : Ajouter `configCompleteEnAttente = null;` après traitement

**AUT-02 — Handlers inline fragiles**
- **Fichier** : `guidage.js:201`
- `onmouseover`/`onmouseout` avec `this.style.*` inline — fragile, pas de fallback
- **Recommandation** : Utiliser addEventListener + classes CSS

### 🟡 MODÉRÉ

**AUT-03** — `aide-contextuelle.js` : addEventListener sur document jamais supprimé → accumulation si module rechargé
**AUT-04** — `modelisation.js` : sessionStorage non protégé par try/catch (échec silencieux en navigation privée)
**AUT-05** — `etudiants.js` : cache global `donneesTableauCache` sans limite de taille
**AUT-06** — `import-export.js` : `alert()` bloquants pour erreurs (mauvaise UX)
**AUT-07** — `main.js` : `creerUneBulle()` accumule des nœuds DOM sans cleanup (si appelée 1000×)
**AUT-08** — `groupe.js` : CSV parser sans escapeHtml avant affichage (XSS faible risque en contexte contrôlé)
**AUT-09** — `donnees-v2.js` : Fonctions supposées exister (`afficherTableauPratiquesV2()`, etc.) sans guard

### 🟢 Points positifs

- `db.js` : Architecture hybride robuste, gestion `QuotaExceededError`, fallbacks intelligents
- `donnees-v2.js` : 52 try/catch — très défensif
- Tous les modules : IIFE + `'use strict'` correctement appliqués (91/93 fichiers)
- `import-export.js` : Assainissement HTML anti-XSS

---

## Étape 8 — Analyse CSS

> styles.css (21 146 lignes) + CSS inline dans index.html (18 358 lignes)

### Statistiques

| Métrique | Valeur |
|----------|--------|
| Styles inline dans index.html | **1 119** |
| `!important` dans styles.css | **93** (75% justifiés) |
| Sélecteurs multi-niveaux (3+) | **756** |
| Sélecteurs utilisant des IDs | **18** |
| Variables CSS orphelines | **4** |
| Duplication CSS estimée | **~450 lignes** |
| Classes orphelines | **~12** (impact nul) |

### 🔴 CRITIQUE

**CSS-01 — 1 119 styles inline dans index.html**
- Patterns les plus répétés : `display: flex` (200+), `gap: Xpx` (150+), `font-weight` (300+), `font-size: Xrem` (200+)
- 30-40% factorisables via les classes utilitaires existantes (`.u-flex`, `.u-texte-gras`, `.u-ml-*`, `.u-texte-petit`)
- **Recommandation** : Consolider 1 119 → ~300 en exploitant les utilitaires existants

### 🟡 MODÉRÉ

**CSS-02** — `.travaux-palette-eval` : 20+ `!important` sur 74 règles (spécificité cassée)
- **Recommandation** : Utiliser une classe d'override dédiée au lieu de cascade + !important

**CSS-03** — Duplication de patterns flex/hover (~450 lignes)
- `background: rgba(106, 172, 184, 0.1); color: var(--texte-principal)` répété 6+ fois
- `display: flex; align-items: center; gap: 8px;` répété 50+ fois
- **Recommandation** : Extraire en classes utilitaires (`.u-hover-light-accent`, `.layout-flex-row-gap-8`)

**CSS-04** — 18 sélecteurs utilisant des IDs
- `#section-planification .planif-wrapper`, `#planif-titre-carte`, etc.
- **Recommandation** : Remplacer par des classes pour réduire la spécificité

### 🟢 Points positifs

- 293 variables CSS définies, 95% utilisées — excellente couverture tokens
- Classes `.travaux-*`, `.annot-*`, `.planif-*` bien préfixées (pas de collision)
- Mode clair/sombre via variables CSS (changement propre)
- Seulement 4 variables orphelines (hygiène acceptable)

---

## Top 10 des problèmes les plus urgents

| # | ID | Problème | Module | Impact |
|---|-----|---------|--------|--------|
| 1 | EVL-01 | Mélange `db.getSync()` / `obtenirDonneesSelonMode()` | Évaluation | Perte de données, bug #71 |
| 2 | TRM-01 | 6 clés non namespacées par trimestre | Trimestre | Données mélangées entre trimestres |
| 3 | SUI-03 | Présences modifiées → indices C-P-E obsolètes | Suivi | Indices faux affichés |
| 4 | EVL-04 | Jetons bypassent le mode assisté/simulation | Évaluation | Jetons affectent les vraies données |
| 5 | SUI-01 | Duplication calcul Performance (P) | Suivi | Deux versions divergentes possibles |
| 6 | ARC-01 | IndexedDB parallèle (MonitorageFichiers) | Architecture | Isolement des fichiers hors db.js |
| 7 | TRV-03 | Blobs stockés sans limite de taille | Travaux | Crash si quota dépassé |
| 8 | TRM-03 | infoCours singleton jamais réinitialisé | Trimestre | Pointe vers cours fantôme |
| 9 | SUI-02 | Division par zéro dans calculerPerformancePAN | Suivi | NaN affiché |
| 10 | PLN-03 | Drag multi-sélection sans throttle | Planification | UI janky |

---

## Recommandations stratégiques

### Phase 1 — Intégrité des données (priorité absolue)

1. **Harmoniser les appels évaluation** : Choisir `obtenirDonneesSelonMode()` comme source unique et remplacer les 16 appels `db.getSync()` directs dans evaluation.js
2. **Corriger le namespacing trimestre** : Décider pour chaque clé (global vs trimestre) et ajouter à `CLES_NAMESPACEES` ou documenter dans `CLES_GLOBALES`
3. **Chaîner le recalcul d'indices** : Après modification présences → recalculer C-P-E automatiquement
4. **Fixer les jetons** : `evaluation-jetons.js` doit utiliser `sauvegarderDonneesSelonMode()` au lieu de `db.setSync()`

### Phase 2 — Robustesse (court terme)

5. **Créer `indices.js` centralisé** : Regrouper les 7 fonctions de calcul dupliquées
6. **Fixer la division par zéro** : `profil-etudiant.js:2601`
7. **Ajouter validation taille blobs** : `travaux-stockage.js`
8. **Nettoyer infoCours** : Réinitialiser lors de changement de trimestre et suppression de cours
9. **Supprimer console.log debug** : evaluation.js (~20 logs dans calculerNote)

### Phase 3 — Performance et hygiène (moyen terme)

10. **Throttle drag planification** : requestAnimationFrame sur mousemove
11. **Consolider styles inline** : 1 119 → ~300 via utilitaires existants
12. **Nettoyer code legacy** : Prototype planification, migrations trimestre, fonctions mortes
13. **Optimiser lectures db** : Lire une fois en début de boucle au lieu de 150× par étudiant

---

**Fin de l'audit — 28 février 2026**
*134 constats : 24 critiques, 63 modérés, 47 mineurs*
