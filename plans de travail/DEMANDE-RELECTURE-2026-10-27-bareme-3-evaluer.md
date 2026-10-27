# Demande de relecture – Le barème, lot 3 : évaluer une copie avec le barème, et ce que l'étudiant·e lit (#1120, gestes 3 et 4)

> Claude Code, mardi 27 octobre 2026, sur `main`. Commits : `a9fedb71` (la consigne et les textes), `be70a81a` (le lot), puis cette demande. Rien de poussé. Consigne : `CONSIGNE-LOT-2026-10-27-bareme-3-evaluer.md` ; textes : `TEXTES-2026-10-27-bareme-evaluation.md` (validés 10 h 31). Vitest 9 943 tests verts (831 fichiers) ; Playwright WebKit : la spec du lot (10 essais et les captures) et 53 specs voisines, 231 réussis, 2 sautés, 0 échec, aucun instable. Le verdict complet de la suite n'est pas pris (au signal de Grégoire, avec le push).
>
> **Avant le lot, le lot 4c** : il était codé mais ni testé ni commité (session interrompue). Grégoire a choisi de le clore d'abord (10 h 35) : `21cf7a84` et `f227dfb5`, demande `DEMANDE-RELECTURE-2026-10-27-calculs-4c.md`.

## 0. Ce que la mesure a contredit, et ce que Grégoire a tranché

La consigne plaçait le texte de la tranche dans `lectureNiveauCritere` (PDF) et `_lectureNiveauBilan` (application). Mesuré : ces deux fonctions n'écrivent le chiffre que dans les **lignes du bilan** (« Présentement… – Langue (15 / 30) : La forme », « Ta force : … »). Le **bloc de chaque critère**, là où le chiffre a quelque chose dessous, est ailleurs : `renderCritere` (`synthese-retroaction-rendu.js`) pour le PDF, `_rendreCommentairesCriteres` (`evaluation-retroaction.js`) pour le texte de l'application (celui de LÉA). Et un critère analytique **a** déjà un commentaire de cartouche sous son chiffre quand une échelle en déduit un niveau (lot 3 du 4 sept.) : le plan le croyait sans cartouche.

**Grégoire, 27 oct. (question fermée, option recommandée)** : dans le bloc du critère, le chiffre, dessous le texte de la tranche, puis le commentaire de la cartouche s'il y en a un ; les lignes du bilan gardent le chiffre seul.

## 1. Ce qui a été fait

- **La lecture unique** (`js/bareme.js`), trois fonctions neuves et pures :
  - `valeursOffertes(t)` : une valeur seule ; les entiers de `pointsMin` à `pointsMax`, bornes incluses ; au-delà de 20, ou sans aucun entier, les deux bornes ; rien pour une tranche à compléter.
  - `lectureDesPoints(tranches, points)` : `{ tranche, horsBareme }`, par `trancheDesPoints`.
  - `texteAtteint(critere, points)` : le texte de la tranche atteinte, sans son nom ; « » sinon.
- **Geste 3, à l'évaluation** (`js/evaluation-chargement.js`) :
  - Les deux surfaces (`afficherCriteresDepuisGrille`, `cartoucheSelectionnee`) appellent désormais un seul gabarit, `_saisiePointsHtml` : le barème, puis le champ. Hier, deux copies du même champ ; les deux essais de la sentinelle du lot 2 (E.c, E.e) qui les comptaient comptent maintenant le gabarit et ses deux appels.
  - Les tranches dans l'ordre du barème : nom (s'il y en a un), points (`pointsEnTexte`), texte (`pre-line`) ; lisibles sans toucher.
  - Toucher une tranche (`toucherTrancheBareme`) : ses valeurs paraissent SOUS elle, dans sa ligne ; un second toucher les replie ; rien au-dessus ne bouge, rien ne se replie ailleurs (mesuré : le haut de la tranche touchée reste au pixel). Une tranche d'une seule valeur pose ses points d'un coup.
  - Toucher une valeur (`poserPointsBareme`) : la valeur dans le champ, puis l'événement `input` du champ. C'est exactement le chemin de la frappe (`pointsSaisis`) ; aucune autre écriture.
  - `pointsSaisis` appelle à sa fin `_marquerBaremeEval` : la tranche des points du champ se montre choisie (`aria-pressed`), que les points viennent d'un toucher, de la frappe ou d'une copie rouverte. Points qu'aucune tranche ne couvre : la marque H3.
  - Une tranche sans points : la marque H4, aucun bouton.
  - H1 sur la liste des tranches, H2 en `label` du champ, H3 et H4 avec leurs bulles ; les trois clés neuves au catalogue (`bareme-eval`, `bareme-eval-hors-bareme`, `bareme-eval-a-completer`).
