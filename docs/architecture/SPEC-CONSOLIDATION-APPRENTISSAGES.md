# Spécification — Module «Consolidation des apprentissages»

**Date** : 7 avril 2026
**Statut** : Approuvé en CoWork, prêt pour implémentation
**Auteurs** : Grégoire Bédard + Claude (CoWork)

---

## 1. Objectif

Fournir des données empiriques pour valider le design curriculaire du portfolio A1-A10.

**Question centrale** : Les artefacts développent-ils durablement les critères SRPNF qu'ils sont censés cibler ?

**Questions secondaires** :
- La maîtrise acquise sur le premier cycle (œuvre 1, A1-A6) se transfère-t-elle sur le second cycle (Kanatuut, A7-A10) ?
- La pratique délibérée (complétion des artefacts antérieurs) prédit-elle une consolidation plus rapide ?
- Pour un individu donné, quels artefacts ont été déterminants dans sa consolidation de chaque critère ?

---

## 2. Modèle de données existant

### Évaluations sauvegardées
**Clé** : `cle('evaluationsSauvegardees')`

Chaque évaluation contient un tableau `criteres[]` :
```javascript
{
    critereId: string,
    critereNom: string,           // S, R, P, N, F
    niveauSelectionne: string,    // 'I' | 'D' | 'M' | 'E'
    retroaction: string,
    ponderation: number
}
```

### Conversion IDME → score numérique
```javascript
{ '0': 0.00, 'I': 0.40, 'D': 0.65, 'M': 0.75, 'E': 1.00 }
```

### Lien évaluation → artefact
Via `productionId` et `productionNom` dans l'objet évaluation.

### Lien évaluation → étudiant
Via `etudiantDA` dans l'objet évaluation.

---

## 3. Carte des artefacts et critères évalués

| Artefact | Type | S | R | P | N | F |
|----------|------|---|---|---|---|---|
| A1 | Stratégies lecture (œuvre 1) | ✓ | ✓ | ✓ | ✓ | — |
| A2 | Description personnage | ✓ | ✓ | ✓ | ✓ | ✓ |
| A3 | Carte mentale | ✓ | ✓ | ✓ | ✓ | — |
| A4 | Tableau HOC (œuvre 1) | ✓ | ✓ | ✓ | ✓ | ✓ |
| A5 | Plan de rédaction | ✓ | ✓ | ✓ | ✓ | — |
| A6 | Texte suivi | ✓ | ✓ | ✓ | ✓ | ✓ |
| A7 | Stratégies lecture (Kanatuut) | ✓ | ✓ | ✓ | ✓ | — |
| A8 | Tableau HOC (Kanatuut) | ✓ | ✓ | ✓ | ✓ | ✓ |
| A9 | Plan (Kanatuut) | ✓ | ✓ | ✓ | ✓ | — |
| A10 | Analyse finale (Kanatuut) | ✓ | ✓ | ✓ | ✓ | ✓ |

**Structure spiralaire** : Le parcours se répète sur deux cycles :
- Cycle 1 (œuvre 1) : A1-A6 (stratégies → description → carte mentale → HOC → plan → rédaction)
- Cycle 2 (Kanatuut) : A7-A10 (stratégies → HOC → plan → analyse finale)

Le module doit permettre de voir si la maîtrise acquise au cycle 1 se transfère au cycle 2.

---

## 4. Calcul fondamental — Taux de rétention de la maîtrise

### Définition

Pour chaque cellule **artefact × critère** :

1. Identifier les élèves qui atteignent **≥ 0.75 (M)** sur ce critère à cet artefact
2. Pour chacun de ces élèves, compter combien d'artefacts **suivants** maintiennent ≥ 0.75 sur ce critère
3. L'élève est considéré comme ayant **retenu la maîtrise** s'il maintient ≥ 0.75 sur **au moins 75%** des artefacts suivants (où ce critère est évalué)
4. Le **taux de rétention** = pourcentage d'élèves ayant retenu la maîtrise parmi ceux qui l'avaient atteinte

### Seuils d'interprétation (alignés IDME)

| Taux de rétention | Interprétation | Couleur |
|-------------------|----------------|---------|
| ≥ 0.75 | Consolidation durable | Vert foncé |
| 0.65 – 0.74 | Consolidation fragile | Vert clair |
| < 0.65 | Non consolidé | Rouge |

