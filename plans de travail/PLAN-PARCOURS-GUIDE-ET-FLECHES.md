# Plan — Parcours guidé et flèches didactiques

**Date de création** : 18 avril 2026
**Contexte d'entrée** : chantier onboarding Phase A, point A.16
**Plateforme prioritaire** : iPad Safari + Mac Safari
**Mot d'ordre** : pas de dette technique. Tout se règle en profondeur.

---

## 1. Contexte

L'audit terrain du 18 avril a fait apparaître deux limites de l'onboarding actuel :

- **Le hub « Parcourir »** de la page d'accueil (entre Découvrir et Piloter) fait doublon avec le parcours naturel de création d'un groupe-cours démo : en créant le groupe-cours, l'utilisateur traverse déjà trimestre → cours → enseignant → groupe-cours. Il n'a pas besoin d'un hub séparé pour être « guidé » sur ces étapes.
- **Les pages de matériel pédagogique** (Pratiques, Grilles, Échelles, Cartouches, Productions) sont muettes au premier contact. L'utilisateur débarque sur une liste vide sans savoir qu'il faut cliquer « Nouvelle X » pour amorcer, ni que ce bouton est le pattern universel de l'app.

La page Enseigner (présences, annotations) est jugée suffisamment explicite par elle-même, à l'exception de nuances comme « tu peux apposer des tampons ».

## 2. Intention

Fusionner « Découvrir » (démo) et « Parcourir » (configuration) en un unique hub d'entrée nommé **« Parcours guidé »**. Derrière ce hub, l'utilisateur active la démo et suit naturellement le fil via des **flèches didactiques contextuelles** qui apparaissent au premier contact de chaque écran clé pour dire « clique ici ».

Le résultat attendu : un nouvel utilisateur comprend sans lire de documentation :
1. Comment amorcer une donnée métier (pratique, grille, échelle, cartouche, production) ;
2. Que ce pattern est universel (un bouton « Nouvelle X » amorce chaque objet) ;
3. Qu'en mode enseignement, deux gestes non évidents existent (saisie de présences, apposer des tampons).

« Piloter » reste un hub séparé, destiné à un utilisateur déjà autonome.

## 3. Décisions de cadrage

Validées avec Grégoire le 18 avril :

1. **Déclenchement** : les flèches apparaissent au premier contact par écran, **indépendamment du mode démo ou normal**. Un flag `localStorage` par flèche (clé stable, pas namespacée par trimestre) garantit qu'une flèche vue ne réapparaît plus, même après rechargement ou changement de semestre.
2. **Catalogue MVP** : 7 flèches (5 en Structure, 2 en Enseigner). Autres ajouts possibles après observation.
3. **Renommage accueil** : `Découvrir` + `Parcourir` → un seul hub **« Parcours guidé »**. `Piloter` reste inchangé.

## 4. Principes directeurs

1. **Une flèche à la fois**. Pas d'empilement. Si plusieurs flèches pourraient s'afficher sur la même vue, on applique une priorité (voir §7).
2. **Dismiss facile** : clic/tap sur la flèche OU sur la cible la masque. Une flèche vue ne réapparaît jamais.
3. **Non intrusive** : la flèche ne bloque pas l'interaction avec l'UI, elle pointe. L'utilisateur peut continuer à naviguer sans la fermer explicitement s'il la contourne.
4. **Plateforme iPad prioritaire** : cible tactile ≥ 44 px sur le bouton de dismiss éventuel, positionnement qui tient compte de la barre latérale iPad et des claviers virtuels.
5. **Respect du design system** : `design-system.html` + variables CSS de `styles.css`. Aucune couleur en dur. Deux modes (sombre/clair) vérifiés.
6. **Respect CSP** : zéro handler inline, zéro script externe. Tout passe par `data-action` ou délégation JS.
7. **Indépendance des systèmes existants** : les flèches didactiques sont **distinctes** de `.primo-aide` (aide contextuelle, modales de conseil) et de `data-tooltip` (bulles au hover/long-press). Elles s'adressent à un moment précis — le premier contact — et non à une aide récurrente.

## 5. Architecture proposée

### 5.1 Composant unique réutilisable