- **Le verrou et la remise à zéro** (`js/evaluation.js`) : `desactiverFormulaireEvaluation` désactive les boutons du barème ; le formulaire vidé sans la frappe démarque les tranches (`marquerBaremesEvaluation`).
- **Geste 4** :
  - PDF : `construireCriteres` reçoit `tranche` (`texteDeLaTranche` → `bareme.texteAtteint`) ; `renderCritere` le pose sous le chiffre, avant le commentaire, échappé, sauts de ligne gardés. Le rendu reçoit le texte, il ne le calcule pas.
  - Application : `_rendreCommentairesCriteres` écrit « Critère 2 (Résumé) — 3 / 5 », puis le texte, puis le commentaire (`_texteTrancheBilan`, même lecture).
- **Le style** (`styles.css`, `.eval-bareme-*`) : variables de `design-system.html` ; cibles de 44 × 44 px, 8 px d'écart ; survol sous `@media (hover: hover)` ; marques neutres (bordure pointillée, `--texte-secondaire`), ni alerte ni erreur ; un bouton désactivé garde son opacité (il se lit).
- **En passant, corrigé maintenant** (`js/travaux-visionneuse.js`, une ligne) : quand un fichier est ouvert, `onPanKeyDown` prenait la barre d'espace pour le déplacement, sauf dans les champs. Espace n'activait donc **aucun bouton** des palettes. Les boutons sont ajoutés à l'exception. Issue : *corriger maintenant*, parce que la consigne exige « Tab, puis Entrée ou Espace » et que la spec le rejoue.
- **Les fichiers servis** : `?v=` neufs, au jour du build (`20261026`), jamais servis (script anticache vert).

## 2. Ce que la mesure a dit d'autre

1. **Deux tranches qui se chevauchent** (§ 3.2) : `trancheDesPoints` rend la **première dans l'ordre écrit**. « 3-4 » puis « 4-5 » : 4 choisit « 3-4 », à l'écran comme au PDF ; dans l'ordre inverse, « 4-5 » (banc T.f).
2. **Le texte du PDF vient du barème actuel** (§ 3.3) : la copie n'enregistre que ses points (mesuré en WebKit : aucun identifiant, nom ni texte de tranche hors de `retroactionFinale`, et mêmes champs qu'une copie sans barème). Un barème réécrit après la remise change donc le texte d'un PDF refait plus tard ; la note ne bouge pas. **Une nuance** : `retroactionFinale`, le texte de l'application enregistré avec la copie, porte la phrase du moment de l'enregistrement. Rien n'a été changé à cela.
3. **Le stock** : les copies déjà évaluées sur un critère à barème (depuis le 20 oct.) liront le texte de leur tranche au prochain PDF. C'est la livraison du geste 4, pas un effet de bord ; aucune donnée n'est réécrite.
4. **Le zéro** : 0 est une valeur ; dans l'exemple Journal de lecture, « Insuffisant » est à compléter, donc 0 y est « hors barème ».

## 3. Les suppositions que j'ai faites seul (à corriger d'un mot)

1. **Une plage sans aucun entier** (2,2 à 2,8) offre ses deux bornes, comme au-delà de 20 : ce sont des valeurs de la tranche, pas des valeurs fabriquées.
2. **Une tranche d'une seule valeur décimale** (2,5) offre 2,5.
3. **Un second toucher replie** les valeurs d'une tranche ; toucher une autre tranche ne replie pas la première (replier au-dessus déplacerait la tranche sous le doigt).
4. **« hors barème » se tient à droite de « sur 5 »**, sur la ligne du champ.
5. **Au PDF, le texte de la tranche est dans la colonne du commentaire**, au-dessus de lui : la colonne du chiffre (135 px) ne peut pas porter un texte.

## 4. La preuve

