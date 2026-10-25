# Demande de relecture – Le statut « Incomplet ; travail en cours »

> Claude Code, dimanche 25 octobre 2026, fin de matinée (Toronto). Consigne : `CONSIGNE-LOT-2026-10-25-statut-incomplet.md` (commitée seule, `b616c40f`). Le lot : `62b14bd6`, sur `main`. Pas de release, pas de verdict complet, pas de push.

## En bref

La case « Incomplet ; travail en cours » est dans la palette Paramètres du mode Évaluer, sous l'intégrité. Cochée, elle masque les critères et la note, et l'évaluation s'enregistre toute seule avec le statut, sans note. La copie ne compte jamais dans la note, verrouillée ou non. Elle compte comme remise dans les **cinq** calculs de C (la consigne en nommait trois, voir § 3). « Verrouiller l'évaluation » est refusé tant que la case est cochée. Le remplacement de la copie garde le statut. Une fois la case décochée, l'évaluation redevient ordinaire. Le statut se voit sur la pastille de la copie, dans le tableau des copies, dans la Liste des évaluations et dans le profil. Aucun autre chiffre affiché ne change : c'est démontré par un test d'équivalence (§ 3).

## 1. Le champ de données : `travailEnCours: true`, un champ à part

Ce n'est pas une valeur de `statutRemise`, parce que l'application réécrit ce champ elle-même. Le verrouillage y écrit `'evalue'` (`evaluation-chargement.js`, l. ~596 ; `evaluation.js`, `_lireChampsDOMMod`) et l'import y met `'importe'`. Une valeur `'incomplet'` y aurait disparu au premier de ces gestes. Seul le booléen `true` compte : `'true'` ou `1` ne valent rien (vérifié en Vitest). Une fois la case décochée, la clé est **supprimée**, pas mise à `false` (« aucune trace »).

La règle vit dans `js/pratiques/pratique-registre.js`, à côté des prédicats existants :

- `evaluationTravailEnCours(e)` vaut vrai quand `e.travailEnCours === true` ;
- `evaluationEntreDansLaNote(e)` rend maintenant faux pour une copie qui porte le statut, **verrouillée ou non**. C'est la garde du § 3.3, posée là où se décide l'entrée dans la note ;
- `evaluationCompteCommeRemise(e)` est la nouvelle **règle unique** de la remise pour C. Une copie non remplacée et non non recevable qui porte le statut compte comme remise. Sinon, la règle rend l'ancienne conjonction `entreDansLaNote && !nonRemise && !nonRecevable`.

## 2. Ce que fait la case (supposé ou décidé par moi, à corriger au besoin)

1. **Posée sur une copie déjà évaluée en partie : les critères restent en base, masqués.** La note est retirée (`noteFinale: null`, `niveauFinal: ''`). C'est le modèle de « Non reçu », qui masque l'écran sans toucher la base. C'est aussi réversible : une fois la case décochée, les niveaux reviennent et la note se recalcule au prochain niveau saisi. ⚠ La conséquence est au § 5.
2. **« Verrouiller l'évaluation » est refusé** par la porte (`refuserVerrouTravailEnCours`, au début de `sauvegarderEvaluation`, donc aussi pour le cadenas et pour la palette Annotation, qui y passent). Le message : « Une copie « Incomplet ; travail en cours » ne se verrouille pas : décoche la case pour évaluer la copie terminée. » **Le refus est nécessaire, pas décoratif** : sans lui, la spec montre que la copie se verrouille (break-test, § 6). La garde de `evaluationEntreDansLaNote` couvre en plus une copie verrouillée qui arriverait par import.
3. **La case se désactive sur une évaluation verrouillée** (`desactiverFormulaireEvaluation`), comme l'intégrité.
4. **Enregistrer le statut demande une grille choisie** : l'auto-save exige `grilleId`, comme pour tout le reste. Sur une copie ouverte en mode Évaluer, la grille vient de la production. Une production sans grille n'enregistrerait pas le statut.
5. **La pastille dit « Incomplet », le libellé complet est partout où il tient** (Liste, profil, message du panneau des critères). La pastille de la copie active garde « Incomplet » au lieu de « En cours ».

