# Demande de relecture – lot 10 : les élèves et les interventions (et la correction de #590)

> Claude Code, 11 octobre 2026, 13 h 34 (mesuré par `date`). Consignes : `plans de travail/CONSIGNE-DU-JOUR.md`, verdict du lot 9 (13 h 21) et enchaînement des lots 10 à 13 (13 h 32).
> Sur `main`, **non poussé, pas de release, pas de verdict Playwright** (règle 7). Vitest complet vert après chaque commit de code (721 fichiers, 8 580 essais au dernier passage complet ; le harnais #381/382 a gagné 3 essais depuis).

## 0 · La correction de #590 (`b5774567`)

**Le remède proposé n'a pas été appliqué tel quel, et voici pourquoi.** Retirer `config.echelle` de la copie fait refuser la sauvegarde d'une pratique standards : `PratiqueConfigurable` exige `config.echelle` quand la méthode passe par les niveaux (`pratique-configurable.js:54`, « Champ obligatoire manquant : echelle »). « Dupliquer » aurait échoué sur ces pratiques.

Le remède est à la **lecture** : `construireConfigComplete` ne tient plus une échelle embarquée marquée `introuvable` pour une résolution ; il retombe sur la référence (`configuration.echelleId` ou `config.echelleId`). La copie garde la marque en base (la validation passe, puisque `niveaux: []` existe) et se résout dès que l'échelle revient. Ce remède couvre aussi tout autre chemin qui enregistrerait une config résolue.

Sentinelle : essai F de `sentinelle-590-un-identifiant-une-echelle`, avec les vrais modules (`pratique-configurable.js`, `pratique-registre.js`, `pratiques.js`) et la vraie validation de sauvegarde. Le test duplique pendant l'absence de l'échelle, puis la fait revenir. Une mutation rouge (retrait de la ligne). Une seconde mutation (le repli sur `echelle_id` de la marque) survivait : ce repli était redondant, je l'ai **retiré** plutôt que gardé.

**Correction après le verdict de Cowork (15 h 17)** : le repli n'était pas redondant (forme `.config` de #712, copie sans autre référence). Remis ; essai G sur la forme `.config`, la mutation qui survivait rougit maintenant par son assertion (« la copie doit se charger pendant l'absence de l'échelle ») ; Vitest complet vert, 8 586 essais.

#634 : le relevé 7 / 3 est écrit dans la fiche, sans correction.

## 1 · Ce qui change pour l'usager

- Cadre › Trimestre, fiche d'un élève : un sélecteur « Mesure d'aide » (Non / Oui) à côté de SA, enregistré comme les autres champs (#792).
- Une pratique dupliquée pendant que son échelle était introuvable retrouve cette échelle quand elle revient (#590).
- Rien de visible pour #554 (voir plus bas).

## 2 · Fiche par fiche

| Fiche | Commit | Remesure sur main | Geste ou disposition |
|---|---|---|---|
| #554 | `4c0685d4` | seul appelant vivant : `tableau-bord-apercu.js`, qui écarte les exclus et ne lit que `.pattern` | statut de la fiche (`obtenirEtudiantsCoursActif`) passé à `interpreterMobilisation` ; sentinelle neuve (harnais #731), 1 mutation rouge ; essai D6 du banc du 5 sept. retourné (il verrouillait le défaut) |
| #792 | `00d4c464` | `caf` lu par le profil, aucun écrivain vivant | sélecteur posé et relu à l'édition ; 3 mutations rouges, chacune par l'assertion visée |
| #838 | — | **non faite** | coupée, voir § 3 |
| #548 | — | **non faite** | coupée, voir § 3 |
| #854 | — | **non faite** | coupée, voir § 3 |

**La trouvaille 4 du rapport du nuage est mesurée : `js/groupe.js` est mort en entier.** Aucun de ses éléments cibles n'existe dans `index.html`, et `initialiserModuleGroupe` sort dès sa première ligne. Ses deux noms appelés ailleurs ne le sont pas vraiment : `afficherPrevisualisation` est un homonyme privé de `partage-import.js`, et `mettreAJourStatistiquesGroupes` n'a aucun élément à remplir. C'était le seul écrivain de `caf`. Je l'ai versé au lot 12 (#469). `sentinelle-790` lit son texte et devra suivre.

## 3 · Ce que je n'ai pas tranché – trois fiches laissées telles quelles

**#838 – un élève déjà inscrit à un cours n'entre pas dans le service.** Le modèle tient une fiche par DA et par trimestre. La règle L-8 (`trimestre-v2-etudiants.js` ≈ 743) refuse une deuxième fiche au même DA, parce que tout le code retrouve un élève par son DA. L'appartenance au service se conclut sur le `coursId` unique de la fiche. Ajouter l'élève, c'est lui donner plusieurs inscriptions lues par le goulot `obtenirEtudiantsCoursActif`. C'est un changement du modèle d'identité, et les présences (DA + date) du cours et du service se croiseraient. C'est la question « un élève une fois par trimestre, avec ses inscriptions » de la fiche. **À cadrer** : faut-il un chantier de modèle, et quand ?

**#548 – marquer le trimestre sur chaque nouvelle production.** Le changement touche 12 écritures directes de `<trimestre>_productions` dans 5 fichiers, plus les chemins de copie : bibliothèque inter-trimestres, import, codex, partage, Réserve, copie de trimestre. Le risque : une copie qui garde la marque de sa source serait jugée étrangère par la garde. Deux productions importées dans un trimestre vide feraient alors **refuser l'écriture** : c'est le blocage de `b598fb5a`, sur des données réelles, à la veille de la cohorte. Une forme sûre existe : la marque est posée par les créations ET réécrite par chaque chemin de copie, avec une sentinelle qui recense les écrivains. Elle demande un lot à elle seule. **À décider** : un lot dédié, ou l'inertie acceptée (l'option d'origine de la fiche).

**#854 – le formulaire de gestion écrit les jetons là où le calcul les lit.** Croisé avec #938, les deux chemins ne s'accordent pas sans une décision :
- l'assistant tient **deux** nombres (jetons délai, jetons reprise, forme imbriquée), alors que le formulaire n'en tient **qu'un** (`nombre`, forme plate) ;
- l'assistant reconstruit `configuration.jetons` en entier, et perdrait l'originale et la reprise ciblée que le formulaire y écrirait.

Deux issues possibles : un second champ au formulaire (des mots d'écran neufs, donc une décision de Grégoire), ou un nombre unique qui écrase les deux nombres de l'assistant (une valeur réglée qui change sans un mot). Aujourd'hui (#853), chaque emplacement a un seul éditeur, et le formulaire le dit : l'état est cohérent.

## 4 · Mots d'écran

Aucun neuf. « Mesure d'aide » est le libellé de #790. Le sélecteur n'a pas d'infobulle : celle de SA (`reglages-etudiants-sa`) n'a pas d'équivalent pour la mesure d'aide, et en écrire une serait un mot neuf.

## 5 · Ce que j'ai supposé – une ligne chacune

- #590 : la marque `introuvable` reste stockée dans la copie. C'est voulu, la validation de sauvegarde l'exige.
- #554 : le statut se lit sur la fiche du **groupe-cours actif**, et non sur toutes les fiches du trimestre (même goulot que la Liste).
- #554 : seul « décrochage » rend la cible « Décrochage » ; « inactif » et « abandon » ne la rendent pas (règle d'`interpreterMobilisation`, inchangée).
- #792 : un nouvel élève reçoit `caf: ''`, comme `sa: ''`.

## 6 · Item de Nouvelles proposé

« Dans la fiche d'un élève (Cadre › Trimestre), la mesure d'aide se coche maintenant à côté de SA : elle n'entrait jusqu'ici que par un ancien import. »
