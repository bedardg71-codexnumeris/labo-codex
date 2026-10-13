# Demande de relecture – lot 20 : des écritures qui ne se marchent plus dessus

> Claude Code, 12 octobre 2026, 7 h 44 (mesuré par `date`). Consigne : `CONSIGNE-DU-JOUR.md`, série des lots 20 à 23.
> Sur `main`, **non poussé, pas de release, pas de verdict Playwright**. Vitest complet vert (747 fichiers, 8 723 essais).

## 1 · Ce qui change pour l'usager

Rien à l'écran. Trois choses changent en coulisse :

- entrer dans la section des cartouches pendant qu'une cartouche s'enregistre ne fait plus perdre l'une des deux écritures ;
- un onglet qui change de trimestre ne ressert plus le filtre de production, la dernière copie ouverte ou le jeton de reprise de l'autre trimestre ;
- quand un import renomme une grille, une échelle ou une cartouche pour conflit, tout ce qui la désigne la suit, sur les quatre chemins d'import.

## 2 · Fiche par fiche

| Fiche | Commit | Remesure sur main | Geste |
|---|---|---|---|
| #522 | `7d0747e0` | `scripts/mesurer-522.py ""` : 10 sites en course. Un seul est atteint par un geste : `migrerCartouchesVersBibliotheque`, lancée par `initialiserModuleCartouches` à chaque entrée dans la section (`navigation.js:241`), à côté des gestes des cartouches, tous déjà dans la file | la migration passe par `db.modifier` (la garde #1040 « n'écrire que si ça change » tient : le mutateur rend `undefined`) ; après : 9 sites, chacun nommé avec sa raison au cliquet C |
| #596 | `3d0b9df8` | 4 clés porteuses d'un identifiant (`travaux-filtre-production`, `-dernier-fichier`, `-pipeline-production`, `-jeton-production`), 22 sites sur 5 fichiers ; `travaux-mode-courant` écrite, jamais lue | les quatre passent par `cle()` (dans `travaux-ui.js`, `cleSession`, repli nu sans `trimestres.js`, comme `pipeline_queue`) ; `travaux-mode-courant` retirée |
| #627 | `c3914c79` | quatre chemins, quatre listes : réouverture « en double » sans `cartouche.echelleId` ; import complet : la clé des cartouches suivait, pas leurs champs `grilleId`/`echelleId` ; import sélectif complet ; partage : `grilleId` seulement | `rebrancherReferences` (`import-export.js`) porte la liste ; les quatre l'appellent ; l'export `window.rebrancherEchellePratique` est remplacé par `window.rebrancherReferences` |

Vérifications : #522, 2 mutations, 2 rouges (l'ancien corps → A.a et C.a ; la garde #1040 retirée → A.b) ; #596, 2 mutations, 2 rouges ; #627, 4 mutations, 4 rouges (la règle, le partage, la réouverture, l'import complet). Empreintes restaurées à chaque fois. Bancs réancrés : `sentinelle-663` (passe par la règle commune) et `partage-import-P3` (charge aussi `import-export.js`).

### Les neuf sites restants de #522, et pourquoi ils sont sûrs

| Site | Raison |
|---|---|
| `codex.js` · `_migrerClesClasseurVersCodex`, `_purgerCodexHistLegacy` | démarrage seulement (`initialiserCodex`) ; écrivent une constante |
| `codex.js` · `_migrerSnapshotVersIndexHash` | démarrage seulement ; l'ancien format n'est plus jamais écrit : une conversion par poste, une fois |
| `snapshots.js` · `initialiserModuleSnapshots` | démarrage seulement ; n'écrit que si la clé est vide en IndexedDB |
| `main.js` · `auDbReady` ×2 | démarrage ; drapeaux constants posés après un `flush` |
| `migrations.js` · `executerMigrationsBeta96` | **aucun appelant** (mesuré) ; constante |
| `travaux-stockage.js` · `_migrerThumbnailsVersIDB` | démarrage (`initialiserStockageTravaux`) ; constante |
| `demo-activation.js` · `activerModeDemo` | atteint par la case « démo », mais le site est le retour arrière du `catch`, qui écrit `null` : la valeur ne dérive pas de la lecture |

⮕ La fiche #522 peut se fermer sur ces neuf sites (la décision avait été laissée à Cowork au lot 7).

## 3 · Stock (tarir n'est pas réparer)

- #596 : ce qu'un onglet déjà ouvert a rangé sous l'ancien nom meurt avec l'onglet. Rien n'est recopié. Conséquence vécue au plus : à la première ouverture après la mise à jour, le filtre de production et la dernière copie ouverte ne sont pas restaurés une fois.
- #627 : les références déjà écrites par un import antérieur ne sont pas réécrites. Une cartouche importée avant aujourd'hui, dont l'échelle avait été renommée, garde l'ancien `echelleId`.

## 4 · Trouvailles, avec leur issue

- **`executerMigrationsBeta96` (`migrations.js:786`) n'a aucun appelant** — issue 2, inscrire : candidate au lot 22 ou à une suite de #469.
- **`pratiqueSelectionnee` (`pratiques.js:622`, `:1234`) est une clé `sessionStorage` nue qui porte un identifiant de pratique** (les pratiques sont namespacées depuis #358) — issue 2, inscrire : même défaut que #596, hors de ses six clés.
- **#627, cas limite gardé tel quel** : dans l'import complet, une production déjà en place à l'identique garde sa cartouche (#654), mais suit toujours une grille ou une échelle renommées, comme avant le lot.

## 5 · Ce que j'ai supposé – une ligne chacune

- #596 : les « six clés » de la fiche sont les quatre porteuses d'identifiant, `travaux-mode-courant` et `travaux-pipeline-dpi` ; cette dernière, une préférence d'affichage sans identifiant, reste nue à dessein (comme `travaux-sidebar-replie` et `travaux_bulle_annoter_vu`).
- #596 : à la lecture de `travaux-ui.js` (au chargement du script), `cle()` connaît déjà le trimestre actif ; sinon le filtre n'est simplement pas restauré.
- #627 : la cartouche importée dont l'échelle a été renommée doit pointer la nouvelle échelle, même si elle devient alors différente d'une cartouche identique en place (ce que l'import sélectif faisait déjà).
- #627 : `import-export.js` est sous surveillance sécurité ; la règle demande `npm test` complet avant commit. La consigne remet Playwright au signal du soir : seul Vitest complet a tourné.

## 6 · Documents à mettre à jour

Aucun, mesuré : `grep` des noms changés (`rebrancherEchellePratique`, les cinq clés de session, `migrerCartouchesVersBibliotheque`) dans `docs/` et `ETAT-PROJET.md` ne rend rien.

## 7 · Item de Nouvelles proposé

Aucun mot neuf à l'écran. Si un item est voulu : « Quand un import renomme une grille, une échelle ou une cartouche déjà présente, tout ce qui la désigne la suit, quel que soit le chemin d'import. »
