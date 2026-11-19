# Rapport, 19 au 20 nov. 2026 (session de nuit B), lot 2 : « Nous faisons » de « Monter ton cours »

**Dernier relais.** Branche `lot/nous-faisons-cours`. Consigne : `plans de travail/CONSIGNE-2026-11-19-nous-faisons-cours.md` (le relais du 19 nov., mot pour mot, avec les deux changements du mandat de la nuit). EN COURS : les mesures préalables sont ci-dessous ; le code suit.

## 0. La base de l'aperçu (changement 1 du mandat)

- Partie de `origin/claude/ecstatic-brown-urn6v8` à **`ebc9a9ad`**, quoi qu'il existe d'autre (aucune branche `lot/nous-faisons-*` n'existait à 22 h 40 UTC). Sa session avait poussé son rapport (`RAPPORT-2026-11-17-je-regarde-recevoir.md`, sur la branche).
- **Fusion 1** : `git merge --no-ff origin/main` (`ade09e939`, la 1.250.0), commit `121e9b41`. Conflits tranchés en gardant les deux côtés : `index.html` (jetons `?v=` : `20261119w` pour chaque fichier dont le contenu fusionné diffère de `main`, commentaires réunis) et `BACKLOG.md` (le dernier ID de `main`, #1295, avec la mention de #1286 pris sur la branche ; les deux sections neuves l'une après l'autre).
- **Fusion 2** : `git merge --no-ff origin/lot/glisser-alignement` (**`465c2970`, la PR #34**, le correctif de #1295 mesuré sous WebKit ; voir le relais de la nuit : le lot 1 de cette session en est un double, gardé sur `lot/glisser-alignement-nuit-b`). Sans conflit.
- Ces deux fusions font partie de l'aperçu : elles en sortent avec lui.

## 1. Les trois mesures, avant le code

### (a) Le glisser d'une leçon dans le « Planificateur », au doigt : IL NE CHANGE PAS SA SEMAINE (mesuré sous Chromium ; WebKit non mesurable ici)

Sonde non gardée, carte de la démo, 1180 × 820, une leçon de « Non planifié » glissée sur la rangée de la semaine 7, toucher émulé (`hasTouch`, `Input.dispatchTouchEvent`, dix pas) contre la souris (mêmes points) :

| Geste | Ce que la page reçoit | La semaine |
|---|---|---|
| souris | `pointerdown`, 10 `pointermove`, `pointerup` | **7** |
| doigt, au milieu de la pastille | `pointerdown` (sur la pastille), puis **`pointercancel`** : le navigateur reprend le geste pour défiler | **inchangée** |
| doigt, à 14 px du bord gauche de la pastille | le toucher part sur la **poignée de la palette** (ajustement de la cible d'un toucher), pas sur la pastille | **inchangée** |

Cause lue dans le code : `initialiserDragGrille` (`js/planification-carte.js`) écoute les Pointer Events, mais rien ne pose `touch-action` sur la grille : au doigt, le défilement natif l'emporte et annule le geste (le commentaire d'août le disait : « souris d'abord ; le tactile … reste une porte ouverte »). **Rien n'est changé** : la bulle 7 dit « y glisser une leçon change sa semaine, et donc ses dates » ; c'est vrai à la souris, pas au doigt (mesuré ici sous Chromium, inféré pour l'iPad). **Cowork tranchera** (les mots de la bulle, ou le geste au doigt). Le mot est gardé tel quel. Porte : le vrai iPad (§ porte terrain).

### (b) La carte active est-elle rattachée au cours ? Le plus souvent oui ; trois cas où non (lu dans le code, non rejoué)

La date par groupe de la bulle 3 exige une carte rattachée au cours (sinon l'Inspecteur dit « Carte rattachée à aucun cours : pas de date »). Une carte reçoit le cours ACTIF au moment où elle est créée (`creerEntreeIndex`, `js/planification-donnees.js`) ; la première carte d'un trimestre naît à la **première visite** d'Alignement (`initialiserSiNecessaire`). D'où :

1. **Alignement ouvert avant que le cours existe** dans ce trimestre (une visite pendant « Mettre ta classe en place », entre le trimestre et le cours, ou une exploration avant) : la première carte reste sans cours.
2. **Une carte créée quand un autre cours était actif** : rattachée à cet autre cours (ses dates sont celles de l'autre horaire).
3. **Une carte plus ancienne que le rattachement** (`coursId`), ou importée d'un cours absent de ce codex : sans cours.

Dans le cas ordinaire du parcours (le troisième parcours fait, donc un cours actif, et Alignement ouvert pour la première fois par la bulle 1), la carte naît rattachée : la bulle 3 tient. Rien n'est ajouté.

### (c) La fin de la bulle 7 : DANS L'APERÇU, « TERMINER » SEUL

Le moteur offre « Parcours suivant » quand le parcours qui suit, dans le panneau, est OUVERT (`suivantDe`, `js/assistance.js`). L'ordre du panneau : … « Recevoir », « Monter ton cours », « Mettre tes données à l'abri » (`donnees`), … Sur cette base, `PARCOURS_OUVERTS` = `decouvrir`, `classe`, `evaluer`, `recevoir` (+ `monter`, ouvert sur la branche par un commit à part) : **`donnees` est fermé, son « Nous faisons » n'est pas dans la base**. La bulle 7 n'offre donc que « Terminer », et sa consigne suit ses boutons (`consigneDeLaFin`) : « Touche « Terminer » ». Dans les bancs, qui rouvrent tous les parcours, elle offre « Parcours suivant » et « Terminer », de même poids, et dit « Touche « Parcours suivant », ou « Terminer » ». Rien n'est inventé : quand le sixième parcours sera ouvert, l'aperçu dira les deux suites.
