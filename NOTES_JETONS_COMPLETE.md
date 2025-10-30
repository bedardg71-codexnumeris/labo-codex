# Système de jetons - Fonctionnalités complétées
**Date** : 30 octobre 2025
**Version** : Beta 0.80

---

## 🎯 Objectif

Compléter le système de jetons (délai et reprise) qui était partiellement implémenté en restaurant les fonctionnalités manquantes.

---

## ✅ Fonctionnalités déjà existantes (confirmées)

### 1. Affichage des jetons appliqués
- ✅ **Badges visuels** : Jetons affichés avec étoiles ⭐ (violet pour reprise, orange pour délai)
- ✅ **Liste productions** : Icônes d'identification dans le tableau des artefacts
- ✅ **Profil étudiant** : Section "JETONS UTILISÉS" avec détails
- ✅ **Fonction** : `afficherBadgesJetons()` - Affiche les badges dans la sidebar

### 2. Retrait de jetons
- ✅ **Depuis sidebar** : Bouton × sur chaque badge pour retirer le jeton
- ✅ **Depuis banque** : Boutons × dans les cartes d'évaluation
- ✅ **Fonctions** :
  - `retirerJetonDepuisSidebar(evaluationId, typeJeton)` - Retrait pendant édition
  - `retirerJeton(evaluationId, typeJeton)` - Retrait depuis banque

### 3. Jeton de reprise depuis banque
- ✅ **Bouton "Jeton de reprise"** : Dans chaque carte de la banque d'évaluations
- ✅ **Logique complète** :
  - Crée un duplicata de l'évaluation avec nouvel ID
  - Marque l'originale comme `remplaceeParId`
  - Applique `jetonRepriseApplique: true` et `repriseDeId` sur le duplicata
  - Charge automatiquement le duplicata pour modification
  - Recalcule les indices C et P
- ✅ **Fonction** : `appliquerJetonRepriseDepuisBanque(evaluationId)`

### 4. Archive des évaluations remplacées
- ✅ **Marquage** : Propriété `remplaceeParId` avec ID de la nouvelle évaluation
- ✅ **Affichage** : Évaluations archivées affichées en grisé avec mention "(Remplacée)"
- ✅ **Exclusion** : Exclues automatiquement du calcul des indices C et P

---

## 🔧 Fonctionnalités complétées (corrections)

### 1. Fonction `afficherGestionJetons()` - CRÉÉE
**Problème** : La fonction était appelée mais n'existait pas, empêchant l'affichage des sections de jetons.

**Solution** :
```javascript
function afficherGestionJetons(afficher) {
    const sectionBadges = document.getElementById('gestionJetonsEvaluation');
    const boutonReprise = document.getElementById('boutonJetonReprise');

    if (afficher && window.evaluationEnCours?.idModification) {
        // Afficher badges et bouton selon contexte
        afficherBadgesJetons();

        // Bouton reprise seulement si pas déjà appliqué
        const aDejaJetonReprise = evaluation.jetonRepriseApplique || evaluation.repriseDeId;
        boutonReprise.style.display = aDejaJetonReprise ? 'none' : 'block';
    } else {
        // Masquer tout
        sectionBadges.style.display = 'none';
        boutonReprise.style.display = 'none';
    }
}
```

**Impact** :
- ✅ Sections de jetons maintenant affichées/masquées correctement
- ✅ Contrôle visibilité du bouton "Appliquer jeton de reprise"

### 2. Fonction `gererDelaiAccorde()` - AMÉLIORÉE
**Problème** : La fonction mettait seulement une propriété `delaiAccorde` sans créer un vrai jeton avec date.

**Solution améliorée** :
```javascript
function gererDelaiAccorde() {
    const checkbox = document.getElementById('delaiAccordeCheck');

    // Pour les nouvelles évaluations : juste mettre la propriété
    if (!evaluationEnCours?.idModification) {
        evaluationEnCours.delaiAccorde = checkbox.checked;
        return;
    }

    // Pour les évaluations existantes : appliquer un VRAI jeton
    if (checkbox.checked) {
        evaluation.jetonDelaiApplique = true;
        evaluation.dateApplicationJetonDelai = new Date().toISOString();
        evaluation.delaiAccorde = true;
    } else {
        delete evaluation.jetonDelaiApplique;
        delete evaluation.dateApplicationJetonDelai;
        delete evaluation.delaiAccorde;
    }

    // Sauvegarder et recalculer indices
    localStorage.setItem('evaluationsSauvegardees', JSON.stringify(evaluations));
    calculerEtStockerIndicesCP();
    afficherBadgesJetons();
}
```

