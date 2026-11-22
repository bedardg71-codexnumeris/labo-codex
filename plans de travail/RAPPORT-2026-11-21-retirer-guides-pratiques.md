# Rapport — Retirer les deux guides de Conception › Pratiques (21 nov. 2026)

- **Branche** : `lot/retirer-guides-pratiques`, partie d'`origin/main` à `16360f43c` (1.253.0).
- **PR** (brouillon, NE PAS FUSIONNER) : à compléter après ouverture.
- **Aperçu** : à compléter après ouverture.
- **Décision** : Grégoire, 21 nov. 2026, 21 h 25 — les guides « Comprendre sa sommative » et « Modalités » sont jugés trop prescriptifs ; leurs boutons partent le temps de la révision.
- **État** : fait. Ni fusion ni release : la branche part avec la prochaine version.

## Ce qui est retiré

- `index.html`, Conception › Pratiques de notation : le bloc des deux boutons (`data-param="som"` et `data-param="pan"`), conteneur `u-mb-15` compris. À sa place, un commentaire HTML d'une ligne : la date, la décision, et que le texte reste dans `js/guides-pedagogiques.js`.
- `index.html`, Labo › aide, carte « Les pratiques alternatives de notation (PAN) » : la fin de phrase « ; la théorie, dans le guide « Modalités » de Conception → Pratiques. » La phrase envoyait vers un bouton qui n'existe plus (point 3 du mandat). Elle se termine maintenant après « Choisir ta pratique de notation ». ⚠ Le commentaire au-dessus de cette carte dit que deux phrases de ce paragraphe ont été validées « mot pour mot » par Grégoire le 28 oct. ; la phrase coupée est la troisième (celle qui dit où trouver familles et théorie), mais **à relire par Grégoire** : la queue reviendra quand les guides reviendront.

## Ce qui reste

- `js/guides-pedagogiques.js` : les entrées `som` et `pan`, intactes (aucun octet modifié), avec leur CSS (`guide-som`, `guide-pan`) et la fonction `ouvrirGuidePedagogique`, qui sert toujours `solo`, `acp` et `rai`.
- La classe `.option-accompagnement-guide-btn` et ses trois correctifs du mode clair : trois boutons la portent encore (SOLO, ACP, RàI).

## Mesuré

- **Aucune autre porte** : `ouvrirGuidePedagogique` n'est appelé qu'avec `solo`, `acp`, `rai` hors des deux boutons retirés (index.html, `travaux-outils.js`, `accompagnement-contenu-popup.js`, `interventions.js`) ; le glossaire (`accompagnement-contenu-terme.js`) ne porte que `guide: 'acp' | 'rai' | 'solo'`.
- **Phrases affichées qui renvoient aux deux guides** (point 3) :
  - aide de Labo, carte PAN : celle citée plus haut — **corrigée**, seule de son espèce ;
  - aide contextuelle `construction-pratiques` : ne nomme aucun guide ;
  - carte Note de Pratiques : ne nomme aucun guide ;
  - parcours (`js/parcours-*.js`) et changelog (`js/changelog-data.js`) : aucune mention de ces deux guides ;
  - un commentaire HTML (non affiché) au-dessus de la carte PAN dit encore « l'exposé va au guide « Modalités » (D1) » : laissé, c'est une trace d'histoire.
- **Sentinelles** : `sentinelle-guides-som-pan-302` réécrite (absence des deux portes dans index.html + texte des deux guides présent dans le module, journal en fin de fichier) ; `sentinelle-patron-option-accompagnement` attendait cinq boutons de guide, elle en attend trois (commentaire daté).
- **Break-test** : bouton `som` remis dans index.html → l'essai « aucun bouton… » rougit ; entrée `som: {` renommée dans le module → l'essai « le guide som reste défini » rougit. Fichiers restaurés après chaque essai.
- **Vitest** (depuis `tests/`) : 944 fichiers, 12 175 essais, tous verts.
- **Captures** sous Chromium, 1180 × 820, pack démo : `captures-2026-11-21-retirer-guides/pratiques-1180x820-clair.png` et `…-sombre.png`. La barre de Pratiques s'ouvre directement sous l'en-tête, sans vide laissé par le bloc.

## Non vu

- Safari et l'iPad : rien à y voir de neuf (un bloc retiré, aucune règle CSS touchée).
- Playwright : non joué, aucun parcours ne passe par ces deux boutons (cherché dans `tests/integration/`).

## Règles

Aucune note ni aucune donnée d'utilisateur touchée ; aucun JS modifié hors des tests ; ni handler inline, ni `console.log` ; aucun nom réel.
