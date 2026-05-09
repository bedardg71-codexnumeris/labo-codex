# Rapport `/ultrareview` — Lot 2 (Mode démo + intégrité collections globales)

**PR auditée** : [#4](https://github.com/bedardg71-codexnumeris/Monitorage_v6/pull/4) — branche `review/lot-2-demo-globaux`
**Date** : 29 avril 2026
**Lignes auditées** : 28 072 sur 5 modules (`demo-activation.js`, `demo-namespace.js`, `pack-demo-20.js`, `trimestres.js`, `trimestre-v2.js`)
**Statut du run** : ✅ Pipeline complet sans crash (malgré la taille). 6 findings retournés (2 normal + 3 nit + 1 pre_existing).

**Contexte critique du brief** : ce lot a été reviewé spécifiquement pour valider les antidotes appliqués après l'**incident du 24 avril 2026** (3 grilles utilisateur disparues silencieusement par collision d'IDs entre le pack démo et les globaux utilisateur). Les commits de référence étaient `40393ad` (préfixage IDs), `abecd65` (push sans replace + filtre par identité), `e21310a` (conversion presences objet → tableau).

---

## 🔴 Normal — bugs avec impact data (2)

### N1 — `retirerItemsDemoDesGlobaux` supprime des items utilisateur sur collision d'ID

**Fichier** : `js/demo-activation.js:394-420`
**Severity** : normal
**Catégorie** : symétrie inversée du fix du 24 avril (AP-2)

**Description** : Asymétrie entre fusion (toggle ON) et cleanup (toggle OFF) :
- `fusionnerDemoVersGlobaux` (l. 144-204) utilise `if (!existe) push` → **préserve** les items utilisateur partageant un ID avec le pack. Le commentaire l. 173-176 nomme explicitement le cas : *« préserve les grilles utilisateur ayant le même ID qu'une grille démo — cas observé pour GRILLE1759529438501 »*
- `retirerItemsDemoDesGlobaux` (l. 394-420) construit un Set des IDs du pack et `.filter`s out tout item dont l'ID est dans ce Set, **sans vérifier de flag**

→ Un item utilisateur soigneusement préservé pendant l'activation est silencieusement supprimé pendant la désactivation. La protection du 24 avril est unilatérale.

**Vecteur réaliste de manifestation** : `listeCours` n'a pas été préfixé par le commit `40393ad` (qui a préfixé grilles et échelles). Le pack ship `id='demo-cours'` — entropie faible, collision plausible avec un cours utilisateur.

**Walkthrough étape par étape** :
1. Utilisateur a un cours `{id: 'demo-cours', titre: 'Mon cours', isDemo: false}` dans `listeCours`
2. Toggle ON → `activerModeDemo` snapshote l'état dans `demo-etat-precedent` (ligne 257), puis `fusionnerDemoVersGlobaux`
3. Boucle de fusion : `existe = listeCours.some(c => c.id === 'demo-cours')` → `true` → pack item **non poussé**, item utilisateur intact ✅
4. Toggle OFF → `desactiverModeDemo` appelle `retirerItemsDemoDesGlobaux`
5. `idsListeCours = Set('demo-cours')`
6. `listeCours.filter(c => !idsListeCours.has(c.id))` → l'item utilisateur `demo-cours` est **supprimé**
7. `desactiverModeDemo` ne restaure jamais depuis le snapshot — seuls `trimestreActifId`, `infoCours`, `groupeCoursActif`, `modeApplication`, `modalitesEvaluation` sont relus (l. 510-525). Le snapshot des arrays (`listeCours`, `cours`, `enseignants`, `grillesTemplates`, `echellesTemplates` capturé l. 252-258) est un **dead write**

**Fix** :
- **Option A** (minimale) : changer le filtre en `!idsListeCours.has(c.id) || !c.isDemo` — items utilisateur protégés par leur absence de flag
- **Option B** (robuste) : câbler la restauration depuis `demo-etat-precedent` dans `desactiverModeDemo` (le snapshot existe déjà, il suffit de le relire)

---

### N2 — `migrerResidusPhase5` : log fantôme + flag de migration posé même sans nettoyage

**Fichier** : `js/demo-activation.js:91-120`
**Severity** : normal
**Catégorie** : décalage détection/suppression

**Description** : `migrerResidusPhase5` souffre d'un décalage entre comment elle compte les résidus et comment elle les supprime :
- L. 94-98 : `countBefore` compte les items via filtres flag — `c.isDemo`, `g.estDemo`, etc.
- L. 101 : `retirerItemsDemoDesGlobaux` filtre uniquement par appartenance au pack actuel (`PACK_DEMARRAGE`)
- L. 102 : `nbNettoyages += countBefore` est incrémenté inconditionnellement
- L. 119 : `db.setSync('migration-phase5-done', '1')` est posé inconditionnellement
- L. 120 : `console.warn('[Migration 5.E] N résidus legacy nettoyés')` ment

