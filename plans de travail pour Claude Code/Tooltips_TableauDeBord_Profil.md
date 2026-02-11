# Implémentation des tooltips — Tableau de bord > Profil

**Scope** : Sous-onglet Profil du Tableau de bord (panneau latéral + 7 vues d'observation + 1 modale, 20 clés)
**Prérequis** : Le moteur `tooltips.js` et le CSS `tooltips.css` doivent être en place (voir plan principal).
**Action** : Ajouter les clés dans `tooltips-contenu.js` et les attributs `data-tooltip` dans le HTML.

**Note** : Le Profil comporte un graphique Chart.js (Progression temporelle), des boutons de navigation entre vues, et une modale d'informations confidentielles. Les tooltips ne doivent pas interférer avec les interactions Chart.js, la navigation entre vues, ni avec les contrôles de formulaire de la modale.

---

## Clés à ajouter dans tooltips-contenu.js

```javascript
    // =================================================================
    // TABLEAU DE BORD — Profil
    // =================================================================

    // --- Panneau latéral ---

    'profil-selecteur':
        'Choisir un étudiant. Les boutons Préc./Suiv. parcourent la liste séquentiellement.',

    'profil-nav-observations':
        'Sept vues d\'observation : productions, engagement, progression, habiletés, accompagnement, travaux, rapport.',

    // --- Vue Productions ---

    'profil-productions':
        'Liste des artefacts avec description, jeton, note, date et accès direct à l\'évaluation.',

    'profil-col-jeton':
        'Jeton de reprise : permet à l\'étudiant de reprendre un artefact pour améliorer son résultat.',

    // --- Vue Engagement ---

    'profil-engagement':
        'Trois composantes (A, C, P) et calcul de l\'engagement E = ∛(A × C × P). Barre de positionnement dans les zones.',

    'profil-formule-engagement':
        'E = ∛(A × C × P). Moyenne géométrique : un indice très bas tire l\'engagement vers le bas même si les autres sont élevés.',

    // --- Vue Progression temporelle ---

    'profil-progression':
        'Évolution des indices A-C-P au fil des semaines. Zones : Insuffisant, En Développement, Maîtrisé, Étendu.',

    // --- Vue Développement des habiletés ---

    'profil-habiletes':
        'Performance du portfolio et forces/défis par critère. Nécessite la configuration d\'une grille de référence.',

    // --- Vue Accompagnement ---

    'profil-accompagnement':
        'Analyse RàI, contexte d\'apprentissage, structure SOLO et historique des interventions.',

    'profil-accomp-rai':
        'Performance globale et progression par critère. Détermine le niveau d\'intervention suggéré.',

    'profil-accomp-contexte':
        'Assiduité et complétion de l\'étudiant. Interprétation du contexte après les premières remises.',

    'profil-accomp-solo':
        'Analyse des réponses selon la taxonomie SOLO (Biggs & Collis). Identifie forces et défis structurels.',

    // --- Modale Informations confidentielles ---

    'profil-confidentiel':
        'Données confidentielles stockées localement : parcours, défis, portrait de lecteur, diagnostic, notes.',

    'profil-conf-parcours':
        'ÉPGC (1re génération cégep) et historique du cours antérieur.',

    'profil-conf-lecteur':
        'Évaluation des compétences de lecture : structure, rigueur, plausibilité, nuance, français.',

    'profil-conf-diagnostic':
        'Services adaptés, catégorie et sous-catégorie du diagnostic. Confidentiel.',

    // --- Historique des interventions ---

    'profil-historique':
        'Interventions RàI documentées pour cet étudiant. Créer une nouvelle intervention depuis le profil.',

    // --- Vue Travaux soumis ---

    'profil-travaux':
        'Travaux soumis par l\'étudiant. Les fichiers sont importés depuis Travaux > Import.',

    // --- Vue Rapport ---

    'profil-rapport':
        'Rapport textuel configurable. Cocher les sections à inclure et copier dans le presse-papier.',

    'profil-rapport-sections':
        'Cocher les sections souhaitées : Identification, Assiduité, Complétion, Performance, Jetons, Date.',
```

---

## Cartographie HTML — où placer les data-tooltip

### Panneau latéral

| Clé | Élément cible |
|-----|---------------|
| `profil-selecteur` | Label « Étudiant·e : » ou conteneur du sélecteur + boutons Préc./Suiv. |
| `profil-nav-observations` | Titre « OBSERVATIONS » au-dessus des boutons de navigation |

### Vue Productions et évaluations

| Clé | Élément cible |
|-----|---------------|
| `profil-productions` | Titre « Productions et évaluations » |
| `profil-col-jeton` | En-tête de colonne « Jeton » dans le `<th>` |

### Vue Engagement

| Clé | Élément cible |
|-----|---------------|
| `profil-engagement` | Titre « Engagement » |
| `profil-formule-engagement` | Texte de la formule « Formule : E = ∛(A × C × P) » ou le conteneur du calcul |

### Vue Progression temporelle

| Clé | Élément cible |
|-----|---------------|
| `profil-progression` | Titre « Progression temporelle » |

### Vue Développement des habiletés

| Clé | Élément cible |
|-----|---------------|
| `profil-habiletes` | Titre « Développement des habiletés et compétences » |

### Vue Accompagnement

| Clé | Élément cible |
|-----|---------------|
| `profil-accompagnement` | Titre « Accompagnement » |
| `profil-accomp-rai` | Titre de la carte « Modèle de la Réponse à l'Intervention (RàI) » |
| `profil-accomp-contexte` | Titre de la carte « Contexte d'apprentissage » |
| `profil-accomp-solo` | Titre de la carte « Observation de la structure des résultats d'apprentissage » |
| `profil-historique` | Titre « HISTORIQUE » ou conteneur de la section historique des interventions |

### Modale Informations confidentielles

| Clé | Élément cible |
|-----|---------------|
| `profil-confidentiel` | Titre « Informations confidentielles » de la modale (ou le bouton « Confidentiel » qui l'ouvre) |
| `profil-conf-parcours` | Titre « Parcours » dans la modale |
| `profil-conf-lecteur` | Titre « Portrait de lecteur » dans la modale |
| `profil-conf-diagnostic` | Titre « Diagnostic » dans la modale |

### Vue Travaux soumis

| Clé | Élément cible |
|-----|---------------|
| `profil-travaux` | Titre « Travaux soumis » |

### Vue Rapport

| Clé | Élément cible |
|-----|---------------|
| `profil-rapport` | Titre « Rapport » |
| `profil-rapport-sections` | Titre « SECTIONS À INCLURE » |

---

## Règles de placement

- Pour le **sélecteur d'étudiant·e** : placer `data-tooltip` sur le label « Étudiant·e : », pas sur le `<select>` qui doit s'ouvrir librement. Les boutons Préc./Suiv. ne reçoivent pas de tooltip individuel — le tooltip du label couvre leur fonctionnement.
- Pour les **boutons de navigation OBSERVATIONS** : placer `data-tooltip` sur le titre « OBSERVATIONS », pas sur chaque bouton individuel. Chaque bouton porte un label clair (« Productions », « Engagement », etc.) qui est auto-explicatif. Le clic pour changer de vue doit rester fluide.
- Pour les **titres de vue** (Productions, Engagement, Progression...) : placer `data-tooltip` directement sur le titre `<h2>` ou `<h3>`. Ce sont des éléments non interactifs.
- Pour le **graphique Progression temporelle** (Chart.js) : le tooltip système est sur le titre, pas sur le graphique. Chart.js gère ses propres tooltips au survol des courbes.
- Pour les **cartes Accompagnement** (RàI, Contexte, SOLO) : placer `data-tooltip` sur le **titre de la carte**, pas sur le contenu dynamique qui change selon les données.
- Pour la **modale Informations confidentielles** : placer `data-tooltip` sur les titres de section à l'intérieur de la modale. Le tooltip sur le titre principal de la modale n'apparaît que lorsque la modale est ouverte. Le bouton « Confidentiel » (qui ouvre la modale) peut recevoir le `data-tooltip` à la place du titre de la modale si c'est plus pertinent dans le DOM.
- Pour le **bouton Copier** (Vue Rapport) : pas de tooltip, le label est auto-explicatif.

---

## Vérification

- [ ] 20 tooltips apparaissent au survol des éléments ciblés
- [ ] Le sélecteur d'étudiant·e s'ouvre normalement
- [ ] Les boutons Préc./Suiv. fonctionnent sans interférence
- [ ] Les 7 boutons de navigation OBSERVATIONS changent de vue au clic
- [ ] Le graphique Chart.js (Progression temporelle) affiche ses tooltips natifs au survol des courbes
- [ ] Les tooltips de la modale Informations confidentielles apparaissent correctement dans la modale
- [ ] Le bouton Évaluer (vue Productions) reste cliquable
- [ ] Le bouton Copier (vue Rapport) fonctionne sans interférence
- [ ] Les cases à cocher (Sections à inclure, Défis particuliers) restent cochables
- [ ] Les curseurs du Portrait de lecteur restent manipulables