### Point de consolidation par critère

Pour chaque critère, le **point de consolidation** est le premier artefact à partir duquel ≥ 75% du groupe retient la maîtrise.

Si aucun artefact n'atteint ce seuil : « Non consolidé dans ce portfolio ».

### Cas particuliers

- **F (Français écrit)** : Évalué uniquement sur A2, A4, A6, A8, A10. Le calcul de rétention ne porte que sur les artefacts suivants où F est évalué. 
- **Artefacts tardifs** (A9, A10) : Peu ou pas d'artefacts suivants pour mesurer la rétention. Afficher le score mais ne pas calculer de taux de rétention (ou l'afficher avec un avertissement « données insuffisantes »).
- **Élève n'ayant pas atteint M** : Non inclus dans le calcul du taux de rétention pour cette cellule. Le *n* affiché reflète uniquement les élèves qui ont atteint M.

---

## 5. Couche prérequis (pratique délibérée)

### Objectif

Évaluer si la complétion des artefacts antérieurs prédit une consolidation plus rapide ou plus durable.

### Calcul

Pour chaque cellule artefact × critère, segmenter les élèves en deux groupes :
- **Groupe A** : A complété tous les artefacts précédents
- **Groupe B** : A sauté au moins un artefact antérieur

Comparer le taux de rétention entre les deux groupes.

### Contraintes d'affichage

- Afficher le *n* de chaque sous-groupe
- **Avertissement visuel** quand *n* < 5 dans l'un des groupes (résultat non fiable)
- Accessible via un **toggle** (couche optionnelle, pas affichée par défaut)

---

## 6. Vue groupe — Matrice de consolidation (Labo > Suivi)

### Emplacement

Section « Suivi » du Labo, sous-section dédiée (nouveau sous-onglet ou section dans `suivi-labo`).

### Composants visuels

#### 6.1 Matrice principale

