# Plan — Carrousel de séquences (carte mentale)

**Date** : 11 avril 2026  
**Statut** : Idée documentée, à planifier  
**Origine** : Session d'implémentation import/export MD — constat que l'import en bloc encombre le canevas

---

## Constat

Quand un plan de cours est importé (5-8 séquences, 15-20 leçons), tout apparaît sur le canevas d'un coup. Les nœuds se chevauchent et l'enseignant doit réorganiser manuellement avant de pouvoir travailler. Le canevas unique devient dense quand le cours est complet (compétences + idées maîtresses + séquences + leçons + activités + évaluations).

**Observation terrain (11 avril)** : un cours réel de 15 séquences ne tient pas dans le canevas — seules 8 séquences sont visibles, le reste déborde. Le carrousel est indispensable pour un usage réel à cette échelle.

### Spacing intra-séquence (fix court terme)

Même en vue focalisée (carrousel), les leçons à l'intérieur d'une séquence se chevauchent quand les titres sont longs. Le `LAYOUT_X_GAP = 250px` entre leçons est insuffisant. À corriger en priorité (indépendamment du carrousel) :
- Calcul dynamique du gap selon la largeur du titre le plus long
- Ou augmentation du gap fixe à ~350-400px
- Vérifier aussi le positionnement vertical quand une séquence contient 5+ leçons (empiler en grille plutôt qu'en ligne)

## Idée

Remplacer le canevas unique par un **carrousel de séquences** dans la toolbar, inspiré du carrousel d'étudiants dans Annoter/Évaluer.

### Principe

- Chaque séquence est un **espace de travail focalisé** : l'enseignant ne voit qu'une séquence à la fois, avec ses leçons, activités et connaissances.
- Le carrousel dans la toolbar permet de naviguer entre les séquences (comme on navigue entre les étudiants dans Annoter/Évaluer).
- Une **vue globale** (premier élément du carrousel ou mode dédié) affiche le canevas d'alignement final : compétences, idées maîtresses, évaluations, et les séquences comme blocs reliés.

### Flux de travail visé

```
Import MD → séquences chargées dans le carrousel
         → l'enseignant ouvre Seq 1
         → il enrichit (activités, connaissances, liens)
         → il passe à Seq 2 via le carrousel
         → ...
         → Vue globale : il relie les séquences aux compétences et idées maîtresses
```

### Maquette toolbar

```
[Carte ▾] │ Vue globale │ Seq 1: Introduction ● │ Seq 2: Modelage │ Seq 3: Pratique… │ ← 2/5 → │ 📔 Export/Import
```

## Différences avec le carrousel Annoter/Évaluer

| Aspect | Annoter/Évaluer | Carrousel séquences |
|--------|----------------|---------------------|
| Éléments | Étudiants (liste fixe) | Séquences (nombre variable) |
| Contenu | Fichiers/annotations d'un étudiant | Canevas focalisé sur une séquence |
| Persistence | Toujours présent | Toujours présent (pas de staging) |
| Navigation | ← → entre étudiants | ← → entre séquences |
| Mode spécial | — | Vue globale (alignement cross-séquence) |

## Points d'architecture à résoudre

1. **Filtrage des nœuds visibles** : le canevas doit afficher uniquement les nœuds d'une séquence donnée (leçons enfants + leurs propres enfants). `reconstruireDOM()` doit accepter un filtre.

2. **Stockage** : les nœuds restent dans `etat.noeuds` (Map globale), mais chaque vue ne rend qu'un sous-ensemble. Pas de changement au modèle de données.

3. **Liens cross-séquence** : dans la vue globale, les liens entre séquences et compétences/idées maîtresses sont visibles. Dans la vue focalisée, seuls les liens internes à la séquence sont rendus.

4. **Position par séquence** : chaque séquence a son propre espace de coordonnées, ou bien on utilise un offset pour « zoomer » sur la zone de la séquence active. Option offset = plus simple (pas de changement au modèle).

5. **Création de séquences** : le carrousel doit permettre d'ajouter une nouvelle séquence (bouton +), pas seulement naviguer dans les existantes.

6. **Vue globale** : les séquences apparaissent comme des blocs compacts (titre + badge nombre de leçons), pas comme des conteneurs ouverts. L'enseignant peut ouvrir une séquence en double-cliquant → bascule vers la vue focalisée.

## Portée estimée

C'est une refonte du modèle d'interaction de la carte, pas un ajout incrémental. Touche à :
- Navigation (carrousel toolbar)
- Rendu (filtrage nœuds visibles)
- Liens (cross-séquence vs intra-séquence)
- Import MD (les séquences arrivent dans le carrousel, pas sur le canevas)
- Potentiellement le stockage (si on veut des coordonnées par vue)

**Prérequis** : import/export MD stabilisé (fait).

---

## Briefing technique — Carrousel de référence (Annoter/Évaluer)

Le carrousel d'étudiants dans Annoter/Évaluer est le pattern à reproduire. Voici sa structure pour guider l'implémentation.

### Architecture existante

| Aspect | Détail |
|--------|--------|
| **Fichier JS** | `js/travaux-ui.js` |
| **CSS** | `styles.css` lignes 20364-20687 |
| **Conteneur** | `.annot-toolbar` (flex row, toute la largeur) |
| **Zone scrollable** | `.annot-toolbar-fichiers` (`flex: 1; overflow-x: auto; gap: 6px`) |
| **Badges** | `.annot-badge` (`inline-flex; flex-shrink: 0; white-space: nowrap; cursor: pointer`) |
| **Badge actif** | `.annot-badge.actif` (fond bleu pale, bordure accent) |
| **Pilules statut** | `.travaux-badge-pill` + classes `.importe`, `.annote`, `.evalue`, `.en-cours` |
| **Navigation** | `badgePrecedent()` / `badgeSuivant()` lignes 6513-6527 |
| **Compteur** | `#travaux-compteur-badge` → « 4 / 15 » |
| **Scroll auto** | `badgeActifEl.scrollIntoView({ behavior: 'smooth', inline: 'center' })` |
| **Clic** | Via `data-action` dispatcher (main.js lignes 700-780) |

### Pattern de navigation

```javascript
function badgeSuivant() {
    var fichiers = obtenirFichiersNavigables();
    var idx = fichiers.findIndex(f => f.id === fichierActifId);
    if (idx < fichiers.length - 1) ouvrirFichier(fichiers[idx + 1].id);
}
```

### Adaptation pour le carrousel de séquences

| Carrousel étudiants | Carrousel séquences |
|---------------------|---------------------|
| `.annot-toolbar-fichiers` | `.planif-toolbar-sequences` (nouvelle classe) |
| `.annot-badge` | `.planif-seq-badge` |
| `.annot-badge.actif` | `.planif-seq-badge.actif` |
| `ouvrirFichier(id)` | `ouvrirSequence(id)` → filtre `reconstruireDOM()` |
| `obtenirFichiersNavigables()` | `obtenirSequencesCarte()` (filtre `etat.noeuds` par type=sequence) |
| Pilule statut (ÉVALUÉ, etc.) | Pilule « X leçons » ou « complète/incomplète » |
| Badge spécial — | Badge « Vue globale » (premier élément, toujours présent) |

### Fichiers à modifier

1. **`planification-carte.js`** — le gros du travail :
   - `reconstruireDOM(filtre)` : accepter un filtre optionnel (séquence ID ou null = tout)
   - Carrousel HTML + navigation dans la toolbar existante (`.planif-header-toolbar`)
   - `ouvrirSequence(seqId)` : filtrer + centrer
   - `ouvrirVueGlobale()` : afficher tout, séquences en blocs compacts
   
2. **`organisateur.js`** — mise à jour du carrousel quand on importe via MD
   - `importerPlanDepuisMD()` : après import, activer le carrousel sur la première séquence

3. **`index.html`** — zone carrousel dans `.planif-header-toolbar`

4. **`styles.css`** — classes `.planif-seq-badge`, `.planif-toolbar-sequences`

### État actuel des exports publics pertinents

```javascript
window.planificationCarte = {
    etat: etat,                    // Map noeuds, liens, compteurs
    chargerCarte: chargerCarte,    // Charge une carte par ID
    injecterNoeuds: injecterNoeuds, // Injection en lot (ajouté session 11 avril)
    nouvelleCarte: nouvelleCarte,  // Crée une carte vide
    ouvrirGuide: ouvrirGuide,      // Guide 8 pages
    // ... autres
};
```

### Recommandation d'implémentation par phases

**Phase 1 — Fix spacing** (indépendant du carrousel)
- Augmenter `LAYOUT_X_GAP` dans `importerPlanDepuisMD()` (organisateur.js)
- Grille au lieu de ligne quand 4+ leçons dans une séquence

**Phase 2 — Carrousel toolbar** (navigation pure)
- Ajouter la zone scrollable dans `.planif-header-toolbar`
- Badges séquences générés depuis `etat.noeuds`
- Navigation ← → + clic + scroll auto
- `ouvrirSequence()` = centrer la vue sur la séquence (zoom + pan), pas encore filtrer

**Phase 3 — Vue focalisée** (filtrage)
- `reconstruireDOM(filtre)` n'affiche que les nœuds d'une séquence
- Les liens cross-séquence sont masqués en vue focalisée
- Badge « Vue globale » pour revenir au canevas complet

**Phase 4 — Vue globale compacte**
- Les séquences s'affichent comme blocs résumés (titre + badge leçons)
- Double-clic → bascule en vue focalisée
- Liens cross-séquence vers compétences/idées maîtresses visibles

---

## Hors portée (à traiter séparément)

- Refonte complète du modèle de données (le Map `etat.noeuds` reste)
- Multi-utilisateur / collaboration
- Import de devis ministériel (assistant séparé, voir plan import-export MD)
