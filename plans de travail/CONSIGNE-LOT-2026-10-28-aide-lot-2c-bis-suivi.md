# Consigne – L'Aide, lot 2c bis : le Suivi dit vrai, en moins de mots (#1152)

> Écrite par Cowork le mercredi 28 octobre 2026 à 11 h 10 (Toronto, mesuré par `date`), sur `main` = `8024aab8` (le lot 2c, l'Évaluation, et le lot de la copie non recevable, #1175, faits et relus ; pas encore en ligne). Ce fichier ne remplace aucune autre consigne : n'y touche pas.
> Plan : `PLAN-2026-10-24-refonte-de-l-aide.md` (le 2c coupé en deux le 28 oct. ; ceci est la seconde moitié). Sources, **dans cet ordre** : `audit-aide-2026-10-24/REMESURE-2026-10-27.md` (section Suivi, et le geste neuf n° 9 ; elle l'emporte sur le dossier pour les entrées qu'elle nomme), puis `AUDIT-AIDE-2026-10-24.md` (décisions D1 à D13, verdicts finals), puis le détail : `lot-3-formation-utilisation-1.md` (`saisie-presences`), `lot-5-consultation.md` (`tableau-bord`, `profil-etudiant`, `diagnostics`, `patterns`, `guide-profil`, `planifier-rai`), `lot-1-introduction.md` (`acp`, `rai`, `suivi-apprentissage`), `lot-4-utilisation-2.md` (`rai-absences`, `snapshots`, `tirage-sort`).
> **Les lots 2a, 2b et 2c servent de modèle** : même méthode, mêmes règles de mots, mêmes tests. Relis la consigne et le verdict du lot 2c : **l'ordre des entrées se lit dans `js/config.js`** (sous-onglets du Suivi, l. 68-77), pas dans l'ordre des `div` d'`index.html` (l'erreur de la consigne du 2c) ; un libellé se recopie ; un geste n'est dit commun que s'il l'est partout ; une case se décrit par l'état qui agit.

## 0. Avant tout

- Un seul lot à la fois, sur un `main` à jour, aucune suite qui tourne. Rituel de début de session.
- Commit de docs seul, fichiers nommés : ce fichier et `VERDICT-RELECTURE-2026-10-28-copie-non-recevable-note.md`. Rien d'autre (`CONSIGNE-DEMARRAGE-COWORK.md` et les deux icônes non suivies restent hors du commit).

## 1. Le mandat

Les 13 entrées du Suivi en font 11 : `guide-profil` est absorbée par `profil-etudiant`, `rai-absences` par `planifier-rai`. Chacune dit ce que fait l'écran d'aujourd'hui, sans redire ce qu'il affiche ni ce que disent ses aides contextuelles ; la théorie va aux guides intégrés (D1). Environ 4 655 mots aujourd'hui (compte de Cowork ; donne aussi le tien), environ 1 590 visés selon les verdicts finals. Aucun comportement de l'application ne change ; aucun fichier de `js/` n'est touché sans le dire.

**L'ordre** : celui des sous-onglets (Suivi du groupe, Liste des étudiant·es, Saisie des présences, Profils individuels, Interventions, Rencontres, Animation) ; une entrée qui explique un calcul (A-C-P, les mots de A et C, la RàI, le suivi des fondations, les patterns, les captures) se range à côté de l'écran qui l'affiche. Propose l'ordre dans la demande de relecture, avec son motif. « Rencontres » n'a pas d'entrée : c'est un des sept trous (lot 4), ne la crée pas.

## 2. Les entrées

Repère chaque entrée par son id (préfixe `accordeon-aide-`). Cibles : le tableau des verdicts finals.

