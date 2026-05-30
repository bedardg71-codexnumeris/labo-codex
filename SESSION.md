<!-- =====================================================================
     IDENTIFICATION DE CE FICHIER  (mis à jour 29 mai 2026 SOIR, build 0529-1900.
     Session du 29 mai très dense : chantier E (refonte cours↔période CLOSE),
     lecture+analyse complète du corpus Cowork du 29 mai, décisions actées
     (code Standards=STD, 2 guides PAN distincts, refonte post-AQPC),
     mini-guide « balises du cours » (#304 libellés), Session A-1 (#303,
     fondation registre pratiques + bug de résolution corrigé). Beta 99.77
     → 99.80. AQPC J−5 (3 juin). Les sessions précédentes restent documentées
     dans les §§ suivants.
     ===================================================================== -->

> **📌 Identification**
> - **Chemin canonique** : `SESSION.md` (racine du repo, branche `main`)
> - **🔵 ÉTAT — 30 mai 2026 (suite), branche `main`, HEAD `4274e8d`, working tree PROPRE, PAS de bump (99.80/0529-1900)** : A-2 avance. Commits livrés/validés terrain **non poussés** : `ba0f7c0` fix #suivi-groupe, `4792c3e` lot 1, `8f860c7` lots 2+3, `367eb31` doc, **`4274e8d` lot 4b** (`pratiques-bibliotheque.js` : 8 seeds `MODELES_PRATIQUES_PREDEFINIS` canonisés + comparaisons/écritures normalisées). 94 Vitest verts.
>   - **Lot 4a ABANDONNÉ** (sorti du périmètre A-2) : `pratique-notation-v2.js` est un nœud partiellement mort (DOM `v2-*` inexistants) mais PAS supprimable (chaîne atteignable via `pratiques-gestion.js:1788`→`appliquerConfigurationPratique`→ ses fonctions). Démêlage = chantier distinct à froid. Cf. mémoire `project-pratique-notation-v2-code-mort-suspect`. J'avais d'abord annoncé à tort « code mort à supprimer » — corrigé après audit des exports.
>   - **RESTE A-2** : **4c** `pratiques-gestion.js` (≈19 sites, **wizard `mat-*` VIVANT** — fait en 2 temps : code d'abord, selects/tables ensuite), **4d** `pratiques.js` (≈29 sites, calcul indices A-C-P, le plus sensible), **4e** `wizard-pratique-v2.js` (28 sites + `code:'PAN'`→`'STD'`). Puis **étape 6** (migration boot destructive + tolérance import — reportable post-AQPC, sur backup), **étape 7** (retrait alias). Spec : `Refactorisations/SPEC_sessionA_identifiants.md`.
>   - **PLAN 4c détaillé (cartographie faite)** : (a) **Temps 1 — code** : normaliser à la lecture les comparaisons sur `type`/`pratique.type` (sites 811, 862, 958, 962, 966, 1002-1003, 1162-1163, 1176, 1235) en normalisant `type` à la source dans `changerTypePratiqueMat` (l.995, lit `getValeurChamp('mat-pratique-type')`), `remplirFormulaire` (l.~790 `setValeurChamp('mat-pratique-type', pratique.type)`) et `sauvegarderConfigurationActuelle` (l.1152). (b) **Temps 2 — selects/tables** : canoniser les `<option value>` du select `mat-pratique-type` (index.html:5623, valeurs `pan-standards`/`pan-specifications`/`pan-denotation`) ET le `filtreTypePratiques` (js:390-395) ET le `data-type` des items (js:429 `data-type="${pratique.type}"`) ensemble (sinon le filtre l.476 `itemType === typeFiltre` casse) ; tables de libellés/badge `typeMapping` (l.289-294, dont `code:'PAN'` de pan-maitrise à retirer), `getTypePratiqueLabel` (l.978), `descriptions` (l.184), `obtenirDescriptionCourtePratique` ; seed `type:'pan-standards'` (l.1616). **NE PAS toucher** : `denombrement` (DEN, hors table de normalisation, laissé tel quel) ; ids DOM `mat-config-*`/`mat-variante-pan-standards` (présents dans index.html, ce sont des id d'éléments, pas de pratique).
>   - **Note méthode 4c** : `pratiques-gestion.js` (≈1600 l.) vérifié intact avant d'éditer (`node --check` PASS, md5 disque == HEAD). À noter : `const type = getValeurChamp('mat-pratique-type')` apparaît 2× légitimement (`changerTypePratiqueMat:994` et `sauvegarderConfigurationActuelle:1154`) — ce sont deux fonctions distinctes, pas un doublon. Reprendre 4c en re-vérifiant chaque `old_string` par `sed` avant Edit (fichier sensible).
> - **🔵 ÉTAT — 30 mai 2026 (matin), branche `main`, HEAD `8f860c7`, PAS de bump (version.json reste 99.80/0529-1900)** : session A-2 démarrée (Grégoire a assumé l'écart vs « post-AQPC » de la décision Cowork ; backup Codex frais exporté sur disque = filet). **4 commits livrés et validés terrain, NON poussés** : (1) `ba0f7c0` fix(nav) — `#suivi-groupe` déplacé d'`#section-accueil` vers `#section-suivi` (retour testeur : « Suivi du groupe » s'affichait sur l'accueil ; cause = orphelin DOM + `.sous-section.active` non scopée) ; (2) `4792c3e` A-2 lot 1 (`profil-etudiant-helpers.js`) ; (3) `8f860c7` A-2 lots 2+3 (`profil-etudiant-calculs/actions/sections-affichage`, `etudiants`, `graphiques-progression`, `tableau-bord-apercu`, `statistiques`). **Méthode A-2** : normalisation à la lecture (`normaliserIdPratique(x) || PRATIQUE_DEFAUT`, garde défensif `typeof === 'function'`, pattern A-1) → chaque fichier correct que les données soient migrées ou non ; **la migration boot destructive (étape 6 de la spec) devient un nettoyage reportable, pas un prérequis**. **2 bugs dormants corrigés** (introduits par le renommage d'instance en A-1) : `obtenirPratiqueParId('pan-standards')` → `null` depuis A-1 dans `profil-etudiant-sections-affichage.js:3705` et `tableau-bord-apercu.js:2783` (mode comparatif). 94 Vitest verts à chaque lot. **Règle appliquée** : `=== 'sommative'` jamais touché (déjà canonique) ; ids DOM jamais normalisés (seulement les id de **pratique**).
>   - **RESTE A-2** (sous-découpage du lot 4, le cœur) : **4a** `pratique-notation-v2.js` (+ `<select>` HTML — voir pièges ci-dessous), **4b** `pratiques-bibliotheque.js`, **4c** `pratiques-gestion.js` (+ table typeMapping = étape 5), **4d** `pratiques.js` (≈29 sites, **calcul indices A-C-P — le plus sensible**), **4e** `wizard-pratique-v2.js` (+ `code:'PAN'`→`'STD'` = étape 5). Puis **étape 6** (migration boot destructive + tolérance import codex — reportable post-AQPC, sur backup). Puis **étape 7** (retrait des alias, daté). Spec source : `Refactorisations/SPEC_sessionA_identifiants.md`.
>   - **PIÈGES 4a documentés** (cartographie faite) : (a) DEUX selects en valeurs legacy — `v2-pratique-type` (wizard pratique, `changerTypePratiqueV2`) ET `mat-pratique-type` (index.html:5623, wizard matériel, `changerTypePratiqueMat`) ; canoniser les `<option value=>` ET normaliser au point de chargement (`typePratique.value = normaliserIdPratique(modalites.pratique)`, l.143) sinon le select ne retrouve plus la pratique tant que les données ne sont pas migrées. (b) `afficherConfigurationType` (l.487-525) mélange `type` (id pratique à normaliser) et `configId`/`mat-config-pan-standards` (ids DOM réels, index.html:5863+, **NE PAS toucher**). (c) **Branche morte à retirer** (zéro-dette) : « ancien format standards » dans `sauvegarderStructureV2` (l.586-591) + son chargement (l.199-208) — éléments DOM `v2-standards-nombre`/`v2-standards-terminaux` absents du HTML ; collision avec `pan-standards`→`standards` après normalisation. `modalites.standards` lu nulle part ailleurs.
>   - **Incident 30 mai** : un `git restore js/pratique-notation-v2.js index.html` intempestif a effacé un travail 4a pourtant sain (`node --check` OK). Aucune perte durable (dépôt propre à `8f860c7`), mais 4a est à refaire. Leçon : ne pas `restore` sur un faux signal (« placeholder » = attribut HTML légitime, pas une corruption).
>   - **Décision actée 30 mai** : le **mode comparatif SOM/PAN** (toggles `afficherSommatif`+`afficherAlternatif`, « Mode Hybride ») n'a jamais servi, n'affiche pas de résultats → **à retirer** dans un chantier DISTINCT (ne pas mélanger à A-2). Cartographie faite (≈42 sites, 8 fichiers JS + index.html + styles.css). Cf. mémoire `project-mode-comparatif-som-pan-a-retirer`.
> - **🏁 ÉTAT FINAL — 29 mai 2026 (soir), build 0529-1900, beta 99.80, branche `main`** : session dense, 5 blocs livrés et tracés ci-dessous → (1) **chantier E** « Reprendre » sans duplication (refonte cours↔période A→E CLOSE, 99.78) ; (2) lecture+analyse du **corpus Cowork 29 mai** ; (3) **décisions actées** (code Standards=`STD`, 2 guides PAN distincts, refonte pratiques+guides post-AQPC) ; (4) **mini-guide « balises du cours »** + terminologie OQLF (99.79, #304 libellés) ; (5) **Session A-1** — fondation registre pratiques + bug de résolution corrigé, non destructif (99.80, #303). **118 tests verts** (94 Vitest + 24 Playwright). Backlog : #305 ajouté (a11y modale d'aide). **Prochain bloc = Session A-2** (migration des données stockées, **sur backup, à froid** — pas en fin de session). Seul item « avant AQPC » restant : **#294** (Netlify/Cloudflare). Détail par bloc dans les puces ci-dessous.
> - **Dernier cycle livré** : **Session 29 mai 2026 (après-midi)** — 3 commits sur main. Beta 99.76 → **99.77**, build 0529-1350. (1) **Chantier C** (refonte) : création/édition cours routée via `CoursEntite`, ID `COURS_*`, retrait du code mort période/assemblage (−158 l.). (2) **Fix horaire « propre au trimestre »** (#124) : plus de perte silencieuse quand on sauvegarde un horaire hors du trimestre actif ; éditeur réinitialisé au changement de trimestre. **Décision modèle actée** : l'horaire est propre au trimestre (recréation pure, jamais de duplication cross-trimestre) — cf. mémoire `project-modele-horaire-par-trimestre`. 110 tests verts (+4 sentinelles). Validé terrain (Mac, Safari) par Grégoire. Voir §0 (après-midi) ci-dessous.
> - **▶ CHANTIER D LIVRÉ (29 mai PM, suite)** : migration destructive exécutée (en console, sur backup frais confirmé). **601-101 consolidé sous un seul `COURS_*`** (`COURS_1780082553764_2_b771b27aca49`) ; A2024 (reconstitution jetable) + E2026 (test) + bruit 601-102 supprimés ; doublon `…2bac` fusionné. Scores réconciliés (présences 2558 = 1617 H2026 + 941 A2025, évals 715 = 410+305…), 0 doublon/orphelin 601-101, idempotent, notes finales H2026 + A2025 OK. **Aucun code applicatif touché → pas de bump** (version.json reste 99.77). Voir §0bis ci-dessous. **3 findings laissés** (non corrigés) : (1) bug `getSync("trimestres")` désync localStorage↔IDB ; (2) résolution de pratique en consultation lit le namespace du trimestre actif (pas le consulté) ; (3) résidus orphelins `GC_*`/`601-XSS` score 1. Le `pratiqueId` cassé du GC A2025 (`pan-standards` → `pan-standards-bedard`) a été **corrigé**.
> - **✅ SESSION A-1 LIVRÉE (29 mai soir — fondation du volet pratiques SSOT)** : commit `8de006a`, beta **99.80** (b0529-1855). **Non destructif** (normalisation à la lecture, aucune donnée modifiée). Créé `normaliserIdPratique(id)` (point unique legacy→canonique) + `PRATIQUE_DEFAUT='standards'` dans `pratique-registre.js` ; **bug corrigé** (le registre réécrivait `specifications`→`pan-specifications` alors que l'instance s'enregistre sous `specifications` → `.get` échouait ; `obtenirIdPratiqueActive()` normalise désormais **sans write-back**) ; instance Standards `obtenirId/enregistrerPratique` → `'standards'` ; 3 sites `liste-evaluations.js` (seuls consommateurs de `obtenirIdPratiqueActive()`) normalisés. Test Vitest `pratique-normalisation` (6 cas). **118 verts** (94 Vitest + 24 Playwright). **Écart assumé vs annonce initiale** (« A-1 = étapes 1-5 ») : périmètre de casse réel = 3 sites (pas 67) ; réécrire la base aurait désync les ~60 comparaisons sur base brute → reportées avec la migration. **RESTE en A-2 (sur backup, à froid)** : 7 défauts `|| 'pan-maitrise'`, ~60 comparaisons sur base brute, tables de représentation (+ `code:'PAN'`→`'STD'`), migration boot + tolérance import + round-trip codex, retrait daté des alias. Cf. mémoire `project-pratiques-ssot-decisions`.
> - **✅ MINI-GUIDE « BALISES DU COURS » LIVRÉ (29 mai PM/soir — 1er chantier du corpus Cowork)** : commit `8f23964`, beta **99.79** (b0529-1805), validé terrain par Grégoire. Aide contextuelle sur le formulaire du cours (popup `cadre-cours-balises` + bulle `reglages-cours-ponderation-heures`) définissant pondération / heure d'enseignement / période / unité avec exemple chiffré + encadré OQLF. **Terminologie OQLF appliquée** : libellés « Heures-contact attendues » → **« Heures d'enseignement »** (id technique `v2-heuresContact` inchangé, zéro churn). 112 tests verts. **Observation a11y préexistante (candidat backlog)** : la modale d'aide (`afficherAideContextuelle`, `accompagnement.js:846`) a `aria-labelledby="aide-ctx-titre"` mais ce span ne reçoit jamais le `titre` de l'entrée → dialogue sans nom pour lecteurs d'écran (vrai pour les ~40 entrées). Spec source : `Plan Accompagnement/SPEC_mini-guide_cours_balises.md`.
> - **▶ DÉCISIONS COWORK ACTÉES (29 mai PM, après lecture complète du corpus du 29 mai)** — cf. mémoire `project-pratiques-ssot-decisions` : (1) **Code canonique Standards = `STD`** (présent dans 17 fichiers, persisté ; `SDT` absent du code = terme oral → devient libellé humain, pas le code) → corriger les ~4 anomalies `code:'PAN'` vers `'STD'` ; ajuster le guide PAN Modalités pour ne pas afficher « SDT ». (2) **Deux guides PAN distincts** confirmé (`pan-rrec` Cadre + `pan` Modalités). (3) **Calendrier** : refonte pratiques (Sessions A→B→C→D) + module guides = **post-AQPC** ; on démarre seulement des chantiers autonomes d'ici le 3 juin. **Incohérences corpus signalées** (à corriger dans les docs Cowork avant de coder) : PLAN_SSOT §7 (découpage sessions) obsolète vs §5 réordonné (Session A = identifiants, pas représentations) ; guide PAN Modalités affiche « code SDT » incompatible avec décision STD ; guide PAN §5.2 du plan maître (23 mai) périmé (« PAN-Maîtrise/Portfolio »), remplacé par les 2 guides du 29 mai (zéro-dette : retirer §5.2 à l'intégration).
> - **✅ CHANTIER E LIVRÉ (29 mai PM, suite — clôt la refonte cours↔période)** : commit `4e0fd2c`, beta **99.78** (b0529-1610), validé terrain (Mac/Safari) par Grégoire. `dupliquerCoursPourTrimestreActif` (créait un doublon de description à chaque reprise) **remplacée** par `reprendreCoursDansTrimestreActif(coursId)`, async, qui n'écrit **jamais** dans `cours` : no-op si un groupe-cours pointe déjà vers la description dans le trimestre actif (ouvre l'assemblage sur le GC existant) ; sinon ouvre le formulaire d'assemblage en mode « nouveau », description pré-sélectionnée (brouillon enseignant·e/horaire/groupe à compléter). Trimestre actif résolu via `obtenirTrimestreActif()` (même source que `cle()`). Zéro-dette : ancienne fonction + export + action de bouton retirés. **112 tests verts** (88 Vitest + 24 Playwright ; +2 cas E + sentinelle de disparition). **Refonte cours↔période COMPLÈTE (A+B+C+D+E).**
> - **Dernier cycle livré (matin-midi)** : **Session 29 mai 2026 (matin-midi)** — 4 commits sur main, **poussés** (`cddbd03..182e627`). Beta **99.72 → 99.76**, builds 0529-0639 → 0529-1139. Deux chantiers : (1) **conformité RREC heures-contact** (`0c64432`, déjà fait la veille, commité ce matin) ; (2) **refonte cours↔période chantiers 0/A/B** (`2654ff9` diagnostic read-only, `8774936` dropdown global, `182e627` lectures de période via trimestre actif). **Fausse alerte « données perdues » élucidée** : Grégoire regardait le trimestre Été vide ; aucun bug, données H2026/A2025 intactes. Voir §0 (29 mai) ci-dessous. Le §0 (28 mai soir) reste documenté plus bas.
> - **Dernier cycle livré (28 mai soir)** : 3 commits sur main (`a45ccb2` onboarding + `eaab101` trimestre d'Été + retouches UX build 0528-1900), poussés. **Trimestre d'Été validé terrain de bout en bout**. Voir le §0 (soir) ci-dessous.
> - **Dernier cycle livré (précédent)** : **Session 28 mai après-midi** — 7 commits sur main (`ed206e9` → `ed83d74`). Beta bumpée 99.71 → **99.72**. Voir §0-prec0. Faits saillants : (1) protocole de début de session formalisé (`SKILL_Debut_de_session.md` créé + pointeur CLAUDE.md + feedback memory globale) après détection d'un écart de 24h entre prémisse de relance et état réel ; (2) **#290 livré en 2 phases** (anonymisation seed `MODELES_PRATIQUES_PREDEFINIS` : 2 éliminations + 9 renommages d'IDs zéro-dette + 10 changements d'auteur 'Gabarit Labo Codex' + 3 modèles génériques en 'Demo Labo Codex' avec filtre transitoire OR) ; (3) **#292 livré** (déduplication défensive au chargement de codex via `verifierUniciteIds` exposé + helper `_estBiblioPartagee`) ; (4) 3 bugs UX résolus en cours de route (suppression copie IDB Michel B., débordement vertical surface `.contenu` en 2 commits — duplication CSS inline ↔ styles.css) ; (5) 3 items BACKLOG inscrits : **#295** (diagnostic mémoire/quota avant chargement Codex iPad/iPhone), **#296** (audit catégoriel des items 'Labo Codex' post-AQPC), **#297** (dette CSS dupliquée index.html ↔ styles.css post-AQPC).
> - **Cycle suivant — démarrage 29 mai 2026 ou ultérieur** : **Lot C du #286** (refactor API `notifications` + migration ~281 emojis ⚠ ✅ ❌ ✓ 💡 dans les notifications). Décision design actée par Grégoire : Option 1 (refactor API avec param `type` qui ajoute l'icône SVG automatiquement). **PRÉ-REQUIS GRÉGOIRE** : télécharger 2 SVG depuis icons8.com — `icons8-warning.svg` (pour le type warning ⚠ ×113 sites) et `icons8-lightbulb.svg` (pour 💡 ×29 sites). Cohérence avec `icons8-info.svg` et `icons8-check.svg` déjà présents. Cf. §2.5 du `plans de travail/PLAN-MIGRATION-ICONES-SVG.md` (Lot C — pré-requis pour démarrer).
> - **⚠️ AVANT AQPC restant** : **#294** (configuration Netlify + Cloudflare pour la visite AQPC du 3 juin, 1-2h).
> - **NB sur l'audit annuel** : on est sur **main**, PAS sur la branche `audit/2026-mai`. L'audit annuel reste en suspens (HEAD audit `097ce88`, divergence depuis 12 mai). Pas de mélange.
> - **Documents clés** : `BACKLOG.md` (#295-#297 ajoutés cette session, #294 toujours ⚠️ AVANT AQPC), `Skills pour Claude Code/SKILL_Debut_de_session.md` (nouveau, versionné), `plans de travail/PLAN-MIGRATION-ICONES-SVG.md` (à mettre à jour pour acter les Lots A et D livrés au commit `11f87a1` du 27 mai PM).

---

## §0bis — Session 29 mai 2026 (PM, suite) : Chantier D EXÉCUTÉ (migration 601-101)

> Migration destructive jouée en **console** (pas dans le code app → pas de bump ; version.json reste 99.77).
> Backup Codex frais confirmé par Grégoire avant exécution.

### Déroulé (méthode DRY-RUN d'abord)
- **Diagnostic + sondes read-only** (console) avant tout : confirmé que l'orphelin `COURS1766455789356`
  (3761 réfs) = 601-101 réel sur **A2024 + A2025** (pas H2026 — les 2 groupes H2026 pointent vers le
  canonique estampillé, `estOrphelin:false`, vérifié). Découverte : `getSync("trimestres")` rend des ids
  vides ⇒ toute la migration lit en **async** (`db.get`).
- **Confirmations de Grégoire** : A2024 = reconstitution rétroactive **jetable** (notes ≠ Omnivox, pas de
  présence/production réelle) ; E2026 (doublon `…2bac`, 24 étudiants + GC 601-102) = **test** du jour.
- **Script** `migrerCoursChantierD()` (fichier temporaire à la racine, **DRY-RUN par défaut**, exécution
  via `{executer:true}`). Deux DRY-RUN successifs pour valider avant l'écriture réelle.
- **Résultat** : 601-101 → `COURS_1780082553764_2_b771b27aca49` (whitelist pure, sans période/assemblage).
  Réécritures FK (async) : H2026 1617 prés/410 évals/51 ét/10 prod/2 GC, A2025 941/305/30/11/1 — **0 perte**.
  Supprimés : A2024 (jetable), E2026 601-101 (test), bruit 601-102, snapshot orphelin redondant.
  Snapshots : 1 par (trim, canonique), priorité à la source réelle (collision résolue).
  Pointeurs `infoCours`/`groupeCoursActif` invalidés (pointaient vers le GC de test) → re-sélectionner un GC.
- **Vérifs OK** : rescan = 1 cours `COURS_*`, 0 doublon, 0 orphelin 601-101 ; idempotence (NO-OP) ;
  notes finales **H2026 et A2025 calculées** (A2025 ≈ 2 pts d'écart avec Omnivox — attendu, données archivées).
- **Ménage post-migration** : Grégoire avait créé 3 GC A2025 identiques en testant l'éditeur ; dédupliqués
  à 1 GC, `pratiqueId` corrigé `pan-standards` → `pan-standards-bedard` (= PAN-Littérature A25).

### Findings laissés (NON corrigés — chantiers distincts)
1. **Bug `getSync("trimestres")`** : désync localStorage↔IDB (ids vides en sync). Cf. mémoire
   `project-bug-getsync-trimestres-desync`. Lire les trimestres en async partout.
2. **Résolution de pratique en consultation** : lit le namespace du trimestre **actif**, pas du
   **consulté** → la note finale d'un trimestre archivé dépend du contexte courant.
3. Résidus orphelins `GC_*`/`601-XSS` score 1 (snapshots indexés par GC) — bruit, nettoyage séparé.

---

## ✅ Chantier E LIVRÉ (refonte cours↔période, dernier — commit `4e0fd2c`)

> Non destructif. La duplication legacy est remplacée par une « reprise » qui ne crée jamais de doublon de cours.

- `dupliquerCoursPourTrimestreActif` (`js/cours.js`, L206-254) **remplacée** par
  `reprendreCoursDansTrimestreActif(coursId)` (async) : garantit un groupe-cours dans le trimestre actif
  pointant vers la **description existante** (no-op si présent → ouvre l'assemblage sur le GC existant ;
  sinon GC brouillon + ouvre l'assemblage, description pré-sélectionnée). **Aucune écriture dans `cours`** → zéro doublon.
- Trimestre actif résolu via `obtenirTrimestreActif()` (même source que le namespacing `cle()`).
- Bouton « Reprendre » rebranché (action `reprendreCoursDansTrimestreActif`) ; ancienne fonction + export retirés (zéro-dette).
- Tests : `tests/integration/cours-refonte-rendu.spec.js` — 2 cas E (0 doublon + brouillon pré-sélectionné ; no-op GC) + sentinelle de disparition. 112 verts.
- Plan directeur : `docs/PLAN-refonte-cours-description-independante.md` (§Chantier E).
- Mémoires : `project-donnees-reelles-601-101` (601-101 consolidé sous `COURS_1780082553764_2_b771b27aca49`).

### Findings du chantier D laissés (non corrigés — toujours valables)
1. Bug `getSync("trimestres")` (ids vides en sync) — `project-bug-getsync-trimestres-desync`.
2. Résolution de pratique en consultation lit le namespace du trimestre actif, pas du consulté.
3. Résidus orphelins `GC_*`/`601-XSS` score 1 (bruit, nettoyage séparé).

---

## §0 — Session 29 mai 2026 (après-midi) : chantier C (refonte) + fix horaire « propre au trimestre »

> 3 commits sur main. Beta 99.77, build 0529-1350. 110 tests verts (88 Vitest + 22 Playwright).

### Chantier C — création/édition cours via la description pure (non destructif)
- `js/trimestre-v2-cours.js` (−158 l.) : persistance routée via `CoursEntite.creer/mettreAJour`
  (source unique), nouveaux cours → ID `COURS_*`, édition → ID préservé + champs legacy
  conservés (601-101 intact jusqu'au chantier D). Retrait du code mort : lectures
  enseignant/session, `_obtenirGroupeCoursExistant`, `_construireObjetCoursV2`,
  `_persisterCoursV2`, fonctions de remplissage enseignant/horaire, `chargerDropdownPratiquesCours`.
- **Découverte** : le « déplacement de champs vers le groupe-cours » du plan était déjà fait
  au DOM (le formulaire cours ne contenait plus que les champs ministériels). Chantier C s'est
  donc réduit à un nettoyage de la couche données.
- Sentinelle `tests/integration/cours-refonte-rendu.spec.js` (création = `COURS_*` sans
  période/assemblage ; édition legacy = ID préservé + champs legacy conservés).

### Fix horaire « propre au trimestre » (#124) — bug testeur
- **Bug** : éditer un horaire pendant que le trimestre actif basculait sous lui → sauvegarde
  dans le mauvais namespace (`{trim}_horaires`) → `findIndex` = −1 → no-op silencieux + faux
  « modifié » + **perte de la modif** + disparition du select. Pré-existant, non lié au chantier C.
- **Décision modèle (Grégoire)** : horaire propre au trimestre, recréation pure, jamais de
  récup/duplication cross-trimestre, UI explicite. Cf. mémoire `project-modele-horaire-par-trimestre`.
- **Fix** (3 points) : (1) `changerTrimestreActifV2` réinitialise l'éditeur d'horaire au
  changement de trimestre ; (2) `chargerHorairesV2` affiche franchement l'état vide si le
  trimestre actif n'a pas d'horaire (plus de fallback non-namespacé) ; (3) garde défensif dans
  `sauvegarderHoraireV2` (jamais de faux « modifié »). Sentinelle `horaire-par-trimestre.spec.js` (2 cas).

### Note de procédé (acté en mémoire `feedback-bump-build-session-ouverte`)
- Bumper le build pendant une session Safari file:// ouverte crée un **cache hybride** (scripts
  à versions mêlées) qui simule de faux bugs (boutons/sélecteurs morts). Remède : `Cmd+Option+R`.
  Suspecter le cache AVANT le code si comportement bizarre juste après un bump.

### Reste à faire (refonte)
- **Chantier D** (DESTRUCTIF) : re-ID `COURS_*`, dédup par code, réécriture FK `coursId`. Backup Codex obligatoire.
- **Chantier E** : `reprendreCoursDansTrimestreActif` + retrait legacy.
- **Question versée à la refonte** : périmètre des horaires (confirmé « par trimestre » — pas une dette).

---

## §0 — Session 29 mai 2026 (matin-midi) : RREC heures-contact + refonte cours↔période (chantiers 0/A/B)

> 4 commits sur main, poussés. Beta 99.72 → 99.76. Plan directeur :
> `docs/PLAN-refonte-cours-description-independante.md` (6 chantiers 0→E).

### Livré et poussé

| Commit | Beta/build | Contenu |
|---|---|---|
| `0c64432` | 99.73 / 0529-0639 | **Chantier A heures-contact (RREC)** — champs `heuresContact` + `ponderation` sur l'entité cours + formulaire ; helper `proposerHeuresContactDepuisPonderation` (proposition non destructive, heures-contact = SSOT). Fix tactique : `_deriverSessionAnneeTrimestreActif` (session/année dérivées du trimestre actif dans `_lireChampsSessionDOM` — les champs DOM `#v2-session/#v2-annee` n'existent pas et estampillaient tout en h2026). |
| `2654ff9` | 99.74 / 0529-1016 | **Refonte chantier 0** — `_diagnostiquerModeleCours()` (`js/cours.js`, async, **lecture seule**). Console : `await _diagnostiquerModeleCours()`. |
| `8774936` | 99.75 / 0529-1120 | **Refonte chantier A** — `chargerDropdownCoursV2` ne filtre plus par trimestre (bibliothèque globale). `infoCours` conservé (la bascule de trimestre en dépend, cf. trimestres.js:364). |
| `182e627` | 99.76 / 0529-1139 | **Refonte chantier B** — lectures de période COURANTE dérivées du trimestre actif (trimestres.js ×2, statistiques.js) ; `_deriverSessionAnneeTrimestreActif` exporté sur window. |

### Faits importants relevés (diagnostic sur données réelles)

- **601-101 = seul cours réel de Grégoire** : A2025 (1 groupe, archivé/lecture seule) + H2026 (2 groupes). 601-102 = cours de test supprimé/recréé. `601-XSS` et les `GC_*`-comme-`coursId` = pollution de test.
- **Cible de consolidation du chantier D** : 601-101 est éclaté sur **3 coursId** → `h2026-601-101-MQ-00001` (2091 réfs : 1617 présences, 410 évals…), doublon `COURS_*…2bac` (25 réfs), **orphelin `COURS1766455789356` (3761 réfs, probable A2025, sans objet `cours`)**.
- **Fausse alerte « données perdues »** : Grégoire regardait le trimestre Été (vide). Trimestre actif = h2026, `h2026_horaires`/`h2026_groupesCours` présents et bien assemblés. Aucune régression du commit Été. Piste UX notée : message d'état vide pour un trimestre neuf.

### Reste à faire (refonte)

- **Chantier C** (bloc dédié, UI) : router persistance via `CoursEntite`, `_construireObjetCoursV2` sans période/assemblage + ID `COURS_*`, déplacer enseignant/groupe/horaire/pratique du formulaire **Cours** vers le formulaire **Groupe-cours**. Consultation `design-system.html` requise. Reporte aussi la **famille identité/dédup** du chantier B (`_tupleCoursNaturel`, dédup import cours.js:463, cartes biblio cours.js:285/312).
- **Chantier D** (DESTRUCTIF) : re-ID `COURS_*`, dédup par code (canonique = score max), réécriture de toutes les FK `coursId`. **Backup Codex complet OBLIGATOIRE avant.**
- **Chantier E** : `reprendreCoursDansTrimestreActif` (zéro doublon) + retrait legacy.

---

## 🤝 Apport Cowork — 29 mai 2026 (audit RREC + guides PAN + architecture pratiques)

> Travail de **conception/rédaction produit en Cowork** par Grégoire + Claude, à refiler à
> Claude Code **après** le chantier en cours (balises du cours / nombre de périodes RREC).
> **Rien ici n'est urgent avant l'AQPC (J−5)** : ce sont des specs et des documents, pas du
> code livré. L'aiguillage ci-dessous indique quoi attaquer quand la fenêtre s'ouvre.

### Documents produits (tous versionnables)

| Fichier | Nature | Statut |
|---|---|---|
| `Rapports/AUDIT-CONFORMITE-RREC-C29r4.md` | Audit de conformité de l'app au RREC (C-29, r.4) | Terminé (informationnel) |
| `Plan Accompagnement/PLAN_guide_PAN_refonte_RREC.md` | Guide **« Cadre réglementaire »** (4 pages HTML) | Spec prête à intégrer |
| `Plan Accompagnement/PLAN_guide_PAN_pedagogique_CSE.md` | Guide **« Modalités »** (4 pages, fondé sur le CSÉ) | Spec prête à intégrer |
| `Refactorisations/PLAN_architecture_pratiques_SSOT.md` | Architecture cible : registre `IPratique` = source unique | Plan validé (post-AQPC) |
| `Refactorisations/PLAN_unification_codes_pratiques.md` | Audit des call-sites des codes de pratiques | Audit = référence ; recommandation *superseded* par le plan SSOT |
| `Refactorisations/SPEC_sessionA_identifiants.md` | Spec d'implémentation fichier-par-fichier (Phase 0) | **Prête à coder** |

### Décisions actées (29 mai)

- **Deux guides distincts** dans le futur module unifié (cf. `Plan Accompagnement/PLAN_guides_pedagogiques.md`) : *Cadre réglementaire* (id `pan-rrec`) et *Modalités* (id `pan`). Registre « cadre + responsabilité partagée » : les guides disent *aider/cadrer*, jamais *garantir* la conformité (le seuil 60 % et la PIEA restent hors app).
- **Nommage neutre, dépersonnalisé** pour les pratiques : identifiants `sommative` / `standards` / `specifications` / `denotation` ; codes courts SOM/STD/SPE/DEN (lettres **inchangées** — pas de churn de données) ; « PAN » = libellé de **famille**, plus un préfixe technique ni un jeton de calcul.
- **D1 tranchée** : « objectifs » **n'est pas** une pratique distincte (1 seul cas sur 6 cartographies, fonctionnellement du Standards-Based Grading à granularité fine). Le fold `pan-objectifs` → `standards` est rattaché à la **session calcul** (le module `standards` implémente déjà `_calculerPerformanceParObjectifs`). Aucune donnée de production en objectifs → capacité à conserver, pas donnée à migrer.
- **Périmètre de préservation** (zéro-dette, pas de base d'utilisateurs) : **seules les données de Grégoire** (pratique `standards`, trimestres, grilles, évaluations, backups Codex). Packs démo et JSON du sondage = fixtures librement modifiables.

### Bug latent à corriger (découvert à l'audit)

`obtenirIdPratiqueActive()` (`js/pratiques/pratique-registre.js:226-231`) « migre » `specifications` → `pan-specifications` et réécrit en base — alors que l'instance est enregistrée et s'identifie sous `specifications` (`pratique-pan-specifications.js:671,88`). Résultat : `obtenirPratiqueActive()` fait `.get('pan-specifications')` → **échec** + `console.error`. La normalisation pousse dans le mauvais sens. Corrigé par la Session A.

### Aiguillage pour Claude Code (post-AQPC, ordre impératif)

1. **Session A — identifiants** (`SPEC_sessionA_identifiants.md`) : fondation. Canonicalisation neutre + correction du bug ci-dessus + constante `PRATIQUE_DEFAUT` + migration boot/tolérance import limitée aux données de Grégoire. **À faire avant les deux suivantes** (la résolution id→instance doit être fiable d'abord).
2. **Session B — représentations** : étendre `IPratique` (`obtenirCode`/`obtenirCouleur`/`obtenirLabelFamille`), router tous les badges/couleurs vers le registre, **supprimer** les tables locales éparpillées (gabarits-utils, wizard, pratique-notation-v2, main.js, etudiants.js, echelles).
3. **Session C — calcul** : router le moteur d'indices vers `pratique.calculerPerformance(da)`, **supprimer le jeton binaire `'SOM'|'PAN'`**, et y rattacher le fold `objectifs ⊂ standards` (invariant : indices identiques avant/après, tests chiffrés).

Les **guides PAN** (Cadre + Modalités) sont indépendants de ce refactor ; leur intégration dépend de la création du module `js/guides-pedagogiques.js` (cf. `PLAN_guides_pedagogiques.md`), elle-même post-AQPC.

### Lien avec le chantier en cours (périodes RREC)

L'audit confirme que la notion de **« cours ≥ 45 périodes » et « unité = 45 h »** relève de l'art. 1 et de l'art. 18 du RREC — c'est une balise **institutionnelle**, cohérente avec l'ajout de balises de périodes au cours. Le seul article à portée matérielle pour la *notation* est l'**art. 27** (seuil de réussite 60 %), déjà respecté par défaut dans le code. Détails dans `Rapports/AUDIT-CONFORMITE-RREC-C29r4.md`.

### Terminologie « heure d'enseignement » + mini-guide des balises du cours (ajout 29 mai)

Recherche poussée (sources fiables) sur **période / heure-contact / unité**, en appui au chantier A en cours.

- **Tranché par l'OQLF** (Grand dictionnaire terminologique, fiche « heure d'enseignement ») : le terme correct est **« heure d'enseignement »** (« heure pendant laquelle le professeur est en présence des étudiants pour un enseignement théorique ou pratique » ; unité de mesure de la charge). **« heure-contact » est DÉCONSEILLÉ** — calque de l'anglais *contact hour*. → L'app emploie partout l'anglicisme (`v2-heuresContact`, `proposerHeuresContactDepuisPonderation`, `ANALYSE-conformite-RREC-heures-contact.md`) : **chantier terminologique à prévoir** (libellés UI au minimum).
- **Période ≠ heure d'enseignement** : la période est le bloc horaire (50 ou 55 min selon le collège — sources cégep Sainte-Foy 50 min, Rimouski 55 min ; le défaut `dureePeriodeMinutes` = 55 de `horaire.js:288` est donc une valeur légitime mais non universelle). L'heure d'enseignement est l'unité de compte : 1 période comptée pour 1 heure. Le RREC compte les cours **en périodes** (art. 1).
- **Ambiguïté interne confirmée** : l'exigence (pondération × 15) compte 1 période = 60 min ; le réalisé de l'horaire convertit à 55 min → faux écart possible (ex. « 55 / 60 h » pour un cours pourtant conforme). **Recommandation** : compter les deux côtés dans la **même** unité, idéalement en **périodes / heures d'enseignement** (unité du RREC et du devis), pas en minutes d'horloge.

**Livrable** : `Plan Accompagnement/SPEC_mini-guide_cours_balises.md` — aide contextuelle (mode *popup*) à greffer sur le formulaire du cours, onglet **Cadre**, près des champs Pondération / Heures d'enseignement. Définit période / heure d'enseignement / unité / pondération, avec exemple chiffré (2-2-3 → 60 h enseignement + 45 h perso = 105 h = 2 ⅓ unités) et encadré sur l'anglicisme. Sources notées dans la spec (OQLF, RREC art. 1, ministère « Prescriptions ministérielles » 2019, cégeps Trois-Rivières/Montmorency/Sainte-Foy/Rimouski).

**Complément — bulle au survol** (`SPEC_mini-guide_cours_balises.md` §6) : en plus du *popup*, une bulle `data-tooltip="reglages-cours-ponderation-heures"` à poser sur la rangée Pondération / Heures du formulaire (`index.html` ~ l. 6977), texte court dans `accompagnement-contenu-hover.js`. Porte la nuance : pondération = théorie–labo–travail personnel (h/sem) ; (théorie+labo)×15 = heures d'enseignement ; 1 heure d'enseignement = 1 période (50-55 min selon le collège), pas 60 min ; en session intensive, l'invariant = le total d'heures. **Renommer en même temps** « Heures-contact attendues » (`index.html:6984`) → « Heures d'enseignement » (OQLF). ⚠️ **Collision** : ces champs (`v2-ponderation`/`v2-heuresContact`) sont ceux du chantier A en cours — intégrer la bulle **dans ce chantier**, pas en parallèle.

---

## §0 — Récap session 28 mai 2026 SOIR (réconciliation état réel + onboarding + support trimestre d'Été)

**Beta / build** : **99.72** conservée. Builds 0528-1807 → 0528-1821 → 0528-1900. **3 commits sur main, poussés sur origin** : `a45ccb2` (onboarding) + `eaab101` (trimestre d'Été — commit amendé pour y intégrer le nettoyage `calendrier-vue.js`) + commit 3 (retouches UX finales, build 0528-1900).

### Réconciliation à l'ouverture (l'en-tête était périmé)

Au démarrage, audit git+tests : HEAD réel `d587a53` (≠ `ed83d74` annoncé par le §0-prec0). **Tout le « cycle suivant » annoncé était déjà livré et poussé** : Lot C #286 (refactor `utils-notifications.js` + émojis), #287 (picker couleur), #288 (élève→étudiant·e), #289 (audit palettes), #293 (toggle masquer sidebar), #294 (déploiement — action dashboard Cloudflare restant côté Grégoire), + nouveau #298 (recadrage Loi 25 + fenêtre publique 3-30 juin). À J−6 de l'AQPC, le code est prêt ; risque résiduel = action Cloudflare + validation visuelle iPad (limitée par saturation mémoire, cf. #295).

### Commit 1 — Onboarding (`a45ccb2`, build 0528-1807)

Signalé par Grégoire sur captures iPad : l'onboarding pointait vers une nav périmée (onglet « Réglages » éclaté entre **Cadre** = id interne `calendrier`, et **Conception** ; « Contexte »/« Structure » = noms encore antérieurs).

- **Visite guidée** (`accompagnement.js`) : 6 titres alignés sur la nav réelle (Réglages→**Cadre**, Structure→**Conception**, Tableau de bord→**Suivi**). **Fix fonctionnel** : `correspond()` étape 1 cherchait `contexte-*` (inexistant) → corrigé en `calendrier-*`, sinon l'étape ne s'accrochait jamais à la page Cadre.
- **Aides au survol** (`accompagnement-contenu-hover.js`) : `nav-conception` « Structure »→« Conception », `nav-calendrier` « Contexte »→« Cadre ».
- **Accueil** (`accueil.js`) : encart Bienvenue réduit au seul bouton « Commencer la visite guidée » (retrait des doublons « Aller à Cadre » + « Explorer avec des données démo », couverts par les toggles du bas) ; retrait du handler orphelin `entrerEnDemoHandler` (zéro-dette) ; retrait mention « Cohorte 1 / CoP » ; adresse courriel rendue cliquable (`mailto:`).
- **CSS** (`styles.css`) : fix spécificité `.banniere-bienvenue .banniere-bienvenue-acces p` — battait `.banniere-bienvenue p:last-of-type` (margin-bottom 18px) qui créait un faux « retour à la ligne » sous l'encadré d'accès.
- **BACKLOG #299** inscrit : balayage des ~30 réf. d'onglets périmées « Réglages → X » dispersées (wizard pratiques, profils, cartouches…) à corriger post-AQPC. Dernier ID → **#299**.

### Commit 2 — Support de la session d'Été (`eaab101`, build 0528-1821)

Demande de Grégoire : créer un trimestre d'été (Cégep Drummondville, été 2025 = 28 mai → 30 juin, ~5 semaines). Audit (agent Explore) : ~28 points dans 7 fichiers, mais **terrain déjà à moitié prêt** (mapping `'E'↔'ete'` dans `trimestre-v2-init.js`, option HTML `<option value="ete">`, ~10 objets `{a,h,e}` déjà OK, `cle()` et génération d'ID génériques).

- **Décision métier actée** : plages de mois de DÉBUT — **Hiver 1-4 · Été 5-7 · Automne 8-12** (mai → Été, capte le 28 mai ; août reste à l'automne).
- **Helpers centralisés** (`trimestres.js`, exposés `window`) : `sessionDepuisMois(mois)` + `nomSession(lettre)` — remplacent **5** déductions binaires dupliquées (`(mois<=6)?'H':'A'`) et les ternaires de libellé. Tri fallback H>E>A.
- **🔴 Sécurité données** : regex de préfixe namespacé `[ah]`→`[aeh]` — `codex.js` ×3 (`_estBiblioPartagee`, extraction + filtrage export), `db.js` (audit SSOT), `trimestre-v2-cours.js:900` (extraction session active). Sans ça, `e2026_*` aurait été **exclu silencieusement** de l'export/codex.
- **Création** (`trimestre-v2-liste.js`) : prompt propose A/H/**E** + validation + libellés via `nomSession`.
- **Calendrier** (`calendrier-vue.js`) : un trimestre Été affiche **mai–juillet** ; **+ retrait de l'objet `config` mort** (jamais lu, portait des dates de semaines spéciales codées en dur 2025).
- **Libellés « Été »** via `nomSession` : `codex.js` (`_formaterNomTrimestre`), `synthese-retroaction-data.js`, `cours.js` ×2.
- **Semaines spéciales** : Grégoire a confirmé que l'été n'a ni semaine de planification ni d'examens. **Déjà géré** : champs vides → `estDansPlage` renvoie `false` (via `obtenirInfosJour`) → aucune semaine spéciale marquée. Le `×` (`reinitialiserSemainesSpecialesV2`) les vide. Le `2026-05-28` affiché dans ces champs est un **placeholder**, pas une valeur.

### Tests

Suite complète **verte** (18 Playwright WebKit + Vitest) après chaque chantier, y compris après le nettoyage `calendrier-vue.js`. `node --check` vert sur tous les fichiers touchés.

### Commit 3 — Retouches UX finales + validation terrain (build 0528-1900)

Après validation terrain par Grégoire (création complète d'un trimestre Été 2026 de bout en bout) :

- **Bouton biblio cours** « Dupliquer » → « **Reprendre dans ce trimestre** » (`cours.js`) — clarté pour les expérimentateurs (le bouton reprend le cours dans le trimestre actif ; le `title` explicatif est conservé).
- **Message d'état vide étudiants** (`trimestre-v2-etudiants.js` + `index.html`) : « Utilise l'import à gauche ou le formulaire ci-dessous » → « Utilise le **formulaire ci-dessous** ou l'import **plus bas** » (l'import n'est pas à gauche mais sous le formulaire).
- **Diagnostic corrigé** : j'avais d'abord supposé le cours « invisible dans la biblio » (flag `dansBibliotheque` undefined) — **c'était faux**. Le cours était bien présent ; `dupliquerCoursPourTrimestreActif` reprend correctement le cours dans le trimestre actif (`trimestreId`/`session`/`annee` du trimestre courant). Aucun fix de filtre nécessaire.

**Validation terrain de bout en bout (Grégoire, 28 mai soir)** : trimestre Été 2026 créé → cours `601-101-MQ` repris depuis la Bibliothèque (→ `e2026`) → horaire des séances → groupe d'élèves → association du groupe-cours. **Tout fonctionne.** Le support de la session d'Été est validé en conditions réelles.

### Pour la prochaine session

- **Validation visuelle Grégoire** : ✅ faite — trimestre Été 2026 créé de bout en bout (trimestre + cours repris + horaire + groupe + association). Reste à confirmer un **export Codex** contenant `e2026_*` à l'occasion.
- **#299** (réf. onglets périmées) à traiter post-AQPC.
- Priorités déférées inchangées : #282 (migration `cours.js`), #296, #291, #295, lots restants #286.

---

## Note de relance — 28 mai 2026 après-midi

Prémisse de la commande de relance reçue : HEAD attendu au commit final du 26 mai PM (~`0526-1120`) et un Lot A « nettoyage ✴ » d'environ 76 occurrences à exécuter.

Audit réel à l'ouverture de session :

| Vérification | Attendu par la prémisse | Réel mesuré |
|---|---|---|
| HEAD `main` | commit du 26 mai PM | `e307415` du 28 mai matin |
| Occurrences `✴` / `✴️` dans `*.js` + `*.html` | ~76 | **0** |
| Suite de tests | 103/103 (85 Vitest + 18 Playwright) | **106/106** (88 Vitest + 18 Playwright) |
| État branche | main propre | à jour avec `origin/main`, tracked propre |

Lecture : la prémisse est en retard de deux cycles. Les sessions du 27 mai matin (refonte UI), 27 mai PM (chantiers correctifs iPhone 1+2+3) et 28 mai matin (vérification visuelle 7 zones + 5 fix iPhone) sont déjà mergées. Le **Lot A « nettoyage ✴ » a été livré dès le commit `11f87a1` du 27 mai PM** (« retrait des émojis dans l'interface visible utilisateur — chantier 1 responsive iPhone »). Aucune action à prendre côté ✴.

Cap conservé : on reste sur la priorité déjà inscrite en ligne 14 ci-dessus — **BACKLOG #290 (intégration des 4 pratiques personnelles anonymisées au seed `MODELES_PRATIQUES_PREDEFINIS`, à livrer AVANT AQPC du 3 juin)**.

---

## §0-prec0 — Récap session 28 mai 2026 après-midi (protocole début de session + #290 en 2 phases + 3 bugs UX + #292)

**Beta / build** : **99.71 → 99.72**. Builds 0528-0644 (matin) → 0528-0941 → 0528-1001 → 0528-1012 → 0528-1028 → 0528-1039 → 0528-1045 (5 bumps de build successifs au fil des commits). HEAD main au moment du relai : `ed83d74`. Aucun push (commits restent locaux pour validation Grégoire avant push).

**Commits cette session** (7 sur main, aucun push) :

| # | Hash | Description | Build |
|---|------|-------------|-------|
| 1 | `ed206e9` | docs(skills) : protocole de début de session formalisé (SKILL_Debut_de_session.md créé) + versionner SKILL_Fin_de_session.md (était untracked) + pointeur en tête de CLAUDE.md « Avant de coder » + #295 inscrit | (pas de bump — doc/skill pur) |
| 2 | `1fcad27` | feat(pratiques) : #290 phase 1 — anonymiser seed MODELES_PRATIQUES_PREDEFINIS + zéro-dette IDs + 2 éliminations | b0528-0941 (beta 99.72) |
| 3 | `c791f1b` | feat(pratiques) : #290 phase 2 — 3 modèles génériques 'Demo Labo Codex' + filtre transitoire estItemDemo en mode OR + #296 inscrit | b0528-1001 |
| 4 | `0d372b3` | fix(pratiques) : autoriser suppression copie IDB qui partage un ID avec un seed prédéfini | b0528-1012 |
| 5 | `55a3230` | fix(ui) : retirer min-height: 500px de `.contenu` dans styles.css (tentative 1, incomplète) | b0528-1028 |
| 6 | `2e42598` | fix(ui) : retirer min-height: 500px aussi du `<style>` inline d'index.html (tentative 2, complète) | b0528-1039 |
| 7 | `ed83d74` | feat(codex) : #292 — déduplication défensive au chargement de codex + #297 inscrit | b0528-1045 |

### Méthode

**1. Audit factuel à l'ouverture** (issu du protocole tout juste formalisé) : grand écart détecté entre la prémisse de relance reçue (HEAD attendu 26 mai PM, Lot A ✴ à faire) et l'état réel (HEAD 28 mai matin, ✴ déjà retiré au commit `11f87a1` du 27 mai). Note de relance ajoutée dans SESSION.md (cf. ci-dessus) pour acter l'écart de 2 cycles.

**2. Formalisation du protocole de début de session** (commit 1) après le constat précédent. Création de `Skills pour Claude Code/SKILL_Debut_de_session.md` : pendant inverse de SKILL_Fin_de_session.md, structuré en 7 étapes (inventaire git, tests, version, lecture SESSION.md, lecture BACKLOG.md, comparaison prémisse vs réel, rapport final). Lecture seule, aucune modification automatique. Pointeur en tête de la section « Avant de coder » de CLAUDE.md pour chargement systématique. Feedback memory globale `feedback-audit-factuel-debut-session` sauvegardée — survit au-delà de ce projet. Item BACKLOG #295 ajouté pour diagnostic mémoire/quota avant chargement Codex iPad/iPhone (signalé par Grégoire : son iPad sature, limite ses tests sur ces devices).

### #290 livré en 2 phases (commits 2 et 3)

**Phase 1** (`1fcad27`) — anonymisation du seed `MODELES_PRATIQUES_PREDEFINIS` :

- Dump du `bibliothequePratiques` IDB de Grégoire : 9 pratiques personnelles dont 5 correspondent à des entrées du seed (FAH, BV ×2, Xavier C.-T., Michel B.). Les configs détaillées des collègues étaient déjà dans le seed sous des IDs non conformes (avec prénom), juste l'auteur étiqueté 'Labo Codex' au lieu de 'Gabarit Labo Codex'.
- **2 éliminations** : `SPE-litterature` (test wizard sans valeur de référence, confirmé par Grégoire) + `STD-par-objectifs-comptage` (modèle générique squelette à 3 objectifs non nommés, doublon de `STD-chimie-organique` pour Bruno V.).
- **9 renommages d'IDs zéro-dette** (CLAUDE.md principe acté) :

| Ancien ID | Nouveau ID |
|---|---|
| `SPE-francois` | `SPE-chimie-contrats` |
| `STD-Bruno-Chimie` | `STD-chimie-organique` |
| `STD-Xavier-Info` | `STD-info-interfaces-bd` |
| `SOM-Etienne-Admin` | `SOM-comptabilite` |
| `SOM-Olivier-Geo` | `SOM-geographie` |
| `SOM-Helene-Philo` | `SOM-philo-portfolio` |
| `SOM-MarieHelene-Litt` | `SOM-litterature` |
| `STD-Isabelle-Bio` | `STD-anatomie` |
| `SOM-Jordan-Philo` | `SOM-philo-remplacement` |

- **10 changements d'auteur** `'Labo Codex'` → `'Gabarit Labo Codex'` (pour les gabarits dérivés de collègues anonymisés). Modèles génériques (`SPE-simple`, `STD-n-meilleurs`, `STD-n-recents`) restent `'Labo Codex'` à ce stade.
- **Mise à jour description** `SPE-chimie-contrats` : « Notation par contrats » (au lieu de « Basé sur une pratique en chimie »), aligné avec la version IDB de François A.-H..
- **Audit grep call-sites** : aucune référence littérale aux anciens IDs hors du seed. Tous les accès passent par `MODELES_PRATIQUES_PREDEFINIS[configId]` dynamique. Renommage sans risque pour le code applicatif.
- Seed passe de 15 à 13 entrées.

**Phase 2** (`c791f1b`) — convention `'Demo Labo Codex'` pour les 3 modèles génériques :

- Grégoire a clarifié pendant la session : `SPE-simple`, `STD-n-meilleurs`, `STD-n-recents` sont en réalité du **matériel démo lié au dataset de la checkbox d'accueil**, pas des canevas génériques. Ils ne doivent être visibles QU'en mode démo.
- Découverte : le filtre `BibliothequeUI.estItemDemo` (`js/bibliotheque-ui.js:33`) considère tout item avec `auteur === 'Labo Codex'` comme « démo » et le masque hors mode démo. C'est ce qui cachait déjà les 3 modèles génériques chez Grégoire (constat : « 3 pratiques que je ne vois pas »).
- Convention tranchée : `'Demo Labo Codex'` pour le matériel démo, `'Gabarit Labo Codex'` pour les gabarits de collègues anonymisés, `'Labo Codex'` (legacy) à terme retiré du filtre.
- **Filet transitoire** : `estItemDemo` accepte temporairement les deux chaînes `'Labo Codex'` OR `'Demo Labo Codex'`. Permet de migrer progressivement les ~30 autres occurrences de `'Labo Codex'` dans 8 autres fichiers seed (echelles, gabarits-utils, spe-specifications, demo-namespace, etc.) sans casser le filtre démo.
- **Item BACKLOG #296 inscrit** : audit catégoriel post-AQPC pour distinguer (A) vraies démos référencées par le dataset démo, (B) canevas génériques mal taggués, (C) résidus de tests de dev. Hypothèse de Grégoire : « beaucoup de ce matériel est en réalité des résidus de tests de dev que j'ai voulu supprimer mais qui sont restés ». 2-3h estimé.

### Bug fix suppression copie IDB (commit 4)

- Rapport BUG signalé par Grégoire 10:05 (`BUG_grégoire_2026-05-28_10-05-12.txt`, gravité GÊNANT) : impossible de supprimer la copie IDB de la pratique « Par objectifs (Pondéré) » de Michel B. depuis la modale Bibliothèque. Modale apparaît, confirmation, et « rien ne se passe ».
- Diagnostic : 2 protections « gabarit prédéfini » (ligne 603 de pratiques-gestion.js + ligne 692 de pratiques-bibliotheque.js) refusaient toute suppression d'ID présent dans `MODELES_PRATIQUES_PREDEFINIS`. Or `STD-par-objectifs-pondere` reste dans le seed (juste auteur changé en phase 1) et l'IDB de Grégoire contient une copie avec auteur 'Michel B.'. L'`alert()` du refus était probablement affiché brièvement par Safari dans un handler async fork-and-forget, mais non perçu.
- Fix : **assouplir la sémantique** — autoriser la suppression de la copie IDB. Logique : le seed vit dans le code source (jamais affecté par l'UI), et se réinjecte automatiquement au prochain rafraîchissement via `obtenirToutesLesPratiquesBibliotheque` (qui ajoute le gabarit du seed quand son ID n'est pas dans IDB). Notifications `notifications.info` / `notifications.erreur` à la place d'`alert()` pour le feedback de refus (utile uniquement quand l'ID n'est que dans le seed).
- Conséquence pour Grégoire : ménage IDB possible, ses 6 entrées doublons (FAH, BV ×2, Xavier C.-T., Michel B., SPE-litterature de wizard) supprimables une à une. Confirmé après recharge : sidebar propre, ne reste que ses 2 pratiques perso PAN-Littérature A25 + PAN-SDT-Litt H26.

### Bug fix débordement vertical surface .contenu (commits 5 + 6)

- Signalé par Grégoire sur les pages Pratiques de notation, Grilles de critères, Échelles de performance : le rectangle sombre extérieur (surface `.contenu`) s'étendait bien au-delà du contenu réel → grand vide visuel en bas (« la bordure du bas est très large »).
- **Première tentative** (commit 5) : retrait de `min-height: 500px` dans `styles.css:1789` après inspection DevTools. Insuffisant — débordement persistait après hard refresh.
- **Diagnostic du persistant** : capture DevTools de Grégoire (10:38) révèle que la règle `.contenu { min-height: 500px }` vit AUSSI dans le `<style>` inline d'`index.html` ligne 1361-1364, qui surcharge le CSS externe (CSS critique inliné pour l'affichage initial — duplication non documentée).
- **Deuxième tentative** (commit 6) : retrait également du `<style>` inline. Résolu après Cmd+Opt+E (vider caches Safari) + Cmd+Shift+R.
- Notes méthodologiques :
  - Le hard refresh seul (Cmd+Shift+R) **n'invalide pas toujours le cache CSS sur file://** dans Safari. Solutions : Cmd+Opt+E (Vider les caches) OU Développement > Désactiver les caches (tant que DevTools est ouverte).
  - Pattern observé : CSS dupliqué entre `<style>` inline d'index.html et styles.css externe. Risque pour les fix futurs.
- **Item BACKLOG #297 inscrit** : audit complet de la duplication CSS inline ↔ styles.css, post-AQPC. 1-2h estimé.

### #292 livré (commit 7)

- Fix de la source de propagation des doublons d'ID au chargement de codex.
- `chargerCodex` (`js/codex.js:454`) faisait un overwrite complet par clé sans déduplication. Codex source avec doublons → restauration à l'identique à chaque ouverture. Le codex de Grégoire en est infecté (3 doublons confirmés dans `grillesTemplates`).
- **Fix** :
  - `import-export.js` : `verifierUniciteIds` (défini ligne 66) désormais exposé via `window.verifierUniciteIds` (1 ligne en bas de l'IIFE) — accessible depuis codex.js.
  - `codex.js` : nouveau helper `_estBiblioPartagee(cle)` qui retourne true si la clé correspond à une bibliothèque partagée. Liste cible alignée avec les sites qui appliquent déjà `verifierUniciteIds` dans import-export.js : `grillesTemplates`, `echellesTemplates`, `pratiquesConfigurables`, `bibliothequePratiques`, `bibliothequeGrilles`, `bibliothequeEchelles`, `bibliothequeCartouches`, `bibliothequeProductions`, plus tous `cartouches_*`. Accepte les variantes namespacées (h2026_, a2025_) via regex.
  - `codex.js` : boucle de `chargerCodex` modifiée pour appeler `verifierUniciteIds` AVANT `db.set` quand la clé est une biblio partagée et que la valeur est un tableau. Silencieux quand pas de doublons. Log via `console.warn` quand corrections.
- Conséquence : tout codex chargé désormais nettoyé à la volée. Les doublons d'ID résiduels corrigés par `genererIdUnique` (le 2e exemplaire est ré-identifié).
- **Hygiène data complémentaire** (à faire séparément si besoin) : nettoyer le codex actuel de Grégoire via un snippet console qui exporte → recharge le codex via la version 99.72+ → le ZIP re-exporté sera propre.

### État du chantier #286 (migration émojis → SVG) au 28 mai PM

Audit grep réel (excluant docs/changelog/popups pédagogiques) :

| Lot | Statut | Détail |
|---|---|---|
| **F** | ✅ livré 26 mai | retrait 15 PNG `outils-*` legacy |
| **I** | ✅ livré 26 mai | bascule palette aide orange → jaune `#e8c43a` |
| **J** | ✅ livré 26 mai | 5 couleurs sections par `background-blend-mode: multiply` |
| **A** (✴ bouton aide) | ✅ livré 27 mai | au commit `11f87a1` — 0 occurrence ✴ en code applicatif |
| **D** (pastilles RaI 🟢🟡🔴🟠⚫) | ✅ livré 27 mai | même commit — remplacé par CSS `.pastille-rai` |
| **B** (illustrations sections) | ⚠ partiel | reste ~140 occurrences (📋×11, 📚×10, 📝×8, ✕×8, 🗺×8, 📁×7, 🎯×7, 👤×6, etc.) |
| **C** (notifications) | ❌ non commencé | **281 occurrences** : ⚠×113, ✅×54, ❌×44, ✓×41, 💡×29 |
| **E** (jetons), **H** (SOLO), **G** (résiduels) | ❌ non commencés | dépendent de conceptions graphiques (E, H) ou nettoyage final (G) |

**Total emojis UI restants** : 431 (38 emojis distincts). Lot C = 65 % du restant.

### Pré-requis pour le Lot C (à faire par Grégoire AVANT prochaine session)

Télécharger 2 SVG depuis [icons8.com](https://icons8.com) avec un style cohérent avec `icons8-info.svg` et `icons8-check.svg` déjà présents dans `icons/` (probablement « Material Outlined » ou « Color »). Inscription possible directement dans le commit Lot C — pas besoin de PR séparée.

1. **`icons8-warning.svg`** — pour le nouveau type `notifications.warning(message)` qui couvrira 113 sites ⚠.
2. **`icons8-lightbulb.svg`** — pour les 29 sites 💡 (à décider : type `info` avec lightbulb optionnel, ou nouveau type `conseil`).
3. (Optionnel) `icons8-check-circle.svg` (vert) si Grégoire préfère un check-circle plein à l'`icons8-check.svg` simple actuel pour le type `succes`.

### Cycle suivant — démarrage 29 mai 2026 ou ultérieur

**Priorité 1** : **Lot C du #286** dès que les 2 SVG sont téléchargés. Décision design actée par Grégoire : **Option 1 (refactor API avec param `type`)** — l'API construit automatiquement le DOM toast avec l'icône SVG correspondante au type. Migration : retirer les emojis ⚠ ✅ ❌ ✓ 💡 des strings d'appel (l'API les ajoute désormais selon le type). Tests visuels Mac + iPad, modes sombre + clair. ~2-3h.

**Priorité 2** : Lot B (reliquats illustrations, ~140 occurrences). Majoritairement des SVG déjà présents dans icons/. Pas de pré-requis. ~1h.

**Priorité 3** : Lot G (résiduels ≤10 occurrences). Cas par cas, probablement du legacy à retirer plutôt qu'à migrer. 1-2h.

**Items #286-293 restants après Lot C complet** : selon l'ordre acté début de session :
- **#288** terminologie « élève » → « étudiant·e » résiduelle (~150 occurrences hors UI principale déjà faite), 1-2h
- **#291** vrai workflow résolution de doublons (sous-modal côte-à-côte), 4-6h
- **#287, #289, #293** items 🟢 sans urgence (picker couleur HTML, audit palettes, toggle masquer sidebar)
- **#282** migration `cours.js` legacy → V2, 5-7h (⚠️ priorité haute actée — déborde post-AQPC)

**⚠️ AVANT AQPC restant (J−6)** :
- **#294** configuration Netlify + Cloudflare pour la visite AQPC du 3 juin, 1-2h

### Notes méthodologiques pour les prochaines sessions

1. **Cache Safari sur file://** : le hard refresh ne suffit pas toujours. Si après modification CSS / JS un fix ne semble pas appliqué, faire Cmd+Opt+E (Vider les caches) puis Cmd+Shift+R. Pratique : activer Développement > Désactiver les caches pendant les sessions de dev avec Claude.
2. **Duplication CSS inline ↔ styles.css** : `index.html` contient un `<style>` inline qui duplique plusieurs règles de `styles.css`. Tout fix CSS sur `.contenu` ou autres règles dupliquées doit toucher les deux endroits, sinon la duplication inline surcharge silencieusement le fix externe. Item #297 inscrit pour audit complet post-AQPC.
3. **Protections « seeds prédéfinis »** : avant d'ajouter une protection qui refuse une opération sur un ID présent dans un seed, vérifier si l'opération porte sur le seed lui-même (interdit, le seed est dans le code source) ou sur une **copie IDB** qui partage juste l'ID (légitime, le seed se réinjecte au refresh). Distinguer les deux cas.
4. **Convention auteurs seed** (post-#290 + transition #296) :
   - `'Gabarit Labo Codex'` : gabarits dérivés de pratiques de collègues anonymisées (10 entrées dans pratiques-bibliotheque.js)
   - `'Demo Labo Codex'` : matériel démo lié au dataset démo de la checkbox d'accueil (3 entrées dans pratiques-bibliotheque.js)
   - `'Labo Codex'` (legacy) : encore présent dans 8 autres fichiers seed (echelles, gabarits-utils, etc.) — à trier post-AQPC via #296. Filtre `estItemDemo` accepte les deux chaînes pendant la transition.

---

## §0-prec1 — Récap session 28 mai 2026 matin (vérification visuelle Mac 7 zones + correctifs iPhone 5 points)

**Beta / build** : 99.71 conservée (aucun bump beta). Builds b0528-0342 → b0528-0644 (~15 bumps de build successifs au fil des fix). HEAD main au moment du relai : `a8ff194`.

**Commits cette session** (2 sur main, tous pushés) :

| # | Hash | Description | Build |
|---|------|-------------|-------|
| 1 | `ae58a8c` | feat(ux): cycle vérification visuelle 28 mai matin — correctifs UX/UI multiples (72 fichiers : 21 JS + styles.css + index.html + BACKLOG.md + 1 script + 51 SVG icons8 untracked) | 0528-0554 |
| 2 | `a8ff194` | fix(iphone): 5 correctifs visuels iPhone 28 mai matin (6 fichiers : 2 JS + styles.css + version.json + init-inline.js + main.js) | 0528-0644 |

### Méthode

Le tour de vérification visuelle a été cadré au démarrage en **8 zones** (TaskCreate) couvrant les ~24 commits du 27 mai (matin refonte + PM correctifs iPhone). Grégoire navigue sur Safari Mac (file://), je tiens la checklist et corrige au fil. Pour chaque zone : modes sombre + clair vérifiés.

**Zones 1-7 sur Mac** : Bandeau/En-tête · Nav principale + sous-nav · Accueil (12 raccourcis + 3 cartes) · Suivi (6 sous-onglets) · Suivi du groupe (ex-Aperçu) · Évaluations › Annoter (palette tampons) · Bibliothèques (icônes + détection doublons + action Supprimer).
**Zone 8 sur iPhone 16 Pro Max** : validation des 8 correctifs du chantier PM 27 mai → 5 points résiduels identifiés sur 5 captures déposées dans `Retours des testeurs/gregoire/iPhone 16 pro Max/28 mai 2026/`.

### Correctifs livrés (cumul ~15 fix)

**Nav & contraste** :
- Sous-nav actif plus visible : sombre rgba(255,255,255,0.18→0.28) + bordure 0.40→0.45 ; clair hover rgba(10,74,126,0.55) au lieu du #0a4a7e identique à l'actif (distinction hover/actif rétablie). Commit `ae58a8c`.

**Terminologie collégiale** :
- « Liste des élèves » → « Liste des étudiant·es » dans 4 sites visibles (config.js + 3 index.html). BACKLOG #288 inscrit pour le balayage complet (~150 occurrences résiduelles dans commentaires/labels secondaires/docs).
- « Enregistrement quotidien » → « Saisie des présences ».
- Titre + sous-titre Interventions reformulés : « Planification et documentation des interventions » + « Gardez une trace... » → « Interventions » + « Planification et documentation des interventions de niveau 2 et 3 ».
- Suivi du groupe : « Observation des apprentissages » → « Observation globale des indices d'engagement » (singulier). « Interventions pédagogiques » → « Observation globale des besoins d'intervention ».

**Émojis UI** :
- 2 émojis 💡 retirés des paragraphes « Clique sur une courbe... » (Suivi du groupe sections 3+4).
- 💡 retiré de l'encart d'aide « Pour éditer une pratique... » dans Bibliothèque de pratiques (fix iPhone #2).

**Typographie** :
- Paragraphes « Clique sur... » alignés en taille sur les interprétations dynamiques (`text-muted u-texte-petit` → `u-texte-gris u-texte-075` car `.text-muted` ligne 5119 forçait `font-size: 0.9rem` qui écrasait le `u-texte-075` ligne 617).

**Icônes** :
- icon-trash.svg → icons8-trash.svg (27 sites, 14 fichiers).
- Palette Nœuds Alignement pédagogique : icônes 100% opacité (sombre blanc, clair noir) + effet hover déplacé sur le cercle (background + bordure plus saturés). Lignes 18707-18741 de styles.css. BACKLOG #289 inscrit pour audit des autres palettes (`.prep-btn`, `.travaux-palette-eval`, etc.).

**Tampons d'annotation** :
- Libellés défauts dans `js/travaux-outils.js:215-218` : « L'id. directrice » → « Id. directrice », « L'id. principale » → « Id. principale », « L'id. secondaire » → « Id. secondaire ».

**Bibliothèques (UX + bugs)** :
- Modale Bibliothèque d'alignements (`js/planification-bibliotheque.js`) : ajout action « Supprimer » section 1 (cartes du trimestre actif) via nouvelle fonction `supprimerAlignementDuTrimestre(carteId)` avec garde-fou « dernière carte » (refuse si <= 1 carte restante). Exposée sur window.
- Modale Bibliothèque de pratiques (`js/pratiques-gestion.js`) : ajout action « Supprimer » section 2 (biblio partagée) via nouvelle fonction `supprimerPratiqueDeBibliothequePartagee(pratiqueId)` avec protection seeds prédéfinis (refuse si `MODELES_PRATIQUES_PREDEFINIS[id]`). Exposée sur window.
- Avertissement doublons (`BibliothequeUI.renderAvertissementDoublons`) enrichi : ajout consigne textuelle d'action (« ouvre le menu ⋮ → Supprimer/Retirer ») + tooltip natif sur ID court (`title="ID complet : <id>"` + soulignement pointillé) pour distinguer **vraie collision** (IDs complets identiques) vs **homonyme légitime** (IDs distincts).
- **5 fonctions `detecterDoublons*` corrigées** : `detecterDoublonsGrilles` (grilles.js:76), `detecterDoublonsEchelles` (echelles.js:168), `detecterDoublonsCartouches` (cartouches.js:88), `detecterDoublonsProductions` (productions.js:120), `detecterDoublonsPratiques` (pratiques-gestion.js:52). Pattern partagé : dédup par ID via `Map` AVANT groupement par nom/titre. Fix les **faux positifs** où la même entité (mêmes ID) dans la collection locale ET la biblio partagée était comptée 2 fois.

**5 fix iPhone (commit `a8ff194`)** :
1. Champs date coincés (Bornes du trimestre) : ajout `#calendrier-trimestre .grille-2col-gap15 { grid-template-columns: 1fr }` dans `@media (max-width: 767px)` + neutralisation du `padding-top: 15px` inline du span « au » avec `!important` en mobile.
2. Émoji 💡 résiduel dans Biblio pratiques : retiré du texte (style visuel conservé via classe).
3. Cartes superposées « Configuration incomplète » : `js/saisie-presences.js` avait un **double wrap d'alerte** — l'élément hôte `<div id="alerteFormatHoraire" class="alerte alerte-attention">` + une SECONDE div imbriquée `<div class="alerte alerte-avertissement">` (cette dernière classe n'existait même pas dans le CSS). Double padding/border + comportement de marge cassé. Fix : suppression du wrap interne, injection directe du contenu.
4. « Sélectionne une date... » tronqué : la classe `.empty-state-center-30` était référencée dans `index.html:8185` mais **n'existait pas dans le CSS**. Ajout avec `text-align: center; padding: 30px; white-space: normal; color: --texte-secondaire; font-style: italic`.
5. Boutons « Guide » peu visibles en mode clair : `.option-accompagnement-guide-btn` héritait de `--texte-principal` (sombre en mode clair) sur un fond `.accordeon-header` dégradé bleu marine (resté sombre même en mode clair). Override mode clair : `color: white` forcé + background `rgba(255,255,255,0.15)` + bordure `rgba(255,255,255,0.4)` + `filter: brightness(0) invert(1)` sur l'icône.

### BACKLOG (6 items inscrits)

| # | Priorité | Titre | Effort |
|---|----------|-------|--------|
| **#288** | 🟡 | Terminologie collégiale : balayage complet (~150 occurrences résiduelles) | 1-2 h |
| **#289** | 🟢 | Audit visuel palettes de création (pattern « icônes 100% + hover cercle ») | 30 min - 1 h |
| **#290** | ⚠️🟡 | **AVANT AQPC** : intégrer 4 pratiques personnelles anonymisées au seed `MODELES_PRATIQUES_PREDEFINIS` (auteur « Gabarit Labo Codex », strip initiales, renommer IDs prénomés `STD-Bruno-Chimie` → `STD-chimie-organique` etc.) | 1-2 h |
| **#291** | 🟡 | Vrai workflow de résolution doublons (détection par similarité + sous-modal de comparaison + actions batch) | 4-6 h |
| **#292** | 🟡 | Déduplication défensive au chargement de codex (filet de sécurité contre propagation de doublons d'ID via codex) | 1-2 h |
| **#293** | 🟢 | Toggle « Masquer items déjà dans la sidebar » section 2 des 5 modales biblio | 1-2 h |

**Dernier ID utilisé** : **#293**. Mettre à jour la ligne dans `BACKLOG.md` à chaque nouveau item.

### Outillage

- `scripts/dedoublonner-biblios.js` : utilitaire console pour dédoublonner le stockage local de Grégoire (5 biblios : `grillesTemplates`, `echellesTemplates`, `cartouches_*` via scan localStorage, `bibliothequeProductions`, `bibliothequePratiques`). Garde le premier item rencontré par ID. Exécution one-shot via copier-coller dans la console Safari. Compatible Safari Mac (pas d'arrow function ni `const` pour robustesse).
- **Limites du script** : ne traite que les vrais doublons d'ID. Les homonymes avec IDs distincts (variantes accumulées par renommages successifs) doivent être gérés manuellement via le menu ⋮ Supprimer des modales. Cas observé sur les grilles de Grégoire : 5 entrées biblio pour 3 grilles sidebar = anciennes variantes (« Global-5 FR-HOLIS » sans parenthèses vs « Global-5 (FR-HOLIS) H26 ») à nettoyer manuellement.

### Décisions actées en cours de session

- **Auteur dans les pratiques** : c'est une feature légitime (CC BY, traçabilité). Pas de migration au boot ni de masquage automatique. Solution pour la démo AQPC : snippet console one-shot pour anonymiser le codex perso de Grégoire (validé option 2 « Anonyme », puis affiné en « Gabarit Labo Codex » au commit du seed via #290). Fichiers persos en stockage restent inchangés pour usage privé.
- **#290 doit être fait AVANT AQPC** (acté par Grégoire) car les premiers expérimentateurs accéderont à l'app dès le 3 juin et iront vérifier la biblio de pratiques (« existe-t-il une configuration de base pour ma discipline ? »).
- **Paramètres d'accompagnement reste dans Labo** (pas de déplacement vers Suivi). Séparation lecture/configuration claire.
- **Émoji ⚠️** dans `BibliothequeUI.renderAvertissementDoublons` (le texte « ⚠️ 3 doublons potentiels détectés ») conservé pour cette session — cohérent avec le reste du fichier. Retrait global piloté par BACKLOG #286.

### Validations Grégoire

- Zones 1-7 toutes validées au fil de la session sur Mac (sombre + clair).
- Zone 8 iPhone : 5 fix livrés au commit `a8ff194`, **iPad confirmé OK sur build 0528-0644**, iPhone capricieux (cache Safari iOS persistant malgré build à jour côté serveur). À retester après pause.
- Snippet `dedoublonner-biblios.js` exécuté avec succès : 2 cartouches dédoublonnées (`cartouches_GRILLE1767642435304607` et `cartouches_GRILLE1767642435304263`, -3 chacun). 5 grilles homonymes restantes à nettoyer manuellement (BACKLOG #291 traitera l'automatisation).

### Tests

- `node --check` vert sur tous les fichiers JS modifiés (planification-bibliotheque, pratiques-gestion, grilles, echelles, cartouches, productions, saisie-presences, travaux-outils, bibliotheque-ui).
- Pas de Vitest/Playwright lancé (modifications majoritairement CSS + libellés + handlers UI, pas de logique métier nouvelle).
- Hook pré-push : passé sans bloquer sur les 2 push.

### Infrastructure observée

- **Netlify** : config `netlify.toml` propre (HTML/JS/CSS/JSON tous en `Cache-Control: must-revalidate, max-age=0`). Aucune raison côté origin de servir une version périmée.
- **Cloudflare** devant Netlify avec challenge bot (impossible de vérifier la version via curl). Si futur problème de cache CDN agressif, voir Cloudflare dashboard → Purge cache.

### Mémoires à consulter pour la prochaine session

- `feedback-beta-build-convention.md` : respectée toute la session (beta 99.71 conservée, ~15 bumps de build).
- `project-palette-couleurs-contraintes.md` : à enrichir éventuellement avec le pattern « icônes 100% + hover cercle » établi par BACKLOG #289 si #289 est livré.
- Nouvelle mémoire candidate : pattern de fix **double wrap d'alerte** (`saisie-presences.js` #3) — quand un élément HTML hôte a déjà des classes d'alerte, ne pas re-wrapper dans le JS. Vérifier les autres `innerHTML` qui injectent une `<div class="alerte ...">` dans un conteneur déjà classé.

---

### Consignes de démarrage — 28 mai après-midi (ou 29 mai matin)

**Avant de plonger** :
- Lire ce §0 (présent) en entier. Beaucoup de petits correctifs accumulés.
- Vérifier `git status` propre, HEAD main à `a8ff194` ou plus récent, tous commits sur origin.
- AQPC est le **3 juin = J−6** au démarrage 28 mai après-midi (J−5 si reprise 29 mai matin). **Stabilité prime sur ajout de features.**
- Charger les 7 skills du projet (cf. CLAUDE.md), en particulier `SKILL_labo_codex.md` et `SKILL_Ecosysteme_classe.md`.

**Priorité 1 — ⚠️ BACKLOG #290 (AVANT AQPC)** : intégrer 4 pratiques personnelles anonymisées au seed `MODELES_PRATIQUES_PREDEFINIS` dans `js/pratiques-bibliotheque.js`.

Pratiques à porter (issues du stockage IDB personnel de Grégoire, fichiers persos restent inchangés) :
- Modèle Chimie (initiales FAH) — Chimie — Notation par contrats
- Par objectifs (Pondéré) (initiales MB) — Mathématiques — Moyenne pondérée des objectifs
- Par objectifs (Comptage) (initiales BV) — Chimie — Comptage d'objectifs essentiels et complémentaires
- STD Chimie organique (initiales BV) — Chimie — Standards avec critères par standard
- STD Interfaces et BD (initiales Xavier C.-T.) — Informatique — 6 objectifs niveau 3+, base 80% + bonus

**Méthode** :
1. Préparer un snippet console DUMP-ONLY pour que Grégoire récupère les configurations exactes de ses 4 pratiques depuis son IDB. Il colle le résultat ici.
2. Pour chaque pratique : extraire la configuration complète (typesTravaux, forfaits, parObjectifs, seuilsCritiques, échelle associée, etc.), **strip les initiales** en fin de `nom`, **anonymiser** `auteur: 'Gabarit Labo Codex'`, **nettoyer** tout `metadata_cc.auteur_original` et `metadata_cc.contributeurs`.
3. Ajouter au seed avec `estGabarit: true`, **renommer les IDs prénomés** : `STD-Bruno-Chimie` → `STD-chimie-organique`, `STD-Xavier-Info` → `STD-info-interfaces-bd`. Pour `SPE-francois` (Modèle Chimie générique existant) : décider remplacement vs ajout (recommandation : remplacer, le nom du seed actuel est générique, la config enrichie apporte plus de valeur).
4. Vérifier visuellement la modale Bibliothèque de pratiques après chargement (mode démo + nouveau Codex).

**Priorité 2 — Validation iPad** : Grégoire a confirmé que l'iPad voit bien les 5 fix iPhone sur build 0528-0644. Préparer une checklist symétrique pour qu'il valide les mêmes 8 zones (1-8) sur iPad en sombre + clair, et qu'il dépose des captures dans `Retours des testeurs/gregoire/iPad/28 mai 2026/` (créer le dossier si manque). Particulièrement vérifier les chantiers responsive (échelles min/max, matrice commentaires, archivage, Bornes du trimestre).

**Priorité 3 — Re-test iPhone après pause** : si Grégoire arrive à purger son cache Safari iOS (Réglages > Safari > Effacer historique), revalider les 5 fix iPhone.

**Priorités déférées (post-AQPC)** :
- BACKLOG #288 (terminologie complète), #289 (audit palettes), #291 (workflow doublons), #292 (déduplication chargement codex), #293 (toggle masquer items présents).

**Risques connus à l'iPad/iPhone** :
- Cache Safari iOS récalcitrant. Si après recharge le build affiché reste l'ancien : forcer la fermeture de Safari (App Switcher) ou effacer données du site dans Réglages > Safari.
- iPhone 16 Pro Max ~430px : breakpoint mobile à `< 767px` activé partout dans le code récent.

---

## §0-pm — Récap session 27 mai 2026 PM (correctifs responsive iPhone — chantiers 1+2+3)

**Beta / build** : 99.68 → **99.71** (3 bumps mineurs intentionnels, un par chantier). Builds b0527-1830 → b0527-1850. HEAD main au moment du relai : commit du build 0527-1850.

**Contexte d'entrée** : Grégoire a livré 10 captures iPhone 16 Pro Max le 27 mai après-midi, déposées dans `Retours des testeurs/gregoire/iPhone 16 pro Max/27 mai 2026/`. Inventaire des problèmes :
- Émojis non permis (CLAUDE.md interdit) dans le wizard, le bandeau Configuration incomplète, le panneau d'aide Bilan réflexif, et de nombreux autres écrans
- #2 affichage tronqué — échelles min/max (« Inco », « en D », « Maî »)
- #3 wizard pratique notation (étape 1/5 — autres étapes potentiellement concernées par émojis)
- #4 matrice commentaires rétroaction (mots coupés type « compr é hens ion »)
- #5 padding inadéquat — onglet Annoter et évaluer (état vide avec grande zone blanche)
- #6 cartes superposées — Archivage des travaux (4 cartes serrées en 2 colonnes sur ~390px)
- #7 boutons noir sur fond foncé — saisie des présences (Précédent/Suivant illisibles)
- #8 toolbar tronquée — Paramètres d'accompagnement (boutons « Guide » coupés droite)
- #9 sidebar nécessaire — visionneuse PDF Modélisation (toolbar « Ferm[e] » coupée, référence sidebar profil étudiant)
- #10 icône manquante carte Données démo (clarifié : `icons8-binary-code.svg` non trackée dans le repo)

**Commits cette session** (5 sur main, tous pushés) :

| # | Hash | Description | Build | Beta |
|---|------|-------------|-------|------|
| 1 | `11f87a1` | feat(ui): retrait des émojis dans l'interface visible utilisateur — chantier 1 (Phases A+B+C, 21 fichiers JS + styles.css + 3 nouveaux SVG) | 0527-1830 | 99.69 |
| 2 | `ffac9ac` | fix(icons): ajouter icons8-high-priority et icons8-library-2 référencés par le chantier 1 (étaient untracked) | 0527-1830 | 99.69 |
| 3 | `cdef9f4` | fix(iphone): correctifs visuels chantier 2 (#5 padding, #7 contraste, #8 toolbar wrap, #10 SVG démo) | 0527-1838 | 99.70 |
| 4 | `4bb8969` | fix(iphone): chantier 3 — tableaux qui débordent (#2 échelles 2-col mobile, #4 matrice scroll + sticky, #6 archivage 1-col) | 0527-1848 | 99.71 |
| 5 | (ce commit) | docs(session): relai 27 mai PM (chantiers 1+2+3 livrés) + build 0527-1850 | 0527-1850 | 99.71 |

**Chantier 1 — Retrait des émojis UI** (commit `11f87a1` + `ffac9ac`)

Trois phases successives, validation visuelle entre Phase A et Phase B :

**Phase A — 3 cibles explicitement signalées + cascade** :
- `js/wizard-pratique-v2.js:1606` : `<span class="wizard-v2-info-icon">ℹ️</span>` → `<img src="icons/icons8-info.svg" alt="" class="wizard-v2-info-icon">`. CSS `.wizard-v2-info-icon` adapté (font-size:1.1rem → width/height:18px).
- `js/saisie-presences.js:712` : `<strong>⚠️ Configuration incomplète</strong>` → `<strong><img src="icons/icons8-high-priority.svg" alt="" class="alerte-icone"> Configuration incomplète</strong>`. Nouvelle classe `.alerte-icone` (18px, vertical-align:-3px).
- `js/bilan-reflexif-core.js:372` : `'<span class="bilan-aide-titre">❓ ' + titre + '</span>'` → titre nu (le « ? » du titre suffit).
- `js/travaux-outils.js:1664-1666` (palette flottante) : `🚦 🫥 ⏱️` → 3 nouveaux SVG icons8-style créés (`icons/icons8-traffic-light.svg`, `icons/icons8-rubber-stamp.svg`, `icons/icons8-stopwatch.svg`).
- `js/evaluation-chargement.js:311` : `'⚠️ Aucune échelle configurée'` → texte nu (option `<select>` ne supporte pas SVG).
- `js/travaux-ui.js` : 4 sites (alerte sans-production, astuce doublon, feedback renommage).
- `js/travaux-doublons-ui.js` : 7 émojis retirés de `_libellePattern`, `_libelleTagInformatif`, badges (classes CSS conservent code couleur).

**Phase B — Pastilles RaI + profil étudiant** :
- `js/profil-etudiant-diagnostics.js` : 16 émojis décoratifs retirés (`🎯 ⚠️ ⭐ ✓ 💡 📉 📊 📈 📝`) + variable `iconeTendance` retirée.
- `js/profil-etudiant-calculs.js` : 22 propriétés `emoji:` retirées des retours de cibles RaI (couleur conservée).
- `js/profil-etudiant-helpers.js` : 24 propriétés `emoji:` retirées via perl in-place (`interpreterMobilisation`, `interpreterPerformance`, `interpreterCompletion`, `interpreterAssiduite`).
- `js/profil-etudiant-sections-affichage.js` : 4 sites consommateurs `${X.emoji}` adaptés en `<span class="pastille-rai" style="background:${X.couleur}"></span>`. Nouvelle classe CSS `.pastille-rai` (cercle 14px, box-shadow 1px noir 8%).
- `js/pratiques/pratique-sommative.js` : 5 `cible.emoji = ...` retirés + valeur initiale.
- `js/pratiques/pratique-pan-standards.js` : 4 `cible.emoji = ...` retirés + valeur initiale.

**Phase C — Reste du codebase** :
- `js/profil-etudiant-sections-affichage.js` : ~25 émojis supplémentaires retirés (interventions `👤 ✉️ 👥` → libellés texte, recommandations RaI `⚫ 💡`, statuts artefacts `⏸️ ✅ ⚠️` → pastille CSS + label, services CAF/SA `✓` → texte, titres sections `📝 ✅ 🎯 📊 📈 📂 ⚙️`, fonction morte `obtenirEmojiIndice` supprimée — zéro-dette).
- `js/evaluation.js:1631,1638` : boutons `👤` `📄 Travail` → SVG `icon-profile.svg`, `icon-pdf.svg`.
- `js/echelles.js` : 6 émojis retirés (option `<select>`, alerts import/export, header échelle template).
- `js/modes.js:67` : `btnTheme.textContent = '🌑'` → `'Mode sombre'` (code mort `btn-toggle-theme` sans nav).
- `js/import-export.js` : `📚` → SVG library-2, `📄` retiré (licence CC).
- `js/objectifs.js:818-820` : 3 émojis retirés (alert metadata CC).
- `js/trimestre-v2-groupes-cools.js:814` : `📚` retiré (titre modale biblio).
- `js/productions-import-export.js` : 6 émojis retirés (alert, confirm).

**Restes non touchés** (volontaire) : commentaires `//`, JSDoc `/* */`, bannières `// === 🎨 ===`, `console.warn/error/group/log`, caractères typographiques unicode noir (`★ ✕ ✓ → ▼ ●`) qui ne sont pas des émojis colorés.

**Bilan Chantier 1** : −201 / +168 lignes nettes (zéro-dette : retrait propre, pas d'alias rétro-compatibilité). 21 fichiers JS + styles.css + 5 SVG. 2 commits : le premier avec les modifications principales, le second pour ajouter les 2 SVG (`icons8-high-priority`, `icons8-library-2`) qui étaient untracked dans le repo mais déjà utilisés par le code (sinon 404).

**Chantier 2 — 4 fix visuels iPhone ciblés** (commit `cdef9f4`)

- **#10 carte Données démo** : ajout du SVG `icons8-binary-code.svg` référencé par `js/accueil.js:201` mais absent du repo (image ne chargeait pas → zone vide à droite du titre). Grégoire a clarifié : les « carrés noirs » dans les cartes Assistance + Données démo sont en fait des checkboxes non cochées (comportement normal), seule l'icône SVG manquait.
- **#7 saisie présences boutons Précédent/Suivant** : règle CSS ciblée `#btn-cours-precedent, #btn-cours-suivant` avec `background: var(--accent-primaire)` (sarcelle clair `#6aacb8`) + `color: var(--surface-carte)`. Avant : classe `btn-principal` (`#1a4a5e`) quasi indistinguable du fond `--surface-carte #1a3040` de la carte Enregistrement.
- **#8 Paramètres d'accompagnement, boutons Guide tronqués** : sur `.carte.accordeon .accordeon-header` ajout de `flex-wrap: wrap` + `gap: 8px`. Sur le `h3` interne : `min-width: 0` + `flex: 1 1 auto`. Conséquence : sous largeur insuffisante, le bouton Guide passe sous le titre au lieu de déborder.
- **#5 onglet Annoter et évaluer (état vide)** : `js/travaux-ui.js:983-987`, ajout `style="padding: 24px"` sur la div conteneur + marges réduites sur h2/p. Avant : texte se collait aux bords gauche/droite, grande zone blanche sans aération.

**Chantier 3 — Tableaux qui débordent en largeur** (commit `4bb8969`)

Stratégie unifiée : breakpoints CSS additionnels (sans toucher au layout desktop), passage en grille 1-2 colonnes sur mobile pour les grilles, scroll horizontal contrôlé pour les tableaux complexes.

- **#6 Archivage des travaux** (`styles.css:17655+`) : sous 480px, `.travaux-archivage-options` passe de 2 colonnes (768px) à 1 colonne. `.travaux-archivage-filtres` (Production / Étudiant·e) aussi en 1 colonne sous 480px.
- **#2 Échelles min/max** (`js/echelles.js:3061` + 2 sites + nouvelle classe CSS) : la grille inline 7 colonnes `60px 60px 2fr 80px 80px 100px 80px` extraite vers une classe `.echelle-niveau-grille`. Sous 640px : passage à 2 colonnes avec « Ordre » (col 1) et « Nom du niveau » (col 3) en pleine largeur. Fini la troncation « Inco », « en D », « Maî », « Éter ».
- **#4 Matrice des commentaires de rétroaction** (`js/cartouches.js:583+642` + nouvelle classe CSS) : table enrobée dans `<div class="matrice-tableau-wrap">` avec `overflow-x: auto` + `-webkit-overflow-scrolling: touch`. Sous 768px : `min-width: 640px` sur le `<table>` pour empêcher la troncation des cellules + `position: sticky; left: 0` sur la colonne Critère (première colonne) pour garder le contexte pendant le scroll latéral. Fini les mots coupés type « compr é hens ion ».

**Chantier 4 — Sidebar Modélisation PDF — REPORTÉ**

Grégoire a explicitement décidé de ne pas faire ce chantier dans cette session. Référence corrigée en cours de session : la sidebar inspirante est celle du **profil étudiant** (pas celle de Conception comme initialement mentionné). Sera cadré séparément dans une session ultérieure (structurant : refonte UI, pas simple correctif).

**Tâches du suivi (TaskCreate)** : 4 chantiers créés en début de session, 3 marqués `completed`, chantier 4 reste `pending` pour mémoire (à reprendre en session dédiée).

**Mémoires à consulter pour la prochaine session** :
- `feedback_beta_build_convention.md` : convention beta+build respectée (bumps mineurs concertés à chaque chantier livré).
- `project_palette_couleurs_contraintes.md` : `--accent-primaire` (sarcelle clair `#6aacb8`) utilisé comme couleur de contraste pour les boutons Précédent/Suivant dans la carte Enregistrement (validé).

**Tests** : `node --check` non lancé explicitement (modifications principalement CSS + retraits décoratifs), pas de Vitest/Playwright lancé. La validation a été visuelle via les captures iPhone (Grégoire) entre les phases du chantier 1.

**Validation Grégoire** : « validé » entre Phase A et Phase B+C du chantier 1. Validation finale des chantiers 2 et 3 reportée à la prochaine session (chargement sur iPhone réel).

---

---

## §0 — Récap session 27 mai 2026 matin (refonte design système + iconographie + nav + tampons + accueil)

**Beta / build** : 99.68 conservée toute la journée. 18 bumps de build successifs (b0527-0533 → b0527-1245). HEAD main au moment du relai : `2466a6c` (déplacement beta/phrase).

**Commits cette journée** (19 sur main, tous pushés) :

| # | Hash | Description | Build |
|---|------|-------------|-------|
| 1 | `040bf09` | chore(version): rectifier renumérotation accidentelle 99.73 → 99.67 (mémoire `feedback_beta_build_convention` durcie : ne JAMAIS bumper beta sans demander) | 0527-0533 |
| 2 | `25339a7` | feat(apercu+grilles): boutons accès SOLO + badge Dépistage jaune doré | 0527-0535 |
| 3 | `d310e54` | feat(badges): style uniforme fond blanc + bordure et texte noirs sur SOM/STD/SPE/DEN/MULTI | 0527-0550 |
| 4 | `6c6a6db` | feat(apercu): rename « Préférences » → « Paramètres d'accompagnement » + retrait icônes | 0527-0605 |
| 5 | `efd7a70` | feat(nav): déplacer « Tirage au sort » de Labo vers Suivi › Animation | 0527-0620 |
| 6 | `e1d8553` | feat(entete): retrait trait pleine largeur ligne 1 + ajout séparateur vertical nav | 0527-0630 |
| 7 | `70d0017` | feat(nav): inverser états normal/actif + aligner border/glow modes sombre/clair | 0527-0645 |
| 8 | `558f88c` | feat(nav): renommer « Calendrier » → « Cadre » + réordonner Cadre/Conception/Évaluation/Suivi | 0527-0650 |
| 9 | `e0be66d` | feat(theme): palette acc-* jaune doré → orange + icône anonymisation icons8-anonymous | 0527-0705 |
| 10 | `3e96d4b` | feat(sous-nav): retrait multiply assombrissant + actif blanc pâle (symétrie nav principale) | 0527-0715 |
| 11 | `a6002a8` | feat(accueil): renommer carte « Accompagnement » → « Assistance » | 0527-0720 |
| 12 | `c116e2b` | feat(accueil): refonte raccourcis page d'accueil — émojis → SVG icons8 + libellés axés novices + thématisation par section | 0527-0840 |
| 13 | `d7ff3f4` | feat(accueil): icônes utilitaires Sauvegarder + Nouveautés en orange palette assistance | 0527-0850 |
| 14 | `7743b91` | feat(nav): migration Aperçu → Suivi › Suivi du groupe + icône Évaluation nav (icons8-pulse) | 0527-0915 |
| 15 | `c071a35` | feat(nav): icône Accueil maison → boussole (icons8-guide-2) | 0527-0920 |
| 16 | `7f059db` | feat(theme): icône Bibliothèque (icons8-library-2) + icône Aide entête (icons8-guide) | 0527-0930 |
| 17 | `2a36a25` | feat(tampons): refonte palette annotation — 19 SVG icons8 + 4 pictogrammes SOLO + descriptions par défaut généralisées | 0527-1225 |
| 18 | `9facb3c` | feat(accueil): logo Codex Numeris 100% opaque (retrait opacity 0.7) | 0527-1230 |
| 19 | `2466a6c` | feat(accueil+entete): déplacer phrase hero dans bandeau global + beta/build dans carte Nouveautés | 0527-1245 |

**Bilan thématique** :

**1. Convention beta restaurée + mémoire durcie** : la veille (26 mai), 7 bumps de beta non concertés (99.66 → 99.73 dans la même journée). Rectification 99.73 → 99.67 au commit 1, puis bump 99.68 (commit 2) qui a tenu TOUTE la journée du 27 mai (18 bumps de build seulement). Mémoire `feedback_beta_build_convention.md` réécrite : règle « jamais bumper la beta sans demander » durcie + ajout `js/main.js` comme 3ᵉ fichier à synchroniser (BACKLOG #285).

**2. Design système chromatique** (commits 3, 7, 9, 10) :
- Badges de pratique SOM/STD/SPE/DEN/MULTI : style fond plein coloré → fond blanc + bordure + texte noirs uniformes (3 classes, .badge-type-pratique + .badge-pratique + .badge-pratique-compact).
- Palette assistance `--acc-*` : jaune doré `#e8c43a` → orange `#e8923a` (restauration historique). Résout collision visuelle avec `--section-conception #dac16c` (boutons d'aide et bouton Conception devenus indistinguables).
- Mémoire `project_palette_couleurs_contraintes` mise à jour.
- Inversion états nav principale + sous-nav : couleurs section visibles EN PERMANENCE en état normal, état actif neutre blanc translucide (parité visuelle complète sombre/clair, border 1px + glow 4px alignés entre modes).

**3. Refonte iconographie** (commits 12, 13, 14, 15, 16, 17) — 30+ icônes :
- Page d'accueil 12 raccourcis : 12 émojis natifs → SVG icons8 colorisés par section parente (data-section) via pattern `<span class="accueil-icone-mask">` + mask-image base64. Compensation viewBox pour puzzle (128×128) et downloading (50×50).
- Nav principale : Accueil maison → boussole `icons8-guide-2`, Évaluation `icon-pulse` → `icons8-pulse` (viewBox 30×30 simplifié).
- En-tête : Aide `icon-wordbook` → `icons8-guide`.
- Bibliothèques : `icon-book-shelf.svg` → `icons8-library-2.svg` partout (5 sites HTML + 1 JS).
- Tampons annotation : 19 SVG icons8 + nouveau tampon « Détour » (icons8-squiggly-arrow.svg) + 4 pictogrammes SOLO migrés dans sous-dossier `autocollants/solo/` + variant icons8-confusion-avec-pointe.svg (édité par Cowork).

**4. Réorganisation navigation** (commits 5, 8, 14) :
- Nav principale finale : Accueil · ‖ · Cadre · Conception · Évaluation · Suivi · Labo. Aperçu retiré, Calendrier renommé Cadre, réordonnance Cadre/Conception/Évaluation/Suivi.
- Suivi a maintenant 6 sous-onglets : **Suivi du groupe** (anciennement section plate Aperçu, migrée comme 1ᵉʳ sous-onglet) · Liste des élèves · Saisie des présences · Profils individuels · Interventions · **Animation** (anciennement Labo › Tirage au sort, contient Questions Flash + Tirage).
- Labo passe de 6 à 5 sous-onglets (perte de Tirage). Note technique : la sous-section `#suivi-groupe` est physiquement orpheline dans le DOM (en-dehors de `#section-suivi`) — `afficherSousSection` trouve par getElementById donc fonctionnel. Cleanup propre (déplacement physique HTML) inscrit en commentaire pour un futur passage post-AQPC.

**5. Refonte page d'accueil** (commits 11, 12, 13, 18, 19) :
- Carte AIDE « Accompagnement » → « Assistance » (éviter confusion avec accompagnement de l'élève).
- 12 raccourcis : icônes thématisées + libellés axés novices (« Adopter ta pratique », « Avoir un aperçu du groupe », « Planifier ton cours », « Modèle Réponse à l'intervention (RàI) », etc.). Descriptions revues à partir du document de présentation fourni par Grégoire (carte mentale, stylet, structure des résultats d'apprentissage, etc.).
- Hero « Un espace de travail pour la pratique enseignante. » retiré de la page d'accueil et déplacé dans le bandeau global (à côté de la date).
- Beta + Build sortent du bandeau global et migrent dans la description de la carte Nouveautés (lus dynamiquement via `window.VERSION_MAJEURE` + `window.BUILD_ID`).
- Logo Codex Numeris : opacity 0.7 → 1 (100% opaque).

**6. Refonte tampons d'annotation** (commit 17, gros chantier) :
- Tableau `AUTOCOLLANTS` : 23 entrées principales (6 actions + 13 observations + 4 compréhension) avec nouvelles icônes SVG icons8. PNG du dossier `autocollants/` remplacés (les 4 PNG `comprehension-*.png` supprimés).
- Renommages pour généralisation (Grégoire ne veut plus de termes propres à sa discipline français/littérature dans les défauts de l'app) : HOC → « L'id. directrice », Mécanisme → « L'id. principale », Procédé → « L'id. secondaire », Soupçon → « Soupçon IA », Uni → Unistructurel, Multi → Multistructurel.
- Nouveau tampon « Détour » (`obs-longueur`) pour signaler manque de synthèse/concision.
- `RETROACTIONS_OBSERVATIONS_DEFAUT` (l. 451) entièrement réécrit avec les 23 nouveaux ids et descriptions généralisées (les 9 anciennes clés legacy `bon-lien`/`manque-lien`/`confusion`/`repetitif`/`preuve-absente`/`citation`/`approfondir`/`procedes`/`attention` supprimées).
- Défaut couleur catégorie : `#888888` (gris) → `#000000` (noir).
- Ordre du tableau reste alphabétique (Grégoire réordonnera via la modale Personnaliser, mécanisme `ordreAutocollants_observations` indépendant des défauts).

**Items en suspens (non BACKLOG)** :
- Taille pictogramme « Étendu » non résolue (viewBox 126×70 = ratio 1.8 vs autres SOLO 0.94 ; modifications viewBox + CSS box ciblée n'ont pas pris effet visuellement ; sans investigation plus poussée de la chaîne de rendu canvas + img, abandonné pour cette session, laissé tel quel).
- Réordonnement logique des tampons (Grégoire le fera manuellement via la modale Personnaliser, sa configuration utilisateur est sauvegardée dans IDB sous `ordreAutocollants_observations`, indépendante des défauts du code).

**Items reportés BACKLOG** :
- `#287` 🟢 — Remplacer le picker de couleur natif macOS par une palette HTML custom (modale Personnaliser tampons). Pattern `<details>` + popover + grille `COULEURS` + bouton `.actif`. Effort estimé 1-2 h. 5 sites concernés (catégories + items tampon + outil dessin).

**Mémoires durcies** :
- `feedback_beta_build_convention.md` : règle « JAMAIS bumper la beta sans demander » + ajout `js/main.js` comme 3ᵉ source à synchroniser.
- `project_palette_couleurs_contraintes.md` : palette assistance documentée comme orange `#e8923a` (au lieu de jaune `#e8c43a`), conflit hex résolu avec `--section-conception`.

**Tests** : `node --check` vert sur chaque module modifié. Pas de Vitest/Playwright lancé sur cette session (refonte chromatique + iconographique, pas de modification logique métier).

**Validation visuelle Grégoire** : OK à chaque commit (cycle de validation rapide tout au long de la journée).

---

### Consignes de démarrage — 28 mai matin

**Avant de plonger** : 
- Lire ce §0 (présent) en entier. Beaucoup de petits choix design accumulés sur la journée.
- Vérifier `git status` propre, HEAD main à `2466a6c` ou plus récent, tous commits sur origin.
- AQPC est le 3 juin = **J−6** au moment du démarrage 28 mai. Stabilité prime sur ajout de features.

**3 voies possibles**, par ordre de priorité décroissante :

**A. Vérification visuelle complète post-refonte (Recommandé)** ~1-2 h
- Vu le volume de modifs cosmétiques accumulées (19 commits, 30+ icônes, palette acc-* basculée, nav restructurée, accueil refondu, tampons refondus), faire un tour complet de l'app pour détecter d'éventuelles régressions visuelles.
- Sites prioritaires à parcourir :
  - **Page d'accueil** : 12 raccourcis (icônes + couleurs section), carte Assistance/Données démo (orange), carte Nouveautés (beta+build dynamiques), absence du hero h1, logo Codex 100% opaque.
  - **Bandeau global** : « Un espace de travail pour la pratique enseignante. · 28 mai 2026 », absence beta+build.
  - **Nav principale** : Accueil(boussole)·‖·Cadre·Conception·Évaluation·Suivi·Labo, couleurs section en permanence, actif blanc pâle, séparateur vertical après Aperçu.
  - **Suivi** : 6 sous-onglets dont Suivi du groupe (1ᵉʳ) et Animation (dernier).
  - **Évaluations › Annoter** : palette tampons (devrait afficher les nouveaux noms et icônes SVG si Grégoire a fait Reset dans la modale Personnaliser ; sinon ses customs anciens persistent).
  - **Modes sombre + clair** sur chacun de ces sites.

**B. BACKLOG #287 — Picker couleur custom HTML** ~1-2 h
- Modale Personnaliser les tampons : remplacer `<input type="color">` natif par popover HTML avec grille `COULEURS` + bouton `.actif`.
- 5 sites concernés (cf. BACKLOG #287 pour détails techniques).

**C. Audit visuel Lot B (emojis UI résiduels)** au gré
- Grégoire navigue dans l'app et identifie les emojis résiduels visibles dans les rendus UI active (pas templates JS de conteneurs cachés). Document : `plans de travail/LOT-B-EMOJIS-ILLUSTRATIONS.html`.

**Présentation AQPC** : 3 juin 2026, J−6. Filet captures d'écran si l'app plante (Keynote pilote). Enjeu réel de stabilité = expérimentateurs post-AQPC, pas la démo. À garder en tête pour les choix de cette semaine : stabilité + clarté visuelle > nouveautés.

**Note pour Claude — comportements à éviter** :
- ❌ **Ne JAMAIS bumper la beta sans demander à Grégoire** (cf. mémoire `feedback_beta_build_convention` durcie). Convention : 1 beta par journée, bumps de build uniquement entre les commits du même jour.
- ❌ **Ne pas toucher à l'ID interne `apercu` dans le code historique non-migré** : la migration vers `suivi-groupe` est faite côté nav (config.js, navigation.js, accueil.js, etc.). Reste un commentaire `<div id="suivi-groupe">` orphelin dans le DOM hors de `#section-suivi` — fonctionnel mais à cleanup propre post-AQPC.
- ❌ **Ne pas re-renommer les tampons « L'id. directrice/principale/secondaire »** sauf demande explicite. Grégoire a viré HOC/Mécanisme/Procédé pour généraliser hors discipline.
- ❌ **Ne pas réordonner le tableau AUTOCOLLANTS dans le code** : Grégoire réordonne via UI utilisateur (mécanisme `ordreAutocollants_observations`).
- ✅ **Si Grégoire signale un bug** : priorité absolue, on interrompt le plan en cours (cf. CLAUDE.md).
- ✅ **Suivre le flux carte-par-carte** qui a bien marché aujourd'hui pour les icônes (« X = icons8-Y.svg » + je vérifie existence + je modifie + il valide visuellement → commit groupé à la fin).

---

## §0bis — Récap session 26 mai 2026 PM2 + PM3 (Lot A + refonte chromatique nav + refonte panneau accompagnement + renommages + démarrage chantier dépistage)

**Beta / build** : 99.71 b0526-1758 (PM2) → 99.72 b0526-2203 (refonte panneau) → 99.73 b0526-2236 (renommages + RàI droite, PM3 final).

**Commits cette journée** (8 sur main) :
- Pushés sur origin/main : `377a1af` `b6e52a2` `d2579be` `614e0ac` (Lot A 4 sous-lots), `01fde5b` (interversion+V4), `4d17227` (relai PM2).
- **Locaux non pushés (à pousser)** : `d73abf1` (refonte panneau accompagnement, PM3), `719407f` (renommages Aperçu + RàI droite, PM3), + le commit SESSION qui suit ce relai.
- Tags poussés : `lot-A-icones-aide-2026-05-26`, `lot-A-jaune-aide-2026-05-26`.

**1. Lot A icônes info ✴ → SVG** (4 sous-lots, ~104 sites migrés au total) :
- Sous-lot 1 (`377a1af`) : index.html 67 sites + nouvelle classe `.btn-aide-icon`
- Sous-lot 2 (`b6e52a2`) : 13 modules JS, 34 sites + sentinelle Vitest (88 → 89 tests)
- Sous-lot 3 (`d2579be`) : finition CSS + design-system + suppression `icons/icon-info.svg` orphelin + sentinelle étendue (89 → 90 tests)
- Extension jaune (`614e0ac`) : migration `<img>` → `<span class="icone-info-aide">` mask-image base64 + couleur palette aide jaune (1 exception conservée : menu Codex). Pattern Lot I/J pour cohérence.

**2. Refonte chromatique nav + header** (`01fde5b`, local) :
- **Interversion jaune/orange** : `--section-conception #ff6f00` → `#dac16c` (jaune désaturé). `--icone-aide-config #e8c43a` → `#e8923a` (orange chaud doré tempéré). Le système d'aide passe en orange, Conception passe en jaune.
- **Désaturation systémique** : shift HSL uniforme -20 sat / +7 lum sur les 5 couleurs sections. Conception `#dac16c`, Calendrier `#30b85d`, Suivi `#56cadc`, Évaluations `#6ec1e7`, Labo `#d1aff4`.
- **Pattern V4 unique** appliqué aux 20 blocs nav active (5 sections × 4 zones : sombre nav, sombre sous-nav, clair nav, clair sous-nav) + 1 bloc header aide/réglages : multiply alpha 1.0 → 0.5 ; `border-color: var(--section-X)` → `border: 1.5px solid rgba(255, 255, 255, 0.2)` ; ajout `box-shadow: 0 2px 8px rgba(couleur, 0.15)`.
- **Sous-nav** : texte des sous-boutons actifs reste blanc (retrait `color: var(--section-X)`).
- **Boutons d'action préservés** : audit grep préalable, aucun bouton sauvegarder/annuler/etc. n'utilise les variables modifiées.

**3. Refonte référentiel `REFERENTIEL-COULEURS-SECTIONS.html`** :
- Décisions design itératives validées (interversion, désaturation, V4 unique, bordure blanche discrète, glow alpha 0.15, sarcelle original `#1a4a5e → #0c1a22` retenu).
- Ménage final : retrait sections 0/3/3bis de comparaison, variantes V2/V3 abandonnées, classes `.sat-actuel/leger/modere/marque` supprimées, en-tête de l'app reproduite fidèlement dans les deux thèmes (sombre + clair empilés).

**4. Lot B icônes décoratives (début)** :
- Document checklist créé : `plans de travail/LOT-B-EMOJIS-ILLUSTRATIONS.html`.
- Constat important : l'audit grep initial a confondu templates JS avec UI rendue. Beaucoup de sites pointent vers des conteneurs `u-hide` legacy (ex. `echelles.js:276` rend dans `<div id="vueEchellesNiveaux">` qui est dans `<div class="u-hide">`).
- Décision Grégoire : audit visuel manuel (lui navigue, identifie les sites encore visibles), migration ciblée ensuite. Le nettoyage du code legacy (fonctions actives mais conteneurs cachés) sera un lot dédié post-AQPC.

**Tests** : 88 Vitest + 18 Playwright = 106/106 verts à chaque étape (Lot A ajoute 2 sentinelles : sentinelle-icones-aide.test.js). Pas de régression.

---

### Suite PM3 (soir, 22h00-22h45)

**5. Refonte panneau Paramètres d'accompagnement** (commit `d73abf1` Beta 99.72 b0526-2203) :
- `#labo-accompagnement` (`index.html:8555-8881`) restructuré en **3 cartes accordéon** au lieu des 2 cartes plates précédentes. Gabarit Trimestre réutilisé (`.carte.accordeon` + `.accordeon-header` + chevron + `.accordeon-contenu`, délégation `toggleAccordeonV2` déjà branchée dans `js/main.js`).
- **Carte 1 — Taxonomie SOLO** : checkbox activation + 4 sous-items (Développement habiletés, Observation actions, Grille de critères pour le dépistage, Paramètres avancés pliables avec découplage P/N + fenêtre patterns + seuils détection).
- **Carte 2 — Micro données ACP** : checkbox activation + Unité affichage assiduité + Seuils interprétation pliables + Graphiques d'évolution ACP.
- **Carte 3 — Intervention (RàI)** : juste la checkbox d'activation. Les sous-items historiques (grille critères, paramètres avancés) ont migré vers SOLO car ils n'étaient pas propres à RàI.
- Tous les IDs `v2-pref-*` / `v2-seuil-*` préservés : aucune migration de préférences nécessaire. Texte bouton « Sauvegarder les paramètres de dépistage » → « Sauvegarder les paramètres d'accompagnement ».
- Sémantique « toggle visibilité profil ↔ checkbox activation collecte » convenue mais pas encore implémentée : pour l'instant le pliage = effet UX accordéon seulement. Implémentation logique (lien pliage ↔ visibilité dans profil étudiant via nouvelle pref `v2-pref-section-X-visible`) à venir si besoin.

**6. Renommages page Aperçu + carte RàI à droite profil** (commit `719407f` Beta 99.73 b0526-2236) :
- Page Aperçu (`index.html`) : « Observer » → « Observation des apprentissages » (couvre SOLO+ACP), « Intervenir » → « Interventions pédagogiques » (couvre RàI).
- Page Aperçu (`js/tableau-bord-apercu.js` 2 sites + `js/accompagnement-contenu-popup.js` popup) : « Suivi de l'apprentissage des fondamentaux » → « Structure des apprentissages fondamentaux (SOLO) ». Le titre reflète le module SOLO du nouveau vocabulaire.
- Profil étudiant — sous-section Accompagnement (`js/profil-etudiant-sections-affichage.js`) : carte RàI passée de gauche à droite. Approche CSS `style="order: X"` (Contexte order 1 / SOLO order 2 / RàI order 3) au lieu de déplacer ~240 lignes. Cas « aucune donnée » : swap physique des 3 cartes. Compatible avec SOLO désactivé (grid-2col → Contexte + RàI sur 2 colonnes).

**7. Découverte importante — page Aperçu déjà branchée dynamiquement à la grille de référence** :
- Constat erroné en début de PM3 : on pensait que les critères « Structure, Rigueur » du sous-titre du graphique étaient hardcodés.
- Audit fait : `genererBarrePatterns` (`tableau-bord-apercu.js:2030+`) appelle `obtenirGrilleReferenceDepistage()` et filtre `criteres.filter(c => c.niveauSOLO === 'multistructurel')`. Les noms affichés sont les **vrais critères** de la grille de référence configurée (FR-ALGO H26 chez Grégoire = Structure + Rigueur en multistructurel).
- Idem `calculerIPB` (`profil-etudiant-calculs.js:461+`) qui filtre dynamiquement.
- **Hardcoded restant** : les helpers `_resoudreCibleX` dans `profil-etudiant-calculs.js:1243-1306+` (comparaisons `N === 'Structure'`/`'Rigueur'`/etc.) appelés par `determinerCibleIntervention()` (marquée « Conservé pour compatibilité — sera retiré plus tard »). Affecte la carte RàI du profil étudiant pour les cibles d'intervention (badge + pattern texte). **À refactorer post-AQPC** : remplacer `N === 'Structure'` par `obtenirNiveauSOLOCritere(N) === 'multistructurel'` en lisant la grille de référence.
- Helper `obtenirNiveauSOLO()` dans `js/trimestres.js:1422` existe mais est aussi hardcoded (mapping nom→niveau anglais `multistructural`). Pas réutilisable tel quel. Un nouveau helper à créer.

---

### Consignes de démarrage — 27 mai matin

**Avant de plonger** : lire ce §0 PM2+PM3 (présent), vérifier que `git status` est clean, que tous les commits PM3 sont sur main (`d73abf1`, `719407f`, + le commit SESSION qui suit). **Le push reste à faire** (Grégoire l'a différé en fin de PM3).

**Chantier prioritaire — 2 micro-connexions visuelles** (~1 h total) :

**A. Deux boutons d'accès direct sous la barre « Structure des apprentissages fondamentaux (SOLO) »** dans le tableau de bord Aperçu :
- Bouton 1 → ouvre **Conception › Grilles de critères** (où l'utilisateur édite les critères + leurs niveaux SOLO via menus select). Action JS de navigation à créer ou réutiliser.
- Bouton 2 → ouvre **Labo › Paramètres d'accompagnement** et idéalement déroule la carte SOLO (accordéon `accordeon-acc-solo`) pour exposer le select « Grille de critères pour le dépistage » (id `v2-pref-grille-reference`).
- Code à modifier : `js/tableau-bord-apercu.js` autour de `genererBarrePatterns()` ligne 2030+ (les 2 sites avec `<h4>Structure des apprentissages fondamentaux (SOLO)</h4>` à 2051 et 2245).
- Style à choisir : petits boutons icône à droite du sous-titre « Critères multistructurels surveillés : … » ou sur la même ligne que le titre. Icons disponibles : `icon-edit.svg`, `icon-tune.svg`, `icon-arrow-out.svg` à voir.

**B. Badge « Grille de dépistage »** dans :
- La **sidebar des grilles** (composant gauche de la page Conception/Grilles, où on voit déjà les badges SOM/STD/X critères).
- La **bibliothèque des grilles** (modale Bibliothèque d'échelles/grilles).
- Affiché uniquement sur la grille qui correspond à `obtenirPreference('grilleReferenceDepistage')`.
- Code à modifier : `js/grilles.js` (rendu sidebar + carte bibliothèque), plus probablement `js/bibliotheque-ui.js` (helper `renderCarte*` du Lot biblios #267).
- Style : badge violet ou orange (couleur à choisir, doit se distinguer des SOM/STD/SPE/DEN existants — voir `[[project-palette-couleurs-contraintes]]` dans memory pour les contraintes chromatiques sidebar).

**Optionnel — Chantier C post-AQPC** :
- Refactor des helpers `_resoudreCibleDifficultePersistante/Emergente/DefiSpecifique/Stable` dans `js/profil-etudiant-calculs.js:1243-1306+` pour utiliser le `niveauSOLO` du critère au lieu du nom hardcoded.
- Créer un helper `obtenirNiveauSOLOCritere(nomCritere)` qui lit la grille de référence et retourne le `niveauSOLO` français (`multistructurel`/`relationnel`/`abstrait_etendu`).
- Logique pédagogique de mapping niveau→cible (à valider avec Grégoire) : multistructurel + score bas → remédiation, relationnel → pratique guidée, abstrait étendu → exploration. Pas trivial — vraie réflexion pédagogique nécessaire.

**Audit visuel Lot B** (au gré) :
- Document : `plans de travail/LOT-B-EMOJIS-ILLUSTRATIONS.html`.
- Grégoire navigue dans l'app et identifie les emojis encore visibles dans l'UI active.
- Une fois les sites identifiés, migration ciblée (3 icônes à ajouter : clipboard, document, group/users).

**Présentation AQPC** : 3 juin 2026, J−7 au moment du relai. **Stabilité prime** sur les nouveaux chantiers à partir de fin mai.

---

## §0ter — Récap session 26 mai 2026 PM (cycle chromatique Lots F + I + J + extension)

**Beta / build** : 99.66 / 0526-1120 (5 bumps de build sur la PM : 0526-0657 Lot I, 0526-0734 Lot J phase 1 abandonnée, 0526-1037 Lot J phase 2 livrée, 0526-1045 release, 0526-1120 Lot J extension).
**Branche `main`** : 10+ commits push sur la journée PM, HEAD à acter au commit final.

**3 lots du plan migration icônes livrés** :

1. **Lot F** (commit `d41e25e`) — `chore(icons): retrait 15 PNG outils-* legacy non référencés`. 15 fichiers PNG supprimés, 0 ligne de code touchée. Audit confirmatoire pré-suppression. Pas de bump.

2. **Lot I** (commits `9d70e07` + `b4d926a` fix flex-shrink) — `feat(theme): palette accompagnement orange → jaune doré #e8c43a`. Bump 0526-0657. ~30 variables `--acc-*` redéfinies en jaune. Boutons header aide + réglages migrés de `<img>` vers `<span class="header-icon ico-X">` avec mask-image SVG inlinées en base64 (contournement CORS file:// pour WebKit Playwright). Fix critique : `flex-shrink: 0` obligatoire sur les `<span>` dans un parent flex avec content area étroit (sinon compression à 6 px au lieu de 18×18 voulus).

3. **Lot J phase 2 directe** (commit `0384361`) — `feat(theme): 5 couleurs sections par multiply + jaune aide actif`. Bump 0526-1045. **Phase 1 (couleur unique) sautée** au profit de la phase 2 (5 couleurs distinctes par grande section) à la demande de Grégoire. Convention chromatique :
   - `--section-conception: #ff6f00` (orange — chantier)
   - `--section-calendrier: #34c759` (vert succès — conflit hex avec --vert-succes documenté, lu par contexte)
   - `--section-suivi: #22d3ee` (cyan)
   - `--section-evaluations: #38bdf8` (bleu sky — attention pluriel data-onglet)
   - `--section-labo: #c084fc` (violet pastel)
   - `--bg-bandeau-mediane: #133248` sombre / `#09264b` clair (auto via `.mode-clair`)

   Technique : `background-blend-mode: multiply` sur 2 couches (couleur opaque + bandeau médiane unie). Le bandeau parent garde son vrai gradient ; le bouton actif est uniforme à l'intérieur pour éviter une cassure de gradient. Bordure + icône SVG + label texte aussi colorés (signal multi-élément). Mode clair (spécif 0,4,1) doit doubler les règles spécifiques pour battre `.mode-clair .navigation-principale button.actif` (0,3,1).

   **2 modifs autorisées dans `js/navigation.js` (protégé CLAUDE.md)** : (a) classe `section-${nomOnglet}` sur conteneur `.sous-navigation` pour permettre coloration sous-nav par section parente, (b) gestion classe `.actif` sur boutons header `[data-param="aide"|"reglages"]` pour qu'ils reçoivent le fond teinté jaune quand leur section est ouverte.

4. **Lot J extension** (commit final ~après ce relai) — boutons header **bug** et **anonymisation** colorisés en permanence :
   - bug → violet `var(--section-labo) #c084fc`
   - anonymisation → cyan `var(--section-suivi) #22d3ee`

   Refactor : retrait de `background-color: var(--icone-aide-config)` du sélecteur générique `span.header-icon`, couleur définie par classe spécifique (`.ico-wordbook`/`.ico-tune` jaune, `.ico-bug` violet, `.ico-mask-anon` cyan). Header présente désormais 4 couleurs distinctes (violet/cyan/blanc/jaune) en cohérence avec la palette nav.

**Documentation produite** :
- `plans de travail/AUDIT-COULEURS-SECTIONS.md` — audit chromatique WCAG 2.1 (contraste icône/texte sur fond teinté multiply, AA atteint partout), ΔE76 CIELAB (distances perceptives, paire Suivi/Évaluations à 22.2 = limite distinct), simulation daltonisme 3 types (Suivi/Évaluations indistinguables en protanopie ΔE 1.0 — mitigé par label texte WCAG 1.4.1), conflits hex DS documentés (Calendrier vs --vert-succes, Conception vs --som-orange).
- `plans de travail/REFERENTIEL-COULEURS-JAUNE.html` — référentiel Lot I (comparaison teintes jaunes, header + popup, mode sombre/clair).
- `plans de travail/REFERENTIEL-COULEURS-SECTIONS.html` — référentiel Lot J (vue d'ensemble palette + variantes hex par section + test cohérence multi-thèmes + comparatif blend modes).
- `design-system.html` §1 (palette : nouveau bloc 5 couleurs sections + bloc jaune assistance) + §8 (Navigation : nouveau bloc « Bouton actif par section » avec snippet CSS et renvois audit/référentiel).
- `memory/project-palette-couleurs-contraintes.md` — conventions tranchées + conflits hex acceptés + limites daltonisme + technique CSS multiply.
- `plans de travail/PLAN-MIGRATION-ICONES-SVG.md` — Lots F/I/J marqués ✅ LIVRÉ, §5 ordre restant, §6 estimation actualisée, §7 décisions tranchées, §9 nouveau historique des livraisons.

**Apprentissages techniques transférables aux lots suivants (A, B, C, D, E, H, G)** :
- Pattern `<span class>` + `mask-image` SVG inlinés base64 marche bien et contourne CORS file:// sur WebKit (essentiel pour Playwright).
- `flex-shrink: 0` obligatoire sur les span dans un parent flex avec content area étroit.
- `background-blend-mode: multiply` donne un signal visuel fort sans écraser le contenu (icône, texte) et préserve le gradient du bandeau parent (à condition que la couche bandeau dans le bouton actif soit uniforme, pas un mini-gradient désaligné).
- Spécificité CSS : `.mode-clair .navigation-principale button.actif` (0,3,1) écrase systématiquement les overrides par section sans `.mode-clair` (0,3,0). Toujours doubler les règles en mode clair pour préserver les overrides.
- `--nav-actif` (phase 1 jamais utilisée) reste défini dans styles.css : candidat à un futur cleanup zéro-dette.

**Tests** : 103/103 verts à chaque commit (85 Vitest + 18 Playwright WebKit).

**Vérifications de déploiement Grégoire à faire** après ⌥⌘E + Cmd+R Safari :
- ✅ Boutons header de droite à gauche : bug = violet, anonymisation = cyan, thème = blanc, aide = jaune, réglages = jaune.
- ✅ Clic sur Conception/Calendrier/Suivi/Évaluations/Labo : icône + bordure + label colorés selon la section. Accueil et Aperçu restent blancs/neutres.
- ✅ Sous-nav d'une section : le sous-onglet actif est colorée de la couleur de la section parente.
- ✅ Ouvrir la section Aide ou Réglages : le bouton header correspondant devient teinté jaune (fond multiply).
- ✅ Bascule thème clair/sombre : couleurs sections identiques dans les deux modes, fond bandeau s'adapte automatiquement.

---

## §0quater — Récap session 26 mai 2026 matin (6 livraisons + cartographie icônes)

**Beta / build** : 99.66 / 0526-0503 (3 bumps de build sur la matinée).
**Branche `main`** : HEAD à `4df4f21` chore(backlog) — déplacement #278/#280/#281 + 3 bugs testeurs vers archive.

**5 commits push d'amélioration de code** (du premier au dernier) :
1. `aabc0d3` **fix(migrations)** — retrait code mort modale migration legacy (zéro-dette) + bump 99.66 (build 0526-0345). −380 LOC. Résout BUG_grégoire_2026-05-25_07-19-19 (modale « Mise à jour de tes données » apparaissait sur iPad).
2. `7574c75` **fix(profil)** — filtrer les originaux remplacés dans la grille « Travaux soumis » + bump 0526-0441. Résout BUG_grégoire_2026-05-21_13-15-45 et suivants (doublons original/reprise dans Travaux soumis du profil). Bilan : audit 17 paires (DA, productionId) sur h2026 → 16 saines + 1 orpheline (Houle/Artefact 5 fichier reprise orphelin supprimé séparément côté données).
3. `71286d5` **fix(eval)** — exposer 10 fonctions manquées sur window après extraction des sous-modules + bump 0526-0455. Audit complet d'evaluation.js : 86 fonctions, 29 exportées, **10 manquantes** appelées cross-module (6 ReferenceErrors potentiels dont 1 confirmé : `verifierEtChargerEvaluationExistante` qui crashait à chaque changement d'étudiant/production). Cause directe du bug du 21 mai « rien ne s'affiche au clic ». Confirme [[feedback-fix-perdu-refactoring-extraction]] sur l'extraction des sous-modules evaluation-*.js du 18-21 mai.
4. `c1c8abd` **fix(backlog) #281 + #278 + #280** — petits items backlog groupés + bump 0526-0503. −66 LOC net.
   - #281 : 1 toast custom migré vers `notifications.succes` (saisie-presences.js)
   - #278 : scroll explicite dans `afficherVue` du bilan-reflexif (fix Safari reset)
   - #280 : retrait bouton « Capturer maintenant » + fonction + helper (`obtenirNumeroSemaineActuelle` devenue code mort). Renommages UX : « Reconstruire l'historique » → « Recalculer les captures » + « Captures hebdomadaires » → « Captures de séances ». Effet collatéral : résout les 4 facettes du bug #116.
5. `4df4f21` **chore(backlog)** — déplacement des 6 livraisons (3 bugs + 3 items) de BACKLOG.md vers BACKLOG-ARCHIVE.md. 30 → 27 items ouverts.

**1 livraison méta (organisation)** :
6. **Cartographie + plan migration icônes** (#286 nouveau item BACKLOG). Capture iPad 26 mai 05:15 montre ✴ + 📝 dans « Préparer et importer » que Grégoire ne veut pas. Inventaire : **593 occurrences emojis UI** (200 HTML + 393 JS hors `console.*`/commentaires) répartis en 56 emojis distincts. Plan en 5 lots (A bouton aide, B illustrations sections, C statuts notifications, D pastilles couleur, E résidu) — voir `plans de travail/PLAN-MIGRATION-ICONES-SVG.md`. Total estimé 5-6 h sur 3-5 sessions. **Lot A recommandé en premier** (76 sites, 1 mapping unique, gros impact visuel rapide).

**Tests** : 103/103 verts à chaque commit (85 Vitest + 18 Playwright WebKit).

**Vérifications de déploiement Grégoire à faire** après ⌥⌘E + Cmd+R sur iPad/Mac :
- ✅ La modale « Mise à jour de tes données » ne réapparaît plus au démarrage.
- ✅ Console Safari sans `ReferenceError: verifierEtChargerEvaluationExistante` au changement d'étudiant/production.
- ✅ Profil étudiant → Travaux soumis : 1 seule vignette par production reprise (la reprise active).
- ✅ Saisie présences : notification au style cohérent (vert solide DS, sans emoji custom).
- ✅ Bilan réflexif : transition Questionnaire → Importer remonte proprement au top du bloc Bilan.
- ✅ Réglages → Données → Captures : 2 boutons (le « Capturer maintenant » a disparu), bouton renommé « Recalculer les captures ».

**Warnings console résiduels observés mais non traités cette session** (à inscrire SUIVI-BUGS si besoin) :
- ⚠ `[DB] Quota localStorage dépassé pour h2026_indicesCP (29669 bytes)` × 2
- ⚠ `Format de séance non reconnu — SEANCE-2026-05-14-B` × 2 (saisie-presences.js:338)
- ⚠ `calculerTauxCompletion(DA) : indicesCP non disponible — retourne null` pour DA 9000176 et 9000040

---

# SESSION — État au 25 mai 2026 fin de journée (chantier « Corrections conséquences audit annuel » LIVRÉ)

**Beta / build** : 99.64 / 0525-0609 (multiples bumps de build sur la journée, beta conservée).
**Branche `main`** : HEAD à `c601806` fix(codeql): résoudre 5 warnings CodeQL résiduels.
  - **17 commits livrés ce jour** (14 directs + 2 squash Dependabot + 1 merge FF worktree hygiene) : `861048a` SECURITY.md → `44c3ee6` dependabot.yml → `7ab6147` workflows CI → `f588077` BRANCH-PROTECTION + build refresh → `1436803` fix reserve-ouvrir → `de0e6a7` fix import-export → `565bb43` port 12 ADRs → `2c84976` AUDIT.md racine → `44d8b9c` bloc statuts post-remédiation → `954148a` (squash PR #20 codeql-action) → `b6a5a48` (squash PR #22 playwright) → `213349d` libs/VERSIONS.md → `1ad2e46` ADR-013 SPDX → `22dcbfb` cleanup −1249 LOC → `c601806` fix 5 warnings CodeQL.
**Tests** : 85 Vitest + 18 Playwright = 103/103 verts à chaque commit. Hook pré-push vert. CodeQL CI vert post-fix critiques.
**Tag poussé** : `hygiene-github-2026-05-25`.

**Cycle suivant immédiat** : voir §3. Plusieurs options présentées (actions UI Grégoire d'abord pour finaliser la chaîne hygiène GitHub, puis choix : zéro-dette CodeQL ~80 alertes / #282 étape 5 / audit autres auto-saves / Phase D-G2b). Note cleanup post-session : 1 worktree éphémère `cleanup/hygiene-github` créé puis supprimé en début de journée, plus aucun worktree actif. Branche locale supprimée.

---

## §0 — GARDE-FOU (lire en premier)

**Ce qui est INTERDIT dans la prochaine session :**

- ❌ **Ne pas bumper la beta sans demander à Grégoire**. Le bump 99.62 (build 0522-0650) a été acté à la clôture du cycle AQPC le 22 mai matin. Toute nouvelle modification version.json/init-inline.js doit confirmer le numéro suivant avec Grégoire en début de session.
- ❌ **Ne pas re-livrer les Phase 1.4 ni 1.6 du PLAN-COURT-TERME sur ce worktree main**. Les fichiers cibles (`audit/04-sustainability/`, `audit/package.json`, `docs/adr/`) vivent uniquement sur la branche `audit/2026-mai` — c'est là que ces fixes doivent être appliqués, pas sur main.
- ❌ **Ne pas redéfinir `decouplerPR` ni `indiceR` ni `risque` comme propriété**. Le refactor R → N (Niveau d'attention) du 22 mai a éliminé ce vocabulaire. Source unique : `decouplerPN` / `indiceN` / propriété `niveauAttention` sur l'objet `indices`. Migration de données idempotente dans `main.js` (`migration_decoupler_pn_done`).
- ❌ **Ne pas remettre `MAX_RAPPORTS_ARCHIVES` à 50** dans `js/rapport-bug.js`. Seuil abaissé à 20 le 22 mai (Phase 6.2 PLAN-AQPC, audit PII). Migration de tronquage dans `main.js` (`migration_rapports_bug_20_done`).
- ❌ **Ne pas démarrer une nouvelle session Cat-B sur `audit/2026-mai`**. Cette branche a son propre cycle (audits, rapports, docs sécurité) — créer un nouveau worktree depuis `main`.
- ❌ **Ne pas réactiver `initialiserModuleEvaluation`** : le bug #107 a été corrigé par RETRAIT du code (stabilité zéro-dette CLAUDE.md), pas par activation. La fonction n'a jamais servi en prod depuis 5 mois.
- ❌ **Ne pas tenter de descendre `genererSectionMobilisationEngagement` sous cyc 30 sans nouvelle validation Grégoire**. Cyc 48 acté **héritage Cat-B sous N=50** le 21 mai PM. Le template HTML est dense en ternaires (`${nb > 1 ? 's' : ''}` × ~20) qui sont difficiles à éclater sans sur-fragmenter (cf. §6.5 gabarit METHODE). Si réouverture, valider d'abord avec Grégoire qu'il accepte la sur-fragmentation.
- ❌ **Ne pas re-fix le bug latent #110 (`portfolioActif` → `portfolioActifRapport`)** : déjà corrigé dans le commit `47651cb` (Track 3 phase 2 Performance). Inscrit Corrigés SUIVI-BUGS le 21 mai PM.
- ❌ **Ne pas écrire `window.evaluationEnCours = ...` ni `.X = ...` depuis un module hors whitelist** (config.js + evaluation*.js). Sentinelle Vitest `tests/unit/sentinelle-evaluation-en-cours.test.js` verrouille cet invariant (chantier F livré 21 mai soir). Toute amorce du pivot depuis un module externe passe par `window.demarrerEvaluationDepuisFichier(fichier, opts)` exportée par `evaluation-chargement.js`.
- ❌ **Ne pas définir une fonction `function afficherNotificationX(...)` dans `js/*.js`** (hors `_archives/`). Sentinelle Vitest `tests/unit/utils-notifications.test.js` verrouille cet invariant (chantier E livré 21 mai soir). Utiliser `window.notifications.{succes, erreur, info}` (utils-notifications.js) pour toute notification toast.
- ❌ **Ne pas réintroduire un wrapper local défensif `if (typeof window.afficherNotificationX === 'function')`**. L'API `notifications.X` est garantie chargée via `utils-notifications.js` (ligne 15969 d'index.html, après modes.js). Les 149 guards typeof orphelins ont été retirés ; tout nouveau guard est une régression Cat-B.

### Garde-fous #282 P1-P4 (livrés 23 mai PM, à préserver pendant l'étape 5 migration finale)

- ❌ **Ne pas retirer le bandeau `#v2-bandeauModeEdition`** dans `index.html` (formulaire cours) ni le badge `#v2-bandeauCodeCours`. Texte canonique : « Mode modification — Cours <code>. Pour créer un nouveau cours, clique + Nouveau cours. » (sans emoji — cf. [[feedback-zero-emoji-strict]]).
- ❌ **Ne pas retirer ou réordonner les appels à `_afficherBandeauEdition()` / `_cacherBandeauEdition()`** dans les 6 entry points de `trimestre-v2-cours.js` (nouveau, changer si !coursId/si cours, modifier, dupliquer, annuler, supprimer). Toute nouvelle voie d'ouverture du formulaire doit appeler l'un ou l'autre.
- ❌ **Ne pas remettre l'auto-activation `if (cours.actif)` dans `_persisterCoursV2`**. Seul le PREMIER cours créé s'auto-active désormais (et seulement si la liste passe de 0 à 1 entrée). Idem pour `sauvegarderGroupeCoursV2` : seul le PREMIER GC s'auto-active. Toute activation ultérieure passe par les boutons explicites `activerCoursV2` / `activerGroupeCoursV2` (ou `activerGroupeCoursDepuisBibliotheque`).
- ❌ **Ne pas retirer le flag `actif: true` lors de la création du premier cours / GC** : il est posé conditionnellement dans `_persisterCoursV2` / `sauvegarderGroupeCoursV2` pour maintenir l'invariant single-active (`cours.find(c => c.actif)` reste un reader valide).
- ❌ **Ne pas retirer les boutons `#v2-btnActiverCours` et `#v2-btnActiverGroupeCours`** d'index.html ni leurs helpers `_mettreAJourBoutonActiverCours(coursId)` / `_mettreAJourBoutonActiverGroupeCours(gcId)`. La visibilité est dynamique : caché si déjà actif, visible sinon.
- ❌ **Ne pas modifier `_tupleCoursNaturel(c)` ni `_migrerListeCoursVersCoursV2()`** dans `trimestre-v2-cours.js` (P3) sans bien comprendre l'invariant V2-wins-sur-tuple-naturel. La migration s'exécute au chargement de `chargerDropdownCoursV2` (idempotent : la clé `listeCours` est vidée après).
- ⚠️ **La migration finale étape 5 (#282) reste à faire** : ~93 sites lisant `db.getSync('listeCours', ...)` dans `js/cours.js` + `contexte.js` + `cc-license.js` + `pratiques.js` + `travaux-ui.js` + `demo-activation.js` + `migrations.js` + `statistiques.js` + `rapport-bug.js` + `organisateur.js` + `export-pdf.js` + `reserve.js`. Cf. consigne §3.

### Garde-fous résiduels post-Phase 2

- ❌ **`navigation.js:250-251`** appelle encore `initialiserModuleTrimestre` via `if (typeof X === 'function')` — Zone protégée CLAUDE.md, guard intact (devient simplement faux, pas de régression boot). Ne pas toucher sans validation Grégoire.
- ❌ **`coursEnEdition` (config.js L199)** est désormais orphelin (plus aucun caller après chantier 2.1). Zone protégée → laissé en place. À retirer dans un chantier dédié config.js si Grégoire autorise.
- ⚠️ **Tests manuels UI obligatoires** côté zone Réglages (Cours / Groupe / Trimestre) — la suite Vitest ne couvre pas ces flows ; un appel `window[nomFonction]()` dynamique pourrait avoir été manqué par l'audit statique.

### Garde-fous Phase B/C + race-condition autosave (livrés 24 mai PM, commits `f4cbea7` → `b46185f`)

- ❌ **Ne pas réintroduire le pattern fallback `||` pour les objets snapshot d'auto-save**. En JS, `{}` et `[]` sont TRUTHY donc `snapshot.X || target.X || {}` retourne TOUJOURS le snapshot, même vide → écrasement silencieux de données déjà persistées. Bug réel observé le 24 mai sur `donneesAlgorithmiques` (les nombres de mots des évaluations a2025 disparaissaient après quelques aller-retours). Toujours utiliser `if (snapshot.X && Object.keys(snapshot.X).length > 0)`. Cf. [[feedback-autosave-race-condition]].
- ❌ **Ne pas retirer le flag `window._autoSaveSuspendu`** ni la fonction `_suspendreAutoSaveTemporairement()` dans `evaluation-chargement.js`. Suspendre l'auto-save pendant 500 ms est essentiel pour éviter qu'un snapshot pris pendant la cascade de chargement (`reset partiel sync` puis `restauration async via setTimeout + dispatchEvent`) ne capture un état tronqué/vide. Les 3 entry points à protéger sont : `chargerEvaluationsEtudiant`, `demarrerEvaluationDepuisFichier`, `verifierEtChargerEvaluationExistante`. Si tu ajoutes une 4e entry point de chargement, ajoute-y aussi l'appel.
- ❌ **Ne pas réintroduire le placeholder `"500"` dans le champ « Nombre de mots »** (`evaluation-chargement.js` lignes ~857/892/1037). Trompeur : Grégoire pensait que c'était une vraie valeur saisie et ne tapait pas le bon nombre → calcul algorithmique jamais déclenché → PDF rétroaction sans rétroaction du critère Français écrit + note finale fausse. Le placeholder « 0 » du champ « Nombre d'erreurs » est conservé (auto-propagé depuis les tampons, donc pas trompeur).
- ❌ **Ne pas modifier la sémantique « obligatoires non remises = 0 » dans `_selectionnerArtefactsHybride`** sans considérer le flag `estFinale`. Cette pénalité s'applique UNIQUEMENT quand `configuration.notesFinales === true` (mode finale). En mode provisoire, les obligatoires non remises sont IGNORÉES (ne pénalisent pas la note tant que la session continue). Le calculateur reçoit `estFinale` en paramètre depuis `calculerDetailsNoteFinale`. Cf. réglage UI « Note = 0 si production non remise » du wizard pratique.
- ❌ **Ne pas dupliquer le calcul de la note finale entre app et PDF**. Le PDF (`synthese-retroaction-rendu.js renderRangeeNote`) et l'app (`profil-etudiant-sections-affichage.js`, bloc note-finale) doivent rester structurellement identiques : 2 cartes (Sélection / Obligatoires) avec calcul détaillé `(N1 + N2 + ...) ÷ N = moyenne × P% = pts`, puis bloc résultat final encadré. Toute divergence pédagogique = bug. Source unique : `calculerDetailsNoteFinale(da)` (qui lit `obtenirConfigPratiqueActive()`).
- ⚠️ **Audit à mener** : autres auto-saves du projet (wizard pratique, formulaires cours/groupe, mind map, etc.) peuvent avoir le même bug pattern. Cf. [[project-autosaves-a-auditer]] pour la liste et la démarche.

### Garde-fous refonte pratique active (livrée 24 mai fin de matinée, commit `6f85512`)

- ❌ **Ne pas réintroduire de fallback codé en dur sur les pondérations métier** (60/40, 65/35, etc.). Principe directeur sauvegardé en mémoire : [[feedback-zero-fallback-arbitraire]]. Les valeurs viennent toujours de la configuration utilisateur. Les conséquences logiques explicites (« pas de terminale → portfolio = 100% ») restent permises.
- ❌ **Ne pas réintroduire l'heuristique titre/desc/pondération dans `_identifierProductionTerminale`** (`js/profil-etudiant-actions.js:188`). La fonction est volontairement réduite à `find(p => p.type === 'terminale')`. Une production terminale est identifiée **uniquement** par son type explicite.
- ❌ **Ne pas remettre `'modalitesEvaluation'` ni `'pratiquesConfigurables'` dans `CLES_GLOBALES`** (`js/trimestres.js`). Les deux sont namespacés par trimestre depuis Phases E et F. Migrations boot idempotentes : `migration_modalites_namespacees_done`, `migration_pratiques_namespacees_done`.
- ❌ **Ne pas écrire dans `pratiquesConfigurables` (global) ni dans `modalitesEvaluation` (global) depuis le code applicatif**. Toujours `db.setSync(cle('xxx'), ...)`. La constante `CLE_PRATIQUES_CONFIGURATIONS` dans `pratiques-gestion.js` reste pour rétrocompat de lecture, mais les écritures sont déjà migrées.
- ❌ **Ne pas écrire un id de type général** (`"pan-standards"`, `"sommative"`, etc.) dans `groupesCours[].pratiqueId` ni dans `groupeCoursActif.pratiqueId`. La source canonique = id de pratique configurable (ex. `"pan-standards-bedard"`). Migration boot `migration_pratiqueId_to_configurable_id_done` (Phase G1) effectue le remappage idempotent.
- ❌ **Ne pas lire `modalitesEvaluation.configPAN.portfolio` comme source du calcul** dans un nouveau code. La source canonique est désormais `obtenirConfigPratiqueActive()` (qui lit la bibliothèque namespacée). Le snapshot reste en stockage mais n'est plus lu par `_obtenirConfigPortfolioCalcul`. Les 30 sites legacy de `pratiques.js` + `pratique-pan-standards.js` qui lisent encore le snapshot seront migrés en G2-b.
- ❌ **Ne pas renommer l'id `pan-standards-bedard`** (la pratique PAN-Littérature A25 de Grégoire) sans coordonner avec lui. C'est l'id qu'utilise son a2025 et l'attribution est désormais correcte (Grégoire Bédard / Cégep de Drummondville). Référence : [[project-pratique-active-ssot]].
- ⚠️ **Plan détaillé** : `plans de travail/PLAN-refonte-note-finale-portfolio.md` documente les 6 bugs identifiés, les décisions architecturales, et les phases restantes. Lire avant toute reprise.

---

## §1 — Récap du cycle AQPC pré-3-juin livré (22 mai 2026)

**Branche dédiée** : `aqpc/privacy` (créée depuis main `e50cf61`, mergée FF sur `main` au commit `1312a6b`, puis supprimée localement + remotement).

**6 commits livrés** (du plus ancien au plus récent) :

```
2e5a86c  docs(aqpc): documentation Loi 25 + déploiement (Phase 2-3)
32d931a  docs(aqpc): refonte README + MAJ versions Beta 99.61 (Phase 1.5 + 4)
4401ac6  a11y(aqpc): Phase 5 axe-core — T-A1 + T-A2 + 5.3 + 5.4 + 5.5
c018b44  refactor(aqpc): Phase 6.1 — retirer 2 fonctions code mort alarmistes
52b2ebf  refactor(aqpc): R (Risque) → N (Niveau d'attention) — Phase 6.1 reliquat
1312a6b  refactor(aqpc): Phase 6.2 — audit + rétention rapportsBugArchives
```

Puis bump version `99.61 → 99.62` (build `0521-2101 → 0522-0650`) à la clôture, commit séparé.

### Bilan PLAN-COURT-TERME

| Phase | Statut |
|---|---|
| 1.1 typo eval | ✅ Déjà corrigé antérieurement |
| 1.2 + 1.3 (T-A1, T-A2 ARIA) | ✅ Livré |
| 1.4 (CC BY-SA → CC BY-NC-SA) | ⏳ Reporté `audit/2026-mai` (fichiers cibles n'existent pas sur main) |
| 1.5 (MAJ Beta CLAUDE.md + START-HERE) | ✅ Livré |
| 1.6 (lien docs/adr/) | ⏳ Reporté `audit/2026-mai` (dossier n'existe pas sur main) |
| 2.1 PRIVACY.md | ✅ Livré (≈ 400 l., 7 sections requises + mentions formelles + limites assumées) |
| 2.2 INCIDENTS.md | ✅ Livré (registre conforme art. 63.5 Loi 25) |
| 2.3 INFO-ELEVES.md | ✅ Livré (gabarit à distribuer aux étudiants) |
| 3.1 DEPLOY.md | ✅ Livré (chaîne GitHub → Netlify → Cloudflare Access) |
| 3.2 netlify.toml | ✅ Livré (consolide `_headers` — à supprimer après validation deploy) |
| 4 refonte README.md | ✅ Livré (8 références mortes retirées) |
| 5.1 T-A3 contraste 17 nodes | ✅ Livré 22 mai PM (cherry-pick `36a7a81` depuis ds-update — variables `--texte-muted` + `--gris-clair` WCAG AA 4.5:1) |
| 5.2 22 outline:none T-A5 | ✅ Livré 22 mai PM (cherry-pick `f546215` + `eff9950` depuis ds-update — 4 tokens focus-ring + 22 `box-shadow: var(--focus-ring)` ajoutés) + bug fix régression doubles box-shadow (`91668ac`, 7 sites fusionnés en `box-shadow: var(--focus-ring), <original>`) |
| 5.3 prefers-reduced-motion | ✅ Livré |
| 5.4 prefers-contrast: more | ✅ Livré |
| 5.5 aria-live notifications | ✅ Livré |
| 5.6 T-A10 touch targets 44 px | ✅ Livré 22 mai PM (`22914ac` — `.btn-codex-header` 36→44px + section `@media (pointer: coarse)` sur `.btn`, `.btn-action-header`, `.btn-icon-header` 32→44px) — validation iPad par Grégoire pour confirmer 6.3 partie 2 |
| 6.1 (a) chaînes alarmistes UI | ✅ Déjà retiré Cat-B Track 4 chantier J + refactor R → N (49 substitutions) |
| 6.1 (b) 4 fonctions code mort | ✅ 4/4 retirées (2 Cat-B Track 1 + 2 AQPC) |
| 6.2 audit `rapportsBugArchives` | ✅ Livré (seuil 50→20, migration, alerte UI) |
| 7.1 + 7.2 tests manuels Grégoire | ⏳ À toi |

### Dettes explicites documentées — toutes closes le 22 mai 2026

| # | Dette | Commit | Note |
|---|---|---|---|
| #1 | UI Direction du risque (bloc `reglages-interpretation-legacy` complet) | `5c4338b` | −408 lignes |
| #2 | « Seuils d'alerte critiques » → « Seuils de vigilance » | `6e7455d` | 1 site |
| #3 | 3 tooltips UI « risque » → « niveau d'attention » + `DESCRIPTIONS_SEUILS` orphelin | `92480f1` | Bonus zéro-dette |
| #4 | Retrait `_headers` (netlify.toml prend le relai) | `ad396f4` | Deploy validé |

**Cleanup Beta 95 legacy étendu** (22 mai 2026 matin) :
- Phase 1 (commit `479422c`) : retrait des 7 autres blocs `reglages-*-legacy` masqués depuis Beta 95 (apercu, trimestre, cours, horaire, groupe, snapshots, import-export) — **−1314 lignes index.html**
- Phase 2 (commit `6b2da4b`) : retrait de 19 fonctions JS orphelines associées dans trimestre.js, horaire.js, trimestre-v2-init.js, trimestre-v2.js, cours.js, import-export.js — **−931 lignes JS**

**Cleanup résidus système risque** (22 mai 2026 matin, commit `c697a29`, build 0522-0945) :
- Audit post-refactor R → N révèle 3 systèmes JS morts + 2 familles CSS mortes (zéro caller, vérifié cross-codebase). Complémentaire aux dettes #1-4 (qui ont retiré l'UI legacy + DESCRIPTIONS_SEUILS orphelin) : touche les systèmes RaI badge échelle visuelle jamais migrés.
- **A.1** `js/profil-etudiant-helpers.js` : fonction `genererBadgeRisqueProfil` (28 l.) + export `window.X` + commentaire en-tête (« Badges (pratique, risque, pattern) » → « (pratique, pattern) »)
- **A.2** `js/couleurs.js` : objet `COULEURS.risque` (10 l.) + entrée du `return Object.freeze`. Palettes `indices`, `pratiques`, `idme`, `graphiques`, `correlations` intactes.
- **A.3** `js/interpretation-config.js` : bloc `risque: {minimal/faible/modere/eleve/critique}` dans `SEUILS_PAR_DEFAUT` (9 l.). NE PAS confondre avec `directionRisque` qui reste vivant.
- **A.4** `styles.css` : 6 classes `.badge-risque-{minimal/faible/modere/eleve/tres-eleve/critique}` (30 l.)
- **A.5** `styles.css` : 8 classes `.badge-risque-analyse-*` famille 2 (50 l.)
- Sentinelle Vitest `tests/unit/refactor-profil-etudiant.test.js` MAJ (export `genererBadgeRisqueProfil` retiré de la liste verrouillée).
- Bilan : 8 fichiers touchés, **−139 LOC nettes**, 85/85 Vitest verts. UI vivante « Direction du risque » (slider + `calculerDirectionRisque`) intacte — chantier renommage R → N futur, hors scope ce cleanup.

**Cleanup palettes COULEURS sans caller** (22 mai 2026 matin, commit `128ae0c`, build 0522-1115) :
- Audit complémentaire post-COULEURS.risque révèle que 3 autres palettes du module `js/couleurs.js` sont également sans caller cross-codebase.
- Retraits : `COULEURS.pratiques` (SOM/STD/SPE/DEN), `COULEURS.idme` (E/M/D/R/I), `COULEURS.graphiques` (fond/grille/texte) — la palette `graphiques` était fonctionnellement remplacée par `STYLE_GRAPHIQUE.couleurs()` qui calcule texte/grille dynamiquement selon mode clair/sombre.
- Seules `COULEURS.indices` (correlations-longitudinales.js + graphiques-progression.js) et `COULEURS.correlations` (correlations-longitudinales.js) restent consommées.
- JSDoc d'en-tête actualisée. Bilan : −28 LOC nettes dans couleurs.js, return Object.freeze rétréci à 2 entrées. Tests 85/85 Vitest verts.

### Chantier Phase 2 cascade legacy 95 — LIVRÉ (22 mai 2026 après-midi)

**Branche dédiée** : `cleanup/phase2-cascade-legacy-95` (créée depuis `main` `f51aeb1`, 3 commits, mergée FF sur `main`, puis supprimée).

**3 commits livrés (du plus simple au plus complexe)** :

| Commit | Module | LOC retirée | Note |
|---|---|---:|---|
| `5ccb306` | `js/trimestre.js` | **−563** (601 → 38 l.) | + retrait caller `main.js:467-468`. **Bug latent fixé** : exports cassés L583+L586 introduits par commit `6b2da4b` faisaient crasher l'IIFE → ni `obtenirCalendrierComplet` ni `obtenirInfosJour` n'étaient sur window (sites `snapshots.js:398/443/690` et `calendrier-vue.js:500` plantaient silencieusement). Le retrait global restore les exports. |
| `dd493cc` | `js/cours.js` | **−365** (1580 → 1215 l.) | Retrait `afficherFormCours`, `annulerFormCours`, `sauvegarderCours`, `afficherListeCoursSidebar`, `modifierCours` + 5 exports. JSDoc `coursEnEdition` MAJ dans `config.js` (Zone protégée — commentaire only). |
| `137411c` | `js/groupe.js` | **−188** (1190 → 1002 l.) | Retrait `addStudent`, `resetFiltreGroupe`, doublon `deleteStudent` × 2 + 3 exports. Bouton HTML `data-action="resetFiltreGroupe"` retiré du HTML généré par `filtrerParGroupe`. QuerySelectors `addStudent` simplifiés dans `modifierEtudiant`. |

**Bilan total** : **5 fichiers touchés**, **−1124 LOC nettes** (+25 / −1149), tests 85/85 Vitest verts à chaque jalon.

### Bug latent fixé en cascade (à inscrire SUIVI-BUGS)

Le commit `6b2da4b` (Phase 2 legacy 95, 22 mai matin) avait retiré les définitions de `function genererCalendrierComplet()` et `function afficherStatistiquesTrimestre()` dans `trimestre.js` **mais oublié de retirer les exports L583 + L586** qui les référençaient. Conséquence vérifiée via node :

```
ReferenceError: genererCalendrierComplet is not defined
```

→ L'IIFE de trimestre.js crashait au chargement, ni `obtenirCalendrierComplet` ni `obtenirInfosJour` n'étaient en réalité sur window depuis 6 h ce matin. Sites cassés silencieusement (sans guard typeof) :
- `snapshots.js:398, 443, 690` (création de snapshots)
- `calendrier-vue.js:500` (vue calendrier)

Le retrait du module legacy entier dans le chantier 2.3 fixe gratuitement le bug. **Vérifié** : `node -e "require('./js/trimestre.js'); ..."` expose désormais bien les 2 getters.

### Sub-cleanup tableau Réglages → Cours legacy — LIVRÉ (22 mai 2026 après-midi)

**Branche dédiée** : `cleanup/tableau-reglages-cours-legacy` (créée depuis main `83687ae`, 1 commit, mergée FF puis supprimée).

**Commit livré** : `bd37072` refactor(legacy-95-cascade): sub-cleanup tableau Réglages → Cours legacy

**cours.js réduit de 1215 → 669 lignes (−546 LOC)**. Suite logique du chantier 2.1 qui avait laissé hors scope cette chaîne morte pour cohérence.

Fonctions retirées (toutes 0 caller actif après audit cascade) :
- `afficherTableauCours` (cherchait `#tableauCoursContainer` retiré Phase 1 → early return)
- `obtenirTousLesCoursBibliotheque` (orpheline — JSDoc disait « utilisée par ouvrirModalBibliothequeCours » mais cette dernière inline le filtre)
- `obtenirNomPratiqueFallback` (helper consommé uniquement par afficherTableauCours et afficherPratiqueEnLectureSeule)
- `afficherPratiqueEnLectureSeule` (0 caller validé)
- `dupliquerCours` (data-action dans HTML mort)
- `activerCours` (data-on-change dans HTML mort)
- `supprimerCours` (data-action dans HTML mort ; pas de conflit avec celui de `js/entites/cours-entite.js` en IIFE isolée)

Exports retirés : 4 (`window.{afficherTableauCours, dupliquerCours, activerCours, supprimerCours}`).

Section delimiters de commentaire orphelines retirées : `AFFICHAGE DU TABLEAU`, `FORMULAIRE D'AJOUT/ÉDITION` (delimiter trompeur — formulaire retiré chantier 2.1), `⭐ ACTIVATION DU COURS`, `SUPPRESSION`, `🔔 NOTIFICATIONS` (vide), `📌 NOTES D'UTILISATION` (~55 l. de commentaire obsolète).

Cleanups annexes : `main.js` event listener (10 l.) écoutant `[data-sous-onglet="reglages-cours"]` retiré ; `config.js` ligne « 08-cours.js (utilise coursEnEdition) » retirée du JSDoc des modules dépendants (caduque).

Préservé intact : `dupliquerCoursPourTrimestreActif` (vivante, référencée par carte HTML du modal bibliothèque), tout `ouvrirModalBibliothequeCours` et la chaîne modal bibliothèque, section delimiter `🔄 DUPLICATION` (toujours pertinente).

Le doublon `supprimerCours` documenté dans le chantier 2.1 s'est révélé être un faux doublon : `js/entites/cours-entite.js:171 supprimerCours` est en IIFE isolée et exposée uniquement via `window.CoursEntite.supprimer`, pas de conflit avec celle de `cours.js` retirée.

**Bilan cumulé Phase 2 + sub-cleanup** : trimestre.js (−563), cours.js (−365 puis −546 = −911 total), groupe.js (−188), main.js (−5 puis −10 = −15 total), config.js (commentaires seulement). **Total ~−1677 LOC nettes** (+25 / −1702) cumulé sur 4 commits.

### Fixes accessibilité a11y — T-A3 + T-A5 portés depuis ds-update (22 mai PM)

**Branche dédiée** : `cleanup/a11y-passe3-fixes-mineurs` (créée depuis main `5afd4c7`, 3 commits cherry-pickés depuis `ds-update/2026-mai`, mergée FF puis supprimée).

3 commits portés sur main :

| Commit | Trouvaille | Effet |
|---|---|---|
| `36a7a81` | T-A3 contraste 17 nodes | Variables `--texte-muted` + `--gris-clair` ajustées dans 3 modes (sombre, clair, print) pour atteindre WCAG AA 4.5:1. styles.css + fallback index.html. |
| `f546215` | T-A5 fondation | 4 tokens focus-ring créés dans `:root` (couleur, largeur 3px, offset 2px, composite). Override `--focus-ring-color` en `.mode-clair`. |
| `eff9950` | T-A5 finition | 22 sites `outline: none` désormais accompagnés d'un `box-shadow: var(--focus-ring)` qui restaure un focus visible clavier. |

**Bilan** : 4 fichiers touchés (styles.css, index.html), 85/85 Vitest verts, pas de bump beta (convention §0). Audit annuel sous-audit 6.1 passe de Jaune (T-A1+T-A2 fixés 21 mai) à **Vert** côté outils statiques (T-A3 + T-A5 traités, T-A7 déjà fait Phase 5.3/5.4 AQPC). Restent les tests manuels 6.2/6.3 (Grégoire).

3 brouillons ds-update non versionnés sur main retirés du staging des cherry-picks (`ds-update/passe-2-diff/decisions-actees-01a-palette.md` + `ds-update/v8-drafts/01a-palette-couleurs.html` + `ds-update/v8-drafts/_guide-styles.css`) — ces fichiers vivent uniquement sur `ds-update/2026-mai`.

### Fixes accessibilité a11y — T-A10 touch targets + bug fix doubles box-shadow (22 mai PM, suite)

**Branche dédiée** : `cleanup/a11y-t-a10-touch-targets` (créée depuis main `32c5b44`, 2 commits, mergée FF puis supprimée).

2 commits livrés :

| Commit | Sujet | Effet |
|---|---|---|
| `91668ac` | Fix régression doubles box-shadow | Le cherry-pick T-A5 (`eff9950`) avait inséré `box-shadow: var(--focus-ring);` au début de 7 blocs `:focus` qui avaient déjà un `box-shadow` plus loin → le 2e écrasait le focus-ring. Fusion en `box-shadow: var(--focus-ring), <original>` sur `.controle-form`, `.cc-meta-ligne input/select`, `.cc-meta-textarea`, `.btn-codex-header`, `.wizard-v2-champ input/textarea/select`, `.travaux-retro-modal .travaux-retro-textarea`, `.travaux-retro-nom-input`. |
| `22914ac` | T-A10 touch targets 44×44 px | `.btn-codex-header` min-height 36→44px (cas Lighthouse). Section `@media (pointer: coarse)` ajoutée en fin de styles.css : `.btn`, `.btn-action-header` min-height 44px ; `.btn-icon-header` 32×32 → 44×44 ; icône SVG header 18→20px pour rester proportionnelle. Préserve la densité visuelle desktop (`pointer: fine` non affecté). |

**Bilan** : 1 fichier touché (styles.css), 85/85 Vitest verts, pas de bump beta. **Sous-audit 6.3 T-A10 passe À-vérifier → Vert** côté outils statiques. Validation iPad par Grégoire (tests manuels 6.3 partie 2) nécessaire pour confirmer empiriquement sur ~237 éléments interactifs.

### Démarches externes à engager

- **Demande d'avis au responsable PRP du Cégep de Drummondville** (Loi 25) — délai réponse 2-6 semaines. À envoyer par Grégoire. Conditionne la version 1.1 de PRIVACY.md.

---

## §1ter — Tests manuels Section A LIVRÉS (23 mai 2026 matin + midi)

**8/9 tests Section A passés**. A.6 reporté car bloqué par bug #282 (modale Bibliothèque cours vide en V2, chantier de réparation tenté et reverté — cf. ci-dessous).

| Test | Statut | Sortie clé |
|---|---|---|
| **A.1** Boot console | ✅ | Mac console propre. 2 bugs prod logés #114 (CSP Cloudflare beacon sur app.codexnumeris.org) + #115 (`icon-files.svg` 404 dans modal « Plusieurs fichiers par étudiant »). |
| **A.2** Snapshot Codex | ✅ critère strict (pas de ReferenceError) | **Bug #116 logé Priorité Moyenne** : `capturerSnapshotManuel` a 4 facettes problématiques (phantômes inter-groupes-cours, no dedup, métrique « Dernière capture » figée hors trimestre, fallback semaine 1 silencieux). **UI ajoutée** : bandeau contextuel « Groupe-cours actif : sigle — Groupe N » sous le titre du panneau Captures de progression (index.html + snapshots.js + trimestre-v2-orchestre.js). **Backlog #280** : fusionner « Capturer maintenant » + « Reconstruire l'historique » (retour Grégoire — il fait toujours Reconstruire). |
| **A.3** Vue Calendrier | ✅ | Renommage UI : « Congés avec reprises » → « Congés institutionnels et fériés » (calendrier-vue.js:604). Layout overflow #118 logé (sous-onglet Trimestre dépasse sur 1470px). **3 régressions critiques fixées en cascade** : #117 (ReferenceError `setValue` cross-IIFE, bouton Modifier événement no-op, fix `window.setValue` dans trimestre-v2-cours.js), #119 (vue calendaire pas rafraîchie après modif trimestre, 4 handlers patchés avec `afficherCalendrierScolaire`), **#120 RÉGRESSION MAJEURE** : `genererCalendrierComplet` (190 LOC) + 5 helpers date retirés à tort par commit `6b2da4b` Phase 2 cascade legacy 95 du matin précédent. Restaurés depuis `git show 6b2da4b^`. Le module trimestre.js est passé de 38 → 270 LOC. |
| **A.4** Saisie présences | ✅ | Console propre, Sem. 16 disparue après fix #120 (la séquence des numéros de semaine respecte désormais les fériés institutionnels sans reprise). |
| **A.5** Modal Bibliothèque cours | ✅ critère strict (modal s'ouvre, pas d'erreur console) | **Bug #282 découvert** : modal vide en V2 — lit `db.get('listeCours')` (clé legacy) au lieu de `cours` (clé canonique V2 cf. trimestres.js:72). Audit révèle ~23 sites actifs lisant `listeCours` cross-codebase (scope >2-3h annoncé initialement). |
| **A.6** Dupliquer cours | ⏸ **Reporté** | Bloqué par #282 — impossible de tester depuis bibliothèque vide. |
| **A.7** Ajouter étudiant V2 | ✅ | Liste se met à jour, console propre. |
| **A.8** Modifier puis supprimer étudiant | ✅ | + **UI : renommage « Éditer » → « Modifier »** sur 6 sites visibles (dropdown étudiant trimestre-v2-etudiants.js, bouton pratique pratiques.js, bouton fichier travaux-ui.js, bouton grille grilles.js, option évaluation liste-evaluations.js, doc index.html). Préserve les commentaires de code (`// Éditer`) et les `value="editer"` (références internes stables). |
| **A.9** Modifier dates trimestre V2 | ✅ | Confirme que le fix #119 fonctionne — modifier une date Début/Fin trimestre régénère le calendrier ET rafraîchit la vue calendaire sans changer d'onglet. |

### Chantier #282 listeCours → cours — TENTÉ ET REVERTÉ (23 mai 2026 matin)

**Grégoire a explicitement choisi « refonte complète zéro-dette »** plutôt qu'un fix minimal. 6 étapes (audit + migration boot + 5 vagues de migration) exécutées en ~1h30 :

- **12 fichiers JS touchés** : cours.js (10 sites + migration boot `migrerListeCoursVersCours` + helper `_normaliserCoursVersShapeV2`), trimestres.js (5 sites + comment registre), pratiques.js (3 sites — sensible indices A-C-P), travaux-ui.js (1 site simplifié), contexte.js (2 sites), cc-license.js (1 site + accès enseignant nested), demo-activation.js (5 sites — retraits redondants), migrations.js (13 sites historiques), statistiques.js + rapport-bug.js + organisateur.js + export-pdf.js + reserve.js (1-2 sites chacun), trimestre-v2-cours.js (retrait migration lazy redondante), main.js (appel migration ajouté + réordonné AVANT `executerMigrationsBeta935`).
- **93 sites migrés** à seulement **2** restants (tous dans la fonction de migration légitime).
- **Syntaxe OK** (`node --check` vert sur tous les fichiers), **zéro erreur console** au boot.

**Problèmes graves détectés au test fonctionnel** :

1. **Migration crée des doublons silencieux** : fusion par `id` seulement, pas par tuple naturel (codeCours, session, annee). Le setup Grégoire avait 2 versions du cours 601-101 : V2 (id `h2026-601-101-MQ-00001`) + legacy migré (id générique `COURS_1779535633370_...`). Post-migration, les 2 coexistent dans `cours`.
2. **Bug pré-existant de form state cours révélé** : clic « + Nouveau cours » ne reset pas `coursEnEditionV2`. Grégoire pensait créer un cours 102 mais a édité le V2 601-101 → contenu 601-102 sur id 601-101. Désynchro id immutable / codeCours.
3. **Bug pré-existant `_persisterCoursV2` auto-active** : tout save avec `cours.actif === true` (default) écrase silencieusement `infoCours`. Confusion sur « comment activer un cours ».

**Revert** : `git checkout HEAD -- ` sur 15 fichiers JS. BACKLOG.md gardé (entrées #281 et #282 enrichies). Snippet console fourni à Grégoire pour restaurer son cours 601-101 et retirer le doublon legacy de `cours`. Recovery validé par Grégoire.

**Le backlog #282 contient le post-mortem complet avec 4 prérequis P1-P4** :
- **P1** : fixer le form state cours — clic « + Nouveau cours » DOIT reset `coursEnEditionV2 = null` (~30 min)
- **P2** : clarifier UX activation cours/groupe-cours — bouton « Activer » explicite + indicateur visuel partout (~1 h)
- **P3** : migration listeCours → cours doit fusionner par (codeCours, session, annee) + log doublons (~1 h)
- **P4** : audit data utilisateur — snippet recovery si doublons existants

**Estimation révisée** : 5-7 h (pas 2-3 h). **#282 marqué PRIORITÉ HAUTE** « À TRAITER ABSOLUMENT » dans BACKLOG.md (retour Grégoire).

### Bilan SUIVI-BUGS post-Section A

- **4 bugs Ouverts** : #114 (CSP Cloudflare prod), #115 (icon-files.svg 404), #116 (snapshots manuels 4 facettes), #118 (layout overflow Trimestre).
- **3 bugs Corrigés** (section dédiée 22 mai 2026 dans SUIVI-BUGS) : #117 (setValue cross-IIFE), #119 (vue calendaire refresh), #120 (genererCalendrierComplet restaurée).
- **Prochain ID** : #121.

### Bilan BACKLOG post-Section A

- **#280** Fusion « Capturer maintenant » + « Reconstruire l'historique » snapshots (Priorité Moyenne).
- **#281** Uniformiser style notifications — migrer le custom HTML restant dans saisie-presences.js:1357 vers `notifications.succes`.
- **#282** **⚠️ PRIORITÉ HAUTE** Refonte listeCours → cours avec prérequis P1-P4 documentés (P1-P4 désormais ✅ livrés 23 mai PM, cf. §1quater — reste étape 5 migration finale).

---

## §1quater — #282 prérequis P1-P4 + tests Section B LIVRÉS (23 mai 2026 PM)

**2 commits sur main** (post-Section A et chantier #282 reverté du matin) :

| Commit | Sujet | Build |
|---|---|---|
| `04f8d9e` | feat(cours-gc): #282 P1 bandeau modification + P2 activation explicite cours/GC | 0523-1435 |
| `9cf542e` | refactor(cours): #282 P3 migration listeCours par tuple naturel + P4 snippet recovery | 0523-1710 |

### Tests manuels Section B livrée (a11y T-A3/T-A5/T-A10)

Grégoire a validé visuellement les 17 sous-tests B.1-B.3 sur Safari Mac, modes sombre et clair, simulation iPad Web Inspector. Aucune régression. Document `Retours des testeurs/TESTS-MANUELS-PENDING-2026-05-22.md` mis à jour avec ✅ partout. Sections C, D, E, F **reportées** (décision Grégoire en session).

### #282 P1 — Bandeau « Mode modification » (cours)

- `index.html` : bandeau `.alerte-information` ajouté dans `#cours-formulaire-edition`, texte « Mode modification — Cours <code>. Pour créer un nouveau cours, clique + Nouveau cours. » (sans emoji — cf. nouvelle [[feedback-zero-emoji-strict]]).
- `js/trimestre-v2-cours.js` : helpers `_afficherBandeauEdition(codeCours)` + `_cacherBandeauEdition()`, wire dans 6 entry points (nouveau, changer si !coursId, changer si cours, modifier, dupliquer, annuler, supprimer).

### #282 P2 — Activation explicite cours + groupe-cours

**Cours (`trimestre-v2-cours.js`)** :
- `_persisterCoursV2` : retrait de la condition `|| cours.actif` (l'ancien déclencheur auto-activation). Auto-active uniquement le **PREMIER cours créé** (`tousLesCours.length === 1` après push). Re-sync `infoCours` si modification du cours actuellement actif (pour conserver champs codeCours/nom synchronisés).
- `_construireObjetCoursV2` : retrait du flag `actif: true` hardcodé (géré conditionnellement dans `_persister`).
- `activerCoursV2()` (nouvelle) : handler bouton « Activer ce cours » avec invariant single-active (forEach pour marquer les autres `c.actif = false`) + `setSync infoCours` + notifications.succes.
- `_mettreAJourBoutonActiverCours(coursId)` : helper visibilité bouton (visible si pas déjà actif, caché sinon).
- Suffixe « (actif) » dans le `<option>` du dropdown V2 cours.
- Badge « Cours actif » (vert, classe `.apercu-badge-actif`) dans `afficherSyntheseCours` (sidebar aperçu).
- `index.html` : bouton `#v2-btnActiverCours` dans `.actions-formulaire`.

**Groupe-cours (`trimestre-v2-groupes-cours.js`)** : symétrique des cours
- `sauvegarderGroupeCoursV2` : auto-active uniquement le PREMIER GC créé (groupesCours.length === 0 avant push).
- `activerGroupeCoursV2()` + `_mettreAJourBoutonActiverGroupeCours(gcId)`.
- `activerGroupeCoursDepuisBibliotheque` : sync bouton formulaire si le GC activé est en cours d'édition.
- Badge « Groupe-cours actif » dans `mettreAJourCarteResumeGroupeCoursV2` (carte résumé).
- `index.html` : bouton `#v2-btnActiverGroupeCours`.

**CSS** : nouvelle classe `.apercu-badge-actif` dans `styles.css` (vert succès via tokens `--alerte-{fond,bordure,texte}-succes`).

### #282 P3 — Migration listeCours → cours, fusion par tuple naturel

`_migrerListeCoursVersCoursV2()` extrait de l'inline (anciennement L40-47 de `chargerDropdownCoursV2`) :
- Fusion par tuple `(codeCours, sessionAnnee)` au lieu de `id` seul → détecte les doublons cross-storage (cas : un cours présent à la fois dans `listeCours` legacy avec id générique `COURS_177...` ET dans `cours` V2 avec id `h2026-XXX-MQ-00001`, anciennement non détecté).
- `_tupleCoursNaturel(c)` : helper pur exportable, retourne `code|sessionAnnee` (ex. `"601-101-MQ|H2026"`) ou code seul si session/annee manquantes (tuple dégradé legacy minimal).
- **V2 wins** : les entrées legacy dont le tuple matche V2 sont ignorées (pas écrasées).
- Audit : `console.warn` avec détails `[{tuple, legacyId, v2Id}, ...]` + `notifications.info` à l'utilisateur si N > 0 (« Migration cours : N doublon(s) ignoré(s) — V2 préservée »).
- Idempotent : clé `listeCours` vidée après migration → ré-exécutions ultérieures = no-op.

### #282 P4 — Snippet console de recovery

Snippet autonome inscrit dans `BACKLOG.md` #282 P4 (block markdown ```js). Compatible Safari console (functions traditionnelles, var, pas d'arrow, pas de const, peut être collé en une seule ligne). Logique :
1. Groupe les cours par tuple naturel.
2. Détecte les groupes de 2+ entrées.
3. Retire les entrées non-V2 (id ne matchant pas `^[ah]\d{4}`) si V2 existe pour le même tuple.
4. Re-sync `infoCours` si pointait vers une entrée retirée (redirection vers V2 équivalent).

Grégoire avait déjà nettoyé ses données ce matin via un snippet équivalent (cf. SESSION.md §1ter), donc P4 sert de référence pour le futur (autres machines, autres utilisateurs si éventuels).

### Reste pour fermer #282 — étape 5 (migration finale, ~3 h, hors scope ce commit)

Migration des **~93 sites** lisant `db.getSync('listeCours', ...)` ou `db.get('listeCours')` vers la clé canonique `cours`. Liste indicative des fichiers touchés (à valider avec un audit grep frais) :
- **js/cours.js** : 10 sites (L64, 96, 126, 207, 272, 357, 376, 401, 455, 530) — la modal Bibliothèque cours, principalement.
- **js/contexte.js** : 2 sites (L156 forEach actif + L194)
- **js/cc-license.js** : 1 site (L520 `coursActif = listeCours.find(c => c.actif)`)
- **js/pratiques.js** : 3 sites (sensibles indices A-C-P)
- **js/travaux-ui.js** : 1 site (à vérifier)
- **js/demo-activation.js** : 5 sites (retraits redondants)
- **js/migrations.js** : 13 sites historiques (peut nécessiter conservation pour idempotence des migrations passées — auditer)
- **js/statistiques.js**, **js/rapport-bug.js**, **js/organisateur.js**, **js/export-pdf.js**, **js/reserve.js** : 1-2 sites chacun
- **js/trimestre-v2-cours.js** : 1 site (la fonction de migration `_migrerListeCoursVersCoursV2` lit `listeCours` — doit RESTER pour idempotence boot)

Stratégie suggérée :
1. Faire l'audit grep complet avec `grep -rn "listeCours" js/ --include="*.js"` pour le compte réel.
2. Identifier les sites de **lecture** (à migrer vers `cours`) vs les sites **historiques de migration** (à conserver).
3. Migrer par groupes cohérents (cours.js d'abord = la valeur immédiate user, puis contexte.js + cc-license.js + le reste).
4. Tester après chaque groupe via Réglages → Cours → Bibliothèque qui doit afficher les cours.

Idéal : créer un worktree dédié `cleanup/282-migration-finale` pour ne pas polluer main si quelque chose casse en cours de route.

> Cycle précédent — 10/10 critères atteints. Conservé pour référence.

### Track 1 — Quick wins (✅ complet, matin)

**Commit** : `054d461` (correctif version : `5a12236`)
**Tag** : `cat-b-track-1-2026-05-21`

- **13 bugs latents #96-108 fermés** (productions 3, trimestre-v2 6, profil-etudiant 2, evaluation 2)
- **3 doublons evaluation résolus** (`restaurerPreferenceTri`, `obtenirClasseNote`, `filtrerListeEvaluations`)
- **2 codes morts alarmistes retirés** (`calculerRisqueEchec`, `obtenirClasseRisque`)
- −307 LOC nettes, 89/89 tests verts

Voir `Retours des testeurs/SUIVI-BUGS.md` section « Corrigés (21 mai 2026 — Cat-B Track 1 chantier A) ».

### Track 2 — Méthode (✅ complet, matin)

**Commit** : `3c09782`
**Tag** : `cat-b-track-2-2026-05-21`

- **20 propositions Cat-B méthode actées et intégrées** dans `audit/refactoring-prep/METHODE-REFACTORING.md`
- **6 nouveaux anti-patterns §5.8 à §5.13** (wrappers résiduels, factoriser branches, `// security-ok` inline, variables IIFE, let cross-IIFE, closures async)
- **§3 étapes 0/3/4/5 enrichies** (orchestrateurs en dernier, grep `window.X`, renommage si résidu IIFE complet, trade-off cyc 15/30, stratégie N=50, sous-helpers DOM, bug latent pendant éclatement)
- **§4 check-list étape 3 enrichie de 4 items**
- **§6.5 gabarit** : rubrique « Stratégie cyc > 30 (cible dure vs héritages Cat-B) » ajoutée
- **METHODE-REFACTORING gelée** jusqu'au prochain cycle de refactors (Q3 2026 si applicable)

### Track 3 phase 1 — Héritages cyc > 30 (✅ partiel, matin — 8/14 fonctions)

**Commits** : `826b28a` (refactor) + `c9ef2d0` (doc statut)
**Tag** : `cat-b-track-3-phase1-2026-05-21`

**Modules à baseline 0 cyc > 30** :
- ✅ `evaluation*.js` : 3/3 fonctions
- ✅ `trimestre-v2*.js` : 4/4 fonctions
- ⚠️ `profil-etudiant*.js` : 1/7 (`determinerCibleIntervention` 58→<30) — reste 6 fonctions traitées en phase 2 PM

### Track 3 phase 2 — profil-etudiant (✅ complet, après-midi)

**Commits** : `d03352d` (arrow :2659) + `4462bdc` (calculerIPB) + `e0caa8f` (calculerDetailsNoteFinale) + `47651cb` (Performance + arrow :4083 + fix #110) + `2b24576` (Mobilisation) + `88bcaf1` (docs PLAN)
**Tag** : `cat-b-track-3-phase2-2026-05-21`

**5 fonctions traitées (38 helpers privés ajoutés)** :

| Fonction | Cyc | Helpers | Statut |
|---|---:|---:|---|
| Arrow `.map` :2659 (zone Section Productions) | 36 → <30 | 5 | ✅ strictement <30 |
| `calculerIPB` (calculs.js) | 36 → <30 | 5 | ✅ strictement <30 |
| `calculerDetailsNoteFinale` (actions.js) | 67 → <30 | 8 | ✅ strictement <30 |
| `genererSectionPerformance` + arrow :4083 | 52 → <30 | 10 | ✅ strictement <30 |
| `genererSectionMobilisationEngagement` | 59 → **48** | 10 | ⚠️ **héritage Cat-B sous N=50 acté** |

**Bug latent #110 fixé** dans le commit Performance : `portfolioActif` (variable non définie dans `genererSectionPerformance`, la correcte est `portfolioActifRapport`). Affichait toujours « Performance des productions indépendantes ». Inscrit Corrigés SUIVI-BUGS le 21 mai PM.

**ESLint cyc>30 dans profil-etudiant\*** : 6 → 1 (Mobilisation héritage cyc 48).

### Track 4 — Transversaux (✅ G + J + F + E + I livrés)

**Commits clés** : `3fe5165` (G+J matin) + `6532f75` (F soir) + sous-lots E `e0a9fdb`→`864a756` (6 commits soir) + `a16aefa` (I soir + build refresh 0521-2046)
**Tags** : `cat-b-track-4-gj-2026-05-21` + `cat-b-track-4-chantierF-2026-05-21` + `cat-b-track-4-chantierE-2026-05-21` + `cat-b-track-4-chantierI-2026-05-21`

**Livré** :
- ✅ **Chantier G** : 2 accès localStorage direct migrés vers `db.getSync`/`db.setSync` (`profil-etudiant-diagnostics.js`)
- ✅ **Chantier J** : 8 reformulations UI vocabulaire alarmiste + retrait FAQ « Indice R prédit risque d'échec » + glossaire descriptif
- ✅ **Chantier F** (soir, branche `cat-b/track-4-chantier-F`) : Couplage travaux-ui ↔ `window.evaluationEnCours` découplé via API `evaluation.demarrerEvaluationDepuisFichier(fichier, opts)` exportée par `evaluation-chargement.js`. Audit révèle 8 sites d'écriture cross-module dans travaux-ui (1 réassignation L4639 + 7 mutations Zone 1 `basculerMode` + Zone 2 `afficherPalettesEval`) — scope plus profond que les ~1-3h annoncées PLAN-CAT-B chantier F. Décision (b) découpler actée avec Grégoire. Sentinelle Vitest `tests/unit/sentinelle-evaluation-en-cours.test.js` (3 sub-tests) verrouille l'invariant : whitelist = `config.js` + 7 modules `evaluation*.js`. Tests 92/92 verts (80 Vitest + 12 Playwright).
- ✅ **Chantier E** (soir, branche `cat-b/track-4-chantier-E`) : Consolidation `utils-notifications.js` — **scope réel ~7x plus gros que les 73 annoncés**. Audit révèle ~525 sites d'appel (54 guardés + ~440 bare refs résolues via scope chain → window). Migration en 6 commits livrés sur la branche. État final : 0 def `function afficherNotificationX`, 0 export `window.afficherNotificationX`, 0 wrapper local, 0 guard typeof, 0 cas spécial. Source unique : `window.notifications.{succes, erreur, info}` (utils-notifications.js, textContent → immunisé XSS sans dépendance à echapperHtml). Sentinelle Vitest stricte `tests/unit/utils-notifications.test.js` verrouille l'invariant. 3 bugs latents fixés : #111 XSS trimestre.js (résolu gratuitement par retrait def), #112 type ignoré (`'warning'`/`'erreur'`/`'succes'` en 2e param), #113 shadow local wizard-pratique-v2 1-param. Tests 97/97 verts (85 Vitest + 12 Playwright). −469 LOC nettes.

- ✅ **Chantier I** (soir, branche `cat-b/track-4-chantier-I`, build 0521-2046) : 6 tests Playwright rendus DOM, 5 fichiers `*-rendu.spec.js`. Couvrent : bilan-reflexif éditeur (`initialiserBilanReflexif` → `#bilan-vue-editeur`), productions badge CC (`genererBadgeCC` + vérification fix XSS E-β sur `metadata.contributeurs[].modifications`), trimestre-v2 carte résumé horaires (`chargerHorairesV2` → `#v2-carteResumeHoraire` avec jours/heures/local), profil-etudiant Section Productions par défaut (`afficherProfilComplet` → `#contenuProfilEtudiant`, exerce le résolveur étudiant + cours actif + sidebar 2col), evaluation palette critères (`afficherCriteresDepuisGrille` → `#listeCriteresGrille1`, cartes critères × 4 options IDME), evaluation rétroaction Bilan (`basculerVueRetroaction('bilan')` → `#contenuRetroBilan`, exerce `genererRetroactionBilan` cyc 75 — défis prioritaires + forces). **Tests 85 Vitest + 18 Playwright = 103/103 verts** (+6 chantier I). Critère A8 atteint. **10/10 critères Cat-B atteints** (A2 sous exception N=50). Pattern technique : `page.evaluate()` pour appeler les fonctions de rendu publiques après fixtures `db.setSync`, évite les `setTimeout` en cascade des flux navigation ; `page.on('dialog')` pour auto-dismiss `alert('Élève introuvable')`. Convention `*-rendu.spec.js` complète les `*-chargement.spec.js` existants (sentinelles d'exports).

**Reporté post-AQPC** :
- ⏳ **Chantier H** (OPTIONNEL) : Sous-découpage résidus (~4-6h) — NE PAS attaquer sans nouvelle validation Grégoire (D-21M-5).

**Chantier J reliquat — tokens CSS LIVRÉ (21 mai soir)** :
- ✅ Tokens CSS `--risque-{nul,minimal,faible,modere,eleve,tres-eleve,critique}` renommés en `--niveau-attention-*` (mapping 1:1, 97 hits dans 10 fichiers). Audit réel beaucoup plus modeste que les 480 hits estimés (qui comptaient commentaires + JSON ESLint historiques). Tests 103/103 verts post-renommage. Audit annuel 1.3 désormais complètement vert côté tokens CSS.

**1 décision Grégoire restante (chantier J reliquat)** :
- Label `v2-seuil-fragile` — conservation, atténuation, ou alignement ?

---

## §1quinquies — Chrome unifié LIVRÉ (24 mai 2026 matin)

**Worktree dédié** : `Monitorage_v6-chrome` (créé depuis main `f71f412` le 23 mai soir, mergé FF sur main au commit `cbdf7d7` puis prêt à supprimer).

**1 commit livré** : `cbdf7d7` feat(chrome): refonte chrome unifié (entête + nav + sous-nav responsive). 8 fichiers touchés, +676 / −321 LOC nettes.

**Tag** : `chrome-unifie-2026-05-24` poussé sur origin.

**Bump version** : 99.63 (b0523-1710) → 99.64 (b0524-0548).

### Récapitulatif des 7 étapes du PLAN_chrome_unifie_Labo_Codex.md

| Étape | Statut | Détail |
|---|---|---|
| 1. HTML entête | ✅ | Refonte L3777-3886 : Codex (gauche) / Titre+Meta (centre) / Utilitaires 5 icônes 2 clusters (droite) / Bouton ⋯ mobile. Ligne 2 : sélecteur GC seul sans label. Popover utilitaires mobile (6 items) ajouté en fin de `<header>`. HTML/JS du bouton Codex et son menu intégralement préservés. |
| 2. HTML nav + selects mobile | ✅ | Wrapper `.navigation-boutons` + `<select id="select-nav-mobile">` (7 options) + `<select id="select-sous-nav-mobile" class="u-hide">` ajoutés. data-onglet des 7 boutons inchangés. |
| 3. Refonte CSS | ✅ | styles.css : refonte L863-1229 (zone entête) + adaptation nav primaire L1364+ + media query unique L4715+. Grid 3 colonnes `1fr auto 1fr` sur `.entete-ligne1` pour centrer le titre. Bande de contexte ligne 2 avec fond `rgba(106,172,184,0.10)`. Nav primaire `position: sticky; top: 0; z-index: 100` avec gradient maritime continu (mode sombre + mode clair). `.sous-navigation.vide { display: none }` masquage carré. Breakpoint unique `@media (max-width: 1024px)` : cache utilitaires desktop / montre ⋯, cache `.navigation-boutons` / montre select natif, cache `.sous-navigation` / montre select sous-nav sticky top 60px. Mode clair : overrides pour popover, selects, bouton ⋯. T-A10 pointer:coarse adapté à `.entete-utilitaires .btn-action-header`. Audit zéro-dette : classes mortes `.entete-controles-gauche/droite`, `.entete-ligne2-droite`, `.logo-section`, `.logo-meta`, `.separateur-contexte` retirées + CSS inline dans index.html L3663-3713 retiré. 0 référence orpheline. |
| 4. Logique JS popover + selects | ✅ | Nouveau module `js/chrome-unifie.js` (~200 LOC, IIFE) : `ouvrirPopoverUtilitaires` / `fermerPopoverUtilitaires` avec auto-désattachement défensif des écouteurs si popover caché (corrige bug détecté en tests : `_gererClicGlobal` restait attaché et bloquait les clics utilitaires après une session de tests mobile). `synchroniserSelectNavMobile` (lit `window.sectionActive`) + `regenererSelectSousNav` (peuple depuis `#sous-navigation` à chaque event `sectionAffichee`). Double câblage des selects mobile : via dispatcher `data-on-change` ET via `addEventListener('change')` direct (double sécurité). Inscrit dans `index.html` après `js/main.js` (priorité 8). |
| 5. Migration icônes icons8 filled | ⏸ **REPORTÉ** | Décision Grégoire : faire les icônes plus tard, hors-scope de ce chantier. Les icônes actuelles restent en place. |
| 6. Tests fonctionnels | ✅ | Test 1 desktop (Accueil + navigation + scroll sticky + mode sombre/clair) : PASS. Test simulation Safari Responsive Design Mode iPhone Pro Max 440×956 + custom 1404×956 : PASS après fix défensif chrome-unifie.js. Tests vrai iPad / vrai iPhone : reportés post-déploiement (option A actée — Grégoire teste sur device après push prod). |
| 7. Finalisation | ✅ | Bump 99.64 (b0524-0548), changelog +2 items en tête de Beta 99 (desktop + adaptation iPad/iPhone), BACKLOG +#283 (harmonisation pages à sidebar mobile) +#284 (harmonisation titres de page), SUIVI-BUGS +#121 (bouton fantôme « Charger un codex data » Tirage au sort, pré-existant), commit + merge FF main + tag + push. |

### Bugs détectés pendant les tests et corrigés en session

- **Bug 1** : Selects mobile ne déclenchaient pas `afficherSection` au change (Responsive Mode Safari). Cause : dispatcher `data-on-change` de main.js fonctionne mais protocole d'event dans Responsive Mode possiblement différent. **Fix** : ajout d'un `addEventListener('change')` direct sur les selects dans `chrome-unifie.js` en plus du dispatcher (double sécurité).
- **Bug 2** : Tous les boutons utilitaires header (Bug, Anonym, Thème, Aide, Réglages) ne répondaient plus aux clics souris après quelques tests mobile. Cause : `_gererClicGlobal` (handler ajouté dynamiquement par `ouvrirPopoverUtilitaires`) restait attaché au document même quand le popover était caché — il interceptait silencieusement les clics et appelait `fermerPopoverUtilitaires` (no-op). **Fix** : `_gererClicGlobal` auto-détecte si le popover est caché et se détache immédiatement (garantit aucune interférence avec les clics ailleurs).

### Observations hors-scope logées au backlog (à traiter séparément)

- **BACKLOG #283** : Harmonisation responsive des pages à sidebar en mobile (Productions étudiantes, Grilles de critères, Échelles de performance, Pratiques de notation, Cartouches de rétroaction, Trimestre, etc.) — en mobile <1024px, la zone détails apparaît tronquée. Bug pré-existant (visible aussi en prod main).
- **BACKLOG #284** : Harmonisation de la structure des pages (Conception → Alignement pédagogique et Labo → Tirage au sort n'ont pas de titre h1 ni de sous-titre descriptif, contrairement aux autres pages).
- **SUIVI-BUGS #121** : Bouton fantôme « ← Charger un codex data... » en haut à droite de Labo → Tirage au sort (déplacé / illogique dans ce contexte). Visible aussi en prod, pré-existant.

### À ne pas oublier pour la prochaine session

- **Cleanup post-merge** : `git worktree remove ../Monitorage_v6-chrome` puis `git branch -d cleanup/chrome-unifie` depuis le repo principal.
- **Test sur vrai iPhone après déploiement Netlify** : si bug device-spécifique, hotfix immédiat. Si OK, on peut clôturer définitivement le chantier chrome.
- **Mémoires à créer éventuellement** : pattern « double sécurité dispatcher data-action + addEventListener direct pour les contrôles UI critiques mobile » + pattern « auto-désattachement défensif des écouteurs globaux dynamiques ».

---

## §1sexies — Refonte pratique active + namespacing LIVRÉE (24 mai 2026 fin de matinée)

**Commit unique sur main** : `6f85512` refactor(pratique-active) — 51 fichiers touchés, +700 / −337 LOC. Pas de worktree dédié, commit direct.

**Beta / build** : 99.64 / 0524-1035 (bump build seulement, beta conservée à la demande de Grégoire).

### Phases livrées (résumé)

| Phase | Effet |
|---|---|
| **A** | Type `terminale` explicite dans le formulaire production. `_identifierProductionTerminale` réduit à `find(p => p.type === 'terminale')`. Retrait des fallbacks codés en dur 60/40 dans `calculerDetailsNoteFinale`. Propagation d'un champ `erreur` au rendu profil si config incomplète. |
| **E** | `modalitesEvaluation` déplacée de `CLES_GLOBALES` vers `CLES_NAMESPACEES`. Boot migration `migration_modalites_namespacees_done` (copie global → namespacé). 175 sites migrés. |
| **F** | `pratiquesConfigurables` namespacée pareillement. Boot migration `migration_pratiques_namespacees_done`. 69 sites migrés. Chaque trimestre a sa propre bibliothèque locale. |
| **G1** | Boot migration `migration_pratiqueId_to_configurable_id_done` : remappe les `groupesCours[].pratiqueId` qui contenaient un type général (ex. `"pan-standards"`) vers le premier id configurable du même type dans la bibliothèque locale du trimestre. Idem pour `groupeCoursActif.pratiqueId`. |
| **G2-a** | `_obtenirConfigPortfolioCalcul` lit uniquement la bibliothèque via `obtenirConfigPratiqueActive()`. Plus de fallback sur le snapshot `modalitesEvaluation.configPAN.portfolio`. Si la bibliothèque retourne null, erreur explicite affichée dans le profil. |
| **Wizard fix** | La constante `CLE_PRATIQUES_CONFIGURATIONS = 'pratiquesConfigurables'` dans `pratiques-gestion.js` (67 sites du fichier) écrivait à la clé globale, masquant Phase F. Sites migrés vers `cle('pratiquesConfigurables')`. **C'est ce fix qui a finalement permis à l'édition wizard de se propager au calculateur.** |

### Métadonnées de pratique corrigées (snippet console)

La pratique « PAN-Littérature A25 » avait l'auteur Bruno V. / Cégep Laurendeau (résidu de cloning). Re-attribuée à **Grégoire Bédard / Cégep de Drummondville**. Id renommé `pan-standards-bruno` → `pan-standards-bedard` dans toutes les références (pratiquesConfigurables, groupesCours, modalitesEvaluation, groupeCoursActif).

### Validation arithmétique

- a2025 Bermudez Ambriz, mode « N meilleurs avec N=4 » : **73,5%** (Léa transmis 73,2% en décembre, écart 0,3% = bruit d'arrondi).
- a2025 Bermudez Ambriz, mode « tous, 4 retenus » : 65,9% (vérifié).
- a2025 Bermudez Ambriz, mode « tous, 8 retenus » : 64,2% (vérifié — Formuler 5 HOC compté à 0%).
- Wizard édite → bibliothèque namespacée → calcul → rendu : **chaîne validée bout en bout**.

### Plan détaillé

`plans de travail/PLAN-refonte-note-finale-portfolio.md` — documente les 6 bugs identifiés au début, les décisions architecturales (5 sources de vérité partielles consolidées en 1 canonique au niveau groupe-cours), les phases livrées et restantes.

### Mémoires Claude créées

- `feedback-zero-fallback-arbitraire.md` — principe directeur (aucune valeur métier codée en dur).
- `project-pratique-active-ssot.md` — architecture SSOT de la pratique active (groupesCours[].pratiqueId, bibliothèque namespacée).

### Phases restantes (pour la session suivante)

- **Phase B** — Refonte section Note finale du PDF rétroaction (besoin pédagogique original de la session : `synthese-retroaction-data.js` + `synthese-retroaction-rendu.js`). Décisions actées : toggle manuel Provisoire/Finale dans l'app, pondération par bloc seulement (pas par artefact individuel). Cf. PLAN §3.B.
- **Phase C** — UI profil : cacher le bloc Évaluation terminale quand `terminal.present === false` (`profil-etudiant-sections-affichage.js:2728-2779`).
- **Phase D** — Retrait du champ legacy `mat-variante-calcul` dans le wizard (« Comment construis-tu la note finale ? »). Sa fonction de bascule Portfolio/Par-Objectifs doit migrer vers le sélecteur « Mode de sélection ».
- **G2-b** — Migrer 30 sites restants de `configPAN.portfolio` dans `pratiques.js` (21) + `pratique-pan-standards.js` (9) vers `obtenirConfigPratiqueActive()`. Puis boot migration pour retirer le snapshot du stockage. Pas urgent — le snapshot est neutralisé pour le calculateur principal.

---

## §1septies — Phase B + Phase C + fix race-condition autosave LIVRÉS (24 mai 2026 PM/soir)

**10 commits sur main** (chronologique du PM/soir) : `f4cbea7` → `b46185f`. Tous direct sur main (pas de worktree), tests 103/103 verts à chaque jalon. Beta inchangée 99.64, 10 bumps de build (`0524-1240` → `0524-1640`).

### Récap des chantiers livrés

| # | Commit | Beta/build | Chantier | Effet |
|---|---|---|---|---|
| 1 | `f4cbea7` | 99.64 b0524-1240 | **Phase B** | Refonte data shape `construireNoteProvisoire` (sépare `selection` vs `obligatoires`, retire fallbacks `\|\|65`/`\|\|35`) + refonte rendu `renderRangeeNote` (titre dynamique Provisoire/Finale, formule explicite, doublon éliminé). Toggle « Notes finalisées » dans le wizard pratique (case à cocher dans la carte « Informations de base ») piloté par `configuration.notesFinales`. |
| 2 | `aa9f26d` | 99.64 b0524-1320 | Polish PDF | « Ta note finale de portfolio » → « Ta note finale ». Note chiffrée par artefact `(M, 78 %)`. Échéances obligatoires masquées en mode finale. Rétroaction algorithmique Français écrit lue depuis `evaluation.donneesAlgorithmiques[id].retroaction` (fallback pour critère algo). Bloc résultat algo coloré dans l'app via `_appliquerStyleResultatAlgo` (bande verticale + fond tinté selon `obtenirCouleurNiveau`). |
| 3 | `2da9d9f` | 99.64 b0524-1340 | **Phase C** | Section Note finale du profil étudiant : 3 cas distingués selon `terminal.present` et `estHybride`. En mode hybride sans terminale (cas h2026) : carte gauche = Sélection, carte droite = Obligatoires (retenus + non remis). Pondérations lues depuis `obtenirConfigCategories()`. La carte « Évaluation terminale × 0% » fantôme disparaît. |
| 4 | `41f77cb` | 99.64 b0524-1420 | Titre dynamique + lien réglages | Titre « Note finale de session » ou « Note provisoire de session » selon `configuration.notesFinales` (plus de contradiction « finale (provisoire) »). `calculerDetailsNoteFinale` expose `estFinale` + `pratiqueId`. Bouton « Réglages de la pratique » à droite du titre → `ouvrirReglagesPratique(id)` enchaîne `afficherSection('conception')` + `afficherSousSection('conception-pratiques-notation')` + `chargerPratiquePourModif`. Format lignes aligné sur PDF : `Artefact N (M 75.0%) : Activité`. |
| 5 | `678770d` | 99.64 b0524-1450 | Calcul détaillé + rendu PDF = app | Sous chaque liste (app + PDF) : `(75% + 75% + 75% + 73%) ÷ 4 = 74.5% × 65% = 48.4 pts`. PDF refondu : bloc résultat final EN BAS (était en haut) avec grand chiffre `71.6%` encadré, identique au pattern de l'app. Mention italique « Note provisoire — peut changer… » uniquement en mode provisoire. Titres enrichis : « Sélection (les 4 meilleures sur 8 évaluées) (65%) ». Helper `calculCategorie(items, ponderation, comptenonRemisCommeZero)`. |
| 6 | `6e31fce` | 99.64 b0524-1505 | Ligne compacte critère algo PDF | Pour critères algorithmiques (Français écrit) : « 15 erreurs sur 584 mots → 7.16/20 (35.8 %) » au-dessus du commentaire texte. Data shape ajoute `critere.algo = {erreurs, mots, noteCalculee, pourcentage, ponderation}`. |
| 7 | `28e9d45` | 99.64 b0524-1515 | Non-remis = 0 en mode finale UNIQUEMENT | `_selectionnerArtefactsHybride` reçoit `estFinale` en paramètre. Dénominateur de la moyenne obligatoires : pool total si mode finale (non-remises = 0), sinon nb d'obligatoires évaluées seulement. `calculerDetailsNoteFinale` calcule `estFinale` tôt (avant l'appel au sélecteur). En cours de session (provisoire), les obligatoires non remises restent IGNORÉES. |
| 8 | `a633763` | 99.64 b0524-1605 | Placeholder « 500 » trompeur | 3 occurrences de `placeholder="500"` retirées des champs `eval_mots_*` dans `evaluation-chargement.js`. Grégoire pensait que c'était une vraie valeur saisie → ne tapait pas le nombre → calcul jamais déclenché → PDF vide. Maintenant le champ apparaît vide tant que rien n'est saisi explicitement. |
| 9 | `2259889` | 99.64 b0524-1630 | **Fix race-condition `donneesAlgorithmiques`** | Bug grave : `mots` (et autres valeurs algo) disparaissaient silencieusement après plusieurs allers-retours entre élèves. Cause : `_majEvaluationExistanteAutoSave` faisait `ec.donneesAlgo \|\| evalExistante.donneesAlgo \|\| {}` → en JS `{}` est truthy → snapshot vide écrasait la DB. Fix : test explicite `if (ec.donneesAlgo && Object.keys(ec.donneesAlgo).length > 0)`. |
| 10 | `b46185f` | 99.64 b0524-1640 | **Flag suspension auto-save générique** | Même bug pattern pouvait affecter `criteres` (5 niveaux → 2 tronqués) et autres valeurs. Solution : flag `window._autoSaveSuspendu` activé 500 ms via `_suspendreAutoSaveTemporairement()` au début de chaque entry point de chargement (3 sites : `chargerEvaluationsEtudiant`, `demarrerEvaluationDepuisFichier`, `verifierEtChargerEvaluationExistante`). `_debouncerAutoSave` ignore tant que le flag est actif. Couvre toutes les valeurs sans protection individuelle. |

### Découvertes pédagogiques

- **Le PDF et l'app doivent être structurellement identiques pour la Note finale** : Grégoire ne tolère aucune divergence entre la vue prof (app) et la vue élève (PDF). Même format, mêmes calculs visibles, mêmes données lues depuis les réglages.
- **Le mode finale est un toggle explicite, pas une inférence** : c'est l'enseignant qui décide quand passer en « finalisé ». Tant que le flag `configuration.notesFinales` est `false`, on est en provisoire et les obligatoires non remises ne pénalisent PAS.
- **Le placeholder gris ressemble trop à une vraie valeur saisie** : leçon UX. Pour les champs où la valeur a un impact métier critique (calcul de note), ne PAS mettre de placeholder numérique. Préférer une étiquette texte ou pas de placeholder du tout.
- **Le bug race-condition autosave est probablement répandu** : Grégoire l'a observé d'abord dans evaluation, mais le pattern (reset partiel synchrone + restauration async via dispatchEvent) existe aussi dans `pratiques-gestion.js sauvegarderConfigPratiqueMat`, `trimestre-v2-cours.js`, `productions.js`, etc. Cf. [[project-autosaves-a-auditer]] pour la liste à investiguer.

### Mémoires créées le 24 mai PM

- **`feedback-autosave-race-condition`** : pattern bug + fix défensif (flag + Object.keys check). Indispensable pour les futures sessions qui touchent un auto-save.
- **`project-autosaves-a-auditer`** : liste des auto-saves du projet à auditer + démarche. Référence Grégoire « il y a d'autres cas comme ça, par exemple le radio note chiffrée / niveau de performance ».

### Récupération des données perdues

Les évaluations a2025 qui ont eu leur `donneesAlgorithmiques` écrasé à `{}` ne peuvent pas être restaurées automatiquement. Pour chacune : rouvrir l'évaluation, re-saisir le nombre de mots (les erreurs auto-propagées via les tampons reviennent seules). Action manuelle ponctuelle pour Grégoire avant la remise des notes a2025.

---

## §1octies — Hygiène GitHub + Audit annuel finalisé (25 mai 2026)

**17 commits livrés sur main** entre `861048a` et `c601806`, beta inchangée 99.64 (bumps build seulement `0525-0428` → `0525-0609`). Tests 103/103 verts à chaque commit (hook pré-push toujours OK). 1 worktree éphémère (`cleanup/hygiene-github`) créé pour le bloc Hygiène GitHub initial, mergé FF puis supprimé. Tag `hygiene-github-2026-05-25` poussé.

**Acteurs distincts** : la quasi-totalité des chantiers de remédiation post-audit annuel 2026 (PLAN-COURT-TERME items 1.6 + 4, PLAN-MOYEN-TERME §5.3 + §5.4 + §5.5, Phase 7 transparence publique) a été livrée en une journée. **+9 sous-audits passés au Vert** (5→14 V, cf. bloc « Statuts post-remédiation » dans AUDIT.md). **4 axes audit sur 6 au Vert** (1 Conformité, 4 Soutenabilité, 5 Sécurité, 6 Accessibilité). Reste 2 Jaune (santé code 2, architecture 3) avec chantier résiduel identifié.

### A. Hygiène GitHub (chantier OpenSSF Scorecard §5.3) — 4 commits

- **SECURITY.md** racine (176 l.) — protocole signalement vulnérabilités via GitHub Security Advisories + canal courriel `labo@codexnumeris.org`, SLA solo dev (72 h accusé, 30 j correctif Critique/Élevée), modèle de menace résumé, hors-scope distingué de INCIDENTS.md.
- **.github/dependabot.yml** (54 l.) — surveillance hebdo `tests/` (Vitest+Playwright+jszip) + GitHub Actions. Pas d'`audit/` (untracked sur main).
- **.github/workflows/tests.yml** (65 l.) — Vitest + Playwright WebKit sur ubuntu-latest, node 20, `npx playwright install webkit --with-deps`, upload traces on failure.
- **.github/workflows/codeql.yml** (53 l.) — SAST javascript-typescript hebdo lundi 07:00 UTC + push/PR main, queries `security-and-quality`.
- **.github/BRANCH-PROTECTION.md** (101 l.) — règles à appliquer côté UI GitHub par Grégoire (force-push interdit, history linéaire, status checks tests+codeql, PR review désactivée car solo dev).

**Statut OpenSSF Scorecard impacté** : Security-Policy 0→10, CI-Tests 0→10, SAST 0→10, Dependency-Update-Tool 0→10. Branch-Protection 0→9 (10 si signed commits, optionnel).

**3 labels GitHub créés** (signalé par Dependabot) : `dependencies`, `github-actions`, `tests`.

### B. Fix 7 erreurs CodeQL critiques — 2 commits

Premier scan CodeQL post-livraison a détecté 7 erreurs `js/property-access-on-non-object` dans 2 modules sensibles :

- **`js/reserve-ouvrir.js` L563-583** (alertes #414+#415) — **VRAI BUG LATENT** : renommage incomplet `versements` → `archives`. La variable locale `versements` déclarée mais jamais assignée (assignations ciblaient `archives` variable globale implicite). Symptôme utilisateur : ouvrir une réserve via FSAPI échouait silencieusement (Chrome/Edge ; non détecté Safari Mac/iPad). Fix : 2 renommages.

- **`js/import-export.js` L995-1018** (alertes #409-#413) — faux positif théorique mais code durci : `executerImport()` est async et lit `donneesImportEnAttente` après plusieurs `await`. `fermerModalImport()` peut reset le global pendant l'attente. Fix : snapshot local `const donnees = donneesImportEnAttente;` au début + 7 substitutions. **Pattern défensif standard pour state global mutable lu par fonction async** — à appliquer ailleurs si même motif rencontré.

### C. Port audit annuel complet — 5 commits

- **12 ADRs portés** depuis branche audit/2026-mai (ADR-001 à ADR-012, statut « Acté rétroactivement »). Pointers ajoutés dans `README.md` (section Architecture) et `docs/00-START-HERE.md` (nouvelle section « Décisions architecturales »).

- **ADR-013** rédigé from scratch (180 l.) — **première décision ADR prospective** (post-rétroactive) : dérogation aux `SPDX-License-Identifier` dans les 129 fichiers JS. 4 alternatives écartées documentées (mass-edit complet, SPDX partiel, scancode CI, REUSE compliance). Couverture licence via `LICENSE.md` racine + badges README + ADR-009.

- **AUDIT.md** racine (323 l.) — version publique GitHub adaptée de SUMMARY-institutional.md. Section nouvelle « Remédiation livrée depuis le 14 mai 2026 » + **bloc « Statuts post-remédiation au 25 mai 2026 »** (25 sous-audits cartographiés avec preuve de remédiation, distribution comparée 5 V/10 J/8 R → 14 V/6 J/3 R).

- **libs/VERSIONS.md** (~190 l.) — inventaire 7 librairies vendored : Chart.js 4.4.1, chartjs-plugin-annotation 3.0.1, html2canvas 1.4.1, jsPDF 2.5.1, jsPDF AutoTable 3.8.1, JSZip 3.10.1, PDF.js 3.11.174. Toutes compatibles AGPL v3 + CC BY-NC-SA 4.0. JSZip dual MIT/GPL v3 : option MIT retenue (sans contamination). Procédure de mise à jour + référence ADR-009.

### D. Cleanup zéro-dette : −1249 LOC — 1 commit

Retrait de 4 fichiers obsolètes/orphelins (scope cascade CLAUDE.md) :
- `docs/operations/PROTOCOLE_MISE_A_JOUR_BETA.md` (271 l.) — refs `index.html:14122` inexistantes après migration version.json, BETA_95_CHANGELOG (on est en 99.64), contacts testeurs Bruno/Olivier n'ayant jamais répondu (cf. MEMORY).
- `scripts/update-version.sh` (275 l.) — ne touche pas version.json, hard-code « janvier 2026 » L87.
- `scripts/generer-resolutions.js` (348 l.) — orphelin cascade (seul caller = update-version.sh).
- `resolutions.json` (355 l.) — orphelin cascade (généré mais lu par aucun module js/ ni index.html).

CLAUDE.md couvre déjà la procédure version actuelle (section « Avant chaque commit », version.json source unique + fallback init-inline.js).

### E. Fix 5 warnings CodeQL résiduels — 1 commit

- `js/planification-carte.js` L2167-2168 (alertes #407+408) — retrait 2 self-assignments `conteneur.x = conteneur.x` (vestige refactoring).
- `tests/integration/evaluation-chargement.spec.js` (alertes #405+406) — retrait 2 propriétés dupliquées + 2 expects doublons dans l'objet `surface` (JS écrasait silencieusement la 1re définition, pas de régression mais signal CodeQL valide).
- `js/pratiques.js` L1775 (alerte #404) — **VRAI BUG TYPO** : `pratiqueDefaut === 'pan-standards' || pratiqueDefaut === 'pan-standards'` corrigé en `=== 'standards'` (forme courte) — radio « pan-standards » n'était pas pré-coché si pratiqueDefaut stocké en forme courte.

### F. Triage 6 PRs Dependabot — 2/6 mergées

Premier scan Dependabot a ouvert 6 PRs (1 codeql-action major, 1 playwright minor, 1 vitest 2→4, 3 actions GitHub major). Toutes les 6 CI vertes (Tests + CodeQL + Netlify preview).

Stratégie initiale : `@dependabot squash and merge` posté sur les 6, mais Dependabot a tardé (probablement à cause des 5 nouveaux commits sur main entre-temps + `mergeable=UNKNOWN`). Bascule vers merge manuel `gh pr merge --squash --delete-branch`.

**Mergées** :
- PR #20 codeql-action 3→4 (squash commit `954148a`)
- PR #22 playwright 1.59.1→1.60.0 (squash commit `b6a5a48`)

**Restées ouvertes (à traiter par Grégoire côté UI ou avec scope workflow)** :
- PR #23 vitest 2.1.9→4.1.7 : conflit avec #22 sur lockfile, Dependabot doit rebase.
- PR #18 checkout 4→6, PR #19 upload-artifact 4→7, PR #21 setup-node 4→6 : **scope `workflow` manquant** sur le token gh CLI. Pour débloquer : `gh auth refresh --scopes workflow,repo` dans un terminal natif (interaction navigateur), OU merger directement sur l'UI GitHub.

### G. Dismiss 3 faux positifs CodeQL — via gh API

3 alertes dismissed avec raison documentée :
- #366 `js/missing-await` sur `grilles-bibliotheque.js:103` — `assainirObjet()` est synchrone (`js/import-export.js:224`), CodeQL ne peut pas inférer cross-file en vanilla JS sans modules ES6.
- #358+#359 `js/missing-variable-declaration` sur `js/cartouches.js:407+481` — `cartoucheActuel` est déclarée globalement dans `js/config.js:178` (`let cartoucheActuel = null;`), CodeQL ne voit pas les variables globales cross-file.

**Pattern récurrent en vanilla JS sans modules ES6 : CodeQL produit beaucoup de faux positifs cross-file** — chaque alerte doit être validée contextuellement, pas appliquée mécaniquement.

### Bilan chiffré

- **17 commits** sur main (14 directs + 2 squash Dependabot + 1 merge FF worktree hygiene)
- **+1042 / −1255 = −213 LOC nettes** (gain qualité significatif)
- **103/103 tests verts** à chaque commit, hook pré-push toujours OK
- **7 erreurs CodeQL critiques** fixées + 5 warnings + 3 faux positifs dismissed
- **4 axes audit sur 6** passés au Vert post-remédiation
- **14 ADRs sur main** (12 rétroactifs portés + 1 prospectif neuf + template + README)
- **3 labels GitHub** créés

### Baseline CodeQL résiduel reporté

~80 alertes zéro-dette CodeQL identifiées au scan complet post-v4 (queries `security-and-quality`), à traiter dans un chantier dédié hors scope « corrections conséquences audit » :
- 37 `js/useless-assignment-to-local` — assignations à variables locales jamais utilisées (~1-2 h cleanup module par module)
- 37 `js/unneeded-defensive-code` — guards inutiles type `if (x !== null && x !== undefined && x)` (analyse cas par cas)
- 6 `js/superfluous-trailing-arguments` — arguments passés mais ignorés par signature

Les 5 erreurs `js/property-access-on-non-object` résiduelles dans `js/import-export.js` sont **déjà fixées** par le commit `de0e6a7` ; elles seront automatiquement marquées « fixed » par CodeQL au prochain re-scan complet.

### Mémoires potentielles à créer (signalées pour traitement futur)

- **Pattern défensif « snapshot local pour state global mutable lu par async »** — extrait du fix `js/import-export.js` ce matin. Proche de [[feedback-autosave-race-condition]] mais distinct (le pattern autosave = `{}` truthy fallback ; le pattern snapshot = async + reset entre await). Ces 2 patterns devraient peut-être être consolidés dans une mémoire commune « État global mutable + opérations différées : 2 anti-patterns courants ».
- **Pattern « CodeQL produit beaucoup de faux positifs cross-file en vanilla JS sans modules ES6 »** — observable à long terme, à documenter si plusieurs autres faux positifs émergent.

---

## §1nonies — Suite 25 mai 2026 (matin) — Accompagnement + bug data-action diagnostiqué

**Beta 99.64 → 99.65** suite à 4 commits livrés ce matin (du plus ancien au plus récent) :

| Commit | Sujet | Build |
|---|---|---|
| `2600871` | bump 99.64 → 99.65 | 0525-0720 |
| `11ac55f` | feat(accompagnement) : uniformisation page Observation et dépistage (patron `.option-accompagnement` + pliable `<details>` + repositionnement seuils d'interprétation à l'intérieur de l'option ACP) | 0525-0755 |
| `79fc325` | feat(nav) : migration sous-onglet Accompagnement de Réglages vers Labo (« Outils d'observation » en 1ʳᵉ position dans Labo) | 0525-0823 |
| `f96e3f0` | refactor(labo) : déplacer « Charger un codex data… » dans le menu Codex (retire la barre `.labo-actions-globales`) | 0525-0840 |

`HEAD main` = `f96e3f0`. Tests : non re-exécutés sur ces 4 commits (validations visuelles Grégoire en session pour les 3 premiers ; le 4e est un déplacement HTML sans changement JS).

### Bug rencontré et diagnostiqué : tous les boutons à `data-action` morts

**Symptômes** : btn-codex, X du bandeau « mise à jour », et tous les utilitaires de l'en-tête (Aide, Réglages, bug, anonymisation, thème) insensibles au clic. Aucune erreur console. Toutes les fonctions cible (`window.Codex.toggleMenu`, `window.basculerTheme`, `window.ouvrirModalRapportBug`, `window.fermerBandeauMiseAJour`) existaient et fonctionnaient correctement quand appelées depuis la console. Les onglets principaux de navigation continuaient à fonctionner.

**Diagnostic** : Safari file:// avait gardé en cache une version périmée de `js/main.js`. Dans cette version cachée, le dispatcher `data-action` global (main.js:780, à l'intérieur du handler `DOMContentLoaded`) n'était pas correctement attaché — alors que le fichier sur disque est correct. Aucun signal d'alerte : `init-inline.js` et `version.json` étaient synchros (`BUILD_ID = 0525-0840` partout), donc le mécanisme « Scripts périmés » de `init-inline.js` (commit historique `1ef2800`, 28 mars 2026) ne déclenchait pas — il ne surveille **que** son propre fichier via le snapshot `_SCRIPT_BUILD` (init-inline.js ligne 106), pas les autres scripts.

**Résolution ad hoc** : modifier `main.js` (ajout temporaire de console.log) → Safari recharge la version fraîche → tout fonctionne. Les logs ont ensuite été retirés (aucune trace dans le diff final).

**Inscrit BACKLOG comme #285** : « Cache Safari — Étendre la sentinelle `_SCRIPT_BUILD` aux scripts critiques » — extension du mécanisme historique à `main.js` (et possiblement `codex.js`, `evaluation-chargement.js`) pour combler le trou noir. Approche, coût opérationnel et alternative légère documentés dans le BACKLOG.

### #285 LIVRÉ (25 mai 2026 vers 10h30) — Sentinelle BUILD_ID étendue à `main.js`

Suite à une RÉPÉTITION du bug data-action dans la même session (Cmd+Q + relance Safari n'a pas suffi à recharger `main.js`), décision de livrer #285 immédiatement plutôt que d'attendre. Validation diagnostique préalable sous Chrome : tout fonctionne normalement → confirmation à 100% que le code est sain et que c'est bien un problème de cache Safari file://.

**Implémentation** (3 fichiers touchés, ~30 LOC nettes, alternative légère retenue) :

| Fichier | Modification |
|---|---|
| `js/main.js:19` | Ajout `window._SCRIPT_BUILD_main = '0525-0840';` en haut de l'IIFE, avec commentaire explicatif. |
| `js/init-inline.js:236-253` | Refactor de `chargerVersionJSON()`. Remplace la vérification unique `BUILD_ID !== _SCRIPT_BUILD` par une boucle sur `snapshotsAVerifier = { 'init-inline.js': _SCRIPT_BUILD, 'main.js': window._SCRIPT_BUILD_main }` qui collecte les périmés. Snapshot absent (undefined) = ignoré. Si liste non vide → même flux reload+bandeau qu'avant, avec message identifiant les scripts en cause. |
| `CLAUDE.md` § « Avant chaque commit » | Étape 3 mise à jour (le fallback est dans `js/init-inline.js:103-104`, pas dans `index.html:17166` — info obsolète corrigée gratuitement). Nouvelle étape 4 documentant la consigne de bumper aussi `js/main.js:19`. |

**Tests** : `node --check js/init-inline.js && node --check js/main.js` → OK. Tests Vitest/Playwright non re-exécutés (modification dans des chemins de boot non couverts par la suite ; à valider manuellement par Grégoire au prochain bump de build).

**Coût opérationnel acté** : 3 fichiers à synchroniser à chaque bump de build (au lieu de 2) : `version.json`, `js/init-inline.js:104`, `js/main.js:19`. Documenté dans CLAUDE.md.

#### Patch en cascade (fix du fix v1, ~10h45)

La v1 de la boucle de détection (`if (snap && snap !== BUILD_ID)`) avait un défaut : elle ignorait le cas où `window._SCRIPT_BUILD_main` est `undefined` — ce qui est précisément le cas quand Safari sert une version CACHÉE de `main.js` antérieure à #285 (donc sans `window._SCRIPT_BUILD_main`). Le `undefined && anything` est falsy, donc le snapshot manquant était silencieusement ignoré → le bandeau ne s'affichait pas.

**Observation Grégoire** : `Cmd+Q` + relance Safari ne déclenchait pas le bandeau, mais `Cmd+Option+R` (recharger sans cache) faisait fonctionner l'app. Confirme que Safari servait `main.js` depuis le cache et que la détection était inopérante.

**Fix v2** (livré ~10h45) : retrait du test `snap &&`, ajout d'un fallback descriptif `(snap || 'snapshot manquant')` dans le message du bandeau. Désormais, snapshot absent = considéré périmé. Pour retirer un script de la surveillance, retirer son entrée de l'objet `snapshotsAVerifier` (déclaration explicite). Commentaire de tête mis à jour pour expliciter cette sémantique.

#### Bump build 0525-0840 → 0525-1055 + diagnostic final macOS 26.5 (~10h50-11h10)

Pour déclencher le mécanisme de reload+bandeau (qui repose sur la comparaison `BUILD_ID !== _SCRIPT_BUILD`), un bump de build a été appliqué : `version.json`, `js/init-inline.js:104`, `js/main.js:19` passent à `0525-1055`. Hypothèse : l'ancien `init-inline.js` cache verrait la nouvelle valeur dans `version.json` et déclencherait le reload.

**Constat à la relance Safari** : le bandeau **bleu** de mise à jour s'affiche bien (preuve que `version.json` est lu côté frais), MAIS le bandeau **rouge** « Scripts périmés » NE s'affiche PAS, le X du bandeau bleu est inerte, et btn-codex reste mort. Conclusion : Safari sert encore l'ancien `main.js` depuis son cache file://, et probablement aussi l'ancien `init-inline.js` (sinon le mécanisme aurait dû s'enclencher).

**Test branche `test/etat-pre-accompagnement` (depuis `11ac55f`)** : Grégoire propose un revert temporaire pour vérifier si le bug vient des 3 commits du matin. Branche créée, modifs locales stashées, Cmd+Option+R demandé. **Résultat** : le bug est TOUJOURS présent même sur l'état pré-Accompagnement. **Le bug n'est donc PAS dans le code.**

**Diagnostic final** : Grégoire signale une mise à jour macOS hier (macOS 26.5). Vérification du menu Safari > Développement : l'option historique « Désactiver les caches » a **disparu** dans macOS 26.5. Seul « Vider les caches » (⌥⌘E, action one-shot) subsiste. C'est cohérent avec un changement de comportement Safari volontaire d'Apple, qui rend le cache file:// plus persistant et retire le contrôle utilisateur historique.

**Implications pour le projet** :
- Le mécanisme #285 (sentinelle BUILD_ID multi-fichiers) reste utile structurellement et restera en place — il s'enclenchera correctement quand Safari respectera à nouveau ses propres conventions de cache.
- En attendant un fix Apple : **Chrome devient le navigateur de développement par défaut**. Safari reste utilisable mais nécessite ⌥⌘E (Vider les caches) suivi de Cmd+R à chaque session.
- Le bug `data-action` n'est PAS un bug du code Labo Codex — c'est un symptôme du cache pathologique. Aucune entrée SUIVI-BUGS nécessaire côté Labo Codex (le code fonctionne sous Chrome ET sous Safari après ⌥⌘E).

**Branche `test/etat-pre-accompagnement` conservée localement** (non pushée). À supprimer plus tard une fois que la confiance est rétablie.

### Erreurs Chrome console (relevées en passant)

Pendant le test diagnostic sous Chrome, plusieurs erreurs console ont été relevées :

- `XMLHttpRequest version.json from origin 'null' blocked by CORS` (init-inline.js:223) → **Comportement attendu sous Chrome file://**. Le `try/catch` ligne 220 attrape silencieusement, le code utilise les fallback. Pas un bug.
- `icon-files.svg net::ERR_FILE_NOT_FOUND` → bug **#115** déjà connu (SUIVI-BUGS).
- `x:1 net::ERR_FILE_NOT_FOUND` → **mystérieux**. Aucun `src="x"` ni `href="x"` trouvé par grep dans index.html. À investiguer si reproductible (peut-être un fichier référencé dynamiquement quelque part).
- `Executing inline event handler violates CSP 'script-src self'` (deux fois, reportées à index.html:15591 = `</html>` dernière ligne, donc handler attribué dynamiquement par JS) → **violation réelle de la convention CLAUDE.md « Zero handler inline »**. À investiguer et fixer (un module attribue probablement un `element.onclick = function...` quelque part). À inscrire BACKLOG ou SUIVI-BUGS au choix.
- `Unsafe attempt to load URL file:// from frame with URL file://` → un iframe ou fetch pointant vers index.html lui-même. À identifier.

**Pas de bump de beta** acté pour cette session — seul le snapshot `_SCRIPT_BUILD_main` est bumpé en routine au prochain build officiel.

---

## §2 — Critères de clôture du cycle Cat-B (statut)

Référence : `PLAN-CAT-B-POST-MERGE.md` §5.

| Critère | Description | Statut |
|---|---|---|
| A1 | 13 bugs latents #96-108 fermés | ✅ |
| A2 | 0 fonction cyc > 30 dans le codebase | **13/14 strictement <30 + 1 héritage Cat-B sous N=50** (Mobilisation cyc 48) |
| A3 | 0 doublon dans evaluation.js (3 résolus) | ✅ |
| A4 | 2 codes morts alarmistes retirés | ✅ |
| A5 | `utils-notifications.js` créé + 73 callers migrés | ✅ Track 4 chantier E livré (scope réel ~525 sites dans 39 modules, +3 bugs fix #111-113) |
| A6 | Couplage `travaux-ui.js:4639` documenté ou découplé | ✅ Track 4 chantier F découplé via API + sentinelle Vitest |
| A7 | 3 accès localStorage profil-etudiant migrés | ✅ (audit réel = 2 accès, tous migrés) |
| A8 | 6 tests Playwright rendus DOM ajoutés | ✅ Track 4 chantier I (6 tests, 103/103 verts) |
| A9 | Strings UI alarmistes reformulées + FAQ Indice R retirée + glossaire aligné | ✅ (chantier J) |
| A10 | 20 propositions Cat-B méthode actées | ✅ |
| **Bonus** | Bug latent #110 (`portfolioActif`) fixé | ✅ (commit `47651cb`) |

**10/10 critères pleinement atteints** (A1, A3, A4, A5, A6, A7, A8, A9, A10) + A2 acté avec exception N=50. **Cycle Cat-B post-merge clos pré-AQPC.** Seul chantier H reste optionnel et post-AQPC.

**Objectif pré-AQPC 3 juin largement dépassé** : Track 1 + Track 2 + chantier J livrés + Track 3 phase 2 livrée + chantier F livré + chantier E livré + chantier I livré + chantier J reliquat tokens CSS livré (les 4 derniers initialement post-AQPC, tous anticipés le 21 mai). Codebase quasi-propre côté cyc > 30 (1 héritage acté). Pivot `evaluationEnCours` désormais clos cross-module (sentinelle Vitest). Méthode gelée et publiable. Statut audit annuel 1.3 **complètement Vert** (UI + tokens CSS). Rendus DOM des 5 modules refactorés sous test Playwright. **Le seul chantier ouvert (H) est explicitement optionnel et reporté post-AQPC.**

---


## §3 — Consigne de démarrage pour la prochaine session

> **Session 26 mai PM productive** : cycle chromatique Lots F + I + J + extension livrés (commit ~final 0526-1120). Convention chromatique posée dans le code (orange/vert/cyan/bleu/violet pour les 5 sections de nav, jaune pour assistance/configuration). **Reste du plan migration icônes** : Lots A, B, D, C, E, H, G (~6h30-7h30 cumulés). **AQPC dans 8 jours (3 juin 2026)** — keynote Grégoire prête, filet captures d'écran en plan B (cf. mémoire `project-aqpc-keynote-filet`).

### Priorité 1 — Lot A migration icônes (chantier recommandé, ~45 min)

**Item BACKLOG #286 — Lot A** = bouton aide ✴ (76 occurrences : 49 HTML + 27 JS hors commentaires). 1 mapping unique : `✴` → `icon-info.svg`.

**Plan détaillé** : `plans de travail/PLAN-MIGRATION-ICONES-SVG.md` (§5 ordre restant, §6 estimation par lot, §7 décisions encore pendantes, §9 historique des livraisons F+I+J).

**Pré-requis** : `icon-info.svg` **est déjà présent** dans `icons/` (vérifié au Lot I). À confirmer avec Grégoire qu'il convient esthétiquement (style icons8) ou le remplacer.

**Procédure recommandée** :
1. Confirmer avec Grégoire que `icons/icon-info.svg` actuel convient.
2. Grep `'✴'` et `'✴️'` (avec et sans le variation selector U+FE0F) dans `*.js` et `*.html`.
3. Remplacer le caractère par `<img src="icons/icon-info.svg" alt="Aide" class="btn-aide-icone">` (option simple) OU passer en `<span class="btn-aide-icone ico-info">` avec mask-image base64 si on veut pouvoir colorer (cohérence avec Lots I/J).
4. Tests Vitest + Playwright (103/103 attendu).
5. Test visuel Mac + iPad, modes sombre + clair.
6. Commit + push avec bump build (Beta 99.66 conservée, juste nouveau timestamp).

**Pourquoi Lot A en premier** : 76 sites visibles, 1 mapping unique, gros impact visuel rapide. Valide la méthodologie sur cas simple avant les lots plus lourds. SVG déjà présent, pas de blocage matériel.

### Apprentissages techniques transférables (cycle chromatique 26 mai PM)

À garder en tête pour les Lots A-H, surtout si on bascule des `<img>` en `<span>` avec mask-image :

1. **Pattern `<span>` + mask-image SVG inlinés en base64** = solution éprouvée pour colorer des SVG via CSS. Contourne CORS file:// sur WebKit (essentiel pour Playwright). Cf. styles.css `.ico-wordbook`, `.ico-tune`, `.ico-bug`, `.ico-mask-anon` + les 7 `.ico-X` de la nav principale.

2. **`flex-shrink: 0` OBLIGATOIRE** sur les `<span>` quand le parent est `display: inline-flex` avec content area étroit. Sinon le span est compressé (bug bouton header Lot I : box 6px au lieu de 18×18 voulus). Les `<img>` (replaced elements) ne sont pas concernés.

3. **`background-blend-mode: multiply`** sur 2 couches (couleur opaque + bandeau médiane unie) = fond plein clairement teinté qui n'écrase ni icône ni texte. Pour préserver le gradient du bandeau parent, la couche bandeau dans le bouton actif doit être UNIFORME (`linear-gradient(var(X), var(X))`), pas un mini-gradient désaligné.

4. **Spécificité CSS mode clair** : `.mode-clair .navigation-principale button.actif` (0,3,1) écrase systématiquement les overrides par section sans `.mode-clair` (0,3,0). **Toujours doubler les règles** : une pour mode sombre (par défaut), une pour `.mode-clair`.

5. **Variables sémantiques disponibles** :
   - `--section-conception #ff6f00`, `--section-calendrier #34c759`, `--section-suivi #22d3ee`, `--section-evaluations #38bdf8`, `--section-labo #c084fc`
   - `--icone-aide-config #e8c43a` (jaune assistance/configuration)
   - `--bg-bandeau-mediane #133248 sombre / #09264b clair`

6. **`--nav-actif #e8923a`** est défini mais NON utilisé (phase 1 du Lot J jamais déployée). Candidat à cleanup zéro-dette quand on est confiant qu'on n'y reviendra pas.

### Priorité 2 — Items BACKLOG à plus court terme

Si Grégoire préfère un autre item parmi les 27 ouverts :

- **🟡 #279** Ajouter 3 champs au gabarit production (DESCRIPTION DÉTAILLÉE / FORMAT / REMISE). Bloqueur : Grégoire doit fournir une capture de référence (placement, type d'input). Effort ~1-2 h.
- **🟡 #273** Évaluations démo à partir de vrais travaux d'élèves anonymisés (consentement obtenu plusieurs élèves H2026). 2-3 dossiers complets pour pack démo. Utile aux expérimentateurs post-AQPC. 1-2 séances.
- **🟢 #283 + #284** Harmonisation UX responsive sidebar mobile + titres/sous-titres pages.

### Priorité 3 — Warnings console résiduels (observés matin, non traités)

- Quota localStorage `h2026_indicesCP` dépassé (29 Ko/clé) — défensif db.js bascule IDB+memoryCache.
- Format de séance non reconnu — `SEANCE-2026-05-14-B` × 2 (saisie-presences.js:338).
- `indicesCP non disponible` pour DA 9000176 et 9000040 — fallback recalcul à la volée.

### Étapes de démarrage immédiat

```bash
cd /Users/kuekatsheu/Documents/GitHub/Monitorage_v6
git status                                              # main attendu propre
git log --oneline main -10                              # HEAD attendu : commit final du 26 mai PM (~0526-1120)
git fetch origin

# Vérifier que les tests sont toujours verts
cd tests && npm test                                    # 103/103 attendu (85 Vitest + 18 Playwright)

# Si on attaque Lot A : auditer les sites ✴
cd ..
grep -rn "'✴'\|'✴️'\|\"✴\"\|\"✴️\"\|>✴<\|>✴️<" --include="*.js" --include="*.html" | wc -l
# Attendu : ~76 occurrences réparties HTML/JS
```

### Avant toute écriture de code

1. **Charger les skills** : `Skills pour Claude Code/SKILL_labo_codex.md` (architecture générale).
2. **Charger les mémoires** essentielles :
   - [[project-palette-couleurs-contraintes]] — **À LIRE EN PRIORITÉ** : conventions chromatiques tranchées 26 mai (5 couleurs sections + jaune aide), conflits hex acceptés, limites daltonisme, technique CSS multiply.
   - [[project-aqpc-keynote-filet]] — AQPC 3 juin pilotée par keynote, pas l'app live. Filet captures si l'app plante. Enjeu réel = expérimentateurs post-AQPC.
   - [[feedback-fix-perdu-refactoring-extraction]] — vigilance permanente sur les extractions de sous-modules.
   - [[feedback-zero-fallback-arbitraire]] — principe directeur métier.
   - [[project-pratique-active-ssot]] — architecture pratique active.
3. **Lire le SESSION.md** §0bis (26 mai PM cycle chromatique) + §0ter (26 mai matin). §§ suivants = jours précédents.
4. **Si chantier icônes** : lire `plans de travail/PLAN-MIGRATION-ICONES-SVG.md` AVANT toute action. §5 ordre restant, §6 effort, §7 décisions encore pendantes, §9 historique livraisons.
5. **Si chantier touche aux couleurs** : consulter `design-system.html` §1 (palette) + §8 (navigation) qui documentent les conventions chromatiques. Et `plans de travail/AUDIT-COULEURS-SECTIONS.md` pour les contraintes WCAG/daltonisme.

### Zones protégées — rappel permanent

- `js/config.js` · `js/navigation.js` · `noms_stables.json` — NE PAS MODIFIER sans autorisation explicite.
- **Exception 26 mai PM** : Grégoire a autorisé 2 modifs minimes dans `js/navigation.js` pour le Lot J (classe `section-${nomOnglet}` sur conteneur sous-nav + gestion `.actif` sur boutons header aide/réglages). Documenter si nouvelle modif nécessaire.

### Conventions

- **Pas de bump beta sans demander** Grégoire. Beta 99.66 conservée tant que non bumpée.
- **Hook pré-push vert** obligatoire (Défense J — 85 Vitest verts minimum).
- **Worktree dédié** recommandé pour tout chantier > 1 h. La session 26 mai PM a tout fait sur main (commits courts).
- **Cache Safari file://** : `⌥⌘E` + `Cmd+R` pour rafraîchir. Cache buster `?v=` inopérant. Sur macOS 26.5 le cache est très persistant — privilégier Chrome pour le dev.
- **`window._SCRIPT_BUILD_main`** : synchroniser à CHAQUE bump (cf. CLAUDE.md « Avant chaque commit » étape 4).

### Vérifications de déploiement Grégoire à confirmer

Si Grégoire n'a pas encore déployé la beta 99.66 b0526-1120, les changements PM ne sont pas visibles en production.
- A-t-il déployé la dernière beta (Netlify push automatique sur main) ?
- A-t-il fait `⌥⌘E + Cmd+R` ou `Cmd+Q` complet Safari pour rafraîchir le cache ?
- Les vérifications du §0bis (5 boutons header colorés correctement, sections nav avec leur couleur, sous-nav qui suit la section parente, etc.) sont-elles OK ?

### Décisions Grégoire pendantes (rappel actualisé 26 mai PM)

**Tranchées 26 mai 2026** :
- Teinte jaune palette aide → `#e8c43a`
- Approche technique coloration SVG → `mask-image` CSS avec base64
- Phase 2 Lot J → livrée directement (saut phase 1)
- Suppression PNG legacy Lot F → feu vert
- Calendrier hex → `#34c759` (variante A, conflit DS documenté)
- Bug / anonymisation header → violet Labo / cyan Suivi

**Encore pendantes pour Lots A-H** :
- **#1 Style `icon-info.svg`** : actuel convient ? (Lot A)
- **#2 API `notifications.X`** (Lot C) : refactor `type` ou injection `<img>` ?
- **#3 Pastilles 🟢🟡🔴🟠** (Lot D) : conserver / `●` Unicode / SVG ?
- **#4 Emojis contenu pédagogique popups** : migrer ou laisser ?
- **#5 Forme SVG jetons** (Lot E) : 3 SVG distincts ou 1 SVG paramétrique CSS ?
- **#7 Style SVG tampons SOLO** (Lot H) : ré-applicable autres autocollants ou strict SOLO ?
- **#8 Lot H repli PNG haute densité** si rendu canvas SVG insuffisant iPad ?

**Moyen / long terme** : #279 (capture champs production), #273 (anonymisation pack démo), PRP Cégep (Loi 25), audit auto-saves, convergence audit/2026-mai ↔ main, label v2-seuil-fragile.

### Tonalité Grégoire (rappel CLAUDE.md global)

- Profil HPI-TDA, sessions structurées 90 min max, **une décision principale par session**.
- Pas de superlatifs gratuits, pas de critique performative.
- Signaux d'épuisement : faim oubliée, irritabilité, doute, syndrome d'imposteur. **Si plusieurs convergent : proposer arrêt ou réduction du périmètre, pas plus d'analyse dense.**
- L'AQPC dans 8 jours est une pression réelle mais sa keynote est prête. Ne pas amplifier l'urgence si Grégoire ne le fait pas lui-même.

---

## §3bis — Archives des consignes de démarrage précédentes

> Anciennes consignes — déclassées car cycles clos. Sprint A (livrée 22 mai matin) + Cat-B (clos 21 mai). Conservées comme référence pour les conventions worktree, hook pré-push, etc. **Pour le détail Sprint A : voir `git log SESSION.md` ou commit `ad4d0ec`.** Pour Cat-B, voir ci-dessous.

### Archive Cat-B — Étape 1 — Vérifier l'état du repo (1-2 min, période Cat-B)

```bash
cd /Users/kuekatsheu/Documents/GitHub/Monitorage_v6

git status                              # branche actuelle ?
git log --oneline main -3               # HEAD main attendu pendant Cat-B : `cdd8a23 refactor(cat-b): chantier J reliquat — tokens CSS` ou plus récent
git tag -l "cat-b-*" | sort             # 9 tags attendus :
                                        #   cat-b-track-1-2026-05-21
                                        #   cat-b-track-2-2026-05-21
                                        #   cat-b-track-3-phase1-2026-05-21
                                        #   cat-b-track-3-phase2-2026-05-21
                                        #   cat-b-track-4-gj-2026-05-21
                                        #   cat-b-track-4-chantierF-2026-05-21
                                        #   cat-b-track-4-chantierE-2026-05-21
                                        #   cat-b-track-4-chantierI-2026-05-21
                                        #   cat-b-track-4-chantierJ-tokens-2026-05-21
```

(Consigne Cat-B complète omise — voir versions précédentes de SESSION.md dans `git log` si besoin.)

---

## §4 — Trouvailles méthode session du 21 mai (Cat-B Tracks 1-4 + 3 phase 2)

À considérer pour un futur enrichissement de METHODE-REFACTORING (mais cycle Cat-B = méthode déjà gelée Track 2) :

### Cumul Track 1-4 matin

1. **Fix par retrait > fix par activation** (bug #107) : un dead code qui n'a jamais servi 5 mois en prod doit être RETIRÉ plutôt que ACTIVÉ. Activer peut révéler des side-effects pré-existants.

2. **Extraction agrégée + sous-helpers DOM (§3 étape 4 acté Track 2)** : confirmé 3× dans Track 3 phase 1.

3. **Cascade règles métier → 1 helper par pattern** (`determinerCibleIntervention` 58→<30) : extraire 1 helper par valeur extérieure de la cascade.

4. **Encoding mixte fichiers** (calculerIPB cyc 36) : Edit JSON-based ne supporte pas le re-encoding automatique des escapes Unicode. Fallback Python éprouvé.

### Nouvelles trouvailles Track 3 phase 2 (PM)

5. **Fallback Python systématique pour gros blocs avec escapes Unicode** (`̀-ͯ` dans regex `replace(/[̀-ͯ]/g, '')`) : Edit échoue silencieusement. Pattern Python éprouvé :
   ```python
   python3 - <<'PYEOF'
   path = 'js/file.js'
   with open(path, encoding='utf-8') as f:
       content = f.read()  # ou lines = f.readlines()
   assert old_string in content, 'sentinel'
   content = content.replace(old_string, new_string, 1)
   with open(path, 'w', encoding='utf-8') as f:
       f.write(content)
   PYEOF
   ```

6. **IIFE imbriqués dans template literals ne contribuent pas autant que prévu à ESLint complexity**. Les extraire en helpers n'apporte qu'un gain marginal (~1 cyc par IIFE). Le ROI vient des branches `if/else if`, `||` cascade, `?.` chains, et `?:` ternaires dans le **corps direct de la fonction**.

7. **Templates HTML denses en ternaires (`${nb > 1 ? 's' : ''}` × N) sont difficiles à éclater sans sur-fragmenter**. Le seuil pragmatique N=50 acté Track 2 (gabarit §6.5) trouve son cas d'usage typique : `genererSectionMobilisationEngagement` cyc 48 = héritage légitime (au-delà, on fragmente artificiellement le code de templating).

8. **Bug latent détecté pendant l'extraction = fix immédiat** (Cat-B, préservation LEVÉE). Bug #110 `portfolioActif` → `portfolioActifRapport` détecté en extrayant le 3e IIFE de Performance, fixé dans le même commit. Inscription SUIVI-BUGS Corrigés. Pattern conforme §3 étape 7 conventions Cat-B.

9. **Factorisation cross-fonctions interdite par le scope** : les helpers SRPNF (Forces et défis) du chantier Performance auraient pu être réutilisés par Mobilisation. NE PAS le faire sans validation Grégoire = ce serait un refactor cross-zones hors scope Track 3 phase 2. Si réouverture, créer un sous-module `profil-etudiant-helpers-srpnf.js` à part.

---

## §5 — Historique des révisions de ce SESSION.md

| Date | Modification | Auteur |
|---|---|---|
| 2026-05-25 (fin de journée, chantier « Corrections conséquences audit annuel » LIVRÉ) | Réécriture complète de l'en-tête + ajout §1octies + réécriture §3 (consigne démarrage prochaine session = actions UI Grégoire en priorité 1 puis choix entre chantier zéro-dette CodeQL / #282 / autres). 17 commits livrés sur main : (A) 4 commits hygiène GitHub avec worktree `cleanup/hygiene-github` éphémère merged FF + tag `hygiene-github-2026-05-25` — SECURITY.md (176 l.) + dependabot.yml (54 l.) + workflows tests.yml + codeql.yml (118 l.) + BRANCH-PROTECTION.md (101 l.). (B) 2 commits fix 7 erreurs CodeQL critiques — `reserve-ouvrir.js` (vrai bug latent versements jamais assignés en mode FSAPI) + `import-export.js` (snapshot local async durci). (C) 5 commits port audit annuel sur main — 12 ADRs depuis audit/2026-mai (statut « Acté rétroactivement »), AUDIT.md racine 323 l. (synthèse publique adaptée de SUMMARY-institutional + bloc nouveau « Statuts post-remédiation au 25 mai » avec cartographie 25/25 sous-audits + distribution 5V/10J/8R+2P → 14V/6J/3R+2P), libs/VERSIONS.md 190 l. (inventaire 7 libs vendored : Chart.js 4.4.1 / chartjs-plugin-annotation 3.0.1 / html2canvas 1.4.1 / jsPDF 2.5.1 / jsPDF AutoTable 3.8.1 / JSZip 3.10.1 / PDF.js 3.11.174), ADR-013 prospectif 180 l. (dérogation aux SPDX-License-Identifier dans les 129 fichiers JS). (D) 1 commit cleanup zéro-dette −1249 LOC — retrait PROTOCOLE_MISE_A_JOUR_BETA.md (271 l. obsolète) + update-version.sh (275 l. ne touche pas version.json) + generer-resolutions.js (348 l. orphelin cascade) + resolutions.json (355 l. orphelin cascade). (E) 1 commit fix 5 warnings CodeQL résiduels — planification-carte self-assignment + spec doublons + pratiques typo `'pan-standards' === 'pan-standards'` corrigé en `=== 'standards'`. (F) 2 squash-merges Dependabot — PR #20 codeql-action 3→4 + PR #22 playwright 1.59→1.60 ; 4 PRs restées ouvertes : PR #23 vitest 2→4 (conflit lockfile à rebase) + PR #18/#19/#21 (scope `workflow` manquant sur token gh, à débloquer via `gh auth refresh` ou UI GitHub). (G) 3 alertes CodeQL dismissed via gh API avec raison documentée (faux positifs cross-file en vanilla JS sans modules ES6). Beta inchangée 99.64, bumps build 0525-0428 → 0525-0609. Tests 103/103 verts à chaque commit, hook pré-push toujours OK. CodeQL CI vert post-fix critiques. **Baseline CodeQL résiduel reporté : ~80 alertes zéro-dette** (37 useless-assignment + 37 unneeded-defensive + 6 superfluous-trailing-arguments) à traiter dans un chantier dédié hors scope. CLAUDE.md + docs/00-START-HERE.md MAJ Beta 99.62 → 99.64. **+9 sous-audits passés au Vert** en 11 jours (5 → 14, distribution post-remédiation Jaune dominant). **4 axes sur 6 au Vert** (Conformité 1, Soutenabilité 4, Sécurité 5, Accessibilité 6) ; 2 Jaune résiduels (Santé code 2, Architecture 3) avec chantier identifié. **L'audit annuel et ses corrections conséquences sont LARGEMENT LIVRÉS**, la branche audit/2026-mai reste pour les annexes techniques (rapports détaillés). Convergence globale audit↔main partielle — pas urgent. | Hygiène GitHub + audit annuel finalisé (Claude autonome) |
| 2026-05-24 (fin de journée, Phase B + C + race-condition autosave LIVRÉS) | Réécriture complète de l'en-tête + ajout §1septies + ajout sous-section garde-fous §0 (race-condition autosave + Phase B/C) + réécriture §3 (consigne démarrage prochaine session = REPRISE AUDIT ANNUEL). 10 commits livrés sur main entre 12h40 et 16h40 : `f4cbea7` Phase B refonte PDF Note finale (data shape + rendu + toggle Notes finalisées wizard pratique), `aa9f26d` polish PDF (« Ta note finale », note chiffrée par artefact, échéances obligatoires masquées en mode finale, rétroaction algo lue, bloc résultat algo coloré app), `2da9d9f` Phase C section Note finale profil (3 cas distingués, mode hybride Sélection/Obligatoires), `41f77cb` titre dynamique Provisoire/Finale + bouton « Réglages de la pratique » + format aligné PDF, `678770d` calcul détaillé par catégorie (`(N1+N2)÷N=moy×P%=pts`) + rendu PDF identique app (bloc résultat encadré en bas), `6e31fce` ligne compacte critère algo dans PDF (`15 erreurs sur 584 mots → 7.16/20 (35.8%)`), `28e9d45` obligatoires non remises = 0 EN MODE FINALE UNIQUEMENT (param `estFinale` au sélecteur hybride), `a633763` retrait placeholder « 500 » trompeur (3 occurrences eval_mots_*), `2259889` fix race-condition `donneesAlgorithmiques` perdues (`{}` truthy en JS, fix Object.keys check), `b46185f` flag `_autoSaveSuspendu` 500ms générique au début de 3 entry points de chargement éval (couvre criteres + donneesAlgo + futurs). Beta inchangée 99.64, 10 bumps build `0524-1240`→`0524-1640`. Tests 103/103 verts à chaque jalon. 2 nouvelles mémoires créées : [[feedback-autosave-race-condition]] (pattern bug + fix défensif, à éviter ailleurs) et [[project-autosaves-a-auditer]] (liste des auto-saves suspects du projet à investiguer, notamment radio « note chiffrée / niveau performance » signalé explicitement par Grégoire). §3 entièrement réécrit : priorité 1 = REPRISE AUDIT ANNUEL sur branche `audit/2026-mai` (divergée depuis 12 mai, Grégoire demande explicitement « si on veut que ça finisse un jour »), priorité 2 = audit autres auto-saves, priorité 3 = Phase D + G2-b. | Phase B/C + chasse bug autosave (Claude autonome) |
| 2026-05-24 (matin, chrome unifié LIVRÉ) | Bascule post-livraison du chantier chrome unifié (commit unique `cbdf7d7` sur main via merge FF depuis `cleanup/chrome-unifie`, tag `chrome-unifie-2026-05-24`, bump 99.63 → 99.64 b0524-0548). En-tête réécrit pour refléter livraison. §1quinquies (nouvelle) : récap 7 étapes du plan, 2 bugs détectés et corrigés en session (selects mobile câblage défensif + `_gererClicGlobal` auto-désattachement), 3 observations hors-scope logées (BACKLOG #283 harmonisation pages à sidebar mobile, #284 harmonisation titres de page, SUIVI-BUGS #121 bouton fantôme Tirage au sort). §3 entièrement réécrit : priorité 1 = cleanup worktree + test vrai iPhone post-déploiement Netlify ; priorité 2 = reprise #282 étape 5 (migration `listeCours` finale, ~3 h). Module `js/chrome-unifie.js` créé (200 LOC IIFE) : popover utilitaires + selects mobile + resynchronisation `sectionAffichee`. CSS refonte L863-1229 (grid 3 colonnes pour centrage parfait du titre, bande contexte ligne 2, nav primaire sticky avec gradient maritime continu, sous-nav vide masquée carré, breakpoint unique 1024px). Audit zéro-dette : classes mortes `.entete-controles-gauche/droite`, `.entete-ligne2-droite`, `.logo-section`, `.logo-meta`, `.separateur-contexte` retirées. 8 fichiers touchés, +676 / −321 LOC nettes. Étape 5 (migration icônes icons8 filled) reportée hors-scope par décision Grégoire. | Chrome unifié (Claude autonome) |
| 2026-05-21 (matin) | Identification refactor evaluation TERMINÉ étape 6, archive historique. | Cat-B session (Claude) |
| 2026-05-21 (après-midi) | Réécriture complète pour cycle Cat-B post-merge : §0 garde-fou, §1 récap Tracks 1-4, §2 critères clôture, §3 consigne démarrage prochaine session, §4 trouvailles méthode. | Cat-B session 1 (Claude autonome) |
| 2026-05-21 (PM, post-Track 3 phase 2) | Réécriture complète après livraison Track 3 phase 2 (5 commits + 1 docs PLAN, 38 helpers privés ajoutés, bug #110 fixé, Mobilisation acté héritage Cat-B sous N=50). HEAD main `3fe5165` → `88bcaf1`. Worktrees catb + catb2 supprimés. Garde-fou §0 enrichi (ne pas re-fix #110, ne pas tenter Mobilisation <30 sans validation). §3 consigne démarrage actualisée (priorité Track 4 F/I/E + chantier J reliquat). §4 trouvailles enrichies (Python fallback systématique, IIFE templates ne pèsent pas, ternaires denses = héritage légitime, bug pendant extraction = fix immédiat, factorisation cross-fonctions interdite par scope). | Cat-B Track 3 phase 2 (Claude autonome) |
| 2026-05-21 (soir, post-Track 4 chantier F) | MAJ après livraison Track 4 chantier F (1 commit refactor `6532f75` + 1 commit docs). API `evaluation.demarrerEvaluationDepuisFichier(fichier, opts)` exportée par `evaluation-chargement.js` ; 8 sites d'écriture cross-module éliminés dans travaux-ui.js (1 réassignation + 7 mutations Zone 1 `basculerMode` + Zone 2 `afficherPalettesEval`) ; sentinelle Vitest `tests/unit/sentinelle-evaluation-en-cours.test.js` (3 sub-tests). Tests 89→92/92 verts. Critère A6 atteint. Garde-fou §0 enrichi (ne pas écrire le pivot hors whitelist). §1 Track 4 enrichi (chantier F livré). §2 critères : 7 atteints au lieu de 6 + 2 restants au lieu de 3. §3 étape 6 réordonnée (Track 4 F retiré, I devient priorité 1). | Cat-B Track 4 chantier F (Claude autonome) |
| 2026-05-21 (soir, post-Track 4 chantier E) | MAJ après livraison Track 4 chantier E (6 commits sur la branche `cat-b/track-4-chantier-E`). Consolidation `utils-notifications.js` — **scope réel ~7x plus gros que les 73 annoncés** : ~525 callers migrés dans 39 modules. 0 def, 0 export, 0 wrapper, 0 guard typeof restants ; source unique `window.notifications.{succes, erreur, info}` (textContent immunisé XSS). Sentinelle Vitest stricte `tests/unit/utils-notifications.test.js` verrouille la régression. 3 bugs latents fixés : #111 XSS trimestre.js innerHTML sans echapperHtml (résolu par retrait def), #112 type `'warning'` ignoré en 2e param, #113 shadow local wizard-pratique-v2 1-param. Tests 92→97/97 verts (+5 nouveaux : 4 API + 1 sentinelle stricte). Build refresh 0521-1108 → 0521-1717. Critère A5 atteint. Garde-fou §0 enrichi (ne pas définir `function afficherNotificationX`, ne pas réintroduire guards). §2 critères : 8 atteints au lieu de 7 + 1 restant au lieu de 2 (A8 chantier I). §3 étape 6 réordonnée (chantier E retiré). −469 LOC nettes. | Cat-B Track 4 chantier E (Claude autonome) |
| 2026-05-21 (soir, post-Track 4 chantier I) | MAJ après livraison Track 4 chantier I (1 commit refactor `a16aefa` + 1 commit docs sur la branche `cat-b/track-4-chantier-I`, build 0521-2046). 6 tests Playwright rendus DOM répartis dans 5 fichiers `tests/integration/*-rendu.spec.js` : bilan-reflexif éditeur, productions badge CC (+ vérif XSS E-β), trimestre-v2 carte résumé horaires, profil-etudiant Section Productions par défaut, evaluation palette critères + rétroaction Bilan. Tests 97→103/103 verts (85 Vitest + 18 Playwright). Critère A8 atteint. **10/10 critères Cat-B atteints** (A2 sous exception N=50). Cycle Cat-B clos pré-AQPC. §0 garde-fou inchangé. §1 Track 4 enrichi (chantier I livré). §2 critères : tous 10 atteints. §3 étape 6 réordonnée (chantier I retiré, priorité 1 devient test visuel Grégoire + décisions J reliquat + prep AQPC). Pattern technique éprouvé : `page.evaluate()` + fixtures `db.setSync` + `page.on('dialog')` pour auto-dismiss alert. Convention `*-rendu.spec.js` (rendus DOM) complète `*-chargement.spec.js` (sentinelles d'exports) déjà en place. | Cat-B Track 4 chantier I (Claude autonome) |
| 2026-05-21 (soir, post-Track 4 chantier J reliquat tokens CSS) | MAJ après livraison chantier J reliquat tokens CSS (1 commit, branche `cat-b/track-4-chantier-J-tokens`). Renommage 7 tokens `--risque-{nul,minimal,faible,modere,eleve,tres-eleve,critique}` → `--niveau-attention-*` (mapping 1:1). Scope réel : 97 hits dans 10 fichiers (styles.css 34 + index.html 29 + 8 modules JS 34). L'estimation initiale 480 incluait commentaires + JSON ESLint historiques (préservés intacts). Tests 103/103 verts (aucune régression). Audit annuel 1.3 désormais **complètement Vert** côté tokens CSS. §1 Track 4 enrichi (chantier J reliquat tokens livré). §3 étape 6 : retirer item tokens CSS de la décision pendante (reste seulement label `v2-seuil-fragile`). Pattern technique : substitution `perl -i -pe 's/--risque-/--niveau-attention-/g'` sur liste explicite de fichiers (préserve les rapports historiques). | Cat-B Track 4 chantier J reliquat tokens (Claude autonome) |
| 2026-05-22 (matin, cycle AQPC pré-3-juin) | Bascule du cycle Cat-B (clos) vers le cycle AQPC pré-3-juin. 6 commits livrés sur la branche `aqpc/privacy` (créée depuis main `e50cf61`, mergée FF sur main au commit `1312a6b`) couvrant Phase 1.5 + 2 + 3 + 4 + 5 (sauf 5.1/5.2 délégués ds-update passe 3) + 6.1 + 6.2 du PLAN-COURT-TERME. Documents publics nouveaux : PRIVACY.md (~400 l.), INCIDENTS.md (~250 l.), INFO-ELEVES.md (~175 l.), DEPLOY.md (~315 l.), netlify.toml (consolide _headers). README.md refondu (8 références mortes retirées, double licence AGPL+CC). Refactor R → N (Niveau d'attention) : 49 substitutions dans 8 modules + cohérent avec renommage tokens CSS du chantier J. 4 fonctions code mort alarmiste retirées au total (2 Cat-B Track 1 + 2 AQPC). Audit `rapportsBugArchives` avec seuil 50→20, migration idempotente, alerte UI dans formulaire bug. Phase 5 axe-core : T-A1/T-A2 ARIA + prefers-reduced-motion + prefers-contrast: more + aria-live notifications. Tests Vitest 85/85 verts à chaque commit (hook pré-push). Bump version 99.61 → 99.62 (build 0521-2101 → 0522-0650) à la clôture. Branche `aqpc/privacy` supprimée localement et remotement après merge. §0 garde-fou réécrit (retrait mention 99.62 reverté, ajout decouplerPN + MAX_RAPPORTS 20 + 1.4/1.6 reportés audit/2026-mai). §1 réécrit pour cycle AQPC ; ancien §1 Cat-B déclassé en §1bis archive. Dette explicite documentée : « Direction du risque » UI, « Seuils d'alerte critiques » doc, ~10 références JS au mot « risque » dans commentaires, `_headers` à retirer post-validation deploy. Démarche externe à engager par Grégoire : demande d'avis PRP du Cégep de Drummondville (Loi 25, délai 2-6 semaines). | Cycle AQPC (Claude autonome) |
| 2026-05-22 (matin, post-AQPC, préparation Sprint A) | Mise à jour du relai post-clôture cycle AQPC. Grégoire demande un cycle dédié aux axes Rouge 2 (Santé du code) et 3 (Architecture SSOT) de l'audit annuel. Plan séquencé en 3 sprints A → B → C présenté et validé : Sprint A (1-2 h, MAJ DATA-OWNERSHIP.md + addendum 02-summary delta Cat-B/AQPC, 0 risque applicatif) — priorité immédiate. Sprint B (3-4 h, cartographies 3.1/3.2/3.3) — post-AQPC. Sprint C (5-8 h, Tier 6.5 `modalitesEvaluation` 14 écrivains/47 sites) — été 2026. §3 réécrit pour donner consigne Sprint A complète (11 étapes, livrables explicites, conventions pas-de-code-applicatif). Ancien §3 Cat-B déclassé en §3bis archive (consigne tronquée — référence aux versions précédentes du fichier via `git log`). Header mis à jour : prochaine priorité = Sprint A. Aucun bump version (juste un commit doc + refresh build). | Préparation Sprint A (Claude autonome) |
| 2026-05-22 (matin, cleanup résidus risque) | MAJ après livraison cleanup résidus système risque (1 commit `c697a29` sur branche `cleanup/risque-residus`, mergée FF main puis branche/worktree supprimés). Audit ciblé sur dette §1 SESSION main « ~10 réf JS risque » révèle 99 hits stricts (\brisque) sur 25 fichiers, dont 5 systèmes morts complémentaires aux dettes #1-4 livrées le matin par autre instance : A.1 fonction `genererBadgeRisqueProfil` + export, A.2 `COULEURS.risque`, A.3 `SEUILS_PAR_DEFAUT.risque` (9 niveaux échelle), A.4 6 classes CSS `.badge-risque-*`, A.5 8 classes CSS `.badge-risque-analyse-*`. Sentinelle Vitest mise à jour. Build refresh 0522-0925 → 0522-0945 (pas de bump beta). Tests 85/85 verts. Rebase nécessaire car 11 commits divergents sur origin/main (Sprint A + Phases legacy 95 + dettes #1-4) — conflits BUILD_ID uniquement, résolus en gardant 0522-0945. En-tête §1 mis à jour avec HEAD `c697a29` et chronologie 19 commits depuis `7c30d64`. Sous-section « Cleanup résidus système risque » ajoutée à §1 après « Cleanup Beta 95 legacy étendu ». UI vivante « Direction du risque » (slider + `calculerDirectionRisque`) NON touchée — chantier renommage R → N futur. | Cleanup résidus risque (Claude autonome) |
| 2026-05-22 (matin, cleanup palettes COULEURS + plan Phase 2) | 2 commits sur branche `cleanup/couleurs-phase2plan` mergée FF main. (1) Commit `128ae0c` : retrait 3 palettes mortes `COULEURS.pratiques`, `COULEURS.idme`, `COULEURS.graphiques` du module `js/couleurs.js` (audit cross-codebase confirme 0 caller — seules `indices` et `correlations` restent consommées par correlations-longitudinales.js et graphiques-progression.js). −28 LOC, JSDoc actualisée, return Object.freeze rétréci à 2 entrées. (2) Commit `9940975` : rédaction de `audit/refactoring-prep/PLAN-PHASE2-CASCADE-LEGACY-95.md` (237 lignes) couvrant le chantier successeur des Phases 1+2 legacy 95 — audit préliminaire des 3 modules cours.js/groupe.js/trimestre.js avec call-graph vérifié, ordre d'exécution recommandé (trimestre → cours → groupe), risques identifiés (navigation.js protégé pour appel `initialiserModuleTrimestre`, config.js commentaires à mettre à jour, régressions silencieuses via `window[X]` dynamique). **Découvertes audit modifiant la dette §1 SESSION main** : `ouvrirModalBibliothequeCours` est en fait VIVANTE (bouton `index.html:6815` actif) ; `trimestre.js` contient 3 fonctions vivantes à PRÉSERVER (`genererCalendrierComplet`, `obtenirCalendrierComplet`, `obtenirInfosJour`) — pas un module à retirer en bloc. Build refresh 0522-0945 → 0522-1115. Tests 85/85 verts. En-tête §1 mis à jour : HEAD `9940975`, 22 commits depuis `7c30d64`. Sous-section « Prochaine session — chantier Phase 2 cascade legacy 95 (plan documenté) » remplace l'ancienne version courte. | Cleanup palettes COULEURS + plan Phase 2 (Claude autonome) |
| 2026-05-22 (matin, relai consigne Phase 2) | Bascule du relai vers le chantier Phase 2 cascade legacy 95. En-tête principal réécrit (titre H1, identification, cycle en cours = Phase 2, document maître = PLAN-PHASE2-CASCADE-LEGACY-95.md). HEAD attendu `d1363fc`, build `0522-1115`. §0 enrichi avec sous-section « Garde-fous spécifiques Phase 2 » : 5 règles (`ouvrirModalBibliothequeCours` VIVANTE ; 3 fonctions trimestre.js à préserver ; `navigation.js:250-251` protégé — laisser guard ; doublon `deleteStudent` à clarifier ; test manuel UI obligatoire post-chantier). §3 entièrement réécrit — ancienne consigne Sprint A (livrée) supprimée (retrouvable via `git log SESSION.md`) ; nouvelle consigne pointe vers PLAN-PHASE2 comme document maître et donne 9 étapes (vérif repo, worktree dédié, lecture obligatoire, skills, tests baseline, exécution ordre PLAN-PHASE2 §3, bump version, merge FF push, cleanup + MAJ SESSION). §3bis Cat-B archive renommée « Archives des consignes de démarrage précédentes » (regroupe Sprint A déclassée + Cat-B). Aucune modif code applicatif. | Préparation relai Phase 2 (Claude autonome) |
| 2026-05-22 (fin après-midi, préparation tests manuels Grégoire) | Grégoire a terminé ses dernières évaluations du trimestre et signale disponibilité pour exécuter tous les tests manuels accumulés (6.2 partie 2 + 6.3 partie 2 + test visuel Cat-B chantier E + vérifs post-fixes a11y du 22 mai PM + non-régression bug latent fixé chantier 2.3 + PLAN-COURT-TERME 7.1/7.2). Création du document maître `Retours des testeurs/TESTS-MANUELS-PENDING-2026-05-22.md` (6 sections A-F, ~5-6 h, check-list structurée par section avec cases à cocher + protocoles VoiceOver Mac + iPad Web Inspector + sélecteurs précis). En-tête §1 « Cycle suivant » réécrit : priorité unique = tests manuels (pas de chantier code). §3 entièrement réécrit : Document maître pointé + étapes de démarrage (http-server localhost 8080) + rôle Claude dans la session (accompagnement + reporting dans `audit/reports/06-2-manual.md` + `06-3-ipad.md` + `SUIVI-BUGS.md`) + 3 décisions Grégoire pendantes rappelées (label `v2-seuil-fragile`, convergence audit↔main post-AQPC, demande PRP Cégep). Aucune modif code applicatif. | Préparation tests manuels (Claude autonome) |
| 2026-05-22 (après-midi, T-A10 touch targets + bug fix doubles box-shadow LIVRÉS) | 2 commits sur branche `cleanup/a11y-t-a10-touch-targets` (mergée FF main puis supprimée). `91668ac` corrige une régression introduite par le cherry-pick T-A5 du même jour (`eff9950` avait ajouté `box-shadow: var(--focus-ring)` au début de 7 blocs `:focus` qui avaient déjà un `box-shadow` plus loin → le 2e écrasait le focus-ring) — fusion en `box-shadow: var(--focus-ring), <original>` sur 7 sélecteurs (`.controle-form`, `.cc-meta-ligne input/select`, `.cc-meta-textarea`, `.btn-codex-header`, `.wizard-v2-champ input/textarea/select`, `.travaux-retro-modal .travaux-retro-textarea`, `.travaux-retro-nom-input`). `22914ac` traite T-A10 touch targets Apple HIG / WCAG 2.5.5 : `.btn-codex-header` min-height 36→44px (cas signalé Lighthouse `boundingRect` 44×36) + section `@media (pointer: coarse)` ajoutée en fin de styles.css garantissant `.btn` + `.btn-action-header` min-height 44px et `.btn-icon-header` 32→44 sur tactile (préserve densité desktop). T-A10 délégué initialement ds-update passe 3 mais ds-update n'avait pas de commit dédié — fix appliqué directement sur main avec approche systématique. Sous-audit 6.3 T-A10 passe À-vérifier → Vert côté outils statiques. Validation iPad par Grégoire (tests manuels 6.3 partie 2) nécessaire pour confirmation empirique sur ~237 éléments interactifs. Tests 85/85 Vitest verts. Pas de bump beta. | T-A10 + bug fix régression (Claude autonome) |
| 2026-05-22 (après-midi, portage a11y T-A3 + T-A5 depuis ds-update LIVRÉ) | 3 commits cherry-pickés depuis `ds-update/2026-mai` sur branche `cleanup/a11y-passe3-fixes-mineurs` (mergée FF main puis supprimée). `36a7a81` T-A3 : variables `--texte-muted` + `--gris-clair` ajustées WCAG AA ≥ 4.5:1 dans 3 modes (sombre, clair, print) — styles.css + fallback index.html. `f546215` T-A5 fondation : 4 tokens focus-ring créés dans `:root` (couleur, largeur 3px, offset 2px, composite). `eff9950` T-A5 finition : 22 sites `outline: none` désormais accompagnés d'un `box-shadow: var(--focus-ring)` restorant un focus visible clavier (WCAG 2.1 AA technique G195). Conflits cherry-pick résolus en `git rm` des 3 brouillons `ds-update/passe-2-diff/` + `ds-update/v8-drafts/` qui ne vivent pas sur main. Audit annuel sous-audit 6.1 (Phase 5.1+5.2 PLAN-COURT-TERME) passe Jaune → **Vert** côté outils statiques (T-A3 + T-A5 traités, T-A7 déjà fait Phase 5.3+5.4 AQPC, T-A1+T-A2 fixés 21 mai). Restent : tests manuels 6.2/6.3 par Grégoire + T-A10 touch targets 44px (non couvert par ds-update — chantier séparé ~3-5 h si souhaité). Pas de bump beta. Tests 85/85 Vitest verts. | Portage a11y T-A3+T-A5 (Claude autonome) |
| 2026-05-22 (après-midi, sub-cleanup tableau Réglages → Cours legacy LIVRÉ) | 1 commit `bd37072` sur branche `cleanup/tableau-reglages-cours-legacy` (mergée FF main puis supprimée). Suite directe du chantier 2.1 dont le scope avait explicitement exclu cette chaîne morte (cf. plan PLAN-PHASE2 §8). **cours.js réduit de 1215 → 669 l. (−546 LOC)**. 7 fonctions retirées + 4 exports (`afficherTableauCours`, `obtenirTousLesCoursBibliotheque` orphelin, `obtenirNomPratiqueFallback`, `afficherPratiqueEnLectureSeule`, `dupliquerCours`, `activerCours`, `supprimerCours`). 6 sections delimiters de commentaire orphelines retirées (`AFFICHAGE DU TABLEAU`, `FORMULAIRE D'AJOUT/ÉDITION` trompeur, `⭐ ACTIVATION DU COURS`, `SUPPRESSION`, `🔔 NOTIFICATIONS` vide, `📌 NOTES D'UTILISATION` ~55 l. obsolète). Cleanups annexes : `main.js` event listener `[data-sous-onglet="reglages-cours"]` (−10 l.), `config.js` ligne 274 « 08-cours.js (utilise coursEnEdition) » du JSDoc des modules dépendants. Doublon `supprimerCours` clarifié : faux doublon (cours-entite.js en IIFE isolée exposée via `window.CoursEntite.supprimer` — pas de conflit). Tests 85/85 Vitest verts. En-tête HEAD `bd37072`. §1 : nouvelle sous-section « Sub-cleanup tableau Réglages → Cours legacy LIVRÉ » remplace l'ancienne « Découvertes hors scope » avec bilan cumulé Phase 2 + sub-cleanup = **~−1677 LOC nettes** sur 4 commits. §3 : piste 1 (sub-cleanup) retirée puisque livrée ; renumérotation 2→1, 3→2, 4→3. | Sub-cleanup tableau Réglages → Cours legacy (Claude autonome) |
| 2026-05-22 (après-midi, Phase 2 cascade legacy 95 LIVRÉE) | 3 commits sur branche `cleanup/phase2-cascade-legacy-95` (mergée FF main puis supprimée) : `5ccb306` chantier 2.3 trimestre.js (−563 LOC, 601 → 38 l. ; **bug latent fixé** — exports cassés L583+L586 du commit `6b2da4b` faisaient crasher l'IIFE → `obtenirCalendrierComplet`/`obtenirInfosJour` désormais à nouveau exposés ; `main.js:467-468` retiré ; `navigation.js:250-251` préservé Zone protégée), `dd493cc` chantier 2.1 cours.js (−365 LOC, 1580 → 1215 l. ; `afficherFormCours`/`annulerFormCours`/`sauvegarderCours`/`afficherListeCoursSidebar`/`modifierCours` + 5 exports retirés ; `coursEnEdition` config.js MAJ JSDoc seulement = Zone protégée), `137411c` chantier 2.2 groupe.js (−188 LOC, 1190 → 1002 l. ; `addStudent`/`resetFiltreGroupe`/doublon `deleteStudent` ×2 + 3 exports retirés ; bouton HTML `data-action="resetFiltreGroupe"` retiré du HTML généré par `filtrerParGroupe` ; querySelectors `addStudent` simplifiés dans `modifierEtudiant`). Bilan total : 5 fichiers touchés, **−1124 LOC nettes** (+25 / −1149). Tests 85/85 Vitest verts à chaque jalon. Pas de bump beta (convention §0). §1 sous-section « Prochaine session — chantier Phase 2 (plan documenté) » remplacée par « Chantier Phase 2 cascade legacy 95 — LIVRÉ » avec tableau récap par module + section « Bug latent fixé en cascade » à inscrire SUIVI-BUGS + section « Découvertes hors scope » (tableau Réglages → Cours legacy mort = piste 1 §3). §0 garde-fous Phase 2 remplacés par 3 règles résiduelles. §3 entièrement réécrit avec 4 pistes pour la prochaine session (sub-cleanup tableau cours legacy / reprise audit annuel / prep AQPC / tests manuels Grégoire). En-tête HEAD `137411c`. | Phase 2 cascade legacy 95 (Claude autonome) |
| 2026-05-23 (après-midi, Tests Section B + #282 P1-P4 LIVRÉS) | 2 commits sur main : `04f8d9e` (#282 P1 bandeau « Mode modification » cours + P2 activation explicite cours/GC, build 0523-1435) et `9cf542e` (#282 P3 migration `_migrerListeCoursVersCoursV2()` par tuple naturel + P4 snippet recovery dans BACKLOG, build 0523-1710). Tests Section B (a11y T-A3/T-A5/T-A10) **100 % verts** validés par Grégoire sur Safari Mac modes sombre+clair + simulation iPad. Sections C, D, E, F **reportées** (décision Grégoire en session : « plus important à faire »). Chantier #282 : tous les 4 prérequis P1-P4 désormais livrés, ouvrant la voie à l'étape 5 (migration finale des ~93 sites listeCours dans cours.js/contexte.js/cc-license.js/etc., estimée ~3 h, hors scope cette session). Snippet P4 testé partiellement (copier-coller Safari foireux avec backtick markdown puis caractère invisible — pas critique car Grégoire avait déjà nettoyé ses données le matin via snippet équivalent). Tests 85/85 Vitest verts à chaque commit. Hook pré-commit Défense J : 3 warnings setSync infoCours dans `_persisterCoursV2` / `activerCoursV2` acquittés via `// security-ok`. En-tête HEAD `9cf542e`. §1quater (nouvelle) : récap complet livraison P1-P4 + stratégie étape 5. §0 garde-fous : nouvelle sous-section « Garde-fous #282 P1-P4 livrés » (7 règles). §3 entièrement réécrit pour pointer vers l'étape 5 finale + tests visuels P1+P2 en pré-requis. Mémoire MEMORY.md : nouvelle [[feedback-zero-emoji-strict]] (sélection d'option preview avec emoji ≠ demande explicite). | #282 P1-P4 + Section B (Claude autonome) |
| 2026-05-23 (fin de session, pivot vers chantier chrome unifié) | Grégoire signale que le chantier de la prochaine session sera la **refonte du chrome de l'app** (entête + nav primaire + sous-nav) responsive desktop/iPad/iPhone, et qu'il veut travailler avec le plan **`PLAN_chrome_unifie_Labo_Codex.md`** (872 lignes, rédigé par Claude Cowork le 23 mai matin avec Grégoire — finalisé, à exécuter). 7 étapes structurées : HTML entête (L3777-3886) → HTML nav + select mobile (L3978-4006) → CSS refonte breakpoint 1024px + popover + sticky → JS popover utilitaires `⋯` + synchro selects → migration ~13 icônes vers icons8 filled → tests exhaustifs Mac+iPad+iPhone+a11y → finalisation (bump + changelog). Effort estimé 4-5 h. Zones protégées préservées (config.js, navigation.js, noms_stables.json). API préservée pour ne pas casser `afficherSection()` / `afficherSousSection()`. Gain attendu : 50-70 px de chrome sur desktop, 120-140 px sur iPhone. **#282 étape 5 mis en pause**, à reprendre après le chrome unifié. §3 entièrement réécrit pour pointer vers `PLAN_chrome_unifie_Labo_Codex.md` comme document maître + tableau des 7 étapes + zones protégées rappelées + API à préserver + questions probables. Décisions Grégoire pendantes mises à jour (chrome unifié en tête, #282 étape 5 décalé). PLAN_chrome ajouté au git (anciennement untracked). Pas de bump beta (commit doc-only). | Pivot chrome unifié (Claude autonome) |
