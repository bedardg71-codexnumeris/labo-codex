# Plan — Suivi de l'apprentissage (dépistage universel SOLO)

**Date** : 7 avril 2026
**Objectif** : Remplacer le diagnostic statique de « blocage » (score moyen) par un
portrait dynamique par artefact, ancré dans la taxonomie SOLO et adaptable à
toute discipline.

**Titre dans l'application** : « Suivi de l'apprentissage »

---

## Fondement théorique

La taxonomie SOLO établit une hiérarchie cognitive : les critères de niveau
**multistructurel** (fondations) sont prérequis aux critères de niveau **relationnel**
(mise en relation) et **abstrait étendu** (transfert/nuance).

**Observation empirique (601-101-MQ, données A2024-H2026)** : un élève qui ne
progresse pas sur les critères multistructurels (S, R, F) a peu de chances
d'atteindre la maîtrise sur les critères relationnels (P) ou abstraits (N).

**Principe universel** : ce pattern devrait se retrouver dans toute discipline dont
les critères sont alignés sur SOLO. Un prof de chimie avec « Manipulation »
(multistructurel) et « Interprétation » (relationnel) devrait observer le même
phénomène.

**Le dépistage est donc piloté par SOLO, pas par SRPNF.** L'application surveille
les critères étiquetés « multistructurel » par l'enseignant et signale quand la
progression stagne sur ces fondations.

---

## Décisions prises (Grégoire, 7 avril 2026)

1. **Grille de dépistage** : utiliser la grille configurée. Le Français est inclus quand
   il est évalué dans l'artefact, ignoré sinon (pondération adaptative).
2. **Seuil IPB** : utiliser le seuil de défi configurable (70% par défaut). Grégoire
   mettra probablement 75% pour sa pratique.
3. **Vocabulaire** : « Suivi de l'apprentissage » comme titre de section.
4. **Niveau SOLO par critère** : chaque critère de la grille reçoit un tag SOLO
   (multistructurel / relationnel / abstrait étendu). Le dépistage IPB porte sur
   les critères multistructurels uniquement.

---

## Ce qui existe déjà

- Graphique SRPNF par artefact (profil étudiant > Développement des habiletés)
- Barres Forces/Défis avec directions → ←
- Fenêtre d'analyse configurable (actuellement 4 productions)
- Seuils de sensibilité configurables (progression 5pts, risque 5pts, défi 70%)
- `calculerProgressionBlocage(da)` : score par position d'artefact (ajouté 7 avril)
- `calculerMoyennesCriteresRecents(da)` : moyennes fenêtre glissante (bug casse corrigé)
- `calculerDirectionsCriteres(da)` : directions par critère
- Configuration des grilles de critères avec pondérations

## Ce qu'il manque

