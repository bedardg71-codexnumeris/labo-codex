# Rapport d'investigation — #353 saturation de localStorage

> Document d'analyse pour **décision humaine**. Lecture seule : aucune
> remédiation #353 n'a été appliquée (seul le fix de durabilité Option C l'a été,
> cf. PR #71). Issu d'un audit adverse multi-agents de `db.js`, recoupé au code.
> Date : 28 juin 2026 (soir).

## Vue d'ensemble

La saturation de localStorage (#353) **n'est pas un trou de durabilité**. C'est la
**cause amont** qui *fabrique* les écritures « IDB-seules » asynchrones — celles
sur lesquelles les Options A/B/C garantissent désormais la durabilité. Régler #353
ne corrige pas une perte de données (Option C l'a fait) : ça **réduit la fréquence**
du chemin IDB-seul et améliore l'observabilité. Les choix possibles sont des
**décisions de conception**, d'où ce rapport plutôt qu'un correctif autonome.

## 1. Mécanisme (faits, lus au code)

- `SEUIL_IDB_FIRST = 200 * 1024` (`db.js:50`) s'applique **par valeur individuelle**
  via `_estimateSize` (`db.js:393`), **jamais sur le cumul** de localStorage.
- Une clé < 200 Ko va en localStorage (cache synchrone) + IDB. Tant que *chaque*
  clé reste sous le seuil, elles **s'empilent** dans localStorage.
- La saturation n'est découverte qu'au `QuotaExceededError` (`setSync`, `db.js`
  branche quota), pas anticipée.
- Quota WebKit pour origine `file://` ≈ 5 Mo. ~45 clés via `cle()` × N trimestres
  reconstruits (objectif multi-trimestres H26/A25/A24/H24) + clés globales →
  dépassement **bien avant** qu'une clé n'atteigne le seuil individuel.

## 2. Pourquoi ce n'est PAS une perte au hard refresh (réfutations)

- **353-P1 (réfuté)** : au dépassement de quota, `setSync` bascule en
  `memoryCache` + `_trackWrite` → l'écriture emprunte **exactement** le chemin
  durci par A/B/C (résolution sur commit + drainage). La bascule par-valeur
  augmente la *fréquence* du chemin IDB-seul, elle n'ouvre **aucun** chemin de
  perte nouveau.
- Le seul chemin non persisté (`!idbDispo → throw`) est une **erreur visible**,
  pas un revert silencieux, et ne se déclenche pas sous WebKit (IDB disponible).
- **353-P2 (réfuté comme durabilité)** : des contributeurs de saturation ne sont
  jamais purgés — réel comme *dette*, pas comme perte de données.

## 3. Contributeurs de saturation (à confirmer en mesurant `window._storageStats`)

| Contributeur | Localisation | Nature |
|---|---|---|
| Clés `<trim>_*` × N trimestres | reconstruction multi-trimestres | Croissance attendue |
| `*_backup_v1` jamais purgés | `migration-diagnostic.js` (outil console manuel) | Dette — non câblé UI |
| `tamponsImages` base64 inline | `tampons-bibliotheque.js` | Volumineux, non namespacé |
| `evaluationsSauvegardees`, `productions`, `presences`, `indicesPatternsRaI` | clés métier | Grosses, candidates IDB-first |

## 4. Options de remédiation (décision Grégoire)

| Option | Effet | Risque | Coût |
|---|---|---|---|
| **1. Observabilité** — journaliser/alerter quand `window._storageStats` dépasse ~80 % d'un budget | Visibilité avant saturation, zéro changement de comportement | **Faible** | Faible |
| **2. Abaisser `SEUIL_IDB_FIRST`** (ex. 100 Ko) | Plus de clés en IDB-first, soulage localStorage | **Faible** (réhydratation memoryCache au boot déjà en place) | Faible |
| **3. IDB-first par identité de clé** (liste blanche : `evaluationsSauvegardees`, `productions`, `presences`, `indicesPatternsRaI`, `tamponsImages`) | Bascule déterministe, indépendante des tailles | **Moyen** (vérifier les call-sites de lecture) | Moyen |
| **4. Quota piloté** via `navigator.storage.estimate()` (déjà importé ailleurs) | Purge avant saturation | **Moyen** (logique de purge à concevoir) | Moyen |

**Recommandation** (à valider) : commencer par **Option 1** (observabilité, sans
risque) pour *mesurer* la réalité de la saturation sur le codex réel, puis décider
entre 2 et 3 sur des chiffres plutôt que des hypothèses. L'Option 1 transforme une
hypothèse en donnée — cohérent avec « présenter le chiffre avant la décision ».

## 5. Hygiène zéro-dette adjacente (hors #353 strict)

- `libereCacheLocalStorage` (`db.js`) = **code mort** (zéro appelant) → supprimer
  ou câbler comme soupape.
- Clés `*_backup_v1` jamais purgées (outil console `window.migrationSnapshot` non
  câblé UI).
- `tamponsImages` base64 inline non namespacé.

À grouper dans une session zéro-dette dédiée, distincte de la durabilité.

## 6. Ce qui est déjà clos

- **Durabilité** (A+B = PR #70 mergée ; C = PR #71) : toute opération IDB
  (écriture/suppression/effacement/blob/FSAPI) résout sur le commit et toute
  opération fire-and-forget est drainée au déchargement. La saturation ne peut
  plus provoquer de revert silencieux.
- **353-G1** (commentaire faux de `trimestres.js` sur la durabilité de
  `removeSync`) : devenu exact avec Option C volet 1.
