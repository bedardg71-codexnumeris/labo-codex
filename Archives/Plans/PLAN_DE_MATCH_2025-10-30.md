# Plan de match - Développement Monitorage v1.0
**Date** : 30 octobre 2025
**Version actuelle** : Beta 79
**Score de complétude** : 72%
**Objectif** : Version 1.0 stable avec toutes les fonctionnalités du guide

---

## 🎯 Vision globale

### État actuel (Beta 79)
- ✅ Fondations solides : Tous calculs A-C-P-M-E-R-B conformes au guide
- ✅ Diagnostic automatique : Patterns, forces, défis, cibles RàI
- ✅ Support SOM-PAN dual : Comparaison expérimentale des pratiques
- ✅ Interface optimisée : Gains d'espace 70% (grilles) et 50% (productions)

### Gaps critiques identifiés
1. ❌ Système de jetons incomplet (délai et reprise)
2. ❌ Cartouches de rétroaction non intégrés dans workflow
3. ❌ Matrice d'évaluation individuelle absente
4. ❌ Visualisation temporelle manquante (graphiques)

---

## 📅 PHASE 1 : Consolidation (2-3 semaines)
**Versions** : Beta 80 → Beta 85
**Objectif** : Finaliser fonctionnalités partiellement implémentées

### 🎫 1.1 Système de jetons complet ✅ COMPLÉTÉ
**Priorité** : ⚠️ HAUTE
**Estimation** : 5-6 jours
**Fichiers** : `portfolio.js`, `productions.js`, `profil-etudiant.js`, `evaluation.js`
**Statut** : ✅ **COMPLÉTÉ le 30 octobre 2025** (Beta 80.1)
**Documentation** : Voir `NOTES_JETONS_COMPLETE.md`

#### Fonctionnalités implémentées

**Jetons délai** :
- [x] Application/retrait jeton délai depuis sidebar
- [x] Badge ⭐ orange avec date d'application
- [x] Propriétés : `jetonDelaiApplique`, `dateApplicationJetonDelai`, `delaiAccorde`
- [x] Recalcul automatique indices C-P après opération
- [ ] ⏭️ **Future** : Calcul automatique nouvelle échéance (PHASE 1.1 avancée)
- [ ] ⏭️ **Future** : Exclusion temporaire du calcul de complétion C
- [ ] ⏭️ **Future** : Indicateur visuel "Délai accordé jusqu'au XX/XX/XXXX"

**Jetons reprise** :
- [x] Remplacement automatique évaluation précédente (champ `remplaceeParId`)
- [x] Application depuis sidebar (`appliquerJetonRepriseDepuisSidebar()`)
- [x] Application depuis banque (`appliquerJetonRepriseDepuisBanque()`)
- [x] Badge ⭐ violet avec date d'application
- [x] Archive évaluations remplacées (visible en grisé)
- [x] Exclusion évaluations archivées des calculs indices
- [x] Propriétés : `jetonRepriseApplique`, `repriseDeId`, `dateApplicationJetonReprise`
- [ ] ⏭️ **Future** : Historique tentatives visible (1ère soumission, reprise 1, reprise 2...)
- [ ] ⏭️ **Future** : Limitation nombre de reprises selon configuration

**Interface utilisateur** :
- [x] Section "JETONS UTILISÉS" dans profil étudiant
- [x] Bouton "Appliquer jeton de reprise" dans sidebar (Beta 80.1)
- [x] Checkbox "Application de jeton de délai" dans sidebar
- [x] Badges visuels (violet/orange) pendant édition évaluation
- [x] Retrait jetons via bouton × (sidebar et banque)
- [x] Étoiles ⭐ dans liste productions (identification rapide)
- [ ] ⏭️ **Future** : Compteurs visuels jetons disponibles/utilisés (ex: 2/3)
- [ ] ⏭️ **Future** : Alerte visuelle si jetons épuisés

**Configuration** :
- [ ] ⏭️ **Future** : Réglages → Pratiques : Nombre de jetons délai par défaut (ex: 3)
- [ ] ⏭️ **Future** : Réglages → Pratiques : Nombre de jetons reprise par défaut (ex: 2)
- [ ] ⏭️ **Future** : Réglages → Pratiques : Durée délai standard (ex: 7 jours)

