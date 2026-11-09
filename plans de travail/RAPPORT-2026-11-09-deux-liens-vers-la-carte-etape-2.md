# Rapport : deux liens vers la carte d'alignement, étape 2 (le code)

> Claude Code, 9 nov. 2026, session cloud. Branche `lot/deux-liens-vers-la-carte`, partie de `origin/main` `158ff5dc` (1.238.0). Consigne : `plans de travail/CONSIGNE-LOT-2026-11-08-deux-liens-vers-la-carte.md` (sur main). Mesure et proposition : `plans de travail/RAPPORT-2026-11-09-deux-liens-vers-la-carte.md`, recopié sur cette branche. Décisions de Grégoire du 9 nov., 10 h 19 à 10 h 21, en Cowork : les neuf recommandations du rapport sont adoptées. Ni release, ni changelog, ni fusion.
>
> **Banc Chromium seulement** : WebKit n'existe pas dans le cloud. Le verdict WebKit, les captures WebKit et la fusion se feront sur le Mac.

## En tête

### Ce qui est fait (en gestes)

- **Dans une leçon de la carte**, la zone 🎯 offre « Reprendre l’objectif d’une production ». Choisir une production ajoute une ligne liée, marquée 🔗, qui ne se tape pas sur place. La toucher ouvre « Modifier dans la production » (qui ouvre la fiche, curseur dans l'objectif) et « Délier » (la ligne redevient un objectif ordinaire, avec le texte du moment). Rien n'est coché d'office dans une évaluation.
- **Quand tu modifies l'objectif dans la production**, la ligne suit au retour dans la carte. Le plan de cours exporté imprime ce texte courant.
- **Dans la fiche de production**, sous l'objectif : « Repris dans la carte : leçon « … », semaine N », une ligne par leçon qui le reprend.
- **Ton stock d'objectifs** n'est relié nulle part. Dans l'Inspecteur d'une évaluation, « Relier » apparaît à côté d'un objectif seulement s'il est identique à celui de la production choisie.
- **Un bloc Compétence posé** dans une carte dont la fiche du cours porte une compétence naît lié : il montre le numéro et l'énoncé de la fiche. Son Inspecteur montre les éléments du devis en lecture seule, avec « Modifier dans la fiche du cours » (qui ouvre Cadre › Trimestre sur la fiche) et « Délier ». Un deuxième bloc reste libre.
- **Un bloc Compétence existant** propose « Relier à la fiche du cours » et montre les deux textes s'ils diffèrent. Ton titre n'est jamais effacé : relier le met de côté, délier te le rend.
- **Si la fiche ne répond plus** (compétence effacée, cours passé en service, carte détachée), le bloc lié garde son dernier énoncé et reste verrouillé ; « Délier » est toujours offert pour en sortir.
- **Le relevé du stock** est prêt pour le Mac : `scripts/releve-stock-deux-liens.js`, à coller dans la console de Chrome (§ 6).
- **Le point 5** (la production reprise à la rentrée) est vérifié en exécutant le chemin, pas seulement en le lisant (§ 5).

### Ce qui attend Grégoire (une question par ligne, ma recommandation après la flèche)

1. **Délier un bloc Compétence que tu avais relié depuis ton stock.** Le rapport de mesure disait : « Délier recopie l'énoncé courant dans le titre ». Ta règle disait : le titre que tu as écrit n'est jamais effacé. J'ai appliqué les deux ainsi : si tu avais un titre à toi, il revient ; sinon (bloc né lié), l'énoncé reste. ⮕ Garder ainsi.
2. **Recoudre les liens à la rentrée** (point 5). C'est possible : la production reprise garde l'identifiant de l'ancienne. Mais aujourd'hui, ni l'évaluation ni l'objectif ne se recousent. ⮕ Ne pas le faire dans ce lot. Le faire pour les deux liens ensemble, en lot à part, seulement si tu le vis à la rentrée d'hiver (§ 5).
3. **Les mots que j'ai dû poser sans validation** (liste au § 8). Le plus visible : l'infobulle de la ligne liée, « Objectif de la production « … » ». ⮕ Les relire d'un coup d'œil sur les captures.
4. **La phrase du guide de la carte** (« Double-clique dessus pour écrire l'énoncé de compétence »). Proposition au § 7, non posée. ⮕ La valider avec la fusion du cinquième parcours.
5. **Le modèle de relecture par IA.** Le rapport de mesure proposait qu'un bloc lié « renvoie à Le cours » au lieu de répéter l'énoncé. Je ne l'ai pas fait : c'est un texte neuf, et avec le titre rafraîchi les deux sections disent désormais le même énoncé, sans se contredire. ⮕ Laisser ainsi.
6. **La carte d'un trimestre passé suit la fiche d'aujourd'hui.** La fiche du cours est la même d'un trimestre à l'autre : ouvrir la carte de l'automne passé y met l'énoncé actuel de la compétence liée (relecture, constat 6). Le titre mis de côté, lui, ne bouge pas. ⮕ Garder : la fiche fait foi, et l'énoncé d'un devis change rarement.

### Ce que je n'ai pas pu vérifier

- **WebKit, Safari, l'iPad** : rien. Les specs et les captures sont sous Chromium. Le sélecteur « Reprendre… » est un `<select>` natif, qui ouvre la roue de l'iPad : à toucher sur l'iPad.
- **Ton stock réel** : combien de « Relier » tu verras. Le relevé se lance sur le Mac à la fusion (§ 6).
- **La branche du cinquième parcours** (`lot/parcours-5-monter-ton-cours`) : je ne l'ai pas lue. Ce qu'elle devra changer est au § 9.

---

## 1. Ce qui est codé, où

| Geste | Où |
|---|---|
| Les six libellés validés, une seule table | `js/planification-carte.js:514` (`LIBELLES_DEUX_LIENS`) |
| Reprendre, délier, relier (objectif) | `reprendreObjectifProduction` `:601`, `delierObjectif` `:636`, `relierObjectifAProduction` `:653` |
| Les propositions « Relier » d'une évaluation | `objectifsARelierPourEvaluation` `:672` |
| Le lien qui survit à l'écriture des objectifs | `objectifReecrit` `:449`, appelée par `appliquerObjectifs` |
| La fiche du cours de la carte active | `ficheCompetenceCarte` `:698` |
| Relier, délier, naître lié (compétence) | `poserLienCompetence` `:757`, `retirerLienCompetence` `:769`, `lierCompetenceNeuve` `:807` |
| Le rafraîchissement (chargement, annulation) | `rafraichirLiensCarte` `:980` |
| La mention de la fiche de production | `lignesReprisesObjectif` `:1030` ; affichage `js/productions.js:711` |
| La ligne liée et la commande de reprise | `ligneObjectifLieHTML` `:6781`, `selecteurReprendreObjectifHTML` `:6818` |
| Le bloc Compétence lié | `titreFeuilleHTML` `:7032` |
| L'Inspecteur du bloc Compétence | `sectionCompetenceInspecteurHTML` `:894` |
| La permutation Compétence → Idée maîtresse délie | `definirTypeNoeud` `:2242` |
| La copie d'un bloc lié est libre (le clone reste lié) ; décloner aussi | `retirerLienDeLaCopie` `:783`, `detacherDeLaFamille` `:4991` |
| La reprise d'une carte d'un trimestre à l'autre | `js/planification-donnees.js:535` |
| Le relevé du stock | `scripts/releve-stock-deux-liens.js` |

Les quatre fichiers modifiés ont reçu leur jeton anti-cache dans `index.html` (crochet #547).

## 2. Le modèle, tel que codé

**L'objectif.** La ligne liée est un objectif ordinaire qui porte `productionId` : `{id, texte, productionId}`. Rien n'est ajouté à la production. Ce que lisent les étudiant·es (feuille de consignes, rétroaction, synthèse) lit toujours `production.objectif` : inchangé.

- **Le lien ne glisse pas.** `appliquerObjectifs` reconstruisait la liste en `{id, texte}` et aurait jeté le lien à la première frappe sur une autre ligne (constat du rapport de mesure, § 1, point 5). Le lien survit désormais à deux conditions : la ligne le porte (la carte relit une ligne liée avec son lien), ou elle a gardé l'id ET le texte de l'objectif lié. Un texte modifié sur place fait tomber le lien ; un id réattribué au rang n'en hérite jamais.
- **Le lien qui dort.** Production introuvable (carte reçue d'un·e collègue, production supprimée) ou objectif vidé : la ligne s'affiche comme un objectif ordinaire, modifiable, avec son dernier texte connu. L'écrire fait tomber le lien ; rien n'est perdu, puisque ce texte était celui de la production.
- **Pas de doublon.** Une leçon ne reprend qu'une fois la même production : « Reprendre » l'exclut de la liste, et « Relier » n'est pas proposé dans une leçon qui la reprend déjà.
- **Les productions offertes** sont celles de la liste de Conception, la même que le sélecteur « Production » de l'Inspecteur, dont l'objectif est rempli, moins celles que la leçon reprend déjà. ⚠ Supposition : le rapport disait « les productions du cours » ; le sélecteur de l'Inspecteur ne filtre pas par cours, j'ai suivi le sélecteur pour que les deux écrans offrent la même liste.

**La compétence.** `metadata.lieFicheCours: true` sur le bloc. La fiche se lit contre le cours rattaché à la carte (`resoudreCoursDeCarte`) : une carte reçue d'un·e collègue a pris ton cours actif à l'import, c'est donc ta fiche qui répond.

- **Le lien qui dort** (un service, une fiche sans compétence, une carte non rattachée) : le bloc garde son dernier énoncé et **reste verrouillé** ; son Inspecteur offre « Délier », et « Modifier dans la fiche du cours » quand une fiche existe. ⚠ C'est un écart au rapport de mesure, qui disait « retombe sur son propre titre » : la première version de ce lot rendait le bloc modifiable, et une seule frappe y effaçait le titre mis de côté (relecture, constat 1). Verrouillé, rien ne se perd : « Délier » rend le titre.
- **Le titre mis de côté** l'est dès qu'il n'est pas exactement l'énoncé de la fiche, casse comprise : « rien à rendre » ne vaut que tant que la fiche ne change pas (relecture, constat 4). L'Inspecteur, lui, ne montre deux textes que s'ils diffèrent autrement que par la casse et les espaces.

**Titre rafraîchi, pas porte de lecture** (le choix technique que tu m'as laissé). Le titre d'un bloc et le texte d'un objectif sont lus par plus de soixante sites (canevas, Inspecteur, recherche, plan exporté, modèle de relecture par IA, phrases des liens). Une porte de lecture aurait demandé de les reprendre tous, et chaque oubli aurait montré l'ancien texte. La carte recopie donc le texte de la production et l'énoncé de la fiche dans la donnée, à son ouverture et après une annulation. Elle ne pose jamais de lien en le faisant, et n'écrit que s'il y a un changement. Le prix : le titre d'un bloc lié appartient à la fiche ; d'où `metadata.titreAvantLien`, qui garde ton titre et te le rend au « Délier ».

**Une seule compétence liée par carte.** Un clone est le même bloc (il suit le lien) ; une copie est un autre bloc (elle garde le texte, pas le lien). « Décloner » fait d'un clone une copie : il garde le texte, pas le lien (relecture, constat 2).

## 3. Les essais, et ce qui les a fait rougir

**Avant le code**, les essais neufs échouaient : 38 rouges sur 62 (listing gardé hors dépôt).

**Après** :
- Vitest, suite entière depuis `tests/` : voir § 10 (chiffre final).
- Essais neufs : `tests/unit/deux-liens-vers-la-carte.test.js` (43), `sentinelle-libelles-deux-liens.test.js` (4), `releve-stock-deux-liens.test.js` (5), `deux-liens-reprise-idoriginal.test.js` (2), et trois cas ajoutés à `sentinelle-reprise-inter-trimestre.test.js`.
- Chromium : `tests/integration/deux-liens-vers-la-carte.spec.js`, 6 essais verts (lien posé et suivi, plan exporté, mention, délier, stock et « Relier », compétence reliée et déliée, naître lié depuis la palette, copie, « Modifier dans la fiche du cours ») ; ses deux essais de captures ne tournent qu'avec `CAPTURES_DEUX_LIENS`.

**Break-tests** (le test doit pouvoir échouer). Chaque mutant appliqué seul, puis le fichier restauré ; témoin vert avant et après :

| Mutant | Résultat |
|---|---|
| la ligne reprise perd son `productionId` | rouge |
| le rafraîchissement ne recopie plus le texte | rouge |
| `appliquerObjectifs` jette le lien (comme avant le lot) | rouge |
| un texte modifié sur place garde son lien | rouge |
| « Délier » laisse le lien | rouge |
| relier accepte deux textes différents | rouge |
| « Relier » proposé pour tout objectif non lié | rouge |
| le rafraîchissement réécrit le titre de tout bloc Compétence (stock relié d'office) | rouge |
| le titre n'est plus mis de côté au relier | rouge |
| « Délier » ne rend plus le titre | rouge |
| la garde « une seule compétence liée » saute | rouge |
| la fiche d'un service répond | rouge |
| la permutation garde le lien sur une idée maîtresse | rouge |
| la ligne liée redevient modifiable sur place | rouge |
| le bloc Compétence lié garde un titre modifiable | rouge |
| la mention perd la semaine | rouge |
| « Délier » devient « Détacher » (sentinelle des libellés) | rouge |
| la reprise de trimestre emporte un lien mort | rouge |
| (Chromium) la compétence posée depuis la palette ne naît plus liée | rouge |
| (Chromium) la copie d'un bloc lié garde le lien | rouge |
| la section Compétence s'affiche dans l'Inspecteur d'un autre bloc | rouge |
| *après la relecture* : un lien qui dort redevient modifiable | rouge |
| « Délier » n'est offert que si la fiche répond | rouge |
| « Décloner » garde le lien | rouge |
| « Relier » accepte une deuxième ligne liée à la même production | rouge |
| un titre différent par la casse n'est plus mis de côté | rouge |
| le titre n'est plus mis de côté du tout (ligne réécrite) | rouge |
| relevé : une évaluation sans production compte une proposition | rouge |
| relevé : l'espace de démo est relevé comme un trimestre | rouge |

**Ce que les bancs existants ont attrapé en chemin** (corrigé dans le lot, ce n'étaient pas des trouvailles) :
- `planif-date-inspecteur-695` : ma section Compétence s'ajoutait par `extra.innerHTML +=` pour tous les blocs, ce qui tuait l'écouteur du champ « Semaine » d'une leçon. Même piège que la légende du lot 4. Corrigé par `insertAdjacentHTML`, et seulement pour un bloc Compétence.
- Les cliquets de complexité, d'échappement, des classes sans règle et des pauses fixes : rouges au premier passage, ramenés à leur niveau d'avant sans relever aucun plafond.
- Les captures ont montré « Modifier dans la fiche du cours » dans l'Inspecteur d'une **évaluation**, et un texte de fiche presque illisible en mode clair. Corrigés ; un essai garde le premier.

## 4. Les specs Chromium de la carte

`planif-*.spec.js`, `chaine-carte-1172` et la spec neuve : 86 verts au premier passage, puis les 2 de `planif-date-inspecteur-695` après correction. Trois restent rouges, **identiques sur `main`** (vérifié sur une copie de `158ff5dc`) : `planif-corbeille-fixe-1070` et deux de `planif-menu-vue` (raccourcis ⌘ / Ctrl). Propres à Chromium, sans rapport avec ce lot.

## 5. Le point 5 : la production reprise à la rentrée

**Vérifié en exécutant** (`tests/unit/deux-liens-reprise-idoriginal.test.js`, sur les vrais modules) :
1. La bibliothèque de productions garde l'**id** de la production du trimestre (`ajouterALaBibliotheque`, `js/productions-bibliotheque.js:88-112`).
2. La reprise depuis la bibliothèque crée un id **neuf** et range l'ancien dans `idOriginal` (`ajouterProductionIndividuelle`, `js/productions-bibliotheque-ui.js:382-387`). L'objectif traverse.

Donc oui : il y a de quoi recoudre. Mais **la reprise d'une carte ne recoud pas**, ni l'objectif ni l'évaluation : elle efface le lien vers une production absente du trimestre d'arrivée (`js/planification-donnees.js:525-536`).

**Ce qui se passe à la rentrée** : la ligne garde son dernier texte connu et redevient un objectif ordinaire. Ce qui la sert et la vérifie reste en place (ces liens visent l'id de l'objectif, qui ne bouge pas). Pour la relier de nouveau, tu choisis la production dans l'évaluation : si les textes sont identiques, « Relier » apparaît.

**Si on voulait recoudre**, trois limites, lues dans le code et non éprouvées :
- l'ordre compte : une carte reprise **avant** les productions ne trouve rien à recoudre ;
- l'import sélectif d'un codex garde l'id d'origine, mais en cas de conflit il en crée un neuf **sans** `idOriginal` (`js/import-export.js:3618-3626`) : ce lien-là est perdu pour de bon ;
- d'une génération à l'autre, il faudrait comparer l'identité (`id` et `idOriginal`) des deux côtés, comme le fait déjà la bibliothèque (`js/productions-bibliotheque-ui.js:188-193`).

## 6. Le relevé du stock, prêt pour le Mac

`scripts/releve-stock-deux-liens.js` : coller tout le fichier dans la console de Chrome, l'application ouverte. **Lecture seule** : il n'écrit rien (un essai le vérifie), ne sort que des comptes et des identifiants de cartes et de blocs, aucun texte, aucun nom. Le résultat est copié dans le presse-papier.

Ce qu'il compte, par trimestre :
- `propositionsRelierObjectif` : les boutons « Relier » que tu verras, toutes évaluations confondues ; `objectifsARelier` : les objectifs distincts ;
- `blocsRelierCompetence` : les blocs qui proposeront « Relier à la fiche du cours » ; `dontDeuxTextesDifferents` : ceux qui montreront deux textes ;
- `blocsFicheSansCompetence`, `blocsSansFiche`, et `dejaLies` (zéro attendu avant la fusion).

Il ne relève pas l'espace de démonstration. Il ne voit pas les objectifs d'une carte jamais ouverte depuis le 6 août (encore dans l'ancienne clé des séances, migrés à la première ouverture) : s'il y en a, ils pourront ajouter des « Relier » après coup (relecture, constat 7c).

**Vérifié comment** : `tests/unit/releve-stock-deux-liens.test.js` confronte le relevé aux fonctions de la carte elles-mêmes (`objectifsARelierPourEvaluation`, `peutRelierCompetence`, `sectionCompetenceInspecteurHTML`), carte par carte, sur un jeu fictif qui passe par chaque branche (leçon avant, leçon après déjà cochée, évaluation hors leçon, production introuvable, objectif vide, clone, carte qui a déjà une compétence liée, fiche vide, service, carte sans cours, clé nue). Non lancé dans un navigateur : `db.keysSync` et `db.get` sont pris tels que le reste du code les emploie.

## 7. La phrase du guide de la carte (proposée, non posée)

`js/planification-carte.js:2568`, page « Commence par le pourquoi », deuxième étape : « Double-clique dessus pour écrire l'énoncé de compétence. »

Proposition : « Si la fiche de ton cours (Cadre › Trimestre) porte la compétence, le bloc la reprend ; sinon, double-clique dessus pour écrire l'énoncé, ou écris-le dans la fiche. »

## 8. Les mots posés sans validation (à relire)

Posés pour que l'écran fonctionne, marqués « PROPOSÉ » dans le code quand ils sont neufs :
- l'infobulle de la ligne liée : « Objectif de la production « … » » ;
- la mention d'une leçon **sans semaine** : la phrase validée s'arrête après le titre, « Repris dans la carte : leçon « … » » ;
- dans l'Inspecteur d'un bloc Compétence, trois étiquettes reprises **telles quelles** de la fiche du cours : « N° de la compétence », « Éléments de compétence », « Compétence » (au-dessus du texte de la fiche, quand il diffère du titre) ;
- le séparateur « · » entre le numéro et l'énoncé, dans ce texte de comparaison.

Les six libellés validés sont posés mot pour mot, avec l'apostrophe typographique (’) des textes de la carte ; la sentinelle les exige.

## 9. À reporter (le cinquième parcours)

Pour la seconde des deux branches à fusionner (`lot/parcours-5-monter-ton-cours` ou celle-ci), mot pour mot, validées par Grégoire :

- **Étape 1**, « …touche « Compétence » dans la palette « Nœuds », puis écris son énoncé, tel que le devis ministériel décrit la compétence et ses éléments » devient : « …touche « Compétence » dans la palette « Nœuds » : le bloc reprend la compétence de la fiche de ton cours (Cadre › Trimestre). Si ta fiche ne la porte pas encore, écris-y son énoncé et ses éléments, tels que le devis ministériel les décrit. »
  - La condition d'avance (« un bloc Compétence a un énoncé ») compte alors l'énoncé repris de la fiche. Avec ce lot, un bloc lié porte l'énoncé dans son **titre** (rafraîchi) : une condition qui lit `titre` tient. Une condition qui attendrait une frappe dans le titre ne tiendrait pas : le titre d'un bloc lié ne se tape pas.
- **Étape 4**, « Ta production porte déjà un objectif d'apprentissage : si c'est celui que vise cette leçon, reprends-le ici. » devient : « Ta production porte déjà un objectif d'apprentissage : si c'est celui que vise cette leçon, touche « Reprendre l'objectif d'une production » et choisis-la. La ligne suivra toujours le texte de ta production. »
  - Pour un contour ou une étape qui vise la commande : c'est le `select.planif-obj-reprendre` de la zone des objectifs ; il n'existe que si une production a un objectif rempli. Le libellé à l'écran porte l'apostrophe typographique : « Reprendre l’objectif d’une production ». Un sélecteur par texte doit en tenir compte.
  - La condition d'avance (« la leçon a un objectif écrit ») tient : une ligne liée a un texte.

## 10. Vérifications finales, et la relecture par un agent neuf

- **Vitest, suite entière** (depuis `tests/`, après les corrections de la relecture) : 898 fichiers, 10 897 essais, tous verts.
- **Chromium** : la spec du lot et les specs voisines de la carte (`planif-date-inspecteur-695`, `planif-badges-objectifs-964`, `planif-pastille-evaluation-965`, `planif-objectifs-espacement-157`) vertes après les corrections ; la passe complète des specs de la carte est au § 4.
- **Relecture par un agent neuf**, sur `eb98c159` (sondes et mutations sur une copie, rien écrit dans le dépôt). **Verdict, en une ligne : deux défauts à corriger avant la fusion (un titre mis de côté perdu par une frappe sur un lien qui dort ; « Décloner » qui laissait deux compétences liées), le reste mineur ; sécurité conforme, aucun glissement de lien trouvé dans `appliquerObjectifs`.**

Ce que chaque constat est devenu :

| Constat | Suite |
|---|---|
| 1. Une frappe sur un lien qui dort efface le titre mis de côté | **Corrigé** : le bloc lié reste verrouillé, « Délier » toujours offert ; le chemin d'abandon est retiré. Essais et mutants. |
| 2. « Décloner » laisse deux compétences liées | **Corrigé** : le clone détaché perd le lien, garde le texte. Essai et mutant. |
| 3. « Relier » crée un doublon que « Reprendre » refuse | **Corrigé** : refusé et non proposé. Essai et mutant ; le relevé suit la même règle. |
| 4. Un titre identique à la casse près n'est pas mis de côté | **Corrigé** : mis de côté dès qu'il n'est pas exactement l'énoncé. Essai et mutant. |
| 5. L'import par la bibliothèque garde les liens d'objectif morts | **Commenté, gardé** : même règle que le pont de l'évaluation sur ce chemin (§ 11). |
| 6. Le rafraîchissement réécrit aussi les cartes des trimestres passés | **À Grégoire** : question 6 de l'en-tête. |
| 7. Le relevé : (a) évaluation sans production, (b) espace de démo, (c) objectifs pas encore migrés | **(a) et (b) corrigés**, essais et mutants ; **(c) dit** au § 6. |
| 8. Quitter une ligne d'accueil vide pour le sélecteur « Reprendre… » le détruisait | **Corrigé** (lu, non éprouvé au banc : un menu natif ne s'ouvre pas sous Playwright). À toucher sur l'iPad. |
| Tests : l'essai du stock pouvait sauter en silence | **Corrigé** : il échoue au lieu de sauter. |
| Tests : l'essai unitaire du plan exporté appelle lui-même le rafraîchissement | **Renommé** pour dire ce qu'il éprouve ; l'épreuve de bout en bout reste le banc Chromium. |
| Tests : rafraîchissement après ⌘Z et relecture des lignes liées sans essai | **Gardé ainsi** : code défensif, presque inobservable (la pile d'annulation se vide à chaque chargement, et la production comme la fiche ne changent qu'ailleurs). |

## 11. Trouvailles, et ce qu'elles deviennent

- **Trois specs de la carte rouges sous Chromium, aussi sur `main`** (`planif-corbeille-fixe-1070`, deux de `planif-menu-vue`). Propres au navigateur du cloud ; le verdict WebKit du Mac fait foi. ⮕ Commenter ici et oublier.
- **Le badge du niveau cognitif chevauche le titre d'un bloc d'une ligne** (« Analyser » sur « Analyser un texte littéraire », vu sur les captures en mode clair). Antérieur au lot, aucun symptôme vécu connu. ⮕ Commenter ici et oublier, sauf si tu le vis.
- **Une carte reçue d'un·e collègue garde des liens d'objectif vers des productions qui n'existent pas chez toi** (`importerDepuisBibliotheque` ne fait pas le contrôle de la reprise, comme pour l'évaluation, déjà relevé au rapport de mesure). Effet : la ligne s'affiche comme un objectif ordinaire ; l'écrire fait tomber le lien. ⮕ Commenter ici et oublier.

## 12. À inscrire au BACKLOG

Rien de neuf. Les deux entrées du rapport de mesure (§ 6 là-bas) sont livrées par ce lot : la session du Mac les inscrit comme faites à la fusion, ou ne les inscrit pas.
