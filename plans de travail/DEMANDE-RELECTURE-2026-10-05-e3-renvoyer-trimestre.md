# Demande de relecture – E3, renvoyer un trimestre aux archives (#1024)

> Écrite par Claude Code le 5 octobre 2026 vers 5 h 15 (Toronto, mesurée par `date`), sur la branche `claude/e3-renvoyer-trimestre` (commit `2cf725f0`, local, non poussé), partie de `main` à `7af302e0`. Consigne de Cowork de 4 h 36, points 1 à 6. **Ni push du lot, ni release, ni verdict complet.** Rien n'a été écrit dans les données de Grégoire : tout est mesuré sur des jeux fictifs. C'est le seul geste du plan qui retire des données : relecture croisée obligatoire (règle 2), et la première fois sur l'hiver 2026 revient à Grégoire. Marques : *mesuré* (banc ou sonde, avec son témoin), *lu* (code), *inféré*.

## Pour Grégoire, en deux lignes

- **« Renvoyer aux archives »** retire de l'application un trimestre clos (ses élèves, ses évaluations, ses copies, les séances de ses groupes) quand son archive vérifiée le garde à l'identique ; « Faire revenir » le ramène tel quel.
- **Il refuse de retirer quoi que ce soit** si le trimestre a changé depuis son archive (il propose alors d'archiver de nouveau), si l'archive n'est pas vérifiée ou ne contient plus tout, et pour le trimestre actif ou en cours ; il ne touche jamais aux autres trimestres, aux cours, au profil ni aux réglages.

## 1 · Le geste, décision par décision

| Décision de Cowork | Ce qui est fait | Témoin |
|---|---|---|
| 1 · d'où | Menu ⋮ d'un trimestre **clos** de la bibliothèque, sous « Archiver le trimestre… ». Le trimestre actif n'a pas l'entrée ; l'action refuse aussi le trimestre actif (`trimestreActif` ou `actif: true`) et un trimestre en cours | Vitest (d) ; WebKit : pas d'entrée sur la carte active, refus par l'action |
| 2 · on ne renvoie que l'identique | Au geste : `meta.json` à l'empreinte retenue par « Vérifier », `donnees.json` à la sienne, **chaque copie promise présente** dans l'archive ; puis chaque clé `<trimestre>_*`, chaque séance de ses groupes (celles de l'archive et celles de `<trimestre>_groupesCours`), chaque fichier de copie que l'application a (travail et corbeille), **à son empreinte**. Une pièce absente de l'application n'est pas une différence (l'archive l'a). Différent → rien retiré, la fenêtre compte les différences et offre « Archiver de nouveau » | Vitest (c), (d) ; WebKit : cas « consulté » |
| 3 · mode dossier | Tranché : la ré-archive d'un trimestre **met de côté** dans `trimestres/<trim>-trimestre/hors-archive-<date>/` les copies de l'archive précédente qu'elle ne range plus (copie, relue à sa taille, puis retrait de l'original). Jamais effacées (règle du 20 sept.) ; « Vérifier » ne les dit plus « en trop ». Seulement pour l'archive d'un trimestre : celle d'un groupe garde le comportement d'avant (même défaut, non vécu, laissé) | Vitest (f), avec témoin sans la mise de côté → « en trop » |
| 4 · ce qui est retiré | L'entrée du registre (les autres intactes) ; les clés `<trimestre>_*` ; les séances `seancesCompletes_gc_<id>` ; les fichiers des copies et leurs vignettes `thumbnail_<id>` (corrige #1019 pour ce geste). **Laissé** : toute clé globale, et deux clés qui portent l'id du trimestre sans son préfixe, `snapshot_<trim>_<horodatage>` et `tableCorrespondance_<trim>` (*lu* : l'archive d'E1 ne les garde pas ; les retirer serait les perdre) | Vitest (a) : tout l'espace hors du trimestre comparé avant/après, y compris ces deux clés |
| 5 · idempotent | **Ordre : registre, copies et vignettes, séances, clés en dernier.** Le registre d'abord : un trimestre à moitié retiré n'est plus offert à l'activation, à « Rouvrir » ni à « Archiver » (une nouvelle archive d'un trimestre amputé remplacerait la bonne). Les clés en dernier : tant qu'il reste quelque chose, il reste une clé `<trim>_*`, et cela suffit à dire « inachevé » sans rien lire. La ligne de l'archive offre alors « Finir de renvoyer », qui refait la même comparaison sur ce qui reste. « Faire revenir » sait ramener le trimestre depuis ce qui reste : une clé restée et identique à l'archive est laissée (changement dans `reserve-emprunter.js`) | Vitest (e) ; WebKit : arrêt provoqué puis « Finir de renvoyer » ; à taille réelle : reprise mesurée (ci-dessous) |
| 6 · le filet | L'archive vérifiée et identique ; aucun codex exigé. La fenêtre le dit (« Garde cette archive : une fois le trimestre renvoyé, c'est son seul exemplaire. ») | Mots, § 4 |

