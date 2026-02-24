# Beta 98 — 24 février 2026

---

## Ce que l'application te permet de faire

L'application numérise le flux complet de ton travail d'enseignant : **planifier** tes cours et tes leçons, **construire** ton matériel pédagogique (productions, grilles, échelles, cartouches), **enseigner** avec un suivi des présences et de la mobilisation, **évaluer** les travaux de tes étudiants (importer, annoter, noter) et **suivre** leur progression dans le temps. Chaque interaction — une présence cochée, un critère ajusté, une annotation posée — capture une microdonnée qui s'accumule avec les autres pour éclairer ton jugement professionnel.

Grâce à la persistance des critères d'une production à l'autre, l'application :

- Détecte les patterns d'apprentissage (difficultés récurrentes sur critères précis)
- Visualise les progrès réels masqués par les moyennes
- Propose des niveaux d'intervention RàI (soutien universel, ciblé ou intensif)
- Affiche la structure des résultats selon la taxonomie SOLO

Ton jugement professionnel reste souverain – les données l'éclairent, ne le remplacent pas.

L'application permet également de :

- Gérer différentes constructions de la note, que ce soit la pratique sommative traditionnelle ou une pratique de notation alternative (basée sur des standards ou par spécifications)
- Gérer un dossier d'apprentissage de type « portfolio » (comme dans l'approche ELLAC)
- Gérer un système de jetons de reprises et de délai
- Archiver des évaluations et faire un suivi longitudinal de tes données

---

## Alignement pédagogique

L'application repose sur le cadre théorique d'Anderson & Krathwohl (2001) pour structurer la planification de cours. La **carte mentale** intègre :

- **4 types de connaissances** : Factuelle, Conceptuelle, Procédurale et Métacognitive, chacun avec une couleur distinctive
- **Banque de verbes cognitifs** : 6 niveaux taxonomiques (Mémoriser → Créer) avec 10 verbes chacun. Un clic sur un verbe l'insère directement dans le titre du nœud
- **Badges cognitifs** : Indicateur discret sur chaque nœud de la carte, affichant le niveau taxonomique associé
- **Migration automatique** : Les cartes existantes sont converties silencieusement vers les nouveaux types d'Anderson
- **Guide de construction de carte** : 7 pages accessibles via le bouton « ? », pour t'accompagner dans la création de ta carte mentale

Tu peux facilement créer et gérer tes :

- Productions étudiantes avec objectifs, tâches et pondérations
- Grilles de critères détaillées
- Échelles de performance
- Cartouches de rétroaction (commentaires pré-écrits par critère/niveau)
- Pratiques de notation

### Organisateur de leçon

L'organisateur de leçon te permet de planifier chaque séance selon les 5 temps de l'enseignement explicite :

1. **Ouverture** — Activation des connaissances antérieures et présentation de l'objectif
2. **Modélisation** — Démonstration explicite de la démarche attendue
3. **Pratique guidée** — Les étudiants s'exercent avec ton accompagnement
4. **Pratique autonome** — Les étudiants travaillent de façon indépendante
5. **Clôture** — Synthèse et vérification des apprentissages

Tu peux glisser-déposer les activités entre les étapes, ajouter des notes enseignant pour chaque temps et organiser tes séances dans un calendrier intégré.

L'application te permet de faire des exports en format PDF pour utilisation papier en classe.

---

## Configuration intelligente de la pratique

Le wizard de configuration ne te demande plus de te classer dans une taxonomie académique. Il pose des **questions concrètes sur ta façon de noter** :

1. Comment calcules-tu la note finale ?
2. Utilises-tu des règles spéciales ? (remplacement, verrou, portfolio, plafonnement)
3. Comment structures-tu tes évaluations ?
4. Combien d'évaluations prévois-tu ?
5. Quels sont tes seuils personnels ?

L'application **déduit automatiquement** ton type de pratique (sommative, PAN-Standards ou PAN-Spécifications) avec sa variante et ses règles. Le diagnostic est présenté dans un récapitulatif avec explication pédagogique vulgarisée.

---

## Évaluer les travaux

L'onglet **Évaluations** regroupe trois sous-sections qui couvrent le cycle complet du traitement des copies : préparer les documents, les annoter et les évaluer, puis les archiver. Quand aucun fichier n'est encore importé, un panneau état zéro en 3 étapes te guide pour démarrer. Les travaux soumis apparaissent aussi dans le profil de chaque étudiant.

### Préparer et importer

