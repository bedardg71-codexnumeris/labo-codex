# Rapport du lot `lot/deux-temps-modeles` — « Découvrir » et « Mettre ta classe en place » (Je regarde), textes du 16 nov. (16 nov. 2026)

**Relais.** Branche `lot/deux-temps-modeles`, PR d'aperçu n° 23, non fusionnée. Consigne :
`plans de travail/CONSIGNE-2026-11-16-parcours-je-regarde.md` (le relais de Cowork, recopié tel quel). Arbre de travail :
`../labo-codex-deux-temps`. Build de l'aperçu : 1.248.2, `1116-1150`.
**Fait** : main (1.248.2, `5735b41e3`) fusionné dans la branche ; les parcours rouverts sur cette branche seulement ; les
seize bulles réécrites mot pour mot ; le panneau (quatre lignes, « Je regarde » / « Nous faisons ») ; « Remplir » ;
« Suricate Loyal » ; les règles a à e du moteur, chacune avec son break-test ; la sentinelle des textes ; le banc WebKit
à 820 × 1180.
**Poussé le 16 nov. après le redémarrage du Mac** (§6) : Vitest complet vert, le banc neuf vert en portrait et en
paysage, le banc de « Nous faisons » vert, le relevé en paysage pris.
**Reste** : la porte (`PORTES-TERRAIN-2026-11-16-parcours-je-regarde.md`, neuf gestes, cinq décisions ; Cowork publie
l'artefact). La bulle 8 de « Découvrir » ne tient pas en paysage (§6, décision 3.5). #1284 inscrit, non touché. Ni
fusion, ni release, ni verdict complet (par consigne).

---

## 1. Ce qui a été livré

| Demande | Où | Jugé par |
|---|---|---|
| Les huit bulles de « Découvrir », en lignes | `js/parcours-decouvrir.js` | sentinelle des textes ; banc WebKit, 820 × 1180 |
| Les huit bulles de « Je regarde » (deux états pour les bulles à « Remplir ») | `js/parcours-classe.js` | idem |
| Les quatre lignes du panneau ; « Je regarde » / « Nous faisons » côte à côte ; le nom du temps et l'état dessous | `js/assistance.js`, `css/parcours.css` | sentinelle du 12 nov. mise à jour ; banc WebKit |
| « Remplir » et sa consigne (les deux modèles, par les mots communs) | `js/parcours-classe.js` | sentinelle ; banc du modèle d'« Évaluer », 820 × 1180 |
| « Suricate Loyal » | `js/parcours-decouvrir.js` | sentinelle |
| a. l'objectif à la première bulle | `js/parcours-moteur.js` (`objectif`, sur la définition) | break-test rouge |
| b. la bonne section, elle seule ; le défilement visible ; la bulle ensuite | moteur (`section`, `defilerVers`, `est-en-attente`) ; `ouvrirBlocModele` | deux break-tests rouges |
| c. le nom de la section encadré, lu dans la page | moteur (`sectionDe`, `marquerLieu`) | break-test rouge |
| d. le triangle du compteur | `css/parcours.css` | break-test rouge |
| e. la ligne qui confirme | moteur (`confirme`) | break-test rouge |
| f. une page par bulle | relevé au §3 | banc WebKit (aucune bulle en pages) |

Les parcours sont rouverts **sur cette branche seulement** (`PARCOURS_OUVERTS = true`). Côté tests, ce que `RELAIS.md`
décrivait : le harnais ne rouvre plus les parcours en mémoire, les deux bancs de la fermeture sont retirés. La porte de
repli de l'accueil (« Tu enseignes ? ») n'a pas été resserrée : le verrou reste dans le code, et sa valeur se décidera à
la fusion.

## 2. Ce que j'ai supposé

1. **Après « Remplir », la ligne « Regarde l'exemple se remplir… » reste, grisée**, au-dessus des lignes neuves : c'est
   la règle du 14 nov., et le relais ne dit pas de la retirer. (Décision 3.2 de la porte.)
2. **Le gras du panneau** : « 1. J'explore », « 2. Je regarde », « 3. Nous faisons », « 4. Je fais, ». Le relais donnait
   les phrases, pas le gras. (Décision 3.1.)
3. **« Pour revoir une étape, touche « 8 sur 8 ». »** est posée par le moteur à la dernière bulle de tout parcours, en
   phrase, pas en ligne de liste. Elle paraît donc aussi à la fin de « Découvrir », où le relais ne l'écrivait pas.
4. **Les bulles 5 à 8 de « Découvrir » n'ont pas de ligne « C'est fait »** : la 5 s'ouvre sur sa première ligne de
   liste (« Tu viens de repérer… »), les 6 à 8 sur « Tu es dans… », telles que le relais les écrit.
5. **« Nous faisons » ne déclare pas encore ses sections** : les règles b et c ne s'y appliquent pas. Ses étapes
   s'ouvrent comme avant. À faire quand ses textes seront revus avec Grégoire. *Issue : inscrire et continuer.*
6. **« Commencer / Reprendre / Refaire »** restent sur les cartes sans deux temps (« Découvrir » et les six autres).

## 3. Ce que j'ai corrigé d'après l'écran

- **« Étudiant·es » → « Groupe d'étudiant·es »** : c'est le nom que porte la section du Cadre. Le moteur le lit dans la
  page ; rien n'est recopié.
- **Bulle 3 de « Découvrir »** : j'ai ajouté « Tu es dans « Suivi », à l'onglet « Profils ». » (le menu passe de
  « Groupe » à « Profils »). Bulle 4 : rien, on reste dans « Profils ». (Décision 3.3.)
- **« 2 sur 3 »** tient : l'application a trois niveaux (préventif est le deuxième).
- **« Présences », « Groupe », « Préparer », « Mon matériel », « Trimestre »** : les noms du relais sont ceux du menu.
- **Le halo du nom de section** prenait toute la largeur de la tête : resserré sur le nom, comme une entrée du menu.
- **Deux flèches retirées dans « Découvrir »** (bulle 7, vers « Ton matériel existe déjà ? » ; bulle 8, vers la barre
  d'étapes) : à 1180 × 900, la bulle en lignes, plus haute, ne pouvait que couvrir ce qu'elle montrait.
- **Bulle 8 de « Je regarde »** : haute de 585 px, elle se posait sur la bande et cachait sept des dix points. L'étape
  amène maintenant la bande sous l'en-tête ; la bulle tient dessous (jugé au banc : dix points visibles, aucun couvert —
  ⚠ cette dernière assertion n'a pas pu être rejouée après son écriture, voir §5).

### Deux défauts trouvés et corrigés en chemin (mon propre lot)

- **La section fondait ses champs.** En ajoutant la section à ce que la bulle évite, ses champs s'y fondaient et la
  bulle pouvait les couvrir (rouge au banc de la modélisation, 1180 px). La section est maintenant un critère second :
  elle ne départage que des places qui couvrent aussi peu ce que la bulle désigne. Trois essais purs le verrouillent.
- **Refermer les autres sections écrivait hors de la démo.** La bascule de la page retient l'état des sections dans une
  préférence de la personne (`etatsAccordeonsV2`) : le banc du confinement l'a vu. Le modèle plie et déplie maintenant à
  l'écran seulement. **Source tarie ; aucun stock** (la clé n'a été écrite que sur mon poste de test).

## 4. Les hauteurs à 820 × 1180 (règle f)

**Aucune bulle ne dépasse une page à 820 px de large** : aucune ne se tourne en pages, aucune ne fait défiler son texte.
Bulle large de 380 px ; hauteur disponible : 1 055 à 1 139 px.

| Parcours | Bulle | Hauteur |
|---|---|---|
| Découvrir | 1 · 2 · 3 · 4 | 472 · 340 · 454 (avant l'ajout du lieu) · 573 |
| Découvrir | 5 · 6 · 7 · 8 | 330 · 450 · 534 · **786** |
| Je regarde | 1 avant / après | 482 / 593 |
| Je regarde | 2 avant / après | 306 / 490 |
| Je regarde | 3 avant / après | 391 / 387 |
| Je regarde | 4 avant / après | 328 / 512 |
| Je regarde | 5 avant / après | 306 / 516 |
| Je regarde | 6 | 382 |
| Je regarde | 7 avant / après | 328 / 460 |
| Je regarde | 8 | 585 |

Deux limites vues sur les captures, qui ne sont pas des dépassements :
- **Bulle 5 de « Je regarde », remplie** : la section prend tout l'écran ; la bulle, posée en bas à gauche pour laisser
  libres le nom de la section et « Créer le groupe-cours », cache deux des quatre listes dont parlent ses lignes (le
  groupe, l'enseignant). La poignée la déplace. (Geste 2.8 et décision 3.4 de la porte.)
- **En paysage (1180 × 820)**, non mesuré : « Poser ton cadre » (786 px) ne tiendra probablement pas sans que son texte
  défile. Supposition.

## 5. ⚠ Ce qui n'a pas été vérifié, et pourquoi

Vers 10 h 50, pendant un passage Playwright, le Mac s'est mis en surcharge : charge moyenne à 193, 212 Mo de mémoire
libre, 6,5 Go compressés, swap à 4,1 Go sur 5,1, `kernel_task` affiché à 205 Go, WebKit qui ne démarrait plus
(« navigateur fermé » dès l'ouverture). Aucun de mes processus n'en était la cause visible. J'ai arrêté tous les
passages, comme le veut la règle du 13 nov. (« arrêt si la mémoire baisse »).

| Mesure | État |
|---|---|
| Vitest complet | **Non rejoué sur l'état final.** Dernier passage complet : avant les corrections (54 rouges attendus, tous traités depuis). Ensuite, seulement les huit sentinelles touchées, vertes (dont la neuve : 37 essais). |
| Banc neuf `parcours-je-regarde` (3 essais) | Vert, plusieurs fois. **Pas rejoué** après l'ajout de l'assertion « dix points visibles » à la bulle 8. |
| `parcours-1-et-2`, `deux-temps-modelisation` (17 essais) | Verts sur l'état d'avant `amener` (qui ne touche que la bulle 8 de « Je regarde »). |
| `deux-temps-modeles` B (820 × 1180) | Vert après `amener`. |
| `gel-etape-7`, `en-tete-epure`, `assistance-refus`, `registre-des-parcours` | Verts. |
| `parcours-2-ma-classe` (« Nous faisons ») | **Non jugé** : l'application ne démarrait plus (la machine). |
| `parcours-8-commentaires` | **Non rejoué** (seul l'appel du harnais y change). |
| Relevé en paysage, 1180 × 820 | **Non pris.** |
| Break-tests a à e | Six mutations, six rouges, toutes rétablies. |
| Break-test de la sentinelle des textes | **Non fait** (annoncé dans son en-tête : à faire ou à retirer). |

**Trouvaille étrangère** (issue : inscrire et continuer) : `pied-de-page-et-assistance`, à 820 px, sombre et clair,
échoue sur « version et « Nouveautés » sur la même ligne » (26 px d'écart) **sans mes changements aussi** (mesuré sur
le commit de fusion, mes fichiers rangés). Elle vient de main ou de la branche d'avant, pas de ce lot.

## 6. Après le redémarrage du Mac (16 nov., 11 h 37 à 11 h 55)

Un passage à la fois, au premier plan, un seul navigateur (`--workers=1`). Le §5 dit l'état d'avant ; celui-ci le
remplace pour les lignes qu'il nomme.

| Heure | Charge (1 min) | Mémoire libre | Passage | Résultat |
|---|---|---|---|---|
| 11 h 37 | 187 (quatre minutes après le démarrage) | 85 % | aucun : attente | — |
| 11 h 41 | 5,06 | 85 %, swap à zéro | Vitest complet | 11 869 verts, **1 rouge, de ce lot** (voir dessous) |
| 11 h 45 | 4,57 | 85 % | banc neuf, 820 × 1180 | 3 sur 3 |
| 11 h 46 | 3,87 | 86 % | `parcours-2-ma-classe` (« Nous faisons ») | 5 verts, 1 sauté (les captures de l'iPhone, hors variable) |
| 11 h 47 | 3,97 | 86 % | banc neuf, 1180 × 820 | **1 rouge, de ce lot** (voir dessous) |
| 11 h 48 | 3,44 | 86 % | banc neuf, 1180 × 820, rejoué | 3 sur 3, relevé pris |
| 11 h 49 | 3,48 | 86 % | banc neuf, 820 × 1180, rejoué | 3 sur 3 |

La charge est remontée à 36 pendant Vitest (ses processus), puis redescendue sous 5 avant le passage suivant.

**Deux rouges, tous deux dans le banc neuf, corrigés (mon propre lot) :**
- **Une pause fixe de trop** (`sentinelle-pauses-apres-ouverture` : 619 pour un plafond de 618). `suivreLOuverture`
  attendait 300 ms ; il attend maintenant vingt images relevées, bulle montrée.
- **Une course à la bulle 3**, vue en paysage seulement : le moteur retire le halo du nom de section au changement
  d'étape et le repose au premier passage de la suivante ; le banc lisait entre les deux. L'assertion attend maintenant
  le halo. Ce n'est pas un défaut de l'écran : pendant ce temps la bulle est cachée elle aussi.

**Le break-test de la sentinelle des textes est fait** : « Sa pondération » → « La pondération », rouge (1 sur 37) ;
« de 93 % ou plus » → « et plus », rouge (1 sur 37) ; rétablis, 37 verts.

**Les hauteurs en paysage (1180 × 820)**, bulle large de 380 px, hauteur disponible 695 ou 779 px selon l'écran :

| Parcours | Bulle | Hauteur | Tient |
|---|---|---|---|
| Découvrir | 1 · 2 · 3 · 4 | 472 · 340 · 484 · 573 | oui |
| Découvrir | 5 · 6 · 7 | 330 · 450 · 534 | oui |
| Découvrir | **8, « Poser ton cadre »** | **786 pour 695** | **non : son texte défile** (elle ne se tourne pas en pages) |
| Je regarde | 1 à 8, avant et après « Remplir » | 306 à 593 pour 779 (695 à la 7, avant) | oui |

La supposition du §4 est donc mesurée : une seule bulle dépasse, de 91 px. Rien n'est changé : raccourcir ses lignes,
ce sont des mots que l'enseignant·e lit (décision 3.5 de la porte).

**Non vérifié** : `parcours-8-commentaires`, `parcours-1-et-2` et `deux-temps-modelisation` n'ont pas été rejoués
après le redémarrage (jugés avant, §5) ; aucune bulle relue à 390 px ; Safari sur l'iPad (la porte).
