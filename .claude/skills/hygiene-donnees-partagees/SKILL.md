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
apparaissent. Ils sont **indépendants du langage, du framework et du
type de stockage** (bases relationnelles, stores clé-valeur, fichiers
JSON, APIs, caches partagés) :

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

### Pourquoi l'IA est particulièrement vulnérable

Un LLM qui génère du code a tendance à « compléter le pattern » à
partir de ce qu'il croit savoir du schéma. Il suppose que les données
en place correspondent au modèle mental qu'il s'est construit. Cette
confiance implicite est la cause racine de la majorité des corruptions
de données silencieuses dans du code généré par IA.

---

## 2. LES 5 PRINCIPES (et leur anti-pattern)

Chaque principe se lit avec son anti-pattern jumeau (la violation
reconnaissable) et son antidote. Les commandes `grep`/regex
opérationnelles sont au §6 ; la checklist pré-écriture au §4.

### Principe 1 — Observer avant de transformer

> **Ne jamais écrire de code qui manipule un stockage partagé sans avoir
> d'abord inspecté ce qui s'y trouve réellement.**

Avant de coder un transformateur (import, fusion, migration, nettoyage) :
lire un échantillon réel des données en place (pas un schéma théorique),
identifier les cas limites (valeurs nulles, types inattendus, items
orphelins, doublons, flags incohérents), documenter ce qui a été observé
avant de proposer un plan.

