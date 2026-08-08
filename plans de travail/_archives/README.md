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

## Ce qui n'a PAS été archivé, et pourquoi

- Les plans **jamais amorcés mais encore pertinents** : Cloudflare (#427),
  `PLAN_sessionC_calcul_303.md` (#303), désaturation localStorage (#353),
  recadrage du skill Écosystème (reporté par Grégoire).
- Les plans **de la semaine du 6-8 août**, dont les portes terrain sont encore
  ouvertes chez Grégoire — ils sont livrés mais pas encore validés au doigt.
- ⚠ Les **76 plans cités** dans BACKLOG/SESSION n'ont **pas** été audités un par
  un : être cité prouve qu'un plan a été ouvert, pas qu'il est terminé. Un
  second passage les trierait — il reste à faire.
