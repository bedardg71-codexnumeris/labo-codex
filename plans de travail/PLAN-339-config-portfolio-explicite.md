# Plan #339 — Rendre la configuration du portfolio explicite dans une pratique STD

> **Date du cadrage** : 15 juin 2026 (Claude Code, session solo sur iPad — préparation,
> AUCUN code de production écrit). **Références** :
> `Rapports/DIAGNOSTIC-A25-reconstitution-pratique-hybride-2026-06-12.md` (§7 = la cible),
> `Skills pour Claude Code/SKILL_pratiques_notation.md` (§5 schéma config, §6 les deux
> moteurs, §10 pièges), `SKILL_hygiene_donnees_partagees` (filtrer par identité).
> **Statut** : 🟡 PLAN + AUDIT prêts ; **DÉCISIONS EN ATTENTE de Grégoire** (§7) avant tout
> code. Chantier **bloqué** par trois verrous (§1).

---

## 1. Verrous (à lever avant de coder)

1. **Version majeure** — le chantier change le format de données (`pratiquesConfigurables`
   gagne des liens par identité ; `production.categorie` + pondérations portfolio/terminale
   QUITTENT les productions). CLAUDE.md : un `major` est un acte public, **à confirmer avec
   Grégoire avant**.
2. **Séquencement acté (12 juin)** : APRÈS la fin de **#328 L2-c** (jetons — touche la même
   config). L2-c est encore ouvert au 15 juin.
