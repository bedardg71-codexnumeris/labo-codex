# Guide pour testeurs - Système de Monitorage Pédagogique Beta 90.5

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
- ✅ Calculer automatiquement des indices prédictifs (A-C-P-E : Assiduité, Complétion, Performance, Engagement)
- ✅ Comparer deux pratiques de notation (Sommative vs PAN-Maîtrise)
- ✅ Générer des recommandations d'intervention (RàI)

### Version testée

**Beta 90.5** (16 novembre 2025) - Fonctionnalités principales :
- **Architecture modulaire** : Système de pratiques de notation (Sommative, PAN-Maîtrise)
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
2. **Ouvrir** le fichier `index 90 (architecture).html`
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

## Scénarios de test

### 🟢 Test de base (15 minutes)

**Objectif :** Vérifier que les fonctions essentielles marchent.

**Scénario 1 : Navigation**
- [ ] Naviguer entre les sections principales
- [ ] Ouvrir 3-4 profils d'étudiants différents
- [ ] Utiliser Précédent/Suivant dans les profils
- [ ] Changer de mode (Normal/Anonymisation/Simulation)

**Scénario 2 : Visualisations**
- [ ] Observer les nuages de points dans le tableau de bord
- [ ] Survoler des points (animation et grossissement)
- [ ] Comparer les gradients de couleur (Patterns, RàI)
- [ ] Activer/désactiver le mode comparatif (Réglages → Pratique)

**Scénario 3 : Lecture des données**
- [ ] Comprendre l'indice A (Assiduité)
- [ ] Comprendre l'indice C (Complétion)
- [ ] Comprendre l'indice P (Performance)
- [ ] Comprendre l'indice E (Engagement = A × C × P)

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

**Scénario 9 : Mode comparatif**
- [ ] Activer le mode comparatif dans Réglages → Pratique de notation
- [ ] Créer des évaluations sommatives ET des artefacts portfolio
- [ ] Comparer les indices Sommative (orange) vs PAN-Maîtrise (bleu)
- [ ] Observer les différences de patterns et recommandations RàI

**Questions à vous poser :**
- L'outil vous aide-t-il vraiment à détecter les élèves à risque ?
- Les recommandations RàI sont-elles pertinentes ?
- Gagnez-vous du temps par rapport à vos méthodes actuelles ?
- Recommanderiez-vous l'outil à un collègue ?

---

## Comment faire vos retours

### Formulaire de feedback (RECOMMANDÉ)

**Lien du formulaire :** [https://forms.office.com/r/c2MBEzES32]

- ⏱️ Durée : 5-10 minutes
- 🔒 Anonyme si vous le souhaitez
- 📊 Collecte structurée des retours

### Email

Si vous préférez un retour plus personnel ou détaillé :

**📧 labo@codexnumeris.org**

**Objet :** [Test Monitorage Beta 90.5] Vos retours

**Informations utiles à inclure :**
- Navigateur utilisé (ex: Chrome 131, Safari 18)
- Système d'exploitation (ex: macOS 15.1, Windows 11)
- Version testée (Beta 90.5)
- Mode de notation testé (Sommative, PAN-Maîtrise, ou comparatif)
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
R : Oui ! L'application est sous double licence (AGPL v3 pour le code, CC BY-SA 4.0 pour le contenu). Voir LICENSE.md

**Q : Que signifient les indices A-C-P-E ?**
R :
- **A = Assiduité** (présence en classe)
- **C = Complétion** (remise des travaux)
- **P = Performance** (qualité des productions)
- **E = Engagement** (formule : A × C × P, remplace l'ancien "Risque")

**Q : Pourquoi "Engagement" au lieu de "Risque d'échec" ?**
R : Reformulation positive pour favoriser la motivation. Un engagement élevé (85%+) indique un bon engagement, un engagement faible (<65%) nécessite une intervention.

**Q : C'est quoi la différence entre Sommative et PAN-Maîtrise ?**
R :
- **Sommative** : Pratique traditionnelle (examens, travaux notés, moyenne pondérée)
- **PAN-Maîtrise** : Pratique alternative (sélection des N meilleurs artefacts, échelle IDME)

**Q : Le mode comparatif, c'est pour quoi ?**
R : Pour comparer les deux pratiques (Sommative vs PAN-Maîtrise) avec les mêmes étudiants et voir les différences dans les diagnostics et recommandations.

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
**Dernière mise à jour :** 16 novembre 2025
**Version du guide :** 2.0
**Version de l'app testée :** Beta 90.5
