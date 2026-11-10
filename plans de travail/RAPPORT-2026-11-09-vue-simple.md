# Rapport — lot « Vue simple »

Consigne de Cowork du 9 nov. 2026, 17 h 40. Branche `lot/vue-simple`, partie de `origin/lot/tableau-de-notation-1-bis` (`b6d5926`). Session cloud, Chromium seulement.

> **État : lot livré sur la branche `lot/vue-simple`, à juger le 11 novembre.** Rien n'est fusionné, `main` n'est pas touché, aucune release, rien au changelog. **En tête : le relais de 21 h 42 (paliers, un texte, les essais durcis), puis la troisième livraison (seuils, mise à jour, colonnes), puis la seconde (la pratique se règle), puis la liste de travail, puis la première livraison, puis la mesure d'avant le code.**

---

## 10 NOV., 13 H 20 — LA LISTE DE LÉA, COLLÉE TELLE QUELLE (sur `main` local, rien de poussé)

Défaut vécu par Grégoire à son essai (12 h 42) : la liste exportée de Léa, collée dans « Ta classe », rendait « Aucune ligne lue » et 28 lignes refusées (« le DA doit compter 7 chiffres »). Cause : la vue simple découpait la ligne elle-même et ne retirait pas l'écriture `="…"` ; le DA lu était `="2600001"`, refusé. Aucun nom réel ici ni dans les bancs.

### Ce qui change à l'écran

1. **Coller la liste de Léa telle quelle crée la classe.** Valeurs `="…"` ou entre guillemets, point-virgule, tabulation ou virgule, point-virgule final, lignes vides : rien à nettoyer.
2. **La ligne de titres est reconnue et sautée ; les colonnes se prennent par leur titre** (DA, nom, prénom, dans n'importe quel ordre), les autres sont ignorées (groupe, programme, services adaptés). Sans titres, lecture par position comme avant ; « DA, nom, prénom » marche toujours.
3. **« Inactif » : la personne est mise de côté et nommée** sous le message de succès (nom, prénom, DA). La vue étendue n'a pas de règle à l'import (mesuré, voir plus bas) : c'est la supposition de Cowork, **à confirmer par Grégoire**.
4. **Quand aucune ligne n'est lue**, chaque cause est dite une fois, avec son nombre et une ligne en exemple, puis ce qui marche — au lieu de 28 fois la même cause.

### Textes PROPOSÉS (à valider par Grégoire)

- « 1 personne de ta liste a le statut « Inactif » : mise de côté. » / « 3 personnes de ta liste ont le statut « Inactif » : mises de côté. »
- « 28 lignes : le DA doit compter 7 chiffres. Par exemple : *la ligne* »
- « Ce qui marche : une ligne par étudiant·e, « 1234567, Tremblay, Alice », ou ta liste de Léa collée telle quelle. »
- Inchangé, déjà validé : « Aucune ligne lue. Une ligne par étudiant·e : DA, nom, prénom. »

### Mesuré

- **Le lecteur de la vue étendue existait** : `decouperLigneCollee` (`js/trimestre-v2-etudiants.js`), déjà partagé avec Rencontres, retire `="…"` et les guillemets et détecte le séparateur. **La vue simple l'appelle désormais** au lieu de découper elle-même : il n'y a pas de second découpeur. Le repérage des colonnes par leur titre et le statut, eux, n'existaient nulle part : ils sont dans `analyserListeCollee` (`js/vue-simple-donnees.js`).
- **La vue étendue n'a pas de règle « Inactif » à l'import**, et elle lit mal ce format. Vérifié en exécutant `analyserListeEtudiantsCollee` sur une liste de Léa inventée : elle lit par position (DA, groupe, nom, prénom, programme, SA), donc **le statut est rangé dans « programme »** (« Inactif » ou vide), et la personne inactive est importée comme active. **Un « Oui » dans « Services adaptés » est perdu** : la colonne 5 (le programme) est lue à la place. Supposition : la colonne SA de Léa dit « Oui » ; je n'ai pas vu de vraie liste.
- **Le DA de Léa** : `="…"` garde les zéros en tête, et les espaces, y compris insécables, sont retirés (comme avant). Non mesuré : une liste passée par Excel puis réenregistrée. Inférence : un DA commençant par 0, s'il passe par une cellule numérique, arrive sur 6 chiffres ; il est alors refusé avec sa cause, rien n'est inventé.

### La preuve

- Vitest `tests/unit/vue-simple.test.js` : liste de Léa inventée (vingt lignes, une inactive, accents, trait d'union, apostrophe), un essai par séparateur (point-virgule, tabulation, virgule), Léa sans titres, colonnes dans le désordre, causes regroupées. **Vitest complet : 11 350/11 350.**
- WebKit `tests/integration/vue-simple.spec.js`, « la liste de Léa, collée telle quelle » : un essai par séparateur, qui exige la classe créée (19), la personne inactive nommée et absente de la base, les 19 autres inscrites par DA, nom et prénom ; un essai pour le message quand aucune ligne n'est lue. **Fichier entier : 38/38 sous WebKit**, le format simple compris. Un seul navigateur.
- Break-tests :
  - Vitest : le découpage naïf d'avant remis (6 rouges), « Inactif » ignoré (5), les titres ignorés (5), les causes non regroupées (1).
  - WebKit : le découpage d'avant et l'ancien message remis, **4 rouges sur 4**. Code restauré, contrôlé par `cmp`.

### Trouvailles et leur issue

- **La vue étendue lit mal la liste de Léa** (statut dans « programme », SA perdu, inactif importé comme actif). Issue : **inscrire et continuer**. Aucun symptôme vécu ; c'est à Cowork de décider s'il entre au BACKLOG.
- **Dans mon lot, fini** :
  - une classe CSS neuve sans règle (`vs-inactifs`) remplacée par `data-vs-liste` ;
  - la boucle de lecture (complexité 16) coupée en `_parTitre` et `_raisonDuRefus` ;
  - les jetons posés au jour du build (`20261109q`), convention de la sentinelle anti-cache tant que la release n'est pas faite.

### Supposé

- La première ligne non vide est la seule ligne de titres possible.
- Une cellule qui vaut exactement « Inactif » signale l'inactivité. Avec titres, seule la colonne « Statut… » est lue ; sans titres, n'importe quelle colonne autre que le DA, le nom ou le prénom.
- Un DA déjà dans la classe, au second collage, compte comme avant (« y était déjà »).

---

## RELAIS DE 21 H 42 — LES PALIERS, UN TEXTE, LES ESSAIS DURCIS (10 nov. 2026)

Sur les décisions de Grégoire et de Cowork du 9 nov., 21 h 42 à 21 h 43. Le lot à part (un niveau sans seuils, une note au-dessus de 100, en vue étendue) est sur sa branche, `lot/niveau-sans-seuils`, avec son rapport à lui.

### Ce qui est fait

1. **La note d'un palier n'a pas de plafond**, comme la valeur d'un niveau. Le refus dit : « Chaque palier a une note : un nombre, zéro ou plus. » Un palier à 120 donne 120 au tableau et à l'écran Note finale.
2. **Le texte validé par Grégoire est posé, mot pour mot** : « Des productions de ton tableau portent déjà le type « X ». Choisis un autre nom. »
3. **Renommer une production ne renomme pas ses résultats** : rien n'est touché, comme décidé.
4. **Les essais sont durcis** contre les trois causes vues sous WebKit sur le Mac (voir plus bas).

### La phrase validée ne couvre qu'un des deux cas

- **Elle couvre « rattacher »** : on donne à un type un nom que des productions portent déjà (une production de la vue étendue de type « atelier », et un type neuf nommé « Atelier »). « Choisis un autre nom » dit quoi faire.
- **Elle ne couvre pas « détacher »** : on renomme un type auquel des productions tiennent par son nom (le type « Examen », une production de type « examen »). Là, c'est l'ANCIEN nom que les productions portent, et il n'y a pas d'autre nom à choisir : il faut le garder.
- **Pour ce second cas, je propose** (PROPOSÉ, posé dans le code) : « Des productions de ton tableau portent le type « Examen ». Ce nom ne se change pas ici. »

### Ce que j'ai durci, cause par cause

J'ai relu les essais du banc de la vue simple (34 aujourd'hui) avec les trois causes en tête.

| Cause vue sous WebKit | Ce que j'ai trouvé chez moi | Ce que j'ai fait |
|---|---|---|
| Une zone tactile à 43,9 px pour 44 | Mes cibles étaient à 44 px juste ; les petits boutons du réglage à 40 ; le titre d'une colonne à 32 ; « Ajouter des étudiant·es » à 24 | **Tout ce qui se touche en vue simple est à 46 px au moins**, y compris les cases du tableau, les boutons de l'en-tête et les deux menus. Un essai neuf le mesure à 1180 et à 820 px, sur 16 états d’écran |
| Une mesure prise pendant un défilement ou une transition | Aucun de mes essais ne mesurait de position ni de taille. Mes sections apparaissent en 0,3 s : c'est ce qui avait grisé quatre captures | L'essai neuf des tailles **attend la fin de toute animation avant chaque mesure**. Les autres essais ne lisent que des états (un texte, une classe, une donnée) |
| Une page qui recharge pendant une mesure | **Sept rechargements dans cinq essais** : quatre servaient seulement à démarrer sur des données semées ou sur un fichier ouvert | **Six retirés** : ces essais refont le choix de la vue comme au démarrage, sans recharger. **Un essai recharge encore, parce que le rechargement est son sujet** (« au rechargement, celui qui a bâti sa classe en vue simple y reste ») ; il vide les écritures avant, attend l'application après, et ne mesure rien autour |

Ce que ce durcissement ne prouve pas : je n'ai pas WebKit. Les 46 px sont mesurés sous Chromium ; l'arrondi de WebKit reste à constater sur le Mac.

### Les textes neufs de ce relais

- le refus d'une note de palier : « Chaque palier a une note : un nombre, zéro ou plus. » (remplace « de 0 à 100 » ; PROPOSÉ, sur le modèle du refus des niveaux)
- le second cas du nom d'un type : « Des productions de ton tableau portent le type « X ». Ce nom ne se change pas ici. » (PROPOSÉ)
- validé par Grégoire, posé mot pour mot : « Des productions de ton tableau portent déjà le type « X ». Choisis un autre nom. »

### La preuve

- **Vitest** : suite entière, 11 013 essais verts sur 11 013.
- **Playwright Chromium** : banc de la vue simple, 34 essais verts sur 34 ; banc du tableau, 19 sur 19.
- **Break-tests** : 7 défenses retirées. Six essais ont rougi (le plafond des paliers, une note négative, les deux refus de nom, une cible sous 46 px, le texte validé). Le septième est resté vert, et c'était mon code, pas l'essai : deux règles donnaient 46 px aux mêmes boutons, en retirer une ne changeait rien. J'ai retiré la redondance (une seule valeur par règle) ; le break-test voisin, sur le titre d'une colonne, prouve que l'essai mord (il a signalé « 89 × 32 »).
- **Captures** : les 120 refaites, les cibles étant plus hautes de 2 px.
- **Pas de relecture par un agent neuf pour ce relais** : le changement est étroit (une borne, deux textes, des hauteurs, des essais). Je le dis plutôt que de le laisser croire.

---

## TROISIÈME LIVRAISON — LES SEUILS, LA MISE À JOUR, LES COLONNES (10 nov. 2026)

Sur les décisions de Grégoire du 9 nov., 20 h 49 à 20 h 55, et celles de Cowork.

### Ce qui est fait, en gestes

1. **Régler la valeur d'un niveau ne touche plus à ses seuils.** « Étendu » passé de 100 à 95 commence toujours à 85 : une copie à 90 % évaluée avec une grille garde son niveau.
2. **Un niveau peut valoir plus de 100**, sans plafond. Seuls un texte qui n'est pas un nombre et une valeur négative sont refusés. L'aide du réglage dit, mot pour mot : « Chaque niveau a une lettre, un nom et une valeur. La note se construit avec ces valeurs. »
3. **Après un réglage qui change une valeur, l'écran demande** : « N résultats ont été saisis avec les anciennes valeurs. Les mettre à jour ? », avec « Mettre à jour » et « Garder les anciennes valeurs ». S'il y a plus d'un groupe sur la pratique, il le dit.
4. **« Mettre à jour »** donne à ces résultats la valeur d'aujourd'hui ; le signe « ≠ » disparaît de leurs cases. **« Annuler », au tableau, défait tout le lot en un geste.** « Garder » laisse l'état d'avant (le signe, ressaisir).
5. **Le titre d'une colonne la règle** : son nom, sa date, son type (spécifications), et si elle compte dans la note (standards).
6. **Une colonne qui ne compte pas reste au tableau** : son titre est barré, « ne compte pas » est écrit dessous, et la phrase de la règle dit combien comptent (« 4 productions sur 5 comptent. »).
7. **Une colonne ne se retire que vide.** Si elle porte un résultat ou un fichier, l'écran dit combien, n'efface rien, et propose de la marquer « ne compte pas ». Vide, elle part au second geste.
8. **Deux tournures validées** remplacent les accords empilés.

### Ce que j'ai tranché, comme demandé (une ligne chacun)

- **Un niveau ajouté en vue simple n'a pas de seuils, et la conversion d'un pourcentage l'ignore.** Mesuré dans le code de la conversion (`niveauDuPourcentage`) et vérifié par un essai, y compris pour un pourcentage hors de toute plage : il se saisit au tableau, il ne reçoit aucune copie évaluée avec une grille tant que ses seuils ne sont pas donnés en vue étendue. Voir la question 1 : quatre écrans de la vue étendue le lisent mal.
- **Une note au-dessus de 100, mesurée par exécution (un niveau à 110, deux résultats) :** 110 au tableau, 110 à l'écran Note finale, 110 dans le CSV, 110 % au profil, au Suivi et dans la Liste. Rien ne la plafonne, ne la tronque ni ne casse. Une anomalie en vue étendue, non corrigée : voir la question 2.
- **Le négatif reste refusé.** Je ne vois pas de raison de le permettre : aucun calcul de l'application ne retranche, et une valeur négative donnerait une note négative que les barres du Suivi ne savent pas dessiner.
- **La mise à jour ne touche que les résultats saisis au tableau, dans les groupes de la pratique**, et jamais une colonne qui a sa propre échelle (réglée en vue étendue). Elle n'écrit que la valeur.
- **Un geste ne s'annule que là où il a été fait** : une case, dans son groupe ; la mise à jour, depuis un des groupes de la pratique ; jamais depuis la vue étendue. (En vue étendue, la règle d'avant le lot ne change pas.)
- **« Compte dans la note » est le champ de la vue étendue** (« Productions qui comptent dans la note »), donc offert là où le calcul le lit : en standards, sans catégories, sans productions de type artefact, et pas sur la production terminale, qui compte à part. **En spécifications, la marque n'existe pas dans le calcul : elle n'est pas offerte.**
- **Le retrait d'une colonne vide demande un second geste** (mon ajout) : une production venue de la vue étendue peut porter des réglages qu'on ne voit pas ici.
- **Un fichier à la corbeille garde aussi la colonne** : il peut encore être restauré avec sa production. C'est plus strict que la vue étendue.
- **Le type et la date d'une colonne ne sont écrits que s'ils ont été changés** ; une date qui dépend du groupe (réglée en vue étendue) ne se règle pas ici.

