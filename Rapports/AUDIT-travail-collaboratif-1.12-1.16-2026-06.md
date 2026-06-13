# Audit de vérification — travail collaboratif (IA + Grégoire), versions 1.12.0→1.16.0

> **Date de l'audit** : 13 juin 2026. Suite de l'audit du travail autonome
> (`Rapports/AUDIT-travail-IA-11-13juin-2026.md`), étendu sur ta demande au travail
> fait **avec** l'IA et l'utilisateur.
> **Méthode** : identique — vérification indépendante + scrutin adverse. Chaque
> « Confirmé » est adossé à une preuve reproductible (re-run, diff relu, ou break-test
> cassant le correctif pour voir le test rougir).
> **Fenêtre** : `67bdc3c8` (release 1.11.3, base) → `bcfd78f` (release 1.16.0).
> 10–11 juin 2026, ~16 commits de code.
> **Note** : ce dépôt était un clone superficiel ; l'historique complet (3405 commits
> depuis le 20 oct. 2025) a été rapatrié (`git fetch --unshallow`) pour rendre cette
> fenêtre auditables.

---

## Verdict global

**Travail collaboratif de qualité élevée, particulièrement sur les garde-fous de
données.** Aucune violation des règles non négociables. Les trois garde-fous
introduits pour *prévenir* la corruption de données (vérification d'écriture
post-import, intention prime sur le calendrier, pré-vol de stockage) sont **bien
conçus, correctement implémentés, et protégés par des tests qui mordent réellement**.
Ironie utile : ces garde-fous #335/#334 sont précisément la réponse aux incidents qui
ont resurgi sous #340 dans l'audit précédent — ils existent, ils sont solides, mais
ils n'attrapent pas encore tout (cf. #340).

---

## Périmètre — ce qui est audité (et ce qui ne l'est pas)

Chantiers **collaboratifs** audités en profondeur :
- **#334** — chantier import codex / stockage : pré-vol quota (A, `9d5eca7`), import
  journalisé (B, `cfca07b7`), retrait du seuil 20 Mo (`5ed65cc`), snapshot de fusion
  3-way haché (C, `619f40d`).
- **#335** — garde-fous données : vérification d'écriture post-import (C, `adc0be4`),
  garde de modèle antérieur + multi-actifs par intention (A+B, `857fb49`), libellés UX
  (`3805a6b`, `21c6ff5`).
- **#144** — palettes déplaçables au doigt sur iPad (`1da88f5`).
- **#143** — instructions du rapport de bug (`0c173dd3`) — trivial.

**Déjà couverts par le rapport précédent** (présents dans la plage par entrelacement
chronologique, non re-audités ici) : `#328` L2-a/b1, `#332` Constat 2.

---

## Étape 2 — Conformité mécanique (fenêtre 67bdc3c8..bcfd78f)

| Règle | Résultat |
|---|---|
| Zones protégées (`config.js`/`navigation.js`/`noms_stables.json`) | diff **vide** ✅ |
| `eval` / `new Function` / handlers inline ajoutés | **aucun** ✅ |
| `console.log` de debug ajoutés | **0** ✅ |
| `validerZipSecurite` préservé dans `import-export.js` | présent, aucune garde retirée ✅ |
| innerHTML non échappé | dans la baseline globale 115/120 ✅ |

Module sensible touché : `import-export.js`, `codex.js`, `travaux-stockage.js`,
`db.js`, `migrations.js`. Aucune régression de validation détectée.

---

## Étape 3 — Vérification indépendante + adverse, par chantier

### #335 C — vérification d'écriture post-import — ✅ Confirmé (garde-fou solide)
- **Conception** : `_verifierEcritureTemoins` (`codex.js:1536`) relit depuis IDB les
  clés témoins à haute valeur (`productions`, `evaluationsSauvegardees`, `groupesCours`,
  `groupeEtudiants` — exactement les données dont la perte fait mal) et compare par
  égalité JSON à ce qui vient d'être écrit. **Une lecture qui échoue compte comme
  écart** (« on ne peut pas confirmer ») — pas d'échec silencieux. Câblage verrouillé :
  flush PUIS vérification, retentative ciblée, puis alerte explicite.
- **Pertinence** : c'est la réponse directe à l'incident bis du 11 juin (copie IDB
  périmée ressuscitée au reload).
- **Break-test adverse** : en neutralisant la comparaison d'écart, **3 tests rougissent**
  (copie périmée signalée, clé absente signalée, cibles explicites). Non tautologique.

