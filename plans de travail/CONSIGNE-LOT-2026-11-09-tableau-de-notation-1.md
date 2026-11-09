# Consigne : lot « Le tableau de notation, 1 : des résultats sans grille » (9 nov. 2026)

**Écrite par Cowork le 9 nov. 2026 vers 13 h (heure de Montréal).** `main` : `6c8dd5bc5`, release 1.239.0. Plan : `plans de travail/PLAN-2026-11-09-tableau-de-notation.md`. Ébauches : `plans de travail/EBAUCHE-2026-11-09-tableau-standards.dc.html` et `EBAUCHE-2026-11-09-tableau-specifications.dc.html` (leur logique de démonstration dit ce que la note doit faire ; leur style dit l'intention, `design-system.html` fait foi).

**Session du cloud**, branche `lot/tableau-de-notation-1`, partie d'`origin/main` à jour. Les règles communes de `plans de travail/NUIT-2026-11-08-TRAVAIL-DANS-LE-CLOUD.md` s'appliquent telles quelles (pas de `main`, pas de release, ni BACKLOG ni OU-EN-EST-ON, WebKit absent, données réelles absentes, personne ne répond : tu écris tes questions au rapport et tu continues). Ce fichier se commite avec le lot.

## Le besoin (ses mots, CoP du 9 nov.)

Des enseignants veulent gérer leur pratique alternative de notation (PAN) sans monter grille, critères, échelle et productions dans Labo Codex : ils évaluent ailleurs (papier, Moodle, une grille Word) et il leur manque l'outil qui tient le fil entre ces résultats et la note chiffrée qu'exige le règlement en fin de trimestre. « Ce qui est important, c'est de récupérer ce qui se fait déjà dans Labo Codex et de le simplifier. » Le chemin complet ne change pas : on découple, on n'empile pas.

## Les décisions de Grégoire (9 nov.)

1. **Un tableau** : étudiant·es en lignes, productions en colonnes, la note de chaque étudiant·e dans la dernière colonne. Pas le formulaire d'évaluation un élève à la fois.
2. **Ce qu'on saisit suit la pratique.** Standards : un niveau de l'échelle. Spécifications : acceptable ou non acceptable. **Pas de pourcentage.**
3. **Les réglages de la pratique restent la seule règle**, appliquée à tous de la même façon (meilleures, plus récentes, mélange, toutes, obligatoires, terminale). Aucun réglage neuf dans le tableau : il les résume et renvoie à la fiche.
4. **En standards, pas de « moyenne »** dans les mots de l'écran (principe du 8 nov.) : les productions retenues sont choisies comme représentatives de la compétence ; la note se construit ensuite.

## Ce que Cowork a lu au code (9 nov., à reprendre avant de coder)

- **Le verrou** : `sauvegarderEvaluation` refuse sans grille (`js/evaluation-sauvegarde.js`, vers 404-408 : « Sélectionne un·e étudiant·e, une production et une grille avant de verrouiller. »). L'objet écrit : `_construireObjetEvaluationSauv` (vers 254-276).
- **Les calculs lisent la note de l'évaluation, pas la grille.** Standards : `calculerPerformance` (`js/pratiques/pratique-pan-standards.js`, vers 126-230) filtre le pool, trie par `noteRetenueParLeCalcul`, retient N, agrège avec la terminale. Spécifications : une production est acceptable si `evaluation.noteFinale >= seuil` (`js/pratiques/pratique-pan-specifications.js`, vers 807-809).
- **L'échelle de départ** : `ECHELLE_IDME_DEPART` (`js/echelles.js`, vers 94-140 et 385), semée dans chaque trimestre ; valeurs ponctuelles PS 0, I 40, D 65, M 75, E 100 (`valeurCalcul`).
- **L'export** : `js/export-resultats-finaux.js`, `ENTETES_SYNTHESE` (onze colonnes), statut « provisoire », « final », « non constructible ». Il passe par `simulerIndices` : il doit suivre sans changement.
- **Les lecteurs d'évaluations** : `git grep -l grilleId -- 'js/*.js' 'js/**/*.js'` rend une cinquantaine de fichiers. Ceux qui lisent une évaluation (pas une grille) doivent tolérer une évaluation sans grille : au moins `liste-evaluations.js`, `evaluation-chargement.js`, `export-pdf.js`, `synthese-retroaction-data.js`, `profil-etudiant-*.js`, `registre-longitudinal.js`, `entites/signalement-depistage.js`, `graphiques-progression.js`, `import-export.js`, `codex-data.js`. À mesurer, pas à supposer.

## Ce que tu livres

1. **Un résultat sans grille.** Une évaluation qui porte un niveau (standards) ou un verdict acceptable / non acceptable (spécifications), sans grille ni critères, et que les calculs des deux pratiques lisent comme les autres.
2. **Le tableau**, dans **Évaluation › Liste**, comme une seconde vue des mêmes évaluations (« Liste » / « Tableau ») : aucune entrée de navigation neuve, donc rien dans `js/config.js` ni `js/navigation.js` (zones protégées).
   - Lignes : les étudiant·es du groupe-cours actif. Colonnes : les productions de son cours assignées à ce groupe (`obtenirEcheanceEffective(...).assignee`), dans l'ordre des productions.
   - Une case vide se remplit d'un toucher (standards : vide → niveaux de l'échelle → vide ; spécifications : vide → acceptable → non acceptable → vide). Chaque geste s'enregistre.
   - **Une case qui porte une évaluation faite avec une grille s'affiche (son niveau, ou acceptable / non) mais ne se modifie pas au tableau** : la toucher ouvre l'évaluation, comme « Consulter » dans la liste.
   - En standards, les cases que la règle retient pour la note se distinguent de celles qu'elle ne retient pas (ébauche : plein / contour), sans dépendre de la couleur seule.
   - Dernière colonne : la note de chaque étudiant·e, celle du profil et de l'export (une seule source : `simulerIndices` ou ce que le profil lit déjà ; aucun calcul parallèle). Quand elle manque, sa cause, comme ailleurs.
   - En tête : la famille, un résumé des réglages en mots, un lien vers la fiche ; l'échelle et ses valeurs en standards ; les forfaits en spécifications. Le bouton « Exporter la synthèse (CSV) » existant, repris tel quel.
