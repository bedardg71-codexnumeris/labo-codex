# Plan — Info-bulles unifiées (fusion tooltips + flèches didactiques)

**Date de création** : 18 avril 2026
**Contexte d'entrée** : post-A.16. L'utilisateur observe qu'une flèche didactique est conceptuellement une info-bulle qui apparaît automatiquement la première fois.
**Plateforme prioritaire** : iPad Safari + Mac Safari
**Mot d'ordre** : pas de dette technique. Un seul système, code partagé, migration propre.

---

## 1. Contexte

Trois systèmes de bulles coexistent aujourd'hui, avec des recouvrements importants :

- **`tooltips.js` (data-tooltip)** — bulle sobre au hover/long-press, 170 usages, déclenchement par interaction, transitoire.
- **`fleches-didactiques.js`** — flèche-pointeur coloré au premier contact d'écran, 7 entrées au catalogue, déclenchement automatique, persistante jusqu'au dismiss.
- **`primo-tooltips.js` (.primo-aide)** — popup modale riche au tap sur icônes 📍/?, concept métier (SRPNF, cartouches, etc.), à part — **hors de ce chantier**.

Points communs entre tooltips et flèches :
- Positionnement identique (4 directions, contraintes viewport).
- Message court.
- DOM host unique dans body.
- Logique iPad (long-press / tap).

Différences qui deviennent des **modes** du nouveau moteur :
- Déclencheur : interaction (hover/long-press) vs automatique (premier contact).
- Persistance : transitoire vs mémorisée jusqu'au dismiss.
- Visuel : bulle sobre vs flèche-pointeur coloré.

Une fusion simplifie le code, améliore la cohérence UX et permet à un même contenu d'être accessible au hover ET de pouvoir apparaître automatiquement la première fois si l'entrée est marquée comme telle.

## 2. Décisions de cadrage (validées 18 avril)

1. **Catalogue central unique** : toutes les info-bulles (hover et auto-reveal) sont déclarées dans un objet `CATALOGUE_INFOBULLES`.
2. **Migration progressive** : le moteur livré en Phase 1 est compatible drop-in avec les 170 `data-tooltip="<clé>"` + `window.TOOLTIPS[clé]` actuels. La migration des données se fait ensuite en Phase 2 sans toucher l'HTML.
3. **Deux modes visuels** : bulle sobre (hover/long-press) et flèche-pointeur (auto-reveal). Le mode se déduit du déclencheur d'apparition.
4. **Persistance croisée** : après dismiss d'une flèche auto, le même message reste consultable en mode bulle sobre au hover/long-press sur la même cible.
5. **Désactivation** : un seul toggle global sur la page d'accueil (« Info-bulles ») — pas de lien « Désactiver » dans chaque bulle, pour éviter la pollution visuelle des 170 micro-tooltips.
6. **Primo reste séparé** — autre paradigme (popup modale, concept métier profond).

## 3. Principes directeurs

1. **Une seule source de vérité** : `CATALOGUE_INFOBULLES` remplace à terme `window.TOOLTIPS` (contenu des hover) et `FLECHES_CATALOGUE` (auto-reveal).
2. **Rétro-compat pendant la migration** : `data-tooltip="<clé>"` continue de fonctionner sans changement dans l'HTML. `window.TOOLTIPS` reste un alias du catalogue pour le code tiers qui pourrait le lire.
3. **API minimale** : une seule entrée au niveau `window.infoBulles`. Les anciens `window.tooltips`, `window.definirTooltips`, `window.flechesDidactiques` restent exportés en alias le temps de la transition.
4. **Mode déduit, pas imposé** : la même entrée peut être consommée en mode bulle sobre (hover) et en mode flèche-pointeur (auto-reveal). Le moteur choisit selon le déclencheur actuel.
5. **Respect des systèmes existants** : les préférences utilisateur (`tooltips`, `flechesDidactiquesActives`) restent lisibles — le moteur unifié les fusionne internement sans exiger une migration de préférence côté utilisateur.

## 4. Architecture proposée

### 4.1 Module unique

Nouveau fichier `js/info-bulles.js` qui fusionne `tooltips.js` + `fleches-didactiques.js`. Les anciens fichiers seront retirés en Phase 5.

API publique :