### Ce qui attend Grégoire

| # | Question | Recommandation |
|---|---|---|
| 1 | **Un niveau sans seuils est mal lu par quatre écrans de la vue étendue** (lecture du code, non exécutée) : la répartition par niveaux du Suivi y range tous les étudiant·es, l'export PDF imprime « 0 % - 100 % » pour lui, deux graphiques de progression le placent mal. L'éditeur d'échelles de la vue étendue tient les seuils pour obligatoires. La note, elle, n'est pas touchée. | Corriger ces quatre lectures (petit, hors de la vue simple, donc hors de ce lot) avant le 27 ; ou, d'ici là, ne pas offrir « + Niveau » en vue simple. À trancher |
| 2 | **Une note au-dessus de 100 n'est rangée dans aucun niveau par la répartition du Suivi** (vu à l'exécution : « Étendu : 0 » pour une étudiant·e à 110 %). Lu dans le code, non exécuté : le partage d'une échelle borne la valeur d'un niveau à 100 et signale un problème ; un graphique de progression plafonne. | Même lot de corrections que la question 1, en vue étendue |
| 3 | **Renommer une production ne renomme pas ses résultats** : ils gardent l'ancien nom, qui se lit dans la Liste et dans des rapports. La vue étendue fait pareil aujourd'hui. | Défaut d'avant le lot, exposé par le geste neuf ; à inscrire par Cowork |
| 4 | **Les textes neufs** ci-dessous, dont la question de mise à jour. | À valider un à un |

### Les textes neufs de cette livraison (PROPOSÉS, sauf mention)

Écran « Pratique », après un réglage de niveaux :
- la question (proposée par Cowork) : « N résultats ont été saisis avec les anciennes valeurs. Les mettre à jour ? » ; au singulier : « 1 résultat a été saisi avec les anciennes valeurs. Le mettre à jour ? »
- sa suite, s'il y a plus d'un groupe : « Ils sont dans les N groupes qui ont cette pratique. »
- les deux boutons (proposés par Cowork) : « Mettre à jour », « Garder les anciennes valeurs »
- la confirmation : « N résultats mis à jour. « Annuler », au tableau, les remet comme avant. »
- le refus d'une valeur : « Chaque niveau a une valeur : un nombre, zéro ou plus. » (remplace « de 0 à 100 »)

