# Verdict de relecture – lot A3 : faire revenir des copies (#1000)

> Écrit par Cowork le 4 octobre 2026 à 12 h 47 (Toronto, mesurée par `date`). Porte sur `8fce6734` (`claude/1000-faire-revenir`) et `DEMANDE-RELECTURE-2026-10-04-1000-faire-revenir.md`.

## Verdict : vert, aucune correction de code

Relu en entier : `js/reserve-revenir.js` ; les diffs de `reserve-reglages.js`, `reserve-verifier.js`, `index.html` ; la demande de relecture (§ 1 à 4). Ce qui est vérifié à la lecture :

- **Rien n'est remplacé** : le seul `stockerBlob` est dans la branche « le navigateur n'a pas le fichier » ; un fichier présent, d'empreinte égale ou différente, fait `continue` avant toute écriture.
- **Aucune confiance dans la vérification d'hier** : chaque copie écrite a son empreinte recalculée sur les octets lus, comparée à `meta.integrite.travaux_sha256` ; et `meta.json` lui-même est recomparé à `verification.meta_sha256`, toujours écrit par « Vérifier » (`reserve-verifier.js` l. 433, 536). Ton refus de l'archive entière quand `meta.json` a changé est accepté : ce n'est plus l'archive vérifiée.
- **La seule autre écriture** : `blobStatut` « manquant » → « present », pour les fiches dont le fichier est là après le geste, et dans la liste du trimestre de l'archive. Tes deux ajustements de lecture (trimestre de l'archive pour les fiches et les élèves supprimés) sont justes : une archive d'hiver se fait revenir pendant l'automne.
- **« Revenue » se lit au magasin** (relecture et taille), pas dans l'absence d'erreur.
- **Mémoire** : une copie à la fois ; le pic mesuré (+39 Mo pour 607 Mo) tient.
- **Le bouton** est offert et l'action gardée sur « vérifiée » ; titres et infobulle passent `_echapper`.

## Une mesure à faire, sans correction attendue

**Une fiche « exporte » sans fichier** (copie libérée après l'export ZIP de Travaux) : le geste la fait revenir et laisse « exporte ». Lu au code : le codex emporte une copie présente quel que soit son statut (`codex.js` l. 433), et ne l'attend pas (l. 826-828, 1175). Mesure-le au banc sur un cas (exporte, sans fichier → revient → le codex l'écrit, la fenêtre de #1012 ne s'ouvre pas) et dis-le. Si le codex ne l'écrit pas, arrête-toi et rends-le : la décision 5 de la consigne (« une copie revenue est une copie ordinaire ») voudrait alors qu'elle redevienne « present ».

## #997, dans les données de Grégoire

Accepté tel que tu le proposes : **lecture seule**, avant d'annoncer quoi que ce soit, tu dis si le fichier de cette copie est dans l'archive du groupe 00008. Rien n'est écrit chez lui ; c'est son geste qui réparera, s'il le fait.

## Les mots

Portés à Grégoire par Cowork, avec une seule retouche recommandée : « élève supprimé » devient « étudiant·e supprimé·e » (pluriel « étudiant·es supprimé·es »), comme la phrase qu'il a acceptée pour 1.180.0. Sa réponse est dans la consigne.

## RELAIS.md

Oui : la règle du 8 août s'applique. Écris-le et pousse-le **seul** sur `main`, tout de suite.
