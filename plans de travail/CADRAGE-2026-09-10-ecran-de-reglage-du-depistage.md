# Cadrage — l'écran de réglage du dépistage (`Labo › Outils d'observation`)

> **Écrit le 10 septembre 2026 par Cowork, à la demande de Grégoire.**
> ⛔ **Ce n'est PAS une consigne.** Rien ne se code à partir de ce fichier : Cowork en écrit une
> quand le chantier prend son tour (`00-CADRAGES-OUVERTS.md`, règle d'entrée).
> ↻ Le lot A (source unique de qualification, `js/contexte-qualification.js`) est **livré en
> `1.128.4`** ; ce cadrage a pris son tour le 10 septembre au soir : **la carte des effets est au
> § 4**, écrite par Claude Code sur la consigne du jour.

---

## L'ORIGINE, DANS SES MOTS

> « Je trouve que ce sous-onglet est un peu cacophonique. Il faudrait peut-être le transformer pour
> que, visuellement, il soit plus cohérent et plus facile à lire. »

Et, en relisant la mesure faite sur ses captures :

> « Ce que je vois là, c'est, en fait, ma propre échelle IDME codée en dur et formulée légèrement
> différemment. Donc, il y a un travail de fond à faire ici. »

▣ **Intention plus large, dans ses mots** : préparer le travail d'automne avec l'orthopédagogue, en
faisant sur le **dépistage** ce qui a déjà été fait sur Cadre, Conception et Évaluation. Le dépistage
« n'est pas nommément explicité dans l'application ».

⮕ **Ordre décidé par Grégoire le 10 septembre** : l'écran de RÉGLAGE d'abord, « puisque c'est lui qui
entraîne le suivi ». L'onglet Suivi (ce que l'enseignant lit) vient après.

---

## CE QUI EST DÉJÀ MESURÉ

### 1. L'écran n'est pas où Grégoire le croyait

`Labo › Outils d'observation` (`config.js:76`, id `labo-accompagnement`). L'onglet **Suivi** porte six
sous-onglets — Suivi du groupe, Liste des étudiant·es, Saisie des présences, Profils individuels,
Interventions, Animation — et **aucun ne s'appelle « Observation »**.

⮕ Le dépistage se **règle** dans Labo et se **lit** dans Suivi.

### 2. L'échelle IDME est écrite de trois façons différentes

| Source | Le I | Le E |
|---|---|---|
| Infobulle de l'app (`accompagnement-contenu-hover.js:338`) | « Insuffisant **ou incomplet** » | **Étendu** |
| Guide pédagogique (`guides-pedagogiques.js:50`) | Insuffisant | **Étendu** |
| Écran de réglage (`index.html:8972`) | Insuffisant | **Excellent** |

⮕ **« Excellent » n'appartient à aucune définition interne de l'IDME.** Le E est *Étendu* —
l'abstrait étendu de SOLO, une structure de pensée. « Excellent » est un jugement de valeur.

⮕ Même glissement sur le I : SOLO décrit une réponse **incomplète** (unistructurelle) ; « Insuffisant »
ne décrit plus, il juge. L'infobulle porte encore les deux mots côte à côte, comme une hésitation figée.

⮕ **Sur quatre lettres, deux ont glissé du descriptif vers l'évaluatif — les deux EXTRÉMITÉS.**
Le milieu (D, M) a tenu. Hypothèse, à éprouver et non à supposer vraie : ce sont les bouts d'échelle
qui attirent le jugement, parce que c'est là qu'on est tenté de dire « très bien » ou « pas assez ».
Contredit directement l'`ADR-007` (vocabulaire descriptif, non-prédictif, non-pathologisant).

### 3. Deux nomenclatures dans le même encadré

Bloc « Seuils d'interprétation » : le texte annonce des étiquettes **Insuffisant / Développement /
Maîtrise / Excellent**, et les trois champs, trois centimètres plus bas, disent **Fragile ·
Acceptable · Bon**. Deux échelles pour un seul bloc.

⮕ **La « cacophonie » n'est donc pas d'abord une affaire de mise en page.** Réarranger sans régler ça
reviendrait à mieux aligner des mots qui se contredisent.

### 4. LA CARTE DES EFFETS — pour chaque réglage, l'écran où son effet se voit

