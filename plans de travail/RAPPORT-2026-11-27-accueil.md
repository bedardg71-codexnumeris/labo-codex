# Rapport : Accueil, le bandeau qui se contredit (27 novembre 2026)

Session de Claude Code dans le nuage, sur mandat de Grégoire. Branche `lot/accueil-2026-11-27`, partie de `lot/file-sans-gregoire-2026-11-27` à `951de3f89`. **Aucune fusion, aucun bump, rien au changelog.** Fiche : #1310, décidée par Grégoire le 27 nov. Fait : la condition, son essai, le jeton, la fiche. Reste : le coup d'œil à l'écran (aucun navigateur ici), puis le verdict du Mac avant toute fusion.

## Ce que la mesure a montré d'abord

**La condition d'avant** (`groupeActifAUnHoraire`, `js/transitions.js`) ne regardait que l'horaire, et seulement en partie. Elle rendait faux pour deux cas : aucun groupe-cours actif, ou un groupe retrouvé dans la liste du trimestre sans `horaireId`. Elle rendait vrai pour tout le reste, y compris trois cas où le message ment : le mode « cours, tous groupes » (pas de groupe actif), un service, et un groupe actif introuvable dans la liste. Elle ne vérifiait ni le trimestre, ni le cours, ni que l'horaire désigné existe encore, ni la pratique. Le bandeau ne paraît que dans Évaluation (`sections: ['evaluations']`), pas à l'accueil.