**Impact** :
- ✅ Jetons de délai maintenant créés avec date d'application
- ✅ Recalcul automatique des indices C et P
- ✅ Affichage immédiat du badge ⭐ orange

### 3. Bouton "Appliquer jeton de reprise" - AJOUTÉ
**Problème** : Aucun moyen d'appliquer un jeton de reprise depuis la sidebar pendant l'édition.

**Solution** : Ajout du bouton dans le HTML de la sidebar :
```html
<!-- BOUTON JETON DE REPRISE -->
<div id="boutonJetonReprise" class="groupe-form" style="display: none;">
    <button class="btn btn-special" onclick="appliquerJetonRepriseDepuisSidebar()"
            style="width: 100%; background: #9c27b0; color: white;">
        ⭐ Appliquer jeton de reprise
    </button>
    <p style="font-size: 0.85rem; color: #666;">
        Remplace l'évaluation précédente. L'ancienne note sera archivée.
    </p>
</div>
```

**Fonction associée** :
```javascript
function appliquerJetonRepriseDepuisSidebar() {
    if (!window.evaluationEnCours?.idModification) {
        afficherNotificationErreur('Erreur', 'Vous devez charger une évaluation existante');
        return;
    }

    const confirmation = confirm(
        'Voulez-vous vraiment appliquer un jeton de reprise ?\n\n' +
        'Cela va créer une nouvelle évaluation qui remplacera la précédente.'
    );

    if (!confirmation) return;

    // Réutiliser la logique existante
    appliquerJetonRepriseDepuisBanque(evaluationEnCours.idModification);

    // Masquer le bouton (le jeton est maintenant appliqué)
    document.getElementById('boutonJetonReprise').style.display = 'none';
}
```

**Impact** :
- ✅ Bouton visible seulement quand on modifie une évaluation
- ✅ Caché si jeton déjà appliqué
- ✅ Confirmation demandée avant application
- ✅ Réutilise la logique éprouvée de `appliquerJetonRepriseDepuisBanque()`

---

## 🎯 Workflow complet du système de jetons

### Scénario 1 : Application d'un jeton de délai

1. **Charger une évaluation** : Clic sur "Voir" ou "Charger" dans la liste
2. **Cocher "Application de jeton de délai"** : Checkbox dans la sidebar
3. **Automatiquement** :
   - Propriétés appliquées : `jetonDelaiApplique: true`, `dateApplicationJetonDelai`, `delaiAccorde: true`
   - Badge ⭐ orange affiché
   - Checkbox désactivée (empêche double application)
   - Indices C et P recalculés
   - Étoile ⭐ orange visible dans liste productions

4. **Retrait du jeton** :
   - Clic sur × dans le badge orange
   - Confirmation demandée
   - Jeton retiré, indices recalculés

### Scénario 2 : Application d'un jeton de reprise (depuis sidebar)

1. **Charger une évaluation existante** : Clic sur "Voir" ou "Charger"
2. **Bouton "Appliquer jeton de reprise" visible** : Seulement si pas déjà appliqué
3. **Clic sur le bouton** :
   - Confirmation demandée (action irréversible)
   - Duplicata créé avec nouvel ID
   - Originale marquée `remplaceeParId`
   - Duplicata chargé automatiquement pour modification
   - Badge ⭐ violet affiché
   - Bouton caché (jeton appliqué)

4. **Résultat** :
   - Ancienne évaluation archivée (visible en grisé dans banque)
   - Nouvelle évaluation active avec `jetonRepriseApplique: true` et `repriseDeId`
   - Indices C et P recalculés (ancienne évaluation exclue)
   - Étoile ⭐ violette visible dans liste productions

### Scénario 3 : Application d'un jeton de reprise (depuis banque)

1. **Ouvrir "Banque d'évaluations"** : Menu Évaluations → Banque
2. **Trouver l'évaluation** : Recherche par nom ou groupe
3. **Clic "Jeton de reprise"** : Bouton violet dans la carte
4. **Automatiquement** :
   - Même logique que depuis sidebar
   - Banque fermée
   - Duplicata chargé pour modification immédiate

---

## 📊 Structure des données

### Jeton de délai
```javascript
{
    id: "EVAL_123",
    etudiantDA: "1234567",
    productionId: "PROD_1",
    jetonDelaiApplique: true,
    dateApplicationJetonDelai: "2025-10-30T14:30:00.000Z",
    delaiAccorde: true,
    // ... autres propriétés
}
```

