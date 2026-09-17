# Cadrage — retracer les résultats d'un cours ultérieur (101 → 102)

> Écrit le 17 septembre 2026, 15h47 (Toronto), par Cowork, à la demande de Grégoire. **Rien n'est décidé ici** : le document mesure ce qui existe, sépare ce qui est établi de ce qui est supposé, et nomme les décisions qui lui reviennent.

---

## 1 · Ce qu'il a dit, et ce que ça change

`[établi — ses mots]`

- Il a les **résultats finaux de 102** d'anciens élèves de son 101. **Une note finale par élève, rien d'autre** : aucune trace des évaluations qui l'ont produite.
- **Il n'a pas donné ce cours.** Les notes viennent d'ailleurs.
- Le 102 a été noté par une **pratique sommative traditionnelle**.
- Il veut « analyser en quoi certaines conditions de réussite en 101 pourraient avoir contribué aux résultats de 102 ».

**Trois conséquences, à dire avant de bâtir quoi que ce soit :**

1. **La sortie est un seul nombre agrégé.** On ne pourra pas savoir sur QUOI en 102 le 101 a porté (la lecture ? l'écriture ? la méthode ?) : une note sommative traditionnelle mélange tout. Toute conclusion portera sur « la note de 102 », pas sur un apprentissage identifié.
2. **Cette note porte aussi la pratique de notation d'un collègue.** Comparer les indices de Labo Codex à cette note, c'est comparer deux instruments autant que deux apprentissages. Ce n'est pas rédhibitoire — c'est une limite à écrire noir sur blanc dans tout ce qui sortira de là.
3. **« Contribué » ne sera pas démontrable.** Ce dispositif peut établir une **association** (tel profil en 101 va avec telle note en 102), jamais une contribution causale : les élèves ne sont pas répartis au hasard, et ce qui explique le 101 explique peut-être directement le 102 (habitudes de travail, conditions de vie, programme).
   ⮕ **Ce n'est pas une raison de ne pas le faire** — une association robuste vaut la peine d'être connue et publiée comme telle. C'est une raison de choisir les mots du résultat maintenant, pas à la fin.

---

## 2 · Ce que l'app peut déjà donner, côté 101 `[mesuré dans le code]`

L'export « format recherche » (`exporterFormatRecherche`, `js/trimestres.js`) sort déjà, **par élève anonymisé**, pour un trimestre :

- **le contexte** : le cours, le calendrier, la grille de référence, les échelles, les artefacts avec leur semaine d'échéance ;
- **les présences**, séance par séance (statut, justifiée, durée) ;
- **les évaluations**, critère par critère, avec le niveau retenu, l'échelle qui le rend lisible, la note et le statut de remise ;
- **les indices finaux** A, C et P de 0 à 100 (`P` vaut `null`, jamais 0, quand la note n'est pas constructible — corrigé le 17 sept.) ;
- **les relevés semaine par semaine** (A, C, P de chaque élève à chaque séance, avec son pattern et son palier d'intervention) ;
- **la performance par critère** ;
- **le programme** et le fait d'avoir des **services adaptés**.

⮕ **Le côté 101 n'est pas à construire : il existe.** C'est une donnée longitudinale fine, rare dans ce genre d'étude.

⚠ **Ce que je ne peux PAS mesurer d'ici** : ce que contient réellement son A2025. Ses données vivent dans son navigateur, pas dans le dépôt. **Les relevés semaine par semaine n'existent que s'ils ont été capturés à l'époque** — s'ils manquent pour A2025, il reste les indices finaux et les évaluations, ce qui suffit pour commencer. **À vérifier chez lui, par une sonde en lecture seule.**

---

## 3 · Ce qui bloque vraiment — et une hypothèse de ma part qui tombe

`[rectification]` Je lui ai dit, au tour précédent, que le blocage était la **clé d'anonymisation tirée au hasard à chaque export**. C'est exact comme fait (`genererCleAnonymisation` ; la clé est rangée sous `tableCorrespondance_<trimestre>` et téléchargée), **mais ce n'est pas SON blocage** : je croyais alors ses 102 dans l'app. Ils sont dehors.

**Une clé stable sert à recoller deux trimestres déjà exportés séparément.** Son cas est plus simple : il a un trimestre 101 dans l'app, et un fichier de notes de 102 portant des DA. L'appariement se fait **une seule fois, sur le DA, AVANT l'anonymisation** — et les deux côtés sortent ensemble sous le même identifiant anonyme.

⮕ **Le vrai manque est donc ailleurs** : l'app n'a **aucun endroit où déposer un résultat obtenu APRÈS le trimestre**. C'est ça, le terrain à préparer.

---

## 4 · Ce que je recommande — et pourquoi, plutôt qu'autre chose

> ⚠ **RECTIFIÉ le 17 septembre 2026, 15h59 — l'import tombe.** J'avais recommandé un import de fichier. `[établi — ses mots]` **Le fichier de la DÉ est fait à la main et change à chaque trimestre ; il entrera les résultats lui-même, à la main.** ⮕ Tant mieux : la pièce fragile de ma proposition était justement le lecteur d'un format instable. **Ce n'est plus un import, c'est une saisie.**

**Un seul geste, petit : SAISIR un résultat ultérieur sur un trimestre passé.**

Dans la liste des élèves d'un trimestre archivé, un champ par élève où il tape le cours et la note ; l'export recherche le ressort comme **un champ de plus sur l'élève anonymisé**. Aucun écran d'analyse, aucun graphique, aucune statistique dans l'app.

`[mesuré]` **Un trimestre archivé est en lecture seule** (`body.mode-archive` : les champs de saisie y sont neutralisés, sauf une liste d'exceptions). **Mais une écriture temporaire existe déjà** (`checkbox-ecriture-temp`, `js/trimestres.js:2800`) : le geste n'a pas besoin d'un mécanisme neuf, il se branche sur celui-là. ⚠ *À remesurer avant de coder : que cette case est bien atteignable à l'écran aujourd'hui.*

**Pourquoi celui-là :**

- **L'analyse se fait mieux dehors.** Il obtient une table appariée, propre et anonyme ; il la travaille avec ce qu'il veut. Labo Codex n'a pas à devenir un logiciel de statistiques — et un coefficient affiché dans l'app serait lu comme un verdict par des enseignants qui n'ont pas le contexte.
- **Le DA ne sort jamais.** Une seule anonymisation, au moment de l'export, comme aujourd'hui. Le fichier de recherche ne porte aucun identifiant réel.
- **C'est réutilisable sans rien redemander** : le même geste accueille une note d'EUF, un taux de réinscription, un résultat de 103 — n'importe quel résultat obtenu plus tard.
- **Ce que ça n'empêche pas** : si l'analyse dehors donne quelque chose, on saura alors quoi montrer dans l'app, et on le bâtira sur une question qui aura fait ses preuves plutôt que sur une intuition.

**Écarté, et pourquoi** : *un écran de corrélations dans l'app* (trop tôt : on ne sait pas encore ce qu'on cherche, et ça affiche des nombres qui invitent à conclure) ; *une clé d'anonymisation stable* (utile un jour, inutile ici — à garder pour le cas où il voudrait recoller deux trimestres de l'app) ; *un lecteur du fichier Excel de la DÉ* (fait à la main, changeant à chaque trimestre : un lecteur y casserait plus souvent qu'il ne servirait).

---

## 5 · Les décisions qui lui reviennent — à prendre quand il sera disponible, une par tour

**D1 · D'où viennent ces notes de 102 ? — ✅ TRANCHÉE le 17 septembre 2026, 15h52, et favorablement.**
`[établi — ses mots]` **Les élèves ont donné explicitement leur accord à la Direction des études** pour qu'elle lui fournisse leurs résultats ultérieurs à son cours. **La DÉ les lui transmet à la fin de chaque trimestre, dans un fichier Excel.**

⮕ **Ce que ça règle** : la provenance est institutionnelle et le consentement est explicite, en amont, auprès de l'établissement — c'est le cas de figure le plus solide. Les notes peuvent entrer dans l'app au même titre que ses autres données d'élèves, et l'analyse a lieu d'être. La porte est franchie.

⮕ **Ce que ça n'épuise pas, à garder en tête sans bloquer** :
- Le consentement porte sur la **transmission à lui**. Ce qu'il **publie** relève d'un autre registre : agrégé, sans qu'aucun élève soit reconnaissable — ce que l'export anonymisé assure déjà de son côté.
- Le fichier **arrive à chaque fin de trimestre** : ce n'est pas un import exceptionnel, c'est un geste qui se répète. L'outil doit lire **le fichier qu'il reçoit**, pas un format idéal.
- ⚠ *Je ne suis pas juriste* : je nomme les portes, le collège tranche les siennes.

**D2 · Combien d'élèves, et combien de cohortes ?**
Un seul groupe (~30) rend toute corrélation très instable : deux ou trois élèves atypiques la font passer du simple au double. Plusieurs cohortes empilées changent la nature de ce qui est affirmable. ⮕ **Ça ne change pas l'outil à bâtir ; ça change ce qu'il pourra en dire.**

**D3 · Quelles conditions de 101 il veut mettre à l'épreuve — choisies AVANT de regarder.**
L'export porte des dizaines de mesures par élève. Les essayer toutes et garder celles qui « marchent » produit des résultats faux avec une régularité remarquable. ⮕ **Écrire d'avance les deux ou trois hypothèses** (son seuil d'autonomie à 70 %, qui porte déjà en commentaire la mention « validation 101→102 », en est une toute trouvée).

**D4 · La note de 102 telle quelle, ou en classes ?**
Un nombre brut, ou « réussi / échoué », ou « ≥ 70 % ». ⮕ Décision pédagogique : elle dépend de ce qu'il veut pouvoir dire.

---

## 6 · Ce que ça donnerait comme suite, s'il retient la recommandation

1. **Une sonde chez lui** (lecture seule, console) : ce que son A2025 contient vraiment — combien d'élèves, et si les relevés hebdomadaires sont là.
2. **D1 tranchée**, avant tout code.
3. **Un lot** : l'import « résultat ultérieur » + le champ dans l'export recherche.
4. **La table appariée**, et l'analyse dehors.

⚠ **Aucun de ces pas n'est engagé.** Le document s'arrête ici.


---

## 7 · Ajouté le 17 septembre 2026, 16h10 — la finesse par critère, et le 103

`[établi — ses mots]` **Une première analyse a déjà été faite l'an dernier par une autre instance de Claude**, descendue au **détail des critères de 101 et à l'échelle IDME de chacun**. Il veut refaire autant, avec **plus de données** et désormais **des résultats de 103**.

**Ce que ça ne change pas** : la forme de la saisie tient telle quelle — un élève peut porter plusieurs résultats ultérieurs (102, 103, et la suite), c'était déjà prévu.

**Ce que ça confirme** `[mesuré]` : la finesse visée existe déjà dans l'export. `performance_par_critere` rend, **par élève anonymisé et par critère de la grille de référence**, le compte de I, de D, de M et de E, plus un `taux_maitrise` ((M+E) / total). Et chaque évaluation exportée porte ses critères avec le niveau retenu et l'`echelle_id` qui le rend lisible. ⮕ **Rien à bâtir de ce côté.**

⚠ **Une limite de cet indicateur, à connaître avant de s'y fier** : `calculerPerformanceParCritere` compte en dur les quatre codes `I`, `D`, `M`, `E`, et ne parcourt que les critères de **la grille de référence** du trimestre. Un critère évalué sous une autre échelle, ou absent de cette grille, ne s'y retrouve pas. Le champ `criteres` de chaque évaluation, lui, est complet : c'est la source à préférer pour une analyse fine.

### Le vrai risque n'est plus technique, il est statistique

Avec ~15 critères × 4 niveaux, plus les indices, les présences et les relevés hebdomadaires, contre **deux** sorties (102 et 103) sur un effectif de cohorte : le nombre de rapprochements possibles dépasse de loin le nombre d'élèves. **Tout jeu de données de cette taille contient des corrélations fortes et fausses** ; les chercher toutes et garder les belles est le moyen le plus sûr de publier un résultat qui ne se reproduira pas.

⮕ **Ce n'est pas un argument pour renoncer** — c'est un argument pour que **D3 (les hypothèses écrites d'avance) soit tranchée AVANT de regarder les données**, et pour que ce qui sera trouvé hors de ces hypothèses soit nommé *exploratoire*, à vérifier sur la cohorte suivante. Le dispositif s'y prête bien : les cohortes arrivent une par une.

⚠ **À récupérer** : l'analyse de l'an dernier (méthode, variables retenues, ce qu'elle a trouvé). Elle sert de préinscription naturelle — ses hypothèses à elle, mises à l'épreuve sur des données neuves, valent bien plus qu'une exploration à neuf.


---

## 12 · Où vivra le module d'analyse — TRANCHÉ par Grégoire le 17 septembre 2026, 17h13

`[établi — ses mots]` **Le Labo.** « Je crois que le labo serait sans doute le meilleur endroit pour le faire. »

⮕ **Ce que ça règle, et c'est plus qu'un emplacement.** Le Labo est déjà l'endroit où l'on explore sans que rien n'engage : c'est là que vivent le Comparateur et les maquettes de pratiques, qu'on compare, qu'on adopte ou qu'on jette. Un résultat longitudinal y est **présenté comme une exploration, pas comme un verdict** — exactement le statut que la relecture de l'analyse de 2025 impose (`plans de travail/RELECTURE-2026-09-17-analyse-101-102-de-2025.md`). Le même écran posé dans le Suivi ou le tableau de bord aurait été lu comme une mesure de l'élève.

⮕ **Ce que ça n'engage pas encore** : la saisie du résultat ultérieur reste où elle est (la liste du Cadre, livrée en 1.143.0) — c'est un geste de tenue de dossier, pas d'analyse. Le Labo reçoit la LECTURE, pas la SAISIE.

⚠ **À remesurer avant de cadrer ce module** : ce que le Labo offre déjà comme charpente (le Comparateur et son écran en source fictive), et si une exploration peut s'y ouvrir sans pratique active.
