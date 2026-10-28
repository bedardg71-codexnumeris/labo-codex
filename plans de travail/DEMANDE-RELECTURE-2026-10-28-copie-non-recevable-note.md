# Demande de relecture – Une copie non recevable vaut ce que la règle dit, dans le calcul (28 octobre 2026)

> Écrite par Claude Code le mercredi 28 octobre 2026, sur `main`. Consigne : `CONSIGNE-LOT-2026-10-28-copie-non-recevable-note.md` (commitée en `f9bcc46a`, avec le verdict du lot 2c). Code : `c177cc36`. BACKLOG : **#1175** (le défaut, coché), **#1176** (le chantier de Grégoire). Pas de release, pas de verdict Playwright complet, pas de push.

## En bref

- La règle de Grégoire du 15 oct. devient le **comportement par défaut, posé à un seul endroit** : `VALEUR_COPIE_NON_RECEVABLE_PAR_DEFAUT` (`js/pratiques/pratique-registre.js:918`), lu par deux fonctions, `valeurCopieNonRecevable` (`:928`) et `noteRetenueParLeCalcul` (`:938`). Plus aucune famille ne lit `statutIntegrite`.
- La règle se lit **au calcul, sur le statut**. Les copies déjà verrouillées la suivent **sans qu'on écrive dans leurs données** (stock et source, par la lecture). Les captures déjà prises gardent leurs valeurs jusqu'à « Recalculer les captures » : je ne les ai pas recalculées.
- Les menus : le bloc est **retiré**, pas réparé (§ 3).
- Ce que voient l'enseignant·e et l'étudiant·e : mesuré, rien de changé. **Le PDF de l'élève dit 87,5 % pour une copie qui compte 0** (§ 4, pour Grégoire).

## 1. Le tableau famille × chemin, avant et après

