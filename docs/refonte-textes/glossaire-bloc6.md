# Bloc 6 — Glossaire contextuel (~40 termes)

**Statut** : Brouillon (19 avril 2026)  
**Charte de référence** : `plans de travail/PLAN-REFONTE-TEXTES-ACCOMPAGNEMENT.md`, section 1  
**Approche retenue** : Double accès (page dédiée + définitions inline)

---

## Principes

- **Ancrage dans le connu** : chaque définition part du geste papier ou du concept familier avant d'expliquer ce que Labo Codex en fait
- **Deux vitesses de lecture** : titre + première phrase = l'essentiel ; le reste = la nuance
- **Pas de circularité** : un terme ne se définit pas par un autre terme du glossaire sans que celui-ci soit lui-même défini
- **Cohérence avec les textes validés** : les définitions reprennent exactement le vocabulaire des info-bulles, popups et tour guidé (Blocs 1 à 5)
- **Vocabulaire situé** : le glossaire respecte la progression Numérisation → Croisement → Observation → Compétence ; les termes avancés (RàI, ACO, patterns) sont signalés comme tels

---

## Composant UI proposé

### Accès 1 — Page dédiée

- Accessible depuis le menu Aide ou la navigation secondaire
- Liste alphabétique avec ancres, filtrable par étape de progression
- Chaque entrée : terme, catégorie, définition, renvoi vers la section concernée de l'application

### Accès 2 — Définitions inline

- Dans les info-bulles et popups, les termes du glossaire apparaissent en surligné discret (soulignement pointillé ou couleur secondaire)
- Au survol ou au clic : micro-popup avec la première phrase de la définition + lien «En savoir plus» vers la page dédiée
- Pas d'activation automatique partout : limiter aux premières occurrences dans chaque section pour éviter le bruit visuel

### Specs techniques

| Aspect | Détail |
|--------|--------|
| Stockage des termes | Fichier JSON (`js/glossaire-data.js`) ou objet dans `tooltips-contenu.js` |
| Format d'une entrée | `{ cle, terme, categorie, etape, definition, voir }` |
| Rendu inline | Classe CSS `.glossaire-terme` + micro-popup via `data-glossaire="cle"` |
| Page dédiée | Section dans l'aide ou vue dédiée dans la navigation |
| Responsive | Micro-popup pleine largeur sur iPad, tooltip classique sur desktop |

---

## Termes — Étape 1 : Numérisation

### Trimestre
Période de 15 semaines qui structure le calendrier de ton cours. Tu définis les dates de début et de fin, les congés et les journées de reprise. L'application génère automatiquement les séances à partir de ces informations et de ton horaire.

**Catégorie** : Réglages · **Voir** : Réglages > Trimestre

---

### Cours
Le cours tel qu'il apparaît dans ton plan de cours. Le code suit le format 000-000-XX (discipline-cours-lettres). Un seul cours peut être actif à la fois dans l'application. Tu peux dupliquer un cours pour créer rapidement une nouvelle session.

**Catégorie** : Réglages · **Voir** : Réglages > Cours

---

### Groupe d'étudiant·es
La liste de tes étudiant·es pour un cours donné. Tu peux les ajouter individuellement ou importer une liste depuis un tableur ou le système de gestion institutionnel. Cette liste est la référence unique utilisée partout dans l'application.

**Catégorie** : Réglages · **Voir** : Réglages > Groupe

---

### Horaire
Le format de tes périodes de cours dans la semaine : 2×2h (deux périodes séparées), 1×4h (cours intensif en une seule période) ou 1×3h (une seule période). L'horaire, combiné au trimestre, génère automatiquement le calendrier de tes séances.

**Catégorie** : Réglages · **Voir** : Réglages > Horaire

---

### Groupe-cours
L'assemblage qui relie ton trimestre, ton cours, ton groupe d'étudiant·es, ton horaire et ta pratique de notation. C'est lui qui détermine ce que tu vois partout dans l'application. Il faut au minimum un trimestre, un cours, un groupe et un horaire pour l'assembler.

**Catégorie** : Réglages · **Voir** : Réglages > Groupe-cours

---

