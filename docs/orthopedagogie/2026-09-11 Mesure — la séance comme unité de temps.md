# Mesure — la séance comme unité de temps : ce qui bloque un suivi par rendez-vous

> **Date** : 11 septembre 2026, soir · **Par** : Cowork, sur le dépôt Monitorage_v6 (lecture seule, `grep` sur `js/`)
> **Question** : là où l'application compte en séances de groupe, qu'est-ce qui empêche de compter en rendez-vous individuels ? Et les « outils de planification et de prise de notes » existent-ils sous une forme récupérable ?
> Marques : [VÉRIFIÉ] lu dans le code, avec sa référence · [INFÉRÉ] cohérent, non prouvé.

## 1. Les données sont rangées par trimestre, pas par groupe-cours [VÉRIFIÉ]

`cle(nomCle)` (`js/trimestres.js:349`) préfixe chaque clé par l'identifiant du **trimestre** actif. Élèves (`groupeEtudiants`), productions, évaluations, présences, interventions (`interventions.js:67, 102`) vivent donc dans un seul magasin par trimestre ; le tri par cours et par groupe se fait à la lecture, sur les champs `coursId` / `groupe` de chaque enregistrement. ⮕ Un élève existe une fois par trimestre, quel que soit le contexte qui le regarde : un contexte « liste » partage le magasin sans migration.

## 2. Le rendez-vous existe déjà, sous le nom d'« intervention » [VÉRIFIÉ]

Une intervention porte `date`, `heure`, `duree`, `type: 'individuel' | 'groupe' | 'mio'`, une liste d'élèves, des observations, des notes individuelles, un statut et un bilan (`docs/modules/depistage-et-suivi.md` § 9). Le champ `seanceConcernee` n'est **qu'une date** (`interventions.js:824`, `<input type="date">`), et il ne sert qu'à une chose : marquer « absence motivée » les non-participants pour la séance de groupe de cette date (`obtenirAbsencesMotiveesParDate`, l. 1488-1520). Hors de ce cas, l'intervention ne dépend d'aucune séance. ⮕ Structurellement, la rencontre orthopédagogique de 50 ou 60 minutes est une intervention datée ; ce qui lui manque n'est pas une entité, c'est une lecture (l'assiduité aux rendez-vous, § 3) et un contexte de naissance (mesure précédente, § 5).

## 3. Le mur : la présence se compte sur un calendrier engendré par l'horaire hebdomadaire [VÉRIFIÉ]

- Une présence est `{ date, da, … }` (`saisie-presences.js:960-985`) : indexée par **date**, pas par identifiant de séance. Bonne nouvelle : la date d'un rendez-vous est une date.
- Mais le dénominateur de l'indice A est l'ensemble des dates du **calendrier des séances** ≤ aujourd'hui dont la présence a été saisie (`profil-etudiant-sections-affichage.js:1641+`, « source de vérité : calendrier des séances »). Ce calendrier est engendré par `genererSeancesCompletes` (`horaire.js:570`) à partir de l'horaire hebdomadaire du cours, du cadre du trimestre et des journées sans cours.
- La séance est lue dans **22 fichiers** ; les gros lecteurs : `horaire.js` (38), `trimestre-v2-horaires.js` (30), `saisie-presences.js` (30), `planification-export.js` (13), `rythme.js` (9), `presences-rapport/apercu` (8 + 8), `snapshots.js` (7), `productions.js` (7), `profil-etudiant-sections-affichage.js` (5).

⮕ Pour une orthopédagogue, la question n'est pas de réécrire la saisie des présences : c'est de lui donner **une autre source de dates** que la grille hebdomadaire — les dates de ses rendez-vous, par élève. [INFÉRÉ] Si le calendrier des séances accepte une source « rendez-vous » (un calendrier par élève plutôt qu'un par groupe), la saisie, l'indice A et ses rapports suivent ; la mesure ne prouve pas que les 22 lecteurs tolèrent tous un calendrier différent d'un élève à l'autre, et c'est le point à éprouver avant de promettre.

## 4. « Outils de planification » : ce que le mot désigne dans le code [VÉRIFIÉ]

Le module `planification-*` est la **carte de cours** (nœuds et liens, `planification-carte.js`, `planification-donnees.js:359`), pas un agenda ; son export lit les séances (13 sites). Il n'y a pas d'agenda de rendez-vous. Ce qui s'en rapproche le plus est, encore, la liste des interventions (datées, avec heure et durée).

## 5. « Outils de prise de notes » : ce qui existe [VÉRIFIÉ]

- `journal.js` est le journal de bord **d'une évaluation** (`obtenirJournal(evaluationId)`), pas de l'élève.
- Les notes sur un élève vivent à trois endroits : le volet confidentiel (notes personnelles, notes de présences ; sans dépendance au contexte), les `notesIndividuelles` et `observations` d'une intervention, et les notes de présence saisies par date.
⮕ Une prise de notes par rendez-vous, c'est exactement les observations d'une intervention individuelle. Récupérable tel quel.

## 6. Ce que les deux mesures donnent ensemble

| Ce qu'elle fait | Ce que l'app a déjà | Ce qui manque |
|---|---|---|
| Constituer sa liste après dépistage | mode cours sans groupe ; « élève sans groupe : l'inclure » | un troisième contexte, sa liste (mesure 1, § 2) |
| Rencontrer en sous-groupe ou individuel, 50-60 min | l'intervention datée, typée, avec notes et bilan | qu'elle sache dans quel contexte elle est née (mesure 1, § 5) |
| Attendre présence et ponctualité aux rendez-vous | la présence par date, l'indice A | une source de dates par élève au lieu de la grille hebdomadaire (§ 3) |
| Évaluer les activités faites en rencontre | productions et évaluations rangées par trimestre, grille et échelle configurables | rien de structurel ; ses critères et son échelle sont des valeurs |
| Lire le transfert dans les cours | — | hors mesure : c'est une donnée d'un autre utilisateur |
