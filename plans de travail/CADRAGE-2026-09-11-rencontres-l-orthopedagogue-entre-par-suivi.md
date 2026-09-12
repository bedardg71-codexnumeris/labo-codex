# Cadrage — « Rencontres » : l'orthopédagogue entre par l'onglet Suivi

> **Date** : 11 septembre 2026, 19 h 25 (heure de Montréal) · **Par** : Cowork · **Pour** : Grégoire, puis Claude Code
> **Statut** : entrée VALIDÉE par Grégoire à 19 h 20 (« trois questions, un cours de service visible dans Cadre ») ; lots à ordonner ; rien n'est codé.
> **Sources** (dossier `docs/orthopedagogie/` du dépôt) : les deux courriels de l'orthopédagogue (20 août, 11 sept.), les deux mesures du 11 sept. (couplage au groupe-cours ; la séance comme unité de temps), l'idée de Grégoire (l'entrée par Suivi). Dans le dépôt : `Rapports/INVENTAIRE-2026-09-11-orthopedagogie-dans-l-app-et-la-doc.md`, `Rapports/RAPPORT-depistage-etat-et-orthopedagogie-2026-08-31.md`.
> Marques : ▣ tranché par Grégoire · ⮕ recommandation de Cowork · ⚠ réserve · ⏸ remonte à Grégoire, pas encore tranché · [VÉRIFIÉ] / [INFÉRÉ].

---

## 1 · Ce que Grégoire a dit, dans ses mots, daté

- **11 sept., 18 h 45** — le but : « L'objectif ici n'est pas de concevoir un outil pour un seul individu orthopédagogue. Il s'agit d'inclure dans l'application des options que l'orthopédagogue pourra utiliser, mais que l'enseignant pourra également utiliser. On essaye d'universaliser l'application ici. »
- **11 sept., 18 h 45** — la forme : « une petite île dans l'application qui aurait son autonomie, mais qui partagerait aussi avec l'application des outils de planification, des outils de prise de notes, de suivi ».
- **11 sept., 19 h 10** — l'entrée : « la meilleure entrée pour l'orthopédagogue serait l'onglet Suivi. Nous pourrions ajouter, dans la sous-navigation, un onglet qui permettrait d'organiser ces rencontres » ; « sans nécessairement avoir à passer par l'onglet Cadre pour configurer son trimestre, ou par l'onglet Conception ».
- ▣ **11 sept., 19 h 20** — **validé** : « trois questions, un cours de service visible dans Cadre ».

## 2 · Ce que l'orthopédagogue a dit, et qui commande la forme

[VÉRIFIÉ, ses courriels] Elle n'a pas de groupes attribués : elle **constitue elle-même ses groupes** après un dépistage de début de session. Elle rencontre en **sous-groupes** (niveau 2, ~60 min/semaine) ou en **individuel** (niveau 3, ~50 min/semaine). Service **volontaire** : elle attend présence et ponctualité **aux rendez-vous**. **Pas de travaux à la maison** : ses productions sont des activités faites en rencontre. Elle observe l'application des stratégies enseignées (planification, rédaction, révision-correction), et lit l'évolution par la **réponse à l'intervention** en deux volets : l'apprentissage (en rencontre) et le **transfert** (dissertations, PFR, EUF – des données qui vivent dans les cours d'autres utilisateurs). Sa grille proposée : six critères, quatre niveaux (Excellent / Satisfaisant / À développer / Débutant). Sa difficulté avec l'app : les onglets Cours et Groupe (discipline, code de cours, compétences ministérielles).

## 3 · Ce que la mesure a trouvé, et qui rend l'entrée possible

