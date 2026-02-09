# Plan de travail — Module Travaux

## Contexte

Le module Travaux (Beta 97) permet d'importer, visionner et annoter les travaux étudiants directement dans l'application. Le flux de correction complet : Omnivox → Application (import, annotation, évaluation, rétroaction) → Export PDF → Omnivox.

Les fonctionnalités d'import, de visionneuse et d'annotation au stylet sont déjà en place. Ce plan couvre les améliorations de l'interface et les fonctionnalités manquantes pour compléter le flux.

---

## État actuel (Beta 97)

- Import de fichiers PDF/images avec détection automatique du DA étudiant
- Visionneuse intégrée avec navigation et zoom
- Annotation au stylet : stylo, surligneur, gomme, formes (cercle, flèche, rectangle), symboles (crochet, croix)
- Annuler/Rétablir (jusqu'à 50 niveaux)
- Bouton «Voir le travail» dans Évaluations (côte à côte avec la grille)
- Travaux dans le Profil étudiant avec miniatures et export ZIP
- Archivage ZIP par étudiant/production/semestre
- Stockage File System Access API (Mac)

---

## Améliorations planifiées

### 1. Panneau gauche rétractable en mode annotation

**Problème** : Le panneau de fichiers à gauche reste visible pendant l'annotation, mais n'est pas utile à ce moment du workflow. Il réduit l'espace disponible pour le document.

**Solution** :
- Quand l'utilisateur clique sur «Annoter», le panneau gauche se replie automatiquement
- Le document occupe toute la largeur disponible
- Un bouton discret (icône ou onglet latéral) permet de réouvrir le panneau si nécessaire
- Quand l'utilisateur clique sur «Terminer», le panneau se redéploie

**Détails techniques** :
- Ajouter une transition CSS (slide) pour le panneau
- Stocker l'état replié/déplié dans le state du composant
- Lier l'état au mode annotation (annoter = replié, terminer = déplié)
- Sur iPad : envisager un slide-over plutôt qu'un panneau fixe pour maximiser l'espace stylet

---

### 2. Palette d'autocollants (tampons de rétroaction visuelle)

**Problème** : L'enseignant utilise des autocollants visuels pour donner une rétroaction rapide et localisée dans le texte de l'élève. Ces autocollants sont des repères visuels — la rétroaction détaillée est dans les cartouches de l'écran Évaluation.

**Solution** : Ajouter un groupe «TAMPONS» dans la barre d'outils d'annotation.

**Les 12 autocollants** (organisés en deux catégories) :

Qualité (rétroaction positive graduée) :
- Bien (pouce levé)
- Très bien (main OK)
- Brillant (ampoule)

Diagnostic (signaux locaux) :
- Bon lien logique (chaîne connectée)
- Manque de lien (chaîne brisée)
- Confusion (spirale)
- Répétitif (flèches circulaires)
- Preuve absente (bulle vide)
- Intégration citation (bulles doubles)
- Approfondir (loupe + flèche bas)
- Identifier les procédés (loupe + engrenage)
- Attention (triangle)

**Formats des icônes** :
- **Phase immédiate** : utiliser les PNG transparents déjà disponibles dans `/autocollants/` (12 fichiers). Ils sont hétérogènes en style mais fonctionnels pour développer et tester le workflow complet. Ils pixellisent au zoom élevé et ne s'adaptent pas au thème clair/sombre — c'est acceptable temporairement.
- **Phase finale** : remplacer par des SVG uniformes (Lucide comme base + icônes personnalisées dans Figma, en cours de création). Les SVG utiliseront `stroke="currentColor"` pour s'adapter au thème. Ils seront dans `/autocollants/svg/`.
- **Important** : concevoir le code pour charger les autocollants depuis un dossier configurable, afin de passer des PNG aux SVG sans modifier la logique.

**Détails techniques** :
- Ajouter une icône «tampon» dans la barre d'outils (après FORMES)
- Au clic : afficher la palette des 12 autocollants en popup ou panneau flottant
- Organisation : rang du haut = qualité (3), rang du bas = diagnostic (9)
- Chaque autocollant affiche son libellé court sous l'icône (ex. : «manque de lien»)
- Comportement : sélectionner un autocollant → taper sur le document pour le poser → l'autocollant est ancré à cette position
- Les autocollants posés sont redimensionnables et déplaçables
- Annuler/Rétablir s'applique aussi aux autocollants

---

### 3. Export PDF avec annotations et cartouches

**Problème** : L'enseignant doit pouvoir exporter un PDF unique contenant le travail annoté + la rétroaction structurée pour le retourner à l'élève via Omnivox.

**Flux de l'export** :
1. L'enseignant termine ses annotations (bouton «Terminer»)
2. L'enseignant évalue via l'écran Évaluation (sélection des niveaux par critère → cartouches générées automatiquement)
3. L'enseignant exporte un PDF depuis le module Travaux

**Contenu du PDF exporté** :
- Pages du travail original avec annotations au stylet aplaties (traits, surlignages, formes)
- Autocollants rendus en tant qu'images SVG intégrées, à leur position exacte
- Page de synthèse finale contenant :
  - Identification de l'étudiant et de la production
  - Grille de critères avec les niveaux atteints
  - Cartouches de rétroaction pour chaque critère (textes assemblés depuis l'écran Évaluation)
  - Note finale (si applicable selon la pratique de notation)

**Détails techniques** :
- Utiliser une bibliothèque de génération PDF côté client (ex. : pdf-lib ou jsPDF)
- Rasteriser le canvas d'annotation (traits + autocollants) par page
- Superposer sur les pages du PDF original
- Générer la page de synthèse à partir des données de l'évaluation déjà stockées
- Format de sortie : PDF/A si possible pour archivage

---

### 4. Écran de révision avant export

**Problème** : Avant de générer le PDF final, l'enseignant devrait pouvoir vérifier l'ensemble de la rétroaction.

**Solution** :
- Quand l'enseignant clique «Exporter», afficher un écran intermédiaire de révision
- Cet écran montre :
  - Nombre d'autocollants posés (avec répartition par type)
  - Cartouches de rétroaction qui seront incluses (relues depuis l'évaluation)
  - Aperçu de la page de synthèse
- Boutons : «Modifier» (retour à l'annotation ou à l'évaluation) et «Exporter le PDF»

---

## Priorités et dépendances

```
1. Panneau rétractable          → Aucune dépendance, peut être fait immédiatement
2. Palette d'autocollants       → Peut démarrer immédiatement avec les PNG temporaires
                                   (remplacement par SVG Figma ultérieurement, sans impact sur le code)
3. Export PDF                   → Dépend de l'écran Évaluation existant (déjà fonctionnel)
4. Écran de révision            → Dépend de l'export PDF (#3)
```

---

## Décisions de design prises

- Les autocollants sont des **repères visuels locaux**, pas des déclencheurs de cartouches. Les deux systèmes (autocollants dans le texte + cartouches dans l'évaluation) sont complémentaires mais indépendants.
- Le panneau gauche (liste des fichiers) **se replie** en mode annotation et **se redéploie** en sortant du mode annotation.
- L'export PDF produit un **document unique** : pages annotées + page de synthèse avec cartouches.
- Les icônes SVG utilisent le style **Lucide** (stroke-width: 2, linecap: round, linejoin: round, viewBox 24×24) pour cohérence avec l'écosystème. Base Lucide pour 9 icônes, création personnalisée dans Figma pour 3 (main OK, spirale, éventuellement procédés).
- Sur iPad, privilégier un **slide-over** pour le panneau de fichiers plutôt qu'un panneau fixe.

---

## Notes pour Claude Code

- L'application est une app web hors ligne (~50 000 lignes de code)
- Elle utilise IndexedDB pour le stockage (avec option File System Access API sur Mac)
- L'interface utilise un thème sombre avec en-tête navy
- Le code source est sur GitHub sous AGPL v3.0
- Les données restent 100% locales — aucun appel serveur
- Tester sur MacBook (Safari/Chrome) ET iPad Air M1 (Safari) avec Apple Pencil

---

*Plan rédigé le 6 février 2026*
*Basé sur la discussion Cowork du même jour*
