# Contenu des aides contextuelles - Document de revue

> **Usage** : Ce document permet de réviser et corriger le contenu des modals d'aide contextuelle (boutons 😎) affichés en Mode Assisté. Après corrections, le fichier `js/aide-contextuelle-contenu.js` sera mis à jour.

---

## Légende des types de contenu

| Type | Affichage | Usage |
|------|-----------|-------|
| `texte` | Paragraphe simple | Introduction, explication générale |
| `liste` | Liste à puces | Étapes, éléments, options |
| `conseil` | Encadré vert 💡 | Astuce pratique |
| `exemple` | Encadré bleu 📋 | Cas concret, illustration |
| `alerte` | Encadré orange ⚡/⚠️ | Avertissement, point d'attention |

---

# SECTION : TABLEAU DE BORD

---

## tableau-bord-apercu

**Emplacement** : Tableau de bord > Aperçu > Titre "Vue d'ensemble"

**Titre du modal** : Comprendre le tableau de bord

### Contenu

**[texte]**
Le tableau de bord offre une vue d'ensemble de la progression de votre groupe. Les indices A-C-P-E permettent d'identifier rapidement les étudiants nécessitant un suivi particulier.

**[liste] Indices de suivi (A-C-P-E)**
- A - Assiduité : taux de présence aux cours
- C - Complétude : productions remises vs attendues
- P - Performance : niveau de réussite aux évaluations
- E - Engagement : participation et implication observées

**[exemple] Lecture des couleurs**
Vert = satisfaisant (≥75%), Jaune = à surveiller (50-75%), Rouge = préoccupant (<50%). Un étudiant avec plusieurs indicateurs rouges mérite une attention prioritaire.

**[conseil]**
Consultez ce tableau chaque semaine pour détecter les situations à risque avant qu'elles ne s'aggravent.

**Voir aussi** : tableau-bord-rai, presences-saisie

---

## tableau-bord-liste

**Emplacement** : Tableau de bord > Liste des individus > Titre "Liste des étudiant·es"

**Titre du modal** : La liste des étudiants

### Contenu

**[texte]**
Cette vue présente tous vos étudiants avec leurs indicateurs clés. Vous pouvez trier et filtrer pour identifier rapidement ceux nécessitant un suivi.

**[liste] Actions disponibles**
- Cliquer sur un nom pour voir le profil détaillé
- Trier par colonne (note, assiduité, etc.)
- Filtrer par groupe
- Exporter la liste au format CSV

**[conseil]**
Triez par l'indice le plus problématique pour créer votre liste de suivi prioritaire.

**Voir aussi** : tableau-bord-apercu, tableau-bord-rai

---

## tableau-bord-rai

**Emplacement** : Tableau de bord > Interventions RàI > Titre "Planification et documentation des interventions"