#### Fonctions créées/modifiées (Beta 80.1)
1. **`afficherGestionJetons()`** : Contrôle visibilité sections jetons (CRÉÉE)
2. **`gererDelaiAccorde()`** : Création vrais jetons avec date (AMÉLIORÉE)
3. **`appliquerJetonRepriseDepuisSidebar()`** : Application jeton depuis sidebar (CRÉÉE)

#### Tests de validation
- [x] ✅ Jeton de délai appliqué/retiré avec badge orange affiché
- [x] ✅ Jeton de reprise crée duplicata et archive original
- [x] ✅ Badges affichés dans sidebar et profil étudiant
- [x] ✅ Étoiles visibles dans liste productions
- [x] ✅ Indices C-P recalculés automatiquement
- [x] ✅ Évaluations remplacées exclues des calculs

---

### 💬 1.2 Cartouches de rétroaction contextuels
**Priorité** : ⚠️ HAUTE
**Estimation** : 4-5 jours
**Fichiers** : `cartouches.js`, nouveau `evaluation.js`

#### Fonctionnalités à implémenter

**Intégration dans évaluation** :
- [ ] Lors évaluation artefact, afficher boutons "Insérer cartouche" par critère SRPNF
- [ ] Filtrer cartouches selon niveau IDME sélectionné (I, D, M, E)
- [ ] Modal de sélection avec aperçu des cartouches disponibles
- [ ] Possibilité éditer cartouche avant insertion
- [ ] Insertion automatique dans champ rétroaction

**Suggestions intelligentes** :
- [ ] Si défi identifié = "Structure" ET niveau = "D", proposer cartouche Structure-D en premier
- [ ] Marqueur visuel "Suggéré pour cet étudiant" sur cartouches pertinentes
- [ ] Ordre : Cartouches suggérées → Cartouches du même niveau → Tous

**Historique et analyse** :
- [ ] Sauvegarder cartouches utilisées par étudiant dans `localStorage.historiqueCartouches`
- [ ] Afficher dans profil étudiant les 5 dernières rétroactions données
- [ ] Détecter rétroactions répétitives (même cartouche > 3 fois = blocage persistant)
- [ ] Alerte enseignant si pattern de blocage détecté

**Interface** :
- [ ] Bouton "💬 Insérer cartouche" à côté de chaque critère SRPNF
- [ ] Modal avec liste cartouches filtrées par niveau
- [ ] Aperçu texte complet avant insertion
- [ ] Bouton "Éditer" pour personnaliser avant insertion

#### Tests de validation
- [ ] Scénario 1 : Évaluer artefact niveau D, cartouches-D filtrées et affichées
- [ ] Scénario 2 : Étudiant avec défi "Français", cartouche Français-D suggérée en premier
- [ ] Scénario 3 : Insérer cartouche, éditer texte, sauvegarder, retrouver dans historique
- [ ] Scénario 4 : Même cartouche utilisée 3 fois, alerte "Blocage persistant" affichée

---

### 🎯 1.3 Recommandations personnalisées
**Priorité** : 🟡 MOYENNE
**Estimation** : 3-4 jours
**Fichiers** : `profil-etudiant.js`, nouveau `interventions.js`

#### Fonctionnalités à implémenter

**Contextualisation** :
- [ ] Intégrer statut SA dans recommandations (ex: "Vérifier accommodements SA en vigueur")
- [ ] Considérer historique interventions (ne pas suggérer deux fois la même chose)
- [ ] Adapter ton selon risque : urgent (critique) vs encourageant (stable)

**Ressources concrètes** :
- [ ] Liens vers capsules vidéo (Structure, Français, Rigueur) dans recommandations
- [ ] Documents de référence (grilles explicatives SRPNF)
- [ ] Exercices ciblés selon défi (ex: "Exercice Structure niveau 1")

