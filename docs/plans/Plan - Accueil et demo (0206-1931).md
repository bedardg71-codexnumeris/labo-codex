# Plan de travail — Page d'accueil, démo et Primo

## Contexte

L'application souffre d'un problème de premier contact : les nouveaux utilisateurs voient immédiatement l'interface complète (six onglets, tableau de bord vide, indicateurs sans données) et ne savent pas par où commencer. Le système de démonstration actuel, implémenté trois fois en parallèle, est inutilisable (voir rapport d'audit du 6 février 2026). Des testeurs ont été perdus en décembre 2025 faute de guidage.

**Objectif** : Créer une expérience d'entrée claire, simple et accueillante qui donne envie d'explorer et de comprendre avant de configurer.

**Échéance** : Colloque AQPC — **Mercredi 3 juin 2026, 13h45** (atelier de 60 minutes).

---

## Principes directeurs

1. **La page d'accueil est permanente.** Ce n'est pas un écran de bienvenue qui disparaît — c'est le foyer de l'application, à chaque visite. Un réglage «Mode expert» permet de revenir au tableau de bord direct pour les utilisateurs avancés.

2. **La démo est un monde parallèle.** Espace séparé, données autonomes sous un namespace `demo_` dans IndexedDB, aucune contamination avec les données réelles. Pas de filtrage par mode. Nettoyage automatique à la sortie.

3. **Le guidage est intégré, pas optionnel.** Dans la démo v1 (MVP AQPC), des encarts textuels statiques expliquent ce que l'utilisateur voit à chaque section. Post-AQPC, Primo deviendra un narrateur interactif qui structure le parcours et accompagne la configuration.

4. **Observer d'abord, agir ensuite.** La démo est principalement en lecture, avec des micro-interactions ciblées pour sentir l'outil.

---

## Chantier 1 : Démantèlement du système de démo actuel

### Pourquoi c'est le préalable

Tant que le code contient deux systèmes de chargement, deux packs de données, cinq chemins d'activation et dix bugs, toute construction nouvelle sera fragile. Il faut nettoyer avant de reconstruire.

### Actions

- Supprimer `pack-demarrage-complet.json`
- Supprimer le Système 2 dans `trimestre.js` (`basculerDonneesDemo()` et code associé)
- Supprimer la délégation dans `trimestre-v2.js`
- Supprimer les checkboxes démo dans `index.html` (V1 ligne 6932, V2 ligne 10819)
- Supprimer les fonctions no-op : `filtrerEtudiantsDemo()`, `filtrerCoursDemo()`
- Supprimer les appels morts dans `etudiants.js` et `cours.js`
- Supprimer `filtrerEtudiantsParMode()` dans `groupe.js` (doublon conflictuel)
- Supprimer ou archiver `genererPresencesDemo()` dans `trimestre.js`
- Désactiver le chemin Primo `importerDonneesDemo` (références cassées)
- Conserver `donnees-demo.js` et `pack-demarrage.js` comme base temporaire pendant la reconstruction

### Résultat attendu

Code nettoyé, un seul pack de données (`pack-demarrage.js`), aucun chemin d'activation de l'ancien système. Le terrain est dégagé.

### Fichiers concernés

Voir section 8 du rapport d'audit pour la liste détaillée des 9 fichiers et les numéros de ligne.

---

## Chantier 2 : Nouveau système de démo (monde parallèle)

### Architecture

La démo vit dans un **espace isolé via un namespace `demo_` dans IndexedDB** :
- Les données démo sont écrites dans IndexedDB sous un trimestre `"demo"` avec un préfixe `demo_`, ce qui permet de réutiliser `obtenirDonneesSelonMode()` et toute l'infrastructure existante sans modification
- Tous les modules existants (tableau de bord, présences, évaluations, profil étudiant, travaux, construction de la note) fonctionnent dans la démo **sans modification** grâce à cette approche
- À la sortie de la démo, `dechargerDonneesDemo()` nettoie toutes les données sous le namespace `demo_` — rien ne persiste
- Au démarrage, si le mode n'est plus démo, un nettoyage de sécurité supprime les éventuels résidus (3 lignes de code)
- Les données réelles de l'utilisateur ne sont jamais accessibles depuis la démo (namespaces différents)
- Pas de «mode» à basculer — la démo est une route séparée dans l'application

