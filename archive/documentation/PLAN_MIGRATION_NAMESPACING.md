# Plan de migration du namespacing

**Date**: 31 décembre 2025
**Objectif**: Corriger tous les modules pour utiliser `cle()` ou `obtenirDonneesSelonMode()` au lieu de lire directement les clés globales.

---

## Contexte du problème

### Architecture actuelle (problématique)

```
Données stockées:
├── a2025_groupeEtudiants     ← Données A2025 (30 étudiants)
├── demo_groupeEtudiants      ← Données démo (5 étudiants)
├── h2026_groupeEtudiants     ← Données H2026 (vide)
└── groupeEtudiants           ← Clé globale (devrait être vide)

Fonction cle():
├── Trimestre actif = "a2025"
├── cle('groupeEtudiants') → "a2025_groupeEtudiants" ✅
└── Fonctionne correctement

Problème:
├── 20+ modules lisent db.getSync('groupeEtudiants', [])
├── Ils NE PASSENT PAS par cle()
└── Ils lisent la clé globale (vide ou obsolète)
```

### Architecture cible

```
Tous les modules utilisent:
├── obtenirDonneesSelonMode('groupeEtudiants')  ← Préféré (filtrage auto)
├── db.getSync(cle('groupeEtudiants'), [])      ← Alternative directe
└── JAMAIS db.getSync('groupeEtudiants', [])    ← Interdit
```

---

## Modules à corriger

### Liste des occurrences `db.getSync('groupeEtudiants', [])`

| Fichier | Ligne | Contexte | Priorité |
|---------|-------|----------|----------|
| `trimestres.js` | 308, 391, 737, 1292 | Migration/archivage | Moyenne |
| `evaluation.js` | 2487, 2681, 4617, 4920 | Formulaire évaluation | **Haute** |
| `modes.js` | 373, 442 | Anonymisation | Moyenne |
| `horaire.js` | 550 | Affichage horaire | Basse |
| `cours.js` | 999 | Gestion cours | Moyenne |
| `main.js` | 186 | Initialisation | Moyenne |
| `profil-etudiant.js` | 8199 | Profil | **Haute** |
| `statistiques.js` | 102 | Stats | Moyenne |
| `primo-accueil.js` | 27, 341 | Primo | Basse |
| `primo-validation-champs.js` | 170 | Validation | Basse |
| `migrations.js` | 25 | Migration | Basse |
| `rapport-bug.js` | 119 | Debug | Basse |

**Total**: ~20 occurrences dans 12 fichiers

---

## Stratégie de migration

### Phase 1: Modules critiques (priorité haute)

1. **evaluation.js** (4 occurrences)
   - Impact: Formulaire d'évaluation ne trouve pas les étudiants
   - Correction: Remplacer par `obtenirDonneesSelonMode('groupeEtudiants')`

2. **profil-etudiant.js** (1 occurrence)
   - Impact: Profil étudiant ne charge pas
   - Correction: Remplacer par `obtenirDonneesSelonMode('groupeEtudiants')`

### Phase 2: Modules secondaires (priorité moyenne)

3. **trimestres.js** (4 occurrences)
   - Contexte: Fonctions d'archivage et migration
   - Note: Certaines lectures sont intentionnellement globales

4. **modes.js** (2 occurrences)
   - Contexte: Anonymisation des noms
   - Correction: Utiliser `cle()` ou laisser global si intentionnel

5. **cours.js** (1 occurrence)
   - Contexte: Statistiques cours

6. **main.js** (1 occurrence)
   - Contexte: Initialisation

7. **statistiques.js** (1 occurrence)
   - Contexte: Calculs statistiques

### Phase 3: Modules tertiaires (priorité basse)

8. **horaire.js** (1 occurrence)
9. **primo-accueil.js** (2 occurrences)
10. **primo-validation-champs.js** (1 occurrence)
11. **migrations.js** (1 occurrence)
12. **rapport-bug.js** (1 occurrence)

---

## Pattern de correction

### Avant (problématique)
```javascript
const etudiants = db.getSync('groupeEtudiants', []);
```

### Après (correct)
```javascript
// Option 1: Via obtenirDonneesSelonMode (recommandé)
const etudiants = obtenirDonneesSelonMode('groupeEtudiants');

// Option 2: Via cle() directement
const etudiants = db.getSync(cle('groupeEtudiants'), []);
```

### Cas spéciaux

Certains modules peuvent intentionnellement lire TOUTES les données (tous trimestres). Dans ce cas, documenter avec un commentaire:

```javascript
// ⚠️ INTENTIONNEL: Lecture globale pour migration/archivage multi-trimestres
const tousLesEtudiants = db.getSync('groupeEtudiants', []);
```

---

## Clés concernées par le namespacing

Les mêmes corrections doivent être appliquées pour toutes les clés namespacées:

| Clé | Occurrences directes estimées |
|-----|-------------------------------|
| `groupeEtudiants` | ~20 |
| `productions` | ~15 |
| `presences` | ~10 |
| `evaluationsSauvegardees` | ~10 |
| `calendrierComplet` | ~5 |
| `horaireHebdo` | ~5 |
| Autres | ~10 |

**Total estimé**: ~75 occurrences à vérifier/corriger

---

## Commande pour trouver les occurrences

```bash
# Trouver toutes les lectures directes de clés namespacées
grep -rn "getSync('groupeEtudiants" js/
grep -rn "getSync('productions" js/
grep -rn "getSync('presences" js/
grep -rn "getSync('evaluationsSauvegardees" js/
grep -rn "getSync('calendrierComplet" js/
grep -rn "getSync('horaireHebdo" js/
```

---

## Tests de validation

Après chaque correction:

1. Vérifier que le trimestre A2025 affiche 30 étudiants
2. Vérifier que le mode démo affiche 5 étudiants
3. Vérifier que le changement de trimestre isole les données
4. Vérifier qu'aucune erreur console n'apparaît

---

## Estimation du travail

| Phase | Fichiers | Occurrences | Temps estimé |
|-------|----------|-------------|--------------|
| Phase 1 | 2 | 5 | 1-2h |
| Phase 2 | 5 | 9 | 2-3h |
| Phase 3 | 5 | 6 | 1-2h |
| Tests | - | - | 1-2h |
| **Total** | **12** | **~20** | **5-9h** |

---

## Prochaines étapes

1. [ ] Faire un backup complet avant corrections
2. [ ] Corriger evaluation.js (Phase 1)
3. [ ] Corriger profil-etudiant.js (Phase 1)
4. [ ] Tester A2025 et démo
5. [ ] Corriger Phase 2
6. [ ] Corriger Phase 3
7. [ ] Tests complets
8. [ ] Commit final
