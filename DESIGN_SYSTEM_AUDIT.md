# 🎨 Design System - Audit Complet

**Version** : Beta 0.50
**Date d'audit** : 24 octobre 2025
**Fichier source** : `/Users/kuekatsheu/Documents/GitHub/Monitorage_v6/styles.css`
**Lignes de code** : 1978 lignes

---

## 📊 Résumé Exécutif

Le Design System de l'application de monitorage pédagogique est actuellement en version **Beta 0.50** (mis à jour le 16 octobre 2025). Le système présente une architecture CSS bien structurée avec :

- **100% en français** (respect de la convention du projet)
- **Architecture modulaire** avec sections clairement délimitées
- **Système de variables CSS** cohérent pour la customisation
- **Support multi-thèmes** (3 modes : Normal, Simulation, Anonymisation)
- **Responsive design** avec breakpoints mobile/tablette
- **Composants réutilisables** bien définis

### Points Forts
✅ Variables CSS bien organisées et nommées de manière cohérente
✅ Structure modulaire claire avec commentaires de sections
✅ Gestion des états (hover, disabled, actif) consistante
✅ Support multi-thèmes avec dégradés personnalisés
✅ Système de cartes modulaire et flexible
✅ Badges et indicateurs de risque bien définis

### Points d'Attention
⚠️ Certaines animations définies plusieurs fois
⚠️ Quelques redondances dans les styles de cartes
⚠️ Classes utilitaires limitées (seulement marges)
⚠️ Documentation inline limitée pour certains composants complexes

---

## 🎨 Palette de Couleurs

### Couleurs Principales (Bleus)

| Variable | Hex | Usage |
|----------|-----|-------|
| `--bleu-principal` | `#032e5c` | Couleur primaire, titres, navigation |
| `--bleu-fonce` | `#0f1e3a` | Dégradés d'en-tête, mode simulation |
| `--bleu-moyen` | `#2a4a8a` | Navigation active, états intermédiaires |
| `--bleu-clair` | `#065dbb` | Liens, focus, éléments interactifs |
| `--bleu-leger` | `#6b85b3` | Bordures, textes secondaires |
| `--bleu-carte` | `#9fc5e8` | Fonds de cartes métriques |
| `--bleu-pale` | `#e8f2fd` | Fonds légers, sous-navigation |
| `--bleu-tres-pale` | `#f0f8ff` | Fonds ultra-légers, états hover |
| `--bleu-simulation` | `#0f1e3a` | Mode simulation (dégradé sombre) |
| `--bleu-anonymisation` | `#1a5266` | Mode anonymisation (sarcelle) |

### Couleurs d'Accent

| Variable | Hex | Usage |
|----------|-----|-------|
| `--orange-accent` | `#ff6b35` | Bordures actives, éléments clés |
| `--vert-pale` | `#f8fef8` | Fonds pour états positifs |
| `--vert-doux` | `#b8d4b8` | Éléments verts discrets |
| `--vert-leger` | `#2a8a6a` | Boutons confirmer/ajouter, succès |

### Indicateurs de Risque (Échelle 7 niveaux)

| Variable | Hex | Signification | Texte |
|----------|-----|---------------|-------|
| `--risque-nul` | `#065dbb` | Aucun risque | Blanc |
| `--risque-minimal` | `#28a745` | Risque minimal | Blanc |
| `--risque-faible` | `#90EE90` | Risque faible | Vert foncé `#1a5f1a` |
| `--risque-modere` | `#ffc107` | Risque modéré | Jaune foncé `#7a5900` |
| `--risque-eleve` | `#fd7e14` | Risque élevé | Blanc |
| `--risque-tres-eleve` | `#dc3545` | Risque très élevé | Blanc |
| `--risque-critique` | `#721c24` | Risque critique | Blanc |

### Navigation

| Variable | Valeur | Usage |
|----------|--------|-------|
| `--nav-bg` | `#f8f9fa` | Fond navigation (non utilisé actuellement) |
| `--nav-normal` | `#04376f` | Texte navigation mode normal |
| `--nav-hover` | `#3e98f9` | Hover navigation |
| `--nav-actif` | `#054a95` | État actif navigation |
| `--nav-bordure-actif` | `var(--orange-accent)` | Bordure élément actif |
| `--nav-actif-normal` | `#2a4a8a` | Fond actif mode normal |
| `--nav-actif-simulation` | `#2a3d5a` | Fond actif mode simulation |
| `--nav-actif-anonymisation` | `#2a6a7a` | Fond actif mode anonymisation |

### Sous-Navigation

| Variable | Valeur | Usage |
|----------|--------|-------|
| `--sous-nav-bg` | `#e8f2fd` | Fond sous-navigation par défaut |
| `--sous-nav-normal` | `#054a95` | Texte sous-navigation |
| `--sous-nav-hover` | `#3e98f9` | Hover sous-navigation |
| `--sous-nav-actif` | `#065dbb` | État actif sous-navigation |
| `--sous-nav-bg-normal` | `#e8f2fd` | Fond mode normal |
| `--sous-nav-bg-simulation` | `#dce8f5` | Fond mode simulation |
| `--sous-nav-bg-anonymisation` | `#e0f0f0` | Fond mode anonymisation |

### Boutons d'Action

| Variable | Hex | Usage |
|----------|-----|-------|
| `--btn-principal` | `#065dbb` | Bouton principal (bleu) |
| `--btn-principal-hover` | `#054a95` | Hover principal |
| `--btn-ajouter` | `#1e5a4a` | Bouton ajouter (vert foncé) |
| `--btn-ajouter-hover` | `#165040` | Hover ajouter |
| `--btn-modifier` | `#4a3a6a` | Bouton modifier (violet) |
| `--btn-modifier-hover` | `#3a2a5a` | Hover modifier |
| `--btn-confirmer` | `#1e5a4a` | Bouton confirmer (vert) |
| `--btn-confirmer-hover` | `#165040` | Hover confirmer |
| `--btn-annuler` | `#7a5a1a` | Bouton annuler (jaune-brun) |
| `--btn-annuler-hover` | `#6a4a10` | Hover annuler |
| `--btn-supprimer` | `#8a2a2a` | Bouton supprimer (rouge) |
| `--btn-supprimer-hover` | `#7a1a1a` | Hover supprimer |