Mesuré au banc de la sentinelle (modules réels, même montage que #716). La copie non recevable vaut E et M (87,5), Alice l'a, Bruno est le témoin.

| Famille | Chemin | Avant | Après | Ce que dit la règle |
|---|---|---|---|---|
| Sommative | P, Comparateur, captures | **89** (87,5 compté) | **54** (0 × 40 + 90 × 60) | vaut 0 |
| Sommative | Récit du Comparateur (ligne de la copie) | note 87,5 | note 0 | idem |
| Sommative | Reprise qui remplace la copie | 84 | 84 | la reprise la remplace (déjà vrai) |
| Sommative configurable | Verrou de l'assistant (« Dissertation » < 60 → plafond 40) | **54**, pas de plafond | **40** | vaut 0, donc le verrou se déclenche |
| Spécifications | P, Comparateur, captures | **100** (87,5 ≥ 70, satisfaisant) | **60** (palier C) | non satisfaisant, même sous un seuil écrit à 0 |
| Standards | Terminale non recevable, profil (`calculerDetailsNoteFinale`), P, Comparateur, captures | **84,8** | **52** | vaut 0 |
| Standards | Terminale, instance `PratiquePANStandards` | **0,848** | **0,52** | vaut 0 |
| Standards | Artefact non recevable, profil | 81,4 | 81,4 | sort du portfolio (**déjà vrai**, `profil-etudiant-actions.js:211-213` avant) |
| Standards | Artefact non recevable, instance, « récents » | **restait au pool** | hors du pool (81,4) | sort du portfolio |
| Standards | Hybride, notes finales, obligatoire non recevable | 76,3 | 76,3 | vaut 0 (**déjà vrai** : écartée du pool, comptée au dénominateur) |
| Dénotation | P, Comparateur | 78 (jugement) | 78 | aucune copie n'entre par calcul (**déjà vrai**) |
| Toutes | Complétion (C) | non remise | non remise | inchangé (`evaluationCompteCommeRemise`, lot 30) |

Les familles n'ont rien eu à changer de ce qu'elles calculent ailleurs : je ne me suis arrêté sur aucune.

## 2. Les preuves au code

- Sommative : `js/pratiques/pratique-sommative.js:104` (P), `:183` (récit, la note retenue pour la parité).
- Sommative configurable : `js/pratiques/pratique-configurable.js:350` (le verrou lit la note retenue).
- Spécifications : `js/pratiques/pratique-pan-specifications.js:798` (`_estTravailAcceptable`).
- Standards, instance : `js/pratiques/pratique-pan-standards.js:176` (pool), `:185-223` (tri et somme sur la note retenue), `:268` (terminale).
- Standards, profil : `js/profil-etudiant-actions.js:212` (pool), `:220-302` (tris et sommes), `:357` (terminale), `:582` (récit).
- Comparateur : `js/comparateur-pratiques.js:174` (la colonne « Niveau atteint » lit le prédicat du registre, même effet qu'avant).
- Captures : `snapshots.js` passe par `calculerNoteDuCours`, donc par les familles ; aucun changement dans le fichier.

**Pourquoi trier et sommer sur la note retenue**, alors qu'aujourd'hui la copie sort du pool : c'est ce qui permet au réglage de #1176 de remplacer la règle sans toucher aux familles. Un essai le simule (la copie reste au pool, à 0) ; trié sur 92, le portfolio tomberait à 72,4 au lieu de 81,4.

## 3. Les menus : retirés, pas réparés

Le bloc de `changerStatutIntegrite` (`js/evaluation-sauvegarde.js:600-604`, commentaire) qui passait les critères à « 0 » et les désactivait est retiré. Trois motifs :

1. La règle vit désormais dans le calcul. Si les menus l'écrivaient aussi, il y aurait deux sources, et la copie perdrait l'évaluation réelle de l'enseignant·e (E, M), dont un réglage futur aurait besoin.
2. Une échelle sans niveau « 0 », comme l'Échelle de départ, n'a pas ce choix. Le réparer aurait obligé à poser un « 0 » qui n'existe pas.
3. Le sélecteur ne trouvait rien : à l'écran, le retrait ne change rien de ce qui se voyait déjà.

L'avis « Travail non recevable » s'affiche toujours, texte inchangé (§ 5). La ligne de la procédure de l'Aide (`index.html:10723`) dit maintenant ce que fait l'écran : « Non recevable, tes critères gardent ton évaluation et la note de la copie suit la règle ci-dessus ; verrouille ensuite. » Les quatre lignes par famille et le « 7/9 » n'ont pas bougé (sentinelle de l'audit du 15 oct., verte). **Cette phrase est à relire par Grégoire** : c'est l'Aide, pas un texte que lisent les élèves, mais c'est un mot de l'écran.

## 4. Ce que voient l'enseignant·e et l'étudiant·e (mesuré, rien de changé)

Mesuré dans WebKit (spec du lot), sur la copie E et M verrouillée en « Plagiat » :

| Où | Ce qui s'affiche |
|---|---|
| Liste des évaluations | pastille « Non recevable (Plagiat) », « 0 » sous « Statut », niveau « M », note « -- » |
| Formulaire, copie verrouillée | « 87,5 % », niveau « M » ; aucune ligne « Note remise » (#1173 : la note remise est la note calculée) |
| PDF de l'élève | construit sur `noteFinale` 87,5, niveau « M » |
| Indice P (stocké, et `simulerIndices` du Comparateur) | 57 = (0 × 40 + 95 × 60) / 100 ; avant : 92 |

**Le fait à voir** : la note du cours compte la copie 0, alors que le formulaire et le PDF de l'élève disent 87,5 % et « M ». La Liste dit « -- » et « 0 ». Ce qu'une note veut dire et ce que l'élève lit reviennent à Grégoire (§ « Pour Grégoire »).

## 5. Les tests

- `tests/unit/sentinelle-copie-non-recevable-vaut-la-regle-28-oct.test.js` : **32 essais**. Couverture : chaque famille et chacun de ses chemins du tableau ; les témoins (copie recevable, Bruno) ; le stock (la base garde 87,5, le journal n'a aucune écriture dans `evaluationsSauvegardees`, P = 54) ; le réglage simulé ; la source unique (neuf fichiers sans `statutIntegrite`, sans `'plagiat'` ni `'ia'`) ; l'Aide et le retrait des menus.
- **Break-test**, avec l'arbre restauré et contrôlé par sha256 : **16 mutations, 16 rouges**. Elles portent sur le registre (note, satisfaisante), la sommative (P, récit), le verrou, les spécifications, l'instance standards (pool, terminale, tri), le profil (pool, terminale, tri, récit), le Comparateur, les menus et l'Aide. Au premier passage, trois mutations survivaient : le pool de l'instance, le pool du profil et le récit du profil. En « meilleurs », une copie à 0 sort d'elle-même des retenues. J'ai ajouté le jeu « récents » et le réglage simulé, puis rejoué : tout est rouge.
- `tests/integration/copie-non-recevable-note-28-oct.spec.js` : le scénario de bout en bout en sommative (WebKit), vert. Break-test : la sommative remise sur `noteFinale` donne P = 92, la spec rougit ; sha256 restauré.
- Harnais ajustés : `predicats-copie.js` (les deux fonctions neuves), `sentinelle-935` (un stub). L'audit du 15 oct. lisait l'ancienne forme (`select.value = '0'`, le statut relu) ; ses assertions sont réécrites, avec la mention « ↻ ».
- Vitest depuis `tests/` : **838 fichiers, 10 025 essais, verts**. Playwright ciblé : la spec du lot ; #959, lot C (verrouiller) et #1173, soit 23 verts et 1 ignoré ; Comparateur, profil 921, rendu du profil, 542, 909, soit 15 verts. **La suite Playwright complète n'a pas tourné** : il n'y a pas de verdict sur HEAD.
- Jetons anti-cache posés pour les huit fichiers JS (`?v=20261027a`, exigés par le hook).

## 6. Trouvailles hors du lot (non inscrites)

Le dépistage lit encore la note calculée d'une copie non recevable. Les sites : `PratiquePANStandards.calculerPerformanceRecente` (`pratique-pan-standards.js:281`) et `_calculerIndicesTroisDerniersArtefacts` (`:905`), les notes faibles de la sommative (`pratique-sommative.js:379`), et `detecterDefis`, `identifierPattern` et `obtenirDonneesProfil` des spécifications (`pratique-pan-specifications.js:472, 563, 689`). Ce n'est pas la note du cours, et aucun symptôme n'a été vécu. Ils ne sont donc pas inscrits au BACKLOG (règle du 24 août) : à Cowork de dire s'ils entrent dans #1176 ou ailleurs. Trois autres sites relisent encore `statutIntegrite` pour l'**affichage** : la moyenne de la Liste (`liste-evaluations.js:604`), le profil (`profil-etudiant-sections-affichage.js:95, 2744`) et la réconciliation des doublons (`entites/reconciliation-evaluations.js:60`). Ce ne sont pas des familles, je les ai laissés.

## Pour Grégoire

1. **Le PDF et le formulaire disent 87,5 % et « M »** pour une copie qui compte 0 dans ta note du cours (§ 4). Veux-tu que l'élève lise autre chose sur son PDF, et quoi ? Je n'ai rien changé.
2. **Le message de l'écran** (`js/evaluation-sauvegarde.js:620`) dit : « Les critères sont automatiquement à 0. Cette évaluation sera exclue des calculs de moyenne. » Les deux phrases sont fausses : les critères ne bougent pas, et en sommative la copie vaut 0. Texte proposé :
   > **Travail non recevable**
   > Tes critères gardent ton évaluation. Dans la note du cours, la copie vaut ce que dit ta pratique : 0 en sommative, un travail non satisfaisant en spécifications, hors du portfolio en standards. Dans la complétion, elle compte comme non remise.
   > (plagiat seulement :) Un jeton de reprise peut être appliqué pour permettre une nouvelle remise.
3. **La ligne de l'Aide** (§ 3) : « Non recevable, tes critères gardent ton évaluation et la note de la copie suit la règle ci-dessus ; verrouille ensuite. » À valider.
4. **Tes copies déjà marquées de l'automne 2026** : elles suivent la règle dès cette version, sans écriture. Ta note du cours les comptera à 0 en sommative, là où elles comptaient à leur note calculée. Les captures hebdomadaires déjà prises gardent l'ancienne valeur jusqu'à « Recalculer les captures ».