### Production
Une occasion pour tes étudiant·es de mettre en pratique ce qu'ils et elles apprennent — un exercice, un travail, un examen. Chaque production a une pondération et une échéance. L'ensemble des productions totalise 100 % de la note finale. Dans le module Planification, les productions sont d'abord des mises en pratique liées aux objectifs d'apprentissage.

**Catégorie** : Structure · **Voir** : Structure > Productions

---

### Portfolio
Un type de production qui regroupe plusieurs artefacts. Tu définis combien d'artefacts seront retenus (ex. : les 3 meilleurs sur 9) — ce sont les N meilleures démonstrations de compétence qui comptent. Les artefacts individuels n'ont pas de pondération propre : c'est le portfolio conteneur qui porte le poids dans la note finale.

**Catégorie** : Structure · **Voir** : Structure > Productions

---

### Artefact
Une pièce individuelle à l'intérieur d'un portfolio — un travail, un exercice, une démonstration. Plusieurs artefacts composent un portfolio, mais seuls les meilleurs sont retenus pour la note.

**Catégorie** : Structure · **Voir** : Structure > Productions

---

### Grille de critères
L'outil qui définit comment tu évalues une production. Tu nommes tes critères, tu choisis leur type (holistique, analytique ou algorithmique) et tu répartis les pondérations pour totaliser 100 %. C'est le même principe qu'une grille papier, mais réutilisable d'une production à l'autre.

**Catégorie** : Structure · **Voir** : Structure > Grilles

---

