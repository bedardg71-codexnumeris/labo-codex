# Plan — Système d'accompagnement unifié (fusion des 5 systèmes)

**Date de création originale** : 18 avril 2026 (périmètre : tooltips + flèches)
**Révision majeure** : 20 avril 2026 (périmètre étendu : + aide contextuelle + tour guidé + glossaire)
**Contexte d'entrée** : Beta 99.19 build 0419-2215. La Refonte accompagnement du 19 avril a unifié les textes, la palette (`--acc-*`), le toggle global (« Accompagnement »), mais les 5 moteurs JS restent techniquement séparés.
**Plateforme prioritaire** : iPad Safari + Mac Safari
**Mot d'ordre** : zéro dette technique. Un seul moteur, un seul catalogue, migration propre.

> **Note** : le fichier garde son nom historique `PLAN-INFOBULLES-UNIFIEES.md` pour préserver la traçabilité git, mais le périmètre couvre désormais l'ensemble du système d'accompagnement.

---

## 1. Contexte actuel (20 avril 2026)

### 1.1 Cinq moteurs coexistants — textes et palette déjà unifiés, code encore séparé

| Moteur | Fichiers | Entrées | Déclencheur | Persistance |
|---|---|---|---|---|
| Tooltips hover | `js/tooltips.js`, `js/tooltips-contenu.js`, `css/tooltips.css` | 279 (`window.TOOLTIPS`) | `data-tooltip` hover/long-press/focus | — |
| Flèches didactiques | `js/fleches-didactiques.js`, `css/fleches-didactiques.css` | 7 (`FLECHES_CATALOGUE`) | `sectionAffichee` auto | `fleche-vue__<id>` |
| Aide contextuelle | `js/primo-tooltips.js`, `js/aide-contextuelle.js`, `js/aide-contextuelle-contenu.js` | ~40 (`AIDE_CONTEXTUELLE`) | Clic ✴️ sur `.btn-aide-contextuelle[data-aide]` ou `.primo-aide[data-target]` | — |
| Tour guidé | intégré (commit `477dc8c`) | 6 étapes | `sectionAffichee` auto + parcours séquentiel | `tourGuide_etapes_vues` |
| Glossaire | `js/glossaire.js`, `js/glossaire-data.js` | 48 termes | `[data-glossaire]` clic inline + page dédiée | — |

### 1.2 Usages HTML actuels (~220 points d'entrée)

- `data-tooltip=` : 170 dans `index.html` + ~87 injections dynamiques (11 fichiers JS)
- `.btn-aide-contextuelle[data-aide]` : 22 statiques
- `.primo-aide[data-target]` : 19 statiques
- `[data-glossaire]` : 0 statique, injection dynamique via `enrichirTermesGlossaire()`
- Flèches + tour : orchestrés par événement `sectionAffichee` dispatché par `navigation.js`

### 1.3 Ce qui est déjà unifié (à préserver tel quel)

- **Palette** : 24 variables CSS `--acc-*` dans `:root`, identiques modes sombre/clair
- **Textes** : 279 tooltips (T1-T11) + 48 termes glossaire + popups aide contextuelle, tous relus et validés le 19 avril 2026
- **Toggle accueil V3** : un seul interrupteur « Accompagnement » pilote en bloc les 4 préfs existantes (`tooltips`, `aideContextuelleActive`, `flechesDidactiquesActives`, `tourGuideActif`)
- **Émoji** : ✴️ partout (migration 📍 → ✴️ du commit `6e6b88e`)

### 1.4 Ce qui reste dupliqué (à supprimer)

- **5 DOM hosts** distincts, 5 algorithmes de positionnement
- **Événements iPad** : long-press/callout réimplémentés dans tooltips ET glossaire
- **Persistance** : deux conventions (`fleche-vue__*` vs `tourGuide_etapes_vues`)
- **Catalogues** : 4 structures de données distinctes (`TOOLTIPS`, `FLECHES_CATALOGUE`, `AIDE_CONTEXTUELLE`, `glossaire-data`)

---

## 2. Décisions de cadrage (révisées 20 avril)

