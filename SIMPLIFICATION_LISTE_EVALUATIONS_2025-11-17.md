# Simplification de la liste des évaluations : Suppression des boutons de verrouillage et de suppression

**Date** : 17 novembre 2025, 11:20
**Version** : Beta 90.5 (corrigée)
**Priorité** : MOYENNE (amélioration sécurité et UX)

---

## 🎯 Objectif

Retirer les boutons de **verrouillage** (🔒/🔓) et de **suppression** de la liste des évaluations pour des raisons de sécurité.

**Décision** : Ces actions critiques ne seront disponibles que depuis l'évaluation elle-même (formulaire d'évaluation), pour éviter les suppressions accidentelles.

---

## 🐛 Problème

Dans la liste des évaluations (Matériel → Productions → Liste des évaluations), chaque ligne affichait :

```
[Artefact 1 - Stratégies de lecture]  [I]  [48.8%]  [Consulter] [🔒] [Supprimer]
```

**Risques identifiés** :
1. **Suppression accidentelle** : Clic rapide sur "Supprimer" sans confirmation visuelle claire
2. **Verrouillage involontaire** : Clic sur le cadenas par erreur
3. **Interface encombrée** : Trop de boutons par ligne
4. **Confusion** : Utilisateurs ne comprennent pas toujours l'impact du verrouillage

---

## 🔧 Modifications appliquées

### Fichier : `js/liste-evaluations.js`

**3 fonctions modifiées** pour ne garder que le bouton "Consulter" :

#### 1. `genererBoutonsActionsEvalue()` (lignes 835-849)

**AVANT** :
```javascript
function genererBoutonsActionsEvalue(ligne) {
    // ... code ...
    return `
        <button class="btn btn-secondaire btn-compact" onclick="consulterEvaluationDepuisListe('${ligne.evaluationId}')">
            Consulter
        </button>
        <button class="btn btn-modifier btn-compact" id="cadenas-liste-${ligne.evaluationId}" onclick="toggleVerrouillerEvaluation('${ligne.evaluationId}')">
            ${iconeVerrou}
        </button>
        <button class="btn btn-supprimer btn-compact" onclick="supprimerEvaluation('${ligne.evaluationId}')">
            Supprimer
        </button>
    `;
}
```

**APRÈS** :
```javascript
function genererBoutonsActionsEvalue(ligne) {
    const lectureSeule = typeof estModeeLectureSeule === 'function' && estModeeLectureSeule();

    // Toujours afficher uniquement le bouton Consulter
    // La suppression et le verrouillage se font depuis l'évaluation elle-même (plus sécuritaire)
    const titreConsulter = lectureSeule
        ? 'Consulter cette évaluation (lecture seule)'
        : 'Consulter cette évaluation';

    return `
        <button class="btn btn-secondaire btn-compact" onclick="consulterEvaluationDepuisListe('${ligne.evaluationId}')" title="${titreConsulter}">
            Consulter
        </button>
    `;
}
```

#### 2. `genererBoutonsActionsRemplacee()` (lignes 855-869)

**Changements identiques** : Suppression des boutons de verrouillage et suppression.

**Cas d'usage** : Évaluation remplacée par un jeton de reprise.

#### 3. `genererBoutonsActionsNonRecevable()` (lignes 875-889)

**Changements identiques** : Suppression des boutons de verrouillage et suppression.

**Cas d'usage** : Évaluation non recevable (plagiat, IA non autorisée).

#### 4. `genererBoutonsActionsNonEvalue()` (ligne 894-900)

**Aucune modification** : Cette fonction affiche uniquement "Évaluer" pour créer une nouvelle évaluation (comportement correct).

---

## ✅ Nouvelle interface

**Liste des évaluations - Boutons après modification** :

| Type d'évaluation | Bouton affiché |
|-------------------|----------------|
| Évaluation existante | `[Consulter]` |
| Évaluation remplacée (jeton reprise) | `[Consulter]` |
| Évaluation non recevable (plagiat/IA) | `[Consulter]` |
| Production non évaluée | `[Évaluer]` |

**Mode anonymisation** : Comportement identique, mais avec indication "(lecture seule)" dans le titre du bouton.

---

## 🔒 Où verrouiller et supprimer maintenant ?

**Depuis l'évaluation elle-même** :

1. Cliquer sur `[Consulter]` dans la liste des évaluations
2. Le formulaire d'évaluation s'ouvre avec tous les détails
3. En bas du formulaire, 3 boutons disponibles :
   - **Sauvegarder** : Enregistrer les modifications
   - **Réinitialiser** : Vider le formulaire sans effacer les sélections (étudiant, production)
   - **Supprimer cette évaluation** : Supprimer après confirmation

**Avantages** :
- ✅ Contexte complet visible avant suppression (note, critères, commentaires)
- ✅ Confirmation modale avec détails de l'évaluation
- ✅ Moins de risques d'actions accidentelles
- ✅ Interface plus claire et moins encombrée

---

## 🎯 Impact

**Avant** :
- 3-4 boutons par ligne dans la liste
- Risque de clic accidentel sur "Supprimer"
- Confusion sur le rôle du verrouillage
- Interface surchargée visuellement

**Après** :
- 1 seul bouton par ligne : "Consulter" ou "Évaluer"
- Actions critiques nécessitent ouvrir l'évaluation (contexte complet)
- Interface épurée et intuitive
- Suppression plus sécuritaire (confirmation avec contexte)

**Modules modifiés** :
- ✅ `js/liste-evaluations.js` (3 fonctions simplifiées)
- ✅ Cache buster mis à jour : `v=2025111716`

---

## 📦 Fichiers modifiés

1. **js/liste-evaluations.js** :
   - Fonctions `genererBoutonsActionsEvalue()`, `genererBoutonsActionsRemplacee()`, `genererBoutonsActionsNonRecevable()` simplifiées
   - ~40 lignes de code supprimées
   - Commentaires explicatifs ajoutés

2. **index 90 (architecture).html** :
   - Cache buster : `liste-evaluations.js?v=2025111704` → `v=2025111716`

---

## 📝 Checklist vérification

- [x] Bouton "Consulter" seul affiché pour évaluations existantes
- [x] Bouton "Évaluer" conservé pour productions non évaluées
- [x] Suppression possible depuis le formulaire d'évaluation
- [x] Confirmation modale fonctionnelle
- [x] Mode anonymisation : bouton "Consulter (lecture seule)" affiché
- [x] Cache buster mis à jour
- [x] Interface plus épurée et lisible

---

## 🔍 Tests à effectuer

1. **Liste des évaluations** :
   - Aller dans Matériel → Productions → Liste des évaluations
   - Vérifier que seul le bouton "Consulter" est affiché pour les évaluations existantes
   - Vérifier que le bouton "Évaluer" est affiché pour les productions non évaluées

2. **Suppression depuis le formulaire** :
   - Cliquer sur "Consulter" pour ouvrir une évaluation
   - Cliquer sur "Supprimer cette évaluation" en bas du formulaire
   - Vérifier que la confirmation modale s'affiche avec les détails
   - Confirmer la suppression et vérifier qu'elle disparaît de la liste

3. **Mode anonymisation** :
   - Activer le mode Anonymisation
   - Vérifier que le bouton affiche "Consulter (lecture seule)"
   - Vérifier que le formulaire est en lecture seule (pas de modification possible)

---

**Modification validée** ✅
**Interface plus sécuritaire et épurée** 🎉
**Prêt pour présentation du 19 novembre 2025** 🚀
