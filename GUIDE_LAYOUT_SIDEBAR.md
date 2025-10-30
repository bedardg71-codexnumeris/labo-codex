# Guide d'utilisation - Layout Sidebar 2 Colonnes

**Version** : Beta 0.80.2+
**Créé** : 30 octobre 2025
**Design** : Épuré, efficace, uniforme

---

## 🎯 Objectif

Système de classes CSS réutilisables pour créer des interfaces avec sidebar de navigation et zone principale.

**Utilisé dans** : Cartouches, Productions, Grilles de critères, Échelles de performance

---

## 📋 Structure HTML de base

```html
<div class="layout-sidebar-2col">

    <!-- SIDEBAR GAUCHE (280px, sticky) -->
    <div class="sidebar-navigation">

        <!-- Filtre optionnel -->
        <div class="sidebar-filtre">
            <label>Filtrer par :</label>
            <select class="controle-form">
                <option value="">Tous</option>
            </select>
        </div>

        <!-- Liste d'items -->
        <div class="sidebar-liste">
            <div class="sidebar-item" onclick="charger('id1')">
                <div class="sidebar-item-titre">Nom de l'item</div>
                <div class="sidebar-item-badge">Catégorie</div>
                <div class="sidebar-item-actions">
                    <button class="btn-icone">📋</button>
                    <button class="btn-icone">🗑️</button>
                </div>
            </div>
            <!-- Répéter pour chaque item -->
        </div>

        <!-- Bouton d'ajout -->
        <button class="sidebar-btn-ajouter" onclick="creerNouveau()">
            + Nouvel item
        </button>
    </div>

    <!-- ZONE PRINCIPALE (centrale, scroll) -->
    <div class="zone-principale">

        <!-- Message d'accueil initial -->
        <div class="zone-principale-accueil">
            <p>Sélectionnez un item ou créez-en un nouveau</p>
        </div>

        <!-- Formulaire d'édition -->
        <div id="formulaireEdition" style="display: none;">
            <!-- Vos champs de formulaire -->
        </div>

        <!-- Accordéons optionnels -->
        <div id="optionsAvancees" class="section-accordeon" style="display: none;">
            <details>
                <summary>📥 Option 1</summary>
                <div class="accordeon-contenu">
                    <!-- Contenu -->
                </div>
            </details>
            <details>
                <summary>📤 Option 2</summary>
                <div class="accordeon-contenu">
                    <!-- Contenu -->
                </div>
            </details>
        </div>
    </div>

</div>
```

---

## 🎨 Classes CSS disponibles

### Layout principal

| Classe | Description | Propriétés clés |
|--------|-------------|-----------------|
| `.layout-sidebar-2col` | Layout 2 colonnes (280px + 1fr) | `display: grid` |

### Sidebar navigation

| Classe | Description | Propriétés clés |
|--------|-------------|-----------------|
| `.sidebar-navigation` | Sidebar sticky avec scroll interne | `position: sticky; top: 20px` |
| `.sidebar-filtre` | Conteneur pour select de filtrage | `margin-bottom: 15px` |
| `.sidebar-liste` | Conteneur de liste d'items | `margin: 15px 0` |
| `.sidebar-item` | Item cliquable | `cursor: pointer` |
| `.sidebar-item.active` | Item actif (highlight) | `border-left: bleu; background: bleu pâle` |
| `.sidebar-item-titre` | Titre principal de l'item | `font-weight: 500; font-size: 0.9rem` |
| `.sidebar-item-badge` | Badge/tag secondaire | `background: #f0f0f0; padding: 2px 8px` |
| `.sidebar-item-actions` | Conteneur boutons d'action | `display: flex; gap: 4px` |
| `.sidebar-btn-ajouter` | Bouton création en bas | `width: 100%; background: bleu` |
| `.sidebar-vide` | Message liste vide | `text-align: center; font-style: italic` |

### Zone principale

| Classe | Description | Propriétés clés |
|--------|-------------|-----------------|
| `.zone-principale` | Conteneur central | `display: flex; flex-direction: column` |
| `.zone-principale-accueil` | Message d'accueil | `padding: 40px; background: bleu pâle` |

### Accordéons

| Classe | Description | Propriétés clés |
|--------|-------------|-----------------|
| `.section-accordeon` | Conteneur d'accordéons | `background: white; padding: 15px` |
| `.accordeon-contenu` | Contenu d'un panneau | `padding: 15px; background: #fafafa` |

### Utilitaires

| Classe | Description | Propriétés clés |
|--------|-------------|-----------------|
| `.liste-checkboxes` | Liste de checkboxes cliquables | `display: flex; flex-direction: column` |

---

## 🔄 Rétrocompatibilité

Les anciennes classes de la section Cartouches sont toujours supportées :

| Ancienne classe | Nouvelle classe (recommandée) |
|-----------------|-------------------------------|
| `.layout-cartouches-2col` | `.layout-sidebar-2col` |
| `.sidebar-cartouches` | `.sidebar-navigation` |
| `.item-cartouche-banque` | `.sidebar-item` |
| `.nom-cartouche` | `.sidebar-item-titre` |
| `.badge-grille` | `.sidebar-item-badge` |
| `.actions-cartouche` | `.sidebar-item-actions` |
| `.btn-ajouter-cartouche` | `.sidebar-btn-ajouter` |
| `.zone-centrale-cartouche` | `.zone-principale` |
| `.accordeon-import` | `.section-accordeon` |
| `.panneau-import` | `.accordeon-contenu` |
| `.banque-vide` | `.sidebar-vide` |

