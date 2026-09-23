# Consigne du jour – Lot N5 : dénotation, chaque cible garde son identité, et ses coches avec elle (#717)

> Écrite le 23 septembre 2026, 9 h 35 (Toronto), par Cowork, sur `origin/main` = `78575a46` (1.155.4, en production chez Netlify depuis 9 h 19, déploiement mesuré). **Proposée** tant que Grégoire ne l'a pas relayée.
> La précédente (lot N4, livrée en 1.155.4) est archivée sous `plans de travail/_ancienne-CONSIGNE-DU-JOUR-2026-09-23-lot-n4-specifications.md` (déplacée par Cowork, à commiter avec ce lot).
> **La fiche fait foi** : `BACKLOG.md`, #717 (≈ l. 801 ; recoupe #465 « ids de cibles stables »). Premier lot de l'ordre dans `plans de travail/FILE-DES-LOTS.md` (N5, N6).

## 0 · La décision de Grégoire (23 sept. 2026, 9 h 30) – elle fait foi

Question posée par Cowork : comment l'application garde-t-elle chaque coche sur sa cible ? A, une identité permanente donnée à chaque cible à sa création ; B, retrouver les cibles par leur nom ; C, garder la position et avertir. **Réponse : A.** Déplacer ou renommer une cible ne touche plus aux coches déjà faites ; une cible retirée emporte ses coches.

## 1 · Ce que Cowork a mesuré (lecture seule, 9 h 30) – deux écrivains, une même faute

- **La note** : `_calculerPerformanceDenotation` (`js/pratiques/pratique-configurable.js` ≈ l. 380-400) exige que **toutes** les cibles de `objectifs` soient confirmées dans `jugementsDenotation[pratiqueId][da].ciblesAtteintes[cible.id]` ; sinon `Math.min(note, 59)`. Les coches sont donc indexées par l'**id** de la cible.
- **Écrivain 1, l'assistant** : `creerPratiqueV2` (`js/wizard-pratique-v2.js` ≈ l. 2737-2741) lit une zone de texte (une cible par ligne, champ `ciblesDenotation`, l. 241) et nomme les cibles **par position** : `{ id: 'cible-' + (i + 1), nom }`. À la réouverture (`chargerPratiqueExistante`, ≈ l. 3180), les ids sont jetés : seuls les noms reviennent dans la zone de texte.
- **Écrivain 2, la gestion des pratiques** : même faute, recopiée. Chargement (`js/pratiques-gestion.js` ≈ l. 1275, noms seuls dans `mat-den-cibles`) et enregistrement (≈ l. 1653-1658, `'cible-' + (i + 1)`).
- **Lecteurs** : la saisie des jugements (`js/pratiques/denotation-saisie-ui.js` ≈ l. 215, coches écrites par `c.id`), `denotation-jugements.js`, la note. Ils lisent l'id : ils n'ont pas à changer.
- **Le verrou existant** : la sentinelle G-1 (1.142.24) fige les ids `cible-N` de l'assistant, et le banc `audit-pratiques-notation-config-2026-09-16` (A4) fige exprès la valeur fausse (59 → 78). Les deux passent à la règle A dans ce lot.

## 2 · Ce que fait le lot

**2a. Une cible reçoit son id une fois, à sa création, et le garde.** Un id neuf n'est jamais la position et n'est jamais réutilisé (un id retiré ne revient pas sur une autre cible). Forme de l'id : **décidé par toi**.

**2b. Les deux éditeurs gardent l'identité à la réouverture.** Une zone de texte ne peut pas porter d'identité (renommer une ligne la rend méconnaissable). **Décidé par Cowork** : dans l'assistant et dans la gestion des pratiques, les cibles s'éditent comme une **liste de champs, un par cible**, chacun portant son id : ajouter, renommer, retirer, déplacer. Renommer garde l'id. Un seul composant pour les deux écrans, pas deux copies (même faute recopiée deux fois aujourd'hui). Skill `design-interface` : le composant suit `design-system.html`, cibles tactiles iPad comprises. Les mots de ses boutons sont ceux que l'application emploie déjà pour ce geste ailleurs ; s'il faut un mot neuf, propose-le dans le rapport.

**2c. Retirer une cible qui porte des coches : la note change, et l'écran le dit avant.** Retirer une cible fait légitimement monter la note des élèves à qui il ne manquait qu'elle (c'est ce que le collègue demande en la retirant). Au moment de l'enregistrement, si une cible retirée porte des coches, **une question nomme la cible et le nombre d'élèves concernés** avant d'écrire. Les coches de la cible retirée **ne sont pas effacées** des données (limite de Grégoire du 20 sept.) : elles cessent simplement d'être lues.

**2d. Le stock : aucune conversion.** Les pratiques déjà créées portent `cible-1`, `cible-2`… : ce sont des ids valides, et leurs coches y sont indexées. **Ils restent tels quels** ; seul ce qui est créé ensuite reçoit la forme neuve. ⚠ Une pratique déjà réordonnée avant ce lot a pu déplacer ses coches sur la mauvaise cible : ce stock-là ne se répare pas d'office (règle « tarir n'est pas réparer »). Mesure si les données d'essai en contiennent un, et dis-le.

## 3 · Arrêt prévu

Si un lecteur de `objectifs` (export, rapport, import d'une pratique partagée, Réserve) dépend de la **forme** `cible-N` ou de l'**ordre** des cibles pour autre chose que l'affichage, **arrête-toi et dis lequel** : une pratique qui voyage (partage, import) est de la rétro-compatibilité (`CLAUDE.md`, « ce qui voyage »).

## 4 · Tests

- Le constat #717, rejoué par l'assistant réel : deux cibles, les deux cochées, note 78 ; retirer la première → la cible restante garde sa coche, la note reste 78 (et non 59 → 78 par glissement) ; déplacer → coches inchangées ; renommer → coches inchangées.
- La même chose par la gestion des pratiques.
- Retirer une cible cochée : la question nomme la cible et le nombre d'élèves ; « annuler » n'écrit rien.
- Un id retiré n'est jamais redonné à une cible ajoutée ensuite.
- Stock : une pratique aux ids `cible-N` s'ouvre, s'enregistre sans rien toucher, et ressort **identique** (ids et coches).
- Sentinelle : aucun `'cible-' + (i + 1)` ni équivalent positionnel dans `js/`.
- Break-test sur chaque assertion ; suite Vitest complète verte ; une spec WebKit du composant (iPad 768 px).

## 5 · Livraison

- Version **patch** par `scripts/release.mjs`. Item de « Nouvelles » **proposé, à valider par Grégoire avant le push** : il dit que déplacer, renommer ou retirer une cible ne déplace plus les coches déjà faites.
- Commit, relecture de Cowork, corrections, verdict, push.

## 6 · Le geste que Grégoire vérifiera à l'écran (s'il le souhaite)

Il n'utilise pas la dénotation. Une porte terrain n'est due que pour le composant sur iPad, si la spec WebKit ne suffit pas à le juger : dis-le dans le rapport.
