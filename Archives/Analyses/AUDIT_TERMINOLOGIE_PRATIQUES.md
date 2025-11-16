# Audit terminologie - Système de pratiques

**Date** : 13 novembre 2025
**Objectif** : Franciser tous les termes anglais avant Phase 2

---

## 1. Fichiers à renommer

| Actuel | Proposé | Raison |
|--------|---------|--------|
| `pratique-registre.js` | `pratique-registre.js` | "registry" → "registre" |
| `pratique-interface.js` | **GARDER** | "interface" est un terme accepté en français tech |
| `pratique-test.js` | **GARDER** ou `pratique-tests.js` | "test" est accepté, pluriel recommandé |
| `migration-pratiques.js` | **GARDER** | Déjà en français |

---

## 2. Noms de fonctions à franciser

### pratique-registre.js → pratique-registre.js

| Fonction actuelle | Proposée | Statut |
|-------------------|----------|--------|
| `enregistrerPratique` | **GARDER** | ✅ Déjà en français |
| `obtenirPratiqueActive` | **GARDER** | ✅ Déjà en français |
| `obtenirIdPratiqueActive` | **GARDER** | ✅ Déjà en français |
| `listerPratiquesDisponibles` | **GARDER** | ✅ Déjà en français |
| `pratiqueEstDisponible` | **GARDER** | ✅ Déjà en français |
| `obtenirPratiqueParId` | **GARDER** | ✅ Déjà en français |
| `initialiserRegistrePratiques` | **GARDER** | ✅ Déjà en français |
| `invaliderCachePratique` | **GARDER** | ✅ Déjà en français |
| `desenregistrerPratique` | **GARDER** | ✅ Déjà en français |
| `viderRegistre` | **GARDER** | ✅ Déjà en français |

**Verdict** : ✅ Toutes les fonctions sont DÉJÀ en français !

---

## 3. Variables globales à franciser

### pratique-registre.js

| Variable actuelle | Proposée | Ligne |
|-------------------|----------|-------|
| `pratiquesEnregistrees` | **GARDER** | 28 ✅ |
| `pratiqueCacheActive` | **GARDER** | 34 ✅ |
| `pratiqueCacheId` | **GARDER** | 35 ✅ |

**Verdict** : ✅ Toutes les variables sont DÉJÀ en français !

---

## 4. Termes dans commentaires et documentation

### Termes anglais courants trouvés

| Terme anglais | Équivalent français | Contexte |
|---------------|---------------------|----------|
| "Map" | `Map` | Type JavaScript natif - **GARDER** |
| "cache" | "cache" | Terme accepté en français tech - **GARDER** |
| "localStorage" | `localStorage` | API JavaScript native - **GARDER** |
| "ID" | "ID" ou "identifiant" | "ID" accepté, mais préférer "identifiant" dans les phrases |
| "instance" | "instance" | Terme accepté en français tech - **GARDER** |

### Commentaires à franciser

**pratique-interface.js** :
- Ligne 422 : `export {}; // Marquer comme module ES6` ✅ Déjà en français

**pratique-registre.js** :
Tous les commentaires sont **DÉJÀ en français** !

---

## 5. Structure localStorage et propriétés JSON

### Termes anglais dans les structures de données

Ces termes sont des **clés JSON** utilisées dans localStorage. Question : faut-il les franciser ?

| Clé actuelle | Proposée | Impact |
|--------------|----------|--------|
| `modalitesEvaluation.pratique` | **GARDER** | Déjà en français |
| `modalitesEvaluation.configPAN` | **GARDER** | Déjà en français |
| `evaluationsSauvegardees` | **GARDER** | Déjà en français |
| `productions` | **GARDER** | Déjà en français |
| `indicesCP` | **GARDER** | Déjà en français |

**Verdict** : ✅ Toutes les clés localStorage sont DÉJÀ en français !

---

## 6. Classes et méthodes (interface IPratique)

### Noms de classes

| Classe actuelle | Proposée | Fichier |
|-----------------|----------|---------|
| `PratiquePANMaitrise` | **GARDER** | pratique-pan-maitrise.js ✅ |
| `PratiqueSommative` | **GARDER** | pratique-sommative.js ✅ |