1. **Tag `niveauSOLO`** sur chaque critère de la grille
2. **Calcul IPB** : artefacts consécutifs sous le seuil sur les critères multistructurels
3. **Diagnostic croisé** IPB × direction → vocabulaire descriptif
4. **Affichage** dans le profil étudiant (section « Suivi de l'apprentissage »)
5. **Documentation** utilisateur dans la section Aide
6. **Réglages** mis à jour pour le tag SOLO

---

## Phase 0 — Configuration des grilles (index.html, pratiques-materiel.js)

### 0a. Ajouter le tag `niveauSOLO` aux critères

Dans l'interface de configuration d'une grille de critères, ajouter un sélecteur
par critère :

| Option | Description | Icône suggerée |
|--------|-------------|----------------|
| Multistructurel | Fondation — habiletés de base | ■ |
| Relationnel | Transition — mise en relation | ◆ |
| Abstrait étendu | Complexité — transfert et nuance | ★ |

- Sélecteur discret (3 options) à côté du nom du critère dans l'éditeur de grille
- Valeur par défaut : « Multistructurel » (sécuritaire — tout est dépisté par défaut)
- Stocké dans `grillesTemplates[].criteres[].niveauSOLO`
- Migration : les grilles existantes sans tag reçoivent « multistructurel » par défaut

### 0b. Infobulle explicative

Texte court au survol du sélecteur :
> « Le niveau cognitif détermine le rôle du critère dans le dépistage.
> Les critères multistructurels sont les fondations — l'application surveille
> leur progression pour détecter les difficultés avant qu'elles n'affectent
> les critères de niveau supérieur. »

---

## Phase 1 — Calcul (profil-etudiant.js)

### 1a. Fonction `calculerIPB(da)`

- Lire la grille de dépistage configurée
- **Filtrer les critères `niveauSOLO === 'multistructurel'`** (ou tous si aucun tag)
- Lire les évaluations triées chronologiquement (plus récent d'abord)
- Pour chaque artefact :
  - Extraire les scores des critères multistructurels évalués dans cet artefact
  - Calculer la moyenne pondérée (pondérations de la grille, adaptatives si critère absent)
  - Comparer au **seuil de défi configurable** (pas hardcodé)
- Compter les artefacts consécutifs (depuis le plus récent) sous le seuil
- Utiliser le seuil de progression configurable pour déterminer la direction
- Retourner : `{ ipb, scoreActuel, scorePrecedent, direction, criteresMulti: [] }`

### 1b. Fonction `diagnostiquerSuiviApprentissage(da)`

- Appeler `calculerIPB(da)`
- Croiser IPB × direction :

| IPB | Direction | Diagnostic | Niveau RàI |
|-----|-----------|------------|------------|
| 0   | —         | Maîtrise acquise | 1 |
| 1   | ↗         | Difficulté résolue | 1 |
| 1   | → ou ↘    | Difficulté émergente | 1 |
| 2   | ↗         | Progression | 2 |
| 2   | →         | Plateau | 2 |
| 2   | ↘         | Difficulté constante | 2 |
| ≥ 3 | → ou ↘    | Difficulté persistante | 3 |

- Retourner : `{ diagnostic, ipb, direction, scoreActuel, niveauRaI, criteresEnDefi: [], criteresMulti: [] }`

### 1c. Adapter `calculerProgressionBlocage(da)`

- Renommer en `calculerProgressionSuivi(da)` (ou garder le nom technique, API interne)
- Filtrer sur les critères `niveauSOLO === 'multistructurel'` de la grille de dépistage
- Pondérations adaptatives si un critère n'est pas évalué dans un artefact donné
- Fenêtre : `obtenirNombreProductionsPourPatterns()` (4 actuellement)

---

## Phase 2 — Affichage profil (profil-etudiant.js, section Développement)

### 2a. Encadré « Suivi de l'apprentissage »

- **Position** : sous le graphique SRPNF existant, AVANT les barres Forces/Défis
- **Contenu** :
  - Titre : **Suivi de l'apprentissage**
  - **Diagnostic** en texte :
    « Plateau — Structure et Rigueur en zone de développement depuis 2 artefacts »
    ou « Maîtrise acquise — tous les critères multistructurels au-dessus du seuil »
  - **IPB visuel** : pastilles (●●○○ pour IPB=2 sur fenêtre de 4)
  - **Critères multistructurels** : liste avec score, direction, et statut par rapport au seuil
  - **Note pédagogique** (si IPB=2, →) : « Un plateau peut indiquer une consolidation
    ou une stagnation — le jugement professionnel est essentiel. »
- **Style** : bordure gauche colorée selon diagnostic
  - Vert : maîtrise acquise / difficulté résolue
  - Bleu : progression
  - Orange : plateau / difficulté émergente
  - Rouge : difficulté constante / persistante
- Respecter le design system (variables CSS, modes sombre/clair)

### 2b. Enrichir les barres Forces/Défis

- Indiquer visuellement quels critères sont multistructurels (icône ■ ou libellé discret)
- La direction (→ ←) est déjà affichée — garder tel quel

---

## Phase 3 — Tableau de bord (tableau-bord-apercu.js)

### 3a. Remplacer l'ancien blocage

- Utiliser `diagnostiquerSuiviApprentissage(da)` dans `calculerEtudiantsPrioritaires()`
- Exposer `diagnostic`, `ipb`, `direction` dans `_tousEtudiantsEnrichis`
- Supprimer l'ancien `calculerIndiceBlocage` du flux du tableau de bord

### 3b. Adapter le filtre

- Renommer « Blocage » → « Suivi » ou « Apprentissage »
- Filtrer par IPB ≥ 2
- Trier par IPB décroissant, puis par direction (↘ avant → avant ↗)
- Badge : afficher le diagnostic (« Plateau », « Difficulté constante », etc.)

### 3c. Graphique de progression (futur)

- Données disponibles via `calculerProgressionSuivi(da)`
- Mini sparkline dans l'aperçu ou graphique dédié dans la section Labo
- À planifier séparément

---

## Phase 4 — Réglages (index.html, pratiques-materiel.js)

### 4a. Configuration du tag SOLO dans les grilles

- Dans l'éditeur de grille de critères, ajouter le sélecteur `niveauSOLO`
- Position : à côté de la pondération du critère
- 3 options : Multistructurel (défaut) / Relationnel / Abstrait étendu
- Sauvegarder dans `grillesTemplates[].criteres[].niveauSOLO`

### 4b. Mise à jour de la section « Configuration du dépistage »

- Ajouter une note explicative sous le sélecteur de grille :
  > « Le dépistage surveille les critères de niveau multistructurel (fondations).
  > Étiquetez vos critères dans la grille selon leur niveau cognitif SOLO. »
- Le lien vers la section Aide pour les détails

### 4c. Migration des grilles existantes

- Grilles sans tag `niveauSOLO` : tous les critères reçoivent « multistructurel »
- Aucun comportement cassé — le dépistage fonctionne comme avant (tous les critères surveillés)
- L'utilisateur peut ensuite affiner en étiquetant P et N comme « relationnel » / « abstrait étendu »

---

## Phase 5 — Documentation utilisateur (index.html, section Aide)

### 5a. Carte Aide : « Suivi de l'apprentissage et dépistage SOLO »

Contenu pédagogique à rédiger (dans un accordéon de la section Aide) :

**Qu'est-ce que le suivi de l'apprentissage ?**
- L'application observe la progression de chaque élève sur les critères fondamentaux
  (multistructurels) de votre grille d'évaluation.
- Un signal de dépistage apparaît quand la progression stagne sur ces fondations
  pendant plusieurs artefacts consécutifs.

**Comment ça fonctionne ?**
- Chaque critère de votre grille est associé à un niveau cognitif (taxonomie SOLO) :
  multistructurel (fondation), relationnel (mise en relation), abstrait étendu (transfert).
- L'application calcule un score pondéré sur vos critères multistructurels pour chaque
  artefact évalué.
- L'**indice de persistance (IPB)** compte combien d'artefacts consécutifs récents sont
  sous le seuil de maîtrise configurable.
- Le croisement IPB × direction de progression donne un diagnostic en langage clair :
  progression, plateau, difficulté émergente/constante/résolue/persistante.

**Pourquoi les critères multistructurels ?**
- La taxonomie SOLO montre que les habiletés de base (organiser, être rigoureux,
  s'exprimer correctement) sont prérequises aux habiletés de niveau supérieur
  (interpréter, nuancer, transférer).
- Un élève qui stagne sur les fondations aura du mal à progresser sur les critères
  plus complexes — c'est un signal d'intervention précoce.
- Cette logique est transférable à toute discipline : les fondations varient, le principe reste.

**Comment configurer ?**
- Réglages → Pratique de notation → Grille de critères : étiquetez chaque critère
  avec son niveau SOLO.
- Réglages → Dépistage → Seuil de défi : ajustez selon votre exigence.
- Réglages → Dépistage → Fenêtre d'analyse : nombre de productions récentes à observer.

**Comment interpréter les diagnostics ?**
- « Plateau » n'est pas un verdict négatif — un D stable peut être une consolidation.
- Le jugement professionnel est toujours essentiel.
- L'application révèle les conditions, l'enseignant décide de l'action.

### 5b. Mise à jour des cartes existantes

- Carte « RàI » : ajouter mention du lien entre IPB et niveaux RàI
- Carte « SOLO » : ajouter mention du rôle de SOLO dans le dépistage
- Carte « Critères » : ajouter mention du tag niveauSOLO dans la grille
- Supprimer toute référence à « indice de blocage » ou « blocage critique » dans l'aide

### 5c. Infobulle contextuelle

- Dans le profil étudiant, section « Suivi de l'apprentissage » :
  icône (?) avec texte court expliquant ce qu'on regarde et renvoyant vers Aide.

---

## Phase 6 — Nettoyage de l'ancien système

### 6a. Code à retirer ou adapter

- `calculerIndiceBlocage()` : retirer du flux principal (garder en archive si besoin)
- `interpreterIndiceBlocage()` : remplacer par `diagnostiquerSuiviApprentissage()`
- Seuils hardcodés (0.375, 0.50, 0.625) dans profil-etudiant.js : supprimer
- Filtre « Blocage » dans tableau-bord-apercu.js : renommer et adapter
- Badges CSS `badge-pattern-blocage-critique` / `badge-pattern-blocage-emergent` :
  adapter le vocabulaire ou créer de nouveaux badges

### 6b. Vocabulaire à migrer dans tout le code

| Ancien | Nouveau |
|--------|---------|
| Blocage critique | Difficulté persistante |
| Blocage émergent | Difficulté émergente |
| Risque de blocage | Difficulté constante |
| Progression possible | Progression |
| Progression normale | Maîtrise acquise |
| Indice de blocage | Score multistructurel |

---

## Fichiers concernés

| Fichier | Modifications |
|---------|---------------|
| `js/profil-etudiant.js` | `calculerIPB()`, `diagnostiquerSuiviApprentissage()`, affichage section, nettoyage ancien blocage |
| `js/tableau-bord-apercu.js` | Remplacer ancien blocage par nouveau diagnostic |
| `js/pratiques-materiel.js` | Tag `niveauSOLO` dans éditeur de grille |
| `styles.css` | Styles encadré suivi (bordure colorée, pastilles IPB), adaptation badges |
| `index.html` | Sélecteur SOLO dans grille, section Aide, conteneur profil |

## Ordre d'implémentation

```
Phase 0 (config grille + tag SOLO)
  → Phase 1 (calcul IPB + diagnostic)
    → Phase 2 (affichage profil — validation Grégoire)
      → Phase 3 (tableau de bord)
        → Phase 4 (réglages)
          → Phase 5 (documentation Aide)
            → Phase 6 (nettoyage)
```

Phase 0 et 1 peuvent être développées en parallèle.
Phase 5 (documentation) peut commencer dès que Phase 2 est validée visuellement.