1. [VÉRIFIÉ] **Le rendez-vous existe déjà : c'est l'intervention** (`js/interventions.js`) — date, heure, durée, type individuel / groupe / mio, élèves, observations, notes individuelles, statut, bilan. Son seul lien à la séance est une date qui sert à excuser les absents de la classe.
2. [VÉRIFIÉ] **Un seul goulot pour « mes élèves »** : `obtenirEtudiantsCoursActif()` (`js/modes.js:1169`), qui rend `[]` sans `infoCours.id`, et tolère déjà le mode cours sans groupe et l'élève sans groupe. Les outils du profil (calculs, confidentiel, rapport, affichage) ne lisent pas le groupe-cours actif ; le volet confidentiel et le rapport ne lisent aucun contexte.
3. [VÉRIFIÉ] **Les données sont rangées par trimestre** (`cle()`, `js/trimestres.js:349`), pas par groupe : un élève existe une fois par trimestre, quel que soit le contexte qui le regarde.
4. [VÉRIFIÉ] **Le mur : la présence se compte sur le calendrier engendré par l'horaire hebdomadaire** (`genererSeancesCompletes`, `js/horaire.js:570`), lu dans 22 fichiers. Une présence est indexée par date (bonne nouvelle) ; le dénominateur de l'indice A vient de ce calendrier.
5. [VÉRIFIÉ] **Huit sites recalculent l'identifiant du contexte** (`infoCours._groupeCoursId || infoCours.id`) au lieu d'un point unique ; et une intervention **ne sait pas dans quel contexte elle est née** (`coursId` 1 occurrence, `groupeCoursId` 0).
6. [VÉRIFIÉ] « Planification » dans le code = la carte de cours ; « journal » = journal de bord d'une évaluation. Il n'y a pas d'agenda ni de journal par élève à récupérer ; les notes par élève sont celles du volet confidentiel et des interventions.

## 4 · La décision, et ce qu'elle exclut

▣ **Entrée par Suivi. Un sous-onglet nouveau, « Rencontres » (▣ 19 h 35), dont l'objet est l'intervention.** À la première ouverture, **trois questions** — les dates de son trimestre, le nom de son service, sa liste d'élèves — et l'application crée en coulisse ce que le magasin exige : un trimestre, et **un « cours de service » sans code, sans discipline, sans compétences ministérielles, que Cadre affiche tel quel**. Pas d'état invisible.

