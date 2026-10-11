# Demande de relecture – lot 7 : importer d'une sauvegarde récente

> Claude Code, 11 octobre 2026, 8 h 42 (Toronto, mesuré par `date`). Consigne : `plans de travail/CONSIGNE-DU-JOUR.md` (Cowork, 8 h 29).
> Commits locaux sur `main`, **non poussés, pas de release** (elle attend le signal du soir) : `b6640cd7` (#1046), `7ccdfbd5` (#522 lot 7), puis un commit de documentation. `import-export.js` est sous les règles de sécurité : son verdict Playwright est celui du soir.

## 1 · Ce qui change pour l'usager

- **Importer une sélection depuis une sauvegarde récente propose enfin ses grilles, échelles, pratiques et cartouches** (#1046). Avant, seules les productions et les gabarits du catalogue apparaissaient à cocher. Elles entrent dans le trimestre ouvert, avec les mêmes garanties qu'au lot 3 (une grille en conflit est renommée et ce qui la désigne suit ; une cartouche déjà là n'entre pas en double).
- **Onze gestes ne s'effacent plus l'un l'autre quand ils se suivent de près** (#522) : ajouter les copies d'un import, marquer leurs fichiers manquants ou revenus, fusionner élèves, présences, notes et annotations importés ; archiver les copies d'un trimestre, emprunter, renvoyer et faire revenir un trimestre. Rien ne change dans ce qu'ils font.

**Aucun mot d'écran changé ni ajouté.** L'aperçu ne dit pas de quel trimestre vient une ressource : aucune n'est proposée deux fois (§ 3), donc aucun mot neuf n'était nécessaire.

## 2 · La mesure d'abord

**Le codex de banc 1.172.0** (`tests/fixtures/copies-de-secours-1.172.0`) : son trimestre réel `a2031` ne porte **aucune** grille, échelle, pratique ni cartouche ; elles n'existent que sous `demo_…` (3 grilles, 2 échelles, 2 pratiques), plus 3 gabarits dans `bibliothequeGrilles` (catalogue, clé globale). Le démo écarté, **ce fichier ne propose rien de plus qu'avant** : le banc le vérifie (sa vue est rendue telle quelle, objet compris).

**Un fichier fabriqué à deux trimestres** (`a2031`, `h2032`, plus le démo) : avant, l'aperçu proposait 0 grille, 0 échelle, 0 pratique, 0 cartouche ; après, 2 grilles, 1 échelle, 1 pratique, 1 ligne de cartouches, chacune une fois, rien du démo.

**Le démo** : dans l'application, le fichier passe déjà par `_sansLeDemoDuFichier` (T2) avant l'aperçu. Le repli ne retient de toute façon que les préfixes de trimestre (`a|e|h` + quatre chiffres) : `demo_…` n'est jamais proposé, même sans ce retrait.

**#522, remesure** (`python3 scripts/mesurer-522.py ""`) : **21** sites en course avant le lot, exactement les onze de la consigne plus les dix drapeaux de démarrage classés au lot 4 ; **10** après.

## 3 · Ce qui est fait, et les suppositions (une ligne chacune)

**`b6640cd7` – #1046.** Nouvelle `_ressourcesDesTrimestresSurLesClesNues` (`import-export.js`), appelée à l'entrée de l'analyse de l'aperçu et de `executerImportSelectif` : les ressources des trimestres du fichier sont repliées sur les clés nues (`grillesTemplates`, `echellesTemplates`, `pratiquesConfigurables`, `cartouches_<grille>`), puis suivent tel quel le chemin du lot 3.

Suppositions :
- **Même id dans deux trimestres, contenu différent : la plus récente l'emporte** (hiver < été < automne dans une même année), proposée une fois. Non tranché par la consigne ; aucun fichier réel mesuré ne le présente.
- **La clé nue passe d'abord**, telle quelle : un fichier ancien (clés nues seules) donne exactement la vue d'avant, doublons internes compris (essai E.1).
- **Une ressource sans id n'est jamais fusionnée** (elle est ajoutée comme les autres).
- **Les productions ne sont pas touchées** : elles lisaient déjà `*_productions`, démo compris quand T2 n'a pas lieu ; inchangé (voir § 6).

**`7ccdfbd5` – #522 lot 7.** Les onze sites passent par `db.modifier`, au patron des lots précédents. Chacun écrit **quand** et **quoi** il écrivait : la fusion des copies n'écrit que s'il y a du neuf, le statut « present » que s'il change, le statut « manquant » réécrit toute liste lue (comme avant) ; la marque « aux archives » s'écrit toujours **avant** tout retrait et se relit juste après ; le registre `trimestres` n'est réécrit que s'il porte le trimestre, et se relit après (E3). **Aucun site de la Réserve ne change ce qui est retiré ni quand** : les bancs qui jugent l'ordre au journal (E3 b, 1028) sont verts sans retouche de leurs attendus.

## 4 · Les bancs, et ce qu'ils peuvent faire rougir

| Banc | Essais | Break-test |
|---|---|---|
| `import-selectif-1046-ressources-des-trimestres` | 7 | code d'avant → 6 rouges (A.2, « le démo jamais proposé », était déjà vrai) ; démo admis → 3 ; dédoublonnage retiré → 2 ; plus ancien d'abord → 1 ; repli absent de l'import → 2 ; absent de l'aperçu → 2 ; copie rendue même sans ressource de trimestre → 2 |
| `sentinelle-522-lot7-import-et-reserve` | 12 | code d'avant (cinq fichiers à HEAD) → **12 rouges**, dont les deux courses (A.a, A.b) ; la marque « aux archives » remise hors file → A.b et son cliquet rouges |
| `import-selectif-lot3-rattache-juste` | 19 | inchangé, vert : le chemin du lot 3 tient |

**Bancs voisins retouchés, raison écrite dans chacun** :
- quatre faux `db` de la Réserve (1028, E2, E3, A3) reçoivent `modifier` **au contrat réel**, par leur propre `get` et `set` : journaux et refus simulés voient l'écriture comme avant ;
- cinq verrous qui citaient le texte d'avant (`import-1012-*` ×3, `sentinelle-import-export-383-384-385`, `sentinelle-lot-D-735…`) suivent la nouvelle forme, avec la même intention : la liste n'est écrite que par la fusion, chaque case passe par la fusion de sa famille, la restauration réécrit la liste lue.

Vitest complet, depuis `tests/` : **711 fichiers, 8 523 essais verts**, aucune erreur hors essais. Pas de suite Playwright (verdict du soir).

**Incident de méthode, réparé** : au premier break-test du lot 7, une liste de fichiers passée par une variable n'a pas été découpée par zsh (piège déjà noté) ; la sauvegarde n'a pas eu lieu, un fichier vide parasite a été créé dans `js/`, et la mutation est restée dans `reserve-copies.js`. Défaite à la main ; les cinq fichiers vérifiés par leurs empreintes d'avant (5 OK) ; le parasite retiré avant tout commit. Le break-test a été rejoué avec une liste écrite en clair.

## 5 · Stock

Aucun. #1046 lit un fichier et écrit comme le lot 3 ; #522 ne change que la sérialisation.

## 6 · Trouvailles

| Trouvaille | Issue |
|---|---|
| L'aperçu propose les productions de `demo_productions` quand le fichier n'est pas passé par T2 (bancs seulement : dans l'application, T2 l'a déjà retiré) | **Commenter et oublier** : sans conséquence observable dans l'application |
| `bibliothequeGrilles` (catalogue, clé globale) reste proposée comme avant | **Rien** : voulu (catalogue ≠ grilles de travail) |

## 7 · Proposition d'un item de Nouvelles (il rejoindra l'entrée du soir)

« Importer une sélection depuis une sauvegarde récente propose maintenant ses grilles, échelles, pratiques et cartouches, rangées dans le trimestre ouvert. »
