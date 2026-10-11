# Demande de relecture – lot 6 : les nombres qui disent faux

> Claude Code, 11 octobre 2026, 8 h 15 (mesuré par `date`). Consigne : `plans de travail/CONSIGNE-DU-JOUR.md` (Cowork, 6 h 58, et ajout de 8 h 04).
> Commits locaux sur `main`, **non poussés, pas de release** : `03d24786` (« Appuie sur », décision de Grégoire), `705a4750` (#726), `f31a6643` (#728, commentaire seul), `2deb4e8a` (#925), puis un commit de documentation. **#727 : rien changé**, la question revient à Grégoire (§ 4).

## 1 · Ce qui change pour l'usager

- La fenêtre « Ton codex est prêt » dit « Appuie sur « Enregistrer » pour choisir où le ranger. » (décision de Grégoire, 8 h 04). Seul ce mot change.
- Dans le suivi hebdomadaire, le taux de remise du dernier travail d'un groupe ne dépasse plus 100 % : il ne compte que les élèves actifs du groupe, chacun une fois (#726).
- Dans le Cadre, l'étape 3 d'un groupe-cours affiche le nombre d'élèves **du cours choisi** à côté de chaque numéro de groupe, au lieu de la somme de tous les cours qui portent ce numéro (#925).

**Aucun autre mot d'écran** n'est changé ni ajouté.

## 2 · La mesure, avant/après, sur le pack démo

| Fiche | Ce qui est mesuré | Avant | Après |
|---|---|---|---|
| #726 | C global des 30 relevés reconstruits (`reconstruireSnapshotsHistoriques`, vrai code, WebKit) | max 100 % | identiques, relevé par relevé |
| #727 | productions formatives du pack | aucune | — |
| #925 | cours et groupes des élèves du pack | un cours, un groupe (10 élèves) | aucun compte ne change |

**Le pack démo ne montre aucun des trois défauts** : un seul groupe, aucun exclu, aucune double évaluation du dernier travail, aucun formatif, un seul cours. Les nombres qui changent se voient aux sentinelles, sur des jeux fictifs :

| Sentinelle | Cas | Avant | Après |
|---|---|---|---|
| #726 | 2 actifs, 1 remet ; + 1 élève de l'autre groupe qui remet | 100 % | 50 % |
| #726 | + 1 exclu qui remet | 100 % | 50 % |
| #726 | + 1 seconde évaluation du même élève | 100 % | 50 % |
| #726 | les trois ensemble | **200 %** | 50 % |
| #925 | « 00001 » de C1 (2 élèves) et de C2 (3 élèves), C2 choisi | 00001 (5 étud.) | 00001 (3 étud.) |

## 3 · Ce qui est fait, commit par commit

**`03d24786` – « Appuie sur ».** `js/codex.js` (`toucherFrais`), et le banc J0 bis qui cite la phrase entière (expression ancrée : l'ancienne phrase le fait rougir). Décision de Grégoire dans le message du commit.

**`705a4750` – #726.** `capturerSnapshotSeance` : le C global compte les DA du dénominateur (actifs, non exclus) qui ont une évaluation qui compte du dernier travail dû, dans un ensemble. **Stock assumé** : les relevés déjà capturés gardent leur nombre ; un relevé recapturé ou une reconstruction suit la nouvelle règle.

**`f31a6643` – #728, commentaire seul.** Le constat de la fiche ne tient pas : le seul écrivain d'une présence facultative (`interventions.js`) range dans `heures` la « Durée (périodes) » de son formulaire, et `ajouterPresencesIntervention` la garde telle quelle. Le lecteur d'`indices.js` a raison de ne pas convertir ; convertir comme le régulier gonflerait l'assiduité d'un facteur 60/50. Je l'ai écrit au lecteur (issue 3). La copie anonymisée de `trimestres.js` (`duree_cours: p.heures || …`) lit le même champ sans le convertir : rien à changer.

**`2deb4e8a` – #925.** `populerDropdownGroupesAssemblageV2` compte, pour chaque numéro, les élèves du cours du champ 2 (tous si aucun cours n'est choisi ; une fiche sans `coursId` compte partout, comme l'accepte `obtenirEtudiantsCoursActif`). L'étape 3 se repeuple au changement du champ 2 et après l'ouverture d'un groupe-cours (elle était peuplée avant que son cours soit posé). **La liste des numéros reste entière** : la crainte de la fiche (un groupe-cours ancien qui perdrait son numéro à l'édition) ne se pose donc pas. Un numéro sans élève dans le cours choisi s'affiche « (0 étud.) », forme déjà produite par le code. Le « Groupe associé » de l'horaire reste hors du lot (changement de modèle, partie horaire de la fiche).

## 4 · #727 : arrêté sur la fiche, la question revient à Grégoire

La consigne : « aligne sur ce que fait le C vivant pour les formatifs ». **Mesuré : les deux règles sont déjà les mêmes.**

- **Le C vivant** n'est pas calculé dans `indices.js` mais par la pratique active (`pratique.calculerCompletion`, appelée par `portfolio.js`). La sommative et la configurable ne retirent du compte que les productions **facultatives** : un formatif évalué y compte comme un travail. La spécification compte autrement (paliers).
- **Le C historique** (snapshots) retire les facultatifs et le conteneur portfolio : un formatif échu y compte aussi.
- **L'intention contraire** (un formatif hors de C) n'existe que dans `comptesDansDepistage` (`portfolio.js`, « Ne compte PAS : *-formatif »), une fonction **sans aucun appelant**.

Donc « aligner » ne change rien, et je n'ai rien changé. La fiche suppose que compter un formatif est une faute ; le code vivant fait le contraire. **Question pour Grégoire, par Cowork** : un travail formatif doit-il compter comme un travail dû dans l'indice C (vivant et historique) ? Si non, les deux C changent ensemble, avec une mesure sur ses données (lecture seule).

## 5 · Les bancs, et ce qu'ils peuvent faire rougir

| Banc | Essais | Break-test |
|---|---|---|
| `sentinelle-726-c-global-snapshot-borne` (Vitest) | 5 | code d'avant → 4 rouges (100, 100, 100, 200 au lieu de 50) ; filtre du groupe retiré → 3 rouges ; comptage par évaluation au lieu d'élève → 2 rouges |
| `sentinelle-925-etape-3-compte-par-cours` (Vitest) | 7 | code d'avant → 4 rouges ; filtre par cours retiré → 2 ; fiches sans coursId exclues → 1 ; repeuplement à l'ouverture retiré → 1 ; repeuplement sur tout champ → 1 |
| `lot-j0-bis-partage-apres-preparation`, `codex-995-…` (WebKit) | 5 | phrase lue entière, ancrée |

Bancs voisins verts : #872, lot E2 du groupe-cours, #834 (56 essais). Vitest complet, depuis `tests/` : 709 fichiers, 8 504 essais verts, aucune erreur hors essais.

## 6 · Trouvailles

| Trouvaille | Issue |
|---|---|
| `comptesDansDepistage` (`portfolio.js`) n'a aucun appelant | **Inscrire et continuer** : liée à la question du § 4 ; si Grégoire tranche « les formatifs comptent », elle se retire (code mort) ; sinon elle sert de règle |
| Le C global d'un relevé rend `NaN` si le groupe n'a aucun élève actif (0 / 0), avant comme après | **Commenter et oublier** : aucun relevé n'est capturé pour un groupe vide en pratique ; non mesuré à l'écran |

## 7 · Proposition d'une seule entrée de Nouvelles pour les lots 5 et 6

Couleur : **orange** (corrections). À trancher par Grégoire, par Cowork.

- **Titre** : « Moins de mémoire, des comptes justes »
- **Ligne** : « Exporter une sélection et ouvrir une archive ne chargent plus tout le fichier en mémoire, ce qui ménage l'iPad&nbsp;; sous Chrome, une mise à jour du codex longue à préparer demande un clic au lieu d'échouer&nbsp;; le taux de remise d'un groupe ne dépasse plus 100&nbsp;%, et l'étape 3 d'un groupe-cours compte les élèves du seul cours choisi. »

## 8 · La suite

Après ce verdict : une seule release mineure pour les lots 5 et 6 (`release.mjs`, Nouvelles posées telles que retenues), puis **un seul** verdict Playwright complet sur le commit de release, Chrome, Safari et Cowork fermés, Mac sur secteur ; push seulement si vert. Si le verdict rougit, les commits séparés disent quel lot.
