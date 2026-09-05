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

---

## Dispositions — remesurées le 5 septembre 2026 (audit de la pratique de notation)

> Écrites par Claude Code sur mandat du second audit cadré
> (`Rapports/prompts-audit/PROMPT-AUDIT-pratique-de-notation-2026-09-05.md`), d'après la remesure
> sur `93b744b4` (1.121.0). Une disposition est *périmé* (le code cité n'existe plus ou le défaut est
> corrigé, preuve à côté), *refusé* (motif), ou *tenu → à inscrire* (le défaut est toujours là ;
> **le numéro de fiche est à attribuer par Grégoire à l'arbitrage** — `BACKLOG.md` n'est pas touché
> par cet audit). Verdicts : `[exécuté]` = mesuré dans
> `tests/unit/audit-pratique-de-notation-2026-09-05.test.js` ; `[lecture]` = chemin de code lu ;
> `[grep]` = compte reproductible.
> ↻ **Numéros attribués le 5 septembre 2026 en soirée, sur arbitrage de Grégoire** (fiches au `BACKLOG.md`).

| # | Candidat (ligne du 29 avril) | Disposition | Preuve, 5 septembre 2026 |
|---|---|---|---|
| 1 | `snapshots.js:600` cGlobal > 100 % (numérateur inclut les exclus) | **tenu → inscrit #726** (indice C, hors périmètre de l'audit du 5 sept. ; non couvert par le rapport du 31 août) | `[lecture]` `snapshots.js:553` : `evaluationsCache = await db.get(cle('evaluationsSauvegardees'))` — TOUTES les évaluations du trimestre ; `:508-509` : `etudiants` = `obtenirEtudiantsCoursActif()` filtré par groupe et par `estEtudiantExclu` ; `:632-641` : `nbRemis` compte les évaluations du dernier travail sans les restreindre à `etudiants`. Un élève exclu, ou de l'autre groupe du même cours, compte au numérateur seulement. |
| 2 | `snapshots.js:845` même mécanique | **tenu → inscrit #726, fusionné avec 1** | même code (`:632-641` est l'unique calcul de `cGlobal` ; `:859` relit les évaluations de la même façon). |
| 3 | `portfolio.js:148` note 0 perdue par `\|\| null` | **périmé — code mort** (retrait inscrit #722) | `[grep]` `grep -rn "chargerPortfolioEleveDetail(" js/` → sa définition (`portfolio.js:111`) et son propre repli (`:390`) ; `grep -c portfolioEleveDetail index.html` → **0** ; `grep -c toggleArtefactPortfolioFromEl index.html` → **0** ; `window.chargerPortfolioEleveDetail` n'existe pas (`[exécuté]` B3). La ligne (`:157` aujourd'hui) vit dans une fonction que rien n'appelle. Retrait proposé avec le mort (constat B-3 du rapport du 5 sept.). |
| 4 | `snapshots.js:515` `evaluationsCache` null → TypeError | **périmé — corrigé** | `[lecture]` `snapshots.js:547-556` : `evaluationsCache = evaluationsCacheParam`, sinon `await db.get(...)`, sinon `[]` dans le `catch`. |
| 5 | `indices.js:562` `sommatif` et `alternatif` = même référence | **refusé — inerte** (commenté, aucune fiche) | `[grep]` `grep -rn '\.alternatif\.\w* *=[^=]\|\.sommatif\.\w* *=[^=]' js/` → **0** écrivain : aucun consommateur ne mute l'objet ; la référence partagée (`indices.js:599`) est une rétrocompat de lecture. |
| 6 | `portfolio.js:196` `parseInt` sans radix | **refusé** | code mort (voir 3) ; et depuis ES5, `parseInt('08')` rend 8 — l'interprétation octale des chaînes préfixées `0` n'existe plus dans les moteurs cibles (Safari, WebKit). |
| 7 | `indices.js:305` `obtenirHistoriqueIndicesCP` ignore la pratique | **périmé** | `[grep]` `grep -rn obtenirHistoriqueIndicesCP js/` → **0** : l'historique `indicesCP` a été purgé (#397, décision D3 du 5 août 2026, `portfolio.js:663-669`). |
| 8 | `portfolio.js:858` `calculerNoteFinaleMultiObjectifs` sous-pondère | **périmé** | retirée (#402, `portfolio.js:902-904` : « zéro appelant … ablation zéro-dette »). |
| 9 | `portfolio.js:218` `recents-meilleurs` cassé (dateRemise identiques) | **périmé — code mort** | `selectionnerArtefactsSelonModalite` n'a qu'un appelant, `chargerPortfolioEleveDetail` (voir 3). Le mode « récents parmi les meilleurs » vivant est celui de `profil-etudiant-actions.js` (`_selectionnerArtefactsLegacy`, récence par numéro de production, #394). |
| 10 | `portfolio.js:250` `dateRemise` toujours NOW | **périmé — code mort** | idem (la ligne est `:195` aujourd'hui, dans la même fonction morte). |
| 11 | `indices.js:422` filtre exclut les 0 valides | **périmé — corrigé** | `indices.js:422-426` (#399 L7) : `e.noteFinale !== null && e.noteFinale !== undefined` ; le commentaire cite la sonde (0,70 → 0,467). |
| 12 | `snapshots.js:245` `productionsDues` n'exclut pas `*-formatif` | **tenu → inscrit #727** (indice C, hors périmètre ; non couvert par le rapport du 31 août) | `[lecture]` `snapshots.js:255-263` : seuls `facultatif` et `type === 'portfolio'` sont écartés ; les types formatifs existent encore (`productions.js:2679-2683`, `:2817` `examen-formatif`). Le C historique compte donc un formatif dû comme un travail dû. |
| 13 | `snapshots.js:307` repli IDME codé en dur (40/65/75/100) | **tenu → inscrit #716** (constat B-6 du rapport du 5 sept. — c'est l'indice P ; et l'historique SOM ne matche jamais rien, `e.da`/`e.note`) | `[lecture]` `snapshots.js:315-322` inchangé, et ATTEINT : `calculerIndicesHistoriques` passe par `obtenirPratiqueActuelle()` (`:292`), qui rend l'instance REGISTRE de la famille ; `[grep]` `calculerPerformanceHistorique` : sommative 1, pan-standards 1, **pan-specifications 0, configurable 0**. Une pratique SPE tombe donc sur ce repli ; une DEN tombe sur l'instance STD (`profil-etudiant-helpers.js`, repli `new PratiquePANStandards()`). Contredit #529 (« rien codé en dur »). |
| 14 | `correlations-longitudinales.js:50` dates non normalisées | **périmé — corrigé** | `[lecture]` `:168` `(interventions[ii].date \|\| '').substring(0, 10)` et `:52-56` tri par `dateSeance`. |
| 15 | `correlations-longitudinales.js:70` composante horaire | **périmé — corrigé** | idem 14 (`substring(0, 10)` sur toutes les comparaisons de dates). |
| 16 | `indices.js:108` signature `obtenirDonneesSelonMode('groupeEtudiants')` | **refusé — faux positif** | `indices.js:263` : c'est l'appel canonique de tout le dépôt (`modes.js:622`). |
| 17 | `indices.js:162` `heures` traitées différemment (régulier / facultatif) | **tenu → inscrit #728** (indice A, hors périmètre ; non couvert par le rapport du 31 août) | `[lecture]` `indices.js:203` : régulier `heures × 60 / dureePeriode` ; `:214` : facultatif `pPeriodes = pf.heures` (brut). Deux unités pour le même champ. |
| 18 | `correlations-longitudinales.js:152` interventions perdues si n < 5 | **refusé — voulu** | `[lecture]` `:156-160` : `SEUIL_MIN_ETUDIANTS` est un seuil statistique explicite ; sous le seuil, les corrélations sont `null`, pas les interventions (les événements sont poussés à `:164-180` quel que soit `n`). |
| 19 | `correlations-longitudinales.js:195` courbe d'une intervention future depuis l'index 0 | **tenu, mineur → inscrit #729** (lot « snapshots et corrélations » avec #726, #727) | `[lecture]` `:199-203` : `idxDebut = 0` puis `break` au premier snapshot `>= dateInterv` — une intervention postérieure à la dernière séance ne trouve rien et garde 0 : sa courbe part du début. |
| 20 | idem, doublon de 19 | **fusionné avec 19** | même ligne, même mécanique. |

**Bilan** : 9 périmés, 4 refusés, 7 tenus — inscrits #716, #726, #727, #728, #729 (et le mort #722). Le rapport n'est plus « sans suite » : **fermé le 5 septembre 2026**.
