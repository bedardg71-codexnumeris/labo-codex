# Rapport `/ultrareview` — Lot 3 (Indices A-C-P et dépistage)

**PR auditée** : [#5](https://github.com/bedardg71-codexnumeris/Monitorage_v6/pull/5) — branche `review/lot-3-indices`
**Date** : 29 avril 2026
**Lignes auditées** : 15 920 sur 6 modules (`indices.js`, `profil-etudiant.js`, `tableau-bord-apercu.js`, `snapshots.js`, `correlations-longitudinales.js`, `portfolio.js`)
**Statut du run** : ⚠️ **Phase Vérifier crashée. 20 candidats non vérifiés récupérés via la web UI.**

> ⚠️ **AVERTISSEMENT — findings non vérifiés**
>
> Sur les autres lots, le pipeline `/ultrareview` est :
> Configuration → **Rechercher** (candidats) → **Vérifier** (confirme/réfute) → **Déduplication** → rapport final.
>
> Pour ce lot, **Vérifier a crashé après production des candidats**. Sur le Lot 1, la phase Vérifier avait réfuté 6/26 candidats (taux ~23 % de faux positifs détectés). On peut donc s'attendre à ce qu'**environ 4-6 candidats sur les 20 ci-dessous soient des faux positifs** que les agents auraient écartés. Chaque candidat doit être trié manuellement avant correctif.
>
> **Demande de refund refusée par Anthropic** (29 avril 2026, ~10-15 \$ consommés). Les candidats ci-dessous sont la valeur récupérée du run.

---

## Distribution par fichier

| Fichier | Candidats | Lignes |
|---|---|---|
| `js/indices.js` | 5 | 108, 162, 305, 422, 562 |
| `js/snapshots.js` | 5 | 245, 307, 515, 600, 845 |
| `js/portfolio.js` | 5 | 148, 196, 218, 250, 858 |
| `js/correlations-longitudinales.js` | 5 | 50, 70, 152, 195 (×2) |

L'audit s'est concentré sur le pipeline de calcul des indices A-C-P et leur extension longitudinale. Aucun candidat sur `profil-etudiant.js` (8 818 l.) ni `tableau-bord-apercu.js` (3 227 l.) — soit ces modules sont propres, soit la phase Rechercher s'est concentrée ailleurs.

---

## Les 20 candidats à trier

### Très probablement réels (à vérifier en priorité)

Ces candidats nomment des bugs aux mécaniques claires et reconnaissables :

| # | Fichier:ligne | Candidat | Raisonnement |
|---|---|---|---|
| 1 | `js/snapshots.js:600` | cGlobal peut dépasser 100% (numérateur inclut étudiants exclus) | **Impossibilité mathématique** = bug presque certain |
| 2 | `js/snapshots.js:845` | C global dans snapshots peut dépasser 100% si exclus ont remis | Variante du #1 — cohérent |
| 3 | `js/portfolio.js:148` | Portfolio: note 0 (plagiat) lost via `\|\| null` fallback | **Falsy fallback classique** — pattern bien connu |
| 4 | `js/snapshots.js:515` | evaluationsCache may be null causing TypeError in capturerSnapshotSeance | TypeError potentiel — facile à valider |
| 5 | `js/indices.js:562` | calculerIndicesEtudiant retourne sommatif et alternatif comme MEME reference | **Mutation hazard** — bug de référence partagée |
| 6 | `js/portfolio.js:196` | parseInt without radix in artefact numero extraction | **Règle classique** — `parseInt('08')` = 0 dans certains environnements |

### Plausibles, à investiguer

| # | Fichier:ligne | Candidat | Raisonnement |
|---|---|---|---|
| 7 | `js/indices.js:305` | obtenirHistoriqueIndicesCP ignore le paramètre pratique demandé | Régression possible si la signature a évolué |
| 8 | `js/portfolio.js:858` | calculerNoteFinaleMultiObjectifs underweights when objectifs are missing P (no n…) | Edge case sur pratique multi-objectifs |
| 9 | `js/portfolio.js:218` | recents-meilleurs modality is broken: identical dateRemise renders date-sort a n… | Sort instable sur dates identiques |
| 10 | `js/portfolio.js:250` | dateRemise toujours NOW dans portfolio rend 'recents-meilleurs' inopérant | Si confirmé, casse le mode `recents-meilleurs` |
| 11 | `js/indices.js:422` | calculerPerformancePAN: filter excludes valid 0 notes (plagiat/aucun) | Cohérent avec #3 — exclusion erronée des 0 légitimes |
| 12 | `js/snapshots.js:245` | Snapshots indiceC: productionsDues filter does not exclude '\*-formatif' product… | Si confirmé, indice C contaminé par les formatifs |
| 13 | `js/snapshots.js:307` | Snapshots fallback hardcodes IDME values (40/65/75/100) inconsistent with portfo… | Hardcoding qui contredit `SCALE_FALLBACK` |
| 14 | `js/correlations-longitudinales.js:50` | Comparaison de date sans normalisation pour interventions cumulatives | Race condition possible |
| 15 | `js/correlations-longitudinales.js:70` | Cumulative intervention count miscounts when intervention.date includes time com… | Variante temporelle de #14 |
| 16 | `js/indices.js:108` | calculerEtSauvegarderIndicesAssiduite uses obtenirDonneesSelonMode('groupeEtudia… | Incompatibilité de signature potentielle |
| 17 | `js/indices.js:162` | Inconsistent treatment of heures field between regular and facultative presences | Cohérent avec un audit antérieur sur les présences |

### Possiblement faux positifs (à vérifier mais avec scepticisme)

| # | Fichier:ligne | Candidat | Raisonnement |
|---|---|---|---|
| 18 | `js/correlations-longitudinales.js:152` | Interventions perdues quand n<5 dans corrélations longitudinales | Peut être un comportement intentionnel (seuil statistique min) |
| 19 | `js/correlations-longitudinales.js:195` | Courbe P d'une intervention future commence à l'index 0 au lieu du futur | Edge case — interventions futures ne devraient pas exister en pratique |
| 20 | `js/correlations-longitudinales.js:195` | idxDebut defaults to 0 when intervention is after a… | Possible doublon du #19 |

---

## Stratégie de triage manuel

Pour chaque candidat, suivre ce protocole de validation :

1. **Lire le code à la ligne indiquée** (5 min)
2. **Tester la mécanique du bug** : peut-on reproduire le scénario décrit ? (10 min)
3. **Si confirmé** : noter la sévérité (impact métier réel ?), prioriser, fixer
4. **Si non confirmé** : documenter la raison du rejet (ex. « comportement intentionnel », « gardé en aval », « impossible vu garde X »)

**Effort total estimé pour le triage** : 5-7 heures pour les 20 candidats. Si 4-6 sont écartés comme faux positifs, il restera 14-16 vrais bugs à corriger, pour ~5-10 heures de remédiation.

---

## Note méta

- **Pipeline crashé à `Vérifier`** = pas de filtration des faux positifs par les agents
- **Distribution équilibrée 5/5/5/5** entre les 4 fichiers principaux du pipeline indices = audit systématique avant le crash
- **Les candidats touchent le cœur du calcul SSOT** = même 70-75% de ces findings sont précieux pour la cohérence statistique du Labo (cohérent avec AUDIT-COHERENCE-LABO du 27 avril)

## Lots non auditeés (audit incomplet)

Décision prise le 29 avril 2026 : **stop sur les 3 lots restants** suite au taux de crash de 50 % et au refus de refund par Anthropic.

| PR | Lot | Lignes | Statut |
|---|---|---|---|
| #6 | Évaluation cœur | 11 019 | Non audité — à reprendre plus tard |
| #7 | Pratiques notation | 20 060 | Non audité — à reprendre plus tard |
| #9 | Travaux + saisie | 19 467 | Non audité — à reprendre plus tard |

À reprendre quand l'infrastructure `/ultrareview` sera stabilisée (à surveiller dans les release notes Claude Code).
