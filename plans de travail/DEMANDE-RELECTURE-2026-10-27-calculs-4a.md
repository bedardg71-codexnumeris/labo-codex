# Demande de relecture – Les calculs, lot 4a (étape 4 du plan du 21 oct.)

> Claude Code, mardi 27 octobre 2026, sur `main` : `bc63e092` (docs du §0), `537dac28` (le lot). Rien de poussé. Consigne : `CONSIGNE-LOT-2026-10-27-critere-algorithmique-calculs-4a.md`. Vitest 9 846 / 9 846 ; Playwright WebKit : la spec du lot (9 tests) et les 60 specs voisines du critère algorithmique (#1142, #645, #699, #1034, lot 4, présentation, tables de cas), vertes. Le verdict complet de la suite n'est pas pris (au signal de Grégoire, avec le push).

## 1. La mesure du piège 2 (consigne § 6.2) — la phrase n'est PAS posée

Mesurée dans WebKit, contre le vrai `index.html` (`critere-algorithmique-calculs-4a.spec.js`, « piège 2 »). Une grille déjà employée, un critère algorithmique sur 100 ; une évaluation enregistrée avec la pénalité proportionnelle : 15 erreurs sur 500 mots, **70 / 100**. Le calcul passe à la pénalité fixe (1 point par erreur) par le geste de l'atelier.

| | Ce qui est mesuré |
|---|---|
| (a) La base, après le changement | **Identique à l'octet** : rien n'est réécrit dans les évaluations enregistrées. |
| (b) Copie **verrouillée**, rouverte (« Modifier ») | L'écran montre la note **recalculée** : « Note = 100 − 15 × 1 = 85 / 100 », 85 %, et la note de la production à 85 %. **La base garde 70** : rien ne s'écrit à la réouverture, et un geste ne s'écrit pas non plus (verrou). |
| (c) Copie **déverrouillée**, rouverte | L'écran montre aussi **85**. Rien ne s'écrit à la réouverture. **Au premier geste** (l'auto-save), la copie s'écrit à 85 (`noteCalculee: 85`, niveau M). |

⮕ La phrase de l'ébauche (« Comme aujourd'hui, une copie déjà évaluée garde sa note ; elle suit le nouveau calcul dès que tu la modifies. ») est **vraie en base et fausse à l'écran** : rouverte, même verrouillée, une copie **montre** déjà la note du nouveau calcul, alors que celle qui est enregistrée (et que lisent la liste et le PDF) reste l'ancienne. **Je ne l'ai pas posée** ; sous les cartes, seule la première phrase paraît. Ce comportement de réouverture existait avant le lot : changer un réglage le produisait déjà. Ce que veut dire une note revient à Grégoire ; à Cowork de lui proposer un texte.

## 2. Ce qui a été fait

- **Une seule source** (`js/evaluation-formules.js`). Chaque calcul tout fait déclare ses jetons, comme `TOUT_FAITS` de l'ébauche. Les identifiants enregistrés ne changent pas : les modèles, leurs paramètres, et leurs bornes. Un évaluateur pur (l'algorithme de `evaluer` de l'ébauche, coupé en fonctions sous 15 de complexité) calcule la note. Les pastilles (`blocs`), la ligne en chiffres (`enChiffres`) et la ligne de résultat au présent ou au conditionnel (`ligneResultat`, `libelleChiffre`) sortent des mêmes jetons, aux noms de l'enseignant·e. Aucun `eval` ni `new Function` (vérifié par test). Évaluateur et module restent dans le même fichier : un module à part aurait obligé à recharger un fichier de plus dans une trentaine de bancs.
- **`critere.casZero`**, sous la forme de la consigne (§ 3.4). Les départs sont le comportement d'avant. L'ordre d'examen : l'étendue, puis le compte, puis le compte pondéré. Un choix illisible est écarté et l'on revient au départ. `'aucune'` rend `applicable: false`, avec `mots-absents` pour l'étendue et `donnee-absente` pour une autre donnée. L'écran n'écrit l'entrée que si elle diffère du départ ; revenir au départ la retire.
- **L'étape « Note calculée »**, telle que l'ébauche la montre :
  - la phrase d'ouverture, puis « Le calcul de la note » et les trois cartes avec leurs textes validés ;
  - sur la carte choisie : le réglage, les pastilles, « Sur la copie fictive : … » (rempli par l'atelier à chaque changement de la copie) et « Quand une donnée de la copie vaut 0 », plus la phrase sur la division ;
  - sous les cartes : « La note reste entre 0 et la pondération du critère. » ;
  - la chaîne affiche « pénalité fixe » sous le nœud et « Pénalité fixe, sur 20 » en résumé ;
  - à l'évaluation, la ligne chiffrée suit les blocs ; elle est masquée quand aucune note ne se calcule (niveau retiré, jamais « -- »).
- **L'Aide** : l'entrée « Les critères algorithmiques » prend les trois noms, les trois textes et la phrase sur l'étape.
- **Le transport** : à l'import, un type dédié écarte ce qui est illisible ; au partage, un schéma fermé et `refusCasZero` refusent le paquet, comme pour les tables de cas. Export, codex, copie de grille, bibliothèque et Réserve copient le critère entier (vérifié par `grep` : `{ ...c }`, des clés entières, aucune sélection de champs).
- **Retiré** (zéro dette) : `libelleSymbolique` et « Formule appliquée », `description`, `utiliseMots` et la garde du mode simple qu'il nourrissait, ainsi que `FORMULES_COURTES`. Partent aussi les quatre anciens gestionnaires et `modifierFormuleCritereGrille` / `modifierParamFormuleCritereGrille`. Trois gestes neufs les remplacent ; ils écrivent par `_modifierCritereCible`, la file commune.

## 3. Les suppositions que j'ai faites seul (à corriger d'un mot)

1. **La note brute s'arrête à la pondération, pas sous 0.** Le rapport visé avait un `min(1 ; …)` que les blocs n'ont plus ; sa note brute enregistrée (`noteCalculee`) dépassait donc la pondération sur une bonne copie (mesuré : 100 au lieu de 20). La note brute est maintenant ramenée à la pondération, mais pas relevée à 0 : une pénalité négative s'enregistre comme avant, et seul le pourcentage est borné. C'est ce qui garde la note identique à 1e-9 près sur tout le banc. **Écart avec la consigne § 3.3, à connaître** : la consigne ne disait rien de ce plafond.
2. **« Vaut 0 » veut dire « n'est pas positive ».** Un compte négatif (tapé à la main) se lit comme 0, ce que faisaient les anciens calculs (`mots <= 0`, `erreurs <= 0`). Seul cas où la note brute diffère d'avant : une pénalité avec un compte d'erreurs **négatif** (impossible par les codes) s'arrêtait au-dessus de la pondération ; elle s'arrête maintenant à la pondération. Le pourcentage et le niveau ne changent pas.
3. **La phrase sous l'ancien menu est partie** (« Lors de l'évaluation, « Erreurs » se remplit avec les codes… » ; c'était le texte G3 du lot de mots 2). L'ébauche, qui fait foi, ne la porte pas ; la phrase d'ouverture dit le compte pondéré.
4. **Deux textes sont de moi, faute de texte validé :**
   - la phrase de l'Aide « Tu choisis le calcul dans l'étape « Note calculée » du critère, puis tu en fixes le réglage. » ;
   - la mention de l'aperçu « Sans projection, ces copies ont la longueur fixée dans le calcul : chaque erreur y coûte un point, quelle que soit cette longueur. » Le « facteur » y devient « la longueur fixée ».
5. **Sans note sur la copie fictive**, la raison sous la note de l'aperçu est la ligne du registre (« Aucune note : l'évaluation attendrait le compte des calculs. »). Elle remplace « aucune note : la formule a besoin du champ… », qui ne savait nommer que l'étendue.
6. **`compte`** (le compte brut) est déclaré et lu par aucun des trois calculs. Faute d'appelant qui le passe, il vaut le compte pondéré (pour 4b, à brancher).
7. **Le redessin garde le défilement** (piège 6). `_redessinerEnGardantLeFocus` (lot 3a) rendait le focus sans garder la position ; mesuré sous WebKit, la page sautait de 250 px. Elle garde maintenant les deux, et cela vaut aussi pour les gestes des tables de cas : leurs specs sont vertes.

## 4. La preuve

- **Vitest** (`tests/unit/calculs-4a-equivalence.test.js`, 46 tests) :
  - l'évaluateur (priorités, parenthèses, jetons mal formés, division par une donnée nulle, par un nombre nul) ;
  - le banc d'équivalence : 5 040 cas, chaque paramètre à son défaut, son min et son max, même niveau sur l'IDME « ,99 » et sur les bornes entières ;
  - chaque choix « vaut 0 », pour chaque modèle et chaque donnée, avec les départs ;
  - un `casZero` illisible ;
  - l'aller-retour import et partage ;
  - la ligne chiffrée et les pastilles dans les deux disciplines, et les exemples chiffrés des TEXTES du 26 oct., tous retrouvés.
- **Break-tests** (chacun restauré) :
  - plafond retiré : le banc et deux lignes tombent ;
  - départ du rapport visé changé : cinq tests tombent ;
  - `casZero` retiré du schéma d'import, et refus du partage neutralisé : E.a et E.b tombent ;
  - côté écran, la spec a d'abord échoué sur les deux défauts qu'elle visait, corrigés depuis : menus « vaut 0 » à 23 px sous WebKit, saut de défilement.
- **Playwright WebKit** (`critere-algorithmique-calculs-4a.spec.js`) :
  - les trois cartes, le réglage tapé, les menus « vaut 0 » : la copie fictive suit, le focus revient au champ, le défilement ne bouge pas ;
  - une vraie copie, codes posés dans Annoter, en pénalité fixe : « Note = 20 − 3 × 2 = 14 / 20 », 70 %, D. Ce qui s'enregistre garde ses six clés d'avant ;
  - une étendue à 0 : « Le compte des mots vaut 0 : la note est 0 / 20. », puis « Aucune note » (ligne masquée, niveau retiré) ;
  - le piège 2 ;
  - 1 440, 1 180, 820 et 700 px : aucun défilement de côté, rien ne dépasse des cartes, des cibles d'au moins 40 px.
- **Captures** (`CAPTURES_CALCULS_4A=<dossier>`) : 1 440 et 820 px, clair et sombre, les deux disciplines, relues.
- **Le stock** : la réparation de #1142 passe par `formulesAlgo.calculer`, couvert par l'équivalence ; ses specs sont vertes. Le relevé du lot 3a est vert. Ouvrir une évaluation n'écrit rien (mesuré, piège 2).
- **Sentinelles ajustées, chacune avec son motif écrit** :
  - #467 : interpolations nues 105 → 109 ;
  - #522 : écritures de `grilles.js` 21 → 19 ;
  - complexité : 447 → 446 ;
  - #667, #701, le lot de mots (ses textes lus dans les TEXTES du 26 oct.), les noms, la présentation, le lot 4, le miroir.

## 5. Portes terrain : aucune

Les deux règles de tête du skill s'appliquent : la note est éprouvée par machine, et rien n'écrit dans les données de Grégoire. **Ce que je n'ai pas pu vérifier** :

- le menu natif des « vaut 0 » sur l'iPad réel (WebKit de bureau seulement). C'est de l'apparence : il le signalera à l'usage ;
- le corpus réel. Le banc couvre les valeurs, pas ses grilles. Une grille dont un critère porte un modèle inconnu garde son repli historique et sa mention.

## 6. Trouvailles

- **Inscrire, et c'est à Grégoire** (pas de numéro posé, Cowork tranche l'entrée) : rouverte, une copie **verrouillée** montre la note du calcul actuel de sa grille, pas celle qui est enregistrée (mesure du § 1). C'était déjà vrai avant le lot pour un réglage changé. Ce défaut est antérieur au lot, mais 4a le rend plus visible, puisque changer de calcul devient un geste de premier plan.
