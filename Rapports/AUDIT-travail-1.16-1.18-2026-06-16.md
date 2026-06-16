# Audit de vérification — travail 1.16.0 → 1.18.0 (sessions intermédiaires + session du 15-16 juin)

> **Date de l'audit** : 16 juin 2026. **Mode B** (audit tiers) selon
> `SKILL_verification_adverse.md`, demandé par Grégoire après constat que le
> rituel de fin de session (§4 vérification adverse) ne s'était pas déclenché de
> façon fiable depuis #338 (pas d'automatisation ; déclencheur manquant).
> **Périmètre** : tout l'intervalle `1.16.0` (`bcfd78f`, 11 juin) → `HEAD`
> (`3b222dd`, 1.18.0). Couvre l'angle mort laissé par les deux audits du 13 juin
> (qui s'arrêtaient à 1.16).

---

## 0. Baseline factuel indépendant (§6 mode B — avant tout jugement)

| Contrôle | Résultat (re-dérivé par l'auditeur) |
|---|---|
| Suite Vitest re-roulée | **755/755 verts**, 98 fichiers, 16,0 s |
| Arbre de travail | **propre** avant et après chaque break-test (P5) |
| Diff cumulé `bcfd78f..HEAD` | **45 fichiers, +1973 / −2300** (net négatif = cohérent avec l'ablation #338) |
| Tests/sentinelles ajoutés | **18** — un par chantier |

---

## 1. Balayage mécanique (§2 / P3) sur le diff cumulé

Sur les lignes **ajoutées** (js/ + index.html) : **aucun** `console.log`, **aucun**
`eval(`/`new Function(`, **aucun** handler inline `on…=`, **aucun** `innerHTML`
interpolé sans `echapperHtml`. *(Le grep innerHTML est heuristique ; l'arbre #326
ajouté cette session est couvert en plus par sa sentinelle d'échappement.)*

---

## 2. Verdicts par chantier (break-tests = artefacts factuels, P2/§4)

Légende : **Confirmé** (sentinelle faite rougir / claim re-dérivée) · **Présent
non break-testé** (proportionnalité §5) · **Réserve**.

### Sessions intermédiaires (l'angle mort)

| Chantier (version) | Surface | Verdict | Preuve produite |
|---|---|---|---|
| **#341** résolution config par clé namespacée (1.16.1) | Données/SSOT | **Confirmé** | Break-test : retour au bug (clé nue seule, `pratiques-bibliotheque.js:624`) → le test comportemental **et** le ratchet statique rougissent. Restauré, propre. |
| **#338** ablation vieil éditeur (1.17.3-5) | Ablation/zéro-dette | **Confirmé** | Break-test **inverse** (ratchet) : réintroduction de `changerPratiqueNotation` → assertion d'absence rouge sur le bon symbole. Claim « ~1987 lignes » re-dérivée = **1998 suppressions** (1244 + 768, −14 ins.). |
| **#340** garde-fou anti-contamination productions (1.17.7) | **Données / garde-fou transversal** | **Confirmé + connexions OK** | Break-test : `coherent:false` → `true` (neutralisation garde) → 2 tests « BLOQUE » rouges. **Connexions** : garde au point d'étranglement `db._ecritureAutorisee` (setSync db.js:306 + set async db.js:1045, `return` si bloqué), enregistrée pour `productions`, **aucun contournement** `localStorage.setItem`. Le trou « import-only » est fermé pour *tous* les écrivains. |
| **#332** no-op horaire↔groupe-cours (1.17.6) | Logique | **Présent non break-testé** | Sentinelle présente, suite verte. Risque faible (no-op). |
| **#334 Session D** (`db.set` IDB-first) + **#336D** purge espace | Données | **Présent non break-testé** | Sentinelles `sentinelle-db-set-idb-first-334D` / `…-purge-espace-336D` présentes, suite verte. |
| **#339** golden-master hybride indice P | Calcul note | **Présent non break-testé** | Golden master présent, suite verte. |
| **axe D D-0/D-1** (arbre + diff purs) | Moteur pur | **Présent** | Tests `exploration-pratiques-arbre/diff-326` ; consommés et étendus par D-2/D-3 cette session. |
| **#302** guides som/pan · **#325** carte Sources · **#299** renvois onglets | UI / microcopy | **Présent (balayage suffit, §5)** | Sentinelles présentes ; balayage §2 propre. |

### Session du 15-16 juin (auditée par son auteur — P7, indépendance moindre)

| Chantier | Verdict | Preuve |
|---|---|---|
| **#333 Lot 1** (decrireCalcul DEN) | **Confirmé (auto)** | Break-test plafonnement → rouge, en session. |
| **#315/#316** (modales uiDialogues, 1.18.0) | **Confirmé (auto)** | Break-test Échap→false (confirmer) + sentinelle dialogues natifs réintroduction → rouge, en session. |
| **#326 D-2/D-3** (filtre/promotion/dérivation/arbre) | **Confirmé (auto)** | Break-tests : filtre essai, promotion no-op, sentinelle sécurité arbre → rouge, en session. |

---

## 3. Passe « connexions » (P4) — invariants partagés

- **`productions`** : invariant **clos correctement** (voir #340 ci-dessus). Le
  garde générique `enregistrerGardeEcriture(cleBase, garde)` au point
  d'étranglement est le bon design (couvre tout écrivain, pas par-appelant).
- **`pratiquesConfigurables`** : **48 sites d'écriture** dans 7 fichiers
  (`pratiques.js`, `pratiques-gestion.js`, `donnees-v2.js`, `trimestres.js`,
  `import-export.js`, `wizard-pratique-v2.js`, `pratique-manager.js`). **Aucune
  garde au point d'étranglement** analogue à #340. Hors périmètre des chantiers
  audités (aucun n'a introduit de défaut ici), mais **observation transversale** :
  si une contamination inter-trimestres du type #340 touchait un jour les configs
  de pratiques, le mécanisme de garde générique est déjà là pour l'y brancher.

---

## 4. Coutures récit↔code détectées (P1/P4 — constatées, NON réparées, P5)

1. **#340 — statut contradictoire dans `BACKLOG.md`** : l'en-tête (l.8) dit
   « #340 **RÉPARÉ** 12 juin » ; l'item (l.46) affiche « 🔴 **RÉPARATION EN
   ATTENTE** », case non cochée. Déjà signalé par
   `CADRAGE-premier-essai-verification-adverse-338.md` §2 comme « premier geste
   propre » à faire — **toujours non réconcilié**. Lecture la plus probable :
   symptôme réparé (garde-fou #340 livré, ici prouvé) mais l'item n'a pas été
   mis à jour. À réconcilier (1 ligne).

---

## 5. Limites de cet audit (P6 — angles morts nommés)

- **Playwright non lançable en cloud** : le test `comparateur-pratiques-rendu.spec.js`
  (mis à jour cette session pour la nouvelle structure d'Exploration) n'a **pas**
  été ré-exécuté ici — à confirmer en CI.
- **Auto-vérification de la session courante** (P7) : #315/#316/#333/#326 sont
  audités par leur auteur ; break-tests réalisés en session, mais l'indépendance
  est moindre que pour les chantiers intermédiaires.
- **Proportionnalité (§5)** : break-tests individuels réalisés sur les **3
  chantiers données/garde-fou les plus risqués** des sessions intermédiaires
  (#338/#340/#341). #332/#334D/#336D/#339 : sentinelle présente + suite verte,
  pas de break-test individuel.

---

## 6. Verdict

**Le travail des sessions intermédiaires (1.16→1.18) tient.** Les trois
sentinelles données/garde-fou les plus à risque **mordent réellement** (rouge
produit puis restauré), donc non tautologiques ; le défaut transversal historique
(#340) est **clos au bon endroit** (point d'étranglement, tous écrivains
couverts, sans contournement) ; les claims chiffrées re-dérivées concordent.

**Risques résiduels / à traiter** :
1. Réconcilier le statut #340 dans `BACKLOG.md` (couture récit↔code).
2. Confirmer en CI le Playwright du comparateur (structure d'Exploration modifiée).
3. (Hygiène, hors urgence) envisager une garde au point d'étranglement pour
   `pratiquesConfigurables` si le besoin émerge.

**Cause racine du problème signalé par Grégoire** (rituel non déclenché depuis
#338) : confirmée — aucune automatisation, déclencheur manquant. Le présent audit
rétrospectif comble l'angle mort 1.16→1.18 ; la correction durable reste le
câblage d'un déclencheur (hook Stop et/ou commande `/fin-de-session`).
