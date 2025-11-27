# Beta 91.5b - Correctif ordre chargement scripts

**Version** : Beta 91.5b (bugfix)
**Date** : 27 novembre 2025
**Auteur** : Grégoire Bédard
**Statut** : ✅ Correctif critique appliqué

---

## 🐛 Bug corrigé

### **Erreur : `PratiqueConfigurable is not defined`**

**Symptôme** :
- Erreur JavaScript bloquante au chargement de l'application
- Message : "PratiqueConfigurable is not defined"
- Affecte tous les utilisateurs de Beta 91.5 initiale

**Cause** :
- Ordre de chargement incorrect des scripts pratiques
- `pratique-registre.js` était chargé **AVANT** `pratique-configurable.js`
- `pratique-registre.js` utilise la classe `PratiqueConfigurable` qui n'était pas encore définie

**Correction** :
- Déplacement de `pratique-configurable.js` **AVANT** `pratique-registre.js`
- Ajout commentaire explicatif pour éviter régression future
- Application du correctif dans `index 91.5b.html` ET `index 91.html`

**Fichiers modifiés** :
- `index 91.5b.html` : Ordre scripts corrigé (lignes 10179-10180)
- `index 91.html` : Ordre scripts corrigé (lignes 10226-10227)

---

## 📦 Package de distribution

### Fichier de distribution
```
📦 dist/Beta_91.5b_Correctif_2025-11-27.zip
   Contenu identique à Beta 91.5 avec correction ordre scripts
```

### Migration depuis Beta 91.5 → 91.5b

**Si vous avez téléchargé Beta 91.5** :
1. Télécharger Beta 91.5b (ce package)
2. Remplacer `index 91.5.html` par le nouveau fichier
3. Rafraîchir le navigateur (Cmd+Shift+R ou Ctrl+Shift+R)

**Aucune perte de données** : Les données sont stockées dans IndexedDB, pas dans le fichier HTML.

---

## ✅ Validation

**Tests effectués** :
- ✅ Chargement application sans erreur
- ✅ Pratiques configurables accessibles
- ✅ Wizard Primo fonctionnel
- ✅ Pratiques prédéfinies chargées correctement
- ✅ Aucune erreur console JavaScript

**Testé par** : Grégoire Bédard
**Bug signalé par** : Bruno V. (Cégep Laurendeau)

---

## 🔗 Liens

- **Beta 91.5 originale** : BETA_91.5_CHANGELOG.md (6 bugs corrigés)
- **GitHub** : Commit `da53a5d` (index 91.5b) et `4732af3` (index 91.html)
- **Distribution** : Teams AQPC-PAN + Blog Codex Numeris

---

## 📞 Support

**Email** : labo@codexnumeris.org
**Site** : https://codexnumeris.org

---

**Recommandation** : Tous les utilisateurs de Beta 91.5 doivent mettre à jour vers Beta 91.5b immédiatement.
