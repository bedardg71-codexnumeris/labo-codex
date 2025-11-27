# Système de monitorage pédagogique - Beta 91.2

**Version** : Beta 91.2 (Système d'import/export pédagogique)
**Date** : 26 novembre 2025
**Auteur** : Grégoire Bédard
**Licence** : Creative Commons BY-NC-SA 4.0

---

## 🎉 Nouveauté principale

La Beta 91.2 introduit un **système complet d'import/export** qui facilite le partage de vos ressources pédagogiques avec vos collègues, tout en respectant les principes du libre partage éducatif (licence Creative Commons).

---

## 📦 Contenu de ce package

### Fichier principal
- **index 91.html** - Application complète (ouvrir dans un navigateur)

### Modules JavaScript (dossier js/)
- 47 fichiers JavaScript incluant les 7 modules mis à jour pour Beta 91.2:
  - `import-export.js` (613 lignes) - Import/export avec remapping intelligent
  - `cc-license.js` (748 lignes) - Métadonnées CC + génération README
  - `productions.js`, `cartouches.js` - Détection dépendances
  - `grilles.js`, `echelles.js` - Export enrichi
  - `db.js` - Gestionnaire de stockage hybride IndexedDB

### Feuilles de style (dossier css/)
- **styles.css** - Styles complets de l'application

### Données de démonstration
- **donnees-demo.json** - Jeu complet de données test
- **etudiants-demo.txt** - 30 étudiants groupe TEST
- **etudiants-demo-groupe9999.txt** - 30 étudiants groupe 9999

### Fichiers de test
- **test-echelle-idme.json** - Échelle IDME (SOLO) test
- **test-grille-srpnf.json** - Grille SRPNF test
- **test-production-avec-dependance.json** - Production test avec dépendance

### Documentation utilisateur
- **NOTES_VERSION_BETA_91.2.md** - Notes de version (clair, pédagogique)
- **PHASE_5_GUIDE_EXECUTION.md** - Guide de test rapide (15-45 min)
- **PHASE_5_PLAN_TESTS.md** - Plan de test détaillé (~600 lignes)
- **README_TESTEURS.md** - Guide pour testeurs
- **README_DONNEES_DEMO.md** - Explication données de démo
- **GUIDE_TESTEURS.md** - Instructions détaillées pour testeurs

### Documentation technique
- **CLAUDE.md** - Documentation développement (section import/export ajoutée)
- **BETA_91_CHANGELOG.md** - Changelog complet (Beta 91.1 + 91.2 documentés)
- **INDEXEDDB_ARCHITECTURE.md** - Architecture stockage (Beta 91.1)
- **ARCHITECTURE_PRATIQUES.md** - Architecture système pratiques
- **GUIDE_AJOUT_PRATIQUE.md** - Guide ajout pratique
- **FEUILLE_DE_ROUTE_PRATIQUES.md** - Roadmap pratiques
- **LICENSE.md** - Licence CC BY-NC-SA 4.0
- **PACKAGE_BETA_91.2_PRET.md** - Checklist de distribution

---

## 🚀 Démarrage rapide

### Pour les utilisateurs

1. **Ouvrir l'application**
   ```bash
   # Double-cliquer sur "index 91.html" ou
   open "index 91.html"  # macOS
   ```

2. **Importer les données de démo** (optionnel)
   - Réglages → Gestion des données → Importer les données
   - Sélectionner `donnees-demo.json`

3. **Explorer les fonctionnalités**
   - Consulter la section Aide de l'application
   - Lire `NOTES_VERSION_BETA_91.2.md`

### Pour les testeurs

1. **Suivre le guide de test rapide**
   - Lire `PHASE_5_GUIDE_EXECUTION.md` (15 min)
   - Ou `PHASE_5_PLAN_TESTS.md` (test complet 45 min)

2. **Utiliser les fichiers de test**
   - `test-echelle-idme.json`
   - `test-grille-srpnf.json`
   - `test-production-avec-dependance.json`

### Pour les développeurs

1. **Lire la documentation technique**
   - `CLAUDE.md` : Architecture complète
   - `BETA_91_CHANGELOG.md` : Historique des changements
   - `INDEXEDDB_ARCHITECTURE.md` : Stockage hybride

2. **Examiner le code**
   - `js/import-export.js` : Import/export principal
   - `js/cc-license.js` : Métadonnées et README

---

## ✨ Fonctionnalités clés Beta 91.2

### Export
- Export individuel enrichi (grilles, échelles, productions, cartouches)
- Export configuration complète (bundle toutes ressources)
- Génération automatique LISEZMOI.txt
- Métadonnées CC BY-NC-SA 4.0 obligatoires
- Téléchargement dual (JSON + TXT) avec délai 500ms

### Import
- Validation structure JSON
- Modal d'aperçu avec métadonnées complètes
- Détection automatique conflits d'ID
- Remapping intelligent avec mise à jour références
- Détection dépendances manquantes
- Avertissements clairs et option annuler

---

## 💡 Cas d'usage

1. **Harmonisation départementale** : Partager grilles communes
2. **Mentorat** : Transmettre pratique complète à nouvel enseignant
3. **Réutilisation sessions** : Conserver configuration entre sessions
4. **Communautés de pratique** : Mutualiser ressources pédagogiques

---

## 📊 Statistiques

- **Lignes de code ajoutées** : ~700 lignes (7 fichiers JavaScript modifiés)
- **Fonctions créées** : 15+ nouvelles fonctions
- **Documentation** : 8 fichiers (~1,500 lignes)
- **Phases complétées** : 5 phases (1-3 implémentées, 4 optionnelle, 5 tests)

---

## 🔗 Support

- **Email** : labo@codexnumeris.org
- **Site** : https://codexnumeris.org

---

## 📄 Licence

**Creative Commons BY-NC-SA 4.0** (Grégoire Bédard)
- ✅ Partage et adaptation autorisés (sans usage commercial)
- ✅ Attribution requise
- ✅ Redistribution sous même licence

---

**Bon partage pédagogique!** 🎓