### Calendrier

| Variable | Hex | Usage |
|----------|-----|-------|
| `--jour-cours-reel-bg` | `#e3f2fd` | Fond jour de cours réel |
| `--reprise-bg` | `#fff3e0` | Fond jour de reprise |
| `--conge-bg` | `#ffebee` | Fond jour de congé |
| `--planification-bg` | `#f3e5f5` | Fond planification |
| `--examens-bg` | `#fce4ec` | Fond jour d'examen |
| `--weekend-bg` | `#f5f5f5` | Fond weekend |

---

## 📏 Espacements

| Variable | Valeur | Usage |
|----------|--------|-------|
| `--espacement-petit` | `10px` | Espacements réduits |
| `--espacement-moyen` | `20px` | Espacement standard |
| `--espacement-grand` | `30px` | Grands espacements |

**Note** : Le système pourrait bénéficier d'une échelle plus complète (xs, sm, md, lg, xl, xxl).

---

## 🧩 Composants

### 1. Boutons (.btn)

#### Classe de Base
```css
.btn {
    padding: 10px 20px;
    border: none;
    border-radius: 6px;
    font-size: 0.95rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
}
```

#### Variantes de Boutons

| Classe | Variable | Couleur | Usage |
|--------|----------|---------|-------|
| `.btn-principal` | `--btn-principal` | Bleu `#065dbb` | Action primaire |
| `.btn-ajouter` | `--btn-ajouter` | Vert foncé `#1e5a4a` | Créer/ajouter |
| `.btn-modifier` | `--btn-modifier` | Violet `#4a3a6a` | Éditer |
| `.btn-confirmer` | `--btn-confirmer` | Vert `#1e5a4a` | Valider |
| `.btn-annuler` | `--btn-annuler` | Jaune-brun `#7a5a1a` | Annuler |
| `.btn-supprimer` | `--btn-supprimer` | Rouge `#8a2a2a` | Supprimer |

#### États
- **`:hover:not(:disabled)`** : Assombrissement de la couleur de base
- **`:disabled`** : `opacity: 0.5`, `cursor: not-allowed`

#### Groupe de Boutons
```css
.btn-groupe {
    display: flex;
    gap: 10px;
    margin-top: var(--espacement-moyen);
}
```

---

### 2. Cartes

#### Carte Standard (.carte)
```css
.carte {
    background: white;
    border: 1px solid var(--bleu-pale);
    border-radius: 8px;
    padding: var(--espacement-moyen);
    margin-bottom: var(--espacement-moyen);
    box-shadow: 0 2px 8px rgba(3, 46, 92, 0.05);
}
```

**Usage** : Conteneur de contenu principal, sections.

---

#### Carte Statistique (.carte-statistique)
```css
.carte-statistique {
    background: var(--bleu-pale);
    border: 1px solid var(--bleu-leger);
    border-radius: 8px;
    padding: var(--espacement-moyen);
    text-align: center;
    box-shadow: 0 3px 6px rgba(3, 46, 92, 0.1);
    transition: all 0.2s ease;
}
```

**Sous-éléments** :
- `.valeur` : Valeur numérique grande (2.5rem, bold)
- `.label` : Label en minuscules (0.9rem, uppercase)

**Effet hover** : Fond blanc, élévation, translation -2px

---

#### Carte Métrique (.carte-metrique)
```css
.carte-metrique {
    background: var(--bleu-carte);
    border: 1px solid var(--bleu-moyen);
    border-radius: 6px;
    padding: 12px 15px;
    text-align: center;
    min-width: 120px;
    display: inline-block;
}
```

**Usage** : Petites statistiques compactes affichées en ligne.

---

#### Item Carte (.item-carte)
```css
.item-carte {
    padding: 12px;
    background: var(--bleu-tres-pale);
    border: 2px solid var(--bleu-leger);
    border-radius: 6px;
    margin-bottom: 10px;
}
```

**Variante** : `.item-special` (fond `--bleu-carte`, bordure `--bleu-moyen`)

**Structure** :
- `.item-carte-header` : En-tête avec titre et actions
- `.item-carte-titre` : Titre de l'item (bold, bleu principal)
- `.item-carte-actions` : Boutons d'action (flex, gap 8px)
- `.item-carte-grille` : Grille de champs
  - `.item-carte-grille-2col` : 2 colonnes
  - `.item-carte-grille-3col` : 3 colonnes
  - `.item-carte-grille-custom` : 1.5fr 1.5fr 1fr
- `.item-carte-label` : Label de champ (0.75rem, bleu moyen)
- `.item-carte-valeur` : Valeur de champ (0.85rem)
  - `.readonly` : Fond blanc, bordure pale
  - `.manquant` : Rouge, italique
  - `.important` : Bold, vert leger
- `.item-carte-footer` : Pied de carte (bordure top)
- `.item-carte-badge` : Badge inline dans carte

---

#### Carte Cible d'Intervention (.carte-cible-intervention)
```css
.carte-cible-intervention {
    background: white;
    border: 2px solid;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
```

**Usage** : Carte premium pour afficher la cible d'intervention RàI.

**Structure** :
- `.carte-cible-header` : En-tête flex avec titre et badge
- `.carte-cible-titre` : Titre avec icône (1.1rem, bold)
- `.carte-cible-badge-niveau` : Badge de niveau de risque
- `.carte-cible-texte-principal` : Texte principal (1.25rem, bold)
- `.carte-cible-meta` : Métadonnées (0.9rem, gris)
- `.carte-cible-description` : Description détaillée (fond bleu très pale)

---

### 3. Badges

#### Badge de Risque (.badge-risque)
```css
.badge-risque {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 0.85rem;
    font-weight: 500;
}
```

