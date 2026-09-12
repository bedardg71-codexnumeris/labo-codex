# Mesure — le dénominateur de l'assiduité : ce que le lot 3 coûte vraiment

> **Date** : 12 septembre 2026, 11 h 15 (Toronto) · **Par** : Cowork, sur le dépôt Monitorage_v6 (lecture seule, `grep` et lecture de `js/`)
> **Question éprouvée** : celle laissée ouverte le 11 septembre au § 3 de « la séance comme unité de temps », marquée **[INFÉRÉ]** :
> *« la mesure ne prouve pas que les 22 lecteurs tolèrent tous un calendrier différent d'un élève à l'autre, et c'est le point à éprouver avant de promettre. »*
> **Réponse courte** : **la question ne se pose pas** — il ne faut pas un calendrier par élève. Le vrai point est ailleurs, il est
> beaucoup plus étroit, et il est déjà en double.
> Marques : [VÉRIFIÉ] lu dans le code, avec sa référence · [INFÉRÉ] cohérent, non prouvé.

---

## 1. Le calendrier est stocké par GROUPE-COURS, jamais par élève [VÉRIFIÉ]

`cleSeancesCompletes(coursId, groupeCoursId)` (`js/horaire.js`) rend `seancesCompletes_gc_<id du groupe-cours>`, avec repli sur
`seancesCompletes_<coursId>` puis sur la clé namespacée par trimestre. **Aucune variante par élève n'existe, et aucun lecteur n'en demande.**

⮕ Une source « rendez-vous » produirait donc **un seul calendrier pour le service** — l'union des dates de ses rencontres —
exactement comme un horaire produit un calendrier pour un groupe-cours. **Les 22 lecteurs ne voient aucune différence de forme.**
La question du 11 septembre portait sur un besoin qui n'existe pas.

## 2. La forme attendue est compatible avec une rencontre [VÉRIFIÉ]

`genererSeancesCompletes` (`js/horaire.js`) écrit `seancesCompletes[date] = [ { id, seanceHoraireId, nom, groupe, date, jour,
debut, fin, duree, nombrePeriodes, local, numeroSemaine } ]`. Une rencontre porte déjà `date`, `heure` et `duree`
(`js/interventions.js`, ≈ l. 180-205).

⚠ **Un champ n'a pas d'équivalent : `nombrePeriodes`**, et ce n'est pas un détail — c'est **la donnée saisie qui sert de
dénominateur** (`obtenirNombrePeriodesSeance`, `js/saisie-presences.js` ; #540 lot E2 : « le nombre de périodes est une donnée
SAISIE, il se lit — il ne se déduit plus des heures »). ⮕ **Combien vaut une rencontre de 50 ou 60 minutes ?** C'est une décision,
pas une mesure.

## 3. LE VRAI POINT : le dénominateur n'est pas le calendrier, c'est son intersection [VÉRIFIÉ]

`calculerAssiduite` (`js/indices.js`, ≈ l. 147-175) ne compte pas les dates du calendrier. Il compte :

> les dates du calendrier **≤ aujourd'hui** **ET** présentes dans `construireDatesSaisiesGroupe(da, presences)`.

Et `construireDatesSaisiesGroupe` (`js/indices.js`, ≈ l. 110) construit l'ensemble des dates où **un élève du même GROUPE que lui**
a une présence saisie — pas où lui en a une.

**Conséquence chez l'orthopédagogue, et elle est fausse** : depuis `1.135.1`, tous les élèves d'un service partagent le même numéro
de groupe (`00001` — « dans un service, un élève appartient par son service »). Leur « groupe » est donc le service entier. Un élève
vu **3 fois** sur un service qui a tenu **12 rendez-vous** toutes personnes confondues verrait son assiduité calculée **3 / 12 = 25 %**.

⮕ **Alimenter le calendrier avec les dates des rencontres ne suffit pas.** Sans un second geste, le lot 3 livrerait un chiffre faux —
et un chiffre faux est pire qu'un écran vide (l'état actuel affiche 0 %, mesuré le 12 sept. : `periodesOffertes` vaut 0, donc `0 %`).

## 4. Ce second geste est étroit — mais il est DÉJÀ EN DOUBLE [VÉRIFIÉ]

Le même dénominateur est reconstruit à **deux endroits**, par deux codes distincts :

| site | ce qu'il fait |
|---|---|
| `js/indices.js` ≈ l. 110 | `construireDatesSaisiesGroupe(da, presences)` — la fonction nommée, canonique |
| `js/profil-etudiant-sections-affichage.js` ≈ l. 1665 | **recopie le motif à la main** : un `Set` de DA du groupe, puis `presences.forEach` |

⛔ **À unifier AVANT de toucher au calcul.** Corriger l'un sans l'autre produit deux taux d'assiduité différents pour le même élève,
selon l'écran qui le regarde. C'est la même famille d'erreur que la fonction sans appelant du 12 septembre au matin : le motif recopié
survit à la correction de l'original.

## 5. Ce que la mesure change du cadrage du 11

