# Système de monitorage pédagogique - Beta 91.2

**Version** : Beta 91.2 (Pratiques configurables et partage pédagogique)
**Date** : 26 novembre 2025
**Auteur** : Grégoire Bédard
**Licence** : Creative Commons BY-NC-SA 4.0

---

## 🎉 Bienvenue!

Vous avez entre les mains une **application de monitorage pédagogique flexible** qui s'adapte à VOTRE pratique de notation, au lieu de vous imposer une méthode unique.

**Beta 91.2** introduit:
- ✅ **7 pratiques prédéfinies** (chargez celle qui vous convient en 2 clics)
- ✅ **Wizard de création** (créez votre pratique en 10 minutes)
- ✅ **Système multi-objectifs** (pour cours avec plusieurs objectifs pondérés)
- ✅ **Capacité GB** (architecture IndexedDB pour plusieurs groupes)
- ✅ **Partage pédagogique** (import/export avec métadonnées CC)

---

## 🚀 Démarrage rapide (3 minutes)

### Étape 1: Ouvrir l'application
```bash
# Double-cliquer sur "index 91.html" ou
open "index 91.html"  # macOS
# Ou ouvrir avec votre navigateur (Chrome, Safari, Firefox, Edge)
```

### Étape 2: Importer les données de démonstration (optionnel)
1. **Réglages → Gestion des données → Importer les données**
2. Sélectionner `donnees-demo.json`
3. Confirmer l'importation
4. **Recharger la page**

Vous avez maintenant:
- 30 étudiants fictifs
- 1 grille SRPNF complète
- 1 échelle IDME (5 niveaux)
- Plusieurs productions configurées
- Données de présences et évaluations

### Étape 3: Charger une pratique (optionnel mais recommandé)
1. **Réglages → Pratique de notation**
2. Cliquer **«Exemples de pratiques»** (bouton vert)
3. Choisir une pratique qui ressemble à votre approche:
   - **Sommative traditionnelle** (Marie-Hélène) = Moyenne pondérée classique
   - **PAN-Maîtrise IDME** (Grégoire) = Échelle IDME avec SRPNF
   - **PAN-Objectifs pondérés** (Michel) = Plusieurs objectifs avec poids
   - **PAN-Standards** (Bruno) = Évaluation par standards
   - ... et 3 autres pratiques
4. Confirmer le chargement
5. **L'application s'adapte automatiquement!**

### Étape 4: Explorer l'application
- **Étudiants → Liste** : Voir les 30 étudiants
- **Étudiants → Profil** : Consulter un profil détaillé (ex: Alya)
- **Tableau de bord → Aperçu** : Vue d'ensemble du groupe
- **Aide** : Documentation complète intégrée

---

## 📚 Documentation

### Documentation incluse dans ce package

1. **README.md** (ce fichier) - Démarrage rapide
2. **NOTES_VERSION_BETA_91_COMPLET.md** - Notes de version détaillées (TOUTES les nouveautés)
3. **LICENSE.md** - Licence CC BY-NC-SA 4.0
4. **README_DONNEES_DEMO.md** - Explication des données de démonstration

### Documentation dans l'application

**Aide → 5 sections complètes**:
1. Introduction : Vue d'ensemble, philosophie, concepts clés
2. Configuration : Trimestre, cours, groupe, horaire, matériel
3. Utilisation : Présences, évaluations, profils, collaboration
4. Consultation : Tableau de bord, liste étudiants, rapports
5. Référence : FAQ, glossaire, formules

---

## 🎯 Les 5 fonctionnalités phares de Beta 91

### 1. Pratiques prédéfinies (7 au choix)

**En 2 clics**, chargez une pratique qui correspond à votre approche pédagogique.

- PAN-Standards (Bruno V. - Chimie)
- Sommative traditionnelle (Marie-Hélène L. - Littérature)
- PAN-Spécifications (François A.-H. - Chimie)
- PAN-Maîtrise IDME (Grégoire Bédard - Littérature)
- PAN-Objectifs pondérés (Michel B. - Mathématiques)
- Sommative + remplacement (Jordan R. - Philosophie)
- PAN-Jugement global (Isabelle M. - Biologie)

**Comment?** Réglages → Pratique de notation → «Exemples de pratiques»

### 2. Wizard de création de pratiques

**En 10 minutes**, créez votre propre pratique avec un assistant en 8 étapes:
1. Informations de base
2. Échelle d'évaluation
3. Structure des évaluations
4. Calcul de la note finale
5. Système de reprises
6. Gestion des critères
7. Seuils d'interprétation
8. Interface et terminologie

**Comment?** Réglages → Pratique de notation → «Créer ma pratique»

### 3. Système multi-objectifs

**Pour les cours avec plusieurs objectifs d'apprentissage** (ex: 13 objectifs en Mathématiques).

- Définir objectifs avec poids variables
- Lier évaluations aux objectifs
- Tableau détaillé dans le profil étudiant
- Note finale pondérée: Σ(P_objectif × poids) / 100

**Comment?** Réglages → Objectifs d'apprentissage → Créer ensemble

### 4. Partage pédagogique (Import/Export)

**Partagez vos ressources avec vos collègues** tout en respectant la licence CC.

**Export**:
- Configuration complète (échelles + grilles + productions + cartouches)
- Métadonnées enrichies (discipline, niveau, description)
- 2 fichiers générés: JSON (données) + TXT (instructions)