**Trigger** : les résidus legacy d'avant le préfixage du commit `40393ad` portent les flags `estDemo:true` mais leurs IDs non-préfixés (ex. `GRILLE1759243306842`) ne sont **pas** dans le pack actuel (qui a `GRILLE_DEMO_1759243306842`). Donc :
- Détectés par le filtre flag → `countBefore > 0`
- Non supprimés par `retirerItemsDemoDesGlobaux` (IDs absents du pack)
- Comptés comme nettoyés (faux log)
- Migration marquée done → ne se relancera jamais → résidus persistent indéfiniment

**Cas particulier `enseignants`** : `countBefore` compte par `e.isDemo` mais la suppression hardcode `e.id !== 'ENS_DEMO'` (l. 264). Tout enseignant démo legacy avec un autre ID synthétique serait compté mais pas retiré.

**Fix** : recompter après nettoyage et ne poser `migration-phase5-done='1'` que si `countBefore_post === 0`. Si non, laisser la migration tourner au prochain boot pour donner une chance à une future correction.

```js
// Avant l. 119
const countAfter = (db.getSync('listeCours', []) || []).filter(c => c.isDemo).length
                 + (db.getSync('grillesTemplates', []) || []).filter(g => g.estDemo).length
                 + ...; // toutes les collections
if (countAfter === 0) {
    db.setSync('migration-phase5-done', '1');
}
```

---

## 🟡 Nits — défense en profondeur ou edge cases (3)

### nit1 — `activerModeDemo` : activation partielle silencieuse si namespace démo vide

**Fichier** : `js/demo-activation.js:287-306`

Si `initialiserDemoNamespace()` a échoué silencieusement (pack load error, localStorage quota, exception dans `peuplerNamespace`), `demo_listeCours` et `demo_groupesCours` restent vides. Les guards `if (coursDemo)` / `if (gcDemo)` skip silencieusement, mais `demo-actif='true'`, le trimestre `demo` et `trimestreActif='demo'` sont déjà committés (l. 261, 278-280).

**Manifestation** : bandeau vert affiché, lectures `cle('groupeEtudiants')` etc. routées vers `demo_*` vides, mais `infoCours`-based reads renvoient encore le cours utilisateur précédent → UI incohérente, aperçu/bibliothèques cassés sans message d'erreur.

**Fix** : précondition au top de `activerModeDemo` qui valide `coursDemoCheck && gcDemoCheck` avant toute mutation, abort si absent.

---

### nit2 — `obtenirTrimestres` : détection de doublons asymétrique

**Fichier** : `js/trimestres.js:101-127`

Détection par `id OU nom` (l. 102), mais nettoyage uniquement par `id` (l. 116). Si deux trimestres ont des IDs distincts mais le même nom, chaque appel à `obtenirTrimestres` :
1. Loggue `⚠️ Doublons détectés, nettoyage...` (faux)
2. Itère un filtre qui n'enlève rien
3. Réécrit la liste inchangée via `db.setSync` (IDB write inutile)

**Edge case** : `creerTrimestre` (l. 270-271) dérive id et nom du même couple session/année — donc ne se déclenche qu'après import manuel ou édition directe de la base.

**Fix Option A** (minimal) : `if (idsVus.has(t.id))` seulement
**Fix Option B** : étendre le nettoyage pour matcher la détection (déduper aussi par nom)

---

### nit3 — `creerGroupeCoursDemoSiNecessaire` : schema mismatch + lecture mauvaise clé

**Fichier** : `js/trimestres.js:374-395`

Deux défauts cumulatifs :

**Défaut 1** : Schema `seances` incompatible avec `demo-namespace.js` :
- Cette fonction écrit `[{ jour: 'lundi', periode: 'AM' }, ...]` (2 champs, lowercase)
- `demo-namespace.js` peuplerNamespace écrit `[{ id, lettre, jour: 'Lundi', heureDebut, heureFin, nombrePeriodes, duree, local }, ...]` (8 champs, capitalisé)

Les consommateurs qui lisent `seance.heureDebut`, `seance.lettre`, etc. recevront `undefined`. Ceux qui comparent `seance.jour === 'Lundi'` ne matcheront pas.

**Défaut 2** : Lit le cours démo depuis `listeCours` global au lieu de `demo_listeCours` :
```js
const listeCours = db.getSync('listeCours', []);  // ← global, pas demo_*
const coursDemo = listeCours.find(c => c.isDemo || c.id?.includes('9999'));
const coursId = coursDemo?.id || '601-101-h2026-9999';  // ← hardcoded fallback
```
`pack-demo-20.js` définit le cours démo avec `id='demo-cours'`. Le `GC_DEMO` créé pointe donc vers un coursId qui n'existe nulle part.

**Fix recommandé** : **supprimer entièrement la fonction**. `demo-namespace.js` est désormais le populateur canonique de Phase 1. Si son init a échoué, mieux vaut laisser le mode démo cassé visiblement que réparer avec un schema incompatible.

---

## ⚪ Pre-existing — anti-pattern AP-5 détecté par le brief (1)

### P1 — `migrerClesVersA2025` : migration de masse hardcodée vers a2025

