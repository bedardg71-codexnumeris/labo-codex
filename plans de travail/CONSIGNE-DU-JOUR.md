# Consigne du jour – lot 4 : la release

> Écrite par Cowork le 10 octobre 2026 à 15 h 48 (Toronto, mesurée par `date`). Remplace la consigne du lot 4, archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-10-10-lot4-rien-ne-se-perd.md`. Tu peux commiter ce fichier avec la release.

## Verdict de Cowork

Relus : `72479fef` (#845), `ed77035c` (#938), `e02fbe6c` (#522 lot 5b), `72bef975`. **Accepté sans correction.** Tes suppositions sont retenues : le cache vidé après le commit IndexedDB ; les contournements de la Réserve retirés ; la liste inversée de l'assistant (il nomme ce qu'il édite, le reste passe) ; la configuration conservée dans la même famille seulement ; les catégories actives non réécrites tenues pour désactivées ; la question du dépôt d'un cours sur la liste lue d'abord. Les 11 sites inscrits (import sélectif, Réserve) restent à la fiche, hors de ce lot.

## Décision de Grégoire (10 oct., 15 h 48)

Nouvelles, retenues (mineure) :
- Titre : « Rien ne se perd en silence »
- Item : « Rouvrir une pratique de notation dans l'assistant ne lui fait plus perdre ses jetons ni son réglage “notes finales” ; deux gestes faits coup sur coup ne s'effacent plus l'un l'autre ; et ce qu'on supprime disparaît aussitôt de l'écran. »

## La release, dans cet ordre (comme au lot 3)

1. `node scripts/release.mjs minor`, l'entrée ci-dessus dans `js/changelog-data.js` (mots exacts, espaces insécables avant les points-virgules comme ailleurs), commit de release.
2. Verdict complet sur le commit de release : `cd tests && npm test`, Chrome, Safari et Cowork fermés. Un banc qui fige l'ancien comportement se met à jour avec sa raison écrite, et on vérifie qu'il peut encore échouer, puis nouveau verdict complet.
3. Push seulement si vert.
4. Après le push : Netlify `ready` sur le bon `commit_ref`, heure par `TZ=America/Toronto date` ; BACKLOG (#845, #938 livrées ; #522 : lot 5b livré, le reste inscrit) ; `OU-EN-EST-ON.md`, `CONSIGNE-DEMARRAGE-PROCHAINE-SESSION.md`, `RELAIS.md`.

## Le geste à proposer à Grégoire dans ton rapport

Sur ses vraies données, une seule fois, une fois la version en ligne : **Conception › Pratiques de notation**, la carte de sa pratique active doit afficher « N jetons » s'il a réglé des jetons, et « notes finalisées » s'il était passé en notes finales. Si une mention attendue manque, la pratique a perdu ce réglage avant ce lot (stock de #938) : il le remet lui-même au formulaire. Rien à faire si les deux sont comme il les a laissés.

## Puis arrête-toi

Rapport court : la version en ligne, l'heure, le verdict (et ses instables nommés), le geste ci-dessus.
