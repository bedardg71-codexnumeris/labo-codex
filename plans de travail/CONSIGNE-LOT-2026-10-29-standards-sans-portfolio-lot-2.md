# Consigne – Des standards sans portfolio, lot 2 : les lecteurs secondaires lisent le même pool (29 octobre 2026)

> Écrite par Cowork le jeudi 29 octobre 2026 à 7 h 48 (Toronto, mesuré par `date`), sur `main` = `8ecdcb70` (non poussé). Ne remplace aucune autre consigne.
> Plan : `PLAN-2026-10-28-standards-sans-portfolio.md`, § 3, lot 2, et § 6 (trouvailles « lot 2 »). Le lot 1 et ses deux retouches sont acceptés (`VERDICT-RELECTURE-2026-10-28-standards-sans-portfolio-lot-1*.md`) : `obtenirArtefactsIdsPoolStd` (`js/pratiques/pratique-registre.js:813`) est la définition du pool. **Aucune décision de Grégoire n'est attendue dans ce lot.**

## 0. Avant tout

- Rituel de début de session. Un seul lot, aucune suite qui tourne.
- Commit de docs seul, fichiers nommés : ce fichier et `VERDICT-RELECTURE-2026-10-29-aide-lot-5.md` (Cowork y a ajouté la relecture des deux retouches : le lot 5 est clos).
- Les numéros de ligne du plan datent d'avant le lot 1 : remesure chaque site avant de le toucher.

## 1. Ce que l'utilisateur verra

Pour une pratique Standards **sans « Artefact »** (la chimie du banc), le dépistage, le panneau « Engagement », la colonne « ≥ Min. » du tableau, la carte Complétion du profil, l'export anonymisé pour la recherche et la liste « Productions à venir » du PDF parlent **des mêmes productions que la note**. **Pour la pratique de Grégoire, rien ne change** : le pool y est déjà fait des « Artefact ». **Aucune donnée réécrite** ; tout se lit au calcul.

## 2. Le mandat

1. **Une seule définition du pool.** Les lecteurs qui choisissent eux-mêmes leurs productions en standards passent par `obtenirArtefactsIdsPoolStd` : la branche standards d'`obtenirIdsProductionsEvaluables` (`js/profil-etudiant-helpers.js:457`, le dépistage) ; `_construireListeArtefactsMobilisation` (`js/profil-etudiant-sections-affichage.js:120`) ; la colonne « ≥ Min. » (`js/etudiants.js:~912`, `p.type === 'artefact-portfolio'`) ; `genererSectionCompletion` (`profil-etudiant-sections-affichage.js:3379`) ; l'export recherche (`js/trimestres.js:~2197` et `construireProfilsRLO`, `:~2489`) ; les productions « à venir » du PDF (`js/synthese-retroaction-data.js:~1459`, avec son repli « non-portfolio », qui part). Le filtre des diagnostiques reste où il est, en premier (#790, #883, #1055). Tout autre lecteur que tu trouves en chemin et qui refait sa propre sélection en standards : même traitement, nommé dans la demande.
2. **L'export recherche est un format qui voyage** (règle 2 de `PROTOCOLE.md`) : **aucune clé ne change** (`artefacts` reste `artefacts`) ; seul le contenu suit le pool. Donne, dans la demande, un export du banc avant → après pour GREG (identique) et pour CHIM.
3. **Retiré** : `calculerPerformanceRecente` (`js/pratiques/pratique-pan-standards.js:281`, aucun appelant à la mesure de Cowork : `grep` sur `js/` et `tests/`, confirme-le). **Le panneau « Engagement »** : mesure en début de lot s'il peut lire les productions retenues par `calculerDetailsNoteFinale` (comme le panneau des habiletés depuis #714) ; si oui, sa sélection propre part ; sinon, il passe par le pool, et dis pourquoi.
4. **Les mots ne bougent pas.** Un écran qui dirait « artefact » d'une production qui n'en est pas un (CHIM) : ne change pas le mot, liste-le dans la demande pour le lot 5 du plan (les mots, qui reviennent à Grégoire).
5. **Les trouvailles** : les trois issues de `CLAUDE.md`, « inscrire » par défaut. Rien des lots 3 à 5.

## 3. Les tests

- **Une sentinelle de parité par lecteur**, sur le banc de `sentinelle-standards-sans-portfolio` (données fictives) : pour GREG-0 à GREG-2, chaque lecteur rend exactement ce qu'il rendait avant (épinglé sur l'ancien code) ; pour CHIM-1, CHIM-3 et CHIM-5, chaque lecteur rend les productions du pool, ni plus ni moins (une diagnostique jamais). GREG garde 84,8, CHIM-1 77, CHIM-3 80,63.
- **Break-test** (arbre restauré par sha256) : un lecteur rendu à sa sélection propre → sa parité rougit sur CHIM.
- Vitest depuis `tests/`. Playwright ciblé si un rendu change pour CHIM (le profil, la carte Complétion) ; on attend l'élément, jamais `waitForTimeout`.

## 4. Clôture

- `BACKLOG.md` : la fiche du chantier, lot 2 coché quand il est fait.
- Demande de relecture : `plans de travail/DEMANDE-RELECTURE-2026-10-29-standards-sans-portfolio-lot-2.md` : chaque lecteur, avant → après pour GREG et CHIM, preuve `fichier:ligne`, test, break-test ; l'export du banc ; la mesure du panneau « Engagement » ; les mots notés pour le lot 5.
- Un commit pour le code, un pour les docs. Pas de release, de verdict ni de push sans le signal de Grégoire.
