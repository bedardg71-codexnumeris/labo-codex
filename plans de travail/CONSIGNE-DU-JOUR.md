# Consigne du jour – carte d'alignement : release 1.192, verdict, push

> Écrite par Cowork le 8 octobre 2026 à 19 h 33 (Toronto, mesurée par `date`). Remplace la consigne des mots et du plein écran, archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-10-08-carte-mots-et-plein-ecran.md`.

## Où on en est

Lots 1 et 2 (7745b1c7, 65c71613) et correctif de relecture (cfc90613) sur `main` local. Cowork a relu cfc90613 : rien à redire. Version en ligne : 1.191.1.

Grégoire t'autorise, en te transmettant cette consigne, à commiter cette consigne et son archive, à faire la release minor, à lancer le verdict et à pousser sur `main`.

## 1 · La ligne des Nouvelles, validée par Grégoire (19 h 33)

À poser telle quelle dans `js/changelog-data.js` (mise en forme habituelle : `&nbsp;` devant « : », « › » et dans les guillemets), avec le commentaire de provenance habituel (validée par Grégoire le 8 oct. 2026 à 19 h 33, par Cowork, `plans de travail/CONSIGNE-DU-JOUR.md`).

- version : `1.192` · couleur : `vert`
- titre : Un menu « Vue » sur la carte d'alignement
- item 1 : Conception › Carte d'alignement : un menu « Vue » réunit « Vue plein écran », « Recentrer la carte », « Tout voir », la couleur du fond et, en bas, tous les raccourcis clavier. « Recentrer la carte » se fait maintenant avec la touche R (au lieu de ⌘1).
- item 2 : Planificateur : les dates du trimestre s'affichent à côté du titre ; si elles manquent, un lien mène à Cadre › Trimestre pour les entrer. La réserve « Non planifié » ne se place plus à gauche de la grille : elle est toujours dessous.

## 2 · Release, verdict, push

Dans l'ordre du §4.5 de `fin-de-session` : `node scripts/release.mjs minor` (1.192.0), commit, **verdict complet avec Chrome et Safari fermés**, puis push. Si le verdict n'est pas vert, ne pousse pas : arrête-toi et dis ce qui échoue.

Après le push : mesure le déploiement Netlify (commit_ref, état `ready`, heure lue par `TZ=America/Toronto date`), mets à jour `OU-EN-EST-ON.md`, `CONSIGNE-DEMARRAGE-PROCHAINE-SESSION.md` et `RELAIS.md`.

## Ton rapport à Grégoire

Trois lignes : la version en ligne et l'heure ; le geste à faire à l'écran (Conception › Carte d'alignement, menu « Vue », puis le titre du planificateur) ; tout ce que tu as dû supposer.
