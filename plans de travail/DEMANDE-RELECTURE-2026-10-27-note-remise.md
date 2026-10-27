# Demande de relecture – La note remise : une copie verrouillée montre ce que l'étudiant·e a reçu (#1173)

> Claude Code, mardi 27 octobre 2026, sur `main` : `d95f1a84` (docs du § 0, item #1173), puis le commit du lot. Rien de poussé. Consigne : `CONSIGNE-LOT-2026-10-27-note-remise-copie-verrouillee.md`. Vitest 9 854 / 9 854 ; Playwright WebKit : la spec du lot (9 tests et les captures) et les 79 specs qui touchent l'ouverture, le verrou, la note ou les phrases retouchées, 359 verts, 2 instables (#916, condensé des grilles) verts à la relance sans reprise. Le verdict complet de la suite n'est pas pris (au signal de Grégoire, avec le push).

## 1. Ce qui a été fait

- **Une copie verrouillée affiche la note remise** (`js/evaluation-calcul.js`, au bout de `calculerNote`). La copie se trouve dans la base comme l'auto-save la trouve : élève, production, évaluation non remplacée. Le lot ne passe ni par `idModification` ni par un drapeau en mémoire : `evaluationEnCours` a deux emplacements (#646). Les deux chargeurs passent donc par le même point, et les recalculs différés aussi (100, 200, 350 ms), puisque chacun finit par `calculerNote`.
  - **Ce qui vient de la base** : la note et le niveau de la production. Pour un critère algorithmique : sa note, son pourcentage, son niveau, sa couleur et la phrase enregistrée (`donneesAlgorithmiques[c].retroaction`, sinon `criteres[].retroaction`). Il en va de même de la ligne « à copier-coller » des niveaux. Les niveaux des autres critères et les points revenaient déjà de la base.
  - **La ligne chiffrée** d'un critère algorithmique ne reste que si le calcul actuel redonne la note enregistrée, à la précision affichée.
  - **La note actuelle** se calcule comme avant, mais à part. Elle n'est que dite, dans la ligne. `noteCalculeeCourante` porte la note remise.
  - **La portée** (#674) se tait sur une copie verrouillée : elle parle du calcul actuel.
- **La ligne** (`#noteRemise1`, sous la note, `textContent`) : « Note remise : 70 %. Avec le calcul actuel de la grille, elle serait de 85 %. Déverrouille l'évaluation pour l'appliquer. » Les deux nombres passent par `formaterNotePourcentage`, et la comparaison se fait sur ces deux textes : un écart d'arrondi ne donne aucune ligne. Il n'y en a pas non plus sans note (« Incomplet ; travail en cours », note nulle ou absente) : l'écran se comporte alors comme avant. Style : l'encadré « information » des deux modes, placé à côté de celui de la portée.
- **Déverrouiller** (`_deverrouillerEvaluation` → `afficherCalculActuel`) : chaque critère algorithmique se recalcule à l'écran, puis la note, sans aucun événement. Ce recalcul est le corps de `_forcerRecalculAlgorithmiqueAvantSauvegarde`, extrait en `_recalculerCriteresAlgorithmiques`, sans la propagation des compteurs : celle-ci émet un `input`, qui armerait l'écriture.
- **Les remises à zéro du formulaire** (trois sites) taisent la ligne.
- **§ 1.3, la phrase sous les cartes, posée** : « Une copie déjà évaluée garde sa note. Elle ne suit le nouveau calcul que si tu la déverrouilles et la modifies. » La preuve du § 5 la rend vraie (voir § 4).
- **§ 4, la retouche du miroir** : « Sans limite fixée, ces copies ont la longueur fixée dans le calcul : à cette longueur, chaque X coûte un point. » La condition mesurée est bien « aucune limite fixée » : `sourceEtendue` ne rend `'facteur'` que pour un critère qui ne projette pas, car une limite fixée sans longueur se normalise en `null`, que `Number` lit comme 0, fini. Elle rend donc `'projection'`.

## 2. Ce que la mesure a dit (et que la consigne ne savait pas)

1. **Le PDF lit la base, pas l'écran.** `trouverEvaluationPourSynthese` (`travaux-export-pdf.js`) passe par `obtenirDonneesSelonMode('evaluationsSauvegardees')`, comme la fenêtre « Révision avant export » (`travauxResolution.trouverEvaluationPourFichier`). Le PDF portait donc déjà la note remise avant le lot ; le banc le vérifie par le vrai trajet.
2. **La fixture du piège 2 du lot 4a n'était pas cohérente.** Avec la pénalité proportionnelle, 15 erreurs pour 500 mots donnent déjà **85**, pas 70 : « rien de changé » l'a trouvé. Le banc du lot passe à 250 mots (70 en proportionnelle, 85 en pénalité fixe). La conclusion du piège 2 tient (l'écran ne montrait pas la base), mais son 85 était le calcul de la fixture, pas un effet du changement.
3. **Causes rencontrées** : un calcul changé (70 → 85) et une pondération changée sur deux critères holistiques (50/50 → 30/70 : 70 → 74). Une échelle ou une pratique changées passent par le même `calculerNote`, mais **aucun essai ne les couvre**.

## 3. Les suppositions que j'ai faites seul

> **Acceptées telles quelles par Cowork le 27 oct.** (1, 2, et pas d'essai de plus pour une échelle ou une pratique changées.)

1. **A2025 et H2026 : la note remise, sans la ligne.** Le § 3.4 dit que rien ne s'y recalcule ni ne s'y propose, et `CLAUDE.md` interdit d'y signaler une note. La ligne propose de déverrouiller pour appliquer : elle ne paraît pas sur ces deux trimestres, et la note affichée est celle de la base. La liste `['a2025', 'h2026']` existe désormais en **trois** copies (avec `comptes-erreurs-stock.js` et `cartouches-decalees.js`). Issue : **commenter et oublier** (même liste, même décision, sans conséquence observable).
2. **« Déjà évaluée » veut dire « verrouillée »** : depuis le lot C, enregistrer, c'est verrouiller. Une copie restée déverrouillée (brouillon) montre le calcul actuel dès sa réouverture, comme avant ; la base ne change qu'au premier geste. C'est sur cette lecture que la phrase du § 1.3 est vraie.
3. **Sans note, rien ne change.** Une copie verrouillée sans note numérique, ou marquée « travail en cours », n'est pas réécrite à l'écran depuis la base.
4. **La pondération est changée en base dans le banc**, comme l'écrit l'éditeur, et non par le geste de l'éditeur. Le calcul, lui, passe par le geste de l'atelier.

## 4. La preuve

- **Vitest** (`tests/unit/note-remise-1173.test.js`, 8 tests) :
  - la ligne : notes égales, différentes, égales à l'arrondi près, ou absentes, et le texte avec ses deux nombres ;
  - la copie retenue : verrouillée avec une note, déverrouillée, sans note (trois formes), autre copie, évaluation remplacée.
  - **Break-tests** (chacun restauré, `cmp` identique) : comparer les nombres bruts fait rougir A.c ; retirer la garde « travail en cours » fait rougir B.c ; retirer la garde du verrou fait rougir B.b.
- **Playwright WebKit** (`tests/integration/note-remise-1173.spec.js`) :
  - calcul changé et pondération changée, ouverts par les deux chemins (« Modifier », puis l'élève et la production) : 70 %, D, la ligne, la phrase enregistrée, la ligne chiffrée tue ; le stockage est identique avant et après ; le PDF (vrai trajet, `exporterDossierComplet`, sans copie) est construit sur 70 et D, avec la phrase enregistrée ;
  - déverrouillée : 85 % (ou 74 %), la ligne chiffrée « Note = 100 − 15 × 1 = 85 / 100 », aucune ligne ; seul le verrou a bougé en base ; au premier geste, elle s'enregistre à 85 ;
  - rien de changé, à 1 440 et 820 px : aucune ligne, la ligne chiffrée reste, aucun défilement de côté ; la ligne tient dans l'encadré ;
  - H2026 : la note remise, aucune ligne.
  - **Break-test** : `evaluationRemiseAffichee` rendue nulle fait rougir les six essais à changement ; les deux « rien de changé » restent verts.
- **Le piège 2 du lot 4a** (`critere-algorithmique-calculs-4a.spec.js`) attend maintenant 70 sur la copie verrouillée ; il est vert. La phrase du § 1.3 y est vérifiée.
- **Sentinelles** : complexité (`calculerNote` 27 → 29, l'affichage de la note remise extrait en fonctions sous 15) ; anti-cache (`?v=` du jour du build, 1026).
- **Résultats** : Vitest 9 854 / 9 854. Les 79 specs WebKit voisines, choisies par `grep` sur verrou, `noteProduction1`, `modifierEvaluation`, `calculerNote` et les phrases retouchées : 359 réussis, 0 échec, 2 skipped ; 2 instables (`cours-actif-hors-bibliotheque-916`, `grilles-sous-criteres-condense`), verts à la relance sans reprise, étrangers au lot.
- **Captures** (`plans de travail/captures-2026-10-27-note-remise/`, `CAPTURES_NOTE_REMISE=<dossier>`) : la copie verrouillée avec sa ligne, 1 440 et 820 px, clair et sombre, relues. Le rappel du codex et les notifications sont retirés avant la prise de vue.

## 5. Portes terrain : aucune

Les deux règles de tête du skill s'appliquent : la machine répond (WebKit, deux largeurs), et rien n'écrit dans les données de Grégoire. Le lot ne fait qu'afficher.

**Ce que je n'ai pas pu vérifier** : l'iPad réel. La ligne est un paragraphe de texte dans l'encadré de la note, mesuré à 820 px.

## 6. Ce qui n'est pas fait (§ 6 de la consigne)

Le calcul qui a noté une copie n'est pas gardé sur la copie ; aucune ligne pour une copie déverrouillée ; rien n'est rouvert ni recalculé sur A2025 et H2026 ; le lot 4b n'est pas commencé. Pas de release, de verdict ni de push.