Glisse tes PDF et images dans la zone de dépôt. Le pipeline d'import fonctionne en 2 étapes :

- **Identification automatique** : En mode LEA, l'application détecte le DA, la production et la date directement dans le nom du fichier
- **Mode nommage libre** : Pour les fichiers sans convention, tu nommes manuellement
- **Détection de doublons** : L'application signale les fichiers déjà importés pour éviter les copies en double

Avant d'annoter, tu peux préparer tes documents numérisés :

- **Détection automatique des coins** : L'application repère les 4 coins du document (Canny + Hough) et propose une correction de perspective. Poignées extensibles pour ajuster manuellement
- **Ajustement d'exposition** : Courbe EV pour éclaircir ou assombrir le document
- **Balance des blancs** : Corrige les teintes indésirables dues à l'éclairage
- **Aperçu en temps réel** : Chaque réglage s'affiche instantanément
- **Format 11×17** : Support du format légal pour les documents grand format

### Annoter et évaluer

- **Visionneuse intégrée** : Ouvre tes PDF et images directement dans l'application. Navigation entre les pages, zoom avant/arrière, ajustement automatique à la fenêtre
- **Annotation au stylet** : Annote directement sur les copies avec le stylo, le surligneur, la gomme, des formes (cercle, flèche, rectangle) et des symboles (crochet, croix). Support Apple Pencil avec sensibilité à la pression et rejet de la paume
- **Autocollants de rétroaction** : Appose des autocollants visuels pré-configurés pour signaler rapidement les points forts, les erreurs récurrentes ou les pistes d'amélioration — avant même d'évaluer
- **Tampons rapides** : ✓ ✗ ! → pour marquer les copies d'un geste
- **Palettes flottantes déplaçables** : Palette d'annotation (outils de dessin), palette de tampons et palette d'évaluation (rétroaction en temps réel avec accès direct à la grille de critères). Séparateurs déplaçables entre les panneaux pour adapter l'espace de travail
- **Grille de critères côte à côte** : Affiche le document et la grille d'évaluation simultanément
- **Annuler/Rétablir** : Ctrl+Z / Ctrl+Maj+Z pour annuler ou rétablir tes annotations (jusqu'à 50 niveaux). Sauvegarde automatique
- **Badges de statut** : Chaque copie affiche une pilule dynamique — Importé → Annoté → Évalué — avec code de couleur. Filtre et trie les copies selon leur avancement
- **Verrouillage** : Les copies évaluées sont verrouillées pour éviter les modifications accidentelles

### Exporter et archiver

- **Archivage ZIP** : Exporte les travaux par étudiant, par production ou pour le semestre complet. Inclut les versions annotées
- **Stockage sur disque** : Option File System Access API pour stocker les fichiers sur ton disque au lieu d'IndexedDB. Recommandé sur Mac pour les gros volumes

---

## Nouveau : Accompagnement intégré

L'application t'accompagne de la découverte à la maîtrise, à ton rythme. Un ensemble de mécanismes d'aide s'adaptent à ton niveau de familiarité — chacun activable ou désactivable dans **Réglages → Préférences**.

### Parcours d'apprentissage

Au premier lancement, tu choisis ton mode d'apprentissage :
- 🗺️ **Étape par étape** (enseignement explicite) : guidage séquentiel, suggestions proactives, tutoriels interactifs
- 🧭 **Par exploration** (apprentissage par découverte) : rappels discrets, pulse visuel à chaque jalon complété

**12 jalons en 4 chapitres** (Configurer, Construire, Planifier, Enseigner) détectés automatiquement. Un panneau de parcours sur la page d'accueil montre ta progression avec barre visuelle et jalons cliquables. Quand les chapitres essentiels sont complétés, une certification d'autonomie 🎓 confirme que tu maîtrises les bases.

### Données de démonstration

Active les données de démonstration pour explorer l'application avec un cours fictif pré-rempli :

- **20 étudiants** fictifs avec profils variés
- **11 productions** couvrant différents types d'évaluations
- **200+ évaluations** illustrant la notation et les rétroactions
- **42 dates de présences** avec différents patterns de mobilisation

Tu peux entrer et sortir du mode démonstration à tout moment. Tes vraies données restent isolées et intactes. Un bandeau vert t'indique clairement que tu navigues dans les données fictives.

### Guidage contextuel

En mode démonstration, des encarts explicatifs apparaissent automatiquement dans chaque sous-section pour te montrer comment interpréter les données et utiliser les fonctionnalités en contexte réel.

### Tour guidé

Un assistant de création de matériel pédagogique te guide à travers 21 questions adaptatives pour créer tes productions, grilles, échelles et cartouches. Le parcours s'adapte automatiquement — il détecte ta pratique de notation (sommative, PAN-Standards, PAN-Spécifications) et ajuste les questions en conséquence.

### Aide intégrée complète

64 accordéons documentant chaque fonctionnalité de l'application, accessibles depuis le menu. Chaque entrée explique le quoi, le pourquoi et le comment, avec des liens « Voir aussi » vers les sections connexes.

### 248 info-bulles

Chaque élément de l'interface possède une description au survol. Ces info-bulles courtes t'expliquent à quoi sert un bouton, un champ ou une option sans quitter ton contexte de travail.

### Conseils pédagogiques

Des encadrés dans les formulaires te guident dans tes choix de construction : pourquoi choisir tel type de critère, comment formuler une rétroaction efficace, quand privilégier telle approche de notation.

### Page d'accueil permanente

La page d'accueil s'adapte à ton parcours :

- **Premier lancement** : Présentation de l'application et choix du mode d'apprentissage
- **Retour** : Cartes organisées par intention (continuer ton travail, explorer une fonctionnalité, consulter tes données) avec accès direct aux sections pertinentes

---

## Tes données restent les tiennes

- **100% hors ligne** – Fonctionne sans connexion Internet, une fois téléchargée
- **Données locales** – Confidentialité totale, aucun serveur externe
- **Sécurisation renforcée** – Validation des imports (schémas whitelist, limite 10 Mo), échappement anti-XSS, exports marqués CONFIDENTIEL, noms d'étudiants retirés des snapshots exportés
- **Gratuite et open-source** – Zéro coût
- **Prête à l'emploi** – Ouvrir dans ton navigateur, c'est tout !
- **+50 000 lignes de code** – Application stable et fonctionnelle
- **Développée par un enseignant d'ici**

**Important** : Exporte régulièrement tes données via **Réglages → Gestion des données → Exporter**. Si tu effaces l'historique de navigation ou changes de navigateur, tu pourras tout restaurer.

---

## Partage et communs éducatifs

Tu peux gérer ton contenu avec tes collègues grâce à :

- Bibliothèques de ressources partagées sous licence Creative Commons BY-NC-SA 4.0
- Métadonnées de création et de contribution automatiquement mises à jour

Plutôt que de toujours recommencer à zéro, tu peux t'appuyer sur le travail de tes pairs, l'adapter à ton contexte, puis le redistribuer à ton tour.

---

## Pour commencer

### 1. Demande ton accès
Rends-toi à l'adresse suivante : https://app.codex-numeris.org
Entre ton adresse et reçois le code d'accès.

### 2. Lance l'application
Au premier démarrage, l'application te propose de choisir ton parcours d'apprentissage :
- 🗺️ **Étape par étape** : un guidage séquentiel te mène à travers chaque fonctionnalité
- 🧭 **Par exploration** : tu découvres à ton rythme, avec des rappels discrets

Ensuite :
- Crée ton cours : code, titre, trimestre
- Importe tes étudiants : copie-colle depuis Omnivox ou Excel
- Configure ta pratique : réponds à quelques questions sur ta façon de noter, l'application déduit le reste

Tu peux changer de mode à tout moment dans **Réglages → Préférences**.

---

## Besoin d'aide ?

- **Section Aide** : accessible depuis le menu de l'application, avec aide contextuelle 📍 dans chaque section
- **Courriel** : labo@codexnumeris.org
- **Site web** : https://codexnumeris.org

---

## À propos du projet

Cette application numérise le flux complet du travail enseignant — de la planification au suivi des apprentissages. Elle est développée par Grégoire Bédard, enseignant en littérature au Cégep de Drummondville.

L'application est gratuite, libre et ouverte. Elle est distribuée sous licence Creative Commons BY-NC-SA 4.0 et son code source est disponible en open-source.

---

## Informations et licences

|                             |                                    |
|-----------------------------|------------------------------------|
| **Version**                 | Beta 98 (24 février 2026)          |
| **Auteur**                  | Grégoire Bédard                    |
| **Codé avec**               | Claude Code (Anthropic)            |
| **Code source**             | AGPL v3.0                          |
| **Contenu pédagogique**     | CC BY-NC-SA 4.0                    |

---
