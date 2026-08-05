# Consigne — Session de correctifs de l'audit perf + logique (préparée le 5 août 2026 soir)

> **Mandat donné par Grégoire le 5 août 2026 en soirée** : après l'audit performance + logique
> (rapport `Rapports/AUDIT-PERF-LOGIQUE-2026-08-05.md`, versé au BACKLOG en **#394-#402**),
> livrer la **vague de correctifs**. Les 4 décisions 📐 ont été TRANCHÉES en session
> (#394, #396, #397, #399 — le détail fait foi dans les items du BACKLOG, recopié en §3 ici).
> Ce document est la référence unique de la session : en cas de doute sur le périmètre,
> c'est lui qui tranche — et **les décisions déjà tranchées ne se re-litigent pas**.

---

## 0. Avant tout

1. Exécuter le **rituel de début de session** (`Skills pour Claude Code/SKILL_Debut_de_session.md`) :
   audit factuel git + tests + version + lecture SESSION.md/BACKLOG.md, comparaison avec la prémisse.
   Si l'état du dépôt la contredit, **suivre l'état réel** et le consigner.
   - Prémisse au moment de la rédaction : `main` = tip du commit qui introduit ce document
     (branche `claude/audit-perf-logique-6i4qol` entièrement mergée fast-forward),
     version **1.31.13**, Vitest **1354/1354**, dernier ID BACKLOG **#402**.
2. Charger les skills :
   - `SKILL_verification_adverse.md` — OBLIGATOIRE (chaque fix = sentinelle break-testée ROUGE→VERT) ;
   - `SKILL_pratiques_notation.md` — **EN PRIORITÉ** : #394/#395/#396 touchent le moteur
     (résolution, deux systèmes de calcul, simulerIndices, pièges §10) ;
   - `SKILL_labo_codex.md` — architecture, SSOT, zéro-dette ;
   - `SKILL_hygiene_donnees_partagees.md` au besoin (le #394 pose un avertissement de migration,
     AUCUNE écriture automatique de données — voir décision 5).
3. Vitest doit être vert AVANT de commencer. Lire le rapport d'audit AVANT de coder :
   chaque item du BACKLOG cite ses sections (sondes, `fichier:ligne`, correctifs esquissés) —
   les sondes du rapport sont la BASE des sentinelles (protocoles reproductibles inline).

## 1. Mission

Livrer les correctifs **dans cet ordre** (un item/lot = un commit + release patch, sentinelle
break-testée à chaque fois ; s'arrêter proprement là où la session s'arrête — la queue reste au BACKLOG) :

1. **#394** 🔴 Réunifier les deux systèmes de calcul STD (décision D1 complète en §3.1 — LE gros morceau).
2. **#395** 🔴 Configurables Sommative P=0 (délégation, patron SPE du 6 juin).
3. **#396** 🟡 Retirer `pan_par_objectif` (décision §3.2 ; grep préalable des configs existantes).
4. **#397** 🟡 Perf : lectures hissées hors boucles + historique `indicesCP` (décision §3.3 ;
   mesures avant/après avec les protocoles du rapport — viser ~10× sur le pipeline présences).
5. **#398** 🟡 Helper `dateLocaleYMD()` + bascule des 10 sites UTC (sentinelle TZ figée en soirée).
6. **#399** 🟡 Lot gardes calendrier/calcul (décision reprise-samedi §3.4 ; + NaN 0/0, note 0
   du repli, retrait des dates de repli en dur — le golden master #368 doit RESTER VERT).
7. **#400** 🟡 Garde idempotente des listeners du canvas spaghetti — le fix est sûr sans mesure ;
   la confirmation terrain (getEventListeners) reste une porte de validation Grégoire, pas un préalable.
8. **#402** 🟢 Entretien divers — seulement si la session a encore du budget.

**NE PAS TOUCHER** : **#401** (boot/modal export) — attend les 2 `console.time` terrain de Grégoire
(protocoles au rapport). Pas de chiffre terrain → pas de correctif (décision de la consigne d'audit,
reconduite).

## 2. Méthode (non négociable)

- **Chaque fix porte une sentinelle break-testée** (ROUGE prouvé sur l'ancien code ou par mutation,
  puis VERT ; mutation INVERSE pour l'ablation #396 — cas « ratchet » du skill §4).
- Les sondes du rapport (fixtures + attendus chiffrés : 82,67 vs 74,29 ; 0 vs 0,86 ; 0,70 vs 0,467 ;
  124 entrées fantômes) se convertissent directement en tests Vitest via `chargerScript`.
- **Golden masters existants = filet** : `golden-master-calcul-sessionC`, `sentinelle-paquet-de-5-368`,
  parité `simulerIndices` — ils doivent rester verts À CHAQUE commit ; s'ils rougissent, c'est le
  correctif qu'on ajuste, pas le test (sauf comportement DÉLIBÉRÉMENT changé par une décision §3,
  auquel cas le test est mis à jour dans le MÊME commit avec justification en commentaire).
- Release : `node scripts/release.mjs patch` par lot livré (pas de `minor` sauf si Grégoire le
  demande ; JAMAIS de `major`). Changelog : rien tant que les correctifs ne changent pas un
  comportement VISIBLE utilisateur ; consolider à la fin si besoin (règles CLAUDE.md).
- Avant chaque commit : audit sécurité du diff (innerHTML/échappement/handlers) + Vitest complet.
- Fin de session : `/fin-de-session` (§4 break-tests compris), bloc SESSION.md, BACKLOG coché,
  signet remonté, résumé fait/reste/risques.

## 3. Les décisions TRANCHÉES (recopiées du BACKLOG — source : discussion Grégoire 5 août soir)

### 3.1 — #394 (D1) : cinq règles

1. **Terminale = déclaration explicite, jamais une inférence** : rôle terminale ssi
   `type === 'terminale'`. Pas de terminale → rien n'en tient lieu (aucun fallback pondéré).
   Pondérations toujours saisies par l'utilisateur ; les défauts `|| 60`/`|| 40` de l'instance MEURENT.
2. **Le pool n'exige pas de conteneur** (souci explicite de Grégoire : un STD SANS portfolio doit
   exister — ne pas coder en dur sa pratique) : pool = artefacts déclarés, sinon productions non
   pondérées ; conteneur « Portfolio » OPTIONNEL ; si absent avec une terminale pondérée p →
   **pondération du pool = 100 − p** (règle du complément) ; sélection neutralisable (`tous`).