1. **Chantier total** : un seul moteur absorbe les 5 systèmes — validé 20 avril.
2. **Catalogue unique `CATALOGUE_ACCOMPAGNEMENT`** : une entrée par concept pédagogique, modes multiples supportés par la même entrée.
3. **Migration progressive** : Phase 1 drop-in compatible avec les ~220 attributs HTML et les 4 catalogues existants (via adapters). Phases 2-5 migrent contenu par contenu. Phase 6 supprime les anciens modules.
4. **Cinq modes visuels**, CSS fusionné dans `css/accompagnement.css` :
   - `hover` (bulle sobre — ex-tooltips)
   - `autoReveal` (flèche-pointeur animée — ex-flèches)
   - `popup` (modale riche — ex-aide contextuelle)
   - `tour` (panneau flottant séquentiel — ex-tour guidé)
   - `terme` (micro-popup inline — ex-glossaire)
5. **Persistance unifiée** : clé `accompagnement-vu__<cle>`. Migration transparente des anciens flags `fleche-vue__*` et `tourGuide_etapes_vues` au premier chargement.
6. **Toggle unifié** : une seule pref `accompagnementActif`. Phase 1 : lit/écrit les 4 sous-prefs pour rétro-compat. Phase 6 : pref unique, les 4 anciennes sont supprimées.
7. **Comportement iPad préservé** : long-press 400 ms, tolérance 20 px, `-webkit-touch-callout: none` (corrections A.5-bis).

---

## 3. Principes directeurs

1. **Source de vérité unique** : `CATALOGUE_ACCOMPAGNEMENT` remplace à terme `window.TOOLTIPS`, `FLECHES_CATALOGUE`, `AIDE_CONTEXTUELLE` et le data glossaire.
2. **Rétro-compat HTML** : les ~220 attributs HTML existants continuent de fonctionner sans aucun changement pendant toute la migration.
3. **API minimale** : `window.accompagnement` unique. Alias rétrocompatibles (`window.tooltips`, `window.flechesDidactiques`, `window.aideContextuelle`, `window.glossaire`, `window.definirTooltips`) maintenus en Phase 1-5, retirés en Phase 6.
4. **Entrée multi-trigger** : une même entrée peut porter plusieurs modes (ex : `hover` + `autoReveal` pour le même sujet). Le moteur sélectionne selon le déclencheur réel.
5. **Un seul overlay actif à la fois**. Priorité d'affichage : `tour` > `autoReveal` > `popup` > `hover` > `terme`. Toute nouvelle demande masque l'actif.
6. **Respect des prefs existantes** en Phase 1-5 : le moteur lit les 4 anciennes prefs et les fusionne internement, aucune migration côté utilisateur requise.

---

## 4. Architecture

### 4.1 Module unique

Nouveau fichier `js/accompagnement.js` qui absorbe :
- `tooltips.js` + `tooltips-contenu.js`
- `fleches-didactiques.js`
- `primo-tooltips.js` + `aide-contextuelle.js` + `aide-contextuelle-contenu.js`
- Logique du tour guidé (actuellement dispersée)
- `glossaire.js` + `glossaire-data.js`

API publique :

```javascript
window.accompagnement = {
    afficher(cleOuCible, optionsExternes),   // Affichage explicite
    masquer(),                                // Ferme l'overlay actif
    reinitialiser(cle | null),                // Remet à l'état « non vue »
    estActif(),                               // Lit la préférence globale
    definirActif(bool),                       // Bascule la préférence
    demarrerTour(),                           // Lance le tour guidé dès l'étape 1
    ajouterEntrees(objet),                    // Permet aux modules tiers d'étendre
    catalogue: CATALOGUE_ACCOMPAGNEMENT
};

// Alias rétro-compat (Phase 1-5, retirés en Phase 6)
window.tooltips = { afficher, masquer, estActif, definirActif, /* ... */ };
window.flechesDidactiques = { afficher, masquer, reinitialiser, /* ... */ };
window.aideContextuelle = { ouvrir, fermer, /* ... */ };
window.glossaire = { afficherDansConteneur, enrichirTermesGlossaire, /* ... */ };
window.definirTooltips = window.accompagnement.definirActif;
```

### 4.2 Structure d'une entrée de catalogue

Une entrée par concept, modes au choix (1 ou plusieurs) :

