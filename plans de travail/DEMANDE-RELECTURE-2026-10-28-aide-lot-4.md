# Demande de relecture – L'Aide, lot 4 : les trous comblés (#1152)

> Claude Code, jeudi 29 octobre 2026, matin, sur `main` = `1dd1dcca` (code) ; consigne `CONSIGNE-LOT-2026-10-28-aide-lot-4-les-trous.md` (Cowork, 28 oct. à 14 h 41, retouchée le 29 à 5 h 13 : le trou 2 y entre), commitée seule avant le lot avec la réécriture Standards (`f638e9a7`). Lancée après la retouche du juge de GitHub (`4e3c0fb2`, `efe841f4`). Rien de poussé, pas de release, pas de verdict.

## En bref

- **Cinq textes intégrés mot pour mot**, lus dans `TEXTES-2026-10-28-aide-sept-trous.md` : le trou 3 dans `saisie-presences`, le trou 1 dans `codex`, et trois entrées neuves, `construction-note` (trou 2, après `pratique`), `rencontres` (trou 5, entre `planifier-rai` et `tirage-sort`), `ce-qui-sort` (trou 6, après `export-import`). Trous 4 et 7 : rien à faire.
- **Aucun texte faux à la mesure.** Une réserve sur le trou 6 (plus bas) : vrai, mais le rapport de bug contient plus que ce qu'il énumère.
- Aide : 11 523 mots → 12 866 (+1 343 ; mon compte, texte visible de `#section-aide`) : `construction-note` 838, `ce-qui-sort` 211, `rencontres` 166 ; `codex` 356 → 445 ; `saisie-presences` 116 → 155.
- Aucun fichier `js/` touché. Vitest : 10 222 verts sur 10 222 (846 fichiers). Playwright : l'essai neuf et trois voisins de l'Aide verts (WebKit) ; la suite complète n'a pas tourné.

## Ce que la mesure a dit, trou par trou

