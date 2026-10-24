# Lot 3 — Formation et démonstration, début d'Utilisation hebdomadaire

*Audit en lecture seule, 24 oct. 2026, dépôt au commit 35745bd (1.216.2). Plage `index.html:11318-11875`, 12 entrées, 2 930 mots.*

Les preuves `fichier:ligne` renvoient au dépôt. « Aide » = le texte de la section Aide ; « Code » = ce que fait l'application.

---

### modes-formation — « Les deux modes de l'application » (index.html:11323-11354, 107 mots)
- Vrai ? : à corriger
  - Emplacement du réglage — Aide : « le sélecteur dans l'en-tête, à droite du groupe-cours actif » (11330) / Code : un bouton-icône (masque) parmi les utilitaires de la première ligne de l'en-tête, titre « Mode normal / anonymisé » (index.html:3889) ; sur téléphone, menu « ⋯ › Anonymisation » (3933-3936). Le sélecteur de groupe-cours est seul sur la deuxième ligne (3908-3915). Même erreur dans l'entrée `modes` (10518).
  - Sous-titre de la sous-section — Aide : « Modes de fonctionnement pour explorer l'application sans risque » (11320) / Code : le mode anonymisé écrit dans les vraies données (l'Aide le dit elle-même en 11348) ; seule la démo est sans risque (demo-activation.js:247-264).
  - « Élève 1 », « Gr. A » : conformes (modes.js:368, 1405). Écart de vocabulaire côté code, pas côté Aide : le pseudonyme affiché dit « Élève », la règle dit « étudiant·e ». À trancher par Grégoire.
- Sert ? : ~80 mots redisent l'entrée `modes` (10491), qui décrit les mêmes deux modes avec la même erreur d'emplacement. Le titre « Les deux modes » laisse croire que la démo est un troisième mode, ce que le code ne fait pas (la démo force le mode normal, demo-activation.js:314-315).
- Verdict proposé : fusionner avec `modes` (une seule entrée « Le mode anonymisé », ~80 mots)
- Motif : deux entrées pour un seul bouton, toutes deux fausses sur l'emplacement.
- Tests qui l'épinglent : aucun par l'id. `tests/unit/sentinelle-audit-aide-15-oct-ce-que-fait-l-application.test.js` interdit seulement « Cerf agile » dans l'Aide.

### demo — « Explorer la démonstration » (index.html:11357-11395, 199 mots)
- Vrai ? : à corriger
  - Activation — Aide : « clique sur la carte « Explorer la démo » (premier lancement) ou coche « Données de démonstration » » (11385) / Code : une seule carte, « Données démo », avec une case (js/accueil.js:271-280). Aucune carte « Explorer la démo » dans le code.
  - Arrivée — Aide : « t'amène à l'aperçu » (11386) / Code : Suivi › Suivi du groupe (demo-activation.js:374-376 ; config.js:69).
  - Encarts — Aide : « dans chaque sous-section » (11388) / Code : 16 sous-sections en ont un ; Suivi du groupe, où la démo arrive, n'en a pas (guidage-demo.js:14-92).
  - Cartouches — Aide : « 3 cartouches de rétroaction » (11378) / Code : 9 cartouches en 3 jeux, un par grille (pack-demo-10.js, clés `cartouches_GRILLE_DEMO_*` : 4 + 4 + 1).
  - Sortie — Aide : « passe en Mode Normal pour configurer ton vrai cours » (11392) / Code : quitter la démo n'est pas changer de mode ; « Normal » s'oppose à « Anonymisé » (modes.js:15-18). Quitter : « Quitter la démo » du bandeau, ou décocher « Données démo » (accueil.js:354-357).
  - Manque ce qu'a changé le chantier d'octobre : la démo est provisoire (une nouvelle version du pack remplace les évaluations), et le bouton « Retirer les copies (N) » du bandeau efface les copies importées (demo-activation.js:607-678 ; texte validé dans accompagnement-contenu-popup.js:1224).
  - Exact : 10 étudiant·es, 11 productions (1 portfolio, 9 artefacts, 1 évaluation terminale), 101 évaluations, 32 dates du 25 août au 10 décembre, 3 grilles, 2 échelles, 1 carte d'alignement (pack-demo-10.js ; demo-namespace.js:40-58, 270). Bandeau « Mode démonstration » (index.html:3989).
