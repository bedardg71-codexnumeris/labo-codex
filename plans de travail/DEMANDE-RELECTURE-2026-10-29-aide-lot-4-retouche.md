# Demande de relecture – L'Aide, lot 4, la retouche : trou 6 (#1152)

> Claude Code, jeudi 29 octobre 2026, 5 h 42, sur `main` = `78f5d642` (code) ; verdict `VERDICT-RELECTURE-2026-10-29-aide-lot-4.md` (Cowork, 5 h 38). Rien de poussé, pas de release, pas de verdict.

## En bref

- **Une phrase ajoutée, mot pour mot**, dans `accordeon-aide-ce-qui-sort`, après « …sans le texte de ce que tu as cliqué. » : « S'y ajoutent des informations techniques, dont ton appareil, le cours actif et les dernières erreurs de l'application. » La phrase d'avant et celle d'après n'ont pas bougé. La validation (Grégoire, 29 oct., 5 h 37, « oui, on prend ») est notée dans le commentaire de la carte, avec les lignes de `rapport-bug.js` mesurées par Cowork.
- **La sentinelle a rougi avant** : `sentinelle-aide-2026-10-28-lot-4.test.js`, 1 échec sur 4 (5 h 38), « les trous 3, 1, 5 et 6 : chaque paragraphe paraît dans son entrée » ; le paragraphe attendu était celui du trou 6 avec la phrase, le texte reçu celui sans elle. **Verte après** : 4 sur 4.
- **Vitest depuis `tests/`** : 846 fichiers sur 846, 10 222 tests sur 10 222. Un premier passage a signalé « 1 error » hors des tests (aucun test rouge) ; le second, complet, n'en a aucune. Je la tiens pour intermittente, sans l'avoir isolée.
- Playwright non relancé, comme le verdict le demande.

## Hors du lot

Les modifications de l'accueil (`js/accueil.js`, `styles.css`, `sentinelle-accueil-porte-ortho-et-champ2-846.test.js`, 28 oct. vers 20 h 15) et les deux icônes non suivies n'entrent dans aucun des deux commits : elles ne sont pas de cette retouche.
