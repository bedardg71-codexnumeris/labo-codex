---
name: debug-labo-codex
description: >
  Résolution structurée de bugs dans Labo Codex. Utiliser ce skill dès que
  Grégoire signale un bug, un comportement inattendu, un décalage de données,
  une régression, ou dit «ça marche pas», «c'est cassé», «y'a un problème».
  Prérequis : lire aussi le skill `labo-codex` pour le contexte architectural.
---

# SKILL : Debug — Labo Codex

> Basé sur l'analyse de 84+ bugs corrigés (Beta 96.2 → 98.3) et 60+ signalements bruts.

## 0. AVANT DE COMMENCER

Lire le skill `labo-codex` si ce n'est pas déjà fait. Tu dois connaître :
- La hiérarchie TRIMESTRE → COURS → GROUPE → ÉTUDIANTS
- Le namespacing par trimestre via `window.cle('nomCle')`
- La communication indirecte entre modules (localStorage / IndexedDB, jamais d'appels directs)
- Le module centralisé `indices.js` (ne jamais recalculer A-C-P-E ailleurs)
- Le rôle de `db.js` comme orchestrateur de stockage

---

## 1. REPRODUIRE

**Objectif** : Confirmer que tu comprends le bug avant d'y toucher.

### Lire le rapport de bug

Les signalements arrivent sous deux formes :
- **Rapport auto-généré** (fichier `BUG_*.txt`) : contient section active, cours actif,
  nb étudiants/productions, état stockage, dernières actions (clickstream), erreurs console,
  et une description en langage naturel. Ces rapports sont riches en contexte technique
  mais ne contiennent jamais de steps de reproduction formels ni de «attendu vs observé».
- **Description orale / chat** : Grégoire décrit le symptôme directement.

### Extraire les informations clés

À partir du rapport ou de la description, reconstituer :

| Information | Source dans le rapport | Si absente |
|-------------|----------------------|------------|
| **Section/module actif** | `--- APPLICATION ---` | Demander |
| **Trimestre** | État stockage ou contexte | Demander si multi-trimestre possible |
| **Cours + Groupe** | `Cours actif:` | Demander — le filtrage par groupe est une source majeure de bugs |
| **Étudiant / Production** | Description ou clickstream | Demander si le bug concerne une donnée spécifique |
| **Mode** (annoter / évaluer / consulter) | Clickstream ou description | Demander — les transitions de mode sont fragiles |
| **Erreurs console** | `--- ERREURS CONSOLE ---` | Vérifier soi-même dans le code |

### Reformuler

Produire un énoncé du type : «Quand [contexte], faire [action] produit [résultat observé] au lieu de [résultat attendu].»

Si le rapport ne contient pas le résultat attendu (c'est le cas dans ~100% des rapports auto-générés), le déduire du contexte ou demander confirmation.

⏸ **Attends la validation de Grégoire avant de passer à l'étape 2.**

---

## 2. LOCALISER

**Objectif** : Trouver la cause racine dans le code.

### Checklist par ordre de probabilité

L'ordre ci-dessous reflète la fréquence réelle des bugs dans l'historique du projet.

#### 2.1 Filtrage / périmètre de données incorrect (≈30% des bugs)

C'est la première cause de bugs dans Labo Codex. Vérifier :

- **`obtenirDonneesSelonMode()`** — Cette fonction filtre par cours/groupe actif. Si elle
  est appelée avant une sauvegarde, elle ne retourne qu'un sous-ensemble des données et
  la sauvegarde **écrase les données des autres cours/groupes**. C'est la cause des bugs
  #71, #75, #81, #84. Le fix standard : remplacer par `db.getSync(cle(...))` pour lire
  TOUTES les données avant écriture.
- **Filtrage par groupe manquant ou excessif** — Compteurs qui affichent le mauvais total,
  export qui prend les fichiers de tous les groupes, dropdown qui exclut un groupe masqué.
  Vérifier quel appel retourne les données et s'il filtre correctement.

#### 2.2 Métadonnées manquantes / `productionId` vide (≈20% des bugs)

Pattern récurrent : un fichier importé n'a pas de `productionId` (ou `etudiantDA`,
`groupeCoursId`), ce qui casse le matching avec les évaluations.

- Vérifier la **propagation des métadonnées** : quand une évaluation est sauvegardée,
  est-ce que `productionId`, `etudiantDA`, `groupeCoursId` sont bien écrits aussi dans
  l'objet fichier ?
- Vérifier le **matching** : est-il strict (`===`) ou souple ? Un matching strict échoue
  quand `productionId` est `''` ou `undefined`. Le pattern de fix : matching souple +
  rétro-propagation des métadonnées depuis les évaluations vers les fichiers orphelins.

#### 2.3 Namespace / `cle()` manquant (≈15% des bugs)

- Une clé localStorage est lue/écrite **sans** `window.cle()` → elle pointe vers les
  données globales au lieu du trimestre actif.
- Un module récemment modifié utilise la clé en dur (`'horaires'`) au lieu de
  `cle('horaires')`.
- Vérifier TOUTES les occurrences de la clé dans le fichier, pas seulement celle du bug.

#### 2.4 Fonctions non exportées vers `window` (≈10% des bugs)

Les modules communiquent via `window.nomFonction`. Si une fonction est définie localement
mais jamais assignée à `window`, les autres modules qui l'appellent obtiennent un
`ReferenceError`. C'est la cause des bugs #64, #68.

Vérifier : la fonction est-elle exportée dans le bloc d'initialisation du module ?

#### 2.5 État résiduel après navigation (≈10% des bugs)

Quand l'utilisateur navigue (ex: Tableau de bord → Travaux → retour), des variables
d'état ne sont pas réinitialisées :
- `modeCourant` reste à `'evaluer'` alors que les palettes DOM ont été détruites (bug #73)
- Statuts de fichiers perdus après aller-retour (bug #69)

Vérifier : `initialiserModule*()` remet-il tous les états à leur valeur par défaut ?

#### 2.6 Concurrence asynchrone (≈10% des bugs)

Plusieurs chaînes d'exécution écrivent au même endroit sans coordination :
- `setTimeout` / `requestAnimationFrame` qui créent des séquences fragiles
- Callbacks qui s'exécutent en parallèle (cf. bug PDF ↔ Évaluation : 3 chaînes)
- `preRemplirEvaluation()` et `modifierEvaluationParId()` qui se chevauchent

#### 2.7 Fallback silencieux (≈5% des bugs)

Des mécanismes de repli masquent l'erreur :
- `trouverFichierPourEvaluation()` qui fallback par date si pas de `fichierId` direct
- Auto-sélection du premier élément visible quand la validation échoue silencieusement

### Ce qu'il faut montrer

- Les **fichiers et numéros de lignes** concernés.
- Le **chemin d'exécution** complet, étape par étape.
- Les **points de conflit** identifiés (s'il y en a).
- La **catégorie probable** (2.1 à 2.7) — ça aide Grégoire à valider vite.

⏸ **Attends la validation de Grégoire avant de passer à l'étape 3.**

---

## 3. DIAGNOSTIQUER

**Objectif** : Expliquer *pourquoi* le code produit ce comportement.

### Taxonomie des bugs Labo Codex (symptôme → fix → modules)

Tableau de référence unique : la catégorie localisée au §2 donne directement
le pattern de fix éprouvé et les modules à surveiller.

| # | Catégorie | Symptôme | Fréq. | Pattern de fix éprouvé | Modules les plus touchés |
|---|-----------|----------|-------|------------------------|--------------------------|
| 2.1 | **Filtrage / périmètre** | `obtenirDonneesSelonMode` retourne un sous-ensemble → écrasement à la sauvegarde, compteur erroné, mauvais groupe | ≈30% | Remplacer `obtenirDonneesSelonMode()` par `db.getSync(cle(...))` pour lire toutes les données avant écriture | evaluation.js, liste-evaluations.js, travaux-ui.js, trimestre-v2.js |
| 2.2 | **Métadonnées manquantes** | `productionId` / `etudiantDA` / `groupeCoursId` vide → matching cassé fichiers ↔ évaluations | ≈20% | Matching souple (accepter `productionId` vide) + rétro-propagation des métadonnées depuis les évaluations | travaux-ui.js, evaluation.js, export-pdf.js |
| 2.3 | **Namespace / clé** | Oubli de `window.cle()`, clé en dur, mélange namespacé/non | ≈15% | Remplacer la clé en dur par `cle('...')` + auditer toutes les occurrences du fichier | Tout module lisant localStorage |
| 2.4 | **Export `window` manquant** | Fonction non exposée → `ReferenceError` dans un autre module | ≈10% | Ajouter `window.nomFonction = nomFonction` dans le bloc d'init | trimestre-v2.js, evaluation.js, groupe.js |
| 2.5 | **État résiduel** | Variable d'état non réinitialisée après navigation | ≈10% | Reset dans `initialiserModule*()` ou le handler de navigation sortante | travaux-ui.js, navigation.js |
| 2.6 | **Concurrence asynchrone** | Chaînes parallèles qui se marchent dessus | ≈10% | Séquencer (callback unique, suppression des `setTimeout` redondants) | travaux-ui.js, profil-etudiant.js |
| 2.7 | **Fallback silencieux** | Mécanisme de repli qui masque le vrai problème | ≈5% | Corriger la source plutôt que le repli ; si le fallback reste, `console.warn` | travaux-ui.js |

### Expliquer

- La **cause racine** (pas le symptôme).
- **Pourquoi** le code original a été écrit comme ça (intention probable).
- **Pourquoi** ça casse dans le cas signalé (quelle condition n'avait pas été prévue).

### Détecter les bugs en grappe

L'historique montre que les bugs arrivent souvent par grappes : un même pattern
architectural produit plusieurs symptômes différents. Par exemple, le 24 février,
16 bugs ont été corrigés et la majorité partageaient la cause 2.1 (`obtenirDonneesSelonMode`
avant sauvegarde) ou 2.2 (`productionId` vide).

Si le bug en cours ressemble à un pattern déjà vu → vérifier si d'autres endroits
du code ont le même problème. Signaler les occurrences similaires comme bugs potentiels
(sans les corriger dans le même commit).

⏸ **Attends la validation de Grégoire avant de passer à l'étape 4.**

---

## 4. PROPOSER UNE SOLUTION

**Objectif** : Corriger la cause racine de façon durable.

### Contraintes obligatoires

- **Pas de valeurs en dur** — Aucun hardcode de DA, de nom de production, d'index de tableau.
- **Pas de contournement** — La solution doit corriger la cause, pas masquer le symptôme.
- **Respect de l'architecture** — Communication indirecte entre modules, SSOT, namespacing.
  Si la solution nécessite de violer un principe, le signaler explicitement.
- **Périmètre minimal** — Corriger le bug, rien de plus. Pas de refactoring opportuniste.
- **Rétrocompatibilité** — Les données existantes en IndexedDB et localStorage doivent
  continuer à fonctionner. Attention particulière aux fichiers importés avant le fix
  (métadonnées possiblement incomplètes).

### Patterns de correction éprouvés

Le pattern de fix éprouvé pour chaque catégorie 2.x est dans la colonne
« Pattern de fix éprouvé » du tableau de taxonomie (§3). S'y reporter
plutôt que de réinventer la correction.

### Format de la proposition

1. **Résumé** : Ce que la solution fait, en une phrase.
2. **Catégorie** : Référence à la taxonomie (ex: «2.1 — filtrage avant sauvegarde»).
3. **Modifications** : Pour chaque fichier touché, décrire le changement et justifier
   sa nécessité.
4. **Occurrences similaires** : Si le même pattern existe ailleurs dans le code, le lister
   ici (fix séparé).
5. **Ce que la solution ne fait pas** : Si un problème architectural plus large est identifié,
   le signaler comme chantier séparé.

⏸ **Attends la validation de Grégoire avant d'implémenter.**

---

## 5. IMPLÉMENTER ET VÉRIFIER

**Objectif** : Appliquer le fix et confirmer qu'il ne casse rien.

### Implémenter

- Appliquer les modifications validées à l'étape 4.
- Commenter le code si la correction n'est pas évidente à la lecture.

### Vérifier

- **Cas nominal** : Le bug original est corrigé dans les conditions de reproduction
  de l'étape 1.
- **Cas limites à tester** (selon le type de bug) :
  - Trimestre différent / groupe démo (9999)
  - Étudiant sans artefact / avec tous les artefacts
  - Fichier importé avant le fix (métadonnées incomplètes)
  - Changement rapide de contexte (navigation pendant un chargement)
  - Données absentes en IndexedDB (premier usage)
  - Multi-cours : vérifier que les données des AUTRES cours ne sont pas écrasées
  - Multi-groupe : vérifier compteurs et exports avec le bon périmètre
- **Régression** : Les fonctionnalités adjacentes au code modifié fonctionnent toujours.

### Livrable final

Un résumé lisible :
- **Bug** : [description]
- **Catégorie** : [2.x — nom]
- **Cause** : [explication]
- **Fix** : [ce qui a été changé]
- **Fichiers modifiés** : [liste]
- **Occurrences similaires** : [s'il y en a]
- **À surveiller** : [effets de bord potentiels]

---

## 6. TRACER DANS SUIVI-BUGS.md

**Objectif** : Consigner la résolution pour maintenir l'historique du projet.

Cette étape est **obligatoire** après chaque fix validé. Le fichier
`Retours des testeurs/SUIVI-BUGS.md` (cf. CLAUDE.md §« Priorité absolue :
Retours testeurs ») est la source de vérité unique pour le suivi des bugs.
Le consulter AVANT de corriger un bug (évite le travail en double).

### Procédure

1. **Lire `SUIVI-BUGS.md`** pour déterminer :
   - Le **prochain numéro séquentiel** : lire le dernier # dans les tableaux
     « Corrigés » (et « Ouverts ») et incrémenter.
   - La **section «Corrigés» la plus récente** (en haut, juste après «Ouverts»).
     Si le contexte actuel n'y figure pas encore, créer une nouvelle section
     `## Corrigés (date — résumé court)` au-dessus des précédentes.

2. **Ajouter une ligne** dans la section Corrigés appropriée (colonnes :
   #, Testeur, Date rapport, Corrigé, Build, Description, Correction) :

```
| [#] | [Testeur] | [date rapport] | [date correction] | [build MMJJ-HHMM] | [description courte] | [catégorie 2.x] : [explication technique concise du fix] |
```

   Règles de rédaction :
   - **Description** : reprendre l'énoncé de l'étape 1, condensé (~15 mots max).
   - **Correction** : commencer par la catégorie (`2.1 filtrage`, `2.3 namespace`…),
     puis résumer le fix technique en une phrase. Mentionner le(s) fichier(s) modifié(s).
   - Si le bug venait de la section «Ouverts», **retirer la ligne** de cette section.

3. **Mettre à jour le compteur** «prochain : #XX» dans la section Notes.

4. **Proposer l'insertion à Grégoire** — Montrer la ligne générée et demander :
   «Je l'ajoute dans SUIVI-BUGS.md ?». Ne pas écrire dans le fichier sans
   validation explicite.

### Exemple concret

Ligne ajoutée en tête de la section « Corrigés » la plus récente
(ou nouvelle section `## Corrigés (date — résumé)` si le contexte a changé) :

```markdown
| # | Testeur | Date rapport | Corrigé | Build | Description | Correction |
|---|---------|--------------|---------|-------|-------------|------------|
| 144 | Grégoire | 11 juin | 11 juin | 0611-1030 | Déverrouiller une évaluation déverrouille TOUTES | 2.1 filtrage : `basculerVerrouillageEvaluationCourante()` lisait via `obtenirDonneesSelonMode` → `db.getSync(cle(...))` + rafraîchissement badges |
```

---

## ZONES CHAUDES — MODULES À SURVEILLER EN PRIORITÉ

Ces modules concentrent la majorité des bugs historiques :

| Module | % des bugs | Causes dominantes |
|--------|-----------|-------------------|
| `evaluation.js` / `liste-evaluations.js` | ≈25% | 2.1 (filtrage avant sauvegarde), 2.2 (productionId vide) |
| `travaux-ui.js` | ≈20% | 2.5 (état résiduel modeCourant), 2.6 (concurrence), 2.2 (matching) |
| `trimestre-v2.js` | ≈15% | 2.1 (filtrage groupe), 2.4 (exports window) |
| `travaux-export-pdf.js` / `export-pdf.js` | ≈10% | 2.2 (productionId non propagé) |
| `saisie-presences.js` | ≈5% | 2.3 (namespace horaires), 2.4 (exports) |

---

## ANTI-PATTERNS À ÉVITER

Les pièges propres à chaque catégorie (setTimeout masquant un timing 2.6,
`obtenirDonneesSelonMode` avant sauvegarde 2.1, matching strict sur
`productionId` 2.2, clé sans `window.cle()` 2.3…) sont déjà dans le tableau
§3. Au-delà, les pièges de **démarche** :

- ❌ Sauter directement à une solution sans avoir localisé la cause racine.
- ❌ Corriger un symptôme dans un module quand la cause est dans un autre.
- ❌ Dupliquer un calcul d'indice hors de `indices.js`, ou faire communiquer
  deux modules directement (import/appel croisé) — violations d'architecture.
- ❌ Faire du refactoring «tant qu'on y est» dans le même commit que le fix.
- ❌ Oublier la rétrocompatibilité avec les fichiers/données importés avant le fix.