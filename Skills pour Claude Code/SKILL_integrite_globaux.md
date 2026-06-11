---
name: integrite-globaux
description: >
  Utiliser ce skill avant toute écriture, fusion, filtre ou suppression
  dans les clés globales partagées de Labo Codex (grillesTemplates,
  echellesTemplates, cours, listeCours, enseignants, cartouches_*,
  pratiquesConfigurables, modalitesEvaluation). Déclencher dès que tu
  travailles sur demo-activation.js, demo-namespace.js, reserve.js,
  import-export.js, codex.js, ou tout futur module qui manipule ces clés
  (notamment Plan 2 partage CC). Aussi pertinent pour toute migration de
  masse sur des familles de clés (db.keys().forEach...).
---

# SKILL : Intégrité des collections globales (Labo Codex)

> **Instanciation concrète** de `SKILL_hygiene_donnees_partagees.md` pour
> le projet Labo Codex. Le skill parent porte les principes abstraits,
> les anti-patterns génériques et le « pourquoi ». Ce skill-ci ne garde
> que le contextuel projet : noms de clés réels, modules et fonctions
> actuelles, incidents datés, regex testées. **Pour la justification d'un
> principe, renvoyer au parent — ne pas la dupliquer ici.**
>
> **Document fondateur** — 26 avril 2026, après l'incident du 24 avril où
> 3 grilles d'évaluation ont disparu silencieusement du trimestre H2026.
> La cause racine n'était pas un bug ponctuel mais un pattern d'erreur
> récurrent dont plusieurs manifestations ont été observées au fil des
> chantiers Phase 5 Autonomisation.

---

## 1. LES CLÉS CONCERNÉES (état réel du code)

Deux mécanismes rendent une clé « globale » (non namespacée par trimestre)
dans Labo Codex. Ne pas les confondre.

### 1.1 `CLES_GLOBALES` — la liste canonique