3. **Les deux pratiques seulement.** Sommative et dénotation : la vue « Tableau » n'est pas offerte (un mot dit pourquoi).

## Choix techniques posés par Cowork (à contester si la mesure dit mieux)

- **La forme** : une évaluation ordinaire (`grilleId: ''`, `criteres: []`) plus un champ qui dit la saisie directe, par exemple `resultatDirect: { niveau: 'M', echelleId }` ou `{ verdict: 'acceptable' }`. Le niveau ou le verdict est la donnée ; tout chiffre en est dérivé.
- **Standards** : `noteFinale` = la `valeurCalcul` du niveau dans l'échelle retenue, écrite à l'enregistrement, pour que tous les lecteurs de `noteFinale` suivent sans changement.
- **L'échelle retenue** : celle de la production si elle en a une, sinon celle de la pratique, sinon `ECHELLE_IDME_DEPART`.
- **Spécifications** : le calcul lit le verdict avant de comparer une note au seuil ; **aucun chiffre inventé** pour dire « acceptable ». Le seuil d'acceptabilité reste lu pour les évaluations faites avec une grille. Si des lecteurs de `noteFinale` (indice P, dépistage) ne savent pas quoi faire d'un verdict, mesure-les et propose au rapport.
- **Le statut** : un résultat saisi au tableau compte comme une production remise (complétion). À vérifier contre ce que la complétion lit aujourd'hui.

## Pièges connus

- **Tarir n'est pas réparer** : rien n'écrit dans une évaluation existante. Le tableau lit les évaluations à grille, il ne les touche pas.
- **Une échelle modifiée après coup** : le niveau reste, la `noteFinale` écrite peut devenir fausse. Dis au rapport ce que tu as fait (relire à la volée, ou réécrire au changement d'échelle) et pourquoi.
- **« Exporter pour Léa » et « Dossier PDF »** ne doivent pas traiter un résultat saisi au tableau comme une rétroaction à remettre (rien à imprimer pour l'élève). Mesure ce qu'ils font et choisis le comportement le plus sobre.
- **Ouvrir un résultat sans grille dans le formulaire d'évaluation** ne doit rien casser : renvoie au tableau, ou montre-le en lecture.
- **Le codex** : un codex qui porte ces évaluations s'ouvre dans cette version ; dis au rapport ce que fait une version antérieure qui l'ouvre.
- Le DA à sept chiffres reste exigé ; aucun DA n'est inventé.

## Les mots (règle 6 : proposés au rapport, posés marqués « proposé »)

Le nom de la vue (« Tableau » proposé), la ligne de réglages, la légende, le mot quand la vue n'est pas offerte, la cause d'une note manquante si elle est neuve. Les mots des ébauches sont des propositions, pas des textes validés.

## Ce qui n'entre PAS

L'entrée allégée (groupe, liste, pratique créés en coulisse : lot 2), l'import CSV des résultats (lot 3), « + Production » depuis le tableau (lot 2), l'assistance (le neuvième parcours suit sa propre consigne, intacte), la dénotation, la sommative, tout ajustement manuel des productions retenues.

## Preuve exigée

- Vitest (depuis `tests/`) : les deux calculs avec des résultats directs seuls, puis mêlés à des évaluations à grille ; la terminale ; le plancher des forfaits ; un break-test par défense.
- Playwright (Chromium ici) : remplir des cases, voir la note changer, recharger, retrouver tout ; une case à grille ne se modifie pas ; aucun écrit dans les évaluations à grille (compte et empreinte avant / après).
- Une relecture par un agent neuf, son verdict en une ligne.
- Captures dans `Claude outputs/`.
- **À mesurer sur le Mac, au retour** (au rapport, en tête) : le verdict WebKit ; la vue « Tableau » sur un groupe réel de Grégoire, en lecture : ses évaluations s'affichent, aucune n'est écrite.

## Rapport

`plans de travail/RAPPORT-2026-11-09-tableau-de-notation-1.md`, en tête et en gestes d'utilisateur : ce qui est fait, ce qui attend Grégoire (une question par ligne, avec ta recommandation), ce que tu n'as pas pu vérifier, puis la section « À inscrire au BACKLOG ». Pousse ta branche à chaque étape importante.
