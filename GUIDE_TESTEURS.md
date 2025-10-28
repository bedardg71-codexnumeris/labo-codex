# Guide pour testeurs - Système de Monitorage Pédagogique Beta 0.74

**Merci de participer aux tests de cette application !**

Vos retours sont essentiels pour améliorer l'outil et le rendre plus utile pour la communauté enseignante.

---

## 📋 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Installation et premiers pas](#installation-et-premiers-pas)
3. [Scénarios de test](#scénarios-de-test)
4. [Comment faire vos retours](#comment-faire-vos-retours)
5. [Problèmes connus](#problèmes-connus)
6. [FAQ](#faq)
7. [Contact](#contact)

---

## Vue d'ensemble

### Qu'est-ce que vous testez ?

Une application web de **monitorage pédagogique** qui aide les enseignants à :
- ✅ Identifier précocement les étudiants à risque d'échec
- ✅ Calculer automatiquement des indices prédictifs (A-C-P-R)
- ✅ Comparer deux pratiques de notation (sommative vs alternative)
- ✅ Générer des recommandations d'intervention (RàI)

### Version testée

**Beta 0.74** - Fonctionnalités principales :
- Système hybride SOM-PAN (notation sommative + portfolio alternatif)
- Refonte du système de jetons
- Moteur de recherche dans la section Aide
- Navigation cross-mode intelligente (Normal/Anonymisé/Simulé)

### Durée du test

**Minimum recommandé :** 2-3 semaines avec un groupe réel d'étudiants
**Idéal :** Tout le trimestre

Mais même **1 semaine d'exploration** est utile !

### Ce qu'on attend de vous


**Vos objectifs de test :**
- ✅ Installer et démarrer l'application
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
2. **Ouvrir** le fichier `index 74 (moteur recherche Aide).html`
3. **Importer** les données de démonstration :
   - Réglages → Import/Export
   - Sélectionner `donnees-demo.json`
   - Cliquer "Importer"

**✅ C'est prêt !** Vous pouvez maintenant explorer.

### Première exploration (5 minutes)

**1. Tableau de bord**
- Cliquer sur "Tableau de bord" dans le menu
- Observer les indices A-C-P-R des étudiants
- Remarquer les couleurs : Orange (SOM) vs Bleu (PAN)
- Identifier les étudiants à risque (barres rouges)

**2. Profil d'un étudiant**
- Cliquer sur un nom d'étudiant
- Explorer les 3 sections :
  * Suivi de l'apprentissage
  * Développement des habiletés
  * Mobilisation
- Tester les boutons Précédent/Suivant

**3. Section Aide**
- Cliquer sur "Aide" dans le menu
- Utiliser le moteur de recherche : tapez "risque"
- Observer le surlignage des résultats

**4. Les trois modes**
- Cliquer sur le badge "Normal" en haut à droite
- Essayer : Normal → Anonymisé → Simulé
- Observer les changements de données

---

## Scénarios de test

### 🟢 Test de base (15 minutes)

**Objectif :** Vérifier que les fonctions essentielles marchent.

**Scénario 1 : Navigation**
- [ ] Naviguer entre les sections principales
- [ ] Ouvrir 3-4 profils d'étudiants différents
- [ ] Utiliser Précédent/Suivant dans les profils
- [ ] Changer de mode (Normal/Anonymisé/Simulé)

**Scénario 2 : Recherche dans l'Aide**
- [ ] Chercher "assiduité"
- [ ] Chercher "SRPNF"
- [ ] Chercher "risque"
- [ ] Effacer la recherche (cliquer X)

**Scénario 3 : Lecture des données**
- [ ] Comprendre l'indice A (Assiduité)
- [ ] Comprendre l'indice C (Complétion)
- [ ] Comprendre l'indice P (Performance)
- [ ] Comprendre l'indice R (Risque d'échec)

**Questions à vous poser :**
- Est-ce que tout s'affiche correctement ?
- Y a-t-il des bugs visuels ?
- La navigation est-elle fluide ?

---

### 🟡 Test intermédiaire (30 minutes)

**Objectif :** Tester les fonctionnalités de saisie.

**Scénario 4 : Modifier des données**
- [ ] Aller dans Évaluations → Liste des évaluations
- [ ] Cliquer sur une évaluation
- [ ] Modifier quelques notes
- [ ] Retourner au tableau de bord
- [ ] Vérifier que les indices ont changé

**Scénario 5 : Saisir des présences**
- [ ] Aller dans Présences → Saisie
- [ ] Saisir une nouvelle séance
- [ ] Cocher/décocher des présences
- [ ] Enregistrer
- [ ] Vérifier l'impact sur l'indice A

**Scénario 6 : Export/Import**
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

---

### 🔴 Test avancé (1-2 semaines)

**Objectif :** Utiliser avec un vrai groupe (ou créer vos propres données).

**Scénario 7 : Configuration complète**
- [ ] Effacer les données de démo
- [ ] Configurer votre cours
- [ ] Définir votre trimestre
- [ ] Créer votre groupe d'étudiants
- [ ] Paramétrer votre horaire
- [ ] Choisir votre pratique (SOM ou PAN)

**Scénario 8 : Utilisation réelle**
- [ ] Créer vos évaluations
- [ ] Saisir les notes sur 2-3 semaines
- [ ] Saisir les présences régulièrement
- [ ] Consulter le tableau de bord chaque semaine
- [ ] Utiliser les profils pour identifier les élèves à risque

**Scénario 9 : Mode comparatif (si vous utilisez PAN)**
- [ ] Activer le mode comparatif dans Réglages → Pratiques
- [ ] Créer des évaluations sommatives ET des artefacts
- [ ] Comparer les indices SOM (orange) vs PAN (bleu)
- [ ] Observer les différences de recommandations

**Questions à vous poser :**
- L'outil vous aide-t-il vraiment à détecter les élèves à risque ?
- Les recommandations RàI sont-elles pertinentes ?
- Gagnez-vous du temps par rapport à vos méthodes actuelles ?
- Recommanderiez-vous l'outil à un collègue ?

---

## Comment faire vos retours

### Formulaire de feedback (RECOMMANDÉ)

**Lien du formulaire :** [À AJOUTER QUAND LE FORMULAIRE SERA CRÉÉ]

- ⏱️ Durée : 5-10 minutes
- 🔒 Anonyme si vous le souhaitez
- 📊 Collecte structurée des retours

### Email

Si vous préférez un retour plus personnel ou détaillé :

**📧 labo@codexnumeris.org**

**Objet :** [Test Monitorage Beta 0.74] Vos retours

**Informations utiles à inclure :**
- Navigateur utilisé (ex: Chrome 118)
- Système d'exploitation (ex: macOS 14.1)
- Version testée (Beta 0.74)
- Mode de notation testé (SOM, PAN, ou les deux)
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
1. Ce que j'ai fait : Cliqué sur "Sauvegarder" après avoir saisi les présences
2. Ce que j'attendais : Message "Présences enregistrées"
3. Ce que j'ai obtenu : Message d'erreur "undefined"
4. Capture d'écran : bug-presences.png
```

---

## Problèmes connus

### Limitations actuelles

**Stockage local uniquement**
- Les données sont dans le navigateur (localStorage)
- Si vous effacez le cache, vous perdez vos données
- **Solution :** Exportez régulièrement en JSON

**Navigation privée**
- Les données sont perdues à la fermeture
- **Solution :** Utilisez en mode normal

**Pas de synchronisation**
- Pas de synchronisation entre appareils
- **Solution :** Exportez/importez le JSON

### Bugs connus (en cours de correction)

*(Cette section sera mise à jour selon les retours)*

Aucun bug majeur connu pour l'instant.

---

## FAQ

**Q : Puis-je utiliser mes vraies données d'étudiants ?**
R : Oui, mais faites attention à la confidentialité. Exportez régulièrement et ne partagez pas le fichier JSON.

**Q : Combien de temps faut-il pour configurer l'application ?**
R : Avec les données de démo : 2 minutes. Avec vos propres données : 10-15 minutes.

**Q : Les calculs des indices sont-ils fiables ?**
R : Oui, les formules sont basées sur des recherches publiées. Mais l'outil est en beta, donc validez avec vos propres observations.

**Q : Puis-je utiliser sur iPad ?**
R : Oui, Safari sur iPad fonctionne bien. L'interface s'adapte à l'écran.

**Q : Est-ce que je perds mes données si je ferme le navigateur ?**
R : Non, les données restent dans localStorage. Mais exportez régulièrement par sécurité.

**Q : Comment supprimer complètement mes données ?**
R : Réglages → Import/Export → "Effacer toutes les données"

**Q : Puis-je modifier le code de l'application ?**
R : Oui ! L'application est sous double licence (GPL v3 pour le code, CC BY-SA 4.0 pour le contenu). Voir LICENSE.md

**Q : Que signifient les indices A-C-P-R ?**
R : 
- **A = Assiduité** (présence en classe)
- **C = Complétion** (remise des travaux)
- **P = Performance** (qualité des productions)
- **R = Risque d'échec** (formule : 1 - A×C×P)

**Q : C'est quoi la différence entre SOM et PAN ?**
R :
- **SOM (Sommatif)** : Pratique traditionnelle (examens, travaux notés)
- **PAN (Portfolio Alternatif)** : Pratique alternative (sélection des N meilleurs artefacts)

**Q : Le mode comparatif, c'est pour quoi ?**
R : Pour comparer les deux pratiques (SOM vs PAN) avec les mêmes étudiants et voir les différences dans les prédictions de risque.

---

## Contact

**Développeur :** Grégoire Bédard
**Email :** labo@codexnumeris.org
**Site web :** https://codexnumeris.org

**Formulaire de feedback :** [À ajouter]

---

## Remerciements

Merci de contribuer à l'amélioration de cet outil !

Vos retours aideront non seulement à corriger les bugs, mais aussi à rendre l'application plus utile pour tous les enseignants qui l'utiliseront.

**L'objectif du monitorage pédagogique est de faire mentir les prédictions de risque par nos interventions proactives.**

Bons tests ! 🎓

---

**Fichier créé le :** 27 octobre 2025  
**Version du guide :** 1.0  
**Version de l'app testée :** Beta 0.74
