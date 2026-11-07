# Rapport – Les 30 pauses les plus lourdes : attendre ce que l'essai a besoin de voir (2 et 6 novembre 2026)

> Écrit par Claude Code sur la branche `lot/pauses-les-plus-lourdes`, partie de `lot/pauses-apres-ouverture` (`3a29ef9a`).
> Consigne : `plans de travail/CONSIGNE-LOT-2026-11-01-pauses-les-plus-lourdes.md`. Commits du lot : `39a97e45`, `3cb85bab`, `aef3a3e9`.
> Travail du 2 nov., interrompu par deux saturations du Mac ; mesure finie le 6 nov. Le nom du fichier garde la date du 2 nov. : le commentaire du cliquet y renvoie.

## En tête

**Sur le Mac, les 27 specs touchées passent de 2 007 s à 1 670 s (−16,8 %), chacune jouée seule.** Dans la passe complète, elles pèsent **1 616 s, soit 26,9 min** : 54 s de moins que leur « après » joué seul, 391 s (6,5 min) de moins que leur « avant » joué seul. Le gain de ~5,6 min ne se perd donc pas dans la passe ; il ne s'y isole pas non plus, faute d'une passe complète « avant » dans les mêmes conditions (détail : « La mesure sur la passe complète », plus bas).

**Un défaut de l'attente trouvé par la mesure du 6 nov., corrigé** : elle attendait la minuterie qui efface le témoin « Enregistré », et `statut-incomplet` ralentissait de 11,6 s. Il gagne maintenant 6,6 s.

**29 des 30 sites sont traités ; `profil-rangee-1151` sort du lot.** Ses attentes le rendaient plus rouge sur GitHub (6 et 7 sur 16, contre 2 sur 16), cause non trouvée : la spec est rendue à sa base.

**Aucune assertion touchée. 69 pauses gardées** devant un constat d'absence, chacune avec son motif. Le cliquet passe de 904 à 692.

## Les 30 sites

« Attente » : la pause devient `attendreRepos(page)` (`tests/integration/harness/attendre-repos.js`). « Gardée » : elle précède un constat d'absence et garde sa fenêtre, marqueur `pause-gardee :`. Plusieurs sites sont dans une aide appelée par plusieurs essais : l'aide attend, et les appels qui précèdent un constat d'absence gardent une pause.

| Site (rapport du 1er nov.) | Cas | Pauses gardées dans la spec |
|---|---|---|
| `lot-e3-creer-ou-modifier:32` | attente | 18 |
| `lot-e1-conception-creer-ou-modifier:30` | attente | 9 |
| `evaluation-961-retroaction-ne-suit-plus-les-niveaux:107` | attente, sauf la branche « aucune question à l'ouverture » | 1 |
| `bibliotheques-menu-1147:26` | attente | 0 |
| `bibliotheques-menu-cadre-1148:26` | attente | 0 |
| `chaines-etapes-1149-lot-3b:24` | attente | 7 |
| `lot-e2-cadre-creer-ou-modifier:32` | attente | 14 |
| `bibliotheque-deux-colonnes-1156:56` | attente | 0 |
| `bibliotheque-liste-1159:48` | attente | 0 |
| `evaluation-959-neutralite-chargeur:102` | **gardée** : ouvrir n'écrit rien | 1 |
| `ecraser-homonyme-employe-967:25` | attente | 7 |
| `planif-menu-vue:49`, `:47`, `:60` | attente | 0 |
| `bibliotheque-deux-colonnes-1155:50` | attente | 0 |
| `profil-rangee-1151:29` | **hors lot**, rendue à sa base | – |
| `chaines-etapes-1149:26` | attente | 3 |
| `grille-critere-ajoute-enregistrer-957:32` | attente | 2 |
| `cartouche-copie-evaluee-fait-foi-946:125` | **gardée** : aucun chargeur ne pose la cartouche | 1 |
| `bareme-3-evaluer:95` | attente | 0 |
| `bibliotheque-deux-colonnes-1157:51` | attente | 2 |
| `compte-erreurs-autre-copie-1142:122` | **gardée** : A garde son compte après le passage à B | 1 |
| `note-remise-1173:119` | **gardée** : les recalculs différés ne touchent pas la note remise | 1 |
| `bibliotheque-deux-colonnes-1158:52` | attente | 0 |
| `bibliotheque-deux-colonnes-1154:55` | attente | 0 |
| `ouverture-sans-geste-981-983:66` | **gardée** : une ouverture n'écrit rien, sans signal de fin | 1 |
| `solo-suit-le-reglage-1117:25` | attente | 1 |
| `1007-codex-a-part-avant-suppression:85` | attente | 0 |
| `presences-lot-d-enregistrement:61` | attente | 0 |
| `statut-incomplet-travail-en-cours:123` | attente | 0 |