Dans `js/trimestres.js`, la constante `CLES_GLOBALES` énumère les clés
JAMAIS préfixées par trimestre (sauf copie d'archivage). **Composition
réelle vérifiée (7 clés)** :

```
trimestres, grillesTemplates, echellesTemplates, modeApplication,
etatsAccordeonsV2, cours, listeCours
```

(`cours` est la clé canonique ; `listeCours` est legacy, migrée vers
`cours` au chargement et conservée pour rétrocompatibilité.)

### 1.2 Clés globales par d'AUTRES mécanismes

Plusieurs clés sensibles sont partagées entre trimestres sans figurer
dans `CLES_GLOBALES` :

- **`pratiquesConfigurables`, `modalitesEvaluation`** : au contraire,
  elles sont **namespacées** par trimestre (présentes dans `CLES_NAMESPACE`
  de `trimestres.js`, migration au boot dans `main.js`). Elles ne sont
  PAS dans `CLES_GLOBALES`. Mais `grillesTemplates`, `echellesTemplates`
  et `pratiquesConfigurables` figurent dans `CLES_TEMPLATES_ARCHIVES`
  (copiées vers `<trimestre>_grillesTemplates` etc. à l'archivage) — c'est
  ce mécanisme d'archivage, pas la globalité, qui les rend sensibles.
- **`enseignants`, `cartouches_*`** : globales de fait (manipulées comme
  globales par `demo-activation.js`, le pack démo, etc.) sans être listées
  dans `CLES_GLOBALES`. Toujours vérifier le mécanisme réel d'une clé
  avant de la traiter.

> **Conséquence pratique** : « globale » ≠ « dans `CLES_GLOBALES` ».
> Avant de coder, grep la clé visée dans `trimestres.js` pour savoir
> sous quel régime elle tombe (`CLES_GLOBALES`, `CLES_NAMESPACE`,
> `CLES_TEMPLATES_ARCHIVES`).

Ces clés reçoivent des items de **plusieurs sources** : items utilisateur
(Grégoire), items du pack démo (`pack-demo-20.js` → `PACK_DEMARRAGE`),
items importés (export Beta 91, futur partage CC Plan 2), copies d'archivage.
Aucun invariant n'est garanti sur la coexistence de ces sources : IDs qui
se chevauchent, flags `estDemo`/`isDemo` parfois présents par héritage
legacy sur des items utilisateur, types qui divergent entre source et
lecteurs.

---

## 2. AVANT DE CODER — CHECKLIST 4 POINTS

> Détail, justification et barème de réversibilité : **parent §4 et §2 (P5)**.
> Ici, seulement la version courte projet.

1. **IDs — collision possible ?** Préfixer les IDs source à la conception
   (`*_DEMO_*`, `*_PARTAGE_*`), pas en runtime. Si certitude d'absence de
   collision, la documenter dans le code.
2. **Flags — légitimes sur items utilisateur ?** `estDemo`/`isDemo` peuvent
   être hérités par accident. Ne jamais filtrer par flag SEUL sur un global.
   Grep `\.estDemo\s*=` pour lister les call-sites qui posent le flag.
3. **Type — forme attendue par les lecteurs ?** Grep `db.getSync.*<cle>`,
   inspecter 2-3 lecteurs, transformer explicitement à l'écriture si la
   source diverge (cf. `peuplerNamespace` qui convertit `pack.presences`
   objet → tableau).
4. **Réversibilité — snapshot/restauration ?** `activerModeDemo` capture
   `demo-etat-precedent` avant de muter les globaux et restaure au toggle
   OFF. Pour les données utilisateur réelles, recommander un export
   Codex/Réserve récent avant toute migration de masse.

---

## 3. INCIDENTS RÉELS LABO CODEX

> Les anti-patterns abstraits (AP-1 à AP-5) et leur antidote générique
> sont dans le **parent §3**. Ci-dessous : seulement les incidents datés
> du projet et les fonctions qui portent aujourd'hui la protection.

### 3.1 Source dérivée de données utilisateur (collision d'IDs)

**Incident** : le 24 avril 2026, 3 grilles d'évaluation H2026 de Grégoire
ont disparu silencieusement (restauration nécessaire depuis Codex USB du
18 avril). Cause racine : le pack `js/pack-demo-20.js` était initialement
construit à partir du matériel pédagogique réel de Grégoire ; les IDs des
grilles, échelles et cartouches du pack étaient **identiques** aux
ressources personnelles encore présentes dans le storage.

**État actuel du pack** : `pack-demo-20.js` (version interne `20.8`) a
refondu ses IDs avec un préfixe `GRILLE_DEMO_*`, `ECH_DEMO_*`,
`cartouches_GRILLE_DEMO_*`. Le préfixage est en place côté pack.

**Mais le préfixage seul n'est PAS le filet de sécurité.** Le commentaire
dans `fusionnerDemoVersGlobaux` (`js/demo-activation.js`) signale que le
cas de collision reste possible — exemple documenté : la grille utilisateur
`GRILLE1759529438501` (alias « Global-5 (FR-ALGO) H26 » de Grégoire)
partage le suffixe numérique avec la grille démo `GRILLE_DEMO_1759529438501`.
Le vrai garde-fou est le **push sans replace** (§3.2), pas le préfixage.
Considérer le préfixage comme une réduction du risque, jamais comme une
garantie d'absence de collision.

### 3.2 Push sans replace — la protection réelle des fusions

`fusionnerDemoVersGlobaux` (`js/demo-activation.js`) injecte les items
démo dans `listeCours`, `cours`, `enseignants`, `grillesTemplates`,
`echellesTemplates` et `cartouches_*` avec, pour chaque collection, un
test `some(x => x.id === idDemo)` **avant** le `push`. Si l'ID existe
déjà côté utilisateur, l'item démo n'est PAS ajouté — la version
utilisateur est préservée. Aucun upsert/replace par ID.

(Exception assumée : `modalitesEvaluation` est écrasé via
`window.modalitesEvaluation.remplacer(...)`, son module propriétaire SSOT.)

C'est l'antidote concret à l'AP-3 (upsert silencieux) du parent.

### 3.3 Cleanup par identité ET flag — légitime, pas une violation

`retirerItemsDemoDesGlobaux` (`js/demo-activation.js`) retire les items
démo au toggle OFF. Le filtre n'est PAS « identité seule » mais
**identité ET flag** :

```js
function estItemDemo(item) {
    return !!(item && (item.isDemo === true || item.estDemo === true));
}
// grillesTemplates :
var idsGrilles = idsDuPack('grillesTemplates'); // IDs présents dans PACK_DEMARRAGE
db.setSync('grillesTemplates', grilles.filter(g =>
    !(idsGrilles.has(g.id) && estItemDemo(g))    // retire SEULEMENT si ID du pack ET flag démo
));
```

**Pourquoi c'est correct et non une violation du principe « filtrer par
identité »** : ajouter le flag ici n'est pas un filtre aveugle par flag
(l'AP-2 du parent), c'est un **resserrement protecteur**. Le filtre par
identité seul retirerait un item utilisateur légitime qui aurait créé un
ID en collision avec le pack (cas documenté dans le code :
`listeCours.id='demo-cours'` qu'un utilisateur peut créer spontanément).
Exiger AUSSI le flag garantit qu'on ne supprime qu'un item effectivement
injecté par la démo. La règle parent reste : ne jamais filtrer par flag
SEUL. Ici on filtre par identité d'abord, puis on resserre.

(`enseignants` est retiré par ID système fixe `ENS_DEMO`, sans risque de
collision spontanée.)

### 3.4 Type des données externes (presences objet → tableau)

`peuplerNamespace` (`js/demo-namespace.js`) écrit les données démo dans
les clés `demo_*`. Pour `pack.presences`, le pack stocke un objet
`{date: {da: data}}` alors que les lecteurs (`indices.js`,
`tableau-bord-apercu.js`) attendent un tableau `[{date, da, ...}]`. La
fonction teste `Array.isArray(pack.presences)` puis convertit
explicitement (objet → tableau) avant d'écrire. Antidote concret à l'AP-4
du parent.

### 3.5 Migration de masse sans audit

Toute boucle qui itère une famille de clés (`db.keys().filter(...).forEach(...)`)
et applique un `remove`/`setSync` sans vérification cas par cas est à
risque (AP-5 du parent). Antidote projet : lister 3 cas réels divergents
(storage utilisateur, profil neuf, profil avec résidus legacy), tracer le
résultat attendu, implémenter un dry-run loggant les cibles avant
exécution.

---

## 4. CAS CONCRETS — LABO CODEX

### 4.1 Pack démo

- `pack-demo-20.js` (version interne `20.8`) utilise des IDs préfixés
  (`GRILLE_DEMO_*`, `ECH_DEMO_*`, `cartouches_GRILLE_DEMO_*`). Réduction
  du risque de collision, pas garantie.
- `js/demo-activation.js` : `fusionnerDemoVersGlobaux` (push sans replace)
  et `retirerItemsDemoDesGlobaux` (filtre identité+flag) portent la double
  protection même si une collision se reproduit.
- `js/demo-namespace.js` : `peuplerNamespace` applique la conversion de
  type pour `pack.presences` (objet → tableau).

### 4.2 Réserve (`js/reserve.js`)

- Filtrage en deux passes : étudiants par groupe, puis par DA.
- Lit les copies archivées des bibliothèques (`a2025_grillesTemplates`,
  etc.) sans les modifier — pas de risque de corruption des globaux.
- À auditer si on étend reserve.js pour faire l'opération inverse
  (réimport sélectif, cf. backlog #254) : ce sera une nouvelle source qui
  doit appliquer §2 avant d'écrire dans `grillesTemplates`.

### 4.3 Plan 2 — partage CC entre utilisateurs (à venir)

Plan 2 introduit une **3e source** dans les globaux : items partagés.
Avant de coder le pipeline d'import, appliquer §2 :

- IDs : collisions possibles avec items utilisateur ou démo → préfixe
  `PARTAGE_*` à l'import.
- Flag : `isShared` / `inspireDe.source === 'partage'` → ne pas filtrer
  par flag seul, filtrer par appartenance au package importé.
- Type : validation de schéma fermée à l'import (spec
  `docs/architecture/PLAN2-PHASE1-SPEC.md` §4).
- Réversibilité : « Désinstaller un package partagé » prévue en spec.

### 4.4 Trimestre archivé (`js/trimestres.js`)

- L'archivage copie `grillesTemplates`, `echellesTemplates`,
  `pratiquesConfigurables` vers `<trimestre>_grillesTemplates`, etc.
  (`CLES_TEMPLATES_ARCHIVES`).
- Risque potentiel : si un trimestre est archivé puis désarchivé alors
  que les globaux ont changé entre temps, comment fusionner ? À auditer
  si une refonte du désarchivage est prévue.

---

## 5. WORKFLOW ET REGEX TESTÉES

> Le workflow générique (observer / checklist / post-mortem / audit
> périodique) est dans le **parent §5**. Ici : les commandes `grep`
> exactes pour le code JS du projet, validées.

```bash
# Filtre aveugle par flag sur un global
grep -rn "\.filter(.*estDemo\|\.filter(.*isDemo" js/

# Upsert par index après findIndex
grep -rn "findIndex.*=\s*[a-z]" js/

# Migration de masse sur une famille de clés
grep -rn "keys().*filter.*forEach" js/

# Call-sites qui posent un flag démo (point 2 de la checklist)
grep -rn "\.estDemo\s*=\|\.isDemo\s*=" js/
```

Audit léger : une fois par session de travail, passer ces greps sur tout
le code pour détecter les régressions ou nouveaux call-sites à risque.

---

## 6. RÉFÉRENCES

- `docs/AUDIT-PHASE5-PRE-TENTATIVE-2.md` — collision d'IDs identifiée
  comme P2 mais pas suffisamment protégée à l'implémentation.
- `docs/POST-MORTEM-PHASE5-22-AVRIL.md` — post-mortem 1re tentative
  Phase 5 (pattern « valider lectures namespace de bout en bout »).
- `docs/modules/demo-et-autonomisation.md` — architecture finale du mode
  démo (post-correctifs du 24 avril).
- `docs/architecture/PLAN2-PHASE1-SPEC.md` — spec du partage CC (3e source).
- Fonctions de référence (code actuel, retrouvables par grep) :
  - `fusionnerDemoVersGlobaux` — push sans replace (`js/demo-activation.js`).
  - `retirerItemsDemoDesGlobaux` — cleanup par identité + flag
    (`js/demo-activation.js`).
  - `peuplerNamespace` — conversion presences objet → tableau
    (`js/demo-namespace.js`).
  - `CLES_GLOBALES`, `CLES_TEMPLATES_ARCHIVES` (`js/trimestres.js`).
- Mémoire Claude : `feedback_collision_ids_pack_demo.md` (point de vue
  IA, complémentaire à ce skill projet).

---

**Skill parent** : `SKILL_hygiene_donnees_partagees.md` (principes
abstraits, agnostique au projet).

**Date de création** : 26 avril 2026, suite à l'incident du 24 avril.
**Révision attendue** : à chaque ajout d'une nouvelle source dans les
globaux (Plan 2, Voûte, futur partage), à chaque incident révélant un
pattern non listé.