**Import**:
- Validation structure JSON
- Détection conflits automatique
- Remapping intelligent des références

**Comment?** Réglages → Gestion des données → Export/Import

### 5. Capacité GB (Architecture IndexedDB)

**Stockez autant de données que nécessaire** (plusieurs groupes, plusieurs sessions).

- Avant: 5-10 MB (localStorage)
- Beta 91: **Plusieurs GB** (IndexedDB)
- Performance: Accès instantané (cache hybride)
- Automatique: Aucune action requise

---

## 💡 Cas d'usage typiques

### Scénario 1: Enseignant·e en Littérature (sommative)

**Marie-Hélène utilise la moyenne pondérée traditionnelle**:
1. Charge la pratique "Sommative traditionnelle"
2. Configure ses 5 évaluations (10%, 15%, 15%, 20%, 40%)
3. Évalue ses étudiants
4. Consulte les profils pour RàI

**Temps de configuration**: 2 minutes

### Scénario 2: Enseignant·e en Chimie (PAN par standards)

**Bruno évalue par standards avec 5 niveaux**:
1. Charge la pratique "PAN-Standards (5 niveaux)"
2. Crée ses 8 standards
3. Évalue les artefacts sur chaque standard
4. Le système calcule automatiquement la maîtrise globale

**Temps de configuration**: 5 minutes

### Scénario 3: Enseignant·e en Mathématiques (multi-objectifs)

**Michel a 13 objectifs pondérés**:
1. Charge la pratique "PAN-Objectifs pondérés"
2. Crée son ensemble de 13 objectifs avec poids
3. Lie chaque évaluation à un objectif
4. Consulte le tableau détaillé par objectif dans les profils

**Temps de configuration**: 20 minutes

---

## 🧪 Tester l'import/export

**3 fichiers de test fournis** pour tester le système d'import:

1. **test-echelle-idme.json** - Échelle IDME (5 niveaux: 0, I, D, M, E)
2. **test-grille-srpnf.json** - Grille SRPNF complète
3. **test-production-avec-dependance.json** - Production référençant une grille

**Comment tester?**
1. Réglages → Gestion des données → Importer une configuration
2. Sélectionner `test-echelle-idme.json`
3. Vérifier l'aperçu (métadonnées + contenu)
4. Confirmer l'import
5. Recharger la page
6. Vérifier: Matériel → Niveaux de performance → Nouvelle échelle importée

**Répéter avec les 2 autres fichiers** pour tester les différents scénarios.

---

## ⚠️ Points importants

### Protection de la vie privée
- **Aucune donnée étudiante n'est exportée** dans les configurations pédagogiques
- Seul le matériel réutilisable est partagé (grilles, échelles, productions, cartouches)
- Noms, numéros DA, notes, présences ne sont JAMAIS inclus dans les exports partagés

### Différence entre types d'export

1. **Backup complet** (boutons modaux Réglages)
   - TOUTES vos données (cours, étudiants, notes, présences)
   - Usage: Sauvegarde personnelle uniquement
   - Partage: ❌ NON

2. **Configuration pédagogique** (boutons Gestion des données)
   - Matériel pédagogique uniquement
   - Usage: Partage avec collègues
   - Partage: ✅ OUI

3. **Export partiel** (boutons dans chaque section Matériel)
   - Une ressource spécifique (1 grille, 1 échelle, etc.)
   - Usage: Partage ciblé
   - Partage: ✅ OUI

### Compatibilité navigateurs

- ✅ **Chrome** (recommandé)
- ✅ **Safari** (testé sur macOS et iPadOS)
- ✅ **Firefox**
- ✅ **Edge**

---

## 🆘 Besoin d'aide?

### Dans l'application
**Aide → 5 sections complètes**
- FAQ (13 questions fréquentes)
- Glossaire (45 termes techniques)
- Guides détaillés

### Documentation externe
- **NOTES_VERSION_BETA_91_COMPLET.md** (dans ce package)
- Guide de monitorage complet: https://codexnumeris.org

### Support
- **Email**: labo@codexnumeris.org
- **Site**: https://codexnumeris.org

---

## 📄 Licence

**Creative Commons BY-NC-SA 4.0** (Grégoire Bédard)

Vous êtes libre de:
- ✅ **Partager** : Copier et redistribuer le matériel
- ✅ **Adapter** : Remixer, transformer et créer à partir du matériel

Selon les conditions suivantes:
- 📝 **Attribution** : Vous devez créditer l'auteur original
- 🚫 **Pas d'utilisation commerciale** : Usage éducatif uniquement
- 🔄 **Partage dans les mêmes conditions** : Même licence pour vos adaptations

Voir **LICENSE.md** pour le texte complet de la licence.

---

## 🙏 Remerciements

Merci aux **10 testeurs du réseau collégial** qui ont partagé leurs pratiques:

Bruno V., Marie-Hélène L., François A.-H., Grégoire Bédard, Michel B., Jordan R.-Robidoux, Etienne L., Hélène C., Isabelle M., Olivier L..

Merci à la **communauté AQPC** pour les retours et suggestions (présentation 19 novembre 2025, 400 participants).

---

**Bon monitorage pédagogique!** 🎓

**Version**: Beta 91.2
**Date**: 26 novembre 2025
