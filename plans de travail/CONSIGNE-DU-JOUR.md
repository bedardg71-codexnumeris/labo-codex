# Consigne du jour – #953 : une archive rouverte propose aussi ses grilles et ses échelles

> Écrite le 26 septembre 2026, vers 9 h 40 (Toronto), par Cowork, sur `main` = `14314530` (1.159.11 fusionnée ; verdict et push de `pousser.sh` en cours au moment de l'écriture). **Ne commence qu'une fois ce push terminé et vert.** À remesurer avant tout code.
> La précédente (lot #643 #654 #637, 1.159.11) est archivée sous `plans de travail/_ancienne-CONSIGNE-DU-JOUR-2026-09-26-lot-cartouches.md` (déplacée par Cowork, à commiter avec ce lot).
> Lot choisi par Grégoire le 26 sept. vers 9 h 40 : il termine le geste livré le matin même (#637). Sans lui, une archive rouverte propose ses cartouches, mais chacune s'y dit « grille manquante ».

## 0 · Ce que Grégoire verra, en une phrase

Quand il rouvre une archive, la liste propose aussi les grilles et les échelles du trimestre archivé, et ses cartouches ne s'y disent plus « grille manquante ».

## 1 · Ce que Cowork a lu (lecture seule, sur `14314530` – non exécuté)

- `js/reserve-ouvrir.js`, `_extraireRessources` (l. 215) : les grilles (l. 234), les échelles (l. 239) et les pratiques (l. 300) ne sont lues que sous la clé NUE (`donnees.grillesTemplates`, etc.). Les productions sont lues sous les deux formes (`/_productions$/`), et les cartouches depuis #637.
- `js/reserve.js` : le versement range grilles, échelles et pratiques sous la clé du trimestre (`CLES_SANS_FILTRE`, l. 115-117, passe préfixe) ; les grilles et les échelles sont retirées du passage des clés globales depuis #358 (l. 58-60 : « la clé globale héritée est vidée au boot »). `pratiquesConfigurables` y est encore, sous la forme nue (l. 62), en plus de la forme namespacée.
- Les annotations « manquante » (l. 304 et suivantes) se calculent sur les grilles et échelles extraites plus haut : elles se corrigeront d'elles-mêmes si l'extraction lit les bonnes clés.
- Témoin d'exécution : #953 a été constatée par toi au navigateur, dans `tests/integration/reserve-reouverture-cartouches-637.spec.js`.

## 2 · Ce qui est attendu

1. **Grilles et échelles** : `_extraireRessources` reconnaît `<préfixe>_grillesTemplates` et `<préfixe>_echellesTemplates`, avec **la même règle que #637** : la forme namespacée l'emporte ; la nue ne sert que si la namespacée manque. Reprends la même reconnaissance que pour les cartouches, sans en fabriquer une seconde : si une petite fonction commune s'impose, ton choix, dis-le en une ligne.
2. **Pratiques – à mesurer d'abord, ta décision ensuite.** L'archive porte `pratiquesConfigurables` sous les deux formes. Mesure au navigateur ce que la liste propose aujourd'hui pour une archive récente : si la forme nue est vide ou périmée par rapport à la namespacée, applique la même règle aux pratiques dans ce lot (même fonction, même défaut) ; si les deux formes concordent, n'y touche pas et dis-le. Dans les deux cas, une ligne dans le rapport.
3. **Doublons** : `_doublon` compare déjà au trimestre actif (`cle('grillesTemplates')`, etc., l. 216-224) ; c'est là que la réouverture écrira. Vérifie-le sur l'écriture réelle d'`appliquerReimport`, sans rien changer si c'est conforme.
4. **Rien n'est effacé**, ni dans l'archive ni dans le trimestre (limite de Grégoire du 20 sept.).

## 3 · Preuves attendues

- Prolonge le banc WebKit de #637 plutôt que d'en créer un parallèle : un groupe-cours versé en ZIP par `Reserve.verserGroupeCours`, rouvert dans un espace vierge. **Rouge avant** (grille absente de la liste, cartouche « grille manquante ») ; **vert après** (grille et échelle proposées, plus aucune mention « manquante »).
- Un cas où les deux formes coexistent et divergent : la namespacée l'emporte.
- Réimporter la grille ET sa cartouche : la cartouche se range sous une grille présente dans le trimestre actif.
- Mutations : retirer la reconnaissance de la forme complète (grilles, puis échelles) → rouge ; inverser la priorité → rouge.
- Suite complète Vitest.

## 4 · Hors lot, à ne pas toucher

- Les deux défauts de l'import sélectif (#952, #954) et la clé nue du même bloc (#655) : un prochain lot, dans `import-export.js`.
- L'unification des imports (#627).
- `js/codex-data.js`.

## 5 · Livraison

- **Relecture croisée de Cowork OBLIGATOIRE** (réouverture d'archive : écrit dans le trimestre). Ordre du `PROTOCOLE.md` : commit sur une branche → `DEMANDE-RELECTURE-2026-09-26-lot-953.md` → relecture → corrections → verdict → fusion et push.
- Correctif (patch).
- **Nouvelles, proposition de Cowork, à soumettre à Grégoire avant le push** : « Archives : une archive rouverte propose aussi ses grilles et ses échelles, et ses cartouches ne s'y disent plus « grille manquante ». » (à ajuster si les pratiques entrent au lot.)
- **Pas de porte terrain** : le banc à deux contextes fait la preuve ; Grégoire ne fabrique pas de données fictives.
- Fin de lot : sortir le lot de `FILE-DES-LOTS.md`, cocher #953.
