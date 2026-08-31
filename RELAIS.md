# RELAIS — où vit le travail en cours

> **Ce fichier ne dit qu'une chose : sur quelle branche se trouve le travail
> le plus récent.** Il est mis à jour au rituel de FIN de session et lu au
> rituel de DÉBUT. Il vit **toujours sur `main`**, et c'est toute sa raison
> d'être.

---

## POUR LA SESSION QUI PREND LE RELAIS — 31 AOÛT 2026, SOIRÉE (SECOND CYCLE)

> Écrit par `kuekatsheu-85`, coordinatrice d'un second trio du même jour
> (`85`, `5d`, `dc`). Ce bloc **remplace** celui de la fin d'après-midi, plus bas,
> qui reste valable pour tout ce qu'il décrit — S5 y compris.
> **Zéro collision d'index, aucun fichier partagé, aucun ID consommé.**

**Branche : `main`.** **Aucune release** — version inchangée **1.106.13**, build
`0831-0734`. **4 jetons `?v=` bumpés en `20260831f`** (`transitions.js`,
`preferences.js`, `accueil.js`, `styles.css`) : ⚠ **recharger la session `file://`**.

**Vitest 419 fichiers / 4452 tests · Playwright WebKit 222 passés · code de sortie
0 pour les deux**, lus APRÈS le dernier changement. (218 → 222 : +5 cas de la
nouvelle spec S5, −1 spec retirée avec #639.)
**Dernier ID utilisé : #643. Aucun nouvel item ouvert.**

**CE QUI A ÉTÉ LIVRÉ — trois lots, trois commits**
- **#639** (`b8ba7504`) — l'avis daté retiré avant de devenir du code mort au
  message faux. Le régime des avis part entier (champs, préférence, 5 blocs CSS) :
  le reposer est désormais un geste explicite. `js/accueil.js` porte seul
  l'information sur l'accès.
- **#623** (`3eda7d0d`) — la spec WebKit dédiée à S5 qui manquait : 5 cas, 5
  témoins. Plus deux tolérances **nées mortes** retirées de `622` et `466`.
- **#636** (`aa87f9e0`) — les 22 points de décision de `scripts/` (pas 15). Trois
  règles : lire = balayer et nommer où ; écrire = trimestre explicite ou refus ;
  source datée = clé de son époque. `restaurer-isoler-cartouches-A25.mjs` **gelé**.

⛔ **LE MORATOIRE À TROIS GESTES N'EST PAS LEVÉ.** Rien ce soir ne l'approche.
⏳ **Un geste revient à Grégoire** : `restaurer-isoler-cartouches-A25.mjs` **refuse
désormais d'écrire** (`--ecrire` → code 2, le dry-run reste entier). Restriction
d'outil délibérée, et le refus dit comment le lever, site par site.

---

### ⚠⚠ CE QUE CE CYCLE A APPRIS, ET QUI VAUT AU-DELÀ DE SES TROIS LOTS

**QUATRE dispositifs décoratifs démasqués. Aucun par une relecture ; tous par une
mutation ou une mesure.** S'ils avaient tenu, chacun aurait servi d'alibi.

1. **Une garde peut NAÎTRE morte.** On savait qu'une liste de tolérance périme en
   silence. Le motif `/clé ABSENTE des registres/i` visait un `console.warn` alors
   que les trois collecteurs qui le portaient ne ramassent que
   `msg.type() === 'error'` : il n'a **jamais** pu être confronté à quoi que ce
   soit, et avait voyagé par copie sur trois fichiers sans être re-dérivé.
   ⮕ La question à poser à un motif de tolérance n'est pas seulement « est-il
   encore juste ? » mais **« peut-il seulement atteindre son collecteur ? »**. Le
   TYPE du message décide, pas son texte. Une garde née morte est plus dure à voir
   qu'une garde périmée : elle ne produit jamais le moindre symptôme.
2. **Une sentinelle peut garder un régime disparu.**
   `sentinelle-reparation-442-doublons` montait son corpus sous la clé NUE : verte
   avant S5, verte **pendant toute la régression**, verte après. Remède : **ajouter**
   la famille namespacée, **garder** la nue. On ne raccourcit pas le corpus d'une
   sentinelle, on le scinde. Break-test : rouge sur la seule assertion ajoutée,
   **les 12 autres cas verts sous la même mutation**.
3. **Un drapeau peut rester VRAI sur un geste entièrement neutralisé.**
   `js/main.js:735` pose `migration_cartouches_namespacees_done` dès que
   `rapport.echecs` est vide — or un rapport qui n'a RIEN fait n'a rien à échouer.
   Une sentinelle branchée sur ce drapeau serait restée verte sur une migration
   supprimée. ⮕ **Asserter l'EFFET (l'écran, les copies, la clé source), jamais le
   drapeau qui prétend l'attester.**
4. **Un oracle peut viser une adresse que l'application ne lit plus.**
   `reparation-cartouches-orphelines.spec` interrogeait la clé nue. ⚠ **Et corriger
   le seul oracle n'aurait pas suffi** : la destination recevait 2 pour 3 attendus,
   le réflexe suivant aurait été d'ajuster l'attente à 2 — le test serait devenu
   vert **en cessant d'exercer la fusion sans écrasement**, son invariant.
   ⮕ **Une assertion qu'on aligne sur le comportement observé cesse d'être un test.**
   Remède : poser la fixture à l'adresse réelle, faire passer fixture ET oracle par
   `cle()` plutôt que de réécrire l'adresse à la main, et AJOUTER une assertion
   (`residuNu === 0`). La sentinelle couvre plus qu'avant, pas moins.

**⚠ UN NOM DE CLÉ QUI EST UN PIÈGE EN SOI — deux sessions, deux codes, même erreur.**
`migration_cartouches_namespacees_done` contient un BOOLÉEN, et **tout filtre sur
la famille `cartouches_` l'attrape** (`indexOf` le trouve précédé d'un `_`).
Il a fait planter les scripts de #636 (`l.cartouches.forEach is not a function`)
**puis, dix minutes plus tard, le banc écrit pour les vérifier.**
⮕ **Le drapeau d'une migration porte le nom de la famille qu'il migre.** Remède
retenu : **deux gardes qui ne peuvent pas se tromper ensemble** — l'une sur le NOM
(`^([ahe]\d{4}|demo)$` ; le `e` parce que `creerTrimestre` accepte la session Été),
l'autre sur la VALEUR (est-ce une liste ?).

**⚠ LIRE UN CODE DE SORTIE : le pipe n'est pas le seul piège.**
`grep -c` qui compte **zéro** sort en code **1** et **coupe un `&&`** — la commande
suivante n'est jamais exécutée, et le `$?` lu appartient au grep. Erreur commise
ce soir, sur une vérification de restauration.
⮕ **Le code lu appartient à la dernière commande EXÉCUTÉE, pas à celle qu'on croit
avoir lancée** ; une commande sautée n'en produit aucun. Même méfiance après `&&`
qu'après un pipe.

**⚠ UN NOMBRE SE TRANSMET AVEC LE SCÉNARIO QUI L'A PRODUIT, DANS LA MÊME PHRASE.**
Un « 3 » rapporté était juste — sous trois appels — mais la spec n'en fait qu'un,
où le résultat est 2. Les conditions étaient dans le message, un paragraphe plus
loin : trop loin pour voyager avec le chiffre. Un remède a failli être construit
dessus. ⮕ **Un chiffre dont les conditions ne voyagent pas avec lui est faux à
l'usage, même quand la mesure était bonne.** C'est la version chiffrée de la mesure
de seconde main.

**⚠ UNE RÈGLE APPLIQUÉE PARTOUT DEVIENT UN RÉFLEXE.** « Lire = balayer tous les
trimestres » est juste — sauf à `reparation-453:256`, où la question est « cette
cartouche est-elle joignable POUR CET ARTEFACT ». Y balayer produirait un faux
positif, et précisément le partage que S5 referme. ⮕ **Chercher la frontière d'une
règle vaut plus que la règle.**

**⚠ ET LE PLI QUI SE REFERME LE PLUS SOUVENT : un piège écrit en commentaire
n'arrête pas celui qui l'a écrit.** Troisième occurrence en deux jours — un
avertissement contre le prédicat lâche était en tête du fichier même où le prédicat
lâche a été écrit. Une garde, si.

**MÉTHODE DE COORDINATION — ce qui a fonctionné, deux trios de suite**
· La coordinatrice tient SEULE les identifiants, les commits et le jeton `?v=`.
· **Un périmètre de FICHIERS par session**, jamais de sujet. Ici : `tests/` (un
  fichier neuf), `scripts/`, et le reste à la coordinatrice.
· **Toute fenêtre de mutation sur l'arbre partagé s'annonce aux DEUX bouts**, et se
  ferme sur une somme SHA comparée — pas sur « j'ai restauré ». Aucun commit
  pendant.
· **Toute attente a une fin explicite annoncée** (« cycle fini »).
· **Les deux sessions ont contesté mes prémisses avec des mesures, et elles avaient
  raison les deux fois** (`cle()` EST disponible en console ; le compte du hook
  n'était pas celui que je citais). ⮕ Une consigne de coordinatrice se vérifie
  comme le reste.

---

## POUR LA SESSION QUI PREND LE RELAIS — 31 AOÛT 2026, FIN DE JOURNÉE

> Écrit par `kuekatsheu-c8`, coordinatrice de trois sessions parallèles
> (`c8`, `4c`, `67`). **Zéro collision d'index, aucun fichier partagé.**
> La consigne complète est à la racine : `CONSIGNE-DEMARRAGE-PROCHAINE-SESSION.md`.

**Branche à ouvrir : `main`.** Tout y est. **Aucune release** aujourd'hui — la version
reste **1.106.13** (build `0831-0734`) — mais **14 jetons `?v=` ont bougé** :
⚠ **Grégoire doit recharger sa session `file://`.**

**Vitest 419 fichiers / 4452 tests · Playwright WebKit 218 passés · code de sortie 0
pour les deux**, relus par la coordinatrice APRÈS le dernier changement ET après le
bump anti-cache. **15 jetons `?v=` bumpés.**
**⚠⚠ L'ÉPISODE LE PLUS INSTRUCTIF DE LA JOURNÉE — À LIRE AVANT DE DÉCLARER UN LOT COMPLET**

S5 a été déclaré complet avec **4452 tests Vitest verts**. Le push a été **REFUSÉ**
par la sentinelle Playwright : **8 specs rouges, toutes sur du RENDU**, dont une
**perte fonctionnelle réelle**. Trois causes, et deux étaient du code :

1. **Le matériel démo était posé sous la clé NUE** (`js/demo-activation.js`, cinq
   accès). Écrit à un endroit, lu à un autre. **Prédit mot pour mot au §2.3 de Z1** —
   et absent du périmètre de tout le monde, parce que l'inventaire recensait les
   **compositions** de clé, pas les clés **reçues en paramètre**.
2. **Une prémisse morte, écrite dans le code.** `lotsCartouchesDuTrimestre` sautait
   toute grille présente aussi dans le trimestre actif, en donnant sa raison :
   « `cartouches_<id>` est global ». Sous D2-A c'est faux — et le saut rendait
   invisible le cas où l'import a le PLUS de sens.
3. **Cinq specs semaient encore la clé nue**, et deux ont rejoué le piège
   `cle()`/`cleSource()`.

⮕ **Un fichier de sentinelles ne couvre que ce qu'il regarde, et Vitest ne regarde
pas le DOM.** Un total vert n'est pas une couverture. La garde Playwright du push est
le seul filet qui a vu.
⮕ **Le piège `cle()` vs `cleSource()` s'est refermé TROIS fois dans la journée**, sur
trois personnes différentes. Si tu écris `cle(...)` dans une fonction qui reçoit un
id de trimestre, ou dans un test dont l'actif n'est pas le sujet, tu viens
probablement de le rejouer.



**CE QUI A ÉTÉ LIVRÉ**
- **S5 / #623 — le régime des cartouches passe de GLOBAL à NAMESPACÉ par trimestre.**
  Les quatre volets dans le même commit : routage (`cle()`/`cleSource()`), migration au
  boot, les deux fonctions d'archivage, et **54 sites routés**. Deux trimestres portant
  la même grille ne s'écrasent plus.
- **Un fil de détente ajouté** : l'archivage **REFUSE** et **NOMME** les grilles si des
  cartouches vivent encore sous clé nue, au lieu d'écrire un snapshot amputé — et
  `archiverTrimestre` **lit ce refus AVANT** de poser le moindre drapeau.
- **#640** — la section d'ouverture est verrouillée (16 cas, 11 rouges obtenus).
- **Corrections d'audit** : Z1-S1 recompté en **cinq familles** (la vraie famille du
  constat compte **cinq** sites, pas quinze) ; Z2:830 **faux sur trois implémentations
  sur quatre**, et le remède tient dans un helper partagé par **cinq** collections.
- **Sept items inscrits** : #636 à #643. **Dernier ID utilisé : #643.**

**CE QUI RESTE, ET QUI N'EST PAS BLOQUÉ**
1. **Une spec WebKit DÉDIÉE à S5.** La suite existante est verte et a déjà attrapé la
   régression ci-dessus — mais **aucune spec ne vise S5 nommément**. Il en faut une :
   la barre latérale des cartouches et la matrice affichent celles du trimestre ACTIF
   après migration, et un trimestre désarchivé retrouve les siennes.
2. **#636** — les 15 sites de `scripts/`, **deux sous-cas et deux remèdes** (voir la
   consigne). Ce sont des outils de RÉPARATION : ils mentiront par zéro.
3. **#643** — le fichier `.lcz` ne porte pas le trimestre source des cartouches ; le
   schéma du manifeste est FERMÉ, c'est une évolution de format.

⛔ **LE MORATOIRE À TROIS GESTES N'EST PAS LEVÉ.** S5 referme le régime des cartouches ;
il ne rend ni chemin de restauration à l'export, ni lecteur au snapshot. **La levée est
une décision de Grégoire.**

---

## État