| Trou | « À mesurer » du fichier, et autres phrases | Mesuré |
|---|---|---|
| 3 | présent par défaut ; le premier geste écrit ; « Confirmer la séance » ; le verrou enregistre ; « Non saisi·e : compté·e absent·e » | `js/saisie-presences.js:1531-1534`, `:916-944`, `:848-858`, `:1161`, `index.html:7923-7927` — vrai |
| 1 | les trois boutons ; rien si le codex est à jour ; grille, échelle, cartouche, cours, critère déjà évalué ; « Écrire le codex à part » aux quatre gestes ; le nom à retaper (trimestre seul) ; le trimestre actif ; le cours qui porte des données | `js/codex.js:3863-3888` (boutons composés : « Mettre à jour, puis » + verbe, verbe « supprimer » par défaut), portes `grilles.js:508, 2979`, `echelles.js:3389`, `cartouches.js:1679`, `cours.js:538` ; `trimestre-v2-liste.js:302-335` ; `cours.js:494-516` — vrai |
| 5 | le bouton « Créer mon service d'orthopédagogie » | composé, `rencontres.js:191` + `mots-nature.js` (`objetLong`), apostrophe typographique à l'écran (supposition 3) ; le reste : `rencontres.js:141-213`, `interventions.js:131-153`, `accueil.js` (« Tu es orthopédagogue ? », présent au HEAD **et** dans tes modifications non commitées de l'accueil) — vrai |
| 6 | `title="Signaler un bug ou donner ton avis"` ; aucune `cleSecrete` passée | `index.html:3913` ; `data-action="exporterFormatRecherche"` sans paramètre, `trimestres.js:1952-1954` tire une clé — vrai ; **réserve** plus bas |
| 2 | chaque phrase, contre les deux bancs | `sentinelle-construction-de-la-note-2026-10-28` : SOM-1 à SOM-C13, SPE-1 à SPE-C5 (l'exemple 80, 87,5, 90, 72 → 100 est COPIES_SPE), STD-1 à STD-9, STD-H1 à H3, STD-C1 à C7, DEN-1 à DEN-4 ; `sentinelle-standards-sans-portfolio` : CHIM-1 à 7, GREG-3 et 4 (« Si seule l'évaluation terminale a une note »). **La phrase seulement lue** (« Une production retenue non recevable sort du calcul », hors artefact) : **mesurée**, essai E neuf du banc Standards — CHIM-1, Laboratoire 1 en plagiat : 78,75 (hors du pool), ni 77 (ignoré) ni 63 (un 0). Vrai |

## Réserve sur le trou 6 : le rapport de bug contient plus que ce qu'il énumère

Le texte dit : « le rapport contient ta description, ton prénom, la version, ton navigateur, la section ouverte, des comptes (étudiant·es, productions, évaluations), l'état du stockage et tes 20 derniers gestes, sans le texte de ce que tu as cliqué ». Chaque élément est vrai (`js/rapport-bug.js:647-725`). Mais le rapport porte aussi, mesuré : le **code du cours actif**, la pratique par défaut et la pratique active, le mode ; l'appareil, le système et l'écran ; dans Réglages › Données, l'objet `infoCours` entier ; la dernière mise à jour et les avertissements du codex ; **jusqu'à 20 erreurs de la console, avec leur trace** (`:238-240`, `:722-730`). Le nombre d'évaluations n'y est que si la section Évaluation est ouverte. Dans une entrée qui dit ce qui sort de l'application, l'énumération se lit comme complète. Je ne l'ai pas changée (consigne : les mots validés ne bougent pas) ; **c'est à Grégoire** : la garder, ou ajouter « et des informations techniques (ton appareil, le cours actif, les dernières erreurs) ». Issue : *remonte à Grégoire* (ses mots), pas au BACKLOG.

## Ce que j'ai supposé

1. **Trou 3 : « Seules les séances saisies entrent dans A. » est gardée.** Le fichier dit que le paragraphe remplace « les deux phrases » sur les trois boutons, « les autres phrases restent ». La seconde phrase d'avant commençait par ce fait (« Seules les séances saisies entrent dans A : tant que la barre dit « Séance non saisie », … »), que le paragraphe neuf ne dit pas, et que l'audit du 15 oct. verrouille. J'ai gardé sa première moitié, mot pour mot, devant « Une absence motivée… » ; la seconde moitié (le bouton) part. Ce ne sont pas des mots neufs. Si Cowork lisait « la phrase entière », une ligne la retire.
2. **Standards : le gras du fichier n'est pas repris**, sauf le titre « PAN – Standards. » comme dans les trois autres familles : le fichier dit « Changements en gras », c'est un marquage de relecture.
3. **Les apostrophes du fichier sont gardées** (« d'orthopédagogie ») ; l'écran a l'apostrophe typographique. La sentinelle les tient pour égales, comme l'espace insécable.
4. **Les pourcentages des entrées neuves prennent l'insécable** (« 40&nbsp;% »), règle de #1137, dont le banc rougissait.
5. Trou 3 : le paragraphe neuf est un paragraphe à lui ; « Une absence motivée… » garde le sien.

## Les tests

- **Neuve** : `tests/unit/sentinelle-aide-2026-10-28-lot-4.test.js` (4 essais) — chaque texte lu dans le fichier TEXTES paraît dans son entrée (le trou 2 : les cinq paragraphes, dans l'ordre, et rien d'autre ; le texte Standards du 28 absent) ; les entrées neuves à leur place ; chaque libellé cité entre « » (plus de 30) à l'écran hors de l'Aide ou dans `js/`, les quatre composés lus dans leurs morceaux. **Break-tests**, arbre restauré par sha256 : « provisoire » → « temporaire » dans `rencontres` → rouge ; le texte Standards du 28 remis → rouge ; « + Nouvelle rencontre » renommé dans `js/interventions.js` → rouge (le bouton seul reste vert, à juste titre : l'aide de l'écran vide le cite encore).
- **Neuf** : `tests/integration/aide-lot-4-1152.spec.js` — la recherche trouve « orthopédagogie » (Suivi, `rencontres`) et « table de correspondance » (Codex et archives, `ce-qui-sort`). Break-test : « table de correspondance » retiré → rouge (0 au lieu de 1).
- **Essai E** du banc Standards (la phrase lue), ci-dessus.
- **Suivent par décision**, en citant la consigne : la forme (61 entrées → 64, les trois neuves), 2b (Conception), 2c bis (Suivi), 2d (Codex et archives ; « commence **plutôt** par »), et l'audit du 15 oct. (« Séance non saisie » n'est plus dans l'Aide ; le fait qu'il verrouille, si — supposition 1).

## Hors du lot

- Tes modifications non commitées de l'accueil (`js/accueil.js`, `styles.css`, leur sentinelle) et les deux icônes : intactes, hors des commits. Vitest a tourné sur l'arbre qui les contient.
