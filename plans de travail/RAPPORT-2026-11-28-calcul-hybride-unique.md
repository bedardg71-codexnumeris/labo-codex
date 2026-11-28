# Rapport – le calcul hybride unique, à deux blocs (28 novembre 2026)

**Branche** : `claude/gallant-cray-cdzxgm` (le mandat nommait `lot/calcul-hybride-unique-2026-11-28` et permettait cette branche-ci ; c'est la seule que la session cloud peut pousser). **Base** : `e303f4768`, pointe de `lot/familles-par-reglages-2026-11-28` après ses deux amendements. À l'ouverture, la pointe du lot était encore `d61df73f6` et le second amendement vivait sur `claude/famille-pratique-reglages-fzu7ax`. Depuis, `lot/familles-par-reglages-2026-11-28` a été avancée à `e303f4768` : même base.
**Fait** : le temps 1, le banc d'équivalence (213 cas × 8 élèves fictifs, constantes figées, neuf break-tests rouges). Les mesures des quatre arrêts et des lecteurs.
**Pas fait, par arrêt** : les temps 2, 3 et 4, la fiche, l'assistant. Aucun fichier de `js/` n'est touché. Pas de fusion vers `main`, pas de bump, pas de changelog (mandat).
**Arrêts** : trois des quatre arrêts obligatoires se déclenchent (§ 4). Le premier, « Toutes », bloque le temps 2 lui-même. Les deux autres bloquent le temps 4 et un lecteur du temps 2 (le PDF de l'élève).
**Reste à Grégoire** : quatre décisions, en tête du § 4. Aucune ne se tranche par une mesure.
**Coordination** : le message de 9 h 02 demandait de lire `claude/coordination-2026-11-28.md`. Ce fichier n'est sur aucune des 133 branches d'origin (balayage complet, et `git ls-remote`), et aucun dossier d'ordinateur n'est relié à cette session. Je n'ai donc rien pu écrire sous mon titre. À reprendre dès qu'il est poussé.

## 1. Le banc d'équivalence (temps 1)

**Fichiers.** `tests/unit/banc-equivalence-calcul-hybride-2026-11-28.test.js` (le banc), `tests/unit/_helpers/banc-equivalence-hybride-2026-11-28.js` (les entrées et la lecture d'un résultat, aucune valeur attendue), `tests/fixtures/equivalence-calcul-hybride-2026-11-28/constantes.json` (les valeurs figées, 213 Ko).

**Comment les constantes sont nées.** Un générateur hors dépôt a appelé une fois `calculerDetailsNoteFinale` sur les modules réels de `e303f4768` (registre, résolution de la pratique active, `portfolio.js`, instance des standards, `profil-etudiant-actions.js`). Il a écrit le résultat dans `constantes.json`. Le banc ne recalcule jamais une valeur attendue : il compare la signature entière, sérialisée en JSON, à la constante. C'est une égalité de chaînes, donc des nombres au dernier bit. Aucune tolérance.

**Ce que fige une signature, par élève** : la note du cours ; la moyenne du pool ; les productions retenues, dans leur ordre ; le nombre d'évaluées ; le récit (production : retenue, obligatoire, écartée ou remplacée) ; le libellé de méthode (le PDF lit « hybride (catégories) » comme une clé) et sa clé ; le plafonnement ; la note de la terminale ; le statut provisoire ; les notes finales cochées ou non ; la cause d'une note absente.

**La matrice.**

| Dimension | Valeurs |
|---|---|
| Corpus | avec artefacts (conteneur 60, terminale 40) ; sans artefact, terminale au complément ; sans artefact ni terminale ; avec artefacts et deux marques « obligatoire » hors du pool (un travail, la terminale) ; tout le pool « obligatoire » (avec et sans artefacts) ; tout le pool « sélection » |
| Mode | meilleurs, derniers, recents, recents-meilleurs, tous, « hybride » sans catégories, une valeur inconnue ; deux blocs (catégories 65/35, 50/50, minimales `{ actif: true }`, inactives) |
| N | 3, 6, 9 pour six productions au pool ; 2, 4, 6 pour les quatre de la Sélection |
| Notes | provisoires et finales |
| Conformité | inactive ; active (déficits 1, 2, 3 et plus) |
| Productions écartées | `configuration.productionsExclues` sans artefact (une production, le formatif, un id sans production), sous chaque mode et en deux blocs ; avec artefacts (sans effet) |

Les huit élèves (DA fictifs 2000001 à 2000008) portent chacun un cas : toutes les copies ; trois notes égales à la coupure, stockées hors de l'ordre des numéros, sans terminale ; une sélection et une obligatoire non remises ; deux copies non recevables (plagiat, IA) et une terminale non recevable ; une reprise qui remplace, une reprise en brouillon (l'originale compte), un brouillon seul, une copie « travail en cours », une copie de portée nulle, un doublon réconcilié ; deux copies seulement ; la terminale seule ; un travail formatif évalué d'abord. Le cours porte une production formative (`examen-formatif`) et une diagnostique.

**Résultat** : 221 essais verts (213 cas, deux essais d'intégrité de la matrice, six essais qui disent en clair ce que les constantes établissent).

**Break-tests** : neuf mutations du calcul d'aujourd'hui, toutes rouges, source restaurée après chacune.

| Mutation | Cas rouges |
|---|---|
| Dénominateur des obligatoires : les copies remises au lieu de toutes, en notes finales | 27 |
| « Récents parmi les meilleurs » : 60 % au lieu de 50 % | 19 |
| « Tous » coupé à N | 18 |
| Égalité départagée par l'identifiant au lieu de l'ordre de stockage | 41 |
| La même moyenne des deux blocs, écrite dans un autre ordre d'opérations | 41 |
| Les retenues clonées (le récit perd l'identité des copies) | 60 |
| La terminale « obligatoire » remise au dénominateur (#339) | 2 |
| Conformité : un déficit de 2 traité comme 3 | 27 |
| Productions écartées lues aussi avec artefacts | 2 |

⚠ La cinquième ligne est une contrainte pour le temps 2. Réécrire `(moySel × pondSel + moyObl × pondObl) / (pondSel + pondObl)` sous une forme algébriquement égale change le dernier chiffre de 41 cas. Le calcul unique devra garder cet ordre d'opérations, et celui des sommes (dans l'ordre des retenues).

## 2. La fonction unique et ses lecteurs

**Non écrite** : l'arrêt du § 4.1 porte sur ce qu'elle doit rendre pour une pratique existante. Voici les lecteurs remesurés, que le temps 2 devra brancher.

| Lecteur | Où | Ce qu'il fait aujourd'hui |
|---|---|---|
| `_selectionnerArtefactsHybride`, `_selectionnerArtefactsLegacy` | `js/profil-etudiant-actions.js:233`, `:286`, appelés à `:555-557` | LE calcul de la note, deux branches |
| `selectionnerArtefactsSelonModalite` (branche hybride `:96`) | `js/portfolio.js:78` | aucun appelant dans `js/` (exposée sur `window`, éprouvée par les sentinelles #816 et #722) |
| `calculerPerformance` (`switch` `:188-220`) | `js/pratiques/pratique-pan-standards.js:126` | inatteignable pour la note d'une standards : `calculerNoteDuCours` (`portfolio.js:330`) et `_simulerIndicesInterne` (`:540`) refusent ce repli quand la famille est STD. Ignore les deux blocs et la conformité ; les sentinelles #394 et #715 la tiennent alignée hors deux blocs |
| `_selectionnerArtefactsMobilisation` et ses textes | `js/profil-etudiant-sections-affichage.js:158`, `:171`, `:192` | lit les retenues de `calculerDetailsNoteFinale` (plus de sélection propre depuis le 29 oct.) ; recopie le N par défaut de la Sélection (4) |
| Textes de règle | même fichier, `:3616`, `:3643` | phrases par mode, écrites depuis la configuration |
| `_lireNotePourPanneauHabiletes` | même fichier, `:3803` | lit la note ; recopie le N par défaut (4) |
| `construireNoteProvisoire` puis `renderRangeeNote` (`calculerCategorie`) | `js/synthese-retroaction-data.js:1435` (liste des obligatoires `:1550`), `js/synthese-retroaction-rendu.js:810`, `:834` | **un second calcul**, pour le PDF de l'élève : ses obligatoires, ses copies, ses moyennes (voir § 4.3) |

Lecteurs hors de la liste de Cowork, mesurés : `js/tableau-notation.js:457` (la phrase de règle du tableau) ; `js/pratiques/pratique-registre.js:237` (`_pratiqueRetientDesProductions`, la famille) et `:1100` (`productionsExcluesDuPoolStd`) ; `js/vue-simple.js:1604` (la marque « compte dans la note ») ; `js/vue-simple-donnees.js:365` (le modèle de la vue simple pose « tous ») ; `js/pratiques/construction-attributs.js:129`, `:379` et `js/pratiques/pratiques-exploration.js:201` (l'Exploration) ; la fiche (`js/pratiques-gestion.js:1360`, `:1398`, `:1960-1977`, `:2976-3310`) ; l'assistant (`js/wizard-pratique-v2.js:712`, `:3035-3090`, `:3752-3768`).

**Ce que le temps 2 aura à tenir, établi par le banc** :
- « N meilleures » se lit exactement comme un bloc Sélection seul : même note, mêmes retenues dans le même ordre, pour N = 3, 6 et 9, en notes provisoires comme finales.
- Le rangement se lit à deux endroits. En deux blocs, c'est la catégorie de la production : un bloc rassemble les productions de sa catégorie, mais seules les copies du pool y entrent. D'où le zéro d'un travail marqué « obligatoire » dans un cours à artefacts (cas `ART_OBL_HORS`, figé). Hors deux blocs, c'est le pool moins `productionsExclues`. Les catégories y sont un reste inerte.
- En deux blocs et notes finales, un élève sans aucune copie au pool a une note (le pool vaut 0 ; 30,8 dans le banc). En notes provisoires, il n'en a pas.

## 3. Ce qui a été retiré

Rien : le temps 3 suit le temps 2.

## 4. Les arrêts rencontrés

### Les quatre décisions à prendre

1. **« Toutes »** (§ 4.1) : comment le modèle à deux blocs l'exprime. Je recommande un bloc Obligatoires qui, pour une pratique existante, ignore la non-remise. Il reste aussi à choisir la règle à offrir aux pratiques neuves.
2. **« Selon la pondération »** (§ 4.2) : pour une pratique à artefacts, il n'y a aucune valeur à lire.
3. **Le PDF de l'élève** (§ 4.3) : il doit lire le calcul unique, ce qui change des nombres que l'élève voit dans quatre cas mesurés. Il faut aussi de nouveaux mots pour une moyenne pondérée.
4. **Le rangement** (§ 4.4) : que doit écrire le geste qui active le second bloc ?

### 4.1 « Toutes » ne se laisse pas exprimer par les deux blocs sans changer une note : ARRÊT

Mesuré par le banc (corpus `ART_TOUT_OBL` et `SANS_TOUT_OBL`). Lire une pratique « Toutes » comme un bloc Obligatoires seul ne change rien en notes provisoires (8 élèves sur 8). En notes finales, la note change pour **7 élèves sur 8**. Seul celui qui a tout remis garde la sienne.

| Élève (fictif) | Copies au pool | « Toutes », finale | Obligatoires seul, finale |
|---|---|---|---|
| 2000002 | 5 sur 6 | 75,2 | 62,67 |
| 2000006 | 2 sur 6 | 77,5 | 25,83 |
| 2000007 | 0 sur 6 | aucune note | 30,8 |

Qui est touché : toute pratique réglée sur « Toutes » dont les notes finales sont cochées. Le modèle « Cumulative par niveaux » de la vue simple arrive sur « Toutes » (`vue-simple-donnees.js:368`), notes finales décochées : la divergence apparaît le jour où l'enseignant·e les coche.

L'autre lecture, un bloc Sélection qui retient tout, garde la note. Mais elle contredit le texte accepté de la carte (« Une partie de ces productions est retenue »). Elle ferait aussi passer la pratique de CUM à HYB, puisqu'un bloc Sélection actif rend la pratique hybride. Il faudrait alors amender la règle de famille.

**Comment le calcul unique rendrait l'ancienne note (ma recommandation).** Lire « Toutes » comme un bloc Obligatoires seul, avec un réglage de plus sur ce bloc : ce que vaut une production non remise, 0 ou ignorée. Une pratique « Toutes » existante se lit avec « ignorée », sans rien écrire. Son badge reste CUM (aucun bloc Sélection), et le banc doit rester vert sans qu'une constante change.

**Ce que l'écran en dirait (proposé, non posé).** Dans la carte Obligatoires d'une telle pratique, à la place de « Une obligatoire non remise vaut 0 une fois les notes finales cochées. » : « Une production non remise est ignorée, même une fois les notes finales cochées. »

**À Grégoire** : la règle à offrir aux pratiques NEUVES. Une non-remise vaut-elle 0 en notes finales dans une cumulative ? Et ce réglage doit-il paraître dans la carte, ou rester une lecture de l'ancien réglage ?

### 4.2 « Selon la pondération de chaque production » n'a pas de valeur à lire sur une pratique à artefacts : ARRÊT

Lu dans le code :
- Un artefact n'a pas de pondération propre (`js/productions.js:119`, `ponderationPropre: false`). Le formulaire masque le champ. La fiche des productions le dit (« Les artefacts n'ont pas de pondération propre »), et l'avertissement de structure aussi (« sa pondération n'est pas utilisée par le calcul », `:391-395`). Le champ vide s'enregistre 0 (`:1878`, `parseInt(…) || 0`). Une moyenne pondérée de six artefacts de la Sélection ou des Obligatoires serait 0 / 0. C'est le cas de la pratique de Grégoire (quatre meilleures et deux obligatoires, toutes des artefacts).
- Sans artefact, la pondération existe, mais elle n'est pas exigée en standards (`:2015`), et un champ laissé vide vaut 0. L'écran dit aujourd'hui le contraire de ce réglage : « la note se calcule à partir de toutes tes productions évaluées, quels que soient leur type et leur pondération » (`:368`). Ce texte deviendrait faux.

Voies possibles :
- (i) n'offrir « selon la pondération » que si chaque production du bloc porte une pondération non nulle (jamais avec des artefacts) ;
- (ii) rendre une pondération aux artefacts (un changement du formulaire des productions et de ses textes) ;
- (iii) un poids par production dans la liste « Où va chaque production », mais ce serait un second magasin, que le mandat exclut.

### 4.3 Un texte reçu par l'élève changerait : ARRÊT

Le PDF de l'élève ne lit pas le calcul des blocs : il le refait. `construireNoteProvisoire` choisit ses propres copies (`!remplaceeParId && noteFinale != null`, au lieu de la règle `evaluationEntreDansLaNote`) et ses propres obligatoires (celles du pool seulement). `calculerCategorie` refait les moyennes.

Mesuré sur les modules réels (sonde temporaire, retirée) : une pratique à deux blocs, notes finales, quatre artefacts (deux en Sélection, deux obligatoires), terminale.

| Cas | Ligne que l'élève lit | Somme réelle |
|---|---|---|
| Témoin, tout est propre | Note finale = 48,75 + 26,25 = 75 | 75 |
| Une obligatoire en brouillon | Note finale = 48,75 + 26,25 = 64,5 | 75 |
| Une obligatoire dont la reprise est en brouillon | Note finale = 48,75 + 32,38 = 75 | 81,13 |
| Une obligatoire « travail en cours » | Note finale = 48,75 + 26,25 = 64,5 | 75 |
| Un examen marqué « obligatoire », hors du pool | Note finale = 48,75 + 26,25 = 66,3 | 75 |

Dans ces cas, la note est juste mais sa décomposition ne l'est pas. Le PDF montre aussi la note d'une copie en brouillon, que le calcul ne compte pas.

Brancher ce lecteur sur le calcul unique (ce que demande le temps 2) corrigerait ces lignes. Les mots ne changeraient pas, mais des nombres que l'élève reçoit changeraient. Le temps 4 ajoute un cas de plus : une répartition « selon la pondération » ne peut pas s'écrire « (a + b) ÷ 2 ». Il faudra des mots neufs pour la ligne du bloc Obligatoires, par exemple « (a × 10 + b × 20) ÷ 30 », à écrire par Grégoire.

Le libellé « hybride (catégories) », lu comme une clé, est figé par le banc et ne bouge pas.

### 4.4 La fiche n'écrit rien sans geste, mais le rangement pose une question : PAS D'ARRÊT, une question

Mesuré : ouvrir la fiche n'écrit rien. `sauvegarderConfigPratiqueMat` sort pendant le remplissage (`enChargementFormulaire`, `js/pratiques-gestion.js:1839`), y compris quand l'ouverture appelle `toggleCategoriesMat`.

La question, qui revient à Grégoire parce qu'elle écrit dans des données qu'il n'a pas touchées une à une :
- Le rangement d'une pratique à un seul bloc se lit dans `productionsExclues`, propre à la pratique.
- Celui d'une pratique à deux blocs se lit dans la catégorie de la PRODUCTION, partagée par toutes les pratiques du trimestre.
- Cocher « Utiliser ce bloc » sur la carte Obligatoires d'une pratique « N meilleures » change donc la source lue : la liste « Où va chaque production » montrerait d'un coup un autre rangement, sans qu'aucune donnée ait bougé.

Pour garder ce que l'enseignant·e voyait, le geste devrait écrire la catégorie de plusieurs productions. Proposé : le geste écrit « selection » sur les productions qui étaient dans la Sélection, et l'annonce (« 6 productions rangées dans le bloc Sélection »).

## 5. Les textes

Aucun texte d'écran n'est écrit ni changé (aucun fichier de `js/` n'est touché).

**Pour la relecture de Grégoire, proposés et non posés** (les nombres sont ceux de l'exemple de la maquette) :

| Cas | Phrase de « Ta note, en clair » proposée |
|---|---|
| Les plus récentes | « Les 4 plus récentes des 6 productions du bloc Sélection comptent pour 65 %. » |
| Les plus récentes parmi les meilleures | « Les 4 plus récentes parmi la meilleure moitié des 6 productions du bloc Sélection comptent pour 65 %. » |
| Selon la pondération | « Les 2 productions du bloc Obligatoires comptent pour 35 %, selon la pondération de chacune. » |
| Un seul bloc (Sélection) | « Les 4 meilleures des 6 productions du bloc Sélection comptent pour toute la note. » |
| Un seul bloc (Obligatoires) | « Les 6 productions du bloc Obligatoires comptent pour toute la note, à parts égales. » |
| Pas de terminale | la phrase « L'évaluation terminale compte à part, selon sa pondération. » est omise |

**Le total qui n'est pas 100 %** : le texte existe (`validerPonderationsCategoriesMat`, `js/pratiques-gestion.js:3039`). Il se reprend tel quel : « Total : 90 % (il manque 10 %) » et « Total : 110 % (dépasse de 10 %) ».

## 6. Source ou stock

Aucune donnée n'est écrite par ce lot : il n'ajoute qu'un banc. Aucune pratique n'est réécrite. Ce qu'une pratique existante montre à l'ouverture de sa fiche est inchangé.

Pour le temps 2, la règle reste celle du mandat : une pratique existante se LIT dans le modèle, rien ne s'écrit avant un geste dans la fiche. Le banc est la preuve exigée : vert sans qu'une constante change.

## 7. Trouvailles hors lot, et leur issue

| # | Trouvaille | Issue |
|---|---|---|
| 1 | La ligne de calcul du PDF de l'élève ne s'additionne pas dans quatre cas, et montre la note d'un brouillon (§ 4.3) | Touche ce que les élèves ont en main : relèverait du niveau 1, mais c'est un texte reçu par l'élève, à trancher par Grégoire. Rapportée en arrêt, non corrigée |
| 2 | Hors deux blocs, le PDF dit « Voici les N meilleures productions que tu as réalisées » sous « récentes », « récentes parmi les meilleures » et « Toutes » (`synthese-retroaction-rendu.js:875`) | 2, inscrire : texte reçu par l'élève, ses mots reviennent à Grégoire |
| 3 | Les cases des catégories de la fiche listent toutes les productions du trimestre, hors artefacts et autres cours compris (`chargerProductionsPourCategories`, `:3059`). Elles permettent de marquer « obligatoire » une production hors du pool, qui vaut alors 0 en notes finales (cas `ART_OBL_HORS`, figé) | 2, inscrire ; la liste « Où va chaque production » du temps 4 devra n'offrir que le pool |
| 4 | L'assistant lit encore `modalitesEvaluation.utiliserCategories` et `modalitesEvaluation.categories.actif` (`wizard-pratique-v2.js:3086`). Aucun écrivain dans `js/` : un trimestre ancien qui les porte rendrait hybride toute pratique « N meilleures » créée par l'assistant | 2, inscrire |
| 5 | La fiche lit `portfolio.hybride` (`pratiques-gestion.js:1360`), que le calcul ne lit pas : une pratique qui ne porterait que ce drapeau s'afficherait à deux blocs et se calculerait en « N meilleures » | 2, inscrire (stock non compté) |
| 6 | Une méthode inconnue coupe à N dans l'ordre de stockage, mais le tableau de notation la dit « les N meilleures productions » (`tableau-notation.js:469`) | 3, à commenter au temps 2 (aucune pratique écrite par l'application ne porte de méthode inconnue) |
| 7 | Le N par défaut de la Sélection (4) est recopié en quatre lieux | partira avec le calcul unique (dans le lot, pas une trouvaille) |
| 8 | Un travail formatif compte dans la note d'une pratique sans artefact (confirmé par le banc, `SANS · tous`) | déjà rapporté au lot précédent (§ 0) |

## 8. WebKit, Safari, iPad

- Rien n'a été joué sous WebKit : le lot n'ajoute qu'un banc Vitest (Node), et aucun fichier de l'application ne change.
- Aucune porte terrain pour ce commit : une machine répond à tout ce qu'il contient.
- **La vérification due avant toute mise en ligne du temps 2**, sur les vraies notes de Grégoire, une fois le calcul unique écrit :
  1. ouvrir le profil d'un élève réel d'une pratique à deux blocs, et noter sa note du cours et la liste de ses productions retenues ;
  2. passer sur la version du calcul unique et rouvrir le même profil ;
  3. comparer la note au centième et les retenues une à une.
  
  Le nom de l'élève ne s'écrit nulle part. Même geste sur une pratique « Toutes », notes finales cochées.

## 9. Fichiers du lot

- `tests/unit/banc-equivalence-calcul-hybride-2026-11-28.test.js`
- `tests/unit/_helpers/banc-equivalence-hybride-2026-11-28.js`
- `tests/fixtures/equivalence-calcul-hybride-2026-11-28/constantes.json`
- `plans de travail/RAPPORT-2026-11-28-calcul-hybride-unique.md`
