# Consigne du jour – carte d'alignement, lot 4 : release 1.192.2, verdict, push

> Écrite par Cowork le 9 octobre 2026 à 07 h 17 (Toronto, mesurée par `date`). Remplace la consigne du lot 4, archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-10-09-carte-lot4.md`.

## Où on en est

Lot 4 commité sur `main` local (e0547e52, 4425b6e7, 42626f2c). Cowork l'a relu : rien à corriger (le cache de #971 est borné par le `try/finally` de la passe ; le correctif du champ « Semaine » est juste). Tes suppositions sont retenues, dont la case vide pour un bloc sans objectif ou à référence morte.

Grégoire t'autorise, en te transmettant cette consigne, à commiter cette consigne et son archive, à faire la release patch, à lancer le verdict et à pousser sur `main`.

## 1 · Les Nouvelles, validées par Grégoire (7 h 17)

1.192.2 se consolide dans l'entrée `1.192` existante : **ajoute ces deux items à la suite des deux qui y sont**, titre et couleur inchangés, mise en forme habituelle (`&nbsp;`), commentaire de provenance (validés par Grégoire le 9 oct. 2026 à 7 h 17, par Cowork, `plans de travail/CONSIGNE-DU-JOUR.md`). Pas d'item pour la carte démo.

- Conception › Carte d'alignement, « Exporter le plan… » : chaque production porte sa vraie échelle, et un bloc qui ne sert que les objectifs d'une autre leçon porte « Aucun objectif de cette leçon » au lieu d'une case vide.
- Dans l'Inspecteur d'une leçon qui porte des objectifs, le champ « Semaine » fonctionne de nouveau.

## 2 · Release, verdict, push

`node scripts/release.mjs patch` (1.192.2), commit, **verdict complet avec Chrome et Safari fermés**, puis push. Si le verdict n'est pas vert, ne pousse pas : arrête-toi et dis ce qui échoue. Dans `SUIVI-BUGS.md`, #969 et #974 passent aux corrigés avec leur version.

Après le push : mesure le déploiement Netlify (commit_ref, état `ready`, heure lue par `TZ=America/Toronto date`), mets à jour `OU-EN-EST-ON.md`, `CONSIGNE-DEMARRAGE-PROCHAINE-SESSION.md` et `RELAIS.md`. Le prochain lot est le lot 3 (le reste de la barre, une icône à la fois avec Grégoire).

## Ton rapport à Grégoire

Deux lignes : la version en ligne et l'heure ; ce que tu as supposé.
