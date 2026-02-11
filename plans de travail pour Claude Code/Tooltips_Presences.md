# Implémentation des tooltips — Présences (Aperçu + Calendrier)

**Scope** : Module Présences complet (2 sous-onglets, 8 clés)
**Prérequis** : Le moteur `tooltips.js` et le CSS `tooltips.css` doivent être en place (voir plan principal).
**Action** : Ajouter les clés dans `tooltips-contenu.js` et les attributs `data-tooltip` dans le HTML.

**Note** : Les deux sous-onglets sont relativement simples (cartes de statistiques + grilles calendrier). Le calendrier ne comporte pas d'éléments interactifs complexes — les tooltips s'appliquent aux titres de section et aux cartes.

---

## Clés à ajouter dans tooltips-contenu.js

```javascript
    // =================================================================
    // PRÉSENCES — Aperçu
    // =================================================================

    'pres-apercu':
        'Statistiques synthétiques : taux d\'assiduité moyen, séances données, prochaine séance et nombre d\'élèves.',

    'pres-stats-groupe':
        'Indicateurs clés du groupe-cours : assiduité, avancement du trimestre et effectif.',

    'pres-taux-assiduite':
        'Moyenne des taux de présence individuels. Correspond à l\'indice A (Assiduité) du Tableau de bord.',

    'pres-seances-donnees':
        'Séances effectivement données sur le total planifié. Indique l\'avancement du trimestre.',

    // =================================================================
    // PRÉSENCES — Calendrier
    // =================================================================

    'pres-calendrier':
        'Calendrier du trimestre avec les séances de cours, congés et reprises.',

    'pres-vue-calendrier':
        'Résumé du trimestre : semaines scolaires, jours de cours et congés ayant entraîné une reprise.',

    'pres-conges-reprises':
        'Jours de congé ayant entraîné le déplacement d\'une séance à une autre date du trimestre.',

    'pres-grille-mensuelle':
        'Jours de cours en bleu avec numéro de semaine. Congés et reprises marqués en couleur.',
```

---

## Cartographie HTML — où placer les data-tooltip

### Sous-onglet Aperçu

| Clé | Élément cible |
|-----|---------------|
| `pres-apercu` | Titre « Aperçu des présences » |
| `pres-stats-groupe` | Bandeau « Statistiques du groupe » (en-tête sombre de la section) |
| `pres-taux-assiduite` | Titre « Taux d'assiduité moyen du groupe » sur la carte |
| `pres-seances-donnees` | Titre « Séances données » sur la carte |

### Sous-onglet Calendrier

| Clé | Élément cible |
|-----|---------------|
| `pres-calendrier` | Titre « Calendrier des présences » |
| `pres-vue-calendrier` | En-tête « Vue calendrier » ou conteneur des 3 cartes de résumé |
| `pres-conges-reprises` | Titre « Congés avec reprises » sur la carte |
| `pres-grille-mensuelle` | Conteneur des grilles mensuelles (la zone englobant tous les mois) |

---

## Règles de placement

- Pour les **cartes de statistiques** (Aperçu et Calendrier) : placer `data-tooltip` sur le **texte descriptif** de la carte (ex. : « Taux d'assiduité moyen du groupe »), pas sur la valeur numérique elle-même.
- Les cartes **Prochaine séance** et **Élèves** dans l'Aperçu ne reçoivent pas de tooltip — leurs labels sont auto-explicatifs et ne requièrent pas d'explication pédagogique.
- De même, **Semaines scolaires** et **Jours de cours** dans le Calendrier sont auto-explicatifs.
- Pour les **grilles mensuelles** : placer `data-tooltip` sur le **conteneur englobant** toutes les grilles, pas sur chaque mois individuellement ni sur les cellules de jour.
- Les **cellules de jour** du calendrier (avec leur marquage de cours, congé ou reprise) ne reçoivent pas de tooltip individuel — elles sont trop nombreuses et granulaires.
- Le **numéro de semaine** (ex. : « Sem. 1 ») dans les cellules ne reçoit pas de tooltip.

---

## Vérification

- [ ] 8 tooltips apparaissent au survol des éléments ciblés
- [ ] Les cartes de statistiques restent lisibles (le tooltip ne masque pas les valeurs)
- [ ] Le positionnement latéral (droite → gauche) est adapté aux cartes alignées horizontalement
- [ ] Le calendrier reste navigable sans interférence des tooltips
- [ ] Le tooltip sur la grille mensuelle se positionne correctement malgré la grande taille du conteneur
