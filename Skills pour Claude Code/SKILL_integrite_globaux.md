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

# SKILL : Intégrité des collections globales

> **Document fondateur** — 26 avril 2026, après l'incident du 24 avril où
> 3 grilles d'évaluation ont disparu silencieusement du trimestre H2026.
> La cause racine n'était pas un bug ponctuel mais un **pattern d'erreur
> récurrent** dont 5 manifestations distinctes ont été observées au fil
> des chantiers Phase 5 Autonomisation.
> Ce skill documente le pattern, les signaux d'alerte, et les antidotes.

---

## 1. POURQUOI CE SKILL

Dans Labo Codex, certaines clés du storage sont **globales** (au sens de
`CLES_GLOBALES` dans `js/trimestres.js`) — c'est-à-dire qu'elles ne sont
pas namespacées par trimestre. Elles cohabitent entre toutes les sessions
de l'utilisateur :

```
trimestres, grillesTemplates, echellesTemplates, pratiquesConfigurables,
modalitesEvaluation, modeApplication, etatsAccordeonsV2, cours, listeCours,
enseignants, cartouches_*
```

Ces clés sont **fragiles** parce qu'elles reçoivent des items provenant
de **plusieurs sources distinctes** :

- Items créés par l'utilisateur (Grégoire) — propriété personnelle
- Items injectés par le pack démo (`pack-demo-20.js`) — système
- Items importés depuis un export Beta 91 ou un partage CC futur — externes
- Items copiés lors d'un archivage de trimestre — copies isolées

