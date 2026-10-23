# Où en est-on ?

> **Ce fichier répond à une seule question : qu'est-ce qui marche, et qu'est-ce
> qui ne marche pas encore, pour quelqu'un qui utilise l'application ?**
>
> Il est écrit **sans numéros de fiche** et sans vocabulaire de chantier. Les
> numéros (`#612`, `#674`…) sont des étiquettes d'archivage, pas une échelle de
> progression : ils servent aux sessions, pas à Grégoire. Quand il en faut un
> pour retrouver le détail, il est entre parenthèses, en fin de ligne.
>
> **À lire au début de toute session, Cowork ou Claude Code**, avant `CLAUDE.md`
> et `CONSIGNE-DEMARRAGE-PROCHAINE-SESSION.md`, qui eux disent *comment*
> travailler. Celui-ci dit *où on en est*.
>
> **Mis à jour à la fin de chaque journée de travail.** Une ligne ne change
> d'état que si quelqu'un écrit **comment** il l'a vérifié.

📝 **LE 22 OCTOBRE 2026, 20 H 24 : LA 1.215.0 EST EN LIGNE** (tes Nouvelles validées mot pour mot à 18 h 31). *Écrit par Claude Code.*

**Ce qui change pour toi** :
- critère algorithmique : tu nommes ce que tu comptes et ce à quoi tu le rapportes, au singulier et au pluriel ; ces noms passent dans l'évaluation, la phrase de l'élève et son PDF ; un critère créé avant garde « erreur » et « mot » ;
- la phrase de l'élève s'accorde avec n'importe quel nom : « 5 erreurs (3,5 après pondération) sur 400 mots » ; le bilan dit « (3 erreurs) » plutôt que « (3 erreurs annotées) ».

**Vérifié comment** : verdict complet du navigateur vert sur le commit poussé (aucun échec, aucune spec instable, Mac tenu éveillé), puis la mise en ligne constatée chez Netlify sur ce commit.

📝 **LE 22 OCTOBRE 2026, 16 H 30 : LA 1.214.0 EST EN LIGNE** (tes textes validés à 13 h 05, la sixième ligne des Nouvelles resserrée à 13 h 17). *Écrit par Claude Code.*

**Ce qui change pour toi** :
- critère algorithmique : sous la formule, un essai sur quelques copies fictives montre la note et la phrase que l'élève lirait ;
- dans « Apporter mon matériel », tu peux coller ta liste de codes de correction et l'ajouter à un critère algorithmique qui n'a pas encore de codes ;
- avec deux critères algorithmiques dans une grille, l'éditeur et Annoter disent lequel reçoit les codes ;
- une grille en points qui nomme ses niveaux se crée avec son barème ;
- tous les nombres s'écrivent à la française, plus seulement les notes ;
- en mode anonymisé, le vrai DA ne paraît plus ; un trimestre clos refuse d'enregistrer une évaluation ou des présences (les imports, entre autres, y écrivent encore) ; une production employée ne se supprime plus.

**Vérifié comment** : verdict complet du navigateur vert sur le commit poussé (aucun échec, aucune spec instable, Mac tenu éveillé), puis la mise en ligne constatée chez Netlify sur ce commit.

📝 **LE 22 OCTOBRE 2026, 1 H 38 : LA 1.213.0 EST EN LIGNE** (tes Nouvelles validées telles quelles le 21 à 12 h 18). *Écrit par Claude Code.*

**Ce qui change pour toi** :
- une grille neuve porte ses sous-critères et son barème dès sa création ;
- le critère algorithmique sert à toute discipline : ses codes sont ses sous-critères, leur pondération s'applique aux codes que tu poses (l'élève lit « 7 erreurs (5 une fois pondérées) »), et « Partir de la liste du français écrit » donne dix catégories ;
- les notes s'écrivent à la française partout où elles s'affichent et dans le PDF de l'élève : « 89,2 % », une décimale au plus ;
- aux présences, un seul bouton, « Verrouiller la saisie », remplace « Fermer » et la case à cocher.

**Vérifié comment** : Vitest complet vert (9 367 essais) ; le verdict complet dans un vrai WebKit, vert sur le commit poussé (aucun échec, sur secteur, sans veille ; une spec des grilles verte au second essai seulement) ; en ligne chez Netlify, sur ce même commit. Le premier verdict, sur la release, était rouge à cause d'une seule spec qui ne reconnaissait pas l'espace de « 78 % » : la spec était en défaut, pas l'application (tranché par Cowork, corrigé, la spec rougit quand on la rend stricte).

**Ce qui ne marche pas encore** : les pourcentages qui ne sont pas des notes, et les points à l'écran (« × 65% = 55.3 pts » au profil), ne sont pas encore à la française : à ta décision (#1137).

📝 **LE 20 OCTOBRE 2026, SOIR : LA 1.212.0 EST PRÊTE, ELLE PART EN LIGNE SI LE VERDICT COMPLET EST VERT** (tes Nouvelles validées telles quelles à 18 h 59 ; la 1.211.0 est en ligne depuis l'après-midi). *Écrit par Claude Code.*

**Ce qui change pour toi** :
- le PDF d'une grille en points montre son barème ; quand tous les critères ont les mêmes niveaux (ton « Journal de lecture A26 »), il reprend la forme de ta grille d'origine : une colonne par niveau, chaque descripteur avec ses points dessous, les éléments observables sous chaque critère, la description au-dessus, le total au bas ; sinon, chaque critère montre ses tranches, une par ligne, avec leurs points ;
- une grille dont tous les critères ont un barème s'ouvre sans échelle de performance, et sa colonne de pondération s'intitule « Points » ;
- après « Préparer le PDF », la fiche de ta production garde tes choix et enregistre de nouveau ce que tu y changes.

**Vérifié comment** : Vitest complet vert (9 301 essais) ; les specs du PDF, du barème et de la fiche de production vertes dans un vrai WebKit (20 sur 20) ; l'aperçu et le PDF comparés ligne à ligne par un banc ; un essai qui rougit quand on casse chaque règle gardée (le nom des tranches, l'échelle exigée, l'échappement, l'en-tête « Points », la forme d'origine, le total) ; le PDF de ta vraie grille, fait avec ton export de 16 h 16 en mode démo, vu par toi à 18 h 56 (« bien meilleur ») ; relu et accepté par Cowork.

**Ce qui ne marche pas encore** : dans le PDF, les éléments observables sont en gras comme le nom du critère, ta grille d'origine ne les y met pas (#1129). Les points collés au texte par la dissection à niveaux nommés (#1125) et le champ « Nom du critère » trop étroit au Mac (#1126) restent ouverts.

📝 **LE 20 OCTOBRE 2026, APRÈS-MIDI : LA 1.211.0 EST PRÊTE, ELLE PART EN LIGNE SI LE VERDICT COMPLET EST VERT** (tes Nouvelles validées telles quelles). *Écrit par Claude Code.*

**Ce qui change pour toi** :
- dans Grilles de critères, les sous-critères d'un critère holistique ou analytique se modifient : on en ajoute (même le premier), on les renomme, on les réordonne, on les retire ; ils ne deviennent pas des codes d'annotation ;
- l'éditeur de grille prend moins de hauteur : nom, type et description de la grille sur une ligne, chaque tranche du barème sur une ligne, son texte qui s'agrandit avec ce que tu écris ; sur l'iPad en long, le texte passe sous le nom et les points ;
- les cartes de l'accueil portent les textes que tu as arrêtés le 19 oct. (« Importer des copies »).

**Vérifié comment** : Vitest complet vert (9 278 essais) ; les specs des grilles, du barème, de la dissection et de l'aide vertes dans un vrai WebKit, au Mac (1 440 px) et à l'iPad au doigt (820 px) ; un essai qui rougit quand on casse chacun des quatre comportements gardés (la borne de 30, la section vide, les codes d'annotation, les codes sans doublon) ; relu et accepté par Cowork.

**Ce qui ne marche pas encore** : dans une grille apportée dont les niveaux ont un nom (ton « Journal de lecture »), les points des tranches sont restés au bout du texte et le champ Points est vide ; tu peux les déplacer à la main, le champ accepte « 3-4 » (#1125). *Le 22 oct., pas encore en ligne ni relu : une grille apportée à partir de maintenant met ses points dans le champ Points ; ta grille déjà créée, elle, garde les siens dans le texte.* Au Mac, le champ « Nom du critère » est trop étroit (#1126).

🔀 **LE 16 OCTOBRE 2026 AU MATIN : ON TRAVAILLE DANS UN NOUVEAU DÉPÔT, `labo-codex`.** *Écrit par Claude Code le 16 oct. à 7 h 30 (mesuré par `date`).* Rien ne change à l'écran : c'est le même code, à l'octet près.

**Ce qui a changé** :
- l'historique du projet a été purgé des noms et des DA d'élèves, des noms de collègues (passés à l'initiale) et des cinq dossiers qui portaient une cohorte entière ; ton adresse Gmail d'auteur est remplacée par ton adresse GitHub « noreply » ;
- cet historique purgé vit dans un nouveau dépôt GitHub, `labo-codex`, **privé** pour l'instant ; le dossier `Monitorage_v6` de ton Mac en est un clone ;
- l'ancien dépôt est dans `Monitorage_v6-ancien` : on n'y commite plus rien. Tous les numéros de commit ont changé : ceux cités plus bas dans ce fichier renvoient à l'ancien dépôt.

**Vérifié comment** :
- quatre vérifications (arbre identique, chemins retirés, DA, paires, collègues, images, messages, noms de fichiers), 17 sur 17 vertes, chacune avec un témoin qui rougit sur l'ancien historique ;
- les branches et les 22 étiquettes de GitHub sont identiques à la copie vérifiée ;
- Vitest complet vert dans le nouveau dossier (8 910 essais).

**Ce qui te revient** : copier la sauvegarde sur le disque externe ; relier Netlify au nouveau dépôt (ce texte-ci sera le premier commit mis en ligne depuis `labo-codex`, c'est le témoin) ; plus tard, décider quand le dépôt devient public ; vers le 30 octobre, supprimer l'ancien dépôt de GitHub (`plans de travail/PLAN-2026-10-15-nouveau-depot-labo-codex.md`).

✅ **EN LIGNE LE 15 OCTOBRE 2026 AU SOIR** (tout ce qui suit est parti avec la version du soir, après le verdict complet). *Écrit par Claude Code le 15 oct. à 16 h 08 (mesuré par `date`).* **Version en ligne ce soir : 1.202.0** — constatée chez Netlify par le connecteur le 15 oct. à 19 h 50 : déploiement de production « ready » à 19 h 41, `commit_ref` `0c142077`.

**Ce que tu verras** :
- **Ton codex dit vrai** : les tailles de fichier s'affichent comme sur ton appareil ; quand le codex ne s'enregistre pas, le message ne suppose plus un manque d'espace (#994, #993, #1020).
- **Le matériel de départ** porte ses noms partout (« Grille de départ », « Échelle de départ (IDME) », « Cartouche de départ ») ; un nom que tu as modifié n'est pas touché (#683, #684).
- **Note d'un portfolio hybride** : une terminale cochée parmi les obligatoires ne compte plus pour zéro en notes finales ; **en spécifications**, sans seuil réglé, une copie est satisfaisante quand toutes ses spécifications sont respectées (#339, #935).
- **Au profil d'un élève**, la présence et la remise se disent en mots qui décrivent (« Absences rares, quelques travaux manquants »), et les pistes sont au conditionnel (« À la lumière de ces données, il pourrait être pertinent de… »), sans « critique », « fragile » ni « requise ». La carte Mobilisation n'affiche plus M = (A + C) / 2 (#821, #1083).
- « Exporter et archiver » devient « Exporter les travaux » ; en Animation, « Des équipes plus grandes » ajoute au plus une personne par équipe (#1017, #1041).
- **Une production diagnostique** porte l'étiquette « Diagnostique » dans Conception › Productions, la Liste des évaluations et le profil. Elle ne compte plus nulle part : ni dans la note, ni dans la complétion, ni dans les courbes, les flèches et les graphiques du profil. Une nouvelle production ne reprend plus la case de la précédente (#1055).
- **L'Aide dit ce que fait l'application** : plus d'indice de risque R ni d'échelle de risque, une seule règle pour le niveau RàI, l'assiduité sur les séances saisies, les seuils dans une seule table. Une copie plagiée y est décrite famille par famille, selon tes décisions (#1087).
- **Les textes que tu as relus** sont posés :
  - l'aide du Comparateur et de l'import d'un trimestre à l'autre, et une bulle par étape de l'assistant de pratique ;
  - le réglage des seuils dit « « Quelques absences » à partir de »… ;
  - plus aucun chiffre sous le dégradé du tableau de bord ;
  - l'assistant perd « Nombre d'évaluations » et « Tes seuils personnels » (#364, #18).

**En coulisse, rien à l'écran** : le verrou d'une production entière, qui ne protégeait rien, est retiré (le verrou d'une copie ne change pas) (#489).

**Vérifié comment** :
- chaque lot relu par Cowork ;
- les textes d'écran tranchés par toi à la page « Textes à relire » ;
- Vitest complet vert sur le dernier commit (8 910 essais) ;
- les tests neufs éprouvés par ablation : chacun rougit quand on casse ce qu'il garde.
**Pas encore vérifié** : la suite Playwright (le verdict du soir) et l'écran sur ton Safari.

**Tes données** : rien n'est réécrit. Deux choses à savoir :
- des productions créées juste après une production diagnostique ont pu hériter de la case : l'étiquette te les montre, et tu les décoches toi-même (porte terrain de ce soir, `plans de travail/PORTES-TERRAIN-2026-10-15-diagnostique.md`) ;
- les captures déjà écrites gardent leur complétion tant que tu ne cliques pas « Recalculer les captures ».
Une pratique rouverte dans l'assistant garde ses anciens seuils et son nombre d'évaluations.

**Ce qui attend** :
- l'encadré de l'épreuve uniforme dans le PDF de l'élève (#668) et le bulletin d'une page (#333) : tes mots sont acceptés, ils iront aux lots qui construiront ces PDF ;
- le principe « l'application ne prescrit pas » reste à appliquer à la carte RàI, à son aide et au guide RàI (#1088) ;
- le nom d'un élève peut partir dans le rapport de bogue s'il a été cliqué : relis le rapport avant de l'envoyer (#1075) ;
- l'export anonymisé (#1060, #1074).

**Ce qui te revient** : les mots de remplacement des phrases qui prescrivent encore (#1088) ; la porte terrain du diagnostic, après l'envoi.

✅ **EN LIGNE LE 12 OCTOBRE 2026 À 15 h 13 : 1.200.0 (mesurée chez Netlify sur `239de979` ; verdict complet vert) — MOINS DE FENÊTRES QUI BLOQUENT**

**Ce que tu verras** (les mots de tes Nouvelles) :
- Créer un trimestre, un cours ou un groupe-cours, ou importer des étudiant·es : les messages s'affichent dans l'application, sans bloquer l'écran (#678).
- Supprimer un cours qui porte encore des données : la fenêtre dit ce qui s'y rattache (#678).
- Les boutons principaux de l'Accueil, de l'aide et de la visite guidée ont retrouvé leur couleur, et les en-têtes du profil d'un·e étudiant·e sont alignés (#679).
- Quand une grille, une échelle ou une cartouche change d'identifiant à l'import, tout ce qui la désigne la suit (#627).

**En coulisse, rien à l'écran** : deux écritures qui se marchaient dessus en entrant dans les cartouches ne se perdent plus ; un onglet qui change de trimestre ne ressert plus les filtres de l'autre ; 61 fonctions mortes retirées ; les bibliothèques et le lecteur PDF se rechargent quand ils changent ; un garde-fou empêche le code de devenir plus compliqué qu'aujourd'hui (#522, #596, #469, #602, #1051).

**Vérifié comment** : chaque lot relu par Cowork ; des captures de l'Accueil, de la visite guidée, du profil et de la visionneuse, dans Chrome et Safari, à la largeur d'un ordinateur et d'un iPad en portrait, regardées par Cowork ; Vitest complet et la suite Playwright complète verts sur la version poussée.

**Tes données** : rien n'est réécrit. Une cartouche importée avant aujourd'hui, dont l'échelle avait été renommée, garde son ancien lien ; dans un onglet déjà ouvert, le filtre de production et la dernière copie ouverte ne seront pas restaurés une fois.

**Ce qui attend** : les fenêtres qui bloquent sur les deux autres parcours de tes chroniques (grilles, échelles, cartouches ; importer des productions), et, sur iPad en portrait, une notification qui recouvre la bulle de la visite guidée (#678).

**Ce qui te revient** : cinq noms protégés qui ne servent plus, et les deux points d'accroche de la navigation ; les deux demandent de toucher une zone protégée (#1052, #1053, Cowork te les soumettra).

✅ **EN LIGNE LE 11 OCTOBRE 2026 À 22 h 11 : 1.199.0 (mesurée chez Netlify sur `437d48ec` ; verdict complet vert) — RIEN D'INVENTÉ, RIEN DE PERDU**

**Ce que tu verras** (les mots de tes Nouvelles) :
- « Recalculer les captures » ne fait plus perdre les mesures avant et après des interventions : le bouton peut de nouveau servir. Dans le Cadre, les noms des groupes-cours et le compteur « X/5 configurés » sont à jour, et « Clore » n'est plus proposé sur le trimestre en cours (#1049, #472, #475, #1018).
- Ajouter un niveau à une échelle ne pose plus de valeurs à ta place : le niveau attend que tu aies rempli son code, son nom, ses bornes et sa valeur (#574).
- Dans la fiche d'un élève (Cadre › Trimestre), la mesure d'aide se coche maintenant à côté de SA (#792).
- Sur les courbes d'intervention du tableau de bord, une courbe pointillée montre P sans l'apport des reprises (#241).
- Après un import, la carte importée est mise en évidence, et une copie faite par « Dupliquer » ne se confond plus avec son original (#793).
- Une grille qu'emploient des évaluations ne peut plus être supprimée depuis la Conception.
- Supprimer un trimestre se fait dans les fenêtres de l'application, et une grille dont les pondérations ne font pas 100 % te le signale (#1037, #483).

**Vérifié comment** : chaque lot relu par Cowork en relecture adverse ; mots d'écran et Nouvelles tranchés par toi le 11 oct. ; Vitest complet et suite Playwright complète vertes sur le code poussé (un premier passage rouge venait de trois tests restés sur l'ancien comportement, alignés sans toucher à l'application).

**Tes données** : rien n'est réécrit ; la série s'est faite sans aucune écriture dans des données déjà enregistrées chez toi. Si l'ancien « Recalculer » a déjà effacé des captures, elles ne reviennent pas.

**Ce qui te revient** : une dizaine de décisions, marquées « À Grégoire » au BACKLOG le 11 oct. (entre autres : l'élève déjà inscrit à un autre cours dans un service, la lecture « théorie + labo » du devis, les repères d'une échelle embarquée, le nettoyage des fichiers d'avant le 8 août).

✅ **EN LIGNE LE 11 OCTOBRE 2026 À 11 h 26 : 1.198.0 (mesurée chez Netlify sur `21228642` ; verdict complet vert) — MOINS DE MÉMOIRE, DES COMPTES JUSTES**

**Ce que tu verras** :
- « Exporter une sélection » et « Ouvrir une archive… » ne chargent plus tout le fichier en mémoire : l'iPad est ménagé (#991, #1025).
- Sous Chrome, une mise à jour du codex longue à préparer affiche « Ton codex est prêt » et demande un clic sur « Enregistrer », au lieu de finir sur « Codex non mis à jour » ; la fenêtre dit maintenant « Appuie sur » (#995).
- Le taux de remise du dernier travail d'un groupe, dans le suivi hebdomadaire, ne dépasse plus 100 % (#726) ; l'étape 3 d'un groupe-cours compte les élèves du seul cours choisi (#925).
- Importer une sélection depuis une sauvegarde récente propose ses grilles, échelles, pratiques et cartouches, rangées dans le trimestre ouvert (#1046).
- Onze gestes plus rares (import par cases, archives) ne s'effacent plus l'un l'autre quand ils se suivent de près (#522).

**Vérifié comment** : mesures au banc sous WebKit (pic de mémoire de 6,4 Go à celui du repos pour l'export, de 1,3 Go à celui du repos pour l'ouverture d'archive), vrai Chrome pour le toucher (refus reproduit avant, fenêtre ouverte après), bancs d'aller-retour et de comportement relus par Cowork ; Vitest complet et suite Playwright complète vertes sur le commit poussé.

**Tes données** : rien n'est réécrit. Les relevés hebdomadaires déjà capturés gardent leur ancien taux de remise ; seuls les nouveaux suivent la règle corrigée.

**Ce qui attend, sur une branche (`lot8-cadre`, relue par Cowork, en ligne demain)** : ⚠ **« Recalculer les captures » efface encore les captures d'intervention dans la version en ligne : ne clique pas sur ce bouton d'ici demain** (#1049) ; et les petits défauts du Cadre (« Clore » sur le trimestre actif, noms des groupes-cours, compteur « X/5 », « mon profil », saisie des présences sur l'iPad).

**Ce qui te revient** : un formatif compte dans C (tranché ce matin, rien changé) ; effacer « mon profil » quand on le supprime (#474, dans la liste des décisions de Cowork).

✅ **EN LIGNE LE 10 OCTOBRE 2026 À 17 h 22 : 1.197.0 (mesurée chez Netlify sur `16e3cbe5` ; verdict complet vert) — RIEN NE SE PERD EN SILENCE**

**Ce que tu verras** :
- Rouvrir une pratique de notation dans l'assistant, puis l'enregistrer, ne lui fait plus perdre ce que tu avais réglé au formulaire : ses jetons, son réglage « notes finales », l'affichage de la note en lettre (#938).
- Deux gestes faits coup sur coup ne s'effacent plus l'un l'autre : sur les cours (retirer, ajouter, importer, déposer), la copie d'une cartouche d'un autre trimestre, les métadonnées d'une ressource, la capture d'une séance, le réimport de tampons, la fusion des copies d'un codex (#522).
- Ce qu'on supprime disparaît aussitôt de l'écran, sans attendre un rechargement (#845).

**Vérifié comment** : des bancs seulement — la vraie base de l'application sous un stockage simulé qui copie chaque écriture : pratique créée par l'assistant, réglée au formulaire, rouverte par l'assistant, rien de perdu dans les quatre familles ; deux gestes lancés ensemble, les deux effets restent ; une grosse clé supprimée n'est plus lue. Chaque correctif retiré fait échouer son banc. Verdict complet au navigateur vert sur le commit publié. **Pas vérifié** : sur tes vraies pratiques (le geste ci-dessous).

**Tes données** : rien n'est réécrit. Une pratique rééditée par l'assistant avant ce lot a pu perdre ses jetons ou son réglage « notes finales » ; elle ne les retrouve pas seule. **Ton geste, une fois** : Conception › Pratiques de notation, la carte de ta pratique active doit afficher « N jetons » si tu en avais réglé, et « notes finalisées » si tu étais passé en notes finales ; s'il en manque une, remets-la au formulaire.

**Ce qui reste** : côté sessions, sans toi : onze gestes plus rares (import sélectif, Réserve) ne sont pas encore protégés contre deux clics rapides (#522).

✅ **EN LIGNE LE 10 OCTOBRE 2026 : 1.195.0 puis 1.196.0 (la dernière publiée à 14 h 13, mesurée chez Netlify sur `9588f5b2` ; verdict complet vert sur chacune) — CE QU'ON IMPORTE D'UNE ANCIENNE SAUVEGARDE ARRIVE ENTIER ET BIEN RANGÉ ; CE QU'ON REÇOIT D'UN COLLÈGUE RESTE DU TEXTE**

**Ce que tu verras** :
- « Importer » une sélection depuis une ancienne sauvegarde : les cartouches restent liées à leur grille et apparaissent dans le trimestre ouvert ; une cartouche déjà là n'entre plus en double, et le bilan le dit (« N cartouche(s) déjà présente(s) à l'identique, non ajoutée(s) ») ; la méthode de calcul d'une pratique et les règles d'une production arrivent complètes (#664, #952, #954, #655).
- Une grille d'un collègue qui porte le même nom qu'une des tiennes, mais pas les mêmes critères, ne s'y rattache pas.
- 1.195.0 : un nom reçu d'un collègue (grille, échelle, cartouche, pratique, tampon) s'affiche toujours comme du texte, même importé avant (#467, #585).

**Vérifié comment** : des bancs seulement — le vrai geste d'import (fichier déposé, cases cochées, « Importer la sélection ») sur un espace fictif : liens suivis, cartouche identique écartée au premier et au second passage, rien sous une clé hors trimestre ; chaque correctif retiré fait échouer son banc ; une ancienne copie de secours (1.172.0) s'ouvre avec ses grilles entières ; verdict complet au navigateur vert sur le commit publié. **Pas vérifié** : un import sélectif sur tes vrais fichiers.

**Tes données** : rien n'est réécrit. Les cartouches déjà importées en double, ou rangées hors du trimestre par une version d'avant, restent où elles sont.

**Ce qui reste** : côté sessions, sans toi : l'import sélectif ne propose pas encore les grilles d'une sauvegarde récente rangées par trimestre (#1046).

---

✅ **EN LIGNE LE 9 OCTOBRE 2026 : 1.193.0 puis 1.194.0 (la dernière publiée à 19 h 08, mesurée chez Netlify sur `9c7ebb26` ; verdict complet vert sur chacune) — L'ARCHIVE D'UN GROUPE N'EMPORTE QUE CE GROUPE ; « VÉRIFIER » NE DEMANDE PLUS LA PERMISSION DE MODIFIER**

**Ce que tu verras** :
- Archiver un groupe : l'archive n'emporte plus que ce groupe (rien des élèves d'un autre groupe), et elle garde maintenant ses rencontres et son assiduité (#1021, #956).
- Dans Chrome, « Vérifier » une archive demande seulement la lecture du dossier ; « Archiver… » demande toujours l'écriture (#1005).
- En démo, choisir une grille de dépistage ne touche plus ta préférence réelle (#829).
- 1.193.0 : la barre de la carte d'alignement dit ses boutons en mots, à 44 px au doigt.

**Vérifié comment** : des bancs seulement — un espace fictif à deux groupes, chaque famille par élève remplie : 13 clés partaient avec l'autre groupe avant, aucune après ; une archive d'avant se relit ; chaque correctif retiré fait échouer son banc ; verdict complet au navigateur vert sur le commit publié. **Pas vérifié** : « Vérifier » dans ton Chrome, sur ton vrai dossier (porte due).

**Tes données** : rien n'est réécrit. Les archives déjà faites gardent ce qu'elles ont emporté. Limite gardée : une rencontre qui réunit des élèves de deux groupes part dans l'archive de chacun avec son texte libre entier (#1045).

**Ce qui reste** : les portes dues chez toi (#1005, #660, #915, #1012). Côté sessions, sans toi : que tout nom ou texte reçu de l'extérieur (partage, import, archive) s'affiche sans pouvoir s'exécuter (#467, #585).

---

✅ **EN LIGNE LE 9 OCTOBRE 2026 : 1.192.2 (publiée à 8 h 53, mesurée chez Netlify sur `8761a3fe` ; verdict complet vert) — L'EXPORT DU PLAN DIT VRAI ; LE CHAMP « SEMAINE » DES LEÇONS À OBJECTIFS REMARCHE**

**Ce que tu verras** :
- Conception › Carte d'alignement, « Exporter le plan… » : chaque production porte sa vraie échelle (au lieu de « Aucune échelle » partout), et un bloc qui ne sert que les objectifs d'une autre leçon (un clone, un bloc déplacé) porte « Aucun objectif de cette leçon » au lieu d'une case vide, dans le texte, le Markdown et le tableau.
- Dans l'Inspecteur d'une leçon qui porte des objectifs, le champ « Semaine » fonctionne de nouveau (il ne réagissait plus).
- Sans geste visible : la carte démo fait cocher à chaque évaluation l'objectif de sa leçon (plus de lien « se vérifie par ») ; les pastilles sont lues comme des images nommées par un lecteur d'écran ; les pastilles d'une grande carte se recalculent environ dix fois plus vite.

**Vérifié comment** : des bancs seulement — Vitest complet vert (700 fichiers) ; les essais au navigateur (WebKit) de la carte, 67 sur 67, dont la semaine présélectionnée du modèle IA ; chaque correctif retiré fait échouer son banc (20 sur 20) ; verdict complet au navigateur vert sur le commit publié. **Pas vérifié** : l'export sur ta propre carte ; un lecteur d'écran réel.

**Tes données** : rien n'est réécrit. Une démo déjà installée garde l'ancienne carte (avec ses liens « se vérifie par ») : seule une démo installée de neuf montre le nouveau geste. Assumé, non réparé.

**Ce qui reste** : le reste de la barre de la carte, icône par icône, avec toi (lot 3). La sonde envoyée à Mathieu (7 oct.) est toujours attendue.

---

✅ **EN LIGNE LE 8 OCTOBRE 2026 : 1.192.0 puis 1.192.1 (la dernière publiée à 22 h 30, mesurée chez Netlify sur `554508a9` ; verdict complet vert sur chacune) — UN MENU « VUE » SUR LA CARTE D'ALIGNEMENT ; LES DATES DU TRIMESTRE AU PLANIFICATEUR**

**Ce que tu verras** :
- Conception › Carte d'alignement : un menu « Vue » réunit « Vue plein écran », « Recentrer la carte », « Tout voir », la couleur du fond et, en bas, une ligne « Raccourcis clavier » qui ouvre la palette des raccourcis (déplaçable, repliable, fermée par ×). Le menu tient dans sa largeur, sous Chrome comme sous Safari (1.192.1). Recentrer se fait avec la touche R (au lieu de ⌘1, que Chrome et Safari prennent pour changer d'onglet). Les trois icônes, la palette de fond et l'icône des raccourcis ont quitté la barre.
- Le planificateur affiche « PLANIFICATEUR · du … au … » d'après « Début du trimestre » et « Fin du trimestre » du Cadre ; sans elles, une invitation dont le lien ouvre Cadre › Trimestre (en sortant du plein écran au besoin). La réserve « Non planifié » est toujours sous la grille.

**Vérifié comment** : des bancs seulement — un essai au navigateur (WebKit) par raccourci affiché, et une liste qui ne peut pas grandir sans son essai ; le fond qui se garde au rechargement ; les dates, l'invitation et son lien, en plein écran compris ; Vitest complet vert ; chaque correctif retiré fait échouer son banc ; verdict complet au navigateur vert sur le commit publié. **Pas vérifié** : au vrai clavier de Chrome et de Safari, qu'aucun raccourci affiché n'est pris par le navigateur (⌘D, ⌘0, ⌘+) ; les 44 px au doigt sur ton iPad.

**Tes données** : rien n'est réécrit. Si tu avais mis la réserve à gauche, ce réglage reste enregistré ; il n'est simplement plus lu.

**Ce qui reste** : le reste de la barre de la carte, icône par icône, avec toi (lot 3) ; puis les cinq fiches inscrites au chantier (l'export du plan qui laisse « Objectifs servis » vide, la démo qui enseigne l'ancien geste…) (lot 4).

---

✅ **EN LIGNE LE 7 OCTOBRE 2026 : 1.188.0, 1.188.1, 1.188.2, 1.189.0 (la dernière publiée à 17 h 23, mesurée chez Netlify sur `9f9c304d` ; verdict complet vert sur chacune) — CRÉER UN TRIMESTRE PAR SON FORMULAIRE ; FORMER DES ÉQUIPES EN CLASSE**

**Ce que tu verras** :
- « + Nouveau trimestre », dans la bibliothèque des trimestres, ouvre la fiche du Cadre en création : plus de petite fenêtre à remplir ni de message d'alerte. « Annuler », à côté de « Créer le trimestre », ne crée rien et ramène la fiche du trimestre actif.
- Dans Suivi › Animation, une barre d'outils à gauche (Questions flash, Tirage au sort, Équipes) ; le générateur forme des équipes de 2, 3 ou 4 dans la liste du tirage, écarte les absents du jour, te demande quoi faire du reste et s'il faut éviter de refaire les mêmes.
- Le reste ne se voit pas : une suppression qui échoue le dit au lieu de revenir au rechargement ; une copie importée sur l'iPad au retour d'une mise en arrière-plan ne se perd plus ; la liste des cours ne se réécrit plus à chaque ouverture.

**Vérifié comment** : tes deux portes passées le 7 (création d'un trimestre et « Annuler » ; former et refaire des équipes sans les retenir), rapportées par Cowork. Pour le reste, des bancs seulement : essais au navigateur (WebKit) et Vitest complet verts, chaque correctif retiré fait échouer son banc ; verdict complet au navigateur vert sur chaque commit publié. **Pas vérifié** : la copie sur ton iPad après une mise en arrière-plan.

**Tes données** : rien n'est réécrit. « Créer le trimestre » active toujours ce qu'il crée.

**Ce qui reste** : les autres petites fenêtres de la bibliothèque des trimestres (hors création) (#1037) ; dans un très petit groupe, « Des équipes plus grandes » peut empiler tout le reste sur une seule équipe (#1041) ; les élèves que Mathieu ne voit pas à l'import (#1038, sonde envoyée, résultat attendu).

**La suite** : « Écraser » une échelle, une grille ou une cartouche du même nom, quand une évaluation l'emploie (#967).

---

✅ **EN LIGNE EN 1.184.0 (4 OCTOBRE 2026 ; en ligne depuis 21 h 04, mesuré chez Netlify : déploiement de production prêt sur `59018be9` ; tes mots) — FAIRE REVENIR UN TRIMESTRE ARCHIVÉ**

**Ce que tu verras** : dans Réglages › Données › Archives, la ligne « Trimestre entier » d'une archive vérifiée offre « Faire revenir ». Le trimestre revient tel qu'il a été archivé, clos, avec ses copies ; les autres trimestres, les cours et les réglages ne bougent pas. S'il est déjà là : « … est déjà dans l'application : ouvre-le depuis la bibliothèque des trimestres. Rien n'a été écrit. »

**Vérifié comment** : un banc sur un espace fictif (archiver, supprimer, faire évoluer l'espace, faire revenir) : le trimestre revient identique, et seule la liste des trimestres change hors de lui ; chaque refus et chaque échec provoqué laisse l'espace tel qu'avant ; écrire une donnée partagée, écrire la liste des trimestres trop tôt ou oublier de recomparer une copie fait échouer le banc. Le vrai bouton à la largeur d'un iPad, sous le moteur de Safari. Mémoire sur 1,15 Go de copies : 210 Mo, 2,3 s. Vérification complète au navigateur verte sur le commit livré. **Pas vérifié** : ton Safari, ton iPad, Chrome avec un vrai dossier, une vraie archive de l'hiver 2026.

**Tes données** : rien n'est écrit chez toi ; aucun trimestre n'a été archivé ni ramené. **Pas fait** : les vignettes des copies revenues (trop lent, inscrit).

**Ta vérification** : aucune maintenant ; la porte viendra avec « Renvoyer aux archives » (E3), quand l'hiver 2026 sera clos et archivé.

---

✅ **EN LIGNE EN 1.183.0 (4 OCTOBRE 2026 ; en ligne depuis 18 h 31, mesuré chez Netlify : déploiement de production prêt sur `143a22ef` ; tes mots, deux retouches) — ARCHIVER UN TRIMESTRE CLOS TOUT ENTIER**

**Ce que tu verras** : dans la bibliothèque des trimestres, le menu ⋮ d'un trimestre clos offre « Archiver le trimestre… ». Une fenêtre dit ce qui part (étudiant·es, groupes, copies, dont celles de la corbeille, et la taille) et que rien n'est retiré de l'application. Le fichier se range hors de l'application ; dans Réglages › Données › Archives, sa ligne dit « Trimestre entier », et « Vérifier » relit chaque copie et les données du trimestre. Les trois boutons « Exporter les données », qui ne s'affichaient nulle part, sont retirés : tu ne verras rien changer.

**Vérifié comment** : un banc sur un trimestre fictif clos (deux groupes, un doubleur, une copie à la corbeille, à côté d'un trimestre en cours) relit l'archive : exactement les données de ce trimestre et ses séances, toutes ses copies, chaque empreinte juste, aucune donnée partagée ni d'un autre trimestre, rien d'écrit dans les données. Faire entrer une donnée partagée ou oublier la copie de la corbeille fait échouer le banc. « Vérifier » la dit intacte, puis incomplète après un octet changé. Le vrai menu et la vraie fenêtre, à la largeur d'un iPad, sous le moteur de Safari. Mémoire sur 1,1 Go de copies : la page passe de 161 à 215 Mo, 5,4 s. Vérification complète au navigateur verte sur le commit livré. **Pas vérifié** : un vrai téléchargement dans ton Safari, ton iPad, Chrome avec un vrai dossier.

**Tes données** : rien n'est écrit ; seule la liste des archives gagne une ligne. Aucun trimestre n'a été archivé chez toi.

**Ta vérification** : une porte, pour le jour où tu clos l'hiver 2026 : `plans de travail/PORTES-TERRAIN-2026-10-04-e1-archiver-trimestre.md` (Cowork publie la version à cocher). Clore, archiver dans Safari sur le Mac, ranger le fichier, « Vérifier ».

**La suite** : emprunter un trimestre depuis son archive (E2), puis le rendre (E3).

---

(précédent) ✅ **EN LIGNE EN 1.182.0 (4 OCTOBRE 2026 ; en ligne depuis 16 h 01, mesuré chez Netlify : déploiement de production prêt sur `af586f45` ; tes cinq choix) — UN TRIMESTRE TERMINÉ SE DIT « CLOS »**

**Ce que tu verras** : dans la bibliothèque des trimestres, le badge « Clos », les boutons « Clore » et « Rouvrir », la section « Trimestres clos » ; le bandeau « LECTURE SEULE — Trimestre clos » ; l'aide « Qu'est-ce que clore un trimestre ? » avec ta phrase (« Clore ne libère aucun espace »). Clore un trimestre ne télécharge plus de fichier. Sous la liste des archives : « liste mise à jour le … » ; l'aide de la carte Archives nomme « Vérifier » et « Faire revenir ». « Archivé » ne désigne plus que ce qui est déposé dans tes Archives.

**Vérifié comment** : un essai lit tous les textes que tu lis sur ces écrans et refuse « archiv » pour l'état gelé ; un autre clôt un trimestre et constate qu'aucun fichier n'est fabriqué ; un troisième rejoue un refus de clôture et constate que la fenêtre dit son motif, pas « undefined ». Remettre un ancien mot, le téléchargement ou « undefined » fait échouer ces essais (douze fois). Vérification complète au navigateur verte sur le commit livré. **Pas vérifié** : ton écran, ton iPad.

**Tes données** : rien n'est réécrit. Les fichiers déjà téléchargés à une clôture passée restent illisibles par l'application ; les trois boutons « Exporter les données » de la bibliothèque en produisent encore (à trancher).

**La suite** : non plus « alléger un groupe », mais ton nouveau but : emprunter et rendre un trimestre entier, comme un livre. Une mesure, sans rien écrire, dit ce qui existe et ce qui manque ; rien ne commence avant ta décision.

---

(précédent) ✅ **EN LIGNE EN 1.181.0 (4 OCTOBRE 2026 ; en ligne depuis 13 h 57, mesuré chez Netlify : déploiement de production prêt sur `a3dbb81d` ; tes mots, une retouche) — « FAIRE REVENIR » LES COPIES D'UNE ARCHIVE VÉRIFIÉE**

**Ce que tu verras** : dans Réglages › Données › Archives, une archive « Vérifiée le … » porte un bouton « Faire revenir ». Tu désignes le fichier de l'archive (ou ton dossier des archives dans Chrome), une fenêtre dit ce qui va se passer, puis un bilan en nombres : copies revenues, déjà là, changées depuis l'archive, sans fiche, d'étudiant·es supprimé·es, et en tête les copies abîmées dans l'archive s'il y en a. Une copie dite « manquante » dont le fichier est là redevient présente.

**Vérifié comment** : essais au navigateur (WebKit) sur la démo, par le vrai bouton : une copie par cas, chacune donne ce qu'elle doit ; les copies revenues sont identiques octet pour octet à l'archive ; rien d'autre ne bouge dans l'espace ; ton codex ne réclame ensuite que les copies qui manquent vraiment ; à la largeur de l'iPad, par de vrais clics. Retirer la recomparaison de l'empreinte, ou laisser une copie changée être remplacée, fait échouer les essais. Sur une archive de 607 Mo (205 copies), la mémoire de la page monte de 39 Mo. Vérification complète au navigateur verte sur le commit livré. **Pas vérifié** : ton écran, ton iPad, une de tes vraies archives.

**Tes données** : rien n'est remplacé ni effacé ; le geste n'écrit que les copies qui manquent, et le statut « présent » de leurs fiches. Ta copie de l'hiver 2026 marquée « manquante » : son fichier est dans l'archive du groupe 00008 (lu sans rien écrire) ; ton geste la remettra présente.

**La suite** : les mots « clos » partout, puis alléger un groupe archivé.

---

(précédent) ✅ **EN LIGNE EN 1.180.0 (4 OCTOBRE 2026 ; en ligne depuis 12 h 15, mesuré chez Netlify : déploiement de production prêt sur `bc36e957` ; tes trois décisions de ce matin) — UN·E ÉTUDIANT·E SUPPRIMÉ·E NE PARAÎT PLUS, ET SES DONNÉES NE PARTENT PLUS**

**Ce que tu verras** : quand tu supprimes un·e étudiant·e dans le Cadre, ses copies quittent la Liste des évaluations (le compte « N résultat(s) » baisse d'autant), « Annoter et évaluer » et la grille d'« Exporter et archiver ». L'export pour Léa, l'export pour la recherche et les seuils « en attente » du tableau de bord l'écartent. Si toutes les copies d'un groupe sont celles d'élèves supprimés, « Annoter et évaluer » le dit avec ta phrase.

**Vérifié comment** : essai au navigateur (WebKit) sur la démo, par le vrai bouton « Supprimer » : l'élève disparaît de chacune de ces vues et sorties ; ses copies, évaluations et présences restent en base ; le codex les écrit ; réinscrit par le formulaire du Cadre, il revient avec tout. Ramener chaque vue à l'ancienne lecture fait échouer l'essai (sept fois). Vérification complète au navigateur verte sur le commit livré.

**Tes données** : rien n'est effacé ni réécrit. Ce qui garde emporte tout : ton codex, tes archives, et l'export ZIP « Toutes / Tous » d'« Exporter et archiver » (c'est lui qui permet ensuite de retirer les copies du navigateur).

**Ce qui reste** : un·e étudiant·e supprimé·e avant la version du 2 octobre (1.174.4) n'a pas laissé de trace et reste visible. Le compte « N fichiers en stock » compte encore ses copies, puisqu'elles sont toujours dans le navigateur : il n'a pas été changé (#1013).

**La suite** : le chantier des archives, en commençant par « faire revenir des copies ».

✅ **EN LIGNE EN 1.179.0 (4 OCTOBRE 2026 ; en ligne depuis 10 h 30, mesuré chez Netlify : déploiement de production prêt sur `3bca545f` ; ton texte tel quel et le bouton « Cocher la case », acceptés ce matin) — LE SIGNAL QUAND LES CONSIGNES NE SEMBLENT PAS TRANSMISES**

**Ce que tu verras** : quand tu ouvres l'évaluation d'une copie dont le groupe a la case « Consignes transmises » décochée pour cette production, un bandeau le dit sous le nom de l'élève, à chaque ouverture, et nomme ce que la case retire : la production n'est pas au calendrier, et ses copies ne comptent pas dans les courbes de progression. Le bouton « Cocher la case » la coche pour ce groupe ; le bandeau part. Rien n'est coché sans ton clic. Le bandeau ne nomme aucun élève.

**Vérifié comment** : essai au navigateur (Safari, largeur iPad) : case décochée, le bandeau paraît, aussi en passant à l'élève suivant ; le bouton coche la case (la date reste) et le bandeau part ; case cochée, rien ; un autre groupe décoché, rien. Retirer le bandeau du code fait échouer l'essai. Vérification complète au navigateur verte sur le commit qui est parti, sans aucun essai instable.

**Tes données** : rien n'y est écrit sans ton clic. Si la production du 1er octobre a encore sa case décochée chez toi (non mesuré depuis), ses copies afficheront le bandeau à la prochaine ouverture.

**Ce qui reste** : l'aide de la fiche production dit que la case décochée retire la production « des indices C et P » ; mesuré ce matin, C, P et la note ne bougent sous aucune pratique. Corriger l'aide, ou faire que C l'écarte vraiment : c'est à toi (#1016).

**La suite** : ce qui reste visible d'un élève supprimé (#1013), avant les archives.

🔧 **OUTILLAGE, 4 OCTOBRE 2026, 8 h 20 (rien ne change dans l'application ; 1.178.0 reste en ligne) — LA VÉRIFICATION COMPLÈTE NE S'ENDORT PLUS ET NE FIGE PLUS LE MAC**

**Ce qui change pour toi** : la vérification complète au navigateur (les ~45 min avant un envoi) rallume l'écran et tient le Mac éveillé elle-même, quel que soit celui qui la lance. Si la mémoire s'emballe pendant qu'elle tourne, elle s'arrête d'elle-même et dit « non jugé : mémoire » plutôt que de laisser le Mac se figer jusqu'au bouton, comme la nuit du 1er octobre. Rien n'est envoyé dans ce cas.

**Vérifié comment** : lancée écran éteint ce matin : l'écran s'est rallumé en 4 s, aucune veille pendant 54 min, mémoire stable, verdict vert. Seuil de mémoire abaissé exprès : la vérification s'est arrêtée au deuxième relevé et l'a dit.

**Ce qui reste** : fermer le couvercle du portable l'endort quand même ; rien ne l'empêche.

**La suite** : le signal au début de l'évaluation (#1010), puis ce qui reste visible d'un élève supprimé (#1013), avant les archives.

✅ **EN LIGNE EN 1.178.0 (4 OCTOBRE 2026 ; en ligne depuis 1 h 20, mesuré chez Netlify : déploiement de production prêt sur `a74bd2b7` ; relue par Cowork, verte sans correction de code ; tes mots, avec le pluriel de la cible et sans le nombre d'évaluations, et ta ligne des « Nouvelles » posés tels que tu les as acceptés à 0 h 07) — LE CODEX PROPOSÉ AVANT DE RETIRER UNE LIGNE QUI PORTE DES NOTES**

**Ce que tu verras** : dans la Conception, quand tu retires un critère, un sous-critère ou un niveau d'échelle qu'au moins une évaluation emploie, ou une cible de dénotation déjà cochée, la fenêtre « Mettre ton codex à jour avant de supprimer ? » paraît avant la question habituelle, si ton codex n'est pas à jour. « Annuler » ne retire rien. Une ligne qu'aucune évaluation n'emploie, ou une ligne neuve, se retire comme avant.

**Vérifié comment** : au navigateur (WebKit), par les vrais boutons : un critère employé (la fenêtre, « Annuler » ne retire rien et n'écrit rien), un critère que personne n'emploie (aucune fenêtre), une cible cochée (la fenêtre avant la question que tu connais), deux cibles cochées retirées d'un coup dans l'assistant (la phrase au pluriel). Un banc par famille, quatorze mutations, quatorze rouges. Vitest complet vert (8 025). Verdict complet au navigateur : aucun échec, 7 tests verts au second essai (un seul déjà vu la veille).

**Ta vérification** : une porte courte, en fenêtre privée de Chrome, sur les données démo : `plans de travail/PORTES-TERRAIN-2026-10-04-1007-lignes-notes.md` (Cowork publie la version à cocher). Retirer « Nuance » de « Grille-4 » (la fenêtre, puis « Annuler ») ; ajouter un critère et le retirer (aucune fenêtre).

**Le chantier « un codex avant de supprimer » est terminé.** Reste une mesure à part : savoir si un type de travail ou un forfait des pratiques par spécifications porte des notes (#1015).

**La suite** : le garde-éveil de la vérification complète (#1008), sur une consigne de Cowork.

✅ **EN LIGNE EN 1.177.1 (3 OCTOBRE 2026 ; en ligne depuis 18 h 58, mesuré chez Netlify sur `d6cfe732`) — LE BOUTON « ✓ N pér. » DE LA SAISIE DES PRÉSENCES**

**Ce que tu verras** : dans Suivi › Saisie des présences, le bouton qui met tout le monde présent dit « ✓ 2 pér. » (le nombre de la séance) ; son infobulle et le lecteur d'écran disent « Mettre tout le monde présent (2 périodes) ». Le bouton ↻ dit « Réinitialiser (tout le monde absent) ».

**Vérifié comment** : mesuré au navigateur (WebKit) à 1024, 768 et 390 px : une ligne partout (l'ancien en prenait deux sur iPad en portrait), colonne un peu plus étroite. Banc des présences vert, Vitest complet vert (7 999), verdict complet au navigateur sans échec (7 tests verts au second essai, aucun dans les présences).

**Pas de vérification à faire de ton côté** : tu le verras en usage.

✅ **EN LIGNE EN 1.177.0 (3 OCTOBRE 2026 ; en ligne depuis 12 h 27, mesuré chez Netlify : déploiement de production prêt sur `99a21e47` ; relue par Cowork, verte sans correction ; tes mots, avec les quatre retouches, et ta ligne des « Nouvelles » posés tels que tu les as acceptés à 11 h 25) — LE CODEX PROPOSÉ SUR LES GESTES QUI RESTAIENT**

**Ce que tu verras** : la même fenêtre qu'en 1.176.0 paraît aussi quand tu fusionnes des copies, retires des pages d'une copie, supprimes une copie importée, appliques un jeton de reprise qui efface l'originale (ou retires ce jeton), remplaces un élément du même nom, réinitialises une séance déjà saisie, cliques « Effacer tout » sur une page annotée, retires un·e élève du registre longitudinal ou supprimes les résultats du bilan réflexif. Seulement si quelque chose sera vraiment effacé, et seulement si ton codex n'est pas à jour.

**Vérifié comment** : au navigateur (WebKit), le banc du lot (la fusion ; le jeton de reprise, dont une écriture faite pendant que la fenêtre attend, qui n'est pas perdue) et le registre sur son vrai bouton ; une sentinelle sur les dix gestes ; onze mutations, onze rouges. Vitest complet vert (7 999). Verdict complet au navigateur : aucun échec, aucun instable.

**Ta vérification** : une porte courte, en fenêtre privée de Chrome, sur les données démo : `plans de travail/PORTES-TERRAIN-2026-10-03-1007-propose-codex-2.md` (Cowork publie la version à cocher). Réinitialiser une séance déjà saisie (la fenêtre, puis « Annuler »), puis une séance jamais saisie (aucune fenêtre).

**La suite** : le lot 2b (les lignes d'éditeur qui portent des notes d'élèves), sur une consigne de Cowork (#1007).

✅ **EN LIGNE EN 1.176.0 (3 OCTOBRE 2026 ; en ligne depuis 10 h 12, mesuré chez Netlify : déploiement de production prêt sur `7618e8d8` ; relue par Cowork, verte sous une correction, faite ; tes mots et ta ligne des « Nouvelles » posés tels que tu les as acceptés à 7 h 56) — AVANT D'EFFACER, TON CODEX À JOUR PROPOSÉ**

**Ce que tu verras** : avant d'effacer une évaluation, une production, une grille, une pratique, une échelle, une cartouche, un·e élève, une copie de la corbeille ou un autre élément de ton matériel, si ton codex n'est pas à jour, une fenêtre « Mettre ton codex à jour avant de supprimer ? » vient d'abord : « Annuler », « Supprimer sans mettre à jour », « Mettre à jour, puis supprimer ». Sans codex, « Écrire un codex avant de supprimer ? », avec « Supprimer sans codex ». Codex à jour : rien ne change, la question habituelle vient seule. Une dizaine de gestes plus difficiles à brancher attendent le lot suivant.

**Vérifié comment** : au navigateur (WebKit), le banc du lot (trois essais : l'évaluation par tous les chemins, une porte par famille, et une écriture faite pendant que la fenêtre attend, qui n'est pas perdue) ; une sentinelle sur les 36 gestes ; mutations rouges, dont celle de la correction demandée par Cowork. Vitest complet vert (7 982). Verdict complet au navigateur : aucun échec, un test voisin vert au second essai seulement.

**Ta vérification** : une porte, en fenêtre privée de Chrome, sans tes vraies données : `plans de travail/PORTES-TERRAIN-2026-10-03-1007-propose-codex.md` (Cowork publie la version à cocher). Elle supprime des productions d'essai par les quatre chemins : sans codex, en écrivant un codex, codex à jour, après une modification.

**La suite** : le reste du lot (une dizaine de gestes : présences, éditeur de pages, jetons de reprise…), sur une consigne de Cowork (#1007).

✅ **EN LIGNE EN 1.175.0 (3 OCTOBRE 2026 ; en ligne depuis 4 h 33, mesuré chez Netlify : déploiement de production prêt sur `119d3c29` ; relue par Cowork, verte ; tes mots et ta ligne des « Nouvelles » posés tels que tu les as acceptés à 3 h 25) — AVANT DE SUPPRIMER, UN CODEX À PART**

**Ce que tu verras** : quand tu supprimes un trimestre, un groupe-cours, un groupe d'élèves, toute la liste ou toutes tes données, une fenêtre « Avant de supprimer, un codex à part » vient d'abord. L'application écrit ce codex sous un autre nom (elle te demande où), et **seulement ensuite** viennent les confirmations habituelles. « Annuler » ou un échec, à n'importe quelle étape : rien n'est supprimé. Ton codex habituel n'est pas touché. Le refus « mets d'abord ton codex à jour » du trimestre disparaît.

**Vérifié comment** : au navigateur (WebKit), par les vrais boutons des cinq gestes : le banc du lot (sept essais) ; treize mutations, treize rouges ; relecture de Cowork verte, avec une mutation de son cru. Vitest complet vert sur la release (7 937). Verdict complet au navigateur : aucun échec, cinq tests verts au second essai seulement, aucun du lot.

**Ta vérification** : une porte, en fenêtre privée de Chrome, sans tes vraies données : `plans de travail/PORTES-TERRAIN-2026-10-03-1007-codex-a-part.md` (Cowork publie la version à cocher). Elle supprime un trimestre d'essai, puis rouvre le codex à part dans un espace neuf pour voir le trimestre revenir.

**Trouvé autour, inscrit** : un groupe-cours supprimé laisse ses élèves, évaluations et présences sans accès par l'écran ; la question « As-tu exporté tes données ? » de la réinitialisation, devenue redondante.

**La suite** : le second lot (proposer de mettre le codex à jour avant une suppression ordinaire), sur une consigne de Cowork (#1007).

✅ **EN LIGNE EN 1.174.6 (2 OCTOBRE 2026 ; en ligne depuis 20 h 19, mesuré chez Netlify : déploiement de production prêt sur `e9146c4c` ; relue par Cowork, verte ; ta ligne des « Nouvelles » posée telle que tu l'as acceptée) — TON CODEX EMPORTE AUSSI TA CORBEILLE ET TA MODÉLISATION**

**Ce que tu verras** : rien de neuf à l'écran. Les copies mises à la corbeille et les fichiers ouverts en Modélisation partent maintenant dans le codex (et dans « Exporter une sélection »), et reviennent quand tu l'ouvres sur un autre appareil. Un codex écrit avant s'ouvre comme avant. Au passage, la fenêtre des rapports de bug archivés n'affiche plus leurs champs sans les échapper.
**Vérifié comment** : au navigateur (WebKit), par les vrais boutons du menu Codex, sur un espace neuf : le banc du lot (six essais) et l'ouverture d'un codex d'avant, verts ; neuf mutations, neuf rouges. Relecture de Cowork verte, avec une mutation de son cru. Vitest complet vert sur la release (673 fichiers, 7 938 essais). Suite complète au navigateur verte, 0 échec (20 h 17) ; trois specs vertes au second essai seulement, dont celle de l'export de sélection de ce lot — à surveiller si elle revient.
**Pas de vérification à faire de ton côté.** Ton codex deviendra complet à ta prochaine mise à jour habituelle, faite depuis le navigateur qui a ces fichiers.

**La suite** : tes décisions sur l'inventaire des gestes qui suppriment, une famille à la fois, avec Cowork (#1007) ; puis le garde-éveil de la vérification, le signal au début de l'évaluation, et ce qui reste visible d'un élève supprimé (#1013). Quatre petites trouvailles du lot attendent, inscrites (#1014).

✅ **EN LIGNE EN 1.174.5 (2 OCTOBRE 2026 ; en ligne depuis 16 h 31, mesuré chez Netlify : déploiement de production prêt sur `c33dcd0e` ; ta ligne des « Nouvelles » posée telle que tu l'as acceptée, avec la retouche de Cowork) — LES MOTS DU CODEX : LA FENÊTRE D'OUVERTURE NE TE CONSEILLE PLUS DE SUPPRIMER TON CODEX**

**Ce que tu verras, une fois en ligne** : après l'ouverture complète d'un codex, la fenêtre dit « Ton fichier de codex n'a pas changé : garde-le, c'est ta copie hors de l'application. » Quand tu ouvres un ancien fichier par « Ouvrir un Codex… », l'aperçu et le bilan comptent les présences en dates de cours (3 dates pour 10 élèves : « 3 date(s) », plus 30) ; au bilan, seules les dates où quelque chose est entré. Si l'import écarte un élève que tu avais supprimé, le bilan le dit en une ligne (« 1 élève que tu avais supprimé n'a pas été ramené. »), même quand rien d'autre n'entre.
**Vérifié comment** : au navigateur (WebKit), par la vraie case et la vraie fenêtre aux cases : 3 dates × 10 élèves rendent « 3 date(s) » à l'aperçu et au bilan ; rouvert avec une date de plus, l'aperçu dit 4 et le bilan 1 ; la ligne des élèves écartés paraît quand l'un est écarté et pas sinon ; la fenêtre d'ouverture porte tes mots. Douze mutations, onze rouges (la douzième a montré une clause inutile, retirée). Vitest complet vert sur la release (673 fichiers, 7 938 essais). Suite complète au navigateur verte, 0 échec (16 h 30) ; une spec sans lien, sur la rétroaction, verte au second essai seulement. Pas de relecture croisée (décision de Cowork : des mots et un compte, rien n'est écrit dans tes données).
**Pas de vérification à faire de ton côté.**

**LE CHANTIER DU CODEX EST CLOS** (ta décision de 15 h 08). Reste inscrit, sans lot : la copie vraiment perdue (en attente d'un cas réel : chez toi aucune ne manque) ; deux relevés de mots du bilan de la case (l'aperçu qui compte les copies du fichier, « 0 fichier(s) travaux + 1 PDF restauré(s) ») ; les autres cases de l'import qui remplacent encore ; la porte de 1.174.1 (en attente d'un ancien `.zip`). Ce qui reste visible d'un élève supprimé (ses copies en « Fichier non associé », « Inconnu » dans Travaux, le PDF d'une copie) devient un lot à part, hors du chantier, sans rien effacer (#1013).

✅ **EN LIGNE EN 1.174.4 (2 OCTOBRE 2026 ; en ligne depuis 13 h 54, mesuré chez Netlify : déploiement de production prêt sur `95ffb41b` ; relue par Cowork, verte ; ta ligne des « Nouvelles » posée telle que tu l'as acceptée à 12 h 54) — UN ÉLÈVE QUE TU SUPPRIMES NE REVIENT PLUS PAR UN ANCIEN FICHIER**

**Ce que tu verras, une fois en ligne** : quand tu supprimes un élève dans le Cadre, puis ouvres un ancien fichier par « Ouvrir un Codex… », rien de lui n'entre : ni sa fiche, ni ses copies, ni ses notes, ni ses présences, ni ses annotations. Cela vaut pour les élèves supprimés à partir de cette version ; un élève en décrochage n'est pas touché. Aucun mot neuf à l'écran, sauf ta ligne des « Nouvelles ».
**Vérifié comment** : le défaut a été reproduit par le geste avant d'être corrigé (l'élève supprimé revenait avec ses copies). Au navigateur (WebKit), par le vrai bouton « Supprimer » et la vraie fenêtre aux cases : rien de l'élève n'entre, les autres élèves entrent comme avant. Douze mutations, toutes rouges ; relu par Cowork (vert, aucune correction, quatre mutations de plus, toutes rouges). Vitest complet vert sur la release (672 fichiers, 7 929 essais). Suite complète au navigateur verte, aucune spec instable (13 h 52).
**Pas de vérification à faire de ton côté** : elle demanderait un ancien `.zip` que tu n'as pas ; le banc juge par le geste.
**Trouvé autour, non corrigé** : une très ancienne forme de fichier (présences rangées autrement) n'est pas filtrée, et seulement si ton espace n'a encore rien : très rare. Et ce qui reste d'un élève supprimé **reste visible** : ses copies dans la Liste des évaluations (« Fichier non associé ») et dans Travaux (« Inconnu »), un PDF possible, des comptes du tableau de bord. C'est de l'affichage, rien n'est effacé ni corrigé ; **à toi de dire si tu en veux un lot.**

**Le chantier du codex n'a plus de lot de code.** Il lui reste, tout à toi : des mots pour la copie vraiment perdue ; « fichier ZIP » dans la fenêtre d'une ouverture complète ; les mots du bilan de l'import (« N date(s) », et si tu veux une ligne pour les élèves écartés) ; et ce qui reste visible d'un élève supprimé (une décision : un lot ou non). C'est toi qui diras s'il est clos.

✅ **EN LIGNE EN 1.174.3 (2 OCTOBRE 2026 ; en ligne depuis 12 h 22, mesuré chez Netlify : déploiement de production prêt sur `a1f3009f` ; ta ligne des « Nouvelles » posée telle que tu l'as acceptée) — OUVRIR UN ANCIEN FICHIER NE REMPLACE PLUS TES ÉLÈVES, TES PRÉSENCES, TES NOTES NI TES ANNOTATIONS**

**Ce que tu verras, une fois en ligne** : dans « Ouvrir un Codex… » de Réglages › Données, les cases « Étudiants », « Présences », « Notes » et « Annotations » ajoutent ce que le fichier apporte de neuf ; ce que tu as déjà ne change pas. Avant, chacune remplaçait tout. Aucun mot neuf à l'écran ; ta ligne des « Nouvelles » est posée telle que tu l'as acceptée (11 h 22).
**Vérifié comment** : le défaut a été reproduit par le geste avant d'être corrigé (une note de 85 devenue 10, une élève et des présences disparues, une annotation réécrite). Au navigateur (WebKit), par la vraie case et la vraie fenêtre aux cases : tout ce que l'espace avait reste tel quel, le neuf entre, le même fichier rouvert ne double rien, la mise à jour du codex écrit le tout. Neuf mutations, toutes rouges ; relu par Cowork (vert, aucune correction, quatre mutations de plus, toutes rouges). Vitest complet vert sur la release (671 fichiers, 7 919 essais). Suite complète au navigateur verte, aucune spec instable (12 h 20).
**Pas de vérification à faire de ton côté** : elle demanderait un ancien `.zip` que tu n'as pas ; le banc juge par le geste.
**Trouvé autour, non corrigé** : une copie neuve dont l'évaluation n'entre pas, quand ton espace a déjà une évaluation pour le même élève et le même travail (rare, rien ne se perd) ; un élève supprimé revient si l'ancien fichier le porte : tu as décidé (vers 11 h 26) qu'un ancien fichier ne ramènera plus rien d'un élève supprimé ; c'est le prochain lot, sur consigne de Cowork. « Configuration du cours », « Cadre du trimestre », « Groupe-cours », « Horaires » et « Enseignants » remplacent encore (non cochées par défaut) : inscrites, hors du chantier tant que tu n'en vis pas le symptôme.

**Le chantier du codex n'a plus de lot de code prévu avant ta décision de 11 h 26.** Il lui reste, à toi : des mots pour la copie vraiment perdue ; « fichier ZIP » dans la fenêtre d'une ouverture complète ; les deux relevés de mots de l'import (le bilan et l'aperçu disent « N date(s) » et comptent des fiches de présence). S'y ajoute le lot de l'élève supprimé, que ta décision vient d'ouvrir. C'est toi qui diras s'il est clos.

✅ **EN LIGNE EN 1.174.2 (2 OCTOBRE 2026 ; en ligne depuis 10 h 19, mesuré chez Netlify : déploiement de production prêt sur `e074a48d` ; ta ligne des « Nouvelles » acceptée avec ta correction) — UNE SÉLECTION EXPORTÉE TE PRÉVIENT AUSSI**

**Ce que tu verras** : quand des copies ne sont pas dans l'application, « Exporter une sélection » ouvre une fenêtre avant d'écrire le fichier : « Cette sélection n'aura pas toutes ses copies », avec « Annuler » (qui n'écrit rien) et « Écrire sans ces copies ». Avant, le fichier s'écrivait sans elles, sans rien dire. Une copie que tu as exportée volontairement ne compte pas.
**Vérifié comment** : le défaut a été reproduit par le geste avant d'être corrigé (aucune fenêtre). Au navigateur (WebKit), par le vrai menu Codex : la fenêtre, « Annuler » qui n'écrit rien, « Écrire sans ces copies » qui écrit le fichier avec la seule copie présente, l'accord au singulier, et aucune fenêtre quand rien ne manque. Huit mutations, toutes rouges. Vitest complet vert (670 fichiers, 7 903 essais). La suite complète au navigateur, verte, 0 échec. **Pas vérifié** : Chrome lui-même. **Pas de porte** : il faudrait fabriquer un espace où des copies manquent.

🔧 **EN LIGNE EN 1.174.1 ; TA PORTE ATTEND UN ANCIEN FICHIER `.zip` AVEC COPIES (2 OCTOBRE 2026 ; en ligne depuis 8 h 46, mesuré chez Netlify : déploiement de production prêt sur `44843fc0` ; relecture de Cowork verte à 7 h 48, aucune correction ; ta ligne des « Nouvelles » acceptée à 7 h 49) — UN ANCIEN FICHIER `.zip` OUVERT DANS RÉGLAGES NE FAIT PLUS PERDRE DE COPIES**

**Ce que tu verras** : quand tu ouvres un ancien fichier `.zip` par « Ouvrir un Codex… » de Réglages › Données et que tu coches « Fichiers travaux », ses copies s'ajoutent aux tiennes. Avant, elles prenaient leur place : tes copies sortaient de la liste, et « Mettre à jour le codex » écrivait ensuite un codex sans elles, sans rien dire. Aucun mot neuf à l'écran.
**Vérifié comment** : le défaut a été reproduit par le geste avant d'être corrigé (un codex de trois copies tenu, l'ancien `.zip`, tout coché, puis la mise à jour : 1 copie écrite ; après le correctif : 4). Au navigateur (WebKit), par la vraie case, la vraie fenêtre aux cases à cocher et le vrai menu Codex. Seize mutations, toutes rouges ; trois autres de Cowork, rouges aussi. Vitest complet vert (670 fichiers, 7 901 essais). La suite complète au navigateur, verte, 0 échec, aucune spec instable. **Pas vérifié** : Chrome lui-même, et son vrai magasin de copies (le banc les imite) : c'est ce que ta porte lève.
**Ta porte** : `plans de travail/PORTES-TERRAIN-2026-10-02-1012-ancien-zip-par-la-case.md`. En fenêtre privée, une seule case cochée, rien n'écrit dans ton fichier de codex. **Elle demande un ancien `.zip` avec copies que tu as déjà** : si tu n'en as pas, elle attend un cas réel ; n'en fabrique pas. **Réponse du 2 octobre, 8 h 50 : tu n'en as pas. La porte attend un cas réel ; elle n'a pas échoué.**
**Tes données** : rien n'y est écrit. Chez quelqu'un qui a déjà fait cet import, les copies d'alors restent dans l'application sans leur entrée ; rien n'est réparé d'office.
**Le chantier du codex n'est pas clos.** Il lui reste la sélection exportée sans ses copies (sa consigne est prête) et les quatre cases « Annotations », « Notes », « Étudiants » et « Présences », qui remplacent encore ce que tu as ; et deux affaires de mots qui t'attendent : la copie vraiment perdue, et « fichier ZIP » dans la fenêtre d'une ouverture complète.

🔧 **EN LIGNE EN 1.174.0 ; TA PORTE DU 2 OCTOBRE, 6 h 50, N'A PAS PU VOIR LA FENÊTRE : TON CODEX S'EST OUVERT EN ENTIER (1er OCTOBRE 2026 ; en ligne depuis 20 h 05, mesuré chez Netlify : déploiement de production prêt sur `740a984c` ; relecture de Cowork verte à 18 h 54, aucune correction ; ta ligne des « Nouvelles » acceptée à 18 h 57) — TON CODEX TE PRÉVIENT QUAND DES COPIES LUI MANQUENT**

**Ce que tu verras** : si des copies attendues ne sont pas dans l'application au moment d'écrire ton codex, la fenêtre « Ce codex n'aura pas toutes tes copies » passe avant tout, avec tes mots de 17 h 52 ; « Annuler » n'écrit rien. Tant que des copies manquent, l'application demande où ranger le fichier, même dans Chrome où elle tient ton fichier de codex. « Exporter une sélection » demande toujours où écrire et ne touche plus à ton fichier de codex. Le bilan d'un codex ouvert incomplet dit tes mots de 17 h 55 pour chaque cause.
**Vérifié comment** : au navigateur (WebKit), par les vrais boutons du menu Codex : le banc regarde ce qui sort de l'application, dans l'ordre, et dans quel fichier. L'export de sélection qui écrivait dans le fichier du codex a été reproduit avant d'être corrigé. Vingt-sept mutations, vingt-sept rouges. Vitest complet vert sur la release (669 fichiers, 7 893 essais). La suite complète au navigateur, prise sur la release à 19 h 52 : verte, 0 échec, aucune spec instable. **Pas vérifié** : Chrome lui-même et le partage de l'iPad (le banc les imite).
**Tes données** : rien n'y est écrit par ce lot. Chez toi aujourd'hui, aucune copie ne manque : tu ne verrais pas la fenêtre.
**Tranché par Cowork à la relecture** : dans un bilan à plusieurs causes, chaque conseil garde le nom de sa cause ; « le détail y sera » n'est pas posé (après « Recharger », le détail de l'erreur n'est plus dans le signalement) ; le bouton d'écriture de l'avertissement reste rouge, « Annuler » a le focus.
**Ta porte (2 octobre, 6 h 50 ; `plans de travail/PORTES-TERRAIN-2026-10-01-1012-avertissement.md`, § 5)** : dans Chrome, en fenêtre privée, ton codex (1,22 Go, écrit le 1er à 18 h 50) s'est ouvert en entier, « Recharger la page », sans le mot « incomplet ». La porte n'a pas échoué, mais elle n'a pas vu la fenêtre d'avertissement : aucune copie ne manquait. **Vérifié comment** : ta capture, rapportée par la consigne de Cowork de 6 h 54. Ses rangées 1.2 à 1.4 attendent un cas réel : tu ne fabriques pas de données pour elles. La rangée 2.1 (ta prochaine mise à jour habituelle : aucune fenêtre ne devrait passer) reste à voir, sans échéance. **Reste donc inféré** : que la fenêtre d'enregistrement de Chrome s'ouvre bien après l'avertissement.
**Relevé sur ta capture** : la fenêtre d'une ouverture complète dit encore « Le fichier ZIP d'origine reste dans Fichiers », alors que ce fichier est ton codex. Ce sont des mots : ils t'attendent, plus tard. Inscrit, rien n'est touché.
**Le chantier du codex n'est pas clos : il lui reste deux lots**, chacun en attente d'une décision de toi. L'ancien `.zip` ouvert par la case remplace la liste des copies : le codex réécrit ensuite les perd sans fenêtre. Une sélection dont des copies manquent s'exporte sans le dire. Une troisième décision attend, sans lot nommé : une copie vraiment perdue ferait revenir la fenêtre à chaque mise à jour, rien ne permet encore de dire « je le sais ». Tout est inscrit (#1012), rien n'est corrigé.

✅ **FAIT, VU SUR TON ÉCRAN : PORTE PASSÉE, TROIS RANGÉES SUR TROIS (1er OCTOBRE 2026, 16 h 55, dans Chrome, en fenêtre privée, avec ton vrai codex ; en ligne en 1.173.3 depuis 14 h 41, mesuré chez Netlify : déploiement de production prêt sur `56a94cd8` ; relecture de Cowork verte ; ta ligne des « Nouvelles » acceptée) — APRÈS UNE OUVERTURE INCOMPLÈTE : UN BILAN QUI RESTE, ET UN FICHIER DE CODEX QUI N'EST PAS RÉÉCRIT PAR ERREUR**

**Ce que tu as vécu** : à la porte, le bilan « Import incomplet… » est parti trop vite, et son conseil (« libère de l'espace ») ne disait pas comment, ni qu'en fenêtre privée il n'y a rien à libérer.
**Ce que tu verras** : le bilan est dans la fenêtre « Codex ouvert, mais incomplet », avec tes mots de 12 h 40 ; elle reste tant que tu n'as pas répondu. Et dans Chrome, si l'ouverture d'un fichier est annulée ou refusée, « Mettre à jour le codex » n'écrit plus dans ce fichier-là.
**Vérifié comment** : au navigateur (WebKit), par le vrai bouton « Mettre à jour le codex » : le banc regarde dans quel fichier le codex est écrit. Le défaut a été reproduit avant d'être corrigé. Douze mutations, douze rouges. La suite complète au navigateur, prise sur la release à 14 h 39 : verte, 0 échec, aucune spec instable. **Pas vérifié** : Chrome lui-même (le banc imite sa poignée de fichier). Relu par Cowork à 13 h 38 : vert, aucune correction (lecture du code et du banc, Vitest exécuté, deux mutations de son cru). Sur la release : Vitest vert, 669 fichiers, 7 887 essais.
**Ta porte : passée** (ton relevé du 1er octobre à 16 h 55 : trois rangées sur trois, aucun constat écrit ; les deux nombres de la fenêtre ne sont pas relevés) : `plans de travail/PORTES-TERRAIN-2026-10-01-1012-bilan-qui-reste.md`. Elle ne levait pas tout : qu'un fichier refusé laisse bien ton fichier d'avant en place, dans le vrai Chrome, reste une inférence.
**Mesuré chez toi avant l'avertissement** (1er octobre, 17 h 03, en lecture seule, avec ton accord) : dans ton Chrome, 500 copies, 500 avec leur fichier, aucune copie attendue sans fichier. L'avertissement ne s'afficherait donc pas à chaque mise à jour de ton codex. L'automne 2025 et l'automne 2024 n'ont aucune liste de copies : leurs évaluations ne comptent pas. Ton iPad n'est pas mesuré.
**Tes données** : rien n'y est écrit par ce lot. **Ce qui t'attend** : tes mots pour l'avertissement quand on met à jour un codex depuis un espace où des copies manquent ; tes mots pour les autres causes d'une ouverture incomplète. Deux points inscrits pour le lot de l'avertissement, rien de corrigé : « Exporter une sélection » ne devra plus écrire dans le fichier du codex ; un ancien fichier ouvert par la case de Réglages, à mesurer par le geste (#1012).

✅ **OUVRIR UN CODEX QUAND L'ESPACE MANQUE : FAIT, VU SUR TON ÉCRAN (1er OCTOBRE 2026, 12 h 37 : la rangée 2.4 rejouée en fenêtre privée, en 1.173.2 ; en ligne depuis 12 h 24, mesuré chez Netlify : déploiement de production prêt sur `01f3da1e` ; deux relectures de Cowork, la seconde verte ; tes mots de 11 h 10 et 11 h 11 posés tels quels ; ta ligne des « Nouvelles » acceptée)**

**Ce que tu as vécu** : ce matin, à la porte du lot I bis (dix rangées passées sur onze), ton codex ouvert dans une fenêtre privée de Chrome a fini par un bandeau « Erreur ». Les données étaient écrites, les copies refusées faute d'espace, et rien ne le disait.
**Ce que tu verras** : la même ouverture va jusqu'au bout, dit « Import incomplet : N fichiers sur M n'ont pas été restaurés » et propose de recharger. Si l'espace est refusé d'emblée, le message ne parle plus de Safari. Un autre échec d'ouverture s'intitule « Le codex n'a pas pu être ouvert ».
**Vérifié comment** : au navigateur (WebKit), par le vrai geste, la case et le menu, avec un manque d'espace **injecté** : six essais, dix états mutés, dix rouges ; la suite complète verte, aucune spec instable. **Puis ton écran, à 12 h 37** : ton vrai codex, en fenêtre privée de Chrome, a rendu « Import incomplet : 67 fichiers sur 397… 67 refusés faute d'espace de stockage », puis « Recharger la page ».
**Tes données** : rien n'y est écrit par ce lot. **Tes deux remarques à la porte** (le message part trop vite ; comment libérer de l'espace) : c'est le lot du bloc ci-dessus (#1012).

✅ **FAIT, VU SUR TON ÉCRAN (1er OCTOBRE 2026, vers 11 h 30, en 1.173.1) : « Estimation de la charge » affiche une production dès que des copies sont en main**, même si sa case « Consignes transmises » est décochée (#1009). **Vérifié comment** : un banc de trois essais, deux mutations rouges, la suite complète verte ; puis ta confirmation à l'écran. **Tes données** : rien n'y est écrit ; la case d'Artefact 3 (rév) reste ton geste. **Décidé par toi** : un signal au début de l'évaluation quand les consignes ne sont pas marquées transmises (#1010, lot à ouvrir).

✅ **EN LIGNE EN 1.173.0, PORTE PASSÉE : ONZE RANGÉES SUR ONZE (dix à 8 h 51, la rangée 2.4 rejouée à 12 h 37 en 1.173.2) — (1er OCTOBRE 2026, 8 h 27, mesuré chez Netlify : déploiement de production prêt sur `e8830100` ; relecture de Cowork rendue à 2 h 07, ses deux corrections faites ; tes mots du 1er octobre repris tels quels ; la vérification de la nuit n'avait rien rendu — Mac en veille, mémoire saturée, redémarré de force à 7 h 05 (#1008) — refaite ce matin : verte, 0 échec, 1 spec au second essai, 44 min (7 h 40 → 8 h 24) ; la porte est faite, sur ton Mac et ton iPad) — UN SEUL TERME : LE CODEX.**

**Ce que tu verras, une fois en ligne** : dans Réglages › Données, la première carte s'appelle « Ouverture et partage » et n'a plus que deux cases ; la fenêtre « Copie de secours » n'existe plus et aucun texte ne dit plus ce mot (l'Aide conseille de mettre le codex à jour). Un fichier de copie de secours déjà fait s'ouvre toujours, par « Ouvrir un Codex… », **et cette case ouvre maintenant aussi un codex** (avant, elle le refusait et renvoyait au menu). Supprimer un trimestre est refusé tant que ton codex n'est pas à jour : une fenêtre te le dit, et son bouton lance « Mettre à jour le codex » ; la suppression ne télécharge plus rien. Quand elle est permise, la question dit jusqu'où ton codex sert de filet : « jusqu'à ta prochaine mise à jour : pour pouvoir revenir en arrière, fais d'abord une copie de ce fichier ».
**Vérifié comment** : au navigateur (WebKit), deux anciens fichiers (`.json`, et `.zip` avec une copie) fabriqués par le vrai bouton au code de 1.172.0, AVANT le retrait, rouverts après : les mêmes données, clé par clé, et la copie octet pour octet ; la suppression par de vrais clics dans les trois cas (codex pas à jour, sans codex, codex à jour) ; un vrai codex, fabriqué par l'application sur un jeu fictif, choisi dans la case d'un espace vide : ses données arrivent, le codex devient actif, la même confirmation « Recharger la page » qu'au menu, aucune alerte ; un fichier de 1,1 Go part au codex après deux lectures seulement (la fin du fichier, puis son répertoire), sans jamais être lu en entier par la case ; un cliquet qui refuse le mot partout sauf dans les Nouvelles, y compris écrit avec des espaces en échappement. 39 mutations, 39 rouges (10 le 30 sept., 29 le 1er oct.). Vitest complet vert (668 fichiers, 7 881 essais) sur le commit de release. Verdict complet au navigateur vert sur `e8830100` le 1er oct. à 8 h 24 (une spec verte au second essai, #916, instable avant ce lot). **La porte** : faite sur ton Mac (Chrome) et ton iPad (Safari), onze rangées sur onze (elle ne demandait de supprimer aucun trimestre). **Non mesuré** : la mémoire d'un iPad devant un codex d'environ 1 Go choisi dans la case (le menu Codex reste le chemin éprouvé).
**Tes données** : rien n'est effacé ni réécrit ; tes réglages du rappel et tes fichiers déjà faits restent où ils sont. **Une décision t'attend**, à froid : avant de supprimer un trimestre, faut-il que l'application écrive d'abord un codex à part, sous un autre nom ? Dans Chrome, la mise à jour suivante du codex réécrit le même fichier, et le trimestre supprimé n'y est plus ; la question à l'écran le dit maintenant, mais ne l'empêche pas. *(#985, D9, coché ; le codex à part : #1007 ; l'export d'un trimestre qu'on ne peut pas rouvrir : #1006)*

✅ **FAIT EN 1.172.0, EN LIGNE (30 SEPTEMBRE 2026, 17 H 50, mesuré chez Netlify : déploiement de production prêt sur `95ed3124` ; relecture croisée de Cowork verte après une correction, faite ; tes mots acceptés repris tels quels, ta ligne des « Nouvelles » telle quelle ; verdict au navigateur vert, 0 échec, 0 spec au second essai, 43 min (17 h 06 → 17 h 49) ; PORTE SUR TON MAC, DANS CHROME, PASSÉE À 20 H 09, 6 RANGÉES SUR 6) — UNE ARCHIVE SE VÉRIFIE, COPIE PAR COPIE.**

**Ce que tu verras** : dans Réglages › Données › Archives, chaque ligne porte « Non vérifiée » et un bouton « Vérifier ». Le clic relit l'archive (depuis ton dossier des archives dans Chrome, depuis le fichier .zip dans Safari), copie par copie, et dit « Archive vérifiée », « Archive incomplète » (avec le détail : « 1 copie absente », « 2 copies altérées »…) ou « Archive à refaire » (une archive d'avant 1.171.1, sans empreintes) ; la ligne dit ensuite « Vérifiée le 30 septembre 2026 ». Un nouvel archivage du groupe remet « Non vérifiée ». Le dossier choisi dans Chrome est gardé le temps de la page et l'écran le nomme ; choisir « trimestres » à la place de sa racine est refusé. Les fichiers que le Finder pose dans un dossier (`.DS_Store`) ne comptent pas.
**Vérifié comment** : au navigateur (WebKit), une archive de 607 Mo (205 copies) vérifiée par le vrai bouton en 0,8 s sans que la mémoire de la page bouge (pic 363 → 365 Mo ; la lecture d'aujourd'hui d'« Ouvrir une archive… » monte à 907 Mo) ; au banc, chaque défaut (tronquée, altérée d'un octet, absente, en trop, données altérées, fiche non couverte, fichier caché) dit par son nom dans les deux modes, aucun ne passe pour « vérifiée » ; l'état survit à un rechargement ; 27 + 2 mutations rouges, 2 au navigateur ; Cowork a rejoué ta vraie archive indépendamment (205 sur 205, 1,3 s). **Ta porte, le 30 à 20 h 09** : dans ton Chrome, en 1.172.0, avec ton vrai dossier, 6 rangées sur 6 ; ta ligne est passée de « Non vérifiée » à « Vérifiée le 30 septembre 2026 » et l'est restée après rechargement ; le refus du mauvais dossier a aussi joué (résultat à la fin de `plans de travail/PORTES-TERRAIN-2026-09-30-lot-A2-verifier.md`). **Pas vérifié** : Safari (un fichier .zip désigné) et l'iPad. Chrome t'a demandé le droit de « modifier les fichiers » pour un geste qui ne fait que lire : inscrit (#1005).
**Tes données** : rien n'est écrit dans tes trimestres ni dans l'archive ; seule ta liste d'archives note « vérifiée ». *(#999 ; chantier des archives, lot A2 ; #1003 corrigé avec lui ; suite : #1000 à #1002)*

✅ **FAIT EN 1.171.1, EN LIGNE (30 SEPTEMBRE 2026, 16 H 05, mesuré chez Netlify : déploiement de production prêt sur `cdfef4ea` ; relecture croisée de Cowork verte, sans correction de code ; tes mots de la fenêtre « Groupe non archivé » repris tels quels, option b ; verdict au navigateur vert, aucune reprise ; PORTE SUR TON MAC À FAIRE) — ARCHIVER UN GROUPE NE PASSE PLUS PAR LA MÉMOIRE, ET C'EST TOI QUI DIS QUE LE FICHIER EST LÀ.**

**Ce que tu verras** : « Archiver… » dans Safari range les copies dans le fichier sans les charger en mémoire (le même mécanisme que ton codex du matin) ; puis « Téléchargement lancé » te demande de vérifier le fichier dans tes Téléchargements — « Il y est » l'inscrit à ta liste d'archives, « Il n'y est pas » ouvre « Groupe non archivé » (« Le fichier (…) n'a pas été enregistré. Tes données restent dans l'application. », « Réessayer » relance le même fichier). Rien ne dit « archivé » avant ton « Il y est ». L'archive porte une empreinte par copie, pour que l'application puisse un jour la vérifier (lot suivant). Pas de ligne aux Nouvelles pour l'instant : elle viendra quand l'archive se vérifiera.
**Vérifié comment** : au navigateur (WebKit), 205 copies aux tailles réelles (607 Mo) : mémoire de la page 3 262 Mo → 228 Mo, du geste au téléchargement 22 s → 4,6 s ; fichier relu (`unzip`, CRC, 205 empreintes recalculées égales), ouvert par la version d'avant et inversement ; 17 mutations rouges, 4 au navigateur ; Cowork a rejoué le fichier indépendamment (8 empreintes sur 8, Python et `unzip`). **Pas vérifié** : ton Safari avec tes vraies copies — c'est la porte (`plans de travail/PORTES-TERRAIN-2026-09-30-lot-A1-archive.md`, artefact à publier par Cowork).
**Tes données** : rien n'est écrit ni effacé dans tes trimestres ; seule ta liste d'archives reçoit une ligne, après ton « Il y est ». *(#998, ouvert jusqu'à la porte ; chantier des archives, lot A1 ; suite : #999 à #1002)*

✅ **FAIT, VÉCU SUR TON IPAD (30 SEPTEMBRE 2026 ; porte passée à 10 h 38 en 1.170.2 ; relectures croisées de Cowork vertes sur 1.170.1 et 1.170.2 ; tes mots et ta ligne des « Nouvelles » repris tels quels ; 1.171.0 en ligne depuis 11 h 45, constaté chez Netlify) — UN GROS CODEX SE MET À JOUR SUR L'IPAD.**

**Ce que tu as vécu** : le matin, en 1.170.0, « Mettre à jour le codex » s'arrêtait pendant « Compression du ZIP… » et la page se rechargeait ; à 7 h 28, en 1.170.1, le fichier se préparait mais le premier enregistrement était refusé. À 10 h 38, en 1.170.2 : la barre va à 100 % en 12 secondes environ, « Ton codex est prêt » s'ouvre, « Enregistrer » amène la feuille de partage sans passer par « Codex non mis à jour », ton fichier du jour (1,31 Go) est dans Fichiers, et l'application rouverte deux fois ne te rappelle rien.
**Ce que tu verras à ta prochaine mise à jour (1.171.0)** : après « Enregistrer », une fenêtre « Ouverture de la feuille de partage… » reste à l'écran pendant que ton appareil prépare le fichier, et disparaît quand la feuille s'est refermée. Elle n'a pas de bouton : il n'y a rien à faire qu'attendre. Les Nouvelles ont leur ligne, « Un gros codex se met à jour sur l'iPad ».
**Vérifié comment** : sur ton iPad, par toi, pour la préparation, la fenêtre et le fichier. Réserve de Cowork : ton relevé de 10 h 38 a été coché sur la page de la porte de 1.170.1 ; la fenêtre « Ton codex est prêt » est attestée par ta réponse écrite, pas par une coche. Ton fichier de 7 h 34, jugé sur le Mac en lecture seule : aucune erreur, 503 entrées. Au navigateur (WebKit) : le refus de l'iPad reproduit mot pour mot, puis corrigé ; le message d'attente lu pendant que le partage est en cours, disparu après réussite, échec et feuille refermée ; 14 mutations, 14 rouges ; suite complète verte avant la mise en ligne. **Pas vérifié** : le message d'attente sur ton iPad (c'est de l'apparence : tu le verras), ni la durée du délai lui-même, qui n'existe pas au banc.
**Tes données** : rien n'est écrit ni effacé. *(#988 aux corrigés ; lots J0, J0 bis et J0 ter)*

✅ **FAIT EN 1.169.0 (29 SEPTEMBRE 2026 ; porte terrain passée sur ton iPad à 15 h 03, 9/9 ; relecture croisée de Cowork verte ; tes mots appliqués tels que tu les as tranchés ; verdict au navigateur vert ; en ligne depuis 12 h 48, constaté chez Netlify ; en 1.169.1, le titre des Nouvelles devient « Le codex dit quand il n'a pas pu être mis à jour », ton choix) — QUAND LE CODEX N'A PAS PU ÊTRE MIS À JOUR, L'APPLICATION LE DIT.**

**Ce que tu verras** : si « Mettre à jour le codex » n'écrit pas le fichier, « Codex non mis à jour » s'affiche en bas à gauche et y reste, avec la taille du fichier, et une fenêtre propose « Réessayer » (le même fichier, sans le refaire) ou « Télécharger à la place ». Après un téléchargement, c'est toi qui dis « Il y est » : sans ça, le codex n'est pas dit « à jour ». L'aperçu dit la taille du fichier. Le rapport de bug a une section « DERNIÈRE MISE À JOUR DU CODEX » (étape atteinte, taille, méthode, erreur).
**Vérifié comment** : au navigateur (WebKit), avec un faux partage de l'iPad : aperçu refusé (seul cas sans message), partage refusé deux fois puis réussi, « Télécharger à la place » (« Il n'y est pas », Échap, « Il y est »), préparation en panne, page rechargée pendant la tentative ; douze mutations, toutes rouges ; 7 762 essais Vitest verts. **Pas vérifié** : la vraie feuille de partage de l'iPad. **Éprouvé par toi** : la mise à jour de ton codex a réussi sur l'iPad à 15 h 03. **Ce qu'on ne sait pas** : pourquoi elle avait échoué le matin. Si l'échec revient, il se dit, et « Signaler un bug » en garde le détail. *(#988)*
**Tes données** : rien n'est écrit dedans.

✅ **FAIT EN 1.168.0 (29 SEPTEMBRE 2026, vers 6 h 30 ; relecture croisée de Cowork verte après ses deux corrections de mots ; tes décisions sur le stock, les textes et les « Nouvelles » appliquées telles quelles ; verdict au navigateur vert ; en ligne depuis 8 h 26, constaté chez Netlify) — DES MOTS QUI DISENT VRAI : ENREGISTRÉ, CODEX, COPIE DE SECOURS.**

**Ce que tu verras** : le menu du codex dit « Ton codex est à jour » ou « Ton codex n'a pas tes derniers changements » ; son bouton s'appelle « Mettre à jour le codex ». Plus d'enregistrement automatique du codex. Au premier lancement de 1.168.0, si un codex est ouvert, il est marqué « pas à jour » : mets-le à jour une fois. La sauvegarde de Réglages › Données s'appelle « Copie de secours » (carte de l'Accueil, rappel, bouton « Faire une copie de secours », qui ouvre vraiment sa fenêtre). Archiver dit « Groupe archivé » ; sous Safari, une archive annulée n'apparaît plus dans la liste. L'Aide et la foire aux questions parlent comme ça.
**Vérifié comment** : au navigateur (WebKit), le témoin du codex sur les trois chemins d'écriture, la mise à jour, l'aperçu annulé et aucun minuteur qui écrit le fichier ; un geste par famille qui rend le codex « pas à jour » ; le rappel et l'archive annulée ; les mots à quatre largeurs sans débordement ; le premier chargement d'un codex d'avant la version (marqué une fois, pas deux ; à jour après une mise à jour ; rien sans codex ouvert). Mutations toutes rouges ; 7 762 essais Vitest verts. **Pas vérifié** : ton écran, ton codex réel, un geste au doigt par écran.
**Tes données** : une seule écriture d'office, décidée par toi : l'état du codex (« pas à jour »), jamais tes données pédagogiques. Les archives fantômes déjà listées sous Safari restent listées (non mesurées, non réparées).

✅ **FAIT EN 1.163.0 (27 SEPTEMBRE 2026, vers 11 h 15 ; relecture croisée de Cowork verte ; ta décision « corriger dans ce lot » appliquée ; tes mots et ta phrase des « Nouvelles » acceptés tels quels ; verdict au navigateur et push lancés — « en ligne » reste à constater chez Netlify) — LES PRÉSENCES S'ENREGISTRENT TOUTES SEULES ; « CONFIRMER LA SÉANCE » ; UNE SÉANCE JAMAIS TOUCHÉE DIT « SÉANCE NON SAISIE ».**
**Ce que tu verras** : dans Suivi › Saisie des présences, chaque changement (période, note, « Tous présents », « Réinitialiser ») s'enregistre tout seul et le témoin dit « Enregistré » ; les élèves que tu n'as pas touché·es comptent présent·es. Passer à la séance suivante, changer d'onglet ou recharger ne perd plus rien. Une séance jamais touchée dit « Séance non saisie » et offre « Confirmer la séance » (tout le monde était là) ; une fois saisie, « Séance saisie ». Dans une séance déjà saisie, un·e élève sans présence enregistrée le dit : « Non saisi·e : compté·e absent·e » ; rien ne s'écrit pour lui ou elle tant que tu ne touches pas sa ligne. « Réinitialiser » demande confirmation sur une séance saisie. Verrouiller enregistre la séance et le dit en un message. « Annuler » devient « Fermer ». Une présence d'intervention RàI ne rend plus, à elle seule, une séance « saisie ».
**Vérifié comment** : au navigateur (WebKit), 11 scénarios dans le vrai écran de la démonstration (absence puis « Suivant », note puis rechargement, note puis changement d'onglet, séance jamais saisie, « Confirmer la séance », verrou, « Réinitialiser » avec Entrée et « Annuler », absence motivée RàI, échec d'écriture, élève non saisi·e, la barre à 360, 768, 1024 et 1180 px) ; douze sabotages volontaires, tous rouges ; 7 496 essais Vitest verts. **Pas vérifié** : ton iPad, sur ton groupe réel.
**Tes données** : rien n'est réécrit. Une séance jamais saisie le reste tant que tu n'y touches pas. Là où la seule présence d'une date de cours est une intervention RàI, les autres élèves passent d'« absent·e » à « en attente » pour cette séance : leur assiduité peut monter, sans rien réécrire. **À éprouver sur l'iPad** : marquer une absence, passer à la séance suivante, revenir ; une séance jamais touchée dit « Séance non saisie » ; « Confirmer la séance » ; verrouiller.

✅ **FAIT EN 1.161.0 (27 SEPTEMBRE 2026, vers 7 h 45 ; relecture croisée de Cowork verte après quatre retouches ; tes mots et ta phrase des « Nouvelles » acceptés tels quels ; verdict au navigateur et push lancés — « en ligne » reste à constater chez Netlify) — UN MÊME TÉMOIN DIT « ENREGISTRÉ », OU « NON ENREGISTRÉ » ET POURQUOI, AU LIEU D'UN MESSAGE DE RÉUSSITE SUR UN ÉCHEC.**
**Ce que tu verras** : en bas à gauche, un court « Enregistré » après chaque enregistrement d'une évaluation, d'un jeton, d'une rétroaction ou des présences. Si l'écriture échoue : « Non enregistré – ‹ce que tu faisais› : ‹la raison› », qui reste affiché jusqu'à ce que cette même donnée s'enregistre, ou jusqu'à ce que tu le fermes. Plus de « Présences enregistrées », « Évaluation modifiée » ou « Évaluation supprimée » sur un échec ; plus de « Les données sont sauvegardées » quand la mémoire est pleine (le message renvoie maintenant à Cadre › Trimestre › Bibliothèque, « Supprimer… »). Sur un échec, la fenêtre de la rétroaction reste ouverte avec ton texte. Les boutons « Enregistrer » et leurs messages de réussite restent là jusqu'aux lots suivants.
**Vérifié comment** : au navigateur (WebKit), chaque geste rejoué sous trois pannes simulées (mémoire pleine, erreur, garde du trimestre) : aucun message de réussite, le témoin dit l'échec, ta base inchangée ; puis une écriture réussie. Placement mesuré à 360, 768, 1024 et 1180 px (ton iPad couché), en clair et en sombre : il ne recouvre ni les boutons des présences ni la barre d'Annoter. Neuf sabotages volontaires, tous rouges ; Cowork en a posé dix autres de son côté.
**Tes données** : rien n'est réécrit ni effacé. **Pas encore réglé** : un échec d'écriture qui survient APRÈS coup, dans le stockage du navigateur (possible sur iPad après une mise en arrière-plan), n'est pas rattrapé par le témoin, qui a déjà dit « Enregistré » (inscrit, après le lot C). **À éprouver sur l'iPad** : le témoin pendant que tu évalues une copie réelle (Pencil, barre, carrousel). (#618, #786 ; suivant : #962)

✅ **FAIT EN 1.160.1 (26 SEPTEMBRE 2026, vers 17 h ; relecture croisée de Cowork verte après deux preuves et une mesure ; ta phrase des « Nouvelles » acceptée telle quelle ; verdict au navigateur et push lancés — « en ligne » reste à constater chez Netlify) — UNE ÉVALUATION OUVERTE DEPUIS LA COPIE GARDE SON STATUT D'INTÉGRITÉ ET SES NOTES QUAND TU L'ENREGISTRES.**
**Ce que tu verras** : rien de nouveau à l'écran. Une évaluation « IA » ou « plagiat » ouverte depuis sa copie s'affiche avec son statut et ses notes, et « Enregistrer » les garde ; avant, elle repassait à « recevable », notes effacées. En passant ensuite à la copie d'un élève sans évaluation, le statut repart à « recevable » (sans quoi « IA » et les notes du précédent auraient suivi). Les anciens statuts de remise (« remis », « non remis ») s'affichent maintenant « Évalué » / « Non reçu » au lieu d'un menu vide, par la copie comme par la Liste des évaluations.
**Vérifié comment** : au navigateur (WebKit), deux bancs qui lisent ta base après « Enregistrer » (`evaluation-959-copie-garde-statut-integrite.spec.js`, `evaluation-959-neutralite-chargeur.spec.js`), rouges sur le code d'avant là où il y avait défaut, verts après ; mode anonymisation compris ; trois sabotages volontaires, tous rouges ; cartouche, échelle, commentaires et niveaux mesurés identiques avant et après ; 7 452 essais Vitest verts. **Pas vérifié** : ton écran, sur tes vraies données.
**Tes données** : rien n'est réécrit. Une évaluation déjà remise à « recevable » par ce chemin ne retrouve pas son statut (non mesuré, à ta demande). **Pas encore réglé** : ouverte depuis la copie, une évaluation réécrit sa rétroaction finale dès l'ouverture — une rétroaction retouchée à la main est remplacée par le texte régénéré ; c'est le prochain lot court, avant le lot B. (#959 ; suivant : #960)

✅ **FAIT EN 1.160.0 (26 SEPTEMBRE 2026, fin d'après-midi ; relecture croisée de Cowork verte après cinq retouches ; tes quatre textes acceptés tels quels ; verdict au navigateur et push lancés — « en ligne » reste à constater chez Netlify) — EN MODE ANONYMISATION, TU TRAVAILLES NORMALEMENT ET TOUT S'ENREGISTRE ; RIEN D'IDENTIFIANT NE S'AFFICHE.**
**Ce que tu verras** : plus de « Modification impossible » en anonymisation. Une évaluation faite en anonymisation ne disparaît plus au rechargement ; « Enregistrer » des présences écrit. Sont masqués (« Masqué en anonymisation ») : la fiche confidentielle entière (et sa pastille verte), les notes et le DA des présences, les textes et notes des interventions, les notes d'intégrité ; le titre d'une intervention devient « Intervention du ‹date› ». Dans la fiche d'un élève, DA, nom et prénom sont masqués et non modifiables ; le reste se modifie. Les « Élève 12 » et « Gr. A » de l'écran ne sont jamais écrits dans tes données. Au passage : la bulle « Rétroaction » des travaux et la suppression d'une copie avec son évaluation ne perdent plus les évaluations de tes autres cours du trimestre (vrai aussi en mode normal).
**Vérifié comment** : au navigateur (WebKit), 10 essais qui lisent ta base après le geste (`lot-a-anonymisation-enregistre.spec.js`, `travaux-lecture-brute-autres-cours.spec.js`), rouges sur le code d'avant, verts après ; 17 sabotages volontaires, tous rouges ; 7 452 essais Vitest verts. **Pas vérifié** : ton écran, sur tes vraies données.
**Tes données** : rien n'est réécrit d'office. Deux choses possibles, non mesurées : des notes individuelles d'intervention enregistrées en anonymisation AVANT aujourd'hui peuvent contenir « Élève N » ; des évaluations d'un autre cours perdues par la bulle des travaux ne reviennent pas. (#751, #736, #958 ; suivant : #959)

✅ **FAIT EN 1.159.13 (26 SEPTEMBRE 2026, midi ; relecture croisée de Cowork verte, sans retouche ; ta phrase des « Nouvelles » validée (option b) ; verdict au navigateur et push lancés — « en ligne » reste à constater chez Netlify) — UNE GRILLE NE PERD PLUS LE CRITÈRE OU LE SOUS-CRITÈRE QU'ON VIENT D'AJOUTER QUAND ON CLIQUE « ENREGISTRER ».**
**Ce que tu verras** : rien de nouveau à l'écran — les mêmes boutons, les mêmes mots. Un critère ajouté par « + Ajouter un critère », un sous-critère ajouté, modifié ou supprimé, ou les sous-critères par défaut restent en place après « Enregistrer ». Avant, « Grille "…" sauvegardée ! » s'affichait et le critère ajouté avait disparu. Les échelles avaient le même défaut, corrigé de la même façon.
**Vérifié comment** : au navigateur (WebKit), en cliquant les vrais boutons de Conception › Grilles et Échelles, et en lisant ce qui est en base (`tests/integration/grille-critere-ajoute-enregistrer-957.spec.js`, 6 essais) ; 5 rouges sur le code d'avant, tous verts après ; un témoin prouve que le bouton écrit encore le nom tapé ; 3 sabotages volontaires, tous rouges ; 7 443 essais Vitest verts. **Pas vérifié** : ton écran, et trois gestes anciens convertis par cohérence dont l'écran semble ne plus exister.
**Tes données** : rien n'est réécrit. Une grille qui a déjà perdu un critère ne le retrouvera pas. (#957 ; trouvé par l'inventaire de l'enregistrement du même matin)

✅ **FAIT EN 1.159.12, EN LIGNE (26 SEPTEMBRE 2026, 10 H 25, mesuré chez Netlify : déploiement de production prêt sur `8ab1b416` ; relecture croisée de Cowork verte avant la fusion, sans retouche ; ta phrase des « Nouvelles » validée telle quelle) — UNE ARCHIVE ROUVERTE PROPOSE AUSSI SES GRILLES, SES ÉCHELLES ET SES PRATIQUES.**
**Ce que tu verras** : en rouvrant un groupe-cours versé à la Réserve, la liste de ce qu'on peut reprendre montre maintenant ses grilles, ses échelles et ses pratiques, pas seulement ses productions et ses cartouches ; et une cartouche n'y est plus marquée « grille manquante » quand sa grille est bien dans l'archive.
**Vérifié comment** : au navigateur (WebKit), un groupe-cours d'un trimestre passé versé en ZIP puis rouvert dans un espace vierge — quatre cas ajoutés au banc de la réouverture (`tests/integration/reserve-reouverture-cartouches-637.spec.js`), rouges sur le code d'avant, verts après ; quatre sabotages volontaires, tous rouges ; relecture de Cowork. **Pas vérifié** : ton écran, et une de tes vraies archives.
**Tes données** : rien n'est réécrit ; seule la lecture de l'archive change. Une cartouche déjà reprise d'une archive, sans sa grille, reste telle quelle. (#953 ; inscrits en chemin : #955, #956)

✅ **FAIT EN 1.159.11 (26 SEPTEMBRE 2026, matin ; relecture croisée de Cowork verte ; tes deux textes validés tels quels ; verdict au navigateur et push lancés — « en ligne » reste à constater chez Netlify) — LES CARTOUCHES ARRIVENT ENTIÈRES : PARTAGE, IMPORT, ARCHIVE.**
**Ce que tu verras** : un fichier de grille partagé dit, dans sa prévisualisation, « Cartouches tirées du trimestre : Automne 2026 » (un fichier plus ancien ne dit rien). Une production importée avec une cartouche qui entre en conflit avec l'une des tiennes désigne la cartouche venue avec elle, plus la tienne ni une cartouche absente. Une archive rouverte propose toutes ses cartouches ; si une grille en a deux versions dans l'archive, c'est celle du trimestre qui est proposée.
**Vérifié comment** : au navigateur (WebKit), trois bancs qui rejouent le vrai geste — un fichier signé passé d'un espace vierge à un autre (`tests/integration/partage-trimestre-cartouches-643.spec.js`), les trois chemins d'import par leur champ réel (`tests/integration/import-cartouche-renommee-654.spec.js`), un groupe-cours versé en ZIP puis rouvert (`tests/integration/reserve-reouverture-cartouches-637.spec.js`) ; chacun rouge sur le code d'avant, vert après ; 23 sabotages volontaires, tous rouges ; un fichier signé en juin se vérifie encore ; 7 443 essais Vitest verts ; relecture de Cowork avec six sabotages de son cru. **Pas vérifié** : ton écran, et un vrai fichier reçu d'une collègue.
**Tes données** : rien n'est réécrit. Une production déjà importée qui pointe vers la mauvaise cartouche reste telle quelle. (#643, #654, #637 ; inscrits en chemin : #952, #953, #954)

✅ **FAIT EN 1.159.10 (25 SEPTEMBRE 2026, soir ; ta phrase des « Nouvelles » validée telle quelle ; verdict au navigateur et push lancés — « en ligne » reste à constater chez Netlify) — DANS UNE SÉANCE DE L'HORAIRE, LE MOT « PÉR. » RESTE AFFICHÉ À CÔTÉ DU NOMBRE DE PÉRIODES.**
**Ce que tu verras** : Cadre › Horaire, une séance remplie se lit « 08:00 à 10:00 · 2 pér. · Local » : le mot, en gris, est hors de la case, dans la même colonne qu'avant — ni rangée ni largeur ajoutées, comme tu l'avais décidé le 17 sept. La case vide n'affiche plus « pér. » en gris à l'intérieur (le mot est déjà à côté).
**Vérifié comment** : au navigateur (WebKit), en ouvrant Horaire, « Nouvel horaire », puis en tapant 2 — à 1180, 820 et 600 px de large : le mot visible, à droite de la case, non recouvert, relié à la case pour un lecteur d'écran, et le local toujours sur la même rangée (`tests/integration/horaire-seance-unite-periodes-888.spec.js`) ; rouge sur le code d'avant ; cinq sabotages volontaires, tous rouges ; 7 425 essais verts. **Pas vérifié** : ton écran. **À regarder** : sur Safari Mac, la case fait environ 43 px et le « 2 » touche ses petites flèches (absentes sur iPad) — ton coup d'œil tranche. (#888)

✅ **FAIT EN 1.159.9, EN LIGNE (25 SEPTEMBRE 2026, 17 H 15, mesuré chez Netlify par Cowork : déploiement de production prêt sur `37baafa1` ; relecture croisée de Cowork rendue AVANT la fusion, acceptée après une correction ; tes trois textes — refus, repère introuvable, « Nouvelles » — validés) — UNE ÉCHELLE PARTAGÉE ARRIVE AVEC SES REPÈRES DE MAÎTRISE, ET LE BILAN DE LA RÉTROACTION FONCTIONNE CHEZ LA PERSONNE QUI LA REÇOIT.**
**Ce que tu verras** : une échelle partagée emporte ses deux repères (« Suffisant à partir de », « Maîtrisé à partir de »), les descriptions de ses niveaux, leur étiquette SOLO, sa description et sa discipline. Chez la collègue qui la reçoit, « Présentement… » et « Points récurrents » parlent comme chez toi. Si un repère désigne un niveau qui n'existe pas dans l'échelle, l'aperçu avant l'import le dit et ce repère seul n'est pas importé. Un fichier qui vient d'une version plus récente est refusé avec « Recharge la page, puis importe-le de nouveau ». Une longue description n'empêche pas le partage.
**Vérifié comment** : au navigateur (WebKit), un vrai fichier de partage signé passe d'un espace vide à un autre ; la destinataire évalue une copie avec l'échelle reçue — avant la correction, le bilan n'affichait rien sous « Présentement » ; après, ses deux lignes (`tests/integration/partage-echelle-reperes-583.spec.js`). Au moteur : `cd tests && npx vitest run unit/partage-echelle-reperes-583.test.js unit/sentinelle-transport-echelles.test.js` — l'envoi, la réception, le repère introuvable, les textes longs, un fichier signé en juin qui se vérifie encore, et le relevé qui fait échouer un essai si un champ d'échelle n'est ni envoyé ni exclu avec sa raison ; neuf sabotages volontaires, tous rouges ; 7 425 essais verts ; suite au navigateur verte sur le commit poussé.
**Tes données** : rien n'est réécrit. Les échelles reçues AVANT cette version n'ont pas leurs repères : on peut les poser dans l'éditeur d'échelle. (#583, #680)

✅ **FAIT EN 1.159.8, EN LIGNE (25 SEPTEMBRE 2026, 14 H 56, mesuré chez Netlify : déploiement prêt sur `4236b7e7` ; ta phrase des « Nouvelles » validée telle quelle ; relecture de Cowork demandée après coup, à ta demande) — EN MODE ANONYMISATION, L'EXPORT LÉA NE PORTE PLUS LE DA RÉEL, NI DANS LE NOM DU FICHIER, NI SUR LA PAGE DE RÉTROACTION.**
**Ce que tu verras** : le PDF se nomme « Élève 32_Artefact-2-rév_Evalue.pdf » au lieu de « Inconnu_‹DA›_… », et l'en-tête de sa page de rétroaction dit « Élève 32 · Gr. A » : plus de DA, plus de « 32 » doublé. Les autres PDF de rétroaction (une copie seule, une synthèse seule) passent par la même page. Hors anonymisation, rien ne change.
**Vérifié comment** : `cd tests && npx vitest run unit/sentinelle-950-export-lea-anonymise.test.js` — six essais sur le vrai moteur d'export et sur la vraie fabrique de la page (nom du fichier, bilans, en-tête, élève absent de la liste, et les deux cas hors anonymisation) ; sept sabotages volontaires, tous rouges ; 7 403 essais verts ; suite au navigateur verte sur le commit poussé. **Éprouvé par toi**, en ligne, le même après-midi : « Ça fonctionne ».
**Tes données** : rien n'est écrit. Le PDF « Inconnu_… » téléchargé avant la correction garde le DA : à supprimer. Ce que l'élève a écrit sur sa copie reste hors d'atteinte. (#950)

✅ **FAIT EN 1.159.7, EN LIGNE (25 SEPTEMBRE 2026, 14 H 27, mesuré chez Netlify : déploiement prêt sur `5cacc875` ; relecture croisée de Cowork verte, sans retouche ; ta phrase des « Nouvelles » — celle de Cowork — validée telle quelle) — DANS LA VISIONNEUSE, UNE COPIE DÉJÀ ÉVALUÉE NE REÇOIT PLUS LA GRILLE, L'ÉCHELLE OU LA CARTOUCHE D'UNE AUTRE COPIE.**
**Ce que tu verras** : rien, si tout va bien. Avant, ouvrir dans la visionneuse une copie évaluée sans cartouche (ou sans échelle) juste après en avoir évalué une autre y posait la cartouche et l'échelle de l'autre, et « Enregistrer » les écrivait dans l'évaluation. Maintenant, ce qui a été enregistré avec la copie fait foi. Une copie sans évaluation reçoit toujours tes derniers choix, comme avant.
**Vérifié comment** : `cd tests && npx playwright test integration/visionneuse-memoire-copie-evaluee-947.spec.js` — au navigateur (WebKit), par la vraie visionneuse : rouge sur la version d'avant par le symptôme exact (l'évaluation recevait la cartouche et l'échelle de l'autre copie), vert après ; une copie évaluée garde les siennes ; une copie sans évaluation reçoit tes derniers choix. Les huit essais au navigateur de la correction d'hier restent verts. Quatre sabotages volontaires, tous rouges ; trois de plus du côté de Cowork. Pas éprouvé par toi : le symptôme n'avait pas été vécu.
**Tes données** : rien n'est réécrit. Des évaluations ont peut-être déjà reçu une cartouche ou une échelle qui n'était pas la leur ; rien ne permet de les reconnaître. (#947)

✅ **FAIT EN 1.159.6, EN LIGNE (25 SEPTEMBRE 2026, 12 H 51, mesuré chez Netlify : déploiement prêt sur `e6f0cdd3` ; ta phrase des « Nouvelles » validée telle quelle ; livrée avant la relecture de Cowork, à ta demande ; relue après coup, verte, sans retouche) — EN MODE ANONYMISATION, L'EXPORT DES TRAVAUX NE LAISSE PLUS PASSER NI NOMS NI DA ; UN EXPORT EN COURS PEUT ÊTRE ARRÊTÉ.**
**Ce que tu verras** : dans « Exporter des travaux », en anonymisation, des dossiers « Élève 32 » (sans DA) et des copies « Élève 32_Artefact 1_1.pdf » ; le fichier des évaluations joint à l'archive ne porte plus de DA, et les rétroactions y remplacent les prénoms (même accentués ou composés : « Éloïse », « Marie-Ève »). Pendant un export, « Arrêter l'export » remplace « Télécharger » ; à l'arrêt, rien n'est téléchargé et aucune copie n'est marquée « exportée ».
**Vérifié comment** : `cd tests && npx vitest run unit/sentinelle-948-anonymisation-export-travaux.test.js unit/sentinelle-949-arreter-export-travaux.test.js` — treize essais sur le vrai moteur d'export et la vraie anonymisation des prénoms, dix sur l'arrêt ; vingt-neuf sabotages volontaires, tous rouges ; suite au navigateur verte sur le commit poussé ; Cowork a rejoué les 23 essais dans son environnement et ajouté sept sabotages à lui. **Pas éprouvé par toi à l'écran** : le bouton « Arrêter l'export » et les noms des dossiers n'ont pas été revus en ligne après la livraison (tes captures de 12 h 06 venaient de la version d'avant).
**Tes données** : rien n'est écrit. L'archive « travaux_a2026_2026-09-25 » exportée ce matin, dans Téléchargements, garde les vrais noms : à supprimer. Restent hors d'atteinte : ce qui est écrit à l'intérieur d'une copie, un nom de famille tapé dans une rétroaction, le prénom d'un élève retiré du groupe, un prénom écrit en capitales. (#948, #949)

⚠ **Trou dans ce fichier** : les versions 1.156.3 à 1.159.5 (du 24 septembre au soir au 25 septembre, 11 h 30) n'y ont pas été reportées. Leur trace est dans `RELAIS.md` et `BACKLOG.md` (#941 à #946).

✅ **FAIT EN 1.156.2, FUSIONNÉE DANS `main` (24 SEPTEMBRE 2026, matin ; ta phrase des « Nouvelles » et les trois titres validés tels quels ; relecture croisée de Cowork verte, 25/25 et sept mutations rouges ; verdict au navigateur et push lancés par `pousser.sh` — « poussée » se lit dans le message de fin de session) — LA RÉTROACTION DIT LES TAMPONS QUE TU POSES, SELON TES RÉGLAGES ; LE TEXTE COPIÉ VERS LÉA GARDE SES PHRASES SÉPARÉES**
**Ce que tu verras** : dans la rétroaction générale, un bloc « --- Observations --- » (il ne s'écrivait jamais) : les mêmes tampons que la rétroaction spécifique, dans le même ordre, sous les mêmes titres de catégorie, avec le nombre et le texte — tes noms, tes textes, tes tampons et catégories personnels, ton ordre, tels qu'ils sont réglés au moment où la rétroaction s'écrit. Le PDF de synthèse lit la même chose : une colonne par catégorie utilisée, dans ton ordre. « Copier » et « Copier tout » séparent paragraphes et titres comme à l'écran.
**Vérifié comment** : au navigateur (WebKit), une copie annotée sur des réglages personnalisés (un nom changé, un tampon et une catégorie personnels, l'ordre changé, un jeton) : la générale et la spécifique listent les mêmes tampons dans le même ordre, le jeton absent, et le texte de « Copier tout » n'a aucune phrase collée ; la même page rougit sur le code d'hier. Treize essais sur le vrai module, onze sabotages volontaires tous rouges.
**Tes données** : rien n'est écrit. Une rétroaction déjà composée et enregistrée garde son texte ; les prochaines portent le bloc. Les anciens tampons d'une vieille copie restent listés (« Qualité », « Diagnostic »), un tampon personnel supprimé depuis aussi (« Autres tampons »).
**À regarder chez toi** : la largeur des colonnes du PDF de synthèse quand des catégories personnelles s'ajoutent (porte terrain, une rangée).

✅ **FAIT EN 1.156.1, FUSIONNÉE DANS `main` (23 SEPTEMBRE 2026, ≈ 22 H 30 ; ta phrase validée mot pour mot, ta phrase des « Nouvelles » validée telle quelle ; relecture croisée de Cowork verte, 4/4 et trois mutations rouges ; verdict au navigateur et push lancés par `pousser.sh` — « poussée » se lit dans le message de fin de session) — LA BARRE « ASSIDUITÉ (A) » DIT POURQUOI ELLE EST VIDE** (#830)
**Ce que tu verras** : dans `Suivi › Suivi du groupe`, sous un groupe dont l'horaire n'a aucune séance avec son nombre de périodes, la barre A affiche « Assiduité non calculée : aucune séance de l'horaire ne porte son nombre de périodes. Tu peux le saisir dans Cadre › Trimestre › Horaire. » au lieu de rester nue. Sans présence saisie, rien ne change (« 1 séance en attente »). Si une partie seulement des séances porte ses périodes, la barre se calcule sur celles-là, sans phrase.
**Vérifié comment** : au navigateur (WebKit), sur la démonstration, l'horaire intact (moyenne, pas de phrase), le mercredi sans périodes (moyenne sur les lundis, pas de phrase), aucune séance avec périodes (la phrase, mot pour mot, plus de moyenne), puis aucune présence (pas de phrase) ; quatre fois cassé exprès (condition inversée, phrase retirée, ancien texte, priorité inversée), rouge chaque fois, remis. **Pas vérifié** : ton écran — seulement si l'un de tes trimestres a un horaire sans aucune période.

✅ **FAIT EN 1.155.5, FUSIONNÉE DANS `main` (23 SEPTEMBRE 2026, ≈ 12 H ; tes mots validés, « étudiant·e » partout ; verdict au navigateur et push lancés par `pousser.sh` — « poussée » se lit dans le message de fin de session) — EN DÉNOTATION, CHAQUE CIBLE GARDE SES COCHES QUAND ON LA DÉPLACE, LA RENOMME OU EN RETIRE UNE AUTRE.** Les cibles s'éditent une par ligne, dans l'assistant comme dans la gestion des pratiques. Retirer une cible déjà cochée demande d'abord, en nommant la cible et le nombre d'étudiant·es ; « Annuler » ne change rien. Les pratiques déjà créées gardent leurs cibles telles quelles. **Vérifié comment** : les deux écrans réels, rejoués par des bancs qui calculent la note par le vrai moteur (retirer la première cible ne fait plus passer une note de 59 à 78), plus un banc au navigateur (Safari, largeur iPad) qui fait les vrais gestes et mesure les boutons à 44 px ; chaque garde a été cassée exprès pour vérifier que le banc rougit. Pas vérifié par toi : tu n'utilises pas la dénotation. Livré avec : dans Annoter, une fois zoomé, on défile jusqu'au bord gauche, et la roue de la palette reste une roue. (#717, #936)

✅ **FAIT EN 1.155.2, FUSIONNÉE DANS `main` (23 SEPTEMBRE 2026 ; relecture croisée de Cowork verte sur le complément, bancs du lot 188/188 ; ta phrase des « Nouvelles » validée ; verdict au navigateur et push lancés par `pousser.sh` — « poussée » se lit dans le message de fin de session) — DANS LE SUIVI D'UN ÉLÈVE, LA COURBE DE PERFORMANCE EST LA NOTE DU COURS, SEMAINE PAR SEMAINE.** Chaque point est la note que le profil aurait affichée ce jour-là, calculée sur les seules évaluations échues, en provisoire (ta décision : le réglage « notes finales » ne compte pas 0 pour une obligatoire pas encore due). En Standards, sommative ou par spécifications ; en dénotation, la courbe n'a plus de point (ta décision : la note est un jugement, pas un calcul). Rien n'est réécrit chez toi : les semaines déjà enregistrées gardent leur ancien point jusqu'à ce que tu cliques « Recalculer les captures » (Réglages › Captures et recherche). **Vérifié comment** : au banc, le point d'une date où tout est échu égale l'indice du profil pour cinq pratiques, et le point d'une date intermédiaire égale la note recalculée sur les seules évaluations échues ; chaque mutation rougit ; sur le pack démo (Standards), une reconstruction change 2 points sur 300, de 1 (57,5 arrondi vers le haut), et le dernier point égale la note du profil pour les 10 élèves. ⚠ Pas vu sur tes données : après « Recalculer les captures », le dernier point de la courbe d'un élève doit égaler la note de son profil. (#716)

✅ **FAIT EN 1.155.1, FUSIONNÉE DANS `main` (22 SEPTEMBRE 2026, ≈ 18 H 30 ; relecture croisée de Cowork verte sur le complément, sentinelle 11/11 ; ta phrase des « Nouvelles » validée ; verdict au navigateur et push lancés par `pousser.sh` — « poussée » se lit dans le message de fin de session) — DANS LE PROFIL D'UN ÉLÈVE, « DÉVELOPPEMENT DES HABILETÉS » DIT LA MÊME CHOSE QUE LA CARTE DE LA NOTE, ET OUVRIR UN PROFIL NE MODIFIE PLUS RIEN.**
**Ce que tu verras** : dans « Méthodologie de calcul », le nombre d'évaluations retenues est celui de ta pratique (4 si elle dit 4, plus « 3 ») ; la liste des retenues est celle de la carte de la note, dans le même ordre, avec les mêmes mots (« 4 meilleurs artefacts sur 5 évalués ») ; « Calcul impossible : aucune évaluation disponible » n'apparaît plus sous une note calculée. Sous une pratique sommative, le panneau ne parle plus d'évaluations « retenues ». La mention « Sélection automatique basée sur les meilleures notes » disparaît : ce n'était pas ta pratique qui choisissait, c'était l'écran.
**Vérifié comment** : onze essais sur l'écran rendu par le vrai code (quatre meilleurs, plus récents, avec terminale, hybride par catégories, sommative, élève sans évaluation, note différée, titre contenant du HTML, pondération manquante) ; un témoin prouve que rendre le panneau laisse le stockage identique octet pour octet ; seize sabotages volontaires, seize attrapés ; relecture de Cowork faite par exécution, complément livré, puis relu vert par Cowork sur une copie tirée par `git archive` (les trois sabotages qui survivaient sont attrapés). Ce qui a déjà été écrit par l'ancien écran reste en place (on cesse d'écrire, on ne nettoie pas) : mesuré, aucune note ni aucun indice ne le lit. **Pas encore vu** : le panneau à l'écran, en vrai navigateur, sur tes données — c'est ton geste, facultatif. (#714)

✅ **FAIT EN 1.155.0, FUSIONNÉE DANS `main` (22 SEPTEMBRE 2026, ≈ 16 H 30 ; relecture de Cowork verte, aucune correction de code ; ton texte du changelog validé ; verdict au navigateur et push lancés par `pousser.sh` — « poussée » se lit dans le message de fin de session) — L'INSPECTEUR DE LA CARTE D'ALIGNEMENT DONNE LA DATE RÉELLE D'UNE LEÇON ET DE L'ÉVALUATION QU'ELLE CONTIENT, UNE LIGNE PAR GROUPE.**
**Ce que tu verras** : double-clic sur une leçon posée (S5, B) — sous « Semaine », une ligne « Date » : « Mercredi 30 septembre · séance B » avec un seul groupe ; avec plusieurs, « Séance B » puis « Gr. 01 : … », « Gr. 02 : … ». Double-clic sur l'évaluation de cette leçon : la même date sous « Dans la leçon ». Changer la semaine ou la séance (dans l'Inspecteur ou l'en-tête du bloc), ou sortir l'évaluation de sa leçon, change la ligne sans rouvrir. Quand la date n'existe pas, la ligne le dit (« Semaine 5, séance non fixée », « Gr. 02 : pas de séance B en semaine 5 », « Aucun horaire saisi pour ce cours », « Hors leçon : pas de date »…) — jamais une date devinée.
**Vérifié comment** : vingt et un essais sur chaque phrase et sur deux groupes aux jours différents ; le geste complet rejoué au navigateur (WebKit) sur la carte de démonstration rattachée à son cours, avec une date témoin calculée indépendamment ; vingt-deux sabotages volontaires, vingt et un attrapés (le dernier, textuel, couvert par le geste au navigateur) ; la date de l'Inspecteur et celle que « Productions étudiantes » propose comme échéance mesurées identiques. **Pas encore vu** : l'aspect de la ligne en mode clair et sombre, et le cas à deux groupes à l'écran — c'est ton geste. (#695)

✅ **FAIT EN 1.154.0, POUSSÉE (22 SEPTEMBRE 2026, ≈ 15 H 15 ; relecture de Cowork verte, tes mots validés avec « étudiant·e » ; suite au navigateur verte sur le commit exact, 0 échec connu ; TA PORTE TERRAIN RENDUE LE SOIR MÊME : 12 passées / 0 échec, Mac et iPad, sur tes vraies données) — DÉPLACER UNE COPIE VERS UNE AUTRE PRODUCTION SE FAIT PAR UN SEUL GESTE, QUI MONTRE LA COPIE, ET EN LOT.** Puis **1.154.1** (ta décision 3.1, « aligner ») : quand l'ancienne production garde une évaluation, la question du geste unitaire dit désormais la même phrase que le geste en lot, avec le nom de l'ancienne production — un seul texte, prouvé par le banc, pas de porte. Retouches après relecture : deux copies sans étudiant·e ne se remplacent plus entre elles ; en mode anonymisation, la question et le récapitulatif disent le nom anonymisé, jamais le vrai (ce défaut vivait déjà dans la question de 1.153.2). Et, sur ta décision, **les noms d'élèves réels sont retirés des fichiers du dépôt** (pas de l'historique) ; règle inscrite dans CLAUDE.md. Porte terrain : `plans de travail/PORTES-TERRAIN-2026-09-22-reassigner-une-copie.md` (trois portes).
**Ce que tu verras** : dans la Liste des évaluations, « Réassocier » s'appelle « Réassigner » et ouvre la fenêtre Propriétés — avec la vignette de la première page et le nom du fichier, pour voir ce que tu déplaces avant de le déplacer. Changer l'élève ou la production passe toujours par la question « Un fichier existe déjà … le remplacer par … ? », qui nomme les deux fichiers et, si tu changes l'élève, l'élève. Sur « Annuler », rien ne bouge et la fenêtre reste ouverte. Le même garde-fou couvre les deux autres endroits qui déplaçaient une copie : la correction d'élève ou de production dans le panneau d'évaluation (elle posait la vieille question muette, sans nommer les fichiers) et le menu Production du tableau d'« Annoter et évaluer » (sur « Annuler », le menu revient à l'ancienne production au lieu de mentir). Et pour le geste de ce matin : filtre la liste sur la production où l'import s'est trompé, coche les lignes qui portent une copie (ou « tout sélectionner », qui suit le filtre), « Réassigner la sélection (N) », choisis la cible — une seule question compte les copies, nomme chaque fichier et chaque conflit (le fichier qui partira à la corbeille), puis tout se déplace d'un coup. La case « jeton de reprise » vit maintenant dans Propriétés.
**Vérifié comment** : trente-huit essais automatiques sur les deux gestes (la question qui nomme l'élève, le refus qui n'écrit rien, la correction d'identité et le tableau qui suivent le verdict, Propriétés qui montre la copie et attend la réponse, le tri de la question groupée, les cases de la liste) ; une passe au navigateur sur une liste de trois copies dont une en conflit (la question nomme le conflit, « Annuler » ne déplace rien, confirmer déplace les trois et met l'ancienne à la corbeille) ; dix-huit sabotages volontaires, tous attrapés ; tous les essais du projet verts. **Tes données** : rien n'est réécrit. Si, avant aujourd'hui, Propriétés ou la correction d'identité avait laissé deux copies pour un même élève et une même production, elles y sont encore : le bandeau « fichiers multiples » de la liste les montre. **Ce qui n'est PAS fait, et c'est décidé** : le tableau d'« Annoter et évaluer » n'affiche toujours pas le nom du fichier — tu ne t'en sers pas, et Propriétés le montre. (#932, #934 ; #933 refusé)

✅ **FAIT EN 1.153.0, POUSSÉE (21 SEPTEMBRE 2026, 19 H 30, sur ton « pousse si vert » ; relecture de Cowork verte deux fois par exécution ; suite au navigateur verte sur le commit exact, 0 échec connu) — un groupe-cours sans pratique de notation n'affiche plus de note calculée par défaut.** Avant, l'application prenait une pratique de remplacement sans le dire (une sommative au tableau de bord, une Standards au profil) : une performance de 87 d'un côté, « aucune pratique assignée » de l'autre, pour le même groupe. Maintenant : complétion et performance se lisent « — », aucun élève n'est signalé pour cette raison, le profil dit où choisir la pratique, et rien n'est effacé (les notes reviennent dès qu'une pratique est assignée). Dans ton groupe, rien ne change : ta pratique est assignée. **Vérifié comment** : sur le vrai moteur, un groupe de banc dont on retire la pratique (six essais : indices, filtres du Suivi, contexte, paliers, rapport, alerte nommée) ; sur la vraie page sous WebKit, le pack démo sans pratique — c'est là qu'on a vu que les dix élèves étaient nommés « sans aucune production remise », corrigé ; le pack démo AVEC sa pratique, avant et après : notes, indices et paliers des dix élèves identiques à l'octet, douze écrans sans différence ; sept mutations, toutes rouges ; 7 026 essais verts. La relecture de Cowork est verte (quatre mutations de son côté). La suite au navigateur, elle, a d'abord été ROUGE, et elle avait raison une fois sur trois : sans pratique et sans présence saisie, un élève qui avait des copies voyait « En attente de données » à la place de ses forces et défis — corrigé, avec son essai. Puis suite au navigateur verte sur le commit exact, machine au repos. Poussée.

✅ **FAIT EN 1.152.6, POUSSÉE (21 SEPTEMBRE 2026, 14 H 25, sur ton « Oui, pousse — je ferme Cowork » ; relecture de Cowork verte par exécution ; suite Playwright sans rougeur nouvelle, Vitest vert ; « en ligne » chez l'hébergeur : non mesuré d'ici) — LE PDF DE SYNTHÈSE REMIS À L'ÉLÈVE NE DIT PLUS « ARTEFACT ».**
**Ce que tu verras** : dans le PDF de synthèse, « production 2 de 5 » (en-tête), « Voici les 4 meilleures productions que tu as réalisées » (rangée de note), « Productions à venir : ». Tes mots de 13 h 00, tels quels. Dans « Nouvelles », une phrase ajoutée à l'item sur le bilan de l'élève, validée par toi.
**Le singulier, tranché par toi à 14 h 03** : quand une seule production est retenue (un élève à sa première évaluation, hors pratique hybride), la phrase aurait donné « Voici les 1 meilleures productions ». Elle dit « Voici la production retenue : » — tes mots : avec une seule production, rien n'est comparé.
**Vérifié comment** : la vraie synthèse rendue jusqu'au HTML du PDF, pour un élève à quatre productions retenues puis à une seule : les phrases exactes sont là, et plus aucun « artefact » dans le texte que l'élève lit. Sept sabotages volontaires, un à la fois (chacune des trois phrases remise à l'ancien mot, « meilleurs » au masculin, le singulier neutralisé, le singulier remis à « artefact », l'ancien singulier remis), font tous rougir la preuve. Tous les essais automatiques du projet : verts (7 000). La suite dans un navigateur : verte sur la version exacte qui a été poussée.
**Tes données** : rien n'est gardé en mémoire, les mots sont écrits à chaque PDF. Les PDF déjà remis gardent l'ancien texte. Si le TITRE d'une de tes productions contient « artefact », il s'imprime toujours tel que tu l'as écrit.

✅ **FAIT EN 1.152.5, POUSSÉE (21 SEPTEMBRE 2026, 14 H 00, sur ton « Oui, pousse » ; relecture de Cowork verte par exécution, son trou de preuve fermé avant le push ; suite Playwright sans rougeur nouvelle, Vitest vert ; « en ligne » chez l'hébergeur : non mesuré d'ici) — UNE NOTE EXACTEMENT EN ,5 MONTE TOUJOURS : 57,5 DONNE 58.**
**Ce que tu verras** : pour un élève dont la note finale est exactement en ,5, le fichier des résultats finaux (celui que tu reportes dans Léa), le profil et le Comparateur disent le même entier, arrondi vers le haut. Quatre valeurs descendaient par erreur : 14,5 · 28,5 · 56,5 · 57,5. Tous les autres élèves : rien ne change. Aucun mot à l'écran ne change ; une phrase de « Nouvelles », validée par toi.
**Le seuil de 60, tranché par toi chiffre en main** : une note qui vaut 59,5 mais que le calcul abîme d'un cheveu (59,4999…) donnait parfois 59 ; elle donne 60, comme le niveau imprimé depuis 1.150. Mesuré sur le vrai moteur : de 1,4 à 3,3 % des notes qui valent 59,5, selon le nombre de productions.
**Vérifié comment** : sur le vrai moteur de calcul, les quatre demies donnent 15, 29, 57 et 58 aux trois endroits (profil, export, indice gardé en mémoire) ; 74,5 → 75 et 59,5 → 60 inchangés ; 57,49 → 57 et 57,51 → 58 inchangés ; les 1 001 valeurs à une décimale de 0 à 100 comparées une à une à un arrondi refait en nombres entiers. Sept sabotages volontaires, un à la fois, font tous rougir la preuve. Une note juste sous la demie (59,4996) reste à 59 : quatre essais ajoutés après la relecture de Cowork. Tous les essais automatiques du projet : verts. La suite dans un navigateur (WebKit) : verte sur la version exacte poussée.
**Tes données** : rien ne s'efface, rien n'est réécrit. Un fichier déjà exporté garde ses chiffres. L'indice du trimestre en cours se recalcule à l'ouverture, comme il l'a toujours fait. Sur le pack de démonstration : 10 élèves, 6 pratiques, aucun entier ne bouge (la note la plus proche d'une demie est 79,52). Tes élèves d'A2026 : non mesuré. Les trimestres passés ne sont pas rouverts.
**Ce que j'ai supposé, à corriger d'un mot** : la complétion (C) passait par le même arrondi et perdait une seule demie réaliste (23 travaux remis sur 40) : corrigée dans le même lot, par la même règle. La règle d'arrondi est recopiée du niveau imprimé plutôt que partagée avec lui, parce que les deux fichiers se chargent séparément ; un commentaire les relie.

✅ **FAIT EN 1.152.4, POUSSÉE (21 SEPTEMBRE 2026, 12 H 57, sur ton « Oui, pousse » ; relecture de Cowork verte ; suite Playwright sans rougeur nouvelle ni spec instable, Vitest vert ; « en ligne » chez l'hébergeur : non mesuré d'ici) — LE BILAN DE L'ÉLÈVE NE PARLE PLUS D'« ARTEFACT » NI DU « NIVEAU É »**
**Ce que tu verras** : rétroaction (onglet Bilan) et PDF de synthèse d'un élève qui a tout maîtrisé deux productions de suite : « Tous les critères sont maîtrisés depuis plus d'une production. Tu peux aider tes collègues : c'est une excellente façon de transférer tes compétences à d'autres contextes. » — ton texte de 11 h 40, tel quel. « Continue sur cette lancée ! » ne change pas. Dans le PDF, une production sans titre (ou disparue) s'appelle « Production », plus « Artefact ».
**Vérifié comment** : le vrai bilan d'écran et la vraie synthèse (jusqu'au HTML du PDF) rendus pour un élève maîtrisé deux fois de suite, sous deux échelles — IDME, et une échelle à quatre niveaux sans É : le texte exact dans les deux, aucun « artefact », aucun niveau nommé, aucun tiret cadratin ; les deux écrans disent les mêmes mots. Onze sabotages, un à la fois, tous vus (l'ancien texte remis dans un seul des deux endroits ; le tiret ; « artefact » ; « niveau É » ; chacun des quatre replis de titre). Suite Vitest complète verte. Pas vu dans un navigateur, ni sur iPad.
**Tes données** : rien n'est écrit ni réécrit. Les rétroactions déjà copiées ou les PDF déjà remis gardent l'ancienne phrase (c'est du texte déjà sorti de l'application) ; les prochains rendus portent la nouvelle. Les anciennes « Nouvelles » gardent leurs mots.
**Ce que j'ai supposé, à corriger d'un mot** : le repli de titre « Artefact » que l'audit situait dans le bilan d'écran vivait en fait dans le module du PDF (trois listes : retenues, obligatoires, à venir) ; l'élève le lit, donc « Production ». Le petit lecteur du « niveau le plus haut de l'échelle » ne servait qu'à l'ancienne phrase : retiré.
**Trouvé, NON changé — ce sont tes mots d'élève** : trois autres « artefact » dans le PDF de synthèse : l'en-tête « artefact 2 de 5 », le titre « Voici les N meilleurs artefacts que tu as produits », et « Artefacts à venir : ».

✅ **FAIT EN 1.152.3, POUSSÉE (21 SEPTEMBRE 2026, 12 H 08, sur ton « push compris » ; relecture de Cowork verte, ses deux compléments de preuve livrés ; suite Playwright sans rougeur nouvelle ni spec instable, Vitest vert ; « en ligne » chez l'hébergeur : non mesuré d'ici) — UN CRITÈRE « FRANÇAIS… » NE DISPARAÎT PLUS DU DIAGNOSTIC**
**Ce que tu verras** : Profil d'un élève › forces et défis : un critère nommé « Français… » y figure de nouveau ; s'il est le plus faible, il devient le défi principal et la cible d'intervention. Deux critères de français (oral, écrit) ont chacun leur valeur. Au profil, la flèche de direction d'un critère « Français… » peut maintenant s'afficher (elle n'était jamais trouvée). Les interventions déjà enregistrées gardent leur bilan. Aucun mot à l'écran ne change.
**Vérifié comment** : sur le vrai code de calcul, trois grilles : chimie avec « Qualité de la langue » au plus bas (inchangé : c'était déjà juste) ; « Français oral » 10 % et « Français écrit » 90 % (deux valeurs, le 10 % est le défi principal — avant : 90 % sur les deux, défi « Compréhension ») ; ta grille, « Français écrit » à 10 % (défi principal « Français écrit », la cible le vise — avant : « Structure »). Le bilan d'une intervention enregistrée avec l'ancienne forme, rendu par le vrai formulaire : avant 40 %, après 70 %, +30 pts. Neuf sabotages, un à la fois, tous vus. Complément demandé par la relecture de Cowork : la flèche du profil et le compte des défis du formulaire d'intervention sont maintenant joués pour de vrai (la ligne « Français écrit » rendue porte « → » ; deux critères de français affichent « 2/2 en défi » et « 1/2 en défi ») — trois sabotages écrits pour passer sous le verrou de texte sont vus par ces essais. Suite Vitest complète verte.
**Tes données** : rien n'est réécrit, ni à l'ouverture d'une intervention ni ailleurs (vérifié : le stock est identique à l'octet après l'ouverture). Les interventions d'avant gardent leur ancienne clé et sont lues avec tolérance — seulement s'il n'y a qu'un critère « Français… » dans ta grille de dépistage ; avec deux (oral, écrit), l'ancienne valeur ne peut être attribuée à aucun des deux et la colonne « Avant » montre « — » plutôt qu'une valeur inventée.
**Ce que j'ai supposé, à corriger d'un mot** : la « moyenne du critère de langue » que la pratique Standards calculait encore n'avait aucun lecteur et aucun rôle dans la note : retirée, pas remplacée. « Le dire au récit » (cas à deux candidats) = le dire ici et au relais, pas à l'écran.
**Aussi dans ce lot** : la garde du contrôle de nuit de GitHub échouait sur une apostrophe depuis le 20 sept. (aucun verdict navigateur rendu par GitHub depuis) : corrigée, erreur reproduite puis levée sur le même extrait ; le run de vérification n'a pas été lancé. Et le rapport d'audit « code en dur » part avec ce lot, corrigé d'une erreur à moi : l'export pour la recherche n'est PAS sans appelant — il compte les niveaux par les lettres I / D / M / E (nouveau constat F3-6 du rapport, proposé « à inscrire »).
**Pas vérifié** : l'écran dans un navigateur (profil, formulaire d'intervention) ; iPad et Safari ; aucune donnée réelle lue.

✅ **FAIT EN 1.152.2, POUSSÉE (21 SEPTEMBRE 2026, 11 H 00, sur ton « oui, pousse » ; relecture de Cowork verte, son trou de preuve fermé ; suite Playwright sans rougeur nouvelle ni spec instable, Vitest vert ; « en ligne » chez l'hébergeur : non mesuré d'ici) — « TOUS » VEUT DIRE TOUS, ET L'EXPORT DIT QU'IL ARRONDIT**
**Ce que tu verras** : une pratique Standards réglée sur « tous » compte toutes les productions évaluées, au profil comme à l'export. Le fichier d'export des résultats finaux titre sa colonne « Note finale (arrondie à l'entier) » ; les notes elles-mêmes ne changent pas. Au Comparateur, sous « tous », la ligne « Productions comptées » dit « Toutes les productions évaluées (2 minimum) » — tes mots, validés ce matin.
**Vérifié comment** : sur le vrai moteur, un élève à six productions (cinq évaluées, une en brouillon) sous « tous », quatre « à retenir » : 77,32 au profil, par l'autre chemin de calcul et par la simulation, 77 à l'export (avant : 76,75 au profil). Rejoué avec trois ordres de rangement différents des évaluations : toujours 77,32 (avant, chaque ordre donnait une autre note). « Meilleurs » et « récents » donnent les mêmes notes qu'avant. Le fichier d'export produit est relu : seule la colonne change de titre, les lignes sont identiques à l'octet. Cinq sabotages volontaires, cinq contrôles qui rougissent ; Cowork en a trouvé un sixième qui passait (une coupe à cinq au lieu de quatre, invisible parce que l'élève du contrôle n'avait que cinq productions) — un élève à sept productions le fait maintenant rougir (#715, #723).
**Tes données** : rien n'est réécrit. La note se calcule à la lecture ; le seul nombre enregistré (l'indice P du trimestre en cours) se recalcule à l'ouverture. Les trimestres passés ne sont pas rouverts.
**Ce que j'ai trouvé en mesurant, et pas touché** : l'entier de l'export est bien un arrondi au plus proche (74,5 → 75), sauf pour quatre valeurs sur cent — 14,5 · 28,5 · 56,5 · 57,5 — qu'un détour de calcul fait tomber vers le bas (57,5 → 57). Aucune ne traverse 60. À toi de dire si ça vaut un correctif. Aussi : le titre du profil écrit « Portfolio (5 tous productions sur 5 évaluées) » sous « tous » — tournure bancale, déjà là avant, pas touchée.
**Pas vérifié** : l'écran lui-même (profil, Comparateur) dans un navigateur ; iPad et Safari.

✅ **FAIT EN 1.152.1, POUSSÉE (21 SEPTEMBRE 2026, 10 H 05, sur ton « push compris » ; relecture de Cowork verte ; suite Playwright sans rougeur nouvelle, Vitest vert ; « en ligne » chez l'hébergeur : non mesuré d'ici) — LE FICHIER ENVOYÉ AUX CHERCHEURS DIT CE QUE L'APPLICATION CALCULE**
**Ce que tu verras** : rien à l'écran. Réglages › Captures et recherche › export anonymisé : l'en-tête du fichier porte la vraie version (1.152.1, et non plus « 6.0.0-beta95 ») et décrit A, C et P comme l'application les calcule, sous le nom Labo Codex.
**Vérifié comment** : le vrai export tourne dans un contrôle et le fichier produit est relu : la version suit celle du code chargé (une autre version chargée, une autre valeur ; sans version, « inconnue ») ; les cinq textes y sont au mot près ; la liste des champs de l'en-tête est la même qu'avant. Huit sabotages, un à la fois (version remise en dur, un mot changé dans chaque texte, un champ ajouté) : huit contrôles rouges. Tous les contrôles automatiques verts.
**Ce que la remesure a changé** : A est bien un ratio de périodes. Pour C, trois façons de noter sur quatre comptent « remis ÷ attendus » ; la pratique par spécifications (celle choisie directement, pas celle de l'assistant) compte les travaux acceptables ÷ requis. Tu as tranché : ajouter la réserve, et dire « productions étudiantes » plutôt qu'« artefacts ».
**Le texte de C, validé par toi à 9 h 43** (la tournure était ma proposition) : « complétion : productions étudiantes remises ÷ productions étudiantes attendues (%) ; en pratique par spécifications, productions acceptables ÷ productions requises ». **Ce que j'ai laissé tel quel** : le texte de A dit « depuis le début du trimestre » ; pour un élève arrivé en retard, le cumul part de sa date d'arrivée : non écrit dans le fichier.
**Tes données** : rien n'est écrit. Un export déjà produit garde son ancien en-tête.

✅ **FAIT EN 1.152.0, POUSSÉE (21 SEPTEMBRE 2026, 9 H 23, sur ton « push compris » ; relecture de Cowork verte ; suite Playwright entière sans rougeur nouvelle ni spec instable, Vitest vert ; « en ligne » chez l'hébergeur : non mesuré d'ici) — CRÉER OU ADOPTER UNE PRATIQUE : CE QUE L'ÉCRAN PROMET EST CE QUI S'APPLIQUE.**
**Ce que tu verras** : Conception › Pratiques de notation : dans un trimestre sans échelle, adopter un modèle Standards affiche ta phrase (« Ce modèle a besoin d'une échelle de performance pour calculer la note, et ce trimestre n'en a aucune. Crée une échelle dans Conception → Échelles de performance, puis reviens adopter ce modèle. ») et n'adopte rien — par l'assistant comme par « Ajouter » de la bibliothèque. L'assistant de pratique ne propose plus plafonnement, remplacement ni reprises ; le Comparateur ne les annonce plus « Actif ». Tes pratiques déjà créées ne perdent rien.
**Vérifié comment** : les deux gestes d'adoption joués dans WebKit par leurs vrais boutons — la fenêtre passe au-dessus, ta phrase y est au mot près, et les pratiques enregistrées sont identiques à l'octet avant et après. Une sommative telle que l'ancien assistant l'écrivait (trois règles, reprises), rouverte par « Éditer la pratique » du Comparateur et enregistrée deux fois : elle garde tout, la seconde fois rien ne change ; sa note reste 50 sous le verrou, au profil, au Comparateur et à l'export. 28 mutations exprès, 28 rouges ; Vitest 607 fichiers / 6 934 essais.
**Tes données** : rien n'est réécrit. On a retiré des cases, pas des données : une pratique qui porte ces règles les garde, même rouverte et réenregistrée.
**Ce que j'ai supposé, à corriger d'un mot** : la fenêtre se ferme par « Fermer » (le bouton standard) et porte en titre le nom du modèle ; après l'avoir fermée, l'assistant ou la bibliothèque reste ouvert ; une pratique ancienne qui ne portait QUE du plafonnement ou du remplacement affiche « Règles spéciales : Aucune » au Comparateur (des mots qui existaient déjà).
**Pas vérifié** : iPad et Safari (la fenêtre s'ouvre au-dessus d'une autre) ; le bouton « Fermer » mesure 37 px de haut, comme tous les boutons de ces fenêtres — sous la cible tactile de 44 px, pas touché ici.
**Deux cases de suivi recalées** : « ajouter un 2e groupe » de Mathieu passe aux corrigés (ses trois causes ont chacune leur correctif, du 15 et du 19 septembre) ; la barre « Assiduité (A) » qui se tait reste ouverte — le tiret « A — » est bien rendu, mais la barre du groupe ne dit toujours rien quand aucune séance ne porte de périodes (un texte à écrire, le tien).
**Aussi** : le petit lot du 19 (les bornes 60 / 75 / 85 restent, « validé empiriquement » s'en va) est enfin commité, seul, comme tu l'as tranché ce matin.

✅ **FAIT EN 1.151.6, POUSSÉE (21 SEPTEMBRE 2026, 1 H 05, sur ton « ligne validée, pousse » ; suite Playwright entière sans rougeur nouvelle, Vitest vert ; « en ligne » chez l'hébergeur : non mesuré d'ici — ta décision du 20 au soir : « je ne veux pas qu'on efface des données de façon irréversible ») — « PROPOSER UN NETTOYAGE » NE RETIRE PLUS QUE LES COPIES DÉJÀ EXPORTÉES.**
**Ce que tu verras** : Évaluations › Exporter et archiver, quand l'espace est presque plein : « Proposer un nettoyage » ouvre « Libérer de l'espace », avec la liste des copies (élève, production, taille, date d'exportation) et le bouton « Retirer ces N copies (X Mo) ». Seules les copies exportées depuis le 16 septembre y figurent ; celles d'avant sont comptées dans une phrase, pas proposées. Si aucune copie n'est exportée : « Rien à retirer sans risque », et aucun bouton de retrait. Tes textes, mot pour mot, plus la phrase des copies évaluées que tu as choisie en session.
**Vérifié comment** : un contrôle passe quatre copies (jamais exportée, « exportée » sans date, exportée le 10 septembre, exportée hier) : seule la dernière est proposée ; et même si on demande à la fonction d'effacer les quatre, elle n'efface que celle-là, le reste du stock identique à l'octet. Au navigateur (WebKit), par le vrai bouton : la liste s'affiche, « Annuler » ne retire rien, le retrait emporte exactement les deux copies annoncées, l'évaluation reste entière, aucun dialogue natif. Huit mutations exprès, huit rouges, fichiers remis à l'identique ; Vitest 606 / 6 911. Capture à la largeur de l'iPad : la liste défile, le bouton reste à l'écran. **Ajout de ma part, dit** : une copie annotée APRÈS son exportation n'est pas proposée non plus (ce travail n'est pas dans le fichier sorti). Relecture croisée de Cowork : une mutation restait verte (une copie re-déposée garde sa date d'exportation) ; deux essais ajoutés, la mutation rougit. Vitest 606 / 6 913. **Pas vérifié** : sur ton iPad réel et tes vraies copies ; la version en ligne. La ligne de « Nouvelles » que tu as validée est écrite. *(#892)*

✅ **FAIT EN 1.151.5, POUSSÉE (20 SEPTEMBRE 2026, 18 H 26, sur ton « écris et pousse » ; suite Playwright entière sans rougeur nouvelle, Vitest vert ; « en ligne » chez l'hébergeur : non mesuré d'ici — ton cas du 15 septembre, ton texte du 17) — L'AIDE DIT COMMENT NOMMER LES PAGES D'UNE REMISE EN PLUSIEURS FICHIERS.**
**Ce que tu verras** : Aide › « Préparer et importer les travaux », sous la liste de « 1. Déposer les fichiers » : ton paragraphe, tel que tu l'as validé — numéroter à la fin du nom (`-p1`, `-p2`… ou `_p 2`, `page 2`, `partie 2`, `part2`, `(2)`), et la lettre finale (`Artefact_1a`, `1b`) qui crée une autre production.
**Vérifié comment** : un contrôle lit les formes DANS l'Aide et les dépose pour vrai dans l'import — les sept noms s'assemblent en un seul document sans doublon ; les deux noms à lettre donnent deux documents et un doublon, comme le texte le dit. Quatre mutations exprès, quatre rouges, fichiers remis à l'identique ; Vitest 605 / 6 895. Rien n'a changé dans l'import lui-même. **Pas vérifié** : le rendu à l'écran (Safari, iPad) — c'est un paragraphe de texte dans une page d'aide existante ; la version en ligne chez l'hébergeur. La ligne de « Nouvelles » que tu as validée est écrite. *(#878)*

✅ **FAIT EN 1.151.0, POUSSÉE (20 SEPTEMBRE 2026, 8 H 28, sur ton « pousse » ; suite Playwright entière sans rougeur nouvelle, Vitest vert ; « en ligne » chez l'hébergeur : non mesuré d'ici) — UNE ÉVALUATION NON ENREGISTRÉE SE VOIT, ET S'ENREGISTRE. Parti de ta question de 2 h 46 : « pourquoi la moitié de mon A24 a une complétion incomplète alors que tout le monde a une note ? »**
**Ce que la mesure a montré (lecture seule dans ton Chrome, rien d'écrit)** : 10 élèves du groupe 00002, pas la moitié — leur portfolio n'a jamais été enregistré ; il ne compte donc ni dans la note ni dans la complétion (ta règle du 16 septembre), d'où 1 remise sur 2 = 50 %, et la moyenne de 81 % de ton écran.
**Ce que tu verras** : (1) « Enregistrer » ne reste plus grisé sous un cadenas ouvert quand tu consultes une évaluation non verrouillée après une verrouillée ; (2) le mot « brouillon » disparaît — « évaluation non enregistrée », ton mot, au profil, dans la note de session et dans le message qui refuse une évaluation incomplète ; (3) dans la liste des évaluations, le badge « Non enregistrée » remplace « Évalué » pour ces copies, et le filtre Statut offre « Non enregistrée ».
**Tes données** : rien n'est réécrit. Tes 10 portfolios restent non enregistrés tant que tu ne les ouvres pas pour cliquer « Enregistrer » ; leur note finale changera alors (le portfolio, poids 60, entrera dans la moyenne). D'ici la mise en ligne, passer d'un élève à l'autre par les flèches rallume déjà le bouton.
**Ce que j'ai supposé, à corriger d'un mot** : le badge prend la couleur de « À réévaluer » ; une reprise en attente garde « À réévaluer » mais sort sous le nouveau filtre ; le filtre « Évalué » inclut encore les non enregistrées ; les anciennes « Nouvelles » gardent « brouillon » ; le message de refus dit « Ton travail est conservé, mais l'évaluation n'est pas enregistrée : complète-la, puis enregistre. »
**Ajouté en 1.151.1, POUSSÉE à 8 h 58 sur ton « pousse » (suite Playwright entière sans rougeur nouvelle)** : Cadre › Trimestre, le menu et la liste des trimestres suivent le calendrier — Automne 2024, Automne 2025, Hiver 2026, Automne 2026. J'ai supposé « ordre du calendrier, du plus ancien au plus récent » plutôt qu'alphabétique strict, qui aurait mis l'hiver 2026 après l'automne 2026. Rien n'est réécrit dans ton registre : seul l'affichage est trié. Vérifié comment : le tri exécuté sur les quatre trimestres de ta capture, trois mutations rouges. (#928)
**À valider par toi** : la prose de l'entrée 1.151 des « Nouvelles » (quatre items).
**Ce que je n'ai pas expliqué** : pourquoi ces 10 copies n'ont pas été enregistrées le 18 (je l'infère du bouton gris, je ne l'ai pas vu). En marge, laissé là : une Analyse terminale non enregistrée et un portfolio sous des numéros absents de ta liste de 51.
**Vérifié comment** : le trajet de ta capture rejoué dans WebKit — rouge avant (cadenas ouvert, bouton éteint), vert après, et le vrai bouton enregistre sans doublon ; badge et filtre éprouvés dans la vraie liste ; cinq mutations rouges, fichiers restaurés à l'identique ; Vitest entier vert. Pas vu : ton iPad, ni l'écran en ligne. (#926, #927)

✅ **FAIT EN 1.150.0, POUSSÉE (19 SEPTEMBRE 2026, FIN DE SOIRÉE) — CE QUE L'ÉLÈVE LIT UNE FOIS SA NOTE CALCULÉE. Poussé sur ton « Oui : validé, pousse », Cowork fermé (mesuré) : le dépôt en ligne est à la 1.150.0 ; suite Playwright entière sans rougeur nouvelle et Vitest verts sur ce commit. Un premier essai de push avait été bloqué, à raison, par une spec du PDF qui refuse de conclure : son montage n'avait pas de dates — réancrée, aucun code changé. Tes décisions du 17 et du 19 sept. sont livrées ; l'entrée de « Nouvelles » 1.150 et les mots des deux avis (lus par des enseignant·es) sont validés par toi le 19 sept. au soir, tels quels ; relecture croisée de Cowork passée sur le correctif.**
**Ce que tu verras** : (1) le niveau imprimé suit la note arrondie — 74,5 % se lit comme 75 % pour trouver le niveau, 74,4 % reste au niveau du dessous ; la note garde ses décimales ; même règle pour le niveau général, le critère qui compte des erreurs et le critère en points. (2) Aucune rétroaction ne porte plus « -- » comme niveau d'un critère. (3) Une copie sans faute reçoit sa note en mode catégories aussi (aucun code, nombre de mots saisi : note complète du critère). (4) Tu ajoutes un critère à une grille déjà utilisée : les évaluations d'avant gardent leur note, leur PDF conclut, et en ouvrant une de ces copies un avis te nomme le critère ajouté depuis — rien de tel n'est imprimé sur le PDF de l'élève. (5) Conception › Grilles : tu passes une grille en « Analytique » alors que des critères n'ont pas de type — sous le menu, « 3 critères de cette grille n'ont pas de type : ils se calculent encore en holistique. » et le bouton « Les passer en analytique » ; rien ne change sans ce geste. (6) Grille introuvable (tes grilles désappariées d'H2026) : un critère « Français écrit » garde les mots du français, à l'écran et sur le PDF.
**Des notes déjà remises cet automne bougent-elles sans ton geste ? Non — mesuré.** Rien n'est recalculé ni réécrit à l'ouverture de l'application ; le niveau et la note enregistrés restent ceux de l'enregistrement. Sur le pack de démonstration (101 évaluations) : 0 niveau général enregistré diffère de la règle neuve, 0 « -- » en base, 0 copie sans faute restée sans résultat, 0 évaluation qui change de conclusion au PDF. Le bouton de l'éditeur de grille ne recalcule aucune note enregistrée (évaluations identiques avant et après, mesuré) : la phrase le dit — « Les 12 évaluations déjà faites avec ces critères gardent leur note. »
**Ce que j'ai supposé, à corriger d'un mot** : (1) un niveau que tu avais choisi À LA MAIN au menu d'un critère, sur une copie sans code, n'est pas remplacé par 100 % — c'était jusqu'ici la seule façon de noter une copie sans faute, et je n'ai pas voulu qu'une réouverture suivie d'un enregistrement change ce choix ; revenu à « Utiliser le niveau calculé », le critère reçoit la note complète. (2) « Ajouté depuis » se MESURE quand c'est possible : l'identifiant d'un critère porte la date de sa création, comparée à la date où l'évaluation a été FAITE (et à elle seule — voir la correction plus bas) ; un critère né AVANT l'évaluation et resté sans niveau n'est pas un ajout, c'est un critère sauté, et le PDF continue de refuser de conclure (la protection du 1er septembre tient). Quand aucune date n'existe, ta règle du 17 s'applique : l'absent est présumé ajouté depuis — sauf pour un brouillon. (3) Sous une grille « Holistique », l'éditeur ne dit rien : un critère sans type s'y calcule déjà en holistique. (4) Sur une échelle aux bornes espacées, le critère en points prend lui aussi le niveau le plus proche (une seule règle pour les trois chemins ; décision de Cowork pour l'algorithmique, étendue par moi). (5) Le « plus proche » reste celui d'avant : la distance au MILIEU de la plage, pas à sa borne — repris tel quel, pas rediscuté.
**Les mots que j'ai écrits (lus par des enseignant·es, pas par des élèves)** : l'avis à l'ouverture d'une copie — « Un critère a été ajouté à la grille après cette évaluation » · « Sources (10 %) » · « La note enregistrée ne le couvre pas et reste valable : le PDF de l'élève conclut normalement. Si tu modifies cette copie, il faudra lui donner un niveau avant d'enregistrer. » ; l'avis de l'éditeur de grille — les mots de Cowork, plus la phrase des évaluations qui gardent leur note. **Aucun mot neuf sur le PDF ni sur la rétroaction de l'élève** : la copie sans faute en mode catégories reçoit la phrase que le mode simple donnait déjà (« Ta rédaction contient 0 erreur de français pour 500 mots. »).
**Tes données** : rien n'est réécrit — ni évaluation, ni grille, ni critère. Le bouton de l'éditeur est ton geste, pas une migration.
**Vu en chemin, commenté dans le code et laissé là** : revenir à « Utiliser le niveau calculé » au menu d'un critère qui compte des erreurs ne relance pas le calcul sur-le-champ ; il se refait à la prochaine frappe ou à l'enregistrement.
**Ce que je n'ai pas pu voir** : tes trimestres réels (combien d'évaluations y portent « -- » comme niveau d'un critère : non mesurable d'ici) ; l'avis de l'éditeur sur ton iPad (mesuré à 768 px dans WebKit, pas vu sur l'appareil).
**Vérifié comment** : les vraies fonctions de calcul, éprouvées par 34 essais neufs (74,4 / 74,5 / 89,5 / 59,5 sur les deux jeux de bornes que l'application sème ; de 0 à 100 par centième, l'arrondi ferme tous leurs trous ; bornes espacées ; copie sans faute dans les deux modes ; grille introuvable à l'écran et au PDF ; le bouton de l'éditeur et la mesure « aucune note ne bouge ») ; les trois cas de la grille rééditée rejoués — les trois concluent ; le vrai geste dans WebKit, vert trois fois de suite : grille passée en « Analytique » à 768 px de large (phrase et compte lus à l'écran, rien d'écrit sans le geste, bouton → types appliqués, évaluations identiques, rien ne déborde), PDF rendu d'une évaluation d'avant l'ajout d'un critère (il conclut, l'avis se lit en ouvrant la copie, ouvrir ne réécrit rien), et son témoin (critère né avant : le PDF refuse) ; 16 mutations, 16 rouges (l'arrondi retiré, « -- » réadmis, la garde réunie, la grille courante, le nom de repli retiré, le bouton qui applique d'office…) ; la suite Vitest entière verte. **Corrigé après la relecture de Cowork, avant tout push** : mon premier jet comparait la naissance du critère à la DERNIÈRE MODIFICATION de l'évaluation. Or retoucher la rétroaction depuis la fenêtre de Travaux marque l'évaluation « modifiée » sans toucher à un seul critère : une évaluation du 5, un critère ajouté le 20, un mot corrigé le 22 — et le PDF refusait de conclure. La date retenue est maintenant celle où l'évaluation a été faite, qu'aucun geste ne déplace ; rien n'est stocké de plus. Rejoué par le vrai geste dans WebKit (ouvrir la fenêtre, corriger le texte, « Sauvegarder » : le PDF conclut toujours) ; la règle fautive remise exprès fait rougir l'essai et le geste. Mesuré aussi : ouvrir une évaluation sans rien changer n'écrit rien (formulaire « Évaluer », 8 s d'attente, verrouillée ou non) ; l'ouverture par une copie dans Travaux n'a pas été sondée — elle ne peut plus rien déplacer. **La mesure du pack de démonstration a trouvé une erreur de mon premier jet** : les critères d'A2025 portent un ancien format d'identifiant (« CR1759243428715 ») que je ne lisais pas ; deux copies où un critère avait été sauté passaient pour antérieures à son ajout. Corrigé et verrouillé par un essai. (#701, #702, #703, #704, #705, #686)

✅ **FAIT EN 1.149.0, POUSSÉE (19 SEPTEMBRE 2026, 16 H 03) — UN GROUPE, C'EST UN NUMÉRO DANS UN COURS. Poussé sur ton « Pousse », Cowork fermé : le dépôt en ligne est à la 1.149.0 ; suite Playwright entière (WebKit) sans rougeur nouvelle et Vitest verts sur ce commit. Libellé du menu choisi par toi (« 00001 · 601-101-MQ ») ; les autres mots de l'écran, l'entrée de « Nouvelles » 1.149 et mes suppositions sont validés par toi (« ok pour tes trois suppositions », 19 sept.).**
**Ce que tu verras** : Cadre › liste du groupe, menu « Groupe » — chaque entrée dit son numéro ET son cours : « 00001 · 601-101-MQ ». Si deux de tes cours ont chacun un groupe 00001, tu vois deux entrées ; la liste ne montre que les élèves de l'entrée choisie ; le compte et « Supprimer le groupe » ne touchent que ce groupe-là. La question de suppression nomme le groupe par son libellé, et la mention « répartis dans N cours » a disparu (elle n'a plus d'objet). « + Nouveau groupe » crée le groupe dans ton cours actif : un second cours peut avoir son propre 00001. Un·e élève ajouté·e à la main rejoint le cours de l'entrée affichée (la phrase « Sera rattaché·e à : » le dit) ; sous « Tous les groupes », le cours actif, comme avant.
**⚠ Ce que ce lot retire, à savoir** : modifier la fiche d'un·e élève ne change plus son cours (avant, l'enregistrer la rattachait à ton cours actif, sans rien dire). C'était le seul geste de l'écran qui déplaçait un·e élève d'un cours à l'autre : depuis l'écran, ce n'est donc plus possible. Je n'ai mesuré aucun parcours qui en dépendait. En modification, la phrase dit « Rattaché·e à : <cours de la fiche> », ou « Rattaché·e à aucun cours. »
**Ce que j'avais supposé, validé par toi le 19 sept.** : (1) une fiche dont le cours n'existe plus dans ta bibliothèque s'affiche « 00004 · Cours <identifiant> » ; (2) si deux cours ont le même code, le nom s'ajoute (« 00001 · 601-101-MQ Écriture et littérature ») ; (3) le menu est trié par numéro, puis par cours ; (4) dans la carte résumé, sous « Tous les groupes », le cours n'est nommé que pour un numéro porté par deux cours — ailleurs la carte se lit comme avant ; (5) taper un numéro déjà pris dans « + Nouveau groupe » choisit simplement ce groupe, comme avant — jugé maintenant dans le cours actif ; (6) les mots « Rattaché·e à : » et « Rattaché·e à aucun cours. », neufs.
**Tes données** : rien n'est déplacé ni réécrit, y compris les fiches sans cours (elles forment « 00003 · sans cours »). Les élèves déjà rattachés au mauvais cours avant la 1.148 y restent : ils paraissent maintenant sous l'entrée de CE cours, ce qui rend l'erreur visible ; les déplacer demande de les supprimer et de les réimporter dans le bon cours. Le choix de groupe mémorisé sous l'ancienne forme (le numéro seul, dont le « 0demo » du pack de démonstration) est toujours lu.
**Mesuré en chemin, pas changé (inscrit)** : à l'étape 3 du groupe-cours et dans « Groupe associé » de l'horaire, les numéros de tous les cours sont encore fusionnés — « 00001 (56 étud.) » additionne deux cours. Tes listes de classe n'en souffrent pas (elles filtrent par cours puis par numéro) ; seul ce compte trompe. Un horaire est associé à un NUMÉRO : deux « 00001 » se disputent le même horaire associé d'office. Filtrer l'étape 3 ne tenait pas en une règle (#925).
**Vérifié comment** : le vrai geste dans WebKit, deux cours portant chacun « 00001 » plus un troisième vide — deux entrées, chacune ses seuls élèves, ajout sous l'entrée du second cours (cours actif inchangé), modification d'une fiche du second cours pendant que le premier est actif (elle y reste), suppression d'un « 00001 » avec lecture de la question (l'autre intact, élèves de démonstration intacts), « + Nouveau groupe » qui propose « 00001 » dans le troisième cours, « 0demo » toujours pré-choisi, aucun débordement de la page à 768 px ; neuf altérations du code, neuf rouges à la sentinelle ET au banc ; les cinq bancs WebKit de cet écran verts ; Vitest entier vert (600 fichiers, 6 821 essais). Pas de porte terrain : le banc voit tout, et rien d'irréversible n'est neuf. Non mesuré : l'écran sur ton iPad (largeur du menu déroulant natif) (#924).

✅ **FAIT EN 1.148.0, POUSSÉE (19 SEPTEMBRE 2026, 15 H 22) — L'IMPORT D'ÉLÈVES DIT OÙ VONT LES ÉLÈVES. Mots validés par toi (« oui avec ta retouche ») ; suite complète WebKit verte au push.**
**Ce que tu verras** : Cadre › liste du groupe › « Importer des étudiant·es » — après « Prévisualiser », sous le tableau : « Ces étudiant·es seront rattaché·es à : » et un menu de tes cours, réglé sur ton cours actif (marqué « (cours actif) »). Tu peux en choisir un autre sur place ; ça ne vaut que pour cet import, ton cours actif ne change pas. Le message de fin nomme le cours : « 28 étudiant·es ajouté·es à 601-102 … ». Au-dessus du formulaire d'ajout à la main : « Sera rattaché·e à : <ton cours actif> », sans menu. C'est le cas de Mathieu : il importait son 2e groupe « dans son 2e cours », les élèves rejoignaient le premier sans que rien ne le dise.
**Le DA à l'import (ta décision du 19 sept., « oui »)** : même règle qu'au formulaire — sept chiffres. Les espaces dans le DA sont retirés avant de juger. Une ligne sans DA, ou au DA non conforme, n'entre pas : dans l'aperçu elle est grisée avec « DA manquant » ou « DA invalide » dans une colonne « À l'import » ; sous le tableau : « 2 lignes ne seront pas importées. Le DA est celui du collège : sept chiffres, rien d'autre. » ; le bouton dit « Importer 26 étudiant·es » (ou « Aucune ligne à importer », inactif) ; le message de fin nomme les lignes laissées de côté par nom et prénom (huit au plus, puis « et N autres »). Un DA déjà dans ta liste est ignoré comme avant ; l'aperçu le dit maintenant (« Déjà inscrit·e ce trimestre »), pour que le compte du bouton soit vrai.
**Ce que j'ai supposé, à corriger d'un mot** : (1) les mots ci-dessus, validés par toi le 19 sept. avec une retouche (« Déjà inscrit·e ce trimestre » au lieu de « Déjà dans la liste ») ; (2) le menu offre tous tes cours, pas « ceux du trimestre » — dans l'application, un cours n'appartient pas à un trimestre (c'est le groupe-cours qui porte la période) ; (3) sans aucun cours, la zone dit « Aucun cours n'existe encore : ces étudiant·es seront importé·es sans être rattaché·es à un cours. » et l'import reste possible ; (4) les espaces À L'INTÉRIEUR d'un DA collé sont retirés (« 123 4567 » entre comme 1234567), alors qu'au formulaire « 123 4567 » est refusé — la consigne le demandait pour l'import ; (5) pas de porte terrain : le menu est un menu natif, rien d'irréversible (un import raté se supprime) — si le menu te gêne sur iPad, tu le dis et on corrige.
**Mesuré en chemin, pas changé** : la liste du Cadre range les élèves par numéro de groupe seulement. Deux cours qui ont chacun un groupe « 00001 » donnent UNE entrée au menu « Groupe », et la liste mêle les élèves des deux cours sans dire à quel cours chacun appartient (mesuré en exécutant : quatre élèves, deux cours, une seule liste). Depuis ce lot, c'est le seul endroit où tu ne peux pas vérifier après coup le cours d'un élève. Cowork t'apporte une phrase de fiche. Aussi : un·e élève déjà inscrit·e à un de tes cours du trimestre ne peut pas être importé·e dans un autre (« Déjà inscrit·e ce trimestre ») — connu, c'est le cas déjà noté pour les services.
**Vérifié comment** : le vrai geste dans WebKit (coller six lignes, Prévisualiser, lire la phrase et le menu, choisir l'autre cours, confirmer) — les trois élèves conformes portent le cours choisi, le cours actif est identique avant et après, aucune fiche au DA vide, un nom collé `<img …>` s'affiche en texte ; vert trois fois de suite ; cinq mutations exprès, cinq rouges. Une sentinelle de quatorze essais, onze mutations, onze rouges. Vitest 600 / 6 815. **Rien de changé dans les données : aucun élève déjà rattaché n'est déplacé.** **Pas vérifié** : le menu au doigt sur ton iPad ; l'import par FICHIER n'est éprouvé que par le même chemin de code que le collage, pas par un vrai fichier déposé. (#887, #923)

✅ **FAIT EN 1.147.2 (19 SEPTEMBRE 2026, ≈ 14 H) — L'APPLICATION N'INVENTE PLUS DE DA. Poussé à ≈ 14 h 20 sur ton « pousse » : le dépôt en ligne est à la 1.147.2 (suite Playwright entière et Vitest verts sur ce commit ; une spec du profil verte au second essai, la même que ce matin). J'ai pris ton « pousse », donné après lecture de la ligne de « Nouvelles » proposée, comme valant pour elle aussi : si tu veux la retoucher, dis-le.**
**Ce que tu verras** : Cadre › liste du groupe, formulaire d'ajout — un DA vide ou qui n'a pas sept chiffres est refusé, rien n'est enregistré, et ce que tu avais tapé reste dans le formulaire pour être corrigé. Avant, un DA vide devenait « DA » suivi de l'heure, sans rien dire. Le champ DA porte maintenant l'astérisque des champs obligatoires, et l'iPad ouvre le clavier des chiffres.
**Le message que j'ai choisi** (lu par des enseignant·es, pas par des élèves) : titre « DA manquant » (champ vide) ou « DA invalide » (autre chose que sept chiffres) ; dessous : « Le DA est celui du collège : sept chiffres, rien d'autre. Rien n'a été enregistré. »
**Ce que j'ai supposé** : les espaces avant et après le DA sont retirés avant de juger (« 1234567 » suivi d'une espace passe ; « 123 4567 » ne passe pas) ; le DA n'est jugé qu'à la création, et en modification seulement si tu l'as changé — un·e élève de démonstration (« DEMO015 ») se modifie donc comme avant, et son DA ne bouge pas ; en modification, effacer le DA est refusé et la fiche reste intacte (avant, l'élève recevait un DA inventé et perdait ses évaluations et ses présences) ; le refus du DA passe avant celui du « DA déjà dans le groupe », qui reste.
**Tes données** : rien n'est écrit ni réparé. Aucun DA existant n'est réécrit, conforme ou non. Compte du stock mesurable d'ici : pack de démonstration, 0 DA fabriqué (ses 111 mentions sont toutes des « DEMO » + trois chiffres) ; fixtures des bancs, 0.
**⚠ Une question pour toi (Cowork te la porte) — l'import collé ou par fichier n'est PAS touché par ce lot, et il laisse passer d'autres formats que celui du collège.** Mesuré en exécutant le vrai import sur cinq lignes collées : « 1234567 » entre ; une ligne SANS DA entre aussi, avec un DA vide ; « 123456 » et « ABC-99 » entrent tels quels ; une deuxième ligne sans DA entre encore — deux fiches au DA vide dans le même groupe, que rien ne distingue (le dédoublonnage saute les DA vides). Message lu : « 5 étudiant·es ajouté·es ». L'import n'invente rien ; il ne refuse rien non plus.
**Vu en chemin, commenté dans le code et laissé là** : un ancien écran d'import (fichier `groupe.js`) fabrique lui aussi des DA « AUTO- » + l'heure — mesuré : cet écran n'existe plus dans la page, rien ne l'appelle.
**Ce que je n'ai pas pu voir** : tes trimestres réels (combien de fiches y portent un DA « DA » + treize chiffres : non mesurable d'ici) ; le clavier chiffré sur ton iPad (déduit de l'attribut, pas vu).
**Vérifié comment** : une sentinelle de quinze essais sur le vrai formulaire (vide, « 123456 », « 12345678 », « DA1234567 », « 123 4567 », chiffres arabes orientaux : refusés, rien d'écrit ; « 1234567 » : accepté ; « DEMO015 » modifié sans toucher au DA : enregistré ; DA effacé en modification : refusé, fiche intacte) — onze rouges sur l'ancien code ; un banc WebKit qui fait le geste dans la vraie page, pack de démonstration actif, et lit le message à l'écran et la liste inchangée (l'édition ouverte par le menu « Action » de la rangée) ; six mutations, six rouges, dont deux rouges aussi dans WebKit — l'une (l'ancien repli remis) ne rougit qu'un essai de lecture du code, parce que la garde le rend inatteignable ; Vitest complet vert. Le banc WebKit du lot de l'assiduité ajoutait ses trois élèves avec des DA en lettres : il passe maintenant par des DA de sept chiffres, et reste vert ; le banc de la rentrée ajoutait un·e élève sans aucun DA : il en reçoit un, et reste vert. La suite Playwright entière a tourné sur ce commit au « pousse » : aucune rougeur. (#914)

✅ **FAIT EN 1.147.1 (19 SEPTEMBRE 2026, ≈ 12 H 30) — TES DEUX PHRASES DE L'ASSIDUITÉ INCONNUE, ET LA LISTE DU GROUPE QUE TU AS VUE SUR L'IPAD. Poussé à ≈ 12 h 50 sur ton « pousse », après la relecture verte de Cowork : le dépôt en ligne est à la 1.147.1 (suite Playwright entière et Vitest verts sur ce commit ; une spec du profil verte au second essai seulement, sans lien mesuré avec ce lot).**
**Ce que tu verras** : (1) au profil d'un·e élève qui a des copies mais aucune assiduité connue, sous le tiret de la carte « Contexte d'apprentissage », ta phrase : « L'assiduité n'est pas encore connue : le contexte s'affichera dès qu'une séance sera saisie pour cet·te étudiant·e. » ; (2) au Suivi du groupe › Détails, le badge « A — » porte ta bulle : « Assiduité inconnue : aucune séance saisie ne compte encore pour cet·te étudiant·e. » ; (3) dans Cadre › Groupe d'étudiant·es, les deux menus de ligne ne disent plus « — » : « Choisir… » pour Action, « Aucune » pour Remarque ; (4) l'en-tête de ce tableau (DA, Grp, Nom…) se lit en mode clair : blanc sur bleu foncé.
**Ce que j'ai supposé** : ta phrase du contexte est écrite en gris, comme une information, pas dans la couleur d'alerte de la carte ; le mode sombre de l'en-tête reste exactement comme tu le connais (il était lisible) ; les deux menus « — » de l'écran des travaux (choisir une production pour un fichier) sont un autre geste, je n'y ai pas touché ; pas de ligne dans « Nouvelles » (textes d'aide, libellés, une couleur).
**Vérifié comment** : le banc WebKit de l'assiduité lit les deux phrases à l'écran, au caractère près ; un banc neuf lit les deux libellés dans le vrai menu et calcule le contraste de l'en-tête dans les deux modes, pack démo actif (avant : 1,13 en mode clair ; exigé : 4,5 au moins) ; cinq protections retirées exprès une à une (chaque phrase, chaque libellé, le fond de l'en-tête), cinq rouges — la dernière rend exactement 1,13, ce que tu as vu ; fichiers restaurés à l'empreinte près ; Vitest 598 / 6 786. La porte iPad de la date d'arrivée est close (ton relevé, 3 / 3), tes deux verdicts y sont inscrits. **Pas vérifié** : l'iPad et Safari pour ces quatre changements (le banc WebKit voit les mots et le contraste : aucune porte). **Dans tes données** : rien d'écrit.
**Vu en chemin, commenté dans le code et laissé là** : la relecture de Cowork signalait un graphique de distribution qui lit l'assiduité sans passer par le lecteur commun — mesuré : ce graphique n'est appelé nulle part, il ne s'affiche sur aucun écran ; même chose pour une ancienne section « Mobilisation » du profil. La note de l'export pour la recherche dit maintenant que l'assiduité finale, elle aussi, peut être vide.

✅ **FAIT EN 1.147.0 (19 SEPTEMBRE 2026, ≈ 11 H 15) — L'ASSIDUITÉ QUI MANQUE : LA DATE D'ARRIVÉE, LE TIRET, LES DEUX MOYENNES. Poussé à ≈ 11 h 40 sur ton « push », avec la 1.146.10 : le dépôt en ligne est à la 1.147.0 (suite Playwright entière et Vitest verts sur ce commit).**
**Ce que tu verras** : (1) dans la fiche d'un·e élève (Cadre › liste du groupe), un champ facultatif « Date d'arrivée », avec ta bulle, mot pour mot ; (2) un·e élève qui porte une date n'hérite plus des séances d'avant comme absences — ni dans son pourcentage, ni dans la liste de ses absences au profil ; sans date, rien ne change ; (3) tant qu'aucune séance n'est saisie pour un·e élève, son assiduité est un tiret : au profil (Engagement, carte de contexte), dans la Liste, au Suivi du groupe, dans le rapport — plus de « 100 % », plus de « Très favorable » sans présence notée ; (4) la moyenne d'assiduité de la Liste et celle du Suivi du groupe disent le même chiffre : l'inconnu n'y entre pas, l'absent total y entre à 0 %.
**Ce que j'ai supposé** : la date s'écrit « AAAA-MM-JJ » (le format d'un champ de date et celui des présences) ; effacer la date à l'écran la retire de la fiche ; dans la Liste, les colonnes Pattern et RàI suivent la même question que la colonne A (« l'assiduité est-elle connue ? ») là où elles demandaient « a-t-il une fiche de présence ? » — conséquence : un absent total qui a des copies y montre maintenant son pattern ; le tri par assiduité range un tiret comme un 0.
**Deux phrases que je n'ai PAS posées, proposées à la porte** : ce que dit la carte de contexte sous son tiret (aujourd'hui : rien), et la bulle du badge « A — » du Suivi (aujourd'hui : aucune).
**Tes données** : rien n'est écrit ni réparé. Aucune fiche ne reçoit de date. Les relevés hebdomadaires déjà écrits gardent leur valeur ; le magasin des assiduités écrit avant ce lot (« 100 %, aucune séance ») est LU comme inconnu sans être réécrit. Sur le pack de démonstration : 0 relevé écrit, 0 entrée « 100 % sans séance ». Aucune note ne lit l'assiduité (mesuré au grep : aucune pratique ne lit ce magasin) ; les valeurs du pack figées dans les bancs d'avant (un élève à 84, 80, 68) n'ont pas bougé, et ajouter les trois élèves du banc ne déplace ni A, ni C, ni P des dix autres.
**Ce que je n'ai pas pu voir** : tes trimestres réels (dans A2025 ou H2026, un·e élève qui lisait « 100 % » faute de séance lira un tiret — déduit de la règle, pas mesuré) ; le sélecteur de date sur iPad (une rangée de porte, non bloquante) ; l'aller-retour par les fenêtres « Exporter » / « Importer » (prouvé par la structure : la fiche voyage entière).
**Vérifié comment** : une sentinelle de dix essais sur le vrai calcul ; un banc WebKit qui ajoute trois élèves par le formulaire (un tardif, un absent total, une inconnue) et lit la Liste, le Suivi, le filtre « A ou C < 70% » et le profil ; onze mutations, onze rouges — l'une était restée verte au premier jet parce que le banc lisait un panneau périmé : banc corrigé, puis rouge ; la suite Vitest entière verte sur le commit (6 786), onze parcours WebKit voisins verts. La suite Playwright complète a tourné au push : verte, aucune rougeur nouvelle. (#735, #743, #750)

✅ **FAIT EN 1.146.4, 1.146.5 ET 1.146.6 (18 SEPTEMBRE 2026, 14 H → 16 H) — TES TROIS RAPPORTS DE L'APRÈS-MIDI SUR LA SAISIE DES NOTES D'A2024, SANS COPIE. Tout est poussé : le dépôt en ligne est à la 1.146.6.**
**Ce que tu verras** : (1) « Enregistrer » par-dessus une évaluation déjà faite écrit la retouche — dans un trimestre sans copie, il n'écrivait RIEN et ne le disait pas ; (2) en tête du formulaire sans copie, une barre « ← Élève 3 de 24 → », que tu arrives par « Évaluer » ou par « Consulter » ; ce que tu viens de saisir est enregistré avant de changer d'élève ; (3) dans le profil, sous la liste des productions, la note de session d'une pratique sommative : chaque production avec sa note et son poids, la ligne de calcul, le total.
**⚠ À faire par toi** : rouvrir les notes que tu avais retouchées vers 13 h 49, 13 h 50 et 13 h 51 — en 1.146.3 ces retouches n'étaient pas écrites, et rien ne dit pour quels élèves. Et recharger l'onglet : à 15 h 49 tu étais encore en 1.146.4, où les flèches utilisées après « Consulter » peuvent montrer un formulaire vide au retour sur un élève.
**Mon erreur du jour** : la 1.146.4 ne posait la barre que par « Évaluer », alors que pour un élève déjà noté la liste n'offre que « Consulter ». Je l'avais écrit comme un écart mineur au lieu de le mesurer au menu ; tu l'as vu en dix minutes. Corrigé en 1.146.5.
**Ce que j'ai supposé** : les mots « Élève N de M », « Élève précédent », « Élève suivant » ; l'ordre de la liste du groupe ; sur la carte de note, le point décimal et « % » collé comme sur la carte PAN voisine, et « Moyenne de 73.9% ramenée à 55.0% par une règle de la pratique » quand la règle « évaluation à réussir » joue. La forme de la carte, c'est toi qui l'as choisie.
**Tes données** : rien n'a été écrit ni réparé dans ton stock. La carte de note ne calcule rien : elle redit la note du moteur, et se tait sur la ligne de calcul si celle-ci ne la redonne pas.
**Ce que je n'ai pas pu voir** : ton A2024 réel ; la carte de note en mode sombre et sur iPad ; la barre cachée quand une copie est ouverte (aucun banc avec copie ne l'éprouve).
**Vérifié comment** : trois bancs WebKit neufs qui font TES gestes (réenregistrer ; flèches par « Évaluer », par « Consulter » sur une évaluation verrouillée, et « Consulter » après « Évaluer » la dernière élève ; carte de note avec et sans plafond) ; le premier rougit sur l'ancien code avec le message exact de ta console ; onze mutations, toutes rouges (deux avaient survécu, les assertions manquantes ont été ajoutées) ; la suite entière verte à chacun des trois push. (#919, #920, #921)

✅ **FAIT EN 1.146.7 (18 SEPTEMBRE 2026, fin d'après-midi) — SOUS UNE PRATIQUE SOMMATIVE, LA SECTION « ENGAGEMENT » DU PROFIL PARLE SOMMATIVE.** Ton rapport de 15 h 49 : « deux travaux, mais un seul est compté », et une carte Performance en mots de portfolio. La carte Complétion liste maintenant les productions que sa fraction compte (ton « 1/2 » : une remise en pastille, l'autre dans les non-remises, C à 50 %). La carte Performance dit « Moyenne pondérée des productions évaluées », montre chaque production avec sa note et SON poids, et affiche le P du moteur — ta précision (« pas 50-50 ») est tenue : 74 pour 67,4 × 40 et 78,3 × 60, là où une moyenne simple donnerait 73. Sous Standards, rien ne bouge. **Vérifié comment** : le symptôme reproduit en WebKit AVANT le correctif, sur la fixture sommative du banc #921 ; un banc neuf de quatre essais qui clique « Engagement » et lit l'écran ; sept protections retirées une à une, sept rouges, fichier remis à l'empreinte près ; bancs #871 (pack démo Standards) et #921 verts ; Vitest 595 / 6 757 après le commit. **Pas vérifié** : ton A2024 réel ; le mode sombre, l'iPad ; la largeur de la pastille maintenant qu'elle porte son poids ; la suite Playwright entière (elle tourne au push). **Ce que j'ai supposé** : (1) sous une sommative, le bloc « Gestion des jetons » ne paraît que si l'élève a un jeton appliqué — tu n'as pas répondu à cette question, corrige-moi si tu utilises des jetons en sommative ; (2) la règle des pastilles vaut pour toute pratique dont le titre dit « production » (une dénotation aussi), mesurée sous sommative seulement ; (3) la phrase de « Nouvelles » est celle que tu as lue avant de répondre « 1 ». **Tes données** : rien n'y est écrit ; ces cartes se recalculent à chaque affichage, aucun stock. ⚠ **COMMITÉ EN LOCAL, PAS POUSSÉ.** (#922)

✅ **FAIT EN 1.146.8 (18 SEPTEMBRE 2026, fin d'après-midi) — NOTE À CATÉGORIES (SÉLECTION ET OBLIGATOIRES) SANS ÉVALUATION TERMINALE : LA CARTE DE NOTE DU PROFIL NE SE CONTREDIT PLUS.** Avec un brouillon d'obligatoire, la colonne « Obligatoires » le comptait dans son addition : la carte écrivait « Note finale = … = 71.0 % » juste au-dessus du vrai total, « 79.8% ». Le total du moteur était juste, c'est l'addition affichée qui était fausse. Le brouillon garde sa ligne, marqué « brouillon, non comptée », et la formule redonne le total. **Vérifié comment** : exécuté en WebKit avant le correctif (la fiche ne l'avait que lu) ; un banc neuf sur une pratique Standards à catégories, total refait à la main (79,75) ; deux protections retirées, deux rouges ; Vitest 595 / 6 757 après le commit. **Pas vérifié** : tes données réelles, le mode sombre, l'iPad. **Ce que j'ai supposé** : « brouillon, non comptée » plutôt que « non remis » sur la ligne — ce sont les mots que la carte emploie déjà plus bas. **Tes données** : rien n'y est écrit. ⚠ **COMMITÉ EN LOCAL, PAS POUSSÉ.** (#896)

✅ **FAIT EN 1.146.10 (19 SEPTEMBRE 2026, matin — la consigne de Cowork de 10 h 17) — DANS LE SUIVI DU GROUPE, LA PHRASE DU BILAN DES FONDAMENTAUX DÉCRIT LE GROUPE AFFICHÉ DÈS QU'IL CHANGE.**
**Ce que tu verras** : après l'ajout, le retrait ou le décrochage d'un·e élève, la phrase sous la barre « Structure des apprentissages fondamentaux » compte tout de suite le bon groupe. Avant, elle décrivait l'ancien groupe jusqu'à l'affichage suivant, alors que la barre juste au-dessus était déjà à jour. Aucun mot de la phrase ne change.
**Tes données** : rien n'y est écrit. La phrase est recalculée à chaque affichage.
**Vérifié comment** : dans la vraie page sous WebKit, sur le pack démo — les dix élèves retirés un à un : la phrase du premier affichage est mot pour mot celle que l'ancien code donnait au second ; un essai durable (élève retiré, rajouté, puis le seul élève en difficulté retiré) et le banc de l'élève en décrochage ramené à un seul affichage ; deux mutations du code, quatre rouges. (#906)

✅ **FAIT EN 1.146.9 (19 SEPTEMBRE 2026, matin — la consigne de Cowork de 9 h 37, ta phrase de « Nouvelles ») — DANS L'ASSISTANT DE PRATIQUE, LA LISTE DES ÉCHELLES N'OFFRE PLUS QUE CELLES DE TA BIBLIOTHÈQUE.**
**Ce que tu verras** : la liste propose les mêmes échelles que l'éditeur de pratique et que la question posée à l'adoption d'un modèle. Une échelle que tu as retirée de la barre latérale n'y paraît plus, sauf si la pratique que tu rouvres l'utilise déjà : elle reste alors choisie, sans mot neuf à l'écran. Si tout est retiré, le message habituel « Aucune échelle de performance n'a été créée » s'affiche, inchangé. Un nom d'échelle venu d'un partage et portant des balises s'affiche comme du texte.
**Tes données** : rien n'y est écrit. Le correctif change ce que la liste offre, pas ce qui est rangé.
**Vérifié comment** : l'étape rendue par sa vraie fonction sur un banc (nom en texte, échelle retirée absente, échelle retirée mais choisie présente ET sélectionnée après la restauration, message quand tout est retiré) ; cinq mutations du code, cinq rouges ; le même parcours dans la vraie page sous WebKit, sur une vraie liste déroulante, rouge lui aussi quand on casse le code. Le pack démo ne porte aucune échelle retirée : aucun cas réel ne demandait un autre comportement. (#910)

✅ **FAIT EN 1.146.2 (18 SEPTEMBRE 2026, début d'après-midi) — LA BARRE D'ÉTAPES EN HAUT DE CADRE › TRIMESTRE SUIT CE QUE TU VIENS D'ENREGISTRER.** Ton rapport de 11 h 52 : A2024 créé, 55 étudiant·es importé·es, un horaire et un groupe-cours créés, et la barre montrait encore ces trois étapes à faire. Elle ne se redessinait qu'à l'ouverture de l'app et au changement de trimestre ; elle se redessine maintenant après chaque enregistrement du Cadre, dans les deux sens (vider la liste décoche l'étape). Aucune donnée n'était en cause, et rien n'est à reprendre chez toi : recharger la page suffisait, et suffit encore tant que la 1.146.2 n'est pas en ligne. **Vérifié comment** : un banc WebKit rejoue le trajet (étudiant·es, horaire, « Créer » un groupe-cours, liste vidée) et lit la barre après chaque geste ; les trois appels retirés un à un, trois rouges, chacun sur son titre ; suite complète 595 fichiers / 6 754 essais après le commit. **Pas vérifié** : la suite Playwright entière (elle tourne au push) ; et ton écran à toi — c'est le seul endroit où « en ligne » se mesure. **Ce que j'ai supposé** : la phrase de « Nouvelles » est de moi, non relue par toi. ⚠ **COMMITÉ EN LOCAL, PAS POUSSÉ** : le push attend ta demande. (#918)

✅ **FAIT EN 1.146.3 (18 SEPTEMBRE 2026, après-midi) — TON RETOUR À LA PORTE : LE DOSSIER DÉPLIÉ PRENAIT TROP DE HAUTEUR ; LES ÉVALUATIONS SONT MAINTENANT DES TUILES CÔTE À CÔTE. ⚠ Commité en local, PAS poussé : Cowork relit d'abord.**
**Ce que tu verras** : dans « Voir le dossier », sous les indices de chaque trimestre (inchangés, en tête), une tuile par évaluation — production, date, note et niveau avec son nom, grille — qui se suivent de gauche à droite puis de haut en bas, dans l'ordre des dates. Un petit triangle en haut à droite ; un clic déplie DANS la tuile ses critères puis sa rétroaction. La tuile voisine ne bouge pas et ne s'étire pas. Une évaluation qui n'a ni critère ni rétroaction est une tuile sans triangle.
**D'où vient la forme** : j'ai mesuré les badges d'« Engagement ACP » du profil avant d'écrire. Leur flux (`.badges-centres` : côte à côte, retour à la ligne, 10 px d'écart) est RÉUTILISÉ tel quel, pas recopié ; les tuiles en reprennent la bordure et l'arrondi. Un seul écart, voulu : alignées à gauche et non centrées, pour que l'ordre des dates se lise comme un texte.
**Ce que j'ai supposé** : (1) tuiles de 280 px de base — DEUX par rangée à la largeur de l'iPad (mesuré au banc), trois ou plus sur le Mac ; (2) la tuile entière est ce qui se déplie : son en-tête sert de bouton, donc **aucun mot neuf à l'écran** ; la rétroaction n'a plus son propre repli, elle suit les critères sous son titre « Rétroaction » (mot existant) ; (3) une tuile ouverte garde sa largeur — l'élargir aurait fait sauter ses voisines à la rangée suivante ; (4) bordure neutre : je n'ai PAS coloré les tuiles selon le niveau, ce serait une lecture ajoutée, à cadrer si tu la veux ; (5) **une phrase de « Nouvelles » 1.146 a dû changer** — « La rétroaction de chaque évaluation se déplie à part » était devenue fausse : « Chaque évaluation est une tuile, et les tuiles se suivent côte à côte dans l'ordre des dates : la production, la date, la note et le niveau se lisent d'emblée ; les critères et la rétroaction se déplient dans la tuile. » — de moi, à relire.
**Tes données** : inchangé — déplier n'écrit rien et ne calcule rien (mêmes contrôles, toujours verts).
**Ce que je n'ai pas pu voir** : le rendu SANS voile. La fenêtre « Protège tes données » recouvrait mes captures ; j'ai vu la disposition à travers elle, et tout le reste est MESURÉ (rangées, ordre, voisine immobile, contraste ≥ 4,5 dans les deux modes, cibles ≥ 44 px, aucun débordement à 768 px). Un chiffre n'est pas un regard : si quelque chose cloche à l'œil, dis-le.
**Vérifié comment** : 12 essais Vitest sur le dossier (4 neufs) ; 4 mutations, toutes rouges — triangle qui ment, flux du profil non réutilisé, voisines étirées, une tuile par rangée ; banc WebKit R5 à 768 px avec cinq évaluations rangées dans le désordre. Le banc a trouvé un défaut DE SONDE, pas d'écran : sous WebKit le contenu d'un repli fermé se dit « visible » à la mesure habituelle — sonde remplacée. Suite complète : 595 fichiers / 6 757 essais.

✅ **PORTE DES LOTS 3-4 RELEVÉE PAR TOI LE 18 SEPT. À 12 H 56 : 3 CONSTATS SUR 3.** Le dossier de ton élève réel se lit, les indices et l'encadré du Cadre sont conformes, tu ne changes aucun mot. **Vérifié comment** : par toi, sur ton corpus, en ligne — « Voir le dossier » n'existe qu'à partir de 1.146, c'est donc la bonne version que tu as jugée (la case du numéro de version n'était pas cochée). Ton retour sur la hauteur du dossier est traité à part, juste après.

✅ **FAIT EN 1.146.1 (18 SEPTEMBRE 2026, début d'après-midi) — LES MOTS NEUFS DU SUIVI LONGITUDINAL, RELUS PAR TOI AVEC COWORK AVANT LE PUSH.** Quatre textes corrigés, tous les autres gardés : le dialogue de « Retirer du registre » (« Sa copie du … (2 dossiers) sera effacée… Ses 3 résultats ultérieurs seront effacés aussi : … », et au singulier « Son résultat ultérieur sera effacé aussi »), l'encadré d'attente (« Ces élèves ont des résultats saisis dans le Cadre, avant que le registre existe : » / « Inscris-les… »), « note impossible à calculer au moment de la copie », et deux phrases de « Nouvelles ». **Ce que j'ai supposé** : la date du dialogue reste écrite comme partout ailleurs sur cet écran (« 2026-09-18 ») — ton exemple disait « 18 sept. », je l'ai lu comme une illustration ; dis-le si tu veux la date en toutes lettres, ce serait alors pour tout l'écran. **Vérifié comment** : les essais qui citaient les anciens textes sont réancrés sur les tiens ; deux mutations sur l'accord (singulier retiré, compte retiré), rouges ; banc WebKit, 5 parcours verts. Ce qui suit (points « mots non relus ») est donc RÉGLÉ.

✅ **FAIT EN 1.146.0 (18 SEPTEMBRE 2026, ≈ 11 h 20) — SUIVI LONGITUDINAL, LOT 4 : LE DOSSIER SE DÉPLIE. Le chantier #915 a livré ses quatre lots. ⚠ Pas encore poussé au moment d'écrire cette ligne : voir RELAIS.md.**
**Ce que tu verras** : sous chaque élève inscrit·e, « Voir le dossier ». Déplié : un bloc par trimestre — la date de la copie, le statut et le programme ; les trois indices tels qu'ils étaient rangés (assiduité avec ses périodes, complétion, performance) ; puis les évaluations dans l'ordre où elles ont eu lieu, avec la note, le niveau et son nom **au moment de la copie**, la grille, chaque critère et son niveau, et la rétroaction repliée à part. Une évaluation remplacée par une reprise le dit.
**Tes données** : déplier ne recalcule rien et n'écrit rien — vérifié (aucune écriture, aucun appel à un calcul d'indice ; registre et trimestres identiques après le geste, au navigateur).
**Ce que la mesure a changé** : j'allais écrire les trois indices à la même échelle. Mesuré dans le code AVANT d'écrire : l'assiduité est rangée de 0 à 1, la complétion et la performance de 0 à 100. Sans cette mesure, l'écran aurait affiché « 5000 % ». Deux mutations tiennent désormais chaque échelle.
**Ce que j'ai supposé** : (1) les mots du dossier sont de moi, non relus — « Voir le dossier », « Indices au moment de la copie », « note non constructible au moment de la copie », « Aucune évaluation dans cette copie. », « remplacée par une reprise », « Production sans nom », et les trois phrases de « Nouvelles » 1.146 ; (2) « au moment de la copie », pas « de fin de trimestre » : la copie peut avoir été faite en cours de trimestre, l'écran ne prétend pas le contraire ; (3) les interventions et les instantanés hebdomadaires SONT dans la copie mais pas encore à l'écran — c'est le « rendu minimal » du cadrage (§ 5.3) ; (4) aucune analyse, aucun graphique, comme convenu.
**Ce que je n'ai PAS pu vérifier** : la forme de TES vraies évaluations. Le banc rend celle du pack démo ; une évaluation ancienne sans nom de production s'affichera « Production sans nom », et un critère sans nom affichera son identifiant. Rien d'irréversible n'en dépend : la porte est courte (3 gestes), `plans de travail/PORTES-TERRAIN-2026-09-18-registre-longitudinal-lots3-4.md`.
**Vérifié comment** : 9 essais Vitest neufs ; 8 mutations une à la fois, toutes rouges ; banc WebKit à 768 px, dossier déplié, **contraste mesuré ≥ 4,5 sur chaque texte dans les deux modes**, aucun débordement, cibles ≥ 44 px. Le regard sur la capture a trouvé un défaut que les chiffres ne voyaient pas : un bloc sans évaluation mangeait 200 px de vide — corrigé. Suite complète : 595 fichiers / 6 754 essais.

✅ **FAIT EN 1.145.0 (18 SEPTEMBRE 2026, ≈ 11 h — tes trois décisions de la porte terrain du lot 2, relevée 7 sur 7) — SUIVI LONGITUDINAL, LOT 3 : LES RÉSULTATS ULTÉRIEURS REJOIGNENT LE REGISTRE, ET ON PEUT EN RETIRER UN·E ÉLÈVE. ⚠ Pas encore poussé au moment d'écrire cette ligne : voir RELAIS.md.**
**Ce que tu verras** : dans Labo › Suivi longitudinal, sous la recherche, UNE ligne de saisie pour tous tes inscrits — Élève, Cours, Trimestre, Note finale, « Ajouter » (ou Entrée). Après un ajout, le cours et le trimestre restent, la ligne passe à l'élève suivant, le curseur est dans la note. Chaque résultat paraît sous le nom de l'élève avec son « Retirer ». Chaque rangée porte un bouton gris « Retirer du registre » : son dialogue nomme l'élève, la copie effacée, et CHAQUE résultat ultérieur qui partirait avec.
**Ce qui a quitté le Cadre** : le bloc « Résultats ultérieurs » de Calendrier › Trimestre n'existe plus (le fichier qui le portait est supprimé). **Ce que tu y avais saisi est toujours dans ton trimestre, intact** : rien ne le réécrit ni ne l'efface. Quand tu inscris l'élève (ou que tu ajoutes ou retires un résultat sous son nom), c'est recopié dans le registre avec la mention « saisi dans le Cadre » ; d'ici là l'écran te nomme les élèves pour qui des résultats attendent. L'export pour la recherche porte les deux sources, sans doublon.
**Sur un trimestre archivé** : tout cela fonctionne SANS cocher « Permission d'écriture » — le registre n'appartient à aucun trimestre. Les champs de cet écran sont une exception nommée de la garde du mode archive.
**Les pluriels** : « 11 évaluations · 32 séances · 1 dossier ». Un seul accord pour tout l'écran.
**Ce que j'ai supposé — à corriger en dix secondes si c'est faux** : (1) la reprise de tes saisies du Cadre se fait **au premier geste** pour l'élève, PAS à l'ouverture de l'onglet — ouvrir n'écrit jamais rien, c'était la règle du lot 1 ; (2) une fois repris, le registre fait foi : un résultat retiré là ne revient pas par l'ancienne saisie ; **limite assumée** : si tu retires l'élève du registre puis le réinscris, ses saisies du Cadre reviennent, puisqu'elles n'ont pas bougé ; (3) la ligne de saisie est placée AVANT la liste, pour qu'elle ne s'éloigne pas quand la liste grandit ; (4) « Retirer du registre » est gris et discret (geste rare), « Retirer » garde l'orange du bloc #913 ; (5) **mots NEUFS, de moi, non relus par toi** : « saisi dans le Cadre », « Des résultats saisis dans le Cadre, avant ce registre, attendent ici : », la phrase d'aide qui suit, « Inscris d'abord un·e élève : ses résultats se rangent sous son nom. », « Choisis un·e élève inscrit·e au registre. », le dialogue de retrait, et les cinq phrases de « Nouvelles » 1.145. Les mots de la saisie sont ceux que tu avais confirmés le 17 sept. pour #913. (6) « Captures de progression » (Réglages › Données) garde son nom : c'est une autre fonction, hors de ce lot.
**Ce que ce lot ne fait pas encore** : le dossier ne se déplie pas (lot 4).
**Vérifié comment** : 38 essais Vitest neufs sur le vrai module + 4 sur le vrai export ; 10 mutations une à la fois, toutes rouges, fichiers restaurés à l'empreinte ; banc WebKit à 768 px, trimestre actif ARCHIVÉ sans permission d'écriture (Entrée dans la note, focus, élève suivant, reprise du Cadre, retrait refusé puis accepté, trimestres identiques octet pour octet) ; une 11e mutation au navigateur (retirer l'exception des champs : les quatre se ferment, rouge). Le banc a trouvé deux défauts avant toi : le menu « Élève » faisait 23 px de haut, et son chevron disparaissait en mode clair — corrigés et mesurés. Suite complète : 594 fichiers / 6 745 essais. ⚠ **La sentinelle de #913 a été RÉANCRÉE, et le banc WebKit de #913 supprimé** : ils jugeaient le bloc du Cadre, qui n'existe plus — ce n'est pas une régression, c'est le lot qui retire ce qu'il remplace.

✅ **FAIT EN 1.144.0 (18 SEPTEMBRE 2026, ≈ 2 h — ta demande du 17 au soir, le cadrage de Cowork relu et corrigé, ton « d'accord » sur la table de navigation) — SUIVRE UN·E ÉLÈVE D'UN TRIMESTRE À L'AUTRE : L'ONGLET ET L'INSCRIPTION (LOTS 1 ET 2).**
**Ce que tu verras** : dans le Labo, un septième onglet « Suivi longitudinal ». Un champ de recherche par nom, qui cherche dans tous tes trimestres (la démo exclue) ; un élève que tu as eu deux fois n'apparaît qu'une fois, ses trimestres en suffixe. « Inscrire au registre » range une copie datée de son dossier : évaluations, grilles et échelles utilisées, présences, interventions (tes notes sur lui seulement), instantanés hebdomadaires, indices tels qu'ils étaient, sélection de portfolio — sans les copies numériques. Sous le bouton, une ligne dit ce qui a été capturé et combien ça pèse. En bas, la liste des inscrits avec leurs trimestres d'origine et la date de capture. Un second passage dit « Re-capturer » et demande confirmation.
**Tes données** : la capture ne touche à rien dans tes trimestres, même archivés — vérifié par 22 contrôles (une seule écriture, sur le registre ; stock identique octet pour octet) et par un contrôle au navigateur (WebKit, largeur iPad) où le trimestre actif est archivé : le champ reste ouvert, le bouton répond, et les données du trimestre sont identiques après. Les indices sont copiés tels qu'ils sont rangés, jamais recalculés : un indice absent est absent, l'écran le dira au lot 4.
**Ce que la mesure a montré** : sur le pack démo, un dossier de 10 évaluations pèse 43 Ko, et le registre de tout un groupe pèse à peu près ce que pèse le trimestre sans ses copies numériques. Un trimestre sans copies importées (ton Automne 2025) ne libère donc rien à la suppression, registre ou pas : c'est un fait sur les données, pas un défaut. La première forme copiait les grilles dans chaque dossier (15 Ko répétés par élève) ; elles sont maintenant rangées une fois par trimestre.
**Ce que j'ai supposé** : les mots de l'écran sont de moi, non relus ; « Inscrire » capture tous les trimestres où l'élève figure, en un geste ; « Refaire la copie » (dit « Re-capturer » jusqu'en 1.144.1 — mot et dialogue remplacés en 1.144.2 sur le retour de Grégoire du 18 sept., #917, mots validés par lui) remplace la copie du même trimestre et garde les autres ; la capture ne demande pas la « Permission d'écriture » du mode archive, puisqu'elle n'écrit pas dans le trimestre.
**Ce que ce lot ne fait pas encore** : la saisie des résultats ultérieurs reste dans le Cadre (lot 3) ; le dossier ne se déplie pas (lot 4) ; **retirer un élève du registre n'est dans aucun lot** — dis ce que tu veux (porte 3.1).
**Vérifié comment** : 22 essais Vitest sur le vrai module ; 16 mutations une clause à la fois, toutes rouges ; banc WebKit à 768 px par le vrai dispatcher (taper, choisir, inscrire) ; suite complète 592 fichiers / 6 728 essais. Porte terrain (mesures sur ton corpus) : `plans de travail/PORTES-TERRAIN-2026-09-18-registre-longitudinal-lot2.md`.

⚠ **Le bloc décrit ci-dessous a QUITTÉ le Cadre en 1.145.0 (18 sept.) : la saisie vit dans Labo › Suivi longitudinal. Ce qui suit est l'historique ; ce que tu y avais saisi est intact.**
✅ **FAIT EN 1.143.0 (17 SEPTEMBRE 2026, ≈ 17 h 15 — ta demande, le cadrage et la consigne de Cowork de 16 h 31, ta phrase de « Nouvelles ») — UN ENDROIT OÙ DÉPOSER LES RÉSULTATS QUE TES ANCIENS ÉLÈVES OBTIENNENT ENSUITE. Poussé le 17 sept. vers 18 h, à ton signal ; ce que sert l'hébergeur ne se mesure pas d'ici.**
**Ce que tu verras** : dans Calendrier › Trimestre, accordéon des étudiant·es, sous la liste, un bloc repliable « Résultats ultérieurs ». Une ligne par élève : le cours, le trimestre, la note finale, « Ajouter » (ou Entrée). Un élève peut en porter plusieurs (102, 103…) ; « Retirer » efface une faute de frappe. Le cours et le trimestre que tu viens de taper sont reproposés à la ligne suivante et le curseur passe à la note de l'élève d'après : trente saisies, trente notes à taper.
**Sur un trimestre archivé** : rien ne s'écrit tant que tu n'as pas coché « Permission d'écriture » dans le bandeau du bas ; l'écran te le dit. C'est la case qui existait déjà, aucune autre.
**Dans l'export pour la recherche** : chaque élève anonymisé porte la liste de ses résultats ultérieurs (vide s'il n'en a pas). Son DA ne sort jamais. Un élève en abandon reste hors du fichier, comme avant.
**Ce que la mesure a montré** : des deux écrans possibles, j'ai pris la liste du Cadre. L'autre (Suivi › Liste des étudiant·es) déborde à la largeur de l'iPad et, surtout, réécrit des indices chaque fois qu'on l'ouvre, même sur un trimestre archivé.
**Ce que j'ai supposé** : le bloc est là sur tous les trimestres, fermé par défaut ; une note à deux décimales est arrondie à une ; les mots de l'écran, proposés par Cowork, tu les as relus et confirmés à 17 h 13 ; le seul que tu as corrigé, le sous-titre, est posé (« Les notes que ces élèves ont obtenues dans les cours qui ont suivi. »).
**Ce que ce lot ne fait pas, exprès** : aucune lecture du fichier de la Direction des études, aucun calcul, aucun graphique, aucun seuil touché.
**Vérifié comment** : 36 contrôles sur les vraies fonctions, dont le vrai export relu (aucun DA dans le fichier) ; un contrôle au navigateur (WebKit) à la largeur de l'iPad – archivé sans permission : les données du trimestre identiques octet pour octet ; deux ajouts, un retrait ; toutes les cibles à 44 px ; 22 sabotages un à un, tous détectés. NON vérifié : sur ton iPad réel, et sur tes vraies données.

✅ **FAIT EN 1.142.33 (17 SEPTEMBRE 2026, ≈ 16 h 15 — ta décision de 15 h, la consigne de Cowork de 15 h 08, ta phrase de « Nouvelles ») — « DOSSIER PDF » REND LA SYNTHÈSE, MÊME SANS COPIE.**
**Ce que tu verras** : dans la Liste des évaluations, « Actions… » › « Dossier PDF » sur une évaluation sans copie te donne un PDF d'une page – la synthèse de rétroaction, la même que celle qui accompagne une copie, sans la section des annotations. Avant : « Aucun fichier trouvé ». Aucun bouton neuf.
**Ce que la mesure a montré** : il n'y avait rien à calculer, seulement un chemin à ouvrir – la synthèse part de l'évaluation, pas de la copie. À savoir : cette page est générée (niveaux par critère, niveau général, bilan, jetons) ; le texte libre de ta rétroaction finale n'y figure pas, avec ou sans copie. Ce n'est pas nouveau, mais pour Automne 2025, où tu recopiais ce texte dans Léa, ça compte.
**Ce que j'ai supposé** : le fichier s'appelle « synthese_Prénom_Nom_production.pdf » (avec une copie, il s'appelle toujours « dossier_… »). Dis-le si tu veux un autre nom.
**Ce qui part vers l'élève est gardé comme avec une copie** : une note qui ne porte pas sur toute la grille refuse de conclure, et tu en es averti avant de remettre le PDF ; ta note privée d'intégrité n'y paraît pas.
**Tes données** : rien n'y est écrit – vérifié sur un trimestre archivé, évaluations et fichiers identiques octet pour octet après la génération. Une évaluation sans aucun critère enregistré donne une page sans tableau de critères, avec le niveau général enregistré ; je ne l'ai pas changé.
**Vérifié comment** : un contrôle au navigateur (WebKit) passe par le vrai menu : rouge sur le code d'avant (« Aucun fichier trouvé »), vert après ; la synthèse est comparée mot pour mot avec et sans copie ; huit sabotages, un morceau à la fois, font tous rougir le contrôle. Les 6 666 contrôles unitaires sont verts.
**Aussi fait** : tes onze décisions de l'après-midi sont posées sous leurs fiches, avec ce qui reste à remesurer pour chacune. La date d'arrivée des élèves (lot 35) est le lot suivant.

✅ **FAIT EN 1.142.32 (17 SEPTEMBRE 2026, ≈ 15 h — ton rapport de 13 h 49, la consigne de Cowork de 13 h 54, ta phrase de « Nouvelles ») — RELIRE UNE ÉVALUATION D'AUTOMNE 2025, LE TRIMESTRE SANS AUCUNE COPIE.**
**Ce que tu verras** : dans Automne 2025, « Consulter » depuis la Liste des évaluations ou depuis le profil ouvre l'évaluation – la grille, les niveaux, la rétroaction – en lecture seule. Plus d'« Erreur de chargement ».
**Ce que la mesure a montré, et que la consigne ne disait pas** : ce n'était aucune des trois pistes. Sur une page fraîchement chargée, tes évaluations sans copie s'ouvraient déjà. Le défaut venait du trajet : évaluer une copie dans le trimestre courant, puis passer à Automne 2025 sans recharger – le formulaire, encore accroché à la copie ouverte, était détruit avec elle. **D'ici la mise en ligne, recharger l'onglet suffit.** Une chose que je n'ai pas pu vérifier chez toi : que tu avais bien évalué une copie avant de changer de trimestre (ton rapport ne garde que tes 20 derniers gestes).
**Aussi corrigé** : ton rapport est parti sans description parce que, dans un trimestre en lecture seule, l'application gelait aussi la case où l'on décrit le problème. Ce n'était pas l'alerte d'erreur. La case et ton prénom restent maintenant saisissables.
**Tes données** : rien n'y est écrit – vérifié : les évaluations du trimestre archivé sont identiques, octet pour octet, après l'ouverture. Tes sept évaluations sans aucun critère enregistré s'ouvrent sur la grille, sans niveau à restaurer ; je ne les ai pas touchées.
**Vérifié comment** : un contrôle au navigateur (WebKit) rejoue ton trajet – la copie évaluée, le changement de trimestre, « Consulter » depuis la liste puis depuis le profil, le trimestre archivé, le formulaire de rapport. Il est rouge sur le code d'avant (ton symptôme, reproduit) et vert après ; six sabotages du correctif, un morceau à la fois, le font tous rougir. Les 6 666 contrôles unitaires sont verts.
**Ce qui n'est PAS fait, et que tu as tranché vers 15 h** : la synthèse de rétroaction pour une évaluation sans copie. Aujourd'hui, « Dossier PDF » répond « Aucun fichier trouvé ». Ta décision : sans copie, « Dossier PDF » rendra la synthèse seule. Livré le jour même en 1.142.33 (voir au-dessus).

✅ **FAIT EN 1.142.31 (17 SEPTEMBRE 2026, ≈ 14 h — la consigne de Cowork de 13 h 18, ta phrase de « Nouvelles ») — ADOPTER UN MODÈLE « N MEILLEURES » OU « N PLUS RÉCENTES » DEMANDE SON ÉCHELLE.**
**Ce que tu verras** : que tu partes d'un modèle dans l'assistant (« ✓ Créer la pratique ») ou que tu l'ajoutes depuis la bibliothèque des pratiques (« Ajouter »), une petite fenêtre s'ouvre au nom du modèle, avec ta phrase – « Ce modèle a besoin d'une échelle de performance pour calculer la note. Choisis-la : » –, les échelles du trimestre et le bouton « Adopter ». Rien n'est coché d'avance, « Adopter » reste gris tant que tu n'as pas choisi, et « Annuler » n'adopte rien. Les autres familles, et un modèle Standards qui a déjà son échelle, s'adoptent comme avant, sans question.
**Ce que ça règle** : le profil de l'élève, l'export des résultats et le Comparateur disent maintenant la même note pour une pratique ainsi adoptée. Avant, le profil calculait pendant que l'export écrivait « non constructible ».
**Ce que la mesure a montré, et que la fiche ne disait pas** : il y avait deux gestes d'adoption, pas un – l'assistant et la bibliothèque. Les deux posent la question. Et la note ne dépend pas de l'échelle choisie : c'est la possibilité de calculer qui en dépend.
**Tes données** : rien n'y est écrit. Une pratique que tu as déjà adoptée sans échelle n'est pas réparée : ouvre-la par l'assistant, il te demandera l'échelle (c'est dit aux « Nouvelles »).
**Vérifié comment** : les deux gestes rejoués par leurs vraies fonctions sur un banc (la question, le refus, l'adoption, la même note aux trois endroits : 78,52 au profil et au Comparateur, 79 à l'export, qui écrit la note entière) ; puis dans la vraie page, sur le pack démo, à la largeur d'un iPad : la fenêtre passe bien au-dessus de l'assistant et de la bibliothèque, porte « IDME et niv 0 » et « IDME 4 niv », et pour Aimé Césaire le profil affiche 61,7 %, le fichier exporté 62. Vingt-sept sabotages volontaires du code, vingt-sept détectés.
**Ce qui t'attend** : (1) une porte terrain sur l'iPad – c'est une fenêtre par-dessus une fenêtre, et Safari seul peut le juger ; Cowork la prépare. (2) Un mot de toi : que doit dire l'écran quand le trimestre n'a AUCUNE échelle ? Aujourd'hui il ne pose pas la question et adopte sans échelle, comme avant (#909).
**Aussi fait, sans rien changer à l'écran** : les preuves que réclamait la relecture de Cowork sur « l'élève exclu reste hors des moyennes ». Le relevé hebdomadaire est maintenant jugé par son comportement. Deux des trois endroits visés n'ont en fait aucun écran (du code que rien n'appelle) ; le vrai trou était à côté, sur les courbes du groupe du tableau de bord, et il est bouché.

✅ **FAIT EN 1.142.30 (17 SEPTEMBRE 2026, ≈ 13 h — la consigne de Cowork de 11 h 58, ta phrase de « Nouvelles » de 12 h 45) — L'EXPORT ANONYMISÉ POUR LA RECHERCHE REND LES VRAIS INDICES.**
**Ce que tu verras** : rien ne change à l'écran. Dans le fichier que produit Réglages › Captures et recherche › « Générer l'export anonymisé », le bloc des indices finaux porte maintenant l'assiduité, la complétion et la performance de chaque élève, de 0 à 100 – il écrivait 0 pour tout le monde, alors que la carte promet « Indices A-C-P anonymisés ».
**Ce que j'ai tranché, et pourquoi** : quand la note d'un élève n'est pas encore constructible, sa performance sort « vide » (`null`) et non 0, avec un champ qui le dit. Ce fichier voyage : un 0 entrerait dans la moyenne d'un chercheur sans que personne le voie ; un vide est lu comme une valeur manquante.
**Ce que la mesure a montré, et que la fiche ne disait pas** : l'assiduité n'a jamais vécu au même endroit que les deux autres indices – corriger « le format » n'aurait rendu que deux indices sur trois. Et le second défaut de la fiche (« les tris de la liste par C, P et N ne trient rien ») n'avait aucun écran : la liste déroulante de tri n'existe plus nulle part. Ce code mort est retiré ; le tri par clic sur les en-têtes de colonne n'est pas touché.
**Tes données** : rien n'y est écrit. Un export déjà produit garde ses zéros : il faut le générer de nouveau (c'est dit aux « Nouvelles »).
**Vérifié comment** : le vrai export tourné sur un banc de trois élèves plus un exclu, et le fichier produit relu – un élève à note constructible (90, 80, 72), un à note non constructible (vide, jamais 0), un dont l'assiduité est dans l'ancien format ; ni matricule, ni nom, ni prénom dans le fichier ; onze sabotages du code, onze détectés. Suite complète verte.
**Ce qui n'est pas fait** : l'en-tête du même fichier dit encore « 6.0.0-beta95 » et décrit la complétion et la performance par deux formules inexactes. C'est noté ; les mots de ces formules sont les tiens (#908).

**Entre les deux, 1.142.29 (≈ 12 h 50, une autre session, ton rapport de 12 h 02)** : le lecteur PDF ne reste plus condamné après un raté de chargement (#907). Vérifié par cette session-là (banc WebKit, verdict Playwright vert), pas par moi ; détail au relais, section « En parallèle du lot 32 ».

✅ **FAIT EN 1.142.28 (17 SEPTEMBRE 2026, ≈ 12 h 15 — ta règle du 16 au soir, tes mots du 17 au matin) — L'ÉLÈVE EN DÉCROCHAGE, INACTIF OU EN ABANDON : SON PROFIL S'OUVRE, CALCULÉ PAR SA PRATIQUE, HORS DES MOYENNES DU GROUPE.**
**Ce que tu verras** : (1) dans la Liste, un clic sur la ligne grisée d'un élève en décrochage ouvre son profil ; avant, l'application répondait « Étudiant·e introuvable ». (2) Sous son nom, une ligne : « Décrochage · hors des moyennes du groupe » (ou « Inactivité », « Abandon »). Le sélecteur d'élèves le montre tant que son profil est affiché ; « Préc. » et « Suiv. » passent par les actifs. (3) Ses indices sont ceux de sa pratique, comme s'il était actif ; dans la Liste, sa ligne montre son assiduité réelle (elle affichait 0 %).
**Ce que la mesure a montré, et que la fiche ne disait pas** : son profil ne s'ouvrait pas du tout depuis le 16 mars – la règle que tu as tranchée n'avait donc aucun écran. Et ses nombres C et P ne venaient du repli « 3 meilleures notes » que s'il n'avait jamais été calculé ; sinon ils restaient figés à leur valeur du jour de l'exclusion. Le repli est retiré ; ses nombres se recalculent maintenant comme ceux des autres.
**Ce qui ne change pas** : aucune moyenne, statistique ou courbe du groupe. « N'est plus dans le groupe » n'a aucun écran neuf : aucun chemin n'ouvre le profil d'un élève retiré du groupe (la mention des Interventions reste la seule).
**Un cas que je te rapporte, sans rien trancher** : un élève exclu sans aucune présence ni copie se lit exactement comme un actif dans le même cas – A 0 % si des séances sont saisies, C 0, note « — ».
**Tes données** : rien n'y est écrit. Les indices sont des caches, ils se rafraîchissent seuls. Ce qui reste tel quel : si un élève exclu figurait dans une intervention déjà enregistrée, l'instantané « avant » de cette intervention garde ses nombres d'avant.
**Vérifié comment** : un banc de trois élèves dont un exclu, sous la sommative et sous les standards : ses nombres calculés à la main (A 40, C 100, P 63 ; P 78 sous les standards), égaux à ceux du même élève actif, pour les trois statuts ; une copie corrigée après l'exclusion déplace sa note ; un élève retiré du groupe n'est pas calculé ; le Suivi du groupe rend les mêmes nombres avec l'exclu que sans lui ; l'en-tête lu dans le HTML produit. Quatorze mutations rouges, dont deux qui gardent le texte et changent le calcul. Dans la vraie page (WebKit, pack démo, Nelson Mandela passé en décrochage) : A 84, C 80, P 68 avant comme après, la ligne de statut sous le nom, à 768 px une ligne de plus sans débordement, et la Liste comme le tableau de bord identiques avec lui exclu et sans lui ; quatre mutations rouges. Vitest : 586 fichiers, 6 604 essais verts.

✅ **FAIT EN 1.142.27 (17 SEPTEMBRE 2026, ≈ 11 h 15 — tes règles du 16 au soir, tes mots du 17 au matin) — UN SEUL PALIER D'INTERVENTION, ET UN BROUILLON NE SIGNALE PLUS.**
**Ce que tu verras** : (1) dans le Suivi du groupe, le bilan des fondamentaux écrit « récente » là où il écrivait « émergente » (« … en difficulté sur les fondamentaux (1 récente, 2 constantes) ») ; « Difficulté émergente » ne désigne plus que le profil d'apprentissage de la carte RàI. (2) Dans l'Aide, le tableau « Comment interpréter les diagnostics ? » n'a plus de colonne « Niveau RàI », dit « Difficulté récente », et porte la ligne « ≥ 3 ↗ Progression lente », que l'application rendait sans que l'Aide la nomme. Aucune phrase de l'Aide n'a été réécrite. (3) Une copie encore en brouillon ne lève plus de signalement de dépistage ; il paraît quand tu l'enregistres.
**Ce que la mesure a montré, et qui est moins que ce que la fiche annonçait** : le second palier (celui du suivi des fondations) existait bien dans le code, mais il n'était lu que par la « cible d'intervention », et aucun écran n'affiche le palier de cette cible. Le filtre « RàI 2-3 » suivait déjà la carte ; le filtre « Suivi » lit la persistance (deux productions de suite sous le seuil), pas un palier. La règle est maintenant vraie dans le code comme à l'écran, et un test la verrouille. Le palier « Insuffisant » du contexte d'apprentissage ne s'affichait jamais : il est retiré, aucune borne n'a bougé, rien ne change à l'écran.
**Une conséquence que je nomme** : un élève jamais présent et sans aucune copie, que la carte RàI dit « En attente », ne compte plus dans la barre des profils d'apprentissage du groupe. Il y entrait comme « Difficulté persistante », sur une performance de zéro.
**Tes données** : rien n'y est écrit, et rien n'y reste à réparer. Le niveau d'une intervention enregistrée venait déjà de la carte RàI ; le signalement se recalcule à chaque lecture.
**Vérifié comment** : l'élève de banc à une seule copie faible, refait à la main (persistance 1, « Difficulté récente », carte RàI niveau 3 : la cible rend 3 ; avant, 1) ; un élève sans grille de référence (la cible rend quand même le palier de la carte) ; trois élèves dont la carte et le suivi se contredisent exprès, pour les filtres et le bilan ; le contexte d'apprentissage sur sept couples de valeurs, bornes comprises ; la même copie en brouillon (aucun signalement) puis enregistrée (un). Vingt sabotages posés un à un, vingt détectés, dont ceux qui gardaient le texte exigé et changeaient le calcul. Avec le lot : le cas « note exactement sur le seuil » du verrou d'hier, et les deux trous de preuve des écrans du groupe que je n'avais pas fermés ce matin. Suite automatisée complète verte.
**Ce qui n'est pas fait** : « Progression lente » compte dans le total du bilan des fondamentaux mais dans aucune de ses phrases ; la phrase à écrire est la tienne, c'est noté dans le code. Déduit du code, non mesuré sur tes données : une copie enregistrée dont aucun critère ne compte (portée nulle) ne lève pas non plus de signalement.

✅ **FAIT EN 1.142.26 (17 SEPTEMBRE 2026, ≈ 10 h — la relecture de Cowork du matin, tes mots de 9 h 15 et ta réponse de 9 h 50) — LA CARTE COMPLÉTION DIT CE QUE DIT SA FRACTION, ET UNE COPIE NON RECEVABLE N'EST PLUS UNE REMISE.**
**Ce que tu verras** : dans le profil d'un élève, la carte Complétion écrit « Productions remises : 9/10 », et la production qui manque paraît dessous, sous « 1 production non remise ou non recevable » — l'évaluation terminale comprise (avant : « 9/10 » à côté de « 0 artefact non remis… Tous les artefacts remis ! »). « Toutes les productions sont remises ! » ne paraît que si rien ne manque. La « Méthodologie de calcul » dit « Indice C = 90% — 9 productions remises / 10 productions au total ». Un brouillon n'est plus montré parmi les artefacts remis : il est dans la liste de ce qui manque, comme l'indice le compte. Les pastilles des artefacts remis gardent ton terme personnalisé (« 9 artefacts remis ») : cette liste ne montre que des artefacts. Le rapport ne change pas.
**Ta décision de 9 h 50, et ce qu'elle déplace** : une copie marquée « plagiat » ou « IA non autorisée » n'est pas une remise. Avant, l'indice la comptait comme remise pendant que la carte la disait non recevable. Elle paraît maintenant dans la liste de ce qui manque, avec son icône d'alerte, et la complétion de l'élève baisse d'autant : dans la démonstration, un seul élève bouge (de 90 % à 80 %), les neuf autres restent au chiffre près. La note, elle, ne change pas. Rien n'est écrit dans tes données : la complétion se recalcule d'elle-même ; les points déjà tracés sur les courbes d'évolution gardent leur valeur.
**Avec le lot, sans mot neuf** : dans l'Exploration des pratiques, une pratique « N derniers » affiche « Récence (dernier essai retenu) » à la ligne des reprises (elle affichait « Selon la sélection d'artefacts ») ; et un trou de preuve que Cowork avait trouvé hier est fermé.
**Vérifié comment** : trois élèves de banc refaits à la main sur les calculs réels (la terminale seule manque : 9/10, un titre au singulier, la terminale dans la liste, pas de message ; deux manquent : accord au pluriel ; tout remis : 10/10 et le message), plus le brouillon, la copie non recevable, « seulement la terminale évaluée » et « rien d'évalué » (l'affichage d'avant, inchangé). La règle « non recevable » est éprouvée sous les trois familles de pratiques et sur les courbes d'évolution. Vingt-neuf sabotages : vingt-huit rouges ; un ne rougissait pas — il a montré qu'une règle était plus compliquée que nécessaire, elle a été simplifiée et un cas ajouté. Dans un vrai navigateur (WebKit), sur la démonstration, pour les dix élèves : le titre compte exactement ce que la fraction laisse, la liste a cette longueur, et les deux élèves que Cowork avait nommés voient leur évaluation terminale dans la liste. Suite complète : 584 fichiers, 6 574 essais verts.
**Ce qui n'est pas fait** : les deux trous de preuve du lot « écrans du groupe » d'hier — la consigne les demandait seulement « si tu passes par ces fichiers », et je n'y suis pas passé.

◐ **FAIT EN 1.142.25, POUSSÉE (17 SEPTEMBRE 2026, ≈ 9 h 30 — ta décision du matin : « brancher » les règles spéciales de la sommative) — LE VERROU S'APPLIQUE À LA NOTE ; LES DEUX AUTRES RÈGLES RESTENT DES PROMESSES, ET C'EST ÉCRIT.**
**Ce que tu verras** : (1) dans une pratique sommative créée par l'assistant avec « Verrou sur une évaluation » coché, la note est maintenant plafonnée quand l'évaluation nommée est sous le seuil — au profil de l'élève comme dans l'export des résultats (dans l'exemple de l'audit : 87,43 devient 50 ; l'export disait « 88, final », il dit « 50, final »). (2) Rouvrir une pratique sommative par l'assistant ne ramène plus ses règles aux valeurs par défaut : le nom de l'évaluation, le seuil, le plafond, le nombre de paires et la condition de plafonnement reviennent tels que tu les avais saisis. C'était ta condition pour brancher ; elle est remplie. (3) Tes cinq textes sont posés tels quels : « Par artefacts », « La dénotation : une PRÉN » et son encadré « disponible », la définition de l'indice P, la définition de « PAN » au glossaire, et la ligne du récapitulatif d'une pratique Spécifications qui dit où régler les types de productions et les forfaits.
**Ce qui n'est PAS fait, et pourquoi** : l'audit disait « le moteur applique déjà ces règles, il suffit de les lui faire lire ». À la mesure, c'était faux : le code qui les appliquait n'était appelé par personne. Le verrou a donc été branché pour de vrai, dans le calcul qui sert. Mais le **plafonnement** et le **remplacement** ne peuvent pas l'être : l'assistant fait saisir la condition du plafonnement en texte libre (« Examen non remis »), qu'aucune machine ne sait lire, et pour le remplacement il ne demande qu'un nombre de paires, sans dire lesquelles. Rien n'a été inventé. L'assistant et le Comparateur continuent de les annoncer comme actifs : c'est à toi de dire si on leur fait collecter davantage ou si on retire ces cases (#903).
**Deux choses à savoir sur le verrou** : le nom que l'enseignant·e tape doit être le titre de la production (« Dissertation » ; majuscules et espaces de bord ne comptent pas) — un nom qui ne correspond à aucune production laisse le verrou muet, sans avertissement. Et tant que l'évaluation nommée n'est pas notée, le verrou ne s'applique pas.
**Tes données** : rien n'y est écrit. Mais une pratique sommative déjà créée avec un verrou coché, et dont une production porte le nom saisi, voit la note changer à cette mise à jour — c'est le but, et la phrase de « Nouvelles » le dit. Mesuré : aucun modèle offert, ni la démonstration, ni les données d'essai n'en portent ; ce que des collègues ont pu créer à la main ne se mesure pas d'ici.
**Vérifié comment** : le banc de l'audit (l'assistant réel crée la pratique, le moteur réel calcule, l'assistant réel la rouvre) : 50 au profil, à la simulation et à l'export ; réenregistrer sans rien toucher ne change plus rien ; huit cas neufs refaits à la main (verrou non déclenché, plafond plus haut que la moyenne, nom en minuscules, nom sans production, copie remplacée par une reprise, copie d'un autre élève, autre type de règle, pratique qui porte déjà ses règles). Trente sabotages (le verrou débranché de deux façons, chacun des huit champs non relu, deux champs lus sous le mauvais nom, chaque texte remis à l'ancien, un mot changé) : trente rouges — deux ne rougissaient pas au premier passage, deux cas ont été ajoutés pour eux. Dans un vrai navigateur (WebKit), le parcours complet par les vrais boutons : le fichier CSV téléchargé porte « 50, final », et le clic sur la pratique montre bien « Types de productions » et « Table des forfaits (bundles) », comme ta phrase le promet. Suite complète : 584 fichiers, 6 557 essais verts.

✅ **FAIT EN 1.142.24 (17 SEPTEMBRE 2026, ≈ 9 h — les suites de l'audit des pratiques de notation que tu as demandées ce matin) — CE QUE L'ASSISTANT ÉCRIT EST CE QUE LA NOTE CALCULE.**
**Ce que tu verras** : (1) une pratique Spécifications créée par l'assistant, tant que ses types de travaux et ses forfaits ne sont pas réglés, n'exporte plus « 0, final » pour toute la classe : l'export écrit « non constructible ». (2) Un modèle « N plus récentes » adopté puis rouvert par l'assistant affiche « N derniers artefacts » et le garde à l'enregistrement ; avant, il revenait à « N meilleurs » sans le dire. Rien n'est écrit dans tes données ; un export déjà téléchargé avec « 0, final » ne se réécrit pas.
**Vérifié comment** : le banc de l'audit du 16, qui crée les pratiques par l'assistant réel et les fait calculer par le moteur réel, est devenu une sentinelle : « non constructible » à la première ET à la deuxième passe ; le modèle rouvert garde son portfolio et sa note (78,52 avant, 78,52 après). S'y ajoute le tour complet par famille — ce qui est écrit est relu, puis calcule — avec chaque nombre refait à la main (83,2 pour « meilleurs », 80,95 pour « derniers » ; 70, 90 et 50 pour les spécifications selon le seuil ; 78 et 59 pour la dénotation). Douze sabotages, douze rouges, dont les cinq que l'audit avait trouvés muets. Dans WebKit, par les vrais boutons : le parcours Spécifications jusqu'au fichier CSV téléchargé, et le modèle adopté, rouvert, enregistré. Suite complète : 583 fichiers, 6 539 essais verts.
**Ce que la vérification a corrigé dans l'audit lui-même** : il disait que rouvrir un modèle « efface tout son portfolio ». Dans la page, non : une étape de l'assistant le protégeait déjà. Le vrai défaut à l'écran était la méthode qui changeait en silence. C'est écrit dans le rapport.
**Arrêté au lot 28, tranché par toi le 17 au matin, ✅ FAIT en 1.142.31 (voir en tête)** : un modèle Standards adopté tel quel calcule au profil mais pas à l'export (il n'a pas d'échelle). L'idée était de compléter l'échelle sans te demander s'il n'y en a qu'une : le pack en porte deux, donc ça ne servirait à presque personne. La vraie réponse demande une phrase (#898). Restent aussi à toi, un à la fois : les règles spéciales de la sommative, promises et jamais appliquées (#897), et quatre phrases de l'application (#901).

✅ **FAIT EN 1.142.23 (17 SEPTEMBRE 2026, ≈ 8 h 15 — ta réponse du matin : « oui, l'évaluation terminale est une remise que la complétion suit ») — LA FRACTION DE COMPLÉTION COMPTE CE QUE COMPTE LE POURCENTAGE.**
**Ce que tu verras** : dans le profil d'un élève (la ligne « Artefacts remis » de la carte Complétion, et la « Méthodologie de calcul ») et dans le rapport, la fraction compte les mêmes productions que le pourcentage, évaluation terminale comprise : « 80% » se lit avec « 8 / 10 », plus avec « 7 / 9 ». Le pourcentage n'a changé pour aucun élève. Une chose que tu remarqueras peut-être : sous « 8/10 », les pastilles de la carte ne listent toujours que les artefacts du portfolio (7 remis, 2 non remis) — l'évaluation terminale n'a pas de pastille. Rien n'est écrit dans tes données ; un rapport déjà copié ne change pas.
**Vérifié comment** : un banc de deux élèves, neuf artefacts et une évaluation terminale, sur les calculs réels des quatre familles de pratiques : l'élève à qui il manque un artefact et la terminale lit « 80% » et « 8 / 10 » aux trois endroits, celui qui a tout remis « 100% » et « 10 / 10 », et sans aucune évaluation l'écran garde « 0% (0 / 0) ». Le même banc, joué sur la version d'avant et sur celle-ci, rend les mêmes pourcentages au chiffre près. Quinze sabotages (un endroit qui recompte à part, la terminale retirée du compte, le pourcentage calculé à part de la fraction, une famille de pratiques oubliée…) : quinze rouges. Dans un vrai navigateur (WebKit), sur la démonstration : les dix élèves gardent leur pourcentage, et les quatre qui se contredisaient concordent ; quatre sabotages rouges, un cinquième qui ne peut pas se voir sur la démonstration et qui est rouge au banc.
**Ce qui reste, écrit, sans urgence** : quand une pratique « à standards » d'origine (pas une pratique configurée) est active, un travail dont l'échéance n'est pas encore arrivée compte déjà dans la complétion — la fraction le montre maintenant (« 8 / 11 »). C'est la règle d'avant, pas une nouveauté ; elle est notée pour que tu en décides un jour (#871).

◐ **FAIT À MOITIÉ EN 1.142.22 (17 SEPTEMBRE 2026, ≈ 7 h 30 — ta règle du 15 au soir : « le pourcentage doit suivre la fraction ») — L'ASSIDUITÉ DU PROFIL MONTRE LES PRÉSENCES TELLES QUE TU LES AS SAISIES. LA COMPLÉTION, ELLE, ATTEND TA RÉPONSE.**
**Ce que tu verras** : dans le profil d'un élève (carte Assiduité, sa « Méthodologie de calcul », ses pastilles d'absence) et dans le rapport, une demi-période s'écrit : « 90% (22,5 / 25 périodes) », plus jamais « 90% (23 / 25) ». Un nombre entier reste entier (« 23 / 25 »). Le pourcentage n'a pas changé : c'est la fraction qui dit maintenant d'où il vient. Dans la démonstration, un élève affiche « 47,2 / 56 » : le pack démo note ses présences en heures, et c'est la valeur exacte du calcul. Rien n'est écrit dans tes données ; un rapport que tu as déjà copié ne change pas.
**Vérifié comment** : un banc qui exécute le vrai calcul de l'assiduité sur cinq séances, puis le vrai lecteur du profil et le vrai rapport — 22,5 / 25 donne « 90% (22,5 / 25 périodes) », 23 / 25 donne « 92% (23 / 25 périodes) », 11 / 12,5 donne « 88% », 0 / 0 garde son écriture ; onze sabotages (l'arrondi remis à la source, au rapport, au dénominateur ; un point au lieu de la virgule ; « 23,0 » ; chaque endroit de l'écran remis à l'ancien texte) : onze rouges. Dans un vrai navigateur (WebKit), sur la démonstration, une présence ramenée à une période et demie : « 55,5 / 56 » aux quatre endroits et « 99 % » ; six sabotages, six rouges. La suite entière : voir le relais.
**Ce qui n'est PAS fait, et pourquoi** : pour la complétion, le pourcentage et la fraction se contredisent encore, chez 4 élèves sur 10 de la démonstration (80 % à côté de « 7 / 9 »). Ce n'est pas une erreur de calcul : l'indice compte l'évaluation terminale parmi les remises (10 productions), la fraction ne compte que les artefacts du portfolio (9). Choisir lequel a raison, c'est dire ce que la complétion mesure : c'est à toi. Rien n'a été touché (#871).

✅ **FAIT EN 1.142.21, POUSSÉE (16 SEPTEMBRE 2026, ≈ 21 h 15 — le lot F du cadrage du soir, « Les écrans du groupe », choisi par toi à 20 h 40) — LE FILTRE DU SUIVI RETIENT CE QUE LE PROFIL DÉCLARE, ET LES COURBES DU GROUPE NE PORTENT PLUS LES NIVEAUX D'UNE ÉCHELLE.**
**Ce que tu verras** : dans Suivi du groupe › Détails, le bouton « A+C < 65% » s'appelle « A ou C < 70% » (ton libellé) et retient l'élève dont l'assiduité OU la complétion est sous 70 %, le seuil « critique » de la carte Mobilisation du profil — le même nombre, lu au même endroit : si ce seuil change un jour, le bouton et la règle suivent. Avant, il fallait que la moyenne des deux soit sous 65, un nombre qu'aucun écran n'affichait : un élève à 65 % d'assiduité et 90 % de complétion passait au travers ; il est retenu maintenant. Un A ou un C affiché « — » n'est pas « sous 70 ». Les courbes du groupe (semaine par semaine, y compris la mesure P) et les trajectoires en mode Note finale n'ont plus de lignes pointillées ni de lettres de niveaux dans la marge : un pourcentage agrégé ne se situe pas dans une échelle de performance (ta décision du 13 sept.). Le mode Habiletés des trajectoires et le graphique par critère du profil les gardent. L'Aide des trajectoires et l'aide de la préférence « Indicateurs visuels des seuils » disent maintenant ce que l'écran dessine — **ces mots sont proposés, pas validés par toi** (le texte est dans `RELAIS.md`).
**Vérifié comment** : un banc qui exécute le vrai filtre sur huit élèves (65/90, 90/65 et 60/80 retenus — l'ancienne règle les écartait tous les trois ; 72/72 écarté ; A absent ou C absent écarté ; 55/90 le plus urgent), le vrai bouton rendu (« A ou C < 70% »), puis le seuil du profil déplacé à 60 : le bouton dit « 60% » et la règle suit ; les deux graphiques construits avec Chart.js remplacé par un enregistreur, chaque plugin rejoué : rien de dessiné sur les courbes du groupe (P et A) ni sur la note finale, les lettres A B C et les lignes bien dessinées en mode Habiletés (témoin) ; huit protections retirées exprès une à une (ancienne règle remise, 70 recopié, garde du « — » retirée, zones remises sur les courbes puis sur la note finale, retirées d'Habiletés, repli sur l'échelle du trimestre remis, marge remise), huit rouges, fichiers restaurés à l'empreinte près. Vitest 580 / 6 506 ; Playwright WebKit au push, Cowork fermé (dit par toi, 21 h). **Pas vérifié** : l'app ; Safari, l'iPad ; la rangée des boutons à 768 px sous WebKit (le bouton ne peut plus se casser en deux lignes, `white-space: nowrap`, mais la rangée peut déborder — pas mesuré). Aucune porte terrain. **Dans tes données** : rien. **Mesuré, inscrit, pas corrigé** : un élève sans donnée d'assiduité s'affiche « A 0% » ou « A 100% », jamais « — » — le lot D du cadrage (le tiret tant que rien n'est noté) s'en charge ; noté sous #830. *(#860, #828 ; #575 close avec elles)*

✅ **FAIT EN 1.142.20, POUSSÉE (16 SEPTEMBRE 2026, ≈ 20 h 30 — complément du lot A, demandé par la relecture croisée de Cowork) — LE RAPPORT DU PROFIL COMPTE LES MÊMES PRODUCTIONS QUE LA COMPLÉTION.**
**Ce que tu verras** : dans le rapport d'un élève, la ligne « Complétion : … (N remises / M productions) » compte les productions comme la complétion elle-même : une production que seuls des brouillons touchent n'y est plus une production évaluée (avant, depuis 1.142.19, le rapport pouvait écrire « 100% (3 remises / 4 productions) »). Rien d'autre ne change à l'écran ; la phrase de « Nouvelles » proposée pour 1.142.19 est reformulée pour couvrir les deux versions, toujours à valider par toi.
**Vérifié comment** : cinq essais de comportement ajoutés au banc du lot A (le quatrième travail en brouillon pour les deux élèves : complétion 3 sur 3 sous la sommative et la configurable, rapport « 3 remises / 3 productions » ; le témoin enregistré remet la production au compte ; un « Non reçu » noté 0 reste une production mais pas une remise ; le « (sur N) » du profil dit 3 puis 4 ; les flèches de direction ne lisent pas le brouillon) ; les cinq protections que Cowork avait contournées en gardant le texte exigé, plus le défaut du rapport et sa copie de secours, reposées une à une : sept rouges. Vitest 579 / 6 494 ; Playwright WebKit au push, Cowork fermé (dit par toi). **Pas vérifié** : l'app. **Dans tes données** : rien. **Mesuré, inscrit, pas corrigé** : le détail de la note hybride sans travail terminal affiche un brouillon d'obligatoire comme une note comptée (colonne « Obligatoires » seulement ; la note du cours est juste). **Question laissée à Cowork pour toi** : une copie en brouillon lève-t-elle un signalement de dépistage ? Le code le fait, la règle du lot dit « nulle part », la page des questions ne montrait pas ce cas. *(complément de #737 ; #896 inscrite)*

✅ **FAIT EN 1.142.19, POUSSÉE (16 SEPTEMBRE 2026, ≈ 19 h 45 — le lot A du cadrage du soir, « les mêmes copies partout », le seul des cinq restants qui ne te demandait aucun mot) — LA NOTE, LA COMPLÉTION, LE DÉPISTAGE ET LA CARTE RàI LISENT LES MÊMES COPIES.**
**Ce que tu verras** : dans le profil d'un élève et dans le Suivi, une copie enregistrée compte partout, avec ou sans commentaire final : la persistance des fondations (IPB), les barres de critères, le défi spécifique et le niveau de la note globale ne l'ignorent plus parce que la zone de rétroaction est vide. Un brouillon (copie commencée, non enregistrée) ne compte plus nulle part : ni dans la complétion, ni dans la performance des derniers travaux, ni dans la carte RàI — avant, il gonflait la complétion et entrait dans le palier. Un travail « Non reçu » (ou « non remis », l'ancien mot) n'entre jamais dans la complétion, sous aucune pratique : un 0 inscrit n'est pas un travail remis. Sa note, elle, suit toujours la règle de la pratique (la sommative compte le 0) : ce n'est pas tranché ici. Aucun mot ne change à l'écran. **La phrase de « Nouvelles » est proposée, pas validée par toi** : dis-la autrement si elle ne te va pas, un patch la remplace.
**Vérifié comment** : un banc de deux élèves et quatre travaux sur les calculs réels (note, complétion sous la sommative, la configurable et la PAN-Standards, captures hebdomadaires, IPB, moyennes, performance des trois derniers, carte RàI, échelle de la note globale) : avec le quatrième travail en brouillon, tout lit les trois mêmes copies (C 75 partout, RàI niveau 2), et la copie sans commentaire compte ; avec le quatrième « non remis » ou « Non reçu » à 0, C 75 partout ; dix-sept protections retirées exprès une à une (filtre du commentaire remis sur chacun des six sites, brouillon réadmis dans la règle puis site par site, « Non reçu » oublié, complétion qui ignore le statut sous chaque famille), dix-sept fois le banc rougit, fichiers restaurés à l'empreinte près. Les bancs d'audit du 5 septembre (B2, B4, C7 du Suivi ; E2 des pratiques) rejoués : ils montrent la valeur d'après. Vitest 579 / 6 489 ; Playwright WebKit au push. **Pas vérifié** : un coup d'œil par toi dans l'app ; Safari, l'iPad. Aucune porte terrain : la mise en page ne bouge pas. **Dans tes données** : rien de changé. Les captures hebdomadaires déjà écrites gardent la complétion d'alors (on tarit la source, on ne réécrit pas le stock) ; la prochaine capture lit la nouvelle règle. ⚠ **Une chose à trancher, mesurée sur le code, pas sur tes données** : une copie que tu as évaluée puis repassée « Non reçu » avant d'enregistrer garde ses niveaux et sa note — elle compte alors partout (note, dépistage) sauf dans la complétion. Aucune au pack démo ni aux bancs ; pour tes données, une sonde d'une ligne est dans `RELAIS.md`. *(#737, #741, #718 ; #738 pour la complétion, sa case reste ouverte pour la note)*

✅ **FAIT EN 1.142.18, POUSSÉE (16 SEPTEMBRE 2026, ≈ 18 h 50 — le lot B du cadrage du soir, celui des six qui ne te demandait ni mot ni vérification à l'écran) — LE DÉPISTAGE LIT CHAQUE CRITÈRE UNE SEULE FOIS : LES POINTS D'ABORD, ET JAMAIS UN CRITÈRE RÉGLÉ « AUCUN ».**
**Ce que tu verras** : dans le profil d'un élève, un critère noté en points (22/30) est lu à 73 % par les barres de critères, la persistance des fondations (IPB), le défi spécifique et les flèches de direction, comme le faisaient déjà les courbes. Avant, le dépistage lisait le niveau déduit (« D » = 65 %), et 22/30 devenait un défi sous le seuil de 70. Un critère réglé « Aucun » au menu « Niveau SOLO » ne sort plus nulle part dans le dépistage : pas de barre, pas de défi principal sur la carte RàI, pas de « Défi spécifique », jamais compté « en défi » ni pré-coché dans les cibles d'une intervention (sa case reste là si tu veux le cibler toi-même). Il compte dans la note comme avant. La phrase de l'Aide sous le menu (« le dépistage des fondations ne le surveille pas ») est maintenant vraie. Aucun mot ne change à l'écran.
**Vérifié comment** : un banc d'un élève et trois copies (Structure 22/30, Rigueur M, Nuance D, Méthode « Aucun » notée I) sur les calculs réels : Structure lue 0,73 et classée force, Nuance seul défi, Méthode absente des moyennes, des barres, de l'IPB, du défi spécifique et des cibles proposées, la note de la copie intacte ; onze protections retirées exprès, onze fois le banc rougit (retour au niveau, filtre retiré, puis site par site). Le banc d'audit du 5 septembre (C5, C6) rejoué : il montre la valeur d'après. Vitest 578 / 6 477 ; Playwright WebKit au push. **Pas vérifié** : un coup d'œil par toi dans l'app ; Safari, l'iPad. Aucune porte terrain : la mise en page ne bouge pas. **Dans tes données** : rien de changé. Une intervention déjà enregistrée avec un critère « Aucun » parmi ses cibles le garde : c'était ton choix d'alors, et on ne réécrit pas tes données d'office. **Ce que la mesure a corrigé de la fiche** : le champ des points s'appelle `ponderation` (celle du critère), pas `pointsMax` ; et sans grille de dépistage choisie, le défi spécifique continue de lire tous les critères, faute de savoir lequel est « Aucun ». *(#739, #740)*

✅ **FAIT EN 1.142.17, POUSSÉE (16 SEPTEMBRE 2026, ≈ 17 h 45 — ton choix du soir, après l'audit de « Exporter et archiver ») — « TÉLÉCHARGER » NE PERD PLUS TOUTE L'ARCHIVE QUAND UNE COPIE EST ILLISIBLE.**
**Ce que tu verras** : dans Évaluations › Exporter et archiver, « Télécharger » (et « Télécharger ZIP des travaux » dans le profil d'un élève) se comporte maintenant comme « Trimestre complet » : si une copie ne peut pas être lue, les autres partent quand même, et un bilan nomme celle qui manque. Le nom du ZIP et des dossiers garde les accents (« Écrit 1 », plus « _crit_1 ») et ne se casse plus sur un nom d'élève qui contient une barre oblique. Une copie qui n'a pas pu partir n'est plus marquée « exportée ». « Trimestre complet » nomme aussi, désormais, une copie dont le fichier manque (avant, il la sautait sans le dire). Rien ne change aux mots de l'écran : le bilan est celui qui existait déjà.
**Vérifié comment** : un banc de trois copies dont une illisible, sur les trois exports par ZIP et sur les deux boutons : deux copies dans l'archive et un échec nommé, nom de ZIP assaini, « Écrit 1 » gardé, seules les deux copies parties marquées « exportées » ; chaque protection retirée exprès fait rougir son contrôle (4 sur 4). Vitest 577 / 6 457 ; Playwright WebKit au push. **Pas vérifié** : un clic par toi dans l'app ; Safari, l'iPad. Aucune porte terrain : le mécanisme du téléchargement n'a pas bougé, seul le nom du fichier et ce qui est marqué changent. **Dans tes données** : rien de changé ; les copies déjà marquées « exportées » à tort par l'ancien code le restent (impossible à distinguer d'un vrai export, et on ne réécrit pas tes données d'office). En chemin, cinq fonctions que rien n'appelait ont été retirées (rien ne change à l'écran). *(#891, #894 ; #895 – deux cartes pour un même geste – reste à ta décision)*

✅ **FAIT EN 1.142.16, POUSSÉE (16 SEPTEMBRE 2026, ≈ 16 h 35 — ton rapport du 31 août, 13 h 57, et ton choix de l'après-midi) — UNE ÉVALUATION DONT UN CRITÈRE A ÉTÉ RETIRÉ DE LA GRILLE S'OUVRE DE NOUVEAU, LE SIGNALE ET LE GARDE.**

Avant, elle affichait « Erreur de chargement » et aucun niveau ne revenait. Maintenant elle s'ouvre ; un encadré orange nomme le critère retiré et le niveau enregistré, et l'évaluation le garde, même quand tu modifies la copie. La note, elle, se recalcule sur la grille actuelle dès que tu modifies la copie (l'encadré le dit). Ouvrir la copie n'écrit rien. En chemin, un reste de code sans effet a été retiré (rien ne change à l'écran).

**Vérifié comment** : contrôles au navigateur (WebKit), avec et sans cartouche : la copie au premier critère retiré était rouge sur le code d'avant (« Erreur de chargement », niveaux vides), verte après ; la copie témoin s'ouvre comme avant ; changer un niveau garde le critère retiré en base. Chaque garde retirée exprès fait rougir son contrôle (7 sur 7). Vitest 576 / 6 448 ; Playwright WebKit vert au push. **L'encadré vu par toi dans l'app : « ça fonctionne, l'encadré s'affiche »**. **Pas vérifié** : le bouton « Enregistrer » n'est vérifié que dans le code, pas par un clic ; que ce soit bien la cause de ton erreur du 31 août (la grille ouverte à 13 h 57 n'est pas nommée dans le rapport, et tes données n'ont pas été lues) ; Safari, l'iPad. **Dans tes données** : rien de changé. *(#652, #890 ; même famille que #705)*

✅ **FAIT EN 1.142.15, POUSSÉE (16 SEPTEMBRE 2026, 15 h 45 — ton rapport du 31 août et ton choix de 15 h 24) — « ANNOTER » DEPUIS LA LISTE OUVRE LA COPIE AVEC SES OUTILS ; RETIRER TOUS LES CODES D'ERREUR REMET LE COMPTE À 0.**
**Ce que tu verras** : après avoir évalué une copie, être passé ailleurs dans l'app puis revenu à la liste des évaluations, « Actions… › Annoter » ouvre la copie avec la palette d'outils, et le bouton dit « Annoter ». Et quand tu retires tous les codes d'erreur posés sur une copie, le champ « Nombre d'erreurs » retombe à 0 — sauf si tu y as tapé un nombre toi-même : celui-là n'est jamais effacé.
**Ce que la mesure a dit** : la cause écrite dans la fiche d'août était fausse. Le passage direct Évaluer → liste → Annoter marchait déjà ; c'est le détour par une autre section, visible dans ton rapport, qui laissait la palette d'outils cachée au retour.
**Vérifié comment** : deux contrôles au navigateur (WebKit) rouges sur le code d'avant, verts après — ton trajet avec détour, et le compte d'erreurs (tampons posés puis retirés) ; leurs gardes : « Consulter » arrive toujours en mode Évaluer avec l'évaluation chargée, un nombre tapé à la main survit, et le 3 écrit pour une copie n'efface pas le 3 tapé pour une autre ; chaque garde retirée exprès rougit ; Vitest 574 / 6 437 ; Playwright WebKit vert au push ; **« Annoter » essayé par toi dans l'app : « ça fonctionne »**. **Pas vérifié** : le compte d'erreurs par toi dans l'app ; Safari, l'iPad. **Dans tes données** : rien de changé ; les évaluations déjà enregistrées avec un ancien compte d'erreurs le gardent, et rien ne permet de les distinguer d'un compte tapé. *(#651, #700 ; inscrit en chemin : #890)*

✅ **FAIT EN 1.142.14, POUSSÉE (16 SEPTEMBRE 2026, 13 h 45 — ton rapport de 13 h 10) — AVEC L'OUTIL TEXTE, CLIQUER SUR UN TEXTE LE MODIFIE.**
**Ce que tu verras** : en annotation, l'outil Texte ouvre un bloc existant quand tu cliques dessus, au lieu d'en poser un second par-dessus. Un clic dans le vide crée toujours un nouveau bloc ; le double-clic de l'outil Sélection marche encore.
**Vérifié comment** : un contrôle au navigateur (WebKit, moteur d'annotation seul) rouge sur le code d'avant, vert après, avec son témoin (clic dans le vide) ; Vitest 574 / 6 437 ; Playwright WebKit vert au push ; **essayé par toi dans l'app : « ça fonctionne »**. **Rien de changé dans tes données.** **Pas vérifié** : Safari, l'iPad au crayon. *(#889)*

✅ **FAIT EN 1.142.13, POUSSÉE (16 SEPTEMBRE 2026, 11 h 30 — ta capture de 11 h 21) — LES CHAMPS D'UNE SÉANCE D'HORAIRE TIENNENT SUR UNE RANGÉE.**
**Ce que tu verras** : Cadre › Horaire › Séances hebdomadaires : jour, heures, périodes et local sur la même ligne, à la même hauteur ; sur écran étroit, deux colonnes propres.
**Vérifié comment** : positions des champs mesurées dans WebKit avant (local sur une 2ᵉ rangée, périodes plus bas) et après (même rangée) ; le contrôle qui comptait « 6 » en dur lit maintenant le nombre de champs, rouge sur le code d'avant ; Vitest 574 / 6 437 ; Playwright WebKit vert au push ; **regardé par toi : « l'alignement de l'horaire est bon »**. **Reste à faire** : le champ Périodes n'a pas d'étiquette visible une fois rempli — inscrit, son libellé te reviendra *(#888)*. *(#886)*

✅ **FAIT EN 1.142.12, POUSSÉE (16 SEPTEMBRE 2026, 11 h 15 — réponse de Mathieu à tes trois questions) — SUPPRIMER UN GROUPE ENTIER, SANS PASSER ÉLÈVE PAR ÉLÈVE.**
**Ce que tu verras** : Cadre › Groupe d'étudiant·es : le bouton « Supprimer un groupe… » est toujours là ; il devient « Supprimer le groupe 00007 » quand un groupe est choisi dans le menu. Sans groupe choisi, il renvoie au menu et ne supprime rien. La question dit « irréversible », et « répartis dans N cours » si le numéro existe dans plusieurs cours.
**Ce que la mesure a dit** : le geste existait depuis janvier, mais son bouton ne paraissait que si un groupe était déjà choisi — et le menu s'ouvre sur « Tous les groupes ».
**Vérifié comment** : 4 contrôles ajoutés, 4 mutations exprès, 4 rouges ; Vitest 574 / 6 437 ; Playwright WebKit vert au push ; **essayé par toi : « ça fonctionne »**. **Rien de changé dans les données** (Mathieu avait déjà vidé à la main). **Reste à faire, le plus gros ouvert** : l'import d'élèves range la liste dans le cours ACTIF sans le nommer — c'est vraisemblablement ce qu'a vécu Mathieu ; ses élèves mal rangés restent chez lui, et les déplacer te reviendrait *(#887)*. *(#885, suite de #872)*

✅ **FAIT EN 1.142.11, POUSSÉE (16 SEPTEMBRE 2026, 10 h 35 — ta capture de 10 h 21) — TES RÉGLAGES DE PERSPECTIVE ET DE ROGNAGE SURVIVENT AU RECHARGEMENT.**
**Ce que tu verras** : quand tu reprends une file d'import par « Re-déposer les fichiers » après un rechargement, les corrections faites dans la préparation sont réappliquées avant l'import ; « Importer » attend la fin du rejeu, et un échec est nommé à l'écran.
**Vérifié comment** (rapporté par la session qui l'a livré) : 8 contrôles, mutations exprès rouges ; Vitest 574 / 6 433. **Pas vérifié** : le rendu réel en navigateur par la session — ta porte : réglage → recharger → Re-déposer → importer, **reportée par toi au prochain artefact, dans une ou deux semaines (vers le 23-30 septembre 2026)**. **Stock** : les copies déjà importées sans correction restent telles quelles. *(#884)*

✅ **FAIT EN 1.142.10 (16 SEPTEMBRE 2026, 10 h — ta question de 9 h 50), POUSSÉE AVEC 1.142.11 — UN TRAVAIL DIAGNOSTIQUE NE COMPTE PLUS DANS LE PROFIL NI LE PDF.**
**Ce que tu verras** : « Portrait de lecteur/lectrice » (coché diagnostique) ne figure plus parmi les travaux évalués du profil et du PDF ; la ligne Sélection dit, dans tes mots, « 1 retenue sur 4 possibles ».
**Vérifié comment** (rapporté par la session) : cause mesurée par une sonde sur tes données (lecture seule) ; 6 contrôles, mutations rouges ; Vitest 573 / 6 425. **Question sur le profil qui montrait des % par travail sous « note différée » : réglée, selon toi (16 septembre 2026, après-midi).** *(#883)*

✅ **FAIT EN 1.142.9, POUSSÉE (16 SEPTEMBRE 2026, 9 h 20 — ton rapport de 9 h 09) — LE PDF DE LA RÉTROACTION RESPECTE « NIVEAU DE PERFORMANCE ».**
**Ce que tu verras** : coché, ce choix est enregistré tout de suite ; le PDF garde le bloc « Note provisoire » avec les niveaux seulement (ta décision), sans pourcentage ni calcul.
**Vérifié comment** (rapporté par la session) : contrôles hors navigateur et dans WebKit, mutations rouges ; Vitest 572 / 6 419. **Stock** : les évaluations déjà enregistrées en « Note chiffrée » le restent — recocher. *(#882)*

✅ **FAIT EN 1.142.8, POUSSÉE (16 SEPTEMBRE 2026, 8 h 15 — ton rapport de 8 h 09) — UNE COPIE JETÉE DEPUIS « EXPORTER ET ARCHIVER » QUITTE LE CARROUSEL.**
**Vérifié comment** (rapporté par la session) : contrôle WebKit, trois mutations, trois rouges ; Vitest 571 / 6 414. Aucune donnée en cause (affichage seulement). *(#881)*

✅ **FAIT EN 1.142.7, POUSSÉE (16 SEPTEMBRE 2026, 7 h 15 — ton rapport de 7 h 00 et ta décision reportée la veille) — PLUSIEURS PDF D'UN MÊME ÉLÈVE S'ASSEMBLENT EN UN SEUL.**
**Ce que tu verras** : comme ses photos ; les pages des PDF y deviennent des images (le texte n'y est plus sélectionnable).
**Vérifié comment** (rapporté par la session) : banc WebKit avec les vraies bibliothèques — 4 PDF (7 pages) + 1 photo → 1 PDF de 8 pages ; 2 mutations rouges ; Vitest 571 / 6 414. **Stock** : les copies déjà importées restent séparées. *(#880)*

✅ **FAIT EN 1.142.6, POUSSÉE (16 SEPTEMBRE 2026, 6 h 15) — LE BOUTON « + NOUVEAU… » OCCUPE LA MÊME PLACE DANS LES SIX ACCORDÉONS DU CADRE.**
**Vérifié comment** (rapporté par la session) : mesuré dans Chrome sur l'app servie en local, 8 px sous le menu pour les six ; trois mutations, trois rouges. **Inscrit, à ne pas ouvrir sans retour** : ces boutons restent de formes différentes et font 27 px de haut sur iPad *(#879)*.

✅ **FAIT EN 1.142.3, 1.142.4 ET 1.142.5, POUSSÉES (15 SEPTEMBRE 2026, de 17 h à 19 h 30 — tes rapports pendant l'import de tes 86 photos) — L'IMPORT DES COPIES ASSEMBLE DE NOUVEAU, ET DIT CE QU'IL FAIT.**
**Ce que tu verras** : les photos d'un même élève pour une même production forment de nouveau UN document, au lieu d'être annoncées comme doublons à renommer ; tu fais le tri dans l'aperçu, rangé par date, et « Défaire le regroupement » reste là. C'est vrai aussi quand tu reprends une file par « Re-déposer les fichiers » après un rechargement — tes réglages spécifiques sont conservés. Dans l'écran d'import, une vignette sans image ne ressemble plus à une image cassée : un triangle quand la photo n'a pas pu être lue, un cercle barré quand il n'y a rien à lire, des points pendant le calcul ; le bouton des réglages porte un engrenage ; et quand une photo HEIC ne se décode pas, la raison s'écrit dans l'inspecteur quand tu cliques sur le fichier, au lieu d'une infobulle invisible sur iPad. Enfin, « + Ajouter des pages » suivi de « Confirmer » ajoute bien tes pages, même si tu n'as appliqué aucun réglage.
**Ce que la mesure a dit** : la règle écrite le 30 août — « les pages d'une remise partagent la seconde de dépôt » — est fausse sur ton vrai lot (09h46m45s, 09h46m55s…). Chaque page devenait donc un document séparé. **Ta décision** : tous les fichiers d'un élève pour une production forment un document, et tu tries à la main. Deux suites en sont sorties le même soir : la file déjà déposée gardait l'ancienne règle, et la fenêtre de préparation ne rendait rien quand il n'y avait rien à régler.
**Vérifié comment** : des contrôles rejouent tes trois cas (photos aux secondes différentes, file reprise après rechargement, « Confirmer » sans réglage) ; huit mutations exprès, huit rouges, fichiers remis à l'identique ; un contrôle prouve qu'un nom de fichier piégé ne peut rien injecter dans l'écran ; rendu regardé dans WebKit en clair et en sombre ; Vitest 569 / 6 405 ; Playwright WebKit sans rougeur nouvelle, et push par `scripts/pousser.sh`, Cowork fermé. **Rien de changé dans tes données.** **Pas vérifié** : Safari, l'iPad ; et pourquoi trois photos HEIC d'un même élève refusent de se décoder — la raison s'affiche maintenant, à relever à ton prochain dépôt. **Reste à faire** : les PDF sans aperçu dans la file *(#874)* ; l'Aide ne dit nulle part que les pages se nomment `-p1`, `-p2` pour s'assembler *(#878)*. **Reporté par toi, à voir à l'usage** : plusieurs PDF d'un même élève, et les lettres `1a`, `1b` comme numéros de page. *(#873, #875, #876, #877)*

✅ **FAIT EN 1.142.2 (15 SEPTEMBRE 2026, soir — ton texte, approuvé à 16 h 30) — L'AIDE DIT CE QUE LA LOI 25 TE DEMANDE.**
**Ce que tu verras** : Aide › Référence › « Exporter et sauvegarder tes données » porte un encadré « Important — les données de tes élèves et la Loi 25 » : où vivent les données, qui en répond, comment protéger l'appareil, la sauvegarde et l'effacement, le lien vers la page publique et le contact labo@codexnumeris.org.
**Vérifié comment** : un contrôle vérifie l'encadré, son lien (nouvel onglet) et le contact, et que les deux boutons qu'il nomme — « Exporter le Codex », « Réinitialiser toutes les données » — existent vraiment sous ces mots ; retiré exprès, il rougit ; rendu regardé dans WebKit en clair et en sombre. **Pas vérifié** : Safari, l'iPad ; la version en ligne tant que ce n'est pas poussé. *(#862)*

✅ **FAIT EN 1.142.1, POUSSÉE (15 SEPTEMBRE 2026, fin d'après-midi — rapport de Mathieu ; livré par une session parallèle, `b4ed9973`) — CRÉER UN DEUXIÈME GROUPE D'ÉLÈVES.**
**Ce que tu verras** : dans Cadre › Groupe d'étudiant·es, un bouton « + Nouveau groupe » crée un 2ᵉ groupe, et le formulaire d'ajout suit le groupe choisi : les élèves ne tombent plus dans le premier groupe. Un groupe importé ou créé apparaît tout de suite à l'étape 3 du groupe-cours, sans recharger. Réimporter une liste exportée depuis Labo Codex n'ajoute plus un élève fantôme nommé « Groupe ».
**Vérifié comment** (rapporté par la session qui l'a livré) : un banc de 11 cas, 13 mutations exprès et 13 rouges ; Vitest 566 / 6 381 ; Playwright WebKit sans rougeur nouvelle ; le parcours joué dans Chrome sur une copie locale. **Pas vérifié** : Safari, l'iPad, et le cas exact de Mathieu, en attente de sa réponse. *(#872)*

✅ **FAIT EN 1.142.0, POUSSÉE (15 SEPTEMBRE 2026, après-midi — tes réponses de 15 h 20 à 15 h 45 ; relue par Cowork ; push `6368ce71..38bc9ac3` par `scripts/pousser.sh`, Cowork fermé, Playwright WebKit et Vitest verts) — « ÉVALUER » MÈNE AU BON ÉLÈVE, AVEC OU SANS COPIE.**
**Ce que tu verras** : « Évaluer », dans le profil d'un élève ou dans la liste des évaluations, choisit l'élève et la production pour toi. Si la copie est importée, elle s'ouvre directement en mode Évaluer, annotée ou non. Sans copie importée, tu arrives sur le formulaire d'évaluation avec les mêmes outils : le nom de l'élève en tête, les vues Générale / Spécifique / Bilan, « Copier tout », « Copier », le cadenas ; le statut part à « Reçu » (remis, non importé), et les critères s'ouvrent. « Consulter » une évaluation sans copie gagne les mêmes outils, et « Régénérer » ne disparaît plus en mode Évaluer.
**Ce que la mesure a dit** : la cause écrite par l'audit du matin était fausse. Trois fonctions portaient le même nom ; celle qui répondait remplissait des listes cachées encore vides. Et trois défauts voisins sont apparus en chemin, corrigés dans le même lot : « Régénérer » retiré par erreur, deux cadenas, et la copie précédente qui revenait au retour sans copie.
**Vérifié comment** : un contrôle au navigateur (WebKit) rejoue tes gestes — avec une copie, sans copie, depuis la liste, « Consulter » sans copie (ajouté à la relecture de Cowork, qui avait vu la promesse du changelog sans mesure), et l'enchaînement des trois — puis un contrôle interdit qu'une seconde définition revienne ; onze mutations exprès, onze rouges, fichiers remis à l'identique ; captures du pack démo en clair et en sombre ; Vitest 565 / 6 370. **Rien de changé dans tes données.** **Pas vérifié** : une vraie copie PDF (les bancs n'ont qu'une image d'un pixel), Safari, l'iPad ; la version en ligne, tant que ce n'est pas poussé. *(#868)*

✅ **FAIT EN 1.141.1 (15 SEPTEMBRE 2026, midi — ton rapport de 12 h 16) — « ENREGISTRER » N'ACCUSE PLUS L'ÉLÈVE D'ÊTRE INTROUVABLE.**
**Ce que tu verras** : dans le profil d'un élève, « Informations confidentielles » › Enregistrer ferme le volet et rafraîchit le profil, sans message d'erreur. Ton commentaire était déjà enregistré — c'est ce qui rendait l'alerte absurde.
**Ce que la mesure a ajouté à ton rapport** : il y avait une seconde moitié, silencieuse. Après cette alerte, l'application ne savait plus quel élève était ouvert : **les boutons de la barre latérale du profil ne répondaient plus** — un clic sur « Travaux soumis » ou « Rapport » ne faisait rien. Tu ne l'as pas signalé, mais c'était mesurable, et c'est réparé aussi : un profil qu'on n'arrive pas à ouvrir n'emporte plus celui qui est affiché.
**Vérifié comment** : les trois contrôles ont été écrits **avant** le correctif et rouges sur les trois symptômes (l'alerte, la barre latérale morte, l'élève ouvert effacé) ; verts après ; puis cassés exprès en remettant chaque moitié du code d'avant — rouge chaque fois, fichiers remis à l'identique. Les deux endroits qui changent d'élève à la bascule d'un groupe-cours ont été relus : ils vérifient eux-mêmes l'existence avant d'appeler. Vitest 564 / 6 367. **Rien de changé dans tes données.** **Pas vérifié** : Safari, l'iPad ; la version en ligne, tant que ce n'est pas poussé. *(#867)*

✅ **FAIT EN 1.141.0, COMMITÉE (15 SEPTEMBRE 2026, matin — ton rapport de 10 h 06) — LES NOTES QUE TU PRENDS DANS « RAPPORT » NE DISPARAISSENT PLUS.**
**Ce que tu verras** : dans le profil d'un élève, section « Rapport », une zone **« Mes notes »** est apparue sous le rapport. Ce que tu y écris est enregistré à mesure, et tu le retrouves en revenant — d'une visite à l'autre, d'un jour à l'autre. « Copier » emporte le rapport **et** tes notes. Le rapport du dessus, lui, continue d'être refait à chaque ouverture avec les chiffres du jour : ce que tu y tapes ne se garde pas, et son message d'invite le dit maintenant, au lieu de promettre le contraire. En mode anonymisation, tes notes ne s'affichent pas : un écran montré à une salle ne dévoile pas ce que tu écris sur un élève.
**Ce que la mesure a dit de ton rapport** : ce n'était pas une régression. Ce texte n'était **enregistré nulle part** — il n'y avait ni écriture ni écouteur, depuis toujours. Le correctif du 11 septembre avait seulement supprimé l'effacement *pendant* l'ouverture d'un profil ; le trajet aller-retour entre sous-sections n'avait jamais été couvert.
**Vérifié comment** : ton trajet exact rejoué dans **ton** Chrome, avec de vrais clics de souris — note tapée, clic sur « Travaux soumis », retour sur « Rapport », la note est là ; contrôles neufs (10 essais hors navigateur, 3 dans le navigateur) cassés exprès **seize fois — seize rouges**, chacun sur l'essai qu'il visait, fichiers remis à l'identique ; lisibilité mesurée dans les deux modes (7,2:1 et 6,9:1, au-dessus du minimum) ; Vitest 564 / 6 367. **Rien n'a été écrit dans tes données** : la zone part vide, personne n'avait de note enregistrée. **Pas vérifié** : Safari, l'iPad ; la version en ligne, tant que ce n'est pas poussé. *(#866)*

✅ **FAIT EN 1.140.11, COMMITÉE (14 SEPTEMBRE 2026, soir — ta décision du 14 au soir ; la 1.140.11 ne part qu'avec ce retrait) — LE VERROUILLAGE DES CARTOUCHES EST RETIRÉ.**
**Ce que tu verras** : rien de changé dans la banque de cartouches ni à l'ouverture d'une cartouche. Le bandeau « Cartouche verrouillée » et son bouton « Déverrouiller » n'existent plus : ils ne pouvaient de toute façon jamais s'afficher, rien dans l'application ne permettant de verrouiller une cartouche. L'Aide ne présente plus l'outil. Tes cartouches gardent un champ interne devenu inerte : rien n'a été écrit dans tes données, et les fichiers déjà exportés restent lisibles.
**Vérifié comment** : la banque et l'ouverture d'une cartouche comparées dans WebKit, avant et après, sur la même cartouche — identiques (48 éléments visibles de part et d'autre) ; un contrôle neuf interdit tout retour du verrouillage, cassé exprès quatre fois (la garde de suppression remise, un lecteur ailleurs, une écriture hors file, les écritures du champ retirées) — rouge chaque fois, en nommant la ligne —, fichiers remis à l'identique (empreintes comparées) ; Vitest 563 / 6 357. **Pas vérifié** : Safari réel, l'iPad ; la version en ligne, tant que ce n'est pas poussé. *(#864, qui retire #863)*

✅ **FAIT EN 1.140.10, POUSSÉE (14 SEPTEMBRE 2026, 16 h 45 — release `6f12db6b`, build `0914-1644` ; push `21987bc4` par `scripts/pousser.sh`, Cowork fermé, Playwright WebKit sans rougeur, Vitest vert) — TREIZE ESPACEMENTS PRÉVUS QUI NE S'AFFICHAIENT PAS S'AFFICHENT ENFIN.**
**Ce que tu verras** : dans l'Aide (Consultation et Référence rapide), les encadrés « Astuce », « Important » et « Note » ne collent plus au texte du dessus ; les tableaux remontent un peu (15 → 10 px). En Évaluations, un peu d'air sous le groupe Sauvegarder / Réinitialiser. Le bouton « Consulter la bibliothèque » ne change pas : il était déjà pleine largeur. (Le bouton « Déverrouiller » d'une cartouche, qui ne se coupait plus, est retiré en 1.140.11.)
**Vérifié comment** : les treize balises mesurées dans Chrome avant et après (marges, taille, largeur) ; le contrôle qui interdit désormais toute balise à deux attributs `class` a été cassé exprès en en remettant un — rouge, en nommant la balise —, fichier remis à l'identique (empreintes comparées) ; Vitest 562 / 6 355. **Pas vérifié** : la version en ligne (lire 1.140.10 en bas de page) ; Safari, l'iPad ; le rendu jugé à l'œil — ta porte terrain, deux rangées restantes (la troisième est sans objet depuis 1.140.11), sans urgence : aucune donnée n'est touchée. *(#787)*

⏳ **INSCRIT (14 SEPTEMBRE 2026) — CE QUE LA LOI 25 DEMANDE À L'UTILISATEUR N'EST ENCORE DIT NULLE PART DANS L'APPLICATION.**
La page publique existe et se lit sans compte : https://codexnumeris.org/labo-codex-ou-vivent-vos-donnees. Reste à poser, dans l'Aide, un encadré court qui y renvoie ; **ses mots te reviennent** — une proposition te sera soumise à corriger. *(#862)*

✅ **FAIT EN 1.140.9 (14 SEPTEMBRE 2026, 12 h 50 — signalé par toi pendant la rencontre de la CoP ; commité avec ce relais, poussé par `scripts/pousser.sh` à la suite, Cowork fermé) — EN MODE ANONYMISATION, LA LISTE D'ÉLÈVES DU CADRE MONTRE LES PSEUDONYMES.**
**Ce que tu verras** : dans Cadre › Trimestre, l'accordéon « Groupe d'étudiant·es » affiche « ANONYME · Gr. A · Élève 10 » en mode anonymisation, comme le reste de l'application. « Modifier » et « Supprimer » y sont refusés, avec un message qui dit de repasser en mode normal : le formulaire et la question de suppression nommaient l'élève en clair.
**Vérifié comment** : bug reproduit dans Chrome sur le pack démo avant le correctif (vrais noms en anonymisation, même après rechargement) ; après, les pseudonymes, après la bascule et après un aller-retour d'écran ; contrôles neufs cassés exprès en remettant le code d'avant — 5 rouges sur 6 et 2 sur 2 —, fichiers remis à l'identique (empreintes comparées) ; Vitest 562 / 6 356. **Pas vérifié** : ton trimestre réel à l'écran après le déploiement ; Safari, l'iPad. Rien à réparer dans tes données : seul l'affichage changeait. *(#861)*

✅ **FAIT EN 1.140.8, POUSSÉE ET EN LIGNE (13 SEPTEMBRE 2026, soir — lot de la session parallèle, fusionné par avance rapide ; poussée le 14 sept. par `scripts/pousser.sh`, Cowork fermé, verdict Playwright WebKit sans rougeur ; déploiement de `e2ee87c2` « ready » chez l'hébergeur à 10 h 11) — LA PRÉPARATION D'UN PREMIER TRIMESTRE SE FAIT D'UN TRAIT.**
**Ce que tu verras** : quand aucun trimestre n'est actif, le trimestre que tu crées l'est d'emblée — plus de question « Veux-tu l'activer ? » —, et les groupes-cours que tu y ajoutes apparaissent tout de suite. Dans un horaire, si le menu « Groupe associé » est vide, la bulle dit d'abord où créer le groupe (l'accordéon « Groupe d'étudiant·es », juste au-dessus) ; un groupe ajouté apparaît dans le menu sans rouvrir le formulaire.
**Vérifié comment** : ta porte terrain, 6 rangées sur 7 ; l'échec (2.3b : la bulle disparaissait avant la phrase utile) corrigé en inversant les deux phrases, texte approuvé par toi ; contrôle neuf cassé exprès huit fois par la session du lot, puis deux fois par une autre session, toujours rouge, fichiers remis à l'identique ; spec WebKit 4/4 ; Vitest 561 / 6 350. **Pas vérifié** : la rangée 2.3b rejouée en ligne — à faire par toi, après le déploiement ; Safari, l'iPad. *(#478 b et c)*

✅ **FAIT EN 1.140.7, POUSSÉE ET EN LIGNE (13 SEPTEMBRE 2026, soir — release `ae59472e`, build `0913-2017` ; push `0a6ad7d0` après le verdict Playwright complet, Cowork fermé) — LE GRAPHIQUE DES INDICES D'UN ÉLÈVE NE PORTE PLUS LES PALIERS D'UNE ÉCHELLE.**
**Ce que tu verras** : dans le profil d'un élève, section « Progression temporelle ACP », le graphique des trois courbes (assiduité, complétion, performance) n'a plus de lignes pointillées ni de lettres de niveaux dans la marge de droite. Le graphique par critère, lui, garde les siens. Ta décision : un indice cumulé sur le trimestre ne se situe pas dans une échelle faite pour juger une seule production.
**Vérifié comment** : ta porte terrain, 7 rangées sur 7 (copie locale, démo, 20 h 12) ; contrôle neuf qui rend le graphique sur un trimestre sans échelle et sur une échelle sans lettres I/D/M/E — même graphique, rien de dessiné —, cassé exprès cinq fois, cinq rouges ; Vitest 560 / 6 343 ; sur le site, lu après le déploiement : version 1.140.7, et le code servi n'a plus de zones sur ce graphique (commentaires écartés). **Pas vérifié** : ce graphique à l'écran sur le site avec tes élèves, Safari, l'iPad. **Pas encore réglé** : le graphique de groupe de l'indice P et les trajectoires en mode « note finale » dessinent encore les niveaux d'une échelle — laissés, à décider à part. *(#575 ; reste #860)*

✅ **FAIT, SANS RELEASE, EN LIGNE (13 SEPTEMBRE 2026, fin d'après-midi — parti avec 1.140.6 ; déploiement de `e3eafe1a` mesuré « ready » chez l'hébergeur par Cowork, 18 h 05) — L'ÉCRAN DES ÉCHELLES NE TRAVAILLE PLUS POUR UN RECOIN QUE PERSONNE NE VOIT.**
**Ce que tu verras** : rien. Sous l'éditeur d'échelles, un recoin caché de la page recevait encore, à chaque visite, la liste de toutes tes échelles, un ancien tableau de niveaux et son aperçu : rien de tout ça ne s'affichait. C'est retiré, avec l'ancien éditeur qui y écrivait. Deux anciens réglages restés dans ton navigateur ne sont plus lus par personne ; ils sont laissés où ils sont — les effacer est ta décision.
**Vérifié comment** : chacun des huit identifiants du recoin cherché dans toute l'application avant de couper (aucun écran vivant ne le lisait) ; contrôle neuf cassé exprès cinq fois, cinq rouges, fichiers remis à l'identique ; Vitest 559 / 6 337. **Pas vérifié** : l'écran des échelles dans ton navigateur, et la suite Playwright complète (à prendre, Cowork fermé). *(#658, #659)*

✅ **FAIT EN 1.140.1, COMMITÉE (13 SEPTEMBRE 2026, midi — release `2102cd1a`, build `0913-1244` ; push à ton feu vert, verdict Playwright pris Cowork fermé) — LES CONTRÔLES QUI PROTÈGENT LES LIVRAISONS DISENT CE QU'ILS ONT VÉRIFIÉ.**
**Ce que tu verras** : rien à l'écran. Ce sont les contrôles qui gardent chaque livraison. Ils ne se déclarent plus verts sans avoir rien vérifié, conseillent le bon geste quand ils refusent, empêchent qu'une même adresse de fichier serve deux contenus différents (le risque du 10 septembre, deux sessions en parallèle), et nomment ce qu'ils ne savent pas surveiller.
**Vérifié comment** : chaque contrôle cassé exprès (seize mutations, toutes rouges) ; relecture croisée de Cowork (sept mutations, aucune verte ; une retouche, faite) ; Vitest 556 / 6 124 sur la release. **Pas encore réglé** : quelques bibliothèques (visionneuse PDF, graphiques, exports PDF) sont encore chargées sans jeton anti-cache — nommées, pas corrigées, parce que ce sont des écrans à vérifier chez toi. *(#675, #547, #600, #826 ; reste #602)*

✅ **FAIT EN 1.140.0, COMMITÉE (13 SEPTEMBRE 2026, matin — release `05200d82`, build `0913-1042` ; UN push avec 1.139.3 et 1.139.4, à ton feu vert, verdict Playwright pris Cowork fermé) — UN DÉLAI SUR UNE REPRISE, SEULEMENT SI TA PRATIQUE LE PERMET.**
**Ce que tu verras** : dans les jetons de ta pratique, une case « Permettre un délai sur une reprise ». Décochée par défaut : rien ne change tant que tu ne la coches pas. Sur une pratique dont les jetons ont été réglés à sa création, le formulaire le dit et ne laisse plus rien modifier en vain.
**Vérifié comment** : sentinelle du lot, cassée exprès (douze mutations, toutes rouges, restauration identique) ; relecture croisée de Cowork en deux passes ; Vitest 555 / 6 092 sur la release. **Pas vérifié** : ton écran. **Pas encore réglé** : sur une pratique créée par l'assistant, le formulaire des jetons est ignoré, et la rééditer par l'assistant efface ses jetons. *(#853 ; reste #854)*

✅ **FAIT EN 1.139.4, COMMITÉE (13 SEPTEMBRE 2026, matin — release `d2650655`, build `0913-1013` ; UNE publication avec 1.139.3, push à ton feu vert, verdict Playwright pris Cowork fermé) — DANS LA DÉMONSTRATION, L'ARTEFACT 9 EST UN PLAN DE RÉDACTION.**
**Ce que tu verras** : « Artefact 9 - Plan de rédaction (2) », un objectif et une tâche de travail individuel, et des rétroactions qui parlent du plan (hypothèse en tête, idées principales et secondaires, organisateurs textuels, mini-conclusions et transitions) — les textes que tu as relus. La Grille-4, les niveaux et les notes n'ont pas bougé. La visite guidée et « Nouvelles » disent maintenant dix élèves. Une démo déjà installée se remplace d'elle-même.
**Vérifié comment** : « carte mentale » à 0 dans la production, la cartouche et les dix rétroactions de l'Artefact 9 ; le reste du pack égal, en profondeur, à l'avant ; notes identiques ; sonde WebKit : dépistage sans avertissement, niveaux RàI inchangés (3 / 6 / 1) ; recherche des « 20 élèves » dans js/, index.html, docs/ et tests/ (graphies échappées comprises) : plus rien de vivant ; Vitest 554 / 6 057. **Pas vérifié** : ton navigateur. *(#855)*

✅ **FAIT EN 1.139.3, COMMITÉE (13 SEPTEMBRE 2026, matin — release `15f389f1`, build `0913-0924` ; push après le verdict Playwright complet, Cowork fermé) — « COURS (TOUS GROUPES) » DANS L'EN-TÊTE FOND DE NOUVEAU LES GROUPES** (ton rapport de 8 h 47).
**Ce que tu verras** : en choisissant « 601-101-MQ (tous groupes) » dans l'en-tête, Suivi › Liste montre les élèves de tous les groupes du cours dans une même liste, et non plus seulement ceux du dernier groupe choisi. C'était cassé depuis le 3 juin. Rien n'a été écrit dans tes données : la correction est à la lecture.
**Vérifié comment** : sentinelle `sentinelle-851-vue-tous-groupes` (deux groupes d'un même cours, le dernier choisi resté actif : les trois élèves ressortent ; le cas du groupe périmé du 3 juin tient toujours), cassée exprès, rouge ; spec Playwright du cas du 3 juin verte ; Vitest 554 / 6 057. **Pas vérifié** : dans ton Chrome, avec tes 51 élèves. *(#851)*

✅ **FAIT EN 1.139.3, COMMITÉE (même release) — LES JETONS DE REPRISE NE MENTENT PLUS.**
**Ce que tu verras** : retirer une reprise quand l'enregistrement échoue affiche l'échec, et rien ne bouge — plus de « Originale restaurée » trompeur, plus de fichier envoyé à la corbeille ; l'espace de stockage plein et l'erreur de stockage sont désormais reconnus comme des échecs. Une reprise accordée part propre : elle ne recompte plus le délai déjà accordé sur l'originale (un délai + une reprise = 1 délai utilisé, et non 2), et une copie déjà remplacée n'en reçoit plus.
**Vérifié comment** : sentinelle `sentinelle-725-617-724-720-jetons-de-reprise` (17 essais : deux portes × trois refus d'écriture, garde, reprise née propre, quota, fichier délié) et quatre essais du banc d'audit du 5 sept. retournés ; sept mutations du code, toutes rouges, fichier remis à l'identique ; relecture croisée de Cowork (trois retouches de tests faites). **Ce qui reste chez les utilisateurs** : les reprises déjà créées avant 1.139.3 gardent leurs défauts (délai compté deux fois, reprise d'un doublon hors de la note, fichier en corbeille) ; pack démo : 0. Laissé. **Une question à toi** : un délai peut-il être accordé sur une reprise ? Aujourd'hui, non (#853). *(#725, #617, #724, #720)*

✅ **FAIT EN 1.139.2, COMMITÉE (13 SEPTEMBRE 2026, matin — release `9b705951`, build `0913-0858` ; push après le verdict Playwright complet) — LA DÉMONSTRATION COMPTE DIX ÉLÈVES AU LIEU DE VINGT.**
**Ce que tu verras** : en activant la démo, dix élèves (Césaire, Curie, Leclerc, Roy, Kahlo, Mandela, Messi, Morrison, Sangaré, Shankar), 101 évaluations, les 32 mêmes dates de présence. Albert Einstein s'appelle maintenant Félix Leclerc, et Jane Goodall, Gabrielle Roy, y compris dans la prose des rétroactions. Une démo déjà installée se remplace d'elle-même au prochain chargement. Dans le Suivi, le dépistage fonctionne : l'application calcule 3 élèves au niveau 1, 6 au niveau 2 et 1 au niveau 3 (sélection gardée telle quelle, ta décision du 13 au matin).
**Vérifié comment** : le pack neuf comparé en profondeur à l'ancien, filtré et renommé (égal) ; anciens noms à 0 au `grep` ; sonde WebKit avant et après : grille de dépistage résolue (FR-HOLIS), 0 avertissement « Pas de grille de référence », « Défi spécifique » affiché ; démo 20.9 installée puis nouvelle version ouverte dans le même navigateur : « rafraîchi depuis 20.9 », dix élèves ; sentinelle de l'Aide cassée exprès, rouge, remise ; spec Playwright de la saisie en démo verte (10 lignes) ; Vitest 552 / 6 038 sur le SHA de release, dans un arbre propre.
**Ce qui reste chez qui avait déjà la démo** : deux caches dérivés (indices C-P, captures du graphique) gardent des traces des dix élèves retirés ; rien ne s'en affiche (Suivi, profil). Laissés. **Pas vérifié** : les graphiques longitudinaux avec ce stock, et ton navigateur. *(#852)*

✅ **FAIT EN 1.139.1, POUSSÉE (13 SEPTEMBRE 2026, matin — release `d9e45280`, build `0913-0743` ; jugée verte sur GitHub, run 34756365066) — LE BANDEAU DE VERSION DIT LA VERSION DU CODE QUI TOURNE, ET NE REVIENT PLUS À CHAQUE OUVERTURE** (ton rapport de 7 h 23, avec la capture : bandeau en 1.135.0, carte « Nouveautés » en 1.139.0).
**Ce que tu verras** : le bandeau orange, la carte « Nouveautés », l'entête, « À propos » et le rapport de bug disent le même numéro — celui du code chargé. Une copie périmée du fichier de version sur le serveur ne peut plus le changer ; seule une version PLUS RÉCENTE s'annonce (« Une mise à jour a été déployée… »). Au premier chargement de 1.139.1, le bandeau s'affichera **une dernière fois** : ferme-le, il se tait, et la pastille rouge de « Nouveautés » s'éteint. Rien n'a été écrit d'office dans ton espace.
**Vérifié comment** : `cd tests && npx vitest run unit/sentinelle-849-850-version-chargee.test.js` — 4 essais (réponse périmée ignorée, version plus récente annoncée sans changer la version chargée, repère stocké par la base qui tait le bandeau, fermeture relue au démarrage suivant) ; **quatre fois cassée exprès, quatre rouges**, fichier remis à l'octet (`cmp`). Dans Chrome, sur un serveur local, avec ton stock reproduit (repère du 7 août) : bandeau en 1.139.0 comme la carte, fermé, repère écrit dans la base, **tu au rechargement**. Vitest 552 / 6 038 après le commit du bump ; Playwright ciblé vert (bandeau : 10 cas ; chargements : 6 cas).
**Ce que la mesure a trouvé en plus** : chez toi, le repère « déjà vu » valait `"0807-1529"` (guillemets compris, 7 août) — la base le réécrit ainsi à chaque démarrage, l'ancien code le lisait brut : c'est pourquoi le bandeau revenait à chaque ouverture et que la pastille restait rouge.
**Pas établi** : qui a servi, ce matin, le fichier de version périmé (la requête demande pourtant de ne rien prendre en cache). Le correctif en neutralise l'effet, pas la source. *(#849, #850)*

✅ **FAIT EN 1.139.0, POUSSÉE (12 SEPTEMBRE 2026 — `origin/main` = `e29f734c` ; release `e71e26f1`, build `0912-1259` ; code `9ceca4ff` + correctif `6c8c91a9` de la relecture croisée de Cowork (13 h 10) ; Vitest 551 / 6 034 après le commit du bump ; verdict Playwright local vert sur `e29f734c`, Cowork fermé — huit specs de Conception vertes au second essai seulement, aucune sur Suivi ; poussée par `scripts/pousser.sh`. Porte relevée à 15 h 03, 6 sur 6 ; deux rangées sautées faute du cas) — SUIVI › INTERVENTIONS : « PLANIFIER » N'ÉCRIT PLUS RIEN AVANT « ENREGISTRER », LE BILAN LIT LES MÊMES SEUILS QUE LE RESTE DE L'APPLICATION, ET LA NOTE D'UN ÉLÈVE PARTI DU GROUPE RESTE, GRISÉE** (lot 5 du cadrage de l'onglet Suivi ; consigne de Cowork promue à 12 h 05 ; le chantier de l'orthopédagogie est clos).
**Ce que tu verras** : « Planifier une intervention » ouvre le formulaire sans rien inscrire dans tes données ; si tu changes d'onglet sans cliquer « Enregistrer », rien ne reste — comme avant à l'écran, mais sans que l'intervention ait existé entre-temps dans une sauvegarde. « Enregistrer » l'écrit, une fois. « Annuler » ne demande rien. Même chose pour « + Nouvelle rencontre ». Dans le bilan d'une intervention complétée, la lettre et le pourcentage s'accordent avec le reste de l'application : un 64,5 % est « D » ici comme dans la suggestion d'objectif (il était « I »). La note écrite pour un élève qui n'est plus dans le groupe reste visible, en gris, avec son nom — ou son DA s'il n'est plus au trimestre — suivi de « (n'est plus dans le groupe) » ; le nombre à côté de « Notes individuelles » compte les lignes affichées.
**Vérifié comment** : une sentinelle de 12 essais — Planifier sans écriture et Enregistrer en une seule écriture, dans les deux vues (Interventions et Rencontres), changer d'onglet, Annuler, un vieux brouillon resté en base ni affiché ni compté ni effacé, les lettres du bilan avec les seuils par défaut puis avec un seuil déplacé (le bilan et la suggestion bougent ensemble), la note d'un élève parti, y compris en anonymisation (ni son nom ni son DA) ; **treize fois cassée exprès, treize rouges**, fichier remis à l'identique (empreinte). Les bancs d'audit du 5 et du 6 septembre passés à leurs valeurs d'après. Vitest 551 fichiers / 6 032 essais.
**Relecture croisée de Cowork (13 h 10), corrigée avant la release** : un « Enregistrer » sur une intervention introuvable (après « Annuler », par exemple) annonçait « Intervention enregistrée » sans rien écrire — il dit maintenant « Intervention non trouvée. » et n'écrit rien (deux essais de plus, deux mutations, deux rouges).
**Vu par toi** (porte `plans de travail/PORTES-TERRAIN-2026-09-12-interventions.md`, relevée à 15 h 03 avec Cowork) : **6 sur 6, zéro échec**, sur ton groupe réel. **Pas encore vu** : deux rangées sautées faute du cas chez toi — le même geste côté Rencontres sur un service (celui que l'orthopédagogue fera lundi) et la note grisée d'un élève parti du groupe. Aucun navigateur n'a tourné en session ; le verdict Playwright se prend avant le push.
⚠ **Ce que la mesure a corrigé de la consigne** : elle nommait un seuil `idme.etendu` qui n'existe pas — la fonction qui convertit un pourcentage en lettre existait déjà, le bilan la lit ; et deux fonctions de création et de présence que ce lot laissait sans appelant sont retirées avec le code mort. La porte perd la rangée du bilan (une machine y répond) et gagne celle des Rencontres.
**Laissé exprès** : `Labo › Données` compte encore un vieux brouillon s'il en reste un en base (cet écran lit le tableau brut ; aucun effacement d'office) ; la pré-coche des critères en défi n'a pas d'essai qui la casse.

✅ **FAIT EN 1.138.0, POUSSÉE (12 SEPTEMBRE 2026, 11 h 52 — `origin/main` = `61b5c883` ; release `a0ed0929`, build `0912-1116` ; code `e011ed64` (A-C) + `62f24316` (D), relus par Cowork à 11 h 08, + `e239787f` (E) ; Vitest 550 / 6 020 après le bump ; verdict Playwright local vert sur `61b5c883` à 11 h 51, Cowork fermé — 0 échec, 0 instable ; poussée par `git push` sur ta décision de 11 h 52. La relecture croisée du lot E par Cowork n'a pas été vue par Claude Code avant le push) — L'ACCUEIL PARLE AUX DEUX MÉTIERS, LE CHAMP 2 NE SE CONTREDIT PLUS, LES RENCONTRES NE DEMANDENT PLUS DE CIBLER DES CRITÈRES, SES PROCHAINS RENDEZ-VOUS S'AFFICHENT EN TÊTE, ET SUIVI N'A PLUS D'ONGLET « INTERVENTIONS » SUR UN SERVICE** (consigne du jour de Cowork, 10 h 25, révisée à 10 h 35, 10 h 50 et 11 h ; ta décision de 11 h 10 : les cinq d'un coup ; ta phrase de 7 h 35 : « Je veux que l'orthopédagogue sente qu'elle entre par la porte principale. »).
**Lot E, ce que tu verras** : sur un service, la barre de `Suivi` a six onglets — plus d'« Interventions », qui montrait la même liste que
« Rencontres » avec les mots de l'enseignement ; sur ton 601-101-MQ, les sept, dans le même ordre. La barre suit une bascule de contexte
faite **depuis Suivi**, sans te déplacer ; si tu étais sur « Interventions » en passant sur le service, tu arrives sur « Rencontres ».
**Vérifié comment** : une sentinelle de 11 essais qui charge les vrais fichiers de navigation, huit fois cassée exprès, huit rouges ; la
chaîne réelle rejouée dans WebKit sur le pack démo (7 → 6 → 7 → 6 onglets, l'onglet actif conservé ou remplacé par « Rencontres »,
zéro erreur) ; aucun écran ne change au harnais. ⚠ **Ce que la mesure a corrigé** : changer de contexte ne reconstruisait pas la barre
(la consigne le supposait) — c'est ce lot qui la fait suivre. **Laissé exprès** : sur un service, les boutons du profil qui mènent aux
interventions ouvrent encore la vue « Interventions » (sans onglet) ; les rediriger vers Rencontres empêchait leur formulaire de s'ouvrir.
Pas annoncé au changelog : rien ne change pour les enseignants.
**Lot D, ce que tu verras** : dans `Suivi › Rencontres`, sur un service, sous « + Nouvelle rencontre », le bloc **« Tes prochains rendez-vous »** —
au plus quatre rencontres à venir, la plus proche en premier (date, heure si notée, titre, individuelle ou en sous-groupe) ; la liste
dessous garde son ordre. Sans rencontre à venir : « Aucun rendez-vous à venir. Tes rencontres passées restent dans la liste ci-dessous. »
Sans aucune rencontre : pas de bloc (mon choix : la phrase serait fausse sous une liste vide). **Vérifié comment** : une sentinelle de 13
essais, dix fois cassée exprès, dix rouges ; le harnais du pack démo ne voit aucune différence de plus (listes hors service identiques).
⚠ **Ce que la mesure a corrigé** : le bloc devait se poser à l'ouverture de Rencontres ; il aurait disparu dès qu'on ouvre puis referme une
rencontre — il est donc refait avec la liste, à chaque fois.
**Ce que tu verras** : sur l'accueil, sous le bandeau « Bienvenue » et au-dessus des tâches, une carte blanche **« Tu es orthopédagogue ? »** —
« Décris ton service : son nom, la liste de tes étudiant·es et les dates de ton trimestre. » — et **« Commencer → »**, qui mène à Suivi ›
Rencontres par le même chemin que le sous-onglet. Les huit tâches sont toutes là. Dans le bandeau, **« Par où commencer ? »** répond en deux
branches (« Je suis enseignant·e — … », « Je suis orthopédagogue — Décris ton service dans Suivi › Rencontres : tes rencontres se tiennent
là. »), et les deux paragraphes que tu voulais retirer sont raccourcis (« Certains concepts sont nouveaux ? », « Ton courriel, une fois par
mois. »). Dans `Cadre › Groupe-cours`, le champ 2 dit **« Cours ou service »** sur un service comme sur ton 601-101-MQ (c'était la rangée 1
échouée de la porte d'hier : il disait « Service d’orthopédagogie » en listant tes cours). Sur un service, le formulaire d'une rencontre
n'a plus de bloc **« Critères ciblés / Objectif visé / Suggérer »**, et son bilan dit « Ce que tu retiens de la rencontre. » ; **sur ton
601-101-MQ, le formulaire d'une intervention ne change pas** — tes cinq critères y sont, « Suggérer » répond.
**Vérifié comment** : deux sentinelles (11 et 9 essais) — la carte au-dessus des huit tâches, son lien sur le chemin de la sous-navigation,
les mots arrêtés rendus dans l'ordre et écrits à un seul endroit, la carte conforme aux autres dans les deux modes ; le champ 2 identique
dans les deux contextes, son menu avec les deux natures ; la carte des critères absente sur un service (Rencontres et Interventions),
présente et inchangée hors service ; **une rencontre à « Structure » enregistrée sur un service garde « Structure » et son objectif**
(masquer la carte ne doit rien effacer ; l'objectif, la consigne ne le nommait pas : sans garde, il aurait été vidé). **Quinze fois
cassées exprès, quinze rouges** (une au second passage : au premier, c'est le script qui n'avait pas lu la sortie), code remis
(empreintes identiques). Le pack démo capturé AVANT (le code de 1.137.0) et rejoué APRÈS : 20 écrans, **8 identiques dont les deux
formulaires hors service**, les autres ne diffèrent que par les mots du lot et du bruit (heures de calcul, DA provisoires générés) —
**zéro valeur ne bouge**. Styles mesurés dans WebKit : la carte a le fond, le trait, le rayon et l'ombre d'une carte de tâche, dans les
deux modes ; captures regardées. Vitest 548 fichiers / 5 996 essais.
**Pas vérifié** : ton écran, Safari, l'iPad (porte `plans de travail/PORTES-TERRAIN-2026-09-12-accueil.md`, cinq rangées, deux décisions),
tes deux groupes.
⚠ **Ce que la mesure a corrigé de la consigne** : « Commencer → » mène aux trois questions **seulement sans trimestre** ; sur ton
601-101-MQ il mène à la carte « Créer un service d’orthopédagogie », sur un service à la liste des rencontres (porte, rangée 2).
**Ce qui attend ta décision** (porte § 3) : **deux autres libellés du Cadre ont le défaut du champ 2** — le menu de `Cadre › Cours` dit
« Sélectionner un service... » en listant tes cours, et la phrase des éléments obligatoires du groupe-cours dit l'horaire facultatif selon le
service **actif**, alors que l'application l'exige selon le cours **choisi** (#848) ; et le mot de l'option vide du champ 2, « — Choisir un
cours ou un service — », que j'ai tiré de ton « Cours ou service ».
**Laissé exprès** (hors service, rien ne change) : sans grille de référence, le formulaire d'une intervention envoie encore vers
« Conception › Grilles de critères » (le réglage vit dans Labo › Outils d'observation) ; sur un service, l'onglet Interventions garde le
sous-titre de bilan qui promet une comparaison ; les deux exemples gris « Structure / Rigueur » sont inscrits par Cowork (#847).

✅ **FAIT EN 1.137.0 (12 SEPTEMBRE 2026, 9 h 40 — release `5563b233`, build `0912-0935`, code `7b4beac2` relu par Cowork ; Vitest 546 / 5 976 après le bump ; poussée par `scripts/pousser.sh` après le verdict Playwright — voir RELAIS pour le SHA poussé) — LA SECTION COURS DU CADRE PARLE LES DEUX MÉTIERS, SANS SE CONTREDIRE** (consigne du jour de Cowork, 8 h 55 ; ta décision 3.4 de la porte des étiquettes et sa rangée 5 échouée).
**Ce que tu verras** : sur un service d'orthopédagogie, le premier choix du menu des profils dit **« Sélectionner un·e orthopédagogue »** — même après
que le menu s'est rafraîchi (c'était la rangée 5 : la reconstruction du menu réécrivait « — Sélectionner — » en dur par-dessus le bon mot) ; le
champ 5 du groupe-cours dit « — Choisir un·e orthopédagogue — », le champ 2 « — Choisir un service — ». L'accordéon des cours s'appelle
**« Cours et services »** (mot proposé, à corriger — porte § 3.1 ; tu avais dit « cours/service ») ; sur un service, il dit « Service : »,
« Sélectionner un service... », **« Modifier le service »**, « Dupliquer le service », le bandeau **« Mode modification — Service … »**, « Aucun
service sélectionné », et le fil d'Ariane dit « Service » ; dès que le menu Nature bascule, le titre du formulaire suit (« Nouveau service »).
Dans l'accordéon Groupe-cours, la phrase qui te contredisait dit maintenant, sur un service, **« renseigne les 4 éléments obligatoires :
trimestre, service d’orthopédagogie, numéro de groupe et orthopédagogue. L’horaire et la pratique de notation sont facultatifs. »** — et ses
trois échos (état vide, liste, formulaire) disent 4 éléments et « L'horaire des séances (facultatif) ». L'infobulle du groupe-cours nomme
« ton cours ou ton service d’orthopédagogie ». **Sur ton 601-101-MQ, tout redit cours et enseignant·e, aux mots d'avant** — sauf deux :
le titre « Cours et services », et « Sélectionner un enseignant·e » à la place de « — Sélectionner — » dans le menu des profils (le mot que
le point unique portait déjà). ⚠ **Laissé exprès** : « + Nouveau cours » et « … ou crée un nouveau cours » — les faire suivre ouvrirait un
formulaire dont le menu Nature dit « Enseignement » ; faire suivre ce défaut est un comportement, pas un mot : **ta décision** (porte § 3.2, #843).
**Vérifié comment** : une sentinelle de 17 essais (les trois reconstructions de menus lisent le point unique au moment de construire, dans les
deux ordres « le dernier qui écrit » ; verrou structurel étendu : aucune option vide nommant une personne en dur dans `js/` ni `index.html` ; la
phrase des éléments obligatoires dans les deux sens ; **les mots de 1.136.0 hors service figés** ; le titre et le bandeau suivent la fiche, la
synthèse et le menu suivent le contexte ; la valeur en base reste `'service'` après Modifier + Enregistrer), **onze fois cassée exprès, onze
rouges**, code remis (empreintes identiques). Le pack démo capturé AVANT et rejoué APRÈS : 411 feuilles (valeurs de `cours`, `groupesCours`,
`groupeEtudiants`, `infoCours`, `groupeCoursActif` ; textes du Cadre dans huit états du formulaire, Suivi du groupe, Liste, un profil — sur
le groupe-cours démo, sur un service créé par les trois questions, au retour) : **zéro valeur ne bouge** (identifiants générés, dates, DA
provisoires), **Suivi identique hors service**, seules les feuilles de texte du Cadre diffèrent, sur les mots du lot. Vitest 546 fichiers /
5 976 essais. ⚠ **Ce que la mesure a corrigé de la consigne** : la fonction de l'orchestre qui posait déjà le bon mot au menu des profils
**n'avait aucun appelant** (retirée) ; le champ 5 du groupe-cours est peuplé ailleurs (`trimestre-v2.js`), avec un troisième libellé ; la
liste des sites manquait le fil d'Ariane, « Cours : », « — Choisir un cours — » et trois « 5 éléments obligatoires ». **B3 tranché** : la
sentinelle #306 protège la mécanique Créer/Enregistrer du bouton, les titres n'étaient que son ancre — ancre déplacée, break-test rouge.
**Pas vérifié** : ton écran (porte `plans de travail/PORTES-TERRAIN-2026-09-12-section-cours.md`, cinq rangées, trois décisions), Safari,
tes deux groupes. Décisions 3.2 et 3.3 de la porte des étiquettes : « tel quel » (données au relevé, inscrites) ; « Sélectionner un enseignant·e »
hors service confirmé par toi à 9 h 40.

✅ **FAIT EN 1.136.0 (12 SEPTEMBRE 2026, 8 h 25 — release `2c84a34a`, POUSSÉE, `main` = `origin/main` ; relecture croisée de Cowork passée sur `fa27b531`, Playwright vert, Vitest 545 / 5 959) — LES ÉTIQUETTES : L'ORTHOPÉDAGOGUE ENTRE PAR LE CADRE, COMME TOUT LE MONDE** (consigne du jour de Cowork, 7 h 40 ; code `fa27b531`).
**Ce que tu verras** : dans `Cadre › Cours`, le menu **Nature** dit **« Enseignement »** ou **« Orthopédagogie »** (à la place de « Cours » /
« Service ») — tes champs, tes fiches, tes données sont intacts ; en base, la nature vaut toujours `'cours'` ou `'service'`, aucune
migration. Le mot vit à **un seul endroit** (`js/mots-nature.js`) : le jour où d'autres services existent, il se change là, et nulle part
ailleurs. Quand le contexte actif est un service d'orthopédagogie, le Cadre dit **« Orthopédagogue »** partout où il disait
« Enseignant·e » (fil d'Ariane, accordéon, « Profil orthopédagogue », « 2. Service d’orthopédagogie », « 5. Orthopédagogue », la carte du
groupe-cours « Service » / « Ortho. ») ; sur un cours, tout redit enseignant·e. Dans Suivi, le titre de la section dit **« Rencontres
(ortho.) »**, les trois questions créent « ton service d’orthopédagogie », le bouton dit « Créer mon service d’orthopédagogie », la
notification « Service d’orthopédagogie créé … Tes rencontres d'orthopédagogie se tiennent ici », et sur ton 601-101-MQ la carte nomme
l'orthopédagogie directement (texte proposé, à corriger : porte § 3.2). ⚠ **Le libellé de l'ONGLET « Rencontres » n'a pas changé** : il vit
dans `js/config.js`, zone protégée que ta consigne interdisait d'ouvrir — une ligne, sur ton autorisation (porte § 3.1).
**Vérifié comment** : une sentinelle de 13 essais (le point unique et un **verrou structurel** — aucun module de `js/` n'écrit plus
« Service » / « Enseignement » / « Orthopédagogie » en dur, les options d'index.html sont vides et libellées par le code, les mots par
défaut d'index.html sont ceux du point unique ; **l'aller-retour complet du formulaire** — créer un service, le sélectionner, Modifier,
Enregistrer, relire — laisse `'service'` en base ; le libellé de la personne dans les deux sens ; la carte du groupe-cours ; Rencontres ;
les deux infobulles), **huit fois cassée exprès, huit rouges**, code remis (empreintes identiques). Le pack démo capturé AVANT et rejoué
APRÈS : 54 feuilles (valeurs de `cours`, `groupesCours`, `groupeEtudiants`, `infoCours`, `groupeCoursActif` ; textes du Cadre, de cinq
sous-onglets de Suivi et de cinq profils, sur le groupe-cours démo, sur un service créé par les trois questions, et au retour) —
**zéro valeur ne bouge** (seules différences : deux identifiants générés et un DA provisoire), 9 feuilles de texte diffèrent, toutes sur
les mots du lot. Vitest 545 fichiers / 5 959 essais après le commit. ⚠ **Ce que la mesure a corrigé de la consigne** : sa liste des
sites était incomplète — `js/cours.js` (la bibliothèque des cours, deux cartes) écrivait aussi « - Service » ; le verrou l'a attrapé au
premier passage. **Laissé exprès** (perfectible, pas faux : un service EST un cours dans le Cadre) : « Modifier le cours », « Dupliquer le
cours », le bandeau « Mode modification — Cours », l'infobulle du groupe-cours, « 5 éléments obligatoires … horaire » (porte § 3.4).
**Pas vérifié** : ton écran (porte `plans de travail/PORTES-TERRAIN-2026-09-12-etiquettes.md`, dix rangées), Safari, tes deux groupes.

✅ **FAIT EN 1.135.1 (12 SEPTEMBRE 2026, 6 h 35 — release `473f3d75`, poussée, `main` = `origin/main` mesuré au rituel de 7 h 45 ; relecture croisée de Cowork passée vers 7 h) — DANS UN SERVICE, UN ÉLÈVE APPARTIENT PAR SON SERVICE, PAS PAR UN NUMÉRO DE GROUPE** (consigne du jour de Cowork, lots A et B ; commit `06868a06`).
**Ce que tu verras** : dans un service, `Suivi › Liste des étudiant·es` montre **tous** les élèves saisis, y compris ceux dont la
ligne collée d'Omnivox portait le numéro de groupe du collège (ta rangée 9 de ce matin : trois saisis, deux affichés) — corrigé à la
lecture, **rien n'est réécrit chez toi**, l'élève réapparaît (la colonne « Groupe » de sa fiche garde son « 00007 » ; une fiche créée
après ce correctif porte « 00001 », le seul groupe d'un service). Et si tu colles plusieurs élèves sur une seule ligne, elle est
**refusée et nommée** (« Une ligne n'a pas pu être lue — Ligne 1 (« … ») : ne commence pas par un numéro de DA. Une ligne par
élève… ») au lieu de fabriquer un élève fantôme : le service se crée avec les lignes valides, ou pas du tout. Sur tes deux groupes
réels : rien ne bouge.
**Vérifié comment** : une sentinelle de 13 essais (service à groupes hétérogènes rendu 3/3 par les deux sites ; groupe-cours ordinaire à
deux groupes et mode cours aux valeurs de 1.135.0 figées ; service et cours étanches ; groupe écrit ; refus nommé), huit fois cassée
exprès, sept rouges — la huitième (0 rouge) est une doublure d'écriture demandée par la consigne, nommée dans le journal ; une garde
« sans coursId » posée en plus dans le goulot rendait 0 rouge : inatteignable, retirée. Le harnais du pack démo rebâti (jetable) :
90 feuilles hors service AVANT/APRÈS, **0 différence** ; dans le service, 2/3 → 3/3 et les groupes écrits « 00001 ». Vitest 544 fichiers
/ 5 945 essais après le commit. ⚠ **Ce que la mesure a corrigé de la consigne** : le défaut n'était PAS dans `obtenirDonneesSelonMode`
(il ne compare le groupe qu'aux fiches sans coursId ; le harnais rendait 3/3 par ce chemin) — seulement dans le goulot
`obtenirEtudiantsCoursActif`. **Pas vérifié** : ton écran (porte, rangées 13 et 14), le mot du refus (porte § 3), Safari.

✅ **FAIT EN 1.135.0 (11 SEPTEMBRE 2026, 21 H 50) — « RENCONTRES » : UN SERVICE EST UN COURS, UN GROUPE-COURS SANS HORAIRE, LE SOUS-ONGLET SUIVI › RENCONTRES, UNE INTERVENTION QUI SAIT OÙ ELLE EST NÉE** (lots 1 et 2 du cadrage « l'orthopédagogue entre par Suivi »). ⚠ **Mesuré à la reprise : les quatre commits de code étaient DÉJÀ sur `origin/main` depuis 21 h 36** (reflog « update by push »), donc en ligne sous `1.134.0` sans changelog, contrairement à ce que disaient les trois relais (« non poussés exprès ») — la release 1.135.0 répare ce trou et emporte les **deux reprises de la relecture croisée de Cowork** : (1) une intervention née en mode cours (tous les groupes) est vue depuis chaque groupe de ce cours, et l'inverse — sans ça, changer de mode la faisait disparaître ; (2) **tranché par toi : « Rencontres » ne liste que les services** — sur un groupe-cours ordinaire, plus de liste à deux vocabulaires, seulement la porte « Créer un service » et, s'il existe déjà un service dans le trimestre, le lien pour l'activer ; « Interventions » ne change pas ; la fusion se rejuge après le mois d'usage.
**Ce que tu verras** : dans `Suivi`, un sous-onglet **« Rencontres »** entre « Interventions » et « Animation ». Sur un poste sans
trimestre (celui de l'orthopédagogue lundi), il pose **trois questions** sur un seul écran — les dates du trimestre, le nom du
service, la liste des élèves tapée (« Prénom Nom », « DA ; Nom ; Prénom ») ou collée d'Omnivox — et « Créer mon service » crée ce que
le magasin exige et rien d'autre : un trimestre, un **cours de nature « Service »** (sans code, sans discipline, sans compétence),
ses élèves, un **groupe-cours sans horaire** ; Cadre montre le tout tel quel, l'en-tête bascule dessus, Suivi › Liste montre ses
élèves. Ensuite « Rencontres » liste ses rencontres et en crée (« + Nouvelle rencontre », individuelle par défaut ou en sous-groupe,
date, heure, participants cochés, note par élève, bilan) — c'est l'intervention, même module, avec le vocabulaire « rencontre » ;
sur un service, ni « contexte de l'intervention » ni « séance concernée » (ils supposent une séance de groupe). Sur TES deux
groupes-cours, « Rencontres » ne montre AUCUNE liste (tranché le 11 au soir) : une carte qui dit que les rencontres se tiennent dans un
service et que tes interventions sont sous « Interventions », le lien vers un service du trimestre s'il en existe un, et la ligne « Tu
reçois des élèves hors d'un groupe-cours ? Créer un service ». Dans `Cadre › Cours`, un choix **« Nature : Cours / Service »** en tête du
formulaire (sur Cours, tout est comme avant). Pour tous : une intervention **sait désormais dans quel groupe-cours elle est née** et
la liste d'un groupe-cours ne mêle plus celles d'un autre ; tes interventions d'avant restent visibles partout et prennent leur
contexte au prochain Enregistrer de chacune (jamais réécrites en masse). Un élève de service sans séance garde A = 100 % et « En
attente » — c'est le comportement de tout groupe sans séance, laissé exprès (« tout est manuel pour un mois »), inscrit (#836).
**Vérifié comment** : le pack démo capturé AVANT le premier commit et rejoué APRÈS le dernier — 1 284 feuilles (Cadre, Suivi du
groupe et ses deux graphiques, Liste, Présences, 20 profils avec indices et palier, Interventions, export) : **0 différence de
valeur**, seules les chaînes statiques ajoutées diffèrent ; un service sans horaire créé dans le trimestre démo et 13 écrans + 6
sections du profil visités sans exception ; le parcours des trois questions joué dans WebKit sur un poste vide (trimestre a2026
créé, 117 jours de calendrier, service, 4 élèves dont deux à DA provisoire, groupe-cours sans horaire actif, une rencontre créée et
relue, 0 erreur) et en démo ; quatre sentinelles (40 essais : le service se crée sans code et un cours sans code est toujours
refusé, le groupe-cours de service sans horaire et l'ordinaire toujours refusé, aucune séance servie par repli, la liste du service
par le goulot commun, le point unique sur grille et verrou « plus aucune recopie », l'estampille et le filtre des interventions, la
lecture des quatre formes de ligne, la création sur poste vide et le refus sans nom / sans élève / sans dates, le marqueur démo),
vingt-quatre fois cassées exprès, vingt-quatre rouges, remises (empreintes identiques) ; les bancs du 5 et du 6 disent l'après
(E1) ; Vitest 543 fichiers / 5 928 essais. **Les deux reprises** (commit `ea90c376`) : sentinelle des traversées de mode (un cours à deux
groupes et un autre cours : née en mode cours → vue depuis un groupe ; née dans un groupe → vue en mode cours, jamais celle de l'autre
cours ; depuis un groupe, celle de l'autre groupe reste cachée) et sentinelle de la porte (aucune liste ni vocabulaire sur un cours
ordinaire ; le service d'un autre trimestre n'est pas offert ; l'activation mène à la liste) — 5 essais neufs, six fois cassés exprès,
six rouges, remis à empreinte identique ; Vitest 543 fichiers / 5 932 essais avant et après le commit de release `538fbb92` ; le verdict
Playwright local rendu sur ce SHA par `scripts/verifier-playwright.mjs`, puis `scripts/pousser.sh` (si tu lis ceci sur `origin/main`, le
push a eu lieu). **Corrigé en chemin** : `cours` est une clé globale — un service créé en démo restait dans
ta vraie liste de cours ; il est maintenant marqué et retiré quand tu quittes la démo. **Pas vérifié** : ton écran, tes deux groupes
réels, Safari, l'orthopédagogue sur son poste lundi ; **la formule « taux de repérage » (§ G) n'est pas livrée** — le registre ne
permet pas de renommer les libellés des saisies, un modèle avec « nombre de mots » sous « erreurs au total » serait un piège (#835).
**Zones protégées** : `js/config.js` et `js/navigation.js` touchés (sous-onglet, correspondance, initialisateur) avec ton
autorisation du 11 au soir. Porte terrain : `plans de travail/PORTES-TERRAIN-2026-09-12-rencontres.md` (treize rangées — la 11b vérifie la porte et
l'activation d'un service existant —, douze mots proposés dont un neuf pour la carte de la porte — silence = tel quel).

↻ **1.134.0 — PROFIL D'UN ÉLÈVE : UN SEUL RENDU À L'OUVERTURE ; LES GRAPHIQUES LISENT L'ÉCHELLE DE CHAQUE ÉVALUATION ; LE VOLET CONFIDENTIEL SUIT LA LISTE** (lot 4 du cadrage 11, build à lire en bas de page).
**Ce que tu verras** : dans `Suivi › Profils individuels`, le profil s'ouvre une fois — le 6, il se dessinait quatre
fois, et trois mots tapés dans la zone de texte du rapport disparaissaient à 100 ms. Dans Performance › Critères, les
courbes lisent l'échelle de CHAQUE évaluation (la tienne donne exactement les mêmes courbes qu'avant ; une échelle A/B/C
d'un collègue trace ses paliers au lieu d'une courbe trouée ; un critère en points trace sa fraction). Une valeur qui ne se
convertit pas n'est pas devinée : le point est absent et une ligne sous la légende dit « n évaluations sans valeur
convertible dans cette échelle » ; si tes évaluations désignent plusieurs échelles, la ligne dit laquelle donne les zones
(en démo, deux échelles coexistent : la ligne s'affiche, c'est voulu). Les cases « Inclure… » du rapport se mémorisent
quand tu les coches, par trimestre. Volet confidentiel : la case « Services adaptés » reflète `sa` de la liste des
étudiant·es (cochée ou non, non modifiable, « (d'après la liste des étudiant·es) ») ; Catégorie et Sous-catégorie ne
s'affichent que pour un « Oui » ; le « Portrait de lecteur » est parti (tes mots : « peuvent disparaître complètement » —
aucune purge : les valeurs tombent au prochain Enregistrer de ce volet). Accompagnement : « + Nouvelle intervention » à
droite du titre HISTORIQUE, la carte dessous (une classe CSS jamais définie). Trois gestes exportés sans bouton et le
panneau d'indice sans conteneur sont retirés ; l'export anonymisé de trimestre écrit enfin `services_adaptes` d'après la
liste (il écrivait toujours faux).
**Vérifié comment** : sonde Playwright #754 dans le vrai `index.html` — un rendu par quatre chemins (Liste, sélecteur,
Suivi du groupe, onglet Profil), rouge avant (4 rendus, texte effacé), vert après ; deux chemins de plus mesurés depuis
Évaluations (1 rendu). Non-régression des graphiques : les courbes des 20 profils du pack démo (945 points) et les
105 courbes de trajectoires capturées AVANT le correctif, identiques APRÈS. Sentinelle de onze essais sur les modules
réels (échelle A/B/C sans trou, 3 sur 30 → 10, niveau sans valeur → absent et compté, ton échelle → mêmes valeurs,
zones majoritaires, rapport au geste, case SA, portrait parti, gestes partis, rangée HISTORIQUE), quatre fois cassée
exprès, quatre rouges, remise (empreintes identiques) ; les bancs du 5 et du 6 (H1, G5, P-1, P-2, P-5) disent l'après ;
la rangée HISTORIQUE mesurée sous WebKit à 1024 et 1366 (même ligne, bouton à droite, carte dessous). Vitest 539 fichiers
/ 5890 essais. **Pas vérifié** : ton écran, tes deux groupes réels, TES courbes (la rangée 3 de la porte est la seule
vraie preuve de non-régression sur tes échelles), Safari — porte terrain de huit rangées
(`plans de travail/PORTES-TERRAIN-2026-09-11-profils-individuels.md`). **Pas touché** : `js/navigation.js` (zone protégée) —
aucun chemin n'a eu besoin d'y toucher.

↻ **1.133.0 — SAISIE DES PRÉSENCES : UNE DATE VERROUILLÉE NE L'EST QUE POUR CE GROUPE-COURS ET CE TRIMESTRE ; LA DÉMONSTRATION N'ANNONCE PLUS UNE CONFIGURATION INCOMPLÈTE** (lot 3 du cadrage 11, build à lire en bas de page).
**Ce que tu verras** : dans `Suivi › Saisie des présences`, verrouiller une date (le cadenas) ne vaut plus que pour
le groupe-cours et le trimestre où tu le fais — jusqu'ici, le 8 septembre verrouillé dans un groupe l'était dans
l'autre, et le serait resté l'an prochain. Les dates que tu avais verrouillées avant restent verrouillées dans
chacun de tes groupes (elles l'étaient partout ; rien n'est changé au passé, l'ancienne liste reste en place). La
date, le sous-groupe, le tri et la recherche de l'écran appartiennent maintenant au trimestre : la démonstration ne
te prend plus ta date, et te la rend au retour. La démonstration elle-même ouvre `Saisie des présences` sans le
bandeau « Configuration incomplète », sur la dernière séance passée, avec ses vingt élèves — le 6, elle ouvrait sur
le bandeau, une date vide et « (0 étudiant·e) ». « ← Précédent » sans date va à la dernière séance passée.
Invisible mais posé : sans cours actif, l'enregistrement n'écrit plus rien (il remplaçait la fiche d'un autre cours).
**Vérifié comment** : sentinelle de douze essais sur le module réel, dix fois cassée exprès (dix rouges) et remise ;
les trois bancs du 6 qui affirmaient l'avant (S-3, S-4, S-6, et le banc du cadenas #785) disent l'après ; un essai
Playwright active la démo dans le vrai `index.html`, ouvre la saisie et lit : aucun bandeau, une date posée, vingt
élèves — cassé exprès (l'appel retiré), rouge, remis. La relecture croisée a fait reprendre deux points : le
semis n'entre pas dans la démonstration (tes dates verrouillées y seraient restées, pour toujours), et le champ
Recherche est remis lui aussi ; quatre essais de plus, quatre fois cassés. **Pas vérifié** : ton écran, tes deux groupes réels, Safari,
l'adresse en ligne — porte terrain de cinq rangées (`plans de travail/PORTES-TERRAIN-2026-09-11-saisie-des-presences.md`),
dont la première écrit chez toi (le verrou et la grille qu'il sauvegarde ; déverrouiller remet tout comme avant).

↻ **1.132.0 — LISTE DES ÉTUDIANT·ES : LES ABANDONS RESTENT VISIBLES, GRISÉS ; LES TRIS TRIENT ; LA RECHERCHE IGNORE LES ACCENTS** (lot 2 du cadrage 11, build à lire en bas de page).
**Ce que tu verras** : dans `Suivi › Liste des étudiant·es`, un élève en abandon, inactif ou en décrochage
reste dans le tableau, en gris, avec son statut entre parenthèses après son nom — ta décision de 14 h 17.
La note sous le tableau le promettait déjà ; le tableau le retirait. Les moyennes et les corrélations
n'ont pas bougé : elles comptent les actifs, comme avant. Le clic sur « # » renverse l'ordre, le tri par DA
est numérique, « aime » trouve Aimé, la liste se rafraîchit quand tu cesses d'écrire. Le filtre des profils
offre les six profils que l'application calcule. « ≥ Min. » tient après un tri, et un élève sans aucune
évaluation compte comme sous le minimum. Dans `Cadre › Trimestre`, un DA déjà présent est refusé à l'ajout
(le message nomme l'élève existant) et ignoré à l'import ; le numéro de groupe s'écrit sur cinq chiffres.
Le bouton d'aide du titre ne disparaît plus au premier rendu.
**Vérifié comment** : sentinelle de quatorze essais sur les modules réels, dont le piège du lot (un abandon
rendu, `moy=` identique avec et sans lui), six fois cassée exprès et remise ; les bancs d'audit du 6 disent
l'après. **Pas vérifié** : ton écran, tes groupes réels, et un abandon réel (le pack de démonstration n'en
porte aucun) — porte terrain de sept rangées (`plans de travail/PORTES-TERRAIN-2026-09-11-liste-des-etudiants.md`).
Les deux textes de Cadre › Trimestre sont ceux de Cowork, posés tels quels sauf ton mot.

↻ **TES ÉVALUATIONS D'HIVER 2026 RETROUVENT LEURS GRILLES (données, 11 sept. ~15 h 20 — aucun code d'application)**.
**Ce que tu verras** : dans `Évaluation › Annoter et évaluer`, une évaluation d'Hiver 2026 s'ouvre avec sa
grille et son échelle dans la palette Paramètres ; la bannière « Grille d'origine introuvable » a disparu.
Ton rapport de 14 h 50 : les 408 évaluations citaient trois grilles absentes de l'instance en ligne.
C'était l'île non réparée : la réparation du 5 août vivait dans l'autre navigateur, et l'instance en
ligne a reçu la copie d'avant. Tu as recréé les trois grilles sous leurs identifiants d'origine, depuis
leurs jumelles « H26 », prouvées par leurs critères (223 sur 225, 92 sur 94, 89 sur 89 ; les quatre
mal estampillées de juin sont nommées, pas touchées). Huit cartouches recopiées, rien d'écrasé. Puis, à 15 h 45, **l'échelle** : 44 de ces évaluations (celles de
février) citaient une échelle de démonstration disparue ; tu l'as recréée sous son identifiant, copie de
« IDME et niv 0 » — ton hypothèse (la tienne descend de celle-là) confirmée par les notes : 43 sur 44 se
recalculent à l'identique.
**Vérifié comment** : dry-run relu par toi, exécution journalisée, outil éprouvé au banc (cassé deux
fois, remis). **Pas vérifié** : ton écran après Cmd+R — une évaluation H26 ouverte, puis un second
rechargement pour la durabilité. À noter : les jumelles restent, deux grilles de même nom dans le
menu d'Hiver 2026 ; les retirer est un autre geste, à ta décision.

↻ **1.131.1 — LA BARRE « ASSIDUITÉ (A) » DE TES GROUPES D'HIVER 2026 REVIENT** (build à lire en bas de page).
**Ce que tu verras** : dans `Suivi › Suivi du groupe`, sous un groupe d'Hiver 2026, la barre A porte de
nouveau ses points et sa moyenne, comme C et P. Ton rapport de 14 h 17 : la barre était vide pour tous
tes groupes H26. Depuis la fin août, le nombre de périodes d'une séance se lit dans l'horaire, séance
par séance, et ne se déduit plus des heures ; tes trois horaires de janvier ne le portaient pas, donc
zéro période offerte, zéro séance comptée, rien à l'écran et rien pour le dire. Mais chacun de ces
horaires porte le format que tu avais déclaré (« 2 périodes par séance ») : une séance qui n'a pas son
nombre reprend maintenant celui de son horaire, à la lecture. Rien n'est réécrit dans tes horaires ni
tes présences ; le cache des séances se refait tout seul à l'ouverture.
**Vérifié comment** : six sondes en lecture seule sur tes données, collées par toi dans la console,
jusqu'à la ligne qui disait 0 ; le cas rejoué au banc avec un horaire d'avant (format 2, séances sans
nombre), horaire.js et saisie-presences.js réels : 2 périodes, plus 0 ; cassé exprès, rouge, remis.
**Vérifié par toi** vers 14 h 50 sur `1.131.1` déployée : « ça marche » — la barre A de ton groupe H26 a
retrouvé ses points. Inscrit pour la suite : la barre doit dire pourquoi elle est vide
quand ça arrive (#830), au lieu de se taire.

↻ **1.131.0 — SUIVI DU GROUPE : TES ÉLÈVES SUIVIS SONT GARDÉS PAR GROUPE-COURS, CHANGER DE GROUPE NE LES EFFACE PLUS** (build à lire en bas de page).
**Ce que tu verras** : dans `Suivi › Suivi du groupe`, les élèves que tu suis (au plus cinq, les pilules
colorées) appartiennent maintenant au groupe-cours où tu les as choisis. Ouvrir « Détails » sous ton
deuxième groupe ne vide plus la liste du premier — jusqu'ici, c'était le cas, en base, sans un mot.
Ta liste actuelle, si tu en as une, est reprise telle quelle dans le groupe où sont ces élèves ; la
valeur d'avant reste en place. Un sixième clic sur un nom te dit pourquoi il refuse (cinq au maximum).
Un élève passé en abandon libère son siège. Le filtre « P < 65 % » ne retient plus un élève dont le P
s'affiche « — ». Le bandeau « Étudiant·es prioritaires » (qui ne s'ouvrait jamais) est parti ; en mode
Détails, une ligne dit où cliquer pour ouvrir un profil. En démonstration, la famille « Défi
spécifique » n'est plus à zéro et la console ne se remplit plus d'avertissements.
**Vérifié comment** : le cas réel de l'audit du 6 (deux élèves suivis sous A, « Détails » ouvert sous
B, retour sous A) rejoué au banc : les deux élèves survivent, rien n'est écrit sous B ; vingt essais,
cinq fois cassés exprès et remis. Les bancs d'audit du 5 et du 6 disent maintenant l'après. Les trois mots
tranchés par toi à 13 h (le refus du sixième tel quel ; « … d'un élève. » ; rien à écrire pour la
pratique absente, dont le texte n'avait pas de site). **Pas vérifié** : tes deux groupes réels et ton
iPad — porte terrain de cinq rangées (`plans de travail/PORTES-TERRAIN-2026-09-11-suivi-du-groupe.md`).

↻ **1.130.2 — L'APPLICATION NE REDEMANDE PLUS 300 FICHIERS À CHAQUE OUVERTURE ; LA CAUSE DES 30-45 S N'EST PAS ÉTABLIE** (build `0911-1139`).
**Ce que tu verras** : rien de nouveau à l'écran. Le serveur disait au navigateur, pour chacun des deux
cents scripts, « redemande-moi à chaque ouverture » même quand rien n'avait bougé. Il dit maintenant
« garde-le un an » — et c'est sûr, parce que chaque script change d'adresse dès que son contenu change
(les jetons `?v=` que la release pose), et que la page d'entrée, elle, est toujours redemandée.
⚠ **Mais ce n'est pas ce qui te coûtait 30 à 45 secondes.** Ta mesure de 11 h 58, sur la version
d'avant, dans un nouvel onglet : **527 ms**, 302 fichiers redemandés. Trois cents allers-retours coûtent
une demi-seconde, pas quarante. Les 34 à 51 s des captures du matin étaient des rechargements forcés,
pas des ouvertures. Le lot reste livré (moins de requêtes, sain), mais il ne règle pas ce que tu as
vécu, et les deux suites prévues (charger les scripts en parallèle, un écran d'attente) sont retirées :
elles répondaient à une cause qui n'est pas la bonne.
**Ce qui reste dû** : saisir la cause **au moment où ça se reproduit** — Chrome, Network, et la barre la
plus longue de la cascade (une requête ? le démarrage de l'application ? la base locale ?). Une capture
de cette barre dans un rapport de bug suffit ; sans reproduction, rien à coder.
**Vérifié comment** : trois fichiers qui échappaient aux jetons (un script sans jeton, le pack de
démonstration et le décodeur HEIC chargés à la demande) en ont reçu un ; une sentinelle refuse toute
référence sans jeton et refuse qu'`index.html` devienne immuable, break-testée cinq fois (rouge, remis).
Une relecture à froid a retenu que la feuille de style principale doit rester redemandée (la page de
référence d'interface la charge sans jeton) : une requête sur trois cents, gardée. **Pas vérifié** : que
l'en-tête arrive jusqu'à ton Chrome derrière Cloudflare, et que l'iPad dit bien `1.130.2` après le
déploiement — deux rangées de la porte (`plans de travail/PORTES-TERRAIN-2026-09-11-ouverture-immuable.md`).

↻ **1.130.1 — DEPUIS LE SUIVI, UN LIEN MÈNE AUX RÉGLAGES ; ET L'ÉCRAN DE RÉGLAGE EST CLOS** (build `0911-1103`).
**Ce que tu verras** : en tête de `Suivi › Suivi du groupe` et sous le titre de la carte RàI d'un
profil, un petit bouton-lien **« Régler les outils d'observation »** ouvre `Labo › Outils
d'observation`. C'est ta décision de 10 h 48 : l'écran reste dans Labo (quatre de ses réglages
agissent hors de Suivi), et Suivi y mène là où tu constates un effet. Rien d'autre ne change à l'écran.
**Ce qui a été retiré sans que rien ne bouge** : cinq chemins de code sous les seuils du dépistage,
inscrits hier, remesurés un par un aujourd'hui (930 lignes) — aucun n'atteignait un écran. Gardé, parce
que la leçon du 10 dit qu'un « mort » sur quatre est vivant : `identifierDefiSpecifique` (trois bancs
l'exécutent), les `detecterDefis` et `identifierPattern` des pratiques.
⚠ **Un constat qui te concerne** : le titre « Diagnostic par critère (seuil force : N %) », que la
porte 2.3b de ce matin te demandait de lire, **n'a jamais été affiché** — il n'était produit que par
une de ces chaînes mortes. Le seuil de défi agit bel et bien (couleur des badges « Forces et défis »,
défi principal de la carte RàI), et sa conversion est prouvée par cinq essais ; mais ce que tu as vu à
2.3b n'a pas pu être ce titre. La porte du matin porte la note.
**Vérifié comment** : chaque appelant remesuré dans le code, l'HTML et les tests, y compris sous forme
de chaîne ; une sentinelle neuve (#824) verrouille l'absence des cinq et la présence des gardés, et
rougit quand on réintroduit un nom ou qu'on retire la fonction gardée ; le lien du Suivi du groupe
cliqué sous WebKit dans les deux modes : arrivée sur l'écran, zéro erreur. **Pas vérifié** : le clic
sur le lien de la carte RàI (il faut un élève avec données) — une porte, deux rangées
(`plans de travail/PORTES-TERRAIN-2026-09-11-liens-depuis-suivi.md`), l'artefact revient à Cowork. Les
mots du lien attendent ton verdict (§ 3 de la porte).

↻ **1.130.0 — « OUTILS D'OBSERVATION » SE LIT SANS RIEN DÉPLIER** (build `0911-1022`).
**Ce que tu verras** : dans `Labo › Outils d'observation`, la forme que tu as validée sur maquette à
10 h 05. Les deux sections repliables et les trois cartes-accordéon sont devenues des blocs ouverts ;
un sommaire « Sur cette page » en tête mène à chaque carte ; les options vont deux par rangée ; chaque
réglage porte de petites étiquettes qui disent l'écran où son effet se voit (ambre = hors de Suivi) ;
les trois curseurs sont devenus des champs chiffrés avec leur unité, comme les seuils Fragile /
Acceptable / Bon ; les deux « Remettre les valeurs par défaut » disent lesquelles. **Tes valeurs sont
les mêmes, à la même place** : rien n'est écrit chez toi ni chez les testeurs.
**Ce que j'ai décidé seul, et que tu peux renverser en dix secondes** : j'ai gardé les textes d'aide
et les libellés de 1.129.2 là où la maquette les abrégeait (la consigne le demandait) ; j'ai écrit la
plage permise sous chaque champ chiffré (les bornes des curseurs disparaissaient avec eux) ; deux
étiquettes de la maquette ont été corrigées contre la carte des effets (la collecte ACP n'agit que dans
le profil ; les graphiques agissent aussi sur « Gestes cognitifs »), trois ajoutées (export recherche
pour les actions et la grille, Interventions pour le seuil de défi), une retirée (l'export recherche
que la maquette prêtait au RàI).
**Vérifié comment** : cinq essais qui EXÉCUTENT le panneau prouvent qu'un « 60 » tapé s'écrit 0,60 pour
les calculs, que 0,65 stocké s'affiche « 65 », que « Remettre » remet 3 · 10 · 5 · 70 sans toucher
70 · 80 · 85, et qu'aucun curseur ni repliable ne survit ; sans la division à l'écriture, deux cas
rougissent ; sans la multiplication à la lecture, un cas rougit ; fichier restauré par empreinte.
Rendu capturé sous WebKit à 1280 et 820 px, modes sombre et clair : zéro débordement, zéro erreur.
Vitest complet vert. **Pas vérifié** : Safari et l'iPad — quatre portes
(`plans de travail/PORTES-TERRAIN-2026-09-11-forme-outils-observation.md`), l'artefact revient à Cowork.

↻ **1.129.2 — L'ÉCHELLE DE DÉPART DIT LES QUATRE MOTS À LA SOURCE, ET LE BILAN AUSSI** (build `0911-0717`).
**Ce que tu verras : rien chez toi, rien chez les testeurs.** Ton échelle est du stock, et le stock ne
bouge pas — c'est ta décision de 7 h 11 (« oui, renommer » la source), et c'est mesuré : ce qui sème
l'échelle de départ ne fait rien quand un espace en a déjà une. Ta propre échelle dira « Maîtrisé »
à côté d'une prose qui dit « Maîtrise » jusqu'à ce que tu la renommes dans Conception › Échelles.
**Un nouvel espace** recevra une « Échelle de départ (IDME) » qui nomme ses niveaux Incomplet /
Développement / Maîtrise / Étendu, et dont la description dit la même chose (elle disait
« Insuffisant » alors que son I s'appelait déjà Incomplet). **Le bilan d'un élève** dont un critère de
français s'effondre lit « Incomplet », plus « Insuffisant » — en dur, comme avant, ton choix ; pour un
collègue dont l'échelle nomme autrement son premier niveau, ce mot ne suivra pas son échelle, alors
que le reste du bilan la lit. Trois aides qui décrivaient le gabarit suivent.
**Ce que la mesure a corrigé dans la consigne** : elle citait « le versement des huit échelles », retiré
le 1er septembre ; le semis d'aujourd'hui est une autre fonction, et c'est elle qui a été mesurée.
**Ce qu'un partage emporte** (mesure due, sans correction) : une grille partagée n'emporte PAS
d'échelle (les grilles n'en référencent aucune) ; une **échelle** partagée voyage entière, avec les
noms de ses niveaux. Un collègue peut donc te transmettre une échelle qui dit « Maîtrisé » pendant
qu'un espace neuf dit « Maîtrise ». Ce n'est pas un défaut, c'est le fonctionnement voulu des mots
qui voyagent.
**Vérifié comment** : douze substitutions visées par ligne et refusées si non uniques ; une sentinelle
neuve (un espace qui porte déjà « Maîtrisé » le garde après le semis, un espace neuf reçoit les quatre
mots), qui rougit quand on remplace la garde du semis par une réécriture, puis fichier restauré par
empreinte ; Vitest complet après le commit. **Aucune porte terrain** : tout ici se lit dans le code, et
tu ne crées pas d'espace neuf ni de critère effondré pour voir — ça attend un cas réel.

↻ **1.129.1 — L'ÉCHELLE IDME DIT LES MÊMES QUATRE MOTS PARTOUT, ET LE BLOC DES SEUILS DIT CE QU'IL RÈGLE** (build `0911-0644`).
**Ce que tu verras** : partout où l'application écrit l'échelle IDME en toutes lettres (aides,
infobulles, glossaire, guides, aide intégrée, écran de réglage), les quatre lettres se lisent
**Incomplet / Développement / Maîtrise / Étendu** — tes mots de ce matin. Plus d'« Insuffisant »,
d'« Insuffisant ou incomplet », d'« Excellent » ni d'« Excellence » ; plus d'« en Développement »
ni de « Maîtrisé » dans la prose. Dans `Labo › Outils d'observation`, le bloc « Seuils
d'interprétation » n'annonce plus l'IDME : il dit que ses trois seuils colorent les colonnes
Assiduité, Complétion, Performance et Mobilisation de la liste des élèves et qualifient
l'engagement dans le profil, sans toucher ni la note ni l'échelle. L'aide des « Indicateurs
visuels des seuils » dit que ce sont les niveaux de **ton** échelle qui se tracent sur les
graphiques ; le repère « note différée » renvoie au bon écran ; « cueillette » est devenu
« collecte ». Fragile / Acceptable / Bon n'ont pas bougé : ils attendent l'orthopédagogue.
**Rien n'est écrit dans tes données, et les noms des niveaux de tes échelles ne bougent pas** :
ce sont tes mots, et ils voyagent avec elles. ⚠ Conséquence à trancher : l'échelle de départ
semée chez chaque nouvel utilisateur dit encore « en Développement » et « Maîtrisé » (et sa
description, « Insuffisant ») — la porte terrain te pose la question (§ 3).
**Vérifié comment** : quarante-sept substitutions, chacune visée par numéro de ligne et
refusée si le texte n'y était pas exactement une fois ; diff relu en entier ; le multi-ensemble
des nombres du diff est identique avant et après (aucune borne, aucune couleur) ; Vitest 531
fichiers / 5793 essais. **Pas vérifié** : l'écran lui-même — une porte, trois rangées
(`plans de travail/PORTES-TERRAIN-2026-09-11-mots-depistage.md`), l'artefact revient à Cowork.
Le reste de #823 (les deux textes faux, « cueillette ») est livré : la fiche est close. (`#823`)

↻ **1.129.0 — DEUX RÉGLAGES QUI NE FAISAIENT RIEN S'EN VONT, LA FENÊTRE D'ANALYSE FONCTIONNE** (build `0910-1645`).
**Ce que tu verras** : dans `Labo › Outils d'observation`, la case « Découpler P et N » et le menu
« Unité d'affichage de l'assiduité » ont disparu — rien ne les lisait. La « Fenêtre d'analyse des
patterns » s'applique enfin : le nombre que tu tapes atteint les calculs du profil et du Suivi du
groupe, qui restaient à 3 quoi que tu tapes. ⚠ **Si tu y avais mis un autre nombre, il est reparti à
3** : cette valeur n'avait jamais eu d'effet, la reprendre aurait changé tes profils sans que tu l'aies
demandé (décision de Cowork, confirmée par toi). Retape-le, et cette fois ça compte. Et le curseur
« Direction du risque » s'appelle **« Sensibilité des flèches par critère »** : il agit, mais pas sur
ce que son nom disait — il règle la variation minimale pour qu'une flèche (→ / ←) apparaisse après un
critère dans le profil. Sa valeur et son effet ne changent pas.
**Rien n'est écrit dans tes données** : les préférences retirées restent chez toi, muettes.
**Ce que la relecture croisée a attrapé** : la carte des effets d'hier disait que ce curseur ne
faisait rien. Faux — elle avait suivi une fonction du même nom (morte) et pas le seuil, qui a un
second lecteur vivant. Sans la mesure préalable, les flèches auraient été figées à 0,05 sans que
personne le sache. C'est toi qui as tranché : garder et renommer.
**Vérifié comment** : neuf essais qui EXÉCUTENT le panneau sur le vrai code des seuils et prouvent
que la valeur tapée arrive à la fonction que les douze calculs appellent ; neuf ablations, neuf
rouges, arbre restauré par empreinte ; Vitest 531 fichiers / 5793 essais.
✅ **VU À L'ÉCRAN PAR GRÉGOIRE — porte terrain relevée le 10 septembre à 18 h 00, 12 sur 12, zéro
échec** (`plans de travail/PORTES-TERRAIN-2026-09-10-823.md`), sur `app.codexnumeris.org` : les deux
blocs partis sans trou ni titre orphelin, le curseur sous son nouveau nom et sa nouvelle aide, la
fenêtre qui survit au rechargement et qui atteint le profil (à 12, plus aucune flèche ; à 3, elles
reviennent). ⏳ **Reste de ce chantier** : les deux textes de l'écran qui promettent ce que le code ne
fait pas, et le mot « cueillette » — ce sont tes mots, ils attendent ton tri. (`#823`)

↻ **1.128.4 — LES QUATRE RÈGLES QUI QUALIFIENT UN CONTEXTE SONT ÉCRITES AU MÊME ENDROIT** (build `0910-1531`).
**Ce que tu verras : rien.** Pas un mot, pas une borne, pas une couleur n'a bougé — c'est le
critère de réussite de ce lot, et il est mesuré : les quatre règles ont été rejouées AVANT et
APRÈS sur 1630 cas (chaque borne, chaque borne ± 1 point, et le texte complet de la carte
Mobilisation du profil), zéro différence. **Ce qui a changé pour toi** : quand tu demandais
« comment l'application décide-t-elle qu'un contexte est Favorable ? », la réponse était
éparpillée dans quatre fichiers. Elle tient maintenant dans un seul (`js/contexte-qualification.js`),
avec la provenance et la date de chaque borne, et le tableau des désaccords réels — mot par mot,
en points de pourcentage — est écrit au § 8 de l'inventaire du 10 septembre. **C'est ce tableau
qui part chez l'orthopédagogue** ; rien n'y est recommandé. Trois faits que personne n'avait vus :
« Assiduité critique » veut dire « sous 60 % » sur une carte du profil et « sous 70 % » sur la
carte d'à côté ; une quatrième borne (60 %) n'est réglable nulle part ; et le palier
« Insuffisant » du contexte ne peut jamais s'afficher. Aucun des trois n'est corrigé : ce sont
des décisions de pédagogie, elles attendent l'automne (`#821`, `#822`).
**Vérifié comment** : harnais AVANT/APRÈS sur le code d'avant (`5c29d3fd`) et d'après ; sentinelle
de 24 essais dont 8 break-tests rouges ; Vitest 530 fichiers / 5785 essais. **Pas vérifié** :
l'écran dans Safari et sur iPad — aucun verdict local ; le CI WebKit tranche, et une divergence
serait une régression, pas une nouveauté.
**Ajouté le même soir, sans changement de version — ce que l'écran `Labo › Outils d'observation` fait
vraiment** : pour chacun de ses vingt réglages, on sait maintenant où son effet se voit (§ 4 du cadrage
de l'écran de réglage du dépistage). **Quatre réglages ne font rien** — « Découpler P et N », « Fenêtre
d'analyse des patterns », « Unité d'affichage de l'assiduité » et « Direction du risque » : tu peux les
changer, aucun écran ne bouge, et la fenêtre d'analyse reste à 3 quoi que tu tapes. Aucun des vingt ne
touche une note. Quatre agissent ailleurs que dans Suivi (la palette d'annotation, la liste des
évaluations, le badge « dépistage » d'une grille, l'export recherche). Rien n'est corrigé : ce tri des
réglages est le chantier que tu as ordonné le 10 septembre, et la forme de l'écran t'appartient.
**Vérifié comment** : chaque lecteur de chaque clé remonté jusqu'à un rendu, dans le code ; pas d'écran
ouvert. (`#823`, `#824`)

↻ **1.128.3 — QUATRE RÉGLAGES QUI N'ATTEIGNAIENT PAS LEUR CALCUL** (build `0910-1147`).
**Ce que tu verras** : (1) dans le panneau Portfolio d'un profil, les artefacts cochés
automatiquement correspondent enfin au mode que tu as choisi — « N derniers » retenait en
réalité les N *meilleurs*, et « Hybride » oubliait le bloc Obligatoires ; en hybride, tu peux
maintenant cocher à la main autant d'artefacts que la note en compte. (2) Le diagnostic par
critère affiche « seuil force : 70 % » au lieu d'un 0.7125 figé, et il bouge quand tu bouges
ton curseur. (3) La légende de couleurs du tableau de bord annonce ses vraies bornes
(30-47,5 / 47,5-65 / 65-82,5 / ≥ 82,5) ; **la barre elle-même ne change pas d'un pixel**.
(4) Les trois curseurs « Fragile / Acceptable / Bon » de Labo › Outils d'observation servent
enfin : ils gardaient ta valeur et te la remontraient, mais aucun calcul ne la lisait.
⚠ **Si tu avais déjà déplacé un de ces trois curseurs, ton réglage prend effet maintenant** —
les couleurs de ta liste peuvent bouger. C'est ton réglage qui s'applique ; rien de neuf n'a
été posé à ta place.
**Ta note du cours n'était touchée par aucun des quatre.**
**Vérifié comment** : trois bancs neufs, dont deux qui EXÉCUTENT le code au lieu de le lire
(les modes de sélection sur un jeu dont les numéros contredisent les identifiants, pour prouver
lequel des deux tris décide ; le rebranchement des curseurs sur une base montée en mémoire).
Chaque banc a été rendu ROUGE avant d'être cru : 16 ablations, 16 rouges, l'arbre restauré par
empreinte sha256 à chaque fois. Vitest : 529 fichiers, 5760 essais, zéro échec.
⛔ **CE QUI N'EST PAS VÉRIFIÉ** : rien de tout ceci n'a été vu à l'écran. Aucune session cloud ne
peut lancer Safari, et aucune spec Playwright existante ne touche ce code — le verdict WebKit
vient de la CI, et le verdict Safari/iPad reste à faire sur ton Mac. **À regarder en priorité** :
la légende du tableau de bord porte maintenant des décimales (« 47,5 % ») dans quatre colonnes
serrées — c'est là que ça peut déborder sur iPad.

↻ **1.128.0 — LA « CONSOLIDATION DES APPRENTISSAGES » N'EXISTE PLUS** (build `0910-0019`).
**Ce que tu verras** : la carte du Labo a disparu, et **deux autres affichages avec elle** — la
ligne « Consolidation : … » de l'onglet *Forces et défis* d'un profil étudiant, et les mentions
« Consolidé depuis cette production » qui apparaissaient au survol du graphique de progression.
C'est toi qui l'as demandé : « cette fonctionnalité n'a jamais vraiment été concluante ».
**Rien de ce que tu as saisi n'est touché** — ce module ne faisait que lire.
**Vérifié comment** : les six sous-sections du Labo ouvertes une à une dans un navigateur, aucune
erreur, et la page « Études » ne porte plus que ses deux autres cartes. Le repère
« Maîtrisé à partir de » de tes échelles, lui, **garde tout son effet** : il a d'autres lecteurs
(les cartouches, le classement des résultats par niveau), vérifiés un par un avant de couper.

↻ **La fenêtre « Soutenir Labo Codex » dit à quoi on s'abonne.** « Suivre le projet » passe
au-dessus de « Avec tes moyens », et les trois abonnements nomment le **blogue Codex Numeris** :
l'abonnement gratuit et celui de soutien sont deux niveaux du même abonnement au blogue.
Rien ne le disait, et ça se lisait comme un abonnement à l'application.
**Vérifié comment** : rendu mesuré à trois formats (iPad portrait et paysage, téléphone) — ordre
bon, aucun texte hors cadre, aucun défilement horizontal.

▣ **Le format HEIC : il n'y avait rien à corriger, et c'est mesuré.** Tu as signalé que Chrome ne
lit pas le HEIC. C'est vrai de Chrome, mais l'application ne compte plus sur lui depuis fin août :
elle embarque son propre décodeur. **Dans ton Chrome, une photo d'iPhone de 2,9 Mo est convertie en
3024 × 4032 en 2,5 secondes.** L'encadré ne promet le HEIC que là où il peut le tenir — il le
retire de lui-même quand tu ouvres l'application par double-clic. Rien changé.

⏳ **Ce qui reste à voir sur TA tablette** : la fenêtre de soutien dans Safari. Elle a changé deux
fois en vingt-quatre heures sans que personne l'y voie.

✅ **RELEVÉE — la porte terrain des sept livraisons du jour (#802) : 14 sur 14, zéro échec.**
`plans de travail/PORTES-TERRAIN-2026-09-09.md`, relevée le 9 sept. à 18 h 49. **Ta grille de
dépistage tient** : re-désignée, elle a survécu au rechargement (rangée 1.1) — plus rien à faire de
ce côté. Sur ta tablette, la bulle répond au doigt sur les cinq essais, et le Comparateur se lit en
mode sombre. Tes trois décisions sont écrites dans le markdown, pas dans une conversation : la prose
de l'Aide retenue telle quelle, « Verrou sur une évaluation » confirmé, et **l'intention prime — la
cible d'apprentissage**, ce dernier point ouvrant un chantier (#810) plutôt qu'un correctif.
Consigne de publication de l'artefact pour Cowork :
`plans de travail/CONSIGNE-COWORK-artefact-porte-802.md`.

↻ **1.127.5 — LA FENÊTRE « SOUTENIR LABO CODEX » SE LIT D'UN COUP** (build `0909-2314`).
**Ce que tu verras** : quatre sections en liste sont devenues **trois blocs cadrés** — « Avec ton
temps », « Avec tes moyens », « Suivre le projet » — et le contact descend en pied, sans titre. Le
bleu ne sert plus **qu'aux liens** : les titres de section le portaient aussi, si bien que rien ne
ressortait. Les filets entre les lignes et les puces disparaissent. **Le blogue dit enfin sur quoi il
porte** : procédures, trucs et astuces de Labo Codex, et analyses critiques sur la technologie, la
pédagogie et l'éducation. La Voûte ne s'y annonce plus — ta décision du 10 septembre.
**Vérifié comment** : rendu au navigateur (Chromium) en mode clair et en mode sombre, à 980 px, à
820 px (ta tablette en portrait — aucun débordement) et à 520 px (les blocs s'empilent). La fenêtre
passe de 945 à 759 pixels de haut. Deux maquettes t'ont été soumises à l'écran avant de coder ; tu as
tranché la direction et refusé mes phrases d'accroche, donc la prose reste la tienne. (#815)
⏳ **Ce qui reste dû, et c'est à toi** : cette fenêtre n'a pas été ouverte dans Safari sur ta
tablette. Rien dans le correctif ne dépend du navigateur, mais personne ne l'y a vue.
⚠ **Un défaut assumé, pas caché** : quatre libellés de liens passent sur deux lignes dans les
colonnes. C'est le prix des deux colonnes avec des libellés de cette longueur ; les raccourcir
toucherait tes mots, donc je ne l'ai pas fait.

↻ **1.127.4 — LE JOURNAL DE BORD D'UNE ÉVALUATION REDEVIENT LISIBLE** (build `0909-2129`).
**Ce que tu verras** : le journal de bord d'une copie s'ouvrait **sans panneau**. Son contenu se
lisait à même le voile bleu de la fenêtre, et la liste des évaluations le traversait — bandeau,
pastilles d'état, boutons — au point de le rendre illisible par bandes. Il a maintenant le même fond
opaque que les autres fenêtres de l'application, dans les deux modes, et ses étiquettes de détail
(durée, note, niveau) se lisent au lieu de se deviner.
**Vérifié comment** : une seule déclaration en était la cause — le fond du panneau s'appuyait sur une
couleur **qui n'existe nulle part** dans l'application, et une couleur inexistante annule la
déclaration au lieu de la dégrader. Onze couleurs et mesures du même bloc étaient dans ce cas ;
toutes rebranchées. Rendu au navigateur sur un banc qui **reproduit ta capture**, dans les deux
modes ; contrastes recalculés depuis la feuille de style, tous au-dessus du minimum d'accessibilité.
Un garde-fou empêche désormais ce type de couleur fantôme de se rajouter. (#811, signalé par toi le
9 septembre à 21 h 02)
⏳ **Ce qui reste dû, et c'est à toi** : rouvrir un journal de bord sur ta tablette. Safari n'a pas
été visité.
⚠ **Deux choses vues en réparant, écrites mais NON corrigées** : le bouton qui ferme ce journal
mesure 34 × 26 pixels au lieu des 44 × 44 visés au doigt, et c'est le seul moyen d'en sortir — ni le
voile ni la touche Échap ne ferment (#814). Et le nom de fichier de tes rapports de bug **avance
d'un jour** dès que tu en produis un après 20 h : celui de ce bug-ci porte le 10 alors que tu l'as
écrit le 9 (#812).

↻ **1.127.3 — DEUX MOTS POUR DEUX CHOSES, ET LE BOUTON COCCINELLE NE SERT PLUS QU'AUX BUGS**
(build `0909-1955`).
**Ce que tu verras** : dans ta grille, le champ « Niveau SOLO » s'appelle maintenant « **Complexité
SOLO du critère** » ; dans ton échelle, l'équivalent devient « **Palier SOLO du niveau** ». C'est le
même mot qui servait aux deux, et il désignait deux choses opposées : ce qu'un critère EXIGE d'un
côté, ce qu'un élève ATTEINT de l'autre. Tu t'y es trompé toi-même aujourd'hui sur ton critère
Structure, la fiche d'aide ouverte juste à côté. ⮕ **Rien n'a changé dans tes grilles ni dans tes
échelles** : c'est l'étiquette à l'écran, pas ce qui est enregistré.
▣ **Pourquoi maintenant, et pas après le 14** : dire « mon seuil est le relationnel » devant vingt
collègues ferait lire à une partie de la salle que trois de tes cinq critères passent sous ton propre
seuil. Le chantier de fond, lui, attend la rencontre — il est cadré dans la fiche #810.
▣ **Le bouton coccinelle annonce enfin ce qu'il y a derrière.** Il disait « Signaler un bug » ; la
fenêtre porte deux modes depuis toujours — un bug, ou un commentaire. Un collègue sans bug à
déclarer n'avait aucune raison de l'ouvrir. Il dit maintenant « **Signaler un bug ou donner ton
avis** », dans l'en-tête comme dans le menu.
▣ **Et l'invitation reste visible.** La fenêtre des « Nouveautés » porte un bouton « Donner ton
avis ». Elle est là parce que le bandeau de version, lui, **disparaît** : une invitation qu'on ne
voit qu'une fois, au moment précis où tu veux lire autre chose, se referme avant d'avoir servi.
▣ **Au passage, une phrase de l'Aide qui n'avait jamais été livrée** : en PAN – Standards, la note
« **vise** » le niveau atteint pour des cibles d'apprentissage — elle n'y « repose » plus — et l'Aide
dit désormais par quoi Labo Codex lit ce niveau aujourd'hui : les traces retenues au portfolio.
**Vérifié comment** : 12 mutations volontaires, 12 rouges, arbre restauré par empreinte sha256 — dont
une qui a révélé qu'un de mes propres essais passait QUOI QU'IL ARRIVE (il surveillait un bandeau
sous un identifiant qui n'existe nulle part). La fenêtre des nouveautés et son nouveau bouton ouverts
et cliqués au banc ; l'étiquette de grille tient sur une ligne. Suite complète : 5 714 essais verts
(520 fichiers).
⛔ **Ce qui n'est PAS vérifié** : ni Safari, ni l'iPad. Et l'éditeur de grille n'a pas été ouvert en
situation — son étiquette a été mesurée avec la vraie feuille de style, pas dans le vrai écran.

↻ **1.127.2 — LE TEXTE D'ACCUEIL DE L'AIDE DIT VRAI SUR TES DONNÉES** (build `0909-1912`).
**Ce que tu verras** : dans Aide › « Qu'est-ce que Labo Codex ? », la carte de présentation ne promet
plus deux choses que l'application ne tient pas. Elle disait « **son code est ouvert** » — le dépôt est
privé depuis le 23 juin — et « tes données restent **en sécurité** chez toi » — il n'y a aucun
chiffrement au repos ; elles restent *chez toi*, ce qui est vrai, mais rien ne les *protège* sur
l'appareil. Un collègue qui vérifiait tombait sur une affirmation fausse.
▣ **Un paragraphe neuf répond à la question qu'on te posera** : « Où vont tes données ? Nulle part. »
Le navigateur, ton appareil, aucun serveur ; le transport d'un appareil à l'autre par un fichier que tu
déplaces toi-même, sans nuage. Et ce que tu partages avec un collègue — grille, échelle, cartouche,
pratique — est **signé** et porte une **licence Creative Commons** : l'application refuse d'importer un
fichier non signé ou modifié en chemin.
▣ **La passerelle vers une IA est écrite, au lieu d'être seulement niée.** Il n'y a toujours aucune IA
dans l'application, et aucune décision n'est prise à ta place. Mais les boutons « Copier le prompt pour
IA » et le modèle de cartouche vide existent : le texte dit maintenant que ce qui sort d'ici est un
**gabarit**, jamais les données de tes élèves. Quelqu'un qui trouve ces boutons ne croira pas que le
texte lui a menti.
▣ **Ce qui n'a pas bougé** : les trois blocs « À quoi sert ce labo ? », « Qu'est-ce que ça change ? » et
« Qu'est-ce que ça demande ? », mot pour mot. Aucun calcul, aucune donnée, aucun réglage.
⛔ **Rien n'annonce que le code sera rouvert**, même si c'est ton intention : une promesse dans un texte
d'aide devient une dette. La phrase reviendra quand l'historique du dépôt aura été purgé.
**Vérifié comment** : les deux formules fautives ne sont plus dans `index.html` (recherche à zéro, avec
son témoin) ; le bloc **lu à l'écran**, carte dépliée, sur un banc jetable — accents, espaces
insécables et tirets tiennent. C'est un texte : la preuve est la lecture, et elle a été faite.
Suite complète : 5 703 essais verts (518 fichiers).

↻ **1.127.1 — LE TABLEAU DU COMPARATEUR SE LIT D'UN COUP D'ŒIL** (build `0909-1745`).
**Ce que tu verras** : dans Labo › Comparateur, les **titres de section**, les **six paramètres** et
les **lignes** ont enfin trois traitements distincts. Ce midi, le tableau est passé de deux en-têtes à
huit — et comme les trois classes du tableau n'étaient déclarées dans **aucune** feuille de style, rien
ne les séparait des lignes qu'elles coiffent. Le regroupement était l'apport du lot, il se lisait mal.
Corrigé : la section porte un fond et un filet, chaque paramètre est un intertitre sarcelle, et les
lignes sont en retrait sous le leur.
▣ **Corrigé à l'écran, pas sur plan.** La première version donnait un fond aux deux niveaux : en mode
**sombre**, la hiérarchie s'inversait — les six bandes de paramètres écrasaient le titre de section.
Mesuré, puis repris : six bandes pleine largeur alourdissaient de toute façon un tableau déjà dense.
Les contrastes des deux modes sont mesurés et tiennent (6,9:1 au plus serré, le seuil est 4,5:1).
▣ **Une case de règle sommative porte enfin le même nom partout.** L'assistant te faisait cocher
« **Verrou sur une évaluation** » et son récapitulatif répondait « **Verrou d'évaluation** » : une
seule case, deux mots. Les quatre libellés de règles étaient écrits dans **trois** tables ; ils
viennent maintenant d'un seul endroit, et c'est le mot de l'écran de saisie qui l'emporte.
▣ **Rien d'autre n'a bougé** : aucun calcul, aucune valeur par défaut, aucune donnée. Les `value`
persistées dans tes pratiques déjà créées sont intactes — seul l'affichage passe par la source unique.
**Vérifié comment** : le tableau ouvert et lu **dans les deux modes** sur un banc WebKit jetable (pack
de démonstration, profil éphémère), contrastes calculés ; **8 mutations volontaires, 8 rouges**, arbre
restauré par empreinte sha256 — dont **trois qui ont d'abord viré au VERT** et ont montré que mes
propres gardes ne mesuraient rien : vérifier qu'un nom de fonction *apparaît* alors que son corps est
vidé, exiger une règle CSS sans exiger le retrait qu'elle porte, et un sélecteur non ancré que sa
propre surcharge « mode clair » suffisait à satisfaire. Les trois resserrées, puis rouges.
Suite complète : 5 703 essais verts (518 fichiers).
⛔ **Ce qui n'est PAS vérifié** : ni Safari, ni l'iPad. Le rendu vient de WebKit en simulation, et
c'est précisément un lot d'affichage. La porte terrain (#802) couvre maintenant cinq livraisons.

▣ **LE VERT DE LA CI REDEVIENT UN SIGNAL** (9 sept., fin de journée — aucun changement pour toi).
La CI GitHub était **rouge sur `main` depuis 24 h** (dernier vert : hier 17 h 20), sur 4 essais. Un rouge
permanent ne signale plus rien : une vraie régression s'y noierait. Mesuré, et **ce n'était pas ton
application** — c'étaient les essais eux-mêmes.
▣ **Trois essais du toucher sur iPad accusaient un code sain.** `page.touchscreen.tap()` sous WebKit
sans écran émet `pointerdown`, `touchstart`, `touchend` — **et aucun `click`**. Or c'est un `click` que
l'application écoute. La sélection n'était donc jamais demandée : les essais mesuraient le harnais, pas
la tolérance de 44 px, qui **fonctionne** (vérifiée en la cassant : l'essai rougit).
▣ **Et deux essais de la même famille passaient QUOI QU'IL ARRIVE.** « Trop loin, le toucher ne saisit
personne » et « une barre voisine ne vole pas le toucher » attendent que rien ne soit sélectionné — or
rien ne l'était jamais. **Break-testés : la tolérance tactile entièrement retirée, ils restaient verts.**
Ils n'attestaient rien depuis le début. C'est le genre de vert qui coûte plus cher qu'un rouge.
▣ **Le quatrième courait après lui-même.** La poignée de la palette de codes est ramenée au coin visible
par un écouteur `scroll`, qui s'exécute au frame suivant ; l'essai mesurait avant. **4 vertes sur 5 en
local** avant correction, **6 sur 6** après — il attend maintenant la condition, pas un délai. Là non
plus le code n'était en cause : un frame de retard est invisible au doigt.
**Vérifié comment** : les 6 essais du toucher passent, et **4 mutations volontaires du code applicatif
les font rougir** (tolérance retirée, garde « pointeur grossier » sautée, barre voisine autorisée à voler
le toucher, poignée non repositionnée) — chaque fichier restauré et vérifié par empreinte sha256. La
baseline des rougeurs connues **rétrécit de 3 à 0**, comme elle le doit.
⛔ **Ce qui n'est PAS vérifié** : que le toucher marche sur TON iPad. Ces essais tournent sur un WebKit
sans écran ; ils disent que le code fait ce qu'on lui demande, pas que le doigt trouve la bulle. C'est
la porte terrain (#802) qui le dira.

↻ **1.127.0 — LE COMPARATEUR PARLE EN SIX PARAMÈTRES** (build `0909-1640`).
**Ce que tu verras** : dans Labo › Comparateur, le tableau n'aligne plus une suite de lignes à plat.
Il est **rangé sous les six paramètres** que l'Aide présente depuis ce midi — objet, révisabilité,
agentivité, communication, granularité, détermination. Les lignes n'ont pas changé de sens, aucun
chiffre ne bouge : elles sont **regroupées**, pour qu'on voie sur quelle dimension deux pratiques
diffèrent vraiment.
▣ **Ce que l'application ne couvre pas est écrit noir sur blanc.** L'**agentivité** — les choix et la
flexibilité laissés à l'étudiant·e — n'a aucun réglage dans Labo Codex, et le tableau l'affiche au
lieu de laisser un blanc. Idem pour les **niveaux de la note du cours**, et pour l'**alignement de la
note sur des cibles d'apprentissage** là où elle porte sur des instruments. Motif : un silence se
lirait comme une lacune de TA pratique, alors que c'est une limite de l'outil.
▣ **Deux lignes neuves, et rien à configurer.** «&nbsp;Ce à quoi la note se rapporte&nbsp;» dit si elle
porte sur des cibles ou sur des instruments — dérivé de la famille, aucun champ ajouté.
«&nbsp;Temporalité de la note&nbsp;» rappelle que la note différée est un **réglage global**, dans
Réglages › Préférences : elle n'est pas un attribut de la pratique comparée, et le tableau ne fait pas
semblant du contraire. Le réglage n'a pas bougé de place.
▣ **Les règles spéciales d'une pratique sommative ne sont plus entassées sur une ligne** : le
remplacement automatique sous la révisabilité, le verrou et le plafonnement sous la détermination, le
portfolio sous l'objet. C'était le seul cas qui ne se rangeait pas sous un seul paramètre — tranché en
éclatant, parce que garder la ligne unique aurait rangé trois règles sur quatre au mauvais endroit.
▣ **Rien d'autre n'a bougé** : ni le moteur de calcul, ni l'assistant de configuration, ni une seule
valeur par défaut, ni tes données. Les six paramètres **décrivent** une pratique, ils ne la règlent pas.
**Vérifié comment** : **14 mutations volontaires du code, 14 rouges**, chaque fichier restauré et
vérifié par empreinte sha256 — dont deux qui ont d'abord viré au VERT et ont révélé de vrais trous
dans mes propres tests (le repli « Autres » recréait les six groupes dans le bon ordre et masquait la
perte de l'ossature ; une clé `undefined` passait pour un groupe valide). Les deux gardes ont été
resserrées, puis rougissent. Le tableau a été **ouvert et lu à l'écran** sur un banc WebKit jetable
(pack de démonstration, profil éphémère — aucune de tes données touchée) : six en-têtes, 14 lignes,
zéro erreur console. Suite complète : 5 683 essais verts.
⛔ **Ce qui n'est PAS vérifié, et un défaut que ce lot rend plus visible** : les en-têtes du tableau
**ne se distinguent pas** de ses lignes — les trois classes CSS du tableau du Comparateur ne sont
définies nulle part (défaut préexistant, mesuré). Le tableau portait deux en-têtes indistincts, il en
porte huit. Le regroupement se lit donc moins bien qu'il ne le devrait. **Hors du périmètre que tu as
fixé** («&nbsp;rien d'autre&nbsp;») : non corrigé, inscrit (#808). Et rien n'a été vu sur Safari ni sur
l'iPad.

↻ **1.127.0 (même livraison) — TA GRILLE DE DÉPISTAGE RESTE CHOISIE, ET LA FICHE PRODUCTION S'ALIGNE**
(#806 et #807, tes deux rapports de cet après-midi).
**Ce que tu verras** : dans Labo › Outils d'observation, la **grille de critères pour le dépistage**
ne se vide plus toute seule. Et la fiche d'une production n'a plus son grand trou blanc au milieu.
▣ **Deux chemins l'effaçaient, et aucun n'était un geste de ta part.** Le premier : l'écran des forces
et défis — du code d'AFFICHAGE — effaçait le réglage chaque fois qu'il ouvrait un profil avant que la
base soit hydratée, sous le nom rassurant d'« auto-nettoyage silencieux ». Sa prémisse était fausse
(« absente de la liste DONC supprimée ») : `db.getSync` rend une liste vide aussi quand IndexedDB
n'est pas prête, et **ton localStorage est saturé** (5 119 Ko au rapport), donc tes grilles vivent en
IDB. Le second : le panneau des réglages réécrit TOUT à chaque changement d'une case, et lisait le
sélecteur avec un repli `|| ''` — un menu pas encore rempli rend une valeur vide, indiscernable d'un
retrait volontaire.
▣ **Le chemin affiché était faux, en trois exemplaires.** « Conception › Pratiques de notation », où
le réglage n'est plus. C'est la duplication qui lui a permis de survivre à la migration : les trois
sites lisent maintenant la même source, celle de #550, qui porte le bon chemin.
▣ **La fiche production** : la description du type était alignée sur le BAS de la colonne voisine, ce
qui suppose deux colonnes de hauteur comparable — pour un **artefact**, la pondération disparaît et la
description tombait sous un grand vide. Elle prend toute la largeur ; la case « Travail diagnostique »
reste avec la pondération (#790 : c'est là que le poids d'un travail se décide) ; le bouton PDF et les
trois choix à droite, libellés alignés au lieu de démarrer à trois hauteurs. Et le bouton
d'enregistrement des Outils d'observation remonte auprès du titre.
⛔ **TARIR N'EST PAS RÉPARER — et il reste un geste pour toi.** La source est tarie, **le stock ne
l'est pas** : la préférence déjà effacée dans tes données le reste. **Désigne ta grille une fois après
cette mise à jour** ; c'est ce passage-là qui prouvera le correctif, pas les tests.
**Vérifié comment** : **10 mutations volontaires, 10 rouges** sur les deux sentinelles neuves (#806
neuf cas, #807 cinq), chaque fichier restauré et vérifié par empreinte sha256 — y compris les
contreparties : rendre la garde de sauvegarde *totale* fait rougir le cas « retrait volontaire », et
retirer la seule règle CSS fait rougir l'alignement des sélecteurs. Rendu **mesuré dans Chrome** sur
serveur local : 0,0 px d'écart sur les libellés ET les sélecteurs, aux deux types de production
(artefact pondération masquée, examen visible) et à quatre largeurs de panneau, sans chevauchement ;
contraste du bouton 8,03:1 dans les deux modes. Suite complète mesurée en worktree isolé — une autre
session travaillait dans le même arbre.
⛔ **Ce qui n'est PAS vérifié** : Safari et l'iPad (le CSS garantit la cible de 44 px, personne ne l'a
vue) ; et la persistance dans la durée, qui demande ton usage réel — c'est un défaut de course, il ne
se produisait pas à chaque fois.

↻ **1.126.1 — LE GLOSSAIRE DIT LA MÊME CHOSE QUE LE RESTE DE L'AIDE** (build `0909-1512`).
**Ce que tu verras** : dans Consultation › Référence rapide, l'entrée **« PAN »** ne définit plus une
pratique alternative de notation par « sélectionner automatiquement les N meilleurs artefacts ». Elle
reprend les mots de la carte d'Introduction — droit à l'erreur, traces récentes ou représentatives —
et nomme les trois familles. **« Performance »** et **« Portfolio »** suivent&nbsp;: « les N meilleurs »
y est présenté comme **une** méthode de sélection parmi celles que tu peux choisir, pas comme la règle.
Et sur la carte de l'indice P, l'exemple ne dit plus « en PAN – Standards, P = moyenne des N meilleurs
artefacts (IDME) » — ni la méthode ni l'échelle ne sont des attributs de la famille.
▣ **Pourquoi maintenant** : c'était la contradiction laissée ouverte par 1.126.0 ce midi. L'Aide disait
deux choses différentes selon l'onglet où tu étais.
**Vérifié comment** : les quatre entrées relues à l'écran dans ton Chrome, app servie en local&nbsp;; la
recherche de l'Aide retrouve « dénotation » dans quatre cartes et « méthode de sélection » dans trois.
**Mesuré au passage** : le second glossaire (« 48 termes du parcours ») était déjà juste — il dit
« regroupe les pratiques STD, SPE et DEN ». Rien à y changer. Structure HTML identique avant/après.
⛔ **Ce qui n'est PAS vérifié** : ni Safari ni l'iPad. Toujours dû avec la porte terrain (#802).

↻ **1.126.0 — L'AIDE NE PRÉSENTE PLUS TA PRATIQUE COMME LA DÉFINITION** (build `0909-1452`).
**Ce que tu verras** : dans l'Aide, la carte sur les pratiques alternatives de notation s'appelle
désormais **« Les pratiques alternatives de notation (PAN) »**, au pluriel. Elle ne dit plus qu'une PAN
« sélectionne les N meilleurs artefacts » — c'était **ta** façon de faire, pas la définition. Elle dit ce
que les PAN ont en commun, présente les **quatre familles côte à côte** (dont la **dénotation**, qui
n'est plus annoncée comme « à venir »), et ajoute **six questions** pour situer une pratique : objet,
révisabilité, agentivité, communication, granularité, détermination.
▣ **La carte « Choisir ta pratique de notation » ne te recommande plus de chiffres.** « 8-14 artefacts
recommandés (standard : 12) » et « 3-4 jetons maximum » ont disparu : c'étaient les réglages d'une
classe en particulier, pas des normes. Les quatre familles y ont maintenant **le même gabarit** — un
principe, puis ce qu'il y a à régler — et un encadré dit ce que la recherche observe des reprises
sans imposer de nombre.
▣ **Les mots sont ceux de l'assistant.** « PAN – Standards », « PAN – Spécifications »,
« PAN – Dénotation » : l'Aide et l'assistant de configuration disent maintenant la même chose.
▣ **Réglages › À propos cite le rapport d'où viennent ces six questions** : « Laissons-les se
tromper » (Cormier, Voisard, Turcotte et Arseneault-Hubert, Cégep André-Laurendeau, 2026), avec le lien
vers le rapport complet. La phrase d'introduction ne parle plus de « deux blogues ».
▣ **Rien d'autre n'a bougé** : aucun calcul, aucune valeur par défaut, aucun réglage. Trois blocs de
texte, et c'est tout.
**Vérifié comment** : les trois blocs ouverts **dans ton Chrome**, sur l'application servie en local —
les deux cartes d'Aide s'ouvrent et se ferment au clic, et la recherche de l'Aide les retrouve sur
« six paramètres », « révisabilité », « agentivité » et « dénotation » (zéro erreur console). Le
tableau de l'À propos compte bien trois lignes, la troisième avec son lien. **Le risque de troncature
a été mesuré, pas supposé** : les cartes d'accordéon sont coupées à 2 000 px, et le texte neuf en fait
**1 087** au plus étroit (iPad portrait, 768 px) contre 497 avant — sous le plafond, sans débordement
horizontal. Structure HTML comparée avant/après : identique. Suite complète : 5 644 essais verts.
⛔ **Ce qui n'est PAS vérifié** : rien n'a été vu sur **Safari ni sur l'iPad réel** — la mesure iPad
vient de WebKit en simulation, pas de ta tablette. Et le **glossaire de l'Aide** (Consultation ›
Référence rapide) définit toujours « PAN » par « sélectionner automatiquement les N meilleurs
artefacts » : c'est la même confusion, dans un quatrième bloc qui n'était pas au périmètre. Non
corrigé, inscrit.

↻ **1.125.2 — CINQ CHOSES QUE TU AS SIGNALÉES CE MATIN** (build `0909-1356`).
**Ce que tu verras** : le menu « Actions » de la liste des évaluations a la **même largeur** d'une
ligne à l'autre ; dans la palette des codes, un libellé trop long **revient à la ligne** au lieu de
sortir du cadre ; le bandeau de nouvelle version t'envoie à la **carte « Nouveautés » de l'accueil**,
là où les nouveautés sont vraiment ; et dans « Annoter et évaluer », le bouton du mode **dit le mode
où tu es**, quel que soit le chemin par lequel tu es arrivé.
▣ **Le 404 après le chargement d'un codex : ton application n'y était pour rien.** Mesuré — le
déploiement en ligne était publié et sain depuis plus d'une heure quand c'est arrivé, et le site
répondait normalement juste après. C'était une panne passagère du service qui sert la page. **Tes
données étaient écrites avant le rechargement**, et elles l'étaient encore après.
▣ **Ce qui change quand même** : recharger la page était le seul moment où l'application se remettait
à la merci du réseau, juste après avoir écrit. Elle **vérifie maintenant que le serveur répond avant
de recharger**. S'il ne répond pas, elle reste ouverte et te dit que tes données sont enregistrées,
au lieu de disparaître derrière un message d'erreur en anglais.
⛔ **Ce qui n'est PAS vérifié** : rien de tout ceci n'a été vu sur Safari ni sur l'iPad, et la
vérification du serveur n'a pas été éprouvée sur un vrai codex — seulement au banc. La liste de
vérifications est due (#802).
▣ **Comment ça a été vérifié** : cinq sentinelles neuves (23 essais), **onze ablations rejouées, onze
rouges** ; deux mesures faites dans ton Chrome, sur un banc servi en local — le menu « Actions » à
150 px sur quatre listes d'options différentes, et la palette sans aucun débordement
(`scrollWidth = clientWidth = 255`). Suite complète : 5644 essais verts.

↻ **1.125.1 — LA GRILLE QUE TU IMPORTES SE MONTRE** (build `0909-0832`).
**Ce que tu verras** : après « Importer des grilles (JSON) », la grille importée est **amenée à
l'écran** et mise en évidence deux secondes, pour que tu voies laquelle vient d'arriver.
▣ **Ce qui se passait, et ce n'était pas ce que tu croyais.** Ton rapport du 8 septembre disait « la
bibliothèque n'est pas rafraîchie ». Elle l'était — à chaque fois. La grille était bien écrite, la
liste bien reconstruite. Mais la nouvelle venue s'ajoutait **tout en bas**, et la fenêtre repartait du
haut : sur ta bibliothèque, ça la plaçait à plus de huit mille pixels sous le bas de l'écran. Rien ne
bougeait sous tes yeux, ce qui ne se distingue pas d'une panne.
▣ **Et quand un filtre la cache, l'application le dit.** Deux cas mesurés au passage : la case
« Masquer les éléments déjà dans la barre latérale » cochée sur un réimport, et le matériel de
démonstration en mode normal. Dans les deux, tu lisais « 1 grille ajoutée » devant une liste
rigoureusement identique. Le message dit maintenant qu'un filtre les masque, et lequel décocher.
⛔ **Ce que ça ne fait PAS** : les **quatre autres bibliothèques** — cartouches, échelles, pratiques,
productions — ont exactement le même défaut, et il n'est pas corrigé. Tu n'avais signalé que les
grilles, et le périmètre ne s'élargit plus tout seul. C'est inscrit (#793).
**Vérifié comment** : 5 620 essais verts, plus deux gardiens neufs — l'un mesure que la carte est
réellement dans le cadre visible sur une liste de 61 grilles, l'autre que le message apparaît quand un
filtre avale le résultat. **Trois mutations du code faites exprès** pour les faire échouer : chacune
rouge, et chaque fichier restauré à l'octet près (empreinte vérifiée). La deuxième mutation **rejoue
le chiffre** : 8 548 pixels sous le bas de l'écran, deux fois de suite.
**Ce qui n'est PAS vérifié** : rien n'a été vu dans ton Chrome ni sur l'iPad — la mesure vient de
WebKit en ligne de commande. (#543, #793)

↻ **1.125.0 — UN TRAVAIL QUI REPÈRE SANS COMPTER** (build `0908-1502`). Ce que tu voulais depuis le
7 septembre : ton portrait de lecteur cesse de peser, sans cesser d'exister.
**Ce que tu verras** : sur la fiche d'un travail, sous la pondération, une case **« Travail
diagnostique — ne compte dans aucun calcul »**. Coche-la, et ce travail ne pèse plus ni sur la note,
ni sur la performance, ni sur la complétion, ni sur le palier RàI — mais il reste **entier** dans le
dossier de chaque élève : sa copie, ton annotation, ta rétroaction, son résultat. Tu peux la cocher
sur un travail que tu as déjà corrigé, c'est même le cas prévu.
▣ **Et le piège de la première semaine est fermé.** Un seul travail dû et une seule copie corrigée
suffisaient à déclarer « non-participation » — donc niveau intensif — les élèves qui n'avaient pas
encore leur horaire. Un travail diagnostique ne déclenche plus ce verdict.
▣ **Il peut lever un signalement, dans TES mots.** Sur chaque palier de ta grille de projection, une
case « ce palier lève un signalement » ; et dans les paramètres du critère, un champ où tu écris la
phrase que tu veux lire. Elle apparaît **à côté** du palier RàI de l'élève — jamais dedans — et dans
la vue de ton groupe, avec le nombre d'élèves concernés, pour voir l'ampleur avant de contacter qui
que ce soit. Rien n'est écrit sur la copie de l'élève.
⚠ **Rien n'est coché dans tes grilles, et c'est voulu** : aucune ne s'est mise à signaler toute
seule. Tant que tu n'as pas coché un palier ET écrit une phrase, il ne se passe rien.
▣ **Le champ « CAF » de la fiche s'appelle maintenant « Mesure d'aide »** — ta décision du jour : ce
pourrait être une autre matière qui est diagnostiquée, et rien dans l'application ne suppose plus une
discipline. Tes fichiers d'élèves restent lisibles, l'ancienne colonne est toujours reconnue.
**Vérifié comment** : 511 fichiers d'essais, 5 620 verts. Trois gardiens neufs, 45 cas, dont un
témoin à l'envers pour chaque exclusion — décoché, le même travail compte partout, sinon un filtre
trop large laisserait tout au vert. Puis **treize mutations du code faites exprès** pour les faire
échouer : treize rouges, et le fichier restauré à l'octet près chaque fois.
⚠ **Deux gardiens ont été REFAITS parce qu'ils ne pouvaient pas échouer** — un garde-fou en double
dont aucun des deux n'était mesurable, et un cas de comptage qui restait vert quoi qu'on casse. Sans
les mutations, les deux auraient été livrés comme du travail fini.
**Ce qui n'est PAS vérifié** : rien n'a été vu dans Safari ni sur l'iPad — trois éléments visuels
sont neufs. Porte terrain : `plans de travail/PORTES-TERRAIN-2026-09-08-travail-diagnostique.md`.
(#790)

↻ **1.124.4 — VERROUILLER UNE SÉANCE NE PEUT PLUS EFFACER SES PRÉSENCES** (build `0908-1324`).
**Ce que tu verras** : cocher « Verrouillée » sur une date dont la séance n'est pas affichée à l'écran
n'efface plus les présences que tu avais saisies pour cette date. Avant, le verrouillage enregistrait au
passage ce que l'écran montrait ; quand la séance n'était pas ouverte, l'écran ne montrait rien, et les
présences de cette date disparaissaient **sans un message** — le cadenas se posant sur une séance vide.
Seules les présences réellement affichées sont désormais remplacées.
⛔ **Ce que ça ne fait PAS** : ramener une séance déjà perdue. La correction ferme la porte, elle ne
répare rien de ce qui est déjà écrit chez toi — et rien n'a été touché dans tes données.
▣ **Et ta question du 7 sur l'enregistrement instable a sa réponse, mais ce n'était pas ce défaut-ci.**
Tu ouvrais l'application à deux adresses depuis l'automne : ton fichier local et le site web. Pour le
navigateur, ce sont deux coffres étanches qui portent le même nom à l'écran — tu saisissais dans l'un et
tu cherchais dans l'autre. Ta décision est prise : **le site web porte tes données réelles, le fichier
local ne porte plus de trimestre.** Les présences saisies en local cet automne existent toujours dans
leur coffre ; rien n'y a été touché, et ce que tu veux en faire t'appartient. (#542, #785)
⚠ **Une conséquence pratique de ta décision, à connaître** : quand une session te demande de vérifier
quelque chose à l'écran, il faut désormais que le travail soit **publié en ligne** — le déposer sur ton
disque ne suffit plus. C'est trente à soixante secondes après l'envoi.
**Vérifié comment** : 508 fichiers d'essais, 5 573 verts. L'essai qui affirmait la destruction a été
**retourné** en gardien : ses deux constats disent maintenant que la séance survit, et les trois autres
cas — dont le témoin, séance affichée — n'ont pas bougé, ce qui prouve que le remède n'a rien changé au
cas normal. Un sixième cas a été ajouté exprès contre le remède lui-même : un tableau affiché doit
toujours écraser l'ancienne valeur, sinon « ne rien effacer » deviendrait « ne rien enregistrer » sans
qu'aucun essai ne rougisse. Puis le code a été remis dans son état fautif : les deux constats ont rougi,
le témoin est resté vert, et le fichier a été restauré à l'octet près.
**Ce qui n'est PAS vérifié** : rien n'a été vu dans Safari ni sur l'iPad. Et trois essais du toucher des
bulles (Suivi › Groupe) sont rouges ici comme sur le serveur — **mesuré : ils l'étaient déjà avant ce
lot**, ils ne viennent pas de lui. La question qu'ils posent reste la tienne : les bulles répondent-elles
au doigt sur ton iPad ? (#789)

↻ **1.124.3 — SIX PETITES CHOSES RÉPARÉES PENDANT L'ATTENTE** (build `0907-1325`). Pendant que la question
des présences instables attend ta réponse, six items sans arbitrage ont été pris d'affilée.
**Ce que tu verras** : dans Évaluations › Liste, la colonne « Note % » n'affiche plus « 92.52136752136752% »
mais « 92.5% » — la même règle que la note d'origine d'une reprise, juste à côté ; ton calcul et tes notes
enregistrées ne changent pas, c'est l'affichage qui montrait le nombre entier de la machine. Et le badge
« SA » du résumé de groupe a de nouveau un fond : il appelait deux couleurs qui n'avaient **jamais** été
définies, donc le navigateur les ignorait. ⚠ **Une décision à revoir si elle te déplaît** : ce badge était
censé être orange, et aucune teinte orange du projet ne se lit correctement dans les deux modes. Il est
maintenant gris-surface avec une bordure. Si tu veux qu'il se distingue par la couleur, dis-le.
**Ce que tu ne verras pas, et qui compte quand même** : un fichier du code était illisible pour les outils de
recherche — dix minutes perdues hier à croire qu'un bout d'export n'existait pas ; il est redevenu du texte,
et la vérification posée pour l'empêcher de revenir en a trouvé **un second, du même genre**, dans un script de
réparation : corrigé aussi, sans rien changer à ce qu'il fait. Le garde-fou qui tourne avant chaque
envoi ne posait pas la même question que celui du serveur : il pouvait dire « rien à vérifier » là où le
serveur, lui, vérifiait. Il lit maintenant la liste du serveur. ⚠ **Conséquence assumée** : il te demandera
le verdict du navigateur un peu plus souvent qu'avant — exactement dans les cas où le serveur le rend déjà.
▣ **Deux mesures ont retourné leur fiche.** Une tâche notée « le seul cas franc, à faire tout de suite » était
**déjà faite** — trois lignes de vérification l'ont levée. Et en réparant un champ de date dont une classe
d'affichage se perdait, on a trouvé **vingt-deux autres cas identiques** dans la page. Ils ne sont **pas**
corrigés : ça changerait vingt-deux affichages d'un coup, et ça se juge à l'écran, avec toi. La liste est
gelée : elle ne peut plus grossir sans faire échouer les essais. (#753, #755, #756, #776, #778, #779, #787)
**Vérifié comment** : 506 fichiers d'essais, 5 561 verts (25 de plus qu'au départ) ; dix mutations du code
faites exprès pour faire rougir les essais neufs, vingt rougeurs obtenues, et le vert retrouvé après. Le contraste du
badge est **calculé** dans l'essai depuis la feuille de style, pas recopié à la main. Le garde-fou d'envoi est
**exécuté** dans l'essai et confronté à la règle du serveur sur vingt chemins. **Ce qui n'est PAS vérifié** :
rien n'a été vu dans Safari ni sur l'iPad — le navigateur reste hors de portée ici.

↻ **1.124.2 — LE REPORT VERS LÉA EST RETIRÉ** (build `0907-1011`). Grégoire l'a abandonné le jour même de
sa livraison : « Ce que tu as créé ne fait que trier l'information en la préparant pour Léa. Il s'agit d'un
transfert manuel des informations. Si on ne peut pas faire un copier/coller, il n'y a pas vraiment d'intérêt,
car aucun gain de temps. » L'application revient à son comportement d'avant : le panneau, son bouton et tout
son code sont partis, sans rien laisser en sommeil.
▣ **Ce que le travail a appris, et c'est la vraie leçon de la journée.** Le module faisait exactement ce qui
avait été demandé, et il ne servait à rien. Trois questions avaient été posées avant d'écrire une ligne de
code, et elles avaient écarté deux fausses pistes. Aucune n'a demandé : une fois le tri fait, combien de temps
reste-t-il vraiment à gagner ? L'outil agissait sur la lecture et le calcul ; le coût était dans la saisie.
**Ce n'est pas une erreur d'exécution, c'est une question qui manquait au cadrage.**
**Ce qui reste de la journée** : la barre de boutons de la saisie n'a plus qu'une seule définition, et ne peut
plus effacer ce qu'on lui ajoute. Et une question de Grégoire est tranchée : c'est l'enseignant qui juge si un
rattrapage reprend une absence — rien à automatiser là.
⚠ **Ce qui devient prioritaire** : il signale que l'enregistrement des présences est instable, qu'il a dû
saisir et enregistrer plusieurs fois. Ce n'est pas reproduit, et trois mesures pointent vers une écriture qui
n'attend pas d'être confirmée avant un rechargement. Trois questions lui sont posées avant de toucher au code.

↻ **1.124.1 EN LIGNE** (build `0907-0938`, commit `a64164cc`). **Déploiement VÉRIFIÉ par l'API Netlify** :
`6a9ebeee3b7291000831720a`, production, `ready`, publié à 13 h 41 UTC sur ce commit exact, en 8 s, sans erreur.
**Ce qui change** : le bouton « Reporter dans Léa », livré le matin même, **n'apparaissait nulle part**. Grégoire
l'a constaté sur son Mac et sur son iPad. La barre de boutons de la saisie des présences existait en deux
exemplaires — un dans la page, un second reconstruit par le programme — et le second effaçait le premier dès
qu'une séance s'affichait. Le bouton neuf, ajouté au premier seulement, disparaissait avant d'avoir pu servir.
Il n'y a plus qu'une seule barre. **Vérifié comment** : quatre mutations du code font rougir l'essai qui la
garde, et le bouton a été retrouvé dans un vrai navigateur en passant cette fois par l'affichage réel d'une
séance. Vitest 502 fichiers / 5 553 verts. **Ce qui n'est PAS vérifié** : Safari et l'iPad — la liste de
vérifications reprend à sa rangée 2.1a.
▣ **Ce que le travail a appris, et qui vaut d'être dit deux fois.** L'essai censé garder cette barre nommait
trois boutons : il est resté vert pendant que le quatrième disparaissait. Il gardait des exemples, pas la règle.
Et l'essai qui l'a remplacé était, au premier jet, **incapable d'échouer** — il sautait sa propre vérification en
silence. C'est en essayant de le casser qu'on l'a vu. Deux essais menteurs dans la même journée, tous deux
attrapés par le même geste : essayer de les faire rougir.

↻ **1.124.0 FUSIONNÉE DANS `main` ET POUSSÉE** (build `0907-0834`, commit `736928bb`), sur l'autorisation de
Grégoire. **Déploiement VÉRIFIÉ par l'API Netlify** : `6a9eb302a9b96b0008b2c867`, contexte production, état `ready`,
publié à 12 h 50 UTC sur ce commit exact, en 12 s, sans erreur, alias `app.codexnumeris.org`.
⚠ **La page servie n'a pas été lue** : le proxy de ce conteneur refuse le domaine de l'application, et refuse aussi le
CDN des captures de déploiement — les deux voies sont fermées. **Le geste qui tranche reste le numéro en bas de page.**
**Ce qui change pour quelqu'un qui reporte ses absences dans le portail du cégep** : après avoir saisi une séance,
un bouton « Reporter dans Léa » ouvre un panneau qui dit qui reporter, et combien. Jusqu'ici, il fallait relire les
vingt-huit lignes de Codex, faire la soustraction de tête pour chacune, puis retrouver les bonnes lignes dans une
seconde liste de vingt-huit noms, dans une autre fenêtre. Le panneau ne montre que les trois ou quatre élèves
concernés, avec leur numéro d'étudiant en premier — c'est ce numéro qui sert de repère dans le portail, et un
nombre à sept chiffres ne se confond pas dans une colonne de noms. Il montre aussi son calcul : les périodes de la
séance, celles de présence saisies, et l'absence qui en découle. On peut donc le contredire d'un coup d'œil.
**Deux choses qu'il refuse de faire, et c'est délibéré.** Il n'écrit jamais dans le portail : la saisie et la
sauvegarde restent le geste de l'enseignant. Et il ne propose jamais comme absent un élève qui n'a aucune saisie ce
jour-là — celui-là part dans une liste à part, parce que l'application ne peut pas distinguer « il était absent » de
« la séance n'a pas été saisie jusqu'au bout », et qu'une absence inventée finirait dans un dossier officiel.
Un élève venu à un rattrapage porte une mention à côté de son nom, et son absence au cours reste entière : savoir si
un rattrapage l'annule est une règle de cégep, pas une décision de l'application.
**Vérifié comment** : seize essais neufs sur le calcul, dont ceux qui protègent les deux refus ci-dessus ; cinq
mutations du code les font rougir, et le témoin repasse au vert. Un nom d'élève hostile, chargé de code, ressort en
texte inerte dans un vrai navigateur. Les couleurs mesurées à l'écran dans les deux modes, clair et sombre. Vitest
502 fichiers / 5 551 verts. **Ce qui n'est PAS vérifié** : Safari, l'iPad, et l'ordre réel du portail sur son vrai
groupe — le conteneur n'a pas WebKit, et la liste de vérifications terrain est déposée.
▣ **Ce que le travail a appris** : ce que Grégoire demandait au départ — coller une colonne entière dans le portail —
était impossible, et c'est LUI qui l'a mesuré en trente secondes, pas la session. Trois questions posées avant
d'écrire une ligne de code ont écarté deux fausses pistes et fait tomber la vraie contrainte : le coût n'était pas
de taper les chiffres, il était de retrouver les bonnes lignes.

↻ **1.123.12 EN LIGNE** (build `0907-0733`, commit `3b309ab9`). **Déploiement VÉRIFIÉ par l'API Netlify** :
`6a9ea3804c71af0008bf7f6c`, contexte production, état `ready`, publié à 11 h 44 UTC sur ce commit exact, en 11 s,
sans erreur, alias `app.codexnumeris.org`. ⚠ **La page servie n'a pas été lue** (le proxy du conteneur refuse le
domaine) — le geste qui tranche reste le numéro en bas de page. **Ce qui change pour quelqu'un qui ouvre le Suivi d'un groupe en début
de trimestre** : la carte des performances ne dit plus que tout le monde est en difficulté quand la note du cours
n'existe pas encore. Une pratique par standards construit sa note à partir de plusieurs résultats : tant qu'elle n'en
a pas assez, il n'y a pas de note — et ce n'est pas la même chose qu'une note de zéro. L'application le savait
déjà, elle le disait même aux bulles de la barre, mais quatre écrans du Suivi lisaient ce « pas de note » comme un
zéro : la répartition rangeait les vingt-huit élèves dans « Incomplet ou insuffisant », la phrase en dessous
annonçait « vingt-huit étudiant·es en difficulté », et le modèle d'intervention les plaçait tous au palier le plus
intensif — pendant que la barre juste au-dessous, elle, lisait les copies et disait « progression stable » pour
vingt-quatre d'entre eux. Maintenant la carte ne répartit que les élèves dont la note existe, dit combien restent en
attente, et **le palier d'intervention se décide sur le dépistage seul** — les derniers artefacts, la même donnée que
la barre des patterns — tant que la note ne se construit pas. C'est la règle que Grégoire a arrêtée ce matin-là,
entre trois possibles.
**Vérifié comment** : cinq essais neufs, dont celui qui protège l'envers — une note qui vaut VRAIMENT zéro garde son
palier intensif. Quatre mutations du code, une par écran corrigé, les font rougir. Vitest 501 fichiers / 5 534 verts.
**Ce qui n'est PAS vérifié** : l'écran réel sur l'iPad de Grégoire — le conteneur n'a pas WebKit.
▣ **Ce que le travail a appris** : la première mesure demandée à Grégoire était mal posée. On lui a fait toucher une
bulle pour lire une infobulle que Safari tactile n'affiche jamais. Ce qu'il a vu — une bulle sans pourcentage — était
pourtant la preuve cherchée.

↻ **1.123.11 EN LIGNE** (build `0906-2039`, commit `d50ed45d`). **Déploiement VÉRIFIÉ par l'API Netlify** :
`6a9e0c6912ce270008829994`, contexte production, état `ready`, publié à 00 h 59 UTC sur ce commit exact, en 8 s, sans
erreur, alias `app.codexnumeris.org` ; 17 fichiers, 2 redirections et 9 règles d'en-tête déployés sans faute.
⚠ **La PAGE SERVIE n'a pas été lue** : le proxy sortant de ce conteneur refuse `app.codexnumeris.org` comme les URL
`netlify.app` (`connect_rejected`, horodaté sur la tentative). « En ligne » repose donc sur l'état Netlify, pas sur une
lecture — **le geste qui tranche reste le numéro en bas de page**.
⚠ **Repère de dates, pour lever une ambiguïté qui traîne** : le script de release horodate en heure de Toronto (d'où le
build `0906`, soit le 6 septembre à 20 h 39), la session compte en UTC (d'où « 7 septembre »). Les deux nomment le même
moment.
**Ce qui change pour quelqu'un qui lit le Suivi sur iPad** : les bulles blanches des barres de dégradés se saisissent au
doigt. Une bulle fait dix pixels et elle bouge sans arrêt : la toucher tenait de la chance, et le journal du rapport le
montre — cinq touchers de suite sur le fond de la barre, pas un seul sur une bulle. Deux choses l'empêchaient. La cible
était douze fois trop petite pour un doigt. Et comme elle réagissait au survol, le premier toucher servait de survol pour
rien : il fallait toucher deux fois. Maintenant, un toucher à côté saisit la bulle la plus proche, et c'est bien la plus
proche du doigt qui est prise, pas celle qui se trouve au-dessus des autres. **À la souris, rien ne change.**
**Vérifié comment** : dix-neuf essais sur l'arbitrage, et six essais sur le vrai écran avec un vrai doigt simulé, dont
celui qui vérifie l'envers — sans doigt, la souris garde son geste. Dix mutations du code les font rougir. Vitest 500
fichiers / 5 529 verts. **Ce qui n'est PAS vérifié** : tout cela est mesuré sous Chromium, qui n'a pas les doigts de
Grégoire ; le conteneur n'a pas WebKit. **Le geste réel sur l'iPad Air reste dû.**
▣ **Ce que le travail a appris, et qui vaut d'être dit** : un des six essais était MENTEUR — il passait même quand on
cassait ce qu'il prétendait garder. C'est en essayant de le faire rougir qu'on l'a vu.

↻ **1.123.10 EN LIGNE** (build `0906-2017`, commit `cf73a83d`), emportée par le déploiement de 1.123.11 ci-dessus —
les deux lots de la soirée sont partis ensemble.
**Ce qui change pour quelqu'un qui planifie sur iPad** : pincer pour agrandir ou réduire la carte d'alignement (Conception) ne
devrait plus accrocher. Trois choses se battaient dans ce geste. Deux mécanismes de zoom tournaient en même temps sur le même
pincement — l'un recentrait sur le milieu de l'écran, l'autre sur l'endroit pincé — et se contredisaient à chaque image. Chacun
refaisait la mise en page de toute la carte, dix mille pixels sur six mille, à chaque instant du geste. Et au trackpad, le zoom
avançait par bonds de 5 % au rythme des signaux reçus plutôt qu'à l'ampleur du geste. Le pincement se comporte maintenant comme
celui d'Annoter et d'Évaluer, qui n'avait aucun de ces trois défauts. **Un changement visible à annoncer** : le zoom se recentre
désormais sur le point pincé, plus sur le centre de l'écran.
**Vérifié comment** : une sentinelle neuve de 31 essais qui tient l'arithmétique du geste — le point de carte sous les doigts ne
bouge pas, pendant le pincement comme après —, l'exclusion des deux mécanismes, et l'absence de remise en page dans la boucle ;
quatre mutations du code la font rougir, deux de plus pour la sentinelle voisine qui garde les bornes de zoom ; Vitest 499 fichiers
/ 5 510 verts. **Ce qui n'est PAS vérifié, et c'est l'essentiel ici** : rien de tout cela ne dit que c'est FLUIDE. Le conteneur n'a
pas WebKit, Playwright n'a pas de doigt, et aucun banc ici ne mesure une image par seconde. **Le geste réel sur l'iPad Air est le
seul juge**, et il reste dû. **Une supposition, à démentir si elle est fausse** : « les zoom in et out » a été lu comme le
pincement à deux doigts, pas comme les boutons + et −. Si c'était les boutons, le lot est à reprendre.

↻ **6 septembre 2026, 16 h 15 (Claude Code) — 1.123.9 EN LIGNE** (build `0906-1458`, `c09ca731` ; `main` = `origin/main`, arbre
propre ; poussée à 16 h 11, déploiement Netlify `ready` sur ce commit, vérifié par l'API — la page servie, elle, n'a pas pu être lue
d'ici, le proxy du conteneur refuse le domaine : le numéro en bas de page reste le geste qui tranche). **Ce qui change pour quelqu'un qui annote sur iPad** : le coin inférieur droit
d'une palette (Codes, Annotation, Tampons, Évaluer) se saisit enfin au doigt pour la redimensionner — il ne portait qu'un dessin, et
la vraie poignée était celle du navigateur, que Safari ne montre pas au toucher ; la taille choisie est retrouvée à la prochaine
ouverture, ce qui n'était jamais le cas. Et la palette mise en bandeau (↔) prend la hauteur de ce qu'elle contient au lieu des trois
cinquièmes de l'écran : sur la capture de Grégoire, dix codes tenaient en deux lignes et le vide couvrait la copie de l'élève.
**Vérifié comment** : deux specs sur le chemin réel de l'écran d'annotation (la vraie palette, le vrai bouton ↔), quatre break-tests
rouges dont deux croisés, une sentinelle statique de 8 cas, Vitest 498 fichiers / 5 479 verts. **Ce qui n'est PAS vérifié, et il faut
le lire** : tout cela est mesuré sous Chromium — le conteneur n'a pas WebKit, et Playwright n'a pas de doigt. **Le geste réel sur
l'iPad Air reste dû**, en usage normal, sans liste à cocher. Le seul rouge de la suite complète (277 passés, 1 échec) est un essai
déjà déclaré non-jugeant hors macOS : rejoué sur le commit d'avant, il rougit pareil.

↻ **5 septembre 2026, 13 h 51 (vingt-troisième passe, Cowork) — 1.120.0 EN LIGNE** (build `0905-1315`, `c4c7b04a`, poussée à
13 h 26 ; docs `7a40949b` à 13 h 28 ; `main` = `origin/main`, arbre propre, remesuré à 13 h 51). **Un seul lot, la carte
« Bilan »** (`1b06b1ba`) : dans un critère algorithmique, la carte « Observation » se titre « Bilan » et ne porte plus que les deux
phrases du bilan de l'élève et le menu du modèle, renommé « Modèle des phrases (bilan et décompte) » avec une ligne d'aide ;
« Aucune annotation », lue par l'enseignant seul, vit sous la case des codes dans un pli fermé « Quand la copie ne porte aucun
code » ; le modèle « Français écrit (formulations d'origine) » devient « Français écrit », description neuve — **le « #581 » que
les collègues lisaient depuis deux livraisons est parti** (`evaluation-enonces.js:247-248`, mots arrêtés par Grégoire à 11 h 41).
Aucune donnée ne change. **Vérifié comment** : relecture de Cowork sur le commit du lot (plus aucun « Observation » dans
`grilles.js`, `aucune` rendu une fois sous la case, diff nul sur `import-export.js`, `partage-schemas.js`,
`evaluation-projection.js`, deux lignes sur `evaluation-enonces.js`) ; sentinelle neuve `sentinelle-carte-bilan.test.js` (17 tests,
cinq break-tests rouges puis remis) ; Vitest 5 202 verts ; verdict Playwright local vert sur le commit de release ; coup d'œil de
Grégoire sur la carte, le menu et le pli — la ligne d'aide gardée telle quelle, les mots du changelog validés (« ça va »).
Deux tests de plus que le grep de la consigne ne voyait nommaient la carte sans ses mots (`texte-troue-reperes-enonces.spec.js`,
`lot4-gabarit-algo-cartes.spec.js` l. 160 et 182) : adaptés par Claude Code, dit dans son rapport.
▣ **Ouvert après ce jour, rien de daté** : la synthèse des rétroactions dans le PDF (nommée à 11 h 35, pas cadrée —
**mesurée le 6 septembre au matin**, rapport `Rapports/MESURE-ce-que-l-eleve-lit-dans-le-pdf-2026-09-06.md` : trois documents,
sept blocs, même squelette pour les trois types de grille, et deux textes faux que l'élève lisait dans le collage Léa — « 63.5 %% »,
et un bilan qui prenait la copie pour sa propre précédente — **corrigés le matin même sur arbitrage de Grégoire, 1.123.1** :
la ligne « Note finale » porte l'unité une fois, et le bilan copié lit l'historique comme le PDF le fait déjà (le progrès revient,
« depuis 3 productions » ne se dit plus après deux). **Vérifié comment** : deux sentinelles rouges avant / vertes après, break-testées
avec témoin ; le banc de mesure repassé aux valeurs d'après ; Vitest 486 fichiers / 5 411 ; verdict Playwright local au jeton avant le
push. Deux défauts de forme restent inscrits, pas corrigés : le collage Léa sans sauts de ligne, et le bloc « Observations » qui ne
s'écrit jamais (#759, #760)) ; recueillir ce
qui sortira du 14 (un gabarit et un canal — le canal est la décision de Grégoire ; personne ne l'a pris). Après le 14 : le recalcul
quand une échelle change, l'Inspecteur de sélection, le dépôt public.

↻ **5 septembre 2026, 11 h 16 (vingt-deuxième passe, Cowork) — 1.119.0 EN LIGNE** (build `0905-1053`, `f2fa5a2e`, poussée à
11 h 04, verdict Playwright local vert ; `main` = `origin/main`, arbre propre). **La journée du 5, livrée d'un coup, quatre
lots** : (A) une seule liste pour les sous-critères et les codes — la carte « Codes d'annotation » disparaît ; (B) les
collections de paramètres de projection — « Enregistrer ces paliers sous un nom… », « Mes collections » au menu, la COPIE
(décision de Grégoire), clé `collectionsProjection` namespacée, module `collections-projection.js` ; (D) le texte troué,
étape 3 — le badge s'affiche comme une pastille dans la phrase (`composeur-badges.js`, le `<textarea>` reste la valeur),
voulu par Grégoire aujourd'hui plutôt qu'après le 14 ; (C) les mêmes gestes partout — corbeille, chevrons, empilement iPad
sous 768 px. **Vérifié comment** : relecture croisée de Cowork sur B et D (rien à corriger), A et C au jugement de Claude
Code ; coups d'œil de Grégoire sur A, B, C ; **porte terrain iPad sur D passée 4/4** sur un aperçu de PR (`deploy-preview-82`,
option B, `netlify.toml` l. 29-31) — ⌫ retire la pastille d'un coup, la croix reste, pas de glissé ; une retouche née de la
porte (le curseur hors du cadre après une pastille terminale, `74e52ef8`) vue réglée par lui. Vitest 5 185 verts.
▣ **Ouvert après ce jour** : ~~l'étape 4 du texte troué~~ **abandonnée par Grégoire à 11 h 35** après un inventaire mesuré
(`INVENTAIRE-2026-09-05-badges-inventes.md`) — le prochain accent, non daté, est la synthèse des rétroactions dans le PDF ; la carte « Bilan » (cadrage du matin, avec le
« #581 » toujours en ligne dans la description du modèle « Français écrit », `evaluation-enonces.js:248`) ; rien ne prévoit
encore comment on recueille ce qui sortira du 14.

↻ **5 septembre 2026, 8 h 01 (vingt-et-unième passe, Cowork) — 1.118.0 EN LIGNE** (build `0905-0744`, `d6c4b3fc`,
poussée, verdict Playwright vert ; `origin/main` = `main`). Le texte troué, étape 2 : les paliers de projection se
composent avec des badges, et **une seule carte « Ce que l'élève lit »** (décompte, verdict, recommandation, lue de
haut en bas ; ligne « L'élève lira : » en gris ce qui est engendré, dans l'encre ce qu'on a écrit). Vérifié comment :
relecture croisée de Cowork sur les quatre commits du matin (`7ff78ced`, `91195f33`, `65ae6884`, `23bf5350`), trois
coups d'œil de Grégoire (l'aperçu, la composition, la carte fondue : « c'est bien »). Décisions de Grégoire du matin :
« Verdict » et « Recommandation (facultative) » ; fondre le décompte et les paliers en un seul endroit d'écriture ;
« Observation » → « Bilan » (inscrit, `CADRAGE-2026-09-05-carte-bilan.md`, pas dans 1.119). ⚠ Parti avec 1.118 : la
description du modèle « Français écrit » dit encore « #581 » aux collègues (dans le cadrage Bilan). **En cours** :
le lot A du 5 (une seule liste sous-critères + codes), `CONSIGNE-DU-JOUR.md` promue par Claude Code.

↻ **4 septembre 2026, 19 h 14 (vingtième passe, Cowork) — 1.118 codée, pas livrée.** Le texte troué, étape 2
(les paliers de projection se composent avec des badges) est sur `main` en local, cinq commits d'avance non
poussés (`2d9baafc` → `dccaf3d2`), carte relue, relecture croisée sans réserve, coup d'œil de Grégoire fait :
les phrases sont naturelles, l'aperçu change de place (sous chaque palier, retouche relayée à 18 h 40). Décisions
de Grégoire (17 h 15) : les huit badges (`service` `seuil` `longueur` · `erreurs` `mots` `moyenne` `projection`
`palier`) ; le préfixe engendré devient le badge `moyenne`. **Le matin du 5** : retouche relue, coup d'œil,
changelog, release 1.118, push ; puis la journée du 5 (`plans de travail/CONSIGNE-2026-09-05.md`) : fusion des
listes du gabarit · collections de paramètres · les mêmes gestes partout, **une seule livraison, 1.119**.
▣ Mesuré ce soir : **les codes par grille sont livrés depuis le 3** (`js/codes-annotation.js`) ; ce qui reste est
la fusion des deux rendus. En ligne, toujours **1.117.1**.

**Dernière mise à jour : 4 septembre 2026, 16 h 30 (dix-neuvième passe, Cowork) — release **1.117.1**
(build `0904-1507`, `e990e710`) en ligne : le lot 4 (gabarit algorithmique rangé, paliers d'une grille
analytique, « Aucun » au menu SOLO) et le mot « observation ». La CI rouge du matin (spec du lot 1) est
réglée ; celle de 1.117.0 (trois specs, clics lents sur le serveur) aussi ; le run de 1.117.1 est vert. Avant : 1.116.0 (build `0904-0729`), 4 septembre 10 h 20. ▣ **LES HUIT ÉNONCÉS TIENNENT.**

⚠ **Ce que « tiennent » veut dire, et ce que ça ne veut pas dire.** Chaque volet a sa
commande et son témoin ci-dessous. **Les quatre écrans ont été lus par Grégoire
lui-même**, à l'écran. Le dernier — la suppression définitive d'une copie d'élève — le
3 septembre au matin, dans la corbeille.

---

## La règle de lecture

Quatre états. Le quatrième a été ajouté le 1er septembre au soir, parce que trois
mentaient dans les deux sens :

- **Fait** : vérifié, et la façon de le vérifier est écrite à côté. ↻ **Depuis le
  1er septembre, la phrase porte LA COMMANDE**, pas seulement la méthode (règle 1
  de `PROTOCOLE.md`) : « des tests » est invérifiable, une commande se rejoue.
- **Éprouvé par Grégoire** : il a parcouru l'écran lui-même, en écrivant ses
  chroniques Labo Codex, et ça marchait. C'est la meilleure preuve qui existe, et
  elle a une portée : c'est l'AUTEUR qui a mesuré, sur SES données et SES réglages.
  Ce qu'un débutant rencontre par un autre chemin reste à voir.
- **Pas fait** : on sait ce qui cloche, et c'est nommé.
- **Jamais vérifié** : personne n'a regardé. **Ce n'est pas « probablement
  correct ».** C'est la confusion qui a coûté le plus cher dans ce projet.

---

## Le compte du jour : 6 faits, 3 éprouvés par Grégoire, 0 pas fait, 0 jamais vérifié

---

## FAIT

### On sait par où les gens entrent — et il n'y a plus qu'une porte
L'application était servie à **deux** adresses `.netlify.app` en plus de la
sienne, complètes et sans aucune authentification. Netlify comptait ces
visiteurs, Cloudflare Access ne les voyait jamais : c'est tout l'écart entre
« 17 » et « 0 ». Les deux redirigent maintenant vers `app.codexnumeris.org`.
**Vérifié comment** : après déploiement, `curl -sI https://codexnumeris-051225.netlify.app/`
rend **301** et `location: https://app.codexnumeris.org/` ; idem sur
`main--codexnumeris-051225.netlify.app` ; `/index.html` conserve son chemin.
**Témoin** : `app.codexnumeris.org` rend toujours **403** (Cloudflare), donc la
porte principale n'a pas été cassée et il n'y a pas de boucle.
⚠ **Ce que ça ne règle pas** : on ne sait toujours pas COMBIEN ils sont, ni qui.
La redirection ferme la porte, elle ne compte pas rétroactivement.
⚠ **Et l'annonce n'atteint pas sa cible** : le changelog s'affiche dans
l'application, donc derrière la porte. Quelqu'un qui a un signet `.netlify.app`
verra l'écran de code AVANT de pouvoir le lire. Le doublage (courriel, blog)
reste à faire. *(geste de Grégoire)*

### Importer des productions, et savoir ce qui se passe quand ça rate
Un import lancé sans groupe-cours actif est refusé, et le refus est dit. Un
fichier dont le numéro d'élève n'existe pas dans le groupe apparaît maintenant
dans la liste au lieu de disparaître sans trace.
**Vérifié comment** : quatre tests automatiques qui rejouent les quatre cas, plus
une relecture du rendu à l'écran (les tests seuls ne voient pas les couleurs).
**Reste** : l'essai à la main de Grégoire, pour juger l'écran réel. *(#612)*

### Une grille partagée arrive complète chez le destinataire
Les sous-critères, leurs rétroactions et les réglages de projection voyagent
maintenant avec la grille. L'évaluation du destinataire ne bascule plus de mode
à son insu.
**Vérifié comment** : tests automatiques sur le transport —
`cd tests && npm run test:unit` (433 fichiers / 4638 tests, code 0). *(#669)*

### Une rétroaction ne parle que de la discipline de celui qui l'écrit
↻ **Descendue de FAIT à PAS FAIT le 2 septembre à 11 h.** Ce n'est pas une
régression : la ligne était classée « fait » sur la première moitié de l'énoncé
seulement, et la seconde n'a jamais été livrée. **C'est le classement qui mentait,
pas le code.**

**Ce qui est livré, et en ligne** — quatre versions le 2 septembre, un seul fil :

- Le mot « français » ne s'imprime plus dans le PDF d'un élève dont le critère
  s'appelle autrement ; les quatre phrases engendrées se règlent depuis le gabarit
  de la grille et voyagent avec elle quand on la partage. *(1.108.0, #581)*
- Les modèles de pratique nommés « Chimie », « Géographie », « Philosophie »,
  « Comptabilité » ne sont plus offerts, et les modes de calcul perdent leur
  parenthèse disciplinaire. *(1.109.0, #687)*
- Le modèle sommatif cesse de reproduire la pratique de son auteur : sa
  configuration était un cours de littérature. *(1.109.1)*
- Ses quatre évaluations passent à **parts égales, 25 % chacune** — une pondération
  est une position pédagogique, pas un point de départ. `20/20/30/30` mettait 60 %
  du poids sur les examens, servi comme départ à des programmes où les examens sont
  minoritaires ou absents. *(1.109.2)*

**Vérifié comment** : `cd tests && npm run test:unit` rend **435 fichiers / 4701
tests, code 0** ; sentinelle #687 à **27 cas**, break-testée 4 fois, dont la
mutation `20/20/30/30`. Les quatre points de version mesurés PAR TÉMOIN :
`grep -rl '1\.109\.1' --include=*.js --include=*.json --include=*.html .` rend
**0** ; témoin du périmètre, `grep -rl '1\.109' .` rend **11** fichiers de prose
datée.
⮕ **Et Grégoire a regardé l'écran avant que ça parte** : Conception › Pratiques ›
« Partir d'un modèle » — cinq modèles fournis, aucun nommé par discipline.
⚠ **Une relecture croisée a rattrapé un trou avant l'envoi** : un critère nommé
« Maîtrise de la langue **française** » n'était pas reconnu et basculait en silence
sur le texte neutre. Le motif exigeait un non-alphabétique après « francais » ; la
forme fléchie échouait.

**La seconde phrase est livrée le 2 septembre à midi *(1.110.0)*, et elle attend
le regard de Grégoire :**

- **Plus aucune pratique offerte n'affiche de matière ni d'établissement.** Sept
  entrées de `js/pratiques/pratiques-predefines.js` déclaraient Chimie,
  Littérature, Mathématiques, Philosophie ou Biologie, et nommaient un cégep
  précis ; six identifiants et quatre constantes portaient un prénom de collègue.
  ⚠ **Mesure qui corrige la prémisse** : ce module n'est PAS celui que lit l'écran
  « Partir d'un modèle ». Ce dernier lit `MODELES_PRATIQUES_PREDEFINIS`
  (`js/pratiques-bibliotheque.js`), **déjà propre depuis #687**. Les sept entrées
  de `pratiques-predefines.js` n'ont pour lecteur vivant qu'un
  `Object.keys()` de `pratique-manager.js:159`, dans un test d'appartenance qui
  compare des NOMS DE CONSTANTES à des `id` — il ne matche jamais. Le renommage
  est donc sans effet observable, et c'est ce qui le rend gratuit. *(#690)*
  ⮕ ↻ **Contre-mesure de Cowork, 12 h 10 — il y a un SECOND lecteur mort, et il
  faut l'inscrire** : `pratique-manager.js:281`, `initialiserPratiquesPredefines()`,
  qui **écrirait ces sept pratiques dans la base d'un nouvel utilisateur**. Elle a
  **0 appelant** : `grep -rn "initialiserPratiquesPredefines" js/ index.html tests/`
  ne rend que sa définition. ▣ **Témoin** : sur le même objet,
  `migrerVersBibliotheque` en a 4, `obtenirPratiques` 9, `sauvegarderPratique` 26 —
  le zéro mesure donc quelque chose. **C'est un semis débranché, pas un semis
  absent** : il appartient au chantier « le matériel de départ cesse d'être semé ».
  *Inscrit, continué.*
  ⛔ **ET UNE ERREUR DE COWORK, À NE PAS REDÉCOUVRIR COMME UNE TROUVAILLE.** La
  passe de 11 h affirmait ici : *« six pratiques offertes à l'adoption… ce module
  est VIVANT, c'est ce que les gens peuvent prendre. »* **C'était faux.** Cowork
  avait conclu « vivant » d'un `grep` dont les résultats étaient des **commentaires
  JSDoc** (« Référence : PRATIQUE_… dans pratiques-predefines.js ») et une balise
  `<script>`. **Un fichier chargé n'est pas un fichier lu.** Troisième occurrence
  le 2 septembre de la même faute : *chercher un MOT là où il faut chercher une
  OFFRE.*
- **Les huit identifiants d'échelles disciplinaires sont retirés** de
  `IDS_GABARITS_HARDCODES` (`js/main.js`) et de la sonde
  (`js/echelles-bibliotheque.js`), et le commentaire périmé qui exigeait leur
  maintien est corrigé sur place. **Mesuré inerte** : le tombstone a quatre
  lecteurs, aucun ne les regarde, et le chemin d'import ne le consulte pas —
  `grep -rn "estRessourceSupprimee\|ressourcesSupprimees" js/import-export.js
  js/codex.js js/partage-section.js` rend **zéro** ; témoin du périmètre, la même
  commande sur `js/` rend **six**. *(#690)*
- **Le service d'aide cesse d'être servi à qui n'en a pas.** Six chaînes :
  les trois du plan de rattrapage (`pratique-sommative.js` l. 642/648/649) et les
  trois de `evaluation-projection.js` (l. 163 la phrase de l'élève, l. 211 le
  libellé du réglage, l. 213 le défaut). Mots arrêtés par Grégoire le 2 septembre
  à 11 h et 11 h 30 ; le tutoiement de la l. 163 reste, celui de l'élève, et les
  étiquettes de l'enseignant restent nominales. *(#539)*
- **Plus aucun nom de personne dans le code applicatif** : 86 occurrences avant,
  **5** après dans `js/` hors pack de démonstration, et aucune n'est un
  identifiant, une constante ni un libellé — quatre sont des commentaires, la
  cinquième est `js/config.js` (zone protégée, fiches fictives). *(#690)*

**Vérifié comment** : `cd tests && npm run test:unit` rend **436 fichiers / 4710
tests, code 0** (contre 435 / 4701 avant : la sentinelle neuve `#690`). Quatre
gardes break-testées : réintroduire `pan-standards-bruno` → rouge, une
`discipline` → rouge, un `etablissement` → rouge, « en français » dans le libellé
ou le défaut → rouge. Cas D de la sentinelle #464 **réorienté, pas désarmé** :
retirer `ECHELLE_IDME_DEPART` rougit, retirer `ECHELLE_BRUNO_CHIMIE` ne change
plus rien — les deux break-tests joués. **Témoin du geste 2** :
`grep -rn "CAF\|(SA)\|en français"` sur les deux fichiers passe de **9** à **3**,
et les trois restants sont les commentaires qui expliquent la transition CAF →
Passerelle + — un zéro ici aurait voulu dire que l'explication est partie avec le
défaut.

⚠ **TARIR N'EST PAS RÉPARER, et le stock est nommé** : un enseignant qui a déjà
inscrit son `nomServiceAide` porte sa valeur en base ; le changement de défaut ne
la touche pas, **et c'est voulu**. Les copies des huit échelles et des pratiques
adoptées restent elles aussi telles quelles. Rien n'a été écrit dans les données
de personne. *(#674)*

⚠ **Ce qui reste dû, et que Grégoire seul peut trancher** : la formule
« l'algorithme propose, le jugement tranche — Voisard »
(`js/pratiques/pratique-pan-standards.js:35`, `js/pratiques/denotation-saisie-ui.js:8`)
vient d'une **source publiée** — il l'a dit le 2 septembre. **La référence exacte
(auteur, œuvre, année) reste à fournir** ; les deux lignes sont laissées intactes
d'ici là, parce qu'effacer une attribution n'est pas de la protection.

**Fini quand** : un enseignant qui n'enseigne pas le français, et dont
l'établissement n'a ni CAF ni services adaptés, ne rencontre aucun de ces quatre
mots dans son interface — sauf s'il les a écrits lui-même.
⮕ **Ce qui reste avant de cocher, et ce n'est pas du code** : Grégoire doit
regarder DEUX écrans. Conception › Pratiques › « Partir d'un modèle » — aucune
pratique offerte n'affiche de matière. Et l'écran de réglages de la pratique
sommative — le nom du service d'aide est un champ qu'il peut remplir, avec
« Centre d'aide du collège » comme valeur de départ ; c'est là qu'il écrira
« Passerelle + » lui-même. **Ce réglage lui appartient : personne ne l'écrit à sa
place, ni dans le code, ni dans ses données.**

⚠ **Ce que ça ne réglera pas** : les évaluations DÉJÀ enregistrées gardent leur
texte gelé, et c'est voulu. On tarit la source, on ne réécrit pas ce qui est chez
les gens. Le mot reste aussi gravé dans les identifiants de champs du volet
confidentiel. *(#440 résiduel)*

↻ **PASSE À « FAIT » LE 2 SEPTEMBRE À 12 h 45.** Le code est en ligne (1.110.0), la suite
COMPLÈTE est verte, **et Grégoire a parcouru les deux écrans lui-même.**

**Vérifié comment, au complet :**
· `cd tests && npm test` — **436 fichiers / 4710 tests** ET **239 essais Playwright, 0 échec,
  0 instable, en 8,0 min**, sur `672e3c5f`. ⚠ **C'est le premier verdict NAVIGATEUR pris sur
  ce lot** : 1.110.0 était partie sans, le garde pré-push ne jugeant que Vitest.
· Sentinelle neuve `#690`, quatre gardes break-testées.
· ▣ **ÉPROUVÉ PAR GRÉGOIRE, sur ses vraies données, le 2 septembre** : Conception ›
  Pratiques › « Partir d'un modèle » affiche ce qui a été décidé ; et le champ « Nom du
  service d'aide » (Conception › Grilles de critères › critère algorithmique › Modèle de
  projection) tient ce qu'il y écrit.
  ⮕ **Et c'est LUI qui a trouvé, en le faisant, que le jeton s'écrit `{service}` avec des
  ACCOLADES** : il avait tapé `[service]`, que le code ne remplace jamais — l'élève aurait lu
  le crochet. **Aucun test ne voyait ça.** C'est la démonstration de ce que vaut un passage à
  l'écran.

### ⚠ LE DERNIER MOT DE L'ÉNONCÉ, QUE PERSONNE N'AVAIT MESURÉ : le SRPNF

L'énoncé en nomme quatre — SRPNF, EUF, CAF, littérature. Les trois derniers ont été traités ;
**le SRPNF ne l'avait jamais été.** Mesuré depuis Cowork le 2 septembre à 12 h 50 :

```bash
grep -rn "SRPNF" js/ --include=*.js
grep -c "copierCriteresSRPNF" index.html
```

▣ Un seul endroit l'affichait encore à un enseignant : `js/evaluation.js:3087`,
`notifications.succes('Copié', 'SRPNF copiés dans le presse-papiers')`, dans
`copierCriteresSRPNF()`.
▣ **Cette fonction n'a aucun appelant** : `grep -c` sur `index.html` rend **0**.
**Témoin** : au même test, `sauvegarderEvaluation` rend **2** et `supprimerEvaluation` **1**.
Le zéro mesure donc quelque chose. L'élément `criteresCopier` qu'elle lit n'est pas non plus
dans `index.html`.
⮕ **Le bouton n'existe plus ; la fonction est restée.** Personne ne voit cette notification.
· Les autres occurrences de SRPNF sont des noms de fonctions, des commentaires, une entrée de
  changelog, et `pratiques-predefines.js` — **le fichier mort** (voir plus haut).
⮕ **Inscrit comme code mort, PAS corrigé** — issue 2 de `CLAUDE.md`. Ça n'empêche aucun des
huit énoncés.

### Aucune note remise ne repose sur une pondération incomplète sans le dire
↻ **CORRIGÉ DANS LE DÉPÔT le 2 septembre 2026 en soirée — commité, NON poussé : il
attend ton coup d'œil (règle 6).** Pour qui utilise l'application en ligne, rien n'a
encore changé ; c'est pourquoi la ligne reste ici.

Ce que le défaut faisait, mesuré : il ne baissait pas la note, il la **montait**.
Grille 50/30/20, les trois critères renseignés → **84,0 %** (M) ; le critère à 20 %
sans niveau → **95,0 %** (E), sans un mot. Et une échelle dont les niveaux n'ont pas
de valeur (la forme des huit échelles disciplinaires retirées le 1er septembre, dont
les copies restent chez qui les avait adoptées) donnait **0,0 %** comme un résultat.

Ce qui change, en gestes :
- **À l'écran** : un critère sans niveau → la note et le niveau affichent « -- », et
  une ligne sous la note nomme le critère et son poids (« Pas de note tant qu'un
  critère est sans niveau — Langue (20 %). Sans lui, la note ne porterait que sur
  80 % de la grille. »). Renseigné, la note revient et la ligne disparaît. Une échelle
  muette est nommée de la même façon, avec quoi faire.
- **À l'enregistrement** (bouton Enregistrer, création ou modification) : refus
  nommé, et **le brouillon est conservé** (écrit sur-le-champ, non verrouillé, la
  note AVEC sa portée `ponderationCouverte` à côté de `noteFinale`) : la copie passe
  « Évalué » et reste exportable, son PDF dira qu'il ne conclut pas. ↻ Trouvé par
  Grégoire le 2 septembre à 17 h 53 : la première version du refus n'écrivait rien,
  et comme Enregistrer annule l'auto-save en attente, la copie restait « Importé »
  et l'export Léa rendait « aucune évaluation trouvée ». ↻↻ Et à 18 h 04, capture à
  l'appui, le second correctif n'avait rien changé : dans « Annoter et évaluer »,
  `evaluationEnCours` désigne DEUX objets (constat #646), les niveaux vont dans l'un
  et l'auto-save lit l'autre — il rendait la main sans écrire. Corrigé en soirée par
  un instantané qui prend les critères là où ils sont ; **prouvé par un banc Playwright
  qui rejoue ta séquence exacte** (rouge avant, vert après).
  ⚠ Ce banc a mesuré au passage que **l'auto-save débouncé n'écrit AUCUN brouillon dans
  ce flux** — depuis avant ce lot. C'est #646, pas #674 ; inscrit, pas corrigé.
- ⚠⚠ **À 18 h 50, ta comparaison de trois captures a mené à la trouvaille la plus lourde
  de la journée** : quatre des cinq critères de « Grille-5 FR-ALGO A26 » n'ont **aucun
  identifiant** (sonde, lecture seule). L'éditeur de grille en lignes les créait ainsi
  (tari le soir même) ; l'écran d'évaluation, lui, les confond en UN seul : le niveau
  choisi sur Rigueur, Plausibilité ou Nuance était lu sur Structure, et **n'a jamais été
  enregistré**. ↻ Précisé par toi à 19 h 30 : l'évaluation de Daniel était un test et
  **aucune autre évaluation n'utilise encore cette grille** — rien n'est perdu. Avant les
  vraies évaluations : donner un identifiant à ses quatre critères. ↻ **Fait par toi à
  19 h 45** (critères supprimés et recréés dans l'éditeur : « tout fonctionne »). Pour
  les autres enseignants, dont l'éditeur a pu créer les mêmes grilles depuis octobre
  2025, une réparation automatique est **à décider à froid**. Détail dans la consigne.
- **Sur le PDF de l'élève** : pas de bandeau « Niveau général » ; à sa place, la
  phrase que tu as arrêtée le 2 septembre en soirée : « Cette copie n’a pas de niveau
  général : Langue (20 %) reste à évaluer. » L'export te le dit avant la remise.
- **Rétroactif** : les évaluations déjà en base sont relues depuis leurs critères,
  leur grille et leur échelle — les copies muettes d'avant sont vues.

**Vérifié comment** (depuis `tests/`) :
`npx vitest run unit/sentinelle-674-la-note-dit-sur-quoi-elle-porte.test.js` rejoue
le cas 50/30/20 sur la fonction réelle — 10 cas, dont B (« 95.0 % » attendu « -- »)
et C (« 0.0 % » attendu « -- ») **rouges avant le correctif**, verts après ;
`npx vitest run unit/sentinelle-674-les-portes-refusent-l-incomplet.test.js` — 15 cas
(les deux portes, l'auto-save, le PDF, l'échappement) ;
`npx vitest run unit/sentinelle-674-la-portee-accompagne-la-note.test.js` — périmètre
DÉDUIT de `js/` (4 chemins trouvés, aucun sans portée, break-test intégré) ;
`npx playwright test integration/triptyque-seme-produit-une-note.spec.js` — 4 essais
WebKit, dont le geste ci-dessous. Break-tests par mutation : portée retirée d'un
chemin → 1 rouge ; porte retirée → 5 ; règle forcée à « complète » → 12 ; rendu qui
conclut quand même → 3 ; restauration vérifiée par empreinte.
Suite complète (`cd tests && npm test`) : Vitest **440 f. / 4753 t.** ; Playwright
**240 passés, 0 échoué, 0 instable, 7,9 min** en local — le verdict au jeton se prend
après ton coup d'œil, avant le push.

⮕ **Ce que tu dois aller voir** : Travaux → ouvrir une copie → laisser un critère
sans niveau. La note doit afficher « -- » et la ligne sous elle nommer le critère.
Cliquer Enregistrer : refus nommé. Donner le niveau : la note revient, plus un mot.
*(#674)*

↻ **CLOS PAR GRÉGOIRE le 2 septembre 2026, tard.** Ses mots : *« L'item "Aucune note remise
ne repose sur une pondération incomplète sans le dire" est clos. »*

↻ **POUSSÉ le 2 septembre au soir — `9fe13749..1402a17c`, release 1.111.0.** Le hook a relancé
Vitest (vert) et lu le jeton (« verdict vert à jour pour ce commit »). ▣ **L'énoncé est donc vrai
pour les utilisateurs**, et non plus seulement dans le dépôt.
⏳ **Reste à confirmer, et ce n'est pas cet énoncé-ci** : que la version affichée dans
l'application passe bien à **1.111.0** après le déploiement Netlify. C'est l'énoncé 7, et il se
vérifie d'un coup d'œil au bandeau.

**Vérifié comment :**
· **Reproduit en ROUGE avant de toucher au code**, sur le vrai `calculerNote()` : le cas 50/30/20
  rendait **95,0 %** quand le critère à 20 % perdait son niveau (84,0 % avec les trois), et une
  échelle muette rendait **0,0 %** comme un résultat. **Puis vert après.** 10 cas.
· Portes, auto-save, PDF, échappement : 15 cas verts.
· **Sentinelle au périmètre DÉDUIT de tout `js/`** — quatre chemins d'écriture trouvés, aucun sans
  sa portée. ▣ C'est la leçon du lot #572 du même jour, appliquée : **pas une liste de fichiers
  tapée à la main.**
· **Quatre break-tests par mutation** : 1, 5, 12 et 3 cas rouges, restauration vérifiée par empreinte.
· `Vitest` **441 fichiers / 4760 tests** · `Playwright` local **240 passés, 0 échoué, 0 instable**.
· ▣ **ÉPROUVÉ PAR GRÉGOIRE, à l'écran** : le refus nommé, le brouillon conservé, le PDF portant sa
  phrase, et sa propre grille réparée au passage.

**Ce que ça donne, en gestes :**
· **À l'écran** — un critère sans niveau (ou dont le niveau n'a pas de valeur dans l'échelle)
  **retient** la note et le niveau (« -- »), et une ligne dessous **nomme** le critère, son poids
  et quoi faire. Renseigné : la note revient, la ligne disparaît.
· **À l'enregistrement** — refus nommé, rien n'est écrit. ⚠ **L'auto-save continue d'écrire
  pendant la saisie**, la note avec sa portée : le brouillon n'est jamais perdu.
· **Sur le PDF de l'élève** — pas de bandeau « Niveau général », et une phrase nomme les critères
  en attente. ↻ **Les mots sont ceux de Grégoire**, choisis le 2 septembre parmi trois
  propositions (variante C, augmentée) : *« Cette copie n'a pas de note ni de niveau général :
  Langue (20 %) reste à évaluer. »* ▣ **Motif du choix** : « Évaluation incomplète » aurait pu se
  lire comme *le travail de l'élève* qui serait incomplet. **« Reste à évaluer » dit à qui revient
  le geste.**
· **Rétroactif** — les évaluations déjà en base sont relues depuis leurs critères, leur grille et
  leur échelle. ▣ **C'est la propriété qui avait écarté l'état « brouillon / conclue »** : elle
  seule répare l'existant.

⚠⚠ **LE TROU QUE CE LOT A NOMMÉ, ET C'EST LA LEÇON DE LA JOURNÉE.** La suite était **verte —
441 fichiers, 4760 tests — avec DEUX vrais défauts dedans** : le brouillon perdu au refus, et des
critères créés sans identifiant. ▣ **Aucun test ne les a vus. C'est le regard de Grégoire à
l'écran qui les a trouvés.**
⮕ **Quatrième occurrence du même motif le 2 septembre** : un vert qui ne prouve pas ce qu'on croit
(la CI rouge que personne ne lisait · la sentinelle #572 qui regardait deux fichiers sur trois ·
trois outils de poste plus permissifs que le serveur · et maintenant 4760 tests verts sur deux
défauts réels).
⮕ **C'est l'argument le plus fort en faveur de la règle 6** — *chaque lot se termine par un geste
à vérifier à l'écran, pas par un rapport.* Elle n'est pas une politesse : elle a attrapé
aujourd'hui ce que toute la machinerie a manqué.

⏳ **Trois trouvailles inscrites, PAS corrigées** : le portfolio et la liste des évaluations ne
lisent pas encore la portée ; l'export unitaire ignorait déjà la raison de #565 ; un repli mort
dans `calculerNote` contredit #527, sans effet en production.

⏳ **Et une décision qui reste à Grégoire** : la réparation automatique des grilles des AUTRES
enseignants — l'éditeur créait des critères sans identifiant depuis octobre 2025. **C'est une
écriture dans les données de quelqu'un.**

### Ce qu'un utilisateur détruit, il l'a voulu ; ce qu'il garde, il le retrouve
↻ **CLOS le 3 septembre 2026 au matin.** Quatre volets, trois versions : **1.111.1**
(cartouches), **1.111.2** (copie d'élève + vocabulaire), **1.112.0** (échelle).

▣ **La règle, tranchée par Grégoire le 2 septembre** : supprimer définitivement la copie d'un
élève emporte **tout ce qui touche le couple** (cet élève, cette production) — originale,
reprises, évaluation d'un fichier réimporté. **Le code le faisait déjà ; l'écran ne le disait
pas.** Le constat B5 de l'audit du 25 août, qui décrivait cette portée comme « trop large », est
donc **REFUSÉ** : elle ne l'est pas.

**Ce que chaque écran dit maintenant, et comment on le sait :**

· **La copie d'un élève** — « Le fichier, ses annotations et toutes les évaluations de cet élève
pour cette production seront effacés. » ↻ **Les mots sont ceux de Grégoire**, choisis le
2 septembre à 21 h 45 parmi trois propositions. Un seul prédicat décide de ce qui est annoncé
et de ce qui est détruit — deux prédicats auraient pu diverger sans qu'aucun test ne le voie.
**Vérifié comment** : sentinelle #560, 8 essais. ▣ **ÉPROUVÉ PAR GRÉGOIRE le 3 septembre au
matin**, à l'écran, dans la corbeille — sa phrase s'affiche mot pour mot. ⮕ **Et le témoin
négatif tient** : le déplacement à la corbeille, qui ne détruit rien, continue de dire « le
fichier pourra être restauré pendant 30 jours » et rien de plus.

· **La cartouche** — les quatre chemins vivants disent leur portée, mesurée au moment où ils
parlent. Celui de la liste, que Grégoire avait sous les yeux, disait « Es-tu sûr ? » et rien
d'autre ; il nomme maintenant la grille, ce qui survit, et l'irréversibilité.
**Vérifié comment** : sentinelle #647, 21 essais ; et **Grégoire a lu l'écran** — c'est même sa
capture qui a montré qu'un des chemins ne nommait pas sa grille, ce que ni les essais ni la
relecture du code n'avaient vu.

· **L'échelle** — « Supprimer l'échelle «X», c'est la remplacer : N évaluations, N productions…
suivront. Par quelle échelle la remplacer ? » ↻ **Décision de Grégoire, 3 septembre** :
*« On supprime une échelle pour la remplacer par une autre. Une évaluation ne tient pas s'il n'y
a pas d'échelle. »* Un seul cœur pour les cinq chemins ; refus nommé si le trimestre est
archivé ; ne propose que les successeurs aux mêmes codes de niveaux.
**Vérifié comment** : sentinelle #648, 18 essais, vraie fonction chargée en bac à sable ;
`grep "^async function supprimerEchelle" js/` rend 6 chemins, dont 5 passent par
`supprimerOuRemplacerEchelle` et le 6e ne touche que la Bibliothèque. **Grégoire a lu l'écran**
sur son échelle « 0-IDME » (28 évaluations, 10 productions, 1 pratique, 6 cartouches).
▣ **Relecture croisée de Cowork (règle 2)** : l'ordre est sûr — compte, refus, question,
**puis** écriture. Rien n'est touché avant que l'utilisateur ait vu le chiffre.

· **Un aiguillage mort** dans la suppression d'une production — `typeof
retirerProductionDeLaBibliotheque === 'function'` gardait une fonction jamais déclarée.
**Vérifié comment** : `grep -rn` rendait **2** occurrences (le garde et son appel), contre **5**
pour la fonction sœur `retirerPratiqueDeLaBibliotheque` — témoin que le motif trouve ce qui
existe. Retiré ; sentinelle #649, 105 lignes.

⏳ **Inscrit, PAS corrigé** *(issue 2)* :
· Le compte « N évaluation(s) l'emploient » d'une cartouche ne regarde que **le trimestre
courant**, alors que la Bibliothèque est commune à tous. La phrase omet, elle n'invente pas.
· Le remplacement d'une échelle **n'est pas atomique** : six écritures indépendantes. En cas
d'échec partiel, l'ancienne échelle survit et relancer le geste termine la migration — **mais
l'écran ne le dit pas.**
· `verifierDependancesEchelle` ne connaissait pas de marqueur « terminé » : **le refus porte sur
l'archivage seul**, faute d'un critère mesurable.

⚠ **Ce que le lot n'a PAS fait, et c'est un chantier ouvert** : **corriger** une échelle sans la
supprimer, avec **recalcul proposé, jamais automatique**. Décision de Grégoire le 3 septembre :
*« Il permet d'informer l'utilisateur des conséquences de son geste. »* Cadré dans
`plans de travail/DECISION-2026-09-03-echelle-remplacement.md`. *(#647, #648, #649, #560)*

---

### Le numéro de version affiché correspond au code qui tourne
Sans ça, aucun rapport de bug n'est interprétable, ni le sien ni celui d'un
utilisateur.
**Vérifié comment** : tests sur le bandeau de version, et les quatre points de
vérité mesurés PAR TÉMOIN à la release **1.109.2** (build `0902-1006`) —
`grep -rl '1\.109\.1' --include=*.js --include=*.json --include=*.html .` rend
**0**. ⚠ Le témoin dit aussi son périmètre : sur tout le dépôt, `1.109` rend encore
**11** fichiers de prose datée.
⚠ **Fragile** : ça se re-périme à chaque release. Le 2 septembre, **quatre versions
se sont succédé en une matinée** — cette ligne a cité un numéro périmé entre
chacune.
⮕ Le bump est passé par `scripts/release.mjs`, qui écrit les quatre points de
façon atomique **et** bumpe les jetons anti-cache d'`index.html` (11 ce matin,
qu'il liste). Le danger reste le bump fait à la main, et lui seul. *(#665)*
↻ **13 septembre : un deuxième danger, qui n'était pas le bump.** Sur le site, au
chargement, le numéro était REMPLACÉ par ce que répondait le fichier de version du
serveur ; ce matin-là, une copie périmée : bandeau en 1.135.0, carte en 1.139.0,
code en 1.139.0. Depuis 1.139.1, le numéro vient du code chargé, et le serveur ne
sert plus qu'à annoncer une version plus récente. **Vérifié comment** :
`cd tests && npx vitest run unit/sentinelle-849-850-version-chargee.test.js`,
quatre break-tests rouges. *(#849)*

---

## PAS FAIT

▣ **Rien.** Pour la première fois depuis que ce fichier existe, aucun des huit énoncés n'est
ouvert. Le dernier est monté dans FAIT le 3 septembre 2026 au matin.

⚠ **Ça ne veut pas dire que l'application est finie.** Ça veut dire que **la liste fermée de
huit gestes que Grégoire s'était donnée pour la cohorte 1 est parcourue**. Ce qui reste vit
dans `BACKLOG.md` et dans `plans de travail/`, et ne se compte pas ici.

---

## ÉPROUVÉ PAR GRÉGOIRE

↻ **Corrigé le 1er septembre au soir.** Ces deux gestes étaient inscrits « jamais
vérifié ». C'était faux : Grégoire les a parcourus lui-même en écrivant les
chroniques Labo Codex, et il a vérifié à chaque fois que tout fonctionnait.
Le dépôt n'en portait aucune trace, et une session qui ne lit que le dépôt conclut
« personne n'a regardé ». **La trace manquait, pas la vérification.**

### Créer un trimestre, créer un groupe-cours, prendre les présences
**Éprouvé** par Grégoire, chronique 1.
**Ce qui reste sous cet écran** : des fenêtres d'alerte bloquantes sur ce parcours
exact. Il les a traversées sans être arrêté ; un débutant les lira autrement.
*(#678)*

### Créer une grille, une échelle, une cartouche
**Éprouvé** par Grégoire, chronique 2, avec SES grilles et SES échelles.
**Ce qui restait sous cet écran, et qu'il n'a pas pu rencontrer** : les huit
échelles « disciplinaires » de la bibliothèque (Chimie, Bio, Philo, Info, Géo…)
donnaient **zéro à la première évaluation, en silence**. Il ne s'en sert pas ; un
enseignant de chimie qui ouvrait la bibliothèque, lui, tombait dessus au premier
geste. *(mesuré le 1er septembre, plan du semis §1)*

↻ **Traité le 1er septembre en fin d'après-midi — et il faut lire ce que ça
couvre exactement.**
· ✅ **La source est tarie** : le versement des huit échelles est retiré, avec ses
  définitions et son appel. **Un nouvel enseignant ne les recevra jamais.**
· ✅ **L'échelle manquante est semée** : `ECHELLE_IDME_DEPART`, avec ses quatre
  `valeurCalcul`, modifiable et supprimable. Mesuré de bout en bout sous WebKit —
  espace vide, grille générique + échelle semée, « Maîtrisé » coché : **79,5 %,
  niveau M**. Le triptyque est complet et il calcule.
· ✅ **L'écran ne ment plus sur ce qu'il attend** : le texte d'attente nomme ses
  trois pièces, et choisir une grille sans échelle DIT ce qui manque.
· ✅ **L'autre source de matériel fictif est tarie aussi** : le module
  `js/spe-specifications.js` resemait **cinq** objets `[SPE]` signés « Labo Codex »
  à CHAQUE ouverture de la page — c'est pourquoi ils revenaient après chaque
  suppression. 1009 lignes retirées, zéro consommateur vivant, mesuré sur 24
  symboles. ⚠ **La pratique de notation par spécifications, elle, est intacte**, et
  une assertion la garde contre un futur retrait « de cohérence ». *(#681)*
  ⮕ **VÉRIFIÉ À L'ÉCRAN par Grégoire le 1er septembre** : les cinq gabarits
  supprimés depuis la bibliothèque, deux rechargements, **aucun retour**. Les
  sondes avaient d'abord mesuré zéro référence : rien de ce qui est parti ne
  portait la trace d'un jugement posé.
· ✅ **LES DEUX SONDES ONT TOURNÉ sur le corpus réel, le 1er septembre.**
  `_sonderEchellesDisciplinaires()` : **zéro partout** — bibliothèque, copies dans
  les trois trimestres, usages. Et le zéro porte son témoin : 3 trimestres et la
  bibliothèque partagée réellement lus. `nettoyage681()` : les cinq objets présents,
  **zéro référence, tous libres**, sur 15 clés ouvertes.
· ⏳ **CE QUI N'EST PAS RÉGLÉ, ET QUI A CHANGÉ DE NATURE CE SOIR.** Ce zéro ne
  couvre que le corpus de Grégoire. **Un enseignant qui a ouvert l'application
  avant aujourd'hui a pu ajouter l'échelle « Chimie » à sa sélection : sa copie
  reste muette et rend 0,0 % sans un mot.** Il n'est ni sondable, ni joignable, et
  **on ne sait pas combien ils sont** — le trafic n'est pas mesuré.
  ⮕ **#674 est le seul filet qui atteint ces gens-là.** Ce n'est plus une
  prévention pour la cohorte qui arrive : c'est une **réparation pour des
  utilisateurs déjà en place**, dont l'application ment aujourd'hui. Ça change son
  poids, pas seulement son rang.
↻ **1er septembre, tard — le §3 (« le matériel semé se dit utilisable ») est livré
dans le code et n'atteint personne.** Les trois pièces s'appellent maintenant
« Grille de départ », « Cartouche de départ », « Échelle de départ (IDME) »… **dans
un espace neuf seulement**. Sur une base qui porte déjà l'objet, le semis vérifie
l'identifiant et sort sans écrire : il ne recrée pas, donc **il ne renomme jamais**.
*(#682)*
⮕ ✅ **Réglé chez Grégoire le 1er septembre au soir** : il a tranché (b) — renommer
uniquement ce qui portait encore, au caractère près, un libellé écrit par le code.
**5 renommés, 0 nom personnel touché, 0 autre écriture**, vérifié par une relance de
la sonde. ⚠ **Mais chez les autres utilisateurs, rien n'a changé** : le renommage
est un script qu'il a lancé, pas une migration que l'application porte. Pour eux,
#682 est entier — et c'est encore « tarir n'est pas réparer ».
⮕ **La porte terrain du §3 est SUSPENDUE** : elle jugeait de libellés qui ne sont
pas arrivés, et elle envoyait dans un onglet « Matériel » qui n'existe pas. Le vrai
chemin est **Conception › Échelles de performance**.

↻ **Et la sonde a trouvé plus gros que le renommage** *(#683, ouvert)*. Deux
mécanismes, mesurés :
· **Changer de trimestre ne sème rien.** Le matériel de départ n'arrive qu'au
  chargement de la page. Un enseignant qui crée son second trimestre et va droit
  à l'évaluation n'y trouve rien, jusqu'à ce qu'il recharge — et rien ne le lui dit.
· **La suppression est par trimestre, l'interdiction est globale.** Supprimer la
  grille de départ dans un trimestre l'interdit dans TOUS, y compris ceux créés
  demain, pendant que les autres copies restent en place. ⮕ Ça touche aussi le
  geste 8 : la portée annoncée n'est pas la portée réelle. **Décision de Grégoire** :
  corriger changerait le sens de suppressions déjà faites.

⮕ Cette ligne reste donc « éprouvé par Grégoire » et ne devient pas « fait » :
ce qui a été mesuré, c'est la chaîne du NOUVEL utilisateur, pas le parcours
complet de l'énoncé 2.

---

↻ **Livré et éprouvé le 4 septembre 2026 — la grille déclare sa manière d'évaluer
(lot 1 des trois types de grille), en ligne dans 1.115.0, build `0903-2103`.**
· ✅ **Un menu « Type de la grille »** à côté du nom : holistique, analytique ou
  algorithmique. **Chaque critère neuf en hérite** sans rien cocher ; le menu de
  chaque critère reste là pour déroger. Le type voyage au partage et à l'import.
· ✅ **Le menu dit ce qui est ENREGISTRÉ, pas ce qui est déduit** (retouche décidée
  par Grégoire le 4 septembre) : « Non précisé » sur toute grille d'avant, et une
  ligne dessous dit ce que ses critères sont — « Tes critères sont tous
  holistiques. » Pas de couleur pour porter l'information : l'orange veut déjà dire
  « avertissement », et « déduit » est l'état normal de toutes les grilles d'avant.
· ✅ **Le badge de composition continue de dire ce qui EST**, depuis les critères,
  jamais depuis la déclaration.
· ⛔ **Rien n'est écrit dans les grilles existantes.** Rien du calcul des notes.
**Vérifié comment** : Grégoire, à l'écran, trois passages — une grille d'avant ouvre
sur « Non précisé » avec sa ligne, choisir un type tait la ligne et revenir la ramène ;
une grille neuve en « Analytique » reçoit trois critères analytiques sans rien cocher,
et un passé en algorithmique fait basculer le badge à MIXTE. Relecture croisée de
Cowork sur `fa5d34d2` : rien à corriger. Verdict au jeton vert sur `1228837a`.
*(commits `a6187760`, `fa5d34d2`, `1228837a`)*

↻ **Lots 2 et 3 livrés le 4 septembre 2026 au matin — release 1.116.0 EN LIGNE (`6309111e`,
build `0904-0729`, poussée à 7 h 32 : `git rev-parse origin/main` = `7a197996`), jeton WebKit
local vert sur ce commit.**
⚠ **MAIS LA CI EST ROUGE** : run GitHub 33869215489, Vitest vert, Playwright 254 / 255 — le rouge
est le spec du **lot 1** (`type-grille-lot1.spec.js`), jamais jugé sur Linux (le run de 1.115 avait
été annulé). Hypothèse mesurée par Claude Code : course de rendu sur le runner ; rien corrigé, par
consigne. **C'est le premier geste de la prochaine séance** (consigne du jour, §2). Règle 7 : le
vert local n'a rien prouvé ici.
· ✅ **L'analytique se saisit en points** : un champ « sur 30 » au lieu du menu, 24 sur 30 fait
  80 % ; le champ vide dit « – », un vrai zéro se tape (lot 2 + retouche).
· ✅ **Le chiffre trouve son niveau par les bornes de l'échelle, et ce niveau ouvre la cartouche** ;
  le critère analytique entre dans l'évaluation enregistrée avec ses points ET son niveau déduit,
  sous le même nom que les niveaux du menu — dix-huit lecteurs (dépistage, profil, archives,
  bilan, PDF) le voient sans changer (lot 3).
· ✅ **L'élève ne lit que le chiffre** : « 24 / 30 » sur le PDF, dans le texte copié vers LÉA, et
  dans les DEUX bilans (celui de l'app et celui du PDF — deux implémentations, retouches 1 et 2) ;
  la légende I·D·M·E disparaît du PDF d'une grille entièrement analytique. Le bandeau « Niveau
  général » de la copie reste : c'est le niveau de la copie, pas d'un critère.
· ✅ **Rouvrir une copie dont le premier critère est analytique charge l'évaluation et montre le
  cadenas** — régression du lot 3 trouvée par Grégoire à l'écran, corrigée avant publication
  (retouche 3).
**Vérifié comment** : relecture croisée de Cowork sur chacun des cinq commits (`b4039828`,
`5b8bc6b0`, `44559804`, `f485ea34`, et le lot 2 `37660b76`), cartographie faite à `37660b76`
avant de lire le patch ; Claude Code : Vitest **455 fichiers / 4989 tests, code 0**, sentinelle
lot 3 **43 cas** dont les cas rouges avant chaque retouche, break-tests par mutation à chaque
lot (14 + 4 + 5 + 3), WebKit complet **260 / 260** au lot 3 puis 15 / 15 sur les specs
d'évaluation à chaque retouche ; le verdict au jeton se prend par `scripts/pousser.sh` sur le
commit poussé. ▣ **ÉPROUVÉ PAR GRÉGOIRE, à l'écran, le 4 septembre** : sa grille « Analyse
littéraire » (12 critères analytiques), une copie évaluée, le PDF produit — **et c'est son
regard qui a trouvé les trois retouches** (les niveaux encore nommés dans le PDF, le « 0 » qui se
lisait comme une valeur, la copie qui ne se rechargeait pas). Aucun test ne les avait vues.
⏳ **Inscrit, pas corrigé** : points sans niveau déductible (échelle à trous ou muette) — le
critère n'entre pas dans `criteres[]` alors que la note compte ses points ; assumé par un test,
à décider avec les paliers du lot 4.
↻ **Lot 4 livré le 4 septembre 2026 en après-midi — release 1.117.0 (`4e7a1b03`, 13 h 36) puis 1.117.1
(`e990e710`, build `0904-1507`, 15 h 07), EN LIGNE.** Ce que tu vois dans Conception › Grilles :
· ✅ **Le critère algorithmique s'ouvre sur ses sous-critères**, puis quatre cartes repliables (formule ouverte ;
  observation, projection, codes repliés) qui restent comme tu les as laissées pendant que tu tapes. « Modèle de
  rétroaction » s'appelle **« Modèle d'observation »** (ton mot, 1.117.1 ; « rétroaction » reste à la cartouche),
  « Norme externe (épreuve uniforme) » s'appelle « Projection à l'EUF ». Un critère algorithmique neuf naît
  **sans projection**.
· ✅ **Les paliers de projection tiennent sur deux rangées**, numérotés, le nom lisible en entier ; la note
  « Écris {service}… » une seule fois.
· ✅ **Une grille analytique attache sa cartouche à des paliers en %** : le champ dit « Paliers (bornes en %) »,
  l'échelle de départ est déjà choisie, les colonnes portent les bornes de TON échelle (« 65–74,99 % »). Rien de
  ce qui voyage ne change (relecture croisée de Cowork sur `0385eadb`).
· ✅ **« Aucun » en tête du menu « Niveau SOLO »** : le critère compte dans la note, le dépistage des fondations
  ne le surveille pas ; le tableau de bord le dit quand plus rien n'est surveillé.
· ✅ **Un seul geste pour supprimer (la corbeille) et un seul pour déplacer (les chevrons)** dans l'éditeur de
  grille, sous-critères compris ; « Description » s'appelle « Descripteur ».
**Vérifié comment** : trois coups d'œil de Grégoire à l'écran le 4 septembre (c'est son regard qui a demandé
les huit retouches, toutes livrées sauf les chevrons sur les paliers, auxquels il a renoncé après la mesure :
l'ordre d'un palier EST son seuil) ; relecture croisée de Cowork sur A, B, C (rien à corriger, trois réserves
inscrites) ; Claude Code : Vitest **458 fichiers / 5042 tests**, sentinelles A, B, C break-testées, jeton WebKit
local vert sur `e990e710` ; runs GitHub **33884692393** (CI du matin, vert), **33907151093** (correctif des
trois specs de 1.117.0, vert), **33910422885** (1.117.1, vert : Vitest et Playwright WebKit, 19 h 20 → 19 h 46 Z). `origin/main` = `fd2b4ce6`.
⏳ **Inscrit, pas corrigé** : les deux colonnes des paliers ne s'empilent pas sur iPad en portrait (le formulaire
de groupe-cours dont elles héritent non plus) ; le ✕ rouge et la pile « Ordre » survivent hors de l'éditeur de
grille ; « Description / Rétroaction » des codes attend la fusion des deux listes (cadrage codes par grille,
points 7-8). ⚠ **Ce qui a retenu la publication aujourd'hui** : l'attente des runs GitHub (35 min, annulés par
tout push) — décision du soir, FAITE (`fd2b4ce6`) : on n'attend plus un run pour pousser (`PROTOCOLE.md` règle 7), et la règle des clics de spec vit dans `docs/securite/TESTS-AUTOMATISES.md` §4 avec son témoin au rituel de fin. Mesuré : les pushs de docs ne déclenchent aucun run ; un run complet reste entre 26 et 36 min.
⮕ **Prochaine séance** : le texte troué, étape 2 — les paliers de projection se composent avec des badges.

---

## L'ÉVALUATION — ce que l'audit du 25 août a déjà réglé

C'est le morceau qui inquiète, et il est moins ouvert qu'il n'en a l'air.

Un audit de l'onglet Évaluations (les quatre sous-onglets, le PDF de rétroaction,
le design) a relevé **20 constats le 25 août**. ↻ **Remesuré le 2 septembre, et
écrit DANS le rapport** (`Rapports/AUDIT-evaluation-onglet-2026-08-25.md`, temps 1) :
**15 inscrits et livrés, 4 partiels, 1 refusé avec motif** (les tailles du PDF, ta
décision), plus la section « mineurs » — partielle elle aussi. Les 17 fiches sont
cochées au backlog ; **coché ne veut pas dire couvert**, c'est ce que le rapport dit
maintenant constat par constat. ⚠ Et vingt constats LUS, **zéro écran parcouru** :
un audit fermé n'est pas une section vérifiée (temps 3, pas fait).

**Le quatrième site est corrigé — et il t'attend** *(temps 2, 2 septembre après-midi,
non poussé)*. #572 disait « la valeur calculée est la source » et avait corrigé
trois sites ; **rouvrir une copie déjà corrigée et la réenregistrer** passait par un
quatrième (`js/evaluation.js`, chemin de modification) qui relisait l'écran.
**Reproduit sur le chemin réel avant de corriger** : `79,46` calculé → **`79,5`
stocké** (l'arrondi de l'affichage) ; écran « -- » (rendu différé, #321) →
**`0` stocké** par-dessus la vraie note. Le second effet est réel, et c'est celui qui
départageait « arrondi bénin » et « zéro qui remplace une note ». Corrigé au même
patron que les trois sœurs ; la sentinelle #572 ne vérifie plus une liste tapée à la
main mais **tous les fichiers de `js/`, lus à chaque exécution** — c'est la leçon du
jour : elle était verte depuis le 29 août pendant que le défaut vivait.
**Vérifié comment** : test de reproduction en 3 cas (les 2 effets rouges avant, verts
après ; témoin que le chemin aboutit) ; break-tests : réintroduire la lecture d'écran
dans `evaluation.js` → rouge, l'introduire dans un fichier jamais listé → rouge ;
`grep -rn "parseFloat(.*noteProduction1" js/` rend **zéro**, et le témoin
`noteCalculeeCourante === 'number'` en rend **quatre**. Vitest 437 f. / 4715 t.
⮕ **Ce que tu dois aller voir** : ouvrir une copie que tu as déjà corrigée, ne rien
changer, réenregistrer, et vérifier que la note affichée est identique au centième.
⚠ **Ce que ça ne règle pas** : les quatre chemins écrivent toujours `0` quand la note
n'est pas calculable — c'est #674, l'énoncé 5, forme déjà tranchée (persister
`ponderationTotal`). Et les évaluations déjà enregistrées avec une note arrondie ou à
zéro gardent ce qu'elles portent : rien n'a été écrit dans tes données.
↻ **2 septembre en soirée** : les quatre chemins écrivent maintenant la portée à côté
de la note — voir le cinquième geste, plus bas.

**L'autre partiel qui t'attend** : la portée des suppressions par couple. Le garde a
été livré le 29 août, la règle métier non. C'est le geste 8 de cette page. *(#560)*

⚠ **Trois trous ont été découverts EN corrigeant**, et ils sont ouverts : neuf
fonctions définies deux fois sur `window`, 78 variables CSS fantômes, des clés de
session non préfixées. *(#587, #595, #596)*

⚠ **Ce que cet audit ne couvrait pas** : le calcul de la note lui-même. Il visait les
enregistrements, le PDF et le design. Le défaut mesuré le 1er septembre au soir (une
pondération incomplète qui affiche 0,0 %) n'est dans aucun des 20 constats. Un audit
propre ne dit rien de ce qu'il n'a pas regardé.

↻ **5 septembre 2026, 15 h 30 — le calcul de la note a été audité, et les trois trous qui pouvaient te faire écrire un chiffre faux sont fermés le jour même (1.121.0).** Rapport `Rapports/AUDIT-moteur-evaluation-2026-09-05.md` (huit flux, banc de 30 mesures exécutées), arbitré par toi : une échelle disparue ne fait plus enregistrer un zéro (l'enregistrement refuse et nomme l'échelle ; ton stock se MESURE avec `scripts/diagnostic-697-zeros-sans-echelle.js`, rien n'y est réparé) ; effacer les codes ou les mots d'un critère algorithmique efface aussi son résultat, la note bouge et le PDF ne dit plus « 0 erreur → 87,5 % » ; rouvrir une copie et changer un niveau : l'enregistrement automatique et le bilan lisent la même source que le calcul. Six constats inscrits (#700 à #706 : le trou entre deux bornes entières, « -- » en base, le type déclaré à la grille, zéro code, la grille rééditée, la pratique de notation qui compte les brouillons), à trancher après le 14 ou renvoyés au second audit. **Vérifié comment** : spec WebKit `evaluation-699-…` ROUGE avant le correctif dans le flux réel (base `c3 = I` sous 95) et verte après ; trois sentinelles (28 cas) break-testées, chaque fichier corrigé remis à HEAD → rouge, restauré à empreinte identique ; Vitest 473 fichiers verts depuis `tests/`. ⮕ **Ce que tu dois aller voir** : ouvre une copie dont la grille n'a pas d'échelle et clique Enregistrer → refus « Échelle introuvable » qui nomme l'échelle, rien d'écrit ; sur une copie avec des codes saisis, efface-les → la note bouge tout de suite et le PDF ne dit plus « 0 erreur ».

▣ **ÉPROUVÉ PAR GRÉGOIRE, à l'écran, le 5 septembre en fin d'après-midi** : les trois gestes laissés par Claude Code — la copie dont la grille n'a pas d'échelle (refus nommé, rien dans la liste), les codes effacés sur un critère algorithmique (la note passe à « -- », le critère nommé dessous), la copie rouverte dont on change un niveau (liste et Bilan suivent). Ses mots : « Ça fonctionne. » Relecture croisée de Cowork sur `d3111feb` : rien à corriger ; une réserve inscrite dans le rapport (G-2, source unique « en bloc » prouvée sur une grille holistique seulement). Le refus « Échelle introuvable » sans brouillon est confirmé par Grégoire.

↻ **5 septembre 2026, 16 h 50 — la NOTE DU COURS a été auditée à son tour (second audit cadré), et elle est juste sur le nombre principal des quatre familles ; trois choses ne tiennent pas, rien n'est corrigé.** Rapport `Rapports/AUDIT-pratique-de-notation-2026-09-05.md` (huit flux, banc de 46 mesures, quatre élèves de banc dont chaque nombre est calculé à la main avant le code), branche d'audit non poussée : **tu arbitres.** Ce qui marche : les deux systèmes de calcul donnent la même note (sommative 86,57, standards 79,45, spécifications 70, dénotation 78) et l'export dit ce que le profil dit ; une reprise remplace, la retirer restaure ; une dénotation sans jugement sort « non constructible », jamais 0. Ce qui ne tient pas : **une pratique par spécifications configurée dans l'application rend 0 % à toute la classe** (elle écrit des « forfaits », le moteur ne lit que des « tableBundles », rien ne traduit) ; **un 0 qui a l'air d'un résultat sort de l'export** quand les indices n'ont pas encore été calculés pour un élève (premier calcul d'un trimestre, élève ajouté) ; et le brouillon « 95 sur la moitié de la grille » compte 95 dans les trois familles qui calculent — ça, c'est ta règle à dire (déjà inscrit). Autour : deux replis différents pour un groupe sans pratique, un identifiant d'avant qui calcule avec des défauts, le panneau du profil qui annonce « 3 meilleurs » quand la pratique dit 4 et écrit dans les données à chaque affichage, la dénotation qui reçoit un niveau « M » par la règle des standards, le jeton de délai compté deux fois après une reprise, une clé de jetons hors trimestre. Deux « corriger maintenant » proposés (les spécifications, le zéro du premier calcul), le reste à inscrire — ton arbitrage, après ou avant le 14. Les deux passes automatiques d'avril-mai (`ultrareview-lot-3-indices.md`, `ultrareview-lot-4a-evaluation.md`) portent maintenant une disposition par constat : sur trente et un, treize périmés, cinq refusés, treize tenus. **Vérifié comment** : `cd tests && npx vitest run unit/audit-pratique-de-notation-2026-09-05.test.js` — 46 verts ; sept break-tests par mutation d'un point sur les golden masters (sommative, standards par les deux chemins, spécifications, hybride, dénotation, simulation) — chacun rougit au bon endroit, restauré à empreinte identique ; suite complète 474 fichiers / 5 309 tests verts. ⚠ Pas de navigateur, pas tes données : les nombres viennent d'élèves de banc. ⮕ **Ce que tu dois trancher** : (1) y a-t-il un collègue en spécifications à la mi-septembre ? Si oui, le moteur doit lire ses forfaits avant le 14 ; (2) le zéro du premier calcul se corrige en deux lignes ; (3) la règle du brouillon (#706). *(constats du rapport ; #465, #483, #590, #701 recoupés ; #482 proposé périmé)*

↻ **5 septembre 2026, soirée — ARBITRÉ PAR GRÉGOIRE ET LIVRÉ (1.122.0, build `0905-1722`, poussée `12b88c6e`, run GitHub `33994473211` VERT jusqu'au bout — Vitest et Playwright WebKit sur le serveur, le premier depuis 1.120.0) : un brouillon n'entre plus dans la note du cours, une pratique par spécifications configurée dans l'application calcule, et plus aucun « 0 » ne sort comme un résultat.** Trois gestes en un lot, sur les quatre familles et les deux systèmes de calcul. **La règle, dans ses mots** : une évaluation NON verrouillée (brouillon de l'enregistrement automatique, reprise pas encore réévaluée, copie déverrouillée) ou dont la portée est incomplète n'entre pas dans la note ; le profil et l'export disent combien ont été écartées — « 2 évaluations en brouillon, non comptées » (ses mots) et « 1 évaluation sans aucun critère évalué, non comptée » (les miens, pour la copie enregistrée sans aucun critère : **à valider par lui**). Les spécifications : le moteur lit maintenant les « forfaits » que le gabarit et l'éditeur écrivent, et « Examen » ou « Projet » s'apparient aux productions du même type ; rien n'est réécrit dans les pratiques de personne (une sonde, `scripts/diagnostic-708-spe-forfaits.js`, MESURE le stock) ; ce que l'assistant écrit, sans forfaits, reste « non constructible » — plus jamais 0. Le zéro du premier calcul : une sommative ou une spécification configurable calcule dès le premier appel, et un cache vide rend « non constructible ». Les douze constats moyens, quatre mineurs et quatre indices A/C sont inscrits (#710 à #729) ; #482 périmé ; les deux ultrareviews de mai fermées avec leurs numéros. **Vérifié comment** : `cd tests && npx vitest run unit/sentinelle-706-brouillons-hors-de-la-note.test.js unit/sentinelle-708-spe-forfaits-calculent.test.js unit/sentinelle-709-cache-vide-rend-null.test.js` — 23 cas, chaque sentinelle rougie par mutation de son correctif puis restaurée à empreinte identique ; les deux bancs d'audit passés aux valeurs d'après (l'avant en commentaire) ; suite complète depuis `tests/` verte. ⚠ Deux conséquences nommées, pas éprouvées à l'écran : une reprise pas encore réévaluée ne compte pas (ni son originale) tant qu'elle n'est pas enregistrée ; une copie enregistrée SANS aucun critère (0 sur rien) ne pèse plus 0 dans une moyenne sommative — un « non remis » qui doit compter 0 se note. ⮕ **Ce que tu dois aller voir** : le profil d'un élève dont une copie est en brouillon (ouverte, non enregistrée) — la note du cours est celle SANS ce brouillon, et la ligne « 1 évaluation en brouillon, non comptée » est sous « Performance globale (P) » et sous la note finale de session ; puis une pratique par spécifications créée depuis « Partir d'un modèle » › « Modèle simple », assignée à un groupe dont les productions sont de type Projet et Examen : une note qui n'est pas 0 (le forfait atteint : 90, 70, ou 50 si aucun). *(#706, #708, #709 livrés ; #710-#729 inscrits)*

⮕ **La série d'audits, pour ne pas la perdre de vue** (5 septembre, 16 h 30) : **trois audits cadrés**,
dans `Rapports/prompts-audit/`, tenus dans `plans de travail/00-CADRAGES-OUVERTS.md` (section « La
série d'audits cadrés »). Le 1, le moteur d'évaluation : **fait, fermé, ses trois correctifs livrés et
vus par Grégoire** (1.121.0). Le 2, la pratique de notation (la note du cours) : **prêt, à lancer**. Le 3,
l'onglet Suivi (dépistage, présences, interventions, volet confidentiel) : **prêt, à lancer après le 2** ;
c'est l'onglet qui n'avait jamais été audité. Chaque rapport se ferme constat par constat, dispositions
arbitrées par Grégoire.

---

## LE SUIVI — ce que le troisième audit cadré a mesuré, et ce qui en est corrigé le soir même (1.123.0)

*Section ouverte le 5 septembre 2026 au soir : l'onglet Suivi (présences, dépistage, interventions, volet confidentiel) n'avait jamais été pris pour objet, et c'est lui que l'orthopédagogue de la cohorte 1 lira. Il a sa propre section parce que ses défauts ne sont pas ceux de l'évaluation : la note du cours est juste (audits 1 et 2) ; c'est ce que le Suivi en fait qui ne l'est pas toujours.*

↻ **5 septembre 2026, 19 h 45 — L'ONGLET SUIVI A ÉTÉ AUDITÉ (troisième audit cadré), la chaîne est juste quand rien ne la dérange, et quatre choses la font mentir ; rien n'est corrigé : tu arbitres.** Rapport `Rapports/AUDIT-onglet-suivi-2026-09-05.md` (huit flux, banc de 42 mesures, quatre élèves de banc dont chaque palier et chaque indice est calculé à la main avant le code — l'assidu qui progresse, l'absent qui régresse, celui qui n'a rien remis, l'incohérent). **Ce qui marche** : pour l'assidu et l'absent, chaque écran — carte RàI, suivi des fondations, cible, contexte, Suivi du groupe, Liste — rend le palier attendu (niveau 1 « Stable » ; niveau 3 « Difficulté persistante », défi Structure), et tous lisent les mêmes fonctions ; les six constats de mai sur la saisie des présences sont corrigés ; la consolidation lit le repère de maîtrise de ton échelle ; **le volet confidentiel ne sort dans aucun flux du Suivi** (rapport, archives, consolidation, export, PDF, graphiques, console : cherché partout, rien). **Ce qui ne tient pas — quatre « corriger maintenant » proposés** : (1) **une reprise compte deux fois dans le dépistage** — la note du cours remplace l'originale, mais la performance des trois derniers travaux, l'IPB, les moyennes par critère et le défi comptent l'originale ET la reprise ; l'élève qui a repris et réussi reste « niveau 3 » (sept fonctions, un filtre manquant) ; (2) **« Non-participation, niveau 3 » pour toute la classe au retour de la première séance, avant le premier travail** — et pour un élève à zéro donnée dès qu'un écran du Suivi a été ouvert, parce qu'une assiduité sans séance vaut 100 % ; l'orthopédagogue verrait une classe entière en palier intensif ; (3) **le rapport du profil ne se génère pas** depuis le 18 mai (une fonction non exportée : le bouton écrit un message d'erreur), et quand on le fait parler, ses nombres ne sont pas ceux du profil (« 75 % » là où la note dit 77, « 0 remises / 0 productions ») ; (4) **les observations d'une intervention entrent dans la page sans échappement** (règle 1 de `CLAUDE.md`, une ligne). Autour, à inscrire après le 14 : le brouillon compte comme remis et comme artefact du dépistage (#706 s'arrête à la note du cours) ; un « non remis » à 0 compte comme remis pour la complétion sommative (cadrage « non remis par famille ») ; les courbes P des archives sont la moyenne du groupe pour tout cours sommatif (élargit #716) ; un élève arrivé en semaine 6 porte cinq absences ; un critère SOLO « Aucun » reste un défi ; deux paliers sur le même profil (la carte RàI par les seuils, le suivi des fondations par la matrice) ; les interventions ne portent pas leur groupe-cours ; la liste des cinq élèves suivis est une clé nue vidée à chaque changement de groupe ; deux « moyenne A » sur deux écrans ; le mode anonymisation n'anonymise pas le volet confidentiel ; les seuils d'alerte A-C et les lettres du bilan d'intervention sont écrits en clair. #551 (deux définitions de la maîtrise) est mesuré, pas redécouvert : sur une échelle à trois paliers, la consolidation dit « consolidé » et la carte RàI « niveau 2 » pour le même élève. **Vérifié comment** : `cd tests && npx vitest run unit/audit-onglet-suivi-2026-09-05.test.js` — 42 verts ; quatre break-tests par mutation d'un point dans `js/` (le filtre des remplacées, le filtre par élève des archives, l'export du rapport, la règle « Non-participation ») : **chacun ne rougit que ce banc** — aucune sentinelle existante ne verrouille ces comportements ; chaque fichier restauré à empreinte identique ; suite complète 478 fichiers / 5 374 tests verts depuis `tests/`. Les dispositions manquantes des deux rapports antérieurs (`ultrareview-lot-6-travaux-saisie.md` N1-N6, `AUDIT-decouplage-…-2026-08-27.md` §5.3, §8, §9) sont écrites dans leurs fichiers. ⚠ Pas de navigateur, pas tes données : des élèves de banc. ⮕ **Ce que tu dois trancher** : les quatre « corriger maintenant » avant le 14 (le rapport du profil et la reprise comptée deux fois touchent ce que l'orthopédagogue lira) ; le reste après le 14, avec #700-#705 et #710-#721.

↻ **5 septembre 2026, 20 h 45, puis la nuit pour les deux runs — ARBITRÉ PAR GRÉGOIRE ET LIVRÉ (1.123.0, build `0905-2025`, commit `507b7229` à 20 h 25, poussé vers 20 h 40 ; run GitHub `34001941420` VERT sur Vitest, ROUGE sur Playwright WebKit à cause de la spec neuve du rapport et non du code ; spec corrigée `c4ac5ae3`, run GitHub `34009795798` : Vitest vert, Playwright WebKit `failure` par une perte de la machine GitHub après 220 tests verts sur 264 (aucun rouge), au moment où cette spec, la 221e, devait s'imprimer : elle n'est ni prouvée ni infirmée par ce run ; le relancer est ta décision) : les quatre choses qui faisaient mentir le Suivi sont fermées, plus une cinquième ajoutée par Cowork.** Cinq gestes, un commit chacun (`1e8a1d72` → `00f82b28`, 19 h 54 → 20 h 07), une seule livraison à la fin, après son coup d'œil et le feu vert de la relecture croisée de Cowork à 20 h 15. (1) **Une reprise remplace aussi dans le dépistage** : le suivi des fondations, la performance des trois derniers travaux, les moyennes par critère et le défi principal ne comptent plus l'originale ; l'élève qui a repris et réussi n'est plus lu au palier de sa première copie. (2) **« Non-participation » seulement quand un travail est dû et qu'une copie du groupe est évaluée** (ta règle, au mot) : au début d'un trimestre, la carte RàI, la cible d'intervention, la barre RàI du groupe et l'alerte disent « En attente » tant qu'il n'y a rien à remettre ; le cas fondé reste niveau 3. (3) **Le bouton « Rapport » d'un profil produit un rapport**, et ses nombres sont ceux du profil : « Performance : 77% (note du cours) » (phrase que tu as validée), puis la liste des évaluations qui comptent dans la note, la reprise et non l'originale. (4) **Les observations d'une intervention et deux champs du volet confidentiel sont échappés** avant d'entrer dans la page. (5) **Les courbes de performance des archives sont celles de l'élève**, plus la moyenne du groupe ; ⚠ les captures déjà faites gardent leur valeur (tarir n'est pas réparer), la prochaine écrit la bonne. Une réserve de la relecture de Cowork, inscrite sous #731 et à trancher avec #737 : un seul brouillon commencé dans le groupe suffit à rendre la classe « jugeable ». Le reste de l'audit est inscrit, à trancher après le 14 (#735 à #753). **Vérifié comment** : `cd tests && npx vitest run unit/sentinelle-730-reprise-hors-du-depistage.test.js unit/sentinelle-731-non-participation-quand-un-travail-est-du.test.js unit/sentinelle-732-rapport-du-profil-dit-ce-que-le-profil-dit.test.js unit/sentinelle-733-regle-1-observations-et-attributs.test.js unit/sentinelle-734-snapshots-p-de-l-eleve.test.js` — 21 cas, chaque sentinelle ROUGE sur le code d'avant, puis break-testée en retirant le correctif d'un site à la fois (dix-sept mutations, dix-sept rouges, fichiers restaurés à empreinte identique) ; spec WebKit `profil-rapport-732-se-genere` ROUGE avant (« Can't find variable: obtenirDetailsAssiduite »), VERTE après ; le banc d'audit passé aux valeurs d'après (l'avant en commentaire) ; suite complète 483 fichiers / 5 395 tests verts depuis `tests/` ; verdict Playwright local vert sur `507b7229` (0 échec ; les quatre mêmes instables qu'à 1.122.0, #685) ; relecture croisée de Cowork sur les cinq commits, rien à corriger ; **sur le serveur GitHub (WebKit)**, le rapport du profil s'est généré en entier (l'instantané de la trace le montre : Camille Roy, complétion 100 %, performance 70 %, les deux copies) — la spec le lisait entre deux rendus du profil, corrigée sans toucher au code (le triple rendu à l'ouverture d'un profil est inscrit, #754). ▣ **ÉPROUVÉ PAR GRÉGOIRE, à l'écran, le 5 septembre en soirée, avant la release** (source : le brouillon de clôture de la session du lot, 20 h 45, retrouvé sur le Mac le 6 au matin) : le Suivi du groupe — la barre RàI et la carte Contexte disent « En attente », plus personne en « Non-participation » tant qu'aucune copie n'est évaluée ; le profil d'un élève › bouton « Rapport » — un rapport s'écrit, et son P est celui du haut du profil. Ses mots : la phrase du rapport « validée telle quelle (les deux formes) » — « Performance : 77% (note du cours) » et « non constructible (…) » —, le titre du changelog aussi. ⮕ **Ce qui reste à aller voir, sur tes données** : un profil dont l'élève a repris un travail et l'a réussi — la carte RàI ne le tient plus au niveau de sa première copie. *(#730 à #734 livrés ; #735 à #754 inscrits)*

---

↻ **6 septembre 2026, matin (Claude Code) — CINQ RETOURS DE GRÉGOIRE, CORRIGÉS LE MATIN MÊME : 1.123.2 À 1.123.6 EN LIGNE**
(builds `0906-0745`, `0906-0821`, `0906-0842`, `0906-0902` et `0906-1016`, commits `ddc94fcf`, `43c6cc6d`, `4f0e836a`, `aea9d144` et `126b41ce`, chacun poussé
après un verdict Playwright local vert au jeton ; runs serveur `34035446544` (1.123.5, 9 h 51), `34037433494` (relais) et `34039237638` (1.123.6, 10 h 52) VERTS de bout en bout,
les trois runs précédents annulés par le push suivant).
· ✅ **Dans le profil d'un élève, la vignette d'un travail (« Travaux soumis ») ouvre la copie** — elle menait à une page vide :
  l'onglet Annoter et évaluer s'activait sans que la section Évaluations s'affiche (le geste ne basculait que la sous-section,
  depuis la refonte du 18 février), et l'ouverture entrait en course avec l'initialisation du module. Le geste arrive d'abord,
  puis ouvre (1.123.2, #761).
· ✅ **« Appliquer au cours actif » assigne vraiment la pratique au groupe-cours** — depuis le 11 juin, le bouton n'appliquait
  que les réglages et disait « appliquée » ; le groupe-cours restait sans pratique (`pratiqueId` vide chez Grégoire, champ 6 vide,
  pas de badge), tout calculait en sommative par repli, et le profil parlait d'une pratique « introuvable ». Le bouton assigne, la
  barre latérale marque « Active », le profil dit « aucune pratique assignée » quand c'est le cas, et une pratique adoptée depuis
  un modèle sommatif n'est plus refusée pour une échelle qu'elle n'a pas (1.123.3, #762).
· ✅ **Le Cadre montre la pratique que tu viens d'appliquer, et le badge « Active » se lit comme un état** — le formulaire du
  groupe-cours ne se remplissait qu'au chargement de la page (l'initialiseur que la navigation appelle à chaque affichage avait été
  retiré comme « code mort » le 22 mai) ; il relit tes données chaque fois qu'il s'affiche (1.123.4, #763).
· ✅ **« Copier tout » livre la rétroaction entière, même sans cartouche** — sur sa grille à un seul critère algorithmique et sans
  cartouche, la générale restait sur son texte d'attente et le collage ne portait que la spécifique et le bilan ; chaque phrase de la
  spécifique était coupée à 120 caractères, à l'écran comme dans le collage. La générale s'écrit avec ou sans cartouche, la
  spécifique porte les textes entiers (1.123.5, #764). Le collage sans sauts de ligne, visible dans le même exemple, reste #759
  (inscrit, non corrigé sur sa décision du matin).
· ✅ **Dans la barre d'annotation, le sélecteur de production se lit en entier** — « Portrait de lecteur/lectrice (28) » était
  coupé au milieu des lettres : le bloc de styles d'index.html, chargé après la feuille principale, imposait à cette boîte de 28 px
  un padding de champ de formulaire. La règle du sélecteur porte le sien (1.123.6, #765). Le même doublon rabaisse 13 autres classes
  sans couper de texte : inscrit #766, à voir à l'écran (le retirer change bordure et padding de tous les contrôles).
**Vérifié comment** : chaque retour reproduit AU CODE puis AU NAVIGATEUR avant correction (specs WebKit
`profil-travaux-761-…`, `pratiques-762-…` et `cadre-763-…`, rouges avant, vertes après — la deuxième a attrapé un troisième défaut que
le banc Vitest ne voyait pas), sentinelles rouges avant / vertes après (dont `sentinelle-764-…`, 3 cas, et `sentinelle-765-…` qui parse la cascade réelle), treize
break-tests rouges avec témoin, Vitest 5 427 verts ; #765 reproduit puis remesuré DANS SON CHROME (application entière servie en local,
10 px de contenu avant, 26 après, capture) ; le
second diagnostic a été tranché par les données de Grégoire (deux captures, un dump console sans donnée d'élève), pas par supposition.
⏳ **Dû à Grégoire sur 1.123.3** : Conception › Pratiques › sa PAN-STD › « Appliquer au cours actif », une fois — son assignation est
vide et le correctif ne réécrit pas son groupe-cours ; puis le profil d'un élève calcule.

↻ **6 septembre 2026, 11 h 10 (Claude Code, worktree) — LES SIX SOUS-ONGLETS DE SUIVI ONT ÉTÉ AUDITÉS UN PAR UN (quatrième audit cadré : ce que l'écran montre, ce que chaque geste fait, ce que chaque écriture laisse en base), rien n'est corrigé : tu arbitres.** Rapport `Rapports/AUDIT-sous-onglets-suivi-2026-09-06.md`, banc `tests/unit/audit-sous-onglets-suivi-2026-09-06.test.js` (34 mesures), 36 captures WebKit locales hors dépôt.
· ⚠ **Six choses à corriger maintenant, proposées en une page (§0)** : le mode anonymisation **plante** sur tout trimestre sans mapping (démo, A2026 — une variable jamais déclarée dans `modes.js`, depuis le 22 février) ; le bouton « Annuler » de la saisie des présences vide l'onglet Suivi et le bouton « Rapport » PDF disparaît dès qu'une date est choisie ; le titre et la description d'une intervention, et le nom d'un élève dans la modale du tirage, entrent bruts dans la page (règle 1) ; confirmer un import CSV écrit les élèves puis plante sans confirmation ; enregistrer une intervention efface les notes des élèves décochés et retire les participants d'un autre groupe-cours.
· Le reste est « inscrire » ou « commenter », section par section : douze clés nues (la liste suivie **purgée en base** quand on consulte un autre groupe-cours, le verrouillage de date partagé entre tous les cours et trimestres, l'état du tirage et la banque de questions partagés d'un trimestre à l'autre) ; un tri « # » qui ne fait rien, des DA triés comme du texte, des abandons absents du tableau contre ce que dit l'écran, une recherche qui ne trouve pas « Cesaire » ; une démo qui affiche « Configuration incomplète » dans la saisie jusqu'au rechargement, sans intervention ni question flash, et sans grille de référence (520 avertissements) ; 58 contrôles trop petits pour un doigt sur iPad.
**Vérifié comment** : 34 mesures exécutées sur le code réel (le geste réel, la clé réelle, le rechargement = window neuf sur le même stockage), trois break-tests rouges puis restaurés (dont un refait après une mutation non appliquée), cinq sondes navigateur — la première sonde de rechargement effaçait le stockage et faisait ré-amorcer la démo, ce qui donnait un faux « retour en arrière » ; refaite proprement, l'écriture survit. Vitest 491 fichiers / 5 459 verts. Rien dans `js/`.

↻ **6 septembre 2026, 11 h 45 (Claude Code) — LES SIX « CORRIGER MAINTENANT » SONT LIVRÉS EN UN LOT : 1.123.7 EN LIGNE** (build `0906-1108`, commit `a3909b23`, arbitrage de Grégoire relayé par Cowork à 10 h 57).
· ✅ **Le mode anonymisation fonctionne sur un trimestre neuf** (démo, A2026) : une variable jamais déclarée faisait échouer chaque lecture des élèves depuis février (#767).
· ✅ **Dans la saisie des présences, « Annuler » ramène à la liste et « Rapport » reste là** une fois la date choisie (#768).
· ✅ **Le titre et la description d'une intervention, et les noms de la modale du tirage, entrent échappés** — règle 1 (#769, #770).
· ✅ **Confirmer un import d'élèves le dit** : « N étudiant(s) importé(s) — M au total dans le groupe », au lieu d'une erreur silencieuse après l'écriture (#771).
· ✅ **Enregistrer une intervention ne détruit plus ce que le formulaire n'a pas montré** : la note d'un élève décoché reste, les participants d'un autre groupe-cours restent (#772). ⚠ Ta règle « une intervention appartient à un groupe-cours » n'est pas implémentée dans ce lot : mesuré (aucune intervention ne porte de cours, la liste n'est filtrée par rien), c'est #746, un lot à part.
**Vérifié comment** : une sentinelle par correctif (six fichiers, dix cas), sept break-tests rouges puis restaurés à empreinte identique, le banc d'audit repassé aux valeurs d'après sur six mesures, Vitest 497 fichiers / 5 471 verts sur le commit. **Verdict Playwright WebKit local VERT au jeton sur `a3909b23` (code 0, 0 échec connu, 0 instable, rendu 15 h 23 Z / 11 h 23 Toronto, 601 s)** ; push après le verdict, dans l'ordre du §4.5.
⏳ **Dû à Grégoire** : (1) la porte terrain `plans de travail/PORTE-TERRAIN-2026-09-06-interventions-rognees.md` — deux minutes dans la console, lecture seule : ses interventions de l'automne ont-elles perdu des participants avant #772 ? (2) sur 1.123.7, basculer une fois en anonymisation sur A2026 : le premier mapping se crée.

## CE QUI N'APPARTIENT QU'À GRÉGOIRE

Aucune session ne peut trancher ces points à sa place.

↻ **QUATRE POINTS RETIRÉS DE CETTE LISTE LE 3 SEPTEMBRE 2026, tranchés par lui.** La règle
de suppression d'un fichier (tout ce qui touche le couple élève-production), les mots des
messages de suppression, le facteur de normalisation 500 → 600, et le message à la communauté.
⮕ **Les décisions sur l'échelle sont écrites en entier dans
`plans de travail/DECISION-2026-09-03-echelle-remplacement.md`** — remplacement, correction,
recalcul proposé, refus dans un trimestre archivé, et le cas de l'échelle que personne
n'emploie. ⚠ **Ce fichier fait foi ; ne les redemande pas.**
↻ **Tranché le 2 septembre à 11 h 30, et retiré de cette liste : le nom du service
d'aide.** Trois décisions, dans ses mots :
  · Ce que lit un enseignant qui n'a rien réglé : un libellé générique —
    « Centre d'aide du collège », « Services adaptés du collège », et le nom reste
    un réglage qu'il peut remplir.
  · Ce que lit l'ÉLÈVE, dans la phrase du gabarit neuf : « au service d'aide de ton
    collège : … » — on retire « en français », et rien d'autre. Le deux-points reste,
    parce que la préposition voyage avec le nom (« t'inscrire au Passerelle + » ne se
    dit pas).
  · Chez lui : **« Passerelle + »**, qu'il écrira lui-même dans son réglage — le code
    n'écrit pas dans ses données.
- **Les essais à la main** que les tests ne remplacent pas : l'écran réel sur Mac
  et sur iPad.
- **Deux attributions d'idée** inscrites dans le code (« l'algorithme propose, le
  jugement tranche — Voisard »).
  ↻ **TRANCHÉ le 3 septembre 2026** : **la source EST publiée.** Ses mots : *« Le travail de
  Voisard est publié. Il tient un blogue sur Substack, et cette idée d'algorithme et de
  jugement personnel est dans l'une de ses chroniques. »*
  ⮕ **Donc elle se cite en règle — elle ne part pas.**
  ⏳ **Ce qui reste, et ce n'est pas urgent** : retrouver LAQUELLE des chroniques. *« Il faudra
  faire une recherche pour la retrouver, mais ce n'est pas le bon moment. »*
  ⚠ **Ne pas retirer les attributions en attendant** : une mention imprécise vaut mieux qu'une
  idée empruntée sans nom. Question d'honnêteté intellectuelle, pas de code.
↻ **Le message à la communauté de pratique** sur l'adresse unique : **fait**, le
3 septembre.

⮕ **Il ne reste donc qu'UN point sur cette liste : les essais à la main.** ▣ **Et c'est
celui qui a le plus payé** : le 2 et le 3 septembre, son coup d'œil à l'écran a trouvé
**trois** défauts que 4760 essais verts, deux relectures croisées et une suite de navigateur
complète avaient tous manqués — un brouillon perdu au refus, des critères créés sans
identifiant, et une fenêtre de suppression qui ne nommait pas sa grille.

↻ **Retiré de cette liste le 2 septembre** : les identifiants du code qui portent un
prénom de collègue. **Il a tranché — ils partent tous** — et la mesure a montré que
le retrait ne coûte rien : les huit identifiants d'échelles sont inertes, aucune
écriture dans les données de personne n'est nécessaire. *(#690)*

---

## CE QU'ON NE SAIT PAS, ET QUI COMPTE

⚠ **Des utilisateurs sont DÉJÀ dans l'application. Combien : inconnu.**
Le trafic n'est mesuré ni sur Netlify ni sur Cloudflare. On ne sait pas s'il y en
a un, vingt, ou aucun aujourd'hui.

↻ **1er septembre au soir — on sait maintenant POURQUOI on ne sait pas.** L'application
est servie à **deux adresses**, et une seule a une porte : `app.codexnumeris.org` passe
par Cloudflare Access, mais le domaine Netlify par défaut sert la même application,
complète, **sans aucune authentification**. Netlify compte les deux, Access une seule.
Ce n'est pas une fuite — l'application est locale d'abord, ce visiteur n'obtient qu'un
espace vide. Mais la porte ne compte pas ce qu'on croit. ⮕ **Redirection à l'ordre du
jour du 2 septembre.**

⮕ **Ce que ça change pour toute session** : on ne développe plus « avant les
utilisateurs ». Un défaut livré est un défaut que quelqu'un rencontre peut-être
déjà. Un enseignant de littérature, hors communauté de pratique, a signalé un
bug ; il a été corrigé. C'est la preuve que la porte est ouverte et qu'elle sert.

⮕ **La communauté de pratique Labo Codex se réunit le 14 septembre 2026.** Ce
n'est pas la date où les utilisateurs arrivent : c'est la date où ils se parlent.

---

## COMMENT CE FICHIER SE MET À JOUR

1. Une ligne passe à **Fait** seulement avec la phrase « vérifié comment ».
2. Une ligne ne quitte **Jamais vérifié** que par un passage réel dans l'écran,
   pas par une lecture de code.
3. Les huit gestes viennent d'`OBJECTIF-COHORTE-1.md`, arrêté par Grégoire. **Ce
   fichier-ci ne les amende pas** : il les traduit et les date.
4. Si un état change et que ce fichier ne bouge pas, c'est ce fichier qui a tort.
