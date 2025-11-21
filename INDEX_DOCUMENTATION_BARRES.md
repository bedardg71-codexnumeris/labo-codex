# Index Complet - Documentation des Barres de Gradient

Application Monitorage v6 | 19 novembre 2025

---

## Organisation des fichiers

### 1. **STYLES_BARRES_CSS_GRADIENT.txt** (480 lignes)
Rapport technique complet en format texte.

**Contenu** :
- Classes CSS complètes avec propriétés
- Gradients linear-gradient avec codes couleur
- Fichiers et numéros de lignes
- Spécifications techniques détaillées
- Variables CSS globales
- Animation keyframes

**Accès rapide** :
- Section 1 : Barres A-C-P-E (40px)
- Section 2 : Barres Patterns (30px)
- Section 3 : Barres RàI (30px)
- Section 4 : Points scatter (8px)
- Section 5 : Barres engagement (12px)
- Section 6 : Barres SRPNF (8px)
- Section 7 : Légendes
- Section 8 : Jitter et positionnement
- Section 9 : Variables CSS
- Section 10 : Échelonnage responsive

**Usage** : Lecture rapide des codes CSS exacts, copier-coller direct dans code.


### 2. **GUIDE_GRADIENTS_BARRES.md** (550+ lignes)
Guide détaillé en Markdown avec explications pédagogiques.

**Contenu** :
- Table des matières complète
- Description détaillée de chaque type de barre
- Spécifications CSS avec annotations
- Tableaux récapitulatifs
- Code JavaScript d'implémentation
- Exemples visuels ASCII
- Section dépannage complète
- Références croisées

**Avantages** :
- Format lisible et structuré
- Explications conceptuelles
- Liens entre sections
- Facilement explorable

**Usage** : Compréhension globale du système, dépannage, apprentissage.


### 3. **REFERENCE_BARRES_VISUELLES.html** (460 lignes)
Page HTML interactive montrant les barres en live.

**Contenu** :
- Démonstration visuelle de tous les gradients
- Légendes colorées
- Points scatter animés
- Démonstration des animations
- Palette complète de couleurs
- Code CSS pour chaque élément

**Fonctionnalités** :
- Page autonome (aucune dépendance externe)
- Responsive design
- Sections dépliables
- Codes couleur avec étiquettes

**Usage** : Visualisation immédiate, vérification des couleurs, présentation.


### 4. **INDEX_DOCUMENTATION_BARRES.md** (ce fichier)
Navigation et guide d'utilisation de la documentation.

---

## Éléments documentés

### A. Barres A-C-P-E (Indicateurs globaux)
| Aspect | Fichier | Ligne |
|--------|---------|-------|
| CSS classe | styles.css | 6649-6674 |
| Gradient | styles.css | 6653-6661 |
| Overlay | styles.css | 6665-6674 |
| Fonction JS | tableau-bord-apercu.js | 1080-1228 |
| Guide | GUIDE_GRADIENTS_BARRES.md | Section 2 |
| Rapport | STYLES_BARRES_CSS_GRADIENT.txt | Section 1 |
| Visuel | REFERENCE_BARRES_VISUELLES.html | Section 1 |

**Propriétés clés** :
- Height: 40px
- Border-radius: 20px
- Overlay: rgba(15, 30, 58, 0.2)
- Dégradé: Orange → Vert → Bleu

---

### B. Barres Patterns
| Aspect | Fichier | Ligne |
|--------|---------|-------|
| CSS classe | styles.css | 6678-6701 |
| Gradient | styles.css | 6682-6688 |
| Overlay | styles.css | 6692-6701 |
| Fonction JS | tableau-bord-apercu.js | 1240-1437 |
| Positionnement | tableau-bord-apercu.js | 1245-1252 |
| Guide | GUIDE_GRADIENTS_BARRES.md | Section 3 |
| Rapport | STYLES_BARRES_CSS_GRADIENT.txt | Section 2 |
| Visuel | REFERENCE_BARRES_VISUELLES.html | Section 2 |

**Propriétés clés** :
- Height: 30px
- Border-radius: 15px
- Overlay: rgba(15, 30, 58, 0.35)
- 4 zones (Stable, Défi, Émergent, Critique)
- Positions: 12.5%, 37.5%, 62.5%, 87.5%

---

### C. Barres RàI
| Aspect | Fichier | Ligne |
|--------|---------|-------|
| CSS classe | styles.css | 6705-6728 |
| Gradient | styles.css | 6709-6715 |
| Overlay | styles.css | 6719-6728 |
| Fonction JS | tableau-bord-apercu.js | 1449-1630 |
| Positionnement | tableau-bord-apercu.js | 1455-1459 |
| Guide | GUIDE_GRADIENTS_BARRES.md | Section 4 |
| Rapport | STYLES_BARRES_CSS_GRADIENT.txt | Section 3 |
| Visuel | REFERENCE_BARRES_VISUELLES.html | Section 3 |

