# Plan de travail — modèle d'objets de l'onglet Conception (post-audit du 30 août 2026)

**Destinataire** : une session Claude Code (Opus 5), à froid, une session à la fois.
**Source unique des constats** : `Rapports/AUDIT-modele-objets-conception-2026-08-30.md` (sections 2.2, 2.3, 3 et 4 à lire avant toute session). Ce plan ordonne, il ne redit pas.
**Objectif** : fermer les deux BLOQUANT avant tout archivage de trimestre (décembre 2026 au plus tard), unifier les politiques de suppression avant que d'autres orphelins ne s'accumulent, et retirer le legacy des quatre sections.
**Particularité de ce plan** : l'audit du 30 août est un audit de *carte* (temps 1) — il ne contient **pas de diffs**. Les sessions S1 à S3 sont des **audits ciblés** (temps 2) qui produisent chacun un rapport au format de `Rapports/AUDIT-chaine-importation-travaux-2026-08-30.md`, diffs non appliqués inclus. Les sessions S4 et suivantes (temps 3) appliquent ces diffs. Une session d'exécution ne travaille donc jamais sans le rapport Z dont elle dépend.

## Comment lire et tenir ce plan

- Le travail est découpé en **sessions numérotées** (`S0` … `S12`), à faire dans l'ordre sauf mention contraire. Une session = 90 minutes maximum = une branche courte = un merge vers `main` en fin de session.
- Chaque session contient des **tâches identifiées** (`T4.2` = session 4, tâche 2). Une tâche est une case à cocher. Une tâche cochée est une tâche **livrée, testée et mergée** — jamais « en cours ».
- Le **tableau d'état** ci-dessous est la seule vue d'ensemble. Le mettre à jour en fin de chaque session (statut + date + commit). C'est ce tableau que la session suivante lit en premier.
- Statuts autorisés : `À FAIRE` · `EN COURS (session du AAAA-MM-JJ)` · `LIVRÉ (commit abcdef0)` · `BLOQUÉ (motif)` · `ABANDONNÉ (décision Grégoire, date)`.
- Une session qui ne termine pas passe sa dernière tâche à `EN COURS`, remplit `RELAIS.md`, et note dans la colonne « Note » ce qui reste exactement.

## Tableau d'état

| Session | Constats | Statut | Date | Commit | Note |
|---|---|---|---|---|---|
| S0 — Préparation | — | **LIVRÉ** | 2026-08-30 | | **D1–D5 tranchées, toutes OPTION A** (relevé transmis par `kuekatsheu-0d`, motifs vides) · #619–#629 réservés |
| S1 — Audit Z1 : cartouches et archivage | B1, B2, M1 | **EN COURS (`kuekatsheu-c5`, 2026-08-30 soir)** | 2026-08-30 | | **#619** · lecture seule + diagnostic console ; livre les diffs de S4-S5 |
| S2 — Audit Z2 : suppressions et intégrité | S1, S2, S6, M7 | **EN COURS (`kuekatsheu-82`, 2026-08-30 soir)** | 2026-08-30 | | **#620** · lecture seule + inventaire d'orphelins (dont #542) ; livre les diffs de S6 et S9 |
| S3 — Audit Z3 : legacy vivant | S4, S5, S9 | **EN COURS (`kuekatsheu-bc`, 2026-08-30 soir)** | 2026-08-30 | | **#621** · instrumentation/Playwright ; livre le plan de retrait de S10 |
| S4 — Archivage de trimestre | B1 | À FAIRE | | | **#622** · après S1 · ⚠⚠ **D1 = A, MORATOIRE ACTIF DEPUIS LE 30 AOÛT 2026 : ne pas utiliser « Archiver un trimestre » jusqu'à la livraison de cet item** (bouton `trimestre-v2-liste.js:179` → `creerSnapshotRessources`, `trimestres.js:728`) |
| S5 — Régime des cartouches | B2 | À FAIRE | | | **#623** · après S1 · D2 = A (namespacée par trimestre + migration) · ⚠ migration de DONNÉES RÉELLES : sauvegarde préalable PAR COPIE obligatoire |
| S6 — Politique de suppression + orphelins | S1, S2 | À FAIRE | | | **#624** · après S2 · D3 = A (bloquer tant que référencé, message qui NOMME les référents) · absorbe la réparation #542 |
| S7 — États d'édition (tempCriteres et échelles) | S3 | À FAIRE | | | **#625** · indépendant, permutable tôt |
| S8 — Retraits sûrs statiquement | S5 (partie morte), M2–M5, M8, M11 | À FAIRE | | | **#626** · indépendant, permutable tôt · D5 = A (retirer l'entrée morte de `cc-license.js` — clé lue 2×, écrite 0×) |
| S9 — Unification des remaps d'import | S6, M6 | À FAIRE | | | **#627** · après S2 |
| S10 — Retrait du legacy des quatre sections | S4, S9 | À FAIRE | | | **#628** · après S3 · D4 = A (retrait complet) mais CONDITIONNÉ au test de neutralisation T3.1 · probablement 2 sessions |
| S11 — Mineurs restants | M1, M7, M9, M10 | À FAIRE | | | **#629** · M1 après S4 (même fichier) |
| S12 — Tests sur appareil | angles morts (audit §4) | À FAIRE | | | avec Grégoire, iPad + Mac ; cases « Observé » de l'audit |