| Ce que le cadrage annonçait | Ce que la mesure établit |
|---|---|
| « Le lot le plus lourd ; à éprouver sur les 22 lecteurs avant de promettre » | **Les 22 lecteurs ne sont pas concernés** : un service a un calendrier comme un groupe-cours en a un |
| « Une source de dates par élève au lieu de la grille hebdomadaire » | **Par SERVICE, pas par élève** — et c'est ce qui rend le lot petit |
| (non vu) | Le dénominateur réel est une **intersection avec les dates du groupe**, et elle est fausse pour un service |
| (non vu) | Ce calcul est **recopié à deux endroits** ; l'unifier est le préalable |

⮕ **Le lot 3 est PETIT** : une source de dates pour le calendrier d'un service, un filtre par élève sur un service, en un point unique.
Il n'est lourd que par ce qu'il décide, pas par ce qu'il touche.

## 6. Ce qui reste, et qui n'est pas une mesure

1. **Ce qu'un rendez-vous manqué vaut** — une absence qui compte contre l'élève, ou une note pour elle seule. ⮕ Question 1 du
   document « Ce que j'aimerais savoir, une fois que tu t'en seras servie ».
2. **Combien vaut une rencontre** en périodes (§ 2). [INFÉRÉ] « 1 » est le choix qui ne ment pas : le taux devient alors
   « rendez-vous honorés / rendez-vous fixés », ce qui est exactement ce qu'elle a décrit. Non tranché.
3. ⏸ **Ce qui n'est PAS mesuré ici** : le comportement des écrans de **saisie** des présences sur un service (l'écran où elle
   cocherait). Cette mesure porte sur le CALCUL, pas sur la saisie. À faire avant d'écrire la consigne du lot 3.

---

## 7. ADDENDA, 11 h 25 — la règle de Grégoire, et l'obstacle qu'elle révèle

**Sa règle, posée à 11 h 22** : *« Puisque les rencontres sont individuelles ou par sous-groupe, l'assiduité d'un élève n'a comme
dénominateur que le rendez-vous qu'il a avec l'orthopédagogue, ou le rendez-vous que son sous-groupe a avec l'orthopédagogue.
La notion de "groupe" ici n'a pas lieu d'être. »*

**Elle est juste**, et elle simplifie encore le § 3 : il ne s'agit même pas de « filtrer par élève » un calendrier de service.
Le dénominateur d'un élève, c'est **la liste des rencontres où il était attendu**. Rien à intersecter.

⛔ **MAIS LA MESURE DIT QUE CETTE DONNÉE N'EXISTE PAS** [VÉRIFIÉ] :

- `intervention.etudiants` n'est **pas** la liste des convoqués : c'est la liste des **cases cochées** du formulaire, écrite par
  `intervention.etudiants = dasEtudiants` (`js/interventions.js` ≈ l. 229, depuis les cases de `#listeEtudiantsIntervention`).
  La même liste sert donc à **convoquer** et à **constater la présence** — le second écrit par-dessus le premier.
- Le transfert vers les présences le confirme (`js/interventions.js` ≈ l. 1583) : `estPresent = intervention.etudiants.includes(da)`,
  et une entrée d'ABSENCE n'est écrite **que si** `marquerNonParticipantsMotives` est vrai — un drapeau réservé au contexte
  « rattrapage » d'un groupe-cours (≈ l. 1435-1441), jamais posé sur un service.

⮕ **Conséquence, chez elle** : un élève convoqué qui ne se présente pas **disparaît de la rencontre**. L'application ne peut pas
distinguer *« pas convoqué ce jour-là »* de *« convoqué et absent »*. Le dénominateur que Grégoire décrit est exactement ce que la
donnée ne porte pas.

### Ce que ça change pour le lot 3

| | |
|---|---|
| Ce que le § 5 concluait | « Le lot 3 est petit : une source de dates, un filtre par élève, un point unique » |
| Ce que l'addenda établit | **Il manque une donnée au modèle** : « attendu » n'est pas « venu ». Aucun filtre ne rattrape une distinction qui n'a jamais été écrite |

⮕ Le lot 3 a donc **un préalable** : dans une rencontre, séparer **qui est attendu** (fixé à la planification) de **qui est venu**
(constaté après). C'est un geste de formulaire et un champ, pas un moteur — mais ce n'est plus « zéro structurel ».
⚠ Cela touche aussi l'enseignant (le même formulaire sert aux interventions RàI) : **à mesurer avant de promettre**, et
c'est là, cette fois, que le risque de régression se trouve.

### Ce qui reste à Grégoire

▣ **TRANCHÉ PAR GRÉGOIRE le 12 sept. à 11 h 25, À TITRE PROVISOIRE — et il l'a nommé comme tel :**
*« C'est une question qu'il faudrait adresser à l'orthopédagogue, mais pour l'instant, je crois qu'une rencontre manquée est
inscrite au dossier de l'élève. »*

⮕ **Donc : une rencontre manquée reste inscrite, et compte au dénominateur.** C'est cohérent avec ce qu'elle a écrit le 11 sept.
(« lorsqu'il s'engage dans le processus, je m'attends à sa présence et à sa ponctualité aux rendez-vous »).
⮕ **Donc le préalable du § 7 est DÛ** : sans la distinction « attendu » / « venu », cette règle est inapplicable.
⚠ **Provisoire veut dire provisoire** : la question reste posée à l'orthopédagogue (document « Ce que j'aimerais savoir… »,
question 1), et la réponse qu'elle donnera prime. Ce qui se construit d'ici là ne doit pas rendre l'autre réponse coûteuse.