Au tableau, sur une colonne :
- le titre de la colonne est un bouton ; ce que lit le lecteur d'écran : « Régler la colonne « X » »
- sous le titre d'une colonne écartée : « ne compte pas »
- à la suite de la phrase de la règle (au tableau et sur l'écran Pratique) : « N productions sur M comptent. »

Dans le formulaire d'une colonne :
- la case : « Compte dans la note »
- les boutons : « Enregistrer », « Annuler », « Retirer la colonne »
- le refus : « Cette colonne porte N résultats : elle ne se retire pas. Rien n'a été effacé. » ; avec des fichiers : « … porte N résultats et N fichiers … », « … porte 1 fichier … »
- la proposition, sous le refus : « La marquer « ne compte pas » »
- la question du retrait d'une colonne vide : « Retirer la colonne « X » ? Elle ne porte aucun résultat. », et son bouton « Retirer »

Validés par Grégoire, posés mot pour mot :
- « Aucune ligne lue. Une ligne par étudiant·e : DA, nom, prénom. »
- « N étudiant·es de plus dans ta classe. N y étaient déjà. » (au singulier, que j'ai dû choisir : « 1 étudiant·e de plus dans ta classe. 1 y était déjà. » ; sans doublon, la seconde phrase ne paraît pas)
- « Chaque niveau a une lettre, un nom et une valeur. La note se construit avec ces valeurs. »

**Les autres textes où « étudiant·e » forçait un accord : il n'y en avait pas d'autre.** Un essai lit tous les mots de la vue simple et n'y admet aucun mot à point médian autre que « étudiant·e » et « étudiant·es » ; il passe. (Les mots du tableau lui-même, validés le 9 nov., ne sont pas de ce lot.)

### Ce que je n'ai pas pu vérifier

- WebKit, Safari, l'iPad, le toucher ; la suite Playwright entière ; les données réelles de Grégoire.
- Les quatre lectures de la question 1 et deux des trois de la question 2 sont lues dans le code, pas exécutées.
- La mise à jour dans un trimestre clos ou en anonymisation : elle passe par l'écriture commune de l'application, sans essai à elle.

### La preuve

- **Vitest** : suite entière, 11 013 essais verts sur 11 013. Banc du lot : 46 essais.
- **Playwright Chromium** : banc de la vue simple, 31 essais verts sur 31 ; banc du tableau, 19 sur 19.
- **Les essais demandés :**
  - « Étendu » passé de 100 à 95 : ses seuils restent 85 à 100, et la conversion rend « Étendu » à 90 % ;
  - la mise à jour : le compte exact (2, la copie évaluée avec une grille ne compte pas) ; seule la valeur change ; aucun résultat créé ni effacé ; la copie avec grille est identique ; « Annuler » rend l'empreinte d'avant ;
  - la note à la main : (100 + 75 + 65) / 3 = 80 avant ; (100 + 90 + 60) / 3 donne 83 après ; 80 de nouveau après « Annuler » ;
  - « Garder » n'écrit rien ; avec deux groupes, la question compte les deux et le dit ;
  - une colonne écartée reste visible, le dit, et la note suit : (100 + 75) / 2 donne 88 ; le calcul partagé rend la même note ;
  - une colonne pleine ne se retire pas (résultats, fichier, fichier à la corbeille) ; une colonne vide part au second geste, et elle seule.
- **Break-tests** : 35 défenses de cette livraison retirées une à une, 35 essais rougis, code restauré (97 sur les trois livraisons).
- **Relecture par un agent neuf**, sur le commit de cette tranche. Sécurité : rien. Le tableau de la vue étendue : inchangé. Neuf défauts réels, disposition ci-dessous.
- **Captures** : 120 images (30 écrans, 1180 et 820 px, clair et sombre), dont la question de mise à jour (27), le réglage d'une colonne (28), une colonne « ne compte pas » (29), le refus de retirer une colonne pleine (30).

### Les constats de la relecture, et ce qu'ils deviennent

| Constat | Disposition |
|---|---|
| La mise à jour pouvait toucher les résultats d'une colonne qui a sa propre échelle | **Corrigé** |
| Enregistrer une colonne réécrivait son type même sans changement (une production rattachée par son nom perdait le sien) | **Corrigé** |
| « Compte dans la note » offerte sur la production terminale, sans effet | **Corrigé** (non offerte) |
| « Annuler » défaisait un geste d'un autre groupe, ou d'une autre vue | **Corrigé** |
| La question de mise à jour suivait un changement de groupe | **Corrigé** |
| Un retrait refusé à l'instant de l'écriture laissait l'écran muet | **Corrigé** |
| La date d'une production à échéances par groupe était écrasée | **Corrigé** (elle ne se règle pas ici) |
| La mise à jour et son annulation ne vérifiaient pas le niveau du résultat | **Corrigé** |
| Une colonne vide partait au premier clic, avec ses réglages de la vue étendue | **Corrigé** (second geste) |
| Un fichier à la corbeille n'empêchait pas le retrait | **Corrigé** en vue simple ; la vue étendue a la même lacune, à inscrire par Cowork |
| Après une seconde copie d'échelle, les résultats de la première origine étaient perdus de vue | **Corrigé** |
| Un niveau sans seuils et une valeur au-dessus de 100 sont mal lus par des écrans de la vue étendue | **Remonte à Grégoire** (questions 1 et 2) |
| Une production référencée par la carte d'alignement se retire quand même | **Laissé** : même garde que la vue étendue, aucune donnée d'étudiant·e en jeu |
| « N sur M comptent » : l'écran Pratique compte aussi une production diagnostique ou non assignée, que le tableau ne montre pas | **Laissé** : ne touche pas un novice, qui n'en a pas |
| La seconde garde du retrait (relue à l'instant de l'écriture) n'a pas d'essai à elle | **Dit** : la première garde a le sien |

---

## SECONDE LIVRAISON — LA PRATIQUE SE RÈGLE (10 nov. 2026)

Sur les relais de Grégoire et de Cowork du 9 nov., 19 h 35 à 19 h 44. Principe de Grégoire : « Ma pratique ne doit pas être codée en dur. » Règle validée : tout ce qui entre dans la note a une valeur de départ et se règle ; rien ne se règle avant d'avoir une note ; chaque réglage est à un geste, près de la valeur.

### Ce qui est fait, en gestes

1. **Sans ouvrir aucun réglage**, un nouvel arrivant colle sa liste, choisit son modèle, ajoute ses productions, inscrit ses résultats et lit une note. Les valeurs de départ suffisent.
2. **L'écran « Pratique » montre d'abord les valeurs** : la phrase de la règle, les niveaux avec leur valeur ; ou les paliers et les types. À côté de chacune, un bouton « Régler » ouvre son réglage, sur place. « Enregistrer » écrit ce réglage-là ; « Annuler » ne laisse rien.
3. **Au tableau, « Régler » est aussi à un geste** : à côté de la phrase de la règle, et à côté des niveaux (ou des paliers). Il mène au réglage déjà ouvert.
4. **Par standards, les niveaux se règlent** : la lettre, le nom et la valeur de chacun ; on en ajoute, on en retire (deux au minimum), on change leur ordre. La règle arrive sur « Toutes les productions ».
5. **Par spécifications, les types et les paliers se règlent** : un type se renomme, s'ajoute, se retire (un au minimum) ; un palier s'ajoute, se retire, son nom, sa note et ses exigences par type se règlent. Un palier sans exigence est le plancher. « + Production » liste les types de l'utilisateur.
6. **« étudiant·e », « étudiant·es » partout** en vue simple ; la carte 4 porte le texte arrêté, mot pour mot.
7. **La vue voyage avec le fichier** : enregistré depuis la vue simple, il s'ouvre en vue simple sur un appareil qui n'a fait aucun choix. Le choix fait sur l'appareil prime toujours.
8. **Qui a bâti un trimestre en vue étendue**, même sans étudiant·es, arrive en vue étendue.

### Ce que j'ai tranché, comme demandé (une ligne chacun)

- **(A1) L'échelle appartient à la pratique.** Elle naît avec elle, en copie de l'échelle de départ. Une pratique venue de la vue étendue, qui lit une échelle du trimestre, voit cette échelle **copiée au premier réglage, jamais modifiée** ; même chose si l'échelle est lue ailleurs (une pratique dupliquée, une production). Aucune autre pratique ne change.
- **Limite de A1 :** deux groupes qui partagent LA MÊME pratique changent ensemble ; l'écran le dit avant l'enregistrement (« Ce réglage vaut pour les N groupes qui ont cette pratique. »).
- **(A2) Une valeur changée ne réécrit aucun résultat.** Le résultat garde la valeur écrite à la saisie, la case porte le signe « ≠ », la note ne bouge pas ; ressaisir le niveau prend la valeur d'aujourd'hui. Vérifié par un essai, y compris après la copie d'une échelle.
- **(A3) Un niveau inscrit dans un résultat ne se retire pas et ne change pas de lettre.** L'écran dit pourquoi et combien de résultats le portent ; rien n'est effacé, rien n'est écrit.
- **(A4) Le nom de l'échelle : « Mes niveaux »** (proposé). Ni « IDME », ni « de départ ».
- **Les couleurs** : un niveau gardé garde sa couleur ; un niveau ajouté prend la couleur neutre du tableau. Les couleurs ne se règlent pas en vue simple (ligne 19 de la liste).
- ~~Les seuils d'un niveau suivent sa valeur~~ : **supposition renversée par Grégoire le 9 nov. à 20 h 49** ; les seuils ne bougent plus (troisième livraison).
- **Un type porté par une production ne se retire pas** ; un nom de type qui détacherait ou attacherait une production est refusé (certaines productions de la vue étendue tiennent à leur type par son nom).
- **Un seul palier sans exigence, et c'est le plus bas** : sinon, qui n'a rien d'acceptable recevrait la note haute.
- **Une pratique que la vue simple ne sait pas régler sans risque** (échelle embarquée dans la pratique, paliers sous l'ancienne forme, règle à catégories) se LIT en vue simple, avec « se change en vue étendue ». Régler ici écrirait à côté de ce que le calcul lit.

### Ce qui attend Grégoire

| # | Question | Recommandation |
|---|---|---|
| 1 | **Quand la valeur d'un niveau change, ses seuils changent avec elle.** Les seuils servent, en vue étendue, à convertir un pourcentage en niveau quand on évalue avec une grille. Exemple mesuré : « Étendu » passé de 100 à 95 commence alors à 95, et une copie à 90 % avec grille devient « Maîtrise ». | À trancher : c'est le sens d'un niveau. L'autre voie est de ne jamais toucher aux seuils depuis la vue simple |
| 2 | **Changer une valeur ne recalcule pas les notes déjà construites** (le signe « ≠ » le dit, case par case). Qui vient d'un tableur s'attend au recalcul. | Proposer plus tard un geste explicite, « appliquer la valeur d'aujourd'hui aux résultats saisis ». Il écrit dans des résultats : je ne l'ai pas construit |
| 3 | **La liste de travail** (plus bas) : lignes 6 et 7 sont petites et changent la note ; lignes 8 et 9 (la case vide, la moyenne simple) sont codées en dur dans les deux vues. | Choisir sur la liste ce qui entre pour le 11 et pour le 27 |
| 4 | **Le mot du geste : « Régler »** (proposition de Cowork). | Garder |
| 5 | **Les textes neufs** ci-dessous. | À valider un à un |

### Les textes neufs de cette livraison (PROPOSÉS, sauf mention)

Écran « Pratique », lecture :
- le bouton, à côté de chaque valeur : « Régler »
- titres des blocs : « La règle qui construit la note » (déjà proposé), « Tes niveaux », « Tes paliers », « Tes types de productions »
- un palier sans exigence : « aucune exigence »
- sous les blocs, quand la pratique est partagée : « Ce réglage vaut pour les N groupes qui ont cette pratique. »
- quand une pratique ne se règle pas ici : « La règle de cette pratique se change en vue étendue. » (déjà proposé)

Écran « Pratique », réglage ouvert :
- les deux boutons : « Enregistrer », « Annuler »
- niveaux, l'aide : « Chaque niveau a une lettre, un nom et une valeur sur 100. La note se construit avec ces valeurs. »
- niveaux, en-têtes : « Lettre », « Nom », « Valeur » ; gestes : « + Niveau », « Retirer », « Monter », « Descendre » (ces deux derniers sont lus par le lecteur d'écran ; à l'écran, deux flèches)
- types, l'aide : « Chaque production de ton tableau est d'un type. Les paliers comptent les productions acceptables de chaque type. »
- types : « Nom du type », « + Type », « Retirer »
- paliers, l'aide : « Pour chaque palier, sa note et le nombre de productions acceptables qu'il faut, par type. Un palier sans exigence est le plancher. »
- paliers : « Palier », « Note », « + Palier », « Retirer »

Confirmations, sous le titre de l'écran : « Règle enregistrée. » · « Niveaux enregistrés. » · « Types enregistrés. » · « Paliers enregistrés. »

Refus, dans le réglage ouvert :
- « Il faut au moins deux niveaux. »
- « Le niveau « X » est inscrit dans N résultats du tableau : il ne se retire pas. Aucun résultat n'a été effacé. »
- « La lettre « X » est inscrite dans N résultats du tableau : elle ne se change pas. Aucun résultat n'a été effacé. »
- « Chaque niveau a une lettre et un nom. » · « Chaque niveau a une valeur, de 0 à 100. » · « Deux niveaux portent la même lettre. »
- « Il faut au moins un type. »
- « N productions de ton tableau sont du type « X » : il ne se retire pas. Aucune production n'a été touchée. »
- « Chaque type a un nom. » · « Deux types portent le même nom. »
- « Le nom « X » rattacherait ou détacherait des productions de ton tableau : choisis-en un autre. »
- « Il faut au moins un palier. » · « Chaque palier a un nom. » · « Chaque palier a une note, de 0 à 100. »
- « Un seul palier peut n'avoir aucune exigence : c'est le plancher. »
- « « X » n'a aucune exigence : c'est le plancher, sa note doit être la plus basse. »

Au tableau : « Régler », à côté de la phrase de la règle (à la place de « Réglages de la pratique », en vue simple seulement) et à côté des niveaux ou des paliers.

Le nom de l'échelle née avec la pratique : « Mes niveaux » (se lit au tableau : « Échelle « Mes niveaux » : », et en vue étendue dans Conception › Échelles).

Arrêtés par Grégoire, posés mot pour mot : la carte 4, « Vois la note de chaque étudiant·e et exporte-les en CSV, prêtes pour ton relevé. » ; « étudiant·e » dans tous les textes de la première livraison (« Colle ta liste d'étudiant·es : DA, nom, prénom. », « Quatre étapes, de ta liste d'étudiant·es à ta note finale. », « Classe créée : N étudiant·es. », « Ajouter des étudiant·es », en-tête « Étudiant·e », etc.). Trois accords que j'ai dû choisir, à valider : « Aucun·e étudiant·e lu·e. », « N étudiant·es ajouté·es », « déjà inscrit·es ce trimestre ».

### Les mesures demandées par Cowork (section E)

- **Les modèles prêts installés par la vue étendue sont-ils masqués ? Oui, confirmé par exécution.** Sur une application neuve, hors démonstration, j'ai installé le « Modèle simple » par la fonction qu'appelle « Utiliser dans ce trimestre » : il est écrit dans le trimestre, mais absent du menu de Conception › Pratiques, qui écarte tout ce dont l'auteur est « Demo Labo Codex ». Je n'ai pas cliqué la fenêtre de la bibliothèque elle-même ; je n'ai rien corrigé.
- **La vue simple peut-elle mener à « artefact » ou « portfolio » ? Pas un novice.** Ces mots ne viennent que du calcul d'une pratique dont le cours a des productions de ce type, ou une production terminale. « + Production » ne crée ni l'une ni l'autre ; elle ne reprend le type « artefact » que si le cours en a déjà. Celui qui les lit en vue simple les a donc dans ses données.
- **Les deux défauts préexistants** (un groupe sans horaire hérite des séances du dernier groupe activé ; assigner une pratique écrit dans un trimestre clos) : non corrigés, comme décidé.

### Les captures (section F)

- **Mesuré : c'était la capture, pas l'écran.** Chaque section de l'application apparaît en 0,3 s (opacité) ; mon script photographiait deux images après le clic. Aucun état désactivé, aucune transition propre à la vue simple.
- **Corrigé** : chaque capture attend la fin des animations. Les 104 captures sont refaites (26 écrans, 1180 et 820 px, clair et sombre), dont le réglage de la règle, des niveaux, des types, des paliers, et deux refus de retrait (un niveau, un type).

### Limites connues de cette version

- **« N dernières productions » suit l'ordre de création des colonnes, pas leur date** (acceptée par Grégoire le 9 nov. ; à reprendre après le 27 novembre ; le calcul partagé n'est pas touché).
- Renommer ou retirer une production, changer son type ou sa date : pas en vue simple (ligne 7 de la liste).
- Les couleurs des niveaux ne se règlent pas en vue simple.
- Après le réglage d'une échelle, la marque « ≠ » demande une ressaisie case par case (question 2).

### Ce que je n'ai pas pu vérifier

- WebKit, Safari, l'iPad, le toucher : rien. Chromium seulement.
- La suite Playwright entière : non lancée (seuls le banc de la vue simple et celui du tableau).
- Les données réelles de Grégoire : aucune n'a été ouverte.
- La fusion de deux fichiers par l'interface : la marque du fichier en est écartée par une liste que tient un essai de lecture du code ; la fusion elle-même n'a pas été jouée.

### La preuve

- **Vitest** : suite entière, 11 011 essais verts sur 11 011. Banc du lot : 44 essais.
- **Playwright Chromium** : banc de la vue simple, 23 essais verts sur 23 ; banc du tableau, 19 sur 19.
- **Les essais demandés :**
  - une échelle modifiée ne change aucun autre groupe ni aucune autre pratique (échelle commune intacte, l'autre pratique et le résultat de l'autre groupe intacts) ;
  - une valeur changée laisse les résultats saisis et pose le signe ; ressaisir prend la valeur d'aujourd'hui ;
  - un retrait refusé n'efface rien (niveau, lettre, type), rien n'est écrit ;
  - quatre niveaux aux valeurs inventées (95, 82, 61,5 et 30) : (95 + 61,5 + 30) / 3 donne 62, deux résultats à 82 donnent 82, et les deux meilleures de la première donnent 78 ;
  - sur une application vide, de la liste à la note sans ouvrir un seul réglage ; puis chaque valeur réglable atteinte en un geste, sur l'écran Pratique et au tableau ;
  - « élève » ne se lit sur aucun écran de la vue simple (25 états d'écran, plus les réglages et un refus) ; « codex » toléré aux trois endroits nommés ;
  - la marque du fichier : écrite à l'enregistrement, lue sans choix, le choix de l'appareil prime.
- **Break-tests** : 34 défenses de cette livraison retirées une à une, 34 essais rougis, code restauré (62 sur les deux livraisons). Un essai manquait (le texte de la carte 4) : ajouté, puis rougi.
- **Relecture par un agent neuf**, sur le commit des réglages, sans mes conclusions. Aucun défaut de sécurité. Dix défauts réels, dont le plus grave : changer de groupe avec un réglage ouvert pouvait écrire le brouillon dans la pratique de l'autre groupe. Disposition ci-dessous.

### Les constats de la relecture, et ce qu'ils deviennent

| Constat | Disposition |
|---|---|
| Un réglage ouvert suivait un changement de groupe : le brouillon de l'un pouvait s'écrire dans la pratique de l'autre | **Corrigé** (le réglage se referme ; le brouillon ne s'écrit que dans sa pratique) |
| Après la copie d'une échelle : ni signe « ≠ », ni refus de retrait | **Corrigé** (la copie garde le nom de son origine) |
| L'échelle n'était pas résolue comme le calcul la résout (échelle embarquée, échelle importée) | **Corrigé** ; une échelle embarquée se lit, « se change en vue étendue » |
| « Mes niveaux » pouvait être lue par une pratique dupliquée ou une production, et changer avec elles | **Corrigé** (lue ailleurs, elle est copiée) |
| La marque du fichier entrait dans la fusion (import sans question, conflit à arbitrer) | **Corrigé** (écartée de la fusion) |
| Deux paliers sans exigence : le plus haut devenait le plancher | **Corrigé** (refusé) |
| Paliers sous l'ancienne forme : affichés vides, écrits à côté du calcul | **Corrigé** (lus, non réglables ici) |
| Renommer un type détachait ou attachait des productions | **Corrigé** (refusé) |
| Un identifiant de type ou de palier retiré était repris, avec ses champs cachés | **Corrigé** |
| Les seuils d'un niveau bougent avec sa valeur | **Remonte à Grégoire** (question 1) |
| Une marque de fichier périmée, si le navigateur efface le choix de l'appareil, peut redonner la vue simple à qui avait choisi l'étendue | **Laissé** : la bascule est à un geste |
| Si l'écriture de la pratique échoue après la copie de l'échelle, une échelle « Mes niveaux » sans lecteur reste | **Laissé** : cas d'un stockage plein, sans effet sur une note |
| Une lettre portée seulement par les critères d'une évaluation avec grille n'est pas comptée | **Préexistant, laissé** : ne concerne pas un résultat saisi au tableau |
| La seconde garde du brouillon (son identifiant de pratique) n'a pas d'essai à elle | **Dit** : la première garde (le réglage se referme) la couvre et a son essai |

---

## LISTE DE TRAVAIL — ce qui entre dans la note, et où ça se règle (10 nov. 2026)

Demandée par le relais de 19 h 44, poussée AVANT la fin des réglages A et B (commit `bda4560`) ; les quatre premières lignes sont livrées depuis. Règle validée par Grégoire : tout ce qui entre dans la note a une valeur de départ et se règle ; rien ne se règle avant d'avoir une note ; chaque réglage est à un geste de la valeur qu'il règle.

**Méthode.** Chaque ligne est lue dans le code du calcul (`js/profil-etudiant-actions.js`, `js/pratiques/pratique-pan-specifications.js`, `js/pratiques/pratique-registre.js`, `js/portfolio.js`), pas dans ses commentaires. Rien n'a été exécuté pour cette liste, sauf la dernière ligne du tableau « Constats ».

**La vue simple peut-elle ouvrir le réglage de la vue étendue plutôt que d'en bâtir un second ?** Mesuré : non, pas tel quel. Les réglages de la vue étendue sont des panneaux dans de grandes pages (la fiche de la pratique dans Conception › Pratiques, l'éditeur dans Conception › Échelles), pas des fenêtres ouvrables seules ; les montrer, c'est montrer la page entière, avec ses mots (grille, cartouche, jetons). Seul l'assistant de pratique est une fenêtre autonome, mais il traverse des étapes que le novice ne doit pas lire. **Ce que je fais donc : un réglage étroit en vue simple qui écrit LE MÊME champ des mêmes données.** Il n'y a pas de seconde source : ce qui est réglé d'un côté se lit de l'autre.

### Temps 1 — ce qui change la note (candidats pour le 11)

| # | Valeur | Départ proposé | Réglable en vue étendue ? | En vue simple | Coût | État / recommandation |
|---|---|---|---|---|---|---|
| 1 | **Les niveaux** (standards) : lettre, nom, valeur, nombre, ordre | Cinq niveaux, valeurs 0, 40, 65, 75, 100 | Oui : Conception › Échelles | « Régler », à côté des niveaux (écran Pratique et tableau) | Fait | **Livré (A)** |
| 2 | **La règle de sélection** (standards) : toutes, N meilleures, N dernières ; le nombre N | Toutes les productions | Oui : fiche de la pratique | « Régler », à côté de la phrase de la règle | Fait | **Livré** |
| 3 | **Les types** (spécifications) : nom, ajout, retrait | Projet, Examen | Oui : fiche de la pratique | « Régler », à côté des types | Fait | **Livré (B)** |
| 4 | **Les paliers** (spécifications) : nom, note, exigences par type, ajout, retrait | Excellence 90, Réussite 70 | Oui : fiche de la pratique | « Régler », à côté des paliers | Fait | **Livré (B)** |
| 5 | **La note quand aucun palier n'est atteint** (spécifications) | Aucune : « pas de note », avec la cause | Oui : un palier sans exigence | C'est le réglage des paliers : un palier sans exigence est le plancher | Fait avec la ligne 4 | À dire dans l'écran (une phrase y est) |
| 6 | **Les productions qui comptent dans la note** (standards) | Toutes comptent | Oui : fiche de la pratique, « Productions qui comptent dans la note » | Rien aujourd'hui | Petit : une marque par colonne du tableau, même champ | **Candidat pour le 11.** Je ne le construis pas sans accord |
| 7 | **Retirer ou renommer une production ; changer son type ou sa date** | — | Oui : Conception › Productions | Rien aujourd'hui : une colonne créée par erreur reste | Petit à moyen : retirer demande de dire ce que deviennent ses résultats (sens d'une suppression, donc à Grégoire) | **Candidat pour le 11** pour renommer, la date et le type ; retirer attend sa décision |
| 8 | **Une case vide** : ignorée, ou zéro | Ignorée (elle n'entre pas dans la moyenne) | En partie : « Notes finalisées » compte zéro, seulement pour une production obligatoire d'une pratique à catégories | Rien, et « Notes finalisées » est exclue de cette version | Touche le calcul partagé | **À trancher par Grégoire** : c'est le sens de la note. Hors du 11 |
| 9 | **La formule qui passe des valeurs retenues à la note** (standards) | Moyenne simple | **Non : codée en dur**, dans les deux vues | Rien | Touche le calcul partagé (une moyenne pondérée, une médiane, un mode sont des décisions de pédagogie) | **À trancher par Grégoire.** Hors du 11 |
| 10 | **Une production terminale et son poids** (« le reste × X % + terminale × Y % ») | Aucune terminale : les productions valent 100 % | Oui : type et pondération de la production | Rien : « + Production » ne crée pas de terminale | Moyen : deux champs de plus à « + Production », et les mots de cette variante | Candidat pour le 27 |
| 11 | **Les catégories** (une part choisie, une part obligatoire, 65 % et 35 %) | Éteintes | Oui : fiche de la pratique | Rien : la règle se lit, « se change en vue étendue » | Grand | Candidat pour le 27, ou réservé à la vue étendue |

### Temps 2 — le reste (candidats pour le 27, ou rien à ouvrir)

| # | Valeur | Départ | Réglable en vue étendue ? | Coût en vue simple | Recommandation |
|---|---|---|---|---|---|
| 12 | **L'arrondi** de la note | À l'entier, demi vers le haut | **Non : codé en dur** (`js/portfolio.js:309`, refait au tableau) | Touche le calcul partagé et l'export | 27 : à décider avec la ligne 9 |
| 13 | **La base** de la note | Sur 100 | **Non : codée en dur** | Touche le calcul, l'export, les valeurs des niveaux | Après le 27 |
| 14 | **« Acceptable / non acceptable »** : les deux mots | Ces deux mots | Non : libellés fixes | Moyen : libellés partagés par la Liste et le tableau | 27. Ne change pas la note, change ce qu'on lit |
| 15 | **L'ordre que lit « N dernières »** | L'ordre de création des colonnes | Non : aucun écran n'écrit ce rang | Touche le calcul partagé | **Limite connue, acceptée par Grégoire** ; à reprendre après le 27 |
| 16 | **Un·e étudiant·e exclu·e** (abandon, etc.) | Compte comme les autres | Oui : son statut, dans Cadre › Trimestre | Petit | 27. À savoir : masqué·e au tableau et à l'écran Note finale, mais **présent·e dans le CSV** (comportement d'avant le lot) |
| 17 | **Le DA à 7 chiffres** | 7 chiffres | **Non : imposé aussi en vue étendue** ; le calcul des spécifications ne rend aucune note pour un DA d'une autre longueur | Touche l'import, la fiche et le calcul | Après le 27 |
| 18 | **L'échelle propre à une production** | Celle de la pratique | Oui : fiche de la production | Moyen | 27 |
| 19 | **La couleur d'un niveau** | Celle du niveau de départ ; neutre pour un niveau ajouté | Oui : Conception › Échelles | Petit | 27. Ne change pas la note |
| 20 | Le seuil « acceptable » (75 %) des spécifications | 75 | Oui | — | **Rien à ouvrir** : sans effet sur un résultat saisi au tableau (il ne sert qu'à une copie évaluée avec une grille) |
| 21 | Le minimum d'évaluations (7) | 7 | Oui | — | **Rien à ouvrir** : sans effet sur la note (il ne sert qu'aux indices du Suivi) |
| 22 | Les reprises, les jetons, la copie non recevable | — | — | — | **Rien à ouvrir** : ces cas n'existent pas pour un résultat saisi au tableau |

