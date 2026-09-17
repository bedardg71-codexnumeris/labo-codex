# Consigne suivante – la carte Complétion dit ce que dit sa fraction (lot 30 : suite de #871, relectures des lots 27 et 28)

> Écrite le 17 septembre 2026, 9 h 13 (Toronto), pendant le lot 29 (règles spéciales de la sommative, `1.142.25`).
> **À n'exécuter qu'après le push du lot 29** : au démarrage, `git log origin/main` (pas `git log`) doit montrer `1.142.25` ; sinon, arrête-toi et signale-le. Puis archive `plans de travail/CONSIGNE-DU-JOUR.md` sous `_ancienne-CONSIGNE-DU-JOUR-2026-09-17-regles-speciales-sommative.md` et renomme ce fichier en `CONSIGNE-DU-JOUR.md`.

Mandat : les deux relectures croisées de Cowork du 17 à 9 h 10 (en tête des sections 1.142.23 et 1.142.24 de `RELAIS.md`). Une contradiction à l'écran, née de la décision de Grégoire sur la terminale, et deux trous sans mot.

## 1 · La carte Complétion (mots choisis par Grégoire le 17 vers 9 h 15)

- Mesuré par Cowork `[exécuté]` (harnais de `sentinelle-871-la-fraction-de-completion-…`, élève qui a remis ses 9 artefacts mais pas la terminale) : « Complétion 90% • Artefacts remis : 9/10 … 0 artefact non remis ou non recevable … tous les artefacts remis ! ». Pack démo : `DEMO006`, `DEMO020`.
- **La liste des non-remis et le message lisent la même source que la fraction** : le détail de la pratique (`obtenirDetailsCompletion`) doit pouvoir dire QUELLES productions il compte et lesquelles sont remises, pas seulement combien. L'évaluation terminale manquante paraît alors dans la liste des non-remis.
- **Textes, tels quels** (`genererSectionMobilisationEngagement`, carte Complétion et « Méthodologie de calcul ») :
  - la ligne : **« Productions remises : 9/10 »** ;
  - l'intitulé des non-remis : **« 1 production non remise ou non recevable »** (accord au pluriel : « 2 productions non remises ou non recevables ») ;
  - le message : **« Toutes les productions sont remises ! »** ;
  - la Méthodologie : **« Indice C = 90% — 9 productions remises / 10 productions au total »**.
- Ces quatre textes n'emploient plus `obtenirTermeProduction` : le terme personnalisé des artefacts reste partout ailleurs (pastilles, Performance, liste des remis si elle ne montre que des artefacts – dis ce que tu choisis et pourquoi). Mesure si « remis » / « remises » s'accorde déjà par `accordTermeProduction`.
- Le rapport (« 9 remises / 10 productions ») ne change pas.

## 2 · Deux trous sans mot

- **Trou de preuve de la relecture du lot 27 (L1)** : `obtenirDetailsCompletion` qui résout TOUJOURS la sommative reste vert, parce que sur le banc (a) la sommative et la configurable comptent pareil. Ajoute un cas où la règle de la pratique active diffère de celle de la sommative (standards : un travail dû plus tard au dénominateur) et vérifie que L1 rougit.
- **Trouvaille de la relecture du lot 28** `[lecture]` : `construction-attributs.js:137` (Comparateur, attribut « Reprises » des standards) ignore l'alias `derniers` ; une pratique « N derniers » lit « Selon la sélection d'artefacts » au lieu de « Récence (dernier essai retenu) ». Corrige par l'alias, comme aux quatre autres lecteurs ; un essai qui rougit sans lui.
- Au passage, **sans release si c'est seul** : les deux trous de preuve du lot F, si tu passes par ces fichiers. Et corrige dans `RELAIS.md` la mention « branche d'audit à supprimer après le push » (c'est fait).

## Preuve

- Sentinelle : l'élève « terminale seule manquante » – ligne, intitulé, liste (la terminale y figure), message absent, Méthodologie ; l'élève complet – « Toutes les productions sont remises ! » et « 10/10 » ; l'élève sans production évaluée – affichage actuel inchangé.
- Break-test : la liste relit les artefacts ; le message relit les artefacts ; l'ancien mot revient à l'un des quatre sites ; l'alias `derniers` retiré.
- Banc WebKit sur le pack démo : `DEMO006` et `DEMO020` lisent « Productions remises : 9/10 » et voient la terminale dans les non-remis.
- Vitest depuis `tests/`, puis le verdict Playwright, Cowork fermé. **Porte terrain : aucune attendue.** **Stock** : rien d'écrit.

## Livraison

Patch `1.142.26` par `scripts/release.mjs`. Phrase de « Nouvelles » : propose-la à Grégoire avant de la figer. Puis `OU-EN-EST-ON.md`, `RELAIS.md`, une fiche pour la carte si aucune ne la porte (famille #871), le markdown du tri. Commite aussi les fichiers de Cowork : la consigne renommée et son archive, les deux ajouts de 9 h 10 dans `RELAIS.md` s'ils ne sont pas déjà commités. Push par `scripts/pousser.sh`, puis signale à Cowork que c'est poussé.
