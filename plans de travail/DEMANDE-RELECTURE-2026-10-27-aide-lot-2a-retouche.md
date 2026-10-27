# Demande de relecture – L'Aide, lot 2a, la retouche (#1152)

> Claude Code, mardi 27 octobre 2026, sur `main` après `51081606`. Répond à `VERDICT-RELECTURE-2026-10-27-aide-lot-2a.md` : son § 1, avec les quatre réponses de Grégoire du § 2, et les deux inscriptions du § 3. Un seul commit. Aucun `js/` touché.

## Ce qui a changé, point par point (§ 1)

| Entrée | Avant | Après |
|---|---|---|
| `presentation` | « l'application refuse d'importer un fichier non signé ou modifié en chemin » | « « Importer le partage d'une ou d'un collègue » refuse un fichier non signé ou modifié en chemin » (libellé de `js/grilles.js:2419` et des quatre autres fenêtres) |
| `prise-en-main` | Assistance : « les info-bulles, l'aide à l'écran et la visite guidée » ; « « Étapes de configuration », dans le Cadre » | « les info-bulles, l'aide à l'écran et les flèches » ; « l'entrée « Étapes de configuration », dans la partie Cadre de cette Aide ». La ligne « Visite guidée » reste (`sentinelle-audit-aide-lot-A`) |
| `bibliotheque` | – | Après les listes, la phrase de Cowork mot pour mot (§ 2, point 2, « oui » à 15 h 38), avec un commentaire HTML : à retirer quand #1160 à #1167 seront faites |
| `chaines-etapes` | « qui le rendent » ; « La case … les masque toutes » | Le texte de Cowork mot pour mot (§ 2, point 3, « oui » à 15 h 38) : « qui rendent cet outil » ; « Décocher « Afficher les chaînes d'étapes » … » |
| `preferences` | « l'accès au dossier Travaux entre les sessions » | « « Mémoriser le dossier Travaux et les Archives entre les sessions » » (`index.html:9359`) |
| `etapes-config` | La phrase des trois résumés ; « avant de créer le groupe-cours » | Phrase retirée ; « avant d'enregistrer le groupe-cours » (#1038, `:790-795`) |
| `cours` | « Choisis la nature, cours ou service » ; liste des champs facultatifs | « Choisis la nature : « Enseignement » ou « Orthopédagogie » » ; « les autres champs sont facultatifs » |
| `presences-calendrier` | « Un clic sur un jour de cours » | « Un clic sur un jour de cours régulier » (légende, `js/calendrier-vue.js:513`) |
| `archivage` | « … une fois terminé ; tu peux ensuite en commencer un nouveau. … » ; puce « Tu souhaites commencer un nouveau trimestre » | « Clore un trimestre le fige en lecture seule, une fois terminé. Clore ne libère aucun espace. » ; puce retirée (§ 2, point 4, « oui » à 15 h 39). Le commentaire HTML de la carte dit la réponse |

`presentation`, la phrase venue de `monitorage` : gardée telle quelle (§ 2, point 1, « oui » à 15 h 37).

Supposition nommée : pour `prise-en-main`, « les flèches » reprend le mot du verdict et du code (« flèches didactiques », `js/accompagnement.js:478-481`, gardées par `prefFlechesActives()` aux l. 634 et 715) ; aucun libellé d'écran ne les nomme autrement, à ma lecture.

## Les tests

- **`sentinelle-1002-mots-clos.test.js:119`** se recale sur la nouvelle première phrase, en citant la réponse de Grégoire (27 oct., 15 h 39), et vérifie que « commencer un nouveau » est parti.
- **`sentinelle-aide-2026-10-27-lot-2a.test.js`** : un bloc neuf de neuf tests, un par entrée retouchée. Chaque mot d'écran est lu dans sa source quand il en a une : le libellé d'import dans `js/grilles.js`, la case `v2-pref-chaines-etapes` cochée par défaut dans `index.html`, le libellé de `pref-fsapi-persistance`, les deux mots de `js/mots-nature.js`, la légende de `js/calendrier-vue.js`.
- **Break-test** : contre l'`index.html` de `51081606`, les neuf tests neufs et le test recalé de 1002 rougissent (10 sur 10) ; restaurés, ils passent. Les huit tests d'origine de la sentinelle neuve restent verts des deux côtés, comme attendu (ils ne portent pas sur ces mots).
- Les deux découpes du bloc neuf passent par `tranche()` (`tests/unit/_helpers/tranche.js`) : écrites d'abord par `slice(indexOf)`, elles rougissaient le cliquet de `sentinelle-858-decoupe-qui-refuse`.
- Vitest complet, depuis `tests/` : 832 fichiers, 9 957 tests, tous verts. Playwright : `integration/aide-lot-2a-1152.spec.js` seul, vert (webkit). La suite Playwright complète n'a pas été lancée.

## § 3, inscrit

Deux lignes au tableau « Trouvé hors de la section Aide » de `audit-aide-2026-10-24/AUDIT-AIDE-2026-10-24.md`, disposition *inscrit #1152, lot 5* : le résumé du groupe-cours qui compte la pratique et pas le trimestre ; la popup de la bibliothèque, vraie quand #1160 à #1167 seront faites. Les guillemets sans espace insécable : vus, non inscrits (règle du 24 août).

## Ce qui n'est pas fait

Pas de release, de verdict ni de push : ils attendent le signal de Grégoire (§ 4).
