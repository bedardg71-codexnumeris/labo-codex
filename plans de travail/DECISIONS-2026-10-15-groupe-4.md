# Décisions du 15 octobre 2026 – groupe 4 (suivre un élève et intervenir)

> Écrit par Cowork au fil des réponses de Grégoire. Dernière écriture : 15 octobre 2026, 11 h 40 (Toronto). Source des questions : `DECISIONS-A-PRENDRE-2026-10-11.md`, groupe 4.
> Les lignes « à poser » vont au BACKLOG par Claude Code, avec le lot qui exécute la décision.

## Question 1 (#777) – les zéros qui faussent les mesures d'intervention – décidée par Grégoire à 11 h 30 : « oui », recalcul à son clic

- **Source, sans décision** : les captures (d'intervention et hebdomadaires) portent désormais le drapeau « note constructible » ; un P non calculable s'écrit et s'affiche « non calculable », jamais 0 (`js/snapshots.js`, les écritures `P: indices.P` relevées par la fiche).
- **Stock, décision** : rien n'est réécrit d'office. Un bouton « Recalculer les mesures des interventions » refait, au clic de l'enseignant, chaque mesure avant et après **à sa propre date** (`calculerIndicesHistoriques(da, dateLimite)`, `js/snapshots.js` ~190 : « la note du cours telle qu'elle se calculait à dateLimite »), avec la distinction « non calculable ». Où le placer, et ses mots (écran enseignant) : à proposer par Claude Code, relus par Cowork.
- Mesuré le 15 oct. : depuis #1049 (1.199.0), « Recalculer les captures » garde les captures d'intervention mais ne les refait pas (`reconstruireSnapshotsHistoriques`, ~858-879).
- Non mesuré (ses données) : combien de ses mesures d'automne portent un faux zéro.

**Ligne à poser sous #777 :** `**Décidé par Grégoire le 15 oct. 2026 à 11 h 30.** Source : les captures portent « non calculable » au lieu de 0. Stock : rien d'office ; un bouton « Recalculer les mesures des interventions » refait chaque mesure à sa propre date, au clic de l'enseignant. Détail : plans de travail/DECISIONS-2026-10-15-groupe-4.md.`

## Question 2 (#836) – la présence d'un élève suivi en service – décidée par Grégoire à 11 h 31 : « oui », on la fait taire et on demande à l'orthopédagogue

