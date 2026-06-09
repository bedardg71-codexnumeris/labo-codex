# NOTE COWORK → Claude Code — Intégration des guides « som » et « pan »

**Date** : 6 juin 2026
**Statut** : contenu rédigé et vérifié, **prêt à intégrer**. Aucun code touché côté Cowork.
**Livrables sources** (dossier `Plan Accompagnement/`) :
- `CONTENU_guides_som-pan_2026-06-06.md` — entrées `GUIDES_PEDAGOGIQUES` prêtes à coller (§A/§B), boutons (§D), annexe citations vérifiées (§C).
- `CDC_guides_pratiques_notation_2026-06-06.md` — décisions et cadre (révise le plan du 29 mai).

---

## Ce que c'est

Deux nouveaux guides pédagogiques, dans le moteur unifié existant (`js/guides-pedagogiques.js`) :
- **`som`** « Comprendre sa pratique sommative » — 3 pages, gateway.
- **`pan`** « Modalités d'évaluation » — 5 pages (révise/remplace le plan PAN du 29 mai ;
  intègre Girouard-Gagné : familles **PAN/PRÉN**, dénotation en **horizon court non activable**).

Le 3e guide, `pan-rrec` (cadre réglementaire), reste son propre chantier
(`PLAN_guide_PAN_refonte_RREC.md`).

## Décisions actées (Grégoire, 6 juin) — à respecter

1. **Code Standard = `STD`** (canonique). Le « SDT » du plan du 29 mai était une erreur ;
   **pas de renommage**. Le contenu dit STD partout.
2. **Dénotation = page d'horizon courte**, marquée « pas encore activable » (≠ description
   d'une fonction livrée). Pas de mécanique détaillée tant que #318/#321 ne sont pas faits.
3. **Gateway `som` = guide autonome** (pas la page 1 de `pan`).
4. **Terminologie PRÉN/PAN** explicite dans `pan` (badge UI « PAN » conservé + note
   terminologique dans le guide).

## Étapes (procédure projet : un fichier à la fois, valider entre chaque)

1. **`js/guides-pedagogiques.js`** — ajouter les deux entrées `som` et `pan` dans l'objet
   `GUIDES_PEDAGOGIQUES` (copier §A et §B du CONTENU, telles quelles). Contenu 100 % statique
   → `innerHTML` sûr (même statut que les guides existants, cf. en-tête du fichier). **CSP OK**
   (aucun script inline, aucun handler inline). **Aucun CSS nouveau** (cf. ci-dessous).
2. **`index.html`** — ajouter les 2 boutons (§D du CONTENU) dans la section
   `#conception-pratiques-notation` (l. ~5577). Classe **`option-accompagnement-guide-btn`**
   (existe déjà, styles.css l. 2208) + `img.btn-inline-icon` + `icons/icon-book.svg`.
   `data-action="ouvrirGuidePedagogique"` `data-param="som"` / `"pan"`.
3. **Vérif fonctionnelle** — ouverture des deux guides depuis les boutons ; navigation
   flèches gauche/droite ; Échap ferme ; focus restauré au bouton déclencheur ; clic
   extérieur ferme. Mac (Safari) **et** iPad.
4. **Tests** — `cd tests && npm test` (rien de sensible touché, mais baseline). Pas de
   nouvelle fonction pure à couvrir (contenu statique) ; si tu ajoutes une garde, un test
   d'intégration léger « les guides som/pan s'ouvrent » suffirait.

## Garde-fous

- **Zones protégées NON touchées** : les boutons vont dans `index.html`
  (`#conception-pratiques-notation`), **pas** dans `config.js`/`navigation.js`. Le moteur de
  guides est déjà câblé au dispatcher — **aucune entrée de navigation à créer**.
- **Aucun CSS nouveau** : `cssPrefix` n'est qu'un `className` de panneau
  (`guides-pedagogiques.js` l. 272) ; le style vient des classes partagées
  `guide-pedagogique-*`. `guide-solo/-acp/-rai` n'ont aucun CSS dédié → `guide-som`/`guide-pan`
  non plus.
- **Citations** : déjà vérifiées mot pour mot sur les PDF sources (annexe §C du CONTENU).
  Ne pas reformuler les passages entre guillemets.

## Intendance (rappel du relais §0)

Working tree déjà à deux fils (code C0 + docs Cowork). **`git add` explicite par fil**,
jamais `-A`. Cette intégration est un **3e fil** (guides) : la commiter séparément
(`js/guides-pedagogiques.js` + `index.html` + ces docs `Plan Accompagnement/`).
Bump : `minor` (nouveauté utilisateur) au moment de la livraison, via `scripts/release.mjs`.
Changelog : « Guides des pratiques de notation : pourquoi et comment s'éloigner du cumul de
points (fondé sur le CSÉ et la recherche québécoise) + guide d'entrée sur la sommative. »

## Décisions résiduelles (Grégoire) — non bloquantes

1. Identifiant `som` à confirmer (cohérence `som`/`pan`/`pan-rrec`).
2. Page 1 de `pan` recoupe le gateway `som` — l'alléger si le gateway est lu en amont, ou
   la laisser autonome (état actuel).
3. Convention de tirets : demi-cadratin (–) dans le contenu (préférence Grégoire) vs cadratin
   (—) des guides existants — uniformiser au choix.
