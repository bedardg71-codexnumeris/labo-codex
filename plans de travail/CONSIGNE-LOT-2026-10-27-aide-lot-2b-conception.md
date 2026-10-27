# Consigne – L'Aide, lot 2b : la Conception dit vrai, en moins de mots (#1152)

> Écrite par Cowork le mardi 27 octobre 2026 à 16 h 32 (Toronto, mesuré par `date`), sur `main` = `ad6484ea` (lot 2a fait et accepté, pas encore en ligne). Ce fichier ne remplace aucune autre consigne : n'y touche pas.
> Plan : `PLAN-2026-10-24-refonte-de-l-aide.md`. Sources, **dans cet ordre** : `audit-aide-2026-10-24/REMESURE-2026-10-27.md` (section Conception ; elle l'emporte sur le dossier pour les entrées qu'elle nomme), puis `AUDIT-AIDE-2026-10-24.md` (décisions D1 à D13, verdicts finals), puis le détail : `lot-2-configuration.md` (`pratique` à `sous-criteres`), `lot-1-introduction.md` (`solo`, `idme`), `lot-3-formation-utilisation-1.md` (`lecons`).
> **Le lot 2a sert de modèle** : même méthode, mêmes règles de mots (son § 3), mêmes tests. Relis `CONSIGNE-LOT-2026-10-27-aide-lot-2a-commencer-cadre.md` et les deux verdicts du 27 oct. : les huit imprécisions qu'ils ont corrigées sont celles à ne pas refaire (un libellé paraphrasé au lieu d'être recopié, un geste dit commun à des écrans qui ne l'offrent pas tous, une case dont on ne dit pas l'état qui agit).

## 0. Avant tout

- Un seul lot à la fois, sur un `main` à jour, aucune suite qui tourne.
- Rituel de début de session.
- Un commit de docs seul, fichiers nommés : ce fichier, `VERDICT-RELECTURE-2026-10-27-aide-lot-2a-retouche.md`, `PLAN-2026-10-24-refonte-de-l-aide.md`. Rien d'autre.

## 1. Le mandat

Les 11 entrées de la Conception deviennent 10 (SOLO et IDME fusionnent). Chacune dit ce que fait l'écran d'aujourd'hui, sans redire ce qu'il affiche ; ce qui est commun à plusieurs écrans renvoie aux entrées de Commencer, « La bibliothèque » et « Les chaînes d'étapes », au lieu de le redire. Environ 3 350 mots aujourd'hui, environ 2 100 visés (estimation ; mesure et dis le chiffre réel). Aucun comportement de l'application ne change ; aucun fichier de `js/` n'est touché sans le dire.

## 2. Les entrées, dans l'ordre de la Conception

Repère chaque entrée par son id (préfixe `accordeon-aide-`). Cibles : le tableau des verdicts finals.