**Variantes de risque** :
- `.risque-nul` : Bleu principal, texte blanc
- `.risque-minimal` : Vert, texte blanc
- `.risque-faible` : Vert léger, texte vert foncé
- `.risque-modere` : Jaune, texte jaune foncé
- `.risque-eleve` : Orange, texte blanc
- `.risque-tres-eleve` : Rouge, texte blanc
- `.risque-critique` : Rouge foncé, texte blanc

---

#### Badge de Note (.badge-note)
```css
.badge-note {
    padding: 4px 8px;
    border-radius: 4px;
    font-weight: bold;
    font-size: 0.9rem;
}
```

**Variantes** :
- `.note-maitrise` : Vert `--risque-minimal`, texte blanc
- `.note-intermediaire` : Vert léger `--risque-faible`, texte vert foncé
- `.note-developpement` : Jaune `--risque-modere`, texte jaune foncé
- `.note-base` : Orange `--risque-eleve`, texte blanc
- `.note-observation` : Rouge `--risque-critique`, texte blanc

---

#### Badge de Statut (.badge-statut)
```css
.badge-statut {
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.85rem;
}
```

**Usage** : Badges génériques pour statuts variés (pas de variantes définies dans CSS).

---

#### Badge Interprétatif (.interpretation-badge)
```css
.interpretation-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    border-radius: 8px;
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 20px;
    border-left: 4px solid;
}
```

**Usage** : Badge qualitatif d'interprétation dans le profil étudiant.

---

### 4. Tableaux (.tableau)

```css
.tableau {
    width: 100%;
    border-collapse: collapse;
    margin: var(--espacement-moyen) 0;
}

.tableau thead {
    background: var(--bleu-pale);
}

.tableau th {
    padding: 12px;
    text-align: left;
    font-weight: 600;
    color: var(--bleu-principal);
    font-size: 0.9rem;
    border-bottom: 2px solid var(--bleu-leger);
}

.tableau td {
    padding: 10px 12px;
    border-bottom: 1px solid var(--bleu-tres-pale);
}

.tableau tbody tr:hover {
    background: var(--bleu-tres-pale);
}
```

**Effet hover** : Fond bleu très pale sur les lignes du body.

---

### 5. Formulaires

#### Groupe de Formulaire (.groupe-form)
```css
.groupe-form {
    margin-bottom: var(--espacement-moyen);
}

.groupe-form label {
    display: block;
    margin-bottom: 5px;
    color: var(--bleu-principal);
    font-weight: 500;
    font-size: 0.9rem;
}
```

---

#### Contrôle de Formulaire (.controle-form)
```css
.controle-form {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid var(--bleu-leger);
    border-radius: 4px;
    font-size: 0.95rem;
    transition: border-color 0.2s;
}

.controle-form:focus {
    outline: none;
    border-color: var(--bleu-clair);
    box-shadow: 0 0 0 3px rgba(6, 93, 187, 0.1);
}
```

---

#### Formulaire Responsive Ajout Groupe (.formulaire-ajout-grid)
```css
.formulaire-ajout-grid {
    display: grid;
    grid-template-columns: 1fr 0.7fr 1.5fr 1.5fr 1fr 0.7fr 0.7fr auto;
    gap: 10px;
    align-items: end;
}
```

**Responsive** :
- **Tablette (< 1200px)** : 5 colonnes
- **Mobile (< 768px)** : 2 colonnes

---

#### Inputs Spéciaux - Saisie de Présences

Classes conditionnelles appliquées dynamiquement :

| Classe | Couleur | Usage |
|--------|---------|-------|
| `.saisie-absence` | Rouge léger `#f8d7da` | Absence complète (0h) |
| `.saisie-retard` | Jaune `#fff3cd` | Retard ou absence partielle |
| `.saisie-present` | Vert léger `#d4edda` | Présence complète |
| `.saisie-vide` | Blanc | Non saisi |

**Transitions** : `0.3s ease` sur background et border.

---

### 6. Navigation

#### Navigation Principale (.navigation-principale)
```css
.navigation-principale {
    background: var(--bleu-principal);
    padding: 0;
    display: flex;
    justify-content: center;
    gap: 0;
    border-bottom: 3px solid var(--bleu-fonce);
}

.navigation-principale button {
    flex: 1;
    padding: 15px 25px;
    background: transparent;
    color: var(--bleu-pale);
    border: none;
    font-size: 0.95rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s;
    border-bottom: 3px solid transparent;
}

.navigation-principale button:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
}

.navigation-principale button.actif {
    background: var(--bleu-moyen);
    color: white;
    border-bottom: 3px solid var(--orange-accent);
}
```

**Responsive** : Flex-wrap sur mobile, min-width 150px par bouton.

---

#### Sous-Navigation (.sous-navigation)
```css
.sous-navigation {
    background: var(--sous-nav-bg);
    padding: 12px 20px;
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    border-bottom: 1px solid var(--bleu-leger);
}

.sous-navigation button {
    padding: 8px 16px;
    background: white;
    color: var(--sous-nav-normal);
    border: 1px solid var(--bleu-leger);
    border-radius: 6px;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s;
}

.sous-navigation button:hover {
    background: var(--bleu-tres-pale);
    border-color: var(--sous-nav-hover);
    color: var(--sous-nav-hover);
}

.sous-navigation button.actif {
    background: var(--sous-nav-actif);
    color: white;
    border-color: var(--sous-nav-actif);
}
```

**Classe vide** : `.sous-navigation.vide` (fond transparent, sans padding ni bordure)

---

### 7. En-tête (.entete)

```css
.entete {
    background: linear-gradient(135deg, var(--bleu-principal) 0%, var(--bleu-fonce) 100%);
    color: white;
    padding: 30px;
    position: relative;
}
```

**Structure** :
- `.entete-conteneur` : Flex container principal
- `.logo-section` : Logo + métadonnées
- `.titre-section` : Titre centré (position absolute)
- `#selecteur-mode` : Sélecteur de mode (position absolute, top right)

---

#### Logo (.logo)
```css
.logo {
    width: 70px;
    height: 70px;
    background: white;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}
```

**Lien logo** : `.logo-link` avec effet scale 1.05 au hover.

---