**Titre du modal** : Le framework RaI (Réponse à l'Intervention)

### Contenu

**[texte]**
Le modèle RaI structure les interventions pédagogiques en trois niveaux d'intensité, permettant d'adapter le soutien aux besoins de chaque étudiant.

**[liste] Les trois niveaux RaI**
- Niveau 1 (Universel) : enseignement de qualité pour tous, ~80% des étudiants
- Niveau 2 (Ciblé) : interventions en petit groupe, ~15% des étudiants
- Niveau 3 (Intensif) : soutien individualisé, ~5% des étudiants

**[exemple] Exemple d'intervention Niveau 2**
Un atelier hebdomadaire de méthodologie pour les 5 étudiants ayant le plus de difficultés avec l'organisation de leurs travaux.

**[conseil]**
Documentez vos interventions dans l'onglet dédié. Cela permet de suivre leur efficacité et d'ajuster votre approche.

**Voir aussi** : tableau-bord-apercu, tableau-bord-liste

---

# SECTION : PRÉSENCES

---

## presences-calendrier

**Emplacement** : Présences > Vue calendaire > Titre "Calendrier des présences"

**Titre du modal** : Le calendrier des présences

### Contenu

**[texte]**
Le calendrier offre une vue d'ensemble des séances passées et à venir. Les codes couleur indiquent le taux de présence de chaque séance.

**[liste] Navigation dans le calendrier**
- Cliquer sur une date pour saisir/modifier les présences
- Les dates en gras ont des présences enregistrées
- Utilisez les flèches pour naviguer entre les mois
- La date du jour est encadrée

**[conseil]**
Repérez les patterns : un étudiant souvent absent le lundi peut avoir un conflit d'horaire à signaler.

**Voir aussi** : presences-saisie, tableau-bord-apercu

---

## presences-saisie

**Emplacement** : Présences > Saisie > Titre "Enregistrement quotidien"

**Titre du modal** : Saisir les présences efficacement

### Contenu

**[texte]**
La saisie des présences alimente l'indice d'Assiduité du tableau de bord et permet de repérer les patterns d'absence problématiques.

**[liste] États de présence disponibles**
- Présent : l'étudiant était présent au cours
- Absent : absence non justifiée
- Justifié : absence avec motif valide (maladie, etc.)
- Retard : arrivée tardive au cours

**[conseil]**
Prenez les présences au début du cours plutôt qu'à la fin. Utilisez le bouton « Tous présents » puis ajustez les exceptions.

**[alerte - attention]**
Les présences sont liées à la date du cours. Vérifiez que la bonne date est sélectionnée avant de saisir.

**Voir aussi** : tableau-bord-apercu, presences-calendrier

---

# SECTION : ÉVALUATIONS

---

## evaluations-liste

**Emplacement** : Évaluations > Liste > Titre "Historique et filtres"

**Titre du modal** : Historique des évaluations

### Contenu

**[texte]**
Cette section liste toutes les évaluations effectuées. Vous pouvez consulter, modifier ou supprimer une évaluation existante.

**[liste] Filtres disponibles**
- Par groupe : voir un seul groupe à la fois
- Par production : toutes les copies d'un même travail
- Par statut : complétées, en cours, à faire
- Recherche : trouver un étudiant spécifique

**[exemple] Cas d'usage**
Filtrez par production « Examen intra » + statut « Complété » pour réviser toutes vos corrections avant de publier les notes.

**[conseil]**
Exportez les résultats filtrés en CSV pour les importer dans votre système de notes officiel.

**Voir aussi** : evaluations-proceder, construction-productions

---

## evaluations-proceder

**Emplacement** : Évaluations > Évaluer > Titre "Évaluation des productions et rétroaction différenciée automatique"

**Titre du modal** : Procéder à une évaluation

### Contenu

**[texte]**
Cette interface permet d'évaluer le travail d'un·e étudiant·e sur une production. L'évaluation génère automatiquement une rétroaction personnalisée basée sur vos critères.

**[liste] Étapes recommandées**
- Sélectionner l'étudiant·e dans la liste déroulante
- Choisir la production à évaluer
- Évaluer chaque critère de la grille en cliquant sur le niveau atteint
- Vérifier et ajuster la rétroaction générée si nécessaire
- Cliquer sur « Sauvegarder l'évaluation »

**[conseil]**
Le mode « Évaluation en série » (bouton en haut) permet d'enchaîner plusieurs étudiants sur la même production, idéal pour corriger un lot de travaux.

**[exemple] Raccourci clavier**
Utilisez les touches 1-2-3-4-5 pour évaluer rapidement chaque critère sans utiliser la souris.

**Voir aussi** : construction-grilles, construction-echelles

---

# SECTION : CONSTRUCTION DE LA NOTE

---

## construction-apercu

**Emplacement** : Construction de la note > Aperçu > Titre "Vue d'ensemble"

**Titre du modal** : Vue d'ensemble du matériel pédagogique

### Contenu

**[texte]**
Cette page présente un résumé de tout le matériel pédagogique configuré pour votre cours : productions, grilles de critères, échelles de performance et pratiques de notation.

**[liste] Éléments affichés**
- Productions : travaux à évaluer (examens, devoirs, projets)
- Grilles : critères d'évaluation pour chaque production
- Échelles : niveaux de performance (IDME, pourcentages, etc.)
- Pratiques : méthode de calcul de la note finale

**[conseil]** ✅ CORRIGÉ
Configurez votre matériel dans cet ordre : 1) Échelles de performance, 2) Pratiques de notation, 3) Grilles de critères, 4) Productions. Chaque élément dépend du précédent.

