# Plan : Refonte "Construction de la note" + Section Pratiques

## Résumé

Restructurer la section "Matériel" en "Construction de la note" et ajouter une nouvelle sous-section "Pratiques de notation" avec le pattern sidebar + modal bibliothèque (comme Échelles/Grilles).

## Autorisation

**js/config.js et js/navigation.js sont normalement PROTÉGÉS** mais **l'autorisation a été confirmée** par l'utilisateur pour cette refonte (2 janvier 2026).

---

## Phase 1 : Modifications de configuration (AUTORISÉ)

### 1.1 - js/config.js (ligne 49-56)

```javascript
// AVANT
'materiel': [
    { id: 'apercu', label: 'Aperçu' },
    { id: 'productions', label: 'Productions étudiantes' },
    { id: 'grille-criteres', label: 'Grilles de critères' },
    { id: 'echelle-performance', label: 'Échelles de performance' },
    { id: 'retroactions', label: 'Cartouches de rétroaction' },
    { id: 'objectifs', label: 'Ensembles d\'objectifs' }
],

// APRÈS (renommer, réordonner, retirer objectifs)
'construction': [
    { id: 'apercu', label: 'Aperçu' },
    { id: 'productions', label: 'Productions étudiantes' },
    { id: 'grille-criteres', label: 'Grilles de critères' },
    { id: 'echelle-performance', label: 'Échelles de performance' },
    { id: 'pratiques-notation', label: 'Pratiques de notation' },
    { id: 'retroactions', label: 'Cartouches de rétroaction' }
],
// NOTE: "Ensembles d'objectifs" retiré (pas du matériel de construction de note)
```

### 1.2 - js/navigation.js (dans switch de afficherSousSection)

Ajouter un case pour la nouvelle sous-section :
```javascript
case 'construction-pratiques-notation':
    console.log('🔄 Rafraîchissement du module Pratiques...');
    if (typeof initialiserModulePratiques === 'function') {
        setTimeout(async () => {
            await initialiserModulePratiques();
        }, 100);
    }
    break;
```

Et renommer tous les `materiel-*` en `construction-*`.

---

## Phase 2 : Renommages HTML dans index.html

### 2.1 - Bouton navigation principale (ligne 3270)
```html
<!-- AVANT -->
<button data-onglet="materiel">Matériel</button>

<!-- APRÈS -->
<button data-onglet="construction">Construction de la note</button>
```

### 2.2 - Renommer les IDs de sous-sections

| Ancien | Nouveau |
|--------|---------|
| `section-materiel` | `section-construction` |
| `materiel-apercu` | `construction-apercu` |
| `materiel-productions` | `construction-productions` |
| `materiel-grille-criteres` | `construction-grille-criteres` |
| `materiel-echelle-performance` | `construction-echelle-performance` |
| `materiel-retroactions` | `construction-retroactions` |

