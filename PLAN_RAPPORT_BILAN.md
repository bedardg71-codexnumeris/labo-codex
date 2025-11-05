# Plan de travail - Rapport de bilan (Section Rapport)

**Date** : 5 novembre 2025
**Version cible** : Beta 0.90
**Objectif** : Implémenter la section "Rapport" dans le profil étudiant pour générer des bilans pédagogiques destinés à l'API et aux étudiants

---

## 🎯 Contexte et besoin

### Situation actuelle
- Section "Rapport" existe dans la navigation mais affiche seulement un placeholder
- Toutes les données nécessaires sont DÉJÀ calculées (forces, défis, patterns, indices A-C-P, recommandations RàI)
- Le système identifie déjà automatiquement les patterns et cibles d'intervention

### Besoin pédagogique
À ce moment du trimestre (mi-session), il est approprié de :
1. **Faire un bilan** des forces et défis de chaque étudiant
2. **Communiquer** ce bilan à l'étudiant (rétroaction formative)
3. **Informer l'API** des étudiants nécessitant un suivi particulier
4. **Documenter** les interventions et leur impact

---

## 📋 Fonctionnalités à implémenter

### 1. Génération du rapport pédagogique

#### 1.1 Contenu du rapport

**SECTION A : Identification**
- Nom, DA, groupe, programme
- Date du rapport
- Période couverte (début trimestre → date actuelle)

**SECTION B : Synthèse des indices**
- **Assiduité (A)** : Taux actuel, interprétation
- **Complétion (C)** : Taux actuel, artefacts remis/total
- **Performance (P)** : Moyenne actuelle, échelle IDME
- **Mobilisation (M)** : (A+C)/2
- **Risque d'échec (R)** : Formule 1-(A×C×P), niveau de risque

**SECTION C : Diagnostic pédagogique**
- **Pattern identifié** : Défi spécifique, Plateau, Émergence, Maîtrise consolidée
- **Forces identifiées** : Critères ≥ 75% (par ordre décroissant)
- **Défis identifiés** : Critères < 75% (par ordre croissant)
- **Défi principal** : Critère le plus faible avec score

**SECTION D : Tendances et progression**
- **Direction du risque** : Amélioration / Plateau / Détérioration
- **Progression performance** : Comparaison artefacts récents vs antérieurs
- **Assiduité récente** : Indice alternatif (3 derniers cours) vs sommatif

**SECTION E : Interventions RàI**
- Liste des interventions complétées (date, type, durée)
- Niveau RàI actuel recommandé (1, 2 ou 3)
- Recommandations personnalisées selon pattern

**SECTION F : Recommandations pour l'API** (si risque ≥ moyen)
- Actions spécifiques suggérées
- Ressources à mobiliser (tutorat, services adaptés, etc.)
- Échéancier de réévaluation

---

### 2. Interface utilisateur

#### 2.1 Modes d'affichage

**MODE 1 : Aperçu visuel** (par défaut)
- Cartes colorées selon niveau de risque
- Visualisation graphique forces/défis (barres horizontales)
- Timeline des interventions RàI
- Badges pour statuts (risque élevé, SA, etc.)

**MODE 2 : Format textuel** (pour copier-coller)
- Rapport en texte brut bien formaté
- Sections clairement délimitées
- Prêt à être copié dans un courriel ou formulaire API