### Type de critère
La méthode d'évaluation d'un critère dans une grille. Trois types sont disponibles : holistique (tu attribues un niveau global), analytique (tu attribues des points par élément ou micro-tâche) et algorithmique (calcul automatique selon une formule, ex. : nombre d'erreurs / nombre de mots × 100 pour le français écrit).

**Catégorie** : Structure · **Voir** : Structure > Grilles

---

### Échelle de performance
Les niveaux que tu attribues à chaque critère lors de l'évaluation. Par défaut, quatre niveaux alignés sur IDME : Insuffisant, Développement, Maîtrise, Étendu. Tu configures les seuils, les valeurs ponctuelles et les couleurs selon ton jugement professionnel.

**Catégorie** : Structure · **Voir** : Structure > Échelles

---

### Cartouche de rétroaction
Matrice de commentaires généraux automatiques que tu prépares une fois : un commentaire par combinaison critère × niveau de performance. Lors de l'évaluation, l'application assemble automatiquement une rétroaction personnalisée à partir de ces commentaires. Pour être efficaces, les commentaires doivent être lus et compris — idéalement entre 50 et 75 mots.

**Catégorie** : Structure · **Voir** : Structure > Cartouches

---

### Pratique de notation
Ta recette complète pour construire la note. Quatre pratiques sont disponibles : sommative (SOM), PAN par standards (STD), PAN par spécifications (SPE) et dénotation (DEN). La pratique détermine comment les résultats de tes évaluations se transforment en note finale. Tu peux toujours la changer.

**Catégorie** : Structure · **Voir** : Structure > Pratiques / Réglages > Pratiques

---

## Termes — Étape 2 : Croisement

### Évaluation
Le geste d'attribuer un niveau de performance à chaque critère d'une grille pour une production donnée et un·e étudiant·e donné·e. La rétroaction se construit au fur et à mesure que tu attribues les niveaux.

**Catégorie** : Évaluations · **Voir** : Évaluations > Saisie

---

### Rétroaction
Le commentaire personnalisé que l'application assemble automatiquement à partir des cartouches. Chaque critère évalué contribue un fragment de texte ; l'ensemble forme un retour structuré que tu peux copier, exporter ou transmettre à l'étudiant·e.

**Catégorie** : Évaluations · **Voir** : Évaluations > Saisie

---

### Jeton
Une occasion supplémentaire offerte à l'étudiant·e de démontrer sa compétence ou son habileté. Trois types disponibles : Délai (temps supplémentaire selon une entente convenue), Reprise (nouvelle tentative complète — le résultat remplace le précédent) et Reprise ciblée (nouvelle tentative sur des critères spécifiques). Les jetons favorisent la motivation intrinsèque et l'apprentissage profond plutôt que la simple amélioration d'une note.

**Catégorie** : Évaluations · **Voir** : Évaluations > Jetons

---

### Tampon / Estampe
Marques visuelles que tu apposes sur les copies importées pour annoter le travail de l'étudiant·e. Ils permettent d'identifier des éléments précis (erreurs, réussites, points d'attention) directement sur le document, comme tu le ferais avec un stylo sur une copie papier.

**Catégorie** : Travaux · **Voir** : Travaux > Annoter

---

### Présence / Assiduité (saisie)
La saisie des présences et absences pour chaque séance. Les séances sont générées automatiquement à partir du calendrier et de l'horaire. Cette donnée alimente l'indice A (Assiduité) du tableau de bord.

**Catégorie** : Présences · **Voir** : Présences > Saisie

---

## Termes — Étape 3 : Observation

### Indice A — Assiduité
Mesure l'exposition de l'étudiant·e aux situations d'apprentissage : sa présence en classe, sa disponibilité à recevoir l'enseignement. Ce n'est pas un jugement sur la qualité de sa participation — c'est le constat qu'il ou elle était là, exposé·e au contenu. Un·e étudiant·e absent·e ne peut pas apprendre ce qui a été enseigné ce jour-là, quelle que soit sa compétence.

**Catégorie** : Tableau de bord · **Voir** : Tableau de bord > Aperçu

---

### Indice C — Complétion
Mesure la régularité de la mise en pratique : l'étudiant·e remet-il ou elle ses productions ? Ce n'est pas la qualité du travail qui est observée ici, mais le fait qu'il ou elle s'exerce. La complétion reflète l'engagement dans le processus d'apprentissage — un·e étudiant·e qui ne remet rien ne se pratique pas, indépendamment de son potentiel.

**Catégorie** : Tableau de bord · **Voir** : Tableau de bord > Aperçu

---

### Indice P — Performance
Mesure la compétence démontrée au moment T : le résultat obtenu aux évaluations, exprimé en chiffre ou en lettre selon la pratique de notation. C'est une photographie, pas un pronostic. Un P faible avec un C élevé signale un·e étudiant·e qui fournit l'effort sans obtenir les résultats — c'est un signal pour intervenir et regarder plus précisément sur quel critère ou habileté se situe la difficulté.

**Catégorie** : Tableau de bord · **Voir** : Tableau de bord > Aperçu

---

### Indices A-C-P (ensemble)
Les trois indices résument le contexte d'apprentissage observé de chaque étudiant·e. Ensemble, ils forment un portrait : A dit «est-ce que l'étudiant·e est exposé·e à l'apprentissage ?», C dit «est-ce qu'il ou elle se pratique ?», P dit «est-ce que ça se traduit en compétence ?». Les zones de couleur — Fragile, Modéré, Favorable, Très favorable — aident à repérer rapidement qui a besoin d'attention. Cette lecture est subjective : elle est relative non seulement aux traces que laisse l'étudiant·e, mais aussi à la lecture qu'en fait l'enseignant·e.

**Catégorie** : Tableau de bord · **Voir** : Tableau de bord > Aperçu

---

### Pattern d'apprentissage
Un signal récurrent dans la mobilisation observée d'un·e étudiant·e — par exemple, une tendance à la baisse de complétion, une performance stable malgré des absences, ou un désengagement progressif. Les patterns aident à repérer des dynamiques qui ne seraient pas visibles sur une seule évaluation.

**Catégorie** : Tableau de bord · **Voir** : Tableau de bord > Aperçu / Liste

---

### Zone de couleur
Le code visuel qui traduit chaque indice A-C-P en signal lisible : Fragile (attention requise), Modéré (à surveiller), Favorable (progression normale), Très favorable (résultats solides). Les seuils sont configurables dans Réglages > Dépistage.

**Catégorie** : Tableau de bord · **Voir** : Tableau de bord > Aperçu

---

### RàI — Réponse à l'Intervention
Modèle de soutien en trois niveaux, du plus large au plus ciblé. Niveau 1 (universel) : les pratiques pédagogiques pour tout le groupe. Niveau 2 (préventif) : interventions ciblées pour les étudiant·es montrant des difficultés émergentes. Niveau 3 (intensif) : accompagnement individualisé pour les difficultés persistantes. Le tableau de bord identifie les signaux ; c'est l'enseignant·e qui décide de l'intervention.

**Catégorie** : Tableau de bord · **Voir** : Tableau de bord > Interventions

---

### Niveau RàI
Le niveau de soutien attribué à un·e étudiant·e selon les signaux du tableau de bord. Niveau 1 : aucune intervention spécifique nécessaire. Niveau 2 : difficultés émergentes détectées — intervention préventive recommandée. Niveau 3 : difficultés persistantes — accompagnement intensif recommandé. Le niveau est calculé uniquement à partir des critères multistructurels.

**Catégorie** : Tableau de bord · **Voir** : Tableau de bord > Interventions

---

### Seuils de dépistage
Les valeurs qui déterminent les couleurs et les alertes dans le tableau de bord. Valeurs par défaut : Progression 5 points (%), Direction du risque 5 points (%), Défi ≤70 %. Toute modification s'applique immédiatement à tous les calculs — diagnostics RàI, patterns et recommandations.

**Catégorie** : Réglages · **Voir** : Réglages > Dépistage

---

### IDME
Quatre niveaux de performance alignés sur la taxonomie SOLO : Insuffisant, Développement, Maîtrise, Étendu. Ces niveaux servent de référence dans les échelles, les grilles et les cartouches. Ils décrivent la qualité de la démonstration de compétence à un moment donné.

**Catégorie** : Structure / Tableau de bord · **Voir** : Structure > Échelles

---

### SOLO
Structure of Observed Learning Outcomes, développée par Biggs and Collis (1982). Taxonomie qui décrit la complexité croissante des réponses d'apprentissage : préstructurel, unistructurel, multistructurel, relationnel, abstrait étendu. Dans Labo Codex, la taxonomie SOLO fonde les niveaux IDME et le dépistage des actions cognitives.

**Catégorie** : Cadre théorique · **Voir** : Réglages > Dépistage

---

### ACO — Actions Cognitives Observées
Trois actions cognitives observables que tu peux repérer sur les copies de tes étudiant·es à l'aide de tampons ou estampes : Repérage (identifier un élément), Liaison (relier des éléments entre eux) et Ouverture (transférer, généraliser, critiquer). Les résultats alimentent le profil ACO et l'export de recherche. Cette mesure est subjective — elle dépend des traces que laisse l'étudiant·e et de la lecture qu'en fait l'enseignant·e. La dynamique ressemble à une mycorrhization : des connexions cognitives invisibles se forment en profondeur, et ce n'est que plus tard qu'on voit l'émergence des fruits à la surface.

**Catégorie** : Tableau de bord / Travaux · **Voir** : Travaux > Annoter / Tableau de bord > Profil

---

### RLO — Repérage, Liaison, Ouverture
Les trois actions cognitives qui composent l'ACO. Le Repérage consiste à identifier un élément pertinent. La Liaison consiste à relier des éléments entre eux (comparer, organiser, expliquer les relations). L'Ouverture consiste à aller au-delà du donné (transférer, généraliser, émettre des hypothèses, critiquer). Ces trois actions correspondent aux niveaux de complexité croissante de la taxonomie SOLO.

**Catégorie** : Cadre théorique · **Voir** : Travaux > Annoter

---

### Profil ACO
Le portrait des actions cognitives observées chez un·e étudiant·e, construit à partir des annotations RLO sur ses copies. Le profil ACO montre la répartition entre repérage, liaison et ouverture — il rend visible le type de pensée que l'étudiant·e mobilise, pas seulement le résultat obtenu. C'est un outil d'observation, pas une note.

**Catégorie** : Tableau de bord · **Voir** : Tableau de bord > Profil

---

### Engagement cognitif
La qualité de la mobilisation intellectuelle de l'étudiant·e — pas seulement sa présence ou sa participation visible. L'engagement cognitif est difficile à mesurer directement : on l'observe à travers les questions posées, les réponses aux sollicitations (tirage au sort, questions flash) et surtout les traces écrites (annotations RLO). Les évaluations en sont le proxy le plus proche, mais elles restent ponctuelles. Cette mesure est fondamentalement subjective.

**Catégorie** : Cadre théorique · **Voir** : Tableau de bord > Profil

---

## Termes — Étape 4 : Compétence

### Alignement pédagogique
Le lien de cohérence entre ce que tu vises (compétence, connaissances), comment tu l'enseignes (activités, soutien) et comment tu le vérifies (évaluations). La carte mentale de Labo Codex rend ces liens visibles et signale les incohérences — un objectif sans production liée, une connaissance sans évaluation prévue. Ces alertes sont des pistes de réflexion, pas des erreurs à corriger.

**Catégorie** : Planification · **Voir** : Planification > Alignement

---

### Carte mentale
L'outil visuel interactif qui représente l'alignement pédagogique de ton cours. Tu y places des nœuds (compétence, connaissances, activités, évaluations) et tu les relies pour rendre visibles les connexions. La compétence du devis ministériel ou du plan-cadre est un bon point de départ.

**Catégorie** : Planification · **Voir** : Planification > Alignement

---

### Nœud
Un élément cognitif dans la carte mentale : compétence, connaissance, activité d'apprentissage, évaluation, soutien, etc. Chaque nœud peut être relié à d'autres pour matérialiser l'alignement pédagogique.

**Catégorie** : Planification · **Voir** : Planification > Alignement

---

### Séquence
Un regroupement de leçons dans l'organisateur. Les séquences organisent tes leçons sur les 15 semaines du trimestre. Une séquence peut contenir plusieurs leçons et couvrir plusieurs séances.

**Catégorie** : Planification · **Voir** : Planification > Organisateur

---

### Leçon
Un plan pédagogique structuré à l'intérieur d'une séquence. Chaque leçon peut suivre le canevas d'enseignement explicite en 5 phases : ouverture, modelage, pratique guidée, pratique autonome, objectivation.

**Catégorie** : Planification · **Voir** : Planification > Organisateur

---

### Enseignement explicite (5 phases)
Structure pédagogique en cinq étapes pour organiser une leçon : ouverture (activer les connaissances antérieures), modelage (démontrer), pratique guidée (accompagner), pratique autonome (laisser faire seul·e), objectivation (consolider). L'option est disponible dans l'organisateur mais n'est pas imposée.

**Catégorie** : Planification · **Voir** : Planification > Organisateur

---

## Termes — Pratiques de notation (transversal)

### SOM — Sommative
Pratique de notation traditionnelle qui calcule une moyenne pondérée des résultats. Chaque production contribue à la note finale selon sa pondération.

**Catégorie** : Pratiques de notation · **Voir** : Structure > Pratiques

---

### STD — PAN par standards
Pratique alternative de notation qui retient les meilleures démonstrations de compétence. L'étudiant·e progresse en montrant sa maîtrise, pas en accumulant des points. Le résultat le plus récent ou le meilleur peut remplacer les précédents, selon la configuration.

**Catégorie** : Pratiques de notation · **Voir** : Structure > Pratiques

---

### SPE — PAN par spécifications
Pratique alternative de notation qui fonctionne par contrat : chaque production est réussie ou non selon des critères prédéfinis. C'est l'ensemble des cibles atteintes qui détermine la note finale, pas une moyenne.

**Catégorie** : Pratiques de notation · **Voir** : Structure > Pratiques

---

### DEN — Dénotation
Pratique qui réduit ou élimine la notation chiffrée au profit de la rétroaction qualitative. L'accent est mis sur le commentaire et l'accompagnement plutôt que sur le score.

**Catégorie** : Pratiques de notation · **Voir** : Structure > Pratiques

---

### PAN — Pratique Alternative de Notation
Terme générique qui regroupe les pratiques STD, SPE et DEN — toutes les approches qui s'éloignent de la sommative traditionnelle. Dans le contexte PAN, les productions sont d'abord des occasions d'apprentissage et de mise en pratique, pas des épreuves évaluatives.

**Catégorie** : Pratiques de notation · **Voir** : Structure > Pratiques

---

## Termes — Interface et fonctionnalités

### Mode assistance (icônes 📍)
Quand ce mode est activé dans les Préférences, des icônes 📍 apparaissent à côté des éléments de l'interface. En cliquant dessus, tu obtiens une explication contextuelle de la section ou du champ concerné. Ce mode est indépendant du parcours guidé.

**Catégorie** : Préférences · **Voir** : Réglages > Préférences

---

### Parcours guidé (tour)
Un parcours en 6 étapes qui te guide à travers les sections essentielles de l'application lors de ta première utilisation. Tu peux le quitter à tout moment, sauter une étape ou y revenir depuis les Préférences. Le parcours est complémentaire au mode assistance.

**Catégorie** : Aide · **Voir** : Réglages > Préférences

---

### Bilan réflexif
Un espace dans les Réglages pour consigner tes observations sur ta démarche pédagogique : forces, défis et pistes d'amélioration. C'est un outil de pratique réflexive, pas un formulaire obligatoire.

**Catégorie** : Réglages · **Voir** : Réglages > Bilan

---

### Namespacing (préfixe trimestre)
Les données de l'application sont préfixées par le trimestre actif (ex. : `h2026_`, `a2025_`). Ce mécanisme permet de conserver les données de plusieurs trimestres sans conflit et de basculer entre eux.

**Catégorie** : Technique · **Voir** : Réglages > Données

---

## Récapitulatif

| # | Terme | Étape | Catégorie |
|---|-------|-------|-----------|
| 1 | Trimestre | Numérisation | Réglages |
| 2 | Cours | Numérisation | Réglages |
| 3 | Groupe d'étudiant·es | Numérisation | Réglages |
| 4 | Horaire | Numérisation | Réglages |
| 5 | Groupe-cours | Numérisation | Réglages |
| 6 | Production | Numérisation | Structure |
| 7 | Portfolio | Numérisation | Structure |
| 8 | Artefact | Numérisation | Structure |
| 9 | Grille de critères | Numérisation | Structure |
| 10 | Type de critère | Numérisation | Structure |
| 11 | Échelle de performance | Numérisation | Structure |
| 12 | Cartouche de rétroaction | Numérisation | Structure |
| 13 | Pratique de notation | Numérisation | Structure |
| 14 | Évaluation | Croisement | Évaluations |
| 15 | Rétroaction | Croisement | Évaluations |
| 16 | Jeton | Croisement | Évaluations |
| 17 | Tampon / Estampe | Croisement | Travaux |
| 18 | Présence / Assiduité (saisie) | Croisement | Présences |
| 19 | Indice A — Assiduité | Observation | Tableau de bord |
| 20 | Indice C — Complétion | Observation | Tableau de bord |
| 21 | Indice P — Performance | Observation | Tableau de bord |
| 22 | Indices A-C-P (ensemble) | Observation | Tableau de bord |
| 23 | Pattern d'apprentissage | Observation | Tableau de bord |
| 24 | Zone de couleur | Observation | Tableau de bord |
| 25 | RàI | Observation | Tableau de bord |
| 26 | Niveau RàI | Observation | Tableau de bord |
| 27 | Seuils de dépistage | Observation | Réglages |
| 28 | IDME | Observation | Structure / TdB |
| 29 | SOLO | Observation | Cadre théorique |
| 30 | ACO | Observation | TdB / Travaux |
| 31 | RLO | Observation | Cadre théorique |
| 32 | Profil ACO | Observation | Tableau de bord |
| 33 | Engagement cognitif | Observation | Cadre théorique |
| 34 | Alignement pédagogique | Compétence | Planification |
| 35 | Carte mentale | Compétence | Planification |
| 36 | Nœud | Compétence | Planification |
| 37 | Séquence | Compétence | Planification |
| 38 | Leçon | Compétence | Planification |
| 39 | Enseignement explicite | Compétence | Planification |
| 40 | SOM | Transversal | Pratiques |
| 41 | STD | Transversal | Pratiques |
| 42 | SPE | Transversal | Pratiques |
| 43 | DEN | Transversal | Pratiques |
| 44 | PAN | Transversal | Pratiques |
| 45 | Mode assistance | Interface | Préférences |
| 46 | Parcours guidé | Interface | Aide |
| 47 | Bilan réflexif | Interface | Réglages |
| 48 | Namespacing | Technique | Réglages |
