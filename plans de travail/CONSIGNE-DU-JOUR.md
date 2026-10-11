# Consigne du jour – la file sans Grégoire, lots 5 et 6 enchaînés, une seule release

> Écrite par Cowork le 11 octobre 2026 à 6 h 58 (Toronto, mesurée par `date`). Remplace la consigne de la release du lot 4, archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-10-10-lot4-release.md`. Tu peux commiter ce fichier avec ton premier commit.

## Où on en est

1.197.0 est en ligne (Netlify, `16e3cbe5`, 10 oct. 17 h 22 ; verdict complet vert). Lots 1 à 4 de la file en ligne.

## Ce qui change dans la façon de faire (décision du 11 oct., question de Grégoire)

Grégoire constate que le verdict complet d'environ une heure par lot ralentit le travail. **Désormais, deux lots s'enchaînent avant une seule release** :

1. Lot 5 : mesure, commits, Vitest complet, demande de relecture. **Tu t'arrêtes** pour la relecture de Cowork (elle ne coûte pas d'heure de verdict).
2. Corrections éventuelles, puis lot 6 de la même façon, avec sa propre relecture.
3. **Une seule** release mineure pour les deux, **un seul** verdict complet Playwright sur le commit de release, Chrome, Safari et Cowork fermés, Mac sur secteur.

Ce qui ne change pas : la relecture croisée de chaque lot, le break-test de chaque correctif, Vitest complet avant chaque demande de relecture, le verdict sur le commit de release (jamais sur un commit antérieur), le push seulement si vert. Si le verdict rougit, les commits séparés disent quel lot : nomme-le.

## La règle « sans Grégoire » (rappel)

Aucune décision de pédagogie, aucune écriture dans des données déjà écrites chez l'utilisateur (le stock s'écrit et s'assume), aucune zone protégée (`js/config.js`, `js/navigation.js`, `noms_stables.json`), aucune suppression définitive. Seule la ligne des Nouvelles revient à Grégoire, par Cowork, une fois pour les deux lots.

## Lot 5 – la mémoire sur l'iPad (sans l'iPad)

**Hors du lot : #996** (le partage prend deux fois la taille du fichier) : la fiche exige une mesure sur l'iPad de Grégoire, ce n'est pas « sans lui ». Laisse-la ouverte, telle quelle.

1. **#991 – « Exporter une sélection » fabrique son fichier à l'ancienne.** Le faire passer par `FichierSortant.assemblerZip`, comme « Mettre à jour le codex ». Mesure d'abord (pic mémoire avant/après au banc, WebKit). Le fichier produit doit s'ouvrir exactement comme avant : banc d'aller-retour.
2. **#1025 – « Ouvrir une archive… » charge l'archive entière.** Inscrire l'archive par la lecture de son seul `meta.json`, par tranches, comme « Vérifier ». Mesure le pic avant/après (la fiche : 1 242 Mo contre 210 Mo). Ne change pas le reste du geste, sauf si la mesure montre que l'écran de réimport des bibliothèques est ouvert par erreur : alors, écris-le et laisse-le, c'est un changement d'écran.
3. **#995 – Chrome et le toucher actif.** **Mesure seulement**, sous Chromium, selon la fiche (vrai clic, préparation allongée, aucun `evaluate` entre le clic et la fenêtre) : le refus, son erreur, la durée du toucher. Si la mesure confirme le refus, le correctif par `toucherFrais` entre dans le lot ; sinon, la fiche se ferme sur la mesure.

## Lot 6 – les nombres qui disent faux

1. **#726** – le C global d'un snapshot peut dépasser 100 % : le numérateur doit compter les seuls élèves du dénominateur (actifs du groupe, non exclus).
2. **#727** – `productionsDues` des snapshots compte les formatifs. **Aligne sur ce que fait le C vivant** (`indices.js`) pour les formatifs. Si le C vivant et le C historique suivent deux règles différentes et qu'aucune n'est clairement la bonne, **arrête-toi sur cette fiche** et écris les deux règles : c'est une question de pédagogie, elle reviendra à Grégoire.
3. **#728** – les heures d'une présence facultative non converties en périodes : même conversion que le régulier.
4. **#925** – l'étape 3 du groupe-cours additionne les élèves de deux cours au même numéro. Seul le compte affiché trompe. Si le correctif tient sans changer de texte d'écran (filtrer par le cours du champ 2, repeuplé à son changement), fais-le ; s'il demande un mot neuf, écris-le et arrête-toi sur cette fiche.

**Stock** : les snapshots déjà capturés gardent leurs nombres ; seuls les nouveaux suivent la règle corrigée. Assumé, écrit au BACKLOG. Mesure au banc, avant/après, sur le pack démo : quels nombres changent, de combien.

**Aucun mot d'écran changé** dans les deux lots, sauf ce que Cowork aura relu.

## Puis

Après le lot 5 : arrête-toi, demande de relecture `plans de travail/DEMANDE-RELECTURE-2026-10-11-lot5-memoire.md`, rapport court à Grégoire en gestes d'utilisateur. Le lot 6 attend le verdict de Cowork sur le lot 5. **Pas de release avant la relecture du lot 6.**
