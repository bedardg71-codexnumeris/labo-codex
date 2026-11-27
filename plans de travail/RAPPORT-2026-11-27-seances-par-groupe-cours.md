# Rapport : le compte de séances, par groupe-cours (27 novembre 2026)

Lot « Le compte de séances, par groupe-cours », sur les décisions de Grégoire du 27 nov. (12 h 10 et 12 h 13). Branche `claude/hopeful-edison-9kv6o0`, partie de `lot/file-sans-gregoire-2026-11-27` à `951de3f89`. **Aucune fusion vers `main`, aucun bump, rien au changelog.** Fait : #1253, coché au BACKLOG. Reste : le verdict du Mac avant toute fusion, et le coup d'œil sous Safari dit plus bas.

## Ce que la mesure a montré d'abord

**D'où venait « 15 semaines • 30 jours de cours » sans trimestre.** Reproduit sous Chromium (le conteneur en a un, cette fois). La ligne n'était jamais redessinée quand la démo se fermait sans trimestre à rendre : `desactiverModeDemo` ne l'appelle pas, et l'arrivée sur Cadre › Trimestre passe par `chargerCadreCalendrierV2`, dont la branche « pas de cadre » n'écrivait que dans trois spans masqués. La ligne visible gardait donc les chiffres de la démo. Aujourd'hui, la démo y dit « 16 semaines • 46 jours de cours » (trois groupes : lundi, mercredi, jeudi). En retirant le troisième groupe (celui du 22 nov.), l'horaire lundi-mercredi seul donne exactement « 15 semaines • 30 jours de cours » : Grégoire avait une démo installée avant le 22 nov. (la version du pack reste 21.3 et ne réécrit pas une démo déjà ouverte). Après un rechargement, sans trimestre, la ligne disait « 0 semaines • 0 jours de cours ». Aucune clé nue `calendrierComplet` en cause.

**Ce que compte `obtenirSeancesCompletesDuGroupe`.** Rien : elle lit un cache (`seancesCompletes_gc_<id>`, clé non préfixée), écrit par `genererSeancesCompletes` seulement quand ce groupe-cours est le groupe ACTIF. Un groupe jamais activé rend `{}` ; un groupe activé avant un changement de dates garde l'ancien compte. Elle ne pouvait pas servir. La règle, elle, est dans `genererSeancesCompletes` :
- un jour compte s'il est « cours » ou « reprise » au calendrier, ou « jour-ouvrable » quand l'horaire du groupe y a une séance ;
- **reprises** : une reprise suit l'horaire du jour qu'elle remplace (`jourRemplace`, tiré de « Horaire du lundi ») ; le groupe qui avait cours ce jour-là n'y a pas sa séance. Une reprise un samedi est honorée, sans numéro de semaine ;
- **semaines spéciales** (planification, examens) et **journées sans cours** (y compris personnelles) : jamais « cours », donc jamais une séance ;
- **un cours d'été donné tous les jours** : chaque jour ouvrable de son horaire compte, pas les fins de semaine ;
- deux séances le même jour donnent deux entrées.

**Les autres endroits qui affichent « jours de cours » comme si c'étaient des séances** (listés, pas changés) :
1. Cadre › Calendrier scolaire, carte « Légende » : « N Jours de cours » (`js/calendrier-vue.js:489` et `:584`). Le même compte, tous groupes confondus, que l'ancienne ligne (`calculerStatistiquesCalendrier`). C'est le seul autre écran qui affiche un NOMBRE.
2. La grille du même calendrier : la couleur « Jour de cours régulier » (`js/calendrier-vue.js:531`) marque la réunion des jours de tous les groupes ; un jour coloré n'est pas forcément une séance du groupe actif. L'aide le reprend : « Un clic sur un jour de cours ouvre la saisie des présences à cette date » (`js/guidage-demo.js:39`, et l'aide d'`index.html` vers la ligne 10256).
3. L'accompagnement : « Jours de cours : génèrent automatiquement les séances » (`js/accompagnement-contenu-popup.js:337`). Il décrit le mécanisme, ne compte rien.

Lu et écarté : `calculerTotalSeances` (`js/presences-apercu.js:203`) compte les séances par dates du calendrier, mais aucun écran ne le lit (mesuré au lot 34, en tête du fichier).

## Fait