| | |
|---|---|
| ⛔⛔ **MORATOIRE ACTIF — TROIS GESTES DE L'ÉCRAN TRIMESTRES SONT INTERDITS** | ⚠⚠ **AU 31 AOÛT AU MATIN, LE CODE DE S4 / #622 EST LIVRÉ ET POUSSÉ (`b888d6b2`), ET LE MORATOIRE TIENT QUAND MÊME.** Archiver ne détruit plus aucun modèle — vérifié en Vitest (14 cas, 7 break-tests rouges) ET dans WebKit contre le vrai `index.html` (`tests/integration/archivage-lecture-seule-622.spec.js`, 3 cas, 3 break-tests rouges). **Mais la LEVÉE est une décision de Grégoire, pas d'une session, et il ne l'a pas prise.** T4.4 reste ouverte pour cette seule raison. ⮕ Ce que S4 n'a PAS réparé, et qu'il ne faut pas croire réparé : **le fichier « Exporter » n'a toujours AUCUN chemin de restauration** (`type: 'archive-trimestre'` reste écrit et jamais lu), et **le snapshot n'a toujours AUCUN LECTEUR** — il est complet désormais, mais rien ne le relit. Les branches (b) et (c) du moratoire gardent donc tout leur sens même après la levée de (a). Texte d'origine : **Décision D1 de Grégoire, option A, le 30 août 2026 au soir, ÉLARGIE le même soir à trois gestes après mesure. Elle court À PARTIR DE MAINTENANT, jusqu'à la livraison de S4 / #622** du plan `plans de travail/PLAN-modele-objets-conception-2026-08-30.md`. ⮕ **(a) « Archiver » un trimestre** (`js/trimestre-v2-liste.js:179` → `creerSnapshotRessources`, `js/trimestres.js:728`) : il écrase des collections vivantes post-#358. ⮕ **(b) « Supprimer… » un trimestre** (`js/trimestre-v2-liste.js:396-408`) : son filet de sauvegarde est TROUÉ, et la modale annonce pourtant une « copie de secours » — si l'export échoue elle demande « Supprimer quand même, SANS copie de secours ? », ce qui laisse croire qu'un export réussi EST une copie de secours. ⮕ **(c) « Exporter » sur une ligne NON ACTIVE** : le fichier produit n'est pas fidèle. **Sur la ligne du trimestre ACTIF, l'export reste correct et utilisable** — les lignes fautives tombent juste quand `id` est le trimestre actif. ⮕⚠ **LA PRÉMISSE QUI RENDAIT L'OPTION B ACCEPTABLE EST FAUSSE, et c'est MESURÉ** : le plan et l'audit disaient tous deux que les modèles détruits « survivent dans le snapshot de backup ». `js/trimestres.js:766-779` construit ce snapshot avec `grilles: grillesUtilisees` et `echelles: echellesUtilisees` — **les survivants déjà filtrés** — et `cartouches: nbCartouchesCopies`, qui est **un nombre**. Le commentaire du code dit « backup complet ». Il ne contient AUCUN modèle détruit et AUCUNE cartouche. Il n'existe donc nulle part de copie de ce que l'archivage supprime. ⮕ Les quatre autres décisions (D2 à D5, toutes option A) sont consignées en S0 du plan, avec leurs conséquences. |
| **Branche à ouvrir** | **`main`** — tout y est. ⚠ **Cette ligne était FAUSSE du 29 au 30 août** : `origin/claude/relais-md-continuation-b7i2jq` portait une SECONDE release 1.106.3 et quatre commits d'avance. Tranché le 30 au matin (report du seul livrable, abandon de la branche) — elle est vraie de nouveau, et c'est l'audit de début de session qui l'a attrapée, pas la lecture de ce fichier. |
| **Version** | **1.106.13** — build `0831-0734`, **POUSSÉE le 31 août au matin** (`b6e7593b`). **Release GROUPÉE de trois sessions parallèles**, un fichier par session, **aucune collision** : **S4 / #622** (`b888d6b2` + `5a6891f6`, `f3`) — archiver un trimestre ne détruit plus ses modèles, et l'export d'archive cesse de lire le trimestre actif ; **S7 / #625** (`1530873b`, `9a`) — les états de création ne survivent plus à l'abandon ni à la bascule ; **S8 / #626** (`78c18b53`, `e5`) — 17 symboles retirés, **trois constats de l'audit du 30 août RÉFUTÉS à la mesure**. **Vitest 415 fichiers / 4408 tests · Playwright WebKit 210 passés + 3 instables PRÉ-EXISTANTES · code de sortie 0 pour les deux**, mesurés sur ARBRE GELÉ (zéro fichier suivi modifié). **Break-tests : 7 (S4 Vitest) + 3 (S4 WebKit) + 6 (S7) + 3 (S8) = 19, tous ROUGE obtenu.** ⚠ **Grégoire doit recharger sa session `file://`** : 18 jetons ont changé. ⏳ **UN SEUL test manuel dû, et c'est le seul qu'aucune machine ne pouvait faire** : parcourir les six sous-sections de Conception, et vérifier que le bouton « nouvelle pratique » ouvre bien le wizard V2 (T8.4). ⛔ **LE MORATOIRE À TROIS GESTES N'EST PAS LEVÉ** — voir l'en-tête. |
| **Version précédente** | **1.106.11** — build `0830-1525`, **POUSSÉE le 30 août à 15 h 30** (`17fb5f2a`). Trois patches successifs du plan « chaîne d'importation des travaux » : **1.106.9 / #607** (retirer un jeton de reprise emporte son fichier), **1.106.10 / #608** (le bouton « jeton » n'est plus offert au-delà du maximum par production ; un rattachement n'est plus annoncé comme un jeton), **1.106.11 / #609** (l'assemblage ne soude plus deux copies homonymes ni deux remises datées différemment — le BLOQUANT de l'audit). **Vitest 408 fichiers / 4265 tests · Playwright 210/210 · code de sortie 0**, mesurés sur l'état exact de la release. **13 break-tests sur les trois sessions, 13 ROUGE.** ⚠ **Grégoire doit recharger sa session `file://`.** ⏳ **Trois tests manuels dus** (Mac et iPad) : retirer un jeton et vérifier que la ligne de l'originale rouvre le fichier ORIGINAL · `maxParProduction = 1` puis un troisième fichier, le bouton « jeton » ne doit plus paraître · un lot de photos iPad contenant deux homonymes, les deux élèves doivent recevoir leur copie. ⏸ **PAUSE DEMANDÉE PAR GRÉGOIRE (crédits) après S3.** Le plan `plans de travail/PLAN-chaine-importation-travaux-2026-08-30.md` reprend à **S4** (#610), qui dépend de S3 — fait. Son tableau d'état est la seule vue d'ensemble : S0, S1, S2, S3 LIVRÉS ; S4 à S10 à faire. Rien n'est en suspens dans l'arbre. ▣ **Grégoire écrivait depuis Cowork en parallèle** (14 h 54) : deux prompts de cadrage d'audit et la sortie SSOT régénérée sont apparus dans l'arbre pendant les sessions terminal. Traités par staging chirurgical — chaque commit n'a indexé que ses propres fichiers, nommés un par un. **CLOS le jour même** : les prompts sous leur propre message (`8e3e99c9`), la sortie SSOT dans `836936d5`. Rien en suspens. |
| **Version précédente** | **1.106.5** — build `0830-1249`, **POUSSÉE le 30 août à 13 h** (`de5e42d0`). Patch : un seul numéro pour trois chantiers — **#597** (le HEIC lu quand c'est possible, et DIT quand ça ne l'est pas), **#599** (les bibliothèques partagées) et **#522 lots 2, 3 et 5a**. Rien de visible ne change à l'écran : ce sont deux pannes vécues. Changelog écrit AVANT `release.mjs`, donc son propre jeton bumpé avec le reste. **25 jetons bumpés par le script, un 26e à la main.** ⚠⚠ **CE QUE CETTE RELEASE A APPRIS — UN TROU DANS LES TROIS FILETS ANTI-CACHE.** `release.mjs` a signalé « non référencés dans index.html, ignorés : js/heic-worker.js ». Un fichier tiré par `importScripts` ou par `new Worker(...)` n'est dans le périmètre d'AUCUN des trois filets : ils partent tous du postulat qu'un fichier servi porte une balise `<script src>` dans index.html. Son jeton vit EN DUR dans le code appelant — personne ne le bumpe, et personne ne signale qu'il ne l'a pas été. **Les trois rendent un vert.** Même famille que #600 : un contrôle qui ne distingue pas « vérifié et bon » de « hors de mon périmètre ». Inscrit **#602**. Le geste qui manque : grepper les `?v=` qui vivent ailleurs qu'en index.html (`new Worker\(['\"][^'\"]*\?v=` et `importScripts\(['\"][^'\"]*\?v=`). **Vitest 4206/4206 (403 fichiers) · Playwright 207/207 · zéro échec**, mesurés sur l'état exact de la release. ⚠ **Grégoire doit recharger sa session `file://`** : 26 jetons ont changé. |
| **Version précédente** | **1.106.3** — build `0830-0815`, **poussée le 30 août au matin** (`c2e12dcd`). Patch : **#522 — l'audit des courses lecture-modification-écriture est FAIT, et son lot 1 est livré** (la clé `pratiquesConfigurables` : 22 écritures passent par `db.modifier`). Entrée 1.106 du changelog complétée d'un item, jeton de `changelog-data.js` bumpé à la main. **Vitest 4082/4082 (391 fichiers) · Playwright 207/207.** ⚠ **Grégoire doit recharger sa session `file://`** : cinq jetons ont changé. |
| **Version précédente** | **1.106.2** — build `0829-1813`, **POUSSÉE le 29 août en soirée** (`d1983402`). Patch : l'audit Évaluations du 25 août bouclé (#562, #560, #561, #566, #571, #567, #570, #568, #569, #572). Entrée 1.106 du changelog complétée de six items, jeton bumpé à la main. **Vitest 4074/4074 · Playwright vert.** Bump lancé session ouverte (règle assouplie par Grégoire ce jour : il recharge). |
| **Version précédente** | **1.106.1** — build `0829-1113`, **POUSSÉE le 29 août à 12 h 40** (`ecd22a59`). Patch : #578 (cartouche : échelle choisie, listes rebranchées), #594 (bandeau de version au chargement), #563 (case « Reprise ciblée » retirée), #574 (plus d'échelle semée), #593. Entrée 1.106 du changelog complétée de quatre items, jeton bumpé à la main. **Vitest 4032/4032 · Playwright vert.** Session `file://` fermée par Grégoire pour ce bump. |
| **Version précédente** | **1.106.0** — build `0829-0303`, **POUSSÉE le 29 août à 3 h 20** (`59c615bb`). Minor : les repères de maîtrise se posent partout où l'échelle se pense (#555 lot 2 complet, #577), plus #556, #563, #572 partiel, retrait « Alléger ». Entrée 1.106 du changelog écrite, son jeton bumpé à la main. **Vitest 4011/4011 · Playwright vert** (verdict enregistré au SHA par `pousser.sh`). ⚠ **Grégoire doit recharger sa session `file://`** : 27 jetons ont changé. |
| **Version précédente** | **1.105.0** — build `0828-1405`, **DÉPLOYÉE le 28 août à 14 h 05**. Minor : une échelle porte ses deux **repères de maîtrise**, et les **32 comparaisons IDME écrites en dur** ont disparu des DEUX documents remis à l'élève (PDF de synthèse : 14 → 0 ; bilan à l'écran : 18 → 0). **Vitest 3887/3887 (364 fichiers) · Playwright 199** au moment du bump. ⚠ **Grégoire doit recharger sa session `file://`** : 28 jetons ont changé. |
| **Version précédente** | **1.104.0** — build `0827-1245` (`588debf1`). Minor : la carte « Observation de la structure » rend un bloc par niveau de l'échelle, et le SOLO d'un critère vient du champ configuré. **Vitest 3715/3715 (350 fichiers) · Playwright 193/193**, verdict vert enregistré au SHA par `scripts/pousser.sh`. ✅ **AUCUN BUMP DÛ** : rien de code applicatif n'a changé depuis — seuls un test de constat et de la documentation. ⚠ **Grégoire doit recharger sa session `file://`** : huit jetons anti-cache ont changé au bump. |
| **Avant-dernière** | **1.103.1** — build `0827-0953`, qui a porté six changements de code sans bump (pas 3c-3, pas 4, #547, #550, #551) : la session `file://` de Grégoire était ouverte, et la règle du projet interdit de bumper pendant. **C'est la seconde fois de la journée que l'application annonce un numéro plus ancien que son code.** |
| **Travail en avance sur `main`** | ✅ **NON — TOUT EST POUSSÉ**, le 31 août au matin. `main` = `origin/main` = `b6e7593b`, arbre propre hors les deux mêmes fichiers non suivis qu'hier (`_sauvegarde-20260830-1905/` et `ETAT-AVANT-REDEMARRAGE-2026-08-30.md`), dont le sort se demande à Grégoire. ⮕ **Les trois sessions ont commité par staging chirurgical**, chemins explicites, `git diff --cached` lu ENTIER à chaque fois — et chacune a vérifié que les fichiers non commités des deux autres étaient restés intacts. ⚠ **UNE RÈGLE NEUVE, PAYÉE CE MATIN** : le hook anti-cache compare l'`index.html` **STAGÉ** à celui de **HEAD**. Un bump de jeton commité À PART fait donc échouer le commit SUIVANT. **Le jeton doit voyager dans le MÊME commit que le fichier `js/`** — donc sur un dépôt à plusieurs sessions, le coordinateur bumpe et LÈVE l'interdit sur `index.html` pour ce commit-là, au lieu de committer le bump lui-même. Entrée précédente :
| **Suite Playwright** | ⚠⚠ **LA LEÇON DE LA NUIT DU 27-28 AOÛT, ET ELLE VAUT POUR TOUT CHANTIER DE RENDU.** Les DEUX régressions de la nuit ont été invisibles à Vitest — 3767/3767 puis 3780/3780, verts pendant que Playwright rougissait. Vitest tourne dans `node`, sans navigateur ; **Playwright tourne dans WebKit, le moteur de Safari, contre le vrai `index.html`**. ⮕ **Sur un lot qui touche l'affichage, la suite navigateur n'est pas une formalité de fin : c'est la seule qui voit.** ⮕ Corollaire découvert le 28 : une vérification qu'on croyait réservée à Grégoire (« porte terrain ») est souvent automatisable en spec WebKit — la porte 2.6 l'a été. |
| ⚠ **AVANT TOUTE SUITE PLAYWRIGHT** | **fermer GitHub Desktop.** Les specs lisent l'arbre de travail en direct ; une commande git lancée pendant la suite change les fichiers sous leurs pieds et fait rougir des specs au hasard. Trouvé le 26 août (#523), règle versée au skill `portes-terrain`. |
| ⚠ **LE CLONE DE GRÉGOIRE EST L'ARBRE DE TRAVAIL** | `/Users/kuekatsheu/Documents/GitHub/Monitorage_v6` sert à la fois de dépôt de travail et de source `file://` pour son app. Il voit les modifications dès qu'il recharge, **avant tout push** — et peut donc tomber sur un état intermédiaire. Le `git pull` des portes terrain lui est inutile. |
| 📐 **CHANTIER MAJEUR — LIVRÉ, ET CETTE LIGNE ÉTAIT FAUSSE** | **#529 est LIVRÉ depuis le 26 août** (1.101.0 → 1.101.1, quatre lots : conversion, calcul, affichage, aide). Cette ligne l'annonçait encore « en attente » le 27 après-midi, et une session s'apprêtait à rouvrir un chantier fait. ⮕ **CE QUI RESTE EN SONT LES QUATRE SUCCESSEURS**, et aucun n'est un oubli : ~~**#537**~~ et ~~**#535**~~ (**LIVRÉS le 27 août** avec #552 — voir ci-dessous), **#539** (les clés du volet confidentiel — des CLÉS DE DONNÉES, pas des libellés), **#536** (`idmeMoyen` à 0 vs « pas de donnée », risque très réduit depuis #529). Audit d'origine : `Rapports/AUDIT-srpnf-code-en-dur-2026-08-26.md`. |
| ⏳ **ÉCHÉANCE DATÉE — 1er SEPTEMBRE, DANS 4 JOURS** | **#427** + **#508**. ✅ **GRÉGOIRE TIENT LA DATE** (arbitré le 28 août au soir, option A ; « repousser » posé et écarté). ⮕ **DÛ PAR LUI, ET PAR PERSONNE D'AUTRE** : les trois noms Cloudflare, la durée de session, la règle `Include` de la policy dormante. ⮕ **MESURÉ le 28 août** : l'avis est bien en ligne aux deux endroits (`accueil.js`, `transitions.js`), et **le bandeau s'éteint SEUL le 1er septembre** — rien à retirer à la main. Reste à réécrire le paragraphe d'accueil **au présent**. |
| ⚠ **DEUX SESSIONS ONT TRAVAILLÉ DANS CE DÉPÔT LE 26 AOÛT** | Et elles ne se voyaient pas. Un `git add -A` de la session « audit Conception » a emporté le `js/saisie-presences.js` de l'autre dans son commit de relais ; sorti et rendu avant le push. ⮕ **La consigne du projet vaut : ajouter par chemins EXPLICITES**, jamais `-A`, sur ce dépôt. ⮕ Et le hook pré-push teste l'ARBRE DE TRAVAIL, pas les commits envoyés : tant qu'une autre session y travaille, il rend un verdict sur un mélange des deux — le rouge qu'il annonce peut n'avoir aucun rapport avec ce qu'on pousse. ⮕ **ET C'EST ARRIVÉ UNE SECONDE FOIS LE MÊME JOUR, dans l'autre sens.** Le commit `38c6b574` (« #529 lots 3-4 », profil étudiant) a emporté les `BACKLOG.md` et `SESSION.md` de la session « présences » — l'inscription de l'item **#538** et la renumérotation **#534 → #537** vivent donc dans un commit qui parle d'autre chose. Rien n'est perdu, la trace est fausse ; poussé, donc non réécrit. **Deux avertissements en un jour : sur ce dépôt, `git add` par chemins explicites n'est pas une préférence, c'est la seule méthode qui tienne.** |
| ⚠ **TROIS SESSIONS ONT TRAVAILLÉ DANS CE DÉPÔT LE 26 AOÛT AU SOIR** | Et une **quatrième journée de collisions d'index** s'y est ajoutée : un `git add` suivi d'un `git commit` a emporté le travail d'une autre session entre les deux gestes. Défait et rendu avant tout push. ⮕ **La méthode qui tient : `git add -N <fichiers neufs>` puis `git commit -- <chemins explicites>` DANS LA MÊME COMMANDE.** `--only` seul refuse un fichier neuf (« did not match any file(s) known to git ») ; `git add` puis `commit` rouvre la fenêtre. ⮕ **Et le même oubli d'anti-cache s'est produit QUATRE fois en deux jours, sur trois sessions et trois chantiers sans rapport** : un fichier modifié dont le `?v=` ne suit pas. Ce n'est plus une étourderie — **c'est une lacune du filet**, inscrite en **#547** : la sentinelle compare des COMMITS, elle ne peut donc rien voir tant que le travail est dans l'arbre, et le hook `pre-push` la lit trop tard. Le geste correcteur est connu de tous et appliqué correctement à chaque fois ; ce qui manque, c'est le RAPPEL AU BON MOMENT. |
| **Dernière mise à jour** | **30 août 2026, 12 h 30** — **trois sessions dans le même arbre**, coordonnées par messages. **#597 CLOS** (`20e4feaf`, **non poussé**) : le décodeur HEIC fonctionne mais n'a AUCUN chemin en `file://`, et l'application le DIT désormais au lieu de laisser passer un fichier muet en 0 x 0. ⚠⚠ **LE FAIT À RETENIR : un `blob:` worker HÉRITE de la CSP du document, un worker chargé par URL same-origin non** — c'est ce qui ferme la dernière voie, pas le `file://`. ⮕ **Et la leçon de méthode : la mesure du matin était VRAIE et INCOMPLÈTE** — « converties en 3024x4032 » était exact sous serveur, personne n'avait écrit dans quel mode. **Vitest 4195/4195 (402 fichiers)** · Playwright 207/207 sur deux suites. ⏳ **Reste, et c'est une décision de Grégoire à froid : le lanceur local** (servir l'application ferait marcher le décodeur tel quel, mais change son geste de lancement et emporte tablette + clé Codex). Entrée précédente : **30 août 2026, fin de journée** — session unique. **#522 lot 4 LIVRÉ** (le helper des bibliothèques, cinq familles d'un geste) · **#503 étendu aux cartouches** · divergence des deux 1.106.3 TRANCHÉE (report de #555·2, branche abandonnée) · **#508 : trois gestes de code**, pas un — la spec rougirait seule le 1er septembre · consigne de démarrage et artefact de refermage écrits. **Vitest 4114/4114 (395 fichiers)** · ⚠ **Playwright NON relancé, et il est DÛ.** 1.106.4 due, rien poussé. Entrée précédente : **30 août 2026, 8 h 20** — session unique (matin). **#522 : l'AUDIT est fait (213 séquences mesurées, 102 en course) et le LOT 1 est LIVRÉ** — rapport `Rapports/AUDIT-522-courses-lecture-ecriture-2026-08-30.md`. **1.106.3 poussée** (`c2e12dcd`). ⚠⚠ **LE FAIT À RETENIR : `getSync` NE PROTÈGE PAS** — dans `db.set`, l'écriture IndexedDB est attendue AVANT le rafraîchissement de localStorage, donc un concurrent lit encore l'ancienne valeur. ⚠ **Et le banc mentait** : Node n'a pas d'IndexedDB, `db.js` s'y rabat sur localStorage-seul où `set` est synchrone — les six cas passaient au VERT sur le code NON corrigé ; il faut forcer `useIndexedDB` avec une fausse connexion. **Reste 89 sites, quatre lots** ; le plus rentable est le helper `BibliothequeUI` (14 sites, 7 fichiers, un seul changement de contrat pour les cinq familles). Entrée précédente : **29 août 2026, 20 h 15** — session unique (journée entière). **Audit Évaluations bouclé** (#562, #560, #561, #566, #571, #567, #570, #568, #569, #572), #595 et #596 inscrits, artefact de vérification terrain remis. **1.106.2 poussée** (`d1983402`). Entrée précédente : **10 h 30** — session unique (matin). **#578 LIVRÉ** (option A) + régression du 26 août réparée (listes du formulaire de cartouche mortes) ; **#574 retrait LIVRÉ** (option B, sonde due) ; **#593 LIVRÉ** (n° 5-6-7, course fermée) ; **#563 LIVRÉ** (case retirée) ; **#594 LIVRÉ** (bandeau de version au chargement) ; **#562, #560, #561, #566, #571, #567, #570, #568, #569 et #572 LIVRÉS** (après 1.106.1 — **bump 1.106.2 dû**) ; **#595 inscrit** ; **référence unique créée** (`Rapports/SUIVI-conception-evaluations-2026-08.md`) ; #593 inscrit ; 1.106.0 déployée à 3 h. ✅ **1.106.1 poussée à 12 h 40** (`ecd22a59`). Entrée précédente : **3 h 40** — session unique (nuit). **1.106.0 poussée** ; **#578 : le diagnostic console est LIVRÉ** (`await _diagnostiquerEchellesGrilles()`), sentinelle 6 cas / 4 mutations rouges ; **le chiffre est DÛ par Grégoire**. Fait mesuré : l'éditeur de grille n'écrit jamais `echelleId`. Entrée précédente : **28 août, 21 h 15** — session unique (soir). **#555 lot 2 (d) et (e) + #577 LIVRÉS** ; #579 livré pour le cas de l'assistant ; **#592** inscrit. **Vitest 4011/4011** (377 fichiers) · **Playwright 201** (198 verts + 3 instables pré-existantes, vertes au second essai), sur arbre gelé. ⚠ **AUCUN BUMP** : du code a changé (6 fichiers `js/`, `?v=` bougés) mais je ne sais pas si la session `file://` de Grégoire est ouverte — **1.106.0 (minor) est DUE**, à lancer par `node scripts/release.mjs minor` au prochain démarrage. Entrée précédente : **20 h 15** — fin de journée, **trois sessions**. Les **21 arbitrages de Grégoire sont TRANCHÉS et consignés dans leurs items**. Livré : #555 lot 2 (b), #556, #557, l'audit des copies d'échelle, le diagnostic des résolveurs. **Vitest 3983/3983** (374 fichiers) · **Playwright 199/199**, relancés sur arbre gelé avant le push. **Aucun bump** : 1.105.0 tient — que de la documentation, aucun `?v=` à bouger. |

## ▶ POUR LA SESSION QUI PREND LE RELAIS — 31 AOÛT 2026, MATIN (SESSION `f3`, TROIS SESSIONS)

**Tu arrives sur un dépôt tout poussé, tout vert, et sur une phase qui a CHANGÉ de nature :
la phase de mesure s'est fermée hier soir, celle d'exécution s'est ouverte ce matin et a
livré trois de ses huit sessions.** `kuekatsheu-f3` (S4, coordination, release, push),
`kuekatsheu-9a` (S7), `kuekatsheu-e5` (S8). Aucune collision.

**LIS D'ABORD** `CONSIGNE-DEMARRAGE-PROCHAINE-SESSION.md` à la racine, réécrite pour toi le
31 août — elle porte le détail de S5 et de la suite. Puis le tableau d'état de
`plans de travail/PLAN-modele-objets-conception-2026-08-30.md` et sa section « Répartition du
31 août ». **Ne crois pas un `LIVRÉ` sur parole : vérifie dans `main`.**
⚠ **Il n'y a plus qu'UNE consigne à la racine, et son nom ne porte pas de date** :
`CONSIGNE-DEMARRAGE-2026-08-31.md` a été retirée (elle est dans l'historique git). Deux consignes
datées cohabitaient le 31 au matin, dont une du 30 encore présentée comme courante — un nom qui
ne peut pas rôtir vaut mieux qu'une date qu'on oublie de retirer.

⛔ **CE QUI PRIME ENCORE, ET QUI N'A PAS CHANGÉ DE STATUT : LE MORATOIRE EST TOUJOURS ACTIF.**
Le code ne détruit plus rien — c'est mesuré, en Vitest ET dans WebKit contre le vrai `index.html`.
**Mais lever le moratoire est une décision de Grégoire, et aucune session ne la prend à sa place.**
Voir l'en-tête de ce fichier. T4.4 reste ouverte pour cette seule raison.

⮕ **ET LA BONNE FAÇON DE DIRE CE QUE S4 RÉPARE, parce que l'autre est trompeuse.** Ce n'est PAS
« le filet de sauvegarde fonctionne maintenant ». **Vérifié le 31 août : `snapshot_<id>_*` est ÉCRIT
et JAMAIS RELU par aucun chemin de l'application** — grep de `snapshot_`, `snapshotRessources`,
`isolationArchive` dans tout `js/`. Même famille que `type: 'archive-trimestre'`, qui n'apparaît lui
aussi qu'une fois, à l'écriture. **La réparation, c'est qu'il n'y a plus rien à rattraper : les
collections de travail survivent à l'archivage.** Le snapshot complété ne servira que le jour où
quelqu'un écrira un chemin de restauration. **Ne le présente pas comme une sauvegarde.**

**CE QUI RESTE DU PLAN CONCEPTION** : S5 (#623), S6 (#624), S9 (#627), S10 (#628), S11 (#629),
S12. ⚠ **L'ordre S4 → S5 → S6 tient toujours**, et S5 migre des DONNÉES RÉELLES : sauvegarde
préalable PAR COPIE obligatoire. S9 est libre après S2. S10 a reçu ce matin une mesure qui le
prépare (voir #628) **et un couplage à ne pas perdre** : le cas E.a de
`tests/unit/sentinelle-625-etats-edition-purges.test.js` exerce la branche que S10 doit retirer —
il doit partir AVEC elle.

**DEUX ITEMS NEUFS, tous deux SORTIS d'un lot plutôt que bâclés dedans** : **#633** (fusionner les
deux `annulerFormProduction` — les DEUX sont vivantes, la fusion change quatre sites d'appel et
répare un défaut latent : ce n'est pas un retrait sûr statiquement) et **#634** (le repli vers la
bibliothèque de pratiques partagée n'a jamais fonctionné — le corriger serait un changement de
comportement déguisé en coquille, c'est un arbitrage métier).

⚠⚠ **TROIS CONSTATS DE L'AUDIT DU 30 AOÛT SONT FAUX, ET C'EST INSCRIT, PAS CORRIGÉ EN SILENCE.**
M11 (`planificationCarte.etat` A trois consommateurs vivants — le retirer casserait l'export du plan
de cours et quatre sentinelles), M5 (`sauvegarderModeCalculObjectifs` a un appelant et n'est pas
exportée), et un chemin de fichier qui n'a jamais existé (`js/pratique-interface.js` ; le vrai est
`js/pratiques/pratique-interface.js`, **un fichier de DOCUMENTATION jamais servi — ne pas le
supprimer parce qu'il ne se charge pas**). Voir la section dédiée de `BACKLOG.md`.

⏳ **UN SEUL TEST MANUEL EST DÛ**, et c'est délibéré : parcourir les six sous-sections de Conception,
et vérifier que « nouvelle pratique » ouvre le wizard V2 (T8.4). **T4.3 a été SUPPRIMÉE comme porte
terrain** et remplacée par `tests/integration/archivage-lecture-seule-622.spec.js` — application de
la règle 1 du skill `portes-terrain` (aucune porte si une machine peut répondre), et la machine
répond mieux : elle relit le contenu du fichier téléchargé, ce qu'un test manuel ne fait pas.

### Les cinq choses apprises ce matin, que la prochaine session ne doit pas réapprendre

1. ⚠⚠ **`chargerScript` passe les variables de MODULE en PARAMÈTRES de la fonction sandbox.** Une
   réassignation interne est invisible depuis le test, et un `win.X = {…}` posé par le test n'atteint
   jamais le code : `expect(win.grilleTemplateActuelle).toBeNull()` **passe sur `undefined`** sans
   rien vérifier. Un pointeur de module ne se teste que par son **EFFET** observable, en le posant
   par le vrai chemin d'entrée. Trouvé par `9a` dans un banc qui rendait pourtant déjà six rouges —
   **un rouge obtenu ne dit pas que les autres cas assertent quelque chose.**
2. ⚠ **Le hook anti-cache compare le STAGÉ à HEAD.** Un bump commité à part fait échouer le commit
   suivant : le jeton doit voyager dans le MÊME commit que son fichier `js/`. Et le conseil qu'affiche
   le hook (« incrémenter la lettre ») induit en erreur — le jeton porte le **jour du BUILD**.
3. ⚠ **Retirer du code mort emporte parfois l'unique SUJET d'une assertion voisine.** Trois cliquets
   ont dû suivre S8 (#557, #338, #389). Le bon geste sur #389 a été de **SCINDER** la liste en deux
   familles, pas de la raccourcir : raccourcir affaiblit le cliquet sans laisser trace du pourquoi.
4. ⚠ **Un break-test doit muter chaque CÔTÉ, pas seulement le correctif.** `e5` a muté le côté
   RÉFUTATION (retirer `etat: etat,` de `planification-carte.js`) pour vérifier que la garde qui
   protège un constat réfuté mord vraiment. Sans ça, une réfutation reste une note de bas de page.
5. ⚠ **Un motif reconnu n'est pas un fait mesuré.** `f3` a lu « `20260830i -> 20260831a` » dans la
   sortie de `release.mjs`, reconnu le trou #547, et annoncé à Grégoire un défaut qui n'existait pas :
   le commit `15ef1c45` avait bien bumpé le jeton. Corrigé avant le push, mais l'affirmation était
   déjà partie. **Le commit intermédiaire se lit avant de conclure.**

---

## ▶ POUR LA SESSION QUI PREND LE RELAIS — 30 AOÛT 2026, 22 h 30 (SESSION `bc`, TROIS SESSIONS)

**Tu arrives sur un dépôt tout poussé, tout vert, et sur une phase de projet qui
vient de se fermer.** Trois sessions ont travaillé en parallèle ce soir sans une
seule collision : `kuekatsheu-c5` (Z1), `kuekatsheu-82` (Z2), `kuekatsheu-bc`
(Z3, fichiers partagés, release et push). Aucune n'a écrit dans `js/`,
`index.html` ni `tests/` — c'était le cadre, et il a tenu.

**LIS D'ABORD** : `CONSIGNE-DEMARRAGE-2026-08-31.md`, réécrite pour toi ce soir.
Puis le **tableau d'état** de `plans de travail/PLAN-modele-objets-conception-2026-08-30.md`,
qui est la seule vue d'ensemble.

**CE QUI EST FERMÉ** : la phase de MESURE du plan Conception, entièrement.
S0 (les cinq décisions, toutes option A), S1/Z1 (`e766339a` pour Z3, `fc203e58`
pour Z1, `56562f85` pour Z2). Les sessions d'exécution n'auront plus à auditer :
elles ouvrent sur des diffs déjà spécifiés.

⛔ **CE QUI PRIME SUR TOUT LE RESTE, ET C'EST MESURÉ SUR LES DONNÉES RÉELLES** :
**archiver Hiver 2026 aujourd'hui détruirait ses DIX pratiques.** Pas « substituerait » —
détruirait. Le trimestre actif (`a2026`) n'a qu'UNE pratique, aucun identifiant ne se
recoupe, l'intersection est donc vide et l'archivage écrirait un tableau vide par-dessus.
Il n'existe **aucune copie de secours** : le snapshot n'enregistre que les survivants, et le
fichier « Exporter » n'a **aucun chemin de restauration** dans l'application.
⮕ **S4 (#622) n'est pas dû, il est URGENT.** Le moratoire élargi est ce qui tient la porte
d'ici là — voir l'en-tête de ce fichier.

**LES TROIS DIAGNOSTICS ONT ÉTÉ EXÉCUTÉS PAR GRÉGOIRE.** Leurs résultats sont
consignés dans les rapports. Deux choses n'y sont PAS et devraient y être si
Grégoire a encore ses sorties : le **JSON brut** de T1.2 et de #630, aux §3 et
§3bis du rapport Z1 (ce qui y est aujourd'hui est un relevé de seconde main, et
c'est écrit comme tel).

**#631 / #632 — ce qui a été trouvé hors plan.** 408 évaluations d'Hiver 2026
pointent vers trois grilles qui n'existent nulle part. ⚠ **Ce n'est PAS une perte
en cours** : l'hypothèse a été instruite puis RÉFUTÉE — les trois chemins
d'écriture refusent, aucune note n'est écrasée. C'est un **gel** : Grégoire ne
peut plus modifier ces 408 évaluations, et le message qu'il reçoit ne dit ni
laquelle, ni combien, ni quoi faire. **Rien ne se dégrade en attendant.**
⮕ **NE PURGE AUCUN des 16 « magasins fantômes » de cartouches** : onze d'entre eux
sont la seule trace restante des trois grilles disparues.

**LA QUESTION PAR OÙ REPRENDRE #632**, et elle n'est pas tranchée : **combien des
408 portent un `criteres[]` non vide ?** Le code établit que la structure existe
et qu'elle est riche ; il n'établit PAS qu'elle est peuplée pour ces 408-là —
`_collecterCriteresSauv` rend `[]` si la grille manquait déjà à l'enregistrement.
**Aucun diff de reconstruction ne doit être écrit avant ce chiffre** : il porterait
sur un matériau dont on ignore s'il existe. Les deux sessions ont refusé de conclure
là-dessus, délibérément.

⚠ **Z3 RENVERSE LA PRÉMISSE DE S10.** Les stubs cachés des quatre sections ne sont
pas du legacy inerte : **les 26 identifiants sont lus par du code ATTEIGNABLE**. Le
retrait en bloc est impossible tel quel. Séquence D1 → D2 → D3 → D4 du §3 de Z3, et
D2 est un **refactor**, pas une suppression. La décision D4 de Grégoire reste
valable ; c'est sa CONDITION qui change.

**Coordination.** Les trois sessions du soir sont terminées. Vérifie par
`ListAgents` avant d'écrire à qui que ce soit. La table de répartition en tête du
plan d'importation est à jour ; **inscris-toi dedans** avant d'ouvrir un `js/`.

**Le fait de méthode de la soirée, et il vaut d'être gardé** : chacune des trois
sessions a corrigé au moins une de ses propres affirmations, sur mesure — un total
gonflé par un scénario impossible, un « structurellement garanti » démenti par les
données, une hypothèse de perte réfutée en l'instruisant. Aucune ne l'a gommée.
C'est ce qui rend les rapports lisibles à froid.

---

## ▶ POUR LA SESSION QUI PREND LE RELAIS — 30 AOÛT 2026, 19 h 50 (SESSION `0d`)

**Tu arrives sur un dépôt à trois commits d'avance, tout vert, et deux sessions
sœurs qui travaillent en parallèle.** Rien n'est en panne. Ce qui reste tient à
des décisions de Grégoire, pas à du code inachevé.

**Ton entrée, dans cet ordre :**

1. `plans de travail/PLAN-chaine-importation-travaux-2026-08-30.md`, **tableau
   d'état en tête** — c'est la seule vue d'ensemble, et il est à jour. Six
   sessions sur onze sont fermées côté code (S0 à S4, S7, S8) ; S5 et S6 sont EN
   COURS chez les deux sessions sœurs ; **S9 (#615) et S10 restent à faire**.
2. La consigne de démarrage à froid écrite pour toi :
   `CONSIGNE-DEMARRAGE-2026-08-31.md`, à la racine.
3. `SESSION.md`, bloc « SESSION 0d », pour le détail de la reprise.

**Ce que tu ne dois PAS refaire** : les deux suites. Vitest 410 fichiers / 4307
tests et Playwright 210/210, code de sortie 0, mesurés le 30 août à 19 h 40 sur
`f419c467`, arbre propre. Refais-les seulement si l'arbre a bougé depuis.

**Trois choses qui n'attendent que Grégoire**, et qu'aucune session ne peut
faire à sa place : les **six tests manuels** (S1, S2, S3, S4, S7, S8), le **go
pour la release groupée et le push**, et **l'arbitrage de la divergence
fail-open** du chemin « ouvrir » de `codex.js`.

⚠ **Coordination.** `kuekatsheu-ff` tient `js/travaux-import.js` (S5),
`kuekatsheu-00` tient `js/liste-evaluations.js`, `js/evaluation-jetons.js` et
`js/travaux-ui.js` (S6). **Tu tiens les fichiers partagés** — `BACKLOG.md`,
`SESSION.md`, `RELAIS.md`, le PLAN — plus la release et le push. N'ouvre aucun
fichier `js/` sans le leur dire. La dépendance à surveiller : `T6.3` attend le
commit de S5 pour libérer `travaux-import.js` ; c'est à toi de passer le signal.
⚠ Et vérifie qu'elles sont vivantes (`ListAgents`) avant de leur écrire : trois
sessions sont mortes ce soir à 19 h 05 sans avoir commité, et c'est ce qui a
occupé la session `0d`.

**Deux fichiers non suivis à trier**, dont la condition de suppression est
remplie mais que je n'ai pas supprimés — une suppression se demande :
`_sauvegarde-20260830-1905/` et `ETAT-AVANT-REDEMARRAGE-2026-08-30.md`.

**Le fait de méthode de la journée, et il vaut pour les sessions suivantes :**
les diffs de `Rapports/AUDIT-chaine-importation-travaux-2026-08-30.md` sont des
**esquisses, pas des spécifications**. Quatre appliqués, quatre corrigés à
l'application — deux en S7, un en S5, et l'ordre prescrit pour T6.6 était fautif.
Ouvre toujours le code de référence que le diff invoque, et grep TOUS les
`return` avant de changer une forme de retour.

---

## ▶ RELAIS PRÉCÉDENT — 30 AOÛT 2026, SOIR (SESSION AUDIT — MÉTHODE COMMUNE DES AUDITS)

**Deux audits livrés sur `main` ce soir, même méthode, et un troisième attendu
demain qui DOIT la suivre.** Le suivi ne se fait NI ici NI dans SESSION.md :
chaque plan porte son propre **tableau d'état** en tête (statut / date / commit
/ note par session de travail), et c'est LUI que la session d'exécution lit en
premier et met à jour en dernier. Ce bloc-ci ne fait que pointer.

| Audit | Rapport (constats, diffs NON appliqués) | Plan (tableau d'état = point d'entrée) | État au moment d'écrire |
|---|---|---|---|
| Chaîne d'importation des travaux | `Rapports/AUDIT-chaine-importation-travaux-2026-08-30.md` (`88a2a244`) | `plans de travail/PLAN-chaine-importation-travaux-2026-08-30.md` | S0 LIVRÉ (D1=A, D2=A, D3=A ; #607–#615 réservés) ; **S1 EN COURS dans une autre session** (`js/evaluation-jetons.js` + sentinelle, non commité) ; S2–S10 À FAIRE |
| Modèle d'objets Conception | `Rapports/AUDIT-modele-objets-conception-2026-08-30.md` (`836936d5`) | `plans de travail/PLAN-modele-objets-conception-2026-08-30.md` | S0 à trancher (D1–D5, dont un **moratoire proposé sur « Archiver un trimestre »** — `creerSnapshotRessources` écrase les collections vivantes post-#358) ; ses S1–S3 sont des sessions d'AUDIT CIBLÉ qui produiront les diffs, S4+ les applique ; **T0.6 (#NNN) PAS ENCORE FAITE** |

**PROCÉDURE COMMUNE — à reproduire pour l'audit de demain** (référence complète :
en-tête et « Comment lire et tenir ce plan » de l'un ou l'autre plan, qui servent
de gabarits) :
1. AUDIT d'abord, lecture seule, dans `Rapports/AUDIT-<sujet>-AAAA-MM-JJ.md` :
   constats BLOQUANT/SÉRIEUX/MINEUR, chacun avec fichier:ligne + extrait +
   scénario de défaillance concret + certitude VÉRIFIÉ/INFÉRÉ/SUPPOSÉ ;
   correctifs en diff NON appliqués nommant ce qu'ils RETIRENT ; section
   « ce qui est solide » ; section « angles morts » (tests appareil).
2. PLAN ensuite, `plans de travail/PLAN-<sujet>-AAAA-MM-JJ.md` : tableau d'état
   en tête (statuts fermés : À FAIRE · EN COURS (date) · LIVRÉ (commit) ·
   BLOQUÉ (motif) · ABANDONNÉ (décision Grégoire, date)) ; sessions S0…Sn de
   90 min = une branche = un merge ; tâches TN.n cochables, cochée = livré-
   testé-MERGÉ ; S0 = décisions FERMÉES de Grégoire consignées avec date +
   réservation des #NNN en une seule écriture ; cadre non négociable ;
   séquence a→g par tâche de code (sentinelle ROUGE d'abord, break-test) ;
   critère de fin observable par session ; dernière session = tests sur
   appareil avec Grégoire (« Observé : ___ »).
3. Committer audit + plan ensemble (`docs(audit): …`), pousser, ajouter la
   ligne au tableau ci-dessus.

**⚠ COORDINATION MULTI-SESSIONS (au moins trois ce soir sur ce dépôt)** :
- `#607–#615` sont PRIS (plan importation). Le plan Conception n'a pas encore
  ses numéros : avant toute réservation, vérifier le DERNIER ID réellement
  inscrit dans BACKLOG.md (≥ #615) et écrire en une seule fois.
- Staging chirurgical partout : jamais de `git add` large, `git diff --cached
  --stat` avant tout commit. `BACKLOG.md`, `SESSION.md` et les plans sont des
  fichiers PARTAGÉS entre sessions.
- Deux constats de l'audit Conception croisent d'autres chantiers :
  `migrerEvaluationsVersNouvelleEchelle` (`echelles.js:4294-4306`) écrit
  `evaluationsSauvegardees` HORS file `db.modifier` — même famille que #522 ;
  les lots jetons du plan importation écrivent cette clé via
  `sauvegarderDonneesSelonMode` (point unique #563), hors file aussi. La mise
  en file de cette clé est un chantier TRANSVERSAL, à traiter comme un lot
  #522, pas à absorber dans l'un des deux plans.

---


## ▶ POUR LA SESSION QUI PREND LE RELAIS — 30 AOÛT 2026, 12 h 30 (SESSION HEIC, TROISIÈME)

### ✅ CLÔTURE — 1.106.5 poussée, et une erreur de comptage corrigée

Le rituel de fin de session a tourné en entier. Audit sécurité : aucun `console.log`,
aucun handler inline, aucun `innerHTML` ajouté, CSP intacte, aucune zone protégée
touchée, zéro `.only`, zéro `.skip`. Les deux `eval(` détectés sont dans des
COMMENTAIRES citant la règle « zéro eval() » — le motif lit les commentaires comme du
code, exactement comme le hook pré-commit.

⚠ **ÉCART RÉCIT↔DIFF, TROUVÉ PAR LE RITUEL ET NON PAR RELECTURE.** Le message de
`20e4feaf` annonce « **Sept** jetons anti-cache bumpés ». Le diff en compte **SIX** :
`travaux-ui.js` avait été bumpé deux fois dans la session et compté deux fois.
L'historique n'a pas été réécrit — le chiffre juste est SIX, et il est corrigé dans le
message de `de5e42d0`. ⮕ Ce que ça vaut pour la suite : un chiffre exact au moment où
on l'écrit peut être faux au moment où on le lit. La confrontation au diff l'attrape ;
la relecture, jamais.

⮕ **Et le trou de filet anti-cache (#602) est le même défaut, en plus grave** : il ne
laisse pas passer un fichier périmé en criant, il le laisse passer en rendant un VERT.

### ⚠ DEUX CAS DU TROU #602 QUI NE PEUVENT PAS ATTENDRE QU'ON CHERCHE L'ITEM

· **`libs/pdf.worker.min.js` est servi SANS AUCUN `?v=`** — par
  `GlobalWorkerOptions.workerSrc` (`travaux-visionneuse.js:59`), donc hors de toute
  balise. Ce n'est pas un jeton oublié, c'est l'absence de mécanisme. Et **il a déjà
  changé** : `410008a6`, 6 février, downgrade PDF.js 4.2.67 → 3.11.174 pour Safari. Un
  navigateur qui tient l'ancien le servira indéfiniment. Ça touche la visionneuse que
  Grégoire ouvre tous les jours.
· **Quatre bibliothèques ont une balise mais aucun jeton** : `chart.min.js`,
  `chartjs-plugin-annotation.min.js`, `jspdf.umd.min.js`, `jspdf-autotable.min.js`. Les
  filets les voient, mais sans `?v=` il n'y a rien à comparer.

### ⚠ CE QUE TROIS SESSIONS DANS UN ARBRE ONT APPRIS — QUATRE FORMES D'UN SEUL DÉFAUT

La journée s'est bien passée, mais le même piège s'est présenté **quatre fois sous
quatre visages**, et aucune vigilance générale ne l'aurait couvert :

1. un `git add` trop large emporte le chantier de l'autre (26 août, et évité ce matin) ;
2. `release.mjs` écrit dans un fichier qu'une autre session tient STAGÉ (évité à midi,
   en vérifiant l'arbre avant de lancer le script) ;
3. un `git commit` sans chemin emporte ce qu'un autre a laissé dans l'index (évité en
   fin de journée par un `git commit -- BACKLOG.md`) ;
4. **un `git push` ne pousse pas « ses » commits, il pousse la BRANCHE** — le dernier
   push de la journée a emporté le commit #602 de l'autre session, qui ne l'avait pas
   encore lancé. Sans dégât ici (lot documentaire, gardes passées à l'identique), mais
   le geste n'était pas volontaire.

⮕ **La leçon n'est pas « faire attention ».** C'est que l'arbre de travail, l'index et
la branche locale sont des ÉTATS PARTAGÉS que personne ne possède. Ce qui a réellement
protégé la journée : dire ce qu'on tient AVANT d'écrire, et vérifier `--cached --stat`
dans les deux sens avant chaque commit. Ce qui a tranché les désaccords : mesurer, pas
argumenter.



### ✅ #597 EST CLOS — commit `20e4feaf`, non poussé

Le décodeur HEIC livré le matin FONCTIONNE. Il n'a simplement aucun chemin d'exécution
dans le mode où Grégoire ouvre l'application. Ce n'était pas une régression : c'était un
mode d'usage jamais couvert, et une mesure vraie mais incomplète.

**Ce qui a été mesuré à neuf** (Chrome de Grégoire, banc isolé hors dépôt, le vrai
`IMG_2179.HEIC` de Breton, 2 909 950 octets) :

| Chemin | Contexte | Résultat |
|---|---|---|
| worker classique | app **servie** (http), CSP réelle | **3024 x 4032** — le noyau est bon |
| worker classique | page en `file://` (double-clic) | `SecurityError`, origine `null` |
| thread principal | CSP + `'wasm-unsafe-eval'` | `EvalError` (le glue emscripten évalue une chaîne) |
| blob worker + `importScripts` | `file://` | le blob worker se construit, mais « failed to load » |
| blob worker + bundle EMBARQUÉ | `file://` | `EvalError` |

⮕ **LE FAIT LE PLUS RÉUTILISABLE DE LA JOURNÉE** : un **`blob:` worker HÉRITE de la CSP
du document**, un worker chargé par **URL same-origin n'en hérite pas**. C'est ce qui ferme
la dernière voie — pas le `file://` lui-même. Aucun contournement ne tient sous « zéro
`eval()` » : **la CSP n'a pas été touchée**.

### Ce que la session a livré

Grégoire a tranché : **refuser proprement maintenant**, décider du lanceur local à froid.

· `decodagePossible()` dans `heic-decodeur.js`, exposé — répond sans construire le worker
  (il tirerait 1,2 Mo).
· `marquerHeicNonDecodable()` appelé par `planifierThumbnail`, donc **dès l'entrée dans la
  file** — et **refait** dans `genererThumbnailQueue`, parce que `reattacherBlobs` (session
  restaurée) court-circuite le premier et que `heicEchec`/`heicRaison` ne survivent pas au
  round-trip `sessionStorage`.
· `heicRaison` porté jusqu'à l'infobulle (échappée). Un HEIC dit maintenant « HEIC non
  décodé » **et pourquoi**, au lieu de « Dimensions inconnues » — le rendu d'un fichier
  corrompu.
· Les libellés de formats ne promettent plus que ce qui est lisible ici
  (`formatsAcceptesLibelle()` dans `travaux-ui.js` et `accompagnement-contenu-popup.js`).
· `#598 volet A` et la balance des blancs : sentinelle du matin reprise au commit.

**Sentinelle** `sentinelle-597-heic-dit-son-impossibilite` (5 cas, dont **un
COMPORTEMENTAL** : le décodeur est exécuté avec un faux `window` pour vérifier
`decodagePossible()` en `file:` et en `http:`). **Break-test : 7 mutations, 7 rouges
obtenus.** Vitest **4195/4195** (402 fichiers) · Playwright **207/207** sur deux suites
complètes · passe ciblée 23/23.

### ⏳ CE QUI RESTE, ET QUI EST UNE DÉCISION DE GRÉGOIRE — PAS UN CHANTIER À OUVRIR

**Le lanceur local.** Tant qu'il n'existe pas, le HEIC n'est pas décodable chez Grégoire —
l'application le DIT désormais, elle ne le cache plus. Servir l'application (un fichier
double-cliquable qui démarre un serveur local) ferait fonctionner le décodeur **tel quel**,
et lèverait au passage le plafond de `localStorage` en `file://`. Mais **ça change son geste
de lancement, et ça emporte l'usage tablette et la clé Codex** : à trancher à froid, avec
lui, pas à décider en passant.

**#598 volet B** reste ouvert : le réglage global de la balance des blancs dans l'écran
Optimisation. Le volet A (l'aperçu reflète le traitement) est livré. Les pièges sont déjà
écrits dans l'entrée du backlog — SSOT persistant et non état de DOM, `cle()` dès le départ,
et la sémantique global/par-fichier à trancher.

### ⚠ PIÈGES PAYÉS AUJOURD'HUI — ne les réapprendre pas

· **Mesurer dans `file://`, pas seulement sous serveur.** L'entrée #597 disait « mesuré au
  navigateur, converties en 3024x4032 » : exact, et pourtant le bug était entier. Personne
  n'avait écrit DANS QUEL MODE. Toute fonctionnalité qui dépend d'un Worker, d'un WASM ou
  d'un `fetch` doit être mesurée par double-clic avant d'être dite livrée.
· **Le hook anti-cache compte un COMMENTAIRE comme une modification.** Premier commit refusé
  pour `js/modelisation.js`, dont seul un commentaire changeait. Et son conseil
  (« incrémenter la lettre ») ne s'applique pas à un vieux jeton : `2026022201` n'a pas de
  lettre. Le suffixe porte le **jour du BUILD** — `0830-0948` → `20260830a`.
· **Un total de tests lu avant le dernier changement ne vaut rien.** Deux suites complètes
  vertes ont été obtenues avant deux modifications de texte ; il a fallu relancer.
· **Dépanner un HEIC hors de l'application** (macOS, rien à installer) :
  `sips -s format jpeg -s formatOptions 90 photo.HEIC --out photo.jpg` **PUIS** `sips -r 90`.
  Le second geste est obligatoire : `sips` ne reporte pas la rotation du conteneur HEIF et
  sort la page couchée. `sips -g orientation` répond `<nil>` et ment. Vérifier à l'œil :
  `-r 270` la met tête-bêche.
· **Deux sessions dans le même arbre, et ça s'est bien passé** — par messages, pas par
  chance. Chacune a annoncé ses fichiers AVANT d'écrire, et les deux fichiers partagés
  (`index.html`, `BACKLOG.md`) ont été vérifiés dans les deux sens avant chaque commit. Un
  faux positif a été levé en trois messages (un fichier « orphelin » qui était simplement
  modifié après l'envoi d'une liste).


## ▶ POUR LA SESSION QUI PREND LE RELAIS — 30 AOÛT 2026, MIDI (SECONDE SESSION)

### ✅ #522 LOTS 2 ET 3 SONT CLOS — 85 sites convertis, cinq sentinelles, cinq break-tests

| Lot | Clé | Sites | Annoncé | Cas | Break-test |
|---|---|---|---|---|---|
| 2a | `niveauxEchelle` | 7 | — | 12 | 4 → 4 rouges |
| 2b | `echellesTemplates` | 21 | 14 | 12 | 4 → 4 rouges |
| 2c | `grillesTemplates` | 26 | 19 | 14 | 4 → 4 rouges |
| 3a | productions | 18 | 12 | 14 | 4 → 4 rouges |
| 3b | cartouches | 13 | 9 | 13 | 4 → 4 rouges |

**Vitest 4180/4180 (400 fichiers) · code de sortie 0.** Playwright dû avant le prochain bump.

⚠⚠ **L'AUDIT SOUS-COMPTAIT DE 35 %, 45 % ET 48 %.** Trois lots, trois écarts, tous dans le même sens.
⮕ **Le lot 5 n'a PAS été remesuré. Le remesurer avant de l'ouvrir**, avec
`mesurer-522-v2` (scratchpad de la session, à reporter dans `scripts/` s'il doit servir) : il apparie
sur l'**expression de clé**, pas sur une chaîne, et canonise les alias.

### CE QUI RESSERVIRA, ET QUI N'EST PAS DANS LES SENTINELLES

· ⚠⚠ **UN CAS DE COURSE QUI NE ROUGIT PAS SUR LA FILE NEUTRALISÉE NE MESURE PAS LA COURSE.** Le premier
  jet du banc 3a en avait deux comme ça : privés de file, deux écrivains concurrents produisent une
  **perte de mise à jour** qui satisfaisait quand même les assertions (« une seule terminale »,
  « aucune entrée `undefined` »). ⮕ **Un cas de course = une PAIRE D'EFFETS INDÉPENDANTS**, chacun
  asserté. Le témoin doit tuer TOUS les cas de la section A ; s'il n'en tue que la moitié, la moitié
  ne prouve rien.
· ⚠ **UNE CLÉ PEUT S'ÉCRIRE DE DEUX FAÇONS.** `getCleProductions()` REND `cle('productions')`, et
  `cleProductions` est une locale qui vaut la même chose. Une lecture par l'une et une écriture par
  l'autre passent pour deux clés différentes — à l'œil comme au grep. **Vérifier les alias de clé
  avant de compter.**
· ⚠ **UNE CLÉ PEUT ÊTRE UN GABARIT.** `cartouches_${grilleId}` : un balayage par chaîne ne la voit pas.
· ⚠ **APRÈS UN LOT QUI CHANGE UNE PRIMITIVE DE `db`, CHERCHER LES STUBS DE TOUS LES BANCS.** Sept
  sentinelles existantes ont dû recevoir `modifier`. Une fonction qui s'exécute AU CHARGEMENT d'un
  module (`migrerCategoriesVersSousCriteres`) et appelle une primitive absente lève un rejet non
  capté : les tests restent VERTS et `vitest run` sort en code 1 — voir **#600**.
· ⚠ **DEUX CLIQUETS EXISTANTS ONT ROUGI SUR UN CHEMIN DEVENU MEILLEUR** (#476, #358), un troisième a
  attrapé une vraie régression de traçabilité que le refactor avait introduite (#476 de nouveau, sur
  les productions). ⮕ **Recaler un cliquet, puis le BREAK-TESTER APRÈS recalage.**

### 📌 CE QUI RESTE, ET DANS QUEL ORDRE

1. **#599** — les 20 sites des clés `CLE_BIBLIOTHEQUE_*`, que le lot 4 n'a pas touchés. Dont trois
   `creer*SPESiInexistante` qui portent le défaut d'`assurerGrilleGenerique`.
2. **#522 lot 5** — à remesurer d'abord.
3. **#600** — le vert creux du rituel de release.
4. **#601** — `niveauxEchelle` non namespacée, à trancher à #520.

---

## ▶ POUR LA SESSION QUI PREND LE RELAIS — 30 AOÛT 2026, 10 h 45 (SECONDE SESSION)

### ✅ #522 LOT 2 EST CLOS — et il faisait 54 sites, pas 39

Trois blocs, trois sentinelles, trois break-tests à quatre mutations chacun.
**`niveauxEchelle` (7) · `echellesTemplates` (21) · `grillesTemplates` (26).**
Il reste **zéro site en course** sur ces trois clés. Sept sites en régime R3 (synchrones de bout en
bout) restent tels quels : sans point de suspension entre la lecture et l'écriture, rien ne peut
s'intercaler. **Vitest 4153/4153 (398 fichiers) · Playwright 207/207** (verdict de la 1.106.4, avant
les trois commits du lot — la suite navigateur est DUE avant le prochain bump).

⚠⚠ **L'AUDIT SOUS-COMPTAIT, ET IL N'AVAIT LAISSÉ AUCUN OUTIL.** Le rapport annonce « 39 sites,
2 fichiers » ; la mesure refaite en donne **54 sur cinq fichiers**. L'outil de mesure a été
reconstruit et **resservira aux lots 3 et 5** — il applique le critère du §2 du rapport (R1/R2/R3),
neutralise commentaires et chaînes à longueur constante, et apparie lecture/écriture par fonction.
⮕ **Ne pas refaire l'audit : refaire la MESURE.** Les deux ne sont pas la même chose.

### CE QUE CE LOT A APPRIS, ET QUI RESSERVIRA

· ⮕ **HUIT SITES PORTAIENT UNE FENÊTRE D'ATTENTE HUMAINE**, et ce sont les pires : un `prompt` de nom,
  la question du doublon, quatre confirmations. La collection lue AVANT la question écrasait tout ce
  qui s'était enregistré pendant. C'est `partagerPratique` du lot 1, sur d'autres clés. **Remède :
  lire hors file pour POSER la question, relire DANS la file pour ÉCRIRE.**
· ⮕ **LA CONVERSION MET AU JOUR DES DÉFAUTS QUE PERSONNE NE CHERCHAIT** : `assurerGrilleGenerique`
  vérifiait la présence de la grille d'exemple HORS file — deux appels concurrents au démarrage la
  semaient DEUX FOIS. Et la garde d'identité #476 s'appliquait à une collection lue hors file : un
  doublon ajouté entre-temps passait.
· ⚠⚠ **DEUX CLIQUETS EXISTANTS ONT ROUGI SUR UN CHEMIN DEVENU MEILLEUR.** #476 mesurait une
  **proximité textuelle** de 200 caractères entre `conflit` et le message ; #358 exigeait l'argument
  littéral de `db.set`. Aucun des deux ne mesurait son invariant — l'un mesurait la mise en page,
  l'autre la méthode d'écriture. **Recalés sur l'invariant, puis BREAK-TESTÉS APRÈS recalage** : un
  cliquet qu'on recale sans le refaire rougir est pire qu'un cliquet supprimé, parce qu'il rassure.
· ⚠ **UN PIÈGE DE MESURE, PAYÉ** : `pratiques-gestion.js` porte un message générique « déjà dans ta
  sélection » AVANT son refus nommé. Une assertion qui cherchait la PREMIÈRE occurrence rendait un
  faux rouge. Chercher toutes les occurrences, pas la première.
· ⚠ **TROIS STUBS `db` de sentinelles existantes ont dû recevoir `modifier`** (#468, #358-générique) :
  sans lui, `TypeError: db.modifier is not a function`. Le stub doit reproduire le REFUS aussi — un
  mutateur qui rend `undefined` n'écrit rien.

### 📌 À INSCRIRE, TROUVÉ ET NON CORRIGÉ

· **`niveauxEchelle` n'est PAS namespacée par trimestre** — `db.get('niveauxEchelle')` sans `cle()`,
  contrairement à `echellesTemplates` juste à côté. Latent et neutre ; on ne corrige pas un bug
  dormant pendant un refactor.
· **Le rituel de release contient un VERT CREUX.** L'ordre dit « commit → sentinelle anti-cache »,
  mais `scripts/verifier-anticache-stage.mjs` ne regarde que les fichiers **stagés** : lancé après le
  commit, il trouve un index vide, ne vérifie RIEN, et sort en code 0 **sans un mot**. C'est un garde
  de pré-commit, et le rituel le nomme à la mauvaise étape. La vraie vérification post-commit est la
  sentinelle Vitest `anticache-fichiers-modifies`, qui compare des COMMITS.
· **Trois erreurs de banc pré-existantes** dans `sentinelle-note-non-constructible-326` :
  `repararPortfoliosEleves` lève `ReferenceError: cle is not defined`, avalée par un `catch` de
  l'application. Le test passe ; l'erreur est réelle et masquée.
· Les trois identifiants morts de `js/cartouches.js` signalés par la session du matin.

---

## ▶ POUR LA SESSION QUI PREND LE RELAIS — 30 AOÛT 2026, FIN DE JOURNÉE

### 📄 LA CONSIGNE DE DÉMARRAGE EST ÉCRITE — la lire AVANT ce fichier

`Consigne de démarrage 2026-08-31 à froid.txt`, à la racine. Elle porte le cadrage complet :
la priorité datée, le choix de chantier, les deux items à mesurer d'abord, les pièges. Ce bloc-ci
ne dit que ce qu'elle ne dit pas.

### ⏳ LE 1er SEPTEMBRE DEMANDE TROIS GESTES DE CODE, PAS UN

⚠⚠ **Ce fichier, la fiche de refermage et l'item #508 affirmaient tous trois « rien à retirer
manuellement ». Vrai de l'ÉCRAN, faux du DÉPÔT.** Le bandeau s'éteint bien seul (`transitions.js:77`,
condition datée correcte, vérifiée). Mais l'entrée qui le produit survit à sa condition avec un texte
au futur, et **sa spec rougit toute seule le 1er septembre**, en pleine release :
`avis-identification-bandeau-508.spec.js` exécute sa partie 3 sous l'horloge RÉELLE.
⮕ Détail au **§8 bis** de la fiche, gestes listés dans l'item #508.
⮕ **Artefact de travail pour la séance** : `https://claude.ai/code/artifact/fa3cb0e1-3dfc-40b1-85cf-cbfcd91dcb4a`

### ✅ #522 LOT 4 LIVRÉ — un seul changement de contrat pour les cinq familles

`BibliothequeUI` prend un `modifierListe(mutateur)` sérialisé par `db.modifier`, à la place du couple
`lireListe`/`ecrireListe`. **Dix descripteurs, sept fichiers, cinq familles.** Le cliquet du lot 1 a
réclamé de lui-même le retrait de ses deux tolérances — il est bidirectionnel.
**Reste : lots 2, 3 et 5.**

⚠⚠ **ET LE BANC A MENTI UNE SECONDE FOIS — le fait le plus réutilisable de la journée.** Le lot 1
avait appris « Node n'a pas d'IndexedDB, force `useIndexedDB` ». **Ce n'est pas assez.** La fausse
connexion du lot 1 range et rend la RÉFÉRENCE de l'objet, alors qu'IndexedDB **clone** à l'écriture
comme à la lecture. Deux lecteurs concurrents recevaient donc le même tableau et poussaient dedans
tous les deux : le premier break-test a **refusé de rougir** sur du code dont la file était
neutralisée. Clone structuré ajouté → le rouge est venu (2 au lieu de 3). ⮕ Patron corrigé dans
`sentinelle-522-lot4-bibliotheques-serialisees`. ⚠ La sentinelle du lot 1 garde ce défaut de banc ;
ses cas passent par localStorage (aller-retour JSON), donc son verdict tient — mais son harnais
sous-modélise. Non corrigé : ce n'était pas le chantier.

### ✅ #503 ÉTENDU AUX CARTOUCHES — le quatrième écran

Les boutons montent en tête, comme grille et échelle. La barre de fiche porte les **quatre mêmes
actions** (Dupliquer, Supprimer, Annuler, Enregistrer) ; les trois actions de DOCUMENT vivent à côté,
hors de la barre — arbitrage de Grégoire après avoir vu le résultat.
⚠ **#531 est l'invariant fragile** : `btnModeleCartouche` est le seul à ne pas porter `u-hide`, parce
qu'il sert AVANT qu'une cartouche existe. Un ménage qui uniformiserait « les trois boutons de
document » le casserait. Verrouillé par le cas **d5** de la sentinelle #503 (8 → 11 cas).

### 🔴 DÛ, ET PAR QUI

· ✅ **PLAYWRIGHT A TOURNÉ** — 207/207 (WebKit, 7,1 min), le 30 août à 9 h 45, GitHub Desktop fermé.
  Il couvre les deux chantiers d'interface : #522 lot 4 (cinq flux de duplication) et #503 cartouches.
  ⚠ **Le verdict ne vaut que parce que l'arbre n'a pas bougé pendant la suite** : dernière écriture
  9 h 33 min 56 s, suite de 9 h 38 à 9 h 45. Avec deux sessions dans le même arbre, cette vérification
  fait partie du verdict, elle n'est pas un ornement.
· ✅ **1.106.4 EST POUSSÉE** — build `0830-0948`, commit `67aba6a3`, `6c13b50f..67aba6a3` (sept commits).
  Elle referme TROIS commits de code, pas deux : `7543d301` (#555-2), `4bf82ce8` (#522 lot 4) et
  `730abb47` (#503 cartouches). Vitest 4115/4115 (395 fichiers) · Playwright 207/207.
  ⚠ **Grégoire doit recharger sa session `file://`** : douze jetons ont changé.
· **La branche cloud existe toujours** ; sa suppression est le geste de Grégoire.
· **Les relevés Cloudflare** (trois noms, durée de session, règle `Include`) + le `curl -I` sur l'URL
  Netlify directe.

### ⚠ UNE SECONDE SESSION TRAVAILLAIT DANS LE MÊME ARBRE, ET ÇA S'EST BIEN PASSÉ

#597 (décodeur HEIC) et #598 (l'aperçu du pipeline) sont à elle, **non commités**, en attente de la
validation de Grégoire. Prochain ID libre : **#599**.
⮕ **Ce qui a tenu, et qui vaut d'être refait** : messages entre sessions avant d'écrire, et surtout
**staging par HUNK** sur `BACKLOG.md` et `index.html`. Un `git commit -- <fichier>` aurait emporté
son travail dans un commit qui parle d'autre chose — l'incident du 26 août, deux fois. Méthode :
`git diff <fichier>` → découpage par hunks → filtre sur un marqueur → `git apply --cached` →
`git commit` SANS chemins. Vérifier à chaque fois que l'index ne contient rien de l'autre.

### 📌 À INSCRIRE, TROUVÉ ET NON CORRIGÉ

Trois identifiants morts dans `js/cartouches.js` : `btnExporterCartouche`, `btnImporterCartouche`,
`btnImporterCartoucheTxt` — cités, jamais définis, gardés par `if (btn)`. Latents et neutres.
Et un **trou de filet** : `libs/libheif-bundle.js` est chargé par `importScripts` depuis un worker,
donc invisible à `release.mjs`, à la sentinelle anti-cache ET au hook pré-commit.

---

## ▶ POUR LA SESSION QUI PREND LE RELAIS — 30 AOÛT 2026, 8 h 30 (MATIN)

### ⏳ D'ABORD, ET AVANT TOUT AUTRE CHANTIER : L'ÉCHÉANCE DU 1er SEPTEMBRE

**#427 + #508.** Grégoire a arbitré le 28 août (option A) : **il tient la date**. Deux versants.

· **DÛ PAR GRÉGOIRE SEUL, dans la console Cloudflare** — aucune session ne peut le mesurer à sa
  place : les **trois noms**, la **durée de session**, la règle `Include` réellement en place dans la
  policy dormante. ⮕ Fiche opératoire prête :
  `plans de travail/REFERMAGE-2026-09-01-cloudflare-access.md`.
· **DÛ CÔTÉ CODE, LE 1er SEPTEMBRE** : réécrire le paragraphe d'accueil **au présent**
  (`js/accueil.js`) — il est encore au futur. **Les deux textes sont écrits d'avance** au §7 de la
  fiche (refermage réussi / report). Le choix se fait **le jour même**, selon ce qui s'est passé.
· ✅ **Rien à retirer à la main** : le bandeau daté s'éteint seul (`transitions.js`, condition de date).
· ⚠ **Ne PAS prolonger la date sans réécrire le message** — « un avis périmé apprend à ne plus lire
  la zone ».

### CE QUI VIENT ENSUITE — #522, les quatre lots restants (89 sites)

L'audit est FAIT et n'est pas à refaire :
`Rapports/AUDIT-522-courses-lecture-ecriture-2026-08-30.md`. Le lot 1 (clé des pratiques) est livré
en 1.106.3. **Ordre conseillé, et le plus rentable n'est pas le plus gros** :

1. **Lot 4 — le helper `BibliothequeUI`** (14 sites, 7 fichiers, UN seul changement de contrat).
   `dupliquerVersBibliotheque` et `dupliquerEtEditerItem` (`js/bibliotheque-ui.js`) font
   `var liste = await d.lireListe();` puis `await d.ecrireListe(liste)`. ⮕ Remplacer le couple
   `lireListe`/`ecrireListe` par un `modifierListe(mutateur)` **corrige les CINQ familles d'un coup**
   (grilles, échelles, cartouches, productions, pratiques). À faire d'un seul geste, avec les cinq
   appelants.
2. **Lot 2 — grilles (19) + échelles (14) + `niveauxEchelle` (6)**, deux fichiers. Patron connu
   (celui de #510 et du lot 1), aucune décision à prendre, gros volume mécanique.
3. **Lot 3 — productions (12) + cartouches (9)**.
4. **Lot 5 — étudiants (3) + divers (12)**, dont des drapeaux de migration qui ne tournent qu'au
   démarrage : la course y est théorique. ⮕ **Mesurer avant de convertir : ce lot est probablement
   bien plus petit qu'il n'en a l'air.**

### LES QUATRE ITEMS DEMANDÉS LE 30 AOÛT ET NON TRAITÉS

· **#595 — 78 variables CSS jamais définies** (~270 usages). Le cliquet à liste fermée existe déjà
  (`sentinelle-567-variables-css-fantomes`) : chaque lot le fait baisser. Traiter **par familles de
  nom** (bordure, gris, orange, radius, surface) en substituant par la palette. **Aucun alias « pour
  faire taire »**. ⚠ Chantier de RENDU : Playwright/WebKit est la seule suite qui voit.
· **#596 — clés `sessionStorage` non namespacées.** ⚠⚠ **ÉCART DE PRÉMISSE MESURÉ LE 30 AOÛT** :
  l'énoncé dit « 6 clés, 5 fichiers, 21 sites » ; la mesure donne **11 fichiers et ~17 clés
  distinctes** (53 occurrences). L'énoncé décrit le sous-ensemble `travaux-*` d'Import/Export, pas
  l'état du dépôt. ⮕ **Trancher le périmètre AVANT d'ouvrir le lot** — namespacer à moitié casse les
  lectures. Au passage : `travaux-mode-courant` est écrite et JAMAIS lue (à retirer).
· **#519 — passe design (C1, C2, C3, C5).** ✅ **C2 est DÉBLOQUÉ** : sa dépendance #516 est livrée
  depuis le 26 août. ⏳ **Arbitrage dû par Grégoire sur C5** (rangée de cinq boutons pleins
  multicolores, « Supprimer » rouge entre « Dupliquer » et « Annuler », à un clic d'« Enregistrer »).
· **#520 — ablation de l'« ANCIEN SYSTÈME » des échelles.** Deux blocs `u-hide` dans `index.html`
  (~155 lignes + 6), ids dupliqués. ⚠⚠ **CE N'EST PAS UNE ABLATION COSMÉTIQUE** :
  `js/echelles.js:3589` dit que le bouton de `sauvegarderNiveaux()` vit DANS ce bloc caché.
  ⮕ **Auditer les appelants distants AVANT de retirer quoi que ce soit**, sinon un chemin d'écriture
  disparaît en silence. Ablation avec sentinelle ratchet.

### CE QUE LA SESSION DU 30 AOÛT A APPRIS, ET QUI RESSERVIRA

· ⚠⚠ **`getSync` NE PROTÈGE D'AUCUNE COURSE.** Dans `db.set`, l'écriture IndexedDB est ATTENDUE
  avant le rafraîchissement de localStorage : pendant tout cet aller-retour, `getSync` rend encore
  l'ANCIENNE valeur. Seule une séquence **entièrement synchrone** (`getSync` → `setSync`, sans
  suspension) est atomique.
· ⚠⚠ **UN BANC VITEST NE VOIT PAS UNE COURSE D'ÉCRITURE** tant qu'on ne le force pas : Node n'a pas
  d'IndexedDB, `db.js` s'y rabat sur le mode localStorage-seul où `set` écrit SYNCHRONEMENT. Six cas
  écrits pour rougir passaient au VERT sur le code NON corrigé. ⮕ Poser `db.db = <fausse connexion>`
  et `db.useIndexedDB = true` ; patron dans `sentinelle-522-pratiques-serialisees`.
· **La sentinelle anti-cache ne dit vrai qu'APRÈS le commit de release** : lancée avant, elle a rendu
  8 faux rouges (fichiers de la release précédente) pour 1 vrai. ⮕ Ordre : `release.mjs` → changelog
  → commit → sentinelle.
· **`release.mjs` ne bumpe que les fichiers modifiés AU MOMENT où il tourne.** Toucher au changelog
  AVANT de le lancer, sinon le jeton de `changelog-data.js` est oublié (c'est le cinquième oubli
  d'anti-cache en cinq jours, toujours le même motif).
· **Fermer GitHub Desktop avant toute suite Playwright** — vérifié, respecté, 207/207 sans rougeur.

## ▶ POUR LA SESSION QUI PREND LE RELAIS — 29 août 2026, 10 h 30 (MATIN, SESSION UNIQUE)

### ✅ #578 LIVRÉ (option A) — ET LES DEUX LISTES DU FORMULAIRE DE CARTOUCHE ÉTAIENT MORTES DEPUIS LE 26

La cartouche neuve prend l'échelle du FORMULAIRE, l'écrit (`echelleId`), et sans choix la matrice dit « pas
encore d'échelle » au lieu d'un tableau à une colonne. ⚠⚠ En chemin : le dispatcher résout `data-on-change` par
`window[nom]`, et `e50155e0` (26 août) avait donné aux listes grille/échelle du formulaire des noms que rien ne
définit — un `console.warn` par changement, rien d'autre. **Rebranchées** sur `onChangeSelectionCartouche` ;
**cliquet** dans la sentinelle (tout `data-on-change` du bloc `infoCartouche` doit résoudre). Six mutations, six
rouges. Le cas « avec une échelle » de `sentinelle-573` reposait sur la devinette : adapté.
⮕ **Leçon pour le dépôt** : un `data-on-change` renommé ne casse aucun test et aucune console visible ; le cliquet
ne couvre que ce bloc. Un cliquet GLOBAL (tout `data-on-*`/`data-action` d'`index.html` résout vers un export) serait
le bon garde-fou — non fait, à inscrire si Grégoire le veut.

### ✅ #574 — LE RETRAIT EST LIVRÉ (option B), LA SONDE EST DUE, LE NIVEAU NEUF N'EST PAS TRANCHÉ

Plus aucune échelle semée par le code : `assurerEchelleGenerique` et `GABARITS_ECHELLES_DEFAUT` sont partis ;
`GRILLE_GENERIQUE`/`CART_GENERIQUE` ne pointent plus vers l'échelle disparue ; commentaires faux de #527 corrigés.
Données existantes intactes. **Sonde** `await _sonder574()` : échelles fabriquées, niveaux sans `valeurCalcul` (la
mesure promise par #526), usages — **rapportée le 29 août : 1 générique en h2026, 0 échelle réelle sans valeur, 0 évaluation/production, 1 cartouche générique — RIEN À RÉPARER**. Sentinelle 4 cas + cliquet, 5 mutations rouges ;
#358/#468/brique B adaptés. ⚠ Le **niveau neuf à 50** reste : le faire naître vide recréerait la collision de clés
de #524 ; il faut un tampon jusqu'à complétude (patron de #555 (e)) — décision et lot à part.

### ✅ #593 LIVRÉ (n° 5-6-7) — ET LA COURSE « THÉORIQUE » ÉTAIT RÉELLE

Banc #549 réancré sur l'en-tête réel ; le modèle de cartouche nomme le repère « Maîtrisé à partir de » de l'échelle
(ou dit qu'elle n'en a pas) ; `getCouleurNiveau` retiré du PDF (parité : même gris) ; cliquet de câblage #518.
⚠ La course inter-cartouches que l'audit jugeait « faible, non reproduite » **s'est reproduite en banc** : une
cartouche neuve ouverte pendant l'`await` de la complétion recevait — ou perdait — l'écriture de la précédente.
Fermée par capture de la cible (`persisterCartouchePartielle(fn, cible)`). 4 mutations, 4 rouges. D3 → #358.

### ✅ #563 LIVRÉ — LA CASE « REPRISE CIBLÉE » EST RETIRÉE, ET AUCUN CHEMIN N'APPLIQUE PLUS CE JETON

Mesuré : la case était le seul appelant de `appliquerJetonRepriseCiblee`, et le tampon d'annotation cochait cette
case. Retirés ensemble (case, handler, fonction, route et tampon, infobulle). Conservés : la config du type et
l'affichage des reprises ciblées déjà faites. Sentinelle réécrite (4 cas), 4 mutations rouges. ⏳ **Décision due par
Grégoire** : le type reste configurable dans le wizard alors que rien ne le crée plus — retirer ou garder ?

### ⚠ PLAYWRIGHT APRÈS UN RÉVEIL DE LA MACHINE : LES DEUX PREMIÈRES SPECS PEUVENT ROUGIR SANS RÉGRESSION

Le 29 août en soirée (pile morte, puis secteur), la suite a rougi sur `avis-identification-bandeau-508` et le premier
cas de `bandeau-maj-chargement` avec **« Tearing down "context" exceeded 30000ms »** — pas une assertion : le premier
contexte WebKit trop lent à s'ouvrir/se fermer à froid. Les cas suivants du même fichier étaient verts. **Relancer le
push tel quel** : vert au second passage. Ne pas « corriger » ces specs. Et un `pousser.sh | tail` en arrière-plan ne
montre rien avant la fin : lancer détaché avec sortie brute dans un fichier, puis un guetteur `until grep …`.

### ✅ #572 LIVRÉ — L'AUDIT ÉVALUATIONS DU 25 AOÛT EST BOUCLÉ, À UNE DÉCISION PRÈS

Liste (code mort, filtre fantôme, listeners accumulés, titre de production, tri des reprises ciblées, **annotations
purgées avec le fichier**), Annoter (note finale depuis la valeur calculée, plus depuis le DOM), Design (tutoiement,
badges sur la palette, focus visible, boutons nommés). 9 cas, 4 mutations rouges. **#596** inscrit (clés
sessionStorage). Évaluations : **19 réglés sur 20 + D** ; il ne reste que B5 (portée des suppressions — décision de
Grégoire) et deux portes terrain (h2/h3, cibles tactiles iPad).

### ✅ #568 + #569 LIVRÉS — LA COLONNE DESIGN DE L'AUDIT ÉVALUATIONS EST CLOSE

Exporter et archiver sur le design system (dix selects, titre de la navigation, état vide du module) ; cibles tactiles
à 44 px sous `pointer: coarse`. Évaluations : **19 réglés sur 20**, il ne reste que B5 (portée des suppressions, décision)
et #572 (mineurs Liste / Annoter / Design). ⏳ Porte terrain iPad pour #568. ⚠ La pile du MacBook était morte : c'est
ce qui a tué les pushs de fin d'après-midi, pas Playwright.

### ✅ #570 LIVRÉ — LES FLÈCHES DE TRI DE LA LISTE ONT LEURS IDS ET LA COULEUR DE LEUR EN-TÊTE

Ids `tri-eval-*` (les anciens étaient ceux du tableau des étudiants : `getElementById` atteignait le mauvais),
couleur héritée du blanc de l'en-tête. Sentinelle statique + spec WebKit (deux modes). Évaluations : **17 / 20**.

### ✅ #567 LIVRÉ — LES QUATRE VARIABLES FANTÔMES DE L'AUDIT, ET 78 AUTRES MESURÉES (#595)

Substitution par la palette (`--alerte-*-attention`, `--radius-moyen`), jamais d'alias. Mesuré en chemin : **78 variables
CSS employées et jamais définies** (≈270 usages) — inscrites sous #595 avec un **cliquet à liste fermée** dans la
sentinelle #567 : toute variable fantôme neuve ou tout usage en hausse rougit. ⚠ Un `sed '0,/…/'` (GNU) ne fait RIEN
sous BSD sed : trois mutations « vertes » n'avaient rien muté — refaites en Python, trois rouges.

### 📋 ARTEFACT DE VÉRIFICATION TERRAIN — `https://claude.ai/code/artifact/9f92e346-b61b-4b6b-92e7-f8dc7da2b0db`

Huit vérifications sur sa session (#594, #578, #593, #563/#574, #560, #566, #561, #571). ✅ **RELEVÉE le 29 août à
19 h 45, sur 1.106.2 : 8/8 conformes**, verdicts enregistrés dans la page. Le panneau de version (#594) est apparu au
rechargement. Reste la porte iPad de #568 (cibles tactiles au doigt).

### ✅ #571 LIVRÉ (correctifs) — LE PDF RESTE LISIBLE SUR LES COULEURS DE L'ÉCHELLE

`texteSur(fond)` : le texte qui contraste le plus (WCAG), aux quatre sites ; date échappée. Tailles inchangées
(décision du 28 août). Évaluations : **15 réglés sur 20** ; restent la colonne design #567-#570 et #572.

### ✅ #566 LIVRÉ — LA SYNTHÈSE ANONYMISE LE TEXTE LIBRE, LE COMPTEUR LÉA DIT LE NOMBRE DE PDF RÉEL

`selectionnerEvaluationsLea` (archivage) est la seule sélection ; l'export et le compteur la lisent ; les évaluations
sans fichier sont DITES. 5 cas, 4 mutations rouges. Évaluations : **14 réglés sur 20** ; restent #567-#570 (design),
#571 (correctifs arbitrés, à re-mesurer sur HEAD), #572 (Liste/Annoter/Design mineur).

### ✅ #561 LIVRÉ — LA RÉASSOCIATION REND UN VERDICT, LA LISTE L'ATTEND

`changerProductionFichier` rend true/false (le `if (ok) {}` vide de #572 était le verdict jamais rendu) ; le handler
de la Liste est async, attend, et n'applique le jeton que sur un vrai. 4 cas + cliquet, 3 mutations rouges.
Évaluations : 13 réglés sur 20 ; restent #566-#571 (design surtout) et #572 (Liste/Annoter/Design mineur).

### ✅ #560 LIVRÉ — LE GARDE DES MODES N'EST PLUS CONTOURNÉ DANS LA LISTE, LE SITE MORT EST PARTI

Les deux suppressions (fichier définitif, corbeille vidée) réécrivent les évaluations par `sauvegarderDonneesSelonMode`
et disent le refus ; `appliquerJetonPersonnalise` retiré. Cliquets statiques, 3 mutations rouges. ⏳ Reste une DÉCISION :
que supprime-t-on avec un fichier ? (le couple DA×production emporte originales, reprises et l'active d'un réimport).

### ✅ #562 LIVRÉ — LA LISTE DES ÉVALUATIONS N'INTERPOLE PLUS RIEN SANS `echapperHtml`

Onze interpolations (ligne + menu d'actions), `_genererLigneHTML` exposé pour le banc, sentinelle à deux bords
(ligne hostile avec l'`echapperHtml` réel ; cliquet statique récursif à liste fermée). 4 mutations, 4 rouges.
Évaluations : 11 réglés sur 20. ⚠ Livré APRÈS 1.106.1 : jeton `liste-evaluations.js` → `b`, **bump 1.106.2 dû** au
prochain moment où la session `file://` est fermée.

### ✅ #594 — LE BANDEAU ORANGE DE VERSION REVIENT AU CHARGEMENT, UNE FOIS PAR NOUVEAU BUILD

Grégoire ne le voyait plus : depuis le 8 juin il ne se déclenchait que par polling distant (jamais en `file://`).
Option A : affiché si build chargé ≠ dernier build vu, texte au présent, sans Recharger, marqué vu à la fermeture ;
première visite silencieuse. Spec WebKit 4 cas, 2 mutations rouges. ⚠ Le message CoP de rentrée (Cowork,
`~/Documents/Cowork A26 CoP Labo Codex/message-cop-rentree-2026.md`) porte désormais le paragraphe du 1er septembre —
il n'était pas perdu, il était au §5 de la fiche `REFERMAGE-2026-09-01`.

### 📄 LA RÉFÉRENCE UNIQUE EXISTE — `Rapports/SUIVI-conception-evaluations-2026-08.md`

Créée ce matin (voir l'état). #593 inscrit (reliquats). Chaque livraison y coche sa ligne — #578 l'est.

### 🔴 DÛ, ET PAR QUI

- **Grégoire** : recharger `file://` (jetons `cartouches.js` → `e`, `export-pdf.js`, `evaluation-sauvegarde.js` → `b`, `evaluation-jetons.js` → `b`, `travaux-annotation.js`, `travaux-outils.js`, `accompagnement-contenu-hover.js` → `b`, `init-inline.js` → `b`, `echelles.js` → `b`, `grilles.js`, `gabarits-utils.js`) ; **bump 1.106.1 (patch) dû** — non
  lancé, sa session est ouverte ; Cloudflare #427 ; `_diagnostiquerResolutionEchelles()` (#590) ; accueil au
  présent (#508, **1er septembre = dans 3 jours**) ; les deux phrases de #555·1 (arrivée en « signalé », en « acquis »).
- **La session suivante** : §3 du suivi — Conception est bouclé sauf #519/#520/#522 ; passer à Évaluations : #555
  exécution (C + A), #563 retrait de la case, #562 (débloqué), #560, #561.

### 📌 IDs — #593 pris ; prochain libre : **#594**

---

## ▶ POUR LA SESSION QUI PREND LE RELAIS — 29 août 2026, 3 h 40 (NUIT, SESSION UNIQUE)

### ✅ 1.106.0 EST POUSSÉE — ET LA SENTINELLE ANTI-CACHE ROUGIT SI ON LA LANCE AVANT LE COMMIT DE RELEASE

`node scripts/release.mjs minor` puis Vitest : **1 rouge sur 4011**, `sentinelle-anticache-fichiers-modifies`,
qui nommait 13 fichiers « périmés ». Vérifié sur pièces : les 13 sont ceux de **1.105.0 elle-même**, aucun
n'a changé depuis `c255dace`. ⮕ **Cause** : le repère de la sentinelle est l'AVANT-DERNIER commit de
`version.json` — tant que le commit de release n'existe pas, c'est `fbeffdad`, deux releases en arrière.
Celui du script est le DERNIER. **Ordre juste : script → changelog → commit de release → sentinelle.**
Elle est verte après le commit. Ce n'est pas un défaut du script ni de la sentinelle, c'est un ordre.
Le jeton de `changelog-data.js` a de nouveau été bumpé À LA MAIN (l'entrée s'écrit après le script).

### ✅ #578 — LE DIAGNOSTIC EST LIVRÉ, LE CHIFFRE EST DÛ

`await _diagnostiquerEchellesGrilles()` en console (`cartouches.js`, lecture seule). Tous trimestres par
`db.get` (pas le cache), copie archivée `{trim}_grillesTemplates` sondée avant la clé globale, une clé
partagée comptée UNE fois. Rend `{ total, avec, sans, resolues, introuvables, parCle, lignes }` et un
`console.table`. Sentinelle `sentinelle-578-diagnostic-echelles-grilles` : 6 cas, 4 mutations rouges
(porte inversée, dédoublonnage, écriture ajoutée, lecture par `getSync`).

⚠ **FAIT MESURÉ EN L'ÉCRIVANT** : l'éditeur de grille (`grilles.js`) n'écrit **jamais** `echelleId` ;
le seul littéral du dépôt est `GRILLE_GENERIQUE`. La prémisse « une grille PORTE un `echelleId` » vient
de la grille semée. Attendre un compte « sans » majoritaire ; alors le correctif commence par ÉCRIRE
l'identifiant (éditeur + rétro-remplissage), pas par le lire. Inscrit à l'item.

### ⚠ DEUX PIÈGES D'OUTILLAGE PAYÉS CETTE NUIT

1. `chargerScript` a déjà `console` (et `document`) en paramètres du sandbox : un stub `console` dans
   `globaux` fait « Duplicate parameter name » sur les six cas, sans nommer le coupable.
2. `cleSource` sonde la copie archivée par `getSync`, qui ne voit que le trimestre actif : pour une
   lecture inter-trimestres fiable, sonder les deux clés candidates par `await db.get`.

### 🔴 DÛ, ET PAR QUI

- **Grégoire** : recharger `file://` ; **lancer `await _diagnostiquerEchellesGrilles()` et rapporter
  avec / sans / introuvables** (#578) ; Cloudflare #427 ; `_diagnostiquerResolutionEchelles()` (#590) ;
  paragraphe d'accueil au présent (#508, **1er septembre = dans 3 jours**).
- **La session suivante** : #592 ; #555 : deux décisions restantes (zone intermédiaire comme progrès ;
  intention P1) ; correctif #578 UNE FOIS le chiffre connu.

### 📌 RÉFÉRENCE UNIQUE CONCEPTION / ÉVALUATIONS — `Rapports/SUIVI-conception-evaluations-2026-08.md` (29 août, 9 h)

Grégoire : « je ne sais plus où nous en sommes par rapport à la situation de départ ». Mesuré : la référence
n'existait pas — deux audits du 25 août (photos), une seconde passe le 27 (couche), un backlog dispersé.
⮕ **Créé** (option A, point zéro = 25 août) : constat par constat → item → statut → preuve, plus le bloc de la
seconde passe et la liste de travail ordonnée. Chiffres : **Conception 11 réglés / 15, Évaluations 9 réglés /
20 + 1 partiel**. Les quatre constats sans item de la seconde passe sont inscrits sous **#593**.
**Règle** : chaque livraison coche sa ligne là-bas ; ce relais n'y redit rien.

### 📌 ARBITRAGES — UN SEUL ARTEFACT, APRÈS LE CHIFFRE #578 (décision de Grégoire, 29 août 4 h)

Les skills métier (`ecosysteme-classe`, `pratiques-notation`, `depistage-rai`) ont été lus à 4 h — pas avant
la livraison : hors du dépôt, ils ne se chargent pas. Consigne de Grégoire : tout arbitrage lui est remis en
**artefact** (Artifact + skill `artifact-design` : fait mesuré → options fermées → recommandation → ce que ça
ne tranche pas), jamais en prose de chat. ✅ **CHIFFRE RAPPORTÉ** (10 grilles, 1 avec / 9 sans, 0 introuvable —
la seule « avec » est GRILLE_GENERIQUE). ✅ **ARTEFACT REMIS, 29 août ~4 h 30** :
`https://claude.ai/code/artifact/89f28423-e48a-4d62-b15c-91e6e4f48cca` — trois décisions : #555·1 zone
intermédiaire comme progrès (reco C), #555·2 intention « Outils d'observation » (reco A : clore, le repère de
l'échelle EST le réglage), #578 colonnes de la cartouche neuve (reco A : ne plus deviner, échelle choisie au
formulaire, `echelleId` écrit sur la cartouche ; la grille reste agnostique). ✅ **RÉPONSES DE GRÉGOIRE,
29 août 8 h 18, enregistrées DANS l'artefact (v3, capacité `artifact`)** : **#555·1 = C, #555·2 = A, #578 = A**,
sans note. Consignées aux items. ⮕ Trois chantiers d'exécution distincts, UN par session : (1) #578 A dans
`initialiserNouveauCartouche` ; (2) #555·1 C dans `synthese-retroaction-data.js` + `evaluation-retroaction.js`
(ligne « Progrès », deux documents, libellés = ses mots) ; (3) #555·2 A = texte d'aide du curseur « Seuil de
défi » (`index.html:8764`). ⚠ L'artefact porte désormais la seule copie de ses réponses : LIRE avant toute
republication (cf. mémoire `republier-artefact-ecriture-destructive`).

### 📌 IDs — **#593 à #596 PRIS** le 29 août ; prochain libre : **#597**

---

## ▶ POUR LA SESSION QUI PREND LE RELAIS — 28 août 2026, 21 h 15 (SOIR, SESSION UNIQUE)

### ✅ LIVRÉ : #555 LOT 2 (d) + (e), ET #577 — LES REPÈRES SE POSENT PARTOUT OÙ L'ÉCHELLE SE PENSE

Mandat de Grégoire : « rendre l'application plus cohérente et plus souple (rien de ma pratique codé
en dur) pour les utilisateurs de la communauté de pratique ». Option 1 choisie sur question fermée :
finir les échelles. Un seul commit de code, trois sous-lots, chacun avec sa sentinelle et son break-test.

- **(d) le nommage** — `seuilMaitrise` ne désigne plus que le CODE de niveau porté par l'échelle.
  `consolidation.js` : `scoreMaitrise` / `scoreMaitriseDeduit` / `scoreMaitriseRaison`,
  `_detecterScoreMaitrise`, `_scoreParConvention`. `profil-etudiant-helpers.js` / `-calculs.js` :
  `seuilIdmeMaitrise` (+ `seuilIdmeInsuffisant`, `seuilIdmeDeveloppement`). Le 4ᵉ sens (pourcentage
  0-100, `pratique-notation-v2.js`) est du CODE MORT → **#592**, pas un renommage.
  ⮕ `sentinelle-555-d-seuil-maitrise-un-seul-sens` est un **CLIQUET** (liste fermée fichier → compte,
  commentaires retirés). **Il a rougi UNE FOIS pour de vrai ce soir** : #577 a ajouté trois lectures
  dans le wizard, la liste a été mise à jour. C'est le comportement voulu — ne pas l'affaiblir.
- **(e) l'éditeur d'échelle NEUVE** porte le bloc des repères sur un tampon (`_reperesNouvelleEchelle`),
  mêmes refus, revérification à l'enregistrement, jamais de clé vide. Aperçu unique pour les deux
  éditeurs (`apercuNiveauxEchelleHtml`). `blocReperesEchelle(echelle, { handler })`.
- **#577 l'assistant** : l'étape « Échelle de performance » rend le bloc de l'éditeur pour l'échelle
  choisie, écrit par **`ecrireRepereEchelle`** (extraite : écriture pure, sans redessiner l'éditeur),
  re-rend l'étape après écriture, avertit si un repère manque, le récapitulatif le redit. Jamais le mot
  « seuil » à l'écran. **DEN volontairement exclu** (autre sens, non tranché). **#579 clos pour le cas
  de l'assistant** — mesuré : il n'embarque jamais d'échelle, il la RÉFÉRENCE (`configuration.echelleId`).

### ⚠ TROIS CHOSES QUE J'AI PAYÉES, POUR QUE LA SUIVANTE NE LES PAIE PAS

1. **`git checkout <fichier>` pour défaire une MUTATION efface aussi le travail non commité.** J'ai
   perdu deux renommages ainsi et dû les refaire. ⮕ Restaurer une mutation par **copie** depuis une
   sauvegarde faite AVANT (`cp js/x.js $S/ ; …muter… ; cp $S/x.js js/`), jamais par git tant que
   l'arbre porte du travail.
2. **Un refus ne se voit PAS par la valeur de la liste.** Sur refus, le `<select>` garde la valeur
   refusée et porte `champ-refuse` (`marquerChampRefuseEchelle`) — l'éditeur vivant fait pareil. Ma
   première assertion WebKit attendait la valeur précédente ; c'est l'assertion qui avait tort.
3. **Le dispatcher `data-on-change` est prouvé par la spec, pas par le grep.** Je n'ai pas trouvé son
   code en cherchant le nom de l'attribut ; les deux specs WebKit prouvent qu'un `change` natif atteint
   le handler par son NOM, avec l'élément en argument. Ne pas re-chercher.

### 🔴 DÛ, ET PAR QUI

- **Grégoire** : recharger `file://` (6 jetons bougés) ; **décider le bump** — 1.106.0 (minor) est due,
  je ne l'ai pas lancée faute de savoir si sa session était ouverte. Reste aussi tout ce qui est listé
  à l'entrée de 20 h 15 (Cloudflare #427, `_diagnostiquerResolutionEchelles()` #590).
- **La session suivante** : **#578** (diagnostic console des grilles avec/sans `echelleId`, option 3
  du cadrage de ce soir, non entamée) ; **#592** ; #555 : deux décisions restantes (zone intermédiaire
  comme progrès ; intention P1).

### 📌 IDs — prochain libre : **#593**

---

## ▶ POUR LA SESSION QUI PREND LE RELAIS — 28 août 2026, 20 h 15 (FIN DE JOURNÉE, TROIS SESSIONS)

### ✅ LES 21 ARBITRAGES SONT TRANCHÉS — ET C'EST LE FAIT PRINCIPAL DE LA JOURNÉE

Grégoire a répondu aux vingt et un arbitrages relevés dans les skills métier et dans l'audit
du jour. **Chaque décision est consignée DANS SON ITEM**, pas dans un document à part : un item
lu dans six mois porte son arbitrage sans qu'il faille retrouver l'artefact qui l'a recueilli.

⮕ Registre complet, avec ses formulations : artefact **« Arbitrages Labo Codex »**
`https://claude.ai/code/artifact/59ed2fe9-fa0a-49d7-9f97-b0d0e46c4b8b`

**Items portant une décision** : #427, #508, #543, #555 (deux), #563, #571, #574, #577, #578,
#579, #581, #583, #584, #585, #586, #587, #588, #589, #590, #591.

### 🔴 CE QUI EST DÛ PAR GRÉGOIRE, ET PAR PERSONNE D'AUTRE

1. **Les trois valeurs Cloudflare** (#427) — échéance **1er septembre**. Aucune session ne peut
   les relever : elles vivent dans sa console, pas dans le dépôt.
2. **`_diagnostiquerResolutionEchelles()`** en console (#590) — le chantier des trois résolveurs
   ne s'ouvre PAS avant ce chiffre. S'il rend zéro divergent, il attend sans risque.

⮕ Et un troisième, à produire d'abord : **le diagnostic de #578 n'est pas écrit**. La mesure
(compter les grilles avec et sans `echelleId`) suppose une fonction console sur le patron
d'`oracle542` — livrable à produire, pas une inscription.

### ⚠ QUATRE PIÈGES QUE LA SESSION SUIVANTE NE DOIT PAS REPAYER

1. **`RELAIS.md` EXISTAIT, ET AUCUNE DES TROIS SESSIONS NE L'A LU.** Une page d'arbitrages était
   consignée ici depuis 15 h 10 ; nous en avons publié trois autres, dont deux **portant le même
   titre**. La question « quelqu'un a-t-il déjà fait ça ? » avait sa réponse écrite à l'endroit
   prévu pour ça. ⮕ **Lire ce fichier AVANT de produire un livrable, pas seulement au démarrage.**
2. **Un break-test peut ne pas POUVOIR rendre rouge.** `local obtenu="VERT"; [ $? -ne 0 ]` lit le
   code de `local`, pas celui du test : 5 mutations « conformes » sur 5, toutes fausses. Les
   TÉMOINS ne l'attrapent pas (ils attendent du vert, un harnais mort n'en produit que).
   ⮕ **Un bilan « N conformes » n'est établi que si le lot contient au moins un ROUGE obtenu.**
3. **Un commit n'est PAS une écriture.** Un `git commit` lit l'arbre et écrit dans `.git` ; il ne
   touche aucun fichier testé. J'ai invalidé un verdict Playwright à tort en déduisant des heures
   d'écriture depuis des heures de commit. ⮕ **Seuls les `mtime` tranchent** (`stat -f "%Sm %N"`).
4. **Republier un artefact est une écriture destructive** sur la seule copie lisible de
   l'extérieur. Lire l'artefact AVANT de republier par-dessus un état que quelqu'un a pu remplir :
   la lecture dépose une copie datée sous `tool-results/`, seule trace de l'avant.

### 🔒 TROIS GARDES QUI ROUGIRONT — ET QUI ONT RAISON

- **`sentinelle-transport-echelles`** est un **RATCHET** : elle rougit dès qu'un champ est ajouté
  à une échelle sans être transporté par `SCHEMAS_IMPORT.echelle`. Son message dit quoi faire.
  ⮕ **Ne pas l'affaiblir pour la faire taire.**
- **Le cliquet de #557** (`DOUBLONS_CONNUS`, 9 noms) ne descend pas seul : chaque paire réglée doit
  être **retirée de la liste**, sinon le banc rougit. C'est voulu.
- **Le test qui garde `retirerJetonRepriseCiblee`** devient **caduc** quand la case « Reprise
  ciblée » sera retirée (#563, décision C). Le retirer avec la case, pas le laisser en sentinelle
  d'un comportement disparu.

⮕ Et une **exception nommée** : le `console.log` du diagnostic (`profil-etudiant-calculs.js`) porte
son motif en commentaire. Ne pas le « corriger » en `warn` — un diagnostic qui rend son compte n'a
rien d'anormal.

### 📎 CE QUI RESTE OUVERT, PAR CHANTIER

- **#555 lot 2** : (b) le lecteur unique est LIVRÉ (`zoneDuCodeDansNiveaux`). Restent (d) le
  nommage — **tranché**, à exécuter avec #577 — et (e) l'éditeur d'échelle NEUVE, qui ne porte
  toujours pas le bloc des repères (`blocReperesEchelle` n'a qu'un appelant).
- **#587** : huit paires sur neuf **non mesurées**. Seule `creerNouvellePratique` l'est — et elle
  n'a **jamais pu s'exécuter**, pas une fois depuis le 2 janvier 2026 (nom pris depuis le
  25 novembre 2025, fichier chargé avant). Quelqu'un l'a pourtant corrigée le 20 janvier.
  ⮕ **Méthode pour les huit autres** : lire l'ordre de chargement **à l'époque où la perdante a été
  écrite**, pas seulement aujourd'hui — c'est ce qui distingue une fonction *devenue* morte d'une
  fonction **morte-née**, et le geste n'est pas le même (déduplication contre retrait).
  ⮕ **Réserve à ne pas perdre** : la longue créait une pratique en un clic, sans assistant. Rien
  n'est perdu du comportement (il n'y en a jamais eu), mais l'**intention** a existé.
- **`modifierEvaluationParId`** : alias dont la justification est **périmée** depuis `26be0d9b`.
  8 appelants dans 4 fichiers — chantier, pas retouche.
- **#591 (anonymisation)** : ⚠ **le seul des vingt et un qui ne se referme PAS par la réponse.**
  Position prise (pseudonymisation réversible), **à valider avec les contacts Loi 25** — et la
  limite n'est pas juridique : « lui seul peut inverser » cesse d'être vrai dès qu'un fichier
  anonymisé circule vers un tiers. **Ne pas le relire comme clos.**
- **#543** : décision « **ne rien réécrire** ». Aucune écriture sur les 55 évaluations : l'écart
  note↔critères est la trace d'un **jugement d'enseignant** (il arrondit ses notes finales), pas un
  défaut de données. Le geste est de faire cesser la qualification d'incohérence.
  ⮕ **Fausse piste déjà écartée** : `_diagnostiquerNoteNonCalculable` n'est PAS le site — il
  explique pourquoi une note n'est pas *calculable*, il ne compare jamais note et critères.

### 📄 DOCUMENTS À LIRE AVANT DE ROUVRIR CES CHANTIERS

- `Rapports/AUDIT-copies-echelle-reperes-2026-08-28.md` — porte le périmètre mesuré de #590 (deux
  sites, deux coûts d'échec) et les trois pertes de l'audit. **#583, #584 et #586 y renvoient.**
- Les trois artefacts d'arbitrages **clos** (`84660742`, `36b1ee77`, `971736ee`) sont archives ou
  muets, capacité révoquée. **Un seul circuit de réponse** : `59ed2fe9`.


## ▶ POUR LA SESSION QUI PREND LE RELAIS — 28 août 2026, 15 h 10 (fin d'après-midi)

### 🔴 QUATRE DÉCISIONS SONT DUES PAR GRÉGOIRE — ET RIEN N'AVANCE SANS ELLES

| # | Ce qui est dû | Pourquoi personne ne peut le faire à sa place |
|---|---|---|
| **#563** | Le retrait du jeton de reprise ciblée | `retirerJetonRepriseCiblee` n'existe NULLE PART, et défaire une reprise ciblée suppose de **supprimer l'évaluation qu'elle a créée**. Le pendant pour la reprise normale est une opération à confirmations multiples avec risque de perte de note (#141, #360). Trois options posées : garder le refus explicite actuel, implémenter sur le patron de la reprise normale, ou retirer la case. |
| **#427 + #508** | ⏳ **ÉCHÉANCE 1er SEPTEMBRE — dans 4 jours** | Les trois noms Cloudflare, la durée de session et la règle `Include` réellement en place dans la policy dormante. Fiche opératoire prête : `plans de travail/REFERMAGE-2026-09-01-cloudflare-access.md`. |
| **`lancerAllegement`** | ✅ **TRANCHÉ le 28 août** : retrait de la fonctionnalité « Alléger ». | — |
| **`js/config.js`** | ✅ **TRANCHÉ le 28 août** : autorisation d'y toucher pour `echapperHtml`. | — |

### ✅ CE QUI A ÉTÉ FAIT CET APRÈS-MIDI — SIX ITEMS ÉVALUATIONS

Tous issus de l'audit du 25 août, aucun n'avait été engagé jusque-là.

| # | État | En une phrase |
|---|---|---|
| **#564** | ✅ LIVRÉ | Une rétroaction saisie SEULE n'est plus perdue : il ne manquait que le déclencheur, `_autoSauvegarderCriteres` lisait déjà le texte. |
| **#565** | ✅ LIVRÉ | Un étudiant en échec n'avorte plus le lot d'export, et une copie livrée SANS sa page de rétroaction est nommée — c'est ce qui partait en silence sur Léa. |
| **#559** | ✅ LIVRÉ | Les options d'import ne marquent plus un fichier ÉTRANGER. **Trois fonctions concernées, pas deux** : `syncOptImport` avait le même défaut en LECTURE. |
| **#558** | ✅ LIVRÉ | La file d'import survit au rechargement (B1, B1-aggravé, B2, B3 traités ensemble). |
| **#563** | 🟠 PARTIEL | Les six écritures muettes sont traitées. Le retrait du jeton reste DÛ (voir décisions). |
| **#572** | 🟠 PARTIEL | Volets Import et Export faits, plus `echapperHtml`. Restent Liste, Annoter, Design mineur. |

⮕ **`echapperHtml` échappe enfin les guillemets** (`js/config.js`, zone protégée, autorisation
explicite). **C'est la dépendance bloquante de #562** : poser l'échappement ailleurs ne fermait
AUCUN attribut tant que la fonction laissait passer le `"`.

⮕ **« Alléger » est RETIRÉ** (219 lignes). Toute la chaîne était morte — le bouton n'existait dans
aucun HTML, aucune fonction n'avait d'appelant. ⚠ **Le statut `facsimile` et son badge sont
CONSERVÉS** : des copies de Grégoire peuvent déjà le porter. On a retiré la capacité d'alléger,
pas la lecture de ce qui a été allégé.

### ⚠ TROIS SOUS-CONSTATS SORTIS DE #572 — NE PAS LES ROUVRIR SANS LIRE CECI

1. **Les « ~25 `console.log` » de `travaux-resolution.js` NE SONT PAS DE LA DETTE.** Il y en a 20,
   et ils sont dans `diagnostiquer`, `diagnostiquerDoublons` et `nettoyerDoublonsExacts` — des
   outils de diagnostic dont **la sortie console EST le produit**. Les retirer casserait l'outil.
2. **Les clés sessionStorage non namespacées = chantier À PART.** 21 sites, 6 clés, 5 fichiers dont
   deux hors du périmètre Évaluations. Namespacer à moitié casserait les lectures.
   ⮕ Au passage : **`travaux-mode-courant` est ÉCRITE et JAMAIS LUE.**
3. **Les couleurs utilisateur dans des attributs `style`** (~8 sites dans
   `synthese-retroaction-rendu.js`, 1 dans `evaluation.js`) : laissées, zone d'une session parallèle.

### 📐 LA QUESTION DE GRÉGOIRE SUR LE NAMESPACING — RÉPONSE MESURÉE, ET CE QU'ELLE OUVRE

**Question** : les deux champs de maîtrise ajoutés à l'échelle sont-ils namespacés par trimestre ?

**Réponse** : `echelle.seuilSuffisance` et `echelle.seuilMaitrise` sont des **propriétés de l'objet
échelle**, pas des objets séparés. L'échelle vit sous `cle('echellesTemplates')`, qui EST au registre
`CLES_NAMESPACEES` (`js/trimestres.js` l. 112, depuis #358). ⮕ **Oui, par héritage de leur porteur.**

⚠ **MAIS LE RISQUE N'EST PAS LÀ — IL EST DANS LA COPIE.** **Treize chemins** copient ou reconstruisent
une échelle (duplications, imports inter-trimestre, exports, bibliothèque). **Un seul a été corrigé**
(`dupliquerEchelle`, 28 août). Les douze autres n'ont PAS été audités : un balayage automatique par
heuristique a rendu des faux positifs (deux « suspects » vérifiés à la main se sont révélés sains —
l'un délègue à une fonction exhaustive, l'autre sérialise l'objet entier).
⮕ **Distinguer une vraie liste blanche d'un faux positif demande de LIRE chaque fonction.**
C'est un chantier, pas une mesure de passage. **Ne pas conclure depuis un grep.**

### 🧭 CE QUI RESTE EN STAND-BY, MESURÉ CE JOUR

- **#573** ✅ LIVRÉ (ce matin) — la cartouche n'est plus remplacée après « Enregistrer ». C'était le
  symptôme « des fois ça enregistre, des fois non » qui a déclenché l'audit du 25 août.
- **#574** ⏳ ouvert — l'échelle générique et les gabarits sont NON CALCULABLES (aucun `valeurCalcul`).
- **#556, #557** 🔴 ouverts, marqués CRITIQUES, **jamais engagés**. ⚠ **#557 est à moitié caduc** :
  #575 a retiré le doublon `rechargerFiltreProduction`, mais `supprimerEvaluation` existe toujours
  en double. Énoncé corrigé le 28 août.
- **#560, #561, #562, #566 à #571** ⏳ ouverts. **#562 est maintenant DÉBLOCABLE** (`echapperHtml` fait).
- **`plans de travail/PLAN-mi-aout-2026.md`** — document narratif, sans cases. Dernière modification
  le **8 août**. Les validations qui traînent depuis juillet sont **toutes « terrain Grégoire »**,
  pas Claude Code : **#334** (iPad), **#336**, **#340**. Le code est livré ; il ne reste que le geste.

---

## ▶ POUR LA SESSION QUI PREND LE RELAIS — 28 août 2026, 10 h 45

### 🔴 UNE ACTION DE GRÉGOIRE BLOQUE LA SUITE — À LIRE EN PREMIER

**#555 lot 1 est livré : une échelle peut enfin porter ses deux repères de maîtrise.** Mais
**aucune échelle existante ne les porte**, et **aucun lecteur n'est branché** tant qu'elles ne
les portent pas. Brancher avant retirerait la fonction chez tout le monde, Grégoire compris.

⮕ **Ce qui est dû par lui, et par personne d'autre** : ouvrir chacune de ses échelles et poser
« Suffisant à partir de » et « Maîtrisé à partir de ». Sur son échelle IDME, il a déjà dit
lesquels : **D** et **M**.

### ✅ #555 — LA DÉCISION D'ARCHITECTURE EST PRISE : DEUX REPÈRES, PAS UN

Question fermée en 3 options, tranchée par Grégoire le 28 août. **Son motif, et il commande tout
le reste** : sa gradation PAN-Standards distingue **trois** états, pas deux.

| Zone | Chez lui | Ce que la rétroaction en dit |
|---|---|---|
| sous le seuil de suffisance | I | priorité |
| entre les deux | D — « maîtrisé, **mais en développement** », non durable | signalé, pas prioritaire |
| au seuil de maîtrise et au-dessus | M, E | acquis |

⮕ **Une seule frontière aurait forcé « en développement » dans l'une ou l'autre case**, et le
bilan remis à l'élève aurait dit autre chose que ce qu'il pense.

⮕ **ET UNE DISTINCTION À NE PAS PERDRE** : dans ses mots, « maîtrise **durable** » recouvre DEUX
choses que le mot confond. Un **cran d'échelle** (M) — ordinal, ça se marque sur l'échelle, c'est
ce que le lot 1 livre. Et une **propriété temporelle** — « pérenne », « pas encore acquise » —
qui ne se lit sur AUCUN niveau : elle se lit sur la **répétition**. Un M obtenu une fois et un M
obtenu trois fois occupent le même cran et ne disent pas la même chose. Le skill
`pratiques-notation` le documente côté recherche (Clark exige deux démonstrations), et le code en
a déjà des traces : « tous les critères sont maîtrisés **depuis plus d'un artefact** »,
`identifierPatrons` sur trois productions. ⮕ **Ne pas les mélanger dans un même champ** : le
repère marque le cran, la durabilité reste une règle de suivi.

### ✅ CE QUE LE LOT 1 A LIVRÉ

`echelle.seuilSuffisance` / `echelle.seuilMaitrise` — des CODES, portés par **l'échelle** et non
par ses niveaux (un marqueur par niveau autoriserait zéro marque, ou trois : un état incohérent
que rien ne rattraperait). **L'égalité est permise** — les deux sur le même niveau = le modèle à
une frontière, sans champ de plus.

Bloc « Repères de maîtrise » dans l'éditeur vivant, **sous** les niveaux, masqué si l'ordre des
plages n'est pas lisible. L'aperçu nomme la zone de chaque niveau. Refus : code absent de
l'échelle ; suffisance au-dessus de la maîtrise (dans les deux sens) ; ordre illisible. Le vide
**retire** le repère au lieu d'écrire une chaîne creuse — une clé présente et vide se lit
« défini », et c'est faux.

⚠ **L'éditeur d'échelle NEUVE n'a pas le bloc.** Il écrit dans un tampon avant création ; les
repères s'y posent après enregistrement. Acceptable, inscrit au lot 2, **pas oublié**.

### ⚠ L'ÉDITEUR D'ÉCHELLE VIVANT EST `#tableauNiveauxEchelle` — l'autre est mort

Vérifié, et le dépôt le documentait déjà (`echelles.js`, note #524) : `index.html` porte **deux**
`id="tableauNiveaux"`, dont le premier est dans un bloc « Conteneurs cachés pour compatibilité ».
`getElementById` rend le premier : **`afficherTableauNiveaux` écrit donc dans un conteneur
caché**, et le bouton « Enregistrer » de l'ANCIEN SYSTÈME est sans effet. C'est #520 au backlog.
⮕ **Ne rien brancher sur cet écran.** Le doublon d'id relève de #481, laissé en place.

### 📌 #580 EST PRIS — prochain ID libre : **#581**

**#577 — l'assistant de configuration des pratiques ignore les deux repères de maîtrise.** Demandé
par Grégoire à la livraison du lot 1 : `wizard-pratique-v2.js` fait choisir une échelle
(`'echelle-performance'`, `required: true` pour toute pratique non sommative) et passe à la suite,
alors que c'est le moment où l'utilisateur PENSE sa pratique. PAN-STD d'abord — c'est la famille dont
le calcul repose sur les niveaux.

⚠⚠ **Un piège de vocabulaire est déjà dans cet écran** : l'assistant a une étape `'seuils-personnels'`
où « seuil » désigne le **dépistage** (`seuilVaBien`, `seuilDifficulte`, `seuilGrandeDifficulte`, plus
`seuilVerrou`). Y ajouter « seuil de suffisance » et « seuil de maîtrise » sans les distinguer
mettrait deux notions sous un même mot, dans le même parcours. **Trancher le vocabulaire avec Grégoire
avant d'écrire l'écran.** ⏳ Dépend de #555 lot 2 : sans lecteur, l'assistant n'aurait rien à garantir.

### ⏳ RESTE DU LOT 2, DANS L'ORDRE

1. **Grégoire pose ses repères** (bloquant, voir en tête).
2. Le **lecteur unique** « zone d'un code » — une seule règle, comme `niveauDuCodeDansEchelle`.
3. **Brancher** : B10b (6 sites / 14 comparaisons), `evaluation-retroaction.js` (8 lignes / 18).
   Les deux tests qui CONSTATENT ces comptes rougiront alors : **c'est le signal voulu.**
4. **Unifier les quatre replis divergents** (`|| 0.70` ×2, `|| 0.75` ×2) — le pas de #555 qui n'a
   jamais demandé de décision.
5. L'éditeur d'échelle **neuve**.

---

## ▶ POUR LA SESSION QUI PREND LE RELAIS — 28 août 2026, 14 h 30 (FIN DE SESSION)

### ⚠⚠ LES CINQ PREMIÈRES MINUTES

1. **Audit d'entrée AVANT de croire la prémisse.** Deux sessions ont écrit dans ce dépôt toute la
   journée. `git log --oneline origin/main..HEAD`, `find .git -name '*.lock'`, `git status`.
2. **Committer par chemins EXPLICITES.** ⚠ `git commit -- <chemin>` est en mode `--only` et committe
   l'ARBRE : sur un fichier partagé comme `index.html`, il emporte le travail de l'autre session. La
   méthode qui tient : `git show HEAD:index.html` → réappliquer SES SEULES lignes → `git hash-object -w`
   → `git update-index --cacheinfo` → `git commit` SANS chemins. Employée trois fois aujourd'hui, dans
   les deux sens.
3. **Lire cette entrée MAINTENANT, pas dans une heure.** Une ligne recopiée d'un relais lu trois heures
   plus tôt a produit une erreur signalée par Grégoire le 28 au matin.

### ✅ CE QUE LA JOURNÉE A LIVRÉ — 1.105.0 EST EN LIGNE

**#555 (les deux lots) et #575 B10 sont clos.** Une échelle porte `seuilSuffisance` et `seuilMaitrise`,
posés par l'utilisateur dans l'éditeur. `zoneDuNiveau(code, echelleId)` rend `'priorite'` / `'signale'` /
`'acquis'` / `null`, et les **32 comparaisons IDME en dur** ont disparu des deux documents remis à
l'élève. Deux **ratchets à zéro** les empêchent de revenir.

Aussi livrés : **#573** (la cause du « des fois ça enregistre, des fois non »), **#576**, la mise en page
de l'éditeur d'échelle, et — par la session parallèle — **#564, #565, #559, #563 (moitié), #557**, plus
sept énoncés du backlog rectifiés par mesure.

### ⚠⚠ CINQ CHOSES QUE SEUL LE BREAK-TEST A VUES, SUR DU CODE DÉJÀ VERT

C'est le fait marquant de la journée. **Aucune n'était visible à la lecture.**

1. **Une régression de condition.** « avant = priorité » au lieu de « avant ≠ acquis » : sur l'échelle
   de Grégoire, D → M et D → E cessaient d'être annoncés à l'élève. Mes mutations portaient toutes sur
   le côté DROIT de la condition. ⮕ **Muter les deux côtés d'un `&&`.**
2. **Sept mutations vertes sur dix** après le branchement du bilan à l'écran : les bancs existants
   couvraient l'ordre et le nommage, jamais les zones. **Un module peut être entièrement rebranché sans
   qu'une seule sentinelle s'en aperçoive.**
3. **Deux remises à zéro d'un drapeau SANS EFFET** — les neutraliser ne rougissait rien.
4. **Un montage de test qui mesurait des zéros** : `vueRetroGenerale` manquait, la fonction sortait
   immédiatement, et deux cas passaient par vacuité — **un `not.toContain` est satisfait par une chaîne
   vide.**
5. **Une spec WebKit verte pour la mauvaise raison** : elle lisait une cartouche EXISTANTE alors que le
   repli ne joue qu'à la CRÉATION.

⮕ **Et deux fois, WebKit a vu ce que Vitest ne voyait pas** : la zone intermédiaire ajoutée au seul PDF
(le bilan à l'écran laissait son titre suivi du VIDE — le symptôme de la porte 2.6, réintroduit), et
« ta force » qui exigeait des défis alors qu'un élève peut n'avoir que des signalés.

### ⚠ TROIS PIÈGES D'OUTILLAGE, PAYÉS AUJOURD'HUI

- **`release.mjs` bumpe ce qui est COMMITÉ, pas ce qui est dans l'arbre.** Deux symptômes opposés, une
  cause : un fichier modifié APRÈS le script garde un jeton périmé (`changelog-data.js`, corrigé à la
  main) ; un fichier non commité PENDANT n'est pas bumpé du tout. Versé à #547.
- **Le hook pré-push teste l'ARBRE, pas les commits envoyés.** Le travail non commité d'une autre
  session est donc dans le verdict — et peut bloquer votre push.
- **`u-hide` porte un `!important`** qu'un `style.display` inline n'écrase pas : une spec qui ouvre un
  écran caché doit retirer la CLASSE.

### 📌 ARTEFACT DE DÉCISION REMIS À GRÉGOIRE

**Sept décisions en attente**, chacune avec son fait mesuré et ses options :
`https://claude.ai/code/artifact/971736ee-f346-48c5-999a-8a12e97aadca`

Aucune ne bloque les autres. La seule datée est **#427 · #508 — 1er septembre**, et ce qui manque ne
peut être relevé que par lui (trois noms Cloudflare, durée de session, règle `Include`, envoi du message
à la CoP).

### ⏳ CE QUI RESTE DU LOT 2 — ordonné

| | Objet | Bloqué par |
|---|---|---|
| 1 | `_detecterSeuilMaitrise` (`consolidation.js`) — devine par « avant-dernier niveau », **juste chez Grégoire par coïncidence**, repli `0.75` | rien |
| 2 | Les **quatre replis divergents** `0,70` ×2 / `0,75` ×2 (+ le 5e ci-dessus) | rien |
| 3 | Le **nommage** — `seuilMaitrise` porte quatre sens, j'en ai ajouté un cinquième | décision (#555 · #577) |
| 4 | **#579** (pratiques configurables sans éditeur de repères), **#580** (deux listes blanches) | décision |

⮕ **Les points 1 et 2 ne demandent AUCUNE décision** : c'est par là qu'il faut reprendre.

### 📌 IDs — prochain libre : **#583**

#581 (EUF/CAF dans le moteur) et #582 (devis « théorie + labo ») inscrits ce soir : les trois sites qui
ne vivaient que dans le rapport d'audit sont désormais tous au backlog ou qualifiés hors famille.

### ⚠ SIGNALÉ PAR LA SESSION PARALLÈLE, NON TRAITÉ

- **`echapperHtml` n'échappe pas les guillemets** (`js/config.js`, **zone protégée**) — autorisation de
  Grégoire requise. Compte pour tout texte utilisateur posé dans un ATTRIBUT.
- **Couleurs utilisateur interpolées dans des attributs `style`** sans échappement : ~8 sites dans
  `synthese-retroaction-rendu.js`, 1 dans `evaluation.js`. #575 ne les a pas clos.

---

## ▶ POUR LA SESSION QUI PREND LE RELAIS — 28 août 2026, 12 h 20

### ✅ B10b EST CLOS — la marque de maîtrise se lit dans l'échelle

Grégoire a posé ses deux repères ce midi ; le lot 2 était bloqué là-dessus et rien d'autre.
`zoneDuNiveau(code, echelleId)` rend `'priorite'` / `'signale'` / `'acquis'` / `null`, et
`synthese-retroaction-data.js` passe de **14 comparaisons IDME en dur à ZÉRO**.

⚠ **`null` N'EST PAS UNE QUATRIÈME ZONE**, c'est un refus de répondre — échelle non résolue, code
étranger, ou échelle sans repères. Le module ne rend alors RIEN, **et sans note technique** :
`copierToutRetroaction` copie ce bilan dans ce qui est remis à l'élève.

⚠⚠ **CHAQUE ÉVALUATION EST LUE DANS SON ÉCHELLE.** L'historique, l'antérieure et la courante peuvent
porter des barèmes différents. Lire le passé avec le barème du présent efface des progrès réels ou en
invente. **Les DEUX fautes de ce type ont été trouvées par le break-test seul**, sur un lot déjà vert.

### ⚠ CE QUI RESTE DE #555 LOT 2

| | Objet | Note |
|---|---|---|
| a | `evaluation-retroaction.js` — 8 lignes / 18 comparaisons | le bilan à l'écran, même geste |
| b | `_detecterSeuilMaitrise` (`consolidation.js`) | devine par « avant-dernier niveau » |
| c | les quatre replis `0,70` / `0,75` | le pas qui n'a jamais demandé de décision |
| d | le nommage — `seuilMaitrise` porte **quatre** sens | décision de Grégoire, avec #577 |
| e | **#579** et **#580**, ouverts par ce lot | voir ci-dessous |

### 📌 #579 ET #580 SONT PRIS — deux trous que ce lot a révélés

**#579 — l'échelle embarquée d'une pratique configurable ne peut PAS recevoir ses repères.** Le bloc
d'édition ne vit que sur `echellesTemplates` ; ces échelles-là vivent dans
`pratiquesConfigurables[].config.echelle`. ⮕ Pour toute évaluation produite sous une pratique
configurable, `zoneDuNiveau` rend `null` : pas de priorités, pas de force, pas de « tous maîtrisés ».
Visible, pas silencieux — mais réel.

**#580 — deux reconstructions d'échelle à liste blanche** dans `evaluation-chargement.js`. Elles ne
cassent pas le lecteur, mais amputent tout champ métier neuf. Même famille que le défaut de
`dupliquerEchelle`.

### ⚠ UNE QUESTION DE GRÉGOIRE A TROUVÉ CE QU'AUCUNE RELECTURE N'AVAIT VU

Il a demandé si les repères étaient **namespacés par trimestre** comme les échelles. Réponse : oui —
ils vivent DANS l'objet échelle, écrit et lu par `cle('echellesTemplates')`. Mais la question a fait
regarder les chemins de COPIE, et **`dupliquerEchelle` les PERDAIT** : elle reconstruit l'échelle par
une liste blanche qui ne les connaissait pas.

⮕ La liste blanche est **conservée** — un spread emporterait `idOriginal` et la copie répondrait à
l'identifiant de la source (#542). Le prix est que tout champ métier neuf doit y être ajouté à la
main ; le commentaire le dit désormais, et deux cas de sentinelle le verrouillent.
⮕ **La leçon** : demander « où cette donnée est-elle copiée ? » trouve ce que « où est-elle lue ? »
ne trouve pas.

### ⏳ UNE DÉCISION EN ATTENTE, PETITE MAIS RÉELLE

« Tu as progressé » reste `priorite → acquis` : passer d'une priorité à **« signalé »** n'est pas
annoncé à l'élève. C'est la règle d'origine, préservée volontairement — un refactor ne change pas la
sémantique. Mais dans les mots de Grégoire, « D est quand même une maîtrise » : il voudra peut-être
que ce passage compte. **À lui de trancher, pas à nous.**

---

## ▶ B10b — ÉTAT AU 28 AOÛT, 11 h 50 (mesuré, pas rapporté)

**B10b n'a pas bougé, et c'est l'état attendu** : il attend #555 lot 2, qui attend un geste de
Grégoire. Comptes re-mesurés au code exécutable, commentaires filtrés :

| Fichier | Sites | Comparaisons |
|---|---|---|
| `synthese-retroaction-data.js` | 6 | 14 |
| `evaluation-retroaction.js` | 8 | 18 |

Identiques à ce matin — les deux tests qui les CONSTATENT sont donc toujours verts, ce qui est le
comportement voulu.

### ⚠⚠ MAIS LA MESURE A SORTI UN SITE QUE PERSONNE N'AVAIT VU

`consolidation.js` **DEVINE déjà** ce que le lot 1 vient de rendre explicite.
`_detecterSeuilMaitrise(echelle)` porte sa convention en commentaire :
« **avant-dernier niveau = maîtrise**. Son `min / 100` = seuil. Fallback : **0.75** ».

- Sur l'échelle de Grégoire (I, D, M, E), l'avant-dernier **est** M : la convention tombe juste **par
  coïncidence**. C'est pour cela qu'elle a survécu à deux audits.
- Sur trois paliers, elle désigne le niveau du milieu. Avec un « 0 » de jugement suspendu, elle se
  décale. Sur des lettres ordonnées autrement, elle désigne n'importe quoi.
- Son repli `0.75` est un **cinquième** repli divergent, en plus des quatre déjà listés à #555.

⮕ **Chemin VIVANT, rendu à l'écran** : `calculerConsolidationIndividuelle` ←
`profil-etudiant-diagnostics.js:612`. Vérifié au grep, pas supposé.
⮕ C'est le consommateur le plus direct des deux repères — au lot 2, la convention disparaît.

### ⚠⚠ ET UNE COLLISION DE VOCABULAIRE QUE LE LOT 1 A AGGRAVÉE

`seuilMaitrise` désigne aujourd'hui **quatre choses de types différents** :

| Où | Ce que c'est |
|---|---|
| `echelles.js` (#555 lot 1) | un **CODE** de niveau (« M ») |
| `consolidation.js` | un **score 0-1** deviné |
| `obtenirSeuil('idme.maitrise')` | un **seuil de préférence 0-1** (défaut 0,85) |
| `pratique-notation-v2.js:279` | un **pourcentage 0-100** |

Aucune collision d'exécution — mais quatre sens sous un mot, et j'en ai ajouté un cinquième en
nommant le champ. ⮕ **Trancher le nommage avec Grégoire au lot 2**, en même temps que celui de
l'assistant (#577) : c'est le même arbitrage, sur le même mot.

---

## ▶ POUR LA SESSION QUI PREND LE RELAIS — 28 août 2026, 11 h 45

### ✅ #573 — « DES FOIS ÇA ENREGISTRE, DES FOIS NON » A UNE CAUSE, ET ELLE EST FERMÉE

C'est le symptôme rapporté par Grégoire qui avait déclenché l'audit du 25 août. L'audit du 27 l'avait
désigné comme candidat, reproduit en harnais Node, et notait **« non vérifié en navigateur »**. Les
deux manques sont levés.

**La mécanique, en trois temps, tous silencieux :**

1. `sauvegarderCartouche` appelait `chargerCartouchesRetroaction()`, qui finit par
   `initialiserNouveauCartouche()` — `cartoucheActuel` devenait une cartouche **neuve jamais écrite**.
2. La ligne suivante lisait `cartoucheActuel.id` : l'id NEUF, absent des options. Le `<select>`
   retombait sur « -- Nouvelle cartouche -- ».
3. La cellule tapée ensuite passait par `persisterCartouchePartielle` (#517), qui cherche en base par
   cet id absent et rend `false`. **Les deux appelants ignoraient ce verdict.** La frappe était perdue.

⮕ **Correctifs** : `chargerCartouchesRetroaction(cartoucheIdAGarder)` rouvre la cartouche enregistrée
par le chemin d'ouverture déjà existant ; l'autosave **dit** quand elle n'écrit rien, une fois par
cartouche ; et le repli `niveauxDefaut` (les plages I/D/M/E de Grégoire, §3 n° 18) est supprimé.

⚠ **Après une SUPPRESSION, l'appel reste SANS argument** — la cartouche ouverte n'existe plus, en
rouvrir une neuve est le geste juste. Le défaut n'était pas d'initialiser, c'était de le faire aussi
quand l'objet venait d'être enregistré.

### ⚠⚠ CE QUE LE BREAK-TEST A TROUVÉ, ET QUE LA LECTURE N'AURAIT PAS VU

**Quatre choses, sur un lot qui passait déjà au vert :**

1. **Deux remises à zéro du drapeau d'avertissement étaient SANS EFFET.** Les neutraliser laissait la
   sentinelle verte : le drapeau mémorise un *id*, donc changer de cartouche le réarme déjà. Retirées —
   du code qui ne change rien finit par être lu comme s'il changeait quelque chose.
2. **Le second site de l'autosave n'était pas couvert.** Les cas ne testaient que
   `sauvegarderCommentaire` ; `sauvegarderContexteCartouche` pouvait redevenir muet sans rien rougir.
3. **Une mutation « équivalente » n'est pas une faille de la sentinelle.** Déplacer la lecture de l'id
   après l'appel restait vert parce que l'argument est évalué AVANT — mais l'analyse a montré que la
   ligne `selectCartouche.value = …` qui suivait était devenue **redondante**. Retirée.
4. **Dans la spec WebKit, une assertion ne prouvait rien** : elle lisait les colonnes d'une cartouche
   EXISTANTE alors que le repli ne joue qu'à la CRÉATION. Le scénario a été étendu.

⮕ **Et un piège de mesure, dans la spec** : `nomEnMemoire` était lu dans le `return`, donc APRÈS que le
scénario ait ouvert une autre cartouche — il décrivait le mauvais objet, avec aplomb. **Capturer la
mesure au moment où elle a un sens, pas à la fin.**

### 📌 #578 EST PRIS — le reste de #573

**Une cartouche neuve prend les colonnes de la PREMIÈRE échelle du trimestre**
(`find(e => !e.estDemo) || echelles[0]`), sans `echelleId`. La source non arbitraire existe : **une
grille porte un `echelleId`**. ⚠ **Préalable mesurable avant de coder** : compter les grilles réelles
de Grégoire avec et sans `echelleId`. Sans ce compte, passer par `obtenirEchelleResolue` pourrait le
laisser sans colonnes — une régression pire que le défaut.

---

## ▶ POUR LA SESSION QUI PREND LE RELAIS — 28 août 2026, 09 h 30

### ✅ B10 EST SCINDÉ, ET SA MOITIÉ « ORDRE » EST LIVRÉE

**#575 n'attend plus que la décision #555.** B10 était porté au backlog ET dans l'entrée
précédente de ce fichier comme « BUTE SUR #555 » — donc reporté EN ENTIER sur une décision
qui appartient à Grégoire. C'était vrai de la moitié seulement.

| | Ce qui était mêlé dans les mêmes lignes | Dépend de #555 ? |
|---|---|---|
| **L'ORDRE** | `ORDRE_NIV = { E:4, M:3, D:2, I:1, '0':0 }` | **Non** — se dérive des PLAGES de l'échelle |
| **LA MARQUE** | `=== 'I' \|\| === 'D'` / `=== 'M' \|\| === 'E'` | **Oui** — « faible » et « maîtrisé » ne se dérivent d'aucune échelle |

⮕ **LA RÈGLE À REPASSER SUR LES QUATRE AUTRES ITEMS QUI ATTENDENT #555** : avant de reporter
un item sur une décision, mesurer ce qui, DEDANS, n'en dépend pas. Ici un item entier était
bloqué par la moitié de son contenu.

### ⚠ POURQUOI CE DÉFAUT ÉTAIT SILENCIEUX — le patron à reconnaître ailleurs

`ORDRE_NIV[code] || 0` **ne levait pas.** Il rendait 0. Hors IDME, tous les niveaux recevaient
donc le MÊME rang, dans le bilan **remis à l'élève** (`synthese-retroaction-data.js` alimente
la page de synthèse du PDF) :

- les deux « priorités » affichées étaient les deux **premières du tableau**, pas les deux plus faibles ;
- « ta force » revenait au **premier critère saisi** ;
- la ligne « Progrès : X → Y » ne pouvait **jamais** s'afficher.

C'est le même défaut, dans le même document, que celui corrigé à 7 h dans `evaluation-retroaction.js`.
⮕ **Un repli `|| 0` sur une table de codes ne casse rien : il ment.**

### ✅ `echellesComparables` EST EXTRAIT — un seul endroit pour la garde « même barème »

La garde livrée à 7 h dans `evaluation-retroaction.js` après la porte terrain 2.7 était nécessaire
**mot pour mot** pour la ligne « Progrès » du PDF. Elle vit maintenant dans
`profil-etudiant-calculs.js` et les deux modules la consomment. La recopier, c'était fabriquer le
patron de replis divergents que **#555 constate ailleurs** (`|| 0.70` ici, `|| 0.75` là).

⚠ Son repli est passé de PERMISSIF à **RESTRICTIF** : sans le lecteur, on n'annonce pas un progrès
qu'on n'a pas mesuré. Un repli permissif aurait rendu la garde muette au premier changement d'ordre
de chargement — et un test l'aurait trouvée verte pour la mauvaise raison.

### ⚠⚠ TROIS ASSERTIONS NE PROUVAIENT RIEN, ET SEUL LE BREAK-TEST L'A DIT

Première passe : **16 cas verts, mais 3 mutations sur 12 restaient VERTES.** Les trois cas étaient
mal construits, pas le code. À lire avant d'écrire une sentinelle d'échelle :

1. **« un niveau illisible se range en dernier »** — mes deux critères étaient TOUS DEUX lisibles.
   Il faut une échelle qui connaisse « D » mais **pas** « I » : le seul montage où un code franchit
   la butée #555 (`I || D` = un défi) **sans avoir de rang à lire**.
2. **« aucun progrès sur un code étranger »** — testé sur l'évaluation COURANTE, où une autre garde
   sortait déjà. Le cas qui mord est le code étranger côté **ANTÉRIEUR** : sans garde, `rang > null`
   est vrai et **tout devient un progrès**.
3. **« la comparabilité ne porte pas sur les ids bruts »** — aucun cas n'avait deux ids DIFFÉRENTS
   résolvant vers la MÊME échelle. C'est pourtant l'état exact du trimestre de Grégoire après la
   réparation de #542 (`idOriginal`), et la cause de la porte 2.7.

⮕ **Verte n'est pas prouvée.** Final : **12 mutations, 12 rouges**, restauration vérifiée à chaque fois.

⮕ **Et la suite navigateur a été lancée AVANT d'annoncer la fin**, comme la leçon de la nuit l'impose :
**Playwright 193 passées** (3 réussies au second essai — `confirmations-conception-uniformes`,
`partage-import-rendu`, `sandbox-isolation`, aucune liée à ce lot). **Vitest 3796/3796, 356 fichiers**,
lue après le dernier changement.

⮕ **Et le montage compte** : une échelle W-X-Y-Z ne prouve RIEN sur l'ordre — hors IDME, l'ancienne
table rendait 0 partout, donc « pas de tri » : un **faux vert par égalité**. Les fixtures reprennent
les lettres I/D/M/E **dans un autre ordre** (« E » = Émergent, le plus faible), le seul montage où
table en dur et lecture d'échelle donnent des réponses OPPOSÉES.

### ⚠ UNE MESURE FAUSSE, CORRIGÉE AVANT DE S'INSTALLER

Le test qui CONSTATE les butées #555 restantes comptait par un motif en `===` seul : il annonçait 6.
Le vrai compte est **6 sites / 14 comparaisons** — `construireForce` filtre par `!== 'M' && !== 'E'`,
**un site entier qu'un motif en `===` rate**. Le chiffre a été REMESURÉ au grep, pas ajusté pour
faire passer le test. ⮕ Même piège partout où une sentinelle compte des comparaisons.

### ⏳ CE QUI RESTE — inchangé, sauf B10

- **B10b** : 6 sites / 14 comparaisons dans `synthese-retroaction-data.js`, plus les 8 lignes /
  18 comparaisons jumelles d'`evaluation-retroaction.js`. Les deux portent un test qui CONSTATE ces
  comptes et **rougira le jour de la décision #555** — c'est le signal voulu, pas une régression.
- **Porte terrain 2.7** (Grégoire) — la ligne « Progrès » chez un élève monté d'un niveau.
- **1er septembre** : #427 + #508. Il n'y a NI liste nominale, NI personne à inviter.
- ⚠ **`git config maintenance.auto` n'est TOUJOURS pas positionné.** Le relais le recommande depuis
  trois crashs en trois jours ; personne ne l'a fait. Ce n'est pas un oubli de plus, c'est un geste
  d'une ligne que chaque session repousse.
- ⚠ **Le bump est dû dès que la session `file://` de Grégoire sera fermée** : le code applicatif a
  maintenant **huit commits** d'avance sur le numéro annoncé (1.104.1 / `0827-1418`).

---

## ▶ POUR LA SESSION QUI PREND LE RELAIS — 28 août 2026, 07 h 45

### ⚠⚠ LES CINQ PREMIÈRES MINUTES — dans cet ordre, avant toute promesse

1. **Déléguer le rituel de début** au subagent `audit-debut-session` (CLAUDE.md).
   Ne pas prendre la prémisse de relance pour argent comptant : **elle est fausse une
   fois sur deux en ce moment**, parce que deux sessions écrivent dans ce dépôt.
2. **`git log --oneline origin/main..HEAD`** — s'il reste des commits locaux, la garde
   `scripts/pousser.sh` n'a pas été passée. Ne rien construire dessus avant de savoir
   pourquoi.
3. **`find .git -name '*.lock'`** — `git maintenance` a crashé **trois fois en trois
   jours** (27 août 15 h 46, 28 août 04 h 53, plus juillet). Vérifier l'âge des verrous
   ET l'absence de git actif avant de retirer quoi que ce soit. C'est un défaut
   RÉCURRENT du dépôt : la vraie réponse est de trancher `git config maintenance.auto false`,
   pas de re-nettoyer.
4. **`git status`** — si des fichiers modifiés ne sont pas les tiens, **une autre session
   travaille**. Committer par chemins EXPLICITES, jamais `-A`. Pour un fichier PARTAGÉ
   comme `index.html` : reconstruire « HEAD + tes seules modifications » dans un fichier
   à part, `git hash-object -w`, `git update-index --cacheinfo`, puis **`git commit` SANS
   chemins**. ⚠ `git commit -- <chemins>` est en mode `--only` et recommite le contenu de
   l'**arbre** : il emporterait le travail de l'autre. Méthode éprouvée le 28 août.
5. **Lire `RELAIS.md` MAINTENANT, pas au début de la session.** Le 28 août, une session a
   recopié dans une porte terrain une ligne lue trois heures plus tôt ; entre-temps trois
   commits l'avaient corrigée. Grégoire a dû relever l'erreur lui-même.

### ⚠⚠ CE QUI A CHANGÉ DANS LA FAÇON DE VÉRIFIER — le point le plus important

**Vitest ne voit pas les régressions d'affichage.** Les deux régressions de la nuit du
27-28 août sont passées sous 3767/3767 puis 3780/3780 de Vitest, et n'ont été vues que par
Playwright, au moment du push. Vitest tourne dans `node`, sans navigateur ; **Playwright
tourne dans WebKit — le moteur de Safari — contre le vrai `index.html`**.

⮕ **Sur tout chantier qui touche du rendu : lancer la suite navigateur AVANT d'annoncer
que c'est fini.** Conditions : GitHub Desktop fermé, aucune autre session écrivant dans
l'arbre. Une seule spec se lance vite :
`cd tests && npx playwright test integration/<fichier>.spec.js --reporter=list`

⮕ **Et le corollaire, découvert le 28 août** : une vérification qu'on croyait réservée à
Grégoire est souvent automatisable en spec WebKit. La porte terrain 2.6 a été convertie en
`#576 · le bilan nomme les critères quand la grille d'origine a disparu` — elle rejoue son
cas réel contre le vrai `index.html`. C'est la règle 1 du skill `portes-terrain` : **une
porte n'existe que si aucune machine ne peut répondre.** Avant d'écrire une porte, demander
si une spec peut la remplacer.

---

### ✅ #575 — LOT 4 DU PLAN SOLO : FINI, SAUF B10

**L'ORDRE DES NIVEAUX SE DÉRIVE MAINTENANT DE L'ÉCHELLE.** Deux tables IDME écrites en dur
vivaient dans deux modules, en ordres opposés, toutes deux RENDUES à l'écran. Elles sont
remplacées par un lecteur unique — `niveauxOrdonnesDeLEchelle` / `niveauDuCodeDansEchelle`
(`profil-etudiant-calculs.js`) — qui résout par le chemin de #542 lot 3 et classe par la
**borne inférieure** des plages, puis par la borne supérieure à égalité (le cas des échelles
« IDME et niv 0 »). Pas de repli sur `valeurCalcul` : plage et valeur ponctuelle sont deux
conversions inverses.

| Pas | Geste | Sentinelle |
|---|---|---|
| **B7** (filtre `['I','D','M','E']`) | **SUPPRIMÉ** — le `<select id="filtre-note-eval">` qu'il peuplait **n'a jamais existé** dans `index.html`, `git log -S` ne trouve rien depuis le premier commit | `sentinelle-575-ordre-niveaux-derive-echelle` |
| **Tri de la colonne « Niveau »** (trouvé en chemin, VIVANT) | Le rang se lit dans l'échelle de chaque évaluation ; une ligne sans niveau reste en fin **dans les deux sens** | idem — 26 cas, **18 mutations, 18 rouges** |
| **n° 10** (bilan de rétroaction) | Les deux tables retirées ; nom et rang viennent de l'échelle | idem |
| **n° 11** (`convertirNoteEnValeur`, `I = 3`) | **SUPPRIMÉ avec toute la vue « accordéon »** — 12 fonctions, 584 lignes, `evaluation.js` de 3894 à 3295 | — |

⮕ **DEUX DOUBLONS `window` SONT PARTIS AVEC L'ACCORDÉON**, et c'est le patron
`feedback-double-definition-window-derniere-gagne` : `trierListeEvaluations` et
`rechargerFiltreProduction` étaient définis dans **les deux** modules et, `evaluation.js`
étant chargé APRÈS `liste-evaluations.js`, **c'était la version morte qui gagnait**.
`window.rechargerFiltreProduction` résout désormais vers celle qui exclut le portfolio.

### ⚠ CE QUI RESTE DE #575 : **B10 SEUL, ET IL BUTE SUR #555**

`synthese-retroaction-data.js` teste les codes EN TOUTES LETTRES à six endroits. Et le même
patron subsiste dans `evaluation-retroaction.js` : **8 lignes / 18 comparaisons**
(`=== 'I' || === 'D'` pour les défis, `=== 'M' || === 'E'` pour « tous maîtrisés »).
L'ORDRE se dérive d'une échelle ; **« faible » et « maîtrisé », non** — c'est la marque de
maîtrise de **#555**. Le faire sans elle remplacerait un arbitrage codé en dur par un autre.
⮕ **Un test CONSTATE le compte de 18** : il rougira le jour où #555 les retirera, et c'est
le signal voulu. Ne pas le « réparer » en changeant le chiffre.

### ✅ #576 — LE BILAN SURVIT À LA DISPARITION DE LA GRILLE (livré le 28 août)

Trouvé par la porte terrain 2.6 sur les données réelles d'H2026, captures à l'appui. Le
bilan affichait « Présentement, il faut se concentrer sur : » puis **RIEN**. Cause :
`_collecterCriteresBilan` exigeait la grille template et rendait `[]` quand elle avait
disparu. La donnée était pourtant là — l'évaluation enregistrée porte ses critères AVEC leur
nom, et le panneau voisin les lisait déjà.

⚠⚠ **UNE CONTRAINTE À NE PAS OUBLIER EN TOUCHANT À CE BLOC** : `copierToutRetroaction` copie
le `textContent` du bilan sous « === BILAN === » **dans ce qui est remis à l'élève**. Aucune
note technique ne doit y figurer. Deux sentinelles le verrouillent.

### ⚠ TROIS DÉFAUTS QUE LES TESTS N'ONT PAS VUS, ET COMMENT ILS SONT SORTIS

1. **Une faille d'injection ouverte par le correctif lui-même.** Remplacer des libellés
   écrits en dur par le nom SAISI par l'utilisateur fait passer du texte utilisateur dans un
   `innerHTML`. Trois échappements posés, puis un quatrième — le repli #576 ne fournit aucune
   description, donc la ligne d'un défi retombait sur le nom, par une branche restée non
   échappée. **Trouvé par la sentinelle, pas par relecture.**
2. **Le nom d'un critère écrit deux fois** — « Plausibilité (Plausibilité En développement) ».
   Les assertions cherchaient la présence des mots, **pas leur nombre**. Sorti en RENDANT le
   bilan, pas en le testant.
3. **Une spec verte pour la mauvaise raison.** `evaluation-rendu.spec.js` ne seedait aucune
   échelle et passait quand même, parce que la table IDME en dur en fournissait une à tout le
   monde. Corrigé — et deux assertions ajoutées : le niveau porte le nom de l'échelle, et
   aucun libellé IDME n'est connu d'avance.

⮕ **La leçon commune** : une assertion de PRÉSENCE ne dit rien de la FORME. Sur un texte
lu par un humain, rendre et lire.

### ⏳ CE QUI RESTE DÛ À GRÉGOIRE

- **Porte terrain 2.7** — la ligne « Progrès : X → Y » chez un élève qui est monté d'un
  niveau. Elle dépend de ses données ; aucune machine ne peut dire si le cas existe chez lui.
- **Décision #555** (la marque de maîtrise) — elle débloque B10 et les 18 comparaisons.
- **1er septembre** : #427 + #508. ⚠ **Il n'y a NI liste nominale, NI personne à inviter** —
  la policy est ouverte. Ce qui reste : insérer le paragraphe d'annonce dans le message de
  rentrée à la CoP (rédigé, non envoyé), et relever dans la console les trois noms
  Cloudflare, la durée de session et la règle `Include`.

---

## ▶ POUR LA SESSION QUI PREND LE RELAIS — 27 août 2026, 22 h 40 (entrée précédente)

### ✅ LOT 4 DU PLAN SOLO — OUVERT SOUS #575, QUATRE PAS LIVRÉS (`c85ec85b`)

Le lot 4 n'avait **jamais eu d'item** ; c'est le §9 n° 1 de l'audit Fable 5. Il est ouvert
sous **#575**, avec sa liste, et quatre pas sont livrés :

| Pas | Ce qui est parti | Sentinelle |
|---|---|---|
| **B1+B2+B3+B4** | 4ᵉ repli IDME (`32/69,5/79,5/92,5`), sa clé morte `echellesPerformance`, les cinq noms de critères de Grégoire | `sentinelle-575-lot4-b1b2-b3b4` (8 cas, 8 mutations rouges) |
| **`SCALE_FALLBACK`** | l'échelle de Grégoire dans le **PDF remis à l'élève** | `…-synthese-pdf-sans-echelle-imposee` (7 cas, 6 rouges) |
| **`determinerLettreIDME`** | la lettre IDME **rendue à l'écran** (« E 87 % ») | `…-niveau-note-globale-une-seule-regle` (8 cas, 7 rouges) |
| **Badges + barres** | 5ᵉ **et 6ᵉ** tables IDME, échelles devinées, couleur non filtrée | `…-couleurs-badges-barres` (13 cas, 11 rouges) |

**Le geste central : SUPPRIMER plutôt que RÉPARER.** `intervention.analyse.defisCommuns`
était écrit en base et **lu par aucun écran depuis la Beta 0.85** (grep sur tout le dépôt).
Le besoin est déjà servi, et correctement, par `mettreAJourCriteresCibles`. Réparer le
doublon aurait été un correctif sans effet. Diff du lot : **+502 / −556**.

**Trois choses que l'audit n'avait pas vues**, trouvées en corrigeant :
1. Une **SIXIÈME table IDME** (`_obtenirNiveauxEtGradientSRPNF`), jumelle de la cinquième,
   qui peignait le dégradé du bloc « Forces et défis » — que l'audit cite pourtant en
   exemple de code proprement configurable. Les deux copies sont remplacées par
   `niveauxEtGradientDesEvaluations`.
2. Un **SEPTIÈME site** qui devine l'échelle : le graphique de progression
   (`sections-affichage.js:3400`), avec son texte « Zones colorées basées sur l'échelle
   IDME par défaut ». **Non corrigé**, mais l'état connu est verrouillé par un test
   « exactement UNE occurrence restante » — il rougira quand on y touchera, c'est voulu.
3. La moitié du **constat §5.5** : `couleurSure` était juste mais **enfermée dans une
   fermeture locale** ; badges et barres posaient la couleur utilisateur BRUTE dans un
   `style`. Extraite en `couleurCssSure`, partagée, testée (elle n'avait aucun test).

### 🔴 #508 — LE BANDEAU D'AVIS BLOQUE LES CLICS SOUS LUI. CORRECTIF PRÊT, **NON COMMITÉ**

**Trouvé le 28 août au petit matin, en tentant de pousser** : `scripts/pousser.sh` a refusé
avant d'ouvrir la connexion — 1 spec nouvellement rouge,
`planif-alignement › un bloc glissé près d'un autre COLLE`.

**Ce n'est PAS un artefact de test, et ce n'est pas le lot #575.** Prouvé par trois mesures
en worktrees jetables :

| Base | Spec |
|---|---|
| `fbeffdad` (dernier verdict vert) | ✅ verte |
| `f41c6118` (**#508**, bandeau d'avis) | ❌ rouge |
| `f41c6118` + condition de date forcée à `false` | ✅ verte |

⮕ Le bandeau est `position: fixed`, ancré **en bas, centré, 600 px, `z-index: 950`**. Il
**recouvre la zone de travail** : le `mouse.down()` du glisser atterrit sur lui, jamais sur le
bloc, qui ne bouge pas d'un pixel (reçu 400 = sa position de départ). ⮕ **Conséquence réelle
pour l'utilisateur** : tout ce qui se trouve sous le bandeau — un nœud de carte mentale, un
bouton — est inatteignable au clic **tant que l'avis n'est pas fermé**. Portée limitée (il se
ferme d'un clic et ne revient plus, et la condition `new Date() < 1er septembre 2026` l'éteint
d'elle-même dans trois jours), mais réelle d'ici là.

**LE CORRECTIF EST ÉCRIT ET VÉRIFIÉ, IL VIT DANS L'ARBRE, NON COMMITÉ** (`styles.css`) :
`pointer-events: none` sur `.transition-bandeau`, `auto` sur `.transition-bandeau-fermer` — le
patron des bandeaux NON MODAUX. **Aucun changement d'apparence.** Les 4 specs concernées
passent, dont `avis-identification-bandeau-508` (visibilité + fermeture). Contrepartie assumée
et documentée dans le CSS : le texte de l'avis n'est plus sélectionnable.

✅ **COMMITÉ le 28 août à 07 h 15 (`84661fc8`), APRÈS COORDINATION DIRECTE ENTRE LES DEUX
SESSIONS** — Grégoire ayant dit « tu peux communiquer avec l'autre session ».

Le blocage : le hook anti-cache exigeait de stager `index.html`, que la session parallèle
tenait avec ses propres modifications. Stager le fichier entier aurait emporté son travail —
l'incident que ce fichier documente trois fois. Elle a commité (`e2819cea`) **ses seuls
hunks**, méthode qu'elle a transmise et qui mérite d'être retenue : reconstruire « HEAD + ses
changements » dans un fichier à part, `git hash-object -w`, `git update-index --cacheinfo`,
puis `git commit` **sans chemins** — surtout pas `git commit -- <paths>`, qui repasse en mode
`--only` et recommite le contenu de l'ARBRE.

⚠ **UNE DE MES PRÉMISSES ÉTAIT FAUSSE, elle l'a corrigée** : le bump `styles.css` `c` → `d`
n'était pas d'elle. Les quatre jetons orphelins (`styles.css`, `preferences.js`, `accueil.js`,
`transitions.js`) étaient déjà dans l'arbre, non commités, posés par la session **#508**
elle-même. Ils sont partis avec `84661fc8` et **referment le rouge `sentinelle-anticache`**
qui traînait depuis la veille. ⮕ Vitest est repassé à **3767/3767, 354 fichiers, ZÉRO rouge**.

#### Le correctif, en clair — pour qu'il soit reconstructible si l'arbre le perd

Deux déclarations dans `styles.css`, rien d'autre. Elles vivent dans l'arbre non commité ;
un `git add -A` d'une autre session pourrait les emporter, et le scratchpad qui en garde une
copie est éphémère.

```css
/* dans .transition-bandeau, à côté de `z-index: 950` */
pointer-events: none;

/* dans .transition-bandeau-fermer, en première déclaration */
pointer-events: auto;
```

**Sa sentinelle** : `tests/integration/bandeau-non-modal-508.spec.js` (non commitée elle aussi).
Elle ne lit pas le CSS — elle pose un TÉMOIN sous le bandeau et vérifie qu'un **vrai clic** le
traverse, que le bouton de fermeture reste atteignable, et qu'il ferme encore l'avis.
**2 mutations, 2 rouges** (retirer l'un ou l'autre `pointer-events`). ⚠ Le correctif et sa
sentinelle doivent partir **dans le même commit** : commiter la spec seule la rendrait rouge
sur `HEAD` pour quiconque récupère le dépôt.

### 🔴 LE PUSH RESTE BLOQUÉ — UNE SECONDE RÉGRESSION, DANS `e2819cea`

Après le correctif #508, `scripts/pousser.sh` a refusé une deuxième fois, sur une AUTRE spec :
`evaluation-rendu.spec.js › Chantier I · evaluation rend la rétroaction Bilan`, ligne 197 —
`expect(resultat.aMentionForce).toBe(true)` reçoit `false`. Les deux assertions voisines
(`aTitrePresentement`, `aDefi`) passent : **c'est la mention de force, elle seule, qui a
disparu.**

Mesuré en worktrees, comme pour #508 : ✅ verte à `299afb32`, ❌ rouge à `e2819cea`, rouge
ensuite par héritage. ⮕ **Elle appartient au chantier n° 10 de la session parallèle**, qui a
remplacé `_NOMS_NIV_BILAN` / `_ORDRE_NIV_BILAN` par une dérivation depuis l'échelle et ajouté
un paramètre `niveauDe` à `_rendreForceBilan`. Hypothèse transmise : le montage de la spec ne
fournit pas d'échelle résolvable, donc plus d'ordre, donc aucun « meilleur » critère — l'ancienne
table en dur en fournissait un à tout le monde. **Diagnostic envoyé à la session parallèle ;
correction non engagée de ce côté-ci — c'est son fichier.** ⚠ `86475adf` (#576) ne l'a pas
réglée : vérifié après coup, la spec est toujours rouge.

⚠ **CE QUE CES DEUX RÉGRESSIONS DISENT, ET QUI VAUT POUR LES DEUX SESSIONS.** Les deux — le
bandeau #508 et celle-ci — sont passées sous un **Vitest vert** (3767/3767 des deux côtés) et
n'ont été vues **que par Playwright, au moment du push**. Sur un lot qui touche du RENDU, la
suite navigateur n'est pas une formalité de fin de course : c'est la seule qui regarde.

### ✅ LES DEUX LECTURES DE B10 SONT COMPATIBLES — VÉRIFIÉ AVEC L'AUTRE SESSION

Point de conception levé par échange direct, le 28 août. **Elle n'a PAS touché B10** :
`synthese-retroaction-data.js` est intact, toujours bloqué par #555, exactement comme inscrit
plus haut. Son chantier était le **n° 10** — `evaluation-retroaction.js`, un fichier DIFFÉRENT
de forme identique : 8 lignes, 18 comparaisons littérales, qu'elle a **toutes laissées**, pour
la même raison que moi. Ce qu'elle a dérivé de l'échelle : le **rang** (par `min`, puis `max` à
égalité — le cas des échelles « IDME et niv 0 ») et le **nom** du niveau, qui se lisent sans
arbitrage. Un test constate le compte de 18 et rougira quand #555 les retirera.
⮕ **La réserve « B10 bute sur #555 » tient, pour les deux fichiers.**

### ⚠ SON AVERTISSEMENT TERRAIN — VÉRIFIÉ SUR MES QUATRE PAS, SANS EFFET SUR EUX

Elle a créé puis corrigé une garde qui comparait les `echelleId` **BRUTS**. Chez Grégoire,
l'échelle courante (« IDME et niv 0 (RESTAURÉE) », recréée par la réparation #542) et les
`echelleId` que portent ses évaluations d'H2026 ne coïncident pas : la ligne « Progrès » ne
pouvait plus jamais s'afficher. Trouvé par la porte terrain 2.7, sur ses données réelles.
⮕ **Mes quatre pas ne comparent aucun id brut** (vérifié au grep sur `c85ec85b`) : ils passent
tous par `obtenirEchelleResolue` (5 appels) et `obtenirEchelleCommuneDesEvaluations` (3), qui
comparent les échelles **résolues** et traitent une échelle introuvable comme une ABSENCE, pas
comme un barème concurrent. C'est la règle qu'elle recommande.

### 📌 ~~#576 EST PRIS — prochain ID libre : #577~~ — **PÉRIMÉ, #577 a été pris le 28 août. Voir l'entrée du 28 août en tête de ce fichier.**

Par elle, le 28 août : « le bilan de rétroaction est VIDE quand la grille d'origine est
introuvable » (`_chargerGrilleDefBilan` → null, `_collecterCriteresBilan` → [], tout le bilan
personnalisé disparaît, alors que le panneau Évaluation voisin a un repli explicite).
Antérieur à nos deux lots, trouvé par la porte 2.6 avec captures.

### ⚠ DEUX SESSIONS SUR LE MÊME ITEM #575, LE 28 AOÛT AU PETIT MATIN

La session parallèle travaille **sur le lot 4 lui-même** : `evaluation-retroaction.js` (n° 10),
`liste-evaluations.js` (B7), `profil-etudiant-calculs.js`, et une sentinelle neuve
`sentinelle-575-ordre-niveaux-derive-echelle` — soit **B10**, que le bloc ci-dessus déclare
bloqué par #555. ⮕ **À vérifier au moment de la reprise** : ce que cette session a tranché
pour « quel niveau est faible / maîtrisé » sans #555, et si les deux lectures se contredisent.

### ⚠ `git maintenance` A RE-CRASHÉ — DEUXIÈME FOIS EN DOUZE HEURES

Trois nouveaux verrous à **04:53** (`index.lock`, `next-index-11.lock`,
`objects/maintenance.lock`), après ceux de 15:46 la veille. Retirés après la même vérification
(aucun git réel, aucune opération en cours). Ils bloquaient vraisemblablement AUSSI la session
parallèle, dont la dernière écriture date de 04:50.

⮕ **PISTE SUR LA CAUSE, mesurée deux fois** : `lsof` montre le même processus tenant les
fichiers `.lock` — **PID 47120,
`/System/Library/Frameworks/Virtualization.framework/…/XPCServices/com.apple…`**. Un service de
virtualisation qui garde des descripteurs ouverts sur `.git` expliquerait qu'une tâche de
maintenance meure en cours d'écriture. À instruire avant de re-nettoyer une troisième fois.

---

### ⚠ ERRATUM SUR LE MESSAGE DE `c85ec85b` — 35 → **32 mutations**

Le message du commit annonce « 36 cas, **35** mutations toutes rouges ». Le compte
re-dérivé au rituel de fin est **32** (8 + 6 + 7 + 11, un script de break-test par
sentinelle). Les 36 cas sont justes, « toutes rouges » est juste, et **les quatre comptes
par sentinelle inscrits au BACKLOG sont justes** (8/8, 6/6, 7/7, 11/11) : c'est le total
agrégé, et lui seul, qui était faux — recopié sans être re-dérivé.

⮕ Trouvé par le §4.2 du rituel (« confrontation des affirmations au diff »), pas par
relecture. C'est exactement le motif de `feedback-total-tests-lu-apres-dernier-changement` :
un chiffre plausible, jamais recompté. **L'historique n'a pas été réécrit** — le commit
n'est pas poussé, la réécriture reste possible et c'est la décision de Grégoire.

---

### ⚠ CE QUI RESTE DE #575, ET CE QUI BLOQUE

- **B7** (filtre `['I','D','M','E']`, `liste-evaluations.js:368`), **n° 10** (bilan de
  rétroaction, `evaluation-retroaction.js:488`), **n° 11** (`convertirNoteEnValeur`,
  `evaluation.js:284` — une **échelle ancienne où `I = 3`**, qui contredit IDME). Aucun ne
  dépend d'un arbitrage : ils sont faisables tels quels.
- **B10 — BUTE SUR #555.** `synthese-retroaction-data.js` ne compare pas seulement par
  `ORDRE_NIV` : il teste les codes **en toutes lettres à six endroits** (`=== 'I' || === 'D'`
  pour les défis, `=== 'M' || === 'E'` pour « tous maîtrisés »). L'ordre se dérive d'une
  échelle ; « faible » et « maîtrisé », non — c'est exactement la marque de maîtrise de
  **#555**. Le faire sans elle remplacerait un arbitrage en dur par un autre.

### ⚠ CE QUI DEMANDE LES YEUX DE GRÉGOIRE

Trois rendus modifiés, **non vérifiés** (l'environnement de test est `node`, sans navigateur) :
la **lettre du niveau** dans « Développement des habiletés », les **badges d'artefacts**
(couleur), les **barres de critères** des deux blocs (dégradé + légende). Sans échelle
résolue, le comportement voulu est : **pas de lettre, badge neutre, fond de barre neutre,
cause au survol** — jamais un repère inventé.

### ⚠ TROIS VERROUS GIT ORPHELINS — ET C'EST RÉCURRENT, PAS UN ACCIDENT

`git maintenance` a crashé et laissé `.git/index.lock`, `.git/HEAD.lock` et
`.git/objects/maintenance.lock` — **tout commit était impossible** jusqu'à leur retrait
(vérifié d'abord : zéro processus git actif, aucune opération en cours, locks vides et
vieux de sept heures). Si une session retrouve « Unable to create '.git/index.lock' », le
diagnostic est là : `find .git -name '*.lock'`, vérifier l'âge et l'absence de git actif
**avant** de retirer quoi que ce soit.

⮕ **CE N'EST PAS LA PREMIÈRE FOIS.** Le signet en tête de `SESSION.md` demandait **exactement
le même `rm` depuis JUILLET**, et le 28 juin en portait déjà un (« crash git du 28 juin 21:17 »).
Trois occurrences sur trois mois : le geste de nettoyage est connu, c'est la CAUSE qui ne l'est
pas. ⮕ **À trancher par Grégoire** : désactiver la maintenance automatique
(`git config maintenance.auto false`), ou inscrire le contrôle des locks au rituel de DÉBUT de
session. Re-nettoyer à chaque fois n'est pas une réponse.

---

## ▶ POUR LA SESSION QUI PREND LE RELAIS — 27 août 2026, fin de journée (entrée précédente)

### ✅ L'AUDIT FABLE 5 EST RENDU — 27 août 2026, 15 h 45

`Rapports/AUDIT-decouplage-srpnf-idme-conception-2026-08-27.md`. Périmètre élargi par Grégoire au 27 août et à
l'onglet Conception. **Verdict en une ligne** : les correctifs des 26-27 août font ce qu'ils annoncent
et mordent (25/31 sentinelles sur chacune de leurs assertions) ; la réparation de l'échelle orpheline n'a touché
aucune note ; **mais le lot 4 du plan SOLO n'a jamais été livré**, et il produit des chiffres faux chez
Grégoire aujourd'hui (`analyserSousGroupe` → repli IDME de `portfolio.js` derrière une clé jamais écrite).

⮕ **Ce qui attend Grégoire** (rapport §9, une décision) : par quoi ouvrir — **A** lot 4 du plan SOLO en
item propre (recommandé) · **B** Conception, #573 + #574 · **C** volet données (commande de vérification
du §6, un Codex enregistré, garde référentielle à la suppression d'échelle, #545).

⚠ **Trois affirmations du 27 août sont fausses, ne pas les recopier** : « plus aucun ternaire `>= 85` »
(`determinerLettreIDME` est rendu à l'écran) ; « `_identifierPatternActuel` vivant » (mort) ; « 3695/3695
lu à l'écran » (3678 au SHA — l'écran montrait l'arbre d'une autre session). Et **`_genererBarresSRPNF`
est VIVANT**, pas « probablement mort ». Détail §2.2 du rapport.

⚠ **Le hook lot C verrouille le `|| 2`** de durée d'intervention qu'il croit retiré
(`interventions.js:1345` l'écrit en base). Sentinelles à renforcer : rapport §4.


### ⚠⚠ LA RÈGLE QUI COMMANDE LE PROCHAIN CHANTIER

> **Grégoire, 27 août 2026** : « Ce qui est important, ici, c'est surtout de ne rien coder
> en dur. Les utilisateurs auront tous des besoins et des conditions différentes et je ne
> veux pas imposer mon contexte. »

Ce n'est pas une préférence de style : c'est le **critère qui tranche** chaque question
ouverte du chantier, et il élimine des options avant qu'on en discute. ⮕ **Distinguer
conséquence logique et valeur arbitraire** : dériver un libellé d'une donnée que
l'utilisateur a saisie est une conséquence ; écrire « au-dessus de 75 %, c'est la maîtrise »
est un arbitraire, **même configurable**. La règle vise le second.

### ✅ LE CHANTIER #552 · #537 · #535 EST LIVRÉ — 1.104.1, 27 août 2026

**Décision de Grégoire** : rebrancher sur le **niveau SOLO configuré** du critère et sur
l'**IPB × direction**. Consigne complète, avec son §10 « ce que le chantier a donné » :
`plans de travail/CONSIGNE-552-537-535-cibles-intervention-sans-contexte-impose.md`.

⚠⚠ **DEUX MESURES ONT DÉPLACÉ LE SUJET, et la consigne elle-même se trompait dessus.**

1. **`determinerCibleIntervention` n'alimentait PAS l'écran d'accompagnement.** L'appel existait
   bien, mais son résultat n'y remplissait que `badgeClasse` et `badgeLabel` — **assignés quatre
   fois, jamais lus**. Le badge RàI rendu vient de `niveauRai`, donc de
   `determinerNiveauRaiPedagogique`. L'appel mort est retiré ; la sentinelle #551 (test 3), qui
   verrouillait sa présence, est corrigée.
2. **Son seul appelant vivant, `tableau-bord-apercu.js`, n'en lit que `.pattern`** — et tous les
   chemins de retour rendaient `pattern: M`, calculé AVANT les résolveurs. ⮕ **Aucun libellé de
   cible n'atteignait un écran.** Les trois options A/B/C du §8 portaient donc sur une chaîne que
   personne n'affichait ; ce qu'il fallait refonder, c'était le CALCUL DE L'INTENSITÉ.

⮕ **Et sa source non arbitraire existait déjà, à côté, vivante** : `diagnostiquerSuiviApprentissage`
(IPB × direction — la table du modèle RàI documentée dans le skill `depistage-rai`), consommée par
le tableau de bord. Les résolveurs en produisaient une seconde, concurrente, sur des notes sur 30
comparées à des pourcentages.

**Ce qui est en place**

| | |
|---|---|
| **L'intensité** | `diagnostiquerSuiviApprentissage` — artefacts consécutifs sous le seuil de défi CONFIGURÉ, croisés avec la direction. Aucun seuil écrit dans la cible |
| **La cause** | **NOMMÉE, pas prescrite** : « Difficulté persistante — Structure (multistructurel) ». Le nom vient de la grille de l'utilisateur, le niveau SOLO du champ qu'il a configuré |
| **Retirés** | Les 4 résolveurs · `I` · les seuils `17/18/20/21/25/27` · « CAF », « Dépistage SA », « Remédiation en X », « Pratique guidée en X » · `francaisMoyen` et `NOM_CRITERE_LANGUE` dans `profil-etudiant-calculs.js` · **l'exclusion `c.nom !== 'Français'`** de la carte « Observation de la structure » |
| ⮕ **CE QUI CHANGE À L'ÉCRAN, et c'est le SEUL changement visible du chantier** | **Son critère Français apparaît maintenant dans la carte « Observation de la structure »**, dont il était exclu. Conséquence qu'il a assumée et confirmée explicitement le 27 août — mais elle se verra dès le rechargement |
| **Ajoutés** | `niveauSOLO` remonté par `diagnostiquerForcesChallenges` (il était jeté) · `libelleNiveauSOLO` exportée, qui déduplique la table SOLO écrite aussi dans `interventions.js` |
| **La preuve** | `tests/unit/sentinelle-552-cible-independante-du-critere-de-langue.test.js` — 5 tests. Le CONSTAT **réécrit et renommé**, pas supprimé. Trois élèves identiques sauf leur langue (15/60/90 %) : **même intensité**, difficulté nommée dans les trois cas. Une grille « Méthode / Résultats / Discussion » produit une cible complète. **2 break-tests rouges**, restauration vérifiée par `diff -q` |

**Ce qui en sort — inscrit, pas oublié**

- **#553** — le **rabotage de clé** `startsWith('francais')`, 8 sites. Pas de la didactique : un
  pansement sur un appariement qui échoue. **Tout critère dont le nom varie entre deux écritures a
  le même bug, en silence, avec des 0 %.**
- **#554** — la branche « Décrochage » de la cible **n'est jamais atteinte** :
  `interpreterMobilisation(A, C, statutDecrochage)` n'est appelée qu'avec deux arguments, alors que
  le statut existe dans le modèle. Constaté et **volontairement non corrigé** : brancher un site
  mort est un geste distinct.
- **#555** — le **seuil de défi** : défaut à 0,70, et des replis en dur qui **divergent selon les
  fichiers** (0,70 dans `calculs.js` et `interventions.js`, 0,75 dans `sections-affichage.js` et
  `pratique-pan-standards.js`). ⮕ **Le §6 se resserre** : il ne manque pas une marque de maîtrise
  pour PRODUIRE une intensité — l'IPB × direction en produit une — il en manque une pour FONDER ce
  seuil. Premier pas possible sans décision : unifier les quatre replis.

### ✅ L'AUDIT DE L'ONGLET ÉVALUATIONS EST RETROUVÉ ET VERSÉ — 27 août 2026

Il avait été demandé à **Fable 5** (session cloud « Audit onglet Évaluation ») et **il était resté
sur sa branche**, `claude/audit-evaluation-tab-txocw7`, jamais fusionnée — pendant que son **rapport
jumeau**, l'audit Conception du même jour, l'avait été. Personne ne l'avait vu depuis le 25 août.

- **Rapport fusionné sur `main`** : `Rapports/AUDIT-evaluation-onglet-2026-08-25.md` (commit
  `b7f46938`, cherry-pick, auteur d'origine conservé).
- **17 items versés au backlog : #556 à #572.** ⮕ **Dernier ID pris : #572.**
- **Deux critiques, revérifiés sur 1.104.1 le 27 août — ils tiennent encore** :
  **#556** « Vider la corbeille » détruit les fichiers de TOUS les groupes-cours alors que la modale
  n'a compté que le groupe actif (perte de données) · **#557** `supprimerEvaluation` existe en
  double et c'est la version SANS restauration de l'originale qui gagne l'export `window`
  (`liste-evaluations.js` ligne 14580 contre `evaluation.js` ligne 14595 dans `index.html`).

⚠ **CE QUE CET AUDIT N'EST PAS.** Il se déclare **lecture seule** : tous ses verdicts sont
`[lecture]`, aucun Chromium n'a été lancé, les deux critiques ont été contre-vérifiés par une
seconde lecture et non par un essai. Sa base est **1.99.0**, cinq versions en arrière : **ses
numéros de ligne sont périmés** et seuls A1/A2 ont été revérifiés. ⮕ **Reproduire avant de
corriger**, et regreper avant de suivre une ligne.

⮕ **Leçon de méthode** : un audit commandé à une session cloud ne revient pas tout seul. Vérifier
la branche `claude/*` correspondante à la fin du travail, sinon le livrable existe sans que
personne ne le sache.

### Ce qui attend encore un verdict de Grégoire

- **Étiqueter son échelle en SOLO** — il a répondu « oui, maintenant » (D3), le geste est à
  lui. ⮕ **Ce n'est plus un confort** : les consignes du modèle de cartouche (#549) font
  dépendre toute leur rédaction du « seuil de maîtrise », et l'étiquette SOLO est aujourd'hui
  la seule donnée du dépôt qui puisse en approcher.
- **Le niveau « 0 » dans le modèle de cartouche** — la matrice génère une ligne par niveau, et
  la consigne demande de décrire « ce qu'un travail de ce niveau présente ». Un jugement
  suspendu ne présente rien.
- **Deux points de vocabulaire** — « préstructurel » garde une formulation courte parmi
  quatre longues ; les quatre longues emploient « il/elle », un accord lourd que sa convention
  demande de reformuler.
- ⏳ **ÉCHÉANCE DATÉE, DANS 5 JOURS — le 1er septembre** : #427 et #508. ⚠ **Les décisions du
  26 août ont été renversées le 27** : policy **ouverte** (`Everyone`) + OTP, session d'un mois,
  **aucune liste blanche** — le motif est d'identifier les utilisateurs, pas de filtrer l'entrée.
  Trois faits erronés corrigés au passage (quota jamais saturé, mesure d'usage possible via
  `My Team → Users`, 15 connexions postérieures à fin février). ADR-008, `DEPLOY.md` v1.6,
  `PRIVACY.md` v1.2, `SECURITY.md` et la fiche opératoire sont alignés. **Dû par lui, et personne
  ne peut le préparer à sa place** : les trois noms Cloudflare pour les `[À COMPLÉTER]` de
  `DEPLOY.md` §3.1-§3.3, la durée de session et la règle `Include` réellement en place, et
  l'arbitrage sur l'URL Netlify directe (elle contourne peut-être Access — non testé).

### Trois pièges qui coûteront à qui les ignore

1. ⚠⚠ **NE JAMAIS ÉCRIRE « fais un `git pull` » DANS UNE PORTE TERRAIN.** Le clone
   `~/Documents/GitHub/Monitorage_v6` est **à la fois** l'arbre de travail des sessions et la
   source `file://` de son application. Quand la session commite là — le cas courant — ses
   commits sont **déjà chez lui**. GitHub Desktop affiche « No local changes » et ne propose
   aucun pull. **Il s'est bloqué là-dessus le 27 août**, et le gabarit portait la consigne
   fautive : corrigé dans `.claude/skills/portes-terrain`. La rangée juste est « recharge
   l'application, et lis le numéro en bas de page ».
2. ⚠ **L'anti-cache ne se vérifie qu'UNE FOIS PAR CYCLE DE RELEASE.** La sentinelle contrôle
   que le `?v=` a changé depuis la release précédente ; une fois qu'il a changé, elle reste
   verte quel que soit le nombre de modifications suivantes du même fichier. Un correctif est
   parti sous un `?v=` déjà servi le 27 — le navigateur de Grégoire aurait rendu l'ancien
   fichier. **Bumper le `?v=` à chaque commit qui touche le fichier**, pas une fois par cycle.
   Versé à **#547**.
3. ⚠ **Un script de garde qui échoue sans bloquer la suite ne garde rien.** Le même jour, un
   script de bump a levé une exception, la commande suivante s'est exécutée quand même, et le
   commit est parti en croyant l'anti-cache posé. **Chaîner avec `&&`**, et faire sortir le
   script en erreur explicite.

---

## ✅ PORTE TERRAIN DU 27 AOÛT — RELEVÉE, LES QUATRE DÉCISIONS SONT PRISES

| Décision | Verdict de Grégoire | Suite |
|---|---|---|
| **D1** survol SOLO sur iPad | « confort réservé au Mac » | **CLOS**, aucun code |
| **D2** le niveau disparaît sous sommative | « le niveau disparaît » | **CLOS**, comportement confirmé |
| **D3** étiqueter son échelle en SOLO | « oui, maintenant » | ⏳ **son geste** — et ce n'est plus un confort : la consigne du modèle de cartouche (#549) fait dépendre toute sa rédaction du seuil de maîtrise, que seule l'étiquette SOLO peut donner |
| **D4** laquelle des trois formulations SOLO | « les longues » | ✅ **APPLIQUÉ** dans `NIVEAUX_SOLO_ECHELLE` |

⚠ **Ce que la porte a attrapé, et qu'aucun test ne pouvait voir** : le niveau global ne
s'affichait PAS chez lui. Une évaluation désignant une échelle disparue était comptée comme
« une deuxième échelle », et le code refusait de choisir. Corrigé le matin même.

⏳ **Deux écarts signalés sur D4, non tranchés** : « préstructurel » garde sa formulation
courte (aucune longue n'existait) ; les quatre longues emploient « il/elle », un accord lourd
que la convention d'écriture inclusive demande de reformuler.

---

## ⏳ ANCIENNE ENTRÉE — porte terrain ouverte (remplacée ci-dessus)

`plans de travail/PORTES-TERRAIN-2026-08-27-niveau-global-selon-pratique.md`
(jumeau interactif : le `.html` de même nom, publié comme artefact).

**3 vérifications, 3 décisions.** Volontairement courte : les deux règles de tête du skill
`portes-terrain` l'exigent — aucune porte si une machine peut répondre, et pas de préalable
si un raté n'est pas irréversible. **Rien de ce qui a été livré le 27 n'écrit dans les
données**, d'où l'absence de §1.

⚠ **Ce que la porte annonce en tête, et qu'une session suivante doit savoir** : dans la
carte Accompagnement, **deux lignes ne suivent pas encore la même règle**. « Performance
globale » lit l'échelle de la pratique (pas 3c-1, fait) ; « Progression par critère », juste
en dessous, calcule encore avec le ternaire en dur (pas 3c, reste). Sur une échelle non-IDME,
**deux codes différents peuvent s'afficher pour le même élève**. Ce n'est pas un défaut à
corriger en urgence, c'est le chantier à moitié fait — mais il ne faut pas le découvrir par
surprise.

⏳ **Les trois décisions attendent un verdict ÉCRIT** : (D1) le survol SOLO est inaccessible
sur iPad ; (D2) le niveau disparaît sous sommative, est-ce ce qu'il veut voir ; (D3)
étiqueter son échelle en SOLO maintenant ou pas.

---

## Les arbitrages de Grégoire, 27 août 2026 — quatre dossiers refermés

| Dossier | Verdict | Effet |
|---|---|---|
| **#538** | Les **trois** portes terrain sont conformes — cours ordinaire, **reprise** (le cas critique), et **groupe-cours sans horaire** | **CLOS.** La troisième porte est la seule qu'aucun test ne pouvait trancher : sans horaire, l'application affiche **0 et le dit**, au lieu du `2` inventé |
| **#534** | Durcir la SEULE spec qui a un manque objectif | **CLOS.** `cours-refonte-rendu.spec.js` attend désormais `window.dbReady` au lieu d'un `waitForTimeout(500)` sans marge. **Quatre** montages, pas deux comme l'item l'annonçait. 4/4 verts en 4,4 s — plus rapide qu'avant |
| **#533** | L'item du backlog change de numéro (1 fichier) | **Renuméroté #533 → #548.** ⚠ L'arbitrage disait « #540 » : **il n'était plus libre**, pris la veille au soir par l'assiduité. Appliqué à la lettre, il recréait la collision qu'il éteignait |
| **#542** | « Aucun aspect pertinent n'est traité » est retenue | Les **cinq** descriptions SOLO sont désormais de sa main ou de son accord. Inscrit dans `echelles.js` |

⚠ **LA LEÇON DU #533, ET ELLE VAUT POUR TOUT ARBITRAGE DIFFÉRÉ.** Entre le moment où un
numéro est tranché et celui où il est appliqué, **le dernier ID a bougé**. C'est le cas
d'école de `feedback-id-backlog-inscrire-avant-usage`, vu depuis l'autre bout : ce n'est
plus deux sessions qui prennent le même numéro, c'est une décision qui vieillit d'une
soirée. ⮕ **Vérifier le dernier ID au moment d'APPLIQUER, jamais celui qu'un document —
ou une décision — annonce.**

---

## Ce que la matinée du 27 août a livré

**#542 lot 3, pas 1 et 2** — `4d04dd21`, `750e7c3f`. Le nombre de pas était plafonné à deux
par la consigne ; deux ont été faits.

**La décision qui commandait tout, prise avant la première ligne de code — OPTION B** :
l'étiquette SOLO est facultative, et son absence est DITE. Sans étiquette, le dépistage
rend le **nom du niveau atteint** et nomme ce qui manque. Il ne se tait pas (A), il
n'invente pas (C). ⮕ **Conséquence pour le pas 5 : les seuils `idme.*` n'ont plus aucun
rôle de repli possible.**

- **Pas 1** — `situerPourcentageDansEchelle` : la moyenne se situe dans les plages de
  l'échelle de l'UTILISATEUR. Hors plage rend `null`, **sans repli « plus proche »** — un
  repli par distance fabrique une réponse que l'échelle ne donne pas.
- **Pas 2** — `interpreterNiveauAtteint` : l'interprétation vient de l'étiquette SOLO. Les
  quatre descriptions rapatriées dans `NIVEAUX_SOLO_ECHELLE` (`echelles.js`), leur source
  unique.

⚠ **RIEN N'EST BRANCHÉ À L'ÉCRAN** — les deux fonctions n'ont aucun appelant, et
l'application se comporte exactement comme avant. C'est délibéré : le branchement est le
pas 3. **Playwright n'a rien de neuf à observer ; il en aura au pas 3.**

⏳ **DÛ PAR GRÉGOIRE avant le pas 3** : valider **« Aucun aspect pertinent n'est traité »**
(description de « préstructurel »). Seul texte écrit à neuf du lot — l'ancien code n'en
produisait que quatre pour cinq niveaux SOLO.

⮕ **Une donnée neuve versée à #547** : la sentinelle anti-cache exige un `?v=` du **jour du
build**, pas du jour de la modification. Poser `20260827a` sous un build `0826-1658` la fait
rougir. Les deux règles du projet se contredisent dès qu'on travaille le lendemain d'un
build — ce qui **écarte la piste (b)** de #547 et laisse la piste (a), un contrôle qui
SIGNALE au pre-commit.

**Vitest 3635/3635 (340 fichiers)**, lu après le dernier changement. 20 tests neufs,
**8 break-tests rouges vérifiés**, restauration confirmée par `diff -q`.

---

## Ce que la soirée du 26 août a livré (21e cycle)

**Trois chantiers, trois sessions, tout sur `main`.**

### #540 — CLOS. L'assiduité comptait des périodes qui n'existaient pas.

Parti d'une capture de Grégoire : « le nombre d'heures de cours par semaine n'est pas
dans les formulaires ». L'audit a montré l'inverse — il y était, dérivé et jamais
vérifié — puis a découvert bien pire en chemin.

| Lot | Ce qu'il a fait |
|---|---|
| **A** | La pondération devient obligatoire (astérisque, refus dit), normalisation vers « 2-2-3 ». **Un export orphelin trouvé** : `proposerHeuresEnseignementDepuisPonderation` n'a JAMAIS fonctionné — jamais exportée sur `window`, le dispatcher ne la trouvait pas. |
| **B** | Le `× 15 semaines` en dur retiré : les semaines se comptent au calendrier. Un 2-2-3 sur onze semaines vaut 44 h, pas 60. |
| **C** | L'écran Horaire cesse d'afficher `nbSeances × periodesParSeance` et affiche ce qu'il compte. Les replis à `2` taris. |
| **E1** | **Chaque séance porte SON nombre de périodes**, saisi et jamais déduit. Le champ global disparaît. |
| **E2** | **Plus aucune division** ne convertit une durée en périodes. Les deux migrations cessent de deviner. |
| **E3** | Le réglage « Durée d'une période » disparaît. La saisie n'écrit plus le champ `heures`. |
| **D** | L'horaire est confronté au devis du cours, et le dit. Jamais bloquant. |

⮕ **CE QUE GRÉGOIRE A APPORTÉ, ET QUI N'ÉTAIT NULLE PART DANS LE CODE** : « une heure
qui dure 60 minutes, c'est une période de 50 minutes plus 10 minutes de pause. Dans
d'autres collèges, 55 plus 5. » Tout le dépôt divisait un temps d'horloge par la seule
durée d'enseignement : `08:00 → 11:00` rendait **4 périodes au lieu de 3**, et un bloc
de quatre heures — cas courant en littérature — en comptait **5 pour 4**. L'erreur
croissait avec la durée, et ce nombre EST le dénominateur de l'assiduité : **un élève
pouvait être compté absent d'une période qui n'existe pas.**

⮕ Puis sa question a tranché le chantier : « je me demande si la durée de la période est
pertinente et si elle ne crée pas davantage de confusion. » L'audit lui a donné raison —
ce champ n'existait que comme **pont entre deux unités**, et un ratio est invariant par
unité. Il ne servait pas à calculer l'assiduité, seulement à réconcilier deux modes de
saisie.

⮕ **EN UNE PHRASE** : l'application ne convertit plus jamais une durée en périodes, parce
qu'elle ne le peut pas. Elle demande les deux, et les confronte.

### ⚠ CE QUE #540 LAISSE, ET QUI DEMANDE UNE DÉCISION

- **Les `nombrePeriodes` déjà écrits en base par les migrations** peuvent être gonflés.
  Elles ont tourné à chaque démarrage pendant des mois. Irréparables sans savoir ce que
  `duree` signifiait — personne ne peut le dire après coup.
- **Les horaires existants de Grégoire** ont des séances sans `nombrePeriodes`. Le
  chargement pré-remplit avec `periodesParSeance` (sa propre déclaration, pas une
  déduction), mais il doit **ouvrir chaque horaire et enregistrer** pour que ce soit
  écrit sur les séances.
- **Cinq `alert()`** subsistent dans `trimestre-v2-cours.js`, sur d'autres gestes
  qu'« Enregistrer ». Et `mettreAJourLigne` (`saisie-presences.js`) est **du code mort** :
  elle lit un champ `heures_${da}` que plus personne ne génère.

### #541 — le dépistage classait TOUT LE MONDE en « Étendu »

Livré et poussé (`69ce1483`) par la session « audit dépistage ».
`obtenirNiveauIDMEDepuisPourcentage` recevait un pourcentage 0-100 et le comparait à des
seuils 0-1 : **tout critère au-dessus de 1 % ressortait « Étendu »**, y compris à 12 %.
Le bloc « Forces et défis » ne pouvait afficher que des forces exceptionnelles, pour tout
le monde. Défaut antérieur à #529, au moins depuis le 17 mai. Aucun test ne l'exerçait.

Plan versé : `plans de travail/PLAN-SOLO-echelle-et-depistage.md` (`43cc4faa`), six lots.

### #542 — EN COURS, session encore active au moment d'écrire

Lots 0 et 1 livrés, oracle écrit. **Lots 2-3 en cours.** Ses fichiers :
`js/interventions.js`, `js/profil-etudiant-calculs.js`,
`js/profil-etudiant-sections-affichage.js`, `js/echelles.js`.

⮕ **LA DÉCOUVERTE QUI DÉPASSE LES TROIS CHANTIERS, et qui n'est de personne :**

> **383 évaluations sur 670 — 57 % des niveaux — désignent une échelle introuvable**,
> dont 339 sous le seul id `1767389426695` en H2026. Les valeurs survivent sous deux
> autres ids. Même patron que les grilles désappariées du 5 août.

**Le dépistage de Grégoire tourne aujourd'hui sur moins de la moitié de ses données, sans
le dire.** Antérieur à tous les chantiers de la soirée. Aucune réparation engagée : c'est
une décision sur ses données réelles, avec sauvegarde et dry-run. L'oracle du 26 sert à
identifier laquelle avant d'y toucher.

⮕ **Prochain ID libre : #548.** ⚠ Ce chiffre a bougé QUATRE FOIS pendant la rédaction de ce
relais — il annonçait #543, déjà pris, puis #547 l'a été à son tour. Les collisions ont été
évitées en inscrivant chaque item au backlog AVANT de l'employer ; **vérifier le dernier ID
au moment d'écrire, jamais celui qu'un document annonce.**

### ⚠ Une leçon qui vaut pour ce fichier lui-même

**Les documents de coordination se périment plus vite que le travail qu'ils décrivent.**
Constat de la session #541 sur son propre cadrage d'audit : quatre de ses affirmations
étaient fausses deux heures après l'avoir écrit, dont « aucune réparation n'a été engagée »
alors qu'elle venait de l'être sur les données réelles. Son périmètre avait doublé — 11
commits devenus 22. Elle a inscrit les corrections DANS le document plutôt que de les
effacer, et c'est le bon geste : dans un dépôt à trois sessions, la vitesse de péremption
d'un cadrage est une donnée en soi.

⮕ **Ce relais-ci ne fait pas exception.** Le lire au début d'une session, oui ; le croire
sur les chiffres, non — vérifier `git log`, `BACKLOG.md` et l'arbre.

### L'audit externe des 26-27 août — ✅ RENDU le 27 août, 15 h 45

Cadrage : `Rapports/CADRAGE-AUDIT-FABLE5-2026-08-27.md`. Rapport : `Rapports/AUDIT-decouplage-srpnf-idme-conception-2026-08-27.md`.
Périmètre finalement **élargi** par Grégoire (27 août et onglet Conception inclus ; la didactique
reste hors jugement). Voir le bloc « L'AUDIT FABLE 5 EST RENDU » en tête de ce fichier.

### Défauts trouvés et NON corrigés (inscrits, pas oubliés)

- `interventions.js:221` — `seuils.acceptable` est `undefined` (la clé vit sous
  `interpretation.acceptable`) : `score < undefined` est toujours faux, donc **la liste
  des défis communs d'un sous-groupe est toujours vide**.
- `portfolio.js:543` et `:554` — un quatrième repli IDME en dur, dont la clé de lecture
  `echellesPerformance` n'est **jamais écrite** nulle part : le repli est toujours actif.

---

## Ce que le cycle a livré

**Cinq versions, toutes nées de son travail réel** — il préparait son 601-101 dans
la Carte d'alignement, et chaque friction est devenue une livraison le jour même :

| | |
|---|---|
| **1.72.0** | ⌘D duplique toute la multi-sélection (Supprimer la traitait déjà — c'était une asymétrie, pas un manque) |
| **1.73.0** | « Tout voir » + **loupe de navigation** (sa carte est illisible à 25 %, qui était le plancher du zoom) |
| **1.74.0** | Guides magnétiques + six commandes d'alignement |
| **1.74.1** | Le clic dans la carte atterrit · le pointeur devient la zone examinée |
| **1.75.0** | **#448** — une collision d'id à l'import n'est plus un accident à renommer |

Plus : **#451 clos** (a2026 porté dans Safari), **#450** et **#449** documentés
sur mesures, `SKILL_portes_terrain.md` amendé, et trois outils de console
(`diagnostic-448`, `reparation-448`, `inspecterOrphelins448`).

---

## ⚠ CE QUI RESTE DÛ, ET QUI N'EST PAS DU CODE

**Sa rentrée est dans trois semaines.**

0. ✅ ~~**SES CARTOUCHES ORPHELINES — à récupérer.**~~ **FAIT le 24 août au
   soir, par Grégoire lui-même.** Les 6 cartouches A26 de sa soirée (lots 16 et
   5 du dry-run) sont rattachées à « Grille-5 FR-HOLIS A26 » via
   `scripts/reparation-cartouches-orphelines.js`. Les lots d'origine sont
   CONSERVÉS — filet volontaire, à retirer seulement après vérification à
   l'écran.

   ⏳ **Ce qui reste de son côté, et qui n'est pas du code :**
   · **trois paires à départager** sur cette grille — « Description d'un
     personnage » / « … A26 », « Carte mentale » / « … A26 », « Plan de
     rédaction » / « … A26 ». La garde d'identité conserve les deux exemplaires
     par construction ; c'est à lui de comparer et de retirer la périmée ;
   · « Stratégies de lecture A26 » a suivi son lot vers A, alors que
     « Stratégies de lecture » vit sur B (Grille-4 A26). S'il veut l'y déplacer,
     il faut un rattachement À LA PIÈCE — le script ne sait déplacer qu'un lot
     entier.

   ⏳ **16 lots orphelins restants, laissés À DESSEIN** : matériel démo
   (générique, Démo, les deux « rapport de laboratoire » chimie/bio), trimestres
   passés, et trois piles de doublons (le lot 12 contient « Description d'un
   personnage » DEUX fois, le 13 a « Carte mentale » en triple). Les rattacher
   inonderait ses trois grilles et recréerait les doublons fermés en 1.92. Le
   ménage est une décision séparée, avec un dry-run par lot.

0 bis. ⏳ **PORTES TERRAIN 1.95.2 — 20 rangées + 4 décisions, non relevées.**
   `plans de travail/PORTES-TERRAIN-2026-08-24-cartouches-inter-trimestre.md`
   (jumeau interactif : le `.html` de même nom). La rangée 1.1 confirme que la
   section apparaît bien chez lui après le correctif de la 1.95.1 — c'est elle
   qui avait échoué sur sa capture. Les rangées 2.0.x couvrent la persistance de
   la section pour les TROIS bibliothèques dont le rendu n'a pas été joué au
   navigateur (échelles, pratiques, productions). 10 comportements retirés de la
   liste sur preuve mesurée (`cartouches-import-trimestre.spec.js` +
   `bibliotheques-import-persistance.spec.js`).

   ⚠ **La leçon du lot, et elle vaut au-delà.** La porte 1.1 que j'avais écrite
   prévoyait l'échec et l'attribuait à SES données (« ses archives n'ont
   peut-être pas de copies »). C'était faux, et c'était mon bug. Une porte
   terrain qui pré-explique un échec par les données de l'utilisateur est une
   porte qui invite la session suivante à ne pas chercher. **Reproduire avant de
   conclure**, même — surtout — quand on a soi-même écrit l'explication qui
   arrange.

0 bis. ⏳ **PORTES TERRAIN 1.94.1 — 18 rangées + 5 décisions, non relevées.**
   `plans de travail/PORTES-TERRAIN-2026-08-24-confirmations-conception.md`
   (jumeau interactif : le `.html` de même nom). Le tri a déjà été fait —
   12 rangées ont été retirées **sur preuve mesurée** (§2 bis, harnais Chromium
   dans `tests/integration/confirmations-conception-uniformes.spec.js`). Ce qui
   reste est **structurellement invérifiable en conteneur** : Safari, l'iPad, le
   corpus réel, et les trois éditeurs (production, cartouche, pratique) dont le
   formulaire est trop lié à l'état de l'app pour être piloté. **Les 5 décisions
   du §3 attendent un verdict ÉCRIT de Grégoire**, pas une coche — deux touchent
   au libellé (guillemets droits ou français ; « sauvegardée » ou « créée » pour
   un objet neuf), une au périmètre (≈165 `alert()` de validation et d'erreur
   laissés en fenêtres natives, à migrer ou non).

1. ✅ ~~⚠️ **#368 — vérifier EN PREMIER que la carte 601-101 est bien passée en
   A26.**~~ **VÉRIFIÉ PAR GRÉGOIRE le 18 août** : « oui, la carte 601-101 est
   vraiment en A26. » Le préalable de la rentrée est levé ; l'entrée #368 est
   cochée au BACKLOG (restes optionnels : ménage des cartes, confirmation
   Safari — la carte y voyage par codex).
2. ⚠️ **#450** — renommer les deux échelles « IDME et niv 0 » d'a2025, **dans les
   deux navigateurs**. Citées 344 et 72 fois : renommer, jamais fusionner.
3. ⏳ **Safari** — les 5 copies muettes y sont encore. Chrome est nettoyé (83 → 78).
4. ⏳ **6 magasins orphelins** — décision humaine, pas de script.

---

## ⚠⚠ LA LEÇON DU CYCLE, ET ELLE COMMANDE LA SUIVANTE

**CINQ FOIS, C'EST MON PROPRE OUTIL QUI MENTAIT — et chaque fois c'est une MESURE
qui l'a dit, jamais une relecture.**

1. La barre d'alignement partait **hors écran** : offset du canevas oublié. **Le
   même oubli que la loupe deux heures plus tôt**, dans la même session.
2. « Tout voir » tombait au plancher **en silence** quand la zone n'avait pas de
   taille.
3. La loupe restait **vide** sous la grille du Planificateur — écouteur posé sur
   la zone au lieu du document. Symptôme « ça marche parfois ».
4. Mon inspecteur d'orphelins déclarait « CONTENU UNIQUE » huit fois dans un
   magasin de quatre paires : j'excluais le magasin courant de sa propre
   recherche. **Et son verdict conseillait de SUPPRIMER un contenu qui n'existait
   que là.**
5. Mon garde a refusé cinq retraits légitimes sur `dateImport` — le projet avait
   déjà une liste canonique de ces champs (`securite-hash.js:34`) ; je
   réinventais une règle à côté d'une règle existante.

⮕ **Sur les données et sur le DOM, un diagnostic lu au code est une HYPOTHÈSE.**
Le conteneur a Chromium ; reproduire coûte trois minutes, et ça a payé cinq fois.

**ET TROIS BREAK-TESTS SONT RESTÉS VERTS — trois tests trop lâches :**

- **piège `indexOf`** : rend `-1` quand le motif est absent, et `-1` est inférieur
  à tout index — une assertion d'ORDRE passe donc quand le code qu'elle protège
  DISPARAÎT. **Deux autres assertions du dépôt portaient le même piège** ;
- **valeurs non discriminantes** : 4 px et 40 px répondent pareil avec ou sans
  division par le zoom ;
- **assertion qui nomme l'invariant et en teste un plus faible** — démasquée par
  le rituel de fin, sur l'arbre final.

⮕ **Les trois ont en commun d'avoir été écrits en même temps que le code qu'ils
protègent.** Le break-test n'est pas une formalité de clôture : c'est la seule
chose qui distingue un test d'une décoration.

---

## ⚠ CE QUI N'EST PAS VALIDÉ

- **Safari et iPad** — WebKit n'existe pas dans le conteneur. Tout a été éprouvé
  dans Chromium, y compris les gestes tactiles, mais ce n'est pas son matériel.
- **Deux specs Playwright neuves n'ont JAMAIS été exécutées**
  (`planif-tout-voir-loupe.spec.js`, `planif-alignement.spec.js`) → CI.
- **Le parcours d'import COMPLET (vrai ZIP) n'a pas été rejoué.** Le correctif
  #448 est prouvé sur la ligne de fusion, en bac à sable et au navigateur — pas
  de bout en bout.

⚠ **Et un piège de harnais, noté pour la prochaine fois** : des ids de test
courts (`f1`, `v1`) apparaissent par hasard dans d'autres données. Le comptage de
citations par sous-chaîne les déclare « cités », aucun orphelin n'est détecté, et
les scénarios passent **sans rien exercer**. Utiliser des ids réalistes.

---

## Pourquoi ce fichier existe

Le 8 août 2026, **deux sessions sont parties du même commit sans se voir**.
Chacune a livré une version « 1.55.0 » différente et pris les mêmes
identifiants de backlog. La journée s'est terminée par une réconciliation
manuelle : sept conflits, une renumérotation complète, trois numéros de
version à fondre en un.

Ce n'était pas un défaut d'attention. La session du matin **a fait le rituel
de début, a vérifié la prémisse, et a trouvé zéro écart** — parce que la
prémisse qu'elle lisait, sur `main`, avait été périmée par une branche qu'elle
ne pouvait pas voir.

▣ **La cause est structurelle, et elle est circulaire** : la consigne de relais
(le §3 de `SESSION.md`) est un fichier **versionné**. Quand le travail vit sur
une branche non mergée, la consigne qui le dit vit sur cette branche **aussi**.
La session suivante, elle, lit celle de `main`. *Une session qui ne démarre pas
sur la bonne branche ne peut pas lire l'instruction qui lui dit quelle branche
prendre.* Aucun soin apporté au rituel ne compense ça.

---

## La règle adoptée (décision de Grégoire, 8 août 2026)

**On fusionne vers `main` à la fin de CHAQUE session.** C'est le remède : c'est
le report du merge qui ouvre la fenêtre de divergence, et il avait été reporté
trois fois dans la semaine avant de coûter une journée.

**Ce fichier est le filet**, pour les cas où un merge doit vraiment attendre —
travail à mi-chemin, validation terrain en suspens, décision de Grégoire non
prise. Dans ce cas, et dans ce cas seulement :

1. le remplir en nommant la branche et ce qu'elle porte ;
2. le **committer et le pousser sur `main`**, seul, sans le reste du travail.

Un `RELAIS.md` qui pointe vers une branche est le signal qu'une dette de fusion
existe. Il doit repasser à « aucun » dès que la fusion est faite.