3. **Golden master + enquête terrain (§6 du diagnostic)** : exigent les **données réelles
   A25/H2026 sur le Mac de Grégoire**. Non réalisables en session cloud/iPad. Le golden
   master synthétique (L2-0 de #328) est un point de départ mais ne couvre pas A25.

> Conséquence : cette session produit le **plan** et l'**audit**. La première brique
> codable (L0, §5) est un harness de test — non destructif, sans changement de format.

---

## 2. Cible (précisée à partir du §7 du diagnostic)

### 2.1 La pratique devient propriétaire de ses liens, par identité

```js
// pratiquesConfigurables[].configuration (STD, mode hybride) — CIBLE
{
  type: 'standards',
  portfolio: {
    nombreARetenir, minimumCompletion, methodeSelection, reglesConformite,
    artefactIds: ['prod-…', …]          // ⟵ pool d'artefacts, par identité (remplace type:'artefact-portfolio')
  },
  categories: {
    actif: true,
    selection:   { productionIds: [...], nombreARetenir, ponderation },  // ⟵ remplace production.categorie==='selection'
    obligatoires:{ productionIds: [...], ponderation }                   // ⟵ remplace production.categorie==='obligatoire'
  },
  terminale: { productionId: 'prod-…', ponderation },   // ⟵ remplace type:'terminale' + production.ponderation
  portfolioPonderation,                                  // ⟵ remplace la ponderation de la production type:'portfolio'
  notesFinales: true
}
```

### 2.2 Ce qui QUITTE les productions (retrait, pas alias — zéro-dette)

| Champ production | Devient | Sites à migrer (§3) |
|---|---|---|
| `production.categorie` | `configuration.categories.{selection,obligatoires}.productionIds` | A (2 écritures) + B (22 lectures) |
| `production.ponderation` (sur `type:'portfolio'` et `type:'terminale'`) | `configuration.portfolioPonderation` / `configuration.terminale.ponderation` | C (9 lectures) |

### 2.3 À TRANCHER : `production.type` et `production.facultatif` restent-ils sur la production ?

- **`production.type`** (36 sites, §3-E) : `portfolio`/`terminale`/`artefact-portfolio`.
  Une fois les liens par identité en place, le `type` devient **redondant** pour le calcul
  (on connaît le rôle par `artefactIds`/`terminale.productionId`). MAIS `type` sert aussi à
  l'**affichage** et à la création (productions.js). **Recommandation** : garder `type`
  comme attribut descriptif de la production (affichage/édition), mais **ne plus l'utiliser
  comme source de vérité du rôle dans le calcul** — le calcul lit la config. Évite un
  big-bang sur 36 sites ; le rôle calculatoire est dérivé de l'identité.
- **`production.facultatif`** (10 sites, §3-D) : n'est pas dans la cible §7. Il sert de
  filtre transversal (graphiques, snapshots, sommative). **Recommandation** : le LAISSER
  sur la production (hors périmètre #339) — sauf décision contraire de Grégoire.

### 2.4 Un seul moteur hybride

`calculerNoteAvecCategories` (`portfolio.js`, fn `calculerNoteHybride`) est **retiré**.
L'indice P dérive du même calcul que la note de session (`P = noteFinale/100`, comme
`simulerIndices` le fait déjà pour STD — skill §7). Les **5 divergences** du §3 du diagnostic
disparaissent. Golden master avant/après obligatoire.

### 2.5 Écran « Construction de la note »

Vue qui liste chaque production avec son **rôle effectif** (pool sélection / obligatoire /
terminale / hors calcul) et signale les états dangereux (sans rôle, zéro fantôme L6,
pondération manquante) — l'inverse des liens silencieux actuels.

---

## 3. Audit statique des call-sites (épine dorsale — relevé 15 juin)

> Surface réelle : **~79 accès directs** dans `js/` (l'estimation « ~46 » du diagnostic
> était basse). Détail vérifié par lecture de code, lecture seule.

### A. ÉCRITURES `production.categorie` (2) — à RÉÉCRIRE vers la config
- `pratiques-gestion.js:2229` `toggleProductionCategorie()` — `prod.categorie = checked ? categorie : null` → doit écrire dans `configuration.categories.*.productionIds`.
- `productions-import-export.js:612` `sauvegarderMigrationCategories()` — migration existante (assistant de catégorisation). À reconsidérer / absorber par la nouvelle migration.

### B. LECTURES `production.categorie` (22) — à dériver de la config
- **Moteur 2 (à retirer)** : `portfolio.js:1013-1014` `calculerNoteHybride()`.
- **Moteur procédural (profil)** : `profil-etudiant-actions.js:272,276,291,545`.
- **Affichage profil** : `profil-etudiant-sections-affichage.js:148,152,2617,2652`.
- **Synthèse/rétroaction** : `synthese-retroaction-data.js:782,793,796,812,823`.
- **UI pratique (écritures d'UI)** : `pratiques-gestion.js:2197,2198,2214,2250,2251` (génération checkboxes + recalcul pondérations unitaires).
- **Assistant migration** : `productions-import-export.js:480,501`.

### C. LECTURES `production.ponderation` portfolio/terminale (9) — à dériver de la config
- **Moteur procédural** : `profil-etudiant-actions.js:499-500` (`pondP`, `pondT`).
- **Moteur STD instance** : `pratique-pan-standards.js:257-258` + `466-467` (défauts 60/40).
- **Sommative** (`ponderation || 1`) : `pratique-sommative.js:92,141,274` — **hors périmètre hybride STD** mais à noter (la sommative continue de lire `production.ponderation` ; ne pas casser).

### D. LECTURES `production.facultatif` (10) — recommandé HORS périmètre (cf. §2.3)
`profil-etudiant-rapport.js:59` ; `graphiques-progression.js:622,844,1700` ; `snapshots.js:253,501` ; `correlations-longitudinales.js:280` ; `pratique-pan-standards.js:570` ; `pratique-sommative.js:312` ; `pratique-configurable.js:369`.

### E. LECTURES `production.type` ∈ {portfolio,terminale,artefact-portfolio} (36) — cf. §2.3
Concentrés dans `productions.js` (création/affichage/validation, ~15), `profil-etudiant-sections-affichage.js` (~11), `profil-etudiant-actions.js` (`obtenirProductionTerminale`/`obtenirArtefactsNonTerminal`), `comparateur-pratiques.js:150,550`, `portfolio.js:115`, `profil-etudiant-helpers.js:211`, `productions-import-export.js:481,502`.
→ Si `type` reste descriptif (reco §2.3), seuls les sites du **chemin de calcul** changent (les `find(type==='terminale')`/`filter(type==='artefact-portfolio')` du moteur), pas les 36.

### F. Tests
Aucun test ne lit directement `production.categorie/ponderation/facultatif` (vérifié). Les sentinelles touchent `config.categories`, `details.portfolio.ponderation`, etc. Fichiers à revisiter en fin de chantier : `sentinelle-wizard-roundtrip-317`, `sentinelle-cablage-pratiqueid-307-sessionC`, `golden-master-procedural-L2-0`.

---

## 4. Découpage en lots

> **Avancement (15 juin 2026, session iPad)** :
> - **✅ L0 LIVRÉ** : `tests/unit/golden-master-hybride-indiceP-339.test.js` (Vitest, 5 cas,
>   break-testé). Fige le moteur « indice P » `calculerNoteAvecCategories` (le retirable),
>   pièges L5/L6/L9 inclus. Le golden master du moteur **profil** (`calculerDetailsNoteFinale`)
>   reste à figer côté Playwright/CI avec les vraies données A25 (Mac) — c'est **L0 bis**.
> - **⚠️ L1 RECLASSÉ** : un helper `obtenirRoleProduction` autonome serait **du code mort**
>   tant que L2 n'a pas posé les liens par identité (rien ne l'appellerait) → contraire à la
>   règle zéro-dette. Et la variante « seam » (encapsuler la dérivation actuelle par
>   `type`/`categorie`) touche le chemin de calcul **profil**, non vérifiable en cloud
>   (Vitest ne couvre pas `calculerDetailsNoteFinale`). **Décision : L1 n'est PAS un lot
>   non destructif isolé** ; il est fondu dans L2/L3 et fait une fois le L0 bis (golden master
>   profil, Mac) en place pour vérifier le refactor du moteur vivant.

- **L0 — Golden master (préalable, non destructif)** ✅ : moteur indice P figé en Vitest
  (livré). **L0 bis** (à faire, Mac/CI) : figer le moteur profil hybride sur données A25.
- **L1 — Modèle de données cible + helper de dérivation** ⚠️ reclassé (voir avancement) :
  fondu dans L2/L3 ; le helper `obtenirRoleProduction(productionId, config)` naît **avec son
  premier consommateur**, jamais seul.
- **L2 — Migration** : `production.categorie`/pondérations portfolio-terminale → config
  (idempotente, A25 + H2026). Retrait des champs des productions APRÈS lecture. Préserver
  les données réelles (contrainte rétro-compat unique du projet).
- **L3 — Bascule des lecteurs** : sections B + C (24 sites) lisent la config via le helper L1.
- **L4 — Moteur unique** : retrait de `calculerNoteHybride` (portfolio.js) ; l'indice P
  dérive de `noteFinale`. Golden master L0 doit rester vert (ou écart expliqué et acté).
- **L5 — Écritures d'UI** : `toggleProductionCategorie` + recalcul pondérations écrivent
  dans la config (section A). Coordonner avec **#319** (l'étape catégories de l'assistant
  écrit ces mêmes liens — éviter deux écrivains divergents).