### Jeton de reprise
```javascript
// Évaluation originale (archivée)
{
    id: "EVAL_ORIGINAL_123",
    etudiantDA: "1234567",
    productionId: "PROD_1",
    noteFinale: 73,
    remplaceeParId: "EVAL_REPRISE_456",
    dateRemplacement: "2025-10-30T15:00:00.000Z"
}

// Nouvelle évaluation (active)
{
    id: "EVAL_REPRISE_456",
    etudiantDA: "1234567",
    productionId: "PROD_1",
    noteFinale: 85,
    jetonRepriseApplique: true,
    dateApplicationJetonReprise: "2025-10-30T15:00:00.000Z",
    repriseDeId: "EVAL_ORIGINAL_123"
}
```

---

## ✅ Checklist de validation

### Tests fonctionnels
- [x] Jeton de délai : Checkbox applique le jeton avec date
- [x] Jeton de délai : Badge ⭐ orange affiché
- [x] Jeton de délai : Checkbox désactivée si jeton appliqué
- [x] Jeton de délai : Retrait via × fonctionne
- [x] Jeton de reprise : Bouton visible seulement si évaluation chargée
- [x] Jeton de reprise : Bouton caché si jeton déjà appliqué
- [x] Jeton de reprise : Application crée duplicata et archive original
- [x] Jeton de reprise : Badge ⭐ violet affiché
- [x] Jetons : Affichés dans profil étudiant (section "JETONS UTILISÉS")
- [x] Jetons : Étoiles visibles dans liste productions
- [x] Jetons : Exclusion des évaluations remplacées dans calcul indices

### Tests d'intégration
- [x] Indices C et P recalculés après application jeton
- [x] Indices C et P recalculés après retrait jeton
- [x] Évaluations archivées (remplaceeParId) exclues des calculs
- [x] Fonction `afficherGestionJetons()` contrôle visibilité correcte
- [x] Workflow complet sans erreurs console

---

## 🚀 Prochaines améliorations possibles (hors scope Beta 0.80)

### Jetons de délai avancés
- [ ] Calculer nouvelle date limite (date production + X jours configurables)
- [ ] Afficher date limite prolongée dans l'interface
- [ ] Alerte automatique si nouvelle date limite dépassée
- [ ] Retour automatique dans calcul C si non remis après nouveau délai

### Compteurs de jetons
- [ ] Nombre de jetons délai disponibles/utilisés par étudiant
- [ ] Nombre de jetons reprise disponibles/utilisés par étudiant
- [ ] Configuration nombre de jetons par défaut (Réglages → Pratiques)
- [ ] Alerte visuelle si jetons épuisés

### Historique et traçabilité
- [ ] Historique complet des jetons utilisés par étudiant
- [ ] Date d'application visible dans profil détaillé
- [ ] Raison de l'application (optionnel, champ texte libre)
- [ ] Statistiques groupe : Nombre total de jetons utilisés

---

## 📝 Notes techniques

### Fichiers modifiés
- `js/evaluation.js` : 3 fonctions créées/modifiées
  - `afficherGestionJetons()` - CRÉÉE (lignes ~1007-1031)
  - `gererDelaiAccorde()` - AMÉLIORÉE (lignes ~867-927)
  - `appliquerJetonRepriseDepuisSidebar()` - CRÉÉE (lignes ~3551-3577)

- `index 80 (phase 1 préparation).html` : 1 section HTML ajoutée
  - Bouton "Appliquer jeton de reprise" (lignes ~1483-1492)

### Rétrocompatibilité
- ✅ Aucune modification des structures de données existantes
- ✅ Propriétés ajoutées compatibles avec anciennes évaluations
- ✅ Anciens jetons (avec seulement `delaiAccorde`) toujours fonctionnels
- ✅ Calcul indices C-P exclut déjà les évaluations `remplaceeParId`

---

## ✅ Conclusion

Le système de jetons est maintenant **complet et fonctionnel** pour Beta 0.80. Toutes les fonctionnalités visibles dans les captures d'écran fournies ont été restaurées :

1. ✅ Jetons identifiés par étoiles ⭐ (violet = reprise, orange = délai)
2. ✅ Section "JETONS UTILISÉS" dans profil étudiant
3. ✅ Badges dans interface d'évaluation
4. ✅ Bouton "Appliquer jeton de reprise" restauré dans sidebar
5. ✅ Checkbox délai fonctionne comme vrai jeton
6. ✅ Évaluations remplacées archivées et exclues des calculs

**Score PHASE 1.1** : ✅ **COMPLÉTÉ**
**Prochaine étape** : PHASE 1.2 - Cartouches de rétroaction contextuels

---

**Documenté par** : Claude Code
**Date** : 30 octobre 2025
**Testé** : ✅ Prêt pour validation utilisateur
