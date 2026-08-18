# BACKLOG ARCHIVE - Monitorage Pedagogique

> **Rôle de ce fichier** : conserve l'historique COMPLET du backlog jusqu'au 25 mai 2026 inclus,
> avec tous les items livrés ([x]), abandonnés (~~~~) et obsolètes. Sert de mémoire de projet :
> qui a fait quoi, quand, pourquoi, dans quelle session.
>
> **Le backlog actif vit dans `BACKLOG.md`** (racine du repo) — version allégée contenant
> uniquement les items ouverts ([ ]) avec leur contexte minimal.
>
> **Bascule effectuée** : 25 mai 2026, fin de journée, par Claude à la demande de Grégoire.
> Avant la bascule : BACKLOG.md = 2 198 lignes, 169 Ko, 30 items ouverts + 313 items fermés mélangés.
> Après : BACKLOG.md court (~30 items), BACKLOG-ARCHIVE.md = ce fichier (historique intact).
>
> **Ne pas modifier cet archive** sauf pour ajouter des items récemment fermés (les déplacer
> depuis BACKLOG.md vers ici). L'historique passé reste figé comme registre du projet.

---

## Items livrés après la bascule du 25 mai 2026

### Bascule du 10 juin 2026 — passe de triage (Cowork)

> Déplacés ici par Claude (passe de triage du 10 juin 2026, à la demande de Grégoire) : 16 items cochés [x] restés dans le backlog actif, dont #303 (clos d'après SESSION.md mais resté ouvert dans BACKLOG.md — réconciliation) et #295 (absorbé par #334).

