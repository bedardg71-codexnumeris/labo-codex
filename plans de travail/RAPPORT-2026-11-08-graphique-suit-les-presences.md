# Rapport : lot « Le graphique suit les présences » (8 nov. 2026)

Consigne de Grégoire, relayée par Cowork le 8 nov. 2026 au matin. Branche `lot/graphique-suit-les-presences`, partie de
`main` = `cafc89ff2` (1.236.0 en ligne ; la chaîne des quatre lots était close à 7 h 32). Non fusionnée, non publiée,
rien au changelog. Écrit par Claude Code (session dans le nuage, reliée au Mac de Grégoire). Captures :
`Claude outputs/captures-2026-11-08-graphique-suit-les-presences/` (Chromium, 1366 px).

## 1. Ce qui change pour toi

- Enregistrer les présences d'une séance la fait paraître au graphique du Suivi du groupe, sans recharger
  l'application ni passer par Réglages.
- Corriger les présences d'une séance passée refait sa capture et celles des séances suivantes (l'assiduité est
  cumulative). Les captures d'avant ne bougent pas.
- Un groupe vu deux fois dans la semaine : chaque séance enregistrée a sa capture, donc son point.
- Aucune capture pour une date future.

## 2. Le constat de Cowork, mesuré

Les quatre points tiennent, lus dans `cafc89ff2` :
- le graphique (`creerGraphiqueGroupeSpaghettiACP`, `graphiques-progression.js`) ne lit que `obtenirSnapshotsHebdomadaires()` ;
- une capture est identifiée par sa séance (`SEANCE-<date>`), et une recapture de la même date remplace l'ancienne (#116-B) ;
- la seule capture automatique part de `initialiserModuleSnapshots` (`main.js`, à l'ouverture) → `verifierEtCapturerSnapshotHebdomadaire`,
  qui s'arrête dès qu'une capture de la semaine courante existe ;
- `ecrirePresencesSeance` (`saisie-presences.js`), l'écrivain unique des présences de l'écran, ne capturait rien.

## 3. Ce qui est fait

- **`recapturerDepuisSeance(D)`** (`snapshots.js`) : recapture D, puis chacune des séances déjà capturées après D, dans
  l'ordre, les évaluations lues une fois pour la chaîne. Les appels passent dans une file : deux enregistrements
  rapprochés ne se recalculent pas en même temps.
- **Une garde du groupe-cours.** Une capture se calcule sur le groupe-cours actif (ses élèves, ses travaux, sa clé). Si
  tu changes de groupe-cours avant ou pendant la chaîne, elle s'arrête plutôt que d'écrire les séances de l'un chez
  l'autre (le défaut que #116-A avait réparé pour la vérification à l'ouverture). La séance manquante se rattrape à la
  saisie suivante ou par « Recalculer les captures ».
- **`ecrirePresencesSeance`** l'appelle après chaque écriture réussie (geste, « Tous présents », « Confirmer la séance »,
  verrou, « Réinitialiser » : tous passent par lui). Le Suivi du groupe, s'il est affiché, se redessine **après** les
  captures ; avant, il se redessinait 0,3 s après l'écriture, sur les anciennes captures.
- **Une séance saisie en retard prend sa place** dans la liste des captures (avant : ajoutée à la fin). Les lecteurs
  trient par semaine seulement : sans cela, un jeudi saisi avant le mardi de la même semaine paraissait avant lui.

## 4. Ce que j'ai décidé seul (à corriger en dix secondes si c'est faux)