Comptes relus le 6 nov. dans les specs de `aef3a3e9` (`grep pause-gardee`) : 69 au total.

### Deux défauts de l'attente, corrigés en chemin

- **Le pouls sans fin de la flèche didactique** : WebKit y relance une transition de 200 ms à chaque image. L'aide ignore cette animation, qui ne finit jamais.
- **Le défilement doux** (`js/grilles.js:1308`) : l'aide attend désormais 100 ms sans `scroll`.

- **Le témoin « Enregistré »**, corrigé le 6 nov. pendant la mesure : `statut-incomplet` **ralentissait** de 11,6 s (37,9 → 49,4 s). Avec un horizon de 2 s, l'aide attendait aussi la minuterie de 2 s qui efface le témoin, posée après l'enregistrement : 3,5 s par appel au lieu des 2,2 s de la pause (sondé : `temoin-enregistrement.js:160`). Sa doc l'excluait, son code non. L'aide ne l'attend plus jamais. Seules 4 specs ont un horizon ≥ 2 s (statut-incomplet, 961, bareme-3, 1007) : rejouées, remesurées, et contre-éprouvées de nouveau (4 cassures directes rouges, la cause tardive de 961 rouge). `statut-incomplet` gagne maintenant 6,6 s ; les trois autres ne bougent pas.

Aucun rappel ni animation n'a été neutralisé dans le banc pour ce lot.

## Le gain, sur le Mac

Chaque spec seule, sans reprise, en ordre avant, après, après, avant. « Avant » = la spec à `503ab091` ; « après » = celle du lot. Seule la spec change : l'aide du banc est celle du lot dans les deux cas. Script : `plans de travail/outils-pauses-les-plus-lourdes/mesurer.sh` ; totaux : `totaliser.awk`.

| Spec | Avant (s) | Après (s) | Gain (s) |
|---|---|---|---|
| `1007-codex-a-part-avant-suppression` | 76,2 | 65,9 | 10,3 |
| `bareme-3-evaluer` | 77,3 | 62,8 | 14,5 |
| `bibliotheque-deux-colonnes-1154` | 45,5 | 34,9 | 10,7 |
| `bibliotheque-deux-colonnes-1155` | 65,9 | 50,1 | 15,7 |
| `bibliotheque-deux-colonnes-1156` | 78,0 | 59,4 | 18,6 |
| `bibliotheque-deux-colonnes-1157` | 43,2 | 32,2 | 11,0 |
| `bibliotheque-deux-colonnes-1158` | 50,3 | 36,3 | 14,0 |
| `bibliotheque-liste-1159` | 76,1 | 66,8 | 9,3 |
| `bibliotheques-menu-1147` | 87,1 | 56,1 | 31,0 |
| `bibliotheques-menu-cadre-1148` | 75,8 | 54,0 | 21,8 |
| `cartouche-copie-evaluee-fait-foi-946` | 60,5 | 61,9 | -1,4 |
| `chaines-etapes-1149-lot-3b` | 72,0 | 66,2 | 5,8 |
| `chaines-etapes-1149` | 27,4 | 23,8 | 3,7 |
| `compte-erreurs-autre-copie-1142` | 59,0 | 59,3 | -0,2 |
| `ecraser-homonyme-employe-967` | 56,3 | 36,2 | 20,0 |
| `evaluation-959-neutralite-chargeur` | 117,5 | 114,4 | 3,1 |
| `evaluation-961-retroaction-ne-suit-plus-les-niveaux` | 225,7 | 225,3 | 0,4 |
| `grille-critere-ajoute-enregistrer-957` | 46,2 | 32,5 | 13,6 |
| `lot-e1-conception-creer-ou-modifier` | 86,9 | 53,4 | 33,5 |
| `lot-e2-cadre-creer-ou-modifier` | 63,2 | 43,8 | 19,4 |
| `lot-e3-creer-ou-modifier` | 107,7 | 75,2 | 32,5 |
| `note-remise-1173` | 73,2 | 73,4 | -0,2 |
| `ouverture-sans-geste-981-983` | 56,6 | 56,5 | 0,1 |
| `planif-menu-vue` | 146,3 | 120,6 | 25,6 |
| `presences-lot-d-enregistrement` | 59,9 | 55,4 | 4,5 |
| `solo-suit-le-reglage-1117` | 35,6 | 22,4 | 13,2 |
| `statut-incomplet-travail-en-cours` | 37,7 | 31,2 | 6,6 |
| **Total, 27 specs** | **2 007,1** | **1 669,9** | **337,2** |