- **L6 — Écran « Construction de la note »** : vue de transparence (§2.5).
- **L7 — Nettoyage zéro-dette** : retrait définitif des champs morts sur les productions,
  des assistants de migration de catégorie devenus inutiles, mise à jour des skills (§5, §6,
  §10 de SKILL_pratiques_notation) et du DIAGNOSTIC.

---

## 5. Stratégie de migration (L2)

- **Idempotente** : drapeau `migration_339_liens_pratique_done` (patron `main.js` existant).
- **Sens** : pour chaque pratique STD hybride, scanner les productions du/des groupe(s)-cours
  qui l'utilisent, recopier `categorie`→`productionIds`, `ponderation` portfolio/terminale →
  config, PUIS retirer les champs des productions. **Observer avant de transformer** : logguer
  un récapitulatif (combien de productions reclassées par pratique) avant écriture.
- **Trimestres archivés** (A25, cf. diagnostic §8) : `cle()` redirige vers `a2025_*` si les
  copies existent — A25 monté avant le 28 jan 2026 n'en a peut-être pas. La migration doit
  gérer le cas « pas de copie archivée » sans corrompre.
- **Garde anti-corruption** : réutiliser le patron du registre de gardes d'écriture de #340
  (`db.js`) si pertinent, pour bloquer une migration qui viderait une config existante.

---

## 6. Golden master & vérification adverse

- L0 fige les chiffres AVANT. Après L4, ré-exécuter : tout écart doit être **expliqué**
  (c'est l'objectif — unifier les 5 divergences §3) et **acté par Grégoire** sur ses données
  réelles (terrain Mac). Ne jamais déclarer l'équivalence sur le seul synthétique.
- Chaque sentinelle nouvelle doit être **break-testée** (réinjecter l'ancien comportement →
  rouge) avant d'être crue (SKILL_verification_adverse).

---

## 7. DÉCISIONS À TRANCHER (Grégoire) — bloquantes

- **D1 — Version majeure** : confirmer le passage en `major` (changement de format).
- **D2 — `production.type`** : descriptif conservé (reco §2.3) ou retiré aussi ?
- **D3 — `production.facultatif`** : hors périmètre (reco §2.3) ou inclus ?
- **D4 — Séquencement** : attendre la fin de #328 L2-c, ou démarrer L0/L1 (non destructifs)
  en parallèle puisqu'ils ne touchent pas la config jetons ?
- **D5 — Coordination #319** : qui écrit les liens (assistant #319 vs écran de pratique) —
  un seul écrivain canonique à désigner avant L5.

---

## 8. Risques

- **Double moteur pendant la transition** (L3 avant L4) : un lecteur basculé et l'autre non
  → notes incohérentes. Mitigation : L3 et L4 rapprochés, golden master entre les deux.
- **Données A25 sans copie de template archivée** (§5) : migration partielle. Mitigation :
  cas explicite + journalisation, jamais d'écrasement silencieux.
- **Surface d'affichage** (36 sites `type`) : si on retire `type` (D2=oui), big-bang.
  Mitigation : garder `type` descriptif (reco).
- **Chevauchement #319** : deux écrivains de liens. Mitigation : D5 tranché avant L5.
