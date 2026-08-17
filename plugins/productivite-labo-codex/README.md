# Plugin Productivité — Labo Codex

Plugin de productivité pour le développement de Labo Codex (système de suivi des apprentissages et de construction de la note), en **bêta publique** depuis le lancement à l'AQPC le 3 juin 2026. Conçu pour Grégoire, développeur solo – désormais au service d'une première vague d'utilisateurs externes (expérimentateurs post-AQPC, communauté de pratique hébergée par l'AQPC à la rentrée).

## Principe : une couche, pas un système parallèle

Ce plugin **ne crée plus ses propres fichiers** (fini `TASKS.md`, `dashboard.html`, l'arborescence `memory/glossary.md`). Il s'appuie sur les vrais fichiers du projet, déjà mûrs, et te les rend lisibles et pilotables depuis Cowork. C'est l'application directe du principe « stabilité zéro-dette » de `CLAUDE.md` : on ne double pas ce qui existe déjà.

## Deux dossiers, deux rôles

Le plugin route selon le type de demande :

| Dossier | Rôle | Ce qu'on y trouve |
|---------|------|-------------------|
| **Dépôt de code** (`Monitorage_v6`) | Développement, code, suivi technique | `CLAUDE.md`, `BACKLOG.md`, `SESSION.md`, `ETAT-PROJET.md`, `.claude/skills/`, `docs/`, `Retours des testeurs/`, `version.json` |
| **Dossier Cowork** (`Cowork H26 App Labo Codex`) | Pédagogie, communauté, communication, **gestion du projet** | `communauté/`, `Ressources partagées/`, présentations, formations, plans de travail, notes de conception, `Gestion du projet/`, `Institutionnalisation de Labo Codex/` |

Tâche, bug, code, architecture → dépôt de code. Pédagogie, communauté de pratique, matériel, formation, **échéances, dépenses et démarches institutionnelles** → dossier Cowork.

### Gestion du projet (v3.1.0)

Le versant administratif du projet s'appuie sur deux fichiers sources dans le dossier Cowork, et sur le dossier des démarches institutionnelles :

| Fichier | Rôle |
|---|---|
| `Gestion du projet/ECHEANCIER.md` | Échéances, rencontres, jalons, et section distincte pour les intentions non engagées |
| `Gestion du projet/DEPENSES.md` | Abonnements récurrents, registre mensuel, cumul autofinancé, demandes budgétaires |
| `Institutionnalisation de Labo Codex/` | Document d'entrée du dossier, plus un sous-dossier par interlocuteur |

**Règle de rigueur inscrite dans le skill** : ne jamais consigner au passé une démarche qui n'a pas eu lieu. Les intentions vont au §4 de l'échéancier et n'en sortent que sur confirmation. Cette règle vient d'un incident réel documenté dans `PRIVACY.md` v1.2.

## Sources de vérité (ordre de priorité)

1. `Retours des testeurs/SUIVI-BUGS.md` – **priorité absolue** : un retour testeur passe AVANT le backlog.
2. `CLAUDE.md` – point d'entrée : principes (zéro-dette), zones protégées, rituels, versionnage.
3. `.claude/skills/` – référence métier (9 skills cœur + outils de session).
4. `BACKLOG.md` / `BACKLOG-ARCHIVE.md` – tâches ouvertes / livrées.
5. `SESSION.md` – contexte de la session courante.
6. `ETAT-PROJET.md` – situation vis-à-vis des objectifs stabilité / pérennité / qualité.
7. `version.json` – source unique de la version (SemVer ; libellé d'affichage « Bêta publique X.Y.Z »).

## Commandes

| Commande | Ce qu'elle fait |
|----------|-----------------|
| `/start` | Orientation : repère les dossiers connectés, lit les fichiers de cadrage, rapporte version + session + priorités (testeurs, backlog). Ne crée rien. |
| `/update` | Synchronise la vue : items périmés du backlog, fraîcheur de l'état-projet, vocabulaire ou skills nouveaux à refléter. |
| `/update --comprehensive` | Scan profond (docs, plans de travail, communauté, retours testeurs) pour faire remonter tâches non suivies et écarts. |

## Skills

| Skill | Description |
|-------|-------------|
| `memory-management` | Décode le jargon pédagogique et technique en consultant les sources canoniques (pas de cache dupliqué) |
| `task-management` | Pilote `BACKLOG.md` selon ses conventions réelles (items `#ID`, sections thématiques, emoji de priorité) |
| `gestion-projet` | Pilote l'échéancier, le registre des dépenses et les dossiers institutionnels (dossier Cowork). Distinct du développement. |

## Articulation avec les skills racine

La référence métier vit dans `.claude/skills/` (dépôt) et `skills/` (Cowork). Le plugin **n'en est pas la source** : en cas de doute sur une définition, il renvoie vers ces skills.

| Skill racine | Rôle |
|--------------|------|
| le skill `labo-codex` | Architecture, indices A-C-P-E, pratiques de notation, workflow |
| le skill `pratiques-notation` | Moteur de calcul des pratiques (SOM/STD/SPE/DEN), simulation, comparateur |
| le skill `ecosysteme-classe` | Cadre pédagogique (ELLAC, SOLO, PAN, SRPNF, IDME, cartouches) |
| le skill `alignement` | Module Alignement (carte mentale, leçons, séquences) |
| le skill `depistage-rai` | Dépistage SOLO, IPB, patterns, interventions |
| le skill `securite-donnees` | Sécurité, anonymisation, intégrité, Loi 25 |
| le skill `integrite-globaux` / le skill `hygiene-donnees-partagees` | Manipulation des clés globales partagées |
| le skill `verification-adverse` | Vérifier un travail (auto-vérification, audit tiers) |
| le skill `debut-de-session-labo-codex` / le skill `fin-de-session-labo-codex` | Rituels de session (Claude Code) |

## Sources de données

Le plugin fonctionne en local, sans connecteur obligatoire. Le code est hébergé sur GitHub et déployé via Netlify + Cloudflare Access (`app.codexnumeris.org`) ; un connecteur GitHub peut être ajouté plus tard (voir `CONNECTORS.md`).