**Écarté** : le premier « avant » de 1156 (528,9 s, 3 dépassements), joué le 2 nov. pendant la première saturation.

**Conditions.** Les 16 premières specs le 2 nov., les 11 dernières le 6 nov. au matin, l'app Claude, Chrome et Keynote quittés (Keynote est resté chargé sans fenêtre, inactif, ≈ 475 Mo). Relevé minute par minute : `resultats/surveillance-2026-11-06.log`. Le relevé n'a aucun trou pendant les passages retenus : la mémoire libre ne descend pas sous 40 %, le swap reste à 213-221 Mo. **Quatre passages jetés le 6 nov.** : ceux de `lot-e2`, faits entre 07:15 et 07:25, parce que le Mac est entré en veille d'inactivité à 07:17:19 sur batterie (`pmset -g log`) ; deux d'entre eux ont rougi par dépassement. Rejouée sous `caffeinate -i`, sur secteur, comme toute la suite de la mesure.

**Les sites gardés ne gagnent rien, comme prévu** : 946 (−1,4 s), 1142 (−0,2 s), 959 (+3,1 s), 1173 (−0,2 s), 981 (+0,1 s) ; et 961 (+0,4 s), dont la pause du site est gardée dans la branche que ces essais empruntent.

## La preuve

Faite le 2 nov. ; les journaux détaillés étaient dans le dossier temporaire de la session, perdu depuis. Les chiffres viennent de la note de reprise du 2 nov. à 20 h 15 ; les causes jouées restent lisibles dans `outils-pauses-les-plus-lourdes/causes.mjs` et `mutations.json`.

- **Une fois chacune, sur le Mac** : 28 specs vertes, d'après la note. Seule une passe intermédiaire est gardée (`resultats/res-apres1.tsv`) : elle porte des rouges sur 1159, 1147, 1148, 1149 et 1149-lot-3b ; `res-apres2.tsv` rejoue 1147, verte. Le lien entre ces rouges et les deux défauts corrigés est une inférence, les journaux étant perdus. Les 27 specs sont vertes à chaque passage retenu de la mesure ci-dessus, avant comme après.
- **Cassures directes** : une mutation de `js/` par spec, 28 sur 28 rouges.
- **Causes tardives** : une par pause gardée, arrivée dans la fenêtre après ce qu'une attente aurait rendu ; 69 sur 69 rouges, chacune sur l'assertion visée.
- **Cliquet** : plafond 904 → 692 ; il rougit si on ajoute une pause.
- **GitHub, trois tours sans reprise** (runs 41549540080 et 41554037090), sur des branches jetables : verts, sauf des rouges connus ou intermittents de la baseline Linux, et les deux cas ci-dessous. Les branches `essai/pauses-lourdes-1` à `-4` sont supprimées le 6 nov. (local et GitHub) ; les runs restent lisibles.

### `profil-rangee-1151`, hors lot

Sur deux runs mesurés avant et après sur les mêmes machines (41555602211 et 41556771332), « chaque bouton ouvre sa section » rougit 6 et 7 fois sur 16 avec les attentes, contre 2 sur 16 avec les pauses. Même résultat sans la capture de pile de `suivreLesReactions` : ce n'est pas elle. Cause non trouvée ; la spec revient à sa version de base (`aef3a3e9`).