```javascript
window.infoBulles = {
    afficher(cleOuCible, optionsExternes),   // Affichage explicite
    masquer(),                                // Ferme l'active
    reinitialiser(cle | null),                // Remet à l'état « non vue »
    estActif(),                               // Lit la préférence globale
    definirActif(bool),                       // Bascule la préférence
    catalogue: CATALOGUE_INFOBULLES           // Accès au catalogue
};

// Alias rétro-compat (Phase 1)
window.tooltips = window.infoBulles;
window.flechesDidactiques = window.infoBulles;
window.definirTooltips = window.infoBulles.definirActif;
```

### 4.2 Structure d'une entrée de catalogue

```javascript
const CATALOGUE_INFOBULLES = {
    // Entrée minimaliste (équivaut à l'ancien window.TOOLTIPS[clé])
    'apercu-titre': {
        message: 'Observer les indices A-C-P...'
        // Déclencheur implicite : hover via data-tooltip="apercu-titre"
    },

    // Entrée enrichie avec auto-reveal
    'contexte-pratiques-nouvelle': {
        message: 'Clique ici pour créer ta première pratique de notation.',
        autoReveal: {
            sectionActive: 'contexte-pratiques-notation',
            cibleSelector: 'button[data-action="creerNouvellePratique"]',
            direction: 'haut',
            priorite: 10
        }
    }
};
```

Champs :
- `message` (requis) : texte affiché dans la bulle.
- `autoReveal` (optionnel) : présent → l'entrée peut s'afficher automatiquement au premier contact de `sectionActive`. Absent → l'entrée ne s'affiche qu'au hover/long-press via `data-tooltip`.
- `direction` (optionnel en mode hover, utilisé par le calcul de position) : `haut | bas | gauche | droite`. En mode hover, peut rester auto (priorité droite→gauche→bas→haut comme actuellement).

### 4.3 Mode visuel

Le moteur choisit le visuel au moment d'afficher selon le **déclencheur** :

- **Déclencheur hover / long-press / focus** → mode **bulle sobre** (CSS de l'actuel `tooltips.css`).
- **Déclencheur auto-reveal** (événement `sectionAffichee`) → mode **flèche-pointeur** (CSS de l'actuel `fleches-didactiques.css`).

Implémentation : un DOM host unique `#infobulle-host`, avec une classe `infobulle-mode-sobre` ou `infobulle-mode-fleche` selon le contexte.

### 4.4 Positionnement

Fonction unique dérivée de l'actuel `tooltips.js:positionnerBulle` + `fleches-didactiques.js:positionner`. Contraintes viewport, 4 directions, recalcul au scroll/resize (debounced).

### 4.5 Persistance

- **Clé localStorage** d'une entrée vue : `fleche-vue__<cle>` (même convention qu'actuellement pour éviter la migration des flags utilisateurs existants). Appliquée aux entrées `autoReveal` uniquement.
- **Toggle global** : `flechesDidactiquesActives` ET `tooltips` (préférence) consultés. Le moteur est actif si **les deux** sont actifs. Cohérent avec la réalité actuelle où les deux toggles ont un sens distinct (visuel auto vs interaction).
  - Alternative à discuter : fusionner en un seul `infoBullesActives`. Mais le user a préféré garder « Info-bulles » (hover) séparé de « Flèches didactiques » (auto) dans la page d'accueil (§A.16 Phase 3). Je respecte ce choix.

### 4.6 Comportement iPad (tactile)

Hérité de `tooltips.js` + correctifs A.5-bis :

- `-webkit-touch-callout: none` sur tout élément pouvant déclencher une bulle.
- Long-press 400 ms avec tolérance 20 px pour déclencher la bulle au hover.
- Tap court sur la cible d'une flèche auto-reveal = marque vue, masque.

## 5. Migration et compatibilité

### 5.1 Phase 1 — Moteur livré en compatible drop-in

- `js/info-bulles.js` créé avec API publique.
- Le moteur lit en priorité `CATALOGUE_INFOBULLES`, puis en fallback `window.TOOLTIPS[cle]` pour les `data-tooltip` non encore migrés.
- `FLECHES_CATALOGUE` devient un sous-ensemble de `CATALOGUE_INFOBULLES` (entrées avec `autoReveal`).
- Les anciens fichiers `tooltips.js` et `fleches-didactiques.js` sont **retirés** de `index.html` et remplacés par `info-bulles.js`.
- Les exports globaux anciens (`window.tooltips`, `window.flechesDidactiques`, `window.definirTooltips`) restent disponibles comme alias.

### 5.2 Phase 2 — Migration du contenu des tooltips

- Le fichier `js/tooltips-contenu.js` (qui définit `window.TOOLTIPS`) est transformé : les clés deviennent des entrées simples dans `CATALOGUE_INFOBULLES`.
- `window.TOOLTIPS` devient un getter qui lit le catalogue, pour rétro-compat du code qui le consulterait.

### 5.3 Phase 3 — Suppression des anciens modules

- Suppression physique de `js/tooltips.js`, `js/fleches-didactiques.js`, `css/tooltips.css`, `css/fleches-didactiques.css`.
- Consolidation CSS dans un seul `css/info-bulles.css`.
- Retrait des alias `window.tooltips` / `window.flechesDidactiques` si plus aucun consommateur.

### 5.4 Risque : 170 usages `data-tooltip`

Pas de modification HTML requise. Les 170 éléments continuent de fonctionner via le lookup du moteur. Validation visuelle sur les pages clés lors du test terrain.

## 6. Phases de livraison

### Phase 1 — Moteur unifié, drop-in compatible

- Créer `js/info-bulles.js` qui absorbe la logique de tooltips + flèches.
- Créer `css/info-bulles.css` qui fusionne les styles (deux modes via classes).
- Mettre à jour `index.html` : inclure `info-bulles.css` + `info-bulles.js`, retirer `tooltips.css`, `tooltips.js`, `fleches-didactiques.css`, `fleches-didactiques.js`.
- Tests : 170 tooltips existants fonctionnent, 7 flèches fonctionnent, aucune régression.
- Commit unique.

### Phase 2 — Migration du contenu

- Transformer `js/tooltips-contenu.js` : au lieu de définir `window.TOOLTIPS`, il ajoute ses entrées à `CATALOGUE_INFOBULLES`.
- Commit unique.

### Phase 3 — Nettoyage

- Suppression physique des anciens fichiers.
- Retrait des alias devenus inutiles.
- Commit unique.

### Phase 4 — Documentation

- Mise à jour `SESSION.md`, mémoire projet, plan des info-bulles.
- Commit unique.

## 7. Critères d'acceptation

Sur iPad Safari et Mac Safari, mode clair et sombre :

1. Les 170 `data-tooltip` existants continuent d'afficher leur bulle au hover (Mac) et au long-press (iPad) avec le visuel sobre actuel, sans régression.
2. Les 7 flèches auto-reveal (A.16) continuent d'apparaître au premier contact d'écran avec le visuel flèche-pointeur animé. Dismiss et persistance inchangés.
3. Après dismiss d'une flèche auto-reveal sur un bouton (ex : `button[data-action="creerNouvellePratique"]`), un long-press sur ce même bouton affiche le message en mode bulle sobre (car l'entrée existe toujours dans le catalogue).
4. Le toggle « Info-bulles » de la page d'accueil coupe bien toutes les bulles (hover + auto). Le toggle « Flèches didactiques » coupe seulement les auto-reveal.
5. Aucun des 170 tooltips existants n'est visuellement altéré (ni position, ni délai, ni style).

