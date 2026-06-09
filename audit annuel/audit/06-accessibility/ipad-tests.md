# Tests iPad — Safari + iPadOS 18.5 (iPad Air 5)

**À exécuter par Grégoire.** Temps estimé : 1 h 30.

---

## Préparation

- iPad Air 5 sous iPadOS 18.5.
- Câble USB-C vers Mac (pour Safari Web Inspector si besoin).
- Sur Mac, dans Safari : Préférences > Avancées > « Afficher le menu Développement ».
- Sur iPad, dans Réglages > Safari > Avancé : activer « Inspecteur Web ».
- Labo Codex servi en local (`npx http-server -p 8080` sur Mac, accès via IP locale depuis iPad).

---

## Tests

### Viewport et mise en page

| Test | Attendu | Observé | Statut |
|---|---|---|---|
| Viewport meta correct | `<meta name="viewport" content="width=device-width, initial-scale=1">` ou équivalent | | |
| Pas de zoom horizontal involontaire | Page tient en largeur sans scroll horizontal | | |
| Orientation portrait | Tout est lisible et accessible | | |
| Orientation paysage | Tout est lisible et accessible | | |
| Rotation de l'appareil | L'état est préservé (formulaire en cours, position de scroll) | | |

### Touch targets (Apple Human Interface Guidelines)

| Élément | Taille mesurée | ≥ 44×44 pt ? | Statut |
|---|---|---|---|
| Boutons principaux | | | |
| Liens dans listes | | | |
| Icônes d'action | | | |
| Cases à cocher | | | |
| Boutons radio | | | |

**Méthode de mesure** : Safari Web Inspector > sélectionner l'élément > onglet « Computed » > vérifier `width` et `height`. 44 pt ≈ 44 px en CSS standard.

### Interactions

| Test | Attendu | Observé | Statut |
|---|---|---|---|
| Pas de hover-only | Toute action `:hover` a un équivalent au tap | | |
| Pas de double-tap involontaire | Les éléments tappables ne déclenchent pas de zoom | | |
| Long-press réservé au texte | Pas de comportement personnalisé sur long-press | | |
| Swipe natif fonctionne | Swipe latéral revient en arrière dans Safari | | |
| Pinch zoom fonctionne | Si l'app n'interdit pas le zoom, pinch agrandit | | |

### Clavier externe (si disponible)

| Test | Attendu | Observé | Statut |
|---|---|---|---|
| Tab navigation | Fonctionne sur tous les contrôles | | |
| Cmd+F (recherche) | Soit fonctionne, soit ne casse rien | | |
| Échap | Ferme modales/menus | | |
| Entrée | Soumet formulaires | | |
| Flèches | Navigation logique dans listes | | |

### Performance

| Test | Attendu | Observé | Statut |
|---|---|---|---|
| Temps de chargement initial | < 3 s sur Wi-Fi standard | | |
| Réactivité au tap | < 100 ms perçus | | |
| Fluidité du scroll | 60 fps perçus | | |
| Comportement avec 100 artefacts saisis | Reste fluide | | |
| Comportement avec 30 élèves dans 5 groupes | Reste fluide | | |

### Stockage

| Test | Attendu | Observé | Statut |
|---|---|---|---|
| Persistance après fermeture Safari | Données toujours présentes | | |
| Persistance après redémarrage iPad | Données toujours présentes | | |
| Comportement en mode privé | Erreur lisible si IndexedDB indisponible | | |
| Comportement avec stockage Safari plein | Erreur lisible | | |

### Cas particuliers iPadOS

| Test | Attendu | Observé | Statut |
|---|---|---|---|
| Multitâche Split View | L'app reste utilisable à 50 % de largeur | | |
| Stage Manager (iPadOS 16+) | L'app fonctionne en fenêtre redimensionnée | | |
| Apple Pencil (si applicable) | Pas de comportement involontaire au survol | | |

---

## Synthèse

| Catégorie | Tests OK / Total | Statut |
|---|---|---|
| Viewport et mise en page | / 5 | |
| Touch targets | / 5 | |
| Interactions | / 5 | |
| Clavier externe | / 5 | |
| Performance | / 5 | |
| Stockage | / 4 | |
| Cas particuliers | / 3 | |

**Statut global iPad** : __

---

## Recommandations

À remplir après audit :

- Corrections critiques (statut rouge) : ...
- Améliorations souhaitables (statut jaune) : ...
- Limites assumées : ...