## Pour décider de la suite

**Le gain par site touché.** Les 21 specs dont le site devient une attente gagnent 335 s sur le Mac, en moyenne 16 s chacune, de 3,7 s (`chaines-etapes-1149`) à 33,5 s (`lot-e1`). Les 6 specs dont le site est gardé (946, 1142, 959, 1173, 981, 961) gagnent 1,8 s à elles six, comme prévu.

**Ce que la longue traîne promettrait** (inférence, pas une mesure) : sur GitHub, les sites traités ici en attente pesaient 16,8 min de pauses ; ils rendent 5,6 min au Mac, soit environ un tiers. Les sites restants pèsent environ 17,5 min sur GitHub : au même rythme, ~6 min de plus sur le Mac. Mais ils sont répartis sur des centaines de sites de moins d'une demi-minute chacun : il faudrait toucher bien plus de specs, et refaire autant de contre-épreuves, pour un gain égal à celui de ce lot.

**La règle des constats d'absence coûte peu ici** : 69 pauses gardées dans les specs traitées, et les 6 sites gardés pèsent 4,3 min sur GitHub.

Cowork décide s'il y a un lot de plus. La passe complète du Mac qui suivra la fusion donnera la mesure réelle : `node scripts/mesurer-verification.mjs`.

**Décision de Cowork (7 nov.) : pas de lot de plus sur les pauses ; le chantier de la vérification plus rapide est clos pour les pauses fixes.** Motif : les 23,9 min restantes sont une longue traîne, dont le site le plus lourd pèse 0,8 min, et la part la plus lourde est désormais le reste des essais (52 min sur 87).

## Trouvailles hors lot

| Trouvaille | Issue |
|---|---|
| `planif-menu-vue` « raccourci glisser » : 5 rouges sur 16 avec la base, 2 avec le lot, sous Linux | inscrite, rattachée à #1114 |
| `bibliotheque-liste-1159` « les cours » à 1440 px : 1 sur 16 avec la base, sous Linux | inscrite, rattachée à #1114 |
| `profil-rangee-1151` plus rouge avec des attentes, cause non trouvée | inscrite, rattachée à #1114 |
| `mesurer.sh` : en zsh, `$AVANT:tests/…` applique le modificateur `:t` et vide la copie « avant » | corrigée (`${AVANT}`) ; un garde-fou arrête la mesure sur une copie vide. Un passage perdu (961, « avant »), sans durée retenue |

## Suppositions nommées