## 8. Risques et points d'attention

- **170 tooltips à valider** : couverture incomplète lors du test terrain. Parade : parcourir les sections principales (Aperçu, Structure, Contexte, Suivi, Évaluations, Outils, Aide) et vérifier visuellement quelques tooltips par section.
- **Performances** : un seul listener global `sectionAffichee` + délégation hover/long-press. Pas de régression attendue.
- **Double affichage** : si une flèche auto-reveal s'affiche et que l'utilisateur long-press immédiatement la même cible, il ne faut pas superposer deux bulles. Parade : masquer toute bulle active avant d'en afficher une nouvelle.
- **Alias rétrocompatibles** : le temps de la Phase 1 → 3, les exports `window.tooltips`, `window.flechesDidactiques`, `window.definirTooltips` sont maintenus. Les suppressions finales en Phase 3 doivent être faites après vérification qu'aucun module tiers ne les utilise en lecture.

## 9. Hors périmètre

- Refonte du système Primo (`.primo-aide` + popup modale riche). C'est un autre paradigme.
- Ajout de nouvelles flèches auto-reveal au-delà du catalogue A.16. Les extensions se font dans un chantier dédié.
- Changement du mécanisme de déclenchement tactile (long-press → tap court). Le comportement actuel est jugé satisfaisant après A.5-bis.

---

## Suivi du chantier

| Phase | État | Commit | Notes |
|---|---|---|---|
| Phase 1 — Moteur unifié drop-in | À faire | — | |
| Phase 2 — Migration contenu vers catalogue | À faire | — | |
| Phase 3 — Nettoyage anciens modules | À faire | — | |
| Phase 4 — Documentation | À faire | — | |

Mise à jour : au fil des commits.
