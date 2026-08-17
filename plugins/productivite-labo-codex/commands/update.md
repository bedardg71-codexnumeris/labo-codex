---
description: Synchroniser la vue du backlog et repérer les écarts depuis l'activité récente
argument-hint: "[--comprehensive]"
---

# Commande Update

Garder la vue du projet juste, **sans dupliquer** ses fichiers. Deux modes :

- **Par défaut** : trier les items périmés du backlog, vérifier la fraîcheur de l'état-projet.
- **`--comprehensive`** : scan profond (docs, plans de travail, communauté, retours testeurs) pour faire remonter ce qui n'est pas suivi.

## Usage

```
/productivite-labo-codex:update
/productivite-labo-codex:update --comprehensive
```

## Mode par défaut

### 1. Charger l'état

Lire `BACKLOG.md`, `SESSION.md`, `ETAT-PROJET.md` et `Retours des testeurs/SUIVI-BUGS.md`. S'ils manquent, suggérer de connecter le dépôt de code, ou `/productivite-labo-codex:start` d'abord.

### 2. Trier les items du backlog

Dans la section « À faire » de `BACKLOG.md`, signaler :

- Items dont la version cible est déjà livrée (comparer à `version.json`).
- Items ouverts depuis longtemps sans mouvement dans `SESSION.md`.
- Items sans emoji de catégorie (🟡 🟢 📦 ⚠️ 📐) ou sans `#ID`.
- Items `[x]` encore présents dans `BACKLOG.md` : doivent migrer vers `BACKLOG-ARCHIVE.md`.

Présenter chaque cas : marquer livré ? archiver ? requalifier la priorité ? **Ne jamais modifier sans confirmation de Grégoire.**

### 3. Vérifier la fraîcheur de l'état-projet

Comparer `ETAT-PROJET.md` (sa date et sa version d'en-tête) à `version.json` et à `SESSION.md`. Si l'état-projet est en retard sur la réalité, le signaler – c'est un document à tenir à jour en fin de chantier significatif.

### 4. Priorité testeurs

Vérifier que les bugs ouverts de `SUIVI-BUGS.md` sont reflétés dans le backlog et priorisés. Un retour testeur non trié est à remonter en premier.

### 5. Rapport

```
Synchronisation terminée :
- Backlog : <n> items à trier (<détail>)
- État-projet : <à jour / en retard sur la version X.Y.Z>
- Testeurs : <n> bugs ouverts non triés
```

## Mode complet (`--comprehensive`)

Tout le mode par défaut, plus un scan des sources de travail.

### Détecter les tâches non suivies

Parcourir, selon le dossier :

- **Dépôt** : `plans de travail/` (plans récents), `docs/` (décisions, ADR), `Rapports/` (diagnostics), `Retours des testeurs/USAGE-FORMATS.md`.
- **Cowork** : `communauté/` (chantiers à discuter, journal), notes de conception, plans pédagogiques.

Faire remonter les éléments qui ressemblent à des tâches non présentes dans `BACKLOG.md` :

```
## Tâches potentiellement non suivies
1. plans de travail/PLAN-VOUTE-PHASES-1-8.md → lots F/T/P2/P3 sans item ouvert. Ajouter ?
2. communauté/chantiers-à-discuter.md → « <titre> » non reflété au backlog. Ajouter ?
```

### Repérer le vocabulaire et les skills nouveaux

Faire remonter les termes ou skills apparus dans les sources mais pas encore reflétés dans la mémoire de référence (ex. nouvel acronyme, nouvelle pratique, nouveau skill dans `.claude/skills/`). Présenter pour confirmation.

## Notes

- Ne jamais ajouter ni modifier d'item sans confirmation de Grégoire.
- Respecter la convention d'ajout du backlog : `- [ ] [emoji] **#XX** Description` + sous-puces ; dernier `#ID` indiqué en en-tête de `BACKLOG.md`.
- Marquer livré = `[x]` + `✅ LIVRÉ (date, build)`, puis **déplacer** l'item dans `BACKLOG-ARCHIVE.md` et noter dans `SESSION.md`.
- Sûr à exécuter souvent : ne remonte que ce qui a bougé. Le `--comprehensive` est toujours interactif.