### Quatre surprises de la mesure

- **La moyenne simple et l'arrondi à l'entier ne se règlent nulle part**, pas même en vue étendue (lignes 9 et 12). Ce sont les deux valeurs qui touchent le plus directement le principe de Grégoire.
- **La valeur d'un niveau est copiée dans le résultat au moment de la saisie.** Changer la valeur ensuite ne change pas les notes déjà construites : la case montre le signe « ≠ » jusqu'à ce qu'on ressaisisse. C'est la règle du tableau, confirmée ; elle surprendra quiconque vient d'un tableur, où changer une valeur recalcule tout.
- **Les valeurs de repli ne sont pas les mêmes partout** pour le nombre de productions retenues : 4 au calcul, 5 à la fiche, 3 ailleurs, 7 dans le modèle. Sans effet tant que la pratique porte son nombre, ce qui est le cas en vue simple.
- **Deux réglages de la vue étendue n'agissent pas sur la note** bien qu'ils se lisent comme tels : le « minimum d'évaluations », et le seuil des spécifications pour un résultat sans grille.

---

## RAPPORT DE LA PREMIÈRE LIVRAISON (10 nov. 2026)

> Écrit avant les relais de 19 h 35 à 19 h 44. Ses questions 1 à 8 sont tranchées (voir la seconde livraison, en tête) ; ses textes disent encore « élève » là où l'écran dit maintenant « étudiant·e ».

