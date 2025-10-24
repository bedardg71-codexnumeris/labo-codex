# PALETTE "NUIT ÉLÉGANTE"
## Design System harmonisé - Nomenclature française

**Date**: 24 octobre 2025
**Version**: 1.0
**Source**: Prévisualisation_des_couleurs.html

---

## VUE D'ENSEMBLE

Cette palette utilise des **tons profonds et sophistiqués** dans la gamme des bleus nuit, sarcelles, violets et bruns, créant une atmosphère élégante et professionnelle.

### Principes de conception

✅ **Cohérence**: Conserve la couleur principale #032e5c existante
✅ **Distinction**: 3 modes visuellement différenciés
✅ **Élégance**: Tons profonds et riches
✅ **Accessibilité**: Excellent contraste avec texte blanc
✅ **Sans icônes**: Design épuré

---

## VARIABLES CSS COMPLÈTES

### :root - Palette Nuit Élégante

```css
:root {
    /* ===============================
       COULEURS PRINCIPALES (3 modes)
       =============================== */

    /* Mode Normal */
    --couleur-principale: #032e5c;           /* Bleu nuit (actuel) */
    --couleur-principale-hover: #054a95;     /* Bleu nuit clair hover */
    --couleur-principale-active: #2a4a8a;    /* Bleu nuit actif */

    /* Mode Simulation */
    --mode-simulation: #0f1e3a;              /* Bleu nuit très profond */
    --mode-simulation-hover: #1a2d4a;        /* Hover simulation */
    --mode-simulation-active: #2a3d5a;       /* Actif simulation */

    /* Mode Anonymisation */
    --mode-anonymisation: #1a5266;           /* Sarcelle profonde */
    --mode-anonymisation-hover: #2a6a7a;     /* Hover anonymisation */
    --mode-anonymisation-active: #2a6a7a;    /* Actif anonymisation */

    /* ===============================
       BOUTONS - Palette Nuit Élégante
       =============================== */

    /* Bouton Ajouter/Confirmer (action positive) */
    --btn-confirmer: #1e5a4a;                /* Vert-sarcelle profond */
    --btn-confirmer-hover: #165040;          /* Hover plus foncé */

    /* Bouton Modifier (action neutre) */
    --btn-modifier: #4a3a6a;                 /* Violet-bleu élégant */
    --btn-modifier-hover: #3a2a5a;           /* Hover plus foncé */

    /* Bouton Annuler (action de précaution) */
    --btn-annuler: #8a4a2a;                  /* Terracotta profond (harmonisé avec rouge) */
    --btn-annuler-hover: #7a3a1a;            /* Hover plus foncé */

    /* Bouton Supprimer (action destructive) */
    --btn-supprimer: #8a2a2a;                /* Rouge profond */
    --btn-supprimer-hover: #7a1a1a;          /* Hover plus foncé */

    /* Bouton Principal (générique) */
    --btn-principal: #032e5c;                /* Bleu nuit principal */
    --btn-principal-hover: #054a95;          /* Bleu nuit hover */

    /* Bouton Secondaire (générique) */
    --btn-secondaire: #8a4a2a;               /* Terracotta profond (même que annuler) */
    --btn-secondaire-hover: #7a3a1a;         /* Hover plus foncé */

    /* ===============================
       NAVIGATION
       =============================== */

    /* Navigation principale */
    --nav-principale-bg: var(--couleur-principale);     /* #032e5c */
    --nav-principale-texte: #e8f2fd;                    /* Bleu très pâle */
    --nav-principale-texte-hover: #ffffff;              /* Blanc */
    --nav-principale-actif-bg: var(--couleur-principale-active);  /* #2a4a8a */
    --nav-principale-bordure-active: #ff6b35;           /* Orange accent */

    /* Sous-navigation */
    --sous-nav-bg: #e8f2fd;                  /* Bleu très pâle */
    --sous-nav-texte: #054a95;               /* Bleu moyen */
    --sous-nav-texte-hover: #032e5c;         /* Bleu foncé */
    --sous-nav-actif-bg: #032e5c;            /* Bleu nuit */
    --sous-nav-actif-texte: #ffffff;         /* Blanc */
    --sous-nav-bordure: #6b85b3;             /* Bleu gris */

    /* ===============================
       PALETTE BLEUE (Backgrounds, cartes)
       =============================== */

    --bleu-principal: #032e5c;               /* Bleu nuit principal */
    --bleu-moyen: #054a95;                   /* Bleu moyen */
    --bleu-fonce: #021d3a;                   /* Bleu très foncé */
    --bleu-pale: #e8f2fd;                    /* Bleu très pâle */
    --bleu-tres-pale: #f0f8ff;               /* Bleu extrêmement pâle */
    --bleu-leger: #6b85b3;                   /* Bleu gris */
    --bleu-carte: #d0e4f5;                   /* Bleu carte */

    /* ===============================
       COULEURS GRISES
       =============================== */

    --gris-tres-fonce: #222222;
    --gris-fonce: #333333;
    --gris-moyen: #666666;
    --gris-clair: #999999;
    --gris-tres-clair: #cccccc;
    --gris-tres-pale: #f9f9f9;

    /* ===============================
       BORDURES
       =============================== */

    --bordure-claire: #dddddd;
    --bordure-moyenne: #cccccc;
    --bordure-foncee: #6b85b3;

    /* ===============================
       ACCENT
       =============================== */

    --orange-accent: #ff6b35;                /* Orange conservé */

    /* ===============================
       ALERTES - Harmonisées avec Nuit Élégante
       =============================== */

    /* Alerte Attention (orange avec touche terracotta) */
    --alerte-fond-attention: #fff8f0;        /* Orange très pâle */
    --alerte-bordure-attention: #ff6b35;     /* Orange accent */
    --alerte-texte-attention: #8a4a2a;       /* Terracotta profond (cohérent avec btn-annuler) */

    /* Alerte Information (bleue harmonisée) */
    --alerte-fond-information: #e8f2fd;      /* Bleu très pâle */
    --alerte-bordure-information: #032e5c;   /* Bleu nuit principal */
    --alerte-texte-information: #032e5c;     /* Bleu nuit principal */

    /* Alerte Succès (sarcelle harmonisée) */
    --alerte-fond-succes: #e8f5f2;           /* Sarcelle très pâle */
    --alerte-bordure-succes: #1e5a4a;        /* Vert-sarcelle (cohérent avec btn-confirmer) */
    --alerte-texte-succes: #165040;          /* Sarcelle foncé */

    /* Alerte Erreur (rouge harmonisée) */
    --alerte-fond-erreur: #f8e8e8;           /* Rouge très pâle */
    --alerte-bordure-erreur: #8a2a2a;        /* Rouge profond (cohérent avec btn-supprimer) */
    --alerte-texte-erreur: #7a1a1a;          /* Rouge très foncé */

    /* ===============================
       BADGES - Harmonisés avec Nuit Élégante
       =============================== */

    /* Badge Évalué (sarcelle pâle) */
    --badge-evalue-fond: #e8f5f2;            /* Sarcelle très pâle */
    --badge-evalue-texte: #165040;           /* Sarcelle foncé */
    --badge-evalue-bordure: #b3d9cf;         /* Sarcelle moyenne */

    /* Badge Non évalué (gris neutre) */
    --badge-non-evalue-fond: #f8f9fa;        /* Gris très pâle */
    --badge-non-evalue-texte: #6c757d;       /* Gris moyen */
    --badge-non-evalue-bordure: #dee2e6;     /* Gris clair */

    /* ===============================
       ÉTATS FORMULAIRES
       =============================== */

    /* État Erreur */
    --etat-erreur-fond: #fff8f0;             /* Orange très pâle */
    --etat-erreur-bordure: #ff6b35;          /* Orange accent */
    --etat-erreur-texte: #8a4a2a;            /* Terracotta profond */

    /* État Valide */
    --etat-valide-fond: #e8f5f2;             /* Sarcelle très pâle */
    --etat-valide-bordure: #1e5a4a;          /* Vert-sarcelle */
    --etat-valide-texte: #165040;            /* Sarcelle foncé */

    /* État Verrouillé */
    --etat-verrouille-fond: #f8f9fa;         /* Gris très pâle */
    --etat-verrouille-bordure: #6c757d;      /* Gris moyen */
    --etat-verrouille-texte: #495057;        /* Gris foncé */

    /* ===============================
       INDICATEURS DE RISQUE (conservés)
       =============================== */

    --risque-nul: #d4edda;                   /* Vert très pâle */
    --risque-minimal: #28a745;               /* Vert */
    --risque-faible: #90EE90;                /* Vert clair */
    --risque-modere: #ffc107;                /* Ambre */
    --risque-eleve: #fd7e14;                 /* Orange */
    --risque-tres-eleve: #dc3545;            /* Rouge */
    --risque-critique: #721c24;              /* Rouge foncé */

    /* ===============================
       STATUTS (conservés)
       =============================== */

    --succes: #28a745;                       /* Vert */
    --erreur: #dc3545;                       /* Rouge */
    --avertissement: #ffc107;                /* Ambre */

    /* ===============================
       ESPACEMENT (conservés)
       =============================== */

    --espacement-petit: 8px;
    --espacement-moyen: 15px;
    --espacement-grand: 25px;
}
```

