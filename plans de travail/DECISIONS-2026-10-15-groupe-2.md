# Décisions du 15 octobre 2026 – groupe 2 (évaluer une copie, et ce que l'élève lit)

> Écrit par Cowork au fil des réponses de Grégoire. Dernière écriture : 15 octobre 2026, 11 h 01 (Toronto). Source des questions : `DECISIONS-A-PRENDRE-2026-10-11.md`, groupe 2.
> Les lignes « à poser » vont au BACKLOG par Claude Code, avec le lot qui exécute la décision.

## Question 1 (#489) – le verrou d'une production entière – décidée par Grégoire à 10 h 51 : « oui », on l'abandonne

- **Mesuré le 15 oct.** : la question du 11 oct. parlait de « verrouiller une copie corrigée » ; ce verrou-là existe et marche depuis 1.162.0 (27 sept.) : « Verrouiller l'évaluation » et le cadenas passent par `basculerVerrouillageEvaluationCourante` (`js/evaluation.js`), une copie verrouillée s'ouvre en lecture seule. Ce qui est mort, c'est le verrou d'une PRODUCTION : `verrouillerEvaluation` (`js/productions.js` ~2404, exposée ~3223) n'a aucun appelant, et aucun lecteur ne respecte le drapeau `verrouille` des productions.
- **Décision** : abandonner ce verrou et retirer son code. Morts aussi, sans décision à prendre (inventaire A7 du 27 sept.) : `verrouillerEvaluationIndividuelle` et `deverrouillerEvaluationIndividuelle` (`js/evaluation.js` ~1996, ~2021), et les fonctions de la Banque et du verrouillage en lot que le commentaire de `basculerVerrouillageEvaluationCourante` dit sans appelant vivant : à remesurer, à retirer si c'est confirmé.
- **Autorisation donnée par Grégoire, du même « oui »** : retirer `verrouillerEvaluation` de `noms_stables.json` (zone protégée, `CLAUDE.md`).
- Source ou stock : source. Le champ `verrouille: false` déjà écrit dans les productions existantes reste chez les gens ; inerte, il n'est pas réécrit (« tarir n'est pas réparer » : assumé). Le créateur cesse de l'écrire si plus rien ne le lit ; les schémas d'import qui le tolèrent continuent de le tolérer (ce qui voyage).

**Ligne à poser sous #489 :** `**Décidé par Grégoire le 15 oct. 2026 à 10 h 51 : abandonné.** Le verrou d'une copie existe depuis 1.162.0 (« Verrouiller l'évaluation », lecture seule) ; le verrou d'une production entière, jamais branché, est retiré du code, et `verrouillerEvaluation` de `noms_stables.json`, avec son accord. Détail : plans de travail/DECISIONS-2026-10-15-groupe-2.md.`

## Question 2 (#835) – la note dans la grille de l'orthopédagogue – à 10 h 54 : Grégoire lui pose la question

- **Mesuré au BACKLOG (fiche, 11 sept.)** : les deux saisies du formulaire d'évaluation sont en dur (« Nombre de mots », et des « erreurs » qui comptent les codes posés sur la copie) ; aucune ne correspond aux deux nombres qu'elle compare (erreurs repérées par l'élève, erreurs au total).
- **Décision de Grégoire** : rien ne se code avant la réponse de l'orthopédagogue. Il la voit en principe le 19 octobre, à la rencontre de la communauté de pratique.
- Texte proposé par Cowork, accepté pour être posé : « Dans ta grille, pour chaque critère, la note devrait-elle être la part des erreurs que l'élève a repérées lui-même ? Par exemple, 6 erreurs repérées sur 8 donneraient 75 % des points du critère. Et comment veux-tu nommer les deux nombres que tu saisirais : « erreurs repérées par l'élève » et « erreurs au total » ? »
- Coût une fois la réponse connue : intermédiaire (une séance).

**Ligne à poser sous #835 :** `**15 oct. 2026 : en attente de la réponse de l'orthopédagogue**, que Grégoire voit en principe le 19 oct. (rencontre de la communauté de pratique) : la note par critère = part des erreurs repérées par l'élève ? et le nom des deux nombres saisis. Rien ne se code avant. Détail : plans de travail/DECISIONS-2026-10-15-groupe-2.md.`

## Question 3 (#668, lot 6) – l'épreuve uniforme sur la feuille de l'élève – décidée par Grégoire à 10 h 57 : « oui », on partage

- **Décision** : voie (b) de `CONSIGNE-projection-euf-parametrable.md`, § Lot 6. Le commentaire du critère garde le verdict ; un encadré du PDF de rétroaction, construit depuis les NOMBRES de la copie (`donneesAlgorithmiques` : erreurs, mots), porte la mesure, la rangée des paliers avec celui de l'élève mis en évidence, la phrase de cadrage et le service d'aide.
- Motifs retenus : aucune feuille ne dit deux fois la même chose, y compris pour les copies déjà évaluées cet automne, dont la phrase est figée dans `retroaction` ; l'encadré atteint aussi les copies sans faute et celles dont un commentaire réécrit à la main a évincé la phrase.
- Écartée : (a), l'encadré seul (les copies déjà évaluées diraient le verdict deux fois). (c), le statu quo.
- **Les mots de l'encadré lui sont soumis avant le lot** (mots que l'élève lit). Le palier « zéro erreur » doit y être rendu.
- ⚠ Les constats du plan datent du 1er sept. ; Cowork n'a revérifié le 15 oct. que l'absence de toute projection dans `js/synthese-retroaction-*.js`. À remesurer à l'ouverture du lot (cascade du commentaire, sortie anticipée des copies sans faute).

