# Consigne — Session d'audit performance + logique (préparée le 5 août 2026)

> **Mandat donné par Grégoire le 5 août 2026 en fin de journée** : après le lot
> « audit qualité » (#365, rapport `Rapports/AUDIT-QUALITE-2026-08-05.md`,
> correctifs #379-#393 livrés et déployés en 1.31.13), faire **un autre lot
> d'audit pour la PERFORMANCE et la LOGIQUE de l'application**. Ce document est
> la référence unique de la session : en cas de doute sur le périmètre, c'est
> lui qui tranche — et ce qu'il ne permet pas explicitement est interdit.
> Rédigé par la session du 5 août (même auteur que le lot qualité) : les
> « pistes de départ » du §3 sont des OBSERVATIONS DE PASSAGE, pas des
> trouvailles — elles doivent passer la vérification adverse comme le reste.

---

## 0. Avant tout

1. Exécuter le **rituel de début de session** (`Skills pour Claude Code/SKILL_Debut_de_session.md`) :
   audit factuel git + tests + version + lecture SESSION.md/BACKLOG.md, comparaison avec la
   prémisse de ce document. Si l'état du dépôt la contredit, **suivre l'état réel** et le consigner.
   - Prémisse au moment de la rédaction : `main` = `0889c063` (1.31.13, build 0805-*),
     Vitest **1354/1354**, branche `claude/audit-qualite-365-m9486l` entièrement mergée.
2. Charger les skills :
   - `SKILL_verification_adverse.md` — OBLIGATOIRE (c'est un audit) ;
   - `SKILL_labo_codex.md` — architecture, indices A-C-P, workflow (cadre général) ;
   - `SKILL_pratiques_notation.md` — **EN PRIORITÉ pour le volet LOGIQUE** : moteur de
     calcul des pratiques (résolution, deux systèmes de calcul, simulerIndices, pièges).
     Le volet logique ne se juge PAS à l'intuition : ce skill est la référence de ce que
     le moteur DOIT faire ;
   - `SKILL_Ecosysteme_classe.md` au besoin (sens pédagogique des calculs : SOLO, IDME, PAN).
3. Vitest doit être vert AVANT de commencer. S'il ne l'est pas : diagnostiquer et
   consigner, ne PAS corriger du code d'application.

## 1. Mission

**Audit en LECTURE SEULE**, deux volets, un module/chemin à fond à la fois :

### Volet A — LOGIQUE (à faire en premier : c'est là que vivent les erreurs qui faussent des notes)

1. **Moteur de calcul de la note et des indices** — `js/portfolio.js` (1209 l.,
   `simulerIndices`, `calculerDetailsNoteFinale`), `js/indices.js` (588 l.),
   `js/pratiques/` (familles STD/SOM/SPE/DEN), `js/evaluation.js` (3893 l., chemin de
   saisie → calcul). Chercher : cas limites (liste vide, étudiant exclu `statut`,
   artefact facultatif, note différée, division par zéro, pondérations qui ne somment
   pas à 100), invariants (note bornée, monotonie : ajouter un artefact réussi ne doit
   pas BAISSER la note sauf pratique qui le prévoit), cohérence inter-familles
   (le même corpus donne-t-il des récits `decrireCalcul` cohérents ?), arrondis
   (moment de l'arrondi, cumul d'erreurs).
2. **Calculs de dates et de semaines** — `js/trimestre.js` (générateur, paquet de 5),
   `calculerStatistiquesCalendrier` (repli ⌈/5⌉ vs numérotation officielle : DEUX
   logiques pour la même question — divergent-elles ?), échéances d'artefacts,
   assiduité (dénominateurs). Le golden master #368 protège A2026 : chercher ce qu'il
   ne couvre PAS (trimestre d'hiver, année bissextile, changement d'heure, bornes DST).
3. **Sondes ENCOURAGÉES** : le moteur est outillé pour ça (fonctions pures, chargerScript,
   `simulerIndices`). Une trouvaille logique CONFIRMÉE = reproduite par sonde avec
   entrées/sorties montrées, ou lecture complète du chemin. Confronter chaque écart
   présumé à `SKILL_pratiques_notation.md` AVANT de le déclarer bug : ce qui semble
   étrange est parfois une décision pédagogique documentée.

### Volet B — PERFORMANCE (chemins chauds, sur les tailles réelles : ~25-75 étudiants, ~10-20 productions, 15 semaines)

1. **Boot** — `db.syncToLocalStorageCache` et la séquence de démarrage complète.
2. **Lectures répétées** — le patron `db.getSync` (JSON.parse à chaque lecture) dans les
   boucles : qui lit la même clé N fois dans un même rendu/calcul ?
3. **Rendus** — tableaux de bord, `js/graphiques-progression.js` (4758 l., cycle de vie
   Chart.js : destroy/recreate, listeners, fuites), rendus innerHTML massifs répétés
   (hubs appelés en cascade — `populerDropdownsAssemblageV2` est documenté appelé 10×),
   `js/planification-carte.js` (drag, layout, sommaire — que re-rend-on à chaque geste ?).
4. **RÈGLE DURE : pas de chiffre, pas de trouvaille perf.** Toute affirmation de lenteur
   se mesure (sonde Node sur fonction pure, compteur d'appels injecté via chargerScript,
   `console.time` documenté) sur des DONNÉES SYNTHÉTIQUES à l'échelle réelle (et ×10
   pour la marge). Une trouvaille perf = chiffre avant + cause + gain estimé + coût.
   Pas de micro-optimisation esthétique : seuil d'intérêt ≈ ce qu'un utilisateur peut
   percevoir (boot, interaction > ~100 ms, fuite mémoire).

Il est NORMAL de ne pas tout couvrir : un chemin audité à fond avec chiffres vaut mieux
que dix survolés.

## 2. Méthode (non négociable — identique au lot qualité)

- **Chaque trouvaille passe par la vérification adverse AVANT d'être consignée**
  (`SKILL_verification_adverse.md`) : tenter de la réfuter, chercher le garde-fou,
  écrire la sonde. Niveaux : **CONFIRMÉ** (sonde reproduite ou lecture complète du
  chemin ; pour la perf : MESURÉ) ou **PLAUSIBLE** (non réfuté, non reproduit).
- **Chaque trouvaille consignée** : gravité (🔴 note/indice FAUX ou perte de données ·
  🟡 comportement faux visible ou lenteur perceptible mesurée · 🟢 dette/amélioration),
  repro concrète (données + gestes, ou sonde jointe en extrait), référence
  `fichier:ligne`, correctif esquissé avec coût S/M/L.
- **Sondes jetables** dans le scratchpad, JAMAIS committées. Les fixtures synthétiques
  réutilisables peuvent aller dans `tests/` si un correctif futur s'en servira.
- Ne PAS re-découvrir ce qui est déjà consigné : restes de **#393** (politique
  estCollègue, fusion enseignants, clé nue `seancesHoraire`, écart doc↔code « x puis y »,
  sparse legacy, **dates de repli en dur de `genererCalendrierComplet`** — celle-là
  touche la logique : l'approfondir est DANS le périmètre), **#367 élargi** (clé
  composite des notes de leçon — décision Grégoire en attente, ne pas coder).