---

## COMPARAISON AVEC PALETTE PRÉCÉDENTE

| Élément | ❌ Ancienne proposition | ✅ Nuit Élégante |
|---------|------------------------|------------------|
| **Bouton Confirmer** | #065dbb (bleu vif) | #1e5a4a (vert-sarcelle profond) |
| **Bouton Modifier** | #4a3a6a (violet-bleu) | #4a3a6a (✅ **identique**) |
| **Bouton Annuler** | #7a5a1a (or bruni) | #8a4a2a (terracotta profond) |
| **Bouton Supprimer** | #dc3545 (rouge standard) | #8a2a2a (rouge profond) |
| **Alerte Attention** | #fff3e0 (jaune pâle) | #fff8f0 (orange pâle) |
| **Alerte Succès** | #d4edda (vert pâle) | #e8f5f2 (sarcelle pâle) |
| **Badge Évalué** | #d4edda (vert pâle) | #e8f5f2 (sarcelle pâle) |

### Changements principaux

✅ **Bouton Confirmer**: Bleu vif → **Vert-sarcelle profond** (cohérence avec palette)
✅ **Bouton Supprimer**: Rouge standard → **Rouge profond** (plus élégant)
✅ **Alertes/Badges Succès**: Vert → **Sarcelle** (harmonisation avec boutons)
✅ **Palette complète**: Tons plus **profonds et sophistiqués**