**Ligne à poser sous #668 :** `**Lot 6 débloqué : décidé par Grégoire le 15 oct. 2026 à 10 h 57, voie (b).** Le commentaire garde le verdict ; un encadré du PDF, construit depuis les nombres, porte la mesure, les paliers, la phrase de cadrage et le service. Les mots de l'encadré lui seront soumis avant le lot. Détail : plans de travail/DECISIONS-2026-10-15-groupe-2.md.`

## Question 4 (#275) – une section « forces » et « pistes » – décidée par Grégoire à 10 h 59 : « oui », on clôt

- **Mesuré le 15 oct.** : le PDF de rétroaction donne, pour chaque critère, une phrase complète (`commentaireDuCritere`, `js/synthese-retroaction-data.js` ~483 : le commentaire enregistré, sinon l'algorithmique, sinon la cartouche au niveau retenu). La prémisse de la fiche (« seulement les courts descriptifs de palette ») est périmée.
- Non vérifié (ses données) : que ses cartouches portent déjà forces et pistes dans leur texte.

**Ligne à poser sous #275, et cocher :** `**Close le 15 oct. 2026, décision de Grégoire (10 h 59).** La feuille de l'élève donne déjà, par critère, le commentaire complet (le sien ou celui de la cartouche au niveau atteint) ; des rubriques « forces » et « pistes » à part ne sont pas retenues. Détail : plans de travail/DECISIONS-2026-10-15-groupe-2.md.`

## Question 5 (#333) – le bulletin PDF d'un élève – décidée par Grégoire à 11 h 00 : « oui », une page sans détail par production

- **Décision** : le bulletin individuel tient sur une page : la pratique en vigueur, la note finale, et la phrase qui dit comment elle se construit (le `recit` de `simulerIndices`, qui existe pour les quatre familles, lot 1 du 15 juin). **Pas de détail production par production** : c'est un retour sur sa demande de juin (« détail par production + récit narratif »), assumé.
- Motifs retenus : l'élève a déjà, pour chaque production, sa feuille de rétroaction et sa note ; hors pratique sommative, la note finale ne se construit pas en additionnant les productions, et un tableau par production le laisserait croire (lecture de Cowork des quatre familles, non contredite par Grégoire).
- Restent de la fiche et des décisions de juin : pas d'indices A-C-P ; nominatif ; en-tête « pratique en vigueur » obligatoire ; module dédié `js/export-resultats-finaux.js`.
- **Avant la sortie** : les mots du bulletin (titres, libellés) lui sont soumis, et il jette un coup d'œil à la mise en page. Coût : une séance.

**Ligne à poser sous #333 :** `**Décidé par Grégoire le 15 oct. 2026 à 11 h 00 : le bulletin tient sur une page, sans détail par production** (pratique en vigueur, note finale, phrase de construction). Revient sur la demande de juin, assumé. Ses mots et sa mise en page lui seront soumis avant la sortie. Détail : plans de travail/DECISIONS-2026-10-15-groupe-2.md.`
