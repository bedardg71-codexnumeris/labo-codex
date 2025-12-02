# Guide d'exécution rapide - Tests Phase 5

**Version**: Beta 91.1
**Date**: 26 novembre 2025
**Durée estimée**: 30-45 minutes

---

## Préparation (5 minutes)

### 1. Ouvrir l'application
```bash
open "index 91.html"
```

### 2. Ouvrir la console du navigateur
- **Safari**: `Cmd + Option + C`
- **Chrome**: `Cmd + Option + J`

### 3. Vérifier la version
```
Réglages → Aperçu de la configuration
Vérifier: "Version Beta 91.1" ou ultérieure
```

### 4. Fichiers de test disponibles
- ✅ `test-echelle-idme.json` - Échelle IDME (SOLO)
- ✅ `test-grille-srpnf.json` - Grille SRPNF avec 5 critères
- ✅ `test-production-avec-dependance.json` - Production A2 référençant la grille

---

## Tests - Séquence recommandée

### ⚡ Test rapide (15 minutes) - Workflow complet

Cette séquence teste l'essentiel en un minimum de temps.

#### Étape 1: Importer les données de démo (si pas déjà fait)
```
Réglages → Gestion des données → Importer les données
Sélectionner: donnees-demo.json
Confirmer et recharger
```

#### Étape 2: Exporter configuration complète (Scénario 1)
```
Réglages → Gestion des données → Exporter ma configuration complète

Remplir le modal:
- Nom: Pratique PAN-Maîtrise Test
- Auteur: [Votre nom]
- Disciplines: Français, Littérature
- Niveau: Collégial
- Description: Configuration de test pour validation système import/export
- Email: [optionnel]
- Site: [optionnel]
☑️ Accepter CC BY-NC-SA 4.0

Cliquer: Exporter cette configuration
```

**Validation**:
- ✓ 2 fichiers téléchargés (JSON + TXT)
- ✓ Notification de succès affichée

#### Étape 3: Réinitialiser les données
```
Réglages → Gestion des données → Réinitialiser toutes les données

Confirmer 2 fois
Taper: EFFACER
Recharger la page
```

#### Étape 4: Importer dans cours vide (Scénario 2)
```
Réglages → Gestion des données → Importer une configuration
Sélectionner le fichier JSON exporté à l'étape 2

Vérifier le modal d'aperçu:
- Métadonnées complètes
- Compteurs de ressources
- Boutons présents

Cliquer: Importer cette configuration
Confirmer le rechargement
```

**Validation console**:
```javascript
console.log('Échelles:', db.getSync('echellesTemplates', []).length);
console.log('Grilles:', db.getSync('grillesTemplates', []).length);
console.log('Productions:', db.getSync('productions', []).length);
// Tous devraient avoir des valeurs > 0
```

#### Étape 5: Réimporter pour tester conflits (Scénario 3)
```
Réglages → Gestion des données → Importer une configuration
Sélectionner le MÊME fichier JSON

Cliquer: Importer cette configuration
Observer la console: messages de remapping
Confirmer le rechargement
```

**Validation console**:
```javascript
// Après rechargement
const echelles = db.getSync('echellesTemplates', []);
const grilles = db.getSync('grillesTemplates', []);
console.log('Échelles (doublées):', echelles.length);
console.log('Grilles (doublées):', grilles.length);

// Vérifier unicité des IDs
const idsEchelles = echelles.map(e => e.id);
const uniqueEchelles = new Set(idsEchelles);
console.log('IDs uniques?', uniqueEchelles.size === echelles.length);
```

---

### 🔬 Test approfondi (30-45 minutes) - Tous les scénarios

Suivre le document `PHASE_5_PLAN_TESTS.md` pour chaque scénario en détail.

---

## Commandes console utiles

### Inspection des données
```javascript
// Compter les ressources
db.getSync('echellesTemplates', []).length
db.getSync('grillesTemplates', []).length
db.getSync('productions', []).length

// Lister les IDs
db.getSync('echellesTemplates', []).map(e => e.id)
db.getSync('grillesTemplates', []).map(g => g.id)

// Vérifier les cartouches
Object.keys(localStorage).filter(k => k.startsWith('cartouches_'))

// Afficher une ressource complète
db.getSync('grillesTemplates', [])[0]
```

### Validation des références
```javascript
// Vérifier que les productions pointent vers des grilles existantes
const productions = db.getSync('productions', []);
const grilles = db.getSync('grillesTemplates', []);
const idsGrilles = new Set(grilles.map(g => g.id));

productions.forEach(p => {
    if (p.grilleId) {
        console.log(`${p.description}:`,
            idsGrilles.has(p.grilleId) ? '✓ OK' : '✗ MANQUANT');
    }
});
```