- **La vérification à l'ouverture reste.** Elle est la seule capture automatique d'un groupe dont on saisit les
  évaluations sans prendre les présences dans l'application : la retirer laisserait ce graphique vide jusqu'au lot des
  évaluations (#1242). Elle ne gêne pas la règle : elle capture les séances passées de la semaine si aucune ne l'est,
  et une saisie refait ensuite la sienne.
- **Le stock n'est pas recalculé.** Les séances enregistrées avant ce lot et jamais capturées restent absentes du
  graphique jusqu'à « Recalculer les captures » (Réglages › Données), qui reste là. Rien n'est réécrit d'office chez les gens.
- **Les présences d'une intervention RàI ne déclenchent pas de capture.** Elles n'entrent dans l'assiduité qu'à une
  séance du cours déjà saisie, où l'élève a déjà sa fiche, et un doublon n'est pas ajouté (`ajouterPresencesIntervention`) :
  l'effet est nul en pratique. Commenté dans le code.
- **Deux textes de l'enseignant·e changent, parce qu'ils devenaient faux** (texte proposé, à corriger) :
  - le graphique vide : « Capturez des snapshots hebdomadaires. » devient « Saisis les présences d'une séance. »
    (le canevas vide fait 300 px : une phrase plus longue était coupée, constaté sur la capture) ;
  - l'Aide, carte « Captures de progression hebdomadaires » : « L'application capture les indices une fois par semaine :
    à l'ouverture, … » devient « L'application capture les indices à chaque séance dont tu enregistres les présences.
    Elle le fait aussi une fois par semaine, à l'ouverture : … » ; et « Si tu corriges des présences ou des évaluations
    passées, « Recalculer les captures » les refait toutes… » devient « Si tu corriges les présences d'une séance passée,
    sa capture et celles des séances suivantes sont refaites. Si tu corriges des évaluations passées, « Recalculer les
    captures » les refait toutes… ». ↻ Avec #1242 (§ 8), cette seconde phrase devient : « Si tu corriges les présences
    d'une séance passée ou une évaluation, les captures concernées sont refaites d'elles-mêmes, avec celles des séances
    qui suivent ; pour une évaluation, à partir de l'échéance de son travail. « Recalculer les captures » les refait toutes
    depuis le début du trimestre : utile après une échéance déplacée ou une pratique de notation changée. »

## 5. Inscrit au backlog

- **#1242** : enregistrer une évaluation change C et P sans recapturer (sur consigne). **Fait le même jour, à la demande
  de Grégoire** (« c'est toujours l'échéance du travail »), § 8.
- **#1243**, trouvaille : le graphique se lisait mal à une seule séance (un point par élève, collé à l'axe) et à deux
  séances par semaine (deux points « Sem. 2 », sans date). Déjà vrai après « Recalculer les captures » ; le lot le rend
  courant. **Corrigé sur la même branche** (accord de Grégoire, 8 nov., 8 h 57), § 7.

## 6. Vérifié comment

- **Le test qui échoue avant la correction** : `tests/unit/sentinelle-graphique-suit-les-presences.test.js`, sur les
  modules réels (`indices.js`, `saisie-presences.js`, `snapshots.js`, `modes.js`), par le geste et l'enregistrement
  automatique. S0, S1, puis deux saisies dans la même semaine (S3, S4), puis la correction de S1 : S1, S3 et S4 refaites,
  l'absence de Bruno (fictif) s'y lit (100, 100, 88 → 50, 67, 63) ; S0 intacte, horodatage compris ; S2, jamais saisie,
  sans capture. Plus : la séance saisie en retard à sa place, la date future, le changement de groupe-cours, le Suivi
  redessiné après la capture. Sur `cafc89ff2` : **7 rouges sur 7**. Après : 7 verts.
- **Break-tests** (chaque altération rend rouge au moins un essai, puis retirée) : seulement D sans les suivantes → 3 et 4 ;
  les captures d'avant D refaites aussi → 3, 4 et 5 ; ajout en fin de liste → 4 ; Suivi redessiné sans attendre → 6 ;
  aucun appel depuis l'écrivain → 7 sur 7 ; sans la garde du groupe-cours → 6.
- **Au navigateur** : `tests/integration/graphique-suit-les-presences.spec.js`, groupe neuf (trimestre, horaire mardi et
  jeudi, groupe-cours créés à l'écran), première saisie par le champ de l'écran, puis retour au Suivi du groupe : un point,
  huit courbes ; la deuxième séance de la semaine : deux points. Vert sous **Chromium** (le conteneur n'a pas WebKit) ;
  rouge quand l'appel est retiré.
- **Vitest entier** : 886 fichiers, 10 775 essais, tous verts (dans le conteneur, depuis `tests/`).
- **Specs voisines** (présences, témoin, parcours neuf, anonymisation, barres de l'Aperçu ; 8 fichiers, 45 essais),
  sous Chromium : 44 verts, 1 rouge, `lot-a-anonymisation-enregistre` (a)(c), une évaluation en anonymisation. **Sans lien
  avec le lot, mesuré** : il rougit aussi sur `cafc89ff2` (2 sur 10 sous Chromium), et sur la branche avec le seul
  `index.html` modifié (le texte de l'Aide). Intermittence propre à Chromium ; WebKit en jugera au verdict.
- **Durée** (démo : 10 élèves, 30 séances capturées ; Chromium du conteneur, indicatif) : saisie de la dernière séance,
  13 ms ; correction de la première séance, 30 captures refaites, 359 ms, sans aucune tâche de plus de 50 ms (la page
  reste réactive : chaque capture rend la main). « Recalculer les captures » : 343 ms. Pour un groupe de 35, compter
  environ trois fois et demie, toujours par petites tranches.
- **Ratchets ajustés** : `sentinelle-contenir-complexite` 439 → 438 (`ecrirePresencesSeance` 16 → 14 ; le rafraîchissement
  sort en fonction de 4 : complexité déplacée, pas réduite) ; `sentinelle-audit-aide-15-oct` : l'essai « les captures sont
  hebdomadaires » interdisait à l'Aide de dire qu'une saisie capture, ce qui devient vrai ; il exige maintenant les deux phrases.
- **Pas vérifié** : WebKit et Safari, l'iPad. **Le verdict Playwright complet est à prendre sur le Mac** avant toute fusion.

## 7. #1243 : le graphique se lit à une séance et à deux séances par semaine

- **Les étiquettes** (`etiquettesCaptures`, `graphiques-progression.js`) : une semaine à une capture garde « Sem. N » ;
  une semaine à plusieurs captures écrit le jour et la date, « Sem. 2 · mar. 25 août ». Jours et mois sont écrits par le
  module, pas par la langue du navigateur : la même étiquette dans Safari et dans Chrome. L'infobulle du Suivi du groupe,
  qui reprend l'étiquette, dit donc aussi le jour.
- **L'axe** se décale d'une demi-colonne (`offset`) : le premier point s'écarte de l'axe vertical ; seul, il se tient au
  milieu du graphique.
- **Décidé seul** : le profil de l'élève (« Progression temporelle ACP ») suit la même règle. Il lit les mêmes captures,
  et aurait gardé ses « Sem. 2 » répétés.
- **Vérifié** : `tests/unit/sentinelle-1243-graphique-lisible-a-deux-seances.test.js` (3 essais, les deux graphiques
  construits par le vrai module) : 3 rouges sur la version d'avant, 3 verts ; break-tests (l'étiquette ou le décalage
  retiré de l'un ou l'autre graphique → l'essai concerné rougit). Au navigateur, la spec du lot vérifie maintenant
  « Sem. 2 » seul et écarté de l'axe (plus de 20 px), puis « Sem. 2 · mar. 25 août » et « Sem. 2 · jeu. 27 août ».
  Captures : `suivi-groupe-neuf-apres.png` (refaite) et `suivi-groupe-deux-seances.png`. Vitest entier : 887 fichiers,
  10 778 essais, tous verts.
- **La densité, mesurée sur la démo** (30 séances, deux par semaine, « Recalculer les captures », Chromium) : à 1366 px,
  les 30 étiquettes s'affichent, lisibles en biais ; à 820 px (l'iPad debout), Chart.js en garde 15, la première séance
  de chaque semaine. Captures : `demo-bureau-1366.png`, `demo-ipad-debout-820.png`. Pas vu dans Safari.

## 8. #1242 : le graphique suit aussi les évaluations

Décision de Grégoire (8 nov., 9 h 13) : pour une évaluation, la date qui compte est **l'échéance du travail**.

- **Le déclencheur** : `sauvegarderDonneesSelonMode` (modes.js), le point par lequel passent les gestes qui écrivent les
  évaluations (évaluer, verrouiller, déverrouiller, supprimer, changer un statut, appliquer un jeton, associer une copie…),
  signale chaque écriture réussie à `signalerEvaluationsEcrites` (snapshots.js).
- **Ce qui a changé** : beaucoup de ces gestes modifient en place le tableau lu (l'objet du cache mémoire de `db`) avant de
  l'écrire ; relu au moment de l'écriture, « avant » vaudrait déjà « après ». Le module garde donc une **empreinte** de chaque
  évaluation (son JSON), prise au démarrage, au changement de trimestre, à l'entrée et à la sortie de la démo, puis à chaque
  écriture. Changées, ajoutées ou retirées : celles dont l'empreinte diffère.
- **La date** : l'échéance effective la plus ancienne parmi elles, pour les élèves et les travaux du groupe-cours actif (une
  copie d'un autre groupe ou d'un autre cours ne refait rien ici) ; sans échéance, la date de l'évaluation, comme le C et le
  P historiques. Les captures déjà prises à partir de cette date sont refaites ; une évaluation ne crée pas de capture.
- **La file** : une demande arrivée pendant qu'une autre attend s'y fond (la date la plus ancienne l'emporte). Une série de
  corrections ne relance pas autant de chaînes.

**Décidé seul** :
- les écritures directes en `db` des évaluations (une échelle modifiée qui réécrit ses copies, par exemple) ne déclenchent
  rien : ce sont des changements de paramètres, « Recalculer les captures » reste leur recours (Aide mise à jour) ;
- sans empreinte de départ pour la clé écrite (une écriture avant la fin du démarrage), l'écriture devient le point de départ
  et rien n'est refait.

- **le départ des captures attend le tour suivant de la boucle** (une minuterie à 0) : l'écriture en attente des
  présences part au déchargement de la page (`pagehide`) ; les captures ne disputent plus à cette écriture le temps qui
  lui reste pour atteindre IndexedDB. Au rechargement, la capture manque, pas la saisie. Motif : la spec
  `presences-lot-d-enregistrement` (a), « une note tapée puis rechargement », a rougi sur la branche ; **mesuré ensuite,
  elle rougit autant sur `cafc89ff2`** sous Chromium (5 sur 10 de chaque côté dans la même série ; 6 sur 20 au total sur
  la base) : intermittence de Chromium, sans lien établi avec le lot. La précaution reste, elle ne coûte rien.

**Une limite** : seules les captures du groupe-cours actif se refont. Évaluer les copies d'un groupe pendant qu'un autre est
actif ne refait pas les captures du premier ; elles se rattrapent à sa prochaine saisie de présences (à partir de cette
séance seulement) ou par « Recalculer les captures ».

**Vérifié comment** :
- `tests/unit/sentinelle-1242-graphique-suit-les-evaluations.test.js` (11 essais, modules réels) : une évaluation enregistrée
  refait S1, S3, S4 (C d'Alice, fictive : 100 puis 50 quand le travail P3 est dû aussi), S0 intacte, aucune capture créée ;
  modifiée, retirée : idem ; travail pas encore dû, élève d'un autre groupe, réécriture sans changement : rien ; deux
  écritures rapprochées : trois captures écrites, une fois chacune ; travail dû un jour de cours jamais saisi : les suivantes
  refaites, rien de créé ; sans empreinte de départ ; les trois reprises de l'empreinte. Avec `modes.js` et `snapshots.js`
  d'avant : 10 rouges sur 10. Break-tests G à L consignés dans le fichier.
- Specs voisines qui écrivent des évaluations dans la démo (14 fichiers, 91 essais, Chromium) : 89 verts ; 2 rouges,
  `1007-propose-codex-avant-suppression` P8 (vert ensuite 9 fois sur 9 sur la branche, vert sur la base) et la note tapée
  ci-dessus (même taux sur la base).
- Au navigateur (Chromium), `graphique-suit-les-presences.spec.js`, second essai : démo activée en cours de session, une
  évaluation modifiée en place puis écrite ; les captures à partir de son échéance sont refaites, celles d'avant non. Rouge
  quand la reprise de l'empreinte à l'entrée de la démo est retirée.
- **Coût mesuré** (démo : 101 évaluations, 392 Ko ; Chromium) : l'écriture, empreintes comprises, 10 ms ; une écriture sans
  changement, 5 ms et rien de refait ; la chaîne pour la plus ancienne échéance, 22 captures en 257 ms. **Extrapolation, non
  mesurée** : pour 700 évaluations (deux groupes, un trimestre), compter environ sept fois le coût de l'empreinte, soit de
  l'ordre de 30 à 70 ms par enregistrement d'une évaluation. À surveiller sur l'iPad.
- **Vitest entier** : 888 fichiers, 10 789 essais, tous verts. **Pas vérifié** : WebKit et Safari, l'iPad.