## 3. Pistes de départ (observations de passage du lot qualité — À VÉRIFIER, pas des trouvailles)

- `db._getLocalStorage` fait `JSON.parse` à CHAQUE `getSync` — aucun cache d'objets ;
  les rendus qui relisent `groupeEtudiants`/`evaluationsSauvegardees` en boucle re-parsent
  à chaque itération. Mesurer un rendu de tableau de bord complet.
- `syncToLocalStorageCache` : un `await this.get(key)` PAR CLÉ au boot = une transaction
  IndexedDB par clé — `getAll()` en une transaction est possible. Mesurer le boot réel
  (~combien de clés ?).
- `ouvrirModalExport` : un `await db.get` par clé juste pour afficher des tailles.
- `db.statsStockage` parcourt tout localStorage à chaque écriture (throttle 60 s — vérifier
  le coût du pire cas au fil d'une rafale d'écritures).
- `calculerStatistiquesCalendrier` (trimestre-v2.js) a un repli `⌈joursCours/5⌉` qui
  duplique la logique de numérotation du générateur — cas où les deux divergent ?
- Chart.js : vérifier destroy avant recreate à CHAQUE changement de contexte
  (changerGroupeCoursActifV2 rafraîchit beaucoup de vues).
- `verifierUniciteIds` et les spreads `[...existantes, ...nouvelles]` sur grosses
  collections à l'import (coût quadratique caché ?).

## 4. Livrables

1. **`Rapports/AUDIT-PERF-LOGIQUE-<date>.md`** — sommaire exécutif (5 lignes max), puis
   trouvailles par volet, priorisées, au format §2. Les chiffres de perf AVEC leur
   protocole de mesure (reproductible). Propositions **sans numéros #** (dernier ID
   utilisé au BACKLOG : **#393** — Grégoire trie au retour, versement ensuite).
2. **SESSION.md** — bloc de session : audité / non audité / risques / état des tests.
3. Commits : **documents seulement** (Rapports/, SESSION.md). Push sur la branche courante.

## 5. Interdits pendant cette session

- ❌ **Aucun correctif au code d'application** (js/, index.html, styles.css), même
  « évident », même une ligne. AUCUNE exception pré-approuvée cette fois : un correctif
  perf sans validation terrain est un risque, pas un gain.
- ❌ Aucun bump de version, aucune entrée de changelog.
- ❌ Aucun nouvel item numéroté au BACKLOG (propositions dans le rapport).
- ❌ Zones protégées intouchées (config.js, navigation.js, noms_stables.json).
- ❌ Pas de « benchmark » qui écrit dans les données réelles : toute mesure se fait sur
  fixtures synthétiques en sandbox (chargerScript / scratchpad).

## 6. Fin de session

Rituel de fin (`/fin-de-session`) adapté au périmètre documentaire : arbre propre,
Vitest vert (inchangé), rapport poussé, SESSION.md à jour, signet remonté. Terminer par
le résumé : fait / reste / risques.