- **Partie « Trimestre »** : la ligne dit « Trimestre : 15 semaines (aucun congé) », sans « jours de cours » ; la note des congés et reprises reste. Elle est cachée tant qu'aucun trimestre n'est actif (`obtenirTrimestreId()` vide), et cachée dans le HTML avant que le code la remplisse. La branche « pas de cadre » de `chargerCadreCalendrierV2` la redessine maintenant : c'est elle qui tourne à l'arrivée sur Cadre › Trimestre, donc aussi après la sortie de la démo.
- **Partie « Groupe-cours »** : sous la carte du groupe-cours choisi, une bande `rangee-selection-resume` (`#v2-seancesGroupeCours`) dit « 15 semaines • 30 séances ». Rien quand aucun groupe-cours n'est choisi, rien sans horaire, rien si aucune séance ne tombe au calendrier (pas de « 0 séance »), rien pour un service. Elle suit le calendrier : `afficherStatistiquesTrimestreV2`, appelée après chaque changement de dates, de journée sans cours ou de reprise, la rafraîchit.
- **Le compte** : `seancesPrevuesDuGroupeCours(gc)` (`js/horaire.js`), en lecture seule. La règle de `genererSeancesCompletes` en est sortie telle quelle dans `calculerSeancesCompletes`, fonction pure que les deux appellent : le compte affiché et les séances de l'assiduité ne peuvent plus diverger. Deux cliquets qui lisaient le texte de la projection dans `genererSeancesCompletes` (#540, lots C et E1) la lisent maintenant là, et exigent que `genererSeancesCompletes` l'appelle.
- Retirés avec ce qu'ils servaient : les trois spans masqués « pour compatibilité » (`v2-nombreSemaines`, `v2-nombreJoursCours`, `v2-statsCongesReprises`, aucun lecteur), le compteur `compteurSeances` et un `if (idCours) {}` vides dans le code déplacé.
- Banc Playwright `portes-relais-cadre.spec.js` (#366) : la ligne y est lue « 2 semaines », et `v2-nombreJoursCoursSidebar` n'existe plus. **Non joué ici** (voir plus bas).
- Jetons anti-cache des quatre fichiers touchés au jour du build en ligne : `20261126b`.

**Source ou stock ?** Source seulement, et rien à reprendre : les deux lignes se calculent à l'affichage, rien n'est écrit dans les données.

## Tranché seul (une ligne chacun)

- **Emplacement** : une bande à part, juste sous la carte du groupe-cours et avant l'aide « Le groupe-cours actif apparaît dans l'en-tête », du même dessin que la ligne du trimestre ; pas dans la carte, qui porte la complétude.
- **Les semaines d'un groupe : celles de SES séances, pas celles du trimestre** (mesure contraire). Dans la démo, le trimestre compte 16 semaines parce que le groupe du mercredi et du jeudi a cours le jeudi 11 décembre, 16e « paquet de 5 » qui n'a que deux jours ; le groupe du lundi et du mercredi aurait lu « 16 semaines • 30 séances » pour des séances tenues en 15. Il lit « 15 semaines • 30 séances », l'autre « 16 semaines • 31 séances » (comptés à la main : 15 lundis et 15 mercredis ; 16 jeudis et 15 mercredis). Même règle que la ligne du trimestre (la dernière semaine qui a une séance), sur ses seules séances. ⚠ Revers assumé : si la dernière séance d'un groupe tombe sur une journée sans cours non reprise, ses semaines baissent d'une.
- **Deux séances le même jour en font deux** (un horaire « lundi 8 h » et « lundi 13 h » compte deux séances par semaine).
- **Un service ne dit rien, même avec un horaire** : la phrase de Grégoire (« un service d'orthopédagogie n'a pas d'horaire à donner : rien non plus ») et le mot « séance », qui n'est pas celui d'un service.
- **L'accord** : la règle partagée `window.pluriel` (0 ou 1 au singulier). Conséquence : un trimestre actif dont les bornes ont été réinitialisées dit « Trimestre : 0 semaine », là où il disait « 0 semaines ». C'est le seul autre mot qui bouge.

## Vérifié, et pas vérifié

- **Vitest** : l'essai neuf (20 essais) a été vu rouge avant le code (17 sur 18 dans sa première forme ; le 18e, la génération des séances complètes, était vert et devait le rester). Huit break-tests, chacun rouge, journal en fin de fichier ; le 8e n'a rougi qu'après l'ajout de l'essai du samedi. Suite complète, dans le conteneur, avant le commit : 965 fichiers, 12 499 essais verts. Deux cliquets de #540 (lots C et E1) avaient rougi à la première passe : ils lisaient la projection dans `genererSeancesCompletes` ; ils la lisent dans `calculerSeancesCompletes` (voir « Fait »).
- **Chromium** (pas WebKit) : le scénario de Grégoire repassé sur le code modifié. Neuf sans trimestre : ligne cachée. Dans la démo : « Trimestre : 16 semaines (aucun congé) » ; « 15 semaines • 30 séances » et « 16 semaines • 31 séances » sur les deux groupes-cours. Sortie de la démo, puis Cadre › Trimestre : ligne cachée. Rechargement : cachée. Aucune erreur de page. Deux captures regardées (la ligne du trimestre, la bande du groupe-cours).
- **Pas vérifié** : rien sous WebKit ni sous Safari (le conteneur n'a que Chromium ; la suite Playwright du dépôt vise WebKit et n'a pas été jouée, le banc #366 modifié non plus). Rien sur iPad. Le rendu est une ligne de texte dans une classe existante : un coup d'œil sous Safari suffit, sans porte terrain (une machine a répondu au reste).
- Rituel de fin de session appliqué sans release (le mandat l'exclut) : audit statique du diff propre (aucun `innerHTML`, handler inline, `eval` ni `console.log` ajouté ; aucune zone protégée touchée) ; le spec modifié ne gagne aucun `waitForTimeout` (il en porte cinq, d'avant). Aucun `RELAIS.md` poussé sur `main` : le mandat exclut toute écriture sur `main` ; ce rapport, sur la branche, tient lieu de relais.
- Avant toute fusion : le verdict du Mac, comme d'habitude.

## Trouvailles en chemin

- **Le nombre de semaines du trimestre dépend des groupes** (la réunion de leurs jours) : ajouter un groupe du jeudi fait passer la démo de 15 à 16 semaines. Réel, visible dans la démo, mais aucun symptôme vécu par Grégoire : **non inscrit au BACKLOG** (règle du 24 août). À lui de dire s'il le veut.
- **`obtenirSeancesCompletesDuGroupe` lit un cache qui ne suit pas le calendrier** pour un groupe-cours non actif (la colonne Date des exports, #416 lot C). Même règle : aucun symptôme vécu, **non inscrit**.