- Sert ? : la liste du contenu (~55 mots) redit le popup « Données démo » (accompagnement-contenu-popup.js:1219). Le slogan « Explore, clique partout… » (~12 mots) n'apprend rien. La « Recommandation » (~45 mots) recoupe `prise-en-main` (10631) et `parcours`.
- Verdict proposé : corriger et resserrer (~199 → ~110 mots)
- Motif : deux gestes faux sur trois, et le caractère provisoire de la démo absent.
- Tests qui l'épinglent : `tests/unit/sentinelle-audit-aide-lot-A-chemins-et-libelles.test.js` (exige « 11 productions (1 portfolio, 9 artefacts », « 32 dates », « 3 grilles de critères », « 2 échelles de performance », « 10 étudiant », phrases qui n'existent que dans cette entrée).

### parcours — « Deux parcours selon ton expérience » (index.html:11398-11440, 175 mots)
- Vrai ? : à corriger
  - Aide : « Configuration rapide (~5 minutes pour un cours complet) » (11413) / Code : la visite guidée ne configure rien ; elle montre sept écrans dans un ordre fixe (accompagnement.js:1072-1141).
  - Aide : « Active la visite guidée → Clique sur [icône] → Choisis un module » (11416) / Code : aucun module à choisir ; bouton de l'en-tête (index.html:3894) puis « Démarrer la visite » (accompagnement-contenu-popup.js:1207-1209), ou « Commencer la visite guidée » dans la bannière de l'accueil (accueil.js:113-115). Le vocabulaire « module » et la durée sont ceux de l'assistant Primo, retiré le 21 avril (audit du 10 sept., A.3).
  - Aide : « Comment : Mode Normal → Navigation par les onglets Cadre et Conception » (11428) / Code : même confusion démo/mode que plus haut.
- Sert ? : les trois outils réels (démo, visite, assistance) sont décrits juste dans `prise-en-main` (10631). Le reste est générique (« Gestion avancée du matériel pédagogique ») ou prescriptif (« Recommandé si », « Parcours hybride recommandé »). 175 mots en jeu.
- Verdict proposé : couper
- Motif : vestige de Primo dont le contenu juste existe déjà dans `prise-en-main`.
- Tests qui l'épinglent : aucun.

