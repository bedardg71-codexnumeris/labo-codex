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

## 3bis. ⚠ L'UNITÉ DU QUOTA — mesurée le 10 août 2026, et elle change la lecture

**Le navigateur facture localStorage en unités de code UTF-16 (caractères), pas
en octets.** Mesuré au navigateur (Chromium, origine `file://`) en remplissant
jusqu'au `QuotaExceededError` :

| Remplissage | Caractères tenus | Octets UTF-8 | Octets UTF-16 |
|---|---|---|---|
| `'x'` (1 car. = 1 octet UTF-8) | 4,94 M | 4,94 M | 9,88 M |
| `'é'` (1 car. = 2 octets UTF-8) | 4,94 M | 9,88 M | 9,88 M |

Même capacité **en caractères** des deux côtés : c'est le caractère qui est
compté. Le plafond nominal est donc **5 Mi caractères**.

⮕ **Ce que cela corrige.** `statsStockage` comptait `(clé+valeur).length × 2` —
des octets UTF-16 — et divisait par un budget de 5 Mi. **Le ratio affiché valait
le double de la réalité** : les « 173 % » du 9 août étaient 86 %, et les
« 200 % » du 10 août sont **100 %**. Le chiffre n'était pas absurde, il était
dans la mauvaise monnaie — et un ratio impossible (200 % d'un quota qu'on ne
peut pas dépasser) invite à ne plus croire l'alerte, ce qui est le pire résultat
pour une alerte.

⮕ **Et une troisième unité cohabitait** : `SEUIL_IDB_FIRST` (200 Ko) était
comparé à des **octets UTF-8** (`new Blob(...).size`). Un seuil et un budget qui
ne parlaient pas de la même chose — donc aucun arbitrage possible sur chiffres,
ce que ce rapport demande pourtant depuis le 28 juin.

**Corrigé le 10 août (1.70.0)** : une seule monnaie partout, le caractère.
Validation croisée au navigateur — le ratio vaut **99,4 % au moment exact du
refus d'écriture**.

⮕ **Ce que la mesure dit de l'état réel de Grégoire** : 5 119 K car. / 5 120 K
car. = **100 % du plafond**. Son localStorage est **plein**. Aucune donnée n'est
en danger (durabilité A/B/C), mais **toute écriture bascule désormais en
memoryCache + IDB** — le « chemin IDB-seul » que ce rapport voulait rendre plus
rare est devenu le seul.

---

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

## 4bis. De quoi trancher l'option 2 — la projection (livrée le 10 août)

`db.statsStockage()` rend désormais `projectionSeuils` : pour 25 / 50 / 100 /
200 Ki caractères, **combien de clés basculeraient et combien de place serait
libérée**. Le rapport disait « mesurer avant de trancher » ; sans cette table,
choisir un seuil restait une intuition déguisée en décision.

⚠ **Ce que les chiffres connus laissent déjà voir** : le top 5 de Grégoire
(9 août) pèse 116 / 115 / 95 / 91 / 89 K caractères — **tous très en dessous des
200 Ki du seuil**, ce qui explique qu'ils dorment dans localStorage. Et 472 clés
totalisent 5 119 K car. : **la masse est dans la longue traîne, pas dans quelques
géants**. Une option 3 (liste blanche de grosses clés) déplacerait donc peu ;
l'option 2 (abaisser le seuil) est la piste à chiffrer en premier.

⮕ **Geste demandé à Grégoire** : coller `db.statsStockage()` en console et
rapporter `projectionSeuils`. C'est l'entrée manquante de la décision.

---

## 5. Hygiène zéro-dette adjacente (hors #353 strict)

- ~~`libereCacheLocalStorage`~~ — **retiré le 3 juillet** (Option 1).
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
