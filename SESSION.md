# SESSION — État au 5 mai 2026 (Refonte nav + fix cartes mentales livrés, attaque backlog Réserve)

**Date** : 5 mai 2026
**Dernier build** : `0505-0735` · Beta **99.35** (poussée sur origin/main)
**Branche** : `main` (à jour avec origin)
**Statut** : Refonte de la nav principale livrée + #261 (cartes mentales perdues) résolu. Prochaine étape : reprendre le backlog Réserve/écosystème ouvert depuis fin avril.

---

## 🚀 Consigne de démarrage pour la prochaine session

À copier-coller au début de la prochaine session :

```
cd /Users/kuekatsheu/Documents/GitHub/Monitorage_v6

Contexte : 5 mai 2026, refonte de la nav principale livrée et poussée
(merge commit 311c8d9, beta 99.35 b0505-0735). #261 (cartes mentales
perdues localement) résolu : 5 cartes restaurées depuis backup 18 avril
+ patch préventif dans planification-donnees.js (fix 76144bc).

PROCHAINE ÉTAPE — Backlog Réserve/écosystème (ouvert depuis fin avril).
7 items priorisés. Ordre suggéré ci-dessous (à confirmer avec Grégoire).

LECTURE OBLIGATOIRE AVANT DE CODER :
1. `docs/architecture/ECOSYSTEME-DONNEES.md` (4 concepts : Codex, Réserve,
   Codex data, Voûte). Document fondateur du 26 avril.
2. (memory) `project_reserve.md` — référence technique du module Réserve
   v1.5 FSAPI + réimport v1.
3. CLAUDE.md (zones protégées, règles sécurité, db.setSync vs db.set).

ITEMS DU BACKLOG À CHOISIR (par priorité décroissante suggérée) :

  [HAUTE] #259 Renommage « Réserve » → « Archives » (~2-3 h)
    Vocabulaire bibliothécaire ressenti ésotérique par testeurs le 2 mai.
    À FAIRE EN PREMIER si on prévoit aussi #247, sinon on imprime le mauvais
    vocabulaire qu'il faudra changer après. Périmètre : 3 modules JS, 13
    entrées d'aide, modales, BACKLOG, mémoires, ECOSYSTEME-DONNEES.md.

  [HAUTE] #247 Refonte Réglages > Données — alignement vocabulaire écosystème
    (~1 j) Conditionné aux retours terrain sur la voie de retour Réserve.
    Refonte complète de la section Données dans Réglages pour refléter les
    4 concepts (Codex / Réserve→Archives / Codex data / Voûte). Carte de
    statut, sous-sections par concept.

  [MOYENNE] #257 v2.B Mode consultation namespace temporaire (~5-6 h)
    Suite de #257 v2.A (remapping IDs déjà livré le 28 avril). Ouvre une
    archive en lecture seule dans un namespace `__archive_*`, utile pour
    démos / formation / consultation rétrospective.

  [MOYENNE] #248 Réserve v1.1 manifeste fusion auto Safari (~2-3 h)
    FSAPI Chrome/Edge le fait déjà. Côté Safari (ZIP), le manifeste-reserve.json
    n'est pas fusionné automatiquement à l'import — l'utilisateur doit faire
    une action manuelle. À automatiser pour parité.

  [MOYENNE] #251 Codex data — extraction depuis la Réserve (~3-4 h)
    Ouvrir une archive et en extraire un sous-ensemble (cours / groupes
    spécifiques) pour générer un Codex data (format de recherche).

  [MOYENNE] #256-bis Aide aux 8 autres modales (~1 j)
    Pattern de #256 (modales Réserve, livré 28 avril) à reproduire pour
    Nouveautés, Réparation, Wizard pratique, ApercuPDF, Confidentiel,
    Export, Import, Suppression ressource.

  [BASSE] #260 Crédit Icons8 dans Réglages > À propos (~15 min)
    Ajout d'une ligne HTML dans la carte Technologies. À faire avant tout
    partage public de l'app.

CONTRAINTES (rappel CLAUDE.md) :
- Demander le numéro de beta à Grégoire avant le commit final
- Bumper version.json + js/init-inline.js
- Cache-buster dans index.html pour chaque fichier JS modifié
- Safari Mac/iPad cibles ; Cmd+Q + rouvrir entre chaque sous-phase
- echapperHtml() obligatoire sur innerHTML avec données utilisateur
- Zéro handler inline → data-action / data-on-change
- console.warn / console.error uniquement
- Variables CSS du DS, tester modes clair ET sombre
- Modales : classList.add('actif') (PAS 'visible')
- Petites métadonnées persistées : db.setSync (PAS db.set async)
- Charger SKILL_integrite_globaux.md si on touche aux clés globales partagées

OBSERVATIONS OUVERTES :
- Test iPad de la refonte nav (Mac OK, iPad non testé) — à faire à
  l'occasion, pas bloquant pour le backlog Réserve.
- BACKLOG.md contient #258 (bouton anonymisation en-tête) hors écosystème
  Réserve — peut être glissé entre deux items si l'envie.
```

