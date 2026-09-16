# Tri des fiches ouvertes par coût de preuve – 13 septembre 2026

> Pendant markdown de l'artefact « Tri du chantier Labo Codex » (la TRACE ; l'artefact porte l'OPÉRATION).
> **Mis à jour le 16 sept. à 15 h 00** (14 h 45 pour les comptes, inchangés : `BACKLOG.md` n'a pas bougé depuis `71ca237f`) – **dix-neuf lots menés depuis le tri, et les dix-neuf sont en ligne.**
> ⚠ **DEUX JOURNÉES DE SUITE SANS TOUCHER AU TRI, ET C'EST L'ORDRE VOULU.** Le 15 a livré six versions, le 16 en a livré neuf, et **les quinze répondaient à un rapport de testeur** – ceux de Grégoire, celui de Mathieu. Les fiches d'ici n'ont pas bougé : ⮕ **ce n'est pas un retard du tri, c'est la règle des retours qui s'applique.**
> **Poussé : `1.142.14`** (`71ca237f` sur `origin/main`, build `0916-1312`). Grégoire a vérifié dans l'application les trois derniers correctifs (« ça fonctionne »).
> **Les neuf du 16, dans l'ordre de ses rapports** : `1.142.7` fusion des PDF d'un même élève (décision reportée la veille, **tranchée par lui : option B**) · `1.142.8` une copie jetée quitte le carrousel · `1.142.9` le PDF respecte « Niveau de performance », et le choix s'enregistre · `1.142.10` un travail diagnostique ne pèse plus (« 1 retenue sur 4 possibles », ses mots) · `1.142.11` perspective et rognage survivent à « Re-déposer » · `1.142.12` « Supprimer un groupe » toujours visible · `1.142.13` les sept champs d'une séance sur une rangée · `1.142.14` sous l'outil Texte, le clic ouvre au lieu d'empiler. Avant elles, `1.142.6` : la place du bouton « + Nouveau… » uniformisée dans les six accordéons du Cadre.
> **Compte : 232 fiches ouvertes au backlog**, remesuré le 16 sept. à 14 h 45 (`71ca237f`) : 233 cases `- [ ] ` à la racine, moins le gabarit `#XX` de la section « Notes ». Dernier ID : **#889**.
> ⚠ **L'ÉCART ENTRE LES DEUX COMPTES EST TOMBÉ À UN.** Ce document et l'artefact listent **231 entrées ouvertes** ; le seul écart restant est **#575**, détaillée ici en #575b/#575c et marquée livrée alors que sa case reste ouverte au backlog pour ce qu'il en reste (#860). Hier l'écart était de deux ; le second était la ligne de #868, restée à « ni releasé ni poussé » – **elle est cochée depuis ce matin** (`476f3c03`).
> ⚠ **Les douze fiches inscrites depuis le tri** (#862 à #865, #868 à #871, #878, #879, #887, #888) portent un palier lu dans l'audit ou dans la fiche, **pas mesuré au code**.
> ⮕ Ce nombre ne mesure pas l'avancement : il monte quand on cherche mieux. Ce qui se mesure est en tête : dix-neuf lots, en ligne.
> ⛔ `plans de travail/QUESTIONS-EN-ATTENTE-2026-09-13.md` est **périmé** : les quatre questions sont closes depuis le 13. Ne pas le resservir.

## Journal des lots

### Lot 1 – « les jetons de reprise ne mentent plus » ✅ LIVRÉ en 1.139.3

Choisi pour son coût de preuve le plus bas à demande d'attention nulle. Quatre fiches taries (#617, #720, #724, #725) ; la cinquième candidate (#721) **sortie avant codage** – arbitrage de didactique, et risque d'étendre le chantier à trois fichiers. Relecture croisée (`828618b1`) : cinq mutations refaites indépendamment, **trois trous de preuve** trouvés (une moitié de garde qu'aucun essai n'éprouvait, le déliement après écriture acceptée non prouvé, six assertions infalsifiables par construction du harnais). Les trois retouches ont été appliquées (`1c17f5dd`) avant la release.

### Hors séquence – #853 « permettre un délai sur une reprise » ✅ LIVRÉ en 1.140.0

Née de la relecture du lot 1 : une question de pédagogie y était « posée à Grégoire » sans être inscrite nulle part. Inscrite, tranchée par lui (« la question dépend de l'utilisateur, je ne veux pas imposer ma pratique à moi »), puis codée. **Deux relectures ont été nécessaires.** La première a trouvé que le moteur était juste mais que **l'interface mentait** : sur une pratique née de l'assistant, la case s'affichait, se cochait, s'enregistrait – et le moteur ne la lisait jamais. La seconde a vérifié le correctif (une note dit désormais que le formulaire est inerte) et a trouvé deux restes : un essai qui passait **à vide** parce que le faux DOM ne portait pas l'état initial de la vraie page, et un cas mixte où l'écran affichait encore des nombres qui ne s'appliquent pas. Corrigés avant la release.

⮕ La cause profonde reste ouverte sous **#854** : le moteur lit la configuration de l'assistant en premier, le formulaire de gestion n'est jamais consulté pour ces pratiques.

### Lot 2 – « la chaîne anti-cache dit la vérité sur ce qu'elle a vérifié » ✅ LIVRÉ en 1.140.1

Choisi sous la règle du 13 sept. : il ne touche que `scripts/` et `tests/`, donc aucun écran à vérifier et aucun arbitrage. Quatre fiches fermées (#675, #547, #600, #826) ; de #602, seule la moitié *lecture* est livrée (les gardes voient désormais les chemins qu'elles ne couvraient pas et les nomment) ; #827 **sortie avant codage** (symptôme conditionnel à une décision que rien n'exige).

Relecture croisée : sept mutations posées indépendamment, **aucune ne survit**, et le garde a été éprouvé en situation réelle (index vide → il ne bloque pas et le dit ; fichier stagé sans jeton → il refuse en nommant le jour du build). Un seul trou, ironique : **le défaut que le lot corrigeait survivait dans son propre repli** – sur un dépôt jeune, le repère retombait sur le commit courant et deux fichiers restaient sous leur ancienne URL, en silence. Retouché avant la release (`d16a61c4`).

⮕ Relu au **sommet de la branche**, pas au commit nommé : elle avait avancé de deux commits, dont le correctif d'un incident où un banc de test écrivait dans le vrai `.git/config` sous le hook pré-push (#856). Config du dépôt vérifiée saine après coup.

### Lot 3 – les interventions ✅ LIVRÉ en 1.140.2

Demandé comme « le lot qui touche `js/interventions.js` (6/6) ». **La mesure au code l'a réduit à deux gestes dans un seul fichier, sans une seule question** : les interventions d'un élève suivent son groupe-cours dans son profil comme elles le font déjà dans la liste, et un seuil de dépistage réglé à zéro cesse d'être remplacé en douce par la valeur du projet.

Ce que la mesure a corrigé de ma propre grille – **deux des six fiches ne sont plus dans ce fichier** : les seuils d'alerte ont déménagé le 10 sept. (#742 vit maintenant dans `js/contexte-qualification.js`) et le dépistage SOLO le 27 août. **#542 doit être cochée** : ses deux derniers pas sont livrés et verrouillés par des bancs, ses traînes de données sont portées par trois autres fiches, et son unique reste est la question de #551 dite une seconde fois. #836 attend son mois d'usage, pas un arbitrage. #847 est une décision d'une phrase, pas un défaut.

### Lot 4 – « les exemples gris ne citent plus les critères de Grégoire » ✅ LIVRÉ en 1.140.3

Choisi parce qu'il avait une DATE : vingt collègues lisent ces mots le 15. La fiche (#847) annonçait deux exemples ; **la mesure en a trouvé trois** – le troisième dans l'Aide (`index.html`), absent de la fiche – et un quatrième qu'il ne fallait PAS toucher, le vocabulaire `rencontres`, déjà propre : l'écran que l'orthopédagogue ouvre le 14 ne citait aucun critère. Grégoire a approuvé les deux textes de remplacement tels quels ; le troisième a reçu les mêmes mots.

Ce que la mesure a corrigé de ma propre consigne : j'écrivais qu'un banc existant tenait peut-être à l'ancienne chaîne « comme repère de rendu ». **Faux** – son bloc 2 est un gel de mots assumé (« la carte, telle qu'en 1.137.0 »). Claude Code l'a lu juste, l'a fait suivre les mots neufs, et y a ajouté l'exemple du titre, que rien ne couvrait.

Relecture croisée : les deux mutations reposées, chacune rougit une fois. **Un trou trouvé** – le troisième site n'était couvert par AUCUN banc : l'ancien texte de l'Aide remis, la suite entière restait verte (557 fichiers, 6 132 essais). Retouché avant le push (`269fe347`), dans `sentinelle-audit-aide-lot-E`, qui découpe déjà la section Aide.

⮕ **Ce que la retouche a trouvé en plus, et qui vaut pour tout le filet** : la tranche de l'Aide n'avait aucun garde de non-vide. Tant que ses assertions étaient positives, ça ne se voyait pas ; une assertion NÉGATIVE sur une tranche vide est vraie par construction. Un cas existant depuis le 10 sept. (l'export d'une échelle) était dans ce cas sans que personne le sache. Le garde ferme les deux.

### Lot 6 – « la suggestion d'objectif ne nomme plus une lettre d'échelle » ✅ LIVRÉ en 1.140.5

Les trois chaînes de `js/interventions.js`, l'entrée de « Nouvelles », le commentaire de `scripts/release.mjs` et les deux bancs. **Relecture croisée verte, aucune retouche.** La question ouverte – le couplage bilan / suggestion passait par la lettre qui disparaît – est tranchée par la mesure : la mutation décisive (le premier seuil figé à 0,64) rougit, et elle rougit sur l'assertion *dérivée* avant la chaîne figée. **La preuve vit.**

⮕ Une de mes suppositions est tombée au passage : je croyais l'entrée « Nouvelles » mal placée ; la convention du fichier est « une entrée par version mineure », et un correctif n'ouvre pas de bloc.

### Lot 7 – l'ancien éditeur d'échelles quitte `index.html` ✅ LIVRÉ, sans release (#520)

Choisi parce qu'il ne demande ni arbitrage ni vérification à l'écran : le bloc visé était caché et mort à la lecture. Identifiants dupliqués dans le document : **8 → 0**, et une machine le vérifie seule désormais.

**Ce que la mesure a corrigé de la fiche** : elle nommait cinq identifiants, et l'un d'eux (`btnDupliquerEchelle`) n'était pas dupliqué du tout. **Ce que la mesure a corrigé de MON compte** : j'annonçais cinq balises à double attribut `class` sur dix-sept ; la sentinelle en compte **six sur dix-neuf** – une balise porte ses deux `class` sur deux lignes, et mon `grep` ne la voyait pas. #787 est ramenée à treize cas.

### Lot 8 – deux fiches relues contre leur livraison ✅ LIVRÉ (#803 cochée, #801 laissée ouverte)

Aucun code. #803 est cochée. **#801 est restée OUVERTE, et c'est moi qui l'ai tranché** : deux de ses trois gestes étaient livrés, mais le défaut qui avait fait naître la fiche – le bandeau qui dit où sont les nouveautés au lieu d'y mener – était toujours à l'écran. La cocher aurait été prendre l'affirmation pour la preuve.

⮕ De ce lot sort la **règle 10 du PROTOCOLE** et la fiche #858 : trente assertions négatives passaient sans rien éprouver.

### Lot 9 – les assertions qui ne pouvaient pas échouer ✅ LIVRÉ en 1.140.6 (#858)

Un banc qui cherche une absence dans une tranche de fichier est vrai par construction si la tranche est vide. Une fonction de découpe qui **refuse** de rendre une tranche vide remplace l'idiome, et un cliquet fige les découpes restantes. **Deux assertions étaient mortes pour de bon**, trouvées en observant l'exécution.

**Ce que la mesure a corrigé de ma consigne** : mon compte de 112 découpes était faux – il y en avait **167**, et les deux mortes étaient précisément parmi les 55 que ma commande ne voyait pas, parce qu'elles s'écrivent sur deux lignes. Même cause que l'erreur du matin, le même jour.

### Lot 10 – les huit conteneurs vides que le code remplissait ✅ LIVRÉ, sans release (#658 et #659)

Dernier lot de la grappe des échelles. L'ancien éditeur de niveaux – celui qui dessinait ses boutons dans des boîtes que personne ne voyait – quitte l'application : huit conteneurs, ≈ 930 lignes de `js/echelles.js`, 18 règles de style. **Rien ne change à l'écran.** Deux clés de données cessent d'être écrites.

**#659 s'est fermée par la mesure, sans une ligne de code** : sa chaîne d'écriture était déjà coupée par le lot 7. La fiche prévoyait un correctif ; il n'avait plus d'objet.

**Relecture croisée verte, et pour la première fois PAR EXÉCUTION.** Le §5 de `CONSIGNE-DEMARRAGE-COWORK.md` affirmait que Cowork ne peut pas lancer la suite ; c'est faux depuis un clone partagé avec `npm install` à neuf dans `tests/`. Mesuré : 559 fichiers, 6 337 essais verts, puis les mutations reposées une à une – chacune rouge, témoin vert après restauration.

⮕ **Le geste le plus risqué du lot, et il tient** : un banc a été supprimé. Son remplaçant n'est pas un autre banc, c'est la disparition de son sujet – les six fonctions dont il éprouvait la sérialisation n'existent plus nulle part, vérifié **par le contenu** (lecture entière de 1 031 fichiers) et non par le nom du fichier, l'erreur payée plus tôt dans la journée.

⮕ **Ce que la mesure a corrigé de MON compte, troisième fois dans la journée** : j'ai signalé une règle de style `.outils-rangee` orpheline. Elle n'existe pas – la seule trace restante est un commentaire, et mon balayage ne distinguait pas le commentaire du code. Claude Code l'a relevé.

⛔ **Ce qui revient à Grégoire sur ce lot** : l'écran des échelles n'a été regardé ni sur Safari ni sur iPad ; le **stock** déjà écrit dans sa base n'a pas été lu (`localStorage.getItem('configEchelle')`), et ne se répare pas d'office. Le verdict Playwright a été pris (code 0), mais **Cowork n'était pas fermé** : la condition habituelle n'est pas garantie.

### Journée du 15 septembre – six versions, sept rapports de testeurs ✅ TOUT EN LIGNE

**Ce ne sont pas des lots du tri : ce sont des retours de testeurs, et ils passent devant.** Les fiches du tri n'ont pas bougé de la journée, sauf #868, née de l'audit du matin.

1. **Les notes du « Rapport » d'un profil ne disparaissent plus** (`1.141.0`, rapport de 10 h 06). **La mesure a démenti la régression** : ce texte n'était enregistré nulle part, et ne l'avait jamais été – le correctif du 11 sept. n'avait supprimé que l'effacement *pendant* l'ouverture d'un profil, jamais couvert le trajet aller-retour entre sous-sections. Zone « Mes notes » persistante, masquée en anonymisation. Seize mutations, seize rouges.
2. **« Enregistrer » n'accuse plus l'élève d'être introuvable** (`1.141.1`, rapport de 12 h 16). **Le rapport avait une seconde moitié, silencieuse et mesurable** : après l'alerte, l'application ne savait plus quel élève était ouvert et la barre latérale du profil ne répondait plus. Les trois contrôles écrits AVANT le correctif, rouges sur les trois symptômes.
3. **« Évaluer » mène au bon élève, avec ou sans copie** (`1.142.0`, #868, audit du module profil). Trois `evaluerProduction` coexistaient ; celle qui répondait remplissait des listes cachées encore vides. **La cause écrite par l'audit du matin était fausse**, et trois défauts voisins sont apparus en chemin. **Relecture croisée de Cowork** : verte par exécution (565 fichiers, 6 370 essais, mutations de la sentinelle reposées une à une, trois rouges, témoin vert) ; **un écart trouvé** – l'entrée de « Nouvelles » promettait « Consulter » sans copie alors qu'aucune mesure ne le jugeait. ⮕ La mesure a été ajoutée (`38bc9ac3`), la phrase gardée. C'est la bonne issue : la promesse était vraie, c'est la preuve qui manquait.
4. **Créer un deuxième groupe d'élèves** (`1.142.1`, #872, rapport de Mathieu, session parallèle). Le bouton « + Nouveau groupe » avait quitté `index.html` en janvier et sa fonction survivait sans appelant. ⚠ **Non traité** : à l'import, le rattachement au cours actif reste invisible. ⛔ **Et les élèves déjà écrits chez Mathieu ne se déplacent pas d'office** – tarir n'est pas réparer.
5. **L'Aide dit ce que la Loi 25 demande à l'enseignant** (`1.142.2`, #862, texte de Grégoire approuvé à 16 h 30). Un contrôle vérifie que les deux boutons que l'encadré nomme existent vraiment sous ces mots.
6. **L'import des copies assemble de nouveau, et dit ce qu'il fait** (`1.142.3` à `1.142.5`, #873, #875, #876, #877). **Le vrai lot de Grégoire – 86 photos – a démenti une règle écrite le 30 août** : les pages d'une remise ne partagent pas la seconde de dépôt (09h46m45s, 09h46m55s…), donc chaque page devenait un document annoncé « doublon ». **Décision de Grégoire** : un document par élève et par production, tri à la main. Deux suites le même soir – la file déjà déposée gardait l'ancienne règle, et la fenêtre de préparation ne rendait rien sans réglage à appliquer.

⮕ **Ce qui reste à Grégoire, et rien ne se code avant** : #860 (les paliers d'échelle sous les deux graphiques de groupe – la décision du 13 sur le graphique individuel ne s'y étend pas d'office), #871 (le pourcentage et la fraction qui se contredisent au profil), #874 (les PDF sans aperçu à l'import, inscrits sans diagnostic). Et une prose à corriger, pas un arbitrage : #878 (comment l'Aide nomme les pages d'une remise).

### Journée du 16 septembre – neuf versions, neuf rapports ✅ TOUT POUSSÉ

**Aucune fiche du tri n'a bougé.** Comme le 15, la journée est passée aux rapports, et ils passent devant.

⮕ **Ce qu'il faut retenir de la méthode, et qui se répète** : sur les neuf, **deux décisions de Grégoire ont changé le lot**, et l'une renversait un report de la veille – la fusion des PDF d'un même élève (#880), qu'il avait mise « à voir à l'usage » le 15 au soir et tranchée le 16 au matin sur un cas vécu. ⮕ **Un report n'est pas un refus, et il ne se repose pas d'office : c'est le symptôme vécu qui le rouvre.**

⚠ **Quatre correctifs ont tari leur source sans toucher au stock, et c'est écrit, pas découvert** : les quatre PDF déjà importés séparément le restent (#880) ; les copies importées avant la correction gardent leurs réglages perdus (#884) ; les évaluations déjà enregistrées en « Note chiffrée » le restent, il faut recocher (#882). **Rien n'a été écrit dans les données de Grégoire.**

⮕ **Trois fiches sont entrées** : **#887** l'import rattache la liste au cours ACTIF sans le nommer (c'est le mécanisme A de #872, resté non traité en 1.142.1 — il entre parce que Mathieu l'a **vécu**) ; **#888** l'étiquette du champ Périodes, relevée par la session et inscrite **sur décision de Grégoire**, la règle du 24 août l'excluant sans son avis ; **#879** la forme des six boutons « + Nouveau… », **inscrite pour ne pas être ouverte** – aucun symptôme vécu, et le Cadre est du travail d'installation, vraisemblablement au Mac. Elle se réveille si un membre de la CoP fait son installation sur iPad.

⮕ **Ce qui reste à Grégoire, et rien ne se code avant** : #860, #871, #874. Prose à corriger, pas un arbitrage : #878, #888. **Porte reportée par lui au prochain artefact, vers le 23-30 sept.** : perspective et rognage après rechargement puis « Re-déposer » (#884). **Réglée selon lui (16 sept., après-midi)** : la question du profil qui montrait des pourcentages par travail sous « note différée » – ne plus la poser.

⮕ **Page alignée à 15 h 00** : l'item « À toi » périmé du 15 (qui disait « deux autres » et n'en nommait qu'une) est retiré de la page ; il reste ici, dans le journal du 15, comme trace.

## Ce que valent les goulots de ce tri – deuxième avertissement, mesuré

La contre-épreuve du matin avait déjà trouvé un goulot faux (#689). Le lot 3 en a trouvé **deux de plus**, et de la même cause : **le goulot a été lu dans la fiche, pas mesuré dans le code**. Une fiche ne suit pas le code quand celui-ci déménage.

⮕ Règle qui en découle, appliquée depuis : **avant d'ouvrir un lot, vérifier que ses fiches vivent encore dans le fichier qu'elles nomment.** C'est une mesure de trente secondes qui, deux fois sur trois lots, a changé la composition du lot.

## La grille

Le palier ne mesure pas la taille du changement, mais **la preuve à produire avant de livrer**.

- **Q – rapide** : des mots, un affichage, une garde locale. Aucune donnée en base, aucune règle de calcul ne change. Une session le prouve seule.
- **I – intermédiaire** : un comportement change, dans un seul module. Comparaison avant/après, souvent une rangée de porte terrain.
- **L – laborieuse** : `données déjà écrites` chez les utilisateurs (« source, stock, ou les deux ? »), `zone protégée`, ou `trois modules et plus` / un format de données.

« Attend une décision de Grégoire » n'est PAS un palier : c'est un **second axe** (*qui doit parler en premier*). Appliqué comme palier, il mettait 56 % des fiches dans « laborieux » – dont 54 qui ne sont lourdes que par l'attente.

**Règle de sélection des lots (Grégoire, 13 sept.)** : prendre ceux qui ne lui demandent **ni arbitrage ni vérification à l'écran**. Ce qui attend une décision se range dans le fichier des questions, pas dans la conversation.

**Ce qu'un lot doit porter, appris des trois relectures** : pour chaque correctif, **la mutation qui ISOLE** le contrôle neuf. Un essai peut passer *pour la mauvaise raison* – un autre garde-fou intercepte avant celui qu'on croit éprouver – ou passer *à vide*, quand le harnais garantit lui-même ce que l'assertion prétend vérifier. Les trois lots ont chacun livré un cas des deux.

## Les comptes – 16 septembre, 14 h 45

| | fiches |
|---|---:|
| Q – rapides | 45 |
| I – intermédiaires | 83 |
| L – laborieuses | 98 |
| indécidables en l'état | 5 |
| **entrées ouvertes de ce tri** | **231** |
| **fiches ouvertes au backlog de `main`** | **232** |
| dont en attente d'un arbitrage | 82 |
| ✅ sorties du tri depuis son ouverture | 27 |

Portée des arbitrages en attente : **19** se règlent par une phrase, **26** demandent un écran ou ses données, **13** ouvrent un chantier, **24** n'ont pas encore de portée établie.

⚠ L'écart entre les deux lignes en gras est de **un**, et c'est #575 – voir l'en-tête. Il était de deux hier.

## Ce que vaut ce tri (contre-épreuve)

Le palier de chaque fiche est **lu dans la fiche**, pas mesuré dans le code. Contre-épreuve adverse sur huit fiches reprises au code : **trois cotes fausses** (#690 périmée depuis 1.110.0, #655 → `I`, #595 → `L/multi`) et un goulot faux (#689). Les quatre erreurs venaient de la fiche, aucune de la grille. Corrections appliquées ci-dessous.

⚠ **Bon pour composer un lot, insuffisant pour promettre un coût.** Les trois lots menés l'ont confirmé à chaque fois : la mesure au code a corrigé la fiche – #600 à moitié périmée, #675 et #547 qui sont le même geste, #602 dont seule la moitié *lecture* était livrable, #742 et #542 qui avaient changé de fichier, #746 déjà réparée à moitié.

## Les lots – même point du code

### `index.html` – 8 ouvertes sur 9

*Aide › Référence rapide · chargement des fichiers et 7 autres écrans*

- **Q** Le glossaire réduit la PAN à « garder les N meilleurs travaux » (#803)
- ✅ **Q** Un fichier neuf peut entrer sans jamais être chargé, en silence – **livrée en 1.140.4** (#657)
- **I** Le style inline d'index.html écrase 13 classes de mise en forme – à Grégoire : choix de produit, à froid ; à revérifier (#766)
- **I** 22 balises perdent en silence leur seconde classe de mise en forme – à Grégoire : choix de produit, à froid (#787)
- **I** Le canal pour donner son avis existe, mais rien ne le laisse deviner (#801)
- **I** Un ancien éditeur caché duplique les identifiants de la page (#520)
- **I** Ajouter les deux guides manquants (#439)
- **I** Des règles CSS dupliquées créent des écarts d'affichage (#297)
- **L** Les emojis rendent mal sur iPad – trois modules et plus (#286)

### `js/echelles.js` – 9 ouvertes sur 9

*Conception › Échelles (A2025) · Conception › Échelles et 6 autres écrans*

- **Q** Renommer les deux échelles homonymes – à Grégoire : ses données, à froid (#450)
- **I** Ouvrir la section des échelles écrit en base sans qu'on ait rien touché (#659)
- **I** On ne peut plus créer un niveau qui ne compte pas dans la note – à Grégoire : pédagogie, une phrase (#546)
- **I** Un niveau neuf naît avec des valeurs choisies par le projet – à Grégoire : pédagogie, à froid (#574)
- **L** Un bouton « Modifier » est dessiné dans une zone que personne ne voit – trois modules et plus (#658)
- **L** Supprimer une échelle laisse des évaluations orphelines – données déjà écrites, trois modules et plus (#624)
- **L** Dupliquer par la barre latérale crée deux jumelles confondues – trois modules et plus (#586)
- **L** Les niveaux d'échelle sont partagés entre tous les trimestres – données déjà écrites ; à revérifier (#601)
- **L** Des noms venus d'un fichier partagé s'affichent sans être échappés – trois modules et plus (#467)

### `js/profil-etudiant-calculs.js` – 9 ouvertes sur 10

*note globale au profil · Suivi › Profil (barres et IPB) et 8 autres écrans*

- ✅ Un nom de critère écrit en dur écrase la clé de calcul – **fusionnée dans #553 le 13 sept.** : doublon inscrit ce midi sans voir #553, ouverte depuis le 27 août. Le numéro n'est pas repris ; la mesure (huit sites dans quatre fichiers, normalisateur canonique `_normaliserNomCritereIPB` ici) est reportée dans #553 (#857)

- **I** Sans texte de rétroaction, la note globale n'affiche aucun niveau (#718)
- **I** Un critère noté en points est lu comme un niveau approximatif – à Grégoire : pédagogie, une phrase (#739)
- **I** Un critère « Aucun » reste un défi partout sauf dans l'IPB – à Grégoire : pédagogie, une phrase (#740)
- **I** Une évaluation sans texte final sort du dépistage mais compte dans la note (#741)
- **I** Le statut de décrochage n'atteint jamais la cible d'intervention – à Grégoire : pédagogie, une phrase (#554)
- **I** Sans donnée convertible, la moyenne affiche 0 au lieu de « rien » – à revérifier (#536)
- **L** La note des standards se construit sur le portfolio, pas sur les cibles – à Grégoire : arbitrage à préciser ; trois modules et plus (#810)
- **L** Trois façons de retrouver une échelle, trois résultats possibles – à Grégoire : arbitrage à préciser ; trois modules et plus (#590)
- **L** Un critère dont le nom varie disparaît du dépistage – à Grégoire : arbitrage à préciser ; trois modules et plus ; à revérifier *(a absorbé #857 le 13 sept.)* (#553)

### `js/evaluation-calcul.js` – 6 ouvertes sur 6

*rétroaction imprimée · correction algorithmique et 4 autres écrans*

- **Q** Un critère sans niveau imprime « -- » sur la rétroaction de l'élève – à Grégoire : pédagogie, une phrase (#702)
- **I** Une copie sans faute ne peut pas être notée en mode catégories – à Grégoire : pédagogie, une phrase (#704)
- **I** Un critère « Français écrit » reçoit le texte générique (#686)
- **L** Une note pile entre deux bornes monte l'élève d'un niveau – à Grégoire : pédagogie, à froid ; trois modules et plus (#701)
- **L** Une grille analytique calcule en holistique si le critère n'a pas de type – à Grégoire : arbitrage à préciser ; trois modules et plus (#703)
- **L** Modifier une grille rend « incomplètes » des évaluations déjà remises – à Grégoire : arbitrage à préciser ; données déjà écrites (#705)

### `js/evaluation-jetons.js` – 1 ouvertes sur 6

*reprise sur copie remplacée · retirer une reprise et 4 autres écrans*

- ✅ **Q** Une reprise née d'une copie remplacée disparaît du calcul *(livré 1.139.3)* (#724)
- ✅ **Q** « Originale restaurée » s'affiche même quand l'enregistrement échoue *(livré 1.139.3)* (#725)
- ✅ **Q** Le fichier part à la corbeille même quand l'enregistrement est refusé *(livré 1.139.3)* (#617)
- ✅ **I** Un délai accordé est décompté deux fois après une reprise *(livré 1.139.3)* (#720)
- ✅ **I** Permettre un délai sur une reprise devient un réglage de la pratique – à Grégoire : pédagogie, une phrase *(livré 1.140.0)* (#853)
- **L** Les jetons se mélangent entre trimestres et échappent aux archives – trois modules et plus, données déjà écrites (#721)

### `js/import-export.js` – 6 ouvertes sur 6

*réinitialisation complète · partage et réception d'un document et 3 autres écrans*

- **Q** Deux rechargements de page restent nus, par choix assumé – à revérifier (#800)
- **Q** Rien ne dit qu'un document reçu est une copie (#696)
- **I** Une pratique importée garde une référence vers une échelle renumérotée (#664)
- **I** Des cartouches importées atterrissent hors du trimestre (#655)
- **L** Après un import, une copie peut pointer vers une cartouche disparue – trois modules et plus (#654)
- **L** Un champ importé trop long laisse passer un début de balise HTML – trois modules et plus (#585)

### `js/modes.js` – 6 ouvertes sur 6

*profil sous une pratique importée · tableau de bord d'un groupe et 4 autres écrans*

- **I** Une pratique importée s'affiche « configuration absente » (#712)
- **L** Un groupe sans pratique affiche quand même une note, par deux règles – à Grégoire : pédagogie, une phrase ; trois modules et plus (#710)
- **L** Un ancien identifiant de pratique fait calculer deux notes différentes – à Grégoire : arbitrage à préciser ; données déjà écrites (#711)
- **L** En anonymisation, le volet confidentiel affiche les vraies données – à Grégoire : arbitrage à préciser ; trois modules et plus (#751)
- **L** Un enregistrement raté peut afficher « enregistré » – trois modules et plus (#786)
- **L** « Enregistré » s'affiche alors que rien n'a été écrit – trois modules et plus (#618)

### `js/interventions.js` – 2 ouvertes sur 5

*Suivi › Interventions · Suivi › Rencontres et 3 autres écrans*

⚠ **Ce point du code n'est plus un lot.** Trois de ses cinq fiches sont parties le 13 (#746 et #542 en 1.140.2, #847 en 1.140.3) ; des deux qui restent, l'une attend un mois d'usage et l'autre une réponse de Grégoire. **Mesuré le 13 au milieu de l'après-midi : il ne reste rien de codable ici qui ne passe pas par lui.**

- **L** Restes du chantier Rencontres à trancher après un mois d'usage – à Grégoire : choix de produit, un chantier ; trois modules et plus (#836)
- **L** Le risque d'un élève se calcule sur les seuils d'un autre enseignant – à Grégoire : pédagogie, un chantier ; trois modules et plus *(garde livrée en 1.140.2 ; la suggestion sans lettre commitée le 13 dans `d21d320f`, pas encore relue ni en ligne)* (#551)
- ✅ Les interventions d'un groupe affichent celles de tous les groupes – **livrée en 1.140.2** (#746)
- ✅ Le dépistage suppose l'échelle de Grégoire – **livrée en 1.140.2**, son reste transféré à #551 (#542)
- ✅ Deux exemples du formulaire citent les critères de Grégoire – **livrée en 1.140.3**, trois sites et non deux (#847)

⮕ **#857, inscrite le 13, ne vit PAS ici** malgré son énoncé : la mesure a trouvé le nom de critère écrit en dur **huit fois dans quatre fichiers**, et le normalisateur canonique (`_normaliserNomCritereIPB`) vit dans `js/profil-etudiant-calculs.js`. Le corriger dans `interventions.js` seul casserait la correspondance des clés. Elle est rangée sous ce fichier-là.

### `js/bibliotheque-ui.js` – 4 ouvertes sur 4

*bibliothèque des pratiques · import dans les bibliothèques et 2 autres écrans*

- **I** Trois modèles sur cinq disparaîtraient si on uniformise le filtre démo (#692)
- **L** Après un import, rien ne conduit l'œil à l'item ajouté – trois modules et plus (#793)
- **L** Vingt-deux fonctions « Dupliquer » différentes restent à fusionner – à Grégoire : ses données, à froid ; données déjà écrites, trois modules et plus (#476)
- **L** Comparer deux doublons côte à côte et fusionner – à Grégoire : choix de produit, un chantier ; trois modules et plus (#291)

### `js/productions.js` – 4 ouvertes sur 4

*Travaux › Productions · formulaire d'une production et 2 autres écrans*

- **I** Supprimer la production affichée laisse un surlignage mort (#633)
- **I** Ajouter consignes détaillées, format et modalités de remise – à Grégoire : choix de produit, à froid (#279)
- **L** La garde contre les productions du mauvais trimestre ne mord plus – à Grégoire : choix de produit, à froid ; données déjà écrites (#548)
- **L** Verrouiller une production est impossible, et le verrou n'interdirait rien – à Grégoire : arbitrage à préciser ; trois modules et plus (#489)

### `js/snapshots.js` – 4 ouvertes sur 4

*indice C au tableau de bord · indice C historique et 2 autres écrans*

- **I** Le taux de remise d'un groupe peut dépasser 100 % (#726)
- **I** Un travail formatif compte comme un travail dû (#727)
- **L** L'historique de performance n'est pas la note du cours – trois modules et plus, données déjà écrites (#716)
- **L** Les captures déjà écrites gardent un 0 pour une note inexistante – à Grégoire : arbitrage à préciser ; données déjà écrites (#777)

### `js/tableau-bord-apercu.js` – 4 ouvertes sur 4

*Suivi du groupe › barre Assiduité · Suivi du groupe › Détails et 2 autres écrans*

- **Q** Sans périodes saisies, la barre Assiduité reste vide sans rien dire (#830)
- **I** Un filtre trie sur un nombre qu'aucun écran n'affiche – à Grégoire : pédagogie, une phrase (#828)
- **I** La moyenne d'assiduité n'est pas la même sur deux écrans – à Grégoire : pédagogie, une phrase (#750)
- **I** Faut-il rétablir un repli qui n'a jamais rien trouvé ? – à Grégoire : pédagogie, une phrase (#634)

### `js/contexte-qualification.js` – 3 ouvertes sur 3

*profil d'élève – contexte d'apprentissage · tableau de bord et profil d'élève et 1 autres écrans*

- **I** Un palier d'alerte existe dans le code mais ne s'affiche jamais – à Grégoire : pédagogie, à froid (#822)
- **L** Les mots des bandes de couleur ne s'appuient sur rien de nommé – à Grégoire : arbitrage à préciser ; trois modules et plus (#821)
- **L** Les seuils d'alerte des interventions sont écrits en dur – à Grégoire : pédagogie, à froid ; trois modules et plus *(goulot corrigé : la règle a déménagé le 10 sept.)* (#742)

### `js/indices.js` – 3 ouvertes sur 3

*assiduité avec présences facultatives · profil d'un élève exclu et 1 autres écrans*

- **I** Une présence facultative compte en heures, pas en périodes (#728)
- **I** Un élève exclu est quand même calculé, avec une autre règle (#745)
- **L** Un élève sans aucune séance saisie affiche 100 % d'assiduité – trois modules et plus (#743)

### `js/main.js` – 3 ouvertes sur 3

*démarrage · export du plan d'alignement et 1 autres écrans*

- **Q** Retirer le rattrapage temporaire d'un vieux backup (#428)
- **I** Retirer la reprise temporaire des rétroactions de leçon (#430)
- **L** Un nouveau trimestre reste vide, et une suppression vaut pour tous – à Grégoire : arbitrage à préciser ; données déjà écrites (#683)

### `js/partage-schemas.js` – 3 ouvertes sur 3

*partager une échelle · partager une grille*

- **L** Les seuils de maîtrise ne voyagent pas avec l'échelle – trois modules et plus (#680)
- **L** Le fichier partagé ne dit pas de quel trimestre viennent les cartouches – trois modules et plus (#643)
- **L** Partager une échelle perd ses deux repères de maîtrise – à Grégoire : engagement public, une phrase ; trois modules et plus (#583)

### `js/pratiques/pratique-configurable.js` – 3 ouvertes sur 3

*note en dénotation · assistant de pratique et 1 autres écrans*

- **I** Réordonner les cibles plafonne la note des élèves à 59 sans un mot (#717)
- **L** Les reprises se configurent mais ne changent aucune note – à Grégoire : pédagogie, un chantier ; trois modules et plus (#324)
- **L** La pratique hybride ne reproduit pas la note officielle – à Grégoire : arbitrage à préciser ; données déjà écrites, trois modules et plus (#339)

### `js/profil-etudiant-actions.js` – 3 ouvertes sur 3

*profil d'un élève de service · note du cours (tous les artefacts) et 1 autres écrans*

- **I** Un service sans pratique pourrait afficher une note de portfolio – à Grégoire : pédagogie, une phrase (#839)
- **I** Deux écrans calculent deux notes différentes (#715)
- **L** Comparer côte à côte la note selon plusieurs pratiques – trois modules et plus (#307)

### `js/reserve.js` – 3 ouvertes sur 3

*Données › Archiver un trimestre · rouvrir une archive et 1 autres écrans*

- **Q** Le moratoire sur l'archivage tient tant qu'il n'est pas levé – à Grégoire : ses données, à froid ; à revérifier (#622)
- **L** Des cartouches archivées n'apparaissent pas dans la liste – trois modules et plus (#637)
- **L** Consulter une archive sans la désarchiver – trois modules et plus (#257)

### `js/travaux-ui.js` – 3 ouvertes sur 3

*Évaluations › annoter une copie · Travaux › Importer et Exporter et 1 autres écrans*

- **I** Annoter depuis la liste ouvre la copie sans aucune palette (#651)
- **L** Six clés de session sans préfixe de trimestre peuvent se mélanger – trois modules et plus (#596)
- **L** La balance des blancs s'applique aux photos sans aperçu – trois modules et plus (#598)

### `scripts/release.mjs` – 2 ouvertes sur 3

*pages du design system · publication d'une version*

- **Q** Les pages du design system chargent la feuille de style sans jeton *(sortie du lot 2 : symptôme conditionnel à une décision que rien n'exige)* (#827)
- ✅ **I** La release et sa sentinelle ne comptent pas les mêmes fichiers *(livré 1.140.1)* (#675)
- **L** Un fichier périmé reste servi sans qu'aucun contrôle ne le dise – trois modules et plus *(moitié « lecture » livrée en 1.140.1 ; poser les jetons reste)* (#602)

### `styles.css` – 3 ouvertes sur 3

*pages à barre latérale sur iPad · apparence de toute l'application et 1 autres écrans*

- **I** Deux pages restent serrées sous 1024 px (#283)
- **L** Cent douze couleurs appellent une variable qui n'existe pas – trois modules et plus (#813)
- **L** 78 variables jamais définies : bordures et alertes sans couleur – trois modules et plus (#595)

### `tests/integration/` – 3 ouvertes sur 3

*suite de tests · intégration continue*

- **Q** Deux tests rouges en suite, verts isolés – à revérifier (#523)
- **Q** Un test ne passe qu'au second essai (#685)
- **I** Des tests rouges au hasard sur le serveur, verts en local (#833)

## Le reste – fiches isolées ou sans fichier nommé

### module Rythme

- **I** Emporter son portrait temporel hors de l'app (#269)
- **I** Ouvrir une activité du portrait pour voir le détail (#270)
- **?** Voir si l'on évalue plus vite d'une activité à l'autre (#268)
- **?** Planifier plusieurs productions à corriger (#271)

### assistant de pratique

- **I** L'assistant ne demande pas d'abord si on sait ce qu'on veut (#484)
- **L** Une échelle embarquée ne peut pas recevoir ses repères – trois modules et plus (#579)

### bilan PDF de l'élève

- **I** Le bilan PDF juge « faible » et « maîtrisé » avec les lettres IDME (#575b)
- **L** Le bilan juge « maîtrisé » avec les lettres IDME en dur – à Grégoire : arbitrage à préciser ; trois modules et plus (#575)

### ouverture d'une évaluation

- **I** Deux chemins d'ouverture amputent l'échelle de ses champs neufs (#580)
- **L** Ouvrir une évaluation échoue par intermittence – trois modules et plus (#272)

### parcours de rentrée

- **Q** Le badge « X/5 configurés » compte mal (#475)
- **Q** Polir les détails d'interface du parcours de rentrée (#478)

### CI, hors application

- **I** Le verdict des tests navigateur dépend du hasard du plafond de temps – à Grégoire : choix de produit, une phrase (#788)

### Cadre du trimestre

- **L** Absorber un calendrier réémis après une grève – à Grégoire : choix de produit, un chantier ; données déjà écrites, trois modules et plus (#378)

### Cadre › Cours (+ Nouveau cours)

- **I** Sur un service, « + Nouveau cours » ouvre un formulaire Enseignement (#843)

### Cadre › Cours et Groupe-cours

- **I** Deux libellés annoncent l'horaire facultatif alors qu'il est exigé (#848)

### Cadre › Cours – supprimer

- **I** Un service créé par erreur ne peut pas être supprimé dans l'application (#844)

### Cadre › horaire

- **I** Annuler une modification d'horaire ne l'annule pas vraiment (#477)

### Carte d'alignement

- **L** La carte ne dit pas quelles productions sont évaluées mais non planifiées – à Grégoire : arbitrage à préciser ; trois modules et plus (#425)

### Comparateur de pratiques

- **Q** Une reprise « sans pénalité » garde la dernière note, sans le dire (#588)

### Conception (4 sections)

- **L** L'ancien système des quatre sections traîne sous l'interface – trois modules et plus (#628)

### Conception (4 écrans)

- **I** Astérisques sans légende et cibles trop petites (#519)

### Conception (points mineurs)

- **I** Les derniers points mineurs du plan Conception (#629)

### Conception › pratiques

- **I** Retirer le mode « par objectifs », qui n'est plus atteignable (#592)

### Créer mon service

- **L** Un élève déjà inscrit à un autre cours n'entre pas dans un service – à Grégoire : arbitrage à préciser ; trois modules et plus (#838)

### Labo › Exploration des pratiques

- **L** Finir le banc de comparaison et le remettre en vue – zone protégée, trois modules et plus (#326)

### Labo › Outils d'observation (démo)

- **I** En démo, choisir une grille de dépistage écrase le vrai choix (#829)

### Organisateur de leçons

- **L** L'Organisateur oblige à défiler sans fin – trois modules et plus (#140)

### Profil › Développement des habiletés

- **I** Le panneau des habiletés annonce le mauvais nombre d'artefacts (#714)

### Présences et Interventions (anonymisation)

- **L** Le mode anonymisation n'arrête pas l'écriture des présences – trois modules et plus (#736)

### Saisie des présences

- **Q** L'en-tête de la colonne Présence existe en double – à revérifier (#783)

### Suivi du groupe

- **L** Sortir les résultats finaux en PDF – à Grégoire : mots des élèves, à froid ; trois modules et plus (#333)

### Suivi › Profil (carte RàI)

- **?** Le même élève reçoit deux paliers RàI différents sur un même écran – à Grégoire : pédagogie, à froid (#744)

### Trimestre › recoupement horaire

- **I** Le devis compte les heures comme si une période durait une heure (#582)

### aide contextuelle

- **L** Le comparateur et l'import inter-trimestre n'ont aucune aide – à Grégoire : choix de produit, à froid ; trois modules et plus (#364)

### analyse longitudinale

- **L** Comparer quatre trimestres pour mesurer l'effet du RàI – à Grégoire : pédagogie, un chantier ; trois modules et plus (#36)

### annotation d'une copie

- **I** Retirer toutes les annotations laisse l'ancien compte d'erreurs (#700)

### anonymisation avant partage

- **L** Décider si l'anonymisation doit rester réversible – à Grégoire : engagement public, un chantier ; trois modules et plus (#591)

### attribution CC

- **L** Des pratiques de Grégoire portent le nom d'un autre enseignant – données déjà écrites (#342)

### aucun écran

- **Q** Retirer 290 lignes de portfolio qu'aucun écran n'appelle (#722)

### banc d'essai

- **Q** Le corpus d'essai produit des notes peu réalistes (#480)

### bibliothèque des pratiques

- **L** Des pratiques inventées portant des prénoms de collègues sont servies – données déjà écrites ; à revérifier (#690)

### bibliothèque des pratiques (SPE)

- **Q** Une structure morte survit avec un seul modèle dedans (#688)

### cadre d'alignement

- **Q** Le cadre décrit un monde que l'application ne montre pas (#589)

### calcul de la note

- **L** La note calculée ne correspond pas à la pratique configurée – trois modules et plus (#465)

### carte d'alignement › Inspecteur

- **I** L'Inspecteur affiche « semaine 3 » au lieu de la date réelle (#695)

### changement d'identifiant d'un cours

- **L** Une fiche ré-identifiée laisse ses productions en arrière – données déjà écrites, trois modules et plus (#346)

### changement de trimestre

- **I** Confirmer que les productions ne changent plus de trimestre (#340)

### courbe d'impact d'une intervention

- **Q** L'effet d'une intervention se mesure depuis le début du trimestre (#729)

### courbe de progression

- **I** Voir sur la courbe l'effet d'une intervention (#245)

### courbes d'intervention

- **I** Un jeton de reprise réécrit P et masque l'effet – à Grégoire : pédagogie, à froid (#241)

### création d'un service

- **I** Le groupe d'origine d'un élève disparaît quand il entre dans un service – à Grégoire : choix de produit, une phrase (#837)

### créer grilles, échelles, cartouches

- **L** Des alertes bloquantes jalonnent les premiers pas – trois modules et plus (#678)

### diagnostic d'une évaluation

- **I** L'application traite comme anomalie un arrondi voulu (#543)

### diagnostics du profil

- **I** Le seuil qui décide qu'un critère est une « force » n'est pas réglable – à Grégoire : pédagogie, à froid (#677)

### divers écrans

- **L** Quatre fragilités éparses : ids, modales jumelles, borne de purge – trois modules et plus (#481)

### documentation

- **Q** Quatre documents de janvier décrivent une app qui a changé (#471)

### documentation enseignants

- **Q** Aucun guide écrit remis aux enseignants – à Grégoire : engagement public, un chantier (#2)

### documentation interne

- **Q** La doc des pratiques date de janvier et cite un fichier disparu (#804)

### dupliquer une grille partagée

- **I** Une grille dupliquée garde l'échelle d'origine – à Grégoire : choix de produit, une phrase (#656)

### dépistage RàI

- **L** Un brouillon compte comme une copie remise et évaluée – à Grégoire : pédagogie, une phrase ; trois modules et plus (#737)

### dépôt de code

- **L** Six dossiers de retours nominatifs de collègues voyagent avec le dépôt – à Grégoire : choix de produit, un chantier ; trois modules et plus (#694)

### enregistrements automatiques

- **L** Deux enregistrements simultanés peuvent s'écraser – trois modules et plus (#522)

### envoi d'un rapport de bug

- **Q** Un rapport envoyé le soir porte la date du lendemain (#812)

### export au format recherche

- **L** L'export ne dit pas où sont placées suffisance et maîtrise – trois modules et plus (#584)

### export des résultats

- **Q** L'export arrondit la note, le profil affiche une décimale (#723)

### fenêtre de suppression d'une ressource

- **Q** La fenêtre affiche les avertissements de la suppression précédente (#653)

### fiche d'un élève dans le Cadre

- **I** La « mesure d'aide » d'un élève ne s'entre que par import CSV – à Grégoire : choix de produit, une phrase (#792)

### fiche d'un élève et assiduité

- **L** Un élève arrivé en cours de trimestre hérite des absences d'avant – à Grégoire : pédagogie, à froid ; données déjà écrites, trois modules et plus (#735)

### fiche d'un élève et profil individuel

- **L** Le programme d'un élève s'affiche vide sur sa fiche – trois modules et plus (#707)

### fichier archivé

- **Q** Un fichier archivé réémettrait l'événement de démarrage (#417)

### filet de tests

- **I** Rien n'empêche un élément du HTML d'être effacé par un rendu JS (#784)

### formulaire d'une production

- **L** Rendre aux artefacts la grille, l'échelle et la cartouche effacées – données déjà écrites (#453)

### graphique de progression

- **I** Le graphique colore ses zones avec une échelle devinée (#575c)

### hors application

- **L** L'historique git contient encore des exports d'élèves réels – à Grégoire : engagement public, à froid ; trois modules et plus (#781)

### import d'un codex

- **L** Repointer les productions vers les grilles renumérotées – données déjà écrites (#454)

### import d'un codex et calendrier

- **L** Six décisions en attente de l'audit du 5 août – à Grégoire : choix de produit, un chantier ; données déjà écrites, trois modules et plus (#393)

### import d'un codex volumineux

- **I** Un import échoue quand l'iPad est presque plein – à revérifier (#334)

### import d'un trimestre historique

- **I** Le trimestre H2024 manque comme point de départ – à Grégoire : ses données, à froid (#35)

### import d'une archive ou d'un partage

- **L** Quatre imports renumérotent les identifiants de quatre façons – trois modules et plus (#627)

### import de travaux

- **I** Assembler les photos multiples d'une même copie (#178)

### import de travaux (doublons)

- **L** Retirer « Renommer pour distinguer » et son legacy – trois modules et plus (#615)

### import des travaux de Léa

- **I** Importer un dossier Léa complet et associer par DA (#177)

### importer une échelle

- **I** Importer une échelle d'un autre trimestre perd sa provenance (#479)

### infobulles d'aide

- **Q** Couvrir d'infobulles la construction de la note et l'Aide – à Grégoire : pédagogie, à froid (#18)

### journal de bord

- **I** La croix du journal est trop petite et rien d'autre ne le ferme (#814)

### le formulaire des jetons d'une pratique

- **L** Sur une pratique née de l'assistant, le formulaire des jetons n'est pas lu – à Grégoire : choix de produit, à froid ; trois modules et plus (#854)

### livraison d'une version

- ✅ **I** Deux sessions peuvent servir deux contenus sous la même adresse (#826)

### matériel de départ

- **Q** Deux fonctions disent « générique » alors qu'elles sèment « de départ » (#689)

### migration des cartouches

- **Q** Deux fonctions de même nom : celle qui paraît publique est morte (#641)

### modifier un élève (ancien formulaire)

- **Q** Modifier un élève par l'ancien chemin planterait (#791)

### module Alignement

- **Q** Aucune carte mentale d'exemple pour la formation – à Grégoire : engagement public, un chantier (#274)

### nettoyage interne

- **L** Retirer les anciens systèmes de pratiques, grilles, échelles – trois modules et plus (#469)

### noms des grilles de départ

- **L** Le nouveau nom n'atteint que les espaces neufs – données déjà écrites ; à revérifier (#682)

### noms du matériel de départ

- **L** Les utilisateurs déjà en place gardent les anciens noms – à Grégoire : arbitrage à préciser ; données déjà écrites (#684)

### note sous pratique par spécifications

- **I** Une pratique par spécifications non configurée donne 50 % à la classe (#713)

### outillage

- **Q** Le comptage des masquages rate la forme la plus courante (#642)

### ouverture d'un codex

- **L** Ouvrir un codex laisse l'ancien espace et double le stockage – à Grégoire : arbitrage à préciser ; données déjà écrites (#336)

### ouverture de l'application

- **I** L'application met 30 à 45 secondes à s'ouvrir – à revérifier (#825)

### ouverture et changement d'onglet

- **L** L'app redessine tous les onglets au démarrage – trois modules et plus (#470)

### ouvrir une évaluation

- **I** L'ouverture échoue sur une attente qui expire pour rien (#652)

### pack de démonstration

- **Q** Le pack démo n'a aucun dossier d'élève annoté – à Grégoire : engagement public, un chantier (#273)

### page d'erreur

- **Q** L'écran d'erreur parle anglais et fait croire que tout est perdu (#799)

### panneau Portfolio

- **L** Restes d'entretien : tri sans effet, heures ambiguës – trois modules et plus (#402)

### partage de grilles et d'échelles

- **L** Le matériel partagé ne peut pas dire qu'il vient de l'orthopédagogie – à Grégoire : arbitrage à préciser ; trois modules et plus (#840)

### partage entre enseignants

- **L** Ouvrir le pilote de partage par fichiers signés – trois modules et plus (#329)

### partout

- **L** Neuf fonctions portent le même nom : la dernière chargée gagne – trois modules et plus (#587)

### pondérations et note finale

- **I** Une évaluation orpheline pèse comme les autres (#483)

### portes terrain

- **Q** Les listes de vérification délèguent tout, faute d'un tri (#488)

### premier lancement

- **Q** Test d'accueil à froid par Grégoire, puis triage – à Grégoire : choix de produit, à froid (#406)

### profil sous pratique en dénotation

- **I** En dénotation, une note chiffrée s'affiche comme un niveau « M » (#719)

### renommer un cours

- **I** Renommer un cours ne rafraîchit pas le nom affiché ailleurs (#472)

### restaurer une archive

- **Q** Le cours ne voyage pas avec la production – à revérifier (#521)

### rituel de commit

- ✅ **Q** Le rappel de l'anti-cache arrive après le commit (#547)

### rituel de release

- ✅ **Q** Une vérification se déclare verte sans rien vérifier (#600)

### rouvrir une archive ou recevoir un partage

- **I** Le remap cherche un format que presque plus personne n'écrit (#663)

### rétroaction EUF imprimée

- **L** La projection EUF reste en dur et nomme un service disparu – à Grégoire : arbitrage à préciser ; trois modules et plus (#668)

### rétroaction générale copiée

- **I** Les tampons récents n'apparaissent jamais dans le bloc Observations – à Grégoire : mots des élèves, à froid (#760)

### saisie directe des résultats

- **L** Saisir des résultats comme dans un tableur – à Grégoire : arbitrage à préciser ; trois modules et plus (#33)

### sauvegarde et restauration

- **L** Protéger par mot de passe une sauvegarde sur clé USB – trois modules et plus (#47)

### skills de Claude Code

- **Q** Le skill des pratiques n'est pas ancré dans le rapport PAREA (#805)

### suite de tests

- **L** 31 sentinelles rougissent sur un simple commentaire – trois modules et plus (#616)

### supprimer un enseignant

- **I** Supprimer un enseignant laisse son profil derrière lui (#474)

### supprimer une ressource

- **L** Une pratique ou production supprimée revient toute seule – à Grégoire : arbitrage à préciser ; trois modules et plus (#463)

### synthèse de rétroaction

- **?** Des rétroactions plus riches que les descriptifs de palette – à Grégoire : mots des élèves, un chantier (#275)

### taux de complétion

- **L** Un « non remis » noté 0 est compté comme remis – à Grégoire : arbitrage à préciser ; trois modules et plus (#738)

### tests automatiques

- **?** La CI ne démarre plus, et son dernier tour complet était rouge – à Grégoire : choix de produit, à froid (#676)

### tests d'intégration

- **L** Tous les tests Chromium échouent sur une liste recopiée 36 fois – trois modules et plus (#487)

### texte copié vers Léa

- **Q** Le texte copié pour l'élève colle les phrases sans séparation – à Grégoire : mots des élèves, à froid (#759)

### toute interface

- **Q** Rien ne détecte une classe CSS employée mais jamais définie (#679)

### toute suppression de données

- **I** Une donnée supprimée continue d'être lue jusqu'au rechargement (#845)

### zoom au trackpad

- **I** Le zoom saccadé vit encore à deux autres endroits – à revérifier (#660)

### échelles d'un trimestre

- **I** Une échelle réparée a disparu de nouveau (#545)

### évaluation archivée

- **I** Le formulaire clignote « modifiable » avant de se verrouiller (#349)

### évaluation d'A2025

- **L** Une éval d'A25 rouvre avec zéro faute et une note gonflée – données déjà écrites ; à revérifier (#350)

### évaluation d'une copie

- **L** La grille de l'orthopédagogue n'a pas de formule « repérées sur total » – à Grégoire : arbitrage à préciser ; trois modules et plus (#835)

### évaluation en cours

- **L** Deux « évaluations en cours » portent le même nom et ne se voient pas – zone protégée, trois modules et plus (#646)

### évaluations d'Hiver 2026

- **L** 44 évaluations pointent vers une échelle qui n'existe nulle part – à Grégoire : arbitrage à préciser ; données déjà écrites ; à revérifier (#544)

---

Tenu par Cowork. Lecture seule sur le dépôt : aucune fiche du BACKLOG n'a été cochée, renumérotée ni réécrite par ce document.
