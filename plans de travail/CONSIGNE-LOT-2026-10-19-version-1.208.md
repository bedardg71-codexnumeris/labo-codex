# Consigne – la version 1.208.0 (« Rattacher » sans ordre, et la dissection qui s'enregistre), ce matin

> Écrite par Cowork le lundi 19 octobre 2026 à 09 h 08 (Toronto, mesuré par `date`). **Décision de Grégoire, 9 h 07** : publier maintenant les lots 12 (`8eebd2e7`) et 11 (`c908c4a2`), relus et acceptés, pour la rencontre de la communauté à 11 h ; verdict complet puis push. Textes validés à 9 h 06 ; entrée des Nouvelles validée par Grégoire (voir plus bas). Le lot 13 attend. **Deux temps, deux relais** : la release, relue par Cowork ; puis, Cowork fermé, le verdict et le push. Règles 2, 7 et 8 de `PROTOCOLE.md` ; skills `fin-de-session-labo-codex` (§4.5) et `release-et-changelog`.

## Avant tout : le lot 13

S'il est commencé, **ne le commite pas sur `main`** : mets tout son travail en cours sur une branche `lot-13-en-cours` (un commit), reviens sur `main` à `c908c4a2`, arbre propre. Dis-le dans la demande. S'il ne l'est pas, n'y touche pas.

## Temps A — la release

1. **Les onze textes des lots 12 et 11** (les tableaux des deux demandes de relecture) : tels quels ; marque leurs commentaires « validé G. 19 oct. 9 h 06 ».
2. **L'entrée des Nouvelles**, `version: '1.208'`, `couleur: 'vert'`, en tête, mot pour mot, espaces insécables et apostrophes comme la 1.207 :
   - Titre : « Rattacher sans ordre, et une dissection qui s'enregistre »
   1. « « Rattacher » ne dépend plus de l'ordre de tes touchers : touche deux morceaux d'un même texte, l'application les lit dans l'ordre de ta grille, et le nom entier s'affiche sous le premier. Un troisième morceau rejoint le groupe ; deux touchers sur un morceau rattaché le détachent. »
   2. « Ta dissection s'enregistre à chaque geste : tu la retrouves telle que tu l'as laissée, même après avoir fermé l'application. « Coller une autre grille » repart à neuf. »
   Les entrées 1.207 et 1.206 restent telles quelles.
3. `/fin-de-session` jusqu'au commit de release **inclus** : intention **minor**, `scripts/release.mjs` → **1.208.0**.
4. Vitest complet **après** le commit de release.
5. La porte : Cowork a ajouté sa reprise à `PORTE-TERRAIN-2026-10-18-la-dissection.md` (§8) ; commite-la telle quelle, avec le verdict des lots 12 et 11, la consigne du lot 13, celle-ci, la consigne du jour et son archive.
6. Demande courte : `plans de travail/DEMANDE-RELECTURE-2026-10-19-version-1.208.0.md`. **Puis arrête-toi.**

## Temps B — le verdict et le push (second relais de Grégoire)

**Chrome, Safari et Cowork fermés, Mac sur secteur.** Verdict complet sur le **dernier commit** ; vert : push ; rouge : pas de push, nomme le lot en cause, arrête-toi. Rapport court : vert ou rouge, l'heure du push. Puis, si le lot 13 a été mis de côté, **ne le reprends pas** : attends la consigne.