**Note** : Les deux noms fonctionnent, mais les nouvelles classes sont recommandées pour les nouvelles implémentations.

---

## 💻 Exemple JavaScript minimal

```javascript
/**
 * Affiche les items dans la sidebar
 */
function afficherListeItems(items = []) {
    const container = document.querySelector('.sidebar-liste');

    if (items.length === 0) {
        container.innerHTML = '<p class="sidebar-vide">Aucun item disponible</p>';
        return;
    }

    const html = items.map(item => `
        <div class="sidebar-item ${item.estActif ? 'active' : ''}"
             data-id="${item.id}"
             onclick="chargerItem('${item.id}')">
            <div class="sidebar-item-titre">${echapperHtml(item.nom)}</div>
            <div class="sidebar-item-badge">${echapperHtml(item.categorie)}</div>
            <div class="sidebar-item-actions">
                <button class="btn-icone" onclick="event.stopPropagation(); dupliquer('${item.id}')" title="Dupliquer">📋</button>
                <button class="btn-icone" onclick="event.stopPropagation(); supprimer('${item.id}')" title="Supprimer">🗑️</button>
            </div>
        </div>
    `).join('');

    container.innerHTML = html;
}

/**
 * Marque un item comme actif (highlight)
 */
function definirItemActif(itemId) {
    // Retirer le highlight de tous les items
    document.querySelectorAll('.sidebar-item').forEach(item => {
        item.classList.remove('active');
    });

    // Ajouter le highlight à l'item actif
    const itemActif = document.querySelector(`[data-id="${itemId}"]`);
    if (itemActif) {
        itemActif.classList.add('active');
    }
}

/**
 * Affiche/masque les zones selon l'état
 */
function afficherZones(itemSelectionne = false) {
    const accueil = document.querySelector('.zone-principale-accueil');
    const formulaire = document.getElementById('formulaireEdition');
    const options = document.getElementById('optionsAvancees');

    if (itemSelectionne) {
        accueil.style.display = 'none';
        formulaire.style.display = 'block';
        options.style.display = 'block';
    } else {
        accueil.style.display = 'block';
        formulaire.style.display = 'none';
        options.style.display = 'none';
    }
}
```

---

## ✅ Checklist d'implémentation

Quand tu implémentes ce pattern dans une nouvelle section :

- [ ] Copier la structure HTML de base
- [ ] Remplacer `.sidebar-item` par des données réelles
- [ ] Créer fonction `afficherListe[Nom]()` qui génère le HTML
- [ ] Créer fonction `definir[Nom]Actif(id)` pour le highlight
- [ ] Créer fonction `charger[Nom](id)` qui charge les données
- [ ] Créer fonction `creerNouveau[Nom]()` pour le bouton d'ajout
- [ ] Implémenter filtrage si nécessaire
- [ ] Gérer affichage/masquage des zones (accueil vs formulaire)
- [ ] Tester : clic item, highlight, scroll sidebar, accordéons

---

## Principes de design

1. **Épuré** : Pas de fioritures, design minimaliste
2. **Efficace** : Tout est visible, pas de scroll inutile
3. **Uniforme** : Même apparence partout
4. **Documenté** : Code commenté, classes explicites
5. **Sans émojis** : Utiliser des boutons texte CSS standards (btn, btn-compact, btn-tres-compact)
6. **Bordures fines** : 1px pour les encadrés standards, 2px pour les éléments actifs uniquement
7. **Palette Nuit Élégante** : Bleus (#032e5c, #2a4a8a, #6b85b3), sarcelle (#1e5a4a), terracotta (#8a4a2a)

---

## Cartes métriques horizontales

```html
<div class="cartes-metriques">
    <div class="carte-metrique">
        <div class="label">Critères</div>
        <div class="valeur" id="nbCriteres">5</div>
    </div>
    <div class="carte-metrique">
        <div class="label">Niveaux</div>
        <div class="valeur" id="nbNiveaux">4</div>
    </div>
    <!-- Autres cartes... -->
</div>
```

**Placement** : Juste après le titre principal, avant les champs de formulaire

## Matrice en tableau HTML

```html
<table class="matrice-tableau">
    <thead>
        <tr>
            <th>Critère / Niveau</th>
            <th>
                <span class="niveau-code">I</span>
                <span class="niveau-label">Incomplet ou insuffisant</span>
            </th>
            <!-- Autres colonnes I/D/M/E... -->
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Structure</td>
            <td><textarea placeholder="Commentaire..."></textarea></td>
            <!-- Autres cellules... -->
        </tr>
    </tbody>
</table>
```

**Format compact** : Une ligne par critère, colonnes pour chaque niveau

---

## Notes techniques

- **Largeur sidebar** : 280px (ajustable via `grid-template-columns`)
- **Sidebar sticky** : `top: 20px` (reste visible au scroll)
- **Scroll interne** : `max-height: calc(100vh - 100px)` sur sidebar
- **Highlight actif** : Bordure 2px #032e5c + dégradé bleu pâle
- **Items normaux** : Bordure 1px #6b85b3 + fond #e8f2fd
- **Transitions** : `0.15s ease` pour tous les effets hover
- **Ombres** : Légères (`0 1px 3px rgba(0,0,0,0.08)`)
- **Badge grille** : Dégradé bleu marine avec texte blanc
- **Boutons action** : Hover violet (#4a3a6a) pour Dupliquer, rouge (#8a2a2a) pour Supprimer

---

**Créé pour** : Système de monitorage pédagogique
**Auteur** : Grégoire Bédard
**Documentation** : Claude Code