- [x] 🔴 **#330** Bug assiduité bi-groupes — dénominateur contaminé par les séances de l'autre groupe — créé 10 juin 2026, **LIVRÉ 10 juin 2026 (1.6.4), validé terrain**
  - **Symptôme** (données réelles H2026, groupes 00008/00002) : A chute vers ~50 % dès la 2e semaine pour tout le groupe affiché, même étudiant·es présent·es. Faussait en cascade M = (A+C)/2, profils, corrélations et alertes RàI.
  - **Cause** : depuis la consolidation chantier D (29 mai), `groupeEtudiants` = roster du cours ENTIER (51 = 26+25). `calculerAssiduite` construisait `datesSaisies` depuis ce roster — la garde du FIX #220 supposait un roster mono-groupe. Chaque séance saisie du groupe B = absence complète pour chaque étudiant·e du groupe A.
  - **Livré (code)** : helper `construireDatesSaisiesGroupe(da, presences)` dans `indices.js`, partagé par `calculerAssiduite` + `calculerAssiduitePourAffichage` (bloc dupliqué retiré). Sentinelle `tests/unit/sentinelle-assiduite-bigroupes-330.test.js` (5 cas : cache contaminé, symétrie, FIX #220 préservé, roster legacy sans groupe).
  - **Réparé (données)** : les 2 GC pointaient le MÊME horaire « Lun-Jeu » ; GC 00008 réassemblé sur « Mar-Jeu » (HOR_1768050643606), caches `seancesCompletes` + indices régénérés pour les 2 groupes.
  - **Reliquat ouvert → #331** : fiches de présence orphelines du 00008 saisies sous des dates de LUNDI pendant le mauvais assemblage (vu : lundi 23 fév, sem. 6) — invisibles en saisie, exclues du calcul, partiellement doublonnées par re-saisie manuelle. Auditer puis re-dater ou purger.


- [x] 🟡 **#331** Fiches de présence orphelines (séquelle #330) — audit puis purge — créé et **CLOS 10 juin 2026** (purge console one-shot)
  - **Inventaire (sonde 10 juin)** : 4 lundis (9 et 23 fév, 2 et 23 mars) × 26 fiches = 104 fiches non-facultatives d'étudiant·es 00008 sous des dates sans cours (confirmé Grégoire : pas de cours 00008 ces lundis ; les mardis des mêmes semaines étaient déjà saisis).
  - **Purge** : backup Codex puis script console (filtre identité DA × date × non-facultatif), recalcul indices enchaîné. Pas de bump (opération données, patron chantier D).


- [x] 🟢 **#327** Étendre le classement par dossiers aux autres bibliothèques (grilles, échelles, productions) — ✅ **LIVRÉ 1.6.0 (9 juin 2026, `a27f7e42`)**, validé terrain par Grégoire
  - **✅ CADRAGE** : `plans de travail/CADRAGE-327-classement-transversal-biblios.md` (§7 = journal des décisions). Prolonge #320 (1.5.0 pour les pratiques).
  - **T0–T3** : helper générique `BibliothequeUI.repertoires` (`6ea5abc3`) + refacto pratiques sans wrapper (sentinelles #320 adaptées). Câblage **grilles** (`d1e3b7df`), **échelles** (`1e0a322e`), **productions** (`4d857ba2`). Filtres de commodité (discipline, pratique) retirés ; code mort supprimé ; hook de cohérence dans chaque remover ; 1 sentinelle de rendu par lot. 380 Vitest + 47 Playwright verts.
  - **T4 cartouches = EXCEPTION (décision Grégoire, `19480962`)** : dossiers NON appliqués — la relation « par grille » est la structure réelle (`cartouches_{grilleId}`), conservée telle quelle. Aucune modif de `cartouches.js`.
  - **T5** : changelog `1.6` + release `minor` (`a27f7e42`, build 0609-2040). Option démo (1 répertoire d'exemple) reportée comme pour #320. Archivage à la prochaine bascule.
  - **Origine** : demande Grégoire (9 juin 2026, captures des 4 modales). Reprend « même chose dans toutes les bibliothèques » de l'idée initiale #320.


- [x] 🟢 **#320** Répertoires de classement dans les bibliothèques (pratiques, échelles, grilles…) — ✅ LIVRÉ 1.5.0 (9 juin 2026, `1321faac`). Pratiques d'abord (L0→L3 + select compact + repliable). Reste optionnel : répertoire d'exemple démo + extension aux autres biblios (helper `grouper` réutilisable). Archivage à la prochaine bascule.
  - **✅ CADRAGE PRÊT (9 juin 2026)** : `plans de travail/CADRAGE-320-repertoires-bibliotheques.md`. Décisions par défaut : **dossiers exclusifs**, **pratiques d'abord** (archi transversale), **collection séparée** `repertoiresBibliotheques` (jamais un champ sur l'item — conformité `SKILL_integrite_globaux`). Découpage en 5 lots (L0 modèle+CRUD → L4 release `minor`). 3 points à confirmer avant L0 (gabarits non classables / clé globale / sémantique).
  - **Origine** : idée Grégoire (5 juin 2026, réflexion Comparateur — `plans de travail/NOTE-COWORK-comparateur-pratiques.md` q.7). L'utilisateur stocke ses essais de pratiques dans la bibliothèque ; il devrait pouvoir **créer des répertoires** pour classer ce qu'il veut — ses propres hypothèses, les pratiques reçues de collègues, etc. « Même chose dans toutes les bibliothèques d'ailleurs. »
  - **Périmètre à cadrer** : transversal aux bibliothèques (pratiques de notation d'abord ; échelles, grilles, cartouches ensuite ?). Attention aux collections globales partagées — charger `SKILL_integrite_globaux.md` au cadrage (le classement ne doit jamais filtrer par flag, toujours par identité de la source).
  - **Lien** : le sélecteur de candidates du Comparateur bénéficiera du classement sans en dépendre (aucune dépendance dure).


- [x] 🟡 **#308** RÉSOLU (2 juin 2026, terrain) — P à 0 % sur Suivi gr. 00008 = **assemblage pratique↔groupe-cours erroné**, PAS le mode comparatif
  - **Cause réelle** : le groupe-cours 00008 (601-101 H2026) avait pour pratique active « Testb-SOM-31mai » (pratique de **test** SOM liée à Été 2026, héritée des tests du volet B le 31 mai — cf. réserve #126), au lieu de sa vraie pratique **PAN-SDT-Litt H26** (`pratique-1768910384608`, celle de gr. 00002 qui calculait correctement). Le calcul de performance lit `modalitesEvaluation` global (= config de la pratique active) → `PratiquePANStandards.calculerPerformance` sortait 0. **Le moteur de calcul est sain** : gr. 00002 affichait P=60 %.
  - **Correction** : réassignation de PAN-SDT-Litt H26 au groupe-cours via « Appliquer au cours actif » (data, **sans code**). P recalculé correctement. Méthode de diagnostic décisive : comparer un groupe qui marche (00002) vs cassé (00008).
  - **Le diagnostic initial (mode comparatif) était erroné** : ni le mode comparatif ni les libellés codés en dur ne causaient le 0 %. Le calcul générique `calculerPerformancePAN` donnait 0.76 sur les mêmes données — confirmant que les données étaient bonnes et le contexte de pratique mauvais.
  - **Travail de code livré quand même (amélioration, build 0602-1513)** : `afficherMetriquesGlobales` suit désormais la **pratique active** au lieu de forcer PAN (`determinerModeAffichageTableauBord`, testée) ; libellés de barres « Performance (P) » nus hors mode comparatif (plus de « — alternatif » trompeur) ; 2 sites `!== false`→`=== true` harmonisés (`etudiants.js:864-865`, `profil-etudiant-sections-affichage.js:3805-3806`). 7 tests sentinelle (`tests/unit/sentinelle-mode-affichage-tableau-bord-2026-06-02.test.js`).
  - **Observation laissée (non bloquante)** : depuis #224, le chemin `indicesCP` (`portfolio.js:646`) n'a plus de fallback générique `calculerPerformancePAN` quand `pratique.calculerPerformance` rend null/0 → une pratique PAN **mal configurée** affiche 0 sans repli (masque la mauvaise config plutôt que de la signaler). Le vrai chantier de calcul par famille reste **#303 Session C (post-AQPC)**. Retrait complet du mode comparatif = chantier distinct (`project-mode-comparatif-som-pan-a-retirer`).


- [x] **#303 Session C — RETRAIT DU MODE COMPARATIF (3b+3c+3d) — LIVRÉ 4 juin 2026** (branche `claude/eager-wozniak-KpaAC`, PR #25, build `0604-1326`, 175 Vitest verts). Mode comparatif **entièrement retiré** : neutralisation à la source (3b), code mort affichages/import-export/CSS (3c), write-side `pratiques.js`/`pratique-registre.js` (3d). Affichages **validés terrain par Grégoire** ; feu vert donné pour 3d.
  - **Reste à valider avant clôture** : flux Réglages → Pratique de notation (sauvegarde/chargement d'une pratique, modifié en 3d) sur Mac+iPad. Données `affichageTableauBord` persistées laissées inertes (pas de migration destructive).
  - ⚠️ **NE PAS confondre** avec le vrai chantier **#303 Session C = calcul par famille** (voir #307), qui reste à faire.


- [x] 🟢 **#300** Bug `getSync("trimestres")` — désync localStorage↔IDB — ✅ **LIVRÉ 10 juin 2026** (Lot 1 robustesse + Lot 2 cause racine)
  - Découvert 29 mai 2026 (chantier D). `db.getSync("trimestres")` rend par moments 4 objets aux `.id` **vides** (`map(t=>t.id).join(",")` → `",,,"`), alors que `db.get("trimestres")` (async/IDB) rend la bonne structure.
  - **Risque** : tout code qui énumère les trimestres via `getSync` (ou `t.id` issu de getSync) pour bâtir des clés `{t.id}_{suffixe}` travaille sur des ids vides → données introuvables / écritures mal placées.
  - Piste : pourquoi `trimestres` part en localStorage amputé (cf. `db.js` `_prechargerDepuisIDB`/`syncToLocalStorageCache`, quota Safari file://) ; forcer lecture async ou re-sync au boot. Distinct du pattern autosave race-condition (ici = lecture). Cf. mémoire `project-bug-getsync-trimestres-desync`.
  - **Diagnostic (10 juin 2026)** : mécanisme = **fenêtre de boot**. `syncToLocalStorageCache` (IDB→localStorage) ne tourne qu'après `db.init()`, et `db-ready` n'est émis qu'après ; toute lecture `getSync('trimestres')` **avant `db-ready`** voit le localStorage de la session précédente (ids vides), tandis que `db.get` (IDB) rend la bonne structure — d'où l'intermittence. Audit des ~30 lecteurs : la plupart se gardent déjà ; **9 énumérateurs nus** bâtissaient `${id}_…` sans garde (8 dans `donnees-v2.js`, 1 dans `planification-bibliotheque.js`) → agrégations silencieusement amputées.
  - **✅ Lot 1 LIVRÉ (10 juin 2026, robustesse ciblée)** : helper global `enumererTrimestres()` (`js/trimestres.js`) qui écarte les trimestres à `id` falsy **en lecture seule** (jamais de réécriture, sinon une lecture périmée au boot effacerait des trimestres réels) ; les 9 énumérateurs nus routés dessus. Sentinelle `tests/unit/sentinelle-trimestres-id-vide-300.test.js` (6 cas). 386 Vitest + 47 Playwright verts. Neutralise la **conséquence** (corruption silencieuse) quelle que soit la cause.
  - **✅ Lot 2 LIVRÉ (10 juin 2026, cause racine — clear-then-hydrate)** : `syncToLocalStorageCache` (`js/db.js`) invalide désormais le cache localStorage des clés présentes en IDB **avant** de les réhydrater. Pendant la fenêtre de boot, `getSync` rend le défaut (sûr) au lieu d'une valeur périmée ; les clés localStorage-seules restent intactes (aucune perte). Sentinelle `tests/unit/sentinelle-boot-clear-then-hydrate-300.test.js` (3 cas : ordre clear-avant-hydratation, état final = IDB, préservation des clés locales). Commentaire périmé de `snapshots.js` corrigé au passage. 389 Vitest + 47 Playwright verts.
  - **Lien #116 / SUIVI-BUGS #129** : le « fallback global silencieux » horaire↔groupe-cours reste un chantier distinct (#116) ; #300 ne traitait que la désync de lecture trimestres.


- [x] 🟢 **#303** Refactor des pratiques de notation → registre `IPratique` comme source unique (SSOT) — **CLOS (triage 10 juin 2026)** : « #303 CLOS » acté dans SESSION.md ; Session A livrée 29-30 mai, Session B (représentations) 4 juin, Session C (calcul par famille) consolidée sur main le 5 juin (HEAD `a8345986`, 224 tests verts)
  - **Vérification triage (grep 10 juin)** : la production naît désormais canonique — select `mat-pratique-type` (index.html ~5673) et radios pratique par défaut (`pratiques.js` ~1655-1680) émettent `sommative`/`standards`/`specifications` ; `calculerDetailsNoteFinale(da, pratiqueIdDemande = null)` paramétrable (`profil-etudiant-actions.js:411`). **Non vérifié** : le volet (A) migration console one-shot des données personnelles de Grégoire — à confirmer par Grégoire (hygiène data, pas du code).
  - Réf. maître : `Refactorisations/PLAN_architecture_pratiques_SSOT.md`. Ordre impératif **A → B → C**.
  - **✅ Session A-1 LIVRÉE (29 mai soir, beta 99.80, commit `8de006a`)** — non destructif : `normaliserIdPratique` + `PRATIQUE_DEFAUT='standards'`, **bug latent corrigé** (plus de réécriture `specifications`→`pan-specifications` ; normalisation à la lecture **sans write-back**), instance Standards → `'standards'`, 3 sites `liste-evaluations.js` normalisés, test Vitest `pratique-normalisation`. **Décision : code Standards = `STD`** (`SDT` = libellé). Cf. mémoire `project-pratiques-ssot-decisions`.
  - **✅ Session A-2 « tolérance à la lecture » LIVRÉE (30 mai, beta 99.84, poussée)** — lots 4b/4c/4d/4e, non destructifs. Tous les consommateurs majeurs (`pratiques-bibliotheque`, `pratiques-gestion`, `pratiques`, `wizard-pratique-v2`, profils, stats…) lisent désormais legacy ET canonique. **Conséquence : l'app fonctionne quelles que soient les données → la migration destructive n'est plus un prérequis, juste du nettoyage.** `code:'PAN'`→`'STD'` fait dans 4c/4e.
  - **🔑 DÉCISION 30 mai (Grégoire) — SCINDER l'ex-« étape 6 » en deux opérations DISTINCTES** (ne plus jamais les fusionner) :
    - **(A) Migration destructive des données EXISTANTES** — réservée aux SEULES données de Grégoire, en **console one-shot** (modèle chantier D), sur backup, observable, réversible. **JAMAIS embarquée dans la version distribuée** aux ~80 expérimentateurs (migration-boot aveugle, sans filet, population non technique = risque décuplé). Fenêtre : post-AQPC / pré-ouverture.
    - **(B) Canonisation de la PRODUCTION** — faire naître les NOUVELLES données en canonique. **Non destructif** (ne touche aucune donnée existante). **C'est CE volet — pas (A) — qui rend les données des 80 pérennes et leur évite toute migration future.** À faire AVANT l'ouverture publique (fenêtre 3-30 juin, cf. #298). *Constat 30 mai : aujourd'hui un nouvel utilisateur crée des données LEGACY (wizard/selects/radios) → il hériterait du problème de Grégoire. (B) est donc nécessaire avant l'ouverture.*
  - **ORDRE IMPÉRATIF pour (B)** (vérifié par grep 30 mai — sinon régression) :
    1. **Rendre tolérants les ~7 lecteurs bruts restants** du SSOT `modalites.pratique` : `pratique-notation-v2.js` (lit ET écrit le SSOT, ~143-149/355/550/572, écriture l.544 — c'est le « nœud 4a », **LE verrou**), `spe-specifications.js:205`, `preferences-v2.js:228` (déjà `sommative`, à confirmer) ; vérifier `pratiques.js:1938/2335/2889` + `pratique-manager.js:204` (comparaisons `=== id` dynamiques, a priori OK). Méthode = normalisation à la lecture (pattern `_normPratique` / guard `typeof normaliserIdPratique`), comme 4c/4d/4e. Non destructif.
    2. **Canoniser la production** : `<option>` du select pratique (`index.html:5625-5627`), `data-param` radios défaut (`pratiques.js:1806/1815`), `deduireTypePratique` (`wizard-pratique-v2.js:2064/2075/2079`), écritures SSOT (`wizard-pratique-v2.js:2380`, `pratiques.js:1270` déjà OK), Temps 2 de 4c reporté (`<select> mat-pratique-type` + écriture `configurations[].type` dans `pratiques-gestion.js`).
    3. **(A)** pour Grégoire seul, puis **retrait des helpers transitoires** (`canonVersInterne`…) = ex-étape 7, **OPTIONNELLE** : la normalisation à la lecture peut RESTER comme filet d'interopérabilité (imports codex entre versions). La garder = choix défendable, pas dette.
  - **⚠️ Timing** : (B) étapes 1-2 non destructives mais sur fichiers sensibles (`pratique-notation-v2.js`) → **PAS à J−4 de l'AQPC**. Fenêtre = après le 3 juin, AVANT l'ouverture aux 80.
  - Détail complet : `Refactorisations/SPEC_sessionA_identifiants.md` (ADDENDUM 30 mai — ⚠️ dossier `Refactorisations/` NON versionné).
  - ⚠️ Incohérence corpus à corriger avant B/C : `PLAN_architecture_pratiques_SSOT.md` §7 (découpage sessions) est obsolète vs §5 réordonné (Session A = identifiants, pas représentations) ; le guide PAN Modalités affiche « code SDT » incompatible avec la décision `STD`.
  - **Session B (représentations)** : étendre le contrat (`obtenirCode`/`obtenirCouleur`/`obtenirLabelFamille`), tout lire du registre, supprimer les tables de codes éparpillées.
  - **Session C (calcul)** : déléguer à `calculerPerformance(da)`, supprimer le jeton binaire `'SOM'|'PAN'`, et y rattacher le fold `objectifs ⊂ standards`.
    - **⚠️ Constat terrain 31 mai (rapport #127)** : la note finale du **profil élève** (`profil-etudiant-actions.js` → `_obtenirConfigPortfolioCalcul`) se calcule **uniquement par le chemin portfolio** (PAN-Standards). Une pratique **Sommative** (moyenne pondérée) ou **Spécifications** (seuils) → « Note finale non calculable / config portfolio absente ». Session C doit router la note finale du profil vers `PratiqueConfigurable.calculerPerformance` selon la famille (`calcul_note.methode`), pas présumer le portfolio. (L'affichage du **nom** de la pratique active est, lui, déjà livré le 31 mai — voir SUIVI-BUGS #127.)
  - Décisions actées : nommage neutre (`sommative`/`standards`/`specifications`/`denotation` ; codes SOM/STD/SPE/DEN ; « PAN » = nom de famille). Audit des call-sites : `Refactorisations/PLAN_unification_codes_pratiques.md`. Post-AQPC.


- [x] 🟢 **#287** Picker couleur custom (modale Personnaliser tampons + Codes erreurs FR) — **livré 28 mai 2026 PM**
  - **Implémentation** : `<details>` HTML5 + popover absolute avec grille des 12 couleurs prédéfinies (constante `COULEURS`) + bouton « Personnalisé » qui rouvre le picker natif macOS pour les couleurs hors-palette. La couleur active dans la grille est marquée via `.actif`.
  - **5 sites couverts** : pastille catégorie tampon (l. 2104 + l. 2746), pastille item tampon (l. 2149 + l. 2687), couleur outil de dessin avec numéro (l. 3135).
  - **Architecture** : helper `_renderPickerCouleur(idAttr, idVal, couleur, opts)` paramétré (supporte un summary avec contenu — numéro pour le site 3135). Handlers `travauxOutils.choisirCouleurPalette(el)` et `travauxOutils.ouvrirCouleurPerso(el)` exposés via `data-action`. L'`<input type="color">` original est conservé en hidden (CSS `.travaux-retro-couleur-input`) — il reste la source de vérité pour la sauvegarde (`input[data-color-cat-id]` l. 2510, 2531, 3241, 3328) et reçoit un event `input` dispatché manuellement quand on clique une couleur de la grille. Le picker natif est appelé via `input.click()` depuis « Personnalisé ».
  - **Auto-fermeture** : event `toggle` capture phase qui ferme tous les autres `<details.travaux-retro-couleur-picker>` quand l'un s'ouvre. Évite plusieurs popovers superposés.
  - **Zéro-dette** : ancienne classe CSS `.travaux-retro-couleur-wrap` retirée (remplacée par le picker).
  - **Capture déclencheuse** : Grégoire 27 mai 2026 matin (modale Personnaliser tampons, picker macOS ouvert sans indication de la couleur active).


- [x] ⚠️ 🟡 **#294** Configurer Netlify + Cloudflare pour accueillir la visite AQPC du 3 juin
  - **Acté par Grégoire 28 mai 2026 matin** : à faire en PM, avant AQPC.
  - **Décision majeure 28 mai 2026 PM** : retrait complet du Cloudflare Access pour ouvrir l'app publiquement (élimine le challenge bot bloquant, élimine la friction OTP pour les expérimentateurs AQPC, libère la liste blanche). Cf. ADR-008 révisé + DEPLOY.md v1.1.
  - **Audit local livré** : `netlify.toml` ✅ propre (Cache-Control corrects). `labo.codexnumeris.org` n'a plus de DNS → URL réelle `app.codexnumeris.org` (substitution dans DEPLOY.md).
  - **Action restante côté dashboard Grégoire** : levée effective du Cloudflare Access dans le tableau Zero Trust + re-test public. Procédure dans la note de session.
  - **Post-AQPC** : `#298` créé pour révision PRIVACY.md (posture Loi 25 sans liste blanche).


- [x] 🟢 **#293** Toggle « Masquer les items déjà dans la barre latérale » en section 2 des modales bibliothèque — **livré 28 mai 2026 PM**
  - **Constat 28 mai 2026** (Bibliothèque de grilles de Grégoire) : la Section 2 montre toutes les entrées de la biblio partagée, y compris celles « Déjà dans la barre latérale ». Quand le ratio biblio/sidebar est lourd (ex. 5 entrées biblio pour 3 grilles sidebar = anciennes variantes accumulées), l'affichage devient encombrant et donne une fausse impression de doublons.
  - **Périmètre réel livré** : 3 modales (grilles, échelles, cartouches) au lieu des 5 initialement prévues. Audit pendant l'implémentation : `productions-bibliotheque-ui.js` et `pratiques-gestion.js` filtrent NATIVEMENT les items « déjà dans la sélection » avant Section 2 (ligne 76-82 productions, ligne 411-412 pratiques). Le toggle y serait sans objet — items « déjà présents » jamais affichés.
  - **Helpers ajoutés à `BibliothequeUI`** : `estMasquerDejaPresentActif()`, `filtrerParDejaPresent(cartes)`, `renderToggleMasquerDejaPresent(refreshFnName)`, `basculerMasquerDejaPresent(elementOuNom)`. Persistance dans `db` via la clé `biblio-masquer-deja-present` (préférence globale partagée par les 3 modales).


- [x] 🟡 **#292** Déduplication défensive au chargement de codex — filet de sécurité contre la propagation de doublons d'ID — **livré 28 mai 2026 PM, commit `ed83d74`**
  - **Constat 28 mai 2026** : `chargerCodex` (`js/codex.js:500`) fait un overwrite complet par clé (`db.set(cle, valeur)`). Si le codex source contient déjà des doublons d'ID dans `grillesTemplates`, `echellesTemplates`, `cartouches_*`, `bibliothequeProductions`, `bibliothequePratiques`, ils sont restaurés à l'identique à chaque ouverture. Les codex de Grégoire en sont infectés (3 doublons confirmés dans `grillesTemplates` au 28 mai).
  - **Origine probable** : un ou plusieurs imports historiques contournaient `verifierUniciteIds` (`js/import-export.js:66`) ou ne déduplicaient pas avant `push`. Audit à faire : grep tous les sites qui font `grilles.push(...)` / `echelles.push(...)` / etc. sans passer par `verifierUniciteIds` ou `importerGrillesExternes` (dont la version actuelle déduplique correctement, ligne 3940).
  - **Fix proposé** : dans `chargerCodex`, après `db.set(cle, valeur)`, si la clé correspond à une biblio partagée (liste connue), appliquer `verifierUniciteIds` sur la valeur AVANT le `set`. Idem pour les clés `cartouches_*` (pattern à matcher).
  - **Hygiène data** : nettoyer le codex de Grégoire (snippet console fourni le 28 mai 2026 — déduplique en gardant le premier item de chaque ID, puis ré-export du codex pour avoir une version propre comme base de démo AQPC).
  - **Effort estimé** : 1-2 h (fix `chargerCodex` + audit des chemins d'import historiques + un test).


- [x] ⚠️ 🟡 **#290** Intégrer 4 pratiques personnelles anonymisées au seed `MODELES_PRATIQUES_PREDEFINIS` — **livré 28 mai 2026 PM en 2 phases, commits `1fcad27` (phase 1 — anonymisation seed + zéro-dette IDs) et `c791f1b` (phase 2 — convention 'Demo Labo Codex' pour 3 modèles génériques + filtre transitoire OR)**
  - **Priorité actée par Grégoire le 28 mai 2026 matin** : les premiers expérimentateurs accéderont à l'application dès le 3 juin et iront probablement voir la bibliothèque de pratiques en premier (« existe-t-il une configuration de base pour ma discipline ? »). Le seed doit être enrichi avant cette date.
  - **Calendrier** : à exécuter APRÈS le plan de vérification visuelle en cours (28 mai matin), avant le 3 juin. Probablement 28-29 mai.
  - **Origine des données** : 4 pratiques actuellement dans le `bibliothequePratiques` IndexedDB local du Codex de Grégoire (importées de collègues du Cégep de Drummondville) — pas dans le code source. Grégoire conserve ces fichiers personnels **inchangés** en stockage, prêts à être récupérés pour le portage.
    - Modèle Chimie (FAH) — François A.-H. — Chimie — Notation par contrats
    - Par objectifs (Pondéré) — Michel B. — Mathématiques — Moyenne pondérée des objectifs
    - Par objectifs (Comptage) — Bruno V. — Chimie — Comptage d'objectifs essentiels et complémentaires
    - STD Chimie organique (BV) — Bruno V. — Chimie — Standards avec critères par standard
    - STD Interfaces et BD (Xavier C.-T.) — Xavier C.-T. — Informatique — 6 objectifs niveau 3+, base 80% + bonus
  - **Méthode suggérée** :
    1. Grégoire dump son `bibliothequePratiques` IDB (script console à fournir) pour récupérer les configurations exactes (typesTravaux, forfaits, parObjectifs, seuilsCritiques, etc.).
    2. Pour chaque pratique : extraire la configuration, **strip les initiales** en fin de `nom` (« STD Chimie organique (BV) » → « STD Chimie organique »), **anonymiser** `auteur: 'Gabarit Labo Codex'`, **nettoyer** tout `metadata_cc.auteur_original` et `metadata_cc.contributeurs`.
    3. Ajouter au seed `js/pratiques-bibliotheque.js` `MODELES_PRATIQUES_PREDEFINIS` avec `estGabarit: true`, IDs **sans prénom** (ex. `SPE-chimie-contrats`, `STD-chimie-organique`, `STD-info-interfaces-bd` au lieu de `STD-Bruno-Chimie` / `STD-Xavier-Info`).
    4. **Vérifier les IDs existants** dans le seed : `SPE-francois` (Modèle Chimie générique), `STD-par-objectifs-comptage`, `STD-par-objectifs-pondere`, `STD-Bruno-Chimie`, `STD-Xavier-Info` existent déjà avec `auteur: 'Labo Codex'`. Décider si on **remplace** la config existante par la version enrichie du collègue, ou si on **ajoute** une nouvelle entrée à côté. Recommandation : remplacer (le nom du seed actuel est générique, la config enrichie du collègue apporte plus de valeur pour les expérimentateurs).
    5. Renommer `STD-Bruno-Chimie` → `STD-chimie-organique` et `STD-Xavier-Info` → `STD-info-interfaces-bd` dans la même passe (zéro-dette : les IDs contiennent des prénoms).
  - **Convention auteur** : `auteur: 'Gabarit Labo Codex'` (et non « Anonyme » ni « Labo Codex » seul, pour distinguer les gabarits dérivés de pratiques de collègues anonymisées des modèles génériques originaux).
  - **Effort estimé** : 1-2 h (dump + lecture des configs + ajout au seed + renommage IDs + test visuel modale).


- [x] 🟢 **#289** Audit visuel des palettes de création — pattern « icônes 100 % + hover sur le bouton » **livré 28 mai 2026 PM**
  - **Pattern de référence** (livré 28 mai 2026 sur la palette Nœuds d'Alignement pédagogique, build 0528-0448) : l'icône est pleinement visible en permanence (blanc 100 % en sombre, noir 100 % en clair), et l'effet hover porte sur le bouton qui entoure l'icône (fond + bordure plus saturés), pas sur l'icône elle-même qui reste à 100 %.
  - **Classes auditées et migrées** :
    - `.outil-svg-icon` (palette annotation Travaux + ses variantes `.palette-toggle-icon`, `.palette-bas-icon`) — repos `invert(0.6/0.35)` → `invert(1)/brightness(0)`.
    - `.planif-icon` (boutons vue/zoom carte mentale) — idem.
    - `.nav-seq-icon` (chevrons navigation séquence/leçon, partagé entre planif et toolbars Travaux) — idem. État `:disabled` préservé à `invert(0.25/0.7)` pour signaler la désactivation.
    - `.editeur-page-icon` (boutons éditeur de pages + pipeline) — idem.
    - `.popover-icon` (mode clair uniquement) — passé de `invert(0.25)` à `brightness(0)` (100 % noir).
    - Tous les `:hover .X-icon { filter: ... }` retirés.
  - **Hors scope** (icônes sciemment pâles, design délibéré) : `.btn-inline-icon` (inline avec texte), `.modal-close-icon` (X de fermeture subtil), `.btn-delete-icon` (corbeille, action destructrice signalée par pâleur), `.drop-zone-icon` (zone drag&drop), `.codex-menu-icone img`, `.pipeline-icone-placeholder-img`. `.prep-btn` également hors scope (bouton purement textuel sans icône SVG).


- [x] 🟡 **#288** Terminologie collégiale : remplacer « élève(s) » par « étudiant·e(s) » dans l'UI — **balayage UI visible livré 28 mai 2026 PM**
  - **Convention** : au collégial le terme « élève » est réservé au primaire/secondaire. L'UI Labo Codex (Cégep de Drummondville) doit utiliser « étudiant·e(s) ».
  - **Bilan migration livrée** : 56 sites visibles migrés (169 occurrences brutes → 113 restantes). Les 113 restantes sont volontairement préservées : commentaires `//` et JSDoc, format de donnée d'anonymisation `'Élève X'` (modes.js, evaluation-chargement.js, reserve-ouvrir.js — convention stockée), patterns de matching CSV import (groupe.js l. 209-210 — détectent les colonnes externes avec ces mots), banniers ASCII de section, commentaire CSS, et la citation bibliographique (index.html:14459, titre d'ouvrage de Gauthier-Bissonnette-Richard 2013).
  - **Couverture** : index.html (24 libellés UI), 14 modules JS — descriptions SOLO (profil-etudiant-sections-affichage), objectifs pédagogiques d'organisateur et planification-carte, tooltips moyennes (etudiants, tableau-bord-apercu), bulles d'aide (accompagnement-contenu-popup), placeholders bilan réflexif (bilan-reflexif-editeur), alertes (liste-evaluations, profil-etudiant-sections-affichage), libellés tooltips d'action (travaux-outils, travaux-ui), descriptions RaI (profil-etudiant-calculs), dropdowns (graphiques-progression).
  - **Convention de remplacement appliquée** : « élève » → « étudiant·e », « élèves » → « étudiant·e·s », « Élève » → « Étudiant·e », adjectifs adjacents migrés vers la forme épicène (« sélectionné » → « sélectionné·e ») quand le mot suit immédiatement, accord par défaut conservé sinon. Pour « un élève » → « un·e étudiant·e ».
  - **Reste à faire post-AQPC** (si pertinent) : documentation `docs/` (rapports, plans, skills) — non inclus dans ce balayage UI.


- [x] 🟡 **#295** Diagnostic mémoire/quota avant la tentative d'ouverture d'un Codex (Mac + iPad + iPhone) — **ABSORBÉ PAR #334** (10 juin 2026) : la session A du plan `Rapports/plan-chantier-import-codex-ipad-2026-06-10.md` livre ce besoin (pré-vol + message actionnable) et fermera cet item
  - **Constat 28 mai 2026 PM** : Grégoire est actuellement incapable d'ouvrir un Codex sur son iPad parce que l'espace mémoire est saturé. La tentative échoue après coup, sans signal préalable. Conséquence directe : **ses tests sur iPad et iPhone sont limités** depuis plusieurs sessions — facteur d'incertitude pour le projet (le poste iPad reste un cas d'usage majeur).
  - **Comportement actuel** : `chargerCodex` (`js/codex.js`) déclenche les écritures `db.set(cle, valeur)` sans vérification préalable de l'espace disponible côté navigateur. Sur iPad Safari avec quota saturé, l'opération avorte en cours ou laisse l'état partiellement écrit.
  - **Comportement souhaité** :
    1. AVANT toute écriture, appeler `navigator.storage.estimate()` (retourne `{quota, usage}` en octets, supporté Safari iOS 17+) et calculer le ratio + l'espace restant.
    2. Calculer le poids du ZIP du codex à charger (somme des `JSON.stringify(valeur).length` à venir).
    3. Si `usage + poidsCodex > quota * 0.9` → bloquer le chargement et afficher une modale d'avertissement : « Votre espace de stockage navigateur est presque plein (X Mo / Y Mo). Le codex que vous tentez d'ouvrir pèse Z Mo. Libérez de l'espace avant de continuer. » + bouton « Voir comment libérer de l'espace » (renvoie vers une mini-doc avec Réglages Safari iOS).
    4. Si ratio > 0.95 → bouton « Forcer le chargement » désactivé. Sinon proposer le forçage avec avertissement explicite (état partiel possible).
  - **Affichage permanent suggéré** : badge discret quelque part dans les Réglages ou l'En-tête « Stockage : X% utilisé » (mêmes calculs) pour donner à l'utilisateur une visibilité en continu sur son quota.
  - **Effort estimé** : 1-2 h pour le diagnostic préventif + modale. +1 h pour l'affichage permanent du quota.
  - **Tests iPad/iPhone** : Grégoire devra vider partiellement son cache avant de pouvoir tester sur ses propres devices. Alternative : tester sur iPad/iPhone d'un tiers, ou en simulation desktop (DevTools Safari → quota artificiel).


### Réconciliation du 9 juin 2026 — items livrés (1.1.3 → 1.3.0) qui étaient restés marqués ouverts dans le backlog actif

> Déplacés ici par Claude (audit factuel git, début de session du 9 juin) : ces 5 items avaient été livrés et poussés mais n'avaient pas été cochés ni archivés. Voir commit `5b70c8e0`.

- [x] 🟡 ⚠️ **#317** Lot correctifs wizard de pratique (bugs #131-#135 de l'audit assistant) — ✅ LIVRÉ 1.1.3 (commits `6fa6bbd7` + clôture `a80bbdf5`)
  - **Origine** : audit de l'assistant de configuration (session Cowork du 5 juin, lecture intégrale de `wizard-pratique-v2.js`). Détail technique de chaque bug : **SUIVI-BUGS #131-#135** (section « Corrigés (5 juin 2026 — lot #317) »).
  - **Périmètre du lot** : #131 (`afficherEtapeV2` inexistant → `afficherEtapeWizardV2`), #132 (round-trip édition perdait la config portfolio + params objectifs — **le plus important**, sentinelle round-trip), #133 (récap affichait les valeurs Primo au lieu des réponses saisies → décision A : le wizard prime), #134 (`calculerNbEtapes` désync → dérive du graphe), #135 (alert()→`notifications.erreur`, couleurs alignées au design system, échappement nom).
  - **LOT COMPLET (5/5)**, sentinelle `tests/unit/sentinelle-wizard-roundtrip-317.test.js`. DEN sorti du lot → #318.

- [x] 🟡 ⚠️ **#319** Refonte ciblée de l'assistant de pratique (post-audit) — ✅ LIVRÉ 1.2.0 (6 lots, commits `58ed760e`→`18841d22`)
  - **Plan** : `plans de travail/PLAN_refonte_assistant_pratique_post-audit.md` (6 lots, golden master, bump `minor` au Lot 6). Audit source : `Rapports/AUDIT-assistant-configuration-2026-06-05.md`.
  - **Décisions actées (5 juin)** : refonte DANS l'architecture déclarative (pas de réécriture) ; voie rapide « Je sais ce que je veux » sur Q1 ; inversion classification↔infos-base ; écran d'entrée à deux portes (modèle bibliothèque vs décrire) ; Dénotation = minimal+fondations (lots a/b/c absorbés ; parcours créable DEN → #318).
  - Lot 1 = canonicalisation vocabulaire interne + purge `mode-configuration`/`config-reprises`. Lot 4 (exemple réel au récap) utilise `simulerIndices`.

- [x] 🟢 **#323** Icônes sur boutons foncés — contraste insuffisant — ✅ LIVRÉ (commit `b066ccc2`, corbeille `.btn-supprimer` ; steppers OK via `color-scheme`, rien à corriger)
  - **Origine** : terrain (7 juin, assistant SPE « Table des forfaits / Types de productions »). Corbeille des boutons Supprimer rouge foncé peu lisible (icône grise héritée du fond clair) ; flèches des steppers `input[type=number]`.
  - **Correctif** : icône `.btn-delete-icon` alignée sur la couleur du texte (blanc) au repos et au survol, scopée à `.btn-supprimer` (les corbeilles sur fonds clairs gardent le gris) ; vérifié 2 modes. Steppers : aucun fond custom dans le wizard, déjà gérés par `color-scheme` → rien à corriger.

- [x] 🟢 **#318** Famille « Dénotation » (DEN) — ✅ LIVRÉ 1.3.0 (couche 2, DEN-0→4, commits `73ad3d71`→`f1b655b9`). Réserve documentée : note DEN via `calculerPerformance`, pas le chemin procédural `calculerDetailsNoteFinale` (non bloquant)
  - **SPEC couche 2** : `plans de travail/SPEC_DEN_couche2.md` (mode « éliminée » d'abord, garde « cibles atteintes » par cible ; note saisie ancrée sur la suggestion holistique). 6 lots (DEN-0 modèle/`jugementsDenotation` namespacée → DEN-1 moteur `_calculerPerformanceDenotation` + helper suggestion partagé → DEN-2 UI saisie profil → DEN-3 parcours création assistant → DEN-4 diagnostic non-simulable + doc → DEN-5 release `minor`). Modèle conceptuel : `NOTE-COWORK-modele-DEN.md`.
  - Mécanisme : garde « cibles atteintes » (réutilise les objectifs STD) → débloque une note finale saisie + suggestion holistique optionnelle (mode/médiane/moyenne IDME, ancrage anti-biais Dyer). DEN abandonne le **tri**, garde la **certification** (RREC 60/59) — jamais « pas de chiffre ». **Non simulable** (jugement saisi) → hors Comparateur phase 1, créable dans l'assistant.
  - **Taxonomie** : badge « PAN » gardé pour l'UI mais DEN = PRÉN académiquement. **Garde-fou** : ne pas vendre DEN comme un bien universel (Girouard-Gagné). **Préalable au code de l'axe D (#326)** ; indépendant de #320.

- [x] 🟢 **#305** A11y : la modale d'aide contextuelle annonce un dialogue sans nom — ✅ LIVRÉ (commit `677af656`, intégré 1.2.0)
  - `afficherAideContextuelle()` (`js/accompagnement.js:846`) posait `aria-labelledby="aide-ctx-titre"` mais ce `<span>` ne recevait jamais le `titre` de l'entrée → lecteurs d'écran annonçaient un dialogue sans nom (~40 entrées popup).
  - Correctif d'une ligne (injecter `aide.titre` dans `#aide-ctx-titre` au rendu). Découvert 29 mai 2026 en livrant le mini-guide « balises du cours ».

### Session du 4 juin 2026 — refonte des textes de l'assistant de pratique + sécurité (version 1.0.0, build 0604-0652)

- [x] 🔒 **#312** `innerHTML` non échappé dans le récapitulatif de l'assistant de pratique ✅ LIVRÉ (build 0604-0652, non poussé)
  - **Fix** : `r.auteur`, `r.etablissement`, `r.discipline` du récap (`wizard-pratique-v2.js`) passent désormais par `echapperHtml()` — règle de sécurité non négociable respectée. Le champ `nom` était déjà échappé.
  - **Sentinelle** : `tests/unit/sentinelle-recap-echappement-2026-06-04.test.js` (4 tests) verrouille les 3 échappements et interdit la réintroduction d'une injection brute (protection contre la perte du fix au refactoring).
  - Livré dans la même passe que la refonte des textes de l'assistant (brief `refonte-textes-assistant-pratique.md`) : renvois périmés → Conception, vouvoiement → tutoiement, écriture inclusive, « Maîtrise » → « Maîtrisé », notification « créée. », `aria-label`/desc du modal « wizard » → « assistant ». 175 tests verts.

### Session du 26 mai 2026 — bugs des testeurs + petits items backlog (Beta 99.66, builds 0526-0345 → 0526-0503)

- [x] **Bug 25 mai 07:19 — modale migration legacy au démarrage** ✅ LIVRÉ (commit `aabc0d3`, build 0526-0345)
  - Modale « Mise à jour de tes données » apparaissait sur iPad alors qu'elle avait été conditionnée pour ne plus apparaître. Retrait complet zéro-dette : 6 fonctions (`detecterDonneesLegacy`, `afficherModalMigrationLegacy`, `fermerModalMigrationLegacy`, `reporterMigrationLegacy`, `executerMigrationLegacy`, `verifierEtProposerMigrationLegacy`) + 6 exports + 1 appel dans main.js. −380 LOC net.

- [x] **Bug 21 mai (3 rapports) — doublons original/reprise dans Travaux soumis + clic confus** ✅ LIVRÉ (commit `7574c75`, build 0526-0441)
  - Audit 17 paires (DA, productionId) : 16 saines + 1 orpheline (Élève-029/Artefact 5, fichier reprise orphelin supprimé séparément côté données). Fix code : `genererSectionTravaux` (profil-etudiant-sections-affichage.js:4595) filtre désormais les fichiers dont l'éval est `remplaceeParId`. Ne reste affichée que la reprise active.

- [x] **Bug console 26 mai — ReferenceError `verifierEtChargerEvaluationExistante`** ✅ LIVRÉ (commit `71286d5`, build 0526-0455)
  - Découvert pendant vérification du déploiement précédent. Audit complet d'evaluation.js : 10 fonctions définies localement appelées depuis sous-modules sans avoir été exportées sur window — séquelles de l'extraction des sous-modules `evaluation-*.js` (18-21 mai 2026). 6 ReferenceErrors potentiels + 4 échecs silencieux (guard typeof). 10 exports ajoutés en bas d'evaluation.js (purement additif).
  - Cause directe du bug du 21 mai « rien ne s'affiche au clic » : `verifierEtChargerEvaluationExistante` crashait à chaque changement d'étudiant ou de production → l'éval existante n'était jamais pré-chargée. [[feedback-fix-perdu-refactoring-extraction]] confirmé.

- [x] **#281** Migrer les notifications HTML custom résiduelles vers `window.notifications.{succes, erreur, info}` ✅ LIVRÉ (commit `c1c8abd`, build 0526-0503)
  - Audit complémentaire (pattern strict createElement + position:fixed + setTimeout remove) : 3 sites trouvés. 1 vrai toast custom migré (`saisie-presences.js:1357`, 18 lignes → 1 ligne). 1 faux positif (overlay PDF preview). 1 banner d'avertissement (`travaux-ui.js:793`, 8s + cliquable) hors scope — pattern différent non couvert par l'API toast standard, à traiter dans un chantier d'élargissement d'API banner si nécessaire.

- [x] **#278** Bilan réflexif — scroll reset au top en passant à l'onglet « Importer les résultats » ✅ LIVRÉ (commit `c1c8abd`, build 0526-0503)
  - Fix option (a) recommandée : `scrollIntoView({block:'start'})` explicite sur le conteneur en début d'`afficherVue` (bilan-reflexif.js:124). Stable pour toutes les transitions vue-haute → vue-courte, pas seulement Questionnaire → Importer.

- [x] **#280** Fusionner « Capturer maintenant » et « Reconstruire l'historique » en une seule action ✅ LIVRÉ (commit `c1c8abd`, build 0526-0503)
  - Vérification amont : `reconstruireSnapshotsHistoriques` régénère le calendrier avec l'union de tous les horaires (genererCalendrierComplet), gère donc le multi-groupes-cours. Pas de bloqueur.
  - Retraits : bouton « Capturer maintenant » (index.html), `capturerSnapshotManuel` (snapshots.js, -20 LOC) + son export window + `obtenirNumeroSemaineActuelle` (-27 LOC, code mort après). Conservé : `capturerSnapshotHebdomadaire` (utilisée par `verifierEtCapturerSnapshotHebdomadaire` flux auto).
  - Renommages UX : « Reconstruire l'historique » → « Recalculer les captures », « Captures hebdomadaires » → « Captures de séances », grid 3 colonnes → 2 colonnes.
  - Effet collatéral : résout les 4 facettes du bug #116 puisque le chemin `capturerSnapshotManuel` est éliminé.

---

## Contenu archive (à partir d'ici, contenu identique au BACKLOG.md d'origine du 24 mai 2026)

> **Derniere mise a jour avant bascule** : 24 mai 2026 (Beta 99.64, Build 0524-0548) — chantier chrome unifié LIVRÉ : refonte entête (Codex / Titre+Meta / Utilitaires en grid 3 colonnes), bande contexte ligne 2, nav primaire sticky avec gradient maritime continu, sous-nav vide masquée carré, breakpoint unique 1024px avec bouton ⋯ mobile + selects natifs nav/sous-nav, module `js/chrome-unifie.js`. +2 items #283 (harmonisation responsive pages à sidebar en mobile) + #284 (harmonisation structure titres+sous-titres) hors-scope chantier chrome.

---

## A faire

### Post-chantier chrome unifié (24 mai 2026) — observations hors-scope

> Observations relevées pendant les tests manuels du chrome unifié (Beta 99.64,
> b0524-0548). Bugs et incohérences identifiés mais non traités dans le chantier
> chrome (qui ne touche que entête + nav + sous-nav).

- [ ] **#283** Harmonisation responsive des pages à sidebar en mobile (<1024 px)
  - Pages concernées : Conception → Productions étudiantes / Grilles de critères / Échelles de performance / Pratiques de notation / Cartouches de rétroaction ; Évaluation → Liste des évaluations ; possiblement Calendrier → Trimestre.
  - Symptôme actuel : sidebar gauche (cartes) + détails à droite. En mobile <1024 px, la zone détails apparaît en dessous de la sidebar mais le contenu est tronqué horizontalement (overflow), formulaires inutilisables au pouce.
  - Bug pré-existant (reproductible en prod main et worktree), pas introduit par le chrome unifié.
  - Options de fix : (a) basculer en sidebar empilée verticalement par-dessus les détails ; (b) push/slide-in modal pour les détails ; (c) cacher la sidebar derrière un bouton de retour.
  - Lié au chantier d'harmonisation des pages (cf. #284).

- [ ] **#284** Harmonisation de la structure des pages (titres + sous-titres descriptifs manquants)
  - Pages avec titre + sous-titre descriptif : Aperçu, Suivi (Liste des élèves), Calendrier (Trimestre), Évaluation (Préparer et importer).
  - Pages **sans** titre : Conception → Alignement pédagogique (carte mentale plein écran sans h1) ; Labo → Tirage au sort (2 cartes côte-à-côte directement, sans titre de page).
  - Décision : ajouter un h1 + sous-titre 1-ligne descriptif sur toutes les sous-sections pour cohérence (pattern type « Préparer et importer ») OU décider que certaines pages sont délibérément plein écran.
  - À traiter dans un chantier d'harmonisation UX post-AQPC.

### Cache Safari — Étendre la sentinelle BUILD_ID aux scripts critiques (25 mai 2026)

> Bug rencontré en session le 25 mai 2026 (beta 99.65 b0525-0840) : tous les boutons à `data-action` de l'en-tête (btn-codex, X bandeau mise à jour, utilitaires Aide/Réglages/bug/thème/anonymisation) sont devenus insensibles. Diagnostic : Safari file:// avait gardé en cache une version périmée de `js/main.js` dans laquelle l'attachement du dispatcher `data-action` (ligne 780, dans le handler `DOMContentLoaded`) ne se faisait pas. `init-inline.js` et `version.json` étaient pourtant synchros (BUILD_ID identique partout). Le mécanisme de détection « Scripts périmés » introduit par le commit `1ef2800` (28 mars 2026) ne surveille **que** `init-inline.js` via son snapshot `_SCRIPT_BUILD` ligne 106 — d'où le trou noir : aucun bandeau rouge, aucune erreur console, comportement étrange. Résolution ad hoc : modifier `main.js` (ajouter un commentaire ou un log) force Safari à recharger la version fraîche du disque.

- [x] **#285** Étendre la sentinelle `_SCRIPT_BUILD` à `main.js` pour détecter les versions périmées en cache Safari file:// (livré 25 mai 2026, build 0525-0840, alternative légère retenue : couverture limitée à `main.js` pour l'instant)
  - **Implémentation livrée** : `js/main.js` embarque désormais `window._SCRIPT_BUILD_main = '0525-0840'` en haut de l'IIFE (ligne 19). `js/init-inline.js` `chargerVersionJSON()` itère sur `snapshotsAVerifier` = `{ 'init-inline.js': _SCRIPT_BUILD, 'main.js': window._SCRIPT_BUILD_main }` et collecte les périmés. Si la liste n'est pas vide → flux reload+bandeau identique à avant (1 tentative auto, puis bandeau rouge nommant les scripts en cause).
  - **Coût opérationnel acté** : à chaque bump de build, mettre à jour AUSSI le snapshot dans `js/main.js:19` (en plus de `version.json` + `js/init-inline.js:104`). Documenté dans CLAUDE.md « Avant chaque commit ».
  - **Reste possible** : étendre à `codex.js`, `evaluation-chargement.js`, etc. si le bug se reproduit sur ces fichiers. Pas urgent — `main.js` couvre le cas du dispatcher `data-action` global qui était le symptôme principal du 25 mai.
  - **Origine** : bug 25 mai 2026 (tous les boutons à `data-action` morts sous Safari, aucune erreur console — cf. §1nonies de SESSION.md). Le mécanisme historique du commit `1ef2800` (28 mars 2026) ne couvrait que `init-inline.js` lui-même.

### Reserve — Suite du chantier ecosysteme de donnees (26 avril 2026)

> **Contexte** : Le 26 avril 2026, l'architecture de l'ecosysteme de donnees a ete
> definie en session Cowork (`docs/architecture/ECOSYSTEME-DONNEES.md`). Quatre
> concepts separes : **Codex** (espace de travail actif), **Reserve** (archive
> personnelle locale), **Codex data** (extrait pour la recherche), **Voute**
> (bibliotheque partagee entre enseignants).
>
> Le module `js/reserve.js` v1 a ete livre le meme jour
> (`docs/architecture/SPEC-RESERVE-V1.md`). API : `Reserve.verserGroupeCours()`,
> `estimerVersement()`, `listerGroupesVersables()`. L’archive est un ZIP
> structure telechargeable, decompresse manuellement dans `~/Documents/Archives_LaboCodex/`.
> Granularite par groupe-cours (pas par trimestre), UUID v4 par versement.
> Acces via le menu Codex de l'en-tete uniquement (decision spec §6.3).

- [x] **#247** Refonte de Reglages > Donnees alignée sur l'architecture des 4 concepts (livré 5 mai 2026, commit fa6a238, PR #11)
  - **Livré** : structure 6 cartes en place dans Réglages > Données.
    - Carte 1 « Codex » (ex « Sauvegarde et restauration ») — 3 sous-cartes : Exporter le Codex / Exporter ma config / Ouvrir un Codex.
    - Carte 2 « Archives » — note diagnostic-only (« Pour archiver un groupe-cours, utilise le menu Codex en haut »). Les actions (Archiver / Ouvrir une archive) restent au menu Codex pour éviter le doublage.
    - Carte 3 « Codex data » — placeholder désaturé, badge « À venir ».
    - Carte 4 « Voûte » — placeholder désaturé, badge « À venir ».
    - Carte 5 « Captures et recherche » — inchangé (accordéon).
    - Carte 6 « Maintenance » — inchangé (accordéon, zone danger).
  - **Décisions actées** : refonte partielle (vocabulaire + réorganisation, actions JS existantes préservées) ; structure par concept (4 concepts + 2 cartes métier) ; Archives en diagnostic-only pour éviter doublage menu Codex ↔ Réglages.
  - **Hors scope (futurs cycles)** : implémentation effective des concepts Codex data et Voûte (priorités 4-7 de `ECOSYSTEME-DONNEES.md`) — les placeholders attendent.

- [x] **#248** Reserve v1.1 — mise a jour automatique du `manifeste-archives.json` global (livre 2 mai 2026, b0502-1335, commit 5ceee80)
  - Manifeste local cross-mode (FSAPI + ZIP Safari) avec auto-hydration au boot
    et a chaque ouverture d'un ZIP. Le ZIP Safari inclut a la racine le
    manifeste local cumulatif, donc l'extraction met a jour automatiquement le
    `manifeste-archives.json` du dossier sur disque. Cross-appareils par fusion
    successive : ouvrir un ZIP iPad sur Mac fusionne les manifestes locaux,
    le prochain archivage Mac integre l'historique consolide.
  - Helpers : `_lireManifesteLocal`, `_upsertEntreeManifesteLocal`,
    `_fusionnerManifesteRecu`, `_hydrateManifesteDepuisFSAPI`,
    `_hydrateManifesteDepuisZip` (reserve-ouvrir.js).
  - Cle db `_manifesteReserve` (prefixe `_` exclu des versements).

- [x] **#249** Reserve v1.1 — section dediee dans Reglages (livré 2 mai 2026, b0502-1335, commit fda662d)
  - Module `js/reserve-reglages.js` (~290 l.) : carte « Réserve » dans Réglages > Données.
    Bandeau dossier FSAPI + tableau des versements (trimestre, cours, groupe, date, étud.,
    fich., taille, badge mode FSAPI/ZIP). Bouton ✴️ aide + popup `reglages-reserve`.
  - Classes CSS `.badge-mode-fsapi` (vert), `.badge-mode-zip` (orange) ajoutées à styles.css.
  - Spec v1 §6.3 fermée.

- [x] **#250** Codex allege — retirer le TimeMachine du codex (livre 28 avril 2026, b0428-1000)
  - Priorite 1 de `ECOSYSTEME-DONNEES.md` §Priorites d'implementation. Gain
    immediat estime : 400-800 Mo par codex. L'historique vit dans la reserve
    (instantanes), plus dans le codex de travail.

- [x] **#251** Codex data — extraction depuis les Archives (livre 6 mai 2026, b0506-0650, PR #13)
  - Module `js/codex-data.js` : format auto-descriptif (.codex-data.json),
    versionne, hash SHA-256 verifiable, conforme SKILL_Securite_donnees §4.
  - 3 sources d'extraction : FSAPI, selection dossier (webkitdirectory),
    fichiers ZIP individuels. Limite 100 Mo, validation stricte.
  - Module `js/codex-data-ui.js` : modale dans Reglages > Donnees carte 3
    (placeholder remplace), body scrollable + footer fixe, detection auto.
  - Reserve dispatche desormais l'evenement `codex-data-manifeste-change`
    a chaque archivage → carte 3 reactive.

- [x] **#252** Labo autonome — sortir le Labo de la section Suivi (livre 5+6 mai 2026)
  - Partie A (section Labo autonome) : livree le 5 mai dans la refonte nav
    (5 sous-sections : tirage, modelisation, rythme, etudes, bilan).
  - Partie B (chargement codex data) : livree le 6 mai 2026 (PR #13).
    Module `js/labo-codex-data.js` : loader volatile (memoire seulement,
    jamais d'ecrit IDB ni localStorage), bandeau contextuel indigo,
    selecteur multi-archives, helpers source unifiee (lireSnapshots,
    lireInterventions, lireDonneesNamespacees, etc.). Guard `_estDansLabo`
    : zero pollution Apercu/Suivi/Evaluation.
  - 3 fonctions du Labo adaptees : correlations-longitudinales, impact-jetons,
    consolidation. En mode « tous fusionnes » : message « Selectionne un
    groupe-cours » (calendriers et cohortes differents).
  - 6 bugs trouves par /ultrareview corriges avant merge (pratiquesConfigurables
    perdu, Object.assign clobber, var db shadowing, etc.).

- [x] **#253** Reserve v1.5 — automatisation de l’archive (FSAPI Chrome/Edge) (livre 28 avril 2026, b0428-0810)
  - **Probleme** : l’archive v1 exige 5 manipulations Finder
    (deplacer le ZIP depuis Telechargements, le decompresser, supprimer
    le ZIP source, fusionner manuellement le manifeste-patch). Friction
    bloquante pour les utilisateurs non techniques.
  - **Solution** : File System Access API (Chrome/Edge sur Mac).
    L'utilisateur choisit son dossier `Archives_LaboCodex/` une seule fois
    via `showDirectoryPicker()`, le handle est persiste en IndexedDB.
    Versements suivants : ecriture directe + decompression in-place +
    mise a jour du `manifeste-archives.json` global, sans intervention
    manuelle. Pattern reutilisable depuis `_fileHandle` dans codex.js.
  - **Limite assumee** : Safari ne supporte pas FSAPI. Le flux manuel
    reste pour les utilisateurs Safari. Documenter clairement « pour un
    versement automatique, utilise Chrome ou Edge ».
  - **Effort** : 1-2 jours. Gain UX enorme pour les Mac+desktop users.
  - **Priorite** : Haute, conditionnee aux retours testeurs sur le flux v1.

- [x] **#254 v1** Ouvrir la reserve — reimport selectif (livre 28 avril 2026, b0428-0905)
      - v1 : grilles + echelles + tampons personnalises ; toggle global « copie en double »
      - v1.1 : detection navigateur (Chrome/Edge mode navigation FSAPI via manifeste, Safari file picker avec aide Telechargements)
      - Hors scope v1 (a faire plus tard) : productions, cartouches, pratiques (references croisees a remapper) ; donnees pedagogiques ; mode consultation namespace temporaire

- [x] **#257 v1** Ouvrir la reserve — productions, cartouches, pratiques + auto-cochage references (livre 28 avril 2026, b0428-1115)
      - Reimport selectif : 6 types (grilles, echelles, productions, cartouches, pratiques, tampons)
      - Auto-cochage : production -> grille+echelle, cartouche -> grille, pratique -> echelle
      - Annotations « ref manquante » (orange) si grille/echelle absente du payload ET des bibliotheques actives
      - Facades nouvelles : importerProductionsExternes, importerCartouchesExternes, importerPratiquesExternes

- [x] **#257 v2.A** Ouvrir la reserve v2.A — remapping d'IDs en mode « copie en double » (livre 28 avril 2026, b0428-1245)
      - Tables `remapGrilles` / `remapEchelles` (oldId -> newId) peuplees au moment de la copie en double.
      - `_patcherReferences` patche `production.grilleId/echelleId`, `cartouche.grilleId`, `pratique.config.echelleId`.
      - Compteur `refsRemappees` dans le rapport et la notification finale.
      - Aide popup `reserve-copie-double` enrichie : section « Et les references entre items ? ».

- [ ] **#257 v2.B** Ouvrir la reserve v2.B — mode consultation namespace temporaire
  - **Suite de #257 v2.A**. Decouple en sous-chantier dedie (5-6 h) car
    impact architectural sur le namespacing (`__archive_*`).
  - **Use case** : au fil des trimestres, les bibliotheques actives
    (`grillesTemplates`, `echellesTemplates`, `productionsTemplates`,
    `cartouches_*`, tampons) sont purgees. La reserve devient le seul
    endroit ou vivent les ressources retirees. Quand l'utilisateur veut :
    - Reprendre une grille A2024 pour l'adapter a H2026
    - Faire une demo d'un trimestre passe (formation collegue, AQPC,
      seance de labo)
    - Recuperer un cartouche de commentaires bien redige qui n'est plus
      dans la bibliotheque active
    il doit pouvoir **lire la reserve depuis l'application**.
  - **Mecanisme** :
    - Selection d'un fichier `.reserve.zip` (ou navigation FSAPI dans
      `Archives_LaboCodex/` si #253 livre)
    - Chargement en namespace temporaire (ex. `__archive_a2025_*`),
      separe du trimestre actif, lecture seule
    - Affichage d'un panneau « Contenu de l’archive » : etudiants
      (anonymisable pour demo), productions, grilles, echelles,
      cartouches, evaluations
    - **Pour les ressources de bibliotheques** : selection multiple +
      bouton « Reimporter dans mes bibliotheques actives »
    - **Pour les donnees pedagogiques** : consultation seule, optionnel
      mode « simuler ce trimestre » qui bascule l'app en lecture seule
      sur ces donnees (utile demo)
  - **Ne fait PAS** : modifier l’archive original. L'archive reste
    figee. Pour corriger des donnees historiques, c'est un autre flux
    (eventuellement : creer un nouvelle archive-correctif avec UUID
    distinct, hors scope v1).
  - **Distinction avec #251 (Codex data)** : codex data extrait des
    donnees analytiques (indices, snapshots, longitudinal) pour le Labo.
    #254 extrait du materiel pedagogique reutilisable pour les
    bibliotheques. Complementaire, pas redondant.
  - **Priorite** : Haute des que la base d'utilisateurs purge ses
    bibliotheques. Pour Gregoire : pertinent des que la migration vers
    « tout-numerique » est complete.

- [x] **#255** Clarifier le role de la reserve dans `ECOSYSTEME-DONNEES.md` (livre 26 avril 2026, b0426-1512)
  - **Probleme** : le document fondateur presente la reserve comme
    « archive personnelle locale » avec verbes « verser, consulter,
    extraire ». La voie de retour reserve → app n'est pas detaillee, et
    « consulter » ne distingue pas l'analyse longitudinale (codex data)
    du reimport selectif de ressources (#254).
  - **Cible** : reformuler la reserve comme **double fonction** dans le
    vocabulaire bibliothecaire deja en place (codex, bibliotheque,
    reserve, voute) :
    - **Depot** : versement d'un groupe-cours en fin de trimestre
    - **Fonds consultable** : extraction de ressources reutilisables et
      consultation de trimestres passes pour demo / formation /
      reflexion professionnelle
  - Ajouter au tableau des verbes : « reimporter » (reserve → app
    bibliotheques) et « ouvrir une archive » (reserve → consultation
    temporaire en namespace isole).
  - Lier #254 (mecanisme) a cette clarification (vocabulaire).
  - **Effort** : 1-2 heures de redaction.

- [x] **#256** Aide aux modales Reserve (livre 28 avril 2026, b0428-1155)
      - 7 popups d'aide riches : `reserve-versement`, `reserve-fsapi`, `reserve-ouvrir-versement`, `reserve-types-ressources`, `reserve-deja-present`, `reserve-copie-double`, `reserve-ref-manquante`.
      - 6 infobulles courtes sur les controles (selects, boutons, label).
      - 5 boutons aide ✴️ + 5 `data-tooltip` injectes dans #modalReserve et #modalOuvrirVersement.
      - Correction `entete-codex` : retrait de la metaphore « cloud personnel » (contredit l'architecture manuelle/locale).
      - Hors scope (a venir si validation terrain le demande) : aide dynamique par section/item dans `reserve-ouvrir-sections`, et 8 autres modales.

- [x] **#256-bis** Aide aux 10 modales système (livré 11 mai 2026, b0511-0931, commits 853c1a0 + b101b56 — validation Safari à faire)
  - 10 entrées popup ajoutées dans `accompagnement-contenu-popup.js` : `modal-nouveautes`,
    `modal-reparation`, `modal-wizard-pratique`, `modal-apercu-pdf`, `modal-confidentiel`,
    `modal-export`, `modal-import`, `modal-suppression-ressource`, `modal-codex-data`,
    `modal-export-preview` (générique K-β preview partagé par tous les exports).
  - Boutons ✴️ `data-aide` injectés dans chaque header. Wizard : bouton sibling (titre
    réécrit dynamiquement par textContent) avec classe CSS `.wizard-v2-header-texte
    .btn-aide-contextuelle`. K-β preview : injection dynamique via DOM dans
    `securite-export-preview.js`.
  - **Validation terrain Safari** à effectuer (popups, z-index, contenu) avant de retirer
    cette mention.

### Vocabulaire — Simplification ecosysteme de donnees (2 mai 2026)

- [x] **#259** Renommer « Reserve / verser / versement » → « Archives / archiver / archive »
  - **Statut** : RESOLU le 5 mai 2026 (Beta XX.XX, decision « zero dette technique »).
  - **Périmetre couvert** :
    - Strings UI dans 3 modules JS (`reserve.js`, `reserve-ouvrir.js`,
      `reserve-reglages.js`) : titres, labels, console.warn `[Archives]`,
      commentaires JSDoc/headers. ~178 remplacements.
    - `index.html` : modales, menu Codex, carte Reglages > Donnees,
      textes UI explicatifs. ~30 remplacements.
    - `accompagnement-contenu-popup.js` + `accompagnement-contenu-hover.js` :
      ~50 remplacements dans les textes des popups et tooltips.
    - 2 commentaires JSDoc dans `cartouches.js` et `productions.js`.
    - `docs/architecture/ECOSYSTEME-DONNEES.md` : ~80 remplacements
      (titres de section, accords, verbes pédagogiques).
    - `BACKLOG.md` : ~16 remplacements dans les anciennes notes.
  - **Préservés (volontaire)** :
    - Noms de fichiers `js/reserve*.js`, classe `window.Reserve`,
      methodes (`verserGroupeCours`, `actionVerser`, `estimerVersement`,
      etc.) — APIs internes stables.
    - IDs DOM (`#modalReserve`, `#modalOuvrirVersement`,
      `id="codex-menu-verser-reserve"`).
    - Cles d'aide popup (`'reserve-versement'`, `'reserve-ouvrir-versement'`,
      `'reglages-reserve'`, etc.) et leur cross-refs `voirAussi`.
    - Variables locales (`dossierVersement`, `_versementsListes`,
      `versements`, `_contenuVersement`).
    - Constantes (`EXTENSION_RESERVE`, `_payloadCourant`).
    - Le mot « versement » dans le BACKLOG quand il fait reference a
      l'historique du chantier, pas a une UI courante.
  - **Migration data** : script bash `migrer-reserve-vers-archives.sh`
    fourni à la racine. Renomme :
    - `~/Documents/Reserve_LaboCodex/` → `~/Documents/Archives_LaboCodex/`
    - `manifeste-reserve.json` → `manifeste-archives.json`
    - `manifeste-reserve-patch.json` → `manifeste-archives-patch.json`
    - JSON keys : `"versements"` → `"archives"`, `"date_versement"` →
      `"date_archive"`, `"mode_versement"` → `"mode_archive"`.
    A executer une fois après upgrade. Idempotent.
  - **Approche** : script Python ciblé (`/tmp/sp259_rename.py`) avec
    patterns littéraux (jamais de regex `\b...\b` qui aurait touché
    les identifiants JS et les cles DOM). Patterns triés par longueur
    décroissante pour gérer correctement les accords français
    (« versements existants » → « archives existantes » avant
    « versements » → « archives » seul).

### Donnees — Cartes mentales perdues localement (5 mai 2026)

- [x] **#261** Cartes mentales : index pointe sur une carte inexistante + 4 cartes perdues
  - **Statut** : RESOLU le 5 mai 2026.
  - **Action 1 (restauration)** : 5 cartes restaurees depuis `backup 18 avril/donnees.json`
    via un script `restaurer-cartes-261.js` colle en console Safari.
    Cartes : carte_2 (Ecriture et litterature demo), carte_3 (H26),
    carte_4 (Test import), carte_5 (Alignement-101-H26), carte_6 (Test2).
  - **Action 2 (preventif)** : `js/planification-donnees.js`
    `initialiserSiNecessaire()` verifie maintenant que `index.active`
    pointe vers une carte qui existe dans `index.cartes`, fallback silencieux
    sur la premiere carte disponible si non. Evite que ce bug se reproduise.
  - **Note Action 3** : la divergence apparente entre
    `db.getSync('planification_mindmap')` (null) et
    `localStorage.getItem('h2026_planification_mindmap')` (donnees) etait
    une mauvaise lecture de ma part — la premiere forme manquait le namespace
    `h2026_`, donc db.getSync retournait null. Pas un bug. Le module utilise
    `db.getSync(cle('planification_mindmap'))` correctement.
  - **Cause racine non determinee** : 4 cartes perdues entre 19 avril et 5 mai.
    Probable corruption au moment d'un dépassement de quota localStorage —
    le quota a ete saturé pendant la tentative de restauration du 5 mai
    (`QuotaExceededError` lors d'un `localStorage.setItem` direct), confirmant
    l'hypothese. La session du 19 avril ecrivait peut-etre directement en
    localStorage au lieu de passer par db.setSync.

### Exports — Clarifier le nommage et le périmètre (6 mai 2026)

- [x] **#262** Clarifier la convention de nommage et le périmètre des fichiers exportés (Phase 1 livrée 8 mai · Phase 2 livrée 9 mai 2026, b0509-0739)
  - **Contexte** : un même dossier de téléchargement peut contenir des sorties
    Labo Codex aux noms et préfixes hétérogènes — pour un novice, la distinction
    entre les types d'export n'est pas évidente, et certains préfixes semblent
    appartenir à un schéma obsolète.
  - **Échantillon observé (6 mai 2026)** :
    - `codex-data-3gc-2026-05-06.codex-data.json`
    - `LISEZMOI-Gr-goire-2026-05-06.txt`
    - `PRATIQUE-COMPLETE-Gr-goire-2026-05-06.json`
    - `sauvegarde-CONFIDENTIEL-monitorage-2026-05-06-12-56-07.zip`
    - `codex-Codex-Écriture-et-littérature-H26-avril-2026-05-05-06h03.codex.zip`
    - `CONFIDENTIEL-archive-h2026-601-101-gr00002-2026-05-05.reserve.zip`
    - `CONFIDENTIEL-archive-h2026-601-101-gr00008-2026-05-05.reserve.zip`
  - **Problèmes identifiés** :
    - Préfixes inégaux (`codex-data`, `LISEZMOI`, `PRATIQUE-COMPLETE`,
      `sauvegarde-CONFIDENTIEL-monitorage`, `codex`, `CONFIDENTIEL-archive`).
    - Casse incohérente — certains tout en majuscules (`LISEZMOI`,
      `PRATIQUE-COMPLETE`, `CONFIDENTIEL`), d'autres en minuscules.
    - Encodage cassé sur certains noms (`Gr-goire` au lieu de `Grégoire`).
    - Vocabulaire mixte « reserve » (suffixe `.reserve.zip`) et « archive »
      (préfixe `archive`) qui résiste au renommage #259.
    - Extensions composées (`.codex-data.json`, `.codex.zip`, `.reserve.zip`)
      dont la signification n'est pas explicitée pour le novice.
    - Noms qui semblent appartenir à des schémas obsolètes
      (`sauvegarde-CONFIDENTIEL-monitorage-…`) coexistant avec les schémas
      actuels.
  - **Cible** : une convention unifiée et lisible par un novice. Au minimum,
    pour chaque type d'export : préfixe stable lié au concept de
    `ECOSYSTEME-DONNEES.md` (codex / archive / codex data / configuration),
    casse cohérente, accents préservés (ou translittérés proprement, pas
    troncqués), extension unique compréhensible.
  - **À cartographier** : recenser tous les `download` / `saveAs` / `genererZip`
    de l'app pour avoir l'inventaire exhaustif des conventions actuelles avant
    de proposer la nouvelle.
  - **Lien** : suite du chantier #259 (vocabulaire Réserve → Archives) — celui-ci
    s'est arrêté à l'UI/code interne, le nommage des fichiers téléchargés n'a
    pas suivi.

- [x] **#267** Apparence du matériel dans les bibliothèques (9 mai 2026) — livré 10 mai 2026 (Phases A+B+C+D, beta 99.40 b0510-1500)
  - **Contexte** : après le ménage des boutons "Exporter" doublons (livré dans #262 Phase 2), les modales bibliothèques (grilles, échelles, cartouches, productions, pratiques) sont fonctionnellement cohérentes mais leur apparence reste à revoir : densité, hiérarchie visuelle, alignement, espacement entre les boutons d'action, traitement des badges (Locale, STD, #identifiant), uniformisation des tailles.
  - **À cartographier** : capturer l'état actuel des 5 modales bibliothèques + comparer avec `design-system.html`.
  - **Lien** : suite logique de #262 Phase 2 (qui s'est arrêté au comportement, pas à l'esthétique).

- [x] **#266** Renommer `js/pratiques-materiel.js` → `js/pratiques-gestion.js` (livré 11 mai 2026, Beta 99.41 b0511-1145)
  - `git mv js/pratiques-materiel.js js/pratiques-gestion.js`. En-tête du fichier mis à jour
    (mention « Renommé pratiques-materiel.js → pratiques-gestion.js le 11 mai 2026 (#266) »).
  - Tag `<script src>` mis à jour dans index.html avec nouveau cache buster `?v=2026051121`.
  - 11 console.log/warn/error : `[pratiques-materiel]` → `[pratiques-gestion]`.
  - 2 commentaires JS mis à jour : `wizard-pratique-v2.js`, `trimestre-v2.js`.
  - 5 références docs mises à jour : `MODELE-MENACES.md`, `AUDIT-ETAT-REFLEXION-2026-05-11.md`,
    `pattern-bibliotheque-assemblage.md`, `HOOKS-PLAN2.md`, `CALENDRIER.md`.
  - **Fonctions exportées avec suffixe `Materiel` conservées** (8 fonctions) — collision
    confirmée avec `pratiques.js` (déjà `dupliquerPratique`, `supprimerPratique`,
    `partagerPratique`). Suffixe garde la distinction logique entre les 2 modules.
  - **Audits historiques laissés intacts** : `TESTS-DEFENSE-A-2026-05-08.md`,
    `AUDIT-INNERHTML-FINDINGS-2026-05-06.md`, `PLAN-AUTONOMISATION-UTILISATEUR.md`
    (traces datées de l'état au moment de l'audit).

- [x] **#264** Barre de progression sur tous les exports (livré 11 mai 2026, b0511-0901 + b0511-0909, commits 72d4533 + 0e70935)
  - **Livré** : tous les exports longs branchés sur `window.afficherProgression/majProgression/masquerProgression` (module `progression.js` issue #229, qui n'était utilisé que par codex/reserve).
    - `import-export.js` : `exporterConfigurationComplete` (scellement SHA-256) + `executerExport` (lecture clés + ZIP/JSON).
    - `codex-data.js` : 3 entrées (FSAPI/ZIP/Dossier) + `_construireCodexData` partagé.
    - `travaux-archivage.js` : `lancerExportEtudiant/Production/lancerExport`. Les 2 autres lanceurs (Semestre, Lea) ont déjà des barres inline dans le panneau Travaux et restent inchangés.
    - `travaux-export-pdf.js` : `exporterPDF` + `exporterDossierComplet`.
    - `tampons-bibliotheque.js` : `exporterBibliotheque` (scellement).
  - **Pattern** : try/finally avec `masquerProgression` garanti même sur erreur. Garde-fou `_hasProg = typeof window.afficherProgression === 'function'` pour rester silencieux si progression.js n'est pas chargé.
  - **Hors scope (décision)** : bibliothèques sans scellement (grilles, échelles, cartouches, productions, pratiques, pratiques-materiel, planification, cours, objectifs, journal). Exports sub-seconde — l'overlay flasherait sans valeur UX. Notification de succès suffit.
  - **Hors scope** : `synthese-retroaction-rendu.js` est un helper interne sans entrée d'export propre, couvert via `travaux-export-pdf.js`.

### Sécurité — UI à aligner sur le design system (8 mai 2026)

- [x] **#263** Aligner les modales et carte sécurité sur `design-system.html` (livré 8 mai 2026, b0508-1255, commits 4576735 + c51966d)
  - **Livré** : 4 modales construites par script alignées DS, ~22 références mortes `.cc-modal-*` nettoyées, 2 bugs latents corrigés (option `Collegial` sans accent ne matchait pas la valeur posée par le JS · inputs `email`/`url` sombres en mode clair dans `modal-js-contenu`), ~20 typos sans accents corrigées.
  - **Modales touchées** : `creerModalMetadonneesEnrichies`, `creerModalConfigComplete`, `creerModalEditionMetadonnees` (cc-license.js, partagées par grilles/échelles/cartouches/productions/pratiques/tampons + cours/objectifs/planification/pratiques-materiel) · `_afficherModale` (securite-export-preview.js, K-β preview ZIP/JSON).
  - **Carte « Sécurité »** : déjà cohérente avec ses sœurs SOLO/Actions RLO/ACP/Graphiques sur la page Réglages > Préférences — vérification, aucun changement requis.
  - **Hors scope (à reprendre dans une suite)** : notification de succès enrichie de Défense H (sceau SHA-256) — rendu de `afficherNotificationSucces` à vérifier séparément.
  - **Effort réel** : ~2 h (vs estimation 2-3 h).

### Credits — A propos (3 mai 2026)

- [x] **#260** Ajouter le credit Icons8 dans Reglages > A propos > Technologies (livre 6 mai 2026, b0506-0515)
  - Ligne `<tr>` ajoutee dans la carte Technologies, entre Stockage et Developpement.
  - Libelle « Icones », valeur « Icons8 — icons8.com » avec lien `rel="noopener noreferrer"`,
    sous-texte « Bibliotheque d'icones libres ».

### UX — En-tete (2 mai 2026)

- [x] **#258** Remplacer le selecteur Normal/Anonymise par un bouton-icone dans l'en-tete (livre 6 mai 2026, b0506-0515)
  - Bouton `#btn-toggle-anonymisation-nav` ajoute a `.entete-controles-droite`,
    a cote de `#btn-toggle-theme-nav`. Toujours visible. Etat actif via
    `.btn-action-header.actif` (pattern coherent DS), `aria-pressed` synchronise.
  - Refactor `js/modes.js` : retrait de `creerSelecteurMode()` et de la
    constante `THEMES` (mortes). Ajout de `basculerModeAnonymisation()` +
    `_syncBtnAnonymisationNav()` (analogues a `basculerTheme` / `_syncBtnThemeNav`).
  - **Bonus livre dans le meme commit** : bandeau « Mode anonymisation » converti
    de generation dynamique inline en HTML statique aligne sur `.bandeau-demo`
    (padding 8px 16px, font-size 0.85rem, couleur `--bleu-principal`).
    Uniformisation des bandeaux applicatifs + economie de pixels en capture.
  - **Bilan zero dette** : -101 lignes nettes. Retrait de blocs CSS
    `.select-mode*`, `#selecteur-mode`, `.selecteur-mode-centre`, et keyframes
    `fadeIn` dupliquee.
  - PR #12 mergee, beta 99.36 b0506-0515.

- [x] **#265** Mode clair — texte « Groupe-cours actif : » noir sur fond bleu (8 mai 2026)
  - **Contexte** : sur la ligne 2 de l'en-tête (`#bandeau-groupe-cours`), le label `<label>Groupe-cours actif :</label>` (`index.html:3863`) hérite de la couleur de texte par défaut en mode clair (foncé/noir), alors que le fond du bandeau reste le bleu principal (`var(--bleu-principal)` ou similaire). Contraste insuffisant, lecture pénible.
  - **Reproduction** : bascule en mode clair via le bouton thème dans l'en-tête, observer le label à gauche du sélecteur de groupe-cours.
  - **Cible** : le label doit rester lisible en mode clair (texte clair sur fond bleu, comme « Beta 99.38 » et « vendredi 8 mai 2026 » qui sont dans le même bandeau et lisibles).
  - **À investiguer** : règle CSS `.bandeau-groupe-cours label`, scope mode-clair (`styles.css:19478` `.mode-clair label` ou bloc dédié à `bandeau-groupe-cours` à ajouter). Vérifier que la correction n'affecte pas les labels en mode sombre.

### Retours testeur — 15 mai 2026 (test manuel refactor bilan-reflexif)

- [ ] **#278** Bilan réflexif — scroll reset au top en passant à l'onglet « Importer les résultats »
  - **Symptôme** : depuis l'onglet Questionnaire scrollé en bas (vue très haute), cliquer sur l'onglet « Importer les résultats » fait remonter la page tout en haut.
  - **Cause probable** : `afficherVue` (`js/bilan-reflexif.js:124`) cache la vue précédente par `display:none` (retire l'élément du flow) puis révèle Import. Comme Import est la vue la plus courte du module (zone d'import + info résultats + bouton démo), `scrollHeight` du document chute brutalement → si le `scrollTop` dépasse le nouveau `scrollHeight`, Safari reset à 0.
  - **Bug pré-existant** : confirmé par `git show main:js/bilan-reflexif.js` — `afficherVue` strictement identique avant et après le refactor du 15 mai 2026. **Pas une régression du refactor.**
  - **Cibles** : reproductible aussi en venant de Parcours et Auto-réflexion si elles sont scrollées bas. Probablement pas seulement Import — toutes les transitions vue-haute → vue-courte sont concernées (Rapport → Import notamment).
  - **Pistes** : (a) scroll explicite vers le haut du conteneur bilan à chaque `afficherVue` (cohérent UX onglets) ; (b) `min-height` sur `.bilan-vue` pour éviter le shrink du DOM ; (c) préserver `scrollY` quand possible. (a) recommandé.
  - **Trouvé pendant** : test manuel Safari du refactor bilan-reflexif (worktree `Monitorage_v6-refactor`, branche `refactor/2026-mai`).

### Productions — Gabarit enrichi (17 mai 2026)

- [ ] **#279** Ajouter 3 champs au formulaire de production : DESCRIPTION DÉTAILLÉE des consignes, FORMAT ET MISE EN PAGE, REMISE
  - **Contexte** : enrichir le gabarit production pour documenter plus finement ce qui est demandé aux étudiants (au-delà du titre + type + pondération + échéance actuels).
  - **Capture de référence à fournir par Grégoire** au moment du chantier (placement exact des 3 champs dans le formulaire, type d'input souhaité : textarea libre, structuré, etc.).
  - **Refactor amont** : `refactor/productions` mergé sur `main` le 17 mai 2026 (Beta 99.46). Le chantier peut démarrer dès qu'une capture est fournie.
  - **Impact attendu** : `afficherFormProduction`, `lireDonneesFormulaireProduction`, `construireProductionData`, `prerenseignerFormulaireProduction` (tous helpers issus de l'étape 4 du refactor — `productions.js` résidu). Affichage côté étudiant/consultation à prévoir aussi.
  - **Hors scope initial** : versionnage des consignes, templates pré-remplis, génération PDF du gabarit.

### Captures de progression — Unifier les actions (22 mai 2026)

- [ ] **#280** Fusionner « Capturer maintenant » et « Reconstruire l'historique » en une seule action
  - **Contexte** : retour Grégoire pendant tests manuels Section A.2 du 22 mai 2026. Il dit toujours utiliser « Reconstruire l'historique » à chaque clic pour être certain que tout est propre — la distinction avec « Capturer maintenant » lui est inutile en pratique.
  - **Diagnostic** : « Capturer maintenant » a un comportement complexe et bogué (cf. bug `#116` SUIVI-BUGS — fallback semaine 1 hors trimestre, captures phantômes inter-groupes, no dedup). « Reconstruire l'historique » fait un calcul complet propre depuis le début du trimestre et est de fait l'action « clean ».
  - **Proposition** : retirer le bouton « Capturer maintenant » et son chemin de code (`capturerSnapshotManuel`, `capturerSnapshotHebdomadaire` LEGACY). Garder uniquement « Reconstruire l'historique » avec libellé clarifié, par exemple « Recalculer toutes les captures » ou « Mettre à jour les captures ». Zéro-dette CLAUDE.md : retirer en même temps les définitions devenues mortes (`obtenirNumeroSemaineActuelle` si plus de caller, etc.).
  - **Effet sur bug #116** : la fusion résout les 4 facettes A/B/C/D en un coup (phantômes, no dedup, métrique figée, fallback semaine 1) parce que `reconstruireSnapshotsHistoriques` opère sur l'ensemble du trimestre proprement.
  - **Effort estimé** : ~1 h-1 h 30 (retrait bouton + handler + fonctions devenues mortes + sentinelle Vitest si applicable).
  - **Bloqueur d'amont** : confirmer que `reconstruireSnapshotsHistoriques` traite correctement le cas multi-groupes-cours (un namespace par groupe) — sinon les captures phantômes inter-groupes persisteraient.
  - **Sous-tâche labels des cartes** : pendant la fusion, renommer les 3 cartes d'info au-dessus des boutons (`v2-stat-snapshots-hebdo` / `v2-stat-snapshots-interventions` / `v2-stat-derniere-capture`) pour les aligner sur le modèle par séance. Suggestion : « Captures hebdomadaires » → « Captures de séances » ou simplement « Captures » ; « Captures interventions » garde son sens ; « Dernière capture » reste correct une fois le bug #116 résolu. Retour Grégoire 22 mai 2026 : « les trois cartes d'information au-dessus des 3 boutons portent également à confusion » — la confusion vient à la fois de la terminologie obsolète (hebdo vs séance) et des valeurs incorrectes affichées (count gonflé par les duplicatas, date figée). Le renommage seul ne suffit pas ; la fusion + le fix #116 sont les correctifs amont.

### Notifications — Uniformiser le style (23 mai 2026)

- [ ] **#281** Migrer les notifications HTML custom résiduelles vers `window.notifications.{succes, erreur, info}` (utils-notifications.js)
  - **Contexte** : retour Grégoire pendant tests manuels Section A.4 du 23 mai 2026. Il note 2 styles distincts pour des notifications de succès dans la même app : (a) « ✅ Présences enregistrées avec succès » (fond teal/turquoise, préfixe emoji, icônes en suffixe, position fixed top-right) ; (b) « Cadre du trimestre sauvegardé » (fond vert solide, minimaliste sans emoji, style utils-notifications.js). Inconsistance UX.
  - **Diagnostic** : `saisie-presences.js:1357-1374` crée une notification manuellement (`document.createElement('div')` + `innerHTML='✅ Présences enregistrées avec succès'` + style inline `position:fixed; top:20px; right:20px; background: var(--alerte-fond-succes); ...`) au lieu d'appeler `notifications.succes('Présences enregistrées avec succès')`. Site qui a échappé à la migration du chantier Cat-B Track 4 E du 21 mai 2026 parce que le pattern n'utilise pas `afficherNotificationSucces(...)` (le grep de migration ne le détecte pas).
  - **Action** : remplacer le bloc 1357-1374 de saisie-presences.js par `notifications.succes('Présences enregistrées avec succès');` (16 lignes → 1 ligne). Audit complémentaire : grep `document\.createElement.*notification|innerHTML.*notification` pour identifier d'autres sites qui auraient échappé à la migration. Effort estimé : ~30 min (1 site identifié + audit grep + autres sites éventuels).
  - **Référence chantier amont** : Cat-B Track 4 chantier E (21 mai 2026, scope réel ~525 sites migrés dans 39 modules). Pattern de migration : negative lookbehind perl `(?<!function )(?:window\.)?\bafficherNotificationX\(`. Le grep n'attrapait que les sites utilisant l'API d'ancien nom — sites custom HTML invisibles.

### Modal Bibliothèque cours — Migration storage legacy → V2 (23 mai 2026)

- [ ] **#282** ⚠️ **PRIORITÉ HAUTE — À TRAITER ABSOLUMENT** (retour Grégoire 23 mai 2026 PM : « il faudra y revenir absolument ») — Migrer `js/cours.js` de la clé legacy `listeCours` vers la clé V2 `cours`
  - **Contexte** : retour Grégoire pendant tests manuels Section A.5 du 23 mai 2026. Il ouvre Réglages → Cours → Bibliothèque → modal s'ouvre, pas d'erreur console, mais les 2 sections (« Cours dans ta sélection » + « Cours disponibles à ajouter ») sont vides alors que son trimestre H26 contient bien le cours « 601-101-MQ Écriture et littérature ». Question légitime : « Comment fait-on pour ajouter ou sauvegarder des cours ? »
  - **Diagnostic** : 10 sites dans `js/cours.js` lisent `db.get('listeCours')` ou `db.getSync('listeCours', [])` (clé legacy, non alimentée par le V2). Sites : L64, 96, 126, 207, 272 (ouvrirModalBibliothequeCours), 357, 376, 401, 455, 530. Le V2 (trimestre-v2-cours.js et contexte.js) stocke et lit depuis `cours` (clé V2 non-namespacée). Migration partielle — `listeCours` n'est plus peuplée mais `cours.js` n'a pas été mis à jour.
  - **Effet visible** : la modal bibliothèque est essentiellement décorative en mode V2 — aucun cours ne s'y affiche tant que la migration n'est pas faite. Le flow « exporter tous mes cours » → « importer dans autre trimestre » est cassé pour les cours créés via V2.
  - **Action** : audit complet de cours.js pour trancher entre 2 options : (a) migrer tous les sites `listeCours` → `cours` + dédoublonner la logique avec trimestre-v2-cours.js ; (b) supprimer cours.js entièrement si trimestre-v2-cours.js couvre désormais tout le scope (zéro-dette CLAUDE.md). Vérifier au passage `dupliquerCoursPourTrimestreActif` (préservé volontairement au sub-cleanup du 22 mai PM commit `bd37072`) et `ouvrirModalBibliothequeCours` qui restent les seules fonctions vivantes selon le sub-cleanup.
  - **Référence sub-cleanup amont** : commit `bd37072` (22 mai PM, sub-cleanup tableau Réglages → Cours legacy). cours.js réduit de 1215 → 669 lignes. Les fonctions retirées étaient orphelines après Phase 1+2, mais les 10 sites `listeCours` restants n'ont pas été migrés — possiblement parce que l'objectif du sub-cleanup était seulement de retirer le code mort, pas de migrer les survivants.
  - **Effort estimé révisé** : 5-7 h (cf. post-mortem ci-dessous, scope réel 93 sites dans 15+ fichiers, pas 10 sites).
  - **Post-mortem première tentative (23 mai 2026, matin) — REVERTÉE** : chantier complet implémenté (12 fichiers modifiés, migration au boot, normalisation enseignant flat → nested). Tout fonctionnait techniquement (zéro erreur console, syntaxe valide, 93 sites migrés à 2). MAIS deux problèmes graves découverts au test fonctionnel :
    - **(1) Migration crée des doublons silencieux** : la migration `listeCours → cours` fusionne par `id` seulement. Si un cours existait à la fois dans `listeCours` (legacy, id générique type `COURS_177...`) ET dans `cours` (V2, id `h2026-XXX-XXX-MQ-00001`), les 2 entrées coexistent post-migration. Grégoire avait ce setup → après migration sa bibliothèque V2 contenait 2 entrées pour le même cours 601-101 (l'une migrée, l'une V2 originale).
    - **(2) Le bug pré-existant de form state cours non-reset par « + Nouveau cours »** s'est manifesté : Grégoire a ouvert le formulaire pour le 601-101, voulu créer un 601-102, mais le formulaire était resté en mode édition (`coursEnEditionV2` set). Sa save a ÉDITÉ le V2 601-101 en y mettant les valeurs 601-102. Résultat : V2 cours `h2026-601-101-MQ-00001` a maintenant codeCours="601-102-MQ". Désynchro entre l'id (immutable) et le contenu. Header dropdown stale affichait encore 601-101 alors que biblio cours affichait 601-102.
    - **Leçons apprises** :
      - **a)** Migration doit fusionner par tuple naturel (codeCours, session, annee) au lieu de id, pour détecter les doublons cross-storage.
      - **b)** Le bug du form state cours (`coursEnEditionV2` pas reset) DOIT être fixé AVANT le chantier listeCours (bloqueur amont).
      - **c)** Le mécanisme d'auto-activation `if (cours.actif)` dans `_persisterCoursV2:975` (qui setSync infoCours sur tout save avec actif=true) est trop implicite — devrait être un toggle explicite "Activer ce cours" séparé du save.
      - **d)** Le shape `enseignant` nested vs flat peut rester dual-write tant qu'on n'a pas migré tous les readers (~10+ sites dans import-export.js, cc-license.js, etc.). Faire le strict mode (nested only) en sous-chantier dédié post-migration.
  - **Prérequis avant nouvelle tentative** :
    - **P1** ✅ LIVRÉ commit `04f8d9e` (23 mai 2026) : bandeau « Mode modification — Cours <code> » dans le formulaire cours, distingue clairement mode édition vs mode création.
    - **P2** ✅ LIVRÉ commit `04f8d9e` (23 mai 2026) : auto-activation cours retirée (sauf premier cours), bouton « Activer ce cours » explicite + indicateur « (actif) » dropdown + badge sidebar. Symétrique pour groupe-cours.
    - **P3** ✅ LIVRÉ (23 mai 2026, à committer) : migration `_migrerListeCoursVersCoursV2()` extraite dans `js/trimestre-v2-cours.js`, fusion par tuple naturel `(codeCours, session+annee)` via `_tupleCoursNaturel(c)`. V2 wins, doublons legacy ignorés avec log `console.warn` + `notifications.info` à l'utilisateur si N > 0. Tuple dégradé sur le code seul si session/annee manquantes (rétrocompat legacy minimaux).
    - **P4** ✅ Snippet console de recovery (23 mai 2026) — copier-coller dans la console Safari (une instance à la fois, Safari ne tolère pas les const redéclarés) :
      ```js
      (function recoverDoublonsCours(){
        var cours = db.getSync('cours', []);
        var infoActuel = db.getSync('infoCours', null);
        function tnat(c){
          var code = ((c.codeCours||c.sigle||c.code||'')+'').trim().toUpperCase();
          if (!code) return null;
          var s = ((c.session||'')+'').charAt(0).toUpperCase();
          var a = ((c.annee||'')+'').trim();
          return (s && a) ? code+'|'+s+a : code;
        }
        var groupes = new Map();
        cours.forEach(function(c){
          var t = tnat(c); if (!t) return;
          if (!groupes.has(t)) groupes.set(t, []);
          groupes.get(t).push(c);
        });
        var aRetirer = new Set();
        groupes.forEach(function(grp, t){
          if (grp.length < 2) return;
          var v2 = grp.find(function(c){ return /^[ah]\d{4}/i.test(c.id||''); });
          if (!v2) { console.warn('[Recovery] '+t+' : doublons sans V2 prioritaire, ignoré'); return; }
          grp.forEach(function(c){ if (c !== v2) aRetirer.add(c.id); });
        });
        if (aRetirer.size === 0) { console.log('[Recovery] Aucun doublon à nettoyer.'); return; }
        console.log('[Recovery] Retrait de '+aRetirer.size+' entrée(s) legacy :', Array.from(aRetirer));
        var clean = cours.filter(function(c){ return !aRetirer.has(c.id); });
        db.setSync('cours', clean);
        if (infoActuel && aRetirer.has(infoActuel.id)) {
          var eq = clean.find(function(c){ return tnat(c) === tnat(infoActuel); });
          if (eq) { db.setSync('infoCours', eq); console.log('[Recovery] infoCours redirigée vers '+eq.id); }
        }
        console.log('[Recovery] Terminé. Recharge la page (Cmd+R).');
      })();
      ```
  - **État après revert** : 15 fichiers JS revertés à HEAD `a191fb5`. Bibliothèque cours redevient vide (bug original #282 toujours actif). Data Grégoire corrompue à nettoyer.

### Rythme Phase 5 — Raffinements (selon usage, post-AQPC)

- [ ] **#268** Courbe d'apprentissage de l'evaluateur (tendance temporelle par activite)
- [ ] **#269** Export du portrait temporel pour reflexion professionnelle
- [ ] **#270** Drill-down par activite → detail productions/groupes
- [ ] **#271** Planification multi-productions avec priorites

### Chantier structurel — Machine a etats pour le chargement d'evaluations

- [ ] **#272** Remplacer les 5 flags globaux + setTimeout imbriques par un module eval-chargement.js (anciennement #239, renuméroté 11 mai 2026)
  - **Contexte** : Le systeme actuel coordonne l'ouverture de fichiers et le chargement
    d'evaluations avec 5 flags booleens globaux (`_modifierEvaluationEnCours`,
    `_apresOuvertureFichier`, `_resterEnModeAnnoter`, `_forceStandaloneEval`,
    `_consulterEvalTimerId`) et des chaines de setTimeout (150-800ms) non annulables.
    Cela cause des flags collants, des race conditions entre preRemplirEvaluation et
    modifierEvaluationParId, et une restauration aveugle du mode Evaluer sur les mauvais onglets.
  - **Correctifs tactiques en place** (29 mars 2026, commits `5969054` + `256c65d`) :
    nettoyage des flags orphelins, guard `sousSectionActive`, callback no-op pour Annoter.
    Ces patches tiennent mais ne resolvent pas la fragilite structurelle.
  - **Solution** : Module IIFE `eval-chargement.js` avec machine a etats
    (idle → navigating → loading → ready), timers annulables via `differer()`,
    annulation propre a la navigation, shims retrocompatibles pendant la migration.
  - **5 phases** : (1) Module + cleanup navigation, (2) Migrer Consulter liste,
    (3) Migrer Annoter liste, (4) Migrer profil + standalone + chargerExistante,
    (5) Retirer shims et anciens flags.
  - **6 points d'entree** a migrer : consulterEvaluationDepuisListe,
    ouvrirAnnotationDepuisListe, evaluerProduction, modifierEvaluationRemplacee,
    consulterEvaluation (profil), chargerEvaluationExistanteSiPresente.
  - **Plan detaille** : `plans de travail/Plan — Machine a etats pour le chargement d'evaluations.txt`
  - **Contre-expertise** : `plans de travail/Contre-expertise — Machine a etats eval-chargement.md`
  - **Priorite** : Moyenne — a planifier quand les correctifs de session ne suffisent plus

### Desaturation localStorage — COMPLETE (27 mars 2026)

- [x] **Phase 1a** Extraire thumbnails de fichiersTravaux vers IDB (gain ~3.3 Mo) *(commit 233fdfc)*
- [x] **Phase 2a** Seuil IDB-first 200 Ko dans setSync (grosses cles → memoryCache + IDB) *(commit a329f81)*
- [x] **Phase 1b** Flush beforeunload (ecritures IDB trackees, dialogue si Cmd+Q) *(commit a329f81)*
- [x] **Phase 2c** Fusionner _prechargerDepuisIDB dans syncToLocalStorageCache *(commit 51d7176)*
- [x] **Phase 1c** Audit appels directs localStorage (tous legitimes, RAS)
- [x] **Phase 3b** Notification quota → retiree (comportement normal avec IDB-first)
- [x] **Phase 2b** Documentation db.js mise a jour *(commit f25f12c)*
- [x] **Phase 2d** Audit evaluationsSauvegardees (gere par seuil IDB-first)
- [x] **Phase 3a** Diagnostic storage (window._storageStats + rapport-bug) *(commit f25f12c)*
- [x] **Phase 3c** Test de resistance (window._testResistanceStorage() — SUCCES) *(commit f25f12c)*
- **Plan detaille** : `plans de travail/Plan - Desaturation localStorage (analyse).md`

### Assainissement securite — ~87% COMPLETE (25-27 mars 2026)

- [x] Phases 0-6 : ~1302 handlers inline migres vers delegation (18 commits)
- [x] index.html : 0 onclick inline
- [x] CSP `script-src 'self'` active
- [x] Dispatcher data-action/data-on-change operationnel dans main.js
- [x] fermerOverlayParent() generique pour modales *(commit 68af8d4)*
- [x] Migration close/cancel modales vers data-action (11 handlers) *(commit 68af8d4)*
- Reste : 21 .onclick directs dans JS (closures, createElement — tous programmatiques, aucun inline HTML)

### Jetons de reprise avec fichiers — COMPLETE (27 mars 2026)

- [x] Import via "Jeton de reprise" dans le pipeline + sous-selecteur production
- [x] Application automatique post-import + liaison fichier↔evaluation
- [x] Badge "Reprise (etait X · Y%)" + badge "A reevaluer" (orange)
- [x] Modale doublon avec option "Jeton de reprise"
- [x] Reassociation avec option "Jeton de reprise"
- [x] Annoter depuis la liste charge l'evaluation existante
- [x] Filtrage `!remplaceeParId` dans profil, dashboard, graphiques
- [x] Fix db.js : pre-chargement IDB au demarrage (quota localStorage)
- **8 commits** : `86cd409` a `63dd1d2`

### Codex — Flux USB multi-appareil (14 mars 2026)

- [x] **#225** Codex Phase 1 : Ouvrir/sauvegarder un codex ZIP portable (Mac + iPad) *(Beta 98.5, commit 8f1fc57)*

- [x] **#226** Codex Phase 2 : TimeMachine (historique des versions dans le codex) ✅ COMPLÉTÉ
  - [x] Infrastructure : constantes, helpers rotation/archivage/chargement *(commit 9eedefa)*
  - [x] Branchement : generer/charger/fermer integrent l'historique *(commit 20442df)*
  - [x] Restauration : prompt() liste numerotee + confirm() securite *(commit bf11f3e)*
  - [x] Comparaison visuelle : diff entre deux snapshots (cles ajoutees/supprimees/modifiees)
  - **Plan detaille** : `docs/plan-codex.md`

- [x] **#227** Codex Phase 3 : Multi-codex + fusion *(Beta 98.5, 14 mars 2026)*

- [x] **#228** Codex Phase 4 : Auto-save FSAPI vers cle USB *(Beta 98.6, 14 mars 2026)*
  - [x] 4.1 Handle FSAPI persistant — re-ecriture directe sans dialogue (Chrome/Edge)
  - [x] 4.2 Auto-save a intervalle (5 min) quand handle disponible, silencieux
  - [x] 4.3 Indicateur connexion dans le menu + sous-texte Enregistrer
  - **A tester sur Chrome Mac** : ouvrir → enregistrer → enregistrer (sans dialogue) → auto-save 5 min
  - **Plan detaille** : `docs/plan-codex.md`

- [x] **#229** Design : Adopter l'overlay de progression du Codex comme norme *(14 mars 2026)*
  - Nouveau fichier `js/progression.js` : 3 fonctions globales (`afficherProgression`, `majProgression`, `masquerProgression`)
  - Classes CSS `.progression-*` dans `styles.css` (remplacement des styles inline)
  - `codex.js` delegue aux fonctions globales via alias

- [x] **#231** Codex : Auteur non defini dans les details *(14 mars 2026)*
  - Nouvelle fonction `_obtenirAuteur()` avec cascade : `profilEnseignant` (prenom+nom) → `infoCours.enseignant` (fallback)
  - L'auteur se propage automatiquement dans le manifeste a chaque sauvegarde

- [x] **#230** UX : Documentation utilisateur du concept Codex *(14 mars 2026)*
  - Tooltip `entete-codex` dans `tooltips-contenu.js` (concept cle USB + pastilles)
  - Bandeau de statut en haut du menu (nom + etat vert/orange ou message etat vide)
  - `beforeunload` rappel d'enregistrer avant de quitter
  - Etats vides ameliores : messages guidants avec actions possibles
  - MODULE 6 « Utiliser le Codex » dans le tour guide Primo (flux Mac/USB/iPad)
  - Overlay de progression normalise : voir #229

### Retours testeur — 14 mars 2026

- [x] **#232** UX : Comment activer les info-bulles sur tablette ?
  - Commentaire de Gregoire (iPad, Safari 26.3, iPadOS)
  - Les info-bulles se declenchent au survol (hover) — impossible sur ecran tactile
  - Investiguer : activer au tap long ? Ou proposer un toggle explicite dans les preferences ?
  - **Fichier** : `js/tooltips.js`, `js/tooltips-contenu.js`

### Retours testeur — 18 mars 2026

- [x] **#236** UX Aide : Retirer les emoji 🔶 clignotants dans la section Aide
  - Ils servaient a indiquer que la section etait en developpement, cette information est obsolete

- [x] **#237** UX Aide : Ameliorer le moteur de recherche dans la section Aide
  - Le moteur n'indique pas dans quelles cartes se trouvent les mots cles recherches
  - Ajouter des propositions de recherche similaire (ex. : « niveau 3 » → « reponse a l'intervention », « RaI », « interventions »)

- [x] **#238** Indices : Audit et amelioration du calcul des blocages et niveaux RaI
  - Documenter les conditions actuelles de calcul et les rendre explicites dans la section Aide
  - Le niveau RaI devrait tenir compte de :
    - Taux d'assiduite inferieur a 75%
    - Taux de completion inferieur a 75%
    - Performance des 4 meilleurs artefacts (selon reglages utilisateur dans le depistage) inferieure a 65%
  - **Fichiers** : `js/indices.js`, section Aide

### Retours testeur — 16 mars 2026

- [x] **#234** Retroaction : Reintegrer l'import TXT pour les cartouches de retroaction
  - Une fonction d'import de fichier `.txt` existait avant mais a ete perdue lors d'une refacto
  - Permet d'importer plusieurs commentaires d'un coup (1 par ligne ou par bloc) au lieu de copier-coller un par un
  - Cas d'usage : 16 commentaires a saisir manuellement = trop long
  - Verifier dans l'historique git si l'ancienne implementation est recuperable
  - **Fichier** : `js/cartouches.js`

- [x] **#235** UX : Uniformiser les appellations « Note chiffree » / « Code du niveau de performance »
  - Incoherence entre les ecrans : « Note chiffree » vs « Code » (radio dans retroaction), « Code du niveau de performance » (reglages pratique)
  - Les valeurs internes (`complet` / `lettre`) ne correspondent a aucun libelle visible
  - Harmoniser les labels dans : retroaction evaluation, reglages pratique, export PDF
  - **Fichiers** : `index.html` (radios retroaction + reglages), `js/evaluation.js`, `js/travaux-export-pdf.js`

### Tampons jetons sur les travaux

- [ ] **#240** Tampon visuel pour jetons (Délai, Reprise, Reprise ciblée) sur les travaux annotés
  - Cliquer sur le mot du jeton dans le panneau Paramètres → curseur tampon
  - Cliquer sur le travail → appose "JETON DE DÉLAI" / "JETON DE REPRISE" / "JETON DE REPRISE CIBLÉE" en rouge majuscule
  - Une fois tamponné, la checkbox du jeton se coche automatiquement
  - Utiliser le même mécanisme que les tampons existants (Exact, Bien, etc.)
  - Le PDF exporté montre clairement le jeton appliqué (pas seulement en métadonnées)
  - **Module** : `js/travaux-annotation.js`, panneau jetons dans `js/evaluation.js`

### Codex — Comparaison et portabilite (26 mars 2026)

- [x] **#243** Codex : Rapport de comparaison en texte exportable ✅ LIVRÉ (13 mai 2026)
  - Nouvelle action « Comparer avec un codex... » ajoutée au menu Codex (indépendante de Fusionner)
  - Modale modalCodexComparer avec textarea copiable + Copier (clipboard API + fallback) + Télécharger .txt (Blob)
  - `actionComparer` → `_construireRapportComparaison` : rapport détaillé listant chaque clé par catégorie (présent uniquement local/externe, modifié, supprimé, conflits) + travaux externes
  - Diagnostic pur — n'applique aucune modification au codex local

- [x] **#244** Codex : Identifier le navigateur source dans le manifeste ✅ LIVRÉ (11 mai 2026)
  - Nouvelle fonction `_identifierNavigateur()` dans `js/codex.js` après `_identifierAppareil()`. Parse nom/version/OS depuis `navigator.userAgent`. Gère iOS WebKit re-brandé (CriOS, EdgiOS, FxiOS). Format : `Chrome 146 / macOS`, `Safari 17 / iPadOS`, etc.
  - 2 champs ajoutés au manifeste : `navigateur` (string lisible) + `userAgent` (string complète pour diagnostic).
  - Branchement aux 2 sites de construction du manifeste : `genererCodex` (codex complet, ~L353) + export sélectif (~L2504).
  - Champ `appareil` conservé pour rétrocompatibilité des codex existants.
  - **Effort réel** : ~30 min (vs estimation 30 min).

### Simplification UX Codex

- [ ] **#233** UX : Simplifier le flux Codex pour l'utilisateur lambda (Mac + iPad)
  - Probleme : le concept de fichier ZIP transportable sur cle USB est complexe pour un non-technicien
  - Safari Mac ne supporte pas FSAPI — chaque sauvegarde telecharge un nouveau fichier (pas d'ecriture directe)
  - iPad : tous les navigateurs utilisent WebKit (regle Apple) — pas de FSAPI meme sur Chrome iOS
  - Pistes a explorer :
    - Assistant premier lancement Codex expliquant le flux en 3 etapes
    - Detecter le navigateur et adapter les instructions (Chrome vs Safari, Mac vs iPad)
    - Sur Safari : guider l'utilisateur pour remplacer le fichier sur la cle USB (ou automatiser via Raccourcis iOS ?)
    - Messages contextuels clairs a chaque etape (sauvegarde, transfert, ouverture sur l'autre appareil)
  - **Module** : `js/codex.js`

- [x] **#239** Menu Codex : adapter l'interface selon le navigateur (FSAPI) ✅ LIVRÉ (13 mai 2026)
  - Détection `typeof window.showSaveFilePicker === 'function'` dans `_actualiserMenu`
  - Sans FSAPI (Safari/iPad) : « Enregistrer le codex » → « Télécharger le codex » + sous-texte « Télécharge un nouveau fichier »
  - Avec FSAPI + handle (Chrome/Edge) : libellé d'origine + sous-texte « Vers le même emplacement »
  - `actionDetails` enrichi d'une note expliquant le mode de sauvegarde selon le navigateur courant
  - Auto-save status reste naturellement masqué sans FSAPI (timer jamais démarré)

### Retours testeur — 3 mars 2026

- [x] **#214** Bug : Gestion avancee des ressources — suppression non persistante ✅ CORRIGE (16 mars 2026, Bug #83)
  - Les fonctions `assurer*()` re-injectaient les gabarits hardcodes a chaque init
  - Corrige : cle IDB `ressourcesSupprimees` consultee avant reinjection (main.js, echelles.js, grilles.js, cartouches.js, donnees-v2.js)

- [x] **#215** Dates debut/fin de trimestre obligatoires dans le formulaire de reglages ✅ LIVRÉ (11 mai 2026)
  - **3 champs obligatoires** : `cadreCalendrier.dateDebut` + `finCours` + `finTrimestre`. Sans eux, les fonctions de semaine, échéances et snapshots cassent.
  - **Indicateur visuel** : astérisque rouge `*` ajouté dans chaque label (3 spans `class="champ-requis"`). Nouvelle classe CSS `.champ-requis` dans `styles.css` (couleur `var(--rouge-erreur)`, font-weight 700).
  - **Attribut HTML `required`** ajouté sur les 3 inputs (sémantique + comportement navigateur cohérent).
  - **Validation améliorée** dans `sauvegarderCadreCalendrierV2()` :
    - `alert()` remplacé par `afficherNotificationErreur` (titre + détail des champs manquants).
    - Liste précisément les champs manquants en bullet points (au lieu d'un message générique).
    - **Focus auto** sur le premier champ vide → guide l'utilisateur directement.
  - **Note** : l'« assistant de configuration » référencé dans la description originale (primo wizard) a été retiré le 21 avril 2026 (Phase 3 consolidation onboarding). Le formulaire `v2-` est désormais le seul point d'entrée — validation centralisée à un seul endroit.
  - **Fichiers** : `js/trimestre-v2.js`, `index.html`, `styles.css`.

- [x] **#216** Tooltips sur la date d'echeance des productions ✅ LIVRÉ (11 mai 2026)
  - 2 entrées hover ajoutées dans `js/accompagnement-contenu-hover.js` section Productions :
    - `cn-prod-echeance` (mode simple) : explique snapshots, C, P, gestion remis/non remis.
    - `cn-prod-echeance-mg` (mode multi-groupe) : explique le sens du décochage par groupe.
  - `data-tooltip="cn-prod-echeance"` ajouté sur `#productionDateEcheance` dans index.html (remplace l'attribut `title=` natif redondant).
  - `data-tooltip="cn-prod-echeance-mg"` ajouté sur les champs date dynamiques générés par `productions.js` (classe `.echeance-gc-date`).
  - Renvoient explicitement vers les popups ✴️ existantes (`echeance-indices`, `echeances-multigroupes`) pour les détails étendus.
  - **Note** : le fichier référence dans la description originale (`js/tooltips-contenu.js`) n'existe plus — l'infra hover est maintenant dans `js/accompagnement-contenu-hover.js` (consolidation onboarding du 21 avril 2026).

- [x] **#217** Gestion des jetons — a investiguer ✅ FAIT (27 mars 2026)
  - Module jetons de reprise avec fichiers numeriques livre (8 commits)
  - Import, association, badges, filtrage, annoter depuis la liste
  - **Fichier** : `js/evaluation-jetons.js`, `js/travaux-import.js`, `js/liste-evaluations.js`

- [x] **#218** Apercu des annotations texte et soulignements ondulés ✅ VÉRIFIÉ (11 mai 2026, analyse de code, aucun bug constaté)
  - **Annotations texte** : `dessinerTexte` (`travaux-annotation.js:2727`) et la boucle texte de l'export PDF (`travaux-export-pdf.js:267-299`) utilisent le **même algorithme** — word-wrap via `wrapLigne`, `fontSize × ratioResolution`, interligne `1.3`.
  - **Soulignements ondulés** : `case 'ondule'` in-app (`travaux-annotation.js:2453`) et `case 'ondule'` PDF (`travaux-export-pdf.js:429`) — algorithmes **identiques** (amplitude/wavelength × ratioResolution, gestion des pointes via `normaliserPointes`, même boucle sinusoïdale).
  - Aucune divergence visible entre rendu in-app et export PDF. Item ajouté au BACKLOG le 3 mars 2026, fonctionnement validé par analyse de code 11 mai 2026.

- [x] **#219** Revoir la preparation des interventions RaI — formulaire en deux etapes inutile ✅ LIVRÉ (11 avril 2026, commit 4ec86fa)
  - Refactor « formulaire unifié interventions » (Phase 2 — refonte interventions).
  - Fusion création + détail en un seul flux via `ouvrirIntervention()`. `afficherFormulaireIntervention()` crée l'intervention vide puis ouvre directement la vue complète (voir commentaire `js/interventions.js:652` « formulaire unifié »).
  - Guard de nettoyage des interventions orphelines (`jamaisSauvegardee`). 3 fonctions obsolètes supprimées (-320 lignes).
  - Pré-sélection DA depuis le profil étudiant.
  - Item ajouté au BACKLOG le 3 mars 2026, livré le 11 avril, jamais marqué `[x]` jusqu'à aujourd'hui.

- [x] **#220** Bug : Calcul de l'assiduite errone dans le profil etudiant ✅ CORRIGE (3 mars 2026, #224)
  - Le pourcentage d'assiduite affiche dans le profil etudiant est incorrect
  - Cause : 6 fonctions de calcul concurrentes dont 3 utilisaient `heures` avec denominateur hardcode `heuresCours=2`
  - Corrige par la refacto #224 (fonction canonique unique `calculerAssiduite` dans indices.js)
  - **Fichier** : `js/profil-etudiant.js`

- [x] **#224** Refacto : Fonction canonique unique pour l'indice A (Assiduite) ✅ COMPLETE (3 mars 2026)
  - 1 fonction canonique `calculerAssiduite(da, dateLimite)` dans `indices.js` remplace 6 fonctions dispersees
  - Formule : `A = Σ periodesPresentes / Σ periodesOffertes` (purement sommatif, base periodes)
  - Source de verite : `seancesCompletes` du groupe-cours × `datesSaisies` du groupe
  - Suppression de l'indice alternatif (dernieres N seances)
  - Correction detection d'absences dans le profil : `datesSaisies` construit depuis le GROUPE
  - **Fichiers** : `js/indices.js` (+250L), `js/saisie-presences.js` (-530L), `js/snapshots.js`, `js/profil-etudiant.js`

### Qualite du code — Audit fevrier 2026

> **Rapport complet** : `docs/AUDIT-QUALITE.md` (134 constats : 24 critiques, 63 moderes, 47 mineurs)

#### Phase 1 — Integrite des donnees ✅ CORRIGE (28 fev 2026)

- [x] **#196** Harmoniser les appels evaluation.js : 5 lectures read-only → `obtenirDonneesSelonMode()` + commentaire bloc
  - **Ref audit** : EVL-01

- [x] **#197** Documenter `cours`/`listeCours` dans CLES_GLOBALES
  - **Ref audit** : TRM-01

- [x] **#198** Chainer `calculerEtStockerIndicesCP()` apres modification presences
  - **Ref audit** : SUI-03

- [x] **#199** 6 ecritures directes → `sauvegarderDonneesSelonMode()` dans evaluation-jetons.js
  - **Ref audit** : EVL-04

- [x] **#200** Migration one-shot `listeCours` → `cours` + unification ~15 lectures
  - **Ref audit** : TRM-02

- [x] **#201** Reset `infoCours`/`groupeCoursActif` au changement de trimestre + suppression de cours
  - **Ref audit** : TRM-03

- [x] **#202** Guard division par zero dans `calculerPerformancePAN()`
  - **Ref audit** : SUI-02

#### Phase 2 — Robustesse ✅ CORRIGE (28 fev 2026)

- [x] **#203** Validation taille blob 20 MB + gestion `QuotaExceededError`
  - **Ref audit** : TRV-03

- [x] **#204** `.catch()` sur `preRendreAdjacentes()` fire-and-forget
  - **Ref audit** : TRV-01

- [x] **#205** Nettoyage `configCompleteEnAttente` dans 4 catch d'import
  - **Ref audit** : AUT-01

- [x] **#209** Suppression 5 console.log DEBUG dans `calculerNote()`
  - **Ref audit** : EVL-06

- [x] EVL-05 : `JSON.parse/stringify` → `structuredClone()` dans evaluation-jetons.js
- [x] EVL-07 : Suppression 2 lignes FIXME mortes dans evaluation.js
- [x] TRV-02 : `.catch()` sur 2 appels `genererThumbnailQueue` dans travaux-import.js
- [x] TRV-04 : Guard null `annotationCourante` dans `obtenirDonneesPage`

#### Phase 3 — Performance et hygiene ✅ CORRIGE (28 fev 2026)

- [x] **#208** Throttle rAF sur 6 handlers mousemove critiques de la carte mentale (`throttleRAF()` + refs dediees)
  - **Ref audit** : PLN-03

- [x] SUI-06 : Cache pre-charge `indicesAssiduite`/`indicesCP` dans la boucle `.map()` du tableau de bord (~300 `db.getSync()` → 2)
- [x] TRM-07 : Suppression `console.log` verbeux des migrations cours quand 0 cours migres

#### Reste a faire — Architecture

- [x] **#206** Creer module `indices.js` centralise : regrouper les 7 fonctions de calcul d'indices A-C-P-E dupliquees entre profil-etudiant.js, portfolio.js, tableau-bord-apercu.js et saisie-presences.js
  - **Ref audit** : SUI-01, voir tableau de centralisation dans AUDIT-QUALITE.md

- [x] **#207** Intégrer travaux-stockage.js dans db.js — API blob unifiée ✅ LIVRÉ (audit 13 mai 2026)
  - **Ref audit** : ARC-01
  - **Migration FAITE** (Beta 95) : MonitorageFichiers → MonitoragePedagogique.fichiers. `js/travaux-stockage.js` (1451 l.) n'a plus aucune référence `MonitorageFichiers` / `indexedDB.open` / DB parallèle.
  - **API blob en place** dans `js/db.js:683` : `storeBlob`, `getBlob`, `deleteBlob`, `listBlobsByStudent`.
  - **Thumbnails migrées** vers IDB keyvalue (Beta 98.9).
  - **Fusion des modules NON pertinente** : travaux-stockage.js gère FSAPI (showDirectoryPicker), génération thumbnails, gestion quota — concerns distincts de db.js. La séparation est saine architecturalement.

#### Reste a faire — CSS

- [x] **#210** Consolider styles inline index.html : 1 137 → 861 (276 elimines, ~1 150 proprietes extraites en classes `u-*`). Page d'accueil unifiee (suppression ecran premier lancement). Fix lecture cle `cours` vs `listeCours`.
  - **Ref audit** : CSS-01

#### Annule

- ~~**#211**~~ Nettoyer code legacy prototype dans planification-carte.js — **faux positif** : les fonctions `peuplerSelecteurLecons()` et `afficherLeconOrganisateur()` existent localement (lignes 3302, 3409), les IDs DOM `planif-org-select-*` sont distincts de ceux d'`organisateur.js`
  - **Ref audit** : PLN-01

### Priorite haute - Boite a outils : Modelisation (21 fev 2026)

- [x] **Outil "Modelisation" dans la Boite a outils** ✅ COMPLÉTÉ (28 fév 2026) : Module entierement reecrit avec layout flex sidebar + document, toolbar enrichie (pages, navigation inter-documents, zoom), badges de statut (Importé/Annoté), sidebar retractable avec miniatures. Palette d'annotation partagee via `travauxUI.creerLayoutAnnotation()` parametrable (`afficherCodes`, `afficherTampons`, `conteneurDocId`). Titre du panneau de codes rendu dynamique (`db.getSync('titrePanneauCodes')`). Suppression de `setMasquerErreursFrancais` au profit du parametre generique `afficherCodes: false`. Fichiers modifies : `js/modelisation.js` (reecrit), `js/travaux-ui.js` (parametrise), `styles.css` (+105 lignes).

### Priorite haute - Annotation et Evaluation (21 fev 2026)

- [ ] **#275** Retroactions visuelles enrichies dans la synthese (numéroté 11 mai 2026, besoin identifié 21 fév 2026) : Les retroactions remises a l'eleve (synthese PDF et zone de retroaction) ne contiennent actuellement que les courts descriptifs des niveaux de la palette (quelques mots par critere). Ce n'est pas suffisant pour une retroaction pedagogique significative. Il faudrait developper des retroactions plus etoffees : phrases completes par critere/niveau, pistes d'amelioration, forces observees, liens avec les objectifs. Explorer les options : commentaires editables par critere dans la cartouche, champs de retroaction detaillee par niveau, ou generation assistee a partir du contexte de la production.

- [ ] **#273** Évaluations démo basées sur de vrais travaux d'élèves anonymisés (besoin identifié 21 fév 2026, reformulé 11 mai 2026)
  - **Contexte** : les modules d'annotation et d'évaluation ont été remaniés (Phases #109 à #185, Beta 96.3 → 98.x). Aucun exemple complet n'est livré en mode démo.
  - **Sources** : Grégoire a obtenu le consentement d'élèves H2026 (plusieurs « oui ») pour utiliser leurs travaux à des fins de démonstration. Travaux à anonymiser avant intégration au pack démo.
  - **Périmètre** : 2-3 dossiers complets couvrant annotation Apple Pencil + évaluation par grille + rétroaction structurée. Visée double : (1) valider le flux complet de bout en bout, (2) servir d'exemples concrets aux nouveaux utilisateurs (et démo AQPC 3 juin).
  - **Anonymisation** : remplacer DA + prénom/nom par identifiants démo (`Élève_DEMO_01`, etc.), retirer toute mention nominative dans les fichiers PDF/images, vérifier l'absence de métadonnées EXIF compromettantes.
  - **Intégration** : verser dans le pack démo (groupe 9999) via `donnees-demo.js`, avec préfixe `PROD_DEMO_` (rappel #86 : ne JAMAIS utiliser `PROD_` seul, qui matche les vraies productions).
  - **Fichiers** : `js/donnees-demo.js`, `autocollants/` éventuellement enrichi, pack travaux dans `MonitorageFichiers` (IndexedDB).

- [x] **#276** Évaluation sans travaux importés ✅ LIVRÉ (audit 13 mai 2026)
  - Mode standalone explicite à `evaluation.js:5327` : « Sinon (standalone, sans fichier), afficher le formulaire directement »
  - Branchement `enModeEvaluer = !!document.getElementById('travaux-palette-eval-gauche')` → si pas en mode visionneuse, le formulaire d'évaluation s'affiche seul
  - Multiples fixes de mars 2026 sur ce code path (`_forceStandaloneEval` 20 mars, `_resterEnModeAnnoter` 29 mars) → flux activement utilisé et stable
  - Le contexte « évaluation directement dans l'app » (non plus GoodNotes) est donc déjà supporté.

- [x] **#277** Modale Réparation des évaluations — point d'accès UI manquant ✅ LIVRÉ (13 mai 2026, option b)
  - Décision actée 12 mai : option (b) suppression complète. Modale jamais ouverte depuis l'UI, fonction `reparer_evaluations_criteres_manquants` callable uniquement via modale → chaîne entièrement morte.
  - Retraits : modale HTML (index.html, 54 lignes), 4 fonctions evaluation.js (afficher/fermer/lancer + reparer), 2 exports `window.*`, entrée popup `modal-reparation` dans accompagnement-contenu-popup.js
  - `extraireNiveauxDepuisRetroaction` conservé — toujours utilisé comme fallback au chargement des évaluations sans tableau criteres (L5469)

- [x] **Info-bulles et pratique guidee (Annotation/Evaluation)** ✅ COMPLÉTÉ (22 fév 2026) : 25 info-bulles ajoutées couvrant les cartes métriques, checkboxes rétroaction, boutons d'action, barre d'outils annotation, pipeline d'import et zone d'archivage.

### Priorite haute - Cartes mentales (21 fev 2026)

- [ ] **#274** Produire des cartes mentales démo pour le matériel pédagogique (été 2026)
  - **Contexte** : alimenter le mode démo avec des exemples concrets de cartes mentales d'alignement (taxonomie Anderson, objectifs/savoirs/activités/évaluations).
  - **Usage prévu** : matériel pédagogique de la cohorte CoP. Particulièrement utile pour la Rencontre 5 « Aligner sa pratique » (janvier 2027), première bascule pédagogique du cycle.
  - **Période cible** : été 2026 (préparation pendant la phase expérimentateurs juin-août).
  - **Périmètre** : 2-3 cartes complètes couvrant différentes disciplines/cours, intégrées au pack démo via `js/donnees-demo.js`. Charger automatiquement quand le mode démo est actif.
  - **Lien** : la complétion du module Alignement lui-même (fonctionnalités du code) est planifiée à l'automne 2026 — référence CALENDRIER §7 (Rencontre 5, hiver 2027).
  - **Fichiers** : `js/donnees-demo.js`, `js/planification-bibliotheque.js` (déjà alimenté par #188 avec « Écriture et littérature »).

### Priorite haute - Module Travaux / Visionneuse (20 fev 2026)

- [x] **Palette annotation : position fixe (pas de scroll)** ✅ CORRIGÉ (20 fév 2026) : La palette `.travaux-palette-flottante` se deplace quand on scroll le travail dans le canvas. Elle doit rester fixe a l'ecran (position fixed ou ancrage au viewport du canvas-container), comme une vraie palette flottante.

- [x] **Palette annotation : remplacer les emojis par des mots/boutons** ✅ CORRIGÉ (20 fév 2026) : Les icones emoji de la palette (outils, formes, tampons, undo/redo, effacer) sont laids. Les remplacer par des boutons textuels lisibles (mots courts) ou des icones SVG propres. Pas d'emoji.

- [x] **Panneau gauche evaluation : adopter le look « palette »** ✅ CORRIGÉ (20 fév 2026) : Le panneau coulissant gauche (`#travaux-eval-gauche`) doit etre conforme au design des palettes de la carte mentale (`.prep-palette`, `.planif-palette`). Reference : palette de reglages specifiques dans travaux-preparation.js. Barre de titre, style de carte sombre, coherence visuelle.

- [x] **Panneau droit evaluation : criteres + dropdowns echelle uniquement** ✅ CORRIGÉ (20 fév 2026) : Le panneau droit (`#travaux-eval-droite`) doit presenter les criteres d'evaluation et les dropdowns de l'echelle de performance. La retroaction finale et les options de retroaction ne doivent PAS etre dans ce panneau.

- [x] **Previsualisation retroaction : en bas de la visionneuse** ✅ CORRIGÉ (20 fév 2026) : La zone de retroaction finale (textarea + checkboxes + bouton copier) doit s'afficher en bas de la visionneuse (sous le canvas), pas dans le panneau de droite. Deplacer la `.zone-retroaction` hors de `#travaux-eval-droite` vers un emplacement sous le canvas.

### Priorite haute - Page d'accueil (20 fev 2026)

- [x] **Reordonner et renommer les sections de la page d'accueil** ✅ CORRIGÉ (20 fév 2026) : Intervertir les deux premieres sections. Creer une entete pour la 3e section. Les titres des trois sections deviennent : « Decouvrir », « Parcourir », « Piloter ». Retirer l'emoji de pin (📌) des titres.

### Priorite CRITIQUE - Planification / Carte mentale (Audit 8 fév 2026)

- [x] **#124** BUG CRITIQUE : supprimerNoeud() modifie etat.liens pendant iteration (liens orphelins) ✅ CORRIGÉ (8 fév 2026)
  - **Ligne** : `planification-carte.js:824-828`
  - **Symptome** : `for (const [lienId, lien] of etat.liens)` appelle `supprimerLien(lienId)` qui fait `etat.liens.delete()` pendant la boucle
  - **Impact** : Comportement indefini en JavaScript — des liens peuvent etre sautes et rester en memoire apres suppression du noeud
  - **Correction** : Collecter les IDs dans un tableau temporaire, puis supprimer apres la boucle
  - **Fichier** : `js/planification-carte.js`

- [x] **#125** BUG CRITIQUE : mettreAJourZoneConteneur() sans protection contre cycles (stack overflow) ✅ CORRIGÉ (8 fév 2026)
  - **Ligne** : `planification-carte.js:1744-1745`
  - **Symptome** : Si corruption cree un cycle (conteneur A parent de B, B parent de A), recursion infinie → crash navigateur
  - **Contraste** : `reLayoutConteneur()` a deja une garde `_layoutEnCours.has()`, mais pas `mettreAJourZoneConteneur()`
  - **Correction** : Ajouter un Set `_zoneEnCours` comme garde anti-cycle, similaire a `_layoutEnCours`
  - **Fichier** : `js/planification-carte.js`

- [x] **#126** BUG CRITIQUE : estDescendantDe() sans protection contre cycles (stack overflow) ✅ CORRIGÉ (8 fév 2026)
  - **Ligne** : `planification-carte.js:1445-1453`
  - **Symptome** : Recursion infinie si le graphe parent/enfants contient un cycle
  - **Utilise par** : `trouverConteneurPour()` appele pendant le drag → freeze du drag si structure corrompue
  - **Correction** : Ajouter parametre `visited = new Set()` pour detecter les cycles
  - **Fichier** : `js/planification-carte.js`

- [x] **#127** evaluerBadge() : asymétrie clones/parent documentée (comportement voulu) ✅ DOCUMENTÉ (8 fév 2026)
  - **Lignes** : `planification-carte.js:248-252, 281, 291`
  - **Symptome** : Agrege les liens de TOUS les clones (via `trouverClones`) mais verifie `noeud.parent` du noeud courant seulement
  - **Exemple** : Clone A dans Lecon L1, Clone B hors lecon → B affiche badge vert car les liens de A sont agreges, mais parent de B n'est pas une lecon
  - **Correction** : Verifier le parent de chaque clone individuellement, ou documenter le comportement voulu
  - **Fichier** : `js/planification-carte.js`

### Priorite haute - Planification / Carte mentale (Audit 8 fév 2026)

- [x] **#128** VERBES_COMPAT : mapping incorrect pour 'evalue_par' ✅ CORRIGÉ (8 fév 2026)
  - **Ligne** : `planification-carte.js:168`
  - **Symptome** : `'evalue_par': 's_acquiert_par'` — devrait etre `'se_verifie_par'`
  - **Impact** : Les liens d'evaluation anciens (avant migration) affichent un verbe incorrect
  - **Correction** : Changer en `'evalue_par': 'se_verifie_par'`
  - **Fichier** : `js/planification-carte.js`

- [x] **#129** Metadonnees (duree, semaines) non propagees aux clones ✅ CORRIGÉ (8 fév 2026)
  - **Lignes** : `planification-carte.js:616, 630, 636`
  - **Symptome** : Changer la duree d'un clone ne met pas a jour les autres instances
  - **Contraste** : `titre` et `description` sont propages via `propagerModification()`, mais pas `metadata.duree`, `metadata.semaineDebut`, `metadata.semaineFin`
  - **Correction** : Appeler `propagerModification()` pour les metadonnees, ou creer une fonction dediee
  - **Fichier** : `js/planification-carte.js`

- [x] **#130** creerLien() ne verifie pas les doublons ✅ CORRIGÉ (8 fév 2026)
  - **Ligne** : `planification-carte.js:1038-1046`
  - **Symptome** : Possible de creer plusieurs liens identiques source→cible avec le meme verbe
  - **Impact** : Lignes SVG superposees, `getLiensDeNoeud()` retourne des doublons
  - **Correction** : Verifier l'existence d'un lien identique avant creation
  - **Fichier** : `js/planification-carte.js`

- [x] **#131** restaurerSnapshot() ne valide pas les references (liens orphelins) ✅ CORRIGÉ (8 fév 2026)
  - **Lignes** : `planification-carte.js:1860-1878`
  - **Symptome** : Apres undo, des liens peuvent pointer vers des noeuds inexistants, et des enfants peuvent referencer un parent supprime
  - **Impact** : `dessinerLien()` echoue silencieusement (return), le lien reste en memoire sans affichage
  - **Correction** : Apres restauration, filtrer les liens dont source/cible n'existent pas, et nettoyer les references parent/enfants invalides
  - **Fichier** : `js/planification-carte.js`

- [x] **#132** chargerCarte() ne valide pas l'integrite des donnees chargees ✅ CORRIGÉ (8 fév 2026)
  - **Ligne** : `planification-carte.js:1935-2005`
  - **Symptome** : Donnees corrompues (compteur negatif, x/y = NaN, IDs invalides) sont chargees sans erreur
  - **Impact** : Canvas vide ou affichage incoherent, NaN se propage dans les calculs de layout
  - **Correction** : Ajouter validation minimale des champs critiques (type existe dans TYPES, x/y numeriques, etc.)
  - **Fichier** : `js/planification-carte.js`

- [x] **#133** Constantes GAP/PADDING/HEADER_H dupliquees en 3 fonctions (risque de divergence) ✅ CORRIGÉ (8 fév 2026)
  - **Lignes** : `planification-carte.js:1569, 1647, 1714`
  - **Symptome** : `var GAP=30; var PADDING=30; var HEADER_H=45;` defini localement dans `reLayoutConteneur()`, `reLayoutConteneurSaufDragged()` et `mettreAJourZoneConteneur()`
  - **Impact** : Si on change une valeur dans une fonction et oublie les autres, les conteneurs se chevauchent
  - **Correction** : Extraire en constante module unique `LAYOUT_CONFIG = { GAP: 30, PADDING: 30, HEADER_H: 45 }`
  - **Fichier** : `js/planification-carte.js`

- [x] **#134** afficherMenuLienExistant() affiche des doublons pour verbes non migres ✅ CORRIGÉ (8 fév 2026)
  - **Lignes** : `planification-carte.js:1291-1294`
  - **Symptome** : Si `lien.type = 'developpe'` (ancien verbe), le bouton 'developpe' ET 'se_decline_en' apparaissent dans le menu
  - **Cause** : Le verbe actuel est ajoute brut a `verbesPertinents` sans normalisation via VERBES_COMPAT
  - **Correction** : Normaliser via `VERBES_COMPAT[lien.type] || lien.type` avant insertion
  - **Fichier** : `js/planification-carte.js`

- [x] **#135** Badges non recalcules apres undo/redo ✅ CORRIGÉ (8 fév 2026)
  - **Ligne** : `planification-carte.js:1887`
  - **Symptome** : Apres un undo, les badges affichent un etat obsolete jusqu'au prochain rafraichissement
  - **Correction** : Appeler `mettreAJourTousLesBadges()` dans un `requestAnimationFrame` apres `restaurerSnapshot()`
  - **Fichier** : `js/planification-carte.js`

- [x] **#136** Position menuLien : vérifié correct (menu enfant de la zone transformée) ✅ FAUX POSITIF (8 fév 2026)
  - **Lignes** : `planification-carte.js:1260-1262, 1337-1340`
  - **Symptome** : `clientVersEspace(x, y)` convertit en coordonnees d'espace, mais le menu est positionne en absolu dans le document
  - **Impact** : Apres zoom, le menu apparait decale ou hors ecran
  - **Correction** : Positionner relativement au viewport au lieu des coordonnees espace
  - **Fichier** : `js/planification-carte.js`

### Priorite moyenne - Planification / Carte mentale (Audit 8 fév 2026)

- [x] **#137** Mode individuel non sauvegarde dans undo/redo ✅ CORRIGÉ (8 fév 2026)
  - `modeIndividuel` ajouté dans `clonerEtatPersistant()` et restauré depuis le snapshot au lieu d'être forcé à `null`

- [x] **#138** Indicateurs clone 🧬 crees en async (requestAnimationFrame) ✅ CORRIGÉ (8 fév 2026)
  - Indicateur créé synchroniquement dans `reconstruireDOM()` après `attacherEvenements()`, retiré du bloc rAF

- [x] **#139** Event listeners non nettoyes lors de suppression de noeuds ✅ FAUX POSITIF (8 fév 2026)
  - Les listeners sont attachés à l'élément DOM lui-même (pas au document). Quand `el.remove()` est appelé et qu'aucune référence ne subsiste, le GC du navigateur collecte l'élément ET ses listeners. Les listeners document temporaires (mousemove/mouseup pendant drag) sont retirés dans le handler mouseup.

- [x] **#140** Cle `planification_seances` non centralisee ✅ CORRIGÉ (8 fév 2026)
  - Constante `CLE_SEANCES` ajoutée en haut du module, 3 occurrences remplacées par `window.cle(CLE_SEANCES)`

- [x] **#141** CSS inline dans le panneau clone ✅ CORRIGÉ (8 fév 2026)
  - Styles inline du panneau clone-info extraits vers classes CSS `.planif-clone-compteur` et `.planif-clone-lien` dans styles.css

- [x] **#142** Performance O(n²) dans trouverClones() et evaluerBadge() ✅ CORRIGÉ (8 fév 2026)
  - Index inverse `_cloneIndex: Map(sourceId → Set)` maintenu via `_indexerClone()`/`_desindexerClone()`, reconstruit dans `restaurerSnapshot()`, `chargerCarte()`, `viderCanvas()`

- [x] **#143** Migration VERBES_COMPAT non appliquee au chargement ✅ CORRIGÉ (8 fév 2026)
  - Post-migration `VERBES_COMPAT` ajoutée dans `chargerCarte()` : après MIGRATION_VERBES (direction), normalise les noms restants via VERBES_COMPAT (renommage simple)

### Priorite CRITIQUE - Namespacing (Audit 5 fév 2026)

- [x] **#64** interventions.js : écriture presences sans namespace (CORRUPTION DONNÉES) ✅ CORRIGÉ (6 fév 2026)
  - **Symptôme** : `db.setSync('presences', presences)` à la ligne 1481 écrit dans la clé nue
  - **Cause** : `transfererPresencesVersModule()` lit via `cle('presences')` mais écrit dans `'presences'`
  - **Risque** : Les présences du trimestre actif sont écrites dans la mauvaise clé, invisibles aux lectures namespacées
  - **Correction** : Utiliser `db.setSync(clePresences, presences)` avec la variable déjà définie à la ligne 1415
  - **Fichier** : `js/interventions.js`

- [x] **#65** ~20 appels `db.getSync('productions', [])` sans namespace ✅ CORRIGÉ (6 fév 2026)
  - **Symptôme** : Les productions ne sont pas trouvées en contexte multi-trimestre
  - **Cause** : `productions` est dans `CLES_NAMESPACEES` mais accédé directement sans `cle()`
  - **Fichiers concernés** :
    - `js/evaluation.js` (8 occurrences : lignes 535, 1630, 1746, 2817, 2903, 3126, 3141, 3310)
    - `js/portfolio.js` (ligne 87)
    - `js/pratiques.js` (ligne 421)
    - `js/statistiques.js` (ligne 135)
    - `js/donnees-v2.js` (lignes 783, 929)
    - `js/pratiques/pratique-pan-standards.js` (lignes 159, 722, 1546)
    - `js/pratiques/pratique-sommative.js` (ligne 614)
    - `js/pratiques/pratique-pan-objectifs.js` (ligne 604)
  - **Correction** : Remplacer par `obtenirDonneesSelonMode('productions')` ou `db.getSync(cle('productions'), [])`

- [x] **#66** pratique-pan-specifications.js : `localStorage.getItem()` contourne db.js ET cle() ✅ CORRIGÉ (6 fév 2026)
  - **Symptôme** : Module PAN-Spécifications entièrement cassé en multi-trimestre
  - **Cause** : `_lireEvaluations()` et `_lireProductions()` (lignes 645, 654) lisent directement `localStorage.getItem('evaluations')` et `localStorage.getItem('productions')`
  - **Triple problème** : 1) Contourne db.js, 2) Contourne cle(), 3) Clé 'evaluations' incorrecte (devrait être 'evaluationsSauvegardees')
  - **Correction** : Remplacer par `obtenirDonneesSelonMode('evaluationsSauvegardees')` et `obtenirDonneesSelonMode('productions')`
  - **Fichier** : `js/pratiques/pratique-pan-specifications.js`

- [x] **#67** spe-specifications.js : `db.getSync('groupeEtudiants')` sans namespace ✅ CORRIGÉ (6 fév 2026)
  - **Symptôme** : `genererRecapitulatifClasseSPE()` retourne les étudiants du mauvais trimestre
  - **Cause** : Accès direct sans `cle()` ni `obtenirDonneesSelonMode()` à la ligne 537
  - **Correction** : Remplacer par `obtenirDonneesSelonMode('groupeEtudiants')`
  - **Fichier** : `js/spe-specifications.js`

### Priorite haute - Namespacing (Audit 5 fév 2026)

- [x] **#68** Fonctions dupliquées en scope global (collisions silencieuses) ✅ CORRIGÉ (6 fév 2026)
  - ✅ `echapperHtml()` : 4 doublons supprimés, canonique dans config.js
  - ✅ `afficherNotificationSucces()` : 8 doublons supprimés, canonique dans evaluation.js (signature étendue à 2 params)
  - ✅ `formaterDate()` : 3 versions consolidées → canonique dans main.js ("6 février 2026")
  - ✅ `formaterDateCourte()` : 2 versions consolidées → canonique dans main.js ("6 fév.")
  - ✅ `formaterDateComplete()` : nouvelle canonique dans main.js ("jeudi 6 février 2026"), remplace formaterDateFrancais + formaterDateLisible

- [x] **#69** Clés manquantes dans CLES_NAMESPACEES ✅ CORRIGÉ (6 fév 2026)
  - **Symptôme** : Données partagées entre trimestres au lieu d'être isolées
  - **Clés candidates** :
    - `portfoliosEleves` (portfolio.js, profil-etudiant.js)
    - `indicesEvaluation` (liste-evaluations.js, evaluation.js)
    - `indicesPatternsRaI` (profil-etudiant.js, tableau-bord-apercu.js)
    - `horaireSelectionne` (trimestre-v2.js)
    - `seancesHoraire` (~12 localisations dans calendrier-vue.js, saisie-presences.js, presences-apercu.js, horaire.js, profil-etudiant.js, migrations.js)
  - **Action** : Auditer chaque clé et ajouter à `CLES_NAMESPACEES` dans trimestres.js si elle contient des données par trimestre

- [x] **#70** 1 261 assignations `window.*` — pollution du namespace global ✅ CORRIGÉ (7 fév 2026)
  - **Résultat** : 91/93 fichiers JS encapsulés en IIFE avec `'use strict'` (2 protégés : config.js, navigation.js)
  - **71 fichiers** nouvellement wrappés, 0 erreurs de syntaxe (node -c)
  - **Corrections strict mode** : `eval` renommé `ev` dans portfolio.js, echelles.js, profil-etudiant.js
  - **Impact** : Toutes les variables/fonctions locales sont encapsulées. Seuls les exports explicites `window.X =` restent globaux

- [x] **#71** ~50 appels `localStorage.getItem()` contournant db.js ✅ CORRIGÉ (6 fév 2026)
  - **Fichiers concernés** : cc-license.js, primo-questions.js, modes.js, echelles-bibliotheque.js, grilles-bibliotheque.js, cartouches-bibliotheque.js, productions-bibliotheque.js, boite-outils.js
  - **Risque** : Contourne le memoryCache fallback de db.js (données IndexedDB retournent null) et la correction double-stringify
  - **Correction** : Remplacer par `db.getSync()` pour cohérence

- [x] **#72** Storage event listener vérifie clé non-namespacée (main.js) ✅ CORRIGÉ (6 fév 2026)
  - **Symptôme** : `window.addEventListener('storage', ...)` vérifie `e.key === 'groupeEtudiants'` (lignes 238-247)
  - **Cause** : Avec namespacing actif, la clé réelle est `h2026_groupeEtudiants`
  - **Effet** : Le listener ne se déclenche jamais, la régénération des bulles ne se fait pas
  - **Correction** : Vérifier contre `cle('groupeEtudiants')` ou vérifier si la clé contient `groupeEtudiants`

- [x] **#73** Patterns d'accès namespace incohérents ✅ CORRIGÉ (6 fév 2026)
  - **Résultat** : 136 patterns défensifs `typeof cle/window.cle` → `cle('X')` dans 24 fichiers, 0 restant
  - Phase 1 : 19 remplacements (5 fichiers backlog)
  - Phase 2 : 117 remplacements (19 fichiers supplémentaires incluant trimestre-v2, migrations, productions, etc.)
  - Guards flow-control `if (typeof cle === 'function')` dépliés dans migrations.js, horaire.js, primo-modal.js, echelles.js

### Priorite CRITIQUE - Design / CSS (Audit 5 fév 2026)

- [x] **#74** 1 855 styles inline dans les templates JS avec couleurs hardcodées ✅ CORRIGÉ (6 fév 2026)
  - **Résultat** : 1 855 → 1 776 `style=` (-79 attributs), 0 couleur hex mappée restante dans les inline styles
  - **Travail effectué** :
    - 30+ classes utilitaires ajoutées dans styles.css (u-flex-gap-*, u-p-*, u-bg-*, u-border-*)
    - Patterns info-box, badge-source, modal-js-overlay/contenu appliqués dans tous les fichiers
    - ~475 couleurs hex hardcodées remplacées par `var(--token)` CSS dans 40+ fichiers JS
    - Toutes les couleurs mappées (#032e5c, #065dbb, #666, #999, #28a745, #dc3545, #fff3cd, etc.) éliminées
    - 30 hex restantes sont des couleurs sémantiques spécifiques (palettes RàI, swatches, Primo) hors mapping
    - Tous les fichiers passent `node --check` (syntaxe valide)

- [x] **#75** 1 304 attributs style inline dans index.html ✅ CORRIGÉ (6 fév 2026)
  - **Résultat** : 1 309 → 1 138 `style=` (-171 attributs supprimés)
  - **Phase 1** : Section changelog (18 entrées) → classes `.changelog-entry--*`, `.changelog-title`, `.changelog-list`
  - **Phase 2** : Hex colors → `var(--token)`, single-property → utility classes, flex → `.u-flex-*`
  - **Non touché** : `style="display: none"` (~150 occurrences, états JS toggle)

- [x] **#76** 595 toggling `.style.display` dans 31 fichiers JS ✅ CORRIGÉ (6 fév 2026)
  - **Résultat** : 434 → 11 (423 migrés). Les 11 restants sont des `= ''` (nettoyage) ou commentés
  - **Infrastructure** : `window.toggleDisplay(el, show)` helper, `.u-hide { display: none !important; }`
  - **Phase 1** : 11 fichiers migrés + classes CSS utilitaires (info-box, badge-source)
  - **Phase 2** : 22 fichiers migrés (tous les restants), 0 `.style.display` actif pour show/hide

### Priorite haute - Design / CSS (Audit 5 fév 2026)

- [x] **#77** Couleurs Material Design hors palette « Nuit Élégante » ✅ CORRIGÉ (6 fév 2026)
  - ~35 couleurs Material Design remplacées par variables CSS dans styles.css
  - `#1976d2` → `var(--bleu-clair)`, `#2196F3` → `var(--bleu-clair)`, `#4caf50` → `var(--vert-succes)`
  - `#ff9800` → `var(--orange-accent)`, `#ffc107` → `var(--btn-annuler)`, `#9e9e9e` → `var(--gris-clair)`
  - ✅ #74 terminé — toutes les couleurs hardcodées mappées remplacées par var(--token)

- [x] **#78** box-shadow hardcodés remplacés par variables CSS ✅ PARTIEL (6 fév 2026)
  - 2 ombres `rgba(3, 46, 92, ...)` remplacées par `var(--shadow-normal)`
  - ~29 restantes sont des ombres colorées intentionnelles (vert, bleu, orange, violet) non remplaçables

- [x] **#79** border-radius incohérents (valeur 8px hors design system) ✅ CORRIGÉ (6 fév 2026)
  - 9 occurrences `border-radius: 8px` remplacées par `var(--radius-moyen)` dans styles.css

- [x] **#80** 75 déclarations `!important` dans styles.css ✅ CORRIGÉ (6 fév 2026)
  - **Résultat** : 75 → 37 `!important` (-38, -51%), 37 restants tous justifiés
  - 8 retirés sans conflit (cursor, padding, color, textarea, note-plafonnée, wizard-toggle)
  - 17 retirés par spécificité suffisante (carte accordeon, #reglages-trimestre, IDME, maintenance)
  - 7 retirés par ajustement de sélecteur (summary.summary-materiel, .tableau .td-center-*)
  - 6 retirés : matrice-tableau textarea (redondants avec base)
  - 37 conservés : 3 utilitaires, 3 media queries, 26 toggles JS, 5 overrides inline styles

- [x] **#81** Validation primo avec styles inline au lieu de classes CSS ✅ CORRIGÉ (6 fév 2026)
  - Classes `.primo-champ-vide` et `.primo-champ-rempli` créées dans styles.css
  - `primo-validation-champs.js` utilise maintenant `classList.add/remove` au lieu de `.style.*`

- [x] **#82** Tokens badges Tetris non définis dans styles.css :root ✅ CORRIGÉ (6 fév 2026)
  - `--badge-padding`, `--badge-font-size`, `--badge-border-radius` ajoutés dans `:root`

- [x] **#83** En-tête styles.css indique « Beta 0.60 » (obsolète) ✅ CORRIGÉ (6 fév 2026)
  - Mis à jour vers « Beta 97 / 06-02-2026 »

- [x] **#84** Documentation design system : mode « assiste » vs « simulation » ✅ CORRIGÉ (6 fév 2026)
  - **Résultat** : 7 occurrences `[data-mode="assisté"]` → `[data-mode="simulation"]` dans 3 modules DS
  - Fichiers corrigés : 01a-palette-couleurs.html (4), 03b-cartes-sidebars.html (1), 04a-navigation.html (2)
  - Archives (_archives/) laissées telles quelles (documents historiques)

### Bugs CRITIQUES (Audit complet 5 fév 2026)

- [x] **#85** BUG CRITIQUE : Clé productions incohérente — `productionsPedagogiques` vs `productions` ✅ CORRIGÉ (6 fév 2026)
  - **Symptôme** : Les productions créées dans productions.js sont invisibles pour 15+ autres modules
  - **Cause** : `productions.js` écrit via `getCleProductions()` → `cle('productionsPedagogiques')` → clé `'productionsPedagogiques'`. Mais `evaluation.js`, `portfolio.js`, `statistiques.js`, etc. lisent depuis `'productions'` ou `obtenirDonneesSelonMode('productions')` — une clé complètement différente
  - **Fichiers lecteurs (mauvaise clé)** : evaluation.js (9x), portfolio.js, statistiques.js, rapport-bug.js (2x), donnees-v2.js (2x), pratiques.js, pratique-pan-standards.js (3x), pratique-pan-objectifs.js, pratique-sommative.js, cc-license.js, pratique-notation-v2.js
  - **Impact** : Évaluations, portfolio, statistiques ne trouvent aucune production
  - **Correction** : Unifier sur UNE seule clé canonique et mettre à jour tous les lecteurs

- [x] **#86** BUG CRITIQUE : Suppression demo peut effacer des productions réelles ✅ CORRIGÉ (6 fév 2026)
  - **Symptôme** : `supprimerGroupe9999()` filtre par `!p.id?.startsWith('PROD_')` — un préfixe aussi utilisé pour les vraies productions
  - **Fichier** : `js/donnees-demo.js` ligne 430
  - **Impact** : Déchargement du mode démo peut supprimer des productions utilisateur
  - **Correction** : Filtrer uniquement `estDemo: true` ou utiliser un préfixe spécifique `PROD_DEMO_`

- [x] **#87** BUG CRITIQUE : obtenirHeuresSeance() retourne toujours 2 (code mort) ✅ CORRIGÉ (6 fév 2026)
  - **Symptôme** : Assiduité incorrecte pour les cours non-2h (3h, 4h, etc.)
  - **Fichier** : `js/saisie-presences.js` ligne 804
  - **Cause** : La fonction calcule minutieusement totalHeures (lignes 772-801) puis `return 2;` ignore tout
  - **Impact** : Étudiants en cours 4h peuvent afficher 200% ou 50% au lieu de 100%
  - **Correction** : Retourner `totalHeures` au lieu du hardcodé, ou documenter que seules les périodes sont utilisées

- [x] **#88** BUG CRITIQUE : Format presences incohérent (Array vs Object) entre modules ✅ CORRIGÉ (6 fév 2026)
  - **Symptôme** : Migrations silencieusement ignorées, TypeError potentiel
  - **Cause** : `migrations.js:116` et `donnees-demo.js:238` lisent comme Object `{}`, `saisie-presences.js` lit comme Array `[]`
  - **Impact** : `migrerPresencesVersPeriodes()` ne s'exécute jamais si format Object, `Object.keys()` donne des indices numériques sur un Array
  - **Fichiers** : migrations.js, donnees-demo.js, saisie-presences.js, cours.js
  - **Correction** : Normaliser sur un format unique (Array), ajouter détection de format dans les migrations

- [x] **#89** BUG CRITIQUE : Collisions d'ID avec Date.now() seul ✅ CORRIGÉ (6 fév 2026)
  - **Symptôme** : Clics rapides produisent des IDs identiques → données écrasées
  - **Fichiers et lignes** :
    - `evaluation.js:1794` → `'EVAL_' + Date.now()`
    - `grilles.js:369,389` → `'CR' + Date.now()` (dans une boucle!)
    - `cartouches.js:434` → `'CART' + Date.now()`
    - `groupe.js:203` → `Date.now()` nu
    - `productions.js:545` → `'PROD' + Date.now()`
    - `interventions.js:129` → `` `intervention-${Date.now()}` ``
  - **Patron correct existant** : `evaluation-jetons.js:299` utilise `Date.now() + '_' + Math.random().toString(36).substr(2,5)`
  - **Correction** : Créer un utilitaire `generateId(prefix)` et standardiser

### Bugs HAUTE priorité (Audit complet 5 fév 2026)

- [x] **#90** Mauvais noms de clés dans plusieurs modules (retournent toujours vide) ✅ CORRIGÉ (6 fév 2026)
  - **donnees-v2.js** : `${trim.id}_evaluations` au lieu de `${trim.id}_evaluationsSauvegardees` (6 emplacements : lignes 797, 824, 875, 943, 974, 1020) → compteurs d'usages toujours à 0, suppressions non protégées
  - **rapport-bug.js** : `'grillesCriteres'` (ligne 467) et `'echellesPerformance'` (ligne 470) n'existent pas → contexte bug incomplet
  - **cours.js** : `'evaluationsDetaillees'` (ligne 1025) n'existe pas → avertissement de suppression affiche "0 évaluations"
  - **pratique-configurable.js** : `'evaluations'` avec default `{}` (ligne 117) → calculs toujours à 0
  - **Correction** : Remplacer par les bonnes clés (`evaluationsSauvegardees`, `grillesTemplates`, `echellesTemplates`)

- [x] **#91** calculerAssiduiteJusquADate() ne filtre pas par DA pour les dates ✅ CORRIGÉ (6 fév 2026)
  - **Fichier** : `js/saisie-presences.js` lignes 269-276
  - **Symptôme** : `datesSaisies` inclut les dates de TOUS les étudiants, pas seulement l'étudiant cible
  - **Impact** : Un étudiant est compté absent pour des dates où seuls d'autres étudiants ont des données
  - **Comparaison** : `calculerAssiduiteSommative()` (lignes 97-102) filtre correctement par DA d'abord
  - **Correction** : Filtrer `presencesFiltrees` par DA avant de construire `datesSaisies`

- [x] **#92** evaluations-apercu.js divise totalC par nbTotal au lieu de nbAvecDonnees ✅ CORRIGÉ (6 fév 2026)
  - **Fichier** : `js/evaluations-apercu.js` ligne 94
  - **Symptôme** : `Math.round(totalC / nbTotal)` divise par TOUS les étudiants au lieu de ceux avec données
  - **Impact** : Taux de complétion affiché trop bas (ex: 5/25=20% au lieu de 5/5=100%)
  - **Correction** : Remplacer `nbTotal` par `nbAvecDonnees`

- [x] **#93** Mode « recents-meilleurs » utilise reverse() au lieu de trier par date ✅ CORRIGÉ (6 fév 2026)
  - **Fichier** : `js/profil-etudiant.js` lignes 911-928
  - **Symptôme** : `.reverse()` inverse l'ordre par note, ne trie PAS par date
  - **Impact** : Sélectionne les pires notes du top 50% au lieu des plus récentes → affecte la note finale
  - **Comparaison** : `portfolio.js` ligne 63 trie correctement par `dateRemise`, `pratique-pan-standards.js:138` par `dateEvaluation`
  - **Aussi** : Mode `recents` (ligne 911) a le même problème
  - **Correction** : Remplacer `.reverse()` par `.sort((a, b) => new Date(b.dateRemise) - new Date(a.dateRemise))`

- [x] **#94** Demo : race condition et nettoyage cible le mauvais trimestre ✅ CORRIGÉ (6 fév 2026)
  - **donnees-demo.js:58-106** : `chargerDonneesDemo()` change temporairement le trimestre actif (async) → tout module synchrone qui lit `cle()` pendant ce temps voit le mauvais trimestre
  - **donnees-demo.js:383-437** : `supprimerGroupe9999()` utilise `window.cle()` mais le trimestre actif peut ne plus être demo → nettoie les vraies données
  - **Correction** : Passer le préfixe `demo_` explicitement au lieu de changer le trimestre actif

- [x] **#95** Éléments DOM référencés mais absents de index.html ✅ CORRIGÉ (6 fév 2026)
  - **pratiques.js:550** : `getElementById('pratiqueNotation').value` sans null check → crash
  - **cours.js:249-250** : `getElementById('nombreCours')` et `getElementById('resumeCours')` n'existent pas → crash
  - **evaluation.js:2774** : `getElementById('tri-evaluations')` n'existe pas → crash
  - **Correction** : Ajouter les éléments dans index.html ou ajouter des null checks

- [x] **#96** donnees-v2.js : `localStorage.removeItem` au lieu de `db.remove` ✅ CORRIGÉ (6 fév 2026)
  - **Fichier** : `js/donnees-v2.js` ligne 1411
  - **Symptôme** : `localStorage.removeItem('cartouches_${grilleId}')` ne supprime que du localStorage, pas d'IndexedDB
  - **Impact** : Les cartouches réapparaissent après rechargement
  - **Correction** : Utiliser `db.remove()` ou `db.removeSync()`

- [x] **#97** portfolio.js : `event.target.checked` sans paramètre event ✅ CORRIGÉ (6 fév 2026)
  - **Fichier** : `js/portfolio.js` ligne 330
  - **Symptôme** : `toggleArtefactPortfolio(da, portfolioId, nombreARetenir)` utilise `event` qui n'est pas un paramètre
  - **Impact** : En mode strict, ReferenceError. Sinon, le checkbox n'est pas décoché quand on dépasse le max
  - **Correction** : Ajouter `event` comme paramètre de la fonction

- [x] **#98** evaluation.js : lecture structure SOM/PAN obsolète ✅ CORRIGÉ (6 fév 2026)
  - **Fichier** : `js/evaluation.js` lignes 3050-3051
  - **Symptôme** : `indicesCPEtudiant?.[pratique]` cherche des sous-branches SOM/PAN, mais depuis Beta 95.5 la structure est plate
  - **Impact** : Taux de complétion utilise toujours le fallback, jamais la valeur autoritative
  - **Correction** : Lire `indicesCPEtudiant?.C` directement

### Bugs MOYENNE priorité (Audit complet 5 fév 2026)

- [x] **#99** donnees-v2.js : 11 blocs catch silencieux « // Ignorer » ✅ CORRIGÉ (6 fév 2026)
  - **Fichier** : `js/donnees-v2.js` (lignes 789, 804, 831, 855, 882, 913, 934, 949, 980, 1001, 1026)
  - **Impact** : Erreurs de données complètement masquées, diagnostic impossible
  - **Correction** : Remplacer par `console.warn('[donnees-v2] Erreur calcul usages:', e.message)`

- [x] **#100** cartouches.js et statistiques.js : clé legacy `niveauxEchelle` ✅ CORRIGÉ (6 fév 2026)
  - **cartouches.js:425** : `await db.get('niveauxEchelle')` — clé obsolète
  - **statistiques.js:144** : `db.getSync('niveauxEchelle', [])` — clé obsolète
  - **Impact** : Utilise le fallback IDME hardcodé au lieu de l'échelle configurée par l'utilisateur
  - **Correction** : Lire depuis `'echellesTemplates'` et extraire les niveaux de l'échelle active

- [x] **#101** Math.random() pour clé d'anonymisation (non cryptographique) ✅ CORRIGÉ (6 fév 2026)
  - **Fichier** : `js/trimestres.js` lignes 1106-1109
  - **Impact** : Clés prédictibles pour anonymiser les DA (données personnelles)
  - **Correction** : Utiliser `crypto.getRandomValues()` (Web Crypto API native)

- [x] **#102** import-export.js : risque double-stringify multi-cycles ✅ CORRIGÉ (6 fév 2026)
  - **Fichier** : `js/import-export.js` ligne 238
  - **Cause** : `JSON.stringify(valeur)` sur des données déjà parsées → double stringification
  - **Impact** : Exports/imports multiples créent des niveaux d'imbrication croissants
  - **Correction** : `typeof valeur === 'string' ? valeur : JSON.stringify(valeur)`

- [x] **#103** Export n'exclut pas toutes les données demo ✅ CORRIGÉ (6 fév 2026)
  - **Fichier** : `js/import-export.js` lignes 207-239
  - **Impact** : Productions et évaluations demo incluses dans les sauvegardes utilisateur
  - **Correction** : Ajouter filtrage demo pour `*_productions`, `*_evaluationsSauvegardees`, `cartouches_*`

- [x] **#104** entites-ui.js : `setTimeout(initialiserEntitesUI, 500)` fragile ✅ CORRIGÉ (6 fév 2026)
  - **Fichier** : `js/entites-ui.js` ligne 125
  - **Impact** : Trop lent sur appareils rapides, possiblement insuffisant sur iPad
  - **Correction** : Utiliser le pattern `db-ready` comme les autres modules

- [x] **#105** trimestres.js : `calculerStatistiquesFinales` lit le mauvais trimestre ✅ CORRIGÉ (6 fév 2026)
  - **Fichier** : `js/trimestres.js` lignes 646-695
  - **Cause** : `obtenirDonneesSelonMode('groupeEtudiants')` lit le trimestre ACTIF, pas celui archivé
  - **Impact** : Statistiques d'archive calculées avec les données du mauvais trimestre
  - **Correction** : Lire directement depuis `${trimestreId}_groupeEtudiants`

- [x] **#106** liste-evaluations.js : complétion inclut évaluations remplacées et hors-type ✅ CORRIGÉ (6 fév 2026)
  - **Fichier** : `js/liste-evaluations.js` lignes 93-111
  - **Impact** : Complétion > 100% possible (cappée par Math.min), reprises comptées double
  - **Correction** : Filtrer `!e.remplaceeParId` et compter les `productionId` distincts

- [x] **#107** Math.pow(négatif, 1/3) → NaN dans calcul engagement ✅ CORRIGÉ (6 fév 2026)
  - **Fichiers** : `js/portfolio.js:648-649`, `js/profil-etudiant.js:434-435`
  - **Impact** : Si indice A, C ou P négatif (données corrompues), tout le calcul E retourne NaN
  - **Correction** : Utiliser `Math.cbrt(E_brut)` ou `Math.max(0, E_brut)` avant la racine cubique

- [x] **#108** obtenirTendance() assume que les évaluations sont triées par date ✅ CORRIGÉ (6 fév 2026)
  - **Fichier** : `js/evaluation.js` lignes 3389-3399
  - **Impact** : `evaluations[0]` n'est pas forcément la plus récente → tendance potentiellement inversée
  - **Correction** : Trier par date avant de comparer

### Priorite haute - UX / Interface

- [x] **#39** Courbes de distribution (densite) des indices ACPE ✅ FAIT (25 jan 2026)
  - Objectif : Visualiser la distribution des etudiants selon les indices A, C, P, E
  - Type : Courbe de densite (style Gauss) avec les 4 indices superposes
  - Couleurs : A=bleu, C=orange, P=vert, E=violet (coherence avec graphiques existants)
  - Emplacement : Tableau de bord, section Vue d'ensemble (apres graphique spaghetti)
  - Fonction creee : `creerGraphiqueDistributionACPE(canvasId)`
  - Algorithme : KDE (Kernel Density Estimation) avec regle de Silverman
  - **Fichiers modifies** : `index.html`, `js/graphiques-progression.js`, `js/tableau-bord-apercu.js`

- [x] **#30** Export PDF des elements pedagogiques ✅ CORRIGÉ (25 jan 2026)
  - [x] Grilles descriptives (grille + echelle + cartouche) avec jsPDF
  - [x] Formulaire preparation 2 etapes (selection contenu → apercu mise en page)
  - [x] Nouvelle disposition : cours/trimestre en haut a droite, enseignant en bas a gauche
  - [x] Options simplifiees : orientation, checkbox trimestre, pied de page (enseignant, licence CC)
  - [x] Marges reduites (0.5 inch)
  - [x] Fonctions SST : obtenirInfosCoursPDF(), obtenirNomEnseignantPDF()
  - [x] **Bug corrigé** : Infos cours/enseignant maintenant affichées
    - **Cause** : `window.trimestreActif` vide, pas de fallback
    - **Fix** : Utilisation de `obtenirTrimestreActif()` + fallbacks multiples
    - En-tête : code cours, nom cours, trimestre
    - Pied de page : nom enseignant, licence CC BY-NC-SA
  - [ ] **Ajustements futurs (optionnel)** :
    - Productions : liste des travaux
    - Echelles seules

### Bugs critiques

- [x] **#49** Import CSV Omnivox : colonne SA non reconnue + accents mal gérés (Jordan, 18 jan) ✅ CORRIGÉ (1er fév 2026)
  - **Problème 1** : Accents corrompus → Encodage Windows-1252 au lieu de UTF-8
  - **Problème 2** : Colonne SA non détectée → Position flexible (col 5 ou 6)
  - **Fichier modifié** : `js/trimestre-v2.js`

- [x] **#50** Primo : configuration incomplète après wizard (Bruno & Olivier, 5-6 jan) ✅ CORRIGÉ (1er fév 2026)
  - **Symptôme** : Jour de la semaine du cours pas configuré après Primo
  - **Cause** : `creerHoraireDansBanquePrimo()` lisait `reponses['horaireHebdomadaire']` (toujours vide)
  - **Correction** : Lecture depuis `cle('horaireHebdo')` (créé par creerSeancesHoraire)
  - **Fichier modifié** : `js/primo-modal.js`

- [x] **#51** Création horaire : permettre heures non piles (Bruno, 5 jan) ✅ CORRIGÉ (1er fév 2026)
  - **Symptôme** : Cadre-horaire limité aux heures piles (8h00, 9h00...)
  - **Correction** : Dropdown remplacé par `<input type="time">` avec step 5 min
  - **Fichier modifié** : `index.html`

- [x] **#52** Erreurs null dans objectifs.js et trimestre-v2.js (Jordan, 18 jan) ✅ DÉJÀ CORRIGÉ (Beta 95.5)
  - **Erreur 1** : `Cannot set properties of null (setting 'innerHTML')` - objectifs.js:73
  - **Erreur 2** : `Cannot set properties of null (setting 'value')` - trimestre-v2.js:3463
  - **Correction** : Vérifications `if (!element) return;` ajoutées dans les deux fichiers

- [x] **#53** Menu "Format horaire" ne se met pas à jour automatiquement (Olivier, 6 jan) ✅ CORRIGÉ (1er fév 2026)
  - **Symptôme** : Options statiques ne reflétaient pas le nb d'heures choisi
  - **Correction** : Fonction `mettreAJourOptionsFormatHoraire()` génère les diviseurs dynamiquement
  - **Fichiers modifiés** : `index.html`, `js/trimestre-v2.js`

- [x] **#54** UX : Message "Partage impossible" trop peu visible (Grégoire, 30 jan) ✅ DÉJÀ CORRIGÉ
  - **Analyse** : Le message est déjà en rouge (fond #f8d7da, bordure #dc3545, texte #721c24)
  - **Fichier** : `js/import-export.js` ligne 802-810

- [x] **#56** Nommage exports avec horodatage complet (Grégoire, 31 jan) ✅ CORRIGÉ (1er fév 2026)
  - **Format** : `sauvegarde-monitorage-YYYY-MM-DD-HH-MM-SS.json`
  - **Correction** : Horodatage complet ajouté dans `js/import-export.js` ligne 252

- [x] **#57** Erreur console lors suppression grilles (Gregoire, 1er fév) ✅ CORRIGÉ (1er fév 2026)
  - **Symptôme** : Bouton supprimer grille inactif, grilles impossibles à retirer
  - **Erreur** : `null is not an object (evaluating 'document.getElementById('optionsImportExportGrilles').style')`
  - **Cause** : Élément `#optionsImportExportGrilles` supprimé en Beta 92 mais code y référait encore
  - **Correction** : Suppression des lignes 3614 et 3625 dans `js/grilles.js`

- [x] **#58** Import productions non détectées (Gregoire, 1er fév) ✅ CORRIGÉ (1er fév 2026)
  - **Symptôme** : "Aucune production n'a été importée" malgré présence dans le fichier
  - **Cause** : Fonctions d'import/export ne cherchaient que dans `productions` ou `bibliothequeProductions`, pas les clés namespacées `*_productions`
  - **Correction** : Support des clés namespacées dans 4 fonctions de `js/import-export.js`
    - `analyserRessourcesDetaillees()`, `executerImportSelectif()`, `executerImportVersBibliotheques()`, `exporterConfigurationComplete()`

- [x] **#59** Horaires non trouvés - aperçu présences vide (Gregoire, 1er fév) ✅ CORRIGÉ (1er fév 2026)
  - **Symptôme** : Aperçu présences vide, compte de semaines incorrect (horaireActif: non défini)
  - **Cause** : Clé `horaires` dans `CLES_NAMESPACEES` mais lue depuis `'horaires'` au lieu de `cle('horaires')`
  - **Correction** : Utilisation de `cle('horaires')` dans 4 fichiers :
    - `js/horaire.js`, `js/entites-ui.js`, `js/trimestre-v2.js`, `js/migrations.js`

- [x] **#60** Cours A25 sauvegardé comme H2026 (Gregoire, 1er fév) ✅ CORRIGÉ (1er fév 2026)
  - **Symptôme** : Nouveau cours pour A2025 non visible (créé sous H2026)
  - **Cause** : `reinitialiserFormCoursV2()` forçait session='H' sans définir l'année
  - **Correction** : Extraction session/année depuis `obtenirTrimestreActif()` dans `js/trimestre-v2.js`

- [x] **#61** Section Trimestre tronquée sur iPad (Gregoire, 1er fév) ✅ CORRIGÉ (1er fév 2026)
  - **Symptôme** : Dates et boutons coupés à droite sur iPad Safari
  - **Cause** : Grilles CSS 2 colonnes fixes sans responsive pour tablettes
  - **Correction** : Media queries pour `layout-sidebar-2col`, `grille-2col`, section `#reglages-trimestre`
  - **Fichier modifié** : `styles.css`

- [x] **#62** Erreur "reglages-horaire introuvable" (Tous rapports, 1er fév) ✅ CORRIGÉ (1er fév 2026)
  - **Symptôme** : Erreur console au démarrage
  - **Cause** : Sous-section renommée `reglages-horaire-legacy` en Beta 95, références obsolètes
  - **Correction** : Mise à jour des références vers `reglages-trimestre` dans 4 fichiers
    - `js/guidage.js`, `js/saisie-presences.js`, `index.html`, `js/primo-validation-champs.js`

- [x] **#63** FR: Supprimer pratiques hors-bibliothèque (Gregoire, 1er fév) ✅ IMPLÉMENTÉ (1er fév 2026)
  - **Demande** : Pouvoir supprimer des pratiques depuis la section "Disponibles à ajouter"
  - **Solution** : Bouton "Supprimer" ajouté dans le modal Bibliothèque de pratiques
  - **Nouvelle fonction** : `supprimerPratiqueHorsBibliotheque()` dans `js/pratiques.js`

- [x] **#55** Pratique configurable non trouvée dans le registre ✅ CORRIGÉ (31 jan 2026)
  - **Symptôme** : Erreur `❌ Pratique "pratique-1768910384608" non disponible dans le registre`
  - **Cause 1** : `obtenirPratiqueParId()` ne cherchait pas dans `pratiquesConfigurables`
  - **Cause 2** : Les pratiques créées via wizard ont une structure différente (ID/échelle à la racine, pas dans `config`)
  - **Solution** : Nouvelle fonction `construireConfigComplete()` qui normalise les deux formats
    - Fusionne les champs racine + config interne
    - Charge l'échelle par ID depuis `echellesTemplates` si non embarquée
    - Fallback vers échelle IDME par défaut si référence introuvable
  - **Fichier modifié** : `js/pratiques/pratique-registre.js`

- [x] **#37** Incoherence indice P vs Note finale (tableau de bord) ✅ CORRIGÉ (25 jan 2026)
  - **Symptome** : Élève-021 affiche P=50% dans le tableau de bord mais Note finale=59% dans son profil
  - **Cause** : L'indice P était calculé avec TOUTES les évaluations (via `pratique.calculerPerformance()`)
    alors que la Note finale utilisait la méthode de sélection configurée
  - **Solution** : `calculerEtStockerIndicesCP()` utilise maintenant `calculerDetailsNoteFinale()`
    - L'indice P reflète la vraie note finale de session
    - Respecte la méthode de sélection (meilleurs, récents, récents-meilleurs)
    - Respecte les pondérations portfolio/terminale
    - Applique les règles de conformité (plafonnement)
  - **Fichiers modifiés** :
    - `js/portfolio.js` : `calculerEtStockerIndicesCP()` utilise `calculerDetailsNoteFinale()`
    - `js/profil-etudiant.js` : Export de `calculerDetailsNoteFinale` pour accès global

### Documentation / Aide

- [ ] **#2** Guide PDF pour utilisateurs — reformulé 11 mai 2026
  - **Périmètre original** (jan 2026, avant le projet de cohorte) : guide générique 10-15 pages, version imprimable de la section Aide.
  - **Périmètre actuel** : à fusionner avec le matériel pédagogique de la cohorte CoP — chaque rencontre (8 au total, sept 2026 → avril 2027) produit son propre document d'accompagnement. Voir `docs/CALENDRIER.md` §8.3 « Documentation à produire ».
  - **Décision** : ne pas produire un guide générique monolithique. Le matériel pédagogique par rencontre est plus utile et a un public cible défini.
  - **Hors scope** : la version « papier » pour AQPC peut être dérivée de `docs/securite/SECURITE-POUR-ENSEIGNANTS.md` (à écrire post-Défense E) plutôt que d'un guide complet.

- [x] **#10** Mettre a jour section AIDE ✅ FAIT (26 jan 2026)
  - Notes de version Beta 96 ajoutées
  - Notes de version Beta 95.3-95.7 consolidées
  - Section Introduction et Configuration à jour

- [x] **#11** Message "Nouveautes de la beta" automatise ✅ FAIT (10 fev 2026)
  - Pastille rouge accueil, modale changelog couleur-codee, bandeau vert mise a jour, polling version.json, persistance localStorage

- [ ] **#18** Tooltips d'aide au survol — déploiement progressif par zone
  - **Mécanisme** : attributs `data-tooltip="cle"` + moteur `tooltips.js` + base `tooltips-contenu.js`
  - **Plans de travail** : `plans de travail pour Claude Code/Plan_Implementation_Tooltips.md` (plan maître)
  - **Corrections style** : Placement latéral (droite→gauche→bas→haut), flèche triangle 12px, marge 4px, masquage clic/Escape, surbrillance orange pulsante
  - **Complété** : En-tête (10), Réglages Trimestre (29), Préférences (12), Dépistage (14), Données (14), **Évaluations** (13 mai 2026 : 1 câblage orphelin + 4 nouvelles clés `eval-btn-sauvegarder`, `eval-profil-rapide`, `eval-btn-regenerer-retro`, `eval-affichage-note-choix`) = 79 → 84 clés actives
  - **Futur** : Planification, Présences, Construction de la note, Tableau de bord, Boîte à outils, Aide
  - **Cleanup zéro-dette (13 mai)** : module `js/evaluations-apercu.js` (148 l.) supprimé — jamais appelé, IDs `ea-*` jamais présents dans index.html. 7 clés tooltips orphelines retirées (eval-apercu, eval-stats-groupe, eval-taux-completion, eval-productions-configurees, eval-productions-realisees, eval-travaux-importes, eval-travaux-preparation) + entrée `'evaluations-apercu'` dans guidage-demo.js retirée.

- [x] **#43** Apercu avant impression fidele au PDF final ✅ FAIT (28 jan 2026)
  - Correction des en-têtes de niveaux : fond blanc comme le PDF (au lieu de gris)
  - Alignement des styles avec le rendu PDF final
  - **Fichier modifie** : `js/export-pdf.js`

- [x] **#44** Effet 3D sur les bulles du tableau de bord ✅ FAIT (28 jan 2026)
  - Ombre décentrée simulant lumière latérale gauche→droite
  - Dégradé de fond pour profondeur
  - Highlight inset pour reflet
  - **Fichier modifie** : `styles.css` (classe `.barre-etudiant`)

- [x] **#45** Animation des bulles animees de l'entete ✅ FAIT (28 jan 2026)
  - Effet 3D harmonisé avec les bulles du tableau de bord
  - Dégradés de couleur pour chaque pratique (SOM, STD, SPE, DEN)
  - Ombre décentrée et highlights inset ajoutés
  - **Fichier modifie** : `index.html` (section styles bulles)

- [x] **#40** Boutons d'aide dans les modals de bibliothèques ✅ FAIT (28 jan 2026)
  - Ajout du bouton 😎 dans les 5 bibliothèques (grilles, échelles, cartouches, pratiques, productions)
  - Contenu d'aide expliquant les badges (Locale/Bibliothèque/Retirée) et les boutons
  - **Fichiers modifiés** : `js/aide-contextuelle-contenu.js`, `js/grilles.js`, `js/echelles.js`, `js/cartouches.js`, `js/pratiques-materiel.js`, `js/productions.js`

- [x] **#41** Uniformiser présentation visuelle des sidebars ✅ FAIT (28 jan 2026)
  - Style uniforme pour les boutons "Consulter la bibliothèque" (font-size: 0.9rem)
  - Classe `.sidebar-vide` pour messages vides (remplace `.banque-vide`)
  - **Fichiers modifiés** : `index.html`, `styles.css`

- [x] **#42** Uniformiser présentation visuelle des bibliothèques ✅ FAIT (28 jan 2026)
  - Badges de source (Locale/Bibliothèque/Retirée) ajoutés aux 4 bibliothèques
  - Affichage ID court (#XXXX) pour identifier les éléments
  - Détection de doublons potentiels avec avertissement
  - **Fichiers modifiés** : `js/grilles.js`, `js/echelles.js`, `js/cartouches.js`, `js/productions.js`

- [x] **#46** Corrections visuelles Beta 96.1 ✅ FAIT (28 jan 2026)
  - Z-index modal d'aide : 10002 (au-dessus des bibliothèques à 10000)
  - Doublon bouton "Consulter la bibliothèque" dans cartouches supprimé
  - Bouton "Préparer le PDF" ajouté à la section Productions
  - Footer PDF : espacement corrigé, nom enseignant correctement affiché
  - Effet 3D appliqué aux bulles de niveau dans les tableaux (classe `.bulle-niveau-tableau`)
  - **Fichiers modifiés** : `index.html`, `styles.css`, `js/export-pdf.js`, `js/profil-etudiant.js`

### Recherche / Analyse longitudinale

- [ ] **#35** Import historique H2024 (trimestre implementation portfolio)
  - **Contexte** : Premier trimestre du portfolio, pratique sommative uniquement
  - **Donnees disponibles** : TSV artefacts, etudiants, evaluations
  - **Caracteristiques** : Pas de PAN, pas de RaI, pas de patterns
  - **Objectif** : Avoir le baseline complet pour comparaison longitudinale
  - **Processus** : Meme methode que A2024 (scripts d'import console)
  - **Livrable** : Trimestre h2024 archive dans l'application

- [ ] **#36** Rapport comparatif inter-trimestres
  - **Objectif** : Comparer les trimestres pour valider le systeme et analyser la pratique
  - **Trimestres** : H2024, A2024, A2025, H2026
  - **Indicateurs** : A, C, P, E, patterns, niveaux RaI (quand disponibles)
  - **Variables systeme** : +Portfolio (H24), +PAN (A25), +RaI (A25), +Patterns (A25)
  - **Variables pratique** : Nombre d'artefacts, interventions, abandons
  - **Questions de recherche** :
    - Impact du RaI sur les interventions et les resultats ?
    - Impact de la reduction du nombre d'artefacts sur P ?
    - Evolution des patterns entre cohortes ?
  - **Hypothese principale** : L'introduction de la RaI (A25) a rendu l'enseignant plus proactif
    - Chaine causale : RaI → niveaux/patterns visibles → interventions precoces → moins de decrochages → meilleures moyennes
    - A valider : comparer taux de decrochage et moyennes finales A24 (sans RaI) vs A25+ (avec RaI)
    - Potentiel : communication AQPC si resultats concluants
  - **Variable confondante** : Profil des etudiants
    - A25 : beaucoup d'eleves en sciences (meilleurs resultats attendus)
    - Documenter le profil (programme d'etudes) par trimestre pour nuancer les conclusions
    - **Donnees disponibles** : programmes dans l'application et/ou tableurs sources
  - **Format** : Rapport genere (PDF ou markdown) avec tableaux et graphiques
  - **Prerequis** : #35 (Import H2024) pour avoir les 4 trimestres

- [ ] **#245** Interventions N3 dans le profil etudiant — progression temporelle
  - **Contexte** : Les interventions de niveau 3 (individuelles, 1 seul eleve) ne sont pas significatives au niveau du groupe
  - **Objectif** : Afficher l'effet des interventions N3 dans le graphique de progression temporelle du profil etudiant
  - **Approche** : Marqueur sur la courbe P individuelle + delta P avant/apres
  - **Prerequis** : Graphique de progression individuel existant dans le profil etudiant

- [x] **#246** Uniformiser le style de tous les graphiques Chart.js ✅ LIVRÉ (13 mai 2026)
  - `STYLE_GRAPHIQUE` global ajouté à `js/couleurs.js` : tooltip standardisé + helper `couleurs()` retournant `{texte, grille, grilleForte}` thème-aware (mode clair/sombre)
  - 4 modules de chart alignés via `Object.assign({}, window.STYLE_GRAPHIQUE.tooltip || fallback, overrides)` :
    - graphiques-progression.js : STYLE_TOOLTIP local délégué (préserve les ~10 spreads `...STYLE_TOOLTIP`)
    - correlations-longitudinales.js : tooltip refactorisé
    - impact-jetons.js : idem
    - bilan-reflexif.js : tooltips standardisés (2 sites, avant aucun style — fond Chart.js default blanc/gris)
  - Fallback inline préservé si STYLE_GRAPHIQUE absent (résilience ordre de chargement)

- [ ] **#241** Analyser l'impact des jetons de reprise sur P dans les courbes d'intervention
  - **Contexte** : Quand un étudiant utilise un jeton de reprise, P change rétroactivement. Cela peut masquer l'effet réel d'une intervention pédagogique.
  - **Objectif** : Marquer les séances où des jetons ont été utilisés et/ou calculer un P « sans reprises » pour isoler l'effet net.
  - **Prérequis** : Comprendre la mécanique de recalcul de P après utilisation d'un jeton.

- [x] **#242** Ajouter la documentation du graphique « Dynamique des correlations » dans les info-bulles ✅ LIVRÉ (13 mai 2026)
  - Nouvelle entrée `labo-correlations-longitudinales` dans accompagnement-contenu-hover.js (section Labo > Études)
  - Tooltip couvre : corrélation Pearson (r, axe gauche), points carrés ■ (séances avec dépôt), triangles ▼ (interventions), courbes P·[intervention] / P contrôle (axe droit %)
  - `data-tooltip` ajouté sur le wrapper canvas (index.html L8833)

### Planification pedagogique

- [x] **#34** Module Planification — Phase 2 : Enseignement explicite ✅ LIVRÉ (10 fév 2026)
  - **Phase 1 LIVRÉE** (7 fév 2026) : Carte mentale intégrée dans l'app (voir #123)
  - **Phase 2 LIVRÉE** (10 fév 2026) : Organisateur — sous-onglet indépendant de Planification
    - Objectif auto-dérivé (éditable), prérequis, productions associées
    - Enseignement explicite 5 étapes avec drag-drop des activités
    - Exports élève/enseignant en TXT et MD
    - Vue calendrier intégrée
  - **Fichiers créés** : `js/organisateur.js` (1354 lignes), HTML + CSS
  - **Fichiers modifiés** : `config.js`, `navigation.js`, `planification-carte.js`, `planification.js`, `index.html`, `styles.css`

- [ ] **#140** Organisateur — Refonte layout deux colonnes
  - **Problème** : Layout vertical actuel nécessite trop de scroll
  - **Solution** : Colonne gauche (vue d'ensemble leçon) + panneau droit (détail contextuel)
  - **Panneau droit** : 3 modes — Détail activité, Enseignement explicite, Vue calendrier
  - **Responsive** : Empilage vertical sous 900px
  - **Plan complet** : `plans de travail/PLAN-ORGANISATEUR-LAYOUT.md` (déplacé depuis docs/ le 8 mai 2026)
  - **Prérequis** : Résoudre les bugs en cours d'abord
  - **Horizon** (note 11 mai 2026) : à inclure dans la complétion du module Alignement à l'automne 2026, pour présentation en Rencontre 5 « Aligner sa pratique » (janvier 2027). Voir `docs/CALENDRIER.md` §7.

### Mode simplifie

- [ ] **#33** Mode Tableur - Saisie directe des resultats (POST v1.0)
  - **Concept** : Permettre d'utiliser l'application sans creer de productions, grilles, echelles, etc.
  - **Usage** : Entrer directement les resultats des etudiants comme dans un tableur
  - **Objectif** : Suivi de l'apprentissage avec calculs automatiques (moyennes, progression, distribution)
  - **Public cible** : Enseignants qui ont deja leur propre systeme d'evaluation ou qui veulent un outil simple
  - **A explorer** :
    - Format des notes (sur 100? lettres? echelle personnalisee?)
    - Nommage libre des evaluations ("Examen 1", "TP2", etc.)
    - Integration avec le tableau de bord (indices C/P)
    - Cohabitation avec le mode complet (pratiques de notation)
  - **Prerequis** : Documenter la logique complete avant codage

### Securite / Protection des donnees

- [x] **#48** BUG CRITIQUE : Import données personnelles bloqué sur nouvel appareil ✅ CORRIGÉ (31 jan 2026)
  - **Symptôme** : Le message "Partage impossible" s'affichait même pour sa propre sauvegarde
  - **Impact** : Impossible de restaurer étudiants, présences et notes sur un nouvel appareil (ex: iPad)
  - **Corrections apportées** :
    1. Checkbox "C'est ma propre sauvegarde" ajoutée pour bypasser la protection
    2. Cocher auto des cases Étudiants/Présences/Notes quand on confirme sa sauvegarde
    3. Préservation des IDs originaux (pratiques, grilles, échelles, productions)
    4. Import des données calendrier (`cadreCalendrier`, `horaireHebdo`, etc.)
  - **Fichiers modifiés** : `js/import-export.js`
  - **Résultat** : Synchronisation MacBook ↔ iPad fonctionnelle

- [ ] **#47** Mot de passe optionnel pour sauvegarde/restauration
  - **Objectif** : Renforcer la protection des données personnelles lors des transferts
  - **Fonctionnement** :
    - Option lors de l'export : "Protéger avec un mot de passe"
    - Chiffrement des données sensibles (étudiants, présences, notes) avec le mot de passe
    - Demande du mot de passe lors de l'import pour déverrouiller les données
  - **Algorithme** : AES-256 via Web Crypto API (natif navigateur)
  - **UX** : Le mot de passe n'est pas stocké, seulement utilisé pour chiffrer/déchiffrer
  - **Cas d'usage** :
    - Transfert entre appareils personnels (MacBook → iPad)
    - Sauvegarde sur cloud ou clé USB
    - Protection contre accès non autorisé au fichier JSON
  - **Prerequis** : Documenter la logique de chiffrement avant codage
  - **Dépendance** (note ajoutée 11 mai 2026) : couvre la **protection au repos** (fichier exporté en local), différente de la **signature ECDSA** prévue dans le chantier Voûte (Défense F, juillet 2026) qui couvre l'**authenticité** des partages publiés. Décision D3 (`docs/securite/DECISIONS-ARCHITECTURALES-2026-05-11.md`) actait que le chiffrement au repos n'est PAS retenu pour la Voûte. Cet item #47 reste pertinent pour les sauvegardes **personnelles** sur cloud/USB, où le risque d'accès non autorisé existe. À reconsidérer après Voûte Phase 1 — si la signature + sceau SHA-256 suffisent au sentiment de sécurité, #47 devient secondaire.

### Fiabilite / Maintenance

- [x] **#32** Refonte architecture groupe Demo ✅ OBSOLÈTE (6 fév 2026) — Remplacé par Chantiers 1-4 (Beta 97.2) : route démo isolée, pack 20 étudiants anonymisés, page d'accueil, guidage contextuel

- [x] **#12** Audit db.get() vs db.getSync() ✅ CORRIGÉ (8 fév 2026)
  - **Résultat** : Architecture saine — `db.set()` ET `db.setSync()` écrivent dans les DEUX stores (localStorage + IndexedDB). Pas de désynchronisation systémique.
  - **340 appels db.get()** (async), **992 appels db.getSync()** (sync) — 99.1% correctement awaités
  - **Fix 1** : contexte.js:117 — ajout `.catch()` sur le `.then()` sans gestion d'erreur
  - **Fix 2** : pratiques-materiel.js:1256 — double écriture `db.set()` + `db.setSync()` redondante retirée
  - **Fix 3** : wizard-pratique-v2.js:1709 — double écriture `db.setSync()` + `db.set()` redondante retirée
  - **Fichiers** : `js/contexte.js`, `js/pratiques-materiel.js`, `js/wizard-pratique-v2.js`

- [x] **#13** ~~Outil verification integrite donnees~~ ✅ REMPLACÉ (27 mars 2026) — `window._storageStats` + `window._testResistanceStorage()` dans db.js

- [x] **#15** Consolidation wizard vs pratiques-materiel ✅ OBSOLÈTE (11 mai 2026) — Remplacé par #29 (retrait du wizard V1 le 8 mai 2026, commit b70861b). Le wizard V2 est maintenant seul, plus de duplication à factoriser.

- [x] **#16** Systeme changelog automatise ✅ COMPLÉTÉ (10 fev 2026)
  - changelog-data.js structure, script update-version.sh, changelogs markdown par beta
  - Generation manuelle jugee suffisante pour le volume actuel

- [x] **#17** Checklist tests de regression ✅ OBSOLÈTE (11 mai 2026) — Absorbé par Défense I (PR #15, 8 mai 2026) : 29 tests automatisés (23 Vitest + 6 Playwright WebKit, ~12 s), hook pré-push opt-in. Couvre A.3 hash CSP, B sanitisation profonde, C validation imports, D whitelist exports, E sandbox, F lint innerHTML. Documentation : `docs/securite/TESTS-AUTOMATISES.md`. La checklist manuelle envisagée à l'origine est absorbée par l'infra automatisée.

- [x] **#27** Documenter conventions nommage champs ✅ LIVRÉ (13 mai 2026)
  - `docs/architecture/CONVENTIONS-NOMMAGE.md` créé : préfixes `nb` canonique, `total` pour objectifs, `n` legacy à éviter. Recommandations par concept (étudiants, productions, évaluations, fichiers). Cas à ne PAS refactorer (rétrocompat manifeste codex, etc.).

- [x] **#28** Ajouter mode edition a Wizard V2 ✅ FAIT
  - `ouvrirWizardV2(modeEdition, pratiqueId)` complet dans `js/wizard-pratique-v2.js`

- [x] **#29** Retirer wizard legacy (livré 8 mai 2026, b0508-1430, commit b70861b)
  - `modalWizardPratique` retiré d'index.html (0 occurrence).
  - `pratiques.js` 5458 → 3686 lignes (-1772 l., -32 %). 33 fonctions V1 supprimées
    (28 prévues + 5 oubliés découverts).
  - Bug latent corrigé : bouton « Éditer » bibliothèque pratiques était silencieusement cassé.
  - Fragilité éliminée : double export `window.ouvrirWizardPratique` V1/V2.

### Bibliotheques

- [x] **#40** Boutons d'aide 😎 dans les modals de bibliotheques ✅ FAIT (28 jan 2026)
  - Aide contextuelle ajoutée expliquant le fonctionnement des bibliothèques
  - Distinction claire : Retirer ≠ Supprimer, Locale vs Bibliothèque, doublons
  - **Fichiers modifies** : `js/aide-contextuelle-contenu.js`, `js/grilles.js`, `js/echelles.js`, `js/cartouches.js`, `js/pratiques-materiel.js`, `js/productions.js`

- [x] **#41** Uniformiser presentation visuelle des sidebars ✅ FAIT (28 jan 2026)
  - Bouton "Consulter la bibliothèque" ajouté aux cartouches
  - Style uniforme (font-size: 0.9rem) sur tous les boutons
  - Classe `.banque-vide` remplacée par `.sidebar-vide` pour cohérence
  - **Fichiers modifies** : `index.html`, `js/cartouches.js`

- [x] **#42** Uniformiser presentation visuelle des bibliotheques ✅ FAIT (28 jan 2026)
  - Vérification : ordre des boutons déjà uniforme (Dupliquer → Exporter → Retirer → Supprimer)
  - Badges source (Locale/Bibliothèque/Retirée) ajoutés aux 4 bibliothèques
  - IDs courts (#abc123) ajoutés pour identifier les doublons
  - **Fichiers modifies** : `js/grilles.js`, `js/echelles.js`, `js/cartouches.js`, `js/pratiques-materiel.js`

- [x] **#7-a** Bouton Supprimer dans bibliotheques ✅ FAIT (28 jan 2026)
  - Suppression définitive avec confirmation (modal)
  - Vérification des dépendances (ex: cartouches liées à une grille)
  - Bouton "Retirer" changé de rouge à gris (action moins grave)
  - **Fichiers modifiés** : `js/grilles.js`, `js/cartouches.js`, `js/echelles.js`, `js/pratiques-materiel.js`, `js/productions.js`

- [x] **#7-b** Bouton Dupliquer dans bibliotheques ✅ FAIT (28 jan 2026)
  - Duplication avec nouvel ID et suffixe "(copie)"
  - Métadonnées CC nettoyées sur la copie
  - **Fichiers modifiés** : `js/grilles.js`, `js/cartouches.js`, `js/echelles.js`, `js/pratiques-materiel.js`, `js/productions.js`

#### Refonte des modales de bibliotheque (Audit 10 fev 2026)

> **Contexte** : Les 4 modales de bibliotheque (grilles, echelles, productions, cartouches) ont diverge
> independamment. Chacune est une fonction de 200-300 lignes qui concatene du HTML en string.
> Il en resulte des bugs fonctionnels, des inconsistances visuelles majeures, et une maintenance couteuse
> (tout changement doit etre replique 4 fois x 2 sections).
> Voir l'analyse complete dans le transcript Claude Code du 10 fevrier 2026.

**Niveau 1 — Corrections fonctionnelles urgentes**

- [x] **#144** BUG : "Ajouter a ma selection" ne fonctionne pas (grilles et echelles) ✅ CORRIGÉ (10 fev 2026)

- [x] **#145** BUG : Bouton "Ajouter a ma selection" invisible dans cartouches ✅ CORRIGÉ (10 fev 2026)

- [x] **#146** BUG : Titre mensonger "Cartouches dans la barre laterale" dans la modale ✅ CORRIGÉ (10 fev 2026)
  - **Resolution** : Groupement par grille dans la modale (#146 dans cartouches.js)

- [x] **#147** CSS manquant : boutons X des modales (grilles, echelles, productions) ✅ CORRIGÉ (10 fev 2026)

- [x] **#148** Supprimer ne supprime pas de la bibliotheque partagee ✅ CORRIGÉ (10 fev 2026)
  - **Note** : Pratiques de notation n'ont pas de bouton Supprimer de la bibliotheque partagee (comportement voulu)

**Niveau 2 — Uniformisation visuelle**

- [x] **#149** Unifier le bouton X de fermeture des 4 modales ✅ CORRIGÉ (10 fev 2026)

- [x] **#150** Migrer la modale cartouches vers les classes CSS communes ✅ CORRIGÉ (10 fev 2026)

- [x] **#151** Unifier couleurs et styles des titres H2 et conteneurs de titre ✅ CORRIGÉ (10 fev 2026)

- [x] **#152** Unifier les ID badges (inline vs classe CSS) ✅ CORRIGÉ (10 fev 2026)

- [x] **#153** Separer visuellement badges et boutons ✅ CORRIGÉ (10 fev 2026)

- [x] **#154** Reduire la densite visuelle de Section 1 (boutons d'action) ✅ CORRIGÉ (10 fev 2026)

- [x] **#155** Supprimer les styles inline redondants sur les badges source ✅ CORRIGÉ (10 fev 2026)

**Niveau 3 — Refactoring architectural (post-stabilisation)**

- [x] **#156** Extraire un composant `ModalBibliotheque` reutilisable ✅ FAIT (10 fev 2026)
  - **Resolution** : `js/bibliotheque-ui.js` cree avec `BibliothequeUI.creerModal()`, `renderCarteSelection()`, `renderCarteDisponible()`, `genererBadgeSource()`, `renderAvertissementDoublons()`. Les 4 modules consomment cette API

- [x] **#157** Separer logique metier et rendu HTML dans les modales ✅ FAIT (10 fev 2026)
  - **Action** : Extrait `preparerDonneesBibliothequeX()` dans chaque module — le rendu ne fait que consommer des donnees pre-formatees
  - **Fichiers** : `js/grilles.js`, `js/echelles.js`, `js/productions.js`, `js/cartouches.js`

- [x] **#160** UX : Alleger l'apparence des bibliotheques (livré via #267 Phases A+B+C+D, 9-10 mai 2026, beta 99.39-99.40)
  - Phase A (épure visuelle) : filtrage par mode démo, retrait `#identifiant`, retrait badge
    « Bibliothèque », retrait préfixes `[STD]/[SPE]/[SOM]/[DEN]/[Multi]/[Démo]` dans titres,
    retrait badge violet « Démo » — commit `9c6d29f`.
  - Phase B (migration pratiques + uniformisation boutons) : règle CSS unique avec
    `!important` ciblant `[id^="modalBibliotheque"] .btn` dans `styles.css:3399`. Tailles
    boutons uniformes partout — commit `8a2e93c`.
  - Phase C (refonte cartes biblios) : composant menu `⋮` générique, API
    `{boutonPrincipal, actionsMenu}` (remplace l'ancien `boutons:[]`) — commit `be2ebb9`.
  - Phase D (standardisation métadonnées) : helpers `formaterMetadonnees` (ordre fixe
    quantité · auteur · discipline) et `tronquerDescription` (coupe au dernier espace,
    max 120 c) — commit `83eb626`.
  - Audit : `Rapports/AUDIT-BIBLIOS-2026-05-09.md`. Spec design : `design-system.html` §24.

- [x] **#159** UX prévisualisation cartouche — onglets Édition/Aperçu ✅ RETIRÉ (12 mai 2026)
  - Onglets livrés le 13 mai (option 3) puis retirés le 12 mai après retour terrain : l'aperçu aléatoire ne servait à rien quand la matrice complète est déjà visible en édition.
  - Retraits zéro-dette : onglets HTML, conteneur `#apercuRetroaction`, fonction `genererApercuAleatoire`, CSS `.onglets-cartouche/.onglet-cartouche-tab`, attribut `data-onglet-actif`, MutationObserver de synchronisation.

### Deploiement / Mise a jour

- [x] **#158** Notification de mise a jour en temps reel (sans rechargement) — 10 fev (build 0210-1059)
  - Polling `version.json` toutes les 5 min (premiere verif apres 30s)
  - Bandeau vert fixe en bas avec animation slide-up + bouton Recharger
  - Resilience offline (catch silencieux), cache-busting, detection unique

### Configuration

- [x] **#22** Mettre à jour fichier noms_stables.json ✅ LIVRÉ (13 mai 2026)
  - Fichier n'existait pas sur disque (signalé par audit Obsidian 11 mai). Créé depuis zéro.
  - 44 identifiants protégés inventoriés via scan automatisé : 4 dans config.js, 3 dans navigation.js, 15 dans productions.js, 22 dans grilles.js
  - Chaque entrée : nom, type, ligne actuelle, rôle. Métadonnées avec date de dernière maj + version codebase.

### Carte mentale — Taxonomie d'Anderson et guide integre

- [x] **#161** Banque de verbes cognitifs et types de connaissances (Anderson) ✅ FAIT (14 fév 2026)
  - 4 types Anderson (Factuelle, Conceptuelle, Procédurale, Métacognitive) dans TYPES, palette HTML, CSS
  - Sélecteur de niveau cognitif (6 niveaux) dans le panneau de propriétés
  - Banque de 60 verbes en étiquettes cliquables, badge cognitif sur les nœuds
  - Migration automatique des anciens types (connaissance→factuelle, strategie→procedurale, condition→procedurale)
  - **Fichier** : `js/planification-carte.js`

- [x] **#162** Guide intégré par étapes pour le module Carte mentale ✅ FAIT (14 fév 2026)
  - Guide paginé de 7 pages remplaçant le panneau d'aide basique
  - Chaque page : volet *pourquoi* (pédagogique) + *comment* (technique)
  - Navigation ← → + 7 points cliquables + bouton Terminer
  - Référence APA : Anderson, L. W. (2026). UNESCO IBE. Hyperlien intégré
  - **Fichiers** : `js/planification-carte.js`, `index.html`, `styles.css`

- [x] **#163** Verifier l'implementation de l'accompagnement de creation de materiel pedagogique ✅ OBSOLÈTE (11 mai 2026) — La fonction `demarrerCreationMateriel` faisait partie des 4 modules `primo-*` retirés le 21 avril 2026 (Phase 3 consolidation onboarding, commit cfee015, -5700 l.). L'onboarding est désormais consolidé dans `accompagnement.js` (tour guidé 6 étapes + flèches didactiques A.16). Périmètre original disparu.

### Parcours d'apprentissage — Verification et guide

- [x] **#164** Verifier le parcours complet d'initiation de l'utilisateur ✅ OBSOLÈTE (11 mai 2026) — Le périmètre original (modal de bienvenue, panneau CTA, 12 jalons, hero adaptatif, suggestions proactives, certification d'autonomie) reposait sur `parcours-apprentissage.js` (retiré 21 avril, Phase 5A, commit f796d93, -1335 l.) et les modules `primo-*` (retirés 21 avril, Phase 3, commit cfee015, -5700 l.). L'onboarding est désormais consolidé dans `accompagnement.js` (tour guidé 6 étapes + flèches didactiques A.16). Périmètre original disparu.

- [x] **#165** Revoir le format du guide dans l'alignement pedagogique (Anderson) ✅ LIVRÉ (11 avril 2026, Beta 99.11 b0411-2010, commits 55b8668 + 3482deb + fb5d632)
  - Guide étendu de 7 à 8 pages (ajout page 8 « exporter et importer un plan », workflow IA).
  - Guide rendu accessible depuis le Plan de la leçon. Mention ChatGPT retirée.
  - Panneau au niveau `section-structure` (position fixed) — voir MEMORY.md « Module Planification ».
  - Cycle aller-retour import/export MD (marqueurs `[Séquence | Sem. X–Y]`, `[Leçon | durée]`) avec modale à onglets Export/Import.

### Coherence visuelle et design system (16 fevrier 2026)

- [x] **#166** Eliminer les couleurs hardcodees et les styles inlines dans toute l'application ✅ FAIT (16 fev 2026)
  - 6 phases : badge-compteur/controle-form, alertes inline, variables IDME/planification, hex hardcodes CSS, couleurs JS, mise a jour design-system.html
  - **Fichiers** : `index.html`, `styles.css`, `design-system.html`, fichiers JS concernes

- [x] **#167** Detacher le guide d'utilisation de l'alignement pedagogique en palette independante ✅ FAIT (16 fev 2026)
  - Guide detache en panneau flottant independant avec bouton 📔
  - **Fichiers** : `js/planification-carte.js`, `styles.css`

- [x] **#168** Normaliser l'emoji 📔 pour tout element de guidage ✅ FAIT (16 fev 2026)
  - Audit et normalisation des emojis de guidage dans toute l'application
  - **Fichiers** : `index.html`, `styles.css`, fichiers JS concernes

- [x] **#169** Normaliser l'emoji 📚 pour toutes les bibliotheques ✅ FAIT (16 fev 2026)
  - Audit et normalisation des emojis de bibliotheques
  - **Fichiers** : `index.html`, fichiers JS concernes

- [x] **#170** Normaliser les icones de verrouillage/deverrouillage 🔒 et 🔓 ✅ FAIT (16 fev 2026)
  - Audit et normalisation des icones de verrouillage dans toute l'application
  - **Fichiers** : `index.html`, fichiers JS concernes

- [x] **#171** Normaliser l'emoji 🥋 pour tous les assistants de creation ✅ FAIT (16 fev 2026)
  - Remplacement des icones 😎, ⚒️ et 🛠️ par 🥋 dans tous les assistants
  - **Fichiers** : `index.html`, fichiers JS concernes

- [x] **#172** Audit complet de coherence visuelle modes clair et sombre ✅ FAIT (16 fev 2026)
  - ~50 variables CSS ajoutees dans `:root` et `body.mode-clair`
  - ~60 couleurs hardcodees remplacees par `var(--...)` dans styles.css, index.html et 7 fichiers JS
  - Phases : cartes info, badges pattern, jetons profil, calendrier, utilitaires texte/gris, inline styles, couleurs JS
  - **Fichiers** : `styles.css`, `index.html`, `js/trimestres.js`, `js/planification-carte.js`, `js/etudiants.js`, `js/guidage.js`, `js/echelles.js`, `js/aide-contextuelle-contenu.js`, `js/tableau-bord-apercu.js`

- [x] **#173** Corriger les caracteres accentues dans la page Archivage de Construction de la note ✅ FAIT (16 fev 2026)
  - Accents manquants corriges dans la section Archivage
  - **Fichiers** : `index.html`

- [x] **#174** Mise a jour Beta 97.8 — documentation, build et publication ✅ FAIT (16 fev 2026)
  - Beta 97.8, build 0216-0950
  - Changelog, notes de version, SESSION.md, BACKLOG.md mis a jour
  - **Fichiers** : `index.html`, `version.json`, `styles.css`, `js/changelog-data.js`, `SESSION.md`, `BACKLOG.md`

### Module Travaux — Plan global (18 fevrier 2026)

> Ref : `Plan-global-module-travaux.md` (racine du projet)
> Objectif : flux complet import → annotation → export pour AQPC (3-5 juin 2026)

**Phase 0 — Auto-perspective (ABANDONNE 27 mars 2026)**

- [x] ~~**#175** Finaliser l'algo auto-detection des coins~~ — ABANDONNÉ
- [x] ~~**#176** Integrer l'auto-detection v5~~ — ABANDONNÉ

**Phase 1 — Import intelligent (mars 2026)**

- [ ] **#177** Import par dossier complet Lea (A1)
  - Lire le dossier telecharge, parser les noms (`Nomdefamille_DA_Travail_Date`)
  - Associer automatiquement chaque fichier a l'eleve via le DA (7 chiffres)
  - Gestion des doublons (garder le depot le plus recent)
  - **Fichiers** : `js/travaux-import.js`

- [ ] **#178** Assemblage multi-images par eleve (A3)
  - Detecter fichiers multiples d'un meme eleve (meme DA, meme production)
  - Ordonner par nom/horodatage, assembler en document multi-pages
  - Le groupement existe deja (`grouperSelection()`) — l'automatiser
  - **Fichier** : `js/travaux-preparation.js`

**Phase 2 — Annotation complete (mars-avril 2026)**

- [x] **#179** Panneau retractable en mode annotation (C1) ✅ FAIT
  - `toggleSidebar()` dans `js/travaux-ui.js`, persistance session

- [x] **#180** Annotation texte (C3) ✅ FAIT
  - Outil texte complet (10-32px, couleur configurable)
  - **Fichiers** : `js/travaux-annotation.js`, `js/travaux-outils.js`

- [x] **#181** Palette d'autocollants (C2) ✅ FAIT
  - 12 PNG (4 qualite + 8 diagnostic), prechargement et rendu
  - **Fichiers** : `js/travaux-outils.js`, `autocollants/`

- [x] **#182** Navigation fluide annotation ↔ evaluation (D1) ✅ FAIT
  - `basculerMode()` bidirectionnel, persistance session
  - **Fichier** : `js/travaux-ui.js`

**Phase 3 — Export PDF (avril-mai 2026)**

- [x] **#183** Generation du PDF annote + page synthese (E1) ✅ FAIT
  - `genererDocPDF()`, annotations aplaties, page synthese avec grille
  - **Fichier** : `js/travaux-export-pdf.js`

- [x] **#184** Insertion de la grille evaluee dans le PDF (B2) ✅ FAIT
  - Criteres + niveaux rendus dans la page synthese du PDF
  - **Fichier** : `js/travaux-export-pdf.js`

- [x] **#185** Export par lots avec noms Lea (E3) ✅ FAIT
  - `exporterPourLea()`, `exporterParEtudiant()`, `exporterSemestre()` avec JSZip
  - **Fichier** : `js/travaux-archivage.js`

**Phase 4 — Integration et polish (mai 2026)**

- [x] ~~**#186** Conversion DOCX cote client (A2)~~ — ABANDONNÉ (27 mars 2026, aucune solution fiable)

- [x] ~~**#187** Detection multi-pages dans une photo (B1 avance)~~ — ABANDONNÉ (27 mars 2026, dependait de #175-176)

**Corrections au plan Cowork :**
- `travaux.js` n'existe pas — la structure reelle est 9 fichiers `travaux-*.js`
- `auto-perspective.md` n'existe pas — seul `auto-perspective-v5.md` est present
- Le plan est globalement compatible avec l'etat actuel de l'application

---

## Complete (Beta 98.2.1 - 3 mars 2026)

- [x] **#212** Validation des dates d'echeance hors trimestre (productions) ✅ FAIT (3 mars 2026)
  - Contraintes `min`/`max` sur les date pickers (simple et multi-groupe) selon `cadreCalendrier`
  - Avertissement orange en temps reel (`change`) si date hors bornes du trimestre
  - `confirm()` a la sauvegarde listant les groupes concernes avec dates hors limites
  - **Fichier** : `js/productions.js`

- [x] **#213** Indicateur de seance a cote des dates d'echeance (productions) ✅ FAIT (3 mars 2026)
  - Affiche "lundi 16 fev., 1re seance de la semaine 4" a cote de chaque date picker
  - Rang calcule par groupe via `seancesCompletes` filtrees par `groupeNum`
  - Permet a l'enseignant de verifier la synchronisation entre groupes
  - Fallback sur toutes les seances du cours si le filtre par groupe ne donne rien
  - Mode simple (1 groupe) et multi-groupe supportes
  - **Fichier** : `js/productions.js`

---

## Complete (Beta 98.1 - 26 février 2026)

- [x] **#188** Bibliothèque d'alignements pédagogiques (cartes mentales partagées) ✅ FAIT (26 fév 2026)
  - CRUD bibliothèque partagée (non namespacée) avec seed démo idempotent (Écriture et littérature)
  - Modale via `BibliothequeUI`, import/export JSON avec métadonnées CC BY-NC-SA 4.0
  - Bouton 📚 dans la palette d'éléments + option Gestion avancée
  - **Fichiers** : `js/planification-bibliotheque.js` (nouveau), `js/planification-donnees.js`, `js/planification-carte.js`, `js/donnees-demo.js`, `js/donnees-v2.js`, `index.html`

- [x] **#189** Fix planification : recharger données au retour dans la section ✅ FAIT (26 fév 2026)
  - La carte démo n'apparaissait pas en mode démo car `initialiser()` ne rechargeait pas les données au retour
  - **Fichier** : `js/planification.js`

- [x] **#190** Renommer l'application « Codex Numeris » → « Labo Codex » ✅ FAIT (26 fév 2026)
  - Titre, h1 et alt des logos modifiés
  - **Fichiers** : `index.html`, `js/accueil.js`

- [x] **#191** Fix calcul présences : Total périodes basé sur le calendrier des séances ✅ FAIT (26 fév 2026)
  - « Total pér. » comptait seulement les séances avec enregistrements sauvegardés
  - Nouvelle fonction `calculerTotalPeriodesAvecCalendrier()` itère `seancesCompletes`
  - **Fichier** : `js/saisie-presences.js`

- [x] **#192** Fix interventions : variable `now` non déclarée empêchait la sauvegarde ✅ FAIT (26 fév 2026)
  - `ReferenceError: Can't find variable: now` dans `creerIntervention()`
  - **Fichier** : `js/interventions.js`

- [x] **#193** Interventions UX : pré-cocher l'étudiant depuis son profil ✅ FAIT (26 fév 2026)
  - Bouton « + Nouvelle intervention » du profil transmet le DA
  - Bandeau info + champ hidden → étudiant pré-coché à la sauvegarde → ouverture directe
  - **Fichiers** : `js/interventions.js`, `js/profil-etudiant.js`

- [x] **#194** Interventions : contexte explicite niveau 2 (rattrapage vs en-classe) ✅ FAIT (26 fév 2026)
  - Nouveau champ `contexte` : rattrapage (congé motivé) ou en-classe (petit groupe)
  - Tableau explicatif des niveaux dans le formulaire de création
  - Panneau absences visible seulement si rattrapage, checkbox redondante supprimée
  - Option MIO retirée (pas un réenseignement)
  - Rétrocompatible : migration automatique des interventions existantes
  - **Fichier** : `js/interventions.js`

- [x] **#195** Fix interventions : filtrer étudiants par groupe-cours actif ✅ FAIT (26 fév 2026)
  - `obtenirDonneesSelonMode` ne filtrait pas par groupe-cours. Remplacé par `obtenirEtudiantsCoursActif()`
  - **Fichier** : `js/interventions.js`

---

## Complete (Beta 97.3 - 7 février 2026)

- [x] **#123** Module Planification — Carte mentale intégrée + renommage Calendrier → Séances
  - Portage du prototype standalone (3608 lignes) vers 3 modules : `planification-donnees.js`, `planification-carte.js`, `planification.js`
  - ~849 lignes CSS ajoutées à `styles.css` (préfixe `planif-`)
  - Carte mentale à 2 zones : Objectifs & Savoirs (gauche) / Organisation & Activités (droite)
  - 10 types de nœuds : compétence, idée maîtresse, connaissance, prérequis, stratégie, séquence, leçon, activité, soutien, révision
  - Panneau latéral Séances avec vue calendrier, export texte et TSV
  - Multi-cartes avec sélecteur, import/export JSON
  - Storage : `cle('planification_mindmap')` via db.getSync/setSync
  - Auto-migration des clés prototype (`proto_cm_*`) au premier chargement
  - Navigation et config intégrées (`config.js`, `navigation.js`)
  - **Fichiers** : `index.html`, `styles.css`, `js/planification-*.js`, `js/config.js`, `js/navigation.js`, `js/accueil.js`

- [x] **#118** Zoom adaptatif : modes "Pleine largeur" et "Pleine hauteur"
  - Remplacement des boutons +/- par deux modes de zoom adaptatifs
  - Pleine largeur : le document couvre toute la largeur du conteneur
  - Pleine hauteur : le document tient en hauteur dans la fenêtre
  - **Fichiers** : `js/travaux-visionneuse.js`, `js/travaux-ui.js`

- [x] **#119** Épaisseur du trait relative à la résolution + affichage pixels
  - Résolution de référence 1000px : l'épaisseur visuelle est constante quelle que soit la résolution
  - Slider affiche l'épaisseur en pixels réels (`Xpx`) en temps réel
  - Ratio appliqué au dessin live, au rendu des annotations et à l'export PDF
  - **Fichiers** : `js/travaux-outils.js`, `js/travaux-annotation.js`, `js/travaux-export-pdf.js`

- [x] **#120** Bouton Annotation → Évaluation
  - Bouton "Évaluer" dans la toolbar d'annotation
  - Navigation directe vers le formulaire d'évaluation avec étudiant et production pré-remplis
  - Utilise `evaluerProduction()` existant dans liste-evaluations.js
  - **Fichier** : `js/travaux-ui.js`

- [x] **#121** Export PDF dossier complet (travail annoté + grille + rétroaction)
  - Nouvelle fonction `exporterDossierComplet(da, productionId)` dans travaux-export-pdf.js
  - Assemble les pages annotées + page de synthèse (grille remplie + rétroaction)
  - Bouton "Dossier PDF" ajouté dans la liste des évaluations complétées
  - **Fichiers** : `js/travaux-export-pdf.js`, `js/liste-evaluations.js`

- [x] **#122** Correctif : aperçu Construction de la note vide (exports IIFE manquants)
  - `chargerStatistiquesApercu()` et `chargerMaterielConfigure()` non exportées après wrapping IIFE (#70)
  - Ajout des exports `window.*` dans statistiques.js, presences-apercu.js, evaluations-apercu.js
  - **Fichiers** : `js/statistiques.js`, `js/presences-apercu.js`, `js/evaluations-apercu.js`

- [x] **#113** Correctif CRITIQUE : fontSize exponentielle lors du redimensionnement de texte
  - `appliquerRedimensionnement()` multipliait la fontSize deja modifiee a chaque frame de drag
  - Correction : utiliser `donneesAvantModif.fontSize` (valeur capturee au debut du drag)
  - **Fichier** : `js/travaux-annotation.js`

- [x] **#114** Correctif : selection fantome au changement de page
  - `annotationSelectionnee` persistait entre les pages, causant un rectangle de selection fantome
  - Correction : reset `annotationSelectionnee = null` dans le handler `travaux-page-rendue`
  - **Fichier** : `js/travaux-annotation.js`

- [x] **#115** Correctif : EXPORT_SCALE hardcode dans les fonctions de dessin d'export
  - `dessinerAnnotationsSurCtx` utilisait `EXPORT_SCALE = 2.0` en dur, meme quand l'archive passe `scale: 1.5`
  - Correction : parametre `scale` propage a `dessinerAnnotationsSurCtx`, `dessinerTrait`, `dessinerForme`
  - L'archivage d'images (taille native) passe `scale = 1`
  - **Fichiers** : `js/travaux-export-pdf.js`, `js/travaux-archivage.js`

- [x] **#116** Correctif : event listeners qui s'accumulent dans la visionneuse
  - `travaux-annotation-activee/desactivee` etaient ajoutes a chaque appel de `afficherVisionneuse()`
  - Correction : listeners deplaces dans `initialiserModuleTravaux()` (execute une seule fois)
  - **Fichier** : `js/travaux-ui.js`

- [x] **#117** Correctif : Backspace intercepte globalement meme dans les champs de formulaire
  - `onKeyDown` capturait Delete/Backspace dans les `<input>`, `<select>`, `<textarea>`
  - Correction : guard `e.target.matches('input, select, textarea, [contenteditable]')` ajoute
  - **Fichier** : `js/travaux-annotation.js`

---

## Complete (Beta 97.2 - 7 février 2026)

- [x] **#110** Outil d'annotation — Panneau retractable avec memoire de session
  - Bouton toggle avec fleche directionnelle (◀/▶) visible des que la sidebar est repliee
  - Memoire manuelle via `sessionStorage` : la sidebar reste repliee si l'utilisateur l'a repliee
  - Sortie d'annotation ne redéploie plus la sidebar si manuellement repliee
  - **Fichier** : `js/travaux-ui.js`

- [x] **#111** Outil d'annotation — Mode selection/edition des annotations
  - Nouvel outil Selection (☝️) en position 0 de la palette
  - Hit-testing reutilisable (`trouverAnnotationAuPoint`) : stickers > texte > formes > traits
  - Cadre pointille bleu + 4 poignees blanches aux coins pour selection visuelle
  - Deplacement : traits, formes, texte, stickers (drag dans la bbox)
  - Redimensionnement V1 : formes, stickers, texte (traits = deplacement seulement)
  - Suppression via Delete/Backspace, deselection via Escape
  - Undo/redo pour modifications (`modification-annotation` avec avant/apres)
  - Curseur contextuel (move, nw-resize, etc.)
  - Apple Pencil : le mode selection accepte le touch (doigt) pour selection tactile iPad
  - Gomme refactorisee pour utiliser le hit-testing partage
  - **Fichiers** : `js/travaux-annotation.js`, `js/travaux-outils.js`

- [x] **#112** Outil d'annotation — Export PDF annote dans archives ZIP
  - Nouvelle fonction `rendrePDFAvecAnnotations()` partagee (export-pdf)
  - Remplacement du `return null` pour les PDF dans `genererFichierAnnote()`
  - Consolidation du code duplique : `dessinerAnnotationsSurCanvas` (91 lignes) → wrapper 3 lignes
  - Le rendu partage inclut les stickers (manquant dans l'ancien code archivage)
  - Callback de progression pour le rendu PDF multi-pages
  - **Fichiers** : `js/travaux-export-pdf.js`, `js/travaux-archivage.js`

---

## Complete (Beta 96.3 - 6 février 2026)

- [x] **#109** Module Travaux - Import, Annotation et Archivage
  - Import drag-drop de PDF/images avec detection auto du DA etudiant
  - Moteur d'annotation Canvas avec support Apple Pencil (pression, rejet paume, undo/redo)
  - Integration evaluation : vue cote-a-cote travail + grille, section "Travaux soumis" dans profil
  - Archivage ZIP par etudiant/production/semestre via JSZip
  - File System Access API (Mac), scroll virtuel (500+ miniatures), pre-rendu pages adjacentes, moniteur quota
  - **Beta 97.1** : Panneau retractable en mode annotation, palette de 12 tampons de retroaction (qualite + diagnostic), export PDF annote avec page de synthese (jsPDF), ecran de revision avant export
  - **Nouveaux fichiers** : 8 modules JS (`js/travaux-*.js` + `js/travaux-export-pdf.js`), 3 libs (`libs/pdf.min.js`, `libs/pdf.worker.min.js`, `libs/jszip.min.js`), 12 PNG (`autocollants/`)
  - **Fichiers modifies** : `index.html`, `styles.css`, `js/config.js`, `js/navigation.js`, `js/trimestres.js`, `js/evaluation.js`, `js/profil-etudiant.js`

---

## Complete (Beta 96 - 25 janvier 2026)

- [x] **#38** Graphique spaghetti - Trajectoires d'apprentissage par artefact
  - Affiche les **resultats bruts par artefact** (pas l'indice P agrege)
  - Montre la volatilite reelle de l'apprentissage (hauts et bas, non-linearite)
  - Revele les artefacts difficiles (convergence vers le bas)
  - Permet de voir la resilience (rebonds apres difficultes)
  - Zones IDME colorees en arriere-plan avec etiquettes a droite
  - Carte d'aide 😎 expliquant pourquoi les resultats bruts vs indice P
  - **Decision pedagogique** : L'indice P (meilleures notes) masque la non-linearite
  - **Fichiers modifies** : `index.html`, `js/graphiques-progression.js`, `js/tableau-bord-apercu.js`
  - **Prochaine etape** : Courbes de distribution (densite) des indices ACPE

---

## Complete (Beta 95.7 - 25 janvier 2026)

- [x] **Import historique A2024** Archivage trimestre Automne 2024
  - Import retroactif : 55 etudiants, 2 groupes, 750 evaluations, 1650 presences
  - Echelle IDME (I=40%, D=65%, M=85%, E=100%) documentee dans bibliotheque
  - Pratique : 6 artefacts recents (60%) + Analyse finale (40%)
  - Correction tri "recents" par numero de production (pas par date)
  - Scripts d'import et diagnostic dans `docs/A2024/`
  - Trimestre archive en lecture seule
  - **Fichiers modifies** : `js/portfolio.js`, `js/profil-etudiant.js`

## Complete (Beta 95.7 - 22 janvier 2026)

- [x] **Calcul assiduite en periodes** (correction majeure)
  - Formule corrigee : `periodesPresentes / periodesOffertes` (au lieu de heures)
  - Resultat : 2/2 periodes = 100% (avant: 92% a cause de la conversion heures)
  - Etudiants absents affichent 0% (au lieu du tiret) si presences saisies
  - **Fichiers modifies** : `js/saisie-presences.js`, `js/etudiants.js`

- [x] **Moyenne A du groupe** affichee partout
  - Entete liste etudiants : `moy=93%` sous la colonne A
  - Barre Assiduite du tableau de bord : moyenne + 28 points individuels
  - Calcul inclut les 0% (absents) pour moyenne correcte
  - **Fichiers modifies** : `js/etudiants.js`, `js/tableau-bord-apercu.js`

- [x] **Points individuels** sur barre Assiduite
  - Distribution visible : 26 points a droite (100%), 2 points a gauche (0%)
  - Mode PAN active par defaut si aucun mode configure
  - Filtrage specifique pour A : inclut tous les etudiants avec presences saisies
  - **Fichier modifie** : `js/tableau-bord-apercu.js`

- [x] **Bug namespacing presences** Saisie presences ne fonctionnait pas
  - `db.getSync('presences', [])` utilisait la cle sans prefixe trimestre
  - Corrige dans : `saisie-presences.js`, `interventions.js`, `rapport-bug.js`
  - Ajoute protection `Array.isArray()` dans `presences-apercu.js`
  - **Fichiers modifies** : 4 fichiers JS
  - **Resultat** : Saisie presences fonctionne avec namespacing correct

- [x] **Synchronisation horaireHebdo** avec horaires du trimestre
  - Le calendrier ne reconnaissait pas les jours de cours du nouveau trimestre
  - `horaireHebdo` n'etait pas mis a jour lors de la sauvegarde d'un horaire
  - Ajout synchronisation automatique dans `sauvegarderHoraireV2()` et `supprimerHoraireV2()`
  - **Fichier modifie** : `js/trimestre-v2.js`
  - **Resultat** : Le calendrier reconnait correctement les jours de cours

- [x] **UX Saisie presences** Input numerique au lieu de dropdown
  - Remplacement du dropdown par un champ numerique (permet fractions: 1.5, etc.)
  - Affichage format `X/Y` (ex: `2/2` pour presence complete)
  - Colonne "Total heures" devient "Total per." (periodes)
  - **Fichiers modifies** : `js/saisie-presences.js`, `index.html`

- [x] **Affichage nom pratique** dans l'entete
  - L'entete affichait l'ID (pratique-xxx) au lieu du nom
  - Recherche dans `pratiquesConfigurables` si l'ID n'est pas dans les pratiques codees
  - Chargement async via `db.get()` si `db.getSync()` retourne tableau vide (timing IndexedDB)
  - **Fichier modifie** : `js/contexte.js`

## Complete (Beta 95.7 - 21 janvier 2026)

- [x] **Bug critique** Trimestres A2025/Demo inaccessibles
  - `changerTrimestreActif()` ne mettait pas a jour `window.trimestreActif`
  - `groupesCours` et `horaires` manquants dans `CLES_NAMESPACEES`
  - Donnees demo sans groupe-cours (maintenant cree automatiquement)
  - Nouvelle fonction `creerGroupeCoursDemoSiNecessaire()` dans trimestres.js
  - **Fichiers modifies** : `js/trimestres.js`, `js/donnees-demo.js`
  - **Resultat** : A2025 affiche 30 etudiants, Demo cree auto groupe-cours

- [x] **Migration horaires/groupesCours** vers trimestre actif
  - Donnees H2026 stockees sans prefixe mais lues avec prefixe
  - Nouvelle fonction `migrerHorairesEtGroupesCours()` dans trimestres.js
  - Migration automatique au demarrage de l'application

## Complete (Beta 95.7 - 20 janvier 2026)

- [x] **#20** Datalist programmes d'etudes (~130 programmes preuniversitaires + techniques)
- [x] **#25** Analyse fonctionnalites pour Claude Cowork (docs/ANALYSE-FONCTIONNALITES.md)
- [x] **#14** Dropdowns discipline : liste complete (~120 disciplines, 6 optgroups)
- [x] **#26** Audit versions Primo : pas de conflit, 3 recommandations ajoutees (#27-29)
- [x] **#24** Option hybride construction note portfolio (Primo + Expert)
- [x] **#23** Uniformiser boutons tous modals (Design System v7)
- [x] **#4** Persistance donnees Wizard -> Mode Expert (flag enChargementFormulaire)
- [x] **#5** Valeurs par defaut jetons : 2 jetons/eleve, 2 jours delai
- [x] **#6** Dropdown note maximale (reprise ciblee) : echelle dynamique
- [x] **#8** Message aide bibliotheque pratiques
- [x] **#9** Document backlog independant (BACKLOG.md)
- [x] **#19** Ordre disciplines dropdown (100->600, groupe 400 corrige)
- [x] **#21** Menage fichiers repertoire principal (fusion archive/, reorganisation)
- [x] **#3** Clarifier nombre total d'artefacts (meilleurs vs obligatoires)

---

## Complete (Beta 95.6 - 19 janvier 2026)

- [x] Dropdown discipline (champ texte -> dropdown 6 categories)
- [x] Correction sauvegarde pratiques (desync IndexedDB/localStorage)
- [x] Boutons 😎 aide contextuelle (14 themes)
- [x] Design System v7 (harmonisation styles)

---

## Reporte (Post-AQPC ou V1.1)

- [x] PAN-Objectifs ponderes (Michel B.) ✅ OBSOLÈTE (11 mai 2026)
- [x] Remplacement progression (Élève-032) ✅ OBSOLÈTE (11 mai 2026)
- [x] PAN-Jugement global (config JSON) ✅ OBSOLÈTE (11 mai 2026)
- **Note commune** : ces 3 schémas hypothétiques avaient été déduits d'un sondage auprès d'enseignants utilisateurs de PAN (novembre 2025). Le wizard V2 livré depuis couvre ces cas d'usage de manière générique. Pas besoin d'implémenter des PAN spécifiques.

---

## Notes

### Priorites
- **Retours testeurs** passent TOUJOURS AVANT ce backlog
- Items classes par importance et facilite d'implementation

### Pour ajouter un item
```markdown
- [ ] **#XX** Description courte
  - Detail 1
  - Detail 2
```

### Pour marquer comme complete
Deplacer dans la section "Complete" avec [x]


## Bascule du 19 juin 2026 — 14 items livrés (clôture session 1.20.0)

> Déplacés de `BACKLOG.md` (items `[x]`) lors de la clôture de la session du 19 juin 2026 (release 1.20.0). Contexte intégral conservé ci-dessous.

- [x] ✅ **#341 LIVRÉ 13 juin 2026** (commit `5d5dfe5`, vérifié à froid le 15 juin) — « Appliquer une pratique » ne retrouvait AUCUNE pratique configurable : résolution par la clé globale au lieu de la clé namespacée. Créé 12 juin 2026 (découverte pendant le terrain #328 L2-b2).
  - **Bug (corrigé)** : `js/pratiques-bibliotheque.js:624`, dans `obtenirConfigurationPratiqueParId` — l'étape 3 lisait `await db.get('pratiquesConfigurables')` (clé GLOBALE, vestige du fix « Beta 95.2 - Bug chimie ») alors que les configs vivent dans `h2026_pratiquesConfigurables` depuis la namespacisation par trimestre (99.64, 24 mai). Patron « constructeur de clé sans `cle()` » (cf. #300).
  - **Fix livré** : lecture `db.get(cle('pratiquesConfigurables'))` d'abord, **repli legacy** sur la clé nue conservé (idiome cohérent avec `pratiques.js` / `portfolio.js` / `pratiques-gestion.js` / `evaluation-calcul.js` ; testé par la sentinelle cas 2). Audit fait : seule lecture restante de la clé nue = la migration intentionnelle `main.js:373` (copie global→namespacé, légitime).
  - **Sentinelle** : `tests/unit/sentinelle-pratique-config-namespacee-341.test.js` (4 cas : namespacée, repli legacy, id inconnu, ratchet statique). Break-testée le 15 juin (réinjection du bug → 2 cas rougissent). 4/4 verts.
  - **Note process** : le relais SESSION.md du 15 juin décrivait à tort ce fix comme « pressenti / non appliqué » — il était mergé dans `main` depuis le 13 juin. Écart attrapé par le rituel de début de session #341.
  - **Suite extraite vers #342** : la carte « PAN-Littérature A25 » affichait « par Bruno V. +1 contrib. » — ce n'est PAS une préférence d'affichage mais une vraie erreur d'attribution dans les données live (Bruno = chimie ; Grégoire = littérature). Voir #342.

- [x] ✅ **#321 LIVRÉ 19 juin 2026 (1.20.0, PR #54)** Option transversale « note différée » (couche 1 PRÉN niveau 1) — bascule globale Réglages › Préférences qui masque la note PAR TRAVAIL (7 sites : liste, profil, portfolio) derrière un badge « note différée », sans toucher au calcul ni à la note finale. Décisions Grégoire : bascule manuelle + badge. Reste : validation visuelle terrain (2 modes).
  - **Politique d'affichage/timing** : cacher la note par travail pendant le trimestre pour que la rétroaction passe d'abord (Girouard-Gagné niveau 1 « dissimuler/reporter » ; levier empirique Pulfrey/Butler/Black & Wiliam : la rétroaction n'agit que dissociée de la note).
  - **Transversale** : applicable au-dessus de **n'importe quelle famille** (SOM/STD/SPE/DEN). **Ne change pas la valeur finale** (= celle de la famille sous-jacente) → orthogonale au Comparateur. Distincte de DEN (pas le badge DEN).
  - Entrée prudente vers l'esprit PRÉN. Chantier indépendant de #318 (peut être livré seul, plus simple).

- [x] ✅ **#343 LIVRÉ 17 juin 2026** Famille DEN — corriger le malentendu « DEN = sans critères / grille / échelle » (correction de fond DEN, distincte du comparateur). Volets (a)+(d) descriptions (16 juin) ET (b)+(c) modèle/formulaire (17 juin) livrés. Reste validation terrain Mac.
  - **Origine** : passe terrain Grégoire (16 juin 2026) + vérification de code (lecture seule). Doc : `plans de travail/RELAIS-326-refonte-banc-decision.md §4.7`. **Chantier distinct confirmé par Grégoire** (correction de fond sur DEN, pas sur le comparateur).
  - **🔑 PRINCIPE DIRECTEUR (Grégoire, 16 juin)** : **les critères d'évaluation doivent TOUJOURS être explicités, jamais implicites.** Un enseignant DEN utilise **grille de critères + échelle de performance** toute la session (rétroaction) ; il ne met **aucune note chiffrée** en cours de route ; la **note certificative (RREC 60/59) n'est produite qu'à la fin**.
  - **Malentendu confirmé à 3 niveaux** : (1) **descriptions** (🔴) — `gabarits-utils.js:27` « Ungrading (autoévaluation guidée) », hover `den-denotation` « réduit ou élimine la notation chiffrée… commentaire plutôt que score » (omettent les cibles/critères) ; (2) **modèle de données** (🔴) — config DEN persistée = `{type, modeDEN, objectifs, suggestion}`, sans `echelleId`/`grilleId` (STD les porte, `wizard:2691-2696`) ; (3) **formulaire** (🟠) — récapitulatif exclut DEN (`wizard:2140` « sans grille IDME »).
  - **Nuance** : les **cibles** de DEN **sont** déjà des critères (garde de certification → 59) ; il manque la **grille + échelle explicites** pour la rétroaction formative.
  - **Vérification « ailleurs » (16 juin, code)** : le malentendu est **propre à DEN** (SOM/SPE sans grille = par design ; STD exige l'échelle).
  - **Correction** : (a) **descriptions** = « critères explicites » + « note certificative (RREC 60/59) à la fin » ; (b) **modèle/formulaire** = DEN peut porter **grille + échelle** (formatif), note finale = **jugement saisi** ; (c) reformuler `wizard:2140` ; (d) MAJ `SKILL_pratiques_notation §2 bis` (« critères implicites » → explicites).
  - **✅ VOLET DESCRIPTIONS LIVRÉ (16 juin 2026)** — (a) + (d), faible risque, séparable. 5 sites alignés sur le cadrage déjà correct des guides (`guides-pedagogiques.js:306/328`) : `gabarits-utils.js` (tag DEN, plus « autoévaluation guidée »), `accompagnement-contenu-terme.js` (`den-denotation`, plus « commentaire plutôt que sur le score »), `accompagnement-contenu-popup.js` (puce DEN), `wizard-pratique-v2.js` (description du type `:45` + **bannière `:245`** : « absence de repères » → « absence de notes chiffrées en cours de route » ; ajout « cibles/critères explicites — grille, échelle »), et `SKILL_pratiques_notation.md §2 bis` (« standards/specs implicites » → « doivent rester explicites », réf #343). Hovers `accompagnement-contenu-hover.js:290/300` laissés (glose famille neutre/factuelle). Sentinelle `tests/unit/sentinelle-descriptions-denotation-343.test.js` (5 cas, break-testée). 781 Vitest verts.
  - **✅ VOLET MODÈLE/FORMULAIRE (b)+(c) LIVRÉ (17 juin 2026)** — DEN porte désormais `echelleId`/`grilleId` **optionnels** (rétroaction formative), la note finale reste un **jugement saisi** (`jugement_global` ; la validation n'exige pas d'échelle). `js/wizard-pratique-v2.js` : (1) étape `config-denotation` expose deux selects optionnels (échelle/grille) + info de cadrage « ne calculent pas la note » ; (2) build `creerPratiqueV2` persiste `echelleId/grilleId` ; (3) récap affiche l'échelle/grille « (rétroaction) » dans le bloc DEN ; (c) commentaire `:2140` reformulé (« sans grille IDME » retiré) ; (4) **branche `denotation` ajoutée à `chargerPratiqueExistante`** — round-trip d'édition (cibles + suggestion + échelle/grille), comble un **gap pré-existant** (l'édition DEN ne restaurait pas ses cibles). R3 (`construction-attributs.js`) : colonne DEN montre échelle (résolue via `construireConfigComplete`) + grille au lieu de « à venir #343 ». Tests `sentinelle-denotation-materiel-343` (8 cas) + `construction-attributs-326` (DEN résolu), break-testés. 806 Vitest verts. Hors périmètre : le **calcul** DEN inchangé (échelle/grille ne calculent pas) ; saisie au profil inchangée.
  - **Lien #326** : **PRÉALABLE** à la refonte du banc (change ce qu'une **colonne DEN** affiche) — **levé** : R4 peut finaliser la colonne DEN. **#343 entièrement livré** (descriptions + modèle/formulaire). Reste = validation terrain Mac (selects échelle/grille dans le parcours DEN, 2 modes).
  - **✅ RELIQUATS TERRAIN #343-T3/T4 RÉSOLUS — travail CLOUD (23 juin 2026, release 1.21.1)** : commit `6d901fa5` sur la branche distante `claude/project-access-zyxt6n` (session cloud Claude Opus 4.8), build 0623-1313. Suite des tests Mac du 21 juin (famille DEN, tous BASSE) : **T3** infobulle (title) par famille sur les tags de la bibliothèque (`genererBadgeTypePratique`) ; **T4a** ligne « Variante » masquée pour DEN au récap (mode technique « eliminee » redondant) ; **T4b** compteur « 3/2 » corrigé (`calculerProgression` borne total ≥ numéro ; `calculerNbEtapes` reste pur) ; **T4c** « SOM, STD, SPE ou DEN » déjà partout (vérifié) ; **T4d** terme unifié sur « **statistique** » (décision Grégoire ; `construction-attributs.js` disait « holistique »). **#343-T5 reporté** (restructuration du flux, validation visuelle Mac). Sentinelles `sentinelle-den-reliquats-343` + `sentinelle-wizard-golden-creation-319` break-testées ; 913 Vitest verts. Réf. `Retours des testeurs/SUIVI-BUGS.md` #343-T3/T4.
    - ⚠️ **Divergence à réconcilier** : ce travail vit sur la branche cloud `claude/project-access-zyxt6n` (version `1.21.1`) et n'est **PAS encore mergé** dans la branche locale `claude/L0-golden-master-A25` (restée à `1.21.0`). Numéro de PR **non confirmé** (GitHub indisponible en session Cowork ; `git fetch` bloqué côté sandbox).

- [x] 📐 🟢 **#284 LIVRÉ 15 juin 2026** — Harmonisation de la structure des pages (titres + sous-titres descriptifs manquants)
  - **Décision Grégoire (15 juin)** : ajouter titre + sous-titre. Livré pour la vue **Alignement pédagogique** (`conception-carte`, index.html:4150), seule sous-section de Conception sans en-tête : `<h2 class="titre-avec-emoji-toggles">Alignement pédagogique</h2>` + `<p class="text-muted">Organiser visuellement les séquences, leçons et activités du cours</p>` (patron des autres sous-sections, a11y : titre cible de focus au changement de vue).
  - **Tirage au sort = pas concerné** : c'est une **carte** du Labo (`outil-carte`) qui porte déjà son propre titre `outil-carte-titre` — pas une page sans titre au même sens.

- [x] ✅ **#314 FIX LIVRÉ 19 juin (1.20.0, PR #55)** Import : la production choisie n'est pas toujours persistée (`productionId` vide → « Non associé » silencieux). **Cause établie en lecture directe** : `persisterFileDAttente`/`restaurerFileDAttente` (round-trip sessionStorage) omettaient les drapeaux `productionIdParLea` et `estReprise` → au restore, `productionIdParLea` devenait `undefined` et `associerProductionGlobale('')` effaçait une production détectée par Léa. **Fix** : round-trip des deux drapeaux. Reste : confirmation terrain (reproduire import→reload→confirmer).
  - **Contexte** : un travail importé en données réelles arrive avec `productionId` **vide** alors qu'il aurait dû être associé à une production → il s'affiche « Non associé » dans la Liste des évaluations. Diagnostic console confirmé le 3 juin (terrain, pas démo) : `Primavera_1234567_…pdf | DA: [DA-retiré] | productionId: (vide)`. L'étudiant·e est bien rattaché·e (DA valide) ; **seule la production manque**. **Échec silencieux** : aucune erreur console.
  - **Piste** : le `productionId` posé par le pipeline (`associerProductionGlobale` / `changerProductionPipeline`, cf. #313) ne survit pas jusqu'au fichier stocké au moment de **confirmer l'import**. À vérifier : la chaîne import → `travauxStockage` persiste-t-elle `productionId` ? Cas particulier des fichiers nommés avec un DA placeholder (1234567) rattachés par **nom** (le rattachement étudiant marche, la production non). Reproduire : importer un fichier, choisir une production dans le pipeline, confirmer, vérifier `productionId` du fichier stocké.
  - **Atténuation déjà livrée (3 juin, commit `f05cbad4`)** : le badge « Non associé » est devenu **cliquable** (ouvre « Propriétés du fichier » pour associer la production) avec tooltip diagnostique. Guide l'utilisateur, mais **ne corrige pas la cause**.
  - **Priorité** : important pour expérimentateurs (flux import → évaluation de base). À investiguer à froid post-AQPC.

- [x] 🟢 **#315 LIVRÉ 15 juin 2026 (1.18.0)** Bibliothèques — `alert()`/`confirm()`/`prompt()` natifs migrés vers `notifications` + modale async réutilisable
  - **Livré** : nouveau module `js/ui-dialogues.js` (`window.uiDialogues`) = brique async réutilisable : `confirmerAction()` → `Promise<boolean>`, `demanderSaisie()` → `Promise<string|null>` (contrat prompt), `informer()` → `Promise<void>` (alert multi-ligne illisible en toast). Classes design-system, construction `createElement`+`textContent` (XSS-safe), `addEventListener` (zéro inline, CSP), a11y (role=dialog, focus, Échap/Entrée, focus rendu), suppressions en `variante:'danger'` (bouton rouge), option `preformate` (résumés multi-lignes).
  - **3 fichiers migrés (0 natif restant)** : `pratiques-bibliotheque.js`, `planification-bibliotheque.js`, `productions-bibliotheque-ui.js` — `alert→notifications.{erreur,info,succes,warning}`, `confirm→await uiDialogues.confirmerAction`, `prompt→await uiDialogues.demanderSaisie`. Toutes les fonctions concernées étaient déjà `async`.
  - **Tests** : `ui-dialogues-315.test.js` (15 cas, faux DOM fonctionnel, break-testé) + `sentinelle-dialogues-natifs-315-316.test.js` (anti-régression sur les 4 fichiers, break-testée). 737 Vitest verts.
  - **Terrain (Grégoire)** : valider visuellement les modales — deux modes (sombre/clair) + iPad (cibles ≥ 44px, focus). Seul point non vérifiable en cloud.

- [x] 🟢 **#316 LIVRÉ 15 juin 2026 (1.18.0)** Codex — `alert()`/`confirm()`/`prompt()` natifs migrés (mutualise la modale #315)
  - **Livré** : `codex.js` entièrement migré (19 alert + 7 confirm + 6 prompt → 0 natif). Erreurs/statuts → `notifications` ; saisies (nom de codex, renommer, choix d'export) → `uiDialogues.demanderSaisie` ; gardes de modèle antérieur + reload + export sélectif → `uiDialogues.confirmerAction` (danger/preformate) ; détails/résumés multi-lignes → `uiDialogues.informer`.
  - **Flux de fusion 3-way** : `_resoudreConflits` (boucle de résolution de conflits par `prompt()`/`confirm()`) rendu **async** ; unique appelant `actionFusionner` (déjà async) passé en `await`. `actionNouveau`/`actionFermer` passées en `async` (appelées uniquement via `data-action`, fire-and-forget — vérifié). Chemin critique de données préservé (mêmes décisions, mêmes retours).
  - **Sentinelle** : couverte par `sentinelle-dialogues-natifs-315-316.test.js` (codex.js inclus). Changelog 1.18 + release `minor`.
  - **Terrain (Grégoire)** : valider le flux de fusion/comparaison de codex et l'export sélectif avec les nouvelles modales (chemin sensible — données).

- [x] 🟢 **#302 LIVRÉ 13 juin 2026** (commit `0d7e412`, vérifié à froid le 15 juin) — Intégration des guides « som » et « pan »
  - **Livré** : deux entrées ajoutées à `GUIDES_PEDAGOGIQUES` (`js/guides-pedagogiques.js`) — « som » (gateway sommatif, 3 pages) et « pan » (Modalités d'évaluation PAN/PRÉN, 5 pages) + boutons d'accès. Contenu statique (CSP OK).
  - **Module en place** : `js/guides-pedagogiques.js` existe (guides SOLO, ACP, RàI fonctionnels). L'« état absent » noté le 29 mai est **périmé** — il ne reste qu'à AJOUTER deux entrées + deux boutons.
  - **Contenu prêt à coller** : `Plan Accompagnement/CONTENU_guides_som-pan_2026-06-06.md` (entrées `GUIDES_PEDAGOGIQUES` : `som` 3 pages + `pan` 5 pages, boutons, annexe citations vérifiées mot pour mot). Cadre/décisions : `CDC_guides_pratiques_notation_2026-06-06.md`. Passation détaillée : `plans de travail/NOTE-COWORK-integration-guides-som-pan.md`.
  - **Consignes d'intégration (précises)** :
    1. `js/guides-pedagogiques.js` — coller les entrées `som` et `pan` dans `GUIDES_PEDAGOGIQUES` (contenu 100 % statique → `innerHTML` sûr, CSP OK, aucun handler inline).
    2. `index.html`, section `#conception-pratiques-notation` (~l. 5577) — 2 boutons classe **`option-accompagnement-guide-btn`** (PAS `ee-guide-btn`, qui n'existe pas) + `img.btn-inline-icon` + `icons/icon-book.svg`, `data-action="ouvrirGuidePedagogique"` `data-param="som"` / `"pan"`.
    3. **Aucun CSS nouveau** : `cssPrefix` n'est qu'un `className` de panneau (`guides-pedagogiques.js` l. 272) ; le style vient des classes partagées `guide-pedagogique-*` (les guides existants n'ont aucun CSS dédié).
    4. Tester clair/sombre + clavier (flèches/Échap) + iPad. **Commit en fil pédagogique séparé** (pas avec le code C0). Bump `minor`.
  - **Décisions actées (Grégoire, 6 juin)** : code **STD** partout (le « SDT » des vieux plans = erreur, **pas de renommage** — cohérent §A-1/ligne 209) ; dénotation en **page d'horizon courte** marquée « pas encore activable » (≠ description d'une fonction livrée, cf. #318) ; gateway **`som` = guide autonome** ; terminologie **PRÉN/PAN** explicite (badge UI « PAN » conservé + note terminologique dans le guide).
  - **Citations** : CSÉ 2018 + Girouard-Gagné 2024 vérifiées sur PDF sources (annexe §C du CONTENU) — **ne pas reformuler** les passages entre guillemets.
  - **Reste séparé** : le 3e guide `pan-rrec` (Cadre réglementaire) demeure son propre chantier (`Plan Accompagnement/PLAN_guide_PAN_refonte_RREC.md`).
  - **Résiduel Grégoire (non bloquant)** : confirmer l'id `som` ; alléger ou non la page 1 de `pan` (recoupe le gateway) ; convention de tirets (demi-cadratin retenu, vs cadratin des guides existants).

- [x] 🟢 **#325 LIVRÉ 13 juin 2026** (commit `a2478f9`, vérifié à froid le 15 juin) — Carte « Sources et remerciements » dans la page À propos — créé 7 juin 2026
  - **Livré** : carte présente `index.html:10050` (après « Technologies », `#reglages-a-propos`), classes maison réutilisées (aucun CSS nouveau), liens externes `rel="noopener noreferrer"`, garde-fou anti-sur-attribution en dernière ligne. Version minimale retenue (détail nominatif au bas des guides), lien CoP = `aqpc.qc.ca`.
  - **Origine** : demande Grégoire — rendre compte du travail des sources qui ont nourri les logiques de notation et les guides (blogues *Grading for Growth* et *Pratiques alternatives de notation*, ouvrages, CSÉ).
  - **Contenu prêt à coller** : `Plan Accompagnement/CONTENU_apropos_sources-remerciements.md` (carte HTML, style maison `carte`/`carte-titre-bleu` ; + variante avec liste nominative des ouvrages).
  - **Consignes** :
    1. `index.html`, section `#reglages-a-propos` (~l. 9901) — insérer la carte **après « Technologies »** (juste avant le `</div>` de fin de sous-section, ~l. 10014).
    2. Classes réutilisées (**aucun CSS nouveau**) ; liens `target="_blank" rel="noopener noreferrer"` ; contenu statique (CSP OK).
    3. **URL vérifiées (web, 7 juin)** : `gradingforgrowth.com` ; CoP PAN → `aqpc.qc.ca/fr/cop-pratiques_notation`.
    4. Tester clair/sombre + iPad. Commit en fil pédagogique. Bump `patch`.
  - **Décisions Grégoire** : registre « remerciement + sources » ; nommage mixte (blogues + personnes clés, CoP créditée collectivement) ; étendue minimale dans la carte (détail nominatif déjà au bas des guides) ; **garde-fou anti-sur-attribution** en dernière ligne (« s'inspire de… ne les représente pas, toute erreur d'interprétation m'appartient »).
  - **À confirmer (Grégoire)** : lien CoP (page AQPC vs récits `eductive.ca`) ; carte minimale vs variante nominative.

- [x] 🟢 **#338** Retirer le vieil éditeur de pratique mort (pratiques.js + pratique-notation-v2.js) — créé 11 juin 2026 (découverte du lot #328 L2-b2) — **CLOS 14 juin 2026 : `pratiques.js` (2 passages, ~1244 lignes) + `pratique-notation-v2.js` (743 lignes) = ~1987 lignes mortes retirées, 670 Vitest verts**
  - **✅ Preuve structurante (14 juin)** : AUCUN des ids DOM du vieil éditeur n'existe — ni dans `index.html`, ni généré en JS (vérifié pour `pratiqueNotation`, `typePAN`, `colonnePAN`, `statutModalites`, `configurationPAN`, `portfolioActif`, `jetonsActif`, `colonneCartesExtras`, `cartePortfolio`, `carteJetons`, `descriptionModalite`, `configMethodeSelection`, `optionsAffichageIndices`, etc.). Donc **toute** la chaîne (y compris `#statutModalites` / `mettreAJourStatutModalites`, contrairement à l'hypothèse initiale) était morte : no-op derrière des gardes null ou jamais atteinte.
  - **✅ 1er passage (1.17.3) — cœur sûr, 524 lignes** : sous-graphe feuille 100 % mort + bug dormant `sauvegarderDansConfiguration` (paramètre `cle` masquant `window.cle`). Découverte : `chargerConfigurationPAN` défini deux fois (sans arg / à param), la 2e ombrant la 1re par hoisting.
  - **✅ 2e passage (14 juin) — zone grise + helpers orphelins, ~720 lignes** : bloc contigu des 9 fonctions de la zone grise (`afficherInfoPAN`, `afficherOptionsAffichage`, `afficherConfigurationPAN`, `afficherParametresPAN`, `toggleConfigPortfolio`, `toggleConfigJetons`, `afficherCartesExtras`, `chargerModalites`, `chargerConfigurationPAN` à param, `mettreAJourStatutModalites`) + section « jetons personnalisés » (`afficherJetonsPersonnalises`/`ajouterTypeJetonPersonnalise`/`supprimerTypeJetonPersonnalise` + var temp) + `peuplerDropdownPlafondNoteCiblee` + paire conformité orpheline (`getReglesConformiteConfig`/`chargerReglesConformiteConfig`). **Nettoyage des sites d'appel VIVANTS** : `initialiserModulePratiques` (init), `chargerConfigurationPratique` (les rafraîchissements morts retirés, l'écriture de config réelle conservée), `js/productions.js` ×2 et `js/productions-liste.js` ×1 (gardes `typeof mettreAJourStatutModalites`). Flux vivant préservé : bibliothèque/PratiqueManager, `activerPratique`, `initialiserReglesConformite`, `populerSelecteursNiveaux`, `onEchelleConformiteChange`, `mettreAJourUIPratiqueDefaut`. **0 référence résiduelle, 668 Vitest verts.** Sentinelle mise à jour (22 symboles morts absents, 6 vivants présents, anti-masquage `cle`, productions propres).
  - **✅ 3e passage (14 juin) — branche `pratique-notation-v2.js`, 743 lignes** : ce fichier est le moteur de config de pratique **VIVANT** (consommé par `pratiques-bibliotheque.js`). Périmètre établi par **analyse d'atteignabilité scriptée** (graphe d'appels + résolution des **alias d'export** `window.ALIAS = fn` — qui a évité de retirer des fonctions vivantes comme `supprimerTypeTravailSpec` exportée en `…V2`) : racines = exports consommés à l'extérieur + handlers `data-action`/`data-on-change` (seuls mécanismes d'invocation — vérifié : aucun `data-action` dynamique, aucun `addEventListener` hors bootstrap, aucun `window[dyn]`). 28 fonctions injoignables retirées (l'éditeur autonome mort : bootstrap `initialiserPratiqueNotationV2` + chargement/preview/type-selection/sauvegardes en masse + cluster « comptage objectifs » + éditeurs orphelins) + leurs exports + le bootstrap. **31 fonctions conservées** (l'estimation initiale « 13 vivants » était basse). Garantie : la BFS étant sur-inclusive sur les arêtes, aucune fonction conservée ne référence une retirée → 0 référence résiduelle (vérifié). Sentinelle élargie (bloc v2 : 12 morts absents + bootstrap, 6 vivants présents). Ancienne sentinelle #303 « badge v2 » adaptée (la fonction de badge de l'éditeur autonome est retirée ; le guard anti-table-locale demeure).
  - **Méthode appliquée (constante)** : cartographie du graphe d'appels réel (un symbole n'est retiré que si tous ses appelants sont eux-mêmes retirés ET qu'il n'est ni exporté-consommé ni data-action/-on-change vivant — alias d'export résolus), splice/scripts guardés par marqueurs ou ranges à accolades, `node --check`, scan exhaustif des références résiduelles (= 0), sentinelle Vitest. Zéro-dette respectée de bout en bout.

- [x] 🟡 **#298 LIVRÉ 13 juin 2026** (commit `481d93e`, vérifié à froid le 15 juin) — Révision de PRIVACY.md — alignement sur la posture «ouverture publique par défaut» et recadrage du référentiel Loi 25
  - **Livré** : PRIVACY.md aligné sur le régime réel (mainteneur individuel, app 100 % hors-ligne, Cloudflare Access désactivé sans date de réactivation). Si une relecture fine du texte est souhaitée, rouvrir un item ciblé.
  - **Origine** : deux décisions successives. (1) **28 mai 2026 PM** : recadrage du référentiel Loi 25 — la *Loi sur la protection des renseignements personnels dans le secteur privé* (modifiée par la Loi 25) ne s'applique vraisemblablement pas à la configuration actuelle (mainteneur individuel, pas d'activité économique organisée au sens de l'art. 1525 C.c.Q., app 100 % hors-ligne). (2) **2 juin 2026** : retrait du refermage planifié au 1er juillet — Cloudflare Access reste désactivé sans date de réactivation. DEPLOY.md v1.4 §1.4 et §3, et ADR-008 (révisions 28 mai PM + 2 juin) actent ces deux recadrages ; PRIVACY.md reste à aligner.
  - **À NE PAS faire** : chercher un «nouveau cadre de consentement» pour remplacer la liste blanche (bannière, lien permanent, formulaire d'opt-in, etc.). Cette question est mal posée — il n'y a pas de cadre Loi 25 à substituer parce qu'il n'y en avait pas réellement au départ.
  - **À faire** :
    1. Recadrer l'introduction et la posture de PRIVACY.md sur le régime réel : projet d'expérimentation pédagogique personnel, app 100 % hors-ligne, aucune donnée pédagogique sur les serveurs Netlify/Cloudflare, application publiquement accessible par défaut depuis le 3 juin 2026, contrôle d'accès Cloudflare désactivé sans date de réactivation planifiée.
    2. Réviser §3.3 (Données d'accès Cloudflare Access), §6 (Cloudflare Access — entière), §7 (sécurité du canal Navigateur ↔ Cloudflare Access) pour refléter (i) la posture actuelle (Access désactivé, aucun log d'accès individuel, aucun renseignement personnel traité côté infrastructure), (ii) les conditions sous lesquelles Access pourrait être réactivé (cf. DEPLOY.md §3.6 et ADR-008 «À réviser si» : risque opérationnel concret, création de la Voûte, bascule institutionnelle, croissance qualitative inattendue).
    3. Ajouter une section qui précise les conditions où la posture de protection des renseignements personnels devrait être révisée (port par une organisation, base d'utilisateurs hors cercle personnel/collégial, architecture évoluant pour traiter des données pédagogiques côté serveur — cf. DEPLOY.md §1.4).
    4. Aligner le vocabulaire : retirer la qualification «base de consentement explicite Loi 25» partout ; remplacer par «contrôle d'accès opérationnel» / «discipline d'hygiène professionnelle envers les testeurs» ; retirer les références à la fenêtre cadrée 3-30 juin (formulation transitoire abandonnée) ; retirer les références au refermage planifié au 1er juillet (décision abandonnée).
  - **Effort estimé** : 2-3 h. L'analyse de fond est déjà faite dans DEPLOY.md §1.4 et dans la révision ADR-008 du 2 juin ; le travail restant est essentiellement éditorial.
  - **Priorité** : post-AQPC, non bloquant pour la conférence. L'app n'expose aucune donnée utilisateur côté serveur ; l'enjeu est de cohérence documentaire, pas de conformité formelle bloquante.
  - **Documents apparentés à garder ouverts pendant la révision** : DEPLOY.md v1.4 §1.4 et §3 (cadrage juridique + posture actuelle), ADR-008 révisions du 28 mai 2026 PM et du 2 juin 2026 (motivations + conséquences + conditions de réactivation), `Note accès web app - communication CoP.md` (dossier Cowork, vocabulaire grand public à harmoniser).

- [x] ⚠️ **#335 LIVRÉ 11 juin 2026 (1.16.0)** Garde-fous import codex inter-appareils — les 3 volets livrés en une session (volet 1 = Lot A garde de modèle antérieur import+fusion ; volet 2 = Lot B multi-actifs par intention ; volet 3 = Lot C vérification d'écriture post-import), terrain validé avec fixture divergente. La purge à l'ouverture reste #336.
  - **Incident du 11 juin (Mac, 1.12.1)** : l'import du codex iPad (10 juin, test terrain #334 B) a remplacé silencieusement le modèle consolidé du chantier D (29 mai) par le modèle ancien de l'iPad — la migration console one-shot n'avait jamais été exécutée sur l'iPad. Symptôme : 11 productions au `coursId` orphelin (`COURS1766455789356`), liste des évaluations entièrement « Non associé », sélecteur Production vide. Résolu par restauration d'un codex Mac antérieur à l'import (aucun changement de code).
  - **Volet 1 — garde de version de modèle** : l'import devrait détecter un codex porteur d'un modèle antérieur (ex. : marqueur de migration dans le package, ou heuristique « ids estampillés vs COURS_* ») et avertir AVANT d'écraser ; alternative de fond : rendre les migrations one-shot re-exécutables au boot (idempotentes), pour qu'un appareil en retard se réconcilie tout seul. À cadrer avec les sessions C/D de #334.
  - **Volet 2 — trimestre actif non consenti** : après la restauration, l'app a ouvert sur Été 2026. Cause : `corrigerTrimestresMultiplesActifs` (trimestres.js) tranche les multi-actifs par la date du jour (`sessionDepuisMois` : mai-juillet → É) et PERSISTE ce choix — l'intention de l'utilisateur (H2026, déclarée dans le codex importé) est écrasée par une heuristique de calendrier. Privilégier le trimestre actif du codex importé, ou demander.
  - **Trace connexe** : avertissements console `Format de séance non reconnu : SEANCE-2026-05-14-B, groupe: ""` ×3 (saisie-presences.js:338) observés après restauration — à examiner dans la passe #332 (famille assemblage horaire↔GC).
  - **MàJ 11 juin matin** : iPad réaligné sur le modèle consolidé (import du codex Mac restauré, bilan B : 371/372 fichiers, 1 seul > seuil 20 Mo) — le risque immédiat est purgé pour les deux appareils de Grégoire. Les garde-fous (volets 1 et 2) restent à implémenter pour les expérimentateurs.
  - **Incident bis du 11 juin (~09h30, Mac 1.15.1) — RÉSURRECTION** : la version pré-chantier-D de `h2026_productions` (les mêmes 11 orphelines) est REVENUE après un rechargement, alors que l'espace était sain à 09h10 (preuve : codex généré propre) et qu'aucun import ni fusion n'a eu lieu entre les deux. Hypothèse la plus cohérente (non confirmée — état réparé avant d'avoir pu la prouver) : copie IDB restée périmée depuis l'incident de la veille (écriture IDB de la restauration échouée en silence), réhydratée au boot déclenché par le bandeau « scripts périmés » (3 pushes ce matin-là). Réparé par réimport du codex sain de 09h10 ; persistance vérifiée par sondes localStorage + IDB avant ET après reload. Autopsie : codex du 29 mai et du 11 juin tous deux sains sur disque — la corruption ne vivait QUE dans l'espace Safari.
  - **Volet 3 (leçon de l'incident bis) — vérification d'écriture post-import** : après `chargerCodex`, relire en IDB des clés témoins (productions, evaluationsSauvegardees, groupesCours, trimestres) et comparer à ce qui devait être écrit (réutiliser `_indexerSnapshot`/`_sha256Hex` de #334 C) ; écart → alerte explicite « l'écriture n'a pas persisté », jamais d'échec silencieux.
  - **Cadrage rédigé 11 juin** : `plans de travail/PLAN-335-336-garde-fous-donnees.md` — décisions D1-D3 actées par Grégoire le 11 juin.
  - **✅ Lots C + A + B LIVRÉS (11 juin 2026)** : C = vérification d'écriture post-import (clés témoins relues depuis IDB, retentative, alerte) ; A = garde bloquante de modèle antérieur (coursId disjoints) à l'import ET à la fusion ; B = multi-actifs résolus par l'INTENTION (jamais par la date). 23 tests (sentinelles 335A/335B/335C). **Reste : volet purge = #336 Lot D, session dédiée.**

- [x] ✅ **#296 LIVRÉ 19 juin 2026 (1.20.0, PR #58)** Audit catégoriel des items `'Labo Codex'` dans les seed + finalisation du filtre. **L'audit a INFIRMÉ la prémisse « résidus de tests »** (`Rapports/AUDIT-296-seeds-labo-codex-2026-06-19.md`) : sur 37 items, 33 = contenu de bibliothèque FONCTIONNEL masqué à tort. Décisions Grégoire : gabarits/défauts/exemples = **visibles pour tous**. Solution : `estItemDemo` ne matche plus que `'Demo Labo Codex'` (retrait du clause legacy `'Labo Codex'`, seul consommateur) → réapparition sans toucher leur auteur ; 4 items d'infra démo re-tagués `'Demo Labo Codex'` ; résidu `objectifs-michel-calcul-diff` supprimé ; 4 modes d'éval laissés (tag inoffensif). Reste : validation terrain (réapparition en biblio).
  - **Constat 28 mai 2026 PM** (post-livraison #290) : ~30 occurrences de `auteur: 'Labo Codex'` dans 8 fichiers seed (`echelles.js` ×8, `gabarits-utils.js` ×7, `spe-specifications.js` ×4, `demo-namespace.js` ×4, `objectifs.js` ×1, `pratiques-gestion.js` ×1, `planification-bibliotheque.js` ×1, et `pratiques-bibliotheque.js` ×3 — ces 3 ont été migrées vers `'Demo Labo Codex'` dans #290). Le filtre `BibliothequeUI.estItemDemo` (`js/bibliotheque-ui.js:33`) considère tout item avec `auteur === 'Labo Codex'` comme « démo », ce qui masque ces ~30 items en mode normal.
  - **Hypothèse de Grégoire 28 mai PM** : « Beaucoup de ce matériel est en réalité des résidus de tests de développement que j'ai voulu supprimer mais qui sont restés. »
  - **Tri catégoriel à effectuer** (3 catégories) :
    - **A. Vraies démos** : items référencés par le dataset démo (étudiants/productions/évaluations démo qui se chargent via la checkbox de la page d'accueil). Ces items DOIVENT rester visibles en mode démo et compatibles avec le dataset. Action : renommer `'Labo Codex'` → `'Demo Labo Codex'`.
    - **B. Canevas génériques mal taggués** : modèles utiles aux nouveaux utilisateurs (ex. `SPE-simple`-équivalents dans d'autres biblios), pas du démo. Action : déterminer le marqueur approprié (auteur neutre, ou pas d'auteur seed, ou nouveau marqueur `'Canevas Labo Codex'`).
    - **C. Résidus de tests** : anciennes données de dev orphelines, non utilisées ni en démo ni en normal. Action : supprimer du code source (zéro-dette).
  - **Méthode suggérée** :
    1. Lire `js/demo-activation.js` et `js/demo-namespace.js` pour identifier exhaustivement les IDs référencés par le dataset démo.
    2. Pour chaque occurrence `'Labo Codex'` dans les 8 fichiers : croiser avec la liste des IDs du dataset démo. Si référencé → catégorie A. Sinon → catégorie B ou C selon utilité documentée.
    3. Migrer les A vers `'Demo Labo Codex'`, déclasser les B (marqueur neutre), supprimer les C.
    4. Finaliser `BibliothequeUI.estItemDemo` pour ne matcher QUE `'Demo Labo Codex'` (retirer la chaîne `'Labo Codex'` legacy une fois la migration complète).
  - **Filet transitoire en place (livré dans le même commit que #290 phase 2)** : `estItemDemo` accepte temporairement les deux chaînes (`'Labo Codex'` OR `'Demo Labo Codex'`) pour éviter une régression du filtre démo pendant la transition.
  - **Calendrier** : post-AQPC (3 juin 2026). Pas urgent — le système fonctionne correctement avec le filet transitoire.
  - **Effort estimé** : 2-3 h (lecture demo-activation/namespace + croisement + tri + migration + ajustement filtre).
  - **Lien** : #290 (livraison du 28 mai 2026 PM qui a soulevé la question).

- [x] ⚠️ **#337 LIVRÉ 15 juin 2026** Activer la protection de branche `main` dans les réglages GitHub — créé 11 juin 2026 (n° #335 sur la branche skills, renuméroté à l'intégration)
  - **✅ Activé par Grégoire (UI GitHub, 15 juin)** : `main` est désormais `protected: true`. Première PR gatée = #38 (merge 1.17.9). Force-push et suppression bloqués ; *Require status checks to pass before merging* avec `Vitest + Playwright (WebKit)` + `Analyse CodeQL` ; *Require a pull request* décoché (solo dev).
  - **Action manuelle (UI GitHub, ~2 min)** : `Settings → Branches → Add branch protection rule`, pattern `main`. La CI existe et tourne déjà (workflows `tests.yml` + `codeql.yml`, 248+ runs verts).
  - **Procédure détaillée** : `.github/BRANCH-PROTECTION.md`.

---

## Versement du relais Cadre→Trimestre (5 août 2026) — items #369 à #377, TOUS LIVRÉS avant versement

> Relais Cowork du 4 août 2026 (`plans de travail/_archives/RELAIS-cadre-trimestre-2026-08-04.md`).
> Les items portaient les numéros locaux #366-#375, en collision avec les #366-#368 déjà
> pris dans BACKLOG.md (branche d'alignement) — renumérotés **+3 → #369-#378** au versement
> post-merge (merge → main fait le 5 août, `92ba8cb9`). #369-#377 étaient déjà livrés au
> moment du versement → archivés directement ici. Seul **#378** (recalage) reste ouvert dans
> BACKLOG.md. Détail complet des livraisons : SESSION.md (blocs 4-5 août) + le relais.

- [x] **#369** (relais #366) 🔴 Stats calendrier = constantes 15/75 inventées → fonction pure partagée `calculerStatistiquesCalendrier` — LIVRÉ 1.30.2, sentinelle 6 cas + cliquet + intégration.
- [x] **#370** (relais #367) 🔴 Jours de planification/examens comptés comme jours de cours — CLOS PAR CONSTAT 5 août (l'exclusion existait ; cause réelle = borne vide, chaîne #374-relais/#371-relais).
- [x] **#371** (relais #368) 🟡 Numérotation des semaines « paquet de 5 » — LIVRÉ 1.31.1 (⌈rang÷5⌉, comptage par rôle retiré), golden master 75/75 jours vérifié INTÉGRALEMENT contre le PDF officiel committé.
- [x] **#372** (relais #369) 🟡 Validations de cohérence des bornes — LIVRÉ 1.30.3 (`validerCadreTrimestre` 6 règles, zone « À vérifier » non bloquante).
- [x] **#373** (relais #370) 🟡 Format des jours menus vs calendrier — CLOS (prémisse auditée : aucun menu 7 jours ; vrai fix = libellé « Reprise le [date] (horaire du lundi) »).
- [x] **#374** (relais #371) 🟡 Semaines spéciales : champs empilés (`pile-semaines-speciales`), borne de fin redevenue atteignable — LIVRÉ 1.30.1, spec Playwright break-testée.
- [x] **#375** (relais #372) 🟢 Encadré info-box vide autour d'Enregistrer retiré — LIVRÉ 1.30.1.
- [x] **#376** (relais #373) 🟡 Nature « Férié » + titre de carte — ABSORBÉ par la fusion (décision Grégoire « fusion immédiate »), LIVRÉ 1.31.0.
- [x] **#377** (relais #374) 🟢 Zéro-dette : fusion des deux cartes d'événements en « Journées sans cours », clé unique `journeesSansCours`, migration boot sans flag idempotente (localStorage + memoryCache) — LIVRÉ 1.31.0, validé terrain Grégoire (capture 4 août 22h21) + 1.31.2.


---

## Bascule du 17 août 2026 — en-tête de BACKLOG.md

> 20 blocs « État courant » antérieurs au 10 août 2026, versés ici lors de la purge
> de l'en-tête. Motif : ils s'empilaient sans être archivés ; le `head -25` prescrit
> par le rituel de début de session coûtait 14 188 octets au lieu de ~2 000.
> Le dossier #353 et les instructions d'ajout d'item sont RESTÉS dans BACKLOG.md.

> **État courant (9 août 2026, PM — AUDIT DE `Plan Accompagnement/`, le dernier angle mort)** : les **14 documents** jamais audités sont traités au code (§4quater de `ETAT-PROJET.md`). ⚠ **Le compte de plans ouverts BAISSE** : sur les trois documents que le §4ter accusait, **deux étaient intégralement livrés** (`SPEC_mini-guide_cours_balises` — popup, bulle ET renommage OQLF ; `PLAN_decouvrabilite_guides` — les 5 lots). Bilan : 7 terminés, 3 consommés, 2 partiels, 1 jamais amorcé. **Versement : #439** (les 2 guides manquants — `pan-rrec` a ses 4 pages déjà rédigées), **#440** (SRPNF codé en dur dans l'affichage — signalé le 23 mai, jamais versé au backlog ; le calcul, lui, a été généralisé depuis), **📐 #441** (le chantier 3 de SOLO a-t-il encore un objet ?). **Nettoyé le jour même** : le patron `.option-accompagnement` (~51 lignes de `styles.css`, zéro porteur depuis la refonte en accordéons du 26 mai), avec cliquet générique — *toute* classe de ce patron doit avoir un porteur, pas seulement celles d'aujourd'hui. Détail : SESSION.md (bloc 9 août PM).
> **État courant (8 août 2026, SOIR — CORBEILLE DE LA PALETTE #433, 1.60.0)** : retour terrain iPad de Grégoire traité dans la foulée. **Constat NUANCÉ à la vérification** : supprimer était possible au doigt, mais en trois gestes derrière une icône muette — friction, pas capacité manquante (consigné SUIVI-BUGS #153). **Corbeille de dépôt livrée** : glisser un bloc dessus le supprime (un geste), sur le mécanisme Pointer Events de #148 ; dépôt résolu par GÉOMÉTRIE (pendant un drag, l'élément sous le doigt est le bloc déplacé, pas ce qu'il survole) ; sortie ANTICIPÉE dans les trois `onUp` — sans elle le rattachement s'exécuterait sur un nœud disparu. Cible 44 px, deux modes, toast qui rappelle le bouton Annuler (⌘Z n'existe pas sur iPad). Vitest 1960/1960 (227 fichiers), 3 break-tests ROUGE. ⚠ **Question ouverte pour Grégoire** : le double-clic ouvre-t-il l'Inspecteur au doigt sur iPad ? Si non, TOUT l'Inspecteur (durée, semaine, objectifs servis, rétroaction formative) n'est atteignable que par le bouton 🕵️ — porte terrain à vérifier. Détail : SESSION.md (bloc 8 août soir, suite).
> **État courant (8 août 2026, SOIR — GUIDES HARMONISÉS #432, 1.59.0)** : revue de forme et de contenu du guide de la Carte (8 captures Chrome/Mac de Grégoire) élargie à TOUTES les surfaces de guide. **UNE échelle typographique** en sélecteurs groupés pour les deux familles (`planif-guide-*` de la Carte, `guide-pedagogique-*` de SOLO/ACP/RàI/SOM/PAN) — tailles explicites, fin de l'héritage ; corps de la Carte remonté 10.5px → 0.9rem. **Glyphes de badge en TEXTE** (les masques SVG rendaient VIDE). **Page 8 réécrite** (elle documentait la page morte + l'import MD retirés en 1.57.0), pages 1/6/7 retouchées (Exposé + enseignement explicite ajoutés). Plan : `plans de travail/PLAN-guides-harmonisation-2026-08-08.md`. Vitest 1947/1947 (226 fichiers), 3 break-tests ROUGE. 📐 **Idée notée, NON ouverte** : import « à rebours » (une IA écrit le plan, la carte se construit) — jamais expérimenté, à instruire comme chantier neuf si l'envie se confirme. Détail : SESSION.md (bloc 8 août soir).
> **État courant (8 août 2026, FIN D'APRÈS-MIDI — EXPORT PERSONNALISÉ #431 LIVRÉ, 1.58.0)** : retour immédiat de Grégoire sur 1.57.0 (capture Numbers) → **#152 corrigé** (une seule colonne « Semaine » au TSV) et **#431 LIVRÉ le jour même** : 4e niveau « Personnalisé » (8 cases de contenu, 4 sections ordonnables, l'ordre porte sur les CONTENUS jamais sur la structure), préférence `exportPlanPersonnalise` normalisée à la lecture, **modale** réglages + aperçu vivant (textContent, persistance immédiate, « Partir de » un preset). Presets = contrats intouchés (harnais 424 vert sans retouche). Plan : `plans de travail/PLAN-export-personnalise-2026-08-08.md`. Vitest 1934/1934 (225 fichiers), 5 break-tests ROUGE. Hypothèse au terrain (USAGE-FORMATS) : un seul réglage suffit-il, ou gabarits nommés ? Détail : SESSION.md (bloc 8 août fin d'après-midi).
> **État courant (8 août 2026, APRÈS-MIDI — PORTAGE DES EXPORTS #424 LIVRÉ, 1.57.0)** : les lots A→G du plan `plans de travail/PLAN-portage-exports-carte-2026-08-08.md` sont TOUS livrés en une session (branche `claude/session-startup-a8obyo`). **#424 CLOS** : générateur unique 3 niveaux × 3 formats (`js/planification-export.js`), UI « Exporter le plan… » au menu Actions, rétroaction formative dans l'Inspecteur (veto D2b honoré, deux libellés), moissonneuse sans drapeau des rattachements d'activités (les 3 rétroactions du relevé D1 seront portées au prochain boot de Grégoire), page « Plan de la leçon » RETIRÉE en entier (onglet, section, js/organisateur.js, 4 générateurs, 2 sauvegarderChoixActivite, 108 règles CSS). Import MD RETIRÉ (décision Grégoire — il ne s'en sert pas). **#425 amputé de ses préalables** (vivacité productionId, 2 chemins). ⚠ Bug préexistant corrigé au passage : les sélecteurs Rétroaction/Production du nœud Évaluation étaient MUETS (listeners détruits par le innerHTML += du bloc niveau cognitif). Ouvert : **#430** (retirer moissonneuse + repli legacy, rentrée). Vitest 1914/1914 (223 fichiers), 15 break-tests ROUGE. Détail : SESSION.md (bloc 8 août après-midi).
> **État courant (8 août 2026, NUIT+SOIR — TROIS CHANTIERS ALIGNEMENT, fusionnés dans main après coup)** : **1.56.0**. ⚠ **COLLISION DE RELAIS À RETENIR** : deux sessions du 8 août sont parties du MÊME commit `3e8065c3` sans se voir — celle-ci (nuit du 7→8) et celle du matin (#414/#417/#419). Cause : la consigne §3 vit dans `SESSION.md`, et le §3 réécrit était sur une branche non mergée ; `main` portait encore celui du 7 août qui disait « ouvrir sur main, 1.54.0 ». **Le rituel a fonctionné, la prémisse a été vérifiée, et elle était fausse quand même.** ⮕ Conséquence : mes IDs ont glissé de +2 (#418→#420 … #425→#427) et mes trois releases (1.55.0/1.56.0/1.57.0, jamais en production) fusionnent en **1.56.0**. Les messages de commit `637f03b1`, `cc69fcff`, `d611477f` portent les ANCIENS numéros — non réécrits, volontairement. **#420 LIVRÉ** (simplification : vue leçon, filtrage et compaction retirés) · **#422 LIVRÉ** (le graphe accueille l'enseignement : correctif #415 + nœud « Exposé » + famille « Déroulement ») · **#423 LIVRÉ** (durée dans l'en-tête + compteur Σ). **#421 OUVERT** (conformité documentaire, 3 surfaces). Plans de relais : `plans de travail/PLAN-alignement-noeuds-et-duree-2026-08-08.md` et `AUDIT-carte-alignement-exports-productions-2026-08-08.md`. Détail : SESSION.md (bloc 8 août nuit).
> **Audit versé (8 août 2026, fin de soirée)** : `plans de travail/AUDIT-carte-alignement-exports-productions-2026-08-08.md` — exports du « Plan de la leçon », intégration des productions, et renommage de l'onglet. Trié en **#424** (audit exports, ⚠ des données dans la page à supprimer), **#425** (productions, ⚠ préalable `productionId` inter-trimestre) et **#426** (renommage, tranché). **6 décisions D1-D6 en attente**, chacune avec recommandation explicite au §3 de l'audit.
> **État courant (8 août 2026 — #414 + #417 + #419 LIVRÉS, releases 1.55.0 puis 1.55.1)** : audit des 14 écouteurs `db-ready` restants. ⚠ **Trois familles de défauts trouvées, pas une** : la course de #413, la **mauvaise cible** (`document` au lieu de `window` → deux migrations **jamais exécutées**, l'une depuis le 16 avril, l'autre depuis le 18 décembre 2025), et le **mauvais drapeau** (`db.ready` vrai avant la synchro ; `db.isReady` inexistante). Correctif de fond : **portillon unique `window.auDbPret`** dans `db.js`, les 12 sites y passent (y compris `main.js` et les 4 déjà corrects), plus un **cliquet** qui interdit toute nouvelle variante manuelle. #417 est devenu bloquant en cours de route (12 fichiers modifiés = 12 `?v=` à bumper, sinon correctif livré et inerte) : `release.mjs` bumpe désormais lui-même le `?v=` de ce qu'il embarque. Vitest **1795/1795** (+25). **18 break-tests, 17 ROUGE** — le 18e, vert et honnête, a motivé une sentinelle de plus. ⮕ Ouvert : **#418** (`db-ready` jamais émis si IndexedDB indisponible). ⮕ **Porte terrain** : des préférences d'avant le 16 avril peuvent réapparaître au premier démarrage — c'est la migration qui fait enfin son travail. ⮕ **#419 (1.55.1)** : réveiller `migrerPreferencesV3` a révélé qu'elle **effaçait du legacy qu'elle n'avait jamais lu** — elle lisait la clé BRUTE `modalitesEvaluation` (inexistante, la vraie est namespacée par trimestre) et purgeait, elle, la clé NAMESPACÉE du trimestre actif. Grégoire n'a été épargné que par hasard (son trimestre actif n'a pas cette clé) ; ses valeurs réelles étaient intactes dans a2024/a2025/h2026. Deux autres défauts fermés au passage (un espace réservé vide comptait comme « déjà migré » ; la purge devançait la mise à l'abri). Vitest **1805/1805**. Détail : SESSION.md (bloc 8 août).
>
> **État courant (5 août 2026 NUIT — VAGUE DE CORRECTIFS PERF+LOGIQUE LIVRÉE)** : **#394→#401 LIVRÉS + #402 partiel (L11)**, 9 releases patch **1.31.14 → 1.31.22** sur la branche `claude/plans-travail-correctifs-perf-gyxf36` (NON mergée — merge → main = décision Grégoire). Chaque lot : sentinelle break-testée ROUGE→VERT (8 fichiers de tests neufs, 21 break-tests), Vitest **1415/1415** au dernier push. Golden masters (#368, simulerIndices, hybride) restés verts. Mesures : pipeline présences ×6,3-9,7 (Node) ; boot/modal = re-mesure terrain due (portes aux items #400/#401). Référence : `plans de travail/_archives/CORRECTIFS-PERF-LOGIQUE-consigne.md` + SESSION.md (bloc 5 août nuit).
> **État courant (5 août 2026 SOIR — AUDIT PERF + LOGIQUE VERSÉ)** : audit en lecture seule livré (`Rapports/AUDIT-PERF-LOGIQUE-2026-08-05.md`, branche `claude/audit-perf-logique-6i4qol` mergée `main` fast-forward sur instruction Grégoire). **Versement trié en #394-#402** (section dédiée en tête de « A faire » : 2 rouges moteur, 5 jaunes, 2 verts). 3 rouges logique confirmées par sonde (configurables SOM → P=0 ; deux « terminales » STD ; couture stocké/simulé #326 T1), pipeline présences mesuré ~460 ms à 75 étu. **2 pistes perf RÉFUTÉES par mesure — ne pas rouvrir** : `db.statsStockage` (1,3 ms/appel throttlé 60 s) et `verifierUniciteIds` (linéaire, Set). Aucun correctif code (consigne), Vitest 1354/1354 inchangé. Détail : SESSION.md (bloc 5 août soir).
> **État courant (5 août 2026 PM — VAGUE DE CORRECTIFS AUDIT LIVRÉE, MERGÉE ET DÉPLOYÉE)** : **1.31.13** mergée `main` (`0889c063`, fast-forward, instruction Grégoire) — les correctifs 1.31.4→1.31.13 sont EN PRODUCTION. **#379-#392 TOUS LIVRÉS + #393 partiel**, chaque fix avec sentinelle break-testée ROUGE→VERT (12 sentinelles neuves). Vitest 1354/1354. **Prochaine session : AUDIT PERFORMANCE + LOGIQUE** — référence unique `plans de travail/_archives/AUDIT-PERF-LOGIQUE-consigne.md`. Restent à Grégoire : validations terrain (formulaire Trimestre, import sélectif, activation GC), décisions #393/#367, changelog 1.31. Détail : SESSION.md (bloc 5 août PM, suites 1-3).
> **État courant (5 août 2026 — MERGE → MAIN FAIT + double versement)** : **1.31.3**, mergée `main` (fast-forward `3ce1d9b0..92ba8cb9`, sur instruction Grégoire) et déployée — tout le relais Cadre→Trimestre (1.30.x-1.31.x) + l'audit qualité sont EN PRODUCTION. Vitest 1297/1297. **Versement 1** : items du relais Cadre renumérotés **#369-#378** (+3, collision consignée au relais) — #369-#377 déjà livrés → `BACKLOG-ARCHIVE.md`, seul **#378** (recalage, automne) reste ouvert ci-dessous. **Versement 2** : audit qualité du 5 août (`Rapports/AUDIT-QUALITE-2026-08-05.md`) trié en **#379-#393** (section dédiée en tête de « A faire », 2 rouges + 10 jaunes + 3 verts ; la 4e rouge du rapport enrichit l'item **#367** existant). Détail : SESSION.md (bloc 5 août PM).
> **État courant** : bêta publique **1.20.0** (build 0619-1829), 19 juin 2026. Session 19 juin (Claude Code cloud) : **7 PR mergées #52→#58** — #305 reliquat a11y, #342 prévention CC, #326 sous-item « non constructible », #321 note différée, #314 import productionId, #333 Lot 2 export CSV synthèse, #18 info-bulles Labo+Présences, #296 fin du masquage « Labo Codex » — + checklist tests Mac. Détail dans `SESSION.md` (clôture 19 juin). Beaucoup de ces items gardent une porte de **validation terrain Mac** (rendus 2 modes), consignée dans la checklist.
> **État courant (28 juin 2026, nuit)** : **1.25.0** (build 0628-2006). Journée dense : durabilité IndexedDB complète livrée (Option A/B/C → main **1.24.1/1.24.2**, PR #70/#71) ; **#360** prévention des doublons d'évals note-égale (**1.24.0**) ; puis **#358 migration des modèles namespacés EXÉCUTÉE + VALIDÉE en live** (L2 VERT, a2025 MAE 0,148, h2026 46/46 notes identiques) + correctif d'un **bug de re-semage du global au boot** (**1.25.0**, commit `bbe77cd5`, PR #69, sentinelle break-testée). **#346 productions re-réparé durablement** (le revert de durabilité est fermé en réel). Découvert ce soir : **#362 grilles h2026 désappariées des évals** (ci-dessous) qui **englobe #354**. Détail : `SESSION.md` (bloc 28 juin nuit) + `plans de travail/RELAIS-grilles-h2026-desappariees.md`. Chip en arrière-plan : boot atomique #358 (`db.flush()` avant le flag).
> **État courant (3 juillet 2026 SOIR — vague 3 BATCH 2)** : **1.27.3** (branche `claude/relais-vague-3-etat-n3owyf`, non mergée — Grégoire décide du déploiement). Batch 2 (4 chantiers choisis par Grégoire en session) : **boot atomique #358** (await db.flush() entre G4 et le flag, sentinelle) ; **#353 Option 1 LIVRÉE** (observabilité budget localStorage : db.statsStockage(), alerte 80 %/95 % throttlée, db.purgerBackupsV1() console DRY-RUN par défaut — exécution réelle = décision Grégoire août ; code mort libereCacheLocalStorage retiré ; RESTENT options 2/3/4 à trancher SUR CHIFFRES + tamponsImages) ; **#299 CLOS** (commentaires réalignés + module mort js/statistiques.js retiré en entier) ; **#338/#302/#325 = constat DÉJÀ LIVRÉS** (14/13/13 juin, archivés — la ligne d'historique ci-dessous les présentait comme ouverts, s'y référer avec prudence). Vitest 1271/1271 ; 3 sentinelles break-testées. Détail : `SESSION.md` (bloc 3 juillet soir).
> **État courant (3 juillet 2026 — vague 3, DÉPLOYÉE)** : **1.27.2** (build 0703-0951), mergée `main` (fast-forward, décision Grégoire) et déployée — les 3 vagues de juillet (1.27.0/1.27.1/1.27.2) sont EN PRODUCTION. Vague 3 : **bilan factuel vagues 1-2** (12/12, tableau SESSION.md) ; **#328 = déjà absorbé** (trace consignée) ; **#118 + #283-T1 CORRIGÉS** (overflow Calendrier, min-width:0 + empilement mois) ; **#363 LIVRÉ** (audit currency, 13 écarts, `Rapports/AUDIT-363-currency-skills-docs-2026-07-03.md`) ; **#306 LIVRÉ** (Lots 1-2-3 : Créer/Enregistrer + save explicite Trimestre ; 📐 apparition formulaire Enseignant·e restée ouverte). Vitest 1257/1257 ; 3 sentinelles break-testées. ⚠ Reprise AOÛT : validations terrain accumulées (vagues 1-2-3, 2 modes), triage worktrees, 📐 #365, #364 T3/T4/T5. Détail : `SESSION.md` (bloc 3 juillet).
> **État courant (2 juillet 2026, soir — vague 2)** : **1.27.1** (même branche `claude/relais-2026-07-02-tasks-w25heb`, non mergée, pas de PR). Vague 2 : **#356 LIVRÉ** (golden master anonymisé par défaut, `--nominatif` opt-in) ; **#355 LIVRÉ** (navigation élève en consultation) ; **#305 LIVRÉ** (reliquat réel = popup « Conseil », role/aria/focus) ; **#359 = déjà livré le 26 juin** (écart de prémisse, sentinelle 7/7) ; **#365 = audit blanc** (aucun manque, 📐 question à Grégoire) ; **SUIVI-BUGS #121 enquêté** (bouton introuvable au code actuel, confirmation visuelle août) ; **inventaire worktrees** produit (`plans de travail/INVENTAIRE-worktrees-2026-07.md` — distracted-swanson prouvé ABSORBÉ). Sentinelles 8 cas break-testées. Détail : `SESSION.md` (bloc 2 juillet soir).
> **État courant (2 juillet 2026)** : **1.27.0**. Session relais « cinq tâches » (Claude Code cloud, branche `claude/relais-2026-07-02-tasks-w25heb`) : **SUIVI-BUGS #116** (captures phantômes/duplicatas — flux auto scopé GC actif + dédoublonnage + wrapper LEGACY retiré ; facette C déjà résolue par #280) ; **#145** (PDF étranger — garde productionId vide) ; **#313** (écrasement silencieux du sélecteur global d'import neutralisé) ; **#344** (carte Légende fusionnée en tête du calendrier) ; **#361** (suppression de trimestre : garde anti-actif + ressaisie du nom + export auto). 5 sentinelles/32 cas, toutes break-testées ; Vitest 1236/1236 ; Playwright NON exécutable en cloud (WebKit absent) → CI au push. ⚠ Portes terrain d'août : #313/#344/#361 (2 modes). Détail : `SESSION.md` (bloc 2 juillet) + `plans de travail/_archives/RELAIS-2026-07-02-cinq-taches.md`.
> **État courant (29 juin 2026)** : **1.26.2** (build 0629-0909), DÉPLOYÉE. Grosse séance backlog (Claude Code) : audit accompagnement → tuyau 1.26.1 (cache-busting + changelog 1.26) + **#364** ; **6 items livrés** (#351, #304, #311, #310, #240, #347) en vagues parallèles disjointes ; **ménage racine** (18→14 .md). **#313 + #344 TRANCHÉS** = paire parallèle prête à lancer. ⚠ **Grégoire EN CONGÉ TOUT JUILLET — reprise AOÛT.** À la reprise : lancer #313+#344, faire les validations terrain (#310/#311/#351/#240/#347, 2 modes), trier les 5 worktrees à contenu. Détail : `SESSION.md` (bloc 29 juin).
