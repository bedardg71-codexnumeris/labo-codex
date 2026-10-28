# Demande de relecture – L'Aide, lot 2c bis : le Suivi (#1152)

> Claude Code, mercredi 28 octobre 2026, sur `main` (base `c223bd7e`, le commit de docs du § 0). Consigne : `CONSIGNE-LOT-2026-10-28-aide-lot-2c-bis-suivi.md`. Non poussé, pas de release.
> Les preuves dans `js/` et `index.html` hors de l'Aide sont au HEAD (le code n'est pas touché par ce lot).

## En bref

- Le Suivi passe de **13 entrées à 11** : `guide-profil` est absorbée par `profil-etudiant`, `rai-absences` par `planifier-rai`.
- **4 136 mots → 1 765** (−57 %). Mesure : le texte visible de chaque carte, titre, ligne « Navigation » et tableaux compris, commentaires retirés (même méthode qu'au lot 2c). Le compte de Cowork partait de ~4 655 pour une cible de ~1 590 ; à mon échelle, la cible ferait ~1 410. L'écart (~350 mots) tient surtout à trois choses :
  - les deux tableaux gardés par décision (les paliers de A et C, ~45 mots ; IPB × direction, ~35 mots) ;
  - `profil-etudiant` (366 mots), qui décrit huit sections, la bande et D4 ;
  - `planifier-rai` (203 mots, cible ~150), qui nomme les blocs de la fiche, la case de report et ce qu'elle écrit selon le contexte.
- **Aucun fichier `js/` touché** ; `js/config.js` et `js/navigation.js` non plus. Pas de bloc de jetons à refaire.
- Tests :
  - Vitest complet, depuis `tests/` : **840 fichiers, 10 063 sur 10 063** (10 048 + les 15 de la sentinelle neuve) ;
  - Playwright ciblé : **11 sur 11** (la spec neuve, `aide-forme-1152`, `aide-lot-2a/2b/2c-1152`, `bareme-2-aide`, `aide-exporter-archiver-893`, `materiel-aide-accompagnement`). Le verdict complet n'est pas lancé.
- **Une correction que la consigne ne nommait pas, mesurée** : le suivi des fondamentaux ne s'affiche plus dans le profil (`js/profil-etudiant-sections-affichage.js:1026-1038`, #552) ; il se lit au Suivi du groupe. L'Aide disait « visible dans le profil de chaque étudiant·e ».

## L'ordre retenu, et son motif

| # | Id | Écran |
|---|---|---|
| 1 | `tableau-bord` | Suivi du groupe |
| 2 | `acp` | A, C et P, d'abord lus dans « Détails » du Suivi du groupe |
| 3 | `suivi-apprentissage` | Suivi du groupe : « Structure des apprentissages fondamentaux (SOLO) » et le filtre « Suivi » |
| 4 | `snapshots` | Suivi du groupe : « Développement du groupe, semaine par semaine » (et le profil) |
| 5 | `saisie-presences` | Saisie des présences |
| 6 | `profil-etudiant` | Profils individuels |
| 7 | `diagnostics` | Profil › Accompagnement, carte « Contexte d'apprentissage » |
| 8 | `rai` | Profil › Accompagnement, carte RàI |
| 9 | `patterns` | Profil › Accompagnement, carte RàI (la règle du niveau) |
| 10 | `planifier-rai` | Interventions |
| 11 | `tirage-sort` | Animation |

Motif : l'ordre des sous-onglets de `js/config.js:68-78` (Suivi du groupe, Liste des étudiant·es, Saisie des présences, Profils individuels, Interventions, Rencontres, Animation) ; chaque entrée qui explique un calcul suit l'écran qui l'affiche. La Liste des étudiant·es n'a pas d'entrée dans le Suivi (`etudiants` est dans le Cadre) ; « Rencontres » non plus (lot 4). **Repli possible** : ranger `suivi-apprentissage` après `patterns`, pour lire la RàI d'un bloc ; je ne l'ai pas fait, parce que la règle de la consigne place le suivi des fondamentaux au Suivi du groupe, où il s'affiche.

## Entrée par entrée

| # | Id | Titre | Mots avant → après | Ce qui a changé |
|---|---|---|---|---|
| 1 | `tableau-bord` | **Consulter le suivi du groupe** (neuf) | 58 → 88 | Chemin Suivi → Suivi du groupe ; l'écran recalcule A, C, P (et les patterns avec la RàI) à chaque affichage ; « Détails » et ses quatre filtres, seul endroit qui range ; plus de « risques », plus de « déjà calculées ». Le message « en difficulté » n'est pas nommé : rien à en dire. |
| 2 | `acp` | Lire les indices A-C-P de tes étudiant·es | 114 → 101 | Les trois « mesure… » remplacés par les trois définitions de calcul ; renvoi au guide ACP. |
| 3 | `suivi-apprentissage` | Suivi de l'apprentissage et dépistage SOLO | 390 → 212 | Où il se lit ; la grille du dépistage comme préalable ; la carte suit la case SOLO (cochée : les multistructurels, « Aucun » écarté ; décochée : tous) ; le bon seuil, « Seuil de défi spécifique » ; la direction selon « Progression des artefacts ». Le tableau et la fenêtre de 3 restent. Partis : l'exposé, les trois habiletés de SRPNF données pour une loi (D2), l'exemple d'une autre discipline, « Plateau n'est pas un verdict » (doublon de l'aide contextuelle), l'encadré de différence réduit à une phrase. |
| 4 | `snapshots` | Captures de progression hebdomadaires | 436 → 142 | Ce que la capture enregistre (A cumulatif en périodes, C, P ; ni pattern ni RàI calculés) ; les deux courbes, toutes cumulatives ; une capture prise garde ses valeurs jusqu'à « Recalculer les captures » (#1175). Partis : le ponctuel, les heures, les justifications, l'exemple et ses redites. |
| 5 | `saisie-presences` | Saisir les présences | 126 → 101 | Périodes, pas de 0,5, jusqu'aux périodes de la séance ; nombres à la française ; « Mettre tout le monde présent », « Verrouiller la saisie », « Séance non saisie » et « Confirmer la séance » ; l'absence motivée d'une intervention, à part. Partis : l'exemple en heures, le cumul de 4 h, l'assiduité alternative, « le système ne distingue pas ». |
| 6 | `profil-etudiant` (+ `guide-profil`) | **Lire le profil d'un·e étudiant·e** (neuf) | 147 + 1 214 → 366 | La bande à deux lignes (remesure) ; les huit sections, une à trois phrases chacune, dans l'ordre de `SECTIONS_PROFIL` ; le seuil de défi (70 %, réglable) ; le pattern dans la carte RàI ; D4 ; les trois icônes « i » ; renvois aux mots de A et C et à la règle du niveau. L'astuce de l'étoile reste (#803), réécrite d'après l'écran (la fiche Performance ne montre que les productions retenues ; rien n'y est « estompé »). Partis : colonne, « Sidebar », « 3 sections », « Voir formules », « ← Précédent », stratégies, exemples de profils, marche à suivre, liste hebdomadaire, graphiques de Labo, boîte du tableau des critères. |
| 7 | `diagnostics` | **Les mots qui décrivent A et C** (neuf, celui du dossier) | 137 → 149 | Les mots forment une seule phrase, le badge de la carte « Contexte d'apprentissage » ; la table reste ; renvoi à la couleur du badge (profil) et au niveau (patterns). La FAQ suit le titre neuf. Plus long de 12 mots : les deux renvois. |
| 8 | `rai` | La Réponse à l'Intervention (RàI) | 250 → 143 | L'option et sa case ; D13 mot pour mot ; ce qui décide du niveau ; D3, « 64 % et 75 %, fixes » ; « Aucun » n'écarte qu'avec l'observation SOLO (#1117) ; l'IPB nomme la cible ; renvoi au guide RàI. Partis : le cycle, « L'objectif n'est pas de classer » (contredisait D13), les trois encadrés de niveaux, l'encadré de différence. |
| 9 | `patterns` | Repérer les patterns de progression | 335 → 163 | Ce qu'est un défi ; chaque pattern par sa condition, « Stable » avec ≥ 64 % ; la règle unique du niveau. Partis : les lignes « Action », l'encadré « RàI et mobilisation », les mots d'IDME et de SOLO collés aux bornes. |
| 10 | `planifier-rai` (+ `rai-absences`) | Planifier les interventions RàI | 189 + 613 → 203 | Les blocs de l'écran, « Gestion des absences » et « Observations générales » compris ; « Suggérer » au clic, champ vide ; la case de report, décochée, ce qu'elle écrit selon le contexte, une seule fois ; « Durée (périodes) », 2 par défaut ; les libellés « Niveau 2 (Groupe ciblé) », « Niveau 3 (Individuel) » ; l'exemple de titre approuvé par Grégoire (#847). Partis : « 5 sections », « 2 heures », le report automatique, « l'assiduité augmente », le temps estimé. |
| 11 | `tirage-sort` | **Questions flash, tirage au sort et équipes** (neuf) | 127 → 97 | Une phrase par outil, « Équipes » compris ; « Paramètres du tirage » ; plus de « modal ». |

**« Incomplet », deux sens** : non tranché. Aucune entrée du Suivi ne l'emploie plus (le seul usage était la table de badges du guide, partie).

**D2 ailleurs** : « organiser, être rigoureux, s'exprimer correctement » (`suivi-apprentissage`) part ; les exemples de profils et les stratégies du guide aussi. Rien d'autre trouvé dans le Suivi.

**La mesure de l'Animation (demandée par la consigne)** : la colonne de #1039 est toujours là (`index.html:8075-8088`, `layout-sidebar-2col`, trois boutons « Questions flash », « Tirage au sort », « Équipes »). L'entrée ne la nomme pas : elle dit les trois outils.

## Preuves (fichier:ligne)

### `tableau-bord`
- Sous-onglet « Suivi du groupe » : `js/config.js:69`.
- Recalcul à chaque affichage : `js/tableau-bord-apercu.js:1275-1288` (A, qui chaîne C et P ; les patterns si `activerRai`).
- « Détails » : `index.html:7379-7382` (« Afficher les indices A-C-P sur chaque étudiant ») ; le clic sur A, C ou P : `index.html:7395`.
- Les filtres et leurs libellés : `js/tableau-bord-apercu.js:441-447` ; « A ou C < 70 % » lit `BORNES_MOBILISATION.critique` (`js/contexte-qualification.js:290`, via `borneCritiqueEngagement`, `js/tableau-bord-apercu.js:295`) ; intersection et tri par urgence : `:313-374` ; sans filtre, ordre alphabétique : `:314-320`.

### `acp`
- A : `js/indices.js:200-229, 278-289` ; le guide dit la même chose : `js/guides-pedagogiques.js:117`.
- C (sommative) : `js/pratiques/pratique-sommative.js:272-325` (non facultatif ; au moins une copie qui entre dans la note).
- P selon la pratique : `js/guides-pedagogiques.js:118, 137`.
- Bouton « Guide » : `index.html:8820-8822` (ACP), `8917` (RàI).

### `suivi-apprentissage`
- Grille du dépistage : `index.html:8730-8740` ; sans grille, rien : `js/profil-etudiant-calculs.js:1141-1142`.
- La case SOLO et les critères lus : `index.html:8698-8699` ; `js/profil-etudiant-helpers.js:926-930, 939-941, 963-967`.
- IPB et seuil : `js/profil-etudiant-calculs.js:1132-1187` (`obtenirSeuil('defiSpecifique')`) ; direction entre les deux derniers scores : `:1190-1192`.
- Fenêtre (3) et progression (10) : `index.html:8757-8781`.
- Où il se lit : « Structure des apprentissages fondamentaux (SOLO) », `js/tableau-bord-apercu.js:2357, 2529, 2547` ; filtre « Suivi » (IPB ≥ 2), `:340`. Plus dans le profil : `js/profil-etudiant-sections-affichage.js:1026-1038`.
- Le tableau : `js/profil-etudiant-calculs.js:1230-1255` (inchangé).

### `snapshots`
- Une fois par semaine, à l'ouverture, séances passées : `js/snapshots.js:345-387`.
- A cumulatif, C, P ; pattern et RàI non calculés : `js/snapshots.js:507-516`.
- Une capture garde ses valeurs : `js/snapshots.js:242, 286` ; bouton « Recalculer les captures » : `index.html:9575-9578`.
- Les courbes : « Développement du groupe, semaine par semaine », `index.html:7456` (infobulle `tdb-dev-groupe`, une courbe par étudiant·e) ; « Progression temporelle ACP » lit les captures : `js/profil-etudiant-sections-affichage.js:3248-3265`.

### `saisie-presences`
- Champ des périodes, `step="0.5"`, `max` = périodes de la séance : `js/saisie-presences.js:1564-1576` ; valeur ramenée : `:1719-1722`.
- « Mettre tout le monde présent » : `:1622` ; « Verrouiller la saisie » : `index.html:7908` ; « Séance non saisie » et « Confirmer la séance » : `js/saisie-presences.js:1127-1150, 1163-1168`.
- Absence motivée à part : `js/saisie-presences.js:1035, 1650-1655` ; couleur ambre : `styles.css` (classe `saisie-absence-motivee`).

### `profil-etudiant`
- La bande : `js/profil-etudiant-sections-affichage.js:2529-2569` (« Liste des étudiant·es », ‹ › , « n sur N », étiquettes `:2575-2587`).
- Les huit sections, leurs conditions, leurs icônes « i » (`aide` non nul pour trois) : `SECTIONS_PROFIL`, `:2341-2358` ; préférences : `:2363-2375`.
- Productions : `:3108-3117` ; Engagement ACP, trois fiches : `:600, 654, 732` ; la fiche Performance ne montre que les retenues : `:752-790` ; l'étoile = jeton : `:824-825`.
- Progression temporelle : « P sans reprises » `:3300`.
- Développement des habiletés : onglets `js/profil-etudiant-diagnostics.js:296-310` (« Gestes cognitifs » avec `activerActionsRLO`, case « Observation des actions », `index.html:8720-8721`).
- Accompagnement : cartes `:1290-1404`, « Confidentiel » `:1320-1321`, « + Nouvelle intervention » `:1548` ; carte SOLO seulement avec la case : `:1325-1331`.
- D4 : `js/contexte-qualification.js:211-215, 231-255` ; rappel « Mobilisation » : `js/profil-etudiant-sections-affichage.js:1273-1285`.
- Ouverture depuis la Liste : `js/etudiants.js:1150-1156`.

### `diagnostics`
- Les mots : `js/contexte-qualification.js:124-142, 175-178` ; le badge dans Accompagnement : `js/profil-etudiant-sections-affichage.js:1290-1304` ; la section suit `activerRai` : `:2349-2350`.
- La FAQ suit le titre : `index.html` (FAQ, « Puis-je modifier les seuils des indices A, C, M ? »).

### `rai` et `patterns`
- La case : `index.html:8922-8925` (cochée).
- Le niveau : `js/profil-etudiant-calculs.js:1771-1900` (`determinerNiveauRaiPedagogique` ; P < `idme.insuffisant` → 3, P < `idme.developpement` → au moins 2) ; les bornes : `js/interpretation-config.js:42-46`, aucun champ ne les écrit (`index.html`, `js/preferences-v2.js`).
- Les patterns : `js/profil-etudiant-calculs.js:1682-1704` ; le seuil de défi : `js/interpretation-config.js:50`.
- « Aucun » n'écarte qu'avec la case SOLO : `js/profil-etudiant-helpers.js:926-930`.

### `planifier-rai`
- Libellés et case de report : `js/interventions.js:105-128` ; la fiche : `:1004-1152` ; « Contexte de l'intervention » au niveau 2, « Gestion des absences » en rattrapage : `:777-803` ; « Durée (périodes) », `value="${intervention.duree || 2}"` : `:1044-1047`.
- Le rattrapage seul marque les non-participant·es : `:1551-1558` ; ce que le report écrit : `:1812-1845` ; la présence compense jusqu'aux périodes de la séance, l'absence motivée ne compte pas : `js/indices.js:278-289`.
- La question, décochée, une seule fois : `js/interventions.js:1642-1656, 1725-1740` (décision de Grégoire du 28 sept.).
- « Suggérer » au clic, champ vide : `:1138, 209`.
- Depuis le profil : `js/profil-etudiant-sections-affichage.js:1548` ; pré-coché, niveau dérivé : `js/interventions.js:822-844`.

### `tirage-sort`
- Les trois outils : `index.html:8075-8180` ; « Gestion des Questions Flash » : `js/boite-outils.js:782` ; « Paramètres du tirage », « Réinitialiser » : `js/boite-outils.js:361, 415`.
- « Équipes » : `js/equipes.js:228-305` (les présences du jour, sinon tout le groupe ; « Retenir ces équipes »).

## Les ids

`guide-profil` et `rai-absences` disparaissent. Lecteurs mesurés avant : `index.html` (les entrées), `tests/unit/sentinelle-aide-2026-10-24-forme.test.js` (la liste du Suivi ; l'essai du retrait de la promesse de `rai-absences`). Aucun dans `js/`, ni dans la FAQ. Les titres qui changent : celui de `diagnostics` était cité par la FAQ et par `guide-profil` (parti) : la FAQ suit. Les autres titres neufs n'ont aucun lecteur.

## Tests

### Neufs
- `tests/unit/sentinelle-aide-2026-10-28-lot-2c-bis.test.js`, 15 essais, calculés des deux côtés : l'ordre et l'absence des deux ids ; l'ordre des lignes « Navigation » contre `js/config.js` ; les mots interdits ; chaque libellé entre « » des entrées 3, 9 et 11 (58 morceaux) cherché hors de l'Aide (texte, attributs) et dans `js/` ; chaque renvoi « voir « … » » contre les titres de l'Aide, et la FAQ ; D13 ; D3 (les bornes lues à `interpretation-config.js`, et la preuve qu'aucun champ ne les écrit) ; les conditions des patterns contre `identifierPatternActuel` ; le seuil de défi, la fenêtre et la progression ; la règle SOLO contre `criteresSuiviFondations` ; D4 contre `BORNES_CONTEXTE` et le rappel ; les huit sections et les trois icônes contre `SECTIONS_PROFIL` ; l'étoile (#803) ; les filtres de « Détails » ; la case de report, sa durée, le rattrapage ; la capture qui garde ses valeurs.
  - **Break-test** : 18 mutations d'`index.html`, une par affirmation ; chacune rougit (1 à 5 échecs). Arbre restauré, sha256 identique.
- `tests/integration/aide-lot-2c-bis-1152.spec.js` : la recherche trouve « profil », « report » et « Recalculer les captures » dans le Suivi ; les deux ids absorbés ne sortent plus. `CAPTURES_AIDE_2C_BIS=<dossier>` prend les captures. Break-test : « report » retiré de `planifier-rai`, l'essai rougit (« Error: report ») ; restauré, sha256 identique.

### Modifiés, par décision (chacun cite l'audit, la remesure et la consigne)
- `sentinelle-aide-2026-10-24-forme` : la liste du Suivi ; `ABSORBEES_2C_BIS` dans les comptes ; l'essai du retrait de la promesse passe à `planifier-rai`, et y vérifie « Le report se fait une seule fois. » (break-test : rouge).
- `sentinelle-audit-aide-15-oct` : la tranche de `patterns` finit au niveau « En attente », l'encadré qui la bornait étant parti (break-test : « Non-participation » retiré deux fois, rouge).
- `sentinelle-audit-aide-lot-E` (#847) : la puce « Titre (ex: … ) » partait avec `rai-absences`. **L'exemple approuvé par Grégoire est gardé** dans `planifier-rai` ; l'assertion le lit maintenant dans le texte d'exemple du champ « Titre » (`js/interventions.js:123`) au lieu de le recopier (break-test : rouge).
- `sentinelle-lot-C-744-822-905-un-seul-palier` (A6) : le sous-titre « Comment interpréter les diagnostics ? », ancre de la tranche, part avec le resserrement ; la tranche part de l'entrée ; les huit rangées sont toujours exigées (break-test : « Plateau » renommé, rouge).

### Un piège évité
- Le cliquet #858 a rougi à la suite complète : ma sentinelle découpait par `indexOf`. Réécrite avec `tranche` ; aucune assertion du cliquet touchée.

### Résultats
- Vitest complet, depuis `tests/` : 840 fichiers, **10 063 sur 10 063**.
- Playwright ciblé : 11 sur 11.

## Pour Grégoire

Les titres neufs, D4, et les phrases qui disent l'application au-delà d'un libellé d'écran. D13 est posé mot pour mot (décision déjà rendue).

### Les titres neufs
- `tableau-bord` : « Consulter le suivi du groupe » (au lieu de « Consulter l'aperçu » ; l'onglet « Aperçu » n'existe plus).
- `profil-etudiant` : « Lire le profil d'un·e étudiant·e » (celui de la consigne).
- `diagnostics` : « Les mots qui décrivent A et C » (celui du dossier).
- `tirage-sort` : « Questions flash, tirage au sort et équipes » (l'entrée décrit maintenant trois outils). Proposition de Claude Code ; repli : « Utiliser l'Animation ».

### D4 (à soumettre)
« La couleur du badge « Contexte d'apprentissage » suit trois paliers fixes, 85, 75 et 65 %, que A et C doivent atteindre ensemble. Le rappel « Mobilisation » de la carte RàI paraît dès que A ou C passe sous 75 %. »

### Les phrases qui disent l'application
- `tableau-bord` : « À chaque affichage, l'écran recalcule A, C et P, et les patterns si la RàI est activée. » ; « C'est le seul endroit où l'application range les étudiant·es : les filtres […] se combinent, ne gardent que les étudiant·es qui répondent à tous et les rangent par ordre d'urgence ; sans filtre, l'ordre est alphabétique. » (« urgence » est le mot du code ; à toi de dire s'il convient.)
- `acp` : les trois définitions, en particulier « Un travail facultatif n'y entre pas, et un travail n'y entre qu'une fois qu'une copie, au moins, compte dans la note. »
- `suivi-apprentissage` : « Quand « Activer l'observation […] » est cochée, il ne lit que les critères multistructurels de cette grille (un critère sans étiquette compte comme tel, « Aucun » l'écarte) ; décochée, il lit tous les critères. » ; « Ce diagnostic nomme la cible de l'intervention ; il ne fixe pas le niveau RàI […]. Quand les deux vues divergent, c'est un signal pour ton jugement. »
- `snapshots` : « Une capture déjà prise garde ses valeurs. »
- `profil-etudiant` : la phrase de chaque section, et « Sous une pratique qui ne retient qu'une partie des productions, la fiche Performance montre celles que retient la modalité réglée dans ta pratique. »
- `rai` : « La RàI est une option […] cochée au départ. » ; « Ses bornes sont 64 % et 75 %, fixes. »
- `patterns` : « Le niveau suit une seule règle : P sous 75 % donne au moins le niveau 2, sous 64 % le niveau 3, quel que soit le pattern. »
- `planifier-rai` : « Cochée, elle écrit aux participant·es la durée de l'intervention, qui compense une absence au cours ; en « Séance de rattrapage […] », les autres reçoivent une absence motivée, qui ne compte pas dans A ; en « Petit groupe ciblé […] » ou au niveau 3, rien pour eux. »
- `tirage-sort` : la phrase d'« Équipes » (« avec les présent·es du jour (tout le groupe si les présences ne sont pas prises) »).

### Rien n'a été tranché
- « Incomplet », deux sens : plus employé dans le Suivi ; la question reste à Cowork.
- Les bornes fixes de la RàI (#551) : dites telles qu'elles sont, sans dire qu'elles suivent l'échelle.

## Ce que j'ai supposé

- « C'est le seul endroit où l'application range les étudiant·es » : je l'ai repris de la consigne et du dossier, sans mesurer chaque autre écran (la Liste des étudiant·es a des tris de colonnes, que je ne compte pas comme un rangement par besoin).
- La définition de C est celle de la sommative ; je ne l'ai pas éprouvée famille par famille. Elle dit ce qui est commun (le facultatif hors du compte, une copie qui compte), sans le détail de chaque pratique.

## Trouvé en chemin

Quatre textes d'écran, **inscrits et laissés** (tableau « Trouvé hors de la section Aide » de l'audit, lot 5) :
- l'aide « i » d'Accompagnement annonce des « Indicateurs de risque » (`js/profil-etudiant-sections-affichage.js:1081`) ;
- « élève » dans « Gestion des absences » (`js/interventions.js:1080`) et dans « Détails » du Suivi du groupe (`index.html:7395`) ;
- l'aide contextuelle de la planification dit « Suggestion automatique » (`js/accompagnement-contenu-popup.js:737`) ;
- le guide ACP cite « l'Aperçu » (`js/guides-pedagogiques.js:126`).

## Captures

`plans de travail/captures-2026-10-28-aide-lot-2c-bis/` : `aide-profil-etudiant-1440.png`, `-820.png`, `aide-planifier-rai-1440.png`, `-820.png` (mode clair). Aucun défilement latéral à 820 px (mesuré par la spec).

## Le geste à vérifier à l'écran après la mise en ligne

Aide › Suivi : « Lire le profil d'un·e étudiant·e » décrit la bande à deux lignes ; chercher « report » mène à la case des interventions.
