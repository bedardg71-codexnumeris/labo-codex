---
name: hygiene-donnees-partagees
description: >
  Principes d'hygiène pour toute manipulation programmatique de données
  partagées entre sources hétérogènes : collections globales, bases de
  données multi-tenants, fichiers de config partagés, pipelines d'import,
  fusions de state. Charger ce skill AVANT de planifier tout code qui lit
  une source externe pour écrire dans un stockage partagé. Applicable à
  tout projet, tout langage, tout storage.

  Mots-clés déclencheurs : fusion, merge, import, upsert, migration,
  multi-source, multi-tenant, seed, pack, fixture, db.setSync, getSync,
  INSERT ON CONFLICT, MERGE INTO, REPLACE INTO, namespace partagé, base
  partagée, stockage partagé, collection globale, table de référence,
  filter par flag, isDemo, isShared, isSystem, dry-run, snapshot avant
  écriture.
---

# SKILL : Hygiène des données partagées

> **Principe fondateur** : Quand du code manipule des données partagées
> entre plusieurs sources, il ne doit jamais supposer — il doit observer.
> Observer la donnée existante avant de coder le transformateur.
> Transformer explicitement à l'écriture en testant le type d'entrée.
> Filtrer par identité de la source, pas par attribut.

---

## 1. CONTEXTE DU PROBLÈME

Dans tout système où des données proviennent de **sources multiples**
et cohabitent dans un **stockage partagé**, cinq risques fondamentaux
apparaissent :

1. **Collision d'identité** — deux sources produisent des items avec
   les mêmes identifiants.
2. **Flag non-trusted** — un attribut censé distinguer les sources
   (`isDemo`, `isSystem`, `isShared`) se retrouve posé sur des items
   d'une autre source par accident ou héritage.
3. **Écrasement silencieux** — une fusion (merge/upsert) remplace un
   item existant au lieu de le préserver.
4. **Incompatibilité de type** — la source écrit un objet là où les
   lecteurs attendent un tableau (ou inversement), sans erreur visible.
5. **Destruction irréversible** — une migration ou un nettoyage supprime
   des données sans possibilité de retour.

Ces risques sont **indépendants du langage, du framework et du type de
stockage**. Ils se manifestent dans des bases relationnelles, des stores
clé-valeur, des fichiers JSON, des APIs, des caches partagés.

### Pourquoi l'IA est particulièrement vulnérable

Un LLM qui génère du code a tendance à « compléter le pattern » à
partir de ce qu'il croit savoir du schéma. Il suppose que les données
en place correspondent au modèle mental qu'il s'est construit. Cette
confiance implicite est la cause racine de la majorité des corruptions
de données silencieuses dans du code généré par IA.

---

## 2. LES 5 PRINCIPES

### Principe 1 — Observer avant de transformer

> **Ne jamais écrire de code qui manipule un stockage partagé sans avoir
> d'abord inspecté ce qui s'y trouve réellement.**

Avant de coder un transformateur (import, fusion, migration, nettoyage),
l'IA doit :

- Lire un échantillon réel des données en place (pas un schéma théorique).
- Identifier les cas limites dans les données existantes : valeurs nulles,
  types inattendus, items orphelins, doublons, flags incohérents.
- Documenter ce qu'elle a observé avant de proposer un plan.

**Anti-pattern** : coder un import en se basant uniquement sur la
documentation du format source, sans regarder ce que le stockage cible
contient déjà.

**Comportement attendu de l'IA** : « Avant de coder cette fusion, je
vais lire 2-3 entrées réelles du stockage cible pour vérifier la forme
des données existantes. »

### Principe 2 — Transformer explicitement à l'écriture

> **Ne jamais écrire une donnée brute dans un stockage partagé en supposant
> qu'elle correspond au format attendu par les lecteurs aval.**

Toute donnée entrante doit être :

- **Testée** : vérifier le type effectif (`Array.isArray()`, `typeof`,
  vérification de schéma).
- **Convertie** : si le type diverge, transformer explicitement vers le
  format attendu par les lecteurs.
- **Documentée** : commenter la conversion pour que le prochain lecteur
  humain ou IA comprenne pourquoi elle est nécessaire.

```
// Pseudo-code générique — applicable à tout langage
entrée = lireSource()
si type(entrée) ≠ typeAttenduParLecteurs:
    entrée = convertirVers(typeAttenduParLecteurs, entrée)
    // Documenter : "La source X fournit un dict, les lecteurs Y et Z
    // attendent un array. Conversion explicite ici."
écrire(stockageCible, entrée)
```

