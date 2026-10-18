# Consigne – la dissection, étape 4 : la version en ligne (1.204.0)

> Écrite par Cowork le dimanche 18 octobre 2026 à 10 h 22 (Toronto, mesuré par `date`). Étape 4 de `PLAN-2026-10-18-la-dissection-pour-lundi.md`. **Décision de Grégoire, 10 h 21 : la vérification complète tourne maintenant, pas ce soir**, pour que sa porte terrain se passe cet après-midi, avec le temps de corriger avant la rencontre de lundi 11 h. **Deux temps, deux relais de Grégoire**, comme le 17 : la release, relue par Cowork ; puis, Cowork fermé, le verdict et le push. Règles 2, 7 et 8 de `PROTOCOLE.md` ; skills `fin-de-session-labo-codex` (§4.5), `release-et-changelog`, `portes-terrain`.

## Ce que la version emporte (tout est relu ; Vitest complet vert sur `4c16a4f0`)

Depuis `71cdde64` (en ligne, 1.203.0) : les documents du jour (`9756388a`), l'étape 1 (`25584d62`, corrigée `77ecb741`), l'étape 2 en points (`903e7706`, corrigée `0ba1be2d`) et en niveaux (`cb125cb9`), l'étape 3 (`4c16a4f0`, avec l'entrée des Nouvelles 1.204, validée mot pour mot).

## Temps A — la release (dès que Grégoire relaie)

1. `/fin-de-session` jusqu'au commit de release **inclus** : intention **minor**, `scripts/release.mjs` → **1.204.0** (les quatre points de vérité, les jetons au build neuf). Ne réécris pas l'entrée des Nouvelles.
2. Vitest complet **après** le commit de release.
3. **La porte terrain de cet après-midi**, le markdown seulement (skill `portes-terrain` ; Cowork publie l'artefact jumeau) : `plans de travail/PORTE-TERRAIN-2026-10-18-la-dissection.md`. Elle remplace celle d'hier (`PORTE-TERRAIN-2026-10-19-apporter-mon-materiel.md`, qui visait l'assistant en sept étapes) : marque l'ancienne « périmée, remplacée par … » en tête, sans l'effacer. Ce qu'elle éprouve, sur **ses vraies grilles** (sa grille Cornell, la grille en réponses et points d'une collègue), sur le Mac (Safari) **et** sur l'iPad : le numéro 1.204.0 au bas de l'écran ; coller depuis Word ou Pages ; trouver où regarder (la palette à gauche, le bandeau du surligneur) ; étiqueter au doigt et au glisser sur l'iPad ; la lecture qui se refait ; « Créer ma grille » en points, puis la grille dans Grilles de critères en points (et non en %), les réponses dans leur ordre ; « des niveaux » choisi, le tableau rempli, l'échelle et la grille créées ; un nom déjà pris, changé dans le champ ; les Nouvelles 1.204. Les deux règles de tête du skill s'appliquent (aucune rangée qu'une machine peut vérifier). Aucun nom d'élève réel dans la porte.
4. Demande courte : `plans de travail/DEMANDE-RELECTURE-2026-10-18-version-1.204.0.md`. **Puis arrête-toi.**

## Temps B — le verdict et le push (quand Grégoire relaie de nouveau)

Il ne relaie qu'après l'accord de Cowork, **Chrome, Safari et Cowork fermés, Mac sur secteur** (règles 7 et 8).

1. Vérifie le secteur et la pression mémoire ; dis-le s'ils ne conviennent pas.
2. Verdict complet sur le **dernier commit**, qui contient la release.
3. **Vert** : push. **Rouge** : pas de push ; nomme le lot en cause d'après les commits, et arrête-toi.
4. Rapport court à Grégoire : vert ou rouge, poussé ou non, l'heure du push. Cowork constate chez Netlify.
