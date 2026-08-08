# Audit PERFORMANCE + LOGIQUE — 5 août 2026 (soir)

> **Mandat** : `plans de travail/_archives/AUDIT-PERF-LOGIQUE-consigne.md` (Grégoire, 5 août fin de journée).
> **Session** : Claude Code cloud, branche `claude/audit-perf-logique-6i4qol`, lecture seule stricte
> (aucun correctif code, aucune exception). Base auditée : `main` 1.31.13 (`0889c063`), Vitest 1354/1354
> vérifié en début et fin de session. Skills chargés : vérification adverse, pratiques de notation, labo codex.
> **Méthode** : chaque trouvaille est passée par la vérification adverse — sondes Node sur fixtures
> synthétiques (code RÉEL chargé via `chargerScript`, jamais de recalcul parallèle), ou lecture complète
> du chemin. Sondes jetables dans le scratchpad (protocoles reproduits ci-dessous), rien de committé.

---

## Sommaire exécutif

1. **3 rouges LOGIQUE confirmées par sonde** : (L1) toute pratique *configurable* Sommative calcule **P = 0 pour tout le monde** (lecture d'un format `indicesCP` retiré en Beta 95.5) ; (L2) les **deux systèmes de calcul STD identifient une « terminale » différente** → 82,67 vs 74,29 sur le même corpus ; (L3) le tableau de bord **stocke un P calculé au repli** (74) là où le profil/comparateur disent « non constructible » (couture #326 T1 non refermée).
2. **Le pipeline « enregistrer les présences » coûte ~460 ms** à l'échelle réelle (75 étu × 30 séances) — cause mesurée : re-parse JSON des mêmes clés une fois **par étudiant** ; croissance quasi quadratique (×10 → 10-30 s).
3. Motif transversal « aujourd'hui » : **10 sites fonctionnels utilisent la date UTC** (`toISOString`) — dès 20 h (heure de Toronto), « aujourd'hui » devient demain (assiduité, snapshots, aperçus).
4. Deux pistes perf de la consigne sont **réfutées par mesure** : `statsStockage` (1,3 ms/appel, throttlé 60 s) et `verifierUniciteIds` (linéaire, Set) — pas de chantier à ouvrir.
5. Le seuil 200 Ko inverse les coûts de lecture : clé en memoryCache = 0,25 µs, clé en localStorage = 862-2165 µs **par getSync** — le correctif structurel (cache d'objets pour les clés chaudes < 200 Ko, ou lectures hissées hors boucle) règle d'un coup les trois mesures rouges du volet B.

---

## VOLET A — LOGIQUE

### 🔴 L1 — Pratique configurable « moyenne_ponderee » (Sommative) : P = 0 pour tous — CONFIRMÉ (sonde)

- **Où** : `js/pratiques/pratique-configurable.js:228` (`donneesEtudiant.actuel.PAN?.P || 0`) et `:233`
  (`donneesEtudiant.actuel.SOM?.P || 0`) ; même motif au fallback `js/pratiques/pratique-configurable.js:133`.
- **Quoi** : `PratiqueConfigurable.calculerPerformance` lit la structure **duale** `actuel.SOM/actuel.PAN`
  retirée en **Beta 95.5** — le format écrit par `calculerEtStockerIndicesCP` est **plat**
  (`{date, pratique, C, P, details}`, `js/portfolio.js:653`). `actuel.SOM` est donc toujours `undefined`
  → `|| 0`. Le cas `'specifications'` a été corrigé pour exactement cette classe de bug le 6 juin
  (délégation, cf. commentaire `:241-247`) ; `moyenne_ponderee` et `conversion_niveaux` sont restés.
- **Impact** : le wizard crée bel et bien des configurables Sommative (`js/wizard-pratique-v2.js:2651-2652`).
  Pour une telle pratique : `calculerDetailsNoteFinale` rend `null` (garde STD) → **tous** les chemins
  (indices stockés, simulation, comparateur) aboutissent à `calculerPerformance` → **P = 0 malgré des
  notes réelles**, et `noteConstructible` reste `true` (0 est un nombre) → le 0 s'affiche comme légitime.
  Les 4 pratiques STD abouties de Grégoire ne passent pas par ce chemin (vérifié #326, 28 juin) —
  ce sont les expérimentateurs CoP qui créeront des SOM/variantes au wizard qui sont exposés.
- **Sonde** (reproduite 2×) : store plat `indicesCP[da].actuel = {C:70, P:86}` + config
  `{calcul_note:{methode:'moyenne_ponderee'}}` → `calculerPerformance` = **0** (attendu sain : 0,86).
  Idem `conversion_niveaux` → 0.
- **Réfutation tentée** : cherché un autre écrivain du format dual encore actif — aucun
  (`calculerEtStockerIndicesCP` est le seul producteur, format plat depuis 95.5) ; cherché un
  migrateur legacy dual→plat qui laisserait des `.SOM` en stockage — n'inverse rien : même s'il en
  restait, `actuel` réécrit au premier recalcul est plat.
- **Correctif esquissé (M)** : pour `moyenne_ponderee`, déléguer à une instance `PratiqueSommative`
  jetable (patron exact de la délégation SPE `:241-247`) ; pour `conversion_niveaux`, lire
  `donneesEtudiant.actuel.P` (plat) OU déléguer au chemin STD. Sentinelle : fixture plate + les deux
  méthodes ≠ 0.

### 🔴 L2 — Deux définitions de « production terminale » entre les deux systèmes STD — CONFIRMÉ (sonde + lecture)

- **Où** : chemin riche `js/profil-etudiant-actions.js:230-232` (`type === 'terminale'` STRICT) vs
  instance `js/pratiques/pratique-pan-standards.js:230-234` (**première** production `ponderation > 0`
  hors portfolio/artefact, quel que soit son type).
- **Sonde** (corpus : portfolio pond 60, 4 artefacts, « examen intra » type `examen` pond 10,
  « terminale » type `terminale` pond 30 ; notes artefacts 60/70/80/90, intra 40, terminale 88,
  config STD meilleurs-3) :
  - chemin riche (`calculerDetailsNoteFinale`) → **82,67** (portfolio 80 ×60 + terminale 88 ×30, /90) ;
  - instance registre (`calculerPerformance`) → **74,29** (portfolio 80 ×60 + **intra 40** ×10, /70 —
    l'intra est pris pour terminale, la vraie terminale est ignorée).
- **Impact** : 8,4 points d'écart sur le même corpus. L'instance sert les replis du tableau de bord
  (voir L3), les **snapshots** (`calculerPerformanceHistorique`, même logique inline `:349-460`) et
  l'id actif `'standards'` (registre = défaut + cible de normalisation des ids legacy). Dès qu'un
  corpus STD porte une production pondérée non terminale (intra, participation), les deux systèmes
  racontent deux notes.
- **Réfutation tentée** : vérifié si `_identifierProductionTerminale` (riche) a un fallback
  pondération — non, `type === 'terminale'` seul ; vérifié l'ordre du tableau productions — `find`
  = premier match, ordre de saisie, donc non déterministe pédagogiquement.
- **Correctif esquissé (S/M)** : extraire UNE fonction d'identification partagée (SSOT), l'utiliser
  dans les deux systèmes + `calculerPerformanceHistorique`. Décision à trancher avec Grégoire :
  `type === 'terminale'` strict (recommandé, cohérent avec le seed D1) avec chemin de migration pour
  les corpus où la terminale est encore `type:'travail'`.

### 🔴 L3 — Couture #326 T1 : le tableau de bord stocke un P que le profil déclare « non constructible » — CONFIRMÉ (sonde)

- **Où** : `js/portfolio.js:637-651` (`calculerEtStockerIndicesCP` : si `detailsNote.noteFinale`
  est `null` → repli `pratique.calculerPerformance(da)`), vs `js/portfolio.js:748-771`
  (`_simulerIndicesInterne` : le même repli est **écarté** pour la famille STD depuis #326 T1,
  décision Grégoire 28 juin « une STD non constructible rend null, plus jamais un 0 trompeur »).
- **Sonde** (pratique active `'standards'` registre, `pratiquesConfigurables` vide, corpus L2) :
  - `simulerIndices(da,'standards')` → `{P: 0, noteFinale: null, noteConstructible: false}` ✓ (T1) ;
  - `calculerEtStockerIndicesCP()` → `indicesCP[da].actuel = {C: 0, P: 74}` — le repli instance
    calcule avec les **défauts legacy** (`_lireConfiguration` : 3/meilleurs) et la terminale L2.
- **Impact** : le même étudiant montre « non calculable » au profil et **74** aux barres du tableau
  de bord. C'est le défaut « aux coutures » type (P4 du skill) : le fix T1 a couvert `simulerIndices`
  mais pas l'écrivain jumeau. Second effet du même repli : quand la pratique active est une STD
  *configurable* dont le chemin riche échoue, le repli tombe sur L1 (`conversion_niveaux` → 0) →
  **P stocké = 0** au lieu de « non constructible ».
- **Correctif esquissé (M)** : appliquer la même discrimination par famille dans
  `calculerEtStockerIndicesCP` (STD riche en échec → stocker un marqueur non-constructible, pas un
  nombre de repli) ; nécessite de décider comment `indicesCP.actuel` encode « non constructible »
  (aujourd'hui `P_decimal === null` → `P: 0`, `js/portfolio.js:651` — un 0 stocké est indistinguable
  d'un vrai zéro). Sentinelle : parité stocké ↔ simulé sur le même corpus.

### 🟡 L4 — `pan_par_objectif` : deux défauts de champ → P = 0 systématique — CONFIRMÉ (lecture complète)

- **Où** : `js/pratiques/pratique-configurable.js:141-144` (filtre sur `evaluation.note` — le champ
  réel des `evaluationsSauvegardees` est `noteFinale`, cf. tout le reste du moteur et l'écrivain
  `js/evaluation.js:2398`) ; `:162` (filtre sur `evaluation.objectifs` — **aucun écrivain** ne pose
  ce champ sur une évaluation, grep sur tout `js/`).
- **Impact** : une pratique créée au wizard avec « approche par objectifs »
  (`js/wizard-pratique-v2.js:2660-2663`) calcule 0 pour tous. Double défaut : même en corrigeant
  `note`→`noteFinale`, le lien évaluation→objectif n'existe pas dans le modèle (il passe par
  `production.objectif`, cf. `js/portfolio.js:874-876`).
- **Correctif esquissé (M)** : résoudre l'objectif via la production (patron de
  `calculerPerformanceParObjectif` de portfolio.js) et filtrer sur `noteFinale`. À confronter à la
  décision « variante par-objectifs foldée dans Standards » (peut-être ce chemin doit-il plutôt être
  retiré — zéro-dette).

### 🟡 L5 — « Aujourd'hui » en UTC dans 10 sites fonctionnels : bascule à 20 h — CONFIRMÉ (lecture, motif dénombré)

- **Où** (sites *fonctionnels*, hors noms de fichiers d'export) : `js/indices.js:156`
  (`calculerAssiduite` — la garde « la séance d'aujourd'hui ne compte pour l'étudiant que s'il a une
  saisie » s'applique à la mauvaise date après 20 h, heure avancée de l'Est : une séance saisie en
  soirée compte immédiatement une absence pour les étudiants pas encore saisis) ; `js/snapshots.js:410,459,885`
  (`calendrier[aujourdhui]` — lit le jour calendaire de demain en soirée) ; `js/presences-apercu.js:101,165`
  (séances « complétées » incluant demain) ; `js/rythme.js:771,894` ; `js/interventions.js:651` ;
  `js/saisie-presences.js:73`.
- **Pendant local** : d'autres sites calculent la date du jour en LOCAL
  (`js/presences-apercu.js:303-304`, `js/saisie-presences.js:530-531`) — les deux conventions
  coexistent dans le même fichier ; le comportement diffère selon l'heure de la journée.
- **Repro** : `new Date('2026-08-05T21:00:00-04:00').toISOString().split('T')[0]` → `'2026-08-06'`.
  Tout usage au poste après 20 h (EDT) ou 19 h (EST).
- **Correctif esquissé (S)** : un helper unique `dateLocaleYMD()` (le code l'a déjà en 3 exemplaires
  privés, ex. `formaterDateTrimestreYMD`, `js/trimestre.js:253`) et bascule des 10 sites. Sentinelle :
  test qui fige `TZ=America/Toronto` et une heure de soirée.

### 🟡 L6 — Pondérations portfolio/terminale 0/0 : noteFinale = NaN traverse la garde — CONFIRMÉ (sonde)

- **Où** : `js/profil-etudiant-actions.js:499-511` (la garde d'erreur ne teste que `== null`, pas
  `0 + 0`) → `:392-396` (`_calculerNoteFinaleAggregee` divise par `totalPond` = 0).
- **Sonde** : corpus L2 avec `ponderation: 0` explicite sur portfolio ET terminale, config STD
  valide → `calculerDetailsNoteFinale().noteFinale = NaN`, `erreur = null`. En aval :
  `NaN !== null` → `calculerEtStockerIndicesCP` stocke `P = NaN` (affichages « NaN ») ;
  `simulerIndices` est protégé par `isFinite` (`js/portfolio.js:784`), le stocké ne l'est pas.
- **Correctif esquissé (S)** : traiter `totalPonderation === 0` comme erreur de configuration
  (même message que pondération manquante). Sentinelle : fixture 0/0 → `erreur` non nul, jamais NaN.

### 🟡 L7 — Note 0 exclue du repli `calculerPerformancePAN` — CONFIRMÉ (sonde)

- **Où** : `js/indices.js:411` (`e.noteFinale` en filtre *truthy* — `0` est falsy).
- **Sonde** : notes [0, 80, 60] → repli « 3 meilleures » = **0,70** au lieu de 0,467 (le zéro
  disparaît du corpus au lieu de compter).
- **Portée** : chemin de repli seulement (« Calcul à la volée » quand `indicesCP` manque pour le DA,
  `js/indices.js:502-516`) — mais c'est précisément le chemin qui s'exécute avant le premier
  recalcul ou sur données importées. Le reste du moteur filtre correctement
  (`!== null && !== undefined`).
- **Correctif esquissé (S)** : aligner le filtre sur le motif standard. Sentinelle : fixture avec un 0.

### 🟡 L8 — Reprise saisie un samedi : avalée par le statut « weekend » — CONFIRMÉ (sonde)

- **Où** : `js/trimestre.js:187-215` — l'ordre des branches de la passe 2 teste `estWeekend` AVANT
  `mapReprises` ; l'input `v2-dateReprise` (`index.html:6669`) n'a aucune contrainte de jour.
- **Sonde** : congé 2026-09-07 avec reprise le samedi 2026-09-12 → `calendrier['2026-09-12']` =
  `{statut:'weekend'}` — la séance de reprise n'existe nulle part (pas de `numeroJour`, jamais
  offerte à la saisie de présences, assiduité faussée pour cette séance).
- **Réalité terrain** : les reprises de fin de session un samedi existent au collégial ; rien ne
  prévient l'utilisateur (la validation #369 ne couvre pas ce cas).
- **Correctif esquissé (S)** : tester `mapReprises` avant `estWeekend` (décision : une reprise
  volontairement placée un samedi est un jour de cours) OU avertissement #369 « reprise un
  week-end, elle sera ignorée ». À trancher avec Grégoire.

### 🟡 L9 — Deux définitions de « récence » pour la sélection STD `recents` — CONFIRMÉ (lecture)

- **Où** : chemin riche `js/profil-etudiant-actions.js:313-322` (tri par **numéro de production**,
  correction du 24 jan 2026) vs instance `js/pratiques/pratique-pan-standards.js:191-194` et
  historique `:384-413` (tri par **dateEvaluation**).
- **Impact** : dès qu'une reprise est évaluée tard (numéro de production petit, date d'évaluation
  récente), les deux systèmes retiennent des artefacts différents → la note du profil et celle des
  snapshots/replis divergent. Même famille de défaut que L2 (chaque « correction » n'a été appliquée
  qu'à un seul des deux systèmes).
- **Correctif esquissé (S)** : même geste que L2 — partager le comparateur de récence (SSOT).

### 🟢 L10 — La config portfolio de l'instance STD lit encore la source legacy retirée en G2-a — CONFIRMÉ (lecture)

- **Où** : `js/pratiques/pratique-pan-standards.js:760-800` (`_lireConfiguration` :
  `modalitesEvaluation.configPAN.portfolio`, puis `portfolio.regles`, puis défauts 3/meilleurs) ;
  même source legacy dans `js/portfolio.js:135-142` (`chargerPortfolioEleveDetail`, l'affichage du
  panneau Portfolio) et `js/portfolio.js:890-891` (`calculerPerformanceParObjectif`).
- **Quoi** : la Phase G2-a (24 mai) a basculé le chemin riche sur `pratiquesConfigurables`
  *uniquement* (« configPAN driftait à l'édition wizard ») — le chemin instance et deux fonctions de
  portfolio.js lisent toujours la source driftante. Conséquence concrète : le panneau Portfolio du
  profil peut afficher un `nombreARetenir` différent de celui utilisé par le calcul.
- **Correctif esquissé (M)** : brancher `_lireConfiguration` sur `obtenirConfigPratiqueActive()`
  (avec repli explicite pour l'id registre `'standards'`) et purger les lectures `configPAN`
  restantes (zéro-dette). Lié à L2/L3 (même chantier « réunifier les deux systèmes »).

### 🟢 L11 — Multi-objectifs de portfolio.js : somme pondérée non normalisée + 0 appelant — CONFIRMÉ (lecture + grep)

- **Où** : `js/portfolio.js:963-989` (`calculerNoteFinaleMultiObjectifs` : un objectif sans note
  contribue 0 au numérateur mais son poids n'est pas retranché — la note est dégonflée
  mécaniquement ; et si Σpoids ≠ 100, l'échelle est faussée). `poidsTotal` est calculé puis
  jamais utilisé pour normaliser.
- **Portée** : `window.calculerNoteFinaleMultiObjectifs` n'a **aucun appelant** hors module (grep
  js/ + index.html) → code mort de fait. Candidat ablation zéro-dette plutôt que correction ;
  si conservé, normaliser par `poidsTotal`.

### 🟢 L12 — Divers confirmés en lecture, faible gravité

- **Sélection auto `recents-meilleurs` du panneau Portfolio** : `dateRemise` est fabriquée
  (`new Date()` pour tous, TODO assumé `js/portfolio.js:194`) → le tri « récents » de cette modalité
  est un no-op (ordre = tri précédent par note). Cohérent nulle part avec L9.
- **Champ `heures` à double sémantique** : présences régulières = heures réelles
  (`js/saisie-presences.js:670` : `periodes × durée / 60`), présences RàI = **périodes** stockées
  dans `heures` (`js/interventions.js:814` libellé « Durée (périodes) », écrit tel quel `:1419`).
  `js/indices.js:199` convertit les heures régulières, `:210` prend les « heures » RàI telles
  quelles — cohérent aujourd'hui **par compensation croisée** ; tout futur lecteur qui convertira
  uniformément cassera l'assiduité. Renommer le champ RàI (`periodes`) ou documenter au registre.
- **`js/evaluation.js:2398`** : la note sauvegardée est relue du DOM
  (`parseFloat(textContent) || 0`) — un textContent non numérique devient un **0 silencieux**
  (et un vrai « 0 » affiché traverse, OK). Fragile plutôt que faux ; à noter pour le chantier
  d'éclatement d'evaluation.js.
- **`estDansPlage` (`js/trimestre.js:270-273`)** : une plage planification/examens avec une seule
  borne saisie est ignorée en silence (les deux requises) — cohérent avec la chaîne #371, mais la
  validation #369 pourrait le signaler.

### Approfondissement #393 — dates de repli en dur de `genererCalendrierComplet` : chiffré — CONFIRMÉ (sonde)

- **Où** : `js/trimestre.js:90-92` (`'2025-08-21'`/`'2025-12-12'`/`'2025-12-22'`) ; la garde
  `js/trimestre.js:94-97` (« dates manquantes, calendrier non généré ») est **morte** — les replis
  garantissent des valeurs truthy, le `console.warn` est inatteignable.
- **Sonde** : cadre vide → **124 entrées** écrites dans `calendrierComplet`, du 2025-08-21 au
  2025-12-22, dont **82 jours « cours » fantômes** (sans horaire, tous les jours ouvrables passent).
  C'est le mécanisme exact derrière « la réinit des bornes PURGE au lieu de régénérer » (#390).
- **Correctif esquissé (S)** : supprimer les 3 replis, laisser la garde vivre (retour `{}` + warn),
  et purger la clé si bornes absentes. Sentinelle : cadre vide → 0 entrée.

### 🟢 L13 — Repli `⌈joursCours/5⌉` de `calculerStatistiquesCalendrier` — PLAUSIBLE (non reproduit sur données réalistes)

- **Où** : `js/trimestre-v2.js:57`. Le repli ne s'active que si AUCUN jour `cours`/`reprise` ne porte
  `numeroSemaine` — impossible sur un calendrier régénéré par la passe 1 #368 (vérifié : tout jour
  `cours` a son entrée `numSemParDate`), donc uniquement sur un calendrier **legacy/importé** non
  régénéré. Dans ce cas, `joursCours` compte les jours du **groupe** (horaire partiel : 30 jours à
  2 j/sem) → « 6 semaines » au lieu de 15. Divergence réelle mais fenêtre étroite ; c'est le même
  geste que #390 (régénérer au bon moment) qui la ferme.

### Écarts confrontés au skill AVANT déclaration (non-bugs, décisions documentées)

Conformément à la consigne §1.3 : `ponderation || 1` en SOM (piège documenté §10 du skill),
récence STD = « dernier essai » (décision pédagogique §2 bis), assiduité vide = 100 % (bénéfice du
doute), congés personnels comptés comme jours effectifs (#368, décision Grégoire), P « commodité ≠
équivalence » entre familles — **rien de tout cela n'est consigné comme trouvaille**.

---

## VOLET B — PERFORMANCE (chemins chauds, mesures reproductibles)

> **Protocole commun** : sondes Node 22 (`chargerScript` du harnais de tests) chargeant le code
> RÉEL (`js/db.js` + modules mesurés), fixtures synthétiques à l'échelle réelle (25-75 étudiants,
> 10-40 productions, 30 séances) et ×10 en marge ; 3 runs, meilleur temps retenu (JIT chaud).
> **Limites nommées** : (1) pas d'IndexedDB en Node → `useIndexedDB=false`, la latence des
> transactions IDB n'est PAS mesurée (nommée là où elle compte) ; (2) mon faux localStorage est une
> Map mémoire — le vrai `getItem` Safari est PLUS lent → les chiffres ci-dessous sont des
> **planchers** ; (3) JIT Node ≠ JavaScriptCore : retenir les ordres de grandeur et les lois de
> croissance, pas la 3e décimale.

### 🟡 P1 — Pipeline « enregistrer les présences » : ~460 ms à l'échelle réelle, croissance quasi quadratique — MESURÉ

Après chaque enregistrement de présences : `calculerEtSauvegarderIndicesAssiduite()` (indices.js)
qui chaîne `calculerEtStockerIndicesCP()` (portfolio.js). Mesures séparées, code réel :

**(a) Assiduité** — `calculerAssiduite(da)` relit `presences` + `groupeEtudiants` PAR étudiant
(`js/indices.js:148-151` + `construireDatesSaisiesGroupe:111`) :

| Échelle | Taille `presences` | ms | getSync (relectures) |
|---|---|---|---|
| 25 étu × 30 séances | 62 Ko | **12,8 ms** | presences ×25, groupeEtudiants ×26 |
| 75 étu × 30 séances | 187 Ko | **113,2 ms** | presences ×75, groupeEtudiants ×76 |
| 75 étu × 300 séances (×10) | 1,9 Mo | 1 013 ms | idem |
| 750 étu × 30 séances (×10) | 1,9 Mo | 10 730 ms | presences ×750 |

**(b) Chaîne C/P** — pratique sommative registre : `calculerCompletion` + `calculerPerformance`
relisent `evaluationsSauvegardees` + `productions` PAR étudiant (2 lectures/étudiant), et
`calculerCompletion` est O(productions × évaluations) par étudiant
(`js/pratiques/pratique-sommative.js:327-351`) :

| Échelle | Taille évals | ms | getSync |
|---|---|---|---|
| 25 étu × 10 prod | 63 Ko | **21,9 ms** | évals ×50 |
| 75 étu × 20 prod | 382 Ko | **349,8 ms** | évals ×150 |
| 75 étu × 40 prod | 764 Ko | 713 ms | évals ×150 |
| 750 étu × 20 prod (×10) | 3,8 Mo | 30 265 ms | évals ×1500 |

- **Cause** (mesurée en unitaire, sonde P3) : chaque `getSync` d'une clé localStorage refait
  `JSON.parse` du blob entier (`js/db.js:293-338`) — 0,09 ms à 8 Ko, **0,86 ms à 139 Ko, 2,17 ms à
  346 Ko** — multiplié par 2N lectures pour N étudiants. Nuance importante : au-delà de 200 Ko
  (`SEUIL_IDB_FIRST`), la clé vit en **memoryCache** et `getSync` rend la référence en **0,25 µs**
  (mesuré) — le pire cas réel est donc la **fenêtre 100-190 Ko** (mi-session typique : 75 étu,
  `presences` 187 Ko juste sous le seuil) et il se déplace, il ne disparaît pas : `groupeEtudiants`
  et `productions` restent toujours sous le seuil.
- **Coût utilisateur** : ~113 + ~350 ≈ **460 ms de gel à CHAQUE enregistrement de présences**
  (75 étu, mi-session), plus le rendu. Perceptible (seuil consigne ~100 ms).
- **Gain estimé / coût** : hisser les lectures hors boucle (lire `presences`, `groupeEtudiants`,
  `evaluationsSauvegardees`, `productions` UNE fois, passer en paramètres — le patron existe déjà :
  `calculerIndicesEtudiant(_cacheIndicesA, _cacheIndicesCP)` `js/indices.js:540` et
  `evaluationsCache` de `calculerPerformanceHistorique`) → ~2N-2 parses économisés ≈ **gain ~10×**
  (460 → ~50 ms). Coût **M** (signatures internes, aucune donnée touchée). Alternative structurelle :
  cache d'objets avec invalidation à l'écriture dans `db.getSync` (memoryCache pour tout, coût M,
  règle L'ENSEMBLE des patrons N×parse d'un coup — mais à auditer contre les mutations en place).

### 🟡 P2 — Rendu « étudiants prioritaires » : 44 → 203 ms, et ça croît avec l'historique `indicesCP` — MESURÉ

- **Où** : `js/tableau-bord-apercu.js:115-116` (`calculerTousLesIndices(da)` par étudiant) ; chaque
  appel relit `indicesAssiduite` + `indicesCP` (`js/indices.js:474` + `:392`).
- **Mesures** (code réel indices.js + db.js) :

| Échelle | Taille `indicesCP` | ms par rendu |
|---|---|---|
| 25 étu, historique ×10 | 30 Ko | 5,0 ms |
| 75 étu, historique ×10 | 89 Ko | **44,1 ms** |
| 75 étu, historique ×60 | 481 Ko | **202,8 ms** |
| 75 étu, historique ×600 (×10) | 4,7 Mo | 1 988 ms |

- **Aggravant structurel** : `indicesCP[da].historique` est **non borné** — une entrée est poussée à
  chaque recalcul où C ou P a bougé (`js/portfolio.js:672-680`), et le recalcul tourne après chaque
  saisie → la clé grossit toute la session, donc CE rendu ralentit avec le temps (jusqu'à passer le
  seuil 200 Ko où le memoryCache le ré-accélère — comportement en dents de scie difficile à
  diagnostiquer en terrain).
- **Correctif esquissé** : (S) passer les caches déjà prévus (`calculerIndicesEtudiant` les accepte,
  le chemin `:115` ne les utilise pas) ; (S/décision) borner l'historique (N dernières entrées ou
  1/jour) — c'est aussi une trouvaille d'hygiène de données.

### 🟡 P3 — Graphique spaghetti A-C-P : 3 listeners canvas accumulés à CHAQUE rendu — CONFIRMÉ (statique ; mesure = terrain)

- **Où** : `js/graphiques-progression.js:1926, 1980, 2008` (`canvas.addEventListener`
  mouseleave/click/mousemove) dans `creerGraphiqueGroupeSpaghettiACP`. Le canvas vient du DOM
  persistant (`getElementById`, `:1600`), le chart est bien détruit (`Chart.getChart` + `destroy`,
  `:1602-1606`) mais **les listeners ne sont jamais retirés** ni gardés par flag — chaque re-rendu
  (changement d'indice A/C/P, de groupe, de vue) en ajoute 3, dont les closures retiennent le chart
  DÉTRUIT et ses datasets (75 courbes × semaines).
- **Précédent interne** : même classe que le bug « Pratique introuvable » de l'arbre Exploration
  (#326 R1, listener délégué accumulé, garde idempotente posée). Les gardes `chartEstValide(chart)`
  empêchent le crash, pas l'accumulation.
- **Règle dure respectée** : pas de chiffre possible hors navigateur → consigné SANS affirmation de
  lenteur. **Protocole terrain** (2 min, DevTools Safari/Chrome) : ouvrir la vue, basculer 10× entre
  A/C/P, puis `getEventListeners(document.getElementById('<canvasId>'))` → attendu si fuite :
  30+ listeners ; mémoire : heap snapshot avant/après, chercher les Chart détachés.
- **Correctif esquissé (S)** : garde idempotente (flag sur le canvas, patron
  `host._explActionsAttachees` de R1) ou `AbortController`/`removeEventListener` à la destruction.
- **Balayage des autres graphiques** : les 7 `new Chart` du module ont tous un destroy apparié
  (registres `_chartsCriteres`/`_chartsEvolutionRLO` avec delete, ou `Chart.getChart`) — RAS
  statiquement ailleurs ; seul le trio de listeners spaghetti n'a pas de garde.

### 🟢 P4 — Boot `syncToLocalStorageCache` : 1 transaction IDB séquentielle PAR clé + double sérialisation — PARTIELLEMENT MESURÉ

- **Où** : `js/db.js:850-880` — deux passes sur toutes les clés IDB : `removeItem` ×N puis
  **`await this.get(key)` ×N en séquence** (une transaction readonly par clé, `:263`), puis par clé
  `_estimateSize(value)` (= `JSON.stringify`) ET `_setLocalStorage` (re-`JSON.stringify`).
- **Mesuré** (part CPU seule, inventaire réaliste 120 clés / 5,2 Mo — 4 trimestres × 30 clés) :
  **243 ms** de double sérialisation au boot. La latence des ~120 allers-retours IDB séquentiels
  n'est **pas mesurable en Node** (limite) ; c'est pourtant le terme dominant probable sur iPad.
- **Correctif esquissé (M)** : (a) `getAll()`/curseur en UNE transaction au lieu de N ;
  (b) sérialiser UNE fois (passer la string à `_setLocalStorage` et mesurer sa longueur) — ce
  deuxième point vaut aussi pour **chaque `setSync`** (`js/db.js:1274` puis re-stringify) — double
  travail à chaque écriture de grosse clé. **Protocole terrain** pour le terme IDB :
  `console.time('sync')` autour de l'appel dans `init()`, poste réel, codex réel — chiffre à
  produire AVANT de trancher.

### 🟢 P5 — `ouvrirModalExport` : charge TOUTES les valeurs pour afficher des tailles — CONFIRMÉ (lecture ; famille boot)

- **Où** : `js/import-export.js:574-580` — pour chaque clé, `await db.get(cle)` (valeur complète,
  y compris les blobs memoryCache/IDB de plusieurs Mo) juste pour `JSON.stringify(...).length`.
  Coût = même famille que P4 (N transactions + N sérialisations), payé à CHAQUE ouverture du modal.
- **Correctif esquissé (S)** : pour les clés localStorage, lire `getItem(cle).length` (déjà la
  string) ; pour les clés IDB, un curseur qui mesure sans matérialiser, ou mémoriser la taille à
  l'écriture. Non mesuré ici (IDB) — protocole : `console.time` sur l'ouverture du modal, codex réel.

### Pistes de la consigne RÉFUTÉES par la vérification adverse (à ne pas rouvrir)

- **`db.statsStockage` en rafale d'écritures** : **1,3 ms par appel** sur 5,2 Mo / 120 clés
  (mesuré, code réel), throttle 60 s effectif (`js/db.js:500-503`) → coût au pire ~1,3 ms/min.
  Même ×20 pour un vrai localStorage Safari, imperceptible. Rien à faire.
- **`verifierUniciteIds` + spreads à l'import** : lecture complète `js/import-export.js:69-88` —
  `Set` + boucle **linéaire**, `genererIdUnique` O(1) (`js/main.js:33-41`), spreads O(n) sur des
  collections de l'ordre de centaines → pas de coût quadratique caché. Rien à faire.

### Non mesurable dans cet environnement (protocoles fournis, pas de verdict)

- **`populerDropdownsAssemblageV2` appelé en cascade** (hub, 6+ sites d'appel dont
  `trimestre-v2-horaires.js:723,786`, `trimestre-v2-enseignants.js:264,320`,
  `wizard-pratique-v2.js:2916`) : la part données est faible (getSync de petites clés + innerHTML de
  selects) ; le coût réel est DOM. Protocole : `console.time` dans le hub + compteur d'appels sur un
  `changerGroupeCoursActifV2` réel.
- **Rendus innerHTML massifs** (tableaux de bord complets) et cycle de vie Chart.js au *runtime* :
  WebKit absent du conteneur (limite d'environnement, nommée aussi pour Vitest/Playwright en début
  de session). Les invariants statiques vérifiés sont au P3.

---

## Ce qui N'A PAS été audité (limites, P6)

- `js/evaluation.js` (3 893 l.) : seulement balayé par motifs (arrondis, `parseFloat` DOM) — la
  lecture intégrale du chemin de saisie reste à faire.
- SPE (`pratique-pan-specifications.js`, logique de paliers/bundles) et DEN (moteur jugement) :
  non relus en profondeur ce lot (le volet A s'est concentré sur SOM/STD où vivaient les pistes).
- Année bissextile / DST du générateur : la passe date-locale (`creerDateLocale` + `setDate`)
  est saine par construction (objets Date locaux) — pas de golden master hiver produit pour autant ;
  le motif UTC (L5) est le vrai risque horaire trouvé.
- Latence IndexedDB (P4/P5) et tout rendu navigateur : à chiffrer en terrain avec les protocoles
  ci-dessus.
- `db.getSync` sous Safari réel : mes planchers Node sous-estiment le coût localStorage réel.

## Suggestion d'ordonnancement des correctifs (sans numéros — Grégoire trie)

1. **Chantier « réunifier les deux systèmes STD »** : L2 + L9 + L10 + L3 (même zone, mêmes tests,
   une seule campagne de sentinelles ; ferme aussi la moitié des surprises du Comparateur).
2. **L1 + L4** (configurables SOM / par-objectifs — bloquant pour les expérimentateurs CoP qui
   créeront leurs pratiques au wizard).
3. **P1 (+P2)** : hisser les lectures hors boucles — gain ~10× sur le geste le plus fréquent de la
   saisie ; petit, mécanique, très testable.
4. **L5** (helper date locale unique) et **L6/L7/L8** (gardes ponctuelles).
5. **P3** (garde idempotente listeners) après confirmation terrain 2 min.
6. **P4/P5** après les `console.time` terrain ; approfondissement #393 (replis en dur) déjà
   documenté à l'item existant.
