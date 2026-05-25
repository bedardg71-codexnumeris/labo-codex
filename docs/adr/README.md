# Architecture Decision Records — Labo Codex

**Format** : Michael Nygard, *Documenting Architecture Decisions* (2011).
**Création** : 14 mai 2026, dans le cadre du sous-audit 4.1 Documentation (axe 4 Soutenabilité de l'audit annuel 2026).
**Statut global** : ADRs rétroactifs — les décisions ont été prises au fil du développement entre octobre 2025 et mai 2026 ; ces fiches les formalisent a posteriori à des fins de transparence et d'onboarding tiers.

---

## Pourquoi des ADRs ?

Labo Codex a été développé par un mainteneur unique (Grégoire Bédard) sur ~7 mois avec Claude Code comme assistant. Beaucoup de décisions structurantes ont été prises sans documentation explicite. Les ADRs comblent ce vide :

- **Pour un tiers** qui découvre le projet, expliquer pourquoi telle option a été retenue plutôt qu'une autre.
- **Pour le mainteneur** lui-même, garder trace des compromis acceptés et des contraintes qui s'appliquent toujours.
- **Pour la suite du projet**, fournir une base de référence quand une décision doit être réexaminée (ex. : passer à un framework, changer de stockage, ajouter un build step).

Les ADRs ne décrivent pas le code en détail — ils décrivent **la décision** (contexte, choix, alternatives écartées, conséquences). Pour la documentation technique, voir `/docs/00-START-HERE.md` et les modules de `/docs/architecture/`.

---

## Index des ADRs

| ADR | Titre | Statut |
|---|---|---|
| [ADR-001](001-javascript-vanilla.md) | Choix de JavaScript vanilla (pas de framework) | Acté rétroactivement |
| [ADR-002](002-indexeddb-localstorage.md) | Stockage hybride IndexedDB + localStorage | Acté rétroactivement |
| [ADR-003](003-mode-hors-ligne.md) | Mode 100 % hors-ligne | Acté rétroactivement |
| [ADR-004](004-single-source-of-truth.md) | Pattern Single Source of Truth (SSOT) | Acté rétroactivement |
| [ADR-005](005-echelle-idme.md) | Échelle IDME plutôt que notation numérique classique | Acté rétroactivement |
| [ADR-006](006-fenetre-glissante-acp.md) | Fenêtre glissante de 3 artefacts pour A-C-P | Acté rétroactivement |
| [ADR-007](007-vocabulaire-descriptif.md) | Vocabulaire descriptif (« difficulté émergente / plateau / persistante ») | Acté rétroactivement |
| [ADR-008](008-cloudflare-access.md) | Cloudflare Access pour authentification | Acté rétroactivement |
| [ADR-009](009-licences.md) | AGPL v3 (code) + CC BY-NC-SA 4.0 (contenu) | Acté rétroactivement |
| [ADR-010](010-vibe-coding-claude-code.md) | Développement en vibe coding avec Claude Code | Acté rétroactivement |
| [ADR-011](011-quatre-espaces-donnees.md) | Architecture quatre espaces de données (Codex / Réserve / Codex data / Voûte) | Acté rétroactivement |
| [ADR-012](012-audit-annuel.md) | Politique d'audit annuel | Acté rétroactivement |

---

## Workflow ADR

### Quand créer un ADR ?

Quand une décision structurante est prise — celle qui sera regrettée si l'on doit la défaire en silence. En pratique : choix d'un framework, d'un format de données, d'un protocole d'échange, d'une licence, d'une politique opérationnelle, d'un compromis pédagogique.

**Pas un ADR pour** : nommer une variable, refactorer une fonction, corriger un bug, ajouter une fonctionnalité dans un cadre déjà acté.

### Statuts standards

- **Proposé** : décision en cours de discussion, pas encore appliquée.
- **Accepté** : décision actée et appliquée dans le code.
- **Acté rétroactivement** : décision déjà appliquée dans le code, formalisée a posteriori (cas des ADRs 001-012).
- **Déprécié** : décision plus appliquée mais conservée pour l'historique.
- **Remplacé par ADR-YYY** : décision superseded par une nouvelle.

### Numérotation

Séquentielle, jamais réutilisée. Si ADR-005 est déprécié et remplacé, créer ADR-013 « remplace ADR-005 ».

### Template

Copier `adr-template.md` dans ce dossier et renommer en `NNN-titre-court-kebab-case.md`.

---

## Limites connues

- Les ADRs 001-012 sont **rétroactifs**. Ils reflètent une reconstitution honnête mais ne capturent pas tous les micro-arbitrages du moment où la décision a été prise. Pour les cas litigieux ou les pivots, l'historique git (`git log --follow`) reste la source de référence.
- Le projet n'a pas tenu d'ADR pendant son développement initial. Cette politique entre en vigueur à partir du 14 mai 2026 : toute nouvelle décision structurante doit produire un ADR avant ou pendant son implémentation.
- Deux documents existants dans `docs/decisions/` (`2025-11-systeme-pratiques.md`, `2025-12-namespacing.md`) suivaient un format proche mais non standardisé. Ils restent en l'état comme traces historiques ; leurs décisions sont reprises et formalisées dans les ADRs ci-dessus (notamment ADR-011 pour le namespacing).