## 3. Les calculs de C : cinq, et pas trois

Ce que j'ai mesuré dans le code ne correspond pas au § 2 de la consigne :

| Site | Ce qu'il est | Fait |
|---|---|---|
| `pratique-sommative.js`, `calculerDetailsCompletion` | C de la sommative | aligné |
| `pratique-configurable.js`, `calculerDetailsCompletion` | C de la configurable | aligné |
| `pratique-pan-standards.js`, `calculerDetailsCompletion` | C des standards | aligné |
| `snapshots.js`, `calculerIndicesHistoriques` | C historique de l'élève | aligné |
| `snapshots.js`, `capturerSnapshotSeance` | C du groupe (dernier travail) | aligné |
| `liste-evaluations.js`, `calculerCompletionSommative` et `calculerCompletionAlternative` | **lus par personne** | non touchés, commentaire posé |

Les deux calculs de `liste-evaluations.js` que nomme la consigne sont morts. Leur seul appelant, `initialiserListeEvaluations`, ignore ce que rend `calculerEtSauvegarderIndiceCompletion`. L'écriture a été retirée au Tier 6.2, le 3 avril. Ils ne produisent aucun chiffre affiché, je ne les ai donc pas alignés : un commentaire le dit sur place.

**Aucun autre chiffre ne change.** Les cinq sites appellent maintenant la règle unique au lieu de recopier les trois prédicats. Un test Vitest compare la règle et l'ancienne conjonction sur dix cas sans le statut (brouillon, sans note, non reçu, non remis, IA, soupçon, remplacée, portée nulle, `travailEnCours: false`) : elles sont identiques. La condition « arrête-toi » du § 3.4 n'est donc pas atteinte.

⚠ **Les spécifications ne sont pas touchées.** Leur C compte des travaux **acceptables** (note ≥ seuil), pas des remises. Une copie sans note ne peut pas y être acceptable sans jugement. La compter serait une décision pédagogique : je la laisse à Grégoire. Aujourd'hui, une copie incomplète vaut « non acceptable » dans le C des spécifications.

## 4. Ce qui se voit, et où

- **Palette Paramètres** : la case et l'aide courte « Sans note ni jeton ; compte comme remis. », dans `bloc-option-label` avec une cible de 44 px (`case-travail-en-cours`).
- **Panneau des critères** : une classe sur le panneau (`travail-en-cours`) masque `#listeCriteresGrille1` et `#noteFinale1`, et le message s'affiche : « Incomplet ; travail en cours : cette copie n'a pas de note et ne compte pas dans la note de l'élève. Décoche la case dans Paramètres pour évaluer la copie terminée. » C'est une classe, et pas une réécriture de la liste : les rendus des critères réécrivent la liste, pas le panneau.
- **Barre latérale et barre d'outils** : la pastille dit « Incomplet », dans la famille « un geste attendu » (`--alerte-bordure-attention`, comme « À réévaluer » et « Non verrouillée »). Le statut est calculé dans `statutPastilleFichier`, extraite de `genererBadgeFichierImporte`.
- **Tableau des copies** (`determinerStatutFichier`) : « Incomplet », avec son compteur. Ce lieu n'était pas nommé dans la consigne, il affiche pourtant le statut d'une copie.
- **Liste des évaluations** : le badge « Incomplet ; travail en cours » (`badge-jeton-incomplet`, sur le modèle de « Soupçon »), le statut « Incomplet » au lieu de « Non verrouillée », et la note « - ».
- **Profil** : le badge, dans la colonne Note.

## 5. Le PDF de l'élève (mesuré)

