# Plan — Renommage `description` → `activiteApprentissage` (productions)

**Date** : 6 avril 2026
**Statut** : Prêt à implémenter
**Risque** : ÉLEVÉ — 72 références dans 14 fichiers + migration de données

---

## 1. Stratégie

**Approche en 3 couches :**

1. **Couche données** : migration + dual-write (nouveau + ancien champ)
2. **Couche lecture** : fallback systématique `prod.activiteApprentissage || prod.description`
3. **Couche UI** : renommage label + ID du champ de formulaire

Le fallback garantit que les données existantes (sans le nouveau champ)
continuent de fonctionner. Aucune donnée n'est perdue.

---

## 2. Audit des références (72 au total)

### Écriture (CRITIQUE — source de données)

| Fichier | Ligne | Opération |
|---------|-------|-----------|
| `productions.js` | ~775 | Lecture du DOM `productionDescription` |
| `productions.js` | ~921 | Propriété `description` dans l'objet sauvegardé |
| `productions.js` | ~3712 | Duplication : `description: \`${production.description} (copie)\`` |
| `import-export.js` | ~322 | Schéma de validation import `description: { type: 'string' }` |
| `import-export.js` | ~1439 | Export : `description: p.description` |

### Formulaire (index.html)

| Ligne | Élément |
|-------|---------|
| ~4618 | Label « Activité d'apprentissage » (déjà correct !) |
| ~4621 | `<input id="productionDescription">` → renommer |

### Lecture + affichage (58 références dans 13 fichiers)

| Fichier | Nb réf. | Usage principal |
|---------|---------|----------------|
| `productions.js` | 14 | Affichage listes, cartes, exports, notifications |
| `graphiques-progression.js` | 7 | Labels des graphiques Chart.js |
| `export-pdf.js` | 6 | Titre et noms dans les PDF |
| `liste-evaluations.js` | 5 | Nom complet de la production |
| `travaux-export-pdf.js` | 4 | Noms dans les PDF de rétroaction |
| `profil-etudiant.js` | 4 | Profil élève, rapports |
| `evaluation.js` | 2 | Rétroaction texte |
| `portfolio.js` | 2 | Titre fallback |
| `bilan-reflexif.js` | 2 | Titre composé |
| `correlations-longitudinales.js` | 1 | Champ activité |
| `impact-jetons.js` | 1 | Nom fallback |
| `donnees-v2.js` | 1 | Admin panel |
| `travaux-ui.js` | 2 | **Déjà migré** (fallback en place) |

---

## 3. Étapes d'implémentation

### Étape 1 — Migration des données existantes

Ajouter dans `migrations.js` :
```javascript
function migrerDescriptionVersActivite() {
    var productions = db.getSync(cle('productions'), []);
    var modifie = false;
    productions.forEach(function(p) {
        if (p.description && !p.activiteApprentissage) {
            p.activiteApprentissage = p.description;
            modifie = true;
        }
    });
    if (modifie) sauvegarderDonneesSelonMode('productions', productions);
}
```

Appelée au démarrage, une seule fois (flag `migration_activiteApprentissage`).

### Étape 2 — Écriture dual-write (`productions.js`)

Dans `sauvegarderProduction()` :
- Lire le DOM : `productionActivite` (nouveau ID)
- Écrire les deux champs : `activiteApprentissage` ET `description` (rétrocompat)
- Duplication : copier les deux champs

### Étape 3 — Formulaire (`index.html` + `productions.js`)

- `index.html` : `id="productionDescription"` → `id="productionActivite"`
- `productions.js` : toutes les refs DOM `productionDescription` → `productionActivite`
  (lignes ~650, ~713, ~775)

### Étape 4 — Lecture avec fallback (13 fichiers)

Pattern unique pour CHAQUE référence :
```javascript
// AVANT
prod.description || ''
// APRÈS
prod.activiteApprentissage || prod.description || ''
```

Ordre des fichiers (par risque décroissant) :
1. `productions.js` (14 refs)
2. `import-export.js` (schéma + export)
3. `export-pdf.js` (6 refs)
4. `liste-evaluations.js` (5 refs)
5. `travaux-export-pdf.js` (4 refs)
6. `profil-etudiant.js` (4 refs)
7. `graphiques-progression.js` (7 refs)
8. `evaluation.js` (2 refs)
9. `portfolio.js` (2 refs)
10. `bilan-reflexif.js` (2 refs)
11. `correlations-longitudinales.js` (1 ref)
12. `impact-jetons.js` (1 ref)
13. `donnees-v2.js` (1 ref)

### Étape 5 — Import/export (`import-export.js`)

- Schéma : accepter `activiteApprentissage` ET `description`
- Export : écrire les deux champs
- Import : lire `activiteApprentissage` en priorité, fallback sur `description`

### Étape 6 — Contre-vérification

Après toutes les modifications :
1. `grep -r "prod\.description\|production\.description" js/` → zéro hit hors fallbacks
2. `grep -r "productionDescription" .` → zéro hit
3. Vérifier que `grep "activiteApprentissage" js/` couvre tous les fichiers attendus
4. Tester : créer une production, modifier, dupliquer, exporter, importer
5. Tester : les anciennes productions (sans le nouveau champ) s'affichent correctement

---

## 4. Fichiers modifiés (résumé)

| Fichier | Modifications | Risque |
|---------|---------------|--------|
| `index.html` | 1 ID renommé | Moyen |
| `js/migrations.js` | +1 fonction migration | Faible |
| `js/productions.js` | ~17 modifications | **Élevé** |
| `js/import-export.js` | 3 modifications (schéma + read + write) | **Élevé** |
| `js/export-pdf.js` | 6 fallbacks ajoutés | Moyen |
| `js/liste-evaluations.js` | 5 fallbacks ajoutés | Moyen |
| `js/travaux-export-pdf.js` | 4 fallbacks ajoutés | Moyen |
| `js/profil-etudiant.js` | 4 fallbacks ajoutés | Moyen |
| `js/graphiques-progression.js` | 7 fallbacks ajoutés | Moyen |
| `js/evaluation.js` | 2 fallbacks ajoutés | Moyen |
| `js/portfolio.js` | 2 fallbacks ajoutés | Faible |
| `js/bilan-reflexif.js` | 2 fallbacks ajoutés | Faible |
| `js/correlations-longitudinales.js` | 1 fallback ajouté | Faible |
| `js/impact-jetons.js` | 1 fallback ajouté | Faible |
| `js/donnees-v2.js` | 1 fallback ajouté | Faible |
| `js/travaux-ui.js` | Déjà fait | — |

**Total : 15 fichiers, ~58 modifications**

---

## 5. Ce qu'on ne fait PAS maintenant

- Supprimer le champ `description` des objets (rétrocompat avec exports existants)
- Renommer le champ dans les évaluations sauvegardées (elles copient `productionNom`, pas `description`)
- Toucher au module Alignement (sera connecté plus tard via le même vocabulaire)
