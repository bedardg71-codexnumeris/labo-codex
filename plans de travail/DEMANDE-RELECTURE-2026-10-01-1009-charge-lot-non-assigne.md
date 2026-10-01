# Demande de relecture – retour testeur #1009 : la charge d'un lot dont les consignes ne sont pas marquées transmises

> Écrite le 1er octobre 2026, vers 8 h 45 (Toronto), par Claude Code, pour Cowork. Branche `fix-1009-charge-lot-non-assigne` : `main` (`f3a5405f`) + le commit de release `e0fdb1dc` (1.173.1) + un commit de documents. **Ni poussée ni livrée.** Relecture demandée par la règle 2 de `PROTOCOLE.md` (une release).
> Chaque constat dit s'il est **mesuré**, **lu** au code, ou **inféré**. Je ne suis pas un pair développeur : ce qui suit est une mesure et une lecture, à relire comme telles.

## Pour Grégoire, en trois lignes

1. **Ce qui change à l'écran** : dans Labo › Rythme de travail, « Estimation de la charge » affiche une production dès que des copies sont importées ou évaluées, que sa case « Consignes transmises » soit cochée ou non. Chez toi : Artefact 3 (rév), 6 évaluées, 20 restantes, environ 2 h 48.
2. **La preuve** : un banc de trois essais, dont ton cas ; deux mutations, deux rouges. Vitest complet vert sur le commit de release (669 fichiers, 7 884 essais).
3. **Ce qui te revient** : ta case décochée (ton geste, dans ta fiche de production), et la fiche #1010 à trancher à froid.

## 1 · Le symptôme et la mesure

Rapport du 1er oct., 8 h 26, 1.172.0, Chrome sur le Mac : « J'ai 6 copies évaluées et je n'ai pas d'estimation pour le reste de mon groupe. » La capture montre la production au tableau des durées (N = 6) et absente du tableau de la charge.

**Mesuré en lecture seule dans ses données**, avec son accord (onglet à part sur la même origine, l'application ne démarre pas ; IndexedDB `MonitoragePedagogique`, store `keyvalue`, transaction `readonly` ; aucun DA ni nom sorti ; onglet refermé) :

| Production en cours | Valeur |
|---|---|
| `echeancesParGroupe[gc]` | `{ assignee: false, date: '2026-09-29' }` |
| Évaluations sur ce groupe | 6, toutes avec critères |
| Fiches de copies sur ce groupe | 26, 26 DA distincts |

Les deux productions suivantes portent aussi `assignee: false`, avec des échéances à venir et aucune copie : état légitime (#486, #494).

## 2 · La cause, lue

`estimerCharge` (`js/rythme.js`), dans la ventilation par groupe : `if (!entree || entree.assignee === false) return;`. La ligne date du 6 avril 2026 (`d134697d`), avant #494 : en mode multi-groupe, une case décochée voulait dire « ce groupe ne fait pas ce travail ». Depuis #494 (25 août), le mode simple écrit le même modèle et la case veut dire « consignes pas encore transmises ». Les deux autres causes envisagées (évaluations sans `groupeCoursId`, `criteres` absent) sont écartées par la mesure.

## 3 · Ce qui a changé

- `js/rythme.js`, `estimerCharge` : la garde devient `if (!entree) return;`. Un lot non assigné sans copie ni évaluation reste absent, parce que `estimerPourLot` rend `null` quand `copiesRestantes === 0 && evalsFaites === 0` (inchangé).
- `js/rythme.js`, export : `estimerCharge` est ajoutée à `window.Rythme`, à côté de `collecterDurees` et `calculerStatsParActivite`, pour le banc.
- Rien d'autre : ni l'affichage, ni la planification, ni les lecteurs de `assignee` ailleurs.

## 4 · La preuve

`tests/unit/sentinelle-1009-charge-lot-non-assigne.test.js`, par le trajet de l'écran (`collecterDurees` → `calculerStatsParActivite` → `estimerCharge`), données fictives :

| Essai | Ce qu'il tient |
|---|---|
| Le cas vécu | case décochée, 26 copies, 6 évaluées → une ligne, 20 restantes, échéance rendue, 20 × 404 s × 1,25 |
| Lot non assigné sans copie | absent, alors que les statistiques de son activité existent |
| Deux groupes | celui qui n'a rien reçu est absent, l'autre présent |

| Mutation | Résultat |
|---|---|
| La garde `assignee === false` revient | essai 1 rouge |
| `estimerPourLot` ne rend plus `null` sur un lot vide | essais 2 et 3 rouges |

Restauration par copie, empreinte identique. Vitest complet : 669 fichiers, 7 884 essais verts sur `e0fdb1dc`.

**Palier : la fonction, pas l'écran.** Aucun banc ne rend le tableau ; le code d'affichage (`afficherRythme`) n'a pas changé et parcourt la liste que `estimerCharge` rend. La confirmation à l'écran revient à Grégoire, sur ses données, une fois 1.173.1 en ligne.

## 5 · Où le risque naîtrait

- **Un lot non assigné qui porte des copies par erreur d'association** apparaîtra maintenant à la charge. Inféré : c'est souhaitable (la copie est en main), mais c'est un changement de ce que l'écran montre.
- **La planification** (`afficherPlanning`, `repartirDansJours`) reçoit désormais ce lot ; elle lit `dateRemise` (ici le 29 sept.) et `copiesRestantes`. Lu, pas exécuté.
- **Les autres lecteurs de `assignee`** ne sont pas touchés : `js/snapshots.js` (224, 243, 473), `js/graphiques-progression.js` (549, 771, 1356), `js/correlations-longitudinales.js` (283), `js/pratiques/pratique-pan-standards.js` (370), `js/calendrier-vue.js` (237). Lu au code, non mesuré sur ses indices : tant que la case est décochée, la production reste écartée de ces lecteurs. C'est la règle de #494.

## 6 · Trouvaille en chemin, et son issue

**#1010, issue 2 (inscrite)** : l'application laisse importer 26 copies et en évaluer 6 sur une production tenue pour non transmise, sans rien signaler. À décider par Grégoire (pédagogie et mots d'écran).

## 7 · Source et stock

Source seule. La case décochée reste dans les données de Grégoire ; rien n'y a été écrit.

## 8 · Ce que j'ai supposé

1. Qu'une copie importée est du travail à faire, que les consignes soient marquées transmises ou non. Dit à Grégoire avant qu'il choisisse la livraison.
2. Qu'un correctif sans changement de mots ne demande pas d'entrée aux Nouvelles (précédent : 1.170.1, 1.170.2).

## 9 · À la livraison

Après la relecture : Grégoire ferme Cowork, `scripts/pousser.sh` sur le sommet de la branche, fusion vers `main`, mesure chez Netlify.