**Pourquoi IndexedDB et pas la mémoire seule** : `obtenirDonneesSelonMode()` (modes.js, ligne 521) est appelée par tous les modules via IndexedDB. Contourner cette fonction pour une approche «mémoire seule» exigerait une refonte de `modes.js` + `db.js` (~1400 lignes combinées) avec un risque de régression sur toute l'application. Le namespace dédié réduit l'effort d'environ 50%.

### Dataset : anonymisation des données réelles (A25)

Le dataset démo est construit à partir des **données réelles du trimestre d'automne 2025**, anonymisées par un script Node.js. L'avantage : les indicateurs ACPE, les patterns et les niveaux RàI reflètent une réalité pédagogique vécue, pas un modèle théorique. Aucune donnée inventée.

**Protocole d'anonymisation (5 couches)** :

1. **Identité complète** — Remplacement irréversible de tous les champs identifiants :
   - Noms → noms fictifs tirés d'un dictionnaire prédéfini (pas de translittération ni d'anagramme)
   - Prénoms → prénoms fictifs (mélange de genres, origines variées)
   - Numéros DA → DA fictifs au format valide (7 chiffres) mais inexistants
   - Toute autre métadonnée nominative (courriels, identifiants Omnivox) → supprimée

2. **Micro-perturbation temporelle** — Les dates de présences et de remise sont décalées de ±1-2 jours aléatoires. Ceci empêche la corrélation avec un calendrier réel tout en conservant la progression hebdomadaire. Les semaines de cours restent 1 à 15 en séquence.

3. **Bruit contrôlé sur les notes** — Les résultats individuels par critère sont perturbés de ±3-5% (arrondi au demi-échelon le plus proche). Assez pour empêcher la réidentification par corrélation exacte des notes, trop peu pour changer le profil ACPE d'un étudiant ou son pattern.