### Nettoyage pour nouveau test
```javascript
// Effacer toutes les ressources (pour recommencer)
db.setSync('echellesTemplates', []);
db.setSync('grillesTemplates', []);
db.setSync('productions', []);
// Puis recharger la page
```

---

## Tests spécifiques imports individuels

### Test 1: Import production SANS grille (Scénario 4)

```
1. Réinitialiser les données (ou cours vide)
2. Matériel → Productions → Importer des productions
3. Sélectionner: test-production-avec-dependance.json
4. Cliquer: Importer
5. Observer: Alert de dépendance manquante
6. Option A: Annuler
   OU
   Option B: Continuer malgré tout
```

**Validation si continué**:
```javascript
const prod = db.getSync('productions', [])[0];
const grilles = db.getSync('grillesTemplates', []);
console.log('Production référence:', prod.grilleId);
console.log('Grille existe?',
    grilles.find(g => g.id === prod.grilleId) ? 'OUI' : 'NON (attendu)');
```

### Test 2: Import grille puis production (Scénario 5)

```
1. Réinitialiser les données
2. Matériel → Critères d'évaluation → Importer des grilles
3. Sélectionner: test-grille-srpnf.json
4. Confirmer l'import
5. Matériel → Productions → Importer des productions
6. Sélectionner: test-production-avec-dependance.json
7. Cliquer: Importer
8. Observer: PAS de message de dépendance (import direct)
```

**Validation**:
```javascript
const prod = db.getSync('productions', [])[0];
const grilles = db.getSync('grillesTemplates', []);
const grille = grilles.find(g => g.id === prod.grilleId);
console.log('✓ Production:', prod.description);
console.log('✓ Grille associée:', grille.nom);
console.log('✓ Lien valide:', prod.grilleId === grille.id);
```

---

## Checklist de validation globale

Après avoir exécuté tous les tests, vérifier:

### Export
- [ ] Export configuration complète génère 2 fichiers
- [ ] Fichier JSON valide (parse sans erreur)
- [ ] Fichier LISEZMOI.txt complet et lisible
- [ ] Métadonnées enrichies présentes dans le JSON
- [ ] Tous les types de ressources inclus

### Import configuration complète
- [ ] Import dans cours vide fonctionne
- [ ] Import avec conflits détecte et remappe les IDs
- [ ] Toutes les ressources importées correctement
- [ ] Références internes préservées
- [ ] Aucune erreur console

### Import composants individuels
- [ ] Détection dépendances manquantes fonctionne
- [ ] Message d'avertissement clair
- [ ] Option d'annuler disponible
- [ ] Import possible malgré dépendances manquantes
- [ ] Import sans dépendances manquantes = fluide

### Interface utilisateur
- [ ] Boutons visibles et accessibles
- [ ] Modals informatifs
- [ ] Messages d'erreur clairs
- [ ] Notifications de succès
- [ ] Pas de régression des fonctionnalités existantes

---

## Rapport de bugs

Si un bug est détecté, documenter:

1. **Scénario**: Quel test?
2. **Étapes**: Comment reproduire?
3. **Attendu**: Quel était le résultat attendu?
4. **Réel**: Qu'est-il arrivé?
5. **Console**: Messages d'erreur?
6. **Impact**: Critique / Majeur / Mineur?

---

## Résultats attendus

### Export (Scénario 1)
✅ 2 fichiers téléchargés
✅ JSON structuré et valide
✅ LISEZMOI complet

### Import cours vide (Scénario 2)
✅ Import sans conflits
✅ Toutes ressources importées
✅ Zéro erreur console

### Import avec conflits (Scénario 3)
✅ Conflits détectés
✅ Remapping automatique
✅ Références mises à jour
✅ Message informatif

### Import sans dépendance (Scénario 4)
✅ Dépendance manquante détectée
✅ Avertissement affiché
✅ Import annulable
✅ Import possible malgré tout

### Import avec dépendance (Scénario 5)
✅ Import direct sans avertissement
✅ Références valides
✅ Fonctionnel immédiatement

---

## Temps estimés

| Test | Durée |
|------|-------|
| Préparation | 5 min |
| Test rapide | 15 min |
| Scénario 1 | 5 min |
| Scénario 2 | 5 min |
| Scénario 3 | 5 min |
| Scénario 4 | 5 min |
| Scénario 5 | 5 min |
| **Total complet** | **30-45 min** |

---

## Support

En cas de problème:
1. Vérifier la console pour erreurs JavaScript
2. Consulter `PHASE_5_PLAN_TESTS.md` pour détails
3. Vérifier que la version est Beta 91.1+
4. Essayer dans un autre navigateur (Safari vs Chrome)

---

**Bon testing!** 🚀
