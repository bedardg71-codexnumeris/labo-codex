# Archives des plans de travail

> **Créé le 8 août 2026**, à la demande de Grégoire, au terme d'un point sur les
> 91 documents du répertoire. Rien n'est supprimé : un plan archivé reste
> lisible et son historique git est intact (`git mv`, pas de réécriture).

## Ce qui vit ici

Un plan entre ici quand **son travail est fait** ou quand **sa prémisse est
morte** — jamais parce qu'il est vieux. Les plans encore actifs, reportés ou
en attente de décision restent dans `plans de travail/`.

## Ce qui a été archivé le 8 août 2026

### Livrés — le plan dormait, le travail était fait

Aucun de ces cinq plans n'était cité dans `BACKLOG.md` ni `SESSION.md` ; leur
exécution a été **vérifiée au code**, pas déduite de leur en-tête.

| Plan | Preuve relevée |
|---|---|
| `PLAN-BILAN-REFLEXIF-V2.md` | 9 modules `js/bilan-reflexif-*.js` |
| `PLAN-NETTOYAGE-WIZARD-V1-2026-04-28.md` | zéro occurrence de `ouvrirWizardPratique`, DOM V1 absent d'`index.html` |
| `PLAN-AUDIT-PHASE5-DEMO.md` | `js/donnees-demo.js` retiré en Phase 5.D |
| `Plan - Rythme (tableau de bord évaluation).md` | `js/rythme.js` existe |
| `PLAN-MENAGE-ROOT-2026-05-08.md` | le plan comptait 63 entrées au root, il y en a 45 |

### Périmés ou clos par décision

| Plan | Motif |
|---|---|
| `RELAIS-326-reactivation-comparateur.md` | clôturé le 28 juin 2026 (release 1.26.0) — son propre en-tête le dit |
| `VALIDATION-367-notes-lecon-consigne.md` | protocole volontairement NON exécuté (décision Grégoire, 7 août) |
| `REPRISE-AOUT-2026.md` | dossier de reprise écrit en juillet ; la reprise a eu lieu |
| `PLAN_sessionB_representations_303.BROUILLON-LOCAL-presync-20260605.md` | brouillon local ; la version versionnée fait foi, Session B est livrée |
| `PLAN-CARROUSEL-SEQUENCES.md` | ⚠ **prémisse morte** : il répondait à « l'import MD en bloc encombre le canevas ». L'import MD est retiré (1.57.0) et la carte montre tout depuis 1.56 |
| `PLAN-IMPORT-EXPORT.md` (6 janvier 2026) | absorbé par `docs/architecture/ECOSYSTEME-DONNEES.md` — Codex / Archives / Codex data / Voûte |

## Second passage — 8 août 2026 (soir)

Audit des 76 plans **cités** dans BACKLOG/SESSION, à la demande de Grégoire.

### Périmés vérifiés (2)

| Plan | Motif |
|---|---|
| `PLAN-ORGANISATEUR-LAYOUT.md` | refonte du layout de l'Organisateur — **la page est supprimée** (#424 Lot G, 1.57.0) |
| `PLAN_chrome_unifie_Labo_Codex.md` | chrome unifié **livré le 24 mai 2026** ; le plan portait encore « Spec finalisée, à exécuter » |

### Documents de PASSATION consommés (10)

Relais, consignes de session et protocoles : ils cadrent **une** session, qui a
eu lieu. Ils citent des items encore ouverts parce qu'ils listent des SUITES —
pas parce qu'ils restent à faire. Chantier livré vérifié pour chacun.

`RELAIS-2026-07-02-cinq-taches` · `RELAIS-2026-07-02-vague-2` ·
`RELAIS-2026-07-03-vague-3` · `RELAIS-cadre-trimestre-2026-08-04` ·
`RELAIS-alignement-2026-08-06` · `PROTOCOLE-358-migration-live` (migration
exécutée et validée le 28 juin) · `AUDIT-2026-08-05-consigne` (versé en
#379-#393) · `AUDIT-PERF-LOGIQUE-consigne` (versé en #394-#402) ·
`CORRECTIFS-PERF-LOGIQUE-consigne` (livré en 1.31.14→1.31.22) ·
`PLAN-planificateur-grille-2026-08-06`

⮕ Toutes les références de la base ont été **recâblées** vers `_archives/`
(5 fichiers touchés) — aucun lien mort.

### Volontairement LAISSÉS en place

- **Le dossier #307** (simuler/comparer des pratiques) : `SPEC_comparateur_pratiques`,
  `SPEC_simulation_pratiques_307`, `NOTE-CONCEPTION-C0/C1/C2`, `NOTE-COWORK-comparateur`,
  `PLAN_refonte_assistant_pratique_post-audit`, `PLAN_sessionC_calcul_303` — chantier
  **non fait**, c'est de la matière vivante.
- **Les plans du 6-8 août** : livrés, mais **portes terrain non passées**.
- `CHECKLIST-portes-terrain-2026-08-08`, `VALIDATION-TERRAIN-2026-08-07-consigne`,
  `TEST-ONBOARDING-COWORK-consigne` : protocoles **encore à dérouler**.
- `RELAIS-326-refonte-banc-decision` : désigné **source unique** par
  `SKILL_pratiques_notation.md` — on n'archive pas ce qu'un skill cite comme référence.
- `PLAN-335-336-garde-fous-donnees`, `RELAIS-283-responsive-sidebar`,
  `RELAIS-297-dette-css`, `RELAIS-grilles-h2026-desappariees` : leurs items
  (#336, #283, #297) sont **ouverts** — non tranchés, gardés par prudence.

## Ce qui n'a PAS été archivé, et pourquoi

- Les plans **jamais amorcés mais encore pertinents** : Cloudflare (#427),
  `PLAN_sessionC_calcul_303.md` (#303), désaturation localStorage (#353),
  recadrage du skill Écosystème (reporté par Grégoire).
- Les plans **de la semaine du 6-8 août**, dont les portes terrain sont encore
  ouvertes chez Grégoire — ils sont livrés mais pas encore validés au doigt.
- ✅ **Les 76 plans cités ont été audités** au second passage (ci-dessus, 8 août
  au soir). ⚠ Limite de ce tri : il classe par NATURE et par état des items
  cités, pas par lecture intégrale. Les 16 documents encore listés « actifs »
  et non archivés sont ceux dont le statut demandait un jugement — ils sont
  nommés dans « Volontairement LAISSÉS en place ».
