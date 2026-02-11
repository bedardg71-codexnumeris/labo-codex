# Implémentation des tooltips — Évaluations > Évaluer une production

**Scope** : Sous-onglet Évaluer une production du module Évaluations (17 clés)
**Prérequis** : Le moteur `tooltips.js` et le CSS `tooltips.css` doivent être en place (voir plan principal).
**Action** : Ajouter les clés dans `tooltips-contenu.js` et les attributs `data-tooltip` dans le HTML.

**Note** : L'interface d'évaluation comporte de nombreux sélecteurs déroulants, champs de saisie et zones de texte éditable. Les `data-tooltip` doivent être placés sur les **labels**, jamais sur les `<select>`, `<input>` ou `<textarea>` eux-mêmes, pour ne pas interférer avec l'interaction.

---

## Clés à ajouter dans tooltips-contenu.js

```javascript
    // =================================================================
    // ÉVALUATIONS — Évaluer une production
    // =================================================================

    // --- Paramètres (panneau gauche) ---

    'eval-page':
        'Interface d\'évaluation critériée. Sélectionner les paramètres à gauche, évaluer et prévisualiser la rétroaction à droite.',

    'eval-grille':
        'Grille critériée avec pondérations. Détermine les critères affichés pour l\'évaluation.',

    'eval-echelle':
        'Échelle de conversion pourcentage → niveau IDME. Seuils configurables dans Réglages.',

    'eval-cartouche':
        'Modèle de rétroaction automatique adapté au type de production. Détermine le vocabulaire et le ton des commentaires.',

    'eval-statut-remise':
        'Indiquer si la production a été remise. Conditionne le calcul de l\'indice de complétion (C).',

    'eval-integrite':
        'Recevable ou non. Les travaux non recevables sont exclus des calculs de moyenne.',

    'eval-jetons':
        'Délai (orange), Reprise (vert) ou Reprise ciblée (violet). Permet à l\'étudiant de démontrer sa progression.',

    'eval-jeton-delai':
        'Prolonge l\'échéance de remise. L\'évaluation porte sur la même production, remise plus tard.',

    'eval-jeton-reprise':
        'L\'étudiant reprend entièrement la production. La nouvelle évaluation remplace la note.',

    'eval-jeton-reprise-ciblee':
        'L\'étudiant reprend un aspect spécifique ciblé par l\'enseignant. Le niveau IDME peut être ajusté.',

    'eval-note-finale':
        'Résultat calculé en temps réel : pourcentage pondéré et niveau IDME correspondant.',

    // --- Zone d'évaluation (panneau droit) ---

    'eval-retroaction':
        'Rétroaction générée automatiquement. Modifier le texte si nécessaire, puis copier dans le presse-papier.',

    'eval-retroaction-options':
        'Sections à inclure : Description, Objectif, Tâche, Adresse (interpellation) et Contexte d\'apprentissage.',

    'eval-critere':
        'Évaluer le critère en attribuant un niveau. La rétroaction est générée automatiquement selon la cartouche.',

    'eval-francais-ecrit':
        'Évaluation algorithmique : saisir les codes d\'erreurs et le nombre de mots. Calcul et rétroaction automatiques.',

    'eval-codes-erreurs':
        'Codes numériques des erreurs séparés par points-virgules. Voir la grille pour la correspondance codes → catégories.',

    'eval-niveau-idme':
        'Niveau calculé automatiquement. Modifier uniquement si nécessaire (ex. : reprise ciblée).',
```

---

## Cartographie HTML — où placer les data-tooltip

### Panneau des paramètres (gauche)

| Clé | Élément cible |
|-----|---------------|
| `eval-page` | Titre « Évaluation des productions et rétroaction différenciée automatique » |
| `eval-grille` | Label « Grille d'évaluation : » |
| `eval-echelle` | Label « Échelle de performance : » |
| `eval-cartouche` | Label « Cartouche de rétroaction : » |
| `eval-statut-remise` | Label « Statut de remise : » |
| `eval-integrite` | Label « Intégrité académique : » |
| `eval-jetons` | Titre « Appliquer un jeton : » |
| `eval-jeton-delai` | Label « Délai » à côté de la case à cocher |
| `eval-jeton-reprise` | Label « Reprise » à côté de la case à cocher |
| `eval-jeton-reprise-ciblee` | Label « Reprise ciblée » à côté de la case à cocher |
| `eval-note-finale` | Conteneur affichant « Note finale » et « Niveau » |

### Zone d'évaluation et rétroaction (droite)

| Clé | Élément cible |
|-----|---------------|
| `eval-retroaction` | Titre « Rétroaction finale » |
| `eval-retroaction-options` | Conteneur des cases à cocher (Description, Objectif, Tâche, Adresse, Contexte) |
| `eval-critere` | Titre de chaque carte de critère évalué (ex. : « Structure (15%) », « Rigueur (20%) ») |
| `eval-francais-ecrit` | Titre « Français écrit (30%) » ou son badge « ALGORITHMIQUE » |
| `eval-codes-erreurs` | Label « Codes d'erreurs + séparer par : » |
| `eval-niveau-idme` | Label « Niveau IDME (modifiable manuellement) : » |

---

## Règles de placement

### Panneau des paramètres
- Placer `data-tooltip` sur les **labels** (ex. : « Grille d'évaluation : »), jamais sur les `<select>` qui doivent s'ouvrir librement.
- Les sélecteurs **Groupe**, **Étudiant·e** et **Production étudiante** sont auto-explicatifs et ne reçoivent pas de tooltip.
- Pour les **jetons** : placer `data-tooltip` à la fois sur le titre de section (« Appliquer un jeton : ») et sur chaque label de jeton individuel (« Délai », « Reprise », « Reprise ciblée »). Les cases à cocher doivent rester cochables.
- Pour la **Note finale / Niveau** : placer `data-tooltip` sur le conteneur d'affichage, pas sur les valeurs numériques elles-mêmes.

### Zone d'évaluation
- Pour les **critères évalués** : placer `data-tooltip` sur le **titre du critère** (ex. : « Structure (15%) »), pas sur le sélecteur de niveau ni sur le texte de rétroaction générée. La clé `eval-critere` est réutilisée sur chaque critère de la grille (même tooltip générique).
- Pour le **critère Français écrit** : placer `data-tooltip` sur le titre ou le badge « ALGORITHMIQUE ». Ce critère a son propre tooltip distinct de `eval-critere` car son fonctionnement est fondamentalement différent (saisie de codes plutôt qu'attribution d'un niveau).
- Pour les **codes d'erreurs** : placer `data-tooltip` sur le label, pas sur le champ `<input>`.
- Pour le **Niveau IDME modifiable** : placer `data-tooltip` sur le label, pas sur le `<select>`.
- Le texte de **rétroaction** dans la zone de texte est éditable et ne reçoit pas de tooltip.
- Le bouton **Copier dans le presse-papier** est auto-explicatif.

---

## Vérification

- [ ] 17 tooltips apparaissent au survol des éléments ciblés
- [ ] Tous les sélecteurs déroulants s'ouvrent normalement
- [ ] Les cases à cocher (jetons, options de rétroaction) restent cochables
- [ ] Le champ de saisie des codes d'erreurs reste éditable
- [ ] La zone de texte de rétroaction reste modifiable
- [ ] Les boutons Sauvegarder, Réinitialiser et Nouvelle évaluation restent fonctionnels
- [ ] Le bouton Copier dans le presse-papier fonctionne
- [ ] La navigation ←/→ entre évaluations reste fonctionnelle
- [ ] L'attribution de niveaux aux critères (sélection IDME) n'est pas perturbée
