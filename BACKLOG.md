# BACKLOG - Monitorage Pedagogique

> **Pour Claude** : Ce fichier liste les **items ouverts** uniquement. L'historique complet des items livrés (313 items, fév-mai 2026) vit dans `BACKLOG-ARCHIVE.md`.
>
> **Dernière bascule** : 10 juin 2026 (passe de triage Cowork) — 16 items [x] déplacés vers BACKLOG-ARCHIVE.md, dont la réconciliation #303 (clos d'après SESSION.md, resté ouvert ici) et #295 (absorbé par #334). Bascule précédente : 25 mai 2026.
> **État courant** : bêta publique 1.12.1 (build 0611-0441), 11 juin 2026 (1.12.0 = #334 session B import journalisé ; 1.12.1 = fix #144 palettes iPad). 54 items ouverts (53 post-triage du 10 juin + #335).
> **Prochain enchaînement acté (Grégoire, 10 juin)** : clôture #329 (terrain P3+P4 + revue) → **#328 L3 puis L2** (fin de l'implémentation SSOT `modalitesEvaluation`), #332 en candidat de la même passe.
> **Dernier ID utilisé** : **#337** (activer la protection de branche `main` côté GitHub — action UI Grégoire, voir section Sécurité ; créé 11 juin 2026 sur la branche skills sous le n° #335, renuméroté à l'intégration car #335-#336 attribués entre-temps sur main). Avant : **#336** (ouvrir un codex ne purge pas l'espace de travail précédent — doublement des données Safari, constat iPad 11 juin ; purge des blobs/clés orphelins à cadrer avec #334 C). Avant : **#335** (garde-fous import codex inter-appareils — détection de modèle antérieur + trimestre actif non basculé par heuristique de date ; créé 11 juin 2026 après l'incident de restauration : le codex iPad pré-chantier D avait écrasé le modèle consolidé du Mac). Avant : **#334** (chantier import codex iPad — saturation stockage : pré-vol quota, import journalisé, snapshot 3-way haché ; **absorbe #295** ; diagnostic `Rapports/analyse-saturation-import-codex-ipad-2026-06-10.md`, plan en 4 sessions `Rapports/plan-chantier-import-codex-ipad-2026-06-10.md` ; créé 10 juin 2026 via Cowork). Avant : **#333** (export des résultats finaux CSV+PDF — cadrage Cowork complet 10 juin, `plans de travail/PLAN-export-resultats-finaux.md` ; module dédié, PAS import-export.js). Avant : **#332** (chaîne assemblage horaire↔GC : no-op UI + copie pointeur prioritaire sur SSOT dans `obtenirSeancesHoraire` — même philosophie que #328 L2 ; créé 10 juin 2026). Avant : **#331 CLOS 10 juin** (104 fiches orphelines purgées, console one-shot). Avant : **#330 LIVRÉ 10 juin (1.6.4)** (bug assiduité bi-groupes — dénominateur contaminé par les séances de l'autre groupe depuis la consolidation chantier D ; fix code + horaire 00008 réassemblé, sentinelle 5 cas). Avant : **#329** (Voûte Phase 1 — partage de ressources par fichiers signés ; **lot P1 LIVRÉ 10 juin, release 1.7.0, terrain 14/14** — reste revue du format puis lots F/T/P2/P3 ; plan `plans de travail/PLAN-VOUTE-PHASES-1-8.md`). Avant : **#328** (SSOT `modalitesEvaluation` Tier 6.5 — audit dédié + Lot 0 LIVRÉS 10 juin 2026, lots L1→L3 restants ; `Rapports/AUDIT-SSOT-MODALITES-EVALUATION-2026-06-10.md`). Avant : **#327 LIVRÉ 1.6.0** (classement par dossiers transversal aux biblios, cadré 9 juin — cartouches = exception actée). Avant : #326 (axe D — Exploration des pratiques dans le Labo : variantes, parenté, diff ; créé 8 juin 2026 — conception close, **SPEC validée** `plans de travail/SPEC_D_exploration_pratiques.md`). Avant : #325 (carte « Sources et remerciements » dans À propos, créé 7 juin 2026 — demande Grégoire ; + **mise à jour de #302** : contenu des guides `som`/`pan` rédigé et vérifié, prêt à intégrer). Avant : #324 (reprises configurées non consommées — #319 Lot 3). #323 (icônes boutons foncés). #322 (aspect visuel de la carte du Comparateur — RETIRÉ 8 juin 2026 : le double encadrement n'est pas un problème, d'autres pages l'ont). Avant : #321 (option transversale « note différée » / couche 1 PRÉN, créé 6 juin 2026 — conception du modèle DEN). Avant : #320 (répertoires de classement dans les bibliothèques, créé 5 juin 2026 — idée Grégoire émergée de la réflexion Comparateur). Avant : **#319** (refonte ciblée de l'assistant de pratique post-audit, créé 5 juin 2026 — **plan prêt**, décisions Grégoire actées, `plans de travail/PLAN_refonte_assistant_pratique_post-audit.md`). Avant : #318 (Dénotation — lots a/b/c absorbés par #319 Lot 5 ; reste le parcours créable). **#317 LIVRÉ 5 juin (1.1.3)** (lot correctifs wizard — bugs SUIVI-BUGS #131-#135). Avant : #307 (simuler/comparer des pratiques de notation sur les mêmes données — piste émergée 31 mai des tests pratiques, voir section dédiée). #306 (uniformisation page d'assemblage groupe-cours, post-AQPC, créé 30 mai 2026 — plan prêt dans `plans de travail/`). #305 (a11y modale d'aide sans nom accessible, créé 29 mai 2026 soir). #304 = nettoyage terminologique heures-contact (libellés UI faits par le mini-guide). #303 = refactor pratiques SSOT — **Session A livrée (99.80/99.86)** + **Session B (représentations) livrée (4 juin, branche `claude/eager-wozniak-KpaAC`)** ; reste **Session C** (calcul par famille, sur backup). #302 = module guides pédagogiques unifié + guides PAN. #301 = résolution de pratique en consultation (chantier D). #300 = bug `getSync("trimestres")` désync. #299 = balayage références d'onglets périmées (28 mai PM).
> **Session 29 mai (soir)** : chantier E (refonte cours↔période close), mini-guide balises (#304 libellés), **Session A-1** (#303). Beta 99.77 → **99.80**.
> **Présentation AQPC** : 3 juin 2026 (J−8).
> **Pour ajouter un item** : `- [ ] **#XX** Description courte` + sous-puces de contexte. Dernier ID utilisé : **#337**.

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

### Bugs UX et cohérence interface

- [ ] 🔴 **#332** Chaîne d'assemblage horaire ↔ groupe-cours : sauvegarde UI non persistée + copie pointeur prioritaire sur la SSOT — créé 10 juin 2026
  - **Constat 1 (UI, no-op silencieux)** : le réassemblage d'horaire du GC 00008 fait par Grégoire dans l'UI n'a RIEN persisté — ni `groupesCours[].horaireId` (SSOT) ni le pointeur `groupeCoursActif.horaireId`. Écran exact à préciser avec Grégoire au cadrage. Famille connue : no-op silencieux de l'éditeur horaire (cf. note `changerTrimestreActifV2`).
  - **✅ Constat 2 LIVRÉ (11 juin 2026, code)** : `obtenirSeancesHoraire` dérive maintenant le `horaireId` de la SSOT `groupesCours` (par l'id du GC actif) ; la copie `groupeCoursActif.horaireId` ne sert plus que si le GC est INTROUVABLE dans la SSOT (état transitoire), jamais pour la contredire. Test fonctionnel `tests/unit/sentinelle-horaire-ssot-332.test.js` (5 cas, dont la repro exacte de la désync 00008 et la chaîne de fallback intacte).
  - **Reste Constat 1 (UI, no-op silencieux)** : le réassemblage d'horaire du GC 00008 fait dans l'UI n'a RIEN persisté — ni `groupesCours[].horaireId` (SSOT) ni la copie. Écran exact à préciser avec Grégoire au cadrage (repro nécessaire). Famille connue : no-op silencieux de l'éditeur horaire (cf. note `changerTrimestreActifV2`).

- [ ] 🟢 **#321** Option transversale « note différée » (couche 1 PRÉN niveau 1) — créé 6 juin 2026 (conception DEN)
  - **Politique d'affichage/timing** : cacher la note par travail pendant le trimestre pour que la rétroaction passe d'abord (Girouard-Gagné niveau 1 « dissimuler/reporter » ; levier empirique Pulfrey/Butler/Black & Wiliam : la rétroaction n'agit que dissociée de la note).
  - **Transversale** : applicable au-dessus de **n'importe quelle famille** (SOM/STD/SPE/DEN). **Ne change pas la valeur finale** (= celle de la famille sous-jacente) → orthogonale au Comparateur. Distincte de DEN (pas le badge DEN).
  - Entrée prudente vers l'esprit PRÉN. Chantier indépendant de #318 (peut être livré seul, plus simple).

- [ ] 🟢 **#326** Axe D — Exploration des pratiques dans le Labo (variantes, parenté, diff) — **conception close, SPEC validée 8 juin 2026**
  - **Documents** : `plans de travail/SPEC_D_exploration_pratiques.md` (canonique pour l'implémentation) + `plans de travail/NOTE-CONCEPTION-D-comparateur-variantes-parente.md` (historique de la réflexion). Prolonge #307.
  - **Idée** : décliner une pratique « souche » en **variantes d'essai**, les **comparer pour comprendre ce que chaque réglage change** (diff de config + mapping de phrases d'effet), puis **promouvoir** celle qu'on retient. Finalité inchangée (comprendre, jamais recommander).
  - **Architecture d'information (D-12)** : l'exploration vit dans le **Labo** — élargir `Labo › Comparateur de pratiques` en « **Exploration des pratiques** » (arbre + diff + matrice). Création via **assistant condensé** invocable du Labo. Bibliothèque (Conception › Pratiques) et sidebar ne montrent que les pratiques **abouties**.
  - **Modèle de données** : filiation `inspireDe` (existante, CC BY, **permanente**) enrichie d'un `sourceId` pour l'arbre ; flag **`estEssai`** (transitoire, basculé à la promotion ; `statut` déjà pris sur les étudiants). Stockage unique `pratiquesConfigurables`, filtré par `estEssai`.
  - **Découpage validé (6 lots)** : D-0 (modèle `sourceId`+`estEssai`+arbre pur) → D-1 (`diffPratiques` + mapping, **contenu Grégoire**, DEN inclus) → D-2 (sous-section Labo, **renommage `config.js` — aval Grégoire**) → D-3 (dérivation assistant condensé) → D-4 (matrice + diff + DEN non-simulable) → D-5 (hygiène, consomme #320) → D-6 (validation + release `minor`).
  - **PRÉALABLES au code de D** (ordre mutuel libre) : **#320** (répertoires) et **#318** (DEN couche 2 — le diff/mapping doit décrire les réglages DEN). D-0/D-1 (moteur pur) parallélisables avec DEN.
  - **Garde-fous** : exploration **lecture seule** (n'écrit ni pratique, ni note, ni `estEssai`) ; `inspireDe`/`sourceId` jamais effacés (CC BY) ; `config.js`/`navigation.js` = zones protégées (précédent C4) ; `echapperHtml()` + `data-action` + ≥1 test/lot.

- [ ] 🟡 ⚠️ **#282** Migrer `js/cours.js` de la clé legacy `listeCours` vers la clé V2 `cours`
  - **PRIORITÉ HAUTE** actée par Grégoire 23 mai 2026 PM (« il faudra y revenir absolument »).
  - Modal Bibliothèque cours vide en V2 — 10 sites dans cours.js lisent encore `listeCours`.
  - Effort estimé révisé : 5-7 h (scope réel 93 sites dans 15+ fichiers d'après post-mortem du 23 mai matin, tentative revertée).
  - **Prérequis P1-P4 LIVRÉS** : bandeau mode édition, activation explicite, migration tuple naturel, snippet recovery (cf. BACKLOG-ARCHIVE.md pour le post-mortem et le snippet).

- [ ] 🟡 **#328** SSOT `modalitesEvaluation` (Tier 6.5 — violation n°1 de l'audit annuel) — consolidation en 4 lots
  - **Audit dédié LIVRÉ 10 juin 2026** : `Rapports/AUDIT-SSOT-MODALITES-EVALUATION-2026-06-10.md`. Constats : 14 fichiers écrivains (44 sites) / 39 lecteurs (~125 sites) ; la clé est un **miroir non déclaré** de la SSOT pratiques (#303 : config canonique = `pratiquesConfigurables`, pointeur = `groupesCours[].pratiqueId`) + un fourre-tout (intrus horaire et préférences).
  - **✅ Lot 0 LIVRÉ (10 juin 2026, extraction des intrus)** : `dureePeriodeMinutes` → nouvelle clé NS `dureePeriode` (owner `horaire.js`, migration paresseuse non destructive, seed démo adapté + `demo-namespace.js`) ; toggles `afficherSommatif`/`afficherAlternatif` (écriture seule, morts depuis Session C) retirés de `sauvegarderPreferencesV2` et du seed. Sentinelle **ratchet** `tests/unit/sentinelle-ssot-modalites-ecrivains-L0.test.js` (liste d'écrivains autorisés — ne peut que rétrécir). `docs/DATA-OWNERSHIP.md` à jour. **Validation terrain à faire avant release** (durée de période : Réglages → Trimestre, select 50/55/60 min).
  - **✅ Lot 1 LIVRÉ (10 juin 2026, module propriétaire)** — décision Grégoire : module dédié `js/pratiques/modalites-evaluation.js` (patron `denotation-jugements.js`), chargé avec la couche stockage (après `db.js`). API `lire()` (fallback clé nue conservé jusqu'au Lot 3) / `modifier(mutateur)` (RMW centralisé) / `remplacer(objet)` (refuse non-objet). Les 12 écrivains du domaine routés (42 sites → 0 `db.set` direct hors module) ; sentinelle ratchet retaillée à 3 fichiers (module + 2 migrations bornées clé nue) + garde « anciens écrivains restent routés » ; contrat du module : `tests/unit/modalites-evaluation-proprietaire-L1.test.js` (9 cas). Harnais golden master #319 enchaîné sur le module. DATA-OWNERSHIP à jour.
  - **✅ Lot 3 LIVRÉ (11 juin 2026, purge legacy)** : fallbacks de lecture clé nue purgés partout (~57 sites, ~30 fichiers — l'idiome `|| db.getSync('modalitesEvaluation', {})` était généralisé) ; seul lecteur clé nue restant = migration namespacing bornée de `main.js` ; `pratiques/migration-pratiques.js` SUPPRIMÉ (ids legacy résolus à la volée par `normaliserIdPratique`) ; volet clé nue de la migration decouplerPR retiré de `main.js` ; champ legacy `dureePeriodeMinutes` purgé des données au boot par `modalitesEvaluation.purgerLegacy()` (tous trimestres via `enumererTrimestres`, valeur rapatriée dans `dureePeriode` sans écrasement) ; `obtenirDureePeriode()` simplifié (plus de migration paresseuse) ; bug de précédence corrigé au passage dans `rapport-bug.js` (pratiqueActive = objet entier au lieu de `.pratique`). Ratchet rétréci au module seul + sentinelle `sentinelle-ssot-modalites-purge-L3.test.js` (5 cas) + 5 cas `purgerLegacy()` au contrat L1.
  - **Reste L2 — cadré + décisions ACTÉES (11 juin 2026)** : dégonfler le miroir — `pratiqueId`/`pratique`/`approcheEvaluation`/`configPAN.jetons` deviennent DÉRIVÉS de la pratique active. Plan : `plans de travail/PLAN-328-L2-degonfler-miroir.md` (§4 bis : D1 suppression pure partout en deux temps, D2 #301 absorbé — helper à contexte explicite, D3 jetons suivent la config vivante / solde négatif toléré, D4 séquence L2-0 golden masters → L2-a → L2-b1/b2 → L2-c). Risque élevé (touche le calcul) ; terrain H2026 après chaque sous-lot, release minor à la fin.
  - **🗓️ SÉQUENCEMENT ACTÉ (Grégoire, 10 juin 2026, session Cowork)** : terminer L3 puis L2 **immédiatement après la clôture du chantier Voûte/partage #329** (avant-pilote code-complet en 1.11.0 ; reste le terrain P3+P4 et la revue). Ordre interne recommandé par SESSION.md : **L3 d'abord** (petit, moins risqué), puis **L2** (session dédiée, golden master #303 + #319 en garde-fous). Envisager d'y adjoindre **#332** (copie pointeur `horaireId` vs SSOT `groupesCours`) — même patron que L2, SESSION.md le rattache explicitement.

- [ ] 🟢 **#301** Résolution de pratique en **consultation** : namespace du trimestre actif, pas du consulté
  - Découvert 29 mai 2026 (chantier D). `obtenirConfigPratiqueActive()` lit `cle('pratiquesConfigurables')` = namespace du trimestre **actif**, et `obtenirPratiqueActiveGroupeCours()` démarre par `groupeCoursActif`/`infoCours` (globaux). En consultant un trimestre **archivé** (ex. A2025) alors qu'un autre est actif (ex. Été), la note finale dépend du contexte courant.
  - Effet observé : « Note finale non calculable — Pratique active introuvable » sur un profil A2025 en consultation. Contourné en re-sélectionnant le bon groupe-cours.

- [ ] 🟢 **#283** Harmonisation responsive des pages à sidebar en mobile (<1024 px)
  - Pages : Conception (Productions/Grilles/Échelles/Pratiques/Cartouches), Évaluation (Liste), possiblement Calendrier.
  - Bug pré-existant, pas introduit par chrome unifié. Trois options de fix à arbitrer.
  - Lié à #284.

- [ ] 📐 🟢 **#284** Harmonisation de la structure des pages (titres + sous-titres descriptifs manquants)
  - Pages sans titre : Alignement pédagogique (carte mentale), Tirage au sort (Labo).
  - Décision : ajouter h1 + sous-titre 1-ligne partout, OU décider que certaines pages sont délibérément plein écran.

- [ ] 📦 🟡 **#306** Uniformiser la page d'assemblage du groupe-cours (libellés « Créer/Enregistrer » + Trimestre en save explicite)
  - **Origine** : retour testeur Grégoire — incohérence des boutons de la sous-section « Trimestre » (3 modèles de persistance y coexistent).
  - **Plan détaillé prêt** : `plans de travail/PLAN-UNIFORMISATION-ASSEMBLAGE-GROUPE-COURS.md` (3 lots : libellés / save explicite Trimestre / test comportemental). Analyse source : `Rapports/analyse-coherence-assemblage-groupe-cours.md`.
  - **Fenêtre échue (triage 10 juin 2026)** : la contrainte « ne pas remuer avant le 3 juin » (AQPC) est passée — chantier libre. Le Lot 1 (libellés, risque faible) peut passer seul ; le Lot 2 (persistance, risque moyen) à son heure.
  - **Au moment de coder** : revérifier la cartographie (numéros de ligne) — le formulaire cours a été refondu (chantiers C/E, 29 mai) et l'écosystème pratiques touché (A-2, 30 mai).
  - Décision UX ouverte (notée dans le plan) : aligner ou non l'apparition du formulaire Enseignant·e sur « état vide masqué ». Estimation : Lot 1 ~1h, Lot 2 ~2-3h, Lot 3 ~1h.

### Refonte des textes (juin 2026) — chantiers dérivés

> Émergés de la refonte des textes page par page (briefs `refonte-textes-*.md` côté Cowork). Décisions transverses sorties du flux de retouche pure car ce sont de petits refactors, pas du texte.

- [~] 📐 🟡 **#309** Accord en genre pour `obtenirTermeProduction()` — **fondation + Profils/Suivi LIVRÉS (2 juin, build 0602-1607)**
  - **Contexte** : `obtenirTermeProduction(context, maj)` (`profil-etudiant-helpers.js:43`) est la source unique du terme production/artefact. Décision Grégoire (2 juin) : option (a) — étendre le helper avec le genre, router tout le texte visible.
  - **LIVRÉ** : `genreTermeProduction()` (→ `'m'`/`'f'`) + `accordTermeProduction(motCle, n, maj)` avec **table interne de 10 mots** (remis, retenu, evalue, recevable, meilleur, recent, aucun, total, tous, dernier — 4 formes chacun), genre masculin par défaut pour le terme perso (décision Grégoire). 9 tests (`tests/unit/sentinelle-accord-terme-production-2026-06-02.test.js`). Routage : **`profil-etudiant-sections-affichage.js`** (~27 sites + 5 adjectifs pré-existants resté masculins corrigés) et **`tableau-bord-apercu.js`** (3 sites Suivi). Validé terrain par Grégoire (cohérence standards + sommative).
  - **Restes** : fallbacks « Artefact inconnu » (`sections-affichage.js` ~508/517/4069 — cas d'erreur de titre individuel, non routés) ; libellés PAN/SOM (`4219`, dépend de **#311**/§6) ; « Aucune production obligatoire configurée » (conservé, brief E) ; **D2** « Aucun travail soumis ». Autres pages consommant le helper (Liste des étudiant·es : déjà routée ; `liste-evaluations.js` : `pluriel()` déjà en place).
  - **Audit méthode** : la relecture systématique des call-sites après routage a rattrapé 5 adjectifs (« meilleurs/tous/derniers ») laissés au masculin par des routages antérieurs — toujours relire les mots d'accord autour d'un terme déjà routé.

- [ ] 📐 🟢 **#310** Note A/C/P statique de Suivi du groupe — convertir en JS-injecté + dédupliquer
  - **Contexte** : la carte-note `#note-indicateurs` (`index.html` ~7740-7746) est du **HTML statique** : elle ne peut pas appeler `obtenirTermeProduction()` (CSP `script-src 'self'`) donc le terme production/artefact y reste figé, incohérent avec les notes dynamiques des autres pages.
  - **De plus** : cette note **duplique mot pour mot** l'explication A/C/P de `etudiants.js:genererExplicationCalculIndices()` (page Liste des étudiant·es).
  - **À trancher / coder** : (i, recommandé) convertir la note en contenu injecté par JS et **consolider une seule source** partagée par les deux pages (zéro-dette) ; ou (ii) garder statique avec terme en dur (7744 « production », 7746 « artefact »). Voir §A1 du brief `refonte-textes-suivi-groupe.md`.

- [ ] 📐 🟢 **#311** Nom d'affichage des pratiques incohérent
  - **Contexte** : la même pratique est nommée de **trois façons** dans l'UI : « PAN-Standards » (`profil-etudiant-actions.js:187, 192` ; `etudiants.js` note), « PAN (Portfolio à nombre limité) » et « SOM (Sommative provisoire) » (`profil-etudiant-sections-affichage.js:4217`).
  - **À trancher** : choisir **une** forme d'affichage et l'appliquer partout. Lié à la décision déjà prise de **retirer « PAN-Standards »** des notes *explicatives* (la décrire « par portfolio ») — mais les libellés *fonctionnels* qui nomment la pratique active restaient en suspens. Voir §A3 du brief `refonte-textes-profils-individuels.md`.

- [ ] 📐 🟡 **#313** Deux sélecteurs « Production » dans le pipeline d'import — clarifier / dédupliquer
  - **Contexte** : le pipeline d'import (étape Optimisation) expose **deux** selects « Production ». Le **global** (`travaux-ui.js:1683`, `associerProductionGlobale`) écrit `productionId` sur **tous** les fichiers de la file (boucle `forEach`, `~l.2259`). Le **par fichier** (`l.1774`, `changerProductionPipeline(idx)`) n'agit que sur le fichier sélectionné — raccourci né de l'usage pour **corriger une attribution** (équivalent rapide d'« Éditer »). Même donnée (`f.productionId`), portées différentes.
  - **Risque** : le global **écrase silencieusement** les choix par-fichier, et les deux selects peuvent afficher des valeurs **divergentes** → confusion.
  - **Fait le 3 juin (lancement)** : le select par-fichier renommé « Production » → **« Modifier »** (commit `59358856`) pour signaler son rôle de correction, **sans toucher à la logique**.
  - **À trancher post-AQPC** : (1) ajouter une **information dans l'interface** précisant la distinction global ↔ par-fichier ; (2) décider de fusionner, supprimer l'un, ou neutraliser le piège d'écrasement. Modèle cohérent pressenti : **production = globale (1 par lot)**, **étudiant·e = par fichier**. Options analysées le 3 juin (cf. échange de session).

- [ ] 🟡 **#314** Import : la production choisie n'est pas toujours persistée (`productionId` vide → « Non associé » silencieux)
  - **Contexte** : un travail importé en données réelles arrive avec `productionId` **vide** alors qu'il aurait dû être associé à une production → il s'affiche « Non associé » dans la Liste des évaluations. Diagnostic console confirmé le 3 juin (terrain, pas démo) : `Primavera_1234567_…pdf | DA: 2570113 | productionId: (vide)`. L'étudiant·e est bien rattaché·e (DA valide) ; **seule la production manque**. **Échec silencieux** : aucune erreur console.
  - **Piste** : le `productionId` posé par le pipeline (`associerProductionGlobale` / `changerProductionPipeline`, cf. #313) ne survit pas jusqu'au fichier stocké au moment de **confirmer l'import**. À vérifier : la chaîne import → `travauxStockage` persiste-t-elle `productionId` ? Cas particulier des fichiers nommés avec un DA placeholder (1234567) rattachés par **nom** (le rattachement étudiant marche, la production non). Reproduire : importer un fichier, choisir une production dans le pipeline, confirmer, vérifier `productionId` du fichier stocké.
  - **Atténuation déjà livrée (3 juin, commit `f05cbad4`)** : le badge « Non associé » est devenu **cliquable** (ouvre « Propriétés du fichier » pour associer la production) avec tooltip diagnostique. Guide l'utilisateur, mais **ne corrige pas la cause**.
  - **Priorité** : important pour expérimentateurs (flux import → évaluation de base). À investiguer à froid post-AQPC.

- [ ] 🟢 **#315** Bibliothèques — migrer les `alert()`/`confirm()` natifs vers `notifications` + une modale de confirmation réutilisable
  - **Contexte** : audit du 4 juin (refonte des textes des bibliothèques, brief `refonte-textes-bibliotheques.md` §2). ~40 `alert()`/`confirm()` natifs subsistent : `productions-bibliotheque-ui.js` (~26), `planification-bibliotheque.js` (11), `pratiques-bibliotheque.js` (3). `bibliotheque-ui.js` est déjà propre. Les **textes** ont été corrigés en place cette session (pur-texte) ; la migration UX a été volontairement séparée.
  - **Difficulté** : 8 `confirm()` bloquants (suppressions irréversibles : planification 409/438/440 ; productions 276/436/479/517/548) ne peuvent pas devenir des `notifications` non-bloquantes — il faut d'abord une **modale de confirmation async réutilisable** (`Promise<boolean>`). `notifications` est aussi **absent** de `planification-bibliotheque.js` et `productions-bibliotheque-ui.js` (à câbler).
  - **À faire** : (1) concevoir/réutiliser une modale de confirmation async ; (2) migrer les `alert()` informatifs → `notifications.{info,erreur,succes}` ; (3) migrer les `confirm()` → la modale ; (4) retirer les natifs (zéro-dette).

- [ ] 🟢 **#316** Codex — migrer les `alert()`/`prompt()` natifs vers `notifications` + modales maison
  - **Contexte** : audit du 4 juin (refonte des textes Codex, brief `refonte-textes-codex.md` §2). `codex.js` utilise encore des `alert()` (erreurs) et des `prompt()` (saisies) natifs : ~`:1426, 2140, 2167, 2191, 2201`. Les **textes** de progression/notifications ont été corrigés cette session (commit `e501b93`) ; la migration UX est séparée. Même nature que [[#315]] (bibliothèques) — un `prompt()` (saisie) exige en plus une **modale de saisie** maison.
  - **À faire** : migrer `alert()` → `notifications.{erreur,info}` ; `prompt()` → modale de saisie ; retirer les natifs (zéro-dette). Mutualiser la modale de confirmation/saisie avec #315.

### Fonctionnalités à compléter

- [ ] 🟢 **#333** Export des résultats finaux (CSV + PDF) — créé 10 juin 2026, **cadrage Cowork complet**, implémentation non démarrée
  - **Plan canonique** : `plans de travail/PLAN-export-resultats-finaux.md`. Demande Grégoire : exporter les résultats finaux (archives personnelles + bulletin individuel étudiant) en présentant la pratique en vigueur et la construction de la note.
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

- [ ] 🟢 **#240** Tampon visuel pour jetons (Délai, Reprise, Reprise ciblée) sur les travaux annotés
  - Cliquer sur le mot du jeton → curseur tampon → appose « JETON DE DÉLAI/REPRISE/REPRISE CIBLÉE » en rouge majuscule.
  - Une fois tamponné, checkbox du jeton se coche auto. Même mécanisme que les tampons existants. PDF montre clairement le jeton appliqué.

- [ ] 🟢 **#18** Tooltips d'aide au survol — déploiement progressif par zone (chantier continu)
  - Mécanisme : `data-tooltip="cle"` + moteur `tooltips.js` + base `tooltips-contenu.js`.
  - **Complété** : En-tête (10), Réglages Trimestre (29), Préférences (12), Dépistage (14), Données (14), Évaluations (84 clés actives au 13 mai 2026).
  - **Reste** : Planification, Présences, Construction de la note, Tableau de bord, Boîte à outils, Aide.

- [ ] 📦 **#2** Guide PDF pour utilisateurs — reformulé 11 mai 2026
  - Décision : ne PAS produire un guide générique. À fusionner avec le matériel pédagogique de la cohorte CoP (8 rencontres sept 2026 → avril 2027, voir `docs/CALENDRIER.md` §8.3).
  - Version « papier » pour AQPC peut être dérivée de `docs/securite/SECURITE-POUR-ENSEIGNANTS.md` (à écrire post-Défense E).

- [ ] 🟡 **#299** Balayage des références d'onglets périmées dans les textes d'aide (« Réglages → X », « onglet Contexte/Structure »)
  - **Origine** : audit onboarding 28 mai 2026 PM (signalé par Grégoire sur capture iPad). La nav a été renommée/réorganisée : ancien « Réglages » éclaté entre **Cadre** (id interne `calendrier` — trimestre/cours/groupe/horaire), **Conception** (grilles, échelles, pratiques, cartouches) et **Réglages** résiduel (Préférences/Données/À propos, hors barre principale). « Contexte » et « Structure » sont des noms d'onglets encore antérieurs.
  - **Déjà corrigé (onboarding, même session)** : visite guidée `js/accompagnement.js` étapes 0+1 (« Réglages » → « Cadre » + fix `correspond()` `contexte-` → `calendrier-`) ; aides hover `js/accompagnement-contenu-hover.js` (`nav-conception` « Structure » → « Conception », `nav-calendrier` « Contexte » → « Cadre »). Texte d'accueil `js/accueil.js` déjà à jour.
  - **Reste à faire** : ~30 occurrences dispersées « Réglages → X » dans le reste du code, la plupart pointant en réalité vers **Conception** ou **Cadre**. Fichiers concernés repérés à l'audit : `wizard-pratique-v2.js` (l. 425, 723, 871, 959 — « Réglages → Ensembles d'objectifs / Pratique de notation / Critères d'évaluation »), `profil-etudiant-diagnostics.js` (l. 484), `profil-etudiant-calculs.js` (l. 613, 766, 857), `profil-etudiant-sections-affichage.js` (l. 1587, 3831), `cartouches.js` (l. 1199 — « Réglages → Grilles de critères »), `etudiants.js` (l. 425), `graphiques-progression.js` (l. 3967 — « Réglages › Productions »), `snapshots.js` (l. 859), `evaluation-sauvegarde.js` (l. 293), `codex-data.js` (l. 405), `import-export.js` (l. 1444), `interpretation-config.js`, `statistiques.js`, etc.
  - **Méthode** : pour chaque occurrence, déterminer la destination réelle (Cadre / Conception / Réglages résiduel) et corriger le libellé. Distinguer les vraies références « Réglages » résiduelles (Préférences/Données/À propos — toujours valides : `securite-prefs.js`, `init-inline.js` « À propos », `reserve-reglages.js`, `accompagnement-contenu-popup.js:1357` « À propos ») qui ne doivent PAS être touchées.
  - **Titres tour guidé — tranché et livré 28 mai PM** : étape 2 « Structure » → « Conception », étape 4 « Tableau de bord » → « Suivi » (Grégoire a choisi d'aligner sur les noms d'onglets).
  - **Effort estimé** : 1-2 h.

### Conception pédagogique et architecture des pratiques (chantiers Cowork 29 mai)

- [ ] 🟢 **#302** Intégration des guides « som » et « pan » (contenu rédigé + vérifié 6-7 juin) — **module déjà livré**
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

- [ ] 🟢 **#325** Carte « Sources et remerciements » dans la page À propos — créé 7 juin 2026
  - **Origine** : demande Grégoire — rendre compte du travail des sources qui ont nourri les logiques de notation et les guides (blogues *Grading for Growth* et *Pratiques alternatives de notation*, ouvrages, CSÉ).
  - **Contenu prêt à coller** : `Plan Accompagnement/CONTENU_apropos_sources-remerciements.md` (carte HTML, style maison `carte`/`carte-titre-bleu` ; + variante avec liste nominative des ouvrages).
  - **Consignes** :
    1. `index.html`, section `#reglages-a-propos` (~l. 9901) — insérer la carte **après « Technologies »** (juste avant le `</div>` de fin de sous-section, ~l. 10014).
    2. Classes réutilisées (**aucun CSS nouveau**) ; liens `target="_blank" rel="noopener noreferrer"` ; contenu statique (CSP OK).
    3. **URL vérifiées (web, 7 juin)** : `gradingforgrowth.com` ; CoP PAN → `aqpc.qc.ca/fr/cop-pratiques_notation`.
    4. Tester clair/sombre + iPad. Commit en fil pédagogique. Bump `patch`.
  - **Décisions Grégoire** : registre « remerciement + sources » ; nommage mixte (blogues + personnes clés, CoP créditée collectivement) ; étendue minimale dans la carte (détail nominatif déjà au bas des guides) ; **garde-fou anti-sur-attribution** en dernière ligne (« s'inspire de… ne les représente pas, toute erreur d'interprétation m'appartient »).
  - **À confirmer (Grégoire)** : lien CoP (page AQPC vs récits `eductive.ca`) ; carte minimale vs variante nominative.

- [ ] 🟢 **#307** Simuler / comparer des pratiques de notation sur les mêmes données (profil élève)
  - **Origine** : tests pratiques du 31 mai (rapports #126-128). En changeant la pratique active du groupe-cours, le panneau « Note finale de session » du profil recalcule sur les **mêmes artefacts** → même élève, notes différentes selon la pratique (capté : PAN-SDT-Litt H26 hybride **73,8 %**, Testd-SOM portfolio 4-meilleurs **75,8 %**, Testc-SDT portfolio 7-meilleurs **73,1 %**). Grégoire : « fonction formidable… simuler d'autres pratiques et les comparer. C'est une bonne piste. »
  - **Vision** : transformer ce comportement émergent en **outil délibéré** — sélecteur de pratique(s) à simuler dans le profil, vue côte-à-côte des notes finales par pratique, sans changer la pratique réellement assignée au groupe-cours (simulation non destructive).
  - **Pré-requis** : **Session C de #303** (calcul par famille) — aujourd'hui seule la famille PAN-Standards (portfolio) calcule dans le profil ; SOM/SPE tombent en « non calculable » (désormais expliqué, cf. #128 / `_diagnostiquerNoteNonCalculable`). La comparaison n'a de sens que quand les 3 familles calculent.
  - **Acquis 31 mai (briques déjà posées)** : nom de la pratique active affiché dans le panneau (#127) ; message diagnostique distinguant « famille pas encore branchée » de « config à corriger » (#128). Post-AQPC.
  - **🔓 PRÉ-REQUIS LEVÉ (triage 10 juin 2026)** : #303 Session C consolidée sur main le 5 juin (« #307 DÉBLOQUÉ » acté dans SESSION.md) ; `calculerDetailsNoteFinale(da, pratiqueIdDemande = null)` paramétrable vérifié (`profil-etudiant-actions.js:411`). L'item est prêt à démarrer selon la SPEC.
  - **✅ SPEC RÉDIGÉE ET VALIDÉE (4 juin, Cowork)** : `plans de travail/SPEC_simulation_pratiques_307.md` (copiée dans le repo le 4 juin ; original de rédaction dans le dossier Cowork). Décisions actées : note finale + décomposition ; profil individuel d'abord (vue groupe = phase 2) ; bibliothèque du groupe-cours, 2 simulées max ; éphémère + export CSV. **⚠️ Contrat supplémentaire imposé à la Session C (condition de faisabilité)** : le calcul doit lire `this.config` de l'instance, PAS le SSOT global `modalitesEvaluation` (vérifié 4 juin : `pratique-configurable.js:199` et `pratique-pan-standards.js:69/696` lisent le global dans `calculerPerformance` — c'est la cause du comportement émergent) ; `calculerDetailsNoteFinale(da, pratiqueId = null)` paramétrable.

- [ ] 🟢 **#304** Nettoyage terminologique interne « heures-contact » → « heure d'enseignement »
  - **✅ Libellés UI faits (mini-guide « balises du cours », beta 99.79, commit `8f23964`)** : « Heures-contact attendues » → « Heures d'enseignement » + « Total d'heures en classe » → « Total d'heures d'enseignement » (`index.html`). Reste : identifiants techniques `v2-heuresContact`, fonction `proposerHeuresContactDepuisPonderation`, commentaires « heures-contact » de `js/trimestre-v2-cours.js`, doc `docs/ANALYSE-conformite-RREC-heures-contact.md`.
  - Justification : l'OQLF (Grand dictionnaire terminologique) **déconseille** « heure-contact » (calque de *contact hour*) au profit de « heure d'enseignement ».
  - Lié au chantier A conformité RREC + à l'ambiguïté **période (50-55 min) vs heure** à trancher (compter exigence et réalisé dans la même unité, idéalement en périodes). Réf. `Plan Accompagnement/SPEC_mini-guide_cours_balises.md` §2 et §5.

### Cohérence visuelle UI

- [ ] 🟢 **#297** Dette technique : duplication des règles CSS entre `<style>` inline d'index.html et styles.css
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

- [ ] 🟡 **#298** Révision de PRIVACY.md — alignement sur la posture «ouverture publique par défaut» et recadrage du référentiel Loi 25
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

- [ ] 🟡 **#291** Workflow de résolution de doublons dans les bibliothèques (grilles, cartouches, échelles, productions, pratiques)
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
  - **Documents de référence** : diagnostic complet `Rapports/analyse-saturation-import-codex-ipad-2026-06-10.md` (révisé v2 après contre-audit) ; plan d'implémentation séquencé `Rapports/plan-chantier-import-codex-ipad-2026-06-10.md`. **Absorbe #295** (la session A le livre et le ferme).
  - **Contexte** : échec rapporté pendant l'import d'un codex ~1 Go sur iPad au disque presque plein. Cause : quota WebKit proportionnel à l'espace libre + aucune vérification préalable + échecs partiellement silencieux (blobs « ignorés ») + double rétention du dataset (snapshot 3-way intégral en IDB et en memoryCache à chaque boot).
  - **4 sessions livrables séparément** (détail, lignes de code, risques et tests dans le plan) :
    - **A** — pré-vol `navigator.storage.estimate()` (réutilise `estimerQuota()` existant de travaux-stockage.js) + `persist()` au bon moment + refus avec message actionnable + avertissement « le ZIP source reste dans Fichiers ». Règle le cas rapporté. Version minor.
    - **B** — import journalisé : compteurs de blobs ignorés/refusés, bilan honnête (« Import terminé — incomplet » au lieu de « Codex chargé ! »), anti-spam notifications dans `stockerBlob`. Décision actée : pas de rollback (échec dur en phase données, tolérance journalisée en phase blobs). Version minor.
    - **C** — snapshot 3-way remplacé par un index de hachés SHA-256 (`codex-snapshot-hash-v1`) : `_analyserFusion` n'utilise jamais les valeurs de l'ancêtre, seulement présence + égalité JSON (audit exhaustif des call-sites dans le plan). Élimine la duplication IDB + RAM sans toucher db.js. **Session la plus sensible (fusion 3-way)** — suite Vitest dédiée exigée. Version minor.
    - **D** — harmonisation `db.set`/`setSync` (seuil IDB-first unique), décision documentée : **pas d'éviction memoryCache possible** (608 call-sites `getSync`, relecture IDB synchrone impossible) — règle à consigner dans `docs/DATA-OWNERSHIP.md`. Version patch.
  - **Hors périmètre assumé** : pic RAM transitoire de JSZip (~2,5-3 Go pour 1 Go de codex) — décompression en flux (`DecompressionStream`) = chantier futur distinct (piste 4 du rapport). Le jetsam iPad reste possible sur import géant même après ce chantier.
  - **À recueillir en parallèle (testeur)** : `navigator.storage.estimate()` sur l'appareil, espace libre exact, onglet rechargé vs import « terminé » incohérent.

- [ ] ⚠️ **#335** Garde-fous import codex inter-appareils — divergence de modèle de données et trimestre actif basculé — créé 11 juin 2026 (incident réel)
  - **Incident du 11 juin (Mac, 1.12.1)** : l'import du codex iPad (10 juin, test terrain #334 B) a remplacé silencieusement le modèle consolidé du chantier D (29 mai) par le modèle ancien de l'iPad — la migration console one-shot n'avait jamais été exécutée sur l'iPad. Symptôme : 11 productions au `coursId` orphelin (`COURS1766455789356`), liste des évaluations entièrement « Non associé », sélecteur Production vide. Résolu par restauration d'un codex Mac antérieur à l'import (aucun changement de code).
  - **Volet 1 — garde de version de modèle** : l'import devrait détecter un codex porteur d'un modèle antérieur (ex. : marqueur de migration dans le package, ou heuristique « ids estampillés vs COURS_* ») et avertir AVANT d'écraser ; alternative de fond : rendre les migrations one-shot re-exécutables au boot (idempotentes), pour qu'un appareil en retard se réconcilie tout seul. À cadrer avec les sessions C/D de #334.
  - **Volet 2 — trimestre actif non consenti** : après la restauration, l'app a ouvert sur Été 2026. Cause : `corrigerTrimestresMultiplesActifs` (trimestres.js) tranche les multi-actifs par la date du jour (`sessionDepuisMois` : mai-juillet → É) et PERSISTE ce choix — l'intention de l'utilisateur (H2026, déclarée dans le codex importé) est écrasée par une heuristique de calendrier. Privilégier le trimestre actif du codex importé, ou demander.
  - **Trace connexe** : avertissements console `Format de séance non reconnu : SEANCE-2026-05-14-B, groupe: ""` ×3 (saisie-presences.js:338) observés après restauration — à examiner dans la passe #332 (famille assemblage horaire↔GC).
  - **MàJ 11 juin matin** : iPad réaligné sur le modèle consolidé (import du codex Mac restauré, bilan B : 371/372 fichiers, 1 seul > seuil 20 Mo) — le risque immédiat est purgé pour les deux appareils de Grégoire. Les garde-fous (volets 1 et 2) restent à implémenter pour les expérimentateurs.

- [ ] ⚠️ **#336** Ouvrir un codex ne purge pas l'espace de travail précédent — les données Safari doublent — créé 11 juin 2026 (constat terrain iPad : 2,5 Go « Documents et données » après import d'un codex ~1 Go)
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

- [ ] 🟡 **#296** Audit catégoriel des items `'Labo Codex'` dans les seed + migration vers `'Demo Labo Codex'`
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

- [ ] 🟡 **#273** Évaluations démo basées sur de vrais travaux d'élèves anonymisés
  - Consentement obtenu de plusieurs élèves H2026. Travaux à anonymiser avant intégration au pack démo.
  - Périmètre : 2-3 dossiers complets (annotation Apple Pencil + évaluation grille + rétroaction structurée).
  - Préfixe `PROD_DEMO_` obligatoire (#86 : `PROD_` seul matche les vraies productions).
  - **Visée double** : valider flux bout-en-bout + servir d'exemples concrets aux nouveaux utilisateurs (AQPC 3 juin et après).

- [ ] 🟢 **#274** Produire des cartes mentales démo pour le matériel pédagogique (été 2026)
  - 2-3 cartes complètes couvrant différentes disciplines. Utile pour la cohorte CoP (Rencontre 5 « Aligner sa pratique », janvier 2027).
  - Période cible : été 2026 (préparation pendant la phase expérimentateurs juin-août).

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

- [ ] ⚠️ **#337** Activer la protection de branche `main` dans les réglages GitHub — créé 11 juin 2026 (n° #335 sur la branche skills, renuméroté à l'intégration)
  - **Action manuelle (UI GitHub, ~2 min)** : `Settings → Branches → Add branch protection rule`, pattern `main`. La CI existe et tourne déjà (workflows `tests.yml` + `codeql.yml`, 248+ runs verts), **mais rien n'empêche actuellement un commit rouge d'atterrir sur `main`** : `main` est `protected: false`.
  - **À cocher** : *Require status checks to pass before merging* → ajouter `Vitest + Playwright (WebKit)` et `Analyse CodeQL` ; décocher *Allow force pushes* et *Allow deletions*. Laisser *Require a pull request before merging* **décoché** (workflow solo dev).
  - **Procédure détaillée déjà rédigée** : `.github/BRANCH-PROTECTION.md` (à suivre tel quel).
  - **Pourquoi pas Claude** : réglage d'administration du dépôt, pas du code — seul Grégoire peut l'activer. À faire sur Mac.

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
