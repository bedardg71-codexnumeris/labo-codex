# Plan — Reconstruction des trimestres & capacité multi-trimestres

> **Statut** : feuille de route (chapeau). Rédigé le 25 juin 2026 (Claude Code, sur cadrage Grégoire).
> **Horizon** : outils multi-trimestres prêts et éprouvés pour la **fin de la session Automne 2026** (CoP — premiers utilisateurs externes, à leur 1er trimestre).
> **Nature** : document de séquencement. Le détail technique de chaque chantier vit dans les plans dédiés (voir §7) — ce document les ordonne, pose les dépendances et les garde-fous.

---

## 0. Pourquoi ce plan (l'objectif réel)

Reconstruire rétroactivement 4 trimestres réels — **H26** (actif), **A25**, **A24**, **H24** — n'est **pas** une fin en soi, ni « des données pour l'article » (celui-ci est un sous-produit). L'objectif est de **développer et éprouver la capacité multi-trimestres de l'application** sur des données réelles, **avant** que les utilisateurs de la CoP en aient le besoin.

Bénéfice stratégique : une **longueur d'avance**. Quand les nouveaux utilisateurs en seront à leur 1er trimestre (A26), l'app aura déjà été exercée sur quatre trimestres — comparateur de pratiques, outils longitudinaux, archives, récupération inter-trimestre, voire Voûte, déjà fonctionnels et validés.

**Principe pédagogique sous-jacent (acté)** : *chaque trimestre porte ses propres documents pédagogiques* (productions, grilles, échelles, cartouches, pratique de notation). C'est la condition du comparateur et du longitudinal. → voir mémoire `objectif-reconstruction-multi-trimestres` et `namespacing-par-trimestre`.

---

## 1. Principe directeur : trois axes entrelacés

| Axe | Contenu | Rôle |
|---|---|---|
| **Socle** | Namespacing par trimestre (Briques B/C/D) | Condition de tout le reste |
| **Données** | Reconstruction des trimestres (A25 pilote → A24 → H24) | Banc d'essai réel |
| **Outils** | Comparateur → longitudinal → archives → récupération inter-trimestre → Voûte | La valeur produit pour la CoP |

Les outils s'appuient sur le socle ET sur les données. D'où l'ordre des phases ci-dessous.

---

## 2. État des lieux (25 juin 2026)

**Par trimestre**

| Trimestre | Statut | Données Labo Codex natives ? | Reconstruction = |
|---|---|---|---|
| **H26** | actif, vivant | oui (en cours) | ne rien casser ; namespacer plus tard (Brique D) |
| **A25** | archivé | oui (`a2025_*`, validé Omnivox, L0 vert) | **portage** : recréer les modèles + ré-évaluer avec le moteur actuel |
| **A24** | — | non (app inexistante alors) | **ingestion externe** (tableurs/PDF) |
| **H24** | — | non (app inexistante alors) | **ingestion externe** (tableurs/PDF) |

**Acquis (socle)**
- **Brique A — lecture namespacée : FAITE** (les écrans d'analyse + flux d'évaluation lisent les modèles via `cle()`). 928 tests Vitest verts.
- Mécanisme natif d'archivage (`creerSnapshotRessources`, `trimestres.js`) : copie les modèles **utilisés** vers `a2025_*` à l'archivage. Présent mais à exercer.

**Manque (socle)** : Briques **B** (création namespacée), **C** (import = copie), **D** (migration du global existant).

**Contexte historique A25 (déterminant)** : A25 a été évalué avec une **version antérieure du moteur** (codes d'erreurs saisis à la main, calcul différent, module d'annotation inexistant). → Le moteur **actuel** ne reproduit pas mécaniquement les notes A25 stockées : aucun patch d'affichage n'est une vraie solution, la reconstruction native l'est. Les notes **stockées** (validées Omnivox) restent la source de vérité jusque-là.

---

## 3. Feuille de route (phases)

> Chaque phase : **Objectif · Prérequis · Étapes · Critère de fin · Risques.**
> Une phase à la fois (préserver le focus). Détail fin arrêté en ouverture de chaque phase, à froid.

