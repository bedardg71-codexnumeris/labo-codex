# Monitorage Pédagogique

**Application web de suivi formative des apprentissages au collégial**

[![Licence](https://img.shields.io/badge/Licence-CC%20BY--NC--SA%204.0-blue.svg)](https://creativecommons.org/licenses/by-nc-sa/4.0/)
[![Version](https://img.shields.io/badge/Version-Beta%200.93-green.svg)]()
[![Statut](https://img.shields.io/badge/Statut-En%20développement-yellow.svg)]()

---

## 📖 À propos

**Monitorage Pédagogique** est une application web autonome (100% client-side) conçue pour faciliter le suivi formative des apprentissages au niveau collégial. Elle implémente une approche de monitorage pédagogique inspirée de la taxonomie SOLO et du modèle de Réponse à l'intervention (RàI).

### Caractéristiques principales

- **Autonome** : Fonctionne entièrement hors ligne, aucun serveur requis
- **Gratuit et libre** : Code source ouvert sous licence CC BY-NC-SA 4.0
- **Données locales** : Tout reste sur votre ordinateur (IndexedDB + localStorage)
- **Primo Assistant** : Guide conversationnel pour nouveaux utilisateurs
- **Multi-pratiques** : Support notation sommative et PAN (Pratique d'Approche par Niveau)
- **Export/Import CC** : Partage de matériel pédagogique avec Creative Commons

---

## 🎯 Fonctionnalités

### Suivi des apprentissages

- **Indices A-C-P** : Assiduité, Complétion, Performance
- **Patterns d'apprentissage** : Détection automatique des trajectoires (Stable, Défi spécifique, Blocage émergent, Blocage critique)
- **Niveaux RàI** : Recommandations d'intervention (Niveau 1 Universel, 2 Préventif, 3 Intensif)
- **Profils étudiants** : Vue détaillée individuelle avec diagnostic pédagogique

### Évaluation critériée

- **Grilles de critères** : Support critères personnalisés (ex: SRPNF pour littérature)
- **Échelles de performance** : IDME (Insuffisant, Développement, Maîtrisé, Étendu) basée sur taxonomie SOLO
- **Cartouches de rétroaction** : Commentaires prédéfinis pour accélérer la correction
- **Jetons pédagogiques** : Système de jetons (délai, reprise, aide, bonus)

### Gestion de groupe

- **Import étudiants** : TSV/CSV, copier-coller, saisie manuelle
- **Présences** : Saisie rapide avec calcul automatique indices d'assiduité
- **Interventions RàI** : Planification et suivi des interventions préventives/intensives
- **Anonymisation** : Mode anonymisé pour projections en classe

### Partage et collaboration

- **Export/Import CC** : Métadonnées Creative Commons intégrées
- **Configuration complète** : Export bundle (échelles + grilles + cartouches + productions)
- **Matériel de démarrage** : Échelle IDME + Grille SRPNF + cartouches incluses

---

## 🚀 Installation et utilisation

### Prérequis

- Navigateur web moderne (Chrome, Firefox, Safari, Edge)
- Aucune connexion internet requise après téléchargement

### Option 1 : Téléchargement simple

1. Téléchargez la dernière version : [Releases](https://github.com/bedardg71-codexnumeris/Monitorage_v6/releases)
2. Décompressez le fichier ZIP
3. Ouvrez `index 93.html` dans votre navigateur

### Option 2 : Clone Git

```bash
git clone https://github.com/bedardg71-codexnumeris/Monitorage_v6.git
cd Monitorage_v6
open "index 93.html"  # macOS
# ou
start "index 93.html"  # Windows
# ou
xdg-open "index 93.html"  # Linux
```

### Serveur HTTP local (recommandé pour développement)

```bash
# Python 3
python -m http.server 8000

# Puis ouvrir : http://localhost:8000/index%2093.html
```

---

## 📚 Documentation

### Guides utilisateurs

- **[Section Aide intégrée](index%2093.html#aide)** : Documentation complète dans l'application
- **[NOUVEAUTES_BETA_92.txt](NOUVEAUTES_BETA_92.txt)** : Notes de version Beta 92 (Primo)
- **[BETA_92_CHANGELOG.md](BETA_92_CHANGELOG.md)** : Changelog technique Beta 92
- **[BETA_93_CHANGELOG.md](BETA_93_CHANGELOG.md)** : Changelog technique Beta 93
- **[PLAN_TESTS_BETA_92.md](PLAN_TESTS_BETA_92.md)** : Plan de tests systématique

### Documentation technique

- **[CLAUDE.md](CLAUDE.md)** : Documentation développeur complète
- **[ARCHITECTURE_PRATIQUES.md](ARCHITECTURE_PRATIQUES.md)** : Architecture système de pratiques
- **[INDEXEDDB_ARCHITECTURE.md](INDEXEDDB_ARCHITECTURE.md)** : Architecture stockage hybride
- **[GUIDE_AJOUT_PRATIQUE.md](GUIDE_AJOUT_PRATIQUE.md)** : Guide pour créer une nouvelle pratique

### Publications académiques

- **Bédard, G. (2024)**. « Observer pour mieux accompagner ». *Pédagogie collégiale*, vol. 37, n° 3, printemps-été 2024. En ligne : https://eduq.info/xmlui/bitstream/handle/11515/39749/Bedard-38-2-25.pdf?sequence=2&isAllowed=y


---

## 🛠️ Architecture technique

### Stack technologique

- **Frontend** : HTML5 / CSS3 / JavaScript ES6+ pur (vanilla JS)
- **Stockage** : IndexedDB (stockage principal) + localStorage (cache synchrone)
- **Capacité** : Plusieurs GB (vs 5-10 MB avec localStorage seul)
- **Aucune dépendance externe** : Pas de framework, pas de npm, pas de build
- **Compatibilité** : Navigateurs modernes (Safari, Chrome, Firefox, Edge)

### Principe architectural

**Single Source of Truth** : Chaque donnée a UNE source unique qui la génère et la stocke. Les autres modules la lisent via localStorage, jamais de duplication de logique.

**Modules principaux** :
- `js/primo-accueil.js` : Assistant de démarrage Primo
- `js/pratiques/` : Système modulaire de pratiques de notation
- `js/db.js` : Gestionnaire de stockage hybride IndexedDB
- `js/cc-license.js` : Gestion métadonnées Creative Commons
- `js/profil-etudiant.js` : Diagnostic pédagogique individuel
- `js/tableau-bord-apercu.js` : Vue d'ensemble du groupe

**Voir [CLAUDE.md](CLAUDE.md) pour documentation complète.**

---

## 🎓 Contexte pédagogique

### Monitorage pédagogique

Le **monitorage pédagogique** est une approche de suivi formative qui vise à détecter précocement les difficultés d'apprentissage et à intervenir de manière proactive. Il repose sur trois indices complémentaires :

1. **Assiduité (A)** : Mesure l'engagement cognitif par la présence en classe
2. **Complétion (C)** : Mesure la mobilisation par la remise des travaux
3. **Performance (P)** : Mesure la maîtrise par la qualité des productions

L'application calcule également un indice dérivé :
- **Engagement (E)** : Moyenne géométrique des trois indices (E = ∛(A × C × P))

### Réponse à l'intervention (RàI)

Le modèle RàI à trois niveaux permet d'adapter l'intensité du soutien :

- **Niveau 1 (Universel)** : Enseignement standard pour étudiants stables
- **Niveau 2 (Préventif)** : Interventions ciblées pour défis spécifiques
- **Niveau 3 (Intensif)** : Soutien individuel pour situations critiques

### Taxonomie SOLO

L'échelle IDME s'appuie sur la taxonomie SOLO (Structure of the Observed Learning Outcome) :

| Niveau SOLO | Code IDME | Pourcentage | Compréhension |
|-------------|-----------|-------------|---------------|
| Préstructurel | **I**nsuffisant | < 64% | Incompréhension |
| Unistructurel | **I**nsuffisant | < 64% | Superficielle |
| Multistructurel | **D**éveloppement | 65-74% | Points pertinents sans liens |
| Relationnel | **M**aîtrisé | 75-84% | Compréhension globale avec liens |
| Abstrait étendu | **É**tendu | ≥ 85% | Transfert à autres contextes |

---

## 🤝 Contribution

Les contributions sont bienvenues ! Voici comment participer :

### Signaler un bug

Créez une [issue](https://github.com/bedardg71-codexnumeris/Monitorage_v6/issues) en décrivant :
- Le comportement attendu
- Le comportement observé
- Les étapes pour reproduire
- Des captures d'écran si pertinent

### Proposer une amélioration

Créez une [issue](https://github.com/bedardg71-codexnumeris/Monitorage_v6/issues) avec le tag `enhancement` en expliquant :
- Le besoin pédagogique
- La fonctionnalité proposée
- Des exemples d'utilisation

### Contribuer du code

1. Fork le repository
2. Créez une branche : `git checkout -b feature/ma-fonctionnalite`
3. Committez : `git commit -m "Ajout de ma fonctionnalité"`
4. Push : `git push origin feature/ma-fonctionnalite`
5. Créez une Pull Request

**Important** : Lisez [CLAUDE.md](CLAUDE.md) pour comprendre l'architecture avant de contribuer.

---

## 📄 Licence

Ce projet est distribué sous licence **Creative Commons Attribution - Pas d'Utilisation Commerciale - Partage dans les Mêmes Conditions 4.0 International** (CC BY-NC-SA 4.0).

[![CC BY-NC-SA 4.0](https://licensebuttons.net/l/by-nc-sa/4.0/88x31.png)](https://creativecommons.org/licenses/by-nc-sa/4.0/)

**Vous êtes autorisé à :**
- ✅ Partager — copier, distribuer et communiquer le matériel
- ✅ Adapter — remixer, transformer et créer à partir du matériel

**Selon les conditions suivantes :**
- **Attribution** — Vous devez créditer l'auteur original (Grégoire Bédard)
- **Pas d'Utilisation Commerciale** — Usage éducatif uniquement
- **Partage dans les Mêmes Conditions** — Les adaptations doivent être partagées sous la même licence

---

## 👤 Auteur

**Grégoire Bédard**
Enseignant en littérature, Cégep de Drummondville
Labo Codex : le laboratoire de codexnumeris.org

- 🌐 Site web : [https://codexnumeris.org](https://codexnumeris.org)
- 📧 Courriel : [labo@codexnumeris.org](mailto:labo@codexnumeris.org)
- 🐙 GitHub : [@bedardg71-codexnumeris](https://github.com/bedardg71-codexnumeris)

---

## 🙏 Remerciements

- **Anthropic** : Pour Claude Code, assistant de développement utilisé tout au long du projet
- **Communauté AQPC** : Pour les échanges et le soutien lors des présentations
- **Étudiants testeurs** : Pour leurs retours et suggestions d'améliorations
- **Collègues du Cégep de Drummondville** : Pour leur intérêt et leurs encouragements

---

## 📊 Statistiques du projet

- **Lignes de code** : ~50,000 lignes (HTML + CSS + JavaScript)
- **Modules JavaScript** : 54 fichiers
- **Période de développement** : Septembre 2024 - Décembre 2025
- **Versions Beta** : 93 versions (Beta 0.01 → Beta 0.93)
- **Sessions de développement** : ~100 sessions avec Claude Code

---

## 🔗 Liens utiles

- **Repository GitHub** : [https://github.com/bedardg71-codexnumeris/Monitorage_v6](https://github.com/bedardg71-codexnumeris/Monitorage_v6)
- **Site Codex Numeris** : [https://codexnumeris.org](https://codexnumeris.org)
- **Articles Pédagogie collégiale** : [https://aqpc.qc.ca/revue](https://aqpc.qc.ca/revue)
- **Guide de monitorage** : Disponible sur le site Codex Numeris

---

## ⚠️ Avertissement

Cette application est en développement actif (Beta). Elle est fonctionnelle et utilisée en classe, mais peut contenir des bugs. Effectuez des exports réguliers de vos données via **Réglages → Gestion des données → Exporter toutes les données**.

---

**Version actuelle** : Beta 0.93 (2 décembre 2025)
**Dernière mise à jour README** : 2 décembre 2025