**Ce qu'est « une pratique » pour ce groupe.** Le pointeur `groupesCours[].pratiqueId` du groupe actif, lu par `lirePointeurPratiqueGroupeCours` (`js/modes.js`), puis désigné par `designerPratiqueActive` et résolu par `resoudrePratiqueActive` (`js/pratiques/pratique-registre.js`). Tout ce qui calcule ou écrit une note passe par cette résolution. Elle rend quatre états : « aucune » (rien d'assigné), « introuvable » (l'id ne mène à aucune pratique de la bibliothèque), « illisible » (trouvée, mais son instance ne se construit pas : le stock de #898, une « Par standards » sans échelle) et « ok ». Le bandeau exige maintenant « ok ».

⚠ **Une nuance, pas une contradiction.** Le message voisin (« Ce groupe-cours n'a pas de pratique de notation », `js/tableau-notation.js:120`) lit la désignation, pas la résolution. Il paraît donc pour « aucune » et « introuvable », pas pour « illisible ». Pour une pratique illisible, le bandeau se tait et le Tableau de notation ne dit pas qu'il manque une pratique. Rien ne se contredit, mais rien ne dit non plus ce qui manque. Je n'y ai pas touché : ce sont des mots d'écran. Disposition : **notée ici, pas inscrite au BACKLOG**, puisqu'aucun symptôme vécu ne la porte.

**Le « vu ».** La préférence `transition_num_crois_vue` (et `_demo`) vit dans `preferencesUtilisateur`. Elle est globale : ni par trimestre, ni par groupe. Elle ne passe à vrai que par le « ✕ » du bandeau. `evaluerTransitions` la lit AVANT la condition. Donc :
- quelqu'un qui a fermé le bandeau quand il mentait (horaire sans pratique) ne le reverra pas quand la pratique sera posée, ni dans un nouveau trimestre, ni pour un autre groupe ;
- quelqu'un qui ne l'a jamais fermé le voyait à chaque passage dans Évaluation. Maintenant, il ne le voit plus tant que les cinq éléments n'existent pas, puis il le voit.

**Source seulement** : aucune préférence enregistrée n'est réécrite. L'essai témoin « déjà fermé » le fixe. Je ne peux pas mesurer d'ici chez qui la préférence vaut déjà vrai : elle vit dans chaque navigateur.

## Fait

- **`js/transitions.js`** : `espaceDeTravailEstPret` remplace `groupeActifAUnHoraire`. Il exige cinq choses : le trimestre actif (`obtenirTrimestreId`) ; le groupe-cours actif, retrouvé dans la liste du trimestre ; son cours, retrouvé dans `cours` ; son horaire, retrouvé dans la liste des horaires du trimestre ; et la résolution de la note à « ok ». Lecture seule. Aucun texte ne change.
- **`tests/unit/sentinelle-1310-bandeau-espace-pret.test.js`** : 12 essais sur les vrais `modes.js`, `pratique-configurable.js`, `pratique-registre.js` et `transitions.js`.
  - Contre la condition d'avant : huit essais rouges, chacun parce que le bandeau paraissait. Les cas : sans pratique (le cas vécu), pratique supprimée, illisible, horaire disparu, cours disparu, sans trimestre, « cours, tous groupes », groupe absent. Les cas « cinq éléments », « sans horaire » et « déjà fermé » restaient verts.
  - Break-test : six mutations de la nouvelle condition, une garde retirée à chaque fois. Chacune fait rougir son essai. Le détail est dans l'en-tête du fichier.
- **`index.html`** : le jeton de `js/transitions.js` passe de `20261110b` à `20261126d`, le jour du build en ligne. Seule cette ligne change.
- **BACKLOG** : #1310 porte sa disposition et sa preuve. Elle reste ouverte jusqu'au coup d'œil à l'écran.

## Ce qui change au-delà du cas vécu (suppositions nommées)

La décision, lue à la lettre : « chacun des cinq éléments existe pour le groupe-cours actif ». Elle fait taire le bandeau dans des cas où l'ancien code le gardait exprès.
- **Mode « cours, tous groupes »** : il se tait. Il n'y a pas de groupe-cours actif, donc ni horaire, ni pointeur de pratique.
- **Service** : il se tait, sauf si le service a un horaire et tout le reste. Avant, un service le gardait toujours.
- **Démo** : une seule condition pour les deux messages (supposé : la décision parle « du bandeau »). Le groupe de la démo (`GC_DEMO`) a les cinq éléments : `HOR_DEMO`, le cours du pack, et `demo-std-litt`, qui porte son échelle. Le bandeau de la démo devrait donc paraître encore. C'est **inféré du pack, pas joué**. Dans un groupe de démo sans pratique, il se tait.

## Vérifié, et pas vérifié

- Vitest complet, depuis `tests/`, sur l'état commité : 965 fichiers, 12 491 essais verts (27 nov., conteneur).
- **Rien sous WebKit, Chromium ni Safari** : le conteneur n'a aucun navigateur. Pas vus à l'écran :
  - le cas vécu (horaire, pas de pratique : seul « Ce groupe-cours n'a pas de pratique de notation » doit rester) ;
  - le cas des cinq éléments (le bandeau doit paraître dans Évaluation, mots inchangés) ;
  - la démo (le bandeau démo doit paraître encore dans Évaluation).
- Essais Playwright relus, pas joués. Aucun n'exige que ce bandeau paraisse.
  - `vue-simple.spec.js:1616` veut un bandeau sans le mot « horaire » : il tient, puisqu'un groupe sans horaire n'a plus de bandeau du tout.
  - `transitions-ciblage-section` et `bandeau-non-modal-508` lisent les bandeaux du Suivi, pas celui-ci.
  - `tableau-de-notation-1.spec.js:632` attend ce bandeau jusqu'à 8 s, avec `.catch` : si son groupe d'essai n'a pas les cinq éléments, l'essai attend pour rien. Il sera plus lent, pas rouge.
  - Les autres retirent le bandeau par précaution.
- Le coût de la résolution : elle construit l'instance de la pratique à chaque évaluation du bandeau, seulement dans Évaluation et tant qu'il n'est pas fermé. Ce coût n'est pas mesuré sur l'iPad.
- Avant toute fusion : le verdict du Mac, comme d'habitude.