**Plan d'intervention détaillé** :
- [ ] Timeline suggérée structurée (JOUR 1-2, SEMAINE 1, SEMAINE 2)
- [ ] Critères de réévaluation mesurables (ex: "Performance Structure > 65%")
- [ ] Indicateurs de progression attendus (ex: "Remise 2 artefacts consécutifs")

**Interface** :
- [ ] Section "Plan d'intervention suggéré" dans profil étudiant
- [ ] Affichage conditionnel (seulement si niveau RàI 2 ou 3)
- [ ] Boutons pour marquer actions complétées
- [ ] Date dernière révision du plan

#### Tests de validation
- [ ] Scénario 1 : Étudiant SA avec défi Français, recommandation mentionne SA
- [ ] Scénario 2 : Intervention "Rencontre CAF" déjà faite, pas re-suggérée
- [ ] Scénario 3 : Ressources concrètes cliquables et fonctionnelles
- [ ] Scénario 4 : Timeline affichée avec dates calculées automatiquement

---

## 📅 PHASE 2 : Enrichissement (3-4 semaines)
**Versions** : Beta 0.90 → Beta 0.95
**Objectif** : Implémenter fonctionnalités critiques non implémentées

### 📊 2.1 Matrice d'évaluation individuelle
**Priorité** : ⚠️ HAUTE
**Estimation** : 8-10 jours
**Fichiers** : Nouveau `evaluation.js`, `grilles.js`, `cartouches.js`

#### Fonctionnalités à implémenter

**Interface matricielle** :
- [ ] Vue grille : Lignes = Critères SRPNF, Colonnes = Niveaux IDME
- [ ] Sélection niveau par clic (radio buttons ou boutons visuels)
- [ ] Calcul automatique score pondéré en temps réel
- [ ] Affichage note finale provisoire pendant saisie

**Rétroaction granulaire** :
- [ ] Champ commentaire PAR critère (Structure, Rigueur, Plausibilité, Nuance, Français)
- [ ] Bouton "Insérer cartouche" à côté de chaque champ commentaire
- [ ] Synthèse automatique pour rétroaction globale (concaténation 5 commentaires)
- [ ] Possibilité éditer synthèse avant sauvegarde finale

**Sauvegarde progressive** :
- [ ] Auto-save toutes les 30 secondes dans `localStorage.evaluationsEnCours`
- [ ] Indicateur visuel "Dernière sauvegarde : il y a X secondes"
- [ ] Statut évaluation : "En cours" vs "Complétée"
- [ ] Récupération automatique si fermeture accidentelle

**Workflow** :
- [ ] Bouton "Évaluer" dans liste artefacts → Ouvre matrice
- [ ] Sélection grille SRPNF à utiliser (si plusieurs grilles existent)
- [ ] Saisie rapide par critère
- [ ] Aperçu note finale avant sauvegarde
- [ ] Confirmation "Évaluation complétée et sauvegardée"

#### Tests de validation
- [ ] Scénario 1 : Évaluer artefact, sélectionner niveaux, note calculée automatiquement
- [ ] Scénario 2 : Fermer navigateur pendant saisie, rouvrir, récupération auto-save
- [ ] Scénario 3 : Insérer cartouches par critère, synthèse générée automatiquement
- [ ] Scénario 4 : Modifier grille pondération, recalcul note instantané

---

### 📈 2.2 Visualisation évolution temporelle
**Priorité** : ⚠️ HAUTE
**Estimation** : 6-8 jours
**Fichiers** : Nouveau `graphiques.js`, `profil-etudiant.js`

#### Fonctionnalités à implémenter

**Graphiques de base** :
- [ ] Graphique linéaire : Évolution A-C-P sur la session (axe X = temps, axe Y = %)
- [ ] Courbe de risque : 1-(A×C×P) dans le temps
- [ ] Graphique barres : Performance SRPNF par critère (comparaison début vs maintenant)

**Analyses longitudinales** :
- [ ] Calcul tendance automatique (en amélioration / stable / en baisse)
- [ ] Icônes visuelles : 📈 (amélioration), ➡️ (stable), 📉 (baisse)
- [ ] Détection patterns temporels (ex: décrochage progressif, rebond après intervention)