### Ce qui est fait, en gestes

1. **Un nouvel arrivant ouvre l'application** : il arrive en vue simple, sur un accueil titré « Ta notation alternative », avec quatre cartes numérotées. La barre porte cinq entrées : Accueil, Classe, Pratique, Résultats, Note finale.
2. **Il colle sa liste d'élèves** (DA, nom, prénom ; virgule, point-virgule, tabulation ou espaces). Une ligne sans DA de 7 chiffres est refusée et nommée ; rien n'est inventé. Le trimestre, le cours et le groupe naissent en coulisse : sans dates, sans horaire, sans congé.
3. **Il choisit un modèle**, par standards ou par spécifications, puis règle ce qui construit la note : en standards, « N meilleures », « N dernières » ou « Toutes », et le nombre ; en spécifications, la note de chaque palier et le nombre de productions acceptables qu'il demande.
4. **Il nomme ses productions depuis le tableau**, par « + Production » : un nom et une date. Chacune devient une colonne. Un tableau sans colonne dit quoi faire et montre « + Production ».
5. **Il inscrit ses résultats au tableau**, au toucher ou au clavier (le tableau de notation existant, monté dans la vue simple).
6. **Il voit la note de chaque élève** et exporte le CSV (l'export existant).
7. **Il sauvegarde** : le bouton de l'en-tête s'appelle « Sauvegarder », à la même place, avec le même point d'état. Son menu s'ouvre sur la phrase arrêtée, puis deux gestes : enregistrer dans un fichier, ouvrir un fichier.
8. **Il passe à la vue étendue** par le menu en haut à droite : il y retrouve sa classe, sa pratique, ses productions et ses résultats, aux mêmes endroits que tout utilisateur.
9. **Il revient à la vue simple** : idem.

Autour du parcours :

- **La bascule** vit dans le menu. En vue simple, une seule ligne, « Vue étendue ». En vue étendue, le menu habituel, puis sous un filet, « Vue simple ».
- **Basculer n'écrit rien dans les données.** Le choix reste sur l'appareil et ne voyage pas avec le codex.
- **Aucun parcours d'assistance** ne se lance ni ne se propose en vue simple ; les infobulles et flèches automatiques y sont coupées.
- **Quelqu'un qui a déjà des données** arrive en vue étendue. En vue simple, il voit ses groupes ; un groupe d'une autre pratique est marqué, et un mot dit pourquoi. Un sélecteur de groupe paraît dès qu'il y a plus d'un groupe.
- **Le passage vers la vue étendue tient** : les 38 écrans s'ouvrent sans erreur. Trois écrans disaient faux ou ne disaient rien devant un trimestre né en coulisse ; ils disent maintenant ce qui manque et où le donner (le calendrier sans dates, l'assiduité sans horaire, le bandeau « ton espace est prêt » qui affirmait un horaire).
- **`js/config.js` et `js/navigation.js` ne sont pas touchés.** Je n'ai pas eu besoin de l'autorisation : cinq sections neuves et une seconde barre suffisent.