Pour une copie incomplète posée **avant tout niveau**, `syntheseRetroactionData.construireFeedback` rend un niveau global vide (`overall.code: ''`), aucune note, et **aucun critère** (`criteria: []` : l'évaluation n'en porte aucun en base ; spec Playwright). ⚠ Une première version de l'assertion vérifiait « tous les critères sans niveau » sur une liste qu'elle ne bornait pas : vraie sur une liste vide, donc tautologique. Elle exige maintenant la liste vide, mesurée. Le statut ne paraît pas sur le PDF : aucun libellé, ni le bon ni un autre. Les PDF des productions suivantes ne la comptent pas dans la trajectoire, qui filtre `noteFinale != null`.

⚠ **Ce que je n'ai pas mesuré, mais qui se déduit du code** : si la case est posée **après** des niveaux saisis, ces niveaux restent en base (§ 2.1). `construireCriteres` les lirait, et le PDF montrerait alors les niveaux des critères, sans note ni niveau global. Ce sont des mots que l'élève lit, la décision revient donc à Grégoire. Il a deux options : vider les critères quand la case est posée, ce qui rend le geste irréversible, ou laisser tel quel.

## 6. Tests

- **Vitest** : `tests/unit/statut-incomplet-travail-en-cours.test.js`, 12 tests. Il couvre la règle (note, remise, témoins, équivalence), les trois familles (1/1 avec le statut, 0/1 sans), la note sommative (la copie verrouillée avec une note reste dehors), les deux C des snapshots (Bea à 100, le groupe à 100 ; témoin à 0 et 50), et les sites de l'écran et de la porte. **Break-test** : avec les deux lignes de la règle retirées, 7 tests sur 12 rougissent.
- **Playwright** : `tests/integration/statut-incomplet-travail-en-cours.spec.js`, 2 essais, vrais clics sur la case, sur « Verrouiller l'évaluation » et sur le menu des niveaux. Avant : note 65, C 1/2. Case cochée : critères et note masqués, pastille « Incomplet », base `{travailEnCours: true, noteFinale: null, verrouillee: false}`, note 65, C 2/2. Après le verrou : rien ne change. Puis la Liste, le profil et le PDF (§ 5). Remplacement : le statut reste, la nouvelle copie s'ouvre cochée. Case décochée : l'évaluation est ordinaire et reste hors de la note. M et M, puis Verrouiller : `{noteFinale: 80, verrouillee: true}`, note 72,5. **Break-tests** : sans la remise pour C, l'essai rougit (« 1/2 » au lieu de « 2/2 ») ; sans la porte du verrou, il rougit aussi (la copie se verrouille).
- ⚠ **Écart, le remplacement** : la nouvelle copie est **posée dans la base**, puis l'ancienne passe par `deplacerEnCorbeille`, au lieu d'être importée par `importerFichier`, qui lève une erreur IndexedDB sous WebKit en `file://`. La modale du doublon n'est pas cliquée. Ce que le banc mesure tient quand même : aucun des deux gestes de « Remplacer l'existant » ne touche aux évaluations, et l'évaluation se retrouve par l'élève et la production (`trouverEvaluationPourFichier`).
- **Specs voisines** (WebKit, 22 fichiers : `evaluation-*`, `evaluer-*`, `verrou-palette-annotation-1024`, `liste-651`, `profil-9*`, et celle du lot) : 119 verts et 1 instable (`evaluer-868` › « Déverrouiller l'évaluation » à 360 px, sans copie, vert au second essai). Relancé seul trois fois, il est vert 6 fois sur 6 : je ne le relie pas à la case. Ce n'est pas la suite complète (règle 7).
- **Vitest complet**, lancé depuis `tests/` : 9 707 verts sur 9 708 (820 fichiers). Le rouge est l'anti-cache, attendu (voir plus bas).

### Les sentinelles que j'ai modifiées, et pourquoi

- `_helpers/predicats-copie.js` et `_helpers/bac-suivi.js` fournissent les deux nouveaux prédicats aux bancs. Sans eux, tous les bancs des snapshots tombaient en TypeError.
- `sentinelle-lot-A-…` (D3), `sentinelle-audit-aide-15-oct-…` et `audit-onglet-suivi-…` (B4) exigeaient que chaque site recopie les trois prédicats. Elles exigent maintenant l'appel à la règle unique dans chaque site, l'**absence** de recopie, et que la règle elle-même lise les trois prédicats. L'intention est la même (« un site qui en oublie un rougit ») et elle est plus forte, puisqu'il n'y a plus qu'un lecteur.
- `fixtures/cliquets/complexite-fonctions-30.json` : des baisses, sans aucune hausse. `liste-evaluations.js` passe de [37, 34, 31] à [37, 31], et `genererLigneHTML` de 43 à 41, après l'extraction de `_statutEtBadgeDeLigne` et de la table `BADGES_STATUT_COPIE`. `_autoSauvegarderCriteres` repasse à 28 grâce à `_echelleManquanteAutoSave`, et `genererBadgeFichierImporte` à 24 grâce à `statutPastilleFichier`.
- ⚠ **`sentinelle-anticache-fichiers-modifies` est rouge, et c'est attendu** : les jetons sont du 25 (`?v=20261025i`) et le build du 24. Elle repasse au vert avec la release du soir (`release.mjs`). Rien d'autre n'est rouge.

## 7. Ce qui voyage

Les évaluations voyagent entières (codex, sauvegarde, import de trimestre) : je n'ai trouvé aucune liste blanche de champs pour elles dans `import-export.js`. `travailEnCours` passe donc tel quel. Un ancien fichier sans le champ s'ouvre comme avant, parce qu'un champ absent veut dire non. Je n'ai rien réparé : seule la source change, le stock déjà écrit ne bouge pas. L'export anonymisé de recherche (`trimestres.js`, l. ~2236) ne porte pas le champ : la copie y sort avec une note `null`.

## 8. L'aide (la phrase exacte)

Dans l'aide de l'évaluation, après « Travail SOUPÇONNÉ (À vérifier) », une carte « Travail INCOMPLET (travail en cours) » :

> La case « Incomplet ; travail en cours » de la palette Paramètres met de côté la copie d'un·e étudiant·e qui n'a pas eu le temps de terminer : elle n'a pas de note et ne compte pas dans la note, aucun jeton n'est utilisé, et elle compte comme remise dans la complétion (C) jusqu'à ce que tu décoches la case pour évaluer la copie terminée.

## 9. Trouvailles en chemin

1. **Les deux calculs de C morts de la Liste** (`calculerCompletionSommative`, `calculerCompletionAlternative`, et leur orchestratrice) : **issue 3**, commentés dans le code. Ils sont sans conséquence observable. Les retirer serait du zéro-dette, mais aucun symptôme vécu ne le demande.
2. **`#travaux-eval-statut-pill` n'existe pas dans `index.html`** : `mettreAJourPillStatut` (`evaluation-sauvegarde.js`) écrit dans le vide depuis le retrait de la pastille de la palette. **Issue 3** : sans effet visible.
3. **Le contraste des pastilles de la famille « un geste attendu »** : du blanc sur `--alerte-bordure-attention` (#c8a060 en sombre) donne environ 2,3:1, sous les 4,5:1. C'était déjà le cas pour « À réévaluer » et « Non verrouillée », et j'ai suivi la famille. **Issue 2**, à inscrire si Cowork le juge utile : rien n'a été vécu.

## 10. Ce qui attend Grégoire (par Cowork)

- Le C des **spécifications** : une copie incomplète doit-elle y compter (§ 3) ?
- Le **PDF d'une copie posée après des niveaux** : faut-il vider les critères quand la case est posée (§ 5) ?

## Le geste à vérifier à l'écran après la mise en ligne

Sur une copie inachevée, en mode Évaluer, coche « Incomplet ; travail en cours ». La note et les critères disparaissent, la copie porte « Incomplet » dans la barre latérale et « Incomplet ; travail en cours » dans la Liste des évaluations, et la note de l'élève ne bouge pas. Sur iPad, vérifie aussi que la case se coche du doigt du premier coup.