**Marqueurs d'événements** :
- [ ] Marqueurs sur timeline pour interventions RàI effectuées
- [ ] Marqueurs pour jetons utilisés (délai, reprise)
- [ ] Marqueurs pour événements clés (mi-session, fin période)
- [ ] Tooltip au survol : détails de l'événement

**Interface** :
- [ ] Onglet "Évolution" dans profil étudiant (à côté de Suivi/Habiletés/Mobilisation)
- [ ] Sélecteur période : Dernières 2 semaines / 4 semaines / Toute la session
- [ ] Boutons toggle pour afficher/masquer courbes (A, C, P, Risque)
- [ ] Export PNG des graphiques pour rapports

#### Tests de validation
- [ ] Scénario 1 : Historique avec 10 entrées, graphiques affichés correctement
- [ ] Scénario 2 : Tendance détectée (amélioration), icône 📈 affichée
- [ ] Scénario 3 : Marqueur intervention visible sur timeline avec tooltip
- [ ] Scénario 4 : Export PNG fonctionnel, image de qualité suffisante

---

### ✅ 2.3 Gestion présences avancée
**Priorité** : 🟡 MOYENNE
**Estimation** : 4-5 jours
**Fichiers** : `saisie-presences.js`, `horaire.js`

#### Fonctionnalités à implémenter

**Granularité statuts** :
- [ ] Statuts disponibles : Présent, Absent, Retard, Départ anticipé, Absence justifiée
- [ ] Durée effective présence (ex: "Présent 1h30 / 3h" si retard + départ anticipé)
- [ ] Calcul assiduité ajusté selon durée effective

**Motifs et justifications** :
- [ ] Motifs configurables : Maladie, SA, Événement collège, Personnel, Non justifié
- [ ] Champ commentaire libre par absence
- [ ] Statut "Justification reçue" (oui/non)

**Exports et rapports** :
- [ ] Export PDF liste présences pour signature étudiants
- [ ] Génération rapport absences pour API (si > X absences configurables)
- [ ] Liste étudiants avec 3+ absences consécutives

**Alertes automatiques** :
- [ ] Alerte si 3 absences consécutives (badge rouge dans tableau de bord)
- [ ] Alerte si > 30% absences non justifiées
- [ ] Suggestion intervention RàI automatique si assiduité < 60%

#### Tests de validation
- [ ] Scénario 1 : Saisir retard 30 min, assiduité calculée avec durée effective
- [ ] Scénario 2 : 3 absences consécutives, alerte affichée dans tableau de bord
- [ ] Scénario 3 : Export PDF liste présences, format imprimable correct
- [ ] Scénario 4 : Motif "SA" sélectionné, statut justifié automatiquement

---

## 📅 PHASE 3 : Optimisation (2-3 semaines)
**Versions** : Beta 0.96 → Version 1.0
**Objectif** : Performance, robustesse, UX pour version stable

### ⚡ 3.1 Performance et scalabilité
**Priorité** : ⚠️ HAUTE
**Estimation** : 6-7 jours
**Fichiers** : Tous modules

#### Améliorations à implémenter

**Pagination et chargement** :
- [ ] Pagination automatique si > 50 étudiants dans liste
- [ ] Chargement différé (lazy loading) des profils étudiants
- [ ] Indicateur de progression pour opérations > 2 secondes

**Optimisation calculs** :
- [ ] Convertir `calculerEtStockerIndicesCP()` en asynchrone (Web Worker)
- [ ] Cache en mémoire pour calculs coûteux (ex: moyennes SRPNF)
- [ ] Invalidation cache intelligente (seulement si données changées)

**Rechargements incrémentaux** :
- [ ] Recharger seulement section modifiée (pas toute la page)
- [ ] Mise à jour réactive (observer localStorage changes)
- [ ] Optimistic UI (afficher changement immédiatement, sauvegarder en background)

