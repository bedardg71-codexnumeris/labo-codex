# Décisions du 15 octobre 2026 – groupe 3 (préparer son trimestre et son matériel)

> Écrit par Cowork au fil des réponses de Grégoire. Dernière écriture : 15 octobre 2026, 11 h 27 (Toronto). Source des questions : `DECISIONS-A-PRENDRE-2026-10-11.md`, groupe 3.
> Les lignes « à poser » vont au BACKLOG par Claude Code, avec le lot qui exécute la décision.

## Question 1 (#683) – la portée d'une suppression du matériel de départ – décidée par Grégoire à 11 h 04 : « oui », le trimestre seulement

- **Mesuré le 15 oct.** : `marquerRessourceSupprimee` écrit toujours dans `ressourcesSupprimees`, clé GLOBALE (`js/main.js` ~134-145) ; `changerTrimestreActifV2` (`js/trimestre-v2-liste.js` ~386) n'appelle toujours aucun `assurer*`.
- **Décision** : supprimer un élément du matériel de départ (grille, échelle, cartouche, gabarits : les identifiants de `IDS_GABARITS_HARDCODES`) ne vaut que pour le trimestre où on le fait. Un trimestre créé ensuite le reçoit de nouveau. Motif : l'énoncé 8 d'`OBJECTIF-COHORTE-1.md` (« la portée d'une suppression est celle qu'on annonce »).
- **Les suppressions déjà faites gardent leur portée actuelle** (toutes les trimestres) : rien ne réapparaît chez personne. Aucune écriture dans les données existantes pour y arriver (lire l'ancienne marque globale en plus de la nouvelle, par trimestre : à toi de le faire sans réécrire).
- Prix assumé : qui ne veut jamais de la grille de départ la supprime de nouveau dans chaque trimestre neuf.
- Non mesuré : si l'absence de la grille de départ dans l'automne 2026 de Grégoire vient de la marque globale ou de l'autre mécanisme.
- **Sans décision, dans le même lot** : la bascule de trimestre sème le matériel de départ, comme le chargement de la page (mécanisme (i) de la fiche).

**Ligne à poser sous #683 :** `**Décidé par Grégoire le 15 oct. 2026 à 11 h 04 : une suppression du matériel de départ ne vaut que pour son trimestre.** Les suppressions déjà faites gardent leur portée (rien ne réapparaît). La bascule de trimestre sème le matériel de départ, sans décision. Détail : plans de travail/DECISIONS-2026-10-15-groupe-3.md.`

## Question 2 (#622) – clore ses autres trimestres – décidée par Grégoire à 11 h 05 : « oui », le moratoire est levé pour tous

- **Décision** : le moratoire sur la clôture (et l'archivage) d'un trimestre est levé pour tous les trimestres, pas seulement l'hiver 2026 (levé pour lui seul le 14 oct. à 10 h 39).
- Motifs retenus : l'essai demandé a eu lieu le 14 oct. sur l'hiver 2026 réel (porte de douze rangées, passée à 19 h 25) ; clore est une LECTURE depuis \`b888d6b2\` (31 août), rien n'est détruit ; « Rouvrir » défait la clôture, sur confirmation ; Clore et Rouvrir passent par les fenêtres de l'application depuis 1.201.0.
- **Mesuré le 15 oct.** : le moratoire n'existe dans aucun code ni dans aucun fichier qui gouverne (\`CLAUDE.md\`, \`PROTOCOLE.md\`, \`OBJECTIF-COHORTE-1.md\`, \`CONSIGNE-DEMARRAGE-PROCHAINE-SESSION.md\`, \`OU-EN-EST-ON.md\`, skills) : seulement dans des plans datés et au BACKLOG. Rien d'autre à retirer. ⛔ Ne pas toucher \`plans de travail/observation/1-intentions-scellees.md\` (scellé).
- Les gestes sur ses trimestres réels restent les siens.

**Ligne à poser sous #622 :** \`**15 oct. 2026 — moratoire levé pour tous les trimestres** (décision de Grégoire, 11 h 05), après l'essai réel du 14 sur l'hiver 2026. Le moratoire n'existait que dans les consignes. Détail : plans de travail/DECISIONS-2026-10-15-groupe-3.md.\` La fiche reste ouverte pour ce qu'elle porte d'autre (le snapshot sans lecteur, issue 3).

## Question 3 (#378) – un nouveau calendrier en cours de trimestre – décidée par Grégoire à 11 h 10 : « oui », tout reste à sa date

- Rappel : décision de Grégoire du 4 août, pas d'automatisme ; un recalage à la main, lisible.
- **Décision** : les remises et les présences déjà saisies restent à leur date. L'application signale, sans rien déplacer, ce qui change de semaine ou tombe sur un jour devenu congé. Le déplacement d'une remise reste un geste de l'enseignant.
- **Précision de Grégoire (11 h 10)** : quand une tempête annule une journée, le collège l'annonce tôt le matin, environ deux heures avant les cours ; il n'y a donc pas de présences à annuler. Le cas « présences saisies sur un jour devenu congé » est rare (grève annoncée après coup, saisie anticipée).
- **À mesurer à l'ouverture du lot, sans décision** : ce que fait l'application quand un jour de cours devient congé alors que des présences y sont saisies. Si elle les perd, c'est une perte de données à corriger (pas une question de pédagogie).
- Mesuré le 15 oct. : les échéances sont des DATES (\`dateEcheance\`, \`echeancesParGroupe\`, \`js/productions.js\` ~146-184) ; les jours du calendrier portent un statut (cours, congé, reprise ; \`js/trimestre-v2.js\` ~26-58).
- Coût : une séance, plus une porte terrain.

**Ligne à poser sous #378 :** \`**Décidé par Grégoire le 15 oct. 2026 à 11 h 10 : tout reste à sa date.** Les remises et les présences déjà saisies ne bougent pas ; l'application signale, sans déplacer, ce qui change de semaine ou tombe sur un jour devenu congé. Une tempête s'annonce environ deux heures avant les cours : pas de présences à annuler dans ce cas. Détail : plans de travail/DECISIONS-2026-10-15-groupe-3.md.\`

## Question 4 (#546) – le « jugement suspendu » – décidée par Grégoire à 11 h 17 : on ferme, sans case

- Premier « oui » à 11 h 15 pour une case explicite « Ne compte pas dans la note », non construite. **Révisé dans la foulée** par sa précision : « Ce cas survient quand un plagiat est soupçonné. Le travail est alors irrecevable et ne compte plus, à moins d'être repris avec un jeton. »
- **Mesuré le 15 oct.** : ce cas porte sur la COPIE entière, et l'application le traite déjà : statut d'intégrité « plagiat » ou « ia » → « Non recevable », exclue des calculs (\`js/evaluation-sauvegarde.js\` ~595-619, \`js/liste-evaluations.js\` ~596, ~939-960, ~1355, \`js/comparateur-pratiques.js\` ~172 ; aide : \`js/accompagnement-contenu-hover.js\` ~343) ; un jeton de reprise permet une nouvelle remise.
- **Décision** : pas de niveau d'échelle hors calcul. Le refus actuel d'une valeur vide (#526) reste. Un travail irrecevable se traite au niveau de la copie, par « Non recevable ».
- Le mécanisme de calcul qui exclut un critère dont la valeur est vide (\`valeurNumeriqueDuNiveau\` → \`null\`) reste pour les échelles reçues d'ailleurs (ce qui voyage) : ne pas le retirer sans mesure.

**Ligne à poser sous #546, et cocher :** `**Close le 15 oct. 2026, décision de Grégoire (11 h 17) : pas de niveau hors calcul.** Le seul cas réel, le plagiat soupçonné, porte sur la copie entière et l'application le traite déjà (« Non recevable », exclue des calculs, reprise par jeton). Le refus de #526 reste. Détail : plans de travail/DECISIONS-2026-10-15-groupe-3.md.`

**Ligne à ajouter à `plans de travail/PLAN-SOLO-echelle-et-depistage.md`** (§2-D4 et §3-C4, là où le jugement suspendu est posé) : `⮕ 15 oct. 2026, décision de Grégoire : pas de niveau hors calcul. Le seul cas réel, le plagiat soupçonné, se traite au niveau de la copie (« Non recevable »). Voir DECISIONS-2026-10-15-groupe-3.md, question 4.`

## Question 5 (#291) – réunir deux exemplaires d'une même grille – décidée par Grégoire à 11 h 18 : « oui », seulement s'ils sont identiques

- **Sans décision** : la comparaison côte à côte (nom, date, provenance, contenu, nombre de critères) dans le bandeau des doublons.
- **Décision** : « réunir » n'est offert que si les deux exemplaires sont identiques en contenu (critères, pondérations, niveaux ; à définir précisément au lot, et à prouver par un banc). Alors : on garde celui qui porte le plus d'évaluations ; les évaluations de l'autre passent dessus ; l'autre, devenu inutilisé, **n'est pas supprimé par l'application** : c'est l'enseignant qui le supprime s'il le veut (confirmation et codex proposé habituels). Aucune note ne change.
- **Différents** : pas de réunion ; la comparaison montre ce qui diffère ; chaque évaluation reste sur sa grille.
- Motifs : déplacer des évaluations vers une grille différente changerait leurs notes ; **les grilles n'ont pas de corbeille** (mesuré le 15 oct. : la seule corbeille est celle des fichiers de copies), donc « envoyer l'autre à la corbeille » (proposition du 11 oct.) est impossible, et une suppression serait définitive (règle de Grégoire du 20 sept.).
- La réunion réécrit des évaluations (l'identifiant de grille) : c'est l'écriture dans ses données que cette décision autorise, dans ce cas seulement. Source ou stock : un geste de l'usager, rien d'office.
- Les quatre autres familles du bandeau (cartouches, échelles, productions, pratiques) : non tranchées ici ; la même règle (identiques seulement) est la proposition par défaut, à lui soumettre si le lot s'étend.

**Ligne à poser sous #291 :** `**Décidé par Grégoire le 15 oct. 2026 à 11 h 18 : « réunir » seulement deux exemplaires identiques.** On garde celui qui porte le plus d'évaluations, celles de l'autre passent dessus, l'autre reste et c'est l'enseignant qui le supprime. Différents : comparaison seulement. Les grilles n'ont pas de corbeille. La comparaison côte à côte se fait sans décision. Détail : plans de travail/DECISIONS-2026-10-15-groupe-3.md.`

## Question 6 (#684) – les anciens noms du matériel de départ chez les collègues – décidée par Grégoire à 11 h 20 : « oui », une fois, au caractère près

- **Décision** : issue (A) de la fiche. L'application porte une migration au chargement, une seule fois (drapeau daté, idempotente), qui remplace les cinq anciens libellés du matériel de départ par les nouveaux (#682, 1er sept.) **seulement si le nom est égal au caractère près à l'ancien libellé écrit par le code**, revérifié dans le mutateur. Tout autre nom appartient à l'usager et n'est jamais touché.
- C'est une écriture dans les données de collègues qui ne l'ont pas demandée : autorisée par Grégoire, pour ce cas seulement. Le nom d'une grille s'imprime sur le PDF des élèves : assumé.
- Non mesuré : combien de collègues portent encore les anciens noms.
- Écartée : (B), assumer les anciens noms et l'écrire dans les chroniques.

**Ligne à poser sous #684 :** `**Décidé par Grégoire le 15 oct. 2026 à 11 h 20 : issue (A).** Une migration au chargement, une seule fois, remplace les cinq anciens libellés du matériel de départ, seulement s'ils sont intacts au caractère près ; tout nom modifié par l'usager reste. Détail : plans de travail/DECISIONS-2026-10-15-groupe-3.md.`

## Question 7 (#450) – les deux échelles « IDME et niv 0 » d'a2025 – décidée par Grégoire à 11 h 22 : « oui », on abandonne le renommage

- Revient sur sa décision du 11 août (renommer les deux, geste d'interface), assumé.
- Motifs : depuis 1.92.0 (23 août), l'identité d'un item ne passe plus par son nom (\`js/identite-item.js\`) : les deux échelles sortent « homonymes », distinctes, et rien ne les confond ; elles vivent dans a2025, trimestre dont les notes ne sont pas rouvertes ; le renommage ne changerait que l'affichage, et reste un geste de trente secondes si l'homonymie gêne un jour dans un trimestre actif.

**Ligne à poser sous #450, et cocher :** `**Close le 15 oct. 2026, décision de Grégoire (11 h 22) : renommage abandonné.** Les deux échelles sont distinguées par leur identité depuis 1.92.0 ; elles vivent dans a2025. Détail : plans de travail/DECISIONS-2026-10-15-groupe-3.md.`

## Question 8 (#279) – trois zones de plus dans la fiche d'une production – close par la mesure (Cowork), sans question

- **Mesuré le 15 oct.** : c'est déjà fait depuis le 25 août. #499 (cochée) : « + Nouveau champ » dans la fiche d'une production, des blocs que l'enseignant nomme lui-même et qui rejoignent la grille des consignes ; le commentaire d'`index.html` (~4790) cite sa demande : « Format et mise en page », « Remise du travail », « À vérifier ». #500 : Objectif, Description de la tâche et Détail de la tâche sont rendus comme blocs de consignes. La remesure du 11 oct. ne l'avait pas vu.

**Ligne à poser sous #279, et cocher :** `**Close le 15 oct. 2026 par la mesure (Cowork) : déjà faite par #499 et #500 (25 août).** « + Nouveau champ » crée des blocs de consignes nommés par l'enseignant (« Format et mise en page », « Remise du travail »…). Détail : plans de travail/DECISIONS-2026-10-15-groupe-3.md.`

## Question 9 (#274) – des cartes d'alignement d'autres disciplines – à 11 h 27 : Grégoire pose la question le 19 octobre

- **Décision** : Grégoire demande à un ou deux collègues de la communauté de pratique, d'autres disciplines, la trame d'une carte d'alignement (objectifs, activités, évaluations), en principe à la rencontre du 19 octobre. Claude Code ne fait que le montage (environ une séance par carte). Rien n'est inventé par une session.
- La question est notée, avec celle de l'orthopédagogue (#835), dans son dossier de la CoP : « Rencontre CoP 19 oct 2026 – à mettre à l'ordre du jour.md ».
- ⚠ Le motif « pour la rencontre 5 de janvier, « Aligner sa pratique » » vient de l'ancien plan de formation, que Grégoire a écarté (la CoP n'est pas une formation) : il n'est pas repris.

**Ligne à poser sous #274 :** `**15 oct. 2026 : Grégoire demande la trame à un ou deux collègues de la CoP**, en principe le 19 oct. ; le montage suit leur réponse. Détail : plans de travail/DECISIONS-2026-10-15-groupe-3.md.`