**Propriétés clés** :
- Height: 30px
- Border-radius: 15px
- Overlay: rgba(15, 30, 58, 0.4)
- 3 niveaux (Universel, Préventif, Intensif)
- Positions: 16.5%, 49.5%, 83%

---

### D. Points de distribution (Scatter Plots)
| Aspect | Fichier | Ligne |
|--------|---------|-------|
| Animation | styles.css | 6421-6434 |
| CSS classe | styles.css | 6437-6470 |
| Keyframes | styles.css | 6421-6434 |
| Fonction JS | tableau-bord-apercu.js | 1140-1213 |
| Guide | GUIDE_GRADIENTS_BARRES.md | Section 5 |
| Rapport | STYLES_BARRES_CSS_GRADIENT.txt | Section 4 |
| Visuel | REFERENCE_BARRES_VISUELLES.html | Section 2-4 |

**Propriétés clés** :
- Diameter: 8px
- Bordure: 1px white (2px hover)
- Border-radius: 50%
- Animation: float-subtle 7s
- Jitter: ±1.5% H, ±12px V

---

### E. Barres d'engagement
| Aspect | Fichier | Ligne |
|--------|---------|-------|
| CSS classe | styles.css | 5451-5533 |
| Point CSS | styles.css | 5477-5508 |
| Gradient JS | profil-etudiant.js | 1288-1292 |
| Légende | profil-etudiant.js | 1307-1324 |
| Guide | GUIDE_GRADIENTS_BARRES.md | Section 6 |
| Rapport | STYLES_BARRES_CSS_GRADIENT.txt | Section 5 |
| Visuel | REFERENCE_BARRES_VISUELLES.html | Section 4 |

**Propriétés clés** :
- Height: 12px
- Border-radius: 6px
- Point: 12px (16px hover)
- Gradient: Orange → Jaune → Vert → Bleu
- 4 zones (Fragile, Modéré, Favorable, Très fav.)

---

### F. Barres SRPNF
| Aspect | Fichier | Ligne |
|--------|---------|-------|
| CSS classe | styles.css | 5957-6030 |
| Gradient JS | profil-etudiant.js | Dynamique |
| Point CSS | styles.css | 6011-6029 |
| Guide | GUIDE_GRADIENTS_BARRES.md | Section 7 |
| Rapport | STYLES_BARRES_CSS_GRADIENT.txt | Section 6 |
| Visuel | REFERENCE_BARRES_VISUELLES.html | Section 5 |

**Propriétés clés** :
- Height: 8px
- Border-radius: 4px
- Point: 12px (16px hover)
- 4 niveaux IDME (I, D, M, E)
- 5 critères (Structure, Rigueur, Plausibilité, Nuance, Français)

---

## Palettes de couleurs

### Variables CSS globales
```css
--som-orange: #ff6f00     /* Sommatif */
--pan-bleu: #0277bd       /* Portfolio */
--hybride-violet: #9c27b0 /* Réservé */
```

### Spectre ACPE
```
#ff8c00 (Orange foncé)
#ffa500 (Orange)
#98d025 (Vert citron)
#22c55e (Vert)
#14b8a6 (Cyan)
#06b6d4 (Bleu ciel clair)
#0ea5e9 (Bleu ciel)
```

### Spectre Patterns
```
#22c55e (Vert - Stable)
#14b8a6 (Cyan - Défi)
#0ea5e9 (Bleu ciel - Émergent)
#3b82f6 (Bleu - Émergent)
#6366f1 (Indigo - Critique)
```

### Spectre RàI
```
#0ea5e9 (Bleu ciel - Niveau 1)
#3b82f6 (Bleu - Niveau 1-2)
#6366f1 (Indigo - Niveau 2)
#8b5cf6 (Violet - Niveau 2-3)
#6b21a8 (Mauve - Niveau 3)
```

### Spectre Engagement
```
#ff9800 (Orange - Fragile)
#ffc107 (Jaune - Modéré)
#28a745 (Vert - Favorable)
#2196F3 (Bleu - Très favorable)
```

### Spectre IDME
```
#ff6f00 (Orange - Insuffisant)
#FFB800 (Jaune - Développement)
#28a745 (Vert - Maîtrisé)
#2196F3 (Bleu - Étendu)
```

---

## Formules et calculs

### Positionnement points ACPE
```javascript
position = (valeur - 0.30) / 0.70 * 100;  // Mappe 0.30-1.00 → 0-100%
```

### Positionnement points Patterns
```javascript
// SOM à gauche, PAN à droite
position_final = Math.max(0, Math.min(position + decalage + jitter_h, 100));
// decalage SOM: -2%, PAN: +2%
```

### Positionnement points RàI
```javascript
// Même logique que Patterns
position_final = Math.max(0, Math.min(position + decalage + jitter_h, 100));
```

### Jitter aléatoire
```javascript
jitter_h = (Math.random() - 0.5) * 3.0;   // ±1.5%
jitter_v = (Math.random() - 0.5) * 24;    // ±12px
```

### Engagement
```javascript
E = A * C * P;  // Produit des trois indices (0-1)
position = (E - 0.30) / 0.70 * 100;  // Mappe pour barre
```

