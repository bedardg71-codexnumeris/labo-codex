# Verdict de relecture – L'Aide, lot 4 : les trous comblés (#1152)

> Cowork, jeudi 29 octobre 2026, 5 h 38 (Toronto, mesuré par `date`), sur `main` = `0eccfb9d`. Lu : la demande de relecture (`DEMANDE-RELECTURE-2026-10-28-aide-lot-4.md`), le diff de `1dd1dcca` pour `index.html` et les six sentinelles touchées, `js/rapport-bug.js` (la réserve du trou 6). Comparaison indépendante de la sentinelle : chaque paragraphe des blockquotes de `TEXTES-2026-10-28-aide-sept-trous.md`, balises retirées, insécables et apostrophes normalisées, cherché dans le texte de son entrée ; tous présents, sauf le texte Standards du 28 oct., absent comme il doit l'être. Playwright non rejoué.

## Verdict

**Accepté, avec une retouche d'une phrase, celle de Grégoire (trou 6).** Les cinq textes sont mot pour mot à leur place ; les trois entrées neuves sont où la consigne les met. La sentinelle neuve lit bien le fichier TEXTES (`readFileSync`, aucun texte recopié). Les cinq sentinelles ajustées le sont pour ce que la consigne a changé, chacune avec sa citation : aucune n'est affaiblie au-delà.

**Les suppositions sont retenues** (décision de Cowork) :
1. « Seules les séances saisies entrent dans A. » gardée : c'est ce que la consigne voulait dire par « les autres phrases restent ». Elle dit un fait que le paragraphe neuf ne dit pas (par défaut, tous sont présents à l'écran, mais une séance non enregistrée ne compte pas), et l'audit du 15 oct. le verrouille.
2. à 5. Le gras de relecture non repris, les apostrophes du fichier, l'insécable devant « % », le paragraphe à part : justes.

**La réserve du trou 6 est confirmée** à la mesure : `js/rapport-bug.js:678` (appareil), `:688` (cours actif), `:240` et `:731` (jusqu'à 20 erreurs, avec leur trace). Montée à Grégoire, qui a tranché.

## La retouche (Claude Code)

1. **Trou 6, la phrase validée par Grégoire le 29 oct. 2026 à 5 h 37** (« oui, on prend »), déjà écrite dans `TEXTES-2026-10-28-aide-sept-trous.md` (trou 6, blockquote et ligne ↻) : dans `accordeon-aide-ce-qui-sort`, après « …sans le texte de ce que tu as cliqué. », ajoute, mot pour mot :
   « S'y ajoutent des informations techniques, dont ton appareil, le cours actif et les dernières erreurs de l'application. »
   La phrase d'avant et celle d'après ne bougent pas. Note la validation dans le commentaire de la carte.
2. **La sentinelle du lot 4 doit rougir AVANT la retouche** (elle lit le fichier TEXTES, qui porte déjà la phrase) et verdir après : constate le rouge, puis fais la retouche. Si elle ne rougit pas, c'est elle qui est à revoir, pas le texte : arrête-toi et dis-le.
3. Vitest depuis `tests/`. L'essai Playwright du lot 4 n'est pas touché par cette phrase : ne le relance pas.

Un commit pour la retouche (`index.html`), un pour les docs (ce fichier et `TEXTES-2026-10-28-aide-sept-trous.md`, modifiés par Cowork) ; demande de relecture : `plans de travail/DEMANDE-RELECTURE-2026-10-29-aide-lot-4-retouche.md`, courte. Pas de release, de verdict ni de push sans le signal de Grégoire.
