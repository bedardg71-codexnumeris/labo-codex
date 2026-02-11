# Implémentation des tooltips — Tableau de bord > Interventions RàI

**Scope** : Sous-onglet Interventions RàI du Tableau de bord (liste + formulaire, 9 clés)
**Prérequis** : Le moteur `tooltips.js` et le CSS `tooltips.css` doivent être en place (voir plan principal).
**Action** : Ajouter les clés dans `tooltips-contenu.js` et les attributs `data-tooltip` dans le HTML.

**Note** : Le sous-onglet Interventions RàI comporte un formulaire de planification avec cases à cocher, champs de texte et sélecteurs. Les tooltips ne doivent pas interférer avec la saisie des données ni avec les boutons d'action (Consulter, Supprimer, Planifier).

---

## Clés à ajouter dans tooltips-contenu.js

```javascript
    // =================================================================
    // TABLEAU DE BORD — Interventions RàI
    // =================================================================

    'interv-titre':
        'Planification et suivi des interventions RàI de niveaux 2 et 3. Créer, consulter et documenter.',

    'interv-btn-planifier':
        'Créer une nouvelle intervention de niveau 2 (préventif) ou 3 (intensif) pour un groupe ou un individu.',

    'interv-carte':
        'Fiche d\'une intervention : statut, niveau, aperçu du sous-groupe (patterns, RàI, notes individuelles).',

    'interv-apercu-sous-groupe':
        'Agrégation des profils du sous-groupe : patterns d\'apprentissage, niveaux RàI et notes individuelles.',

    'interv-patterns':
        'Répartition des patterns détectés dans le sous-groupe ciblé par l\'intervention.',

    'interv-niveaux-rai':
        'Répartition des niveaux RàI (1, 2, 3) dans le sous-groupe ciblé par l\'intervention.',

    'interv-notes-individuelles':
        'Observations de l\'enseignant pour chaque étudiant lors de l\'intervention.',

    'interv-gestion-absences':
        'Lier l\'intervention à une séance. Les non-participants sont marqués absents motivés (congé).',

    'interv-presences-notes':
        'Cocher les présents et documenter les observations individuelles. Le badge indique le niveau RàI.',
```

---

## Cartographie HTML — où placer les data-tooltip

### Page principale (liste des interventions)

| Clé | Élément cible |
|-----|---------------|
| `interv-titre` | Titre « Planification et documentation des interventions » |
| `interv-btn-planifier` | Bouton « Planifier une intervention » |
| `interv-carte` | Titre/en-tête de chaque carte d'intervention (ex. : « Intervention niveau 2 (1er déc.) ») |
| `interv-apercu-sous-groupe` | Titre « Aperçu du sous-groupe (N étudiant·e·s) » |
| `interv-patterns` | Titre « Patterns d'apprentissage » dans l'aperçu |
| `interv-niveaux-rai` | Titre « Niveaux RàI » dans l'aperçu |
| `interv-notes-individuelles` | Titre « Notes individuelles » dans l'aperçu |

### Formulaire de consultation / planification

| Clé | Élément cible |
|-----|---------------|
| `interv-gestion-absences` | Titre « Gestion des absences » ou conteneur de la carte |
| `interv-presences-notes` | Titre « Marquer les présences et notes individuelles » |

---

## Règles de placement

- Pour le **bouton « Planifier une intervention »** : placer `data-tooltip` sur le bouton lui-même. Le tooltip disparaît au clic (masquage instantané) et n'empêche pas l'action.
- Pour les **cartes d'intervention** : placer `data-tooltip` sur le **titre/en-tête** de la carte (ex. : « Intervention niveau 2 (1er déc.) »), pas sur les badges ni sur les boutons Consulter/Supprimer.
- Pour les **trois sous-cartes de l'aperçu** (Patterns, Niveaux RàI, Notes individuelles) : placer `data-tooltip` sur le **titre** de chaque sous-carte, pas sur les badges colorés ni sur les notes individuelles.
- Pour la **Gestion des absences** : placer `data-tooltip` sur le titre de la section, pas sur la case à cocher « Marquer les non-participants... » qui doit rester cochable sans interférence.
- Pour la **section Présences et notes** : placer `data-tooltip` sur le titre de la section, pas sur les cases de présence individuelles ni sur les champs de texte.
- Les boutons **Consulter** et **Supprimer** ne reçoivent pas de tooltip — leurs labels sont auto-explicatifs.
- La clé `interv-carte` est réutilisée sur chaque carte d'intervention de la liste (même tooltip pour toutes les cartes).

---

## Vérification

- [ ] 9 tooltips apparaissent au survol des éléments ciblés
- [ ] Le bouton « Planifier une intervention » reste cliquable
- [ ] Les boutons Consulter et Supprimer de chaque carte restent fonctionnels
- [ ] Les badges de statut (Complétée, Groupe, Niveau 2, etc.) restent lisibles
- [ ] Les cases de présence dans le formulaire restent cochables
- [ ] Les champs de note individuelle dans le formulaire restent éditables
- [ ] Le sélecteur de séance (Gestion des absences) reste fonctionnel
- [ ] La case « Marquer les non-participants... » reste cochable
