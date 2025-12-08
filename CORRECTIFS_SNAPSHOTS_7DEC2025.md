# Correctifs système snapshots - 7 décembre 2025

## Problèmes identifiés et corrigés

### 1. ✅ CORRIGÉ: 75 snapshots au lieu de 30

**Cause**: `seancesCompletes` contenait toutes les dates du calendrier (75 jours), incluant des dates SANS séances configurées (tableaux vides).

**Solution**: Filtrage des dates vides dans `snapshots.js` ligne 581-583

```javascript
// AVANT (bugué):
const datesCours = Object.keys(seancesCompletes).sort();
// → 75 dates (incluant 45 dates vides)

// APRÈS (corrigé):
const datesCours = Object.keys(seancesCompletes)
    .filter(date => seancesCompletes[date] && seancesCompletes[date].length > 0)
    .sort();
// → ~30 dates (seulement dates avec séances configurées)
```

**Résultat attendu**: ~30 snapshots (2 séances/semaine × 15 semaines)

---

### 2. ✅ CORRIGÉ: Labels "Sem. undefined" dans les graphiques

**Cause**: Incohérence des noms de propriétés
- Snapshots créés avec `numeroSemaine`, `dateSeance`
- Graphiques cherchaient `numSemaine`, `dateDebut`, `dateFin`

**Solution**: Ajout de propriétés de compatibilité dans `snapshots.js` ligne 358-360

```javascript
const snapshot = {
    id: `SEANCE-${dateSeance}`,
    dateSeance: dateSeance,
    numeroSemaine: numeroSemaine, // Pour horaire.js
    numSemaine: numeroSemaine,    // ✨ Pour graphiques
    dateDebut: dateSeance,         // ✨ Pour obtenirSnapshotsEtudiant()
    dateFin: dateSeance,           // ✨ Pour obtenirSnapshotsEtudiant()
    timestamp: new Date().toISOString(),
    etudiants: snapshotsEtudiants,
    groupe: groupe
};
```

**Résultat attendu**: Labels "Sem. 1", "Sem. 2", etc. dans les graphiques

---

### 3. ⏳ À VÉRIFIER: Indices C, P, E ne s'affichent pas

**Causes possibles**:
1. **Snapshots créés AVANT les correctifs**: Les anciens snapshots n'ont pas les bonnes propriétés
2. **Aucune évaluation dans la base**: C, P, E sont null si aucune évaluation
3. **Évaluations trop récentes**: C, P, E apparaissent seulement vers semaine 7+

**Diagnostic**: Exécuter `debug-snapshots-indices.js` dans la console

---

## Instructions pour tester

### Étape 1: Recharger la page

**IMPORTANT**: Les fichiers JavaScript ont été modifiés, il faut recharger pour charger le nouveau code.

```
Safari: Cmd+R (ou Cmd+Shift+R pour forcer le rechargement)
Chrome: Cmd+Shift+R (rechargement forcé)
```

---

### Étape 2: Exécuter le diagnostic

1. Ouvrir la console JavaScript:
   - Safari: Option+Cmd+C
   - Chrome: Cmd+Shift+J

2. Copier-coller le contenu de `debug-snapshots-indices.js` dans la console

3. Analyser les résultats:
   - Combien de snapshots existent?
   - Les propriétés `numSemaine`, `dateDebut` existent-elles?
   - Les indices C, P, E sont-ils null ou ont-ils des valeurs?
   - Combien d'évaluations existent dans la base?

**Résultats possibles**:

**Cas A**: Snapshots encore incorrects (75 snapshots, propriétés manquantes)
→ Relancer la reconstruction (Étape 3)

**Cas B**: Snapshots corrects (30 snapshots, propriétés présentes) mais C/P/E null
→ Normal si aucune évaluation, ou évaluations récentes (semaine 7+)

**Cas C**: Snapshots corrects et C/P/E ont des valeurs
→ Recharger la page et vérifier les graphiques

---

### Étape 3: Relancer la reconstruction (si nécessaire)

**Seulement si le diagnostic montre des snapshots incorrects**

1. Aller dans Réglages → Snapshots (ou section appropriée)

2. Cliquer sur "Reconstruction rétroactive"

3. Confirmer l'action

4. Surveiller la console pendant la reconstruction:

```
✓ Séances du groupe détectées: 30    ← Devrait être ~30, pas 75!
  Première séance: 2025-01-15
  Dernière séance: 2025-05-15
  📊 Estimation: 30 snapshots × 30 étudiants × ~2 KB = ~2 MB

✓ Snapshots existants effacés (IndexedDB)
📸 [1/30] Séance 2025-01-15 (3%)...
  ✅ Séance 2025-01-15 capturée (30 étudiants)
📸 [2/30] Séance 2025-01-17 (7%)...
  ✅ Séance 2025-01-17 capturée (30 étudiants)
  ... (continuer jusqu'à 30)
✅ Reconstruction terminée : 30 captures par séance créées, 0 échecs
```

5. Si vous voyez "75 snapshots" ou des échecs, vérifier:
   - La page a bien été rechargée?
   - L'horaire est configuré (Réglages → Horaire)?
   - Les séances sont bien configurées (2 séances/semaine)?

---

### Étape 4: Vérifier les graphiques

1. **Graphique INDIVIDUEL** (Profil étudiant → Progression temporelle):
   - ✅ Labels: "Sem. 1", "Sem. 2", etc. (pas "undefined")
   - ✅ Courbe A (bleu): Pics discontinus (0%/100%) - **C'EST NORMAL!**
   - ⏳ Courbes C (orange), P (vert): Débutent vers semaine 7+
   - ⏳ Courbe E (violet): Débute vers semaine 7+

2. **Graphique GROUPE** (Aperçu → Évolution temporelle):
   - ✅ Labels: "Sem. 1", "Sem. 2", etc.
   - ✅ Courbe A moyenne: Lisse (~85-95%)
   - ⏳ Courbes C, P, E moyennes: Débutent vers semaine 7+, évolution progressive

---

## À propos des "pics discontinus"

### ✅ NORMAL pour l'assiduité (A)

**Graphique INDIVIDUEL**:
- A = 100% si présent, 0% si absent
- Crée des "dents de scie" (pics discontinus)
- **C'est le comportement attendu!**

**Graphique GROUPE**:
- A moyenne = ~85-95% (moyenne des présences)
- Courbe lisse, pas de pics

### ❌ ANORMAL pour C, P, E

Si C, P ou E ont des pics discontinus (0%/100%), c'est un bug dans le calcul.
C, P, E devraient évoluer progressivement (55% → 68% → 75% → 82%).

---

## Si C, P, E ne s'affichent toujours pas

### Vérifier les évaluations

```javascript
// Console JavaScript
const evaluations = db.getSync('evaluationsEtudiants', []);
console.log('Nombre d\'évaluations:', evaluations.length);

if (evaluations.length > 0) {
    const dates = evaluations
        .filter(e => e.dateEvaluation)
        .map(e => e.dateEvaluation)
        .sort();
    console.log('Première évaluation:', dates[0]);
    console.log('Dernière évaluation:', dates[dates.length - 1]);
}
```

**Si aucune évaluation**:
- C, P, E seront null (normal!)
- Solution: Ajouter des évaluations ou importer `donnees-demo.json`

**Si évaluations récentes (après semaine 7)**:
- C, P, E seront null avant cette date (normal!)
- Les courbes apparaîtront seulement à partir de la première évaluation

**Si évaluations présentes mais C/P/E toujours null**:
- Bug dans `calculerIndicesHistoriques()` → Ouvrir un nouveau ticket

---

## Fichiers modifiés

1. `js/snapshots.js`
   - Ligne 581-583: Filtrage dates vides
   - Ligne 358-360: Ajout propriétés compatibilité

2. `debug-seances.js` (nouveau)
   - Diagnostic séances complètes

3. `debug-snapshots-indices.js` (nouveau)
   - Diagnostic indices C, P, E

4. `CORRECTIFS_SNAPSHOTS_7DEC2025.md` (ce fichier)
   - Documentation complète

---

## Support

Si les problèmes persistent après avoir suivi ces étapes:

1. Copier-coller les résultats de `debug-snapshots-indices.js`
2. Faire une capture d'écran de la console pendant la reconstruction
3. Faire une capture d'écran des graphiques
4. Partager ces informations pour diagnostic approfondi

---

**Date**: 7 décembre 2025
**Version**: Beta 93
**Statut**: Correctifs appliqués, en attente de tests utilisateur
