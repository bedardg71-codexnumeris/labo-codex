# Consigne du jour – livrer le lot 1 de l'enregistrement (#962, #986, #1029)

> Écrite par Cowork le 5 octobre 2026 à 13 h 44 (Toronto, mesurée par `date`). Remplace la consigne du lot 1 bis, archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-10-05-enregistrement-1029.md`.

## Où on en est

Le lot 1 bis (`a8329002`) est relu par Cowork : **vert**. Acceptés : la réouverture étendue à la lecture (sans elle, les éditeurs de la Conception échoueraient) ; #1030 et #1031 inscrites ; ta correction du compte des essais du lot B et sa cause (une ligne « failed » coupée par un filtre) : à l'avenir, lis le résumé final de Playwright en entier, jamais filtré.

**Le message tranché par Grégoire** (à 13 h 44), pour un échec qui reste malgré la réouverture, au tutoiement comme toute l'application :

> « Non enregistré : le navigateur a refusé l'écriture. Note ce que tu viens de saisir, puis recharge la page : ta saisie sera à refaire. »

Grégoire t'autorise, en te transmettant cette consigne, à commiter les fichiers de Cowork, à écrire dans `BACKLOG.md`, à fusionner la branche dans `main`, à faire la release et à pousser.

## Ce que tu fais, dans cet ordre

1. **Commite** cette consigne et son archive sur la branche.
2. **Le message** ci-dessus, pour ce seul cas (connexion fermée et réouverture impossible, ou nouvelle tentative refusée) ; les autres raisons (mémoire pleine…) gardent leur texte. Un essai qui le lit.
3. **Vitest complet**, puis **le verdict Playwright complet** (garde-éveil, Mac sur secteur). Lis son résumé final sans filtre.
4. **Fusionne** dans `main`, **release** par `scripts/release.mjs` selon le skill `release-et-changelog` (correctifs : patch). Ligne des Nouvelles, telle quelle :
   « Enregistrement : quand une écriture échoue, l'application dit « Non enregistré » et le message reste, au lieu d'afficher « Enregistré ». Sur l'iPad, elle rétablit seule sa liaison après une mise en arrière-plan, et le témoin s'affiche au-dessus du clavier. »
   Coche #962, #986, #1029.
5. **Pousse**, mesure la mise en ligne chez Netlify, écris `RELAIS.md`.

## Ce que tu rends

La version en ligne et son heure mesurée ; le verdict Playwright (échecs, instables) ; le chemin du fichier de la porte terrain à jour.
