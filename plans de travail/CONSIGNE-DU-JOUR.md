# Consigne du jour – livrer le lot 2 de l'enregistrement (#982, #984)

> Écrite par Cowork le 5 octobre 2026 à 19 h 12 (Toronto, mesurée par `date`). Remplace la consigne du lot 2, archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-10-05-enregistrement-partout.md`.

## Où on en est

Le lot 2 (`6c85c6ed`, `480e7752`, `claude/enregistrement-partout`) est relu par Cowork : **vert, sans correction**. Acceptés : `annoncerEcritureUsager` et sa fenêtre de 100 ms (le commit capturé à l'appel est ce qui la rend sûre) ; un lot qui attend toujours ses commits ; `changerPratiqueActive` qui annonce ses deux clés ; les trois écritures de la machine laissées silencieuses ; ta supposition sur les réglages d'interface (règle de Grégoire : partout, de la même façon).

**Le main local a divergé** : une session parallèle (audit du démo, lecture seule) y a commité `c9fc8f4c` (son rapport) sans le pousser, alors que `origin/main` a reçu ton relais `62f7e5ad`. Les deux ne touchent que des documents.

Grégoire t'autorise, en te transmettant cette consigne, à commiter les fichiers de Cowork, à écrire dans `BACKLOG.md`, à fusionner la branche dans `main`, à faire la release et à pousser.

## Ce que tu fais, dans cet ordre

1. **Commite** cette consigne et son archive sur la branche.
2. **Réconcilie `main`** : rebase le main local (`c9fc8f4c`, le rapport d'audit du démo) sur `origin/main`, sans modifier le rapport. La **version non suivie** du même rapport qui traîne dans l'arbre : ne la touche pas et ne la commite pas ; dis-moi son chemin et en quoi elle diffère de la version commitée (un `diff --stat` suffit).
3. **Vitest complet**, puis **le verdict Playwright complet** (Mac sur secteur, garde-éveil ; résumé final lu sans filtre).
4. **Fusionne** la branche dans `main`, **release** par `scripts/release.mjs` selon le skill `release-et-changelog` (patch). Ligne des Nouvelles, telle quelle :
   « Enregistrement : les gestes qui enregistraient sans rien dire affichent désormais « Enregistré », comme partout ailleurs ; un échec dit « Non enregistré », et le message reste. »
   Coche #982 et #984.
5. **Pousse**, mesure la mise en ligne chez Netlify, écris `RELAIS.md`.

## Ce que tu rends

La version en ligne et son heure mesurée ; le verdict Playwright (échecs, instables) ; la ligne sur la version non suivie du rapport d'audit.