```javascript
const CATALOGUE_ACCOMPAGNEMENT = {

    // Mode hover seul (équivaut à l'ancien window.TOOLTIPS[cle])
    'apercu-titre': {
        hover: 'Observer les indices A-C-P par étudiant...'
    },

    // Mode hover + autoReveal (même entrée, deux déclencheurs)
    'contexte-pratiques-nouvelle': {
        hover: 'Créer ta première pratique de notation',
        autoReveal: {
            sectionActive: 'contexte-pratiques-notation',
            cibleSelector: 'button[data-action="creerNouvellePratique"]',
            direction: 'haut',
            priorite: 10,
            message: 'Clique ici pour créer ta première pratique.'
        }
    },

    // Mode popup (équivaut à AIDE_CONTEXTUELLE[cle])
    'tableau-bord-apercu': {
        popup: {
            titre: "Comprendre l'aperçu",
            sections: [
                { type: 'texte', contenu: '...' },
                { type: 'conseil', contenu: '...' },
                { type: 'voir-aussi', liens: [{ cle: 'suivi-liste', label: '...' }] }
            ]
        }
    },

    // Mode tour (étape du parcours guidé)
    'tour-etape-reglages': {
        tour: {
            ordre: 1,
            titre: 'Configure ton trimestre',
            message: 'Ici, tu définis ton cours, ton horaire et ton groupe.',
            sectionActive: 'contexte-vue',
            actions: ['suivant', 'passer']
        }
    },

    // Mode terme (équivaut à entrée glossaire)
    'terme-ellac': {
        terme: {
            resume: 'Évaluation de l\'apprentissage par critères et niveaux.',
            fiche: 'ELLAC est un cadre pédagogique...',
            categorie: 'cadre',
            etape: 'observation',
            voir: ['terme-solo', 'terme-idme']
        }
    }
};
```

### 4.3 Déclencheurs

| Déclencheur | Mode activé | Origine |
|---|---|---|
| Hover 400 ms / long-press 400 ms / focus Tab | `hover` | `data-tooltip="<cle>"` ou `data-accompagnement="<cle>"` |
| Événement `sectionAffichee` | `autoReveal` puis `tour` (si en cours) | `navigation.js` |
| Clic sur `.btn-aide-contextuelle[data-aide]` ou `.primo-aide[data-target]` | `popup` | HTML |
| Clic sur `[data-glossaire="<cle>"]` | `terme` | HTML (injection dynamique via `enrichirTermesGlossaire`) |
| API `window.accompagnement.demarrerTour()` | `tour` étape 1 | Accueil |

### 4.4 Positionnement

Fonction unique `calculerPosition(cible, preference)` dérivée de l'existant (`tooltips.js:positionnerBulle` + `fleches-didactiques.js:positionner`). Contraintes viewport, 4 directions, recalcul au scroll/resize (debounced).

- Modes `hover` / `autoReveal` / `terme` : positionnement près de la cible
- Mode `popup` : centré modal (fixed)
- Mode `tour` : bas-droit desktop / pleine largeur iPad (fixed, max 420 px desktop)

### 4.5 Persistance

- **Clé unique** : `localStorage.accompagnement-vu__<cle>` (pour modes `autoReveal` et `tour`)
- **Migration au premier chargement** : script idempotent qui copie `fleche-vue__*` et `tourGuide_etapes_vues` vers la nouvelle convention. Flag `accompagnement-migration-v1` pour éviter ré-exécution.
- Modes `hover`, `popup`, `terme` : aucune persistance (transitoires)

### 4.6 Toggle et préférences

Préférence unique cible : `preferencesUtilisateur.accompagnementActif` (boolean).

**Phase 1-5 (transition)** :
- Lecture : `accompagnementActif` = `true` SI les 4 anciennes prefs sont toutes vraies, sinon `false`
- Écriture : `accompagnementActif = true` met les 4 prefs à `true`, `false` les met toutes à `false`

**Phase 6 (final)** :
- `accompagnementActif` est l'unique pref. Les 4 anciennes sont supprimées.

Le toggle unique « Accompagnement » de l'accueil V3 reste la seule interface utilisateur (comportement déjà actuel depuis commit `e542749`).

### 4.7 Comportement iPad

Hérité de `tooltips.js` + corrections A.5-bis :
- `-webkit-touch-callout: none` sur tout élément cliquable/pressable
- Long-press 400 ms avec tolérance 20 px → modes `hover` / `terme`
- Tap court sur cible d'une flèche auto = marque vue + masque

### 4.8 Priorité d'affichage

Un seul overlay visible à la fois.
- Toute nouvelle demande d'affichage masque l'overlay actif avant d'afficher le nouveau.
- Priorité en cas de conflit simultané : `tour` > `autoReveal` > `popup` > `hover` > `terme`.
- Pendant un `tour` actif, les autres déclencheurs sont temporisés jusqu'au dismiss de l'étape en cours.