1. **`tableau-bord`** (~70 mots). Le chemin : Suivi › Suivi du groupe (plus d'onglet « Aperçu ») ; l'écran recalcule A, C, P et les patterns à chaque affichage ; pas de vocabulaire du risque ; ce que fait le panneau « Détails », seul endroit où l'application range les étudiant·es (dossier). Le message « en difficulté » compte maintenant les niveaux PS et I ensemble (`js/tableau-bord-apercu.js`, 27 oct.) : à dire s'il est nommé.
2. **`saisie-presences`** (~90 mots). Les périodes, par pas de 0,5, plafonnées aux périodes de la séance ; nombres à la française ; plus d'« assiduité alternative » ; l'absence motivée d'une intervention est marquée à part (renvoi aux interventions).
3. **`profil-etudiant`** absorbe **`guide-profil`** : « Lire le profil d'un·e étudiant·e » (~350 mots pour les deux ; un titre neuf va à Grégoire). **La remesure l'emporte** : une bande à deux lignes (en haut « Liste des étudiant·es », ‹ le menu ›, « n sur N », les étiquettes ; en bas, jusqu'à huit sections en boutons), la section sur toute la largeur, ‹ et › ; plus de « Sidebar », de « barre latérale », de « 3 sections », de « Voir formules ». Une à trois phrases par section ; le seuil de défi (70 % par défaut, réglable) ; le pattern dans la carte RàI d'Accompagnement ; **D4** en une phrase : la couleur du badge « Contexte d'apprentissage » (85, 75, 65 % sur A et C ensemble) et le rappel « Mobilisation » (A ou C sous 75 %), mesurés à `js/contexte-qualification.js` et `js/profil-etudiant-sections-affichage.js`. Renvois aux mots de A et C (`diagnostics`) et à la règle du niveau (`patterns`). **Pièges** : `sentinelle-803` (l'astuce de l'étoile, « modalité réglée dans ta pratique ») doit survivre dans l'entrée fusionnée, ou la sentinelle suivre en citant la décision ; `sentinelle-audit-aide-lot-E` (`<strong>Niveau IDME</strong>`) : mesure ce qu'elle exige. Les ~555 mots sans objet du guide (stratégies, exemples de profils, workflow, checklist, graphiques de l'aperçu, la boîte du tableau des critères) partent. L'id `guide-profil` disparaît : mesure d'abord ses lecteurs (`js/`, `tests/`, les renvois de l'Aide, la FAQ).
4. **`acp`** (~80 mots). Les trois définitions de calcul (A : périodes présentes ÷ périodes offertes, sur les séances saisies ; C : travaux remis ÷ travaux comptés ; P : selon la pratique), à la place des trois « mesure… » ; le guide ACP intégré pour la théorie.
5. **`diagnostics`** (~120 mots). Les mots de A et C forment une seule phrase, le badge de la carte « Contexte d'apprentissage » dans Accompagnement ; la table `aide-table-paliers-a-c` reste (sentinelle du 15 oct.). Le titre proposé par le dossier, « Les mots qui décrivent A et C », est un titre neuf (à Grégoire) ; il est cité par d'autres entrées et la FAQ : mesure et suis.
6. **`rai`** (~120 mots). Ce qui décide du niveau (P, le pattern, l'option), l'IPB qui nomme la cible ; **D3** : les bornes dites telles qu'elles sont, 64 % et 75 %, fixes (la table de `js/profil-etudiant-helpers.js` et `js/profil-etudiant-calculs.js`), sans dire qu'elles suivent l'échelle : elles ne la suivent pas, même avec « PS » (#551, question ouverte de Grégoire, ne la tranche pas) ; **D13**, mot pour mot : « Elle dépiste des difficultés et classe des niveaux de besoin, pour éclairer et soutenir tes décisions d'intervention et d'accompagnement. » La théorie (le cycle, « L'objectif… ») va au guide RàI ; l'encadré « Quelle différence avec le Suivi des fondamentaux ? » ne reste qu'à un endroit. Gardés : « pattern des derniers artefacts (3 par défaut) » (au moins 3 fois dans l'Aide) et « nomme la cible de l'intervention » (sentinelle du 15 oct.).
7. **`suivi-apprentissage`** (~220 mots). Le tableau IPB × direction et la fenêtre de 3 restent ; la carte suit le réglage SOLO (avec et sans l'option), nomme le bon seuil, perd l'exposé et les doublons. Gardé : « (70 % par défaut) » (`sentinelle-audit-aide-lot-A`).
8. **`patterns`** (~170 mots). La règle unique du niveau : P sous 75 % donne au moins le niveau 2, sous 64 % le niveau 3, quel que soit le pattern ; « Stable » exige aussi une performance des derniers artefacts ≥ 64 %. Les lignes « Action » (prescriptions) et l'encadré « RàI et mobilisation » (théorie) partent ; **piège** : la sentinelle du 15 oct. tranche l'entrée jusqu'à « RàI et mobilisation : deux systèmes » : si l'encadré part, sa borne de fin change, en citant cette consigne.
9. **`planifier-rai`** absorbe **`rai-absences`** (~150 mots ; ce texte comme base). Six blocs, dont « Observations générales » et « Gestion des absences » ; « Suggérer » propose l'objectif au clic, le champ est vide par défaut ; de `rai-absences`, seule la case de report : « Reporter les présences dans la saisie des présences… », décochée par défaut, dans la question de complétion ; ce qu'elle écrit selon le « Contexte de l'intervention » (rattrapage : absences motivées pour les non-participant·es ; petit groupe pendant le cours : rien pour eux) ; le report se fait une seule fois ; la « Durée (périodes) », 2 par défaut. Les libellés de l'écran : « Niveau 2 (Groupe ciblé) », « Niveau 3 (Individuel) ». L'id `rai-absences` disparaît : mesure d'abord ses lecteurs.
10. **`snapshots`** (~150 mots). Ce que la capture enregistre (A cumulatif, C, P ; pattern et RàI « Non calculé »), où se voient les graphiques (« Développement du groupe, semaine par semaine », toutes courbes cumulatives), « Recalculer les captures » ; A en périodes ; « étudiant·es ». Gardés : « une fois par semaine » et « Recalculer les captures » (sentinelles du 15 oct. et du lot A). Ajoute, d'après le code du 28 oct. (#1175) : une capture déjà prise garde ses valeurs jusqu'à « Recalculer les captures ».
11. **`tirage-sort`** (~70 mots). Une phrase par outil de l'Animation, « Équipes » compris ; les réglages sont dans « Paramètres du tirage » (l'engrenage) et dans les infobulles. **Mesure l'écran d'abord** : la remesure ne l'a pas couverte (la barre latérale de l'Animation, #1039, est-elle encore là ?).

**« Incomplet », deux sens** (remesure, `guide-profil`) : le niveau I de l'échelle et le statut d'une copie. **Ne le tranche pas** : recopie les libellés ; Cowork soumet la question à Grégoire avec le verdict de ce lot.

**D2 ailleurs.** Toute phrase qui présente la pratique de Grégoire comme la règle : un exemple, au conditionnel, ou elle part.

## 3. Les règles de mots

Celles des lots 2a à 2c. Pour Grégoire : les titres neufs, et les phrases qui disent quelque chose de l'application au-delà d'un libellé d'écran (décision de Cowork du 27 oct., 15 h 40). D4 et D13 sont des décisions déjà rendues : pose D13 mot pour mot ; écris D4 et soumets sa phrase.

## 4. Les tests

- Les sentinelles de l'Aide avant de toucher (`tests/unit/sentinelle-*aide*`, `sentinelle-803-aide-pan-famille-pas-mecanique`, `sentinelle-audit-aide-15-oct-…`, `sentinelle-audit-aide-lot-A` et `-lot-E`, et les specs de l'Aide).
- Une assertion qui tombe par décision (fusion, correction, borne déplacée) : adapte-la en citant l'audit, la remesure et cette consigne. Une autre : arrête-toi et dis-le.
- **Une sentinelle neuve**, `tests/unit/sentinelle-aide-2026-10-28-lot-2c-bis.test.js`, calculée des deux côtés : le Suivi a les entrées dans l'ordre que tu retiens, `guide-profil` et `rai-absences` absentes ; aucune entrée du Suivi ne dit « Sidebar », « barre latérale », « 3 sections », « Voir formules », « Navigation : Aperçu », « risque », « Préc. », « Suiv. » ; D13 mot pour mot ; les bornes 64 et 75 lues dans le code, pas recopiées ; chaque libellé entre « » des entrées 3, 9 et 11 existe dans `index.html` ou `js/` hors de l'Aide. Break-test, arbre restauré par sha256.
- **Un essai Playwright ciblé** : la recherche de l'Aide trouve « profil », « report » et « Recalculer les captures », chacune dans le Suivi.
- Vitest depuis `tests/`.

## 5. Ce qui n'entre pas

Le Labo, le codex et la Référence (lot 2d), dont `rai-solo` ; le glossaire (lot 3) ; les sept trous (lot 4), dont « Rencontres » ; les textes d'écran hors de l'Aide (lot 5). Les bornes fixes de la RàI (#551) restent la question de Grégoire.

## 6. Clôture

- `BACKLOG.md` : sous #1152, le lot 2c bis ; le plan dit « 2c bis : codé, en relecture ».
- Demande de relecture : `plans de travail/DEMANDE-RELECTURE-2026-10-28-aide-lot-2c-bis.md`, sur le modèle de celle du lot 2c (entrée par entrée, mots avant et après, preuves `fichier:ligne`, tests, « Pour Grégoire », captures de `profil-etudiant` et de `planifier-rai` à 1 440 et 820 px).
- Pas de release, de verdict ni de push sans le signal de Grégoire.
- Le geste à vérifier à l'écran après la mise en ligne : Aide › Suivi, « Lire le profil d'un·e étudiant·e » décrit la bande à deux lignes ; chercher « report » mène à la case des interventions.
