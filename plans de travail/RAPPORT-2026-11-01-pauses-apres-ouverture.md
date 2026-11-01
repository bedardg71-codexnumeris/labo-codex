# Rapport – Après une ouverture, attendre l'application, pas un délai (1er novembre 2026)

> Écrit par Claude Code sur la branche `lot/pauses-apres-ouverture`, non fusionnée (consigne : après la mise en ligne du soir et après `lot/verification-plus-rapide`).
> Consigne : `plans de travail/CONSIGNE-LOT-2026-11-01-pauses-apres-ouverture.md`.

## En tête

**Le gain existe sur le Mac et pas sur GitHub.** Sur le Mac, 12 specs passent de 332 s à 229 s (−31 %). Sur GitHub, 861 pauses disparaissent, mais la durée cumulée des essais ne baisse pas : la machine y met autant de temps à être prête que la pause en attendait.

**La passe du 1er nov. sur la branche est rouge au verdict (run 41311827410) : 11 rouges hors des listes.** Aucune ne vient de ce lot (voir « Les intermittentes »). Elles comptent contre la bascule #1114, comme celles de la passe de référence.

**Une pause est revenue dans trois specs.** La contre-épreuve a montré que le remplacement affaiblissait ce qu'elles vérifient. Détail plus bas.

## Le gain, en gestes et en minutes

**Écrit** : 299 pauses remplacées par `attendreApplication(page)`, dans 174 specs, et 3 pauses gardées. Aucune assertion modifiée.

**À l'exécution, sur GitHub** (une passe complète de chaque côté, 16 machines) :

| Sans les reprises | Avant (41303021951) | Après (41311827410) |
|---|---|---|
| Pauses après une ouverture | 862, soit 21,6 min | **0** |
| Toutes les pauses | 2 928, soit 60,9 min | **2 067, soit 39,3 min** |
| Évaluations de page | 39,9 min | 51,6 min |
| Attentes de fonction | 12,7 min | 20,4 min |
| Durée cumulée des essais | 237,2 min | 239,2 min |

Mesures par `scripts/mesurer-verification.mjs`, sauf les évaluations, les attentes et la durée sans reprises, lues par un reporter jetable sur les mêmes rapports. Avec les reprises, la durée cumulée passe de 265,2 à 266,6 min, et les pauses de 3 047 à 2 136.

**Le script compte 899 pauses après ouverture, reprises comprises (22,9 min), là où la consigne en citait 897 (22,8 min).** L'écart vient de la façon de reconnaître « suit une ouverture ». Le script compte maintenant ce chiffre, et il donne aussi les 30 sites les plus lourds.

**Limite** : la passe « après » précède le commit `3390fb84`, qui rend 3 pauses de 500 ms. L'effet est de l'ordre de 1,5 s.

De bout en bout, GitHub passe de 30 min à 27,5 min, et le plus long morceau de 28,8 à 26,6 min. **Je ne l'attribue pas au lot** : d'un run à l'autre, les machines diffèrent. Le `Navigate` d'une même spec, qui précède tout code modifié, a pris 2,0 s dans un run et 3,3 s dans l'autre.

### Pourquoi GitHub ne gagne rien

Sonde sur `attendreApplication`, médianes en millisecondes :

| Étape | Mac (22 ouvertures) | GitHub (75 ouvertures) |
|---|---|---|
| `page.goto` | 400 | 1 710 |
| Attente du drapeau de migration | 88 | 653 |
| Évaluation finale (dont les deux images) | 55 (8 + 23) | 824 (380 + 218) |
| `db.flush` | 0 | 0 |
| **Coût de l'attente** | **~0,14 s** | **~1,48 s** |

La pause remplacée durait ~1,5 s en moyenne. **« Prête en un tiers de seconde » est vrai sur le Mac seulement.**

**Piste non retenue** : retirer les deux images gagnerait ~8 min cumulées sur GitHub, soit moins d'une minute de bout en bout (inférence : réparties sur 16 machines). Elles servent à laisser finir les premiers rendus, et elles coûtent ~30 ms sur le Mac. Je les garde.

### Sur le Mac

**Mesuré sur 12 specs**, en ordre avant, après, après, avant, une spec à la fois : **331,9 s → 229,1 s, −31 %, 0 rouge**. Une session voisine tournait à côté. L'échantillon vient des specs modifiées : ce pourcentage ne s'étend pas à la suite.

**Estimé sur la suite** : 20,7 min de pauses retirées, moins 857 attentes à 0,14 s (2 min), soit **~19 min de moins, de 97,6 à ~79 min**. La première passe complète du Mac après la fusion donnera la mesure : `node scripts/mesurer-verification.mjs`.

## Les trois pauses gardées

`evaluation-chargement`, `profil-etudiant-chargement` et `trimestre-v2-chargement` vérifient qu'aucune erreur ne survient au chargement. Une absence d'erreur n'a pas de signal à attendre : **le délai est ce que l'essai observe**.

