# Guide Complet des Barres de Gradient

Application Monitorage v6 | 19 novembre 2025

---

## Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Barres A-C-P-E](#barres-a-c-p-e)
3. [Barres Patterns](#barres-patterns)
4. [Barres RàI](#barres-rai)
5. [Points de distribution (Scatter Plots)](#points-de-distribution)
6. [Barres d'engagement](#barres-dengagement)
7. [Barres SRPNF](#barres-srpnf)
8. [Implémentation technique](#implémentation-technique)
9. [Dépannage](#dépannage)

---

## Vue d'ensemble

L'application utilise un **système de gradients harmonisés** basé sur un spectre lumineux pour visualiser les données pédagogiques :

- **Orange** → Faible/Sommatif
- **Vert** → Moyen/Stable
- **Bleu** → Excellent/Portfolio
- **Indigo/Mauve** → Intensif/RàI Niveau 3

### Système de "Nuit Élégante"

Toutes les barres incluent un **overlay semi-transparent** qui assombrit légèrement le gradient pour une meilleure lisibilité :

```css
background: rgba(15, 30, 58, 0.2);    /* ACPE */
background: rgba(15, 30, 58, 0.35);   /* Patterns */
background: rgba(15, 30, 58, 0.4);    /* RàI */
```

---

## Barres A-C-P-E

### Description
Affichent les **quatre indices principaux** :
- **A** : Assiduité (présence en classe)
- **C** : Complétion (remise des travaux)
- **P** : Performance (qualité des productions)
- **E** : Engagement (E = A × C × P)

### Spécifications CSS

**Fichier:** `styles.css:6649-6674`

```css
.barre-indicateur {
    height: 40px;
    border-radius: 20px;
    position: relative;
    background: linear-gradient(to right, 
        #ff8c00 0%,   /* Orange foncé */
        #ffa500 10%,  /* Orange */
        #98d025 30%,  /* Vert citron */
        #22c55e 50%,  /* Vert */
        #14b8a6 65%,  /* Cyan/Sarcelle */
        #06b6d4 80%,  /* Bleu ciel clair */
        #0ea5e9 100%  /* Bleu ciel */
    );
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.barre-indicateur-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(15, 30, 58, 0.2);
    border-radius: 20px;
    pointer-events: none;
}
```

### Gradient détaillé

| Position | Couleur | Code | Signification |
|----------|---------|------|---|
| 0% | Orange foncé | `#ff8c00` | Très faible (0-20%) |
| 10% | Orange | `#ffa500` | Faible (20-35%) |
| 30% | Vert citron | `#98d025` | Moyen-bas (35-50%) |
| 50% | Vert | `#22c55e` | Moyen-bon (50-65%) |
| 65% | Cyan | `#14b8a6` | Bon (65-80%) |
| 80% | Bleu ciel clair | `#06b6d4` | Très bon (80-90%) |
| 100% | Bleu ciel | `#0ea5e9` | Excellent (90-100%) |

### Utilisation en JS

**Fichier:** `tableau-bord-apercu.js:1080-1228`

```javascript
function genererBarreAcpe(valeur_som, valeur_pan, afficherSom, afficherPan) {
    // Mappe 30-100% sur 0-100% de la barre
    const position = Math.max(0, Math.min((valeur - 0.30) / 0.70 * 100, 100));
    
    // Génère points SOM/PAN avec jitter
    const jitterH = (Math.random() - 0.5) * 3.0;    // ±1.5%
    const jitterV = (Math.random() - 0.5) * 24;     // ±12px
    
    // Positionne point final
    const positionFinale = Math.max(0, Math.min(position + jitterH, 100));
    
    return `<div class="barre-etudiant barre-etudiant-som"
                style="left: ${positionFinale}%; top: calc(50% + ${jitterV}px);"
                ...></div>`;
}
```

### Exemple visuel

```
    0%                      50%                    100%
    |                        |                       |
    [████ faible ████ moyen ████ bon ████ excellent]
    Orange              Vert            Bleu
```

---

## Barres Patterns

### Description
Affichent la **répartition des patterns d'apprentissage** (4 zones) :
- **Progression/Stable** (0-25%, Vert) - Excellence
- **Défi spécifique** (25-50%, Cyan) - Bon
- **Blocage émergent** (50-75%, Bleu) - Moyen
- **Blocage critique** (75-100%, Indigo) - Critique

### Spécifications CSS

**Fichier:** `styles.css:6678-6701`

```css
.barre-patterns {
    height: 30px;
    border-radius: 15px;
    position: relative;
    background: linear-gradient(to right, 
        #22c55e 0%,   /* Vert */
        #14b8a6 25%,  /* Cyan/Sarcelle */
        #0ea5e9 50%,  /* Bleu ciel */
        #3b82f6 75%,  /* Bleu */
        #6366f1 100%  /* Indigo */
    );
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.barre-patterns-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(15, 30, 58, 0.35);
    border-radius: 15px;
    pointer-events: none;
}
```

### Positions des zones

| Pattern | Position | Couleur | Code |
|---------|----------|---------|------|
| Progression | 12.5% | Vert | `#1bbd7e` |
| Défi | 37.5% | Cyan | `#11aec5` |
| Blocage émergent | 62.5% | Bleu | `#2994ee` |
| Blocage critique | 87.5% | Indigo | `#4f74f3` |

### Positionnement des points

**Fichier:** `tableau-bord-apercu.js:1240-1330`

```javascript
// SOM à GAUCHE de chaque zone (position - 2%)
const decalageH_SOM = -2;

// PAN à DROITE de chaque zone (position + 2%)
const decalageH_PAN = 2;

// Jitter commun
const jitterH = (Math.random() - 0.5) * 3.0;    // ±1.5%
const jitterV = (Math.random() - 0.5) * 24;     // ±12px

// Positionnement final
const positionFinale = Math.max(0, Math.min(position + decalage + jitterH, 100));
```

### Exemple visuel

```
    Vert (Stable)      Cyan (Défi)      Bleu (Émergent)      Indigo (Critique)
         ↓                  ↓                  ↓                     ↓
    [█████ │ ● ●│ █████ │ ● ●│ █████ │ ● ●│ █████]
           SOM PAN        SOM PAN        SOM PAN
```

---

## Barres RàI

### Description
Affichent les **niveaux d'intervention RàI** (3 niveaux) :
- **Niveau 1** (Universel) : Suivi régulier en classe
- **Niveau 2** (Préventif) : Interventions préventives en classe
- **Niveau 3** (Intensif) : Interventions intensives individuelles

### Spécifications CSS

**Fichier:** `styles.css:6705-6728`

```css
.barre-rai {
    height: 30px;
    border-radius: 15px;
    position: relative;
    background: linear-gradient(to right, 
        #0ea5e9 0%,   /* Bleu ciel */
        #3b82f6 25%,  /* Bleu */
        #6366f1 50%,  /* Indigo */
        #8b5cf6 75%,  /* Violet */
        #6b21a8 100%  /* Mauve foncé */
    );
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.barre-rai-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(15, 30, 58, 0.4);
    border-radius: 15px;
    pointer-events: none;
}
```

### Positions des niveaux

| Niveau | Position | Couleur | Code |
|--------|----------|---------|------|
| Niveau 1 (Universel) | 16.5% | Vert | `#1bbd7e` |
| Niveau 2 (Préventif) | 49.5% | Jaune | `#FFB800` |
| Niveau 3 (Intensif) | 83% | Orange | `#FF8A50` |

### Gradient détaillé

- **0-33%** : Bleu ciel → Bleu (Niveau 1 - Universel)
- **33-66%** : Indigo → Violet (Niveau 2 - Préventif)
- **66-100%** : Violet → Mauve foncé (Niveau 3 - Intensif)

### Exemple visuel

```
    Univers.    Prév.       Intensif
       ↓          ↓            ↓
    [█ Bleu ██ Indigo ██ Mauve █]
       Niv 1      Niv 2       Niv 3
```

---

## Points de distribution

### Description
Affichent les **positions individuelles des étudiants** sur les barres (scatter plots).

Chaque étudiant est représenté par un petit cercle :
- **Orange** (`#ff6f00`) pour SOM (Sommatif)
- **Bleu** (`#0277bd`) pour PAN (Portfolio)

### Spécifications CSS

**Fichier:** `styles.css:6420-6470`

```css
/* Animation subtile de flottement (au hover seulement) */
@keyframes float-subtle {
    0%, 100% {
        transform: translate(-50%, -50%) translateX(0px) translateY(0px) scale(1.5);
    }
    25% {
        transform: translate(-50%, -50%) translateX(1px) translateY(-1px) scale(1.5);
    }
    50% {
        transform: translate(-50%, -50%) translateX(0px) translateY(-2px) scale(1.5);
    }
    75% {
        transform: translate(-50%, -50%) translateX(-1px) translateY(-1px) scale(1.5);
    }
}

.barre-etudiant {
    position: absolute;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.2s ease;
    z-index: 10;
    transform: translate(-50%, -50%);
    top: 50%;
    border: 1px solid white;
    box-shadow: 0 1px 2px rgba(0,0,0,0.15);
}

.barre-etudiant:hover {
    z-index: 20;
    border-width: 2px;
    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    animation: float-subtle 7s ease-in-out infinite;
}

.barre-etudiant-som {
    background: var(--som-orange);   /* #ff6f00 */
    opacity: 1;
}

.barre-etudiant-pan {
    background: var(--pan-bleu);     /* #0277bd */
    opacity: 1;
}
```

### Caractéristiques des points

| Propriété | Valeur | Notes |
|-----------|--------|-------|
| Diamètre | 8px | Lisible sur mobile |
| Bordure | 1px blanc | 2px blanc au hover |
| Ombre | 0 1px 2px | 0 2px 6px au hover |
| Transform | translate(-50%, -50%) | Centre le point |
| Positionnement | top: 50% | Vertical center |
| Z-index | 10 | 20 au hover |
| Animation | float-subtle 7s | Au hover uniquement |
| Jitter H | ±1.5% | Dilate agglomérations |
| Jitter V | ±12px | Dilate agglomérations |

### Animation au hover

- **Mouvement horizontal** : ±1px
- **Mouvement vertical** : -2px maximum
- **Échelle** : scale(1.5) constant (1.5x plus grand)
- **Durée** : 7 secondes
- **Timing** : ease-in-out infini

### Exemple visuel

```
Barre avec points:
┌─────────────────────────────────────────┐
│ ● ●  ●  ●●  ●  ● ●●  ●  ● ●  ●  ●●  │
│ SOM/PAN points agglomérés               │
└─────────────────────────────────────────┘

Au hover sur un point:
  ○ (grossi à ~12px)
  ↑↑ animation de flottement
```

---

## Barres d'engagement

### Description
Affichent le **niveau d'engagement** (E = A × C × P) de chaque étudiant.

Quatre zones :
- **Fragile** (0.30-0.49) : Orange
- **Modéré** (0.50-0.64) : Jaune
- **Favorable** (0.65-0.79) : Vert
- **Très favorable** (≥ 0.80) : Bleu

### Spécifications CSS

**Fichier:** `styles.css:5451-5533`

```css
.profil-echelle-barre {
    position: relative;
    height: 12px;
    border-radius: 6px;
    /* Gradient défini dynamiquement en JS */
}

/* Gradient dynamique (depuis JS) */
background: linear-gradient(to right,
    #ff9800 0%,      /* Orange - Fragile */
    #ffc107 25%,     /* Jaune - Modéré */
    #28a745 50%,     /* Vert - Favorable */
    #2196F3 75%      /* Bleu - Très favorable */
);

.profil-echelle-point {
    position: absolute;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    top: 50%;
    border: 2px solid white;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    cursor: pointer;
    transition: all 0.2s ease;
    z-index: 10;
}

.profil-echelle-point-som {
    background: var(--som-orange);   /* #ff6f00 */
}

.profil-echelle-point-pan {
    background: var(--pan-bleu);     /* #0277bd */
}

.profil-echelle-point:hover {
    width: 16px;
    height: 16px;
    z-index: 20;
    box-shadow: 0 3px 6px rgba(0,0,0,0.3);
}
```

### Zones d'engagement

| Zone | Seuil | Position | Couleur | Code |
|------|-------|----------|---------|------|
| Fragile | 0.30-0.49 | 12.5% | Orange | `#ff9800` |
| Modéré | 0.50-0.64 | 37.5% | Jaune | `#ffc107` |
| Favorable | 0.65-0.79 | 62.5% | Vert | `#28a745` |
| Très fav. | ≥ 0.80 | 87.5% | Bleu | `#2196F3` |

### Utilisation en JS

**Fichier:** `profil-etudiant.js:1280-1330`

```javascript
// E = A × C × P (engagement)
const E = A * C * P;

// Mapper 0.30-1.00 sur 0-100%
const position = Math.max(0, Math.min((E - 0.30) / 0.70 * 100, 100));

// Barre HTML
return `
    <div class="profil-echelle-barre" style="background: linear-gradient(...);">
        <div class="profil-echelle-point profil-echelle-point-som" 
             style="left: ${position_som}%;"></div>
        <div class="profil-echelle-point profil-echelle-point-pan" 
             style="left: ${position_pan}%;"></div>
    </div>
`;
```

---

## Barres SRPNF

### Description
Affichent les **moyennes SRPNF** (5 critères d'évaluation) pour chaque étudiant.

Critères :
- **S**tructure (15%)
- **R**igueur (20%)
- **P**lausibilité (10%)
- **N**uance (25%)
- **F**rançais (30%)

### Spécifications CSS

**Fichier:** `styles.css:5957-6030`

```css
.critere-barre {
    flex: 1;
    height: 8px;
    background: #e9ecef;
    border-radius: 4px;
    margin: 0 15px;
    position: relative;
    overflow: hidden;
}

.critere-barre-fill {
    height: 100%;
    /* Couleur définie dynamiquement selon le niveau IDME (I/D/M/E) */
    border-radius: 4px;
    transition: width 0.3s ease;
}

.critere-barre-gradient {
    position: relative;
    height: 12px;
    border-radius: 6px;
    /* Gradient défini dynamiquement en JS selon échelles personnalisées */
}

.critere-point {
    position: absolute;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    top: 50%;
    background: #333;
    border: 2px solid white;
    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    cursor: pointer;
    transition: all 0.2s ease;
    z-index: 10;
}

.critere-point:hover {
    width: 16px;
    height: 16px;
    z-index: 20;
}
```

### Niveaux IDME

| Niveau | Code | Couleur | Seuil % |
|--------|------|---------|---------|
| Insuffisant | I | Orange | < 64% |
| Développement | D | Jaune | 65-74% |
| Maîtrisé | M | Vert | 75-84% |
| Étendu | E | Bleu | ≥ 85% |
| Nul | 0 | Gris | 0% |

### Gradient SRPNF

Les gradients sont **dynamiquement générés en JS** selon l'échelle personnalisée :

```javascript
// Exemple: gradient I → D → M → E
background: linear-gradient(to right,
    #ff6f00 0%,      /* I - Insuffisant */
    #FFB800 25%,     /* D - Développement */
    #28a745 50%,     /* M - Maîtrisé */
    #2196F3 100%     /* E - Étendu */
);
```

---

## Implémentation technique

### Variables CSS

**Fichier:** `styles.css` (top du fichier)

```css
/* Couleurs des pratiques */
--som-orange: #ff6f00;     /* Sommatif */
--pan-bleu: #0277bd;       /* Portfolio */
--hybride-violet: #9c27b0; /* Réservé futur */
```

### Utilisation en HTML

```html
<!-- Barre ACPE simple -->
<div style="position: relative;">
    <div class="barre-indicateur">
        <div class="barre-indicateur-overlay"></div>
        <!-- Points étudiants positionnés avec .barre-etudiant -->
    </div>
</div>

<!-- Barre Patterns avec légende -->
<div class="distribution-container">
    <h4 class="tb-titre-metrique">Répartition des patterns</h4>
    <div style="position: relative;">
        <div class="barre-patterns">
            <div class="barre-patterns-overlay"></div>
            <!-- Points SOM/PAN -->
        </div>
    </div>
    <div class="distribution-legende">
        <span style="left: 12.5%; color: #1bbd7e;">Stable</span>
        <span style="left: 37.5%; color: #11aec5;">Défi</span>
        <span style="left: 62.5%; color: #2994ee;">Émergent</span>
        <span style="left: 87.5%; color: #4f74f3;">Critique</span>
    </div>
</div>
```

### Fonction JS générant les points

```javascript
function genererBarreAcpe(etudiantsSOM, etudiantsPAN, afficherSom, afficherPan) {
    let lignes = '';
    
    if (afficherSom && etudiantsSOM.length > 0) {
        etudiantsSOM.forEach(e => {
            // Mapper 0.30-1.00 sur 0-100%
            const position = (e.valeur - 0.30) / 0.70 * 100;
            
            // Jitter aléatoire
            const jitterH = (Math.random() - 0.5) * 3.0;
            const jitterV = (Math.random() - 0.5) * 24;
            
            // Position finale contrainte
            const positionFinale = Math.max(0, Math.min(position + jitterH, 100));
            
            // Créer point
            lignes += `<div class="barre-etudiant barre-etudiant-som"
                style="left: ${positionFinale}%; top: calc(50% + ${jitterV}px);"
                data-da="${e.da}"
                data-nom="${e.nom}, ${e.prenom}"
                data-valeur="${Math.round(e.valeur * 100)}%"
                title="${e.nom} : ${Math.round(e.valeur * 100)}%"></div>`;
        });
    }
    
    return `<div style="position: relative;">
                <div class="barre-indicateur">
                    <div class="barre-indicateur-overlay"></div>
                    ${lignes}
                </div>
            </div>`;
}
```

---

## Dépannage

### Points non visibles

**Problème** : Les points étudiants n'apparaissent pas sur la barre.

**Solutions** :
1. Vérifier que `afficherSom` ou `afficherPan` est `true`
2. Vérifier que le tableau d'étudiants n'est pas vide
3. Vérifier que la position est bien calculée : `0 <= position <= 100`
4. Vérifier la valeur du `z-index` (doit être 10+)
5. Vérifier que le conteneur parent a `position: relative`

### Gradient ne s'affiche pas correctement

**Problème** : Le gradient est mono-couleur ou abrupt.

**Solutions** :
1. Vérifier la syntaxe `linear-gradient(to right, ...)`
2. Vérifier les pourcentages (0%, 25%, 50%, 75%, 100%)
3. Vérifier les codes couleur hexadécimaux (format `#RRGGBB`)
4. Vérifier que l'overlay ne cache pas le gradient (vérifier `opacity` et `pointer-events`)
5. Forcer le refresh du navigateur (Cmd+Maj+R sur macOS)

### Animation ne s'active pas au hover

**Problème** : L'animation `float-subtle` ne joue pas au survol.

**Solutions** :
1. Vérifier que `.barre-etudiant:hover` a `animation: float-subtle`
2. Vérifier que `@keyframes float-subtle` est défini
3. Vérifier que le point a `cursor: pointer`
4. Tester avec un autre navigateur
5. Vérifier la console pour les erreurs CSS

### Points se superposent trop

**Problème** : Les points SOM et PAN au même niveau se chevauchent trop.

**Solutions** :
1. Augmenter le jitter horizontal : `(Math.random() - 0.5) * 4.0` (au lieu de 3.0)
2. Ajouter décalage horizontal explicite : SOM -3%, PAN +3% (au lieu de -2%, +2%)
3. Réduire la taille des points : `width: 6px; height: 6px` (au lieu de 8px)
4. Augmenter le jitter vertical : `(Math.random() - 0.5) * 32` (au lieu de 24)

### Barre trop large/étroite en responsive

**Problème** : La barre s'étire trop ou rétrécit trop en mobile.

**Solutions** :
1. Vérifier que `.distribution-container` a `width: 100%`
2. Ajouter `max-width` au conteneur parent
3. Ajouter `padding: 0 15px` au lieu de pas de padding
4. Tester avec l'inspecteur responsive du navigateur

### Couleurs différentes selon le navigateur

**Problème** : Les couleurs ne s'affichent pas comme prévu.

**Solutions** :
1. Utiliser les codes hexadécimaux stricts (ex: `#ff6f00` au lieu de `#FF6F00`)
2. Vérifier la profondeur des couleurs du moniteur
3. Activer/désactiver le color management du navigateur
4. Tester sur un autre navigateur ou appareil
5. Vérifier que les overlay ne décalent pas la teinte

---

## Références

- **Fichier CSS principal** : `/styles.css`
- **Fichier JS tableau-bord** : `/js/tableau-bord-apercu.js`
- **Fichier JS profil** : `/js/profil-etudiant.js`
- **Document texte détaillé** : `STYLES_BARRES_CSS_GRADIENT.txt`
- **Page de référence visuelle** : `REFERENCE_BARRES_VISUELLES.html`

---

*Document généré le 19 novembre 2025 pour Monitorage v6*
