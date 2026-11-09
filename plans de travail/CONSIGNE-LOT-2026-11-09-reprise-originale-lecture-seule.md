# Consigne — lot « La reprise ne reçoit plus les niveaux touchés sur son originale » (9 nov. 2026)

Décidé avec Grégoire le 9 nov. 2026, 9 h 04, en Cowork ; relayé à Claude Code. Texte de la consigne tel que reçu.

LOT : la reprise ne reçoit plus les niveaux touchés sur son originale. Décidé avec Grégoire le 9 nov. 2026, 9 h 04, en Cowork. Défaut que tu as trouvé dans le lot précédent ; il touche des notes, il passe avant la suite des parcours. Écris cette consigne dans `plans de travail/CONSIGNE-LOT-2026-11-09-reprise-originale-lecture-seule.md` et commite-la avec le lot. Branche `lot/reprise-originale-lecture-seule`, partie de `origin/main` à jour.

LE MÉCANISME (lu par Cowork) : `_autoSauvegarderCriteres` (`js/evaluation-chargement.js`, vers la l. 2426) cherche l'évaluation à écrire par élève + production avec `!e.remplaceeParId`, donc l'évaluation en vigueur, pas celle qui est ouverte. Après une reprise, c'est la reprise. Seule protection : une reprise verrouillée n'est pas réécrite. Les chargeurs (l. 355 et 1522) font la même recherche.