### Phase 0 — Test « voie courte » A25 *(diagnostic, rapide)*
- **Objectif** : répondre à *« le moteur actuel sait-il re-dériver les notes A25 à partir des codes/erreurs ? »* et offrir, si oui, une consultation A25 correcte en attendant la reconstruction.
- **Prérequis** : pilote modèles A25 déjà posé (fait, via `scripts/poser-modeles-a25-console.js`).
- **Étapes** : (a) simulation Node — recalculer le critère français algo (mode catégories) sur les évals A25 et comparer aux valeurs stockées (`pourcentage`, `noteCalculee`) ; (b) **activer le mode catégories pour A25** (`a2025_modalitesEvaluation.activerCategorisationErreurs = true`, via console) ; (c) ouvrir une éval terminale (rédaction) + un artefact rédaction, vérifier le retour vers la note stockée (≈ 76,6 % sur l'éval-pilote) et l'affichage des codes d'erreurs.
- **Critère de fin** : écart moteur actuel ↔ notes stockées **documenté** ; consultation A25 affichant les bons nombres d'erreurs (mode catégories actif). Un écart notable = repère pour la reconstruction, pas un échec.
- **Risques** : ne pas **enregistrer** une éval rouverte (le recalcul écraserait la note stockée). Réversible (retrait du flag).

### Phase 1 — Socle : namespacing B/C/D *(le plus structurant)*
- **Objectif** : créer/importer/migrer des documents pédagogiques **par trimestre**, sans toucher au global partagé par erreur.
- **Prérequis** : Brique A (faite).
- **Étapes** : Brique **B** (création écrit dans `<tri>_`), Brique **C** (import inter-trimestre = duplication, pattern `copiePropre`/`dupliquerGrillePartagee`), Brique **D** (migration du global actuel vers les trimestres, sur copie + backup). **Cat. 6** (compteurs `statistiques.js`, tour `accompagnement.js`) **reste global** — ne pas namespacer (§6). → détail : `PLAN-namespacing-par-trimestre.md`.
- **Critère de fin** : créer une grille en A25 actif l'écrit dans `a2025_grillesTemplates` (pas le global) ; **H26 intact** ; golden master L0 **vert** ; chaque Brique ajoute ≥ 1 test sentinelle break-testé.
- **Risques** : H26 est le trimestre vivant — toute migration sur copie + backup, jamais destructive.

### Phase 2 — Pilote : reconstruction native A25
- **Objectif** : A25 devient un vrai trimestre dynamique (modèles natifs, évaluations recalculables avec le moteur actuel), puis figé par archivage.
- **Prérequis** : Phase 1 (sinon les créations polluent le global/H26).
- **Étapes** : recréer dans Conception les 3 grilles (FR-HOLIS, Grille-4/SRPN, FR-ALGO) + échelles + cartouches + pratique (namespacés grâce à B) ; importer les PDF originaux (productions) via `validerMagicBytes` ; ré-évaluer/reconstituer avec le moteur actuel ; valider contre Omnivox ; **archiver** (lecture seule). → détail : `PLAN-restauration-longitudinale-A25.md`.
- **Critère de fin** : notes A25 = Omnivox (L0 vert), consultation cohérente (échelle, critères, calculs vivants), A25 archivé non modifiable.
- **Risques** : ne pas perdre les données `a2025_*` existantes (backup avant) ; écart de calcul ancien/nouveau moteur à assumer explicitement (c'est le but : passer au moteur actuel).

### Phase 3 — Comparateur de pratiques *(premier outil débloqué)*
- **Objectif** : comparer des pratiques de notation entre trimestres (H26 ⇄ A25 d'abord).
- **Prérequis** : Phase 1 + au moins 2 trimestres comparables (H26 + A25 reconstruit).
- **Étapes** : reprendre le chantier suspendu. → `SPEC_comparateur_pratiques.md`, `SPEC_D_exploration_pratiques.md`, `NOTE-CONCEPTION-C0/C1/C2`, `SPEC_simulation_pratiques_307.md`.
- **Critère de fin** : comparer la pratique A25 et la pratique H26 sur des données réelles, sans confusion de trimestre.
- **Risques** : dépend de la qualité du namespacing (Phase 1) — ne pas démarrer avant.

### Phase 4 — Réplication A24 puis H24 *(ingestion externe)*
- **Objectif** : intégrer deux trimestres pré-Labo Codex à partir de sources externes.
- **Prérequis** : Phases 1-2 (la démarche A25 sert de patron) ; fonctionnalité d'**ingestion de résultats externes** (item pressenti **#347**).
- **Étapes** : concevoir l'import de tableurs/PDF externes (les `.numbers`/`.xls` A24/H24 existent) ; reconstruire **en complet** (artefacts + calculs, comme A25 — §6) ; valider ; archiver. **Chantier distinct et nettement plus lourd que A25** (pas de données natives + profondeur complète assumée).
- **Critère de fin** : A24 et H24 consultables et comparables aux autres, archivés.
- **Risques** : ampleur (saisie/ingestion massive) ; à ne pas sous-estimer ni démarrer avant que A25 ait fait ses preuves.

### Phase 5 — Outils multi-trimestres
- **Objectif** : longitudinal, projet d'archives, récupération inter-trimestre, (Voûte).
- **Prérequis** : socle + ≥ 2 trimestres (idéalement 4).
- **Étapes** : à cadrer un par un, au fur et à mesure des besoins réels. Voûte → `PLAN-VOUTE-PHASES-1-8.md`.
- **Critère de fin** : chaque outil validé sur les trimestres reconstruits.
- **Risques** : dispersion — n'ouvrir un outil que lorsque le précédent est livré.

---

## 4. Garde-fous transverses (toutes phases)

- **H26 est intouchable** : trimestre vivant. Toute manœuvre sur copie + backup ; jamais de migration destructive (CLAUDE.md, préservation des données personnelles).
- **Un golden master par trimestre** : comme L0 pour A25 (`scripts/valider-golden-master-trimestre.mjs`). Aucune note ne bouge sans qu'on le voie. Break-test (faire rougir) avant de faire confiance à une sentinelle.
- **Sécurité données** : blobs/PDF = données critiques, ne sortent pas de la machine ; imports via `validerMagicBytes` / `validerZipSecurite` ; lecture-seule sur les sources, écriture sur copie.
- **Zéro-dette** : chaque Brique retire ce qu'elle remplace (pas d'alias « au cas où »).
- **Un front à la fois** : une phase ouverte à la fois ; sessions de production dans la fenêtre 4 h-midi.

---

## 5. Dépendances (qui bloque quoi)

```
Brique A (faite)
      │
      ▼
Phase 1 Socle (B/C/D) ───────────┬───────────────┐
      │                          │               │
      ▼                          ▼               ▼
Phase 2 Reconstruction A25   Phase 3        Phase 4 A24/H24
      │                      Comparateur     (ingestion #347)
      │                      (besoin 2 trim.)        │
      └──────────────┬───────────────┬──────────────┘
                     ▼
        Phase 5 Outils multi-trimestres (longitudinal, archives, récup., Voûte)
```

Lecture : rien de durable ne se construit avant la **Phase 1**. Le comparateur (3) et la réplication (4) peuvent se faire dans un ordre ajustable une fois A25 reconstruit.

---

## 6. Décisions arrêtées (Grégoire, 25 juin 2026)

1. **Ordre Phase 3 vs 4** → **Comparateur d'abord**, puis A24/H24. Valoriser H26⇄A25 et valider l'architecture multi-trimestres sur 2 trimestres avant l'ingestion lourde.
2. **Phase 0** → **Simulation Node + activation du mode catégories dans l'app**. On diagnostique la reproductibilité du moteur ET on rend la consultation A25 utilisable en attendant la reconstruction (réversible ; garde-fou : ne pas réenregistrer une éval ouverte).
3. **Profondeur A24/H24** → **Complète** (artefacts + calculs), comme A25. Banc d'essai intégral ; renforce le besoin d'une ingestion externe robuste (#347).
4. **Cat. 6** (compteurs `statistiques.js` / tour `accompagnement.js`) → **Globaux** (onboarding / bibliothèque transversale, pas des données de trimestre).

---

## 7. Documents de référence

- `PLAN-namespacing-par-trimestre.md` — Briques A/B/C/D (socle).
- `PLAN-briqueA-ecrans-analyse-namespacing.md` — Brique A écrans (faite).
- `PLAN-restauration-longitudinale-A25.md` — pilote A25 (L0..L7).
- `SPEC_comparateur_pratiques.md`, `SPEC_D_exploration_pratiques.md`, `SPEC_simulation_pratiques_307.md`, `NOTE-CONCEPTION-C0/C1/C2-comparateur.md` — comparateur.
- `PLAN-VOUTE-PHASES-1-8.md` — Voûte.
- `scripts/poser-modeles-a25.mjs`, `scripts/poser-modeles-a25-console.js`, `scripts/valider-golden-master-trimestre.mjs` — outils A25.
- Mémoires : `objectif-reconstruction-multi-trimestres`, `namespacing-par-trimestre`, `verifier-avant-ecrire-donnees-reelles`.