**Voir aussi** : construction-productions, construction-grilles, construction-pratiques

---

## construction-productions

**Emplacement** : Construction de la note > Productions étudiantes > Titre "Productions étudiantes"

**Titre du modal** : Gérer les productions étudiantes

### Contenu

**[texte]**
Les productions représentent les travaux évalués (examens, devoirs, projets, etc.). Chaque production est associée à une grille de critères et contribue à la note finale selon sa pondération.

**[liste] Éléments clés d'une production**
- Titre : nom affiché dans les listes et rapports
- Type : catégorie (examen, travail pratique, quiz, etc.)
- Pondération : poids dans la note finale (ex: 20%)
- Grille : critères d'évaluation associés
- Date d'échéance : pour le suivi des remises

**[alerte - attention]**
La somme des pondérations de toutes les productions devrait totaliser 100%. Vérifiez le total affiché en bas de la liste.

**[conseil]**
Créez vos productions au début du trimestre pour avoir une vue d'ensemble de votre plan d'évaluation.

**Voir aussi** : construction-grilles, construction-pratiques

---

## construction-grilles

**Emplacement** : Construction de la note > Grilles de critères > Titre "Grilles de critères"

**Titre du modal** : Concevoir des grilles de critères

### Contenu

**[texte]**
Une grille définit les critères d'évaluation et leurs niveaux de performance. Elle permet une évaluation cohérente et génère automatiquement des rétroactions personnalisées.

**[liste] Structure d'une grille**
- Rubriques : grandes catégories (ex: Contenu, Forme, Langue)
- Critères : éléments spécifiques évalués dans chaque rubrique
- Échelle : niveaux de performance (ex: Insuffisant → Excellent)
- Descripteurs : description de chaque niveau pour chaque critère

**[exemple] Exemple de rubrique**
Rubrique « Argumentation » avec critères : Thèse claire, Arguments pertinents, Exemples appropriés, Structure logique.

**[conseil]**
Commencez avec 3-4 rubriques maximum. Une grille trop détaillée devient difficile à utiliser en contexte réel de correction.

**Voir aussi** : construction-echelles, evaluations-proceder

---

## construction-echelles

**Emplacement** : Construction de la note > Échelles de performance > Titre "Échelles de performance"

**Titre du modal** : Configurer les échelles de performance

### Contenu

**[texte]**
Les échelles définissent les niveaux de performance utilisés dans vos grilles. Elles permettent de traduire une appréciation qualitative en valeur numérique.

**[liste] Échelles prédéfinies disponibles**
- IDME (4 niveaux) : Insuffisant, En développement, Maîtrisé, Exemplaire
- Pourcentage (5 niveaux) : 0-20%, 20-40%, 40-60%, 60-80%, 80-100%
- Lettres (5 niveaux) : E, D, C, B, A
- Personnalisée : créez votre propre échelle

**[alerte - important]**
Modifier une échelle déjà utilisée dans des évaluations peut affecter les notes existantes. Créez plutôt une nouvelle échelle si nécessaire.

**[conseil]**
L'échelle IDME est recommandée pour débuter : ses 4 niveaux facilitent les décisions d'évaluation.

**Voir aussi** : construction-grilles, construction-pratiques

---

## construction-pratiques

**Emplacement** : Construction de la note > Pratiques de notation > Titre "Pratiques de notation"

**Titre du modal** : Choisir une pratique de notation

### Contenu

**[texte]**
La pratique de notation détermine comment les résultats des évaluations sont convertis en note finale. Deux grandes familles existent : Sommative (SOM) et Progressive par atteinte de niveaux (PAN).

**[liste] Pratique Sommative (SOM)**
- Calcul traditionnel : moyenne pondérée des productions
- Chaque évaluation compte selon sa pondération
- Simple à comprendre pour les étudiants
- Adapté aux cours avec évaluations indépendantes

**[liste] Pratique Progressive (PAN)**
- Basée sur l'atteinte de niveaux de compétence
- Les dernières performances peuvent remplacer les premières
- Utilise un système de jetons pour moduler
- Adapté à l'apprentissage progressif

**[exemple] Système de jetons (PAN)**
Les jetons permettent de valoriser l'engagement : présence, participation, amélioration. Ils peuvent bonifier la note ou débloquer des options.