- **Vitest** (`tests/unit/bareme-3-evaluer.test.js`, 24 tests) :
  - V, les valeurs offertes : une valeur (3, 2,5, 0), plusieurs, des bornes décimales (2,5 à 4 → 3 et 4), 20 et plus de 20, aucun entier, à compléter ;
  - T, la tranche des points : dedans, aux bornes, le zéro, hors barème, sans points, sans barème, à compléter jamais choisie, deux tranches qui se chevauchent ;
  - L, le texte lu : sans le nom, sauts de ligne gardés ; rien hors barème, sans texte, sans barème, holistique ; l'ancien format ;
  - P, le PDF : les données (`construireFeedback`), le rendu (chiffre, texte, commentaire, dans cet ordre), un critère sans barème rendu **à l'octet** comme sans le champ `tranche`, le `<img onerror>` ;
  - I, l'invariant 1 : `evaluation-calcul.js` et `profil-etudiant-calculs.js` ne nomment pas le barème ; une valeur touchée ne passe que par l'événement de la frappe ;
  - H, les textes H1 à H4 lus dans le fichier validé et comparés au catalogue et aux constantes.
  - Sentinelles retouchées, avec leur motif dans le code : `bareme-1-editeur.test.js` I.a (quatre modules d'affichage nomment le barème ; aucun module de calcul) ; `sentinelle-lot2-analytique-points.test.js` E.c et E.e (un gabarit du champ, appelé deux fois).
- **Playwright WebKit** (`tests/integration/bareme-3-evaluer.spec.js`, par le chemin de Grégoire : Annoter, la copie, « Évaluer », la palette dans la visionneuse) :
  - les deux surfaces (sans et avec cartouche) : les tranches lisibles avant de toucher, H1 à H4 ; toucher « Satisfaisant » (le haut de la tranche ne bouge pas, rien en mémoire), puis 4 ; « Partiel » d'un coup ; 2,5 et 0 « hors barème » ; 5 tapé choisit « Remarquable » ; le champ vidé ; au clavier, Entrée ouvre, Option + Tab atteint la valeur, Espace la pose ; un critère sans barème sans rien de neuf ;
  - la copie enregistrée (les deux surfaces) : `pointsAnalytiques` seuls, aucun identifiant, nom ou texte de tranche ; le bilan « — 3 / 5 », le texte, puis « CARTOUCHE c2_D » ; verrouillée, les boutons désactivés, le texte lisible, un toucher ne change rien, rien ne s'écrit ; **le PDF par `exporterDossierComplet`** : « 3 / 5 », le texte et son saut de ligne, puis la cartouche, jamais « Satisfaisant » ; le PDF n'écrit rien ;
  - **l'invariant 1** : la même copie avec et sans barème (Contenu M, 2,5, 20) donne la même évaluation enregistrée, champ pour champ, le même PDF et le même bilan à l'octet ; 2,5 est hors barème, donc le chiffre seul ;
  - la sécurité : `<img onerror>` dans le nom et le texte d'une tranche, en texte à l'écran, au bilan et au PDF, `window.__piege` jamais posé ;
  - 1 440, 1 180, 820 et 700 px : aucune cible sous 44 × 44 px, 8 px entre deux valeurs, rien ne déborde, aucun défilement de côté.
- **Break-tests** (chacun restauré, `cmp` identique), dix :
  - Vitest : plus de 20 valeurs toutes offertes → V.d ; « hors barème » toujours faux → T.c, T.e ; le nom lu au lieu du texte → L.a, L.d, P.a, P.b, P.d ; le texte du PDF non échappé → P.d ;
  - WebKit : une valeur touchée sans l'événement de la frappe → les deux essais des gestes ; la marque retirée de `pointsSaisis` → les gestes ; le verrou qui manque les boutons → la copie enregistrée ; Espace de nouveau pris par la visionneuse → les gestes ; le nom de tranche non échappé → la sécurité ; le bilan sans le texte → la copie enregistrée.
- **Bancs voisins** : 53 specs WebKit choisies par `grep` (barème, points analytiques, évaluation, verrou, rétroaction, synthèse, PDF, visionneuse, annotation, tout ce qui lit `eval_pts_`, `pointsAnalytiques`, le verrou ou la barre d'espace) : 231 réussis, 2 sautés, 0 échec.
- **Captures** : `plans de travail/captures-2026-10-27-bareme-3-evaluer/` (16 : rien de choisi, une tranche ouverte, hors barème, le critère dans le PDF ; 1 440 et 820 px, clair et sombre).

## 5. Portes terrain : aucune

Les deux règles de tête du skill : la machine répond (WebKit, deux surfaces, quatre largeurs, la vraie copie, son PDF par `exporterDossierComplet`), et aucun raté n'est irréversible (seuls les points s'écrivent, comme avant ; rien du barème n'entre sur la copie). **Non éprouvés, déclarés** (plan, « Portes et déclarations ») : le toucher sur l'iPad et le zoom.

## 6. Ce qui n'entre pas (§ 6)

Le barème d'un critère algorithmique ; des cartouches par tranche ; l'objectif d'intervention en tranches ; un texte de tranche gardé sur la copie. Pas de release, de verdict ni de push.

## 7. Clôture

- `BACKLOG.md` : #1120, lot 3 livré ; la fiche reste ouverte : sa clôture revient à la relecture (les quatre gestes sont faits).
- Le skill `pratiques-notation` a son § 7 ter, « Le barème d'un critère analytique ».
