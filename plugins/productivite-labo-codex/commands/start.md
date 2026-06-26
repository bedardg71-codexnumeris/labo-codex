---
description: Orientation Cowork — lire les fichiers de cadrage et rapporter l'état du projet
---

# Commande Start

Donner à Claude (et à Grégoire) une vue d'ensemble du projet en début de session Cowork, **à partir des vrais fichiers**. Cette commande ne crée rien : elle lit et rapporte.

> En Claude Code, le rituel complet et exécutable vit dans `Skills pour Claude Code/SKILL_Debut_de_session.md` (audit git + tests + version + lecture SESSION/BACKLOG). `/start` en est la version légère, orientée Cowork.

## Instructions

### 1. Repérer les dossiers connectés

Le projet vit sur deux dossiers à rôles distincts :

- **Dépôt de code** – reconnaissable à `CLAUDE.md`, `BACKLOG.md`, `version.json`, `Skills pour Claude Code/` (typiquement `Monitorage_v6`).
- **Dossier Cowork** – reconnaissable à `communauté/`, `Ressources partagées/`, plans de travail pédagogiques (typiquement `Claude H2026 cowork…`).

Si un seul est connecté, travailler avec ; si aucun n'a les fichiers attendus, le signaler et proposer de connecter le bon dossier.

### 2. Lire les fichiers de cadrage (lecture seule)

Dans le dépôt de code, dans cet ordre :

1. `version.json` – numéro courant (clé `beta`, SemVer) et build.
2. `Retours des testeurs/SUIVI-BUGS.md` – **priorité absolue** : bugs ouverts non traités.
3. `SESSION.md` – contexte et dernier enchaînement de la session courante (gros fichier : lire la fin / l'en-tête de session récente).
4. `BACKLOG.md` – en-tête (état courant, dernier ID, prochain enchaînement acté) + section « À faire ».
5. `ETAT-PROJET.md` – tableau de bord synthétique (§2) pour se situer vis-à-vis des objectifs.

### 3. Rapporter l'état

Format de sortie suggéré :

```
État du projet — Labo Codex
- Version : Bêta publique <X.Y.Z> (build <…>)
- Session courante : <résumé 1-2 lignes de SESSION.md>
- Retours testeurs ouverts : <n> (priorité absolue) → <les plus urgents>
- Backlog : prochain enchaînement acté = <…>
- Cap : <objectif courant, ex. stabilité pour les expérimentateurs / CoP AQPC>
```

Puis proposer :
```
- /productivite-labo-codex:update pour trier le backlog et vérifier les écarts
- « qu'est-ce que j'ai à faire » pour un point sur les tâches ouvertes
```

## Notes

- **Ne rien créer ni modifier** à l'orientation : pas de `TASKS.md`, pas de `dashboard.html`.
- En Cowork, l'agent tourne dans une VM : ne pas tenter d'ouvrir des fichiers via `open`/`xdg-open`.
- La version est lue dans `version.json` (source unique) – ne jamais la déduire d'un autre fichier, qui peut être périmé.
- Les retours testeurs passent toujours avant le backlog planifié (politique `CLAUDE.md`).