| Erreur injectée dans l'initialisation différée de `js/init-inline.js` (500 ms après `DOMContentLoaded`) | Résultat |
|---|---|
| Avec `attendreApplication` seul | **vert aux trois : le test ne voit plus l'erreur** |
| Avec la pause de 500 ms en plus | rouge aux trois |

Elles portent le marqueur `pause-gardee :` et leur motif. Le plafond du cliquet passe de 901 à 904 : c'est le compte réel, avant toute fusion.

## La preuve

### Une fois chacune, sur le Mac

174 specs jouées une à une, sans reprise : **630 verts, 6 rouges, 8 sautés, 49,7 min**.

- 4 rouges sont les cas connus de `temoin-enregistrement-lot-b` (baseline du Mac).
- 2 rouges (`codex-1012-ancien-zip-par-la-case`, cas 5 et 6) venaient du rappel de sauvegarde, qui part 1,5 s après l'ouverture et couvrait la case. Le banc désactive maintenant les rappels : **c'est le seul changement de préparation au-delà du remplacement**. Rejouée : 8 sur 8. Le rappel lui-même reste jugé par `lot-i-rappel-mene-au-codex`.
- Les 3 specs `*-chargement`, rejouées après le retour de leur pause : vertes.

### La répétition, sur GitHub

Trois tours sans reprise, sur une branche jetable supprimée depuis (run 41314503945) : les 174 specs modifiées et 7 specs suspectes, soit **689 essais et 2 067 exécutions. 657 essais sont verts aux trois tours.** Les 32 autres :

| Statut | Essais | Détail |
|---|---|---|
| Connus de la baseline Linux | 7 | |
| Intermittents de la baseline Linux | 12 | |
| Hors listes, déjà rouges dans la passe de référence | 6 | `lot-i-bis-la-case` (2), `temoin-enregistrement-lot-b` (4) |
| Hors listes, spec non modifiée | 6 | `annotation-deux-doigts-page` (2), `annotation-formes-fermees-polygone` (2), `comptes-erreurs-stock-1142` (2) |
| Hors listes, spec modifiée | 1 | `profil-rangee-1151` |

### Les intermittentes

**Aucune intermittente neuve n'est attribuable au lot.** Le seul candidat dans une spec modifiée était `profil-rangee-1151` (« chaque bouton ouvre sa section »), en dépassement 2 fois sur 3.

Comparer deux runs ne tranchait pas : les machines diffèrent. Je l'ai donc rejoué en alternance sur une même machine, 24 tours (run 41322412256) :

| Variante | Rouges | Médiane | Maximum |
|---|---|---|---|
| Pause de 1,2 s (sans le lot) | 1 sur 12 | 21,2 s | 31,5 s |
| `attendreApplication` | 0 sur 12 | 21,1 s | 22,7 s |

Cet essai frôle le plafond de 30 s sur une machine lente, avec ou sans le lot : il prenait déjà 28,3 s dans la passe de référence.

**Limite** : sur 2 essais et 24 tours, l'écart est d'une rougeur. Cela écarte un effet franc du lot, pas un effet minime.

**Les 6 essais de specs non modifiées** ne peuvent pas venir du remplacement : ni leur code ni celui de l'application n'ont changé. Une charge différente de la machine reste possible (inférence).

