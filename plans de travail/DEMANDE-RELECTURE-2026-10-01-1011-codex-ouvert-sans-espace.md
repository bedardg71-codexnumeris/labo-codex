# Demande de relecture – #1011 : un codex ouvert sans assez d'espace finit par « Erreur »

> Écrite le 1er octobre 2026, vers 11 h 30 (Toronto), par Claude Code, pour Cowork. Exécute `plans de travail/CONSIGNE-DU-JOUR.md` (8 h 51, ajout de 9 h 50). Branche `fix-1011-codex-ouvert-sans-espace` : le commit de code est `40521da7`. **Ni release ni push du code.** Ce chemin écrit les données de l'usager : relecture croisée avant toute release (règle 2).
> Chaque constat dit s'il est **mesuré** (par exécution), **lu** au code, ou **inféré**. Je ne suis pas un pair développeur : ce qui suit est une mesure et une lecture, à relire comme telles.

## Pour Grégoire, en trois lignes

1. **La fiche est #1011.** L'hypothèse de Cowork tient, au banc, par la case et par le menu : après les copies refusées, c'est la réécriture de la liste des copies qui est refusée, et l'écran reçoit « Erreur ».
2. **Ce qui reste dans l'espace après l'échec** : toutes les données du codex sont écrites, aucune copie, aucun codex actif, et les copies se disent « stockées » alors qu'elles n'y sont pas. Corrigé sur la branche : l'ouverture va jusqu'à « Import incomplet… » et propose de recharger.
3. **Ce qui attend ta décision** : les mots du refus d'espace (§ 6), et une trouvaille plus grave que le lot (§ 7.1) : après une ouverture incomplète, « Mettre à jour le codex » écrirait un codex sans les copies manquantes.

## 1 · La reproduction, avant de corriger (étape 2)