- **Mesuré au BACKLOG (fiche)** : pour un service sans séance, `calculerTousLesIndices` rend `A: 100` ; c'est le comportement de tout groupe sans séance, un nombre inventé.
- ⚠ **Corrigé par Cowork à 11 h 36 : cette mesure de la fiche (12 sept.) est périmée.** Depuis #743 (1.147.0, 19 sept.), `calculerAssiduite` rend `indice: null` sans séance (`js/indices.js` ~229) : un tiret partout. Le « 100 % inventé » n'existe plus ; la décision « la présence se tait » est déjà en place. Reste la question à l'orthopédagogue (compter ses rencontres ?). Au lot : vérifier seulement qu'un élève de service sans séance montre bien le tiret partout.
- **Décision** : dans un groupe-cours de SERVICE (`contexteActifEstService()`), l'indice A ne s'affiche pas (ni 100 %, ni 0) tant que l'orthopédagogue n'a pas dit si la présence à ses rencontres doit compter. Principe de Grégoire : « ne rien inventer ». Hors service, rien ne change. À mesurer au lot : partout où A d'un élève de service se lit (profil, Suivi, palier RàI) ; un A muet ne doit pas faire monter ni baisser un palier.
- **Question ajoutée à sa note du 19 oct.** (dossier de la CoP, « Rencontre CoP 19 oct 2026 – à mettre à l'ordre du jour.md ») : « Veux-tu que l'application compte la présence des élèves à tes rencontres ? »
- Le reste de la fiche, sans décision : `obtenirAbsencesMotiveesParDate` filtré par `groupeCoursId` ; le « 4/5 configurés » d'un groupe-cours sans pratique facultative (à remesurer : peut-être déjà réglé au lot 8, #1018).

**Ligne à poser sous #836 :** `**15 oct. 2026 (Grégoire, 11 h 31) : dans un service, la présence se tait** (c'est déjà le cas depuis #743, 1.147.0 : un tiret sans séance) jusqu'à la réponse de l'orthopédagogue, à qui il demande le 19 oct. si la présence à ses rencontres doit compter. Détail : plans de travail/DECISIONS-2026-10-15-groupe-4.md.`

## Question 3 (#821) – les mots des bandes de couleur – décidée par Grégoire à 11 h 33 : « oui », des mots qui décrivent

- **Décision (principe)** : des mots qui décrivent ce qu'on observe (la présence, la remise), pas des mots qui jugent l'élève ; un seul vocabulaire ; aucun mot sur le dégradé de l'Aperçu (mécanisme 1, qui ne classe rien).
- **Les mots exacts : adoptés par Grégoire à 11 h 38** (« je tranche maintenant : j'adopte les mots que tu as proposés »). Ils ne passent plus par l'orthopédagogue (sa décision du 16 sept. est remplacée par celle-ci) ; la section est retirée de sa note du 19 oct. Les mots, à recopier tels quels :
  - Présence : « Aucune absence ou presque » · « Absences rares » · « Quelques absences » · « Absences fréquentes » · « Absences très fréquentes »
  - Remise : « Aucun travail manquant ou presque » · « Travaux manquants rares » · « Quelques travaux manquants » · « Travaux manquants fréquents » · « Travaux manquants très fréquents »
- **Proposition technique de Cowork, à éprouver au lot** : les qualifications COMBINÉES (contexte d'apprentissage, mécanisme 3 ; mobilisation, mécanisme 4) ne reçoivent pas de mot à elles ; elles se disent par les deux descriptions (« Absences rares, quelques travaux manquants »). C'est ce qui permet un seul vocabulaire sans que deux mécanismes aux bornes différentes donnent deux mots contradictoires au même élève (divergence verrouillée : A = 80 %, C = 80 % → « Favorable » ET « Acceptable »).
- ⛔ **Aucune borne ne bouge** (gel d'octobre, #742) : renommer n'est pas reborner. « Décrochage », statut posé par l'enseignant, reste.
- Rien ne sort vers les élèves (mesuré le 10 sept.) : écrans enseignant seulement.

**Ligne à poser sous #821 :** `**Décidé par Grégoire le 15 oct. 2026 (11 h 33, mots adoptés à 11 h 38) : des mots qui décrivent, pas qui jugent ;** un seul vocabulaire (présence : « Aucune absence ou presque » à « Absences très fréquentes » ; remise : « Aucun travail manquant ou presque » à « Travaux manquants très fréquents ») ; pas de mot sur le dégradé de l'Aperçu. Aucune borne ne bouge. Détail : plans de travail/DECISIONS-2026-10-15-groupe-4.md.`

## Question 4 (#742) – les seuils des alertes – décidée par Grégoire à 11 h 38 : on ferme la fiche

- Rappel : sa décision du 13 sept. (option C), les bornes d'alerte restent en dur et documentées ; réglables seulement si un usage réel le demande (les siens en octobre, ou un collègue).
- **Décision** : aucun usage ne l'a demandé ; la fiche se ferme maintenant, sans attendre la fin d'octobre. Les seuils restent fixes. Elle se rouvre si un collègue le demande.

**Ligne à poser sous #742, et cocher :** `**Close le 15 oct. 2026, décision de Grégoire (11 h 38) :** aucun usage n'a demandé de déplacer une alerte ; les bornes restent fixes et documentées (js/contexte-qualification.js). À rouvrir si un collègue le demande. Détail : plans de travail/DECISIONS-2026-10-15-groupe-4.md.`

## Question 5 (#36) – comparer ses trimestres – décidée par Grégoire à 11 h 40 : « oui », une étude hors de l'application

- **Décision** : la comparaison entre trimestres (hypothèse : RàI → interventions plus précoces → moins de décrochages → meilleures moyennes ; communication possible à l'AQPC) se fait en étude ponctuelle, à partir de ses exports et de son ancien tableur, hors de l'application. Pas d'outil dans l'application.
- **Conséquence, du même « oui »** : #35 (faire entrer l'hiver 2024 dans l'application), en attente depuis le groupe 1, se ferme : sa seule raison d'être était cette comparaison (fiche : « Prérequis : #35 »).

**Ligne à poser sous #36, et cocher :** `**Close le 15 oct. 2026, décision de Grégoire (11 h 40) : une étude ponctuelle hors de l'application**, à partir des exports et de l'ancien tableur ; pas d'outil. Détail : plans de travail/DECISIONS-2026-10-15-groupe-4.md.`

**Ligne à poser sous #35, et cocher :** `**Close le 15 oct. 2026, décision de Grégoire (11 h 40) :** l'hiver 2024 n'entre pas dans l'application ; la comparaison entre trimestres, sa seule raison d'être, se fait hors de l'application (#36). Détail : plans de travail/DECISIONS-2026-10-15-groupe-4.md.`
