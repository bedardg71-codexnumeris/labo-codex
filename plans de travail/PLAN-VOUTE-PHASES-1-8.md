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
| **D-V1** | Extension du package : `.lcz` vs `.codex-share.zip` | **TRANCHÉE (Grégoire, 10 juin) : `.lcz` = « Labo Codex Zip »** (expansion officielle actée le 10 juin, à reprendre au guide P7) — conteneur ZIP à extension dédiée, patron `.docx`/`.epub` ; évite la décompression au double-clic sur macOS/iPadOS qui casserait le flux d'import ; la validation lit les magic bytes, pas le nom. Coût : extension inconnue, à expliquer au guide (Phase 7) — confirmé terrain 10 juin (dialogue Finder « aucune application configurée », comportement attendu). | Rien (tranchée) |
| **D-V2** | Nom d'affichage UI : « Voûte », « Partage », ou les deux | **TRANCHÉE (Grégoire, 10 juin) : « partage » partout dans l'UI** ; « Voûte » réservé aux documents d'architecture (le concept + la future bibliothèque centralisée). Détail : `docs/securite/MODELE-CONFIANCE.md` §7. Dernière occurrence UI (intro Réglages › Données) corrigée. | Rien (tranchée) |
| **D-V3** | `MODELE-CONFIANCE.md` (action E8 de l'audit sécurité) : rédigé par Cowork ou Claude Code | **FAIT (Claude Code, 10 juin, décision Grégoire en session)** : `docs/securite/MODELE-CONFIANCE.md` (cercles de confiance, garanties/limites P1-F-T, gouvernance D4) + `docs/securite/CHECKLIST-MODERATION.md` (procédure opérationnelle phase fichiers). | Rien (fait) |

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
| **P4** — Section « Partagés » | ✅ **AVANCÉ AVANT-PILOTE et CODE COMPLET 10 juin 2026** (décision Grégoire au terrain P3 : sans P4, un .lcz importé n'est utilisable nulle part). `js/partage-section.js` : section « Partagés par des collègues » dans les 5 modales de biblio (`creerModal.sectionPartages`), lecture seule, « Dupliquer vers mes documents » AVEC dépendances (grille→cartouches dans `cartouches_{nouvelId}` ; cartouche→sa grille entière ; production→sa grille+cartouches, grilleId remappé — jamais de pointeur utilisateur vers `partage_*`). Conventions des `dupliquer*` existants (id neuf, auteur actif, metadata_cc retiré, inspireDe conservé). Invariant : la duplication ne modifie JAMAIS `partage_*`. 12 sentinelles Vitest + flux Playwright. Interdiction d'assemblage garantie par construction. | Reste : terrain (avec P3) puis release |
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
- [x] Validation terrain Grégoire (Safari Mac, 10 juin 2026) : `_testTrustTofu()`
      → **8/8 verts**, alerte « clé changée » conforme dans les DEUX modes
      (captures), formulation retouchée sur constat terrain (accord en nombre
      calculé, date longue fr-CA). **Release 1.9.0 exécutée.**

### Lots P2-P3 — Export / Import UI

#### Lot P2 — ✅ CODE COMPLET 10 juin 2026 (terrain en attente)

- [x] `js/partage-export.js` : `exporterPourPartager(type, id, contexteId)` —
      résolution par type dans les collections RÉELLES (grillesTemplates/
      echellesTemplates/`cle('productions')`/`cle('pratiquesConfigurables')` +
      replis pools ; cartouches par ancrage `cartouches_{grilleId}`), modale de
      confirmation CC (API DOM + textContent, identité CC, dépendances
      embarquées, licence), **AUTO-CONTRÔLE** : le package signé repasse par
      `validerPackage` avant émission — on n'émet jamais un package que notre
      propre import rejetterait. Garde-fou : items démo non exportables.
- [x] **Canon du conteneur `.lcz` posé** (la spec d'avril s'arrêtait au JSON) :
      ZIP avec `package.json` (UTF-8) à la racine, `medias/` réservé.
- [x] Boutons « Exporter pour partager » au menu ⋮ section « Mes documents »
      des 5 biblios (grilles.js, echelles.js, cartouches.js,
      productions-bibliotheque-ui.js, pratiques-gestion.js). Legacy pratiques
      renommé « Exporter (JSON) » en attendant la convergence P8.
- [x] Nommage via `genererNomFichierExport` (#262) : `.lcz`, licence, minute.
- [x] Vocabulaire UI : « partage » uniquement (D-V2 non tranchée — « Voûte »
      n'apparaît nulle part dans l'interface).
- [x] Tests : 10 sentinelles Vitest (`tests/unit/partage-export-P2.test.js`,
      dont aller-retour .lcz avec le VRAI JSZip de libs/) +
      `window._testPartageExportP2()` (terrain : chaîne complète package →
      .lcz → relecture → validation + signature + TOFU, sans téléchargement).
- [x] Validation terrain Grégoire (Safari Mac, 10 juin 2026) :
      `_testPartageExportP2()` → **8/8 verts** sur grille réelle (.lcz 13,7 Ko,
      signature et TOFU vérifiés après aller-retour) ; export réel via menu ⋮
      validé (bug #139 modale derrière la bibliothèque corrigé en cours de
      route, cf. SUIVI-BUGS) ; `.lcz` téléchargé, nommage #262 conforme,
      comportement Finder conforme à D-V1. **Release 1.10.0 exécutée.**

#### Lot P3 — Import — ✅ CODE COMPLET 10 juin 2026 (terrain en attente)
- [x] `js/partage-import.js` : pipeline complet — magic bytes ZIP →
      `validerZipSecurite` → `package.json` → JSON.parse strict →
      `validerPackage` → `verifierSignaturePackage` sur l'objet BRUT
      (le payload signé est le package tel qu'émis ; règle posée :
      signature = brut, tout le reste = packageNettoye) →
      `verifierConfianceTOFU` → alerte bloquante si clé changée →
      PRÉVISUALISATION obligatoire → intégration `partage_*` +
      `memoriserContact` à l'ACCEPTATION seulement.
- [x] Carte « Partage entre collègues » dans Réglages › Données (remplace le
      placeholder « Voûte à venir » ; `config.js`/`navigation.js` INTOUCHÉS,
      hook dans `chargerVueDonnees` de donnees-v2.js) : zone de dépôt
      drag-and-drop + file picker, liste « Packages importés » + Retirer.
      Vocabulaire « partage » (D-V2 toujours ouverte).
- [x] Intégration (D7) : IDs préfixés `PARTAGE_{suffixe d'import}_` à la
      conception (zéro collision, y compris entre deux imports), id source
      dans `inspireDe.idOriginal` (un inspireDe existant est complété, pas
      écrasé), `grilleId` des cartouches/productions remappé quand la cible
      est dans le package. Retrait par IDENTITÉ (registre
      `partage_packagesImportes.idsIntegres`), jamais par flag. L'import
      n'écrit JAMAIS dans les collections utilisateur.
- [x] Mise à jour d'un package déjà importé (R3, critère 20) : détection par
      auteur normalisé + item principal d'origine → la préviz annonce le
      remplacement, l'acceptation remplace la copie précédente.
- [x] Garde d'entrée : fichier ≤ 12 Mo, magic bytes PK, anti-bombe ciblée sur
      package.json (10 Mo décompressé), JSON strict.
- [x] Tests : 14 sentinelles Vitest (`tests/unit/partage-import-P3.test.js` —
      préfixage, remappage, registre, retrait par identité) + 4 flux
      Playwright (`tests/integration/partage-import-rendu.spec.js` : valide
      avec vraie chaîne P2 + ECDSA + TOFU, corrompu, signature invalide,
      clé changée avec refus) + `window._testPartageImportP3()` (terrain).
- [x] `docs/DATA-OWNERSHIP.md` : clés `partage_packagesImportes` + `partage_*`.
- [x] **Double porte d'entrée (décision Grégoire 10 juin, terrain)** : bouton
      « Importer un partage (.lcz) » dans les 5 modales de bibliothèque, à
      côté de l'import JSON legacy — même pipeline (déclenche l'input de la
      carte Réglages › Données, présent en permanence dans le DOM). La carte
      reste le tableau de gestion (liste + Retirer). Friction d'origine
      consignée dans USAGE-FORMATS (l'import était cherché là où vit
      l'export). Sentinelle Playwright : bouton présent dans les 5 modales.
- [x] Validation terrain Grégoire (Safari Mac, 10 juin 2026) : import réel
      validé via la carte ET via le bouton biblio, section « Partagés » +
      duplication conformes (« tout fonctionne bien »). **Release 1.11.0
      exécutée** (build 0610-1242) + entrée changelog « Importe les
      ressources partagées par tes collègues ». Re-passe iPad : à
      l'occasion, avant le jalon pilote.

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
| 2026-06-10 (PM) | **Préalables hors-code du jalon pilote LIVRÉS** : `MODELE-CONFIANCE.md` (E8/D-V3 — cercles de confiance, garanties et limites des mécanismes, gouvernance D4 : critères, appel, révocation, délégation, succession) + `CHECKLIST-MODERATION.md` (D4 opérationnel, version phase fichiers : audit avant rediffusion, signalement, révocation sans serveur, journal). **D-V2 TRANCHÉE : « partage » dans l'UI, « Voûte » réservé à l'architecture** — intro de Réglages › Données corrigée (dernière occurrence UI). Avant le pilote il ne reste que la re-passe iPad. |
| 2026-06-10 (PM) | **P3 + P4 LIVRÉS — release 1.11.0** (build 0610-1242). Terrain Mac validé par Grégoire sur le parcours complet (import par la carte et par le bouton biblio, section « Partagés », duplication avec cartouches). Entrée changelog 1.11 ; la puce « l'import arrive » retirée de l'entrée 1.10 (jamais partie dans un build). L'avant-pilote est CODE-COMPLET : restent hors code MODELE-CONFIANCE.md (D-V3, Cowork), D-V2 (nom UI, avec les textes P7) et la re-passe iPad. |
| 2026-06-10 (PM) | **Libellés legacy « … (JSON) » + LOT P4 AVANCÉ ET CODE COMPLET** (décisions Grégoire au fil du terrain). (1) Les paires export/import JSON des 5 biblios sont renommées « … (JSON) » — le RETRAIT reste à P8. (2) P4 sorti du post-pilote : section « Partagés » dans les 5 biblios + « Dupliquer vers mes documents » avec dépendances (`js/partage-section.js`). 564 tests verts (511 Vitest + 53 Playwright). Reste : terrain P3+P4 puis release minor unique. |
| 2026-06-10 (PM) | **Terrain P3 (Mac) : flux d'import VALIDÉ par Grégoire** (préviz premier contact, intégration, liste, notification). Deux correctifs terrain : (1) `accept=".lcz"` retiré — Safari grise toute extension sans UTI ; (2) **double porte d'entrée actée** : bouton « Importer un partage (.lcz) » ajouté aux 5 modales de bibliothèque (la friction « l'import se cherche là où vit l'export » est consignée dans USAGE-FORMATS). Reste avant release : re-passe Mac complète (+ iPad à l'occasion) avec les boutons biblios. |
| 2026-06-10 (PM) | **Lot P3 CODE COMPLET** (session Claude Code AM-3). Pipeline d'import .lcz entier, carte « Partage entre collègues » dans Réglages › Données, 14 sentinelles Vitest + 4 flux Playwright (550 tests verts au total). Décisions d'implémentation : signature vérifiée sur l'objet BRUT / tout le reste sur le packageNettoye ; mise à jour d'un package = remplacement par identité (R3) ; collections `partage_*` plates, possédées par le module. Reste : terrain Mac + iPad, puis release minor + changelog. |
| 2026-06-10 (PM) | **Lot P1 LIVRÉ** (release 1.7.0). 3 modules + 28 sentinelles Vitest + `_testPartagePhase1()` validé terrain 14/14 sur données réelles (Mac), après un correctif : schémas alignés sur les formes RÉELLES (criteres[].niveauSOLO, metadata_cc complète) et projection récursive (asymétrie actée : export élague, import rejette). Écarts avec la spec d'avril documentés dans SESSION.md. En pratique les instances ont tourné EN PARALLÈLE dans le même dépôt (#329 ∥ #330) — règles §6 appliquées : commits par chemins explicites, release prise par la session bugs, aucun croisement. **À l'ordre du jour avant P2** : revue du format avec Grégoire (50 Mo, champs exclus auteur/coursId/dateEcheance/etablissement, bloc signature). Prochain lot : F (`js/signature.js`). |
