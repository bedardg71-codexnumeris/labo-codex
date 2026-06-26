---
name: task-management
description: >
  Pilotage des tâches de développement de Labo Codex via le fichier BACKLOG.md
  du dépôt de code (et son archive BACKLOG-ARCHIVE.md). Référencer ce skill
  quand Grégoire demande ses tâches, veut en ajouter/compléter/trier, ou suivre
  l'avancement. Déclencher aussi quand Grégoire dit « qu'est-ce que j'ai à faire »,
  « ajoute un item », « c'est livré », « qu'est-ce qui bloque », ou demande
  l'état d'une version. Les retours testeurs (SUIVI-BUGS.md) passent AVANT le backlog.
---

# Gestion des tâches — Labo Codex

Les tâches **ne vivent pas** dans un fichier propre au plugin. Elles vivent dans `BACKLOG.md`, à la racine du dépôt de code (`Monitorage_v6`), déjà mûr et organisé. Ce skill apprend à le lire et à l'écrire **selon ses conventions réelles** – pas à le remplacer.

## Où sont les tâches

| Fichier | Rôle |
|---------|------|
| `BACKLOG.md` | Items **ouverts** uniquement (à faire / en cours) |
| `BACKLOG-ARCHIVE.md` | Historique complet des items livrés/abandonnés (chronologique) |
| `SESSION.md` | Contexte de la session courante, dernières livraisons + commits |
| `ETAT-PROJET.md` | Situation vis-à-vis des objectifs (pas un backlog) |
| `Retours des testeurs/SUIVI-BUGS.md` | Bugs signalés par les testeurs – **priorité absolue** |

Si plusieurs dossiers sont connectés, `BACKLOG.md` est dans le **dépôt de code** (celui qui contient aussi `CLAUDE.md` et `version.json`).

## Priorité : les retours testeurs d'abord

Politique actée dans `CLAUDE.md` : **quand un testeur signale un bug ou un besoin, on interrompt le plan en cours.** Avant de proposer un point sur le backlog, vérifier `Retours des testeurs/SUIVI-BUGS.md` et signaler ce qui y est ouvert.

## Conventions réelles du backlog

### Format d'un item

```markdown
- [ ] [emoji] **#XX** Description courte
  - Détail / contexte
  - Décision Grégoire (datée) si pertinent
```

L'`#ID` est un numéro **unique et croissant** ; le dernier utilisé est indiqué dans l'en-tête de `BACKLOG.md` (« Dernier ID utilisé »). Ne jamais réattribuer un numéro.

### Légende des priorités (emoji)

| Emoji | Sens |
|-------|------|
| 🟡 | Important pour les expérimentateurs post-AQPC (première vague d'utilisateurs externes) |
| 🟢 | Backlog long terme (utile, sans urgence – peut attendre la rentrée) |
| 📦 | Reporté / hors v1.0 (acté par Grégoire ou par calendrier) |
| ⚠️ | Priorité haute actée (décision Grégoire datée) |
| 📐 | Décision UX en attente (besoin d'un choix de Grégoire avant de coder) |

### Sections

Le backlog est classé **par thème, pas par ordre d'exécution** (le plan d'exécution vit dans `plans de travail/`). Sections existantes : Bugs UX et cohérence interface, Refonte des textes, Fonctionnalités à compléter, Conception pédagogique et architecture des pratiques, Cohérence visuelle UI, Codex / Onboarding, Données démo, Recherche / Analyse longitudinale, modules (Travaux, Planification, Évaluation), Sécurité.

## Comment interagir

**« qu'est-ce que j'ai à faire » / « mes tâches »**
- Lire d'abord `SUIVI-BUGS.md` (testeurs), puis l'en-tête de `BACKLOG.md` (état courant, prochain enchaînement acté) et la section « À faire ».
- Résumer les items ⚠️ et 🟡 en premier, signaler les 📐 (en attente d'une décision de Grégoire).
- Situer par rapport au cap courant (ex. stabilité pour les expérimentateurs, mi-août 2026).

**« ajoute un item » / « il faudrait que »**
- Demander/déduire la section thématique et la priorité (emoji).
- Attribuer le prochain `#ID` (dernier + 1, d'après l'en-tête), ajouter `- [ ] [emoji] **#XX** Description` + sous-puces.
- Mettre à jour « Dernier ID utilisé » dans l'en-tête.
- **Demander confirmation avant d'écrire** – ne jamais ajouter automatiquement.

**« c'est livré » / « terminé »**
1. Passer `[ ]` en `[x]` et ajouter `✅ LIVRÉ (date, build)`.
2. **Déplacer l'item entier** (avec son contexte) dans `BACKLOG-ARCHIVE.md`, section datée.
3. Si pertinent, noter la livraison + le commit dans `SESSION.md`.

**« qu'est-ce qui bloque » / « en attente »**
- Items 📐 (décision UX en attente) et dépendances signalées dans les sous-puces.
- Items dont l'en-tête note qu'ils sont séquencés après un autre (ex. « APRÈS #328 »).

**état d'une version**
- La version courante est dans `version.json` (clé `beta`, SemVer). Ne pas la déduire d'un autre fichier.
- Comparer les items livrés récents (`SESSION.md`, `BACKLOG-ARCHIVE.md`) au cap visé.

## Conventions d'écriture

- Respecter la graphie existante du backlog (gras sur `**#XX**`, sous-puces de contexte, décisions datées).
- Ne pas inventer d'étiquettes de module : le backlog s'organise par **section + emoji + #ID**, pas par tags `[XXX]`. Les noms de modules, eux, sont documentés dans `SKILL_labo_codex.md`.
- Ne jamais marquer un chantier « post-AQPC » ou « à reporter » dans le code : principe zéro-dette (`CLAUDE.md`). Le report explicite d'un *item de backlog* se fait avec 📦.

## Extraction de tâches

Pendant une session, proposer d'ajouter au backlog les éléments identifiés (bugs, frictions testeurs, incohérences doc, idées). Toujours demander confirmation avant d'écrire, et router au bon endroit : un bug testeur va d'abord dans `SUIVI-BUGS.md`.
