# Consigne – « Apporter mon matériel », étape 8 du plan : la version en ligne

> Écrite par Cowork le samedi 17 octobre 2026 à 16 h 25 (Toronto, mesuré par `date`). Étape 8 de `PLAN-2026-10-17-pret-pour-lundi.md`. **Deux temps, deux relais de Grégoire** : la release, relue par Cowork ; puis, Cowork fermé, le verdict et le push. Règles 2, 7 et 8 de `PROTOCOLE.md` ; skills `fin-de-session-labo-codex` (§4.5, l'ordre) et `release-et-changelog`, `portes-terrain`.

## Ce que la version emporte (tout est relu, Vitest complet vert sur `d2e0bf66`)

Depuis `4a972d13` (en ligne, 1.202.0) : l'étape 2 (`96812253`), l'étape 5 et #1095 (`51a7be2b`), 6 (`1c1868e0`), 5b et ses corrections (`d75d8f09` → `a26fb3dd`, dont les icônes « i »), 7 (`e87f5ad7` → `d2e0bf66`). L'entrée des Nouvelles 1.203 est déjà posée (`af1fbe99`).

## Temps A — la release (dès que Grégoire relaie)

1. `/fin-de-session` jusqu'au commit de release **inclus** : intention **minor**, `scripts/release.mjs` → **1.203.0** (les quatre points de vérité, les jetons au build neuf). Ne réécris pas l'entrée des Nouvelles : elle est validée mot pour mot.
2. Vitest complet **après** le commit de release.
3. **La porte terrain de lundi matin**, le markdown seulement (skill `portes-terrain` : Cowork publie l'artefact jumeau) : `plans de travail/PORTE-TERRAIN-2026-10-19-apporter-mon-materiel.md`. Ce qu'elle éprouve, sur ses vraies grilles, sur le Mac (Safari) **et** sur l'iPad : coller une grille de Word ou de Pages, la lecture sans geste, une correction au menu, « Créer ma grille », la grille dans Grilles de critères avec « Ce qui est attendu à chaque niveau », le « i » du type de critère, les Nouvelles 1.203. Premier contrôle : le numéro de version au bas de l'écran. Les deux règles de tête du skill s'appliquent (aucune rangée qu'une machine peut vérifier).
4. Demande courte : `plans de travail/DEMANDE-RELECTURE-2026-10-17-version-1.203.0.md`. **Puis arrête-toi.**

## Temps B — le verdict et le push (quand Grégoire relaie de nouveau)

Il ne relaie qu'après l'accord de Cowork, **Chrome, Safari et Cowork fermés, Mac sur secteur** (règles 7 et 8).

1. Vérifie le secteur et la pression mémoire ; dis-le s'ils ne conviennent pas.
2. Verdict complet sur le **commit de release**, jamais un commit antérieur.
3. **Vert** : push. **Rouge** : pas de push ; nomme le lot en cause d'après les commits, et arrête-toi.
4. Rapport court à Grégoire, pour son réveil : vert ou rouge, poussé ou non. Le constat chez Netlify se fait le matin.
