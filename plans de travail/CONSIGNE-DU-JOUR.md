# Consigne du jour – lot 7 : importer d'une sauvegarde récente

> Écrite par Cowork le 11 octobre 2026 à 8 h 29 (Toronto, mesurée par `date`). Remplace la consigne des lots 5 et 6, archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-10-11-lots5-6.md` : **ses sections sur la release commune et la cadence restent en vigueur** (relis-les avant le signal du soir). Tu peux commiter ce fichier avec ton premier commit.

## Où on en est

1.197.0 en ligne. Lots 5 et 6 relus, acceptés, **en attente de la release du soir** (10 commits locaux, `1d459e0c` en tête). Nouvelles des lots 5 et 6 déjà retenues par Grégoire : voir l'archive.

## La cadence (décision de Grégoire du 11 oct., rappel)

Pas de verdict Playwright ni de release pendant la journée. Chaque lot : mesure, commits, Vitest complet, demande de relecture, arrêt. Le soir, au signal de Grégoire (journée finie, Chrome, Safari et Cowork fermés, Mac sur secteur), une seule release groupe tout ce qui a été relu, avec un seul verdict complet. La cadence entre dans `PROTOCOLE.md` (règle 7) avec la documentation de cette release.

## La règle « sans Grégoire » (rappel)

Aucune décision de pédagogie, aucune écriture dans des données déjà écrites chez l'utilisateur (le stock s'écrit et s'assume), aucune zone protégée (`js/config.js`, `js/navigation.js`, `noms_stables.json`), aucune suppression définitive. Les mots d'écran neufs reviennent à Grégoire, par Cowork.

## Lot 7 – ce qu'il fait

**Mesure d'abord**, écrite dans la demande de relecture.

1. **#1046 – une sauvegarde récente ne propose pas ses grilles.** L'aperçu de l'import sélectif et `executerImportSelectif` ne cherchent grilles, échelles, pratiques et cartouches que sous des clés nues ; dans un fichier récent, elles sont sous `<trimestre>_…`. À faire : l'aperçu propose aussi celles des trimestres du fichier, et l'import les reçoit dans le trimestre actif, avec le même chemin que les clés nues (assainissement, tables de renommage, rebranchements, identité des cartouches du lot 3).
   - **Le démo** : les clés `demo_…` ne sont jamais proposées (le pack démo n'entre pas dans les données réelles).
   - **Plusieurs trimestres dans le fichier** : mesure ce que contient un vrai codex récent (le codex de banc, et un fichier fabriqué à deux trimestres). Si une même ressource (même id, même contenu) apparaît dans plusieurs trimestres, elle n'est proposée qu'une fois. Si l'aperçu doit dire de quel trimestre vient une ressource, **écris les mots dans le code et cite-les** : Cowork les relit, Grégoire les tranche.
   - **Ce qui voyage** : un fichier ancien (clés nues) s'importe exactement comme au lot 3 ; un banc le prouve (codex de banc 1.172.0).
2. **#522 – les onze derniers gestes en course.** `import-export.js` ×7 (`_ajouterCopiesImportees` ×2, `_restaurerBlobsDepuisZip`, `executerImportSelectif` ×4) et la Réserve ×4 (`reserve-copies.js` `retirer`, `reserve-emprunter.js` `_retirer`, `reserve-renvoyer.js` `retirer`, `reserve-revenir.js` `faireRevenir`), par `db.modifier`, au patron des lots précédents (banc sous IndexedDB simulé qui **clone**). Remesure d'abord avec `python3 scripts/mesurer-522.py ""`. Si la conversion d'un site de la Réserve change ce qui est retiré ou quand, arrête-toi sur ce site et écris pourquoi : on ne change que la sérialisation.

**Aucun mot d'écran changé**, sauf ce que Cowork aura relu. `import-export.js` est sous les règles de sécurité : son verdict est celui du soir.

## Puis arrête-toi

Commits séparés, en local. Vitest complet. Demande de relecture `plans de travail/DEMANDE-RELECTURE-2026-10-11-lot7-import-recent.md`. Rapport court à Grégoire en gestes d'utilisateur, une ligne par supposition, ta proposition d'**un item** de Nouvelles pour ce lot (il rejoindra l'entrée du soir). Pas de release.