#### Sélecteur de Mode (.btn-mode)
```css
.btn-mode {
    padding: 8px 15px;
    background: rgba(255, 255, 255, 0.15);
    color: rgba(255, 255, 255, 0.7);
    border: 2px solid transparent;
    border-radius: 6px;
    font-size: 0.85rem;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s;
    backdrop-filter: blur(5px);
}

.btn-mode:hover {
    background: rgba(255, 255, 255, 0.25);
    color: white;
}

.btn-mode.actif {
    background: rgba(255, 255, 255, 0.15);
    color: white;
    border: 2px solid white;
    box-shadow: 0 2px 8px rgba(255, 255, 255, 0.3);
}
```

---

### 8. Profil Étudiant - Layout 2 Colonnes

#### Layout Principal (.profil-layout-2col)
```css
.profil-layout-2col {
    display: grid;
    grid-template-columns: 320px 1fr;
    gap: 20px;
    align-items: start;
    min-height: 600px;
}
```

**Responsive** :
- **Tablette (< 1024px)** : `280px 1fr`
- **Mobile (< 768px)** : `1fr` (single column)

---

#### Sidebar (.profil-sidebar)
```css
.profil-sidebar {
    background: white;
    border-radius: 8px;
    border: 1px solid var(--bleu-pale);
    padding: 15px;
    position: sticky;
    top: 20px;
    max-height: calc(100vh - 40px);
    overflow-y: auto;
}
```

**Structure** :
- `.profil-sidebar-header` : En-tête avec nom et métadonnées
- `.profil-sidebar-metriques` : Métriques compactes (grille 2 colonnes)
- `.profil-sidebar-nav` : Navigation entre sections

---

#### Métrique Sidebar (.metrique-sidebar)
```css
.metrique-sidebar {
    background: var(--bleu-tres-pale);
    padding: 10px 8px;
    border-radius: 6px;
    text-align: center;
    border-left: 3px solid;
    transition: all 0.2s;
}
```

**Sous-éléments** :
- `.metrique-sidebar-valeur` : Valeur (1.3rem, bold)
- `.metrique-sidebar-label` : Label (0.75rem, bleu moyen)

---

#### Navigation Sidebar (.profil-nav-item)
```css
.profil-nav-item {
    padding: 10px 12px;
    margin-bottom: 6px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
    background: white;
    border: 1px solid transparent;
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.profil-nav-item:hover {
    background: var(--bleu-tres-pale);
    border-color: var(--bleu-pale);
}

.profil-nav-item.actif {
    background: var(--bleu-principal);
    color: white;
    font-weight: 600;
}
```

**Structure** :
- `.profil-nav-item-ligne` : Ligne principale (flex space-between)
- `.profil-nav-item-titre` : Titre avec icône optionnelle
- `.profil-nav-item-valeur` : Valeur à droite (badge)
- `.profil-nav-item-sous-ligne` : Détails optionnels

---

#### Contenu Principal (.profil-contenu)
```css
.profil-contenu {
    background: white;
    border-radius: 8px;
    border: 1px solid var(--bleu-pale);
    padding: 20px;
    min-height: 500px;
}
```

**Structure** :
- `.profil-contenu-header` : En-tête avec titre de section
- `.profil-contenu-body` : Corps dynamique

---

### 9. Sections Collapsibles (.section-collapsible)

```css
.section-collapsible {
    background: white;
    border: 1px solid var(--bleu-pale);
    border-radius: 6px;
    margin-bottom: 12px;
    overflow: hidden;
}

.section-collapsible-header {
    padding: 15px;
    background: var(--bleu-tres-pale);
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    user-select: none;
}

.section-collapsible-header:hover {
    background: var(--bleu-pale);
}

.section-collapsible-content {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.4s ease-in-out;
}

.section-collapsible-content.expanded {
    max-height: 3000px;
    padding: 15px;
    border-top: 1px solid var(--bleu-pale);
}
```

**Sous-éléments** :
- `.section-collapsible-titre` : Titre de section (flex avec icône)
- `.section-collapsible-toggle` : Indicateur d'état (texte + chevron)

---

### 10. Toggles de Détails (.toggle-details)

```css
.toggle-details {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 0.85rem;
    color: var(--bleu-moyen);
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
    user-select: none;
    border: 1px solid transparent;
}

.toggle-details:hover {
    background: var(--bleu-pale);
    border-color: var(--bleu-moyen);
}
```

**Contenu associé** :
```css
.details-techniques {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s ease;
    opacity: 0;
}

.details-techniques.visible {
    max-height: 800px;
    padding: 15px;
    background: var(--bleu-tres-pale);
    border-radius: 4px;
    margin-top: 10px;
    opacity: 1;
}
```

---

### 11. Modaux (.modal-overlay)

```css
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
}

.modal-contenu {
    background: white;
    padding: 30px;
    border-radius: 8px;
    max-width: 600px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
}
```

---

### 12. Notifications (.notification-succes)

```css
.notification-succes {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    background: var(--vert-leger);
    color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    z-index: 9999;
    animation: slideIn 0.3s ease;
}
```

**Sous-élément** : `.notification-details` (0.9rem, opacity 0.9)

**Animation** : `slideIn` (translateX 400px → 0, opacity 0 → 1)

---

### 13. Encadré de Date (#enteteDateSeance)

```css
#enteteDateSeance {
    padding: 16px 24px;
    border-radius: 8px;
    border-width: 2px;
    border-style: solid;
    margin-bottom: 20px;
    text-align: center;
    transition: all 0.3s ease;
    display: none; /* Caché par défaut */
}
```

**États** :
- `.etat-erreur` : Fond jaune `#fff3cd`, bordure `#ffc107`, texte `#856404`
- `.etat-valide` : Fond vert `#d4edda`, bordure `#28a745`, texte `#155724`
- `.etat-verrouille` : Fond gris `#e9ecef`, bordure `#6c757d`, texte `#495057`

---

### 14. Contrôle de Verrouillage (.controle-verrouillage)