**Note** : La sous-section `materiel-objectifs` (Ensembles d'objectifs) sera supprimée.

---

## Phase 3 : Nouvelle sous-section HTML (index.html)

Ajouter après `construction-echelle-performance`, avant `construction-retroactions` :

```html
<!-- Sous-section : Pratiques de notation -->
<div id="construction-pratiques-notation" class="sous-section">
    <h2>Pratiques de notation</h2>
    <p class="text-muted">Configurez vos pratiques de notation (SOM, STD, SPE, DEN)</p>

    <div class="layout-sidebar-2col">
        <!-- SIDEBAR -->
        <div class="sidebar-navigation">
            <div class="sidebar-liste" id="sidebarListePratiques">
                <!-- Généré par JS -->
            </div>
        </div>

        <!-- ZONE PRINCIPALE -->
        <div class="zone-principale">
            <div style="margin-bottom: 20px; text-align: right;">
                <button onclick="creerNouvellePratique()" class="btn btn-principal">
                    + Nouvelle pratique
                </button>
            </div>

            <div class="zone-principale-accueil" id="accueilPratiques">
                <p>Sélectionnez une pratique ou créez-en une nouvelle</p>
            </div>

            <div id="conteneurEditionPratique" style="display: none;">
                <!-- Formulaire d'édition - réutilise les composants de pratique-notation-v2.js -->
            </div>
        </div>
    </div>
</div>
```

---

## Phase 4 : Nouveau module js/pratiques-materiel.js

Créer un nouveau fichier avec :

1. **`initialiserModulePratiques()`** - Point d'entrée appelé par navigation.js
2. **`afficherListePratiques()`** - Affiche sidebar avec bouton "Consulter la bibliothèque"
3. **`afficherBibliothequePratiques()`** - Modal avec :
   - Section 1 : Pratiques dans la sélection (Partager/Retirer)
   - Section 2 : Pratiques disponibles avec filtres type/discipline
4. **`chargerPratiquePourModif(id)`** - Charge le formulaire d'édition
5. **`creerNouvellePratique()`** - Nouvelle configuration
6. **`sauvegarderPratiqueMateriel()`** - Sauvegarde

Réutilise les fonctions existantes de :
- `pratiques-bibliotheque.js` (bibliothèque et gabarits)
- `pratique-notation-v2.js` (formulaires de configuration)

---

## Phase 5 : Sélecteur pratique active (page Trimestre)

Le sélecteur de pratique sera dans le **formulaire du cours** (section "Pratique de notation pour ce groupe-cours"), pas dans une nouvelle carte.

### 5.1 - Réviser le dropdown existant dans le formulaire Cours

Le dropdown `v2-pratiqueIdCours` existe déjà. Il faut le modifier pour :
- Charger les pratiques depuis `pratiquesTemplates` (configurations créées)
- Inclure les gabarits prédéfinis de `bibliothequePratiques`
- Afficher un badge de type (SOM, STD, SPE, DEN)
- Appliquer la configuration quand on sélectionne

### 5.2 - Fonctions à ajouter/modifier dans js/trimestre-v2.js

- `chargerDropdownPratiquesCours()` - Remplit le dropdown avec les pratiques disponibles
- `changerPratiqueCours(pratiqueId)` - Applique la configuration au cours
- Lier au dropdown existant `v2-pratiqueIdCours`

---

## Phase 6 : Ajout du script

Dans index.html, ajouter après `pratiques-bibliotheque.js` :
```html
<script src="js/pratiques-materiel.js?v=2026010301"></script>
```

---

## Fichiers à modifier

| Fichier | Action | Priorité |
|---------|--------|----------|
| `js/config.js` | Renommer section + ajouter sous-section | AUTORISÉ |
| `js/navigation.js` | Ajouter case + renommer cases | AUTORISÉ |
| `index.html` | Renommer IDs + ajouter HTML | Haute |
| `js/pratiques-materiel.js` | **NOUVEAU FICHIER** | Haute |
| `js/trimestre-v2.js` | Ajouter sélecteur pratique active | Moyenne |

---

## Ordre d'exécution

1. ✅ Autorisation obtenue pour modifier config.js et navigation.js
2. Modifier config.js (renommer 'materiel' → 'construction', ajouter 'pratiques-notation')
3. Modifier navigation.js (ajouter case, renommer cases)
4. Modifier index.html (renommer bouton, IDs, ajouter HTML nouvelle sous-section)
5. Créer js/pratiques-materiel.js
6. Ajouter script dans index.html
7. Ajouter sélecteur dans page Trimestre
8. Tester navigation et fonctionnalités

---

## Décisions prises

1. **Nom de la section** : "Construction de la note" ✅
2. **Ordre des sous-sections** : Pratiques après Échelles, avant Rétroactions ✅
3. **Formulaire d'édition** : Réutiliser pratique-notation-v2.js existant ✅
4. **Sélecteur dans Trimestre** : Dans le formulaire du cours, section "Pratique de notation pour ce groupe-cours" ✅