#### Tests de validation
- [ ] Scénario 1 : 100 étudiants, pagination fonctionne, < 2 sec chargement
- [ ] Scénario 2 : Calculer indices C-P, UI reste réactive (pas de blocage)
- [ ] Scénario 3 : Modifier présence, seulement section Assiduité rechargée
- [ ] Scénario 4 : Cache activé, 2e chargement 5x plus rapide que 1er

---

### 🛡️ 3.2 Robustesse et sécurité
**Priorité** : ⚠️ HAUTE
**Estimation** : 5-6 jours
**Fichiers** : Tous modules, nouveau `validation.js`

#### Améliorations à implémenter

**Validation données** :
- [ ] Validation formats : DA (7 chiffres), dates (YYYY-MM-DD), notes (0-100)
- [ ] Validation cohérence : Date fin trimestre > date début
- [ ] Messages erreur explicites (pas "Invalid input", mais "Le DA doit contenir 7 chiffres")

**Détection corruptions** :
- [ ] Test intégrité JSON avant parse (try-catch avec fallback)
- [ ] Vérification structure attendue (ex: indicesCP doit avoir clé 'actuel')
- [ ] Alerte utilisateur si corruption détectée + option réimporter backup

**Sauvegardes automatiques** :
- [ ] Auto-backup localStorage → fichier JSON toutes les 15 minutes
- [ ] Versioning exports : backup_2025-10-30_14h30_v1.json
- [ ] Conservation 5 dernières versions (suppression auto anciennes)
- [ ] Undo global : restaurer version précédente si erreur

**Logs et diagnostic** :
- [ ] Logs d'erreurs persistants dans `localStorage.errorLogs`
- [ ] Mode diagnostic activable (bouton dans Réglages)
- [ ] Export logs pour debugging (aide au support utilisateur)

#### Tests de validation
- [ ] Scénario 1 : Saisir DA invalide "ABC1234", message erreur explicite affiché
- [ ] Scénario 2 : Corrompre JSON indicesCP, détection + alerte + option restaurer
- [ ] Scénario 3 : Auto-backup créé après 15 min, fichier téléchargeable
- [ ] Scénario 4 : Action incorrecte, undo global restaure état précédent

---

### 🎨 3.3 UX et accessibilité
**Priorité** : 🟡 MOYENNE
**Estimation** : 4-5 jours
**Fichiers** : Tous modules, `styles.css`, `navigation.js`

#### Améliorations à implémenter

**Navigation améliorée** :
- [ ] Recherche rapide étudiant (Ctrl+K) : taper nom ou DA
- [ ] Résultats instantanés (filtre en temps réel)
- [ ] Navigation clavier (↑↓ pour sélectionner, Enter pour ouvrir)

**Raccourcis clavier** :
- [ ] Ctrl+S : Sauvegarder (évaluation, production, etc.)
- [ ] Ctrl+K : Recherche rapide étudiant
- [ ] Ctrl+E : Ouvrir export/import
- [ ] Échap : Fermer modals
- [ ] Afficher liste raccourcis (bouton ? dans header)

**Mode impression** :
- [ ] CSS spécial @media print
- [ ] Masquer navigation, boutons, éléments interactifs
- [ ] Format A4 optimisé (marges, sauts de page)
- [ ] Option "Imprimer ce profil" dans profil étudiant

**Personnalisation** :
- [ ] Réglages → Affichage : Taille police (Petit / Moyen / Grand)
- [ ] Réglages → Affichage : Contraste (Normal / Élevé)
- [ ] Réglages → Affichage : Mode sombre (si temps disponible)

**Accessibilité** :
- [ ] ARIA labels sur tous boutons et champs
- [ ] Support navigation clavier (tab order logique)
- [ ] Focus visible sur éléments interactifs
- [ ] Alt text sur icônes importantes
- [ ] Test lecteur d'écran (NVDA ou VoiceOver)

#### Tests de validation
- [ ] Scénario 1 : Ctrl+K, taper "Dupont", résultats filtrés instantanément
- [ ] Scénario 2 : Navigation clavier complète sans souris
- [ ] Scénario 3 : Imprimer profil, format A4 propre sans éléments inutiles
- [ ] Scénario 4 : Lecteur d'écran, tous éléments annoncés correctement

