# Consigne du jour – lot 3 : la release

> Écrite par Cowork le 10 octobre 2026 à 11 h 42 (Toronto, mesurée par `date`). Remplace la consigne de relecture du lot 3, archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-10-10-lot3-relecture.md`. Tu peux commiter ce fichier avec la release.

## Verdict de Cowork

Corrections relues : `63e96d47` (mêmes ids de critères, mêmes codes de niveaux) et `490568c9` (sous-schéma : valeur non-objet omise) font ce qui était demandé. Le lot 3 est accepté. #1046 et #1047 inscrites : je les place dans la file à la prochaine recomposition.

## Décisions de Grégoire (10 oct., 11 h 42)

- **Ligne du bilan d'import, retenue telle quelle** : « N cartouche(s) déjà présente(s) à l'identique, non ajoutée(s) ».
- **Nouvelles, retenues** (mineure) :
  - Titre : « Ce qu'on importe d'une ancienne sauvegarde arrive entier et bien rangé »
  - Item : « Quand on importe une sélection depuis une ancienne sauvegarde, les cartouches restent liées à leur grille et apparaissent dans le trimestre ouvert ; une cartouche déjà présente n'est plus ajoutée en double ; la méthode de calcul d'une pratique et les règles d'une production arrivent complètes. »

## La release, dans cet ordre

1. `node scripts/release.mjs minor`, l'entrée des Nouvelles ci-dessus dans `js/changelog-data.js` (mots exacts), commit de release.
2. **Verdict complet sur le commit de release** : `cd tests && npm test`, Chrome, Safari et Cowork fermés. Le verdict porte sur ce commit, pas sur un commit antérieur. Grégoire te dira quand c'est fermé.
3. Push seulement si le verdict est vert. Un instable déjà connu hors lot (la barre des présences à 360 px) ne bloque pas, à condition de le nommer.
4. Après le push : Netlify `ready` sur le bon `commit_ref`, l'heure mesurée par `TZ=America/Toronto date` ; BACKLOG (#664, #952, #954, #655 et la trouvaille du lot 2 livrées ; #545 reste ouverte avec son exclusion) ; `OU-EN-EST-ON.md`, `CONSIGNE-DEMARRAGE-PROCHAINE-SESSION.md`, `RELAIS.md`.

## Ton constat d'ouverture

Les 8 derniers passages Playwright planifiés annulés sur GitHub : **inscris-le** au BACKLOG, avec la cause mesurée (concurrence, délai, désactivation…). Ne change rien au flux de travail : toucher aux minutes GitHub, c'est la décision de Grégoire (règle 7).

## Puis arrête-toi

Rapport court : la version en ligne, l'heure, le verdict (et ses instables nommés), et le geste que Grégoire peut vérifier à l'écran.

## Ajout de Cowork (12 h 43) – décision de Grégoire sur #1048

**Décision de Grégoire (10 oct., 12 h 43) : on arrête le passage Playwright de nuit sur GitHub.** Il ne se lance plus qu'à la demande (`workflow_dispatch` garde). On ne relève pas `timeout-minutes`.

Motif : le job est coupé à 60 min depuis au moins le 3 octobre, il ne juge plus rien et consomme une heure de minutes par jour ; la limite a déjà été relevée deux fois (15 → 40 → 60). Le garde-fou réel est le verdict complet local avant chaque push.

**Quand :** APRÈS le push de 1.196.0 et ses documents, dans un commit séparé. Rien avant que le verdict en cours soit rendu.

À faire :
1. `.github/workflows/tests.yml` : retirer le déclencheur `schedule` ; garder `workflow_dispatch` ; mettre à jour le commentaire d'en-tête (ligne 6) et celui du job 3, avec la date et le motif.
2. Le rituel d'ouverture lit l'état de ce job (« Sauté = `skipped`, jamais `success` ») : vérifie ce qui le lit (`garde`, `DERNIER`, rituel d'ouverture, `CLAUDE.md`, `PROTOCOLE.md`) et ajuste pour qu'un passage de nuit absent ne soit plus lu comme un manque ni comme un succès.
3. #1048 au BACKLOG : inscrite avec ta mesure, et close par cette décision.
4. Push (fichier de workflow et documents seulement : aucun verdict navigateur requis, Vitest au push suffit).