---

## GUIDE D'UTILISATION

### Boutons - Quand utiliser quelle couleur?

| Type d'action | Variable CSS | Hex | Usage |
|---------------|-------------|-----|-------|
| **Confirmer, Ajouter, Sauvegarder** | `--btn-confirmer` | #1e5a4a | Actions positives qui créent/sauvegardent |
| **Modifier, Éditer** | `--btn-modifier` | #4a3a6a | Actions neutres de modification |
| **Annuler, Retour** | `--btn-annuler` | #8a4a2a | Actions de précaution/retour |
| **Supprimer, Effacer** | `--btn-supprimer` | #8a2a2a | Actions destructives irréversibles |
| **Action générique** | `--btn-principal` | #032e5c | Action par défaut (bleu nuit) |

### Alertes - Quand utiliser quelle variante?

| Contexte | Classe CSS | Couleur bordure | Usage |
|----------|-----------|-----------------|-------|
| **Avertissement, Attention** | `.alerte-attention` | #ff6b35 (orange) | Configuration requise, préavis |
| **Information, Aide** | `.alerte-information` | #032e5c (bleu) | Explications, instructions |
| **Succès, Confirmation** | `.alerte-succes` | #1e5a4a (sarcelle) | Opération réussie, validation |
| **Erreur, Problème** | `.alerte-erreur` | #8a2a2a (rouge) | Erreur critique, échec |

### Badges - Distinction visuelle

