# Rapport : « Par standards » dans la vue simple, à l'essai

> **L'adresse d'essai ne change pas : https://deploy-preview-46--codexnumeris-051225.netlify.app**
> (PR d'aperçu en brouillon, « ne pas fusionner » : https://github.com/bedardg71-codexnumeris/labo-codex/pull/46).
> Mandat du 21 nov. 2026 (décision de Grégoire, 14 h 19 : « il faut que la vue simple soit fonctionnelle avant la release ;
> c'est ce que les gens vont d'abord tester » ; périmètre confirmé à 14 h 20). Même branche
> (`lot/moteur-cibles-3-4-retenu-note`), même PR. **Rien dans `main`, aucune release** : la session du Mac s'en charge après
> ce rapport. Session : Claude Code dans un conteneur cloud Linux ; **WebKit n'y existe pas**, tout ce qui est « vu » l'est
> sous Chromium.
>
> **Le Mac passe sous WebKit le commit `f20d8d97`** (le commit suivant, s'il y en a un, ne change que des documents),
> avec `tests/integration/vue-simple.spec.js` (en entier : le describe « à l'essai » est neuf, les autres épinglent les
> modèles actuels) et `par-standards-lot-2-inscrire.spec.js`, `par-standards-lots-3-4.spec.js`.

## 0. Ce qui a été mesuré de la vue simple AVANT de construire (lecture seule)

Lu dans `js/vue-simple.js`, `js/vue-simple-donnees.js`, `js/tableau-notation.js`, `js/export-resultats-finaux.js`, puis vu
au navigateur (Chromium) sur la tête de la branche (`4d653e9f`) :

1. **Choisir un modèle.** Deux cartes (`MOTS.modeles`). Le geste installe une COPIE d'un modèle de la bibliothèque
   (`MODELES_PRATIQUES_PREDEFINIS`, par `pratiqueDepuisModele`) dans le trimestre, et l'assigne au groupe actif par le
   chemin de la vue étendue (`PratiqueManager.changerPratiqueActive`). Une pratique du même modèle qu'aucun groupe
   n'emploie (laissée par « Changer de modèle ») est reprise, pas doublée (`inspireDe.sourceId`). « Changer de modèle »
   est offert tant que le groupe n'a aucune production.
2. **Coller la liste.** `VueSimpleDonnees.analyserListeCollee`, puis un groupe « léger » (sans horaire). Rien à changer.
3. **Saisir.** L'écran Résultats n'a pas de tableau à lui : il affiche celui de la vue étendue
   (`TableauNotation.afficherDans(presentation)`), habillé par un objet de présentation (les mots, « Régler », les gestes
   des tableaux vides).
4. **Voir les notes.** L'écran Note finale lit `TableauNotation.notesDuGroupe()` : une ligne par étudiant·e, une valeur et
   un détail.
5. **Exporter.** Le même geste que Suivi › Groupe (`exporterSyntheseResultatsCSV`, qui passe par `simulerIndices`).
6. **Basculer vers la vue étendue et revenir.** N'écrit que le choix de la vue (`laboCodex.vue`) ; un banc l'épingle déjà
   (« la bascule n'écrit rien »).
7. **Ce que la vue simple montrait d'une pratique « Par standards » créée en vue étendue** (mesuré au navigateur) :
   l'accueil la nommait ; l'écran Pratique disait « …se règle en vue étendue » ; Résultats : « Le tableau sert aux
   pratiques par sélection de productions et par spécifications. La pratique de ce groupe se suit en vue étendue. » ;
   **Note finale : un écran BLANC** (le titre seul : l'état `cibles` n'avait aucun mot). Ce dernier point est un défaut
   sur le STOCK (toute pratique « Par standards » créée en vue étendue depuis le lot 1, rouverte en vue simple) ; ce lot
   le tarit à la source (§ 4).
8. **La famille d'une pratique** se lisait par une expression sur son type (`/standard/i`, `/spécification/i`) : une
   pratique `cibles` tombait dans « autre ». Le nom n'y entrait pas.
9. **L'export d'une pratique par cibles** (mesuré au navigateur, rien changé) : la note d'une étudiante notée ; pour
   une note en attente, la colonne de la note VIDE et le statut « non constructible – Pas encore de note : les cibles
   « A », « B » sont sans donnée. […] » ; le sigle « STD », jamais « CIB ». **Il était juste ; il n'est pas touché.**

**Construit dans ce moule** : la famille lue par une seule fonction pure (`familleDeLaPratique`) ; une troisième carte ;
la création suit l'ordre et la forme de l'assistant (l'échelle de départ, l'ensemble par son seul écrivain, la pratique),
puis le même chemin d'assignation ; le tableau des cibles du lot 2 reçoit la présentation de la vue simple ; l'écran Note
finale lit `notesDuGroupe`, qui passe au moteur des lots 3 et 4 (`note-cibles.js`, aucun calcul recopié).

## 1. Mesuré, lu, non vu

**Mesuré** (une commande l'a rendu) :

- **La garde du lot 0 : 16 sur 16** (`sentinelle-moteur-cibles-0-garde.test.js`).
- **Les modèles actuels rendent ce qu'ils rendaient.** Le même parcours (classe, modèle, une production, un résultat,
  chaque écran) joué sous Chromium sur la base (`4d653e9f`, un arbre de travail détaché) et sur le code neuf, le HTML de
  chaque écran normalisé des identifiants : **identique**, pour « Par sélection de productions » et pour « Par
  spécifications », sur les cinq écrans (accueil, choix du modèle, pratique, résultats, note). Seule différence au choix
  du modèle : la troisième carte et la classe de la grille (`vs-etapes--trois`), retirées avant la comparaison.
  Épinglé ensuite de deux façons : `tests/integration/vue-simple.spec.js` en entier (les essais d'avant, un seul retouché :
  trois modèles au lieu de deux) et la sentinelle Vitest `sentinelle-par-standards-vue-simple.test.js` (V1, V2).
- **La sentinelle Vitest** `tests/unit/sentinelle-par-standards-vue-simple.test.js` : 16 essais (V1 à V5).
- **Le parcours sous Chromium** : `tests/integration/vue-simple.spec.js`, describe « Par standards, à l'essai », 5 essais :
  1. le parcours entier (choisir le modèle, écrire trois cibles, refus, inscrire, refus sans niveau, annuler, la note
     quitte « En attente », la note finale, l'export lu colonne par colonne) ;
  2. le réglage des cibles (ajouter, renommer, refus, retirer une cible inscrite : la question, « Annuler » n'écrit
     rien, « Retirer quand même » garde les inscriptions) ;
  3. une pratique enrichie en vue étendue (poids 2-1-1, un critère, une cible terminale, le second seuil, une remarque
     sans niveau) rouverte en vue simple : la note tient compte des poids (81) et du second seuil (55, « plafonnée »),
     la case de la remarque le montre, lire et basculer n'écrivent RIEN (empreinte de toute la base) ; ajouter une cible
     ne touche ni les poids, ni la terminale, ni le critère ;
  4. le stock : une pratique nommée « Par standards » de la famille par sélection garde ses écrans, rien n'est écrit ;
  5. « Changer de modèle » : offert sans inscription, retiré dès la première ; le modèle repris ne double rien.
  Chaque écran du parcours passe aussi la règle `aucunMotInterdit` (aucun « critère », « grille »…, aucun « élève »,
  aucun chemin de la vue étendue) et « CIB » ne s'y lit pas.
- **Vitest, suite complète, un seul worker** (`--maxWorkers=1`, fichiers isolés), sur le code de `f20d8d97` : **943
  fichiers, 12 166 verts, 0 rouge, aucune erreur non gérée**. La passe d'avant (un seul processus partagé, `singleFork`)
  avait 4 rouges, tous du lot, tous finis : la complexité (quatre fonctions passées au-dessus de 15 par mes ajouts,
  redécoupées : le compte revient à 434), l'insécable de « 0 % » (#1137), et deux sentinelles du 20-21 nov. que le mandat
  change (ci-dessous) ; ses 24 erreurs non gérées venaient de minuteries d'autres fichiers d'essai (`requestAnimationFrame`,
  `notif.remove`) qui fuient d'un fichier à l'autre dans un processus partagé : aucune dans le mode isolé.
- **Deux sentinelles voisines révisées**, chacune le dit dans son code : `sentinelle-renommage-selection-productions`
  (« Par standards » redevient un titre de carte, mais celui de la NOUVELLE famille, une seule fois ; la carte du modèle par
  sélection garde « Par sélection de productions » : son break-test B1 rougit toujours, 2 rouges, rejoué) ;
  `sentinelle-sigles-sel-std-2026-11-21` (« CIB » : une place interne de plus, `pratiques: ['CIB']` de la pratique née en
  vue simple, comme celle de l'assistant ; la clé de famille de la vue simple s'appelle `CIBLES` pour ne pas l'écrire
  ailleurs).
- **Chromium, sur le code de `f20d8d97`** : `vue-simple.spec.js` en entier (52 essais : les 47 d'avant, un seul retouché,
  et les 5 neufs), `par-standards-lot-2-inscrire.spec.js` (6) et `par-standards-lots-3-4.spec.js` (7) : **65 sur 65**,
  aucun repris au second essai.
- **Les captures** : `plans de travail/captures-2026-11-21-par-standards-vue-simple/`, 1180 × 820 et 820 × 1180, clair
  et sombre (§ 6).

**Lu, non exécuté** : le CSS des cibles tactiles (46 px pour tout ce qui se touche en vue simple, règle existante) ;
mesuré pour les boutons et les champs des écrans neufs au navigateur (§ 6), pas au doigt.

**Non vu** : **WebKit** (Safari, iPad) ; l'iPad au doigt ; l'adresse d'aperçu elle-même (le proxy du conteneur la refuse).

## 2. Suppositions (nommées, à corriger en dix secondes)

- **S1.** La pratique créée s'appelle « Par standards », comme le modèle (le moule : le titre de la carte devient le nom).
- **S2.** Retirer toutes les cibles est refusé en vue simple (« Écris au moins une cible. ») : une pratique sans cible
  n'a pas de note.
- **S3.** La dernière inscription en vue simple ne montre ni les critères cochés en vue étendue, ni « Sans production »
  (pas de critère en vue simple) ; « Toutes les inscriptions de cette cible se lisent en vue étendue. »
- **S4.** « Changer de modèle » reste offert tant qu'aucune inscription ne porte sur les cibles de la pratique (l'équivalent
  de « aucune production » des autres modèles) ; la pratique laissée est reprise au prochain choix, cibles comprises.
- **S5.** « À l'essai » : un mot encadré, discret, jamais la couleur d'une alerte.
- **S6.** Le bouton d'export du tableau des cibles en vue simple reprend le mot du tableau des productions de la vue
  simple (« Exporter la synthèse (CSV) ») : un seul mot pour un seul geste.

## 3. Écarts

- **É1. Deux pratiques peuvent porter le nom « Par standards » dans un même trimestre** : une du stock (l'ancien modèle de
  la vue simple, famille par sélection, du 10 au 21 nov.) et une neuve (famille `cibles`). La vue simple les distingue
  (famille lue au type) ; **la liste des pratiques de la vue étendue ne les distingue que par leur badge**. Le stock n'est
  pas renommé : écrire dans les données de quelqu'un remonte à Grégoire. Issue : **inscrire et continuer** (TEXTES, Q2).
- **É2. L'écran Note finale était blanc pour toute pratique par cibles** (§ 0, point 7) : **corrigé maintenant** (il casse
  le parcours livré). Source tarie ; le stock n'a rien à réparer (rien n'était écrit, l'écran seul manquait).
- **É3. Les boutons de la fenêtre d'une case et des questions mesuraient 39 px** (et la croix de fermeture 18 px), sous
  le plancher de 44 px : la fenêtre et les dialogues communs (`uiDialogues`) sont posés hors de la page de la vue simple,
  que la règle des 46 px ne couvrait pas. **Corrigé maintenant pour ce lot seulement** : la fenêtre de la vue simple
  (`tc-overlay--simple`) et les deux questions que ce lot pose (`uiDialogues`, option neuve `classe` :
  `ui-dialogue--tactile`, boutons à 46 px, la raison sous sa phrase, sur toute la largeur). Les autres dialogues de
  l'application, en vue simple comme en vue étendue, sont inchangés (l'option absente, rien ne bouge). Que la même
  règle couvre tous les dialogues ouverts en vue simple : **inscrire et continuer**.
- **É4. La colonne « Cours » de l'export est vide** pour un groupe né en vue simple, quel que soit le modèle (mesuré, pas
  touché : hors du lot). **Inscrire et continuer.**