Ce que ça exclut, par la règle du 27 août (aucun contexte codé en dur) et par la mesure : une **île** avec son propre magasin (second chemin de données à maintenir) ; un contournement de Cadre (Suivi rend une liste vide sans cours) ; un module « orthopédagogie » nommé ainsi dans le code (le même sous-onglet sert à l'enseignant qui suit cinq élèves hors classe).

## 5 · Ce que ça suppose, tranché par Cowork (technique, mesurable)

⮕ (a) Un **troisième cas** dans `obtenirEtudiantsCoursActif()` : le cours de service rend sa liste constituée à la main. (b) **Un point unique** pour l'identifiant du contexte, en remplacement des huit sites. (c) **L'intervention porte son contexte de naissance** (nécessaire aussi hors orthopédagogie : constat de l'audit du 5 sept.). (d) Le cours de service est un enregistrement de `cours` ordinaire avec un marqueur de nature, pas un type à part : tout ce qui lit `cours` continue de marcher. ⚠ Chacun de ces quatre points se prouve par une sentinelle et un harnais AVANT/APRÈS sur les groupes réels de Grégoire : **zéro pixel ne bouge pour l'enseignant.**

## 6 · Les lots, en gestes d'utilisateur (ordre proposé, ⏸ à confirmer)

| # | Ce qu'elle (ou lui) pourra faire | Ce que ça touche | Ce qui se voit à l'écran |
|---|---|---|---|
| 1 | Ouvrir « Rencontres », répondre aux trois questions, voir sa liste apparaître dans Suivi | Cadre (trimestre, cours de service), (a), (b), (d) | Cadre montre le service ; Suivi › Liste montre ses élèves ; aucun changement pour un groupe-cours ordinaire |
| 2 | Créer une rencontre (individuelle ou sous-groupe), y prendre des notes, la clore avec un bilan — et ne voir que les rencontres de ce service | Interventions, (c) | La liste des rencontres ne mêle pas celles du cours de l'enseignant |
| 3 | Noter la présence aux rendez-vous et lire une assiduité qui a du sens | Présences, calendrier (§ 3-4) | ⚠ Le lot le plus lourd ; à éprouver sur les 22 lecteurs avant de promettre |
| 4 | Évaluer une activité faite en rencontre avec sa grille | Conception (sa grille offerte comme **modèle** de la bibliothèque, pas comme défaut ; échelle à quatre niveaux), Évaluation | ⏸ Ce que devient la remise / la complétion chez elle (§ 7). ▣ Vérifié le 11 sept., 19 h 50 : son « nombre d'erreurs repérées / total » est un critère **algorithmique** (type existant du gabarit, `js/grilles.js`), version chiffrée de son critère « Repérage des erreurs » ; ⮕ ajouter au registre `js/evaluation-formules.js` une quatrième formule « taux de repérage » (repérées ÷ total) — extension en valeurs, tranchée par Cowork |
| 5 | Lire le profil, le volet confidentiel et le rapport de chacun de ses élèves | rien : ils ne lisent aucun contexte | déjà là, à vérifier au coup d'œil |

## 7 · Ce qui remonte à Grégoire (didactique, mots, données réelles)

- ▣ **Les mots, tranchés par Grégoire le 11 sept. à 19 h 35** : le sous-onglet « Rencontres » ; l'entité « rencontre » à l'écran (dans le code, elle reste l'intervention) ; dans Cadre, le cours de service s'appelle « Service », pas « Cours ».
- ⏸ **La remise et la complétion** : ses productions se font en rencontre ; l'indice C n'a pas de sens chez elle. Le retirer, le laisser à 100 %, ou lui donner un autre sens ?
- ⏸ **La présence aux rendez-vous** : que devient l'indice A ; un rendez-vous manqué vaut-il une absence ?
- ⏸ **Le transfert** : ses données de transfert vivent chez l'enseignant. Saisie à la main dans le dossier, ou pont entre utilisateurs plus tard ? (Question posée le 11 sept. ; réponse : universaliser d'abord, le pont n'est pas dans ce cadrage.)
- ⏸ **Les sous-groupes récurrents** : elle rencontre « des sous-groupes de besoins homogènes », les mêmes élèves chaque semaine. Une rencontre porte sa liste d'élèves ; faut-il pouvoir **nommer** un sous-groupe pour ne pas le recomposer à chaque rencontre ?
- ⏸ **La vue de sa semaine** : ses élèves ont des horaires différents, et il n'existe aucun agenda dans l'application (« planification » = la carte de cours). Une liste de rencontres datées suffit-elle, ou lui faut-il une vue par semaine ?
  ⮕ **Idée de Grégoire (12 sept., 20 h 06 la veille) + mesure de Cowork** : réutiliser la **vue calendrier** (`js/calendrier-vue.js`, 648 l.). [VÉRIFIÉ] Elle dessine le mois depuis le cadre du trimestre (congés, reprises, semaines d'examens et de planification — réutilisable tel quel pour un service), marque les jours de cours depuis l'horaire hebdomadaire (rien à marquer sans horaire : correct), et **superpose déjà une seconde couche d'événements par date** : le badge des échéances de productions du groupe-cours actif (`construireMapEcheancesProductions`, l. 218, le point bleu). ⮕ **La vue par mois des rendez-vous = une carte « interventions par date » rendue par le même mécanisme de badge, plus, au clic sur un jour, la liste des rencontres de ce jour avec leur heure.** Petit lot, pas un agenda neuf. Ce qui n'existe pas : une grille horaire par semaine ou par jour (l'intervention porte `heure` et `duree`, la donnée est là, la vue non). **Pas pour lundi** : candidat de la semaine suivante, après ses premiers retours.
- ⏸ **Le dépistage sur sa liste** : sa liste *est* le résultat d'un dépistage ; la carte RàI d'un élève de son service doit-elle s'afficher ?

▣ **Tranché par Grégoire le 12 sept. à 21 h 02, après la livraison des lots 1-2** : « Rencontres » ne liste que les services ; sur un groupe-cours ordinaire, seulement la porte « Créer un service ». La fusion Interventions / Rencontres se rejuge après le mois d'usage.

## 8 · Hors périmètre

Les bornes et les noms de zones du dépistage (`#821`, `#822`) ; le pont de données entre utilisateurs (transfert) ; toute refonte des onglets Cadre / Conception ; les vingt règles de l'audit 3.

## 9 · Ce qui se fait avant tout code

Trancher § 7, point « mots » (dix secondes) ; ordonner les lots du § 6 ; écrire la consigne du jour du lot 1, avec sa porte terrain : ce que Grégoire verra sur ses vraies données (Cadre affichant un service, Suivi affichant une liste sans horaire) et ce qu'il ne verra pas (rien ne bouge sur ses deux groupes).