```css
.controle-verrouillage {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-left: 15px;
    padding: 4px 12px;
    background: rgba(255, 255, 255, 0.5);
    border-radius: 6px;
    border: 1px solid rgba(0, 0, 0, 0.1);
    font-size: 0.9rem;
}

.controle-verrouillage input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
    accent-color: var(--bleu-principal);
}
```

**Usage** : Contrôle compact pour verrouiller/déverrouiller des éléments (présences, etc.).

---

### 15. Éléments Sauvegardés (.element-sauvegarde)

```css
.element-sauvegarde {
    margin-bottom: 15px;
    padding: 15px;
    background: var(--bleu-tres-pale);
    border-radius: 6px;
    border: 1px solid var(--bleu-leger);
}
```

**Structure** :
- `.element-sauvegarde-header` : Flex space-between
- `.element-sauvegarde-titre` : Titre (bleu principal)
- `.element-sauvegarde-info` : Informations (0.9rem, gris)
- `.element-sauvegarde-date` : Date (0.85rem, gris léger)
- `.element-sauvegarde-source` : Source (orange accent)

**Liste vide** : `.liste-vide` (fond bleu très pale, centré, texte bleu leger)

---

### 16. Rétroactions (.retroaction-critere)

```css
.retroaction-critere {
    margin-bottom: 15px;
    padding: 10px;
    background: var(--bleu-tres-pale);
    border-left: 3px solid var(--bleu-moyen);
    border-radius: 4px;
}
```

**Sous-éléments** :
- `.retroaction-titre` : Titre du critère (bold, bleu principal)
- `.retroaction-texte` : Texte de rétroaction

---

### 17. Placeholder Graphique (.placeholder-graphique)

```css
.placeholder-graphique {
    background: var(--bleu-tres-pale);
    border: 2px dashed var(--bleu-pale);
    border-radius: 8px;
    padding: 40px 20px;
    text-align: center;
    color: var(--bleu-moyen);
    font-style: italic;
    margin: 20px 0;
}
```

**Usage** : Zone réservée pour futurs graphiques/diagrammes.

---

### 18. Chevron Rotatif (.chevron)

```css
.chevron {
    display: inline-block;
    transition: transform 0.3s ease;
    font-size: 0.8rem;
}

.chevron.expanded {
    transform: rotate(180deg);
}
```

**Usage** : Indicateur visuel pour sections collapsibles/toggles.

---

## 🎭 États des Composants

### États Globaux

| État | Sélecteur | Comportement |
|------|-----------|--------------|
| **Hover** | `:hover` | Changement de couleur, élévation, translation |
| **Active** | `.actif` | Fond différent, couleur texte, bordure accentuée |
| **Disabled** | `:disabled` | Opacité 0.5, cursor not-allowed |
| **Focus** | `:focus` | Border colorée, box-shadow subtil |
| **Expanded** | `.expanded` | Rotation 180° (chevrons), max-height augmenté |
| **Visible** | `.visible` | Opacité 1, max-height augmenté |

### États Spécifiques

#### Boutons
- **`:hover:not(:disabled)`** : Assombrissement de la couleur
- **`:disabled`** : Opacité 0.5, cursor not-allowed
- **`.actif`** : Fond et bordure distinctifs

#### Navigation
- **`.actif`** : Fond différent selon mode, bordure orange en bas

#### Inputs (Présences)
- **`.saisie-absence`** : Rouge léger
- **`.saisie-retard`** : Jaune
- **`.saisie-present`** : Vert léger
- **`.saisie-vide`** : Blanc

#### Sections/Toggles
- **`.expanded`** : Max-height augmenté, padding ajouté
- **`.visible`** : Opacité 1, max-height augmenté

---

## 🎨 Typographie

### Police
```css
font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
```

**Choix** : Polices système natives pour performance et cohérence avec l'OS.

---

### Tailles de Texte

| Usage | Taille | Line-height | Poids |
|-------|--------|-------------|-------|
| **Titre principal (h1)** | `2.8rem` | — | Bold |
| **Sous-titre (h2)** | `1.05rem` | — | Normal |
| **Titre de section** | `1.3rem` | — | Bold |
| **Titre de carte (h3)** | `1.1rem` | — | Normal |
| **Texte de base (body)** | `16px` (1rem) | `1.6` | Normal |
| **Texte de formulaire** | `0.95rem` | — | Normal |
| **Texte petit (labels)** | `0.85rem` | — | 500 |
| **Texte très petit** | `0.75rem` | — | 500 |
| **Méta-informations** | `0.7rem` | — | Normal |

---

### Couleurs de Texte

| Usage | Couleur | Variable |
|-------|---------|----------|
| **Texte principal** | `#333` | — |
| **Titre principal** | Bleu principal | `--bleu-principal` |
| **Texte secondaire** | Bleu leger | `--bleu-leger` |
| **Texte muted** | `#666` | — |
| **Texte très muted** | `#999` | — |
| **Texte blanc** | `white` | — |

---

### Hiérarchie Visuelle

1. **Titres principaux** : 2.8rem, bold, bleu principal ou blanc (en-tête)
2. **Titres de section** : 1.3rem, bold, bleu principal
3. **Titres de carte** : 1.1rem, normal, bleu principal
4. **Texte de base** : 16px, normal, #333
5. **Labels** : 0.85-0.9rem, 500, bleu principal ou moyen
6. **Méta/secondaire** : 0.7-0.75rem, normal, gris

---

## 📐 Layout et Grilles

### Conteneur Principal (.conteneur)
```css
.conteneur {
    max-width: 1400px;
    margin: 0 auto;
    background: white;
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(3, 46, 92, 0.1);
    overflow: hidden;
}
```

---

### Grilles Réutilisables

| Classe | Colonnes | Gap | Usage |
|--------|----------|-----|-------|
| `.grille-statistiques` | `repeat(auto-fit, minmax(250px, 1fr))` | `20px` | Cartes statistiques |
| `.grille-filtres` | `repeat(auto-fit, minmin(200px, 1fr))` | `20px` | Filtres |
| `.profil-sidebar-metriques-grille` | `1fr 1fr` | `8px` | Métriques sidebar |
| `.metriques-header` | `repeat(5, 1fr)` | `10px` | Métriques header profil |
| `.item-carte-grille-2col` | `1fr 1fr` | `10px` | Champs item (2 col) |
| `.item-carte-grille-3col` | `1fr 1fr 1fr` | `10px` | Champs item (3 col) |
| `.item-carte-grille-custom` | `1.5fr 1.5fr 1fr` | `10px` | Champs item custom |
| `.formulaire-ajout-grid` | `1fr 0.7fr 1.5fr...` | `10px` | Formulaire ajout groupe |