**Fichier** : `js/trimestres.js:868-921`
**Severity** : pre_existing (code antérieur à ce PR, mais explicitement dans le scope du brief)

**Description** : `migrerClesVersA2025` migre 14 clés globales (`groupeEtudiants`, `productions`, `presences`, `evaluationsSauvegardees`, `calendrierComplet`, `cadreCalendrier`, `horaireHebdo`, `seancesCompletes`, `evenementsPrevus`, `evenementsImprevus`, `interventions`, `indicesAssiduite`, `indicesCP`, `snapshots`) dans le namespace `a2025_*` en se basant uniquement sur le commentaire inline « *Les anciennes données non namespacées datent de A2025* ». **Aucune inspection de `cadreCalendrier.session/annee`, aucun dry-run, aucune confirmation.** C'est exactement l'anti-pattern AP-5 du `SKILL_integrite_globaux`.

**Walkthrough du scénario problématique** :
1. État initial : `trimestres = [{id:'h2025', actif:true}]`, `h2025_calendrierComplet = {...}` (déjà namespacé), mais `groupeEtudiants = [...étudiants H2025...]` (encore global, parce que `groupeEtudiants` a été ajouté à `CLES_NAMESPACEES` après)
2. Boot → `migrerVersMultiTrimestres` (l. 783-862) voit que le registre existe ET que `calendrierComplet` est déjà namespacé → return `{success:true, alreadyMigrated:true}` sans toucher aux globaux résiduels
3. `migrerClesVersA2025` s'exécute. Lit `groupeEtudiants` global, voit `a2025_groupeEtudiants === null` (gardes l. 907), écrit la liste H2025 dans `a2025_groupeEtudiants`
4. L'utilisateur reste sous H2025 ; `cle('groupeEtudiants')` résout vers `h2025_groupeEtudiants` (toujours null) → **aucun étudiant affiché**. Les données H2025 vivent maintenant, mal taggées, sous `a2025_*` et sont irrécupérables via l'UI normale.

**Le voisin `migrerVersMultiTrimestres` (l. 783-862) fait pourtant la dérivation correctement** depuis `cadreCalendrier.session/annee` ou `dateDebut`. Le fallback `migrerClesVersA2025` aurait dû suivre le même pattern.

**Fix** :
- **Option A** (préférée) : supprimer `migrerClesVersA2025` entièrement, faire confiance à `migrerVersMultiTrimestres` + `forcerMigration` qui handle ce cas
- **Option B** : dériver la destination depuis `cadreCalendrier`, fallback à `obtenirTrimestreId()` actif, ne hardcoder `'a2025'` que si aucun signal n'est disponible. Gate la fonction derrière un flag one-shot (`migration-cles-a2025-done`).

---

## Bilan méta — le brief a fait son travail

J'avais inclus dans le commit message du Lot 2 :

> *« REVIEW DOIT VÉRIFIER les 5 anti-patterns du SKILL_integrite_globaux : AP-1 source dérivée, AP-2 filtre aveugle par flag, AP-3 upsert silencieux, AP-4 supposition de type, AP-5 migration de masse sans dry-run »*

Les agents ont retracé exactement ce périmètre :

| Anti-pattern | Statut |
|---|---|
| AP-1 (source dérivée de la cible) | ✅ Confirmé corrigé via `40393ad` (préfixage IDs) |
| AP-2 (filtre aveugle par flag, **sens fusion**) | ✅ Confirmé corrigé via `abecd65` |
| AP-2 (filtre aveugle par flag, **sens cleanup**) | 🔴 **Encore présent — N1** (asymétrie de la protection) |
| AP-3 (upsert silencieux) | ✅ Confirmé corrigé |
| AP-4 (supposition de type) | ✅ Confirmé corrigé via `e21310a` |
| AP-5 (migration de masse sans dry-run) | 🔴 **Encore présent — P1** dans `migrerClesVersA2025` |

→ Le `SKILL_integrite_globaux` comme brief de review a permis aux agents d'identifier deux instances supplémentaires des mêmes anti-patterns dans des zones que les fixes du 24 avril n'avaient pas couvertes.

## Plan de remédiation suggéré

1. **N1 — protection symétrique cleanup** (~1 h) : option A (filtre par identité ET flag) — minimal, aligné sur l'option déjà appliquée côté fusion
2. **N2 — flag de migration conditionnel** (~30 min) : recompter post-nettoyage, ne poser `migration-phase5-done` que si vraiment nettoyé
3. **P1 — supprimer ou corriger `migrerClesVersA2025`** (~1 h) : vérifier que `migrerVersMultiTrimestres` + `forcerMigration` couvrent les cas, sinon dériver le préfixe depuis `cadreCalendrier`
4. **nit1 — précondition `activerModeDemo`** (~30 min) : abort si namespace démo vide
5. **nit2 + nit3** (~30 min total) : déduper aussi par nom, supprimer `creerGroupeCoursDemoSiNecessaire`

**Effort total estimé** : ~3.5 h pour une remédiation complète du Lot 2.