4. **Mélange de l'ordre** — L'ordre des étudiants dans la liste est aléatoire (pas l'ordre alphabétique original). Les numéros DA fictifs ne suivent aucune séquence prévisible.

5. **Recalcul des indicateurs** — Après perturbation, les indicateurs ACPE, les patterns et les niveaux RàI sont **recalculés** à partir des données perturbées (pas conservés de l'original). Ceci garantit la cohérence interne du dataset anonymisé.

**Garanties** :
- Le script ne conserve aucune table de correspondance (pas de fichier de mapping original → anonyme)
- Le processus est à sens unique : on ne peut pas retrouver l'étudiant original à partir des données anonymisées
- Le fichier source (export réel) est utilisé une seule fois par le script, puis n'est pas inclus dans le dépôt
- Le fichier produit (`pack-demo-25.js`) ne contient que des données anonymisées — c'est le seul fichier livré

**Vérification avant livraison** : Grégoire valide visuellement le dataset anonymisé dans l'application (le tableau de bord «sonne-t-il vrai» ?) avant de l'intégrer comme pack démo officiel.

### Contenu de la démo

**Scénario «Vue d'ensemble» (parcours principal — MVP AQPC)** :
- Un cours 601-101-MQ avec ~25 étudiants (données réelles A25 anonymisées par le script ci-dessus)
- 15 semaines de données complètes (présences, évaluations, productions)
- Indicateurs ACPE calculés et visibles
- Patterns d'apprentissage et niveaux RàI visibles
- L'utilisateur explore le tableau de bord, scrolle entre Observer et Intervenir
- Encarts textuels contextuels expliquant ce qu'on voit à chaque section

**Scénarios post-AQPC** (explicitement hors du MVP) :

Les scénarios suivants ne seront développés qu'**après** le colloque AQPC, une fois la démo Vue d'ensemble et la page d'accueil stabilisées :

- **Scénario «Corriger un travail»** (module Travaux) : PDF pré-chargé, annotation, autocollants, évaluation avec cartouches
- **Scénario «Évaluer une production»** : grille de critères, échelle de performance, cartouches en temps réel
- **Scénario «Prendre les présences»** : liste d'étudiants, geste de prise de présences, lien avec indicateurs ACPE

### Micro-interactions permises (MVP AQPC — scénario Vue d'ensemble)

| Ce que l'utilisateur peut faire | Ce qui est en lecture seule |
|---|---|
| Naviguer, scroller, cliquer les onglets, voir les profils étudiants | Toutes les données ACPE, patterns, niveaux RàI |

### Détails techniques

- Les données démo sont chargées dans IndexedDB sous le namespace `demo_` avec un trimestre `"demo"` — `obtenirDonneesSelonMode()` fonctionne sans modification
- Le pack de données démo est un fichier JS statique (`pack-demo-25.js`) produit par le script d'anonymisation
- À la sortie de la démo, `dechargerDonneesDemo()` supprime toutes les clés `demo_*` d'IndexedDB
- Au démarrage, si le mode n'est plus démo, nettoyage de sécurité des résidus éventuels
- Un bandeau visuel discret indique «Mode démonstration» (mais pas le bandeau actuel qui occupe l'espace)
- Bouton «Quitter la démo» toujours accessible, ramène à la page d'accueil
- L'entrée dans la démo se fait via le bouton «Explorer la démo» sur la page d'accueil (pas via le sélecteur de mode)

---

## Chantier 3 : Page d'accueil permanente

### Principe

La page d'accueil remplace le tableau de bord comme écran par défaut. Elle est visible à chaque ouverture de l'application (sauf si l'utilisateur a activé le «Mode expert» dans les réglages).

### Structure de la page

**En-tête** : Identité de l'application (nom, devise «Explorer. Réfléchir. Transformer.»), trimestre actif si un cours existe.

**Si aucun cours n'existe (premier lancement)** :
- Message d'accueil court : une phrase qui dit ce que l'application fait
- Deux portes d'entrée :
  - «Créer mon premier cours» → lance Primo et le flux de configuration
  - «Explorer la démo» → entre dans le monde parallèle de la démo

**Si au moins un cours existe (retour)** :
- Accès rapide au cours actif (nom, groupe, trimestre)
- Portes d'entrée par intention :
  - «Prendre les présences» → onglet Présences
  - «Corriger des travaux» → onglet Travaux
  - «Évaluer une production» → onglet Évaluations
  - «Voir la progression du groupe» → Tableau de bord (vue d'ensemble)
- Accès à la démo toujours disponible (pour montrer à un collègue, par exemple)
- Lien discret vers «Tableau de bord complet»

**Pied de page** : Version, lien vers l'aide, lien vers le blog.

### Mode expert

- Case à cocher dans Réglages > Préférences : «Ouvrir directement sur le tableau de bord»
- Si activé, l'application s'ouvre sur le tableau de bord comme aujourd'hui
- La page d'accueil reste accessible via un bouton/icône «Accueil» dans la navigation

### Design

- Sobre, aéré, peu d'éléments
- Même palette que l'en-tête actuel (fond sombre, particules)
- Les portes d'entrée sont des cartes cliquables avec une icône et un libellé court
- Pas de barres de données, pas d'indicateurs, pas d'onglets techniques visibles
- Responsive : fonctionne sur MacBook et iPad

---

## Chantier 4 : Guidage contextuel dans la démo

### MVP AQPC : Encarts textuels statiques

Pour la démo v1, le guidage se fait par des **encarts textuels statiques** (pas de Primo narrateur interactif). Le pattern existe déjà dans l'application :

```html
<div class="info-box info-box--info">
    <strong>Titre</strong> — Texte explicatif contextuel.
</div>
```

Concrètement : quand l'utilisateur entre dans la démo, chaque section affiche un encart qui explique ce qu'on voit. Pas d'état, pas de modal, pas d'arbre de questions. C'est livrable en quelques heures.

**Pourquoi pas Primo pour le MVP** : Le Primo actuel représente ~3100 lignes de code (`primo-questions.js` ~2000 lignes, `primo-modal.js` ~1100 lignes). Son arbre de questions est conçu pour un dialogue interactif (question → réponse → branchement), pas pour une narration linéaire contextuelle. Le transformer en «guide narratif intégré» est essentiellement un nouveau module. Les encarts statiques font le travail immédiatement.

### Post-AQPC : Primo narrateur interactif complet

Après le colloque, une fois la démo et la page d'accueil stabilisées, le vrai Primo revu prendra la forme d'un narrateur interactif avec parcours structurés :

- **Primo dans la démo** : Narrateur qui commente ce que l'utilisateur voit à chaque étape, intégré à l'interface (panneau latéral ou encart contextuel évolutif)
- **Primo au premier lancement** : Structure la configuration en étapes simples (quel cours, import étudiants, choix de notation, confirmation)
- **Primo en usage courant** : Disponible mais discret, aide contextuelle au premier accès à chaque écran

Détails techniques (post-AQPC) :
- Revoir l'arbre de questions/actions de `primo-questions.js`
- Corriger les références cassées dans `primo-modal.js`
- Concevoir les scripts narratifs pour chaque scénario de démo
- Stocker les étapes «déjà vues» pour ne pas répéter le guidage

---

## Point d'architecture : le sélecteur de mode

### Situation actuelle

Le sélecteur de mode dans l'en-tête (`creerSelecteurMode()`, modes.js ligne 74) offre 3 options : Normal / Assisté / Anonymisé. Le mode «Assisté» (`simulation`) déclenche actuellement le chargement des données démo.

### Modification requise

Si la démo devient une route séparée (et non un mode), le mode «Assisté» n'a plus de raison d'être :

- **Supprimer le mode «Assisté»** (`simulation`) du sélecteur
- **Le sélecteur passe à 2 options** : Normal / Anonymisé
- **L'entrée dans la démo** se fait via la page d'accueil (bouton «Explorer la démo»), pas via le sélecteur de mode
- **La sortie de la démo** se fait via un bouton «Quitter la démo» qui ramène à la page d'accueil
- Le mode «Anonymisé» reste utile (projection en classe, respect de la vie privée)

---

## Priorités, séquencement et calendrier

### Estimation par chantier

| Chantier | Effort estimé | Dépendances | Cible AQPC |
|----------|:---:|-------------|:---:|
| 1. Démantèlement | 1 session | Aucune | Oui |
| 2. Démo (scénario Vue d'ensemble) | 3-4 sessions | Chantier 1 + script d'anonymisation | Oui |
| 3. Page d'accueil | 1-2 sessions | Aucune (parallélisable) | Oui |
| 4. Encarts statiques dans la démo | 1 session | Chantier 2 | Oui |
| Sélecteur de mode (2 options) | inclus dans chantier 2 | Chantier 1 | Oui |
| 4b. Primo narrateur complet | 4-6 sessions | Chantiers 2 + 3 | Post-AQPC |
| 2b. Scénarios 2-4 | 2-3 sessions chacun | Chantier 2 | Post-AQPC |

**Total MVP AQPC** : ~6-8 sessions Claude Code
**Marge** : ~4 mois = ~16 semaines. Avec 1-2 sessions par semaine, faisable avec marge pour les imprévus.

### Calendrier proposé

```
Semaine 1-2 : Chantier 1 — Démantèlement
    Supprimer le code mort, unifier sur un seul pack
    Résultat : terrain propre

Semaine 2-3 : Script d'anonymisation des données A25
    Créer un script Node.js qui anonymise les données réelles → pack-demo-25.js
    5 couches d'anonymisation (identité, dates, notes, ordre, recalcul)
    Validation par Grégoire (le tableau de bord sonne-t-il vrai ?)
    Résultat : dataset démo crédible ET garanti anonyme

Semaine 3-5 : Chantier 2 — Démo (scénario Vue d'ensemble)
    Nouveau donnees-demo.js simplifié (namespace demo_, chargement/déchargement propre)
    Entrée via bouton «Explorer la démo» → charge le pack, bascule sur trimestre demo
    Sortie via «Quitter la démo» → déchargement, retour accueil
    Bandeau discret «Mode démonstration»
    Encarts textuels contextuels (chantier 4)
    Résultat : démo fonctionnelle en lecture + micro-interactions

Semaine 4-6 : Chantier 3 — Page d'accueil
    (en parallèle du chantier 2)
    Nouvelle section «accueil» dans la navigation
    Deux états : premier lancement / retour
    Portes d'entrée par intention
    Mode expert dans Réglages
    Résultat : première impression claire

Semaine 6-7 : Intégration et tests
    Connecter page d'accueil ↔ démo
    Supprimer le mode «Assisté» du sélecteur (→ Normal / Anonymisé)
    Tests avec 2-3 testeurs réels
    Résultat : MVP prêt pour l'AQPC

Post-AQPC :
    Scénarios 2-4 (Travaux, Évaluation, Présences)
    Primo narrateur interactif
    Design visuel final (maquettes Figma)
```

### Jalon AQPC (mercredi 3 juin 2026, 13h45, 60 minutes)

Le MVP pour le colloque comprend :
- Page d'accueil fonctionnelle (chantier 3)
- Scénario «Vue d'ensemble» de la démo avec données réelles anonymisées (chantier 2)
- Encarts textuels contextuels dans la démo (chantier 4)
- Sélecteur de mode simplifié (Normal / Anonymisé)

Explicitement **post-AQPC** : scénarios 2-4, Primo narrateur interactif, design visuel final.

---

## Décisions de design prises

- La page d'accueil est **permanente** (pas un écran de premier lancement)
- La démo utilise **IndexedDB avec namespace `demo_`** (pas la mémoire seule — réutilise toute l'infrastructure existante)
- La démo permet l'**observation + micro-interactions** (pas un bac à sable complet)
- Le dataset est **anonymisé à partir de données réelles A25** (5 couches d'anonymisation, recalcul des indicateurs, validation humaine)
- Les portes d'entrée utilisent un **langage d'intention** (pas des noms de modules)
- Le guidage démo v1 utilise des **encarts textuels statiques** (Primo narrateur interactif = post-AQPC)
- Le mode «Assisté» est **supprimé** — le sélecteur passe à Normal / Anonymisé
- L'entrée dans la démo se fait depuis la **page d'accueil** (pas depuis le sélecteur de mode)
- Un **mode expert** dans les réglages permet de court-circuiter la page d'accueil

---

## Ce plan ne couvre pas

- Les modifications du tableau de bord (strates ACPE, zones permaculturelles, titres Observer/Intervenir) — planifié séparément
- Le module Travaux (autocollants, panneau rétractable, export PDF) — voir Plan Module Travaux
- Le contenu détaillé des scripts narratifs de Primo — à concevoir une fois l'architecture en place
- Le design visuel détaillé de la page d'accueil — maquettes à faire dans Figma

---

*Plan rédigé le 6 février 2026*
*Mis à jour le 6 février 2026 avec les recommandations de la revue technique de Claude Code (voir `docs/revue-plan-accueil-demo-2026-02-06.md`)*
*Basé sur la discussion Cowork du même jour et le rapport d'audit de Claude Code*
