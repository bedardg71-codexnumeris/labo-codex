# Consigne – Des standards sans portfolio, lot 1 : le pool sans artefacts (le calcul) (28 octobre 2026)

> Écrite par Cowork le mercredi 28 octobre 2026 à 20 h 20 (Toronto), sur `main` = `origin/main` = `ace09fa2` (1.223.0 en ligne). Ne remplace aucune autre consigne.
> Plan : `PLAN-2026-10-28-standards-sans-portfolio.md`, § 3, lot 1 (relu par Cowork le 28 à 15 h 14). Décisions : `DECISIONS-2026-10-28-construction-de-la-note.md`, § « Le point de départ », Q1 à Q6, mots neufs 1 et 2, et **l'erratum de Q3**. **Urgent pour Grégoire** (28 oct., 14 h 55).

## 0. Avant tout

- Rituel de début de session. Un seul lot, sur un `main` à jour, aucune suite qui tourne.
- Commit de docs seul, fichiers nommés : ce fichier, `DECISIONS-2026-10-28-construction-de-la-note.md`, `VERDICT-RELECTURE-2026-10-28-rouge-github-1223.md`, `CONSIGNE-DEMARRAGE-COWORK.md` (racine).

## 1. Ce que l'utilisateur verra

Une pratique Standards sans aucune production de type « Artefact » calcule une note à partir de ses productions évaluées, quels que soient leur type et leur pondération. Sans terminale, ces productions valent 100 % ; une terminale pondérée prend sa part, le reste au pool (règle du complément, inchangée). Quand la note manque, l'application dit pourquoi. **La pratique de Grégoire garde sa note** : l'invariant (dès qu'un « Artefact » existe, le pool d'aujourd'hui) n'est pas touché. **Aucune donnée réécrite** : tout se lit au calcul.

## 2. Le mandat

1. **Le pool** (plan, § 3, lot 1, « le geste ») : dans `obtenirArtefactsIdsPoolStd` (`js/pratiques/pratique-registre.js:796`), la seconde branche seulement : toutes les productions hors conteneur et terminale (les diagnostiques sont déjà retirées en amont, CHIM-5), **sans condition de pondération** ; si au moins une porte une `categorie` (« sélection » ou « obligatoire »), le pool est fait de celles-là. La première branche (« Artefact ») ne change pas (Q2). Mesure le cas d'une `categorie` égarée hors hybride dans une pratique sans artefact, et donne-le en avant → après.

2. **La cause d'une note qui manque** (mot neuf 2, validé par Grégoire à 20 h 13), **au caractère près** :
   - aucune production du pool n'a de note : « Aucune production retenue pour la note n'est encore évaluée. » ; avec un « Artefact » : « Aucun artefact du portfolio n'est encore évalué. »
   - seule la terminale a une note (Q3, la note reste non constructible) : « Seule l'évaluation terminale a une note. En standards, la note du cours s'appuie aussi sur les productions retenues : elle ne se calcule pas sur la terminale seule. » ; avec un « Artefact » : « … s'appuie aussi sur les artefacts du portfolio : … ».

   Le second cas passe avant le premier. La variante suit la même condition que la première branche du pool (Q1). **Une seule source** : une fonction de la famille Standards rend la phrase ; `calculerDetailsNoteFinale` la met dans `erreur` (au lieu de `erreur: null`, CHIM-1 du plan), et la pratique la déclare par `expliquerNoteNonConstructible`, que lisent déjà le rapport, le Suivi et l'export (`causeNoteNonConstructible`, `js/portfolio.js:362` ; la route n'existe aujourd'hui que pour les spécifications, `js/pratiques/pratique-configurable.js:561-571`). Tout autre chemin où, après le lot, une note Standards manque sans cause (le minimum avant le calcul formatif, par exemple) : **inscris-le, n'invente pas de phrase**.

   L'encadré du profil (`js/profil-etudiant-sections-affichage.js:2842-2853`) suppose une erreur de configuration : bouton « Réglages de la pratique », infobulle « vérifier ses paramètres ». Pour une cause propre à l'étudiant·e, **mesure ce qui s'affiche** (le plan, § 7, ne l'a pas rendu) et rapporte-le ; ne change pas ces mots.

3. **La formule du récit** (mot neuf 1, validé à 15 h 20), au caractère près, dans `formuleTexte` (`js/profil-etudiant-actions.js:~646`) : avec terminale, « portfolio × 60 % + terminale × 40 % » (inchangé ; les pourcentages sont ceux de la pratique) ; sans « Artefact », « productions retenues × 70 % + terminale × 30 % ». Sans terminale : « moyenne du portfolio » ; sans « Artefact », « moyenne des productions retenues ». Plus jamais « terminale × 0 % ». Vérifie chaque lecteur (Comparateur, `comparateur-pratiques.js:990` ; profil ; PDF, non vérifié par Cowork).

