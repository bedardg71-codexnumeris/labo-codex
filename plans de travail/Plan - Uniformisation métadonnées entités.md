# Plan — Uniformisation des métadonnées des entités

**Date** : 5 avril 2026
**Statut** : Planifié — prochaine session
**Priorité** : Qualité / cohérence UI

---

## Problématique

Les 4 types d'entités (grille, production, échelle, cartouche) affichent des encadrés « Métadonnées sur cette/ce... » avec des champs incohérents.

### État actuel

| Champ | Grille | Production | Échelle | Cartouche |
|---|---|---|---|---|
| Auteur | ✅ | ✅ | ✅ | ✅ |
| Créé le | ✅ | « Non spécifié » | ✅ | ✅ |
| Modifié le | ✅ | ❌ | ✅ | ❌ |
| Description | ❌ | ✅ | ✅ (codé en dur) | ❌ |
| Licence | ✅ | ✅ | ✅ | ✅ |

### Problèmes

1. **Champs incohérents** : certains ont « Modifié le », d'autres non ; certains ont « Description », d'autres non
2. **Description échelle codée en dur** : le texte « Échelle basée sur la taxonomie SOLO » n'est pas lié à un champ modifiable dans les données
3. **Date « Créé le » manquante** pour les productions (affiche « Non spécifié »)
4. **Pas de description** pour les grilles et les cartouches
5. **Faute de genre** : « Métadonnées sur ce cartouche » → devrait être « cette cartouche » (féminin)

## Cible

Tous les encadrés métadonnées doivent afficher les mêmes champs, dans le même ordre :

1. **Auteur** — déjà en place partout
2. **Créé le** — date de création (s'assurer qu'elle est sauvegardée à la création)
3. **Modifié le** — date de dernière modification (mettre à jour à chaque sauvegarde)
4. **Description** — champ texte libre, modifiable par l'utilisateur
5. **Licence** — CC BY-NC-SA 4.0 (déjà en place partout)

## Travail à faire

### 0. Audit préalable — cohérence UI / stockage / JSON import-export

Avant toute modification, auditer les 3 couches pour chaque entité :

**Pour chaque entité (grille, production, échelle, cartouche) :**

| Couche | Vérifier |
|---|---|
| **UI (encadré métadonnées)** | Quels champs sont affichés ? Lesquels sont modifiables ? |
| **Stockage (objet JS / IndexedDB)** | Quels champs metadata_cc existent sur l'objet ? Lesquels sont peuplés à la création et à la sauvegarde ? |
| **JSON import/export** | Quels champs metadata_cc sont inclus dans le JSON exporté ? Sont-ils relus à l'import ? Sont-ils préservés ou écrasés ? |

**Questions à répondre par l'audit :**
1. Y a-t-il des champs affichés dans l'UI mais absents du stockage (= codés en dur) ?
2. Y a-t-il des champs présents dans le stockage mais absents du JSON export (= perdus à l'export) ?
3. Y a-t-il des champs dans le JSON export qui sont ignorés à l'import (= perdus au retour) ?
4. Le champ `metadata_cc` est-il présent et structuré de la même façon sur les 4 entités ?
5. Les fonctions `ajouterMetadonnéesCC()` (Tier 4.5) couvrent-elles toutes les entités ?

**Fichiers à auditer :**
- `js/grilles.js` — création, sauvegarde, affichage métadonnées, export/import bibliothèque
- `js/productions.js` — idem
- `js/echelles.js` — idem + description codée en dur
- `js/cartouches.js` — idem
- `js/import-export.js` — import/export ZIP, JSON
- `js/bibliotheque-ui.js` — export/import bibliothèque individuel

**Livrable de l'audit :** un tableau récapitulatif 4 entités × 3 couches avec les écarts identifiés. Ce tableau guidera les étapes 1 à 4 ci-dessous.

---

### 1. Données — ajouter le champ `description` modifiable
- **Échelle** : remplacer la description codée en dur par un champ `description` dans l'objet stocké. Migrer le texte existant.
- **Grille** : ajouter un champ `description` (optionnel, vide par défaut)
- **Cartouche** : ajouter un champ `description` (optionnel, vide par défaut)
- **Production** : le champ `description` existe déjà (c'est l'activité d'apprentissage)

### 2. Données — corriger les dates manquantes
- **Production** : s'assurer que `dateCreation` est sauvegardé à la création
- **Cartouche** : s'assurer que `dateModification` est mis à jour à la sauvegarde
- **Toutes les entités** : vérifier que `dateModification` est mis à jour systématiquement

### 3. UI — uniformiser le rendu
- Créer une fonction utilitaire `genererMetadonnees(type, objet)` qui produit le HTML standard
- Remplacer les 4 implémentations séparées par un appel à cette fonction
- Ordre des champs : Auteur, Créé le, Modifié le, Description, Licence

### 4. Correction de genre
- « Métadonnées sur ce cartouche » → « Métadonnées sur cette cartouche »

## Fichiers probablement concernés

- `js/grilles.js` — métadonnées grille
- `js/productions.js` — métadonnées production
- `js/echelles.js` — métadonnées échelle + description codée en dur
- `js/cartouches.js` — métadonnées cartouche
- Potentiellement un helper partagé à créer

## Risques

- Migration de la description échelle : s'assurer que les échelles existantes récupèrent le texte codé en dur comme valeur initiale
- Vérifier que les exports/imports (bibliothèque, ZIP) incluent les nouveaux champs
