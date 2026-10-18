# Consigne – la dissection : la version 1.205.0 (« Couper »)

> Écrite par Cowork le dimanche 18 octobre 2026 à 13 h 50 (Toronto, mesuré par `date`). Le lot 5 (`b15fd5ea`) et sa correction (`63e7b4de`) sont relus et acceptés. Grégoire a validé à 13 h 48 les quatorze textes neufs **tels quels**, et à 13 h 49 l'entrée des Nouvelles ci-dessous. **Deux temps, deux relais**, comme ce matin : la release, relue par Cowork ; puis, Cowork fermé, le verdict et le push. Règles 2, 7 et 8 de `PROTOCOLE.md` ; skills `fin-de-session-labo-codex` (§4.5) et `release-et-changelog`.

## Temps A — la release (dès que Grégoire relaie)

1. Les quatorze textes de « Couper » et des raisons nommées : inchangés ; marque leur commentaire « validé G. 18 oct. 13 h 48 ».
2. L'entrée des Nouvelles, `version: '1.205'`, `couleur: 'vert'`, en tête, mot pour mot (espaces insécables comme l'entrée 1.204) :
   - Titre : « Couper un morceau »
   1. « Dans « Apporter mon matériel », l’outil « Couper » sépare un morceau en deux, là où tu touches, quand une même ligne de ta grille porte plusieurs choses : un critère, ses points, ses cases à cocher. La coupe tombe entre deux mots, et « Annuler la dernière coupe » recolle. »
   2. « Quand quelque chose empêche de créer ta grille, la raison nomme maintenant le critère ou le morceau en cause. »
   3. « Une grille dont chaque critère porte ses points (« / 10 ») se lit comme une grille en points. »
   4. « Une pondération posée sur une ligne de total ne devient plus, sans rien dire, le poids d’un critère. »
   L'entrée 1.204 reste telle quelle.
3. `/fin-de-session` jusqu'au commit de release **inclus** : intention **minor**, `scripts/release.mjs` → **1.205.0**.
4. Vitest complet **après** le commit de release.
5. La porte : Cowork a déjà ajouté sa reprise à `PORTE-TERRAIN-2026-10-18-la-dissection.md` (§5) ; commite-la telle quelle.
6. Demande courte : `plans de travail/DEMANDE-RELECTURE-2026-10-18-version-1.205.0.md`. **Puis arrête-toi.**

## Temps B — le verdict et le push (second relais de Grégoire)

**Chrome, Safari et Cowork fermés, Mac sur secteur.** Verdict complet sur le **dernier commit** ; vert : push ; rouge : pas de push, nomme le lot en cause, arrête-toi. Rapport court : vert ou rouge, l'heure du push.
