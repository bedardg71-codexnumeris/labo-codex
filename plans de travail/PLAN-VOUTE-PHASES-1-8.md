# Plan de travail — Voûte Phase 1 : partage de ressources par fichiers signés (Phases 1-8)

**Date** : 10 juin 2026
**Statut** : **plan validé par Grégoire (10 juin 2026)** — prêt pour exécution Claude Code
**Item backlog** : #329
**Exécution** : sessions Claude Code (modèle Claude Fable 5), coordonnées via ce plan

---

## 0. Documents source et ordre de préséance

Ce plan **réconcilie** quatre documents rédigés à des dates différentes. En cas de
contradiction, le plus récent prime :

| Document | Date | Rôle | Préséance |
|---|---|---|---|
| `plans de travail/PLAN-PARTAGE-RESSOURCES.md` | 21 avril | Plan source : vision, format, 8 phases, 14 critères | Base |
| `docs/architecture/PLAN2-PHASE1-SPEC.md` | 24 avril | Spec exécutable de la Phase 1 (modules, schémas, API) | Base technique Phase 1 |
| `docs/architecture/ECOSYSTEME-DONNEES.md` + ADR-011 | 26 avril | Cadre conceptuel Voûte (4 espaces, verbes, principes) | Cadre |
| `docs/securite/DECISIONS-ARCHITECTURALES-2026-05-11.md` | 11 mai | D1-D7 : signature, confiance, modération, IDs | **Prime sur tout** |

**Amendements actés par préséance** (le plan source du 21 avril est corrigé sur ces points) :

1. **§11 du plan source (« signature hors périmètre ») est CADUC.** La décision D2
   (11 mai) rend la signature ECDSA **obligatoire dès la Phase 1** : aucun package
   accepté sans signature valide. Ce plan intègre la Défense F au programme.
2. **Le modèle de confiance est tranché** : D3 — TOFU par défaut, WoT progressif
   opt-in. Module `js/trust-tofu.js`.
3. **IDs à l'import** : D7 — préfixage systématique `PARTAGE_*`, ID source conservé
   dans `inspireDe.idOriginal`.
4. **R3 du benchmark Obsidian** (`docs/securite/BENCHMARK-OBSIDIAN.md`) : la
   signature s'applique aussi aux **mises à jour** d'une ressource déjà publiée,
   pas seulement à la première publication.
5. **D1 (architecture serveur) reste EN ATTENTE et ne bloque rien** : tout ce plan
   est de la « Voûte sans serveur » (fichiers signés échangés par courriel/USB),
   mode compatible avec toutes les variantes de D1.

---

## 1. Décisions préalables (à confirmer par Grégoire avant le lot concerné)

