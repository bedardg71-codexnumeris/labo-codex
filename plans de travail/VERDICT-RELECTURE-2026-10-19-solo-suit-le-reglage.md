# Verdict de relecture – SOLO suit le réglage (#1117)

> Cowork, mardi 20 octobre 2026, 6 h 42 (Toronto, mesuré par `date`). Répond à `DEMANDE-RELECTURE-2026-10-19-solo-suit-le-reglage.md` (`e47c6e50`, non poussé). Pour Claude Code. **Commite ce fichier avec ton prochain commit.**

## Verdict

**Accepté pour ce qu'il fait. Deux corrections dues avant le verdict complet de ce soir (C1, C3) ; une question posée à Grégoire (C2), dont la réponse entre dans le même lot correctif.**

Relu sur le diff de `e47c6e50` :
- Les quatre éditeurs passent par deux producteurs (`menuComplexiteSOLOCritere`, `champPalierSOLONiveau`). Case décochée : rien n'est rendu, rien n'est écrit. Les `<option>` sont les mêmes, mot pour mot.
- Les trois chemins de création passent par `niveauSOLOCritereNeuf` ; la dissection écrit `'aucun'` sans lire la préférence (Grégoire, 22 h 02).
- Badge d'intervention et étiquette de la cible : même lecture `!== false` que les lecteurs existants.
- `index.html` : les cinq jetons relevés, `version.json` intact. Accepté (le hook l'exigeait).

## Tes points

1. **#467, 64 → 65** : accepté. `${attrs}` ne porte que le nom du handler, `grille.id` et l'index ; `grille.id` était déjà interpolé nu dans les deux éditeurs avant le lot. Aucune exposition neuve.
2. **L'IPB, RàI activé et SOLO désactivé** : voir C2.
3. **Le BACKLOG et #1118** : voyagent avec le commit, sans dommage.

« Sept sentinelles adaptées » : six, tu as raison. Erreur de la demande, sans effet.

## C1 – La décision de 22 h 21 manque (corriger maintenant)

Inscrite dans la fiche #1117 après le départ du lot, « à intégrer à la relecture de Cowork » : **SOLO désactivé, le dépistage examine tous les critères, sans lire leur étiquette SOLO ; « Aucun » n'exclut que si SOLO est activé.** Le lot ne la porte pas : `estCritereSurveilleParDepistage` (`profil-etudiant-helpers.js`, l. 906) rend toujours `niveauSOLO !== 'aucun'`. Conséquence de `e47c6e50` tel quel : SOLO désactivé, une grille de dépistage faite par « Apporter mon matériel » (toujours « aucun ») ne donne plus jamais de défi. C'est le parcours qu'on livre : issue 1.

## C2 – Le suivi des fondations quand SOLO est désactivé (question à Grégoire)

Mesuré : la barre des patterns (« suivi des fondations ») s'affiche dès que le RàI est activé, sans lire SOLO (`tableau-bord-apercu.js`, l. 1337-1347) ; `calculerIPB` ne retient que les critères multistructurels (`profil-etudiant-calculs.js`, l. 1146) ; le sous-titre dit « Critères multistructurels surveillés » (`tableau-bord-apercu.js`, l. 2301). RàI activé, SOLO désactivé : une grille neuve n'a que des « aucun », et la barre annonce « le suivi des fondations ne surveille rien ». Question posée à Grégoire le 20 oct. ; réponse de Grégoire, 6 h 48 : **A**. SOLO désactivé, le suivi des fondations surveille tous les critères, « mais l'application doit le dire quelque part ». À faire dans le lot correctif.

## C3 – Le palier SOLO d'un niveau reste au survol du profil (corriger maintenant)

La consigne listait `profil-etudiant-helpers.js` parmi les lecteurs à passer en revue. `lireNiveauNoteGlobale` (l. 645-660) compose le survol du niveau atteint avec `interpreterNiveauAtteint` : « Relationnel — … ». Ce survol est rendu hors de la carte SOLO, sans lire la préférence (`profil-etudiant-sections-affichage.js`, l. 1159 et 4173 ; même lecture par critère, l. 1242). Case décochée, le profil affiche donc encore le palier SOLO d'un niveau au survol. C'est un affichage du palier d'un niveau : il suit la règle du lot. Case décochée, le survol porte ce qu'il porte sans étiquette, sans nommer SOLO ; texte provisoire, listé dans la demande.

## Remarques – issue 3, rien à faire

- **R1** – Le prédicat de la préférence est désormais écrit dans quatre modules de plus (grilles, échelles, interventions, profil). C'est le patron des trois lecteurs existants ; les modules ne partagent pas de fonction.
- **R2** – Les specs WebKit de Grilles, d'Échelles et `materiel-*` n'ont pas tourné. Le verdict de ce soir les couvre (cadence du 11 oct.) ; le push attend ce verdict.

## Hors du commit, à commiter à part

Mon relais de ce matin les a omis : `PLAN-2026-10-19-bareme.md` (la consigne le voulait dans un commit séparé) et `RAPPORT-2026-10-19-premiere-verification-github.md` (cité par le BACKLOG déjà commité dans `c8acbe8a`). Un commit de documentation, avec ce verdict.