**MODE 3 : Format imprimable** (CSS print-friendly)
- Mise en page optimisée pour impression
- Pas de couleurs de fond (économie d'encre)
- Marges et sauts de page appropriés

#### 2.2 Fonctionnalités interactives

1. **Bouton "Générer le rapport"** : Compile toutes les données
2. **Bouton "Copier"** : Copie le rapport textuel dans le presse-papiers
3. **Bouton "Imprimer"** : Ouvre dialogue d'impression avec CSS optimisé
4. **Bouton "Envoyer par courriel"** : Ouvre client courriel avec rapport pré-rempli (mailto:)
5. **Toggle "Inclure détails techniques"** : Afficher/masquer formules et calculs
6. **Toggle "Version étudiant / Version API"** : Adapter le ton et le contenu

---

### 3. Génération automatisée

#### 3.1 Rapports de groupe

**Fonctionnalité bonus** : Générer un rapport de synthèse pour tout le groupe
- Répartition des niveaux de risque (camembert)
- Liste priorisée des étudiants nécessitant intervention API
- Statistiques globales (moyenne A-C-P du groupe)
- Export CSV pour suivi administratif

#### 3.2 Historique des rapports

**Fonctionnalité future** (Beta 0.95+) :
- Sauvegarder chaque rapport généré avec timestamp
- Comparer rapports successifs pour voir évolution
- Export JSON pour archivage

---

## 🏗️ Architecture technique

### Fichiers à modifier

1. **js/profil-etudiant.js** (existant)
   - Ajouter fonction `genererSectionRapport(da)`
   - Utiliser les fonctions existantes de calcul (déjà présentes)
   - Formater les données en HTML

2. **js/rapport.js** (nouveau - optionnel)
   - Si la logique devient trop lourde, créer module dédié
   - Fonctions de formatage textuel
   - Gestion copie presse-papiers
   - Templates de courriels

3. **css/styles.css** (existant)
   - Ajouter styles pour rapport visuel
   - Ajouter `@media print` pour version imprimable

4. **index 90 (snapshots).html** (existant)
   - Pas de modification nécessaire (script déjà chargé)

---

## 📊 Données disponibles (déjà calculées)

Toutes ces fonctions existent déjà dans `profil-etudiant.js` :

```javascript
// Indices de base
calculerTousLesIndices(da)
// Retourne : { A, C, P, M, R, pratique }

// Diagnostic forces/défis
diagnostiquerForcesChallenges(moyennes, seuil)
// Retourne : { forces, defis, principaleForce, principalDefi }

// Pattern actuel
determinerPattern(A, C, P, moyennes)
// Retourne : { pattern, emoji, couleur, description }

// Niveau RàI recommandé
determinerNiveauRaI(risque)
// Retourne : { niveau, titre, couleur, actions[] }

// Progression
calculerProgression(da)
// Retourne : { direction, interpretation, AM, AL, difference }

// Interventions de l'étudiant
obtenirInterventionsEtudiant(da)
// Retourne : [{ id, date, type, titre, etudiants, statut }]
```

**Constat** : Toute la logique métier existe. Il suffit de **compiler et formater** ces données.

---

## 🎨 Wireframes (Structure visuelle)

### Version visuelle (aperçu)

```
┌─────────────────────────────────────────────────────┐
│  📊 RAPPORT DE BILAN PÉDAGOGIQUE                    │
│                                                     │
│  ┌─────────────────┐  ┌─────────────────┐         │
│  │  MOBILISATION   │  │  RISQUE D'ÉCHEC │         │
│  │     72%         │  │      Moyen      │         │
│  │  🟠 Acceptable  │  │   🟠 Vigilance  │         │
│  └─────────────────┘  └─────────────────┘         │
│                                                     │
│  🎯 PATTERN : Défi spécifique                      │
│  → Pratique guidée en s'appuyant sur les forces   │
│                                                     │
│  ✅ FORCES (3)                                     │
│  ━━━━━━━━━━━━━━━━━━━ 85% Français                │
│  ━━━━━━━━━━━━━━━━━ 80% Plausibilité              │
│  ━━━━━━━━━━━━━ 75% Structure                      │
│                                                     │
│  ⚠️  DÉFIS (2)                                     │
│  ━━━━━━━━ 65% Nuance                              │
│  ━━━━━━━━━ 68% Rigueur                            │
│                                                     │
│  📈 TENDANCES                                       │
│  • Risque : → Stable (plateau)                    │
│  • Performance : ↗ Amélioration (+5%)             │
│  • Assiduité : ✅ Excellente (95%)                │
│                                                     │
│  💬 INTERVENTIONS RÀI (2)                          │
│  ✓ lun. 28 oct. - Niveau 2 - 2h                   │
│  ✓ lun. 4 nov. - Niveau 2 - 2h                    │
│                                                     │
│  🎯 RECOMMANDATIONS                                │
│  • Niveau RàI suggéré : Niveau 2 (Préventif)     │
│  • Pratique guidée sur critère Nuance            │
│  • Maintenir mobilisation actuelle                │
│                                                     │
│  [Copier] [Imprimer] [Envoyer par courriel]      │
└─────────────────────────────────────────────────────┘
```

### Version textuelle (copier-coller)

```
==============================================
RAPPORT DE BILAN PÉDAGOGIQUE
==============================================

IDENTIFICATION
Nom : B., Loïc
DA : 9000157
Groupe : 00001
Programme : Sciences de la nature
Période : 2025-09-02 → 2025-11-05

----------------------------------------------
SYNTHÈSE DES INDICES
----------------------------------------------

Assiduité (A) : 95% (Excellente)
Complétion (C) : 80% (Bonne - 4/5 artefacts remis)
Performance (P) : 72% (Acceptable - Niveau D)
Mobilisation (M) : 88%
Risque d'échec (R) : 32% (Moyen - Vigilance)

----------------------------------------------
DIAGNOSTIC PÉDAGOGIQUE
----------------------------------------------

Pattern identifié : Défi spécifique
→ Performance ≥ 65% avec défis identifiés sur certains critères

Forces identifiées (3) :
  1. Français : 85% (Maîtrisé)
  2. Plausibilité : 80% (Maîtrisé)
  3. Structure : 75% (Seuil de maîtrise)

Défis identifiés (2) :
  1. Nuance : 65% (En développement) ← PRIORITAIRE
  2. Rigueur : 68% (En développement)

----------------------------------------------
TENDANCES ET PROGRESSION
----------------------------------------------

Direction du risque : → Stable (plateau)
Progression performance : ↗ Amélioration (+5 points vs artefacts antérieurs)
Assiduité récente : 100% (3 derniers cours)

----------------------------------------------
INTERVENTIONS RÀI COMPLÉTÉES
----------------------------------------------

1. lun. 28 octobre 2025 - Niveau 2 (Préventif en classe) - 2h
2. lun. 4 novembre 2025 - Niveau 2 (Préventif en classe) - 2h

----------------------------------------------
RECOMMANDATIONS
----------------------------------------------

Niveau RàI suggéré : Niveau 2 (Préventif)

Actions recommandées :
• Pratique guidée en s'appuyant sur les forces (Français, Plausibilité)
• Travail ciblé sur le critère Nuance (défi principal)
• Maintenir la mobilisation actuelle (assiduité excellente)

Ressources suggérées :
• Exercices pratiques sur la nuance argumentative
• Rétroaction formative détaillée sur artefacts futurs
• Renforcement positif des forces identifiées

==============================================
Rapport généré le 2025-11-05 à 14h30
Application de monitorage pédagogique - Beta 0.90
==============================================
```

---

## ⚙️ Étapes d'implémentation

### PHASE 1 : Rapport visuel de base (1-2 jours)

**Tâches** :
1. ✅ Créer fonction `genererSectionRapport(da)` dans profil-etudiant.js
2. ✅ Compiler toutes les données existantes en un objet structuré
3. ✅ Générer HTML avec cartes visuelles (réutiliser classes CSS existantes)
4. ✅ Remplacer le placeholder actuel par le vrai contenu
5. ✅ Tester avec plusieurs profils (risque faible/moyen/élevé)

**Critères de succès** :
- Toutes les sections A-F affichées correctement
- Design cohérent avec le reste de l'application
- Données précises pour tous les étudiants

---

### PHASE 2 : Version textuelle + copier-coller (0.5 jour)

**Tâches** :
1. ✅ Créer fonction `genererRapportTexte(da)`
2. ✅ Formater données en texte brut bien structuré
3. ✅ Ajouter bouton "Copier" avec API Clipboard
4. ✅ Afficher notification de succès après copie

**Critères de succès** :
- Texte propre, aligné, lisible
- Copie fonctionne dans tous les navigateurs modernes
- Notification visuelle de confirmation

---

### PHASE 3 : Version imprimable (0.5 jour)

**Tâches** :
1. ✅ Ajouter CSS `@media print` dans styles.css
2. ✅ Optimiser mise en page pour impression (marges, sauts de page)
3. ✅ Retirer couleurs de fond (mode noir et blanc)
4. ✅ Ajouter bouton "Imprimer"

**Critères de succès** :
- Impression propre sur 1-2 pages maximum
- Tous les éléments importants visibles
- Économie d'encre (pas de gros blocs de couleur)

---

### PHASE 4 : Fonctionnalités bonus (1 jour - optionnel)

**Tâches** :
1. ⭐ Bouton "Envoyer par courriel" (mailto: avec corps pré-rempli)
2. ⭐ Toggle "Version étudiant / Version API" (adapter le ton)
3. ⭐ Rapport de groupe (synthèse pour toute la classe)
4. ⭐ Export PDF via API navigateur (window.print())

---

## 🧪 Tests à effectuer

### Tests fonctionnels

1. **Étudiant avec risque faible** : Vérifier que recommandations sont positives
2. **Étudiant avec risque élevé** : Vérifier que alertes API sont présentes
3. **Étudiant sans interventions RàI** : Section vide ou message approprié
4. **Étudiant avec SA (Services Adaptés)** : Mention explicite dans recommandations
5. **Étudiant avec pattern "Maîtrise consolidée"** : Encouragements et défis stimulants

### Tests techniques

1. **Navigation** : Clic sur "Rapport" charge correctement la section
2. **Copier** : Bouton copie le texte dans presse-papiers
3. **Imprimer** : Dialogue impression s'ouvre avec mise en page correcte
4. **Responsive** : Affichage correct sur tablette/mobile
5. **Performance** : Génération instantanée (<100ms)

---

## 📝 Questions à clarifier AVANT implémentation

### 1. Destinataires du rapport

**Question** : Le rapport doit-il avoir 2 versions distinctes ?
- **Version étudiant** : Ton encourageant, focus sur progression, pas de jargon technique
- **Version API** : Ton professionnel, données objectives, recommandations administratives

**Proposition** : Toggle pour basculer entre les deux versions

---

### 2. Contenu sensible

**Question** : Faut-il inclure des informations confidentielles ?
- Services Adaptés (SA) : Mentionner ou non dans version étudiant ?
- Historique complet interventions : Visible par l'étudiant ?
- Comparaison avec pairs : Afficher moyenne du groupe ?

**Proposition** : Version API complète, version étudiant filtrée

---

### 3. Format courriel

**Question** : Le bouton "Envoyer par courriel" doit :
- Pré-remplir destinataire ? (API du collège, étudiant, autre)
- Inclure objet pré-défini ? (ex: "Bilan mi-session - Cours 601-XXX")
- Joindre fichier ou texte dans corps ?

**Proposition** : Champ "Destinataire" personnalisable + corps de texte

---

### 4. Fréquence de génération

**Question** : Les rapports doivent-ils être :
- **Générés à la demande** : Clic sur "Générer" compile données actuelles
- **Pré-générés automatiquement** : Mise à jour en temps réel, toujours prêts
- **Sauvegardés historiquement** : Conserver snapshots des rapports passés

**Proposition** : Génération à la demande pour Beta 0.90, historique pour Beta 0.95

---

### 5. Personnalisation

**Question** : L'enseignant peut-il personnaliser :
- Sections à inclure/exclure ?
- Seuils d'alerte (ex: risque > X% = alerte API) ?
- Modèles de recommandations (templates textuels) ?

**Proposition** : Version standard pour Beta 0.90, personnalisation pour 1.0

---

## 🎯 Décisions à prendre

Avant de commencer l'implémentation, confirme tes préférences :

### A. Versions du rapport
- [ ] Une seule version universelle
- [ ] Deux versions distinctes (étudiant + API)
- [ ] Trois versions (étudiant + API + enseignant)

### B. Mode de génération
- [ ] À la demande uniquement (clic sur bouton)
- [ ] Pré-généré en arrière-plan (toujours prêt)
- [ ] Hybride (pré-calcul + bouton rafraîchir)

### C. Fonctionnalités prioritaires
- [ ] Rapport visuel seul (Phase 1)
- [ ] Rapport visuel + textuel + copier (Phases 1-2)
- [ ] Tout inclus sauf bonus (Phases 1-3)
- [ ] Toutes fonctionnalités y compris bonus (Phases 1-4)

### D. Timing
- [ ] Implémenter maintenant (avant autres tâches Beta 0.90)
- [ ] Implémenter après snapshots (suite du plan Beta 0.90)
- [ ] Reporter à Beta 0.95 (après graphiques)

---

## 📚 Ressources existantes à réutiliser

**Styles CSS** :
- `.profil-carte` pour cartes visuelles
- `.badge-*` pour badges de statut
- `.carte-metrique-standard` pour métriques
- Classes couleurs selon seuils

**Fonctions JavaScript** :
- Toutes les fonctions de calcul déjà présentes
- `interpreter*()` pour interprétations textuelles
- `determiner*()` pour diagnostic automatique

**HTML existant** :
- Structure sections profil (réutilisable)
- Navigation sidebar (déjà fonctionnelle)

---

## ✅ Prochaines étapes

1. **Clarifier les décisions** (sections A-D ci-dessus)
2. **Valider le wireframe** (structure visuelle proposée)
3. **Confirmer le contenu** (sections A-F du rapport)
4. **Commencer Phase 1** : Rapport visuel de base

Une fois ces éléments clarifiés, je pourrai commencer l'implémentation avec un plan précis ! 🚀
