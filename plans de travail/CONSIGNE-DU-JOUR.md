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

## Ajout de Cowork (8 h 04) – verdict du lot 5, et feu vert pour le lot 6

**Lot 5 accepté sans correction.** Relus : `3a49eb92` (#991), `53be4f3c` (#1025), `0805ba37` (#995), `789245bd`. Tes décisions sont retenues : l'écran de réimport des bibliothèques laissé tel quel ; la partie « partage » de #991 inscrite à la fiche ; #996 inchangée.

**Décision de Grégoire (11 oct., 8 h 04)** sur la fenêtre « Ton codex est prêt », vue désormais aussi à la souris : « Touche » devient « **Appuie sur** ». Texte exact :
« Le fichier (TAILLE) est préparé. Appuie sur « Enregistrer » pour choisir où le ranger. »
Change seulement ce mot (`js/codex.js`, `toucherFrais`), et tout banc qui cite l'ancienne phrase. Un commit à part, avec la décision dans son message.

**Puis le lot 6**, tel qu'écrit plus haut. Arrête-toi après lui : demande de relecture `plans de travail/DEMANDE-RELECTURE-2026-10-11-lot6-nombres.md`, rapport court, et ta proposition d'**une seule** entrée de Nouvelles pour les lots 5 et 6. Pas de release avant la relecture du lot 6.

## Ajout de Cowork (8 h 18) – verdict du lot 6, et décision de Grégoire sur #727

**Lot 6 accepté sans correction.** Relus : `03d24786` (« Appuie sur »), `705a4750` (#726), `f31a6643` (#728), `2deb4e8a` (#925), `9bbd4fe2`. #728 : ta mesure est confirmée par Cowork (`interventions.js`, libellé « Durée (périodes) », `heures = dureeIntervention`) ; la fiche se ferme sur la mesure.

**Décision de Grégoire (11 oct., 8 h 18) sur #727 : « un formatif compte dans C ».** La règle actuelle reste, dans le C du jour comme dans l'historique. Motif retenu : C mesure ce que l'élève remet de ce qui est demandé ; ce qui sort un travail du compte, c'est « facultatif », pas sa fonction formative. #727 se ferme sur cette décision, sans changement de calcul. La fonction que rien n'utilise et qui suit la règle inverse : inscris-la au BACKLOG pour le lot du code mort (#469), ne la retire pas dans ce lot.

Les Nouvelles suivent dans un ajout séparé, après la décision de Grégoire. Ne lance pas la release avant.

## Ajout de Cowork (8 h 19) – la release commune des lots 5 et 6

**Nouvelles retenues par Grégoire (11 oct., 8 h 19)**, une entrée, deux items, mots exacts (espaces insécables avant les points-virgules, comme ailleurs) :
- Titre : « Moins de mémoire, des comptes justes »
- Item 1 : « Exporter une sélection et ouvrir une archive ménagent la mémoire de l'iPad ; sous Chrome, une longue mise à jour du codex demande un clic au lieu d'échouer. »
- Item 2 : « Le taux de remise d'un groupe ne dépasse plus 100 %, et l'étape 3 d'un groupe-cours compte les élèves du seul cours choisi. »

Dans cet ordre :
1. Inscris au BACKLOG ce que demande l'ajout précédent (#727 close sur la décision, la fonction inverse pour #469), commit de documentation.
2. `node scripts/release.mjs minor`, l'entrée ci-dessus dans `js/changelog-data.js`, commit de release.
3. **Un seul verdict complet** sur le commit de release : `cd tests && npm test`, Chrome, Safari et Cowork fermés, **Mac sur secteur**. Si un banc fige l'ancien comportement : mise à jour avec sa raison écrite, vérifier qu'il peut encore échouer, nouveau verdict complet. Si un échec vient d'un lot, nomme le lot.
4. Push seulement si vert. Puis Netlify `ready` sur le bon `commit_ref`, heure par `TZ=America/Toronto date` ; BACKLOG (#991, #1025, #995, #726, #925, #728, #727 livrées ou closes ; #996 ouverte) ; `OU-EN-EST-ON.md`, `CONSIGNE-DEMARRAGE-PROCHAINE-SESSION.md`, `RELAIS.md`.

Rapport court : la version en ligne, l'heure, le verdict, et le geste que Grégoire peut voir à l'écran (s'il y en a un sur ses vraies données). Puis arrête-toi.

## Ajout de Cowork (8 h 26) – nouvelle cadence des verdicts, décision de Grégoire du 11 oct.

**Elle remplace l'étape 3 de l'ajout précédent (« un seul verdict complet » tout de suite) : la release des lots 5 et 6 attend.**

Décision de Grégoire (11 oct., matinée, de vive voix) : le verdict Playwright mobilise tout son Mac pendant une heure et l'empêche de travailler en parallèle. Désormais :

- **Pendant la journée**, les lots s'enchaînent, chacun avec sa relecture croisée par Cowork, ses break-tests et Vitest complet. Aucun verdict Playwright, aucune release.
- **Le soir**, une seule release groupe tout ce qui a passé la relecture dans la journée, avec **un seul** verdict complet sur le commit de release. **Tu ne lances ni la release ni le verdict tant que Grégoire n'a pas dit que sa journée est finie** et que Chrome, Safari et Cowork sont fermés. D'ici là, tu accumules les lots relus et tu attends.
- **La nuit** : Grégoire laisse le Mac ouvert, branché, sans mise en veille ; le verdict peut tourner pendant qu'il dort. Un Mac endormi ou sous pression mémoire fait échouer le verdict ou redémarrer la machine : vérifie le secteur et la charge avant de lancer, et dis-le s'ils ne conviennent pas.
- **Exception** : un défaut gênant peut aller en ligne tout de suite, à la demande de Grégoire, avec son verdict à ce moment-là. Un lot qui touche une zone sous les règles de sécurité (`import-export.js`, `db.js`, `travaux-stockage.js`) garde son verdict obligatoire : il attend simplement celui du soir.
- **À inscrire dans `PROTOCOLE.md`** (règle 7, la cadence des verdicts) dans le commit de documentation de la prochaine release, pour que toute session la tienne sans qu'il ait à la redemander.

**Pour maintenant** : fais l'étape 1 de l'ajout précédent (BACKLOG : #727 close, la fonction inverse pour #469). Puis arrête-toi : la release des lots 5 et 6 et leur verdict attendent le signal de fin de journée de Grégoire. Cowork t'enverra entre-temps la consigne du lot suivant.