Grille **10 lignes × 5 colonnes** :
- **Lignes** : A1 à A10 (avec le type d'artefact en libellé)
- **Colonnes** : S, R, P, N, F

Chaque cellule affiche :
- Le **taux de rétention** (ex: « 78% »)
- Le ***n*** entre parenthèses (ex: « (n=24) »)
- **Couleur de fond** selon les seuils (vert foncé / vert clair / rouge)
- Cellules F sur A1, A3, A5, A7, A9 : **grisées** avec « n/a »
- Cellules A9-A10 : afficher le score moyen du groupe avec mention « rétention non mesurable » (pas assez d'artefacts suivants)

#### 6.2 Ligne de synthèse (point de consolidation)

En bas de chaque colonne de critère :
- **« Consolidé : A3 »** si un point de consolidation est identifié
- **« Non consolidé »** si aucun artefact n'atteint le seuil

#### 6.3 Toggle prérequis

Bouton toggle « Comparer prérequis » qui dédouble chaque cellule :
- Taux de rétention du Groupe A (tous artefacts précédents complétés)
- Taux de rétention du Groupe B (au moins un sauté)
- Delta entre les deux
- Avertissement si *n* < 5

### Interactions

- **Survol d'une cellule** : Tooltip avec le détail (nombre d'élèves ayant atteint M, nombre ayant retenu, liste optionnelle des artefacts suivants considérés)
- **Clic sur une cellule** : (À définir — possiblement un drill-down vers la liste d'élèves concernés)

---

## 7. Vue individuelle — Profil étudiant (Développement des habiletés)

### Emplacement

Section « Développement des habiletés et compétences » du profil étudiant, en complément du graphique de trajectoire existant.

### Composants visuels

#### 7.1 Marqueurs sur le graphique de trajectoire

Sur chaque ligne de critère du graphique existant (Chart.js), ajouter un **indicateur visuel** au point de consolidation individuel :
- Marqueur distinctif (point plus gros, icône, changement de style de ligne) à l'artefact où la consolidation s'amorce
- Si non consolidé : pas de marqueur (le graphique montre naturellement l'instabilité)

**Détail technique** : Le point de consolidation individuel se calcule de la même façon que le groupe, mais pour un seul élève : premier artefact où l'élève atteint ≥ 0.75 et maintient ≥ 0.75 sur ≥ 75% des artefacts suivants.

#### 7.2 Résumé textuel sous le graphique

Bloc de texte structuré, critère par critère :

**Quand consolidé** :
> « **S** : consolidé à A3 (carte mentale) — maintenu sur 5/6 artefacts suivants »

**Quand non consolidé avec tentatives** :
> « **P** : non consolidé — atteint M à 3 reprises sans rétention »

**Quand jamais atteint M** :
> « **N** : M non atteint dans ce portfolio »

**Format** : Une ligne par critère (S, R, P, N, F). L'artefact déterminant est nommé par son type (carte mentale, texte suivi...) pas juste son numéro — pour que l'enseignant voie immédiatement le lien pédagogique.

---

## 8. Limites connues et transparence

Ces limites doivent être documentées et, si pertinent, visibles dans l'interface.

### Biais de sélection
Les élèves qui atteignent M tôt sont probablement les plus forts au départ. Le taux de rétention ne prouve pas que l'artefact *cause* la consolidation. C'est un constat empirique, pas une inférence causale.

### Taille d'échantillon
Avec ~45 élèves par groupe, les sous-groupes peuvent être petits. Le *n* est toujours affiché. Les résultats avec *n* < 5 sont signalés comme non fiables.

### Artefacts tardifs
A9 et A10 n'ont pas ou peu d'artefacts suivants pour mesurer la rétention. Les traiter différemment dans l'affichage.

### Non-linéarité de l'apprentissage
L'apprentissage réel n'est pas linéaire. Le seuil de rétention à 75% (et non 100%) des artefacts suivants tient compte de cette réalité empirique.

---

## 9. Architecture d'implémentation suggérée

### Nouveau fichier
`js/consolidation.js` — Moteur de calcul et logique du module.

### Fichiers à modifier
- `js/profil-etudiant.js` — Ajouter marqueurs de consolidation sur le graphique + résumé textuel
- `js/navigation.js` — Ajouter l'accès à la vue groupe dans Suivi (si nouveau sous-onglet)
- `styles.css` — Styles pour la matrice de consolidation, les marqueurs, le résumé
- `index.html` — Conteneur HTML pour la vue groupe

### Principes à respecter
- **SSOT** : Le calcul de consolidation se fait UNIQUEMENT dans `consolidation.js`
- **Communication indirecte** : Lit les données de `evaluationsSauvegardees` via `cle()`, ne modifie rien
- **Namespacing** : Toutes les clés via `window.cle()`
- **Sécurité** : `echapperHtml()` pour tout contenu dynamique, zéro handler inline
- **Design system** : Variables CSS de `styles.css`, conformité modes sombre et clair
- **Chart.js** : Le graphique de trajectoire existant utilise Chart.js — les marqueurs doivent s'intégrer via l'API Chart.js (plugin annotation ou dataset supplémentaire)

### Ordre d'implémentation suggéré
1. `consolidation.js` — Moteur de calcul (testable indépendamment)
2. Vue groupe — Matrice de consolidation dans Suivi
3. Vue individuelle — Marqueurs + résumé dans le profil étudiant
4. Couche prérequis — Toggle comparatif (dernière priorité)

---

## 10. Critères de validation

Le module est considéré fonctionnel quand :

- [ ] La matrice de consolidation affiche des données cohérentes pour au moins un groupe avec des évaluations complètes
- [ ] Les seuils de couleur correspondent aux valeurs IDME définies
- [ ] Le point de consolidation par critère est calculé et affiché
- [ ] Le profil étudiant montre les marqueurs de consolidation sur le graphique existant
- [ ] Le résumé textuel sous le graphique est généré pour chaque critère
- [ ] Les cas « non consolidé — atteint M à N reprises sans rétention » sont correctement identifiés
- [ ] Le *n* est affiché partout
- [ ] Les cellules F sont grisées sur les artefacts appropriés (A1, A3, A5, A7, A9)
- [ ] A9-A10 sont traités comme cas particuliers (rétention non mesurable)
- [ ] Le toggle prérequis fonctionne avec avertissement pour *n* < 5
- [ ] Conformité design system (modes sombre et clair)
- [ ] Zéro innerHTML sans `echapperHtml()`, zéro handler inline