---

### Conteneurs Flex

| Classe | Direction | Justify | Align | Gap |
|--------|-----------|---------|-------|-----|
| `.btn-groupe` | row | — | — | `10px` |
| `.entete-conteneur` | row | — | center | `30px` |
| `.navigation-principale` | row | center | — | `0` |
| `.sous-navigation` | row | — | — | `10px` |
| `.item-carte-header` | row | space-between | center | — |
| `.carte-cible-header` | row | space-between | center | — |
| `.profil-nav-item-ligne` | row | space-between | center | — |

---

### Espacements Standardisés

**Padding des cartes** :
- Carte standard : `20px` (`--espacement-moyen`)
- Item carte : `12px`
- Carte métrique : `12px 15px`
- Modal : `30px`

**Marges** :
- Entre cartes : `20px` (`--espacement-moyen`)
- Entre sections : `30px` (`--espacement-grand`)

---

### Responsive Breakpoints

| Breakpoint | Largeur | Changements |
|------------|---------|-------------|
| **Desktop** | `> 1024px` | Layout complet, grilles complètes |
| **Tablette** | `768px - 1024px` | Grilles réduites, sidebar 280px |
| **Mobile** | `< 768px` | Single column, grilles simplifiées |
| **Petit mobile** | `< 480px` | Textes réduits, padding réduit |

**Adaptations principales** :
- **< 1200px** : Formulaire ajout groupe passe à 5 colonnes
- **< 1024px** : Profil layout 2 col (280px 1fr)
- **< 768px** :
  - Profil layout 1 colonne
  - Navigation flex-wrap
  - Grilles statistiques 1fr
  - Tableaux font-size réduite
- **< 480px** :
  - Titres réduits
  - Cartes statistiques valeur 2rem

---

## 🎨 Thèmes par Mode

L'application supporte 3 modes avec des thèmes visuels distincts appliqués via `body[data-mode="..."]`.

### Mode Normal (par défaut)
```css
body[data-mode="normal"] .entete {
    background: linear-gradient(135deg, #032e5c 0%, #0f1e3a 100%);
}
```

**Couleurs** :
- En-tête : Gradient bleu principal → bleu foncé
- Navigation : Bleu principal
- Navigation active : `#2a4a8a`
- Sous-navigation : Fond `#e8f2fd`
- Sous-navigation active : Bleu principal

---

### Mode Simulation
```css
body[data-mode="simulation"] .entete {
    background: linear-gradient(135deg, #0f1e3a 0%, #071428 100%);
}
```

**Couleurs** :
- En-tête : Gradient bleu nuit → noir bleuté (plus sombre)
- Navigation : `#0f1e3a`
- Navigation active : `#2a3d5a`
- Sous-navigation : Fond `#dce8f5`
- Sous-navigation active : Bleu simulation

**Usage** : Mode pour simuler des scénarios sans affecter les données réelles.

---

### Mode Anonymisation
```css
body[data-mode="anonymisation"] .entete {
    background: linear-gradient(135deg, #1a5266 0%, #0d3540 100%);
}
```

**Couleurs** :
- En-tête : Gradient sarcelle → sarcelle foncé
- Navigation : `#1a5266`
- Navigation active : `#2a6a7a`
- Sous-navigation : Fond `#e0f0f0`
- Sous-navigation active : Bleu anonymisation

**Usage** : Mode pour afficher les données en masquant les identités des étudiants.

---

## 🎬 Animations

### Animations Définies

| Nom | Effet | Durée | Easing |
|-----|-------|-------|--------|
| `fadeIn` | Opacité 0 → 1 | — | — |
| `apparition` | Opacity 0 + translateY(10px) → 1 + 0 | 0.3s | ease |
| `slideDown` | Opacity 0, max-height 0 → 1, 1000px | 0.3s | ease |
| `slideIn` | translateX(400px) → 0, opacity 0 → 1 | 0.3s | ease |

---

### Transitions Appliquées

| Élément | Propriétés | Durée |
|---------|------------|-------|
| `.btn` | `all` | 0.2s |
| `.carte-statistique` | `all` | 0.2s ease |
| `.carte-metrique` | `all` | 0.2s ease |
| `.navigation-principale button` | `all` | 0.3s |
| `.sous-navigation button` | `all` | 0.2s |
| `.controle-form` | `border-color` | 0.2s |
| `.section-collapsible-content` | `max-height` | 0.4s ease-in-out |
| `.details-techniques` | `max-height` | 0.3s ease |
| `.chevron` | `transform` | 0.3s ease |
| `#enteteDateSeance` | `all` | 0.3s ease |
| `.metrique-sidebar` | `all` | 0.2s |
| `input[type="number"].controle-form` | `background-color, border-color` | 0.3s ease |

---

### Effets Hover Typiques

- **Cartes** : Élévation (box-shadow), translation -1px/-2px, changement de fond
- **Boutons** : Assombrissement de la couleur de base
- **Navigation** : Fond rgba blanc 0.1/0.25, couleur blanche
- **Tableaux** : Fond bleu très pale sur lignes

---

## 🛠️ Classes Utilitaires

### Marges

| Classe | Valeur | Usage |
|--------|--------|-------|
| `.mt-1` | `margin-top: 10px` | Petite marge top |
| `.mt-2` | `margin-top: 20px` | Marge top moyenne |
| `.mt-3` | `margin-top: 30px` | Grande marge top |
| `.mb-1` | `margin-bottom: 10px` | Petite marge bottom |
| `.mb-2` | `margin-bottom: 20px` | Marge bottom moyenne |
| `.mb-3` | `margin-bottom: 30px` | Grande marge bottom |