4. **Le doublon réconcilié** (question 3 de la relecture des correctifs, `VERDICT-RELECTURE-2026-10-28-construction-de-la-note-correctifs.md`, § « Les dispositions ») :
   - **Le récit standards** (`js/profil-etudiant-actions.js:600-619`) : `_remplacees` prend aussi les doublons réconciliés et les dit « remplacée par une reprise ». Sépare-les comme le récit sommatif depuis #360 (`js/pratiques/pratique-sommative.js:229-262`) : la reprise garde « remplacée par une reprise » ; le doublon prend « doublon note-égale », le libellé déjà en usage en sommative, sans sa seconde moitié, comme le récit standards le fait déjà pour la reprise. Aucun mot neuf ; signale-le dans « Pour Grégoire » (l'étudiant·e le lit au PDF).
   - **La tuile du registre longitudinal** (`js/registre-longitudinal.js:775`) : « remplacée par une reprise » pour toute copie qui porte `remplaceeParId`, donc aussi un doublon et une originale dans la fenêtre de reprise (E4). Décision de Cowork : la tuile ne l'écrit plus dans ces deux cas, et **n'écrit rien à la place** (les mots de la tuile ont été relus par Grégoire le 18 sept.). Si la tuile ne peut pas savoir (une copie rangée sans le drapeau ni sa reprise), laisse-la comme aujourd'hui et dis-le.

5. **Les trouvailles** : les trois issues de `CLAUDE.md`, « inscrire » par défaut. Ce qui va aux lots 2 à 5 du plan (§ 6) n'est pas touché ici.

## 3. Les tests

- **La sentinelle** `sentinelle-standards-sans-portfolio` (le banc du plan, § 1, données fictives) : CHIM-1 non constructible → 77 ; CHIM-3 → 80,63 ; CHIM-4 non constructible → 78 (voir l'erratum de Q3) ; CHIM-2 et CHIM-5 restent 77 ; GREG-0 à GREG-2 restent 84,8. **Quatre cas neufs** : CHIM-6, seule X2 (terminale) évaluée → non constructible, seconde phrase, « productions » ; CHIM-7, rien d'évalué → première phrase, « productions » ; GREG-3, aucun artefact évalué → première phrase, « artefact » ; GREG-4, seule la terminale → seconde phrase, « artefacts du portfolio ».
- La formule : un essai par variante (quatre). Le doublon : un essai au récit, un à la tuile ; la reprise garde son mot.
- **La source unique** : un essai montre que l'encadré, le rapport et l'export rendent la même chaîne.
- **Break-test** (arbre restauré par sha256) : sans le correctif du pool, la sentinelle rougit sur CHIM-1, 3 et 4 ; sans la phrase, sur CHIM-6 et 7.
- Un essai Playwright ciblé : le profil de l'étudiant·e CHIM-6 montre l'encadré et la seconde phrase. On attend l'élément, **jamais `waitForTimeout`**.
- Vitest depuis `tests/`. Stock : aucune écriture ; les captures déjà prises gardent leur P (à dire dans la demande).

## 4. BACKLOG

- **La fiche du chantier** (numéro suivant) : « Des standards sans portfolio ni terminale », avec la citation de Grégoire (DECISIONS, § « Chantier de Grégoire »), le plan, les décisions et les cinq lots ; le lot 1 coché quand il est fait.
- **La réserve du 28** : les `waitForTimeout` fixes des specs du soir (`copie-non-recevable-note-28-oct` ×6, `construction-de-la-note-correctifs-28-oct`, `aide-lot-2c`, `-2c-bis`, `-2d`), une ligne rattachée à #1114, *inscrire et continuer* (`VERDICT-RELECTURE-2026-10-28-rouge-github-1223.md`).

## 5. Clôture

- Demande de relecture : `plans de travail/DEMANDE-RELECTURE-2026-10-28-standards-sans-portfolio-lot-1.md` (avant → après de chaque cas, preuves `fichier:ligne`, tests et break-test, ce que montre l'encadré pour CHIM-6, et « Pour Grégoire » : le libellé du doublon, l'encadré devant une cause propre à l'étudiant·e).
- Un commit pour le code, un pour les docs. Pas de release, de verdict ni de push sans le signal de Grégoire.
