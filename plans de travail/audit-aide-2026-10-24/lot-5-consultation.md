# Lot 5 — « Consultation et interprétation » (aide-consultation)

*Audit en lecture seule, commit 35745bd (1.216.2), index.html:12692-13442, 11 entrées, 3 489 mots. Code lu : `js/profil-etudiant-*.js`, `js/contexte-qualification.js`, `js/interpretation-config.js`, `js/tableau-bord-apercu.js`, `js/presences-apercu.js`, `js/calendrier-vue.js`, `js/graphiques-progression.js`, `js/correlations-longitudinales.js`, `js/impact-jetons.js`, `js/interventions.js`, `js/bilan-reflexif-*.js`, `js/config.js`, et les aides contextuelles.*

---

### tableau-bord — « Consulter l'aperçu » (index.html:12697-12721, 65 mots)
- Vrai ? : à corriger
  - Chemin — Aide : « Navigation : Aperçu » (12704) / Code : il n'existe plus d'onglet Aperçu ; l'écran est Suivi › Suivi du groupe (`js/config.js:69`, `index.html:7478-7483`, migré le 27 mai 2026). Même erreur hors lot dans verification-hebdo (12063).
  - Aide : « Cet écran lit […] déjà calculées ; il ne les recalcule pas » (12705) / Code : chaque affichage relance le calcul de A, C, P et des patterns (`tableau-bord-apercu.js:1275-1288`, `calculerEtSauvegarderIndicesAssiduite` puis `calculerEtStockerPatternsGroupe`).
  - Aide : « Codes couleur pour identification rapide des risques » (12711) / Code : le dégradé de l'écran « ne classe rien » et ne porte aucun mot (`contexte-qualification.js:61-74`, #821) ; le vocabulaire du risque a été retiré le 15 oct. Le motif de la sentinelle (`risque d'échec`, `niveau de risque`) ne voit pas « des risques ».
  - « Liste complète des étudiant·es », « Indices A-C-P en un coup d'œil » : trop général pour être vérifié ; à voir à l'écran.
- Sert ? : les trois puces (~25 mots) redisent le sous-titre de l'écran « Observe où en est le groupe et repère qui prioriser » (index.html:7489) et l'aide contextuelle `tableau-bord-apercu` (`accompagnement-contenu-popup.js:757-787`). L'encadré « Rechargement automatique » (~10 mots) décrit une mécanique. Ce que l'Aide ne dit pas et que l'audit du 15 oct. avait relevé : le panneau « Détails », qui retient P < 65 %, A ou C < 70 %, RàI 2-3, et range par score d'urgence (`tableau-bord-apercu.js:313-374`).
- Verdict proposé : corriger (~65 → ~70)
- Motif : chemin faux et vocabulaire retiré ; remplacer les puces génériques par ce que fait le panneau « Détails », seul endroit où l'application range les étudiant·es.
- Tests qui l'épinglent : aucun

### presences-apercu — « Consulter l'aperçu des présences » (index.html:12724-12747, 92 mots)
- Vrai ? : à corriger
  - Aide : « 4 cartes métriques : Taux d'assiduité moyen, Séances données, Prochaine séance, Nombre d'étudiant·es » (12735-12740) / Code : aucun écran ne les affiche. `chargerApercuPresences` n'a aucun appelant et ses cibles (`pa-taux-moyen`, `pa-seances-donnees`, `pa-prochaine-seance`, `stat-nb-eleves`) n'existent pas dans index.html, mesuré au lot 34 (`presences-apercu.js:19-22`). Les trois libellés n'apparaissent nulle part ailleurs que dans cette entrée.
  - « Navigation : Aperçu » (12731) : même chemin inexistant que l'entrée précédente.
- Sert ? : l'entrée entière décrit un écran absent (92 mots).
- Verdict proposé : couper
- Motif : elle envoie l'enseignant·e chercher un écran qui n'existe pas.
- Tests qui l'épinglent : aucun (`sentinelle-legende-fusionnee-calendrier-344` parle d'autres « cartes métriques », celles du calendrier, et lit `calendrier-vue.js`)

### presences-calendrier — « Lire le calendrier des présences » (index.html:12750-12772, 87 mots)
- Vrai ? : à corriger
  - Aide : « vue mensuelle de l'assiduité avec des codes couleur par jour », « code couleur indiquant le taux de présence » (12759, 12763) / Code : les couleurs disent le type de journée (cours régulier, ouvrable, weekend, congé, reprise, examens, planification) et les échéances ; aucune ne lit les présences (`calendrier-vue.js:312-336`, légende 506-550).
  - Aide : « flèches mois précédent / mois suivant » (12764) / Code : tous les mois du trimestre sont affichés d'un coup, en grille (`calendrier-vue.js:483-493`) ; aucune flèche.
  - Aide : « Clique sur une date pour afficher le détail des présences de cette séance » (12765) / Code : un jour de cours cliqué ouvre Suivi › Saisie des présences à cette date (`calendrier-vue.js:345`, `saisie-presences.js:2071-2091`).
  - Aide : « Les jours sans cours restent vides » (12769) / Code : jours ouvrables et weekends ont leur couleur (`calendrier-vue.js:312-331`).
- Sert ? : l'écran porte sa légende, trois compteurs (semaines, jours de cours, congés avec reprise) et son astuce (« survole un jour pour mettre sa semaine en évidence », `calendrier-vue.js:506-583`). L'entrée n'a à dire que le clic sur un jour de cours. L'aide contextuelle `calendrier-vue` (`accompagnement-contenu-popup.js:375-398`) porte les mêmes erreurs (flèches, « dates en gras »), hors lot.
- Verdict proposé : corriger et resserrer (~87 → ~35), titre « Lire le calendrier scolaire »
- Motif : quatre affirmations sur cinq sont fausses ; ce qui reste vrai tient en deux phrases.
- Tests qui l'épinglent : aucun

### profil-etudiant — « Interpréter le profil d'un·e étudiant·e » (index.html:12775-12822, 159 mots)
- Vrai ? : à corriger
  - Aide : « Zone principale : 3 sections structurées » (12788), Accompagnement / Développement des habiletés / Mobilisation / Code : la barre latérale ouvre une vue à la fois, parmi huit : Productions (vue par défaut), Jugement (dénotation seulement), Engagement ACP, Progression temporelle ACP, Développement des habiletés, Accompagnement (si RàI), Travaux soumis, Rapport (`profil-etudiant-sections-affichage.js:2581, 2641-2689`).
  - Aide : « Sidebar gauche : Navigation Précédent/Suivant » (12787) et « Boutons centrés Précédent/Suivant » (12820) / Code : la barre latérale porte un sélecteur « Étudiant·e : », les boutons « ← Préc. » et « Suiv. → », une fiche d'identité et le menu des vues (`:2591-2689`).
  - Aide : « Forces identifiées : Critères ≥ 75 % ; Défis identifiés : Critères < 75 % » (12804-12805) / Code : la frontière est le « Seuil de défi spécifique », 70 % par défaut, réglable de 60 à 80 dans Labo › Outils d'observation (`interpretation-config.js:50`, `profil-etudiant-calculs.js:1281, 1332-1339`, `index.html:8899-8903`). L'entrée grille-depistage dit 70 % (11162) : deux valeurs dans l'Aide.
  - Aide : « Diagnostic pattern » rangé dans Développement des habiletés (12806) / Code : le pattern s'affiche dans la carte RàI d'Accompagnement (`:1267-1272`) ; Développement des habiletés montre P, puis les onglets « Critères », « Forces et défis » et, si l'option est active, « Gestes cognitifs » (`profil-etudiant-diagnostics.js:303-310`).
  - Aide : « Assiduité (A) : Sommative et alternative avec interprétation » (12813) / Code : une seule valeur, celle de la pratique active (mode comparatif retiré, `:2374-2389`) ; la vue Engagement ACP ne montre aucun mot d'interprétation (`interpA`, `interpC` calculés et jamais lus, `:394, 468`).
  - Aide : « Ce module LIT toutes les sources de données » (12783) : langue de code, reste de la correction du 15 oct. qui a retiré les deux autres phrases du même patron.
- Sert ? : l'entrée double le « Guide détaillé » (voir guide-profil), les deux infobulles de navigation du profil (`profil-nav-observations`, `profil-selecteur`, `accompagnement-contenu-hover.js:561-564`) et les deux aides contextuelles posées en tête du profil (`index.html:8153-8154`).
- Verdict proposé : fusionner avec guide-profil (voir plus bas)
- Motif : même écran, même plan à trois sections, toutes deux périmées.
- Tests qui l'épinglent : aucun

### diagnostics — « Comprendre les diagnostics automatiques » (index.html:12825-12874, 143 mots)
- Vrai ? : à corriger
  - Aide : « Sous A et sous C, le profil écrit ce qu'on observe de la présence et de la remise » (12832) / Code : les mots ne s'écrivent pas sous chaque indice. Ils forment une seule phrase, le badge de la carte « Contexte d'apprentissage » (« Absences rares, quelques travaux manquants »), dans la vue Accompagnement, visible seulement quand l'option RàI est cochée (`contexte-qualification.js:175-178, 229-279` ; `profil-etudiant-sections-affichage.js:1294-1304, 2470-2474`). Engagement ACP n'affiche que les pourcentages.
  - La table (12834-12869), les bornes réglables et la borne fixe de 60 % (12871), les couleurs de la liste : exacts (`contexte-qualification.js:124-142, 189-202` ; `etudiants.js:1191-1193`).
  - Non dit, pour Grégoire : la couleur du badge suit une autre règle, fixe, par conjonction sur A et C (85 / 75 / 65 %, `contexte-qualification.js:211-215`), et le rappel « Mobilisation » de la carte RàI une troisième (A ou C < 75 %, `profil-etudiant-sections-affichage.js:1281-1282`). Les divergences sont voulues (gel d'octobre, #742). Dire ou ne pas dire ces deux règles est une décision de contenu.
- Sert ? : la dernière phrase du paragraphe sur les couleurs (~25 mots) redit l'écran « Ces trois seuils colorent les colonnes […] et choisissent les mots qui décrivent la présence et la remise dans le profil » (index.html:8984). Le titre annonce des « diagnostics » ; l'entrée parle des mots de A et de C.
- Verdict proposé : corriger (~143 → ~120), titre proposé « Les mots qui décrivent A et C »
- Motif : la table tient ; la phrase d'introduction situe les mots au mauvais endroit.
- Tests qui l'épinglent : `sentinelle-audit-aide-15-oct-ce-que-fait-l-application.test.js` (table `aide-table-paliers-a-c`, cinq rangées lues à la source). Le titre est cité par seuils-critiques (13474), guide-profil (13132) et la FAQ : un changement de titre les emporte.

### rai-solo — « Options configurables : RàI et SOLO » (index.html:12877-12924, 332 mots)
- Vrai ? : à corriger
  - Libellé — Aide : « Cocher «Afficher l'observation de la structure des résultats d'apprentissage (SOLO)» » (12900) / Code : « Activer l'observation de la structure des résultats d'apprentissage » (index.html:8801).
  - Aide : la carte SOLO montre « les forces et défis identifiés selon les 4 niveaux IDME » (12901) / Code : la carte regroupe les critères par niveau atteint de l'échelle des évaluations, un bloc par niveau, sous le nom que l'enseignant·e lui a donné ; l'interprétation SOLO n'apparaît que si le niveau porte une étiquette SOLO (`profil-etudiant-sections-affichage.js:1347-1351, 1449-1538`, décision du 27 août). L'option règle aussi la catégorie « Compréhension » de la palette d'annotation (index.html:8803-8806).
  - Encadré « Distinction importante » — Aide : « Défis (I/D) : Niveaux IDME individuels par critère dans «Observation de la structure SOLO» » (12913) / Code : la carte SOLO ne classe plus en forces et défis depuis #542 (`:1333-1351`). L'exemple « défi D (Développement 65-74 %) en Structure mais une force M […] en Français » décrit un affichage disparu.
  - Option 1 : libellé, chemin et liste des patterns exacts (index.html:9027).
- Sert ? : l'encadré « Distinction » (~95 mots) n'a plus d'objet. La note finale « développées dans le cadre de la pratique PAN – Standards » (~30 mots) est de l'historique. Les effets de chaque option sont déjà écrits sous chaque case, avec leurs étiquettes « où ça agit » (index.html:8803-8806, 9029-9032). « L'étudiant a un défi » (12914) : forme non inclusive.
- Verdict proposé : corriger et resserrer (~332 → ~120)
- Motif : garder les deux options avec leur libellé exact et le « activer si / désactiver si » ; retirer ce que l'écran a cessé d'afficher.
- Tests qui l'épinglent : `sentinelle-audit-aide-15-oct` (tranche « Option 1 : Détection des patterns » → « Option 2 : Observation » : les six patterns doivent y rester nommés) ; `sentinelle-audit-aide-lot-A-chemins-et-libelles` (libellé « Appliquer une adaptation… », présent aussi au glossaire, 13794).

### patterns — « Repérer les patterns de progression » (index.html:12927-12980, 361 mots)
- Vrai ? : à corriger
  - Aide : un niveau par pattern — « Stable → RàI Niveau 1 », « Défi spécifique → Niveau 2 », « Difficulté émergente → Niveau 2 » (12939, 12946, 12953) / Code : le niveau lit aussi P quand la note existe : P < 75 % donne au moins le niveau 2, P < 64 % le niveau 3, quel que soit le pattern (`profil-etudiant-calculs.js:1851, 1868`). Un·e étudiant·e « Stable » à P = 70 % est au niveau 2. C'est la règle que l'Aide dit ailleurs en une phrase, cinq fois (10178, 10332, 13595, 13794, 13859) ; cette carte en donne une version sans P.
  - Aide : « Stable : Aucun défi identifié » (12938) / Code : il faut aussi une performance des derniers artefacts ≥ 64 %, sinon « Difficulté persistante » (`:1689-1704`).
  - « Défi identifié » n'est défini nulle part dans la carte / Code : un critère sous le « Seuil de défi spécifique », 70 % par défaut, réglable (`:1281`, `interpretation-config.js:50`).
  - « Performance < 75 % (en développement) », « < 64 % (insuffisant — compréhension unistructurelle) » (12952, 12959) : les valeurs sont celles du code (`interpretation-config.js:42-46`, non réglables à l'écran), mais les mots de l'échelle IDME et de SOLO les présentent comme une lecture universelle.
  - Non-participation, Données insuffisantes / En attente : exacts (`:1806-1836`, `:1730-1763`).
- Sert ? : les lignes « Action » (~45 mots) prescrivent (« Rencontre individuelle, ré-enseignement ») là où l'application parle au conditionnel. L'encadré « RàI et mobilisation » (~150 mots) est de la théorie ; il dit que A + C « évalue le comportement » et que P mesure le cognitif, alors que la carte acp de l'Introduction dit que A « Mesure l'engagement cognitif » (10128) : deux définitions de l'engagement cognitif dans l'Aide.
- Verdict proposé : corriger et resserrer (~361 → ~170)
- Motif : la carte doit dire la règle unique du niveau (P et pattern) et ce qu'est un défi ; la théorie et les actions recommandées peuvent partir.
- Tests qui l'épinglent : `sentinelle-audit-aide-15-oct` (tranche de `id="accordeon-aide-patterns"` à « RàI et mobilisation : deux systèmes » : si l'encadré part, la borne de fin de la sentinelle doit changer).

### guide-profil — « Guide détaillé : Profil étudiant » (index.html:12983-13289, 1 307 mots)
Comparaison section par section avec ce que le profil affiche (`profil-etudiant-sections-affichage.js`, `profil-etudiant-diagnostics.js`, `graphiques-progression.js`).

| Passage de l'Aide | Ce que montre le profil | État |
|---|---|---|
| « organisé en 3 grandes sections » (12991) | huit vues dans une barre latérale, Productions par défaut (`:2581, 2641-2689`) | faux |
| Section 1 Accompagnement (12999-13007) | trois cartes et l'historique, comme écrit (`:1092-1323, 1542-1622`). Manquent : P globale et « Progression par critère » dans la carte RàI, le bouton « + Nouvelle intervention » (`:1548`). « La progression par critère, lue avec la taxonomie SOLO » attribue à la carte SOLO ce qui est dans la carte RàI. | exact pour l'essentiel |
| « Performance IDME », « Scores par critère : tableau détaillé avec badges », « Diagnostic pédagogique » (13015-13017) | P avec le code du niveau si la pratique a une échelle (`:4169-4180, 4222`), onglets « Critères » (graphique), « Forces et défis » (une barre par critère sur le dégradé de l'échelle, flèche de direction), « Gestes cognitifs » (`:3719-3785`, `profil-etudiant-diagnostics.js:303-310`) | faux |
| « Comment lire le tableau des critères ? » : 5 lignes, 3 colonnes, « Score pondéré », badges (13021-13046) | aucun tableau de critères ; « 5 lignes » suppose la grille SRPNF | faux |
| « Forces : Critères ≥ .75 ; Défis : < .75 » (13054-13055) | 70 % par défaut, réglable (`profil-etudiant-sections-affichage.js:4189`) | faux, troisième valeur dans l'Aide |
| Table « Stratégies d'intervention différenciée » (13060-13105) | rien à l'écran ; bornes de l'échelle IDME données comme règle | sans objet |
| « Astuce : Bascule «Voir formules» » (13108-13116) | aucune bascule ; une icône « i » à côté du titre de la vue ouvre « Méthodologie de calcul » (`:2128-2135, 4200-4214`) | faux |
| Section 3 « Mobilisation (A-C-P) » (13120-13127) | la vue s'appelle « Engagement ACP » ; trois fiches : périodes présentes, absences cliquables, interventions ; productions remises, remises et non remises cliquables ; méthode, jetons, artefacts retenus (`:594-842`). Aucun mot d'interprétation sous A ou C (`interpA` jamais lu, `:394`). | faux |
| « Exemples de profils » (13134-13140) | rien à l'écran ; mots qui jugent (« procrastination ? », « Désengagement généralisé, intervention urgente ») | sans objet |
| « Comment lire le tableau des artefacts ? » : Production, Statut ✓/✗, Score, Niveau, Retenu (13146-13153) | le tableau de la vue Productions a pour colonnes Production, Description, Jeton, Note, Date, Actions (`:3230-3239`) ; la fiche Performance n'affiche que les artefacts retenus (`:786-788`) : la branche « estompée » (opacité 0,6, `:813`) n'est jamais atteinte | faux |
| Astuce sur l'ordre, la modalité réglée et l'étoile (13156) | l'étoile signale bien un jeton (`:824-825`) ; « les autres sont estompés » : voir ligne précédente | à corriger en partie |
| « Navigation entre étudiant·es » : « ← Précédent », « Suivant → », « en haut de la page » (13173) | « ← Préc. », « Suiv. → », dans la barre latérale, sous un sélecteur (`:2591-2620`) | faux (libellés, place) |
| « Workflow recommandé pour révision complète » (13175-13183) | ouvrir un profil depuis la liste : exact (`etudiants.js:1152-1156`) ; le reste prescrit | sans objet |
| Progression temporelle ACP (13195-13204) | marqueurs exacts (`graphiques-progression.js:618-641, 818-821`), sauf : ◉ marque un jeton de délai ou de reprise (`graphiques-progression.js:393-420`), pas seulement de reprise ; « Clique sur une courbe pour la verrouiller » est le geste du graphique de Suivi du groupe (index.html:7613), le graphique du profil n'en a pas ; non dits : cases A, C, P et « P sans reprises » (`profil-etudiant-sections-affichage.js:3416-3443`) | à corriger |
| Développement des habiletés (critères) (13208-13215) | exact, sauf « au moins 2 évaluations » : une suffit (`profil-etudiant-sections-affichage.js:3803`, `graphiques-progression.js:2033`) | à corriger |
| « Graphiques de l'aperçu » : corrélations, impact des jetons (13220-13242) | ces graphiques sont dans Labo › Études (index.html:9185-9298) ; « Menu «Étudiant·e» » : aucun menu, deux courbes seulement (`impact-jetons.js:370-400`) | lieu faux, doublon avec labo |
| « Checklist d'utilisation hebdomadaire » (13246-13287) | « Consulter l'Aperçu » (chemin inexistant), « zones orange/rouge », profils « Fragile » (le mot ne s'affiche plus depuis #821) ; fréquences prescrites | sans objet |

- Vrai ? : à corriger (voir table : une section sur huit tient)
- Nombres à l'anglaise (#1137) : « (ex: 0.72) » (13026) ; « < .64 », « .65-.74 », « .75-.84 », « ≥ .85 » (13029-13032) ; « ≥ .75 », « < .75 » (13054-13055) ; les quatre bornes de la table des stratégies (13069, 13078, 13087, 13096). Onze occurrences, à côté d'un exemple déjà écrit « 0,68 » (13039). Les bornes « < .64 » puis « .65 » gardent le trou que la correction du 15 oct. a fermé ailleurs (l'échelle de départ dit I < 65, `echelles.js:85-96`) ; la sentinelle cherche « &lt; 64 » et ne voit pas « &lt; .64 ».
- Forme : « Étudiant très mobilisé », « premier étudiant », « dernier étudiant » (13136, 13179, 13182, 13186).
- Sert ? : stratégies (~90 mots), exemples de profils (~45), workflow (~60), checklist (~110), « Graphiques de l'aperçu » (~130, doublon avec labo), boîte « Comment lire le tableau des critères » (~120) : ~555 mots sans objet. Le reste double profil-etudiant, les infobulles du profil (`accompagnement-contenu-hover.js:561-599`, une par vue) et les deux aides contextuelles du profil.
- Verdict proposé : fusionner avec profil-etudiant, en une entrée « Lire le profil d'un·e étudiant·e » (~1 466 mots → ~350) : la barre latérale et ses huit vues, une à trois phrases par vue, l'icône « i » de « Méthodologie de calcul », le renvoi aux mots de A et C (diagnostics) et à la règle du niveau (patterns).
- Motif : l'entrée décrit un profil qui n'existe plus, en trois fois la longueur de l'entrée qui décrit le même écran.
- Tests qui l'épinglent : `sentinelle-803-aide-pan-famille-pas-mecanique.test.js` (« modalité réglée dans ta pratique » et « L'étoile […] jeton de reprise ou de délai » n'existent qu'en 13156 : l'astuce doit survivre dans l'entrée fusionnée, ou la sentinelle suivre) ; `sentinelle-audit-aide-lot-E` (`<strong>Niveau IDME</strong>` doit rester absent).

### planifier-rai — « Planifier les interventions RàI » (index.html:13292-13325, 209 mots)
- Vrai ? : à corriger
  - Aide : « Le formulaire unifié te guide en 5 sections » (13300) / Code : six blocs ; la liste omet « Observations générales » (`interventions.js:1143-1151`) et le bloc « Gestion des absences » (`:1077-1088`). L'aide contextuelle de l'écran en compte six.
  - Aide : « Objectif visé — Suggestion automatique basée sur le critère le plus faible » (13316) / Code : la suggestion vient au clic sur « Suggérer » (`interventions.js:1138, 1433`) ; le champ est vide par défaut (`:209`).
  - Logistique, statut modifiable, aperçu du sous-groupe à gauche, critères pré-cochés avec leur compte, bilan à la complétion, création depuis le profil avec l'étudiant·e pré-coché·e et le niveau dérivé : exacts (`:1004-1075, 1094-1102, 1363-1393, 1154-1247, 822-844, 1275-1276`).
- Sert ? : l'entrée reprend presque mot pour mot l'aide contextuelle `interventions-planification` de l'écran (`accompagnement-contenu-popup.js:673-720`, ouverte par le « i » de Suivi › Interventions). L'encadré « Les 3 niveaux » (~60 mots) double l'Introduction (rai, 10149-10183) et l'aide `tableau-bord-rai`. « Pré-cochés selon les défis communs du sous-groupe » redit l'écran (`interventions.js:1122`). L'entrée rai-absences (lot 4, 12363-12544) couvre le même formulaire.
- Verdict proposé : fusionner avec rai-absences (~209 → ~60 ajoutés à rai-absences : la création depuis le profil, la suggestion au clic)
- Motif : trois textes décrivent le même formulaire ; deux suffisent, dont celui de l'écran.
- Tests qui l'épinglent : aucun

### labo — « Labo — Analyser ta démarche pédagogique » (index.html:13328-13379, 355 mots)
- Vrai ? : à corriger
  - Aide : « Le Labo propose actuellement deux angles d'analyse » (13341), sous un titre qui nomme le Labo entier / Code : le Labo a sept sous-sections (`js/config.js:86-92`) ; les deux graphiques sont ceux de la seule sous-section Études.
  - Dynamique des corrélations : couleurs, cercles ◎ des dépôts, triangles N2/N3, superpositions, minimum de 5 étudiant·es : exacts (`correlations-longitudinales.js:28, 156-160, 406-420, 545-546` ; index.html:9223-9241). « Minimum 5 étudiant·es par semaine pour obtenir une corrélation fiable » : le code ne calcule aucun r sous 5 ; « fiable » est une appréciation.
  - Impact des jetons : courbes, ◼, infobulle, carte masquée sans jeton : exacts (`impact-jetons.js:343-347, 357-364, 403-436`).
  - Aide : « Si la courbe orange diverge positivement après les ◼, c'est un signal encourageant » (13376) : lecture causale, que contredit le rappel de la même carte (13364) et l'aide contextuelle de l'écran (« des pistes de réflexion, pas des preuves », `accompagnement-contenu-popup.js:916-929`).
- Outils du Labo dans le code, et ce que l'Aide en dit :

| Sous-section (code) | Ce qu'elle fait | Dans l'Aide |
|---|---|---|
| Outils d'observation (`labo-accompagnement`, index.html:8762) | réglages SOLO, ACP, RàI, seuils | pas d'entrée propre ; cité comme chemin (rai-solo, diagnostics, grille-depistage, glossaire, FAQ) |
| Modélisation (`labo-modelisation`, `modelisation.js`) | annotation projetée en classe | oui, entrée modelisation (lot 4, 12580) |
| Exploration des pratiques (`labo-comparateur`, `comparateur-pratiques.js`) | note finale de profils-types ou du groupe réel sous plusieurs pratiques, en lecture seule | non (0 occurrence) |
| Rythme de travail (`labo-rythme`, `rythme.js`) | durées d'évaluation par activité, du chronomètre | non (seul le « chrono d'évaluation » est nommé dans preferences, 11291) |
| Études (`labo-etudes`) | corrélations, impact des jetons | oui, cette entrée |
| Bilan réflexif (`labo-bilan`) | questionnaire, parcours, auto-réflexion, rapport | oui, entrée bilan-reflexif |
| Suivi longitudinal (`labo-longitudinal`, `registre-longitudinal.js`) | registre d'élèves suivis d'un trimestre à l'autre, copie datée du dossier, résultats ultérieurs | non |
| Bandeau « Codex data chargé » (`labo-codex-data.js`, index.html:8741) | charge un codex data en lecture seule pour l'analyse | non |

- Sert ? : ~250 mots redisent les notes « i » de l'écran : « Lecture du graphique » des corrélations (index.html:9206-9220) et de l'impact des jetons (9263-9273). La partie Études double aussi « Graphiques de l'aperçu » de guide-profil (13220-13242). « illustrés ici avec une pratique PAN – Standards utilisant des jetons de reprise » (13341) : présenté comme exemple, acceptable.
- Verdict proposé : corriger et resserrer (~355 → ~180) : une vue d'ensemble du Labo, une ou deux phrases par sous-section, les Études réduites à ce que les notes de l'écran ne disent pas.
- Motif : le titre promet le Labo ; l'entrée en décrit un septième, en redisant l'écran, et tait trois outils.
- Tests qui l'épinglent : aucun

### bilan-reflexif — « Bilan réflexif — Recueillir l'expérience vécue » (index.html:13382-13440, 379 mots)
- Vrai ? : à corriger
  - Aide : « Import CSV/TSV par glisser-déposer » (13424) / Code : « Cliquer pour sélectionner un fichier CSV » (`bilan-reflexif-csv.js:56-59`) ; aucun glisser-déposer dans les modules du bilan.
  - Aide : « Export en texte brut pour distribution via formulaire externe (Google Forms, Microsoft Forms, etc.) » (13404) / Code : le bouton s'appelle « Copier les questions » (`bilan-reflexif-editeur.js:60`) ; l'écran ne nomme aucun service.
  - Aide : « Les réponses étudiantes sont anonymes » (13391) : l'anonymat dépend du formulaire externe ; l'écran demande de le configurer (« Assure-toi que le formulaire ne collecte pas le nom ni le courriel », `bilan-reflexif-editeur.js:73`).
  - Non dits : « Exporter en PDF » du rapport (`bilan-reflexif-rapport.js:51`), « Importer un questionnaire », « Réinitialiser le modèle » (`bilan-reflexif-editeur.js:61-62`).
  - Cinq onglets, huit blocs, blocs A-B-C de l'auto-réflexion, 30 répondants démo, signaux ≥ 80 % / ≥ 30 % : exacts (`bilan-reflexif.js:110-114`, `bilan-reflexif-data.js:39-117, 140-142`, `bilan-reflexif-reflexion.js:3`, `bilan-reflexif-rapport.js:419-420`).
- Sert ? : « Recommandation : 5-7 activités marquantes » redit l'écran (`bilan-reflexif-parcours.js:41`) ; la distribution du questionnaire est expliquée à l'écran en sept étapes (`bilan-reflexif-editeur.js:66-79`) ; l'encadré « Objectif » (~40 mots) est de la finalité. ~90 mots en jeu.
- Verdict proposé : corriger et resserrer (~379 → ~200)
- Motif : trois affirmations à rectifier, et l'écran porte déjà le mode d'emploi pas à pas.
- Tests qui l'épinglent : aucun (`bilan-reflexif.test.js` teste les données du module, pas l'Aide)

---

## Les corrections du 15 octobre tiennent-elles ?

- **Indice R** : aucune formule ni « niveau de risque » dans le lot. Reste « identification rapide des risques » (12711), hors du motif de la sentinelle.
- **Niveau RàI** : la phrase unique est en place ailleurs (cinq fois). Dans ce lot, la carte patterns associe un niveau à chaque pattern sans P : c'est une version de plus, fausse quand P < 75 %.
- **Patterns** : les six valeurs sont nommées dans patterns, rai-solo et profil-etudiant.
- **Seuils A et C** : une seule table dans la section, bornes lues. Mais le seuil forces/défis a maintenant trois valeurs dans l'Aide : 70 % (grille-depistage, 11162, juste), 75 % (profil-etudiant, 12804), .75 (guide-profil, 13054). Hors lot, d'autres seuils prescrits subsistent : « Seuils de vigilance » A < 70, C < 70, P < 60 avec actions (verification-hebdo, 12070) et « Règle d'or : […] indice < 70 % nécessite UNE action » (seuils-critiques, 13476).
- **Langue de code** : « Ce module LIT toutes les sources de données » (12783) a survécu.

## Trouvé en chemin, hors du lot (textes d'écran ou autres surfaces ; issue proposée : inscrire)

- Note « i » des corrélations : « Points carrés ■ = séances avec dépôt de production » (index.html:9210) ; le graphique dessine des cercles ◎ (`correlations-longitudinales.js:406-420`).
- Note « i » de l'impact des jetons : « Courbes individuelles — active les noms sous le graphique » (index.html:9270) ; rien de tel dans `impact-jetons.js`.
- Profil : la note masquée d'Accompagnement annonce « Indicateurs de risque » et une « Échelle visuelle de positionnement du risque » (`profil-etudiant-sections-affichage.js:1081`) ; l'icône « i » du premier rendu vise `details-calculs-risque-${da}` (`:2699`), un id qu'aucun élément ne porte.
- Profil : « l'évolution temporelle des indices A-C-P-E » (`:3392`, l'indice E est retiré) ; « Crée des productions dans la section Matériel → Productions » (`:2939`, le chemin est Conception › Productions étudiantes).
- Note de Suivi du groupe : « Progression stable : Amélioration régulière… », « Défi spécifique : Difficulté ponctuelle sur un type de tâche » (index.html:7556-7557) : des définitions qui ne sont pas la règle du code.
- Infobulle `pref-outils-rai` : « universel, ciblé, intensif » (`accompagnement-contenu-hover.js:149`) ; le motif de la sentinelle est sensible à la casse et ne voit que « Universel, Ciblé, Intensif ».
- Aide contextuelle `calendrier-vue` : flèches et « dates en gras » (`accompagnement-contenu-popup.js:385-389`).
- Textes d'écran au mot « élève » : index.html:7520, 8984 ; `bilan-reflexif-parcours.js:36-38`.

## Bilan du lot

| Verdict | Entrées |
|---|---|
| garder | 0 |
| corriger | 2 (tableau-bord, diagnostics) |
| corriger et resserrer | 5 (presences-calendrier, rai-solo, patterns, labo, bilan-reflexif) |
| couper | 1 (presences-apercu) |
| fusionner | 3 (profil-etudiant + guide-profil en une entrée ; planifier-rai dans rai-absences) |

**Mots** : 3 489 aujourd'hui → ~1 300 visés (dont ~60 versés dans rai-absences).

**Les trois constats qui comptent le plus**
1. Le profil que décrit l'Aide n'est plus celui de l'écran. Deux entrées (1 466 mots) décrivent trois sections là où la barre latérale en ouvre huit, un tableau des critères, une bascule « Voir formules », un tableau des artefacts et des mots sous A et C qui n'existent pas, un seuil forces/défis à 75 % au lieu de 70 % réglable, et onze nombres à l'anglaise. Proposition : une entrée de ~350 mots.
2. Trois entrées envoient vers ce qui n'existe pas : l'« aperçu des présences » n'a pas d'écran (`presences-apercu.js:19-22`), le calendrier n'a ni flèches ni couleurs d'assiduité, et « Navigation : Aperçu » ne mène à aucun onglet (c'est Suivi › Suivi du groupe).
3. Les corrections du 15 oct. tiennent pour R, les patterns et la table A/C, mais deux règles ont encore plusieurs versions : le niveau RàI (la carte patterns l'attache au seul pattern) et le seuil forces/défis (70, 75, .75). Le Labo n'est décrit qu'à moitié : l'Aide couvre Études, Bilan réflexif et Modélisation ; Exploration des pratiques, Rythme de travail, Suivi longitudinal et le chargement d'un codex data n'y figurent pas.

Toute réécriture devra garder des chemins « Onglet → Sous-section » existants : la sentinelle du lot A les vérifie tous.