1. **`pratique`** (~170 mots). Une phrase par famille ; « Sur les reprises » part. Les « À régler » restent. Ajouts du dossier : quatre modes de sélection des traces, dont « Hybride » ; une pratique Standards exige une échelle. La chaîne de la pratique : renvoi à « Les chaînes d'étapes ».
2. **`creer-productions`** (~100 mots). Les corrections du dossier (12 types ; « Activité d'apprentissage » ; « Travail diagnostique », « Préparer le PDF », « + Nouveau champ », « Échéances par groupe ») et la remesure (la rangée, « + Nouvelle production » puis « Créer la production » ; la fenêtre de bibliothèque : renvoi). Le « Layout » et « ⚠️ Important » partent.
3. **`lecons`** (~200 mots). Ce que fait la carte, ses trois gestes de base, où trouver le guide ; les gestes de bibliothèque avec leurs libellés (remesure) ; la chaîne de la Carte : renvoi. **La suppression par la corbeille reste absente** : #1070 est ouverte.
4. **`creer-grilles`** (~120 mots). Les corrections du dossier (les pratiques compatibles retirées ; « analytique » en points que son barème décrit ; le total : aucune alerte, une couleur, et une grille toute en points ne se mesure pas à 100 ; aucun bouton PDF sur cet écran) et la remesure (la rangée ; orange sous 100 %, rouge au-dessus, vert à 100 % ; l'étape « Pondération » de la chaîne prend la même couleur). **D5** : c'est ici que se dit, une seule fois, ce qu'est un sous-critère (un élément observable du critère) ; `sous-criteres` dit ce qu'il devient dans un critère algorithmique, et le lexique d'`apporter-grille` (« Élément observable ») ne doit pas en dire un troisième sens.
5. **`apporter-grille`** (~420 mots). Les deux corrections du dossier (la grille en points qui nomme ses niveaux se crée avec un barème, sans échelle ; le groupe « Les codes » et « Ajouter ces codes ») ; retour à l'étiquetage. **Piège** : le bouton s'appelle « Revenir à ma dissection » (`js/materiel.js:115`), et `sentinelle-aide-apporter-mon-materiel` interdit tout mot « dissection » dans un texte neuf ; ne le cite pas, décris le geste, et inscris l'écart au tableau « Trouvé hors de la section Aide » (lot 5). Les six `li` du lexique restent exactement six ; les étiquettes des codes vont hors de cette liste. La carte reste avant `bareme`.
6. **`bareme`** (195 mots, épinglée). F2, le tableau, F4 et F5 ne changent pas. Ajoute ce que l'étudiant·e lit depuis le lot 3 du barème : le chiffre, puis le texte de la tranche atteinte, sans son nom (`js/synthese-retroaction-data.js:598-610`). Le geste d'évaluer avec les tranches appartient à `annoter-evaluer` (lot 2c) : une phrase de renvoi au plus. Regarde d'abord si `TEXTES-2026-10-27-bareme-evaluation.md` (validé) dit déjà ce que lit l'étudiant·e ; si oui, reprends ses mots.
7. **`sous-criteres`**, « Les critères algorithmiques » : **le cœur du lot**. Textes D1 à D8 validés par Grégoire le 21 oct., puis le 22 et le 26 ; épinglés par `critere-algorithmique-mots.test.js` (qui vérifie aussi que chaque chaîne est dans un fichier `TEXTES-…` réglé). Ce qui reste vrai reste mot pour mot : D1, D3, D4, D4b, D5, D6, et les trois `li` D2a à D2c (les calculs tout faits, validés le 26). Ce que la remesure dit faux ou incomplet se réécrit :
   - **D2** : le calcul se choisit dans l'étape « Note calculée » ; un calcul tout fait a un réglage, un calcul que tu composes n'en a pas (ses nombres sont dans ses blocs). Ajoute « Retoucher ce calcul », « Composer ton propre calcul », « Quand une donnée de la copie vaut 0 », et « Ce calcul sert » (à la note, ou à tes phrases et à tes tables seulement).
   - **D2d** : « Le calcul, en blocs », tel que l'écran le montre, et où il paraît au moment d'évaluer.
   - **D7** : ce que lit l'étudiant·e, dans l'ordre : la phrase du décompte, le cas de sa copie, le texte des tables de cas ; le nom court du palier dans le PDF ; la ligne du calcul.
   - **D8** : **mesure d'abord** la règle réelle : copie verrouillée (elle garde sa note remise, #1173), copie déverrouillée qu'on ouvre, copie qu'on modifie ; et la phrase de l'étape « Elle ne suit le nouveau calcul que si tu la déverrouilles et la modifies » (`js/grilles.js:3685`). Une seule règle, dite pareil ici et à l'écran ; si l'écran et le code divergent, arrête-toi sur ce point et dis-le.
   - **Ajoute** l'étape « Cas d'interprétation » (les paliers en table, le seuil en pourcentage de la limite, « Fixer une limite » et « Retirer la limite », ce que fait chacun) et « + Ajouter une table de cas » (les valeurs sur lesquelles une table choisit son texte). Ne liste pas les cinq étapes : la chaîne de l'atelier les montre (renvoi à « Les chaînes d'étapes »).
   - Les phrases réécrites et ajoutées vont dans un fichier `TEXTES-2026-10-27-aide-critere-algorithmique.md`, en-tête « proposés, à valider par Grégoire » ; le banc les lit comme les autres fichiers réglés. Cible : environ 550 mots ; mesure.
8. **`creer-echelles`** (~80 mots). Les champs de l'écran (« Code* », « Nom du niveau* », « Min (%)* », « Max (%)* », « Valeur ponctuelle* », « Couleur », et « Palier SOLO du niveau (facultatif) » quand l'observation SOLO est active), les repères « Suffisant à partir de » et « Maîtrisé à partir de » (l'étape « Repères » de la chaîne) ; l'échelle sert les critères holistiques. La rangée, « + Nouvelle échelle » puis « Créer l'échelle ». « Exemple IDME » part (il passe à l'entrée suivante).
9. **`solo`** absorbe **`idme`** : « SOLO et l'échelle de départ (IDME) » (~150 mots pour les deux). SOLO est une option ; le menu « Complexité SOLO du critère », avec « Aucun », ne paraît que si l'observation SOLO est cochée ; ce que le dépistage surveille, avec et sans l'option. La théorie va au guide SOLO intégré (D1). **D2** : le seuil M de Grégoire dit comme son exemple, au conditionnel ; l'application lit « Maîtrisé à partir de » sur l'échelle de chacun ; « prédit la réussite dans le cours suivant » part ; nombres à la française. L'« Échelle de départ (IDME) » sous son nom d'écran, avec la valeur ponctuelle de chaque niveau (`js/echelles.js`). **Gardés** : le tableau SOLO tel quel (écart volontaire, #810), « Autres échelles possibles » et « adaptable à ton contexte » (`sentinelle-audit-aide-lot-E`).
10. **`creer-cartouches`** (~100 mots). Les corrections du dossier (« Aperçu aléatoire » n'existe pas ; les deux champs de contexte et le menu « Consignes du travail » ; « Paliers (bornes en %) » pour une grille analytique ; les exports et l'import texte) et la remesure (« Importer ou exporter ▾ » : renvoi à « La bibliothèque » ; changer la grille d'une cartouche enregistrée en fait une copie, après une question, l'originale intacte). « environ 50 à 75 mots recommandés » part (une prescription).

