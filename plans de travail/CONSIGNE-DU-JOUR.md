# Consigne du jour – La date réelle de la leçon et de l'évaluation dans l'Inspecteur (#695, élargie)

> Écrite le 22 septembre 2026, 15 h 40 (Toronto), par Cowork, sur `main` = `3fc304e4` (1.154.1 commitée, push en cours par la session précédente). **Proposée** tant que Grégoire ne l'a pas relayée.
> La précédente (réassigner une copie, livrée en 1.154.0 / 1.154.1) est archivée sous `plans de travail/_ancienne-CONSIGNE-DU-JOUR-2026-09-22-reassigner-une-copie.md` (déplacée par Cowork, à commiter avec ce lot).
> **La fiche fait foi** : `BACKLOG.md`, #695 (≈ l. 1172). Cette consigne dit ce qui l'élargit et ce que Grégoire a tranché aujourd'hui.

## 0 · Conditions de départ

- `origin/main` contient `1e5d25af` (release 1.154.1) **poussé**. Sinon, arrête-toi et dis-le : la session précédente n'a pas fini.
- Aucune autre session n'écrit dans `js/`. Branche `lot-date-inspecteur` partie de `main`. Rien ne se fusionne ni ne se pousse avant la relecture de Cowork (PROTOCOLE, règle 2).
- Skill `design-interface` chargé (c'est un changement visuel), skill `alignement` pour le module.

## 1 · Ce que Grégoire a demandé (22 sept., 15 h 30, sur ses captures)

Sur sa carte, la leçon « La carte mentale » porte `S5` et `B` dans son en-tête. Il veut voir **la date réelle et précise** où elle aura lieu, **pour la leçon ET pour l'évaluation qu'elle contient**. La fiche #695 ne visait que la leçon : **elle s'élargit au bloc Évaluation.**

## 2 · Tranché par Grégoire

**Plusieurs groupes = une ligne par groupe.** Deux groupes d'un même cours n'ont pas les mêmes jours de rencontre (les séances vivent par groupe-cours : `seancesCompletes_gc_<id>`, voir le commentaire de `js/planification-export.js` ≈ l. 160). L'Inspecteur affiche donc **toutes** les dates, une par groupe du cours de la carte, sans menu ni groupe « actif ». Avec un seul groupe, une seule ligne, sans préfixe de groupe.

## 3 · Ce que Cowork a mesuré (lecture seule, 15 h 35)

- **Le calcul existe, entier, dans l'export** : `groupesCoursDuCours(coursId)`, `coursDeLaCarteActive()`, `construireHoraireDeLecons(groupeCoursId)` (≈ l. 170-227) et `dateDeLecon(horaire, semaine, rang)` (≈ l. 240), pure, qui rend `null` dans les trois cas dégradés. `construireHoraireDeLecons` et `dateDeLecon` sont exportés sur `window.planificationExport` (≈ l. 1611-1612) ; `groupesCoursDuCours` ne l'est pas.
- **Une deuxième implémentation vit dans `js/productions.js`** : `dateSeanceDuRang` (≈ l. 1222), pour la date d'échéance proposée par la carte (#930).
- **L'Inspecteur** : `js/planification-carte.js`, champ « Semaine » de la leçon ≈ l. 2849-2866 ; « Dans la leçon » ≈ l. 2881 (écouteur attaché ≈ l. 3204). Le rang : `rangSeanceDeLecon(n)` (≈ l. 649), la semaine : `semaineDeLecon(n)` (≈ l. 475).
- **La règle du code, à respecter** (≈ l. 7673, commentaire) : « Une leçon sans semaine OU sans rang n'est pas située. »

## 4 · Ce que fait le lot

**4a. Une ligne en lecture seule, étiquetée « Date », jamais un champ.** La date est une conséquence du couple (semaine, rang) et du calendrier ; la rendre modifiable créerait une troisième source de vérité (fiche #695).
- **Leçon** : sous « Semaine ».
- **Évaluation** : sous « Dans la leçon ». Sa date est celle de sa leçon parente. Une évaluation hors leçon (« — Aucune (bloc libre) ») n'a pas de date : la ligne le dit.
- **Elle suit les gestes** : changer la semaine (Inspecteur ou sélecteur de l'en-tête), le rang (`B`), ou la leçon parente d'une évaluation met la ligne à jour sans rouvrir l'Inspecteur.

**4b. Ce que la ligne dit, cas par cas** (mots proposés par Cowork ; tu peux les resserrer, pas les rendre plus vagues) :

| Cas | Texte |
|---|---|
| Un groupe, date trouvée | `Mercredi 30 septembre · séance B` |
| Plusieurs groupes | une ligne par groupe : `Gr. 01 : mercredi 30 septembre` (nom du groupe tel que l'export le montre) ; `· séance B` une seule fois, en tête ou en fin |
| Semaine posée, rang absent | `Semaine 5, séance non fixée` |
| Pas de semaine | `Leçon non planifiée` |
| Le groupe n'a pas de séance à ce rang cette semaine (congé, semaine à deux rencontres) | `Gr. 02 : pas de séance B en semaine 5` – **jamais** le jour suivant en silence |
| Cours sans groupe ou sans horaire saisi | `Aucun horaire saisi pour ce cours` |
| Carte rattachée à aucun cours | `Carte rattachée à aucun cours : pas de date` |
| Évaluation hors leçon | `Hors leçon : pas de date` |

Le jour de la semaine et le mois en toutes lettres, en français, sans l'année. **Aucune date devinée** : une date fausse dans un plan de cours se recopie (fiche #695).

**4c. Zéro-dette : aucune quatrième copie du calcul.** Réutilise `construireHoraireDeLecons` + `dateDeLecon` (exporte `groupesCoursDuCours` s'il le faut). **Décidé par Cowork (technique)** : ne pas unifier maintenant avec `dateSeanceDuRang` de `productions.js` – hors lot ; mais **mesure** si les deux rendent la même date pour le même (groupe, semaine, rang) et dis-le dans le rapport (si elles divergent, c'est une trouvaille à inscrire, issue 2 de `CLAUDE.md`).
L'horaire d'un groupe se construit **une fois par ouverture de l'Inspecteur**, pas à chaque frappe de la semaine.

**4d. Hors lot, à ne pas faire** : la grille du Planificateur, l'en-tête du bloc sur la carte, l'échéance enregistrée d'une production (champ « Production » de l'évaluation). Si une évaluation liée à une production a, dans « Productions étudiantes », une échéance enregistrée **différente** de la date affichée, ne rien afficher de plus : compte ces cas sur la carte de démonstration et dis-le dans le rapport.

## 5 · Tests

- Vitest sur la fonction qui produit les lignes : chaque rangée du tableau 4b, plus deux groupes aux jours différents qui rendent deux dates différentes pour la même leçon.
- Sentinelle : le fichier de l'Inspecteur n'a pas de calcul de date de séance à lui (pas de parcours de `obtenirSeancesCompletesDuGroupe` hors `planification-export.js` et `productions.js`) ; garde de non-vide (règle 10). Break-test : chaque assertion doit pouvoir rougir (skill `verification-adverse`).
- Suite complète verte avant le commit.

## 6 · Livraison

- Deux commits au plus : le code et ses tests ; puis `BACKLOG.md` (#695 cochée, élargissement à l'évaluation et décision « une ligne par groupe » notés) et le déplacement de l'ancienne consigne.
- Version **mineure** (nouvelle information à l'écran) par `scripts/release.mjs`, skill `release-et-changelog`. Changelog, une phrase d'utilisateur : l'Inspecteur d'une leçon et d'une évaluation donne la date où elle aura lieu, pour chaque groupe.
- Commit → relecture de Cowork → corrections → verdict → push. **Tu ne pousses pas avant le verdict.**

## 7 · Le geste que Grégoire vérifiera à l'écran

Il ouvre sa carte, double-clique « La carte mentale » (S5, B) : sous « Semaine », la date de chacun de ses groupes, qu'il compare à son calendrier. Il double-clique l'évaluation « Artefact n° 2 » : la même date sous « Dans la leçon ». Il change `B` en `A` : les deux lignes changent sans rouvrir l'Inspecteur.
