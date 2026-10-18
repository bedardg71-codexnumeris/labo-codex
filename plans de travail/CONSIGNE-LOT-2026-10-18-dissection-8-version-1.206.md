# Consigne – la dissection : la version 1.206.0 (« Rattacher »)

> Écrite par Cowork le dimanche 18 octobre 2026 à 17 h 23 (Toronto, mesuré par `date`). Le lot 7 (`b20fedb9`) et sa correction (`c2cff80e`) sont relus et acceptés. Grégoire a tranché les textes à 17 h 18 (sa page « Tes mots pour la dissection ») et validé à 17 h 22 l'entrée des Nouvelles ci-dessous. **Deux temps, deux relais**, comme pour la 1.205.0 : la release, relue par Cowork ; puis, Cowork fermé, le verdict et le push. Règles 2, 7 et 8 de `PROTOCOLE.md` ; skills `fin-de-session-labo-codex` (§4.5) et `release-et-changelog`.

## Temps A — la release (dès que Grégoire relaie)

1. **Les textes de « Rattacher »** (le tableau de `DEMANDE-RELECTURE-2026-10-18-dissection-7-rattacher.md`) : tous inchangés, sauf le refus « boucle », qui devient « Ce morceau est déjà la suite de « … » : ils sont déjà rattachés, dans l'autre sens. ». Marque leur commentaire « validé G. 18 oct. 17 h 18 ».
2. **La ligne d'état après le collage d'un texte sans tableau** (lot 1) devient « Texte collé : … lignes, sans tableau. L'application rangera les morceaux selon leur ordre. » (validé G. 18 oct. 17 h 18 ; validée à 9 h 52 avec « rattachera », revue à cause du nom de l'outil). Le tableau collé ne change pas.
3. Les bancs qui citent ces deux phrases suivent.
4. **L'entrée des Nouvelles**, `version: '1.206'`, `couleur: 'vert'`, en tête, mot pour mot (espaces insécables comme l'entrée 1.205) :
   - Titre : « Rattacher un morceau »
   1. « Dans « Apporter mon matériel », l'outil « Rattacher » joint un morceau à celui dont il est la suite, quand ta grille écrit un même nom de critère sur plusieurs lignes d'une case. Tu touches la suite, puis le morceau qu'elle continue : l'application lit les deux comme un seul texte. »
   2. « Un morceau rattaché garde une marque en pointillé ; touche-le de nouveau avec « Rattacher » pour défaire le lien. Rien n'est déplacé dans ta grille. »
   L'entrée 1.205 reste telle quelle.
5. `/fin-de-session` jusqu'au commit de release **inclus** : intention **minor**, `scripts/release.mjs` → **1.206.0**.
6. Vitest complet **après** le commit de release.
7. La porte : Cowork a ajouté sa reprise à `PORTE-TERRAIN-2026-10-18-la-dissection.md` (§6) ; commite-la telle quelle.
8. Demande courte : `plans de travail/DEMANDE-RELECTURE-2026-10-18-version-1.206.0.md`. **Puis arrête-toi.**

## Temps B — le verdict et le push (second relais de Grégoire)

**Chrome, Safari et Cowork fermés, Mac sur secteur.** Verdict complet sur le **dernier commit** ; vert : push ; rouge : pas de push, nomme le lot en cause, arrête-toi. Rapport court : vert ou rouge, l'heure du push.
