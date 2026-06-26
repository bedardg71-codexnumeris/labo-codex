# Plan — Namespacing par trimestre (pilote A25 complet → A24/H24)

> Créé le 23 juin 2026 (session Claude Code local). **Cadrage à froid** d'une
> refonte d'architecture, à EXÉCUTER en sessions ultérieures. Prolonge le §8 de
> `PLAN-restauration-longitudinale-A25.md` (dont le §8.4 « essentiel » est livré).
> Ne pas improviser : suivre l'ordre du §7 et le filet du §6.

---

## 0. Principe directeur (Grégoire, 23 juin 2026)

> « Chaque trimestre devrait avoir ses propres documents. On peut les importer
> entre trimestres, mais on travaille toujours sur des copies. Comme ça les
> originaux restent intouchés dans leur trimestre d'origine. »

C'est l'**isolation par trimestre** (plan longitudinal §3, principe 1) portée à
son terme : les modèles (grilles, échelles, cartouches, productions) cessent
d'être des collections **globales partagées** ; chacun appartient à un trimestre.
Réf. `SKILL_integrite_globaux`, `SKILL_hygiene_donnees_partagees`.

---

## 1. Finalité

Faire d'A25 un **« vrai trimestre »** complet et isolé : modèles propres, travaux
réels (PDF) importés, notes justes, navigation fluide entre les productions d'un
élève — qu'on puisse l'ouvrir comme s'il était actif. **Pilote** : on mesure
l'effort réel, on tire les conclusions, puis on réplique sur A24 et H24.

---

## 2. État de départ (acquis, session 23 juin)

- **§8.4 « essentiel » LIVRÉ** : A25 isolé au niveau évals + cartouches
  (`scripts/restaurer-isoler-cartouches-A25.mjs`). L0 ✅ (MAE Omnivox 0,148,
  30/30), L2 ✅ (aucune grille partagée), 0 cartouche orpheline, H26 intact,
  consultation A25 OK (Évaluation terminale : 30 évalués, moyenne 72,1 %).
- **Symptôme résiduel** : à l'ouverture d'une éval A25, encadré « Grille d'origine
  introuvable — affichage depuis les données sauvegardées » + échelle vide. Les
  critères et la cartouche s'affichent quand même (fallback). Cosmétique en
  lecture seule. **Cause = namespacing incomplet** (cette refonte le résout).
- **Mécanisme natif PARTIEL et dormant** (à réveiller, pas à réinventer) :
  - l'archivage copie déjà les modèles utilisés vers `a2025_grillesTemplates`,
    `a2025_echellesTemplates`, `a2025_cartouches_<grille>` (`trimestres.js` ~590-621) ;
  - `cle()` route déjà vers ces clés quand un trimestre archivé est actif
    (`trimestres.js` 272-290) ;
  - **MAIS** les écrans lisent le global EN DIRECT (`db.getSync('grillesTemplates')`),
    et il n'y a **aucun swap** à la bascule (`changerTrimestreActif` 362-408 :
    vérifié, aucune restauration de templates). D'où le caractère dormant.

---

## 3. Les 4 briques de la refonte

### Brique A — LECTURE namespacée (cœur, à faire en premier)

Brancher les lectures de modèles sur `cle()` au lieu du global direct.
- **Call-sites connus** (à compléter par audit exhaustif) :
  - grilles : `chargerGrillesDansSelect` (evaluation-chargement.js:216),
    `_appliquerFallbackGrilleManquanteModif` (evaluation.js:2125) ;
  - échelles : evaluation-chargement.js:306/812/994, evaluation.js:337/1732 ;
  - cartouches : `db.getSync(\`cartouches_${grilleId}\`)` — evaluation.js:2103,
    evaluation-chargement.js:688/781/1123, evaluation-retroaction.js:244,
    grilles.js:2427, evaluation.js:2103 (~10 sites).
- **Levier** : `cle('grillesTemplates')` rend déjà `a2025_*` en mode archive ;
  pour les cartouches, prévoir `cle('cartouches_'+grilleId)`.
- **INVARIANT DE SÛRETÉ** : H26 (actif, **non** archivé) → `cle()` = clé globale
  → comportement **INCHANGÉ**. Le branchement n'affecte QUE les trimestres
  archivés ayant leurs propres modèles. À **prouver par test** avant tout commit.