### Ce que j'ai supposé (une ligne chacune)

- « Vide » se lit « aucun élève inscrit, dans aucun trimestre hors démonstration » (les élèves sont une liste plate par trimestre).
- La démonstration ouverte, sans choix fait, donne la vue étendue : elle ne s'ouvre que de là. **Ajout à la décision de Cowork.**
- Avoir bâti sa classe en vue simple vaut un choix : au rechargement, on y reste (sans quoi le novice basculerait en vue étendue dès qu'il a des élèves).
- La grille de départ que l'application sème d'elle-même ne compte pas comme « une grille de l'utilisateur ».
- En vue simple, une case évaluée avec une grille se lit et ne s'ouvre pas (l'éditeur est un écran de la vue étendue).
- Le sélecteur de groupe liste les groupes du trimestre actif ; changer de trimestre reste un geste de la vue étendue.
- La pratique installée s'appelle « Par standards » ou « Par spécifications », pas du nom du modèle (« N meilleures évaluations »), puisque la règle se change.
- Une production neuve prend le rang suivant du cours : les colonnes suivent l'ordre où on les crée.
- La règle sur les textes fixes du tableau (légende du point, phrase sur les critères) s'applique en vue simple seulement ; en vue étendue, les mots validés le 9 nov. ne bougent pas.
- Sous un banc d'essai piloté, la vue par défaut reste l'étendue (voir « La preuve », dernier point).

### Ce qui attend Grégoire

Une question par ligne, avec ma recommandation.

| # | Question | Recommandation |
|---|---|---|
| 1 | La carte 4 dit « Arrête les notes du trimestre », mais aucun geste n'arrête les notes. Le seul réglage proche, « Notes finalisées », compte zéro pour une production obligatoire non remise en standards : il change le sens de la note. | Pour le 11 : remplacer le texte par « Vois la note de chaque élève et exporte-les en CSV, prêtes pour ton relevé. » Décider ensuite si « Notes finalisées » s'offre en vue simple. |
| 2 | Les valeurs de départ sont celles des modèles existants : 7 meilleures productions ; paliers à 90 (2 projets, 1 examen) et à 70 (1 projet, 1 examen). Un novice qui a trois productions lit donc « 7 ». | Garder pour le 11, puisque rien n'est inventé. Dire si un autre départ (« Toutes ») sert mieux la présentation du 27. |
| 3 | « N dernières productions » suit l'ordre de création des colonnes, pas leur date. Une production ajoutée après coup avec une date ancienne compte comme la plus récente. | Accepter pour cette version ; c'est la lecture du calcul existant. |
| 4 | En spécifications, « + Production » demande un troisième champ, le type, parce que le modèle a deux types (Projet, Examen) et qu'une production sans type n'entre pas dans la note. | Garder le champ. L'autre voie est un modèle à un seul type pour la vue simple, donc un modèle neuf. |
| 5 | Le cours né en coulisse s'appelle « Mon cours » si le champ facultatif reste vide. Ce nom sort dans la colonne « Cours » du CSV. | Garder. |
| 6 | Le geste d'enregistrement dit « codex » dans ses propres fenêtres (« Mettre à jour le codex », « Codex mis à jour »), et le rappel de sauvegarde dit « Mets ton codex à jour ». Le mot est donc lu hors de la phrase qui l'introduit. | Laisser pour cette version : la phrase l'introduit juste avant, et couper le rappel retirerait une protection contre la perte. |
| 7 | Un novice qui rouvre son fichier sur un AUTRE appareil arrive en vue étendue (le choix ne voyage pas, décision de Cowork). | À trancher : c'est le cas du collègue qui passe du bureau à la maison. |
| 8 | Quelqu'un qui a créé trimestre, cours et groupes en vue étendue, mais pas encore d'élèves, arrive en vue simple (c'est la définition de « vide » de Cowork). | Recommandation : compter aussi un trimestre hors démonstration comme « des données ». Je n'ai pas changé la règle sans accord. |
| 9 | Les textes neufs ci-dessous. | À valider un à un. |

### Les textes neufs (tous marqués PROPOSÉ dans `js/vue-simple.js`)

Proposés par Cowork, repris tels quels :

- Accueil, sous le titre : « Quatre étapes, de ta liste d'élèves à ta note finale. »
- Carte 1 : « Ta classe » · « Colle ta liste d'élèves : DA, nom, prénom. » · « Coller ma liste »
- Carte 2 : « Ta pratique » · « Choisis un modèle, par standards ou par spécifications, et la règle qui construit la note. » · « Choisir un modèle »
- Carte 3 : « Tes résultats » · « Inscris un niveau, ou acceptable / non acceptable, dans un tableau : tes élèves en lignes, tes productions en colonnes. » · « Ouvrir le tableau »
- Carte 4 : « Ta note finale » · « Arrête les notes du trimestre et exporte-les en CSV, prêtes pour ton relevé. » · « Voir les notes »
- Menu : « Toutes les fonctions » sous « Vue étendue » ; « Ta notation seulement » sous « Vue simple ».

Proposés par moi :

- Barre : « Accueil », « Classe », « Pratique », « Résultats », « Note finale ».
- Classe : « Colle ta liste d'élèves, une ligne par élève : DA, nom, prénom. » · « Nom du cours (facultatif) » · « Ta liste » · « Créer ma classe » · « Ajouter des élèves » · « Ajouter à ma classe » · « Choisir ma pratique » · en-têtes « DA », « Nom », « Prénom ».
- Classe, retours : « Classe créée : N élèves. » · « N élèves ajoutés, N déjà inscrits ce trimestre. » · « Aucun élève lu. Une ligne par élève : DA, nom, prénom. » · « N lignes non lues : » · « le DA doit compter 7 chiffres » · « il manque le nom ou le prénom » · « ce DA est déjà dans la liste collée » · « La démonstration est ouverte. Quitte-la pour créer ta classe. » · « La classe n'a pas pu être créée. »
- Nom du cours par défaut : « Mon cours ».
- Groupe : « Groupe » · « Choisis un groupe » · « (autre pratique) » · « Un groupe dont la pratique n'est ni par standards ni par spécifications se suit en vue étendue. » · « Commence par ta classe : colle ta liste d'élèves. »
- Pratique : « Choisis un modèle. Tu régleras ensuite la règle qui construit la note. » · « Par standards » · « Chaque production reçoit un niveau. La note se construit à partir des niveaux que la règle retient. » · « Choisir les standards » · « Par spécifications » · « Chaque production est acceptable ou non acceptable. La note dépend du nombre de productions acceptables. » · « Choisir les spécifications ».
- Pratique, la règle : « Modèle » · « La règle qui construit la note » · « Nombre de productions retenues » · « Niveaux : » · « Note » · « Pour chaque note, le nombre de productions acceptables qu'il faut, par type. » · « Enregistrer la règle » · « Règle enregistrée. » · « Changer de modèle » · « Cette règle vaut pour les N groupes qui ont cette pratique. » · « La règle de cette pratique se change en vue étendue. » · « La pratique de ce groupe n'est ni par standards ni par spécifications : elle se règle en vue étendue. » · « La pratique n'a pas pu être enregistrée. »
- Résultats, à la place des messages du tableau qui nomment la vue étendue : « Ce groupe n'a pas encore de pratique. Choisis un modèle : le tableau suivra sa règle. » · « Le tableau sert aux pratiques par standards et par spécifications. La pratique de ce groupe se suit en vue étendue. » · « Ce groupe n'a pas encore d'élèves. Colle ta liste pour remplir le tableau. » · « Ton tableau n'a pas encore de colonne. Ajoute ta première production : un nom et une date. »
- « + Production » : « Nom de la production » · « Date » · « Type » · « Ajouter » · « Annuler » · « Donne un nom à la production. »
- Note finale : « La note de chaque élève, construite par la règle de ta pratique à partir des résultats du tableau. » · en-tête « Élève » · « Aucune note à montrer : ce groupe n'a pas encore d'élèves. »
- Sauvegarder : « Enregistrer dans un fichier » · « Ouvrir un fichier… » · « Ton fichier est à jour. » · « Ton fichier n'a pas tes derniers changements. »
- Vue étendue, Cadre › Calendrier sans dates (`js/calendrier-vue.js`) : « Le calendrier se construit à partir des dates de ton trimestre, et ce trimestre n'en a pas encore. Tu peux les donner dans Cadre › Trimestre. »
- Vue étendue, Suivi › Groupe sans horaire (`js/tableau-bord-apercu.js`) : « Assiduité non calculée : ce groupe n'a pas d'horaire. Tu peux le donner dans Cadre › Trimestre › Horaire. »

Repris sans changement de textes déjà validés : les mots du tableau (dont « Exporter la synthèse (CSV) », « Réglages de la pratique », « Note provisoire »), et les libellés de la règle des standards (« N meilleures productions », « N dernières productions », « Toutes les productions »).

### Ce que je n'ai pas pu vérifier

- **WebKit, Safari, l'iPad** : rien. Tout a tourné sous Chromium seulement.
- **La suite Playwright entière** (environ 360 bancs) : non lancée. Seuls le banc de la vue simple et celui du tableau ont tourné.
- **Les données réelles de Grégoire** : aucune n'a été ouverte. Le cas « utilisateur existant » est éprouvé sur des données fictives semées.
- **Sous 780 px de large** (téléphone) : la barre de la vue simple passe sur une seconde rangée ; écrit, non capturé ni éprouvé.
- **Le toucher** : les essais cliquent à la souris et tapent au clavier.
- **Un très gros corpus** : au démarrage, la vue étendue est posée d'abord dès qu'un trimestre existe, pour éviter un clignotement ; non mesuré sur un vrai corpus.

### La preuve

- **Vitest** : suite entière, 11 000 essais verts sur 11 000 (10 963 à la base du lot). Banc du lot : `tests/unit/vue-simple.test.js`, 33 essais — la règle de la vue par défaut (vide, démonstration, codex importé, choix), la navigation de la vue étendue identique (sections, ordre, sous-sections, barre, liste des écrans étroits, menu ; empreinte des deux fichiers protégés égale à celle de `b6d5926`), la liste collée, ce qui naît en coulisse, la règle.
- **Playwright Chromium** : `tests/integration/vue-simple.spec.js`, 13 essais verts sur 13 ; `tableau-de-notation-1.spec.js`, 19 sur 19 (non-régression).
  - le parcours 1 à 9 en entier, par l'interface, sur des données fictives ;
  - la bascule aller-retour : même compte de clés et même empreinte, sur une application vide et sur une classe avec résultats ;
  - sur des données de novice, 25 états d'écran lus (texte, infobulles, libellés lus par un lecteur d'écran) : aucun mot de la liste, « codex » dans la seule phrase, aucun chemin « › » vers la vue étendue ;
  - la légende du point et la phrase sur les critères : absentes sans grille, présentes avec une grille ;
  - aucun parcours proposé ; le menu ne porte que « Vue étendue » ;
  - après le parcours, les 38 écrans de la vue étendue s'ouvrent sans erreur en console et aucun ne reste muet ;
  - double clic, modèle repris, retour à la vue simple, rechargement, spécifications, utilisateur existant.