---

## 5. Migration et compatibilité

### 5.1 Rétro-compat des attributs HTML

Aucune modification de l'HTML nécessaire pendant la migration. Le moteur supporte en lecture :
- `data-tooltip="<cle>"` → mode `hover`
- Membres de `FLECHES_CATALOGUE` → mode `autoReveal`
- `.btn-aide-contextuelle[data-aide="<cle>"]` et `.primo-aide[data-target="<cle>"]` → mode `popup`
- `[data-glossaire="<cle>"]` → mode `terme`

Nouvel attribut `data-accompagnement="<cle>"` disponible pour les entrées futures (Phase 2+).

### 5.2 Rétro-compat des catalogues

**Phase 1** : adapters qui lisent les 4 catalogues existants et les présentent au moteur comme des entrées virtuelles :
- `window.TOOLTIPS[cle]` → `{ hover: texte }`
- `FLECHES_CATALOGUE[id]` → `{ autoReveal: {...} }`
- `AIDE_CONTEXTUELLE[cle]` → `{ popup: {...} }`
- Glossaire `TERMES[cle]` → `{ terme: {...} }`

**Phases 2-5** : contenu déplacé progressivement dans `CATALOGUE_ACCOMPAGNEMENT`. Les anciens globals deviennent des getters qui lisent le catalogue.

**Phase 6** : suppression des getters et des anciens globals.

---

## 6. Phases de livraison

### Phase 1 — Moteur unifié drop-in

- Créer `js/accompagnement.js` qui absorbe la logique des 5 moteurs
- Créer `css/accompagnement.css` qui fusionne les 5 styles (modes via classes `.accompagnement-mode-*`)
- Adapters rétrocompatibles qui lisent les 4 catalogues existants sans modification
- Migration transparente des flags localStorage (`fleche-vue__*` + `tourGuide_etapes_vues` → `accompagnement-vu__*`)
- Toggle : `accompagnementActif` lit/écrit les 4 anciennes prefs
- Mise à jour `index.html` : inclure `accompagnement.css` + `accompagnement.js`, retirer les 5 anciens modules
- Tests : 170 tooltips, 7 flèches, ~40 popups, tour 6 étapes, 48 termes — aucune régression visuelle ni fonctionnelle
- Commit unique

### Phase 2 — Migration catalogue : tooltips + flèches

- Transformer `js/tooltips-contenu.js` et `js/fleches-didactiques.js` : les entrées sont ajoutées à `CATALOGUE_ACCOMPAGNEMENT` (fusion des entrées partagées hover+autoReveal)
- `window.TOOLTIPS` et `FLECHES_CATALOGUE` deviennent des getters
- Commit unique

### Phase 3 — Migration catalogue : aide contextuelle

- Transformer `js/aide-contextuelle-contenu.js` : entrées `AIDE_CONTEXTUELLE` ajoutées au catalogue sous mode `popup`
- `window.AIDE_CONTEXTUELLE` devient un getter
- Commit unique

### Phase 4 — Migration catalogue : tour guidé

- Extraire les 6 étapes du tour guidé et les ajouter au catalogue sous mode `tour`
- Commit unique

### Phase 5 — Migration catalogue : glossaire

- Transformer `js/glossaire-data.js` : les 48 termes ajoutés au catalogue sous mode `terme`
- `window.glossaire.termes` devient un getter
- Commit unique

### Phase 6 — Nettoyage

- Suppression physique des 10 anciens fichiers : `tooltips.js`, `tooltips-contenu.js`, `fleches-didactiques.js`, `primo-tooltips.js`, `aide-contextuelle.js`, `aide-contextuelle-contenu.js`, `glossaire.js`, `glossaire-data.js`, `tooltips.css`, `fleches-didactiques.css`
- Consolidation des styles popup/tour dans `accompagnement.css` (retirer de `styles.css` lignes 10566-10710 et sections tour)
- Retrait des alias `window.tooltips`, `window.flechesDidactiques`, `window.aideContextuelle`, `window.glossaire` si plus aucun consommateur (vérification `grep` exhaustif)
- Migration finale du toggle : `accompagnementActif` devient l'unique pref, retrait des 4 anciennes de `preferences.js`
- Commit unique

