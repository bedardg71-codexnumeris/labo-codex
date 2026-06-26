# Connecteurs

## Configuration actuelle

Ce plugin fonctionne **sans connecteur obligatoire**. Toutes les sources de vérité sont des fichiers locaux, répartis sur deux dossiers.

**Dépôt de code (`Monitorage_v6`)**
- `CLAUDE.md` – point d'entrée, principes, zones protégées, versionnage
- `BACKLOG.md` / `BACKLOG-ARCHIVE.md` – tâches ouvertes / livrées
- `SESSION.md` – contexte de la session courante
- `ETAT-PROJET.md` – état vis-à-vis stabilité / pérennité / qualité
- `Skills pour Claude Code/` – référence métier (skills)
- `Retours des testeurs/` – `SUIVI-BUGS.md`, `USAGE-FORMATS.md`
- `docs/`, `plans de travail/`, `version.json`

**Dossier Cowork (`Claude H2026 cowork…`)**
- `communauté/` – membres, rôles, journal, pistes stratégiques
- `Ressources partagées/`, présentations, formations, notes de conception

## Connecteurs optionnels

| Catégorie | Outil | Intérêt |
|-----------|-------|---------|
| Dépôt / CI | GitHub | Lier `BACKLOG.md` aux issues/PR, suivre les déploiements |
| Déploiement | Netlify, Cloudflare | Suivre les builds de `app.codexnumeris.org` |

À ajouter dans `.mcp.json` seulement si le besoin se confirme – pas avant (principe zéro-dette).
