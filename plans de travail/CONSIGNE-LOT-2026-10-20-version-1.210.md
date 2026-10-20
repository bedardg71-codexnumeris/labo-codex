# Consigne – la version 1.210.0 (« Le barème d'un critère en points, et le compte des erreurs corrigé »), ce matin

> Écrite par Cowork le mardi 20 octobre 2026 à 10 h 31 (Toronto, mesuré par `date`), sur `main` à `4c1126f2` (onze commits non poussés depuis la 1.209.0, tous relus et acceptés par Cowork, sauf `4c1126f2`, relu dans la demande de ce lot). Décision de Grégoire (10 h 28) : publier **dès que le processus est terminé**, pas ce soir. Motif : la correction du « Nombre d'erreurs » (#1121) lui sert pour corriger les copies qu'il remet dans quelques jours.

## Temps A – la release

1. **L'entrée des Nouvelles**, `version: '1.210'`, `couleur: 'vert'`, en tête, mot pour mot, espaces insécables et apostrophes typographiques comme la 1.209 (texte proposé par Cowork à 10 h 28, validé par Grégoire à 10 h 30) :
   - Titre : « Le barème d'un critère en points, et le compte des erreurs corrigé »
   1. « Dans « Grilles de critères », un critère noté en points a maintenant son barème : des tranches de points, chacune avec ce qu'on attend d'une copie qui les obtient et, si tu veux, un nom. Les réponses des grilles que tu as apportées s'affichent comme un barème, et ta première modification l'enregistre sans rien perdre. Le barème ne change aucune note. »
   2. « Le barème a son aide : une aide « i » à côté de son titre, des bulles sur ses champs et une section dans Aide › Configuration. « Barème » et « tranche » s'ajoutent au lexique. »
   3. « En mode Évaluer, le nombre d'erreurs de français suit de nouveau les codes posés sur la copie. Il restait à 0 quand la palette Codes n'était pas à l'écran. »
   4. « Quand l'observation SOLO est désactivée, les grilles et les échelles ne montrent plus leurs menus SOLO, et un critère neuf reçoit « Aucun ». Le dépistage examine alors tous les critères, et le tableau de bord l'indique. »
   5. « Après « Créer ma grille », « Revenir à ma dissection » rouvre ta dissection telle que tu l'as laissée, pour en tirer une autre grille. »
   Les entrées 1.209 et précédentes restent telles quelles.
2. `/fin-de-session` jusqu'au commit de release **inclus** : intention **minor**, `node scripts/release.mjs minor` → **1.210.0**. Vérifie le jeton anti-cache de chaque fichier de `js/`, `index.html` et `styles.css` modifié depuis la 1.209.0 contre le build que le script pose. Donne la ligne « complexité » du relais.
3. Vitest complet **après** le commit de release.
4. Commite avec cette consigne et `plans de travail/VERDICT-RELECTURE-2026-10-20-bareme-2-pieces-d-aide.md` s'il n'est pas déjà commité. Ajoute les fichiers par leur chemin, jamais `git add -A`.
5. Demande courte : `plans de travail/DEMANDE-RELECTURE-2026-10-20-version-1.210.0.md`, qui dit aussi ce que `4c1126f2` (F1, F2) a fait et ce que tu as vu sur la capture en mode sombre. **Puis arrête-toi** : Cowork relit avant le temps B.

## Temps B – le verdict et le push (second relais de Grégoire)

**Seulement au signal de Grégoire : Chrome, Safari et Claude fermés, Mac sur secteur, sans veille.**

0. L'arbre de travail est propre ; sinon, arrête-toi et dis-le.
1. **Verdict complet du Mac** sur le commit de release (`node scripts/verifier-playwright.mjs`). Rouge : pas de push, nomme le lot en cause, arrête-toi.
2. Vert : **push** (`scripts/pousser.sh`).
3. Constate la mise en ligne chez Netlify : `app.codexnumeris.org` sert `version.json` en 1.210.0.
4. Rapport court : vert ou rouge sur le Mac, l'heure du push, la version constatée en ligne. La vérification chez GitHub qui part avec le push ne juge rien (décision du 19 oct.) : note seulement son résultat s'il est rendu.