Sessions permutables entre elles : S1, S2, S3 (les trois audits) ; S7 et S8 peuvent s'intercaler n'importe quand. S4–S6 et S9–S10 exigent leur rapport Z. Ne jamais mener S5 et S6 en parallèle (mêmes fichiers).

### Répartition du 30 août 2026 (soirée) — trois sessions en parallèle

Les trois audits Z sont **en LECTURE SEULE** : c'est la seule phase de ce plan qui se
parallélise sans risque de collision dans `js/`. Chacune écrit dans SON rapport, et
dans rien d'autre.

| Session | Prend | Écrit uniquement dans |
|---|---|---|
| `kuekatsheu-c5` | **S1 / Z1** (#619) | `Rapports/AUDIT-conception-Z1-cartouches-archivage-2026-08-30.md` |
| `kuekatsheu-82` | **S2 / Z2** (#620) | `Rapports/AUDIT-conception-Z2-suppressions-integrite-2026-08-30.md` |
| `kuekatsheu-bc` | **S3 / Z3** (#621) + coordination | `Rapports/AUDIT-conception-Z3-legacy-2026-08-30.md` + les fichiers partagés |

⚠ **Règles de non-collision pour cette soirée, non négociables :**
1. **Aucune écriture dans `js/`, `index.html` ou `tests/`.** Un audit Z ne corrige rien.
   Z3 instrumente localement, et cette instrumentation n'est **jamais commitée**.
2. **`BACKLOG.md`, `SESSION.md`, `RELAIS.md` et ce plan appartiennent à `kuekatsheu-bc`.**
   Les deux autres sessions n'y touchent pas : elles lui transmettent ce qu'il faut y
   inscrire. Motif mesuré les 26 et 30 août : quatre collisions d'index en deux jours.
3. **Staging chirurgical** : `git add` par chemins explicites, jamais `-A`, et
   `git diff --cached --stat` lu avant tout commit.
4. **Personne ne pousse et personne ne lance `release.mjs` sauf `kuekatsheu-bc`.**
   Un go de push est PONCTUEL et ne s'étend pas au suivant.
5. **Playwright** : une seule suite à la fois, et `kuekatsheu-bc` annonce avant de la
   lancer. Pendant qu'elle tourne, personne n'écrit dans `js/`, `index.html` ou `tests/`.

---

## Cadre non négociable (relire à chaque session)

1. Début de session : subagent `audit-debut-session` (CLAUDE.md), puis lire le tableau d'état ci-dessus et `git log --oneline -20`. Ne pas croire le tableau sur parole : vérifier qu'un `LIVRÉ` est bien dans `main`.
2. Un fichier à la fois, validation fonctionnelle après chacun.
3. Zéro-dette : chaque correctif RETIRE ce qu'il remplace (nommé dans le rapport Z correspondant). Pas d'alias, pas de repli « au cas où ».
4. Chaque session d'exécution livre au moins une sentinelle Vitest dans `tests/unit/`, avec **break-test** : muter le correctif → ROUGE obtenu → remettre → VERT. Un vert sans rouge préalable ne compte pas. Muter les DEUX côtés d'une condition composée.
5. Vitest se lance depuis `tests/` (`cd tests && npx vitest run …`). Lire le **code de sortie**, pas « passed ».
6. Node n'a pas d'IndexedDB : `db.set` y est synchrone et masque les courses. Tout test touchant une écriture inter-namespace (S4, S5) force `useIndexedDB` avec une fausse connexion (patron : `tests/unit/sentinelle-522-pratiques-serialisees.test.js`).
7. Vitest ne voit pas le rendu : tout retrait de DOM ou d'éditeur (S7, S10) exige en plus Playwright/WebKit ou un test manuel consigné dans la colonne « Note ».
8. Ne pas toucher : `js/config.js`, `js/navigation.js`, `noms_stables.json`. (S8/M8 touche `guidage-demo.js` et `accompagnement-contenu-popup.js`, pas `navigation.js`.)
9. Inscrire un `#NNN` dans `BACKLOG.md` AVANT de l'employer dans un commit (S0 les réserve tous d'un coup, en une seule écriture, après vérification du dernier ID réellement inscrit — d'autres sessions prennent des IDs en parallèle).
10. Release : `node scripts/release.mjs patch` par session mergée, changelog, puis sentinelle anti-cache APRÈS le commit de release.
11. Fin de session : tableau d'état, `SESSION.md` (bloc daté : livré / restant / sentinelles avec rouge obtenu oui-non), `BACKLOG.md` coché, merge `main` ou `RELAIS.md`.
12. **Zones saines de l'audit (§2.5) : interdit d'y « corriger » quoi que ce soit.** `modalitesEvaluation`, `planification_mindmap`, `bibliothequeAlignements`, `changerPratiqueActive`, `genererIdUnique`, la discipline `db.modifier`, le pipeline partage : on s'y appuie, on n'y retouche pas.
13. **Pièges propres aux retraits** (S8, S10) : suppression fonction par fonction, jamais par plage `sed` ; retirer ENTIÈREMENT le bloc JSDoc (`/** … */`) de chaque fonction retirée, puis grep `^/\*\*\s*$` suivi de `function` (un `/**` orphelin avale le code suivant — silencieux à `node --check`, ReferenceError à l'exécution) ; avant tout retrait, grep le nom dans js/ ET index.html (`data-action` inclus) ET les chaînes ; après retrait, grep `window.<Nom>` dans le résidu ; `sed -i` interdit sur chemin relatif — Edit ou chemin absolu.

Séquence identique pour chaque tâche de code des sessions S4+ :

```
a. Lire les lignes citées par le rapport Z (pas le fichier entier).
b. Vérifier que le code est encore celui du rapport (git log du fichier depuis le commit du rapport).
c. Écrire la sentinelle, la faire ROUGIR sur le code actuel.
d. Appliquer le diff du rapport Z, adapté si le code a bougé.
e. Sentinelle VERTE ; suite Vitest complète ; code de sortie 0.
f. Retirer ce que le diff remplace.
g. Test manuel consigné (Mac ET iPad si modale, éditeur ou stockage).
```

---

## S0 — Préparation (30 minutes, avec Grégoire)

Cinq décisions fermées, une recommandation chacune. Les consigner ici, avec la date, avant de commencer la session qui en dépend.

✅ **S0 EST LIVRÉE. Les cinq décisions sont tranchées, toutes OPTION A, le 30 août 2026.**

**Provenance de ce relevé, à ne pas perdre** : les décisions ont été prises par Grégoire
et transmises à `kuekatsheu-bc` **par le canal de la session `kuekatsheu-0d`**, qui tenait
l'artefact d'arbitrage. `kuekatsheu-bc` ne les a pas recueillies directement.

**Artefact d'arbitrage** (publié par `kuekatsheu-0d`, non ouvert par `kuekatsheu-bc`) :
https://claude.ai/code/artifact/4e3e05da-bf0d-407f-b676-49aaa28e58f4
Chaque décision y porte un CHAMP de motif, pas seulement un choix A/B — leçon du
11 août 2026, où cinq décisions étaient revenues « prises » et introuvables parce
qu'une case cochée ne porte pas de verdict.

⚠ **LES CINQ MOTIFS SONT VIDES, ET C'EST CONSIGNÉ TEL QUEL.** Ce que le relevé dit
factuellement : Grégoire a suivi les cinq recommandations. Aucune justification n'a
été reconstruite — une raison inventée se relirait dans six mois comme si elle venait
de lui.

⚠ **D2, D3 et D4 ont été tranchées AVANT les audits Z1, Z2 et Z3**, alors que
l'artefact disait que ces trois-là pouvaient changer à leur lumière. C'est son choix,
pas un oubli. **Si un audit Z contredit l'une d'elles, elle doit lui être REPRÉSENTÉE**,
pas appliquée par inertie parce qu'elle est écrite ici.

- [x] **T0.1 — Décision D1 (immédiate)** : d'ici la livraison de S4, ne pas utiliser « Archiver un trimestre » (l'audit §2.2-B1 montre qu'il écrase des collections vivantes). Option A (recommandée) : moratoire, noté ici. Option B : archiver quand même en acceptant le risque (un snapshot de backup existe, trimestres.js:782). **Décision : OPTION A — moratoire jusqu'à la livraison de S4 (#622) (date : 2026-08-30)**
  ⮕ **Motif : aucun. Recommandation suivie, aucun motif écrit par Grégoire.**
  ⚠⚠ **CE MORATOIRE EST ACTIF DEPUIS LE 30 AOÛT 2026 AU SOIR**, ce n'est pas une décision pour plus tard. Le geste visé est nommément le bouton « Archiver » de la liste des trimestres (`js/trimestre-v2-liste.js:179`), qui appelle `creerSnapshotRessources` (`js/trimestres.js:728`). Toute session qui lirait « Archiver un trimestre » comme disponible ferait le dégât que cette décision évite. Reporté au tableau d'état et en tête de `RELAIS.md`.
- [x] **T0.2 — Décision D2 (pour S5)** : régime cible des cartouches. Option A (recommandée) : une cartouche suit le régime de sa grille — namespacée par trimestre, migration des données existantes (chemin précisé par Z1). Option B : rester globale, assumer et documenter le partage entre trimestres. **Décision : OPTION A — la cartouche suit sa grille, namespacée par trimestre, avec migration des données existantes (date : 2026-08-30)**
  ⮕ **Motif : aucun. Recommandation suivie, aucun motif écrit par Grégoire.**
  ⚠ **Conséquence visible pour Grégoire** : S5 (#623) migre ses DONNÉES RÉELLES. Sauvegarde préalable par copie obligatoire — pas un `git checkout`, une COPIE.
  ⚠ **Tranchée AVANT l'audit Z1**, alors que la page d'arbitrage disait que cette décision pouvait changer à sa lumière. C'est son choix, pas un oubli. **Si Z1 la contredit, la lui REPRÉSENTER** — ne pas l'appliquer par inertie parce qu'elle est écrite ici.
  · Mesure de cadrage (par `kuekatsheu-0d`, non rejouée par `kuekatsheu-bc`) : 58 usages de `cartouches_`, dont 42 en `cartouches_${grilleId}`.
- [x] **T0.3 — Décision D3 (pour S6)** : politique de suppression unique, tous objets Conception. Option A (recommandée) : BLOQUER tant que référencé, message qui nomme les référents (trimestre compris). Option B : supprimer et réparer/vider les références entrantes. **Décision : OPTION A — bloquer tant que l'objet est référencé, avec un message qui nomme les référents (date : 2026-08-30)**
  ⮕ **Motif : aucun. Recommandation suivie, aucun motif écrit par Grégoire.**
  ⚠ **Conséquence visible pour Grégoire — son geste quotidien change** : il ne pourra plus supprimer une grille ou une échelle utilisée sans défaire d'abord ce qui l'utilise. Le message doit donc NOMMER les référents, sinon le refus est une impasse.
  ⚠ **Tranchée AVANT l'audit Z2.** Si Z2 la contredit, la lui REPRÉSENTER.
- [x] **T0.4 — Décision D4 (pour S10)** : retirer en bloc l'ancien système d'échelles et les stubs des quatre sections, une fois le test de neutralisation de Z3 passé. Option A (recommandée) : oui, retrait complet (HTML + moteur + clés nues `configEchelle`/`niveauxEchelle`). Option B : garder, documenté. **Décision : OPTION A — retrait complet, APRÈS le test de neutralisation de Z3 (date : 2026-08-30)**
  ⮕ **Motif : aucun. Recommandation suivie, aucun motif écrit par Grégoire.**
  ⚠ **Le retrait reste conditionnel au test de neutralisation de Z3 (T3.1).** La décision autorise le retrait, elle ne le déclenche pas : sans la preuve d'exécution, S10 n'a pas de périmètre.
  ⚠ **Tranchée AVANT l'audit Z3.** Si Z3 la contredit, la lui REPRÉSENTER.
  · Mesure de cadrage (par `kuekatsheu-0d`, non rejouée par `kuekatsheu-bc`) : 31 occurrences de `configEchelle`/`niveauxEchelle`, dont 26 dans `echelles.js`.
- [x] **T0.5 — Décision D5 (pour S8)** : l'édition des métadonnées CC d'une pratique est cassée depuis longtemps (clé morte `pratiques_configurations`, audit M2). Option A (recommandée) : retirer l'entrée morte de cc-license.js ; réintroduire seulement si le besoin réel se présente. Option B : la réparer en la branchant sur `pratiquesConfigurables`. **Décision : OPTION A — retirer l'entrée morte de `cc-license.js` (date : 2026-08-30)**
  ⮕ **Motif : aucun. Recommandation suivie, aucun motif écrit par Grégoire.**
  · Mesure de cadrage (par `kuekatsheu-0d`, non rejouée par `kuekatsheu-bc`) : `pratiques_configurations` est LUE deux fois (`js/cc-license.js:1325` et `:1327`) et **ÉCRITE zéro fois dans tout `js/`**. Ce n'est pas une fonction fragile, c'est une fonction morte : la lecture rend toujours une liste vide. L'option A n'a donc **aucun coût fonctionnel** — rien de vivant n'est retiré.
- [x] **T0.6** — Vérifier le dernier `#NNN` réellement inscrit dans `BACKLOG.md` (≥ #615 — d'autres sessions réservent en parallèle), puis réserver EN UNE SEULE ÉCRITURE un identifiant par session S1 à S11 ; les reporter dans le tableau d'état (colonne Note).
  ⮕ **FAIT le 2026-08-30 par `kuekatsheu-bc`.** Dernier ID réellement inscrit **mesuré** : #618. Réservés en une seule écriture : **#619 (S1) · #620 (S2) · #621 (S3) · #622 (S4) · #623 (S5) · #624 (S6) · #625 (S7) · #626 (S8) · #627 (S9) · #628 (S10) · #629 (S11)**. Une autre session qui réserve part de **#630**.
- [x] **T0.7** — Committer l'audit et ce plan (`docs(audit): modèle d'objets de l'onglet Conception`), pousser. **Fait le 2026-08-30.**

---

## S1 — Audit ciblé Z1 : cartouches, frontière de portée, archivage (constats B1, B2, M1)

Lecture seule (plus un diagnostic console en lecture seule sur les données réelles). Périmètre et questions : audit §3-Z1. Risque : nul (aucune écriture).

- [ ] **T1.1** — Écrire le diagnostic console (lecture seule, collable dans Safari — pas d'arrow functions, pas de `const` redéclaré, une ligne) : inventaire des clés `cartouches_*` et `<trim>_cartouches_*`, croisé avec les `grillesTemplates` de chaque trimestre — quelles clés sont partagées par des grilles homonymes, leurs contenus (`criteres`, `commentaires`) ont-ils divergé.
- [ ] **T1.2** — Grégoire exécute le diagnostic sur ses données réelles ; consigner le résultat brut dans le rapport Z1.
- [ ] **T1.3** — Instruire l'archivage sur un trimestre jetable (test de l'audit §4.1) : perte effective, contamination du snapshot pratiques.
- [ ] **T1.4** — Trancher le chemin de migration pour D2-A (ou l'ancrage alternatif si D2-B) ; spécifier les diffs : archivage (B1), régime cartouches (B2), retrait du bloc mort `identifierTemplatesUtilises` et du double registre (M1). Chaque diff nomme ce qu'il retire.
- [ ] **T1.5** — Livrer `Rapports/AUDIT-conception-Z1-cartouches-archivage-AAAA-MM-JJ.md` au format du rapport chaîne-importation (constats gradués, diffs non appliqués, angles morts). Commit, tableau d'état, `SESSION.md`.

**Critère de fin** : le rapport Z1 répond aux quatre questions du §3-Z1 de l'audit, et S4/S5 peuvent s'exécuter sans improviser.

---

## S2 — Audit ciblé Z2 : politique de suppression et intégrité référentielle (constats S1, S2, S6, M7)

Lecture seule + inventaire console. Périmètre et questions : audit §3-Z2. Risque : nul.

- [ ] **T2.1** — Écrire le diagnostic console (lecture seule) : références pendantes par type dans les données réelles — `production.grilleId/echelleId/cartoucheId`, `évaluation.grilleId/echelleId/cartoucheId/productionId`, `groupesCours[].pratiqueId`, `carte.metadata.productionId` — tous trimestres.
- [ ] **T2.2** — Grégoire l'exécute ; consigner l'inventaire (l'incident #542 — 339 évaluations vers une échelle disparue — doit y apparaître ; sa réparation est spécifiée ici et exécutée en S6).
- [ ] **T2.3** — Spécifier les diffs selon D3 : politique unique par objet (les 4 chemins grilles, 3 échelles, 3 pratiques, cartouches, productions), sort des homonymes de donnees-v2.js (`supprimerGrilleDefinitivement`, `verifierDependancesPratique`), réparation des orphelins inventoriés.
- [ ] **T2.4** — Spécifier l'unification des trois remaps d'import sur l'implémentation #448 (trous compris : `production.cartoucheId`, `cartouche.echelleId`, champ interne `cartouche.grilleId`) et le sort du remap partage partiel — pour S9.
- [ ] **T2.5** — Livrer `Rapports/AUDIT-conception-Z2-suppressions-integrite-AAAA-MM-JJ.md`. Commit, tableau, `SESSION.md`.

**Critère de fin** : inventaire d'orphelins chiffré sur données réelles ; S6 et S9 exécutables sans improviser.

---

## S3 — Audit ciblé Z3 : le legacy vivant des quatre sections (constats S4, S5, S9)

Lecture + instrumentation temporaire (jamais commitée) ou Playwright. Périmètre et questions : audit §3-Z3. Risque : nul si l'instrumentation reste locale.

- [ ] **T3.1** — Test de neutralisation (audit §4.10) : commenter localement `initialiserModuleEchelles` au boot et à l'affichage, parcourir les six sous-sections (Playwright ou manuel consigné) ; noter ce qui casse.
- [ ] **T3.2** — Établir, section par section, quels stubs cachés sont encore ÉCRITS ou LUS par un chemin atteignable (productions 4800-4808, grilles 4984-4993 dont l'expando `#selectGrilleTemplate`, rétroactions 5395-5400, échelles 5128-5134).
- [ ] **T3.3** — Spécifier le plan de retrait en bloc ordonné : HTML legacy + stubs + moteur + clés nues + exports morts + doubles définitions `window` (dont `fermerModalBibliothequePratiques`, à unifier sur une seule implémentation), avec les sentinelles qui verrouillent l'éditeur moderne pendant l'opération. Chaque diff nomme ce qu'il retire.
- [ ] **T3.4** — Livrer `Rapports/AUDIT-conception-Z3-legacy-AAAA-MM-JJ.md`. Commit, tableau, `SESSION.md`.

**Critère de fin** : la liste exacte de ce qui se retire est établie, avec preuve (exécution) que rien de vivant n'en dépend.

---

## S4 — Archivage de trimestre (constat B1) — après S1

Fichier : `js/trimestres.js` (`creerSnapshotRessources`, `identifierTemplatesUtilises`). Risque : moyen (fonction de données ; sauvegarde préalable des données réelles obligatoire — copie, jamais `git checkout`).

- [ ] **T4.1** — Sentinelle (banc IDB simulé, cadre §6) : archiver un trimestre ne retire RIEN de `<id>_grillesTemplates`/`<id>_echellesTemplates`, et le snapshot pratiques lit le namespace du trimestre ARCHIVÉ. ROUGE d'abord sur le code actuel.
- [ ] **T4.2** — Appliquer les diffs du rapport Z1 (y compris retrait du bloc mort `identifierTemplatesUtilises` et du double registre M1 si Z1 les y a mis).
- [ ] **T4.3** — Break-test, suite complète, test manuel sur trimestre jetable (audit §4.1).
- [ ] **T4.4** — Lever le moratoire D1 (le noter dans le tableau). Commit, release, merge, tableau, `SESSION.md`.

**Critère de fin** : archiver un trimestre jetable ne modifie aucune collection de travail et le snapshot pratiques provient du bon namespace.

---

## S5 — Régime des cartouches (constat B2) — après S1 et D2 ; jamais en parallèle de S6

Fichiers : `js/trimestres.js` (`cle()`), `js/cartouches.js`, gardes de `js/grilles.js`, lecteurs d'évaluation. Risque : élevé (migration de données réelles — sauvegarde préalable par copie obligatoire).

- [ ] **T5.1** — Sentinelles selon D2 (spécifiées par Z1) : le propriétaire et les lecteurs d'évaluation résolvent la MÊME clé pour la même grille, trimestre actif et trimestre archivé. ROUGE d'abord.
- [ ] **T5.2** — Appliquer les diffs Z1 : régime + migration des données existantes (idempotente, avec flag) + retrait du routage spécial `startsWith('cartouches_')` s'il tombe.
- [ ] **T5.3** — Break-test (les deux côtés), suite complète, test manuel : audit §4.2 et §4.3 ne reproduisent plus le partage ni le cerveau divisé.
- [ ] **T5.4** — Commit, release, merge, tableau, `SESSION.md`.

**Critère de fin** : une cartouche a exactement un stockage par grille-et-trimestre (ou le partage est documenté et cohérent partout, si D2-B), et l'éditeur et l'évaluation lisent le même.

---

## S6 — Politique de suppression et réparation des orphelins (constats S1, S2) — après S2 et D3

Fichiers : `js/grilles.js`, `js/echelles.js`, `js/cartouches.js`, `js/productions-liste.js`, `js/pratiques.js`, `js/pratique-manager.js`, `js/donnees-v2.js`. Risque : moyen. Probablement 2 sessions (une par famille d'objets) — scinder au besoin en S6a/S6b dans le tableau.

- [ ] **T6.1** — Sentinelles à table de cas (une par objet) : suppression d'un objet référencé → comportement D3, sur TOUS les chemins, homonymes compris. ROUGE d'abord.
- [ ] **T6.2** — Appliquer les diffs Z2 : politique unique, gardes complètes (tous groupes, tous trimestres), homonymes fusionnés ou renommés (zéro-dette : une seule implémentation par geste).
- [ ] **T6.3** — Exécuter la réparation des orphelins inventoriés par Z2 (#542 compris), sauvegarde préalable par copie.
- [ ] **T6.4** — Break-test, suite complète, tests manuels §4.8 et §4.9.
- [ ] **T6.5** — Commit, release, merge, tableau, `SESSION.md` ; noter #542 réparé dans son item de backlog.

**Critère de fin** : supprimer un objet référencé produit le même comportement quel que soit le chemin ; l'inventaire d'orphelins de Z2 rejoué rend zéro.

---

## S7 — États d'édition : tempCriteres et création d'échelle (constat S3) — indépendant

Fichiers : `js/grilles.js`, `js/echelles.js`. Risque : faible. Les constats de l'audit suffisent (pas de rapport Z requis) : la session écrit ses diffs à partir de §2.3-S3.

- [ ] **T7.1** — Sentinelle : après abandon d'une création (`retourVueHierarchique`), `window.tempCriteres` est vide ; après bascule de trimestre, `tempCriteres` ET `_niveauxNouvelleEchelle`/`_reperesNouvelleEchelle` sont vides. ROUGE d'abord.
- [ ] **T7.2** — Purger les états de création dans l'abandon et dans les deux resets de bascule (`reinitialiserEditeurGrillesApresBascule`, `reinitialiserEditeurEchellesApresBascule`) — compléter #466/CO-16, pas le réécrire.
- [ ] **T7.3** — Trancher le chemin d'entrée « select » (grilles.js:164, `tempCriteres || []`) : s'il est atteignable en mode création (test §4.4), le faire réinitialiser comme `creerNouvelleGrille` ; sinon l'inscrire au retrait Z3/S10.
- [ ] **T7.4** — Break-test, suite complète, test manuel §4.4 et §4.5 (Mac et iPad).
- [ ] **T7.5** — Commit, release, merge, tableau, `SESSION.md`.

**Critère de fin** : aucun critère ni niveau fantôme ne survit à un abandon ou à une bascule ; §4.4 et §4.5 ne reproduisent plus rien.

---

## S8 — Retraits sûrs statiquement (constats S5 partie morte, M2, M3, M4, M5, M8, M11) — indépendant ; après D5

Fichiers : `js/pratiques-gestion.js`, `js/cc-license.js`, `js/tableau-bord-apercu.js`, `js/main.js` (migration `pratiquesPersonnalisees`), `js/grilles-bibliotheque.js`, `js/cartouches-bibliotheque.js`, `js/productions.js`, `js/pratique-notation-v2.js`, `js/pratiques.js` (no-op l.737-772), `js/cartouches.js`, `js/echelles.js`, `js/guidage-demo.js`, `js/accompagnement-contenu-popup.js`, `js/.fuse_hidden*`. Risque : faible SI le cadre §13 est suivi à la lettre. La session écrit ses retraits à partir des constats M2–M5, M8, M11 (chaque emplacement y est cité fichier:ligne).

- [ ] **T8.1** — Pour CHAQUE retrait, avant : grep du nom dans js/ + index.html + chaînes ; après : grep `window.<Nom>` dans le résidu, contrôle `/**` orphelin, `node --check`.
- [ ] **T8.2** — Retirer : `creerNouvellePratique` version pratiques-gestion.js:2045 ; clusters `listerTrimestresAvecGrilles`/cartouches obsolètes ; couches d'override productions.js (fusionner en UNE couche — attention : le wrapper d'`annulerFormProduction` est la seule implémentation vivante) ; exports morts pratique-notation-v2.js + doc pratique-interface.js:297-317 ; lectures des clés mortes selon D5 (`pratiques_configurations`, `bibliotheque-pratiques`) et la migration `pratiquesPersonnalisees` ; les deux entrées `conception-apercu-legacy` ; `onChangeGrilleCartouche` ; doubles exports redondants ; `.fuse_hidden*` ; exposition `planificationCarte.etat` ; no-op pratiques.js:737-772.
- [ ] **T8.3** — Sentinelle de non-régression : les six sous-sections s'initialisent sans erreur console (Playwright, smoke).
- [ ] **T8.4** — Suite complète, test manuel : parcours des six sous-sections + création d'une pratique (le bouton doit toujours ouvrir le wizard).
- [ ] **T8.5** — Commit, release, merge, tableau, `SESSION.md`.

**Critère de fin** : chaque symbole retiré est introuvable au grep dans le résidu ; zéro erreur console sur le parcours des six sous-sections.

---

## S9 — Unification des remaps d'import (constats S6, M6) — après S2

Fichiers : `js/import-export.js` (les deux implémentations), `js/partage-import.js`, `js/partage-section.js`, `js/pratiques/modalites-evaluation.js` (liste des miroirs morts). Risque : moyen (import-export est sous surveillance sécurité : `cd tests && npm test` complet avant commit).

- [ ] **T9.1** — Sentinelles Z2 : collision d'id à contenu divergent → remap répercuté sur TOUTES les références (production.grilleId/echelleId/cartoucheId, clé ET champ des cartouches, cartouche.echelleId), sur les deux chemins d'import. ROUGE d'abord.
- [ ] **T9.2** — Appliquer les diffs Z2 : une seule implémentation de remap (celle de #448, complétée), l'import sélectif l'appelle ; sort du remap partage partiel selon l'arbitrage consigné par Z2 ; `pratiqueActive` ajouté aux miroirs purgés (M6) ou retiré de l'import.
- [ ] **T9.3** — Break-test, `npm test` complet, test manuel : import d'un codex avec collision fabriquée.
- [ ] **T9.4** — Commit, release, merge, tableau, `SESSION.md`.

**Critère de fin** : une seule implémentation de la règle de remap ; aucun import ne laisse une référence pendante non annoncée.

---

## S10 — Retrait du legacy des quatre sections (constats S4, S9) — après S3 et D4 ; probablement 2 sessions

Fichiers : `index.html` (4800-5300), `js/echelles.js`, `js/grilles.js`, `js/productions.js`, `js/cartouches.js`. Risque : moyen-élevé en volume, faible en profondeur si Z3 a fait son travail. Scinder : S10a = échelles (bloc ancien système + stubs + moteur + clés nues + les 8 ids en double), S10b = stubs productions/grilles/rétroactions + expando `#selectGrilleTemplate`.

- [ ] **T10.1** — Sentinelles Z3 en place AVANT le premier retrait (verrouillage de l'éditeur moderne). ROUGE obtenu par mutation de l'éditeur, pas du legacy.
- [ ] **T10.2** — Appliquer le plan de retrait Z3, un fichier à la fois, cadre §13 à chaque pas.
- [ ] **T10.3** — Après S10a : plus AUCUN id en double dans index.html (vérification scriptée) ; clés `configEchelle`/`niveauxEchelle` sans lecteur ni écrivain (purge des résidus de données au boot, bornée, à spécifier par Z3).
- [ ] **T10.4** — Suite complète, Playwright sur les six sous-sections, test manuel Mac + iPad (éditeurs grille et échelle, cartouches, productions).
- [ ] **T10.5** — Commit, release, merge, tableau, `SESSION.md`.

**Critère de fin** : un seul système par section ; zéro id DOM en double ; zéro lecture des clés legacy.

---

## S11 — Mineurs restants (constats M1 si non absorbé par S4, M7, M9, M10) — une seule session

- [ ] **T11.1 (M7)** — Duplication : `dupliquerCarteActive` appelle `copierSeancesLecons` ; la suppression d'une carte purge `carteId::*` ; aligner les trois régimes de duplication de grille sur UNE sémantique (celle de partage-section, la plus complète) ou documenter la différence dans le code.
- [ ] **T11.2 (M9)** — Renommer l'un des deux `importerCarteDepuisTrimestre` ; contrôle de vivacité #425 sur l'import d'alignement depuis la bibliothèque.
- [ ] **T11.3 (M10)** — `docs/DATA-OWNERSHIP.md` : écrivains réels de `planification_seances` ; `docs/modules/evaluations-productions.md` : réécrire les régimes (post-#358) ou marquer le doc obsolète ; garde `IDS_GABARITS_HARDCODES` : échec bruyant (console.error) au lieu du silence.
- [ ] **T11.4** — Suite complète, commit, release, merge, tableau, `SESSION.md`.

---

## S12 — Tests sur appareil (angles morts, audit §4) — avec Grégoire

Après S7 au plus tôt ; les cases §4.1-4.3 tombent d'elles-mêmes si S4/S5 sont livrées avant. Une case par test, résultat noté en une ligne (date, appareil, observé) directement dans l'audit §4.

- [ ] **T12.1** — Dérouler les douze cases « Observé » de l'audit §4 restantes, Mac puis iPad.
- [ ] **T12.2** — Toute observation inattendue : commentaire dans le code concerné ; au BACKLOG seulement si symptôme vécu (règle du 24 août).