**Limitations** : Pas de classes pour left/right, pas de padding, pas de ml/mr.

---

### Texte

| Classe | Effet |
|--------|-------|
| `.text-muted` | Couleur bleu leger, taille 0.9rem, margin-bottom moyen |
| `.texte-centre` | `text-align: center` |

**Limitations** : Pas de classes pour left/right/justify, pas de font-weight, pas de font-size.

---

### Affichage

**Sections** :
- `.section` : `display: none` par défaut
- `.section.active` : `display: block` + animation apparition
- `.sous-section` : `display: none` par défaut
- `.sous-section.active` : `display: block` + animation apparition

---

## 🖨️ Impression

```css
@media print {
    /* Masquer éléments interactifs */
    .navigation-principale,
    .sous-navigation,
    .btn,
    .statut-sauvegarde {
        display: none !important;
    }

    /* Fond blanc, pas de shadow */
    body { background: white; padding: 0; }
    .conteneur { box-shadow: none; border-radius: 0; }

    /* En-tête sobre */
    .entete {
        background: white;
        color: var(--bleu-principal);
        border-bottom: 2px solid var(--bleu-principal);
    }

    /* Éviter coupures */
    .carte { break-inside: avoid; }
}
```

---

## ⚠️ Observations et Points d'Attention

### 1. Animations Dupliquées
L'animation `slideDown` est définie **deux fois** :
- Ligne 510-520 : `slideDown` (opacity, translateY)
- Ligne 690-699 : `slideDown` (opacity, max-height)

**Impact** : La seconde définition écrase la première. Seule la version max-height est utilisée.

**Recommandation** : Renommer l'une des animations (ex: `slideDownTranslate` vs `slideDownExpand`) ou supprimer la redondance.

---

### 2. Classes Utilitaires Limitées
Actuellement, seules les marges verticales sont couvertes (.mt-1/2/3, .mb-1/2/3).

**Manquant** :
- Marges horizontales (ml, mr, mx)
- Padding (p, pt, pb, pl, pr, px, py)
- Display (d-flex, d-block, d-none, d-inline)
- Flexbox (justify-content, align-items, flex-direction)
- Grid utilities
- Font weights (fw-bold, fw-normal, fw-light)
- Font sizes (fs-sm, fs-lg, etc.)

**Recommandation** : Créer une section d'utilitaires plus complète pour réduire les styles inline et améliorer la maintenabilité.

---

### 3. Variables CSS Non Utilisées
La variable `--nav-bg: #f8f9fa` est définie mais jamais utilisée dans le CSS.

**Recommandation** : Supprimer ou documenter son usage prévu.

---

### 4. Redondance dans les Cartes
Plusieurs variantes de cartes avec des styles très similaires :
- `.carte`
- `.carte-statistique`
- `.carte-metrique`
- `.item-carte`
- `.carte-cible-intervention`

**Recommandation** : Créer une classe de base `.carte-base` avec les styles communs, puis des modificateurs pour les variantes.

---

### 5. Codes Couleur en Dur
Certaines couleurs sont définies directement dans les styles au lieu d'utiliser des variables :
- `#333` (texte principal)
- `#666`, `#999` (textes secondaires)
- Couleurs spécifiques dans `.badge-note` (ex: `#1a5f1a`, `#7a5900`)

**Recommandation** : Créer des variables pour toutes les couleurs récurrentes.

---

### 6. Responsiveness des Métriques Header
`.metriques-header` passe de 5 colonnes à 2 colonnes sur mobile (< 768px), ce qui peut créer un saut visuel important.

**Recommandation** : Ajouter un breakpoint intermédiaire (3 colonnes sur tablette portrait).

---

### 7. Z-Index Non Standardisé
Plusieurs valeurs de z-index sans système cohérent :
- `.modal-overlay` : `1000`
- `.notification-succes` : `9999`
- `.titre-section` : `1`

**Recommandation** : Créer une échelle de z-index en variables CSS :
```css
--z-base: 1;
--z-dropdown: 100;
--z-sticky: 500;
--z-modal: 1000;
--z-notification: 2000;
--z-tooltip: 3000;
```

---

### 8. États de Formulaire Incomplets
Les inputs n'ont pas d'états `:invalid`, `:valid`, ou de styles pour les messages d'erreur.