### validation-grille — « Valider ta configuration : Tests de la grille de référence » (index.html:11443-11546, 489 mots)
- Vrai ? : à corriger. Réponse au point d'attention : il n'existe pas de fonction « tests » dans l'application. L'entrée est une procédure manuelle autour d'un menu qui existe toujours (Labo › Outils d'observation › « Grille de critères pour le dépistage », index.html:8834-8839), mais plusieurs gestes ont changé.
  - Aide : « Clique sur «Enregistrer les réglages» » (11499) et « Enregistre les réglages » (11512) / Code : ce bouton est retiré depuis le 28 sept. ; chaque réglage s'enregistre dès qu'on le change (commentaire index.html:8763-8765 ; texte d'écran 8770 ; `data-on-change` du menu, 8836). Même erreur dans `grille-depistage` (11145), hors lot.
  - Aide : « Recharge la page » (11513, 11543) / Code : rien ne l'exige d'après le code (enregistrement au changement) ; à voir à l'écran.
  - Aide : « l'option par défaut «&nbsp;— Sélectionner —&nbsp;» » (11469) / Code : « — Sélectionner une grille — » (8837).
  - Aide : « Clique sur «➕ Créer une nouvelle grille» » (11477) / Code : bouton « + Nouvelle grille » (index.html:5019). L'option « ➕ Créer une nouvelle grille » vit dans un conteneur caché « pour compatibilité » (grilles.js:95-96 ; index.html:5135-5138). Même erreur dans `grille-depistage` (11126).
  - Aide : « Enregistre la grille » (11487) / Code : une grille neuve se crée par « Créer la grille » ; une grille existante s'enregistre toute seule (index.html:5009-5012).
  - Aide : « Le système reconnaît tes critères dans les rétroactions » (11456) / Code : le dépistage lit les niveaux par critère, pas le texte (la phrase voisine, 11453, le dit déjà ; reste de la correction du 15 oct.).
  - Aide : « Ouvre l'aperçu (tableau de bord) » (11530) / Code : l'écran s'appelle Suivi › Suivi du groupe (config.js:69). « Cartes d'étudiant·es critiques » : à voir à l'écran.
  - Aide : « Si la section est vide, ta grille de référence n'est pas encore définie » (11503) / Code : l'écran le dit lui-même, avec le chemin du réglage, sous « Configuration requise » (profil-etudiant-diagnostics.js:119-128 ; profil-etudiant-helpers.js:802-808). En démo, la grille se résout seule (helpers 792-800).
- Sert ? : les tests 2 et 3 (~190 mots) recopient presque mot pour mot les étapes 1 et 2 de `grille-depistage` (11123-11146), mêmes exemples SRPNF, Chimie, Anthropologie. « Pourquoi tester ? » (~45 mots) redit « Pourquoi configurer » de la même entrée. La « Validation rapide » de `grille-depistage` (11170) dit en une phrase ce que font les tests 3 à 5. Le message « Configuration requise » rend le diagnostic inutile. 489 mots en jeu.
- Verdict proposé : couper (garder la « Validation rapide » de `grille-depistage`, après correction de son « Enregistrer les réglages »)
- Motif : doublon de `grille-depistage`, avec deux gestes qui n'existent plus.
- Tests qui l'épinglent : aucun.

### flux-travail — « Flux de travail hebdomadaire » (index.html:11557-11576, 45 mots)
- Vrai ? : à corriger
  - Aide : « Fin de cours : Saisir les présences » (11570) / aide contextuelle : « Prends les présences au début du cours plutôt qu'à la fin » (accompagnement-contenu-popup.js:319). Les deux textes se contredisent.
  - Le « flux » ne compte que les présences : ni import, ni évaluation, ni verrouillage, qui sont l'essentiel des gestes de la sous-section.
  - Aide : « Intervenir si seuils critiques atteints » (11572) : prescriptif, sans dire où ni lesquels ; les seuils vivent dans Labo › Outils d'observation.
- Sert ? : les durées (« 5-15 minutes », « 2-5 min ») redisent `temps-estimes` (12659) et le sous-titre de la sous-section (« 5-15 min/semaine », 11554). Les étapes 3-4 redisent `verification-hebdo` (12054). Ces chiffres n'ont pas de source dans le code.
- Verdict proposé : corriger (remplacer par le déroulé réel d'une semaine en cinq gestes, ~50 mots, qui sert de sommaire à la sous-section et absorbe `temps-estimes`)
- Motif : un sommaire juste orienterait le lecteur ; celui-ci décrit un quart de la semaine et contredit l'aide contextuelle.
- Tests qui l'épinglent : aucun.

### etudiants — « Gérer la liste des étudiant·es » (index.html:11579-11613, 162 mots)
- Vrai ? : à corriger (mineur)
  - Aide : « Groupe d'étudiants » (11586, 11588) / Code : « Groupe d'étudiant·es » (index.html:7006).
  - Aide : « clique « Ajouter l'étudiant » » (11594) / Code : « Ajouter l'étudiant·e » (7127).
  - Champs : l'Aide en liste six (11594, 11597-11604) ; le formulaire en a huit, dont « Mesure d'aide » et « Date d'arrivée » (7113-7122).
  - Aide : « Groupe : Numéro de groupe-cours » (11601) / Code : le champ « Groupe » porte le numéro du groupe (7097-7098) ; le groupe-cours est une autre notion (entrée `groupe-cours`, 10739).
  - Exact : coller puis « Prévisualiser » puis confirmer (7142-7175) ; format CSV (7156) ; « Exporter CSV » (7052) ; filtre « Groupe » (7021-7025) ; résumé avec SA et programmes (7033-7047).
- Sert ? : doublon de `groupe` (« 3. Créer le groupe », 10789), même chemin, mêmes champs, ~70 mots en commun. Le format CSV recopie le texte d'écran (7156). L'infobulle `reglages-etudiants-import` (accompagnement-contenu-hover.js:108) dit la même chose. La liste des champs (~45 mots) redit les libellés du formulaire. Gérer la liste est un geste de configuration, pas hebdomadaire.
- Verdict proposé : fusionner avec `groupe` (une entrée en Configuration, ~110 mots, qui garde « Mesure d'aide » de `groupe`)
- Motif : deux entrées pour le même accordéon, dans deux sous-sections.
- Tests qui l'épinglent : aucun.

### lecons — « Planifier les leçons » (index.html:11616-11668, 676 mots)
- Vrai ? : à corriger
  - Aide : « Donne un titre dans le champ éditable en haut » (11630) / Code : « Nouvelle carte » demande le nom dans une boîte de dialogue (planification-carte.js:9214) ; renommer passe par « Actions › Renommer cette carte » (index.html:4284).
  - Aide : « Relie les éléments entre eux en cliquant » (11632) / Guide intégré : « en tirant un lien d'un port à l'autre » (planification-carte.js:1933).
  - Aide : « Supprimer un bloc : glisse-le sur la corbeille de la palette » (11662) / Code : la corbeille a quitté la palette le 10 août (#444) ; elle flotte au bas du canevas, visible pendant un déplacement (index.html:4481-4490). La touche Suppr ou ⌫ supprime aussi la sélection (planification-carte.js:12358).
  - Aide : « Multi-cartes : crée plusieurs cartes, duplique-les » et « Importer : une carte exportée en JSON… » (11663-11664) sans chemin / Code : importer, exporter, dupliquer et supprimer une carte se font dans « Consulter la bibliothèque » depuis le 9 oct. (index.html:4278 ; planification-carte.js:9220-9222).
  - Aide : « trois niveaux (Plan de cours, En classe, Preuve d'alignement) × trois formats » (11665) / Code : un quatrième choix, « Calendrier », en TSV ou Markdown (planification-export.js:37).
  - Exact : 18 types en six familles (index.html:4398-4470), menu Vue (zoom 100/75/50/25 %, Recentrer R, Tout voir, plein écran et Échap), Annuler et Rétablir de la barre, copie/clone avec et sans ⇧ (planification-carte.js:12353-12356), Décloner dans l'Inspecteur (3483) et dans Actions (index.html, `planif-btn-detacher-clone`).
- Sert ? : « L'objectif d'une leçon » (~55 mots) redit la page « Ce que la leçon vise » du Guide intégré (planification-carte.js:1955). Copier, cloner et les outils de navigation (~230 mots) redisent le panneau « Vue › Raccourcis clavier » (RACCOURCIS_CARTE, planification-carte.js:12344-12365) et l'infobulle `planif-detacher-clone`. La liste des 18 types (~60 mots) recopie la palette « Nœuds ». La carte est une conception de cours, pas un geste hebdomadaire.
- Verdict proposé : corriger et resserrer (~676 → ~220 mots), et déplacer vers Configuration, après `creer-productions`
- Motif : l'application porte déjà un guide de huit pages et un panneau de raccourcis ; l'Aide peut s'en tenir à ce que fait la carte, à ses trois gestes de base et à l'endroit où trouver le guide.
- Tests qui l'épinglent : aucun par l'id ; aucun test ne lit cette entrée.

### preparer-importer — « Préparer et importer les travaux » (index.html:11671-11718, 289 mots)
- Vrai ? : à corriger
  - Aide : « Mode Léa » et « Mode Libre » (11699-11700) / Code : deux boutons radio par fichier, « LEA » et « Autre », dans l'étape Optimisation (travaux-ui.js:2018-2031).
  - Aide : badge « En cours — Import complété » (11706) / Code : « Importé », puis « Annoté », puis « Évalué » (travaux-ui.js:2678-2697 ; filtre 2946-2949).
  - Aide : « depuis la zone « Modifier un document » » (11712) / Code : aucune zone de ce nom dans l'écran d'import ; l'élément `travaux-drop-zone-edition` n'est créé nulle part (travaux-ui.js:6208, seul site). L'éditeur de pages s'ouvre par « Actions › Modifier » dans Annoter et évaluer (travaux-ui.js:1190) ou par « Modifier » dans le menu d'une ligne de la Liste des évaluations (liste-evaluations.js:1571).
  - Aide : « Sur Mac, ils peuvent aussi être rangés directement sur ton disque » (11715) / Code : c'est le navigateur qui décide, pas la machine (ni Safari ni Firefox, aucune tablette) ; bouton « Configurer le stockage sur disque » (travaux-ui.js:890-893, 980-986).
  - Aide : HEIC « à convertir en JPEG avant l'import » (11686) / Code : en ligne, le HEIC se décode (heic-decodeur.js:78-82) et la zone l'annonce (travaux-ui.js:880-884) ; la conversion ne vaut qu'à l'ouverture depuis le disque. La phrase suivante le dit, mais la première se lit comme une règle générale.
  - Exact : chemin, étapes « 1 Sélection des fichiers » et « 2 Optimisation » (travaux-ui.js:1000, 1018), les formes de numérotation des pages (travaux-import.js:116-119).
- Sert ? : les étapes et formats (~50 mots) redisent l'écran (travaux-ui.js:938-965, 1006) et le popup `evaluations-importer` (accompagnement-contenu-popup.js:447). Le popup `evaluations-annoter` contredit le paragraphe du 17 septembre : il dit que des pages nommées « …8a », « …8b » s'assemblent (accompagnement-contenu-popup.js:509, 513), l'Aide et le code disent qu'une lettre crée une autre production.
- Verdict proposé : corriger et resserrer (~289 → ~180 mots)
- Motif : trois libellés et un chemin n'existent pas à l'écran ; le paragraphe validé sur les pages reste tel quel.
- Tests qui l'épinglent : `tests/unit/sentinelle-878-aide-nommer-les-pages.test.js` (tranche l'entrée par son id, exige « 1. Déposer les fichiers : », un « 2. » qui suit, et le paragraphe « Une remise en plusieurs fichiers » mot pour mot). `tests/unit/sentinelle-597-heic-dit-son-impossibilite.test.js` interdit d'écrire « Formats acceptés</strong> : PDF, JPEG, PNG, HEIC ».

### annoter-evaluer — « Annoter et évaluer un travail » (index.html:11721-11772, 375 mots)
- Vrai ? : à corriger
  - Aide : « Crayon », « Surlignage » (11745-11746) / Code : « Stylo », « Surligneur » (travaux-outils.js:172-196).
  - Aide : « Symboles — Insérer ✓, ✗, !, → » (11747) / Code : Crochet ✔, Croix ✘, Interrogation ? (travaux-outils.js:251-277) ; pas de « ! » ni de « → ». La section « Formes » (Cercle, Rectangle, Ligne, Pointillé, Vague, 1982) n'est pas nommée.
  - Aide : « Autocollants » (11750) / Code : la palette s'appelle « Tampons » (travaux-outils.js:505), comme dans le glossaire.
  - Aide : « Zoom : Préréglages Largeur, Hauteur, 100 %, Recentrer » (11738) / Code : un bouton « 100 % » et le plein écran (travaux-ui.js:1221-1223) ; aucun préréglage Largeur ou Hauteur.
  - Codes, redevenu inexact depuis le 21 oct. — Aide : « dès que la grille de la production a coché « Utiliser ces sous-critères comme codes d'annotation » » (11748) / Code : un critère algorithmique créé depuis l'étape 0 n'a plus cette case ; ses sous-critères sont ses codes d'office (grilles.js:3878-3884). La case ne reste que sur les critères plus anciens, comme le dit `sous-criteres` (11203). Avec deux critères algorithmiques, les codes vont au premier (#1132, grilles.js:3845-3858) ; l'Aide n'en dit rien.
  - Vocabulaire — Aide : « numéro, nom, couleur et rétroaction viennent de la grille » (11748) / règle : dans le gabarit d'un critère algorithmique, « observation » (grilles.js:3875 ; `sous-criteres`, 11196).
  - Badge — Aide : « clique sur Verrouiller l'évaluation […] et le badge de l'étudiant·e passe au statut « Évalué » » (11766) / Code : le badge lit « Évalué » dès qu'un critère porte un niveau (travaux-ui.js:2688-2697), et l'enregistrement automatique crée l'évaluation non verrouillée (evaluation-chargement.js:2165-2172) ; le passage à « Évalué » ne dépend donc pas du verrouillage. À confirmer à l'écran.
  - Aide : « Clique sur un badge dans la grille » (11733) / Code : l'écran d'entrée est un tableau (Nom, DA, Production, Statut, Actions, travaux-ui.js:2954-2966). À voir à l'écran.
  - Exact : gomme absente, effacement par Sélection puis corbeille en haut de la palette (travaux-outils.js:1937 ; #1124) ; Ctrl+Z, Ctrl+Y (1938-1939) ; trois panneaux Paramètres, Critères, Rétroaction ; enregistrement automatique, témoin, « Verrouiller l'évaluation », « Non verrouillée ».
- Sert ? : l'article Codes (~95 mots) redit `sous-criteres` (11176) et la note sous la case dans la grille (grilles.js:3874-3876). Les trois panneaux (~60 mots) redisent les en-têtes d'écran. « Bon à savoir » (~25 mots) redit la ligne du panneau Rétroaction.
- Verdict proposé : corriger et resserrer (~375 → ~220 mots, plus ~25 mots repris de `evaluer-productions`)
- Motif : cinq noms d'outils faux et une règle des codes périmée depuis le 21 octobre.
- Tests qui l'épinglent : aucun par l'id. `tests/unit/sentinelle-1124-gomme-retiree.test.js` interdit « <strong>Gomme</strong> » dans index.html.

### exporter-archiver — « Exporter les travaux » (index.html:11775-11796, 167 mots)
- Vrai ? : exact. Les deux cartes, « Toutes », « Tous », « Par étudiant·e et production », « Par étudiant·e », « Compresser le ZIP », « Reprises seulement », le bloc « Espace de stockage » au bas : conformes (travaux-ui.js:1299-1384).
- Sert ? : les descriptions des deux cartes (~50 mots) redisent les sous-titres d'écran (travaux-ui.js:1301, 1344). La phrase sur l'espace de stockage (~25 mots) redit le message de l'écran, « Exporte tes anciens travaux avant d'en importer d'autres ». L'id dit « archiver », le titre « Exporter » (sans effet pour le lecteur).
- Verdict proposé : resserrer (~167 → ~120 mots)
- Motif : juste et déjà court ; seules les redites de l'écran peuvent partir.
- Tests qui l'épinglent : `tests/unit/sentinelle-893-aide-exporter-archiver.test.js` et `tests/integration/aide-exporter-archiver-893.spec.js` (chaque case rendue doit être nommée entre guillemets, les deux cartes « Exporter des travaux » et « Export Léa », « le bloc au bas de l'écran »).

### saisie-presences — « 1. Saisir les présences » (index.html:11799-11838, 135 mots)
- Vrai ? : à corriger
  - Aide : « Ex: 20 min de retard sur 2h = 1.7h » (11814) / Code : la saisie se fait en périodes, par pas de 0,5, sur un maximum égal aux périodes de la séance (saisie-presences.js:12-13, 1565-1571). L'exemple est en heures, au point décimal (règle des nombres à la française) et à une valeur que le pas refuse.
  - Aide : « Si un·e étudiant·e rattrape dans un autre groupe : additionner les heures […] 4h dans la cellule » (11823-11824) / Code : la valeur est ramenée au maximum de la séance (saisie-presences.js:1721-1723) ; 4 sur une séance de 2 périodes devient 2.
  - Aide : « Assiduité alternative : sur les 3, 7 ou 12 derniers artefacts » (11835) / Code : retirée, A est sommative seulement (#224, indices.js:589, 632-633).
  - Aide : « Absences justifiées : Même traitement (le système ne distingue pas) » (11818) / Code : l'absence motivée d'une intervention RàI est marquée à part (saisie-presences.js:1035, 1548, 1650-1655). C'est l'objet de `rai-absences`.
  - Manque : seules les séances saisies entrent dans A (comparaison du 15 oct., point 6), « Mettre tout le monde présent » et « Verrouiller la saisie », livré le 21 oct. (index.html:8033, 8050).
- Sert ? : les états de présence redisent le popup `suivi-saisie` (accompagnement-contenu-popup.js:310-315), qui est juste. ~60 mots faux en jeu.
- Verdict proposé : corriger (~135 → ~90 mots)
- Motif : l'unité, le cumul et le réglage décrits ne sont pas ceux de l'écran.
- Tests qui l'épinglent : aucun.

### evaluer-productions — « 2. Évaluer les productions » (index.html:11841-11873, 111 mots)
- Vrai ? : à corriger
  - Aide : « Comptage erreurs : Saisir le nombre d'erreurs linguistiques » et « Confirmation mots » (11855-11856) / Code : ces deux champs n'existent que pour un critère algorithmique, et depuis la 1.213 l'enseignant·e nomme ce qu'il ou elle compte (`sous-criteres`, 11193). La phrase présente la correction du français de Grégoire comme le processus de toute évaluation.
  - Aide : « Rétroaction personnalisée : Basée sur les diagnostics » (11858) / Code : la rétroaction se compose depuis la cartouche (l'entrée voisine le dit, 11769 ; #1144).
  - Aide : « Indices C : % d'artefacts remis », « P : Qualité moyenne des productions » (11866-11867) / Code : C et P sont calculés par la pratique de notation active (comparaison du 15 oct., Q5-10 et Q5-12).
  - Aide : « Temps estimé : 15-30 min par production » (11861) : chiffre sans appui dans le code ; l'application a son propre chronomètre.
- Sert ? : même écran et même chemin que `annoter-evaluer` (11728), qui décrit le geste réel. Le temps redit `temps-estimes`. Seule la phrase « C'est de tes évaluations que viennent la complétion (C) et la performance (P) » (11849, ~20 mots) n'est dite nulle part ailleurs dans la sous-section.
- Verdict proposé : fusionner avec `annoter-evaluer` (y reprendre la phrase sur C et P)
- Motif : doublon de l'entrée voisine, avec trois affirmations inexactes de plus.
- Tests qui l'épinglent : aucun.

---

## Les trois entrées sur les modes se recoupent-elles ?

Oui. `modes` (Introduction, 10491), `modes-formation` et `demo` décrivent le même bouton et la même démo à trois endroits. `modes` et `modes-formation` donnent tous deux le même emplacement faux. `modes` porte en plus un bloc « Outils d'accompagnement » qui redit `prise-en-main` (10631), et `parcours` le redit une quatrième fois. Les trois appellent la démo un « mode » ; le code n'a que deux modes (modes.js:15-18) et traite la démo comme un trimestre « Démonstration » posé à part (demo-activation.js:269-286).

Ce que je recommande : une seule entrée pour le mode anonymisé (la fusion `modes` + `modes-formation`) et une seule pour la démo (`demo` corrigée), toutes deux en Formation et démonstration ; couper `parcours` ; retirer de `modes` le bloc « Outils d'accompagnement ». Motif : un lecteur qui cherche « comment cacher les noms » ou « comment essayer sans risque » doit trouver une réponse, pas trois.

## L'ordre et le découpage d'Utilisation hebdomadaire

Ce que fait l'application, d'après le code : les cartes de l'accueil donnent l'ordre d'une semaine (accueil.js:187-233) : saisir les présences, importer des copies, annoter et évaluer, observer le groupe, consulter un profil, différencier les interventions. La navigation va dans le même sens (Évaluation avant Suivi, index.html:4104-4120).

Ce que fait la sous-section : deux séries mêlées.
- Une série non numérotée : `etudiants` et `lecons` (des gestes de configuration et de conception, pas de semaine), puis `preparer-importer`, `annoter-evaluer`, `exporter-archiver` (les vrais gestes, dans le bon ordre).
- Une série numérotée de 1 à 8 : `saisie-presences`, `evaluer-productions`, `gerer-jetons`, `irrecevables`, `verification-hebdo`, `snapshots`, `collaboration`, `rai-absences`. Les captures (6) sont automatiques et la collaboration (7) n'est pas hebdomadaire.
- Puis `tirage-sort`, `modelisation`, `jetons-reprise`, `temps-estimes`, non numérotés.

Doublons constatés : `evaluer-productions` est contenu dans `annoter-evaluer` (même écran, même chemin) ; `gerer-jetons` et `jetons-reprise` portent tous deux sur la Liste des évaluations ; `flux-travail`, `temps-estimes` et `verification-hebdo` redisent les mêmes durées et seuils.

Ce que je recommande, sur le modèle des cartes de l'accueil :
1. Saisir les présences (`saisie-presences`)
2. Importer les copies (`preparer-importer`)
3. Annoter et évaluer (`annoter-evaluer`, avec la phrase sur C et P de `evaluer-productions`)
4. Jetons et reprises (`gerer-jetons` + `jetons-reprise`)
5. Copies non recevables ou non remises (`irrecevables`)
6. Exporter (`exporter-archiver`)
7. Vérifier le groupe (`verification-hebdo`)

Puis, sous un intertitre « Au besoin » : tirage au sort, modélisation, collaboration, interventions RàI. `etudiants` rejoint `groupe` et `lecons` passe en Configuration. `flux-travail` devient le sommaire de ces sept gestes et absorbe `temps-estimes`. Motif : l'ordre de l'Aide suit alors celui que l'application montre déjà à l'accueil, et chaque geste n'a qu'une entrée. Les numéros 3 à 8 actuels sont hors de mon lot : leurs propres constats relèvent du lot suivant.

## Trouvé en chemin, hors lot

- `grille-depistage` (index.html:11126, 11145) : mêmes erreurs que `validation-grille`, « ➕ Créer une nouvelle grille » et « Enregistrer les réglages ».
- Popup `evaluations-annoter` (accompagnement-contenu-popup.js:509, 513) : conseille de nommer les pages « …8a », « …8b » pour les assembler, ce que l'Aide (#878) et le code contredisent. Les mêmes lignes contiennent un nom de famille en exemple : nom de personne à vérifier.
- `guidage-demo.js:17` : l'encart de démo nomme les indicateurs « ACPE (… Engagement) » ; l'indice E est retiré (comparaison du 15 oct., point 3).
- Le pseudonyme d'anonymisation affiche « Élève N » (modes.js:331, 368) alors que les textes affichés disent « étudiant·e ». C'est le code, pas l'Aide.

---

## Bilan du lot

| Verdict | Entrées |
|---|---|
| Couper | 2 (`parcours`, `validation-grille`) |
| Fusionner | 3 (`modes-formation` avec `modes`, `etudiants` avec `groupe`, `evaluer-productions` avec `annoter-evaluer`) |
| Corriger, avec ou sans resserrement | 6 (`demo`, `flux-travail`, `lecons`, `preparer-importer`, `annoter-evaluer`, `saisie-presences`) |
| Resserrer seulement | 1 (`exporter-archiver`) |
| Garder tel quel | 0 |

**Mots** : 2 930 aujourd'hui ; environ 1 150 visés (dont ~110 pour l'entrée fusionnée `etudiants` + `groupe`, ~40 de plus que `groupe` seul).

**Les trois constats qui comptent le plus**
1. **Des gestes décrits n'existent pas à l'écran.** Le bouton « Enregistrer les réglages », retiré le 28 sept. ; la zone « Modifier un document » ; les modes « Léa / Libre » (à l'écran, « LEA / Autre ») ; le badge « En cours » ; les outils Crayon, Symboles « ! → » et Autocollants ; l'assiduité « alternative », retirée ; une saisie en heures que l'écran ramène aux périodes de la séance. Depuis le 15 octobre s'y ajoute la case à cocher des codes, que les critères algorithmiques neufs n'ont plus.
2. **Formation et démonstration repose sur des vestiges.** `parcours` décrit les modules et la durée de Primo, et `validation-grille` recopie `grille-depistage` avec deux gestes disparus : 664 mots qui peuvent partir. Les entrées sur les modes appellent la démo un « mode » et placent deux fois le bouton au mauvais endroit. La démo d'octobre (provisoire, « Retirer les copies ») n'y figure pas.
3. **Utilisation hebdomadaire a deux séries et des doublons.** `evaluer-productions` est contenu dans `annoter-evaluer` ; durées et seuils sont redits dans trois entrées ; `etudiants` et `lecons` ne sont pas des gestes de semaine. L'ordre des cartes de l'accueil donne un découpage en sept gestes, chacun dans une seule entrée.