- **Audit préalable obligatoire** (`SKILL_integrite_globaux` §2/§5) : lister TOUS
  les call-sites de `grillesTemplates` / `echellesTemplates` / `cartouches_`, et
  trancher cas par cas : lecture pour affichage/calcul → `cle()` ; création /
  bibliothèque partagée → à décider (peut rester globale, cf. Brique B/C).

### Brique B — CRÉATION namespacée

Créer une grille / échelle / cartouche écrit dans le **trimestre actif** (`cle()`),
plus dans le global. Auditer les `db.setSync('grillesTemplates'...)` et le wizard.

### Brique C — IMPORT inter-trimestre = COPIE

Importer un document d'un trimestre vers un autre = **duplication** (nouvel id,
trace `inspireDe`), l'original reste dans son trimestre. **Pattern existant à
généraliser** : `copiePropre` + `dupliquerGrillePartagee` (partage-section.js).

### Brique D — MIGRATION de l'existant (en DERNIER, risque maximal)

Répartir les collections globales actuelles (`grillesTemplates`,
`echellesTemplates`, `cartouches_*`) vers les clés namespacées de **chaque**
trimestre, selon l'usage réel. Sur **copie + backup** ; H26 actif à préserver ;
oracle = **aucune note ne bouge** (L0 reste vert sur tous les trimestres).

---

## 4. Pilote A25 complet (après Brique A)

1. **Intégrer les JSON A25** (grilles / échelles / cartouche — fournis par
   Grégoire) dans `a2025_grillesTemplates` / `a2025_echellesTemplates` /
   `a2025_cartouches_<grille>`. (Pratique `pan-litterature-a2025` déjà namespacée
   et lue — rien à refaire, sauf remplacement explicite.)
2. **Import des TRAVAUX réels (PDF)** — répertoire « A25 portfolio et terminale -
   pdf » (10 artefacts présents). Lien avec L3/L4 du plan longitudinal. Passer par
   `validerMagicBytes` (travaux-import.js) ; blobs = données CRITIQUES, ne pas les
   sortir de la machine (`SKILL_Securite_donnees` §1.3).
3. **Validation « trimestre actif »** :
   - notes justes → L0 reste VERT (golden master Omnivox) ;
   - plus d'avertissement « grille introuvable », échelle résolue ;
   - **navigation fluide entre les productions d'un même élève** (vérif terrain) ;
   - terrain Mac + iPad, modes sombre/clair.

---

## 5. Conclusions → Réplication A24 / H24

Mesurer l'effort réel du pilote A25, puis répliquer (mêmes briques). Avantage :
les tableurs complets A24/H24 sont déjà présents. Décider du niveau (complet vs
essentiel-étude) à la lumière du pilote. (= §7 du plan longitudinal.)

---

## 6. Filet (non négociable)

- **Oracles réutilisables** (déjà livrés, génériques par trimestre) :
  `valider-golden-master-trimestre.mjs` (L0), `sentinelle-isolation-grilles-trimestre.mjs` (L2).
- **Tests** : Brique A/B → au moins 1 Vitest (résolution `cle()`) + 1 Playwright
  (H26 inchangé ; A25 résolu sans avertissement). Règle projet (CLAUDE.md §Tests).
- **Données réelles** : toujours sur **COPIE + backup horodaté**, jamais l'original.
- **Break-test** des sentinelles (faire ROUGIR avant de faire confiance, §4 fin de session).

---

## 7. Ordre recommandé & risques

1. Audit exhaustif des call-sites (lecture seule).
2. Brique A (Lecture) + pilote A25 modèles + validation terrain.
3. Brique B (Création) + tests.
4. Brique C (Import-copie).
5. Import travaux PDF A25 + validation « trimestre actif » complète.
6. Brique D (Migration) — en dernier, risque max.
7. Réplication A24 / H24.

**Risque principal** : casser H26 (actif) en touchant la résolution. **Mitigation** :
invariant « H26 = global inchangé » prouvé par test AVANT tout déploiement.

---

## 8. Inputs / décisions ouvertes

- **JSON A25** (grilles / échelles / cartouche) à fournir par Grégoire.
- Périmètre **migration** (Brique D) : toutes les collections globales ? quelles
  clés restent légitimement globales (bibliothèque partagée, démo, génériques) ?
- Comportement **« copie à l'import »** : règles d'id, trace `inspireDe`, UI.
- Import des **travaux PDF** en mode archive (lecture seule) ou faut-il désarchiver
  A25 temporairement ? (impact sur le mécanisme de résolution).