- **É5. Les cartes de l'accueil ne nomment pas le nouveau modèle** : « Choisis un modèle, par sélection de productions ou
  par spécifications… », « …tes productions en colonnes ». Gardées telles quelles : l'accueil est commun à tous les
  modèles, et le relevé (§ 1) l'a mesuré identique. Une phrase à trancher par Grégoire (TEXTES, Q6). **Inscrire et
  continuer.**

## 4. Ce qui est construit

- **La carte** « Par standards », à côté des deux autres, avec « À l'essai » sous son titre (un paragraphe de la carte,
  lisible sans survol). Les trois cartes côte à côte à 1180 px ; l'une sous l'autre sous 1000 px (iPad en portrait).
- **La famille par le type** : `VueSimpleDonnees.familleDeLaPratique`. Une pratique nommée « Par standards » de la famille
  par sélection (le stock du 10 au 21 nov.) reste de sa famille : ses écrans ne changent pas, elle n'est pas réécrite.
- **Écrire ses cibles, une par ligne** → « Créer ma pratique » : l'échelle de départ de l'assistant (cinq niveaux, 0 à 4,
  « sans donnée » = 0), l'ensemble (`EnsemblesCibles.enregistrer`, son seul écrivain), la pratique de la forme que
  l'assistant écrit (famille `cibles`, `niveaux_par_cible`, ni second seuil, ni « Notes finalisées »), assignée au
  groupe. Chaque ligne : une cible, poids 1, aucun critère, pas terminale, énoncé vide. Les lignes vides tombent.
