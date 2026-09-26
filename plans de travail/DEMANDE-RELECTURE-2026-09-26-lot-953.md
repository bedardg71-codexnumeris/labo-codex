# Demande de relecture croisée, AVANT fusion – lot #953 « une archive rouverte propose aussi ses grilles et ses échelles »

> Écrite le 26 septembre 2026, vers 10 h 30 (Toronto), par Claude Code. Branche `lot-953-grilles-echelles-archive` (arbre principal), base `14314530` (1.159.11, poussée et verte au début de la session – mesuré). Un commit : `5b2c91a5`. **Rien n'est fusionné ni poussé, aucune release.** Verdict attendu dans `plans de travail/RELECTURE-2026-09-26-lot-953.md`. Un texte attend l'accord de Grégoire (§ 5).
>
> Pour lire le code sans changer de branche : `git diff 14314530..lot-953-grilles-echelles-archive -- js/ index.html tests/`.

## 1 · Grilles et échelles

**Confirmé à l'exécution AVANT le correctif** (WebKit, banc de #637 prolongé, `tests/integration/reserve-reouverture-cartouches-637.spec.js`) : groupe-cours d'a2025 versé par `Reserve.verserGroupeCours` (ZIP, aperçu K-β confirmé), rouvert dans un espace vierge. L'archive porte `a2025_grillesTemplates` et `a2025_echellesTemplates`, **et pas la forme nue**. La liste proposait **0 grille, 0 échelle**, et les deux cartouches s'y disaient « grille manquante ».

**Ce que fait le lot** : une petite fonction commune, `_lireDeuxFormes(donnees, nom)`, porte la règle de #637 — la forme `<trim>_<nom>` l'emporte en bloc, la nue ne sert que si aucune namespacée n'existe. Grilles, échelles et pratiques l'appellent ; **les cartouches aussi** (leur boucle ne fait plus que repérer les grilles citées, puis appelle la même fonction : une seule reconnaissance, pas deux). Le préfixe doit être un seul segment : `cartouches_a_b` n'est pas une forme namespacée de `cartouches_b`.

Les annotations « manquante » n'ont pas été touchées : elles se corrigent d'elles-mêmes (cas 4 du banc).

## 2 · Pratiques – mesuré, puis entrées au lot

**Mesure** (même banc, cas 6, avant correctif) : l'archive porte `pratiquesConfigurables` ET `a2025_pratiquesConfigurables`. La liste proposait **la seule forme nue** (« Pratique nue A (figée) »), et ignorait la namespacée.

**Pourquoi la nue est périmée, par structure** : `grep "'pratiquesConfigurables'" js/` ne rend aucun écrivain de la forme nue ; la seule écriture était la migration du 24 mai (`main.js`, l. 631), qui la copie vers chaque trimestre et ne la touche plus. Tout ce qui a été fait aux pratiques depuis vit sous `<trim>_pratiquesConfigurables` ; le versement copie pourtant encore la nue (`reserve.js`, l. 62). **Décision** : même règle, même fonction. ⚠ Je n'ai pas mesuré les données réelles de Grégoire (il faudrait son accord) : la conclusion repose sur l'absence d'écrivain, pas sur un relevé.

## 3 · Doublons – vérifiés, rien changé

`_doublon` compare à `cle('grillesTemplates')`, `cle('echellesTemplates')`, `cle('pratiquesConfigurables')` ; les quatre importeurs (`importerGrillesExternes`, `…EchellesExternes`, `…PratiquesExternes`, `…CartouchesExternes`) écrivent sous ces mêmes `cle(…)`. Conforme. Cas 7 du banc, sur l'écriture réelle d'`appliquerReimport` : grille et cartouches cochées, réimport → `a2026_grillesTemplates` contient `G637`, et `CART_A`, `CART_B` se rangent sous elle.

Rien n'est effacé : `_extraireRessources` est en lecture seule ; les importeurs ajoutent (`remplacer: false`).

## 4 · Preuves

- **Rouge avant** : les 4 cas neufs rouges sur `14314530`, les 3 de #637 verts.
- **Vert après** : 7 / 7 (WebKit).
- **Mutations, 4 sur 4 rouges** : forme complète retirée pour les grilles (3 rouges), pour les échelles (3), pour les pratiques (1) ; priorité inversée dans `_lireDeuxFormes` (3, dont le cas « deux formes » de #637). Restauration par copie, empreinte vérifiée.
- **Cas « deux formes divergent »** : le versement ne copie plus la forme nue des grilles ; le banc l'**ajoute au `donnees.json`** du ZIP versé (archive d'avant #358). C'est une archive fabriquée, pas un trajet : dis-le si tu le juges insuffisant.
- Vitest complet : 641 fichiers, **7 443 / 7 443**.
- Verdict Playwright complet : **pas encore** — après ta relecture et les corrections.

## 5 · Le texte que Grégoire doit accepter avant le push

**Nouvelles** (proposition de Cowork, ajustée puisque les pratiques entrent au lot) : « Archives : une archive rouverte propose aussi ses grilles, ses échelles et ses pratiques, et ses cartouches ne s'y disent plus « grille manquante ». »

## 6 · Ce que je te demande de regarder en particulier

1. La fonction commune : `_lireDeuxFormes` retire désormais les ids répétés pour les grilles, échelles et pratiques aussi (avant, seulement les cartouches). Un effet que je n'aurais pas vu ?
2. L'entrée des pratiques au lot, sur une preuve structurelle (§ 2).
3. La forme nue des pratiques reste copiée par le versement (`reserve.js`, l. 62). Hors lot : trouvaille, défaut « inscrire » si tu es d'accord.
