# Système de pratiques de notation

## Vue d'ensemble

Ce dossier contient l'architecture modulaire permettant de supporter **plusieurs pratiques de notation** dans l'application de monitorage pédagogique.

**Principe** : Chaque pratique implémente une interface commune (`IPratique`), permettant d'ajouter de nouvelles pratiques sans modifier le code existant.

---

## Architecture

```
js/pratiques/
├── README.md                    # Ce fichier
├── pratique-interface.js        # Documentation du contrat IPratique
├── pratique-registry.js         # Registre et détection automatique
├── pratique-pan-maitrise.js     # PAN-Maîtrise (Grégoire)
├── pratique-sommative.js        # Sommative traditionnelle
└── [futures pratiques...]       # PAN-Spécifications, Dénotation, etc.
```

---

## Concepts clés

### Universel vs Spécifique

**UNIVERSEL** (identique pour toutes les pratiques) :
- ✅ Indices A-C-P-R (Assiduité, Complétion, Performance, Risque)
- ✅ Niveaux de risque (5%, 10%, 25%, 50%, 75%)
- ✅ Niveaux RàI (1-Universel, 2-Préventif, 3-Intensif)
- ✅ Patterns d'apprentissage (Blocage, Défi, Stable, Progression)

**SPÉCIFIQUE** (propre à chaque pratique) :
- ⚙️ Calcul de l'indice P (Performance)
- ⚙️ Détection des défis (SRPNF vs génériques)
- ⚙️ Génération des cibles RàI (critères vs productions)

---

## Contrat IPratique

Toute pratique doit implémenter les méthodes suivantes :

### Méthodes d'identité
- `obtenirNom()` → String : Nom complet de la pratique
- `obtenirId()` → String : Identifiant unique ('pan-maitrise', 'sommative', etc.)
- `obtenirDescription()` → String : Description complète

### Méthodes de calcul
- `calculerPerformance(da)` → Number : Indice P (0-1)
- `calculerCompletion(da)` → Number : Indice C (0-1)

### Méthodes d'analyse
- `detecterDefis(da)` → Object : Défis spécifiques identifiés
- `identifierPattern(da)` → Object : Pattern d'apprentissage
- `genererCibleIntervention(da)` → Object : Cible RàI personnalisée

---

## Détection automatique

Le registre détecte automatiquement la pratique active selon :

```javascript
localStorage.modalitesEvaluation.pratique
```

Valeurs possibles :
- `"pan-maitrise"` → Charge `PratiquePANMaitrise`
- `"sommative"` → Charge `PratiqueSommative`
- `"pan-specifications"` → Charge `PratiquePANSpecifications` (futur)
- `"denotation"` → Charge `PratiqueDenotation` (futur)

---

## Comment ajouter une pratique ?

Voir le guide complet dans `/GUIDE_AJOUT_PRATIQUE.md`.

**Résumé des étapes** :
1. Créer `/js/pratiques/pratique-[id].js`
2. Implémenter toutes les méthodes du contrat `IPratique`
3. Enregistrer la pratique dans `pratique-registry.js`
4. Ajouter l'option dans `pratiques.js` (interface utilisateur)
5. Tester avec des données réelles

---

## Documentation complète

- **ARCHITECTURE_PRATIQUES.md** : Architecture technique complète
- **GUIDE_AJOUT_PRATIQUE.md** : Guide opérationnel pas-à-pas
- **FEUILLE_DE_ROUTE_PRATIQUES.md** : Roadmap d'implémentation

---

**Version** : 1.0
**Date** : 11 novembre 2025
**Auteur** : Grégoire Bédard (Labo Codex)
