# Système de Monitorage Pédagogique - Beta 0.75

**Date de publication :** 28 octobre 2025
**Développé par :** Grégoire Bédard (Labo Codex)
**Licence :** Double licence GPL v3 (code) + CC BY-SA 4.0 (contenu)

---

## 🎉 Nouveautés Beta 0.75 : Import/Export Matériel Pédagogique

Cette version introduit un système complet d'import/export permettant de partager facilement du matériel pédagogique entre collègues :

### 📤 Fonctionnalités de partage

- **Productions** : Exportez/importez vos évaluations configurées
- **Grilles de critères** : Partagez vos grilles SRPNF personnalisées
- **Échelles de performance** : Échangez vos échelles IDME
- **Cartouches de rétroaction** : Partagez vos commentaires prédéfinis
  - Format JSON pour collaboration entre enseignant·es
  - Format .txt Markdown pour rédaction externe (Word, Google Docs)

### 🤝 Collaboration facilitée

- Harmonisation départementale
- Mentorat et formation
- Réutilisation entre sessions
- Communautés de pratique

### 🔒 Confidentialité préservée

Les exports de matériel pédagogique ne contiennent **jamais** de données confidentielles (noms d'étudiants, DA, notes, présences).

---

## 📦 Contenu du package

### Fichier principal

- **`index 75 (import-export matériel pédagogique).html`**
  Application web complète (ouvrir dans un navigateur moderne)

### Données de démonstration

- **`donnees-demo.json`**
  Package complet avec 30 étudiants, productions, grilles, échelle IDME, et cartouche de rétroaction "A2 Description d'un personnage"

- **`etudiants-demo.txt`**
  30 étudiants groupe TEST (diversité culturelle : 80% québécois, 20% multiculturels)

- **`etudiants-demo-groupe9999.txt`**
  30 étudiants groupe 9999 (pour mode simulé)

- **`README_DONNEES_DEMO.md`**
  Guide complet pour importer les données ou créer vos propres données

### Code source

- **Dossier `js/`**
  Tous les modules JavaScript de l'application

---

## 🚀 Démarrage rapide (2 minutes)

### Option A : Avec données de démonstration (recommandé pour tests)

1. Ouvrir **`index 75 (import-export matériel pédagogique).html`** dans un navigateur
2. Aller dans **Réglages → Import/Export**
3. Cliquer sur **"Ouvrir le modal d'import"**
4. Sélectionner le fichier **`donnees-demo.json`**
5. Cliquer sur **"Importer"**
6. ✅ **L'application est prête avec 30 étudiants et du matériel complet !**

### Option B : Démarrage avec vos propres données

1. Ouvrir **`index 75 (import-export matériel pédagogique).html`**
2. Suivre le guide dans **README_DONNEES_DEMO.md**
3. Configurer votre cours, trimestre, groupe d'étudiants
4. Créer vos évaluations et saisir des données

---

## 📚 Documentation intégrée

L'application inclut une **section Aide** complète avec :

- **Introduction** : Concepts pédagogiques (A-C-P, RàI, SRPNF, IDME)
- **Configuration** : Guide de démarrage étape par étape
- **Utilisation** : Workflow hebdomadaire et collaboration
- **Consultation** : Interprétation des données
- **Référence** : FAQ, glossaire, guide du profil étudiant

**Accès :** Menu principal → Aide

---

## 🎯 Nouveautés par rapport à Beta 0.72

### Ajouts majeurs

✅ **Import/Export matériel pédagogique**
- Boutons dans chaque section (Productions, Grilles, Échelles, Cartouches)
- Formats JSON et .txt Markdown
- Separation backup complet vs export partiel

✅ **Section Aide enrichie**
- Carte "Collaboration entre collègues"
- 4 scénarios d'usage documentés
- Flux de partage illustré

✅ **Package de démonstration enrichi**
- Cartouche de rétroaction complète (16 commentaires)
- 30 étudiants avec diversité culturelle
- Fichiers .txt pour import rapide

✅ **Documentation complète**
- CLAUDE.md mis à jour
- README_DONNEES_DEMO.md enrichi
- Version et date correctement affichées

---

## 💻 Configuration requise

- **Navigateur moderne** : Safari 14+, Chrome 90+, Firefox 88+, Edge 90+
- **Système d'exploitation** : macOS, Windows, Linux, ou iPadOS
- **Espace disque** : ~10 Mo
- **Connexion Internet** : Non requise (fonctionne 100% hors ligne)

---

## 🧪 Tests recommandés

### 1. Import de données de démo (5 min)
- Importer `donnees-demo.json`
- Vérifier Tableau de bord → Aperçu
- Ouvrir 2-3 profils étudiants
- Tester navigation Précédent/Suivant

### 2. Export/Import matériel (5 min)
- Aller dans Matériel → Rétroactions
- Exporter les cartouches
- Créer une nouvelle grille
- Importer les cartouches exportées

### 3. Import fichier .txt (5 min)
- Créer une grille avec critères STRUCTURE, RIGUEUR, PLAUSIBILITÉ, NUANCE
- Sélectionner/créer une cartouche
- Importer un fichier .txt Markdown
- Vérifier que les commentaires sont remplis

### 4. Modes de fonctionnement (5 min)
- Tester Mode Normal
- Tester Mode Anonymisé (noms changent)
- Tester Mode Simulé (groupe 9999)

---

## 📧 Support et feedback

**Contact :** labo@codexnumeris.org

**Ressources :**
- Guide de monitorage complet : [Labo Codex](https://codexnumeris.org/apropos)
- Articles publiés : Revue Pédagogie collégiale (printemps-été 2024, hiver 2025)

---

## 🐛 Problèmes connus

Aucun problème critique identifié dans cette version.

Pour signaler un bug ou suggérer une amélioration :
- Email : labo@codexnumeris.org
- Décrire le problème avec capture d'écran si possible
- Préciser navigateur et système d'exploitation

---

## 📜 Licence et partage

**Code source :** GPL v3 (libre de modifier et redistribuer)
**Contenu pédagogique :** CC BY-SA 4.0 (partage avec attribution)

✅ Utilisation libre pour enseignement et recherche
✅ Modification et adaptation encouragées
✅ Partage avec attribution obligatoire
❌ Usage commercial interdit sans autorisation

---

## 🙏 Remerciements

Merci aux enseignant·es testeurs des versions précédentes pour leurs précieux retours.

**Bon test de la Beta 0.75 !** 🎉

---

*Système développé dans le cadre des travaux du Labo Codex sur le monitorage pédagogique au collégial.*
