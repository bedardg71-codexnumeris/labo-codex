# Consigne – La version 1.213.0 : le verdict complet, puis le push, en l'absence de Grégoire

> Écrite par Cowork le mercredi 21 octobre 2026 à 12 h 16 (Toronto, mesuré par `date`). À lancer **seulement** quand le lot `CONSIGNE-LOT-2026-10-21-avant-version.md` est commité et relu (son verdict `VERDICT-RELECTURE-2026-10-21-avant-version.md` existe et dit « accepté »). Grégoire est absent pendant le verdict : le Mac reste ouvert, branché, sans veille. Personne ne peut répondre à une question : en cas de doute, **ne pousse pas**, écris l'état et arrête-toi.

## Ce qui part

Depuis la 1.212.0 (`c4b4b41f`) : une grille neuve entière (#1130) ; le critère algorithmique qui fait ce que son écran dit (#1134, #1131) ; l'étape 0 (#1135) ; les deux lots de mots ; « Verrouiller la saisie » ; la note du profil et la note à la norme française (#1136) ; le lot d'avant la version (#1138). Lis chaque verdict de relecture du 21 oct. dans `plans de travail/`.

## L'ordre (skills `fin-de-session-labo-codex` §4.5 et `release-et-changelog`)

1. **La version** : `node scripts/release.mjs minor` (nouveautés sans rupture ; aucune donnée ne change de format) → 1.213.0. Vérifie que les quatre points de vérité concordent (`git diff`).
2. **Les Nouvelles** (`js/changelog-data.js`) : l'entrée `1.213` ci-dessous, **mot pour mot**, apostrophes typographiques et `&nbsp;` comme l'entrée 1.212. Un commentaire au-dessus dit qui l'a validée et quand.
3. **Un commit** de release, sur `main`, qui emporte aussi cette consigne et `VERDICT-RELECTURE-2026-10-21-avant-version.md` (non suivis), par leur chemin.
4. **Le verdict complet** : `cd tests && npm test` (Vitest puis tout Playwright). Il est obligatoire avant le push : le diff depuis 1.212.0 touche `js/import-export.js` (verdict de l'étape 0).
5. **Vert** → `git push` de `main`. **Rouge** → ne pousse pas ; ne corrige rien qui touche l'application ; écris les échecs (spec, essai, première ligne d'erreur, et depuis quel commit si tu peux le mesurer sans rien modifier) dans `RELAIS.md`, et arrête-toi. Une spec rouge que tu juges périmée reste rouge : c'est la relecture de demain matin qui tranche.
6. **La fin de session** (`CLAUDE.md`) : `OU-EN-EST-ON.md` et `CONSIGNE-DEMARRAGE-PROCHAINE-SESSION.md` à jour. Le prochain lot est le miroir : `CONSIGNE-LOT-2026-10-21-critere-algorithmique-miroir.md`, suivant le tableau « Où en est le plan » de `PLAN-2026-10-21-critere-algorithmique-toute-discipline.md` (l'en-tête « ⏱ » de la consigne ne vaut plus).

## L'entrée des Nouvelles

**Validée par Grégoire à 12 h 18, telle quelle** (« c'est bon ») ; proposée par Cowork à 12 h 17, à partir des items proposés par Claude Code dans les demandes de relecture du jour.

- version : `1.213` ; couleur : `vert`
- titre : « Le critère algorithmique pour toute discipline, et des notes à la française »
- items :
  1. « Une grille neuve porte ses sous-critères et son barème dès sa création ; le barème vient sous les sous-critères. »
  2. « Critère algorithmique : la pondération d’un sous-critère s’applique maintenant aux codes que tu poses. Quand elle change le compte, l’élève lit « 7 erreurs (5 une fois pondérées) ». Avec des pondérations à 1, rien ne change. »
  3. « Un critère algorithmique neuf ne reçoit plus d’office les codes du français : ses codes sont ses sous-critères, dans toute discipline. « Partir de la liste du français écrit » donne dix catégories de correction du français. »
  4. « L’aide du critère algorithmique décrit ce que fait l’application, pour toute discipline. À l’évaluation, une grille en points affiche « (30 points) », et le niveau nomme son échelle. »
  5. « Les notes s’écrivent à la française partout où elles s’affichent et dans le PDF de l’élève : « 89,2 % », une décimale au plus. »
  6. « Saisie des présences : un seul bouton, « Verrouiller la saisie », remplace « Fermer » et la case à cocher. Une séance verrouillée le dit, avec son cadenas. »

## Ce qu'il ne faut pas

- Un `major` ; un lot de code ; le miroir.
- Pousser sur un verdict rouge, ou sur un verdict qui n'a pas fini.
