# Consigne du jour – la note en pourcentage à la norme française (mercredi 21 octobre 2026, après-midi)

> Écrite par Cowork le mercredi 21 octobre 2026 à 11 h 08 (Toronto, mesuré par `date`). Elle remplace celle du matin (lots 1 et 2 : faits, `67298d08` et `90809966`, relus : acceptés, `VERDICT-RELECTURE-2026-10-21-consigne-du-jour-verrou-et-note.md`), archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-10-21-verrou-et-note-du-profil.md`.

## La décision de Grégoire (21 oct. 2026, 11 h 07)

Ta trouvaille du lot 2 (« Note de la copie : X % » sur le PDF de l'élève, contre « X% » à l'écran) lui est remontée. Il a choisi **la norme française** : virgule décimale et espace insécable avant le signe, **« 89,2 % »**, dans le PDF de l'élève et partout où une note s'affiche.

## 0. Arbre propre d'abord

`git status` vide, sur `main`. Les commits non poussés de la journée restent tels quels ; ce lot s'y ajoute.

## 1. Le mandat

1. **`formaterNotePourcentage` rend la norme française** : « 89,2 % », « 67 % », « 0 % ». Une décimale au plus, sans zéro final (inchangé). L'espace est le caractère U+00A0, **pas** l'entité `&nbsp;` : plusieurs appelants passent le texte par `echapperHtml` ou `esc`, qui la doubleraient.
2. **Toute note ou moyenne de notes en pourcentage, lue par l'enseignant·e ou par l'élève, passe par elle** : écrans, PDF, aperçus, infobulles, journal. Critère de tri pour chaque site : « est-ce une note, ou une moyenne de notes ? ». Points de départ mesurés par Cowork (à remesurer, règle 1 de `PROTOCOLE.md`) :
   - le PDF de l'élève, `synthese-retroaction-rendu.js`, l. 449, 718, 742, 822, 826 ;
   - la note finale du profil (`profil-etudiant-sections-affichage.js`, les `toFixed(1) + '%'`) : l'exception de la sentinelle B disparaît ;
   - la note de l'écran d'évaluation, `evaluation-calcul.js` vers l. 1688 (`pourcentage.toFixed(1) + ' %'` : une note, même si la variable ne s'appelle pas ainsi) ;
   - les `toFixed(n)` suivis de « % » dans `js/` : 58 lignes, dont 24 nomment une note ou une moyenne. Balaie les 58 avec le critère ci-dessus.
3. **Dans le PDF de l'élève, une phrase ne mêle pas deux normes.** La l. 822 met des points et un pourcentage dans la même phrase (« … pts + … pts = … % ») : les nombres décimaux du PDF de l'élève suivent tous la virgule, avec l'espace insécable devant « pts » et « % ». Tu ne changes aucun mot.
4. **Hors du lot, à inscrire en un seul item** : les autres pourcentages (assiduité, pondérations « × 40% », indices, axes des graphiques) et les points à l'écran de l'enseignant·e. Ce ne sont pas des notes ; Grégoire a tranché pour les notes.
5. **Rien ne change pour ce qu'un logiciel relit** : CSV, xlsx, JSON, codex, archives, champs de saisie, valeurs stockées. Ils gardent des nombres. Mesuré par Cowork : le tri de la Liste se fait sur `noteChiffree` (numérique), et aucun code vivant ne relit une note affichée (`parseFloat` sur `textContent` : un seul résultat, un commentaire dans `evaluation-calcul.js` vers l. 1679). Remesure-le, specs Playwright comprises : une spec qui relit « 57.5% » à l'écran se corrige dans la spec, pas dans l'app.

## 2. Les tests

- Sentinelle `sentinelle-note-pourcentage-affichage.test.js` : le cas A passe à la norme française (dont le caractère U+00A0) ; le cas B s'étend aux `toFixed` suivis de « % » ou de « ␣% » sur une note ou une moyenne. Break-test : remettre la l. 449 d'origine doit la rougir.
- Vitest depuis `tests/`, puis les specs Playwright qui lisent une note à l'écran ou dans le PDF. **Pas de verdict complet ni de release maintenant** : ils tournent ce soir, avec le reste de la journée.
- Dans un vrai WebKit : le PDF de l'élève affiche « 89,2 % », sans « Â » ni glyphe manquant, et l'espace insécable ne coupe pas « 89,2 » de « % » en fin de ligne.

## 3. Clôture

- Commit sur `main`, puis demande de relecture à Cowork avant le push.
- L'item « Nouvelles » est proposé dans ton rapport, **pas écrit** dans `changelog-data.js` : Grégoire le valide à la release du soir. Il peut se fondre dans celui du lot 2 du matin, puisqu'ils partent ensemble.
- Toute trouvaille hors du lot : les trois issues de `CLAUDE.md`, « inscrire et continuer » par défaut.
- Termine par **le geste à vérifier à l'écran**, en une phrase d'utilisateur.
