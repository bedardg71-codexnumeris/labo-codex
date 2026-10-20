# Consigne – la version 1.212.0 (« Le PDF de ta grille en points, à la forme de ton original »), ce soir

> Écrite par Cowork le mardi 20 octobre 2026 à 18 h 59 (Toronto, mesuré par `date`), sur `main` à `2fc42169` (quatre commits non poussés depuis la 1.211.0, tous relus et acceptés par Cowork : `9882d2d5`, `67298a8d`, `c04df849`, `2fc42169`). Décision de Grégoire (18 h 58) : fin de session ce soir, verdict complet, push ; il expérimente ensuite dans l'application en ligne.

## Temps A – la release

1. **L'entrée des Nouvelles**, `version: '1.212'`, `couleur: 'vert'`, en tête, mot pour mot, espaces insécables et apostrophes typographiques comme la 1.211 (texte proposé par Cowork à 18 h 58, validé par Grégoire à 18 h 59 tel quel) :
   - Titre : « Le PDF de ta grille en points, à la forme de ton original »
   1. « Le PDF d'une grille en points montre son barème. Quand tous les critères ont les mêmes niveaux, il reprend la forme de ta grille d'origine : une colonne par niveau, chaque descripteur avec ses points dessous, les éléments observables sous chaque critère, et le total au bas. Sinon, chaque critère montre ses tranches, une par ligne, avec leurs points. »
   2. « Une grille dont tous les critères ont un barème n'exige plus d'échelle de performance pour « Préparer le PDF ». La colonne de la pondération s'y intitule « Points ». »
   3. « Après « Préparer le PDF », la fiche de ta production garde tes choix et enregistre de nouveau ce que tu y changes. Avant, elle revenait sans ta grille et n'enregistrait plus rien, sans le signaler. »
   Les entrées 1.211 et précédentes restent telles quelles.
2. **L'inscription du verdict** `VERDICT-RELECTURE-2026-10-20-pdf-grille-forme-originale.md` : le gras des éléments observables dans le PDF, alors que la grille d'origine ne les met pas en gras. Une fiche neuve au BACKLOG ; son numéro reporté dans le verdict.
3. `/fin-de-session` jusqu'au commit de release **inclus** : intention **minor**, `node scripts/release.mjs minor` → **1.212.0**. Vérifie le jeton anti-cache de chaque fichier de `js/`, `index.html` et `styles.css` modifié depuis la 1.211.0 contre le build que le script pose. Donne la ligne « complexité » du relais.
4. Vitest complet **après** le commit de release.
5. Commite avec cette consigne et le verdict ci-dessus (non suivi par git). Ajoute les fichiers par leur chemin, jamais `git add -A`. Mets à jour `RELAIS.md` et `OU-EN-EST-ON.md`.
6. Demande courte : `plans de travail/DEMANDE-RELECTURE-2026-10-20-version-1.212.0.md`. **Puis arrête-toi** : Cowork relit avant le temps B.

## Temps B – le verdict et le push (second relais de Grégoire)

**Seulement au signal de Grégoire : Chrome, Safari et Claude fermés, Mac sur secteur, sans veille.**

0. L'arbre de travail est propre ; sinon, arrête-toi et dis-le.
1. **Verdict complet du Mac** sur le commit de release (`node scripts/verifier-playwright.mjs`). Rouge : pas de push, nomme le lot en cause, arrête-toi.
2. Vert : **push** (`scripts/pousser.sh`).
3. Constate la mise en ligne chez Netlify : `app.codexnumeris.org` sert `version.json` en 1.212.0.
4. Rapport court : vert ou rouge sur le Mac, l'heure du push, la version constatée en ligne. La vérification chez GitHub qui part avec le push ne juge rien (décision du 19 oct.) : note seulement son résultat s'il est rendu.