**Aucun invariant n'est garanti** sur la coexistence de ces sources :
les IDs peuvent se chevaucher (le pack démo dérivait du matériel réel
de Grégoire jusqu'au 24 avril 2026), les flags `estDemo`/`isDemo` peuvent
être présents par accident sur des items utilisateur (héritage de cycles
legacy), les types peuvent diverger entre source et lecteurs.

**Toute manipulation programmatique de ces clés** doit donc partir de
ce qui existe, pas de ce qu'on imagine.

---

## 2. AVANT DE CODER — CHECKLIST 4 POINTS

À écrire en tête du plan AVANT toute fusion, filtre, écrasement ou
suppression dans une clé globale. Trois lignes en console suffisent
souvent à valider chaque point.

### 2.1 IDs — collision possible ?

> Les IDs que je vais écrire/manipuler peuvent-ils correspondre à ceux
> d'items déjà présents dans la collection cible ?

**Si oui** : préfixer les IDs source (`*_DEMO_*`, `*_PARTAGE_*`) **à la
conception**. Pas en runtime. Si la décision est tardive, refondre la
source plutôt que d'ajouter des protections au manipulateur.

**Si non, certain à 100 %** : documenter cette certitude dans le code
(commentaire avec le raisonnement) pour que la prochaine session le
relise sans avoir à re-vérifier.

### 2.2 Flags — légitimement présents sur items utilisateur ?

> Le flag que je vais filtrer (`estDemo`, `isDemo`, `isShared`, etc.)
> peut-il être posé légitimement sur un item utilisateur ?

**Test à faire** : grep dans tout le code pour `\.estDemo\s*=` (ou
équivalent). Lister les call-sites qui posent le flag. S'assurer
qu'aucun ne touche un item utilisateur en dehors d'un cycle système
explicite.

**Si doute** : ne JAMAIS filtrer par flag seul. Filtrer par identité
de la source (set des IDs du pack/import).

### 2.3 Type — forme attendue par les lecteurs ?

> Les données que je vais écrire correspondent-elles au type que les
> lecteurs aval attendent ?

**Test à faire** : ouvrir 2-3 lecteurs (grep `db.getSync.*<cle>`) et
vérifier ce qu'ils font des données. Tableau ? Objet ? Avec quelle
shape ?

**Si la source diverge** : transformer EXPLICITEMENT à l'écriture
(comme `peuplerNamespace` convertit `pack.presences` objet → tableau).
Ne pas écrire la donnée brute en supposant qu'elle correspondra.

### 2.4 Réversibilité — snapshot ou restauration possible ?

> Si mon code corrompt ou supprime des données par erreur, l'utilisateur
> peut-il revenir en arrière ?

**Test à faire** : avant toute opération destructive, capturer un
snapshot dans une clé temporaire (`<operation>-etat-precedent`). En cas
d'échec dans le `try`, restaurer dans le `catch`. Documenter la
durée de vie de ce snapshot.

**Pour les données utilisateur réelles** : un export Codex/Réserve
récent doit être recommandé à l'utilisateur avant toute migration de
masse, dans la procédure de test.

---

## 3. 5 ANTI-PATTERNS — INCIDENTS RÉELS LABO CODEX

Chaque entrée ci-dessous décrit un anti-pattern observé dans le code
Phase 5 Autonomisation, l'incident qu'il a causé, le signal d'alerte
à grep, et l'antidote correct.

### 3.1 Source qui dérive de données utilisateur

**Incident** : le 24 avril 2026, 3 grilles d'évaluation H2026 de Grégoire
(`grille_1770742838756_23q82vbsk`, `grille_1772187755149_uq1oiiafa`,
`GRILLE1759529438501`) ont disparu silencieusement. Restauration nécessaire
depuis Codex USB du 18 avril.

**Cause racine** : le pack `js/pack-demo-20.js` était initialement
construit à partir du matériel pédagogique réel de Grégoire (auteur
original). Les IDs des grilles, échelles et cartouches du pack étaient
**identiques** aux ressources personnelles que l'utilisateur avait
encore dans son storage.

**Signal d'alerte** :
- Tu manipules un pack système (`PACK_DEMARRAGE`, `bibliotheque-pratiques`,
  un export à réimporter, etc.) dont les items partagent le même schéma
  d'IDs que les items utilisateur.
- Le pack a été constitué « à partir du matériel de Grégoire », « à partir
  d'un trimestre réel anonymisé », ou « comme exemple ».

**Antidote** : préfixer les IDs du pack à la conception, pas en runtime.

```js
// AVANT — pack contient les IDs originaux de l'utilisateur
{
    "grillesTemplates": [{ "id": "GRILLE1759243306842", ... }],
    "cartouches_GRILLE1759243306842": [...]
}

// APRÈS (commit 40393ad du 24 avril 2026) — IDs préfixés
{
    "grillesTemplates": [{ "id": "GRILLE_DEMO_1759243306842", ... }],
    "cartouches_GRILLE_DEMO_1759243306842": [...]
}
```

### 3.2 Filtre aveugle par flag sur un global partagé

**Incident** : `retirerItemsDemoDesGlobaux` (commit du 24 avril, `abecd65`)
filtrait `estDemo:true` sur `grillesTemplates`. Une grille utilisateur
qui aurait hérité du flag par un cycle legacy ancien était supprimée.

**Signal d'alerte** :
```
\.filter\(.*\.estDemo\)
\.filter\(.*\.isDemo\)
```
Sur une clé globale partagée. Tu retires « les items démo », tu signales
le flag avec confiance, mais le flag est un signal **non-trusted**.

**Antidote** : filtrer par identité de la source (set des IDs
appartenant au pack), pas par flag.

```js
// AVANT — filtre aveugle, supprime tout ce qui porte estDemo
db.setSync('grillesTemplates', grilles.filter(g => !g.estDemo));

// APRÈS — filtre par appartenance au pack
const pack = window.PACK_DEMARRAGE;
const idsDuPack = new Set((pack.grillesTemplates || []).map(g => g.id));
db.setSync('grillesTemplates', grilles.filter(g => !idsDuPack.has(g.id)));
```

### 3.3 Upsert (replace par ID) dans une fusion vers global

**Incident** : `fusionnerDemoVersGlobaux` (commit du 24 avril, `abecd65`)
faisait un `findIndex` puis `arr[idx] = nouvelleVersion`. Quand un ID
existait déjà côté utilisateur, sa version était écrasée par la version
système (avec `estDemo:true`). Combiné au pattern 3.2 ci-dessus, cela
provoquait la perte définitive de la grille utilisateur.

**Signal d'alerte** :
```
\.findIndex.*=\s*nouvelleVersion
new\s+Map\(.*\.map\(.*\[.*id.*\]\)\)\.set\(
```
Sur un global partagé.

**Antidote** : push sans replace. La version existante (utilisateur) a
priorité. Une collision d'ID est un cas qui doit être tracé, pas un
upsert silencieux.

```js
// AVANT — écrase la version utilisateur si même ID
const idx = grilles.findIndex(g => g.id === grilleDemo.id);
if (idx >= 0) grilles[idx] = grilleDemo;
else grilles.push(grilleDemo);

// APRÈS — préserve la version utilisateur
const existe = grilles.some(g => g.id === grilleDemo.id);
if (!existe) grilles.push(grilleDemo);
// Si existe : on ne touche pas, l'utilisateur garde sa version
```

### 3.4 Suppositions sur le type des données externes

**Incident** : `peuplerNamespace` (commit Phase 5.B fixup du 24 avril,
`e21310a`) copiait `pack.presences` tel quel. Le pack stockait un objet
`{date: {da: data}}` mais tous les lecteurs (`indices.js`,
`tableau-bord-apercu.js`) attendaient un tableau `[{date, da, ...}]`.
La barre Assiduité (A) restait vide sans erreur visible.

**Signal d'alerte** :
- Tu copies des données depuis une source externe (pack, import, fetch)
  vers le storage **sans** `Array.isArray()` / `typeof` / vérification
  de schéma.
- Les lecteurs aval ont des fallbacks silencieux du type
  `if (!Array.isArray(x)) x = [];` — ce qui masque l'erreur de type sans
  la signaler.

**Antidote** : transformer EXPLICITEMENT à l'écriture vers le format
attendu, en testant le type d'entrée.

```js
// AVANT — copie brute, suppose que pack.presences est un tableau
db.setSync(cleDemo('presences'), pack.presences);

// APRÈS — vérifie le type, convertit explicitement
let presencesArr = [];
if (Array.isArray(pack.presences)) {
    presencesArr = pack.presences;
} else if (pack.presences && typeof pack.presences === 'object') {
    Object.keys(pack.presences).forEach(date => {
        const parDA = pack.presences[date] || {};
        Object.keys(parDA).forEach(da => {
            presencesArr.push(Object.assign({ date, da }, parDA[da]));
        });
    });
}
db.setSync(cleDemo('presences'), presencesArr);
```

### 3.5 Migration de masse sans audit pré

**Incident** : `migrerResidusPhase5` (commit du 24 avril, `0f927b3`)
détectait des résidus `estDemo:true` puis appelait
`retirerItemsDemoDesGlobaux` qui supprimait aveuglément tous les items
porteurs du flag. Combiné au pattern 3.2, cela a provoqué la perte des
grilles utilisateur dès le boot post-Phase 5.E.

**Signal d'alerte** :
```
db\.keys\(\).*\.filter.*startsWith.*forEach\(.*remove
```
Ou toute boucle qui itère une famille de clés et applique un
remove/setSync sans vérification cas par cas.

**Antidote** : avant d'écrire une migration, lister 3 cas réels
divergents (storage de l'utilisateur, profil neuf, profil avec résidus
legacy) et tracer le résultat attendu pour chacun. Implémenter un
**dry-run** qui logge les actions sans les exécuter, demander une
validation manuelle, puis exécuter la vraie passe.

```js
// AVANT — migration en aveugle
function migrer() {
    if (db.getSync('migration-done')) return;
    if (countResidus() > 0) retirerToutLesResidus();
    db.setSync('migration-done', '1');
}

// APRÈS — dry-run + validation + filtrage par identité de la source
function migrer({ dryRun = false } = {}) {
    if (db.getSync('migration-done')) return { skipped: true };
    const aSupprimer = identifierResidusParIdentiteSource();
    if (dryRun) {
        console.warn('[Migration] Cibles:', aSupprimer);
        return { dryRun: true, cibles: aSupprimer };
    }
    aSupprimer.forEach(item => supprimerSurement(item));
    db.setSync('migration-done', '1');
    return { ok: true, supprimes: aSupprimer.length };
}
```

---

## 4. CAS CONCRETS — LABO CODEX

### 4.1 Pack démo

- Le pack `pack-demo-20.js` v20.3+ utilise des IDs préfixés
  (`GRILLE_DEMO_*`, `ECH_DEMO_*`, `cartouches_GRILLE_DEMO_*`). Les
  versions antérieures (≤ v20.2) avaient les IDs originaux de Grégoire.
- `js/demo-activation.js` (modules `fusionnerDemoVersGlobaux` et
  `retirerItemsDemoDesGlobaux`) applique les patterns 3.2 et 3.3
  (push sans replace + filter par identité du pack). Double sécurité
  même si la collision se reproduit.
- `js/demo-namespace.js` (`peuplerNamespace`) applique le pattern 3.4
  pour `pack.presences` (conversion objet → tableau).

### 4.2 Réserve (`js/reserve.js`)

- Filtrage en deux passes : étudiants par groupe, puis par DA.
- Lit les copies archivées des bibliothèques (`a2025_grillesTemplates`,
  etc.) sans les modifier — pas de risque de corruption des globaux.
- À auditer si on étend reserve.js pour faire l'opération inverse
  (réimport sélectif, cf. backlog #254) — ce sera une nouvelle source
  qui doit appliquer §2 avant d'écrire dans `grillesTemplates`.

### 4.3 Plan 2 — partage CC entre utilisateurs (à venir)

Plan 2 introduit une **3e source** dans les globaux : items partagés.
Avant de coder le pipeline d'import, appliquer §2 :

- IDs : possibles collisions avec les items utilisateur ou démo →
  préfixe `PARTAGE_*` à l'import.
- Flag : `isShared` ou `inspireDe.source === 'partage'` → ne pas filtrer
  par flag, filtrer par appartenance au package importé.
- Type : validation de schéma fermée à l'import (déjà dans la spec
  `docs/PLAN2-PHASE1-SPEC.md` §4).
- Réversibilité : « Désinstaller un package partagé » prévue en spec,
  garde-fou nécessaire.

### 4.4 Trimestre archivé (`js/trimestres.js`)

- L'archivage copie `grillesTemplates`, `echellesTemplates`,
  `pratiquesConfigurables` vers `<trimestre>_grillesTemplates`, etc.
- Risque potentiel : si un trimestre est archivé puis désarchivé et
  qu'entre temps les globaux ont changé, comment fusionner ?
- À auditer si une refonte du désarchivage est prévue.

---

## 5. WORKFLOW RECOMMANDÉ

### Avant un chantier touchant un global

1. Identifier les clés globales touchées (grep `CLES_GLOBALES` dans
   `js/trimestres.js`).
2. Appliquer §2 (4 points) en tête du plan, dans une section dédiée.
3. Pour chaque point, écrire la commande console qui valide
   l'hypothèse.

### Pendant le chantier

4. Avant chaque `db.setSync` sur un global, relire la checklist.
5. Grep les signaux d'alerte §3 sur le code en cours :
   ```bash
   grep -rn "\.filter\(.*estDemo\|\.filter\(.*isDemo" js/
   grep -rn "findIndex.*=\s*[a-z]" js/
   ```

### Après un incident touchant un global

6. Post-mortem court (5-10 min) en 3 points : symptôme, cause racine,
   hook évitant.
7. Si la cause révèle un nouveau pattern, l'ajouter à §3 de ce skill.
8. Mémoire feedback Claude correspondante (si transversale aux projets).

### Audit léger périodique

9. Une fois par session de travail (ou par jour), grep des signaux §3
   sur tout le code pour détecter les régressions ou les nouveaux call-sites
   à risque.

---

## 6. RÉFÉRENCES

- `docs/AUDIT-PHASE5-PRE-TENTATIVE-2.md` — Audit Phase 5 où la collision
  d'IDs a été identifiée comme P2 (point d'attention) mais pas suffisamment
  protégée à l'implémentation.
- `docs/POST-MORTEM-PHASE5-22-AVRIL.md` — Post-mortem 1re tentative
  Phase 5 (révèle déjà le pattern « valider lectures namespace de bout
  en bout »).
- `docs/modules/demo-et-autonomisation.md` — Architecture finale du mode
  démo (post-correctifs du 24 avril).
- Commits de référence :
  - `abecd65` — Patchs de protection (`fusionnerDemoVersGlobaux` +
    `retirerItemsDemoDesGlobaux`).
  - `40393ad` — Pack démo refondu avec IDs préfixés.
  - `e21310a` — Conversion presences objet → tableau dans Phase 1.
- Mémoire Claude : `feedback_collision_ids_pack_demo.md` (point de vue
  IA, complémentaire à ce skill projet).

---

**Date de création** : 26 avril 2026, suite à l'incident du 24 avril.
**Révision attendue** : à chaque ajout d'une nouvelle source dans les
globaux (Plan 2, Voûte, futur partage), à chaque incident révélant un
pattern non listé.
