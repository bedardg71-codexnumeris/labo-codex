# Notes de version — Monitorage pedagogique

> Document de gestion locale. Historique complet avec dates.
> Derniere mise a jour : 18 mai 2026

---

## Beta 99.48 (18 mai 2026, sessions A+B partielles — chantier en cours)

**Refactor `profil-etudiant.js` (sessions A+B, branche `refactor/profil-etudiant`)**

*Session A (18 mai 00:30, 3 sous-modules LOW)*
- **3 sous-modules** : `profil-etudiant-helpers.js` (630), `profil-etudiant-calculs.js` (1 547), `profil-etudiant-rapport.js` (426).
- Resume : 37 fonctions promues `window.X` (convention systematique decision etape 1 b). 11 helpers internes (interpreterMobilisation/Performance/Completion/Assiduite, obtenirCouleurNiveauIDME, obtenirDetailsAssiduite, etc.) promus pour securite frontiere.
- 2 fonctions cyc > 30 deplacees dans `calculs.js` (heritees du god module) : `calculerIPB` 36, `determinerCibleIntervention` 58. A eclater etape 4 session D.

*Session B (18 mai matin, 2 sous-modules MEDIUM)*
- **2 sous-modules** : `profil-etudiant-diagnostics.js` (865 LOC fichier, 11 fonctions diagnostics SRPNF/Criteres + blocs RLO + onglets de developpement), `profil-etudiant-confidentiel.js` (330 LOC fichier, 8 fonctions modal PII + services adaptes + sous-categories medicales).
- 19 fonctions promues `window.X` (11 + 8, 6 exports existants conserves cote confidentiel + 2 promus session B).
- 2 variables module-scope encapsulees dans l'IIFE confidentiel (`_confidentielDaActuel`, `SOUS_CATEGORIES_SERVICES`) — pas de fuite cross-module.
- **Conformite SKILL_Securite_donnees.md §9.1** (zone confidentiel risque PII) : preservation comportementale stricte, echappement existant conserve (escapeHtml local + echapperHtml canonique cote sous-categories). 1 acquittement `// security-ok` inline sur innerHTML re-flague baseline F.16 hook Defense J (valeurs statiques + echapperHtml() defense profondeur).
- **Bug latent preserve** : SUIVI-BUGS #105 — `sauvegarderConfidentiel` appelle `chargerProfilEtudiant()` derriere un `typeof === 'function'` guard, mais la fonction n'est definie nulle part dans le codebase. Branche dead, rechargement post-sauvegarde n'arrive jamais. Preservation comportementale stricte du refactor.

*Bilan cumule sessions A+B (profil-etudiant.js)*
- **5 sous-modules + residu** : 8 818 → 5 207 LOC residu (**-40,9 %**). 56 fonctions promues `window.X`. 0 nouvelle fonction cyc > 30 introduite.
- **Tests** : 70 Vitest + 10 Playwright = **80/80 verts** (canari multi-module + sentinelle 60+ exports + structure monstre `afficherProfilComplet` + etat pivot `window.profilActuelDA` + orchestrateur cascade `consulterEvaluation` + 2 Playwright dedies profil-etudiant chargement).
- **Sessions C+D restantes** : actions cascade (`consulterEvaluation` orchestrateur multi-timeouts, +calculerDetailsNoteFinale cyc 57) puis sections affichage ~3 700 LOC + etape 4 (eclatement `afficherProfilComplet` 58, autres heritages).

---

## Beta 99.45 → 99.47 (15-17 mai 2026)

**Premiers refactorings de god modules selon METHODE-REFACTORING**

*Methode etablie (15 mai)*
- **`audit/refactoring-prep/METHODE-REFACTORING.md`** : document methodologique en 9 sections — etapes 0→6, anti-patterns §5, gabarit de capitalisation §6.5, journal de bord §7. Apporte sur `main` (commit `1b4818d`).
- **6 propositions Categorie B** issues du refactor `bilan-reflexif.js` actees et integrees a la methode : §3 etape 0 (convention nom de branche), §3 etape 1 (helpers cross-module a promouvoir avant extraction), §3 etape 4 (audit ESLint complexity sur TOUS les sous-modules), §4 check-list etape 3 (items cyc + grep helpers), §5 anti-patterns §5.6 + §5.7, §6.5 gabarit (rubrique Tests Playwright).

*Refactor `bilan-reflexif.js` (Beta 99.45, 15 mai, commit `b0e432d`)*
- **8 sous-modules** : `bilan-reflexif-core.js` (425), `-editeur.js` (829), `-import-export-texte.js` (888), `-parcours.js` (623), `-reflexion.js` (444), `-csv.js` (815), `-rapport.js` (955), residu (284).
- **Cyc max** : 63 → 27 (−57 %). **0 fonction au-dela de cyc 30** dans tous les sous-modules. Plus gros fichier : 4 716 → 955 LOC (−80 %).
- **+10 tests Vitest** (parsers + agregation). 3 bugs latents decouverts et corriges pendant le refactor (`rendreAideHTML`/`toggleAide`, `tronquer`, resync ctx ↔ parent dans state machine).

*Refactor `productions.js` (Beta 99.46, 16-17 mai, 8 commits sur `refactor/productions`)*
- **3 sous-modules** : `productions-import-export.js` (693), `productions-liste.js` (456), `productions-bibliotheque-ui.js` (714) + residu (2 233).
- **Cyc max** : 80 (`sauvegarderProduction`) → 29 (`gererChangementTypeProduction`) (−64 %). **0 fonction au-dela de cyc 30**. Plus gros fichier : 3 994 → 2 233 LOC (−44 %).
- **6 helpers d'etape 4** extraits de `sauvegarderProduction` cyc 80 (lireDonneesFormulaireProduction, validerChampsObligatoiresProduction, validerEcheancesDansTrimestre, gererDoublonProduction, construireProductionData, rafraichirInterfaceApresSauvegarde) + 3 helpers extraits de `afficherFormProduction` cyc 47 (peuplerCartouchesProduction, prerenseignerFormulaireProduction, reinitialiserFormulaireProduction).
- **+14 tests Vitest** (helpers tri, doublons, badges, canari). Helper `chargerScript(path, stubs, fauxWindowExistant)` etendu d'un 3e parametre pour enchainer N sous-modules dans un meme sandbox — reutilisable pour `trimestre-v2.js`, `profil-etudiant.js`, `evaluation.js`.
- **Validation manuelle** (17 mai) sur les 6 cas d'integration MODULES-MAP §2.2 (Safari Mac, modes sombre + clair) — tous OK.
- **Bugs latents preserves** (preservation comportementale stricte) : SUIVI-BUGS #96 (`event.target.value` Chrome retro-compat), #97 (`productionEnCoursEdition` vs `productionEnEdition` desynchronises). A traiter dans un cycle dedie.

