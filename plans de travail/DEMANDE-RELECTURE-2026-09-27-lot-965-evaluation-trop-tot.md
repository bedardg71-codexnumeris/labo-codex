# Demande de relecture – #965, carte d'alignement lot 3 : « Mon évaluation me dit si elle arrive trop tôt »

> Écrite le 27 septembre 2026 par Claude Code (session infonuagique), pour Cowork. Branche `claude/carte-alignement-965-evaluation-trop-tot`, **partie de la branche #964** (`70dfb20b`) : elle lit les objectifs cochés par une évaluation (`objectifsVerifiesPar`, #964). Consigne : `plans de travail/CARTE-ALIGNEMENT-2026-09-27-3-mon-evaluation-arrive-trop-tot.md`. **Pas de release ni de fusion avant ta relecture** ; le guide (#966) part dans la même version, jamais avant.

## 0 · La règle « même séance », proposée avant de coder

**Mesuré** : dans une leçon, les blocs sont disposés en colonne et `reLayoutConteneur` (l. ~5393) **retrie `enfants` par position verticale à chaque mise en page** ; l'export du plan suit le même ordre. L'ordre des blocs est donc fiable.

**Proposé à Grégoire, retenu (27 sept.)** : dans la MÊME leçon, un bloc placé **au-dessus** de l'évaluation est enseigné avant ; **en dessous**, il n'est servi qu'après (⚠). Deux leçons différentes posées sur la même séance : l'ordre n'est pas connu, « avant » (la supposition de Cowork, gardée pour ce cas).

## 1 · Ce qui change à l'écran

- **Chaque bloc Évaluation porte une pastille** dans son en-tête, juste après le sélecteur de type (hors du couloir calibré de la poignée et du badge amont). Quatre états, symboles et infobulles validés, reproduits tels quels : `!` « Aucun objectif relié : cette évaluation ne dit pas ce qu'elle vérifie. » ; `✕` « Un objectif vérifié n'est servi par aucun bloc : il n'a pas été enseigné. » ; `⚠` « Un objectif vérifié n'est servi qu'après cette évaluation. » ; `✓` « Chaque objectif vérifié a été enseigné avant cette évaluation. »
- **L'Inspecteur de l'évaluation** montre la légende des quatre états (« Pastille de l'évaluation »), comme celui de la leçon montre celle des objectifs (#445 : sur iPad, l'infobulle n'existe pas).
- **Rafraîchissement** : même point que les pastilles d'objectifs (`mettreAJourBadge`, appelé par `sauvegarder` à chaque écriture).

## 2 · Les règles, telles que codées (`evaluerPastilleEvaluation`)

- Objectifs de l'évaluation : ceux qu'elle coche (`objectifsVerifiesPar`, #964). **Les liens « se vérifie par » hérités n'en créent aucun** : une évaluation qui n'a que ces liens reste à « ! » (son badge amont, lui, reste ✓ comme au lot précédent).
- Blocs qui enseignent : les blocs **non-évaluation** qui servent l'objectif (`objectifsServisPar`), où qu'ils soient. Une évaluation n'enseigne pas, même placée avant.
- « Avant » : même leçon → ordre des blocs ; sinon semaine, puis rang de séance ; même séance, autre leçon → avant.
- Un objectif servi avant ET après : avant. Plusieurs objectifs : le pire l'emporte (✕, puis ⚠, puis ✓). Aucun objectif : « ! ».
- **Ne conclut pas** (« avant », marqué `inconclusif` dans le résultat) : leçon du bloc ou de l'évaluation sans semaine ; même semaine avec une séance non posée ; évaluation hors de toute leçon.

## 3 · Les cas « leçon sans semaine » rencontrés (demandé par la consigne)

- **Carte démo** : ses leçons n'ont **aucune semaine**. Toute évaluation qui y coche l'objectif d'une AUTRE leçon tombe dans le cas inconclusif, et affiche ✓ par défaut. L'essai navigateur pose donc les semaines 1 et 2 avant de mesurer.
- **Même leçon** : la règle ne lit pas la semaine (l'ordre des blocs suffit) ; une leçon sans semaine y conclut normalement.
- **Cartes réelles de Grégoire** : non mesurées ici (pas de données dans ce conteneur). **Question pour Grégoire** : faut-il, pour ces cas, une pastille distincte, ou le ✓ par défaut convient-il ?

## 4 · Couleurs proposées (Grégoire tranche à l'écran)

Même gabarit que la pastille d'objectif. `!` : pointillé, couleur de l'évaluation, estompé ; `✕` : contour et symbole rouge d'erreur existant (`--rouge-erreur`) ; `⚠` : orange du ⚠ des nœuds (`#F59E0B`) ; `✓` : **contour** couleur de l'évaluation. ⚠ **Écart avec la pastille d'objectif** (✓ pleine) : posée dans l'en-tête, une pastille pleine était indiscernable du badge amont ✓ voisin (mesuré sur la première capture). Captures : les huit états (sombre et clair), transmises à Grégoire dans la conversation, produites par `CAPTURES_965=<dossier>` sur l'essai navigateur.

## 5 · Preuves

- **Nouvelle sentinelle** `tests/unit/sentinelle-pastille-evaluation-965.test.js`, 17 essais (cours fictif « Apiculture martienne ») : les six cas de la consigne ; au-dessus / en dessous ; séance antérieure ; avant ET après (et sa contre-épreuve) ; le pire l'emporte ; une évaluation n'enseigne pas ; sans semaine (inconclusif) ; liens hérités → « ! » ; infobulles mot pour mot ; rendu dans l'en-tête ; lecture seule.
- **Mutations Vitest, dix sur dix rouges** (M7, « les évaluations servent aussi », **survivante au premier passage** : essai ajouté).
- **Navigateur** `tests/integration/planif-pastille-evaluation-965.spec.js` : les quatre états sur une évaluation de la carte démo, sans reconstruire la carte (classe, symbole, infobulle) ; la légende dans l'Inspecteur. Deux mutations rouges (pas de rafraîchissement ; légende absente). **Vert sous Chromium, avec les 23 essais `planif-*`.** Verdict WebKit à prendre sur le Mac.
- **Audit `innerHTML`** (`lint-securite` F.15) : un cas suspect de plus au premier passage (légende de l'Inspecteur, contenu littéral mais concaténé sur la ligne `innerHTML`) ; construit dans une fonction, retour au seuil **sans** relever la baseline.

## 5 bis · Suite complète

- **Vitest complet** (depuis `tests/`) : **646 fichiers, 7 532 essais verts**, code de sortie 0.
- **Playwright complet : non lancé** (pas de WebKit ici). Verdict à prendre sur le Mac, avant toute fusion.

## 6 · Les mots – à faire accepter par Grégoire

Les quatre infobulles sont validées (consigne). Neuf : le titre de la légende dans l'Inspecteur, « Pastille de l'évaluation ».

## 7 · Stock

Rien n'est écrit. Sur une carte existante, chaque évaluation affiche désormais une pastille ; celles qui n'ont que des liens hérités affichent « ! » (consigne).
