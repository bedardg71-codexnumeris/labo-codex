# Rapport — Comparateur : la synthèse de chaque pratique (21 nov. 2026)

- **Branche** : `lot/comparateur-synthese`, partie d'`origin/main` à `16360f43c` (1.253.0). Ni fusion ni release.
- **PR** (brouillon, NE PAS FUSIONNER) : à compléter après ouverture.
- **Aperçu** : à compléter après ouverture.
- **Décision** : Grégoire, 21 nov. 2026, 21 h 26. **État** : fait ; vérifié sous Chromium (captures) et WebKit (bancs).

## A. Mesuré d'abord : une pratique « Par standards » dans le comparateur

Mesuré sous Chromium, pack démo + une pratique « Par standards » fictive (2 cibles pondérées 2 et 1, dont une terminale).

**Oui, le menu l'offre** : « STD · Banc fictif par standards » (jamais « CIB »), choisissable dans chaque colonne. Ses rangées :

| Rangée | Ce qu'elle dit | Verdict | Ligne de code |
|---|---|---|---|
| Alignement sur des cibles d'apprentissage | « Non couvert (la note se rapporte à des instruments) » | **Faux** : la note se rapporte aux cibles | `js/pratiques/construction-attributs.js:183-185` (`_alignementCibles` ne connaît que `denotation`) |
| Ce à quoi la note se rapporte | « — » | **Vide** | `construction-attributs.js:169-174` (`_objetNote` n'a pas de branche `cibles`) |
| Pondération | « Égale » | **Faux** : les cibles portent des poids (2 et 1 ici) | `construction-attributs.js:108` (`_ponderation`, repli) |
| Productions comptées | « Sélection d'artefacts » | **Faux** : la note ne sélectionne pas d'artefacts | `construction-attributs.js:151` (`_nbProductions`, repli de la branche STD) |
| Reprises | « La reprise prend la place de la copie d'origine dans la note » | **Douteux** : la note par standards retient le meilleur niveau inscrit par cible ; non vérifié dans le moteur | `construction-attributs.js:128` (`_reprises`, repli commun) |
| Échelle de performance ; Niveaux de performance | « Échelle de départ – Par standards (5 niveaux) » ; « 5 niveaux » | Vrai | — |
| Composantes, Méthode de sélection, Mode « note finale » | « s.o. » | Vrai (sans objet) | — |
| Temporalité ; Choix laissés à l'étudiant·e ; Niveaux de la note du cours | réglage global ; « Non couvert par l'application » | Génériques, non faux | — |

**Simulation** : « — non constructible » sur les six profils-types. **Vide**, pas faux : les profils-types fictifs portent des copies notées, pas des niveaux inscrits par cible, et la note par standards lit les inscriptions. Le chemin : `js/portfolio.js:540-591` (`_simulerIndicesInterne` ; `noteConstructible` à la ligne 591). Lu, non creusé. **Non corrigé dans ce lot** (mandat) : **inscrire et continuer**.

Lu aussi : `_CODE_VERS_TYPE` (`comparateur-pratiques.js`) associe bien le code interne STD à « Par sélection de productions » ; il ne sert qu'aux familles de base sans enveloppe, et « Par standards » n'en a pas : aucun effet aujourd'hui.

## Mesuré, lu, non vu

- **Mesuré** : Vitest depuis `tests/`, 945 fichiers, 12 203 essais verts ; la garde du lot 0 (`sentinelle-moteur-cibles-0-garde`) à 16 sur 16. Playwright WebKit : 18 essais verts sur six bancs (le neuf, ceux du comparateur, du récapitulatif, de l'édition d'une pratique, des parcours de notation et sommatif), joués avant l'échappement des valeurs relues ; après lui, les deux bancs du comparateur rejoués, 8 verts (les quatre autres non rejoués). Sous Chromium : aucun débordement du tableau ni de la page, volet fermé ou ouvert, à 1180 × 820 et 820 × 1180 ; replié, la rangée du volet mesure 50 px (le libellé, 44 px, la cible tactile) ; un volet ouvert le reste quand l'autre colonne change de pratique ; « CIB » absent de la page.
- **Break-tests** joués et restaurés : la section « Par standards » altérée d'un caractère → la référence rougit ; la synthèse du comparateur relue autrement que l'assistant → rougit ; le comparateur qui écrit « Configuration – » lui-même → rougit ; l'échappement retiré de l'approche → rougit ; le volet ouvert d'office → le banc WebKit rougit.
- **Non vu** : Safari macOS et l'iPad réels (voir plus bas) ; trois colonnes (l'écran n'en offre que deux : aucun bouton n'en ajoute une troisième, le code en accepte trois — le volet suit la colonne, rien n'y est propre au nombre).

## Ce qui est fait

1. **La source unique** (`js/wizard-pratique-v2.js`) : la section « Configuration – <type> » sort de `genererRecapitulatif` en `genererSectionConfiguration(r)`, texte inchangé. La relecture d'une pratique enregistrée (le geste de « Modifier ») sort de `chargerPratiqueExistante` en `reponsesDepuisPratique(pratique)`, pure. `syntheseConfigurationDePratique(pratique)` = les deux, pour le comparateur. Le récapitulatif rend **exactement** le même HTML qu'avant pour douze cas couvrant les cinq familles : la référence a été générée sur le code d'origin/main **avant** toute modification (`tests/unit/fixtures/recap-familles-avant.json`).
2. **Le volet** (`js/comparateur-pratiques.js`) : sous le menu de chaque colonne, un `<details>`/`<summary>` natif, replié d'office, « Ce que règle cette pratique ». Une rangée de `<td>` dans l'en-tête : son texte ne devient pas le nom de la colonne pour VoiceOver.
3. **Sentinelles** : `sentinelle-comparateur-synthese-recap.test.js` (28 essais : la référence, l'identité avec le récapitulatif rouvert, la démo, l'échappement, la lecture seule, aucune copie du texte) ; `tests/integration/comparateur-synthese-2026-11-21.spec.js` (replié d'office, ouvert au clavier, HTML identique à la source, jamais « CIB », rien d'écrit ; pas de débordement à 820 px).
4. **Cliquets reportés** : complexité (`chargerPratiqueExistante` 41 devient `reponsesDepuisPratique` 38, renommée ; `genererRecapitulatif` 43 passe sous 16 — ses sections « Configuration » et « Matériel pédagogique » sortent en fonctions ; le compte au-dessus de 15 reste à 434) ; #467 (53 → 52) ; #935 (l'exception nommée suit la relecture).

## Ce que j'ai supposé (décidé seul)

- **C, familles de base** : la description courte d'`obtenirDescriptionCourtePratique`, telle quelle (exposée sur `window`, elle vivait dans le module des pratiques). **Étendu à une pratique sommative enregistrée** : son récapitulatif n'a pas de section « Configuration » (#900) ; sans repli, elle n'aurait pas de volet.
- **Les pratiques de la démo** ne portent leur famille que sous `configuration.type` : la synthèse la lit là (sur une copie). Sans cela, elles n'avaient aucun volet.
- Les valeurs relues d'une pratique (approche, nombre retenu, mode, seuil, jetons, méthode de dénotation) sont maintenant **échappées** dans la section : le comparateur les rend depuis des pratiques enregistrées ou importées. Sans effet sur les valeurs normales (la référence le garde).
- Le volet ouvert garde son état quand une autre colonne change ; il se referme si on quitte l'écran.

## Où je m'écarte du mandat

- La fonction partagée reçoit les **réponses** de l'assistant ; c'est la relecture existante (`reponsesDepuisPratique`, le geste de « Modifier ») qui convertit l'enveloppe pour le comparateur. Le mandat proposait l'inverse (l'enveloppe en entrée, l'assistant convertissant ses réponses). Motif : les réponses → enveloppe, c'est `creerPratiqueV2` (asynchrone, questions, écritures) ; et les cibles d'une pratique « Par standards » vivent hors de l'enveloppe. Effet : le comparateur montre ce que l'assistant montre en rouvrant la pratique, au caractère près (sentinelle B).
- La sommative enregistrée prend le repli de C (ci-dessus).

## Trouvailles (inscrire et continuer)

- **Rouvrir une pratique de la démo dans l'assistant la lit comme une sommative** : `chargerPratiqueExistante` ne lit que `pratique.type`, absent des pratiques de la démo (leur famille est sous `configuration.type`). Non corrigé (ce n'est pas ce lot ; réenregistrer changerait la pratique). `js/wizard-pratique-v2.js`, `reponsesDepuisPratique`, `typeCanon`.
- **« Seuil d'acceptabilité : » vide** pour la pratique Spécifications de la démo (seuils par type de travail, que le récapitulatif ne lit pas). Mot pour mot du récapitulatif, montré tel quel.
- **« Approche : undefined »** au récapitulatif d'une pratique « Par sélection de productions » sans approche ni portfolio (cas `sel-approche-absente` du banc). Existant ; le comparateur le montrerait aussi pour une telle pratique.
- Les rangées fausses ou vides de « Par standards » (point A).

## Ce que le Mac devra passer sous Safari (et l'iPad)

1. Le volet s'ouvre et se ferme d'un toucher sur l'iPad (Safari), en paysage et en portrait.
2. VoiceOver annonce « Ce que règle cette pratique, réduit / développé » et ne lit pas le volet comme nom de colonne.
3. Le triangle (▸) tourne à l'ouverture sous Safari macOS (le marqueur natif de Safari est masqué par `::-webkit-details-marker`).
4. En portrait sur l'iPad, le libellé sur deux lignes reste lisible et le tableau ne défile pas de côté.

## Pour voir le volet sur l'aperçu (gestes)

1. Ouvre l'aperçu, puis active la démonstration depuis l'accueil.
2. Va dans Labo, puis Exploration des pratiques.
3. Sous le menu de chaque colonne, touche « Ce que règle cette pratique » : le volet s'ouvre ; touche de nouveau pour le refermer.
4. Change la pratique d'une colonne dans son menu : son volet dit ce que règle la nouvelle. Pour voir une pratique « Par standards », crée-en une dans Conception, Pratiques, puis reviens à l'Exploration et choisis-la dans un menu.
