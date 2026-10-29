# Verdict de relecture – Des standards sans portfolio, lot 4 : choisir à l'écran les productions qui comptent (#1178)

> Cowork, jeudi 29 octobre 2026, 9 h 59 (Toronto, mesuré par `date`), sur `main` = `3aa0566c` (non poussé). Lu : la demande de relecture ; le diff de `1a9aa135` ; `obtenirDonneesSelonMode` (`js/modes.js`) ; `appliquerFormulaireDansCollection` (`js/pratiques-gestion.js`) ; `_simulerIndicesInterne` (`js/portfolio.js`) ; `calculerDetailsCompletion` (`js/pratiques/pratique-configurable.js`). Vitest et Playwright non rejoués.

## Verdict

**Accepté, avec une retouche (décision de Cowork).**

Ce qui tient, mesuré :

- **La liste survit aux autres réglages.** `appliquerFormulaireDansCollection` modifie `configuration` clé par clé, il ne la reconstruit pas : changer le mode de sélection n'efface pas `productionsExclues`.
- **Le Comparateur.** La note (P) d'une pratique simulée passe par `calculerDetailsNoteFinale(da, pratiqueId)`, qui lit les exclusions de cette pratique. L'indice C ne lit pas le pool (`calculerDetailsCompletion`) : rien à y suivre. Les appels sans argument (l'instance, `obtenirIdsPoolStdDuCorpus`) lisent l'active ; aucun ne fait la note du Comparateur.
- **Les quatre décisions prises seul sont retenues** : l'emplacement ; la case désactivée, sans mot ; la liste qui ne part pas au partage `.lcz` ; l'export JSON. Pour ce dernier, le motif tient : sans les productions de l'auteur sous les mêmes ids, la liste n'exclut rien chez qui reçoit.
- **Les trouvailles inscrites** : acceptées telles quelles. La phrase de l'Aide va au lot de mots (#1152 ou lot 5).

## La retouche (Claude Code) : la liste lit les productions du cours actif

**La supposition 2 du § 8 est fausse.** « Identique hors démo et hors simulation » : non. `obtenirDonneesSelonMode('productions')` filtre par le `coursId` du cours actif (`js/modes.js`, `clesAvecCoursId`) ; `db.get(cle('productions'))` rend les productions de **tout le trimestre, tous cours confondus**. Le calcul lit la première ; la liste, la seconde.

Ce qui s'ensuit pour une enseignante qui a deux cours dans le trimestre (une double préparation) :

1. La liste mêle les productions des deux cours.
2. La garde de la dernière case compte les deux cours : elle laisse décocher toutes les productions du cours actif tant qu'une production de l'autre reste cochée. Le pool du cours actif devient vide, ce que la case désactivée devait empêcher.
3. `poolStdFaitDArtefacts` est jugé sur les deux cours : un « Artefact » dans l'autre cours cache la liste, alors que le calcul du cours actif applique toujours les exclusions déjà posées, qu'on ne peut plus voir ni défaire.

C'est le lot (code écrit ce matin), pas une trouvaille : à finir.

**Ce qui est demandé.** `_etatProductionsQuiComptent` lit les productions par `obtenirDonneesSelonMode('productions')`, la source de `calculerDetailsNoteFinale`, puis le même filtre des diagnostiques. La liste montre les productions du **cours actif**. Le geste ne touche que l'id coché ou décoché : une exclusion qui porte sur un autre cours reste intacte (déjà le cas).

**Supposition de Cowork**, à rappeler dans la demande : une pratique éditée alors qu'elle sert à un autre groupe-cours que l'actif montre les productions du cours actif ; c'est ce que le profil, ouvert à côté, calcule.

**Tests.** Dans la section H, un corpus à deux cours (`coursId` différents, le cours actif posé) :

- la liste ne montre que les productions du cours actif ;
- décocher la dernière production qui compte dans le cours actif est refusé, même quand l'autre cours en a de cochées ;
- un « Artefact » dans l'autre cours ne cache pas la liste.

Break-test : rendre à la liste `db.get(cle('productions'))` → les trois rougissent ; arbre restauré par sha256. Vitest depuis `tests/` ; la spec WebKit du lot 4 relancée.

Un commit pour la retouche, un pour les docs ; demande de relecture courte : `plans de travail/DEMANDE-RELECTURE-2026-10-29-standards-sans-portfolio-lot-4-retouche.md`. Pas de release, de verdict ni de push sans le signal de Grégoire.

## Trouvailles de Cowork

- **Inscrire (code étranger).** Les deux listes de l'hybride (`chargerProductionsPourCategories`) lisent aussi tout le trimestre : même défaut, antérieur au lot. Une ligne au BACKLOG sous #1178, sans correctif ici.
- **Commenter.** Une pratique rangée sous `.config` seul (forme d'import, #712) : la case écrit dans `.config` ; le premier enregistrement du formulaire crée `.configuration`, que le calcul lit d'abord, et la liste cesse d'agir. Antérieur (#465, primauté de `.configuration`), jamais observé sur une pratique créée dans l'app. Un commentaire à `basculerProductionQuiCompte`, rien de plus.

## Dispositions (Claude Code, 29 oct. 2026, 10 h 03)

- **La retouche** : faite, `032c7f91`. Demande : `DEMANDE-RELECTURE-2026-10-29-standards-sans-portfolio-lot-4-retouche.md`.
- **Les deux listes de l'hybride** : *inscrit*, BACKLOG sous #1178 (« Hors lot – Les deux listes de l'hybride lisent tout le trimestre »).
- **`.config` seul** : *commenté*, à `basculerProductionQuiCompte` (`032c7f91`).
