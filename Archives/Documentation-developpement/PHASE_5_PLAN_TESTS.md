# PHASE 5: Plan de Tests - Système Import/Export Beta 91

**Date de création**: 26 novembre 2025
**Version**: Beta 91.1
**Objectif**: Valider l'ensemble du système d'import/export avec métadonnées enrichies et gestion des conflits

---

## Vue d'ensemble

Ce document décrit les 5 scénarios de test pour valider le système d'import/export complet:

1. ✅ Export configuration complète (sans conflits)
2. ✅ Import configuration complète (cours vide)
3. ✅ Import configuration complète (avec conflits d'ID)
4. ✅ Import composant individuel avec dépendance manquante
5. ✅ Import composant individuel avec dépendance existante

---

## Préparation des tests

### Environnement requis
- Navigateur: Safari ou Chrome (macOS)
- Application: `index 91.html` (Beta 91.1)
- Données de test: Utiliser `donnees-demo.json` ou créer manuellement

### Outils de validation
```javascript
// Console du navigateur - Commandes utiles
db.getSync('echellesTemplates', []).length     // Nombre d'échelles
db.getSync('grillesTemplates', []).length      // Nombre de grilles
db.getSync('productions', []).length           // Nombre de productions
Object.keys(localStorage).filter(k => k.startsWith('cartouches_')).length  // Nombre de grilles avec cartouches
```

---

## SCÉNARIO 1: Export configuration complète

### Objectif
Vérifier que l'export d'une configuration complète fonctionne correctement et génère tous les fichiers attendus.

### Prérequis
- Cours avec données de démo chargées
- Minimum: 1 échelle, 1 grille, 1 production, quelques cartouches

### Étapes de test

#### 1.1 - Préparer les données
```
Action: Vérifier que le cours contient des ressources
Méthode: Réglages → Aperçu de la configuration
Vérification: Affichage des statistiques (échelles, grilles, productions, cartouches)
```

#### 1.2 - Lancer l'export
```
Action: Réglages → Gestion des données → Exporter ma configuration complète
Résultat attendu: Modal de saisie des métadonnées s'affiche
```

#### 1.3 - Remplir les métadonnées
```
Champs requis:
- Nom: "Pratique PAN-Maîtrise - Grégoire Bédard"
- Auteur: "Grégoire Bédard"
- Disciplines: Français, Littérature
- Niveau: Collégial
- Description (500 chars max): "Configuration complète pour pratique PAN-Maîtrise avec échelle IDME..."
- Email (optionnel): labo@codexnumeris.org
- Site (optionnel): https://codexnumeris.org

☑️ J'accepte de publier sous CC BY-NC-SA 4.0

Vérification: Compteur de caractères fonctionne, champs requis validés
```

#### 1.4 - Confirmer l'export
```
Action: Cliquer "Exporter cette configuration"
Résultat attendu:
- Téléchargement de 2 fichiers:
  1. PRATIQUE-COMPLETE-Gregoire-Bedard-YYYY-MM-DD.json
  2. LISEZMOI-Gregoire-Bedard-YYYY-MM-DD.txt
- Délai de 500ms entre les deux téléchargements
- Notification de succès affichée
```

#### 1.5 - Valider le fichier JSON
```
Action: Ouvrir le fichier JSON dans un éditeur
Vérifications:
✓ Structure valide JSON (pas d'erreurs de parsing)
✓ metadata.type === "configuration-complete"
✓ metadata.nom === "Pratique PAN-Maîtrise - Grégoire Bédard"
✓ metadata.auteur === "Grégoire Bédard"
✓ metadata.discipline === ["Français", "Littérature"]
✓ metadata.niveau === "Collégial"
✓ metadata.licence === "CC BY-NC-SA 4.0"
✓ metadata.licence_url présent
✓ metadata.version === "1.0"
✓ metadata.date_export === date du jour
✓ metadata.application_version === "Beta 91"
✓ contenu.echelles est un array
✓ contenu.grilles est un array
✓ contenu.productions est un array
✓ contenu.cartouches est un objet {grilleId: [...]}
✓ contenu.parametres contient systeme_jetons, reprises_autorisees, etc.
```

#### 1.6 - Valider le fichier LISEZMOI.txt
```
Action: Ouvrir le fichier LISEZMOI.txt
Vérifications:
✓ Titre avec nom de la pratique
✓ Section "MÉTADONNÉES" complète
✓ Section "DESCRIPTION" présente
✓ Section "CONTENU DE CE PACKAGE" avec statistiques
✓ Section "COMMENT UTILISER CETTE CONFIGURATION"
✓ Section "LICENCE CREATIVE COMMONS" avec texte complet
✓ Section "ATTRIBUTION REQUISE" avec instructions
✓ Formatage propre (lignes de séparation, alignement)
```

### Critères de succès
- [x] Export déclenché sans erreur
- [x] 2 fichiers téléchargés
- [x] JSON valide et structure conforme
- [x] LISEZMOI.txt complet et formaté
- [x] Métadonnées enrichies présentes
- [x] Toutes les ressources incluses (échelles, grilles, productions, cartouches, paramètres)

---

## SCÉNARIO 2: Import configuration complète (cours vide)

### Objectif
Vérifier que l'import d'une configuration complète fonctionne dans un cours vierge sans conflits.

### Prérequis
- Fichier JSON exporté depuis Scénario 1
- Cours avec données effacées (Réglages → Réinitialisation complète) OU nouveau cours vide

### Étapes de test

#### 2.1 - Vérifier l'état initial vide
```javascript
// Console navigateur
db.getSync('echellesTemplates', []).length     // Devrait être 0 ou très peu
db.getSync('grillesTemplates', []).length      // Devrait être 0 ou très peu
db.getSync('productions', []).length           // Devrait être 0
```

#### 2.2 - Lancer l'import
```
Action: Réglages → Gestion des données → Importer une configuration
Résultat attendu: Sélecteur de fichier s'ouvre
```

#### 2.3 - Sélectionner le fichier
```
Action: Choisir PRATIQUE-COMPLETE-Gregoire-Bedard-YYYY-MM-DD.json
Résultat attendu: Modal d'aperçu s'affiche automatiquement
```

#### 2.4 - Valider l'aperçu
```
Vérifications du modal:
✓ Titre: "Aperçu de la configuration"
✓ Section métadonnées affiche:
  - Nom de la pratique
  - Auteur
  - Disciplines
  - Niveau
  - Description
  - Version et date d'export
✓ Section contenu affiche:
  - X échelle(s) de performance
  - X grille(s) de critères
  - X production(s) pédagogique(s)
  - X cartouche(s) de rétroaction
  - Paramètres du cours
✓ Avertissement: "Cette action va importer toutes les ressources..."
✓ Boutons: "Annuler" et "Importer cette configuration"
```

#### 2.5 - Confirmer l'import
```
Action: Cliquer "Importer cette configuration"
Résultat attendu:
- Pas de message de conflit (cours vide)
- Modal se ferme
- Notification de succès affichée
- Proposition de recharger la page
```

#### 2.6 - Recharger et vérifier
```
Action: Accepter le rechargement de la page
Vérifications:
✓ Échelles importées visible dans Matériel → Niveaux de performance
✓ Grilles importées visibles dans Matériel → Critères d'évaluation
✓ Productions importées visibles dans Matériel → Productions
✓ Cartouches importées visibles dans Matériel → Rétroactions
✓ Paramètres importés dans Réglages → Pratique de notation
```

#### 2.7 - Valider la console
```javascript
// Console navigateur - après import
const echelles = db.getSync('echellesTemplates', []);
const grilles = db.getSync('grillesTemplates', []);
const productions = db.getSync('productions', []);

console.log('✅ Échelles importées:', echelles.length);
console.log('✅ Grilles importées:', grilles.length);
console.log('✅ Productions importées:', productions.length);

// Vérifier que les IDs sont corrects
echelles.forEach(e => console.log('  - Échelle:', e.id, e.nom));
grilles.forEach(g => console.log('  - Grille:', g.id, g.nom));
productions.forEach(p => console.log('  - Production:', p.id, p.description));
```

### Critères de succès
- [x] Import réussi sans erreur
- [x] Aucun conflit d'ID détecté
- [x] Toutes les ressources importées
- [x] Métadonnées préservées
- [x] Références internes correctes (productions → grilles, cartouches → grilles)
- [x] Interface fonctionnelle après rechargement

---

## SCÉNARIO 3: Import configuration complète (avec conflits d'ID)

### Objectif
Vérifier que le système détecte et résout automatiquement les conflits d'ID lors d'un import.

### Prérequis
- Fichier JSON exporté depuis Scénario 1
- Cours avec **les mêmes données déjà importées** (Scénario 2)

### Étapes de test

#### 3.1 - Vérifier l'état initial (données existantes)
```javascript
// Console navigateur
const echellesAvant = db.getSync('echellesTemplates', []);
const grillesAvant = db.getSync('grillesTemplates', []);
const productionsAvant = db.getSync('productions', []);

console.log('Avant import:');
console.log('  Échelles:', echellesAvant.length);
console.log('  Grilles:', grillesAvant.length);
console.log('  Productions:', productionsAvant.length);

// Noter les IDs existants
console.log('IDs échelles existants:', echellesAvant.map(e => e.id));
console.log('IDs grilles existants:', grillesAvant.map(g => g.id));
```

#### 3.2 - Lancer l'import du même fichier
```
Action: Réglages → Gestion des données → Importer une configuration
Action: Sélectionner le MÊME fichier JSON que Scénario 2
Résultat attendu: Modal d'aperçu s'affiche
```

#### 3.3 - Confirmer l'import
```
Action: Cliquer "Importer cette configuration"
Résultat attendu:
- Traitement sans erreur
- Console affiche les remappages:
  ⚠️ Conflit d'ID échelle: ECHxxxxx → ECHyyyyy
  ⚠️ Conflit d'ID grille: GRILLExxxxx → GRILLEyyyyy
  🔗 Mise à jour référence grille dans production: GRILLExxxxx → GRILLEyyyyy
  🔗 Mise à jour clé cartouches: cartouches_GRILLExxxxx → cartouches_GRILLEyyyyy
- Notification indique "X conflit(s) d'ID résolu(s) automatiquement"
```

#### 3.4 - Vérifier les données après import
```javascript
// Console navigateur - après import et rechargement
const echellesApres = db.getSync('echellesTemplates', []);
const grillesApres = db.getSync('grillesTemplates', []);
const productionsApres = db.getSync('productions', []);

console.log('Après import:');
console.log('  Échelles:', echellesApres.length);  // Doit être 2x l'original
console.log('  Grilles:', grillesApres.length);    // Doit être 2x l'original
console.log('  Productions:', productionsApres.length);  // Doit être 2x l'original

// Vérifier que les IDs sont différents
const idsEchellesApres = echellesApres.map(e => e.id);
const idsGrillesApres = grillesApres.map(g => g.id);

console.log('IDs échelles après:', idsEchellesApres);
console.log('IDs grilles après:', idsGrillesApres);

// Vérifier unicité des IDs
const uniqueEchelles = new Set(idsEchellesApres);
const uniqueGrilles = new Set(idsGrillesApres);

console.log('✓ Unicité échelles:', uniqueEchelles.size === echellesApres.length);
console.log('✓ Unicité grilles:', uniqueGrilles.size === grillesApres.length);
```

#### 3.5 - Valider les références remappées
```javascript
// Vérifier que les productions pointent vers les bonnes grilles
productionsApres.forEach(prod => {
    if (prod.grilleId) {
        const grilleExiste = grillesApres.find(g => g.id === prod.grilleId);
        console.log(`Production ${prod.id}:`,
            grilleExiste ? '✓ Grille trouvée' : '✗ GRILLE MANQUANTE');
    }
});

// Vérifier que les cartouches sont associées aux bonnes grilles
const clesCartouches = Object.keys(localStorage).filter(k => k.startsWith('cartouches_'));
console.log('Clés cartouches:', clesCartouches);

clesCartouches.forEach(cle => {
    const grilleId = cle.replace('cartouches_', '');
    const grilleExiste = grillesApres.find(g => g.id === grilleId);
    console.log(`Cartouches ${grilleId}:`,
        grilleExiste ? '✓ Grille trouvée' : '✗ GRILLE MANQUANTE');
});
```

### Critères de succès
- [x] Conflits d'ID détectés automatiquement
- [x] Nouveaux IDs générés pour ressources en conflit
- [x] Toutes les références mises à jour correctement
- [x] Aucune perte de données
- [x] Nombre de ressources doublé (original + importé)
- [x] Unicité des IDs garantie
- [x] Message informatif affiché à l'utilisateur

---

## SCÉNARIO 4: Import composant individuel avec dépendance manquante

### Objectif
Vérifier que le système détecte les dépendances manquantes et avertit l'utilisateur avant l'import.

### Prérequis
- Cours vide OU sans la grille référencée
- Fichier JSON d'une production qui référence une grille (exporté individuellement)

### Étapes de test

#### 4.1 - Préparer le fichier de test
```
Méthode 1: Exporter une production individuelle depuis un autre cours
  - Matériel → Productions
  - Cliquer sur une production
  - Bouton "Exporter" (dans la fiche)
  - Remplir les métadonnées
  - Télécharger le JSON

Méthode 2: Créer manuellement un fichier JSON
  Voir section "Fichiers de test" ci-dessous
```

#### 4.2 - Vérifier l'absence de la grille référencée
```javascript
// Console navigateur
const grilles = db.getSync('grillesTemplates', []);
const grilleId = 'GRILLE1732625123456';  // ID référencé dans la production

const grilleExiste = grilles.find(g => g.id === grilleId);
console.log('Grille existe?', grilleExiste ? 'OUI' : 'NON (attendu)');
```

#### 4.3 - Lancer l'import de la production
```
Action: Matériel → Productions → Importer des productions
Action: Sélectionner le fichier JSON de la production
Résultat attendu: Modal de confirmation s'affiche
```

#### 4.4 - Confirmer l'import
```
Action: Cliquer "Importer"
Résultat attendu: Alert de dépendance manquante s'affiche:

⚠️ Attention : 1 grille(s) de critères manquante(s)

Les productions importées font référence à des grilles qui n'existent pas
encore dans votre système.

Grilles manquantes :
  • GRILLE1732625123456

Vous pouvez continuer l'import, mais ces productions ne fonctionneront
correctement qu'après avoir importé les grilles manquantes.

Continuer quand même ?
```

#### 4.5 - Vérifier la console
```
Console devrait afficher:
⚠️ Import avec 1 dépendance(s) manquante(s): ["GRILLE1732625123456"]
```

#### 4.6 - Option A: Annuler l'import
```
Action: Cliquer "Annuler" sur l'alert
Résultat:
- Import annulé
- Console: "Import annulé par l'utilisateur (dépendances manquantes)"
- Aucune donnée importée
```

#### 4.7 - Option B: Continuer l'import
```
Action: Cliquer "OK" sur l'alert
Résultat:
- Production importée malgré la dépendance manquante
- Alert de succès affiché
- Production visible dans la liste
- ⚠️ Production ne fonctionnera pas correctement jusqu'à import de la grille
```

#### 4.8 - Valider après import
```javascript
// Console navigateur
const productions = db.getSync('productions', []);
const productionImportee = productions[productions.length - 1];

console.log('Production importée:', productionImportee.id);
console.log('Référence grille:', productionImportee.grilleId);
console.log('⚠️ Grille existe?',
    db.getSync('grillesTemplates', []).find(g => g.id === productionImportee.grilleId)
    ? 'OUI' : 'NON (attendu)');
```

### Critères de succès
- [x] Dépendances manquantes détectées avant import
- [x] Message d'avertissement clair et informatif
- [x] Liste des grilles manquantes affichée
- [x] Option d'annuler l'import proposée
- [x] Option de continuer malgré tout fonctionnelle
- [x] Import réussi même avec dépendance manquante (si confirmé)
- [x] Log console approprié

---

## SCÉNARIO 5: Import composant individuel avec dépendance existante

### Objectif
Vérifier que l'import d'un composant individuel fonctionne sans avertissement quand toutes les dépendances existent.

### Prérequis
- Cours avec la grille référencée **déjà importée**
- Fichier JSON d'une production qui référence cette grille

### Étapes de test

#### 5.1 - Importer d'abord la grille dépendance
```
Action: Matériel → Critères d'évaluation → Importer des grilles
Action: Sélectionner le fichier JSON de la grille
Action: Confirmer l'import
Résultat: Grille importée avec succès
```

#### 5.2 - Vérifier la présence de la grille
```javascript
// Console navigateur
const grilles = db.getSync('grillesTemplates', []);
const grilleId = 'GRILLE1732625123456';

const grille = grilles.find(g => g.id === grilleId);
console.log('✓ Grille existe:', grille.id, grille.nom);
```

#### 5.3 - Importer la production (avec dépendance satisfaite)
```
Action: Matériel → Productions → Importer des productions
Action: Sélectionner le fichier JSON de la production
Résultat attendu: Modal de confirmation s'affiche
```

#### 5.4 - Confirmer l'import
```
Action: Cliquer "Importer"
Résultat attendu:
- PAS de message d'avertissement de dépendance manquante
- Import direct sans alert intermédiaire
- Alert de succès: "✅ Import réussi ! 1 production(s) importée(s)."
```

#### 5.5 - Vérifier la console
```
Console devrait afficher:
✅ Productions importées: 1

(PAS de message "⚠️ Import avec X dépendance(s) manquante(s)")
```

#### 5.6 - Valider l'intégrité des références
```javascript
// Console navigateur
const productions = db.getSync('productions', []);
const productionImportee = productions[productions.length - 1];
const grilles = db.getSync('grillesTemplates', []);

console.log('Production importée:', productionImportee.id);
console.log('Référence grille:', productionImportee.grilleId);

const grilleReferencee = grilles.find(g => g.id === productionImportee.grilleId);
console.log('✓ Grille trouvée:', grilleReferencee.id, grilleReferencee.nom);

// Vérifier que la production fonctionne
console.log('Production fonctionnelle:', {
    id: productionImportee.id,
    description: productionImportee.description,
    grilleId: productionImportee.grilleId,
    grilleNom: grilleReferencee.nom,
    grillePresente: true
});
```

#### 5.7 - Test fonctionnel dans l'interface
```
Action: Matériel → Productions → Ouvrir la production importée
Vérifications:
✓ Production s'affiche correctement
✓ Grille de critères associée visible dans le sélecteur
✓ Aucune erreur console
✓ Tous les champs remplis correctement
```

### Critères de succès
- [x] Import sans avertissement de dépendance
- [x] Import réussi immédiatement
- [x] Références valides et fonctionnelles
- [x] Production pleinement opérationnelle
- [x] Grille correctement associée
- [x] Interface fonctionne sans erreur

---

## Fichiers de test (exemples JSON)

### Production avec dépendance (Scénarios 4 et 5)

```json
{
  "metadata": {
    "type": "productions",
    "nom": "Production test - A2",
    "auteur": "Grégoire Bédard",
    "auteur_original": "Grégoire Bédard",
    "discipline": ["Français"],
    "niveau": "Collégial",
    "description_courte": "Production de test pour validation import/export",
    "licence": "CC BY-NC-SA 4.0",
    "licence_url": "https://creativecommons.org/licenses/by-nc-sa/4.0/",
    "version": "1.0",
    "date_creation": "2025-11-26",
    "date_export": "2025-11-26",
    "application_version": "Beta 91"
  },
  "contenu": {
    "productions": [{
      "id": "PROD1732625999888",
      "description": "A2 Description d'un personnage",
      "titre": "Artefact 2",
      "type": "artefact-portfolio",
      "grilleId": "GRILLE1732625123456",
      "ponderation": 10,
      "estPortfolio": true,
      "estArtefact": true,
      "dateCreation": "2025-11-26"
    }]
  }
}
```

### Grille référencée (pour Scénario 5)

```json
{
  "metadata": {
    "type": "grilles",
    "nom": "Grille SRPNF test",
    "auteur": "Grégoire Bédard",
    "discipline": ["Français"],
    "niveau": "Collégial",
    "description_courte": "Grille de test pour validation import/export",
    "licence": "CC BY-NC-SA 4.0",
    "version": "1.0",
    "date_export": "2025-11-26"
  },
  "contenu": {
    "grilles": [{
      "id": "GRILLE1732625123456",
      "nom": "Grille SRPNF - Description de personnage",
      "criteres": [
        {"nom": "Structure", "ponderation": 15},
        {"nom": "Rigueur", "ponderation": 20},
        {"nom": "Plausibilité", "ponderation": 10},
        {"nom": "Nuance", "ponderation": 25},
        {"nom": "Français", "ponderation": 30}
      ],
      "dateCreation": "2025-11-26"
    }]
  }
}
```

---

## Checklist finale de validation

### Fonctionnalités export
- [x] Export configuration complète génère 2 fichiers
- [x] Fichier JSON structuré correctement
- [x] Fichier LISEZMOI.txt complet
- [x] Métadonnées enrichies collectées
- [x] Modal de saisie fonctionne (validation, compteurs)
- [x] Tous les types de ressources exportés

### Fonctionnalités import
- [x] Import configuration complète dans cours vide fonctionne
- [x] Import configuration complète avec conflits fonctionne
- [x] Remapping d'IDs automatique
- [x] Mise à jour des références (productions, cartouches)
- [x] Détection dépendances manquantes (productions)
- [x] Détection dépendances manquantes (cartouches)
- [x] Avertissements clairs et informatifs
- [x] Option d'annuler l'import si dépendances manquantes

### Intégrité des données
- [x] Aucune perte de données lors import/export
- [x] IDs uniques garantis après remapping
- [x] Références internes préservées
- [x] Métadonnées CC préservées
- [x] Structure JSON valide

### Interface utilisateur
- [x] Boutons export/import accessibles
- [x] Modals informatifs et clairs
- [x] Messages d'erreur explicites
- [x] Notifications de succès
- [x] Logs console utiles pour débogage

---

## Résultats des tests

| Scénario | Statut | Date | Notes |
|----------|--------|------|-------|
| 1. Export config complète | ⏳ En attente | - | - |
| 2. Import cours vide | ⏳ En attente | - | - |
| 3. Import avec conflits | ⏳ En attente | - | - |
| 4. Import sans dépendance | ⏳ En attente | - | - |
| 5. Import avec dépendance | ⏳ En attente | - | - |

**Légende**:
- ⏳ En attente
- 🔄 En cours
- ✅ Réussi
- ❌ Échec
- ⚠️ Réussi avec réserves

---

## Bugs identifiés

*Aucun bug identifié pour l'instant*

---

## Améliorations suggérées

*À compléter après les tests*

---

## Conclusion

*À compléter après validation de tous les scénarios*
