# Rapport du lot `lot/deux-temps-modeles` — corrections de l'essai de Grégoire sur l'iPad (16 nov. 2026)

**Relais.** Branche `lot/deux-temps-modeles`, PR d'aperçu n° 23, non fusionnée. Consigne :
`plans de travail/CONSIGNE-2026-11-16-essai-ipad.md` (le relais de Cowork de 13 h 20, recopié tel quel). Arbre de
travail : `../labo-codex-deux-temps`. Build de l'aperçu : 1.248.2, `1116-1612`.
**Fait** : le défaut A, les retouches B.1 à B.7, les corrections 8 et 9, les trois vérifications du D (rien n'y est
changé). Vitest complet vert (11 875) ; le banc des deux parcours vert en portrait et en paysage ; trois break-tests,
trois rouges ; les 22 états de bulle relevés dans les deux orientations, tous tiennent.
**Reste** : la porte (`PORTES-TERRAIN-2026-11-16-essai-ipad.md`, cinq gestes ; Cowork publie l'artefact) ; les deux
constats du D qui attendent une décision (§3) ; la suite du relais de 15 h 48
(`CONSIGNE-2026-11-16-decouvrir-en-ligne.md` : « Découvrir » seul en ligne, l'interrupteur, la release).

---

## 1. Ce qui a été livré

| Demande | Ce qui est fait | Jugé par |
|---|---|---|
| **A.** « Découvrir » sur le deuxième groupe | À l'ouverture et à chaque reprise, il choisit le premier groupe de la démo (`GC_DEMO`) par le geste de la personne : la liste de l'en-tête et son `change`. Rien d'autre n'est écrit. | Banc : deuxième groupe monté et choisi, ouverture puis reprise. Break-test rouge. |
| **B.1** le triangle | Celui des sections (▼, tourné de 90° quand la liste est fermée), à leur taille mesurée : 12,8 px. Le triangle touché referme la liste. | Banc (taille comparée à celle des sections, cible de 44 px). |
| **B.2** bulle 2 | Les deux lignes de Grégoire. Une flèche va au point à l'écart, une autre à son nom. « A 84 % » : voir §2.1. | Sentinelle, banc. |
| **B.3** la fin | Posée par le moteur, d'après la définition (`objectifAtteint`) : l'objectif atteint en gras entre deux filets, puis la phrase de la suite, la dernière avant les boutons. | Sentinelle, banc. |
| **B.4** bulle 8 | La ligne est retirée. La bulle tient à 1180 × 820 : 578 px pour 695 (voir §2.3). Derrière elle, les sections du Cadre sont refermées (§2.4). | Banc. |
| **B.5** avant « Remplir » | Une seule flèche, vers le nom encadré ; après, elle laisse la place à celles des champs. | Banc (bulles 1, 2, 4 et 5). |
| **B.6** bulle 6 | Le nom du groupe est lu dans la liste de l'en-tête (« 601-999-DM · gr. 00002 »). | Sentinelle, banc. |
| **B.7** la poignée | Première bulle de chaque parcours, en petit et en gris, sous les lignes. Pas sur téléphone (§2.6). | Sentinelle, banc. |
| **8.** la bulle et la bande | Les deux bulles déclarent le nom de la bande et chacun de ses dix points comme ce qu'elles ne couvrent que faute de mieux. À la bulle 1, la flèche va à un point du groupe. | Banc à 820 × 1180, 1180 × 820 et **1180 × 740**. Deux break-tests rouges. |
| **9.** le « ; » | L'espace insécable devant « ; : ? ! », dans le moteur : toutes les bulles de tous les parcours. | Sentinelle (fonction pure), banc. |

**Pourquoi 1180 × 740.** À 1180 × 820, le banc ne voyait pas le défaut : la bulle tenait sous la bande. Sur l'iPad
couché, Safari garde ses barres et la page n'a qu'environ 740 px. Mesuré : dès 760 px de haut, la bulle 8 couvrait
sept points et le nom de la bande. C'est cette hauteur que le banc juge maintenant.

## 2. Ce que j'ai supposé

1. **« A 84 % » manquait pour une raison de code, pas de texte.** Les indices ne paraissent que si « Détails » est
   allumé, et ils sont calculés pour le groupe choisi à ce moment-là. Le parcours refermait le panneau sans éteindre
   le bouton : les deux pouvaient se désaccorder. Il passe maintenant par le bouton, et la bulle 2 attend l'indice
   avant de se montrer. La consigne n'est pas changée.
2. **L'ordre de la fin** : « Pour revoir une étape… » (maintenant vraiment en petit : 12,5 px, il était à la taille
   des notes), puis l'objectif atteint, puis la phrase de la suite. Le relais demandait cette dernière « juste
   au-dessus des boutons » et l'objectif juste avant elle : la ligne « Pour revoir » ne pouvait aller qu'au-dessus.
3. **Une bulle plus haute que l'écran utile s'élargit** (380 → 520 px). Retirer la ligne ne suffisait pas : la fin
   mise en forme reprenait la place (761 px pour 695), et les boutons passaient sous le bandeau de la démo. C'est
   une règle du moteur, pour toute bulle dans ce cas ; en portrait, rien ne change.
4. **Derrière la bulle 8 de « Découvrir », toutes les sections du Cadre sont refermées**, à l'écran seulement (la
   préférence de la personne n'est pas récrite). Le « Mode modification » de la capture venait de « Je regarde ».
   Conséquence : aucun astérisque rouge n'est visible derrière la ligne qui en parle.
5. **La bulle 3 de « Je regarde » n'a pas la flèche vers le nom de la section** : elle ne le nomme pas, et sa
   première ligne montre déjà l'aperçu.
6. **La poignée n'est pas dite sur téléphone** : la bulle n'y en a pas.
7. **« La fin de tous les parcours »** : la forme est dans le moteur. Seuls les deux parcours de ce relais déclarent
   un objectif ; les autres la recevront quand ils en auront un.

## 3. Les trois points du D (rien n'est changé)

**La capture de 12 h 59.** Oui, le formulaire garde ses valeurs après la remise à neuf : la page n'est pas
redessinée, alors que le cours a quitté les données (mesuré). Mais ce n'est pas ce que montre la capture : en
rouvrant « Je regarde », le formulaire est vidé. L'état de la capture se reproduit autrement, et exactement : quand
le moteur se croit **sous le zoom au pincement** (deux doigts comptés, ou la page un peu zoomée), « Remplir » remplit
les champs et les flèches suivent, mais la bulle n'est pas récrite. Elle garde son bouton « Remplir » jusqu'à ce que
le zoom soit levé (mesuré : la bulle passe alors à « Touche « Créer le cours » »). Fait : le mécanisme. Inférence :
c'est ce qui s'est passé à 12 h 59. *Issue : inscrire, si Cowork le retient.*

**« 1 évaluation en attente », « 3 évaluations en attente ».** Ce ne sont pas des évaluations qui attendent : c'est
ce qui manque au groupe pour que l'indice se calcule. Complétion demande 1 production évaluée, Performance en
demande 3 (le seuil de la pratique de la démo, mesuré). Le groupe neuf n'en a aucune : 1 − 0 et 3 − 0
(`afficherMetriquesGlobales`, js/tableau-bord-apercu.js).

**« Voir le parcours suivant », le modèle déjà fait.** Le modèle repart de sa première étape non faite. « Découvrir »
ayant choisi le premier groupe, c'est la bulle 6 (« D'un groupe à l'autre ») qui s'ouvre, avec « C'est fait : le
groupe-cours est créé ». Le groupe choisi, la bulle 7 est sautée (sa séance est déjà verrouillée) et la bulle 8
s'ouvre : « Objectif atteint ». Ce n'est pas une visite au sens du moteur, mais un novice peut s'y perdre : il
demande le parcours suivant et reçoit deux bulles de la fin d'un parcours qu'il a déjà fait. Depuis la correction A,
c'est le chemin ordinaire. *Issue : inscrire ; la réponse (offrir « Refaire », ou le modèle suivant) est à décider.*

## 4. Les hauteurs des bulles

Largeur 380 px, sauf mention. « a » : avant « Remplir » ; « p » : après.

| Parcours | Portrait (820 × 1180), disponible 1 055 à 1 139 | Paysage (1180 × 820), disponible 695 ou 779 |
|---|---|---|
| Découvrir 1 à 4 | 517 · 361 · 484 · 573 | 517 · 361 · 484 · 573 |
| Découvrir 5 à 8 | 330 · 450 · 534 · 761 | 330 · 450 · 534 · **578, large de 520** |
| Je regarde 1 à 3 | 527 a, 638 p · 306 a, 490 p · 391 a, 387 p | les mêmes |
| Je regarde 4 à 6 | 328 a, 512 p · 306 a, 516 p · 382 | les mêmes |
| Je regarde 7 et 8 | 328 a, 460 p · 606 | les mêmes |

Les 22 états tiennent dans les deux orientations, sans défiler. Les premières bulles ont pris 45 px (la poignée).

## 5. Les passages de tests

Un à la fois, au premier plan. Charge relevée avant chacun : de 1,8 à 6,8 ; mémoire libre de 65 à 81 %.

| Passage | Résultat |
|---|---|
| Vitest complet, état final | 930 fichiers, 11 875 essais, verts |
| Banc `parcours-je-regarde`, 820 × 1180 | 3 sur 3 |
| Banc `parcours-je-regarde`, 1180 × 820 | 3 sur 3 |
| Break-test A (`choisirLeGroupeDeLaDemo` retiré) | rouge : la bulle 1 s'ouvre sur le deuxième groupe |
| Break-test 8 (bulle 8 de « Je regarde ») | rouge : le nom et des points couverts |
| Break-test 8 (bulle 1 de « Découvrir ») | rouge en paysage |

Un rouge de mon lot, corrigé en chemin : une fonction du moteur passait le seuil de complexité (`designe`, 14 → 21) ;
la flèche vers le nom de la section a sa propre fonction, `designe` est revenue à 14.

**Non vérifié** : les autres bancs des parcours (`parcours-1-et-2`, `deux-temps-modelisation`, `deux-temps-modeles`,
`parcours-2-ma-classe` et les six autres) n'ont pas été rejoués. Trois changements du moteur les touchent : l'espace
insécable, la ligne de la poignée, la bulle qui s'élargit. Le verdict complet du relais de 15 h 48 les jugera avant
toute mise en ligne. Safari sur l'iPad : la porte.