- **Break-tests** : 28 défenses retirées une à une dans une copie de travail à part ; les 28 essais ont rougi ; code restauré. Deux essais étaient verts à tort au premier passage (les messages du tableau, le bandeau d'étape) : ils ont été durcis, puis ont rougi.
- **Relecture par un agent neuf** : faite sur le diff, sans mes conclusions. Aucun défaut de sécurité ; la bascule n'écrit rien (confirmé). Ses constats et leur disposition : tableau ci-dessous.
- **Captures** : 80 images dans `plans de travail/captures-2026-11-10-vue-simple/` — 20 écrans à 1180 et 820 px, en clair et en sombre. Noms fictifs.
- **Sécurité** : toute valeur passe par `echapperHtml` ; aucun handler inline ; aucun `console.log`.
- **Une conséquence mesurée en chemin, à connaître** : une application vide s'ouvre maintenant en vue simple, et presque tous les bancs Playwright existants partent d'une application vide. Le banc du tableau a rougi en entier. Remède retenu : sous un navigateur piloté par un banc, la vue par défaut reste l'étendue ; le banc de la vue simple éteint ce drapeau pour éprouver la vraie règle. **À confirmer sur le Mac par la suite WebKit entière avant toute fusion.**

### Ce qui n'est pas dans cette version

- Renommer ou retirer une production, retirer un élève : ces gestes restent ceux de la vue étendue.
- Arrêter les notes (question 1).
- Changer de trimestre depuis la vue simple.

### Les constats, et ce qu'ils deviennent

De la mesure (§ 11 et 12) et de la relecture neuve. Aucun n'est inscrit au BACKLOG : la règle du 24 août demande un symptôme vécu ; ceux qui le méritent sont proposés à Cowork.

| Constat | Disposition |
|---|---|
| Calendrier vide sans explication ; assiduité muette sans horaire ; bandeau qui affirme un horaire | **Corrigé** dans le lot |
| La pratique née en vue simple était invisible dans Conception › Pratiques (elle gardait l'auteur « Demo Labo Codex » du modèle) | **Corrigé** |
| Double clic : deux cours, deux pratiques, deux colonnes | **Corrigé** (un geste à la fois) |
| « Enregistrer la règle » écrasait un minimum d'évaluations réglé à part | **Corrigé** |
| « Changer de modèle » laissait une pratique orpheline à chaque aller-retour | **Corrigé** (elle est reprise) |
| Rang d'une production neuve faux dans un cours qui a déjà des productions | **Corrigé** |
| Un geste commun (« Trimestres », « Quitter la démo ») ouvrait la vue étendue sans barre pour en sortir | **Corrigé** (retour à l'écran simple) |
| Clignotement possible au démarrage sur un gros corpus | **Corrigé**, non mesuré sur un vrai corpus |
| Messages faux à l'écriture (« 0 élève ajouté » sur un trimestre clos, « tes données n'ont pas changé ») | **Corrigé** |
| Régressions possibles en vue étendue : service et mode « cours, tous groupes » pour le bandeau et l'assiduité ; ancien champ de date du calendrier | **Corrigé** |
| Le mot « codex » dans le geste d'enregistrement et dans le rappel | **Remonte à Grégoire** (question 6) |
| Un utilisateur sans élèves arrive en vue simple | **Remonte à Grégoire** (question 8) |
| Un groupe sans horaire hérite des séances du dernier groupe activé (`js/horaire.js:179`) : un groupe né en vue simple, dans un trimestre où un autre groupe a un horaire, en reçoit un qui n'est pas le sien | **Préexistant, non corrigé.** Proposé à Cowork : il touche l'assiduité d'élèves réels |
| Assigner une pratique écrit même dans un trimestre clos (`PratiqueManager.changerPratiqueActive`) | **Préexistant, non corrigé.** Proposé à Cowork |
| Les trois modèles prêts portent l'auteur « Demo Labo Codex » ; installés par la vue étendue, ils seraient peut-être masqués de la même façon | **Non vérifié.** À mesurer par Cowork |
| Un cours orphelin reste si la création du groupe échoue après celle du cours | **Refusé** pour cette version : cas d'un stockage plein, message corrigé |
| « 1234567 De La Fontaine Jean » (séparé par des espaces) : le nom lu est « De » | **Refusé** : la virgule ou la tabulation lèvent l'ambiguïté ; à dire dans l'aide si le cas se vit |
| La classe compte les élèves exclus, le tableau non | **Laissé** : sans effet sur la note |

---

## ÉTAPE 1 — LA MESURE (lecture seule, 9 nov. 2026)

Méthode : lecture du code par quatre agents en parallèle et par moi (`js/config.js`, `js/navigation.js`, `js/tableau-notation.js`, l'en-tête d'`index.html`). **Rien n'a été exécuté dans un navigateur à cette étape** : la colonne « section par section » plus bas est une lecture de code, à confirmer par le banc Playwright du lot. Base mesurée : Vitest 10 963 verts sur 10 963 à `b6d5926`, version 1.239.0.

### 1. La navigation, et la façon la plus étroite de masquer

- Les sections et sous-sections sont déclarées dans `configurationsOnglets` (`js/config.js:32`). Les boutons de la barre principale sont du HTML statique (`index.html:3708-3718`), doublés d'une liste pour les écrans étroits (`#entete-sections-liste`, `index.html:3806`). `afficherSection(nom)` (`js/navigation.js:68`) montre `#section-<nom>` et masque les autres ; une section absente de `configurationsOnglets` s'affiche sans sous-navigation.
- **Constat : la vue simple peut se faire SANS toucher à `js/config.js` ni à `js/navigation.js`.** Une section neuve `#section-simple` dans `index.html`, une seconde barre de cinq entrées à côté de la barre principale, et une classe sur `<body>` qui masque l'une ou l'autre. `afficherSection('simple')` fonctionne tel quel.
- **Décision (technique, la mienne) : je n'use pas de l'autorisation sur les deux fichiers protégés.** Le masquage vit dans le CSS et dans un module neuf. Le banc « navigation de la vue étendue identique avant et après » reste dû et sera livré (il compare entrées, ordre et sous-sections à l'état de `b6d5926`).

### 2. Ce que le code sait d'une application vide

- Aucune fonction générale. Trois approximations existent : `aproposReplie()` (`js/accueil.js:84`, « un trimestre autre que démo existe »), `utilisateurADesDonnees()` (`js/modal-backup-reminder.js:38`, compte les évaluations), `etapesDuCadre()` (`js/trimestre-v2.js:512`).
- Le mode démo se reconnaît : `estEnModeDemo()` (`js/modes.js:1633`), trimestre d'id `demo`, clés `demo_*`.
- **À écrire** : une fonction pure « vide » = aucun élève dans la liste (`<trimestre>_groupeEtudiants`) d'aucun trimestre hors démo.
- Les élèves sont une liste plate par trimestre, pas rangés dans un objet « groupe ». **Supposition** : « aucun groupe avec au moins un élève » se lit « aucun élève inscrit, dans aucun trimestre ».

### 3. Où garder le choix de la vue

- Le thème clair/sombre vit dans `preferencesUtilisateur` et **voyage avec le codex** : ce n'est pas le bon endroit.
- À l'export, seules les clés `_codex_*` sont exclues (`js/codex.js:476`) ; à l'ouverture d'un codex, les clés qui commencent par `_` ne sont pas écrites (`js/codex.js:440`).
- **Décision** : le choix de la vue s'écrit directement dans `localStorage`, hors de `db.js`, sous une clé à lui. Il n'entre donc ni dans le codex ni dans l'empreinte des données. Seul un choix EXPLICITE est écrit (la bascule, ou avoir bâti sa classe en vue simple) ; sans choix, la règle « vide → simple, sinon étendue » est recalculée à chaque démarrage.

### 4. Coller une liste, créer trimestre, cours, groupe

| Besoin | Ce qui existe | Réutilisé ? |
|---|---|---|
| Créer un trimestre sans formulaire | `creerTrimestre(session, annee)` puis `changerTrimestreActif(id)` (`js/trimestres.js:509, 547`) | Oui |
| Créer un cours | `CoursEntite.creer(donnees)` (`js/entites/cours-entite.js:82`) | Oui |
| Inscrire des élèves | `db.modifier(cle('groupeEtudiants'), …)` | Oui |
| Créer un groupe-cours | **Aucune fonction** : le seul chemin passe par le formulaire du Cadre, qui exige horaire et enseignant. `creerMonService()` (`js/rencontres.js:310`) fait déjà toute la chaîne en coulisse, sans horaire, mais pour un « service » d'orthopédagogie | Le motif, pas la fonction |
| Lire une liste collée | `analyserListeEtudiantsCollee` exige quatre colonnes (format Omnivox, avec le groupe) ; `analyserListeEleves` (rencontres) accepte trois colonnes mais **invente un DA provisoire**, ce que la règle « aucun DA inventé » interdit ailleurs | Non : un lecteur neuf, DA de 7 chiffres, rien d'inventé |

- Le trimestre né en coulisse : un identifiant tiré de la date du jour (A, H ou E + année), **sans dates de début ni de fin, sans horaire, sans congé**. `genererCalendrierComplet()` écrit alors un calendrier vide, sans planter (`js/trimestre.js:55`).
- Le groupe-cours : `horaireId: null`, pratique vide, comme celui d'un service.
- Le cours : il lui faut un nom. **Supposition** : un champ facultatif « Nom du cours » sur l'écran Classe ; laissé vide, le cours s'appelle « Mon cours » (texte PROPOSÉ). C'est le seul mot inventé du trimestre né en coulisse, et il se lit dans la colonne « Cours » du CSV.

### 5. Choisir un modèle et la règle

- Trois modèles prêts existent pour ces deux familles (`js/pratiques-bibliotheque.js:30`) : « N meilleures évaluations » et « N plus récentes » (standards), « Modèle simple » (spécifications : deux types, Projet et Examen ; deux paliers, 90 et 70).
- L'installation existante (`ajouterPratiqueALaSelection`, `js/pratiques-gestion.js:756`) passe par des fenêtres de la vue étendue ; l'assignation au groupe est `PratiqueManager.changerPratiqueActive(id)` (`js/pratiques/pratique-manager.js:64`).
- **La règle, en standards** : `portfolio.methodeSelection` (meilleures, plus récentes, toutes) et `portfolio.nombreARetenir`. **En spécifications** : les paliers (une note pour un nombre de productions acceptables par type).
- Un modèle par standards a besoin d'une échelle : l'échelle de départ du trimestre (`ECHELLE_IDME_DEPART`, cinq niveaux) est semée par `assurerEchelleIdmeDeDepart()` (`js/echelles.js:386`).
- **Ce qui remonte à Grégoire** : les valeurs de départ des modèles sont celles qui existent déjà (7 meilleures, 5 plus récentes, paliers 90 et 70). Je n'en invente aucune ; l'enseignant les change à l'écran Pratique.

### 6. « + Production » : la production la plus légère

- Clé `cle('productions')`. Le formulaire exige titre, type, et une pondération sauf en standards.
- Le tableau et le calcul acceptent, en standards : `{ id, titre, type: 'autre', coursId, dateEcheance }`. Aucun lien à un standard n'est requis ; ni grille, ni échelle (celle de la pratique sert).
- **En spécifications, une production ne devient une colonne que si son type est un des types de la pratique.** « Un nom et une date, rien d'autre » ne suffit donc pas quand la pratique a plus d'un type. **Supposition** : « + Production » ajoute alors un troisième champ, le type, et seulement dans ce cas.

### 7. « Arrête les notes »

- Aucun geste n'arrête les notes d'un trimestre. Ce qui s'en approche : la case « Notes finalisées » des réglages d'une pratique (`configuration.notesFinales`). Elle change des libellés (« Note finale » au lieu de « Note provisoire », statut `final` au CSV) **et, en standards, compte zéro pour une production obligatoire non remise**. Elle ne verrouille rien.
- **Cela touche le sens d'une note : je ne l'offre pas en vue simple.** La carte 4 sera livrée avec la note et l'export seulement. Question pour Grégoire au rapport final.
- L'export existe : `exporterSyntheseResultatsCSV()` (`js/export-resultats-finaux.js:190`), colonnes DA, Nom, Prénom, Groupe, Cours, Trimestre, Pratique, Note finale, Statut, Non comptées.

### 8. Le sélecteur de l'en-tête

- **L'en-tête ne porte pas de sélecteur de trimestre.** La bande pâle porte un sélecteur de **groupe-cours** (`#selectGroupeCoursHeader`, `index.html:3827`), avec les mots « groupe-cours » et « Cours (tous groupes) ».
- **Décision** : en vue simple, la bande pâle est masquée. Résultats et Note finale portent leur propre sélecteur de groupe, affiché seulement s'il y a plus d'un groupe. **Supposition** : il liste les groupes du trimestre actif ; changer de trimestre reste un geste de la vue étendue.

### 9. « Sauvegarder »

- Le bouton « Codex » (`#btn-codex`, `index.html:3723`) ouvre un **menu déroulant** de douze entrées (`#codex-menu`). Son en-tête (`#codex-menu-statut-haut`) est réécrit à chaque ouverture par `_actualiserMenu()` (`js/codex.js:3206`) : c'est là que la phrase peut s'afficher.
- Presque chaque entrée porte le mot « codex », et d'autres portent « Archiver », « Fusionner », « codex data ». **Décision** : en vue simple, le menu montre la phrase, puis deux gestes seulement, « Enregistrer dans un fichier » et « Ouvrir un fichier… » (textes PROPOSÉS), branchés sur les mêmes actions qu'aujourd'hui. Le point d'état ne change pas.
- **Chemin détourné qui reste** : le geste d'enregistrement lui-même (aperçu « Mettre à jour le codex », barre « Génération du codex », confirmation « Codex mis à jour ») dit « codex ». Il vient après la phrase qui introduit le mot. Je ne réécris pas ces fenêtres : disposition au rapport final.

### 10. Les parcours d'assistance

- Aucun parcours ne démarre seul (`js/assistance.js:13`). Ils se proposent par l'entrée « Assistance » du menu, par l'accueil étendu, et par des flèches et bulles automatiques (`js/accompagnement.js:765`).
- En vue simple : le menu ne porte que « Vue étendue », l'accueil étendu n'est pas affiché, et les flèches sont coupées par une garde sur la vue dans `estAccompagnementActif()`.

### 11. Le passage vers la vue étendue, section par section

Lecture de code, devant un trimestre né en coulisse (un cours, un groupe, des élèves, une pratique, des productions, des résultats ; ni dates, ni horaire, ni grille).

| Section | Verdict | Ce qui manque |
|---|---|---|
| Accueil | tient | |
| Cadre › Trimestre | tient | |
| Cadre › Calendrier | **vide sans explication** | se rabat sur août 2025 et montre des mois vides (`js/calendrier-vue.js:478`) |
| Conception | tient | états vides existants |
| Évaluation › Liste et tableau | tient | |
| Évaluation, ouvrir une copie | message existant | « Grille introuvable » (`js/evaluation-chargement.js:1325`) |
| Évaluation, bandeau d'étape | **affirme à tort** que l'horaire est configuré (`js/transitions.js:65`) | |
| Suivi › Groupe | **vide sans explication** pour l'assiduité (`js/tableau-bord-apercu.js:1794`) | |
| Suivi › Présences | **bloqué sans dire pourquoi** : « hors du calendrier scolaire » pour toute date (`js/saisie-presences.js:718`) | |
| Dépistage (profil) | tient | message explicite sans grille |

Aucun accès qui lèverait une erreur n'a été trouvé à la lecture ; le banc le vérifiera en console.

### 12. Les chemins détournés vers un mot interdit

1. Le menu du bouton de l'en-tête (traité, § 9) et le geste d'enregistrement (reste, § 9).
2. Les textes fixes du tableau : la légende du point, la phrase sur les critères (arrêté par Grégoire), mais aussi **trois messages d'état qui nomment des écrans de la vue étendue** (« Conception › Pratiques », « Cadre › Trimestre », « Conception › Productions ») et le lien « Réglages de la pratique » qui y mène. En vue simple, ils seront remplacés par des textes propres (PROPOSÉS) ; ceux de la vue étendue, validés mot pour mot, ne bougent pas.
3. Une case évaluée avec une grille ouvre la copie dans l'éditeur de la vue étendue. En vue simple, elle se lit et ne s'ouvre pas.
4. Les infobulles au survol (`data-tooltip`) et les flèches automatiques : coupées en vue simple.
5. Le bandeau de version et son bouton « Voir les nouveautés » (le journal des versions nomme tout) : le bouton est masqué en vue simple.
6. Le rappel « Mets ton codex à jour » (1,5 s après le démarrage, dès qu'il existe des résultats) : il dit « codex ». **Je le laisse** : le couper retirerait une protection contre la perte de données. Disposition au rapport final.
7. La cause « Seule l'évaluation terminale a une note… les artefacts du portfolio… » (`js/pratiques/pratique-registre.js:933`) : elle ne peut paraître que s'il existe une production terminale, donc jamais chez un novice de la vue simple.
8. Le bandeau « Mode démonstration » : la démo ne s'ouvre que depuis la vue étendue.

### Ce que la mesure contredit ou nuance dans la consigne

- « Le sélecteur de trimestre de l'en-tête » n'existe pas (§ 8).
- « Arrête les notes » n'a pas de geste (§ 7) : la carte 4 promet plus que ce qui est livré. Le texte de Cowork est gardé tel quel, marqué PROPOSÉ, et signalé.
- « Un nom et une date, rien d'autre » ne tient pas en spécifications à plusieurs types (§ 6).
- Rien ne contredit une décision arrêtée par Grégoire : je continue.