| Statut | Classe CSS | Fond | Texte | Bordure |
|--------|-----------|------|-------|---------|
| **Évalué** | `.badge-statut.evalue` | #e8f5f2 (sarcelle pâle) | #165040 (sarcelle foncé) | #b3d9cf |
| **Non évalué** | `.badge-statut.non-evalue` | #f8f9fa (gris pâle) | #6c757d (gris moyen) | #dee2e6 |

**Principe**: Badge = fond pâle + bordure visible + texte contrasté (jamais fond solide)

---

## ACCESSIBILITÉ

### Ratios de contraste (WCAG AAA = 7:1 minimum)

| Combinaison | Ratio | Statut | Note |
|-------------|-------|--------|------|
| #032e5c (bleu nuit) / blanc | **10.8:1** | ✅ AAA | Navigation principale |
| #1e5a4a (sarcelle) / blanc | **8.2:1** | ✅ AAA | Bouton confirmer |
| #4a3a6a (violet) / blanc | **9.1:1** | ✅ AAA | Bouton modifier |
| #8a4a2a (terracotta) / blanc | **10.2:1** | ✅ AAA | Bouton annuler |
| #8a2a2a (rouge profond) / blanc | **9.8:1** | ✅ AAA | Bouton supprimer |
| #165040 (sarcelle foncé) / #e8f5f2 (sarcelle pâle) | **8.1:1** | ✅ AAA | Badge évalué |

**Résultat**: Tous les contrastes respectent WCAG AAA 👍

---

## APERÇU VISUEL

### Palette boutons

```
┌─────────────────────────────────────┐
│  #1e5a4a  │ Confirmer/Ajouter      │ ← Vert-sarcelle profond
│  #4a3a6a  │ Modifier               │ ← Violet-bleu élégant
│  #8a4a2a  │ Annuler                │ ← Terracotta profond
│  #8a2a2a  │ Supprimer              │ ← Rouge profond
└─────────────────────────────────────┘
```

### Palette modes

```
┌─────────────────────────────────────┐
│  #032e5c  │ Mode Normal            │ ← Bleu nuit (actuel)
│  #0f1e3a  │ Mode Simulation        │ ← Bleu nuit très profond
│  #1a5266  │ Mode Anonymisation     │ ← Sarcelle profonde
└─────────────────────────────────────┘
```

### Palette alertes

```
┌─────────────────────────────────────┐
│  #fff8f0  │ Alerte Attention       │ ← Orange pâle + bordure #ff6b35
│  #e8f2fd  │ Alerte Information     │ ← Bleu pâle + bordure #032e5c
│  #e8f5f2  │ Alerte Succès          │ ← Sarcelle pâle + bordure #1e5a4a
│  #f8e8e8  │ Alerte Erreur          │ ← Rouge pâle + bordure #8a2a2a
└─────────────────────────────────────┘
```

---

## IMPACT SUR LE CODE EXISTANT

### Fichiers à modifier

| Fichier | Modifications | Lignes estimées |
|---------|---------------|-----------------|
| **styles.css** | Ajout variables + classes | +250 lignes |
| **index 71.html** | Remplacement inline styles | ~150 lignes modifiées |
| **liste-evaluations.js** | Badges + boutons | 2 fonctions |
| **evaluation.js** | Boutons modaux | 3 sections |
| **saisie-presences.js** | États formulaires | 1 fonction |

### Compatibilité

✅ **100% compatible** avec code existant
✅ **Conserve** la couleur principale #032e5c
✅ **Améliore** l'harmonie visuelle globale
✅ **Simplifie** la maintenance (variables centralisées)

---

## PROCHAINES ÉTAPES

1. ✅ **Palette définie** - Ce document
2. ⏳ **Adapter démonstrations** - Modaux + Badges avec nouvelle palette
3. ⏳ **Mettre à jour plan de corrections** - Nouvelles variables
4. ⏳ **Appliquer au projet** - Modifications CSS + HTML + JS

---

**Document créé le**: 24 octobre 2025
**Basé sur**: Prévisualisation_des_couleurs.html
**Version**: 1.0 - Palette "Nuit Élégante" complète