**Anti-pattern** : copier la donnée source telle quelle vers le stockage
partagé, en comptant sur le fait que « ça a le même nom de champ, donc
c'est compatible ».

**Comportement attendu de l'IA** : « Avant d'écrire cette donnée, je
vérifie son type avec `Array.isArray()` / `typeof` et j'identifie ce
que les lecteurs aval attendent. Si divergence, je convertis
explicitement et je documente la conversion. »

### Principe 3 — Filtrer par identité, pas par attribut

> **Un flag est un signal non-trusted sur une collection partagée.
> Seule l'appartenance à un ensemble connu d'identifiants est fiable.**

Quand on doit retirer, isoler ou identifier des items d'une source
particulière dans une collection partagée :

- **Ne pas** filtrer par un attribut booléen (`isDemo`, `isSystem`,
  `isExternal`) — ce flag peut être absent, hérité par erreur, ou posé
  par un cycle legacy.
- **Filtrer** par un ensemble explicite d'identifiants connus de la
  source (le set des IDs du pack, de l'import, du tenant).

```
// Anti-pattern — filtre aveugle par flag
collection.filter(item => !item.isExternal)

// Pattern correct — filtre par identité de la source
idsSource = Set(source.items.map(i => i.id))
collection.filter(item => !idsSource.has(item.id))
```

**Corollaire** : si tu dois introduire un flag de source, il doit être
considéré comme un *indice* pour l'affichage ou le debug, pas comme un
*critère* pour les opérations de mutation.

**Comportement attendu de l'IA** : « Avant de filtrer par flag, je grep
tous les call-sites qui posent ce flag (`\.flag\s*=`) pour vérifier
qu'aucun ne touche un item de la mauvaise source. Si je ne peux pas le
prouver, je filtre par identité au lieu du flag. »

### Principe 4 — Vérifier la compatibilité avec les lecteurs aval

> **Avant d'écrire dans un stockage partagé, identifier qui lit cette
> donnée et ce qu'il en attend.**

Procédure :

1. Trouver les lecteurs : grep/search pour les accès en lecture à la
   clé ou table cible.
2. Pour 2-3 lecteurs représentatifs, vérifier : quel type attendent-ils ?
   Quelle shape ? Quels champs sont obligatoires ?
3. Si la donnée source diverge de ce que les lecteurs attendent,
   appliquer le Principe 2.

**Anti-pattern** : « J'écris un objet `{date: {id: data}}` parce que
c'est comme ça que la source le fournit » — alors que tous les lecteurs
font `data.forEach(...)` et attendent un tableau.

**Symptôme typique** : les lecteurs ont des fallbacks silencieux du type
`if (!Array.isArray(x)) x = []`. La donnée est écrite avec le mauvais
type, les lecteurs l'ignorent sans erreur, la fonctionnalité est
simplement absente. Le bug est invisible.

**Comportement attendu de l'IA** : « Avant d'écrire dans cette clé/table,
je grep les lecteurs (`getSync.*<cle>`, `SELECT.*FROM <table>`) et
j'examine 2-3 d'entre eux pour vérifier la shape attendue. Si la source
diverge, je convertis. Si je ne peux pas trouver les lecteurs, je
demande à l'utilisateur. »

### Principe 5 — Assurer la réversibilité

> **Toute opération destructive sur un stockage partagé doit permettre
> un retour en arrière.**

Trois niveaux de protection, du plus léger au plus robuste :

1. **Snapshot pré-opération** : capturer l'état avant dans une clé/table
   temporaire. Restaurer dans le `catch` en cas d'échec.
2. **Dry-run** : implémenter un mode qui logge les actions sans les
   exécuter. Valider le résultat attendu avant la passe réelle.
3. **Backup utilisateur** : pour les opérations de masse, recommander à
   l'utilisateur de faire un export/backup avant d'exécuter.

**Barème de décision (taille d'impact → niveau de protection)** :

| Cas | Niveau minimum |
|---|---|
| Opération sur **1 item** (ajout, modif, suppression unitaire) | Aucun garde-fou requis (transactionnel par nature) |
| Opération sur **≤ 10 items** (lot connu) | **Snapshot pré-opération** + restauration dans `catch` |
| Opération sur **11–50 items** OU items de l'utilisateur | **Snapshot + dry-run** validé manuellement avant exécution |
| Opération sur **≥ 50 items** OU famille entière de clés | **Les 3 niveaux** : snapshot + dry-run + recommandation backup utilisateur préalable |
| Migration **one-shot** au boot (idempotente via flag) | **Les 3 niveaux**, sans exception |

**Anti-pattern** : une migration qui itère toutes les clés d'une famille
et applique `delete`/`remove` dans une boucle sans filet de sécurité.

**Comportement attendu de l'IA** : « Avant d'écrire cette opération
destructive, j'estime le nombre d'items touchés. Je consulte le barème
ci-dessus pour déterminer le niveau de protection requis. Si le niveau
ne peut pas être garanti (pas de snapshot possible, pas de dry-run
implémentable), je refuse de coder l'opération et j'explique pourquoi
à l'utilisateur. »

---

## 3. LES 5 ANTI-PATTERNS (FORME ABSTRAITE)

Ces patterns sont les manifestations concrètes des violations des
5 principes. Chacun est décrit avec sa signature reconnaissable et
son antidote.

### AP-1 : Source dérivée de la cible

**Situation** : les données source (pack système, jeu de test, template,
seed) ont été construites à partir de données réelles de la cible. Les
identifiants sont identiques.

**Signature** : la source a été créée « à partir de données réelles »,
« à partir d'un export anonymisé », « comme copie de production ».

**Comment détecter** (cette signature n'est pas dans le code — il faut
chercher en dehors) :

1. Lire le **README** ou le commentaire d'en-tête du fichier source.
2. `git log --follow <fichier_source>` pour examiner le commit initial
   (souvent le message explicite l'origine : « pack créé depuis A2025
   anonymisé », « seed généré depuis l'export du 2025-09 », etc.).
3. Comparer un **échantillon d'IDs** de la source avec un échantillon
   d'IDs réels de la cible — s'ils suivent le même schéma de génération
   (ex. `GRILLE1759*` partagé), le risque de collision est avéré.
4. **Si toujours dans le doute, demander à l'utilisateur explicitement** :
   « D'où viennent les données de cette source ? Les IDs peuvent-ils
   correspondre à ceux d'items utilisateur ? »

**Risque** : toute opération sur la source (activation, désactivation,
mise à jour) affecte les données réelles par collision d'identifiants.

**Antidote** : préfixer ou re-générer les identifiants de la source **à
la conception** (pas en runtime). Documenter l'origine de la source et
la stratégie d'isolation des IDs.

### AP-2 : Filtre aveugle par flag

**Situation** : le code filtre une collection partagée par un attribut
booléen pour isoler les items d'une source.

**Signature** : `.filter(x => !x.isDemo)`, `.where(isSystem = false)`,
`SELECT * WHERE is_external = 0`.

**Risque** : le flag peut être absent, hérité par erreur, ou posé par
un cycle legacy sur des items de la mauvaise source.

**Antidote** : filtrer par identité (set d'IDs connus de la source).
Voir Principe 3.

### AP-3 : Upsert silencieux dans une fusion

**Situation** : le code fusionne des items de la source dans la cible
avec un `findIndex` + replace (ou `INSERT ON CONFLICT UPDATE`).

**Signature** : `arr[idx] = nouvelItem`, `UPSERT`, `MERGE INTO`,
`Map.set()` sur un ID existant.

**Risque** : si l'ID existe déjà dans la cible (item utilisateur), il
est écrasé par la version source. Combiné avec AP-2, l'item original
est perdu définitivement.

**Antidote** : push/insert sans replace. Si l'ID existe déjà, la
version existante a priorité. La collision est loggée, pas résolue par
écrasement.

### AP-4 : Supposition sur le type des données externes

**Situation** : le code copie des données depuis une source externe vers
le stockage sans vérifier le type effectif.

**Signature** : absence de `Array.isArray()`, `typeof`, `instanceof`,
ou validation de schéma avant écriture. Les lecteurs aval ont des
fallbacks silencieux (`|| []`, `?? {}`, `try/catch` vide).

**Risque** : la donnée est écrite avec le mauvais type. Les lecteurs
l'ignorent silencieusement. La fonctionnalité dépendante est absente
sans erreur visible.

**Antidote** : transformer explicitement à l'écriture (Principe 2).
Tester le type d'entrée. Convertir vers le format attendu. Ne pas
compter sur les fallbacks des lecteurs pour masquer une erreur d'écriture.

### AP-5 : Migration de masse sans audit

**Situation** : le code itère une famille de clés/tables et applique une
opération destructive (delete, update, replace) dans une boucle.

**Signature** : `keys.filter(...).forEach(k => delete(k))`,
`UPDATE table SET ... WHERE category = ...`, boucle sur `db.keys()`.

**Risque** : un seul cas non anticipé (item legacy, item de la mauvaise
source, item avec un flag hérité) suffit à corrompre ou supprimer des
données utilisateur.

**Antidote** : avant d'écrire la migration, lister 3 cas réels
divergents et tracer le résultat attendu pour chacun. Implémenter un
dry-run. Valider manuellement le résultat du dry-run avant la passe
réelle. Voir Principe 5.

---

## 4. CHECKLIST PRÉ-ÉCRITURE (4 POINTS)

À passer mentalement **avant** de coder toute opération qui écrit, fusionne,
filtre ou supprime dans un stockage partagé.

### Point 1 : Collision d'identifiants possible ?

> Les IDs que je vais écrire/manipuler peuvent-ils correspondre à ceux
> d'items déjà présents dans le stockage cible ?

- **Si oui** : isoler les IDs source par préfixe, namespace, ou
  re-génération. Résoudre à la conception, pas en runtime.
- **Si non, certain à 100%** : documenter cette certitude dans le code
  avec le raisonnement.

### Point 2 : Flags fiables ?

> Le flag que je vais utiliser pour filtrer peut-il être présent sur des
> items d'une autre source par accident ou héritage ?

- **Test** : chercher dans le code tous les endroits qui posent ce flag.
  S'assurer qu'aucun ne touche un item de la mauvaise source.
- **Si doute** : filtrer par identité, pas par flag.

### Point 3 : Types compatibles avec les lecteurs ?

> Les données que je vais écrire sont-elles dans le format que les
> lecteurs aval attendent ?

- **Test** : ouvrir 2-3 lecteurs de cette donnée et vérifier le type
  qu'ils consomment. Tableau ? Objet ? Quelle shape ?
- **Si divergence** : transformer explicitement à l'écriture.

### Point 4 : Réversibilité assurée ?

> Si mon code corrompt ou supprime des données par erreur, peut-on
> revenir en arrière ?

- **Pour les opérations unitaires** : snapshot pré-opération + restauration
  dans le `catch`.
- **Pour les opérations de masse** : dry-run obligatoire + backup
  utilisateur recommandé.

### Sortie de la checklist — gate explicite

> **Si les 4 points sont tous validés, l'écriture peut être codée.**
>
> **Si un seul point ne peut pas être validé**, refuser de coder
> l'opération destructive et expliquer à l'utilisateur ce qui manque,
> dans le format suivant :
>
> ```
> Je ne peux pas coder cette opération en l'état. Le point N de la
> checklist hygiène (« <intitulé du point> ») n'est pas validé parce que
> <raison concrète>. Pour débloquer, j'ai besoin de <action requise> :
> <commande / question / vérification précise>.
> ```

Refuser proprement n'est pas un échec, c'est l'application correcte du
skill. La pression de « livrer quand même » est précisément la situation
où les 5 anti-patterns émergent. La règle est : **un point non validé =
pas de code, demande explicite à l'utilisateur**.

---

## 5. WORKFLOW POUR L'IA

### Avant de planifier

1. **Identifier** les stockages partagés touchés par le chantier.
2. **Observer** les données en place : lire un échantillon réel, pas
   un schéma théorique. Documenter les observations.
3. **Passer la checklist** (§4) en tête du plan, dans une section
   dédiée. Pour chaque point, écrire la commande ou requête qui valide
   l'hypothèse.

### Pendant le développement

4. Avant chaque écriture dans un stockage partagé, relire la checklist.
5. Chercher les signatures des 5 anti-patterns (§3) dans le code en
   cours. Si une signature apparaît, appliquer l'antidote correspondant.

### Après un incident

6. Post-mortem court (5-10 min) : symptôme observé, cause racine
   identifiée, garde-fou à ajouter.
7. Si la cause révèle un pattern non listé, l'ajouter aux anti-patterns
   du skill projet correspondant.

### Audit périodique

8. Une fois par session de travail, chercher les signatures des
   anti-patterns sur tout le code pour détecter les régressions ou les
   nouveaux points à risque.

---

## 6. SIGNAUX D'ALERTE — EXPRESSIONS À SURVEILLER

Expressions dans le code qui doivent déclencher une pause et une
vérification :

| Signal | Risque | Principe |
|--------|--------|----------|
| `.filter(x => x.isDemo)` ou équivalent | AP-2 : filtre aveugle par flag | P3 |
| `arr[idx] = nouvelItem` après `findIndex` | AP-3 : upsert silencieux | P3 |
| Écriture sans `Array.isArray` / `typeof` | AP-4 : supposition de type | P2 |
| `keys.forEach(k => delete(k))` | AP-5 : migration sans audit | P5 |
| Source « basée sur des données réelles » | AP-1 : source dérivée de cible | P1 |
| Lecteur avec fallback silencieux `\|\| []` | AP-4 : masquage d'erreur de type | P2, P4 |
| `INSERT ON CONFLICT UPDATE` / `UPSERT` | AP-3 : écrasement possible | P3 |
| `MERGE INTO` sans clause de priorité | AP-3 : écrasement possible | P3 |

> **Note importante** : les patterns ci-dessus sont en **pseudo-code**
> (syntaxe JavaScript indicative). Ils ne sont pas directement
> exécutables avec `grep`, `ripgrep` ou un autre outil de recherche.
>
> Pour rendre ces signaux opérationnels dans un projet donné :
>
> 1. Adapter les patterns au langage cible (JS, Python, SQL, Rust…).
> 2. Construire des regex POSIX/PCRE valides (échapper `.` et `(`,
>    gérer les espaces optionnels avec `\s*`, etc.).
> 3. Tester chaque regex sur quelques fichiers connus avant de
>    s'en servir comme audit systématique.
>
> **Voir le skill projet** (le cas échéant) pour les regex testées et
> validées dans le langage du projet. Exemple pour Labo Codex :
> `SKILL_integrite_globaux.md` §5 contient les commandes `grep` exactes
> à exécuter.

---

## 7. RELATION AVEC LES SKILLS PROJET

Ce skill est **agnostique au projet**. Il définit les principes abstraits.

Chaque projet peut avoir un skill d'instanciation concrète qui applique
ces principes à son contexte spécifique : noms de clés, modules concernés,
incidents réels, commits de référence.

### Skills projet connus

| Projet | Skill enfant | Domaine d'instanciation |
|---|---|---|
| Labo Codex | `SKILL_integrite_globaux.md` | Collections globales `grillesTemplates`, `echellesTemplates`, `cours`, `enseignants`, `cartouches_*`, etc. Modules : `demo-activation.js`, `reserve.js`, `import-export.js`. |

(Cette table grandit à mesure que le pattern est instancié dans d'autres
projets. À mettre à jour quand un nouveau skill enfant naît.)

### Consignes de chargement (réciproques et obligatoires)

- **Si un skill enfant existe pour le projet en cours, le charger
  systématiquement EN COMPLÉMENT de ce skill parent**, pas en
  remplacement. Le parent fournit les principes universels ; l'enfant
  fournit la connaissance contextuelle (noms de clés, relations
  cross-table, incidents historiques).
- **Si tu charges un skill projet enfant** (ex. `SKILL_integrite_globaux.md`
  pour Labo Codex), **charger aussi automatiquement ce skill parent**
  pour bénéficier des principes universels et du barème §2 (P5).
- L'ordre de lecture recommandé en situation d'urgence (cas concret à
  traiter rapidement) :
  1. Skill parent §4 — checklist 4 points + sortie de la checklist
  2. Skill enfant §3-5 — patterns concrets et regex testées
  3. Skill parent §3 (anti-patterns) si un pattern observé n'est pas
     dans le skill enfant

### Co-évolution

Quand un skill enfant documente un nouvel anti-pattern :

- Vérifier s'il correspond à un pattern abstrait déjà listé ici. Si oui,
  référencer dans le skill enfant.
- Si non, envisager de l'ajouter ici sous forme abstraite pour
  bénéficier aux autres projets, puis l'instancier dans le skill enfant.

Quand le skill parent ajoute un principe ou un anti-pattern :

- Auditer chaque skill enfant pour vérifier qu'il en tient compte. Si
  l'instanciation manque, l'ajouter dans le skill enfant.

---

**Date de création** : 26 avril 2026
**Origine** : extraction des principes de `SKILL_integrite_globaux.md`,
lui-même né de l'incident du 24 avril 2026 (perte silencieuse de données
par collision d'IDs dans un stockage partagé).
**Révision attendue** : à chaque découverte d'un nouveau pattern
d'erreur sur des données partagées, quel que soit le projet.