**Les ids.** `idme` disparaît, `solo` reste ; mesure d'abord ses lecteurs dans `js/` et `tests/`. Les autres ids ne changent pas.

**D2 ailleurs.** Si « organiser, être rigoureux, s'exprimer correctement » ou « doivent rester les mêmes » paraissent dans une entrée de la Conception, même traitement : l'exemple de Grégoire, au conditionnel.

## 3. Les règles de mots

Celles du lot 2a (§ 3), sans changement. Rappel des trois imprécisions du lot 2a à ne pas refaire : recopie le libellé de l'écran au lieu de le paraphraser ; un geste n'est dit « commun » que s'il est offert partout où l'entrée le dit ; une case se décrit par l'état qui agit (cochée ou décochée).

Pour Grégoire, dans la demande de relecture : seulement les phrases qui disent quelque chose de l'application au-delà d'un libellé d'écran (décision de Cowork du 27 oct., 15 h 40), et **toutes** les phrases réécrites ou ajoutées de `sous-criteres` (ce sont ses textes validés).

## 4. Les tests

- Les sentinelles de l'Aide avant de toucher, comme au lot 2a, plus `critere-algorithmique-mots` (unit et spec), `bareme-2-pieces-d-aide`, `bareme-2-aide`, `sentinelle-aide-apporter-mon-materiel`, `materiel-aide-accompagnement`.
- Une assertion qui tombe par décision (fusion, correction, réécriture de D2, D2d, D7, D8) : adapte-la en citant l'audit, la remesure et cette consigne. Une autre : arrête-toi et dis-le. Le banc `critere-algorithmique-mots` exige exactement trois `li` dans `sous-criteres` : si les ajouts du D2 se font en `li`, le banc suit ; sinon, garde trois `li`.
- **Une sentinelle neuve**, `tests/unit/sentinelle-aide-2026-10-27-lot-2b.test.js`, calculée des deux côtés : la Conception a les entrées du § 2 dans l'ordre, `idme` absente ; aucune entrée de la Conception ne dit « sidebar », « barre latérale », « Layout », « dropdown », « Workflow », « Aperçu aléatoire » ; chaque libellé de bouton cité entre « » dans les entrées 2, 4, 8 et 10 existe dans `index.html` ou `js/` hors de l'Aide (lu, pas recopié). Break-test, arbre restauré par sha256.
- **Un essai Playwright ciblé** : la recherche de l'Aide trouve « Cas d'interprétation », « Composer ton propre calcul » et « IDME ».
- Vitest depuis `tests/`.

## 5. Ce qui n'entre pas

L'Évaluation et le Suivi (lot 2c), dont le geste d'évaluer avec le barème et la note remise vue depuis la copie ; le Labo (lot 2d), dont `grille-depistage` ; le glossaire (lot 3) ; les sept trous (lot 4) ; les textes d'écran hors de l'Aide (lot 5).

## 6. Clôture

- `BACKLOG.md` : sous #1152, le lot 2b ; le plan dit « 2b : codé, en relecture ».
- Demande de relecture : `plans de travail/DEMANDE-RELECTURE-2026-10-27-aide-lot-2b.md`, sur le modèle de celle du lot 2a (entrée par entrée, mots avant et après, preuves `fichier:ligne`, tests, « Pour Grégoire », captures de `sous-criteres` et de `solo` à 1 440 et 820 px).
- Pas de release, de verdict ni de push sans le signal de Grégoire.
- Le geste à vérifier à l'écran après la mise en ligne : Aide › Conception, « Les critères algorithmiques » dit l'atelier d'aujourd'hui ; chercher « IDME » mène à une seule entrée.