**Mesuré** sur le code de `main` (`21f1b345`), par une sonde Playwright (WebKit), dans un contexte de navigateur neuf : un codex fabriqué par le vrai `Codex.generer` (jeu fictif, trois copies d'un pixel), ouvert par le vrai geste. **Le refus d'espace est injecté** : `db.storeBlob` rend une `QuotaExceededError` pour chaque copie ; ensuite l'écriture IndexedDB de la liste des copies la rend aussi.

| Chemin | Écriture refusée | À l'écran | Codex actif |
|---|---|---|---|
| La case (Réglages › Données) | `a2031_fichiersTravaux`, à sa réécriture | `notifications.erreur('Erreur', <message de l'exception>)` | non |
| Le menu Codex | la même | le même | non |

Le journal de la sonde met les faits dans l'ordre du rapport de Grégoire : trois « blob ignoré… (quota) », puis l'écriture refusée de la liste des copies, puis « Erreur ouverture codex ». Aucune écriture du snapshot ni de l'état du codex ne suit : l'exception part bien du marquage « manquant » (`chargerCodex`, boucle `clesFTImport`), pas d'une étape ultérieure.

**Limite** : le banc injecte le refus ; il confirme ce que fait le code devant ce refus. Le vrai manque d'espace de Chrome en navigation privée n'est pas reproduit.

## 2 · Ce qui reste dans l'espace après l'échec (étape 3)

**Mesuré** à la même sonde, avant le correctif, puis après un rechargement à la main :

| Question | Réponse |
|---|---|
| Les clés du codex | toutes écrites (le jeu fictif est là) |
| Les copies | aucune (elles ont été refusées) |
| Le statut des copies dans la liste | « stocke », en mémoire et dans le stockage : le marquage « manquant » n'a pas été écrit |
| Le snapshot de référence | absent |
| Le codex | **inactif**, avant et après le rechargement |
| La proposition de recharger | jamais faite |

Quelqu'un dans sa fenêtre normale, sur un appareil presque plein, se retrouverait avec les données du codex à la place des siennes, sans copies, sans codex actif, et un écran qui dit « Erreur ». **Lu** (`js/travaux-ui.js`, vers 3126) : une copie sans binaire dont le statut n'est pas « manquant » s'affiche « en attente » plutôt qu'« absente ».

## 3 · Le correctif (étape 4)

`js/codex.js`, `chargerCodex`, deux gardes et rien d'autre :

- **Le marquage « manquant »** est écrit clé par clé, sous garde. Une clé refusée reprend ses statuts d'avant, pour que la mémoire et le snapshot disent ce qui est réellement stocké ; un avertissement `[Codex] Marquage des copies manquantes non écrit pour <clé>` part à la console (il paraîtrait dans un rapport de bug). Seules les clés qui portent une copie manquante sont réécrites (avant : toutes).
- **Le snapshot de référence** (étape 5) est sous garde aussi : quand l'espace est plein pour de bon, il est refusé à son tour. L'ancien snapshot est alors retiré, pour qu'une fusion ne se réfère pas au codex précédent.

L'ouverture atteint alors l'état « codex actif », le bilan de #334 (« Import incomplet : N fichiers sur M… ») et la question « Recharger la page pour appliquer les données ? ». **Aucun mot d'écran neuf.** `index.html` : le jeton anti-cache de `js/codex.js` (exigé par le hook #547).

**Écarté du lot** : la retentative de l'étape 5 bis (`db.set` après une persistance non confirmée) n'a pas de garde non plus. Elle ne se déclenche pas dans le cas vécu (les clés témoins sont écrites avant les copies) ; je n'avais pas de banc pour la couvrir, je ne l'ai pas touchée.

## 4 · La preuve

`tests/integration/codex-1011-ouvert-sans-espace.spec.js` (WebKit), trois essais par le vrai geste :

| Essai | Ce qu'il tient |
|---|---|
| (1) la case | bilan « Import incomplet : 3 fichiers sur 3… », rechargement proposé, codex actif, aucun bandeau d'erreur ; la liste garde ses statuts, lue dans IndexedDB même et en mémoire ; le snapshot est écrit ; l'avertissement est à la console |
| (2) le menu Codex | la même fin |
| (3) toute écriture refusée après les copies | la même fin ; l'ancien snapshot est retiré ; après un rechargement, les données sont là et le codex est actif |

Chaque essai porte ses témoins : espace vide avant, trois copies refusées, liste des copies refusée (le journal de l'injection), et le codex du banc porte bien ses trois copies.

| État muté | Rouges |
|---|---|
| M0 – le code d'avant (`HEAD` de `main`) | 3 sur 3 |
| M1 – la garde du marquage relance l'erreur | 3 sur 3 |
| M2 – les statuts d'avant ne sont plus remis | (1) et (2) |
| M3 – la garde du snapshot relance l'erreur | (3) |
| M4 – l'ancien snapshot n'est plus retiré | (3) |

Cinq états mutés, cinq rouges ; restauration par copie, empreinte identique ; contrôle final vert. Vitest complet sur le correctif : 669 fichiers, 7 884 essais verts. Les deux specs voisines qui ouvrent un codex ou un ancien fichier (`lot-i-bis-la-case-ouvre-un-codex`, `lot-i-bis-anciens-fichiers-s-ouvrent`) : 8 essais verts sur `40521da7`, sans reprise. **Non fait** : la suite Playwright complète (elle se prend au verdict, avant le push).

## 5 · Le pré-vol (étape 5) : pas établi

Le banc ne peut pas le dire : il tourne dans WebKit, et ce que `navigator.storage.estimate()` répond dans une fenêtre privée de Chrome ne s'y mesure pas.

**Calculé** à partir du rapport de Grégoire du 30 sept. (poids estimé du codex : 1 331 836 269 octets) : le pré-vol demande 1,5 fois le poids décompressé plus 100 Mo, soit environ 2,1 Go. Il n'a pas refusé : soit Chrome a annoncé au moins 2,1 Go disponibles (verdict « ok »), soit il n'a annoncé aucun quota (verdict « inconnu », qui laisse passer).

**À relever chez Grégoire** pour trancher, dans une fenêtre privée de Chrome ouverte sur l'application, à la console : `navigator.storage.estimate()` (les valeurs `quota` et `usage`). Les seuils ne sont pas touchés dans ce lot.

## 6 · Les mots (étape 6) : proposés, pas posés

**6.1 – Le refus du pré-vol** dit aujourd'hui « Safari n'accorde que… » et « (Réglages → Général → Stockage iPad) », quel que soit l'appareil. Deux options :

- **A – un seul texte, neutre** : « Espace insuffisant pour ouvrir ce codex. Il a besoin d'environ {besoin}, mais le navigateur n'accorde que {disponible} à l'application. Libère environ {à libérer} sur l'appareil, puis réessaie. »
- **B – le texte actuel sur l'iPad et l'iPhone, le texte A ailleurs.** Le texte actuel a été écrit pour le cas vécu sur l'iPad ; son chemin dans Réglages y est exact.

Dans les deux cas, la phrase finale reste : « Si tu navigues en privé, rouvre l'app dans une fenêtre normale. »

**6.2 – Le bandeau « Erreur »** reste la fin de toute autre exception de l'ouverture, avec le message technique en détail. Proposition : le titre « Le codex n'a pas pu être ouvert », le détail inchangé. À prendre ou à laisser.

## 7 · Trouvailles en chemin, et leur issue

**7.1 – Après une ouverture incomplète, mettre le codex à jour écrirait un codex sans les copies manquantes. Issue 2, inscrite : #1012.** **Mesuré** à la sonde : l'ouverture incomplète laisse le codex actif, et un `Codex.generer` lancé depuis cet espace rend un ZIP qui porte 0 copie sur 3 (la génération saute en silence une copie sans binaire). **Mesuré** aussi : par le menu, dans Chrome, le codex garde la main sur le fichier d'origine (`handleFSAPI: true`) jusqu'au rechargement. **Lu, non exécuté** : « Mettre à jour le codex » réécrirait alors ce même fichier. Ce défaut existe depuis #334 pour toute ouverture incomplète ; ce lot fait qu'on y arrive aussi quand l'espace manque, au lieu de l'« Erreur ». Non vécu ; inscrit pour sa gravité (le codex est le filet). **Cowork : dis si cela doit être réglé avant la release de ce lot.**

**7.2 – Le chemin frère. Noté sous #1011, non corrigé.** **Lu** (`js/import-export.js`, vers 1244) : l'ouverture d'un ancien fichier de données en `.zip` réécrit elle aussi la liste des copies sans garde (`await db.set(cleFT, liste)`), après le même comptage des copies refusées. Même défaut, autre chemin ; non exécuté.

**7.3 – Des clés dérivées sont écrites par la page pendant l'ouverture. Issue 3.** **Mesuré** à la sonde : entre la première et la deuxième copie, la page écrit `seancesCompletes`, `indicesAssiduite`, `indicesCP`, `indicesPatternsRaI` depuis son propre état. Ce sont des clés recalculées au démarrage. **Inféré** : c'est peut-être l'origine de la clé orpheline `a2026_seancesCompletes` que la purge signale dans les rapports de Grégoire.

## 8 · Ce que j'ai supposé

1. Qu'une ouverture dont les données sont écrites doit rendre le codex actif, même si le marquage et le snapshot sont refusés : c'est ce que fait déjà #334 quand le marquage passe.
2. Que, faute de pouvoir écrire le marquage, il vaut mieux remettre les statuts d'avant que laisser la mémoire dire « manquant » quand le stockage dit autre chose.
3. Qu'un snapshot absent est un état prévu (`_ecrireSnapshotAvant` le retire déjà quand il n'y a rien à indexer).

## 9 · À la livraison

Après la relecture et les mots de Grégoire : release, verdict complet par `scripts/pousser.sh` (Cowork fermé, Mac branché), fusion vers `main`. La rangée 2.4 de la porte du lot I bis se rejoue ensuite par Grégoire ; #1011 reste ouverte jusque-là.