### Méthodes de l'interface

Toutes les méthodes sont **DÉJÀ en français** :
- `obtenirNom()`
- `obtenirId()`
- `obtenirDescription()`
- `calculerPerformance()`
- `calculerCompletion()`
- `detecterDefis()`
- `identifierPattern()`
- `genererCibleIntervention()`

**Verdict** : ✅ Interface 100% en français !

---

## 7. Messages de console (logs)

### pratique-pan-maitrise.js

| Ligne | Message actuel | Statut |
|-------|----------------|--------|
| 22 | `'🎯 Initialisation de la pratique PAN-Maîtrise'` | ✅ Français |
| 57 | `'[PAN] DA invalide:'` | ✅ Français |
| 79 | `'[PAN] Aucune évaluation pour DA'` | ✅ Français |
| 96 | `'[PAN] Performance DA ...'` | ✅ Français |
| ... | (tous les autres) | ✅ Français |

### pratique-sommative.js

Tous les messages de console sont **DÉJÀ en français** avec préfixe `[SOM]`.

### pratique-registre.js

Tous les messages de console sont **DÉJÀ en français** avec emojis appropriés.

**Verdict** : ✅ Tous les logs sont en français !

---

## 8. Documentation (README, guides)

Fichiers à vérifier :
- `ARCHITECTURE_PRATIQUES_NOTATION.md` : ✅ Français (vérifié)
- `pratique-interface.js` : ✅ Français (vérifié)

---

## 9. Résumé et actions requises

### ✅ CE QUI EST DÉJÀ EN FRANÇAIS (99%)

- Noms de fonctions
- Noms de variables
- Noms de classes
- Méthodes de l'interface
- Commentaires
- Messages de console
- Documentation
- Clés localStorage
- Structure de données

### 🔧 CE QUI DOIT ÊTRE FRANCISÉ (1%)

**Fichier unique à renommer** :
1. `pratique-registre.js` → `pratique-registre.js`

**Références à mettre à jour** :
- `index 90 (snapshots).html` : balise `<script src="js/pratiques/pratique-registre.js">`
- `ARCHITECTURE_PRATIQUES_NOTATION.md` : mentions de "registre" ou "registry"
- `AUDIT_ARCHITECTURE_PORTFOLIO.md` : mentions de "registry"

**Impact** : ⚠️ Fichier non chargé actuellement dans index 90 (à vérifier)

---

## 10. Plan d'action (5 min)

### Étape 1 : Renommer le fichier
```bash
cd js/pratiques
mv pratique-registre.js pratique-registre.js
```

### Étape 2 : Vérifier les références
```bash
grep -r "pratique-registry" . --include="*.html" --include="*.js" --include="*.md"
```

### Étape 3 : Mettre à jour les références trouvées
- Remplacer `pratique-registre.js` par `pratique-registre.js`
- Remplacer texte "registry" par "registre" dans les docs

### Étape 4 : Vérifier que rien n'est cassé
- Ouvrir index 90 dans navigateur
- Vérifier console : `listerPratiquesDisponibles()`
- Confirmer que pratiques sont chargées

---

## 11. Validation

### Checklist finale

- [ ] Fichier renommé : `pratique-registre.js`
- [ ] Références HTML mises à jour
- [ ] Documentation mise à jour
- [ ] Tests console : `obtenirPratiqueActive()` fonctionne
- [ ] Tests console : `listerPratiquesDisponibles()` retourne 2 pratiques
- [ ] Aucune erreur dans console navigateur

---

## Conclusion

**Excellente nouvelle** : Le système de pratiques est **déjà à 99% en français** !

**Seule action requise** : Renommer 1 fichier (`pratique-registre.js` → `pratique-registre.js`) et mettre à jour ses 2-3 références.

**Temps estimé** : 5 minutes
**Risque** : Très faible (1 fichier)
**Bénéfice** : Cohérence terminologique 100%

---

**Prochaine étape** : Une fois la francisation terminée, nous pouvons commencer Phase 2 (Déléguer calculs).