---

## Récapitulatif des livrables 5 mai 2026

### Refonte navigation principale — 6 sous-phases livrées (commits `f983cc4` → `2e8bd82`, merge `311c8d9`)

Nav cible : Accueil · Aperçu · **Conception** (ex-Structure) · **Calendrier** (ex-Contexte) · Suivi · Évaluation · **Labo** (ex-Outils) · Aide · Réglages.

| Phase | Commit | Description |
|---|---|---|
| Pré | `f983cc4` | fix(rythme) bump Beta 99.34 b0504-0710 avant refonte |
| SP1 | `6973750` | refactor navigation.js : table-driven dispatcher |
| SP2 | `89f9c0d` | mouvements pratiques→Conception, bilan→Labo, Études dans Labo |
| SP3 | `ccf573b` | renommage boite-outils → labo (40 occ.) |
| SP4 | `18b492f` + `6789d3e` | renommage structure → conception (173 occ.) + fix CSS |
| SP5 | `3bfeed7` + `57c3223` | renommage contexte → calendrier (177 occ.) + fix sous-onglet 'vue' |
| SP6 | `2e8bd82` | bump Beta 99.35 b0505-0735, finalisation, NOMS_STABLES, SESSION.md |
| Merge | `311c8d9` | Merge --no-ff sur main, branche supprimée |

**Faux amis préservés** : critère SRPNF (`'structure'` dans `'rigueur'` etc.), 7 IDs `contexte-*` du dashboard, classes CSS `.carte-contexte-*`, 200 champs `"contexte": true` dans pack-demo-20.

### Fix #261 cartes mentales perdues (commit `76144bc`)

- 5 cartes restaurées depuis `backup 18 avril/donnees.json` (script de console one-shot, supprimé après usage).
- `js/planification-donnees.js` patché : `initialiserSiNecessaire()` vérifie maintenant que `index.active` pointe vers une carte qui existe dans `index.cartes`, fallback silencieux sur la première carte sinon.

### Documents de référence à ce jour

- `docs/architecture/ECOSYSTEME-DONNEES.md` — 4 concepts (Codex/Réserve/Codex data/Voûte)
- `plans de travail/PLAN-REFONTE-NAV.md` — plan refonte nav (livré le 5 mai)
- (memory) `project_reserve.md` — module Réserve v1.5 FSAPI + réimport v1
- (memory) `project_phase7_doublons.md` — module doublons (livré 2 mai)
- `BACKLOG.md` — 7 items Réserve/écosystème ouverts + 4 items hors-écosystème

---

## État global du projet (post 5 mai)

### Refonte navigation — Statut

| Sous-phase | Statut |
|---|---|
| SP1 → SP6 | ✅ livré + mergé sur main |
| Test iPad | ⏳ à faire à l'occasion |

### Backlog Réserve/écosystème — Statut

| # | Description | Effort | Priorité |
|---|---|---|---|
| #259 | Renommage Réserve → Archives | 2-3 h | **Haute** (à faire avant #247) |
| #247 | Refonte Réglages > Données | 1 j | **Haute** |
| #257 v2.B | Mode consultation namespace temporaire | 5-6 h | Moyenne |
| #248 | Réserve v1.1 manifeste fusion auto Safari | 2-3 h | Moyenne |
| #251 | Codex data — extraction depuis la Réserve | 3-4 h | Moyenne |
| #256-bis | Aide aux 8 autres modales | 1 j | Moyenne |
| #260 | Crédit Icons8 (Réglages > À propos) | 15 min | Basse |

### Hors écosystème (autres items ouverts)

- #258 Bouton anonymisation dans l'en-tête (UX, ~30 min)
- Test iPad de la refonte nav (~30 min)

### Phase 7 (doublons) — clôturée le 2 mai

Tous les paliers livrés et validés terrain.

### Bilan réflexif — phases A→D livrées le 3 mai

Phase E (génération auto) et F (bibliothèque questions canoniques) abandonnées/reportées.

---

## Prochaine session — Décision à prendre

Voir consigne de démarrage ci-dessus. Mon avis (Claude) : **commencer par #259** parce que faire #247 d'abord imprimerait le vocabulaire « Réserve / verser / versement » dans la nouvelle structure de Réglages, qu'il faudrait ensuite changer en « Archives / archiver / archive ». #259 d'abord = base propre pour #247 ensuite.

À confirmer avec Grégoire.
