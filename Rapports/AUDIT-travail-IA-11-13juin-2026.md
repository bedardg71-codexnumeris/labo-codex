# Audit de vérification — travail autonome de l'IA, arc 11→13 juin 2026

> **Date de l'audit** : 13 juin 2026.
> **Auditeur** : session de vérification indépendante (lecture seule sur la branche
> `claude/ai-work-audit-plan-ndp4nj`, HEAD `481d93e`).
> **Mandat** : vérifier la qualité du travail produit en autonomie du 11 au 13 juin.
> **Méthode** : vérification indépendante + scrutin adverse. Rien n'est cru sur la
> seule foi du journal `SESSION.md` ou des tests écrits par l'IA auditée ; chaque
> verdict « Confirmé » est adossé à une preuve reproductible (re-run, diff relu
> ligne par ligne, ou break-test cassant le correctif pour voir le test rougir).
> **Borne de comparaison** : `05225d8` (10 juin 19h19) → `481d93e` (HEAD).

---

## Verdict global

**Travail de bonne qualité, conforme aux règles du projet.** Aucune violation des
règles non négociables (sécurité, zones protégées, zéro-dette). Les correctifs font
ce qu'ils annoncent et sont protégés par des tests qui mordent réellement. Le seul
risque résiduel notable est **#340** (corruption de données réparée par restauration,
cause racine non élucidée) — mais ce risque est honnêtement documenté. Une seule
**incohérence documentaire** mineure détectée (statut #340 dans BACKLOG).

---

## Étape 0 — Baseline factuel (déclaré vs mesuré indépendamment)

| Élément | Déclaré (journal) | Mesuré par l'audit | Verdict |
|---|---|---|---|
| Arbre git | propre, poussé | `git status` propre, HEAD = origin/main | ✅ |
| Tests Vitest | 651 au 11 juin (puis +13) | **664 verts** re-roulés (`npm run test:unit`) | ✅ cohérent |
| Tests Playwright | 55 | **55 déclarés** (30 fichiers) — non re-roulés¹ | ⚠️ partiel |
| Total | « 706 verts » (11 juin) | 664 + 55 = 719 à HEAD | ✅ cohérent |
| Version (4 points) | 1.17.2 / 0613-0739 | `version.json`, `init-inline.js` ×2, `main.js` **cohérents** | ✅ |

¹ **Limite d'environnement** : le binaire WebKit de Playwright n'a pas pu être
téléchargé (politique réseau du sandbox). Les 55 tests d'intégration sont **déclarés
verts par l'auditée mais non re-vérifiés ici**. À re-rouler sur le poste de Grégoire :
`cd tests && npx playwright install webkit && npm run test:int`.

---

## Étape 2 — Conformité mécanique (règles non négociables)

| Règle | Méthode | Résultat |
|---|---|---|
| Zones protégées intactes | `git diff 05225d8..HEAD -- js/config.js js/navigation.js noms_stables.json` | **vide** ✅ |
| Aucun `console.log` de debug ajouté | grep des `+` du diff | **aucun** ✅ |
| Aucun `eval` / `new Function` | grep des `+` du diff | **aucun** ✅ |
| Aucun handler inline (`onclick=`…) | grep des `+` du diff | **aucun** ✅ |
| innerHTML non échappé ≤ baseline 120 | `audit-innerhtml.sh` + `lint-securite.test.js` | **115 suspects**, test vert ✅ |
| Imports validés (`validerZipSecurite`/`validerMagicBytes`) | `validation-zip` + `validation-magic` | verts ✅ |

---

## Étape 3 — Vérification indépendante + adverse, par chantier

### #336 Lot D — preview de purge de l'espace précédent — ✅ Confirmé
- **Code lu** (`js/codex.js` `_planifierPurgeEspace`) : l'identité d'une clé orpheline
  est `^[a-z]\d{4}_` (lettre + 4 chiffres + `_`). Par construction, `demo_…`, `_codex_*`
  et les clés globales (bibliothèques, trimestres, préférences) **ne matchent pas** →
  jamais candidates. La purge ne vise que les clés trimestre absentes du dataset
  importé (modèle « espace de travail actif »).
- **Sécurité de conception** : phase **preview seulement**, aucune exécution
  automatique (la suppression exige une décision humaine). Le risque est contenu.
- **Break-test adverse** : en remplaçant la regex d'identité par `/.*/`, le test
  « clés globales, démo et techniques → JAMAIS candidates » **rougit** (1 failed /
  16 passed). Le test garde réellement le comportement.
- 18 tests sentinelle couvrent : remplacement même-trimestre, blobs non référencés,
  preview câblée APRÈS la vérif de persistance, **fusion ne purge jamais**, plan
  persisté qui survit au reload.

### #328 L2-b2 — dégonflage du miroir `pratique` (SSOT) — ✅ Confirmé
- **Affirmation « miroir mort »** : vérifiée par le **ratchet statique** qui balaie
  **tout** `js/` (lecture `*.pratique` et écriture `*.pratique = …`). Zéro occurrence
  résiduelle au scan.
- **Zéro-dette respecté** : le champ n'est pas seulement abandonné, il est **activement
  purgé au boot** — `CHAMPS_MIROIRS_MORTS = ['pratiqueId','approcheEvaluation','pratique']`
  (`modalites-evaluation.js:83`) et `purgerLegacy()` est appelé depuis `main.js:357`.
  Aucun alias/wrapper « au cas où ».
- **SSOT unique** : `obtenirTypePratiqueActive` dérive de `groupesCours[].pratiqueId` ;
  les tests fonctionnels couvrent les cas pièges (désync copie/SSOT → la SSOT gagne ;
  contexte explicite #301 → biblio du trimestre consulté ; GC fantôme → null sous
  contexte). Pas tautologique.
- **Break-test adverse** : injection d'une lecture `config.pratique` dans `js/pratiques.js`
  → le ratchet la **capte à la ligne exacte** et rougit.
- **Réserve mineure** : le golden master procédural L2-0 (preuve « notes identiques
  avant/après ») est un test **Playwright non re-roulé** ici (cf. limite ¹). Le terrain
  L2-b2 (2 groupes) et le lot L2-c (jetons, ~31 sites) restent **à compléter** — déjà
  noté au BACKLOG.

### #341 — résolution de config pratique par clé namespacée — ✅ Confirmé
- **Diff relu** : `obtenirConfigurationPratiqueParId` lit désormais
  `cle('pratiquesConfigurables')` d'abord, avec repli legacy sur la clé nue — idiome
  identique à `pratiques-gestion.js`. Correctif d'1 ligne, propre.
- **Break-test adverse** : en restaurant l'ancienne lecture de la clé globale, le
  sentinel rougit (2 tests : résolution namespacée + ratchet source).

### #332 Constat 1 — enquête de code (NON appliquée) — ✅ Confirmé (diagnostic exact)
Le rapport `Rapports/ENQUETE-332-CONSTAT1-2026-06-11.md` n'applique aucun correctif
(repro avec Grégoire requise). J'ai vérifié que **le diagnostic est exact**, pas une
hypothèse d'agent :
- **Mécanisme A** confirmé : `mettreAJourNomGroupeCoursV2` (`trimestre-v2-groupes-cours.js:272`)
  réécrit `horaireHidden.value` avec l'horaire auto-associé (`:276`), dans le handler
  même du select → changer l'horaire est impossible si le groupe a un horaire associé.
- **Mécanisme B** confirmé : `sauvegarderGroupeCoursV2` (`:623`) émet le toast
  `'Groupe-cours modifié'` **hors** du bloc `if (index >= 0)` (`:610-622`) → un
  `groupeCoursEnEditionId` périmé ⇒ toast de succès sans aucune modification.

Les numéros de ligne du rapport correspondent au code réel. Enquête fiable.

### #332 Constat 2 — horaire dérivé de la SSOT (appliqué, `5d1caaf`) — ✅ Confirmé
Correctif réel dans `js/horaire.js` (38 lignes) + sentinel `sentinelle-horaire-ssot-332.test.js`
(67 lignes), suite verte.

### #340 — écrasement de `h2026_productions` — ⚠️ Réserve (risque résiduel)
- **Confirmé** : aucun correctif de code n'a été glissé sous couvert de « réparation »
  (les 2 commits #340 sont **docs seulement**). Le bug a été traité par **restauration
  de données** en terrain, pas par un correctif logiciel.
- **Risque qualité** : c'est une corruption de données réelles (productions d'un
  trimestre écrasant celles d'un autre, sur **2 couches** localStorage + IDB). La cause
  racine reste une **hypothèse non prouvée** (race d'auto-save au changement de
  trimestre, BACKLOG.md:41). **Récidive possible.** À traiter en priorité : trouver
  l'écrivain. Le risque est honnêtement documenté — ce n'est pas un angle mort caché.

### 13 juin — passe légère (#302 guides, #325 carte Sources, #299 onglets, #298 PRIVACY) — ✅ Confirmé
Changements à faible surface, sentinelles présentes et vertes
(`sentinelle-guides-som-pan-302`, `sentinelle-apropos-sources-325`), aucune régression
sécurité dans le diff.

---

## Défaut détecté (non bloquant)

**Incohérence documentaire — statut de #340 dans `BACKLOG.md`** : l'en-tête (ligne 8)
indique « #340 **RÉPARÉ** 12 juin ~12h40 », mais l'item lui-même (ligne 38) affiche
encore « 🔴 **RÉPARATION EN ATTENTE** » avec la case non cochée. Un lecteur de l'item
seul conclurait à tort que la réparation est pendante. *Correctif suggéré : synchroniser
l'item 38 avec l'en-tête (cocher, retirer « EN ATTENTE », pointer vers l'enquête de
cause racine).*

---

## Risques résiduels (priorisés)

1. **#340 — cause racine non élucidée** (corruption de données possible en récidive).
   *Le plus important.* Enquêter l'écrivain au changement de trimestre.
2. **#332 Constat 1 non appliqué** — diagnostic juste, fix non posé (repro requise).
3. **#328 terrain incomplet** — L2-b2 (2 groupes) et L2-c (jetons) à finir avant release.
4. **Playwright non re-vérifié ici** (55 tests, dont le golden master L2-0) — re-rouler
   sur le poste de Grégoire pour clore la preuve « zéro régression ».
5. **Incohérence BACKLOG #340** (ci-dessus).
6. **localStorage Mac saturé** (constaté au #340) — fallback memoryCache+IDB tient,
   mais lié à #334.

---

## Preuves reproductibles (break-tests réalisés)

| Correctif | Manipulation | Résultat attendu | Observé |
|---|---|---|---|
| #336 regex identité | `^[a-z]\d{4}_` → `.*` | sentinel filtre identité rouge | ✅ 1 failed |
| #328 ratchet miroir | injecter `config.pratique` | ratchet capte la ligne | ✅ rouge à `pratiques.js:3560` |
| #341 clé namespacée | restaurer lecture clé globale | sentinel résolution rouge | ✅ 2 failed |

Toutes les manipulations ont été faites **en place puis restaurées immédiatement** ;
`git status` final = **arbre propre**. Aucun commit, aucun push.

---

## Comment rejouer cet audit

```bash
cd tests && npm install && npm run test:unit           # 664 verts
npx playwright install webkit && npm run test:int      # 55 (poste Grégoire)
cd .. && RANGE=05225d8..HEAD
git diff --stat $RANGE -- js/config.js js/navigation.js noms_stables.json   # doit être vide
bash scripts/audit-innerhtml.sh                        # 115 ≤ 120
```