CE QUI EST DÉCIDÉ :
1. Technique (Cowork) : toute écriture depuis le formulaire (niveaux, intégrité, mot pour l'étudiant·e, statut, verrou) va sur l'évaluation OUVERTE, identifiée par son id, jamais sur une autre du même couple. Audite tous les call-sites qui retrouvent l'évaluation par élève + production pendant qu'un formulaire est ouvert (enregistrement automatique, enregistrement explicite, verrouiller, déverrouiller, chargeurs) ; dis dans ton rapport ce que chacun faisait et ce qu'il fait.
2. Validé par Grégoire : une originale remplacée par une reprise s'ouvre en lecture seule, comme une copie verrouillée, même si elle n'est pas verrouillée en base. Rien n'est écrit dans ses données pour ça : la lecture seule se décide à l'ouverture. Pour la corriger, il faut la déverrouiller exprès ; ce changement s'écrit alors sur elle.
3. Aucun texte neuf à l'écran si les gestes et les mots de la copie verrouillée suffisent. S'il en faut un, propose-le dans ton rapport ; ne le pose pas.

LE STOCK : ce lot tarit la source. Regarde s'il existe en base un signal fiable d'une reprise réécrite depuis son originale. S'il n'y en a pas, écris « stock non mesurable » avec la raison. Rien n'est réparé ni réécrit.

VÉRIFICATION : une spec Playwright qui reproduit le défaut avant de le corriger (reprise non verrouillée ; on ouvre l'originale ; on touche un niveau ; la reprise est intacte), plus l'originale en lecture seule, plus le déverrouillage qui écrit sur l'originale ; break-test. Vitest depuis `tests/`. Relecture par un agent neuf.

LIVRAISON : release patch après verdict WebKit sur le Mac, puis push et fusion vers main. Propose la ligne des Nouvelles à Grégoire, ne la pose pas sans son accord. Ton rapport en gestes d'utilisateur.

---

## Ce que Claude Code a tranché (9 nov. 2026)

| Question | Décision |
|---|---|
| L'évaluation écrite | `indexEvaluationOuverte` (`evaluation-chargement.js`) : l'évaluation de `idModification`, si elle est du couple affiché. Sans id (copie ouverte avant que son évaluation soit connue) ou id d'un autre couple (resté d'une copie précédente) : l'évaluation en vigueur du couple, comme avant — c'est celle que ces chargeurs ouvrent. Id introuvable (supprimée entre-temps) : rien n'est écrit si une autre du couple existe ; sinon l'écrivain en crée une, comme avant. |
| La lecture seule | `evaluationEnLectureSeule` (`evaluation.js`) : verrouillée en base, ou originale remplacée (`remplaceeParId`) non déverrouillée exprès. Décidée à l'ouverture (`modifierEvaluation`), rien n'est écrit. |
| Doublon réconcilié (#360) | Il porte `remplaceeParId` : en lecture seule lui aussi. **Supposé** : il ne compte nulle part, une écriture y serait invisible. |
| « Déverrouillée exprès » | Un seul état : l'instantané d'avant modification (`_snapshotAvantModifRemplacee`), celui que « Verrouiller » consomme pour journaliser la modification après reprise. Toute autre ouverture l'efface : rouverte par « Consulter », l'originale est de nouveau en lecture seule. |
| Les deux gestes exprès | « Déverrouiller » du panneau Paramètres (le bouton de la palette Annotation, lui, porte toujours sur l'évaluation en vigueur de la copie affichée — la reprise : comportement d'avant, #1142) ; et « Modifier l'évaluation » sur la ligne « Remplacée » de la Liste, déjà là, qui reste un déverrouillage exprès. **Supposé** : ce menu, propre aux originales remplacées, est un geste exprès. |
| Déverrouiller une originale non verrouillée en base | Rien à écrire : le formulaire s'ouvre, le message est celui du déverrouillage. Verrouillée en base : le déverrouillage s'écrit sur elle, comme avant. |
| Textes | Aucun texte neuf : à l'ouverture, « Évaluation chargée en lecture seule (verrouillée) » et le bouton « Déverrouiller », les mots de la copie verrouillée. |

## Les call-sites (consigne, point 1)

| Où | Ce qu'il faisait | Ce qu'il fait |
|---|---|---|
| Enregistrement automatique (`_autoSauvegarderCriteres`) : niveaux, points, intégrité, statut « Incomplet », mot pour l'étudiant·e, rétroaction | Élève + production, non remplacée : l'évaluation **en vigueur**. Seule garde : une évaluation verrouillée n'est pas réécrite. **C'était le défaut.** | L'évaluation ouverte, par son id (`indexEvaluationOuverte`) ; garde : `evaluationEnLectureSeule`. |
| « Enregistrer » d'une existante (`sauvegarderEvaluationModifiee`) | Par id (`idModification`). Garde du verrou levée par l'instantané d'avant modification, **quel qu'en soit l'id**. | Par id, inchangé ; la garde n'est levée que par l'instantané de CETTE évaluation. |
| « Enregistrer » sans id (`sauvegarderEvaluation`) | Élève + production, non remplacée ; bascule en modification de l'active. | Inchangé : sans id, aucune évaluation n'est ouverte ; l'active est celle que la copie ouvre. |
| Verrouiller / déverrouiller (`basculerVerrouillageEvaluationCourante`, `_deverrouillerEvaluation`) | Par id. Sur une originale non verrouillée en base, le bouton passait par « Verrouiller ». | Par id ; sur une originale remplacée non déverrouillée exprès, le bouton dit « Déverrouiller » et la déverrouille exprès (`_deverrouillerOriginaleExpres`). |
| Bouton de la palette Annotation (`basculerVerrouDepuisAnnotation`) | Évaluation de la copie affichée (par la copie) ; si c'est celle du formulaire, la porte ci-dessus. | Inchangé. |
| « Modifier l'évaluation » sur une ligne « Remplacée » (`modifierEvaluationRemplacee`) | Écrit `verrouillee = false` sur l'originale, arme l'instantané, l'ouvre. | Inchangé, sinon que l'instantané est armé par la fonction commune et traverse l'ouverture (`ouverture`). |
| Chargeur par id (`modifierEvaluation` : « Consulter », la copie dans la visionneuse) | Par id ; lecture seule = `verrouillee` en base. | Par id ; lecture seule = `evaluationEnLectureSeule`. |
| Chargeur par la copie (`verifierEtChargerEvaluationExistante`, l. 530 ; `chargerEvaluationExistanteSiPresente`, travaux-ui.js) | Élève + production, non remplacée : ouvre l'évaluation en vigueur. | Inchangé : ils OUVRENT, ils n'écrivent pas ; l'id qu'ils posent est celui que les écrivains suivent. |
| `_evaluationEnregistreeDeLaCopie` (l. 1522), `_chargerEvaluationEnregistreeBilan` | Par id s'il y en a un, sinon le couple. | Inchangé (déjà par id). |
| `_retirerEchelleDOffice` (l. 355) | Sort tôt dès qu'un id est posé ; sinon le couple. | Inchangé. |
| Lecteurs du verrou : `_copieVerrouillee` (rétroaction), `evaluationRemiseAffichee` (note affichée) | « Comme l'auto-save la trouve » : élève + production, non remplacée, `verrouillee`. | La même règle que l'écrivain : `indexEvaluationOuverte` + `evaluationEnLectureSeule`. L'originale en lecture seule montre sa note enregistrée, comme une verrouillée. |
| Jetons (`appliquerJetonRepriseSurCopie`, import d'une reprise, travaux-ui.js l. 4698) | L'active du couple, pour lui appliquer un jeton. | Inchangé : un jeton s'applique à l'évaluation en vigueur, hors du formulaire. |

## Relecture par un agent neuf (9 nov. 2026) — dispositions

| # | Constat | Disposition |
|---|---|---|
| 1 | Déverrouillée exprès, un niveau touché, puis « Consulter » une autre évaluation dans la seconde et demie : l'ouverture effaçait l'état exprès avant que l'écriture en attente parte, qui trouvait l'originale en lecture seule et ne l'écrivait pas, sans message (vérifié par exécution). | **Corrigé dans le lot** : `modifierEvaluation` vide l'écriture en attente d'abord. Spec « dans la seconde », break-test fait. |
| 2 | Aucun test ne tenait la réouverture (lecture seule de retour) ni « Modifier l'évaluation » de la Liste (break-tests du relecteur restés verts). | **Corrigé** : deux cas ajoutés à la spec ; chacun rougit quand on retire sa ligne (break-tests faits). |
| 3 | La garde de « Enregistrer » (l'instantané de CETTE évaluation) n'est tenue par aucun test. | **Commenté et laissé** : aucun trajet actuel n'arme l'instantané d'une évaluation puis en enregistre une autre (toute ouverture l'efface) ; défense en profondeur. |
| 4 | L'évaluation ouverte devient « remplacée » pendant qu'elle est ouverte (doublon réconcilié #360, jeton appliqué hors du formulaire) : l'écriture est refusée sans message ; avant, elle partait vers l'autre. | **Commenté dans le code et laissé** (rare, plus sûr qu'avant ; pas de symptôme vécu, donc pas d'entrée au BACKLOG). |
| — | Le tableau citait le bouton de la palette Annotation comme geste exprès : il porte sur la reprise. | **Corrigé** dans ce fichier. |

## Le stock

**Stock non mesurable.** L'écriture fautive ne laisse aucune marque de sa source : l'enregistrement automatique pose sur la reprise les critères, la note, la rétroaction et `dateModification`, comme quand on évalue la reprise elle-même. Une reprise qui porte les niveaux de son originale peut aussi être une reprise réévaluée aux mêmes niveaux. Une condition nécessaire, elle, se mesure : le défaut n'a pu jouer que si l'originale était **non verrouillée en base** (verrouillée, son formulaire était déjà en lecture seule) — c'est l'état que laisse « Modifier l'évaluation » quand on ne reverrouille pas. Un relevé en lecture seule des couples « originale remplacée non verrouillée + reprise » est possible ; il n'est pas écrit, faute de demande. Rien n'est réparé ni réécrit.

## Ligne des Nouvelles (sous l'entrée 1.238, version 1.238.1)

Proposée par Claude Code, validée par Grégoire telle quelle le 9 nov. 2026 : « Évaluer : une évaluation remplacée par une reprise s'ouvre en lecture seule, comme une évaluation verrouillée. Pour la corriger, « Déverrouiller » ; ce que tu y changes reste sur elle, la reprise n'en reçoit rien. »