---

## Guides de dépannage

### Je veux...

| Tâche | Source |
|-------|--------|
| **Copier un gradient CSS exact** | STYLES_BARRES_CSS_GRADIENT.txt |
| **Comprendre comment fonctionnent les zones** | GUIDE_GRADIENTS_BARRES.md (Section 3, 4) |
| **Voir les couleurs en live** | REFERENCE_BARRES_VISUELLES.html |
| **Modifier une couleur** | STYLES_BARRES_CSS_GRADIENT.txt (Section 10) |
| **Fixer un bug de points** | GUIDE_GRADIENTS_BARRES.md (Section 9) |
| **Ajouter une nouvelle barre** | GUIDE_GRADIENTS_BARRES.md (Section 8) |
| **Réduire le chevauchement SOM/PAN** | GUIDE_GRADIENTS_BARRES.md (Dépannage) |
| **Changer la taille des points** | STYLES_BARRES_CSS_GRADIENT.txt (Section 4) |
| **Créer une présentation** | REFERENCE_BARRES_VISUELLES.html |
| **Comprendre le jitter** | GUIDE_GRADIENTS_BARRES.md (Section 8.5) |

---

## Structure des fichiers CSS

### styles.css

**Sections pertinentes** :
- **3000-6000** : Styles généraux et modules
- **5450** : Barres engagement profil
- **5950** : Barres SRPNF
- **6400** : Animation float-subtle
- **6437** : Points scatter
- **6649** : Barres ACPE
- **6678** : Barres Patterns
- **6705** : Barres RàI
- **6732** : Points (dots)

---

## Structure des fichiers JS

### tableau-bord-apercu.js

**Sections pertinentes** :
- **1080** : `genererBarreAcpe()`
- **1140** : Positionnement points ACPE
- **1240** : `genererBarrePatterns()`
- **1260** : Positionnement points Patterns
- **1449** : `genererBarreRaI()`
- **1465** : Positionnement points RàI
- **1430-1434** : Couleurs légende

### profil-etudiant.js

**Sections pertinentes** :
- **1280** : Barre engagement E
- **1288** : Gradient engagement dynamique
- **1298** : Points engagement
- **5451** : CSS .profil-echelle-barre

---

## Mise à jour de la documentation

Dernière mise à jour : **19 novembre 2025**

**Fichiers actuels** :
- `STYLES_BARRES_CSS_GRADIENT.txt` (14 KB, 480 lignes)
- `GUIDE_GRADIENTS_BARRES.md` (19 KB, 550 lignes)
- `REFERENCE_BARRES_VISUELLES.html` (21 KB, 460 lignes)
- `INDEX_DOCUMENTATION_BARRES.md` (ce fichier)

**Prochaines mises à jour** :
- Après modifications de styles.css
- Après ajout de nouvelles barres
- Après changement de palette de couleurs
- Après modifications des keyframes d'animation

---

## Conventions de nommage

### Classes CSS
- `.barre-[type]` : Conteneur principal
- `.barre-[type]-overlay` : Overlay semi-transparent
- `.barre-etudiant` : Points scatter
- `.barre-etudiant-[pratique]` : Points par pratique (som, pan)
- `.profil-echelle-[type]` : Barres profil
- `.critere-[type]` : Barres critères SRPNF
- `.distribution-[type]` : Conteneurs légende

### Fonctions JS
- `genererBarre[Type]()` : Génère barre HTML
- `calculer[Type]()` : Calcule valeurs
- `identifier[Type]()` : Identifie zone/niveau

### Variables CSS
- `--[pratique]-[couleur]` : Couleurs pratiques
- `--[elément]-[propriete]` : Autres variables

---

## Liens rapides

| Ressource | Type | Accès |
|-----------|------|-------|
| Rapport technique | TXT | Lire en éditeur |
| Guide complet | MD | Lire en GitHub |
| Visuel interactif | HTML | Ouvrir dans navigateur |
| Styles CSS | CSS | Lire lignes 6400-6750 |
| Tableau-bord JS | JS | Lire lignes 1080-1630 |
| Profil JS | JS | Lire lignes 1280-5533 |

---

## Aide rapide

**Q: Je veux changer la couleur de la barre ACPE.**
R: Aller à styles.css:6653-6661, modifier les couleurs du gradient.

**Q: La barre Patterns ne montre pas 4 zones.**
R: Vérifier styles.css:6682-6688, s'assurer que les 5 couleurs sont présentes.

**Q: Les points SOM/PAN se chevauchent trop.**
R: Augmenter jitter horizontal dans tableau-bord-apercu.js ligne 1268 ou 1305.

**Q: L'animation au hover ne marche pas.**
R: Vérifier styles.css:6457 contient `animation: float-subtle`.

**Q: Je veux ajouter une nouvelle couleur.**
R: Définir variable CSS dans styles.css top, utiliser `var(--ma-couleur)`.

---

*Documentation complète des barres de gradient Monitorage v6 - 19 novembre 2025*