- **Le réglage des cibles** (« Régler » du bloc « Tes cibles », ou du tableau) : renommer, « + Cible », « Retirer ». Chaque
  cible gardée l'est ENTIÈRE (énoncé, critères, poids, « terminale » réglés en vue étendue) ; une cible ajoutée prend la
  règle de poids de l'assistant (le poids commun si tous sont égaux, sinon 1). Retirer une cible qui porte des
  inscriptions pose la question de l'assistant, désormais lue à une seule source
  (`InscriptionsCibles.questionRetraitCibles`, que l'assistant appelle aussi) ; « Annuler » n'écrit rien.
- **Les cibles tactiles** : 46 px pour tout ce qui se touche dans les écrans neufs, la fenêtre d'une case et les deux
  questions (É3) ; mesuré sous Chromium sur huit écrans × deux formats × deux thèmes, et épinglé dans le banc
  (`cibleTactile`).
- **Le tableau** : celui du lot 2, en vue simple : la case montre le niveau retenu, la colonne « Note » la note ou « En
  attente » et les cibles. La fenêtre d'une case : les tuiles de l'échelle, « Rétroaction » facultative, la date du jour,
  aucune production, aucun critère à cocher, pas de remarque sans niveau ; en bas, la dernière inscription et son
  « Annuler » (`InscriptionsCibles.annuler` : elle reste, barrée, et la fenêtre le dit). L'inscription garde la forme du
  § 0 du plan (les critères de la vue étendue, non renseignés).
- **L'écran Note finale** : la note de chaque étudiant·e par le moteur des cibles, ou « – » et « En attente : X, Y » ;
  « plafonnée » au besoin. Ses états vides disent pourquoi et le geste qui remplit.
- **Ce qui reste en vue étendue, et le dit** : les énoncés, les poids, les cibles terminales (bloc « Tes cibles ») ; les
  niveaux (bloc « Tes niveaux ») ; le second seuil et « Notes finalisées » (bloc « La note », s'ils sont réglés) ; tout
  l'historique (la fenêtre d'une case).

## 5. La preuve (break-tests)

Chaque mutation posée dans le code, le banc nommé rejoué, puis le code restauré (le harnais copie le fichier avant et le
remet après ; aucun `.bt` laissé). **Douze break-tests, onze rouges sur tous leurs bancs, un vert attendu (BT12).**

| N° | La mutation | Banc | Verdict |
|---|---|---|---|
| BT1 | La famille se lit au NOM (« Par standards » → `cibles`) | sentinelle V1 ; spec « le stock » | rouge, rouge |
| BT2 | « À l'essai » retiré de la carte | sentinelle V2 ; spec « le parcours » | rouge, rouge |
| BT3 | Une cible gardée au réglage perd énoncé, critères, « terminale » | sentinelle V4 ; spec « enrichie en vue étendue » | rouge, rouge |
| BT4 | Retirer une cible inscrite sans la question | spec « le réglage des cibles » | rouge |
| BT5 | Une note en attente vaut 0 à l'écran Note finale | spec « le parcours » | rouge |
| BT6 | « Changer de modèle » offert après une inscription | spec « Changer de modèle » | rouge |
| BT7 | L'inscription de la vue simple porte une production | spec « le parcours » | rouge |
| BT8 | La vue simple écrit l'ensemble de cibles en direct | sentinelle V5 | rouge |
| BT9 | Lire l'écran Pratique réécrit l'ensemble (poids remis à 1) | spec « enrichie en vue étendue » (l'empreinte) | rouge |
| BT10 | « critères » dans un texte de l'écran Pratique | spec « le parcours » (`aucunMotInterdit`) | rouge |
| BT11 | La fenêtre de la vue simple sans ses cibles tactiles | spec « le parcours » (`cibleTactile`) | rouge |
| BT12 | La carte « Par sélection de productions » change d'un mot | sentinelle V2 ; spec « le parcours d'un nouvel arrivant » | rouge, **vert** |

BT12 dit ce que chaque banc garde : le texte des cartes actuelles est épinglé par la sentinelle (V2), pas par la spec
d'avant, qui juge les gestes. Le rendu entier des écrans des modèles actuels, lui, a été comparé une fois à la base
(§ 1) ; il n'est pas épinglé en continu (un relevé de HTML dépend du moteur, et le Mac juge sous WebKit).

## 6. Les captures

`plans de travail/captures-2026-11-21-par-standards-vue-simple/` : huit écrans, chacun à **1180 × 820** et **820 × 1180**,
en **clair** et en **sombre** (32 images, échelle 2, réduites à 256 couleurs : 3,3 Mo au lieu de 15,8). Chromium ; noms
fictifs.

| N° | Écran |
|---|---|
| 1 | Pratique : les trois modèles, « À l'essai » sous « Par standards » (l'un sous l'autre à 820 px) |
| 2 | Pratique : écrire ses cibles, une par ligne |
| 3 | Pratique : la pratique créée (Tes cibles, Tes niveaux, La note) |
| 4 | Pratique : le réglage des cibles |
| 5 | Résultats : le tableau, une étudiante notée (75 %), les autres « En attente » et leurs cibles |
| 6 | La fenêtre d'une case : les tuiles, la rétroaction, la dernière inscription et « Annuler cette inscription » |
| 7 | Après l'annulation : « Inscription annulée. Rien ne s'efface… » |
| 8 | Note finale : la note, « – » et « En attente : … » |

**Vu** sur les captures : rien ne déborde à 820 px ; les trois cartes s'empilent ; le mode sombre garde les contrastes
du tableau et de la fenêtre. **Mesuré** au même passage : aucun bouton, champ, tuile ni case sous 44 px sur les écrans
4 à 6, dans les quatre combinaisons (après la correction d'É3).

## 7. Ce que Grégoire fera dans la vue simple en ligne, et ce qu'il doit voir

À faire dans une **fenêtre privée** (Safari sur le Mac, puis sur l'iPad) : l'application part vide et s'ouvre en vue
simple, comme pour un·e nouvel·le enseignant·e. Noms fictifs dans la liste.

1. **Accueil → « Coller ma liste »**, colle quatre lignes (par exemple `9990001, Albatros, Ada`), « Créer ma classe ».
   Tu dois voir : « Classe créée : 4 étudiant·es. »
2. **Pratique.** Tu dois voir **trois** cartes côte à côte (sur l'iPad en portrait : l'une sous l'autre) ; la troisième,
   « Par standards », porte « À l'essai » sous son titre, sans avoir à survoler quoi que ce soit.
3. **« Choisir ce modèle » sous « Par standards ».** Tu dois voir « Tes cibles » et un grand champ. Touche « Créer ma
   pratique » sans rien écrire : « Écris au moins une cible. », et rien n'est créé.
4. **Écris trois cibles, une par ligne** (une ligne vide au milieu ne compte pas), « Créer ma pratique ». Tu dois voir trois
   blocs : « Tes cibles » (tes trois noms), « Tes niveaux » (0 à 4, de « Données insuffisantes » à « Avancé »), « La
   note » (comment elle se fait).
5. **« Régler » dans « Tes cibles »** : renomme une cible, « + Cible », écris son nom, « Enregistrer ». Tu dois voir
   « Cibles enregistrées. » et quatre noms.
6. **Résultats.** Tu dois voir tes étudiant·es en lignes, tes cibles en colonnes, chaque case « Données insuffisantes »,
   et la colonne « Note » : « En attente » et les cibles qui manquent.
7. **Touche une case.** Tu dois voir « Inscrire un niveau », le nom de l'étudiant·e, la cible, cinq tuiles, « Rétroaction »
   et « L'inscription prend la date d'aujourd'hui. » ; ni critère, ni production. « Inscrire le niveau » sans tuile :
   « Choisis un niveau : touche une tuile. » Choisis « 3 », écris une rétroaction, « Inscrire le niveau » : la fenêtre se
   ferme, la case montre « 3 ».
8. **Remplis les autres cibles de la même personne.** Tu dois voir la colonne « Note » passer d'« En attente » à un
   pourcentage (la moyenne des niveaux : 3, 4 et 4 donnent 92 %).
9. **Rouvre la dernière case, « Annuler cette inscription »**, écris une raison, « Annuler l'inscription ». Tu dois voir
   « Inscription annulée. Rien ne s'efface : elle reste, barrée, dans l'historique de la vue étendue. », puis, la fenêtre
   fermée, « En attente » et le nom de cette cible dans la colonne « Note ». Réinscris un niveau : la note revient.
10. **Pratique → « Régler » → « Retirer » la cible qui porte des niveaux → « Enregistrer ».** Tu dois voir la question de
    l'assistant (« Retirer une cible », le nombre de niveaux et d'étudiant·es). « Annuler » : rien ne change, le réglage
    reste ouvert. Recommence et choisis « Retirer quand même » : la colonne disparaît du tableau ; ses inscriptions restent
    (la vue étendue les garde).
11. **Note finale.** Tu dois voir la note de qui a toutes ses cibles, « – » et « En attente : … » pour les autres.
    « Exporter la synthèse (CSV) », ouvre le fichier : la note, ou une case VIDE et « non constructible – Pas encore de
    note : les cibles « … » sont sans donnée. » **Jamais 0.**
12. **Menu → « Vue étendue »**, puis ouvre le tableau de notation : la même pratique, l'historique complet de chaque case
    (l'inscription annulée, barrée, avec sa raison). Reviens en vue simple : tout est tel que tu l'as laissé.
13. **Sur l'iPad, au doigt** : chaque bouton, chaque tuile, chaque case et les boutons des deux questions se touchent sans
    viser (46 px mesurés sous Chromium ; WebKit non vu).
14. **Une pratique « Par standards » que tu as créée en vue étendue** (avec des poids, une cible terminale, le second
    seuil) : ouvre-la en vue simple. Tu dois voir « Les poids de tes cibles ont été réglés en vue étendue : ils restent
    tels quels. » et « Un second seuil, réglé en vue étendue, peut plafonner la note. », et les mêmes notes que dans la
    vue étendue (« plafonnée » au besoin).