**Une garde de plus que la consigne** : juste avant le premier retrait, chaque clé est **recomparée** (rien de né, rien de changé depuis la comparaison). Une différence découverte au milieu laisserait un reste qui ne concorde plus avec l'archive, que ni la reprise ni « Faire revenir » ne sauraient finir. Pour la même raison, chaque retrait est **relu** (la clé, le fichier sont-ils partis ?) et le geste s'arrête au premier refus.

**Ce que la comparaison ne relit pas** (*supposé*, à juger) : le **contenu** des copies de l'archive. Elle vérifie leur présence (la liste du ZIP ou du dossier), pas leurs octets : c'est ce que « Vérifier » a fait, et `meta.json` est recomparé à l'empreinte de cette vérification. Relire 1,1 Go d'archive à chaque renvoi doublerait la durée pour un risque que « Vérifier » couvre déjà (une archive altérée après sa vérification, sans que son `meta.json` change).

## 2 · Les bancs

**Vitest** (`tests/unit/sentinelle-e3-renvoyer-trimestre.test.js`, 26 essais) : l'aller-retour, l'ordre, le cas « consulté » de bout en bout, dix refus et différences (rien retiré, journal vide), l'arrêt et la reprise, « Faire revenir » depuis un reste, le mode dossier, le cache mémoire, et six témoins. **E2** (`sentinelle-e2-emprunter-trimestre`, 35 essais) : deux essais neufs pour les clés restées (identiques → laissées ; différente → « débris ») ; l'essai « débris » existant change sur un point, le refus ne se dit plus avant le sélecteur de fichier (il se juge contre l'archive).

**WebKit** (`tests/integration/e3-renvoyer-trimestre.spec.js`, 2 essais, 42 s, verts du premier coup ; E1 et E2 relancés avec, verts) : le vrai menu ⋮, le vrai sélecteur, les vraies fenêtres, la vraie `db`, à 820 px. Aller-retour égal à l'avant-renvoi, rien d'autre changé ; puis activer h2032, rechargement, revenir à a2032, rechargement : **dix clés du trimestre changées ou nées** (*mesuré* : `calendrierComplet`, `groupesCours`, trois indices, `interventions`, `productions`, `seancesCompletes`, `snapshots_GC_H1`, la séance de GC_H1) → « a changé », rien retiré ; « Archiver de nouveau » (la vraie fenêtre d'E1), vérifier, renvoyer → passe ; faire revenir → la version consultée. L'activation ajoute aussi `actif: false` à l'entrée du registre (*mesuré*, sans effet sur le geste).

**Mutations démontrées rouges sur le disque** (fichier restauré par copie, empreinte identique avant et après) :

| Mutation | Essais rouges |
|---|---|
| une clé globale retirée (la règle « porte l'id » de `supprimerTrimestre`) | 13 |
| une copie retirée alors que l'archive ne l'a pas | 2 |
| la comparaison neutralisée | 7 |
| la recomparaison d'avant le retrait neutralisée | 4 |
| le registre retiré en dernier | 5 |
| les vignettes oubliées | 2 |
| la garde du trimestre actif retirée | 1 |
| la présence des copies de l'archive non vérifiée | 1 |
| le cache mémoire non vidé (§ 3) | 1 |
| E2 : l'ancien refus « débris » remis | 2 |

Vitest complet : 680 fichiers, 8 165 essais verts, ni « Errors » ni « Unhandled ».

## 3 · La mémoire et la durée, et ce qu'elles ont trouvé

*Mesuré* (WebKit, profil persistant, navigateur neuf pour la passe mesurée, trimestre fictif de 130 étudiant·es, 1 500 évaluations, 394 copies dont 4 de 22 Mo, 1,16 Go d'archive, 394 vignettes) :

| | Durée | Pic de la page (WebContent) |
|---|---|---|
| Au démarrage | – | 199 Mo |
| Comparaison (394 copies relues et empreintées, une à la fois) | **1,3 s** | 203 Mo |
| Retrait | **0,8 s** | 203 Mo |

Réseau 47 Mo, GPU 124 Mo, inchangés. *Pas mesuré* : l'iPad ; le mode dossier en vrai (Chrome).

**Ce que la mesure a trouvé — #845, déjà inscrite.** Au premier passage à cette taille, le renvoi s'est **arrêté** (« Renvoi inachevé ») sur `h2026_fichiersTravaux`. Cause *mesurée* : `db.remove` retire d'IndexedDB et de localStorage, mais pas du cache mémoire, où vont les clés qui ne tiennent pas dans localStorage ; `getSync` voyait encore la clé, et la garde « est-elle partie ? » a arrêté le geste. Rien n'était perdu : le reste était identique, et **« Finir de renvoyer » l'a achevé à cette taille** (0,2 s, mesuré). Disposition : contourné dans le lot (`removeSync` après `remove`, qui attend toujours le commit d'IndexedDB et en rend l'échec) ; un essai Vitest le verrouille. Le défaut lui-même reste #845 (il touche aussi `supprimerTrimestre` et le retrait d'E2 en cas d'échec).

## 4 · Les mots, pour Grégoire (tous provisoires, dans `ReserveRenvoyer.MOTS`)

> **Menu** : « Renvoyer aux archives… » (infobulle : « Retirer ce trimestre de l'application : son archive vérifiée le garde »)
>
> **Fenêtre, identique** : « Renvoyer Hiver 2026 aux archives ? » — « Hiver 2026 quitte l'application : 130 étudiant·es, 394 copies, environ 1.08 Go.
> Son archive du 5 octobre 2026, vérifiée le 5 octobre 2026, le garde à l'identique : « Faire revenir » le ramènera tel quel. Garde cette archive : une fois le trimestre renvoyé, c'est son seul exemplaire.
> Rien d'autre n'est touché : les autres trimestres, les cours et les réglages restent tels quels. » — bouton « Renvoyer aux archives »
>
> **Fenêtre, différent** : « Hiver 2026 a changé depuis son archive » — « Hiver 2026 ne concorde plus avec son archive du 5 octobre 2026 : 10 différences. Rien n'a été retiré.
> 3 données changées depuis / 7 données nées depuis / (selon le cas) N copies absentes de l'archive / N copies différentes de l'archive
> Archive-le de nouveau pour que l'archive le garde tel qu'il est, vérifie la nouvelle archive, puis renvoie-le. » — bouton « Archiver de nouveau » (ouvre la fenêtre d'E1)
>
> **Bilan** : « Trimestre renvoyé aux archives » — « Hiver 2026 n'est plus dans l'application. Son archive le garde : « Faire revenir » le ramène depuis Réglages › Données › Archives.
> 8 données retirées, 394 copies retirées. »
>
> **Refus** (titre « Trimestre non renvoyé ») :
> - « Seul un trimestre clos peut être renvoyé aux archives. Clos-le, puis archive-le. »
> - « C'est le trimestre actif : active un autre trimestre d'abord. »
> - « Ce trimestre n'a pas d'archive dans la liste. Archive-le d'abord (« Archiver le trimestre… »), puis vérifie l'archive. »
> - « Son archive n'est pas vérifiée dans ce navigateur. Vérifie-la d'abord (Réglages › Données › Archives). »
> - « L'archive ne concorde plus avec sa vérification. Rien n'a été retiré. Vérifie-la de nouveau. »
> - « N copies promises par l'archive en sont absentes. Rien n'a été retiré. Vérifie l'archive de nouveau. »
> - « Cette archive ne porte pas les empreintes de ses données. Archive de nouveau ce trimestre. »
> - « Ce trimestre n'est plus dans l'application : il n'y a rien à renvoyer. »
>
> **Interrompu** : « Renvoi inachevé » — « Le renvoi de Hiver 2026 s'est arrêté en cours de route (l'espace du navigateur a refusé un retrait). Rien n'est perdu : ce qui reste est identique à l'archive.
> Il reste 8 données et 2 copies dans l'application.
> Pour finir : Réglages › Données › Archives, ligne de Hiver 2026, « Finir de renvoyer ». « Faire revenir » le ramène aussi en entier. »
>
> **Reprise** : bouton « Finir de renvoyer » sur la ligne de l'archive (infobulle : « Le renvoi de ce trimestre s'est arrêté en cours de route : retirer ce qui reste ») ; fenêtre « Finir de renvoyer Hiver 2026 ? » — « Le renvoi de Hiver 2026 aux archives s'est arrêté en cours de route. Il en reste 3 données et 0 copie dans l'application, identiques à son archive : elles sont retirées. L'archive garde tout. » — bouton « Finir de renvoyer »

À noter pour les mots : « 1.08 Go » garde le point décimal du reste des archives (« 80.0 Ko » d'E1) ; dans la fenêtre « différent » d'une **reprise**, la dernière ligne devient « Fais-le revenir pour le consulter, puis archive-le de nouveau avant de le renvoyer. » (E1 refuse un trimestre absent du registre).

## 5 · Ce que je demande à Cowork de juger

1. **La supposition du § 1** : la comparaison relit la présence des copies de l'archive, pas leur contenu.
2. **L'ordre** (registre d'abord, clés en dernier) et ses deux raisons.
3. **La garde de plus** (recomparaison juste avant le premier retrait) : utile, ou redondante ?
4. **#1027, inscrite** : « Vérifier » ne dit jamais « vérifiée » l'archive d'un trimestre dont une fiche n'avait pas de fichier à l'archivage (*mesuré au banc*). Un tel trimestre ne peut ni revenir ni être renvoyé. *Pas mesuré* : si l'hiver 2026 en porte une. Si oui, #1027 bloque la première fois de Grégoire ; une lecture seule dans son Chrome le dirait (ou le premier archivage, qui en donne le nombre dans `meta.json`).
5. **Trouvailles hors du lot, non inscrites** (règle du 24 août : ni vécues, ni bloquantes) : les exécutions navigateur planifiées sur GitHub des 3 et 4 oct. sont « annulées » (audit d'ouverture) ; la ré-archive en mode dossier d'un **groupe** garde le défaut « en trop » (§ 1, décision 3).

## 6 · Les fichiers

`js/reserve-renvoyer.js` (neuf) ; `js/reserve-emprunter.js` (clés restées) ; `js/reserve.js` et `js/reserve-trimestre.js` (mise de côté) ; `js/reserve-reglages.js` (« Finir de renvoyer ») ; `js/trimestre-v2-liste.js` (menu) ; `index.html` (script, jetons) ; trois bancs ; `BACKLOG.md` (#1024, #1027).