*Refactor `trimestre-v2.js` (Beta 99.47, 17 mai, 3 sessions A+B+C, branche `refactor/trimestre-v2`)*
- **8 sous-modules** : `trimestre-v2-init.js` (~780), `-liste.js` (~485), `-horaires.js` (~830), `-enseignants.js` (~315) [session A], `-cours.js` (~1 040), `-etudiants.js` (~990), `-groupes-cours.js` (~970) [session B], `-orchestre.js` (~790) [session C] + residu (~599).
- **Cyc max sur la zone 8 (cible explicite du scope session C)** : `changerGroupeCoursActifV2` 94 → < 15 (eclatee en 4 helpers + 1 selon Écart #8 MODULES-MAP §2.4 : `_definirInfoCoursModeCours`, `_definirInfoCoursModeGroupeCours`, `_rafraichirVuesContextDependantes`, `_rafraichirProfilEtudiantSiVisible`). Plus gros fichier : 6 584 → 1 040 LOC (-84 %).
- **4 fonctions cyc > 30 restantes** hors-scope du refactor C (sous-modules cours + groupes-cours session B, heritees du god module) : `sauvegarderCoursV2` 56, `mettreAJourCarteResumeGroupeCoursV2` 34, `remplirFormCoursV2` 31, `genererNomGroupeCoursV2` 31. A traiter dans un cycle dedie productions-style.
- **Atomicite preservee** (Écart #6) : le couple `db.setSync('groupeCoursActif', X)` + `db.setSync('infoCours', Y)` reste consecutif sans await dans chaque helper de definition.
- **+11 tests Vitest** (canari + sentinelle 8 zones + structure monstre + hub residuel + etat pivot trimestreActif) + **+2 Playwright** (chargement WebKit + sentinelle exports browser).
- **Validation manuelle** (17 mai) sur les 5 cas d'integration MODULES-MAP §2.4 (Safari Mac, modes sombre + clair) — tous OK.
- **Bugs latents preserves** (preservation comportementale stricte) : SUIVI-BUGS #99-101 (3 XSS innerHTML transferes tels quels en session B, acquittes `// security-ok`), #102-104 (dead code apparent dans `afficherFormHoraireV2` / `modifierHoraireSelectionneV2` / `activerGroupeCoursV2` — variables et fonctions non declarees dans le scope, ReferenceError latent). A traiter dans un cycle dedie Categorie B.

*Tests de regression — etat consolide*
- Total : 65 Vitest + 8 Playwright = **73 verts** (apres consolidation des 3 refactors). Sandbox de tests reproductible pour les futurs refactors.

*Capitalisation*
- Retrospectives detaillees dans `audit/refactoring-prep/MODULES-MAP.md §2.2` (productions), §2.4 (trimestre-v2), §2.5 / METHODE §7 (bilan-reflexif).
- 4 nouvelles propositions Categorie B issues du refactor productions (cf. METHODE §7 module productions.js).
- Trouvailles trimestre-v2 transferees en memoire feedback : audit cross-zone tardif post-deletion (grep noms de fonctions extraites dans le residu), doublons d'export pre-deletion, convention `window.X` systematique pour appels cross-module, factorisation 2 branches dupliquees en parametres, decoupage supplementaire requis pour cible dure cyc 30 (non planifie initialement).

---

## Beta 99.38 (5-8 mai 2026)

**Securite automatisee, alignement DS et conventions exports**

*Defense A — sandbox iframe pour apercus d'imports (PR #14)*
- **Composant `ApercuSandbox`** : tous les apercus d'imports (grilles, echelles, productions, cartouches, pratiques, tampons) passent par une iframe `sandbox="allow-same-origin"` sans script, sans top-navigation, sans formulaires.
- **Effet sur le modele de menaces** : C-08 (injection HTML par data corrompue) passe a **Bon**.

*Defense I — tests securite automatises (PR #15)*
- **29 tests verts** en ~12 s : 23 Vitest (fonctions pures) + 6 Playwright WebKit (sandbox/CSP).
- **Couverture** : A.3 hash CSP, B sanitisation profonde, C validation imports, D whitelist exports, E integration sandbox, F lint statique baseline `innerHTML`.
- **Hook pre-push optionnel** active via `core.hooksPath = scripts/hooks` (Defense J du modele de menaces). C-01 et C-02 passent a **Bon**.
- **Doc utilisateur** : `docs/securite/TESTS-AUTOMATISES.md`.

*#263 — alignement design system des modales metadonnees CC*
- 3 modales partagees dans `cc-license.js` + modale K-beta preview (`securite-export-preview.js`) alignees au DS.
- ~22 references mortes `.cc-modal-*` nettoyees, 2 bugs latents corriges (`Collegial` sans accent, inputs email/url sombres en mode clair).

*#262 Phase 1 — convention nommage exports*
- Helper `genererNomFichierExport` etendu (extension parametrable, precisionDate). 4 modules pilotes migres : `import-export.js` (fix bug accents critique), `reserve.js`, `codex.js`, `codex-data.js`.
- **Conventions actees** : tirets partout, extensions simples (`.zip`, `.json`...), retrait du prefixe `CONFIDENTIEL-`, minuscules.

*Wizard V1 fantome retire*
- `pratiques.js` : 5458 → 3686 lignes (−1772, −32 %). 33 fonctions V1 supprimees, double export `window.ouvrirWizardPratique` elimine. Bouton « Editer » bibliotheque pratiques (silencieusement casse) corrige.

*Menage du root et de docs/*
- 15 fichiers retires du root (`obsoletes/`), 2 specs promues vers `docs/architecture/` (SPEC-CONSOLIDATION-APPRENTISSAGES, Spec - Prompt et parser questionnaires).
- `docs/` top-level passe de ~50 a 16 fichiers ; brouillons obsoletes archives, plans actifs deplaces vers `plans de travail/`.

*Correctifs UI*
- **#265** mode clair : label « Groupe-cours actif : » devenait noir sur fond bleu (`.mode-clair label` ecrasait la couleur claire). Override scope `.mode-clair .bandeau-groupe-cours label`.
- **Icone onglet Conception** : `icon-genealogy` → `icons8-mind-map`.
- **#258** selecteur Normal/Anonymise transforme en bouton-icone dans l'en-tete (livre 6 mai).
- **#260** credit Icons8 ajoute dans Reglages > A propos (livre 6 mai).

*Refonte Reglages > Donnees (#247, livre 5 mai PR #11)*
- Architecture des 4 concepts (Codex, Reserve, Codex data, Voute) appliquee a la section Donnees ; flux d'import/export simplifies.
- **#251** Codex data : extraction depuis les Archives (livre 6 mai PR #13).
- **#252** Labo autonome : sortie de la section Suivi (livre 5-6 mai).

---

## Beta 99.32 (2 mai 2026)

**Phase 7 doublons, Reserve v1.1 et panneau Contenu du versement**

*Phase 7 — Plusieurs fichiers par etudiant*
- **Module nouveau `js/travaux-doublons-ui.js`** (~440 l.) : modale « Plusieurs fichiers par etudiant », bandeau dans la liste des evaluations, option « Voir les fichiers multiples » dans Actions, bouton « Livrable additionnel » dans la modale d'import.
- **2 familles** : 🟢 jeton (`_-_Jeton_`) / 🔵 plusieurs fichiers + 4 tags informatifs (PDF+image, memes noms, dates proches, statuts mixtes).
- **Validation par carte** : bouton « ✓ Valider ce cas » avec persistence (`cas_fichiers_multiples_valides`).
- **Compteur carrousel dedup** : format `(N el · M fich)` quand asymetrie etudiants/fichiers, sinon `(N)`.

*Reserve v1.1 — Manifeste local cross-mode et hydratation*
- **#248** : auto-mise-a-jour du `manifeste-archives.json` global a chaque versement, en mode FSAPI ET ZIP. Hydratation au boot si handle FSAPI persiste avec permission `granted`.
- **#249** : carte « Reserve » dans Reglages > Donnees avec bandeau dossier FSAPI + tableau des versements, badges de mode (vert FSAPI, orange ZIP).

*#257 v2.B-α — Panneau « Contenu du versement »*
- Modale Ouvrir un versement enrichie : compteurs filtres (>0 seulement), liste expandable des etudiants avec toggle anonymisation (`Eleve 1, 2, 3…`).
- Helper `_extraireContenuVersement` qui matche les cles namespacees (`h2026_*`, `a2025_*`).

*Renommage #259 — « Reserve / verser / versement » → « Archives / archiver / archive »*
- Vocabulaire universel pour le novice. Codex et manifeste preserves dans le code.
- Modules JS, ~13 entrees d'aide, modales, BACKLOG, memoires, ECOSYSTEME-DONNEES.md mis a jour.

---

## Beta 99.26 → 99.30 (26-28 avril 2026)

**Voie de retour Reserve complete**

*Reserve v1 (#251, 26 avril)*
- **Module `js/reserve.js`** (~750 l.) : API `verserGroupeCours`, `estimerVersement`, `listerGroupesVersables`. Filtrage en deux passes, UUID v4, ZIP structure telechargeable.
- Bouton « Verser dans la reserve... » dans `#codex-menu`, modale `#modalReserve`.
- **5 bugs corriges** en validation terrain : 11 cles trimestre non reconnues, ordre fichiersTravaux/annotationsTravaux, copies archivees des bibliotheques, cours orphelin A2025, regex trop permissive.

*Reserve v1.5 — Automatisation FSAPI (#253, 28 avril)*
- Versement automatique Chrome/Edge via `FileSystemDirectoryHandle` persiste en IndexedDB (`reserve_fsapi.handles`).
- Helpers FSAPI, ecriture directe, fusion globale du manifeste, branchement (FSAPI vs ZIP). Safari = flux ZIP inchange.
- **Sentinelle** : `meta.json` ecrit en dernier dans le dossier versement → sa presence garantit que les autres fichiers sont complets.

*Ouvrir la reserve v1+v1.1 (#254, 28 avril)*
- **Module `js/reserve-ouvrir.js`** (703 l.) : reimport selectif grilles/echelles/tampons, toggle « copie en double ».
- **3 vues etape 1** selon le navigateur (Chrome+handle = liste via manifeste, Chrome sans handle = picker dossier, Safari = file picker + mention `~/Downloads/`).

*Productions, cartouches, pratiques (#257 v1, 28 avril)*
- Reimport etendu : 3 nouvelles facades dans `productions.js`, `cartouches.js`, `pratiques.js` (pattern `importerXxxExternes`).
- **Auto-cochage des references croisees** : production → grille+echelle, cartouche → grille, pratique → echelle (n'auto-decoche jamais). Annotations « ref. manquante » (orange).

*Codex allege (#250, 28 avril)*
- **TimeMachine retire du codex** : `js/codex.js` 3017 → 2556 lignes (−461). Purge silencieuse au boot via flag idempotent. CLE_SNAPSHOT_AVANT conserve (utilise par actionFusionner).

*Aide aux modales Reserve (#256, 28 avril)*
- Boutons d'aide ✴️ ajoutes dans toutes les modales du flux Reserve avec popups dediees.

*Documentation*
- **#255** clarification de `ECOSYSTEME-DONNEES.md` (26 avril) : double fonction Reserve (Depot + Fonds consultable) + nouveau sous-flux « Voie de retour ».

---

## Beta 99.25 (25 avril 2026)

**Refonte synthese de retroaction PDF**

*Architecture — 3 nouveaux modules + 1 lib + zero-dette*
- **`js/synthese-retroaction-data.js`** (340+ l.) : module pur, `construireFeedback()` assemble la shape depuis les sources existantes.
- **`js/synthese-retroaction-rendu.js`** (450+ l.) : `rendreSyntheseHTML()` HTML/CSS inline, polices stack systeme, hex absolus.
- **`libs/html2canvas.min.js`** (198 Ko, MIT, zero eval, CSP-compatible).
- **`js/travaux-export-pdf.js`** : 2304 → 1156 lignes (**−1148 nettes**, zero-dette).
- **Pipeline async** : `ajouterPageSynthese()` = `construireFeedback` → `rendreSyntheseHTML` → DOM off-screen → `html2canvas` scale 2x → `addPage` jsPDF (hauteur dynamique `scrollHeight`).

*Principe directeur — « reformatage, pas production »*
- Aucun nouveau champ, aucun calcul nouveau. Tout vient du modele existant. Sections sans donnee → invisibles.
- Sources reutilisees : `evaluation`, `groupeEtudiants`, `productions`, `infoCours`, `trimestres`, `grillesTemplates`, `echellesTemplates`, `cartouches_${grilleId}`, `compterAnnotationsDetailees`, `obtenirRetroactionsObservations`, `obtenirRetroactionsErreursFr`, `obtenirConfigJetons`, `calculerDetailsNoteFinale`, `couleursCategories`, `OUTILS[errfr_X].couleurBouton`.

*Decisions cles*
- **Rasterisation HTML** via html2canvas (pas reproduction jsPDF natif — design B trop dense).
- **Hauteur de page dynamique** (≥ 11" Letter US, depasse si contenu dense — l'eleve scrolle sur cellulaire).
- **Couleurs en hex absolus** (`var(--…)` non resolu par html2canvas hors DOM live).
- **Polices stack systeme** (Mac/iPad SF + SF Mono ; image rasterisee donc indifferent au lecteur cellulaire).
- **Tampons** : icones PNG **tintees** par couleur de categorie (`canvas globalCompositeOperation: 'source-in'`).
- **Erreurs FE top 2** (focus, pas releve exhaustif) avec couleur native depuis `OUTILS[id].couleurBouton`.
- **Note provisoire** : niveaux lettres + 1 phrase chiffree unique en tete + 2 colonnes (retenus / a venir + obligatoires).
- **Jetons** : 1 compteur par type active dans la config (Delai, Reprise, Reprise ciblee).
- **`NOMS_NIV` retire** → `libelleNiveau(echelle, code)` lit depuis l'echelle utilisateur (anti-hardcoding).

---

## Beta 99.21 → 99.22 (21-24 avril 2026)

**Autonomisation Phases 3-4 livrees + Phase 5 demo tentee puis revertee**

*Phase 3 — Affichage `inspireDe` sur cartes biblio (22 avril, b0422-0832)*
- Helpers `BibliothequeUI.formaterInspireDe` + champ `opts.inspireDe` rendu en ligne italique gris-clair sur 5 modules (grilles, echelles, productions, cartouches, pratiques).
- `genererPanneauMetadonnees` etendu avec ligne « Inspire de » entre Auteur et Cree le.

*Phase 4 — Autonomisation utilisateur (22 avril, b0422-1135)*
- Cartographie des flows demo par entite, validation iPad de bout en bout des lectures namespacees.

*Phase 5 demo — Tentative puis revert (22 avril, b0422-1828)*
- 5 sous-phases tentees (5.A retrait `donnees-demo.js`, 5.B retrait flags, 5.B-bis flow Dupliquer GC demo, 5.B-ter activation au toggle, 4 fixes intermediaires). 12 commits sur 10 heures.
- **Echec terrain iPad** : toggle ne persistait pas, apercu vide.
- **Cause racine** : cache-busters `?v=` des `.js` modifies non bumpes (datant de fevrier-mars). Safari iPad servait les anciennes versions → fonctions jamais executees → diagnostics errones (« bug iOS Safari label/change »).
- **Revert** : 18 fichiers restaures a 602bacf, `js/migration-phase5.js` supprime, `js/donnees-demo.js` restaure. Mode demo legacy reactif.
- **Branche backup** `backup/phase5-tentative-22avril-2026` conservee. Post-mortem + lecons dans `docs/POST-MORTEM-PHASE5-22-AVRIL.md`.
- **Regle retenue** : bumper `?v=` systematiquement, ne jamais conclure a un bug iOS sans verifier le cache d'abord.

*Phase 5 pre-tentative-2 (24 avril)*
- 6 tables reverse-engineering `donnees-demo.js` legacy (1070 lignes). Cible : prochaine tentative avec cartographie complete des flows demo.

---

## Beta 99.0x → 99.20 (mi-mars → mi-avril 2026)

**Architecture stockage, jetons de reprise et migrations massives**

*Storage — Quota Safari file:// (Phase 1a-c, 2a-c, 3a-c)*
- **Phase 1a** : extraction thumbnails de `fichiersTravaux` vers IndexedDB (gain ~3.3 Mo). Commit `233fdfc`.
- **Phase 2a** : seuil IDB-first 200 Ko dans `setSync` (grosses cles → memoryCache + IDB). Commit `a329f81`.
- **Phase 1b** : flush `beforeunload` (ecritures IDB trackees, dialogue si Cmd+Q). Commit `a329f81`.
- **Phase 2c** : fusion de `_prechargerDepuisIDB` dans `syncToLocalStorageCache`. Commit `51d7176`.
- **Phase 3a** : diagnostic storage (`window._storageStats` + integration rapport-bug). Commit `f25f12c`.
- **Phase 3c** : test de resistance (`window._testResistanceStorage()` — SUCCES).
- **Resultat** : `h2026_fichiersTravaux` (3.8 Mo) et `h2026_evaluationsSauvegardees` (1.2 Mo) ne saturent plus localStorage Safari file://.

*Jetons de reprise avec fichiers (27 mars 2026)*
- Champ `evaluationId` sur fichiers pour distinguer original vs reprise. Flag `estReprise: true` sur fichiers importes comme reprises.
- **Resolution** `trouverFichierPourEvaluation()` : chemin prioritaire par `evaluationId`.
- **Import** : option « Jeton de reprise » dans selecteur production + sous-selecteur cible.
- **Modale doublon** : bouton « Appliquer comme jeton de reprise ».
- **Reassociation** : option « Jeton de reprise » dans le selecteur.
- **Badge « A reevaluer »** (orange) pour reprises non encore re-sauvegardees.
- **Badge « Reprise (etait X · Y%) »** avec scores originaux dans la liste.
- **Filtrage** `!remplaceeParId` dans profil, dashboard, graphiques.

*Migration handlers inline → delegation (Phases 0-6)*
- ~1302 handlers inline migres vers data-action / data-on-change. 18 commits.
- `index.html` : 0 `onclick` inline. CSP `script-src 'self'` active sans exception.
- Dispatcher operationnel dans `main.js`. `fermerOverlayParent()` generique pour modales (commit `68af8d4`).

*Bug fixes et raffinements*
- **#220 / #224** (3 mars) : calcul d'assiduite errone dans le profil etudiant — fonction canonique unique pour l'indice A.
- **#214** (16 mars) : Gestion avancee des ressources — suppression non persistante.
- **#217** (27 mars) : gestion des jetons investiguee.
- **#234** : reintegrer l'import TXT pour les cartouches de retroaction.
- **#235** : uniformiser « Note chiffree » / « Code du niveau de performance ».
- **#236** : retirer les emojis 🔶 clignotants dans la section Aide.
- **#237** : ameliorer le moteur de recherche dans la section Aide.
- **#238** : audit et amelioration du calcul des blocages et niveaux RaI.

---

## Beta 98.5 → 98.9 (14 mars 2026)

**Codex — flux USB multi-appareil**

*Module nouveau `js/codex.js`*
- Charge apres `import-export.js`. Plan detaille dans `docs/plan-codex.md`.

*Phase 1 — Generation/restauration ZIP (#225, commit 8f1fc57)*
- Ouvrir et sauvegarder un codex ZIP portable (Mac + iPad). Format `.codex.zip` (ulterieurement migre vers `.zip` simple en mai).

*Phase 2 — TimeMachine (#226)*
- Historique des versions dans le codex. (Retire en avril #250 : trop lourd pour l'usage reel.)

*Phase 3 — Multi-codex et fusion (#227)*
- Plusieurs codex ouverts en parallele, action `actionFusionner` pour merger les contenus.

*Phase 4 — Auto-save FSAPI cle USB (#228)*
- Ecriture automatique vers une cle USB via `FileSystemDirectoryHandle`. Detection de la cle, persistence du handle.

*Design et UX (#229, #230, #231)*
- **Overlay de progression du Codex** adopte comme norme dans toute l'app.
- Documentation utilisateur du concept Codex.
- Auteur non defini dans les details : corrige.

*Limites Safari documentees*
- `navigator.share` ne supporte PAS les fichiers sur Safari Mac (iOS/iPadOS seulement).
- Console Safari : pas de arrow functions, pas de `const` redeclaree, coller en une ligne.

---

## Beta 98.4 (4 mars 2026)

**Corbeille fichiers, changement de grille et recalcul**

*Corbeille persistante*
- **Soft delete** : Les fichiers supprimes depuis la liste des evaluations sont deplaces a la corbeille au lieu d'etre supprimes definitivement. Le blob reste intact dans IndexedDB.
- **Restauration 30 jours** : Les fichiers peuvent etre restaures pendant 30 jours. Purge automatique des fichiers expires a l'initialisation du module.
- **Vue corbeille** : Bouton « Corbeille (N) » dans la zone de filtres, visible uniquement si N > 0. Vue dediee avec colonnes Nom, Fichier, Production, Date suppression, Jours restants, actions Restaurer/Supprimer.
- **Vider la corbeille** : Suppression definitive de tous les fichiers avec confirmation modale.
- **Cle namespacee** : `corbeilleFichiers` ajoutee dans CLES_NAMESPACEES pour isolation par trimestre.

*Changement de grille*
- **Cartouches** : Le dropdown grille n'est plus verrouille en mode edition. Confirmation avant changement (les commentaires des criteres communs sont preserves).
- **Evaluations** : Changer la grille dans le panneau Parametres regenere les criteres et recalcule la note avec les nouvelles ponderations.
- **Correspondance par nom** : Les niveaux des criteres communs entre l'ancienne et la nouvelle grille sont preserves automatiquement par correspondance de nom (insensible a la casse). Ex. : SRPNF → SRPN conserve Structure, Rigueur, Plausibilite, Nuance.

---

## Beta 98.03 (25 fevrier 2026)

**Gestion avancee des ressources, panneau evaluation et nettoyage UI**

*Gestion avancee des ressources*
- **Fusion bibliotheque + templates** : La Gestion avancee (Reglages > Donnees) affiche et controle desormais TOUTES les grilles et echelles, qu'elles soient dans `bibliothequeGrilles`/`bibliothequeEchelles` ou `grillesTemplates`/`echellesTemplates`. Deduplication par id, colonne Source avec badges.
- **Suppression des deux cotes** : Supprimer une grille ou echelle la retire des deux sources (bibliotheque ET templates). Les dropdowns d'Evaluer refletent les suppressions.

*Panneau evaluation*
- **Scrollbar criteres** : Le 5e critere d'une grille a 5 criteres etait coupe sans scrollbar. Corrige via `overflow-y: auto` et `max-height` ajuste.
- **Retroaction redimensionnable** : Le panneau Retroaction peut maintenant etre retreci via le splitter (min 100px au lieu de 400px). Largeur par defaut augmentee a 340px pour un meilleur equilibre.

*Export PDF et cartouches*
- **Bouton Export PDF dans le formulaire** : Les zones d'apercu PDF flottantes sont remplacees par un bouton « Exporter en PDF » dans la barre de boutons d'edition (productions et cartouches).
- **Export cartouche corrige** : Utilise la cartouche active (`window.cartoucheActuel`) au lieu des anciens selects caches.
- **Metadonnees cartouche** : Backfill systematique de `metadata_cc` a la sauvegarde (corrige les cartouches anciennes).

*Pipeline et filtres*
- **Filtre production persiste** : Le dropdown de filtre par production est persiste en sessionStorage et restaure au rechargement.
- **Production pipeline persistee** : La selection de production dans le pipeline est propagee et persistee.

*Nettoyage*
- **Modal suppression ressource** : Migration de `style="display:none"` vers classes CSS standard (`modal-overlay`, `u-hide`).

---

## Beta 98 (20-24 fevrier 2026)

**Visionneuse, annotation, aide 100 % et entete repensee**

*Visionneuse et annotation*
- **Palette d'annotation ancree** : Ancree a gauche avec separateurs redimensionnables (drag + double-clic reset). Support tactile iPad.
- **Evaluation en 3 colonnes** : Parametres a gauche, document au centre, criteres a droite. Retroaction sous le canvas. Exclusivite annotation/evaluation.
- **Editeur de pages** : Glisser un badge importe pour decomposer, reordonner, supprimer ou ajouter des pages PDF.
- **Tampons precises** : Renommes Exact, Errone, Incertain avec info-bulles detaillees.

*Export PDF*
- **Refonte page Synthese** : Accents corriges, en-tete personnalise (cours, grille, options), descriptions des criteres, images des tampons, marges 1 pouce.
- **Nom enseignant corrige** : Lu depuis les reglages du trimestre actif.
- **Apercu PDF ameliore** : Boutons reorganises en barre horizontale.

*Evaluation et fichiers*
- **Statuts d'evaluation** : Flux Non recu > Recu > Importe > Annote > Evalue > Remis. Colonne Statut dans la liste, navigation intelligente.
- **Fichiers isoles par groupe-cours** : Chaque groupe ne voit que ses propres fichiers. Cascade de suppression, stampage coursId a l'import.
- **Configuration des pratiques corrigee** : Carte « Structure des evaluations » visible. Jetons connectes aux pratiques.

*Anonymisation*
- **Mapping namespace par trimestre** : Prenoms, badges et DA masques partout. Fallback securitaire.

*Aide*
- **Couverture 100 %** : 12 accordeons ajoutes. Tous les modules sont documentes dans l'onglet Aide.

*Entete et preferences*
- **Entete reorganisee** : Dropdown mode a gauche, Signaler un bug a droite, titre centre. Theme deplace dans Reglages > Preferences > Experience visuelle.
- **Preferences reordonnees** : Experience visuelle et Navigation en haut de page.
- **Espacement et separateur** : Plus d'air en haut, separateur entre Beta/Build et infos contextuelles.
- **Intitule version** : « Beta XX - Developpement actif ».

*Page d'accueil*
- **Trois sections** : Decouvrir, Parcourir, Piloter.

---

## Beta 97.8 (14-15 fevrier 2026)

**Guide integre pour la carte d'alignement pedagogique**

- **Guide pagine de 7 pages** : Le bouton « ? » de la palette ouvre un guide pas a pas dans la palette laterale. Chaque page explique le *pourquoi* pedagogique et le *comment* technique d'une etape de construction de la carte.
- **7 etapes** : Bienvenue → Competences → Idees maitresses → Sequences et lecons → Types de connaissances (Anderson) → Activites → Evaluation.
- **Navigation fluide** : Boutons precedent/suivant, 7 points cliquables pour sauter a une page, bouton « Terminer » sur la derniere page. Fermeture par ✕ ou Terminer restaure la palette.
- **Carres de couleur** : Chaque type de noeud est accompagne de son carre de couleur pour creer un lien visuel avec la palette.
- **Reference** : Anderson, L. W. (2026). *Curricular alignment: A re-examination* (Educational Practices Series, No. 37). UNESCO IBE. Hyperlien vers unesdoc.unesco.org.
- **Fichiers** : `js/planification-carte.js` (constante GUIDE_PAGES, fonctions ouvrirGuide/fermerGuide/rendrePageGuide), `index.html` (ancien panneau d'aide supprime), `styles.css` (~70 lignes CSS pour le guide).

**Assistant actif de creation de materiel pedagogique**

> **OBSOLETE depuis Beta 99.21 (21 avril 2026)** — Les modules primo-* et
> parcours-apprentissage decrits dans cette section ont ete retires lors du
> chantier de consolidation onboarding. Seul le wizard de pratique de notation
> a survecu (accessible via accueil V3 et Reglages > Pratique). Les notes
> ci-dessous restent comme archive historique.

*Phase 1 — Retrait persona Primo*
- **Tour guide neutre** : Retrait du personnage de Primo. Textes reformules en vouvoiement impersonnel (« Souhaitez-vous... » au lieu de « Veux-tu... »). Emoji 🧭 conserve.
- **Commentaires nettoyes** : En-tetes, annotations et console.log mis a jour dans les 3 fichiers (primo-accueil.js, primo-modal.js, primo-questions.js).

*Phase 2 — Parcours actif de creation de materiel*
- **Module 5 dans le tour guide** : Nouvelle carte « Creer du materiel pedagogique » dans le modal d'accueil. Fonction `demarrerCreationMateriel()` qui ouvre le conversationnel a `materiel-intro`.
- **21 nouvelles questions** (materiel-intro → materiel-recapitulatif) remplacent les 11 anciennes etapes passives (intro-materiel → fin-sequence-evaluer).
- **Detection du contexte** : Action `detecterContexteMateriel()` lit `modalitesEvaluation.pratique` dans IndexedDB. Branchement selon sommative / PAN-Standards / PAN-Specifications / non configure.
- **Creation d'echelle** : `creerEchelleDepuisParcours()` — 3 modeles (IDME, ABCD, personnalise). Ecriture dans `echellesTemplates`. Verification post-creation.
- **Creation de grille** : `creerGrilleDepuisParcours()` — modele de base (4 criteres a 25%) ou personnalise (N criteres, poids egaux). Ecriture dans `grillesTemplates`.
- **Creation de production** : `creerProductionDepuisParcours()` — titre, type, ponderation. Liaison automatique avec la grille. Ecriture dans `cle('productions')`.
- **Creation de cartouche** : `creerCartoucheDepuisParcours()` — matrice critere × niveau vide. Ecriture dans `cartouches_{grilleId}`.
- **`calculerInfosParcours()`** : Mis a jour pour detecter le module materiel (materiel-intro → finParcoursMateriel).
- **`terminerConfiguration()`** : Gere `finParcoursMateriel` — notification « Materiel pedagogique cree » et retour au menu sans rechargement.

*Phase 3 — Nettoyage*
- **11 questions supprimees** : intro-materiel, confirmation-dossier-ouvert, aide-dossier, transition-mode-guide, importer-echelle-idme, importer-grille-srpnf, creer-production-guidee, navigation-evaluations, selection-etudiant, attribuer-niveaux, fin-sequence-evaluer.
- **Module 2 simplifie** : `demarrerEvaluation()` navigue directement vers la section Evaluations (plus de mode notification).

*Correctifs materiel pedagogique*
- **Detection invisible** : `demarrerCreationMateriel()` detecte la pratique AVANT l'ouverture du modal. L'etape `materiel-intro` est sautee — l'utilisateur voit directement la premiere question.
- **Numerotation corrigee** : `calculerInfosParcours()` exclut `materiel-intro` du compteur. L'etape affichee commence a 1/12 (au lieu de 2/13).

*Correctifs et ameliorations (15 fevrier 2026)*
- **Ponderation pre-remplie** : Ajout de `valeurDefaut` sur les inputs `type: 'number'` dans `primo-modal.js`. Le champ `materiel-production-ponderation` est pre-rempli a 25%.
- **Tooltip objectif d'apprentissage** : Reference a Bloom remplacee par Anderson et Krathwohl dans `index.html` (ligne ~5130). Renvoi vers la banque de verbes de la carte d'alignement (Planification → Carte).

*Harmonisation nomenclature IDME (15 fevrier 2026)*
- **Nomenclature officielle** : L'echelle IDME utilise desormais partout « Incomplet / en Developpement / Maitrise / Etendu ».
- **« Insuffisant » → « Incomplet »** : Label du niveau I corrige dans 18 fichiers (echelles.js, graphiques-progression.js, tooltips-contenu.js, evaluation.js, cartouches.js, pratiques.js, pratiques-predefines.js, pratique-registre.js, etudiants.js, profil-etudiant.js, gabarits-utils.js, primo-modal.js, primo-questions.js, aide-contextuelle-contenu.js, snapshots.js, pratique-pan-standards.js, interpretation-config.js, tableau-bord-apercu.js).
- **« En developpement » → « en Developpement »** : Casse harmonisee (minuscule « en », majuscule « D ») dans tous les contextes IDME.
- **« Exemplaire » → « Etendu »** : Corrige dans aide-contextuelle-contenu.js et primo-questions.js.
- **Non modifie** : Niveaux d'engagement (interventions.js, profil-etudiant.js), variables techniques (seuilInsuffisant), changelog historique, echelle ABCDE (echelles.js:3108).

---

## Beta 97.5 (11-12 fevrier 2026)

**Migration palette Ocean & Boussole (C4) + Hierarchie des surfaces**

*Migration initiale (11 fevrier)*
- **Nouveau theme sombre definitif** : Migration complete de la palette « Nuit Elegante » vers « Ocean & Boussole » (C4). Fonds sombres (#0c1a22 a #244858), accent sarcelle (#6aacb8), accent laiton (#c8a060).
- **Variables :root** : Toutes les variables CSS (~1 327 usages de `var()`) basculees vers la palette ocean dans `styles.css` et `index.html`.
- **Surfaces hardcodees** : ~276 couleurs hex hardcodees (`white`, `#fff`, `#f8f9fa`, `#333`, `#666`, `#999`, etc.) remplacees par des variables semantiques (`--surface-conteneur`, `--texte-principal`, `--texte-secondaire`).
- **En-tete** : Gradient 4 stops (`#0a1820 → #142a38 → #1a3848 → #0e2028`) conforme a la maquette. Separateurs retires.
- **En-tetes de section** : 10 occurrences de `linear-gradient` remplacees par fond uni `#244858`.
- **Navigation transparente** : `.navigation-principale`, `.sous-navigation` et `.bandeau-groupe-cours` : fond `transparent`. Overrides `!important` alignes.
- **Tooltips C4** : Fond ocean profond, bordures sarcelle, animation pulse sarcelle.
- **Glassmorphism sarcelle** : Navigation et sous-navigation teintees sarcelle.
- **Composants** : Badges, alertes, tables, formulaires — tous en fonds semi-transparents adaptes au fond sombre.
- **Chart.js** : Grilles, labels et tooltips adaptes au fond sombre dans tous les fichiers JS de graphiques.
- **Planification** : Variables utilitaires adaptees; couleurs des noeuds conservees vives.
- **Impression** : `@media print` force les fonds blancs et textes sombres.
- **Scrollbars** : Stylisees sarcelle pour WebKit et Firefox.
- **Modes** : Simulation et Anonymisation adaptes a la base ocean sombre.
- **Boite a outils** : Textes corriges vers `--accent-primaire` / `--texte-principal`.
- **Accueil** : `.accueil-carte` et `.accueil-cours-actif` : fond uni `#0c1a22` avec bordure sarcelle.
- **Fallbacks JS** : 99 occurrences mises a jour dans 20 fichiers JS.

*Hierarchie des surfaces — 4 niveaux (12 fevrier)*
- **4 niveaux de surface** : N0 Page (`#0c1a22`), N1 Section (`#142428`), N2 Carte (`#1a3040`), N3 Element (`#244858`). Variables CSS : `--surface-page`, `--surface-section`, `--surface-carte`, `--surface-element`.
- **~130 radial-gradients supprimes** : remplaces par des fonds solides selon le role (N1 sections, N2 cartes/modales/panneaux, N3 inputs/hover).
- **`.section.active`** : fond N1 + padding 20px + border-radius 12px.
- **`.carte`** : fond N2 + `border-left: 3px solid` accent sarcelle.
- **Variables legacy alignees** : `--bleu-pale` → N2, `--bleu-tres-pale` → N1. 118 usages basculent automatiquement.
- **Inputs/textareas** : fond N3 pour lisibilite.
- **Fallbacks `#162c36` elimines** dans CSS et HTML.

---

## Beta 97.4 (8-11 fevrier 2026)

**Alignement pedagogique**

- **Systeme de clonage** : Double-cliquer un element de la carte pour ouvrir le panneau, puis « Cloner ». Les clones partagent titre et description — modifier l'un met a jour les autres. Indicateur 🧬 avec surbrillance au survol. Badges agreges tenant compte de tous les clones.
- **Verbes de liaison refondus** : 5 verbes verticaux automatiques (se decline en, se concretise dans, s'acquiert par, se verifie par, s'appuie sur) et 2 verbes horizontaux au choix (complete, conduit a). Direction amont → aval. Selection de verbe au clic sur un lien.
- **Evaluations dans la carte** : Nouveau type Evaluation (rose/magenta) dans la palette. Integrable dans les lecons avec champs Retroaction et Production dedies.
- **Carte d'aide flottante** : Deplacable, redimensionnable, fermable. Bouton « ? » dans la palette pour la reafficher.
- **Onglet renomme** : « Carte mentale » devient « Alignement pedagogique ».

**248 tooltips au survol**

- **Moteur de tooltips** : Delegation d'evenements, positionnement automatique (droite/gauche/bas/haut), base de contenu centralisee. Trois fichiers : `css/tooltips.css`, `js/tooltips.js`, `js/tooltips-contenu.js`.
- **En-tete (8)** : Logo, version/build, mode affichage, signaler un bug, pratique de notation, semaine courante, selecteur groupe-cours, bouton reglages.
- **Reglages (60)** : Trimestre (19 : panneaux accordeon + champs specifiques + boutons bibliotheque), Preferences (13), Depistage (14), Donnees (14).
- **Planification (34)** : Alignement pedagogique + Organisateur.
- **Tableau de bord (57)** : Apercu, Liste des individus, Profil etudiant, Interventions RaI.
- **Evaluations (24)** : Apercu, Liste des evaluations, Evaluer une production.
- **Construction de la note (31)** : Concepts transversaux, Apercu, Productions, Grilles, Echelles, Cartouches, Pratiques.
- **Navigation (34)** : 8 onglets principaux + 26 sous-onglets dynamiques generes via un mapping JS centralise (`TOOLTIPS_SOUS_NAV`).
- **Style** : Contour orange accent sur les bulles et les fleches (carre tourne a 45° pour support de bordure). Integration au theme via variables CSS (`--bleu-fonce`, `--shadow-fort`, `--radius-moyen`).
- **Curseur adaptatif** : `cursor: help` sur les elements informatifs, `cursor: pointer` preserve sur la navigation et les boutons interactifs.
- **Nettoyage** : 11 attributs `title` natifs redondants retires au profit des tooltips enrichis.

**Correctifs**

- **Fix Horaire/Groupe-cours invisibles** : Les formulaires des sections Horaire et Groupe-cours dans l'onglet Trimestre restaient invisibles meme quand un element etait selectionne dans le dropdown. Cause : `style="display: none"` inline vs `classList.remove('u-hide')`. Corrige en remplacant les styles inline par `class="u-hide"`.
- **Nettoyage inline styles** : Remplacement systematique de `style="display: none"` par `class="u-hide"` dans tous les accordeons Trimestre pour coherence avec le pattern JS existant.

---

## Beta 97.2 (6 fevrier 2026)

**Demo et accueil**

- **Nouveau systeme de demo** : La demo est desormais une route isolee (et non plus un mode). Entrez et sortez librement via un bouton dedie, vos donnees reelles sont preservees.
- **Pack demo 20 etudiants** : Donnees reelles A2025 anonymisees — 20 etudiants, 200 evaluations, 627 presences, 11 productions, 3 grilles de criteres.
- **Page d'accueil permanente** : Nouvel ecran d'accueil par defaut avec deux etats — premier lancement (creer un cours ou explorer la demo) et retour (4 cartes par intention). Mode expert dans Reglages pour court-circuiter vers le tableau de bord.
- **Guidage contextuel** : En mode demo, chaque section affiche un encart explicatif decrivant ce que vous voyez (16 encarts couvrant toutes les sous-sections).
- **Bandeau demo** : Barre verte fixe en bas de l'ecran en mode demo avec bouton « Quitter la demo ».

---

## Beta 97.1 (6 fevrier 2026)

**Interface**

- **Bulles en-tete** : Nouveau mouvement helicoidal — oscillation sinusoidale autour d'un axe de derive horizontal (parallaxe conservee).
- **Tableau de bord** : Titres renommes — « Etat des lieux » (Vue d'ensemble), « Observer » (Indicateurs ACPE), « Intervenir » (Indicateurs d'apprentissage), « Developpement du groupe » et « Developpement individuel ».
- **Qualite CSS** : 475+ couleurs hex remplacees par variables CSS dans 40+ fichiers. 171 styles inline retires dans index.html. 38 `!important` retires sur 75 dans styles.css — specificite corrigee a la source.
- **Qualite JS** : 3 fonctions `formaterDate` canoniques centralisees dans main.js. 136 patterns defensifs `typeof cle` nettoyes dans 24 fichiers. Design System synchronise.
- **Module Travaux — Panneau retractable** : La sidebar de fichiers se replie automatiquement en mode annotation pour maximiser l'espace de travail. Un onglet lateral permet de la rouvrir au besoin.
- **Module Travaux — Tampons de retroaction** : 12 autocollants visuels (3 qualite + 9 diagnostic) a poser directement sur le travail annote. Popup flottante, pose au clic, gomme et annuler/retablir inclus.
- **Module Travaux — Export PDF** : Genere un PDF unique contenant les pages annotees (traits, formes, autocollants aplatis) + une page de synthese avec les criteres, niveaux, retroaction et note finale.
- **Module Travaux — Revision avant export** : Ecran intermediaire affichant un resume des annotations et un apercu des cartouches de retroaction avant la generation du PDF.

---

## Beta 97 (6 fevrier 2026)

**Module Travaux**

- **Nouvel onglet Travaux** : Gestion complete des travaux etudiants directement dans Monitorage (import, annotation, archivage).
- **Import de fichiers** : Glissez vos PDF et images dans la zone de depot. Detection automatique du DA etudiant dans le nom du fichier. Association manuelle possible via dropdown.
- **Visionneuse integree** : Ouvrez vos PDF et images directement dans l'application. Navigation entre les pages, zoom avant/arriere, ajustement automatique a la fenetre.
- **Annotation au stylet** : Annotez directement sur les travaux avec le stylo, le surligneur, la gomme, des formes (cercle, fleche, rectangle) et des symboles (crochet, croix). Support Apple Pencil avec sensibilite a la pression et rejet de la paume.
- **Annuler/Retablir** : Ctrl+Z / Ctrl+Maj+Z pour annuler ou retablir vos annotations (jusqu'a 50 niveaux). Sauvegarde automatique.
- **Voir le travail depuis Evaluations** : Bouton « Voir le travail » dans la page d'evaluation pour afficher le document cote a cote avec la grille de criteres.
- **Travaux dans le Profil etudiant** : Nouvelle section « Travaux soumis » avec grille de miniatures et export ZIP par etudiant.
- **Archivage ZIP** : Exportez les travaux par etudiant, par production ou pour le semestre complet. Inclut les versions annotees.
- **Stockage sur disque (Mac)** : Option File System Access API pour stocker les fichiers sur votre disque au lieu d'IndexedDB. Recommande sur Mac pour les gros volumes.

**35 correctifs**

- **Fiabilite des donnees** : Correction de 5 bugs critiques (cles de stockage incoherentes, collisions d'ID, calcul d'assiduite, format de presences).
- **Calculs corriges** : Taux de completion, tendances, mode « recents-meilleurs », statistiques d'archive — tous recalculent correctement.
- **Multi-trimestre** : Namespacing renforce dans ~20 fichiers — les donnees restent bien isolees par trimestre.
- **Stabilite** : Erreurs silencieuses remplacees par des diagnostics, elements DOM manquants proteges, race conditions corrigees.
- **Design system** : Couleurs et ombres harmonisees avec la palette « Nuit Elegante ».

---

## Beta 96.2 (30 janvier — 4 fevrier 2026)

**4 fevrier**

- **Notes de presences dans Confidentiel** : Les notes saisies dans la page Presences sont maintenant visibles et editables dans le modal Confidentiel du profil etudiant (Accompagnement > Confidentiel).
- **Nouveau module Gestion des ressources** : Outil dans Reglages > Donnees > Maintenance pour auditer et nettoyer les ressources accumulees.
- **5 types de ressources** : Pratiques de notation, Grilles de criteres, Cartouches de retroaction, Echelles de performance, Productions.
- **Interface simplifiee** : Dropdown unique avec compteurs (ex: "Pratiques de notation (12)") au lieu de 5 accordeons.
- **Informations detaillees** : Chaque ressource affiche son statut (Sidebar/Masquee) et son usage (cours, evaluations).
- **Suppression definitive** : Bouton pour supprimer les ressources non utilisees avec verification des dependances.

**1er fevrier — Corrections testeurs**

- **Modal de bienvenue** : Les nouveaux utilisateurs sont accueillis avec un choix : configuration guidee ou exploration libre.
- **Animation bulles** : Effet 3D et parallaxe dans l'en-tete (grandes=proches rapides, petites=loin lentes).
- **Suppression grilles corrigee** : Le bouton supprimer dans la barre laterale fonctionne a nouveau.
- **Import productions corrige** : Les productions namespacees sont maintenant detectees et importees.
- **Horaires par trimestre** : Les horaires sont maintenant isoles par trimestre (apercu presences fonctionnel).
- **Cours A2025 corrige** : Les nouveaux cours sont crees dans le bon trimestre.
- **Section Trimestre responsive** : Affichage correct sur iPad (dates et boutons visibles).
- **Export horodate** : Les sauvegardes incluent maintenant l'heure (YYYY-MM-DD-HH-MM-SS).
- **Supprimer pratiques hors-bibliotheque** : Nouveau bouton pour supprimer les pratiques non utilisees.

**31 janvier PM — Correction registre pratiques**

- **Pratiques configurables corrigees** : Les pratiques creees via l'assistant (wizard) sont maintenant correctement chargees depuis le registre.
- **Normalisation des formats** : Fusion automatique des champs racine + config interne pour compatibilite totale.
- **Chargement echelles par ID** : Les pratiques referencant une echelle par ID la chargent maintenant depuis la bibliotheque.

**31 janvier AM — Synchronisation multi-appareils**

- **Import donnees personnelles corrige** : L'import sur un nouvel appareil (iPad, nouveau PC) fonctionne maintenant. Cochez "C'est ma propre sauvegarde" et les cases Etudiants/Presences/Notes se cochent automatiquement.
- **Preservation des IDs** : Les pratiques, grilles, echelles et productions conservent leurs IDs originaux lors de l'import (plus de references cassees).
- **Import donnees calendrier** : Les bornes du trimestre, horaires et evenements sont maintenant importes correctement.
- **Synchronisation MacBook / iPad** : Export sur un appareil, import sur l'autre — toutes les donnees sont transferees fidelement.

**30 janvier — Correction critique Export/Import**

- **Export complet depuis IndexedDB** : La "Sauvegarde complete" exporte maintenant TOUTES les donnees, y compris celles stockees uniquement dans IndexedDB (groupes-cours, horaires, donnees volumineuses).
- **Import groupe-cours et horaires** : L'import reconnait maintenant les cles `*_groupesCours`, `*_horaires` et `enseignants`.
- **Affichage "Structure du trimestre"** : Nouvelle section dans le modal d'import pour visualiser les groupes-cours et horaires avant importation.
- **Correction UTF-16 Safari** : Le bouton "Envoyer par courriel" des rapports de bug fonctionne maintenant sur Safari/iPad.
- **Archivage local des rapports** : Les rapports de bug sont sauvegardes localement (max 50).

---

## Beta 96.1 (28 janvier 2026)

- **Boite a outils — Tirage au sort** : Nouvelle section avec un outil pour tirer des etudiants au hasard (animation roulette, mode avec/sans remise, exclusions manuelles, persistance).
- **Questions Flash** : Deuxieme outil pour tirer des questions au hasard, avec organisation par categories, filtre par categorie, et gestion complete (ajout, modification, suppression, changement de categorie).
- **Icone Reglages** : Le texte "Reglages" remplace par une icone d'engrenage dans la navigation principale.
- **Animation 3D des points (Tableau de bord)** : Les points blancs dans les barres oscillent avec un effet de rotation 3D (desactivable dans Preferences > Experience visuelle).
- **Modal Confidentiel (Profil etudiant)** : Nouveau bouton dans la section Accompagnement pour saisir des informations sensibles (EPGC, cours anterieur, services adaptes, defis particuliers, notes personnelles).
- **Correlations significatives uniquement** : Les messages de correlation A/P et C/P ne s'affichent que si r >= 0.5 (moderee ou plus).
- **Anonymisation des groupes** : En mode Anonymisation, les numeros de groupe sont remplaces par des lettres (00001 = Gr. A).
- **Graphique Trajectoire ameliore** : La courbe de l'eleve selectionne apparait au premier plan.
- **Bouton Supprimer dans les bibliotheques** : Suppression definitive des elements avec confirmation et verification des dependances.
- **Bouton Dupliquer dans les bibliotheques** : Creez rapidement une copie d'un element existant.
- **Isolation des templates archives** : Supprimer un template en H2026 n'affecte plus les trimestres archives.

---

## Beta 96 (25 janvier 2026)

- **Uniformisation des graphiques** : Tous les graphiques adoptent le meme look et comportement coherent.
- **Echelle Y dynamique** : Les graphiques s'adaptent automatiquement aux donnees (fini l'echelle fixe 0-100%).
- **Zones IDME dynamiques** : Les zones colorees (Insuffisant, Developpement, Maitrise, Etendu) utilisent votre echelle personnalisee partout.
- **Etiquettes de zones centrees** : Les noms des zones s'affichent au centre du graphique avec des couleurs saturees pour une meilleure lisibilite.
- **Survol interactif** : Survolez une courbe pour la mettre en evidence (les autres s'attenuent), le nom s'affiche au bout de la courbe.
- **Verrouillage au clic** : Cliquez sur une courbe ou son nom pour la verrouiller, cliquez ailleurs pour deverrouiller.
- **Points uniformises** : Tous les points des graphiques et barres ACEP ont le meme style (blanc avec contour bleu pale, noir au survol).
- **Distribution ACPE** : Nouveau graphique montrant la repartition des indices A, C, P, E avec des courbes de densite (style Gauss).

---

## Beta 95.7 (21-23 janvier 2026)

**23 janvier**

- **Mode Anonymise corrige** : La liste des etudiants s'affiche correctement en mode anonymisation.
- **Filtrage presences par groupe-cours** : Les presences sont correctement isolees par groupe-cours.
- **Calcul moyenne A corrige** : Chaque groupe affiche sa propre moyenne d'assiduite.
- **Dropdown trimestre synchronise** : Le selecteur de trimestre affiche le bon trimestre actif.
- **Nettoyage doublons trimestres** : Les entrees en double sont automatiquement detectees et supprimees.
- **Mode Demo clarifie** : Le trimestre Demonstration n'apparait plus en Mode Normal.

**22 janvier**

- **Saisie presences amelioree** : Input numerique remplace le dropdown (permet fractions: 1.5, 2.5...), affichage X/Y per.
- **Calcul assiduite corrige** : Formule en periodes (2/2 = 100%, pas 92%). Etudiants absents affichent 0% (pas tiret).
- **Moyenne A du groupe** : Affichee dans l'entete de la liste des etudiants et sur la barre Assiduite du tableau de bord.
- **Points individuels** : La barre Assiduite du tableau de bord affiche maintenant les 28 points (distribution visible).
- **Calendrier synchronise** : L'horaire du trimestre actif est correctement reconnu par le calendrier.
- **Affichage nom pratique** : L'entete affiche le nom de la pratique au lieu de son ID technique.

**21 janvier**

- **Export PDF grilles descriptives** : Genere un PDF de ta grille avec les retroactions (grille + echelle + cartouche). Options : orientation, taille police, pied de page personnalisable (enseignant, cours, licence CC).
- **Autocompletion programmes** : Tapez le code (200, 300, 420...) pour voir les programmes officiels.
- **Dropdowns discipline complets** : Liste complete (~120 disciplines) pour les 48 cegeps du Quebec.
- **Option Hybride portfolio** : Nouveau mode "N meilleures + Obligatoires" disponible dans Primo et Mode Expert.
- **Persistance Primo → Expert** : Les valeurs configurees (artefacts, construction note, echelle) persistent correctement.
- **Boutons uniformises** : Tous les modals respectent le Design System v7 (Annuler orange, Confirmer vert).

---

## Beta 95.6 (19 janvier 2026)

- **Boutons d'aide** : En Mode Assiste, des boutons apparaissent pour expliquer chaque section (14 themes couverts).
- **Ordre de configuration clarifie** : Echelles → Pratiques → Grilles → Productions (chaque element depend du precedent).
- **Design System v7** : Harmonisation des styles (border-radius, box-shadow) selon la charte graphique.
- **Tiret au lieu de 0%** : La liste des etudiants affiche un tiret quand aucune donnee n'est saisie.
- **Barres "En attente"** : Les barres de distribution indiquent "En attente de donnees" au lieu de 0%.
- **Dropdown synchronise** : Le selecteur d'etudiant se met a jour lors du changement de groupe-cours.
- **Calendrier corrige** : L'horaire affiche correspond au groupe-cours actif.

---

## Beta 95.5 (10-18 janvier 2026)

**10 janvier**

- **Categories Selection/Obligatoires** : Nouveau design avec deux cartes et checkboxes pour classer tes productions (N meilleures vs toujours comptees).
- **Metadonnees uniformisees** : Panneau coherent pour tous les elements avec titre dynamique.
- **Tracabilite contributeurs CC** : Les contributeurs sont automatiquement ajoutes lors des modifications.
- **Wizard Primo ameliore** : Champs Prenom/Nom separes, pre-remplissage auto, dropdown disciplines.

**18 janvier — Corrections testeurs**

- **Creation d'horaire** : Le bouton fonctionne a nouveau (merci Jordan).
- **Export des donnees** : Le bouton d'export repond correctement (merci Jordan).
- **Import CSV Omnivox** : Detection intelligente des colonnes (SA, Nom, etc.) quelle que soit leur position (merci Jordan).
- **Encodage fichiers** : Support automatique Windows-1252 pour les accents.
- **Rapport de bug ameliore** : Stack trace complet, historique des clics, contexte section, bouton capture d'ecran.

---

## Beta 95.3 (9 janvier 2026)

- **Modal bibliotheque groupe-cours** : Bouton pour voir, activer ou supprimer tes groupes-cours.
- **Syntheses intelligentes** : Chaque accordeon affiche un resume calcule (nb etudiants, heures/sem, etc.).
- **Import depuis trimestre precedent** : Reutilise tes echelles, grilles et productions.
- **Audit module evaluation** : 3 problemes critiques corriges.

---

## Beta 95.2 (6-8 janvier 2026)

**Architecture modulaire**

- **Toggles separes** : Cours, Enseignant, Horaire et Groupe-cours sont des entites independantes.
- **Profil auteur** : Source unique pour les metadonnees CC.
- **Assemblage flexible** : Combine cours + enseignant + horaire + pratique.
- **Migration automatique** : Tes donnees existantes sont converties.

---

## Beta 95.1 (1-5 janvier 2026)

**Corrections testeurs**

- **Periodes au lieu d'heures** : Format horaire dynamique selon le nombre de periodes (merci Olivier).
- **Finalisation Primo** : L'interface se met a jour apres la configuration (merci Olivier).
- **Sauvegarde des grilles** : Les nouvelles grilles s'ajoutent a la bibliotheque (merci Bruno).
- **Heures non piles** : Entree d'heures comme 8h55 dans Primo (merci Bruno).
- **Import/Export ameliore** : Import selectif, protection des donnees (merci Bruno, Gregoire).