### Phase 7 — Documentation

- Mise à jour `SESSION.md`, mémoire projet, `docs/modules/`
- Mise à jour `CLAUDE.md` si besoin (règles d'ajout d'une entrée au catalogue)
- Commit unique

---

## 7. Critères d'acceptation

Sur iPad Safari et Mac Safari, mode clair et sombre :

1. Les 170 `data-tooltip` existants affichent leur bulle au hover (Mac) et au long-press (iPad) avec le visuel sobre actuel, sans régression.
2. Les 7 flèches auto-reveal apparaissent au premier contact d'écran avec le visuel flèche-pointeur animé. Dismiss et persistance transparents (flags migrés).
3. Les 22 `.btn-aide-contextuelle` et 19 `.primo-aide` ouvrent le popup modal riche au clic sur ✴️, contenu structuré (sections, conseil, voir aussi) inchangé.
4. Le tour guidé 6 étapes s'affiche dans le bon ordre avec la persistance correcte (pas d'étape revue si déjà vue avant la migration).
5. Les 48 termes glossaire affichent leur micro-popup au clic inline, avec le lien « En savoir plus » vers la page dédiée.
6. **Multi-trigger** : après dismiss d'une flèche auto sur un bouton, un long-press sur ce même bouton affiche le message en mode hover (critère clé du plan original §7.3).
7. Le toggle unique « Accompagnement » de l'accueil coupe les 5 modes en bloc.
8. Aucune régression visuelle : palette, positionnement, animations, accessibilité (focus visible, clavier, `prefers-reduced-motion`).
9. Aucun texte perdu : les 279 tooltips, 7 flèches, ~40 popups, 6 étapes tour, 48 termes tous conservés avec leur contenu validé du 19 avril.

---

## 8. Risques et points d'attention

- **Complexité du moteur unique** : le module absorbe 5 paradigmes UX. Parade : architecture interne modulaire (sous-modules par mode dans `accompagnement.js`), tests isolés par mode.
- **Régression sur ~220 points d'entrée HTML** : couverture incomplète au test terrain. Parade : parcourir les 7 sections principales (Aperçu, Structure, Contexte, Suivi, Évaluations, Outils, Aide) + accueil, vérifier plusieurs points de chaque mode dans chaque section.
- **Migration de persistance** : préserver les flags `fleche-vue__*` et `tourGuide_etapes_vues` existants côté utilisateur. Parade : script idempotent avec flag `accompagnement-migration-v1` au premier chargement.
- **Double affichage** : flèche + hover + popup simultanés. Parade : règle de priorité §3.5, toujours masquer avant d'afficher.
- **iPad gestes distincts** : hover/terme = long-press, terme glossaire actuellement = clic court. À trancher en Phase 1 : conserver deux gestes (clic court pour `terme`, long-press pour `hover`) ou unifier. Recommandation : conserver deux gestes, le paradigme UX est différent (inline vs popover).
- **Rétro-compat des alias `window`** : vérifier exhaustivement par `grep` qu'aucun module tiers ne consulte `window.tooltips`, `window.flechesDidactiques`, `window.aideContextuelle`, `window.glossaire` en lecture directe avant suppression en Phase 6.
- **Performances** : un seul listener global `sectionAffichee` + délégation hover/click. Pas de régression attendue, mesurer avant/après sur iPad.

---

## 9. Hors périmètre

Aucun système d'accompagnement hors périmètre. Les seules exclusions explicites :
- Pas de création de nouveau contenu pédagogique (migration des contenus validés du 19 avril uniquement)
- Pas de refonte de texte (validés le 19 avril)
- Pas de changement du toggle UX côté utilisateur (déjà unifié sur l'accueil V3)
- Pas d'ajout de nouveaux modes au-delà des 5 actuels

---

## Suivi du chantier

| Phase | État | Commit | Notes |
|---|---|---|---|
| Phase 1 — Moteur unifié drop-in | À faire | — | |
| Phase 2 — Migration catalogue tooltips + flèches | À faire | — | |
| Phase 3 — Migration catalogue aide contextuelle | À faire | — | |
| Phase 4 — Migration catalogue tour guidé | À faire | — | |
| Phase 5 — Migration catalogue glossaire | À faire | — | |
| Phase 6 — Nettoyage anciens modules | À faire | — | |
| Phase 7 — Documentation | À faire | — | |

Mise à jour : au fil des commits.