| Réf | Décision | Recommandation | Bloque |
|---|---|---|---|
| **D-V1** | Extension du package : `.lcz` vs `.codex-share.zip` | **TRANCHÉE (Grégoire, 10 juin) : `.lcz`** — conteneur ZIP à extension dédiée, patron `.docx`/`.epub` ; évite la décompression au double-clic sur macOS/iPadOS qui casserait le flux d'import ; la validation lit les magic bytes, pas le nom. Coût : extension inconnue, à expliquer au guide (Phase 7). | Rien (tranchée) |
| **D-V2** | Nom d'affichage UI : « Voûte », « Partage », ou les deux | À trancher avec les textes de la Phase 2 (cohérence vocabulaire : la Voûte est le concept, le partage par fichier en est la Phase 1) | Phase 2 |
| **D-V3** | `MODELE-CONFIANCE.md` (action E8 de l'audit sécurité) : rédigé par Cowork ou Claude Code | Cowork (document de gouvernance, pas de code) | Jalon pilote |

---

## 2. Architecture cible (rappel synthétique)

```
EXPORT (utilisateur A)                      IMPORT (utilisateur B)
entité → construirePackage()                fichier .lcz
       → signature ECDSA (js/signature.js)         → validerZipSecurite()
       → ZIP .lcz (JSZip, déjà dans libs/)         → validerPackage() (6 niveaux)
                                                    → vérif. signature (Défense F)
                                                    → verifierConfianceTOFU() (D3)
                                                    → prévisualisation obligatoire
                                                    → intégration namespace partage_*
                                                      (IDs préfixés PARTAGE_*, D7)
```

**Nouveaux modules** : `js/partage-schemas.js`, `js/partage-format.js`,
`js/partage-validation.js` (spec §2.1), `js/signature.js` (D2),
`js/trust-tofu.js` (D3).
**Modules réutilisés** : `bibliotheque-ui.js` (estItemDemo, forgerInspireDe,
formaterAttribution), `cc-license.js`, `import-export.js` (validerZipSecurite,
validerMagicBytes). **JSZip est déjà dans `libs/`** — aucune dépendance nouvelle.
**Web Crypto API native** (`crypto.subtle`) pour ECDSA P-256 — vérifié disponible
Safari Mac M3 + iPad M1 (`docs/securite/MODELE-MENACES.md` §outils).

**Amendement structurel à la spec Phase 1** : le manifeste `labo-codex-partage-v1`
inclut le **bloc signature dès la v1** (champs `signature`, `clePublique`,
`algorithme`), même si la signature n'est câblée qu'au lot F. Raison : éviter un
format v2 trois lots plus tard (zéro-dette appliqué au format).

---

## 3. Découpage en lots et jalon pilote

Le programme conserve la numérotation des 8 phases du plan source, **augmentée**
des lots sécurité F (signature) et T (confiance) issus de D2/D3. Le jalon « pilote
restreint fin août » (calendrier) tombe après la Phase 3.

### Avant-pilote (juillet → fin août 2026)

| Lot | Contenu | Effort estimé | Dépend de |
|---|---|---|---|
| **P1** — Format et validation | Spec `PLAN2-PHASE1-SPEC.md` intégrale, amendée du bloc signature dans le manifeste. 3 modules, schémas fermés, 6 niveaux de validation, `window._testPartagePhase1()` (14 critères) **+ sentinelles Vitest** (la spec d'avril prévoyait des tests console ; la suite Vitest existe depuis, on s'en sert) | 1 sem | — |
| **F** — Défense F : signature | `js/signature.js` : génération paire ECDSA P-256, export/import de clé publique, signature de manifeste, vérification. Signature des **mises à jour** incluse (R3). Stockage de la clé privée : IndexedDB non-extractible (`crypto.subtle`, clé non exportable par défaut ; export chiffré optionnel = hors lot, cf. #47) | 1 sem | P1 (signe le manifeste) |
| **T** — Confiance TOFU | `js/trust-tofu.js` : registre local des clés connues (`cle('clesConnues')` — global, PAS namespacé par trimestre), `verifierConfianceTOFU(pkg)` → `verifiee / nouveau / cle_changee`, alerte explicite en français au changement de clé. WoT progressif : **structure de données prévue, UI reportée post-pilote** (D3 : opt-in, non requis au démarrage) | 1-2 sem | F |
| **P2** — Pipeline d'export | Bouton « Exporter pour partager » sur les 5 entités Structure (grilles, échelles, cartouches, productions, pratiques), modale de confirmation CC, génération `.lcz` signé téléchargeable (D-V1) | 1 sem | P1, F |
| **P3** — Pipeline d'import | Entry point Réglages › Données (section existante — **pas de nouvel onglet, `config.js`/`navigation.js` non touchés**), validation 6 niveaux + signature + TOFU, prévisualisation obligatoire (auteur, statut de confiance, items, chaîne d'attribution), intégration `partage_*` avec préfixage `PARTAGE_*` (D7), liste des packages importés + « Retirer » | 1-2 sem | P2, T |

> **🟦 JALON — Pilote restreint (fin août 2026)** : Grégoire + 2-3 collègues,
> parcours complet en grandeur nature (paire de clés → signature → export `.lcz`
> → courriel → import → vérification TOFU → modération manuelle). Préalables
> non-code : `MODELE-CONFIANCE.md` rédigé (D-V3) ; checklist de modération
> manuelle (D4 : humaine, Grégoire seul). **Aucune phase post-pilote ne démarre
> avant le bilan du pilote** — les retours testeurs priment (règle CLAUDE.md).

### Post-pilote (septembre 2026 → hiver 2027, recalé selon bilan)

| Lot | Contenu | Notes |
|---|---|---|
| **P4** — Section « Partagés » | Sélecteurs à 3 sections (Mes documents / Démo / Partagés), lecture seule + « Dupliquer », interdiction de référencer un item partagé dans un assemblage | Patron identique à la section Démo (Plan 1) |
| **P5** — Chaîne d'attribution | `chaineAttribution` sérialisée, affichage replié/déroulable, préservation au fork, condensation au-delà de 10 niveaux | |
| **P6** — Entités de Contexte | Extension aux 6 entités (trimestre, cours, enseignant·e, groupe, horaire, groupe-cours) | Charger `SKILL_integrite_globaux.md` — collections globales |
| **P7** — Guide utilisateur | Guide dans l'Aide : cycle CC, sécurité, flux complets, **explication de `.lcz`** et des alertes TOFU | Coordonner avec le module guides (#302) |
| **P8** — Convergence des formats | Migration « Configuration pédagogique complète » (Beta 91) vers `labo-codex-partage-v1`, **retrait de l'ancien pipeline** | Zéro-dette : le chantier n'est pas fini tant que l'ancien format n'est pas retiré |
| **T2** — WoT progressif (optionnel) | UI signatures manuelles entre utilisateurs, graphe de confiance | Seulement si le pilote en montre le besoin |

---

## 4. Tâches par session Claude Code

### Rituel commun à CHAQUE session du chantier

1. Rituel de début de session (`SKILL_Debut_de_session.md`) : audit git + tests + SESSION.md.
2. Charger : **`SKILL_Securite_donnees.md` (PRIORITÉ — règles §9 obligatoires)**,
   `SKILL_hygiene_donnees_partagees.md`, `SKILL_integrite_globaux.md`,
   `SKILL_labo_codex.md`. Relire ce plan + les décisions D2/D3/D7.
3. Règles non négociables : `echapperHtml()` sur toute donnée importée affichée,
   `data-action` (zéro handler inline), `validerZipSecurite()` sur tout ZIP,
   `validerMagicBytes()` sur tout fichier binaire, ≥1 test sentinelle par lot,
   `console.warn/error` uniquement.
4. Avant commit : `cd tests && npm test` ; release via `node scripts/release.mjs`
   (`minor` à chaque lot livré ; **les modules `partage-*`/`signature`/`trust-tofu`
   deviennent des modules sensibles** → tests obligatoires avant tout commit qui
   les touche).

### Lot P1 — Format et validation — ✅ LIVRÉ 10 juin 2026 (release 1.7.0)

- [x] Relire `PLAN2-PHASE1-SPEC.md` en entier ; noter les écarts éventuels avec l'état
      du code → **écarts actés, détail dans SESSION.md** : shapes réelles (cartouche ≠
      `descripteurs[]` ; criteres[].niveauSOLO ; metadata_cc complète de cc-license.js) ;
      modèle de dépendances réel = grille → cartouches (pas grille → échelle) ;
      `construirePackage` exige `options.type`.
- [x] `js/partage-schemas.js` : schémas fermés des 5 entités + manifeste **avec bloc
      signature** (`signature`/`clePublique`/`algorithme`, null acceptés tant que F non livré).
      Taille max package : **10 Mo, confirmé Grégoire 10 juin** (revue du format, cf. §8).
- [x] `js/partage-format.js` : `construirePackage(itemPrincipal, options)` — projection
      RÉCURSIVE sur les schémas (l'export ÉLAGUE l'inconnu, l'import le REJETTE).
- [x] `js/partage-validation.js` : `validerPackage(pkgObj)` — 6 niveaux, rejet des
      champs inconnus, limites de taille, anti-usurpation « Demo Labo Codex » ;
      retourne aussi `packageNettoye` (clone sanitisé que P3 intégrera) ; patterns
      dangereux = REJET (règle 14 SKILL_Securite_donnees, prime sur le niveau 5 spec).
- [x] Inscription des 3 scripts dans `index.html` (après `cc-license.js` et
      `bibliotheque-ui.js`, avant `import-export.js`).
- [x] Tests : 28 sentinelles Vitest (`tests/unit/partage-phase1-P1.test.js`) +
      `window._testPartagePhase1()` conservé pour la validation manuelle.
- [x] Validation fonctionnelle : Mac 14/14 sur données réelles (10 juin, après fix
      `702fa7e9`). Re-passe iPad : optionnelle, à faire à l'occasion (JS pur, sans UI).

### Lot F — Signature ECDSA (Défense F) — ✅ CODE COMPLET 10 juin 2026 (terrain en attente)

- [x] `js/signature.js` : `obtenirOuCreerIdentite()`, `signerPackage(pkg)`,
      `verifierSignaturePackage(pkg)` + crypto pur testable (`canonicaliser`,
      `construirePayloadSignature`, `signerChaine`, `verifierChaine`) — ECDSA
      P-256 + SHA-256, Web Crypto natif. **Périmètre signé spécifié** (la spec
      d'avril ne le disait pas) : sérialisation CANONIQUE (clés triées) du
      package ENTIER, bloc signature à null — signer le manifeste seul
      laisserait altérer les entités sans invalider la signature.
- [x] Clé privée **non extractible**, base IndexedDB DÉDIÉE `labo-codex-identite`
      (ÉCART AU PLAN acté par Grégoire 10 juin : pas db.js, dont la copie
      localStorage dégrade un CryptoKey en `{}` et dont les clés entrent dans
      les exports/restaurations Codex). Perte de clé = nouvelle identité
      (pilote) ; sauvegarde chiffrée = #47, hors lot.
- [x] Câblage : `construirePackageSigne(item, options)` dans partage-format.js
      (`construirePackage` reste pur/synchrone) ; chemin de signature UNIQUE,
      les mises à jour repassent par lui (R3).
- [x] Tests : 23 sentinelles Vitest (`tests/unit/signature-F.test.js`) —
      aller-retour, altération entité/manifeste, clé étrangère, refus
      structurés, **vecteurs fixes committés** (clé privée jetée) +
      `window._testSignatureF()` (8 scénarios console, terrain Safari).
- [x] `docs/DATA-OWNERSHIP.md` : nouvelle section « Bases IndexedDB annexes ».
- [x] Validation terrain Grégoire (Safari Mac, 10 juin 2026) : `_testSignatureF()`
      → **8/8 verts**, identité locale créée et persistée. Release minor exécutée
      dans la foulée.

### Lot T — Confiance TOFU — ✅ CODE COMPLET 10 juin 2026 (terrain en attente)

- [x] `js/trust-tofu.js` : registre `clesConnues` (global, db.js, jamais namespacé),
      `verifierConfianceTOFU()` LECTURE SEULE → nouveau/verifiee/cle_changee/
      indeterminable ; `memoriserContact()` séparé (posé à l'ACCEPTATION de
      l'import, P3) — remplacement de clé refusé sans `remplacerCle: true`
      explicite (critère 19), ancienne clé tracée (`anciennesCles`). Nom
      d'auteur indexé NORMALISÉ (NFC — macOS produit du NFD —, casse, espaces) :
      un nom connu n'est pas contournable par variation typographique.
      `listerAuteursConnus()`/`oublierAuteur()` posés pour le futur panneau
      Confiances et la modération (D4). `signaturesWoT: []` réservé (D3, T2).
- [x] UX des 3 états : `TEXTES_CONFIANCE` (français clair, tutoiement) +
      `demanderDecisionCleChangee()` = modale BLOQUANTE construite à l'appel
      (.modal-overlay du design system, PAS le style RaI), défaut sûr partout
      (ESC, clic hors carte et bouton principal = refuser ; « Faire confiance »
      en btn-danger), construite en API DOM + textContent (AUCUN innerHTML —
      les noms viennent de packages importés), zéro handler inline,
      écouteur clavier défensif, focus a11y sur l'action par défaut.
- [x] Menace TOFU documentée honnêtement dans TEXTES_CONFIANCE.nouveau (« Labo
      Codex ne peut pas garantir une identité au premier contact ») — repris
      au guide P7.
- [x] Tests : 17 sentinelles Vitest (`tests/unit/trust-tofu-T.test.js`) — 3 états,
      normalisation, persistance, remplacement, registre corrompu + console
      `_testTrustTofu()` (8 scénarios, registre nettoyé) et
      `_demoAlerteCleChangee()` (vérif visuelle modes sombre/clair).
- [x] `docs/DATA-OWNERSHIP.md` : ligne `clesConnues` (section Bibliothèques).
- [ ] Validation terrain Grégoire (Safari Mac) : `await _testTrustTofu()` → 8/8,
      puis `_demoAlerteCleChangee()` dans les DEUX modes, puis release minor.

### Lots P2-P3 — Export / Import UI

- [ ] P2 : boutons export 5 entités (patron `data-action`), modale CC (réutiliser
      `formaterAttribution`), génération `.lcz` (D-V1 confirmée), nommage de fichier
      lisible (`grille-{nom}-{date}.lcz`).
- [ ] P3 : section dans Réglages › Données, drag-and-drop + file picker, pipeline
      complet (ZIP → schéma → signature → TOFU → préviz → intégration `partage_*`),
      liste « Packages importés » + Retirer (n'affecte que `partage_*`).
- [ ] Tests : Playwright sur le flux import (package valide, corrompu, signature
      invalide, clé changée) ; sentinelle préfixage `PARTAGE_*` + `inspireDe.idOriginal`.
- [ ] Validation terrain Grégoire Mac + iPad avant le jalon pilote.

### Phases P4-P8 — à détailler post-pilote

Chaque phase recevra son cadrage propre (patron #320/#327) **après** le bilan du
pilote. Ne pas détailler maintenant : les plans trop en avance périment (constat
documenté sur les plans d'audit du 15 mai).

---

## 5. Critères d'acceptation du jalon pilote

Les **14 critères** du plan source (§9) restent valides, plus :

15. Un package non signé ou à signature invalide est **rejeté** avec message clair (D2).
16. Un package altéré après signature (1 octet du manifeste) est rejeté.
17. Premier import d'un auteur : statut « nouvel auteur » affiché, clé mémorisée (TOFU).
18. Second import du même auteur, même clé : statut « vérifiée ».
19. Import prétendant venir d'un auteur connu avec une **autre clé** : alerte bloquante explicite, choix utilisateur requis.
20. Une mise à jour d'un package déjà importé est elle-même vérifiée en signature (R3).
21. Le parcours complet (clés → export → courriel → import → vérification) est réalisable par un collègue **sans assistance**, guide sous les yeux.

---

## 6. Coexistence avec le chantier SSOT `modalitesEvaluation` (#328, audit du 10 juin)

Décision Grégoire (10 juin) : les deux chantiers avancent **en parallèle**.

- Fichiers disjoints : Voûte = `partage-*.js`, `signature.js`, `trust-tofu.js` ;
  SSOT = `js/pratiques/`, `db.js`, futur module propriétaire.
- **Point de contact unique : `import-export.js`** (la Voûte s'y greffe en P3 ; le
  Lot 3 SSOT y purgera des fallbacks). Règle : avant toute session touchant
  `import-export.js`, vérifier dans `SESSION.md` qu'aucune session de l'autre
  chantier n'y est en cours ; rebaser plutôt que fusionner à l'aveugle.
- Second point de contact : `docs/DATA-OWNERSHIP.md` (les deux chantiers y ajoutent
  des clés) — conflit git trivial, fusion manuelle.
- **Exécution simultanée (2 instances Claude Code)** : supportée via git worktrees
  (isolation des fichiers par session ; doc officielle `code.claude.com/docs/en/worktrees`).
  Règles locales : (1) **une seule release à la fois** — `release.mjs` écrit les 4 points
  de vérité (`version.json`, `init-inline.js`, `main.js`) ; le chantier qui termine second
  rebase et relance sa release ; (2) **un seul écrivain BACKLOG/SESSION/ETAT-PROJET par
  créneau** — l'attribution d'un nouvel ID se fait avant d'ouvrir les sessions parallèles
  (précédent : collision évitée de justesse le 10 juin, #328 pris par SSOT pendant la
  rédaction de ce plan) ; (3) merge séquentiel vers `main`, jamais deux merges croisés.

---

## 7. Risques

- **Péremption du plan** : les phases post-pilote NE SONT PAS détaillées,
  délibérément. Recouper ce plan avec `ETAT-PROJET.md` à chaque reprise.
- **Gel prématuré du format** : une fois le pilote lancé, des `.lcz` circulent ;
  tout changement de format devient une migration. D'où le bloc signature dans le
  manifeste v1 dès P1 et la revue du format en fin de P1 (session dédiée de
  relecture avec Grégoire avant P2).
- **Crypto = zone à erreurs silencieuses** : ne jamais implémenter de primitive
  maison ; `crypto.subtle` uniquement ; vecteurs de test fixes ; en cas de doute
  sur un choix cryptographique, **poser la question plutôt que supposer**.
- **Perte de clé privée** (pilote) : acceptée et documentée (nouvelle identité,
  re-TOFU chez les pairs). Sauvegarde chiffrée = #47, reconsidérer post-pilote.
- **Été à temps partiel** : reprise mi-juin, ~10 semaines avant fin août pour
  P1+F+T+P2+P3 (~5-7 semaines de travail estimées). Marge réelle mais pas
  confortable ; si ça glisse, le pilote peut se faire sans P2 complet (export
  console) — décision Grégoire le cas échéant.
- **Retours bêta publique** : ils interrompent ce plan (règle CLAUDE.md), comme
  tout le reste.

---

## 8. Journal des décisions

| Date | Décision |
|---|---|
| 2026-06-10 | Plan créé. Périmètre « programme complet Phases 1-8 » validé par Grégoire. Coexistence parallèle avec chantier SSOT (#328) actée. Recommandation `.lcz` formulée (D-V1, à confirmer). Bloc signature intégré au manifeste v1 (anti-dette de format). |
| 2026-06-10 (PM) | **Plan validé par Grégoire.** Passation à Claude Code décidée : démarrage du lot P1 après clôture de la session SSOT en cours. **D-V1 TRANCHÉE : `.lcz`.** D-V2/D-V3 restent à confirmer (non bloquantes avant P2 et le jalon pilote respectivement). |
| 2026-06-10 (PM) | **Exécution séquentielle décidée** (Grégoire) : pas d'instances Claude Code simultanées — la capacité de validation terrain est le facteur limitant, pas l'outillage. Les chantiers #328 et #329 alternent par sessions complètes ; les règles du §6 (release unique, écrivain unique des fichiers de suivi, merges séquentiels) restent en vigueur pour l'alternance. |
| 2026-06-10 (PM) | **Revue du format pré-P2 TENUE (Grégoire + Claude Code).** Trois décisions : (1) **taille max package abaissée à 10 Mo** (relever plus tard = gratuit, abaisser = migration des `.lcz` en circulation — départ bas prudent ; le 50 Mo de la skill §9.4 visait un codex data, pas un package JSON sans médias) ; (2) **champs exclus confirmés tels quels** (`auteur` sur entité, `coursId`/`dateEcheance`, `etablissement`, flags démo, `_*`) et **courriel d'auteur optionnel conservé** dans `manifest.auteur.courriel` + `metadata_cc.email_auteur` (attribution CC standard, présent seulement si l'identité CC est remplie) ; (3) **mono-licence gelée** : `licence === 'CC BY-NC-SA 4.0'` en valeur exacte dans le format v1, élargissement éventuel = format v2 assumé. Le format est GELÉ — P2 peut démarrer après le lot F. |
| 2026-06-10 (PM) | **Lot P1 LIVRÉ** (release 1.7.0). 3 modules + 28 sentinelles Vitest + `_testPartagePhase1()` validé terrain 14/14 sur données réelles (Mac), après un correctif : schémas alignés sur les formes RÉELLES (criteres[].niveauSOLO, metadata_cc complète) et projection récursive (asymétrie actée : export élague, import rejette). Écarts avec la spec d'avril documentés dans SESSION.md. En pratique les instances ont tourné EN PARALLÈLE dans le même dépôt (#329 ∥ #330) — règles §6 appliquées : commits par chemins explicites, release prise par la session bugs, aucun croisement. **À l'ordre du jour avant P2** : revue du format avec Grégoire (50 Mo, champs exclus auteur/coursId/dateEcheance/etablissement, bloc signature). Prochain lot : F (`js/signature.js`). |