- **La mesure en deux jours** : 16 specs le 2 nov., 11 le 6. Les deux moitiés ne se comparent pas entre elles, chaque spec se compare à elle-même dans la même heure.
- **La saturation du 2 nov.** : la machine virtuelle de l'app Claude était la candidate, sans preuve. Le 6 nov., app Claude quittée, aucune saturation en 2 h de mesure ; cela ne prouve pas qu'elle en était la cause (une seule observation, sans l'avoir vue saturer).

## La fusion (6 nov.)

Dans un worktree à part, parti de `main` (`168d462a`) : `lot/verification-plus-rapide`, `lot/pauses-apres-ouverture`, puis cette branche, chacune par un commit de fusion. **Un seul conflit**, attendu : `palette-layout-h-hauteur-774.spec.js`, supprimée sur `main` (`4e2ce227`) ; la suppression est gardée.

**Le cliquet rougissait sur le résultat**, à cause de specs venues de `main`, écrites sans lui : 5 pauses juste après une ouverture (`ajouter-pages-photo-droite` ×2, `notifications-pile-1224`, `reunir-en-une-copie-1231` ×2), et 753 pauses pour un plafond de 692. Les 5 deviennent `attendreApplication(page)`, la règle du lot précédent ; aucune ne précède un constat d'absence. Les 3 specs : vertes une fois chacune sur le Mac, puis rouges sous une cassure directe chacune (la hauteur de la pile, le libellé « Copie de N fichiers », la lecture EXIF), code restauré (`outils-pauses-les-plus-lourdes/resultats/res-fusion-2026-11-06.tsv`). **Plafond : 738**, le compte réel. Le compte baisse de 15 pour 5 lignes : la sentinelle comptait chaque appel de `demarrer()` comme une pause tant qu'une pause y précédait le premier `}`. Contre-épreuve : une pause ajoutée, le cliquet rougit ; retirée, il reverdit. Vitest : 883 fichiers, 10 732 tests verts.

## La mesure sur la passe complète (7 nov.)

**Passe mesurée** : le verdict complet du Mac sur `ff3a91bf` (qui contient les trois fusions), du 6 nov. 23 h 53 au 7 nov. 1 h 20 (heure de Toronto), dix morceaux, un worker, gardé dans `~/Library/Caches/labo-codex/derniere-verification/` (`commit.txt` = `ff3a91bf`). Aucun essai relancé : `node scripts/mesurer-verification.mjs` relit les rapports blob de cette passe. `caffeinate` actif dès 23 h 52 ; `pmset -g log` ne montre ni veille ni réveil pendant la passe.

**Durée** : **87,2 min** de bout en bout (`stats.duration` du rapport fusionné), 86,7 min cumulées d'essais. 1 381 essais joués, 5 reprises (les 4 rouges connues de `temoin-enregistrement-lot-b`, une intermittente de `grilles-sous-criteres-condense`), 23 sautés.

**Les trois parts** (durées chronométrées par Playwright, reprises comprises) :

| Part | Minutes | Part du cumul | Estimation du 1er nov. (passe du 31 oct.) |
|---|---|---|---|
| Démarrage : 1 455 ouvertures (9,4 min) et 280 rechargements (1,4 min) | **10,8** | 12 % | 8 à 10 |
| Pauses fixes : 1 380 `waitForTimeout` | **23,9** | 28 % | ~58, puis ~37 après le lot précédent |
| Le reste, par différence (attentes, clics, évaluations, préparation des données) | **52,0** | 60 % | ~30, puis ~32 |
| **Cumul des essais** | **86,7** | | |

Toutes mesurées, sauf « le reste », obtenu par différence. L'ouverture coûte 0,39 s en moyenne, comme M1 dans une vraie spec.

**À quoi elle se compare.** La référence du 31 oct. : **97,6 min pour 1 220 essais**, avant les trois lots, soit 4,8 s par essai. Celle-ci : 87,2 min pour 1 381 essais, soit 3,8 s par essai (−21 % par essai). Les deux passes ne jouent pas les mêmes essais (161 de plus) : l'écart par essai mêle le gain des trois lots et la nature des essais ajoutés, sans pouvoir les séparer. Les estimations du 31 oct. pour les pauses (~58 min) venaient de GitHub ; la passe du 31 oct. n'a pas gardé ses rapports, on ne saura pas ce qu'elle pesait vraiment.

**Les 27 specs du lot dans cette passe** : 1 616,2 s, contre 1 669,9 s « après » et 2 007,1 s « avant », chacune jouée seule. Inférence : la passe complète joue ces specs un peu plus vite que la mesure isolée (−3,2 %) ; ramené à ce rythme, l'« avant » ferait ~1 943 s, et le gain du lot ~5,4 min. Ce chiffre reste une inférence.

**Ce qui reste en pauses fixes** : 23,9 min, 1 380 pauses, **aucune après une ouverture**. Les 30 sites les plus lourds n'en font que 9,5 min ; le plus lourd pèse 0,8 min (`evaluation-959-neutralite-chargeur:103`, gardé). En tête de liste : les 5 sites gardés du lot (959, 946, 1142, 1173, 981) et `profil-rangee-1151:29`, sorti du lot. Le reste est la longue traîne annoncée plus haut : des sites de moins d'un tiers de minute chacun.

## Ce qui reste

1. ~~Fusionné en local, pas poussé~~ : poussé avec `main` (`ff3a91bf`), après le verdict complet ci-dessus.
2. ~~À cette passe complète~~ : fait le 7 nov., section ci-dessus. Le rapport de la durée (`RAPPORT-2026-11-01-duree-de-la-verification.md`) garde ses estimations ; cette section les remplace.