> **Mesuré le 10 septembre 2026 au soir par Claude Code**, sur `1c771840` (1.128.4), zéro ligne de
> `js/` touchée. Cette section remplace l'ancien § 4 (« mesure incomplète, à finir avant tout
> déplacement »). **Méthode** : les 20 contrôles relevés dans `index.html` (l. 8731-9080), la clé
> que chacun écrit lue dans `preferences-v2.js`, puis chaque lecteur remonté **jusqu'à un
> `innerHTML`, un `textContent` ou un rendu Chart.js**. Quand la chaîne s'arrête avant, la ligne dit
> « lu, jamais affiché » — c'est un résultat, pas un trou.
>
> ⮕ **La réponse à l'exception de la consigne, d'abord** : **aucun réglage de cet écran n'agit sur
> une note.** Les quatre méthodes de note du moteur PAN (`calculerPerformance`,
> `calculerPerformanceHistorique`, `calculerPerformanceRecente`, `calculerCompletion`,
> `pratique-pan-standards.js` l. 126-600) ne lisent **aucune** des clés de l'écran. Les deux fonctions
> de diagnostic que l'ancien § 4 nommait (`_diagnostiquerForcesChallenges`, `_identifierPatternActuel`)
> lisent bien `defiSpecifique` et `idme.*` — mais elles ne sont atteintes que par des chemins **morts**
> (`#551` : `identifierPattern` / `genererCibleIntervention` du moteur n'ont plus de consommateur ;
> `genererDiagnosticCriteres`, seul appelant de `pratique.detecterDefis`, n'est appelée nulle part).
> Le seul contrôle qui PROMET de toucher la note — « Découpler P et N », « P (notation) : utilise la
> méthode de la pratique » — n'est lu par personne.

#### 4.1 Le tableau

Lecture des colonnes : **Où l'effet se VOIT** est en gestes d'utilisateur ; **Visible ?** compte les
écrans, et signale ce qui est hors de `Suivi`. « Nulle part » = écrit, jamais lu. « Lu, jamais
affiché » = un calcul le lit, mais son résultat n'atteint aucun rendu.

**Bloc « Taxonomie SOLO »**

| Réglage (libellé à l'écran) | Ce qu'il écrit (clé) | Qui le lit | Où l'effet se VOIT | Visible ? |
|---|---|---|---|---|
| Activer l'observation de la structure des résultats d'apprentissage | préférence `afficherDescriptionsSOLO` | `genererSectionAccompagnement` (profil), `genererBarreDistribution` (suivi du groupe), `genererContenuTampons` (annotation) | Suivi › Profils individuels › Accompagnement › la 3e carte « Observation de la structure » apparaît, et la grille passe de 2 à 3 colonnes · Suivi › Suivi du groupe › Observation globale des indices d'engagement › barre P : la ligne « Distribution » (IDME) · **Évaluation › Annoter et évaluer › palette de tampons : la catégorie « compréhension »** | **oui — 3 écrans, dont 1 HORS Suivi** |
| Développement des habiletés | préférence `afficherDeveloppementHabiletes` | `afficherProfilComplet` / `genererSectionPerformance` (profil), `initialiserCarteTrajectoiresProduction` (suivi du groupe) | Suivi › Profils individuels › la section « Développement des habiletés » est retirée du profil · Suivi › Suivi du groupe › la carte « Trajectoires par production » est masquée | **oui — 2 écrans** |
| Observation des actions | préférence `activerActionsRLO` | `genererContenuTampons` (annotation) ; `_appliquerProfilACOSauv` / `_appliquerProfilACOMod` (enregistrement d'une évaluation) ; `genererOngletsDeveloppement` (profil) ; `exporterFormatRecherche` ; `actions-rlo.js` (agrégation) | **Évaluation › Annoter et évaluer › palette : la catégorie « action »** ; à l'enregistrement, l'évaluation reçoit un champ `actionsRLO` (une DONNÉE, pas un pixel) · Suivi › Profils individuels › Développement des habiletés › l'onglet « Gestes cognitifs » apparaît · **Réglages › Données › « Exporter au format recherche » : les colonnes d'actions** | **oui — 3 écrans + 1 export, 2 HORS Suivi** |
| Grille de critères pour le dépistage | préférence `grilleReferenceDepistage` | `genererBadgeGrilleDepistage` (grilles) ; `obtenirGrilleReferenceDepistage` / `diagnostiquerGrilleReferenceDepistage` (profil : carte RàI, barres SRPNF, forces/défis) ; `exporterFormatRecherche` ; moteur PAN `_obtenirGrilleReference` | **Conception › Grilles de critères › le badge « dépistage » sur la grille désignée** · Suivi › Profils individuels › Accompagnement › carte RàI (et sa cause nommée quand la grille manque, `#550`) ; Développement des habiletés › barres SRPNF et bloc forces/défis · **Réglages › Données › export recherche** · le moteur PAN la lit dans `_obtenirInterventionConfiguree` et `_calculerMoyennesCriteresRecents` : **lu, jamais affiché** (chemins morts, `#551`) · les calculs RàI de la Liste et du Suivi du groupe passent par les mêmes helpers : **probable, chaîne non remontée jusqu'au pixel** | **oui — 2 écrans sûrs + 1 export, 2 HORS Suivi** |
| Découpler Performance (P) et Niveau d'attention (N) | préférence `decouplerPN` | **personne** (`grep -rn decouplerPN js/` : le panneau qui l'écrit, et une table de migration) | **nulle part.** L'écran promet « P (notation) : utilise la méthode de la pratique pour calculer la note finale » — rien ne lit ce réglage, la note n'en dépend pas, le niveau d'attention non plus | **NON** |
| Fenêtre d'analyse des patterns | préférence `fenetrePatterns` | **personne.** Les calculs lisent `seuilsInterpretation.nombreProductionsAnalyse` (`obtenirNombreProductionsPourPatterns`, 12 appelants) — une clé que **rien n'écrit** : elle vaut toujours son défaut, 3 | **nulle part.** Ce que l'enseignant croit régler (la fenêtre de l'IPB, des patterns, le « sur N » de fiabilité du Suivi du groupe) reste à 3 quoi qu'il tape — même défaut de branchement que les trois curseurs de `#818` | **NON** |
| Progression des artefacts | `seuilsInterpretation.progressionArtefacts` | `calculerIPB` (la direction ↗ / ↘ du suivi) → `diagnostiquerSuiviApprentissage` → `determinerCibleIntervention` et `calculerEtudiantsPrioritaires` | Suivi › Suivi du groupe › Observation globale des besoins d'intervention (cible et pattern) et le panneau « prioritaires » de la carte Observation globale des indices d'engagement. **Pas le profil** : aucune section du profil n'appelle ce calcul | **oui — 1 écran** |
| Direction du risque | `seuilsInterpretation.directionRisque` | ⚠ **CORRIGÉ AU § 4.4** — `calculerDirectionRisque` est bien morte (résultat rangé dans une variable que rien ne lit, l. 845), mais le SEUIL a un second lecteur, `calculerDirectionsCriteres` (l. 2202, « même seuil que pour le risque »), dont le résultat s'affiche | **Suivi › Profils individuels › Accompagnement › carte RàI : la flèche (→ / ← / —) après chaque critère ; Développement des habiletés › barres SRPNF : la même flèche ; et le texte « Apprentissage : présentement en amélioration / en baisse / en plateau » (`calculerProgressionEleve`)** | **OUI — 1 écran, 3 rendus** (la ligne disait NON) |
| Seuil de défi spécifique | `seuilsInterpretation.defiSpecifique` | 9 lecteurs : `genererDiagnosticSRPNF`, `genererSectionPerformance` (profil) ; `calculerIPB`, `diagnostiquerForcesChallenges` (calculs RàI) ; `mettreAJourCriteresCibles` (interventions) ; et 4 morts — `identifierDefiSpecifique` (résultat non lu), `genererTableauObjectifs` (jamais appelée), moteur PAN `_diagnostiquerForcesChallenges` | Suivi › Profils individuels › Développement des habiletés › « Diagnostic par critère (seuil force : 70 %) » et le bloc forces / défis ; Accompagnement › carte RàI (le défi principal) · Suivi › Liste des étudiant·es › colonnes Pattern et RàI · Suivi › Suivi du groupe › besoins d'intervention, prioritaires · Suivi › Interventions › formulaire › les critères « en défi » proposés | **oui — 4 écrans, tous dans Suivi** |
| Restaurer les valeurs par défaut *(bloc SOLO)* | remet la fenêtre à 3, progression 0,10, sensibilité des flèches 0,05, défi 0,70 ; puis ré-enregistre les seuils (`sauvegarderSeuilsV2` — depuis #823 la fenêtre y passe aussi, `sauvegarderPreferencesV2` n'est plus appelée) | — | ce que les quatre lignes ci-dessus voient — **les quatre agissent depuis #823** (avant : le seuil de défi et la progression seulement). Ne touche **ni** Fragile / Acceptable / Bon **ni** `idme.*` | — |

**Bloc « Micro-données ACP »**

| Réglage (libellé à l'écran) | Ce qu'il écrit (clé) | Qui le lit | Où l'effet se VOIT | Visible ? |
|---|---|---|---|---|
| Activer la cueillette des données sur le contexte d'apprentissage et la performance | préférence `depistageAcp` | `genererSectionMobilisationEngagement`, `afficherProfilComplet` (profil) | Suivi › Profils individuels › la section « Engagement ACP » est retirée. **Rien d'autre** : A, C et P continuent d'être calculés et affichés dans la Liste et le Suivi du groupe — le mot « cueillette » promet plus que ce que la case fait | **oui — 1 écran** |
| Unité d'affichage de l'assiduité (A) | préférence `uniteAffichageAssiduite` | deux fonctions de formatage dans `preferences-v2.js` (`formaterAssiduiteAvecUnite`, `formaterTotalPresence`), **appelées par personne** | **nulle part.** Les assiduités s'affichent partout dans la même unité, quel que soit le choix | **NON** |
| Indicateurs visuels des seuils | préférence `afficherSeuilsVisuels` | 5 graphiques Chart.js de `graphiques-progression.js` (plugin d'étiquettes de zones) | Suivi › Profils individuels › Progression temporelle ACP (graphique individuel) et Développement des habiletés (graphique des critères) · Suivi › Suivi du groupe › Développement du groupe semaine par semaine (indice P seulement) et Trajectoires par production · un 5e graphique (`creerGraphiqueGroupeMoyennes`) n'est appelé par personne. ⚠ **Les étiquettes dessinées sont les niveaux de l'ÉCHELLE de l'utilisateur** (`genererZonesDepuisEchelle`), pas « Insuffisant / Développement / Maîtrise / Excellent » comme le texte sous la case l'annonce | **oui — 2 écrans, 4 graphiques** ; texte faux |
| Fragile si inférieur à | `seuilsInterpretation.interpretation.acceptable` | mécanisme 2 de `contexte-qualification.js` (`interpreterAssiduite`, `interpreterCompletion`, `obtenirCouleurSelonSeuils`) | Suivi › Liste des étudiant·es › la couleur des colonnes A, C, P et M · Suivi › Profils individuels › Engagement ACP (interprétation de A et de C, et les détails dépliables Complétion / Performance) | **oui — 2 écrans** |
| Acceptable si inférieur à | `…interpretation.bon` | idem | idem | **oui — 2 écrans** |
| Bon si supérieur ou égal à | `…interpretation.excellent` | idem | idem | **oui — 2 écrans** |
| Restaurer les valeurs par défaut *(bloc ACP)* | remet 70 / 80 / 85 ; puis ré-enregistre les trois curseurs de détection **tels qu'affichés** | — | ce que les trois lignes ci-dessus voient. Ne touche **ni** la fenêtre, **ni** la progression, **ni** la sensibilité des flèches, **ni** le défi, **ni** `idme.*` | — |
| Graphiques d'évolution ACP | préférence `afficherGraphiques` | `genererSectionProgression`, `afficherProfilComplet` (profil) ; `genererBlocEvolutionRLO` (gestes cognitifs) | Suivi › Profils individuels › la section « Progression temporelle ACP » est retirée, et le bloc « Évolution » de l'onglet Gestes cognitifs | **oui — 1 écran** |
| Masquer les notes par travail (note différée) | préférence `noteDifferee` | `noteDiffereeActive()` : profil (Engagement ACP, Productions et évaluations, Complétion, panneau Portfolio), `genererLigneHTML` (liste des évaluations) | Suivi › Profils individuels › partout où une note par travail s'affiche, un repère « note différée » la remplace · **Évaluation › Liste des évaluations › la colonne de la note**. ⚠ Le repère lui-même dit « Réglage dans Réglages › Préférences » — **faux**, il est ici | **oui — 2 écrans, dont 1 HORS Suivi** ; texte faux |

**Bloc « Intervention (RàI) »**

| Réglage (libellé à l'écran) | Ce qu'il écrit (clé) | Qui le lit | Où l'effet se VOIT | Visible ? |
|---|---|---|---|---|
| Appliquer une adaptation du modèle de la Réponse à l'intervention | préférence `activerRai` | `chargerTableauBordApercu`, `genererBarreDistribution` (suivi du groupe) ; `afficherListeEtudiantsConsultation`, `filtrerEtudiants` (liste) ; `afficherProfilComplet` (profil) ; `afficherListeInterventions` (interventions) | Suivi › Suivi du groupe › la carte « Observation globale des besoins d'intervention » (patterns + niveaux RàI), le calcul des patterns du groupe, et la ligne d'interprétation sous la barre P · Suivi › Liste des étudiant·es › les colonnes Pattern et RàI et leurs filtres · Suivi › Profils individuels › la section « Accompagnement » entière · Suivi › Interventions › le bouton « Guide RàI » | **oui — 4 écrans, tous dans Suivi** |

**Hors tableau, mesuré en passant**

- Le bouton **« Enregistrer »** de l'en-tête réécrit tout le panneau. Il est **redondant** : les 20
  contrôles s'enregistrent déjà au changement (`data-on-change`, 18 occurrences, plus les trois
  curseurs par `sauvegarderSeuilsV2`).
- Les **seuils IDME** (`idme.insuffisant / developpement / maitrise`) que le texte du bloc « Seuils
  d'interprétation » annonce ne sont **réglables nulle part** sur cet écran (aucun champ n'y écrit).
  Ils sont pourtant lus : niveau RàI (`identifierPatternActuel`), objectif suggéré d'une intervention,
  conversion pourcentage → niveau IDME.
- La section « Suivi de l'apprentissage » du profil (`case 'cible'`) appelle
  `genererContenuCibleIntervention`, **qui n'existe nulle part**. Inatteignable aujourd'hui (aucun
  bouton n'y mène depuis `#551`) ; si un jour un bouton y mène, c'est une erreur d'exécution.

#### 4.4 Relecture croisée du 10 septembre au soir — un « mort » sur quatre était vivant

> Mesuré par la session qui a exécuté le lot #823, avant de retirer quoi que ce soit — c'est
> exactement le cas prévu par `PROTOCOLE.md`, règle 2.

**« Direction du risque » agit.** La carte avait remonté la clé `directionRisque` jusqu'à
`calculerDirectionRisque` (morte : résultat jamais lu) et s'était arrêtée là. Or le seuil a un
**second lecteur, quasi homonyme** : `calculerDirectionsCriteres` (profil-etudiant-sections-affichage.js
l. 2202, commentaire « même seuil que pour le risque »). Et celle-ci est lue par trois rendus :
la flèche après chaque critère de la carte RàI (`genererSectionAccompagnement`, l. 1131-1133), la
flèche des barres SRPNF (`_genererBarresSRPNF`, profil-etudiant-diagnostics.js l. 429-445), et le
texte « Apprentissage : présentement en amélioration / en baisse / en plateau » par
`calculerProgressionEleve` (profil-etudiant-calculs.js l. 1548). Le curseur règle donc la
sensibilité de ces flèches — pas « une tendance du risque » : son libellé ment sur son objet, pas
sur son existence.

**Ce qui reste vrai** : « Découpler P et N », « Unité d'affichage de l'assiduité » et « Fenêtre
d'analyse des patterns » sont bien tels que décrits — retirés (les deux premiers) et rebranchée
(la fenêtre) dans le lot #823. `calculerDirectionRisque` reste morte et partira quoi qu'il soit
décidé du curseur.

**Leçon de méthode** : remonter la CLÉ (`grep directionRisque`) jusqu'à chacun de ses lecteurs,
pas la fonction qui porte son nom. Deux fonctions à un « s » près se prennent l'une pour l'autre.

**Disposition — tranchée par Grégoire le 10 sept. au soir, option 1** : le curseur reste et se
nomme « Sensibilité des flèches par critère », aide : « Variation minimale de la moyenne d'un
critère, d'une fenêtre d'analyse à la précédente (la même, décalée d'une production), pour afficher
une flèche (→ ou ←) après ce critère. » ⚠ La formulation « d'une production à l'autre » proposée
d'abord a été **remplacée après mesure** : le code compare la moyenne des N dernières productions à
celle de la même fenêtre décalée d'une production (`slice(0, N)` contre `slice(1, N + 1)`), pas une
production à la suivante. La clé `directionRisque` garde son nom (clé de données, § 5).
`calculerDirectionRisque` et sa variable morte sont retirées. Livré en 1.129.0.

#### 4.2 Ce que la carte fait ressortir, sans le trancher

1. **Quatre réglages agissent HORS de `Suivi`** — c'est le fait qui pèse sur le déplacement :
   *Observation de la structure* (Évaluation › Annoter, palette), *Observation des actions*
   (Évaluation › Annoter, et Réglages › Données), *Grille de critères pour le dépistage* (Conception ›
   Grilles, et Réglages › Données), *Note différée* (Évaluation › Liste des évaluations). Les ranger
   dans `Suivi` affirmerait « ça agit ici » pour quatre réglages sur seize qui agissent quelque part.
2. **Sept réglages agissent à plusieurs endroits** : les quatre ci-dessus, plus *Développement des
   habiletés* (profil + suivi du groupe), *Seuil de défi* (4 écrans de Suivi), *RàI* (4 écrans de
   Suivi), les trois seuils Fragile / Acceptable / Bon (liste + profil), *Indicateurs visuels* (profil +
   suivi du groupe).
3. **Trois réglages n'agissaient NULLE PART** (⚠ corrigé au § 4.4 : la carte en comptait quatre, mais
   *Direction du risque* agit) : *Découpler P et N* (jamais lu), *Fenêtre d'analyse des
   patterns* (écrivait une clé que personne ne lisait ; le calcul lit une clé que personne n'écrivait),
   *Unité d'affichage de l'assiduité* (ses formateurs n'avaient aucun appelant). **Réglé au #823
   (1.129.0) : deux retirés, la fenêtre rebranchée, le quatrième renommé.** Et deux textes promettent
   ce que le code ne fait pas (les étiquettes IDME des graphiques ; « Réglages › Préférences »).
4. **Les deux boutons « Restaurer » couvrent des ensembles disjoints**, et aucun ne dit lequel : celui
   du bloc SOLO remet les quatre seuils de détection (dont deux placebos), celui du bloc ACP remet les
   trois seuils d'interprétation. Ni l'un ni l'autre ne touche `idme.*`, ni les cases à cocher. Tous
   deux ré-enregistrent au passage le reste du panneau tel qu'affiché — sans le changer.
5. **Aucun réglage n'agit sur une note** (mesuré en tête de section). L'exception de la consigne ne
   se déclenche pas.

⮕ **Ce que ça change pour la question du § « déplacer l'écran dans Suivi ? »** : le tri d'abord n'est
plus seulement la recommandation de Cowork, c'est une conséquence de la mesure — on ne déplace pas
quatre placebos et deux textes faux, et quatre réglages sur seize ne sont pas des réglages de Suivi.
La forme (déplacer, scinder, ou garder dans Labo) reste **à Grégoire**.

#### 4.3 Dispositions

| Constat | Disposition |
|---|---|
| Trois réglages sans aucun effet (Découpler P/N, Fenêtre d'analyse, Unité d'assiduité) — et Direction du risque, qui agit mais sous un faux nom (§ 4.4) | **livré — `#823`, 1.129.0** : deux retirés, la fenêtre rebranchée, le curseur renommé « Sensibilité des flèches par critère » (arbitrage de Grégoire, 10 sept. au soir) |
| Deux textes qui promettent autre chose que le code (étiquettes IDME des graphiques ; « Réglage dans Réglages › Préférences ») et le mot « cueillette » | **inscrit — `#823`**, même item : ce sont les mots de l'écran à trier |
| Quatre chemins morts lus par des seuils (`identifierDefiSpecifique` non lu, `genererTableauObjectifs`, `genererDiagnosticCriteres`, `creerGraphiqueGroupeMoyennes`) + un appel à une fonction inexistante (`genererContenuCibleIntervention`) | **inscrit — `#824`**. Sans conséquence observable aujourd'hui ; à retirer d'un bloc, avec le regard de `#551` (les cinq `identifierPattern` gardés « délibérément ») |
| Les seuils IDME annoncés par le bloc mais réglables nulle part ici | **rattaché au cadrage** (§ « Deux nomenclatures dans le même encadré ») — c'est le tri des mots |
| Le bouton « Enregistrer » redondant | **rattaché au cadrage** (grammaire visuelle) — pas un item |
| L'ancien § 4 (« lus par `pratique-pan-standards.js` ») | **précisé** : vrai, mais par des chemins morts ; le moteur de la note ne lit rien |
| Le déplacement vers Suivi | **attend Grégoire** — la carte donne les faits, pas la forme |

### 5. Les mots sont dans les clés de données

`idme.insuffisant`, `idme.developpement`, `idme.maitrise`, `interpretation.acceptable`… Les
utilisateurs en ont dans leur stockage (`seuilsInterpretation`).

⮕ **Changer les mots à l'écran est gratuit ; changer les clés ne l'est pas** — et l'`ADR-007`
proscrit le vocabulaire évaluatif jusque dans « les labels d'API et de structures de données ».
⛔ « Tarir n'est pas réparer » : **écrire dans les données de quelqu'un remonte à Grégoire.**

---

## LA QUESTION OUVERTE — déplacer l'écran dans Suivi ?

▣ **Proposition de Grégoire, 10 septembre** : « le réglage des paramètres de recherche dans l'onglet
où les paramètres ont une influence » — donc `Labo › Outils d'observation` deviendrait un sous-onglet
de **Suivi**.

**Le principe est juste** : un réglage qu'on ne peut pas atteindre depuis l'écran où l'on constate son
effet est un réglage qu'on ne corrige jamais.

**Trois objections à éprouver avant de trancher, aucune décisive** :

1. **L'étendue d'influence n'est pas mesurée** (§4). Si une partie de ces seuils agit hors de Suivi,
   les ranger dans Suivi affirmerait quelque chose de faux.
2. **Suivi porte déjà six sous-onglets.** Un septième, consacré à un réglage qu'on touche une fois par
   trimestre, s'installe en permanence dans un onglet de travail quotidien.
3. **`js/navigation.js` et `js/config.js` sont des zones protégées** (`CLAUDE.md`). Un déplacement se
   fait une fois, proprement, pas en cours de ménage.

▣ **TRANCHÉ PAR GRÉGOIRE, 10 septembre** : « Ta recommandation est bonne, suivons-la. »
⮕ **Direction retenue : trier le contenu d'abord, déplacer ensuite.** Le déplacement vers `Suivi`
reste **sa proposition**, à confirmer par la carte des effets — pas un acquis.

⮕ **Recommandation de Cowork : trier le contenu d'abord, déplacer ensuite.** Déplacer tel quel
importerait la cacophonie dans Suivi. Et le tri produira justement la mesure du §4, qui dira si
« Suivi » est le bon toit — ou si l'écran doit être **scindé**, ce qu'aucune mesure n'exclut
aujourd'hui.

---

## CE QUE LE CHANTIER DEVRAIT PRODUIRE

1. **La carte des effets** : pour chaque réglage de l'écran, l'écran où son effet se voit. C'est le
   préalable du §4, et il tranche la question de l'emplacement.
2. **Une seule nomenclature par échelle**, alignée sur les définitions de Grégoire (IDME, SOLO) et sur
   l'`ADR-007`. ⛔ Les mots que ses élèves liront et le vocabulaire de son cadre sont de la pédagogie :
   **rien ne se renomme sans son arbitrage**.
3. **Une grammaire visuelle unique** : aujourd'hui, régler un seuil se fait de trois façons — curseur,
   champ numérique coloré, champ numérique nu — et le bleu gras sert à la fois d'étiquette de champ,
   de libellé de case à cocher et d'en-tête de groupe.
4. **Deux boutons « Restaurer les valeurs par défaut »** identiques, dans deux sections, sans dire ce
   qu'ils restaurent. À lever.
5. **Le vocabulaire du risque qui traîne** : « Direction du risque », « tendance du risque » —
   proscrits par l'`ADR-007`, encore à l'écran.

---

## CE QUI N'EST PAS DANS LE PÉRIMÈTRE

- **Les bornes elles-mêmes** (0,64 / 0,75 / 0,85 · 65 / 70 / 75 · 5 points · 70 %). Elles attendent le
  travail d'automne avec l'orthopédagogue, comme la nomenclature des zones (`#821`).
- **L'onglet Suivi lui-même** : c'est le chantier suivant, décidé par Grégoire.
- **Les seuils de détection** au sens de `#817`, déjà traités.
