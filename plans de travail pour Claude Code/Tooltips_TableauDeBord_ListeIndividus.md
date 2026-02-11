# Implémentation des tooltips — Tableau de bord > Liste des individus

**Scope** : Sous-onglet Liste des individus du Tableau de bord (1 vue tableau, 7 clés)
**Prérequis** : Le moteur `tooltips.js` et le CSS `tooltips.css` doivent être en place (voir plan principal).
**Action** : Ajouter les clés dans `tooltips-contenu.js` et les attributs `data-tooltip` dans le HTML.

**Note** : La Liste des individus est un tableau triable avec filtres. Les `data-tooltip` ne doivent pas interférer avec le tri des colonnes (clic sur les en-têtes) ni avec l'ouverture des sélecteurs de filtres.

---

## Clés à ajouter dans tooltips-contenu.js

```javascript
    // =================================================================
    // TABLEAU DE BORD — Liste des individus
    // =================================================================

    'liste-titre':
        'Liste complète des étudiants avec indices A-C-E-P, patterns et niveaux RàI. Filtrable et triable.',

    'liste-filtres':
        'Filtrer par groupe, programme, niveau RàI ou pattern. Le champ recherche accepte nom, prénom ou DA.',

    'liste-filtre-rai':
        'Filtrer par niveau d\'intervention : Tous, Niveau 1 (universel), Niveau 2 (préventif), Niveau 3 (intensif).',

    'liste-filtre-pattern':
        'Filtrer par trajectoire détectée : progression stable, défi spécifique, blocage émergent ou critique.',

    'liste-recherche':
        'Rechercher un étudiant par nom, prénom ou numéro d\'admission (DA).',

    'liste-col-sa':
        'Services adaptés. Une coche indique que l\'étudiant bénéficie d\'un plan de services.',

    'liste-col-interv':
        'Interventions documentées pour cet étudiant. Cliquer pour consulter l\'historique.',
```

---

## Cartographie HTML — où placer les data-tooltip

### En-tête et filtres

| Clé | Élément cible |
|-----|---------------|
| `liste-titre` | Titre « Liste des étudiant·es » ou barre de section « Étudiant·es inscrit·es » |
| `liste-filtres` | Conteneur de la barre de filtres (la rangée contenant les 4 sélecteurs + recherche) |
| `liste-filtre-rai` | Label « Niveau RàI » au-dessus du sélecteur |
| `liste-filtre-pattern` | Label « Pattern d'apprentissage » au-dessus du sélecteur |
| `liste-recherche` | Label « Recherche » au-dessus du champ de texte |

### Colonnes du tableau

| Clé | Élément cible |
|-----|---------------|
| `liste-col-sa` | En-tête de colonne « SA » dans le `<th>` |
| `liste-col-interv` | En-tête de colonne « Interv. » dans le `<th>` |

---

## Règles de placement

- Pour les **filtres** : placer `data-tooltip` sur le **label** au-dessus du sélecteur, pas sur le `<select>` lui-même qui doit s'ouvrir librement. Les filtres Groupe et Programme sont auto-explicatifs ; seuls RàI et Pattern bénéficient d'un tooltip car ce sont des concepts pédagogiques spécifiques.
- Pour les **en-têtes de colonne** : placer `data-tooltip` sur l'élément `<th>`. Le clic pour trier doit rester fonctionnel — le tooltip disparaît au clic (masquage instantané). Les colonnes d'indices (A, C, P, E) sont déjà documentées dans la section Aperçu et ne nécessitent pas de tooltip ici.
- Pour le **champ de recherche** : placer `data-tooltip` sur le label, pas sur le `<input>`.
- Le bouton **Réinitialiser** est auto-explicatif et ne reçoit pas de tooltip.

---

## Vérification

- [ ] 7 tooltips apparaissent au survol des éléments ciblés
- [ ] Les sélecteurs de filtre s'ouvrent normalement
- [ ] Le tri des colonnes par clic sur l'en-tête reste fonctionnel
- [ ] Le champ de recherche reste focalisable et utilisable
- [ ] Le clic sur une ligne du tableau pour accéder au profil n'est pas perturbé
- [ ] Le bouton Réinitialiser fonctionne sans interférence
