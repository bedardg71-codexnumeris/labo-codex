# Guide pour testeurs - Système de Monitorage Pédagogique Beta 91.1

**Merci de participer aux tests de cette application !**

Vos retours sont essentiels pour améliorer l'outil et le rendre plus utile pour la communauté enseignante.

---

## 📋 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Installation et premiers pas](#installation-et-premiers-pas)
3. [Charger votre pratique prédéfinie](#charger-votre-pratique-prédéfinie)
4. [Scénarios de test](#scénarios-de-test)
5. [Comment faire vos retours](#comment-faire-vos-retours)
6. [Problèmes connus](#problèmes-connus)
7. [FAQ](#faq)
8. [Contact](#contact)

---

## Vue d'ensemble

### Qu'est-ce que vous testez ?

Une application web de **suivi de l'apprentissage** qui aide les enseignants à :
- ✅ Identifier précocement les étudiants à risque d'échec
- ✅ Calculer automatiquement des indices prédictifs (A-C-P-E : Assiduité, Complétion, Performance, Engagement)
- ✅ **Utiliser votre propre pratique de notation** (7 pratiques prédéfinies disponibles)
- ✅ **Créer des pratiques personnalisées** avec le wizard interactif en 8 étapes
- ✅ Générer des recommandations d'intervention (RàI)

### Version testée

**Beta 91.1** (26 novembre 2025) - Fonctionnalités principales :

**🆕 NOUVEAUTÉS BETA 91.1**
- **7 pratiques prédéfinies** : Chargement en 2 clics de votre pratique de notation
  - PAN-Standards 5 niveaux (Bruno V. - Chimie)
  - Sommative traditionnelle (Marie-Hélène L. - Littérature)
  - PAN-Spécifications (François A.-H. - Chimie)
  - PAN-Maîtrise IDME (Grégoire Bédard - Littérature)
  - PAN-Objectifs pondérés (Michel B. - Mathématiques)
  - Sommative avec remplacement (Jordan R. - Philosophie)
  - PAN-Jugement global (Isabelle M. - Biologie)

- **Wizard de création de pratiques** : Interface en 8 étapes pour créer votre propre pratique
  - Informations de base, Échelle, Structure, Calcul de note, Reprises, Critères, Seuils, Terminologie
  - Validation à chaque étape, prévisualisation des choix
  - Export/Import JSON pour partage entre collègues

- **Système multi-objectifs** : Pour pratiques par objectifs d'apprentissage (comme Michel B.)
  - Tableau des objectifs avec type (fondamental, intégrateur, transversal)
  - Performance par objectif avec niveau IDME
  - Détection automatique des défis par type d'objectif

- **Architecture IndexedDB** : Capacité de stockage améliorée (5-10 MB → plusieurs GB)
  - Supporte plusieurs groupes simultanés (à venir Beta 92+)
  - Fallback automatique si IndexedDB indisponible

**Fonctionnalités existantes**
- **Architecture modulaire** : Système de pratiques de notation (Sommative, PAN-Maîtrise, Configurable)
- **Système de jetons personnalisés** : Délai, reprise, aide, bonus configurables
- **Visualisation avancée** : Barres de distribution avec nuages de points, gradients lumineux
- **Engagement vs Risque** : Reformulation positive (Engagement = A × C × P)
- **Dépistage universel** : Grille de référence configurable (pas seulement SRPNF)
- **Patterns et RàI optionnels** : Activation/désactivation selon besoins
- **Mode comparatif** : Affichage dual Sommative (orange) vs PAN (bleu)

### Durée du test

**Minimum recommandé :** 2-3 semaines avec un groupe réel d'étudiants
**Idéal :** Tout le trimestre

Mais même **1 semaine d'exploration** est utile !

### Ce qu'on attend de vous

**Vos objectifs de test :**
- ✅ Installer et démarrer l'application
- ✅ **Charger votre pratique prédéfinie** (si elle est disponible)
- ✅ Explorer les fonctionnalités principales
- ✅ Identifier les bugs ou comportements inattendus
- ✅ Évaluer la facilité d'utilisation
- ✅ Suggérer des améliorations

**Vous n'êtes PAS obligé de :**
- ❌ Tester chaque fonction en détail
- ❌ Utiliser avec un vrai groupe (les données de démo suffisent)
- ❌ Rédiger un rapport formel

**Un simple retour sur vos impressions est précieux !**

---

## Installation et premiers pas

### Prérequis

- Navigateur moderne (Safari, Chrome, Firefox, Edge)
- 10 Mo d'espace disque
- Aucune connexion Internet requise (fonctionne hors-ligne)

### Installation (2 minutes)

1. **Décompresser** le fichier ZIP dans un dossier
2. **Ouvrir** le fichier `index 91.html`
3. **Importer** les données de démonstration :
   - Réglages → Import/Export
   - Sélectionner `donnees-demo.json`
   - Cliquer "Importer"

**✅ C'est prêt !** Vous pouvez maintenant explorer.

### Première exploration (5 minutes)

**1. Tableau de bord**
- Cliquer sur "Tableau de bord" dans le menu
- Observer les indices A-C-P-E des étudiants
- Remarquer les **nuages de points** avec gradients lumineux
- Identifier les étudiants à faible engagement (barres vertes)

**2. Profil d'un étudiant**
- Cliquer sur un nom d'étudiant
- Explorer les 3 sections :
  * Suivi de l'apprentissage
  * Développement des habiletés
  * Mobilisation
- Tester les boutons Précédent/Suivant

**3. Système de jetons**
- Dans un profil étudiant, section "Accompagnement"
- Observer les compteurs de jetons disponibles/utilisés
- Cliquer sur "Attribuer un jeton" pour tester

**4. Les trois modes**
- Cliquer sur le badge "Normal" en haut à droite
- Essayer : Normal → Anonymisation → Simulation
- Observer les changements de données (noms anonymisés, données simulées)

---

## Charger votre pratique prédéfinie

### 🆕 NOUVEAU : Pratiques prédéfinies (Beta 91.1)

Si votre pratique de notation est dans la liste ci-dessous, vous pouvez la charger en **2 clics** !

#### Pratiques disponibles

| Enseignant·e | Pratique | Description courte |
|--------------|----------|-------------------|
| **Bruno V.** | PAN-Standards (5 niveaux) | 10 standards, 5 niveaux (0-4), reprises illimitées, niveau non rétrogradable |
| **Marie-Hélène L.** | Sommative traditionnelle | Moyenne pondérée, double verrou sur analyse finale (≥60%) |
| **François A.-H.** | PAN-Spécifications | Notes fixes selon objectifs atteints (50, 60, 80, 100) |
| **Grégoire Bédard** | PAN-Maîtrise (IDME) | Échelle IDME (I, D, M, E), critères SRPNF, N derniers artefacts |
| **Michel B.** | PAN-Objectifs pondérés | 13 objectifs avec poids variables, moyenne pondérée par objectif |
| **Jordan R.** | Sommative + remplacement | Examens peuvent remplacer travaux/quiz selon performance |
| **Isabelle M.** | PAN-Jugement global | Mode statistique + jugement professionnel pour cas limites |

#### Étapes de chargement

1. **Aller dans Réglages → Pratique de notation**
2. **Cliquer sur le bouton vert "Exemples de pratiques"**
3. **Sélectionner votre pratique** dans la liste (cocher la case)
4. **Cliquer sur "Charger les pratiques sélectionnées"**
5. **Fermer le modal**
6. **Sélectionner votre pratique** dans le menu déroulant "Pratique active"
7. **Cliquer sur "Sauvegarder"**

**✅ Votre pratique est maintenant active !** Vous pouvez commencer à créer vos évaluations et saisir vos données.

#### Personnalisation après chargement

Les pratiques prédéfinies sont des **modèles de départ**. Vous pouvez les personnaliser :
- Modifier les seuils d'interprétation
- Ajuster le nombre de standards/objectifs
- Changer la terminologie
- Adapter les critères d'évaluation

**⚠️ Note** : Si vous personnalisez une pratique, pensez à l'exporter en JSON (bouton "Exporter JSON") pour la sauvegarder.

---

## Scénarios de test

### 🟢 Test de base (15 minutes)

**Objectif :** Vérifier que les fonctions essentielles marchent.

**Scénario 1 : Navigation**
- [ ] Naviguer entre les sections principales
- [ ] Ouvrir 3-4 profils d'étudiants différents
- [ ] Utiliser Précédent/Suivant dans les profils
- [ ] Changer de mode (Normal/Anonymisation/Simulation)

**Scénario 2 : Charger une pratique prédéfinie** 🆕
- [ ] Aller dans Réglages → Pratique de notation
- [ ] Cliquer sur "Exemples de pratiques"
- [ ] Observer la liste des 7 pratiques disponibles
- [ ] Charger une pratique (la vôtre si disponible)
- [ ] Vérifier que la pratique apparaît dans le menu déroulant
- [ ] Sélectionner et sauvegarder

**Scénario 3 : Visualisations**
- [ ] Observer les nuages de points dans le tableau de bord
- [ ] Survoler des points (animation et grossissement)
- [ ] Comparer les gradients de couleur (Patterns, RàI)
- [ ] Activer/désactiver le mode comparatif (Réglages → Pratique)

**Scénario 4 : Lecture des données**
- [ ] Comprendre l'indice A (Assiduité)
- [ ] Comprendre l'indice C (Complétion)
- [ ] Comprendre l'indice P (Performance)
- [ ] Comprendre l'indice E (Engagement = A × C × P)

**Questions à vous poser :**
- Est-ce que tout s'affiche correctement ?
- Y a-t-il des bugs visuels ?
- La navigation est-elle fluide ?
- Le chargement d'une pratique prédéfinie est-il intuitif ?

---

### 🟡 Test intermédiaire (30 minutes)

**Objectif :** Tester les fonctionnalités de saisie.

**Scénario 5 : Modifier des données**
- [ ] Aller dans Évaluations → Liste des évaluations
- [ ] Cliquer sur une évaluation
- [ ] Modifier quelques notes
- [ ] Retourner au tableau de bord
- [ ] Vérifier que les indices ont changé

**Scénario 6 : Saisir des présences**
- [ ] Aller dans Présences → Saisie
- [ ] Saisir une nouvelle séance
- [ ] Cocher/décocher des présences
- [ ] Enregistrer
- [ ] Vérifier l'impact sur l'indice A

**Scénario 7 : Wizard de création de pratiques** 🆕
- [ ] Aller dans Réglages → Pratique de notation
- [ ] Cliquer sur "Créer une pratique"
- [ ] Parcourir les 8 étapes du wizard
- [ ] Observer les formulaires dynamiques selon les choix
- [ ] Créer une pratique simple de test
- [ ] Vérifier qu'elle apparaît dans la liste des pratiques

**Scénario 8 : Export/Import**
- [ ] Réglages → Import/Export
- [ ] Exporter les données (choisir quelques clés)
- [ ] Télécharger le fichier JSON
- [ ] Effacer une clé (ex: présences)
- [ ] Réimporter le fichier
- [ ] Vérifier que les données sont restaurées

**Questions à vous poser :**
- La saisie est-elle intuitive ?
- Les calculs se font-ils automatiquement ?
- Y a-t-il des messages d'erreur ?
- Le wizard de création est-il facile à comprendre ?

---

### 🔴 Test avancé (1-2 semaines)

**Objectif :** Utiliser avec un vrai groupe (ou créer vos propres données).

**Scénario 9 : Configuration complète**
- [ ] Effacer les données de démo
- [ ] Configurer votre cours
- [ ] Définir votre trimestre
- [ ] Créer votre groupe d'étudiants
- [ ] Paramétrer votre horaire
- [ ] Charger votre pratique prédéfinie (ou créer la vôtre avec le wizard)

**Scénario 10 : Utilisation réelle**
- [ ] Créer vos évaluations (ou productions)
- [ ] Saisir les notes sur 2-3 semaines
- [ ] Saisir les présences régulièrement
- [ ] Consulter le tableau de bord chaque semaine
- [ ] Utiliser les profils pour identifier les élèves à risque

**Scénario 11 : Mode comparatif** (si applicable)
- [ ] Activer le mode comparatif dans Réglages → Pratique de notation
- [ ] Créer des évaluations sommatives ET des artefacts portfolio
- [ ] Comparer les indices Sommative (orange) vs PAN (bleu)
- [ ] Observer les différences de patterns et recommandations RàI

**Scénario 12 : Système multi-objectifs** 🆕 (Michel B. uniquement)
- [ ] Charger la pratique "PAN-Objectifs pondérés Michel"
- [ ] Créer des productions liées aux objectifs (champ "objectif")
- [ ] Évaluer plusieurs étudiants
- [ ] Consulter le profil d'un étudiant
- [ ] Observer le tableau des 13 objectifs avec type, poids, performance, niveau, statut
- [ ] Vérifier la détection automatique des défis par type d'objectif

**Questions à vous poser :**
- L'outil vous aide-t-il vraiment à détecter les élèves à risque ?
- Les recommandations RàI sont-elles pertinentes ?
- Gagnez-vous du temps par rapport à vos méthodes actuelles ?
- Votre pratique prédéfinie correspond-elle bien à votre approche réelle ?
- Recommanderiez-vous l'outil à un collègue ?

---

## Comment faire vos retours

### Formulaire de feedback (RECOMMANDÉ)

**Lien du formulaire :** [À ajouter selon vos besoins]

- ⏱️ Durée : 5-10 minutes
- 🔒 Anonyme si vous le souhaitez
- 📊 Collecte structurée des retours

### Email

Si vous préférez un retour plus personnel ou détaillé :

**📧 labo@codexnumeris.org**

**Objet :** [Test Monitorage Beta 91.1] Vos retours

**Informations utiles à inclure :**
- Navigateur utilisé (ex: Chrome 131, Safari 18)
- Système d'exploitation (ex: macOS 15.1, Windows 11)
- Version testée (Beta 91.1)
- Pratique utilisée (ex: PAN-Standards Bruno, Sommative traditionnelle)
- Durée du test (1 semaine, 1 mois, etc.)

### Ce qui nous intéresse particulièrement

**✅ Points forts**
- Qu'est-ce qui fonctionne bien ?
- Qu'est-ce qui devrait être conservé ?
- Quelle fonctionnalité vous a le plus aidé ?

**❌ Points faibles**
- Qu'est-ce qui est frustrant ?
- Qu'est-ce qui est difficile à comprendre ?
- Qu'est-ce qui prend trop de temps ?

**🐛 Bugs**
- Comportements inattendus
- Erreurs dans les calculs
- Problèmes d'affichage
- Données perdues

**💡 Suggestions**
- Fonctionnalités manquantes
- Améliorations possibles
- Idées pour simplifier l'utilisation

**🆕 Pratiques prédéfinies**
- Votre pratique correspond-elle bien à votre approche réelle ?
- Quelles modifications avez-vous dû faire après chargement ?
- Le wizard de création est-il utile pour créer une pratique personnalisée ?

### Comment documenter un bug

**Format idéal :**
```
1. Ce que j'ai fait : [Action effectuée]
2. Ce que j'attendais : [Résultat espéré]
3. Ce que j'ai obtenu : [Résultat réel]
4. Capture d'écran : [Si possible]
```

**Exemple :**
```
1. Ce que j'ai fait : Cliqué sur "Charger les pratiques sélectionnées"
2. Ce que j'attendais : Ma pratique apparaît dans le menu déroulant
3. Ce que j'ai obtenu : Rien ne s'est passé, pas de message
4. Capture d'écran : bug-chargement-pratique.png
```

---

## Problèmes connus

### Limitations actuelles

**Stockage local** (IndexedDB + localStorage)
- Les données sont dans le navigateur
- Si vous effacez le cache, vous perdez vos données
- **Solution :** Exportez régulièrement en JSON

**Navigation privée**
- Les données sont perdues à la fermeture
- **Solution :** Utilisez en mode normal

**Pas de synchronisation**
- Pas de synchronisation entre appareils
- **Solution :** Exportez/importez le JSON

**Support multi-groupes**
- Version Beta 91.1 : Un seul groupe à la fois
- **À venir Beta 92+** : Support de plusieurs groupes simultanés

### Bugs connus (en cours de correction)

*(Cette section sera mise à jour selon les retours)*

Aucun bug majeur connu pour l'instant.

---

## FAQ

**Q : Puis-je utiliser mes vraies données d'étudiants ?**
R : Oui, mais faites attention à la confidentialité. Exportez régulièrement et ne partagez pas le fichier JSON.

**Q : Combien de temps faut-il pour configurer l'application ?**
R : Avec les données de démo : 2 minutes. Avec vos propres données : 10-15 minutes. Avec une pratique prédéfinie : 5 minutes (chargement + configuration de base).

**Q : Les calculs des indices sont-ils fiables ?**
R : Oui, les formules sont basées sur des recherches publiées. Mais l'outil est en beta, donc validez avec vos propres observations.

**Q : Puis-je utiliser sur iPad ?**
R : Oui, Safari sur iPad fonctionne bien. L'interface s'adapte à l'écran.

**Q : Est-ce que je perds mes données si je ferme le navigateur ?**
R : Non, les données restent dans IndexedDB et localStorage. Mais exportez régulièrement par sécurité.

**Q : Comment supprimer complètement mes données ?**
R : Réglages → Import/Export → "Effacer toutes les données"

**Q : Puis-je modifier le code de l'application ?**
R : Oui ! L'application est sous double licence (AGPL v3 pour le code, CC BY-NC-SA 4.0 pour le contenu pédagogique). Voir LICENSE.md

**Q : Que signifient les indices A-C-P-E ?**
R :
- **A = Assiduité** (présence en classe)
- **C = Complétion** (remise des travaux)
- **P = Performance** (qualité des productions)
- **E = Engagement** (formule : A × C × P, remplace l'ancien "Risque")

**Q : Pourquoi "Engagement" au lieu de "Risque d'échec" ?**
R : Reformulation positive pour favoriser la motivation. Un engagement élevé (85%+) indique un bon engagement, un engagement faible (<65%) nécessite une intervention.

**Q : Comment fonctionne le système multi-objectifs ?** 🆕
R : Pour chaque objectif d'apprentissage, l'application calcule une performance moyenne (P) en sélectionnant les N meilleurs artefacts. La note finale est une moyenne pondérée selon l'importance de chaque objectif. Les défis sont détectés par type d'objectif (intégrateur, fondamental, transversal).

**Q : Puis-je créer ma propre pratique si elle n'est pas dans les exemples ?** 🆕
R : Oui ! Utilisez le wizard de création (bouton "Créer une pratique") qui vous guide en 8 étapes. Vous pouvez aussi partir d'une pratique prédéfinie et la personnaliser.

**Q : Comment partager ma pratique avec un collègue ?** 🆕
R : Après avoir créé ou personnalisé votre pratique, cliquez sur "Exporter JSON" dans la liste des pratiques. Envoyez le fichier JSON à votre collègue, qui pourra l'importer avec le bouton "Importer JSON".

**Q : C'est quoi la différence entre les pratiques Sommative et PAN ?**
R :
- **Sommative** : Pratique traditionnelle (examens, travaux notés, moyenne pondérée de toutes les évaluations)
- **PAN (Pratique alternative de notation)** : Sélection des N meilleurs artefacts, reprises illimitées, échelle de niveaux (IDME, 0-1-2-3-4, etc.)

**Q : Le mode comparatif, c'est pour quoi ?**
R : Pour comparer les deux pratiques (Sommative vs PAN-Maîtrise) avec les mêmes étudiants et voir les différences dans les diagnostics et recommandations.

---

## Contact

**Développeur :** Grégoire Bédard
**Email :** labo@codexnumeris.org
**Site web :** https://codexnumeris.org

**Formulaire de feedback :** [À ajouter selon vos besoins]

---

## Remerciements

Merci de contribuer à l'amélioration de cet outil !

Vos retours aideront non seulement à corriger les bugs, mais aussi à rendre l'application plus utile pour tous les enseignants qui l'utiliseront.

**L'observation des micro données permet de faire des interventions proactives qui supportent mieux l'apprenant·e dans son parcours.**

Bons tests ! 🎓

---

**Fichier créé le :** 27 octobre 2025
**Dernière mise à jour :** 26 novembre 2025
**Version du guide :** 3.0
**Version de l'app testée :** Beta 91.1
