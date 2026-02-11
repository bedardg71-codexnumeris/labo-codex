# Implémentation des tooltips — Évaluations > Aperçu + Liste des évaluations

**Scope** : Sous-onglets Aperçu et Liste des évaluations du module Évaluations (7 clés)
**Prérequis** : Le moteur `tooltips.js` et le CSS `tooltips.css` doivent être en place (voir plan principal).
**Action** : Ajouter les clés dans `tooltips-contenu.js` et les attributs `data-tooltip` dans le HTML.

**Note** : La Liste des évaluations est un tableau triable avec boutons d'action. Les `data-tooltip` ne doivent pas interférer avec le tri ni avec les boutons Consulter / Évaluer / Dossier PDF.

---

## Clés à ajouter dans tooltips-contenu.js

```javascript
    // =================================================================
    // ÉVALUATIONS — Aperçu
    // =================================================================

    'eval-apercu':
        'Statistiques synthétiques : taux de complétion moyen, productions réalisées et productions configurées.',

    'eval-stats-groupe':
        'Indicateurs clés du groupe-cours : complétion, productions réalisées et nombre d\'artefacts configurés.',

    'eval-taux-completion':
        'Moyenne des taux de remise individuels. Correspond à l\'indice C (Complétion) du Tableau de bord.',

    // =================================================================
    // ÉVALUATIONS — Liste des évaluations
    // =================================================================

    'eval-liste':
        'Toutes les évaluations du groupe : résultats, niveaux IDME, jetons et accès aux dossiers PDF.',

    'eval-liste-resume':
        'Résultats totaux, évaluations recevables (exclut les non-recevables), moyenne du groupe et nombre de productions.',

    'eval-col-jeton':
        'Type de jeton : I = Initial, D = Délai, R = Reprise, RC = Reprise ciblée. Mécanisme de différenciation.',

    'eval-col-niveau':
        'Niveau IDME : I = Insuffisant, D = en Développement, M = Maîtrisé, E = Étendu.',
```

---

## Cartographie HTML — où placer les data-tooltip

### Sous-onglet Aperçu

| Clé | Élément cible |
|-----|---------------|
| `eval-apercu` | Titre « Aperçu des évaluations » |
| `eval-stats-groupe` | Bandeau « Statistiques du groupe » (en-tête sombre de la section) |
| `eval-taux-completion` | Titre « Taux de complétion moyen » sur la carte |

### Sous-onglet Liste des évaluations

| Clé | Élément cible |
|-----|---------------|
| `eval-liste` | Titre ou conteneur principal de la page Liste des évaluations |
| `eval-liste-resume` | Ligne résumé en haut du tableau (« 320 résultat(s) (281 évaluation(s) recevable(s)) Moyenne : 71.9% 10 production(s) ») |
| `eval-col-jeton` | En-tête de colonne « Jeton » dans le `<th>` |
| `eval-col-niveau` | En-tête de colonne « Niveau » dans le `<th>` |

---

## Règles de placement

- Pour les **cartes de statistiques** (Aperçu) : placer `data-tooltip` sur le **texte descriptif** de la carte, pas sur la valeur numérique.
- Les cartes **Productions réalisées** et **Productions configurées** sont auto-explicatives et ne reçoivent pas de tooltip.
- Pour le **résumé en haut de la liste** : placer `data-tooltip` sur le conteneur de la ligne résumé. Le concept d'«évaluations recevables» mérite une explication.
- Pour les **en-têtes de colonne** : placer `data-tooltip` sur le `<th>`. Le clic pour trier doit rester fonctionnel (masquage instantané au clic).
- Les colonnes **DA**, **Nom**, **Prénom**, **Production** et **Note %** sont auto-explicatives.
- Les boutons **Consulter**, **Évaluer** et **Dossier PDF** ne reçoivent pas de tooltip — leurs labels sont explicites.

---

## Vérification

- [ ] 7 tooltips apparaissent au survol des éléments ciblés
- [ ] Le tri des colonnes par clic sur l'en-tête reste fonctionnel
- [ ] Les boutons Consulter, Évaluer et Dossier PDF restent cliquables
- [ ] Le positionnement latéral (droite → gauche) est adapté aux cartes de l'Aperçu
