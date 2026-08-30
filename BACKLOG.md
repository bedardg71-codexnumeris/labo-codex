# BACKLOG - Monitorage Pedagogique

> **Pour Claude** : Ce fichier liste les **items ouverts** uniquement. L'historique complet des items livrés (313 items, fév-mai 2026) vit dans `BACKLOG-ARCHIVE.md`.
>
> **Dernière bascule** : 19 juin 2026 (clôture session 1.20.0) — 14 items [x] déplacés vers BACKLOG-ARCHIVE.md (#341, #321, #343, #284, #314, #315, #316, #302, #325, #338, #298, #335, #296, #337). Bascule précédente : 10 juin 2026 (passe de triage Cowork) — 16 items, dont #303 et #295 (absorbé par #334).
> **État courant (21 août 2026, 4e cycle — GRILLE IMPRIMABLE DES PRÉSENCES, 1.90.0)** : **#485 LIVRÉ** — grille « élèves × séances » en PDF lettre paysage (jsPDF/autotable), à double usage : rapport de saisie (✓ présence complète · ✗ absence · chiffre = périodes partielles) ET formulaire papier (cases vides = séances à saisir, remplies au crayon puis reportées dans l'écran de saisie). Modelée sur la feuille réelle de Grégoire (H2026, codes `1a…15b`) : en-têtes code de séance + date jj/mm imprimés (plus de dates à recopier à la main), colonnes optionnelles cochables et mémorisées (DA, sous-groupe, programme, nom du programme, SA — préférence `rapportPresencesOptions` via l'API preferences.js), une feuille par groupe avec en-tête cours · groupe · trimestre, portée « groupe actif » ou « tous mes groupes-cours » (séances des groupes désignés lues par la porte STRICTE `obtenirSeancesCompletesDuGroupe` #416 ; groupe sans séances/étudiants = feuille sautée et DITE, jamais générée fausse). Nouveau module lecture seule `js/presences-rapport.js` (fonction pure `construireModeleRapportPresences`, 9 cas Vitest + break-test ROUGE), panneau accordéon dans Saisie des présences, helpers `infosCours`/`nomTrimestre` exposés sur `ExportPDF`. ✓/✗ tracés au trait (les polices jsPDF n'ont pas U+2713). `IMG_3171.jpg` (photo de la feuille réelle poussée sur `main` pour transfert) **retirée du dépôt** — subsiste dans l'historique git ; effacement d'historique = décision séparée. Vitest **2797/2797** (281 fichiers). Branche `claude/student-attendance-report-4jjnx7` (fusionnée ff dans `main`, permission explicite). **PORTE TERRAIN RELEVÉE LE JOUR MÊME : 14/15** — l'échec (2.14, impression : dates d'en-tête tronquées « 21… » + police trop grande) **corrigé en 1.91.0** (largeur min. de colonne garantissant « jj/mm », polices réduites selon verdict 3.1, date d'en-tête en français). Même 1.91.0, sur demandes de Grégoire au retour du relevé : **accordéon du bas RETIRÉ → bouton « Grille imprimable » dans l'en-tête d'Enregistrement + modale** (visibilité) et **notation des cases en 4 choix radio** (crochets ✓/✗ · X absences seulement · périodes de présence 2/1/0 · périodes d'absence — légende assortie, préférence mémorisée). Fumée Chromium verte (modale, radios, défauts, zéro erreur). ⏳ Reprise due : bouton/modale, 4 notations, impression réelle ; ⚠ « heures » demandées, PÉRIODES livrées (l'unité de la saisie et de sa feuille) — à confirmer. Dernier ID : **#485**.
> **État courant (19 août 2026 — 1.87.7, BRUME ARDOISE CLOSE + REPASSAGE SUIVI-BUGS)** : mode anonymisation « brume ardoise » (1.87.6→1.87.7) **clos terrain compris** — porte 8/8 sur les deux appareils, extension revérifiée Safari + iPad le 19 août, jour de la présentation aux collègues. #456 (6 rouges Playwright) clos : toutes dérives de test/harnais, zéro bug d'app, **baseline Playwright à 0** (garde-fou de push redevenu strict). Vitest **2738/2738** (273 fichiers, depuis `tests/`). `main` = branche de session, arbre propre, aucune dette de fusion (`RELAIS.md` à jour). **Repassage de `Retours des testeurs/SUIVI-BUGS.md` (19 août)** : 8 entrées des 8-10 août déjà corrigées mais jamais basculées → déplacées vers « Corrigés » ; restent OUVERTS **#158** (re-vérification terrain sur build à jour), **#121** (confirmation visuelle due) et **#114** (décision config Cloudflare). ⏳ **Gestes NAVIGATEUR toujours dus côté Grégoire** : réparation A25 (`await reparer453({ executer: true })` après backup, Safari) · réassignation H26 à la main (10 artefacts, clés `cartouches_{ancienId}`) · `reassignation-454-grilles-h26.js` · **#450** renommer les deux échelles « IDME et niv 0 » d'a2025 · porte terrain types-familles du 16 août (14 portes, 41 vérifications, **5 décisions en attente**) · purge #442 côté Safari · sur claude.ai : supprimer le skill compte `design-interface`. ⚠️ **#427 (refermer l'accès public) : échéance septembre 2026, qui approche.** **REPRISE DU FIL DES DÉCISIONS (19 août, après-midi)** : **#455 TRANCHÉ ET LIVRÉ 1.87.8** (le cours est GLOBAL — identité = code seul, `supprimerTrimestre` ne touche plus le magasin `cours`, garde anti-seconde-fiche, sentinelle 7 cas + #361 réalignée) · **#441 CLOS** (chantier 3 SOLO archivé dans le plan) · **#365 CLOS** (bilan réflexif déjà namespacé par trimestre, re-vérifié au code). 📐 Encore ouvertes : sélecteur de rétroaction du nœud Évaluation (#424 — l'entrée porte à la fois « D2b résolue option 2 » et « non tranché », à confirmer), apparition du formulaire Enseignant·e (#306, « état vide masqué »), #449 (décision prise, chantier à coder), #324/#279/#275. Dernier ID : **#457** (⚠ consommé le 18 août par la trace inspireDe — les lignes du 16-17 août qui disent « #456 » sont antérieures ; celle du repassage SUIVI-BUGS du matin le répétait à tort, corrigée ici).
> **État courant (17 août 2026, CLÔTURE — CHANTIER SKILLS FUSIONNÉ, 1.87.2)** : les 13 références de `Skills pour Claude Code/` sont devenues de vrais skills (`.claude/skills/`), + 2 skills extraits de `CLAUDE.md` (394 → 190 lignes). **Contexte projet au repos : 90 740 → ~6 570 tokens.** 4 tests de déclenchement verts, fusionné (`adb9d744` + `1307c06f`). Les 5 worktrees ont reçu la nouvelle structure. ⚠⚠ **24 commits y dormaient sans sauvegarde hors du Mac — branches poussées depuis.** ⏳ **114 lignes restent non commitées** (wonderful : Brique C ; zen : `workers:1`, ce dernier repris sur `main`, indexé). Vitest **2701/2701** — **lancer depuis `tests/`**, pas de la racine (217 rouges : il balaie les worktrees). ⏳ Reste : subagent de début de session, retrait des 5 worktrees (375 Mo), `git gc --prune=now`. Détail complet : SESSION.md, bloc « 17 AOÛT (SUITE, COWORK) ».
> **État courant (16 août 2026, CLÔTURE — 1.86.0, TYPES ET FAMILLES)** : journée ouverte par un retour terrain **clos à 33/33, zéro échec** sur le cycle 1.85 — les deux rangées iPad les plus risquées (poignée ⠿ au doigt, TSV dans Numbers) passent. Puis ses **quatre demandes d'interface**, livrées en un seul chantier parce qu'elles généralisent deux décisions qu'il avait déjà prises pour l'enseignement explicite : **le menu de type s'étend à TOUS les blocs** (borné à la FAMILLE, la borne dans la porte d'écriture et non dans le `<select>`) · **Séquence et Leçon n'ont PAS de menu** (décision : « elles ne sont pas intervertibles ») · **visée formative/certificative des évaluations** · **une couleur par famille** (`--planif-couleur-prerequis` retiré) · **poignée ⠿ premier élément de toute en-tête**. Plus son **verdict 3.4** : un verbe de lien devenu inexact est DIT, jamais réécrit. ⚠⚠ **LA VISÉE EST UN MODIFICATEUR, PAS DEUX TYPES** — mesuré avant d'écrire : `evaluation` est le seul type qui porte `productionId`, et deux types neufs auraient tué EN SILENCE la moisson `main.js`, les sections d'export et `evaluerObjectif` (78 sites). ⚠ **Et mon premier jet du modificateur écrivait « Évaluation certificative » dans son PLAN DE COURS** pour des blocs jamais qualifiés — c'est le **golden master des exports** qui l'a attrapé, en refusant de rester vert ; corrigé par trois états en mémoire pour deux entrées au menu, et **le golden repasse au vert sans être refigé**. ⚠ **La cible tactile de la poignée a demandé DEUX mesures** (44×54 annoncé → 42×43 mesuré → 43,53 après une première correction → 44,53×45,00). Vitest **2673/2673** (265 fichiers), **8 break-tests, 8 ROUGE**, éprouvé au navigateur. ⏳ **PORTE TERRAIN NEUVE NON TRAITÉE** : `plans de travail/PORTES-TERRAIN-2026-08-16-types-familles.md` — 14 portes, 41 vérifications, 2 mesures, **5 décisions en attente de verdict** (dont deux teintes). Dernier ID : **#456**.
> **État courant (11 août 2026, CLÔTURE — FUSIONNÉ ET DÉPLOYÉ, 1.75.0)** : journée pilotée par le travail réel de Grégoire dans la Carte d'alignement (préparation A26), chaque friction livrée le jour même. **1.72.0** ⌘D sur toute la multi-sélection · **1.73.0** « Tout voir » + loupe de navigation (sa carte est illisible à 25 %, qui était le plancher du zoom — abaissé à 10 %) · **1.74.0** guides magnétiques + six commandes d'alignement · **1.74.1** le clic atterrit, le pointeur devient la zone examinée · **1.75.0** **#448 CLOS** : une collision d'id à l'import n'est plus un accident à renommer (`fusionnerParIdentite`, 9 sites, 5 collections ; les deux pré-remaps grille/échelle conditionnés — c'est ce qui ferme la forme « magasin fantôme »). **#451 CLOS** (a2026 porté dans Safari, vérifié sur pièces). **#450** et **#449** documentés sur mesures réelles. Purge Chrome faite : 83 → 78 éléments. ⏳ **Reste : Safari, les 6 magasins orphelins, et #368 à vérifier EN PREMIER** (la carte 601-101 est-elle vraiment en A26 ?). Vitest **2226/2226** (248 fichiers), **26 break-tests rejoués sur l'arbre final, 25 rouges + 1 vert corrigé**. Dernier ID : **#451**. Détail : SESSION.md (bloc 11 août).
> **État courant (10 août 2026, CLÔTURE — #442 + #447 + #445 + #443 + #353 livrés, 1.71.1)** : reprise après la clôture du jour, sur la file de priorité 0 des 81 portes. **#442 livré** — le mécanisme des doublons du magasin global `cours` est trouvé et bouché (la fusion `listeCours`→`cours` dédoublonnait par tuple naturel et laissait passer les fiches au **même id** mais au tuple dégradé : un exemplaire de plus **à chaque import**), script de nettoyage `reparation-442-doublons.js` livré (dry-run, garde le 1er exemplaire, ne touche jamais les homonymes à ids différents), `dedoublonner-biblios.js` retiré (zéro-dette : il visait les globales nues vidées au boot depuis #358). Vitest **2128/2128** (241 fichiers), **12 break-tests, 12 ROUGE**. ⏳ **Reste à Grégoire** : coller le script en console (Chrome ET Safari) et coller le rapport avant d'exécuter. **#447 traité — et la prémisse de l'item était FAUSSE** : l'aperçu recalcule bel et bien les indices à chaque rendu (prouvé au navigateur en faussant le stockage), donc le geste « ouvrir la Liste PUIS l'aperçu » est **caduc**. Un vrai trou a été trouvé à côté et refermé : le cache de lecture #397 n'était invalidé que par `sauvegarderDonneesSelonMode`, pas par les écritures directes des propriétaires SSOT — défaut **latent** (0 lecture périmée servie, mesuré), fenêtre réelle (profondeur de pipeline 2 sur `indicesCP`). Invalidation **ciblée** sur la clé écrite : le rabot coûtait **+329 ms** à 75 étudiants, la version ciblée **+22 ms sur 618**. **#445 livré** — le tracé de lien vers une ligne d'objectif coche la case (même écriture `definirObjectifsServis`, refus DITS au lieu du silence), et les pastilles `!`/`⚠`/`✓` ont enfin une légende, dans l'Inspecteur de la leçon ET la page 5 du guide, depuis une source unique. Vérifié au navigateur ; ⚠ la séquence pointer complète ne l'est pas (canevas invisible en headless) → **porte terrain due sur iPad et Mac**. **#443 livré** (décision Grégoire : garder l'étape en écran d'information) — carte retirée, carte unique pré-cochée, **trois** étapes purgées au lieu d'une (zéro-dette élargi au réel), legacy normalisée en lecture seule. Quatre sentinelles voisines **mises en accord avec la décision** — dont le golden `STD_obj`, **retiré avec la fonctionnalité** plutôt que réaligné. **34 break-tests, 34 ROUGE** sur la session — dont **un resté vert au premier jet, faute du test et non du code**. Vitest **2154/2154** (243 fichiers).
>
**#353 : L'UNITÉ DU QUOTA ÉTAIT FAUSSE.** Mesuré au navigateur : le navigateur facture localStorage en **caractères UTF-16**, pas en octets (4,94 M caractères tenus aussi bien avec 'x' qu'avec 'é'). `statsStockage` doublait la mesure → **les « 200 % » sont 100 %**, et les « 173 % » du 9 août étaient 86 %. Une TROISIÈME unité cohabitait (`SEUIL_IDB_FIRST` comparé à des octets UTF-8) : un seuil et un budget qui ne parlaient pas de la même chose, donc aucun arbitrage possible sur chiffres. Une seule monnaie désormais, validée à **99,4 % au refus exact d'écriture**. ⮕ **L'état réel de Grégoire : localStorage PLEIN à 100 %** — rien en danger (durabilité A/B/C), mais toute écriture bascule en memoryCache+IDB. `projectionSeuils` livrée pour trancher l'option 2 sur des chiffres. Miroir `configPAN` purgé (hygiène : **~285 car./trimestre, gain négligeable — dit comme tel**). **46 break-tests, 46 ROUGE** sur la session — dont **trois restés verts au premier jet, faute du test**. Vitest **2158/2158** (243 fichiers).
>
> **Clôture du cycle** : fusion faite sur `main` (18 commits), **1.71.1**, Vitest **2169/2169** (244 fichiers).
> Ajouts de fin : le **bouton Supprimer d'un groupe-cours** ne s'affichait jamais à l'arrivée sur la section
> (`.u-hide` en `!important` contre un `style.display` impuissant — 1.71.1) · **#448** et **#449** versés ·
> **`SKILL_portes_terrain.md`** adopté comme règle de projet à la demande de Grégoire.
> ⏳ **LES VÉRIFICATIONS SE FONT DEMAIN** — `plans de travail/PORTES-TERRAIN-2026-08-10.md`. Rien n'est
> validé au terrain à cette heure ; ne pas ouvrir de chantier de fond avant ses résultats.
>
> ⏳ **DÛ PAR GRÉGOIRE** : `reparer442()` en exécution (dry-run passé) · **`db.statsStockage()` en console → me rapporter `projectionSeuils`** (entrée manquante de la décision option 2) · porte terrain #445 (iPad + Mac).
>
> **État précédent (10 août 2026, FIN — LES 81 PORTES SONT CLOSES, 1.65.2 → 1.67.1)** : journée entièrement pilotée par le terrain (règle `CLAUDE.md` : un retour testeur interrompt le plan). **Six retours traités, six livrés** — **#154** (productions H26 inaccessibles : sonde en lecture seule, réparation dry-run exécutée par Grégoire sur les données réelles, ET le filtre de cours qui avalait tout DIT désormais quand il écarte tout) · **#155** (les cinq pages de Conception rendaient VIDE — trois `</div>` structurels emportés par #424 le 8 août, régression datée au commit) · **#157** (la largeur du conteneur se pose avant la mesure de l'en-tête) · **#158** (les objectifs sans id complétés à la migration — sans quoi les liens #403 glissent) · **#444** (la carte utilisable au doigt : boutons en barre, double-tap, accordéons, corbeille flottante) · **#446** (le changement de trimestre cessait de mentir — dont une **bascule silencieuse du groupe actif à chaque aller-retour**, qui durait depuis des mois). **Campagne des 81 portes CLOSE : 81/81**, les 4 échecs versés ou corrigés — ⚠ dont **deux faux rouges dus au build en retard de Grégoire** (`file://` sur son clone : `git pull` passe en case 1 des prochaines checklists). Rituel de clôture : Vitest **2111/2111** (239 fichiers), **15 break-tests rejoués sur l'arbre final, 15 ROUGE**, arbre propre, 0 divergence. ⮕ **Versés et ouverts** : **#447** (fraîcheur de l'aperçu — il affiche des chiffres périmés), **#445** (affordance du tracé de lien + légende `!`/`⚠`/`✓`), 📐**#443** (décision UX). Détail : SESSION.md (bloc « 10 AOÛT, FIN ») et §3.
> **Prochain enchaînement acté (Grégoire, 11 juin)** : **#336 Lot D** (purge de l'espace précédent à l'ouverture, preview console d'abord) → **#328 L2-b2 puis L2-c** (fin du dégonflage miroir `modalitesEvaluation`) → **#332 constat 1** (enquête de code + protocole de repro avec Grégoire). #337 = action UI GitHub (Grégoire, ~2 min).
> **Dernier ID utilisé** : **#359** (🔴 FIX désarchivage — `desarchiverTrimestre` (`trimestres.js:664`) ne purge PAS les copies namespacées `<id>_grillesTemplates` etc. : après désarchivage `cle()` ne les relit plus → orphelins morts ; bug latent **confirmé au code 26 juin**, cf. `plans de travail/CADRAGE-briques-C-D-namespacing.md` §D-D5 ; à traiter comme un fix avec break-test). #358 (**Brique D namespacing** — migration des collections globales de modèles vers les clés namespacées par trimestre ; **risque maximal**, sur copie+backup ; OUVRIR par la **décision-pivot D-D1** : grilles/échelles globales-partagées + copie-locale [patron `bibliothequePratiques`] OU pleinement namespacées ; inventaire élargi vérifié = `bibliothequePratiques`/`objectifsTemplates`/`bibliothequeProductions`/`echellesPerformance` ; **ÉTENDRE L2 + ratchet AVANT migration** [L2 ne scanne que les grilles] ; cadrage prêt ; **EN COURS 26 juin PM** (branche `claude/brique-D-instrumentation-L2-ratchet`, non poussée) : instrumentation LIVRÉE [L2 étendu aux 4 modèles grilles/échelles/pratiques/cartouches + rendu auto-vérifiable ; cliquet global `pratiquesConfigurables` ; constat : `modalitesEvaluation` DÉJÀ ratcheté par L3] + **dry-run d'observation** read-only [`scripts/dry-run-migration-modeles.mjs`] ; RESTE = trancher la **mécanique D-D1** [§3.2 « déplacement de liste » vs « hybride bibliothequePratiques »] + critère §4-pt7, puis migration réelle avec L0). #357 (**Brique C namespacing** — import inter-trimestre = COPIE d'un modèle vers le trimestre actif [id neuf + `inspireDe`, source intouchée] ; patron `partage-section.js` à paramétrer par source + helper `cleSource()` ; cadrage prêt ; dépend de D-D1). #356 (anonymiser la sortie du golden master `valider-golden-master-trimestre.mjs` — affiche un nom d'élève ; Phase 0, 26 juin 2026). #355 (navigation élève désactivée en consultation — `desactiverFormulaireEvaluation` désactive `selectEtudiantEval` ; friction UX). #354 (warning « Pas de grille de référence » ×30 — `obtenirGrilleReferenceDepistage` rend vide, dépistage SOLO, `profil-etudiant-calculs.js:263`, en consultation A25). #353 (🟢 saturation localStorage — **reclassé dette/conception le 28 juin** : le risque de PERTE est FERMÉ par la durabilité Option A/B/C [PR #70+#71 mergées, main 1.24.2] — la saturation bascule en memoryCache+IDB par un chemin désormais durable, plus de revert silencieux ; reste = réduire la fréquence du chemin IDB-seul + observabilité, pas une perte. **REPORTÉ à une session dédiée** (décision Grégoire 28 juin) ; 1er pas = Option 1 du rapport [observabilité : alerter à ~80 % du budget, **mesurer avant de trancher** entre options 2/3/4] ; rapport complet `plans de travail/RAPPORT-353-saturation-localstorage.md` ; hygiène zéro-dette adjacente [code mort `libereCacheLocalStorage`, `*_backup_v1` jamais purgés, `tamponsImages` base64] = à grouper dans la même session). #352 (🔴 écrasement `a2025_productions` ← `h2026_productions` — contamination namespacing, 305 évals orphelines au hard refresh ; réparé en données 26 juin via script console, tient après recharge ; cause probable quota saturé + cohabitation ; renforce Phase 1). Avant : **#351** (renommer les 20 élèves fictifs du pack démo en figures historiques/culturelles — préparé en Cowork 26 juin 2026, appariement positionnel, consigne `CONSIGNE-renommage-eleves-demo.md` ; section Données démo, 🟢). Avant : **#350** (recalcul algo à l'ouverture d'une éval A25 : le champ « nombre d'erreurs » du critère français algo n'est pas restauré quand le mode catégories n'est pas activé → note recalculée gonflée ; révélé 25 juin 2026 par le pilote A25, famille #347/#349 ; contourné A25 via flag + résolu par reconstruction native ; à vérifier H26). Avant : **#349** (flicker au chargement d'une éval en consultation archivée — flash éditable/H26 → lecture seule/A25 ; créé 25 juin 2026, cosmétique ; composante 2 résorbée par le pilote A25). Avant : **#348** (crash consultation éval A25 quand la grille manque des templates — DOM `listeCriteresGrille1` null ; créé 25 juin 2026, **RÉSOLU** le 25). Avant : **#347** (rétroaction d'artefact recalculée « live » avec les artefacts ultérieurs ≠ version historique reçue par l'élève ; créé 25 juin 2026). Avant : **#346** (migration d'id de cours incomplète — les productions gardent l'ancien `coursId` ; créé 24 juin 2026, réparé en données le même jour). Avant : **#343** (famille DEN — corriger le malentendu « DEN = sans critères/grille/échelle » ; correction de fond distincte du comparateur, préalable #326 ; créé 16 juin 2026, doc `plans de travail/RELAIS-326-refonte-banc-decision.md §4.7`). Avant : **#342** (erreur d'attribution CC — `auteur_original` figé à un mauvais enseignant : la pratique de littérature de Grégoire s'affiche « par Bruno V. » ; cause `cc-license.js:44/154`, données live ; extrait de #341 le 15 juin). Avant : **#341 LIVRÉ 13 juin** (« Appliquer une pratique » lisait la clé globale au lieu de `h2026_pratiquesConfigurables` → aucune config retrouvée, `pratiques-bibliotheque.js:624` ; fix `cle()` + sentinelle 4 cas, commit `5d5dfe5`). Avant : **#340** (⚠ changement de trimestre écrase les productions du trimestre cible avec celles du trimestre quitté — découvert 12 juin pendant le terrain L2-b2, **RÉPARÉ 12 juin ~12h40**, section Bugs UX ; ré-éclaire l'incident du 11 juin). Avant : **#339** (config portfolio STD explicite — liens productions↔pratique par identité + un seul moteur hybride ; découverte Grégoire 12 juin via reconstitution A25, diagnostic `Rapports/DIAGNOSTIC-A25-reconstitution-pratique-hybride-2026-06-12.md`, section Conception pédagogique ; séquencé APRÈS #328, coordonné #319). Avant : **#338** (retirer le vieil éditeur de pratique mort — découverte L2-b2, section Conception pédagogique ; créé 11 juin 2026). Avant : **#337** (activer la protection de branche `main` côté GitHub — action UI Grégoire, voir section Sécurité ; créé 11 juin 2026 sur la branche skills sous le n° #335, renuméroté à l'intégration car #335-#336 attribués entre-temps sur main). Avant : **#336** (ouvrir un codex ne purge pas l'espace de travail précédent — doublement des données Safari, constat iPad 11 juin ; purge des blobs/clés orphelins à cadrer avec #334 C). Avant : **#335 LIVRÉ 11 juin (1.16.0)** (garde-fous import codex inter-appareils — détection de modèle antérieur + trimestre actif non basculé par heuristique de date ; créé 11 juin 2026 après l'incident de restauration : le codex iPad pré-chantier D avait écrasé le modèle consolidé du Mac). Avant : **#334** (chantier import codex iPad — saturation stockage : pré-vol quota, import journalisé, snapshot 3-way haché ; **absorbe #295** ; diagnostic `Rapports/analyse-saturation-import-codex-ipad-2026-06-10.md`, plan en 4 sessions `Rapports/plan-chantier-import-codex-ipad-2026-06-10.md` ; créé 10 juin 2026 via Cowork). Avant : **#333** (export des résultats finaux CSV+PDF — cadrage Cowork complet 10 juin, `plans de travail/PLAN-export-resultats-finaux.md` ; module dédié, PAS import-export.js). Avant : **#332** (chaîne assemblage horaire↔GC : no-op UI + copie pointeur prioritaire sur SSOT dans `obtenirSeancesHoraire` — même philosophie que #328 L2 ; créé 10 juin 2026). Avant : **#331 CLOS 10 juin** (104 fiches orphelines purgées, console one-shot). Avant : **#330 LIVRÉ 10 juin (1.6.4)** (bug assiduité bi-groupes — dénominateur contaminé par les séances de l'autre groupe depuis la consolidation chantier D ; fix code + horaire 00008 réassemblé, sentinelle 5 cas). Avant : **#329** (Voûte Phase 1 — partage de ressources par fichiers signés ; **lot P1 LIVRÉ 10 juin, release 1.7.0, terrain 14/14** — reste revue du format puis lots F/T/P2/P3 ; plan `plans de travail/PLAN-VOUTE-PHASES-1-8.md`). Avant : **#328** (SSOT `modalitesEvaluation` Tier 6.5 — L0, L1, L3 et L2-0/a/b1 LIVRÉS au 11 juin (1.15.1), restent **L2-b2** (affichage, ~46 sites) et **L2-c** (jetons) ; plan `plans de travail/PLAN-328-L2-degonfler-miroir.md`, audit `Rapports/AUDIT-SSOT-MODALITES-EVALUATION-2026-06-10.md`). Avant : **#327 LIVRÉ 1.6.0** (classement par dossiers transversal aux biblios, cadré 9 juin — cartouches = exception actée). Avant : #326 (axe D — Exploration des pratiques dans le Labo : variantes, parenté, diff ; créé 8 juin 2026 — conception close, **SPEC validée** `plans de travail/SPEC_D_exploration_pratiques.md`). Avant : #325 (carte « Sources et remerciements » dans À propos, créé 7 juin 2026 — demande Grégoire ; + **mise à jour de #302** : contenu des guides `som`/`pan` rédigé et vérifié, prêt à intégrer). Avant : #324 (reprises configurées non consommées — #319 Lot 3). #323 (icônes boutons foncés). #322 (aspect visuel de la carte du Comparateur — RETIRÉ 8 juin 2026 : le double encadrement n'est pas un problème, d'autres pages l'ont). Avant : #321 (option transversale « note différée » / couche 1 PRÉN, créé 6 juin 2026 — conception du modèle DEN). Avant : #320 (répertoires de classement dans les bibliothèques, créé 5 juin 2026 — idée Grégoire émergée de la réflexion Comparateur). Avant : **#319** (refonte ciblée de l'assistant de pratique post-audit, créé 5 juin 2026 — **plan prêt**, décisions Grégoire actées, `plans de travail/PLAN_refonte_assistant_pratique_post-audit.md`). Avant : #318 (Dénotation — lots a/b/c absorbés par #319 Lot 5 ; **parcours créable LIVRÉ 22 juin 2026 (1.21.0)** : carte DEN de 1er rang sur l'écran de classification + gabarit « Modèle de base » + édition inline #343-T1 ; **restent** modes « différée »/« réduite » et le câblage DEN dans `calculerDetailsNoteFinale` — DEN couche 2+). **#317 LIVRÉ 5 juin (1.1.3)** (lot correctifs wizard — bugs SUIVI-BUGS #131-#135). Avant : #307 (simuler/comparer des pratiques de notation sur les mêmes données — piste émergée 31 mai des tests pratiques, voir section dédiée). #306 (uniformisation page d'assemblage groupe-cours, post-AQPC, créé 30 mai 2026 — plan prêt dans `plans de travail/`). #305 (a11y modale d'aide sans nom accessible, créé 29 mai 2026 soir). #304 = nettoyage terminologique heures-contact (libellés UI faits par le mini-guide). #303 = refactor pratiques SSOT — **Session A livrée (99.80/99.86)** + **Session B (représentations) livrée (4 juin, branche `claude/eager-wozniak-KpaAC`)** ; reste **Session C** (calcul par famille, sur backup). #302 = module guides pédagogiques unifié + guides PAN. #301 = résolution de pratique en consultation (chantier D). #300 = bug `getSync("trimestres")` désync. #299 = balayage références d'onglets périmées (28 mai PM).
> **Session 29 mai (soir)** : chantier E (refonte cours↔période close), mini-guide balises (#304 libellés), **Session A-1** (#303). Beta 99.77 → **99.80**.
> **Présentation AQPC** : tenue le 3 juin 2026 — cap courant = stabilité pour les expérimentateurs post-AQPC.
> **✅ #353 — OPTION 2 TRANCHÉE SUR CHIFFRES (10 août, décision Grégoire) : `SEUIL_IDB_FIRST` 200 Ki → 25 Ki caractères.**
> Relevé terrain des DEUX navigateurs, unité corrigée — Chrome **100 %** (475 clés) · Safari **88,3 %** (462 clés) :
>
> | seuil | Chrome reste | Safari reste | clés déplacées |
> |---|---|---|---|
> | 200 Ki *(ancien)* | **100 %** | 88 % | **0 / 0** |
> | 100 Ki | 88 % | 84 % | 4 / 2 |
> | 50 Ki | 70 % | 68 % | 17 / 13 |
> | **25 Ki** *(retenu)* | **44 %** | **44 %** | 60 / 55 |
> | 10 Ki | 9 % | 8 % | 165 / 161 |
>
> ▣ **La première ligne explique tout** : à 200 Ki, **zéro clé ne basculait** — la plus grosse clé de Grégoire pèse
> 184 K car. Le mécanisme IDB-first existe depuis #334 D et **n'avait jamais pu se déclencher chez lui**. Un seuil
> au-dessus du plus gros objet n'est pas un seuil. ▣ Deux jeux de données distincts convergent sur 44 % : la masse
> est dans la **longue traîne** (475 clés / 5 119 K car.), ce qui écarte l'option 3 (liste blanche de grosses clés).
> ▣ **Vérifié au navigateur** : après rechargement, les clés > 25 Ki ont quitté localStorage, sont servies depuis
> memoryCache, et **restent lisibles par `getSync`** — seul le lieu change. La projection se réalise donc **au
> rechargement suivant, sans script de migration** (`syncToLocalStorageCache` réapplique le seuil à chaque boot).
> ⚠ Sans IndexedDB, le routage retombe sur localStorage (garde `idbDispo`, break-testé) : **aucune exposition neuve**.
>
> **⚠ #353 — ce qui RESTE après le 10 août** : l'unité est corrigée et le miroir `configPAN` purgé,
> mais **la saturation elle-même n'est pas traitée** — localStorage est plein à 100 %.
>
> ⚠⚠ **ET LE SEUIL À 25 Ki N'A PAS DONNÉ CE QUE LA PROJECTION ANNONÇAIT — MESURE DU 10 AOÛT AU SOIR.**
> Annoncé ~44 % ; **mesuré 100 %, 586 clés** sur 1.71.1. Le seuil MORD pourtant : `a2024_presences`
> (184 K car.), `a2024_evaluationsSauvegardees` (179 K) et `simulation_indicesCP` (72 K) ont quitté
> localStorage. **Ce que la projection ignore** : `syncToLocalStorageCache()` **réécrit au démarrage**
> dans localStorage tout ce qui passe SOUS le seuil — les grosses clés sortent, des clés qui vivaient en
> memoryCache seul entrent à leur place (**+111 clés pour le même total**). *L'éviction était modélisée,
> pas le remplissage.* ⮕ **`projectionSeuils` porte le même angle mort : ses chiffres sont un PLANCHER,
> pas une prévision** — le corriger (ou le dire dans sa sortie) est le **premier geste** de la reprise
> #353, avant de rouvrir les options 2/3/4.
>
> ▣ **Effet de bord à ne pas confondre avec une panne** : `diagnostic-353-cles-orphelines.js:102`
> n'énumère que `localStorage` — les clés parties en IDB lui sont **invisibles**. D'où a2024 à
> **85 K / 21 clés** (et non 448 K) et la famille `sansProducteur` à **0**. Le reliquat IDB se retire par
> `db.keys()` + `db.remove()`, **sans filet `annuler353()`**. *(Si le détecteur doit resservir, lui faire
> énumérer `db.keys()` ∪ `localStorage` plutôt que localStorage seul.)*
>
> Les options 2/3/4 du `RAPPORT-353` attendent toujours une décision. Restent aussi les candidats d'hygiène :
> `*_backup_v1` (outil `db.purgerBackupsV1()` livré, DRY-RUN par défaut — exécution = décision Grégoire)
> et `tamponsImages` base64 non namespacé.

> **Pour ajouter un item** : `- [ ] **#XX** Description courte` + sous-puces de contexte. Dernier ID utilisé : **#484** (21 août 2026, versement du triage des deux audits : #462-#484 — D4 + lots L1-L9 + items I1-I13 ; avant : #461, CO-01 livré 1.88.6 ; avant : #460, 20 août 2026, CT-01 de l'audit Cadre/Trimestre, livré 1.88.5 ; avant : #459, 20 août 2026, SUIVI-BUGS — ⇧ avalé en silence sur les conteneurs, trouvé par la porte types-familles ; avant : #458, porte #449 — TOUJOURS vérifier aussi l'« État courant » en tête ET grep `#45[0-9]` avant de prendre un numéro : le 19 août, deux points du fichier disaient « #456 » alors que #457 était consommé depuis la veille). *(⚠ #437 = « carte d'alignement » de la session parallèle du 9 août, fusionné sur `main` — pris pendant que cette branche vivait. Voir `RELAIS.md`.)*

---

## Légende

- 🟡 **Important pour expérimentateurs post-AQPC** (juin-été 2026, première vague d'utilisateurs externes)
- 🟢 **Backlog long terme** (utile mais sans urgence — peut attendre la rentrée d'automne)
- 📦 **Reporté / hors v1.0** (acté explicitement par Grégoire ou par calendrier projet)
- ⚠️ **Priorité haute actée** (à traiter dès que possible — décision Grégoire datée)
- 📐 **Décision UX en attente** (besoin d'un choix Grégoire avant de coder)

Voir le plan de travail détaillé dans `plans de travail/PLAN-TRAVAIL-26-MAI.md` pour la classification en ordre de prise et les estimations d'effort.

---

## A faire

### Chaîne d'importation des travaux — audit du 30 août 2026 (sessions S1 à S9)

> Rapport : `Rapports/AUDIT-chaine-importation-travaux-2026-08-30.md`.
> Plan et tableau d'état : `plans de travail/PLAN-chaine-importation-travaux-2026-08-30.md`.
> Les neuf identifiants ci-dessous sont **réservés d'un coup le 30 août 2026** (règle : inscrire le
> #NNN avant de l'employer dans un commit). Une session = un identifiant = une entrée cochée quand
> elle est livrée, testée et mergée.
> Trois décisions de cadrage tranchées par Grégoire le **30 août 2026**, toutes option A :
> **D1** deux remises datées différemment = deux documents · **D2** sans groupe-cours actif,
> l'import est refusé avec un message · **D3** « Renommer pour distinguer » est retiré.

- [x] **#607 — LIVRÉ le 30 août 2026 — S1 · Retirer un jeton de reprise laissait le fichier de reprise actif** (constat S5).
  `js/evaluation-jetons.js`. Après `retirerJetonReprise`, la résolution « plus récent » donnait le
  fichier de la reprise à l'originale : la ligne restaurée ouvrait le travail qu'on venait d'effacer.
  ➮ **Correctif** : `_detacherFichiersDeEvaluation(evaluationId, mode)` appelée AVANT
  `_persisterEvaluationsJetons` dans les trois branches — `corbeille` quand la reprise est annulée
  (le blob reste intact, récupérable 30 jours), `delier` quand c'est l'originale qui disparaît
  (`archiverOriginale: false` — l'élève a bien remis ce travail, on coupe seulement le lien mort).
  Les deux `confirm` et les deux notifications ANNONCENT désormais le nombre de fichiers touchés.
  ⚠ **Un second défaut trouvé en écrivant le correctif** : dans la branche #141, `remplaceeParId`
  était `delete`é AVANT d'être lu — l'appel rendait `undefined` et ne détachait rien. La sentinelle
  l'a attrapé ; sans elle le correctif serait passé pour bon sur deux branches sur trois.
  ➮ Sentinelle `tests/unit/sentinelle-jeton-retire-fichier-reprise.test.js`, 7 cas dont un témoin de
  mise en place (« sans retrait, le repli rend bien le fichier de la reprise ») ; **4 break-tests,
  4 ROUGE**. Vitest 407 fichiers / 4249 tests, code de sortie 0.
  ⏳ **Test manuel dû à Grégoire** (Mac et iPad) : appliquer puis retirer un jeton dans le
  formulaire ; la ligne de l'originale doit rouvrir le fichier ORIGINAL, et le fichier de reprise
  doit apparaître dans la Corbeille.
  ⮕ **Le même trou existe sur le chemin le plus fréquenté** — `supprimerEvaluation`
  (`js/liste-evaluations.js`) restaure l'originale sans toucher au fichier de la reprise. Inscrit en
  T6.6 du plan, traité avec [[#612]].
- [x] **#608 — LIVRÉ le 30 août 2026 — S2 · « Appliquer comme jeton » était offert alors que le maximum par production était atteint** (constat S6).
  `js/travaux-ui.js`. **Deux défauts qui se composaient en un mensonge d'écran.**
  · Le bouton de la modale de doublon ne lisait que le compte GLOBAL de jetons de l'élève
  (`verifierDisponibiliteJeton`), jamais `maxParProduction`. Le maximum est vérifié ailleurs — dans
  `appliquerJetonReprise`, qui rend `null` SANS UN MOT quand `silencieux` est posé. Résultat : bouton
  offert, fichier importé comme reprise, aucun jeton consommé, rien de dit.
  · Le balayage post-import comptait comme « jeton appliqué » un fichier simplement RATTACHÉ à une
  reprise déjà accordée. « 1 jeton(s) de reprise appliqué(s) » pour zéro jeton accordé — et la
  première reprise se retrouvait avec deux fichiers.
  ➮ **Correctif** : `_jetonRepriseOffrable(etudiantDA, productionId)` lit les DEUX bornes à l'endroit
  où le bouton se décide. La branche « jeton » de la modale DIT le refus au lieu de le taire.
  `appliquerJetonsReprisePostImport` rend `{ jetons, rattaches }` au lieu d'un nombre nu — les deux
  comptes ne sont jamais additionnés, et le rattachement a sa propre annonce, qui nomme l'élève.
  Le retour numérique nu est retiré, son seul appelant adapté.
  ➮ Sentinelle `tests/unit/sentinelle-608-jeton-maximum-par-production.test.js`, 9 cas ;
  **5 break-tests, 5 ROUGE** (borne par production retirée · borne globale retirée · rattachement
  recompté comme jeton · annonce du rattachement anonymisée · `<` devenu `<=`).
  Vitest 408 fichiers / 4258 tests + Playwright 210/210, code de sortie 0.
  ⏳ **Test manuel dû à Grégoire** : poser `maxParProduction = 1`, accorder une reprise, puis importer
  un troisième fichier pour la même production — le bouton « jeton » ne doit plus paraître, et le
  rattachement doit être annoncé comme tel.
- [x] **#609 — LIVRÉ le 30 août 2026 — S3 · L'assemblage automatique fusionnait des fichiers qui ne sont pas des pages d'un même document** (constats B1, M5). **Le BLOQUANT de l'audit.**
  `js/travaux-import.js`, `js/travaux-ui.js`. L'assemblage est FORCÉ (la case a été retirée) et
  regroupait toute paire d'images partageant une clé. **Deux clés étaient fautives.**
  · `_solo_<nomFichier>` — deux images sans DA de même nom formaient un « document ». Scénario mesuré :
  photos iPad, `IMG_0412.jpg` (élève A, associé à la main), puis un second lot d'un autre appareil qui
  contient aussi `IMG_0412.jpg` (élève B). À « Oui, importer », B est retiré de la file et sa photo
  devient la page 2 du PDF de A. **B reste « Non reçu », et rien ne le signale.**
  · `DA_nomProduction` sans la date — deux remises Léa distinctes d'un même élève (v1 lundi, v2
  mercredi) sortaient en un seul PDF de deux pages, jamais présenté comme doublon. [[#603]] avait rendu
  ce cas PLUS probable en retirant le suffixe de page sans discriminer par date.
  ➮ **Correctif (D1 = A)** : la clé LÉA porte l'horodatage de la remise — Léa horodate la REMISE, pas
  le fichier, donc la date sépare les remises sans jamais séparer les pages. La clé `_solo_` porte
  l'index dans la file, que personne ne partage, au lieu du nom de fichier.
  ➮ **M5** : `assemblerGroupesPipeline` splicait la file en mémoire sans la persister — les entrées
  fusionnées ressuscitaient au rechargement comme « à re-déposer ». `persisterFileDAttente` est
  exposée sur `window.travauxImport` et appelée après le splice.
  ⚠ **Effet voulu du correctif** : `detecterDoublonsStockage` traite deux fichiers de même
  `groupeDocumentId` comme non-doublons. Deux remises datées différemment ayant désormais des clés
  distinctes, elles sont SIGNALÉES comme doublons à l'import — c'est exactement ce que D1 demande.
  ⮕ **Zéro-dette adjacent (T3.2)** : `afficherImport` appelait `regrouperParDocument()` uniquement
  pour la passer à `genererEtape2Colonnes(queue, groupes)`, qui ne l'a jamais lue. Paramètre mort et
  appel inutile retirés.
  ➮ Sentinelle : `tests/unit/sentinelle-603-604-import-pages-et-remplacement.test.js` ÉTENDUE (pas de
  seconde sentinelle), 24 cas ; **4 break-tests, 4 ROUGE** (clé solo relit le nom · horodatage retiré ·
  `persisterFileDAttente` non exposée · horodatage aléatoire, qui séparerait aussi les pages).
  Vitest 408 fichiers / 4265 tests + Playwright 210/210, code de sortie 0.
  ⏳ **Test manuel dû à Grégoire** : un lot de photos iPad contenant deux homonymes ; les deux élèves
  doivent recevoir leur copie.
- [x] **#610 — LIVRÉ le 30 août 2026 (release groupée en attente) — S4 · File non persistée en cours de lot, rattachement des blobs par nom seul** (constats S1, S2).
  `js/travaux-import.js`, `js/travaux-ui.js`. **Deux défauts, deux pertes différentes.**
  · **S1 — le doublon que personne ne voit.** La détection exige `etudiantDA && productionId`. Or la
  confirmation autorise explicitement l'import « sans production associée » et le bandeau « sans DA »
  n'est pas bloquant. 40 photos sans DA, l'iPad en veille au 25ᵉ fichier : `fichier.statut = 'importe'`
  n'était persisté qu'APRÈS le dernier, donc la file en affichait 40 « à re-déposer » alors que 25
  étaient en base. L'enseignant re-dépose, confirme : **25 fichiers en double, aucun avertissement**,
  et l'écran annonce « 40 fichier(s) importé(s) ».
  · **S2 — le blob qui change d'élève.** `reattacherBlobs` appariait par NOM SEUL. Deux entrées
  `devoir.pdf` associées à la main à A et à B, rechargement, re-dépôt des deux en une sélection : le
  premier `File` rendu par le navigateur prend la première entrée libre, quel que soit son contenu.
  **Le travail de B se retrouvait sous le DA de A, sans trace.**
  ➮ **Correctif** : `persisterFileDAttente()` à chaque itération de `importerTous` (celui de fin de
  lot, #558 B1, RESTE — les deux couvrent des pannes différentes) · détection par
  `(nomFichierLea, tailleFichier)` pour les fichiers non identifiés, avec `critere: 'nom-taille'` que
  la modale EXPLIQUE · `tailleOriginale` figée au dépôt, persistée, restaurée, et comparée au
  rattachement · `reattacherBlobs` rend `{ rattaches, ignores }` (retour numérique nu retiré) et
  `redeposerFichiers` DIT les fichiers non reconnus, au lieu de jeter le compte qu'il calculait déjà.
  ⚠ **Le piège du correctif** : jamais `tailleFichier`, qui est la taille APRÈS préparation — un HEIC
  converti en JPEG n'a plus la taille du fichier déposé, et comparer `tailleFichier` aurait fait
  échouer le re-dépôt de toutes les photos d'iPhone. Un test le verrouille explicitement.
  ⚠ **Attrapé par le cliquet #595** : mon premier jet stylait le nouveau paragraphe avec
  `--couleur-texte-secondaire`, une variable FANTÔME (référencée dans `travaux-ui.js`, jamais définie
  dans `styles.css`). La vraie est `--texte-secondaire`. Sans le cliquet, le texte serait sorti sans
  couleur définie, en héritant de son parent.
  ➮ Sentinelles : `tests/unit/sentinelle-610-reprise-import-et-rattachement.test.js` (9 cas, dont
  3 témoins qui doivent rester verts) et `sentinelle-558-file-import-survit-reload.test.js` ÉTENDUE
  (17 → 28 cas). **8 break-tests, 8 ROUGE.** Vitest 410 fichiers / 4307 tests, code de sortie 0.
  ⚠ **Limite du banc, consignée dans le test** : `compresserImageSiNecessaire` construit un
  `new Image()`, que Node n'a pas — aucune IMAGE ne peut être importée au banc. Les cas passent par des
  PDF, qui éprouvent le même chemin (la comparaison porte sur le nom et la taille, pas le type).
  ⏳ **Test manuel dû à Grégoire** : recharger en cours d'import, puis re-déposer deux homonymes de
  tailles différentes — chaque élève doit recevoir SON travail.
- [ ] **#611 — S5 · Appariement par nom : sous-chaîne, sans normalisation, premier arrivé gagne** (constat S3).
  `js/travaux-import.js`. `Martin` s'apparie à `Martineau`, un accent absent fait échouer.
  Correctif : tokens exacts normalisés, ambiguïté ⇒ `null`, copie locale de `chercherParNomEtendu` retirée.
- [ ] **#612 — S6 · Un DA inconnu du groupe est stocké en silence ; un import sans groupe actif rend les fichiers invisibles** (constats S4, S7).
  `js/travaux-import.js`, `js/travaux-ui.js`, `js/liste-evaluations.js`. **D2 = A** : garde
  `groupeCoursActif` dans `confirmerImportPipeline`, refus dit. Plus bandeau « DA sans élève dans ce
  groupe » et lignes de rattrapage dans la liste.
  ⮕ **T6.6 activée le 30 août 2026** (vérification T1.4 de [[#607]]) : `supprimerEvaluation`
  (`js/liste-evaluations.js`) porte le trou de S5 sur le chemin le plus fréquenté — supprimer une
  reprise depuis la liste restaure l'originale et laisse le fichier de la reprise actif, plus récent,
  donc gagnant au repli (DA, production). Correctif : exporter `_detacherFichiersDeEvaluation` et
  l'appeler quand `originaleRestauree` est vrai ; étendre la sentinelle #607, ne pas en créer une seconde.
- [x] **#613 — LIVRÉ le 30 août 2026 — S7 · Restauration d'un ZIP : échecs de blobs avalés, « Import réussi » quand même** (constat S8).
  `js/import-export.js`. Un blob refusé aux magic bytes, absent du ZIP ou perdu sur `QuotaExceededError`
  sortait par un `continue` ou un `catch` muet : l'import s'annonçait « réussi » sur un état amputé, et
  chaque échec de quota émettait sa propre notification.
  · **Livré** : `_restaurerBlobsDepuisZip` rend `{ restaures, manquants }`, `stockerBlob` est appelé avec
  `notifier: false`, les métadonnées sans blob reçoivent `blobStatut: 'manquant'`, et les deux appelants
  disent « Import partiel » avec le compte exact dès qu'il en manque un.
  · **Deux écarts du diff de l'audit, corrigés** (confirmés au code par la session c2) : (1) le diff ne
  convertissait qu'un `return` sur trois — les deux sorties anticipées rendaient un nombre, où l'appelant
  lisait `.restaures` → `undefined`, affiché comme un zéro ; (2) il invoquait « même contrat que
  `codex.js` » sans reprendre la garde `blobStatut !== 'exporte'` de `chargerCodex` — un fichier déjà
  exporté aurait été compté manquant, annonçant « partiel » un import où rien n'est perdu et écrasant une
  métadonnée juste par une fausse. La garde gouverne les **trois** portes de sortie.
  · Sentinelle `#613` étendue dans `tests/unit/sentinelle-import-export-383-384-385.test.js` (11 cas
  ajoutés, pas de second fichier). ROUGE d'abord ; 10 break-tests, 10 rouges obtenus.
  · ⏳ **Test manuel dû à Grégoire** : importer un ZIP dont un blob est corrompu — l'application doit dire
  « Import partiel » et la visionneuse « manquant », jamais « Import réussi ».
- [ ] **#616 — Les sentinelles qui lisent la source bornent par DISTANCE, pas par branche : 31 candidats à trier**.
  Trouvé pendant #613 (S7, 30 août 2026). `sentinelle-import-export-383-384-385.test.js` verrouillait
  « magic bytes AVANT `stockerBlob` » par `[\s\S]{0,400}` entre les deux appels — une DISTANCE, pas une
  SÉQUENCE. Ajouter des commentaires entre les deux l'a fait rougir sans qu'aucun comportement change ;
  en retirer ailleurs l'aurait fait verdir sur un code cassé. Une borne en caractères ment dans les deux
  sens. Forme corrigée sur place : extraire le corps de la fonction, retirer les commentaires, comparer
  deux `indexOf` (helper `corpsSansCommentaires(src, signature)`, réutilisable).
  · **À trier, mesuré le 30 août 2026** : 32 fichiers de `tests/unit/` contiennent un quantificateur
  borné `{0,NNN}`, dont **31 lisent de la source** (`readFileSync`) — ce sont les candidats réels. Verts
  aujourd'hui, faux demain au premier commentaire ajouté ou retiré. Recenser, puis reborner par branche
  ceux qui asservissent une SÉQUENCE. Le 32ᵉ est celui de #613, déjà corrigé.
- [x] **#614 — LIVRÉ le 30 août 2026 — S8 · Fusion de codex sans `validerMagicBytes` ; la purge #336 recense la corbeille et la modélisation** (constats S9, S10).
  `js/codex.js`. Commit `785f7887`.
  · **S9 livré** : `_fusionnerTravaux` valide les magic bytes AVANT `stockerBlob`. Un `travaux/FT_x.pdf`
  contenant du HTML, reçu d'un collègue, n'entre plus dans le store que la visionneuse sert ensuite.
  · **Arbitrage tranché — FAIL-CLOSED** : là où le chemin « ouvrir » (`codex.js:698-706`) est fail-open,
  la fusion refuse quand `window.travauxImport` n'est pas chargé, et le message nomme la cause
  (« validation impossible ») au lieu de laisser croire à un fichier corrompu. Un module de validation
  absent ne vaut pas « validation réussie » sur un chemin qui écrit dans le blob store.
  · **S10 livré** : le recensement des références couvre `fichiersTravaux`, `corbeilleFichiers` ET
  `fichiersModelisation`. La corbeille conserve le blob intact et reste restaurable — elle était
  recensée « orpheline », donc un enseignant qui suivait la console la détruisait.
  · **T8.1 mesuré** (l'audit ne l'avait pas relu) : `modelisation.js` génère l'id `:261`, le pose dans les
  métadonnées `:276` et l'emploie comme clé de blob `:290` — tableau d'objets portant `id`, structure
  compatible. Vérifié en plus, non demandé : la corbeille conserve l'`id` de l'entrée d'origine
  (`travaux-stockage.js:965`), et l'export collecte TOUTES les clés (`codex.js:303-304`) — sans quoi le
  correctif S10 aurait pu être « appliqué » sans jamais mordre.
  · **Ce qui n'a PAS été fait, et pourquoi** : la garde `blobStatut !== 'exporte'` n'est pas reprise dans
  la fusion. `_fusionnerTravaux` itère sur les chemins réellement présents dans le ZIP, donc un `exporte`
  n'y entre jamais — cas structurellement absent, pas gardé. Un commentaire le dit, pour que personne
  n'ajoute la garde « par prudence » en croyant fermer quelque chose.
  · **Sentinelle** : `tests/unit/sentinelle-codex-fusion-purge-614.test.js`, 15 cas, 8 break-tests,
  8 rouges obtenus. `_fusionnerTravaux` est exporté pour les tests, et le helper `charger-codex.js`
  injecte désormais `travauxStockage` et `window.travauxImport`.
  · **À TRANCHER, hors périmètre** : le chemin « ouvrir » reste fail-open. Deux comportements divergents
  dans le même fichier sur la même question — voir la note en fin de `SESSION.md`.
- [ ] **#615 — S9 · Lot des mineurs de l'audit** (constats M1, M2, M3, M4, M10).
  **D3 = A** : « Renommer pour distinguer » retiré avec `renommerDoublon` et `renommerFichierDansFile`.
  Plus : `_detecterPattern` lit `estReprise` · sort du chemin legacy `lancerImport` s'il est
  inatteignable · `livrableAdditionnel` persisté ou retiré · `DATA-OWNERSHIP.md` corrigé à 25 Ki.


### Arbitrages du 28 août 2026 (soir) — les deux qui n'avaient pas d'item

> Les vingt et un arbitrages du 28 août sont consignés **dans leurs items respectifs**
> (#555, #563, #571, #574, #577, #578, #579, #581, #583 à #587). Les deux ci-dessous
> n'existaient nulle part : ils sont nés de la lecture des skills métier, pas d'un audit.
> Registre complet, avec les formulations de Grégoire : artefact « Arbitrages Labo Codex ».

- [ ] **#588 — Une reprise « sans pénalité » retient la RÉCENCE, et rien ne le dit.**
  Créé le 28 août 2026, en lisant le skill `pratiques-notation` §2 bis — pas un audit, pas un bogue.
  **LE FAIT** : le skill l'écrit noir sur blanc — « sans pénalité » signifie au sens strict **retenir la
  meilleure** tentative (Talbert, *Heart of the loop*). Le code de Standards retient « le dernier essai
  non remplacé », donc la **récence**. C'est une variante délibérée et défendable, pas l'équivalent par
  défaut du terme employé.
  ⮕ Le cadre le qualifie déjà lui-même : « c'est une **décision pédagogique**, pas un détail technique —
  la nommer comme telle, et la rendre visible dans le récit de calcul du Comparateur ».
  ✅ **ARBITRÉ PAR GRÉGOIRE le 28 août 2026 — option A : GARDER la récence, et LA DIRE.**
  ⮕ **Aucune note ne change.** Le travail est d'affichage : le Comparateur (et tout écran qui explique le
  calcul) doit nommer la règle appliquée au lieu de la laisser deviner. Les options « passer à la
  meilleure tentative » (qui aurait changé des notes déjà remises) et « rendre le choix configurable »
  sont écartées.
  ⚠ Ce que ça ne tranche pas : où exactement la règle doit être dite. Le skill dit « dans le récit de
  calcul du Comparateur » ; à confirmer si le PDF remis à l'élève doit la porter aussi.

- [ ] **#589 — Le cadre d'alignement et l'application ne décrivent pas le même monde.**
  Créé le 28 août 2026. Les trois questions étaient **ouvertes depuis le 8 août** dans le skill
  `alignement`, qui pose lui-même la règle d'attente : « tant que ces trois points ne sont pas tranchés,
  **le code fait foi pour les types de nœuds** ». Ils sont tranchés — la règle d'attente tombe.
  ✅ **LES TROIS RÉPONSES DE GRÉGOIRE, le 28 août 2026** :
  · **D/P/C ou Anderson** ⇒ « *Dans les faits, DPC est davantage utilisé que la proposition Anderson. On
    devrait laisser une remarque à ce sujet pour dévier vers DPC.* » ⮕ Pas un remplacement : Anderson
    reste, avec une **remarque qui oriente vers D/P/C**.
  · **Les stratégies cognitives** ⇒ « *retirer.* » ⮕ La catégorie sort du CADRE ; aucun type de nœud à
    créer dans l'application.
  · **Exposé, Évaluation et les cinq phases d'enseignement explicite** ⇒ « *oui* » ⮕ Le cadre les
    accueille. L'évaluation est le pivot de la vérification et n'y figurait pas.
  ⚠ **CE CHANTIER PORTE SUR LE SKILL `alignement`, PAS SUR LE CODE.** Les trois décisions alignent le
  cadre pédagogique sur ce que l'application fait déjà ; aucune ne demande de changer un type de nœud.
  ⮕ Le §5 « Parcours suggéré » du cadre dit encore « (D/P/C) » : à relire avec la remarque à poser.


### Retour testeur — 25 août 2026 (Grégoire)

- [x] **#490 — Aucun moyen de supprimer un document partagé par un collègue.** LIVRÉ en **1.96.0**.
  « Je voudrais pouvoir supprimer les cartouches partagées. Il n'y a pas de menu pour le faire,
  comme dans les autres cartes. […] Cette option devrait être présente dans toutes les
  bibliothèques. » Deux captures à l'appui : la carte de la section « Partagés par des
  collègues » ne portait QUE « Dupliquer avec sa grille », là où une carte de la barre latérale
  porte un menu ⋮ avec « Exporter pour partager / Retirer / Supprimer ». Un `.lcz` importé une
  fois ne pouvait plus être défait item par item — seulement en bloc, depuis Réglages › Données
  (`partageImport.retirerImport`, écrit depuis le lot P3 et **jamais câblé à un geste**), et à
  condition de savoir que cette carte existe. Livré :
  · `partage-section.js` — `actionsMenu` posé sur les cartes partagées : les cinq bibliothèques
    en héritent d'un coup, elles rendent toutes cette section par `genererSectionHTML`.
    Nouveaux `consequencesSuppression` (lecture seule, sert la confirmation), `supprimerDuPartage`
    (storage pur) et `supprimer` (handler `data-action`).
  · **Portée : la copie importée, jamais autre chose.** Les documents de l'utilisateur — y
    compris ce qu'il avait déjà dupliqué — ne sont pas touchés, et un réimport du `.lcz` remet
    tout en place.
  · **Cascade grille → SES cartouches partagées, nommées dans la confirmation.** ⚠ Divergence
    ASSUMÉE avec la garde de 1.95.4, qui REFUSE de supprimer une grille de l'utilisateur portant
    des cartouches : là-bas l'objet détruit est du travail écrit, irrécupérable ; ici tout est
    une copie réimportable, et un refus obligerait à supprimer 20 cartouches à la main avant
    d'atteindre leur grille. Les productions partagées, elles, SURVIVENT — leur duplication sait
    déjà vider une référence de grille absente et le dire.
  · `partage-import.js` — `oublierEntites()` : le registre `partage_packagesImportes` cesse
    d'annoncer ce qui n'est plus là (c'est lui qui alimente la colonne « Contenu » de Réglages ›
    Données) ; une entrée vidée item par item disparaît.
  · **CT-29 en passant** — `_btnAttrs` (`bibliotheque-ui.js`, chemin commun aux 5 bibliothèques)
    concaténait ses `data-param*` SANS échapper. L'`id` d'un item partagé vient d'un `.lcz` reçu
    d'un tiers, et la validation d'import refuse le HTML brut (`/<[a-zA-Z!\/]/`) mais laisse
    passer un guillemet seul : de quoi sortir de l'attribut et en greffer d'autres sur le bouton.
    `echapperAttribut` posé sur les quatre paramètres (`el.dataset.*` décode les entités — le
    dispatcher lit la même valeur qu'avant).
  Vitest **3046/3046** (299 fichiers). **14 break-tests, 14 ROUGE.** Vérification navigateur
  (Chromium) : menu ⋮ présent et ouvrable dans les 5 bibliothèques, suppression effective,
  cascade correcte, tableau de Réglages › Données à jour, zéro erreur console.
  ✅ **PORTE TERRAIN RELEVÉE ET CLOSE le 25 août — 8/8, zéro échec, zéro reliquat.** Dont la 2.3,
  la seule vraiment obligatoire : sur son iPad, la confirmation s'affiche PAR-DESSUS la fenêtre de
  bibliothèque — le défaut de 1.92.1 ne se rejoue pas.
  `plans de travail/PORTES-TERRAIN-2026-08-25-490-supprimer-un-partage.md` · artefact
  https://claude.ai/code/artifact/46caad82-bbb2-4337-9014-c850a3415da6
  **Décision 3.1 : « garder la cascade »** — aucun code, comportement confirmé.
  **Décision 3.2 : « oui »** — LIVRÉE en **1.97.0**, voir ci-dessous. ⮕ **#490 EST CLOS.**

- [x] **#491 — « Exporter pour partager » un item reçu d'un collègue.** LIVRÉ en **1.97.0**.
  Décision 3.2 de la porte #490, rendue par Grégoire. **Trois obstacles MESURÉS au navigateur avant
  d'écrire une ligne**, pas supposés :
  · `partageExport.resoudreEntite` ne balaie que les collections de l'utilisateur → l'export
    s'arrêtait sur « item introuvable » ;
  · `rassemblerDependances` rendait **0 cartouche là où 2 étaient liées** — les cartouches
    partagées vivent dans une collection PLATE, pas sous `cartouches_{grilleId}`. Le package
    serait parti **amputé, en silence**. Le pire des trois ;
  · `chaineAttribution` sortait **vide**, avec le seul nom de qui exporte. Un item importé n'a pas
    de `metadata_cc` : sa provenance vit dans `inspireDe`, que `construireChaineAttribution` ne
    regarde pas. Tant qu'on n'exportait que ses propres affaires, la chaîne vide était EXACTE ;
    en ouvrant l'export aux partagés, elle devenait un **mensonge de licence**.
  Livré : `partage-format.js` — `rassemblerDependances(item, type, lecteurs)` rend la SOURCE
  injectable (`LECTEURS_UTILISATEUR` par défaut), et `construirePackage` accepte
  `options.chaineAttribution` (clonée) ; `partage-export.js` — cœur `exporterEntite(entite, type,
  options)` extrait de `exporterPourPartager`, **sans dupliquer** le pipeline signature +
  auto-contrôle, et la confirmation calcule ses dépendances avec les MÊMES lecteurs que le package ;
  `partage-section.js` — `exporterPourPartager` + `chaineAttributionPour`, qui repart de la chaîne
  du package REÇU (registre) et y ajoute l'auteur d'origine, **sauf s'il s'agit de l'auteur qui
  exporte** (cas de Grégoire : ses partagés sont ses propres exports ; identité comparée avec la
  normalisation du TOFU, pas une seconde notion d'« même personne »).
  ⚠ **Trois break-tests sont d'abord restés VERTS** : les sentinelles vérifiaient que les bonnes
  options étaient PASSÉES, jamais que `construirePackage` s'en SERVE. Supprimer les deux lignes
  qui les lisent laissait toute la suite verte, avec un package amputé et non attribué en sortie.
  Sentinelles ajoutées dans `partage-phase1-P1.test.js`. Vitest **3065/3065**.
  Vérifié au navigateur de bout en bout : import d'un vrai `.lcz` de « Marie Collègue » → le ⋮ de
  la carte partagée porte l'entrée → la confirmation annonce **3 ressources liées** → le `.lcz`
  émis contient **3 cartouches** et la chaîne `[Marie Collègue]`, et repasse la validation.
  Dernier ID : **#491**.
  Dernier ID : **#490**.

### Chantier — 25 août 2026, après-midi (le document de consignes et les gabarits)

> Un seul fil : ce que Grégoire remet à ses étudiant·es. Plan complet dans
> `plans de travail/PLAN-document-consignes-production.md`.

- [x] **#496 — « Préparer le PDF » mène à l'aperçu, pas à un formulaire qui redemande.**
  Le bouton lit la grille, l'échelle et la cartouche DANS la production ouverte. Le formulaire
  qu'il ouvrait redemandait ces trois choix ET se pré-remplissait avec les DERNIERS RÉGLAGES
  MÉMORISÉS : ouvrir l'artefact 1 après une dissertation proposait la grille de la dissertation,
  à un clic de l'impression. Le bouton a aussi quitté l'en-tête de section pour venir au-dessus
  des trois choix dont il dépend.

- [x] **#497 — Un seul document, deux rendeurs (étapes 2 à 4).**
  `genererApercuCombine` et `genererPDFCombine` bâtissaient chacun leur mise en page à partir des
  mêmes données : c'est la cause de fond du « l'aperçu ne ressemble pas au PDF », pas un défaut de
  CSS. `construireModeleDocument` décide le CONTENU ; les rendeurs ne décident plus que la
  PRÉSENTATION. Golden master posé AVANT (6 documents de référence) : l'extraction est un no-op
  PROUVÉ, et un ratchet empêche la duplication de repousser.
  **Vraies pages** : le CSS avait les proportions lettre mais en `min-height` — la page s'étirait
  sans fin. Hauteur fixe, feuilles empilées, consignes seules sur la page 1 (décision de Grégoire).
  Trois crans cumulatifs ; un cran sans matière est DÉSACTIVÉ et dit pourquoi.
  **Disposition au choix** : « Deux colonnes » reprend le format de son Manuel, bandeaux compris —
  ce qui rend deux colonnes lisibles n'est pas leur nombre, c'est que chaque bloc annonce ce qu'il
  est. Le « continu » empile enfin au lieu de poser les blocs en `flex: 1` quoi qu'il arrive.
  ⚠ L'aperçu ne DÉCOUPE PAS un tableau qui déborde : il annonce que le PDF ajoutera une page.
  Une seconde pagination contredirait jsPDF au premier cas limite.
  ⚠ Trois écarts trouvés EN USAGE RÉEL : le cran ne voyageait pas jusqu'au fichier exporté ; la
  règle de pagination n'existait que dans l'aperçu (la grille commençait au bas de la page 1) ; et
  le badge CC faisait **144 mm de large sur une page de 216** — depuis avril, jamais vu faute
  d'export. Le titre, lui, ne peut plus recouvrir les infos du cours : sa largeur est ce qui reste
  une fois le bloc de droite MESURÉ.
  ⚠ Incident : `genererPDFCombine` dupliquée en cours de route, une borne de découpage apparaissant
  deux fois dans le fichier. Détectée par la sentinelle W2.f, réparée depuis une sauvegarde,
  réappliquée avec des ancres dont l'unicité est ASSERTÉE.

- [x] **#498 — La date de remise, toujours dans les consignes.**
  Après le détail, avant le contexte de rétroaction. Plusieurs groupes ⇒ TOUTES les dates, nommées
  (en choisir une donnerait à la moitié des étudiant·es une date qui n'est pas la leur, sur le
  document qui la leur annonce). Sans date ⇒ « À préciser » plutôt que le silence. Une date NON
  assignée s'affiche : ce document EST l'acte de transmission.

- [x] **#499 — Des champs supplémentaires, nommés par l'utilisateur.**
  Le gabarit offrait quatre blocs figés ; le document en demande d'autres — « Format et mise en
  page », « Remise du travail », « À vérifier ». Les ajouter en dur aurait résolu CE cas et laissé
  le suivant sans réponse. Portée : par production, jamais partagés — une définition unique au
  niveau du cours aurait changé TOUTES les productions, y compris celles déjà transmises.
  ▣ L'écran fait foi pendant l'édition : chaque geste relit les champs affichés, sans quoi taper un
  titre puis cliquer « + Nouveau champ » effacerait ce qu'on vient d'écrire.

- [x] **#500 — Les trois champs d'origine prennent la forme des champs libres.**
  `objectif`, `tache` et `detailTache` sont lus à **53 endroits**, dont la rétroaction et la
  synthèse qui composent les commentaires reçus par les étudiant·es. Les fondre dans
  `champsPersonnalises` aurait demandé de migrer les productions ET de réécrire ces 53 sites, y
  compris le texte de rétroactions déjà transmises. Décision : même FORME, nom et ordre modifiables,
  stockage intouché, pas de suppression.
  ⚠ Le filet d'abord : onze accès lisaient ces champs par `getElementById` SANS garde. Écrits en
  dur, `.value` ne pouvait pas échouer ; RENDUS, ils n'existent qu'après le rendu.
  ⚠ Un trou dans ma propre sentinelle : en retirant le garde-fou « un bloc ancré ne se supprime
  pas », AUCUN test n'a rougi. Comblé.

- [x] **#501/#502 — Ménage des écrans gris.**
  « Préparer le PDF » retiré des grilles, échelles et cartouches ; « Exporter en PDF » retiré du bas
  du gabarit, avec son code mort. ⚠ Ce bouton PARTAGEAIT son action avec « Exporter la liste en
  PDF » de l'en-tête : le cibler par action aurait retiré le mauvais.
  Cartouches : la Description part, la matrice remonte sous le nom, et les DEUX contextes DESCENDENT
  sous elle au lieu de disparaître — `contexte` est le paragraphe qui OUVRE chaque rétroaction reçue
  par un étudiant. ⚠ La ligne qui l'enregistrait serait devenue `description = ''` : celle des
  cartouches déjà remplies aurait été effacée au premier enregistrement.

- [x] **#503 — Les actions de fiche montent dans la barre de section** (production, grille, échelle).
  Elles ne portaient AUCUNE règle d'affichage : elles tiraient leur visibilité du formulaire qui les
  CONTENAIT. Sorties de lui, elles resteraient visibles sur un écran vide — dont « Supprimer ».
  `lierActionsAuFormulaire` OBSERVE le formulaire plutôt que de se greffer sur chacun des endroits
  qui l'ouvrent : quel que soit le chemin, la barre suit.

- [x] **#504 — Un seul patron pour monter, descendre et retirer un bloc.**
  Sept endroits rendaient le même geste, chacun à sa façon — jusqu'à `btn-principal` (la couleur
  d'« Enregistrer ») pour monter une ligne d'une place. `js/ui-blocs.js` : un rendu, sept appels.
  ⚠ Module à part et non `main.js` : cinq sentinelles chargent leur module dans un sandbox.
  ⚠ Défaut trouvé en chemin : deux boutons de l'échelle portaient DEUX attributs `class` chacun —
  le navigateur ignore le second, le padding compact n'avait jamais été appliqué.

- [x] **#505 — Le rendu des niveaux levait une ReferenceError, l'écran restait vide.**
  `niveaux.length` là où la variable s'appelle `echelle.niveaux`. **Aucun des 3 239 tests ne l'a
  vue** : toutes les gardes de #504 lisaient le SOURCE, aucune n'EXÉCUTAIT un rendu. Un test qui lit
  du texte ne peut pas voir une variable qui n'existe pas. Sentinelle qui EXÉCUTE les quatre rendus.

- [x] **#506/#507 — Astérisque « obligatoire », marque « recommandé », et leur légende.**
  « Obligatoire » établi sur le CODE : un champ n'est marqué que si une validation refuse
  l'enregistrement quand il est vide. ⚠ ÉCART AVEC LA PRÉMISSE : Grégoire donnait « Activité
  d'apprentissage » comme indispensable ; elle est lue à plus de quarante endroits, TOUJOURS avec un
  repli. Rien ne casse sans elle — elle est donc « recommandée », avec l'objectif et la tâche : ces
  trois-là produisent chacun une ligne de l'en-tête de rétroaction qui, vide, n'existe pas et que
  rien ne signale. Une LÉGENDE accompagne les deux marques : deux astérisques de couleurs
  différentes sans elle forment une énigme.
  Les gardes tiennent les deux mensonges — un champ bloquant sans marque, et un champ facultatif
  avec marque (le plus discret : rien ne rougit, et l'utilisateur ne le saura jamais).

  Vitest **3262/3262** (312 fichiers). Dernier ID : **#508**.

### Chantier — 25 août 2026 (correctifs de l'audit Conception, lot « enregistrement »)

> Sur `Rapports/AUDIT-conception-gabarits-2026-08-25.md`, constats A1 et A2 — les deux causes
> directes du symptôme rapporté par Grégoire : « on dirait que les données n'étaient pas toujours
> enregistrées ». Les autres constats de l'audit (A3, A4, B1 à B5, C1 à C6) restent OUVERTS.

- [x] **#509 — « + Nouvelle production » ne repart plus avec les consignes de la précédente.**
  `creerNouvelleProduction` (productions-liste.js) vide le formulaire champ par champ et ne passe
  pas par `reinitialiserFormulaireProduction` (productions.js), seul appelant du peuplement des
  blocs. Deux effets, tous deux reproduits au navigateur pendant l'audit : au PREMIER geste d'une
  session, la fiche neuve n'affichait AUCUN bloc — ni objectif, ni description, ni détail de la
  tâche, donc rien à saisir et un enregistrement muet de chaînes vides ; et APRÈS l'édition d'une
  production, ses champs personnalisés, ses titres réécrits et son ordre de blocs restaient à
  l'écran dans la fiche « neuve », puis s'enregistraient dans la NOUVELLE production.
  ⚠ Exactement la classe de défaut corrigée pour #468/CO-17 (échéances par groupe héritées en
  silence), sur la zone voisine : la sentinelle tient désormais la COUTURE — les deux chemins de
  remise à neuf doivent vider la même zone.

- [x] **#510 — Deux enregistrements coup sur coup ne s'effacent plus l'un l'autre.**
  `modifierCritereGrille` et `modifierNiveauEchelle` lisaient la collection entière, la modifiaient
  et la réécrivaient entière. Or le `change` d'un champ part AU BLUR, c'est-à-dire au moment précis
  où l'on clique dans le champ suivant : deux rafales lisaient le même instantané, et la seconde
  réécrivait la collection SANS la modification de la première. Sans erreur, sans message — le
  mécanisme le plus vraisemblable du « je l'avais rempli, c'est pas resté ». Antérieur au chantier
  #496-#507, pas une régression de 1.99.0.
  ⚠ Sérialiser les ÉCRITURES n'y aurait rien fait : le mal est fait à la LECTURE. C'est la séquence
  entière qui doit être atomique — d'où `db.modifier(cle, mutateur, defaut)`, une file par clé dans
  `db.js` (clés distinctes indépendantes ; un mutateur qui rend `undefined` n'écrit rien ; une
  opération en échec ne bloque pas la file). Les deux éditeurs y passent.
  ▣ **Primitive à réemployer** : tout autre autosave en lecture-modification-écriture porte la même
  course. Audit des autres sites NON FAIT dans ce lot.

  Vitest **3275/3275** (311 fichiers, depuis `tests/`), 2 break-tests par constat, tous ROUGE puis
  restaurés.

- [x] **#511 — Partager une production ne la vide plus de son contenu pédagogique.**
  `SCHEMAS_IMPORT.production` est une LISTE BLANCHE : une clé absente n'est pas signalée, elle
  disparaît. Ni `objectif`, ni `tache`, ni `detailTache`, ni `ponderation`, ni `cartoucheId`, ni
  `echeancesParGroupe`, ni `pratiquesCompatibles` n'y figuraient — ni les `champsPersonnalises` /
  `titresBlocs` / `ordreBlocs` de #499/#500. Deux chemins vivants l'appliquent :
  `ajouterALaBibliotheque` (partager) et l'import sélectif d'archives (restaurer). Les deux
  rendaient donc une production structurellement intacte et pédagogiquement MUETTE.
  Même trou côté grilles : ni `sousCriteres` ni `categoriesErreurs` — les onze rétroactions de
  français se perdaient au transport, elles aussi.
  ⚠ Deux formes de données manquaient au vocabulaire de `assainirObjet`, d'où deux types neufs :
  `arrayStrings` (tableau de chaînes assainies UNE À UNE — `array` sans sous-schéma copie tel quel,
  et ces valeurs repartent dans des attributs HTML) et `mapObjets` (map à clés dynamiques dont les
  valeurs sont des objets cadrés — le cas d'`echeancesParGroupe`).
  ▣ **La couture est désormais tenue** : `CLES_PRODUCTION_NON_TRANSPORTEES` déclare les exclusions
  AVEC leur raison, et la sentinelle relit les clés qu'écrit `construireProductionData` pour exiger
  que chacune soit transportée ou inscrite là. Ajouter une clé au gabarit sans décider de son sort
  fait maintenant rougir un test.
  📐 **Une seule clé exclue : `coursId`** (rattachement local, décidé à l'arrivée). Conséquence
  assumée et INCHANGÉE : restaurer une archive rend des productions sans cours. **À trancher.**

  Vitest **3288/3288** (312 fichiers). Trois break-tests, trois ROUGE — dont la garde de validité
  du ratchet, qui attrape une regex d'extraction devenue muette (motif AP-2 relevé par l'audit sur
  la sentinelle #506). Dernier ID : **#511**.

- [x] **#512 — L'aperçu ne s'ouvre plus sur « Consignes » quand le document a mieux à montrer.**
  `cranDocument` promet, sans demande explicite, le cran le plus HAUT que le document puisse porter
  — le comportement d'avant les crans, pour que rien ne disparaisse de ce que Grégoire voyait.
  Promesse court-circuitée au PREMIER usage : faute de valeur posée, le `<select>` restait sur sa
  première option du HTML (« Consignes ») et le code lisait cela comme un choix de l'utilisateur.
  Une production munie de sa grille, de son échelle ET de sa cartouche ouvrait donc son aperçu sur
  la seule page de consignes.
  ⚠ Correctif : poser explicitement `''` quand aucun réglage n'est mémorisé — une valeur absente de
  la liste met `selectedIndex` à -1, et le sélecteur dit alors « je ne demande rien ».
  ⚠ La sentinelle imite un `<select>` FIDÈLE à HTML (une valeur inconnue retombe à `''`) : un faux
  élément complaisant aurait prouvé le contraire de ce qui se passe dans un navigateur.

- [x] **#513 — Une production sans grille produit enfin son document de consignes.**
  La porte de l'aperçu exigeait grille ET échelle, alors que le cran « Consignes » existe depuis
  #497. Le cas ordinaire — un travail préparé avant qu'on ait monté son évaluation — ne pouvait pas
  produire le document distribué aux étudiant·es, et le repli renvoyait vers un formulaire qui, lui,
  réclame justement les deux : une impasse polie. Le commentaire du code annonçait le retrait de ce
  repli « à l'étape 3 » ; l'étape 3 a été livrée sans que la porte s'ouvre.
  Le rendu, lui, savait déjà faire : le tableau des critères était conditionné. Seules trois gardes
  bloquaient (porte, rendu, nom de fichier PDF).
  ▣ **Défaut voisin corrigé du même coup** : « cette production a-t-elle des consignes ? » était
  écrit DEUX fois et les deux versions divergeaient — `blocsInformationDocument` comptait les blocs
  libres de #499, `cransDisponibles` non. Une production dont seuls « Format et mise en page » et
  « Remise du travail » étaient remplis se voyait refuser son cran, avec un motif FAUX en infobulle
  (« ni objectif, ni description, ni détail de tâche »). Un seul prédicat désormais,
  `productionAConsignes`, et le motif de refus dit la même chose que la règle.
  ✅ **TRANCHÉ 26 août 2026 (porte terrain, décision 3.1) : le formulaire inline reste TEL QUEL.**
  Son bouton « Aperçu » demeure conditionné à `grilleId && echelleId`. Ce chemin n'a pas de
  production d'où déduire les consignes ; la fiche de production, elle, s'ouvre désormais sans
  grille, et c'est par là que passe le geste courant. Ce n'est donc plus un « non touché » en
  attente : c'est une décision rendue.

  Vitest **3298/3298** (313 fichiers). Trois break-tests, trois ROUGE.

- [x] **#514 — Les consignes longues ne sont plus dessinées sous le bord du papier.**
  `poserBlocsInfoPDF` ne consultait JAMAIS la hauteur de page : aucun `addPage`, aucun `getHeight`.
  Le tableau des critères, lui, pagine (autoTable s'en charge) — d'où un document dont la partie
  évaluation se poursuit proprement pendant que les consignes disparaissent à l'impression. Et
  l'aperçu affichait « le PDF le poursuivra sur une page de plus » : promesse tenue pour le tableau
  seulement. Le cas d'usage réel est justement celui qui déborde — un « Détail de la tâche » en
  étapes numérotées, ce que Grégoire distribue.
  ▣ **Le cas ordinaire reste inchangé** : quand tout tient sur la feuille, c'est exactement le rendu
  d'avant qui est produit (celui que fige le golden master). La pagination est un chemin qui ne
  s'ouvre que lorsque le contenu était perdu.
  ⚠ En deux colonnes, l'équilibrage n'a plus de sens au débordement (deux colonnes de hauteur
  comparable qui dépassent toutes les deux ne s'arrangent pas en les équilibrant) : les blocs
  deviennent un FLUX — gauche jusqu'en bas, droite, puis feuille suivante. L'ordre est préservé.
  ⚠ **Piège attrapé en cours de route** : l'abscisse doit être RÉÉVALUÉE après chaque repli, un
  repli pouvant changer de colonne autant que de page. Lue une seule fois, le texte se poursuivait
  dans la colonne qu'on venait de quitter — invisible dans le source, visible sur le papier.
  ⚠ **Et un faux-vert attrapé par le break-test** : l'assertion « le texte occupe les deux
  colonnes » comptait aussi les titres de bandeaux, qui sont posés CENTRÉS, donc à une abscisse qui
  leur est propre. Elle restait verte avec une abscisse figée — le défaut même qu'elle devait voir.

  Vitest **3305/3305** (314 fichiers). La sentinelle mesure ce qui est DESSINÉ (faux jsPDF qui note
  page et ordonnée de chaque tracé), pas ce qui est écrit dans le source. Dernier ID : **#514**.

- [x] **#515 — L'avis de débordement de l'aperçu suit enfin le thème.** (constat C4)
  `.apercu-pdf-debordement` portait `#f0c674` en dur, hors palette. Le ton ne suivait pas le thème :
  sur fond clair, le message « Ce contenu dépasse la feuille » était presque illisible — un avis
  d'alerte qu'on ne lit pas ne prévient de rien. Rattaché à `--alerte-texte-attention`, défini pour
  les deux thèmes (#d4b878 sombre, #7a5a20 clair).
  ⏳ Pas de sentinelle : une valeur de couleur n'est pas un garde-fou de comportement. Le ratchet
  utile serait un lint général des couleurs en dur — chantier distinct, hors de ce lot.

> ✅ **PORTE TERRAIN RELEVÉE LE 26 AOÛT — 21/21, ZÉRO ÉCHEC**, décisions 3.1 et 3.2 tranchées
> (« tel quel » pour les deux). Les quatre correctifs qui donnaient une porte tiennent sur le corpus
> réel, sous Safari : la saisie de deux critères d'affilée reste (#510), la fiche neuve ne porte plus
> les consignes de la précédente (#509), une production partagée arrive avec ses consignes (#511),
> et le document se produit sans grille comme il pagine quand il déborde (#513/#514).
> ⏳ Deux réserves, notées dans la trace plutôt que tues : la mesure d'entrée 2.3a n'a pas été
> renseignée (le verdict tient, la comparaison avant/après n'est pas tracée), et 1.1d a été cochée
> alors qu'elle était sans objet.
> Trace : `plans de travail/PORTES-TERRAIN-2026-08-26-correctifs-audit-conception.md`.

- [x] **#524 LIVRÉ 26 août 2026 (1.99.3)** — les champs obligatoires des Grilles et Échelles, marqués
  et refusés. Audit `Rapports/AUDIT-asterisques-grilles-echelles-2026-08-26.md`, demandé par Grégoire
  en préparant un tutoriel.
  ⮕ **Ce qui existait était juste** : nom de grille, nom de critère (#516) et nom d'échelle portent
  leur astérisque ET sont refusés. Rien à retirer.
  ⚠⚠ **A1 — LE CODE D'UN NIVEAU EST UNE CLÉ.** `${critere.id}_${niveau.code}`, lu à **23 endroits**
  (cartouches, PDF). Un code vide donne `CR_1_` : tous les niveaux sans code sur la même case, le
  dernier commentaire écrase les autres, sans un mot. Ni astérisque, ni refus sur le chemin vivant.
  ⮕ Refus posé sur les DEUX éditeurs (échelle neuve et existante), pour le code ET le nom.
  ⚠⚠ **UNE VALIDATION EXISTAIT — SUR DU CODE MORT.** `sauvegarderNiveaux()` disait déjà « Code et nom
  obligatoires », mais son bouton vit dans le bloc `u-hide` « ANCIEN SYSTÈME » et écrit dans
  `#tableauNiveaux` quand l'éditeur vivant est `#tableauNiveauxEchelle`. **Motif AP-2, le même que
  #516 le matin même, sur l'écran voisin.** Deux fois en un jour : à surveiller comme un pli, pas
  comme un accident. ⮕ Renforce #520 (ablation de l'ANCIEN SYSTÈME) : ce bloc ne fait pas que dormir,
  il **héberge des gardes qui rassurent à tort**.
  ⮕ **A2 — la légende posée sur les quatre écrans** (elle n'existait que sur Production). C'est le
  point qui bloquait le tutoriel : un astérisque sans légende est une énigme. Constat C2 du 25 août,
  débloqué par le verdict D1.
  ⮕ **A3 — `.champ-requis` n'est plus défini deux fois.** La copie en dur d'`index.html` (`#e74c3c`)
  écrasait `styles.css` par l'ordre — et **perdait `font-weight: 700` au passage**. Retirée ; la
  palette reprend la main. Même motif que le doublon de règle du bandeau, trouvé le 24 août.
  Vitest **3356/3356** (320 fichiers). Trois break-tests, trois ROUGE — dont un **rejoué** parce que
  mon ancre n'existait pas et qu'il n'avait donc rien cassé la première fois.

- [x] **#525 LIVRÉ 26 août 2026 (1.99.4)** — la valeur d'un niveau, décidée une fois pour tous.
  **Née d'une question de Grégoire** : « aucune valeur numérique n'est obligatoire pour les échelles ?
  comment la note peut-elle se construire si elle est absente ? » Elle portait exactement sur
  l'angle mort que l'audit #524 avait DÉCLARÉ sans le mesurer (§5.1). La mesure a trouvé deux défauts.
  ⚠⚠ **LE ZÉRO ÉTAIT TRAHI PAR UN OU-LOGIQUE.** `evaluation-calcul.js` repliait
  `valeurCalcul` sur `(min+max)/2` par un OU : une valeur ponctuelle de **0** est *falsy*, donc
  traitée comme ABSENTE et remplacée par le milieu de la plage. Sur un niveau 0 dont la plage irait
  de 0 à 59, **la note valait 29,5 au lieu de 0** — et Grégoire a des échelles « IDME et niv 0 »
  (cf. #450). Le pack de démonstration y échappe par chance : son niveau « Aucun » a min 0 et max 0,
  dont le milieu vaut 0.
  ⚠⚠ **DEUX MODULES, DEUX RÈGLES** pour la même donnée : `consolidation.js` employait `!= null`
  (correct), `evaluation-calcul.js` le OU-logique (bogué). La même échelle pouvait donner deux
  valeurs selon l'écran qui la lisait. ⮕ Règle unique désormais : `valeurNumeriqueDuNiveau()` dans
  `echelles.js`, consommée par les deux, chacun gardant son ancien calcul en repli si le module n'est
  pas chargé.
  ⮕ **`null` plutôt que `NaN`** quand il n'y a ni valeur ni bornes : `(undefined+undefined)/2`
  rendait NaN, qui se propageait jusque dans la note affichée. Et poser 0 à la place serait pire —
  un zéro inventé ne se distingue plus d'un vrai zéro.
  ⚠ **Défaut de mon propre correctif, attrapé par un test** : `Number('')` vaut **0**, pas NaN. Une
  borne laissée vide devenait donc 0 en silence, et deux bornes vides donnaient un niveau qui « vaut
  zéro ». Le test attendait `null` et recevait `+0`.
  ⮕ **Min et Max deviennent obligatoires** (astérisque + refus) : ce sont eux qui portent la note
  quand aucune valeur ponctuelle n'est posée. ⚠ La garde refuse le VIDE, pas le zéro — sans quoi elle
  rendrait impossible le niveau 0 qu'elle protège.
  ⮕ **`valeurCalcul` reste facultatif**, délibérément : une échelle qui ne pose que des bornes reste
  utilisable. C'est une commodité, pas un oubli.
  Vitest **3366/3366** (320 fichiers). Deux break-tests, deux ROUGE.

- [x] **#526 LIVRÉ 26 août 2026 (1.99.5)** — la plage et la valeur ponctuelle sont deux conversions
  INVERSES, et les deux sont obligatoires.
  **Précision de Grégoire** : « la plage sert aux pratiques de notation alternatives, la note
  ponctuelle sert à la notation sommative, ou lorsque la note doit être convertie en note chiffrée ».
  ⮕ **Les deux sens, visibles dans le code** :
  · note chiffrée **→ CODE** : `pourcentage >= n.min && pourcentage <= n.max` (`evaluation-calcul.js`)
    — c'est la PLAGE qui détermine le niveau final d'un·e élève, la note chiffrée restant cachée ;
  · CODE **→ note chiffrée** : `valeurCalcul` — c'est elle qui rend un chiffre quand la certification
    en exige un.
  ⚠⚠ **L'une ne se déduit PAS de l'autre.** Le repli `(min+max)/2` que #525 avait conservé fabrique
  une décision pédagogique que seul l'enseignant peut prendre : « Maîtrise » de 75 à 89 vaudrait 82,
  alors qu'il voudrait peut-être 80 ou 85. **C'est un fallback arbitraire sur une valeur métier**, ce
  que le projet interdit ([[feedback-zero-fallback-arbitraire]]). J'avais écrit la veille que
  `valeurCalcul` « reste facultatif, délibérément » : c'était faux, et c'est Grégoire qui l'a corrigé.
  ⮕ `valeurCalcul` devient **obligatoire** (astérisque + refus), comme `min` et `max`. Le repli
  subsiste UNIQUEMENT pour les niveaux enregistrés avant ce jour, et **il se signale en console** à
  chaque usage — un repli muet redeviendrait un arbitrage invisible.
  ⚠⚠ **LA DISTINCTION N'ÉTAIT PAS DANS LE SKILL** : zéro occurrence de `valeurCalcul`, « plage de
  notes » ou « valeur ponctuelle » dans `pratiques-notation/SKILL.md`. Elle vivait dans la tête de
  Grégoire et dans le code. ⮕ **§7 bis ajouté au skill**, et une sentinelle vérifie qu'il y reste :
  un invariant pédagogique qui ne vit que dans le code se perd au premier refactor.
  ⏳ **À MESURER** : combien de niveaux de ses échelles réelles n'ont PAS de valeur ponctuelle ? Le
  refus empêche d'en créer de nouveaux, il ne répare pas l'existant. Sonde en lecture seule à écrire.
  Vitest **3371/3371** (320 fichiers). Deux break-tests, deux ROUGE.

- [x] **#527 LIVRÉ 26 août 2026 (1.99.6)** — le repli sur le milieu de plage est RETIRÉ.
  Suite directe de #526, et rendu possible par un fait que seul Grégoire pouvait donner : « aucun de
  mes niveaux n'a pas de valeur ponctuelle, j'ai travaillé tout l'hiver avec mon échelle actuelle ».
  ▣ **MESURÉ AVANT DE RETIRER, sur trois sources** :
  · ses échelles réelles — son témoignage ;
  · le **pack de démarrage** — 9 niveaux d'échelle, **9 avec `valeurCalcul`, 0 sans** ;
  · les échelles **semées par le code** (`assurerEchellesPersonnalisees`, création d'un niveau) —
    toutes posent une valeur.
  ⚠ **Première mesure FAUSSE, corrigée** : un filtre trop large comptait 51 niveaux « sans valeur »
  — en ramassant des catégories d'erreurs de français (`{code, retroaction}`) et des niveaux de
  CARTOUCHE (`{code, nom}`), qui ne sont pas des niveaux d'échelle. Recompté en ciblant
  `echellesTemplates` et la présence de `min`.
  ⮕ Le repli ne servait donc à personne, nulle part. Il ne pouvait que **fabriquer une note fausse**
  le jour où une valeur manquerait vraiment — et masquer le vrai problème.
  ⮕ **Sans valeur ponctuelle, un niveau est NON CALCULABLE**, et les deux lecteurs le savent déjà :
  `evaluation-calcul.js` exclut le critère du total (`valeurCritere !== undefined`, **pondération
  comprise** — vérifié, pas de zéro silencieux) et `consolidation.js` saute le niveau. C'est la
  doctrine du projet : non calculable et DIT, jamais un chiffre inventé.
  Skill `pratiques-notation` §7 bis aligné. Vitest **3371/3371** (320 fichiers).

- [x] **#528 LIVRÉ 26 août 2026 (1.99.7)** — les deux aides de l'échelle se répondent enfin.
  Demande de Grégoire, en préparant un tutoriel : « comment expliquerais-tu la nuance entre les
  plages et la note ponctuelle à un utilisateur qui veut monter sa première échelle ? »
  ⚠ **Les deux aides EXISTAIENT** (`echelle-plage-notes`, `echelle-valeur-ponctuelle`), et chacune
  décrivait son champ **sans mentionner l'autre** : « plage de pourcentages » d'un côté, « valeur
  numérique fixe » de l'autre. Qui ouvrait l'une ne voyait jamais la relation — **c'est la relation
  qui manquait, pas la définition**.
  ⮕ Réécrites en PAIRE : la question de chacune (« ce pourcentage, c'est quel niveau ? » ↔ « ce
  niveau, ça vaut combien ? »), **le même exemple dans les deux** (Maîtrisé, 75-89), le renvoi
  mutuel, et le piège NOMMÉ plutôt qu'évité — « le milieu d'un intervalle est un calcul, pas un
  jugement ». Une liste dit quand chacune travaille selon la pratique (alternative ou sommative),
  puisque **le gabarit sert les deux**.
  ⮕ Survols alignés aussi (`cn-echelle-valeur-ponctuelle`, `cn-echelle-niveau`).
  ▣ **La sentinelle tient la PAIRE, pas les textes** : renvoi mutuel, les deux sens de traduction,
  l'exemple partagé, le piège nommé, et l'accord avec le §7 bis du skill. Une aide réécrite seule un
  jour redeviendrait une définition isolée — et le tutoriel expliquerait ce que l'écran tait.
  Vitest **3377/3377** (321 fichiers). Deux break-tests, deux ROUGE.

- [x] **#529 LIVRÉ 26 août 2026 (1.101.0 → 1.101.1) — le CALCUL et l'AFFICHAGE ne connaissent
  plus ni SRPNF ni IDME.** Quatre lots faits dans la même session.
  ⮕ **Lot 1 — la conversion.** Filtre nominal `['0','I','D','M','E']` retiré ; TROIS replis IDME en
  dur retirés, aux valeurs **mutuellement incompatibles** (calculs I:0.40 · pan-standards I:0.55 ·
  consolidation I:0.40) — selon le chemin, un même niveau valait 0.40 ou 0.55. La table se construit
  depuis l'échelle, et vaut `null` quand l'échelle ne dit rien. Un seed est une ÉCHELLE LIVRÉE, pas
  des nombres qu'un calcul invente : c'est la règle de Grégoire, appliquée à la lettre.
  ⮕ **Lot 2 — le calcul.** Les deux regex qui lisaient les scores dans la PROSE des rétroactions
  (celle des cinq critères, celle du français) sont remplacées par la lecture de
  `evaluation.criteres[]` — structuré, présent depuis octobre 2025, et déjà utilisé par
  `calculerMoyennesCriteres` et l'IPB dans le même fichier. Convergence, pas invention.
  La conversion se fait désormais **par évaluation** (chacune porte son `echelleId`).
  ⮕ **Lot 3 — l'affichage.** Le tableau littéral des cinq critères existait en QUATRE exemplaires.
  Les barres viennent de la grille, toutes, dans son ordre (décision de Grégoire). `cleCritere` et
  `criteresDeLaGrillePourAffichage` centralisés dans `profil-etudiant-helpers.js`.
  ⮕ **Lot 4 — l'aide.** Onze passages recadrés : SRPNF y est la grille d'exemple fournie, attribuée
  au modèle ELLAC, plus la structure du logiciel.
  🐛 **UN BUG RÉEL SUR LES DONNÉES DE GRÉGOIRE, corrigé au passage** : `tableConversion[niveau] ||
  null` traitait un score de **0** comme une ABSENCE. Le niveau « 0 » de son échelle 0-IDME était
  EXCLU des moyennes au lieu d'y compter pour zéro — ses moyennes étaient plus hautes que la réalité
  partout où un élève a des 0. ⚠ **Ses chiffres vont baisser à ces endroits : c'est la correction.**
  🐛 **Défaut latent trouvé et corrigé** : le nom affiché venait d'une cascade de ternaires finissant
  par `: 'Français'` SANS condition — tout critère non reconnu se serait affiché « Français ».
  ✅ Vitest 3454/3454 (328 fichiers) · Playwright 165/165 · baseline à zéro · dix break-tests rouges.
  ⏳ **CE QUI RESTE OUVERT, ET QUI LUI APPARTIENT** : #539 (les clés du volet confidentiel), #536
  (`idmeMoyen` à 0 vs « pas de donnée »). Aucun n'est un oubli : chacun engage sa didactique ou ses
  données, et je ne les ai pas tranchés seul.
  ✅ **#537 et #535 LIVRÉS le 27 août 2026** avec #552 — ils n'étaient pas séparables : `I` ÉTAIT
  `francaisMoyen`. Grégoire a tranché ce jour-là (« le critère de langue est un critère comme un
  autre ») et le chantier a été mené d'un seul tenant. Voir BACKLOG-ARCHIVE.md.

- [x] **~~#529 (énoncé d'origine, conservé)~~** 📐 **CHANTIER MAJEUR — sortir SRPNF et IDME du code.** Session DÉDIÉE (décision
  Grégoire, 26 août : « rien ne doit être codé en dur, mais l'échelle IDME peut être seedée par
  contre »). Audit : `Rapports/AUDIT-srpnf-code-en-dur-2026-08-26.md`.
  ⚠⚠ **LA RÈGLE, telle que Grégoire l'a énoncée — elle décide de tout le chantier** :
  · **SEEDER est permis** : livrer IDME comme valeur de départ, modifiable, dans les données. C'est
    une commodité d'accueil, pas une contrainte.
  · **CODER EN DUR est interdit** : inscrire les codes ou les noms dans la LOGIQUE — regex, cascade
    de `if`, tableau littéral, objet de traduction, définition de glossaire.
  ⮕ La différence tient en une question : *l'utilisateur peut-il changer cette valeur et l'application
    continue-t-elle de fonctionner ?* Si oui, c'est un seed. Sinon, c'est du dur.
  **Ce que l'audit a trouvé, par ordre de gravité** :
  1. ⚠⚠ **BLOQUANT — le calcul.** `profil-etudiant-calculs.js:922` extrait les scores par critère du
     TEXTE des rétroactions, via
     `/(STRUCTURE|RIGUEUR|PLAUSIBILIT[ÉE]|NUANCE|FRAN[ÇC]AIS\s+[ÉE]CRIT)\s*\(([IDME])\)/gi`, puis
     ventile par cascade nominale. Les cinq critères ET les quatre niveaux y sont. ⮕ **Pour tout
     utilisateur qui n'est pas Grégoire, le bloc « Forces et défis » du profil est MUET.** Et le
     mécanisme est fragile en soi : relire de la prose pour retrouver une donnée écrite structurée
     ailleurs — toute reformulation d'un libellé casse le calcul, en silence.
  2. **L'interface** : `profil-etudiant-sections-affichage.js:3686` — la liste des cinq barres est un
     tableau littéral ; `:3639` — les noms sont un objet littéral, avec un repli `|| cle` qui trahit
     que le cas « autre critère » a été entrevu sans être traité.
  3. **L'aide** : le popup `profil-etudiant-indicateurs` définit les cinq critères ; le glossaire
     d'`index.html` (l. 14037) présente SRPNF comme un terme de l'application **avec les pondérations
     personnelles de Grégoire** (15/20/10/25/30 %). Six autres mentions décrivent des écrans par ces
     critères.
  ✔ **LA BONNE FORME EXISTE DÉJÀ, et elle prouve que c'est tenable** : `index.html:10260` — « *L'exemple
    qui suit (SRPNF)* illustre une grille inspirée du modèle ELLAC, développé pour l'enseignement de la
    lecture littéraire au collégial ». Cadré comme exemple, attribué à sa source, situé dans sa
    discipline. C'est le patron à généraliser.
  ⏳ **À MESURER EN PREMIER, avant toute correction** : ce que voit réellement un utilisateur avec une
  autre grille — barres vides, à zéro, ou absentes ? Le code suggère « vides », ce n'est pas vérifié.
  ⏳ **Non dépouillés** : `js/interventions.js` (4), `js/evaluation.js` (4), `js/pratiques/*` (12).
  Recoupe [[feedback-concepts-pedagogiques-couche-2-configurables]] et
  [[feedback-libelles-idme-configurables]].

- [x] **#530 CLOS 26 août 2026 (1.100.2) — le défaut était dans la SENTINELLE, pas dans la garde.**
  ⮕ **Verdict, mesuré** : la spec arme la garde en écrivant le magasin global `cours`. Or le commit
  **suivant** celui qui l'a créée — `2342224b` (1.91.7) puis `b598fb5a` (1.91.8), **le même jour** —
  a retiré cette source : `construireMapCoursTrimestre` lit désormais les `<trimestre>_groupesCours`
  NAMESPACÉS. La mise en scène est restée en arrière d'un commit : la map sortait **vide**, la garde
  se taisait par `fail-open` délibéré, et la spec accusait le code du silence qu'elle avait causé.
  ⮕ **Ce qui est réparé** : l'armement (par groupes-cours), plus une **ancre anti-péremption** —
  `coursAttribues > 0` est désormais asserté AVANT tout le reste. Si la source d'attribution rebouge,
  la spec dira « la garde n'était pas armée » au lieu de faire chercher un bug qui n'existe pas.
  ⮕ **Trois break-tests, trois rouges distincts** : armement neutralisé → « la garde doit être
  ARMÉE » · `bienEcrite` forcé à `true` → « le refus doit être DIT » · garde désactivée → « les
  données ne bougent pas ». Le mécanisme de fond (relire la collection avant d'annoncer un succès,
  `productions-bibliotheque-ui.js:352`) était **déjà en place et correct**.
  ⮕ **Baseline Playwright à ZÉRO** : la dette #456 est épuisée, toute rougeur neuve bloque le push.
  ⚠ **CE QUE LA MESURE A RÉVÉLÉ AU PASSAGE, et qui reste OUVERT — voir #548** (renuméroté depuis #533 le 27 août)**.**

- [ ] **~~#530 (énoncé d'origine, conservé)~~ — La garde #340 laisse passer une écriture qu'elle devrait bloquer.**
  Découvert le 26 août en fermant #495, et **il ne s'agit PAS d'une régression** : mesuré à
  l'identique sur `8dfda3ed`, le commit d'avant les travaux du jour (worktree, même erreur, même
  assertion). Il dormait dans la liste des « 8 rouges » de #495, rangé à tort avec le bruit.
  **Le symptôme** (`tests/integration/productions-ajout-refus-garde-340.spec.js`) : deux productions
  de bibliothèque portant un `coursId` d'un AUTRE trimestre sont ajoutées l'une après l'autre dans le
  trimestre actif. La première passe (une seule étrangère est tolérée) ; **la seconde devrait être
  BLOQUÉE** — zéro production native, deux étrangères — et elle ne l'est pas : « Artefact 3 » entre
  dans les données.
  ⚠ **Ce que la garde protège** : la contamination inter-trimestre, c'est-à-dire la famille de
  l'incident de juin (productions A25 écrites sous clé H2026). Ce n'est pas une garde décorative.
  ⏳ **À instruire** : `js/productions-namespace-garde.js` traite « sans `coursId` → neutre » et
  compte sur le fait qu'une production partagée CONSERVE son `coursId` étranger. Le chemin d'ajout
  (`ajouterProductionIndividuelle`, `productions-bibliotheque-ui.js`) copie par spread — donc le
  `coursId` est bien là. Le compte des natives/étrangères est donc à vérifier en premier.
  ⮕ **Seule spec de la baseline** depuis le 26 août : le hook bloquera désormais toute rougeur neuve,
  et celle-ci est la dernière à en sortir.

- [x] **#538 LIVRÉ ET VÉRIFIÉ TERRAIN — La durée d'une séance était inventée : trois `2` en dur dans le calcul d'assiduité.**
  ✅ **CLOS le 27 août 2026 — les TROIS portes terrain sont conformes, verdict de Grégoire :**
  · **date de cours ordinaire** — conforme ;
  · **date de reprise** (le cas critique : la durée doit venir du jour REMPLACÉ, pas du jour
    de la reprise) — conforme ;
  · **groupe-cours sans horaire** (le cas où il ne doit rien inventer) — conforme.
  ⮕ **Ce que cette troisième porte prouve, et c'est la plus importante des trois** : quand
  l'horaire ne dit rien, l'application affiche **0 et le dit**, au lieu de la valeur `2` qui
  s'y trouvait. C'est le seul des trois cas qu'aucun test automatisé ne pouvait trancher —
  il fallait ses données et son écran.
  Constaté au relais du 26 août, tranché par Grégoire le même jour. `obtenirHeuresSeance`
  (`saisie-presences.js`) lisait `db.getSync('formatHoraire')` pour choisir entre 4 h et 2 h.
  **Grep exhaustif du dépôt : trois lectures, ZÉRO écriture** — la clé est morte depuis que le
  format vit dans l'entité Horaire (même clé que #532, même prémisse, déjà verrouillée par
  `tests/unit/sentinelle-532-horaire-presences.test.js` cas B.b). La branche « 4 » était donc
  **inatteignable**, et le repli valait **toujours 2 heures**.
  ⮕ **Trois valeurs en dur, pas deux** — le relais n'en annonçait que deux :
  · `:307` jour marqué « cours » au calendrier, aucune séance définie → `2` ;
  · `:344` format de séance non reconnu → `+= 2` ;
  · `:348` `return totalHeures || 2` — le total calculé vaut 0.
  Plus une quatrième, cousine et en PÉRIODES : `obtenirNombrePeriodesSeance` → `return 2`.
  `genererSeancesCompletes` la nomme déjà comme polluant le dénominateur d'assiduité
  (commentaire « ÉTAPE 3 supprimée », FIX #220).
  ⮕ **Ce n'est pas de l'affichage.** Quatre appelants : pré-remplissage du tableau (`:970`),
  plafond du code couleur et taux affiché (`:1226`), infobulle de séance (`:846`), validation de
  date (`:523`). Les deux premiers alimentent `calculerAssiduitePourAffichage`.
  ✅ **TRANCHÉ PAR GRÉGOIRE, 26 août 2026 : dériver de l'horaire, sinon 0.** La durée se lit dans
  l'horaire du groupe-cours (`obtenirSeancesHoraire()`, SSOT `groupesCours[].horaireId` — le chemin
  réparé par #332), en cherchant les séances du jour de semaine visé (le jour REMPLACÉ pour une
  reprise, comme le fait `genererSeancesCompletes`). Si l'horaire ne dit rien : **0, et le dire à
  l'écran** — jamais une valeur inventée. Conforme à [[feedback-zero-fallback-arbitraire]] : une
  dérivation est une conséquence logique, un `2` est un arbitraire.

- [ ] **#539 — Le volet confidentiel porte les critères de Grégoire dans ses IDENTIFIANTS de champs.**
  `js/profil-etudiant-confidentiel.js` lit et écrit `confidentiel-portrait-plausibilite`,
  `portraitPlausibilite`, etc. : le portrait qualitatif du lecteur est structuré par les cinq
  critères SRPNF. Repéré en faisant #529 (26 août), NON corrigé volontairement.
  ⮕ **Pourquoi je n'y ai pas touché** : ce ne sont pas des libellés mais des CLÉS DE DONNÉES. Les
  renommer casserait les portraits déjà saisis — or la préservation des données de Grégoire est la
  seule contrainte de rétro-compatibilité que le projet se donne (`CLAUDE.md`, zéro-dette).
  ⮕ L'aide au survol est recadrée en attendant : elle dit que ces champs sont ceux de la grille
  d'exemple et ne se déduisent pas des critères de l'utilisateur.
  ⏳ **À TRANCHER** : migrer les clés (avec reprise des données), ou rendre le volet générique
  (N champs dérivés de la grille) ? La seconde change la nature du volet — choix pédagogique autant
  que technique.

- [x] **#541 — Le dépistage classait TOUT LE MONDE en « Étendu ».** LIVRÉ le 26 août 2026.
  Trouvé pendant l'audit demandé par Grégoire au retour de #529 (« ce qui servait au dépistage
  est-il encore efficace ? »). **Le défaut ne vient PAS de #529** : il est antérieur, au moins depuis
  l'extraction du 17 mai 2026 (`d9c67936`), et il touchait le bloc « Forces et défis » du profil.
  ⮕ **Deux unités comparées sans conversion.** `obtenirNiveauIDMEDepuisPourcentage`
  (`profil-etudiant-helpers.js`) reçoit un POURCENTAGE sur 0-100 — son nom le dit, son JSDoc le dit,
  et son appelant vivant le respecte (`profil-etudiant-diagnostics.js:151`, `critere.score * 100`).
  Les seuils, eux, sortent d'`obtenirSeuil('idme.*')` et valent **0-1** : 0.64 / 0.75 / 0.85. Les deux
  étaient comparés tels quels. Tout score au-dessus de 1 % traversait les trois `if` sans en
  satisfaire aucun et tombait dans le `return 'E'` final. **Un critère à 12 % ressortait « Étendu ».**
  ⮕ **Ce que ça donnait à l'écran** : le bloc « Forces et défis » ne pouvait afficher QUE des forces
  exceptionnelles, pour tout le monde, y compris un élève en difficulté sur tous ses critères. Aucun
  message, aucune erreur — le dépistage répondait, et il répondait « tout va bien ».
  ⮕ **Pourquoi la suite était verte avec** : aucun test n'appelait cette fonction. Seul son NOM était
  vérifié, dans la liste d'exports de `refactor-profil-etudiant.test.js:149`. Un test d'existence
  n'est pas un test de comportement.
  ⮕ **Correctif** : une division. Le contrat d'entrée reste 0-100 (nom de la fonction, JSDoc, deux
  appelants) ; c'est la conversion qui manquait, pas le contrat. **Aucune heuristique** du genre « si
  c'est petit, c'est sans doute déjà 0-1 » : 0.8 serait indistinguable de 0,8 % et de 80 %, et la
  fonction deviendrait un devineur.
  ⮕ **Constaté en passant, NON corrigé** (hors périmètre, versé ci-dessous) : le second appelant,
  `genererTableauObjectifs` (`sections-affichage.js:2948`), n'a **aucun appelant** dans tout le dépôt
  — code mort. Et les codes rendus (`'I'`/`'D'`/`'M'`/`'E'`) restent en dur : c'est le chantier des
  échelles, pas celui-ci.
  ✅ Sentinelle `tests/unit/sentinelle-541-niveau-depuis-pourcentage.test.js` — 7 cas, **7 ROUGES au
  break-test** avec le message attendu (`expected 'E' to be 'I'`). Vitest **3495/3495** (330 fichiers).

- [x] **#550 LIVRÉ 27 août 2026 — Sans grille de référence, le dépistage dit « aucune force ni défi » au lieu de « je n'ai rien à comparer ».**
  Créé le 27 août 2026, **symptôme vécu par Grégoire le matin même** : sa carte « Observation
  de la structure des résultats d'apprentissage » affichait *« Aucune force ni défi identifié
  selon la taxonomie SOLO »*, et « Progression par critère » était vide. Cause : **aucune
  grille de référence n'était désignée** dans ses préférences — `obtenirCriteresAvecValeurs`
  rendait donc un tableau vide.
  ⮕ **Le défaut n'est pas le vide, c'est la PHRASE.** « Aucune force ni défi identifié » se
  lit comme un verdict rassurant sur l'élève, alors que ça veut dire « je n'ai aucun critère
  à quoi comparer ». C'est **exactement le patron A3 de #542**, que le lot 1 a refermé pour
  les conversions d'échelle — et qui subsiste ici pour l'absence de grille.
  ⮕ **Le geste** : distinguer les deux cas. « Aucun défi détecté » (les critères existent et
  vont bien) est un verdict ; « aucune grille de référence n'est désignée » est une panne de
  configuration, et elle doit le dire, avec le chemin pour la régler.
  ⮕ Même patron que `diagnostiquerConversionNiveaux` : nommer la cause, parce qu'une cause
  nommée se répare et qu'un silence ne se répare pas.
  ✅ **LIVRÉ le 27 août 2026, en deux temps.**
  ⮕ **Temps 1, sans l'avoir visé** (pas 3c-3 de #542) : la réécriture de la carte a retiré la
  phrase fautive. « Aucune force ni défi identifié selon la taxonomie SOLO » n'existe plus.
  ⮕ **Temps 2, le cœur de l'item** : `diagnostiquerGrilleReferenceDepistage()`
  (`profil-etudiant-helpers.js`) rend `{ grille, raison, message }` sur le patron
  d'`obtenirEchelleCommuneDesEvaluations`, et **distingue TROIS causes** qui ne demandent pas
  le même geste :

  | Raison | Ce qui s'affiche |
  |---|---|
  | `aucune-grille-designee` | « Aucune grille de critères n'est désignée… Choisis-en une dans **Labo → Outils d'observation → « Grille de critères pour le dépistage »** » — le cas vécu par Grégoire |
  | `grille-introuvable` | la grille désignée **a été supprimée** — cause différente, dite comme telle (et la préférence est auto-nettoyée, comportement d'origine préservé) |
  | `grille-sans-criteres` | la grille est là mais **vide** : il faut la remplir, pas en désigner une autre. Le nom de la grille est cité |

  ⮕ **LE MESSAGE VA DANS LES DEUX BLOCS** qui étaient muets : la carte « Observation de la
  structure » ET la liste « Progression par critère », qui était vide en silence — une liste
  vide se lit comme « rien à signaler ». En corriger un seul aurait laissé l'autre mentir.
  ⮕ **Le chemin de réglage est cité tel qu'il s'écrit à l'écran** (`index.html:8617`), vérifié
  avant d'être écrit : un message qui envoie vers un libellé périmé fait chercher, ce qui est
  pire qu'un message absent.
  ⚠ **NON-RÉGRESSION TENUE PAR UN TEST** : `obtenirGrilleReferenceDepistage` garde son contrat
  exact et devient un adaptateur (`diagnostiquer…().grille`). **Treize sites l'appellent**, et
  aucun n'a eu besoin de changer. En particulier, une grille SANS critères reste rendue telle
  quelle — un premier jet la faisait passer à `null`, ce qui aurait fait perdre son `nom` aux
  appelants. Un correctif d'affichage n'a pas à modifier ce que douze autres sites reçoivent.
  **Sentinelles** : `tests/unit/sentinelle-550-grille-reference-cause-nommee.test.js` (5 tests,
  5 break-tests rouges vérifiés **isolément**) et le cas #550 ajouté à
  `tests/integration/depistage-542-3c3-carte-structure.spec.js` — qui prouve que le message
  **arrive à l'écran**, ce que la sentinelle de source ne peut pas dire. Vitest **3706/3706**
  (348 fichiers).

- [ ] **#551 — Le dépistage du RISQUE est calibré sur les bornes de Grégoire.**
  Créé le 27 août 2026, **issu du pas 5 de #542 lot 3**, que Grégoire a décidé de sortir du
  lot plutôt que de l'y forcer. Ce n'est pas une trouvaille de passage : c'était un pas
  planifié, mesuré, et refermé ailleurs.
  ⮕ **LE DÉFAUT.** `identifierPatternActuel` compare une performance à `0,64` et `0,75` — les
  bornes de Grégoire — pour décider « difficulté persistante / émergente / stable ». Chez un
  utilisateur qui note en W/X/Y/Z, ces nombres ne veulent rien dire, et son niveau RàI est
  calibré sur l'échelle de quelqu'un d'autre.
  ⮕ **NUANCE QUI COMPTE, et qui distingue cet item du lot 3** : ces seuils sont
  **configurables** (ils passent par `obtenirSeuil`), donc pas « codés en dur » au sens
  strict. Ce qui cloche est double : ils s'appellent `idme.*`, donc **se font passer pour
  l'échelle de notation**, alors qu'ils décident d'un seuil d'ALERTE ; et le dépistage de
  risque ne consulte jamais l'échelle réelle.
  ⮕ **DEUX GESTES POSSIBLES, non tranchés** : (a) les renommer `depistage.*` et documenter
  qu'ils sont un seuil d'alerte pédagogique — honnête, ne corrige pas le calibrage ;
  (b) situer la performance dans l'échelle de l'utilisateur et exprimer la règle en niveaux —
  fidèle au lot 3, mais **dépend de l'étiquetage SOLO, qu'aucune échelle réelle ne porte**.
  ⮕ **PRÉALABLE À (b)** : les cinq étiquettes SOLO sur l'échelle de Grégoire.

  ### ⚠ LA MESURE DU 27 AOÛT (après-midi) CORRIGE CET ITEM SUR DEUX POINTS

  **1. Le préalable inscrit ici — « fusionner les DEUX implémentations du pattern, sinon la
  correction devrait être écrite deux fois » — NE TIENT PAS.** Il n'y a pas deux
  implémentations mais **six**, et **une seule est atteinte**.

  | Chaîne | Vivante ? |
  |---|---|
  | `identifierPatternActuel` → `determinerNiveauRaiPedagogique` → `snapshots.js`, `etudiants.js` (×4) | **oui** |
  | `identifierPatternActuel` → `determinerCibleIntervention` → `genererSectionAccompagnement`, `tableau-bord-apercu.js:2673` | **oui** |
  | `suggererObjectifIntervention` (`interventions.js`) → bouton « Suggérer » | **oui** |
  | `_identifierPatternActuel` (PAN-Standards) → `identifierPattern` → `genererCibleIntervention` → `genererCarteCibleIntervention` | **non** |
  | `identifierPattern` de Sommative · PAN-Spécifications · Configurable · Test → même chaîne | **non** |

  ⮕ Les seuls autres appelants sont `testerPratiqueFrancois` et `testerPratiqueTest` :
  définies, exposées sur `window`, **jamais appelées**. Des fonctions de console.
  ⮕ **CE QUE ÇA CHANGE POUR LE GESTE** : renommer `idme.*` en `depistage.*` (a) ou situer la
  performance dans l'échelle (b) ne toucherait que **trois sites vivants, tous procéduraux**.
  Il n'y a pas de double écriture à craindre.

  **2. LES CINQ IMPLÉMENTATIONS DIVERGENT, et pas seulement sur les seuils.** Elles ne rendent
  pas le même TYPE : `pratique-pan-standards` et `pratique-sommative` rendent un objet
  `{type, description, couleur}` ; `pratique-pan-specifications` et `pratique-configurable`
  rendent une **chaîne**. Le vocabulaire diverge aussi (`'Difficulté persistante'` /
  `'difficulte-persistante'` / `'stable'`). Et leurs règles n'ont rien en commun :
  `idme.*` configurables d'un côté, `0.60`/`0.30` et un `indiceA = 0.85` « par défaut
  optimiste » en dur dans Sommative, `50` en dur dans Spécifications, le **nombre** de défis
  dans Configurable. Ce n'est pas une fusion, c'est un contrat à écrire.
  ⚠ **ET LE CONTRAT EST OBLIGATOIRE** : `identifierPattern` et `genererCibleIntervention` sont
  deux des huit méthodes requises de `IPratique`, vérifiées à l'enregistrement
  (`pratique-registre.js`, `throw` si absentes). Ces cinq implémentations sont peut-être sans
  consommateur **parce que le câblage du système de pratiques n'est pas fini** (#307), pas
  parce qu'elles sont périmées. **Ne pas les supprimer par nettoyage** : ce serait trancher une
  direction d'architecture, et toutes les pratiques échoueraient à s'enregistrer.

  ✅ **UN PAS LIVRÉ LE 27 AOÛT (après-midi)** : `genererCarteCibleIntervention`
  (`profil-etudiant-sections-affichage.js`, 84 lignes) est **retirée**. Elle rendait la carte
  « Cible d'intervention » du profil et était **morte** — une seule occurrence dans tout le
  dépôt, sa définition ; aucun export `window`, aucun appel, aucun dispatch dynamique. Ses
  règles CSS `.carte-cible-*` (`styles.css`, 8 sélecteurs + 2 en responsive) sont parties avec
  elle, n'ayant aucune autre consommatrice. **C'est elle qui rendait morte toute la chaîne des
  pratiques ci-dessus** : elle en était le seul consommateur.
  ⮕ **UN DÉFAUT D'AFFICHAGE PART AVEC ELLE, ET IL N'A JAMAIS ÉTÉ VU** : la carte interpolait
  `${patternInfo.type}` dans son HTML, où `patternInfo` vient de `pratique.identifierPattern(da)`.
  Sous PAN-Spécifications ou sous une pratique configurable — qui rendent une chaîne — `.type`
  vaut `undefined`, et l'écran aurait affiché « Pattern actuel : undefined ». Personne ne l'a
  jamais vu parce que personne n'atteignait la carte.
  ⮕ **Verrouillé par** `tests/unit/sentinelle-551-carte-cible-morte-retiree.test.js` (5 tests,
  **6 break-tests rouges vérifiés isolément**, restauration confirmée par `diff -q`) : le nom
  absent partout · **ses deux voisines toujours là** (une coupe trop large les emporterait sans
  que rien ne le dise) · le chemin vivant `determinerCibleIntervention` intact des deux côtés ·
  **les cinq `identifierPattern` et les deux entrées du contrat IPratique NON emportées** ·
  aucune règle `.carte-cible-*` au CSS.

  ⮕ **CE QUI RESTE À CET ITEM** : le calibrage lui-même — geste (a) ou (b) sur les trois sites
  vivants — et la décision d'architecture sur le contrat `identifierPattern`. Le nettoyage
  préalable est fait.

  ⮕ **TROIS FONCTIONS MORTES repérées en chemin**, à traiter avec cet item plutôt que de les
  brancher : `genererDiagnosticSRPNF` (`profil-etudiant-diagnostics.js:57`, jumeau de la carte
  refaite au pas 3c-3), `genererTableauObjectifs` (`profil-etudiant-sections-affichage.js`,
  aucun appelant), et `obtenirNiveauIDMEDepuisPourcentage` — **corrigée par #541 le 26 août,
  et appelée uniquement depuis ces deux-là**. Le correctif de #541 était réel, le défaut
  aussi ; simplement personne ne les atteignait.
  ⚠ **NON VÉRIFIÉ** : `genererDiagnosticGenerique` et `_genererBarresSRPNF`, dans le même
  fichier et probablement dans le même cas. Ne pas le supposer.

- [x] **#549 LIVRÉ 27 août 2026** — Le modèle de cartouche part sans les consignes du travail.
  Créé le 27 août 2026, **symptôme vécu par Grégoire** : « il manquait un élément important,
  c'est les consignes du travail ». Le bouton « Télécharger un modèle » (#531, livré le
  26 août) croise une GRILLE et une ÉCHELLE, et rend un fichier que l'assistant remplit.
  ⮕ **Ce qui manque, et pourquoi ça compte** : l'assistant reçoit les critères et les
  niveaux, mais **pas ce qui était demandé à l'élève**. Il écrit donc des commentaires sur
  une tâche qu'il ne connaît pas.
  ⮕ **Le geste** : un TROISIÈME menu, à côté des deux autres — la production — dont les
  consignes sont jointes au fichier. Facultatif : le modèle sans consignes reste utile, et
  rendre le champ obligatoire casserait un usage qui fonctionne.
  ⮕ **Réutiliser `blocsInformationDocument` (`export-pdf.js`)**, le composeur du document de
  consignes : titres personnalisés (`titresBlocs`), champs libres (`champsPersonnalises`),
  ordre du gabarit (`ordreBlocs`). En écrire un second ferait diverger deux textes qui
  décrivent le même travail — le patron que #529 a passé une session à défaire.
  ✅ **LIVRÉ le 27 août 2026** (`c4cafff0`). Menu « Consignes du travail », facultatif,
  option neutre en tête. Le libellé dit quelles productions n'ont **pas** de consignes ; le
  conteneur `portfolio` n'est pas proposé. `composerModeleCartouche` extraite en fonction
  PURE au passage — la composition vivait derrière un `Blob` et n'était vérifiable que de
  visu. 8 tests unitaires + 1 spec WebKit pour le DOM, 4 break-tests rouges vérifiés.
  ⮕ **Le test qui compte** : le fichier reste RÉIMPORTABLE. Une consigne contenant le motif
  `**Nom (CODE)** :` ne doit créer aucune ligne de matrice, sinon un faux commentaire entre
  dans la cartouche réimportée sous un critère qui n'existe pas.
  ⏳ **À VOIR À L'ÉCRAN** : Grégoire doit faire un `git pull` — il lance l'application depuis
  son clone en `file://`.

- [ ] **#542 — SOLO, l'échelle de performance, et ce que le dépistage a le droit de supposer.**
  ⚠ **AUDIT FABLE 5, 27 août 2026** (`Rapports/AUDIT-decouplage-srpnf-idme-conception-2026-08-27.md`) :
  **le lot 4 n'a pas été livré, et il produit des chiffres FAUX chez Grégoire aujourd'hui.**
  `analyserSousGroupe` (`interventions.js:251, 285`) lit ses cinq noms de critères et convertit les niveaux
  par `convertirNiveauEnPourcentage` (`portfolio.js:548-570`) : repli `{I:32, D:69.5, M:79.5, E:92.5}`
  derrière la clé `echellesPerformance` que rien n'écrit — 32/69,5/79,5/92,5 au lieu de 40/65/75/100, et
  `|| 0` → 0 % pour tout code non IDME (« défis communs » partout ou nulle part selon la grille). La
  sentinelle A4 stubbe cette fonction et ne peut pas le voir. Toujours vivants aussi : `determinerLettreIDME`
  (`profil-etudiant-sections-affichage.js:4236`, RENDU à l'écran — l'affirmation « plus aucun ternaire »
  du pas 3c-2 est fausse), `:714-717`, `_genererBarresSRPNF` + `diagnostics.js:403-406` (VIVANT, pas
  mort), `liste-evaluations.js:368` (B7), `synthese-retroaction-data.js:19-30` (B10 + `SCALE_FALLBACK` →
  PDF élève), `evaluation-retroaction.js:488`, `evaluation.js:284` (échelle ancienne M/I/D/B/O),
  `interventions.js:1019, 1246`. Liste complète et classement vivant/mort : rapport §3. ⮕ **Lot 4 = le
  prochain chantier recommandé par l'audit** (§9 n° 1), en item propre.
  Chantier ouvert le 26 août 2026 au soir, plan complet dans
  `plans de travail/PLAN-SOLO-echelle-et-depistage.md`. Origine : l'audit du dépistage demandé au
  retour de #529, et la question de Grégoire — « pourquoi la taxonomie SOLO est-elle associée aux
  critères plutôt qu'à l'échelle ? ».
  ⮕ **La crainte qui fonde le chantier**, mot pour mot : « La crainte que j'ai, c'est que nous
  codions en dur ce qui est dans ma tête, alors qu'il faut rendre l'application flexible.
  L'utilisateur est capable de faire du dépistage même s'il n'a pas exactement la même échelle que
  moi. » Elle s'est **déjà réalisée** : le repli retiré par #529 valait
  `{0:0, I:0.40, D:0.65, M:0.75, E:1.00}` — ce sont les valeurs de l'échelle de Grégoire, au chiffre
  près, recopiées dans le code il y a des mois.
  ⮕ **Décisions actées le 26 août** (§2 du plan) : les deux SOLO sont deux objets distincts et les
  deux restent — SOLO du critère = la **visée** (ce que le critère exige), SOLO du niveau d'échelle =
  le **constat** (ce que la réponse atteint) ; on AJOUTE, on ne déplace pas, sinon l'IPB perd les
  critères « fondations » qu'il surveille. Le champ `description` du niveau n'est PAS remplacé : il
  part dans les documents remis aux élèves (`export-pdf.js`, `cartouches.js`, `comparateur-pratiques.js`).
  Le niveau « 0 » est un **jugement suspendu**, pas une performance nulle.
  ⮕ **Les lots** : **0** mesurer (sonde lecture seule) · **1** refermer les silences du dépistage
  (A2/A3/A4) · **2** le menu SOLO sur l'échelle · **3** délier le dépistage de l'échelle de Grégoire
  (le cœur : la moyenne se situe dans les PLAGES de l'échelle de l'utilisateur, l'interprétation lit
  l'étiquette SOLO — plus de 0,64/0,75/0,85) · **4** le reste du codé-en-dur (B1-B13) · **5** écrire.
  ⏳ **Non tranché, et à ne pas trancher d'avance** : (a) retirer le niveau 0 de l'échelle de
  Grégoire — décision sur SES données, après le lot 0 ; (b) le devenir des seuils `idme.*` (repli ou
  disparition) — se décide dans le lot 3.

  ✅ **LOT 0 LIVRÉ le 26 août 2026 (soirée)** — sonde `scripts/diagnostic-542-echelles-et-niveaux.js`, LECTURE
  SEULE, à coller en console puis `await diag542()`. Elle répond aux quatre questions du plan (code
  de niveau absent de son échelle · niveau `0` · `echelleId` préfixé `pratique-` · aucun `echelleId`,
  en distinguant les cas RÉSOLUBLES des cas MUETS) et conclut, pour chacun, « risque actif » ou
  « risque latent ». ⏳ **DÛ PAR GRÉGOIRE** : la lancer et renvoyer le rapport. Il commande (a)
  ci-dessus et le lot 3.

  🔧 **DÉCOUVERTE DU LOT 0 — L'ÉCHELLE ORPHELINE DE H2026** (26 août 2026, soirée).
  La sonde a mesuré autre chose que ce qu'elle cherchait : **383 évaluations sur 670 désignent une
  échelle introuvable** — 339 sous le seul id `1767389426695`, 44 sous `ECHELLE_DEMO` (résidu connu
  et accepté du 5 août). **1706 niveaux sur 2983, soit 57 % des données, ne se convertissent pas.**
  L'échelle `1767389426695` avait pourtant été recréée le 5 août ; elle a donc été **ré-orphelinée
  depuis**. ⏳ **Cause NON élucidée** — les ids `ECH_1786375947252_5wff1x` (h2026) et
  `ECH_1786375947256_edk4an` (a2026) sont séquentiels à 4 ms : créés par un même passage
  programmatique, piste à remonter. **Tant qu'on ne le sait pas, la réparation peut se défaire.**
  ⮕ **Établi par l'oracle** (`scripts/oracle-542-identifier-echelle-orpheline.js`) : plafond de
  l'outil **99,6 %** (279/280 notes témoins) ; **217 évaluations discriminantes** (celles qui
  emploient `M` ou `0`, seuls niveaux où les candidates divergent) ; **188 reproduites** par la
  famille `0=0 I=40 D=65 M=75 E=100` ; **0 reproduite par une AUTRE échelle** ; **0 code de niveau
  inconnu**. ⮕ Une seule échelle a circulé — la réparation en bloc est sûre.
  ✅ **RÉPARATION EXÉCUTÉE le 26 août 2026 (soirée)** (`scripts/reparation-542-echelle-orpheline.js`, après
  sauvegarde Codex, dry-run relu). Une échelle ajoutée dans `h2026_echellesTemplates` sous l'id
  `1767389426695`, copie intégrale de `h2026_echellesTemplates[1]` (`parDefaut` NON propagé).
  **Aucune note touchée, aucune évaluation modifiée.**
  ⮕ **Oracle avant/après, mesuré par la sonde du lot 0** : niveaux convertibles **1277 → 2807**
  (+1530) ; `echelleId` introuvable **383 → 44**. Le +1530 est EXACTEMENT ce que le dry-run avait
  prédit — prédiction et résultat concordent au niveau près.
  ⏳ **RESTE 44 évaluations `ECHELLE_DEMO`** dans `h2026_evaluationsSauvegardees` (176 niveaux).
  ⚠ **La décision du 5 août de les « laisser telles quelles » est à REVOIR** : elle avait été prise
  quand un repli codé en dur masquait le problème (repli retiré par #529). Depuis le lot 1, ces
  élèves affichent « Dépistage incomplet ». Un `await oracle542('ECHELLE_DEMO')` dirait si le même
  geste s'applique.
  ⏳ **ET LA CAUSE RESTE INCONNUE** : l'échelle avait déjà été recréée le 5 août. Tant qu'on ne sait
  pas ce qui l'a ré-orphelinée, cette réparation peut se défaire.

  ✅ **LOT 3 — PAS 1 ET 2 LIVRÉS le 27 août 2026 au matin** (`4d04dd21`, `750e7c3f`). Consigne
  suivie : `plans de travail/CONSIGNE-542-lot3-delier-le-depistage.md`.
  ⮕ **DÉCISION DE GRÉGOIRE, prise AVANT de coder — OPTION B** : « l'étiquette SOLO est
  facultative, et son absence est DITE ». A (exiger l'étiquette d'abord) et C (repli sur les
  seuils `idme.*`) sont écartées. **Conséquence pour le pas 5 : les seuils `idme.*` n'ont
  aucun rôle de repli, leur disparition devient l'hypothèse par défaut.**
  ⮕ **Pas 1** — `situerPourcentageDansEchelle(pourcentage, echelle)` : la moyenne se situe dans
  les plages de l'échelle de l'utilisateur. Première plage contenante gagne (une note nulle rend
  « 0 », pas « I » — comportement de `calculerNote` reproduit à dessein) ; hors plage rend
  `null`, **sans repli « plus proche »** ; une borne vide n'est pas la borne zéro.
  ⮕ **Pas 2** — `interpreterNiveauAtteint(niveau)` : l'interprétation vient de l'étiquette SOLO
  du niveau. Sans étiquette, le **nom du niveau** est rendu et l'absence est nommée. Les quatre
  descriptions SOLO sont rapatriées dans `NIVEAUX_SOLO_ECHELLE` (`echelles.js`), leur source
  unique — c'était leur mode de SÉLECTION qui était fautif, pas leur texte.
  ⮕ **20 tests, 8 break-tests rouges vérifiés**, restauration confirmée par `diff -q`. Vitest
  3635/3635 (340 fichiers) lu après le dernier changement.
  ⚠ **RIEN N'EST ENCORE BRANCHÉ À L'ÉCRAN.** `interpreterScoreIDME` et la borne `0.85` sont
  toujours en place ; les deux fonctions neuves n'ont aucun appelant. L'application se comporte
  exactement comme avant. **Le branchement et le retrait sont le pas 3.**
  ✅ **VALIDÉ PAR GRÉGOIRE le 27 août 2026** : la description de « préstructurel » —
  **« Aucun aspect pertinent n'est traité »** — est retenue telle quelle. C'est le SEUL texte écrit à
  neuf : l'ancien code ne produisait que quatre descriptions pour cinq niveaux SOLO. C'est du
  vocabulaire pédagogique.
  ✅ **LES QUATRE VERDICTS DE LA PORTE TERRAIN — 27 août 2026, relevé de Grégoire :**
  · **D1 — le survol SOLO sur iPad** : « confort réservé au Mac ». **Aucun code à écrire** ;
    l'infobulle reste, et son absence au tactile est acceptée. Dossier CLOS.
  · **D2 — le niveau disparaît sous sommative** : « le niveau disparaît ». Le comportement
    livré est confirmé. Dossier CLOS.
  · **D3 — étiquetter son échelle en SOLO** : « oui, maintenant ». ⏳ **Geste de Grégoire**,
    cinq menus dans l'éditeur d'échelles. ⮕ **Ce n'est plus un confort** : le modèle de
    cartouche (#549) fait dépendre toute sa consigne de rédaction du « seuil de maîtrise »,
    et l'étiquette SOLO est la seule donnée du dépôt qui puisse le dire.
  · **D4 — laquelle des trois formulations SOLO garder** : « les longues ». ✅ **APPLIQUÉ** —
    les quatre descriptions de la carte « Observation de la structure » sont reprises MOT POUR
    MOT dans `NIVEAUX_SOLO_ECHELLE` (`echelles.js`), et les courtes retirées.
    ⏳ **Deux écarts signalés, non tranchés** : « préstructurel » garde sa formulation courte
    (il n'en existait pas de longue) ; les quatre longues emploient « il/elle », un accord
    lourd que la convention d'écriture inclusive demande de reformuler — reprises telles
    quelles parce que le verdict porte sur CES textes.

  ⏳ **RESTE AU LOT 3** : pas 3 (brancher, et retirer les quatre descriptions en dur + la borne
  `0.85`), pas 4 (supprimer `obtenirNiveauSOLO()` de `trimestres.js`, qui redevine SOLO depuis
  le NOM d'un critère et contredit le champ configuré), pas 5 (trancher le devenir des seuils
  `idme.*`).

- [ ] **#546 — Le « jugement suspendu » n'est plus saisissable : #526 a fermé la porte que le plan SOLO suppose ouverte.**
  Créé le 26 août 2026 (soirée) pendant le lot 2 de #542. **Deux exigences de Grégoire, posées le même jour,
  se contredisent — et aucune n'est fautive :**
  - **#526 (26 août)** a étendu `refusChampNiveau` (`echelles.js`) : `min`, `max` **et
    `valeurCalcul`** sont refusés vides ou non numériques. Motif donné alors, et il tient : « la
    plage sert aux pratiques alternatives, la note ponctuelle sert à la notation sommative » — les
    deux sont des conversions INVERSES, l'une ne se déduit pas de l'autre.
  - **Le plan SOLO (26 août au soir), §2-D4 et §3-C4**, pose que le « jugement suspendu » — un niveau
    qui ne produit pas de note et retire le critère du calcul, numérateur ET dénominateur — se réalise
    par une `valeurCalcul` **VIDE**, « mécanisme déjà en place de bout en bout ».
  ⮕ **Les deux sont vrais, et c'est le problème** : le mécanisme existe toujours dans le CALCUL
  (`valeurNumeriqueDuNiveau` rend `null`, `evaluation-calcul.js` exclut le critère), mais **l'UI en
  interdit désormais l'entrée**. Un utilisateur ne peut plus créer un niveau hors calcul.
  ⚠ **Le lot 2 a donc REFUSÉ d'exécuter l'instruction « retirer l'astérisque de Valeur ponctuelle »**
  du plan : depuis #526, cet astérisque dit la vérité. Le retirer aurait été une régression écrite en
  croyant appliquer le plan. Le constat C4 est **périmé**, il décrivait l'état du 26 août au matin.
  ⏳ **À TRANCHER PAR GRÉGOIRE, et ce n'est pas une question de code** : (a) le jugement suspendu
  passe-t-il par un autre geste que la valeur vide — une case « hors calcul », par exemple, qui dirait
  ce qu'elle fait au lieu de le laisser deviner ? (b) ou bien la valeur vide redevient-elle permise,
  avec un libellé qui explique ce qu'elle signifie ? La seconde rouvre exactement ce que #526 a
  fermé. **Ne pas coder avant d'avoir choisi.**

- [ ] **#544 — Les 44 évaluations `ECHELLE_DEMO` de H2026, et la décision du 5 août à revoir.**
  Créé le 26 août 2026 (soirée), au terme de la réparation #542. Ces 44 évaluations vivent dans
  `h2026_evaluationsSauvegardees` — un magasin RÉEL, pas la démo — et désignent `ECHELLE_DEMO`, un
  identifiant qui n'existe nulle part, **pas même côté démo** (les échelles de démonstration sont
  `ECH_DEMO_*`). Elles portent **176 niveaux**, seul reliquat non convertible après #542
  (2807/2983).
  ⚠ **La décision du 5 août — « laissé tel quel, repli générique cosmétique » — N'EST PLUS VALIDE**,
  et il faut le dire clairement : elle a été prise quand un repli codé en dur fabriquait un score à
  la place de l'échelle manquante. **Ce repli a été retiré par #529.** Depuis le lot 1 de #542, ces
  élèves affichent « Dépistage incomplet » — ce qui est correct, mais ce n'est plus cosmétique : leur
  dépistage est aveugle, et il le dit.
  ⮕ **Premier geste, une commande, aucun code à écrire** : `await oracle542('ECHELLE_DEMO')`.
  L'oracle est paramétré par identifiant. Il dira si une échelle subsistante reproduit leurs notes,
  et donc si le geste de #542 s'applique à l'identique.
  ⮕ **À NE PAS PRÉSUMER** : que ce soient de « fausses » évaluations parce que l'identifiant dit
  « DEMO ». Elles sont dans le magasin réel de H2026 et portent des notes. Avant tout geste, savoir
  ce qu'elles sont — un import de démonstration mal rangé, ou de vraies évaluations dont l'échelle a
  été mal nommée. La sonde du lot 0 les nomme (`await diag542()`).

- [ ] **#545 — Pourquoi l'échelle `1767389426695` a-t-elle été ré-orphelinée ?**
  Créé le 26 août 2026 (soirée). **C'est le point qui rend la réparation #542 fragile** : cette échelle avait
  DÉJÀ été recréée le 5 août 2026 dans `h2026_echellesTemplates` (réparation documentée, oracle
  avant==après). Elle n'y était plus le 27. Quelque chose l'a retirée ou remplacée entre les deux —
  et tant qu'on ne sait pas quoi, **le même effacement peut se reproduire et défaire #542**.
  ⮕ **Piste mesurée, pas supposée** : les ids `ECH_1786375947252_5wff1x` (h2026) et
  `ECH_1786375947256_edk4an` (a2026) sont séquentiels à **4 ms d'écart**. Deux échelles créées dans
  le même passage programmatique, pas par deux gestes humains. Chercher l'écrivain : quel code écrit
  `<trimestre>_echellesTemplates` en REMPLAÇANT la liste plutôt qu'en l'augmentant.
  ⚠ Patron à vérifier en premier : [[feedback-cle-db-lue-jamais-ecrite]] à l'envers — ici la clé est
  écrite, et c'est l'écriture qui écrase. Voir aussi le seed d'échelles au boot et les migrations de
  trimestre (`project-modele-horaire-par-trimestre` a le même patron de recréation pure).

- [ ] **#547 — L'anti-cache est attrapé APRÈS le commit, jamais pendant. Quatre oublis en deux jours.**
  Créé le 26 août 2026 (fin de soirée). **Ce n'est plus une étourderie individuelle, c'est un
  motif** : quatre occurrences du même geste manqué, sur **trois sessions différentes** et trois
  chantiers sans rapport (#540 lot C, #540 lot D sur `styles.css`, #541, #542). À chaque fois :
  un fichier modifié dont le `?v=` de `index.html` ne suit pas, donc un navigateur qui sert la
  version périmée pendant que le bas de page annonce la neuve — l'incident du 23 août.
  ⮕ **POURQUOI LE FILET NE TIENT PAS.** `sentinelle-anticache-fichiers-modifies` compare des
  COMMITS : elle ne peut rien voir tant que le travail est dans l'arbre, et rougit seulement
  au coup d'après. Le hook `pre-push` la voit — trop tard, le commit est écrit. Le geste
  correcteur (`node scripts/release.mjs --build-only`, ou l'édition du seul suffixe quand on ne
  veut pas bumper le build) est connu de tous et appliqué correctement à chaque fois : ce n'est
  pas la connaissance qui manque, c'est le RAPPEL AU BON MOMENT.
  ⮕ **Pistes, à trancher** : (a) un contrôle dans `scripts/hooks/pre-commit` qui compare les
  fichiers STAGÉS à leur `?v=` — il tourne avant l'écriture, mais doit rester rapide et ne pas
  bloquer un commit de documentation ; (b) `--build-only` intégré au geste de commit, ce qui
  suppose de trancher le cas « session `file://` ouverte » où le build ne doit PAS bouger ;
  (c) laisser en l'état et l'accepter comme coût de la coordination à plusieurs sessions.
  ⚠ **La contrainte qui décide** : Grégoire travaille dans l'arbre en `file://`. Tout automatisme
  qui bumpe le BUILD pendant qu'il a l'application ouverte lui change la version sous les pieds
  ([[feedback-bump-build-session-ouverte]]). Un contrôle qui SIGNALE sans écrire est donc plus
  sûr qu'un contrôle qui corrige.
  ⮕ Repéré par la session #542 sur le `styles.css` du lot D de #540, et relayé par la session
  #541 — les trois sessions du soir ont vu le même défaut, aucune ne l'avait vu chez elle.

  🔧 **UNE DONNÉE NEUVE, MESURÉE LE 27 AOÛT AU MATIN (#542 lot 3, pas 1).** La sentinelle ne
  se contente pas d'exiger un `?v=` DIFFÉRENT : elle exige un `?v=` **du jour du build**.
  Posé `20260827a` sur un fichier modifié le 27, elle a rougi — parce que le build est resté
  à `0826-1658`, l'application de Grégoire étant ouverte en `file://`.
  ⮕ **Les deux règles du projet se contredisent dès qu'on travaille le LENDEMAIN d'un build** :
  « le `?v=` d'un fichier modifié se pose » et « aucun bump de build pendant une session
  `file://` ouverte ». Le contournement employé — poser la lettre suivante du JOUR DU BUILD
  (`20260826b`, puis `c`) — est correct au sens de l'anti-cache (l'URL change, le navigateur
  recharge) mais **le suffixe ment sur la date de modification**. C'est un chiffre juste sous
  un mauvais libellé, exactement ce que [[feedback-total-tests-lu-apres-dernier-changement]]
  nomme.
  🔧 **ET LE MESSAGE DU HOOK CONSEILLE LUI-MÊME LE MAUVAIS GESTE — mesuré le 28 août 2026.**
  Le refus affiché par `pre-commit` propose : « incrémenter la **lettre** du suffixe dans
  `index.html` (20260827a -> 20260827b) ». Suivi **littéralement** sur un fichier dont le jeton
  date de la VEILLE, ce conseil produit `20260827c` : le hook passe, puis
  `sentinelle-anticache-fichiers-modifies` rougit, puisqu'elle exige le **jour du build**
  (`version.json` = `0828-1405` → `0828`). Les deux gardes ne disent pas la même chose, et
  **c'est le conseil affiché qui induit en erreur** — pas l'inattention de qui le suit.
  ⮕ Le geste correct est de changer la **DATE** pour celle du build, puis la lettre au besoin :
  `20260827b` → `20260828b`, jamais `20260827c`.
  ⮕ **Correctif minimal, sans toucher aux gardes** : reformuler le message du hook pour qu'il
  nomme le jour du build (qu'il connaît déjà, il lit `version.json`) au lieu de parler d'une
  lettre. Une garde qui refuse ET conseille doit conseiller ce que l'autre garde exigera.
  ⮕ Rencontré en voulant committer #555 lot 2 : quatre fichiers refusés, dont
  `pratique-pan-standards.js` au jeton `20260827b` — le seul daté de la veille, donc le seul
  où le conseil menait au rouge. Signalé à la session parallèle, qui a vérifié ses neuf fichiers
  en conséquence.
  🔧 **LA CAUSE STRUCTURELLE, TROUVÉE À LA RELEASE 1.102.0 DU 27 AOÛT — ET CE N'EST PAS UN
  DÉFAUT DE RAPPEL.** `release.mjs` et la sentinelle **ne prennent pas le même repère**, et
  l'écart est d'exactement UN commit :

  | | Repère | Ce qu'il diffe |
  |---|---|---|
  | `scripts/release.mjs:203` | `git log -1 --format=%H -- version.json` → le **dernier** commit touchant `version.json` | ce qui a changé **APRÈS** la dernière release |
  | `sentinelle-anticache:71-75` | `git log -3 ... ` puis `commits[1]` → l'**avant-dernier** | ce qui a changé **DEPUIS** l'avant-dernière release, donc **y compris dans le commit de release lui-même** |

  ⮕ **Conséquence** : quand une release est faite dans le MÊME commit que du code — ce qui est
  le cas courant ici, `feat(profil): … (1.101.1)` a bumpé `version.json` ET modifié neuf
  fichiers `js/` — **`release.mjs` ne peut structurellement pas voir ces fichiers-là**. Ils
  sont dans son repère, pas après. La sentinelle, elle, les voit. Le script ne les rattrapera
  donc JAMAIS, à aucune release ultérieure.
  ⮕ **Mesuré** : la release 1.102.0 a bumpé 19 fichiers et en a raté **deux** —
  `js/accompagnement-contenu-hover.js` et `js/profil-etudiant-diagnostics.js`, tous deux
  modifiés dans `38c6b574` (le commit de 1.101.1). Rattrapés à la main.
  ⮕ **Le correctif pressenti** est un `~1` sur le repère de `release.mjs` (partir du commit
  qui PRÉCÈDE la dernière release, comme la sentinelle). **NON APPLIQUÉ** : on ne modifie pas
  l'outil de release pendant une release. À faire à froid, avec un test qui reproduit le cas
  « release commitée avec du code ».
  ⚠ **Ceci change le diagnostic de l'item.** « Le geste correcteur est connu de tous et
  appliqué correctement à chaque fois ; ce qui manque, c'est le RAPPEL AU BON MOMENT » reste
  vrai pour les quatre oublis du 26. Mais **au moins une part du motif n'est pas un oubli
  humain : c'est un angle mort de l'outil**, et aucun rappel n'y aurait changé quoi que ce soit.

  🔧 **CINQUIÈME DONNÉE, 27 août au matin — ET C'EST LA PLUS GRAVE : LA SENTINELLE EST
  AVEUGLE AUX MODIFICATIONS SUCCESSIVES D'UN MÊME FICHIER ENTRE DEUX RELEASES.**
  Elle vérifie que le `?v=` a changé **depuis la release précédente**. Une fois qu'il a
  changé une fois, elle est satisfaite — et le reste jusqu'à la release suivante, quel que
  soit le nombre de fois où le fichier est encore modifié.
  ⮕ **Mesuré** : `js/profil-etudiant-calculs.js` est passé à `20260827b` (pas 3a), puis
  `20260827c` (pas 3b). Un troisième changement — le correctif du niveau global — est parti
  **sous le même `c`**. La sentinelle est restée verte, le hook pré-push a laissé passer, et
  le navigateur de Grégoire, qui avait déjà chargé `c`, aurait servi l'ANCIEN fichier. Il
  aurait donc testé un correctif qu'il n'avait pas.
  ⮕ **C'est le trou que les quatre oublis précédents masquaient** : ils portaient tous sur
  un fichier dont le `?v=` n'avait pas bougé DU TOUT depuis la release. Celui-ci avait bougé,
  et c'est ce qui l'a rendu invisible.
  ⮕ **La règle juste** est donc plus stricte : le `?v=` doit changer à chaque COMMIT qui
  touche le fichier, pas une seule fois par cycle de release.

  ⮕ **Ce que ça tranche** : la piste (b) — `--build-only` intégré au geste de commit — est à
  écarter telle quelle. Elle bumperait le build, donc la version sous les pieds de Grégoire.
  Le 27 au matin, `--build-only --dry-run` proposait de toucher **18 fichiers** pour un
  chantier qui en modifiait deux. **La piste (a), un contrôle qui SIGNALE au pre-commit, reste
  la seule compatible avec sa manière de travailler.**

  ✅ **PISTE (a) LIVRÉE le 27 août 2026 — le contrôle au pre-commit.**
  `scripts/verifier-anticache-stage.mjs` (neuf) + son appel dans `scripts/hooks/pre-commit`,
  placé **AVANT** la sortie anticipée de la Défense J — qui filtre sur `'*.js' '*.html'` et
  laisserait passer un commit de `styles.css` seul, précisément un des quatre oublis.
  ⮕ **Le repère est HEAD, pas la release précédente.** C'est ce qui répond à la CINQUIÈME
  DONNÉE ci-dessus : une fois le `?v=` bumpé dans le cycle, la sentinelle est satisfaite pour
  toutes les modifications suivantes. Comparé à HEAD, chaque commit qui touche le fichier doit
  poser une URL neuve — le cas `js/profil-etudiant-calculs.js`, parti trois fois sous le même
  `c`, serait refusé.
  ⮕ **Il signale et refuse, il n'écrit jamais.** Le geste proposé dans le message est
  d'incrémenter la LETTRE du suffixe, qui ne touche pas `version.json` : sûr même avec
  l'application ouverte en `file://`. Échappatoire documentée pour le cas exceptionnel,
  `LABO_ANTICACHE_SKIP=1 git commit` — jamais `--no-verify`.
  🔧 **UN TROU TROUVÉ EN MESURANT.** Le motif relevait **185 références sur 188**. Les trois
  manquantes étaient les bibliothèques vendored, versionnées par un numéro **à points** —
  `libs/pdf.min.js?v=3.11.174`, `libs/jszip.min.js`, `libs/html2canvas.min.js` — invisibles à
  une classe `[A-Za-z0-9]`. Motif élargi, **188/188**.
  ⮕ **CHOIX ASSUMÉ, PAS UN OUBLI** : la sentinelle post-commit n'est **pas** étendue à `libs/`.
  Son second invariant — « le suffixe porte la date du build » — n'a aucun sens sur un numéro
  de version de bibliothèque, et l'y étendre demanderait deux régimes de lecture dans le même
  test. Le risque est couvert au commit, là où il naît.
  ✅ **Sentinelle** `tests/unit/sentinelle-547-anticache-precommit.test.js` — **17 cas**,
  **6 break-tests rouges vérifiés**, restauration confirmée par `diff -q`. Plus **6 cas réels**
  joués dans un dépôt git jetable (refus sans bump · refus `styles.css` seul · passage avec
  bump · documentation silencieuse · échappatoire · fichier neuf) : l'index du dépôt partagé
  n'a pas été touché pour éprouver le hook. **Coût mesuré : ~40 ms** pour deux lectures d'un
  `index.html` de 1 Mo.
  ⏳ **POURQUOI L'ITEM RESTE OUVERT** : le volet `release.mjs` — le repère à UN commit d'écart
  de la sentinelle, et le `~1` pressenti plus haut. Ce contrôle rappelle au bon moment ; il ne
  corrige pas l'angle mort du script de release, qui ne voit structurellement pas les fichiers
  commités EN MÊME TEMPS qu'un bump. À faire à froid, avec un test qui reproduit le cas
  « release commitée avec du code ».

  ⮕ **PRÉCISION DU 28 AOÛT, PAYÉE DEUX FOIS DANS LA MÊME HEURE, EN SENS OPPOSÉS.**
  **`scripts/release.mjs` bumpe ce qui est COMMITÉ, pas ce qui est dans l'arbre.** D'où deux symptômes
  contraires et une seule cause :
  · un fichier modifié **après** le script garde un jeton PÉRIMÉ — arrivé à `js/changelog-data.js` le
    28 août : l'entrée 1.105 avait été écrite après la release, et sans un bump à la main personne
    n'aurait vu la nouvelle entrée ;
  · un fichier non commité **pendant** le script n'est PAS bumpé du tout — arrivé à la session
    parallèle sur `evaluation-jetons.js` et `evaluation-sauvegarde.js`, restés à `20260821a` et
    `20260629a` alors que le build était passé au 28.
  ⚠ J'ai moi-même donné le mauvais conseil sur le second cas (« incrémente la lettre » au lieu de
  « pose la date du build »), en appliquant à l'envers ce que je venais de payer. La session parallèle
  a vérifié avant de suivre, et c'est la seule raison pour laquelle l'erreur ne s'est pas propagée.

- [ ] **#543 — Les 55 évaluations dont la note stockée ne se recalcule pas.** Créé le 26 août 2026 (soirée),
  ✅ **ARBITRÉ PAR GRÉGOIRE le 28 août 2026 — NE RIEN RÉÉCRIRE.** Ses mots : « je confirme,
  ne rien réécrire, et cesser de traiter cet écart comme une incohérence ». Son motif : « en
  fin de trimestre, les notes remises sont les notes finales. Il arrive que j'arrondisse. Je
  ne laisse pas de 59/100 par exemple. Les autres utilisateurs voudront aussi cette marge de
  jugement. »
  ⮕ **L'écart note↔critères n'est PAS un défaut de données : c'est la trace d'un jugement
  d'enseignant.** Un outil qui le « répare » efface une décision pédagogique. Aucune
  écriture sur les 55 évaluations, dans aucun sens — ni réalignement des critères sur la
  note, ni recalcul de la note depuis les critères.
  ⮕ **LE GESTE EST AILLEURS** : trouver où l'application QUALIFIE cet écart comme une
  anomalie (diagnostic, avertissement, sentinelle) et faire qu'elle ne le fasse plus.
  ⚠ **FAUSSE PISTE DÉJÀ ÉCARTÉE, MESURÉE LE 28 AOÛT** : `_diagnostiquerNoteNonCalculable`
  (`profil-etudiant-actions.js:174`) porte le nom qu'il faut mais fait autre chose — il
  explique pourquoi une note n'est pas CALCULABLE (pratique non assignée, introuvable,
  famille Sommative/Spécifications non branchée, Dénotation qui se saisit). **Il ne compare
  jamais une note à ses critères.** Chercher le MOTIF (une comparaison entre `noteFinale` et
  un recalcul, une tolérance, un seuil d'alerte), jamais le nom.
  extrait de #542 (l'oracle les isole ; ce ne sont PAS un problème d'échelle — aucune n'est
  reproduite par une échelle différente, aucune ne porte de code de niveau inconnu). **Deux causes
  distinctes, à ne pas confondre :**
  - **~47 — le pourcentage algorithmique STOCKÉ n'est pas celui qui a servi.** Mesuré sur pièces :
    « Artefact 6 », Français écrit stocké `algo 100`, alors que la note stockée (40,8) exige une
    valeur de ce critère proche de **0** ; un autre du même nom exige ≈ 11. Famille du bug **#350**
    (le champ « nombre d'erreurs » du critère français algo n'est pas restauré à l'ouverture).
    ⚠ Conséquence à vérifier : le dépistage lit le NIVEAU, pas le pourcentage — il n'est donc pas
    faussé par ça. C'est l'intégrité de la donnée algorithmique qui est en cause, pas le dépistage.
  - **~8 — la note stockée est IMPOSSIBLE à produire depuis les niveaux sauvegardés.** Preuve qui ne
    dépend d'aucune hypothèse : « Artefact 5 », quatre critères **tous à `D` = 65**, Σ pondérations
    100 %. Une moyenne pondérée de valeurs toutes égales à 65 vaut 65 **quelles que soient les
    pondérations**. La note stockée vaut **56,3**. Aucune échelle ne peut produire ça — c'est un
    désaccord entre la note conservée et les critères conservés, vraisemblablement un résidu des
    réparations d'août (où les notes ont été préservées pendant que grilles et critères étaient
    recréés).
  ⮕ **Ne rien réparer avant d'avoir tranché ce que « juste » veut dire ici** : la note stockée est ce
  que l'élève a reçu, les critères sont ce qui a été saisi. Les faire coïncider, c'est choisir lequel
  des deux ment — décision de Grégoire, pas de code.

  ✅ **LOT 2 LIVRÉ le 26 août 2026 (soirée)** — menu « Niveau SOLO atteint », cinq valeurs + « aucun »,
  FACULTATIF, dans les DEUX éditeurs d'échelle, servi par UN SEUL producteur d'options
  (`optionsNiveauSOLOEchelle`). Le seed livré reçoit ses étiquettes ; les échelles existantes NON —
  le champ y naît vide, et un test interdit toute reprise depuis la prose (ce serait le défaut B9).
  `description` intacte : elle part dans les documents remis aux élèves. Sentinelle
  `tests/unit/sentinelle-542-lot2-solo-echelle.test.js`, 15 cas, **3 break-tests rouges** (menu retiré
  d'un seul éditeur → 3 ; étiquette du seed retirée → 1 ; reprise automatique introduite → 2).
  ⚠ **L'instruction « retirer l'astérisque de Valeur ponctuelle » N'A PAS été exécutée** : le constat
  C4 du plan est périmé (#526 l'a rendue obligatoire le même jour). Contradiction versée en **#546**.
  ⚠ **CORRECTION D'UNE AFFIRMATION FAUSSE DE MON PROPRE COMMIT** (`c1d92a0f`) : il annonce
  « Vitest 3615/3615 ». **Je n'ai jamais observé cette suite verte.** La mesure réelle au moment du
  commit était **3614/3615**, le rouge portant sur `styles.css` (anti-cache, `?v=20260826d` inchangé)
  — fichier de la session #540, commité par `565b130d`, hors de mon périmètre. Le commit est
  immuable ; la correction vit ici. **C'est la deuxième fois dans la même session** qu'une suite est
  annoncée verte sans avoir été vue verte (la première : `aa880dfa`). ⮕ Règle à tenir : ne jamais
  reporter un total de tests qui n'a pas été lu à l'écran APRÈS le dernier changement.

  ✅ **LOT 1 LIVRÉ le 26 août 2026 (soirée)** — le dépistage ne rend plus de verdict rassurant sans avoir
  calculé. Deux sentinelles, **11 rouges vérifiés au break-test**.
  - **A4 — `defisCommuns` était TOUJOURS vide** (`interventions.js`, `analyserSousGroupe`). **Trois**
    causes indépendantes, qui se masquaient : (1) `seuils.acceptable` n'existe pas à la racine — la
    clé vit sous `interpretation.acceptable`, donc `score < undefined`, toujours faux ; (2) les
    performances sont des POURCENTAGES (0-100) comparés à des seuils 0-1 — même défaut que #541 ;
    (3) `evaluation.criteres` lu comme un DICTIONNAIRE alors que c'est un TABLEAU, donc **rien**
    n'était jamais collecté et toutes les moyennes valaient `null`.
    ⚠ **Écart assumé avec le plan, et il compte** : le plan annonçait « une ligne » et ne voyait que
    la cause 1 ; il classait la cause 3 en « C1 », au lot 4, sans voir qu'elle CO-CAUSAIT A4.
    Break-test à l'appui : chacune des trois, remise seule, rend 7 rouges. Le correctif d'une ligne
    n'aurait donc rien débloqué — `defisCommuns` serait resté vide, et le lot aurait été déclaré clos.
    ⚠ **Second écart assumé** : le seuil employé est `obtenirSeuil('defiSpecifique')`, pas
    `interpretation.acceptable`. Les deux valent 0,70 — aucun chiffre ne change aujourd'hui. Mais
    `defiSpecifique` est LE seuil « en dessous duquel un critère est un défi » (rôle documenté, exposé
    dans les préférences, déjà employé par les trois autres sites qui identifient un défi :
    `profil-etudiant-calculs.js:528, 659, 1038`), tandis qu'`interpretation.*` est le jeu A-C-M, sans
    UI depuis #299. Le prendre aurait fait diverger le seuil du tableau de bord de celui des profils
    le jour où Grégoire en règle un.
  - **A2 — les échelles de pratique étaient invisibles au dépistage**
    (`profil-etudiant-calculs.js`, `obtenirTableConversionNiveaux`). Une évaluation produite sous une
    pratique configurable porte `echelleId = 'pratique-<id>'`, et son échelle vit dans
    `pratiquesConfigurables[].config.echelle`, pas dans `echellesTemplates`. La table rendait `null` →
    aucun défi, pattern « Stable », RàI sur P seul, **sans un mot**. On CONVERGE avec le chemin qui
    existait déjà (`evaluation-calcul.js:526`) ; la construction de la table est extraite en
    `_tableDepuisNiveaux` pour que les deux gisements ne divergent jamais (le patron que #529 a eu à
    défaire).
  - **A3 — et quand la conversion échoue, l'écran le DIT.** Nouvelle
    `diagnostiquerConversionNiveaux(da)` : elle rend `null` dans le cas normal, sinon un message qui
    NOMME la cause (échelle non désignée · échelle introuvable · pratique disparue) et distingue
    « toutes » de « certaines ». Affichée dans la carte RàI, **juste sous le badge de niveau** — donc
    avant les chiffres qu'elle disqualifie. Pas un `console.warn` : il n'atteint pas Grégoire.
    Le choix de #529 (ne pas deviner l'échelle) n'est pas rouvert — c'est son silence qui l'est.
  - ✅ Vitest **3574/3574** (335 fichiers), depuis `tests/`. Sentinelles
    `tests/unit/sentinelle-542-a4-defis-communs.test.js` (11 cas) et
    `tests/unit/sentinelle-542-a2-a3-depistage-non-muet.test.js` (13 cas).
  - ⚠ **Pas de bump de version** : l'application de Grégoire est ouverte en `file://` et le bump est
    dû à la clôture de #540. Une release à la fois.

- [ ] **#540 — La durée hebdomadaire du cours n'est ni exigée, ni recoupée avec l'horaire.**
  Constaté le 26 août 2026 sur une capture du formulaire Cours envoyée par Grégoire : « le nombre
  d'heures de cours par semaine n'est pas dans les formulaires ». **Audit : il y est, mais dérivé
  et jamais vérifié.** `_parserPonderation` (`trimestre-v2-cours.js:732`) découpe déjà « 2-2-3 », et
  `(théorie + labo)` EST la durée hebdomadaire d'enseignement — 4 h en littérature, 4 h en
  philosophie (3-1-3), 5 h en chimie (3-2-3). Elle ne sert qu'à *proposer* les heures totales
  (`:785`), jamais à valider quoi que ce soit.
  ⮕ **Ce que l'assiduité utilise vraiment** : ni la pondération, ni les heures d'enseignement.
  `calculerAssiduite` (`indices.js:147`) compte des PÉRIODES, et `obtenirNombrePeriodesSeance`
  (`saisie-presences.js:515`) les dérive de l'HORAIRE du groupe-cours. `heuresContact` (le « 60 »)
  n'a qu'un lecteur dans tout le dépôt : la jauge de planification
  (`planification-carte.js:9167`). Le libellé sous le champ promet « Sert à vérifier la
  conformité » — **rien ne la vérifie**.
  ⮕ **Deux sources concurrentes pour la durée hebdomadaire, que rien ne réconcilie** : ce que
  l'écran Horaire AFFICHE (`nbSeances × periodesParSeance`, déclaratif et uniforme, défaut `2`) et
  ce que l'assiduité CALCULE (somme des `heureFin − heureDebut`, convertie par `dureePeriode`).
  Une séance 08:00→11:00 dans un horaire déclaré « 2 périodes/séance » s'affiche à 2 périodes et
  pèse 4 au dénominateur. **Le calcul est juste ; c'est l'affichage qui ment.**
  ⮕ **Valeurs en dur restantes après #538** — quatre familles ATTEIGNABLES :
  · `periodesParSeance || 2` — `trimestre-v2-horaires.js:449,590,653,820`, `trimestres.js:551`,
    `demo-namespace.js:215` ;
  · `2` périodes quand la séance n'a ni `nombrePeriodes` ni `duree` — `trimestre-v2-horaires.js:99,
    113,192`. **Cas courant** : `sauvegarderHoraireV2:666-671` n'écrit que jour/heureDebut/heureFin/
    local ;
  · `'08:00'` / `'10:00'` à la lecture d'un champ absent — `trimestre-v2-horaires.js:669-670` ;
  · `intervention.duree || 2` — `interventions.js:122,654,814,1273,1390`.
  Plus cinq gardes INERTES (`: 2` si `obtenirNombrePeriodesSeance` absente — `indices.js:182,321,
  369`, `etudiants.js:228`, `profil-etudiant-sections-affichage.js:1431`) : mortes tant que
  l'ordre de chargement tient, réveillées en silence s'il change.
  Et une cousine une couche plus haut : `× 15` semaines en dur (`trimestre-v2-cours.js:785`), alors
  que le trimestre connaît son vrai nombre de semaines (`v2-nombreSemaines`).
  ✅ **TRANCHÉ PAR GRÉGOIRE, 26 août 2026.** (1) La pondération devient **obligatoire**, astérisque
  rouge, **règle unique** : requise pour toute fiche, ancienne comme neuve — une fiche incomplète ne
  s'enregistre pas tant qu'on ne la complète pas. (2) **Un seul champ**, pas trois : `ponderation`
  est stockée en chaîne « 2-2-3 » sur l'entité cours, et trois cases obligeraient soit à recomposer
  la chaîne (habillage), soit à changer le modèle — ce qui casserait les fiches déjà saisies.
  Normalisation à la sortie du champ : « 2 2 3 » ou « 223 » ressort « 2-2-3 », format du devis
  ministériel. (3) Le rapport entre les deux champs **s'inverse** : la pondération devient la source,
  les heures d'enseignement la dérivée.
  ⮕ **QUATRE LOTS, dans cet ordre** :
  · **✅ A — le champ · LIVRÉ 26 août 2026.** Astérisque `champ-requis` sur pondération, code du
    cours et discipline (les deux derniers étaient refusés depuis toujours SANS qu'aucune marque ne
    l'annonce), légende sous le formulaire, refus par `notifications.erreur` — les deux `alert()`
    du geste « Enregistrer » convertis avec. `_normaliserPonderation` ramène la saisie à la forme
    du devis : espaces, barres obliques, virgules, forme compacte à trois chiffres, et les tirets
    Unicode d'un copier-coller de PDF. Câblée en `data-on-change` (le `change` d'un input se
    déclenche à la perte de focus — pas besoin de toucher au dispatcher de `main.js`, qui ne gère
    pas `blur`), et REJOUÉE à la lecture du DOM pour l'utilisateur qui clique « Enregistrer » sans
    quitter le champ. Le parseur reste le SEUL juge du format.
    ⮕ **DEUX DÉFAUTS TROUVÉS EN CHEMIN, tous deux corrigés :**
    · **Un export orphelin, jamais vu depuis l'origine.** `index.html:6535` câble
      `data-on-input="proposerHeuresEnseignementDepuisPonderation"`, et le dispatcher de `main.js`
      résout ce nom SUR `window` — or la fonction vivait dans l'IIFE sans export. Le dispatcher
      `console.warn`-ait et rendait la main : **la proposition automatique des heures
      d'enseignement ne s'est jamais déclenchée**, et le repère « ≈ N unités » ne bougeait pas à la
      frappe (il n'apparaissait qu'à l'ouverture d'une fiche, appelé directement par
      `afficherFormCoursV2` — ce qui le rendait crédible). Famille
      [[feedback-exports-orphelins-grep-window]].
    · **Le signe négatif silencieusement avalé** — trouvé par la sentinelle AVANT que le code
      n'atteigne l'application. « -2-2-3 » se découpait en `['', '2', '2', '3']`, et le
      `.filter(p => p !== '')` faisait disparaître le signe pour rendre un « 2-2-3 » que personne
      n'avait saisi. Un morceau vide est désormais une malformation, et se refuse.
    ⮕ **Verrous** : `tests/unit/sentinelle-540-ponderation-requise.test.js` (34 cas, six bancs —
    normalisation vivante, refus de l'ambiguïté, exports réels sur `window`, astérisques + légende
    dans `index.html`, refus sans dialogue natif, parseur juge unique) et porte navigateur
    `tests/integration/ponderation-requise-540.spec.js` (6 cas, dont la RÈGLE UNIQUE éprouvée sur
    une fiche ancienne, et le handler `data-on-input` prouvé vivant par un VRAI événement).
    **5 break-tests rouges** avant de leur faire confiance, verts après restauration.
    ⚠ La sentinelle #524 cas D.b comptait les légendes `legende-marques` et en attendait
    exactement 3 : passée à 4, avec la raison inscrite sur place.
    ⏳ **RESTE de l'hygiène adjacente, NON fait** : cinq `alert()` subsistent dans
    `trimestre-v2-cours.js` (`:372`, `:599`, `:608`, `:654`, `:663`) — autres gestes que
    « Enregistrer » (supprimer, modifier, dupliquer). Élargir sans mandat n'était pas le lot A.
    Vitest **3488/3488**, Playwright **171/171**.
  · **✅ B — la dérivation · LIVRÉ 26 août 2026.** `proposerHeuresEnseignementDepuisPonderation`
    multipliait par `15` en dur. Or `calculerStatistiquesCalendrier` (`trimestre-v2.js`, #366)
    compte déjà les semaines réelles, et son en-tête dit pourquoi elle existe : elle « remplace
    les constantes de repli 15/75 qui affichaient un chiffre inventé ». **Cette multiplication-là
    avait échappé au balayage de #366.** Nouveau helper `_semainesDuTrimestreActif()` : il LIT le
    calendrier du trimestre actif, et rend **0 quand le calendrier est muet — un refus de
    répondre, pas une valeur**. La proposition ne remplit alors rien.
    ⮕ **Ce que ça corrigeait pour de vrai** : un trimestre ne fait pas toujours quinze semaines
    (session d'été, calendrier écourté, cours intensif), et quinze semaines au calendrier n'en
    font pas quinze de cours si des congés tombent dedans. La proposition d'heures — celle qui
    sert à VÉRIFIER LA CONFORMITÉ RREC — était donc fausse hors du cas régulier, en silence.
    Un 2-2-3 sur onze semaines vaut 44 h, pas 60.
    ⮕ **Nouveau repère `#v2-repereHeures`** sous le champ : il DIT la base du calcul
    (« (2 + 2) × 15 semaines = 60 h »), ou, sans calendrier, nomme l'absence sans avancer de
    total. Même règle que #538 : on dérive et on le dit, on n'invente pas. L'aide contextuelle
    (`accompagnement-contenu-popup.js`) ne promet plus « les 15 semaines du trimestre régulier ».
    ⮕ **Verrous** : `tests/unit/sentinelle-540-lotB-semaines-reelles.test.js` (18 cas, cinq bancs,
    banc VIVANT sur des calendriers de 15 / 11 / 7 semaines) et deux cas de plus dans la porte
    navigateur (#540-G, #540-H). **4 break-tests rouges.** Le cas #540-F du lot A a dû poser un
    calendrier explicite : son attendu dépendait du `× 15` qu'on venait de retirer.
    ⚠ `index.html` : `?v=` de `trimestre-v2-cours.js` et `accompagnement-contenu-popup.js` bumpés
    À LA MAIN, exactement comme `release.mjs --build-only` l'aurait fait pour eux — **sans toucher
    au build**, Grégoire ayant l'application ouverte en `file://`. Le bump de version reste dû à la
    clôture de #540. Vitest **3513/3513**.
  · **✅ C — tarir les `2` · LIVRÉ 26 août 2026.** Une seule mesure pour les deux chaînes :
    `mesurerDureeSeance` (saisie-presences.js) est exportée, et l'écran Horaire l'emploie au
    lieu des trois mesures maison qu'il portait — toutes avec un repli à `2`. Ce repli n'était
    pas un cas limite : `sauvegarderHoraireV2` écrit `{jour, heureDebut, heureFin, local}`,
    donc TOUT horaire créé par le formulaire y tombait à chaque affichage.
    ⮕ **Le champ « Périodes par séance » est devenu EFFECTIF** (décision de Grégoire) : il ne
    pré-remplissait rien — les lignes naissaient à `08:00 → 10:00` en dur, quel que soit le
    choix. Il pilote désormais l'heure de fin PROPOSÉE ; les lignes déjà saisies ne sont pas
    réécrites (invariant #460 préservé). Le résumé du formulaire et la carte résumé se lisent
    aux heures réelles, plus au produit `nbSeances × periodesParSeance`.
    ⮕ **Heures fabriquées taries** : `sauvegarderHoraireV2` lisait ses champs avec `|| '08:00'`
    et `|| '10:00'` — des champs vides produisaient une séance de deux heures qui entrait au
    dénominateur. Un début manquant est REFUSÉ et dit ; une fin manquante se dérive du format.
    Seul `08:00` subsiste, nommé une fois (`DEBUT_PAR_DEFAUT`) : rien ne permet de déduire une
    heure de début.
    ⮕ **Gardes de chargement à 0, jamais 2** (`indices.js` ×3, `etudiants.js`,
    `profil-etudiant-sections-affichage.js`) — inertes tant que l'ordre de chargement tient,
    mais réveillées EN SILENCE s'il change. ⮕ **`intervention.duree || 2` retiré du chemin
    d'ÉCRITURE des présences** ; les défauts de SAISIE restent (ils proposent, ils ne comptent
    pas — distinction verrouillée par un cas dédié).
    ⮕ **Défaut trouvé en chemin** : `obtenirNombrePeriodesSeance` ne lisait pas
    `heureDebut/heureFin` d'une entrée du cache — il repartait interroger l'horaire par un
    détour dont le résultat dépendait de l'assemblage groupe-cours. Il mesure désormais ce
    qu'il a sous la main, avec la même fonction que l'écran.
    ⮕ **Verrous** : `tests/unit/sentinelle-540-lotC-duree-derivee-horaire.test.js` (21 cas) et
    `tests/integration/horaire-duree-derivee-540C.spec.js` (4 cas, dont la preuve que les deux
    chaînes tombent sur le même nombre). **5 break-tests rouges** — dont un qui N'A PAS rougi
    d'abord : le verrou visait la chaîne littérale `return sum + 2` et laissait passer le même
    repli écrit `sum + 2`. Un verrou qui vise une FORMULATION plutôt qu'un COMPORTEMENT ne
    verrouille rien ; corrigé, puis rejoué.
    ⚠ **Deux sentinelles existantes ont dû suivre** : `sentinelle-assiduite-bigroupes-330`
    ne fournissait PAS `obtenirNombrePeriodesSeance` à son sandbox et empruntait donc le repli
    à 2 — ses attendus tombaient juste par coïncidence ; elle reçoit désormais la vraie chaîne.
    Et `horaire-format-preserve-seances` (CT-01) attendait `10:00` comme fin par défaut.
    Vitest **3534/3534**, Playwright **177/177**.
    ⏳ **LIMITE CONNUE, traitée au lot E** : la conversion temps → périodes divise par la durée
    d'ENSEIGNEMENT alors qu'elle part d'un temps CALENDAIRE. Le lot C n'a pas changé cette
    règle — il l'a unifiée. Voir lot E.
  · **E — LA PAUSE (inséré le 26 août, PASSE AVANT D).** Grégoire, en relisant le lot C : « une
    heure qui dure 60 minutes, c'est une période de 50 minutes plus 10 minutes de pause. Dans
    d'autres collèges, 55 plus 5. Il ne faut pas compter uniquement les minutes, il faut compter
    la pause aussi. »
    ⮕ **Le défaut : deux grandeurs, un seul diviseur.** Le sens périodes → temps affiché
    (`p × dureePeriode` → « 2 pér. (1h40) ») est JUSTE : c'est du temps d'enseignement. Le sens
    temps → périodes divise un temps CALENDAIRE (`heureFin − heureDebut`) par cette même durée
    d'enseignement. Le code ne se trompe pas de formule, il se trompe de grandeur.
    `08:00 → 11:00` vaut **3** périodes ; il en comptait **4**. `13:00 → 17:00` — le bloc de
    quatre heures, cas courant en littérature — en comptait **5**. L'erreur croît avec la durée.
    ⮕ **Les 14 conversions ne sont pas égales.** Huit partent du temps calendaire et sont
    FAUSSES (`obtenirNombrePeriodesSeance`, `obtenirHeuresPrevuesParHoraire`,
    `periodesDeLaSeance`, `presences-rapport:103`, `horaire.js:990/1335`, et **deux migrations
    qui réécrivent `nombrePeriodes` en base** — `migrations:361/381`). Six font un ALLER-RETOUR
    (`heures` est calculé à l'écriture par `periodesPresentes × dureePeriode / 60` puis
    reconverti par le même diviseur) : auto-cohérentes quel que soit le diviseur, elles ne
    bougent pas.
    ⮕ **Aucune donnée saisie n'est réinterprétée** : `periodesPresentes` et `nombrePeriodes`
    sont des entiers choisis dans des selects, les heures d'horaire sont des heures d'horloge.
    Seul risque : si les deux migrations du groupe 1 ont déjà tourné, elles ont pu inscrire des
    `nombrePeriodes` gonflés que le nouveau calcul ne corrigera pas seul.
    ⮕ **Trouvé à l'audit** : `periodesVersHeures` et `heuresVersPeriodes` existent DÉJÀ dans
    `horaire.js`, exportées — 8 sites les emploient, 14 refont la division à la main.
    ✅ **TRANCHÉ PAR GRÉGOIRE, 26 août 2026 : un seul champ, l'EMPREINTE CALENDAIRE.** « Durée
    d'une période » désigne désormais le temps que la période occupe à l'horaire, pause
    comprise. Le temps d'enseignement net n'est plus modélisé.
    ⚠ **Le sens du champ change alors que sa valeur est déjà stockée** (`50` chez Grégoire, qui
    voulait dire « enseignement »). PAS de migration silencieuse : passer 50 à 60 inventerait
    une pause de 10 minutes que personne n'a déclarée. L'application DIT le nouveau sens à
    l'écran et laisse l'utilisateur ajuster.
    *Fin : une séance de 08:00 à 11:00 vaut 3 périodes partout.*
    ⮕ **✅ E1 — la séance porte ses périodes · LIVRÉ 26 août 2026.** Le champ GLOBAL
    « Périodes par séance » est RETIRÉ (écran + module) : un format ne se déclare plus pour
    tout un horaire. Chaque ligne de séance a son champ, `sauvegarderHoraireV2` écrit
    `nombrePeriodes` sur la séance, et le REFUSE absent. Le champ naît **vide** — début et
    fin restent des défauts de formulaire visibles, mais la donnée qui pilote le
    dénominateur se saisit à l'œil ouvert. Le résumé additionne les périodes saisies et DIT
    combien de séances sont incomplètes plutôt que d'annoncer un total partiel.
    ⮕ **Le maillon qui manquait** : `genererSeancesCompletes` (`horaire.js`) ne propageait
    PAS `nombrePeriodes` au cache que lit l'assiduité — et perdait même les heures, en
    écrivant `debut: seance.debut` alors que les séances du formulaire portent `heureDebut`.
    Le cache ne contenait donc rien d'exploitable, d'où le détour par l'horaire et le repli
    à 2 qui se déclenchait si souvent (lot C). Les deux nommages sont acceptés, et le
    nombre de périodes voyage jusqu'au bout.
    ⮕ **Les séances d'AVANT se complètent par REPRISE** : le chargement pré-remplit avec
    `horaire.periodesParSeance` — le format que l'utilisateur avait DÉCLARÉ. Reprendre une
    déclaration n'est pas deviner ; rediviser les heures par 50 l'aurait été, et aurait
    propagé le faux qu'on retire. La valeur reste sous ses yeux, modifiable, avant qu'il
    enregistre. `periodesParSeance` n'est plus ÉCRIT mais n'est pas SUPPRIMÉ des fiches
    existantes : c'est lui qui rend cette reprise possible.
    ⮕ **Verrous** : `tests/unit/sentinelle-540-lotE1-seance-porte-ses-periodes.test.js`
    (14 cas) et `tests/integration/horaire-seance-porte-periodes-540E1.spec.js` (4 cas,
    dont la preuve que le 3 saisi arrive intact au dénominateur — là où l'ancienne chaîne
    comptait 4). **4 break-tests rouges**, dont un qui n'a pas rougi d'abord : la regex
    exigeait `value="${…}"` et laissait passer un `value="2"` en dur, précisément la forme
    la plus probable du retour en arrière.
    ⚠ **SIX bancs existants ont dû suivre**, tous parce qu'ils ne fournissaient pas le
    nouveau champ requis : `sentinelle-horaire-creation-supprimable`,
    `horaire-creation-supprimable.spec`, `parcours-neuf-saisie-presences.spec`, les trois
    cas de `horaire-format-preserve-seances` (CT-01) — dont un a **changé d'objet** : il
    éprouvait le champ global, il éprouve désormais que modifier les périodes d'une séance
    ne touche pas aux autres, invariant plus exposé qu'avant puisque le format est devenu
    une saisie par ligne. Et deux cas de la porte du lot C ont été RETIRÉS, leur objet
    ayant disparu avec le champ ; ce qu'ils protégeaient est repris par la porte E1.
    Vitest **3574/3574**, Playwright **179/179**.
    ⮕ **✅ E2 — plus aucune division · LIVRÉ 26 août 2026.** Les huit sites du groupe 1
    sont taris. `obtenirNombrePeriodesSeance` LIT `nombrePeriodes` et ne convertit plus ;
    son repli passe par une porte neuve, `obtenirPeriodesPrevuesParHoraire`, sœur
    d'`obtenirHeuresPrevuesParHoraire` — **deux grandeurs, deux portes, aucun pont**.
    `periodesDeLaSeance` (écran Horaire) devient une lecture. La grille imprimable cesse
    de convertir ET perd son repli à 2 : annoncer deux périodes là où l'horaire n'en dit
    aucune faisait cocher, au crayon, des absences sur des périodes inexistantes.
    ⮕ **Les deux migrations ne devinent plus.** Elles réécrivaient `nombrePeriodes` EN
    BASE à chaque démarrage, par division. ⚠ Ce que cela NE RÉPARE PAS : les valeurs que
    leurs exécutions passées ont déjà inscrites — les corriger demanderait de savoir ce
    que `duree` signifiait, ce que personne ne peut dire après coup.
    ⮕ **Les présences FACULTATIVES sont exclues de la conversion** : leur champ `heures`
    porte en réalité des PÉRIODES (`interventions.js` y écrit `intervention.duree`, dont
    le libellé de saisie est « Durée (périodes) »). Les convertir revenait à diviser des
    périodes par une durée de période. L'écart restait petit, donc plausible, donc
    invisible.
    ⮕ **Le groupe 2 reste, et c'est légitime** : `heures` sur une présence régulière est
    une SÉRIALISATION de `periodesPresentes` (`× dureePeriode / 60` à l'écriture, même
    diviseur à la lecture) — on retombe sur la valeur d'origine quel que soit le réglage.
    Six sites inchangés.
    ⮕ **Verrous** : `tests/unit/sentinelle-540-lotE2-aucune-division.test.js` (15 cas,
    dont la preuve VIVANTE qu'un bloc de 4 h déclaré 4 périodes en rend 4 — l'ancienne
    chaîne en comptait 5 — et que le réglage de durée n'influe plus sur rien).
    **4 break-tests rouges.**
    ⚠ **QUATRE BANCS ONT DÛ ÊTRE RÉVISÉS**, dont la sentinelle #538 écrite le matin même :
    son banc vivant tout entier reposait sur la dérivation qu'E2 supprime. Trois cas ont
    été RETOURNÉS plutôt que supprimés — « une séance en debut/fin se mesure quand même »
    devient « ne vaut rien sans ses périodes », « la durée configurée est respectée »
    devient « n'influe plus », et le cas de parité de la grille imprimable passe de
    `[4, 2, 2]` à `[4, 0, 0]`. Idem pour la porte du lot C : elle attendait 4 des deux
    côtés, elle attend 0 — les deux chaînes s'accordent désormais aussi sur ce qu'elles
    ignorent. Vitest **3573/3573**, Playwright **179/179**.
    ⏳ **Code mort repéré, NON supprimé** : `mettreAJourLigne` (`saisie-presences.js`)
    lit un champ `heures_${da}` qui n'est plus généré nulle part et n'est appelée par
    personne — seule `mettreAJourLignePeriodes` l'est. Vestige du format « heures ».
    ⮕ **✅ E3 — le réglage disparaît · LIVRÉ 26 août 2026.** Le select « Durée d'une
    période » est retiré de l'écran, avec ses deux handlers (`modifierDureePeriodeV2`,
    `chargerDureePeriodeUI`) et son appel d'initialisation. **`definirDureePeriode` est
    retirée** : la clé ne s'écrit plus nulle part.
    ⮕ **La saisie n'écrit plus `heures` sur une présence** — deux sites l'écrivaient. Ce
    champ était une SÉRIALISATION de `periodesPresentes` par la durée de période ; il
    n'apportait rien de plus que sa source, et son nom a déjà induit en erreur (les
    présences RàI y stockent des PÉRIODES, cf. E2). Tous les lecteurs le lisent APRÈS
    `periodesPresentes` : une présence neuve qui ne le porte pas est lue correctement
    partout, et les anciennes restent lisibles.
    ⮕ **Le select de présence ne promet plus de durée** : « 2 pér. (1h40) » devient
    « 2 pér. ». La parenthèse annonçait le temps d'ENSEIGNEMENT net — vrai dans son
    référentiel, mais l'enseignant qui coche pense à l'élève parti à 10 h, donc en temps
    d'horloge. Afficher l'une des deux grandeurs sans dire laquelle invitait à se tromper.
    ⮕ **La LECTURE subsiste, et son rôle est DIT dans le code.** Onze sites lisent encore
    `obtenirDureePeriode`, tous pour relire le champ `heures` d'anciennes présences :
    c'est un paramètre de DÉSÉRIALISATION d'un format historique, pas une donnée métier.
    Son en-tête porte un avertissement explicite — sans lui, quelqu'un rebranchera un
    select dessus et le pont entre les deux unités reviendra par la porte de derrière.
    ⮕ **Verrous** : `tests/unit/sentinelle-540-lotE3-plus-de-reglage.test.js` (12 cas, dont
    un qui vérifie que l'AVERTISSEMENT lui-même est présent). **4 break-tests rouges.**
    ⚠ La sentinelle `duree-periode-defaut-50` (22 août) a dû être révisée : deux de ses cas
    éprouvaient le setter et le select. RETOURNÉS plutôt que supprimés — ils vérifient
    désormais que ni l'un ni l'autre ne revient. Vitest **3600/3600**, Playwright
    **179/179**.
    ⮕ **CE QUE LE LOT E A CHANGÉ, EN UNE PHRASE** : l'application ne convertit plus jamais
    une durée en périodes, parce qu'elle ne le peut pas — une période comprend sa pause, et
    cette convention n'est écrite nulle part dans les données. Elle demande donc les deux.
  · **✅ D — le recoupement · LIVRÉ 26 août 2026.** L'écran Horaire confronte le total des
    séances à ce que le devis du cours déclare, et le DIT. **Jamais bloquant** : un écart
    peut être légitime (cours intensif, semaine de reprise), et c'est l'enseignant qui sait.
    ⮕ **CE QUI REND LE RECOUPEMENT POSSIBLE SANS CONVERSION, et qui n'allait pas de soi.**
    La pondération « 2-2-3 » compte des heures au sens du réseau collégial — et une « heure
    de cours », au cégep, EST une période : 50 minutes d'enseignement plus 10 de pause.
    `(théorie + labo)` donne donc directement des PÉRIODES par semaine, comparables telles
    quelles au total de l'horaire. C'est le seul endroit du chantier où les deux grandeurs
    se rencontrent sans traduction — et c'est ce qui rend ce lot faisable APRÈS E, alors
    qu'il aurait signalé des écarts imaginaires avant.
    ⮕ **On se TAIT quand on ne sait pas** : pas de cours associé, pas de pondération
    lisible, ou horaire incomplet. Un signal qui parle sans savoir devient un signal qu'on
    n'écoute plus.
    ⮕ **Verrous** : `tests/integration/recoupement-horaire-devis-540D.spec.js` (7 cas —
    concordance à deux séances ET en bloc unique, écart chiffré, chimie 3-2-3 à 5 périodes,
    et les trois silences). **3 break-tests**, dont un qui N'A PAS ROUGI d'abord : le cas
    « pondération illisible » passait une chaîne VIDE, écartée par une garde antérieure au
    parseur — le chemin du parseur n'était donc pas couvert. Un huitième cas l'atteint
    désormais par une chaîne non vide et non reconnaissable.
    Vitest **3600/3600**, Playwright **186/186**.

  ✅ **#540 EST CLOS.** Cinq lots livrés le 26 août : A (pondération obligatoire), B (les
  semaines réelles du trimestre), C (l'écran affiche ce qu'il compte), E1+E2+E3 (la séance
  porte ses périodes, plus aucune division, le réglage disparaît), D (le recoupement).
  ⮕ **CE QUE LE CHANTIER A CHANGÉ, EN UNE PHRASE** : l'application ne convertit plus jamais
  une durée en périodes, parce qu'elle ne le peut pas — une période comprend sa pause, et
  cette convention n'est écrite nulle part dans les données. Elle demande donc les deux, et
  les confronte.
  ⏳ **BUMP DE VERSION DÛ** — non fait : Grégoire avait l'application ouverte en `file://`
  toute la session. Les `?v=` ont été bumpés à la main, fichier par fichier, à chaque lot.
  ⏳ **RESTES INSCRITS, non faits** : cinq `alert()` dans `trimestre-v2-cours.js` sur
  d'autres gestes qu'« Enregistrer » ; `mettreAJourLigne` (`saisie-presences.js`), code mort
  qui lit un champ `heures_${da}` que plus personne ne génère ; et les `nombrePeriodes` que
  les exécutions passées des migrations ont pu inscrire gonflés — irréparables sans savoir
  ce que `duree` signifiait.
  **C avant D** : tant que l'horaire affiche une durée déclarative, un signal de divergence serait
  illisible. ⚠ La pondération suppose une répartition uniforme sur le trimestre — pour un stage ou
  un cours intensif, `(théorie + labo)` n'est pas la durée d'une semaine donnée. D devra prévoir
  l'écart assumé, jamais le blocage.

### Audit Fable 5 des 26-27 août (découplage SRPNF / IDME / SOLO + Conception) — VERSÉ LE 27 AOÛT

> **Rapport** : `Rapports/AUDIT-decouplage-srpnf-idme-conception-2026-08-27.md` — base `fbeffdad` (1.104.1),
> 8 chantiers en worktrees jetables, 31 sentinelles break-testées (70+ mutations), chaque constat porteur
> re-dérivé une seconde fois. **Ce qui tient** : les correctifs des 26-27 août mordent (#542 lots 1-3,
> #552, #540/#538, #550/#551) ; la réparation #542 n'a touché aucune note. **Ce qui ne tient pas** est en
> deux items ci-dessous plus une mise à jour de #542. Le reste — §3 du rapport (19 sites arbitraires
> vivants non inscrits), §4 (6 sentinelles à renforcer), §5 (coutures, dont `valeurCalcul ∈ [min, max]`
> gardé nulle part) — reste au rapport tant que Grégoire n'a pas choisi l'ordre (§9 : A lot 4 / B
> Conception / C données).

- [ ] **#575 — Lot 4 du plan SOLO : le reste du codé-en-dur, à commencer par celui qui fausse les chiffres.**
  Ouvert le 27 août 2026 sur le §9 n° 1 du rapport. Le plan `plans de travail/PLAN-SOLO-echelle-et-depistage.md`
  annonçait ce lot (~90 min) ; les lots 1-2-3 ont été livrés, celui-ci **n'a jamais eu d'item**, et ses
  sites sont intacts à HEAD. **B1+B2 en premier — c'est le seul du lot qui produit des chiffres faux
  aujourd'hui, chez Grégoire comme ailleurs.**
  - [x] **B1+B2 · le quatrième repli IDME et sa clé morte** — LIVRÉ le 27 août 2026 (suppression). (rapport §3 n° 2). `convertirNiveauEnPourcentage`
    (`portfolio.js:543`) replie sur `{0:0, I:32, D:69.5, M:79.5, E:92.5}` derrière `db.getSync('echellesPerformance')`
    — clé **lue et jamais écrite** dans tout `js/` (patron `feedback-cle-db-lue-jamais-ecrite`), donc le repli
    est TOUJOURS actif. Chez Grégoire ce sont `32 / 69,5 / 79,5 / 92,5` au lieu de ses `40 / 65 / 75 / 100` :
    **faux chez lui aussi** ; ailleurs, `|| 0` rend **0 %** pour tout code non IDME, et chaque critère devient
    un « défi commun ». Unique appelant : `interventions.js:337`.
  - [x] **B3+B4 · les cinq noms de critères de Grégoire** — LIVRÉ le 27 août 2026 (suppression). (rapport §3 n° 1). `analyserSousGroupe` (`:251`) et
    `obtenirPerformancesSRPNF` (`:285-289`) énumèrent `Structure / Rigueur / Plausibilité / Nuance / Français` :
    `defisCommuns` reste **vide pour toute autre grille**. Le patron correct est dans le MÊME fichier —
    `mettreAJourCriteresCibles` (`:1138`) lit la grille de l'utilisateur et `calculerMoyennesCriteres`. On
    converge sur lui ; on n'écrit pas un cinquième chemin.
  ⮕ **B1+B2+B3+B4 livrés ensemble le 27 août 2026, PAR SUPPRESSION.** Constat qui a décidé du geste :
    `intervention.analyse.defisCommuns` était écrit et sauvegardé, et **aucun écran ne le lisait**, depuis
    sa création (Beta 0.85) — `genererAffichageAnalyseCartes` n'affiche que les patterns et les niveaux
    RàI ; grep sur tout le dépôt, zéro lecteur. Le besoin est déjà servi, et correctement, par
    `mettreAJourCriteresCibles` (compteur « — 3/5 en défi » par critère de la GRILLE, via
    `calculerMoyennesCriteres`). Réparer le doublon aurait été un correctif sans effet
    (`feedback-verifier-consommateurs-avant-brancher`). Retirés : le bloc « défis » de `analyserSousGroupe`,
    le champ `defisCommuns`, `obtenirPerformancesSRPNF` (`interventions.js`),
    `convertirNiveauEnPourcentage` (`portfolio.js`) et la mention trompeuse de la clé morte dans
    `tableau-bord-apercu.js`. Sentinelle `sentinelle-575-lot4-b1b2-b3b4` (8 cas, **8 mutations, 8 rouges**)
    remplace `sentinelle-542-a4-defis-communs` (11 cas), devenue sans objet — son dernier test annonçait
    ce lot. ⚠ Deux assertions ont été **durcies après un break-test vert** : le comptage des patterns
    (montage à un étudiant par pattern → une mutation `= 1` passait) et le `toContain` du compteur vivant
    (satisfait par le nom cité dans un COMMENTAIRE du corps — même défaut tautologique que #549, §4 de
    l'audit).
  - [x] **B7 · filtre de notes `['I','D','M','E']`** — TRAITÉ le 28 août 2026, PAR SUPPRESSION.
    (rapport §3 n° 8). Le filtre était inutilisable hors IDME, mais il était surtout
    **INATTEIGNABLE** : le `<select id="filtre-note-eval">` qu'il peuplait n'existe NULLE PART dans
    `index.html`, et `git log -S` n'en trouve aucune trace depuis le premier commit du dépôt. La garde
    `if (selectNote)` n'a donc jamais été vraie, et la branche « niveau » de `appliquerFiltresSurLignes`
    jamais empruntée. Le corriger aurait été un correctif sans effet
    (`feedback-verifier-consommateurs-avant-brancher`). Retirés : le bloc d'options, la branche de
    filtrage, et les 5 références résiduelles à l'identifiant. ⮕ **Un filtre par niveau, s'il est
    voulu, est une fonction NEUVE** (son `<select>`, ses options tirées de `niveauxOrdonnesDeLEchelle`,
    et une décision sur ce qu'il propose quand les évaluations affichées ne partagent pas d'échelle).
  - [x] **⮕ TROUVÉ EN CHEMIN, ET VIVANT LUI : le TRI de la colonne « Niveau »** — LIVRÉ le 28 août 2026.
    `trierLignesParColonne` (`liste-evaluations.js`) portait `{ I:1, D:2, M:3, E:4, '-':5 }` avec un
    repli `?? 5`. L'en-tête est CLIQUABLE (`index.html`, `data-param="niveauIDME"`) : hors IDME, toutes
    les lignes recevaient le même rang et **cliquer ne triait rien, en silence**. Le rang se lit
    désormais dans l'échelle de l'évaluation (`echelleId` ajouté à la ligne), et une ligne sans niveau
    lisible reste en FIN dans les deux sens — avant, le `?? 5` faisait remonter les non-évaluées en
    TÊTE au tri décroissant. Le `title` de l'en-tête n'annonce plus « IDME » à l'utilisateur.
  - [x] **`SCALE_FALLBACK` · le PDF remis à l'élève** — LIVRÉ le 27 août 2026 (suppression).
    `lireEchelle` (`synthese-retroaction-data.js`) résout désormais par le chemin unique
    `obtenirEchelleResolue` — qui connaît AUSSI l'échelle embarquée d'une pratique configurable
    (`pratique-<id>`), le cas qui tombait systématiquement sur le repli — et rend `[]` quand rien ne se
    résout : la légende et la jauge se masquent, le reste du document tient (le rendu lit partout
    `feedback.scale || []`). `normaliserCouleur` ne devine plus la couleur d'après le code IDME de même
    lettre. Sentinelle `sentinelle-575-synthese-pdf-sans-echelle-imposee` (7 cas, **6 mutations, 6 rouges**) ;
    ce module n'avait jusqu'ici **aucun test de comportement**.
  - [x] **B10a · `ORDRE_NIV` — L'ORDRE DU PDF SE DÉRIVE DE L'ÉCHELLE** — LIVRÉ le 28 août 2026 (matin).
    La table `{ E:4, M:3, D:2, I:1, '0':0 }` de `synthese-retroaction-data.js` est **supprimée**. Elle
    servait à TROIS endroits du bilan **remis à l'élève** : le tri des défis (les deux « priorités »
    affichées), le choix de « ta force », et la ligne « Progrès : X → Y » avec la tendance du parcours.
    `ORDRE_NIV[code] || 0` ne levait pas — il rendait 0 : hors IDME, **tous les niveaux recevaient le même
    rang, en silence**. Les priorités étaient les deux premières du tableau au lieu des deux plus faibles,
    « ta force » revenait au premier critère saisi, et la ligne « Progrès » ne pouvait JAMAIS s'afficher.
    ⮕ Le rang vient de `niveauDuCodeDansEchelle`, le lecteur unique de #575 ; un code étranger à l'échelle
    n'a PAS de rang et l'appelant le dit (pas de force annoncée, pas de progrès mesuré, tri en fin de file).
    ⮕ **`echellesComparables` (`profil-etudiant-calculs.js`) est EXTRAIT, pas écrit** : la garde
    « même barème » livrée le 28 août dans `evaluation-retroaction.js` après la porte terrain 2.7 était
    nécessaire mot pour mot ici — la recopier aurait créé le patron de replis divergents que #555 constate
    ailleurs. Les deux modules la consomment ; la comparaison porte sur l'échelle RÉSOLUE (donc `idOriginal`
    dédoublonne une restauration), et une échelle introuvable reste une ABSENCE.
    ⮕ **Trouvaille de passage, corrigée** : le message « tous les critères sont maîtrisés depuis plus d'un
    artefact » nommait le niveau visé EN DUR — « vers le niveau É (transfert à d'autres contextes) », soit
    le nom ET la description SOLO du dernier niveau de l'échelle de Grégoire, dans un PDF remis aux élèves
    de qui que ce soit. Il se lit maintenant par le rang le plus haut ; sans échelle résolue, la phrase
    s'arrête au lieu de nommer.
    Sentinelle `sentinelle-575-b10-ordre-synthese-pdf` (16 cas, **12 mutations, 12 rouges**), montée sur des
    échelles qui REPRENNENT les lettres I/D/M/E **dans un autre ordre** — le seul montage où une table en dur
    et une lecture d'échelle donnent des réponses opposées.
  - [ ] **B10b · les six butées de #555 dans le même module** ⚠ **BUTE SUR #555** (rapport §3 n° 9).
    Ce qui RESTE après B10a, mesuré au grep le 28 août : **six sites, quatorze comparaisons** en toutes
    lettres — `=== 'I' || === 'D'` pour les défis (`:509`, `:682`, `:899`), `=== 'M' || === 'E'` pour
    « tous maîtrisés » (`:517`, `:528`, `:682`), et `!== 'M' && !== 'E'` dans `construireForce` (`:587`).
    ⚠ **Le `!==` compte autant que le `===`** : un motif en `===` seul rate un site entier, ce qui a
    produit une mesure fausse en écrivant la sentinelle. L'ORDRE se dérive d'une échelle ; « quel niveau est
    faible » et « quel niveau est maîtrisé », **non** — c'est la marque de maîtrise de #555. Le faire sans
    elle remplacerait un arbitrage codé en dur par un autre. ⮕ Un test CONSTATE le compte 6/14 et rougira
    quand #555 les retirera : **ne pas le « réparer » en changeant les chiffres.** ⮕ **À reprendre APRÈS
    #555**, avec les 8 lignes / 18 comparaisons jumelles d'`evaluation-retroaction.js`.
  - [x] **Lettre IDME rendue à l'écran** (rapport §3 n° 3) — LIVRÉ le 27 août 2026.
    `determinerLettreIDME` (`P >= 85 ? 'E' : …`) est retirée ; le bloc « Développement des habiletés » lit
    son niveau par `lireNiveauNoteGlobale` (`profil-etudiant-helpers.js`), **extrait** du site déjà corrigé
    au pas 3c-1 de #542 — les DEUX blocs du profil consomment la même règle, verrouillé par un test qui
    compte les appels. Le défaut réel était pire que « une lettre fausse » : le même élève lisait **deux
    niveaux différents pour la même note, sur la même page**. Sentinelle
    `sentinelle-575-niveau-note-globale-une-seule-regle` (8 cas, **7 mutations, 7 rouges**).
  - [x] **Badges et barres IDME rendus à l'écran** (rapport §3 n° 4, 5) — LIVRÉ le 27 août 2026.
    Les badges d'artefacts lisent la couleur du **code déjà enregistré, dans SON échelle**
    (`couleurDuNiveau`) : ils ne re-situent plus la note dans une échelle devinée, ce qui pouvait
    **contredire le code affiché dans le même badge**. L'artefact transporte désormais l'`echelleId` de son
    évaluation. Les barres de critères lisent l'échelle COMMUNE des évaluations de l'élève ; sans elle, fond
    neutre et cause au survol, jamais un dégradé « par défaut ».
    ⮕ **DEUX TROUVAILLES au passage, ni au plan SOLO ni à l'audit :**
    (a) une **SIXIÈME table IDME**, `_obtenirNiveauxEtGradientSRPNF` (`sections-affichage.js:3787`), jumelle
    mot pour mot de la cinquième — elle peignait le dégradé et la légende du bloc « Forces et défis », que
    l'audit cite pourtant en exemple de code proprement configurable (ses CRITÈRES le sont ; ses repères de
    couleur ne l'étaient pas). Les deux copies sont remplacées par un helper unique,
    `niveauxEtGradientDesEvaluations`.
    (b) la moitié du **constat §5.5** (injection CSS) : `couleurSure` était juste, mais **enfermée dans une
    fermeture locale** — les badges et les barres posaient `niveau.couleur` BRUT dans un `style`. Extraite en
    `couleurCssSure`, partagée, et testée (elle n'avait aucun test). Légende des barres échappée au passage.
    Sentinelle `sentinelle-575-couleurs-badges-barres` (13 cas, **11 mutations, 11 rouges**).
  - [ ] **⮕ SEPTIÈME site, TROUVÉ PAR LA SENTINELLE le 27 août — le graphique de progression devine encore
    l'échelle.** `genererGraphiqueProgression` (`profil-etudiant-sections-affichage.js:3400-3401`) lit
    `echelles.find(e => e.active) || echelles[0]` pour décrire ses zones colorées, et annonce **« Zones
    colorées basées sur l'échelle IDME par défaut »** quand il n'en trouve pas. Ni le plan SOLO ni l'audit ne
    l'avaient relevé. L'état connu est **verrouillé** par un test « exactement UNE occurrence restante » : il
    rougira le jour où on le corrigera, ce qui est le signal attendu. ⚠ Vérifier aussi les zones colorées du
    graphique lui-même (Chart.js), non auditées.
  - [x] **Bilan de rétroaction** (rapport §3 n° 10) — LIVRÉ le 28 août 2026.
    `_NOMS_NIV_BILAN` et `_ORDRE_NIV_BILAN` (`evaluation-retroaction.js`) sont retirées. Elles
    imposaient l'échelle de Grégoire au bilan **remis à l'élève** : hors IDME, le libellé du niveau
    s'affichait entre parenthèses VIDES, et le rang valait 0 pour tout le monde — la ligne
    « Progrès : X → Y » ne pouvait donc **jamais** apparaître, quelle que soit la progression réelle.
    Nom et rang se lisent désormais dans l'échelle de l'évaluation. ⮕ **Et le progrès ne se compare
    plus qu'à l'intérieur d'UNE MÊME échelle** : le 3ᵉ niveau d'un barème à cinq et le 3ᵉ d'un barème à
    trois ne disent pas la même chose. ⚠ **Sécurité** : le nom d'un niveau est saisi par l'utilisateur
    et traverse un `innerHTML` — trois échappements posés (nom du niveau + les deux noms de critères des
    lignes réécrites). L'en-tête du module affirmait « aucun innerHTML interpolé » : c'était faux depuis
    l'origine, la mention est corrigée et les autres sites restent à traiter.
  - [x] **`convertirNoteEnValeur`** (rapport §3 n° 11) — TRAITÉ le 28 août 2026, PAR SUPPRESSION.
    Elle portait une **échelle ancienne où `I = 3`**, qui contredit IDME — mais elle était MORTE : son
    unique appelant `obtenirTendance` n'était atteint que par `genererDetailsEtudiant`, sous
    `afficherListeEvaluations`, qui sort immédiatement faute de `conteneur-evaluations-accordeon` —
    identifiant qui n'existe nulle part dans le dépôt. ⮕ **Décision de Grégoire (28 août) : supprimer
    toute la chaîne.** La vue « accordéon » des évaluations, remplacée par le tableau de
    `liste-evaluations.js`, est retirée : **12 fonctions, 584 lignes** (`evaluation.js` passe de 3894 à
    3295 lignes), plus `restaurerPreferenceTri` (sans appelant), la variable de module
    `donneesEvaluationsFiltrees`, 4 exports `window`, 3 appels de rafraîchissement devenus sans effet,
    et l'entrée `'evaluations-liste-evaluations'` de `modes.js` — clé qui n'a jamais pu s'appliquer,
    `sousSectionActive` portant l'id du DOM (`evaluations-liste`).
    ⮕ **DEUX DOUBLONS `window` DISPARAISSENT AVEC ELLE**, et c'est le patron
    `feedback-double-definition-window-derniere-gagne` : `trierListeEvaluations` et
    `rechargerFiltreProduction` étaient définis dans les DEUX modules, et `evaluation.js` étant chargé
    APRÈS `liste-evaluations.js`, **c'était la version morte qui gagnait**. Effet visible du retrait :
    `window.rechargerFiltreProduction` résout maintenant vers la version de `liste-evaluations.js`,
    celle qui **exclut le portfolio** du filtre « Production » — la version d'`evaluation.js` le
    laissait entrer et réécrivait le select en écrasant la sélection en cours.
    Sentinelle d'exports `refactor-evaluation.test.js` mise à jour avec la raison du retrait.
  ⚠ **Ce que ce lot ne rouvre pas** : le rabotage `startsWith('francais')` (**#553**), les seuils `idme.*` du
  dépistage de risque (**#551**), la marque de maîtrise (**#555**). Ne pas ajouter de site de rabotage en
  chemin — s'il en faut un, il est partagé, pour que #553 n'ait qu'un endroit à corriger.
  **Fin** : plus aucun jeu de valeurs IDME en dur sur un chemin vivant ; `grep` à l'appui ; chaque pas porte
  sa sentinelle avec break-test rouge vérifié.
  ⮕ **ÉTAT AU 28 AOÛT 2026, MATIN (9 h) : B10 est SCINDÉ et sa moitié « ordre » est LIVRÉE.** Ce qui
  reste du lot 4 est **B10b SEUL** — les six sites / quatorze comparaisons de la marque de maîtrise —, et
  il **BUTE SUR #555**. Vitest **3796/3796** (356 fichiers) après B10a, lue après le dernier changement.
  ⮕ **La leçon de B10a, pour #555** : la butée n'était pas là où l'item la plaçait. `ORDRE_NIV` (l'ordre)
  et les comparaisons littérales (la marque) vivaient dans les mêmes lignes, mais ne dépendent PAS de la
  même décision — l'un se dérive des plages de l'échelle, l'autre non. **Avant de reporter un item
  entier sur une décision, vérifier ce qui, dedans, n'en dépend pas.**
  ⮕ Tous les autres pas du lot 4
  sont livrés ou clos par écart de prémisse. Sentinelle du 28 août :
  `tests/unit/sentinelle-575-ordre-niveaux-derive-echelle.test.js` — **23 cas, 14 mutations, 14 rouges**,
  restauration vérifiée à chaque fois. ⚠ **Une butée de même nature que B10 subsiste dans
  `evaluation-retroaction.js`** : le module teste les codes EN TOUTES LETTRES à **huit lignes / 18
  comparaisons** (`=== 'I' || === 'D'` pour les défis, `=== 'M' || === 'E'` pour « tous maîtrisés »).
  L'ORDRE se dérive d'une échelle ; « faible » et « maîtrisé », non. Un test CONSTATE ce compte de 18 :
  il rougira le jour où **#555** les retirera, et c'est le signal voulu.

- [x] **#576 — Le bilan de rétroaction est VIDE quand la grille d'origine est introuvable, alors que le panneau d'à côté sait s'en passer.**
  **Trouvé par la porte terrain 2.6 du 28 août 2026, sur les données réelles d'H2026 de Grégoire** (captures
  à l'appui, artefacts 8 et 10 de Benjamin A.). ⚠ **Ce n'est PAS une régression de #575** : le chemin
  est intact depuis l'origine ; la porte l'a seulement mis sous les yeux.
  **Symptôme** : la vue « Bilan » affiche son entête (« Mes standards sont très élevés… », « Selon toi,
  quel aspect… », « Présentement, il faut se concentrer sur : ») puis **RIEN**, et saute directement aux
  jetons. Aucun défi, aucune force, aucun progrès — alors que le panneau ÉVALUATION voisin affiche
  parfaitement les quatre critères (Structure M, Rigueur M, Plausibilité D, Nuance D) et la note (70 %, D).
  **Cause, lue au code** : `_chargerGrilleDefBilan(grilleId)` (`evaluation-retroaction.js`) cherche la
  grille dans `grillesTemplates` et rend `null` quand elle n'y est plus. `_collecterCriteresBilan` exige
  `grilleDef && grilleDef.criteres` : sans elle, il rend `[]`. Tout le bilan personnalisé en découle —
  `defis` vide, `tousMaitrises` faux (il exige `criteres.length > 0`), `_rendreForceBilan` sans matière.
  ⮕ **LA DONNÉE EST LÀ, ET LE VOISIN LA LIT DÉJÀ.** L'évaluation enregistrée porte ses critères avec leur
  NOM (`criteres: [{critereId, critereNom, niveauSelectionne}]`), et `evaluation.js` a un repli explicite
  pour ce cas exact : bannière « Grille d'origine introuvable dans les modèles actuels — affichage depuis
  les données sauvegardées » (`:1158`, `:1426`). Le bilan n'a jamais eu ce repli.
  **LIVRÉ le 28 août 2026.** `_chargerEvaluationEnregistreeBilan` retrouve l'évaluation sauvegardée (par
  `idModification`, sinon par élève + production, en écartant les remplacées) et `_collecterCriteresBilan`
  y lit les NOMS des critères quand la grille manque — la même source que le panneau voisin, pas une
  seconde lecture. ⮕ **Les noms viennent de l'enregistrement, les niveaux du FORMULAIRE** : le nom est figé
  à la sauvegarde, le niveau est celui que l'enseignant·e a sous les yeux et vient peut-être de changer.
  ⮕ Le repli couvre aussi la grille PRÉSENTE dont plus aucun identifiant ne correspond (critères recréés) :
  même symptôme, même remède. La règle tient en une phrase — le bilan lit la grille quand il le peut, et
  l'évaluation enregistrée sinon.
  ⮕ **Le silence est traité, mais PAS comme l'annonçait la première rédaction de cet item.** Elle disait
  « le bilan dit pourquoi, comme le fait la bannière » : **c'était faux, et dangereux**. Vérifié au code :
  `copierToutRetroaction` copie le `textContent` de ce bloc sous « === BILAN === » dans ce qui est remis à
  l'élève — une note d'anomalie serait partie avec. La bannière du panneau voisin prévient déjà
  l'enseignant·e, c'est le bon endroit. Le bilan rend désormais une phrase écrite POUR L'ÉLÈVE quand rien
  n'est évaluable (« Aucun critère n'est encore évalué pour cette production. »), qui constate sans nommer
  d'anomalie — au lieu d'un titre suivi du vide.
  ⚠ **UN SECOND POINT D'INJECTION, OUVERT PAR LE REPLI LUI-MÊME ET TROUVÉ PAR LA SENTINELLE.** Dans
  `_rendreDefisBilan`, `desc` vaut la description du critère OU, à défaut, son NOM — et le repli ne
  fournit aucune description, donc le nom passait par une branche restée non échappée. Échappé. Trouvé par
  le test, pas par relecture.
  Sentinelle `sentinelle-576-bilan-sans-grille-origine.test.js` — **11 cas, 7 mutations, 7 rouges**,
  restauration vérifiée. Le banc rejoue le cas réel : échelle « IDME et niv 0 (restaurée) », grille
  `GR_DISPARUE`, les quatre critères des captures. Vitest **3778/3778** (355 fichiers).

- [x] **#573 — Après « Enregistrer », la cartouche ouverte est REMPLACÉE par une cartouche neuve, et l'autosave #517 devient muet.** — **LIVRÉ le 28 août 2026**
  ⮕ **LA CAUSE.** `sauvegarderCartouche` appelait `chargerCartouchesRetroaction()`, qui se termine par
  `initialiserNouveauCartouche()` : `cartoucheActuel` devenait une cartouche NEUVE jamais écrite, nom et
  contexte vidés. La ligne suivante lisait `cartoucheActuel.id` — donc l'id neuf, absent des options — et
  le `<select>` retombait sur « -- Nouvelle cartouche -- ». **Le paramètre `cartoucheIdAGarder` rouvre
  désormais la cartouche enregistrée**, par `chargerMatriceRetroaction`, le chemin d'ouverture DÉJÀ
  existant. Après une SUPPRESSION, l'appel reste sans argument : là, rouvrir une neuve est le bon geste.
  ⮕ **LE FILET, ET IL COMPTE AUTANT.** Les DEUX appelants de `persisterCartouchePartielle` ignoraient son
  verdict : elle rendait `false` — cartouche absente de la base — et la frappe disparaissait sans un mot.
  `signalerAutosaveCartoucheMuette` avertit maintenant, **une fois par cartouche** (le drapeau mémorise un
  id, donc il se réarme seul en changeant de cartouche ; deux remises à zéro explicites ont été retirées,
  le break-test les ayant montrées SANS EFFET). Avertir à chaque frappe aurait été le harcèlement que
  #517 refuse justement pour le nom.
  ⮕ **Le repli `niveauxDefaut` (rapport §3 n° 18) est SUPPRIMÉ** : les plages I/D/M/E de Grégoire
  devenaient les colonnes de la cartouche de n'importe qui dès que `echellesTemplates` était vide — et une
  matrice est indexée par `niveau.code`, donc ces colonnes sont la structure du document. Sans échelle,
  aucune colonne n'est inventée.
  ⮕ Sentinelle `sentinelle-573-cartouche-reste-ouverte` (11 cas, **10 mutations, 10 rouges**) + spec
  **WebKit** `cartouche-enregistrer-reste-ouverte.spec.js` (**4 mutations, 4 rouges**) — l'audit notait
  « reproduit en harnais Node, non vérifié en navigateur » ; ce n'est plus le cas.
  ⏳ **CE QUI RESTE, INSCRIT À PART : #578** (le choix de l'échelle d'une cartouche neuve).

- [ ] **#581 — La rétroaction de français parle d'EUF et du CAF à tout le monde.** (rapport du 27 août, §3 n° 12)
  ✅ **ARBITRÉ PAR GRÉGOIRE le 28 août 2026 — option A : CONFIGURABLES, en couche 2**, comme SRPNF et
  les autres concepts pédagogiques.
  ⮕ Sa règle de conception, dans ses mots : « *La rétroaction est envoyée à chaque élève individuellement
  et elle devrait être personnalisée le plus possible. Quand on ne peut pas le faire, on renvoie à
  l'enseignant·e avec un message du genre « Viens me voir »…* »
  ⮕ **Le repli n'est donc PAS un dispositif générique** (« le centre d'aide de ton établissement »), c'est
  un **renvoi à l'enseignant**. L'option C est écartée pour cette raison.
  ⚠ **L'ÉNONCÉ CI-DESSUS EST PLUS ÉTROIT QUE LE DÉFAUT — mesuré le 28 août.** Il ne s'agit pas seulement
  d'EUF et du CAF dans la rétroaction de français : `pratique-sommative.js` sert « Référence aux services
  de soutien (SA, CAF, etc.) », « Services adaptés (SA) », « Centre d'aide (CAF) », « Mentorat par les
  pairs » et « Jeton de reprise disponible » comme **stratégies et ressources du dépistage RàI**, à tout
  utilisateur, quels que soient sa discipline et son établissement.
  Créé le 28 août 2026. `evaluation-calcul.js` écrit « En prévision de l'**EUF** », « erreurs de
  **français** », « Centre d'aide en **français** (CAF) » et des seuils de 100/75/60/30 mots par erreur.
  ⮕ **Ce n'est pas un seuil mal placé, c'est une DISCIPLINE écrite dans le moteur.** L'Épreuve uniforme
  de français et le CAF n'existent que pour un cours de français au collégial québécois. Un·e collègue
  de biologie qui active le comptage d'erreurs reçoit une rétroaction qui parle d'un examen que ses
  élèves ne passeront jamais.
  ⚠ **Distinct de #553** (le rabotage `startsWith('francais')`), qui porte sur l'identification du
  critère, pas sur le TEXTE produit.
  ⏳ **DÉCISION REQUISE avant tout code** : ces textes deviennent-ils (a) configurables par pratique,
  (b) génériques (« l'épreuve de fin de programme », « le centre d'aide »), ou (c) assumés comme
  propres au français et masqués hors de ce contexte ? C'est du microcopy remis à l'élève.

- [ ] **#582 — Le devis lit « théorie + labo » comme un nombre de PÉRIODES.** (rapport du 27 août, §3 n° 14)
  Créé le 28 août 2026. `trimestre-v2-horaires.js:211` : `return { periodes: pond.theorie + pond.labo }`.
  ⮕ **Vrai au Cégep de Drummondville, faux ailleurs.** La pondération d'un devis ministériel compte des
  HEURES-CONTACT par semaine ; les lire comme un compte de périodes suppose qu'une période dure une
  heure. C'est le cas ici, ce n'est pas une règle générale du réseau.
  ⚠ **Chemin vivant** : le recoupement horaire ↔ devis (#540 lot D). Le reste de la fonction dérive
  correctement ses périodes des heures de séance (`periodesDeLaSeance`) — c'est ce seul point de
  comparaison qui suppose l'équivalence.
  ⏳ Faible priorité tant que Grégoire est le seul utilisateur ; à ressortir avant tout élargissement
  hors de son cégep.

- [ ] **#579 — L'échelle embarquée d'une pratique configurable ne peut PAS recevoir ses repères de maîtrise.**
  ✅ **LIVRÉ POUR LE CAS DE L'ASSISTANT le 28 août 2026 (soir), par #577.** MESURÉ au code : l'assistant
  n'embarque JAMAIS d'échelle — il écrit `configuration.echelleId`, une RÉFÉRENCE vers
  `echellesTemplates`. Les repères d'une pratique créée par l'assistant vivent donc sur l'échelle
  référencée, posables dans l'assistant (#577) et dans l'éditeur d'échelle.
  ⚠ **CE QUI RESTE** : la forme **legacy `config.echelle`** (échelle EMBARQUÉE, lue par
  `_echelleDePratiqueConfigurable`, `_resoudreEchellePratique` et trois sites d'`evaluation-*.js`).
  Aucun écrivain dans le code applicatif : `grep` ne trouve `config.echelle =` nulle part, seul le pack
  démo porte une `echelle` (au niveau racine de la pratique, pas sous `config`). C'est donc un chemin
  de **données anciennes ou importées**, pas un chemin vivant de création. ⮕ À traiter avec **#580**
  (les deux reconstructions à liste blanche), qui touche exactement ces sites.
  ✅ **ARBITRÉ PAR GRÉGOIRE le 28 août 2026 — option A : dans l'assistant de configuration** de la
  pratique, ce qui rejoint #577.
  ⮕ Sa précision, qui élargit l'item : « *Une fois configuré avec l'assistant, les données et les
  décisions sont modifiables dans le gabarit de la pratique (ou de l'échelle).* » Il ne s'agit donc pas
  seulement de poser les repères à la CRÉATION — ils doivent rester modifiables après coup, dans le
  gabarit. Un assistant qui ne les demanderait qu'une fois ne répondrait qu'à la moitié de la demande.
  Créé le 28 août 2026, ouvert par #555 lot 2. Le bloc « Repères de maîtrise » vit dans l'éditeur des
  échelles du trimestre (`afficherNiveauxEchelle`, sur `echellesTemplates`). Une échelle embarquée dans
  une pratique configurable vit ailleurs — `pratiquesConfigurables[].config.echelle`, lue par
  `_echelleDePratiqueConfigurable` — et **aucun écran ne permet d'y poser les deux repères**.
  ⮕ **Conséquence mesurable** : pour toute évaluation produite sous une pratique configurable,
  `zoneDuNiveau` rend `null`. Donc pas de priorités, pas de « ta force », pas de « tous maîtrisés »
  dans le PDF remis à l'élève. **Visible, pas silencieux** — mais c'est un trou réel, et c'était le cas
  qui tombait déjà systématiquement sur le repli avant #542 A2.
  ⏳ À traiter avec (e) du lot 2 : l'assistant (#577) touche la même zone.

- [ ] **#580 — Deux reconstructions d'échelle à liste blanche dans `evaluation-chargement.js`.**
  Créé le 28 août 2026, relevé pendant #555 lot 2. `evaluation-chargement.js` fabrique DEUX objets
  échelle à partir d'une pratique configurable, en ne gardant que `id`, `nom`, `niveaux`, `type`,
  `source`. Ce sont des chemins PARALLÈLES de résolution — le patron que #542 A2 a défait ailleurs.
  ⚠ **Ils ne cassent pas `zoneDuNiveau`**, qui passe par `obtenirEchelleResolue` (lequel rend l'échelle
  telle quelle). Ce n'est donc pas urgent. Mais tout champ métier neuf sur une échelle est amputé sur
  ces deux chemins, sans que rien ne le dise — la même famille que le défaut de `dupliquerEchelle`
  corrigé au lot 2.
  ⮕ **Geste** : les faire passer par `obtenirEchelleResolue`, ou dire pourquoi ils ne le peuvent pas.

- [ ] **#583 — Partager une échelle la prive de ses deux repères de maîtrise, à l'ÉMISSION.**
  ✅ **ARBITRÉ PAR GRÉGOIRE le 28 août 2026 — option A : faire évoluer le format en `v2`,
  avec lecture des DEUX versions.** L'extension tolérante de `v1` est écartée : la
  fermeture du format est une défense, on ne la retire pas pour deux champs.
  ⮕ **CE QUE ÇA NE TRANCHE PAS, et c'est une contrainte de DÉPLOIEMENT, pas de code** :
  une `v2` qui lit les paquets `v1` règle la moitié du problème. L'autre moitié est qu'un
  paquet `v2` arrivant chez un utilisateur resté en `v1` sera REFUSÉ — le format rejette
  l'inconnu à l'entrée, c'est précisément ce qu'on a choisi de garder. Il faut donc décider
  ce que voit cet utilisateur-là : un refus explicite, ou rien.
  Créé le 28 août 2026, audit `Rapports/AUDIT-copies-echelle-reperes-2026-08-28.md` §5.
  `projeterEntite` (`partage-format.js:137`) ne copie que les champs déclarés au schéma fermé
  `SCHEMA_ENTITE.echelle` (`partage-schemas.js:225`), qui connaît `valeurCalcul` et `config` mais
  **pas `seuilSuffisance` ni `seuilMaitrise`**. Le paquet part sans eux ; ni l'émetteur ni le
  destinataire ne voient d'anomalie.
  ⚠ **Ce n'est pas une ligne à ajouter.** Le format se dit fermé et REJETTE tout champ inconnu à
  l'entrée : ajouter les repères au schéma fait évoluer `labo-codex-partage-v1`, et un paquet produit
  après ne se lira pas comme un paquet produit avant. **Décision de format due par Grégoire.**
  ⮕ Le même schéma ignore aussi `niveauSOLO` sur les niveaux d'échelle — à trancher dans le même geste.

- [ ] **#584 — L'export au format recherche ne dit pas où sont posés les repères.**
  ✅ **ARBITRÉ PAR GRÉGOIRE le 28 août 2026 — option A : les deux repères PARTENT dans
  l'export.** Il accepte qu'un fichier exporté avant et un fichier exporté après ne portent
  pas les mêmes champs.
  ⮕ **CE QUE ÇA NE TRANCHE PAS** : les analyses déjà produites à partir des exports
  antérieurs ne portent pas cette donnée et ne la porteront jamais. Si une comparaison
  longitudinale les mêle aux nouveaux, l'absence de repère sur les anciens se lira comme
  « aucun repère posé » et non comme « champ absent du format ». À dire dans le fichier
  lui-même (une version de format), pas seulement dans la documentation.
  Créé le 28 août 2026, audit §6. `exporterFormatRecherche` (`trimestres.js:1872`) projette
  `{id, nom, niveaux: [{code, nom, min, max, valeur_calcul, niveau_solo}]}` — sans les deux repères.
  Rien n'est perdu en base : c'est un choix de CONCEPTION sur ce que les fichiers de recherche
  contiennent.
  ⮕ **L'argument qui le réclame est déjà écrit dans le commentaire au-dessus du bloc** : les plages et
  l'étiquette SOLO partent « parce que sans elles un code de niveau reste illisible ». Sans les repères,
  le fichier ne dit pas non plus où l'enseignant a placé la suffisance et la maîtrise — la donnée même
  que #555 lot 1 a rendue explicite. ⏳ Décision, pas correctif.

- [ ] **#585 — 🔒 `assainirChaine` TRONQUE avant de retirer les balises : un `<` traverse le filtre.**
  ✅ **ARBITRÉ PAR GRÉGOIRE le 28 août 2026 — option B : INVERSER, avec une passe de
  vérification sur TOUS les types importés avant de livrer.**
  Le geste de code est d'une ligne — assainir PUIS tronquer, au lieu de l'inverse. Ce qui
  est décidé, c'est de ne pas le livrer seul : `assainirChaine` est appelée par tous les
  schémas d'import, et le 28 août au matin, renforcer `echapperHtml` a cassé un affichage
  dans l'heure (le résultat allait dans un `textContent`, qui échappe déjà).
  ⮕ **CE QUE ÇA NE TRANCHE PAS** : rien n'est dit des champs à `maxLen` élevé, où la
  troncature ne mord jamais — la passe de vérification dira s'il y en a. Ni du cas
  symétrique (une chaîne assainie PUIS tronquée peut couper au milieu d'une entité HTML
  `&amp;` et produire `&am`) : à mesurer pendant la passe, pas à supposer.
  Créé le 28 août 2026, trouvé en écrivant la sentinelle de transport des échelles (audit §12).
  `import-export.js:365-371` fait `substring(0, maxLen)` PUIS `replace(/<[^>]*>/g, '')`. Une balise
  coupée par la troncature perd son `>` et le filtre ne mord plus.
  ⮕ **Mesuré** : `'<img src=x onerror=alert(1)>M'` (29 car.) avec `maxLen: 20` ressort
  **`'<img src=x onerror=a'`**. Champs les plus exposés : `code` (20), `couleur` (30), `notePassage`
  (20), les deux repères (20), `niveauSOLO` (50).
  ⚠ **Pas une faille par soi** — il faut encore que le champ parte dans un `innerHTML`. Mais c'est la
  fonction que TOUS les schémas d'import appellent.
  ⚠ **Ne pas inverser les deux lignes sans mesurer** : ça touche l'assainissement de chaque type
  importé, et la leçon du 28 août au matin est fraîche (renforcer `echapperHtml` a cassé un affichage
  qui allait dans un `textContent`). **Décision due.**

- [ ] **#586 — Trois chemins de duplication d'échelle sur quatre emportent `idOriginal` ; le quatrième s'en protège exprès.**
  ✅ **ARBITRÉ PAR GRÉGOIRE le 28 août 2026 — option B : traiter les CINQ FAMILLES
  ensemble, au titre de #476** (grilles, cartouches, productions, pratiques, échelles), pas
  les échelles seules.
  ⚠ **LE PÉRIMÈTRE CHANGE DE TAILLE.** Ce n'est plus « aligner trois fonctions de
  duplication d'échelle » mais reprendre les cinq `dupliquerX` et leurs neuf écarts déjà
  recensés par #476. Ne pas l'ouvrir comme une retouche.
  ⮕ **CE QUE ÇA NE TRANCHE PAS** : lesquels des neuf écarts sont des DIVERGENCES à réduire
  et lesquels sont des différences légitimes entre familles. #476 les recense sans les
  qualifier ; `idOriginal` est le seul dont la mesure est faite (audit du 28 août, §7).
  Créé le 28 août 2026, audit §7. À rattacher à **#476** (les neuf écarts entre familles de duplication)
  et à **#542**.
  `dupliquerEchelle` (`echelles.js:378`) emploie une liste blanche PRÉCISÉMENT pour ne pas emporter
  `idOriginal`, et sa sentinelle #555 vérifie `expect(copie.idOriginal).toBeUndefined()`. Mais
  `dupliquerEchelleDepuisSidebar` (`:3957`, `{...echelle}`), `dupliquerEchelleActive` (qui y délègue) et
  `dupliquerVersBibliotheque` (`bibliotheque-ui.js:576`, `Object.assign`) l'emportent — ils suppriment
  `metadata_cc` et `auteurOriginal`, **pas `idOriginal`**.
  ⮕ **Scénario atteignable** : `ajouterEchelleIndividuelle` (`:2373`) POSE `idOriginal` sur toute échelle
  ajoutée depuis la bibliothèque ; la dupliquer ensuite par la barre latérale produit deux entrées
  portant le même `idOriginal`, et `obtenirEchelleResolue` (`profil-etudiant-calculs.js:129`) résout par
  `e.id === id || e.idOriginal === id` — **le premier du tableau gagne**.
  ⮕ Une même famille de gestes, quatre implémentations, deux doctrines opposées sur le même champ.
  Ce n'est pas un arbitrage : c'est une divergence.


- [ ] **#590 — Trois résolveurs d'échelle qui ne reconnaissent pas les mêmes identifiants.**
  Créé le 28 août 2026. Audit : `Rapports/AUDIT-copies-echelle-reperes-2026-08-28.md`, §8.
  ✅ **ARBITRÉ PAR GRÉGOIRE le 28 août 2026 — option A, avec sa note : « Rien codé en dur ! »**
  ⚠ **MAIS LE CHANTIER NE S'OUVRE PAS AVANT UNE MESURE.** Grégoire lance lui-même
  `_diagnostiquerResolutionEchelles()` (livré ce jour, `profil-etudiant-calculs.js`). Tant
  que ce chiffre n'existe pas, réconcilier les résolveurs serait travailler sur une
  hypothèse : la divergence peut être entièrement théorique sur ses données.
  **LE FAIT MESURÉ.** La divergence est CROISÉE, chacun sait ce que l'autre ignore :
  `obtenirEchelleResolue` connaît `idOriginal` et les identifiants `pratique-*`, refuse une
  échelle sans niveaux, sait déduire s'il n'y en a qu'une — mais ne fait PAS le repli pool
  inter-trimestre ; `resoudreModeleParId` fait le repli pool — mais ne compare que `m.id`.
  **PÉRIMÈTRE : DEUX SITES**, et l'échec n'y coûte pas la même chose. `consolidation.js`
  (`_detecterEchelle`) : la map de conversion reste vide et la matrice ne calcule RIEN.
  `pratique-registre.js` (`construireConfigComplete`) : repli sur une échelle IDME **codée
  en dur** (50/65/80/95) qui contredit celle de l'utilisateur — c'est ce que sa note vise.
  ⮕ **CE QUE ÇA NE TRANCHE PAS** : si l'écart touche ses données, faut-il réconcilier les
  résolveurs ou réparer les données ? Le diagnostic nomme la cause de chaque écart
  (`idOriginal`, `echelle-de-pratique`, `pool-inter-trimestre`) ; la réponse en dépend.

- [ ] **#591 — 🔒 Anonymisation : réversible ou irréversible ?**
  Créé le 28 août 2026, depuis le skill `securite-donnees` §3.1, où la question est ouverte.
  ✅ **POSITION PRISE PAR GRÉGOIRE le 28 août 2026 — option A : pseudonymisation
  RÉVERSIBLE**, table de correspondance chiffrée conservée sur sa machine, lui seul peut
  inverser. Motif pratique : pouvoir retrouver « Étudiant-007 » pour corriger une erreur.
  ⚠⚠ **CE N'EST PAS UNE DÉCISION CLOSE, ET C'EST LE SEUL DES VINGT ET UN DANS CE CAS.**
  Le cadre dit « à trancher avec les contacts Loi 25 ». Sa réponse **prépare cette
  conversation, elle ne la remplace pas** : le choix a des conséquences juridiques, pas
  seulement techniques. ⮕ Lire cet item comme « position à valider », jamais comme
  « décidé » — quelqu'un qui le relira dans six mois doit trouver la nuance ici, pas dans
  un fil de discussion.
  ⮕ **CE QUE ÇA NE TRANCHE PAS** : où vit la table de correspondance, comment elle est
  chiffrée, ce qu'il advient d'elle si la machine est perdue — et si « lui seul » tient
  encore quand un fichier anonymisé circule vers un tiers qui, lui, n'a pas la table.

- [ ] **#592 — Le mode « par objectifs » de `pratique-notation-v2.js` est mort, et il porte encore le mot `seuilMaitrise`.**
  Créé le 28 août 2026 pendant #555 (d). Bloque la clôture propre du nommage : c'est l'**exception
  nommée** du cliquet `sentinelle-555-d-seuil-maitrise-un-seul-sens` (4 occurrences tolérées).
  **MESURÉ** : la section « GESTION PAR-OBJECTIFS » (l. 245-~657, `CONFIG_PAR_OBJECTIFS_DEFAUT`,
  `chargerConfigParObjectifs`, `chargerParametresMode`, `sauvegarderModeCalculObjectifs`…) n'est
  atteinte que si `#v2-config-par-objectifs` existe — **0 occurrence dans `index.html`**, de même que
  `v2-objectifs-mode-calcul`, `v2-config-mode-comptage`, `v2-comptage-seuil-maitrise`. Le mode a été
  retiré par #435 (« le moteur ne la lit plus ») et normalisé en lecture par #443. Le `seuilMaitrise: 75`
  qui y vit est un POURCENTAGE 0-100 : le quatrième sens du mot, qu'on ne renomme pas parce qu'on ne
  renomme pas du code mort — on le retire (`feedback-verifier-consommateurs-avant-brancher`).
  ⮕ **Geste** : mesurer les appelants de chaque fonction de la section (dont l'export
  `window.chargerConfigParObjectifs`, l. 1217, et l'appel l. 171 gardé par un `getElementById` qui rend
  `null`), retirer fonction par fonction — **jamais par plage** (`feedback_nettoyage_par_zone_dangereux`)
  —, puis **retirer la ligne `js/pratique-notation-v2.js` de `EMPLOIS_CONNUS`** dans la sentinelle : le
  cliquet rougit si on l'oublie, c'est voulu. Une config `modalites.parObjectifs` déjà stockée n'est ni
  relue ni réécrite (#443) : rien à migrer.

- [ ] **#587 — Neuf autres fonctions sont définies deux fois et posées deux fois sur `window`.**
  ✅ **ARBITRÉ PAR GRÉGOIRE le 28 août 2026 — option A : DÉDUPLICATION PAR DÉFAUT.** Un nom, une
  définition ; l'alias devient l'exception justifiée. C'est la règle zéro-dette appliquée aux globaux.
  ⚠ **CE QUE LA DOCTRINE NE TRANCHE PAS** : elle dit qu'un des deux corps doit partir, **pas lequel des
  deux gestes s'applique**. Déduplication et retrait de carcasse ont le même résultat sur `window` et
  pas du tout le même sens dans le code. Chaque paire demande donc sa mesure.
  ⮕ Conséquence immédiate : `modifierEvaluationParId` (`evaluation.js:2976`) passe de « précédent à
  suivre » à **cas à traiter** — son commentaire annonce un conflit qui n'existe plus depuis `26be0d9b`.
  8 appelants dans 4 fichiers : ce n'est pas un geste de passage.

  ⚠⚠ **`creerNouvellePratique` — MESURÉ LE 28 AOÛT AU SOIR, ET CE N'EST NI L'UNE NI L'AUTRE HYPOTHÈSE.**
  Les deux fonctions ne font pas la même chose : la courte (`pratiques.js`, 257 car.) ouvre l'assistant
  V2 — c'est ce que le bouton « + Nouvelle pratique » déclenche ; la longue (`pratiques-gestion.js`,
  2593 car.) crée directement une pratique PAN-Standards préconfigurée, **sans assistant** (identité CC,
  `metadata_cc`, portfolio n-meilleurs).
  ⮕ **ET LA LONGUE N'A JAMAIS PU S'EXÉCUTER — PAS UNE FOIS.** L'ordre de chargement a été lu à quatre
  époques : `600a42fc` (2 janv.), `b70861bf` (8 mai), `a6f84f5b` (11 mai), `HEAD` — la courte gagne
  partout. `pratiques.js` posait le nom depuis le **25 novembre 2025** ; la longue a été écrite le
  **2 janvier 2026** sur un nom déjà pris, dans un fichier chargé AVANT. Aucun appelant interne.
  ⮕ **Quelqu'un l'a ensuite CORRIGÉE trois semaines plus tard** (« FIX v3, 20 janvier 2026 :
  localStorage comme source principale ») **sur du code qui n'avait jamais tourné.** C'est le coût réel
  de ce motif : la collision de noms ne casse rien — elle fait travailler dans le vide.
  ⮕ **Geste : RETRAIT**, et sans risque de régression : on ne casse pas ce qui n'a jamais tourné.
  ⚠ **RÉSERVE POUR GRÉGOIRE, non levée** : la longue faisait quelque chose que la courte ne fait pas —
  créer une pratique en un clic, sans assistant. Si cette intention est encore désirée, elle est à
  **reconstruire, pas à récupérer**. Rien n'est perdu du COMPORTEMENT (il n'y en a jamais eu) ; l'intention,
  elle, a existé.
  ⮕ **MÉTHODE POUR LES HUIT AUTRES PAIRES** : lire l'ordre de chargement **à l'époque où la perdante a
  été écrite**, pas seulement aujourd'hui. C'est ce qui distingue une fonction *devenue* morte d'une
  fonction **morte-née** — et le geste n'est pas le même.
  ✅ **DOCTRINE TRANCHÉE PAR GRÉGOIRE le 28 août 2026 — OPTION A : DÉDUPLICATION PAR DÉFAUT.**
  Un nom, une définition. C'est la règle zéro-dette appliquée aux globaux. **L'alias à l'exposition
  devient l'exception**, qui doit se justifier au cas par cas — il n'est plus un patron à imiter.
  ⮕ **Conséquence sur le précédent décrit plus bas** : `modifierEvaluationParId` passe de « précédent
  à suivre » à **cas à traiter**. Son commentaire annonce un conflit disparu depuis `26be0d9b` ;
  sous la doctrine A, l'alias n'a plus de justification. ⚠ 8 appelants dans 4 fichiers — c'est un
  chantier, pas une retouche.
  ⚠ **CE QUE LA DOCTRINE NE TRANCHE PAS** : elle dit qu'un des deux corps doit partir, pas LEQUEL ni
  COMMENT. Pour `creerNouvellePratique`, si la version courte est un remplacement délibéré, le geste
  est un **RETRAIT de carcasse** (zéro-dette), pas une déduplication — deux chantiers différents.
  La question se règle par l'historique : `git log -S ouvrirWizardV2 -- js/pratiques.js`.
  Créé le 28 août 2026 en écrivant le cliquet de **#557**, qui est le dixième cas de ce motif —
  et le seul traité. Voir aussi **#575**, qui en avait retiré deux (`trierListeEvaluations`,
  `rechargerFiltreProduction`).
  **LE MOTIF** : deux modules exposent une fonction sous le même nom sur `window`. Le dernier chargé
  gagne, en silence. Un grep sur la DÉFINITION ne montre rien d'anormal — il faut greper l'EXPOSITION,
  et croiser avec l'ordre de chargement d'`index.html`.
  ⚠ **LE PREMIER COMPTAGE DISAIT SIX, ET IL ÉTAIT FAUX.** Le détecteur ne cherchait que
  `window.X = X;` — la forme « référence à une fonction nommée ». Il manquait `window.X = function`
  et `window.X = async function` : **133 expositions** dans `js/`, et trois doublons entiers
  (`_apresOuvertureFichier`, `afficherSection`, `afficherSousSection`).
  ⮕ *Un grep compte des occurrences ; il ne connaît pas les synonymes* — la même leçon que l'audit
  des copies d'échelle du même jour, sur un autre motif. **Vérifié depuis** : `Object.assign(window, …)`
  et `window[nom] = …` n'existent pas dans `js/` (les quatre `window[x]` sont des LECTURES de dispatcher).
  **LES NEUF PAIRES, mesurées le 28 août** (taille des corps en caractères ; « gagne » = posé en
  dernier sur `window`) :

  | Fonction | Gagne `window` | Perd | Écart |
  |---|---|---|---|
  | `creerNouvellePratique` | `pratiques.js` (l.14489) · 257 | `pratiques-gestion.js` (l.14427) · 2593 | **×10** |
  | `afficherTableauProductions` | `productions.js` (l.14436) · 4479 | `donnees-v2.js` (l.14429) · 3029 | ×1,5 |
  | `evaluerProduction` | `evaluation.js` (l.14596) · 1825 | `profil-etudiant-actions.js` (l.14504) · 948 | ×1,9 |
  | `listerTrimestresAvecGrilles` | `grilles.js` (l.14441) · 1414 | `grilles-bibliotheque.js` (l.14440) · 1232 | ×1,1 |
  | `listerTrimestresAvecCartouches` | `cartouches.js` (l.14445) · 987 | `cartouches-bibliotheque.js` (l.14444) · 1241 | ×1,3 |
  | `fermerModalBibliothequePratiques` | `pratiques.js` (l.14489) · 123 | `pratiques-gestion.js` (l.14427) · 65 | ×1,9 |
  | `_apresOuvertureFichier` | `liste-evaluations.js` (l.14581) · 140 | `profil-etudiant-actions.js` (l.14504) · 514 | ×3,7 |
  | `afficherSection` | `planification.js` (l.14529) · 229 | `bilan-reflexif.js` (l.14521) · 259 **et** `rapport-bug.js` (l.14366) · 154 | **3 fichiers** |
  | `afficherSousSection` | `planification.js` (l.14529) · 270 | `bilan-reflexif.js` (l.14521) · 276 | ×1,0 |

  Les neuf paires **divergent** — aucune n'est une copie inoffensive.
  ⚠ **« NEUF DOUBLONS » N'EST PAS « NEUF DÉFAUTS VÉCUS », et le tableau ci-dessus ne le dit pas.**
  Les fichiers perdants sont des IIFE : leurs appels INTERNES résolvent lexicalement vers
  leur propre version, qui reste donc atteignable. C'est exactement ce qui rendait l'énoncé de #557
  trop large (« la version corrigée est inatteignable » — non : elle l'était depuis la Liste des
  évaluations, pas depuis le profil étudiant).
  ⮕ **Ce qui décide, pour chaque paire, c'est l'existence d'un appelant INTERNE dans le fichier
  perdant** — pas l'écart de taille, pas l'ordre de chargement.
  **UNE SEULE PAIRE A ÉTÉ MENÉE JUSQU'AU BOUT** : `creerNouvellePratique` n'a **aucun** appelant
  interne dans `pratiques-gestion.js`. Son unique point d'entrée est `data-action="creerNouvellePratique"`
  (`index.html:5550`), résolu par le dispatcher de `main.js`, donc par le global. Ses 2593 caractères
  sont donc bel et bien inatteignables.
  ⮕ ⚠ **MAIS CE N'EST PEUT-ÊTRE PAS UN BOGUE.** La version qui gagne (257 car.) ne fait qu'appeler
  `ouvrirWizardV2` : ça ressemble à un remplacement DÉLIBÉRÉ dont la carcasse est restée. Si c'est le
  cas, le geste est un RETRAIT (zéro-dette), pas une réparation. **À trancher avant de coder.**
  ⮕ **Les cinq autres paires demandent chacune la même mesure**, une par une : appelant interne ou non,
  puis retrait ou fusion. Ne pas les traiter en lot sur la foi du tableau.
  **CE QUI EST DÉJÀ POSÉ** : `tests/unit/sentinelle-557-supprimer-evaluation-definition-unique.test.js`
  porte un cliquet à liste connue. Ces six noms y sont tolérés et nommés ; un **septième** fait rougir
  le banc, et une assertion dédiée empêche d'y rajouter `supprimerEvaluation` pour le faire taire.
  ⮕ Quand une paire est réglée, **retirer son nom de `DOUBLONS_CONNUS`** : le cliquet ne descend pas
  tout seul, il rougit pour demander qu'on le descende.
  📌 **UN PRÉCÉDENT LOCAL, ET IL A ÉTÉ TRANCHÉ DANS L'AUTRE SENS.** `evaluation.js:2976` porte
  `window.modifierEvaluationParId = modifierEvaluation;` avec le commentaire « Export sous un nom
  différent pour éviter conflit avec liste-evaluations.js ». Même conflit, mêmes deux fichiers,
  résolu par **renommage à l'exposition** plutôt que par déduplication — commit `b23900e0`
  (« Correction du bouton Consulter : résolution conflit de noms de fonctions »). L'alias a
  aujourd'hui **8 appelants dans 4 fichiers** (`liste-evaluations.js`, `profil-etudiant-actions.js`,
  `travaux-ui.js`).
  ⮕ ⚠ **ET SA JUSTIFICATION EST PÉRIMÉE — mesuré le 28 août 2026.** Il n'existe plus qu'UNE seule
  `modifierEvaluation` dans le dépôt (`evaluation.js:1169`) : `liste-evaluations.js` en portait une,
  retirée depuis par `26be0d9b`. Le commentaire annonce donc un conflit qui n'existe plus, et le nom
  `modifierEvaluationParId` n'évite plus rien.
  ⮕ **Ne pas le retirer à la légère** : 8 appelants, c'est un chantier, pas une retouche. Mais la
  question « alias ou déduplication ? » est déjà tranchée deux fois dans ce dépôt, dans deux sens
  opposés — l'écrire ici évite qu'elle se rouvre à froid dans six mois.
  ⮕ Pour trancher `creerNouvellePratique`, la piste est `git log -S ouvrirWizardV2 -- js/pratiques.js`
  (l'historique, pas la relecture des deux corps).

- [x] **#594 LIVRÉ 29 août 2026 — Le bandeau orange de version s'affiche au chargement, une fois par nouveau build.**
  Demande de Grégoire : « je n'ai pas revu ce message depuis longtemps ». Mesuré : depuis le 8 juin (`832b459e`,
  retour terrain : affiché sans condition, il revenait en boucle), le bandeau ne se déclenchait que par le polling
  distant — désactivé en `file://`, et sur le web seulement si un déploiement survient pendant la session.
  ⮕ **Option A** : au chargement, si le build chargé ≠ dernier build VU (`monitorage-build-vu`, la clé de la pastille),
  le bandeau s'affiche avec un texte au présent (« Nouvelle version chargée… ») et SANS bouton Recharger ; fermer le
  bandeau marque le build vu. Première visite : repère pris, aucun bandeau. Le polling distant est inchangé.
  Spec WebKit `bandeau-maj-chargement.spec.js` réécrit (4 cas, dont la non-boucle du 8 juin) ; break-test 2 mutations,
  3 rouges. `js/init-inline.js` (`signalerBuildChargeSiNouveau`, `afficherBandeauVersion(…, distant)`).

- [x] **#593 LIVRÉ 29 août 2026 (points 1-2-3) — les reliquats Conception ont un item, et trois sur quatre sont réglés ; D3 renvoyé à #358.**
  1. ✅ Banc #549 réancré : tests 3 et 4 cherchent `\n## Le travail demandé\n` (l'en-tête réel), plus le mot que la
     consigne d'ancrage citait aussi. 2. ✅ Le modèle de cartouche ne parle plus d'un « seuil de maîtrise » écrit dans le
     code : il nomme le niveau qui porte le repère « Maîtrisé à partir de » de l'échelle (#555), marque les deux repères
     dans la liste des niveaux, et **dit** quand l'échelle n'en a pas (ou quand le repère ne désigne aucun niveau).
     3. ✅ `sauvegarderCommentaire` capture sa cible avant le premier `await` et la passe à `persisterCartouchePartielle`
     (paramètre `cible`) : une cartouche ouverte pendant la complétion ne reçoit plus l'écriture d'une autre — **la
     course « théorique » a été reproduite en banc et fermée**. Cliquet de câblage #518 ajouté à son banc (garde avant
     `construireProductionData`). `getCouleurNiveau` et les quatre couleurs I/D/M/E identiques retirés d'`export-pdf.js`
     (parité visuelle : même gris à cinq sites). 4. ⏳ **D3 reste** (clés `cartouches_*` sans `cle()`) → #358.
  **Sentinelle** `sentinelle-593-reliquats-conception` (5 cas) ; break-test 4 mutations, 4 rouges. Énoncé d'origine :
  Créé le 29 août 2026 en construisant `Rapports/SUIVI-conception-evaluations-2026-08.md` (§2.1) : ces lignes
  du rapport `AUDIT-decouplage-srpnf-idme-conception-2026-08-27.md` §7.2 n'étaient portées par aucun item.
  1. **Sentinelle #549, tests 3 et 4 tautologiques sur l'en-tête** : `toContain('Le travail demandé')` est
     satisfait par la ligne d'ancrage du corps ; renommer l'en-tête laisse le test vert. Réancrer sur l'en-tête réel.
  2. **Texte du modèle de cartouche** (`cartouches.js`, « niveaux situés sous le seuil de maîtrise ») : concept
     désormais porté par les deux repères de l'échelle (#555), texte figé dans le code. À réécrire depuis l'échelle
     (« sous « Suffisant à partir de » ») ou à retirer.
  3. **Petits reliquats n° 7** : course inter-cartouches (`sauvegarderCommentaire` lit `cartoucheActuel` après un
     `await`, non reproduite, faible) ; câblage `if (!validerBlocsNommes()) return;` (#518) sans test ;
     `getCouleurNiveau` (`export-pdf.js`) qui discrimine I/D/M/E avec quatre couleurs identiques — mort de fait.
  4. **D3 — régime des cartouches** : clés `cartouches_${grilleId}` sans `cle()` — globales, non namespacées,
     orphelines si la grille disparaît. Décidé le 21 août (CO-33/D1), mentionné dans #517 et #471, jamais
     inscrit. ⚠ C'est un chantier de namespacing, pas un reliquat : à cadrer à part le jour venu (Brique D, #358).
  ⮕ 1-2-3 se traitent en un lot court ; 4 se renvoie à #358.

- [x] **#578 LIVRÉ 29 août 2026 — La cartouche neuve ne devine plus son échelle : elle prend celle du formulaire, et l'écrit.**
  ⮕ **Trois volets, un commit.** (1) `initialiserNouveauCartouche` lit `selectEchelleCartouche` (résolution `id`
  puis `idOriginal`), pose `echelleId` sur la cartouche, et n'invente aucune colonne sans choix ; le formulaire
  est resynchronisé (`populerDropdownsCartouche`) pour dire la vérité. (2) `afficherMatriceRetroaction` rend un
  message (« Cette cartouche n'a pas encore d'échelle… ») au lieu d'un tableau à une colonne ; `calculerPourcentageComplete`
  rend 0 %, pas NaN. (3) ⚠⚠ **RÉGRESSION DU 26 AOÛT TROUVÉE EN CHEMIN** : le commit `e50155e0` avait renommé les
  `data-on-change` des DEUX listes du formulaire (`onChangeSelectionGrilleCartouche` / `…EchelleCartouche`) vers des
  fonctions qui **n'ont jamais existé** — le dispatcher résout `window[nom]` et ne faisait que `console.warn`.
  Choisir une grille ou une échelle dans le formulaire ne faisait donc RIEN depuis trois jours (seul le cas
  « une seule grille + une seule échelle » de `creerNouvelleCartouche` contournait, par appel direct). Rebranchées
  sur `onChangeSelectionCartouche`, qui existe. Sans ce volet, l'option A aurait rendu une matrice toujours vide.
  **Sentinelle** `sentinelle-578-cartouche-ne-devine-plus` (6 cas : sans choix, formulaire resynchronisé, seconde
  échelle, `idOriginal`, id fantôme, **cliquet** : tout `data-on-change` du bloc `infoCartouche` d'`index.html`
  résout vers une fonction posée sur `window`). **Break-test** : 6 mutations, 6 rouges, restauré par copie.
  Le cas « avec une échelle » de `sentinelle-573` reposait sur la devinette : il choisit désormais l'échelle au
  formulaire. Diagnostic `_diagnostiquerEchellesGrilles()` conservé (message final aligné sur la décision).
  ⏳ **Reste, non tranché** : les cartouches EXISTANTES nées du chemin fautif (sans `echelleId`, colonnes de la 1ʳᵉ
  échelle) — compter sur `cartouches_*` avant de décider s'il y a quelque chose à réparer.
  Énoncé d'origine, conservé :
  ✅ **TRANCHÉ PAR GRÉGOIRE le 28 août 2026 — OPTION A : MESURER AVANT DE CODER.**
  Compter, dans ses trimestres, les grilles **avec** et **sans** `echelleId`. Le chiffre décide de la
  suite ; le correctif ne s'écrit pas avant.
  ✅ **DIAGNOSTIC LIVRÉ le 29 août 2026** : `await _diagnostiquerEchellesGrilles()` en console
  (`cartouches.js`, lecture seule, tous trimestres via `db.get`, copie archivée sondée avant la clé
  globale, une clé partagée comptée une fois). Rend `{ total, avec, sans, resolues, introuvables, parCle,
  lignes }` et un `console.table` par grille (statut `sans` / `resolue` / `introuvable`, colonne `demo`).
  Sentinelle `sentinelle-578-diagnostic-echelles-grilles` (6 cas ; 4 mutations rouges : porte inversée,
  dédoublonnage retiré, écriture ajoutée, lecture par `getSync`).
  ✅ **CHIFFRE RAPPORTÉ par Grégoire le 29 août 2026** : 3 trimestres (a2025, h2026, a2026), 10 grilles —
  **1 avec `echelleId` (GRILLE_GENERIQUE → ECHELLE_GENERIQUE, résolue), 9 sans**, 0 introuvable. Aucune
  grille réelle n'en porte. ⮕ La lecture `grille.echelleId` est donc EXCLUE comme source : elle laisserait
  toutes ses cartouches neuves sans colonnes. Arbitrage remis en artefact (un seul, avec les deux
  décisions #555 restantes), lien dans RELAIS.md.
  ✅ **TRANCHÉ PAR GRÉGOIRE le 29 août 2026, 8 h 18 — OPTION A : LA CARTOUCHE NE DEVINE PLUS.** Sans échelle
  choisie dans `selectEchelleCartouche`, la matrice reste vide et l'écran dit « choisis une échelle » ; les
  colonnes viennent toujours du choix d'échelle du formulaire et l'`echelleId` est ÉCRIT sur la cartouche.
  La grille reste agnostique (critères seulement). Écartées : B (la grille porte une échelle — contredit
  9 grilles sur 10 et ajouterait une 4ᵉ source), C (défaut contextuel — encore une devinette, ajoutable après).
  ⮕ **Non tranché, à mesurer avant tout correctif de données** : les cartouches EXISTANTES nées du chemin
  fautif (sans `echelleId`, colonnes de la 1ʳᵉ échelle) — compter sur les clés `cartouches_*`.
  Artefact : `https://claude.ai/code/artifact/89f28423-e48a-4d62-b15c-91e6e4f48cca`.
  ⚠ **FAIT MESURÉ EN ÉCRIVANT LE DIAGNOSTIC, qui pèse sur l'attente** : l'éditeur de grille
  (`grilles.js`) n'écrit **JAMAIS** `echelleId` — le seul littéral du dépôt est `GRILLE_GENERIQUE`
  (`grilles.js:1462`). La prémisse « une grille PORTE un `echelleId` » vaut pour la grille semée, pas
  pour celles que l'éditeur produit. Si le compte réel confirme « sans » majoritaire, le correctif de
  #578 commence par ÉCRIRE l'identifiant (éditeur de grille + rétro-remplissage), et seulement ensuite
  par le LIRE dans `initialiserNouveauCartouche`.
  ⮕ **Le motif est une protection, pas une précaution de style** : si les grilles réelles ne portent
  pas d'`echelleId`, passer par `obtenirEchelleResolue` laisserait la cartouche **sans colonnes** —
  une régression PIRE que le défaut qu'on corrige.
  ⮕ La mesure ne peut pas être faite depuis le dépôt : les grilles vivent dans le navigateur de
  Grégoire. Le geste est un **diagnostic en console** qu'il lance lui-même, sur le patron de
  `_diagnostiquerModeleCours` (`cours.js`) et d'`oracle542`.
  Créé le 28 août 2026, détaché de #573 (rapport du 27 août, §3 n° 18 et §7.2 n° 4).
  `initialiserNouveauCartouche` choisit son échelle par `echelles.find(e => !e.estDemo) || echelles[0]`
  (`cartouches.js`) — un ordre de tableau, pas une désignation — et n'enregistre **aucun `echelleId`** sur
  la cartouche produite. Or **une grille PORTE un `echelleId`** (`grilles.js`, `grilleGenerique`), et c'est
  la seule source non arbitraire : la matrice d'une cartouche décrit les niveaux de la grille qu'elle sert.
  ⚠ **POURQUOI CE N'EST PAS DANS #573.** Le corriger change la CRÉATION de cartouche sur des données que je
  ne peux pas voir : si les grilles réelles de Grégoire ne portent pas d'`echelleId`, passer par
  `obtenirEchelleResolue` le laisserait sans colonnes — une régression pire que le défaut. **Préalable
  mesurable** : compter, dans ses trimestres, les grilles avec et sans `echelleId` (un diagnostic en
  console suffit). ⮕ Ensuite seulement : lire `grille.echelleId`, résoudre par `obtenirEchelleResolue`,
  et **écrire l'`echelleId` sur la cartouche** pour que la question ne se repose plus.
  (rapport §7.2 n° 1) `sauvegarderCartouche` → `chargerCartouchesRetroaction()` (`cartouches.js:890`) →
  `initialiserNouveauCartouche(grilleId)` (`:321`) : `cartoucheActuel` = `CART_xxx` neuf, nom et contexte
  vidés (`:414-417`), matrice re-rendue vide ; la cellule tapée ensuite **n'atteint pas la base**
  (`persisterCartouchePartielle` ne trouve pas l'enregistrement). Même chemin après suppression (`:1646`).
  Reproduit en harnais Node, **non vérifié en navigateur**. Antérieur à #517, mais #517 promet désormais un
  enregistrement qui n'a pas lieu. ⮕ **Candidat sérieux au symptôme « des fois ça enregistre, des fois
  non »** qui a déclenché l'audit du 25 août. Au même geste : `initialiserNouveauCartouche` porte les plages
  IDME de Grégoire en repli (`:374-379`) et choisit l'échelle par `find(e => !e.estDemo) || echelles[0]`,
  sans `echelleId` — la cartouche neuve porte les colonnes de la PREMIÈRE échelle, pas de celle choisie.
- [ ] **#574 — Depuis #527, l'échelle générique et les gabarits d'échelle sont NON CALCULABLES : aucun ne porte de `valeurCalcul`.**
  🟠 **PARTIEL le 29 août 2026 — LE RETRAIT EST LIVRÉ, la sonde est due, le niveau neuf n'est pas tranché.**
  ✅ **Retrait (option B)** : `assurerEchelleGenerique` retirée d'`echelles.js` (fonction, appel au boot, export) ;
  `GABARITS_ECHELLES_DEFAUT` retiré de `gabarits-utils.js` (semis et export) ; `GRILLE_GENERIQUE` et
  `CART_GENERIQUE` ne portent plus d'`echelleId` vers une échelle qui n'existe plus (la cartouche se rend depuis
  ses `niveaux`). Les deux commentaires faux de #527 sont corrigés. **Les données existantes ne sont pas touchées** :
  une échelle générique déjà semée se supprime comme les autres (`IDS_GABARITS_HARDCODES` conservée pour le tombstone).
  ✅ **Sonde livrée** : `await _sonder574()` en console (`echelles.js`, lecture seule, tous trimestres) — échelles
  fabriquées par le code (générique, copies de gabarits), **niveaux sans `valeurCalcul` par échelle** (la mesure
  promise par #526, jamais faite ; le zéro est une valeur), et usages (évaluations, productions, cartouches).
  ✅ **SONDE RAPPORTÉE par Grégoire le 29 août 2026** : 3 trimestres ; 1 échelle fabriquée (`ECHELLE_GENERIQUE` dans
  h2026, 4 niveaux sur 4 sans `valeurCalcul`) ; **0 échelle réelle avec un niveau sans valeur** (la mesure promise par
  #526 est faite : son témoignage était exact) ; usages : 0 évaluation, 0 production, 1 cartouche (`CART_GENERIQUE`,
  rangée sous `cartouches_GRILLE1767642435304607`). ⮕ **AUCUNE DONNÉE À RÉPARER.** L'échelle et la cartouche
  génériques de h2026 se suppriment à la main (tombstone) ; c'est son geste, pas une migration.
  **Sentinelle** `sentinelle-574-aucune-echelle-semee` (4 cas + cliquet) ; bancs #358, #468, brique B adaptés (la
  moitié « échelle » de #358 n'a plus d'objet). **Break-test** : 5 mutations, 5 rouges, restauré par copie.
  ⏳ **NON TRANCHÉ — le niveau NEUF** (`code: 'N', min: 0, max: 100, valeurCalcul: 50` écrits en base, 4 sites) :
  le faire naître VIDE écrirait un code vide en base — la collision de clés de #524. La bonne forme est un niveau
  tenu en tampon jusqu'à ce qu'il soit complet (patron `_reperesNouvelleEchelle`, #555 (e)). Décision et lot à part.
  ✅ **ARBITRÉ PAR GRÉGOIRE le 28 août 2026 — option B : les RETIRER.** N'offrir que des échelles que
  l'utilisateur complète, plutôt que de leur donner des `valeurCalcul` choisies par le projet.
  ⮕ Zéro-dette strict, au prix du démarrage rapide. Cohérent avec #527 : poser des valeurs à sa place
  refabriquerait l'arbitrage pédagogique que le retrait du repli `(min + max) / 2` avait justement supprimé.
  (rapport §7.2 n° 2-3) `ECHELLE_GENERIQUE` (`echelles.js:474-484`, semée au boot par
  `assurerEchelleGenerique:512`) écrit `valeur: 45/67/82/95` ; `GABARIT_ECHELLE_IDME`
  (`gabarits-utils.js:294-297`) n'a aucune valeur ; `GABARIT_ECHELLE_STD_MASTERY` écrit `valeurNumerique`.
  `valeurNumeriqueDuNiveau` ne lit que `valeurCalcul` et rend `null` → **tout critère évalué sur l'une
  d'elles sort du calcul, sans message ciblé** (le repli retiré par #527 masquait le trou). Le commentaire
  `echelles.js:3428` (« les échelles semées portent toutes une valeur ponctuelle ») et `:3400-3403`
  (« le repli reste VOLONTAIRE ») sont faux. Au même geste : un niveau NEUF naît avec `code: 'N', min: 0,
  max: 100, valeurCalcul: 50` **écrits en base** (`:1221, 2798, 3096, 3563`) — `refusChampNiveau` ne garde
  que l'édition, l'arbitrage que #526/#527 interdisent revient un cran plus tôt. ⚠ **Sonde d'abord** : des
  évaluations réelles reposent-elles sur `ECHELLE_GENERIQUE` ou sur une copie de gabarit ?

### Constats de l'audit de l'onglet ÉVALUATIONS (Fable 5, 25 août) — VERSÉS LE 27 AOÛT

> **Rapport** : `Rapports/AUDIT-evaluation-onglet-2026-08-25.md` (fusionné sur `main` le 27 août,
> commit `b7f46938` ; il était resté sur la branche `claude/audit-evaluation-tab-txocw7`, jamais
> fusionnée, pendant que son jumeau Conception, lui, l'avait été).
>
> ⚠ **BASE AUDITÉE : 1.99.0** (commit `8dfda3ed`, 25 août). Cinq versions de retard sur 1.104.1.
> **Les numéros de ligne cités dans le rapport datent de cette base** — les revérifier au grep
> avant de coder, pas les suivre.
>
> ⚠ **AUCUN VERDICT N'A ÉTÉ EXÉCUTÉ.** L'audit se déclare lecture seule : tous ses constats sont
> marqués `[lecture]`, aucun Chromium n'a été lancé. Les deux critiques ont été contre-vérifiés par
> une seconde lecture, pas par un essai. **Reproduire avant de corriger.**
>
> ✅ **A1 et A2 ONT ÉTÉ REVÉRIFIÉS SUR 1.104.1 le 27 août** : les deux tiennent encore. Les autres
> ne l'ont pas été.
>
> ⮕ Croisements avec des items déjà ouverts, que l'audit signale sans les redémontrer : **#483**,
> **#465**, **#482**, **#440**, et le bug testeur **#340-T3**.

- [x] **#556 LIVRÉ 28 août 2026** — « Vider la corbeille » détruit exactement ce que la modale annonce. (constat A1, CRITIQUE)
  `viderCorbeille(fichiers)` reçoit désormais la liste à détruire, et REFUSE l'appel sans argument
  (l'ancienne signature nue était le défaut lui-même). L'appelant lui passe la liste **capturée au
  moment de l'affichage** — pas une relecture au clic.
  ⮕ **UN SECOND DÉFAUT, NON INSCRIT, corrigé au passage** : `viderTouteCorbeille` lisait
  `obtenirCorbeille()` DEUX fois (une pour le compte affiché, une à la confirmation). Un changement de
  groupe-cours actif entre l'ouverture de la modale et le clic rendait deux ensembles différents.
  ⮕ Le retour est désormais MESURÉ sur la corbeille (`avant.length - restantes.length`), pas déduit
  de la longueur reçue ; et les métadonnées sont relues APRÈS les `await`, pour qu'un fichier mis en
  corbeille pendant les suppressions de blobs survive.
  **Sentinelle** : `tests/unit/sentinelle-556-corbeille-detruit-ce-qui-est-annonce.test.js` (7 tests).
  Elle suit la variable dont le `.length` est écrit dans la modale JUSQU'À l'appel de destruction —
  « `viderCorbeille` reçoit un argument » ne dit rien tant qu'on ne dit pas LEQUEL.
  **Break-test** : 9 mutations, 9 verdicts conformes (7 rouges obtenus, 2 témoins verts).
  ⮕ Énoncé d'origine, conservé pour mémoire :
  **REVÉRIFIÉ ENCORE VRAI le 27 août sur 1.104.1.** La modale compte les fichiers de la corbeille
  **filtrée par groupe-cours actif**, mais `travauxStockage.viderCorbeille()`
  (`travaux-stockage.js:1065`) itère `obtenirCorbeilleComplete()` et termine par
  `sauvegarderCorbeille([])` : **blobs et métadonnées de TOUS les groupes-cours du trimestre sont
  détruits**. Le nettoyage des évaluations liées, lui, ne couvre que le groupe actif.
  ⮕ **Perte de données définitive et silencieuse**, sur un écran qui annonçait autre chose.
  ⮕ **Geste** : `viderCorbeille()` doit détruire exactement l'ensemble AFFICHÉ (recevoir la liste,
  ou filtrer par `groupeCoursId`) + sentinelle « la modale et la destruction comptent le même
  ensemble ». C'est la correction n° 1 du ratio impact/effort de l'audit.

- [x] **#557 LIVRÉ 28 août 2026** — `supprimerEvaluation` n'a plus qu'une définition. (constat A2, CRITIQUE)
  La définition d'`evaluation.js` est RETIRÉE ; celle de `liste-evaluations.js` (avec la restauration
  de l'originale d'une reprise et la tolérance aux orphelines verrouillées) est la seule, et elle a
  **absorbé les deux apports** de la version retirée : la garde « évaluation introuvable » et la
  confirmation qui nomme l'étudiant·e et la production.
  ⚠ **L'ÉNONCÉ ÉTAIT TROP LARGE — mesuré le 28 août.** « La version corrigée est inatteignable » : non.
  `liste-evaluations.js` est une IIFE, donc son appel interne (`data-action` « supprimer-eval », depuis
  la Liste des évaluations) résolvait LEXICALEMENT vers la bonne version. Seuls les appels par le
  GLOBAL tombaient sur la mauvaise : le profil étudiant et le sidebar d'évaluation. **Le même écran se
  comportait de deux façons selon le bouton employé** — ce qui est plus difficile à diagnostiquer
  qu'une fonction franchement inatteignable.
  **Sentinelle** : `tests/unit/sentinelle-557-supprimer-evaluation-definition-unique.test.js` (7 tests),
  dont le **cliquet générique** demandé par l'item : aucun NOUVEAU nom de fonction ne peut être posé
  sur `window` par deux modules. Liste connue de 9 tolérés → **#587**.
  **Break-test** : 7 mutations, 7 verdicts conformes (5 rouges obtenus, 2 témoins verts).
  ⮕ Énoncé d'origine, conservé pour mémoire :
  **REVÉRIFIÉ ENCORE VRAI le 28 août à 12 h 05, lignes remesurées.** `liste-evaluations.js:1967`
  définit la version **avec** `restaurerOriginaleSiReprise` (correctif du 8 juin) ;
  `evaluation.js:2088` en définit une **sans**. Les deux sont exportées (`:2843` et `:3233`) ;
  `liste-evaluations.js` étant chargé AVANT `evaluation.js`, l'export du second **écrase** celui du
  premier.
  ⚠ **LES LIGNES DE L'ÉNONCÉ PRÉCÉDENT (1996 / 2710) ÉTAIENT PÉRIMÉES** : `evaluation.js` a perdu
  **642 lignes** le 28 août au matin (vue « accordéon » retirée, #575). Le défaut, lui, n'a pas bougé
  d'un pouce — c'est le faux négatif que produirait une relecture par numéro de ligne.
  ⮕ **Supprimer une reprise depuis le profil étudiant laisse l'originale « remplacée » à jamais.**
  Le détail qui le prouve : `profil-etudiant-actions.js:154` porte le commentaire « Appeler la
  fonction de suppression du module liste-evaluations.js » — et appelle celle d'`evaluation.js`.
  ⮕ ~~Même mécanique pour `rechargerFiltreProduction`~~ — **RÉGLÉ le 28 août** (#575, `e2819cea`) :
  ce doublon-là est parti avec la vue « accordéon », en même temps que celui de
  `trierListeEvaluations`. Vérifié au grep le 28 août : **une seule définition de chacun**, dans
  `liste-evaluations.js`. **Cette moitié de l'item est donc close** ; seul `supprimerEvaluation`
  reste. Signalé par la session d'audit des items #558-#572, qui a relevé que mon propre chantier
  avait périmé l'énoncé sans que je le mette à jour.
  ⮕ **Geste** : une seule définition par identifiant global (zéro-dette) + **sentinelle statique
  « aucun doublon de `function X` exportée sur `window` entre modules »** — ce motif est la
  réintroduction silencieuse d'un bug déjà corrigé, et il a déjà mordu ailleurs.

- [x] **#558 — La file d'attente d'import ne survit pas au rechargement.** (constats B1, B2, B3)
  ✅ **LIVRÉ le 28 août 2026 (e983d3dd) — B1, B1-aggravé, B2 et B3 traités ensemble.**
  Trois défauts du même mécanisme, à traiter ensemble. **B1** : `travaux-import.js` filtre la file
  après import sans appeler `persisterFileDAttente()` — au rechargement, `restaurerFileDAttente()`
  ressuscite les fichiers déjà importés (blob nul) → fantômes « à re-déposer » et risque de
  ré-import en doublon. Aggravé : le cas « remplacer » met l'ancien fichier en corbeille **avant**
  l'`await importerFichier` ; si l'import échoue, l'erreur n'est qu'un `console.error`.
  **B2** : le réglage « Rés. max. » (DPI) revient à 250 à chaque re-render (`selected` codé en dur) —
  un choix de 400 dpi est silencieusement perdu, alors que la valeur est réellement utilisée.
  **B3** : `persisterFileDAttente` n'enregistre ni `productionIdParFichier`, ni `modeImport`,
  `dateFichier`, `nomDocumentLibre`, `operations`, `skipBalance` : la protection #313 est inopérante
  après reload, et le sélecteur peut afficher une production que les nouveaux dépôts ne recevront pas.
  ⚠ Code livré le jour même (#496-#507), **jamais éprouvé au terrain**.

- [x] **#559 — Poste de préparation : la case cochée marque un fichier étranger.** (constat B4)
  ✅ **LIVRÉ le 28 août 2026 (384ee6f1) — trois fonctions, pas deux : `syncOptImport` avait le même défaut en LECTURE.**
  `changerOptBalance` / `changerOptResolution` écrivent `queue[indexActuel + queueOffset]`. Avec
  `queueOffset === -1` (« Ajouter des pages ») et une file d'import non vide, l'écriture atterrit
  sur **un autre fichier de la file**.

- [x] **#560 LIVRÉ 29 août 2026 — les deux écritures vivantes passent par le garde des modes et disent le refus ; le site mort est retiré.** (constats B5, B8)
  `supprimerFichierDefinitivement` et « Vider la corbeille » (`liste-evaluations.js`) réécrivent les évaluations par
  `sauvegarderDonneesSelonMode`, testent son retour et, sur refus (mode anonymisation), le DISENT : « le fichier est
  supprimé / la corbeille est vidée, mais les évaluations liées n'ont pas été retirées ». Les caches ne sont invalidés
  que si l'écriture a eu lieu. `appliquerJetonPersonnalise` + `afficherJetonsPersonnalisesEvaluation` (`evaluation.js`)
  retirées (mortes depuis juin), exports compris ; banc `refactor-evaluation` adapté.
  **Sentinelle** `sentinelle-560-garde-des-modes-liste` (cliquets statiques : zéro écriture directe, garde testée sur les
  deux chemins avec refus dit, site mort absent) ; **break-test** 3 mutations, 3 rouges.
  ⏳ **NON traité, distinct** : le second défaut de B5 — ces suppressions par couple (DA, production) emportent originales,
  reprises et l'évaluation active d'un fichier réimporté. C'est une règle métier (que supprime-t-on avec un fichier ?), à
  trancher avant de coder.
  `supprimerFichierDefinitivement` et le nettoyage de « Vider la corbeille » (`liste-evaluations.js`),
  ainsi que le jeton personnalisé (`evaluation.js`), écrivent par `db.setSync(cle(...))` direct —
  esquivant le blocage du mode anonymisation que `supprimerEvaluation` respecte.
  ⚠ **LE PIRE CAS PORTE SUR DU CODE MORT — mesuré le 28 août 2026.** Le site du jeton personnalisé,
  `appliquerJetonPersonnalise` (`evaluation.js`), est **inatteignable, et l'était déjà le 25 août** :
  aucun appelant dans le dépôt, aucun `data-action` à ce nom (le dispatcher de `main.js` résout un
  nom littéral), et son rendu `afficherJetonsPersonnalisesEvaluation` est lui aussi sans appelant et
  sort toujours par sa garde faute du conteneur `jetonsPersonnalisesOptions`, absent partout.
  `git log -S` : aucun mouvement depuis juin 2026 — ce n'est pas #575 qui a coupé le fil.
  ⮕ Or **il était le seul des trois à lire par `obtenirDonneesSelonMode`**, donc le seul où un corpus
  de simulation (`'evaluationsSauvegardees'` est bien dans `_CLES_SIMULABLES`, `modes.js`) pouvait
  être reversé dans la clé réelle. Les deux autres lisent en `db.getSync(cle(…))` direct : lecture
  réelle, écriture réelle, **pas de fuite de corpus**. L'alerte en gras de cet item portait sur son
  seul site qui ne peut pas s'exécuter.
  ⮕ **CE QUI RESTE VIVANT, sur deux sites atteignables** (`liste-evaluations.js`, joints par
  `data-action="supprimerFichierDefinitivement"` et `data-action="viderTouteCorbeille"`) : le
  contournement du blocage d'anonymisation, face à des fonctions sœurs qui, elles, testent le retour.
  ⮕ Toutes les fonctions sœurs passent par `sauvegarderDonneesSelonMode`.
  ⮕ **Traiter le site mort par retrait, pas par correctif** (règle zéro-dette : pas de code mort
  « pour plus tard »).
  ⮕ **Second défaut de B5, distinct** : ces suppressions par couple (DA, production) sont **trop
  larges** — elles emportent originales, reprises et l'évaluation active d'un fichier réimporté.

- [x] **#561 LIVRÉ 29 août 2026 — la réassociation rend un verdict, et la Liste l'attend avant de marquer la reprise.** (constat B6)
  Cause amont : `changerProductionFichier` (`travaux-ui.js`) ne rendait RIEN — son `if (ok) {}` vide (sous-constat de #572)
  était le verdict jamais rendu. Elle rend `true` (réassocié) ou `false` (confirm refusé, stockage en échec).
  `associerProductionDepuisListe` : le handler est `async`, ATTEND le verdict et, s'il est faux, dit « Réassociation
  annulée : aucun jeton appliqué » sans marquer `estReprise` ni consommer le jeton ; même attente sur la branche simple.
  **Sentinelle** `sentinelle-561-reassociation-verdict` (4 cas comportementaux dans le sandbox de #313 + cliquet sur
  l'ordre await → garde → `estReprise`) ; **break-test** 3 mutations, 4 rouges.
  `associerProductionDepuisListe` n'attend pas `travauxUI.changerProductionFichier` (async, peut
  avorter sur `confirm()` refusé) mais marque quand même `estReprise:true` et consomme le jeton
  → **reprise créée sur l'ancienne production**.

- [x] **#562 LIVRÉ 29 août 2026 — la Liste des évaluations n'interpole plus rien sans `echapperHtml`.** (constat B7)
  Onze interpolations échappées dans `genererLigneHTML` (DA, DA affiché, `evaluationId`, `productionId`, `fichierId`,
  niveau final, note, statut et son libellé, scores d'origine d'une reprise) et `genererDropdownActions` (les identifiants
  dans `value="action|id|id"` — le navigateur décode `&quot;`/`&amp;` en lisant `.value`, `executerActionEval` reçoit la
  valeur d'origine). `_genererLigneHTML` exposé pour le banc (patron `_trierLignesParColonne`).
  **Sentinelle** `sentinelle-562-liste-echappement` : (A) une ligne hostile (`"><img …>`) ne sort ni de son texte ni de
  son attribut, avec l'`echapperHtml` réel ; (B) cliquet statique récursif : toute interpolation des deux fonctions est
  `echapperHtml(...)`, un local HTML de la liste fermée, ou un ternaire à branches constantes/échappées — une
  interpolation neuve non échappée rougit. **Break-test** : 4 mutations, 4 rouges.
  `${ligne.da}` / `${daAffiche}` et `${ligne.niveauFinal}` injectés sans `echapperHtml`. Le DA est
  nettoyé à l'import CSV, pas garanti sur les autres chemins d'entrée.
  ⮕ Violation de la règle 1 du projet, qui est « sans exception ».
  ⚠ **PLUS LARGE QUE L'ÉNONCÉ — mesuré le 28 août 2026.** La même ligne injecte aussi
  `${ligne.evaluationId}` et `${ligne.productionId}` dans des attributs `data-*`, et `${ligne.fichierId}`
  dans un `data-param`, toujours dans `genererLigneHTML` (`liste-evaluations.js`).
  ⚠ **DÉPENDANCE NON INSCRITE, vers le sous-constat `echapperHtml` de #572.** `echapperHtml`
  (`config.js`) passe par `textContent` → `innerHTML` et **n'échappe pas les guillemets** : une valeur
  portant `"` sort de l'attribut. **Poser `echapperHtml` sur ces interpolations ne fermera donc RIEN
  tant que la fonction elle-même n'est pas corrigée.** Les deux se traitent ensemble ou pas du tout.

- [x] **#563 LIVRÉ 29 août 2026 — la case « Reprise ciblée » est retirée, et plus aucun chemin n'applique ce jeton.** (constat B9)
  ⮕ **Mesuré avant de retirer** : `appliquerJetonRepriseCiblee` n'avait qu'UN appelant (le handler de la case) ; le
  tampon d'annotation « JETON DE REPRISE CIBLÉE » cochait cette même case (`cocherCheckboxJeton`, #240). Retirés
  ensemble, zéro-dette : la case (map des badges), `gererChangementCheckboxJetonRepriseCiblee` (+ export), la fonction
  d'application et `nettoyerEvaluationsRepriseCiblee` (sans appelant), la route du tampon et le tampon, l'infobulle.
  **Conservé** : la configuration du type (wizard, normalisation), l'affichage des reprises ciblées DÉJÀ faites (badge,
  bilan de rétroaction, filtre de la liste) — ces données existent, on ne les efface pas.
  Bancs #240, #563, `refactor-evaluation` adaptés ; **sentinelle** #563 réécrite (4 cas : ni case, ni handler, ni
  fonction ; tampon sans route ; type nommé dans `retirerJetonDepuisSidebar` ; les anciennes reprises restent lisibles).
  **Break-test** : 4 mutations, 4 rouges. ⏳ **DÉCISION SUIVANTE, POUR GRÉGOIRE** : le type « reprise ciblée » reste
  configurable dans le wizard (`mat-jeton-ciblee-actif`, plafond) alors qu'aucun geste ne le crée plus — retirer le type
  entier (config, aide, filtre) ou le garder « pour voir à l'usage » ? Non tranché ici.
  ✅ **ARBITRÉ PAR GRÉGOIRE le 28 août 2026 — option C : RETIRER LA CASE.**
  Ses mots : « *Retirons la case et voyons à l'usage ce qu'en feront les utilisateurs.* »
  ⮕ Zéro-dette appliqué : une commande qui ne commande rien n'a pas à exister. Ni l'implémentation du
  retrait (option B), ni le statu quo du refus explicite (option A).
  ⚠ **DEUX PIÈGES À NE PAS MANQUER EN RETIRANT** :
  · Le test qui rougit si quelqu'un écrit `retirerJetonRepriseCiblee` devient **caduc** — il garderait un
    comportement qui n'existe plus. Le retirer avec la case, pas le laisser en sentinelle fantôme.
  · Vérifier que le jeton de reprise ciblée n'est plus applicable par **aucun** chemin, pas seulement que
    la case quitte l'écran. Une case retirée dont le code reste atteignable ailleurs serait pire que la case.
  🟠 **PARTIEL le 28 août 2026 (c5123798) — L'ITEM RESTE OUVERT.**
  ✅ Fait : les six écritures muettes. Elles passent par un point de persistance
  unique qui examine le retour de `sauvegarderDonneesSelonMode`, le DIT à
  l'utilisateur et le propage à l'appelant.
  ⏳ **NON fait, et ce n'est pas un oubli** : le retrait du jeton de reprise ciblée.
  `retirerJetonRepriseCiblee` n'existe NULLE PART, et défaire une reprise ciblée
  suppose de supprimer l'évaluation qu'elle a créée — son pendant pour la reprise
  normale est une opération à confirmations multiples avec risque de perte de note
  (#141, #360). ⮕ **DÉCISION DE CONCEPTION requise de Grégoire**, trois options
  posées le 28 août : garder le refus explicite actuel, implémenter sur le patron
  de la reprise normale, ou retirer la case.
  ⮕ En attendant, la case NE MENT PLUS : elle revient à l'état réel des données.
  ⚠ Un test rougit si quelqu'un écrit `retirerJetonRepriseCiblee` — ce n'est PAS
  un test cassé, c'est le signal qu'il faut relire cet item.
  La branche est un **TODO vide** (`evaluation-sauvegarde.js`) : la case se décoche, le jeton reste
  appliqué. Et les écritures d'`evaluation-jetons.js` (6 sites) n'examinent jamais le retour de
  `sauvegarderDonneesSelonMode` : en mode anonymisation, l'échec est silencieux pendant que l'UI se
  met à jour comme si tout allait bien.

- [x] **#564 — L'auto-save ne couvre que les critères : une rétroaction seule peut être perdue.** (constat B10)
  ✅ **LIVRÉ le 28 août 2026 (b4755301) — il ne manquait que le déclencheur ; `_autoSauvegarderCriteres` lisait déjà le texte.**
  Son unique déclencheur est la sélection d'un niveau (`evaluation-chargement.js`). Modifier
  **seulement** la rétroaction finale ou un commentaire, sans toucher un critère, ne crée aucun
  snapshot → le flush au changement de fichier ne sauve rien ; seul le bouton « Enregistrer »
  persiste. ⮕ **Perte de texte réelle en navigation rapide entre copies.**
  ⚠ Le reste de la chaîne de sauvegarde est sain — l'audit le documente en §E.

- [x] **#565 — Un étudiant en échec avorte tout le lot d'export, et la page de synthèse peut manquer sans le dire.** (constats B11, B12)
  ✅ **LIVRÉ le 28 août 2026 (cf378263) — B11 et B12 ; un échec est isolé ET nommé, une copie sans synthèse est signalée à part.**
  **B11** : les boucles de l'export Léa et du trimestre complet (`travaux-archivage.js`) n'ont aucun
  try/catch par item ; une exception (blob manquant, PDF corrompu) remonte au catch global →
  **zéro PDF livré**, même pour les N−1 étudiants valides, et un seul `alert`.
  **B12** : `ajouterPageSynthese` avale l'échec de rasterisation et l'absence de lib
  (`console.error`/`console.warn` seuls). ⮕ **L'enseignant peut téléverser sur Léa des PDF sans la
  page de rétroaction sans jamais le savoir** — alors que c'est la promesse du bouton.
  ⮕ **Geste** : try/catch par étudiant + bilan final (« 23 réussis, 2 échoués : … »), l'omission de
  la synthèse remontée dans ce bilan.

- [x] **#566 LIVRÉ 29 août 2026 — la synthèse anonymise le texte libre, et le compteur de l'export Léa dit le nombre de PDF réel.** (constat B13)
  `synthese-retroaction-data.js` : le commentaire libre de chaque critère (rétroaction saisie, algorithmique ou de cartouche)
  passe par `anonymiserTexteRetroaction(texte, da)` — transparent hors du mode anonymisé. Les noms venaient déjà de
  `obtenirDonneesSelonMode` (anonymisés) ; seul le texte libre fuyait.
  `travaux-archivage.js` : la sélection Léa (évaluations actives → une par élève, reprise prioritaire → fichier résolu)
  est extraite en **`selectionnerEvaluationsLea`**, seule source, exposée ; `exporterPourLea` la lit ; elle rend aussi
  `sansFichier`. `travaux-ui.js` : `mettreAJourCompteurLea` l'interroge et annonce « N PDF pour N étudiant(s) — K
  évaluation(s) sans fichier, sans PDF » au lieu d'un compte qui ignorait la résolution.
  **Sentinelle** `sentinelle-566-synthese-anonymisee-compteur` (A anonymiseur appelé / transparent ; B sélection :
  sans-fichier, reprise prioritaire, filtres ; C cliquets export ↔ compteur) ; **break-test** 4 mutations, 4 rouges.
  Le modal de révision anonymise les rétroactions, la synthèse rasterisée **jamais** : en mode
  anonymisé, un prénom tapé dans une rétroaction **sort dans le PDF**. Et le compteur peut dépasser
  le nombre de PDF réellement produits (évaluations sans fichier résolu ignorées en silence).
  ⚠ **LE LIBELLÉ CITÉ N'EXISTE PAS — mesuré le 28 août 2026.** L'écran ne dit jamais
  « N évaluations prêtes » : il dit **« N évaluation(s) pour N étudiant(s) »** (`travaux-ui.js`), et
  « 1 évaluation prête » seulement dans le cas mono-étudiant. L'écart mesuré est réel, la citation
  ne l'était pas — ne pas chercher cette chaîne dans le code.

- [x] **#567 LIVRÉ 29 août 2026 — les quatre variables fantômes de l'audit sont remplacées par la palette ; un cliquet global tient les 78 autres (#595).** (constat C1)
  Mesuré : `--attention` ×7, `--orange` ×6, `--orange-pale` ×2, `--radius` ×7 (dont des usages avec repli) ; `--couleur-attention`
  et `--couleur-texte-sombre` avaient déjà disparu. Substituées — jamais aliasées — par `--alerte-texte-attention`,
  `--alerte-fond-attention`, `--alerte-bordure-attention` (définies en clair ET en sombre) et `--radius-moyen`, dans
  `liste-evaluations.js`, `travaux-ui.js`, `reserve-ouvrir.js`, `profil-etudiant-sections-affichage.js`, `styles.css`.
  ⚠ **MESURÉ EN CHEMIN** : le projet emploie **78 autres variables CSS jamais définies** (≈270 usages, dont ≈110 sans
  repli — transparents ou hérités selon la propriété). Inscrit sous **#595**. **Sentinelle** `sentinelle-567-variables-
  css-fantomes` : les quatre à zéro, leurs remplaçantes définies dans les deux thèmes, et un **cliquet à liste fermée**
  (variable → usages tolérés) qui rougit sur toute variable fantôme NEUVE, tout usage en hausse, et toute entrée devenue
  inutile. **Break-test** : 3 mutations, 3 rouges — après un faux vert : `sed '0,/…/'` (GNU) ne fait rien sous BSD.
- [ ] **#595 — 78 variables CSS employées et jamais définies (≈270 usages).**
  Créé le 29 août 2026 en livrant #567. Mesure : `node` sur `index.html`, `styles.css`, `js/*.js`, `css/*.css`, commentaires
  retirés — 303 variables utilisées, 270 définies. Les plus fréquentes : `--bordure` (25), `--orange-attention` (15),
  `--gris-pale`, `--bordure-legere` (12), `--gris-texte` (11), `--radius-standard` (10), `--orange-principal`,
  `--bordure-subtile`, `--radius-sm` (8)… Liste complète et comptes : `TOLEREES` dans
  `tests/unit/sentinelle-567-variables-css-fantomes.test.js` (le cliquet). Deux familles : (a) sans repli → la propriété
  tombe à `initial`/hérité (bordures invisibles, textes qui prennent la couleur du parent) ; (b) avec repli `var(--x, #hex)`
  → fonctionne, mais hors palette et hors thème. ⮕ Traiter par familles de nom (bordure, gris, orange, vert, radius,
  surface), en substituant par la palette existante ; chaque lot fait baisser la liste du cliquet. Pas de définition
  d'alias « pour faire taire » : la règle est la palette.

  `var(--attention)` n'existe nulle part ; idem `--orange`, `--orange-pale`, `--radius`,
  `--couleur-attention`, `--couleur-texte-sombre` (ces deux dernières retombant sur des hex Bootstrap
  hors palette). ⮕ « Non associé », les modales de suppression et l'alerte « à re-déposer »
  **perdent leur couleur d'alerte dans les deux modes**.
  ⮕ ~12 usages : définir les alias ou substituer. Correction n° 4 du ratio impact/effort.

- [x] **#568 LIVRÉ 29 août 2026 — 44 px au doigt, densité conservée à la souris.** (constat C2)
  `.travaux-btn-nav` et `.travaux-fond-swatch` (28 px), `.eval-actions-select` (~24 px) montent à 44 px **sous
  `@media (pointer: coarse)`** — la norme là où elle compte (iPad), sans alourdir le Mac où la visionneuse et la Liste
  sont denses par choix. Sentinelle `sentinelle-568-569-exporter-design-tactile` (bloc présent et complet, densité de
  base intacte). ⏳ **Porte terrain iPad** : le rendu réel des trois cibles au doigt (Safari, `pointer: coarse`).
  `.travaux-btn-nav` et `.travaux-fond-swatch` à 28×28 px, `.eval-actions-select` à ~24 px.
  ⮕ La norme est **déjà appliquée ailleurs** dans le projet (`css/accompagnement.css`) — c'est un
  écart, pas une norme absente.

- [x] **#569 LIVRÉ 29 août 2026 — l'écran « Exporter et archiver » entre dans le design system.** (constat C3)
  Dix `<select class="form-select">` (six sur Exporter, quatre sur Importer — l'audit en comptait huit) passent à
  `.controle-form`, la classe canonique (les deux petits gardent `pipeline-select-petit`) ; le titre dit « Exporter et
  archiver » comme la navigation (lu depuis `config.js` par la sentinelle) ; sans fichier, le module rend son propre état
  vide (`.placeholder-vide`, devant lequel `etats-vides.js` s'efface). **Break-test** du lot #568/#569 : 3 mutations, 3 rouges.
  Des selects en `class="form-select"` — classe quasi inexistante dans `styles.css`, rendu natif sans
  jetons de surface ni de focus ; la classe canonique est `.controle-form`. Titre « Archivage des
  travaux » ≠ libellé de navigation « Exporter et archiver ». **Aucun état vide** (pas d'entrée
  `evaluations-exporter` dans `etats-vides.js`).
  ⚠ **PORTÉE RECTIFIÉE — mesurée le 28 août 2026.** `class="form-select"` apparaît **8 fois** dans
  `travaux-ui.js`, mais **2 sont sur l'écran Importer**, pas sur « Exporter et archiver ». L'écran
  nommé par l'item en porte **6**. Les 2 autres restent à traiter, sous un autre écran.

- [x] **#570 LIVRÉ 29 août 2026 — les flèches de tri de la Liste ont leurs ids, et la couleur de leur en-tête.** (constat C4)
  Ids dupliqués corrigés D'ABORD (comme l'item l'exigeait) : la Liste porte `tri-eval-*` (huit colonnes),
  `mettreAJourIndicateursTri` les lit ; le tableau des étudiants garde `tri-*` (`etudiants.js`). Puis la couleur : plus de
  `var(--gris-clair)` en ligne (1,96:1 en mode clair sur l'en-tête bleu) — classe `.tri-indicateur` qui **hérite** du blanc
  de `.thead-sticky-bleu`, repos atténué par l'opacité. **Sentinelle** statique `sentinelle-570-tri-ids-uniques` (aucun
  `id="tri-…"` dupliqué, la Liste lit `tri-eval-*`, aucune couleur en dur) + **spec WebKit** `liste-tri-indicateurs-570`
  (trier par DA change la flèche de la Liste et d'elle seule ; flèche = couleur de l'en-tête, modes sombre et clair).
  **Break-test** : 2 mutations, rouges des deux côtés.
  `var(--gris-clair)` (famille fond-clair, `#777788` en clair) posé sur l'en-tête bleu fixe.
  Recalculé le 28 août 2026 : `#777788` sur `#2a4a8a` = **1,96:1**.
  ⚠ **DÉPENDANCE NON INSCRITE : LE CORRECTIF DE COULEUR SEUL SERA SANS EFFET.** Trois des
  identifiants de flèches — `tri-da`, `tri-nom`, `tri-prenom` — existent **deux fois dans
  `index.html`** : tableau des étudiants ET tableau des évaluations. `mettreAJourIndicateursTri`
  (`liste-evaluations.js`) résout par `getElementById` : **il atteint le premier tableau**, donc pas
  ceux de la Liste. Repeindre les spans du second ne changera rien pour ces trois colonnes.
  ⮕ **Corriger le doublon d'identifiants AVANT la couleur**, sinon le correctif est invérifiable.
  ⮕ **À VÉRIFIER À L'ÉCRAN** (l'effet fonctionnel ne s'établit pas statiquement) : trier la Liste des
  évaluations par DA et observer si la flèche active change bien de sens **dans ce tableau-là**.

- [x] **#571 LIVRÉ 29 août 2026 (les correctifs ; les tailles restent, par décision) — le PDF reste lisible sur les couleurs de l'échelle, la date est échappée.** (constat C5)
  Re-mesuré sur HEAD après #555 : quatre sites posaient `PAPER` (blanc) sur une couleur venue de l'échelle de
  l'utilisateur — niveau général, trajectoire, segments de critère, pastilles d'erreurs. `texteSur(fond)` choisit le
  texte qui **contraste le plus** (rapport WCAG, encre `#141414` ou papier) ; une couleur qu'on ne sait pas lire garde
  le papier, comme avant. Le seuil fixe d'abord posé (0,18) a été abandonné en cours de route : le rouge `#dc3545`
  y tombait du mauvais côté — la règle est le contraste, pas un nombre. La date d'évaluation passe par `esc()` (le
  repli `return iso` rend la chaîne brute). **Les tailles ne bougent pas** (décision du 28 août : retours de la CoP à
  l'automne). **Sentinelle** `sentinelle-571-pdf-luminance-date` (4 cas : `texteSur`, rendu jaune/rouge, cliquet
  sur les quatre sites, date) ; **break-test** 3 mutations, 3 rouges.
  ✅ **ARBITRÉ PAR GRÉGOIRE le 28 août 2026 — les correctifs OUI, les tailles NON.**
  ⮕ **Ce qui se fait** : la garde de luminance sur les couleurs d'échelle et l'échappement de la date.
  ⮕ **Ce qui ne se fait PAS** : les tailles restent inchangées. « *Les commentaires seront recueillis dans
  la communauté de pratique cet automne. On verra ensuite.* » ⇒ **ne pas rouvrir avant l'automne.**
  ⚠ **UNE PRÉMISSE DE SA RÉPONSE ÉTAIT FAUSSE, mesurée le 28 août.** Il écrit « *les couleurs sont celles
  que l'utilisateur choisit dans l'échelle de performance, elles ne devraient pas être en dur* » — elles
  le sont déjà : `construireMappingCouleurs(scale)` (`synthese-retroaction-rendu.js:109`) mappe chaque
  code sur `s.color` lu dans SON échelle. Ce qui est fixe, c'est la charpente du document (encre, papier,
  gris), et c'est documenté comme volontaire. Sa préoccupation est donc déjà satisfaite ; ce qui reste,
  c'est la garde de luminance — du texte clair sur un niveau jaune.
  Le mode fixe inline (hex/px) est **volontaire et documenté** — l'audit le confirme correct. Mais
  la densité dessert l'usage cible cellulaire : base 10 px, dates à **6 px**, numéros 6,5 px, pied
  7 px — rasterisé, c'est du bitmap à zoomer. Et le texte `PAPER` est posé sur les couleurs
  d'échelle de l'utilisateur **sans garde de luminance** : un niveau jaune rend le code IDME
  illisible. Plus une date non échappée (seul oubli du fichier).
  ⮕ **La garde de luminance et l'échappement sont des correctifs ; les tailles sont ta décision** —
  c'est ton document, remis à tes élèves.
  ⚠ **LA DATE NON ÉCHAPPÉE EST PLUS ÉTROITE QUE L'ÉNONCÉ — mesuré le 28 août 2026.** Le site est réel
  (`formaterDateLongue` appelée hors `esc()`), mais la fonction ne rend une chaîne brute que par son
  **repli `return iso`**, c'est-à-dire uniquement si la date n'est pas parsable. Le chemin nominal
  n'ouvre pas d'injection. À corriger quand même, mais ce n'est pas un trou béant.
  ⚠ **ÉNONCÉ À RE-MESURER SUR HEAD AVANT DE L'OUVRIR.** `synthese-retroaction-rendu.js` est modifié
  le 28 août 2026 par **#555 lot 2** (branchement de `zoneDuNiveau`, retrait des comparaisons IDME en
  dur). Les repères ci-dessus datent d'avant ce commit.

- [x] **#572 LIVRÉ 29 août 2026 — les mineurs Liste, Annoter et Design sont réglés ; l'item est clos.** (section D du rapport)
  **Liste** : `toggleVerrouillerEvaluation` et `attacherEvenementsActions` retirées (mortes) ; le filtre « groupe »
  (`filtre-groupe-eval`, lu à cinq endroits, créé nulle part) et la branche « non-remis » (aucune option) retirés ; les
  listeners de filtres ne s'accumulent plus à chaque visite (garde `dataset`) ; la vue Corbeille nomme la production par
  son `titre` ; `reprise-ciblee` est classée avec les reprises au tri ; **les annotations partent avec le fichier**
  (`supprimerAnnotationsFichiers`, appelée à la suppression définitive et à la purge 30 jours). **Annoter** : la note
  finale n'est plus relue depuis le DOM (`parseFloat(textContent)`, trois sites) mais depuis `noteCalculeeCourante`,
  posée par le calcul (nombre, ou `null` quand rien n'est calculable). **Design** : « Cliquez » → « Clique » (trois sites),
  badges de jetons sur `--jetons-*` (les variables existaient — l'énoncé du 28 disait le contraire pour `--orange-accent`,
  mais `--jetons-delai-*`/`--jetons-reprise-*` portent exactement ces couleurs), focus visible sur les barres d'outils,
  quatre boutons de fermeture et deux boutons de pagination nommés (`aria-label`).
  **Sentinelle** `sentinelle-572-mineurs-liste-annoter-design` (9 cas, dont la purge en comportement) ; **break-test**
  4 mutations, 4 rouges. ⏳ **Restent, hors de l'item** : la hiérarchie h2/h3 (manipulation à l'écran, porte terrain) ;
  les clés `sessionStorage` non namespacées → **#596**.
- [ ] **#596 — Six clés `sessionStorage` non namespacées, sur cinq fichiers.**
  Créé le 29 août 2026, sorti de #572 (28 août) : 21 sites, 6 clés (`travaux-pipeline-production`, `travaux-jeton-production`…),
  cinq fichiers dont deux hors Import/Export. Namespacer à moitié casserait les lectures : un seul lot, lecture + écriture,
  avec `cle()` ou un préfixe de trimestre. Au passage, `travaux-mode-courant` est ÉCRITE et JAMAIS LUE (à retirer).

  🟠 **PARTIEL le 28 août 2026 (43866c56 + 00a81a24) — L'ITEM RESTE OUVERT.**
  ✅ Volet Import : fuite de `setInterval`, date parsée en UTC, balayage des jetons
  de reprise débordant sur un autre groupe-cours.
  ✅ Volet Export : noms de dossiers ZIP non assainis, fichier sans extension dont
  la version annotée écrasait l'original, barres de progression jamais remises à zéro.
  ✅ `echapperHtml` n'échappait pas les guillemets → traité à part (zone protégée,
  autorisation de Grégoire) ; débloque #562.
  ⏳ **Restent** : volets Liste, Annoter et Design mineur.
  ⏳ **Sorti du lot, à ouvrir à part** : les clés sessionStorage non namespacées —
  21 sites, 6 clés, 5 fichiers dont deux HORS du périmètre Import/Export.
  Namespacer à moitié casserait les lectures. ⮕ Au passage : `travaux-mode-courant`
  est ÉCRITE et JAMAIS LUE.
  ⏳ **Laissé** : les couleurs utilisateur interpolées dans des attributs `style`
  (~8 sites dans `synthese-retroaction-rendu.js`, 1 dans `evaluation.js`).
  ❌ **NON RECEVABLE** : les « ~25 `console.log` » de `travaux-resolution.js`. Il y
  en a 20, et ce n'est PAS de la dette — ils sont dans `diagnostiquer`,
  `diagnostiquerDoublons` et `nettoyerDoublonsExacts`, des outils de diagnostic
  dont la SORTIE CONSOLE EST LE PRODUIT. Les retirer casserait l'outil.
  ✅ `lancerAllegement` : traité par le RETRAIT de la fonctionnalité « Alléger »
  (828981ad, décision Grégoire), pas par un nettoyage de code mort.
  ⚠ **SIX INEXACTITUDES D'ORIGINE RECTIFIÉES LE 28 AOÛT 2026** — repérées en note sous chaque volet.
  **Import** : **20** `console.log` dans `travaux-resolution.js` (et non ~25) · fuite de `setInterval` à chaque
  ouverture du poste de préparation (aucun `clearInterval`) · clés sessionStorage non namespacées ·
  `new Date('AAAA-MM-JJ')` parsé UTC (décalage d'un jour) · `appliquerJetonsReprisePostImport`
  balaie sans filtre groupe-cours.
  **Liste** : handlers orphelins (`toggleVerrouillerEvaluation` sans appelant, branches de filtres
  dont les selects n'existent plus, `attacherEvenementsActions` no-op au commentaire mensonger) ·
  double rendu et accumulation de listeners à chaque visite · `production.nom` au lieu de `titre`
  → colonne vide en vue corbeille · `reprise-ciblee` mal classé au tri jetons · annotations jamais
  purgées à la suppression définitive ni à la purge 30 jours.
  ⚠ **« branches de filtres » est À MOITIÉ CADUC.** Le bloc `filtre-note-eval` a été **supprimé par
  #575 le 28 août 2026** ; il n'en reste qu'un **commentaire de 17 lignes qui documente son retrait**
  — un `grep` brut le trouve encore et fait conclure « vivant » à tort. Ce qui subsiste est un second
  cas que l'énoncé ne nommait pas : **`filtre-groupe-eval`**, lu à cinq endroits de
  `liste-evaluations.js` et **créé nulle part dans le dépôt**, plus la branche `'non-remis'` sans option.
  ⚠ **`reprise-ciblee` est PIRE que « absent du tri ».** Le `badgeType` est bien produit, mais absent
  de la table `ordreJeton`, dont le repli est `?? 0` : une reprise ciblée n'est pas ignorée du tri,
  elle est **classée avec les lignes sans jeton**.
  **Annoter** : note finale lue depuis le DOM (`parseFloat(...textContent)`) au lieu du SSOT de calcul.
  ⚠ **LES DEUX BLOCS `if` VIDES NE SONT PAS DANS « ANNOTER ».** Ils sont dans `identifierAutoPipeline`
  (écran **Importer**) et dans `changerProductionFichier` (`travaux-ui.js`).
  ⮕ Le second **se traite avec #561** : c'est la fonction même dont #561 dit que le retour n'est pas
  attendu. Même endroit, même geste.
  ✅ **Réglé par #561 (29 août)** : `changerProductionFichier` rend un verdict, le `if` vide est parti.
  **Export** : barres de progression jamais remises à zéro · noms de dossiers ZIP non assainis (un
  « / » crée des sous-dossiers ; fichier sans extension → la version annotée écrase l'original) ·
  code mort `lancerAllegement` · `echapperHtml` n'échappe pas les guillemets (`config.js`) · couleurs
  utilisateur interpolées dans des attributs `style` sans échappement (8 sites).
  **Design mineur** : hiérarchie h2/h3 incohérente · **trois** « Cliquez » vouvoyés (et non un seul :
  `travaux-ui.js` et deux dans `travaux-outils.js`) · badges jetons en hex dur · pas de
  `:focus-visible` sur la toolbar d'annotation · boutons-icônes de la visionneuse sans nom accessible.
  ⚠ **« alors que les variables existent » EST FAUX.** Les hex durs sont confirmés dans `styles.css`,
  mais **aucune variable de palette ne porte `#ff6f00` ni `#9c27b0`** (`--orange-accent` vaut
  `#c8a060`/`#ff6b35`). Il n'y a pas de substitution à faire : il faut **décider** de la couleur, ou
  créer les variables. Ce n'est pas un simple remplacement.
  ⚠ **L'ACCESSIBILITÉ EST SOUS-ÉVALUÉE, pas seulement mal étiquetée.** L'énoncé décrit un `aria-label`
  remplacé par un `title`. Mesuré : **deux boutons de navigation n'ont NI `title` NI `aria-label`**,
  et leur icône est en `alt=""` — ils n'ont donc **aucun nom accessible**. Seul un troisième porte un
  `title`. C'est un défaut plus grave que la substitution décrite.
  ⚠ **« hiérarchie h2/h3 incohérente » NON VÉRIFIABLE STATIQUEMENT** : dépend du niveau de titre
  effectivement rendu selon l'onglet actif. ⮕ **Manipulation requise** : ouvrir Évaluations, passer
  chaque sous-onglet, relever l'arbre de titres rendu.

- [ ] **#598 — La balance des blancs est appliquée sans être ni réglable ni visible.**
  Créé le 30 août 2026. **Symptôme vécu par Grégoire**, pendant l'import du Portrait de lecteur :
  « des modifications par défaut étaient appliquées aux photos (contraste, balance des blancs) mais
  je ne vois pas de confirmation ou de réglage à cet effet dans l'écran d'optimisation ».

  **Trois faits mesurés.**
  1. La balance des blancs EST toujours appliquée, **en dur** : `const optBalance = true;`
     (`travaux-ui.js:3756`). Le commentaire dit que les cases ont été retirées en Beta 99.30
     « pour simplifier le pipeline ». Seul « Rés. max. » subsiste comme réglage global.
  2. **L'aperçu ne montre JAMAIS le traitement.** `genererPreviewThumbnail` (l. 1358) et
     `genererPreviewCentre` (l. 2153) lisent `document.getElementById('pipeline-opt-balance')`.
     Grep sur tout le dépôt : **deux lectures, aucune écriture** — l'élément n'est créé nulle part,
     `?.checked` rend `undefined`. Ce que l'utilisateur regarde avant « Importer » n'est donc pas
     ce qui sera archivé — et **structurellement** : aucun réglage ne peut changer un aperçu dont
     la condition est constante.
     ⮕ **Motif : « clé lue, jamais écrite ».** Une lecture sur une clé que personne n'écrit rend
     toujours la même chose, donc toute garde ou tout affichage qui en dépend est constant sans que
     rien ne le signale — ni erreur, ni test rouge. Le geste de diagnostic qui tranche est de
     **grepper l'ÉCRITURE avant la lecture**, jamais l'inverse : ici, deux `getElementById` se
     lisent comme un mécanisme vivant, et c'est l'absence de tout site de création qui révèle le
     défaut. Symétrique du même motif, déjà relevé dans #596 : `travaux-mode-courant` est ÉCRITE et
     jamais lue — celle-là est à retirer, pas à brancher.
  3. Le **contraste n'est PAS ajusté automatiquement**. `autoBalanceBlancs`
     (`travaux-preparation.js:2800`) échantillonne les 5 % de pixels les plus clairs et applique un
     gain par canal RVB plafonné entre 0,5 et 2,0 : c'est une correction de dominante colorée, pas
     un étirement de contraste. Contraste et luminosité restent des curseurs manuels de « Modifier ».
     ⮕ `js/etats-vides.js:121` promet pourtant « optimisées automatiquement (contraste, luminosité,
     etc.) ». Les deux autres textes (aide contextuelle, section Aide d'`index.html`) sont exacts.

  **Décision de Grégoire (30 août 2026) — LES DEUX VOLETS**, l'un ne remplace pas l'autre :
  · **A. L'aperçu doit refléter le traitement.** Les vignettes de la colonne « Aperçu » et le grand
    aperçu central montrent l'image telle qu'elle sera archivée, balance appliquée.
  · **B. Le réglage global doit revenir.** Une commande dans l'écran Optimisation, à côté de
    « Rés. max. », qui active ou désactive la balance des blancs pour tout le lot.

  **Pièges relevés avant d'implémenter.**
  ⚠ Le réglage doit être un SSOT persistant, PAS un état de DOM. C'est exactement le défaut B2 de
  #558 : « Rés. max. » ne vivait que dans le select, re-généré à chaque rendu, et tout choix autre
  que le défaut était écrasé en silence. Reproduire le patron déjà corrigé — variable de module
  `dpiPipelineChoisi` (l. 33), lecture au démarrage, écriture dans `mettreAJourPreviewsPipeline`
  (l. 1459-1469).
  ⚠ **Ne pas créer une septième clé `sessionStorage` non namespacée.** `travaux-pipeline-dpi` et
  `travaux-pipeline-production` font partie des six clés de **#596**. Le nouveau réglage passe par
  `cle()` dès le départ, ou #596 hérite d'une septième.
  ⚠ **Sémantique globale/par fichier à trancher.** Le test actuel est `optBalance && !f.skipBalance`
  (l. 3773) : `skipBalance` (case « Ne pas appliquer la balance des blancs à ce document », dans
  « Modifier ») est une EXCEPTION au global. Si le global passe à OFF, un fichier sans `skipBalance`
  ne doit pas être traité quand même — et l'exception par fichier doit rester lisible dans l'UI.
  ⚠ Le cache d'aperçu prévoit déjà le cas : `cacheKey = optBalance ? 'bal' : 'raw'` (l. 1359). Il
  devra être invalidé au changement de réglage, sinon l'aperçu montre l'état précédent.
  ⚠ Coût : appliquer la balance sur 44 vignettes n'est pas gratuit. Mesurer avant de l'appliquer à
  chaque rendu ; le cache existe pour ça.
  ⮕ `etats-vides.js:121` promet un ajustement de contraste que le code ne fait pas. **NON corrigé
  volontairement** : si le volet B ajoute un vrai ajustement, ce texte devient exact au lieu d'être
  à réécrire. La décision de Grégoire le tranchera.

  ✅ **VOLET A LIVRÉ le 30 août 2026.** SSOT de la décision dans `travaux-ui.js` :
  `BALANCE_GLOBALE_ACTIVE` + `balanceActiveePour(f)`, consommé par les DEUX aperçus et par
  l'import — les trois sites qui décidaient chacun de leur côté. Le calcul, jusque-là copié à
  l'identique dans les deux aperçus, est factorisé en `appliquerBalanceBlancsCanvas`.
  **Mesuré au navigateur** sur une copie réelle (Boucher, 4284x5712), en extrayant le VRAI texte
  des deux fonctions du dépôt :
  · écart moyen aperçu vs fichier importé **AVANT : 43,68** par canal sur 255
  · **APRÈS : 0,95** — facteurs RVB des deux chemins concordants à 0,006 près
  · témoin posé (vignette sans balance) : c'est lui qui donne le 43,68, donc la mesure discrimine
  **Sentinelle** `sentinelle-598-apercu-reflete-traitement` (6 cas) ; **break-test** 4 mutations,
  4 rouges obtenus, restauration vérifiée. Vitest **4113/4113** (395 fichiers).

  ⏳ **VOLET B EN ATTENTE — décision de Grégoire (30 août)** : il tranche APRÈS avoir vu ses
  44 images avec la balance enfin visible dans l'aperçu. Trois issues possibles, à documenter le
  moment venu : (a) restaurer le seul réglage de balance ; (b) ajouter un vrai rehaussement
  automatique luminosité/contraste, qui n'a **jamais existé** dans le dépôt (vérifié sur tout
  l'historique : cases `pipeline-opt-*` ayant existé, fonctions `auto*`, commits touchant
  `ctx.filter`, et les dépôts v5/v3) ; (c) statu quo documenté.
  ⚠ **Ce qui a réellement existé et disparu**, pour que personne ne recherche autre chose : trois
  CASES À COCHER (Balance des blancs, Détection doublons, Assemblage automatique), retirées le
  1er mai 2026 par le commit `78dd6137` (Beta 99.30). Luminosité et contraste n'ont jamais été
  appliqués automatiquement — mais l'effet de la balance (les 5 % les plus clairs poussés vers 255)
  éclaircit et creuse le contraste, ce qui explique qu'on puisse s'en souvenir ainsi. Le texte de
  `etats-vides.js` l'affirme d'ailleurs depuis le 19 avril 2026, alors que le code du même commit
  ne faisait déjà que la balance.

- [ ] **#597 — Les remises HEIC ne s'affichent nulle part : aucun décodeur dans le dépôt.**
  Créé le 30 août 2026, pendant l'import réel du Portrait de lecteur (601-101, 49 fichiers).
  **Mesuré** : deux remises `.HEIC` (Breton, 4032 x 3024, brand `ftypheic`, magic bytes valides)
  entrent dans la file, passent `validerMagicBytes`, et ressortent sans miniature — `thumb: false`,
  dimensions `0 x 0`. Les 5 PDF et les 42 JPEG de la même file sont intacts (`thumb: true`).
  **Cause** : `heic` n'apparaît dans le dépôt QUE dans les listes de formats acceptés
  (`TYPES_ACCEPTES`, `EXTENSIONS_ACCEPTEES`, `input.accept`, textes d'aide) — jamais dans un
  traitement. Tout le pipeline image repose sur `new Image()`, donc sur le décodage natif du
  navigateur : Safari décode le HEIC, Chrome non. `compresserImageSiNecessaire` retombe sur
  `resolve(blob)` en silence (`travaux-import.js`, branche `img.onerror`), l'original est conservé
  tel quel, et l'échec ne remonte nulle part.
  ⚠ **La conséquence dépasse l'aperçu** : sans décodage, ces fichiers ne sont pas annotables non
  plus — la visionneuse bute sur le même `new Image()`. Le format est annoncé comme accepté dans
  quatre textes d'interface (dont `index.html` l. 11663 « Formats acceptés : PDF, JPEG, PNG, HEIC,
  WebP ») : l'app promet un format qu'elle ne sait pas lire hors de Safari.
  **Décision de Grégoire (30 août)** : décodeur embarqué, chargé paresseusement à la première
  rencontre d'un HEIC, conversion en JPEG dès l'entrée dans la file — un seul point d'insertion,
  tout le pipeline aval inchangé.

  ✅ **LIVRÉ le 30 août 2026.** `libs/libheif-bundle.js` (WASM embarqué en base64, hors ligne),
  `js/heic-worker.js`, `js/heic-decodeur.js`, câblage dans `travaux-import.js` (conversion dans
  `genererThumbnailQueue`, filet dans `importerFichier`), libellé corrigé dans `travaux-ui.js`.
  **Sentinelle** `sentinelle-597-heic-decode-avant-pipeline` (10 cas) ; **break-test** 4 mutations,
  4 rouges obtenus, restauration vérifiée. Vitest **4105/4105** (394 fichiers).
  **Mesuré au navigateur** (Chrome 151, modules du dépôt, CSP réelle) : les deux remises de Breton
  converties en 3024x4032, 2,3 s et 3,0 s, affichées dans un `<img>`.
  ⚠ **Choix de bibliothèque — ce qui est mesuré, et ce qui ne l'est pas.** heic2any (essayé
  d'abord) réclame `document` puis `window` **tel qu'il se charge par `importScripts`** : deux
  échecs successifs. Ce n'est pas une impossibilité démontrée en absolu — un stub de DOM plus
  complet pourrait aboutir — mais c'est de la dette contre les internes d'une lib minifiée. Ce qui
  a réellement tranché est l'écart de vitesse, lui pleinement mesuré : **2,5 s contre 8,5-11 s**
  sur le même fichier.
  ⛔ **LIMITE STRUCTURELLE DÉCOUVERTE AU TERRAIN (30 août, sur signalement de Grégoire).**
  Ouverte par double-clic sur `index.html`, la page tourne en `file://` avec l'origine `null` :
  Chrome **refuse de construire le Worker** — `SecurityError: Failed to construct 'Worker'`,
  message relevé sur sa machine. Le décodage HEIC est donc indisponible dans ce mode.
  ⮕ **Un repli sur le thread principal a été écrit, mesuré, puis RETIRÉ le jour même** : il ne peut
  pas fonctionner sous la CSP du dépôt. Les DEUX builds de libheif évaluent une chaîne de
  caractères — le WASM (`CompileError` sur `WebAssembly.Module()`) comme l'asm.js (`EvalError`), ce
  dernier pourtant sans une seule occurrence de `WebAssembly`. Ajouter `'wasm-unsafe-eval'` à
  `script-src` **ne suffit pas** : mesuré, l'`EvalError` subsiste. Seul `'unsafe-eval'` les
  débloquerait, ce que les règles non négociables interdisent (« zéro `eval()` », CLAUDE.md).
  **La CSP n'a pas été touchée.** Du code qui ne peut jamais réussir est du code mort : il est parti.
  ⮕ **Ce qui reste** : le worker, qui fonctionne partout où l'application est SERVIE (en ligne, ou
  par un serveur local). En `file://`, l'échec est désormais EXPLICITE — message nommant la cause,
  et libellé « HEIC non décodé » dans la colonne de gauche au lieu d'une vignette muette.
  ⚠ **Portée qui dépasse le HEIC** : `file://` est un mode où AUCUN Web Worker n'est disponible. Ça
  vaut pour toute fonctionnalité future qui en voudrait un, pas seulement pour ce décodeur.

  ⚠ **Une mesure intermédiaire s'est révélée fausse et a été retirée** : « l'interface gèle 11 s »
  venait d'un compteur `setInterval` dans un onglet piloté, donc en arrière-plan, où Chrome ramène
  les timers à ~1 Hz. Témoin passé ensuite, page sans aucun travail lourd : 6 ticks sur 119
  attendus, faux « blocage » d'exactement 1000 ms. Le choix du worker reste fondé — le décodage
  sort du thread principal par construction — mais le gel n'a jamais été chronométré.
  ⮕ **Second défaut, corrigé dans la même passe** : `travaux-ui.js` affiche le libellé **« PDF »**
  dès que les dimensions manquent (`f.largeurOriginale && f.hauteurOriginale ? … : 'PDF'`).
  Un HEIC non décodé s'affiche donc comme un PDF. Ce libellé a fait porter le premier diagnostic
  sur la prévisualisation PDF — qui, elle, fonctionne.

  ✅ **SECONDE PASSE — 30 août 2026, sur signalement de Grégoire (capture de l'étape 2).**
  La passe précédente se croyait complète : elle avait mesuré, documenté la limite `file://`, et
  annoncé un « échec EXPLICITE ». Sur le terrain, les deux Breton s'affichaient « **Dimensions
  inconnues** » — pas « HEIC non décodé » — et **les quatre textes d'interface annonçaient toujours
  le format**. L'application continuait donc de promettre ce qu'elle refusait.
  **Mesuré à neuf** (Chrome de Grégoire, banc isolé hors dépôt, `IMG_2179.HEIC` réel, 2 909 950 o) :
  worker classique + app **servie** + CSP du projet → **3024 x 4032** ; même worker en `file://` →
  `SecurityError`, origine `null` ; thread principal + `'wasm-unsafe-eval'` → `EvalError` ;
  blob worker + `importScripts` d'un `file://` → « failed to load » ; blob worker + **bundle
  embarqué dans le blob** → `EvalError`. **Fait neuf et réutilisable** : un `blob:` worker HÉRITE de
  la CSP du document, contrairement à un worker chargé par URL same-origin — c'est ce qui ferme la
  dernière voie, et non le `file://` lui-même.
  **Décision de Grégoire** : refuser proprement maintenant ; le lanceur local (servir l'application)
  reste une décision à prendre à froid, elle emporte l'usage iPad et la clé Codex.
  **Livré** : `decodagePossible()` dans le décodeur (exposé) ; `marquerHeicNonDecodable()` appelé
  par `planifierThumbnail`, donc **dès l'entrée dans la file** et non au moment de la miniature ;
  `heicRaison` porté jusqu'à l'interface (infobulle échappée sur la résolution) ; libellé des
  formats rendu dynamique dans `travaux-ui.js` et `accompagnement-contenu-popup.js`
  (`formatsAcceptesLibelle()`) ; texte d'aide d'`index.html` réécrit ; deux commentaires d'en-tête
  qui décrivaient un repli RETIRÉ corrigés (`heic-worker.js`, `heic-decodeur.js`).
  **Sentinelle** `sentinelle-597-heic-dit-son-impossibilite` (5 cas, dont **un comportemental** : le
  décodeur est exécuté avec un faux `window` pour vérifier `decodagePossible()` en `file:` et en
  `http:`). **Break-test : 6 mutations, 6 rouges obtenus**, restauration par copie vérifiée.
  ⮕ **Constat de passage, non traité** : `js/modelisation.js` annonce lui aussi `.heic` dans son
  sélecteur, sans le dire. Commentaire laissé sur place plutôt qu'un item de plus.
  ⮕ **Reste ouvert** : le lanceur local. Tant qu'il n'existe pas, le HEIC n'est pas décodable chez
  Grégoire — l'application le DIT désormais, elle ne le cache plus.

- [ ] **#553 — Le rabotage de clé `startsWith('francais')` : un pansement sur un appariement qui échoue.**
  Créé le 27 août 2026, sorti du chantier #552. **Huit sites** rabotent la clé d'un critère vers
  `'francais'` : `calculs.js` (526, 675, 696) · `helpers.js` (670) · `sections-affichage.js` (1101) ·
  `interventions.js` (995, 1173, 1221).
  ⚠ **CE N'EST PAS DE LA DIDACTIQUE**, contrairement aux apparences. C'est un pansement sur un
  appariement de clés qui échoue : deux endroits normalisent le nom d'un critère et n'obtiennent pas
  la même clé. On a raboté « francais » spécifiquement parce que c'est là qu'on avait vu le symptôme.
  ⮕ **TOUT critère dont le nom varie entre deux écritures a le même bug, en silence, avec des 0 %.**
  Indice mesuré le 27 août : dans `diagnostiquerForcesChallenges`, un critère nommé « Français écrit »
  produit la clé `francaisecrit`, que `moyennes` ne contient pas (elle contient `francais`) — le
  critère est donc **filtré du diagnostic, sans un mot**.
  ⮕ **Le geste** : une seule fonction de normalisation, partagée par les deux côtés de l'appariement,
  et le retrait des huit rabotages. Pas de valeur métier : c'est un défaut technique.

- [ ] **#554 — `determinerCibleIntervention` ne reçoit jamais le statut de décrochage.**
  Créé le 27 août 2026, constaté pendant #552 et **volontairement non corrigé** : brancher un site
  mort est un geste distinct de celui qui était en cours.
  `interpreterMobilisation(A, C, statutDecrochage)` ne rend le niveau `'Décrochage'` que si son
  **troisième argument** est vrai. `determinerCibleIntervention` l'appelle avec deux arguments.
  ⮕ **La branche `if (interpMobilisation.niveau === 'Décrochage')` n'est donc jamais atteinte** — et
  le statut existe pourtant dans le modèle (`trimestre-v2-etudiants.js`, statut `décrochage`).
  ⏳ **À TRANCHER** : passer le statut (et vérifier que les deux autres appelants le font aussi), ou
  retirer la branche. Vérifier les consommateurs AVANT de brancher.

- [x] **#555 — Le seuil de défi : un défaut à 0,70, des replis qui divergent, et la marque de maîtrise absente.**
  ✅ **CLOS le 30 août 2026 — les deux arbitrages du 29 août sont EXÉCUTÉS, et le premier l'était déjà.**
  · **#555·1 (option C) — AUCUN CODE À ÉCRIRE, mesuré sur pièces.** La prémisse de l'artefact du 29 août
    (« la ligne Progrès n'annonce que priorité → acquis ») venait de la puce « Règle d'origine préservée »
    plus bas, PÉRIMÉE depuis l'après-midi du 28 : la décision « option 3 » prise ce jour-là en séance a mis
    les trois montées de zone dans les DEUX documents (`construireAmeliorations` côté PDF,
    `_rendreRecurrentsBilan` côté écran), chacune dite selon sa zone d'arrivée, avec les mots de Grégoire
    (« Tu as progressé en X » / « tu as fait de beaux progrès : maintenant il faut les consolider »).
    L'option C du 29 = le comportement déjà en place au commit `44a5aeeb` (28 août, 17 h 22, vérifié au
    diff). Verrouillé AVANT l'arbitrage par `sentinelle-575-b10-ordre-synthese-pdf` (signalé→acquis,
    priorité→signalé avec SA phrase, les deux natures disjointes, `null` muet) et
    `sentinelle-555-lot2-bilan-ecran` (mêmes cas côté écran). ⮕ Si Grégoire veut d'AUTRES mots pour les
    deux phrases d'arrivée, c'est une ligne par document + leurs sentinelles — rien d'autre ne bouge.
  · **#555·2 (option A) — LIVRÉ le 30 août 2026.** Le curseur « Seuil de défi spécifique » (Labo → Outils
    d'observation) dit maintenant les deux faces : il règle le dépistage SEULEMENT ; la « Consolidation des
    apprentissages » ne lit pas ce curseur, son seuil de maîtrise vient des repères posés sur l'échelle
    (Conception → Échelles). Aide sous le curseur et infobulle `depist-seuil-defi` alignées (libellé
    proposé — à retoucher avec les mots de Grégoire s'il en veut d'autres).
    Sentinelle `sentinelle-555-2-curseur-seuil-defi` (5 cas, 4 mutations, 6 rouges), dont le cas E qui
    rougit si un « second réglage de maîtrise » (option B écartée) renaît dans cet écran.
  · **Non-décision NOMMÉE, pas une dette** : les descentes de zone ne sont pas annoncées dans la ligne
    « Progrès » — aucune option de l'artefact ne l'ajoutait, rien n'est dû.
  ✅ **LOT 2 (d) ET (e) LIVRÉS le 28 août 2026 (soir)** — avec #577, même commit.
  · **(d) le nommage — option A exécutée.** `seuilMaitrise` ne désigne plus que le CODE de niveau porté
    par l'échelle. La matrice de consolidation nomme son score 0-1 `scoreMaitrise` (+ `Deduit`,
    `Raison`, `_detecterScoreMaitrise`, `_scoreParConvention`) ; la préférence 0-1 se nomme
    `seuilIdmeMaitrise` (et ses deux voisins `seuilIdmeInsuffisant` / `seuilIdmeDeveloppement`, dans les
    trois fonctions qui la lisent). Le quatrième sens — le pourcentage 0-100 de `pratique-notation-v2.js`
    — est du **code mort** (mode « par objectifs » retiré par #435, son écran n'existe plus dans
    `index.html`) : on ne renomme pas du code mort, on le retire — **#592**.
    Sentinelle `sentinelle-555-d-seuil-maitrise-un-seul-sens` : un CLIQUET qui compte le mot fichier par
    fichier, commentaires retirés, contre une liste fermée (4 mutations, 4 rouges, témoin vert).
  · **(e) l'éditeur d'échelle NEUVE porte le bloc des repères** — sur un tampon
    (`_reperesNouvelleEchelle`), avec les MÊMES refus (`refusRepereEchelle` sur l'échelle en cours de
    saisie), la même règle du vide, et une **revérification à l'enregistrement** : un code renommé après
    avoir été désigné ne part pas en base, l'enregistrement le dit et attend. Seuls les repères posés
    sont écrits — jamais de clé vide. L'aperçu des deux éditeurs n'a plus qu'**un producteur**
    (`apercuNiveauxEchelleHtml`) : celui de l'échelle neuve ne disait pas la zone. `blocReperesEchelle`
    paramétré par handler (deux appelants, plus un troisième dans l'assistant).
    Sentinelle `sentinelle-555-e-reperes-echelle-neuve` (13 cas, 5 mutations, 5 rouges) + cas WebKit
    dans `echelle-reperes-maitrise-rendu.spec.js` : le `change` natif passe par le dispatcher jusqu'au
    tampon, et le refus se VOIT (liste marquée `champ-refuse`, valeur refusée gardée — même contrat que
    l'éditeur vivant, ce que ma première assertion avait faux).
  ⏳ **CE QUI RESTE DE #555** : (a) `evaluation-retroaction.js` — **MESURÉ ce soir : 0 comparaison IDME
  en dur dans le code exécutable** (commentaires retirés) ; la ligne « 8 lignes / 18 comparaisons »
  plus bas est PÉRIMÉE, (a) a été livré à 14 h 05 (1.105.0). Restent deux décisions, pas du code : la
  zone intermédiaire comme progrès, et l'intention P1 « demander à l'utilisateur dans Outils
  d'observation ».
  ✅ **DEUX ARBITRAGES DE GRÉGOIRE, le 28 août 2026 au soir** (registre : artefact « Arbitrages Labo Codex »).
  **(1) Le repli quand le repère n'est pas lisible — option B** : la matrice de consolidation **ne calcule
  RIEN et le dit**, exactement comme un niveau sans `valeurCalcul`. Le repli `0,75` disparaît de
  `_detecterSeuilMaitrise` ; il n'y a plus de valeur métier devinée par le code.
  ⮕ **Grégoire a d'abord répondu C, puis est revenu à B** quand on lui a signalé que sa note décrivait
  autre chose que l'option cochée. L'option C (calculer chez lui, refuser ailleurs) est donc ÉCARTÉE.
  ⮕ **Son intention pour plus tard, qui n'est pas la décision d'aujourd'hui** : « *Dans une version
  antérieure, la question était posée directement à l'utilisateur dans les « Outils d'observation ».
  Ce bloc a disparu. On devrait revenir à cette pratique. C'est l'utilisateur qui use de son jugement
  ici.* » ⚠ **MESURÉ le 28 août — le bloc n'a PAS disparu** : le curseur « Seuil de défi » est toujours
  à l'écran (`index.html:8764`, Labo → Outils d'observation). Mais il règle `defiSpecifique`, **pas** le
  seuil de maîtrise de la matrice : deux réglages différents sous des noms voisins, ce qui est exactement
  la collision de #555 (d). Rebrancher l'existant ne réaliserait donc PAS son intention — il faut un
  second réglage, ou lier la matrice aux deux repères de l'échelle.
  **(2) Le nommage (d) — option A** : le **CODE de niveau** garde `seuilMaitrise`, les quatre autres sens
  deviennent explicites. Voir #577, tranché du même geste, et la réserve « PAN-STD » qui y est consignée.
  ⮕ **LOT 2 LIVRÉ le 28 août 2026 (12 h 20) — B10b EST CLOS.** Grégoire a posé ses deux repères, ce qui
  a débloqué le branchement. `zoneDuNiveau(code, echelleId)` (`profil-etudiant-calculs.js`) rend
  `'priorite'` / `'signale'` / `'acquis'` / `null` ; `synthese-retroaction-data.js` passe de **14
  comparaisons IDME en dur à ZÉRO** (mesuré sur le code exécutable, commentaires filtrés).
  · **`null` n'est pas une quatrième zone**, c'est un refus de répondre — échelle non résolue, code
    étranger, ou échelle sans aucun repère. Le module ne rend alors RIEN, et sans note technique :
    `copierToutRetroaction` copie ce bilan dans ce qui est remis à l'élève.
  · **Chaque évaluation est lue dans SON échelle.** L'historique, l'antérieure et la courante peuvent
    porter des barèmes différents. Deux fautes de ce type ont été trouvées par le break-test SEUL.
  · **Règle d'origine préservée** : « tu as progressé » reste `priorite → acquis`. Passer d'une priorité
    à « signalé » n'est pas annoncé. ⏳ **À trancher avec Grégoire** si la zone intermédiaire doit
    compter comme un progrès — ce serait une décision, pas un effet de bord.
    ✅ **TRANCHÉ le 29 août 2026, 8 h 18 — OPTION C : toute montée de zone est un progrès, dit selon la zone
    d'arrivée** (arrivée en « signalé » = progrès à consolider ; arrivée en « acquis » = progressé). Les trois
    passages montants sont annoncés dans la ligne « Progrès » du PDF ET du bilan à l'écran. Non tranché : les
    descentes de zone (rien n'est annoncé, aucune option ne l'ajoutait) ; les libellés = ses mots.
    ✅ **TRANCHÉ le 29 août 2026, 8 h 18 — intention « Outils d'observation », OPTION A : CLORE.** Le repère
    « Maîtrisé à partir de » de l'échelle EST le réglage utilisateur ; aucun second réglage. Reste : une
    explication à l'écran du curseur « Seuil de défi » (ce qu'il règle : le dépistage ; ce qu'il ne règle
    pas : la matrice), libellé à écrire avec Grégoire. Artefact : voir #578.
    ⮕ **EXÉCUTION CONSTATÉE le 30 août 2026** — et la puce « Règle d'origine préservée » ci-dessus était
    DÉJÀ PÉRIMÉE quand l'artefact l'a reprise : écrite le matin du 28 à la livraison du branchement, jamais
    mise à jour après la décision « option 3 » de l'après-midi qui a mis les trois montées dans le code.
    L'option C du 29 CONFIRME l'existant, elle ne le change pas. L'explication du curseur est LIVRÉE le
    30 août. Détail et sentinelles : bloc de clôture en tête d'item.
  · Le test qui CONSTATAIT « 6 sites / 14 comparaisons » est devenu un **ratchet à zéro**. Il n'a pas
    été « réparé » en changeant le chiffre.
  · Deux retraits : `rangOuDernier` (repli `Infinity` devenu inatteignable) et le repli de
    `dupliquerEchelle`, qui **perdait les deux repères** — trouvé par une question de Grégoire sur le
    namespace, pas par relecture.
  ⏳ **CE QUI RESTE DU LOT 2** : (a) `evaluation-retroaction.js`, **8 lignes / 18 comparaisons**, le
  bilan à l'écran ; (b) ✅ FAIT — `_detecterSeuilMaitrise` (`consolidation.js`) ; (c) ✅ FAIT — les quatre replis divergents
  `0,70` / `0,75` ; (d) le nommage (`seuilMaitrise` porte quatre sens) ; (e) **#579** et **#580**
  ci-dessous, ouverts par ce lot.
  ⮕ **LOT 1 LIVRÉ le 28 août 2026 — LA DÉCISION D'ARCHITECTURE EST PRISE ET LE MODÈLE EXISTE.**
  Grégoire, sur question fermée en 3 options : **DEUX repères, pas un.** Motif, dans ses mots : sa
  gradation PAN-Standards distingue **trois** états, pas deux — au-dessous l'apprentissage est
  insuffisant, entre les deux il est **réel mais non durable** (« maîtrisé, mais en développement »),
  au-dessus il est acquis. Une seule frontière aurait forcé « en développement » dans l'une ou l'autre
  case, et la rétroaction remise à l'élève aurait dit autre chose que ce qu'il pense.
  · **Modèle** : `echelle.seuilSuffisance` et `echelle.seuilMaitrise`, des CODES de niveau, portés par
    l'ÉCHELLE et non par ses niveaux (un marqueur par niveau autoriserait zéro marque ou trois).
    **L'égalité est permise** : poser les deux sur le même niveau = le modèle à une frontière, sans
    champ de plus. **L'absence reste un état légitime et rien n'est deviné** — ni par les lettres, ni
    par une position, ni par un pourcentage.
  · **Édition** : bloc « Repères de maîtrise » dans l'éditeur vivant (`#tableauNiveauxEchelle`), SOUS
    les niveaux (il désigne des niveaux qui doivent déjà exister), masqué si l'ordre des plages n'est
    pas lisible. L'aperçu nomme la zone de chaque niveau — sans quoi le choix serait un formulaire sans
    effet visible.
  · **Validation** : code absent de l'échelle → refus ; suffisance au-dessus de la maîtrise → refus,
    dans les DEUX sens ; ordre illisible → refus (jamais une devinette) ; le vide RETIRE le repère au
    lieu d'écrire une chaîne creuse. Écriture par `db.modifier` (#510), refus calculé DANS la
    transaction.
  · **`ordonnerNiveauxParPlage`** extrait de `niveauxOrdonnesDeLEchelle` (#575) : `echelles.js` range
    les niveaux qu'il tient sans recopier la règle ni relire ce qu'il modifie.
  · Sentinelles : `sentinelle-555-reperes-maitrise-echelle` (12 cas, **11 mutations, 11 rouges**) et
    `echelle-reperes-maitrise-rendu.spec.js` en **WebKit** (**4 mutations, 4 rouges**) — le rendu ne se
    prouve pas dans `node`. Fixtures sans aucune lettre d'IDME, saisies dans le désordre.
  ⮕ **TROUVAILLE DU 28 AOÛT (11 h 50), NI À L'AUDIT NI DANS LES 19 SITES.**
  `consolidation.js` DEVINE déjà ce que le lot 1 vient de rendre explicite.
  `_detecterSeuilMaitrise(echelle)` porte en commentaire sa propre convention :
  « **avant-dernier niveau = maîtrise**. Son `min / 100` = seuil. Fallback : **0.75** ».
  · Sur l'échelle de Grégoire (I, D, M, E), l'avant-dernier EST M : la convention tombe juste **par
    coïncidence**, et c'est pour cela que personne ne l'a vue.
  · Sur une échelle à trois paliers, l'avant-dernier est le niveau du MILIEU. Sur une échelle qui porte
    un « 0 » de jugement suspendu, le compte se décale. Sur une échelle dont les lettres sont ordonnées
    autrement, elle désigne n'importe quoi.
  · Le repli `0.75` est un **CINQUIÈME** repli divergent, en plus des quatre listés plus haut.
  ⚠ **CHEMIN VIVANT, RENDU À L'ÉCRAN** : `calculerConsolidationIndividuelle` ←
  `profil-etudiant-diagnostics.js:612` (matrice de consolidation). Vérifié, pas supposé.
  ⮕ C'est le consommateur le plus direct des deux repères : la convention disparaît, le champ la remplace.
  ✅ **LIVRÉ le 28 août 2026.** `_detecterSeuilMaitrise` LIT `echelle.seuilMaitrise` (un CODE, comparé
  sans tenir compte de la casse) et rend **`{valeur, deduite, raison}`** au lieu d'un nombre nu.
  ⮕ **DÉCISION DE GRÉGOIRE, prise en séance** : quand le repère n'est PAS posé, la matrice **CALCULE
  ET LE DIT** — une mention paraît sous le bloc Consolidation. Ni devinette muette (c'est elle qui a
  produit le défaut), ni fonction retirée aux expérimentateurs qui n'ont pas encore posé leurs repères.
  Quatre raisons distinctes, chacune avec son libellé : `repere-non-pose`, `repere-introuvable` (le
  code désigne un niveau supprimé depuis — une incohérence de données, à ne PAS confondre avec une
  absence), `repere-sans-min`, `echelle-non-resolue`.
  · Les cinq comparaisons internes restent numériques ; la réserve voyage à côté, jusqu'au HTML.
  · **Un piège corrigé au passage** : `(niveauMaitrise.min || 75)` remplaçait par 75 un `min` valant
    **0**, qui est un cran d'échelle légitime — cf. [[project-niveau-zero-jugement-suspendu]]. Devenu
    `min != null`.
  · Le repli `0.75` de l'échelle non résolue SUBSISTE, faute de pouvoir dériver quoi que ce soit, mais
    il n'est plus muet. Un `null` était tentant et faux : `_construireConversion` sait lire un score
    numérique sans échelle, donc des scores peuvent exister, et `score >= null` est vrai dès 0.
  · Sentinelle `sentinelle-555-seuil-maitrise-lu-non-devine` (12 cas), dont **le cas qui prouve le
    branchement** : une échelle où le repère et l'avant-dernier niveau DIVERGENT — seul montage qui
    distingue une lecture d'une devinette. **7 break-tests, 7 rouges isolément**, dont trois sur le
    RENDU (`genererBlocConsolidation` monté en sandbox) : réserve retirée du bloc, réserve affichée
    même sur un seuil lu, libellé unique pour les quatre raisons.
  ⮕ `_detecterSeuilMaitrise` est **exposée sur `window`** pour cette sentinelle : fonction pure dont
  les cas limites (min à 0, code introuvable, repère sans borne) ne sont pas atteignables par
  `calculerConsolidation*` sans monter un jeu complet de données — et un montage incomplet mesure des
  zéros. Même précédent que #572.
  ⚠⚠ **ET UNE COLLISION DE VOCABULAIRE, DÉJÀ DANS LE CODE.** Le nom `seuilMaitrise` désigne aujourd'hui
  **quatre choses de types différents** : le CODE de niveau du lot 1 (`echelles.js`), un score 0-1
  détecté (`consolidation.js`), un seuil de préférence 0-1 (`obtenirSeuil('idme.maitrise')`,
  `profil-etudiant-helpers.js` / `-calculs.js`), et un pourcentage 0-100
  (`pratique-notation-v2.js:279`). Aucune collision d'exécution — mais quatre sens sous un mot, et le
  lot 1 en a ajouté un cinquième. ⮕ **Trancher le nommage avec Grégoire au lot 2**, en même temps que
  celui de l'assistant (#577) : c'est le même arbitrage, sur le même mot.

  ⏳ **CE QUI RESTE (lot 2)** : (a) ✅ FAIT — **Grégoire a posé ses repères** le 28 août au matin
  (« mes repères sont posés sur mon échelle ») ; (b) le **lecteur unique** « zone d'un code » — la
  matrice de consolidation lit désormais le repère (28 août), mais chaque consommateur porte encore
  sa propre lecture : le lecteur COMMUN reste à extraire ; (c) **brancher les
  consommateurs** — B10b (6 sites / 14 comparaisons), `evaluation-retroaction.js` (8 lignes / 18) ;
  (d) ✅ **unifier les quatre replis divergents** — FAIT le 28 août 2026 (et ils étaient sept, tous
  inatteignables : voir la mesure ci-dessous) ; (e) l'éditeur d'échelle NEUVE
  (`afficherNiveauxNouvelleEchelle`), qui écrit dans un tampon avant création — les repères s'y posent
  après enregistrement, ce qui est acceptable mais reste à finir.
  ⮕ **SUCCESSEUR : #577** — l'assistant de configuration des pratiques ignore ces deux champs.
  ⚠ **Aucun lecteur n'est branché tant que (a) n'est pas fait** : brancher avant que les échelles
  portent leurs repères retirerait la fonction chez tout le monde, Grégoire compris.
  Créé le 27 août 2026. C'est le **point de convergence** identifié au §6 de la consigne #552 : cinq
  items butent sur la même chose manquante (#552 clos, #551, #535 clos, #549, pas 3c-3 de #542).
  ⚠ **L'ÉTAT MESURÉ.** `obtenirSeuil('defiSpecifique')` a un défaut à **0,70**
  (`interpretation-config.js:48`) et des **replis en dur qui ne s'accordent pas entre eux** :
  `|| 0.70` dans `profil-etudiant-calculs.js` et `interventions.js`, `|| 0.75` dans
  `profil-etudiant-sections-affichage.js` et `pratique-pan-standards.js`. Deux fichiers répondent
  donc différemment à la même question quand la préférence est absente.
  ⚠⚠ **CETTE DERNIÈRE PHRASE EST FAUSSE — mesuré le 28 août 2026, et le chantier est LIVRÉ.**
  Quand la préférence est absente, tout le monde obtient **0,70** : `obtenirSeuil`
  (`interpretation-config.js:139`) retombe sur `SEUILS_PAR_DEFAUT`, et `chargerSeuilsInterpretation`
  auto-guérit le stockage incomplet. Les replis `|| 0.70` / `|| 0.75` ne se déclenchaient donc que
  sur une valeur **falsy**, qu'aucun des trois chemins d'écriture ne peut produire
  (`interpretation-config.js:108`, `:119`, `preferences-v2.js:294` — ce dernier transformant même une
  saisie de 0 en 0,70), et `seuilsInterpretation` ne transite ni par l'import ni par le Codex.
  ⮕ **Ce n'étaient pas deux comportements, mais quatre VALEURS MORTES documentant deux conventions
  contradictoires.** Le risque n'était pas un calcul faux : c'était qu'un lecteur prenne 0,75 pour la
  règle. Qui traite cet item en croyant corriger deux comportements corrigera des zéros.
  ⚠ **ET IL Y AVAIT TROIS SITES DE PLUS QUE LES QUATRE ANNONCÉS** : `pratique-pan-standards.js:1404`
  (table de repli locale de `_obtenirSeuil`, `defiSpecifique` à **0,75** contre 0,70 à la source — ses
  deux autres valeurs, `idme.insuffisant` 0,64 et `idme.developpement` 0,75, concordaient) · son repli
  final `|| 0.75`, arbitraire · `profil-etudiant-calculs.js:1151` et `:1526`, qui n'ont **aucun**
  repli — un troisième comportement que l'énoncé ne nommait pas.
  ⮕ **LIVRÉ le 28 août 2026.** Replis retirés (`profil-etudiant-calculs.js:1020`,
  `profil-etudiant-sections-affichage.js:3147`, `pratique-pan-standards.js:1023`) ; le `|| 0.70`
  d'`interventions.js` confondait **garde de chargement** et **repli de valeur** sous un seul
  opérateur — séparés, la garde subsiste (réelle en test ; en production `interpretation-config.js`
  est chargé avant, `index.html:14451`) ; table miroir alignée sur la source et son repli final retiré
  (un seuil inconnu est une erreur d'appel, pas un cas à deviner — les 3 appelants sont tous dans la
  table, vérifié). Sentinelle `sentinelle-555-replis-seuil-defi` (6 cas) : elle **compare** à
  `SEUILS_PAR_DEFAUT` au lieu de recopier 0,70, commentaires filtrés avant assertion. **6 break-tests,
  6 rouges isolément** — dont celui qui compte : porter la source à 0,80 SEULE fait rougir les deux
  miroirs. `progressionArtefacts` (`profil-etudiant-calculs.js:1021`) porte le même patron de repli
  mort, mais **concordant** : laissé tel quel, inscrit ici plutôt que corrigé au passage.
  ⮕ **CE QUI MANQUE VRAIMENT** : la **marque de seuil sur l'échelle** — quel niveau, dans l'échelle
  de CET utilisateur, marque le passage à la maîtrise. Un niveau porte déjà `code`, `nom`, `min`,
  `max`, `valeurCalcul`, `couleur` et, depuis 1.103, une étiquette SOLO facultative.
  ⏳ **DÉCISION D'ARCHITECTURE, pas un pas de refactor** : un champ, un écran d'édition, une
  migration. À poser à Grégoire avant d'écrire une ligne.
  ⮕ ~~**Premier pas possible et sans décision** : unifier les quatre replis divergents.~~
  ✅ **FAIT le 28 août 2026** — voir la mesure ci-dessus, qui corrige l'énoncé au passage.
  ⮕ **AJOUT DU 28 AOÛT (B10a).** Le recensement des consommateurs de la marque est maintenant complet et
  mesuré, pas estimé : `synthese-retroaction-data.js` **6 sites / 14 comparaisons** (le PDF remis à
  l'élève), `evaluation-retroaction.js` **8 lignes / 18 comparaisons** (le bilan à l'écran). Les deux
  portent un test qui CONSTATE ces comptes et rougira le jour de la décision — c'est le signal voulu, pas
  une régression à réparer en changeant les chiffres.
  ⮕ **Et une leçon de méthode, payée sur B10** : « l'ordre des niveaux » et « la marque de maîtrise »
  cohabitaient dans les mêmes lignes et paraissaient une seule butée. Le premier se dérive des plages de
  l'échelle, la seconde non. La moitié dérivable a été livrée sans rien décider. ⮕ Vérifier de même, pour
  les quatre autres items en attente de #555, ce qui n'attend pas vraiment.

- [ ] **#577 — L'assistant de configuration des pratiques ignore les deux repères de maîtrise.**
  ✅ **LIVRÉ le 28 août 2026 (soir)** — décisions A1 (option A) et A3 (option A) exécutées.
  · L'étape **« Échelle de performance »** (`echelle-performance`, STD/SPE) rend, SOUS la liste des
    échelles, le bloc « Repères de maîtrise » de l'échelle CHOISIE — **le bloc de l'éditeur lui-même**
    (`blocReperesEchelle`, handler `wizardV2ModifierRepereEchelle`), pas une copie. Choisir une échelle
    re-rend l'étape (`rafraichir: true`, même mécanique que le garde-fou a4).
  · L'écriture passe par **`ecrireRepereEchelle`** (extraite de `modifierRepereEchelle`, echelles.js) :
    même transaction `db.modifier`, mêmes refus, même règle du vide — SANS prendre
    `echelleTemplateActuelle` ni redessiner `#tableauNiveauxEchelle`, qui vit dans un autre écran.
    Après écriture, l'étape est re-rendue : listes et aperçu (zones) disent l'état enregistré.
  · **Trois états, et chacun se dit** : aucune échelle choisie → rien ; ordre des plages illisible →
    renvoi à Conception → Échelles, une fois chaque niveau doté d'un code et d'une borne « Min » ;
    repère manquant → avertissement ambre : « Sans ces deux repères, la rétroaction remise à l'élève ne
    peut ni nommer ses priorités ni dire ce qui est acquis. » **On peut avancer sans** (l'option (c)
    « refuser d'avancer » n'a pas été retenue : A3 dit « poser dans l'assistant », pas « bloquer »).
  · Le **récapitulatif** dit si les repères sont posés, et ce que leur absence coûte.
  · **Vocabulaire** : l'étape ne dit jamais « seuil » (le mot est au dépistage) — une assertion le garde.
  · **Modifiable après coup** (précision de Grégoire sur #579) : oui, dans Conception → Échelles, c'est
    le même champ sur la même échelle.
  Sentinelle `sentinelle-577-assistant-reperes-echelle` (11 cas, wizard + echelles.js dans le même
  bac à sable ; 6 mutations, 6 rouges) + spec WebKit `wizard-577-reperes-echelle-rendu.spec.js`
  (`afficherEtapeWizardV2` exposée pour rendre l'étape dans le vrai DOM ; le `change` natif écrit en
  base par le dispatcher ; l'échelle de test est retirée du localStorage partagé en `finally`).
  ⏳ **CE QUI RESTE, ET QUI N'EST PAS UN OUBLI** :
  · **DEN** (`config-denotation`) : son échelle est « pour la rétroaction, pas le calcul » ; les repères
    y ont un autre sens — **non tranché, donc pas recopié**. Une assertion documente le choix.
  · **Réserve A1** (« PAN-STD ici ; ce pourrait être différent pour d'autres PAN, voire d'autres
    utilisateurs ») : les libellés « suffisant / maîtrisé » viennent d'UNE source (`REPERES_ECHELLE`) ;
    les rendre configurables PAR FAMILLE de pratique est un chantier distinct, à ouvrir sur un besoin
    exprimé par un expérimentateur, pas avant.
  ✅ **ARBITRÉ PAR GRÉGOIRE le 28 août 2026 — option A**, en même temps que #555 (d) : le **CODE de
  niveau** garde le nom `seuilMaitrise` ; les quatre autres sens deviennent explicites.
  ⮕ Sa réserve, à ne pas perdre : « **On parle de la pratique PAN-STD ici. Ce pourrait être différent
  pour d'autres PAN. Voire même pour d'autres utilisateurs.** » Le nom retenu vaut pour une famille de
  pratique, pas pour l'application entière — l'assistant doit pouvoir en nommer un autre ailleurs.
  Créé le 28 août 2026, **demande de Grégoire**, à la livraison du lot 1 de #555. Une échelle porte
  désormais `seuilSuffisance` et `seuilMaitrise` ; **l'assistant (`wizard-pratique-v2.js`) n'en sait
  rien.** Il fait choisir une échelle et passe à la suite, alors que c'est précisément le moment où
  l'utilisateur pense sa pratique — et le seul moment où on peut lui demander où commence la maîtrise
  sans que la question tombe de nulle part.
  ⚠ **PAN-STD en premier** : `'standards'` se décrit comme « Tu évalues par niveaux de maîtrise
  (ex. : I-D-M-E) ». C'est la famille dont le calcul REPOSE sur les niveaux, donc celle où des repères
  absents se paient le plus cher. Mais l'étape concernée les sert toutes.
  ⮕ **L'ÉTAT MESURÉ (28 août, au code).**
  · `'echelle-performance'` (ordre 7, branche finale, `condition: typePratique !== 'sommative'`) —
    un seul champ, `echelleId`, **`required: true`**. Aucune mention des repères.
  · Un second `select-echelle` **facultatif** pour DEN (`infoMaterielDen`), présenté comme servant « à
    la rétroaction, pas au calcul ». Les repères y ont un sens différent : à trancher, pas à recopier.
  · **L'assistant ne touche jamais `obtenirSeuil('defiSpecifique')`** — vérifié au grep : aucune
    occurrence. Les quatre replis divergents de #555 lui sont donc étrangers.
  ⚠⚠ **LE PIÈGE DE VOCABULAIRE, ET IL EST DÉJÀ DANS L'ÉCRAN.** L'assistant a une étape
  `'seuils-personnels'` (« Ces seuils servent au dépistage automatique des étudiant·es en difficulté »)
  avec `seuilVaBien`, `seuilDifficulte`, `seuilGrandeDifficulte`, plus un `seuilVerrou` ailleurs.
  **« Seuil » y désigne déjà le dépistage.** Y ajouter « seuil de suffisance » et « seuil de maîtrise »
  sans les distinguer mettrait deux notions sous un même mot, dans le même parcours. ⮕ Trancher le
  vocabulaire AVEC Grégoire avant d'écrire l'écran — cf. [[feedback_vocabulaire_simple]].
  ⮕ **CE QUI EST À DÉCIDER, ET QUI NE M'APPARTIENT PAS** : l'assistant doit-il (a) seulement RAPPELER
  que l'échelle choisie porte — ou ne porte pas — ses repères, avec un lien vers l'éditeur ; (b) les
  faire poser sur place ; ou (c) refuser d'avancer tant qu'ils manquent, pour une famille dont le
  calcul en dépend ? (c) est le plus cohérent et le plus brutal pour qui découvre l'outil.
  ⏳ **DÉPEND DE #555 lot 2** : tant qu'aucun lecteur ne consomme les repères, l'assistant n'aurait
  rien à garantir. À reprendre APRÈS, et pas avant.
- [ ] **#536 — `idmeMoyen` rend 0 quand rien n'est convertible, au lieu de « pas de donnée ».**
  Repéré pendant #529 et VOLONTAIREMENT NON CORRIGÉ : le contrat de
  `calculerIndicateurs3DerniersArtefacts` distingue déjà l'absence par `nbArtefacts`, et ses
  consommateurs s'y fient. Changer la convention dans le même diff qu'un chantier de
  dé-codage-en-dur aurait mêlé deux corrections dont une n'était pas demandée.
  ⮕ Le risque a beaucoup baissé depuis #529 : les niveaux d'une échelle non-IDME sont désormais
  convertibles, donc le cas « rien de convertible » ne survient plus que sans échelle du tout.
  ⮕ Commentaire posé sur place (`⚠ LE ZÉRO EST CONSERVÉ ICI, DÉLIBÉRÉMENT`).

- [ ] **#548 — La garde #340 est probablement INERTE sur les données réelles de Grégoire.**
  ⚠ **RENUMÉROTÉ #533 → #548 le 27 août 2026, sur arbitrage de Grégoire.** Deux chantiers sans
  rapport ont porté #533 le 26 août : celui-ci, **inscrit** au backlog, et « la garde lourde passe
  avant la connexion », seulement **employé** — dans `DEPLOY.md`, `scripts/pousser.sh`,
  `scripts/lire-verdict.mjs`, `scripts/verifier-playwright.mjs`, `tests/playwright.config.js` et
  `tests/unit/sentinelle-533-verdict-avant-connexion.test.js`. Neuf fichiers contre un : c'est
  celui-ci qui bouge, et **#533 reste à l'autre**.
  ⮕ **L'arbitrage disait « devient #540 ». #540 n'était plus libre** — la soirée du 26 l'avait
  attribué au chantier de l'assiduité, clos en cinq lots. Appliquer le verdict à la lettre aurait
  **recréé la collision qu'il éteignait**. L'ID retenu est donc le prochain réellement libre au
  moment d'écrire, vérifié au backlog et non recopié d'un document : **#548**.
  ⮕ C'est le cas d'école de [[feedback-id-backlog-inscrire-avant-usage]] : entre le moment où un
  numéro est arbitré et celui où il est appliqué, le dernier ID a bougé.
  Mesuré le 26 août en fermant #530, par un test qui reproduit le cas ordinaire
  (`productions-ajout-refus-garde-340.spec.js`, test « périmètre ») : `construireMapCoursTrimestre`
  ne rattache un `coursId` à un trimestre **que s'il n'apparaît QUE là**. Un cours reconduit d'une
  session à l'autre — 601-101, chaque automne et chaque hiver — est vu dans PLUSIEURS trimestres,
  donc « non attribuable », donc neutre. **Vérifié** : deux productions 100 % étrangères passent
  sans être bloquées.
  ⮕ **Ce n'est pas un oubli, c'est un prix payé** : le 22 août, la garde ancrée sur
  `cours.trimestreId` refusait TOUTE écriture dans son trimestre (`b598fb5a`). La prudence actuelle
  a été choisie contre ce blocage-là, et elle est défendable.
  ⮕ **Mais le symptôme qu'elle devait couvrir est VÉCU** : l'incident de juin (#340 / résurrections
  IDB) — des productions A25 écrites sous clé H2026. Cette protection-là n'existe plus en pratique.
  ⏳ **À TRANCHER PAR GRÉGOIRE, pas par moi** : accepter l'inertie (la garde ne sert plus qu'aux
  cours vus une seule fois), ou ré-armer par une autre source. Piste : `productions[].coursId` seul
  ne suffit pas ; il faudrait un marqueur de trimestre POSÉ À L'ÉCRITURE, pas déduit après coup.
  ⚠ Ne pas « améliorer » la règle d'attribution sans relire `b598fb5a` — le test de périmètre
  rougira, et c'est voulu.

- [x] **#531 LIVRÉ 26 août 2026 (1.100.0)** — un modèle de cartouche à faire remplir par une IA.
  Demande de Grégoire : télécharger un squelette construit depuis la grille et l'échelle choisies,
  le faire remplir, le réimporter.
  ⮕ **Le format existait déjà** (`exporterCartoucheEnTexte`), mais il exporte une cartouche QUI
  EXISTE. Ce qui manquait, c'est le squelette AVANT qu'il y en ait une. La structure des lignes est
  désormais écrite **une seule fois** (`lignesMatriceCartouche`) et partagée par les deux : deux
  copies divergeraient, et un modèle qui ne se relit pas ne sert à rien.
  ⚠⚠ **CE QUI BLOQUAIT, ET QUI ÉTAIT DÉJÀ CASSÉ AVANT LA DEMANDE.** Trois fonctions d'import lisaient
  le code de niveau avec une classe EN DUR, et **pas la même** : `importerCartoucheDepuisTxt` avec
  `([IDME0])`, `importerCommentaires` et `parserMarkdownCartouche` avec `([IDME])`. L'échelle de
  Grégoire est « 0-IDME (5 niv.) » : **selon le bouton emprunté, ses commentaires de niveau 0
  revenaient ou disparaissaient en silence**. Une échelle A/B/C/D n'était lue par aucun des trois.
  ⮕ Les codes viennent maintenant de l'ÉCHELLE (`codesNiveauxPourLecture`, `lireLigneCommentaire`),
  avec échappement des caractères de regex. **Sous-ensemble minimal de #529**, livré parce que la
  demande ne bouclait pas sans lui — le reste (SRPNF, l'affichage, le calcul) attend sa session.
  ⮕ **Consignes en tête du fichier** (verdict de Grégoire) : format exact à ne pas déformer, une
  ligne par commentaire, ne rien changer entre les `**`. Un assistant laissé libre reformate, et un
  fichier reformaté ne se réimporte plus. Elles sont en citation Markdown, que le parseur ignore
  sans qu'on ait à le lui demander.
  ⚠ **Un break-test a montré du code INUTILE, et il a été retiré** : le tri des codes par longueur
  décroissante « pour qu'un code court ne masque pas un code long » ne change rien — le `\)` qui suit
  l'alternance force le retour arrière, et « M+ » est trouvé même si « M » est essayé d'abord. Retiré
  plutôt que gardé « au cas où », avec la raison écrite pour que personne ne le remette.
  Vitest **3387/3387** (322 fichiers). Deux break-tests : l'échappement mord, le tri ne mordait pas.

### Constats de l'audit du 25 août ENCORE OUVERTS

> Les six correctifs ci-dessus (#509 à #515) épuisent ce qui ne demandait pas d'arbitrage de
> Grégoire. Restent, du rapport `Rapports/AUDIT-conception-gabarits-2026-08-25.md` :

- [x] **#516 LIVRÉ 26 août 2026** ✅ **TRANCHÉ : REFUSER l'enregistrement d'un critère sans nom** (verdict D1), **+ exigence : astérisques ROUGES partout, pas de bleu**. ⮕ Cause du bleu trouvée le jour même : `.text-danger` n'a AUCUNE règle de couleur dans le projet — 28 astérisques héritent de la couleur de leur label ; `.champ-requis` (3 usages, nom français) est correctement rouge. Le chantier unifie donc sur `.champ-requis`. 📐 **A3 — l'astérisque « Nom du critère » promet un refus qui n'existe pas.**
  La légende (#506) dit « Champ obligatoire — l'enregistrement est refusé sans lui ». Reproduit au
  navigateur : une grille dont un critère a un nom VIDE s'enregistre sans aucun refus. La « preuve »
  de la sentinelle #506 pour ce champ vit dans `sauvegarderCritere()`, qui lit `#critereNom` — un id
  ABSENT d'index.html. La garde textuelle est donc ancrée sur du code mort et la sentinelle passe à
  vide (motif AP-2). **Décision requise** : valider réellement (attention à l'autosave) OU retirer
  l'astérisque de ce champ. Dans les deux cas, réancrer la preuve sur le chemin vivant.

  ⮕ **LIVRÉ EN TROIS VOLETS.**
  1. **Les astérisques sont rouges partout** : `.text-danger` n'avait AUCUNE règle de couleur dans
     le projet — ses 29 porteurs héritaient de la couleur de leur label. Unifiés sur `.champ-requis`
     (nom français, `--rouge-erreur`, déjà utilisée par 3 champs). ⚠ `text-danger-bs` et
     `text-danger-red-bold` sont d'AUTRES classes, avec leur propre couleur : épargnées par une
     limite de mot dans le remplacement.
  2. **Le refus a lieu** : `modifierCritereGrille` n'écrit plus un nom vide et rend `{refuse}`.
     ⚠ **On refuse l'écriture, on ne bloque pas la frappe** — ces champs s'enregistrent au blur, et
     restaurer l'ancienne valeur ferait se re-remplir le champ sous les doigts de quelqu'un qui vide
     pour retaper. L'écran garde ce qui est tapé, le champ est marqué `.champ-refuse`, et la raison
     est dite UNE fois (trois blurs ne font pas trois bandeaux).
  3. **La preuve est réancrée.** La garde #506 cherchait une CHAÎNE dans les sources, et la trouvait
     dans `sauvegarderCritere()` — fonction qui lit `#critereNom`, id absent d'index.html, sans
     appelant vivant. Elle pointe désormais le chemin vivant, et le refus est EXÉCUTÉ par
     `sentinelle-516-nom-critere-refuse.test.js` (10 cas). Un texte trouvé dans un fichier ne
     prouvera plus qu'un refus a lieu.
  ⏳ **Code mort laissé en place, à verser à #469** : `sauvegarderCritere()` et `sauvegarderEtFermer()`
     (exportée, jamais appelée). Elles ne trompent plus aucune sentinelle, mais elles sont toujours là.
  Vitest **3331/3331** (317 fichiers). Trois break-tests, trois ROUGE.

- [x] **#517 LIVRÉ 26 août 2026** ✅ **TRANCHÉ : ENREGISTREMENT AUTOMATIQUE**, comme les grilles et les échelles (verdict D2). Le namespacing des cartouches (CO-33/D1 du 21 août) reste un chantier SÉPARÉ et POSTÉRIEUR (verdict D3) — une migration de données doit pouvoir être annulée seule. 📐 **B1 — la matrice de cartouche ne vit qu'en RAM jusqu'au bouton Enregistrer.**
  `sauvegarderCommentaire()` écrit en mémoire seulement ; la persistance n'arrive qu'au bouton, en
  bas d'un écran long. Aucun garde-fou : changer de cartouche, de sous-onglet ou fermer l'app perd
  toute la saisie, en silence. C'est le modèle INVERSE des grilles et des échelles (autosave champ
  par champ) — cette incohérence entre sous-onglets voisins nourrit à elle seule la perception
  « des fois ça enregistre, des fois non ». **Décision requise** : autosave comme les voisins OU
  garde-fou « modifications non enregistrées ». À trancher AVANT de coder.
  ⚠ L'écran cartouche est aussi le seul des quatre sans barre d'actions en tête (#503 visait « les
  trois écrans » — mais l'utilisateur, lui, en voit quatre).

  ⮕ **LIVRÉ.** `sauvegarderCommentaire` persiste chaque cellule, et le CONTEXTE aussi (il ouvre
  chaque rétroaction reçue par un·e étudiant·e : le perdre coûte autant qu'une cellule).
  ⚠ **Chemin SÉPARÉ de `sauvegarderCartouche()`**, délibérément : celle-ci valide le nom par une
  alerte bloquante et interroge sur les doublons. La réveiller à chaque frappe ouvrirait une boîte
  de dialogue au milieu d'une phrase. `persisterCartouchePartielle` écrit le strict nécessaire.
  ⚠ **Le NOM reste au bouton** — il déclenche la vérification de doublons, qui pose une question.
  Une question par frappe n'est pas un enregistrement automatique.
  ⚠ **Une cartouche jamais enregistrée n'écrit rien** : même modèle que les grilles et les échelles,
  dont critères et niveaux ne s'autosauvent qu'une fois l'objet créé.
  ▣ **Passe par `db.modifier` (#510)** : deux cellules quittées coup sur coup liraient sinon le même
  instantané. Réintroduire cette course en la connaissant aurait été impardonnable.
  ⚠ **Faux-vert attrapé au break-test** : le banc rendait la MÊME référence à chaque lecture, ce qui
  rend la course structurellement impossible — le test de la course passait au vert quoi qu'il
  arrive au code. Le harnais sérialise désormais, comme une vraie base.
  ⏳ **Non fait** : la barre d'actions en tête sur ce quatrième écran (#503 visait « les trois
  écrans »). Hors du verdict D2, à verser à #519.
  Vitest **3338/3338** (318 fichiers). Deux break-tests, deux ROUGE.

- [x] **#518 LIVRÉ 26 août 2026** ✅ **TRANCHÉ : AVERTIR avant d'enregistrer** (verdict D4) — « un bloc sans nom ne sera pas conservé ». Ni refus bloquant, ni titre par défaut : le contenu d'un bloc appartient à son auteur. 📐 **B2 — un champ personnalisé rempli mais sans titre est écarté en silence.**
  `champsPersonnalisesAEnregistrer()` filtre les blocs sans titre. La règle est défendable (pas de
  bandeau vide dans le document), mais du CONTENU TAPÉ disparaît à l'enregistrement sans un mot.
  **Décision requise** : avertir (« un bloc sans nom ne sera pas conservé ») OU refuser de fermer
  sans trancher.

  ⮕ **LIVRÉ.** `validerBlocsNommes()` s'intercale dans la chaîne de validation, après les champs
  obligatoires (qui bloquent) et avant l'écriture. Une FENÊTRE, pas un bandeau : il y a une question
  à poser et une réponse à attendre — le bandeau annonce ce qui EST FAIT, la fenêtre demande ce
  qu'on VEUT faire.
  ⚠ **Elle lit les blocs BRUTS du formulaire**, jamais `donnees.champsPersonnalises` : ceux-là sont
  DÉJÀ filtrés, et un bloc écarté n'y figure plus. Chercher l'oubli dans la liste dont il vient
  d'être retiré ne l'aurait jamais trouvé — un test vert sur une garde morte. Le break-test le
  vérifie explicitement.
  ⚠ **Elle ne crie que s'il y a à perdre** : un bloc nommé mais vide (section qu'on prépare) et un
  bloc entièrement vide ne déclenchent rien. Un avertissement qui s'affiche pour rien apprend à
  cliquer « oui » sans lire — et le jour où il dit quelque chose, personne ne le voit.
  Vitest **3346/3346** (319 fichiers). Trois break-tests, trois ROUGE.

- [ ] **#519 — Passe design (constats C1, C2, C3, C5).** C1 : `design-system.html` ne documente
  aucun composant du chantier (`.btn-icone-nu`, `.bloc-reordonner`, `.champ-recommande`,
  `.legende-marques`, usage étendu de `.pipeline-btn-reorder`). C2 : la légende des deux astérisques
  n'existe que sur l'écran Production — Grilles, Échelles et Cartouches en portent SANS légende,
  alors que le commentaire CSS de `.champ-recommande` dit lui-même « ne jamais poser l'une sans
  l'autre ». ⚠ **C2 dépend de #516** (si l'astérisque du nom de critère est retiré, la légende à
  poser change). C3 : cibles tactiles — chevrons (icône 11 px) et corbeille (`padding: 3px 5px`)
  loin des 44×44 px exigés pour iPad. C5 : rangée de cinq boutons pleins multicolores, « Supprimer »
  (rouge) entre « Dupliquer » et « Annuler », à un clic d'« Enregistrer ».

- [ ] **#520 — Zéro-dette : l'« ANCIEN SYSTÈME » des échelles.** (constat C6) Un bloc caché garde des
  ids DUPLIQUÉS (`nomEchelleTemplate` ×3, `selectEchelleTemplate`, `btnDupliquerEchelle`,
  `typeEchelle`, `seuilReussite`…). Pas de bug actif — le premier id du DOM gagne, et c'est
  l'éditeur vivant — mais une mine au premier réordonnancement, et une entorse au zéro-dette.
  Ablation avec sentinelle ratchet.

- [x] **#521 TRANCHÉ 26 août 2026 — `coursId` reste NON transporté.** Verdict de Grégoire à la
  porte terrain (décision 3.2) : « tel quel ». Le rattachement au cours continue d'être décidé à
  l'arrivée, jamais par le fichier — transporter ferait apparaître une production reçue sous un
  cours homonyme du destinataire, ou sous un cours qui n'existe pas chez lui. La clé reste inscrite
  dans `CLES_PRODUCTION_NON_TRANSPORTEES` avec sa raison, et la sentinelle #511 continue d'exiger
  que toute clé neuve soit transportée ou exclue sciemment. Énoncé d'origine :
- [ ] **~~#521~~ — Décider du sort de `coursId` au transport.** Extrait de #511 : le rattachement local
  au cours est la seule clé volontairement NON transportée. Conséquence inchangée depuis toujours —
  restaurer une archive rend des productions sans cours. Transporter ferait apparaître une
  production reçue sous un cours homonyme du destinataire, ou sous un cours inexistant.
  **Décision requise.**

- [ ] **#522 — Auditer les autres autosaves pour la course lecture-modification-écriture.**
  Extrait de #510 : `db.modifier` existe désormais, mais seuls les deux éditeurs du constat A2 y
  passent. Tout autre autosave en lecture-modification-écriture porte la même course. Recoupe
  [[project-autosaves-a-auditer]].

  🟢 **AUDIT FAIT + LOT 1 LIVRÉ le 30 août 2026 — L'ITEM RESTE OUVERT (4 lots).**
  Rapport complet : `Rapports/AUDIT-522-courses-lecture-ecriture-2026-08-30.md`.
  **Mesure** : 213 sites lire→écrire sur la même clé dans la même fonction, dont **102 en course** ;
  111 sont sûrs (séquence entièrement synchrone — le mono-thread les rend atomiques, ne pas y toucher).
  ⚠⚠ **LE FAIT QUI A REDRESSÉ L'AUDIT** : `getSync` NE protège PAS. Dans `db.set`, l'écriture IndexedDB
  est ATTENDUE avant le rafraîchissement de localStorage — pendant tout cet aller-retour, `getSync` rend
  encore l'ANCIENNE valeur. Un audit qui n'aurait visé que les lectures `await` aurait manqué tout
  `pratiques-gestion.js`, qui lit en `getSync`.
  ⮕ **UN SEUL groupe de clés est atteint par un déclencheur de SAISIE** (le geste de #510, le `change`
  qui part au blur) : `pratiquesConfigurables`. **C'est le site que Grégoire avait signalé en mai 2026**
  (le radio « note chiffrée / niveau de performance » qui « souvent n'est pas lu »).
  ✅ **LOT 1 (clé des pratiques) LIVRÉ** : **22 écritures** passent par `db.modifier` ; six restent hors
  de la file, NOMMÉES et motivées dans le cliquet à liste fermée (trois synchrones, une qui rend un
  compteur, deux via le helper transversal). **Trois défauts trouvés en chemin** : les bornes d'index non
  vérifiées (`TypeError` au lieu d'un refus) ; `adopterMaquette` qui écrivait DEUX fois la collection ;
  et **`partagerPratique`, la plus longue fenêtre du lot** — elle relisait, ATTENDAIT que l'utilisateur
  remplisse un formulaire, puis réécrivait la collection lue AVANT la question. Retirés aussi : deux
  replis `catch → setSync` qui remettaient en place l'instantané que la file sert à ne plus perdre.
  **Sentinelle** `sentinelle-522-pratiques-serialisees` (8 cas) ; **break-test 4 mutations, 4 rouges**,
  témoin vert. Vitest **4082/4082** (391 fichiers).
  ⚠ **FAUX-VERT ATTRAPÉ AU BANC, à retenir pour les lots suivants** : Node n'a pas d'IndexedDB, donc
  `db.js` s'y rabat sur le mode localStorage-seul, où `set` écrit SYNCHRONEMENT — la fenêtre de course
  n'existe alors pas et les six cas passaient au vert sur le code NON corrigé. Le banc doit forcer
  `useIndexedDB` avec une fausse connexion (patron dans la sentinelle).
  ⏳ **RESTE — 89 sites en course, quatre lots** :
  · **Lot 2** grilles (19) + échelles (14) + `niveauxEchelle` (6) — patron connu, aucune décision.
  · **Lot 4** le helper `BibliothequeUI` (14 sites, 7 fichiers) : `dupliquerVersBibliotheque` fait
    `await lireListe()` puis `ecrireListe()`. **Le corriger UNE fois dans le helper corrige les cinq
    familles** — remplacer le couple par un `modifierListe(mutateur)`. Meilleur rapport effort/portée.
  · **Lot 3** productions (12) + cartouches (9).
  · **Lot 5** étudiants (3) + divers (12), dont des drapeaux de migration qui ne tournent qu'au
    démarrage : la course y est théorique — **vérifier avant de convertir, ce lot est sans doute plus
    petit qu'il n'en a l'air**.

  ✅ **LOT 4 LIVRÉ le 30 août 2026** (1.106.4) — le contrat du helper `BibliothequeUI` passe de
  `lireListe`/`ecrireListe` à `modifierListe(mutateur)` : **dix descripteurs, sept fichiers, cinq
  familles** corrigées d'un seul changement. ⚠⚠ **ET LE BANC A MENTI UNE SECONDE FOIS** : forcer
  `useIndexedDB` ne suffit PAS. La fausse connexion du lot 1 range et rend la RÉFÉRENCE de l'objet,
  alors qu'IndexedDB **clone** à l'écriture comme à la lecture. Deux lecteurs concurrents recevaient
  donc le même tableau : le break-test a REFUSÉ de rougir sur du code cassé. Clone structuré ajouté →
  le rouge est venu. Patron corrigé dans `sentinelle-522-lot4-bibliotheques-serialisees`.

  ✅ **LOT 2 CLOS le 30 août 2026 — et il faisait 54 sites, pas 39.**
  ⚠⚠ **ÉCART DE PRÉMISSE, MESURÉ AVANT DE COMMENCER.** Le rapport d'audit annonce « 39 sites,
  2 fichiers » ; la mesure refaite en donne **54, sur CINQ fichiers** — `cartouches.js`,
  `donnees-v2.js` et `spe-specifications.js` en portent un chacun. Seule `niveauxEchelle` tombait
  juste (6/6). L'audit n'avait laissé **aucun outil** : il a été reconstruit, et resservira aux
  lots 3 et 5.
  · **Bloc 2a** — `niveauxEchelle`, **7 sites** (`echelles.js`). Sentinelle 12 cas, break-test
    4 mutations / 4 rouges. ⚠ La clé n'est PAS namespacée par trimestre (`db.get('niveauxEchelle')`
    sans `cle()`), contrairement à `echellesTemplates` juste à côté : défaut latent et neutre,
    laissé tel quel — on n'en corrige pas un pendant un refactor. **À inscrire.**
  · **Bloc 2b** — `echellesTemplates`, **21 sites** (`echelles.js`, `donnees-v2.js`). Sentinelle
    12 cas, break-test 4/4.
  · **Bloc 2c** — `grillesTemplates`, **26 sites** (`grilles.js`, `cartouches.js`,
    `spe-specifications.js`). Sentinelle 14 cas, break-test 4/4.
  ⮕ **HUIT SITES PORTAIENT UNE FENÊTRE D'ATTENTE HUMAINE, et ce sont les pires du lot** :
  `dupliquerEchelle` et `dupliquerGrille` (un `prompt` de nom), `sauvegarderGrilleTemplate` et
  `sauvegarderEchelleComplete` (la question du doublon), quatre suppressions à confirmation. Tout ce
  qui s'enregistrait pendant que la question était à l'écran était écrasé par la collection lue AVANT.
  C'est le défaut de `partagerPratique`, sur d'autres clés. Remède : lire hors file pour POSER la
  question, relire DANS la file pour ÉCRIRE.
  ⮕ **DEUX DÉFAUTS MIS AU JOUR PAR LA CONVERSION** : `assurerGrilleGenerique` vérifiait la présence de
  la grille d'exemple HORS file — deux appels concurrents au démarrage la semaient DEUX FOIS ; et la
  **garde d'identité #476** de `ajouterGrilleIndividuelle` / `ajouterEchelleIndividuelle` s'appliquait
  à une collection lue hors file, donc un doublon ajouté entre-temps passait.
  ⮕ **DEUX CLIQUETS EXISTANTS ONT ROUGI ET ONT ÉTÉ RECALÉS, SANS ÊTRE AFFAIBLIS.** #476 mesurait une
  PROXIMITÉ TEXTUELLE de 200 caractères entre `conflit` et le message de refus — elle mesurait la mise
  en page, pas l'invariant ; le contrôle porte désormais sur le CHAÎNAGE (le nom affiché vient de
  `garde.conflit`) et sur TOUTES les occurrences du message, pas la première (`pratiques-gestion.js`
  en porte une générique avant le refus nommé : chercher la première rendait un faux rouge). #358
  exigeait l'argument littéral de `db.set` et rougissait sur un chemin devenu MEILLEUR. **Les deux ont
  été break-testés APRÈS recalage** et rougissent toujours sur une vraie violation.
  **Vitest 4153/4153 (398 fichiers)** · **Playwright 207/207**.
  ✅ **LOT 3 CLOS le 30 août 2026 — 31 sites, pas 21.**
  · **Bloc 3a — productions**, **18 sites**, cinq fichiers (`productions.js` 8,
    `productions-bibliotheque-ui.js` 5, `productions-import-export.js` 2, `productions-liste.js` 2,
    `pratiques-gestion.js` 1). Sentinelle 14 cas, break-test 4 mutations / 4 rouges.
  · **Bloc 3b — cartouches**, **13 sites** (`cartouches.js`). Sentinelle 13 cas, break-test 4/4.
  ⮕ **SIX SITES DE PLUS PORTAIENT UNE FENÊTRE D'ATTENTE HUMAINE** (total du chantier : quatorze).
  ⮕ **UN DÉFAUT DESTRUCTEUR, LATENT, FERMÉ** : `descendreEvaluation` testait
  `index < evaluations.length - 1`. Pour un id introuvable, `index` vaut -1 et ce test est **vrai** :
  l'échange écrivait `evaluations[0] = undefined`, puis l'enregistrait. Non atteignable depuis les
  chevrons, donc jamais vu — mais il détruisait une production.
  ⮕ **Et `typerProductionCommeTerminale` vérifiait « une seule terminale par trimestre » HORS file** :
  deux clics rapprochés en typaient deux. Même famille qu'`assurerGrilleGenerique` et
  `assurerCartoucheGenerique`.

  ⚠⚠ **CE QUE LE PREMIER JET DU BANC 3a A APPRIS, ET QUI VAUT POUR TOUT BANC DE COURSE.** Le témoin —
  `db.modifier` privé de sa file — ne faisait tomber que **DEUX** des quatre cas de course. Les deux
  autres passaient sur le code cassé : privés de file, deux écrivains concurrents produisent une
  **perte de mise à jour** qui satisfaisait quand même leurs assertions (« une seule terminale »,
  « aucune entrée `undefined` »). ⮕ **Un cas de course doit être une PAIRE D'EFFETS INDÉPENDANTS**, et
  chacun doit être asserté. Un cas qui ne rougit pas sur la file neutralisée ne mesure pas la course —
  il mesure autre chose, et il faut le dire.

  ⚠ **Écriture directe restante, NOMMÉE** : `executerImportConfigComplete` (import-export.js) pour la
  clé des cartouches, `importerProductionsExternes` pour celle des productions. Toutes deux synchrones
  de bout en bout (R3).

  ⏳ **RESTE : le lot 5** — étudiants (3) + divers (12) d'après l'énoncé, **non remesuré**. Les trois
  lots mesurés l'ont été à 35 %, 45 % et 48 % au-dessus de leur annonce : **remesurer avant d'ouvrir**.
  Et **[[#599]]** — les 20 sites des clés `CLE_BIBLIOTHEQUE_*`, que le lot 4 n'a pas touchés.

  🟠 **LOT 5 — ENGAGÉ, PAS CLOS. Et il fait 29 sites, pas 15 (+93 %).**
  Mesuré le 30 août par `scripts/mesurer-522.py`. ⮕ **Ce n'est PAS un chantier vierge.**
  · ✅ **Bloc 5a — les étudiants, 7 sites convertis** (`trimestre-v2-etudiants.js`) : enregistrer une
    fiche, supprimer, changer un statut, importer une liste, vider un groupe, corriger les numéros de
    groupe. Tous des GESTES UTILISATEUR. Sentinelle 11 cas, break-test 4 mutations / 4 rouges.
    ⮕ **Le refus de #382 portait sur un instantané** : « la liste a changé depuis l'ouverture du
    formulaire » était vérifié HORS file, donc il attrapait les changements antérieurs à SA lecture —
    pas ceux de la fenêtre qu'il prétendait couvrir. Il vit maintenant dans le mutateur.
    ⚠ **Un faux positif NOMMÉ** : `reinitialiserEtudiantsV2` lit la liste pour CHIFFRER sa question
    puis écrit une CONSTANTE (`[]`). La valeur écrite ne dérive pas de la lecture : pas de course.
    Le script le signale à tort ; **ne pas le « corriger »**.
  · ⏳ **RESTE 22 sites**, à traiter en connaissance de cause :
    **Gestes utilisateur (vraie course, ~13)** — `cours.js` (4 : retrait, ajout, import, partage) ·
    `cartouches.js` copie entre trimestres · `cc-license.js` métadonnées · `snapshots.js` capture ·
    `donnees-v2.js` suppression définitive · `reserve-ouvrir.js` réimport · `codex.js` fusion de
    travaux · `echelles.js` migration d'évaluations vers une autre échelle.
    **Drapeaux de migration au démarrage (course THÉORIQUE, 9)** — `codex.js` (3), `main.js`,
    `migrations.js`, `travaux-stockage.js`, `demo-activation.js`, `echelles-bibliotheque.js`,
    `snapshots.js`. ⮕ **Les mesurer un par un, ne pas les convertir en bloc** : la plupart ne
    tournent qu'une fois au boot, et la file n'y protège de rien.

  🔧 **L'OUTIL DE MESURE EST DANS LE DÉPÔT** : `scripts/mesurer-522.py`. Il apparie sur
  l'**expression** de clé (gabarits, constantes, appels), canonise les alias, et **signale ses propres
  faux positifs dans son en-tête**. ⮕ **Ne jamais repartir du chiffre de l'audit** : il a sous-compté
  le lot 2 de 38 %, le lot 3 de 48 %, le lot 5 de 93 %, et n'a pas compté #599 du tout.

  ⏳ **RESTE — et les chiffres de l'énoncé sont FAUX, comme ceux du lot 2** :
  · **Lot 3** — mesuré le 30 août : **31 sites**, pas 21. Cartouches **13** (`cartouches.js`),
    productions **18** (`productions.js` 8, `productions-bibliotheque-ui.js` 5,
    `productions-import-export.js` 2, `productions-liste.js` 2, `pratiques-gestion.js` 1).
    ⚠ **Piège de mesure, payé** : `getCleProductions()` et `cleProductions` sont DEUX écritures pour
    UNE clé — les deux valent `cle('productions')`. Sans les canoniser, une lecture par l'une et une
    écriture par l'autre dans la même fonction passent pour deux clés différentes, et la course est
    invisible. L'outil de mesure canonise ; **tout lot suivant doit vérifier ses alias de clé avant de
    compter**.
  · **Lot 5** — étudiants (3) + divers (12), non remesuré. ⮕ **Le remesurer avant de l'ouvrir** : les
    deux lots précédents étaient sous-comptés de 35 % et 45 %.
  · ⮕ **Nouveau : voir [[#599]]** — le lot 4 n'a fermé que le contrat du helper, 20 sites restent en
    course sur les clés `CLE_BIBLIOTHEQUE_*`.

  📌 **TROUVAILLES DE PASSAGE, inscrites ici et NON en items séparés** (règle du 24 août : une
  trouvaille sans symptôme vécu ne devient pas un item qui regarde Grégoire) :
  · **`descendreEvaluation` (`productions.js`) détruit une donnée sur un id introuvable.** `index` vaut
    alors `-1`, la condition `index < evaluations.length - 1` est **vraie**, et l'échange écrit
    `evaluations[0] = undefined` — puis enregistre. Non atteignable depuis les chevrons de l'interface
    (l'id vient de la ligne affichée), donc latent. ⮕ **Fermé avec la conversion du lot 3**, comme le
    lot 1 a fermé ses bornes d'index.
  · **Trois erreurs de banc pré-existantes** dans `sentinelle-note-non-constructible-326` :
    `repararPortfoliosEleves` lève `ReferenceError: cle is not defined`, avalée par un `catch` de
    l'application. Le test passe au vert, l'erreur est réelle et masquée. Le banc ne stubbe pas `cle`.
  · **Trois identifiants morts dans `js/cartouches.js`** — `btnExporterCartouche`,
    `btnImporterCartouche`, `btnImporterCartoucheTxt` : cités, jamais définis dans `index.html`,
    gardés par `if (btn)` donc inoffensifs. Relevé par la session du matin du 30 août.

- [ ] **#599 — Le lot 4 de #522 n'a fermé que le contrat du helper : vingt sites restent en course sur
  les clés `CLE_BIBLIOTHEQUE_*`.**
  Créé le 30 août 2026, en mesurant le périmètre du lot 3. **Le lot 4 est annoncé LIVRÉ**, et il l'est
  pour ce qu'il visait : `BibliothequeUI.dupliquerVersBibliotheque` et `dupliquerEtEditerItem` passent
  par `modifierListe(mutateur)`, dix descripteurs, cinq familles. **Mais la ligne « bibliothèques
  (`CLE_BIBLIOTHEQUE*`, 5 constantes) — 14 sites » du rapport d'audit ne décrivait QUE les appelants du
  helper.** Les écritures DIRECTES du magasin partagé n'y sont pas.
  **Mesuré** : **20 sites en course**, cinq fichiers —
  `pratiques-bibliotheque.js` (3 : `ajouterPratiqueALaBibliotheque`, `mettreAJourConfigurationPratique`,
  `retirerPratiqueDeLaBibliotheque`) · `spe-specifications.js` (3 : les trois `creer*SPESiInexistante`) ·
  `productions-bibliotheque.js` (2) · `pratiques-gestion.js` (1) · `productions-import-export.js` (1),
  plus le reste du balayage.
  ⚠ **Les trois `creer*SPESiInexistante` sont le même défaut qu'`assurerGrilleGenerique`** (corrigé au
  lot 2c) : ils vérifient l'existence HORS file, donc deux appels concurrents sèment deux fois.
  ⮕ **À traiter comme un lot à part entière**, pas comme un reliquat : même patron que les lots 2 et 4,
  outil de mesure disponible (`mesurer-522-v2`, apparie sur l'EXPRESSION de clé, pas sur une chaîne).

- [ ] **#600 — Le rituel de release contient un vert creux : la sentinelle anti-cache lancée après le
  commit ne vérifie RIEN et se tait.**
  Créé le 30 août 2026, pendant la release 1.106.4. L'ordre inscrit partout — `release.mjs` → changelog
  → commit → **sentinelle anti-cache** — fait lancer `scripts/verifier-anticache-stage.mjs` APRÈS le
  commit. Or ce script ne regarde que **les fichiers STAGÉS** : après un commit, l'index est vide, il
  ne vérifie aucun fichier, et **sort en code 0 sans imprimer une seule ligne**. Un vert indiscernable
  d'un vrai.
  **Ce n'est pas un défaut du script** : son en-tête le dit, c'est un garde de PRÉ-commit, branché au
  hook `pre-commit`, et il y fait son travail. **C'est le rituel qui le nomme à la mauvaise étape.**
  La vraie vérification post-commit est la sentinelle Vitest `anticache-fichiers-modifies`, qui compare
  des COMMITS.
  ⮕ **Deux corrections possibles, à trancher** : (a) corriger la phrase du rituel (DEPLOY.md, CLAUDE.md,
  skill `release-et-changelog`) pour nommer la sentinelle Vitest à l'étape post-commit ; (b) faire dire
  au script « rien de stagé, je n'ai rien vérifié » au lieu de se taire. ⮕ **Les deux valent mieux
  qu'une** : un contrôle qui ne peut pas distinguer « vérifié et bon » de « rien à vérifier » finira par
  rassurer quelqu'un à tort.

  ⚠⚠ **ET LE MÊME JOUR, UN SECOND VERT QUI N'EN EST PAS UN — celui-là a coûté un push.**
  `vitest run` **sort en code 1 dès qu'il y a une erreur NON GÉRÉE**, même avec tous les tests verts.
  Le résumé affiche alors « Tests 4153 passed » ET « Errors 3 errors ». Le hook `pre-push` ne lit que
  le CODE DE SORTIE : il annonce « Corrige les tests rouges » alors qu'aucun test n'est rouge.
  ⮕ **Le compte de tests n'est PAS le verdict.** Trois fois de suite, la ligne « Tests … passed » a été
  lue comme un vert alors que la ligne « Errors » juste en dessous était coupée par un `tail`.
  ⮕ **Cause mesurée le 30 août** : une fonction qui s'exécute AU CHARGEMENT d'un module (ici
  `migrerCategoriesVersSousCriteres()`, appelée à la fin de `grilles.js`) et qui appelle une primitive
  absente d'un stub de banc lève un rejet non capté — silencieux dans le rapport, fatal pour le code
  de sortie. Trois bancs étaient concernés : `sentinelle-cle-conception-namespacee-briqueB`,
  `sentinelle-505-rendus-blocs-executent` et `sentinelle-generique-anti-resemage-global-358`.
  ⮕ **Règle** : après un lot qui change une primitive de `db`, chercher les stubs `db` de TOUS les
  bancs qui CHARGENT le module, et lire le CODE DE SORTIE, pas seulement le compte.

- [x] **#606 — LIVRÉ le 30 août 2026 (commit `c24036e7`) — La vue Corbeille empruntait l'en-tête du tableau des évaluations : le nom de fichier
  s'affichait sous « Prénom », la date de suppression sous « Statut », les jours restants sous
  « Niveau ».**
  Relevé par Grégoire le 30 août 2026, capture à l'appui : « le contenu des colonnes ne correspond
  pas aux en-têtes ». Vu en allant récupérer les fichiers perdus par [[#604]].
  **DEUX MÉCANISMES SE COMPOSAIENT, et il fallait défaire les deux.**
  · **L'en-tête emprunté.** `afficherVueCorbeille` écrit ses lignes dans le `tbody` du tableau des
    évaluations, dont le `thead` n'était jamais échangé. Neuf colonnes d'évaluation pour six
    données de corbeille : l'écart était comblé par des `colspan` (2 sur l'élève, 3 sur les
    actions) qui **déplaçaient** la lecture au lieu de l'aligner.
  · **Le sélecteur de colonnes.** `toggleColonneEval` masque par RANG DE CELLULE
    (`th:nth-child(n)`), pas par colonne logique. Dans la corbeille, décocher « Jeton » retirait la
    5ᵉ cellule — la date — et décalait d'un cran de plus tout ce qui suivait. C'est ce second
    mécanisme qui explique la capture : « Jeton » y était décoché.
  ➮ **Correction** : la corbeille a son propre `<tr>` d'en-tête dans `index.html` (Élève, Fichier,
  Production, Supprimé le, Expire dans, Actions), une cellule par colonne, zéro `colspan` ; une
  seule rangée visible à la fois via `appliquerEnTeteSelonVue()`, appelée par les TROIS chemins qui
  changent de vue ; le sélecteur de colonnes disparaît avec la vue Évaluations et refuse d'agir même
  appelé de force.
  ➮ **Deux corollaires trouvés en corrigeant.** Le `th:nth-child(n)` non qualifié atteignait
  désormais aussi le nouvel en-tête — restreint à `#entete-evaluations`. Et `vueCorbeilleActive`,
  déclaré en `let` près de la section Corbeille, se retrouvait **sous** ses nouveaux lecteurs
  (`afficherTableauEvaluations`, `toggleColonneEval`) : zone morte temporelle, inoffensive tant que
  personne n'appelle pendant le chargement, ReferenceError le jour où ça arrive. Déclaration
  remontée en tête de module.
  ➮ **L'alignement RÉEL ne se mesure qu'au rendu** : banc Playwright
  `integration/corbeille-entete-606.spec.js`, qui relève les boîtes et cherche, pour chaque
  cellule, l'en-tête qui la surplombe. La sentinelle Vitest jumelle ne verrouille que le comptage.
  ⚠ Piège du banc lui-même : sans `naviguerVers('evaluations', 'liste')`, la SOUS-section reste en
  `display:none` et toutes les boîtes mesurent zéro — le test « passe » sans avoir rien vu. Un
  garde-fou exige désormais une largeur non nulle avant de mesurer.

- [ ] **#605 — Le message « Fichier sous … » se déclenche sur TOUTE ligne non reçue d'un élève qui a
  importé quoi que ce soit. Il ne peut structurellement rien apprendre.**
  Relevé le 30 août 2026 sur les données réelles de Grégoire, capture à l'appui : un élève ayant
  remis 1 travail sur 11 récoltait **10 avertissements**, tous exacts et tous inutiles ; un élève
  n'ayant rien remis n'en avait aucun. Le message donnait l'impression que les travaux à venir
  étaient associés à celui qui venait d'être importé.
  **MESURÉ AU CODE**, trois faits :
  · le tableau pose une ligne par (élève × production), en écartant `type === 'portfolio'`
    (`liste-evaluations.js:631`) ;
  · le message se déclenche dès qu'il existe UN fichier de cet élève sur n'importe quelle
    production connue ≠ celle de la ligne (`liste-evaluations.js:76`) — aucune autre condition ;
  · la liste des productions « connues » comprend TOUTES les productions, portfolios inclus
    (`liste-evaluations.js:74`).
  ➮ **Toute production non-portfolio a donc sa propre ligne.** Un fichier posé là y est déjà
  affiché, à sa place, avec son statut. Le répéter sur les N−1 autres lignes ne distingue pas le
  fichier MAL classé du fichier BIEN classé : les deux produisaient exactement le même signal.
  Un avertissement incapable de séparer les deux cas qu'il prétend arbitrer n'avertit de rien.
  Même famille que [[#600]] et [[#602]] — un contrôle qui ne sait pas dire ce qu'il ne voit pas.
  ➮ **Correction (décision Grégoire, 30 août)** : le message ne paraît que si le fichier n'a
  AUCUNE ligne à lui, seul cas où il est la seule trace du fichier dans ce tableau. La règle de
  génération des lignes est extraite en `productionGenereUneLigne` et lue par les DEUX sites —
  sans quoi elles redériveraient. Le cas est atteignable : le sélecteur de production de l'import
  offre les portfolios comme les autres (`travaux-ui.js:1808`).

- [ ] **#604 — « Remplacer l'existant » jette l'ancien fichier À LA CORBEILLE SANS jamais importer le
  nouveau. Les deux disparaissent.** 🔴 PERTE DE DONNÉES
  Trouvé le 30 août 2026 sur l'import réel de Grégoire (601-101 gr.00007, « Portrait de lecteur -
  lectrice », 49 fichiers). Symptôme rapporté : « j'ai cliqué pour remplacer les travaux existants…
  ces travaux n'ont finalement pas été importés et j'ai dû le faire à part ».
  **LE MÉCANISME.** `importerFichier` (`travaux-import.js:640`) refuse d'importer et rend un SENTINEL
  `{ doublon: true, … }` dès qu'il trouve un fichier actif pour le même couple `(etudiantDA,
  productionId)`. Trois drapeaux le contournent — `estReprise`, `livrableAdditionnel`, et la
  `productionId` vide de la branche « orphelin ». **La branche `remplacer` n'en pose AUCUN**
  (`travaux-ui.js:4004`). Elle rappelle donc `importerFichier` sur le même couple, récupère le
  sentinel, **ne regarde pas la valeur rendue**, et enchaîne sur
  `travauxStockage.deplacerEnCorbeille(d.fichierExistant.id)`.
  ⮕ Résultat net : le remplaçant n'est jamais écrit, l'existant part à la corbeille. L'`await` réussit,
  aucune exception n'est levée, le `catch` ne se déclenche pas, la notification annonce un succès.
  ⚠ **Le commentaire `#558 B1` juste au-dessus dit exactement ce qui manque** : « le remplacement ne
  détruit plus rien tant que le remplaçant n'est pas là ». L'ORDRE a bien été inversé — mais rien ne
  VÉRIFIE que le remplaçant est là. Un `await` qui rend un objet d'échec ressemble à un succès.
  ⮕ **Correction** : drapeau `remplaceExistant` qui contourne la garde, ET lecture de la valeur rendue
  avant la mise à la corbeille — un sentinel `doublon` doit interrompre le remplacement.
  ⮕ **Données de Grégoire à récupérer** : les fichiers ainsi jetés sont dans la corbeille, blob intact
  (`deplacerEnCorbeille` copie les métadonnées et ne touche pas le blob) — restaurables.

- [ ] **#603 — Le suffixe de page `-p2` d'une remise Léa est lu comme un NOM DE PRODUCTION différent :
  ni assemblage multi-pages, ni reconnaissance des pages entre elles, et un faux doublon.**
  Trouvé le 30 août 2026, même import que [[#604]] — dont il est la cause amont.
  `parserNomFichierLea` (`travaux-import.js:98`) coupe le nom sur `_Remis_le_`, prend tout ce qui suit
  le DA et l'appelle `nomProduction`. Sur les deux pages d'une même remise :
  · `Breton_9000200_Portrait_de_lecteur-p1__Remis_le_2026-08-21_11h36m32s.jpg` → « Portrait de lecteur-p1 »
  · `Breton_9000200_Portrait_de_lecteur-p2__Remis_le_2026-08-21_11h36m32s.jpg` → « Portrait de lecteur-p2 »
  Le `groupeDocumentId` en dérive (`da + '_' + nomProduction`) : **deux clés différentes pour un seul
  document.** Trois conséquences en cascade, toutes observées :
  1. `assemblerGroupesPipeline` ne voit que des groupes d'UNE image → aucun assemblage.
  2. `detecterDoublonsStockage` exempte les pages qui partagent un `groupeDocumentId` — l'exemption ne
     s'applique pas → **« présent 2 fois dans la file » sur deux fichiers pourtant uniques.**
  3. À l'import, les deux entrées survivent jusqu'à `importerFichier` → doublon réel → modale
     « Remplacer » → [[#604]] détruit les deux.
  ⚠ Les remises multi-fichiers SANS suffixe (Moreau, Boucher, Thibodeau…) passent bien : même
  `nomProduction`, donc même clé, donc assemblage. **Le défaut ne frappe QUE les pages numérotées** —
  c'est-à-dire précisément celles que Grégoire renomme lui-même en dézippant une remise Léa.
  ⮕ **Correction** : isoler le suffixe de page dans un champ `page` du parse, hors du `nomProduction`.

- [ ] **#602 — Les trois filets anti-cache ne voient QUE les fichiers portant une balise `<script src>`
  dans `index.html`. Tout ce qui est servi autrement passe, en silence.**
  Créé le 30 août 2026, en publiant la 1.106.5. `release.mjs` l'a dit lui-même dans sa sortie :
  « non référencés dans index.html, ignorés : `js/heic-worker.js` ». Analyse complète dans le message
  du commit `de5e42d0`.
  **LE POSTULAT COMMUN, ET C'EST LUI LE DÉFAUT.** Les trois filets supposent qu'un fichier servi porte
  une balise `<script src>` dans `index.html` : `release.mjs` balaie les modifiés et cherche leur `?v=`
  dans `index.html` ; la sentinelle Vitest `anticache-fichiers-modifies` borne son périmètre à `js/`,
  `styles.css` et `css/` ; le hook pré-commit lit l'index et les mêmes balises. Un fichier tiré par
  `importScripts`, par `new Worker(...)` ou par un `workerSrc` n'est dans aucun des trois — et son
  jeton, quand il en a un, vit **en dur dans le code appelant**.
  ⮕ **Ce qui rend ce trou dangereux n'est pas qu'il laisse passer un fichier périmé : c'est qu'il le
  laisse passer SANS RIEN DIRE.** Les trois filets rendent un vert. Même famille que [[#600]] — un
  contrôle incapable de distinguer « vérifié et bon » de « hors de mon périmètre ».

  **MESURÉ le 30 août** (`grep -rnE "(new Worker|importScripts|workerSrc)" js/`) — trois cas, et le
  troisième n'était pas connu :
  · `js/heic-worker.js` — jeton en dur dans `heic-decodeur.js:98` (`20260830b`), bumpé À LA MAIN à la
    release. **0 référence dans `index.html`.**
  · `libs/libheif-bundle.js` — jeton en dur dans `heic-worker.js:38` (`20260830a`). **0 référence.**
    Il n'a pas changé le 30 août, donc son jeton est juste — mais personne ne l'aurait signalé s'il
    avait changé.
  · ⚠ **`libs/pdf.worker.min.js` — servi SANS AUCUN `?v=`**, par
    `pdfjsLib.GlobalWorkerOptions.workerSrc = 'libs/pdf.worker.min.js'` (`travaux-visionneuse.js:59`).
    1 Mo, suivi par git, **et il A DÉJÀ CHANGÉ** : commit `410008a6` du 6 février 2026, downgrade
    PDF.js 4.2.67 → 3.11.174 pour Safari. ⮕ **S'il change à nouveau, un navigateur qui tient l'ancien
    le servira indéfiniment.** Ce n'est pas une hypothèse : c'est le même fichier, le même chemin, et
    déjà une version de différence dans l'historique.

  📌 **UN QUATRIÈME CAS, VOISIN, TROUVÉ EN MESURANT** : quatre bibliothèques ONT une balise dans
  `index.html` mais **aucun jeton** — `chart.min.js`, `chartjs-plugin-annotation.min.js`,
  `jspdf.umd.min.js`, `jspdf-autotable.min.js`. Les filets les voient, mais sans `?v=` il n'y a rien à
  comparer : le même angle mort par l'autre bout. (Les trois autres libs en ont un, versionné par leur
  numéro : `pdf.min.js?v=3.11.174`.)

  ⮕ **LE GESTE DE VÉRIFICATION QUI MANQUE, et il tient en une ligne** : chercher les `?v=` qui vivent
  AILLEURS que dans `index.html`, et les fichiers servis sans jeton du tout.
  `grep -rnE "(new Worker|importScripts|workerSrc)\s*\(?\s*['\"\`]" js/`
  ⮕ **À trancher** : (a) étendre `release.mjs` et la sentinelle à ces chemins, ou (b) refuser
  l'existence même d'un jeton hors `index.html` — un fichier servi hors balise déclare son chemin dans
  une constante d'`index.html`, et le filet la voit. **L'option (b) est plus sûre** : elle supprime la
  classe de défaut au lieu de l'instrumenter. Mais elle touche le chargement d'un worker, donc à faire
  avec une sentinelle qui rougit d'abord.

- [ ] **#601 — La clé `niveauxEchelle` n'est PAS namespacée par trimestre, contrairement à sa voisine
  `echellesTemplates`.**
  Créé le 30 août 2026, pendant le lot 2a de #522. **Mesuré** : `db.get('niveauxEchelle')` et
  `db.modifier('niveauxEchelle', …)` — sans `cle()` — dans `js/echelles.js`, alors que
  `echellesTemplates` est lue et écrite par `cle('echellesTemplates')` dix lignes plus loin.
  **Conséquence** : les niveaux de l'éditeur « ancien système » sont PARTAGÉS entre tous les trimestres.
  Basculer de trimestre ne les change pas.
  ⚠ **Latent et neutre AUJOURD'HUI**, et laissé tel quel à dessein : on ne corrige pas un bug dormant
  pendant un refactor. ⮕ **Mais ça cesse d'être neutre à [[#520]]** — l'ablation de l'« ANCIEN SYSTÈME »
  des échelles touche exactement ce code. **Trancher là-bas** : namespacer, ou retirer la clé avec le
  bloc caché. Ne pas retirer l'un sans l'autre.

- [x] **#523 CLOS 26 août 2026 — c'était GitHub Desktop, et c'est Grégoire qui l'a trouvé.**
  ⮕ **MESURE CONCLUANTE** : suite WebKit rejouée machine au repos ET **GitHub Desktop fermé** (hook
  pré-push de la release 1.99.2) → « aucune rougeur nouvelle, 8 échecs connus, **inchangé** ». Les
  deux specs `cours-refonte-rendu › Chantier C` et `pratique-edition-preserve-enveloppe › CO-01`
  sont VERTES.
  ⮕ **La cause** : l'application exécutait des commandes git pendant que Playwright lisait
  `index.html` et `js/` en `file://` — les fichiers changeaient sous les pieds des tests. Ni
  contamination d'état entre specs, ni instabilité intrinsèque : une interférence externe.
  ⚠ **RÈGLE À RETENIR, plus large que cet item** : *aucune suite Playwright ne vaut si GitHub
  Desktop est ouvert sur le dépôt.* Les specs lisent l'arbre de travail en direct. À ajouter au
  préalable de toute campagne de tests navigateur — c'est le pendant de
  [[feedback-sessions-paralleles-meme-depot]] pour les tests.
  ⚠ Et une leçon sur la méthode : mes deux hypothèses (contamination d'état, saturation machine)
  étaient toutes deux plausibles et toutes deux fausses. Quatre exécutions ne les auraient jamais
  départagées, parce qu'aucune ne portait sur la vraie variable. C'est l'utilisateur qui savait ce
  qui tournait à côté. **Demander avant de mesurer plus.**
  Énoncé d'origine :
- [ ] **~~#523~~ — Deux specs Playwright rouges en suite, vertes isolées — cause NON ÉTABLIE.**
  ⚠⚠ **CORRECTION DU 26 AOÛT, À LIRE AVANT TOUT LE RESTE DE CET ITEM.** Le titre d'origine disait
  « specs INSTABLES » : c'était une conclusion prématurée. En regardant la machine, j'ai trouvé
  **23 processus Playwright/WebKit vivants en même temps** et une charge moyenne à **159** — parce
  que j'avais enchaîné plusieurs suites sans attendre la fin des précédentes (régénération de la
  baseline, deux hooks de push, un run isolé, une suite complète). Sous une charge pareille, une
  attente qui expire produit exactement le même symptôme qu'une contamination d'état.
  ⮕ **Deux explications concurrentes, aucune écartée** : (a) état laissé par un fichier voisin dans
  le localStorage partagé de l'origine `file://` ; (b) simple expiration d'attente sous une machine
  saturée par mes propres lancements. Le fait que les deux mêmes specs tombent deux fois de suite
  penche pour (a), mais les deux runs étaient tous deux sous charge — donc ça ne tranche pas.
  ⮕ **TROISIÈME EXPLICATION, apportée par Grégoire le 26 août, et la plus vraisemblable** :
  **GitHub Desktop était ouvert et a exécuté des commandes git en parallèle** des runs. Une
  opération git pendant que Playwright lit `index.html` et `js/` en `file://` change les fichiers
  SOUS LES PIEDS des tests — ce qui produit des rouges sans rapport avec le code, et sur des specs
  quelconques. C'est la même famille de piège que [[feedback-sessions-paralleles-meme-depot]] (GitHub
  Desktop qui stashe le travail non commité au changement de branche). L'application a été fermée
  depuis.
  ⏳ **Première chose à faire quand cet item s'ouvrira** : rejouer la suite complète UNE SEULE FOIS,
  machine au repos ET **GitHub Desktop fermé**, et voir si les deux rougissent encore. Tout le reste
  en dépend — et il est maintenant probable que la réponse soit « non ».
  Mesuré le 26 août, sur quatre exécutions de la suite WebKit à quelques minutes d'intervalle,
  même arbre, même machine :
  · régénération de la baseline → **exactement 8** échecs (les 8 de #495) ;
  · hook pré-push, 1ʳᵉ passe → « aucune rougeur nouvelle, 8 connus, **inchangé** » ;
  · hook pré-push, 2ᵉ passe → 8 **+ 2** : `cours-refonte-rendu › Chantier C · édition d'un cours
    legacy` et `pratique-edition-preserve-enveloppe › CO-01 · la CRÉATION n'est pas affectée` ;
  · ces deux specs relancées SEULES → **6/6 vertes** (leurs fichiers au complet).
  ⮕ Elles ne rougissent que dans la suite complète, jamais isolées : état partagé, ordre
  d'exécution ou timing sous charge. **Rien à voir avec le bruit `version.json` de #495** — ce
  sont deux instabilités distinctes, à ne pas confondre.
  ⚠ **L'effet est pire que les deux specs** : un garde-fou qui rend un verdict différent à chaque
  passage ne protège plus, il fait jouer à pile ou face un push de 5 minutes. C'est le mécanisme
  exact par lequel un hook finit contourné — et #495 note déjà que le premier `--no-verify` date
  du 25 août.
  ⮕ **Piste du parallélisme EXCLUE, vérifiée** : `tests/playwright.config.js` porte déjà
  `workers: 1` et `fullyParallel: false`, avec le commentaire qui explique pourquoi (toutes les
  specs ouvrent le MÊME `index.html` en `file://` et partagent le localStorage de cette origine).
  L'exécution est donc séquentielle — mais le localStorage reste partagé ENTRE FICHIERS : un fichier
  qui laisse un état derrière lui peut faire tomber un autre. C'est la piste à instruire en premier.
  ⏳ À instruire : `--repeat-each` pour confirmer le taux, puis isoler la dépendance (état laissé
  par un fichier voisin ? attente qui expire sous charge ?). Ne PAS les verser à la baseline : une
  spec instable n'est pas une dette connue, c'est un test à réparer.

  Dernier ID : **#523**.

### Chantier — 25 août 2026 (le pont carte d'alignement ↔ productions)

- [x] **#492 — Le sélecteur « Production » de l'Inspecteur ne montrait rien, et personne ne pouvait le voir.**
  Livré sur `echeance-depuis-carte-alignement`. Demande de Grégoire : rattacher ses artefacts aux
  blocs Évaluation de la carte. **TROIS défauts empilés, et chacun cachait le suivant** :
  · **le filtre fantôme** — `chargerProductions` filtrait sur `p.estActive`, un champ qu'AUCUN module
    n'écrit jamais (recherche sur tout le dépôt : une seule occurrence, le filtre lui-même). La
    fonction rendait `[]` en toutes circonstances. Le pont était coupé à sa SOURCE, pas à son bout ;
  · **la liste amputée** — le sélecteur portait ses propres cinq types (`travail, examen, projet,
    quiz, autre`) quand le formulaire de Conception en offre douze. Artefacts, portfolios,
    laboratoires, présentations, entrevues, stages et évaluation terminale étaient chargés,
    regroupés, puis abandonnés sans un mot ;
  · **le libellé mort** — la projection lisait `p.nom`, un champ que le modèle ne porte pas (il porte
    `titre`). Chaque option affichait « undefined », **et la même projection alimente la colonne
    "Production" du plan de cours exporté** (`nomProduction`).
  ⚠ **Le golden master #416 ne pouvait PAS voir le troisième** : ses fixtures disaient `nom`, comme le
  bug. Fixture et code étaient d'accord entre eux et faux tous les deux. Corrigées vers `titre` —
  **le golden repasse au vert sans qu'un octet de référence bouge**, ce qui prouve qu'il décrivait le
  bon comportement depuis le début.
  Livré : `TYPES_PRODUCTION` dans `productions.js` — table UNIQUE qui remplace trois listes
  divergentes (12 / 8 / 5) ; `getTypeLabel` en dérive, et `laboratoire`/`entrevue`/`projet`/`stage`
  cessent de s'afficher en identifiant brut ; `optionsProductionsHTML` groupée comme le formulaire,
  avec un filet « Type non répertorié » pour qu'aucune production ne puisse plus disparaître en
  silence ; `echapperHtml` sur le titre — la faille dormait derrière le `undefined`, réparer le
  libellé sans échapper l'aurait réveillée. Sentinelle 20 cas, break-testée.
  📐 **Signalé, hors périmètre** : `getTypeLabel('portfolio')` rend « 📁 Portfolio (conteneur) ».
  L'emoji est déplacé dans la table sans être retiré — le retrait change un libellé d'interface, et
  `productions.js:207` en pose un second. Geste à trancher avec Grégoire.

- [x] **#493 — La carte d'alignement propose la date d'échéance, et chaque groupe reçoit la sienne.**
  Livré sur `echeance-depuis-carte-alignement`. Une leçon porte `metadata.semaine` et
  `metadata.rangSeance` ; une production rattachée à son bloc Évaluation est donc SITUÉE. Deux
  groupes du même cours ne se rencontrent pas le même jour : même case de carte, lundi pour l'un,
  mardi pour l'autre — ce que Grégoire saisissait à la main cet hiver.
  ▣ **UNE SEULE LISTE, DEUX LECTURES** : `datesSeancesDeLaSemaine` donne les rencontres d'un groupe
  pour une semaine. Le libellé fait `indexOf(date) + 1` (« 2e séance de la semaine 4 ») ; la
  dérivation fait `[rang - 1]`. Deux fonctions séparées auraient pu diverger d'une séance et faire
  dire à l'écran le contraire de la carte, **sur la date que lisent ses étudiant·es**.
  ⚠⚠ **MON PREMIER JET NE TROUVAIT JAMAIS RIEN, et c'est le navigateur qui l'a dit** (`SEANCES → []`
  avec une POSITION valide). Je tirais les séances de `obtenirSeancesCompletes(coursId)` puis
  filtrais sur `seance.groupe === groupeNum`. Deux erreurs en une ligne : `obtenirSeancesCompletes`
  rend DÉJÀ la table du groupe-cours actif (`cleSeancesCompletes`), et `seance.groupe` est un champ
  de saisie d'horaire, **vide dans le cas courant**. Le repli « toutes les séances du cours » du code
  d'origine n'était pas un secours exceptionnel : c'était le chemin normal, et je l'avais interdit à
  la dérivation en le prenant pour un raccourci douteux. Source juste = `obtenirSeancesCompletesDuGroupe`,
  celle que l'export du plan de cours utilisait déjà.
  Livré : `positionCarteDeLaProduction` (l'autre sens du pont, dans `planification-carte.js`) ;
  `dateSeanceDuRang` ; `dateEcheanceProposeeParLaCarte` ; `brancherPropositionDeLaCarte`.
  **Décision de Grégoire (option A) : la carte propose, il dispose** — champ vide rempli, date saisie
  JAMAIS écrasée, écart signalé avec « Utiliser cette date ». Trois refus délibérés plutôt qu'une
  approximation : rang inexistant, deux positions contradictoires, groupe sans horaire ⇒ **rien**.
  Sentinelle 24 cas, break-testée. Vérifié au navigateur : `2026-09-15`, mardi, 2e séance de la
  semaine 4.

- [x] **#494 — « Consignes transmises » existe aussi quand il n'y a qu'un groupe.**
  Livré sur `echeance-depuis-carte-alignement`. La case du mode multi-groupe (Beta 98.3) n'a JAMAIS
  existé en mode simple : `obtenirEcheanceEffective` y répondait `assignee: true` **en dur**.
  C'était défendable — tant que poser la date demandait un geste, une date saisie VALAIT la
  transmission.
  ⚠⚠ **#493 A FAIT SAUTER CETTE ÉQUIVALENCE LE MÊME JOUR.** La date arrivant seule depuis la carte,
  une production simplement PLANIFIÉE devenait TRANSMISE : entrée au calendrier, dans les indices C
  et P et dans les snapshots, badge « à planifier » (#486) perdu, **sans qu'aucune consigne ne soit
  partie**. L'automatisme a rendu nécessaire la donnée que la supposition remplaçait. Repéré par
  Grégoire, à l'usage.
  Livré : `poserCaseAssignationSimple` écrit le MÊME modèle que le multi (`echeancesParGroupe` à une
  entrée) — pas de champ parallèle, **un seul modèle d'assignation dans le projet** ;
  `lireEcheancesParGroupeDepuisFormulaire` gère le chemin simple, sans quoi la case aurait été cochée
  à l'écran et perdue à l'enregistrement. Rétro-compat : une production d'avant ce jour, qui n'a
  qu'un `dateEcheance`, s'affiche cochée — c'est la sémantique de sa saisie ; rien n'est réécrit.
  Sentinelle 15 cas, break-testée. Vérifié au navigateur, aller-retour d'enregistrement compris.
  Vitest **3125/3125** (302 fichiers). ⚠ Correctif du jour : la note de la case s'empilait
  à chaque réouverture de la fiche (garde U1.c comptait les zones, pas les notes) ; la note vit
  désormais DANS la zone. Libellé : « La production peut être préparée à l'avance. »
  Dernier ID : **#495**.

- [x] **#495 LIVRÉ 26 août 2026 (1.99.8)** — `version.json` est enfin lisible en `file://`.
  ⮕ **MESURÉ sous WebKit avant de choisir** — les trois voies échouent TOUTES sur un fichier local :
  XHR synchrone (`NetworkError`), XHR **asynchrone** (`onerror`) et `fetch` (`TypeError: Load
  failed`), les trois émettant « … due to access control checks ». ⚠ Le commentaire du code affirmait
  « XHR synchrone (fonctionne sur Safari file://) » : **c'était faux**. `version.json` n'a donc JAMAIS
  été lu sur le Safari ni l'iPad de Grégoire.
  ⮕ **La seule voie qui passe : un `<script>`** (vérifié sous WebKit, zéro erreur). `version.js` est
  généré par `release.mjs` **en même temps que** `version.json` — deux fichiers écrits ensemble ne
  peuvent pas diverger — et son anti-cache est posé explicitement à partir du build, sinon Safari en
  servirait une copie périmée et tout #285 reposerait sur un chiffre faux.
  ▣ **Effet mesuré : la baseline passe de 8 échecs connus à 1.**
  ⚠⚠ **ET MON RAPPORT ÉTAIT INEXACT.** Il affirmait « toutes tombent sur la MÊME erreur » — repris de
  l'énoncé du 25 août sans vérifier spec par spec. C'était vrai pour SEPT. La huitième
  (`productions-ajout-refus-garde-340`) **n'a aucune assertion sur les erreurs console** : elle
  échouait sur une assertion métier, et le bruit ne la masquait pas — c'est mon inattention qui l'a
  rangée avec les autres. Elle devient **#530**.
  Énoncé d'origine :
- [ ] **~~#495~~ — La baseline Playwright est périmée : 8 specs rouges sur `main`, hors dette #456.**
  Découvert le 25 août au push du chantier #492-#494. Le hook pré-push les annonce comme une
  RÉGRESSION du chantier ; vérification faite en basculant sur `main` et en les rejouant : **les huit
  échouent à l'identique sans une ligne du chantier**. Le verdict du garde-fou est donc faux, et
  c'est ce qui le rend coûteux — un hook qui crie au loup finit par se faire contourner, et le
  `--no-verify` du 25 août (autorisé par Grégoire, dette prouvée préexistante) est le premier.
  ⮕ **SECOND `--no-verify` : 26 août 2026, autorisé explicitement par Grégoire** (« ok, on pousse
  sans relancer la vérification »), pour la release 1.99.1. Ce qu'il faut savoir pour le juger plus
  tard, sans avoir la conversation sous les yeux :
  · **Vitest 3319/3319** au moment du push, vérifié plusieurs fois ;
  · la suite WebKit **a bien tourné**, et sa PREMIÈRE passe après régénération de la baseline a
    répondu « aucune rougeur nouvelle, 8 connus, inchangé » — la vérification a donc été passée,
    et elle était VERTE ;
  · les deux passages suivants ont ajouté `cours-refonte-rendu › Chantier C` et
    `pratique-edition-preserve-enveloppe › CO-01`, vertes en isolé — cause non établie, cf. #523,
    et les deux passages tournaient sur une machine saturée par les runs de la session ;
  · ces deux specs ne touchent ni les gabarits, ni le PDF, ni les duplications : aucun des sept
    correctifs livrés (#509→#515) ni la convergence #476 ne concerne leur code.
  ⚠ **La différence avec le 25 août** : ce jour-là on passait outre une vérification ROUGE. Ici la
  vérification a été verte, puis non reproductible. Ça ne rend pas le geste anodin — deux
  `--no-verify` en deux jours sur le même garde-fou, c'est le symptôme que #495 et #523 décrivent,
  et c'est la raison de les traiter.
  Toutes tombent sur la MÊME erreur, qui n'a aucun rapport avec ce que les specs vérifient :
  `pageerror: //Users/.../Monitorage_v6/version.json due to access control checks` — WebKit refuse
  le chargement de `version.json` en `file://`. ⚠ Noter le **double slash** en tête de chemin : la
  piste est une résolution d'URL relative, pas la sécurité de WebKit elle-même.
  Fichiers touchés : `diagnostic-doublons-lecture-seule`, `doublons-bandeau-291`,
  `doublons-cadre-ct15` (×2), `doublons-lisibilite-291` (×2), `productions-ajout-refus-garde-340`,
  `productions-biblio-ajout-identite`. Leur seul point commun : elles ouvrent l'application et
  exigent zéro erreur console.
  ⮕ **MESURE DU 26 AOÛT — LA PISTE DU « DOUBLE SLASH » EST FAUSSE, ET LA BASELINE EST RÉGÉNÉRÉE.**
    · L'URL est CORRECTE : les specs construisent `'file://' + path.join(racineProjet, 'index.html')`,
      ce qui donne bien `file:///Users/…`. Le `//Users/…` du message est simplement ce que WebKit
      affiche APRÈS le schéma — pas une résolution ratée. Ne pas repartir de cette piste.
    · La cause est le **XHR SYNCHRONE** de `chargerVersionJSON` (`init-inline.js` ~l. 222) : WebKit
      refuse `XMLHttpRequest` sur `file://`. Le `try/catch` attrape bien l'exception — mais WebKit
      rapporte QUAND MÊME l'erreur au niveau page, et ces huit specs exigent zéro erreur console.
      Un try/catch ne fait pas taire un `pageerror`.
    · **Conséquence utilisateur, elle, réelle** : sur Safari en `file://`, `version.json` n'est
      probablement JAMAIS lu — l'app tourne sur les valeurs de repli codées dans `init-inline.js`
      et `main.js`. C'est pour ça que `release.mjs` les synchronise à chaque bump, et ça marche.
      Mais le mécanisme de détection des scripts périmés (#285) repose sur cette lecture.
    · **Baseline régénérée le 26 août sur le Mac** (`node scripts/verifier-playwright.mjs --ecrire`)
      après vérification que ces huit rougissent à l'identique sur `8dfda3ed`, commit d'avant la
      fusion du jour (mesuré en worktree, pas supposé). ⚠ L'ancienne baseline annonçait
      `totalEchecsConnus: 0`, générée le 18 août **là où WebKit n'existe pas** — elle certifiait
      zéro dette sur des specs qui n'avaient jamais tourné. Le hook criait donc « régression » sur
      une dette de plusieurs jours, ce que cet item déplorait déjà.
  ✅ **TRANCHÉ 26 août (verdict D5) : CORRIGER LA LECTURE.** Motif retenu : ce n'est pas qu'un
  problème de tests — si WebKit refuse cette lecture en `file://`, l'iPad la refuse aussi, et c'est
  le mécanisme qui prévient quand l'app sert un fichier périmé depuis son cache (#285).
  Énoncé d'origine : corriger le chargement (`init-inline.js`, XHR synchrone + `fetch` de secours) ou
  reconnaître l'erreur comme bruit d'environnement dans les specs. **Le premier est préférable** —
  si WebKit refuse ce chargement en `file://`, l'iPad de Grégoire le refuse aussi, et c'est la
  détection de mise à jour qui est en jeu, pas seulement des tests.

### Retour testeur — 24 août 2026 (Grégoire, en cours de planification)

- [x] **#486 — Un gabarit de production s'enregistre sans date d'échéance.** LIVRÉ en **1.94.0**.
  Grégoire prépare toutes ses productions avant de les transmettre ; or poser l'échéance EST
  l'acte de transmission. Depuis Beta 94, la sauvegarde exigeait la date : il fallait avoir
  déjà distribué le travail pour avoir le droit de le préparer. La garde contredisait aussi
  l'écran qu'elle gardait (« Décoché = les étudiant·es n'ont pas encore reçu le travail »,
  Beta 98.3) et rien en aval n'en dépendait — tous les lecteurs d'échéance filtrent déjà sur
  `assignee && !!date`, et `partage-schemas.js` classe `dateEcheance` parmi les champs LOCAUX
  interdits d'export. Livré : garde retirée de `validerChampsObligatoiresProduction`, helper
  `aucuneEcheanceAssignee()` (pendant d'`obtenirEcheanceEffective`, dont il reprend la lecture
  d'`assignee` pour que le badge ne puisse pas contredire le calendrier), badge « à planifier »
  dans la barre latérale (`.badge-a-planifier`, jetons `--badge-non-evalue-*`, fond OPAQUE —
  translucide, il tombait à 4,30:1 au survol en mode clair), microcopy remis d'accord aux
  trois endroits qui affirmaient l'inverse. **Portée arrêtée avec Grégoire : la date seule
  cesse de bloquer ; titre, type et pondération restent exigés.** Sentinelle
  `tests/unit/sentinelle-486-gabarit-sans-echeance.test.js`, 25 cas, **4 break-tests rouges**.
  Vitest 3008/3008.
  ✅ **PORTE TERRAIN RELEVÉE le 24 août — 3 passées, 0 échec, décision D rendue.** Le badge est
  lisible sur son iPad en clair ET en sombre (le seul verdict que la session ne pouvait pas rendre).
  **Décision D close sans code** : « il n'y a pas de pondération pour un artefact, je ne suis pas
  bloqué » — vérifié, la garde exempte déjà `artefact-portfolio`. La portée de #486 était juste.
  Mesure de corpus : **zéro surprise** — le badge marque bien, et aucun gabarit oublié n'a été
  révélé. Il sert à ne PAS en perdre, pas à réparer un retard. (Le champ était mal conçu de mon
  côté — un seul champ pour deux nombres ; levé par une question, versé en #488(d).)
  ⮕ **#486 EST CLOS : livré, éprouvé sur iPad, porte relevée 4/4, décision rendue.**
  Fichiers :
  `plans de travail/PORTES-TERRAIN-2026-08-24-486-gabarit-sans-echeance.md`
  + artefact https://claude.ai/code/artifact/886278b4-72e8-43b3-ba74-cb8116eefded
  ⚠ **Émise à 34 rangées, ramenée à 4 le jour même** sur retour de Grégoire (« complètement
  découragé par les portes terrain nombreuses »). **30 rangées retirées SUR PREUVE**, chacune
  documentée dans le markdown : logique pure couverte par Vitest (10), badge exécuté dans
  Chromium contre le vrai `index.html` (5), microcopies relues via l'API `accompagnement`
  réelle (3), calendrier exécuté avec son filtre exact (2), garde hors-trimestre absente du
  diff donc intacte (1), export PDF sur un chemin nul préexistant (1), sauvegarde d'archive
  retirée par tri de risque (1), 4 décisions de goût renvoyées à l'usage.

- [ ] **#487 — Réparer la voie Chromium des tests d'intégration.** CAUSE RACINE du volume des
  portes terrain, mesurée le 24 août. Les 36 fichiers de `tests/integration/` portent une liste
  blanche d'erreurs console **copiée-collée** qui ne connaît que la formulation WebKit d'un
  non-événement (ressource absente en `file://`). Chromium dit `net::ERR_FAILED`. Résultat :
  **39 des 54 échecs Chromium ont cette seule cause** — mesuré, et **une ligne ajoutée à un spec
  l'a fait passer de rouge à vert** (essai fait puis restauré). Or WebKit est **impossible à
  installer** : `cdn.playwright.dev` et `playwright.download.prss.microsoft.com` renvoient 403,
  bloqués par la politique réseau de l'environnement. ⮕ Sans navigateur, TOUT le rendu part chez
  Grégoire. Livrer : un helper partagé (règle zéro-dette : un seul endroit, pas 36 copies) +
  un projet `chromium` dans `playwright.config.js` avec `executablePath`. **Effet attendu : +39
  specs vivants, et la disparition de la plus grosse famille de rangées de portes.**

- [ ] **#488 — Porte de tri obligatoire dans le skill `portes-terrain`.** Le modèle n'a aucune
  étape qui demande « puis-je prouver cette rangée moi-même ? » avant de l'écrire : le défaut
  par défaut est donc de TOUT déléguer. Ajouter (a) l'obligation de prouver qu'une rangée n'est
  pas automatisable avant de l'inscrire, (b) le tri par RISQUE — un défaut cosmétique se découvre
  à l'usage et ne mérite pas de porte, une écriture de masse sur le corpus si, (c) une porte est
  le RÉSIDU, pas l'inventaire. Constat du 24 août : 20 portes en 14 jours.
  ⮕ **(d) UN CHAMP PAR NOMBRE — règle du 11 août, enfreinte le 24.** La porte allégée de #486
  fusionnait deux mesures dans un seul champ (« Portent le badge / me surprennent »). Réponse
  reçue : « aucune » — **inexploitable**, on ne sait pas lequel des deux nombres elle vise.
  Le skill l'interdisait déjà en toutes lettres ; la règle existait et n'a pas suffi. ⮕ Ajouter
  un **contrôle mécanique** plutôt qu'une consigne de plus : un libellé de mesure qui contient
  « / », « et » ou « puis » est un signal de champ fusionné. Une règle qu'on peut enfreindre en
  la relisant n'est pas une règle, c'est un vœu.

- [ ] **#489 — Le verrouillage des productions est une coquille vide, pas seulement un bouton manquant.**
  Constat de #468 (« `verrouillerEvaluation` reste sans point d'entrée UI », `SESSION.md:417`,
  et `AUDIT-conception-2026-08-20.md:533` « verrouillage par ailleurs inerte ») **jamais versé au
  backlog** — il a vécu neuf jours dans un journal. Mesuré le 24 août, et c'est PIRE que ce qui
  avait été noté, sur les DEUX bouts de la chaîne :
  · **Personne ne peut verrouiller.** `verrouillerEvaluation` (`js/productions.js:1386`, exposée
    ligne 2170) n'a **aucun appelant** : zéro occurrence dans `index.html`, absente du dispatcher
    de `main.js`, aucun appel JS. Seuls la définition, l'export, un commentaire et un test
    d'export la mentionnent. Idem pour `verrouillerEvaluationIndividuelle` (`js/evaluation.js:2601`).
  · **Et rien n'honorerait le verrou s'il était posé.** Le drapeau `verrouille` des productions
    est ÉCRIT à la création (`productions.js:1181`, `productions-liste.js:338`) et basculé par la
    fonction morte (`:1398`) — mais **aucun lecteur** ne s'en sert pour restreindre quoi que ce
    soit. (À ne pas confondre avec les cartouches, dont le verrou est complet et fonctionnel :
    `js/cartouches.js:1125-1300`.)
  ⮕ Décision à prendre, pas un correctif évident : **câbler** (le verrou devient réel, il faut
  alors définir ce qu'il interdit) ou **retirer** (règle zéro-dette : le champ part avec le code
  mort). Ne pas trancher à la place de Grégoire.
  ⮕ **Antécédent retrouvé le 24 août** : `stash@{5}` du **15 novembre 2025** (archivé en
  `archive/stash-5`) porte 1516 lignes de refonte du module Évaluation, dont le renommage
  `verrouillerEvaluationIndividuelle` → `verrouillerEvaluation` et un passage des jetons de la
  barre latérale vers une modale. **Valeur documentaire seulement** — `js/evaluation.js` a neuf
  mois d'évolution depuis, le diff ne s'appliquerait pas et ne doit pas être tenté. Il touche
  aussi `js/navigation.js`, zone protégée. Son nom, « sauvegarde avant retour arrière », dit
  qu'il a été délibérément écarté. À lire si la question des jetons ou du verrouillage revient.

### Audit « Conception » — 20-21 août 2026 (rapport `plans de travail/AUDIT-conception-2026-08-20.md` + addendum)

> ✅ **TRI FAIT le 21 août 2026** (relevé 27/27 de Grégoire, artefact + trace
> `plans de travail/TRIAGE-audits-2026-08-21.md`) : TOUT est retenu « Maintenant », versé en
> **#462-#484** ci-dessous. Décisions de fond : **D1 cartouches NAMESPACÉES** · **D2 échelles
> collègues RETIRÉES du code** (→ bibliothèque/partage) · **D3 recensement #449 GÉNÉRALISÉ aux
> 7 familles** · **D4 PR #63 rebasée et fusionnée**. Ordre d'exécution : §5 de la trace
> (1: #462 ✔ · 2: #464-L2 ✔ · 3: #466-L4 ✔ · 4: #468-L6 ✔ · 5: #463-L1 · 6: #465-L3 · 7: #469-L7 ·
> 8: #467-L5 · 9: #470/#471 · puis #472-#484 intercalés). Chaque lot livré = sentinelles +
> break-tests + porte terrain avant le suivant.

- [x] **#462 LIVRÉ 21 août 2026 (1.88.7)** D4 — PR #63 intégrée à main par cherry-pick de sa refonte `31f6b995` (T3 infobulles de famille, T4a « Variante : eliminee » masquée en DEN, T4b borne total ≥ numéro, T4d « statistique » unifié + sentinelle den-reliquats-343 break-testée) ; conflits résolus sur les 4 points de version (bump par release.mjs) ; SUIVI-BUGS re-daté (livré 21 août, pas 2 août) ; BACKLOG-ARCHIVE:2465 corrigée (CO-36) ; PR #63 fermée en référençant le commit livré.
- [ ] **#463** L1 — Suppressions gardées : recensement façon #449 généralisé aux 7 familles (grille/échelle/pratique/production/cartouche/horaire/enseignant), « écraser » par id gardé, sort des magasins de cartouches à tout retrait de grille (CT-02, CT-08, CT-21, CO-03, CO-04, CO-38 ; verdict D3).
  - ⮕ **Apport de la passe « connexions » du rituel #468 (21 août 2026)** — le tombstone est maintenant posé par les 3 `supprimerXDeBibliothequePartagee` (grilles/échelles/cartouches) ET par les chemins V2 correspondants. **DEUX FAMILLES RESTENT SANS TOMBSTONE**, à trancher ici puisque c'est une question de POLITIQUE, pas un oubli : (1) **pratiques** — `pratiques-gestion.js:948` et `donnees-v2.js:1546` ; le comportement est ASSUMÉ et DIT à l'utilisateur (« ce gabarit est fourni par défaut… il se réinjecte automatiquement »), ce qui n'est pas le cas des autres familles ; (2) **productions** — `donnees-v2.js:1653`, sans message équivalent. Décision attendue : le patron #449 impose-t-il le tombstone à ces deux familles aussi, ou le message explicite suffit-il pour les pratiques ? `ressourcesSupprimees` n'a qu'UN écrivain (`marquerRessourceSupprimee`, main.js:87) — pas de trou de ce côté.
- [x] **#464 LIVRÉ 21 août 2026 (1.89.0)** L2 — Clés nues : le lot complet (CT-07, CT-11, CT-12, CT-26, CO-02, CO-09, CO-10, CO-11/D2, CO-19). Plan : `plans de travail/PLAN-464-L2-cles-nues.md`.
  - **CT-26** : inventaire exhaustif des clés passées à `cle()` → **16 clés inscrites** à CLES_NAMESPACEES (dont les 4 du bilan réflexif — **#365 avait été clos à tort le 19 août** : le bilan n'était PAS namespacé, piège exact de CT-26 ; dont `dureePeriode`/CT-07, `chronoEvaluations`, `confidentielEtudiants`, `groupeSelectionne`, 5 clés de migration-diagnostic) ; `cle()` émet désormais un **warn (une fois par clé)** sur tout fallthrough hors registres.
  - **CO-10** : `forcerMigration` = copie-si-cible-vide + purge systématique (warn si refus) — plus JAMAIS d'écrasement des données vivantes ; pas de flag (la purge auto-éteint le déclencheur, la capture pré-trimestre reste reproductible — écart motivé à la proposition d'audit).
  - **#464 neuf** : `migrerResidusClesNues()` one-shot (flag) — rapatrie tout résidu nu vers l'actif si vide (dureePeriode : vers TOUS les trimestres dépourvus), purge ; no-op pré-trimestre sans brûler le flag. Remplace `migrerHorairesEtGroupesCours` (CT-12 : recopiait sans purger à chaque boot), RETIRÉE.
  - **CO-09** : **86 replis** de lecture vers la clé nue `pratiquesConfigurables` retirés (55 idiome littéral + **31 via la constante opaque** `CLE_PRATIQUES_CONFIGURATIONS`, invisible d'audit-ssot.py — constante et export retirés) ; seule reste la migration flaguée de main.js:591 (légitime).
  - **CO-11 + décision D2** : `assurerEchellesPersonnalisees` RETIRÉE (~200 lignes, resemait 8 échelles nominatives par trimestre en recréant la clé nue interdite #358) → versement one-shot dans `bibliothequeEchelles` (`migrerEchellesColleguesVersBibliotheque`, push sans replace via la fonction canonique assainie, tombstones respectés) ; garde anti-global-nu posée sur `migrerCategoriesVersSousCriteres` (grilles.js, exécutée au parse).
  - **CO-02** : garde démo réparée — lookup via `cle(ref.collection)` + items du pack estampillés `isDemo:true` à l'écriture du namespace démo (pack 20.8 → 20.9, refresh auto) ; renforce le patron « identité + flag » du retrait démo.
  - **CT-11 (tranche)** : écritures MIROIR nues de `seancesHoraire` retirées (orchestre + entité GC) + fallback n°5 de lecture nue retiré (horaire.js) — la fuite « un trimestre neuf ressert les séances du précédent » est fermée ; accordéon legacy et lecteurs ternaires morts → L7/#469.
  - **CO-19** : conversions IDME des profils — priorité INVERSÉE (échelle du trimestre d'abord, résidu `niveauxEchelle` en dernier recours).
  - **Sentinelle** : `tests/unit/sentinelle-464-cles-nues.test.js` (12 essais : registre, warn, migrations, ratchets statiques CO-09/CO-11/CT-11, versement D2). **4 break-tests, 4 ROUGES** (registre amputé, écrasement réintroduit, repli réintroduit, tombstone ignoré). Vitest 2787/2787, Playwright complet.
  - ⚠ **Porte terrain due** : migration one-shot sur les données réelles (backup Codex AVANT le premier boot post-pull) — voir PORTES-TERRAIN-2026-08-21-464.
- [ ] **#465** L3 — Moteur des pratiques « configuré ≠ calculé » : DEN note absente ⇒ null + ids de cibles stables ; schéma SPE unifié + un seul emplacement jetons + primauté `configuration.*` sur `.config` ; PratiqueManager routé par `construireConfigComplete` ; échelle irrésolue ⇒ refus diagnostiqué ; invalidation du cache à la bascule/sauvegarde ; diagnostics SOM/SPE re-branchés ; repli `.config`→wizard pour les copies legacy (CO-06, CO-07, CO-08, CO-13, CO-22, CO-23, résiduel #326).
- [x] **#466 LIVRÉ 21 août 2026 (1.91.1)** L4 — Bascule de trimestre : le lot complet (CT-05, CT-06, CT-17, CO-16, CO-20, CO-21).
  - **CT-05 v1** : « + Nouveau trimestre » avec activation passe par le chemin COMPLET (`changerTrimestreActifV2`) — miroir suivi, contexte de l'ancien trimestre purgé (le scénario type d'une rentrée).
  - **CT-05 v2 / ⚠⚠ 3e occurrence du piège #444/#446** : les TROIS gardes `typeof nom-nu` de `changerTrimestreActifV2` étaient morts (peupler GC, `rafraichirVuesApresCours`, bandeau d'archive — fonctions d'IIFE inaccessibles en nom nu). Réanimés en `window.` ; sur le code actuel, deux avaient des routes indirectes vivantes (#446), `rafraichirVuesApresCours` n'en avait AUCUNE.
  - **CT-06** : formulaire « Journées sans cours » refermé à la bascule + branche else du findIndex (refus bruyant, patron sentinelle horaire — fini « Journée modifiée » sans écriture).
  - **CO-16** : les 4 pointeurs d'édition Conception (grille/échelle/cartouche/pratique) remis à null à la bascule (`reinitialiserEditeur*ApresBascule`, un par module) + else des findIndex de sauvegarde grilles/échelles (refus bruyant au lieu de « sauvegardée ! » sans écriture).
  - **CT-17** : sélection non résolue = refus DIT + état vide + dropdown rafraîchi (patron commun aux 3 accordéons cours/GC/horaires).
  - **CO-20** : les écritures nues de `cartoucheActuel` synchronisent `window.cartoucheActuel` (5 lecteurs) — le symptôme « la sauvegarde recharge la MAUVAISE cartouche » est fermé ; l'unification sur UNE source part au lot L7/#469 (assumé, documenté au code).
  - **CO-21** : `modifierTypeCritereGrilleHandler` async/await — fini « Aucun critère défini » sur changement de type.
  - **Sentinelle** : `tests/integration/bascule-trimestre-466.spec.js` (4 cas). **4 break-tests, 4 ROUGES** — dont un premier jet du cas 1 resté VERT (2 routes indirectes le satisfaisaient : cassé à sa SOURCE, la restauration #446 de l'orchestre, et le commentaire de la spec requalifié honnêtement). Vitest + Playwright complets verts.
  - ⚠ Porte terrain due : PORTES-TERRAIN-2026-08-21-466-bascule.
- [ ] **#467** L5 — Sécurité : passe d'échappement (Cadre + Conception, sidebars/modales/sous-critères), retrait des renderers morts non échappés, imports JSON par les fonctions assainies + confirmation avant remplacement par id, `echapperHtml` et les guillemets (CT-09, CT-29, CO-14, CO-39).
- [x] **#468 LIVRÉ 21 août 2026 (1.91.2)** L6 — Boutons qui mentent, gestes qui plantent : le lot complet (CT-13, CO-05, CO-12, CO-17, CO-18, CO-25).
  - **CT-13** (verdict Grégoire : DEUX entrées distinctes) : « Exporter » un cours télécharge enfin un fichier — `exporterCoursSimple` (morte, doublon de `partagerTousLesCours`) reconvertie en `exporterUnCours(id)`, même contrat que l'export global (métadonnées CC, même enveloppe). Le geste qui range la fiche dans « à ajouter » s'appelle désormais « Déposer dans les cours disponibles ». Bord fermé au passage : `partagerCours` pose aussi `actif = false`, comme « Retirer de ma sélection » — un cours déposé pouvait rester le cours actif.
  - **CO-05** : trois appels fantômes RETIRÉS (fix par retrait, pas par activation) — `afficherEchellesPerformance()` (jamais existé dans le dépôt) tuait la notification de suppression APRÈS l'écriture ; les deux écritures dans `#nbNiveauxEchelle` (absent d'index.html) faisaient échouer chaque ajout/retrait de niveau par TypeError.
  - **CO-12** : `dupliquerPratique` pose `dansBibliotheque: true` (sans quoi `PratiqueManager` le rabattait sur `false`) ; `adopterMaquette` aussi, ce qui rattrape les maquettes créées avant le correctif. Les maquettes restent masquées par `filtrerParMaquette` — c'est ce qui leur permet de PARAÎTRE une fois adoptées.
  - **CO-17** : `construireProductionData(d, evaluations, idEnEdition)` — `verrouille`/`dansBibliotheque`/`coursId` ne sont posés qu'à la CRÉATION (l'objet est fusionné par spread : tout champ présent écrase). `echeancesParGroupe` n'est écrite que si le formulaire a quelque chose à dire — un `undefined` dans un spread détruisait les dates par groupe. ⚠ **#346 n'est PAS fermé** : le mécanisme d'entretien l'est, pas les données déjà déviées.
  - **CO-17 point 3 — REQUALIFIÉ, et confirmé AILLEURS** : l'audit visait `reinitialiserFormulaireProduction`, qui appelle pourtant déjà `peuplerEcheancesParGroupe(null)`. Le vrai chemin de « + Nouvelle production » est `creerNouvelleProduction` (productions-liste.js), qui vide le formulaire champ par champ et ne passait PAS par là : le bloc multi-groupes gardait les cases de la production précédente. Corrigé là, + le conteneur masqué est aussi VIDÉ (défense en profondeur).
  - **CO-18** : la balise `<label>` des cases Sélection/Obligatoires du mode hybride était laissée béante (le `>` manquait) — le parseur avalait l'`<input>` comme un attribut, `toggleProductionCategorieHandler` était inatteignable. La sentinelle ne vérifie pas le caractère : elle passe le HTML rendu à un **vérificateur de balises béantes**, qui attrape toute la famille.
  - **CO-25** (verdict Grégoire : RETIRER) : les deux gabarits de cartouches (`GABARIT_CART_ANALYTIQUE`, `GABARIT_CART_SPE_REVISION`) sont retirés — schéma `sections[]` sans `grilleId` ni commentaires, « 0 commentaire(s) », cul-de-sac. `ajouterGabaritsDefautSiManquants` honore `estRessourceSupprimee` ; les 5 `GABARIT_*` restants entrent dans `IDS_GABARITS_HARDCODES` ; et **les 3 `supprimerXDeBibliothequePartagee` (grilles/échelles/cartouches) posent enfin le tombstone** — c'était le chemin par lequel un gabarit revenait.
  - **Sentinelle** : `tests/unit/sentinelle-468-boutons-qui-mentent.test.js` (30 essais, une section par sous-lot). **4 break-tests, 11 ROUGES au total** (CO-18 : 3 balises béantes reproduites ; CO-05 : ReferenceError + 2 TypeError reproduits ; CO-12 : 3 rouges ; CO-17 : 3 puis 2 rouges ; CT-13 : 2 rouges ; CO-25 : 3 rouges). Vitest **2828/2828**, Playwright complet.
  - ⚠ Porte terrain due : PORTES-TERRAIN-2026-08-21-468-boutons.
- [ ] **#469** L7 — Grand retrait du code mort : îlot pratiques.js, grappe descriptive du configurable, pratique-test + config-francois, ancienne génération grilles/échelles/cartouches, pratique-notation-v2, HorairesEntite + chaîne Beta96, scories ; + I14 : REFORMER l'outil de diagnostic (sortie hors console, règle n°5) (CO-15, CT-12, CT-23, CT-24, CO-34 ; grep d'appelants avant chaque retrait).
- [ ] **#470** L8 — Vitesse : rendu des onglets différé à la première ouverture (boot et bascule), mises à jour ciblées des modales de bibliothèque, arrêt des réécritures inconditionnelles (cartouches à chaque visite) (CT-18, CT-20, CO-26).
- [ ] **#471** L9 — Documentation et registre : réviser les 4 docs de janvier (ou bandeau « périmée »), re-générer DATA-OWNERSHIP (audit-ssot.py), retirer ordre-chargement.txt, documenter les verdicts D1 (cartouches namespacées — chantier de migration à cadrer ici) et D2 (échelles collègues : plan de retrait vers bibliothèque/partage) (CT-25, CT-27, CO-30, CO-32).
- [ ] **#472** I1 — Nom du groupe-cours recalculé à l'affichage + rafraîchir carte/en-tête après sauvegarde d'entité référencée (CT-03 ; cause du volet désync de #328-T1).
- [ ] **#473** I2 — `horaireHebdo` fusionné par (jour, heure) : la 2ᵉ séance d'un même jour doit exister (CT-04).
- [ ] **#474** I3 — `profilEnseignant` réservé au profil de l'utilisateur (marqueur explicite), purge à la suppression (CT-10).
- [ ] **#475** I4 — Badge « X/5 configurés » : compter sur résolution pour les 4 références (CT-14).
- [ ] **#476** I5 — Gardes de doublon sur duplications et imports (GC identiques, courriels, « (copie) (copie) ») — à traiter avec le #291 ouvert (CT-15, CO-24). **CT-15 et CO-24 sont clos, portes terrain relevées.** Volet 2 (fusion des `dupliquer*`) : **premier palier livré le 24 août**, suite ci-dessous.
  - **✅ VOLET 1 LIVRÉ (23 août 2026, 1.92.0)** — Lots 4-5 du plan. `ajouterAvecGardeIdentite` au **point d'écriture** des cinq familles (pas sur les 24 boutons) : un second « Ajouter à ma sélection » refuse et **nomme** l'exemplaire en place ; « Dupliquer » n'est jamais bloqué. On bloque sur l'IDENTITÉ, jamais sur le nom — cas-témoin #450 verrouillé par sentinelle. Le trou refermé : les cinq familles ne cherchaient que par `id`/`idOriginal`, laissant passer `inspireDe.idOriginal` (paquet collègue) et `inspireDe.sourceId` (dérivation). **CO-24 clos** : `nommerCopie` donne X → X (copie) → X (copie 2) → X (copie 3), branché sur `BibliothequeUI.forkerItem` (le point partagé) et les 11 sites de concaténation manuelle. Le piège du 22 août (`db.set`/`db.setSync` rendent un `return;` NU sur refus de garde) est désamorcé dans les cinq familles par relecture-vérification après écriture.
  - **🔶 VOLET 2 — FUSION DES `dupliquer*` : PREMIER PALIER LIVRÉ (24 août 2026)**, la suite est une DÉCISION à prendre, pas du code à écrire.
    - **⚠ LA PRÉMISSE DE DÉPART ÉTAIT FAUSSE, ET C'EST LE FAIT LE PLUS UTILE DU LOT.** « Beaucoup plus sûr maintenant que les sentinelles des Lots 1-5 l'encadrent » ne tenait pas : sur les 24 fonctions du périmètre, **2 seulement** étaient exécutées par un test (`dupliquerPratique`, `dupliquerPratiqueBibliotheque`). Les sentinelles des Lots 1-6 couvrent l'IDENTITÉ et le NOMMAGE des copies, **pas** la mécanique de chaque fonction. Pire, deux d'entre elles sont des **greps sur le texte source** : après fusion, l'une passait **vacuement verte** (sa découpe des blocs `function dupliquer*` ne trouvait plus rien, boucle vide) et l'autre rougissait (elle épinglait 5 call-sites littéraux de `forkerItem`). Les deux pièges sont désormais fermés — la découpe exige au moins un bloc par fichier, et la garantie `forkerItem` est vérifiée à son nouvel emplacement.
    - **✅ Lot A — code mort retiré** (`74fafdd7`). Deux des 24 étaient **inatteignables** : `dupliquerGrilleActuelle` (aucun appelant) et `dupliquerEchelleActuelle` (câblée au seul bouton `index.html:5242`, en `display:none`, dont l'`id="btnDupliquerEchelle"` était **dupliqué** avec `index.html:5094` — `getElementById` rendant le premier, rien ne pouvait jamais l'afficher). Ce sont exactement les deux fonctions dont le Lot 5 avait corrigé un « bug latent » la veille : **deux corrections sur du code qu'aucun utilisateur ne pouvait exécuter**. Retrait autorisé pour `noms_stables.json` (zone protégée). Sentinelle-cliquet : `tests/unit/sentinelle-476-volet2-code-mort-retire.test.js`.
    - **✅ Lot B — banc de caractérisation** (`2549cb56`), `tests/integration/carac-476-volet2-duplication.spec.js`, **27 cas** en navigateur contre le vrai DOM. Fige, pour les 22 fonctions restantes, l'objet réellement écrit, la clé, le message affiché, la valeur de retour, l'intégrité de la source. C'est ce qui fait passer « sans changement de comportement » d'une AFFIRMATION à une MESURE.
    - **✅ Lot C — socle sûr fusionné** (`da2f0bcd`). Les cinq `dupliquerEtEditerX` déroulaient la même séquence recopiée cinq fois : elle vit maintenant une seule fois dans `BibliothequeUI.dupliquerEtEditerItem`, chaque famille n'apportant que son descripteur. Comportement préservé, mesuré vert par le banc. Ajouté : `BibliothequeUI.focaliserChamp` (5 copies de `getElementById + focus + select` retirées).
    - **✅ Lot D — second moteur : « dupliquer depuis la bibliothèque »**. Les cinq `dupliquerXBibliotheque` passent par `BibliothequeUI.dupliquerVersBibliotheque`. Le socle retenu est donc complet : **10 fonctions → 2 moteurs + 10 descripteurs**, comportement mesuré identique. Une divergence a même disparu d'elle-même : l'expression d'auteur inline de `dupliquerGrilleBibliotheque` était **strictement équivalente** à `BibliothequeUI.obtenirAuteurActif()` — écart purement cosmétique, supprimé sans effet.
    - **⏭ RESTE À DÉCIDER — les 12 autres voies** (« invite », « barre latérale », « item actif »). Elles divergent RÉELLEMENT (les neuf écarts ci-dessous) : les fusionner à comportement préservé revient à **transformer des accidents en configuration délibérée**. Deux chemins restent ouverts — fusion totale à comportement préservé, ou fusion **avec convergence délibérée**, qui corrige les écarts mais n'est plus un refactor pur et exige une porte terrain Mac + iPad. ⮕ Les deux moteurs livrés rendent d'ailleurs les écarts VISIBLES : chaque rappel `nommerLaCopie` / `forgerProvenance` d'un descripteur nomme une dette et renvoie à la liste ci-dessous. C'est la matière prête pour la décision.
  - **✅ CONVERGENCE LIVRÉE (24 août 2026, Lot E)** — les onze verdicts sont rendus (11/11) et **D0 = convergence délibérée**. Neuf écarts corrigés, D6 renvoyée en instruction. Détail des correctifs : **D1** les deux voies « barre latérale » (grilles, échelles) posent enfin `auteur` / `isDemo:false` / `inspireDe` et retirent `metadata_cc` — dupliquer un exemple rend désormais une copie MODIFIABLE ; **D2** `dupliquerProduction` renomme le `titre` et cesse d'écraser la description par l'activité ; **D3** `nommerCopie` remplace la concaténation nue sur les trois voies restantes ; **D4** les cinq voies qui gardaient les métadonnées de partage les retirent ; **D5** `forgerInspireDe` partout (provenance avec `sourceId`) ; **D7** `forkerItem` retire `estGabarit` ; **D8** l'invite des pratiques propose le nom de la source ; **D9** `forkerItem` renomme le champ QUI EXISTE (`nom` ou `titre`) au lieu d'en poser un ; **D10** `dupliquerGrilleActive` devient `async` et attend. ⚠ **La correction ne répare PAS les copies déjà faites** — décision 3.1 de la porte terrain. **Méthode** : les 32 attentes du banc ont été retournées AVANT le code et vues **16 rouges**, puis le code a suivi — converger en ajustant les attentes à ce que produit le code serait une tautologie. Suites : 2990/2990 unitaires · 32/32 au banc · 89/89 en intégration, double passe.
  - **🚪 PORTE TERRAIN DUE (24 août 2026)** : `plans de travail/PORTES-TERRAIN-2026-08-24-convergence-duplications.md` + artefact https://claude.ai/code/artifact/6a591ac7-8202-45fa-8d9f-d330bcaeef43 — **24 portes Mac + iPad, non relevées**. Le comportement a changé sur des gestes réels ; rien n'a été vu sur Safari ni sur iPad. Deux décisions y attendent un verdict : **3.1** réparer ou non les copies déjà faites ; **3.2** garder ou retirer une quatrième correction CO-24 (`dupliquerEtEditerProduction`) que D3 ne nommait pas.
  - **🔀 FUSION PRÉPARÉE (26 août 2026)** — branche `integration-476` : les 8 commits du 24 août
    portés sur la base 1.99.0. Six conflits, tous tranchés en faveur de `main`, plus avancé
    (builds, anti-cache, et la confirmation après duplication — `main` porte `notifications.succes`
    depuis « une seule forme de confirmation après sauvegarde », postérieur à la branche).
    Vérifié ligne à ligne qu'aucune balise d'`index.html` de la branche n'était perdue. Vitest
    **3276/3276** (311 fichiers).
    ⚠ **La prémisse « 11 arbitrages en attente » (rapport d'audit du 25 août) était FAUSSE** : la
    fiche porte « relevé rendu le 24 août — 11/11 tranchées ». Ce qui bloquait était la fusion,
    pas une décision.
  - **✅ LES DEUX VERDICTS DE LA PORTE RENDUS (26 août 2026)** :
    - **2.1 — réparer les copies déjà faites : OUI.** `scripts/reparation-476-copies-marquees-exemple.js`
      (dry-run par défaut, `{executer:true}` pour appliquer, `annuler476()` pour revenir).
      Critère : marque démo **ET** id absent de `PACK_DEMARRAGE` — le drapeau seul libérerait les
      exemples fournis. **Refus d'exécution si le pack n'est pas chargé** : le critère deviendrait
      universel et libérerait la démo entière. Sentinelle 7 cas, 2 break-tests ROUGE.
      ⏳ **DÛ PAR GRÉGOIRE** : coller le script en console, `await reparer476()`, rapporter le plan
      AVANT d'exécuter.
    - **2.2 — la quatrième correction non arbitrée : GARDER.** Même défaut, même remède ; c'est la
      convergence D0 appliquée sans exception.
  - **⏳ RESTE AVANT FUSION DANS `main`** : les **3 portes terrain** (Safari, corpus réel) — grille
    d'exemple dupliquée depuis la barre latérale, production dont la description diffère de
    l'activité, et une duplication d'usage courant sans attendu précis.
  - **⏭ SUITE POSSIBLE, MAINTENANT DÉBLOQUÉE** : la convergence a résorbé les écarts que les rappels `nommerLaCopie` / `forgerProvenance` des deux moteurs servaient à reconduire. Les 12 voies restantes sont désormais fusionnables **sans rien paramétrer**. À faire APRÈS la porte terrain — et, de mon avis, après #454 / #453 qui sont des bugs terrain visibles.
  - **📝 FICHE D'ARBITRAGE (24 août 2026)** : `plans de travail/ARBITRAGE-2026-08-24-476-volet2-duplications.md` + artefact https://claude.ai/code/artifact/64c50829-440e-4ad5-8cf8-7b4bdfc06b05 — **11 décisions en attente du verdict de Grégoire** (D1…D10 sur les écarts, D0 sur l'orientation du reste). Ce ne sont PAS des vérifications : chaque ligne porte un champ de saisie, jamais une case à cocher (leçon du 11 août). ⚠ **Constat qui a émergé en rédigeant la fiche, et qui change le poids de D1** : `estItemDemo` (`js/bibliotheque-ui.js:72`) rend vrai si `isDemo === true` **OU** si l'auteur vaut `Demo Labo Codex` — or la copie faite depuis la barre latérale garde **les deux**. `appliquerModeLectureSeuleDemo` désactive alors tous les champs : **dupliquer un exemple depuis la barre latérale rend une copie qu'on ne peut toujours pas modifier**, ce qui est exactement ce que le geste est censé débloquer. Ce n'est plus une question de style, c'est un défaut fonctionnel.
  - **📐 LES NEUF ÉCARTS MESURÉS ENTRE LES VOIES DE DUPLICATION** (24 août, relevés par le banc du Lot B ; tous FIGÉS tels quels, aucun corrigé) — c'est la matière de la décision ci-dessus :
    1. `dupliquerGrilleDepuisSidebar` et `dupliquerEchelleDepuisSidebar` **ne posent ni `auteur`, ni `isDemo`, ni `inspireDe`, et gardent `metadata_cc`** : la copie d'un exemple de démo **reste marquée démo** et attribuée à son auteur d'origine. Les autres voies de la même famille font l'inverse. C'est le plus gros écart du lot.
    2. `dupliquerGrille` est la **seule** à régénérer les ID de critères.
    3. `dupliquerGrille` construit `inspireDe` à la main (3 clés) là où son homologue `dupliquerEchelle` passe par `forgerInspireDe` (4 clés, dont `sourceId`).
    4. `dupliquerGrilleActive` est la **seule non-`async`** : elle lance sa cible sans l'attendre, quand `dupliquerEchelleActive` attend.
    5. `dupliquerCartouche` **ne retire pas** `metadata_cc`, contrairement à `dupliquerCartoucheBibliotheque`.
    6. `dupliquerProduction` **laisse le `titre` inchangé** et suffixe `activiteApprentissage` + `description` — en **écrasant la description par l'activité** au passage.
    7. `dupliquerEtEditerProduction` fait poser par `forkerItem` un champ **`nom`** que les productions n'ont pas (elles nomment par `titre`) : la copie porte deux champs de nom, la source un seul.
    8. `dupliquerEtEditerPratique` **conserve `estGabarit`** là où `dupliquerPratiqueBibliotheque` le retire explicitement.
    9. **CO-24 est encore vivant sur trois voies** — `dupliquerProductionBibliotheque`, `dupliquerPratiqueBibliotheque`, `dupliquerPratiqueMateriel` — qui concatènent « (copie) » au lieu de passer par `nommerCopie`. Cause : la sentinelle CO-24 (`sentinelle-476-garde-identite.test.js`) ne lit que `grilles.js`, `echelles.js`, `cartouches.js` et `bibliotheque-ui.js` ; **`productions-*.js` et `pratiques-gestion.js` n'y sont pas**. Le banc du Lot B le verrouille désormais par une chaîne de deux duplications (une seule copie ne distingue pas les deux nommages).
  - **⚠ DETTE ADJACENTE DÉCOUVERTE LE 24 AOÛT, non traitée** : `index.html` contient **11 autres ID DOM dupliqués** (`apercuEchelle`, `nomEchelleTemplate`, `selectEchelleTemplate`, `typeEchelle`, `tableauNiveaux`, `seuilReussite`, `champAutreEchelle`, `nomEchelleContainer`, `tri-da`, `tri-nom`, `tri-prenom`) — même classe de bug que celui qui rendait `dupliquerEchelleActuelle` inatteignable, très concentrée sur la zone échelles. Chacun signifie qu'un `getElementById` ne touche jamais le second élément. À auditer un par un : certains sont peut-être bénins, d'autres cachent probablement un écran qui ne répond pas.
  - **✅ CT-15 LIVRÉ (23 août 2026)** — Lot 6 du plan, les trois sites nommés par l'audit. Nouveau module `js/identite-naturelle.js` : l'identité NATURELLE d'une entité du cadre (à ne pas confondre avec l'identité de LIGNÉE d'`identite-item.js`). Cours = le **code seul** (#455 appliqué, pas contourné) ; enseignant = le **courriel**, jamais le nom (#450 transposé) ; groupe-cours = le **triplet** trimestre+cours+groupe, horaire et enseignant volontairement EXCLUS puisque ce sont eux qui rendent deux jumeaux légitimes. Règle commune aux trois gardes, celle de #455 : **le geste reste possible, jamais silencieux**. ⮕ Ce que le chantier a trouvé en plus : **trois normalisations concurrentes** pour « est-ce le même cours ? » — le formulaire faisait `trim().toUpperCase()`, l'import comparait en `===` BRUT, l'entité ne comparait rien. Conséquence mesurable : « 601-101-mq » importé à côté d'un « 601-101-MQ » existant n'était pas vu comme un doublon — **refusé à la main, accepté par fichier**. Une seule clé désormais. La garde de cours vit au **point d'écriture** (`creerCours` refuse sans `doublonAssume`), et l'**édition** est gardée aussi : renommer le code d'une fiche pour lui donner celui d'une autre fabriquait exactement le doublon que la création refusait, par un chemin que personne ne surveillait. Sentinelle `sentinelle-ct15-identite-naturelle` (16 cas) + porte navigateur `doublons-cadre-ct15` ; **7 break-tests rouges** avant de leur faire confiance. **✅ PORTE TERRAIN RELEVÉE le 23 août : 29/29, zéro échec, zéro reliquat** (`plans de travail/PORTES-TERRAIN-2026-08-23-doublons-cadre.md`). Les quatre portes qui comptaient sont celles où la garde devait rester MUETTE — casse (1.2a), édition du seul nom (1.3d), homonymes à courriels différents (1.4d), changement d'horaire d'un GC (1.5e) : toutes vertes. **Décisions rendues, aucune ne demande de code** : avertir plutôt qu'interdire acté pour les trois (3.1) ; dialogue natif conservé (3.2) ; nommer le jumeau suffit — on n'ajoute ni l'horaire ni l'enseignant au message (3.3).
  - **⚠ DETTE ADJACENTE, non traitée** : le **titre** d'une carte de bibliothèque (`opts.nom` de `renderCarteSelection`/`renderCarteDisponible`) n'est pas échappé. Pas un oubli : `js/echelles.js:2244` y injecte délibérément un badge HTML, et corriger proprement demande de démêler 7 appelants dont plusieurs HORS bibliothèques (cours.js, trimestre-v2-liste.js, tampons-bibliotheque.js, planification-bibliotheque.js, partage-section.js). Le plan interdisait d'élargir là.
  - **⚠ DETTE DE FOND, non traitée** : faire rendre un booléen à `db.set`/`db.setSync` (js/db.js:449 et :1458) au lieu d'un `return;` nu. *Tous* les écrivains gardés partagent cet angle mort ; la surface d'appel est trop large pour être auditée dans ce chantier.
  - **📋 PLAN (23 août 2026)** : même document que #291, `plans de travail/PLAN-291-476-gestion-des-doublons.md`. **Recommandation rendue** sur les **33** fonctions `dupliquer*` mesurées (24 en bibliothèque, 9 hors périmètre) : **ne pas poser 24 gardes — une seule, au point d'ÉCRITURE et non au clic** ; dupliquer reste une action VOULUE, jamais bloquée ; le vrai défaut de CO-24 (« X (copie) (copie) (copie) ») se règle par un helper de nommage. **Volet 2 à créer après ce chantier** : fusionner les 24 `dupliquer*` (refactor sans changement de comportement, plus sûr une fois les sentinelles posées). CT-15 (groupes-cours, courriels enseignant, `creerCours`) = Lot 6, optionnel.
- [ ] ⚠️ **Anti-cache : `release.mjs --build-only` et sa sentinelle n'ont PAS la même base de comparaison** — constat mesuré du 24 août 2026, aucun identifiant neuf alloué.
  - **Ce qui s'est passé.** Après le Lot E de #476, `node scripts/release.mjs --build-only` a bumpé le build (0823-1534 → 0824-1141) et l'anti-cache des **10 fichiers du chantier courant**. La sentinelle `sentinelle-anticache-fichiers-modifies` est restée ROUGE en nommant **7 autres fichiers** — `changelog-data.js`, `cours.js`, `entites/cours-entite.js`, `identite-naturelle.js`, `trimestre-v2-{cours,enseignants,groupes-cours}.js` — tous issus du chantier CT-15 de la veille.
  - **La cause.** La sentinelle prend pour base `git log -3 -- version.json` puis diffe `commits[1]..HEAD` : **tout fichier modifié depuis la release PRÉCÉDENTE** doit porter un `?v=` du jour du build courant. Déplacer le jour du build périme donc mécaniquement tous les fichiers bumpés lors de la release précédente. `release.mjs --build-only`, lui, ne bumpe que les fichiers du chantier courant. **Les deux ont raison séparément et se contredisent ensemble.**
  - **Contourné à la main** le 24 août (les 7 alignés sur `20260824a`), mais ça se reproduira à chaque build bumpé un jour différent de la release précédente. ⮕ Faire converger les deux bases : soit `release.mjs` adopte la base de la sentinelle, soit la sentinelle n'exige le jour du build que pour les fichiers modifiés **depuis le dernier build**, pas depuis la dernière release.
  - ✅ **Ce que la sentinelle a réellement évité ce jour-là** : `js/pratiques.js` était modifié (correctif D8) et gardait `?v=20260821b`. Sans elle, le navigateur de Grégoire aurait servi l'ANCIEN fichier, et la porte terrain 2.3 aurait échoué en **faux rouge** — exactement l'incident du 23 août. Le cliquet fait son travail ; c'est sa coordination avec le script qui manque.
- [ ] 🔴 **CI — deux pannes distinctes, à ne pas confondre** (constat mesuré du 23 août 2026, aucun identifiant neuf alloué)
  - **(a) LE JOB NE DÉMARRE PLUS depuis le 21 août 16 h 21 UTC.** 26 runs d'affilée « échouent » en 3-5 s avec `runner_id: 0`, `runner_name: ""` et aucune étape enregistrée : le job n'est jamais dispatché. Le workflow est pourtant `state: active`, et aucun commit n'a touché `.github/workflows/tests.yml` ni `tests/package-lock.json` dans la fenêtre. **Cause non établissable depuis le dépôt** : la signature est celle de minutes Actions indisponibles sur un dépôt privé (privé depuis le 23 juin, cf. DEPLOY.md §8.3), mais le champ `billable` de l'API renvoie 0 pour TOUS les runs — y compris un qui a tourné 868 s — donc inexploitable. ⮕ **À vérifier par Grégoire : Settings › Billing › Actions.** Rien dans le dépôt ne rétablit des minutes épuisées.
  - **(b) ET AVANT DE S'ARRÊTER, ELLE ÉTAIT DÉJÀ ROUGE.** Dernier run complet (18 août, run 574) : Vitest 2738/2738 vert, puis **Playwright 88 passés / 5 ÉCHOUÉS** en 12,5 min. Les cinq :
    - `planif-alignement.spec.js:59` — « à +40 px du repère, aucune aimantation ne doit jouer » (un snap rendait 400)
    - `planif-drag-pointer-148.spec.js:70` — CAS D, un drag souris ne déplace plus le nœud (`pendant.x` pas > `avant.x + 100`)
    - `planif-drag-pointer-148.spec.js:117` — CAS B, tirer une évaluation hors de sa leçon ne la détache plus (`parentApres` vaut encore `p148L`)
    - `planif-toolbar.spec.js:107` — `locator.click` en timeout à 30 s sur `#planif-palette-nav`
    - `portes-relais-cadre.spec.js:57` — `semainePlanificationFin` n'est plus l'élément atteignable en son centre
    ⮕ Toutes du **glisser-déposer / de la mise en page du planificateur**, sous WebKit Linux. Indice fort : le run 543 (17 août) était une **montée de version de Playwright proposée par Dependabot**, et elle échouait déjà — une régression d'émulation de pointeur est le premier suspect. **Rétablir les minutes ne rendra pas la CI verte.**
  - **(c) GASPILLAGE STRUCTUREL, corrigé le 23 août.** Sur les 87 derniers runs : **61 annulés, 26 en échec, ZÉRO succès** — le `cancel-in-progress` fauche les runs, Grégoire poussant plus vite que les 12,5 min du job, et une bonne part partait sur des commits purement documentaires. Le workflow ignore désormais la documentation (`paths-ignore`, liste verrouillée par `tests/unit/sentinelle-ci-paths-ignore.test.js` — un test qui se mettrait à lire ces chemins fait rougir le cliquet) et met en cache le binaire WebKit.

- [ ] **#477** I6 — Petit lot Cadre : annulation d'horaire qui colle, dédup trimestres par id + mémoïsation, schéma du diagnostic corrigé (CT-16, CT-19, CT-22).
- [ ] **#478** I7 — Micro-UX du parcours de rentrée, avec le skill design-interface (CT-28).
- [ ] **#479** I8 — Import échelles inter-trimestre : porter le patron grilles (`cleSource`) (CO-27).
- [ ] **#480** I9 — Banc : pondérer la terminale du corpus généré de façon réaliste (CO-28).
- [ ] **#481** I10 — Robustesse diverse : ids de critères, modales au même id, `window.event`, borne sur `ressourcesSupprimees` (CO-29).
- [ ] **#482** I11 — Snapshot d'archivage : pratiques du trimestre archivé, pas de l'actif — À RECOUPER d'abord (CO-35, [AGENT]).
- [ ] **#483** I12 — Pondérations : confirmation non bloquante à ≠ 100 % ; SOM — exclure et dire les évaluations orphelines au lieu du poids 1 (CO-37, CO-40).
- [ ] **#484** I13 — Assistant : remonter « Je sais déjà ce que je veux » et « Je ne suis pas certain·e » en portes de la 1ʳᵉ modale — validation visuelle Mac (#343-T5).

- [x] **#461 LIVRÉ 21 août 2026 (1.88.6)** CO-01 — éditer une pratique via l'assistant détruisait l'enveloppe : `inspireDe`, `estMaquette`, `metadata_cc`, `isDemo`, `dateCreation`, `dansBibliotheque` et l'auteur d'origine (Bloquant de l'audit Conception ; jumeau du CT-01 : un « Enregistrer » qui détruit en confirmant).
  - **Cause** : `creerPratiqueV2` reconstruit l'objet à neuf (seul l'id survit, `dansBibliotheque` forcé true, `dateCreation` réécrite) et `sauvegarderPratique` remplaçait intégralement (`pratiques[index] = pratique`) ; en prime `chargerPratiqueExistante` ne remplissait pas `prenom`/`nomAuteur` (les clés que lit la construction) — l'auteur d'origine était remplacé ou vidé. Violation de l'invariant CC de la SPEC D §3.1 (« inspireDe jamais effacé », CC BY).
  - **Fix** : fusion d'enveloppe dans la branche « modification » de `sauvegarderPratique` (préserve `inspireDe`/`estMaquette`/`metadata_cc`/`isDemo` si absents du nouvel objet ; `dateCreation` et `dansBibliotheque` toujours repris de l'existante ; auteur/établissement jamais remplacés par du vide) + rechargement de l'auteur dans `chargerPratiqueExistante` (split `prenom`/`nomAuteur`). Le `.config` snapshot n'est PAS préservé — voulu : le préserver figerait les retouches (cf. CO-07, la config résolue prime) ; l'édition re-résout par `configuration.*`.
  - **Sentinelle** : `tests/integration/pratique-edition-preserve-enveloppe.spec.js` (2 cas : round-trip d'édition complet + contrôle création non affectée). **Break-test par construction : écrite AVANT le fix, ROUGE sur 1.88.5** (reproduction [NAV] du constat), verte après.


> ✅ **TRI FAIT le 21 août 2026** : les constats CT-02..CT-29 sont versés via les lots et items
> **#462-#484** de la section « Audit Conception » ci-dessus (lots transverses aux deux audits).

- [x] **#460 LIVRÉ 20 août 2026 (1.88.5)** CT-01 — édition d'horaire : changer le format écrasait les séances saisies par les défauts (Bloquant de l'audit).
  - **Cause** : la régénération `innerHTML` des lignes de séance (`mettreAJourSeancesHoraireV2`) repart des défauts ; le re-remplissage n'existait que dans `editerHoraireV2`, pas dans le handler des selects « Séances par semaine » et « Périodes par séance » — « Enregistrer » persistait ensuite les défauts en silence (toast de succès mensonger).
  - **Fix** : nouveau handler `changerFormatSeancesHoraireV2` (photographie des valeurs du DOM avant régénération, restitution ligne à ligne ; les lignes ajoutées seules prennent les défauts), câblé en `data-on-change` sur les deux selects d'`index.html`. `nouveauHoraireV2` et `editerHoraireV2` gardent la régénération aux défauts (comportement voulu).
  - **Sentinelle** : `tests/integration/horaire-format-preserve-seances.spec.js` (3 cas, dont persistance après « Enregistrer » et garde-fou inverse « Nouvel horaire repart des défauts ») ; passe par de VRAIS événements `change` pour verrouiller aussi le câblage `data-on-change`. **Break-test : câblage réverti → 3 ROUGES**, restauré → verts.
  - ⚠ Piège de harnais documenté : `cle()` dérive le préfixe du flag `actif: true` du REGISTRE `trimestres`, pas du miroir `trimestreActif` — un setup de test sans le flag écrit/lit les clés nues.

### Chantier alignement — session du 6 août 2026 (branche `claude/pedagogical-alignment-planner-y7eppc`)

- [x] **#407 LIVRÉ 7 août 2026** Rattachement carte d'alignement → cours — **lot 1 (1.48.0) + lot 2 (1.49.0)**, décision Grégoire du 7 août au soir.
  - **Pourquoi** : la carte vit dans `planification_mindmap`, namespacé par trimestre ; le cours est une collection GLOBALE. Le `coursId` est la seule identité de la carte qui survive au changement de session. C'est le préalable de **#368** (migrer la carte 601-101 de H2026 vers A2026 — geste manuel qui revient chaque session).
  - ⚠ **Constat de cadrage (7 août)** : tant que le planificateur s'en tient à la SEMAINE (décision Grégoire), ce rattachement n'apporte **rien au planificateur** — cartes et `calendrierComplet` sont déjà namespacés par le même trimestre, donc déjà cohérents. Le gain est la reprise inter-trimestre, pas l'affichage. Le rattachement ne redeviendra un préalable du planificateur qu'avec les colonnes de séance (reportées).
  - **Livré au lot 1** : `coursId` dans l'entrée d'index (pas dans le contenu de la carte) ; fabrique unique `creerEntreeIndex()` qui remplace les 6 littéraux dispersés ; porte d'écriture unique `definirCoursDeCarte()` ; résolution par IDENTITÉ contre la collection vivante (`resoudreCoursDeCarte`, `rattachementOrphelin`) ; panneau « Cours rattaché… » du menu Actions (patron du panneau import inter-trimestre, zéro CSS neuf) ; cours affiché dans le sélecteur de cartes ; le `coursId` SUIT la carte à l'import inter-trimestre. Sentinelle 14 cas, 9 break-tests.
  - **Cartes existantes** : restent sans cours. Aucune devinette depuis le titre — même règle que la migration d'ancrage du 6 août.
  - **Livré au lot 2 (1.49.0)** : `listerReprisesPourCours()` (lecture pure, exclut le trimestre courant — on ne se reprend pas soi-même) ; l'ÉTAT VIDE du planificateur propose la reprise, nommée quand il n'y a qu'un candidat et ouvrant le choix quand il y en a plusieurs (l'ordre des trimestres n'étant pas chronologique, élire « le plus récent » serait une devinette) ; groupe « Même cours » en tête du panneau d'import. Rien ne s'importe jamais tout seul. Sentinelle 9 cas, 7 break-tests.
  - ⚠ **Leçon de break-test (lot 2)** : la sentinelle « la source reste intacte » ne pouvait PAS rougir — le faux `db` sérialisait, donc aucune référence ne pouvait être partagée quoi que fasse le code. Remplacée par un test monté sur un harnais **par référence** (qui modélise le chemin `memoryCache` de `db.js`, le seul où le deep-clone d'`importerDepuisBibliotheque` est nécessaire) : retirer le clone la fait rougir. Un stub plus « propre » que le vrai stockage rend le test complaisant.

- [x] **#408 RÉGLÉ 7 août 2026** — Le changelog utilisateur s'arrête à **1.31** alors que la production est à **1.48.0** — créé 7 août 2026 au merge.
  - Les 16 versions mineures du chantier alignement (1.32 → 1.47) n'ont **aucune entrée** dans `js/changelog-data.js`, et elles sont maintenant déployées et visibles des testeurs.
  - ✅ **TRANCHÉ par Grégoire (7 août)** : **consolidation en UNE entrée** `1.48` « Alignement pédagogique : le planificateur », 8 items orientés utilisateur. L'exception est documentée en tête de `js/changelog-data.js` pour qu'une session ultérieure ne la « répare » pas en la découpant : ces 16 mineures ont vécu sur une branche non mergée et ont été déployées d'un seul coup — du point de vue de l'utilisateur, qui passait de 1.31 à 1.48, elles sont UNE livraison.

- [x] **#410 LIVRÉ 7 août 2026 (1.51.0)** Sélecteur de semaine dans le bloc + étiquette de contexte conditionnelle — issu de la séance de réflexion du 7 août (« la paire »).
  - **Sélecteur** : le champ « Semaine » existait déjà, dans l'inspecteur, en saisie libre — et personne ne le remplissait ; l'enseignant compensait en écrivant « Sem. 11 » dans ses titres. Motif de F1/F3 une **troisième** fois : *un champ qui n'est pas là où le travail se fait se fait compenser dans le texte.*
  - ⮕ **Les deux gestes passent par la MÊME porte** `deposerDansGrille()`, déjà utilisée par le glisser : ils ne peuvent pas diverger. Sur une leçon elle ÉCRIT `metadata.semaine` ; sur une séquence elle DÉPLACE le bloc (décalage de toutes ses leçons, écarts préservés). **Rien de nouveau n'est stocké sur la séquence** — la contradiction séquence/leçons retirée le 6 août ne se rouvre pas.
  - Rendu **paresseux** (une seule option au rendu du bloc, liste peuplée au premier contact) : `reconstruireDOM()` passe souvent et une carte porte des dizaines de blocs.
  - **Étiquette de contexte** : sur la semaine 11 de Grégoire, le nom de la séquence apparaissait TROIS fois (une comme séquence, une par leçon). Elle ne s'affiche plus que si la séquence n'est PAS déjà rendue dans la même rangée — elle garde son sens pour la leçon affichée loin de sa séquence, et pour « Non planifié ».
  - Sentinelle `tests/unit/sentinelle-selecteur-semaine-et-contexte.test.js` (12 cas), **12 break-tests ROUGE→VERT**.
  - ⮕ **RESTE de la chaîne conçue le 7 août** : (3) les badges — ils dépendent de titres courts, donc du ménage ; (4) le nettoyage des titres, à moitié bloqué tant que les colonnes de séance sont reportées (on peut retirer « Sem. 1 », pas « séance 1 »).

- [x] **#411 LIVRÉ 7 août 2026 (1.52.0)** Pastilles du planificateur + nettoyage des repères de semaine dans les titres — fin de la chaîne conçue le 7 août.
  - **Pastilles** : les blocs s'ÉTIRAIENT (`flex: 1 1 auto`) — une seule leçon occupait toute sa rangée. Ils épousent leur contenu (`flex: 0 1 auto`), plancher 150 → 96 px. L'arithmétique du côte à côte n'en souffre pas : la sentinelle exige `utile ≥ 2 × plancher + gouttière`, qu'un plancher plus bas rend seulement plus facile. Contour permanent + rayon 10 px, portés au bloc de GRILLE seulement.
  - **Nettoyage des titres** : PROPOSÉ, jamais appliqué d'office — réciproque de la règle du 6 août (la migration d'ancrage a refusé de LIRE la semaine dans les titres, on ne réécrit donc pas les titres depuis un champ). Quatre catégories : `pret` (concorde → retrait sûr), `ancrable` (non posée → ancrer PUIS retirer, sur confirmation explicite), `conflit` (le titre contredit la semaine posée → **on ne choisit pas**), `vide` (le titre ne dirait plus rien → à réécrire à la main).
  - ~~⚠ **Le repère de SÉANCE n'est jamais retiré**~~ : **LEVÉ le 12 août 2026 par le #416 lot E.** Le motif du report était « la séance n'a pas de logement dans le modèle » ; le lot A lui en a donné un (`metadata.rangSeance`). Le repère part désormais — à trois conditions, aucune facultative : le titre porte un rang, le MODÈLE en porte un, et les deux concordent. La réciproque de la règle du 6 août tient : on ne LIT jamais le rang depuis le titre pour le poser d'office.
  - Sentinelle `tests/unit/sentinelle-nettoyage-reperes-titres.test.js` (17 cas), **13 break-tests ROUGE→VERT**, dont un rejeté au 1er jet (la cassure était appliquée mais n'exerçait rien : `sem` ne matche pas « Sém »).
  - ⮕ La chaîne du 7 août est **close** : dropdown (#410) · contexte (#410) · pastilles (#411) · titres (#411). ⮕ **Sa seconde moitié, longtemps reportée, est close le 12 août** avec le #416 lot E.

- [x] **#412 LIVRÉ 7 août 2026 (1.53.0)** Disposition de la réserve « Non planifié » : sous la grille ou en colonne à gauche — ferme le ◈ OUVERT « deux vues du planificateur (hauteur / largeur) » de `METHODE-ALIGNEMENT.md`.
  - **Lecture retenue par Grégoire (7 août)** : des deux lectures que le document laissait ouvertes, c'est **la file « Non planifié » à côté de la grille** — pas les semaines déroulées horizontalement. Un bouton permute, la préférence est mémorisée (`planifReserveDisposition`).
  - ▣ **GÉNÉRAL appliqué** : quand un compromis d'affichage dépend de l'écran de l'utilisateur, le lui offrir vaut mieux que de trancher à sa place.
  - ⚠ **PLANCHER DE LARGEUR** — le vrai risque, et c'est celui de 1.47.0 dans son second costume. À 360 px (défaut), la palette offre 316 px utiles ; une colonne de 170 px n'en laisserait que ~138 à la grille, soit UNE pastille par rangée. La bascule élève donc la palette à **520 px** si elle est en dessous (~298 px de cellule, contre 196 requis). Revenir en bas ne rétrécit pas : la largeur est un réglage de l'utilisateur.
  - **La sentinelle géométrique du 7 août a été ÉTENDUE** (volet 3, 6 cas) : elle ne couvrait que la disposition « réserve en bas ». Un test vérifie aussi que le plancher est INDISPENSABLE — s'il devient inutile un jour, on le retire au lieu de le garder « au cas où ».
  - Sentinelle de comportement `tests/unit/sentinelle-disposition-reserve.test.js` (10 cas). Le cas verrouillé en priorité : **le glisser ne connaît pas la disposition** — le dépôt repose sur `data-grille-semaine=""`, qu'un mode ne doit jamais changer.
  - **17 break-tests ROUGE→VERT**, dont deux refaits : l'un ciblait une ligne présente deux fois et atterrissait dans le bouton au lieu du rendu ; l'autre était appliqué mais n'exerçait rien.
  - ⚠ **CORRECTIF 1.53.1, constat terrain immédiat de Grégoire (« je ne vois pas de bouton »)** : il était dans le DOM, avec son écouteur et sa préférence, mais (1) son glyphe `⫿` (U+2AFF, Supplemental Math Operators) n'existe pas dans les polices courantes → carré vide ; (2) `justify-content: space-between` répartissait TROIS enfants et posait le bouton SEUL au milieu de la barre. Corrigé : glyphe `◧` (U+25E7, Formes géométriques — et il DÉPEINT une colonne à gauche) + `flex: 1` sur le titre pour regrouper les boutons à droite.
  - ⮕ **Leçon, 3e occurrence du « vert et inerte » en deux jours** : mes sentinelles vérifiaient le balisage et l'arithmétique, pas la RENDABILITÉ du glyphe ni la mise en page de la barre. Nouveau volet de 4 cas : aucun glyphe de bouton hors des blocs Unicode sûrs, chacun porte un `title`, et le titre absorbe la place libre. 4 break-tests.
  - ⚠ **CORRECTIF 1.53.2, second constat terrain (« il n'y a plus de disposition verticale une fois qu'on a choisi l'horizontale »)** : `palette.querySelector('.planif-palette-toggle')` rend le PREMIER élément de cette classe. Depuis l'ajout du bouton de disposition, c'était LUI — le comportement « replier » s'y attachait, réécrivait son libellé en « + » / « − » (d'où le ◧ disparu des captures) et le vrai bouton de repli ne faisait plus rien. **Aller sans retour.** Corrigé par une classe DÉDIÉE `.planif-palette-replier`.
  - ⮕ ▣ **GÉNÉRAL** : *une classe qui sert à STYLER ne peut pas servir à DÉSIGNER.* Dès qu'un deuxième élément la porte, tout `querySelector` sur elle devient un pari sur l'ordre du DOM. Volet de 4 cas + 3 break-tests.
  - ✅ **1.53.3 — le glyphe DÉPEINT la disposition** (proposition de Grégoire) : `◧` montre la moitié pleine à gauche (réserve en colonne) ; pivoté de −90° en CSS, elle passe en bas (réserve sous la grille). Rotation plutôt qu'un second caractère parce que le bloc sûr (Formes géométriques) ne contient PAS de « carré moitié basse noircie » — `⬓` (U+2B13) vit dans le bloc même qui a donné le carré vide de 1.53.1.
  - ⮕ **La FORME porte l'état, pas la couleur** (règle d'accessibilité du projet). Le `title` et l'`aria-label` annoncent en plus ce que le clic PRODUIRA.
  - ⚠ **Trois break-tests de ce lot ont dû être refaits, et le motif se répète** : deux tests cherchaient des chaînes dans la source — un `if (false)` devant l'appel et un libellé déplacé passaient inaperçus. Réécrits en tests FONCTIONNELS sur un faux bouton qui enregistre title/aria-label/classes. Et une cassure a de nouveau atterri sur une autre occurrence (`rotate(-90deg)` figure 4× dans styles.css). ⮕ La boucle de cassure refuse désormais une ancre AMBIGUË (>1 occurrence) au lieu de remplacer la première.
  - Bascule disponible sur iPad (décision Grégoire) — à valider au doigt : à 520 px la palette occupe la moitié d'un iPad Air en paysage.

- [x] **#413 LIVRÉ 7 août 2026 (1.53.4)** 🔴 La course `db-ready` sautait TOUTES les migrations au boot — cause réelle du « #367 non migré » constaté par Grégoire.
  - **Symptôme** : `migration_planification_seances_done` à `false` et 38 entrées dans la clé nue, des heures après le déploiement, avec un `main.js` À JOUR (build vérifié en console : 0807-1413). Ma première hypothèse (cache-busting périmé) était FAUSSE — vérification du build embarqué à l'appui.
  - **Cause** : le bloc de migrations de `main.js` ne s'abonnait qu'à `db-ready`, depuis `DOMContentLoaded`. `db.syncToLocalStorageCache()` émet cet événement dès la fin de la synchro IDB — qui peut se terminer AVANT la pose de l'écouteur. L'événement déjà passé, l'écouteur ne se déclenche jamais : toutes les migrations du bloc sautées, EN SILENCE, indéfiniment. ⚠ Résultat dépendant de la VITESSE de la machine — même version migre chez l'un, pas chez l'autre.
  - `codex.js` connaissait le piège (`if (window.dbReady) … else addEventListener`) ; `main.js` ne testait `window.dbReady` NULLE PART.
  - **Correctif** : handler NOMMÉ `auDbReady` + écouteur posé + rattrapage immédiat si `window.dbReady`. Les migrations du bloc sont idempotentes (drapeaux) donc le double passage est sans effet — et la sentinelle vérifie ce point pour CHAQUE drapeau du bloc.
  - Le `?v=` de `main.js` (et de 6 autres fichiers touchés aujourd'hui) était bel et bien périmé AUSSI — corrigé au passage, avec sa propre sentinelle (la date du `?v=` doit égaler celle du build embarqué `_SCRIPT_BUILD_main`).
  - ⚠ **RESTE OUVERT → #414** : 14 autres écouteurs `db-ready` dans 10 fichiers, tous exposés à la même course. Audit à faire — lesquels portent du travail critique ?

- [x] **#414 LIVRÉ 8 août 2026 (1.55.0)** Les 14 autres écouteurs `db-ready` — audit, portillon unique, cliquet.
  - ⚠ **L'audit a trouvé plus que la course attendue : TROIS familles de défauts**, dont deux qu'une relecture site par site ne pouvait pas voir, faute de point de comparaison.
    1. **La course de #413** — écouteur posé après l'émission (`pratiques.js`, `accueil.js`, `travaux-outils.js` raccourcis). ⚠ Les deux premiers sont posés **depuis `main.js`, à l'instant EXACT** où l'écouteur de #413 se posait trop tard : la course y était identique, pas théorique.
    2. **La mauvaise cible** — `document.addEventListener('db-ready', …)` alors que `db.js` émet sur `window`, et l'a **toujours** fait (vérifié sur l'historique complet, clone désuperficialisé). Écouteurs **mort-nés**, jamais une régression. ⮕ `migrerPreferencesV3` (`preferences.js`, **depuis le 16 avril 2026**) et `initialiserDonneesV2` (`donnees-v2.js`, **depuis le 18 décembre 2025**) n'ont **JAMAIS tourné**, sans une seule erreur en console. Aucun autre appelant : aucun chemin d'exécution.
    3. **Le mauvais drapeau** — `db.ready` est vrai dès la fin d'`init()`, donc **avant** `syncToLocalStorageCache()` : une migration qui s'y fie lit un `memoryCache` non hydraté, migre des données incomplètes et **pose son drapeau « fait »**. Touchait `migrerIdsActionsRLO` et `migrerActionsRLOEvaluations`. Et **`db.isReady` n'a jamais existé** (3 usages) — garde toujours fausse.
  - **Conséquence de #414 sur `obtenirPreference`** : elle lit UNIQUEMENT le magasin V3, **sans repli sur le legacy**. La migration morte signifie donc que toute préférence restée dans `modalitesEvaluation`/`preferencesAffichage` était ignorée au profit de `DEFAUTS`. ⮕ **Porte terrain** : au premier démarrage de 1.55.0, des réglages d'avant le 16 avril peuvent **réapparaître** (dont `modeClair`, `modeExpert`, `activerRai`, `grilleReferenceDepistage`). C'est la migration qui fait enfin son travail, mais ça se voit — à valider.
  - **Réveil audité avant branchement** (règle « code dormant » du CLAUDE.md) : `migrerPreferencesV3` purge le legacy via `nettoyerLegacy()`. Vérifié — `preferencesAffichage` a **zéro lecteur** ailleurs ; les 5 champs retirés de `modalitesEvaluation` n'ont **aucune lecture qualifiée** (les occurrences trouvées visent `modalites.portfolio.decouplerPN`, champ imbriqué distinct). La migration n'écrase jamais une valeur déjà en V3 (`if (entree.cible in prefs) continue`), et l'ordre est fail-safe (échec d'écriture ⇒ `nettoyerLegacy` non atteint).
  - **Correctif de fond : un portillon unique `window.auDbPret(rappel, {once})` dans `db.js`.** Le geste était réécrit à la main en **neuf exemplaires** — c'est ça, la cause : neuf occasions de se tromper, aucune de comparer. Les **12 sites** passent désormais par lui, y compris les 4 qui étaient déjà corrects et `main.js` lui-même (zéro-dette : pas de variante manuelle à côté du portillon).
  - **Hors écouteurs, même famille** : `travaux-outils.js` gardait par `db.ready` une **écriture** (`db.setSync('raccourcisAnnotation', defauts)`) dont le commentaire disait « ne persister que si IDB a fini de charger ». Sur le créneau init()→synchro, elle **écrasait les raccourcis personnalisés par les défauts**. Passé à `window.dbReady`.
  - **Retiré, pas réparé** : l'écouteur mort de `spe-specifications.js` — `creerGabaritsSPE` lit par `await db.get()`, qui retombe sur IndexedDB, donc la lecture « existe déjà ? » est autoritaire même avant la synchro. Rien à gagner à attendre `db-ready` ; le brancher n'aurait ajouté qu'un 4e déclencheur à une fonction déjà idempotente.
  - **Sentinelle `tests/unit/sentinelle-db-ready-portillon-414.test.js` (14 cas)** — délibérément **comportementale** : elle instancie la vraie source du portillon et l'exerce (rattrapage, `once`, abonnement conservé), au lieu de constater que le code est écrit. Plus un **cliquet** statique : aucun écouteur `db-ready` brut hors `db.js`, aucune cible `document`, aucune garde `db.isReady`, aucune écriture gardée par `db.ready`. **11 break-tests ROUGE.**
  - ⮕ **Reste ouvert → #418** (le trou du mode localStorage-seul, ci-dessous) : le portillon étant maintenant universel, ce trou l'est aussi.

- [x] **#415 LIVRÉ 7 août 2026 (1.54.0)** L'enseignement explicite entre dans la carte + titres de palette — décisions Grégoire du 7 août (5 nœuds, frères d'Activité, suppression franche).
  - **Cinq types neufs** (`ouverture`, `modelisation`, `pratique-guidee`, `pratique-autonome`, `cloture`), FRÈRES D'ACTIVITÉ : le contrat est défini par **TYPES_ACTIVITE seule** — les six triplets `activite/soutien/revision` en dur ont été rabattus dessus (zéro-dette), et la sentinelle interdit leur retour. Durée saisissable (comme toute la fratrie désormais — elle était réservée au type `activite` strict), servent les objectifs (#403), `normaliserType` → verbes de liens. ⚠ PAS de niveau cognitif : il qualifie la tâche, pas l'étape de méthode (exclusion délibérée, commentée sur TYPES_AVEC_NIVEAU_COGNITIF).
  - **Couleurs** : famille cyan→sarcelle (#22d3ee → #155e75), seule libre parmi les nœuds ; le dégradé clair→foncé suit le transfert de responsabilité (je fais → nous faisons → tu fais).
  - **Ablation complète côté Plan de la leçon** : case à cocher, 5 blocs d'étapes, notes et assignations d'activités, drag & drop, branches d'export TXT/MD (la branche « activités brutes » reste), 35 règles CSS org-ee, et la case du panneau flottant mort. Le « Cœur de la leçon » (rétroaction/production par activité) est CONSERVÉ — c'était la moitié non-EE du même bloc. Champs `etapes`/`enseignementExplicite` des notes existantes : morts mais bénins (données de test, décision « suppression franche »).
  - **Titres de palette** : la description devient le titre (Intention curriculaire · Types de connaissances · Mise en action · Preuve de réussite · Organisation), sous-titres retirés, guide d'aide recalé (il disait encore « Apprentissage », un libellé disparu).
  - Sentinelle `tests/unit/sentinelle-enseignement-explicite.test.js` (15 cas), 6 break-tests. Une sentinelle de 1.33.0 INVERSÉE avec justification datée : elle exigeait la présence d'org-ee-notes (protection contre un retrait accidentel) ; le retrait est désormais décidé, toute réapparition serait la régression.

- [x] **#416 LIVRÉ 12 août 2026 (1.76.0 → 1.78.0)** Exports du plan de la leçon PRÉSENTABLES — créé 7 août 2026 (demande Grégoire), clos en sept lots.
  - **CE QUI A ÉTÉ LIVRÉ, lot par lot** :
    - **A** — `metadata.rangSeance` sur les leçons, sélecteur dans l'en-tête du bloc. Rang ENTIER, lettre à l'affichage (D1). Leçons seulement : une séquence n'a pas de rang DANS une semaine.
    - **C** — la date DÉRIVÉE de la semaine + du rang + de l'horaire du groupe, jamais stockée. ⚠ Deux découvertes au code : la chaîne d'horaire IGNORAIT son argument (elle lisait le groupe ACTIF), et sa « lecture » ÉCRIVAIT quand le cache manquait. D'où `obtenirSeancesCompletesDuGroupe`, en lecture stricte.
    - **G** — UN catalogue de colonnes, UN rendeur tabulaire ; deux rendeurs TSV fondus en un. Le préfixe fixe « Séquence | Leçon | Semaine » est LIBÉRÉ (D8). Troisième axe : la GRANULARITÉ (ligne par élément / par séance).
    - **I** — gabarit générique « Calendrier » : Semaine · Séance · Date · Contenu · Évaluations · Travail personnel, une ligne par rencontre.
    - **H** — gabarits NOMMÉS, avec migration du réglage unique de #431. « Personnalisé » disparaît en tant que niveau : zéro-dette, pas d'alias.
    - **B** — `metadata.horsClasse` : le travail personnel SORT du Σ des leçons. Deux gardes (la durée part avec la case ; le rollup ignore de toute façon les nœuds marqués).
    - **E** — les repères de séance peuvent enfin quitter les titres, ce que #410/#411 avaient dû reporter.
  - **PREUVE** : golden master bit-à-bit des 11 sorties génériques, posé AVANT le refactor et figé sur le code d'AVANT. Sept bancs de cassure, **85 cassures / 85 ROUGE**. Vitest 2367/2367.
  - ⚠ **DEUX DÉFAUTS TROUVÉS PAR LA PORTE TERRAIN, PAS PAR LES TESTS** — et c'est le fait marquant du chantier :
    1. la case « Travail hors classe » se cochait **sans rien déclencher** : dans `ouvrirPanneau`, chaque `extra.innerHTML +=` re-sérialise le conteneur et DÉTRUIT les écouteurs posés avant. **Troisième occurrence de ce défaut dans ce fichier.** Les tests vérifiaient la porte d'écriture, qui était juste ; personne ne vérifiait le FIL entre la case et cette porte. ⮕ `sentinelle-ordre-listeners-panneau` ferme la classe entière, pour les quinze blocs du panneau.
    2. les colonnes qui AGRÈGENT étaient cochables sur un gabarit « ligne par élément », où elles sortent vides par conception. Le code le disait, l'écran non.
  - ⚠ **Le tableau Markdown du lot I a été RETIRÉ le jour même**, sur verdict terrain : coller du Markdown dans Pages ne produit pas un tableau, quel que soit l'alignement des barres. Le Calendrier sort en SECTIONS ; pour un vrai tableau, il y a le TSV.
  - **Décisions arbitrées par Grégoire le 12 août** : D1 (rang entier) · D3 (aucune durée hors classe) · D5 RENVERSÉE (« Calendrier » = gabarit, pas niveau) · D7 (gabarits nommés) · D8 (préfixe libéré) · D9 (le groupe est un paramètre d'export) · un gabarit ne produit QUE des tableaux · « d'usine » → « générique ».
  - **Portes terrain** : `PORTES-TERRAIN-2026-08-12-416-lotA.md` (12/12 closes) et `PORTES-TERRAIN-2026-08-12-416-lots-CGIHB.md` (29 passées, 2 échecs corrigés, 5 rangées à reprendre).
  - **Le besoin, dans ses mots** : « ce que l'on exporte est présentable à des collègues et aux étudiants eux-mêmes » — réutilisable directement dans le plan de cours de l'enseignant. C'est une des raisons d'être du chantier alignement.
  - **Trois formats demandés** : (1) **CSV** pour tableur ; (2) **colonnes/rangées pour traitement de texte** (tableau collable dans Word/Pages — HTML presse-papiers ou RTF, à trancher) ; (3) **texte simple**.
  - ~~📐 **À préciser avant de coder**~~ : **LES TROIS QUESTIONS SONT CLOSES le 8 août au soir** par l'arbitrage D1-D6 (§3bis de `AUDIT-carte-alignement-exports-productions-2026-08-08.md`) :
    1. *Où vit l'export* → dans la **Carte d'alignement**, porté AVANT la suppression du « Plan de la leçon » (D3).
    2. *Frontière avec l'existant* → **consolidation, pas empilement** : les **six** générateurs (et non deux — Texte, TSV, TXT×2 audiences, MD×2) fondent en **un seul**, la profondeur passant en paramètre (D5).
    3. *Périmètre « présentable »* → il **se règle par le niveau**, pas par un réglage séparé : niveau **Sommaire** = ce qui se colle dans un plan de cours ; **Déroulement** = l'usage en classe ; **Alignement** = la preuve (D4).
  - ⮕ Les **trois formats** demandés (CSV, tableau collable, texte) deviennent le **second axe** de D5, orthogonal à la profondeur — un format n'est qu'une mise en forme finale, pas un générateur de plus.
  - ⚠ Depuis 1.54.0 les étapes EE sont des NŒUDS : l'export les traverse naturellement avec les activités — le retrait de l'UI d'étapes n'enlève rien au contenu exportable.

- [x] **#417 LIVRÉ 8 août 2026 (1.55.0)** `release.mjs` bumpe désormais lui-même le `?v=` de ce qu'il embarque.
  - **Devenu bloquant pour #414** : ce chantier modifiait 12 fichiers JS. Sans bump, un navigateur en cache aurait servi les anciens — le correctif aurait été **livré et inerte**, exactement le mécanisme de #367. Le défaut a été confirmé par la sentinelle de cache-busting, passée AU ROUGE dès la release (`?v=` de `main.js` figé au 0807 pendant que le build passait au 0808).
  - **Constat chiffré à la correction** : `init-inline.js` était resté à `?v=20260629a` — **29 juin**, après plus de vingt réécritures par le script.
  - **Correctif conforme à la consigne — dans `release.mjs`, pas à la main.** Le script bumpe (a) les fichiers qu'il réécrit (`init-inline.js`, `main.js`) et (b) **tout fichier JS modifié non commité** (`git status`), c'est-à-dire ce que la release embarque réellement. Sans (b), le défaut se serait simplement déplacé au fichier suivant : un chantier de douze modules en aurait livré dix sous leur ancienne URL. Format `AAAAMMJJ` + suffixe bijectif base-26 qui **s'incrémente si la date ne change pas** — deux releases le même jour doivent produire deux URL différentes, et c'est justement les jours de correctif qu'on livre plusieurs fois. Repli explicite si git est indisponible (avertissement, pas d'échec de release).
  - **Précision volontaire** : un module INTOUCHÉ garde son `?v=`. Bumper tout à chaque release reviendrait à supprimer le cache ; c'est cette précision qui rend le geste tenable dans la durée.
  - **Deux sentinelles** : `sentinelle-cache-busting-main.test.js` étendue à `init-inline.js` (la date du `?v=` doit égaler son `BUILD_ID`) et `sentinelle-release-bump-cache-417.test.js` (6 cas) qui **exécute réellement `release.mjs` sur un dépôt git jetable** — seul moyen de couvrir les modules ordinaires, qui n'embarquent aucun build auquel se comparer. **7 break-tests ROUGE** (dont la suppression pure de l'écriture d'index.html, le défaut d'origine).
  - ▣ **Trou assumé et documenté** : un break-test (« le `?v=` d'un module ordinaire retombe d'un jour ») est resté VERT sur la sentinelle statique — elle ne sait vérifier que `main.js` et `init-inline.js`. C'est ce vert honnête qui a motivé la seconde sentinelle, celle qui exerce le script.

- [x] **#419 LIVRÉ 8 août 2026 (1.55.1)** ⚠ La migration des préférences V3 effaçait du legacy qu'elle n'avait jamais lu — trouvé sur les données réelles de Grégoire, moins d'une heure après la livraison de #414.
  - **Comment c'est sorti** : #414 a réveillé `migrerPreferencesV3`, morte depuis avril. Le dump de Grégoire montrait alors `grilleReferenceDepistage: ''` — et ses vraies valeurs (`GRILLE1759529438501`) intactes dans `a2024/a2025/h2026_modalitesEvaluation`. ⮕ **Rien n'a été perdu chez lui**, mais seulement par hasard (voir ci-dessous).
  - **Défaut 1 — l'asymétrie lecture/purge, le plus grave.** `modalitesEvaluation` est **namespacée par trimestre** (`CLES_NAMESPACEES`). La migration lisait la clé **BRUTE** `modalitesEvaluation` via `safeGet()` — qui n'existe pas, donc elle ne voyait **jamais rien à migrer** — pendant que `nettoyerLegacy()` purgeait, lui, à travers le **module propriétaire**, c'est-à-dire la clé **namespacée du trimestre actif**. Une migration qui efface une clé qu'elle n'a jamais lue. ⮕ Grégoire n'a été épargné que parce que son trimestre actif (A2026) n'a **aucune** clé `modalitesEvaluation` : la purge n'a rien trouvé. Chez un testeur dont le trimestre actif porte ces 5 champs, ils étaient supprimés sans jamais atteindre le magasin V3. **Correctif** : lecture par le même chemin que la purge (module propriétaire), repli sur la clé brute si le module n'est pas chargé.
  - **Défaut 2 — un espace réservé vide comptait comme « déjà migré ».** `if (entree.cible in prefs) continue` sautait la copie dès que la clé EXISTAIT côté V3, même vide. Puis la source était purgée : valeur écartée, puis effacée. ⮕ **Correctif** : `''`, `null` et `undefined` sont traités comme ABSENTS. ⚠ **Pas par un test de véracité** — ça aurait écrasé tous les `false` et `0` délibérés, l'erreur symétrique et plus coûteuse. Test explicite des trois valeurs, et une sentinelle dédiée à ce piège-là.
  - **Défaut 3 — la purge devançait la mise à l'abri.** `nettoyerLegacy()` tourne à CHAQUE démarrage, longtemps après que le drapeau est posé, et purge le trimestre **actif**. Un changement de trimestre des mois plus tard faisait donc supprimer les 5 champs de ce trimestre-là alors que la migration, déjà marquée « faite », ne repasserait jamais les recueillir. ⮕ **Correctif** : on ne purge un champ que si le magasin V3 en porte une VRAIE valeur. Même règle pour la clé `preferencesAffichage` entière. « Une clé legacy qui traîne coûte quelques octets, une préférence effacée ne se retrouve pas. »
  - **Zéro-dette au passage** : `CHAMPS_LEGACY_MODALITES` était une seconde liste en dur, recopiée à côté de `MIGRATION_MAP` — elle est désormais **dérivée** de la carte. Deux listes pouvaient diverger et faire purger un champ que la migration ne recueille pas.
  - **Sentinelle `tests/unit/sentinelle-migration-prefs-v3-419.test.js` (10 cas), comportementale.** ⚠ Son laboratoire modélise le **namespacing** : la donnée n'existe que sous `a2026_modalitesEvaluation`, jamais sous la clé brute. Un laboratoire qui l'aurait exposée sous les deux clés aurait rendu l'asymétrie **invisible** — vert sans rien prouver. **5 break-tests ROUGE**, dont le retour du test de véracité naïf.

- [x] **#418 LIVRÉ 18 août 2026 (1.87.5)** ⚠ `db-ready` n'est **jamais émis** quand IndexedDB est indisponible — toutes les migrations du boot sont sautées — créé 8 août 2026 (trouvé à l'audit #414).
  - ✅ **CORRECTIF** : branche `else` au boot de `db.js` — le correctif pressenti ci-dessous, appliqué tel quel (la prise de l'item par Grégoire le 18 août vaut validation). En mode localStorage-seul, `window.dbReady` est posé PUIS `db-ready` émis (`detail.modeLocalStorageSeul`), dans l'ordre #414 (drapeau avant événement). Le mode IndexedDB garde son émission unique via `syncToLocalStorageCache`.
  - ✅ Sentinelle `tests/unit/sentinelle-418-db-ready-sans-idb.test.js` (4 essais) — **comportementale** : elle exécute le vrai boot de `db.js` dans un sandbox SANS indexedDB (Node n'en a pas), exactement le mode en défaut, et vérifie le contrat utilisateur (un rappel `auDbPret` part, avant l'émission comme au rattrapage). Break-test : branche retirée ⇒ 4 rouges.
  - ⏳ Non éprouvé sur un VRAI Safari en navigation privée — le banc reproduit le mode, pas le navigateur.
  - **Le mécanisme** : `db.init().then(…)` n'appelle `syncToLocalStorageCache()` que `if (db.useIndexedDB)` (`db.js:1582`). Or `window.dbReady = true` et l'émission de `db-ready` vivent **uniquement** dans cette fonction (deux sites, lignes 980 et 990). Si `_detectIndexedDB()` échoue ou si l'ouverture d'IDB erre (`db.js:149/156` posent `useIndexedDB = false`), le drapeau n'est jamais posé et l'événement jamais émis.
  - **Conséquence** : en mode localStorage-seul, **aucun rappel `auDbPret` ne part jamais** — donc aucune migration du boot, aucune initialisation qui en dépend. Silencieux, sans limite de durée. C'est le même symptôme que #413/#414 avec un déclencheur différent.
  - ⚠ **Le portillon de #414 rend ce trou UNIFORME** : tout passe désormais par un point unique, ce qui est un gain quand il fonctionne et un point de défaillance unique quand il ne s'arme pas. Rien n'est aggravé (le défaut préexiste), mais il devient le dernier chemin par lequel une migration peut disparaître en silence.
  - **Qui est touché** : pas Grégoire (IDB actif), mais tout testeur en navigation privée Safari ou dont l'IDB est bloqué.
  - ⮕ **Correctif pressenti** (à valider par Grégoire — ça change la sémantique du boot pour une classe d'utilisateurs) : en mode localStorage-seul les données SONT lisibles dès la fin d'`init()`, donc y poser `window.dbReady` et émettre `db-ready` est sémantiquement juste. Fix isolé, à livrer avec sa sentinelle plutôt qu'en fin de gros chantier.

- [ ] **#417-bis (trace)** `js/_archives/entites-ui.js` — fichier **non chargé** par `index.html` (vérifié), mais il porte un écouteur `db-ready` et un « rattrapage » qui **réémet l'événement global** (`window.dispatchEvent(new CustomEvent('db-ready'))`) : s'il était rebranché un jour, il déclencherait TOUS les autres rappels. Laissé tel quel (déjà en quarantaine dans `_archives/`, exclu du cliquet de #414 pour cette raison) — à supprimer lors d'une passe de ménage, pas dans un chantier de correctifs.
  - **Le constat** : `scripts/release.mjs` réécrit `VERSION_MAJEURE`, `BUILD_ID` et `_SCRIPT_BUILD` dans `js/init-inline.js` à chaque release, mais ne touche PAS son paramètre anti-cache dans `index.html` — resté à `?v=20260629a` (29 juin) alors que le fichier a changé 20+ fois depuis.
  - ⚠ **Même classe de défaut que l'incident #367** (main.js servi en cache, migration jamais exécutée), un fichier plus loin. La gravité est MOINDRE : `init-inline.js` ne porte pas de migration, seulement les **fallbacks de version**. Mais ces fallbacks sont précisément ce qui s'affiche quand `version.json` n'est pas lisible — c'est-à-dire **en `file://`, le mode d'usage réel de Grégoire** (CORS y bloque la lecture de version.json). Un `init-inline.js` en cache y affiche donc un numéro de version périmé.
  - ⮕ **Le vrai correctif n'est pas de bumper à la main** : c'est que `release.mjs` bumpe LUI-MÊME le `?v=` des fichiers qu'il réécrit. Sinon la désynchronisation reviendra à la prochaine release, comme elle est revenue ici.
  - ⮕ Sentinelle à étendre : `tests/unit/sentinelle-cache-busting-main.test.js` verrouille aujourd'hui `main.js` SEUL (portée délibérée : c'est lui qui porte les migrations). L'étendre à `init-inline.js` une fois `release.mjs` corrigé.

- [x] **#420 LIVRÉ 8 août 2026 (1.56.0)** Simplification du module Alignement : la redondance entre le planificateur et la carte est retirée — constat Grégoire, deux captures à l'appui.
  - **Le constat** : cliquer un élément du planificateur remplaçait le canevas par une « vue leçon » en lecture seule, qui affichait le même objectif et les mêmes activités que la carte, mais SANS les liens, SANS le sélecteur de semaine, et sans possibilité d'écrire. Elle rendait **strictement moins** que ce qu'elle recouvrait. Un bandeau y affichait toujours le même titre de séquence, quel que soit l'élément cliqué (cause : le fil d'Ariane lisait `sequenceActiveId` et non le parent de la leçon) — bug jamais corrigé, **rendu sans objet par la suppression**.
  - ⚠ **CE QUE L'AUDIT A TROUVÉ ET QUE LA CAPTURE NE MONTRAIT PAS** : le canevas portait **deux** états d'affichage commandés par la MÊME variable — la vue focalisée (filtrage) et la vue globale **compacte** (chaque séquence réduite à un bloc résumé, ses leçons masquées). Retirer le filtrage seul aurait laissé Grégoire en permanence devant des blocs résumés, **sans aucun moyen de les ouvrir** : la vue même qu'il envoyait comme preuve aurait disparu. Décision prise en connaissance de cause : les deux partent ensemble, le canevas montre tout, tout le temps.
  - ⮕ **Règle qui s'en dégage** : quand deux mécanismes se sont appelés l'un l'autre assez longtemps, retirer le premier ne libère pas le second — il le laisse ORPHELIN et actif. **Chercher le compagnon fait partie de l'ablation**, pas du nettoyage d'après.
  - **Décisions Grégoire** : filtrage retiré (cadrer, ne plus masquer) ✔ · compaction retirée avec lui ✔ · clic sur une leçon = centrer + sélectionner ✔ · le bouton de barre d'outils REMPLACE le repli des palettes ✔ · symétrie « Nœuds » + « Planificateur » ✔.
  - ⚠ **SAUVETAGE DE DONNÉES** : le champ « Objectif » de la vue supprimée LISAIT `metadata.objectifs` (la liste) mais RÉÉCRIVAIT `metadata.objectif` (la chaîne, format mort). La migration sautant toute leçon déjà pourvue d'une liste, **ce qui y était saisi n'était plus jamais relu**. Retirer le champ sans récupérer d'abord aurait figé la perte. `migrerObjectifsVersMetadata()` récupère désormais ces textes AVANT son saut d'idempotence, en redécoupant sur les sauts de ligne et en écartant les doublons (le champ rendait tous les objectifs dans une seule zone et réécrivait le bloc entier).
  - **Retiré** : `rendreVueLecon` · `ouvrirLecon` · `leconActiveId` · `ouvrirSequence` · `sequenceActiveId` · `_collecterDescendants` · les Sets `visibles`/`masques` de `reconstruireDOM` · le bloc compact et ses 4 règles CSS · `#planif-vue-lecon` et ses 25 règles CSS · les 2 boutons de repli et leurs 6 règles CSS. **Ajouté** : `cadrerSurSequence`, le registre `PALETTES_FLOTTANTES` et 2 préférences. Net : **−83 lignes**.
  - **Sentinelle** : `tests/unit/sentinelle-ablation-vue-lecon-filtrage.test.js` (22 cas), break-testée en 3 passes. ⚠ **2 faux-verts attrapés au premier break** : les deux assertions centrales lisaient la SOURCE (« naviguerSommaireLecon appelle-t-il naviguerVers ? ») et restaient vertes quand l'appel était mis **en commentaire** — le texte cherché survivait dans le commentaire. Réécrites en tests de COMPORTEMENT (module monté, sélection observée). Une 3e passe a montré qu'assertion sur `etat.selection` seule ne couvrait pas `deselectionnerTout()` : une multi-sélection survivait au clic. Assertion étendue à `multiSelection`.
  - ⮕ **Reste ouvert (non demandé, signalé)** : le panneau « Organisateur » mort et le double nommage « Organisateur / Plan de la leçon » — déjà en file au §3 de SESSION.md, délibérément NON emportés par ce chantier.
  - ⮕ **Porte terrain** : passe iPad sur les deux boutons de palette (cible 32 px + `@media (hover:none)`), et vérification que le canevas entièrement déplié reste navigable sur une grosse carte (zoom, ⌘1, planificateur).

- [x] **#422 LIVRÉ 8 août 2026 (1.56.0)** Le graphe accueille l'enseignement — correctif #415 + nœud « Exposé ».
  - ⚠ **BUG TROUVÉ EN CHEMIN, et il rendait #415 décoratif** : les cinq nœuds d'enseignement explicite livrés le 7 août avaient **zéro paire** dans `VERBES_AUTO`. `VERBES_HORIZONTAUX` n'ayant pas de `connaissance>activite`, `resoudreVerbe` rendait `null` — c'est-à-dire le toast « Ce lien n'est pas possible ». **Aucune connaissance ne pouvait être reliée à une Modélisation**, ni aucune de ces étapes à une évaluation. Ils avaient une couleur, une durée, une place dans la leçon, et aucune relation.
  - ⮕ **Correctif = repli sur la FAMILLE** (3 lignes dans `resoudreVerbe`), pas les ~50 paires écrites à la main : ce serait l'empilement, et il faudrait recommencer au type suivant. `conceptuelle>modelisation` retombe sur `conceptuelle>activite`. ⚠ C'est un SECOURS : la correspondance brute est consultée d'abord et gagne toujours.
  - **Nœud « Exposé »** (décision Grégoire) : il manquait un nœud pour dire « j'enseigne ». La famille était tournée vers l'ÉLÈVE qui agit, et l'enseignant n'apparaissait qu'à l'intérieur d'UNE méthode. **Complément** des cinq nœuds d'EE, pas leur substitut. Hérite durée, rollup, objectifs servis et verbes sans une paire écrite. Famille « Mise en action » → « **Déroulement** ».
  - ⮕ **Réserve instruite puis écartée** : un texte externe affirmait que l'enseignement du déclaratif se fait « souvent » en amorce de leçon, donc que l'Exposé ferait doublon avec Ouverture. Sur-lecture (« souvent » ≠ « toujours »), corrigée par Grégoire : ça se fait à tout moment. **Ne pas rouvrir.**
  - **Sentinelle** 16 cas, 13 break-tests. ⚠ **Faux-vert tenace** : « les paires brutes gardent leur verbe » est restée verte quand le repli passait DEVANT le brut — dans la table actuelle chaque paire brute porte le même verbe que son équivalent de famille, donc l'ordre est inobservable. Corrigé en injectant un verbe distinctif… et la 1re tentative était encore fausse (`soutien>evaluation` : `normaliserType('evaluation')` rend `evaluation`, clé identique). Il fallait une CIBLE de la famille d'activité (`factuelle>soutien`).

- [x] **#423 LIVRÉ 8 août 2026 (1.56.0)** La durée se saisit et se totalise sur la carte.
  - Champ de durée dans l'**en-tête du nœud** (10 types : les 9 de `TYPES_AVEC_DUREE` + évaluation), **toujours visible** (décision Grégoire, cohérente avec F1). Compteur **Σ** dans l'en-tête des leçons et séquences, rafraîchi en direct en remontant activité → leçon → séquence.
  - ⚠ **`TYPES_AVEC_DUREE` est SÉPARÉE de `TYPES_ACTIVITE`** : cette dernière pilote `normaliserType`, donc les verbes de liens. Y glisser `evaluation` aurait changé en silence les verbes entre nœuds. Un prédicat par question.
  - ⚠ **Les connaissances n'ont PAS de durée** (décision Grégoire) : double comptage dans le rollup, et `propagerModification` recopiant la metadata entière, une connaissance clonée dans 3 leçons partagerait UNE durée. ⮕ **Règle : une minute de classe appartient à exactement un nœud.**
  - **Retiré de l'Inspecteur** : « Durée estimée » + « Durée (somme des activités) » et leur CSS. L'étendue dérivée de la séquence RESTE (elle dit QUAND, pas COMBIEN DE TEMPS).
  - ⚠ **Sécurité** : `sentinelle-inspecteur-duree-coercition` visait `#planif-duree-min`, disparu — elle serait devenue vraie pour rien pendant que le risque déménageait. **Réorientée et passée au comportement** (valeur empoisonnée rendue, on regarde ce qui sort). ⮕ *Un invariant de sécurité voyage avec le champ qu'il protège.*
  - **2 sentinelles, 26 cas, 17 break-tests.** Deux faux-verts attrapés : (1) « la remontée touche tous les ancêtres » testait `dureeRollupNoeud`, qui récurse tout seul et préexistait — on testait le calcul en croyant tester le rafraîchissement ; (2) « cible tactile iPad » se satisfaisait d'un AUTRE bloc `@media (hover: none)` du fichier.
  - ⮕ **Porte terrain** : saisie de durée au doigt sur iPad, et lisibilité de l'en-tête sur un nœud étroit (le lot « largeur » n'est pas fait).

- [ ] **#508** ⏳ **ÉCHÉANCE : 1er SEPTEMBRE 2026** — l'avis d'identification sur la page d'accueil.
  ✅ **ARBITRÉ PAR GRÉGOIRE le 28 août 2026 au soir — option A : IL TIENT LA DATE.**
  ⚠ **CETTE DÉCISION A FAILLI N'ÊTRE CONSIGNÉE NULLE PART.** C'était la seule des vingt et un
  arbitrages à porter une échéance, et aucune des trois sessions ne l'avait inscrite : chacune a
  supposé qu'une autre s'en chargeait, parce que « le fond était déjà décidé ». ⮕ **L'élément le plus
  urgent est celui que personne ne prend.** Trouvé en vérifiant le compte, pas en s'en souvenant.
  ⮕ **Sa note** : « *Je crois que l'avis dans 508 a déjà été fait par Cowork. C'est en ligne en tout
  cas à deux endroits : sur la page d'accueil comme telle et dans une fenêtre.* »
  ✅ **VÉRIFIÉ le 28 août — sa prémisse est juste** : l'avis est bien en ligne aux deux endroits,
  `js/accueil.js` (le paragraphe d'accueil) et `js/transitions.js` (le bandeau daté).
  ⮕ **ET LE BANDEAU S'ÉTEINT SEUL LE 1er SEPTEMBRE** (`transitions.js`, condition de date) : il n'y a
  **rien à retirer manuellement POUR L'UTILISATEUR**. Le commentaire du code dit la suite : « #508 prend
  le relais avec un paragraphe d'accueil rédigé au présent ».
  ⚠⚠ **MAIS LE DÉPÔT, LUI, A TROIS GESTES À FAIRE — mesuré le 30 août 2026, et cette ligne disait le
  contraire jusque-là.** « Rien à retirer » était vrai de l'écran et faux du code : l'entrée
  `avis-identification-2026-09-01` survit à sa propre condition, et **sa spec rougit toute seule le
  1er septembre**, c'est-à-dire pendant la release du jour même. Détail complet au **§8 bis** de
  `plans de travail/REFERMAGE-2026-09-01-cloudflare-access.md`.
  ⏳ **CE QUI RESTE À FAIRE LE 1er SEPTEMBRE — TROIS GESTES, ET DANS LES DEUX BRANCHES** :
  · réécrire le paragraphe d'accueil **au présent** (`js/accueil.js:84`) — il est aujourd'hui au futur ;
    si le refermage n'a PAS eu lieu, le retirer purement et simplement (les deux textes sont au §8) ;
  · **retirer l'entrée `avis-identification-2026-09-01`** de `js/transitions.js` (sa condition rend
    `false` dès minuit : elle ne s'affichera plus jamais, mais son texte annonce encore au futur une
    identification déjà en place ou reportée) et mettre à jour le commentaire de tête de
    `js/accueil.js` (lignes 53-61) qui la décrit ;
  · **retirer la spec `tests/integration/avis-identification-bandeau-508.spec.js`** avec elle. Sa
    partie 3 s'exécute sous l'horloge RÉELLE — la substitution de `Date` est défaite dans le `finally`
    juste avant — et `evaluerTransitions()` (`transitions.js:254`) filtre sur `t.condition()`. L'avis
    étant la seule entrée sans champ `sections`, aucune autre ne peut le remplacer sur l'accueil :
    `transition-bandeau` sera absent et la spec tombe à la PREMIÈRE de ses huit assertions d'affichage.
    ⚠ Ne PAS la « réparer » en y simulant la date — elle testerait une entrée qui n'existe plus.
    ✅ `tests/integration/transitions-ciblage-section.spec.js` est immunisée (elle neutralise l'avis par
    sa préférence) : ne pas y toucher.
  · ne PAS prolonger la date sans réécrire le message : « un avis périmé apprend à ne plus lire la zone »
    (avertissement déjà dans `transitions.js`).
  ✅ **DÉBLOQUÉ le 26 août** : #427 a désormais une DATE (le 1er septembre) et une fiche opératoire.
  Le paragraphe n'annonce donc plus une contrainte sans dispositif — il annonce une contrainte dont
  la mise en place est planifiée. ⮕ **Les deux textes sont écrits d'avance** au §7 de
  `plans de travail/REFERMAGE-2026-09-01-cloudflare-access.md` : celui du refermage réussi (au
  présent) et celui du report (retrait pur et simple). Le choix se fait le jour même, selon ce qui
  s'est réellement passé — pas avant.
  Créé le 25 août 2026, en posant le nouveau texte de bienvenue demandé par Grégoire. Le dernier
  paragraphe annonce : « À partir du 1er septembre, l'identification sera obligatoire pour utiliser
  l'application. » (`js/accueil.js`, `genererBanniereBienvenue`).
  ⚠ **C'est le SEUL énoncé daté de la page**, et il crée deux dettes à la même date :
  · **Il promet une contrainte qui n'existe pas encore.** Elle dépend de **#427** (refermer l'accès
    public — réactiver Cloudflare Access, OTP par courriel), dont l'échéance est fixée au **1er septembre 2026** et
    dont les décisions sont tranchées depuis le 27 août (policy ouverte, session d'un mois, ADR-008
    et documents alignés). Si le dispositif n'est pas en place le 1er, la page annonce à ses collègues une
    règle que l'application n'applique pas.
  · **Il périme tout seul.** Le 2 septembre, la phrase parle d'un futur passé. Un avis périmé sur une
    page d'accueil coûte plus cher que pas d'avis du tout : il apprend au lecteur à ne plus lire
    cette zone — et c'est la zone où vivent « Par où commencer ? » et l'invitation à la CoP.
  ⮕ **À faire le 1er septembre, dans un sens ou dans l'autre** :
    · #427 livré ⇒ réécrire au présent, en mentionnant la durée **et son renouvellement** : « L'identification est requise pour accéder à Labo Codex. Tu donnes ton courriel, tu reçois un code, et tu n'y repenses plus pendant un mois — après quoi tu redonnes ton courriel et c'est reparti. Rien ne se ferme, et tes données restent sur ton appareil. » ⚠ Ne jamais écrire la durée sans dire ce qui se passe au bout : « l'accès reste ouvert un mois » se lit comme une date de péremption (retour de Grégoire, 27 août) ;
    · #427 non livré ⇒ **retirer le paragraphe** et le reposer quand la date sera tenable. Reporter
      la phrase sans reporter le dispositif serait la seule issue à éviter.
  ⮕ Un seul paragraphe à changer, sans conséquence technique : le coût est de s'en souvenir, pas de
  le faire. C'est pour ça que l'item existe.

- [ ] **#427** ⚠️ Refermer l'accès public — **DATE FIXÉE AU 1er SEPTEMBRE 2026** (décision Grégoire,
  ✅ **ARBITRÉ PAR GRÉGOIRE le 28 août 2026 au soir — option A : IL TIENT LA DATE DU 1er SEPTEMBRE.**
  L'option « repousser » a été posée et écartée. ⮕ Elle restait légitime, **mais elle se prenait le
  28 août, pas le 1er au matin** — c'est le sens de l'arbitrage.
  ⏳ **CE QUI MANQUE N'EST RELEVABLE QUE PAR GRÉGOIRE**, dans la console Cloudflare, et aucune session
  ne peut le mesurer à sa place : les **trois noms**, la **durée de session**, et la règle `Include`
  réellement en place dans la policy dormante.
  ⮕ Le reste est prêt : fiche opératoire (`plans de travail/REFERMAGE-2026-09-01-cloudflare-access.md`),
  ADR-008, `DEPLOY.md`, `PRIVACY.md` et `SECURITY.md` alignés sur la policy ouverte du 27 août.
  ⮕ Voir #508 pour le versant « avis » : le bandeau s'éteint seul, mais le paragraphe d'accueil reste
  à réécrire au présent.
  26 août). ⮕ **FICHE OPÉRATOIRE PRÊTE** : `plans de travail/REFERMAGE-2026-09-01-cloudflare-access.md`
  — gestes Cloudflare, vérifications, annonce, consignation. ⚠ Plus de « liste à remplir » ni de courriel d'invitation nominatif : la policy est ouverte depuis la décision du 27 août.
  ⚠️ **LES DÉCISIONS DU 26 AOÛT ONT ÉTÉ RENVERSÉES LE 27** (décision Grégoire, 27 août). Elles
  reposaient sur trois faits erronés, corrigés depuis. La fiche opératoire a été réécrite en
  conséquence ; ADR-008, `DEPLOY.md` (v1.6), `PRIVACY.md` (v1.2) et `SECURITY.md` sont alignés.
  ✅ **CE QUI EST DÉCIDÉ (27 août)** :
  · **Policy OUVERTE** — `Include → Everyone` + OTP par courriel, **aucune liste blanche**. C'était
    déjà l'état de la fin de l'hiver ; la liste blanche n'a existé qu'en janvier. Grégoire ne cherche
    pas à filtrer l'entrée.
  · **Durée de session : 1 mois** — **changement assumé**, pas une restauration (`DEPLOY.md` §3.2
    documente « 1 semaine, confirmé 22 mai 2026 »).
  · **Motif : savoir QUI utilise l'application**, pour bâtir une liste de personnes joignables
    (développement, bogues, CoP). L'entrée est le moyen, pas la fin.
  · **Quota** — la « sélection » du 26 août tombe avec la saturation qui la fondait. ~20 utilisateurs
    attendus sur 50 sièges. À surveiller au premier export, la porte étant ouverte.
  ❌ **TROIS FAITS ERRONÉS, corrigés le 27 août** :
  · **« Les 50 sièges étaient saturés »** — **faux, ils ne l'ont jamais été.** L'export
    `User_Seats_Log_2026-05-20T20_03_38Z.csv` : **51 identités, mais 4 sièges Access actifs**.
    L'affirmation confondait identités enregistrées et sièges occupés.
  · **« Mesure d'usage non poursuivie »** — **renversé.** Le raisonnement visait le mauvais objet :
    les *journaux* (`Logs → Access`) sont bien purgés à 24 h, mais la **liste des identités**
    (`My Team → Users`) est **persistante et exportable en CSV** — Grégoire l'a déjà fait le 20 mai.
  · **« L'auteur, unique utilisateur actif depuis fin février »** — **faux.** Le même CSV montre
    **15 dernières connexions postérieures au 28 février** (9 mars, 5 avril, 1 mai). Des gens sont
    revenus ; il ne l'a jamais su. C'est exactement l'angle mort que le geste vient combler.
  ⏳ **DÛ PAR GRÉGOIRE avant le 1er** (§3 de la fiche) : les trois noms Cloudflare (team Zero Trust,
  application, policy) pour les `[À COMPLÉTER]` de `DEPLOY.md` §3.1, §3.2 et §3.3 ; la durée de
  session et la règle `Include` **réellement** en place dans la policy dormante ; et l'arbitrage sur
  l'URL Netlify directe. **Personne ne peut les préparer à sa place.**
  ⏳ **LE JOUR MÊME** : la séquence §4 de la fiche. Le sens des vérifications a changé — il ne s'agit
  plus de vérifier qu'on bloque, mais qu'on **laisse passer tout en identifiant**. Une policy dormante
  depuis trois mois peut se réveiller avec la règle `Emails` de janvier et refermer la porte sans
  que rien ne le signale.
  ⚠ **À VÉRIFIER** : `main--codexnumeris-051225.netlify.app` ne semble pas passer par le proxy
  Cloudflare (`DEPLOY.md` §1.2). Si c'est le cas, cette URL contourne Access et laisse entrer sans
  identité — un trou dans la mesure. **Non testé** ; un `curl -I` tranche.
  ⚠ **COMMUNICATIONS AQPC** : des textes du 2 juin décrivent l'application comme « librement
  accessible, sans création de compte ». Leur publication n'est **pas établie** (la note les range
  sous « à coordonner » avec Fanny Joussemet). À vérifier avant le geste.
  Énoncé d'origine :
- [ ] **~~#427~~** Refermer l'accès public — réactiver Cloudflare Access (OTP par courriel) — créé 8 août 2026 (demande Grégoire). ⮕ **ÉCHÉANCE REPORTÉE À SEPTEMBRE 2026** (décision Grégoire, 8 août soir — l'échéance initiale du ~20 août n'est plus visée). Checklist dashboard prête : `plans de travail/Checklist Levée Cloudflare Access .txt`.
  - **Ce que Grégoire veut** : que les utilisateurs passent de nouveau par un **code envoyé par courriel** (OTP), comme au printemps ; retrouver le **contrôle des 50 sièges gratuits** ; et **savoir qui a accès à l'application et qui est vraiment un utilisateur**. Échéance visée : **septembre 2026** (reportée du ~20 août par Grégoire le 8 août au soir).
  - ✔ **Bonne nouvelle : rien à construire.** La configuration est intégralement documentée et le DNS n'a jamais été défait — « Cloudflare Access reste configuré côté DNS / proxy orange ; seule la policy est désactivée. La réactivation est une opération de quelques minutes dans le dashboard Zero Trust » (`DEPLOY.md` §3.6). Procédure : `DEPLOY.md` §3.1→§3.5 (config Access) + §4 (gestion de la liste blanche).
  - ⚠ **C'est une RÉVISION D'ADR, pas un changement de config silencieux.** La décision d'ouverture publique est formalisée dans `docs/adr/008-cloudflare-access.md` (révisé le 2 juin 2026) et reprise dans `DEPLOY.md` v1.4 et `SECURITY.md`. Refermer exige de réviser les trois, avec date effective et raison déclenchante — c'est explicitement demandé par le §3.6.
  - ⚠ **Le motif de Grégoire ne figure PAS dans les 4 conditions de réactivation du §3.6** (risque opérationnel concret · création de la Voûte · bascule institutionnelle · croissance qualitative inattendue). Le sien est autre : **connaître sa base d'utilisateurs à l'entrée d'une phase structurée**. ⮕ Ajouter une 5e condition au §3.6 plutôt que de forcer le motif dans une case existante.
  - ❌ ~~**LES 50 SIÈGES ÉTAIENT DÉJÀ SATURÉS.**~~ *Démenti par Grégoire le 27 août 2026, et par l'export du 20 mai (51 identités, 4 sièges actifs). Le paragraphe ci-dessous est conservé pour la traçabilité.* ADR-008 : « Le quota Cloudflare de 50 utilisateurs est actuellement saturé » (statut au 14 mai 2026), la liste s'étant élargie de ~10 à ~50 personnes entre janvier et mai. ⮕ **Décision à prendre avant de refermer** : repartir d'une liste blanche NEUVE (purge de l'ancienne), reprendre l'ancienne telle quelle (le quota est alors déjà atteint), ou basculer sur une politique « domaine de confiance » (moins granulaire, sans plafond de sièges). L'upgrade payant est la quatrième voie.
  - ⚠ **La liste blanche contrôle l'ENTRÉE, elle ne dit pas l'USAGE.** *Corrigé le 27 août : la conclusion « Access seul n'y répondra pas » est fausse pour la partie identification. Elle vaut pour les journaux, pas pour la page `My Team → Users`, qui est persistante et exportable.* Deux faits documentés, à mettre devant l'objectif « savoir qui est un utilisateur » : (1) ADR-008 sur la phase janvier-mai — ~50 personnes invitées, accès individuel d'une semaine par OTP, « aucune n'a renvoyé de feedback ou de rapport de bug, et aucune n'est revenue après l'expiration de son accès » ; (2) `DEPLOY.md` — les logs Cloudflare sont « purgés à 24 h sur plan gratuit » et « ne produisent rien d'actionnable ». ⮕ Si l'objectif est de **mesurer** l'usage et pas seulement de le **filtrer**, Access seul n'y répondra pas : c'est un second besoin, à nommer séparément.
  - ✅ **Tension de calendrier RÉSOLUE par le report** : `DEPLOY.md` impute l'échec de l'alpha de janvier à deux paramètres, dont « **début de trimestre (bande passante mentale des enseignants saturée)** ». Le ~20 août plaçait le geste exactement à ce moment-là ; **septembre l'en éloigne** — le report tranche la tension dans le bon sens. Le document note lui-même que le contexte a changé (bêta stable, CoP en place) — mais la coïncidence mérite d'être regardée en face plutôt que découverte après coup.
  - **À faire au moment du refermage** (liste du §3.6, complétée) : consigner la date effective, la raison déclenchante, la taille de la liste blanche reconstituée, l'arbitrage sur le quota ; remplir les 3 placeholders Cloudflare restés `[À COMPLÉTER]` dans `DEPLOY.md` (nom de la team Zero Trust ligne 269, application name ligne 277, policy name ligne 293) ; réviser ADR-008, `DEPLOY.md` et `SECURITY.md`.
  - ⮕ **À préparer avant le geste (septembre)** : la liste des personnes à inviter, et le courriel d'invitation (le gabarit du printemps est décrit en `DEPLOY.md` §4.1, étape 5).

- [x] **#424 LIVRÉ 8 août 2026 (1.57.0)** Portage des exports vers la Carte + suppression du « Plan de la leçon » — lots A→G du plan exécutés en une session, harnais de parité VERT avant la coupe.
  - **Livré** : générateur unique (`js/planification-export.js`, 3 niveaux × 3 formats, « SÉANCE »→« LEÇON », durées rollup, objectifs pluriels) · panneau « Exporter le plan… » (menu Actions, Copier/Télécharger) · rétroaction formative sur les activités dans l'Inspecteur + « Rétroaction sur le rendu » sur l'évaluation (D2b option 2) · moissonneuse sans drapeau (`main.js`, patron #409) · page RETIRÉE en entier. Import MD RETIRÉ (décision Grégoire, ne s'en servait pas — le correctif « champ mort » du Lot A est devenu sans objet). ⚠ Bug préexistant corrigé : sélecteurs de l'Évaluation MUETS (listeners posés avant le innerHTML += du niveau cognitif).
  - Audit d'origine — créé 8 août 2026 (audit `plans de travail/AUDIT-carte-alignement-exports-productions-2026-08-08.md`). ⮕ **PRÊT À EXÉCUTER (8 août après-midi)** : plan de chantier complet `plans de travail/PLAN-portage-exports-carte-2026-08-08.md` — lots A→G, repères de code vérifiés en 1.56.4, harnais de parité exigé avant suppression. Consigne de démarrage prête au §3 de SESSION.md.
  - ⚠⚠ **Il y a des DONNÉES dans la page** : `planification_seances[cleNote].activites[actId] = { retroaction, productionId }` — stockage distinct de `metadata.retroaction`/`metadata.productionId` du nœud Évaluation. Deux vérités pour deux notions. **Inventorier avant toute suppression.**
  - ⚠ **L'import Markdown écrit dans le champ MORT** `metadata.objectif` (`organisateur.js:1558`, `:1588`) — même défaut que la vue leçon supprimée le matin. Masqué par la migration, qui ne tourne qu'au chargement de carte : l'objectif importé n'apparaît qu'après un rechargement.
  - ⚠ **Vocabulaire périmé** : Texte et TSV disent « SÉANCE » pour une leçon. Contredit la distinction tranchée les 6-7 août, dans le document remis aux collègues.
  - ⚠ **Durée : double comptage possible** — les exports lisent `lecon.metadata.duree` (une leçon est un conteneur, sa durée est un rollup) PUIS additionnent les enfants. Divergerait du Σ affiché depuis 1.57.0.
  - Objectifs absents de Texte/TSV, et un seul émis en MD alors qu'une leçon en a plusieurs. Import MD lossy par construction (ni activités, ni connaissances, ni liens).
  - ✔ **Résiste bien** : les exports passent par `obtenirLabelNoeud()` — Exposé et les 5 nœuds d'EE y apparaissent déjà, sans code.
  - ⮕ **TROUVAILLE** : l'axe de profondeur EXISTE déjà à moitié (`estEleve`, « Document contractuel (étudiant·e) » vs « Document pédagogique (enseignant·e) », `organisateur.js:1084`+). Ce que Grégoire demande est sa GÉNÉRALISATION à 3 niveaux — dans la page qu'on allait supprimer. Raison de plus de porter avant de supprimer.
  - ✅ **D1-D5 TRANCHÉES le 8 août au soir** (§3bis de l'audit) : **D1** inventorier d'abord · **D2** la donnée vit sur le nœud · **D2b** sur l'ÉVALUATION 📐 · **D3** porter puis supprimer · **D4** trois niveaux (Sommaire / Déroulement / Alignement) · **D5** deux axes orthogonaux, un générateur unique.
  - ⮕ **D1 EST EXÉCUTABLE** : relevé lecture seule livré — `plans de travail/inventaire-D1-activites-organisateur.js`, à coller en console. Balaie TOUS les trimestres, ne compte pas `'aucune'` (valeur par défaut du sélecteur), et signale les références mortes au passage. **⚠ Le relevé tranche l'existence de DONNÉES, pas celle du BESOIN** (cf. veto D2b ci-dessous : même à zéro, la capacité reste à porter).
  - ✅ **RELEVÉ EXÉCUTÉ par Grégoire, 8 août midi** : **3 rattachements à migrer — 3 rétroactions, 0 production, 0 référence morte** (h2026 : 3 ; un trimestre : 1 leçon/1 activité sans rattachement posé). ⮕ La migration vers le nœud ACTIVITÉ portera ces 3 rétroactions ; **aucune** production à migrer ; le préalable de vivacité (#425) reste dû pour l'avenir mais n'a rien à réparer.
  - ✅ **D2b RÉSOLUE — décision Grégoire (option 2)** : le sélecteur de rétroaction du nœud Évaluation **garde un sens distinct** — la rétroaction *sur le rendu* (comment l'étudiant reçoit le travail commenté), différente de la formative sur l'activité. ⮕ Le portage AJOUTE donc un champ aux activités (formative) et CONSERVE celui de l'évaluation avec un **libellé clarifié** — deux notions, deux libellés, sinon la confusion revient.
  - ⚠⚠ **AMENDEMENT D2 — CONTRAINTE D'ORDRE, trouvée en vérifiant** : `metadata.productionId`/`metadata.retroaction` ne sont lus par **PERSONNE** hors de l'Inspecteur qui les écrit (`planification-carte.js:2120`/`:2156`, et c'est tout), alors que `activites[].productionId` **est lu par les exports** (`organisateur.js:633`/`:726`). Migrer avant de porter les exports déplacerait la donnée du seul porteur qui a des lecteurs vers un porteur qui n'en a aucun → **exports blancs, en silence**. ⮕ **D2 s'exécute APRÈS D3/D4/D5, jamais avant.** (Même famille que l'archive de #409 : un porteur sans lecteur n'est pas une source de vérité.)
  - ⮕ **D5 avant D4** dans l'exécution : le générateur unique d'abord, les trois niveaux en paramètre ensuite. C'est la décision la plus rentable des six — les défauts « SÉANCE » et double-comptage de durée se corrigent alors **une fois au lieu de six**.
  - ❌ **D2b — VETO DE GRÉGOIRE le 8 août au soir** : « les rétroactions sont formatives, sur les activités ». ⮕ **La rétroaction vit sur l'ACTIVITÉ**, `productionId` sur l'ÉVALUATION. **Deux rattachements, deux porteurs.** L'erreur d'arbitrage : l'argument s'appuyait sur `ponderation`/`grilleId`/`dateEcheance`, trois attributs de la PRODUCTION, transférés à la rétroaction parce que les deux champs voyagent dans le même objet `{retroaction, productionId}`. *La cohabitation dans une structure n'est pas un argument sur la nature.*
  - ⚠⚠ **CE QUE LE VETO RÉVÈLE — une CAPACITÉ manquante, pas des données.** L'Inspecteur gate le sélecteur de rétroaction par `if (donnees.type === 'evaluation')` (`planification-carte.js:2110`) : **sur une activité, il n'y a pas de champ**. ⮕ Poser une rétroaction formative sur une activité n'est possible QUE depuis l'Organisateur — la page à supprimer. **Supprimer la page retirerait le seul endroit où le geste décrit par Grégoire est possible.** Un cran au-dessus de la trouvaille §1.2.
  - ⚠ **CORRECTION D'UNE ERREUR DE L'ARBITRAGE INITIAL** : « si le relevé D1 rend zéro, D2 et D2b tombent » est **FAUX**. Zéro dirait qu'il n'y a rien à *migrer* ; la **capacité** doit être portée dans tous les cas. D1 tranche l'existence de données, pas celle du besoin.
  - ⮕ **TRAVAIL NEUF, non prévu, AVANT la suppression** : ajouter le sélecteur de rétroaction aux `TYPES_ACTIVITE` dans l'Inspecteur, écrivant `metadata.retroaction` du nœud activité.
  - ⮕ **Dette adjacente à fondre dans le portage (zéro-dette)** : `sauvegarderChoixActivite` est **dupliquée verbatim** (`organisateur.js:1643` ET `planification-carte.js:4937` — deux homonymes, même corps, même clé) ; la liste `retros` est en dur à **trois** endroits (`organisateur.js:742`, `planification-carte.js:2111` et `:5041`).
  - 📐 **QUESTION OUVERTE soulevée par le veto** : que devient le sélecteur de rétroaction du nœud **Évaluation** ? (1) il est de trop et se retire en même temps ; (2) il garde un sens distinct — rétroaction *sur le rendu*, sommative — et les deux coexistent avec deux libellés. **Non tranché volontairement** : c'est le terrain où l'arbitrage vient de se tromper une fois.
  - ⏸ **REPORTÉ (Grégoire, 19 août 2026)** : « Je vais trancher sur la rétroaction à la lumière des discussions avec les membres de la CoP. » Ne pas relancer cette question de session en session — elle attend la CoP. ⚠ Note de lecture : la puce « D2b RÉSOLUE (option 2) » plus haut est ANTÉRIEURE au veto — l'état vrai est : non tranché, en attente CoP.

- [ ] **#425** Intégration des productions étudiantes dans la Carte d'alignement — créé 8 août 2026 (demande Grégoire).
  - ✅ **PRÉALABLE LIVRÉ 8 août 2026 (1.57.0, avec #424 Lot B)** : contrôle de vivacité de `productionId` sur les DEUX chemins de la reprise inter-trimestre (`importerCarteDepuisTrimestre` metadata + `copierSeancesLecons` activités copiées), repli clé nue (leçon #419), 5 cas de sentinelle, 3 break-tests ROUGE. Reste les directions D → C → B → A ci-dessous.
  - ~~⚠ PRÉALABLE, c'était un correctif~~ : `productionId` ne survit pas à la reprise inter-trimestre. `cours` est GLOBAL, `productions` est NAMESPACÉ. La reprise recopie la metadata en bloc, et `coursId` a reçu un contrôle de vivacité explicite (`planification-donnees.js:486-492`) — `productionId`, non. Des références mortes voyagent en silence. Même classe que #407.
  - Quatre directions, ordre recommandé **D → C → B → A** : (D) nommer les deux trous — production non référencée = évalué mais non planifié, nœud sans production = planifié mais jamais évalué ; (C) la semaine du nœud Évaluation DÉRIVE de `dateEcheance` au lieu d'être posée à la main (mouvement D3) ; (B) le poids évaluatif par séquence (`ponderation`) ; (A) fermer la boucle — les critères de la `grilleId` couvrent-ils les connaissances reliées ?
  - ⮕ A en dernier : il dépend du module Grilles, et suppose un rattachement fiable — ce qu'il n'est pas encore.
  - ✅ **D6 TRANCHÉE le 8 août au soir** : le préalable, puis D → C → B → A.
  - ⚠⚠ **AMENDEMENT D6 — LE PRÉALABLE COUVRE DEUX CHEMINS, PAS UN** (vérifié au code) : (1) `planification-donnees.js` où `productionId` a **zéro occurrence** — la reprise recopie la metadata en bloc sans le contrôle de vivacité qu'elle applique pourtant au cours (`:486-492`) ; (2) **`copierSeancesLecons`**, deep-copy de l'entrée de séance ENTIÈRE, donc `.activites[].productionId` avec — **second chemin, même trou, non relevé par l'audit**. Un correctif qui ne traiterait que (1) laisserait la moitié du trou ouvert.
  - ⮕ **C'est daté** : `productions` étant namespacée, le trou s'ouvre **à chaque rentrée**. Reprendre le 601-101 d'H2026 pour A2026 emporte des références mortes en silence.

- [x] **#426 LIVRÉ 9 août 2026 (1.61.0)** Renommer l'onglet « Alignement pédagogique » → « **Carte d'alignement** » — ✅ **TRANCHÉ par Grégoire le 8 août 2026**.
  - Motif : les six onglets voisins de Conception nomment un OBJET de travail ; seul celui-ci nommait une théorie. Et « carte d'alignement » est déjà le mot de l'app — le guide intégré s'intitule « Construis ta carte d'alignement ».
  - ⚠ `js/config.js` est en **zone protégée** : la demande de Grégoire vaut autorisation, consignée à l'audit. Vérifié : `noms_stables.json:10` protège le NOM de la constante `configurationsOnglets`, pas la valeur des libellés — le changement est licite.
  - **Ruissellement livré, 7 surfaces** : `config.js` · titre de la sous-section et commentaire de section (`index.html`) · accordéon d'aide « Planifier les leçons » · popup `planification-alignement` + prose des verbes actifs · glossaire (6 `voir:`) · étape 5 du tour guidé + `TOUR_TITRE_COURT` · `SKILL_Alignement.md`.
  - ⮕ **Distinction tenue, et verrouillée par un test** : le CONCEPT « alignement pédagogique » n'est PAS renommé — seul l'ONGLET l'est. Le terme de glossaire et les définitions gardent le mot. Sans cette assertion, un test qui ne vérifie que la disparition du libellé autoriserait une purge trop large que personne ne verrait.
  - ⮕ **Trois chemins de navigation étaient déjà faux avant ce chantier** : le glossaire renvoyait à « Planification > Organisateur » (page supprimée le 8 août) et « Planification > Alignement » — or la section « Planification » n'existe plus depuis la réorganisation du **3 avril 2026**. Le renommage a servi de révélateur.

- [x] **#421 LIVRÉ 9 août 2026 (1.61.0)** Conformité du manuel d'utilisation de l'Alignement avec l'interface réelle — créé 8 août 2026 (demande Grégoire).
  - **Surface 1 — le guide intégré** (`GUIDE_PAGES`) : une page ajoutée, « **Ce que la leçon vise** » (8 → 9 pages). Le guide faisait construire la carte de bout en bout **sans jamais nommer l'objectif de leçon** — celui-là même que Grégoire ne trouvait pas (`METHODE-ALIGNEMENT.md` §4.1 bis). Le badge grisé avait réglé l'affordance dans l'interface le 8 août ; le manuel ne l'avait pas suivi. La page nomme les trois gestes : le badge 🎯 qui déplie, la saisie (+/−), et les « objectifs servis » cochés côté activité (#403). Corrigé au passage : la page 1 annonçait **7 étapes pour 8 pages**.
  - **Surface 2 — les infobulles** : 5 clés mortes retirées (`planif-alignement`, `planif-sous-nav` = doublons de `nav-conception-alignement` ; `planif-barre-outils`, `planif-filtres` = les filtres du canevas, retirés par #420 ; `nav-planification` = section disparue en avril). 6 textes réécrits contre l'interface réelle (sélecteur de **cartes** et non de cours, menu Actions, zoom à la molette, Inspecteur, séquence logique et non temporelle, l'évaluation seule sous « Preuve de réussite »). 1 ajoutée : la zone **Enseignement explicite** était la seule des six à n'avoir aucune infobulle depuis #422.
  - **Surface 3 — `METHODE-ALIGNEMENT.md` §4** : relevé refait au code (6 août / 1.31.22 → 9 août / 1.60.0, **26 versions d'écart**). Table des types portée à **18** en six zones (Exposé et les 5 blocs d'EE manquaient) ; les deux notions d'objectif ramenées à une seule, sur le nœud (`metadata.objectifs`) ; §4.1 bis marqué **RÉSOLU** — diagnostic conservé tel qu'écrit, c'est lui qui a produit le correctif ; **§4.2 FERMÉ** : les deux défauts de `planification_seances` (clé nue + dictionnaire plat) sont corrigés (namespacée par trimestre + clé composite `<carteId>::<leconId>`), l'avertissement « ne pas saisir 30 objectifs avant réparation » est levé.
  - **Surface 4, non prévue** : l'accordéon d'aide « Planifier les leçons » (`index.html`) annonçait des préréglages de zoom 25/50/75/100 % et « ajuster largeur/hauteur » — commandes retirées ; et ignorait l'Inspecteur, la corbeille, le plein écran, l'export du plan. Réécrit.
  - Sentinelle : `tests/unit/sentinelle-carte-alignement-421-426.test.js`, 14 cas, **10 break-tests ROUGE**. Deux assertions se **calculent** au lieu de recopier un chiffre (le « N étapes » de la page 1 et le compte de pages de l'infobulle sont dérivés du nombre réel de pages) — c'est exactement l'erreur corrigée ici, elle ne peut plus revenir en silence. Vitest **1974/1974** (228 fichiers).
  - ⮕ **Reste, hors périmètre — dette de documentation** : `docs/refonte-textes/infobulles-T9-*.md` et `-T10-*.md` sont les specs datées du 19 avril 2026 dont `accompagnement-contenu-hover.js` se dit encore « la source ». T10 documente en entier la page « Plan de la leçon », supprimée. Ce sont des **traces datées**, pas des documents vivants — les réécrire falsifierait un dossier. Décision à prendre : les archiver, ou corriger l'en-tête du JS pour dire que le code fait foi. **Non tranché seul.**
  - ⚠ **Trois surfaces, pas une.** Grégoire proposait `docs/utilisateur/METHODE-ALIGNEMENT.md` ; vérification faite, ce n'est **pas le manuel** mais un document de méthode et de conception (il dit lui-même ne pas être une file de tâches).
    1. **Le guide intégré** — `GUIDE_PAGES` dans `planification-carte.js`, 8 pages. C'est *lui* que les utilisateurs lisent : le vrai manuel.
    2. **Les infobulles** — ~20 entrées `planif-` dans `accompagnement-contenu-hover.js`, plus `docs/refonte-textes/infobulles-T9-planification-alignement.md` et `-T10-`.
    3. **`METHODE-ALIGNEMENT.md` §4 « État de l'outil »** — Grégoire avait raison sur ce point : c'est bien une affirmation factuelle sur l'interface, mais *« relevé au code le 6 août 2026, version 1.31.22 »*, soit **26 versions en arrière**. Déjà faux : son tableau des types ignore les 5 nœuds d'EE et l'Exposé, et il décrit l'objectif personnalisé « (vue Leçon) » — vue supprimée le 8 août.
  - ⮕ À faire **après** les lots C-D-E-F : l'interface doit avoir cessé de bouger.
  - ⮕ **F10 à consigner** au journal des frictions du même document : « planifier une leçon, c'est aussi budgéter le temps de parole du prof » — le modèle était bâti autour de ce que l'ÉLÈVE fait.


- [x] **#409 LIVRÉ 8 août 2026 (1.56.1)** Retirer l'archive `planification_seances_archive_pre367` — créée 7 août 2026 par la migration #367.
  - Filet de sécurité de la migration : copie intégrale de la clé nue avant purge. Elle couvrait le cas des notes orphelines (leçon absente de toute carte), qui n'ont pas de destination composite.
  - ⚠ **DÉCISION GRÉGOIRE (7 août)**, confirmée le 8 : la clé ne contenait que des **productions de test**, sans valeur. L'archive protégeait précisément ces données-là.
  - **Fait en deux gestes, pas un** : (a) l'écriture `db.setSync` retirée de la migration dans `main.js` ; (b) une **purge SANS DRAPEAU** de la clé déjà stockée. Le (b) n'était pas dans la consigne initiale et s'est imposé à l'audit : retirer l'écriture ne retire rien de ce qui est **déjà** chez qui a démarré 1.50.0-1.55.x, et c'est une copie intégrale du dictionnaire qui pèse pour rien sur le budget localStorage (#353). Sans drapeau parce qu'un **backup Codex pris dans la fenêtre du 7-8 août PORTE la clé** et la réintroduirait à l'import — une purge à drapeau ne repasserait jamais. Même motif que la purge `dureePeriodeMinutes` juste en dessous.
  - ⮕ **Constat qui a motivé le retrait sans réserve** : la clé n'avait **AUCUN lecteur** (grep : une écriture, zéro lecture). Aucun chemin de restauration n'a jamais existé — c'était une copie morte, pas un filet utilisable.
  - ⚠ **CONSÉQUENCE ASSUMÉE, énoncée** : sur un codex qui n'a **pas encore** migré, une note orpheline est désormais **perdue** à la purge au lieu d'être archivée. C'est la portée exacte de la décision du 7 août. Le test qui affirmait l'inverse a été **retourné, pas supprimé** — la décision reste lisible et verrouillée dans le dépôt.
  - Sentinelle : 6 cas neufs dans `tests/unit/sentinelle-367-notes-lecon.test.js`, **5 break-tests ROUGE**. ⚠ Un **faux-vert attrapé au passage** : la mutation « purge sous drapeau » ne rougissait que l'assertion statique, jamais la comportementale — le stub n'exposait pas `setSync`, donc la pose du drapeau lançait un `TypeError` avalé par le `catch` de la purge. Harnais corrigé, mutation refaite, l'assertion comportementale mord (`{ planif-noeud_7 } to be undefined`).

- [x] **#429 LIVRÉ 8 août 2026 (1.56.4)** La migration V3 ne lisait que le trimestre ACTIF — préférences perdues quand il n'a pas de `modalitesEvaluation`.
  - **Constaté au contrôle terrain** (dump de Grégoire, 8 août midi) : `grilleReferenceDepistage: ''` et `fenetrePatterns: 3` en V3, pendant que a2024/a2025/h2026 portaient `GRILLE1759529438501` et `4`. Sa capture montrait le sélecteur de grille sur « -- Sélectionner -- ». Cause : `lireModalitesLegacy()` passe par le module propriétaire = la clé du trimestre ACTIF (A2026, créé après le 16 avril, sans clé). La migration n'a rien trouvé, posé les défauts. `obtenirPreference` lit V3 SEUL, sans repli → le dépistage SOLO n'avait plus de grille de référence. **Touche aussi les testeurs pré-avril en prod.**
  - **Correctif** : `enrichirPrefsV3DepuisTrimestres()` — balaie TOUS les trimestres (plus récent d'abord, par `dateCreation`), adopte pour chaque champ resté à sa valeur PAR DÉFAUT la première valeur qui en diffère. **Lecture seule** des clés de trimestre — aucune purge : l'asymétrie lecture/purge a fait #419, son correctif ne la recrée pas. **One-shot** (drapeau `migrationPrefs_v3_enrichie_trimestres`) : sans lui, vider un champ le verrait se re-remplir à chaque boot. Derrière le portillon db-ready (#414).
  - Sentinelles : 5 cas comportementaux + assertion portillon, **5 break-tests ROUGE dont un FAUX-VERT attrapé** : la première assertion portillon (regex paresseuse) restait verte avec l'appel déplacé HORS portillon — réécrite par équilibrage de parenthèses. Second faux-vert de la journée évité par le §4 (après le stub sans `setSync` de #409).
  - Limite assumée : un champ REMIS à son défaut via l'UI entre hier (1.55.0) et aujourd'hui serait re-rempli une fois depuis un vieux trimestre. Fenêtre d'un jour, un utilisateur connu (Grégoire).

- [ ] **#428** Retirer la purge sans drapeau de l'archive pre367 (`main.js`) — créée 8 août 2026 par #409.
  - Elle n'existe que pour rattraper un **backup Codex de la fenêtre 7-8 août 2026** réimporté plus tard. Trois lignes, idempotentes, sans drapeau.
  - ⮕ **À retirer quand ces backups seront hors rotation — au plus tard à la rentrée (septembre 2026).** Pas de « au cas où » sans date : c'est cette ligne-ci qui en tient lieu, comme #409 l'était pour l'archive elle-même.
  - Retrait = supprimer le bloc `try` marqué `#409 (8 août 2026)` dans `main.js` + les 3 tests de purge de `sentinelle-367-notes-lecon.test.js` (garder ceux qui verrouillent l'absence d'écriture).

- [x] **#431 LIVRÉ 8 août 2026 (1.58.0), puis REMPLACÉ le 12 août par le #416 lot H** Niveau d'export « Personnalisé » — cases + ordre + aperçu, pour les gabarits départementaux (demande Grégoire, jour même).
  - ⚠ **Le niveau n'existe plus** : son réglage unique MIGRE en gabarit nommé, sa modale édite désormais des gabarits, son rendeur TSV dédié est supprimé. Zéro-dette — sans ce retrait, l'application porterait deux mécanismes de configuration d'export. La migration est non destructive et idempotente : le gabarit est écrit AVANT que l'ancienne préférence soit effacée.
  - ⮕ **L'hypothèse posée au journal `USAGE-FORMATS.md` le jour même** — « un seul réglage suffit-il, ou faudra-t-il des gabarits nommés ? » — a été **levée par le terrain le 12 août**. Le mécanisme a fonctionné exactement comme prévu : hypothèse écrite, usage réel, réponse.
  - **Livré** : 4e jeu de réglages sur le générateur unique (D5 inchangé) — 8 cases de contenu, 4 sections ordonnables (texte/MD : sections de la leçon ; TSV : groupes de colonnes, préfixe fixe Séquence|Leçon|Semaine) ; préférence `exportPlanPersonnalise` (DEFAUTS de preferences.js), normalisée à chaque lecture ; modale réglages + aperçu vivant (persistance immédiate — ce qu'on voit est ce que le panneau exportera) ; « Régler le niveau personnalisé… » au panneau Actions.
  - **Décisions actées** (plan `PLAN-export-personnalise-2026-08-08.md`) : l'ordre ne touche JAMAIS la structure séquences→leçons ; UN réglage mémorisé (gabarits nommés = hypothèse au terrain, USAGE-FORMATS) ; modale assumée (un panneau de 380 px ne suffit pas).
  - Au passage : **#152 corrigé** (deux colonnes de semaine au TSV → une seule).

- [x] **#438 LIVRÉ 9 août 2026 (1.65.1)** `release.mjs` ne bumpait pas le `?v=` de `styles.css` — la leçon de #417 non poussée jusqu'au CSS.
  - **Trouvé par la session « carte d'alignement »**, qui a dû bumper `styles.css` à la main **deux fois dans la journée**. Recoupé ici avant correctif : **zéro occurrence de `css`** dans `scripts/release.mjs` ; son balayage `git status --porcelain -- js` ne voyait que le JS, et `styles.css` est un `<link rel="stylesheet">` (`index.html:14`), pas un `<script src>`.
  - ⚠ **Pourquoi ce trou est vicieux, et pourquoi aucun test ne pouvait le voir** : un correctif CSS livré derrière un cache non invalidé est **INERTE**, et rien ne le signale — la page s'affiche, sans erreur, simplement avec l'ancien style. C'est le mode de défaillance que le commentaire d'en-tête de #417 décrit **déjà**, un fichier plus loin. Comme pour #417, la garantie ne peut venir que du script de release.
  - **Correctif minimal** : le périmètre du balayage passe à `js`, `styles.css`, `css` et le filtre accepte `.css`. ⮕ **La boucle de bump n'a pas eu à bouger** : elle cherche `<chemin>?v=` sans savoir si c'est un `<script src>` ou un `<link href>`. Il ne manquait que le fichier dans la liste — le correctif est de trois lignes parce que #417 avait bien séparé « quoi bumper » de « comment bumper ».
  - **La précision est conservée** : une feuille intouchée garde son `?v=`. Bumper tout à chaque release reviendrait à supprimer le cache, ce qui n'est pas tenable dans la durée.
  - Sentinelle : le harnais de `sentinelle-release-bump-cache-417.test.js` est **étendu** (dépôt git jetable, deux feuilles de style dont une seule touchée) plutôt que dupliqué — 3 cas neufs, **3 break-tests ROUGE** dont « le bump devient aveugle », qui prouve que l'assertion de précision mord vraiment. Vitest 2057/2057.

- [x] **#436 LIVRÉ 9 août 2026 (1.64.0)** Phase G2-b — fin du miroir `configPAN` (dernière dette du plan note finale).
  - **Ce que c'était** : `modalitesEvaluation.configPAN` est un INSTANTANÉ de la config de pratique ; la SSOT est `pratiquesConfigurables[id].configuration`. L'instantané n'est réécrit qu'à l'**application** d'une pratique — il dérive dès qu'on édite cette pratique ensuite. G2-a (24 mai) avait coupé le CALCUL DE LA NOTE du miroir ; G2-b coupe tout le reste.
  - ⚠ **La dérive est INVISIBLE** : rien ne plante, l'écran affiche un nombre plausible mais périmé à côté d'un autre écran qui lit la SSOT. Motif de #328 — d'où un cliquet statique plutôt qu'un test de comportement : ce qu'on interdit, c'est la RÉAPPARITION d'une lecture.
  - **Livré, trois gestes** : (1) **neuf lectures d'affichage** migrées ou neutralisées, sur 5 modules (`profil-etudiant-calculs` ×2, `profil-etudiant-sections-affichage` ×3, `tableau-bord-apercu` ×1, `etudiants` ×2, `liste-evaluations` ×1) — ⚠ *rectifié au rituel de fin : le décompte annoncé le jour même était **sept**, sous-compté de deux ; `sections-affichage` en portait 3, pas 2. Le message de commit de #436 garde l'ancien chiffre, non réécrit — même convention que le 8 août.* ; (2) les **deux écrivains** de `pratiques.js` retirés — la migration V1 `migrerConfigurationPortfolio()` (appelée à chaque boot) et le miroitage à l'application d'une pratique ; (3) l'**îlot multi-objectifs** de `objectifs.js` (3 fonctions exposées sur `window`, **zéro appelant** — dernières consommatrices de `configPAN.ensembleObjectifsId`, même famille que #435).
  - ⚠⚠ **DEUX VALEURS AFFICHÉES DÉLIBÉRÉMENT GELÉES — décision en attente.** Deux lectures visaient des champs du miroir qu'**aucun code n'écrit** : elles rendaient toujours leur repli. Les brancher sur la SSOT aurait changé ce que Grégoire voit. Elles sont devenues des constantes explicites, pas des lectures fantômes :
    - `NB_ARTEFACTS_COMPLETION_ALTERNATIVE = 3` (`liste-evaluations.js`) — dénominateur de `indice = meilleurs.length / N`, qui alimente **l'indice C affiché au tableau de bord**. La SSOT dirait `nombreARetenir` (4) ou `nombreTotal` (10). 📐 **Question : lequel a du sens ?**
    - `QUOTA_JETONS_AFFICHE_DEFAUT = 2` (`profil-etudiant-sections-affichage.js`) — dénominateur de la barre « X / N jetons utilisés ». Le champ lu (`configPAN.jetons.nombreParEleve`) était **activement PURGÉ** par le module propriétaire depuis #328 L2-c : un module effaçait ce qu'un autre lisait. Et `obtenirConfigJetons()` n'expose **aucun quota global** (des nombres par usage), alors que le numérateur somme TOUS les types. 📐 **Question : quel dénominateur ?**
  - ⚠ **DEUX SURVIVANTS légitimes**, break-testés pour que le prochain nettoyage ne les prenne pas pour du mort : la **purge du sous-champ jetons** dans le module propriétaire (#328 L2-c), et le **chemin d'injection de simulation** du comparateur (#307) — `this.config.modalites.configPAN` est une config injectée en mémoire, pas un instantané relu du stockage.
  - ✅ **TRANCHÉ (Grégoire, 9 août 2026) — la purge du miroir stocké est AJOUTÉE À LA SÉANCE #353.** Le miroir n'a plus ni lecteur ni écrivain, mais `configPAN` **occupe encore de la place** dans les données de chaque trimestre. C'est donc devenu un pur gain de budget localStorage (#353 : 173 %, 8882 Ko / 5120 Ko, 456 clés) — sa place naturelle est la séance dédiée, avec les autres candidats déjà listés (`*_backup_v1` jamais purgés, `tamponsImages` base64, code mort `libereCacheLocalStorage`).
  - ⚠ **Contrainte de cette purge, à respecter le jour venu** : c'est une **migration destructive**. Règle CLAUDE.md → console one-shot sur backup Codex frais, jamais distribuée ; preview/comptage lecture seule d'abord (patron `reparation-donnees-algorithmiques`). ⮕ Et un point propre à ce cas : **purger sans drapeau**, comme #409 — un backup Codex pris avant aujourd'hui PORTE `configPAN` et le réintroduirait à l'import ; une purge à drapeau ne repasserait jamais.
  - Sentinelle : `tests/unit/sentinelle-G2b-fin-miroir-configPAN-436.test.js`, 19 cas, **12 break-tests ROUGE** (dont les 2 survivants et les 2 valeurs gelées). Vitest 2018/2018.

- [x] **#435 LIVRÉ 9 août 2026 (1.63.0)** Ablation du mode STD « par-objectifs » — extension de #396, sur vérification demandée par Grégoire.
  - ⚠ **Origine : une question de Grégoire qui a attrapé une erreur de #434.** « Il me semble que la configuration PAN STD par objectifs avait été retirée après décision. » Vérifié : #396 (5 août, décision D2) avait retiré `pan_par_objectif` au motif « chemin jamais fonctionnel qui duplique le moteur STD par objectifs » — et #434 venait d'ouvrir une porte utilisateur vers ce moteur STD **sans vérifier l'historique de l'item**. Or ce moteur portait le MÊME défaut de naissance : `_calculerNiveauxParObjectif` apparie les productions par un `objectifId` qu'**aucun code n'écrit**, ou par égalité stricte texte-libre ↔ nom d'objectif. Jamais fonctionnel non plus.
  - ✅ **DÉCISION Grégoire (9 août) : étendre le retrait de #396.** Sont partis : le **routage** `varianteCalcul === 'par-objectifs'` et les **quatre modes** du moteur STD (comptage, moyenne pondérée, seuils critiques, holistique — ~6,8 Ko) ; le **panneau** `mat-config-par-objectifs` (137 lignes d'index.html, jamais affichées) ; les **dix fonctions d'édition** + 12 exports (`pratiques-gestion.js`, ~14,8 Ko) ; les **quatre gabarits** du catalogue (« Par objectifs (Pondéré) », « STD Chimie organique », « STD Interfaces et BD », « STD Anatomie ») — chacun illustrait un des 4 modes et **aucun ne portait le moindre objectif** : jamais calculables, même moteur sain ; les **projections `parObjectifs`** entre config et modalités.
  - ⚠⚠ **SURVIVANTS, le piège du prochain nettoyage** : `_calculerNiveauxParObjectif` et `suggererNoteHolistique` ont l'air morts avec le moteur — ils ne le sont pas : la **suggestion holistique DEN** (`denotation-saisie-ui.js`, DEN-1) les appelle, défensivement (null si rien d'exploitable). Leur survie est break-testée dans les DEUX sentinelles.
  - **Pratiques legacy : normalisation, même patron que #396.** Une pratique stockée portant `varianteCalcul: 'par-objectifs'` ou un bloc `parObjectifs` s'ouvre sur son `methodeSelection` réel avec un `console.warn` — **lecture seule**, rien n'est réécrit tant que l'utilisateur ne sauvegarde pas lui-même. Une modalité stockée qui porte encore le flag tombe dans le calcul portfolio, qui calcule.
  - Sentinelles : `sentinelle-phase-D-variante-calcul-434.test.js` **réécrite** (cliquet d'absence #434+#435, 13 cas) et le bloc de parité de `denotation-moteur-DEN1.test.js` **reconverti** (la parité méthode↔helper n'a plus de sujet à un seul chemin ; il verrouille désormais la survie des dépendances DEN + le cliquet). **12 break-tests ROUGE**, dont les deux gardes de survie DEN. Vitest 1998/1998.
  - Changelog : l'entrée 1.62 (jamais déployée) est **consolidée dans 1.63** — précédent de la 1.48. L'utilisateur ne verra qu'une livraison, et elle ne promet plus un mode retiré.

- [x] **#434 LIVRÉ 9 août 2026 (1.62.0)** Phase D du plan note finale — retirer le champ legacy « Comment construis-tu la note finale ? » (`mat-variante-calcul`).
  - Bug 5 du plan du 24 mai : ce sélecteur dédoublait « Mode de sélection » avec un autre vocabulaire, et les deux pouvaient **diverger sans que rien ne le signale**. Décision Grégoire (24 mai) : retrait pur. Décision Grégoire (9 août) : migrer la bascule vers le Mode de sélection.
  - ⚠ **Le « retrait pur » était impossible, pour deux raisons dont une non soupçonnée** :
    1. **`varianteCalcul` n'est pas un champ d'UI** — `pratique-pan-standards.js:134` y route `calculerPerformance` vers le calcul par objectifs. C'est un **flag de calcul**, et les pratiques déjà enregistrées le portent.
    2. ⚠⚠ **Le panneau « Par objectifs » ne pouvait JAMAIS s'afficher.** L'ancien handler ne faisait que `classList.remove('u-hide')`, or `#mat-config-par-objectifs` porte un `style="display: none;"` **inline** et n'a aucune classe — retirer une classe absente ne lève pas un style inline. Le champ legacy n'était pas seulement un doublon : **son unique fonction propre était cassée**, sans erreur ni trace, et personne ne l'a vu parce qu'un panneau qui ne s'ouvre pas ne se plaint pas.
  - **Livré** : `mat-portfolio-selection` devient l'UNIQUE commande ; descriptions par mode ; `varianteCalcul` devient une **projection** du mode (`varianteCalculDepuisMode`) — deux commandes divergentes deviennent une commande et sa dérivée ; pose du mode **hors** du garde `if (config.portfolio)`. ⚠ **AMENDÉ LE JOUR MÊME PAR #435** : l'option « Par objectifs » que #434 avait ajoutée au sélecteur — en croyant corriger un panneau cassé — rendait atteignable un moteur que la décision #396 condamnait. Retirée avec le moteur. La leçon est à #435.
  - **Zéro-dette adjacent** : retiré le bloc de rafraîchissement « interface STD » de `pratiques-bibliotheque.js` — six `getElementById` sur des ids `v2-*` absents du DOM depuis le retrait de l'éditeur V2. Chaque `if (element && …)` sortait en silence : du code qui ne pouvait ni agir ni échouer.
  - ⮕ **Reste dû, versé à G2-b** : faire lire `methodeSelection` au moteur pour que la projection disparaisse. C'est un changement du **contrat de calcul**, pas un retrait d'UI.
  - Sentinelle : `tests/unit/sentinelle-phase-D-variante-calcul-434.test.js`, 13 cas, **12 break-tests ROUGE**. Un cas **évalue la vraie fonction de projection** extraite du source plutôt que de redécrire une table parallèle qui pourrait diverger.
  - ⚠ **Porte terrain** : ouvrir une pratique PAN-Standards, vérifier que « Par objectifs (4 modes de calcul) » apparaît au Mode de sélection **et affiche réellement son panneau** — c'est la première fois que ce panneau est atteignable dans ce formulaire.

- [x] **#433 LIVRÉ 8 août 2026 (1.60.0)** Corbeille de la palette — supprimer un bloc au doigt (retour terrain iPad, SUIVI-BUGS #153).
  - ⚠ **Le constat de départ était à nuancer, et la vérification l'a fait** : « pas possible de supprimer sur iPad » → en réalité possible en TROIS gestes (tap → bouton 🕵️ Inspecteur → Supprimer). Friction, pas capacité manquante. La corbeille ramène à UN geste et rend la capacité découvrable.
  - **Mécanique** : dépôt résolu par GÉOMÉTRIE (rectangle contre point de relâchement) — pendant un drag, l'élément sous le doigt est le bloc déplacé, jamais ce qu'il survole ; retour ANTICIPÉ dans les trois `onUp` (B, C, D) sinon le rattachement porterait sur un nœud supprimé ; un seul listener `pointermove` global pour l'état armé/survolé, plutôt que trois `onMove` retouchés ; garde « palette masquée » (`offsetParent`) contre le dépôt fantôme.
  - **UX** : discrète au repos, ARMÉE dès qu'un déplacement commence, ROUGE au survol ; cible 44 px ; toast qui nomme le bloc supprimé et rappelle le bouton **Annuler** (⌘Z n'existe pas au doigt).
  - 📐 **QUESTION OUVERTE, à trancher au terrain** : le double-clic ouvre-t-il l'Inspecteur sur iPad ? Si non, l'Inspecteur entier (durée, semaine, objectifs servis, **rétroaction formative de #424 Lot E**) n'est atteignable que par le bouton 🕵️ de la palette — ce qui mériterait un geste plus direct (ex. tap long, ou bouton sur le bloc sélectionné).

- [x] **#432 LIVRÉ 8 août 2026 (1.59.0)** Harmoniser les guides — forme et contenu (demande Grégoire, captures Chrome/Mac).
  - **Forme** : une échelle typographique UNIQUE en sélecteurs groupés pour les deux familles de guides ; tailles explicites sur `p`/`li`/astuce/référence/conclusion (l'uniformité ne dépend plus de l'héritage) ; `text-size-adjust: 100%` ; panneau flottant élargi (240-340px) pour respirer à 0.9rem ; doublons `astuce`/`ref` des deux familles fondus.
  - **Glyphes** : les `<span class="icone-inline--check">` (masques SVG) rendaient VIDE chez Grégoire — remplacés par du TEXTE stylé (✓ / ! / ⚠). Un span sans texte échoue sans laisser de trace.
  - **Contenu** : page 8 réécrite autour du réel (menu Actions, 3 niveaux, Personnalisé, imports JSON/inter-trimestre) — elle documentait la page « Plan de la leçon » et l'import MD supprimés en 1.57.0 ; pitch de la page 1 ; Exposé + 5 étapes d'enseignement explicite en page 6 ; conclusion de la page 7 ramenée dans l'échelle. Référence Anderson (2026) **confirmée par Grégoire** (février 2026).
  - ⮕ **Reste de #421** : les infobulles `planif-*` et le §4 de METHODE-ALIGNEMENT.md (surfaces 2 et 3) — le guide intégré (surface 1) est FAIT.
  - 📐 **Import « à rebours » (idée Grégoire, non tranchée)** : faire écrire le plan par une IA et reconstruire la carte à partir du texte. Jamais expérimenté ; l'import MD retiré était lossy par construction. À instruire comme chantier NEUF si l'envie se confirme — pas une résurrection silencieuse.

- [ ] **#430** Retirer la moissonneuse #424 (`main.js`) ET le repli legacy du générateur d'export — créés 8 août 2026 par le portage #424.
  - La moissonneuse porte `planification_seances[...].activites[].{retroaction, productionId}` vers les nœuds à chaque boot, SANS drapeau : un backup Codex d'avant le portage réintroduit `activites` à l'import. Le repli de lecture d'`activitesLegacyDeLecon()` dans `js/planification-export.js` couvre la fenêtre entre un tel import et le boot suivant.
  - ⮕ **À retirer ENSEMBLE quand ces backups seront hors rotation — au plus tard à la rentrée (septembre 2026).** Même famille et même échéance que #428. Pas de « au cas où » sans date.
  - Retrait = le bloc `try` marqué `#424 Lot F` dans `main.js` + sa sentinelle (`sentinelle-moisson-retroactions-424.test.js`) + `activitesLegacyDeLecon` et ses appels dans `js/planification-export.js` (le générateur ne lira plus que les nœuds) + les cas « porteur historique » du harnais de parité.

- [ ] **#406** Blocs B et C du PLAN-JOURNEE du 7 août — **REPORTÉS explicitement par Grégoire (7 août, soir)**, à ne pas perdre.
  - Rappel de ce que c'est (les lettres seules ne le disent pas) : **B** = test d'onboarding à froid, persona « Catherine » — profil Chrome neuf, app à l'état premier lancement, session Cowork sans aucun contexte projet, 60-90 min, **ne pas aider pendant le test**. C'est une **tâche de Grégoire**, non délégable : tout l'intérêt est qu'un agent découvre l'app sans savoir ce qu'elle fait. **C** = triage des deux livrables en items BACKLOG (chantier ONBOARDING, priorité 1 actée le 6 août), tâche Claude Code.
  - ⮕ **C n'est PAS bloqué par B.** Le bloc A a été exécuté dès le 6 août en passe autonome (`claude/plan-journee-2026-08-07-csllh9`, commit `ffd07765`) : grille §10 remplie + 5 observations. Ce triage-là peut se faire seul, quand on veut.
  - ⮕ Reste dû au terrain sur A, si on le reprend : V1 sur corpus réel, V4/V5 sur h2026, passe iPad. ~15 min.
  - Consignes : `plans de travail/PLAN-JOURNEE-2026-08-07.md`, `plans de travail/TEST-ONBOARDING-COWORK-consigne.md`, `plans de travail/VALIDATION-TERRAIN-2026-08-07-consigne.md`.

- [x] **#404 LIVRÉ 7 août 2026 (1.47.3)** Une leçon ancrée HORS CADRE retombe dans « Non planifié » — réserve ouverte du 6 août, corrigée le 7.
  - Le défaut : `metadata.semaine` sans rangée d'accueil → la leçon DISPARAISSAIT (les rangées n'accueillent que leur numéro ; « Non planifié » n'attrapait que `semaine === null`). Portes ouvertes : champ « Semaine » de l'inspecteur (aucun `max`) et import Markdown (`val >= 1`). Le glisser, lui, était protégé.
  - **Décision Grégoire (7 août)** : RETOMBER à l'affichage, et NON borner la saisie. La valeur reste écrite — si le Cadre du trimestre s'étend, la leçon reprend sa rangée d'elle-même. Pastille « Sem. N hors cadre » pour que le repli ne passe pas pour un effacement.
  - Facette trouvée en lisant le code, absente de la réserve : le cadre est **troué**, pas continu (une semaine de planification/examens n'a pas de numéro) — une semaine 4 manquante au milieu disparaissait comme une semaine 42. D'où un Set des semaines rendues, pas une borne haute. Même correctif pour une SÉQUENCE dont l'étendue commence hors cadre.
  - Sentinelle `tests/unit/sentinelle-hors-cadre-planificateur.test.js` (9 cas), **6 break-tests ROUGE→VERT** — dont 1 faux positif corrigé (l'assertion cherchait le titre de la séquence, que la leçon affiche déjà comme étiquette de contexte).

- [x] **#405 LIVRÉ 7 août 2026 (1.47.4)** La poignée de redimensionnement d'un bloc répond au DOIGT, cible 44 px — porte terrain du 7 août.
  - Deux défauts, et le premier commandait l'autre : le geste était en `mousedown`/`mousemove` (Safari ne synthétise pas de `mousemove` au tactile → poignée muette au doigt et au Pencil), et la cible faisait 20 px. **Élargir seule aurait refait 1.47.0 : une zone plus large et toujours inerte.**
  - Bascule sur les pointer events (capture du pointeur, filtre `pointerId`, `pointercancel`), même idiome que la poignée de palette de 1.47.1.
  - Géométrie : cible CENTRÉE sur le coin (22 px dedans, 22 dehors). Un bloc descend à `HAUTEUR_MIN_NOEUD` = 44 px — un carré de 44 posé en dedans lui volerait toute sa hauteur et sa sélection.
  - Sentinelle `tests/unit/sentinelle-poignee-tactile-noeud.test.js` (10 cas, câblage + arithmétique), **8 break-tests ROUGE→VERT** — dont 2 qui ont corrigé la sentinelle (le mot `pointercancel` survivait dans le `removeEventListener`, idem `pointermove`/`pointerup` : resserré sur l'INSCRIPTION).
  - ⚠ **Reste dû au terrain** : validation au doigt sur iPad Air.

- [ ] **#403** Liens objectif → activité/évaluation — vérification structurelle des objectifs de leçon. **Design TRANCHÉ par Grégoire (6 août 2026)**, à construire **après le lot 2 de la grille** (ou dès que l'alignement réel du 601-101 en ressent la friction).
  - Modèle : le lien vit sur le NŒUD servant — `metadata.objectifsServis = [objectifId…]` sur l'activité et sur l'évaluation (SSOT, N:N, suit clones/imports ; ids d'objectifs prêts depuis 1.34.0).
  - Saisie : cases à cocher dans l'INSPECTEUR (activité : « Sert les objectifs » ; évaluation : « Vérifie les objectifs ») — déclaratif, fonctionne sur iPad (principe F7 bis). Périmètre : objectifs de SA leçon seulement (élargissable si le réinvestissement inter-leçons devient un besoin réel).
  - Vérification par objectif : (1) servi par ≥ 1 activité ; (2) vérifié par une évaluation en DIRECT (cas in situ/oral : nœud évaluation, rétroaction orale) OU TRANSITIF (une de ses activités est reliée à une évaluation) — patron des idées maîtresses.
  - Signal : pastille discrète par ligne d'objectif dans le bloc leçon — grise = invitation, JAMAIS bloquante (§6 quinquies : l'exigence est progressive). Aucune reconnaissance sémantique : l'outil vérifie la structure, l'enseignant reste le juge du contenu.
  - Hygiène : suppression d'un objectif → purger son id des `objectifsServis` (ou tolérance aux ids morts au filtrage, à trancher à l'implémentation).
  - Piste ultérieure (attend sa friction) : signal de décalage niveau cognitif objectif ↔ activités (verbes déjà dans BANQUE_VERBES).
  - Référence design : `docs/utilisateur/METHODE-ALIGNEMENT.md` §6 ter (mis à jour 6 août soir).

### Audit `Plan Accompagnement/` — 9 août 2026 (PM) — versement trié (§4quater de `ETAT-PROJET.md`)

> Le dernier angle mort de l'audit des plans : 14 documents jamais passés au crible, traités
> un par un **au code**. ⚠ **Sur les trois documents que le §4ter accusait de désigner du
> travail non fait, DEUX étaient intégralement livrés** (`SPEC_mini-guide_cours_balises`,
> `PLAN_decouvrabilite_guides`). Le compte de plans ouverts BAISSE de ce côté. Bilan complet
> et preuves relevées : `ETAT-PROJET.md` §4quater.

- [ ] **#439** Les deux guides pédagogiques manquants — le chantier passe de **5 sur 7** à 7 sur 7 — créé 9 août 2026 (audit `Plan Accompagnement/`).
  - **`pan-rrec` — cadre réglementaire (RREC), 4 pages.** `GUIDES_PEDAGOGIQUES` porte cinq clés (`solo`, `acp`, `rai`, `som`, `pan`), pas celle-là. ⮕ **Ce n'est pas un chantier de conception** : les 4 pages sont **intégralement rédigées** au §3 de `Plan Accompagnement/PLAN_guide_PAN_refonte_RREC.md`, prêtes à coller, avec le bouton d'accès (§4) et les tests d'exactitude réglementaire (§5). Coût S.
  - ⚠ **Registre à ne PAS diluer à l'intégration** (décision Grégoire du 29 mai, §1 du plan) : le guide ne dit jamais que l'app *garantit* la conformité — les verbes sont *aider*, *cadrer*, *aligner*. Motif : `seuilReussite` est configurable (`echelles.js`), un guide qui promettrait la conformité serait factuellement faux et exposerait l'enseignant qui s'y fierait.
  - À l'intégration, retirer le contenu PAN du §5.2 de `PLAN_guides_pedagogiques.md` (zéro-dette : deux sources de vérité, le plan maître le demande lui-même).
  - **« Enseignement explicite », 4 pages** (§4.3 du plan maître, contenu rédigé ; Gauthier, Bissonnette, Richard 2013). ⚠ **Son gabarit HTML du §4.1 est PÉRIMÉ** — il est bâti sur le patron `.option-accompagnement`, retiré le 9 août faute de porteur. Suivre le patron accordéon des cinq cartes réelles. La préférence `enseignementExpliciteDefaut` du §4.1 n'existe pas non plus : à créer dans les DEFAUTS de `preferences.js` (pas de clé sauvage) si on garde l'idée de l'override local.
- [ ] **#440** 🟡 SRPNF codé en dur dans l'**affichage** des diagnostics — signalé le 23 mai, jamais versé au backlog — créé 9 août 2026 (audit `Plan Accompagnement/`).
  - **Le signal a mis deux mois et demi à arriver ici.** Le §7 de `PLAN_guides_pedagogiques.md` écrivait « signalé pour le backlog » le 23 mai ; `grep SRPNF BACKLOG.md` rendait **zéro occurrence** le 9 août. C'est le trajet plan → backlog qui a manqué, pas le diagnostic.
  - ⚠ **L'état réel est plus favorable que ce que le plan décrivait — et le reste est plus précis.** Le **calcul** a été généralisé depuis (Beta 90, pratique active) : `calculerMoyennesCriteres` (`profil-etudiant-calculs.js:104`) construit ses accumulateurs **depuis la grille de référence**, et `calculerForcesEtDefis` (`:625`) itère les critères de la grille. Ce qui reste en dur :
    1. `profil-etudiant-diagnostics.js:85` — le tableau des scores itère la liste littérale `['structure','rigueur','plausibilite','nuance','francais']` ;
    2. `profil-etudiant-diagnostics.js:433` — les barres graduées, même liste littérale ;
    3. `identifierDefiSpecifique` (`profil-etudiant-calculs.js:874-941`) — parse la rétroaction avec le regex `(STRUCTURE|RIGUEUR|PLAUSIBILITÉ|NUANCE|FRANÇAIS ÉCRIT)\s*\(([IDME])\)` et cinq accumulateurs nommés.
  - **Conséquence à vérifier au terrain avant de coder** : un enseignant dont la grille porte d'autres critères obtient des `moyennes` correctement calculées **sur ses clés à lui**, mais un tableau de scores et des barres **vides** (chaque critère rend `''` faute de correspondance). Forces/défis, eux, s'affichent. C'est une incohérence d'affichage, pas un faux chiffre — à confirmer sur une grille non-SRPNF avant de dimensionner le correctif.
  - Le dispatch `defisInfo.type === 'srpnf'` vient de `pratique-pan-standards.js:612` : il vise **toute la famille PAN-Standards**, pas la seule pratique de Grégoire. L'aspiration d'universalité de `SKILL_RaI.md` (« rien ne doit être codé en dur pour une pratique personnelle ») est donc bien en cause. Coût M. Sentinelle : rendu sur une grille à critères arbitraires.
  - ▣ Bonne nouvelle du même signalement, revérifiée le 9 août : **ELLAC n'apparaît dans aucun `.js`** — c'est resté purement conceptuel.
- [x] **#447** 🟡 Fraîcheur des indices C/P — **la prémisse était FAUSSE, un vrai trou a été trouvé à côté** — créé 10 août 2026, traité le 10 août au soir (1.67.3).
  - ⚠⚠ **CE QUI ÉTAIT ÉCRIT ICI ÉTAIT INEXACT, et c'est le principal enseignement de l'item.** L'entrée disait « l'aperçu LIT le stocké sans recalculer ». **`tableau-bord-apercu.js:1069` appelle `calculerEtStockerIndicesCP()` à CHAQUE rendu.** Vérifié au navigateur (Chromium, pack démo) par une expérience décisive : on FAUSSE `indicesCP` dans le stockage (tous les P à 0, `dateCalcul` à 1999), on rend l'aperçu **sans** passer par la Liste — les valeurs justes reviennent et `dateCalcul` est réécrite. ⮕ **Le diagnostic avait été posé par lecture de code, jamais exécuté.**
  - ⮕ **Le « Incomplet : 23 » du 10 août n'était donc pas un défaut de fraîcheur** : c'était l'aperçu rendant fidèlement des données cassées — productions désappariées (#154, réparé le jour même) et contexte de trimestre croisé (#446, corrigé en 1.67.0/1.67.1). Les deux causes ont disparu.
  - ⮕ **Le geste de contournement « ouvrir la Liste PUIS l'aperçu » est CADUC** — il ne servait à rien. Ne plus le redire à Grégoire.
  - ✅ **MAIS un vrai trou existait à côté, et il est refermé.** Le cache de lecture #397 promettait en commentaire « jamais de lecture périmée » ; il ne l'assurait que pour les écritures passant par `sauvegarderDonneesSelonMode`. Or les propriétaires SSOT écrivent leur clé en `db.setSync`/`db.set` DIRECT. **Mesuré au navigateur : pendant un seul `chargerTableauBordApercu()`, `indicesCP` est écrit à une profondeur de pipeline de 2** — le pipeline extérieur survit à l'écriture et garde sa mémoïsation d'avant. Aucune lecture périmée n'était servie ce jour-là (détecteur posé sur `obtenirDonneesSelonMode`, 0 divergence sur quatre parcours réels) : le défaut était **latent**, et le prochain lecteur ajouté dans cette fenêtre en aurait reçu une en silence. Même famille que le 10 août : une promesse écrite en commentaire que le code ne tenait qu'à moitié.
  - ✅ **Correctif** : `db.surEcriture()` (crochet d'écriture, `db.js` émet — `modes.js` s'abonne, le sens des dépendances est préservé) + `invaliderCacheLecture(cle)`. ⚠ **L'invalidation est CIBLÉE sur la clé écrite, et c'est l'arbitrage « fraîcheur vs perf #397 » que l'item demandait, tranché sur mesures** : vider tout le cache à chaque écriture coûte **+329 ms** sur un rendu à 75 étudiants (A/B sur le même build) — l'ordre de grandeur du gain que #397 était venu chercher. Ciblée : **+22 ms sur 618**, plages superposées. Le rabot aurait rendu le cache honnête en le rendant inutile.
  - ✅ Sentinelle `sentinelle-invalidation-cache-lecture-447` (8 cas, dont un qui charge le VRAI `db.js` — sans lui, retirer le crochet ne ferait rougir personne). **5 break-tests, 5 ROUGE.** ⚠ 4 stubs `db` de tests voisins mis en accord avec le contrat réel (ils attestaient d'un `db` qui ne signale pas) ; la sentinelle #397 conserve son invariant, resserré sur la clé.
- [x] **#446 LIVRÉ 10 août 2026 (1.67.0 + 1.67.1)** 🔴 Le changement de trimestre remet le contexte à zéro EN SILENCE et ne redessine pas le Cadre — créé 10 août 2026 (terrain, re-vérification des portes).
  - **Lu au code** (`trimestres.js:429`, `changerTrimestreActif`) : le switch (1) met `infoCours` et `groupeCoursActif` à **null** ; (2) laisse `chargerDropdownCoursV2()` re-sélectionner « le premier cours » — pas le groupe-cours qui était ACTIF dans la liste du trimestre cible ; (3) ne rafraîchit ni la barre de progression de configuration (`mettreAJourBarreContexte`) ni les formulaires du Cadre (seuls le calendrier et le bandeau d'archive sont régénérés).
  - **Conséquences terrain observées (10 août)** : le stepper du Cadre garde l'avance du trimestre QUITTÉ (A26) après bascule vers H26 ; « Aucun groupe-cours sélectionné » alors que h2026 en a deux dont un actif ; et l'en-tête est passé de **gr.00008 (Mar-Jeu, l'actif d'hier)** à **gr.00002 (Lun-Jeu)** après l'aller-retour — ⚠ **une bascule silencieuse du groupe actif est possible**, à confirmer par la sonde #159 (§1).
  - ✅ **LIVRÉ** : (A) le handler rappelle `mettreAJourBarreContexte` + `populerDropdownGroupeCoursV2` ; (B) **la cause racine de la bascule 00008→00002 trouvée** — `peuplerDropdownGroupeCoursActif` prenait `groupesCours[0]` quand le pointeur global devient invalide (à CHAQUE bascule) : il prend désormais le groupe marqué `actif===true` (SSOT #130), le premier en repli ; (C) 4 tris gardés contre un `nom` absent (collatéral : la liste ne s'affichait plus, le tirage échouait en silence). Un SEUL mécanisme d'activation — le patch redondant de `trimestres.js` retiré avant commit. Sentinelle 9 cas, 3 break-tests ROUGE, vérifié au navigateur. Détail : SUIVI-BUGS #161.
  - ⚠⚠ **SUITE 1.67.1 — le retour terrain de Grégoire a montré que (A) était incomplet, et la cause est la MÊME QUE #444 le matin même** : le formulaire Groupe-cours ne se vidait toujours pas parce que **`afficherEtatVideGroupeCoursV2` n'a jamais été exportée** de son IIFE (`trimestre-v2-groupes-cours.js`). L'appel étant gardé par `typeof … === 'function'`, la garde sortait en SILENCE — donc **le correctif #332, livré pour réinitialiser ce formulaire au changement de trimestre, n'a pas tourné une seule fois depuis sa livraison.** ⮕ **Un garde défensif sur un nom de fonction inexistant ne proteste pas : il absorbe.** Deux exports ajoutés (`afficherEtatVideGroupeCoursV2`, `mettreAJourCarteResumeGroupeCoursV2`), appels préfixés `window.`, et la sentinelle vérifie désormais **l'EXPORT réel** — pas la présence de l'appel, qui ne dit rien.
- [x] **#445** 🟡 Liens objectif↔activité : l'affordance manquante du tracé + la légende des pastilles — créé 10 août 2026 (terrain §2.2 élucidé), **LIVRÉ le 10 août au soir (1.68.0)**.
  - **Le constat qui clôt le faux-bug §2.2** : Grégoire tentait de relier une activité à un objectif **en traçant un lien** — canal qui n'existe pas (#403 a choisi les cases déclaratives de l'Inspecteur). Le canevas apprend à glisser des liens partout : l'utilisateur essaiera toujours.
  - ✅ **Le tracé est branché sur la MÊME écriture** (`definirObjectifsServis`, porte unique — pas un second système). Déposer un lien sur une ligne d'objectif coche la case. La ligne d'objectif **intercepte le dépôt AVANT le nœud qui la contient** : elle vit dans la leçon, donc sans cet ordre le geste retomberait dans le menu de lien.
  - ✅ **Le dépôt AJOUTE, il ne bascule pas** : « ce bloc sert cet objectif » est une affirmation ; un second dépôt ne peut pas raisonnablement vouloir dire l'inverse. Le décochage reste à l'Inspecteur, là où l'état est visible.
  - ✅ **Les refus sont DITS** (type non servant · bloc d'une autre leçon), et c'est tout l'objet de l'item : un geste sans effet et sans message est indiscernable d'une panne. ⚠ Le refus « autre leçon » n'est pas défensif : `objectifsServisPar` filtre à la leçon parente, donc écrire un id étranger produirait **une case cochée que la lecture écarterait** — un mensonge silencieux.
  - ✅ **La légende** vit dans UNE fonction (`legendePastillesObjectifHTML`) appelée par **deux** surfaces : l'Inspecteur de la LEÇON (atteignable au doigt depuis #444 — c'est le point : sur iPad il n'y a pas de survol, donc l'infobulle `title` n'existait pas) et la **page 5 du guide**. Affichée seulement si la leçon porte des objectifs. Guide enrichi du geste de dépôt.
  - ✅ **Vérifié AU NAVIGATEUR** (Chromium, vrai `index.html`) : l'écriture, la bascule de la pastille `invitation` → `servi`, le toast, la légende présente sur une leçon à objectifs et **absente** sur une leçon sans objectif, les cases #403 intactes sur l'activité. ⮕ Et un piège évité par là : le DOM préfixe les ids (`planif-…`) — la résolution `etat.noeuds.get(leconEl.id)` ne tenait que parce que l'état porte le même préfixe, ce qu'aucun test de source n'aurait montré.
  - ⚠ **Non vérifié au navigateur, et c'est dit** : la séquence pointer complète (pointerdown sur le port → pointerup sur la ligne). Le canevas d'Alignement ne se révèle pas en headless (section conditionnée) : les rects valent 0×0 et `elementFromPoint` ne vise rien. L'ordre d'interception est donc couvert par un **cliquet de source**, déclaré comme tel dans la sentinelle. ⮕ **À passer au terrain sur iPad et sur Mac.**
  - ✅ Sentinelle `sentinelle-depot-objectif-445` (13 cas). **8 break-tests, 8 ROUGE** — ⚠ dont **un resté VERT au premier jet, et la faute était dans le test** : il comptait les lignes contenant `legendePastillesObjectifHTML()` avec un seuil « ≥ 2 », or la **ligne de déclaration** en fait partie ; retirer l'appel de l'Inspecteur laissait déclaration + guide = 2. Resserré sur le compte EXACT d'appels, déclaration exclue.
- [x] ⚠️ **#444 LIVRÉ 10 août 2026 (1.66.0)** Chantier tactile Alignement : l'Inspecteur atteignable au doigt + la palette qui déborde l'iPad — créé 10 août 2026 (terrain iPad de Grégoire, 3 retours convergents).
  - **Le fait déclencheur, qui clôt la question ouverte depuis le 8 août** : *le double-clic n'ouvre PAS l'Inspecteur sur iPad* (constat terrain, porte 1.60). Tout l'Inspecteur — durée, semaine, objectifs servis, **rétroaction formative #424 Lot E** — n'est donc atteignable au doigt que par le bouton 🕵️ du bas de la palette…
  - **…et ce bouton est précisément CE QUI EST COUPÉ** : la palette Nœuds (18 pastilles en 6 familles + boutons du bas) dépasse la hauteur de l'écran iPad — capture du 10 août : la Corbeille est le dernier élément visible, 🕵️ Inspecteur et 📖 Guide sont hors écran. Les deux défauts se verrouillent mutuellement.
  - **Décision de PRINCIPE de Grégoire (10 août)** : déplacer les boutons du bas de la palette dans la barre d'outils. ⮕ **Accord de Claude avec une nuance** : oui pour les boutons d'ACTION (🕵️ Inspecteur, 📖 Guide) — la barre est toujours visible, cibles 44 px possibles ; ⚠ **la Corbeille n'est pas un bouton, c'est une CIBLE DE DÉPÔT** (résolution par géométrie, #433) — l'envoyer dans la barre d'outils (en haut) allongerait le geste de suppression et croiserait tout le canevas. Contre-proposition : la corbeille devient **flottante, ancrée au bas du canevas, visible seulement pendant un drag** (elle s'arme déjà au drag — la détacher de la palette règle l'iPad sans changer le geste).
  - **Pour l'Inspecteur au doigt, en complément du bouton dans la barre** : un **double-tap manuel** (2 pointerdown < 300 ms sur le même bloc) qui appelle l'ouverture — même sémantique que le double-clic desktop, zéro nouveau concept, pas de conflit avec le drag (contrairement au tap long, qui se déclencherait pendant les déplacements).
  - ✅ **LIVRÉ** : les 3 arbitrages honorés. Boutons en barre d'outils · double-tap tactile (300 ms / 30 px, en capture, sans consommer l'événement — le drag #148 reçoit toujours le sien) · accordéons persistés · corbeille flottante au canevas (`position: fixed` — ancrée au wrapper elle tombait 290 px sous l'écran). Zéro-dette : `.planif-palette-bas-btns` et `.planif-palette-aide-btn` retirées du CSS. Sentinelle `sentinelle-tactile-alignement-444.test.js` (12 cas, 4 break-tests ROUGE) ; 4 sentinelles voisines retargetées (balisage `<div>` → `<button>`) et re-break-testées. Détail : SUIVI-BUGS #159.
  - ⚠ Ce chantier touche `planification-carte.js` (Pointer Events #148/#433) — reprendre les sentinelles de la corbeille (3 sorties anticipées, géométrie) si elle bouge. Validation finale = iPad réel (WebKit invérifiable en conteneur).
- [x] **#443** Le wizard offrait encore « Par objectifs d'apprentissage » — dernier vestige du paradigme abattu par #396+#435 — créé 10 août 2026, **LIVRÉ le 10 août au soir (1.69.0)**. ✅ **DÉCISION GRÉGOIRE (10 août)** : *garder l'étape en écran d'information*, plutôt que la sauter (11 → 10).
  - **Le constat** : l'étape 3/11 « Approche d'évaluation » (`wizard-pratique-v2.js:800`) propose toujours la carte « Par objectifs d'apprentissage ». #396 (D2, 5 août) l'avait **reroutée** (le calcul créé est `conversion_niveaux`, commentaire :2659) au lieu de la retirer ; #435 (9 août) a abattu le moteur STD par-objectifs sans repasser par cette surface. L'utilisateur choisit donc un paradigme dont la promesse (« la note selon le niveau atteint pour chaque objectif ») **n'est plus tenue par aucun moteur** — le défaut de naissance (aucun code n'écrit le lien évaluation→objectif) est le motif même des deux ablations.
  - ⚠ **C'est la confusion exacte que le terrain a produite** : la porte 1.63 dit « plus de Par objectifs », le wizard le propose encore. Deux surfaces, deux vérités.
  - **Recommandation** : retirer la carte ; l'étape à choix unique **saute** pour les créations neuves (11 → 10 étapes) ; les configs stockées `approcheEvaluation: 'par-objectifs'` s'ouvrent en ÉDITION sur leur structure réelle avec avertissement console (patron de normalisation lecture seule #396/#435 — aucune réécriture spontanée). Branche `config-objectifs-definition` : morte après ça, à retirer dans le même geste (zéro-dette).
  - ✅ **Livré** : carte retirée · étape CONSERVÉE avec sa carte unique **pré-cochée** (le collecteur lit `input:checked`, donc sans `default` il faudrait cliquer une option sans alternative) · écran d'information qui NOMME l'appui sur le portfolio.
  - ✅ **Zéro-dette élargi au réel** : trois étapes purgées, pas une — `config-objectifs-definition`, **`mode-calcul-objectifs`** et **`config-mode-calcul`** devenaient toutes inatteignables. Avec elles : la branche d'écriture `configuration.objectifs`, la ligne « Mode de calcul » du récapitulatif, le libellé mort, et l'aiguillage à trois voies de `deduireTypePratique` (un aiguillage dont deux sorties sont mortes finit par être relu comme un choix).
  - ✅ **Legacy** : une config stockée `approcheEvaluation: 'par-objectifs'` s'ouvre sur le portfolio avec un `console.warn [#443]`, **sans mutation de la source** — patron de normalisation lecture seule #396/#435, vérifié par un cas dédié.
  - ⚠ **Quatre sentinelles voisines mises en accord avec la décision, pas contournées** : le **golden master `STD_obj` est RETIRÉ AVEC la fonctionnalité** (un golden réaligné sur le code qu'il surveille ne surveille plus rien) · le round-trip « objectifs » (#132) est remplacé par l'invariant inverse (s'ouvre sur portfolio, source non mutée, conversion DITE) · le garde-fou « nombre d'objectifs » (#319 a4) cède sa place au cliquet d'absence · le cas « reprises » est **reporté** sur le portfolio plutôt que supprimé.
  - ⚠⚠ **Deux pièges rencontrés, tous deux instructifs** : (1) **mon propre commentaire** citant le jeton retiré par #396 a fait rougir son cliquet d'absence, qui grep le fichier entier — le piège de la sous-chaîne, cinquième fois en trois jours ; note laissée sur place pour la prochaine instance. (2) le report du cas « reprises » sur le portfolio a rougi : **la branche portfolio ne range pas les reprises au même endroit** que la sommative (`configuration.portfolio.reprisesPermises`, pas `configuration.reprises`) — j'avais supposé une symétrie que le code n'a jamais eue.
  - ✅ **Vérifié au navigateur** : une carte, pré-cochée, lue par le collecteur, écran d'information présent, trois étapes purgées. **7 break-tests, 7 ROUGE** — dont un qui a exigé d'exposer `genererRadioCards` : qu'une définition porte `default` ne prouve pas que le RENDU pré-coche, et c'est le rendu que l'utilisateur voit.
- [x] 📐 **#449 LIVRÉ 19 août 2026 (1.88.0)** La suppression d'une fiche de cours devrait vivre dans la BIBLIOTHÈQUE, pas dans le formulaire du Cadre — créé 10 août 2026 (proposition Grégoire, après avoir cherché le bouton au mauvais endroit).
  - ✅ **LIVRÉ (1.88.0)** — la décision du 11 août (porte 3.2) exécutée, ses deux conditions tenues dans le même geste : (1) le menu ⋮ de chaque fiche porte « Retirer de ma sélection » (réversible, neutre) ET « Supprimer la fiche » (définitif, stylé danger, libellé « tous trimestres ») — sections « ma sélection » ET « disponibles » ; (2) **le garde de dépendances arrive en même temps** : `recenserDependancesCours` + `supprimerFicheCoursAvecGarde` (`js/cours.js`, registre `SUFFIXES_FK_COURS` partagé avec `_diagnostiquerModeleCours`), REFUS dès que la fiche porte la moindre donnée (productions, étudiants, évaluations, présences, snapshots — **plus strict que l'outil console**, qui garde le chemin expert `{forcer}` pour le ménage de test). Le message de refus LISTE ce qui pend, trimestre par trimestre. Cas supprimable = fiche + groupes-cours VIDES ; les doublons #442 au même id partent ensemble ; `infoCours` nulifié s'il pointait la fiche.
  - ✅ **Zéro suppression nue** : `supprimerCoursV2` (Cadre) passe par le MÊME garde — son ancienne écriture directe du magasin est retirée ; absence de la fonction = refus BRUYANT (pas de `typeof` muet, leçon #161/#444). Sentinelle `sentinelle-suppression-fiche-cours-449.test.js` (9 cas, **5 break-tests ROUGE**), parcours éprouvé au Chromium (menu 3 entrées, refus sur fiche pleine, confirm refusé n'écrit rien, suppression ciblée). Vitest 2762/2762. ✅ **PORTE TERRAIN CLOSE le 20 août : 11/11, zéro échec** (refus sur la vraie fiche depuis les deux surfaces, cycle complet sur fiche de test, iPad) — en chemin, elle a trouvé **#458** (fiche neuve invisible de la Bibliothèque, corrigé 1.88.1, confirmé terrain). Plus rien de dû sur cet item.
  - ✅ **Vérification demandée (dernier ⮕) faite** : `retirerCoursDeBibliotheque` reste TEL QUEL — poser `actif=false` au retrait est cohérent (un cours hors sélection ne doit pas rester le cours actif) ; il ne touche pas `infoCours` (comportement historique, inchangé — à revoir seulement si un symptôme réel le met en cause, cf. la « 4ᵉ source de cours actif » notée en queue de #394).
  - **Constat vérifié au code** : `cours` est la SEULE bibliothèque sans suppression par fiche. `supprimerGrille` (`grilles.js:823`) et `supprimerEchelle` sont dans la liste, à côté de « Dupliquer » ; `supprimerProduction` aussi. La bibliothèque de cours n'offre que `ouvrirFilePickerImportCours` et `partagerTousLesCours` — la suppression est exilée dans le Cadre (Trimestre → Cours → sélectionner → **Modifier** → Supprimer), donc en mode édition d'un formulaire, après trois gestes.
  - ⮕ **Preuve d'usage** : Grégoire a cherché dans la bibliothèque, ne l'a pas trouvée, et a demandé si on pouvait supprimer autrement. L'exception est exactement là où elle coûte.
  - ⚠ **CONDITION 1 — deux gestes DISTINCTS, pas un.** Le magasin `cours` est **global, non namespacé** : une fiche est partagée par tous les trimestres. La bibliothèque porte donc déjà deux actions de nature différente — « Retirer de ma sélection » (`retirerCoursDeBibliotheque`, réversible, pose `dansBibliotheque=false`) et une suppression définitive tous-trimestres. Les grilles n'ont pas ce dédoublement. Si Supprimer entre dans la bibliothèque, l'écart doit se voir au premier coup d'œil, sinon on troque une friction contre une confusion — et celle-là coûte des données.
  - ⚠ **CONDITION 2 — le garde de dépendances arrive EN MÊME TEMPS.** `supprimerCoursV2` retire la fiche et laisse orphelins les groupes-cours, productions, évaluations et présences qui la référencent (famille #154). Rendre le geste plus accessible sans ce garde, c'est rendre le danger plus accessible. ⮕ La logique existe déjà : `scripts/reparation-retirer-cours.js` recense les dépendances et REFUSE quand un groupe-cours dépendant porte des étudiants, des évaluations ou des présences. Elle a sa place dans l'interface.
  - ✅ **DÉCISION PRISE — 11 août 2026, porte 3.2 : le MENU ⋮ portant les deux actions.** Chaque fiche de la bibliothèque reçoit un menu ⋮ avec « Retirer de ma sélection » (réversible) et « Supprimer la fiche » (définitif, tous trimestres). ⮕ Le second ouvre l'avertissement qui **LISTE ce qui pend au cours** — les deux conditions ci-dessus sont tenues dans le même geste, elles ne se négocient pas séparément. Le libellé doit porter le « tous trimestres » : c'est ce que le magasin global rend vrai et que rien à l'écran ne dit aujourd'hui.
  - ⮕ Vérifier au passage si `retirerCoursDeBibliotheque` (qui pose aussi `actif=false`) doit rester tel quel une fois la suppression disponible au même endroit.

- [ ] **#450** ⚠️ **ACTION GRÉGOIRE** — renommer les deux échelles « IDME et niv 0 » d'a2025 — créé 11 août 2026 (porte 3.3 tranchée).
  - **Ce ne sont pas des doublons** : ids différents, et **toutes deux réellement référencées**. ✅ **Confirmé au relevé du 11 août** (`diag448()` sur ses données Safari) : **344 et 72 citations**. La décision de RENOMMER plutôt que fusionner est donc la bonne — une fusion aurait eu 72 références à repointer, pas 4. Un script ne tranche jamais ça ; c'est pourquoi la porte existait.
  - ✅ **Décision du 11 août : RENOMMER LES DEUX**, distinctement. Aucune référence n'est touchée : le renommage ne change que le libellé, pas l'id. La fusion aurait exigé de repointer 4 (ou 6) citations — migration de données, écartée pour un problème d'affichage.
  - ⮕ Geste d'interface, aucun code. À faire dans a2025, dans **les deux navigateurs** (les magasins sont des îles — cf. #346).

- [ ] 🔴🔴 **#454** À l'import, une ressource renumérotée n'est REPOINTÉE NULLE PART — créé 11 août 2026 (cause racine de la branche H26 de #453, **encore vivante**).
  - ✅ **VECTEUR FERMÉ (18 août 2026, 1.87.4)** — la décision 📐 ci-dessous est tranchée dans le sens de la 1.75.0 : **ne pas renommer du tout**. `verifierUniciteIds` (`import-export.js`) fusionne désormais par identité : un doublon interne au contenu IDENTIQUE (signature #448, clés triées, id exclu) est **écarté** — plus de renommage, donc plus rien à repointer, plus de fantômes. Le renommage ne subsiste que pour un VRAI conflit (même id, contenu différent), où garder les deux reste le seul choix qui ne perd rien. Les deux appelants héritent du correctif : `chargerCodex` (codex.js:633, le chemin que Grégoire emprunte à chaque codex) et le filet de `fusionnerParIdentite`. Sentinelle `tests/unit/sentinelle-454-doublon-identique-ecarte.test.js` (9 essais) ; break-test fait : garde d'identité retirée ⇒ 5 rouges.
  - ⏳ **RESTE (geste Grégoire, navigateur)** : exécuter la réassignation des données réelles déjà outillée (`scripts/reassignation-454-grilles-h26.js`, dry-run par défaut) — le correctif ferme la porte, il ne répare pas les dégâts passés.
  - **Le mécanisme** : `verifierUniciteIds` (`import-export.js:197-216`) traite une collision d'identifiant en RENOMMANT l'entrée entrante :
    ```js
    item.id = genererIdUnique(ancienId.replace(/[0-9_]+$/, '').replace(/-+$/, '_'));
    ```
    Elle ne repointe **rien** : ni les productions qui citent la grille, ni les évaluations, ni la clé `cartouches_{grilleId}` qui porte l'ancien id dans son NOM.
  - **La signature se lit à l'œil nu dans les données de Grégoire**, et c'est ce qui transforme l'hypothèse en constat :
    ```
    cartouche_1770743136309_jl11zpy74   (l'original, 10 fév. 2026)
    cartouche_1770743136309_jl11zpy + 1774267023190_a_111810808b56
                                 ↑ les deux derniers caractères AMPUTÉS par
                                   replace(/[0-9_]+$/, ''), puis suffixe collé
    CART_GENERIQUE → CART_GENERIQUE1774267023190_b_9cd25ba93c8b
    ```
    Horodatages des suffixes : **23 mars 2026** et **11 avril 2026** — deux imports.
  - ⚠ **DEUX APPELANTS, ET LE PLUS EXPOSÉ N'EST PAS CELUI QU'ON CROIT** :
    · `codex.js:632-633` — `chargerCodex` l'applique à toute « bibliothèque partagée » (`grillesTemplates`, `echellesTemplates`, `cartouches_*`, `bibliotheque*`). **Grégoire charge des Codex régulièrement.** Ce chemin est intact et ne remappe rien.
    · `import-export.js:187` — filet de fin de `fusionnerParIdentite` (livré ce matin en 1.75.0), pour les collisions INTERNES à la liste fusionnée. Le chemin d'import principal, lui, remappe (`remapGrilles`/`remapEchelles`).
  - ⮕ **UNE CAUSE, TROIS SYMPTÔMES DÉJÀ OBSERVÉS** :
    1. les grilles/échelles H26 citées par les productions deviennent introuvables ⇒ le formulaire affiche « Aucune » ⇒ le prochain enregistrement blanchit la référence (**branche H26 de #453**) ;
    2. la clé `cartouches_{ancienId}` n'est pas renommée ⇒ **magasin orphelin** (les 6 rapportés le 11 août au matin par `inspecterOrphelins448` — ⚠ **NE PAS LES SUPPRIMER : ce sont les seuls témoins de l'ancien identifiant**) ;
    3. les évaluations gardent l'ancien id tandis que d'autres prennent le nouveau ⇒ **témoins contradictoires** (les 3 CAS C sur cartouches du dry-run #453).
  - 📐 **Ce qu'il faut décider avant de coder** : renommer et remapper (il faut alors un registre des citations : productions, évaluations, clés `cartouches_*`), ou **ne pas renommer du tout** et fusionner par identité comme le fait déjà `fusionnerParIdentite` (#448). ⮕ La seconde est cohérente avec la 1.75.0 : un identifiant identique avec un CONTENU identique n'est pas une collision, c'est la même chose.
  - ✅ **IDENTIFICATION FAITE (11 août)** — `scripts/identification-454-grilles-fantomes.js`. Les magasins `cartouches_{ancienId}` survivants portent l'EMPREINTE de la grille disparue : chaque cartouche recopie les critères de sa grille à sa création (`cartouches.js:417`), **identifiants compris**. Les mêmes identifiants de critères se retrouvent dans 3 grilles vivantes de H26 — dont les identifiants portent eux-mêmes la marque de la renumérotation :
    ```
    grille_1770742838756_23q82vbsk → GRILLE_1782504228330_a_4b469c6b7b5e  « Grille-4 H26 »        (artefacts 1,3,5,8,9)
    grille_1772187755149_uq1oiiafa → GRILLE_1782504228322_1_6398d555452d  « Grille-5 FR-HOLIS H26 » (artefacts 2,4,7)
    GRILLE1759529438501           → GRILLE_1782504228333_f_db90dd7b3554  « Grille-5 FR-ALGO H26 »  (artefacts 6,10)
    ```
    ⮕ **PREUVE, pas ressemblance.** HOLIS et ALGO ne partagent PAS leurs identifiants de critères, seulement leurs noms — le classement les sépare correctement. Grégoire a reconnu les trois (11 août).
    ⚠ **Deux défauts corrigés en r2** : le pack démo est une COPIE du vrai matériel, donc ses grilles sortaient « PREUVE » à égalité (écartées des candidates, mais gardées pour DÉTECTER un orphelin) ; et la grille H26 descendant de celle d'A25, le récapitulatif recommandait la version **A25** pour des artefacts **H26** — soit la contamination #340 fabriquée par l'outil censé la réparer. À preuve égale, le trimestre qui CITE commande désormais.
    ⮕ Sur les 8 magasins orphelins, **3 seulement** concernent le travail réel ; les 5 autres sont des restes de démo/exemples (bio, chimie, générique).
    ⮕ L'échelle manquante des 9 artefacts (`1767389426695`) a les niveaux **0 I D M E** — l'échelle « IDME et niveau 0 ». Elle ne se prouve pas par identifiants : indice, pas preuve.
  - ✅ **RÉASSIGNATION LIVRÉE (11 août)** — `scripts/reassignation-454-grilles-h26.js`, dry-run par défaut, `annuler454()`.
    ⮕ **Repointer ne suffit pas** : les cartouches vivent encore dans le tiroir de l'ANCIEN identifiant et le sélecteur lit `cartouches_{grilleId}`. Le script les DÉMÉNAGE d'abord (fusion par identité, #448), puis repointe.
    ⚠ **La table de correspondances est une donnée TAPÉE À LA MAIN — le script la REVÉRIFIE contre les données avant d'agir** (magasin présent, grille vivante présente, critères identiques). Une correspondance qui ne se revérifie pas est refusée, même si elle vient de moi. Un script qui fait confiance à son auteur n'est pas un garde-fou.
    ⚠ L'échelle n'est écrite que sur ordre explicite `{ echelle: 'ID' }` — les grilles sont établies par preuve, l'échelle non.
    ⚠ Ne touche jamais : les ÉVALUATIONS (mémoire ET témoin du diagnostic), les tiroirs d'origine, un champ déjà renseigné, le pack démo.
    ⮕ **Défaut trouvé PAR le banc** : quand un déménagement était refusé (même identifiant, contenu différent), l'identifiant existait quand même dans le tiroir cible — il paraissait « joignable » et l'artefact recevait **la cartouche de quelqu'un d'autre**. « Joignable » veut dire « celle que le témoin désigne », pas « quelque chose qui porte le même numéro ».
    ⮕ **Break-test** : banc à 13 essais, onze gardes retirées une à une — chacune fait rougir. ⚠ L'essai « copie profonde » était INERTE tant que le banc clonait à chaque lecture ; il ne voyait pas une mutation qui fuit vers le magasin témoin. Corrigé en faisant rendre au faux `db` l'objet VIVANT, comme le cache mémoire de `db.js`.
  - ✅ ~~⏳ À reproduire avant de corriger LE VECTEUR~~ — **fait le 18 août** : la sentinelle reproduit le renommage fantôme (banc rouge sur l'ancien code), puis le correctif la rend verte. La porte est fermée ; la réassignation ci-dessus reste le geste de réparation.

- [ ] 🔴 **#453** Grille / échelle / cartouche affichent toutes « Aucune » sur les artefacts H26 — créé 11 août 2026 (constat terrain Grégoire, capture).
  - **Symptôme** : sur ses artefacts H26, les TROIS sélecteurs sont vides. Survenu le même jour que #452 (dates d'échéance de l'automne sur les artefacts d'hiver).
  - ⮕ **CE N'EST PAS TROIS PERTES, C'EST UNE PERTE ET DEUX CONSÉQUENCES** (cascade lue au code, `productions.js:778-783`) : `selectGrille.value = prod.grilleId || ''` — un `<select>` à qui on assigne un id ABSENT de ses options retombe **silencieusement** sur `''`, c'est-à-dire « Aucune ». Et `peuplerCartouchesProduction(grilleId)` ne peuple rien sans grille résolue. **Une seule référence cassée vide les trois.**
  - ⚠ **CE N'EST PAS LA PURGE #448 DU 11 AOÛT.** Elle n'a retiré que des cartouches citées 0 fois, dans 2 magasins, et n'a jamais touché `grillesTemplates` ni `echellesTemplates`. **Et le fait qui tranche** : le relevé `diag448()` du MATIN, avant toute purge, rapportait déjà `cartouches_GRILLE_1782504228322` (Grille-5 H26) à **0 citation** — les références étaient donc coupées AVANT.
  - 📐 **DEUX HYPOTHÈSES, une mesure les sépare** (`scripts/diagnostic-453-references-productions.js`, lecture seule) :
    · **H1 — contamination inter-trimestre (#340)** : `h2026_productions` porterait le contenu d'`a2025_productions`. Les `grilleId` viseraient alors des grilles d'A25, absentes du magasin H26 ⇒ « Aucune ». **Cette hypothèse expliquerait AUSSI les dates d'échéance de l'automne (#452) ET les magasins de cartouches H26 à 0 citation. Une seule cause, trois symptômes.**
    · **H2 — références introuvables ou vides** : la perte serait survenue à l'écriture, pas par substitution. Autre cause, autre correctif.
  - ⮕ **La question qui tranche** : l'id référencé existe-t-il AILLEURS (autre trimestre) ou NULLE PART ? Le script rend, par artefact, ce que la référence vise et où la cible se trouve — puis un verdict H1/H2.
  - ⮕ Éprouvé au navigateur sur trois jeux (H1, H2, témoin sain). ⚠ Le pack démo est ÉCARTÉ du verdict : ses 11 productions portent des références vides par construction et faisaient conclure « références vides » sur un jeu parfaitement sain — un diagnostic qui compte la démo diagnostique la démo.

  - ### 📊 RELEVÉ r1 (11 août, données réelles de Grégoire) — **LES DEUX HYPOTHÈSES TOMBENT**
    ```
    Saines 13 · ⚠ AILLEURS 0 · ⛔ INTROUVABLES 0 · vides 31
    a2025_productions (11 artefacts) · h2026_productions (11 artefacts)
    ```
    · **H1 — contamination inter-trimestre : RÉFUTÉE.** Zéro référence vise un autre trimestre. C'était l'hypothèse principale ; elle est fausse. **Et #452 n'est donc PAS un symptôme de #453** — les deux défauts sont distincts, la consigne « ne pas coder #452 » tombe avec H1.
    · **H2 — cibles disparues : RÉFUTÉE.** Zéro référence introuvable ; aucune grille, aucune échelle n'a été effacée. La purge #448 est hors de cause une deuxième fois.
    · ⚠ **`a2025_productions` est touché autant que `h2026_productions`.** Donc rien de propre à H26, rien de lié à la reprise A25→H26.
    · Le compte ferme : 22 artefacts × 2 champs = 44 ; 13 saines + 31 vides = 44.
  - ### ⚠ CORRECTION QUE r1 SE DOIT À LUI-MÊME
    r1 concluait « la perte s'est produite à l'écriture ». **Il n'en savait rien** : il mesurait **vide** et concluait **perdu**. Un artefact auquel on n'a jamais assigné de grille est vide lui aussi, légitimement. Cinquième diagnostic lu-au-code renversé par la mesure en deux jours — et cette fois c'est le VERDICT du script, pas son mécanisme, qui dépassait sa mesure.
  - ### 🔎 MÉCANISME SUSPECT — un repli d'affichage qui devient une perte, et qui EFFACE SA PROPRE TRACE
    ```
    productions.js:778   selectGrille.value = prod.grilleId || '';   ← l'affichage retombe sur ''
    productions.js:988   const grilleId = grille ? grille.value : ''; ← l'enregistrement relit '' et l'écrit
    ```
    Un `<select>` à qui on assigne un id absent de ses options retombe **silencieusement** sur `''`. Ouvrir un artefact dans cet état, corriger un détail, enregistrer : le `''` de l'AFFICHAGE devient le `''` du DISQUE. ⮕ **C'est pourquoi le diagnostic ne voit plus rien de cassé : l'écriture a effacé la preuve de ce qui l'a causée.** Il ne reste que le vide.
    ⮕ Défaut réel **indépendamment** de cette enquête : une référence qu'on ne sait pas résoudre doit être **préservée et signalée**, jamais blanchie en silence. (`afficherFormProduction` peuple bien les options AVANT d'assigner — la course est écartée, ce n'est pas l'ordre qui est en cause.)
  - ### ⏭ PASSE r2 LIVRÉE — vide-par-perte ou vide-d'origine ?
    Deux témoins vivent **ailleurs** que dans le champ effacé, donc hors d'atteinte de ce chemin d'écriture :
    · **TÉMOIN 1 — les évaluations.** Chaque évaluation enregistre son propre `grilleId`/`echelleId` (`evaluation-chargement.js:593`). Champ vide + évaluation qui nomme une grille = la production **avait** cette grille. Décisif, et **récupérable**.
    · **TÉMOIN 2 — `bibliothequeProductions`** (globale, hors trimestre) : le gabarit d'origine garde ses références ; la copie porte `idOriginal` qui y remonte.
    ⮕ Verdicts séparés : `PERTE AVÉRÉE` / `INDÉCIDABLE` (aucun témoin — on refuse de conclure) / `sans objet` (portfolio conteneur). Un tableau **RÉCUPÉRABLES** dit quoi rendre, à quel artefact, et si la cible existe encore dans le trimestre.
    ⮕ **Break-test fait** : banc à 8 essais, six gardes retirées une à une (éval remplacée, autre production, homonymes de titre, exclusion démo, vide-sans-témoin, portfolio) — **chacune fait ROUGIR le banc**. Le script discrimine, il ne se contente pas de tourner.
  - ### 📊 RELEVÉ r2 (11 août, Chrome = SSOT) — **PERTE AVÉRÉE, ET RÉCUPÉRABLE**
    ```
    saines 13 · ailleurs 0 · introuvables 0 · PERDUES 27 · indécidables 0 · sans objet 4
    a2025_productions (11 artefacts, 303 évaluations) · h2026_productions (11 artefacts, 408 évaluations)
    ```
    · **27 champs vides que les témoins contredisent, et ZÉRO indécidable.** Ce n'est pas « jamais assigné » : c'est assigné, puis effacé. Les 711 évaluations au dossier nomment encore les ressources.
    · Le compte ferme : 13 + 27 + 4 = 44.
    · ⮕ La question qui reste ouverte, et qui commande le correctif : **les cibles retrouvées vivent-elles encore dans le trimestre de l'artefact ?** C'est ce que le dry-run de la réparation rend.
  - ### 🛠 OUTIL DE RÉPARATION LIVRÉ — `scripts/reparation-453-references-productions.js`
    Dry-run par défaut (`await reparer453()`), écriture sur `{ executer: true }`, filet même-session `annuler453()`. Même logique de témoins que le diagnostic r2, **volontairement identique** : une réparation qui interroge ses témoins autrement que la mesure répare autre chose que ce qui a été diagnostiqué.
    · **CAS A** — cible dans le même trimestre ⮕ RESTAURÉE.
    · **CAS B** — le témoin nomme une cible hors du trimestre ⮕ **REFUS**. Rendre une référence que le formulaire ne sait pas résoudre **réarme le piège** : le prochain enregistrement la reblanchirait, et le témoin pourrait alors avoir disparu. Une réparation qui se re-casse est pire que pas de réparation.
    · **CAS C** — évaluations contradictoires ⮕ **REFUS**. On ne tranche pas entre deux passés à la majorité.
    · `cartoucheId` est mesuré **pour la première fois** ici (hors relevé r2) et rapporté à part — une réparation ne fait pas passer en douce du travail que la mesure n'a pas couvert.
    · ⮕ **Le partage A/B est lui-même un diagnostic** : beaucoup de CAS B ⇒ identifiants périmés (renumérotation à l'import, cf. #448) ; presque que des CAS A ⇒ les références étaient valides et seul le chemin d'écriture les a blanchies.
    · Rapport en **texte copiable**, pas en `console.table` — le relevé r2 est arrivé amputé de ses tableaux et a coûté un aller-retour. Ce qui doit être relu doit pouvoir être copié.
    · ⮕ **Break-test fait** : banc à 11 essais, huit gardes retirées une à une (CAS B, CAS C, champ déjà renseigné, portfolios, cartouche joignable, exclusion démo, dry-run, pré-image d'annulation) — **chacune fait rougir le banc**. ⚠ L'essai « pack démo » était INERTE au premier jet : la démo n'ayant pas de grilles à elle, le test « même trimestre » la refusait déjà et l'exclusion n'était jamais sollicitée. Démasqué par le break-test, corrigé en donnant à la démo son propre magasin de grilles.
  - ### 📊 DRY-RUN DE RÉPARATION (11 août, Chrome) — **CE N'EST PAS UNE HISTOIRE, C'EN EST DEUX**
    ```
    CAS A restaurables 4 · cartouches joignables 9/16 · REFUS 20 + 6 · écritures 13 (a2025 seul)
    ```
    · **A25 — réparable.** Ses grilles n'ont jamais bougé (elles font les 13 « saines »). Seules 4 échelles et 9 cartouches ont été blanchies, **toutes les cibles existent**, tous les témoins sont uniques. ⮕ 13 champs à rendre, sans risque.
    · **H26 — les témoins pointent des FANTÔMES.** Les 20 refus visent des identifiants qui n'existent **dans aucun magasin**. Ce n'est donc PAS « l'écran a effacé une référence valide » : les ressources elles-mêmes ont changé d'identifiant. ⮕ **Voir #454**, qui en est la cause et qui est encore vivante.
    · Les 6 CAS C recoupent deux autres dossiers : 3 échelles A25 partagées entre les deux homonymes « IDME et niv 0 » (**#450** — les renommer lèvera l'ambiguïté), et 3 cartouches H26 dont les évaluations citent à la fois l'ancien et le nouvel identifiant (**#454**).
    · ⚠ `ECHELLE_DEMO` et `CART_GENERIQUE` apparaissent dans des évaluations H26 RÉELLES — à regarder à part.
  - ### ⏭ RESTE À FAIRE
    1. **A25** : `await reparer453({ executer: true })` après backup Codex → 13 champs rendus. Puis **refaire dans Safari** (magasins indépendants).
    2. **H26** : ne rien faire par script. Les grilles existent toujours, sous de NOUVEAUX identifiants — c'est Grégoire qui sait laquelle va avec quel artefact. Réassignation à la main dans l'interface (10 artefacts). ⚠ Les magasins `cartouches_{ancienId}` survivants sont le fil pour reconnaître l'ancienne grille (ligne « trace » du dry-run r2).
    3. ✅ **FAIT (18 août 2026, 1.87.4)** — le chemin d'écriture est corrigé : `poserReferenceSelect` (`productions.js`) réinjecte un id non résolu comme option visible « ⚠ introuvable » — la référence fait l'aller-retour affichage → disque INTACTE, la console la signale, et seul un choix explicite de l'utilisateur l'efface. Couvre grille, échelle, cartouche ET la grille inline des artefacts de portfolio. Sentinelle `tests/unit/sentinelle-453-reference-preservee.test.js` (10 essais, dont un bout-en-bout via `afficherFormProduction` sur un artefact aux trois références fantômes) ; break-test fait : injection neutralisée ⇒ 4 rouges.
    4. ✅ **#454 — vecteur fermé le 18 août (1.87.4)**, voir l'entrée #454. Les gestes 1 et 2 ci-dessus (réparation A25 par script, réassignation H26 à la main) restent à faire par Grégoire.

- [x] 🔴 **#452 LIVRÉ 18 août 2026 (1.87.4)** Reprendre une production de la bibliothèque emporte la DATE D'ÉCHÉANCE du trimestre précédent — créé 11 août 2026 (constat terrain Grégoire, après la clôture).
  - ✅ **CORRECTIF** : la copie de `ajouterProductionIndividuelle` (`productions-bibliotheque-ui.js`) naît désormais avec `dateEcheance: null` ET sans `echeancesParGroupe` (le second porteur, aux `groupeCoursId` du trimestre précédent). Décision appliquée : **vider, pas deviner**. Tout le reste traverse intact (références, pondération, `idOriginal`) ; la branche « production déjà dans le cours » ne touche à rien. Reproduit AVANT correction (banc rouge sur l'ancien code : la date `2025-11-15` d'A25 traversait). Sentinelle `tests/unit/sentinelle-452-reprise-sans-dates.test.js` (5 essais).
  - ⏳ Les trois autres spreads du même patron (`cartouches.js:3464`, `echelles.js:2574`, `grilles.js:2573`) ne portent aucune date de calendrier aujourd'hui — inchangés, à surveiller si une date entre un jour dans ces schémas.
  - **Symptôme, dans ses mots** : « certaines productions de A25 sont les mêmes reprises à l'H26. Maintenant je constate que les dates de remise des travaux à l'hiver sont celles de l'automne précédent. »
  - **Mécanisme (LU AU CODE, non reproduit)** : `ajouterProductionIndividuelle` (`productions-bibliotheque-ui.js:264`) construit la copie par `{ ...prodBiblio, id, idOriginal, dansBibliotheque, dateImport }`. Le spread recopie **tout**, et **seuls quatre champs sont réécrits** — aucun n'est une date de calendrier. `dateEcheance` traverse donc intacte.
  - ⮕ **Vérifié : `dateEcheance` n'est réinitialisée NULLE PART** dans `js/` (grep `dateEcheance: ''` / `: null` / `delete` → 0 occurrence). Ce n'est pas un oubli local, c'est une absence globale.
  - ⚠⚠ **C'EST DATÉ, ET ÇA REVIENT À CHAQUE RENTRÉE.** Une date d'échéance appartient au CALENDRIER d'un trimestre ; une production reprise d'un trimestre à l'autre ne peut pas garder la sienne. Grégoire prépare A26 **en ce moment** en reprenant ses productions : sans correctif, ses productions A26 naîtront avec les dates de H26.
  - ⮕ **Un seul champ concerné** parmi les 22 du schéma de production (audit fait) : `dateEcheance`. `dateCreation`/`dateModification`/`dateImport` sont des horodatages techniques, pas des dates de calendrier.
  - ⚠ **CORRECTION DE CET AUDIT (11 août, en enquêtant sur #453) : il y a un SECOND porteur de dates, et il est plus dangereux que le premier.** `echeancesParGroupe` (`productions.js:1115`) est un objet `{ [groupeCoursId]: { assignee, date } }` — **une date de calendrier par groupe-cours**. Le spread de la reprise l'emporte lui aussi. Pire : ses `groupeCoursId` désignent des groupes du trimestre PRÉCÉDENT, qui n'existent pas dans le nouveau. Et `lireEcheancesParGroupeDepuisFormulaire` ne lit que les groupes AFFICHÉS ⮕ les entrées périmées survivent en silence à chaque enregistrement. **Un correctif qui ne vide que `dateEcheance` laissera le vrai porteur intact en mode multi-groupe.**
  - ✅ **BLOCAGE LEVÉ (relevé r1 de #453, 11 août)** : H1 est réfutée, `#452` n'est donc **pas** un symptôme de `#453`. Les deux défauts sont distincts et `#452` peut être repris pour lui-même — après reproduction, comme prévu ci-dessous.
  - ⮕ **Même patron de spread ailleurs, à auditer dans le même geste** : `cartouches.js:3464`, `echelles.js:2574`, `grilles.js:2573`. Aucune de ces trois ressources ne porte de date de calendrier aujourd'hui — mais le patron est identique, et c'est le patron qui est fautif.
  - 📐 **Décision avant de coder** : à la reprise, faut-il **vider** `dateEcheance` (l'enseignant la ressaisit, rien ne ment) ou **la reporter** sur le calendrier du trimestre cible (plus malin, mais deviner une date est une promesse qu'on ne peut pas tenir) ? ⮕ Vider est le seul choix qui ne fabrique pas de fausse donnée.
  - ⏳ **À REPRODUIRE avant de corriger** — le diagnostic est lu au code. Leçon des 10-11 août : quatre diagnostics lus au code se sont révélés faux, la mesure les a corrigés.
  - ⏳ **Grégoire ressaisit ses dates H26 à la main** (11 août, il les a notées). Le correctif protège les PROCHAINES reprises, pas celles-là.

- [x] **#451 FAIT** ✅ **RENTRÉE A26** — a2026 est porté de Chrome vers Safari — créé et exécuté le 11 août 2026 (porte 2.6 tranchée).
  - ✅ **Vérifié sur pièces, pas sur parole** : `diag448()` en Safari rend `Trimestres déclarés : a2025, h2026, a2026`. La rentrée existe désormais des deux côtés.
  - ⚠ Grégoire a exécuté l'import AVANT le correctif de #448, en connaissance de l'avertissement. Ce que la mesure a trouvé ensuite est consigné dans #448 — et ce n'est pas ce que l'avertissement annonçait.
  - **Constat terrain (10 août)** : Chrome déclare a2025, h2026 **et a2026** ; Safari ne déclare qu'a2025 et h2026. La rentrée se prépare d'un seul côté.
  - ✅ **Décision du 11 août** : Chrome reste le poste de travail, et a2026 doit pouvoir **rejoindre Safari par export/import de codex**.
  - 🔴 **BLOQUÉ PAR #448** — et c'est le point entier : l'import est précisément ce qui duplique cartouches, grilles, échelles, productions et pratiques. Faire le portage avant le correctif, c'est fabriquer les doublons sur les données de la rentrée. **Ordre imposé : #448, puis ce portage.**
  - ⮕ Prévoir une porte terrain dédiée : compter les cinq collections **avant** et **après** le portage, dans Safari.

- [x] **#448 LIVRÉ 11 août 2026 (1.75.0)** 🔴 **REPRODUIT le 11 août — et ce n'est PAS la fonction accusée.**
  - ✅ **CORRECTIF** : `fusionnerParIdentite()` (`import-export.js`) remplace les **9 fusions par renommage**. Une collision d'id déclenche désormais une comparaison de CONTENU (`signatureContenu`, JSON aux clés triées récursivement) : identique ⇒ l'entrant est écarté ; réellement différent ⇒ **les deux sont conservés** et la console le dit. Les deux pré-remaps (échelles `:2195`, grilles `:2220`) sont conditionnés de la même façon — c'est ce qui ferme la forme « magasin fantôme ».
  - ⚠ **RÈGLE DE PRUDENCE ASSUMÉE, ET ELLE EST ASYMÉTRIQUE** : égalité STRICTE, aucune normalisation rapprochante. Croire à tort à l'identité ⇒ on ÉCARTE un élément et on perd ce qu'il portait (irréversible). Croire à tort à la différence ⇒ on garde un doublon (statu quo, nettoyable). ⮕ En cas de doute, on garde. Leçon de #442.
  - ⮕ `nbCartouchesTotal` compte désormais les AJOUTÉES, pas les reçues : sinon l'app annoncerait « 8 cartouches importées » quand aucune n'entre.
  - ⮕ `codex.js:633` n'est PAS touché : il applique `verifierUniciteIds` au lot entrant SEUL avant un `db.set` qui REMPLACE la clé. Ce n'est pas une fusion, donc pas un vecteur.
  - **Sentinelle** `tests/unit/sentinelle-448-fusion-par-identite.test.js` : 16 cas, **7 break-tests, 7 ROUGE**. ⚠ Un est d'abord resté VERT — piège `indexOf` : `-1` quand le motif est absent, et `-1` est inférieur à tout index, donc une assertion d'ORDRE passe quand le code qu'elle protège DISPARAÎT. Helper `ordreStrict()` créé, et **les deux autres assertions d'ordre du dépôt corrigées au passage** (loupe, barre d'alignement).
  - ✅ **OUTIL DE NETTOYAGE LIVRÉ** : `scripts/reparation-448-doublons-import.js`, dry-run par défaut, `annuler448()` en filet de session. Il traite le **CAS A** seulement (copie muette à côté d'un original cité — l'exemplaire gardé est le PLUS cité, pas le premier de la liste) et **REFUSE d'exécuter** si une copie porte un champ absent ou divergent chez l'original. Le **CAS B** (magasin entier dont rien n'est cité) est **rapporté, jamais purgé** : supprimer une grille et son contenu n'est pas une décision de script. Éprouvé au navigateur sur trois scénarios : dry-run, exécution + annulation (orphelins et homonymes vivants intacts), et refus sur champ unique.
  - ✅ **PURGE FAITE DANS CHROME (11 août)** : 83 → 78 éléments, les 5 copies muettes retirées, `GRILLE1759243306842` et `GRILLE_GENERIQUE` disparus du rapport, échelles « IDME et niv 0 » intactes (344/72). ⚠ Le premier dry-run avait REFUSÉ sur `dateImport` — faux positif corrigé en alignant le garde sur `SecuriteHash.CHAMPS_VOLATILES` au lieu d'une règle réinventée.
  - ✅ **`inspecterOrphelins448()` livré** (lecture seule) : répond aux DEUX questions qui permettent de trancher un magasin orphelin — (Q1) la grille parente existe-t-elle encore dans une bibliothèque ? (Q2) le contenu de chaque cartouche existe-t-il déjà à l'identique ailleurs, signature de contenu hors id/grilleId/métadonnées ? Trois verdicts distincts, éprouvés au navigateur : **redondant** (grille disparue + tout en double) · **⛔ contenu unique** (ne pas supprimer, récupérer) · **grille encore présente** (à trancher, elle resterait vide).
  - ⏳ **RESTE — le NETTOYAGE des doublons déjà là** (identiques dans Chrome et Safari) : 5 copies muettes du 24 mars (`GRILLE1759243306842` ×4, `GRILLE_GENERIQUE` ×1) + le magasin fantôme `GRILLE_1782504228322_1_6398d555452d` (8 éléments à 0 citation, ~76 K car.). ⚠ Le vecteur étant bouché, le nettoyage ne se refera plus au prochain import. Vérifier avant retrait que les copies muettes ne portent aucun champ absent de l'original (leçon #442 : « ne rien casser » n'est pas « ne rien perdre »).
  - ~~🔴 EN COURS~~ Réimporter un codex déjà importé **dédouble cartouches, grilles, échelles, productions et pratiques** : `verifierUniciteIds` RENOMME un id en collision et garde les deux — créé 10 août 2026 (dry-run `reparer442()`), **requalifié et escaladé le 11 août**.
  - ⚠⚠ **BLOQUANT POUR LA RENTRÉE A26.** Porte 2.6 tranchée le 11 août : Grégoire prépare a2026 dans **Chrome**, puis veut le **porter vers Safari par export/import de codex**. C'est exactement le vecteur du défaut. **Le correctif doit précéder ce portage**, sinon il duplique sur ses données de rentrée les cinq collections d'un coup.
  - ✅ **REPRODUCTION (11 août, matin)** — bac à sable Node sur la **ligne de fusion réelle** (`import-export.js:2173`) avec la **vraie** `verifierUniciteIds` et la **vraie** fabrique d'ids (`main.js:33`) : un lot de 4 cartouches réimporté donne **8** ; répété, la taille suit **2 → 4 → 6**. Croissance **linéaire à chaque import**, pas un incident isolé.
  - ⮕ **LE MÉCANISME, corrigé** (`js/import-export.js:69`) : `verifierUniciteIds` traite une collision d'id comme un **accident à renommer**, jamais comme le signe que **c'est le même élément**. Elle régénère l'id du second et **conserve les deux**. C'est juste pour deux éléments distincts qui se disputent un id ; c'est faux pour un réimport, où la collision est précisément la preuve de l'identité.
  - ⚠ **PORTÉE : 10 sites d'appel, 5 collections.** `import-export.js` — échelles `:2084`, grilles `:2109`, productions `:2146`, cartouches `:2173`, pratiques `:2381`, grilles `:2420`, échelles `:2448`, productions `:2510`, cartouches `:2539` — plus `codex.js:633`, qui l'applique à **toute** collection à l'import de codex. Les pré-contrôles des échelles (`:2067`) et des grilles (`:2092`) font la **même** chose en amont : ils renomment aussi.
  - ⮕ **Et c'est pourquoi les copies sont introuvables après coup** : la copie ne reçoit **aucun `idOriginal`**. Rien ne peut plus la relier à sa source — d'où les doublons « cités 0 fois » du relevé. ⚠ Comparer avec `ajouterCartoucheIndividuelle` (`cartouches.js:3462`), qui pose `idOriginal` **et** s'en sert pour retrouver la copie : le chemin individuel est protégé, le chemin d'import ne l'est pas. **L'asymétrie est le vrai constat.**
  - ~~`ajouterCartouchesABibliotheque()` pousse sans contrôle d'identité~~ — l'accusation du 10 août. La fonction a bien un `push` nu (`cartouches.js:3682`) et mérite le même traitement, mais **elle ne peut pas avoir produit la signature observée** : elle réutilise `cartouche.grilleId` et ne génère jamais d'id `GRILLE_`. Or le lot de juin en porte un. *Diagnostic lu au code, faux — la troisième fois en deux jours.*
  - 📐 **À trancher avant de coder** : à quoi reconnaît-on « le même élément » quand l'id a déjà été régénéré par un import antérieur ? L'id seul ne suffit plus. Tuple naturel (`grilleId` + `nom`) pour les cartouches, mais les cinq collections n'ont pas le même tuple. ⚠ Et **ne rien casser n'est pas ne rien perdre** (leçon #442) : deux éléments homonymes légitimes existent — cf. #442, deux échelles « IDME et niv 0 » réellement utilisées.
  - **Constat sur pièces** : le dry-run rapporte **10 groupes d'homonymes à ids différents** dans les cartouches. Deux LOTS datables par l'horodatage des ids (`genererIdUnique` = `préfixe + Date.now() + '_' + compteur + '_' + hash`, `main.js:33`) :
    · lot **`1774267023…`** (24 mars 2026, compteurs 1→6) → 4 copies dans `cartouches_GRILLE1759243306842` + 1 dans `cartouches_GRILLE_GENERIQUE` ;
    · lot **`1782504228…`** (27 juin 2026, compteurs 1→9) → **1 grille + 8 cartouches en un seul lot**, formant **4 paires d'homonymes** dans `cartouches_GRILLE_1782504228322_1_6398d555452d` (chaque cartouche copiée DEUX fois).
  - ⮕ **Toutes les copies sont citées 0 fois** dans le reste des données (comptage textuel du script) : rien ne les référence. Les originaux, eux, sont cités 2 à 5 fois.
  - ⮕ **MÉCANISME PROBABLE, lu au code** (`js/cartouches.js:3634` `ajouterCartouchesABibliotheque`, boucle `:3675-3683`) : pour chaque cartouche sélectionnée, la fonction crée au besoin la grille parente (`grilles.push`) puis fait `cartouchesGrille.push({...cartouche, id: genererIdUnique('CART_')})` — **`push` nu, aucun test d'équivalent déjà présent**. Rejouer l'import (ou sélectionner deux fois) recrée des copies sous des ids neufs. La signature du lot de juin (1 `GRILLE_` + 8 `CART_`, compteurs consécutifs) colle exactement.
  - ✅ **RELEVÉ TERRAIN DU 11 AOÛT (Safari, après le portage d'a2026)** — `diag448()`, 83 éléments examinés, **9 groupes suspects** :
    · `cartouches_GRILLE1759243306842` — 4 paires, citations **75/0 · 79/0 · 50/0 · 50/0**. Signature nette : un original massivement cité, une copie **jamais** citée.
    · `cartouches_GRILLE_GENERIQUE` — 1 paire, **61/0**. Même signature.
    · `cartouches_GRILLE_1782504228322_1_6398d555452d` — 4 paires **TOUTES à 0/0**. ⚠ **Autre problème** : ce n'est pas un original + sa copie, c'est un magasin ENTIER que rien ne référence — plus proche des clés orphelines de #353 que de #448. 8 éléments, ~76 K car.
    · **Contre-épreuve utile** : les échelles d'a2025 sortent en « homonymes VIVANTS » (344/72). Le classificateur sépare bien les deux cas, il ne crie pas au loup.
  - ✅✅ **CONTRE-ÉPREUVE FAITE — CHROME REND LE RELEVÉ IDENTIQUE** (11 août, même script) : 83 éléments, 9 groupes suspects, 1 homonyme vivant, **les mêmes chiffres de citation à l'unité près** (75/0 · 79/0 · 50/0 · 50/0 · 0/0 ×4 · 61/0). ⮕ **L'import du 11 août n'a RIEN dupliqué.** Il a transporté fidèlement l'état de Chrome. L'hypothèse notée ci-dessous est donc confirmée par la mesure, pas seulement plausible.
  - ⚠⚠ **ET C'EST LÀ QUE LE RELEVÉ DEVIENT INSTRUCTIF : POURQUOI LE VECTEUR N'A-T-IL PAS MORDU ?** Parce que `verifierUniciteIds` ne peut renommer que sur COLLISION — il faut que la cible porte DÉJÀ les mêmes ids. Safari ne possédait aucun de ces magasins de cartouches avant ce matin : l'écriture s'est faite dans le vide, sans collision, donc sans renommage. ⮕ **Le défaut n'est pas moins réel : il est CONDITIONNEL au fait de réimporter dans un magasin déjà peuplé.** Et Safari l'est désormais.
  - ⚠⚠ **LA PREUVE QUE ÇA MORD QUAND LA CONDITION EST RÉUNIE EST DANS SES PROPRES DONNÉES**, et elle a deux formes distinctes :
    · **collision sur les CARTOUCHES** → renommage en place, l'original garde ses références et la copie naît muette. C'est le lot du 24 mars (`GRILLE1759243306842`, 75/0 · 79/0 · 50/0 · 50/0).
    · **collision sur la GRILLE** → la grille entrante est remappée vers un id neuf (`GRILLE_<horodatage>_…`), et ses cartouches partent dans un magasin NEUF que rien ne référence. C'est le lot du 27 juin (`GRILLE_1782504228322_1_6398d555452d`, 8 éléments à 0/0). ⮕ *Le second est plus insidieux : il ne double rien à l'écran, il crée un magasin fantôme.*
  - ⮕ **CONSÉQUENCE OPÉRATOIRE : corriger le vecteur AVANT le prochain transfert.** Nettoyer d'abord ne servirait à rien — le prochain import recréerait le tout.
  - ⚠ ~~CE QUE CE RELEVÉ N'ÉTABLIT PAS~~ (levé par la contre-épreuve, conservé pour la méthode) : que l'import du 11 août ait CRÉÉ ces doublons. Les lots trouvés correspondent **item pour item** à ceux déjà catalogués dans Chrome le 10 août (dry-run `reparer442()`) : 4 copies dans `GRILLE1759243306842`, 1 dans `GRILLE_GENERIQUE`, 4 paires dans le lot du 27 juin. **Tous les groupes comptent exactement 2 exemplaires** — si l'import avait ajouté une couche par-dessus des données déjà dupliquées, on en verrait 3 ou 4. ⮕ Lecture la plus probable : l'import a **transporté** les doublons de Chrome, il ne les a pas fabriqués. ⏳ **Décisif pour trancher : le même `diag448()` dans CHROME.** Si Chrome rend les mêmes 9 groupes de 2, le vecteur n'a pas mordu cette fois.
  - ⏳ **CE QUI RESTE À MESURER** : le parcours d'import **complet au navigateur** n'a pas été rejoué (la reproduction porte sur la ligne de fusion, pas sur le parcours). La 3e rangée de la porte 2.5 le mesure sur le corpus réel — relevé `cartouches : N au total, dont D portant un nom déjà présent`, avant et après un import. ⚠ **Grégoire a coché la rangée le 11 août mais les deux chiffres ne sont pas revenus** : une case cochée ne porte pas un nombre (leçon versée à `SKILL_portes_terrain.md`).
  - ⮕ **Famille #442** : `SKILL_integrite_globaux` AP-3 (upsert/push silencieux dans une collection partagée). L'antidote est le même — dédoublonner par identité, ou par tuple naturel (grilleId + nom) quand l'id est régénéré à l'import. ⚠ Charger le skill avant.
  - Coût pour le budget : `cartouches_GRILLE_1782504228322_1_6398d555452d` pèse **76 K car.** (top 20 du relevé #353), moitié en doublons.
- [x] **#442 CLOS** 🟡 Magasin global `cours` : doublons d'entrées à id identique + hygiène de fusion à l'import — créé 9 août 2026 (terrain #154), **volet CODE livré 10 août (1.67.2)**, **volet DONNÉES clos le 10 août au soir**.
  - Constat sur données réelles (dry-run `reparer154()`, Chrome de Grégoire) : le magasin `cours` (clé globale NON namespacée) contient **3 entrées identiques** de 601-102-MQ portant le **même id** `h2026-601-102-MQ-00001`. Signature probable de fusions d'imports répétées sans dédoublonnage par identité. S'y ajoute (sonde #159, 10 août) « IDME et niv 0 » **en double** dans `a2025_echellesTemplates`.
  - ⮕ **MÉCANISME TROUVÉ** (`_migrerListeCoursVersCoursV2`, `js/trimestre-v2-cours.js`) : la fusion `listeCours`→`cours` dédoublonnait par **tuple naturel** (code|SESSION+ANNÉE) et calculait bien un `Set` d'ids… **qu'elle ne consultait QUE dans la branche « pas de tuple »**. Une fiche legacy au tuple DIFFÉRENT mais à l'id IDENTIQUE passait donc au travers — et le cas est structurel : l'entrée V2 porte `session`+`annee` (tuple complet), la copie legacy restaurée par un import ancien ne les porte pas (tuple **dégradé**). Deux tuples, un seul id, **un exemplaire de plus à chaque import**.
  - ✅ (1) Fusion corrigée : `_fusionnerListeCoursDansCours` (pure, exportée) dédoublonne **par identité d'abord**, puis par tuple ; la porte se referme aussi **dans le lot** (deux fiches legacy au même id n'entrent pas toutes les deux) ; les écarts sont dits en `console.warn`, plus avalés.
  - ✅ (2) `scripts/reparation-442-doublons.js` — dry-run / exécution / `annuler442()`. Ne retire QUE les doublons d'**identité** et garde **le premier** exemplaire : c'est celui que `find` atteint déjà, donc le retrait est un no-op fonctionnel démontrable. Les **homonymes à ids différents** sont **rapportés, jamais touchés**, avec le nombre de clés où chaque id est cité. Signature d'homonymie période-consciente pour `cours` (deux fiches au même intitulé dans deux sessions = cas normal de chaque rentrée, pas une alerte).
  - ✅ (3) Sentinelles `sentinelle-fusion-cours-442` (9 cas) et `sentinelle-reparation-442-doublons` (8 cas) — **12 break-tests, 12 ROUGE**.
  - ✅ Zéro-dette : `scripts/dedoublonner-biblios.js` **retiré** — il visait encore les globales NUES `grillesTemplates`/`echellesTemplates`, vidées au boot depuis #358 (donc sans effet), et n'avait ni dry-run ni annulation. Sa portée (cartouches\_\*, bibliothèques) est reprise et couverte par une assertion.
  - ✅ **VOLET DONNÉES CLOS AUTREMENT QUE PRÉVU (10 août, soir).** Le dry-run a confirmé les 3 exemplaires, puis Grégoire a tranché : **le cours 601-102-MQ était FICTIF** (données de test, jamais donné avec Labo Codex). Il l'a supprimé par l'interface (Trimestre → Cours → Modifier → Supprimer) — `supprimerCoursV2` filtre le magasin **par id**, donc les trois exemplaires sont partis ensemble. Magasin vérifié après coup : une seule fiche, `h2026-601-101-MQ-00001`.
  - ⮕ **La question des champs à récupérer est devenue sans objet** : la 3e copie portait `heuresContact: 60` et `ponderation: '2-2-3'`, mais la fiche entière était fictive. ⚠ Le mécanisme de récupération reste dans le script — il servira au prochain doublon sur des données réelles.
  - ⚠ **Vérifié avant de supprimer** : aucun groupe-cours, aucune production, aucune évaluation, aucune présence ne portait ce `coursId`, dans aucun trimestre. Rien n'est resté orphelin. (`supprimerCoursV2` ne nettoie PAS les dépendances — ç'aurait été un problème avec un cours réellement utilisé ; d'où `scripts/reparation-retirer-cours.js`, qui le fait et refuse si des données réelles pendent au cours.)
  - ⏳ **RESTE, et c'est une décision humaine** : « IDME et niv 0 » existe en DEUX exemplaires dans `a2025_echellesTemplates`, à **ids différents et TOUS DEUX RÉFÉRENCÉS** (6 et 4 citations). Ce ne sont donc pas des doublons à supprimer mais deux échelles réellement utilisées — à trancher par Grégoire, jamais par un script.
  - ⚠ Charger `SKILL_integrite_globaux.md` avant d'y retoucher : `cours` est une collection globale partagée.
  - Contexte complet : SUIVI-BUGS #154.
- [x] 📐 **#441 CLOS 19 août 2026** Décision — le chantier 3 de `PLAN_taxonomie_SOLO.md` a-t-il encore un objet ? — créé 9 août 2026 (audit `Plan Accompagnement/`).
  - ✅ **CLÔTURE (19 août 2026)** : la décision du 11 août (archiver) est exécutée — bloc d'archivage posé en tête du chantier 3 dans `PLAN_taxonomie_SOLO.md` (motif + dates + renvoi `critere.niveauSOLO`), sections 5.x conservées comme trace. Aucun code, comme prévu.
  - Le plan du 23 mai prévoyait que l'enseignant **déclare** l'association d'un niveau SOLO à chaque niveau de son échelle de performance (sélecteur + pictogramme dans l'éditeur d'échelle). **Jamais amorcé** : `echelles.js` n'a ni sélecteur ni picto.
  - ⚠ **Et le manque est INVISIBLE pour l'utilisateur** : la révision de contenu du 4 juin a **réécrit la page 5 du guide SOLO** pour décrire l'app telle qu'elle est, sans mentionner l'éditeur d'échelle. Il n'y a donc ni promesse trahie ni porte morte — seulement une intention de mai qui n'a jamais été ni faite ni annulée.
  - ✅ **TRANCHÉ — 11 août 2026, porte 3.4 : ARCHIVER le chantier 3.** Le reste du plan est livré, le manque est invisible, la page 5 du guide décrit déjà l'app telle qu'elle est. Reste à faire : marquer le chantier 3 comme archivé dans `PLAN_taxonomie_SOLO.md` (avec le motif et la date), puis clore cet item. Aucun code.
  - ~~**Question à Grégoire** : le veut-on encore ?~~
  - ⚠ Ne pas confondre avec `critere.niveauSOLO` (`grilles.js:2958` et `:3254`), qui existe et porte sur les **critères de grille** — autre objet, déjà livré, et déjà relié au guide par la popup `grille-niveau-solo`.

### Tests d'intégration — specs rouges découvertes le 12 août 2026 (recomptées à SIX le 18)

- [x] **#534 CLOS** Un seul dépassement de délai suffit à refuser un push légitime — créé 26 août 2026, **hypothèse initiale RÉFUTÉE le jour même par la mesure**.
  ✅ **TRANCHÉ PAR GRÉGOIRE le 27 août 2026 : durcir la SEULE spec qui a un manque objectif.**
  `cours-refonte-rendu.spec.js` n'attendait jamais `window.dbReady` — ses montages posaient un
  `waitForTimeout(500)` fixe quand `page.goto` sur `index.html` coûte 400 à 700 ms. La marge
  était nulle par construction. Les quatre montages attendent désormais l'ÉTAT
  (`waitForFunction(() => window.dbReady === true)`, 20 s), comme le faisait déjà la spec
  voisine — l'asymétrie n'était pas un choix, c'était un oubli.
  ⮕ **QUATRE montages, pas deux** : cet item annonçait « ses deux tests ». Le fichier en porte
  quatre (chantier C ×2, chantier E ×2), tous avec le même sommeil fixe. Compté à l'écran le
  27 août, pas recopié.
  ⮕ **Mesuré après durcissement : 4/4 verts en 4,4 s** — plus RAPIDE qu'avant, l'attente d'état
  se libérant dès que la base est prête au lieu d'épuiser un délai.
  ⮕ **`planif-tout-voir-loupe.spec.js` n'est PAS touchée**, conformément à l'arbitrage : son
  montage rejoué à chaque test est un profil de risque, pas un manque objectif. Le constat
  reste inscrit ci-dessous si elle redevient instable.

  ✅ **LA MESURE DEMANDÉE A ÉTÉ FAITE — 26 août 2026, fin de journée. LES DEUX SPECS SONT VERTES.**
  Conditions exigées par cet item, toutes réunies et vérifiées AVANT de lancer : GitHub Desktop
  fermé (`pgrep` : absent), aucun processus Playwright vivant, la session parallèle terminée et
  ses commits poussés, arbre au repos.
  ⮕ **Résultat : 165 passés / 0 échec / 0 reprise, en 5,8 min.** Aucune spec n'a eu besoin de son
  essai de reprise — `retries: 1` n'a donc rien absorbé, et l'instabilité ne s'est pas exprimée.
  ⮕ **Ce que ça départage.** `planif-tout-voir-loupe.spec.js` (lignes 75/111/160 selon les runs) et
  `cours-refonte-rendu.spec.js:100` passent toutes deux. La variable dominante était bien
  l'INTERFÉRENCE EXTERNE — commandes git concurrentes sur l'arbre lu en `file://`, contention
  machine — et non une fragilité propre à ces deux fichiers. C'est la troisième explication, celle
  apportée par Grégoire sur #523, qui se confirme.
  ⚠ **CE QUE CE VERT NE DIT PAS, et il faut le tenir séparé.** Un run vert ne prouve pas l'absence
  d'un défaut non déterministe ; il dit que dans ces conditions-là, il ne s'est pas produit. La
  lecture de code faite le même jour annonçait « deux causes structurelles distinctes » : elle
  décrivait des FAITS de code réels (ci-dessous) mais leur prêtait un effet que la mesure n'a pas
  confirmé. L'analyse par lecture a une fois de plus proposé une explication qui se lit bien.
  ⏳ **CE QUI RESTE VRAI ET VÉRIFIABLE SANS RUN — deux fragilités latentes, non corrigées :**
  · `cours-refonte-rendu.spec.js` n'attend **jamais** `window.dbReady`. Ses deux tests posent un
    `waitForTimeout(500)` fixe, quand `page.goto` sur `index.html` coûte 400 à 700 ms en régime
    normal. La marge est nulle par construction. La spec voisine `planif-tout-voir-loupe` attend
    `dbReady` (20 s) — l'asymétrie n'est pas un choix documenté.
  · `planif-tout-voir-loupe.spec.js` rejoue tout son montage à CHAQUE test (4 tests × [`goto` +
    attente `dbReady` + 800 ms + 1200 ms de sommeils fixes + injection de 41 nœuds]), sous le
    plafond de 30 s par défaut. Les quatre tests partagent donc le même profil de risque — ce qui
    explique que la ligne rouge se promenait d'un run à l'autre sans que le fichier change.
  ⮕ **Décision à prendre** : durcir ces deux montages (attente d'état plutôt que sommeils fixes)
  ou fermer l'item sur le vert mesuré. Non tranché — ce n'est plus un bug, c'est de l'hygiène.


  ⚠⚠ **CE QUE CET ITEM A D'ABORD AFFIRMÉ ÉTAIT FAUX, ET C'EST LA PARTIE UTILE.** Version du matin :
  « la suite sature le `localStorage` partagé de l'origine `file://`, le boot ralentit, les specs
  tardives tombent ». L'inférence était cohérente — `workers: 1` existe précisément parce que le
  stockage est partagé, rien ne le vide entre les specs, et `db.js` relit tout le magasin au boot.
  Elle est **fausse**. Deux sondes posées aux extrémités de la suite (retirées depuis) :

  | | `page.goto` | clés | taille |
  |---|---|---|---|
  | 1ʳᵉ spec | 678 ms | 54 | 55 838 car. |
  | 164ᵉ spec | **387 ms** | **54** | **55 811 car.** |

  Le stockage ne bouge pas, et la page charge **plus vite** à la fin qu'au début. Aucune
  sédimentation, ni dans un run ni entre les runs. ⮕ **Ne pas ressusciter cette piste sans nouvelle
  mesure** — elle se lit bien, c'est ce qui la rend collante.

  **Ce qui est mesuré, et qui reste.** `page.goto` sur `index.html` coûte **400 à 700 ms** en régime
  normal. Les deux specs qui ont refusé le push de #533 (`cours-refonte-rendu.spec.js:100`,
  `planif-tout-voir-loupe.spec.js:160`) ont dépassé **30 000 ms** — un facteur quarante, un blocage
  franc et non une dégradation graduelle. Les mêmes passent en isolé (8 specs, 22 s), et le run
  complet suivant est vert : 164 passés, 1 échec — celui de la baseline. Les deux rouges étaient
  **non déterministes**, malgré deux reproductions consécutives.

  **Piste, non établie** : les deux runs rouges se suivaient dans une fenêtre où plusieurs suites
  avaient été enchaînées et des runs tués en cours. Contention machine. Aucune mesure ne le prouve —
  seul le symptôme est documenté.

  **Ce qui justifie le chantier, quelle que soit la cause.** `tests/playwright.config.js` n'a
  **aucun `retries`**. Un unique dépassement d'infrastructure suffit donc à refuser un push
  parfaitement légitime — et un refus injustifié est précisément ce qui apprend à taper
  `--no-verify`, c'est-à-dire ce que #533 vient d'essayer d'empêcher. La garde se perd par ses faux
  refus, pas par ses vrais.

  ⛔ **Ce que ce constat NE dit pas** : que l'application soit lente à démarrer pour un utilisateur.
  Le stockage mesuré ici (55 Ko) n'a rien d'un état de terrain, et 400-700 ms de boot ne se
  transposent pas. Ne rien conclure sur les performances réelles sans mesure séparée.

  📊 **CE QUE LES REPRISES ONT RÉVÉLÉ (26 août, deux runs comparés à périmètre égal)** — 2 specs
  instables dans les deux cas, rattrapées au second essai. **Et l'instable n'est pas le même test
  d'un run à l'autre** dans `planif-tout-voir-loupe.spec.js` : lignes 75, 111 et 160 ont rougi
  tour à tour. ⮕ Ce n'est donc pas une assertion fragile, c'est **le fichier entier** — son
  montage ou le temps de rendu de la carte. `cours-refonte-rendu.spec.js:100`, lui, est constant :
  toujours le même test, toujours le dépassement au chargement. **Deux causes distinctes derrière
  un même symptôme** — ne pas les traiter ensemble.

- [x] **🔴 #456 CLOS 18 août 2026** **Six** specs Playwright ROUGES, et surtout : **elles ne tournaient nulle part** — créé 12 août 2026 (constat au rituel de début), **recompté le 18 août**.
  - ✅ **CLÔTURE (4ᵉ passe WebKit, relevé Grégoire : 9/9, 54,1 s, aucun échec).** Les six rouges sont éteintes en quatre passes terrain, TOUTES des dérives de test ou des défauts de harnais — zéro bug d'app : quatre dérives réparées au 1ᵉʳ cycle (badge #366, API renommée, fixture pré-#367, prise sur le menu de type 1.86) ; Alt/⌥ = modificateur ⌥ non transporté par Playwright-WebKit (prouvé par sonde, réécrite en PointerEvent purs) ; aimantation = dernier `pointermove` d'un trajet groupé avalé par WebKit (prouvé par diagnostic embarqué : 433 = un pas manquant, zéro guide — trajet livré pas à pas, final doublé, assertion recentrée sur l'invariant). **Baseline → 0** : transcription composée de deux mesures — le 9/9 de la 4ᵉ passe sur les deux dernières specs, et la passe COMPLÈTE de la 2ᵉ passe (diff `--ecrire` vide sur 87 tests), aucun autre fichier de test n'ayant changé entre les deux. Le garde-fou de push redevient strict sur TOUTE rougeur. ⚠ Si la session Mac pousse son propre `--ecrire` à 0, il sera identique — sinon, le prochain `--ecrire` Mac fait foi comme toujours.
  - ▣ **La cause générale reste outillée** : le hook de push (sentinelle `verifier-playwright.mjs`) tourne sur le Mac, et la config `tests/playwright.chromium.config.js` donne aux sessions cloud un moteur de reproduction ciblée — avec sa leçon écrite dedans : un vert Chromium est un indice, jamais un verdict Safari (deux prédictions de vert sont tombées en une journée pour l'avoir oublié).
  - ✅ **CINQ DES SIX RÉPARÉES (18 août 2026, 1.87.5) — reproduites puis éprouvées en CHROMIUM** (le conteneur en a un : config `tests/playwright.chromium.config.js`, versionnée pour que les sessions cloud puissent enfin lancer l'intégration). Toutes étaient des DÉRIVES DE TEST, pas des bugs d'app — quatre causes :
    · `plein écran` : la spec attendait `.planif-badge-evolution`, retiré le 9 août (#366) ;
    · `comptabilité du temps` : la spec appelait `mettreAJourSommaire`, remplacée par `mettreAJourPlanificateur` (refonte planificateur) ;
    · `import inter-trimestre` : la fixture semait `planification_seances` au format PLAT d'avant #367 — la clé est composite `carteId::leconId` depuis le 7 août ;
    · `Alt/⌥+glisser` + `CAS D` : les specs saisissaient le bloc au CENTRE de l'en-tête, où vit depuis 1.86 le MENU DE TYPE qui stoppe la propagation par conception (mesuré à la sonde : `elementFromPoint` = `select.planif-noeud-type-select`) ⇒ prise par la POIGNÉE ⠿ ; plus l'assertion 1.87 (⌥ seul = COPIE indépendante, `cloneSourceId` nul) ; plus deux mesures faites PENDANT le drag (au relâchement, un dépôt sur un conteneur démo re-layoute — et le CAS D échouait à la frontière exacte +100/+100, frames rAF perdues en headless).
  - 📊 **RETOUR DE LA 1ʳᵉ PASSE WEBKIT (18 août, relevé Grégoire) : 91 passés / 2 échecs.** QUATRE des cinq réparations tiennent en WebKit ; ⚠ **la 5ᵉ (Alt/⌥+glisser) NE tient PAS** — verte en Chromium, « clone jamais créé » en WebKit. Le commit `8511ad44` disait « 5 des 6 réparées » : il surestimait, sur la foi du seul moteur du conteneur — attrapé par Grégoire dans le relevé. ⮕ La spec est désormais **INSTRUMENTÉE** plutôt que re-réparée à l'aveugle : à l'échec, une SONDE dispatche un `pointerdown` synthétique `altKey:true` sur la poignée et le message d'échec tranche entre « le modificateur ⌥ ne voyage pas avec la souris du harnais » et « le chemin applicatif ne duplique pas dans ce moteur ». Mécanique éprouvée en Chromium (18→19 nœuds).
  - ✅ **La 6ᵉ (aimantation) EST RÉPARÉE SUR MESURE (verdict 3.1 : voie 1).** Le relevé donne 426 au lieu de 440 — 14 px manquants sur +40 = position d'une frame INTERMÉDIAIRE (mesure à 80 ms, drag throttlé rAF). Même classe et même correctif que le CAS D (300 ms de repos avant mesure, assertions exactes inchangées) — et le CAS D ainsi réparé passe en WebKit, ce qui fonde la prédiction. Juge : 2ᵉ passe.
  - ✅ **Baseline 6 → 2** (aimantation + Alt/⌥), régénérée par la passe Mac et transcrite au dépôt depuis le relevé — confirmée à 2 par la passe complète `--ecrire` de la 2ᵉ passe (aucune rougeur nouvelle ailleurs).
  - 📊 **RETOUR DE LA 2ᵉ PASSE (18 août, relevé Grégoire)** — deux verdicts :
    · **SONDE Alt/⌥ : PAS UN BUG D'APP.** En WebKit aussi, un `pointerdown` synthétique `altKey:true` crée la copie — c'est le modificateur ⌥ de Playwright qui ne voyage pas avec la souris dans ce moteur. ⮕ Spec **réécrite** : geste piloté au niveau des `PointerEvent` (pointerdown altKey sur la poignée, pointermove sur document, frame rAF entre chaque, mesure pendant le drag) ; la vraie souris reste couverte par le CAS D, vert en WebKit. 9/9 verts en Chromium, **break-testée** (sans `altKey` ⇒ rouge).
    · **Aimantation : 400 au lieu de 440 — et 400 est AUSSI la position de départ.** Le repos a réglé la frame intermédiaire (426 disparu) ; « aimanté sur REF » (exigerait zoom ≈ 0,15, seuil = `AIMANT_SEUIL 6 px ÷ zoom`) et « drag interrompu » (hypothèse concurrente de Grégoire, gardée vivante) sont indiscernables sans données ⮕ la spec **embarque son diagnostic** : à l'échec, le message livre `zoom`, `guidesVisibles`, `dragEnCours`, largeurs des blocs.
  - 📊 **RETOUR DE LA 3ᵉ PASSE (18 août, relevé Grégoire : 8 passés / 1 échec)** :
    · ✅ **Alt/⌥ VERTE en WebKit — la réécriture PointerEvent tient.** (⚠ La porte 2.10 est revenue cochée ✗ mais la mesure jointe la contredit — Alt/⌥ absente des échecs ; la mesure fait foi.) Dette d'outillage close.
    · 📏 **Le diagnostic embarqué a départagé : bug de HARNAIS** (l'hypothèse 1 du relevé). Reçu **433** = 440 − un pas de ~6,7 px, `guidesVisibles: 0` (aucun snap), `dragEnCours: true`. Ni aimantation ni frame : **WebKit ne livre pas le dernier `pointermove` d'un trajet groupé** (`steps: 6`) — le 426 manquait deux pas, le 433 un. L'app est hors de cause.
    · ⮕ **Correctif** : trajet livré pas à pas (patron CAS D), mouvement final doublé, et l'assertion vise l'INVARIANT (aucune aimantation = zéro guide + position > 425 ; un snap rendrait 400) plutôt que l'arrivée au pixel — la phase « à 4 px » garde son égalité stricte (le snap POSE la position). 3/3 verts Chromium.
  - ⏳ **4ᵉ passe Mac due (~2 min), possiblement la DERNIÈRE** : deux fichiers, attendu 9/9 ; si vert, `verifier-playwright.mjs --ecrire` → **baseline 0** et #456 se ferme. Porte terrain : `plans de travail/PORTES-TERRAIN-2026-08-18-playwright-456.md`.
  - **Les six, mesurées** : `planif-alignement.spec.js:59` (un bloc glissé près d'un autre COLLE) · `planif-drag-pointer-148.spec.js:70` (CAS D — un drag souris déplace un nœud libre) · `planif-toolbar.spec.js:58` (plein écran carte mentale) · `:198` (Alt+glisser duplique) · `:271` (comptabilité du temps, rollup) · `:323` (import inter-trimestre).
  - ⚠⚠ **LE COMPTE ÉTAIT FAUX D'UNE UNITÉ, ET C'EST L'ITEM LUI-MÊME QUI EXPLIQUE POURQUOI.** Cet item annonçait « cinq » depuis le 12 août ; la suite complète, lancée pour de vrai le **18 août sur le Mac** (WebKit `webkit-2287`, 3 min 42), rend **87 passées / 6 échecs**. `planif-drag-pointer-148.spec.js:70` manquait à la liste. Un chiffre jamais reproduit se durcit en fait acquis : celui-ci s'est recopié six jours durant. ⮕ **Ne pas réécrire ce compte sans relancer la suite.**
  - **Ce qui N'EST PAS établi** : si cette 6ᵉ spec était déjà rouge le 12 août (liste incomplète) ou l'est devenue entre le 12 et le 18. Les deux lectures tiennent ; aucune mesure ne tranche. Ne pas trancher à l'écrit tant que ce n'est pas mesuré.
  - ▣ **CONTRE-ÉPREUVE DU 18 AOÛT — aucune régression de la Brique C.** Les **6 mêmes** échouent sur `d27659e3` (avant le pull) et sur `1fafa5d5` (après), aux mêmes lignes et avec les mêmes messages. Vérifié dans un worktree temporaire sur l'état antérieur, retiré depuis. ⮕ En particulier, `:323` (import inter-trimestre, `noteSuivie` attendu `"Note migrée"`, reçu `null`) **mime le domaine exact de la Brique C sans en provenir** — c'est le piège de ce lot, il ressemble à une régression et n'en est pas.
  - ✅ **Les deux specs Brique C, elles, PASSENT** : `import-grilles-inter-trimestre-briqueC.spec.js` et `import-pratiques-inter-trimestre-briqueC.spec.js`.
  - ⚠ **PRÉEXISTANTES, mesuré et non supposé** : *(mesure du 12 août, avec la liste de cinq alors connue)* les cinq mêmes échouent sur `main` SANS le chantier #416. Vérifié en basculant sur `main` avec un arbre propre, le 12 août au matin. Aucune régression du chantier.
  - ⚠⚠ **LA CAUSE GÉNÉRALE VAUT PLUS QUE LES CAS INDIVIDUELS.** WebKit n'existe pas dans les conteneurs (`webkit-2287` absent de `/opt/pw-browsers`), donc aucune session cloud ne les a jamais lancées ; et personne ne les lançait en local. **Elles ont dérivé en silence pendant que Vitest restait vert.** Le 12 août est la première fois qu'elles tournent réellement — sur le Mac de Grégoire, qui a WebKit.
  - **Un cas est daté avec certitude** : la spec attend `.planif-badge-evolution`, le badge « 🔧 En évolution » **retiré le 9 août** (#366). Le test n'a pas suivi.
  - **Un second cas est ORIENTÉ, pas diagnostiqué** (18 août) : `:271` échoue sur `window.planificationCarte.mettreAJourSommaire is not a function` — une API que la spec appelle et qui **n'existe plus sous ce nom**. Même famille que le premier : un test écrit contre une version antérieure de `planificationCarte`, jamais rejoué depuis. Plusieurs des quatre restants pourraient relever de la même cause — **non mesuré, à ne pas présumer.**
  - ✅ **TRANCHÉ ET LIVRÉ (18 août 2026) — la question « comment ces specs se relancent-elles ? » a sa réponse.** Sentinelle `scripts/verifier-playwright.mjs` + seconde étape du hook `scripts/hooks/pre-push`, comparaison à `scripts/playwright-baseline.json` (les 6 échecs ci-dessus). **Seule une rougeur ABSENTE de la baseline bloque** — un hook bloquant sur toute rougeur aurait refusé tous les pushes dès son installation, donc aurait été contourné au `--no-verify` en trois jours. Trois garde-fous : sauté si le push ne touche aucun fichier observable au navigateur (un push documentaire ne paie pas 4 min) · fail-open **en le disant** là où WebKit n'existe pas (tous les conteneurs) · `SKIP_PLAYWRIGHT=1` en urgence. Détail : `docs/securite/TESTS-AUTOMATISES.md` §7.1.
  - ⚠ **LA BASELINE DOIT RÉTRÉCIR — ce n'est pas un permis de laisser pourrir.** Chaque spec réparée s'en retire (`node scripts/verifier-playwright.mjs --ecrire`) ; le script signale de lui-même celles qui redeviennent vertes. Une baseline qui couvre du vert est un mensonge silencieux, et #456 est né d'un chiffre qu'on recopiait sans le reproduire.
  - ▣ **Break-testé avant d'y faire confiance** (7 cas de filtrage, puis baseline amputée d'une vraie rouge + entrée fantôme → **code 1**, la nouvelle dénoncée ET la fantôme annoncée réparée ; baseline juste → **code 0**). ⚠ **La sonde WebKit était d'abord INERTE** : elle interrogeait `playwright install --dry-run`, qui imprime l'emplacement d'installation et rend `0` que le navigateur soit là ou non — en conteneur elle aurait répondu « présent ». Seule la présence du dossier sur le disque tranche. Même famille que la contre-épreuve inerte du 15 août sur `git check-ignore`.
  - ⛔ **Pas un correctif d'export.** Chantier distinct, ouvert le jour où il a été mesuré.

### Modèle du cours — contradiction relevée en Cowork (12 août 2026)

- [x] **📐 #455 CLOS 19 août 2026 (1.87.8)** Le cours est-il **global** ou **par session** ? Deux fichiers répondent l'inverse, à trois jours d'écart — créé 12 août 2026 (constat Cowork, en préparant l'export calendrier #416).
  - ✅ **TRANCHÉ (Grégoire, 19 août 2026) : « Le devis ministériel ne change pas d'un trimestre à l'autre. Le cours est GLOBAL. »** Le modèle de `planification-donnees.js` (#407) fait foi ; `CoursEntite` (description ministérielle pure, sans période) était déjà conforme.
  - ✅ **LIVRÉ (même jour)** — quatre sites mis en accord : (1) `_tupleCoursNaturel` (`trimestre-v2-cours.js`) = **CODE seul**, `session`/`annee` sortent de l'identité — un « 601-101 d'automne » ne peut plus entrer à côté du 601-101 existant par la fusion legacy ; (2) le prédicat de doublon de l'**import de cours** (`cours.js`) compare le code seul ; (3) **`supprimerTrimestre` ne purge plus le magasin global `cours`** par `trimestreId` — l'ancien nettoyage aurait détruit la fiche partagée (la fiche réelle porte `trimestreId: "h2026"` et sert A26) ; (4) **garde anti-seconde-fiche à la création** (`sauvegarderCoursV2`) : code déjà présent → `confirm` explicite (« le cours est global : la même fiche sert tous les trimestres »), jamais une entrée silencieuse.
  - ✅ Champs `session`/`annee`/`trimestreId` des fiches legacy : **documentés HISTORIQUES et non décisionnels** (pas de migration de données — rien à retirer, le piège de lecture de l'id est documenté au même endroit). Sentinelle `sentinelle-cours-global-455.test.js` (7 cas, 4 break-tests ROUGE) ; sentinelle #361 **mise en accord avec la décision** (le global `cours` SURVIT à la suppression d'un trimestre) et re-break-testée ROUGE.
  - ⏳ **Queue documentée, non traitée dans ce lot** (lecteurs legacy de `trimestreId` sur les fiches, tous non destructeurs depuis (3)) : stats d'archivage `calculerStatistiquesFinales` et export par trimestre (`trimestres.js:1024`/`1084` — filtrent des fiches legacy, au pire un compte à zéro), `peupleSelecteurTrimestre` (`cours.js:131`), garde heuristique `productions-namespace-garde.js:109`, migrations legacy sur `listeCours`. À reprendre si un symptôme réel les met en cause.
  - **Comment c'est sorti** : Grégoire lit `coursId: "h2026-601-101-MQ-00001"` sur son groupe-cours **A2026** et demande si c'est une erreur. Réponse courte : non, il confondait le NOM du groupe-cours (« A2026-601-101-MQ-00007 ») avec l'ID du cours. Mais la vérification qui suit a trouvé autre chose.
  - **Les deux énoncés, incompatibles** :
    1. `js/planification-donnees.js` (7 août, #407, en tête de fichier) : « le cours est une collection **GLOBALE** (`db.getSync('cours', [])`, jamais préfixée) — **601-101 est le même objet d'un trimestre à l'autre** ». C'est ce qui fonde le `coursId` comme « la seule identité de la carte qui survive au changement de trimestre ».
    2. `js/trimestre-v2-cours.js` (10 août, #442, `_tupleCoursNaturel`) : l'identité naturelle d'un cours est le tuple **`code|SESSION+ANNÉE`**, soit `601-101-MQ|H2026`. Sous cette règle, un 601-101 d'automne est un objet **distinct**.
  - **L'objet réel de Grégoire** (relevé au navigateur, 12 août) : un seul cours dans le magasin global, `id: h2026-601-101-MQ-00001`, portant `session: "H"`, `annee: 2026`, `trimestreId: "h2026"`, `actif: false`. Son groupe-cours A2026 (`GC_1786388814118_2_3068cb8e2a5b`) pointe dessus.
  - **Aujourd'hui, aucune conséquence visible** : la résolution des séances passe par le **groupe-cours**, qui vit dans `a2026_groupesCours` — namespacé, donc bien d'automne, avec ses 30 séances du 21 août au 11 décembre 2026.
  - ⚠ **Demain, si** une session crée un cours 601-101 d'**automne** : le tuple diffère (`601-101-MQ|A2026`), `_fusionnerListeCoursDansCours` le laisse entrer légitimement, et **deux cours coexistent pour la même chose**. Une carte rattachée à l'un ne verra pas les groupes de l'autre — famille de #346 (coursId non migré) et #454 (ressource renumérotée jamais repointée).
  - **Piège de lecture, à documenter quelle que soit la décision** : l'ID d'un cours **embarque le trimestre de sa création** (`h2026-…`) sans que ce soit une donnée à lire. Il ressemble à de l'information et n'en est pas. Grégoire et la session Cowork y sont tombés tous les deux dans la même conversation — c'est la définition d'un piège, pas d'une maladresse.
  - **À trancher avant tout code** : lequel des deux modèles fait foi ? Puis mettre l'autre fichier en accord — et, si c'est « global », décider quoi faire des champs `session`/`annee`/`trimestreId` portés par l'objet cours (les retirer, ou les documenter comme historiques et non décisionnels).
  - ⛔ **Pas un correctif d'export.** Toucher à l'identité du cours touche productions, évaluations, séances et cartes : séance dédiée, backup + dry-run + golden master, comme tout item qui écrit sur des données réelles.

### Audit performance + logique 5 août 2026 (soir) — versement trié (rapport `Rapports/AUDIT-PERF-LOGIQUE-2026-08-05.md`)

> Chaque item cite ses sections du rapport (gravité, sonde/repro, `fichier:ligne`, correctif
> esquissé, coût — ne pas dupliquer ici). Ordre = priorité proposée au rapport. Deux pistes de
> la consigne y sont **RÉFUTÉES par mesure** (`db.statsStockage`, `verifierUniciteIds`) — ne pas
> rouvrir. L'approfondissement chiffré des dates de repli en dur de `genererCalendrierComplet`
> (124 entrées fantômes 2025) est repris à **#399**, ce qui règle ce reste de **#393**.

- [x] ⚠️ **#394 LIVRÉ 5 août 2026 (1.31.14)** 🔴 Réunifier les DEUX systèmes de calcul STD — même corpus, notes différentes (rapport L2+L9+L10+L3) — créé 5 août 2026 (audit perf+logique).
  - ✅ Livraison : SSOT des rôles dans `pratique-registre.js` (identifierProductionTerminale / obtenirArtefactsIdsPoolStd / creerComparateurRecenceStd) consommée par les DEUX systèmes + snapshots ; défauts ||60/||40 morts ; règle du complément ; noteConstructible STOCKÉ (miroir simulerIndices) + affichages « — » ; zone « À vérifier » Productions (règles 3/5, bouton « Typer comme terminale » sur cas non ambigu) ; récence par numéro partagée ; lectures configPAN purgées. Sentinelle 15 cas, 6 break-tests ROUGE→VERT. RESTE (queue) : la « 4ᵉ source de cours actif » (cours[].actif, versée par la réparation #362) n'est PAS traitée dans ce lot — sous-chantier réunification des sources de cours actif à cadrer.
  - Quatre défauts de la même famille, à traiter comme UN chantier (mêmes fichiers, mêmes sentinelles) : **L2** l'instance prend la 1ʳᵉ production `ponderation>0` comme « terminale » quand le chemin riche exige `type==='terminale'` (sonde : **82,67 vs 74,29**) ; **L9** deux définitions de « récence » pour `recents` (numéro de production vs `dateEvaluation` — profil vs snapshots) ; **L10** `_lireConfiguration` de l'instance lit encore `modalitesEvaluation.configPAN` retiré en G2-a (+2 lectures legacy dans portfolio.js — le panneau Portfolio peut afficher une config ≠ calcul) ; **L3** couture #326 T1 : `calculerEtStockerIndicesCP` garde le repli `calculerPerformance` → le tableau de bord stocke P=74 quand le profil dit « non constructible » (sonde).
  - ✅ **TRANCHÉ (Grégoire, 5 août 2026 soir — discussion complète au bloc SESSION.md)**, quatre règles + migration :
    1. **Terminale = déclaration explicite, jamais une inférence** : une production joue le rôle de terminale ssi `type === 'terminale'` (choix utilisateur au formulaire Productions). Pas de terminale → RIEN n'en tient lieu (aucun fallback pondéré). Pondérations toujours saisies par l'utilisateur, jamais de défaut 60/40 (les `|| 60`/`|| 40` de l'instance MEURENT).
    2. **Le pool n'exige pas de conteneur** (souci Grégoire : ne pas coder en dur SA pratique — un STD sans portfolio doit exister) : pool = artefacts déclarés, sinon productions non pondérées (repli existant) ; production « Portfolio (conteneur) » OPTIONNELLE — si absente avec une terminale pondérée p, **pondération du pool = 100 − p** (règle du complément) ; sélection neutralisable (`methodeSelection: 'tous'`). Renommer la sémantique interne pool/sélection (le bloc config garde son nom, le vocabulaire des messages ne présuppose plus un portfolio).
    3. **Transparence** : toute production pondérée non participante, et toute pondération obtenue par complément → avertissement non bloquant (zone « À vérifier », patron #369), jamais un silence.
    4. **Encodage « non constructible » stocké** : champ ADDITIF `noteConstructible: false` sur l'entrée `indicesCP.actuel` (miroir exact de `simulerIndices`) — les lecteurs historiques de `.P` ne cassent pas, les affichages montrent « — ».
    5. **Migration legacy (terminale en `type:'travail'`)** : AUCUNE conversion automatique, jamais d'écriture au boot (le patron #358 est structurel, pas sémantique). Avertissement #369 nommant les candidates ; cas NON ambigu (une seule production pondérée hors portfolio, aucune terminale typée) → bouton « Typer comme terminale » = conversion par geste explicite ; cas ambigu → liste + renvoi au formulaire, l'outil ne choisit pas. Note : la règle stricte est DÉJÀ le comportement du chemin riche → la note de profil des corpus legacy ne bouge pas au déploiement (vérifié : les 4 pratiques STD réelles construisent 100 % des notes par ce chemin).
  - Fichiers : `js/pratiques/pratique-pan-standards.js`, `js/profil-etudiant-actions.js`, `js/portfolio.js`. Coût M/L. Sentinelle-clé : parité stocké ↔ simulé + terminale partagée + règle du complément, break-testées.
- [x] ⚠️ **#395 LIVRÉ 5 août 2026 (1.31.15)** 🔴 Pratiques configurables Sommative : P = 0 pour tous — format dual d'`indicesCP` retiré en 95.5 (rapport L1) — créé 5 août 2026 (audit perf+logique).
  - ✅ Livraison : délégation `moyenne_ponderee` → PratiqueSommative jetable (patron SPE du 6 juin) ; `conversion_niveaux` + replis lisent le format PLAT ; aucune évaluation → null (non calculable), plus de zéro déguisé. Sentinelle 4 cas break-testée (3 rouges).
  - `PratiqueConfigurable.calculerPerformance` lit `actuel.SOM?.P||0` / `actuel.PAN?.P||0` (`pratique-configurable.js:228/233`) ; le store est PLAT depuis Beta 95.5 → toujours 0, affiché comme un vrai zéro (`noteConstructible=true`). SPE corrigée le 6 juin pour la même classe (délégation) — reprendre ce patron : déléguer `moyenne_ponderee` à une `PratiqueSommative` jetable ; `conversion_niveaux` → lire le format plat ou déléguer au chemin STD. **Bloquant pour les expérimentateurs CoP** (le wizard crée ces configurables, `wizard-pratique-v2.js:2651`). Coût M. Sonde du rapport = base de la sentinelle (store plat → ≠ 0).
- [x] 🟡 **#396 LIVRÉ 5 août 2026 (1.31.16)** `pan_par_objectif` : P = 0 systématique — double défaut de champ (rapport L4) — créé 5 août 2026 (audit perf+logique).
  - ✅ Livraison (D2) : chemin RETIRÉ (méthode + case + branche detecterDefis) ; wizard reroute « par objectifs » → conversion_niveaux ; grep préalable = aucune config prédéfinie/démo touchée ; configs stockées legacy NORMALISÉES à la lecture (construireConfigComplete, avertissement, aucune écriture). Sentinelle-cliquet 5 cas, break-testée en mutation inverse.
  - Filtre sur `evaluation.note` (champ réel : `noteFinale`) + lien `evaluation.objectifs` qu'AUCUN écrivain ne pose (le lien réel passe par `production.objectif`). ✅ **TRANCHÉ (Grégoire, 5 août 2026 soir) : RETIRER** (zéro-dette — chemin jamais fonctionnel qui duplique le moteur STD par objectifs). Périmètre : ablation du chemin `pan_par_objectif` de `pratique-configurable.js:129-193` + rerouter l'option « par-objectifs » du wizard (`wizard-pratique-v2.js:2660-2663`) vers le mode STD correspondant + **grep préalable** des configs existantes portant `calcul_note.methode='pan_par_objectif'` (normaliser + avertir s'il en existe). Coût S. Sentinelle-cliquet d'absence, break-testée en mutation inverse.
- [x] 🟡 **#397 LIVRÉ 5 août 2026 (1.31.17)** Perf du geste le plus fréquent : hisser les lectures hors boucles — pipeline présences ~460 ms mesurés à 75 étu (rapport P1+P2) — créé 5 août 2026 (audit perf+logique).
  - ✅ Livraison : cache de lecture de pipeline dans modes.js (mémoïsation d'obtenirDonneesSelonMode par lot, réentrant, invalidé à l'écriture) + caches additifs de calculerTousLesIndices + rendu prioritaires hissé. D3 exécutée : historique indicesCP PURGÉ (zéro lecteur au grep ; purge progressive au recalcul, aucune migration). Mesures avant/après (sonde Node, 75 étu) : assiduité ×6,3 (56,9→9,0 ms), chaîne C/P ×9,7 (73,2→7,6 ms). Sentinelle 8 cas, 2 break-tests.
  - `calculerAssiduite` et `calculerCompletion`/`calculerPerformance` relisent `presences`/`groupeEtudiants`/`evaluationsSauvegardees`/`productions` PAR étudiant (getSync → JSON.parse du blob entier : mesuré 0,86-2,17 ms/lecture ×150 lectures) ; croissance quasi quadratique (×10 → 10-30 s). Correctif : lire UNE fois, passer en paramètres (patron déjà présent : `calculerIndicesEtudiant(_cacheA,_cacheCP)`, `evaluationsCache` d'historique) — gain estimé ~10×. Inclut le rendu « prioritaires » (`tableau-bord-apercu.js:115`, 44→203 ms mesurés) qui n'utilise pas les caches prévus. ✅ **TRANCHÉ (Grégoire, 5 août 2026 soir) — historique `indicesCP` : option C** = **grep des lecteurs D'ABORD** (vérification non faite à l'audit) ; zéro consommateur → PURGER l'historique et cesser de le pousser (les trajectoires lisent déjà les snapshots hebdomadaires de `snapshots.js`) ; s'il a des lecteurs → repli « 1 entrée/jour/étudiant » (remplacer l'entrée du jour au lieu d'empiler). Coût M. Protocoles de mesure reproductibles au rapport (avant/après chiffrables).
- [x] 🟡 **#398 LIVRÉ 5 août 2026 (1.31.18)** « Aujourd'hui » calculé en UTC dans 10 sites fonctionnels : tout bascule d'un jour à 20 h (rapport L5) — créé 5 août 2026 (audit perf+logique).
  - ✅ Livraison : SSOT `js/date-utils.js` (window.dateLocaleYMD, chargé après db.js) + bascule des 10 sites. Sentinelle 10 cas (soirée EDT déterministe + intégration garde assiduité + cliquet), 2 break-tests. RESTE (queue, hors périmètre audité) : horodatages snapshots.js:766/824 et conversions arithmétiques rythme.js:720/917 encore en toISOString — même classe, à basculer lors d'un passage dans ces fichiers.
  - `new Date().toISOString().split('T')[0]` = date UTC (Toronto : demain dès 20 h EDT). Sites fonctionnels : `indices.js:156` (assiduité — une séance saisie en soirée compte des absences immédiates), `snapshots.js:410/459/885`, `presences-apercu.js:101/165`, `rythme.js:771/894`, `interventions.js:651`, `saisie-presences.js:73` ; d'autres sites calculent déjà en LOCAL (conventions mixtes dans les mêmes fichiers). Correctif : helper unique `dateLocaleYMD()` + bascule des 10 sites + sentinelle TZ figée en soirée. Coût S.
- [x] 🟡 **#399 LIVRÉ 5 août 2026 (1.31.19)** Lot gardes calendrier/calcul (rapport L6+L7+L8 + approfondissement #393) — créé 5 août 2026 (audit perf+logique).
  - ✅ Livraison : L8/D4 reprise du samedi HONORÉE (préséance weekend↔reprise seule inversée, golden #368 INTACT ; avertissement #369 reformulé) ; replis en dur retirés + clé purgée sur bornes absentes ; L6 garde 0/0 (plus de NaN stocké) ; L7 note 0 comptée au repli. Sentinelle 9 cas, 4 break-tests (un par garde).
  - **L6** pondérations portfolio/terminale 0/0 → `noteFinale = NaN` traverse la garde (`== null` seulement) et se STOCKE (`profil-etudiant-actions.js:499-511`) ; **L7** note 0 exclue du repli `calculerPerformancePAN` (filtre truthy, `indices.js:411` — sonde : 0,70 au lieu de 0,467) ; **L8** ✅ **TRANCHÉ (Grégoire, 5 août 2026 soir) : HONORER la reprise** — inverser l'ordre des tests (`mapReprises` AVANT `estWeekend`, `trimestre.js:187-215`) : une reprise volontairement placée un samedi est un jour de cours (numeroJour compté) ; elle ne compte PAS dans la numérotation « paquet de 5 » (les semaines du collège restent des jours ouvrables — pas de numeroSemaine propre) ; golden master #368 doit rester vert ; **dates de repli en dur** de `genererCalendrierComplet` (`trimestre.js:90-97`, garde morte — sonde : cadre vide → 124 entrées fantômes 2025 dont 82 « cours ») : retirer les replis, laisser vivre la garde (règle le reste consigné à #393). Coût S par garde, sentinelles unitaires.
- [x] 🟡 **#400 LIVRÉ 5 août 2026 (1.31.20)** Fuite de listeners sur le canvas du graphique spaghetti A-C-P : +3 par rendu, jamais retirés (rapport P3) — créé 5 août 2026 (audit perf+logique).
  - ✅ Livraison : attacheur idempotent _attacherListenerSpaghetti (remove du handler précédent avant chaque attache), 3 sites routés. Sentinelle-cliquet 3 cas, break-testée en mutation inverse. PORTE TERRAIN : recompter les listeners post-#362 (protocole compteur Safari du bloc SESSION.md 5 août soir).
  - `creerGraphiqueGroupeSpaghettiACP` détruit bien le chart mais ré-attache mouseleave/click/mousemove au canvas PERSISTANT à chaque rendu (`graphiques-progression.js:1926/1980/2008`) — les closures retiennent les charts détruits et leurs datasets. Même classe que le bug « Pratique introuvable » de l'arbre Exploration (#326 R1 → garde idempotente). ⚠ **Terrain du 5 août soir : mesure REPORTÉE** — le contexte réel h2026 n'a aucune donnée de progression (graphiques jamais rendus, cf. désappariement #362 élargi) → rien à compter. **Décision : livrer la garde idempotente sans mesure** (fix sûr par lecture statique) ; recompter les listeners APRÈS la réparation de données #362 (protocole compteur add/remove compatible Safari, consigné au bloc SESSION.md du 5 août soir). Les 6 autres `new Chart` du module sont proprement appariés (vérifié statiquement). Coût S.
- [x] 🟢 **#401 LIVRÉ 5 août 2026 (1.31.21)** Boot et modal d'export : transactions IDB par clé + double sérialisation (rapport P4+P5) — créé 5 août 2026 (audit perf+logique).
  - ✅ Livraison : _getAllIndexedDB (UNE transaction getAll au boot, memoryCache-first #392 préservé, clear #300 conservé sans fenêtre async) ; sérialisation UNIQUE (setSync/set/sync — part CPU re-mesurée : setSync ×120/~5 Mo = 35,1→22,1 ms) ; modal export sans matérialisation (zéro db.get). Sentinelle 5 cas, 3 break-tests. PORTE TERRAIN : re-mesurer V1 (boot) / V2 (modal) avec les one-liners performance.now() du bloc SESSION.md 5 août soir — le terme IDB (dominant) n'est pas mesurable en Node.
  - `syncToLocalStorageCache` : `await get(key)` séquentiel PAR clé (1 transaction chacune — `getAll()` possible) + `_estimateSize` (stringify) PUIS re-stringify par `_setLocalStorage` (**243 ms de CPU mesurés** sur 5,2 Mo/120 clés ; ce double travail vaut aussi pour chaque `setSync`, `db.js:1274`). `ouvrirModalExport` (`import-export.js:574-580`) charge TOUTES les valeurs (y compris blobs) juste pour afficher des tailles. ✅ **CHIFFRÉ EN TERRAIN (Grégoire, 5 août soir, Safari, codex réel h2026)** : re-sync boot = **1057 / 962 / 729 ms** (3 runs, `db.syncToLocalStorageCache()` rejouée) ; ouverture du modal export = **473 / 488 ms**. Les deux dépassent le seuil de perceptibilité → **chantier DÉBLOQUÉ et justifié** (reclasser 🟡 possible au tri). Coût M.
- [ ] 🟢 **#402 PARTIEL 5 août 2026 (1.31.22 : L11 livré)** Lot entretien divers du rapport (L11+L12+L13) — créé 5 août 2026 (audit perf+logique).
  - ✅ L11 LIVRÉ : calculerNoteFinaleMultiObjectifs RETIRÉE (somme non normalisée + zéro appelant re-vérifié au commit). Sentinelle-cliquet break-testée en mutation inverse. Découvert au passage : window.calculerPerformanceParObjectif (portfolio.js) n'a PLUS d'appelant après L11+#396 → candidate ablation, à trancher.
  - RESTENT L12 (dateRemise factice, champ heures double sémantique, parseFloat DOM evaluation.js, estDansPlage borne unique) et L13 (repli ⌈joursCours/5⌉) — à trier au fil des sessions.
  - **L11** `calculerNoteFinaleMultiObjectifs` (portfolio.js) : somme pondérée non normalisée par `poidsTotal` ET 0 appelant → candidat ablation zéro-dette (sinon normaliser) ; **L12** : `dateRemise` factice dans la sélection auto `recents-meilleurs` du panneau Portfolio (TODO assumé — tri no-op) ; champ `heures` à double sémantique (heures réelles en présences régulières, PÉRIODES en présences RàI — cohérent par compensation croisée, renommer ou documenter au registre avant qu'un lecteur uniforme casse l'assiduité) ; note relue du DOM `parseFloat(textContent)||0` (`evaluation.js:2398`) ; `estDansPlage` ignore une plage à borne unique en silence (signal #369 possible) ; **L13** repli `⌈joursCours/5⌉` de `calculerStatistiquesCalendrier` divergent sur calendrier legacy + horaire partiel (fenêtre étroite, se ferme en régénérant). Trier au fil des sessions. Coût S-M.

### Audit qualité 5 août 2026 — versement trié (rapport `Rapports/AUDIT-QUALITE-2026-08-05.md`)

> Chaque item cite sa section du rapport (gravité, repro, `fichier:ligne`, correctif esquissé,
> coût y sont détaillés — ne pas dupliquer ici). Ordre = priorité proposée. La 4e trouvaille
> rouge du rapport (D1, notes de leçon aliassées entre cartes) n'a PAS de nouveau numéro :
> elle ÉLARGIT l'item **#367** existant (voir section Bugs UX).

- [x] ⚠️ **#379 LIVRÉ 5 août 2026 (1.31.4)** 🔴 Changer la session/année du trimestre ACTIF orpheline toutes ses données namespacées (rapport B1+B2) — créé 5 août 2026 (audit).
  - Bloc de migration VIDE dans `sauvegarderIdentificationTrimestreV2` (`trimestre-v2-init.js:145-161`), aucune garde de collision d'id ; aggravé par `ouvrirModalNouveauTrimestre` qui ne recharge pas l'identification après activation (`trimestre-v2-liste.js:553-558`, le fix S de B2 est à faire dans le même geste). Point d'entrée = bouton « Enregistrer » unique. **À traiter AVANT la rentrée** : c'est le formulaire que les testeurs vont manipuler. Option sûre = bloquer avec message ; option complète = migrer les clés (patron copie+purge+backup). Coût M/L.
- [x] ⚠️ **#380 LIVRÉ 5 août 2026 (1.31.5)** 🔴 Import sélectif : clés calendrier écrasées SANS case à cocher ni garde collègue (rapport A1) — créé 5 août 2026 (audit).
  - `executerImportSelectif` (`import-export.js:2994-3011`) écrit cadre/journées/séances même quand RIEN n'est coché (« Coche au moins un élément » affiché après coup). Ligne dédiée dans la modale + gate + compteur au total. Coût M.
- [x] **#381 LIVRÉ 5 août 2026 (1.31.6)** 🟡 Boutons « Activer » un groupe-cours : `infoCours` jamais mis à jour → mauvais cours actif en multi-cours (rapport B3) — déléguer à `changerGroupeCoursActifV2`. Coût S. Créé 5 août 2026 (audit).
- [x] **#382 LIVRÉ 5 août 2026 (1.31.6)** 🟡 Éditer un étudiant efface son `statut` (abandon/inactif réintégré aux moyennes) + écriture par index périmable (rapport B4) — spread + index par DA à la sauvegarde. Coût S. Créé 5 août 2026 (audit).
- [x] **#383 LIVRÉ 5 août 2026 (1.31.7)** 🟡 Import sélectif : cocher « Cartouches » n'importe JAMAIS rien (mismatch data-item-id agrégé vs ids réels, rapport A2). Coût S-M. Créé 5 août 2026 (audit).
- [x] **#384 LIVRÉ 5 août 2026 (1.31.7)** 🟡 Export/restauration ZIP : blobs travaux d'UNE seule clé `fichiersTravaux` (`find` au lieu de boucler, rapport A3) — backup multi-trimestre incomplet. Coût S. Créé 5 août 2026 (audit).
- [x] **#385 LIVRÉ 5 août 2026 (1.31.7)** 🟡 Blobs restaurés du ZIP sans `validerMagicBytes` (rapport A4, couture : le chemin codex a le garde, pas import-export) — + 1 test Défense I. Coût S. Créé 5 août 2026 (audit).
- [x] **#386 LIVRÉ 5 août 2026 (1.31.8)** 🟡 Lot sécurité échappement/coercition (rapport A5+B9+D2) : métadonnées d'import injectées brutes dans la modale config complète, libellés utilisateur non échappés dans ~10 dropdowns/listes trimestre-v2, titre de nœud brut sur 3 chemins planification, `semaineDebut/Fin` bruts dans `value=` (symétriques au fix meta.duree livré — étendre sa sentinelle). Coût S (mécanique). Créé 5 août 2026 (audit).
- [x] **#387 LIVRÉ 5 août 2026 (1.31.9)** 🟡 Détection de format d'import : « 2026 » codé en dur → sauvegardes 2027 refusées (rapport A6) — regex `/^[aeh]\d{4}_/` + test. Coût S. **Échéance de fait : décembre 2026.** Créé 5 août 2026 (audit).
- [x] **#388 LIVRÉ 5 août 2026 (1.31.9)** 🟡 Purge des trimestres orphelins : les clés RESSUSCITENT au boot (localStorage.removeItem brut, IDB intact, rapport C1) — passer par `db.removeSync` + union des 3 couches (patron `supprimerTrimestre`). Coût S. Créé 5 août 2026 (audit).
- [x] **#389 LIVRÉ 5 août 2026 (1.31.9)** 🟡 Classe « énumération localStorage seulement » : 8 sites encore atteints par la leçon du 5 août (export config, exporterCartouches, cartouches à l'ÉVAL, 4 scans de bibliothèques, lister orphelins — rapport C2) — helper `db.keysSync()` + bascule + sentinelle-cliquet. Coût M. Créé 5 août 2026 (audit).
- [x] **#390 LIVRÉ 5 août 2026 (1.31.10)** 🟡 Lot petits correctifs formulaire Trimestre (rapport B5+B6+B7) : réinitialiser bornes/semaines ne régénère ni calendrier ni stats ; garde morte objet===string dans `supprimerGroupeCoursV2` (dernier GC supprimé → infoCours fantôme) ; validation d'identification silencieuse sous l'Enregistrer unique. Coût S. Créé 5 août 2026 (audit).
- [x] 🟢 **#391 LIVRÉ 5 août 2026 (1.31.11)** Lot zéro-dette code mort (rapport A7+B8) : `executerImport`+bouton inerte, `executerImportVersBibliotheques` (0 appelant, fusion NON assainie — danger si rebranché), `analyserRessourcesBibliotheques` (0 appelant + buggée), fonctions ciblant des éléments DOM disparus (`mettreAJourGuideGroupeCours` ~8 appels, `mettreAJourApercuGroupeCours`, aperçu enseignant). Créé 5 août 2026 (audit).
- [x] 🟢 **#392 LIVRÉ 5 août 2026 (1.31.12)** Dette db.js (rapport C3+C4+C5) : `setSync` avant `db.ready` saute l'écriture IDB en silence ; `db.get()` ignore memoryCache (export sans flush) ; registre `_SSOT_OWNERS` périmé post-refactor (+ `journeesSansCours` absent). Créé 5 août 2026 (audit).
- [ ] 🟢 **#393 PARTIEL — sous-lot mécanique LIVRÉ 5 août 2026 (1.31.13)** Queue de l'audit — livré : avertissement doublon de dates (#369 étendu), filet des imports interrompus (A8), cleSource() bibliothèque planification, ablation compat 0 appelant (activerGroupeV2 & co). **Restent (décisions)** : politique estCollègue, fusion des enseignants importés, clé nue seancesHoraire, écart doc↔code « x puis y », conversion sparse legacy, dates de repli EN DUR de genererCalendrierComplet (découverte de session : bornes vides → calendrier fantôme 2025). (rapport A8, A9, B10, D3, D4) : import partiel sans filet (chemins d'erreur mi-parcours), `estCollègue` sensible à l'orthographe (restauration bloquée sans contournement), `enseignants` importé par remplacement, clé nue `seancesHoraire` triple-écrite, doublons de dates non signalés (#369-validations), écart doc↔code « x puis y » du sommaire, divers planification. Trier au fil des sessions. Créé 5 août 2026 (audit).

### Bugs UX et cohérence interface

- [x] **#457 LIVRÉ 18 août 2026 (1.87.3)** `forgerInspireDe` ne savait pas lire l'auteur — la trace de provenance affichait « par Inconnu » — **créé et clos le 18 août, trouvé par la PORTE TERRAIN 1.1** (`plans de travail/PORTES-TERRAIN-2026-08-18-skills-et-briqueC.md`).
  - **Symptôme mesuré sur le corpus réel de Grégoire** (mesure 1.1m) : après import inter-trimestre, la carte affiche « Inspiré de **Grille-5 FR-HOLIS-30 A25** par **Inconnu** ». Le NOM est juste — c'est ce que le correctif `ca7564bb` a réparé — mais l'AUTEUR reste « Inconnu ».
  - **La porte avait été cochée ✓** : à l'écran, le correctif *semble* marcher. **C'est le champ de mesure qui a attrapé le défaut**, en forçant à recopier le texte exact. Une case à cocher seule l'aurait laissé passer.
  - **Cause, vérifiée au code** : `BibliothequeUI.forgerInspireDe` (`js/bibliotheque-ui.js:164`) lit `itemSource.auteur`. Or une grille créée par le chemin normal (`sauvegarderGrilleTemplate`, `js/grilles.js:707`) **ne porte aucun champ `auteur`** : son auteur vit dans `metadata_cc.auteur_original`. Le fallback `|| 'Inconnu'` mord donc toujours. Seules les grilles issues de `dupliquerGrille` (`:1012`) portent un `auteur` racine.
  - **Portée : transversale, pas cosmétique.** 11 appelants de `forgerInspireDe` — `grilles.js`, `echelles.js` (×2), `cartouches.js` (×2), `pratiques-gestion.js` (×3), `pratiques.js`, `bibliotheque-ui.js`. Tout item dont l'auteur ne vit que dans `metadata_cc` perd son attribution. **Cette trace existe pour respecter CC BY** : elle perd précisément ce qu'elle est censée conserver.
  - ✅ **CORRECTIF** : `BibliothequeUI.resoudreAuteurSource(item)` extrait la résolution en un point unique, appelé par `forgerInspireDe`. Ordre : `auteur` (posé à la duplication) → `metadata_cc.auteur_original` (bloc CC canonique, chemin de création) → `auteurOriginal` (matériel reçu d'un autre enseignant) → `'Inconnu'`. **Un seul point corrigé pour les 11 appelants.**
  - **Vérifié avant d'écrire** : aucun des 3 consommateurs de `inspireDe.auteur` (`partage-section.js:104`, `bibliotheque-ui.js:242`, `cc-license.js:1176`) ne dépend du `'Inconnu'` produit — chacun porte déjà son propre fallback.
  - **Sentinelle** `tests/unit/sentinelle-inspirede-auteur-457.test.js` (9 cas), **break-testée TROIS fois, ROUGE à chaque fois, sur une assertion distincte** : (1) retour au code d'avant → les 2 cas réels rougissent ; (2) retrait du dernier maillon `|| 'Inconnu'` → les 2 cas « aucune source » rougissent ; (3) inversion de l'ordre → le cas de priorité rougit.
  - ⚠ **Le premier break-test a emporté le correctif** : `git checkout` sur un fichier non encore commité. Refait avec une copie de sauvegarde. Sans le contrôle qui a suivi, le bump serait parti sans le code.
  - Vitest **2710/2710** (269 fichiers). **Ne répare pas l'existant** — décision 3.3 : laisser (1.2m = 0/3).
  - **Ne répare PAS l'existant** : les traces déjà écrites gardent « Inconnu ». Décision 3.3 de la porte terrain (Grégoire, 18 août) : **laisser** — mesure 1.2m = 0/3 grilles concernées.
  - Voisin, distinct : **#342** (attribution CC figée au mauvais enseignant). Ici, l'auteur n'est pas faux, il est **absent**.

- [x] ⚠️ **#368 FAIT — VÉRIFIÉ PAR GRÉGOIRE le 18 août 2026** (« oui, la carte 601-101 est vraiment en A26 ») : le point marqué « à vérifier EN PREMIER » depuis le relais du 11 août est levé — la rentrée A26 a sa carte dans son trimestre. ⏳ Restes optionnels de l'entrée : le ménage (carte « Sans titre » vide d'A26, original H2026 à sa guise) et la confirmation Safari du panneau d'import (les magasins sont des îles — la carte y voyage par codex, cf. #451). — Migrer la carte d'alignement 601-101 de Hiver 2026 vers Automne 2026 — ⮕ **OUTILLÉ depuis 1.49.0 (#407 lot 2)** : le geste est maintenant d'un clic (Alignement → planificateur vide → « Reprendre… », ou Actions → Importer d'un autre trimestre → groupe « Même cours »). Prérequis : que la carte de H2026 soit rattachée au cours 601-101 (Actions → « Cours rattaché… »). Reste une action GRÉGOIRE sur ses données réelles. — créé 4 août 2026 (action GRÉGOIRE, données réelles sur le Mac ; reportée en fin de session d'exercice, Grégoire travaillait ailleurs avec Cowork).
  - Contexte : la carte « Écriture et littérature (A26) » a été construite alors que Hiver 2026 était le trimestre actif ; le trimestre Automne 2026, créé en cours d'exercice, est devenu l'actif — la carte semblait « perdue » (constat du 4 août).
  - **Parcours (outil livré en 1.30.0)** : rester dans Automne 2026 → Alignement → Actions → « Importer d'un autre trimestre… » → Hiver 2026 → Importer. Copie indépendante ; les notes de séance suivent ; la source reste intacte.
  - **Vérifier après import** : nombre de nœuds, liens, pastilles de périodes du sommaire, une vue leçon au hasard. Puis ménage optionnel : supprimer la carte « Sans titre » vide du trimestre A26, et (plus tard, à sa guise) l'original sous H2026.
  - Porte terrain associée : premier usage réel du panneau d'import inter-trimestre (sentinelle Chromium verte ; Safari réel = à confirmer ici).

- [x] **#367 LIVRÉ 7 août 2026 (1.50.0)** Namespacer `planification_seances` (Objectif/Notes des vues leçon) **ET passer la clé du dictionnaire en composite `carteId+leconId`** — créé 4 août 2026, **re-diagnostiqué le soir même par sonde** (le constat initial était faux), **ÉLARGI le 5 août par l'audit qualité (rapport D1, 🔴 CONFIRMÉ)**.
  - **⚠ AUDIT 5 AOÛT (D1) — la migration par trimestre NE SUFFIT PAS** : les ids de nœuds (`planif-noeud_N`) sont uniques PAR CARTE seulement (compteur par carte, `planification-carte.js:864/1485`) et le dictionnaire des notes est PLAT par id de leçon (`:3559-3565`, `:5317-5320`) → les notes sont déjà aliassées/écrasables ENTRE CARTES d'un même trimestre ; `supprimerNoeud` ne purge jamais l'entrée (une nouvelle leçon à id recyclé hérite des vieilles notes) ; l'import inter-trimestre préserve les ids → alias aussi, et `copierSeancesLecons` ignore silencieusement les notes importées si l'id est pris. **Les deux décisions (namespace trimestre + clé composite carteId+leconId, avec migration des entrées existantes) doivent se prendre ENSEMBLE.** Repro au rapport.
  - **RÉALITÉ VÉRIFIÉE (sonde Chromium, `cle('planification_seances')` avec trimestre actif)** : la clé est retournée **NUE** — cas « clé non reconnue » de `cle()`. Les notes de séance sont donc PARTAGÉES entre tous les trimestres **et la démo y écrit aussi** (pollution croisée démo↔réel possible). Ce n'est pas un simple trou de registre : c'est une clé jamais namespacée.
  - **Chantier réel** : (1) ajouter la clé à `CLES_NAMESPACEES` ; (2) **migration au boot** de la clé nue vers namespacée, patron #358 (flag one-shot dans `main.js`) ; (3) audit fait le 4 août : les 3 boucles `CLES_NAMESPACEES.forEach` sont sûres (export de trimestre = amélioration, 2 migrations legacy = rangements corrects) ; (4) sentinelle break-testée + backup préalable.
  - **📐 Décision Grégoire avant de coder — cible de migration** : dupliquer la clé nue vers TOUS les trimestres existants (aucune perte, orphelins bénins) ou vers le seul trimestre actif (propre, mais les notes des cartes restées dans un autre trimestre les perdent de vue) ? Recommandation Claude : dupliquer vers tous, purger la nue.
  - ✅ **DÉCISION GRÉGOIRE (7 août)** : dupliquer vers TOUS les trimestres, purger la nue. **Livré avec la composition `<carteId>::<leconId>` dans le même lot** — namespacer sans composer n'aurait réglé que la moitié du rouge D1.
  - **Sémantique retenue** : *chaque carte garde ce qu'elle AFFICHE aujourd'hui*. Toutes les cartes lisant le même dictionnaire plat, la migration fige l'état visible — elle ne propage rien de neuf et ne retire rien. C'est la lecture la plus sûre de « dupliquer vers tous ».
  - **Aucune perte** : la clé nue est ARCHIVÉE dans `planification_seances_archive_pre367` avant purge, ce qui couvre les notes dont la leçon n'existe dans aucune carte (elles n'ont pas de destination composite). ⮕ Retrait de l'archive : **#409**.
  - **Portes** : `cleNoteLecon()` (porte unique de composition, `planification-carte.js`) ; `cleNote()` dans `organisateur.js` qui y délègue et rend **null** sans carte identifiable — pas de repli sur la clé nue, qui recréerait l'aliasing. `supprimerNoeud` purge enfin la note. `copierSeancesLecons` devient ACTIVE (elle était no-op) et traduit carte source → carte d'arrivée.
  - Sentinelle `tests/unit/sentinelle-367-notes-lecon.test.js` (16 cas, le bloc de migration de `main.js` est EXTRAIT et rejoué — pas réimplémenté). **11 break-tests ROUGE→VERT.**
  - Note : `copierSeancesLecons` (`planification-donnees.js`, livrée en 1.30.0) est écrite pour le monde POST-migration — no-op inoffensif aujourd'hui (les notes suivent déjà via la clé partagée), s'active d'elle-même après (commentaire en place). Fichier(s) : `js/trimestres.js`, `js/main.js` (migration), `js/planification-donnees.js`, `docs/DATA-OWNERSHIP.md`.

- [ ] 🟢 **#366** Retirer le badge « 🔧 En évolution » du module Alignement — créé 4 août 2026 (session exercice 601-101, décision Grégoire).
  - Badge + note posés dans l'en-tête de la sous-section Alignement pédagogique pendant le chantier de développement piloté par la pratique (`index.html` en-tête `#conception-carte` ; `styles.css` classes `planif-badge-evolution` / `planif-note-evolution`, marquées TEMPORAIRE).
  - **Critère de retrait explicite (zéro-dette)** : exercice d'alignement 601-101 terminé ET module jugé stabilisé par Grégoire — échéance probable fin de l'été 2026. Ne pas laisser traîner : un bandeau « en développement » permanent devient invisible et décrédibilise le message.

- [x] 📐 **#365 CLOS 19 août 2026** Namespacer le **bilan réflexif** par trimestre — créé 2 juillet 2026 (Cowork, Grégoire ; item recréé en vague 2, la modification locale du Mac n'ayant jamais été poussée). **✅ AUDIT FAIT (2 juillet, vague 2) : AUCUN manque de namespacing trouvé** — la question retourne à Grégoire (préciser le symptôme observé, ou clore).
  - ✅ **CLÔTURE (19 août 2026, exigence de Grégoire confirmée : « il doit être namespacé par trimestre »)** — c'est DÉJÀ le cas, re-vérifié au code : les quatre clés (`questionnaireBilan`, `resultatsBilan`, `parcoursBilan`, `autoreflexionBilan`) passent toutes par `window.cle()` (`bilan-reflexif-core.js:310-313`), aucune n'est dans `CLES_GLOBALES`, aucun écrivain ne contourne `cle()` (grep sur `js/` : zéro accès nu hors du module propriétaire). Stockage effectif : `h2026_parcoursBilan`, `a2026_parcoursBilan`, etc.
  - ⚠ **Nuance consignée** : le namespace est par TRIMESTRE, pas par cours — deux cours donnés le même trimestre partagent le même bilan. Grégoire a évoqué « et même selon les cours » : si cette séparation-là devient un besoin réel, c'est un item NEUF (changement de clé + migration), pas une réouverture de celui-ci.
  - **Résultat d'audit (2 juillet 2026, lecture seule, les 9 modules `js/bilan-reflexif*.js`)** : (1) les 4 clés de données (`questionnaireBilan`, `resultatsBilan`, `parcoursBilan`, `autoreflexionBilan`) passent par `window.cle()` (`bilan-reflexif-core.js:310-313`) et TOUS les accès de persistance passent par ces helpers (`core:320-328`, `csv:98/577`, `rapport:661` removeSync, `bilan-reflexif.js:58-90`) ; (2) `parcours.js:401` lit `productions` via `cle()` ; (3) `editeur`/`data`/`import-export-texte` : zéro accès stockage (travail en mémoire + fichier) ; (4) seul accès brut = `bilan_aide_<cle>` (`core:367/386`) — préférence UI de repli des panneaux d'aide, transversale aux trimestres par nature, PAS une donnée ; (5) ordre de chargement : `trimestres.js` (index.html:14635) précède tous les modules bilan (14742+) → le repli « clé nue » des helpers `CLE_*()` ne s'exerce jamais en production.
  - **Si un symptôme terrain a motivé l'item** (ex. bilan d'un trimestre visible dans un autre), le documenter ici : l'audit statique ne l'explique pas par les clés — piste suivante = données héritées d'avant le namespacing (clés nues résiduelles en stockage), à vérifier en console sur données réelles.
  - Fichier(s) : `js/bilan-reflexif-core.js` + modules bilan-reflexif associés.

- [ ] 🟡 **#364** **Accompagnement utilisateur** — combler les manques d'aide révélés par l'audit du 29 juin 2026 (post-#358/#326). **Tuyau déjà livré (1.26.1, commit `050a00a9`, non poussé)** : cache-busting (41 `?v=` figés en avril-mai privaient les testeurs en cache du travail récent) + entrée changelog **1.26** manquante (retour du comparateur). Restent 3 sous-lots de **contenu d'aide** — texte vu par les testeurs, donc Grégoire valide la formulation avant pose. Audit mené par workflow 5 tâches + vérif adverse. Mémoire : [[audit-accompagnement-utilisateur-2026-06-29]].
  - **T3 — Comparateur de pratiques (#326) sans aucune aide** : 0 entrée hover/popup/terme (vérifié). À ajouter : popup `labo-comparateur`, termes glossaire (« comparateur de pratiques », « maquette (de pratique) », « dériver une maquette »), bouton d'aide. ⚠ **Piège attrapé par la vérif adverse** : un bouton d'aide statique dans `index.html` serait EFFACÉ — `rendreComparateur()` (`comparateur-pratiques.js:647`) réécrit tout l'`innerHTML` → l'injecter en JS dans `entete()` (`comparateur-pratiques.js:667-673`). Figer le vocabulaire « souche » vs « pratique aboutie » (le code utilise les deux).
  - **T4 — Import inter-trimestre / namespacing non expliqué au point d'usage** : enrichir le terme `namespacing-prefixe-trimestre` (`accompagnement-contenu-terme.js:449`, aujourd'hui purement technique) avec « import = copie locale, originaux intouchés » + popup dédiée + 2 infobulles hover sur les boutons « Tout importer » (grilles/pratiques). Fond confirmé fidèle au code (option A non-remappage, copie profonde, `inspireDe`, avertissement). Corrections mineures (minuscules dans le glossaire, garder le terme court). Note : « import = copie » est déjà annoncé au changelog 1.21 ; T4 = l'aide **au point d'usage**.
  - **T5 — Visite guidée : vérif live après la refonte nav** : **aucune cible morte** (8 cibles vérifiées en statique). 2 confirmations au navigateur (sombre + clair) : `#btn-toggle-tampons` monté < 150 ms après `sectionAffichee` ; flèche présences sur la 1re cellule. Nettoyage optionnel : `:first-of-type` sémantiquement inutile (`accompagnement.js:562`).

- [x] 🟡 **#362** ✅ **RÉPARÉ 5 août 2026 (soir) — séance guidée console sur données réelles, les 3 facettes + #354.** Grilles h2026 **désappariées des évaluations** — les 408 évals h2026 référencent 3 grilles dont la **définition est absente** du jeu de travail (`grille_1770742838756` Grille-4, `grille_1772187755149` FR-HOLIS, `GRILLE1759529438501` FR-ALGO) ; le dropdown montre 3 copies orphelines « …A25 ». Découvert 28 juin 2026 (nuit), lecture seule sur export 18h00. **Englobe #354.**
  - **✅ RÉPARATION EXÉCUTÉE (5 août soir, avec Grégoire, backup Codex préalable, oracle avant==après : 383 évals actives / Σnotes 24073,5 / 408 totales — AUCUNE note touchée)** : (1) **grilles** recréées sous les ids attendus par les évals depuis les copies « H26 » (couverture critereId vérifiée en live : 203/205, 92/92, 86/86 — les 3 outliers connus §0bis), noms de Grégoire conservés, copies retirées + cartouches doublonnes purgées (`db.removeSync`) ; (2) **échelle `1767389426695` « IDME0 - H26 »** recréée dans `h2026_echellesTemplates` depuis la **définition embarquée** trouvée dans `h2026_pratiquesConfigurables[9].config.echelle` (0=0, I=40, D=65, M=75, E=100 — champs `valeurCalcul` + `valeur_pourcentage` posés jumeaux) ; (3) **productions↔cours** : `reparerCoursIdProductions` (10 artefacts) + conteneur Portfolio aligné à la main + `reparerReferencesProductions` (8 remaps grilleId, dont artefacts 5/9 qui portaient l'id d'une AUTRE famille) ; (4) **#354** : préf `grilleReferenceDepistage` = `grille_1772187755149_uq1oiiafa` (re-sélection menu) ; (5) **4ᵉ source de « cours actif » découverte et réalignée** : `cours[].actif` (registre GLOBAL, seul écrivain `contexte.js:156`, ignoré par la chaîne d'activation GC) — les **3 doublons 601-102 (cours de TEST, jamais donné — dixit Grégoire) étaient TOUS actif=true** → `getCoursActifId()` rendait 601-102 → vues vides ; drapeaux réalignés sur 601-101. **À verser au chantier #394** (réunification) : cette 4ᵉ source.
  - **⚠ INCIDENT-LEÇON (protocole)** : premier passage exécuté sur le build LOCAL ~1.31.3 (pré-vague) → les écritures `db.set` de l'outil ont **REVERTÉ au rechargement** (localStorage saturé 169-173 %, IDB non drainé — la classe exacte fermée par #392) ; les écritures `setSync`+`db.flush()` explicite ont TENU. Rejoué après `git pull` (1.31.13) : `✓×11` stable post-⌘R. **Règle à retenir : réparation de données UNIQUEMENT sur build à jour, et `db.flush()` explicite après CHAQUE écriture console.**
  - **RÉSIDUS (consignés, pas d'écriture)** : (a) 44 évals référencent `ECHELLE_DEMO` — id disparu même côté démo (les échelles démo sont `ECH_DEMO_*`) ; laissé tel quel (notes stockées, repli générique cosmétique) ; (b) **3 doublons `601-102` dans le registre global `cours`** (cours de test) — retrait complet à cadrer (énumérer les référents : GC de test, horaires — précautions SKILL_integrite_globaux) ; (c) portes terrain : ✅ vue « Liste des évaluations » et « Liste des productions » du profil VALIDÉES en direct (captures 14h54 : productions, statuts, niveaux, notes, jeton de reprise affichés) ; restent dépistage SOLO sans warning, tableau de bord C/P repeuplés (recalcul en cours — quotas routés memoryCache+IDB, bénin), iPad.
  - **#353 chiffré en passant** : alerte live 169 % → **173 % du budget (8882 Ko / 5120 Ko, 456 clés)** ; top 5 = clés `*_snapshots*` (233/230/190/183 Ko) + `a2025_presences` (178 Ko) — donnée d'entrée pour trancher les options 2/3/4 au retour.
  - **Impact** : notes **SAINES** (stockées par éval, L0 vert) ; cassé = dépistage SOLO (« Pas de grille de référence » ×23), affichage des critères, menu « Grille d'évaluation » vide à l'ouverture d'une éval, ré-évaluation.
  - **Cause** : artefact de la **reconstruction de juin** — de nouvelles grilles (« A25 ») ont reçu de nouveaux ids ; les évals (grade-bearing, jamais réécrites, invariant #350) gardent les anciens ids. Pattern **#346** sur `evaluation.grilleId`. **Ni #358 ni le correctif de boot du 28 juin n'en sont la cause.**
  - **⚠ CONFIRMÉ + ÉLARGI EN TERRAIN (5 août 2026 soir, diagnostic console lecture seule avec Grégoire, poste réel)** : (1) **échelles** — la console inonde de `[construireConfigComplete] Échelle "1767389426695" non trouvée, utilisation échelle par défaut` (`pratique-registre.js:261`) et `h2026_echellesTemplates` ne contient QUE `ECHELLE_GENERIQUE` — le « ⚠ Vérifier AUSSI les échelles » de cet item est un fait, plus une hypothèse ; (2) **NOUVELLE facette : productions↔cours désappariés (famille #346)** — les **11** `h2026_productions` portent toutes l'ancien `coursId` `COURS1766455789356` alors que le cours du GC actif est `h2026-601-101-MQ-00001` → le filtre par cours actif ne voit AUCUNE production (symptôme utilisateur : « mes étudiants H26 n'ont plus aucune production assignée » ; C moy = 0 %, replis « Calcul à la volée » en boucle dans la console). **Vérifié sain** : trimestre actif h2026 ✓, 408 évals ✓, `a2025_productions` 11 ✓, clé nue vide ✓ (pas de #352). **La session de réparation dédiée de cet item doit couvrir les TROIS facettes ensemble** (grilles + échelles + coursId des productions), avec backup préalable — même artefact racine (reconstruction de juin, ids recréés).
  - **Récupérable (SÛR)** : les `critereId` des copies « A25 » sont **identiques** à ceux attendus par les évals → recréer les 3 grilles **sous les ids des évals** avec le contenu des copies A25 + **noms propres** (résout aussi le **renommage** demandé). Puis fixer `grilleReferenceDepistage = grille_1772187755149` (#354) + retirer les orphelines. ⚠ Vérifier AUSSI les **échelles** (`h2026_echellesTemplates` n'a qu'`ECHELLE_GENERIQUE`) et les cartouches. Plan + tableau de correspondance : `plans de travail/RELAIS-grilles-h2026-desappariees.md`. Séance dédiée (backup + L0 h2026 avant/après identique). Mémoire : [[grilles-h2026-desappariees]].

- [x] 🟢 **#361** ✅ LIVRÉ 2 juillet 2026 (1.27.0) — fonction de **suppression de trimestre** intégrée (stub remplacé)
  - **✅ LIVRAISON (2 juillet)** : cœur `supprimerTrimestre(id)` dans `trimestres.js` (garde anti-trimestre-ACTIF ; union `db.keys()` + `localStorage` + `memoryCache` ; `await db.remove` par clé ; registre `trimestres` protégé du filtre puis nettoyé ; items `cours` du trimestre retirés ; `db.flush()` final). Parcours UI `confirmerSuppressionTrimestre` (`trimestre-v2-liste.js`) : garde anti-actif AVANT toute confirmation → explication archivage vs suppression → **ressaisie du nom exact** → export de sauvegarde automatique (refus possible de continuer si l'export échoue) → message d'état avec compte de clés. Boutons « Supprimer… » (`.btn-supprimer`) sur les trimestres NON actifs (liste de gestion + menu ⋮ bibliothèque). **Zéro-dette** : stub `supprimerTrimestreActif` RETIRÉ. Sentinelle `sentinelle-suppression-trimestre-361.test.js` (9 cas ; break-test : garde anti-actif neutralisée → ROUGE). ⚠ Porte terrain (août) : parcours réel sur un trimestre de test, 2 modes.
  - **Constat** : `supprimerTrimestreActif` (`trimestre-v2-liste.js:344`) n'est qu'un `alert` (« pas encore disponible »). Les trimestres de test se suppriment au coup par coup via snippet console (e2026 le 28 juin, a2024 ensuite — cf. `plans de travail/PLAN-358-migration-modeles.md §6`). Besoin récurrent → mérite une vraie fonctionnalité.
  - **Logique de suppression sûre déjà éprouvée (snippet a2024)** : (1) garde anti-trimestre-ACTIF (interdire la suppression du trimestre actif) ; (2) énumérer TOUTES les clés liées = union `await db.keys()` (IndexedDB) **+** `Object.keys(localStorage)` **+** `db.memoryCache` (db.keys() ne rend QUE l'IDB → les petites clés localStorage seraient ratées) ; filtre `k===id || k.startsWith(id+'_') || k.includes(id)` ; (3) `await db.remove(k)` par clé (couvre localStorage + IDB) ; (4) retirer l'entrée du registre `trimestres` ; (5) nettoyer les items `trimestre===id` dans les globales (`cours`) s'il y en a.
  - **UX à cadrer** : distinguer clairement de l'**archivage** (lecture seule, conserve) vs **suppression définitive** ; confirmation forte (ex. ressaisir le nom du trimestre) ; proposer un export/backup avant ; message d'état clair. Accessibilité + 2 modes.
  - **Sécurité/tests** : zone sensible (perte de données) → sentinelle Vitest (la garde anti-actif doit ROUGIR si contournée) + break-test ; ≥ 1 test couvrant la suppression.

- [x] 🟡 **#360** Distinguer/prévenir reprises légitimes vs doublons d'évals orphelins — **CŒUR LIVRÉ le 28 juin 2026 (1.24.0)** (Option A, vérif adverse 6 agents + 6 break-tests). Mémoire : [[distinguer-reprises-doublons]].
  - **Symptôme** : plusieurs évals ACTIVES (sans `remplaceeParId`) coexistent pour un couple (etudiantDA, productionId). 4 cas réels recensés (a2025 Taly/Samuel/Ally, h2026 Elisa) ; 3 orphelins note-égale NETTOYÉS le 28 juin (inertie prouvée), Samuel laissé (divergent).
  - **Livré** : module pur `js/entites/reconciliation-evaluations.js` (réconciliation NOTE-ÉGALE — 6 conditions moteur, exclut les 4 marques de reprise + verrouillées, note 1 décimale, survivant ciblée>reprise>1er) appelé dans les 2 chemins de save (`evaluation-sauvegarde.js`, `evaluation-chargement.js`) avec persistance avant bascule. **Option A** : drapeau discriminant `reconcilieParDoublon` posé avec `remplaceeParId` (moteur inchangé) et IGNORÉ par les link-followers de reprise (`restaurerOriginaleSiReprise`, `retirerJetonReprise` 2 branches, avertissement cosmétique). +2 fix d'affichage (label « remplacée par une reprise » et compteur « sur N artefacts »). Sentinelle `tests/unit/sentinelle-reconciliation-doublons-360.test.js` (16 cas). Plan : `plans de travail/PLAN-360-prevention-doublons-evals.md`.
  - **RESTE (sous-lots reportés, chacun sa propre ouverture)** : (a) **tarir le `splice` de reprise** = DÉCISION PRODUIT (radio « supprimer l'originale » index.html:6372 → toute la chaîne UI/config) ; (b) **diagnostic rétroactif** sur `migration-diagnostic.js` (dry-run, par trimestre, 6 conditions, LISTER les divergents) = SESSION DÉDIÉE, RISQUE DONNÉES.
  - **Limite assumée** : seuls les surnuméraires NOTE-ÉGALE sont réconciliés ; un orphelin re-noté DIVERGENT (≈ Samuel) reste intact (jamais trancher un divergent). Cause racine (non-persistance silencieuse `db.js:1104`) hors périmètre, connectée #352/#353.

- [ ] 🟡 **#350** Recalcul à l'ouverture d'une éval A25 (rédaction) : le critère « Français écrit » algorithmique affiche **0 erreur** au lieu du nombre stocké → note recalculée gonflée (éval-pilote terminale 76,6 → 88 %) — révélé 25 juin 2026 par le pilote A25 ; **données stockées intactes** (`donneesAlgorithmiques.totalErreurs` présent, notes = Omnivox, golden master L0 vert)
  - **Cause (fait, vérifiée au code)** : données saisies en mode catégories (codes) mais `activerCategorisationErreurs` absent de `a2025_modalitesEvaluation` → rendu en mode simple (`evaluation-chargement.js:828-836`) → codes non restaurés (`evaluation.js:1346-1391`) → 0 erreur affichée → recalcul à 100 % sur le critère (20 %).
  - **Cause (contexte, Grégoire)** : A25 évalué par un moteur d'évaluation **antérieur** (codes saisis manuellement, calcul différent, module d'annotation inexistant) → le moteur actuel ne reproduit pas mécaniquement les notes A25.
  - **Famille** : #347 (recalcul live ≠ historique reçu) / #349 (états transitoires au chargement).
  - **Traitement** : contourné pour A25 (activer le mode catégories — Phase 0 de `plans de travail/PLAN-reconstruction-trimestres.md`), puis résolu par la reconstruction native (Phase 2). **À vérifier pour H26** (le bug d'ordre pourrait exister mais n'a jamais été rencontré).

- [ ] 🟢 **#349** Flicker au chargement d'une éval (consultation archivée) : le formulaire flashe « éditable + modèles H26 » avant l'état final « lecture seule + échelle A25 non résolue » — créé 25 juin 2026 (terrain A25, capturé par Grégoire ; **préexistant**, cosmétique). **MàJ 25 juin PM** : composante 2 (échelle vide) **résorbée par le pilote A25** (modèles posés).
  - **Symptôme** : à l'ouverture d'une éval A25, l'écran affiche successivement deux états — (1) échelle « IDME0-H26 » remplie, libellés bleus, bouton **Enregistrer actif** ; (2) échelle **vide**, libellés noirs, bouton **grisé** (lecture seule). Cartouche « Analyse littéraire (Kanatuut) » → « Analyse littéraire ».
  - **Cause (faits, vérifiée au code)** : `modifierEvaluation` (evaluation.js:1781) charge l'éval dans un `setTimeout` asynchrone de **17 étapes** (1897-1947). Le formulaire est **peuplé éditable** (étapes 1-12) PUIS **verrouillé** à l'**étape 13-14** (`_gererIndicateurEtVerrouillageModif:2257` → `desactiverFormulaireEvaluation(true)` si `evaluation.verrouillee`). Les `await`/`setTimeout` entre étapes laissent le navigateur **peindre les états intermédiaires** → flicker.
  - **Deux composantes** : (1) **éditable→lecture seule** = verrouillage appliqué tardivement (étape 14, après le peuplement) — cosmétique, **indépendant du pilote** ; (2) **échelle H26→vide** = le select est peuplé avec les échelles globales H26 (repli, `a2025_echellesTemplates` pas posé) puis la sélection de l'échelle A25 sauvegardée échoue (absente) → vide. **Se résorbe avec le pilote A25**.
  - **Correctifs possibles (à trancher)** : (A) **masquer/voiler** le formulaire pendant la séquence, révéler dans le `finally` — couvre tout le flicker ; touche `modifierEvaluation`, valider mode « annoter » + visionneuse côte-à-côte ; (B) **anticiper** `desactiverFormulaireEvaluation(true)` au début si l'éval est verrouillée — cible le flash de mode, plus sûr ; la composante échelle reste jusqu'au pilote.
  - **PAS une régression de la session du 25 juin** : `modes.js` et le résidu `evaluation.js` (séquence de chargement) non touchés par les 10 commits ; confirmé « pas nouveau » par Grégoire.
  - **Séquencement** : cosmétique, non bloquant ; idéalement **après le pilote A25** (qui résorbe la composante 2).

- [x] 🟡 **#348** Consultation d'une éval A25 dont la grille manque des templates → crash « Impossible de charger l'évaluation » (DOM `null`) — créé 25 juin 2026, **crash RÉSOLU + validé terrain le 25 juin** (terrain, éval terminale d'un élève, A25 actif)
  - **Symptôme** : activer A25 → ouvrir l'éval terminale d'un élève → bandeau rouge « Impossible de charger l'évaluation: null is not an object ». `TypeError` à `evaluation-chargement.js:978`.
  - **Cause (faits)** : `afficherCriteresDepuisGrille` (repli quand la grille est introuvable) fait `document.getElementById('listeCriteresGrille1').innerHTML = …` **sans garde** → l'élément est `null` → le crash interrompt tout le chargement de l'éval. Déclencheur : grille `GRILLE_A2025_FR_ALGO` absente des templates (copies `a2025_grillesTemplates` pas encore posées = **pilote A25 en attente**, cf. #339 constat 2).
  - **Pas une régression du namespacing — CONFIRMÉ par le diff** : `a93395aa` (Brique A éval, 24 juin) n'a changé dans `afficherCriteresDepuisGrille` que la **lecture** (`'grillesTemplates'` → `cle('grillesTemplates')`), PAS la ligne du crash (`getElementById('listeCriteresGrille1').innerHTML`, inchangée). En A25 sans `a2025_grillesTemplates` (pilote pas posé), `cle()` retombe sur le global → lecture **identique** à avant → no-op ; aucun commit du 24-25 ne touche ce chemin. Mes 8 fichiers (écrans d'analyse, 25 juin) ne touchent pas non plus ce fichier. **Origine réelle** : bug de robustesse **préexistant** (accès DOM sans garde), **révélé le 23 juin** par l'isolation des grilles A25 (évals re-pointées vers `GRILLE_A2025_FR_ALGO`, absente des templates → condition « grille introuvable »). À élucider au correctif : pourquoi `listeCriteresGrille1` est absent du DOM sur l'**éval terminale individuelle**.
  - **✅ RÉSOLU (25 juin, commit `4b0095ee`, validé terrain)** : garde DOM dans `afficherCriteresDepuisGrille` (variable `conteneur` + early return), alignée sur le jumeau gardé `_afficherCriteresDepuisEvaluation`. L'éval terminale se charge et affiche ses résultats (critères/niveaux/note depuis données sauvegardées) ; l'encadré « Grille d'origine introuvable » s'affiche au lieu de planter. Sentinelle comportementale break-testée `sentinelle-crash-criteres-grille-absente-348`. **Cause de fond** (grille A25 dans les templates) = pilote A25.
  - **Résiduel échelle — bruit TU (25 juin, commit `e657cee2`, à valider terrain)** : à la consultation A25, `calculerNote` (rappelée en cascade au chargement ← changerEchelleEvaluation / niveauSelectionne / changerStatutIntegrite) émettait 4× `❌ Aucune échelle de performance sélectionnée` (evaluation-calcul.js:546). Le bloc dégradait déjà (note « -- ») ; le cri est retiré (aligné sur le cas « grille manquante » silencieux) + gardes DOM. Sentinelle `sentinelle-calculerNote-echelle-non-resolue-348`. **Fond inchangé** : l'échelle A25 ne se résout pas en consultation d'un trimestre archivé (sélecteur « Échelle » vide) = **pilote A25** (même racine que #340-T3 / finding #2 chantier D). Voisin NON corrigé (hors cas terrain) : `❌ Aucune échelle de performance configurée` (evaluation-chargement.js:313), même famille — à auditer si observé.

- [ ] 🟡 **#346** Migration d'id de cours incomplète : les productions gardent l'ancien `coursId` après ré-identification du cours — créé 24 juin 2026 (terrain H26, session Claude Code)
  - **Symptôme** : tous les travaux H26 affichés « Non associé » (Liste des évaluations), en-tête « 1 production » au lieu de 11. **Cause** : les 11 productions H26 portaient `coursId: COURS1766455789356` (ancien id du cours, créé 23 déc 2025, **absent** de la collection `cours`) alors qu'évals (409), présences (1617), élèves (51) et la fiche `cours` canonique utilisent `h2026-601-101-MQ-00001`. Le filtre `production.coursId === coursActif.id` (`modes.js:624`) écartait donc toutes les productions → fichiers orphelins (`liste-evaluations.js:798`), en-tête « 1 production » (`liste-evaluations.js:564`).
  - **Ce n'est PAS la contamination #340** : vérifié via le backup du 22 juin — `productionId`, titres et fichiers concordent = vraies productions H26 ; le désalignement **préexistait** au 22 juin. C'est une **migration d'id de cours qui a oublié `productions`** (évals/présences/élèves migrés vers le nouvel id, productions non).
  - **✅ RÉPARÉ EN DONNÉES (24 juin, console one-shot)** : `h2026_productions[].coursId` `COURS1766455789356 → h2026-601-101-MQ-00001` (11 productions ; backup pris avant ; `productionId` **inchangés** → liens fichiers/évals préservés). Travaux ré-associés, validé terrain.
  - **RESTE (cause de fond, à froid)** :
    - Fiabiliser la **migration d'id de cours** pour qu'elle inclue `productions` (auditer les autres collections à `coursId`) — éviter la récidive.
    - **Doublons de fiches `cours`** : `601-101-MQ` en double (`h2026-…` + `COURS_1780008321319_…`), `601-102-MQ` en triple — dédupliquer.
    - **Warning « Fichier sous X » trompeur** (`liste-evaluations.js:67`) : affiche la 1ʳᵉ autre production de l'élève (≠ localisation réelle) → bruyant quand l'artefact est simplement non remis. Préciser ou retirer.
    - Question ouverte non critique : pourquoi l'association « tenait » au 22 juin malgré le désalignement (cours actif sur l'ancien id à ce moment ?).
  - **Voisin** : `changerTrimestreActif` (`trimestres.js:362`) ne re-peuple pas les écrans déjà affichés (groupes-cours, liste éval) à la bascule de trimestre — un rechargement contourne ; lié au PLAN-namespacing §2 (« swap à la bascule » manquant).

- [x] 🔴 **#345** Masquer le comparateur de pratiques (#326) de l'interface déployée — réversible, conditionné — **LIVRÉ 22 juin 2026** (branche `claude/backlog-bascule-2026-06-19`)
  - **Décision Grégoire (21 juin 2026)** : retirer le comparateur (« Outil en développement ») de la surface exposée à la **CoP de l'AQPC**, le temps que les écarts terrain **#326-T1 à T5** (cf. `Retours des testeurs/SUIVI-BUGS.md`) soient corrigés. **Candidat n°1 du paquet « bloqueurs CoP »** (objectif app stable à expérimenter d'ici la mi-août 2026).
  - **✅ RÉALISATION (22 juin)** : flag unique `const COMPARATEUR_VISIBLE = false;` (`js/config.js`, juste après `configurationsOnglets`, objet protégé non muté ; sémantique fail-open = masque seulement si explicitement `false`). Trois points d'entrée gatés : (1) sous-nav Labo — filtre d'une **copie** dans `afficherSousNavigation` (`js/navigation.js`) ; (2) lien récap wizard — section entière (`js/wizard-pratique-v2.js`) ; (3) bannière maquettes (`js/pratiques-gestion.js`). 4 `?v=` bumpés à `2026062201`. `noms_stables.json` réajusté (4 lignes). **899 Vitest verts** ; terrain Mac validé (Lots 1-2). **RÉACTIVATION** : repasser le flag à `true` quand #326-T1 à T5 sont traités.
  - **Périmètre — traiter ensemble (zéro-dette, pas de lien mort)** :
    - Masquer l'entrée nav **Labo › Exploration des pratiques** (l'entrée principale du banc). ✅
    - Masquer le lien **« Ouvrir le comparateur du Labo »** au récapitulatif du wizard de pratique (vu en A.12). ✅
    - ✅ **Bannière « Gérer mes maquettes » gatée** — correction du présupposé : à la lecture du code elle n'était pas absente mais **conditionnelle** (s'affiche dès ≥1 maquette ; A.11 = 0 maquette chez Grégoire, d'où l'illusion). Sans flag, c'était un lien entrant vers la page masquée → gatée par `COMPARATEUR_VISIBLE` (`js/pratiques-gestion.js`). **Compromis acté** : comparateur + bannière masqués ⇒ des maquettes existantes deviennent temporairement non gérables (réversible ; sans impact pour un membre CoP frais, qui ne peut pas créer de maquette sans le comparateur).
  - **Réversible + conditionné (CLAUDE.md zéro-dette)** : **masquage**, pas retrait de code ; règle de réactivation **explicite** = « réaffiché quand #326-T1 à T5 sont traités » (pas un masquage flou « au cas où »).
  - **⚠️ Zones protégées** : si l'entrée nav passe par `js/config.js` / `js/navigation.js`, masquer via un **flag/condition d'affichage** plutôt qu'en supprimant l'entrée (ces fichiers sont protégés — autorisation acquise pour ce masquage précis seulement).
  - **Vérif** : la sous-nav Labo reste cohérente (pas de trou), aucun lien entrant ne pointe vers une page masquée, rendu OK dans les deux modes. ✅

- [ ] 🟠 **#342** Erreur d'attribution CC : `auteur_original` figé à un mauvais enseignant — créé 15 juin 2026 (extrait de #341). **PRÉVENTION LIVRÉE 19 juin (1.20.0, PR #53)** : retrait du repli silencieux `enseignantsReels[0]` ; défaut applicatif « Inconnu » (plus de nom NI coordonnées personnelles par défaut) ; helper `obtenirIdentiteCCUtilisateur` → « Inconnu ». **RESTE : réparation des données live déjà stampées** (one-shot console READ-ONLY puis ré-écriture `auteur_original`, à exécuter sur Mac — checklist §H).
  - **Symptôme (Grégoire, 15 juin)** : la carte « PAN-Littérature A25 » (pratique de **littérature**, créée par Grégoire) s'affiche « par Bruno V. +1 contrib. ». Bruno enseigne la **chimie** ; il n'est pas l'auteur de cette pratique.
  - **Cause racine (code lu)** : `auteur_original` est dérivé de l'enseignant actif du registre `enseignants` via `obtenirProfilAuteurActifSync` (`cc-license.js:44`) — résolution : dropdown Réglages › Enseignant, sinon `actif`, sinon **`enseignantsReels[0]`** (premier de la liste). Il est ensuite **figé** sur la pratique à la création (`cc-license.js:154`) et y persiste. Une entrée « Bruno V. » (lignée des données de test chimie « Bug Bruno » Beta 95.2) a été l'identité résolue au moment du stamp → gravée sur la pratique de littérature de Grégoire, qui devient « contributeur » de sa propre pratique via `ajouterContributeurSiNecessaire` (`cc-license.js:333`).
  - **Le seed n'est pas en cause** : `pan-standards-bruno` (`js/pratiques/pratiques-predefines.js:22`) est un gabarit de **chimie**, `auteur: 'Labo Codex'` — il ne porte pas « Bruno V. ». Le nom vient donc du registre `enseignants` live, pas du code.
  - **Nature** : données live (non corrigeable depuis le cloud). L'affichage (`bibliotheque-ui.js:189` `formaterAttribution`) et le modèle CC BY sont corrects par conception ; le problème est la **donnée stampée**.
  - **Réparation** : one-shot console (audit READ-ONLY d'abord, puis ré-écriture de `auteur_original`/`contributeurs` sur les pratiques où l'auteur ≠ Grégoire) — patron #331. Préparé en session #341, à exécuter par Grégoire en local.
  - **Prévention à trancher** : faut-il assainir le registre `enseignants` (retirer/marquer la lignée test chimie) et/ou garantir un défaut d'identité CC = Grégoire quand aucun enseignant n'est marqué `actif` (plutôt que `enseignantsReels[0]` silencieux) ?

- [ ] 🟡 **#340** Changement de trimestre : les productions du trimestre quitté écrasent la clé du trimestre cible (`h2026_productions` ← contenu `a2025_productions`) — créé 12 juin 2026, **SYMPTÔME RÉPARÉ (12 juin) + GARDE-FOU ACTIF LIVRÉ (15 juin, 1.17.7) ; reste CONFIRMATION TERRAIN + PREUVE DE L'ÉCRIVAIN FAUTIF** (la garde journalise la pile au prochain déclenchement). Garde-fou prouvé par break-test (audit `Rapports/AUDIT-travail-1.16-1.18-2026-06-16.md`).
  - **Séquence déclenchante (Grégoire, 12 juin)** : session A25 avec « Permission d'écriture » (~04h-06h, saisie dans une éval) → quitter A25, revenir à H2026, hard refresh (~11h30) → `h2026_productions` contient les **11 productions d'A25** (`coursId COURS1766455789356`) dans **les deux couches** (localStorage ET IDB), à la place des 10 artefacts sains (`h2026-601-101-MQ-00001`).
  - **Symptômes en cascade (tous expliqués par la clé écrasée)** : profil « Aucune production configurée », `indicesCP non disponible`, `calculerDetailsNoteFinale` → `prov:true, pf:null, note:null` pour les 51 étudiant·es des 2 groupes. AUCUN lien avec #328 L2-b2 (S1/S2 du terrain conformes : SSOT=helper, miroir mort).
  - **Hypothèse mécanisme** (cohérente, non prouvée) : données A25 encore en mémoire persistées APRÈS la bascule de `cle()` sur le préfixe `h2026_` — patron auto-save race ([[feedback-autosave-race-condition]]) appliqué au changement de trimestre. **Ré-éclaire l'incident du 11 juin** (même clé, même contenu COURS1766455789356) : probablement le même mécanisme, pas une « résurrection IDB ».
  - **Dépistage fait (12 juin)** : contamination limitée à `h2026_productions` (balayage localStorage h2026_* = 1 clé ; `h2026_fichiersTravaux` contient l'id fantôme mais c'est un résidu légitime, déjà présent dans les codex témoins du 29 mai et 11 juin qui fonctionnaient).
  - **✅ RÉPARÉ (12 juin ~12h40, terrain Grégoire)** : tableau sain (10 artefacts, extrait du codex témoin 11 juin 05h11, copie locale `CODEX problématiques juin/h2026_productions_SAIN-a-restaurer-2026-06-12.json`) restauré via console (`var sain=` + pbcopy → `db.setSync` + `db.set`). **Persistance vérifiée APRÈS hard refresh** : localStorage 10 items sains, IDB 10, `getSync` 10, artefacts et notes revenus à l'écran (Artefact 10 D 65,5 % inclus).
  - **Découverte pendant la réparation** : le **localStorage du Mac est SATURÉ** — `db.setSync` d'une clé de 12 Ko a levé « Quota localStorage dépassé » et a basculé memoryCache+IDB (en retirant l'entrée localStorage au passage ; le boot suivant l'a resynchronisée). Une écriture légitime qui échoue par quota au mauvais moment est une condition aggravante plausible du mécanisme — à verser à l'enquête. Lien #334 (saturation iPad) : le Mac est concerné aussi.
  - **✅ ENQUÊTE DE FOND + GARDE-FOU ACTIF LIVRÉS (15 juin 2026)** : `Rapports/ENQUETE-340-contamination-productions-2026-06-15.md`. Mécanisme **structurel** confirmé (RMW async + `cle('productions')` dynamique + `changerTrimestreActif` qui bascule le namespace sans flush). Audit des 17 écrivains : **une seule** vraie fenêtre de course intra-fonction (`ajouterProductionIndividuelle`, fix capture-once) ; **aucun cache mémoire** ; le chemin de sauvegarde d'éval **n'écrit jamais** `productions` → l'écrivain fautif **exact n'est pas prouvable en statique**. Décision Grégoire : **garde-fou actif** au point de persistance (`db.set`/`setSync`) — `js/productions-namespace-garde.js` bloque l'écriture de `<T>_productions` dont le contenu appartient à un autre trimestre (résolution `coursId→trimestreId` via la globale `cours`, anti-faux-positifs sur l'ajout biblio) et **journalise la pile du fautif** → prouvera l'écrivain au prochain déclenchement, sans perdre de données. Sentinelle `tests/unit/sentinelle-namespace-productions-340.test.js` (11 cas, break-testée).
  - **Reste (suite)** : confirmation terrain (reproduire A25→H26, vérifier non-contamination + relever la pile si la garde se déclenche) ; quota localStorage saturé du Mac à verser à #334 ; étendre éventuellement le patron de garde à `evaluationsSauvegardees`/`groupeEtudiants`.

- [x] 🔴 **#332** Chaîne d'assemblage horaire ↔ groupe-cours : sauvegarde UI non persistée + copie pointeur prioritaire sur la SSOT — créé 10 juin 2026 — **✅ LIVRÉ COMPLET** (constat 2 le 11 juin ; constat 1 le 14 juin — fix `7f3c73c7` mécanismes A+B, mergé main via `05e43a7b`, release 1.17.6 ; la fiche ci-dessous disait encore « RIEN d'appliqué » — trace corrigée le 3 juillet 2026, vague 3, enquête `Rapports/ENQUETES-300-301-332-2026-07-03.md`). ⚠ Porte terrain août : changer d'horaire dans le formulaire GC + modifier un GC après changement de trimestre (le protocole de repro devient une validation du fix). La branche distante `claude/332-constat1-noop-save` est absorbée (diff périmé) — suppression au triage.
  - **✅ Constat 2 LIVRÉ (11 juin 2026, code)** : `obtenirSeancesHoraire` dérive maintenant le `horaireId` de la SSOT `groupesCours` (par l'id du GC actif) ; la copie `groupeCoursActif.horaireId` ne sert plus que si le GC est INTROUVABLE dans la SSOT (état transitoire), jamais pour la contredire. Test fonctionnel `tests/unit/sentinelle-horaire-ssot-332.test.js` (5 cas, dont la repro exacte de la désync 00008 et la chaîne de fallback intacte).
  - **Reste Constat 1 (UI, no-op silencieux) — ENQUÊTE DE CODE FAITE 11 juin 2026** : `Rapports/ENQUETE-332-CONSTAT1-2026-06-11.md`. Deux mécanismes CONFIRMÉS à la lecture : (A) le `<select>` horaire du formulaire GC est écrasé par l'auto-association `groupeAssocie` dans son propre handler `mettreAJourNomGroupeCoursV2` (trimestre-v2-groupes-cours.js:262-297) → impossible de changer d'horaire, retombe silencieusement sur l'ancien ; (B) `sauvegarderGroupeCoursV2` :607-623 — `findIndex` raté (id d'édition périmé après changement de trimestre, jamais réinitialisé par `changerTrimestreActifV2`) → AUCUN else, toast « Groupe-cours modifié » quand même. Protocoles de repro console dans le rapport (2-3 min chacun, avec Grégoire) ; options de fix proposées, RIEN d'appliqué.

- [ ] 🟢 **#326** Axe D — Exploration des pratiques dans le Labo (variantes, parenté, diff) — **conception close, SPEC validée 8 juin 2026**
  - **Documents** : `plans de travail/SPEC_D_exploration_pratiques.md` (canonique pour l'implémentation) + `plans de travail/NOTE-CONCEPTION-D-comparateur-variantes-parente.md` (historique de la réflexion). Prolonge #307.
  - **Idée** : décliner une pratique « souche » en **variantes d'essai**, les **comparer pour comprendre ce que chaque réglage change** (diff de config + mapping de phrases d'effet), puis **promouvoir** celle qu'on retient. Finalité inchangée (comprendre, jamais recommander).
  - **Architecture d'information (D-12)** : l'exploration vit dans le **Labo** — élargir `Labo › Comparateur de pratiques` en « **Exploration des pratiques** » (arbre + diff + matrice). Création via **assistant condensé** invocable du Labo. Bibliothèque (Conception › Pratiques) et sidebar ne montrent que les pratiques **abouties**.
  - **Modèle de données** : filiation `inspireDe` (existante, CC BY, **permanente**) enrichie d'un `sourceId` pour l'arbre ; flag **`estEssai`** (transitoire, basculé à la promotion ; `statut` déjà pris sur les étudiants). Stockage unique `pratiquesConfigurables`, filtré par `estEssai`.
  - **Découpage validé (6 lots)** : D-0 (modèle `sourceId`+`estEssai`+arbre pur) → D-1 (`diffPratiques` + mapping, **contenu Grégoire**, DEN inclus) → D-2 (sous-section Labo, **renommage `config.js` — aval Grégoire**) → D-3 (dérivation assistant condensé) → D-4 (matrice + diff + DEN non-simulable) → D-5 (hygiène, consomme #320) → D-6 (validation + release `minor`).
  - **✅ AVANCEMENT (15 juin 2026)** : **D-0/D-1 livrés** (moteur pur `pratiques-exploration.js`). **D-2/D-3 livrés** (couplés) :
    - filtre `estEssai` (helpers `BibliothequeUI.estEssai`/`filtrerParEssai` + 3 sites de présentation sidebar/bibliothèque ; le helper source reste intact pour l'Exploration/wizard/duplication) ;
    - label `config.js` → « Exploration des pratiques » (id `comparateur` conservé) ;
    - `promouvoirPratiqueEssai` (estEssai→false, inspireDe/sourceId INTACTS — invariant CC) ;
    - `deriverVarianteEssai` (nom auto « souche · essai N », `dupliquerPratique{estEssai,silencieux}` + assistant) ;
    - **arbre** dans `comparateur-pratiques.js` (deux régions : arbre des essais + matrice démo ; actions dériver/promouvoir/jeter ; noms `_esc` ; CSS variables 2 modes).
    - Tests : filtre, promotion, dérivation, sentinelle sécurité arbre (break-testés) ; 751 verts.
    - **RESTE** : **D-4** (intégration matrice : diff avant matrice, DEN non-simulable, bouton « Comparer » depuis l'arbre), **D-5** (hygiène : tri/filtre nom/famille/date, péremption douce, consomme #320), **D-6** (**validation terrain Mac+iPad sombre/clair** + release `minor` + changelog). ⚠️ **Passe terrain Grégoire requise sur l'UI de l'arbre** avant release.
  - **PRÉALABLES au code de D** (ordre mutuel libre) : **#320** (répertoires) et **#318** (DEN couche 2 — le diff/mapping doit décrire les réglages DEN). D-0/D-1 (moteur pur) parallélisables avec DEN. **Les deux préalables sont LIVRÉS.**
  - **Garde-fous** : exploration **lecture seule** (n'écrit ni pratique, ni note, ni `estEssai`) ; `inspireDe`/`sourceId` jamais effacés (CC BY) ; `config.js`/`navigation.js` = zones protégées (précédent C4) ; `echapperHtml()` + `data-action` + ≥1 test/lot.
  - **🟠 RECADRAGE TERRAIN + CADRAGE VALIDÉ (16 juin 2026, session Cowork cloud)** — doc unique : `plans de travail/RELAIS-326-refonte-banc-decision.md`. La passe terrain de Grégoire sur l'UI D-2…D-5 montre que **le mécanisme est livré mais le workflow rate sa cible** (« entre deux de MES pratiques, laquelle choisir ? »). **Décisions actées et VALIDÉES par Grégoire** : comparateur = **banc de décision** (la dérivation = support) ; tableau **lecture seule** (résumé de la **construction de la note** + résultat sur N profils, **lien** par colonne vers le formulaire, **pas** d'éditeur embarqué) ; données **fictives par défaut** (réelles en fin de trimestre) ; vocabulaire **« Comparateur » / « maquette »** (dériver/adopter ; `estEssai`→`estMaquette`, gardé) ; **max 1 dérivé** ; tableau **multi-lignes** (construction, pas que la note) ; **inventaire des 4 familles** (socle commun vs family-specific) ; profils-types **dérivés de l'échelle** de l'utilisateur (N niveaux → N profils, trajectoires ancrées + 1 irrégulier ; v1 fixes, réels plus tard) ; **#319 (assistant) déjà LIVRÉ** → lien vers le formulaire existant (pas de co-chantier) ; **#343 (DEN)** préalable.
  - **✅ DÉCOUPAGE EN LOTS VALIDÉ (§5.3 du relais)** : préalable **#343** → **R1** (maquette : modèle/cycle de vie + fix bug « Pratique introuvable ») ∥ **R2** (générateur de profils depuis l'échelle) ∥ **R3** (extracteur attributs de construction par famille) → **R4** (tableau lecture seule : source + construction + résultat + lien formulaire) → **R5** (nettoyage zéro-dette UI D-2…D-5) → **R6** (terrain + release 1.19.0). ⛔ **Ne pas releaser 1.19.0 avant R6.** Reprise documentée dans `SESSION.md`.
  - **🐛 BUG CONNU OUVERT (#326, 17 juin 2026) — banc : notes à 0 sur le jeu DÉMO.** Sur les données démo de la CI (Playwright), la section « Résultat » du banc affiche des notes à **0** (`simulerIndices` rend P=0 sur le corpus généré injecté). Le fix « DA 7 caractères » était nécessaire mais **pas suffisant** ; cause exacte non identifiée (run de diagnostic CI annulé par lenteur infra apt). Test `comparateur-pratiques-rendu.spec.js` « notes > 0 » marqué **`test.fixme`** (suivi, non supprimé) pour ne pas bloquer le déploiement de 1.19.0 — **décision Grégoire** (peu d'utilisateurs ; besoin de tester le banc sur **données réelles**, comportement possiblement différent du seed démo). **À INVESTIGUER** : pourquoi `simulerIndices(da, id, corpusInjecté)` rend P=0 (piste : structure de l'échelle démo / alignement corpus↔config des pratiques / chemin calculerDetailsNoteFinale). Réactiver le test dès correction.
  - **✅ R4b + R5 + R6 LIVRÉS (code, 17 juin 2026) — banc complet, release 1.19.0 préparée.** **R4b** : colonnes **paires** (2-3, sans réf privilégiée, maquettes incluses) ; section **« Construction de la note »** alimentée par R3 (attributs par famille alignés par axe, « s.o. » hors famille) ; section **« Résultat »** (note par colonne, DEN=jugement) ; **lien par colonne** vers le formulaire #319 (`editerPratique`) ; **source fictif/réel** (sélecteur ; réel = groupe actif, lecture seule) ; « Comparer » depuis l'arbre injecte une colonne (sans mode démo). **R5** : retrait zéro-dette du code mort (PROFILS DEMO figés, PHRASES_CONTEXTE, MICROCOPY_E1, estEnDemo, construireInvitation, activerDemoEtOuvrir). **R6** : **bump 1.19.0** + entrée changelog « Comparateur refondu en banc de décision ». Tests : `comparateur-banc-r4b-326` (11) + `comparateur-source-fictive-326` (8) + R3/R2/injection. ⚠️ **VALIDATION TERRAIN MAC+iPad (2 modes) = PORTE AVANT MERGE** (rendu UI non vérifiable en cloud). **#326 = code complet ; reste la passe terrain Grégoire avant de merger/déployer 1.19.0.**
  - **✅ DÉPLOYÉ + RETOURS TERRAIN (17 juin 2026)** — **1.19.0 mergé** (PR #48/#49), puis **1.19.1** (PR #50) = correctif notes=0 en mode fictif (champ de pourcentage d'échelle : `valeurCalcul`/`valeur`/`valeur_pourcentage` → `_pct` robuste). Retours de Grégoire sur 1.19.1 → **1.19.2 (PR #51, auto-merge SQUASH)** :
    - **Suppression des maquettes** : diagnostic adverse → les maquettes étaient déjà toutes listées + jetables dans le Labo (vérifié : `construireArbrePratiques` place toujours chaque maquette dans un arbre rendu ; un « filet de complétude » d'abord codé puis **retiré comme code mort**, zéro-dette). Vrai problème = **découvrabilité** (masquées par D-2). → **bannière « Gérer mes maquettes »** dans la modale Bibliothèque (`pratiques-gestion.js`, compte + `naviguerVers('labo','comparateur')`).
    - **Lien comparateur depuis le formulaire** : section « Comparer ce type de notation » dans le récap du wizard (`wizard-pratique-v2.js`, `ouvrirComparateurDepuisWizard`).
    - **Note « Outil en développement »** en tête du banc (`comparateur-pratiques.js` `NOTE_DEV` + `.comparateur-note-dev`) : cadre la lecture d'un 0.
    - Tests : `maquettes-decouvrabilite-326.spec.js` + assertion `.comparateur-note-dev` ; break-test node sur la suppressibilité.
  - **🐛 STD = 0 sur le banc (fictif ET réel) — RECADRÉ, NON traité (décision Grégoire 17 juin).** Captures IMG_6289..6291 : une pratique PAN-Standards rend 0 pour tous, y compris sur données réelles. **Pas forcément un bug** : possiblement une **impossibilité de construire la note** selon les paramètres de la pratique et leur compatibilité avec les résultats réels qui alimentent la simulation. Atténué par la note « en développement ». Ne pas relancer sans décision.
  - **✅ SOUS-ITEM LIVRÉ 19 juin (1.20.0, PR #53) — distinguer « 0 » légitime de « non constructible ».** `simulerIndices` expose un champ additif `noteConstructible` (parité moteur préservée) ; le banc affiche « — non constructible » (title+aria-label) et le CSV « non constructible » au lieu d'un 0 trompeur ; un vrai 0 reste un nombre. Ne traite PAS la cause racine STD=0 (déférée). Reste : rendu visuel terrain.
  - **✅ R4a LIVRÉ (17 juin 2026)** — le banc tourne sur les **profils fictifs générés (R2)** injectés en lecture seule, **par défaut, sans mode démo** (résout les constats RELAIS §1.3/§1.4 : on comparait contre la démo / coincé en mode démo). `comparateur-pratiques.js` : `_corpusActif`/`_corpusInjection`/`_profilsActifs`/`_echelleActiveComparateur` (échelle de la pratique de réf, sinon 1ʳᵉ échelle) ; `_note`/`_carteRecit` injectent le corpus ; `_donnees` lit le corpus ; garde « mode démo » → « corpus disponible » + repli `construireInvitationEchelle`. `genererCorpus` stampe `echelleId`. Test `comparateur-source-fictive-326` (8, break-testé). 832 verts. ⚠️ **Rendu non vérifiable en cloud → passe terrain requise.** `construireInvitation`/`activerDemoEtOuvrir` = transition (retrait R5). **RESTE R4b** (colonnes paires + lignes construction R3 + lien formulaire #319 + source réelle), R5, R6.
  - **✅ R2 + INJECTION MÉMOIRE LIVRÉS (17 juin 2026)** — **R2** : `js/pratiques/profils-types-generateur.js` (`genererCorpus(echelle)`), pur + déterministe : N niveaux → N profils ancrés (trajectoires non plates) + 1 « irrégulier » (maîtrise tardive), corpus de productions partagé (exercices + 1 terminale), **reprises sur exercices seulement**, notes dérivées de l'échelle, profils FIXES (§4.8). **Injection (approche A validée)** : `simulerIndices(da, id, donnees?)` calcule sur un corpus injecté en mémoire (try/finally, lecture seule absolue, zéro écriture, zéro bascule de contexte) ; mécanisme dans `modes.js` (`definir/effacer/obtenirDonneesSimulationOuNull` + interception `obtenirDonneesSelonMode` des clés évaluations/productions, AVANT la voie normale) ; **param absent ⇒ parité moteur stricte** (golden master vert) ; 3 lectures directes de `pan-standards.js` routées (repli inchangé). Tests : `profils-types-generateur-326` (9) + `simulation-injection-326` (8), break-testés. 823 Vitest verts. **RESTE R4** (UI tableau — non vérifiable cloud, terrain R6).
  - **✅ R3 LIVRÉ (17 juin 2026)** — extracteur PUR « config résolue → attributs de construction par famille » (`js/pratiques/construction-attributs.js`, `ConstructionAttributs.extraire`). Lignes du tableau R4 : **ancres** (pondération / reprises / nb de productions, toujours présentes) + family-specific (STD sélection/composantes/note finale/échelle ; SPE seuil/forfaits/échelle/jetons ; SOM règles spéciales/reprises ; DEN jugement/suggestion/cibles + échelle-grille « à venir #343 »). Applique le **constat R1** (STD sans jetons). Lecture seule, repli neutre. Test `construction-attributs-326` (12 cas, break-testé). 799 Vitest verts. RESTE R2/R4…R6.
  - **✅ R1 LIVRÉ (16 juin 2026)** — maquette (modèle + cycle de vie) + fix bug. Renommage zéro-dette **« essai »→« maquette »**, **« promouvoir »→« adopter »** (décisions §4.5) : champ `estEssai`→`estMaquette` (**migration boot** one-shot `main.js`, supprime l'ancien champ — pas d'alias) ; `promouvoirPratiqueEssai`→`adopterMaquette`, `deriverVarianteEssai`→`deriverMaquette`, `BibliothequeUI.estEssai`→`estMaquette`, `filtrerParEssai`→`filtrerParMaquette` ; moteur pur `trierEssais`/`filtrerEssais`/`essaiDormant`→`trierMaquettes`/`filtrerMaquettes`/`maquetteDormante`. **Garde-fou « max 1 dérivé »** (`deriverMaquette` refuse une source déjà maquette ; l'arbre n'offre « Dériver » que sur une souche → corrige « doublons de doublons » §1.2). **Fix bug « Pratique introuvable »** (§1.5) : listener d'arbre accumulé à chaque rafraîchissement → garde idempotente `host._explActionsAttachees`. Tests : adoption/derivation(+garde-fou)/filtre/hygiène/arbre-sécurité(idempotence+garde-fou)/migration — break-testés, 787 Vitest verts. Pas de bump (release 1.19.0 = R6). **CSS internes `exploration-noeud--essai`/`exploration-tag-essai` conservées** (tokens de style, non user-facing). **RESTE R2…R6.**

- [x] ✅ **#282** Migrer `js/cours.js` de la clé legacy `listeCours` vers la clé V2 `cours`
  - **✅ CLOS 21 juin 2026 (terrain Mac, tests E.1/E.2)** : la modale Bibliothèque cours s'ouvre **non vide** (5 cours) et « Reprendre dans ce trimestre » fonctionne sans erreur → le symptôme « modal vide en V2 » est résolu (confirme l'audit statique du 15 juin). Le retrait total de `listeCours` reste un autre chantier, non souhaitable tant que la migration legacy doit tourner. **Reste ouvert, distinct** : doublons de cours dans la biblio (601-101 ×2, 601-102 ×3) → **#282-T1** dans `Retours des testeurs/SUIVI-BUGS.md` (pollution de données, dédup par tuple naturel).
  - **PRIORITÉ HAUTE** actée par Grégoire 23 mai 2026 PM (« il faudra y revenir absolument »).
  - Modal Bibliothèque cours vide en V2 — 10 sites dans cours.js lisent encore `listeCours`.
  - Effort estimé révisé : 5-7 h (scope réel 93 sites dans 15+ fichiers d'après post-mortem du 23 mai matin, tentative revertée).
  - **Prérequis P1-P4 LIVRÉS** : bandeau mode édition, activation explicite, migration tuple naturel, snippet recovery (cf. BACKLOG-ARCHIVE.md pour le post-mortem et le snippet).
  - **⚠️ Constat 15 juin (audit statique, à confirmer terrain Mac)** : `cours.js` ne lit plus `listeCours` qu'à **1 endroit** (l. 641, simple *fallback* commenté) — vs « 10 sites » au constat initial. Le symptôme « modal Bibliothèque cours vide en V2 » est donc **probablement déjà résolu** (par les chantiers V2 intermédiaires). Le reste des ~80 occurrences de `listeCours` dans `js/` est **légitime** : `migrations.js` (la migration elle-même, READ obligatoire), `reserve.js`/`import-export.js` (clés de backup rétro-compat), `demo-activation.js`/`pack-demo-20.js` (seeds démo), fallbacks Primo. **Action recommandée** : Grégoire confirme sur Mac que le modal Bibliothèque cours s'affiche correctement en V2 → si oui, CLORE #282 (le « retrait total de listeCours » serait un autre chantier, et non souhaitable tant que la migration legacy doit tourner). Ne PAS relancer la migration de masse revertée sans ce constat.

- [x] 🟡 **#328** SSOT `modalitesEvaluation` (Tier 6.5 — violation n°1 de l'audit annuel) — consolidation en 4 lots — **✅ LIVRÉ COMPLET (27 juin 2026, release 1.22.0, build 0627-0628)** ; trace consignée le 3 juillet (vague 3) : l'item n'avait pas suivi les livraisons L2-b2/L2-c
  - **Audit dédié LIVRÉ 10 juin 2026** : `Rapports/AUDIT-SSOT-MODALITES-EVALUATION-2026-06-10.md`. Constats : 14 fichiers écrivains (44 sites) / 39 lecteurs (~125 sites) ; la clé est un **miroir non déclaré** de la SSOT pratiques (#303 : config canonique = `pratiquesConfigurables`, pointeur = `groupesCours[].pratiqueId`) + un fourre-tout (intrus horaire et préférences).
  - **✅ Lot 0 LIVRÉ (10 juin 2026, extraction des intrus)** : `dureePeriodeMinutes` → nouvelle clé NS `dureePeriode` (owner `horaire.js`, migration paresseuse non destructive, seed démo adapté + `demo-namespace.js`) ; toggles `afficherSommatif`/`afficherAlternatif` (écriture seule, morts depuis Session C) retirés de `sauvegarderPreferencesV2` et du seed. Sentinelle **ratchet** `tests/unit/sentinelle-ssot-modalites-ecrivains-L0.test.js` (liste d'écrivains autorisés — ne peut que rétrécir). `docs/DATA-OWNERSHIP.md` à jour. **Validation terrain à faire avant release** (durée de période : Réglages → Trimestre, select 50/55/60 min).
  - **✅ Lot 1 LIVRÉ (10 juin 2026, module propriétaire)** — décision Grégoire : module dédié `js/pratiques/modalites-evaluation.js` (patron `denotation-jugements.js`), chargé avec la couche stockage (après `db.js`). API `lire()` (fallback clé nue conservé jusqu'au Lot 3) / `modifier(mutateur)` (RMW centralisé) / `remplacer(objet)` (refuse non-objet). Les 12 écrivains du domaine routés (42 sites → 0 `db.set` direct hors module) ; sentinelle ratchet retaillée à 3 fichiers (module + 2 migrations bornées clé nue) + garde « anciens écrivains restent routés » ; contrat du module : `tests/unit/modalites-evaluation-proprietaire-L1.test.js` (9 cas). Harnais golden master #319 enchaîné sur le module. DATA-OWNERSHIP à jour.
  - **✅ Lot 3 LIVRÉ (11 juin 2026, purge legacy)** : fallbacks de lecture clé nue purgés partout (~57 sites, ~30 fichiers — l'idiome `|| db.getSync('modalitesEvaluation', {})` était généralisé) ; seul lecteur clé nue restant = migration namespacing bornée de `main.js` ; `pratiques/migration-pratiques.js` SUPPRIMÉ (ids legacy résolus à la volée par `normaliserIdPratique`) ; volet clé nue de la migration decouplerPR retiré de `main.js` ; champ legacy `dureePeriodeMinutes` purgé des données au boot par `modalitesEvaluation.purgerLegacy()` (tous trimestres via `enumererTrimestres`, valeur rapatriée dans `dureePeriode` sans écrasement) ; `obtenirDureePeriode()` simplifié (plus de migration paresseuse) ; bug de précédence corrigé au passage dans `rapport-bug.js` (pratiqueActive = objet entier au lieu de `.pratique`). Ratchet rétréci au module seul + sentinelle `sentinelle-ssot-modalites-purge-L3.test.js` (5 cas) + 5 cas `purgerLegacy()` au contrat L1.
  - **✅ L2-0 LIVRÉ (11 juin 2026)** : golden master Playwright du chemin procédural (`tests/integration/golden-master-procedural-L2-0.spec.js`) — STD 81,5 (meilleurs-2 + terminale 60/40, exclusion reprises), SOM 78, SPE 80, parité pratique active, garde indicesCP figée.
  - **✅ L2-a LIVRÉ (11 juin 2026)** : miroirs `pratiqueId`/`approcheEvaluation` dégonflés (`approcheEvaluation` n'avait AUCUN lecteur ; détail au plan §4 ter). `obtenirPratiqueActiveGroupeCours` résout SSOT-first (patron #332, fallback mort « pratiqueNotation » retiré) ; garde wizard dérivée de la SSOT ; snapshot trimestre = toutes les pratiques des GC ; `purgerLegacy` étendue + seed démo nettoyé. Sentinelle 8 cas + 2 cas L1. Golden master inchangé.
  - **✅ L2-b1 LIVRÉ (11 juin 2026)** : helper D2 `obtenirTypePratiqueActive({gcId, trimestreId})` (pratique-registre.js — SSOT, biblio du trimestre du GC = absorption #301 côté résolution) ; 13 sites du chemin de calcul migrés (8 fichiers) ; ratchet statique + 8 cas fonctionnels (`sentinelle-ssot-pratique-type-L2b1.test.js`). Golden master inchangé. **Prochain : L2-b2** (affichage + domaine pratiques, puis retrait des écritures `m.pratique`).
  - **✅ L2-b2 LIVRÉ (12 juin 2026, commit `e3179c41`, mergé main)** : affichage + domaine pratiques dérivent de la SSOT, miroir « pratique » mort. Terrain L2-b2 fait aux trois quarts le 13 juin (S1/S2 conformes — cf. constat #341).
  - **✅ L2-c LIVRÉ (27 juin 2026, PR #67 `db178bc5`)** : miroir `configPAN.jetons` dégonflé (jetons dérivés de la pratique, décision D3 ; `purgerLegacy` nettoie `configPAN.jetons`). Sentinelles `sentinelle-jetons-derivation-L2c` (10 cas) + `sentinelle-ssot-jetons-ratchet-L2c` (5 cas), break-testées. **Release minor 1.22.0 = fin de #328** (PR #68 `1a381b3a`).
  - ~~**Reste L2 — cadré + décisions ACTÉES (11 juin 2026)** : dégonfler le miroir — `pratiqueId`/`pratique`/`approcheEvaluation`/`configPAN.jetons` deviennent DÉRIVÉS de la pratique active. Plan : `plans de travail/PLAN-328-L2-degonfler-miroir.md` (§4 bis : D1 suppression pure partout en deux temps, D2 #301 absorbé — helper à contexte explicite, D3 jetons suivent la config vivante / solde négatif toléré, D4 séquence L2-0 golden masters → L2-a → L2-b1/b2 → L2-c). Risque élevé (touche le calcul) ; terrain H2026 après chaque sous-lot, release minor à la fin.~~ (tout livré, voir ci-dessus)
  - **🗓️ SÉQUENCEMENT ACTÉ (Grégoire, 10 juin 2026, session Cowork)** : terminer L3 puis L2 **immédiatement après la clôture du chantier Voûte/partage #329** (avant-pilote code-complet en 1.11.0 ; reste le terrain P3+P4 et la revue). Ordre interne recommandé par SESSION.md : **L3 d'abord** (petit, moins risqué), puis **L2** (session dédiée, golden master #303 + #319 en garde-fous). Envisager d'y adjoindre **#332** (copie pointeur `horaireId` vs SSOT `groupesCours`) — même patron que L2, SESSION.md le rattache explicitement.

- [x] 🟢 **#301** Résolution de pratique en **consultation** : namespace du trimestre actif, pas du consulté — **✅ CLOS 3 juillet 2026 (vague 3, enquête de code)** : résolu par l'évolution du modèle — (1) consulter = ACTIVER le trimestre archivé (lecture seule via `estTrimestreArchive()`), le scénario « consulté ≠ actif » n'existe plus ; (2) `changerTrimestreActif` remet à null `infoCours`/`groupeCoursActif` (les copies ne fuient plus) ; (3) résolution SSOT-first #328 L2-a + helper à contexte explicite L2-b1 (« absorption #301 »). Cas résiduel assumé : fallback `'sommative'` documenté tant qu'aucun GC n'est sélectionné. Preuves : `Rapports/ENQUETES-300-301-332-2026-07-03.md`. Porte terrain août (2 min) : consulter A25 → GC → note du profil = pratique A25.
  - Découvert 29 mai 2026 (chantier D). `obtenirConfigPratiqueActive()` lit `cle('pratiquesConfigurables')` = namespace du trimestre **actif**, et `obtenirPratiqueActiveGroupeCours()` démarre par `groupeCoursActif`/`infoCours` (globaux). En consultant un trimestre **archivé** (ex. A2025) alors qu'un autre est actif (ex. Été), la note finale dépend du contexte courant.
  - Effet observé : « Note finale non calculable — Pratique active introuvable » sur un profil A2025 en consultation. Contourné en re-sélectionnant le bon groupe-cours.

- [ ] 🟢 **#283** Harmonisation responsive des pages à sidebar en mobile (<1024 px)
  - Pages : Conception (Productions/Grilles/Échelles/Pratiques/Cartouches), Évaluation (Liste), possiblement Calendrier.
  - Bug pré-existant, pas introduit par chrome unifié. Trois options de fix à arbitrer.
  - Lié à #284.
  - **✅ Analyse + cadrage (16 juin 2026)** : `plans de travail/RELAIS-283-responsive-sidebar.md` (lecture seule, cloud). Constat : les 5 pages biblio partagent `.layout-sidebar-2col` (stack @850, sidebar 220 px @1024) ; **Évaluation › Liste a un layout divergent** ; **désalignement de breakpoints** (chrome @1024/768 vs sidebar @850 → zone 850-1024 serrée). **3 options documentées** : (A) unifier sur `.layout-sidebar-2col` ; **(B, recommandée) aligner le stack 850→1024** (faible risque) ; (C) sidebar repliable (toggle).
  - **✅ Option B IMPLÉMENTÉE (16 juin 2026, décision Grégoire)** : `.layout-sidebar-2col` empile dès **< 1024 px** (fusion des media queries 1024 + 850, suppression de la zone serrée 220 px). Pur CSS, réversible. **Reste** : (1) **validation terrain** Mac+iPad (portrait/paysage, deux modes) ; (2) **Évaluation › Liste + Calendrier** (layout divergent) — option A à trancher après le terrain.

- [x] 📦 🟡 **#306** Uniformiser la page d'assemblage du groupe-cours (libellés « Créer/Enregistrer » + Trimestre en save explicite) — **✅ LIVRÉ 3 juillet 2026 (vague 3, 1.27.2, non mergé)**
  - **Lot 1 LIVRÉ** (`00be919a`) : Cours (création disait « Enregistrer »), Horaire (disait « Ajouter » ; le sous-formulaire de SÉANCE garde « Ajouter » — ajout à une collection, comme le Groupe d'étudiants), Enseignant·e (bouton figé → span `v2-btnTexteEnseignant` + bascule, y compris désélection), Groupe-cours (déjà conforme, verrouillé). Zéro-dette : `afficherFormEnseignantV2`/`modifierEnseignantSelectionneV2` (mortes) + `enseignantEnEditionUI` retirées de l'orchestre.
  - **Lot 2 LIVRÉ** (`fba0c807`) : 11 `data-on-change` de persistance retirés ; le bouton « Enregistrer » appelle `sauvegarderTrimestreCompletV2` (identification PUIS cadre). Recalcul d'ID et validation #215 INTACTS ; les 2 seuls autres écrivains de `cadreCalendrier` = boutons « Réinitialiser » explicites (confirm) — audit connexions propre.
  - **Lot 3 LIVRÉ** : 2 sentinelles comportementales (chargerScript) + statiques, 11 cas, break-testées ROUGES sur l'ancien code.
  - **⚠ PORTE TERRAIN AOÛT (2 modes, Mac+iPad)** : parcours des 4 sections (Créer/Enregistrer) + saisie du trimestre (modifier sans cliquer → rien ne persiste ; cliquer → tout persiste).
  - ✅ **Décision UX TRANCHÉE ET LIVRÉE (19 août 2026, 1.87.9)** : « aligner Enseignant·e sur le patron des trois autres » (Grégoire). État vide + formulaire masqué jusqu'à sélection ou « + Nouveau profil » ; « Annuler » referme et désélectionne (patron Cours) ; l'auto-sélection du premier profil au chargement est CONSERVÉE (formulaire rempli quand un profil existe). Sentinelle `sentinelle-etat-vide-enseignant-306.test.js` (8 cas, 4 break-tests ROUGE), parcours complet éprouvé au Chromium (6 transitions, zéro erreur). ✅ **PORTE TERRAIN CLOSE le jour même : 12/12, zéro échec** (Mac + iPad + deux modes) — plus rien de dû sur cet item.
  - Origine : retour testeur Grégoire. Plan : `plans de travail/PLAN-UNIFORMISATION-ASSEMBLAGE-GROUPE-COURS.md` ; analyse : `Rapports/analyse-coherence-assemblage-groupe-cours.md`.

### Refonte des textes (juin 2026) — chantiers dérivés

> Émergés de la refonte des textes page par page (briefs `refonte-textes-*.md` côté Cowork). Décisions transverses sorties du flux de retouche pure car ce sont de petits refactors, pas du texte.

- [~] 📐 🟡 **#309** Accord en genre pour `obtenirTermeProduction()` — **fondation + Profils/Suivi LIVRÉS (2 juin, build 0602-1607)**
  - **Contexte** : `obtenirTermeProduction(context, maj)` (`profil-etudiant-helpers.js:43`) est la source unique du terme production/artefact. Décision Grégoire (2 juin) : option (a) — étendre le helper avec le genre, router tout le texte visible.
  - **LIVRÉ** : `genreTermeProduction()` (→ `'m'`/`'f'`) + `accordTermeProduction(motCle, n, maj)` avec **table interne de 10 mots** (remis, retenu, evalue, recevable, meilleur, recent, aucun, total, tous, dernier — 4 formes chacun), genre masculin par défaut pour le terme perso (décision Grégoire). 9 tests (`tests/unit/sentinelle-accord-terme-production-2026-06-02.test.js`). Routage : **`profil-etudiant-sections-affichage.js`** (~27 sites + 5 adjectifs pré-existants resté masculins corrigés) et **`tableau-bord-apercu.js`** (3 sites Suivi). Validé terrain par Grégoire (cohérence standards + sommative).
  - **Restes** : fallbacks « Artefact inconnu » (`sections-affichage.js` ~508/517/4069 — cas d'erreur de titre individuel, non routés) ; libellés PAN/SOM (`4219`, dépend de **#311**/§6) ; « Aucune production obligatoire configurée » (conservé, brief E) ; **D2** « Aucun travail soumis ». Autres pages consommant le helper (Liste des étudiant·es : déjà routée ; `liste-evaluations.js` : `pluriel()` déjà en place).
  - **Audit méthode** : la relecture systématique des call-sites après routage a rattrapé 5 adjectifs (« meilleurs/tous/derniers ») laissés au masculin par des routages antérieurs — toujours relire les mots d'accord autour d'un terme déjà routé.

- [x] 📐 🟢 **#310** Note A/C/P statique de Suivi du groupe — convertir en JS-injecté + dédupliquer — ✅ LIVRÉ 29 juin 2026
  - **Contexte** : la carte-note `#note-indicateurs` (`index.html` ~7740-7746) est du **HTML statique** : elle ne peut pas appeler `obtenirTermeProduction()` (CSP `script-src 'self'`) donc le terme production/artefact y reste figé, incohérent avec les notes dynamiques des autres pages.
  - **De plus** : cette note **duplique mot pour mot** l'explication A/C/P de `etudiants.js:genererExplicationCalculIndices()` (page Liste des étudiant·es).
  - **À trancher / coder** : (i, recommandé) convertir la note en contenu injecté par JS et **consolider une seule source** partagée par les deux pages (zéro-dette) ; ou (ii) garder statique avec terme en dur (7744 « production », 7746 « artefact »). Voir §A1 du brief `refonte-textes-suivi-groupe.md`.

- [x] 🟢 **#311** Nom d'affichage des pratiques incohérent — **TRANCHÉ + LIVRÉ 29 juin 2026** (décision Grégoire : forme canonique « **PAN-Standards** » / « Sommative »).
  - **Livré** : le seul libellé *fonctionnel* divergent (`profil-etudiant-sections-affichage.js:4049`, « PAN (Portfolio à nombre limité) » / « SOM (Sommative provisoire) ») aligné sur la forme déjà dominante (`etudiants.js:381` ; des dizaines d'occurrences « PAN-Standards » ailleurs, déjà conformes). Aucun test ne verrouillait les anciens libellés ; Vitest 1179/1179.
  - **Préservé** : les notes *explicatives* « par portfolio » (`profil-etudiant-actions.js:187`) restent inchangées (décision antérieure). Brief `refonte-textes-profils-individuels.md` §A3.

- [x] 🟡 **#313** ✅ LIVRÉ 2 juillet 2026 (1.27.0) — Deux sélecteurs « Production » dans le pipeline d'import — écrasement silencieux neutralisé
  - **✅ LIVRAISON (2 juillet)** : marqueur `productionIdParFichier` posé par « Modifier » (`changerProductionPipeline`) ; `associerProductionGlobale` ne réécrit plus un choix par-fichier divergent (ni ne le vide à la désélection) ; revenir à « — » dans « Modifier » rend la main au global ; l'inférence de la production globale affichée exclut les choix par-fichier (fin de la divergence visuelle) ; info UI sous les DEUX sélecteurs (portée lot vs fichier). **Zéro-dette** : `associerProductionPipeline` (setter mort, zéro appelant) RETIRÉ. Sentinelle `sentinelle-selecteur-production-global-313.test.js` (6 cas, break-testée). ⚠ Porte terrain (août) : parcours réel d'import Mac/iPad. Note : les sélecteurs JETON (global/par-fichier) gardent le comportement antérieur — même piège d'écrasement possible en mode jeton, à trancher si le besoin émerge.
  - **Contexte** : le pipeline d'import (étape Optimisation) expose **deux** selects « Production ». Le **global** (`travaux-ui.js:1683`, `associerProductionGlobale`) écrit `productionId` sur **tous** les fichiers de la file (boucle `forEach`, `~l.2259`). Le **par fichier** (`l.1774`, `changerProductionPipeline(idx)`) n'agit que sur le fichier sélectionné — raccourci né de l'usage pour **corriger une attribution** (équivalent rapide d'« Éditer »). Même donnée (`f.productionId`), portées différentes.
  - **Risque** : le global **écrase silencieusement** les choix par-fichier, et les deux selects peuvent afficher des valeurs **divergentes** → confusion.
  - **Fait le 3 juin (lancement)** : le select par-fichier renommé « Production » → **« Modifier »** (commit `59358856`) pour signaler son rôle de correction, **sans toucher à la logique**.
  - **✅ DÉCIDÉ (Grégoire, 29 juin 2026)** : neutraliser l’écrasement silencieux — le sélecteur GLOBAL ne réécrit plus un choix par-fichier divergent (préserve les corrections « Modifier ») + **info UI** clarifiant global ↔ par-fichier. Empreinte : `travaux-ui.js` (associerProductionGlobale :1683, boucle :2259), `travaux-import.js`. Conserver le raccourci « Modifier ». Contexte initial : (1) ajouter une **information dans l'interface** précisant la distinction global ↔ par-fichier ; (2) décider de fusionner, supprimer l'un, ou neutraliser le piège d'écrasement. Modèle cohérent pressenti : **production = globale (1 par lot)**, **étudiant·e = par fichier**. Options analysées le 3 juin (cf. échange de session).

### Fonctionnalités à compléter

- [ ] 🟢 **#378** Recalage manuel du calendrier en cours de trimestre (relais Cadre #375, renuméroté au versement du 5 août) — créé 4 août 2026.
  - En cas de grève/tempête, la DE réémet un calendrier ; l'app n'a rien pour l'absorber. **Décision Grégoire (4 août) : PAS d'automatisme** (« il ne faut pas coder en dur ma pratique ») — rendre le recalage manuel possible et LISIBLE. Questions ouvertes : échéances d'artefacts déjà datées ? présences déjà saisies ? signaler (sans déplacer) qu'un artefact de la semaine 8 tombe en semaine 9 ?
  - **Horizon : automne 2026.** Détail : `plans de travail/_archives/RELAIS-cadre-trimestre-2026-08-04.md` (item #375 d'origine).

- [ ] 🟢 **#333** Export des résultats finaux (CSV + PDF) — créé 10 juin 2026, **cadrage Cowork complet**, **Lot 1 LIVRÉ 15 juin**, **Lot 2 (Synthèse CSV) LIVRÉ 19 juin (1.20.0, PR #56)**
  - **✅ Lot 2 LIVRÉ (19 juin 2026, PR #56)** — module dédié `js/export-resultats-finaux.js` (PAS import-export.js) : **fichier de SYNTHÈSE** (1 ligne/étudiant : DA, nom, prénom, groupe, cours, trimestre, pratique code+nom, note finale, statut), via `simulerIndices`. Lecture seule ; statut « non constructible » (cohérent #326) / provisoire / final ; sécurité CSV RFC 4180 + anti-injection de formules ; bouton « Exporter la synthèse (CSV) » dans Suivi › Suivi du groupe ; fonctions pures testées (10 cas). **Reste** : le **« Détail » par production** (rôle+pondération) exige une décomposition structurée par famille qui n'existe pas uniformément (simulerIndices fournit note + récit narratif, pas de lignes structurées) — à traiter quand cette API existera. Puis Lot 3 (PDF), Lot 4 (UI/release).
  - **✅ Lot 1 LIVRÉ (15 juin 2026) — re-scopé par lecture du code** : l'« API unifiée de décomposition » prévue par le plan (nouvelle méthode IPratique `obtenirDecompositionNoteFinale`) **existe déjà** sous un autre nom — le travail Comparateur des 4-15 juin l'a bâtie : `simulerIndices(da, pratiqueId)` (`portfolio.js`) retourne `{noteFinale, details, recit}` **unifié pour toutes les familles** (STD via `calculerDetailsNoteFinale.recit`, SOM/SPE via `decrireCalcul`). Par **zéro-dette**, aucun chemin parallèle créé. Seul trou comblé : **DEN** n'avait pas de `decrireCalcul` (`recit=null`) → ajouté sur `PratiqueConfigurable` (gardé `jugement_global`, parité `_calculerPerformanceDenotation`, lecture seule, additif → aucune régression). Test `tests/unit/decrire-calcul-denotation-333.test.js` (8 cas, break-testé) ; 717 Vitest verts. **Pas de bump** (groundwork sans capacité visible ; `minor` à la livraison du module d'export). Bénéficie aussi au Comparateur (DEN y était `recit=null`).
  - **➡️ Reste (Lot 2→4)** : module dédié `js/export-resultats-finaux.js` consommant **`simulerIndices` + `obtenirPratiqueParId`** (PAS de nouvelle API moteur) → CSV (Lot 2), PDF jsPDF/autotable (Lot 3, **validation visuelle Grégoire** du gabarit SPE/paliers — sans précédent), point d'entrée UI Suivi (Lot 4, **emplacement à confirmer**). En-tête « pratique en vigueur » : champ `principe` à ajouter au niveau export (repli `obtenirDescription()`).
  - **Plan canonique** : `plans de travail/PLAN-export-resultats-finaux.md` (§3 « Lot 1 » périmé par le re-scoping ci-dessus — l'API existe). Demande Grégoire : exporter les résultats finaux (archives personnelles + bulletin individuel étudiant) en présentant la pratique en vigueur et la construction de la note.
  - **Décisions actées** : 4 familles via API de décomposition unifiée (IPratique) ; détail par production + récit narratif ; PAS d'indices A-C-P (dépistage ≠ sanction) ; nominatif (pas d'anonymisation) ; en-tête pratique obligatoire.
  - **Coordination #329** : module d'export DÉDIÉ — ne pas passer par `import-export.js` (point de contact Voûte).
  - **Coordination #328** : lire la config pratique via le module propriétaire `js/pratiques/modalites-evaluation.js` (API `lire()`), jamais la clé en accès direct — sinon les lots L2-L3 (miroir dégonflé, purge fallbacks) casseront l'export.
  - **Dépendance SATISFAITE (triage 10 juin 2026)** : #303 Session C livrée le 5 juin ; `calculerDetailsNoteFinale(da, pratiqueIdDemande = null)` paramétrable en place (`profil-etudiant-actions.js:411`).

- [ ] 🟡 **#329** Voûte Phase 1 — partage de ressources par fichiers signés (programme Phases 1-8) — créé 10 juin 2026, **avant-pilote CODE-COMPLET (lots P1→P4 livrés, releases 1.7.0 → 1.11.0)**
  - **Consolidation triage 10 juin 2026 (fin de journée, d'après git log + SESSION.md)** : lots **F, T, P2 (export `.lcz`, 1.10.0), P3 (import `.lcz` + préfixage `PARTAGE_*`, préviz obligatoire, TOFU) et P4 (section « Partagés » dans les 5 biblios + « Dupliquer vers mes documents »)** livrés en sessions parallèles, release **1.11.0** (`13c6c3fe`) validée terrain. `MODELE-CONFIANCE.md` (E8) + `CHECKLIST-MODERATION.md` (D4) livrés, **D-V2 tranchée** (`2cfd2190`). Reste avant clôture : terrain complémentaire (re-passe iPad), revue finale du format, puis jalon pilote fin août.
  - **➡️ Enchaînement acté (Grégoire, 10 juin 2026, session Cowork)** : à la clôture de ce chantier, enchaîner sur la **fin de l'implémentation SSOT #328 (L3 puis L2)** — voir l'item #328 et l'en-tête du backlog.
  - **Lot P1 livré 10 juin 2026** (commits `661d671c`/`c94e9fbe`/`58772cea` + fix terrain `702fa7e9`, release **1.7.0** `3a0a03cb`) : `js/partage-schemas.js` (schémas fermés des 5 entités + manifeste avec bloc signature D2) + `js/partage-validation.js` (6 niveaux → `{valide, erreurs, preview, packageNettoye}`) + `js/partage-format.js` (`construirePackage`, projection récursive) + 28 sentinelles Vitest + harnais console `_testPartagePhase1()`. **Validé terrain 14/14 sur données réelles (Mac)** après correctif (schémas alignés sur formes réelles : criteres[].niveauSOLO, metadata_cc complète). Écarts spec d'avril documentés dans SESSION.md (shapes réelles, dépendances grille→cartouches, export élague / import rejette).
  - **Reste avant lot F** : revue du format avec Grégoire (taille max 50 Mo posée par défaut à confirmer ; champs exclus auteur/coursId/dateEcheance/etablissement) ; optionnel re-passe iPad de `_testPartagePhase1()`. Puis lot F (`js/signature.js`, ECDSA P-256), session dédiée.
  - **Plan canonique** : `plans de travail/PLAN-VOUTE-PHASES-1-8.md`. Réconcilie `PLAN-PARTAGE-RESSOURCES.md` (21 avril), `PLAN2-PHASE1-SPEC.md` (24 avril) et les décisions D2/D3/D7 (11 mai — la signature ECDSA dès Phase 1 PRIME sur le « hors périmètre » du plan d'avril). Démarrage code : juillet 2026 (`docs/CALENDRIER.md`).
  - **Jalon** : 🟦 pilote restreint fin août 2026 (Grégoire + 2-3 collègues, parcours complet signature ECDSA + TOFU). Avant-pilote = lots P1 (format `labo-codex-partage-v1` avec bloc signature dès la v1), F (`js/signature.js`), T (`js/trust-tofu.js`), P2 (export `.lcz`), P3 (import + préfixage `PARTAGE_*` D7). Phases 4-8 détaillées post-pilote seulement (anti-péremption).
  - **Décisions** : D-V1 **TRANCHÉE 10 juin : extension `.lcz`**. En attente : D-V2 nom d'affichage UI, D-V3 qui rédige `MODELE-CONFIANCE.md` (E8). D1 (architecture serveur) reste en attente et ne bloque rien.
  - **Coexistence** : en parallèle du chantier SSOT #328 (décision Grégoire 10 juin) ; point de contact unique `import-export.js` — coordination via SESSION.md avant toute session qui y touche.
  - **Skills à charger en session** : `SKILL_Securite_donnees.md` (PRIORITÉ), `SKILL_hygiene_donnees_partagees.md`, `SKILL_integrite_globaux.md`.

- [ ] 📐 🟢 **#324** Reprises configurées mais non consommées par le calcul — créé 7 juin 2026 (#319 Lot 3)
  - **Origine** : #319 Lot 3 (a3) rend les reprises configurables dans l'assistant pour Sommative, Standards-objectifs et artefacts (persistées dans `configuration.reprises = {permises, mode}` et `configuration.portfolio.reprisesPermises`). **Constat audit** : aucun consommateur côté calcul/affichage (`grep -rE "\.reprises|reprisesPermises"` sur `js/` hors wizard = vide). Le réglage est donc **collecté et stocké mais sans effet** sur la note ou le suivi.
  - **À concevoir (hors Lot 3, acté)** : le modèle de consommation des reprises — politique de recalcul (meilleure tentative ? dernière ? plafond ?), interaction avec le mode `limite` (nombre max, où le configurer : « configurer après » renvoie à quel écran ?), articulation avec les jetons de reprise existants (`js/codex.js`, badges « À réévaluer »). Décision conceptuelle requise avant code. Ne pas inventer de calcul tant que le modèle n'est pas validé.
  - **Périmètre probable** : `js/pratiques/*.js` (calcul), `pratique-configurable.js`, et l'écran de config détaillée post-création. Sentinelle de persistance déjà posée au Lot 3 (la valeur survit au round-trip d'édition).

- [ ] 📐 🟡 **#279** Ajouter 3 champs au formulaire de production : DESCRIPTION DÉTAILLÉE des consignes, FORMAT ET MISE EN PAGE, REMISE
  - Refactor `refactor/productions` mergé le 17 mai. Chantier prêt dès qu'une capture de référence est fournie par Grégoire (placement exact, type d'input).
  - Impact : `afficherFormProduction`, `lireDonneesFormulaireProduction`, `construireProductionData`, `prerenseignerFormulaireProduction` + affichage côté consultation.

- [ ] 📐 🟢 **#275** Rétroactions visuelles enrichies dans la synthèse
  - Aujourd'hui : seulement les courts descriptifs de palette. Insuffisant pour rétroaction pédagogique significative.
  - À explorer : phrases complètes par critère/niveau, pistes d'amélioration, forces observées, ou génération assistée depuis le contexte production. Décision conceptuelle à prendre avant code.

- [x] 🟢 **#240** Tampon visuel pour jetons (Délai, Reprise, Reprise ciblée) sur les travaux annotés — ✅ LIVRÉ 29 juin 2026
  - Cliquer sur le mot du jeton → curseur tampon → appose « JETON DE DÉLAI/REPRISE/REPRISE CIBLÉE » en rouge majuscule.
  - Une fois tamponné, checkbox du jeton se coche auto. Même mécanisme que les tampons existants. PDF montre clairement le jeton appliqué.

- [ ] 🟢 **#18** Tooltips d'aide au survol — déploiement progressif par zone (chantier continu)
  - Mécanisme **réel** (le backlog citait `tooltips.js`/`tooltips-contenu.js`, inexacts) : `data-tooltip="cle"` + catalogue `js/accompagnement-contenu-hover.js` (`TOOLTIPS` → `accompagnement.ajouterEntrees`) ; moteur de hover en **délégation sur `document`** (fonctionne aussi sur les éléments créés dynamiquement).
  - **Complété** : En-tête (10), Réglages Trimestre (29), Préférences (12), Dépistage (14), Données (14), Évaluations (84). **Planification (planif ~20) et Tableau de bord (tdb ~22) déjà couverts** (liste « Reste » du backlog périmée, corrigée 19 juin). **Labo/outils d'animation (5) + Présences (6) LIVRÉS 19 juin (PR #57).**
  - **Reste** : Construction de la note (pédagogique/imbriquée dans l'assistant → contenu à valider avec Grégoire), Aide.

- [ ] 📦 **#2** Guide PDF pour utilisateurs — reformulé 11 mai 2026
  - Décision : ne PAS produire un guide générique. À fusionner avec le matériel pédagogique de la cohorte CoP (8 rencontres sept 2026 → avril 2027, voir `docs/CALENDRIER.md` §8.3).
  - Version « papier » pour AQPC peut être dérivée de `docs/securite/SECURITE-POUR-ENSEIGNANTS.md` (à écrire post-Défense E).

- [x] 🟡 **#299** Balayage des références d'onglets périmées dans les textes d'aide (« Réglages → X », « onglet Contexte/Structure ») — **✅ CLOS 3 juillet 2026 (vague 3 batch 2, 1.27.3, commit `796f42fd`)** : le « RESTE à trancher » a été tranché AU CODE (Réglages = Préférences/Données/À propos) — cc-license → Cadre › Trimestre › Enseignant·e ; snapshots → Réglages → Données ; Interprétation = plus d'UI (commentaires réalignés) ; Portfolio → config de la pratique active. Bonus zéro-dette : `js/statistiques.js` (module MORT ciblant la sous-section `reglages-apercu` disparue) retiré en entier + `genererBadgeCCPermanent` (0 appelant). Sentinelle-cliquet `sentinelle-onglets-perimes-299.test.js` interdit le retour des libellés périmés dans tout `js/`.
  - **Origine** : audit onboarding 28 mai 2026 PM (signalé par Grégoire sur capture iPad). La nav a été renommée/réorganisée : ancien « Réglages » éclaté entre **Cadre** (id interne `calendrier` — trimestre/cours/groupe/horaire), **Conception** (grilles, échelles, pratiques, cartouches) et **Réglages** résiduel (Préférences/Données/À propos, hors barre principale). « Contexte » et « Structure » sont des noms d'onglets encore antérieurs.
  - **Déjà corrigé (onboarding, même session)** : visite guidée `js/accompagnement.js` étapes 0+1 (« Réglages » → « Cadre » + fix `correspond()` `contexte-` → `calendrier-`) ; aides hover `js/accompagnement-contenu-hover.js` (`nav-conception` « Structure » → « Conception », `nav-calendrier` « Contexte » → « Cadre »). Texte d'accueil `js/accueil.js` déjà à jour.
  - **Reste à faire** : ~30 occurrences dispersées « Réglages → X » dans le reste du code, la plupart pointant en réalité vers **Conception** ou **Cadre**. Fichiers concernés repérés à l'audit : `wizard-pratique-v2.js` (l. 425, 723, 871, 959 — « Réglages → Ensembles d'objectifs / Pratique de notation / Critères d'évaluation »), `profil-etudiant-diagnostics.js` (l. 484), `profil-etudiant-calculs.js` (l. 613, 766, 857), `profil-etudiant-sections-affichage.js` (l. 1587, 3831), `cartouches.js` (l. 1199 — « Réglages → Grilles de critères »), `etudiants.js` (l. 425), `graphiques-progression.js` (l. 3967 — « Réglages › Productions »), `snapshots.js` (l. 859), `evaluation-sauvegarde.js` (l. 293), `codex-data.js` (l. 405), `import-export.js` (l. 1444), `interpretation-config.js`, `statistiques.js`, etc.
  - **Méthode** : pour chaque occurrence, déterminer la destination réelle (Cadre / Conception / Réglages résiduel) et corriger le libellé. Distinguer les vraies références « Réglages » résiduelles (Préférences/Données/À propos — toujours valides : `securite-prefs.js`, `init-inline.js` « À propos », `reserve-reglages.js`, `accompagnement-contenu-popup.js:1357` « À propos ») qui ne doivent PAS être touchées.
  - **Titres tour guidé — tranché et livré 28 mai PM** : étape 2 « Structure » → « Conception », étape 4 « Tableau de bord » → « Suivi » (Grégoire a choisi d'aligner sur les noms d'onglets).
  - **✅ Lot partiel #1 LIVRÉ 13 juin (commit `f0ef98f`)** : la plupart des cibles de l'audit (wizard-pratique-v2.js, cartouches.js:1199, graphiques-progression.js:3967, profil-etudiant-diagnostics.js:484, profil-etudiant-sections-affichage.js, etudiants.js:425, codex-data.js:405, import-export.js:1444) corrigées vers Conception/Cadre — elles n'apparaissent plus au grep.
  - **✅ Lot partiel #2 LIVRÉ 15 juin** (3 messages user-facing, destinations vérifiées dans `config.js` + `index.html`) : `snapshots.js:859` « Réglages → Horaire » → **Cadre → Trimestre → Horaire** ; `partage-export.js:200` « Réglages › Identité » → **Cadre › Trimestre (enseignant)** (le sélecteur `v2-selectEnseignant` vit dans `calendrier-trimestre`, index.html:7006) ; `evaluation-sauvegarde.js:293` « Réglages → Gestion des données » → **Réglages → Données**.
  - **NE PAS toucher (vérifié 15 juin)** : `codex.js:594` « Réglages → Général → Stockage iPad » = chemin des **Réglages iOS/iPad** (app Apple), pas Labo Codex ; toutes les « Réglages › Données » (`partage-section.js`, `partage-import.js`, `changelog-data.js`, `modal-backup-reminder.js`) = destination **valide**.
  - **RESTE (à trancher avec Grégoire — destinations actuelles incertaines)** : surtout des **commentaires de code** (pas des textes d'aide user-facing) référençant des emplacements de config dont le foyer actuel n'est pas confirmé : « Réglages → Interprétation » (`interpretation-config.js:10`, `profil-etudiant-calculs.js:766,857`), « Réglages › Interprétation/Portfolio » (`profil-etudiant-calculs.js:681,684`), « Réglages → Aperçu » (`statistiques.js:14,51`), « Réglages → Snapshots » (`snapshots.js:1046`), « Réglages › Enseignant » (`cc-license.js:32,37,58,327` — vraisemblablement Cadre → Trimestre). Confirmer où vivent désormais Interprétation/Portfolio/Aperçu/Snapshots avant correction.
  - **Effort estimé restant** : <1 h (surtout des commentaires) une fois les destinations confirmées.

### Conception pédagogique et architecture des pratiques (chantiers Cowork 29 mai)

- [x] 🟢 **#363** **Audit de currency des skills (et docs) contre le code post-#358** — **✅ LIVRÉ 3 juillet 2026 (vague 3, 1.27.2)** : 13 écarts corrigés (dont le cas à risque `SKILL_integrite_globaux` — CLES_GLOBALES 7→5 clés, démo sans fusion G3, désarchivage #359 — plus `SKILL_labo_codex`, `SKILL_Alignement`, `SKILL_pratiques_notation` journal #326→1.26.0, `docs/00-START-HERE`, `DATA-OWNERSHIP` NS/G + Lot 2), 4 skills vérifiés sans écart. Rapport : `Rapports/AUDIT-363-currency-skills-docs-2026-07-03.md`. Limites : contourneurs DATA-OWNERSHIP non re-vérifiés site par site (note de currency posée, re-générer `audit-ssot.py`), `docs/modules/` hors périmètre. Prévu « reprise 1er août » mais entièrement autonome/lecture seule → absorbé par la vague 3 (relais Tâche B). Initialement : Les skills métier sont gelés au **11 juin** (sauf `pratiques_notation` 17 juin ; `Debut`/`Fin`/`verification_adverse` 14 juin) ; depuis, **#358 (namespacing), #328, #326 (1.26.0)** ont fait évoluer le modèle de données. Vérifier **contre le code** (`CLES_GLOBALES`/`CLES_NAMESPACE`), pas réécrire de mémoire (le modèle de namespacing est subtil — il a causé des showstoppers ; cf. mémoire [[premisse-vs-donnees-reelles]], [[catalogue-gabarits-vs-grilles-travail]]).
  - **Cas le plus à risque** : `SKILL_integrite_globaux` décrit `grillesTemplates`/`echellesTemplates` comme **clés globales** « copiées vers `<trim>_grillesTemplates` à l'archivage » ; or #358 les a **namespacées dès la création** + **vidé le global** (prouvé durable 28 juin). Risque = modèle mental périmé pour qui touche `demo-activation.js`/`reserve.js`/`import-export.js`.
  - `SKILL_pratiques_notation` : journal #326 arrêté à 1.19.0 (R1-R6), en retard sur la **réactivation 1.26.0** (décision STD → `null`, T3/T4).
  - `docs/00-START-HERE.md` §« Bibliotheque + Assemblage » dit « Entites **NON namespacees**, partagees » — à recouper avec le post-#358 (gabarits vs grilles de travail).
  - Cosmétique : dates « Dernière mise à jour » de plusieurs skills.
  - Origine : balayage de fin de séance du 28 juin (les **docs d'entrée** CLAUDE.md/00-START-HERE/README ont été dé-hardcodés ce soir, PR #75 ; les **skills** restent à auditer à froid).

- [x] 🟢 **#347** Rétroaction d'un artefact recalculée « live » avec les résultats des artefacts ultérieurs → ≠ version historique reçue par l'élève — créé 25 juin 2026 (constat Grégoire, consultation A25) — ✅ LIVRÉ 29 juin 2026
  - **Constat** : la rétroaction générée/affichée pour l'**artefact 1** tient compte de **tous les résultats ultérieurs** (artefacts suivants, meilleurs comme obligatoires). Elle se recalcule à mesure que le portfolio se remplit et **ne correspond pas** à la rétroaction historique que l'élève a reçue au début du trimestre.
  - **Enjeu pédagogique** : une rétroaction est un acte **daté** (ce qui a été dit à l'élève au moment T). La recalculer rétroactivement avec des données postérieures fausse la trace pédagogique et la lecture longitudinale — l'élève n'a jamais vu cette version « rétro-corrigée ».
  - **Piste à cadrer** : distinguer une rétroaction **historique** (figée au moment de la remise/sauvegarde, snapshot) d'une vue **synthèse courante** (recalculée). Faut-il figer la rétroaction à la sauvegarde, ou au moins **marquer explicitement** quand une vue est recalculée a posteriori ?
  - **Lien code** : `synthese-retroaction-data.js` (génération des données de synthèse/rétroaction, consommé aussi par l'export PDF #333). C'est la **logique de calcul** qui est en cause, pas le namespacing (le fichier a seulement été touché au passage par la Brique A écrans d'analyse).

- [ ] 🟢 **#307** Simuler / comparer des pratiques de notation sur les mêmes données (profil élève)
  - **Origine** : tests pratiques du 31 mai (rapports #126-128). En changeant la pratique active du groupe-cours, le panneau « Note finale de session » du profil recalcule sur les **mêmes artefacts** → même élève, notes différentes selon la pratique (capté : PAN-SDT-Litt H26 hybride **73,8 %**, Testd-SOM portfolio 4-meilleurs **75,8 %**, Testc-SDT portfolio 7-meilleurs **73,1 %**). Grégoire : « fonction formidable… simuler d'autres pratiques et les comparer. C'est une bonne piste. »
  - **Vision** : transformer ce comportement émergent en **outil délibéré** — sélecteur de pratique(s) à simuler dans le profil, vue côte-à-côte des notes finales par pratique, sans changer la pratique réellement assignée au groupe-cours (simulation non destructive).
  - **Pré-requis** : **Session C de #303** (calcul par famille) — aujourd'hui seule la famille PAN-Standards (portfolio) calcule dans le profil ; SOM/SPE tombent en « non calculable » (désormais expliqué, cf. #128 / `_diagnostiquerNoteNonCalculable`). La comparaison n'a de sens que quand les 3 familles calculent.
  - **Acquis 31 mai (briques déjà posées)** : nom de la pratique active affiché dans le panneau (#127) ; message diagnostique distinguant « famille pas encore branchée » de « config à corriger » (#128). Post-AQPC.
  - **🔓 PRÉ-REQUIS LEVÉ (triage 10 juin 2026)** : #303 Session C consolidée sur main le 5 juin (« #307 DÉBLOQUÉ » acté dans SESSION.md) ; `calculerDetailsNoteFinale(da, pratiqueIdDemande = null)` paramétrable vérifié (`profil-etudiant-actions.js:411`). L'item est prêt à démarrer selon la SPEC.
  - **✅ SPEC RÉDIGÉE ET VALIDÉE (4 juin, Cowork)** : `plans de travail/SPEC_simulation_pratiques_307.md` (copiée dans le repo le 4 juin ; original de rédaction dans le dossier Cowork). Décisions actées : note finale + décomposition ; profil individuel d'abord (vue groupe = phase 2) ; bibliothèque du groupe-cours, 2 simulées max ; éphémère + export CSV. **⚠️ Contrat supplémentaire imposé à la Session C (condition de faisabilité)** : le calcul doit lire `this.config` de l'instance, PAS le SSOT global `modalitesEvaluation` (vérifié 4 juin : `pratique-configurable.js:199` et `pratique-pan-standards.js:69/696` lisent le global dans `calculerPerformance` — c'est la cause du comportement émergent) ; `calculerDetailsNoteFinale(da, pratiqueId = null)` paramétrable.

- [ ] 🟡 **#339** Rendre la configuration du portfolio explicite dans une pratique STD (liens productions↔pratique par identité, un seul moteur hybride) — créé 12 juin 2026 (découverte Grégoire, reconstitution A25)
  - **Origine** : la reconstitution de la pratique hybride A25 (meilleurs résultats portfolio + rédaction finale obligatoire) ne reproduit pas le résultat officiel de décembre 2025, et sa configuration est difficile à comprendre. Diagnostic complet : `Rapports/DIAGNOSTIC-A25-reconstitution-pratique-hybride-2026-06-12.md`.
  - **Deux causes structurelles (vérifiées au code)** : (1) la définition de la pratique est éclatée — 4 champs vivent sur les productions (`type`, `categorie`, `ponderation`, `facultatif`), donc invisibles à l'export/duplication/reconstitution de la pratique, avec pièges silencieux (production sans catégorie ignorée, « zéro fantôme » L6) ; (2) deux moteurs hybrides divergent sur 5 points (`calculerDetailsNoteFinale` profil vs `calculerNoteAvecCategories` indice P) — même chiffre nominal, calculs différents.
  - **Redesign (§7 du rapport)** : la pratique devient propriétaire de ses liens **par identité** (`artefactIds`, `productionIds` par catégorie, `terminale.productionId`, pondérations dans la config) ; `categorie` et pondérations portfolio/terminale QUITTENT les productions (retrait, pas alias) ; UN seul moteur hybride (l'indice P dérive de la note de session) ; écran « Construction de la note » qui montre le rôle effectif de chaque production et signale les états dangereux.
  - **Points d'attention** : changement de format de données → migration A25/H2026 + **version majeure (à confirmer avec Grégoire avant)** ; golden master notes H2026 avant/après ; audit statique fait (15 juin) : **~79 accès directs** dans `js/` (categorie 2 écritures + 22 lectures ; pondérations portfolio/terminale 9 ; facultatif 10 ; type portfolio/terminale 36), détail dans le plan.
  - **📋 Plan + audit prêts (15 juin 2026)** : `plans de travail/PLAN-339-config-portfolio-explicite.md` — modèle de données cible (liens par identité), découpage L0-L7 (L0 golden master + L1 helper = codables sans toucher au format), stratégie de migration idempotente, 5 décisions bloquantes pour Grégoire (D1 version majeure, D2 sort de `production.type`, D3 sort de `production.facultatif`, D4 séquencement vs #328 L2-c, D5 écrivain canonique des liens vs #319). Préparé sur iPad ; golden master réel + enquête §6 restent à faire sur Mac.
  - **Séquencement acté (12 juin)** : APRÈS la fin de #328 (L2-c touche la même config) ; coordonner avec #319 (l'étape catégories de l'assistant écrit ces liens).
  - **Indépendant et préalable utile** : l'enquête terrain A25 (protocole console §6 du rapport, lecture seule, ~30 min, trimestre A25 actif) — identifier la cause réelle de l'écart avec l'officiel parmi les 9 du §5. Le verrou archive est purement UI (§8) : « Permission d'écriture » ou « Désarchiver » (réversible) suffisent, pas besoin de doublon de trimestre.
  - **Constats terrain (Grégoire, 12 juin ~06h, A25 actif + Permission d'écriture cochée)** — captures à l'appui :
    1. **Saisie du critère « Français écrit » (algorithmique) bloquée malgré le mode écriture** : les champs Nombre d'erreurs / Nombre de mots acceptent la saisie (0 / 905) mais la conversion reste à « -- erreurs sur -- mots », niveau « -- », Note chiffrée « -- ». Impossible d'obtenir la note IDME ; seul le score global de la rédaction existe.
    2. **Fait observé sur l'éval A25** : la grille sélectionnée est « Global-5 (FR-ALGO) **H26** » (pondérations affichées : Structure 20 %, Plausibilité 15 %, Nuance 25 %, Français écrit 20 %) et le sélecteur « Échelle de performance » est **VIDE**. *Inférence à vérifier* : cohérent avec la subtilité §8 du diagnostic — A25 a été archivé dans une version antérieure au 28 jan 2026, donc pas de copies `a2025_*` des templates ; la conversion algorithmique FR échoue plausiblement faute d'échelle/seuils résolus, pas à cause du verrou archive.
    3. **À faire (demande Grégoire)** : reconstruire les grilles d'évaluation A25 telles qu'à l'époque — notamment **Français écrit à 30 %** (vs 20 % sur la grille H26 affichée) — puis les **réassocier** aux évaluations A25. Préalable probable à toute concordance avec l'officiel de décembre (les pondérations de critères changent les notes par production, donc tout l'amont du portfolio).

- [x] 🟢 **#304** Nettoyage terminologique interne « heures-contact » → « heure d'enseignement » — ✅ LIVRÉ 29 juin 2026
  - **✅ Libellés UI faits (mini-guide « balises du cours », beta 99.79, commit `8f23964`)** : « Heures-contact attendues » → « Heures d'enseignement » + « Total d'heures en classe » → « Total d'heures d'enseignement » (`index.html`). Reste : identifiants techniques `v2-heuresContact`, fonction `proposerHeuresContactDepuisPonderation`, commentaires « heures-contact » de `js/trimestre-v2-cours.js`, doc `docs/ANALYSE-conformite-RREC-heures-contact.md`.
  - Justification : l'OQLF (Grand dictionnaire terminologique) **déconseille** « heure-contact » (calque de *contact hour*) au profit de « heure d'enseignement ».
  - Lié au chantier A conformité RREC + à l'ambiguïté **période (50-55 min) vs heure** à trancher (compter exigence et réalisé dans la même unité, idéalement en périodes). Réf. `Plan Accompagnement/SPEC_mini-guide_cours_balises.md` §2 et §5.

### Cohérence visuelle UI

- [x] 🟢 **#344** ✅ LIVRÉ 2 juillet 2026 (1.27.0) — Calendrier scolaire — carte Légende fusionnée (3 métriques intégrées), remontée en tête
  - **✅ LIVRAISON (2 juillet)** : les 3 cartes métriques retirées ; carte Légende fusionnée EN HAUT, 2 colonnes (`.calendrier-legende-fusion` : légende des couleurs | 3 chiffres au format harmonisé), empilage < 768px ; variables CSS existantes, aucune couleur nouvelle. Sentinelle structurelle `sentinelle-legende-fusionnee-calendrier-344.test.js` (5 cas, break-testée). ⚠ Porte terrain (août) : rendu visuel 2 modes (sombre/clair) + responsive iPad.
  - **Idée (Grégoire, 21 juin 2026, captures fournies)** : retirer les **3 cartes métriques** du haut de la page Calendrier scolaire (« Semaines scolaires », « Jours de cours », « Congés avec reprise ») et reporter ces 3 chiffres **à l'intérieur de la carte « Légende »**, en **disposition deux colonnes** : la légende des codes-couleur d'un côté, les 3 indicateurs chiffrés de l'autre. Une seule carte au lieu de quatre.
  - **Bénéfice attendu** : page plus compacte, moins d'éléments, la synthèse chiffrée cohabite avec la grille de lecture — cohérent avec le principe « densité maîtrisée, pas d'ornementation » du design system.
  - **✅ DÉCIDÉ (Grégoire, 29 juin 2026)** : la carte fusionnée **remonte EN HAUT** (prend la place des 3 cartes retirées), disposition **2 colonnes** (légende des couleurs | les 3 chiffres). Empreinte : `calendrier-vue.js`, `styles.css`, `index.html` (section calendrier). Vérif terrain : 2 modes + responsive (empilage en étroit). Contexte initial : aujourd'hui les 3 chiffres sont en tête de page (visibles d'un coup d'œil) ; la carte Légende est plus bas. S'ils descendent dans la Légende, ils perdent cette position de tête → décider si la carte fusionnée **remonte en haut** de la page ou si la Légende reste à sa place. Confirmer la disposition exacte des deux colonnes avec Grégoire.
  - **Vérif terrain** : rendu dans les deux modes (clair/sombre) + responsive (les deux colonnes doivent s'empiler proprement en étroit — cf. #283-T1 qui touche aussi cette page).
  - Fichier(s) : vue Calendrier scolaire (`index.html` section calendrier + rendu JS), `styles.css` (cartes métriques + carte légende).

- [ ] 🟢 **#297** Dette technique : duplication des règles CSS entre `<style>` inline d'index.html et styles.css
  - **📋 Relais de cadrage prêt (15 juin 2026)** : `plans de travail/RELAIS-297-dette-css.md` — découpage Lot A (15 identiques, retrait des profondes seulement) / Lot B (33 divergentes cas par cas) / Lot C (convention + sentinelle statique), grille de décision, profil de risque (FOUC Safari `file://`, `:root` en retard de variables), vérif visuelle deux modes (session Mac).
  - **✅ ÉTAPE 0 FAITE (16 juin 2026)** : `INLINE_FIN_LIGNE` corrigée (3806 → **3825**) + date d'en-tête dans `Rapports/_outils/audit-duplication-css.py` ; audit re-généré → `Rapports/audit-duplication-css-2026-06-16.md`. **Chiffres actualisés** : bloc inline = **629 règles** (vs 625), styles.css 4176 ; **48 sélecteurs communs** dont **15 identiques** (retrait sûr) + **33 divergentes** (cas par cas). Les phases 2-3 (décision par sélecteur + retrait + convention) restent **post-AQPC / session Mac** (risque FOUC `file://`, vérif visuelle deux modes — non faisable en cloud).
  - **Phase 1 livrée 28 mai 2026 PM — audit lecture seule**.
  - **Rapport** : `Rapports/audit-duplication-css-2026-05-28.md` (script reproductible dans `Rapports/_outils/audit-duplication-css.py`).
  - **Constats clés** :
    - 625 règles dans le bloc inline `<style>` (l. 16-3806 d'index.html), 3947 dans `styles.css`.
    - Recouvrement : **48 sélecteurs communs**, dont **15 identiques** (retrait sûr possible) et **33 divergents** (overrides silencieux, sources potentielles de bugs comme `.contenu min-height` du 28 mai matin).
    - Divergence majeure : `:root` (variables) — le inline est en retard de plusieurs lots (manque acc-*, section-*, idme-*, focus-ring-*, rai-niveau-*, etc.). Visible si styles.css échoue à charger.
    - Autres divergences notables avec diff dans le rapport : `body`, `.carte`, `.conteneur`, `.section.active`, `.sous-navigation`.
  - **Phase 2 à trancher (post-AQPC)** : décider par sélecteur (a) retrait inline, (b) retrait externe, (c) garder les deux + commentaire de synchronisation. Voir §5 du rapport pour la grille de décision.
  - **Phase 3 finale** : inscrire une convention en tête du bloc inline (encadré « CSS critique inliné délibérément » + règles de modification). Voir §5.3 du rapport.
  - **Calendrier** : phase 1 ✅ livrée. Phases 2-3 post-AQPC.

- [ ] 🟡 **#291** Workflow de résolution de doublons dans les bibliothèques (grilles, cartouches, échelles, productions, pratiques)
  - **✅ WORKFLOW LIVRÉ (23 août 2026, 1.92.0)** — Lots 0-3 du plan exécutés. `js/identite-item.js` est désormais la source unique de l'identité d'un item : `analyserDoublons` ne déduplique plus par `id`, donc la collision d'identifiant survit jusqu'à l'affichage, et les copies se distinguent des homonymes par fermeture transitive des lignées. Les **cinq détecteurs copiés-collés sont supprimés** (zéro-dette) avec sentinelle-cliquet d'absence. Le bandeau **désigne** : trois catégories calculées et colorées, un exemplaire par ligne (nom · ID court · date · provenance), bouton « Voir » qui défile et met en évidence, « Retirer »/« Supprimer » sur place. Les cartes portent enfin leur ID court. La consigne fausse est **supprimée**, pas reformulée. Les deux défauts d'échappement du §1.4 sont corrigés. Un garde-fou découvert en route : `reunirSources` — le même `id` vit légitimement dans la sélection ET la bibliothèque partagée (`ajouterGrilleALaBibliotheque` le conserve), une concaténation naïve aurait classé « collision » chaque ressource publiée.
  - **✅ PORTE TERRAIN RELEVÉE (23 août 2026, 14 h 40) — 39/43.** Sur le corpus RÉEL de Grégoire : **0 collision · 8 copies · 13 homonymes · 21 groupes**. **La porte 1.2 PASSE** : ses deux « IDME et niv 0 » ressortent 🔵 homonymes — la décision « on bloque sur l'identité, jamais sur le nom » tient sur ses vraies données. Les **3 ✗ (2.1c/d/e) avaient une seule cause**, mesurée : la puce d'identifiant rendait à **11,8 px** (héritage `em`) et **4,01:1** de contraste en mode clair (sous le seuil AA de 4,5). Elle était bien présente dans les cinq familles — 2.1e n'était pas un manque. **Corrigé en 1.92.1** : `rem` à 14 px, jetons de couleur propres à 5,87:1. La mesure 2.5 a attrapé un **quatrième défaut, préexistant** : `uiDialogues` construit un `.modal-overlay` à z-index 9999 quand les modales de bibliothèque sont à 10000 — « Supprimer de la bibliothèque partagée » (seule famille à confirmer par une modale) naissait DERRIÈRE. Corrigé à 10005. Sentinelle `tests/integration/doublons-lisibilite-291.spec.js`, break-testée trois fois.
  - **DÉCISIONS RENDUES (§3 de la porte)** : 3.1 à 3.5 → **« c'est bon »**, actées telles quelles (noms des catégories, groupes mixtes avec numéro de lignée, bandeau déplié, double chemin Retirer/Supprimer, disparité alerte système / notification). **3.6 → PROCHAIN CHANTIER.**
  - **RELIQUAT OUVERT, désormais PRIORISÉ** : la modale de comparaison côte-à-côte (nom, date, contenu, nombre de critères) et le « Tout fusionner ». Grégoire a tranché en porte 3.6 : **c'est le prochain chantier.**
  - **Porte terrain due** : `plans de travail/PORTES-TERRAIN-2026-08-23-doublons.md` — rien n'a été éprouvé dans Safari ni sur iPad (WebKit absent du conteneur ; specs passés sur Chromium).
  - **📋 PLAN (23 août 2026)** : `plans de travail/PLAN-291-476-gestion-des-doublons.md` — à exécuter en session neuve (demande de Grégoire). Verdicts actés : **bloquer sur l'IDENTITÉ, avertir sur le NOM** (bloquer sur le nom casserait ses deux échelles « IDME et niv 0 », #450) ; **#291 traité maintenant**. ⚠ **Constat mesuré qui change le cadrage** : les cinq détecteurs dédupliquent par `id` AVANT de regrouper par nom → la **vraie collision d'identifiant est INVISIBLE** (rend `[]`), et copie vs homonyme sortent **indiscernables**. La consigne du bandeau (`js/bibliotheque-ui.js:779`) est donc fausse des deux côtés. Les cartes n'affichent **aucun ID** (`renderCarteDisponible`) — d'où « ils ne sont pas affichés ! ». Reliquat laissé ouvert dans #291 après le plan : la modale de comparaison côte-à-côte et « Tout fusionner ».
  - **Constat 28 mai 2026** : la détection de doublons (`detecterDoublonsGrilles`, `detecterDoublonsCartouches`, etc.) affiche un avertissement informatif mais aucune action de résolution. Capture de Grégoire : 3 doublons détectés dans la Bibliothèque de grilles (« Global-4 (SRPN) H26 », « Global-5 (FR-HOLIS) H26 », « Global-5 (FR-ALGO) H26 »), tous avec 2 exemplaires.
  - **Patch UX appliqué le 28 mai 2026 (build 0528-05XX)** : `BibliothequeUI.renderAvertissementDoublons` enrichi avec une consigne textuelle (« ouvre le menu ⋮ et choisis Retirer ou Supprimer ») et un tooltip sur les IDs courts qui affiche l'ID complet (permet de distinguer vraie collision vs homonyme légitime). Pas un vrai workflow, juste une aide à la résolution manuelle.
  - **Vrai workflow attendu** :
    - Pour chaque doublon détecté, proposer un sous-modal de comparaison côte-à-côte (nom, date de modification, contenu, nombre de critères pour grilles, etc.).
    - Action « Garder X / Supprimer Y » en un clic, ou « Tout fusionner » pour les cas évidents.
    - Distinguer **vraie collision d'ID** (anomalie data, IDs identiques) de **homonymie légitime** (2 entités distinctes au même nom, IDs différents).
  - **Audit data préalable** : enquêter sur l'origine des collisions d'ID si elles existent vraiment (sur la capture du 28 mai, les IDs courts affichés sont identiques — mais c'est peut-être un faux positif du `genererIdCourt` qui ne prend que les 6 derniers caractères). Dump du stockage à faire pour confirmer.
  - **Cas observé 28 mai 2026 (Bibliothèque de grilles de Grégoire)** : 5 grilles distinctes (IDs différents) dans `bibliothequeGrilles`, toutes des variantes des 3 grilles de `grillesTemplates`. Hypothèse : renommage + ré-import successifs ont créé des copies forkées (chaque copie a un `idOriginal` qui pointe vers une grille locale). La détection actuelle (par nom exact) ne les signale pas car les noms diffèrent (« Global-5 FR-HOLIS » vs « Global-5 (FR-HOLIS) H26 »). Le vrai workflow doit inclure une détection par **similarité** : nom approximatif + nombre de critères + structure des critères + lien `idOriginal`.
  - **Effort estimé** : 4-6 h pour un vrai workflow (UI sous-modal + actions batch + heuristique de similarité + tests sur les 5 biblios concernées).

- [ ] 🟡 **#286** Migration globale emojis UI → Icônes SVG icons8 (chantier en 5 lots)
  - **Capture déclencheuse** : iPad 26 mai 05:15 — section « Préparer et importer » avec ✴ orange à droite du titre + 📝 papier-crayon au-dessus de « Annoter les travaux ».
  - **Cartographie réalisée 26 mai 2026** : 593 occurrences UI (200 HTML + 393 JS hors `console.*`/commentaires), 56 emojis distincts. 70 SVG icons8 déjà présents dans `icons/` (crédit inscrit dans À propos).
  - **Plan détaillé** : `plans de travail/PLAN-MIGRATION-ICONES-SVG.md` — table de mapping, lots A/B/C/D/E, ordre recommandé, décisions Grégoire pendantes.
  - **Top 3 emojis** : ✴ ×76 (bouton aide, à mapper → `icon-info` à ajouter), ⚠ ×63 (warning), ✓ ×48 (check simple).
  - **Effort total** : 5-6 h réparties sur 3-5 sessions.
  - **Lot A** (bouton aide ✴, 45 min) recommandé en premier — gros impact visuel, mapping unique.

### Codex / Onboarding

- [ ] ⚠️ **#334** Chantier import codex iPad — saturation du stockage (~1 Go) : pré-vol quota, import journalisé, snapshot haché — créé 10 juin 2026 (Cowork)
  - **✅ A/B/C/D LIVRÉS — réconcilié + Session D le 15 juin 2026** (désync BACKLOG↔main attrapée à froid) : le code et les tests sont dans `main`. `evaluerPrevolStockage` (A, `sentinelle-prevol-stockage-2026-06.test.js`), `construireBilanImport` + « Import terminé — incomplet » (B, `sentinelle-import-journalise-334B.test.js`), `_indexerSnapshot`/`codex-snapshot-hash-v1` + `analyser-fusion-hash.test.js` (C), harmonisation `db.set`/`setSync` + `SEUIL_IDB_FIRST` constante unique + doc DATA-OWNERSHIP (D, 1.17.9, `sentinelle-db-set-idb-first-334D.test.js`). 74 tests verts sur les sentinelles import + D. **RESTE : validation terrain iPad** (refus réel sur appareil saturé, petit codex qui passe ; comportement db.set fin couvert par Playwright/CI). **#295 déjà archivé** (absorbé, BACKLOG-ARCHIVE). → **clôturable après validation terrain iPad**.
  - **Documents de référence** : diagnostic complet `Rapports/analyse-saturation-import-codex-ipad-2026-06-10.md` (révisé v2 après contre-audit) ; plan d'implémentation séquencé `Rapports/plan-chantier-import-codex-ipad-2026-06-10.md`. **Absorbe #295** (la session A le livre et le ferme).
  - **Contexte** : échec rapporté pendant l'import d'un codex ~1 Go sur iPad au disque presque plein. Cause : quota WebKit proportionnel à l'espace libre + aucune vérification préalable + échecs partiellement silencieux (blobs « ignorés ») + double rétention du dataset (snapshot 3-way intégral en IDB et en memoryCache à chaque boot).
  - **4 sessions livrables séparément** (détail, lignes de code, risques et tests dans le plan) :
    - **A ✅ LIVRÉ** — pré-vol `navigator.storage.estimate()` (réutilise `estimerQuota()` existant de travaux-stockage.js) + `persist()` au bon moment + refus avec message actionnable + avertissement « le ZIP source reste dans Fichiers ». Règle le cas rapporté. Version minor.
    - **B ✅ LIVRÉ** — import journalisé : compteurs de blobs ignorés/refusés, bilan honnête (« Import terminé — incomplet » au lieu de « Codex chargé ! »), anti-spam notifications dans `stockerBlob`. Décision actée : pas de rollback (échec dur en phase données, tolérance journalisée en phase blobs). Version minor.
    - **C ✅ LIVRÉ (1.15.0)** — snapshot 3-way remplacé par un index de hachés SHA-256 (`codex-snapshot-hash-v1`) : `_analyserFusion` n'utilise jamais les valeurs de l'ancêtre, seulement présence + égalité JSON (audit exhaustif des call-sites dans le plan). Élimine la duplication IDB + RAM sans toucher db.js. **Session la plus sensible (fusion 3-way)** — suite Vitest dédiée exigée. Version minor.
    - **D ✅ LIVRÉ (1.17.9)** — harmonisation `db.set`/`setSync` (seuil IDB-first unique : `SEUIL_IDB_FIRST` extrait en constante de module, deux littéraux dupliqués retirés), décision documentée : **pas d'éviction memoryCache possible** (608 call-sites `getSync`, relecture IDB synchrone impossible) — règle consignée dans `docs/DATA-OWNERSHIP.md`. Version patch.
  - **Hors périmètre assumé** : pic RAM transitoire de JSZip (~2,5-3 Go pour 1 Go de codex) — décompression en flux (`DecompressionStream`) = chantier futur distinct (piste 4 du rapport). Le jetsam iPad reste possible sur import géant même après ce chantier.
  - **À recueillir en parallèle (testeur)** : `navigator.storage.estimate()` sur l'appareil, espace libre exact, onglet rechargé vs import « terminé » incohérent.

- [ ] ⚠️ **#336** Ouvrir un codex ne purge pas l'espace de travail précédent — les données Safari doublent — créé 11 juin 2026 (constat terrain iPad : 2,5 Go « Documents et données » après import d'un codex ~1 Go)
  - **✅ PREVIEW (read-only) + purge manuelle LIVRÉS — réconcilié le 15 juin 2026** (désync BACKLOG↔main) : à l'ouverture d'un codex, `_planifierPurgeEspace` calcule en **lecture seule** le plan (clés orphelines + blobs orphelins), `_afficherPlanPurge` l'imprime en console (« PREVIEW — rien n'est supprimé ») et le **persiste** (`_codex_planPurge336`, survit au rechargement). La suppression effective n'est PAS automatique : elle s'exécute par `Codex.purgerEspacePrecedent()` en console **après vérification du compte**. Test `sentinelle-purge-espace-336D.test.js` (17 cas) vert. **RESTE : validation terrain Mac/iPad** (chiffrer l'ampleur réelle, décider si/quand exécuter la purge sur les vraies données ; coordination #334 C déjà livrée). La purge automatique à l'import reste volontairement non activée (prudence suppression de données).
  - **Cause (3 contributions)** : `chargerCodex` écrase les clés présentes dans le ZIP mais (a) les **blobs préexistants** non référencés par le nouveau codex restent en IDB pour toujours (orphelins) ; (b) les **clés** d'un espace de travail antérieur absentes du ZIP restent aussi ; (c) `_codex_snapshot_avant` conserve une **copie intégrale** du dataset (la session C de #334 la remplace par un index haché de quelques Ko).
  - **Sémantique à implémenter** : ouvrir un codex = REMPLACEMENT de l'espace de travail (`docs/architecture/ECOSYSTEME-DONNEES.md`) → à la fin d'un import complet, purger les blobs non référencés par les `fichiersTravaux` importés et les clés orphelines. ATTENTION : le flux fusion/comparaison (`lireCodexExterne`, multi-codex) ne doit PAS purger — périmètre strictement `chargerCodex` (restauration complète).
  - **Prudence** : c'est de la suppression de données — preview/comptage en console d'abord (patron `reparation-donnees-algorithmiques`), session dédiée avec tests. Se coordonne avec #334 session C (le snapshot haché règle la contribution (c)).
  - Concept de fichier ZIP transportable complexe pour non-technicien. Safari sans FSAPI (chaque save = nouveau téléchargement). iPad WebKit imposé.
  - Pistes : assistant premier lancement, détection navigateur + adaptation instructions, guidage remplacement fichier sur clé USB.

### Reserve / Archives — extension

- [ ] 🟢 **#257 v2.B** Ouvrir la réserve v2.B — mode consultation namespace temporaire
  - Suite de #257 v2.A (livré 28 avril). Effort estimé : 5-6 h.
  - Use cases : adapter une grille A2024 pour H2026, démo trimestre passé en formation, récupérer un cartouche bien rédigé retiré de la bibliothèque active.
  - Mécanisme : namespace temporaire `__archive_a2025_*` séparé du trimestre actif, lecture seule. Panneau « Contenu de l'archive » + bouton « Réimporter dans mes bibliothèques actives ».

### Données démo (utiles AQPC et expérimentateurs)

- [ ] 🟡 **#273** Évaluations démo basées sur de vrais travaux d'élèves anonymisés
  - Consentement obtenu de plusieurs élèves H2026. Travaux à anonymiser avant intégration au pack démo.
  - Périmètre : 2-3 dossiers complets (annotation Apple Pencil + évaluation grille + rétroaction structurée).
  - Préfixe `PROD_DEMO_` obligatoire (#86 : `PROD_` seul matche les vraies productions).
  - **Visée double** : valider flux bout-en-bout + servir d'exemples concrets aux nouveaux utilisateurs (AQPC 3 juin et après).

- [ ] 🟢 **#274** Produire des cartes mentales démo pour le matériel pédagogique (été 2026)
  - 2-3 cartes complètes couvrant différentes disciplines. Utile pour la cohorte CoP (Rencontre 5 « Aligner sa pratique », janvier 2027).
  - Période cible : été 2026 (préparation pendant la phase expérimentateurs juin-août).

- [x] 🟢 **#351** Renommer les 20 élèves fictifs du pack démo (figures historiques/culturelles) — préparé en Cowork 26 juin 2026 — ✅ LIVRÉ 29 juin 2026
  - Remplacer les noms québécois fictifs par 20 figures (Achebe, de Beauvoir, Berlioz, Césaire, Comăneci, Curie, Einstein, Freud, van Gogh, Goodall, Kahlo, Kurosawa, Kusama, Lovelace, Mandela, Messi, Morrison, Parks, Sangaré, Shankar). Identifiants `id`/`da` (DEMO001-020) **inchangés** — seules les chaînes d'affichage changent.
  - **Périmètre** : un seul fichier de code, `js/pack-demo-20.js` (3 surfaces dénormalisées : `prenom`/`nom`, `etudiantNom` ×202, prénom incrusté dans les rétroactions ×~198) ; + docs hors archive. Aucun test à éditer (fixtures synthétiques / DA).
  - **Appariement positionnel** (décision Grégoire, 26 juin 2026) — inverse le genre sur 10 profils → vérifier les accords genrés des rétroactions.
  - Décision esthétique en suspens : DEMO010 = profil « fort » (→ Goodall), DEMO004 = « en difficulté » (→ Césaire) — échangeable.
  - **Consigne détaillée** : `plans de travail/CONSIGNE-renommage-eleves-demo.md`.

### Recherche / Analyse longitudinale

- [ ] 🟢 **#35** Import historique H2024 (premier trimestre du portfolio, pratique sommative uniquement)
  - Baseline pour comparaison longitudinale (pas de PAN, pas de RaI).
  - Données disponibles : TSV artefacts, étudiants, évaluations. Même méthode d'import que A2024.

- [ ] 🟢 **#36** Rapport comparatif inter-trimestres (H2024, A2024, A2025, H2026)
  - Variables système (+Portfolio H24, +PAN A25, +RaI A25, +Patterns A25) + variables pratique.
  - **Hypothèse principale** : RaI (A25) → enseignant plus proactif → interventions précoces → moins de décrochages → meilleures moyennes.
  - **Potentiel communication AQPC** si résultats concluants.
  - **Prérequis** : #35.

- [ ] 🟢 **#245** Interventions N3 dans le profil étudiant — progression temporelle
  - Les interventions N3 (individuelles) ne sont pas significatives au niveau du groupe.
  - Approche : marqueur sur la courbe P individuelle + delta P avant/après. Prérequis : graphique de progression individuel existant.

- [ ] 🟢 **#241** Analyser l'impact des jetons de reprise sur P dans les courbes d'intervention
  - Quand un étudiant utilise un jeton, P change rétroactivement → masque l'effet réel d'une intervention.
  - Objectif : marquer les séances avec jetons, ou calculer un P « sans reprises » pour isoler l'effet net.

### Module Travaux — Phase 1 import (mars 2026, en suspens)

- [ ] 🟢 **#177** Import par dossier complet Lea (A1)
  - Lire le dossier téléchargé, parser noms `Nomdefamille_DA_Travail_Date`. Associer auto via DA.
  - Gestion des doublons (garder le dépôt le plus récent).

- [ ] 🟢 **#178** Assemblage multi-images par élève (A3)
  - Détecter fichiers multiples d'un même élève (même DA, même production).
  - Ordonner par nom/horodatage, assembler en document multi-pages. Le groupement existe déjà (`grouperSelection()`) — l'automatiser.

### Module Planification

- [ ] 📦 🟢 **#140** Organisateur — Refonte layout deux colonnes (horizon automne 2026)
  - Layout vertical actuel = trop de scroll. Cible : colonne gauche (vue d'ensemble leçon) + panneau droit (3 modes : Détail / Enseignement explicite / Vue calendrier).
  - Plan complet : `plans de travail/PLAN-ORGANISATEUR-LAYOUT.md`.
  - Inclus dans la complétion du module Alignement à l'automne 2026, pour Rencontre 5 « Aligner sa pratique » (janvier 2027).

### Module Évaluation — refactor architectural

- [ ] 🟢 **#272** Remplacer les 5 flags globaux + setTimeout imbriqués par un module `eval-chargement.js` (machine à états)
  - Coordonne ouverture fichiers et chargement évaluations. 5 flags + chaînes setTimeout (150-800ms) non annulables.
  - Cause race conditions, flags collants, restauration aveugle du mode Évaluer.
  - 5 phases, 6 points d'entrée à migrer. Plans détaillés : `plans de travail/Plan — Machine a etats pour le chargement d'evaluations.txt` + `Contre-expertise — Machine a etats eval-chargement.md`.
  - **Priorité** : moyenne — à planifier quand les correctifs de session ne suffisent plus.

### Rythme Phase 5 — Raffinements

- [ ] 📦 🟢 **#268** Courbe d'apprentissage de l'évaluateur (tendance temporelle par activité)
- [ ] 📦 🟢 **#269** Export du portrait temporel pour réflexion professionnelle
- [ ] 📦 🟢 **#270** Drill-down par activité → détail productions/groupes
- [ ] 📦 🟢 **#271** Planification multi-productions avec priorités

### Sécurité / Modes alternatifs

- [ ] 🟢 **#47** Mot de passe optionnel pour sauvegarde/restauration
  - AES-256 via Web Crypto API. Couvre la protection au repos (fichier exporté en local), distincte de la signature ECDSA prévue pour la Voûte (Défense F, juillet 2026).
  - Décision D3 du 11 mai 2026 a écarté le chiffrement au repos pour la Voûte ; cet item reste pertinent pour les sauvegardes personnelles cloud/USB.
  - À reconsidérer après Voûte Phase 1.

- [ ] 📦 🟢 **#33** Mode Tableur — Saisie directe des résultats (POST v1.0)
  - Utiliser l'app sans créer productions/grilles/échelles. Entrée directe des résultats comme dans un tableur.
  - Public cible : enseignants avec leur propre système d'évaluation ou voulant un outil simple.
  - Prérequis : documenter la logique complète avant codage.

---

## Notes

### Priorités

- **Retours testeurs** passent TOUJOURS AVANT ce backlog (politique CLAUDE.md).
- Items classés par thème, pas par ordre d'exécution. Le plan d'exécution recommandé vit dans `plans de travail/PLAN-TRAVAIL-26-MAI.md`.

### Pour ajouter un item

```markdown
- [ ] [emoji catégorie] **#XX** Description courte
  - Détail 1
  - Détail 2
```

### Pour marquer comme complété

1. Changer `[ ]` en `[x]` et ajouter `✅ LIVRÉ (date, build)`.
2. Déplacer l'item entier (avec son contexte) dans `BACKLOG-ARCHIVE.md`, dans une nouvelle section datée ou en ajoutant à la section existante.
3. Si pertinent : noter dans `SESSION.md` la livraison + référence au commit.

### Historique

Tous les items livrés/abandonnés/obsolètes (313 items au 25 mai 2026) sont consultables dans `BACKLOG-ARCHIVE.md` (2 198 lignes, organisé chronologiquement par beta/session).