Un module dédié : `js/fleches-didactiques.js`.

Il expose :

- `window.flechesDidactiques.afficher(id, options)` : affiche la flèche identifiée par `id` si elle n'a pas déjà été vue. `options` contient la cible, le message et la direction (ou ils viennent du catalogue).
- `window.flechesDidactiques.masquerActive()` : ferme la flèche actuellement visible, persiste le flag « vue ».
- `window.flechesDidactiques.reinitialiser(id | null)` : remet une flèche (ou toutes) à l'état « non vue » — pour les réglages ou les tests terrain.

Un catalogue central `FLECHES_CATALOGUE` en tête de fichier déclare chaque flèche :

```javascript
const FLECHES_CATALOGUE = {
  'structure-pratiques-nouvelle': {
    sectionActive: 'structure-pratique-notation',
    cibleSelector: '#btn-nouvelle-pratique',
    message: 'Clique ici pour créer ta première pratique de notation.',
    direction: 'haut',
    priorite: 10
  },
  // ...
};
```

### 5.2 DOM et CSS

Un seul conteneur flottant réutilisé : `#fleche-didactique-host`, créé à la volée dans `document.body`.

Structure interne :

```html
<div id="fleche-didactique-host" class="fleche-didactique" data-direction="haut">
  <div class="fleche-didactique-pointeur" aria-hidden="true"></div>
  <div class="fleche-didactique-corps">
    <p class="fleche-didactique-message">Clique ici pour...</p>
    <button class="fleche-didactique-close" data-action="masquerFleche">×</button>
  </div>
</div>
```

CSS dans `css/fleches-didactiques.css` (nouveau fichier) :

- Variables héritées : `--accent-primaire`, `--surface-carte`, `--texte-principal`, etc.
- 4 directions via `[data-direction="haut|bas|gauche|droite"]`.
- Animation d'apparition discrète (fade + micro-scale) pour attirer l'œil sans être agressive.
- Micro-oscillation permanente du pointeur (1px, 1.5 s, `prefers-reduced-motion` désactive).
- Z-index élevé mais inférieur aux modales critiques (navigation, rapport de bug).

### 5.3 Positionnement

Calcul similaire à `tooltips.js:positionnerBulle` : rect de la cible + viewport, priorité haut → bas → gauche → droite, contrainte dans les bords avec marge. Recalcul au scroll et au resize (comme les tooltips).

### 5.4 Persistance

Clés `localStorage` au format `fleche-vue__<id>`. Valeur `'1'`. Pas de JSON (primitif simple, évite le piège double stringify traité le 18 avril).

`flechesDidactiques.estVue(id)` lit cette clé ; `marquerVue(id)` l'écrit au moment où l'utilisateur clique sur la cible, sur le bouton de fermeture, ou ailleurs dans la page.

### 5.5 Intégration au flux navigation

Un écouteur global sur un événement `sectionAffichee` (à émettre depuis `navigation.js` si absent) déclenche un balayage du catalogue : pour chaque flèche dont `sectionActive` matche la section affichée, si non vue et si la cible existe, afficher la flèche de plus haute priorité.

S'il n'y a pas déjà d'événement `sectionAffichee` dans `navigation.js`, on l'ajoute — petit ajustement non intrusif qui servira aussi à d'autres modules plus tard.

## 6. Refonte de la page d'accueil

### 6.1 Avant

Trois cartes accordéon : `Découvrir`, `Parcourir`, `Piloter`. La toggle « Activer les données démo » est dans `Découvrir`. `Parcourir` recommande de créer le premier groupe-cours. `Piloter` liste les outils avancés (RàI, patterns, etc.).

### 6.2 Après

Deux cartes accordéon : **`Parcours guidé`** et `Piloter`.

Contenu de `Parcours guidé` :

