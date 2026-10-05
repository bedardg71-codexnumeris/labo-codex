# Consigne du jour – archiver les copies d'un trimestre clos en gardant ses données (#1028)

> Écrite par Cowork le 5 octobre 2026 à 9 h 02 (Toronto, mesurée par `date`). Remplace la consigne de livraison d'E3, archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-10-05-e3-livraison.md`.

## Où on en est

1.185.0 est en ligne (E3, « Renvoyer aux archives »). Grégoire enchaîne avec #1028 ; le chantier des archives reste ouvert. **Décision de Grégoire (9 h)** : l'unité est **le trimestre clos entier** (toutes ses copies partent d'un coup ; ses données restent), pas le groupe. Lis #1028, #1024 (E3), #1000 (« Faire revenir » des copies, `reserve-revenir.js`), #997 et #1026.

C'est un geste qui **retire des données** (les fichiers des copies) : relecture croisée obligatoire (règle 2), et la première fois sur les données de Grégoire lui revient.

Grégoire t'autorise, en te transmettant cette consigne, à commiter les fichiers de Cowork, à écrire dans `BACKLOG.md`, et à travailler sur une branche `claude/1028-archiver-copies`. **Ne pousse pas le lot et ne fais pas de release** : tu t'arrêtes au point 6. Pousse `RELAIS.md` seul sur `main` en t'arrêtant.

## Les décisions de Cowork (techniques ; dis-moi si une mesure les dément)

1. **D'où** : au menu ⋮ d'un trimestre **clos**, à côté de « Renvoyer aux archives… ». Mêmes refus qu'E3 (actif, en cours, sans archive listée, archive non vérifiée).
2. **La règle : une copie ne part que si l'archive sait la rendre à l'identique.** Au geste, comme E3 depuis sa correction 1 : `meta.json` et `donnees.json` à leurs empreintes, **le contenu de chaque copie de l'archive relu et empreinté**. Puis chaque fichier de copie que l'application a (travail et corbeille) comparé à son empreinte dans l'archive. Une copie absente de l'archive ou différente → **rien n'est retiré**, la fenêtre propose d'archiver de nouveau d'abord. **Les données, elles, peuvent avoir changé depuis l'archive** (elles restent dans l'application) : ne compare que les copies, et dis-le si une mesure montre qu'une donnée changée empêcherait l'archive de rendre une copie à sa fiche.
3. **Ce qui est retiré** : les fichiers des copies identiques et leurs vignettes `thumbnail_<id>`. **Rien d'autre** : ni registre, ni clé `<trimestre>_*`, ni séance, ni clé globale.
4. **Une copie partie se dit « aux archives », jamais « manquante »** (#997). Tout ce qui lit le fichier d'une copie (visionneuse, Annoter, « Dossier PDF », export des travaux, codex, synthèse de rétroaction…) doit le dire sans planter, et la note, la grille, la rétroaction et les annotations restent consultables. **Contraintes sur la marque** (où elle vit est à toi, par mesure) : (a) après le geste, **E3 marche encore** sur ce trimestre (une copie absente de l'application n'y est pas une différence ; la marque ne doit pas rendre le trimestre « changé » à jamais) ; (b) **aucune nouvelle archive du trimestre ne peut s'écrire sans ses copies** : tant que des copies sont aux archives, « Archiver le trimestre… » refuse et propose de les faire revenir d'abord (ou mieux, si une mesure le permet sans risque : les reprend de l'archive précédente ; dis lequel et pourquoi) ; (c) un codex écrit ensuite ne prétend pas les contenir.
5. **Le retour** : « Faire revenir » les copies depuis l'archive du trimestre, sous leurs fiches, la marque levée. Mesure d'abord si `reserve-revenir.js` (#1000) sait lire une archive de trimestre ; sinon, étends-le plutôt que d'écrire un second chemin.
6. **Interrompu, il se reprend** : idempotent, ordre au choix qui laisse l'état le plus lisible (une copie marquée mais encore là se montre, elle n'est pas « aux archives » tant que son fichier existe) ; chaque retrait relu ; arrêt au premier refus ; reprise depuis le même menu.

## Ce que tu fais, dans cet ordre

1. **Commite** cette consigne et son archive sur `main`, pousse `main`.
2. **Mesure avant de coder** : où vivent les annotations (données ou fichier ?) ; chaque lecteur du fichier d'une copie et ce qu'il fait quand le fichier manque ; le point 5 ; l'interaction avec E1 et E3 (point 4 a et b). Écris ce que tu as mesuré dans la demande de relecture.
3. **Code** sur la branche, mots provisoires.
4. **Tests** : l'aller-retour (archiver, vérifier, archiver les copies, faire évoluer les données du trimestre, faire revenir les copies : chaque fichier égal à l'avant, rien d'autre changé) ; puis E3 sur un trimestre dont les copies sont aux archives ; le refus d'E1 du point 4 b ; une copie différente ou absente de l'archive → rien retiré ; un arrêt au milieu et la reprise ; chaque lecteur du point 2 de la mesure, sans plantage. Mutations rouges : une copie retirée que l'archive n'a pas ; la relecture du contenu neutralisée ; une clé `<trimestre>_*` retirée ; E1 qui archive sans les copies parties. Largeur iPad. Vitest complet ; bancs WebKit d'E1, E2, E3 et du lot.
5. **La mémoire et la durée** à taille réelle (394 copies, ~1,1 Go).
6. **Arrête-toi et rends** : le commit sur la branche ; `DEMANDE-RELECTURE-2026-10-05-1028-archiver-copies.md` ; pour Grégoire, **les mots exacts** (menu, fenêtre, refus, bilan, ce qu'affiche une copie aux archives, le retour). Pas de verdict complet, pas de push du lot, pas de release.

## Ce que tu rends

À Grégoire, deux lignes : ce que fait le geste, et ce qu'il refuse. Les mots dans un bloc à part. Ce que tu as supposé, en une ligne.
