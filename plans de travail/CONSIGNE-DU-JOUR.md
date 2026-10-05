# Consigne du jour – livrer #1028 (archiver les copies d'un trimestre clos)

> Écrite par Cowork le 5 octobre 2026 à 10 h 10 (Toronto, mesurée par `date`). Remplace la consigne des corrections, archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-10-05-1028-corrections.md`.

## Où on en est

Les corrections `ce564b52` sont relues par Cowork : **vertes**. Grégoire a tranché les mots : ils sont dans `MOTS-2026-10-05-1028-archiver-copies.md` (à côté de cette consigne, non commité). Lis-le en entier : ce sont les textes exacts. Une règle les traverse : **ne jamais promettre que les annotations se voient sans leur copie**, et dire que **toutes les données restent, résultats des étudiant·es et du groupe compris**.

Grégoire t'autorise, en te transmettant cette consigne, à commiter les fichiers de Cowork sur la branche, à écrire dans `BACKLOG.md`, à fusionner la branche dans `main`, à faire la release et à pousser.

## Ce que tu fais, dans cet ordre

1. **Commite** sur la branche les mots, cette consigne et son archive.
2. **Les mots** dans `ReserveCopies.MOTS` (et les refus d'E1 et de l'archive d'un groupe), exactement comme au fichier des mots. Adapte les essais qui lisent ces textes.
3. **Un essai de plus, au banc** : « Rouvrir » un trimestre dont les copies sont aux archives. Mesure ce qui se passe (rouvert ou refusé ?). Exigé dans tous les cas : rien n'est perdu, les copies restent « aux archives » et non « manquantes », et « Archiver le trimestre… » refuse tant qu'elles ne sont pas revenues. Si « Rouvrir » laisse naître une situation où une donnée se perdrait, arrête-toi et dis-le avant de livrer.
4. **Vitest complet**, puis **le verdict Playwright complet** (garde-éveil, Mac branché sur secteur).
5. **Fusionne** dans `main`, **release mineure** par `scripts/release.mjs` selon le skill `release-et-changelog`, ligne des Nouvelles telle qu'au fichier des mots. Coche #1028.
6. **Pousse**, mesure la mise en ligne chez Netlify, écris `RELAIS.md`.

## Ce que tu rends

La version en ligne et son heure mesurée ; le verdict Playwright (échecs, instables) ; en une ligne, ce que fait « Rouvrir » sur un trimestre dont les copies sont aux archives.
