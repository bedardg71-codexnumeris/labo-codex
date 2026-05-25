# ADR-001 : Choix de JavaScript vanilla (pas de framework)

**Statut** : Acté rétroactivement
**Date de décision originale** : octobre 2025 (formalisation : 14 mai 2026)
**Auteur** : Grégoire Bédard (et Claude Code pour la formalisation)

---

## Contexte

Labo Codex est développé par un enseignant de littérature au cégep, sans équipe technique permanente, dans un environnement scolaire où :
- L'application doit fonctionner sur les postes des collègues et les iPads des étudiants, sans installation préalable et sans dépendance serveur.
- Le mainteneur unique a une bande passante cognitive limitée et n'est pas un développeur professionnel : la stack doit être tenable seul, sur une décennie potentielle.
- Les outils de build modernes (webpack, vite, rollup) ajoutent une couche de tooling qui peut casser entre versions Node et qui demande une maintenance continue.
- Les frameworks SPA (React, Vue, Svelte, Angular) imposent une dette d'écosystème : upgrades semestriels, transitive deps, breaking changes.

Au moment du démarrage, plusieurs options ont été envisagées : vanilla JS, framework SPA léger (Svelte, Alpine.js), ou framework complet (React + bundler).

---

## Décision

**Tout le code applicatif est écrit en JavaScript ES6+ vanilla, sans framework SPA et sans étape de build.** Les seules dépendances tierces sont des librairies utilitaires vendored dans `libs/` (Chart.js, jsPDF, html2canvas, JSZip, pdf.js) — chargées via `<script src="...">` dans `index.html`.

---

## Conséquences

### Positives

- **Aucune chaîne de build** : éditer un `.js`, recharger le navigateur, c'est en production. Onboarding instantané pour un développeur tiers.
- **Aucune dette de tooling** : pas de Node version, pas de package-lock, pas de migration webpack → vite.
- **Code lisible directement dans le navigateur** : DevTools attaque le fichier source, pas un bundle minifié.
- **Compatibilité longue durée** : ES6+ est stable et supporté partout depuis 2017. Le code de 2025 fonctionnera en 2035 sans réécriture.
- **Empreinte légère** : pas de runtime de framework chargé avant que l'application démarre.

### Négatives

- **Pas de réactivité automatique** : chaque module gère son DOM manuellement. Risque de désynchronisation modèle/vue (atténué par le pattern Single Source of Truth via `localStorage`, cf. ADR-004).
- **Pas de typage statique** : TypeScript exclu. Les contrats inter-modules reposent sur la discipline du mainteneur et la documentation (`CLAUDE.md`, `docs/DATA-OWNERSHIP.md`).
- **Pas de tree-shaking** : tous les modules sont chargés au démarrage (`<script>` tags dans `index.html`). À ~129 fichiers JS et 50k+ lignes, le démarrage commence à être notable sur iPad Air M1.
- **Pas de composants réutilisables au sens framework** : le pattern « composant » est simulé par convention (préfixes `org-*`, `planif-*`, helpers comme `BibliothequeUI`).

### Neutres

- **CSP `script-src 'self'`** : aucune dépendance CDN, tous les scripts sont locaux — cohérent avec le mode hors-ligne (cf. ADR-003).

---

## Alternatives considérées

### Option A : Svelte (compilé en JS vanilla)

Aurait offert une réactivité par composants tout en produisant du JS vanilla en sortie. **Écartée** parce que la chaîne de build est requise et que l'écosystème évolue trop vite pour un mainteneur unique non-développeur professionnel.

### Option B : Alpine.js (vanilla + sucre déclaratif)

Aurait apporté de la réactivité légère sans build. **Écartée** parce qu'elle aurait introduit une dépendance externe sur un projet plus petit que Chart.js, donc plus exposée à l'arrêt de maintenance amont.

### Option C : React + bundler (vite ou webpack)

Aurait été l'option mainstream. **Écartée** parce que l'effort de maintenance du tooling (versions Node, breaking changes Vite/webpack, mise à jour de centaines de transitive deps) est incompatible avec un mainteneur unique non-développeur professionnel.

---

## Références

- `CLAUDE.md` §"Contraintes techniques" — confirmation de la stack.
- `index.html` lignes ~15990-16100 — chargement des `<script>` tags.
- Audit annuel 2026, sous-audit 2.1 (LOC) — mesure de la taille du codebase.

---

## Notes de révision

Aucune révision à ce jour. Cette décision sera réexaminée si :
- Le démarrage de l'application devient bloquant sur iPad (> 3 s).
- Un co-mainteneur professionnel rejoint le projet et propose une stack alternative.
- L'application doit être déployée à des centaines d'écoles et la performance devient critique.

---

**Source du format** : Michael Nygard, *Documenting Architecture Decisions* (2011), <https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions>