- Titre + 1 phrase d'intention (« Explore l'application avec des données de démonstration, puis crée tes premières pièces de matériel pédagogique »).
- Toggle « Activer les données démo » (déplacé depuis l'ancien `Découvrir`).
- Toggles optionnels : « Tour guidé » et « Aide contextuelle » (déjà existants, logique `.primo-aide`) — conservés car complémentaires.
- Un **nouveau toggle** : « Flèches didactiques au premier contact » (activé par défaut). Off masque toutes les flèches ET marque `flechesDidactiques.reinitialiser(null)` comme une no-op ; réactive = les flèches non vues réapparaissent.
- Lien bouton : « Créer mon premier groupe-cours » → navigue vers Contexte, ouvre l'assemblage groupe-cours.

Contenu de `Piloter` : inchangé.

### 6.3 Migration des utilisateurs existants

Pour les utilisateurs ayant déjà l'app : rien à migrer. Les clés localStorage `fleche-vue__*` n'existent pas → toutes les flèches seront vues au premier passage. Comportement attendu et souhaité : un utilisateur avancé peut fermer les flèches d'un clic, elles ne reviendront pas.

Si cela s'avère trop bruyant pour les utilisateurs existants, une option : ne déclencher les flèches que si `localStorage['onboarding-complete'] !== '1'` et marquer `'1'` après le premier passage dans Contexte. À trancher selon retours terrain — on ne l'ajoute pas par défaut.

## 7. Catalogue des flèches MVP

| Id | Section déclenchante | Cible (sélecteur) | Message | Direction | Priorité |
|---|---|---|---|---|---|
| `structure-pratiques-nouvelle` | `structure-pratique-notation` | `#btn-nouvelle-pratique` (à confirmer) | Clique ici pour créer ta première pratique de notation. | bas ou haut | 10 |
| `structure-grilles-nouvelle` | `structure-grille-criteres` | `#btn-nouvelle-grille` | Clique ici pour créer une grille de critères. | bas | 10 |
| `structure-echelles-nouvelle` | `structure-echelles-performance` | `#btn-nouvelle-echelle` | Clique ici pour créer une échelle de performance. | bas | 10 |
| `structure-cartouches-nouvelle` | `structure-cartouches-retroaction` | `#btn-nouvelle-cartouche` | Clique ici pour créer une cartouche de rétroaction. | bas | 10 |
| `structure-productions-nouvelle` | `structure-productions-etudiantes` | `#btn-nouvelle-production` | Clique ici pour créer une production. | bas | 10 |
| `enseigner-presences-saisie` | `enseigner-presences` (ou équivalent) | `.presences-cellule[data-premier]` | Clique dans une cellule pour saisir des présences. | haut | 5 |
| `enseigner-annotation-tampons` | `enseigner-annotation` | `.tampons-palette-bouton-premier` | Tu peux apposer des tampons pour commenter rapidement. | droite | 5 |

Les ID de sections et sélecteurs de cible seront **vérifiés en lecture** au moment de l'implémentation — on corrige ceux qui diffèrent sans réécrire le plan.

### Note sur la cible « Enseigner »

Les deux flèches « Enseigner » nécessitent qu'une donnée soit affichable (un groupe-cours avec présences / une production à annoter). Si le contexte n'est pas prêt, la flèche ne s'affiche pas ce passage-ci — elle pourra apparaître plus tard, tant qu'elle n'a pas été vue.

## 8. Articulation avec l'existant

| Système | Rôle | Relation aux flèches didactiques |
|---|---|---|
| **`.primo-aide` + popup Primo** | Aide contextuelle permanente pour un concept métier (SRPNF, cartouches, etc.) | Indépendante. Peut coexister sur le même écran. |
| **`data-tooltip` + bulles tooltips.js** | Info courte au hover/long-press sur un élément d'UI | Indépendante. Les flèches didactiques ciblent un bouton d'action précis, les tooltips décrivent n'importe quel élément. |
| **Préférences `tourGuide` et `aideContextuelle`** | Contrôlent la visibilité des `.primo-aide` | Conservées. Les flèches didactiques ont leur propre toggle `flechesActives` (par défaut `true`). |

Risque à surveiller : une même page affiche une flèche didactique ET un tooltip au même moment. Solution : si un tooltip est ouvert, masquer temporairement la flèche (ou l'inverse) — à décider à l'implémentation selon l'observation.

## 9. Phases de livraison

### Phase 1 — Composant + 1 flèche pilote (branche dédiée ou directement `main`)

- Créer `js/fleches-didactiques.js` et `css/fleches-didactiques.css`.
- Déclarer le catalogue avec **une seule** entrée : `structure-pratiques-nouvelle`.
- Ajouter l'événement `sectionAffichee` dans `navigation.js` si absent.
- Brancher le module et valider sur iPad + Mac, mode clair et sombre, mode démo et normal.
- Tester la persistance : fermer, recharger, la flèche ne revient pas.
- Commit unique.

### Phase 2 — Six flèches restantes

- Ajouter les 6 entrées au catalogue.
- Vérifier les sélecteurs en lecture, les corriger si besoin.
- Commit unique ou un par flèche selon l'ampleur des ajustements.

### Phase 3 — Refonte page d'accueil

- Fusionner `Découvrir` + `Parcourir` → `Parcours guidé`.
- Déplacer la toggle « Activer les données démo » dans le nouveau hub.
- Ajouter le toggle « Flèches didactiques ».
- Mettre à jour les textes d'intention.
- Supprimer le hub `Parcourir` de l'accueil et de `js/accueil.js`.
- Commit unique.

### Phase 4 — Documentation

- Mettre à jour `docs/00-START-HERE.md` avec le nouveau système si pertinent.
- Mettre à jour `SKILL_labo_codex.md` pour mentionner `flechesDidactiques` comme système d'onboarding officiel.
- Noter la décision dans `SESSION.md` et le plan d'onboarding.

## 10. Critères d'acceptation

Le chantier est livré quand, sur iPad Safari et Mac Safari, un utilisateur fraîchement arrivé (ou après `localStorage.clear()`) :

1. Voit sur la page d'accueil `Parcours guidé` et `Piloter`, plus aucun `Découvrir` ni `Parcourir` séparés.
2. En activant la démo puis en naviguant vers Structure → Pratiques, voit une flèche pointant sur « Nouvelle pratique » avec le message prévu. Au clic sur la cible ou sur la flèche, la flèche disparaît et ne revient plus.
3. Répète l'expérience identique pour les 4 autres sections Structure et les 2 sections Enseigner.
4. Désactive le toggle « Flèches didactiques » dans Parcours guidé → plus aucune flèche n'apparaît.
5. Réactive le toggle → les flèches non vues reviennent la prochaine fois que la section est affichée.

## 11. Risques et points d'attention

- **Sélecteurs fragiles** : si les sélecteurs de cible changent (ex : `#btn-nouvelle-pratique` devient `#btn-nouvelle-pratique-v2`), la flèche échoue silencieusement. Parade : le module log un `console.warn` non mémoïsé uniquement si la flèche ne trouve pas sa cible, pour signaler la rupture au dev.
- **Synchronisation avec les re-renders SPA** : les sections s'affichent souvent via `innerHTML`. Le module doit attendre que le DOM soit stable avant de positionner la flèche. Utiliser un petit `requestAnimationFrame` après l'émission de `sectionAffichee`.
- **iPad en paysage vs portrait** : la flèche peut sortir de l'écran dans l'une ou l'autre orientation. Couverture via le calcul de contrainte viewport (déjà utilisé dans tooltips.js).
- **Accessibilité** : la flèche n'est pas focusable au clavier dans le MVP (Tab la saute). Si besoin émerge, ajouter `role="status"` + focus au bouton de fermeture.

## 12. Hors périmètre

Explicitement **non inclus** dans ce chantier :

- Refonte complète de l'aide contextuelle (`.primo-aide`, modales Primo).
- Tour guidé animé multi-étapes (type « Intro.js »). Les flèches didactiques sont des pointeurs individuels, pas un tour linéaire.
- Flèches pour les sections Planifier ou Configurer (hors du MVP par décision).
- Analyse du temps passé sur chaque écran (analytics).

---

## Suivi du chantier

| Phase | État | Commit | Notes |
|---|---|---|---|
| Phase 1 — Composant + 1 flèche pilote | À faire | — | |
| Phase 2 — Six flèches restantes | À faire | — | |
| Phase 3 — Refonte page d'accueil | À faire | — | |
| Phase 4 — Documentation | À faire | — | |

Mise à jour : au fil des commits.