### #335 A+B — modèle antérieur + intention prime sur le calendrier — ✅ Confirmé
- **Conception** (`corrigerTrimestresMultiplesActifs`, `trimestres.js:215`) : l'élection
  se fait **parmi les trimestres réellement marqués actifs** (l'intention déclarée du
  codex), le plus récent gagnant (année desc, H>E>A). La date du jour ne décide plus
  rien — fix direct de l'incident I2 (import H2026 en juin basculant à tort sur Été 2026).
  Démo exclu de l'élection ; un seul actif → aucune écriture parasite.
- **Break-test adverse** : retirer l'exclusion démo fait élire le trimestre démo →
  le test « le démo ne peut pas être élu » **rougit**. Non tautologique.

### #334 A — pré-vol de stockage avant import — ✅ Confirmé
- **Conception** (`evaluerPrevolStockage`, `codex.js:908`) : besoin = taille × marge
  (ou taille ZIP × facteur si taille décompressée inconnue) + plancher ~100 Mo ;
  refus chiffré si `manque > 0` ; verdict **« inconnu » non bloquant** si `estimate()`
  indisponible (l'import journalisé sert alors de filet) ; heuristique navigation privée
  (quota faible). Câblé **avant** l'extraction des données, avec `persist()` sur geste
  utilisateur.
- **Break-test adverse** : forcer le verdict à toujours « ok » fait **rougir 2 tests**
  (refus chiffré, plancher 100 Mo). Non tautologique.

### #334 B — import codex journalisé — ✅ Confirmé (revue)
Le sentinel (`sentinelle-import-journalise-334B.test.js`) verrouille le comportement
réel : comptage des échecs de blobs par raison (plus de `continue` silencieux),
`stockerBlob(notifier:false)` anti-avalanche, verdict « incomplet » honnête (« le
libellé ne ment plus »), message actionnable sur échec quota, badge « manquant » dans
les 3 rendus de la visionneuse. Couverture réaliste, cohérente avec le diff.

### #334 C — snapshot de fusion 3-way haché — ✅ Confirmé (revue)
Le sentinel (`analyser-fusion-hash.test.js`) couvre `_indexerSnapshot` (format
`codex-snapshot-hash-v1`, sha256 par clé, exclusion `_codex_*`) et `_analyserFusion`
(diff 3 parties : ajouts/modifs/suppressions par côté, **tous les cas de conflit** —
modif/modif, suppr+modif dans les deux sens, ajout 2 côtés ; égalité JSON stricte).
Utilise le vrai `crypto.subtle`. Solide.

### #144 — palettes déplaçables au doigt (iPad) — ✅ Confirmé (revue)
Sentinel + test d'intégration : drag en Pointer Events capturés (pas seulement
mousedown), position bornée au conteneur (palette jamais hors zone), `touch-action:none`
sur les barres, poignée visuelle. Risque faible (UI), bien couvert.

---

## Risques résiduels

1. **Aucun défaut nouveau introduit par ces chantiers.** Les garde-fous sont sains.
2. **Limite connue, héritée** : les garde-fous #335/#334 n'ont pas empêché #340
   (audit précédent) — la corruption au **changement de trimestre** (pas à l'import)
   passe sous leur radar. La vérification d'écriture #335-C protège l'import ; il
   manque une protection équivalente sur la bascule de `cle()` au changement de
   trimestre. *Piste pour l'enquête de cause racine #340.*
3. **Playwright non re-roulé** (limite d'environnement : WebKit bloqué) — les tests
   d'intégration de la fenêtre (palettes, golden master) sont déclarés verts mais non
   re-vérifiés ici. À relancer sur le Mac.

---

## Preuves reproductibles (break-tests réalisés)

| Garde-fou | Manipulation | Observé |
|---|---|---|
| #335-C vérif d'écriture | comparaison d'écart neutralisée | ✅ 3 tests rouges |
| #335-B intention trimestre | exclusion démo retirée | ✅ test démo rouge |
| #334-A pré-vol stockage | verdict forcé à « ok » | ✅ 2 tests rouges (refus, plancher) |

Toutes les manipulations faites **en place puis restaurées immédiatement** ;
`git status` final = **arbre propre**. Aucun commit de code, aucune modification
laissée.

---

## Bilan combiné des deux audits

Sur l'ensemble **1.12.0 → HEAD (1.17.2)**, le travail de l'IA — autonome comme
collaboratif — est **conforme et de bonne qualité**, avec une couverture sentinelle
qui mord réellement (7 break-tests adverses concluants au total). Le **seul risque
sérieux** reste **#340** (corruption au changement de trimestre, cause racine non
élucidée), honnêtement documenté mais non résolu. Recommandation : prioriser
l'enquête de l'écrivain #340 et envisager d'étendre la vérification d'écriture #335-C
à la bascule de trimestre.