**Recommandation** : Ajouter des styles pour :
- `.controle-form:invalid`
- `.controle-form.erreur`
- `.message-erreur` (texte d'erreur sous les champs)

---

### 9. Accessibilité
Certains éléments interactifs pourraient bénéficier d'améliorations :
- Pas de styles `:focus-visible` (distinction clavier vs souris)
- Contrastes de couleurs à vérifier (ex: texte bleu leger sur fond blanc)
- Pas d'indicateurs visuels pour `aria-*` states

**Recommandation** :
- Ajouter `:focus-visible` pour meilleure UX clavier
- Vérifier les ratios de contraste WCAG 2.1 AA (4.5:1)
- Ajouter des styles pour `[aria-disabled]`, `[aria-expanded]`, etc.

---

### 10. Performance
Le fichier CSS fait 1978 lignes, ce qui est raisonnable, mais pourrait être optimisé :
- Certains sélecteurs sont très spécifiques (ex: `#tbody-saisie-presences input[type="number"]:placeholder-shown`)
- Possibilité de minification et tree-shaking

**Recommandation** : Considérer un système de build pour production (minification, purge des styles non utilisés).

---

### 11. Documentation Inline
Certains composants complexes (comme `.profil-layout-2col` ou `.item-carte-grille`) manquent de commentaires expliquant leur usage.

**Recommandation** : Ajouter des commentaires `/* Usage: ... */` pour les composants avec structure complexe.

---

### 12. Classes Calendrier Incomplètes
Les classes de calendrier sont définies mais peu documentées :
- `.cal-jour-cours`
- `.cal-jour-cours-reel`
- `.cal-jour-conge`
- `.cal-jour-evaluation`

**Recommandation** : Créer une section dédiée avec documentation des usages.

---

## ✅ Recommandations Prioritaires

### 🔴 Priorité Haute

1. **Corriger la duplication d'animation `slideDown`**
   - Renommer ou supprimer une des deux définitions
   - Impact : Éviter confusion et bugs potentiels

2. **Créer des variables pour couleurs en dur**
   ```css
   --texte-principal: #333;
   --texte-secondaire: #666;
   --texte-muted: #999;
   --note-intermediaire-texte: #1a5f1a;
   --note-developpement-texte: #7a5900;
   ```

3. **Améliorer l'accessibilité clavier**
   - Ajouter `:focus-visible` sur tous les éléments interactifs
   - Exemple :
   ```css
   .btn:focus-visible {
       outline: 3px solid var(--bleu-clair);
       outline-offset: 2px;
   }
   ```

4. **Standardiser le z-index**
   - Créer une échelle cohérente en variables
   - Appliquer uniformément dans tout le CSS

---

### 🟡 Priorité Moyenne

5. **Étendre les classes utilitaires**
   - Ajouter padding (p-1/2/3, pt, pb, pl, pr, px, py)
   - Ajouter marges horizontales (ml, mr, mx)
   - Ajouter display (d-flex, d-none, d-block, d-inline-block)
   - Ajouter flexbox (justify-*, align-*, flex-*)

6. **Améliorer le responsive des métriques**
   - Ajouter breakpoint intermédiaire (3 colonnes à 1024px)
   ```css
   @media (max-width: 1024px) and (min-width: 769px) {
       .metriques-header {
           grid-template-columns: repeat(3, 1fr);
       }
   }
   ```

7. **Documenter les composants complexes**
   - Ajouter commentaires d'usage pour :
     - `.profil-layout-2col`
     - `.item-carte-grille-*`
     - `.formulaire-ajout-grid`
     - Classes calendrier

8. **Ajouter états de validation de formulaire**
   ```css
   .controle-form:invalid,
   .controle-form.erreur {
       border-color: var(--risque-critique);
       box-shadow: 0 0 0 3px rgba(114, 28, 36, 0.1);
   }

   .message-erreur {
       color: var(--risque-critique);
       font-size: 0.85rem;
       margin-top: 5px;
   }
   ```

---

### 🟢 Priorité Basse

9. **Optimiser la structure des cartes**
   - Créer `.carte-base` avec styles communs
   - Modificateurs : `.carte--statistique`, `.carte--metrique`, etc.

10. **Nettoyer les variables non utilisées**
    - Supprimer `--nav-bg` ou documenter son usage futur

11. **Minification et build process**
    - Considérer un système de build pour production
    - PurgeCSS pour supprimer styles non utilisés
    - Minification pour réduire taille de fichier

12. **Créer une section dark mode**
    - Préparer le système pour un futur mode sombre
    - Variables CSS facilitent déjà cette transition

---

## 📋 Checklist de Maintenance

### Avant chaque modification majeure
- [ ] Vérifier que les noms sont cohérents avec `noms_stables.json`
- [ ] Tester dans Safari ET Chrome (OS de dev : macOS)
- [ ] Vérifier le responsive sur 3 tailles (desktop, tablette, mobile)
- [ ] Valider les contrastes de couleurs (WCAG AA minimum)
- [ ] Documenter les nouveaux composants avec commentaires

### Lors de l'ajout de nouveaux composants
- [ ] Vérifier si un composant existant peut être réutilisé
- [ ] Utiliser les variables CSS pour toutes les couleurs
- [ ] Prévoir les états hover/active/disabled dès le départ
- [ ] Créer des variantes plutôt que dupliquer le code
- [ ] Ajouter à cette documentation

### Lors de modifications de couleurs
- [ ] Mettre à jour la variable CSS, pas les valeurs en dur
- [ ] Tester l'impact sur les 3 modes (normal/simulation/anonymisation)
- [ ] Vérifier les contrastes avec WebAIM Contrast Checker
- [ ] Documenter le changement dans le changelog

---

## 📚 Ressources et Références

### Standards Suivis
- **Convention de nommage** : 100% français (respect du projet)
- **Méthodologie** : BEM-like (Block Element Modifier adapté)
- **Architecture** : ITCSS-inspired (Inverted Triangle CSS)

### Compatibilité Cible
- Safari (macOS Sequoia 15.5, iPadOS 18.5)
- Chrome (moderne)
- Firefox (moderne)
- Edge (moderne)

### Outils Recommandés
- **Validation CSS** : W3C CSS Validator
- **Contraste** : WebAIM Contrast Checker
- **Responsive** : Chrome DevTools Device Mode
- **Accessibilité** : axe DevTools

---

## 📝 Changelog du Design System

### Beta 0.50 (16 octobre 2025)
- État actuel documenté dans cet audit
- Refonte du profil étudiant (layout 2 colonnes)
- Amélioration accessibilité (états disabled, hover:not(:disabled))
- Sections collapsibles et toggles de détails
- Support multi-thèmes (3 modes)

### Versions antérieures
(À documenter lors des prochaines mises à jour)

---

## 🎯 Conclusion

Le Design System de l'application de monitorage pédagogique est **solide et bien structuré**, avec une architecture CSS cohérente et maintenable. Les forces principales sont :

✅ **Variables CSS bien organisées** permettant une customisation facile
✅ **Composants modulaires** réutilisables dans toute l'application
✅ **Support multi-thèmes** avec dégradés personnalisés
✅ **Responsive design** avec breakpoints appropriés
✅ **Convention 100% français** respectée

Les améliorations prioritaires concernent principalement :

🔴 **Accessibilité** (focus-visible, contrastes)
🔴 **Standardisation** (z-index, animations dupliquées)
🟡 **Classes utilitaires** (padding, display, flexbox)
🟡 **Documentation inline** (commentaires d'usage)

Avec ces améliorations, le Design System sera prêt pour une version **1.0 stable** et pourra évoluer vers des fonctionnalités avancées (dark mode, thèmes personnalisés, etc.).

---

**Document généré le** : 24 octobre 2025
**Audit réalisé par** : Claude Code
**Prochaine révision recommandée** : Après implémentation des recommandations prioritaires haute
