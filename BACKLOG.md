# BACKLOG - Monitorage Pedagogique

> **Pour Claude** : Ce fichier liste les **items ouverts** uniquement. L'historique complet des items livrés (313 items, fév-mai 2026) vit dans `BACKLOG-ARCHIVE.md`.
>
> **Dernière bascule** : 25 mai 2026 fin de journée — extraction des items livrés vers BACKLOG-ARCHIVE.md.
> **État courant** : Beta 99.66 (Build 0526-0503), HEAD main `4df4f21`. 28 items ouverts (session 26 mai matin : 3 items #278/#280/#281 livrés + 3 bugs testeurs résolus + 1 item #286 ajouté).
> **Dernier ID utilisé** : **#326** (axe D — Exploration des pratiques dans le Labo : variantes, parenté, diff ; créé 8 juin 2026 — conception close, **SPEC validée** `plans de travail/SPEC_D_exploration_pratiques.md`). Avant : #325 (carte « Sources et remerciements » dans À propos, créé 7 juin 2026 — demande Grégoire ; + **mise à jour de #302** : contenu des guides `som`/`pan` rédigé et vérifié, prêt à intégrer). Avant : #324 (reprises configurées non consommées — #319 Lot 3). #323 (icônes boutons foncés). #322 (aspect visuel de la carte du Comparateur — RETIRÉ 8 juin 2026 : le double encadrement n'est pas un problème, d'autres pages l'ont). Avant : #321 (option transversale « note différée » / couche 1 PRÉN, créé 6 juin 2026 — conception du modèle DEN). Avant : #320 (répertoires de classement dans les bibliothèques, créé 5 juin 2026 — idée Grégoire émergée de la réflexion Comparateur). Avant : **#319** (refonte ciblée de l'assistant de pratique post-audit, créé 5 juin 2026 — **plan prêt**, décisions Grégoire actées, `plans de travail/PLAN_refonte_assistant_pratique_post-audit.md`). Avant : #318 (Dénotation — lots a/b/c absorbés par #319 Lot 5 ; reste le parcours créable). **#317 LIVRÉ 5 juin (1.1.3)** (lot correctifs wizard — bugs SUIVI-BUGS #131-#135). Avant : #307 (simuler/comparer des pratiques de notation sur les mêmes données — piste émergée 31 mai des tests pratiques, voir section dédiée). #306 (uniformisation page d'assemblage groupe-cours, post-AQPC, créé 30 mai 2026 — plan prêt dans `plans de travail/`). #305 (a11y modale d'aide sans nom accessible, créé 29 mai 2026 soir). #304 = nettoyage terminologique heures-contact (libellés UI faits par le mini-guide). #303 = refactor pratiques SSOT — **Session A livrée (99.80/99.86)** + **Session B (représentations) livrée (4 juin, branche `claude/eager-wozniak-KpaAC`)** ; reste **Session C** (calcul par famille, sur backup). #302 = module guides pédagogiques unifié + guides PAN. #301 = résolution de pratique en consultation (chantier D). #300 = bug `getSync("trimestres")` désync. #299 = balayage références d'onglets périmées (28 mai PM).
> **Session 29 mai (soir)** : chantier E (refonte cours↔période close), mini-guide balises (#304 libellés), **Session A-1** (#303). Beta 99.77 → **99.80**.
> **Présentation AQPC** : 3 juin 2026 (J−8).
> **Pour ajouter un item** : `- [ ] **#XX** Description courte` + sous-puces de contexte. Dernier ID utilisé : **#285** (livré).

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

- [x] 🟡 ⚠️ **#317** Lot correctifs wizard de pratique (bugs #131-#135 de l'audit assistant) — ✅ LIVRÉ 1.1.3 (commits `6fa6bbd7` + clôture `a80bbdf5`)
  - **Origine** : audit de l'assistant de configuration (session Cowork du 5 juin, lecture intégrale de `wizard-pratique-v2.js`). Rapport complet : `AUDIT-assistant-configuration.md` (dossier Cowork « Simulation de pratiques » — à copier dans le repo quand les recommandations seront validées). Détail technique de chaque bug : **SUIVI-BUGS #131-#135** (autonomes, lignes exactes).
  - **Périmètre du lot (correctifs purs, aucune décision requise)** : #131 (`afficherEtapeV2` inexistant — fix 1 identifiant), #132 (round-trip édition perd la config portfolio + params objectifs — **le plus important**, test sentinelle round-trip requis), #133 (récap affiche les valeurs Primo au lieu des réponses saisies), #134 (`calculerNbEtapes` désync), #135 (alert() natif, couleurs en dur du récap, échappement nom).
  - **EXCLU du lot (décisions Grégoire en attente, recommandations a1-a11 de l'audit)** : purge ou réactivation du code mort `mode-configuration` (sélecteur Expert/Exploration inatteignable — son `precedent()` pointe vers `'type-pratique'` qui n'existe plus) et `config-reprises` (inatteignable → reprises sommative non configurables) ; voie rapide expert ; défaut reprises artefacts « Illimitées » → « Limitées » ; garde-fou nbObjectifs >15 ; inversion classification/infos-base ; écran d'entrée à deux portes (bibliothèque) ; mini-exemple de calcul au récap ; réassurance « ta pratique active n'est pas modifiée ». **Ne pas purger le code mort avant ces décisions** — il contient des morceaux réutilisables.
  - **Avant de commencer** : trier le working tree (module guides non commité, reliquats `codex.js`/`reserve.js`, 5 commits refonte Aide non poussés, réserve #126 pratiques Test-*) pour ne pas mélanger les chantiers dans les commits. Versionnage : `patch`.
  - Estimation : #131 ~15 min, #132 ~1h30 avec test, #133 ~45 min (+ décision d'affichage), #134 ~30 min, #135 ~1h. Total ~4h.
  - **✅ BLOC B LIVRÉ (5 juin 2026, working tree, NON commité)** : #131 (identifiant `afficherEtapeWizardV2`), #132 (round-trip portfolio + objectifs restaurés, sentinelle `tests/unit/sentinelle-wizard-roundtrip-317.test.js` 9 cas), #134 (`calculerNbEtapes` dérive du graphe `obtenirEtapeSuivante`), #135a/b/c (alert→`notifications.erreur`, récap diagnostic sorti des styles inline + couleurs alignées au design system SOM=orange/STD=bleu/SPE=vert, nom échappé). **206 Vitest verts.** **#133 FAIT** (décision A — le wizard prime : récap + écriture lisent les réponses saisies, plus la priorité Primo `modalitesEvaluation` ; `modalites` conservé pour les catégories hybrides ; sentinelle source). **LOT #317 COMPLET (5/5 bugs).** **Validation terrain Safari restante** (rafraîchissement grille démo #131, notification #135a, récap 2 modes #135b, round-trip d'édition #132, valeurs wizard respectées #133) avant bump `patch` + commit. **DEN sorti du lot → #318.**

- [x] 🟡 ⚠️ **#319** Refonte ciblée de l'assistant de pratique (post-audit) — ✅ LIVRÉ 1.2.0 (6 lots, commits `58ed760e`→`18841d22`)
  - **Plan détaillé** : `plans de travail/PLAN_refonte_assistant_pratique_post-audit.md` (6 lots, ~12-16 h, golden master, bump `minor` au Lot 6). Audit source versé : `Rapports/AUDIT-assistant-configuration-2026-06-05.md`.
  - **Décisions actées (5 juin)** : refonte ciblée DANS l'architecture déclarative (pas de réécriture) ; voie rapide = lien « Je sais ce que je veux » sur Q1 ; inversion classification↔infos-base ; écran d'entrée à deux portes (modèle bibliothèque vs décrire) ; Dénotation = minimal+fondations (lots a/b/c de #318 absorbés ; parcours créable DEN reste dans #318).
  - **Prérequis** : #317 livré ✅ (1.1.3, sentinelle round-trip). Lot 1 (canonicalisation vocabulaire interne + purge `mode-configuration`/`config-reprises`) est le socle de tout.
  - **Coordination** : Lot 4 (exemple réel au récap) utilise `simulerIndices` — un chiffre, PAS la vue du futur Comparateur de pratiques (réflexion Cowork en cours, `NOTE-COWORK-comparateur-pratiques.md`).

- [x] 🟢 **#323** Icônes sur boutons foncés — contraste insuffisant — ✅ LIVRÉ (commit `b066ccc2`, corbeille `.btn-supprimer` ; steppers OK via `color-scheme`, rien à corriger)
  - **Origine** : terrain (7 juin, assistant SPE « Table des forfaits / Types de productions »). Les icônes des boutons foncés (corbeille des boutons Supprimer rouge foncé, flèches des steppers `input[type=number]`) sont peu lisibles. Probablement icône sombre/monochrome héritée au lieu d'une teinte claire ou de `currentColor` aligné sur la couleur de texte du bouton.
  - **Périmètre** : `styles.css` — icônes des boutons d'action (corbeille `--danger`/rouge, steppers numériques). Viser WCAG AA (≥ 3:1 pour éléments graphiques) ; vérifier les 2 modes. Aucun changement fonctionnel.

- [x] 🟢 **#318** Famille « Dénotation » (DEN) — ✅ LIVRÉ 1.3.0 (couche 2, DEN-0→4, commits `73ad3d71`→`f1b655b9`). Réserve documentée : note DEN via `calculerPerformance`, pas le chemin procédural `calculerDetailsNoteFinale` (non bloquant)
  - **SPEC couche 2** : `plans de travail/SPEC_DEN_couche2.md` (cadrage validé 8 juin — **mode « éliminée » d'abord**, **garde « cibles atteintes » par cible** ; note saisie ancrée sur la suggestion holistique existante). Découpage 6 lots (DEN-0 modèle/`jugementsDenotation` namespacée → DEN-1 moteur `_calculerPerformanceDenotation` sur `case 'jugement_global'` + helper suggestion partagé → DEN-2 UI saisie profil → DEN-3 parcours création assistant → DEN-4 diagnostic non-simulable + doc → DEN-5 release `minor`). **Préalable au code de l'axe D (#326)** ; indépendant de #320. Modèle conceptuel : `NOTE-COWORK-modele-DEN.md`.
  - **Lots a/b/c (reconnaissance + badge + carte « à venir ») absorbés par #319 (Lot 5).** Reste ici la **couche 2 = DEN-proper** : un mécanisme = **garde « cibles atteintes »** (réutilise les objectifs STD existants) → débloque une **note finale saisie** (jugement) + **suggestion holistique optionnelle** (mode/médiane/moyenne IDME, ancrage anti-biais Dyer). Deux modes : **réduite** (réussi-échoué sur épreuves + différenciation) et **éliminée** (jugement narratif → note). DEN abandonne la fonction de **tri**, garde la **certification** (RREC 60/59) — **jamais « pas de chiffre »**.
  - **Non simulable** (jugement saisi) → hors Comparateur phase 1, créable dans l'assistant.
  - **Taxonomie** : badge « PAN » gardé pour l'UI mais DEN = PRÉN académiquement (documenter : registre + skill §2 bis ✅ fait + guide PAN à venir).
  - **Garde-fou** : ne pas vendre DEN comme un bien universel (Girouard-Gagné : certains étudiants déstabilisés par l'absence de repères). Conception pédagogique liée au guide PAN.

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

- [ ] 🟢 **#320** Répertoires de classement dans les bibliothèques (pratiques, échelles, grilles…)
  - **Origine** : idée Grégoire (5 juin 2026, réflexion Comparateur — `plans de travail/NOTE-COWORK-comparateur-pratiques.md` q.7). L'utilisateur stocke ses essais de pratiques dans la bibliothèque ; il devrait pouvoir **créer des répertoires** pour classer ce qu'il veut — ses propres hypothèses, les pratiques reçues de collègues, etc. « Même chose dans toutes les bibliothèques d'ailleurs. »
  - **Périmètre à cadrer** : transversal aux bibliothèques (pratiques de notation d'abord ; échelles, grilles, cartouches ensuite ?). Attention aux collections globales partagées — charger `SKILL_integrite_globaux.md` au cadrage (le classement ne doit jamais filtrer par flag, toujours par identité de la source).
  - **Lien** : le sélecteur de candidates du Comparateur bénéficiera du classement sans en dépendre (aucune dépendance dure).
  - **Origine** : décision Grégoire 5 juin 2026 — sortie du lot #317/#135b pour ne pas introduire de code mort.
  - **Constat** : le récap de l'assistant couvre SOM/STD/SPE mais **pas DEN**. Le registre connaît DEN (`js/pratiques/pratique-registre.js:73` → `denotation { code 'DEN', couleurVar '--den-violet', famille 'PAN' }`, normalisation `pan-denotation → denotation` `:42`). Mais `deduireTypePratique` (`wizard-pratique-v2.js`) ne produit jamais `denotation` → un badge DEN serait inatteignable (code mort). La Dénotation est « à venir » (Aide).
  - **Périmètre** : (a) `deduireTypePratique` reconnaît la Dénotation ; (b) entrée `denotation` dans `typeBadges` + classe `wizard-v2-recap-diagnostic--den` (couleur `--den-violet`, déjà câblée par le `--recap-couleur` du #135b) ; (c) à terme, parcours de création DEN dans l'assistant. **Minimum** : l'édition d'une pratique DEN existante affiche « DEN Dénotation » au lieu de « Indéterminé ». Versionnage : `minor` (famille créable) ou `patch` (affichage à l'édition seul).

- [x] 🟡 **#308** RÉSOLU (2 juin 2026, terrain) — P à 0 % sur Suivi gr. 00008 = **assemblage pratique↔groupe-cours erroné**, PAS le mode comparatif
  - **Cause réelle** : le groupe-cours 00008 (601-101 H2026) avait pour pratique active « Testb-SOM-31mai » (pratique de **test** SOM liée à Été 2026, héritée des tests du volet B le 31 mai — cf. réserve #126), au lieu de sa vraie pratique **PAN-SDT-Litt H26** (`pratique-1768910384608`, celle de gr. 00002 qui calculait correctement). Le calcul de performance lit `modalitesEvaluation` global (= config de la pratique active) → `PratiquePANStandards.calculerPerformance` sortait 0. **Le moteur de calcul est sain** : gr. 00002 affichait P=60 %.
  - **Correction** : réassignation de PAN-SDT-Litt H26 au groupe-cours via « Appliquer au cours actif » (data, **sans code**). P recalculé correctement. Méthode de diagnostic décisive : comparer un groupe qui marche (00002) vs cassé (00008).
  - **Le diagnostic initial (mode comparatif) était erroné** : ni le mode comparatif ni les libellés codés en dur ne causaient le 0 %. Le calcul générique `calculerPerformancePAN` donnait 0.76 sur les mêmes données — confirmant que les données étaient bonnes et le contexte de pratique mauvais.
  - **Travail de code livré quand même (amélioration, build 0602-1513)** : `afficherMetriquesGlobales` suit désormais la **pratique active** au lieu de forcer PAN (`determinerModeAffichageTableauBord`, testée) ; libellés de barres « Performance (P) » nus hors mode comparatif (plus de « — alternatif » trompeur) ; 2 sites `!== false`→`=== true` harmonisés (`etudiants.js:864-865`, `profil-etudiant-sections-affichage.js:3805-3806`). 7 tests sentinelle (`tests/unit/sentinelle-mode-affichage-tableau-bord-2026-06-02.test.js`).
  - **Observation laissée (non bloquante)** : depuis #224, le chemin `indicesCP` (`portfolio.js:646`) n'a plus de fallback générique `calculerPerformancePAN` quand `pratique.calculerPerformance` rend null/0 → une pratique PAN **mal configurée** affiche 0 sans repli (masque la mauvaise config plutôt que de la signaler). Le vrai chantier de calcul par famille reste **#303 Session C (post-AQPC)**. Retrait complet du mode comparatif = chantier distinct (`project-mode-comparatif-som-pan-a-retirer`).

- [x] **#303 Session C — RETRAIT DU MODE COMPARATIF (3b+3c+3d) — LIVRÉ 4 juin 2026** (branche `claude/eager-wozniak-KpaAC`, PR #25, build `0604-1326`, 175 Vitest verts). Mode comparatif **entièrement retiré** : neutralisation à la source (3b), code mort affichages/import-export/CSS (3c), write-side `pratiques.js`/`pratique-registre.js` (3d). Affichages **validés terrain par Grégoire** ; feu vert donné pour 3d.
  - **Reste à valider avant clôture** : flux Réglages → Pratique de notation (sauvegarde/chargement d'une pratique, modifié en 3d) sur Mac+iPad. Données `affichageTableauBord` persistées laissées inertes (pas de migration destructive).
  - ⚠️ **NE PAS confondre** avec le vrai chantier **#303 Session C = calcul par famille** (voir #307), qui reste à faire.

- [ ] 🟡 ⚠️ **#282** Migrer `js/cours.js` de la clé legacy `listeCours` vers la clé V2 `cours`
  - **PRIORITÉ HAUTE** actée par Grégoire 23 mai 2026 PM (« il faudra y revenir absolument »).
  - Modal Bibliothèque cours vide en V2 — 10 sites dans cours.js lisent encore `listeCours`.
  - Effort estimé révisé : 5-7 h (scope réel 93 sites dans 15+ fichiers d'après post-mortem du 23 mai matin, tentative revertée).
  - **Prérequis P1-P4 LIVRÉS** : bandeau mode édition, activation explicite, migration tuple naturel, snippet recovery (cf. BACKLOG-ARCHIVE.md pour le post-mortem et le snippet).

- [ ] 🟡 **#300** Bug `getSync("trimestres")` — désync localStorage↔IDB
  - Découvert 29 mai 2026 (chantier D). `db.getSync("trimestres")` rend par moments 4 objets aux `.id` **vides** (`map(t=>t.id).join(",")` → `",,,"`), alors que `db.get("trimestres")` (async/IDB) rend la bonne structure.
  - **Risque** : tout code qui énumère les trimestres via `getSync` (ou `t.id` issu de getSync) pour bâtir des clés `{t.id}_{suffixe}` travaille sur des ids vides → données introuvables / écritures mal placées.
  - Piste : pourquoi `trimestres` part en localStorage amputé (cf. `db.js` `_prechargerDepuisIDB`/`syncToLocalStorageCache`, quota Safari file://) ; forcer lecture async ou re-sync au boot. Distinct du pattern autosave race-condition (ici = lecture). Cf. mémoire `project-bug-getsync-trimestres-desync`.

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
  - **Post-AQPC** : le Lot 2 bascule le modèle de persistance du trimestre (risque moyen) — ne pas remuer avant le 3 juin. Le Lot 1 (libellés, risque faible, ne touche pas la persistance) pourrait passer seul si besoin.
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

- [ ] 🟢 **#303** Refactor des pratiques de notation → registre `IPratique` comme source unique (SSOT)
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

- [ ] 🟢 **#307** Simuler / comparer des pratiques de notation sur les mêmes données (profil élève)
  - **Origine** : tests pratiques du 31 mai (rapports #126-128). En changeant la pratique active du groupe-cours, le panneau « Note finale de session » du profil recalcule sur les **mêmes artefacts** → même élève, notes différentes selon la pratique (capté : PAN-SDT-Litt H26 hybride **73,8 %**, Testd-SOM portfolio 4-meilleurs **75,8 %**, Testc-SDT portfolio 7-meilleurs **73,1 %**). Grégoire : « fonction formidable… simuler d'autres pratiques et les comparer. C'est une bonne piste. »
  - **Vision** : transformer ce comportement émergent en **outil délibéré** — sélecteur de pratique(s) à simuler dans le profil, vue côte-à-côte des notes finales par pratique, sans changer la pratique réellement assignée au groupe-cours (simulation non destructive).
  - **Pré-requis** : **Session C de #303** (calcul par famille) — aujourd'hui seule la famille PAN-Standards (portfolio) calcule dans le profil ; SOM/SPE tombent en « non calculable » (désormais expliqué, cf. #128 / `_diagnostiquerNoteNonCalculable`). La comparaison n'a de sens que quand les 3 familles calculent.
  - **Acquis 31 mai (briques déjà posées)** : nom de la pratique active affiché dans le panneau (#127) ; message diagnostique distinguant « famille pas encore branchée » de « config à corriger » (#128). Post-AQPC.
  - **✅ SPEC RÉDIGÉE ET VALIDÉE (4 juin, Cowork)** : `plans de travail/SPEC_simulation_pratiques_307.md` (copiée dans le repo le 4 juin ; original de rédaction dans le dossier Cowork). Décisions actées : note finale + décomposition ; profil individuel d'abord (vue groupe = phase 2) ; bibliothèque du groupe-cours, 2 simulées max ; éphémère + export CSV. **⚠️ Contrat supplémentaire imposé à la Session C (condition de faisabilité)** : le calcul doit lire `this.config` de l'instance, PAS le SSOT global `modalitesEvaluation` (vérifié 4 juin : `pratique-configurable.js:199` et `pratique-pan-standards.js:69/696` lisent le global dans `calculerPerformance` — c'est la cause du comportement émergent) ; `calculerDetailsNoteFinale(da, pratiqueId = null)` paramétrable.

- [ ] 🟢 **#304** Nettoyage terminologique interne « heures-contact » → « heure d'enseignement »
  - **✅ Libellés UI faits (mini-guide « balises du cours », beta 99.79, commit `8f23964`)** : « Heures-contact attendues » → « Heures d'enseignement » + « Total d'heures en classe » → « Total d'heures d'enseignement » (`index.html`). Reste : identifiants techniques `v2-heuresContact`, fonction `proposerHeuresContactDepuisPonderation`, commentaires « heures-contact » de `js/trimestre-v2-cours.js`, doc `docs/ANALYSE-conformite-RREC-heures-contact.md`.
  - Justification : l'OQLF (Grand dictionnaire terminologique) **déconseille** « heure-contact » (calque de *contact hour*) au profit de « heure d'enseignement ».
  - Lié au chantier A conformité RREC + à l'ambiguïté **période (50-55 min) vs heure** à trancher (compter exigence et réalisé dans la même unité, idéalement en périodes). Réf. `Plan Accompagnement/SPEC_mini-guide_cours_balises.md` §2 et §5.

- [x] 🟢 **#305** A11y : la modale d'aide contextuelle annonce un dialogue sans nom — ✅ LIVRÉ (commit `677af656`, intégré 1.2.0)
  - `afficherAideContextuelle()` (`js/accompagnement.js:846`) pose `aria-labelledby="aide-ctx-titre"`, mais ce `<span>` ne reçoit jamais le `titre` de l'entrée (il ne contient que l'icône) → lecteurs d'écran annoncent un dialogue sans nom. Vrai pour les ~40 entrées popup.
  - Correctif d'une ligne (injecter `aide.titre` dans `#aide-ctx-titre` au rendu). Découvert 29 mai 2026 en livrant le mini-guide « balises du cours ».

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

- [ ] 🟡 **#286** Migration globale emojis UI → Icônes SVG icons8 (chantier en 5 lots)
  - **Capture déclencheuse** : iPad 26 mai 05:15 — section « Préparer et importer » avec ✴ orange à droite du titre + 📝 papier-crayon au-dessus de « Annoter les travaux ».
  - **Cartographie réalisée 26 mai 2026** : 593 occurrences UI (200 HTML + 393 JS hors `console.*`/commentaires), 56 emojis distincts. 70 SVG icons8 déjà présents dans `icons/` (crédit inscrit dans À propos).
  - **Plan détaillé** : `plans de travail/PLAN-MIGRATION-ICONES-SVG.md` — table de mapping, lots A/B/C/D/E, ordre recommandé, décisions Grégoire pendantes.
  - **Top 3 emojis** : ✴ ×76 (bouton aide, à mapper → `icon-info` à ajouter), ⚠ ×63 (warning), ✓ ×48 (check simple).
  - **Effort total** : 5-6 h réparties sur 3-5 sessions.
  - **Lot A** (bouton aide ✴, 45 min) recommandé en premier — gros impact visuel, mapping unique.

### Codex / Onboarding

- [ ] 🟡 **#295** Diagnostic mémoire/quota avant la tentative d'ouverture d'un Codex (Mac + iPad + iPhone)
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

- [ ] 🟢 **#233** Simplifier le flux Codex pour l'utilisateur lambda (Mac + iPad)
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