**Anti-pattern (AP-1, source dérivée de la cible)** : la source (pack
système, seed, template) a été construite à partir de données réelles de
la cible — les IDs sont identiques, donc toute opération sur la source
affecte les vraies données par collision. La signature (« créé à partir
de données réelles / d'un export anonymisé / comme copie de production »)
n'est **pas dans le code** : la chercher dans le README/en-tête du
fichier, dans `git log --follow <source>` (le commit initial explicite
souvent l'origine), ou en comparant un échantillon d'IDs source et cible
(même schéma de génération → risque avéré). **Dans le doute, demander :
« d'où viennent ces données, leurs IDs peuvent-ils collisionner ? »**

**Antidote** : préfixer ou re-générer les IDs de la source **à la
conception** (pas en runtime). Documenter l'origine et la stratégie
d'isolation des IDs.

### Principe 2 — Transformer explicitement à l'écriture

> **Ne jamais écrire une donnée brute dans un stockage partagé en supposant
> qu'elle correspond au format attendu par les lecteurs aval.**

Toute donnée entrante doit être **testée** (type effectif :
`Array.isArray()`, `typeof`, vérification de schéma), **convertie** si
le type diverge, et **documentée** (commenter pourquoi la conversion est
nécessaire).

```
// Pseudo-code générique — applicable à tout langage
entrée = lireSource()
si type(entrée) ≠ typeAttenduParLecteurs:
    entrée = convertirVers(typeAttenduParLecteurs, entrée)
    // Documenter : "La source X fournit un dict, les lecteurs Y et Z
    // attendent un array. Conversion explicite ici."
écrire(stockageCible, entrée)
```

**Anti-pattern (AP-4, supposition de type)** : copier la donnée source
telle quelle (« même nom de champ, donc compatible »), sans
`Array.isArray()`/`typeof`/validation. La donnée est écrite avec le
mauvais type ; les lecteurs aval ont des fallbacks silencieux (`|| []`,
`?? {}`, `try/catch` vide) qui l'ignorent sans erreur. La fonctionnalité
dépendante est simplement absente — le bug est invisible.

**Antidote** : transformer explicitement à l'écriture. Ne pas compter
sur les fallbacks des lecteurs pour masquer une erreur d'écriture.

### Principe 3 — Filtrer par identité, pas par attribut

> **Un flag est un signal non-trusted sur une collection partagée.
> Seule l'appartenance à un ensemble connu d'identifiants est fiable.**

Pour retirer, isoler ou identifier des items d'une source dans une
collection partagée, filtrer par un **ensemble explicite d'IDs connus**
de la source (set des IDs du pack, de l'import, du tenant), jamais par
un booléen.

```
// Anti-pattern (AP-2) — filtre aveugle par flag
collection.filter(item => !item.isExternal)

// Pattern correct — filtre par identité de la source
idsSource = Set(source.items.map(i => i.id))
collection.filter(item => !idsSource.has(item.id))
```

**Anti-pattern (AP-2, filtre aveugle par flag)** : `.filter(x => !x.isDemo)`,
`.where(isSystem = false)`, `SELECT * WHERE is_external = 0`. Le flag peut
être absent, hérité par erreur, ou posé par un cycle legacy sur des items
de la mauvaise source.

**Corollaire** : un flag de source est un *indice* pour l'affichage ou le
debug, jamais un *critère* de mutation. (Resserrer un filtre par identité
**avec** un flag — `idsSource.has(id) && estDeLaSource(x)` — reste
légitime : c'est une protection supplémentaire, pas un filtre par flag
seul.)

**Antidote** : filtrer par identité. Si un flag de source doit exister, le
réserver à l'affichage.

### Principe 4 — Vérifier la compatibilité avec les lecteurs aval

> **Avant d'écrire dans un stockage partagé, identifier qui lit cette
> donnée et ce qu'il en attend.**

Procédure : (1) grep/search les accès en lecture à la clé ou table cible ;
(2) pour 2-3 lecteurs représentatifs, vérifier type, shape et champs
obligatoires ; (3) si la donnée source diverge, appliquer le Principe 2.

**Anti-pattern** : écrire `{date: {id: data}}` parce que la source le
fournit ainsi, alors que tous les lecteurs font `data.forEach(...)` et
attendent un tableau. **Symptôme typique** : des fallbacks silencieux
(`if (!Array.isArray(x)) x = []`) côté lecteurs masquent l'erreur ; la
fonctionnalité est absente sans aucune erreur. (Même mécanisme que AP-4.)

**Antidote** : trouver les lecteurs avant d'écrire. Si tu ne peux pas les
identifier, demander à l'utilisateur.

### Principe 5 — Assurer la réversibilité

> **Toute opération destructive sur un stockage partagé doit permettre
> un retour en arrière.**

Trois niveaux de protection, du plus léger au plus robuste :

1. **Snapshot pré-opération** : capturer l'état avant dans une clé/table
   temporaire ; restaurer dans le `catch` en cas d'échec.
2. **Dry-run** : logger les actions sans les exécuter ; valider le
   résultat attendu avant la passe réelle.
3. **Backup utilisateur** : pour les opérations de masse, recommander un
   export/backup préalable.

**Barème de décision (taille d'impact → niveau de protection)** :

| Cas | Niveau minimum |
|---|---|
| Opération sur **1 item** (ajout, modif, suppression unitaire) | Aucun garde-fou requis (transactionnel par nature) |
| Opération sur **≤ 10 items** (lot connu) | **Snapshot pré-opération** + restauration dans `catch` |
| Opération sur **11–50 items** OU items de l'utilisateur | **Snapshot + dry-run** validé manuellement avant exécution |
| Opération sur **≥ 50 items** OU famille entière de clés | **Les 3 niveaux** : snapshot + dry-run + recommandation backup utilisateur préalable |
| Migration **one-shot** au boot (idempotente via flag) | **Les 3 niveaux**, sans exception |

**Anti-pattern (AP-5, migration de masse sans audit)** : une boucle qui
itère une famille de clés/tables et applique `delete`/`remove`/`update`
sans filet (`keys.filter(...).forEach(k => delete(k))`,
`UPDATE ... WHERE category = ...`). Un seul cas non anticipé (item legacy,
flag hérité, mauvaise source) suffit à corrompre des données utilisateur.

**Antidote** : avant d'écrire la migration, lister 3 cas réels divergents
et tracer le résultat attendu pour chacun, implémenter un dry-run, le
valider manuellement avant la passe réelle.

> **Note sur AP-3 (upsert silencieux)** : une fusion qui fait `arr[idx] =
> nouvelItem` après `findIndex` (ou `INSERT ON CONFLICT UPDATE`, `MERGE
> INTO`, `Map.set()` sur un ID existant) écrase l'item cible. Combiné à
> AP-2, l'original est perdu. **Antidote** : push/insert **sans replace** —
> si l'ID existe déjà, la version existante a priorité, la collision est
> loggée et non résolue par écrasement. (C'est l'application conjointe des
> Principes 1 et 3 à l'écriture d'une fusion.)

---

## 3. SYNTHÈSE DES ANTI-PATTERNS

| Code | Anti-pattern | Principe | Antidote |
|---|---|---|---|
| AP-1 | Source dérivée de la cible (IDs identiques) | P1 | Préfixer/re-générer les IDs à la conception |
| AP-2 | Filtre aveugle par flag | P3 | Filtrer par identité (set d'IDs) |
| AP-3 | Upsert silencieux dans une fusion | P3 | Push sans replace ; priorité à l'existant |
| AP-4 | Supposition sur le type des données externes | P2/P4 | Tester et convertir explicitement à l'écriture |
| AP-5 | Migration de masse sans audit | P5 | Lister 3 cas, dry-run, valider avant exécution |

---

## 4. CHECKLIST PRÉ-ÉCRITURE (4 POINTS)

À passer mentalement **avant** de coder toute opération qui écrit, fusionne,
filtre ou supprime dans un stockage partagé. C'est la **vue opérationnelle
récap** des 5 principes.

1. **Collision d'identifiants possible ?** Les IDs que je vais
   écrire/manipuler peuvent-ils correspondre à ceux d'items déjà présents ?
   - *Si oui* : isoler les IDs source (préfixe, namespace, re-génération),
     à la conception, pas en runtime.
   - *Si non, certain à 100 %* : documenter cette certitude dans le code.

2. **Flags fiables ?** Le flag que je vais utiliser pour filtrer peut-il
   être présent sur des items d'une autre source par accident/héritage ?
   - *Test* : grep tous les call-sites qui posent ce flag, vérifier qu'aucun
     ne touche la mauvaise source.
   - *Si doute* : filtrer par identité.

3. **Types compatibles avec les lecteurs ?** Les données écrites sont-elles
   dans le format que les lecteurs aval attendent ?
   - *Test* : ouvrir 2-3 lecteurs, vérifier le type consommé (tableau ?
     objet ? shape ?).
   - *Si divergence* : transformer explicitement à l'écriture.

4. **Réversibilité assurée ?** Si mon code corrompt/supprime par erreur,
   peut-on revenir en arrière ? Appliquer le barème §2 (P5) : snapshot pour
   l'unitaire, dry-run + backup recommandé pour la masse.

### Sortie de la checklist — gate explicite

> **4 points validés → l'écriture peut être codée.**
> **Un seul point non validé → refuser de coder l'opération destructive**
> et expliquer ce qui manque :
>
> ```
> Je ne peux pas coder cette opération en l'état. Le point N de la
> checklist hygiène (« <intitulé> ») n'est pas validé parce que
> <raison concrète>. Pour débloquer, j'ai besoin de <action requise> :
> <commande / question / vérification précise>.
> ```

Refuser proprement n'est pas un échec : la pression de « livrer quand
même » est précisément ce qui fait émerger les anti-patterns. **Un point
non validé = pas de code, demande explicite à l'utilisateur.**

---

## 5. WORKFLOW POUR L'IA

- **Avant de planifier** : identifier les stockages partagés touchés ;
  observer les données réelles (échantillon, pas schéma) ; mettre la
  checklist §4 en tête du plan, avec pour chaque point la commande/requête
  qui valide l'hypothèse.
- **Pendant le développement** : avant chaque écriture, relire la
  checklist ; si une signature d'anti-pattern (§3, §6) apparaît, appliquer
  l'antidote.
- **Après un incident** : post-mortem court (symptôme, cause racine,
  garde-fou à ajouter). Si la cause révèle un pattern non listé, l'ajouter
  au skill projet correspondant.
- **Audit périodique** : une fois par session, chercher les signatures des
  anti-patterns sur tout le code pour détecter les régressions.

---

## 6. SIGNAUX D'ALERTE — EXPRESSIONS À SURVEILLER

Expressions qui doivent déclencher une pause et une vérification :

| Signal | Risque | Principe |
|--------|--------|----------|
| `.filter(x => x.isDemo)` ou équivalent | AP-2 : filtre aveugle par flag | P3 |
| `arr[idx] = nouvelItem` après `findIndex` | AP-3 : upsert silencieux | P3 |
| Écriture sans `Array.isArray` / `typeof` | AP-4 : supposition de type | P2 |
| Lecteur avec fallback silencieux `\|\| []` | AP-4 : masquage d'erreur de type | P2, P4 |
| `keys.forEach(k => delete(k))` | AP-5 : migration sans audit | P5 |
| Source « basée sur des données réelles » | AP-1 : source dérivée de cible | P1 |
| `INSERT ON CONFLICT UPDATE` / `UPSERT` | AP-3 : écrasement possible | P3 |
| `MERGE INTO` sans clause de priorité | AP-3 : écrasement possible | P3 |

> **Note** : ces patterns sont en **pseudo-code** (syntaxe JS indicative),
> non exécutables tels quels avec `grep`/`ripgrep`. Pour les rendre
> opérationnels : adapter au langage cible, construire des regex valides
> (échapper `.` et `(`, gérer les espaces avec `\s*`), tester chaque regex
> sur des fichiers connus avant de s'en servir comme audit. **Voir le skill
> projet** pour les regex testées : ex. le skill `integrite-globaux` §5
> (commandes `grep` exactes pour Labo Codex).

---

## 7. RELATION AVEC LES SKILLS PROJET

Ce skill est **agnostique au projet** : il porte les principes abstraits.
Chaque projet peut avoir un skill d'instanciation concrète (noms de clés,
modules, incidents réels, fonctions de référence).

### Skills projet connus

| Projet | Skill enfant | Domaine d'instanciation |
|---|---|---|
| Labo Codex | le skill `integrite-globaux` | Collections globales `cours`, `enseignants`, `cartouches_*` + collections multi-sources namespacées `grillesTemplates`, `echellesTemplates` (namespacées par trimestre depuis #358, 28 juin 2026). Modules : `demo-activation.js`, `reserve.js`, `import-export.js`. |

(Mettre à jour quand un nouveau skill enfant naît.)

### Consignes de chargement (réciproques et obligatoires)

- **Si un skill enfant existe pour le projet en cours, le charger EN
  COMPLÉMENT de ce parent**, pas en remplacement. Le parent fournit les
  principes universels ; l'enfant la connaissance contextuelle.
- **Si tu charges un skill enfant** (ex. le skill `integrite-globaux`),
  charger aussi automatiquement ce parent (principes + barème §2/P5).
- Ordre de lecture en urgence : (1) parent §4 checklist + gate de sortie ;
  (2) enfant §3-5 patterns concrets et regex testées ; (3) parent §2/§3 si
  un pattern observé n'est pas dans l'enfant.

### Co-évolution

Quand un skill enfant documente un nouvel anti-pattern : vérifier s'il
correspond à un pattern abstrait déjà listé ici (si oui, le référencer ;
sinon, envisager de l'abstraire ici puis de l'instancier dans l'enfant).
Quand le parent ajoute un principe/anti-pattern : auditer chaque enfant
pour vérifier qu'il en tient compte.

---

**Date de création** : 26 avril 2026
**Origine** : extraction des principes du skill `integrite-globaux`,
lui-même né de l'incident du 24 avril 2026 (perte silencieuse de données
par collision d'IDs dans un stockage partagé).
**Révision attendue** : à chaque découverte d'un nouveau pattern
d'erreur sur des données partagées, quel que soit le projet.
