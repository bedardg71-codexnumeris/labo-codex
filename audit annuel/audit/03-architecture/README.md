# Axe 3 — Architecture (SSOT, modularité, principes non négociables)

**Priorité 3.** **Temps total estimé : 4 h 30.** **Claude Code + revue Grégoire.**

---

## Question d'audit

L'architecture revendiquée (Single Source of Truth, communication indirecte via stockage local, stabilité zéro-dette) est-elle effectivement respectée dans le code ?

---

## Cadre

- Domain-Driven Design (Evans 2003, Vernon 2013) — *ubiquitous language*, *bounded contexts*.
- Modular Monolith (Simon Brown).
- Single Source of Truth (Red Hat : « technique by which all the data relevant to a given domain is organized into a single location »).
- Hexagonal architecture (Cockburn) — pour la séparation domaine/infrastructure.

---

## Sous-audits

### 3.1 — Cartographie des sources d'écriture et de lecture (2 h)

**Question** : pour chaque entité de domaine (élève, artefact, indice IDME, indice de blocage, configuration, profil), existe-t-il **exactement un point d'écriture** et **N points de lecture** ? Existe-t-il des calculs dupliqués (la même formule réécrite dans deux modules) ?

**Méthode** :

1. Identifier le module dédié à la persistance dans Labo Codex (probablement `storage.js` ou similaire — à confirmer par Grégoire).

2. Claude Code exécute :
   ```bash
   # Tous les accès directs à localStorage
   grep -rn "localStorage\." js/ > audit/reports/03-1-localStorage-raw.txt

   # Tous les accès directs à IndexedDB
   grep -rn "indexedDB\.\|\.open(\|\.transaction(\|\.objectStore(" js/ > audit/reports/03-1-indexedDB-raw.txt

   # Tous les accès JSON.parse / JSON.stringify (sérialisation manuelle hors module SSOT)
   grep -rn "JSON\.parse\|JSON\.stringify" js/ > audit/reports/03-1-json-raw.txt
   ```

3. Classer manuellement les occurrences :
   - **Légitimes** : accès dans le module SSOT.
   - **Suspectes** : accès dans d'autres modules (potentiellement contournement du SSOT).

4. Pour chaque accès suspect, lire le contexte (10 lignes avant/après) et juger :
   - Justifiable (cas marginal documenté) ?
   - À refactorer (consolidation dans le module SSOT) ?

**Seuils** :
- Vert : tous les accès passent par le module SSOT identifié.
- Jaune : ≤ 3 accès directs hors module, tous justifiables.
- Rouge : > 3 accès directs OU écriture concurrente dans deux modules différents pour la même donnée.

**Livrable** : `audit/reports/03-1-ssot.md` avec :
- Module SSOT identifié.
- Liste exhaustive des points d'accès classés (légitime / suspect / rouge).
- Recommandations de consolidation si applicable.

---

### 3.2 — Graphe de dépendances et couplage (1 h)

**Commandes** (mêmes que 2.4, réutiliser les résultats) :

```bash
ENTRY="js/main.js"  # À AJUSTER

npx madge --json "$ENTRY" > audit/reports/03-2-madge.json
npx madge --image audit/reports/03-2-graph.svg "$ENTRY" 2>/dev/null || true

# Calcul fan-in / fan-out
npx madge --summary "$ENTRY" > audit/reports/03-2-summary.txt
```

**Métriques dérivées (à calculer manuellement à partir du JSON)** :

- **Fan-out par module** : nombre de modules dont il dépend (lit le JSON madge).
- **Fan-in par module** : nombre de modules qui dépendent de lui.
- **Profondeur du graphe** : longueur du plus long chemin de dépendance.

**Seuils** :
- Aucun module fan-out > 10 (sinon couplage excessif).
- Aucun module fan-in > 15 sans justification documentée.
- Profondeur graphe ≤ 5 (au-delà, signal d'absence de modularité réelle).

**Note importante** : si Labo Codex n'utilise pas ES modules, faire l'analyse manuelle à partir de `index.html` (ordre des `<script>`) et des références globales `window.X`.

**Livrable** : `audit/reports/03-2-modularity.md` avec :
- Graphe SVG si disponible.
- Tableau fan-in/fan-out top 10.
- Identification des modules « hub » (fan-in élevé) et « god module » (fan-out élevé).
- Statut V/J/R.

---

### 3.3 — Isolation et surface d'exposition (1 h 30)

**Question** : chaque module expose-t-il **uniquement ce qui est nécessaire** (interface minimale, principe « package by component » de Simon Brown) ?

**Méthode** :

1. Si Labo Codex utilise ES modules :
   ```bash
   # Inventaire des exports
   grep -rEn "^export " js/ > audit/reports/03-3-exports.txt
   ```

2. Si Labo Codex utilise des globales `window.X` :
   ```bash
   grep -rEn "window\.\w+\s*=" js/ > audit/reports/03-3-globals.txt
   ```

3. Pour chaque export / globale, chercher les utilisations :
   ```bash
   # Pour chaque nom exporté, vérifier où il est utilisé
   while read name; do
     count=$(grep -rln "$name" js/ | wc -l)
     echo "$name : $count usages"
   done < <(awk '...') > audit/reports/03-3-usages.txt
   ```

4. Identifier :
   - **Exports inutilisés** (candidats à suppression).
   - **Imports massifs** (un module qui importe > 5 choses d'un autre — anti-pattern).
   - **Modules sans interface explicite** (tout est exposé).

**Seuils** :
- Vert : 100 % des exports sont utilisés, aucun module n'expose plus de 10 symboles.
- Jaune : ≤ 5 exports inutilisés, ou ≤ 2 modules exposent 10-20 symboles.
- Rouge : > 5 exports inutilisés, OU module exposant > 20 symboles.

**Livrable** : `audit/reports/03-3-isolation.md`.

---

## Synthèse de l'axe 3

`audit/reports/03-summary.md` :
- Tableau statuts par sous-audit.
- Évaluation globale du respect du SSOT.
- Évaluation globale de la modularité réelle.
- Recommandations consolidées.

---

## Note méthodologique

L'évaluation de l'architecture exige du jugement humain. Les outils CLI (madge, grep) produisent des données brutes ; l'interprétation reste à la charge de Grégoire et Claude Code conjointement.

Particulièrement pour le SSOT : un accès direct à `localStorage` hors module SSOT n'est pas automatiquement une violation — il peut être justifié (cache local, debug, migration de version). C'est le **statut documenté** qui compte.