---

## 📅 PHASE 4 : Analyses avancées (Post-1.0)
**Versions** : 1.1+
**Objectif** : Fonctionnalités analytiques et prédictives

### 📊 4.1 Statistiques de groupe avancées
**Priorité** : 🟢 BASSE (Post-1.0)
**Estimation** : 6-8 jours

- [ ] Comparaison avec sessions antérieures (même cours, sessions précédentes)
- [ ] Benchmark par programme (420 vs 300 vs 180)
- [ ] Détection anomalies groupe (> 30% risque critique = alerte)
- [ ] Rapports PDF exportables (synthèse groupe pour réunions)
- [ ] Graphiques de distribution (histogrammes A-C-P)

### 🤖 4.2 Prédictions et intelligence artificielle
**Priorité** : 🟢 BASSE (Post-1.0)
**Estimation** : 15-20 jours (complexe)

- [ ] Prédiction risque précoce (dès semaine 3 avec régression logistique)
- [ ] Recommandations par ML (basées sur historique interventions réussies)
- [ ] Détection patterns atypiques (étudiants ne correspondant à aucun pattern standard)
- [ ] Suggestions ajustements pédagogiques (si 50% groupe même défi)

---

## 📈 Indicateurs de succès

### Métriques de complétude par phase

| Phase | Début | Cible fin phase | Fonctionnalités clés |
|-------|-------|-----------------|----------------------|
| **PHASE 1** | 72% | 82% | Jetons, Cartouches, Recommandations |
| **PHASE 2** | 82% | 92% | Matrice évaluation, Graphiques, Présences |
| **PHASE 3** | 92% | 100% | Performance, Robustesse, UX |
| **PHASE 4** | 100% | 110% | Statistiques avancées, Prédictions |

### Critères version 1.0 stable

- ✅ **Toutes fonctionnalités guide** : 100% des fonctionnalités décrites implémentées
- ✅ **Performance** : Chargement < 2 sec pour 100 étudiants
- ✅ **Robustesse** : Pas de perte de données, récupération erreurs
- ✅ **UX** : Navigation intuitive, accessibilité WCAG AA
- ✅ **Documentation** : Guide utilisateur complet + vidéos tutoriels
- ✅ **Tests** : 3 enseignants testeurs validant chaque fonctionnalité

---

## 🚀 Prochaines étapes immédiates

### Cette semaine (30 oct - 3 nov)
1. ✅ Valider ce plan de match avec l'équipe
2. ✅ Créer structure `evaluation.js` (squelette)
3. ✅ Implémenter jetons délai (logique de base)

### Semaine prochaine (4-10 nov)
1. Finaliser jetons délai et reprise (tests complets)
2. Intégrer cartouches dans workflow évaluation
3. Créer interface matrice évaluation (prototype)

### Dans 2 semaines (11-17 nov)
1. Compléter matrice évaluation (tous critères SRPNF)
2. Commencer graphiques évolution temporelle
3. Tests utilisateurs PHASE 1 (jetons + cartouches)

---

## 📝 Notes importantes

### Contraintes techniques
- **LocalStorage** : Limite 5-10 MB → Surveiller usage, nettoyer données anciennes
- **Pas de backend** : Impossible synchronisation multi-appareils (feature future possible)
- **Navigateurs** : Tester Safari, Chrome, Firefox, Edge (support IE abandonné)

### Dépendances externes
- **Aucune librairie** : 100% vanilla JS (contrainte projet)
- **Graphiques** : Créer SVG custom (pas de Chart.js ou D3.js)
- **PDF export** : Utiliser window.print() avec CSS @media print

### Ressources nécessaires
- **Développement** : 1 développeur à temps plein (Claude Code + validation humaine)
- **Tests** : 3 enseignants testeurs bénévoles
- **Documentation** : Rédaction guide + vidéos (~ 5 jours)

---

**Plan créé par** : Claude Code
**Date** : 30 octobre 2025
**Prochaine révision** : Fin PHASE 1 (mi-novembre 2025)
**Contact** : [Votre email]
