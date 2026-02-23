# Beta 97.8 — 17 février 2026

---

## Ce que l'application te permet de faire

Concrètement, tu bénéficies d'une gestion facile des présences et de la mobilisation en classe, d'un suivi des remises de productions, d'une analyse détaillée des performances et d'un système de gestion de la notation.

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

## Nouveau : Alignement pédagogique (Beta 97.8)

L'application repose désormais sur le cadre théorique d'Anderson & Krathwohl (2001) pour structurer la planification de cours. La **carte mentale** intègre :

- **4 types de connaissances** : Factuelle, Conceptuelle, Procédurale et Métacognitive, chacun avec une couleur distinctive
- **Banque de verbes cognitifs** : 6 niveaux taxonomiques (Mémoriser → Créer) avec 10 verbes chacun. Un clic sur un verbe l'insère directement dans le titre du nœud
- **Badges cognitifs** : Indicateur discret sur chaque nœud de la carte, affichant le niveau taxonomique associé
- **Migration automatique** : Les cartes existantes sont converties silencieusement vers les nouveaux types d'Anderson

Tu peux facilement créer et gérer tes :

- Productions étudiantes avec objectifs, tâches et pondérations
- Grilles de critères détaillées
- Échelles de performance
- Cartouches de rétroaction (commentaires pré-écrits par critère/niveau)
- Pratiques de notation

L'application te permet de faire des exports en format PDF pour utilisation papier en classe.

---

## Nouveau : Systèmes d'assistance intégrés (Beta 97.7–97.8)

L'application propose un ensemble de mécanismes d'aide qui s'adaptent à ton niveau de familiarité :

### Parcours d'apprentissage

Au premier lancement, tu choisis ton mode d'apprentissage :
- 🗺️ **Étape par étape** (enseignement explicite) : guidage séquentiel, suggestions proactives, tutoriels interactifs
- 🧭 **Par exploration** (apprentissage par découverte) : rappels discrets, pulse visuel à chaque jalon complété

**12 jalons en 4 chapitres** (Configurer, Construire, Planifier, Enseigner) détectés automatiquement. Un panneau de parcours sur la page d'accueil montre ta progression avec barre visuelle et jalons cliquables. Quand les chapitres essentiels sont complétés, une certification d'autonomie 🎓 confirme que tu maîtrises les bases.

### Données de démonstration

Active les données de démonstration pour explorer l'application avec un cours fictif pré-rempli (étudiants, présences, évaluations). Tu peux les désactiver à tout moment pour retrouver tes vraies données.

### Tour guidé

Un assistant de création de matériel pédagogique te guide à travers 21 questions adaptatives pour créer tes productions, grilles, échelles et cartouches. Le parcours s'adapte automatiquement à ta pratique de notation (sommative, PAN-Standards, PAN-Spécifications).

### Info-bulles et aide contextuelle

- 💬 **Info-bulles** : Explications courtes au survol des éléments de l'interface
- 📍 **Aide contextuelle** : Boutons d'aide dans chaque section, avec contenus détaillés et liens « Voir aussi »
- 📌 **Conseils pédagogiques** : Encadrés dans les formulaires pour guider les choix de construction

Tu peux activer ou désactiver chaque mécanisme individuellement dans **Réglages → Préférences**.

---

## Nouveau : Configuration intelligente de la pratique (Beta 97.7)

Le wizard de configuration ne te demande plus de te classer dans une taxonomie académique. Il pose des **questions concrètes sur ta façon de noter** :

1. Comment calcules-tu la note finale ?
2. Utilises-tu des règles spéciales ? (remplacement, verrou, portfolio, plafonnement)
3. Comment structures-tu tes évaluations ?
4. Combien d'évaluations prévois-tu ?
5. Quels sont tes seuils personnels ?

L'application **déduit automatiquement** ton type de pratique (sommative, PAN-Standards ou PAN-Spécifications) avec sa variante et ses règles. Le diagnostic est présenté dans un récapitulatif avec explication pédagogique vulgarisée.

---

## Module Travaux (Beta 97–97.8)

Gère les travaux étudiants directement dans l'application grâce à l'onglet **Travaux** :

- **Import de fichiers** : Glisse tes PDF et images dans la zone de dépôt. Détection automatique du DA étudiant dans le nom du fichier. Association manuelle possible via dropdown.
- **Visionneuse intégrée** : Ouvre tes PDF et images directement dans l'application. Navigation entre les pages, zoom avant/arrière, ajustement automatique à la fenêtre.
- **Annotation au stylet** : Annote directement sur les travaux avec le stylo, le surligneur, la gomme, des formes (cercle, flèche, rectangle) et des symboles (crochet, croix). Support Apple Pencil avec sensibilité à la pression et rejet de la paume.
- **Autocollants de rétroaction** : Appose des autocollants visuels pré-configurés sur les copies pour signaler rapidement les points forts, les erreurs récurrentes ou les pistes d'amélioration — avant même d'évaluer.
- **Annuler/Rétablir** : Ctrl+Z / Ctrl+Maj+Z pour annuler ou rétablir tes annotations (jusqu'à 50 niveaux). Sauvegarde automatique.
- **Voir le travail depuis Évaluations** : Bouton « Voir le travail » dans la page d'évaluation pour afficher le document côte à côte avec la grille de critères.
- **Travaux dans le Profil étudiant** : Section « Travaux soumis » avec grille de miniatures et export ZIP par étudiant.
- **Archivage ZIP** : Exporte les travaux par étudiant, par production ou pour le semestre complet. Inclut les versions annotées.
- **Stockage sur disque (Mac)** : Option File System Access API pour stocker les fichiers sur ton disque au lieu d'IndexedDB. Recommandé sur Mac pour les gros volumes.
- **Panneau état zéro** : Quand aucun fichier n'est importé, un guide en 3 étapes explique comment démarrer l'annotation.

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

Cette application de suivi des apprentissages et de construction de la note est développée par Grégoire Bédard, enseignant en littérature au Cégep de Drummondville.

L'application est gratuite, libre et ouverte. Elle est distribuée sous licence Creative Commons BY-NC-SA 4.0 et son code source est disponible en open-source.

---

## Informations et licences

|                             |                                    |
|-----------------------------|------------------------------------|
| **Version**                 | Beta 97.8 (17 février 2026)        |
| **Auteur**                  | Grégoire Bédard                    |
| **Codé avec**               | Claude Code (Anthropic)            |
| **Code source**             | AGPL v3.0                          |
| **Contenu pédagogique**     | CC BY-NC-SA 4.0                    |

---