3. **Transparence** : production pondérée non participante OU pondération obtenue par complément →
   avertissement non bloquant (zone « À vérifier », patron #369), jamais un silence.
4. **« Non constructible » stocké** : champ ADDITIF `noteConstructible: false` sur
   `indicesCP.actuel` (miroir de `simulerIndices`) ; les lecteurs de `.P` ne cassent pas.
5. **Migration legacy** (terminale en `type:'travail'`) : AUCUNE conversion automatique, aucune
   écriture au boot. Avertissement #369 ; cas non ambigu (1 seule candidate, 0 terminale typée) →
   bouton « Typer comme terminale » = geste explicite ; cas ambigu → liste + renvoi au formulaire.

### 3.2 — #396 (D2) : RETIRER `pan_par_objectif` (zéro-dette)

Ablation du chemin (`pratique-configurable.js:129-193`) + rerouter l'option wizard
(`wizard-pratique-v2.js:2660-2663`) vers le mode STD correspondant. **Grep préalable** des configs
existantes (`calcul_note.methode='pan_par_objectif'`) : s'il en existe, normaliser + avertir.

### 3.3 — #397 (D3) : historique `indicesCP` — option C

**Grep des lecteurs D'ABORD** (vérification non faite à l'audit). Zéro consommateur → PURGER
l'historique et cesser de le pousser (les trajectoires lisent les snapshots hebdomadaires).
Des lecteurs → repli « 1 entrée/jour/étudiant ». Le cœur de #397 (hisser les lectures) ne dépend
pas de cette branche.

### 3.4 — #399 (D4) : HONORER la reprise du samedi

Inverser l'ordre des tests (`mapReprises` AVANT `estWeekend`, passe 2 de `trimestre.js`) : la
reprise du samedi devient un jour de cours (numeroJour compté) mais ne compte PAS dans la
numérotation « paquet de 5 » (pas de numeroSemaine propre). Golden master #368 inchangé.

## 4. Interdits pendant cette session

- ❌ Re-litiger une décision §3 (elles sont de Grégoire ; un doute d'implémentation se consigne,
  ne se tranche pas en changeant la décision).
- ❌ #401 sans les chiffres terrain.
- ❌ Zones protégées (`config.js`, `navigation.js`, `noms_stables.json`).
- ❌ Migration/écriture automatique de données utilisateur (la décision 3.1.5 l'exclut ; les
  correctifs de ce lot sont du CODE de calcul + avertissements, pas des transformations de stockage).
- ❌ `major`, changelog spéculatif, nouveaux items numérotés (queue → sous-puces des items existants).

## 5. Livrables

1. Commits par lot avec sentinelles, releases patch, Vitest vert à chaque push.
2. **SESSION.md** — bloc de session : livré / reste / risques / état des tests.
3. **BACKLOG.md** — items cochés `[x] LIVRÉ (1.31.x)` au fil de l'eau.
4. Push sur la branche de travail ; **le merge → main est une décision Grégoire** (le demander
   en fin de session, ne pas le présumer).
5. Portes terrain à consigner pour Grégoire : parcours STD réel (profil + tableau de bord +
   comparateur cohérents), formulaire Productions (avertissements #369 nouveaux),
   `getEventListeners` spaghetti, 2 `console.time` (#401).