**[alerte - attention]**
Changer de pratique en cours de trimestre recalcule toutes les notes. Informez vos étudiants de la méthode choisie dès le début.

**Voir aussi** : construction-productions, construction-echelles

---

# SECTION : RÉGLAGES

---

## reglages-trimestre

**Emplacement** : Réglages > Trimestre > Titre "Trimestre"

**Titre du modal** : Configurer le trimestre

### Contenu

**[texte]**
Les réglages du trimestre définissent le cadre de votre cours : dates, groupes, horaires. Ces paramètres influencent plusieurs fonctionnalités de l'application.

**[liste] Paramètres interdépendants**
- Dates de début/fin : cadrent le calendrier des présences
- Jours de cours : génèrent automatiquement les séances
- Groupes : organisent les étudiants et filtrent les vues
- Pratique de notation : détermine le calcul des notes

**[alerte - important]**
Modifier les dates après avoir saisi des données peut créer des incohérences. Configurez ces paramètres en début de trimestre.

**[conseil]**
Utilisez la fonction d'import pour récupérer la liste de vos étudiants depuis un fichier CSV exporté de Clara ou Omnivox.

**Voir aussi** : construction-pratiques, presences-saisie

---

# DÉPENDANCES IDENTIFIÉES (analyse du code)

## Vue d'ensemble - Séquence complète de configuration

```
PHASE 1 - CONFIGURATION INITIALE (Réglages)
├── 1. Trimestre (dates début/fin)        ← PREMIER - fondation
├── 2. Horaire (séances hebdomadaires)    ← Requiert trimestre
├── 3. Groupe-cours                        ← Requiert horaire
└── 4. Import des étudiants               ← Requiert groupe-cours

PHASE 2 - CONSTRUCTION DE LA NOTE
├── 1. Échelles de performance            ← Standalone
├── 2. Pratiques de notation              ← REQUIERT échelles
├── 3. Grilles de critères                ← Peut référencer pratiques
└── 4. Productions                        ← REQUIERT grilles

PHASE 3 - UTILISATION QUOTIDIENNE
├── Présences                             ← Requiert: étudiants + horaire + dates
├── Évaluations                           ← Requiert: étudiants + productions + grilles + échelles
└── Tableau de bord                       ← Affiche données de présences + évaluations
```

---

## Détail Phase 1 : Configuration initiale

| Élément | Dépendance | Message d'erreur si manquant |
|---------|------------|------------------------------|
| **Trimestre** | Aucune | - |
| **Horaire** | Trimestre | "⚠️ Aucune séance hebdomadaire configurée" |
| **Groupe-cours** | Horaire | "Sélectionnez un cours pour voir ses groupes" |
| **Étudiants** | Groupe-cours | "Aucun·e étudiant·e dans le groupe" |

---

## Détail Phase 2 : Construction de la note

| Élément | Dépendance | Message d'erreur si manquant |
|---------|------------|------------------------------|
| **Échelles** | Aucune | - |
| **Pratiques** | **Échelles** | "Créez d'abord une échelle" |
| **Grilles** | Optionnel (pratiques) | - |
| **Productions** | **Grilles** | Dropdown vide/désactivé |

---

## Détail Phase 3 : Utilisation quotidienne

| Fonction | Prérequis | Message d'erreur si manquant |
|----------|-----------|------------------------------|
| **Présences** | Étudiants + Horaire + Dates | "L'horaire des cours n'est pas configuré" |
| **Évaluations** | Étudiants + Productions + Grilles + Échelles | "⚠️ Aucune échelle configurée" |
| **Tableau de bord** | Données de présences et/ou évaluations | "En attente de données pour X étudiant(s)" |

---

# QUESTIONS POUR RÉVISION

1. **Séquence de configuration** : Les 3 phases identifiées sont-elles correctes et complètes ?

2. **Terminologie** : Les termes utilisés sont-ils corrects ? (ex: "Rubriques" vs autre terme)

3. **Flux de travail** : Les étapes décrites correspondent-elles à la pratique réelle ?

4. **Éléments manquants** : Y a-t-il des conseils importants qui manquent pour les novices ?