**Devenues stables ?** 3 intermittentes de la liste Linux sur les 15 jouées restent vertes aux trois tours : `comptes-erreurs-stock-1142` (« la réparation n'écrit que… ») et `temoin-enregistrement-lot-b` à 360 px (clair, sombre). Trois tours ne suffisent pas à conclure ; je ne les retire pas. Le juge signale aussi 2 connues redevenues vertes dans la passe complète : `nettoyage-sans-perte-892` et `statut-incomplet-travail-en-cours`. Elles restent listées : la règle de classement s'applique.

### Les contre-épreuves

Une mutation de `js/` par spec, jouée sans reprise, puis restaurée et contrôlée par somme de contrôle :

| Spec (famille) | Ce qui est cassé | Résultat |
|---|---|---|
| `solo-suit-le-reglage-1117` (grilles) | le réglage SOLO ignoré | 2 rouges |
| `trimestres-1018` (trimestres) | l'action « Clore » | 1 rouge |
| `source-unique-codes` (annotation) | la phrase de l'engrenage | 1 rouge |
| `suppression-par-trimestre-683` (suppression) | la clé, puis `estRessourceSupprimee` | 1, puis 2 rouges |
| `signal-consignes-1010` (évaluation) | le bandeau | 1 rouge |
| `type-grille-lot1` (formulaire) | le menu du type | 1 rouge |
| `repertoires-grilles-T1` (bibliothèque) | le titre « Mes dossiers » | 1 rouge |
| `bandeau-maj-chargement` (version) | le repère vu, puis la condition inversée | 1, puis 4 rouges |
| `triptyque-seme-produit-une-note` (semis) | le semis de l'échelle | 3 rouges |
| `codex-1012-ancien-zip-par-la-case` (codex) | le message du bilan | 1 rouge |
| `*-chargement` (3 specs) | l'initialisation différée | rouges, une fois la pause rendue |

**Condition qui ne vient jamais** : le drapeau de migration n'est plus posé, et `type-grille-lot1` échoue par dépassement à 30 s. Elle ne passe pas.

**Le cliquet** : une pause ajoutée après un `goto` le fait rougir (la faute nommée, et le plafond dépassé) ; retirée, il reverdit.

**Un raté du banc, corrigé** : une mutation refusée a laissé `js/init-inline.js` modifié quelques minutes, sans commit. Le fichier est restauré depuis Git, et les trois exécutions faites pendant ce temps ont été rejouées.

## Pour le lot suivant : les pauses restantes

Sur GitHub, sans les reprises : **2 067 pauses, 39,3 min**. Les 30 sites les plus lourds en font 21,8.

| Site | Nombre | Min | Site | Nombre | Min |
|---|---|---|---|---|---|
| `lot-e3-creer-ou-modifier:32` | 98 | 1,40 | `grille-critere-ajoute-enregistrer-957:32` | 39 | 0,68 |
| `lot-e1-conception-creer-ou-modifier:30` | 84 | 1,28 | `cartouche-copie-evaluee-fait-foi-946:125` | 11 | 0,66 |
| `evaluation-961-retroaction-ne-suit-plus-les-niveaux:107` | 21 | 1,25 | `bareme-3-evaluer:95` | 11 | 0,66 |
| `bibliotheques-menu-1147:26` | 62 | 1,25 | `bibliotheque-deux-colonnes-1157:51` | 21 | 0,55 |
| `bibliotheques-menu-cadre-1148:26` | 55 | 1,08 | `compte-erreurs-autre-copie-1142:122` | 9 | 0,54 |
| `chaines-etapes-1149-lot-3b:24` | 108 | 1,01 | `note-remise-1173:119` | 9 | 0,54 |
| `lot-e2-cadre-creer-ou-modifier:32` | 63 | 0,91 | `bibliotheque-deux-colonnes-1158:52` | 20 | 0,52 |
| `bibliotheque-deux-colonnes-1156:56` | 36 | 0,90 | `planif-menu-vue:47` | 34 | 0,52 |
| `bibliotheque-liste-1159:48` | 45 | 0,90 | `bibliotheque-deux-colonnes-1154:55` | 20 | 0,51 |
| `evaluation-959-neutralite-chargeur:102` | 14 | 0,84 | `ouverture-sans-geste-981-983:66` | 5 | 0,51 |
| `ecraser-homonyme-employe-967:25` | 54 | 0,83 | `solo-suit-le-reglage-1117:25` | 30 | 0,47 |
| `planif-menu-vue:49` | 34 | 0,77 | `1007-codex-a-part-avant-suppression:85` | 7 | 0,41 |
| `bibliotheque-deux-colonnes-1155:50` | 30 | 0,73 | `presences-lot-d-enregistrement:61` | 13 | 0,37 |
| `profil-rangee-1151:29` | 51 | 0,68 | `statut-incomplet-travail-en-cours:123` | 9 | 0,34 |
| `chaines-etapes-1149:26` | 29 | 0,32 | `planif-menu-vue:60` | 34 | 0,34 |

**Une leçon pour ce découpage** : un gain se mesure ici sur le Mac, pas sur GitHub. Et une pause qui précède un constat d'absence doit garder sa fenêtre : à contre-éprouver avec une cause tardive, pas seulement une cassure directe.

## Trouvailles hors lot

| Trouvaille | Issue |
|---|---|
| `profil-rangee-1151` frôle le plafond de 30 s sur GitHub | inscrite, rattachée à #1114 |
| `annotation-deux-doigts-page` et `comptes-erreurs-stock-1142` rougissent sous Linux, hors listes | inscrites, rattachées à #1114 |

Rien de corrigé ici : la règle de classement de la baseline s'applique.

## Ce qui reste à faire

1. **Après la mise en ligne du soir et la fusion de `lot/verification-plus-rapide`** : rebaser, fusionner.
2. **À la première passe complète du Mac qui suit** : `node scripts/mesurer-verification.mjs`, et remplacer ici et dans le rapport de la durée les chiffres estimés du Mac.

## Suppositions nommées

- **La répétition sur une branche jetable.** Le fichier de GitHub n'a pas de réglage de répétition, et un run sur la branche du lot aurait annulé celui en cours. J'ai vérifié que les pushs de branche ne publient rien : aucun déploiement ni statut Netlify sur le commit `9c157c3f`. Trois branches `essai/pauses-*` ont servi, supprimées depuis, jamais fusionnées.
- **Le garde-fou de push n'a pas jugé deux de ces pushs**, faute de `node_modules` dans leur dossier. Quand il a jugé, il a refusé 3 rouges : j'ai changé l'essai au lieu de le contourner.
