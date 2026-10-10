# Consigne du jour – la file sans Grégoire, lot 3 : l'import sélectif rattache juste

> Écrite par Cowork le 10 octobre 2026 à 10 h 13 (Toronto, mesurée par `date`). Remplace la consigne du lot 2, archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-10-09-file-lot2-echappement.md`.

## Où on en est

1.195.0 est en ligne (Netlify `6aca3562`, `976fc133`, 8 h 54 ; verdict complet vert, un instable hors lot : la barre des présences à 360 px). Portes dues chez Grégoire : « Vérifier » dans Chrome (#1005) ; #660, #915, #1012.

## La règle de Grégoire pour la suite (9 oct., 14 h 42)

« Si certaines tâches peuvent être réalisées sans moi, on les fait d'abord ; ensuite on priorise en fonction de la qualité de l'application (robustesse, logique). »

**« Sans Grégoire » veut dire** : aucune décision de pédagogie, aucune écriture dans des données déjà écrites chez l'utilisateur (on tarit la source ; le stock s'écrit et s'assume, il ne se répare pas d'office), aucune zone protégée (`js/config.js`, `js/navigation.js`, `noms_stables.json`), aucune suppression définitive de données d'utilisateur. Seule exception admise : la ligne des Nouvelles de chaque release, que Cowork lui soumet en une phrase.

## La file arrêtée par Cowork (dans cet ordre, un lot à la fois)

1. **L'archive d'un groupe n'emporte que ce groupe** – en ligne en 1.194.0 (9 oct., 19 h 08).
2. **Ce qui entre de l'extérieur est échappé** – en ligne en 1.195.0 (10 oct., 8 h 54).
3. **L'import sélectif rattache juste** – ce qui voyage : #952, #954, #655, #664, et la trouvaille du lot 2 (et #545 si la mesure du lot désigne la même cause). ← CE LOT
4. **Rien ne se perd en silence** : #938 (l'assistant efface les jetons), #845 (une donnée supprimée encore lue), #522 (deux enregistrements rapprochés).
5. **La mémoire sur l'iPad** : #991, #996, #1025 ; #995 seulement après sa sonde Chromium.
6. **Les nombres qui disent faux** : #925, #726, #727, #728.

Ensuite viendront le Cadre, le nettoyage du code mort et la documentation, puis les fiches qui demandent Grégoire. Cowork recompose la file à chaque relecture ; ne prends pas d'avance sur le lot suivant.

## Lot 3 – ce qu'il fait

Le chemin : l'import sélectif (`js/import-export.js`, blocs pratiques ≈ 2950, grilles ≈ 2976, échelles ≈ 3014, cartouches ≈ 3053, productions ≈ 3109) et l'ajout en Bibliothèque. Le témoin à suivre : l'import complet (codex), qui a déjà `remapGrilles` (≈ 2584) et range les cartouches par trimestre (≈ 2676). **Mesure d'abord**, au banc, sur un fichier fictif qui exerce chaque cas ci-dessous, et écris la mesure dans la demande de relecture.

1. **#664** : l'ordre. Les grilles et les échelles sont traitées AVANT les pratiques et les productions, et chaque bloc tient une table ancien id → nouvel id.
2. **#952** : une grille ou une échelle renommée pour conflit garde le lien : les productions et les pratiques importées dans le même passage pointent vers le nouvel id (comme `cartoucheId` aujourd'hui).
3. **#954** : une cartouche identique à celle en place n'est plus ajoutée en double. `dateImport` (et tout autre champ posé par l'import) ne doit pas entrer dans la comparaison d'identité.
4. **#655** : les cartouches importées se rangent dans le trimestre actif, comme à l'import complet.
5. **La trouvaille du lot 2** (§ 7 de `DEMANDE-RELECTURE-2026-10-09-lot2-echappement.md`) : les listes blanches de `SCHEMAS_IMPORT` font perdre, à l'import sélectif et à l'ajout en Bibliothèque, des champs qui voyagent (les pratiques d'une grille, la description d'une cartouche, les règles d'une production…) ; et le type `number` du schéma d'échelle ramène à 0 un `valeurCalcul` stocké en texte (« 40 »). Corrige les deux : aucun champ connu ne se perd, et une valeur numérique en texte est convertie, pas remise à 0. Recense d'abord tous les champs perdus, par type, dans la mesure.
6. **#545** (l'échelle réparée puis effacée) : la mesure dit si l'un des écrivains d'`echellesTemplates` de ce chemin (`import-export.js` ≈ 2617, ≈ 3035) peut effacer une échelle en place. Si oui, c'est la même cause : corrige-la dans le lot. Sinon, écris ce que la mesure a exclu et laisse la fiche ouverte.

**Ce qui voyage** : un fichier partagé ou exporté avant ce lot s'importe toujours, avec le même résultat ou un meilleur ; un banc le prouve. **Stock** : les doublons de cartouches et les cartouches rangées hors trimestre, déjà écrits chez les utilisateurs, ne sont ni fusionnés ni déplacés (ce serait écrire dans leurs données) : assumé, écrit au rapport et au BACKLOG.

**Aucun mot d'écran changé.** Si un bilan d'import doit dire quelque chose de neuf (un renommage, un doublon écarté), écris le texte dans le code et cite-le ; Cowork le relit.

## Tests

Chaque correctif a son banc, avec break-test. `js/import-export.js` est sous les règles de sécurité : `cd tests && npm test` (suite complète) avant la release, Chrome, Safari et Cowork fermés. Noms manifestement fictifs.

## Puis arrête-toi

Commits séparés, en local. Rapport à Grégoire en gestes d'utilisateur (numéros entre parenthèses en fin de ligne), ce que tu as supposé une ligne par supposition, ta proposition de titre et de ligne des Nouvelles. **Pas de release avant la relecture de Cowork.**
