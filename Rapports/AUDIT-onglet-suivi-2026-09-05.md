# AUDIT – L'onglet Suivi : ce qu'il dit d'un élève découle-t-il de ce qui a été saisi et évalué, selon des règles visibles — et ce qu'il sait, le protège-t-il partout où il le fait sortir ?

**Date** : 5 septembre 2026, 19 h 05 – 19 h 45.
**Cadré par** : `Rapports/prompts-audit/PROMPT-AUDIT-onglet-suivi-2026-09-05.md` (Cowork, avec Grégoire). Troisième audit cadré : il repart des flux H des deux premiers (`Rapports/AUDIT-moteur-evaluation-2026-09-05.md`, `Rapports/AUDIT-pratique-de-notation-2026-09-05.md`) sans les remesurer.
**Base auditée, mesurée** : branche `audit/onglet-suivi-2026-09-05`, partie de `origin/main` ; `git rev-parse --short HEAD` = `7d335a16` (= `main` = `origin/main` après `git fetch`, la release 1.122.1 poussée à 19 h 03) ; `cat version.json` = `{"build":"0905-1852","beta":"1.122.1"}`. L'arbre était propre à l'ouverture de la branche ; il porte ensuite ce rapport, le banc, les deux fichiers d'audit complétés, le prompt et `OU-EN-EST-ON.md`. Le run GitHub `33997649062` (1.122.1) : Vitest `success`, Playwright WebKit en cours au moment du dépôt — lu avant tout push (voir clôture).
**Vitest, depuis `tests/`** (`npx vitest run`) : 477 fichiers / 5 332 tests verts avant le banc (rituel, 18 h 45 ; 1.122.1 n'ajoute aucun test) ; **478 fichiers / 5 374 tests verts avec lui**, code 0.
**Périmètre recompté** (`wc -l`, 5 septembre 19 h) : identique au prompt pour treize fichiers ; **deux ont bougé depuis son écriture** — `profil-etudiant-sections-affichage.js` 4 787 (4 753 au prompt), `profil-etudiant-actions.js` 791 (772) : ce sont les lignes de #706 (1.122.0). `interpretation-config.js` : 188. Total : 23 272 lignes.
**Les modules que le prompt n'identifiait pas**, trouvés depuis les `data-action` et `id` d'`index.html` : **Suivi du groupe** = `js/tableau-bord-apercu.js` (3 227 l. ; `liste-etudiants-suivi`, `panneau-suivi-etudiants`, `carte-indicateurs-acpe`, `suivi-tri-boutons`) ; **Liste des étudiant·es** = `js/etudiants.js` (`afficherListeEtudiantsConsultation`, `filtre-rai-liste`) — `js/groupe.js` n'est que l'import et la gestion ; **Animation** = `js/boite-outils.js` (tirage et questions : il lit `groupeEtudiants`, `infoCours` et son propre `etatTirage`, aucun indice, aucun calcul du Suivi — hors chaîne).
**Mode** : lecture seule sur `js/` (**rien d'appliqué** ; quatre mutations d'un point pour les break-tests, chacune restaurée par copie à empreinte SHA-256 identique, `git status -- js/` propre), exécution en bac à sable Vitest. Les modules réels sont chargés dans un faux `window` (patron des deux bancs précédents) : les quinze fichiers de `js/pratiques/` qui calculent, `portfolio.js`, `indices.js`, `saisie-presences.js`, les sept `profil-etudiant-*.js`, `interventions.js`, `consolidation.js`, `snapshots.js`, `tableau-bord-apercu.js`, `graphiques-progression.js`, `interpretation-config.js` — **et `modes.js` lui-même**, dans son propre bac branché sur le même store, parce que le cas « présences dans un autre groupe-cours » dépend de son filtre par cours. **Miroirs, nommés** : `obtenirSeancesCompletes` / `obtenirSeancesHoraire` / `obtenirCalendrierComplet` (le calendrier et l'horaire sont le geste 1, éprouvé — ici dix lundis de deux périodes), `obtenirEcheanceEffective` (copie des sept lignes de `productions.js:152`), `resoudreModeleParId`, `obtenirPreference`, `estEtudiantExclu` (copie de `main.js:111`).

**Le banc** : `tests/unit/audit-onglet-suivi-2026-09-05.test.js`, **42 mesures**, quatre élèves dans un groupe-cours sommatif (quatre travaux 20/20/30/30, dix séances de deux périodes, échelle 0-I-D-M-E à valeurs 0/40/65/75/100 avec repère de maîtrise M, grille de dépistage Structure + Rigueur multistructurels, Nuance relationnel) : **l'assidu qui progresse** `2000001` (présent partout, 60 → 70 → 80 → 90), **l'absent qui régresse** `2000002` (4 séances sur 10, 85 → 70 → 55 → 50), **sans aucune évaluation** `2000003` (présent partout, rien de remis), **l'incohérent** `2000004` (DA absent du groupe, présences dans un autre groupe-cours GC2, une évaluation sur une production qui n'existe pas). **Le nombre attendu est calculé à la main dans le commentaire qui précède chaque `it`, avant le code** ; les `expect` sont les valeurs obtenues. Il imprime toutes les valeurs sous `AUDIT-SUIVI-MESURES`.

```
cd tests && npx vitest run unit/audit-onglet-suivi-2026-09-05.test.js
```

**Ce que les flux H des deux premiers rapports ont mesuré et que je ne remesure pas** : le premier (H-1) — les pratiques lisaient `noteFinale` sans portée ni verrou ; réglé par #706 le jour même (règle unique `evaluationEntreDansLaNote`). Le second (H) — sept golden masters protègent la note du cours des quatre familles. Ici je regarde ce que le Suivi FAIT de cette note (B) et ce qui, dans le Suivi, n'est PAS passé par la règle #706 (B-2).

**Verdicts** : `[exécuté]` = la fonction réelle a été appelée dans le banc et la valeur citée est celle qu'elle a rendue ; `[lecture]` = chemin de code lu, non exécuté ; `[grep]` = un compte reproductible par la commande citée (plusieurs sont exécutés DANS le banc, sur le source). Ce que le banc n'est pas : un navigateur (aucun WebKit n'a tourné ; les écrans sont des chaînes ou des structures, jamais un DOM rendu) ; et les données réelles de Grégoire n'ont pas été lues.

---

## Vue d'ensemble : la réponse à la question directrice

**Première moitié — la vérité de la chaîne.** Sur les deux élèves dont les données sont propres, chaque écran rend le palier calculé à la main : l'assidu est **niveau 1, « Stable », IPB 0 ↗ « Maîtrise acquise »**, l'absent est **niveau 3, « Difficulté persistante », IPB 3 → « Difficulté persistante », défi Structure, contexte « fragile »**, et le Suivi du groupe, la Liste, la cible d'intervention et le profil lisent ces nombres par les mêmes fonctions (F-1). **La chaîne est juste quand rien ne la dérange.** Elle se trompe dès qu'une évaluation est dérangée — et trois cas la font rendre un palier faux :

1. **Une reprise** (B-3, majeur) : la note du cours remplace l'originale, mais **le dépistage compte l'originale ET la reprise** — la performance des trois derniers artefacts, l'IPB, les moyennes par critère et le défi spécifique ne filtrent pas `remplaceeParId`. L'absent qui reprend sa dissertation (55 → 75) est lu **niveau 3** au lieu de niveau 2 : le dépistage voit 50, 75, 55 là où il devrait voir 50, 75, 70. Sept fonctions sont touchées ; deux, dans le même fichier, filtrent correctement.
2. **L'élève dont on ne sait rien** (D-2, D-3, majeur) : « Non-participation, niveau 3 » est attribué à **tout le groupe au retour de la première séance, avant le premier travail** — et à un élève sans aucune présence ni évaluation dès que les indices ont été calculés une fois, parce qu'une assiduité sans séance vaut **100 %** par défaut. Un palier 3 attribué faute de données, sur toute la classe, au moment où l'orthopédagogue ouvre l'application.
3. **Le rapport du profil** (B-5, majeur) : **il ne se génère pas** — `obtenirDetailsAssiduite` n'est exporté sur `window` par aucun fichier de `js/` et `profil-etudiant-rapport.js` l'appelle par son nom nu depuis une autre IIFE (depuis le refactor du 18 mai 2026). Le bouton rend « Erreur lors de la génération du rapport : obtenirDetailsAssiduite is not defined ». Et quand le banc lui prête un pont, ses nombres ne sont pas ceux du profil : « Performance : 75 % (4 meilleurs artefacts) » là où la note du cours dit 77, « Complétion : 100 % (0 remises / 0 productions) » pour un cours sans portfolio.

À quoi s'ajoute **le P historique des snapshots** (G-2, majeur, recoupe #716) : pour une sommative, le repli lit **toutes les évaluations du groupe**, pas celles de l'élève — les trois courbes individuelles du banc portent le même 67. Et **#706 s'arrête à la note du cours** (B-2, moyen) : un brouillon non verrouillé compte comme remis pour C et comme artefact pour la performance du dépistage.

**Seconde moitié — la protection.** Le volet confidentiel (services adaptés, sous-catégories, notes de présences, portraits) **ne sort dans aucun des flux du Suivi** : le rapport du profil, les snapshots, la consolidation, l'export CSV, la synthèse PDF, les graphiques — cherché dans chacun, **rien** (G-1, G-2, G-4, `[grep]` sur neuf fichiers : zéro lecteur hors du module). Aucun `console.*` ne l'imprime. Le codex complet l'emporte, comme tout l'espace du trimestre (c'est la sauvegarde personnelle : attendu). Trois réserves, toutes moyennes : **le mode anonymisation ne l'anonymise pas** et le bouton « Confidentiel » n'a pas de garde — les noms sont anonymes à l'écran, les notes et les portraits sont les vrais ; deux attributs `data-date` / `data-da` du volet sont interpolés sans `echapperHtml` (règle 1) ; et, hors volet, **les observations d'une intervention sont injectées brutes dans un `<textarea>`** (E-6, règle 1, le bilan à côté est échappé). #539 (les cinq critères de Grégoire dans les identifiants du volet) tient.

**Les quatre élèves, palier et indices attendus / obtenus sur chaque écran** (`[exécuté]`, jeu de base) :

| Élève | A attendu / obtenu | C | P (note du cours) | Carte RàI | Suivi des fondations (IPB × direction) | Cible d'intervention | Contexte | Suivi du groupe (enrichi) |
|---|---|---|---|---|---|---|---|---|
| l'assidu qui progresse | 100 / **100** | 100 / **100** | 77,0 / **77** | niveau 1 « Stable » / **niveau 1 « Stable », défi Aucun** | IPB 0 ↗ « Maîtrise acquise » niv. 1 / **idem** | « Maîtrise acquise » niv. 1 / **idem** | très favorable / **très favorable** | A 100 C 100 P 77 M 100 niv. 1 / **idem** |
| l'absent qui régresse | 40 / **40** | 100 / **100** | 62,5 → 63 / **63** | niveau 3 « Difficulté persistante », défi Structure / **idem** | IPB 3 → « Difficulté persistante » niv. 3 / **idem** | « Difficulté persistante — Structure (multistructurel) » niv. 3 / **idem** | fragile / **fragile** | A 40 C 100 P 63 M 70 niv. 3 / **idem** |
| sans aucune évaluation | 100 / **100** | 0 / **0** | non constructible / **non constructible (stocké 0)** | niveau 3 « Non-participation » / **idem** | aucun (null) / **null** | « Non-participation » niv. 3 / **idem** | en attente / **en attente** | A 100 C 0 P 0 M 50 niv. 3 / **idem** |
| l'incohérent (hors du groupe) | 0 dans GC1 (ses fiches sont dans GC2) / **0** | aucun indice stocké / **aucun** | aucun / **aucun stocké** ; à la volée sur son profil : **83** (la production fantôme compte) | invisible aux écrans du groupe / **invisible** (`_tousEtudiantsEnrichis` : 3 élèves) | — | — | — | — |

Deux écarts avec le calcul à la main dans ce tableau, et ce sont les deux qui portent des constats : l'incohérent **n'est nulle part ET est calculé** (D-5 : son profil, s'il s'ouvre, dit P 83 par « les meilleures notes », et sa production fantôme entre dans ses moyennes par critère mais pas dans le dépistage) ; et le « sans aucune évaluation » est niveau 3 **par une règle qui ne regarde pas si un travail est dû** (D-1 est fondé — quatre travaux évalués pour les autres ; D-2 et D-3 ne le sont pas).

---

## A · Présences → assiduité

### A-1 · Les quatre élèves – fonctionne – `[exécuté]`
Dix séances de deux périodes saisies pour le groupe. Assidu 20/20 → **1**, Absent 8/20 → **0,40** (présent aux quatre premières, aucune fiche ensuite = absent), Silence **1**, Incohérent **0/20** : ses dix fiches portent `coursId: 'GC2'`, le filtre de cours de `modes.js` les écarte, et sans fiche il est absent à chaque séance saisie du groupe. Le producteur écrit **une** clé (`indicesAssiduite`, namespacée) et enchaîne `indicesCP` (A-2 : `ecritures` = `['test_indicesAssiduite', 'test_indicesCP']`) ; il ne calcule que les élèves du groupe — l'incohérent n'a pas d'entrée, et `calculerTousLesIndices` lit **A = 0** pour lui. Lecteurs sans recalcul (`[grep]` `grep -rn "indicesAssiduite" js/ --include=*.js -l` → indices, evaluation, profil-etudiant-sections-affichage, tableau-bord-apercu, snapshots, trimestres…) : le stock peut être périmé jusqu'au prochain écran qui recalcule (Suivi du groupe, Liste, enregistrement des présences) — compromis documenté en tête d'`indices.js`, tenu.

### A-2 · Un élève ajouté en semaine 6 : les cinq séances d'avant comptent comme des absences – moyen, décision due – `[exécuté]`
Silence n'a de fiche que sur les cinq dernières séances : **A = 0,50** (10/20). Aucun champ « date d'arrivée » n'existe sur une fiche d'élève (`grep -rn "dateAjout\|dateInscription\|dateArrivee\|dateEntree" js/*.js` → uniquement des bibliothèques et des fichiers). La règle « une séance saisie pour le groupe sans fiche pour lui = absent » (#220) est juste pour l'élève inscrit qui ne vient pas ; elle punit l'arrivant. **Ce que l'enseignant verrait** : un élève arrivé à la mi-session à 50 % d'assiduité tout le trimestre, et « fragile » ou « insuffisant » au contexte. **Disposition proposée : inscrire et continuer** — c'est une règle pédagogique (compter depuis l'arrivée ? depuis l'inscription au registrariat ?), Grégoire tranche ; la mécanique (une date d'entrée par élève, ou la première fiche) attend la règle.

### A-3 · Congé, séance annulée, date future, autre groupe-cours le même jour – fonctionne – `[exécuté]`
Une fiche fantôme à la date d'un congé n'entre nulle part (le congé n'est pas une séance ; la porte de saisie le refuse : `{ raison: 'conge', motif: 'Relâche' }`) ; une séance que personne n'a saisie (« annulée ») sort du numérateur et du dénominateur (Absent : 8/18 sur neuf séances saisies) ; une date de cours future est refusée (`raison: 'future'`) ; une fiche d'un autre groupe-cours le même jour est écartée par le filtre de cours (A reste 20/20). Un trimestre archivé lit ses propres présences par `cle()` (`[lecture]`, #358 ; sentinelle #330 pour les deux groupes d'un même cours).

### A-4 · Les six constats de mai remesurés – N1 à N6 corrigés ; le `parseInt` de mai reste – `[exécuté]` `[grep]`
| Constat | 5 septembre | Preuve |
|---|---|---|
| N1 `=` qui écrasait l'accumulateur | **corrigé** (#538) | le corps d'`obtenirHeuresSeance`, commentaires retirés : **0** affectation `totalHeures =`, **2** accumulations `+=` ; la branche « format inconnu » n'ajoute rien |
| N2 jours multi-séances sous-comptés | **corrigé** (#538, #540 E2) | un jour à deux séances de 2 rend **4** |
| N3 classe absence-motivée perdue à l'édition | **corrigé** | `dataset.facultatif` lu : `appliquerCodeCouleurPeriodes` sur 0 rend `saisie-absence-motivee` |
| N4 `etudiants` nul | **corrigé** | `etudiants = etudiants \|\| []` sur les deux sites (1111, 1462) ; le troisième garde son `if (!etudiants …) return` |
| N5 `modifierNotesPresence` sans `coursId` | **corrigé** (Tier 6.4) | deux fiches même DA même date, GC2 puis GC1 : seule GC1 est modifiée, GC2 « intact » |
| N6 motif de congé non échappé | **corrigé** | `compteur.innerHTML` interpole `echapperHtml(message)` |
| Le constat resté hors du JSON de mai : `parseInt` à `step=0.5` | **tenu, mineur** | `obtenirClasseSaisiePeriodes(0.5, 2)` → `saisie-absence` (rendu initial) ; `appliquerCodeCouleurPeriodes` sur `0.5` → `saisie-retard` (édition live). La même demi-période, deux couleurs selon le moment. |
**Disposition proposée pour le résiduel : commenter et oublier** — ou une ligne (`parseFloat`) si un lot touche le fichier.

### A-5 · Trois portes d'écriture des présences, deux régimes – mineur – `[grep]`
`enregistrerPresences` passe par `sauvegarderDonneesSelonMode('presences', …)` (1 site : refuse en mode anonymisation) ; `sauvegarderPresencesSansValidation`, `modifierNotesPresence` et `ajouterPresencesIntervention` écrivent `db.setSync(clePresences, presences)` directement (3 sites : jamais refusés). Même constat pour `interventions.js` (E-4). **Disposition proposée : inscrire et continuer** (un item « la règle des modes aux écrivains du Suivi »), avec E-4.

---

## B · Complétion et performance — la frontière avec les évaluations

### B-1 · Les nombres du jeu de base – fonctionne – `[exécuté]`
C sommatif : Assidu 4/4 = **100**, Absent **100**, Silence 0/4 = **0** (quatre productions évaluées par d'autres). P : Assidu (60·20 + 70·20 + 80·30 + 90·30) / 100 = **77**, Absent 62,5 → **63**, Silence **null → « non constructible », stocké 0** (#709). L'incohérent n'a **aucune** entrée `indicesCP`. La pratique et le stock disent la même chose (0,77 · 0,625 · null).

### B-2 · Un brouillon : hors de la note du cours, mais remis pour C et artefact pour le dépistage – moyen – `[exécuté]`
Assidu, P4 en brouillon (`verrouillee: false`). Note du cours **71** (sans P4, #706 ; `compterEvaluationsEcarteesDeLaNote` → `{ brouillons: 1 }`). Mais **C = 100** : `calculerCompletion` (sommative ET configurable) compte « noteFinale !== null », pas la règle #706. Et **la performance du dépistage lit 0,80** (90, 80, 70 : le brouillon en tête) : `calculerIndicesNDerniersArtefacts` ne passe pas par `evaluationEntreDansLaNote`. Le RàI croise alors une performance qui compte le brouillon (0,80) avec un P qui l'écarte (0,71) → niveau 2 « Stable ». **Ce que l'enseignant verrait** : « Complétion 100 % » avec une copie non enregistrée, et une carte RàI dont les deux chiffres ne comptent pas les mêmes copies. `[grep]` `grep -c "evaluationEntreDansLaNote" js/profil-etudiant-calculs.js js/profil-etudiant-sections-affichage.js js/pratiques/pratique-sommative.js` → **0 · 0 · 2** (la sommative l'applique à P, pas à C). **Disposition proposée : inscrire et continuer** — #706 est une règle arrêtée pour la note du cours ; l'étendre à C et au dépistage est la même règle, mais c'est à lui de dire qu'elle vaut là aussi (un brouillon « remis » pour la complétion peut être voulu).

### B-3 · Une reprise : la note du cours remplace ; le dépistage compte l'originale ET la reprise – MAJEUR – `[exécuté]`
Absent reprend P3 (55 → 75, le 20 avril ; `remplaceeParId` posé sur l'originale). Note du cours **69** (68,5 : la reprise remplace). Le dépistage : `calculerIndicesNDerniersArtefacts` lit les trois plus récentes **sans écarter la remplacée** → P4 50, P3′ 75, **P3 55** → **0,60** au lieu de 0,65 (50, 75, 70) ; l'IPB porte **cinq** artefacts pour quatre productions (`historiqueComplet.length` = 5) ; `calculerMoyennesCriteres` compte les deux (Structure (0,75 + 0,65 + 0,40 + 0,75 + 0,40) / 5 = **0,59**). Résultat : **niveau 3 « Difficulté persistante »** (0,60 < 0,64) là où le calcul à la main rend niveau 2. À la main, l'IPB dit « Difficulté émergente » (1, ↘) ; il aurait dit la même chose sans l'originale — c'est la carte RàI qui bascule. `[grep]` `grep -n "remplaceeParId" js/profil-etudiant-calculs.js` → **2** sites (`obtenirEchelleCommuneDesEvaluations:678`, `diagnostiquerConversionNiveaux:751`) : les deux fonctions du lot 3 de #542 filtrent ; **les sept plus anciennes ne filtrent pas** — `calculerMoyennesCriteres:818`, `calculerMoyennesCriteresRecents:958`, `_filtrerEtTrierEvaluationsIPB:1085`, `calculerIndicesNDerniersArtefacts:1445`, `identifierDefiSpecifique:1633`, et dans `sections-affichage.js` `calculerDirectionRisque:2024`, `calculerDirectionsCriteres:2096`. **Ce que l'enseignant verrait** : un élève qui a repris et réussi reste « Intensif » ; l'orthopédagogue le reçoit. **Disposition proposée : corriger maintenant** — un palier affiché est faux, la correction est un filtre `!e.remplaceeParId` sur sept sites (patron des deux sœurs du même fichier), et la réconciliation #360 (doublons réconciliés portant `remplaceeParId`) en bénéficie du même geste. **Break-test M1** : ajouter ce filtre à l'IPB ne rougit **que ce banc** — aucune sentinelle ne verrouille ni le défaut ni la correction.

### B-4 · Un « non remis » enregistré avec 0 : remis pour le C sommatif, écarté par le C des snapshots – moyen – `[exécuté]` `[grep]`
Silence reçoit une évaluation P1 à 0 marquée `statutRemise: 'non-remis'`. C sommatif → **25** (1 remise sur 4) ; C historique des snapshots au 15 février → **0** (0 sur 1 due). Le corps de `calculerCompletion` de la sommative ne lit pas `statutRemise` (`[grep]` sur le corps : **false** ; la configurable non plus) ; la PAN-Standards (`:566`), les snapshots (`:230`, `:284`) et `genererRapportAPI` le lisent. **Ce que l'enseignant verrait** : « Complétion 25 % » pour un élève qui n'a rien remis. **Disposition proposée : inscrire et continuer, DANS le cadrage « non remis par famille »** (`plans de travail/CADRAGE-2026-09-05-non-remis-par-famille.md`, après le 14) — c'est sa première mesure due, et elle est faite ici pour C : SOM et configurable ignorent le statut, STD et snapshots l'honorent.

### B-5 · Le même P partout ? Oui pour trois écrans ; le RAPPORT du profil ne se génère pas, et recalcule le sien – MAJEUR – `[exécuté]` `[grep]`
Tableau de bord (`calculerIndicesEtudiant`, stock), Liste et profil (`calculerTousLesIndices`) : **77, 77**. Le rapport (`genererRapportAPI`, section « Rapport » du profil, celle que l'orthopédagogue ou l'API reçoit) : **il lève**. `grep -rn "window.obtenirDetailsAssiduite" js/` → **0** ; la fonction vit dans l'IIFE de `profil-etudiant-sections-affichage.js:1620` et `profil-etudiant-rapport.js:56` l'appelle par son nom nu depuis une autre IIFE (`chargé` l. 14577, avant elle l. 14581 — l'ordre n'y change rien, c'est la portée). `genererEtAfficherRapport` attrape l'erreur et écrit dans la zone de texte « Erreur lors de la génération du rapport : obtenirDetailsAssiduite is not defined ». Depuis le refactor de la session A (18 mai 2026), d'après l'en-tête du fichier. Aucun test ne l'appelle (`grep -rln "genererRapportAPI" tests/` → 0). Avec un pont, le banc lit ses nombres : **« Performance : 75 % (4 meilleurs artefacts actuels) »** — sa propre règle (`modalites.nbArtefactsPortfolio || 4` meilleures notes), pas la pratique (77) ; **« Complétion : 100 % (0 remises / 0 productions) »** — il compte des `artefact-portfolio` que ce cours n'a pas, et affiche à côté le C de la pratique. **Ce que l'orthopédagogue verrait** : un message d'erreur ; et après correction de l'export, un P et un C qui ne sont pas ceux du profil qu'il vient de quitter. **Disposition proposée : corriger maintenant, en un seul lot « le rapport du profil »** — l'export d'une ligne rend le bouton vivant, mais le rendre vivant sans aligner ses trois nombres sur `calculerTousLesIndices` livrerait un rapport faux au bon moment. Si le lot ne tient pas avant le 14 : au moins retirer le bouton, plutôt qu'un rapport qui échoue. **Break-test M3** : exporter la fonction ne rougit que ce banc.

---

## C · Niveau, IPB, patterns, palier — les deux définitions de la maîtrise

### C-1 · L'assidu – fonctionne – `[exécuté]`
Fondations par artefact 0,65 · 0,70 · 0,75 · 0,875 ; la plus récente ≥ 0,70 → **IPB 0** ; +0,125 > 0,10 → **↗** ; « Maîtrise acquise » niveau 1. Moyennes 0,7625 · 0,725 · 0,7625 : aucun défi (< 0,70). P 0,77 ≥ 0,75, performance des trois derniers 0,80 → **« Stable », niveau 1**. Cible « Maîtrise acquise » niveau 1. Contexte « très favorable ». Consolidation (G-3) : les trois critères consolidés (Rigueur à « Analyse 2 », Structure et Nuance à « Dissertation »), repère lu sur l'échelle (0,75, non déduit).

### C-2 · L'absent – fonctionne – `[exécuté]`
Fondations 0,875 · 0,65 · 0,40 · 0,40 → **IPB 3, →**, « Difficulté persistante » niveau 3. Moyennes 0,55 · 0,6125 · 0,6375 → défi principal **Structure**. P 0,625 < 0,64 → **niveau 3**, pattern « Difficulté persistante » (0,583). Cible « Difficulté persistante — Structure (multistructurel) » niveau 3. Contexte « fragile » (A 0,40). Rien à consolider.

### C-3 · Une échelle à trois paliers (A/B/C, maîtrise dès B = 60) : « consolidé » et « niveau 2 » pour le même élève – #551 recoupé, mesuré – `[exécuté]`
Quatre travaux à 70, tous les critères « B » (valeur 75). Sur son échelle, 70 est **B** (`situerPourcentageDansEchelle`), le repère de maîtrise est B (min 60 → **0,60**, lu, non déduit) : **consolidé** dès P1 (G-3 : `Structure: 'consolide'`). Le RàI compare P = 0,70 à `idme.developpement` 0,75 → **niveau 2 « Performance en développement »**, et le suivi des fondations dit « Maîtrise acquise » (0,75 ≥ 0,70). **Trois cartes, deux verdicts.** C'est la conséquence de #551 telle que le prompt demandait de la mesurer, pas une redécouverte : la marque de maîtrise vit sur l'échelle (#555) et le palier RàI ne la lit pas. **Disposition proposée : recoupé #551 — y ajouter ces deux mesures (C-3, C-4) comme cas de sa sentinelle future**, aucune fiche neuve.

### C-4 · Une échelle 60 / 75 / 90 : 62 est « D », le RàI dit niveau 3 – #551 recoupé – `[exécuté]`
Trois travaux à 62, critères D (valeur 67). Sur son échelle : **D**, deuxième palier sur quatre. RàI : P 0,62 < `idme.insuffisant` 0,64 → **niveau 3 « Difficulté persistante »** ; IPB 3 (0,67 < 0,70). Même disposition que C-3.

### C-5 · Un critère analytique en points (21/30 = 70 %) : le dépistage lit 65 – moyen – `[exécuté]`
La copie compte 21/30 dans sa note ; le dépistage convertit `niveauSelectionne` D par l'échelle → **0,65**. Les points (lot 2 du 4 septembre) sont invisibles au dépistage, comme ils le sont à la note du cours (C-3 du second audit). **Ce que l'enseignant verrait** : une barre « Structure 65 % » pour un critère qu'il a noté 70 %. **Disposition proposée : inscrire et continuer** — règle pédagogique (le dépistage lit-il la valeur du niveau ou le score obtenu ?) ; la mécanique (`convertirNiveauEnScore` lisant `points/pointsMax` quand ils existent) attend la règle.

### C-6 · Un critère SOLO « Aucun » : hors de l'IPB, mais TOUJOURS un défi pour la carte RàI, le défi spécifique et les critères ciblés – moyen – `[exécuté]`
Quatrième critère « Méthode » étiqueté `aucun`, noté I. L'IPB ne surveille que Structure et Rigueur (`criteresMulti`, et le libellé du tableau de bord le dit). Mais `diagnostiquerForcesChallenges`, `identifierDefiSpecifique` et `calculerMoyennesCriteres` n'ont aucun filtre SOLO : **« Méthode » devient le défi principal de la carte RàI** (pattern « Défi spécifique »), et `mettreAJourCriteresCibles` (interventions) le compte en défi et le propose en critère ciblé. Le lot 4 (4 septembre) a dit « le dépistage ne le surveille pas » — vrai pour l'IPB seulement. **Disposition proposée : inscrire et continuer** — dire ce que « Aucun » retire (l'IPB seul ? tout le dépistage ?), c'est une décision de conception.

### C-7 · Une évaluation sans texte de rétroaction finale : dans P, hors du dépistage – moyen – `[exécuté]`
Assidu, P4 sans `retroactionFinale`. P la compte (77) ; l'IPB, les moyennes par critère et le défi spécifique filtrent `e.retroactionFinale` → **trois artefacts pour eux, quatre pour P** (`historiqueComplet.length` 3, `scoreActuel` 0,75 = P3). `calculerIndicesNDerniersArtefacts`, elle, ne filtre pas la rétroaction (nbArtefacts 3 = fenêtre). **Ce que l'enseignant verrait** : une copie notée sans commentaire qui pèse dans la note et pas dans les barres de critères. **Disposition proposée : inscrire et continuer** — le filtre date du temps où les niveaux se lisaient dans la prose (#529 l'a remplacé par `criteres[]`) ; il n'a plus de raison, mais le retirer change des moyennes.

### C-8 · Toutes les comparaisons pourcentage-contre-fraction des trois fichiers, avec leurs unités – `[grep]`
`grep -n "0\.[0-9]\+\|/ *100\|\* *100" js/profil-etudiant-calculs.js js/interventions.js js/profil-etudiant-helpers.js` (commentaires exclus) — **aucune comparaison d'unités croisées** (#541 tient), mais quatre jeux de seuils **en dur** :

| Fichier : ligne | Gauche | Droite | Unités | Verdict |
|---|---|---|---|---|
| calculs 1195 | delta de scores IPB (0-1) | `obtenirSeuil('progressionArtefacts')` 0,10 | 0-1 / 0-1 | ✓ configuré |
| calculs 1460, 1775 | `noteFinale / 100`, `indices.P / 100` | `idme.*` 0,64 / 0,75 | 0-1 / 0-1 | ✓ configuré (#551 : mauvaise source) |
| calculs 1905-1979 (`determinerAlerteContextuelle`) | `indices.A / 100`, `C / 100` | **0,85 · 0,75 · 0,65 en clair** | 0-1 / 0-1 | ✗ **en dur, pas `interpretation.*`** (§3 n° 7 de l'audit du 27 août, jamais inscrit) |
| calculs 2112 → helpers 957-1005 (`interpreterMobilisation`) | A, C 0-1 | **0,7 · 0,8 · 0,9 en clair** | 0-1 / 0-1 | ✗ en dur |
| helpers 209 (`obtenirNiveauIDMEDepuisPourcentage`) | `pourcentage / 100` | `idme.*` | 0-1 / 0-1 | ✓ (#541) |
| helpers 1056-1128 (`interpreterCompletion` / `Assiduite`) | `valeur / 100` | `interpretation.*` puis **0,60 en clair** | 0-1 / 0-1 | ✗ le quatrième seuil est en dur |
| interventions 918-919 (bilan) | moyennes 0-1 | **0,85 · 0,75 · 0,65 en clair** → lettres E/M/D/I | 0-1 / 0-1 | ✗ en dur, et 0,65 ≠ `idme.insuffisant` 0,64 (E-5) |
| interventions 1124-1125, 1155-1159 | moyennes 0-1 | `idme.*` | 0-1 / 0-1 | ✓ configuré |
| sections-affichage 3163, 3239 · diagnostics 151 | `perf.P` 0-100 | `seuil * 100`, `obtenirNiveauIDMEDepuisPourcentage(P)` | 0-100 / 0-100 | ✓ |
| tableau-bord `appliquerFiltres` | `e.P`, `e.M` 0-100 | **65 en clair** | 0-100 | ✗ en dur (filtres « P < 65 % », « A+C < 65 % ») |
**Disposition proposée : inscrire et continuer, un seul item « les seuils d'alerte A-C vers `interpretation.*` »** (item 5 du §9 de l'audit du 27 août, resté sans fiche — transcrit ci-dessous), avec E-5 et les filtres du tableau de bord.

---

## D · Diagnostic croisé et cible d'intervention — l'élève dont on ne sait rien

### D-1 · Silence, présent partout, rien remis alors que quatre travaux sont évalués – fonctionne – `[exécuté]`
Niveau 3 « Non-participation » (carte RàI et cible), contexte « En attente » (C non calculable), suivi des fondations `null`. Ici le signal est fondé : quatre productions ont été évaluées pour les autres.

### D-2 · Début de trimestre : présences prises, aucune évaluation pour personne → tout le groupe « Non-participation » niveau 3 – MAJEUR – `[exécuté]`
La règle (`determinerNiveauRaiPedagogique:1790`, `determinerCibleIntervention:2105`) est « nbArtefacts 0 ET A > 0 », **sans regarder si un travail est dû ou évalué**. Au retour de la première séance : les trois élèves sont **« Non-participation »** dans la carte RàI, la cible, la barre RàI du groupe et la barre des patterns (elles lisent ces deux fonctions) ; et l'alerte nommée du tableau de bord (« 3 étudiants présents sans aucun travail remis ») s'affiche, son filtre rejoué (`nombreSeances > 0 && !(completion > 0 || performance > 0)`) retient **3**. `determinerAlerteContextuelle`, elle, sait dire « En attente » quand C n'est pas calculable : la garde existe à côté, pas ici. **Ce que l'orthopédagogue verrait, à la rencontre de la mi-septembre** : une classe entière en palier intensif. **Disposition proposée : corriger maintenant** — un palier 3 attribué faute de données, sur tout le groupe ; la garde est celle de la carte Contexte (aucune production due, ou aucune évaluée pour le groupe → « En attente »), à poser dans les deux fonctions et dans l'alerte nommée. **Break-test M4** : retirer la branche ne rougit que ce banc (D-2, D-3, F-1) — aucune sentinelle ne fige ce comportement, ni dans un sens ni dans l'autre.

### D-3 · Zéro donnée (ni présence ni évaluation) : A vaut 100 par défaut → « Non-participation » dès que les indices ont été calculés une fois – MAJEUR, même racine – `[exécuté]`
`calculerAssiduite` sans aucune séance saisie rend `{ indice: 1 }` — **100 %** — et le RàI lit « A > 0 ». Tant que le stock `indicesAssiduite` n'existe pas : « En attente », niveau 0 ; après le premier passage sur le Suivi du groupe ou la Liste (qui recalculent) : **niveau 3**. Le tableau de bord, lui, ne compte pas cet élève dans l'alerte nommée (nombreSeances 0) — deux écrans, deux verdicts. **Disposition proposée** : la garde de D-2 le couvre ; **et inscrire, à part**, la question du défaut « 100 % sans séance » (`indices.js:145`, `:191`) — il est lu par le contexte (« très favorable » à zéro donnée), par les moyennes du groupe et par les snapshots ; le passer à `null` touche des lecteurs qu'un lot RàI n'a pas à ouvrir.

### D-4 · Une seule évaluation faible : « Difficulté émergente » niveau 1 pour le suivi des fondations, niveau 3 pour la carte RàI – moyen – `[exécuté]`
Silence remet P1 à 55 (I, I, D). Fondations 0,40 < 0,70 → IPB 1, pas de précédent → « → » → **« Difficulté émergente », niveau RàI 1** (matrice IPB × direction). La carte RàI : P 0,55 < 0,64 → **niveau 3 « Difficulté persistante »**. La cible suit le suivi (niveau 1). Sur le même profil, « Niveau 3 – Intensif » en haut et « Difficulté émergente » dans « Développement des habiletés ». Ce n'est pas #551 (les unités et les sources sont les bonnes) : ce sont **deux paliers par deux règles**, celle des seuils IDME sur P et celle de la matrice sur les fondations, qui coexistent depuis le plan RàI d'avril sans qu'un écran dise laquelle prime. **Disposition proposée : inscrire et continuer** — décision de didactique (le skill `depistage-rai` documente les deux ; l'orthopédagogue en lira une).

### D-5 · L'incohérent : invisible aux écrans du groupe, calculé « à la volée » sur son profil – moyen – `[exécuté]`
Absent de `groupeEtudiants` : aucun indice stocké, absent des trois listes du Suivi du groupe (`_tousEtudiantsEnrichis` : 3). Si son profil s'ouvre (par un lien, une URL, l'ancien groupe) : `calculerTousLesIndices` retombe sur « Calcul à la volée » — **A 0, C 0, P 83** par `calculerPerformancePAN` (« les 3 meilleures notes » : (95 + 70) / 2), **la production fantôme comprise**. Le dépistage, lui, filtre `productionsIds` (nbArtefacts 1, performance 0,70) ; les moyennes par critère ne filtrent pas (Structure 0,825, la fantôme comprise). Trois chemins, trois périmètres. **Disposition proposée : inscrire et continuer** — avec F-2, qui emprunte le même repli.

### D-6 · #554 tenu – `[exécuté]`
Élève en décrochage : la cible rend « Difficulté persistante — Structure », jamais « Décrochage » (le troisième argument d'`interpreterMobilisation` n'est pas passé). Recoupé, rien de neuf.

---

## E · Interventions

### E-1 · Clés namespacées ; aucune intervention ne porte son groupe-cours – moyen – `[exécuté]`
`creerIntervention` écrit `test_interventions` (namespacée). L'objet n'a **aucun champ** `coursId` / `groupeCoursId`. Sous GC2 (`infoCours` et `groupeCoursActif` changés), `obtenirInterventions()` rend **la même liste** : la sous-section « Interventions » d'un groupe-cours montre celles de tous les groupes du trimestre, et `obtenirInterventionsEtudiant(da)` (profil, courbes, corrélations) les filtre par DA seulement. **Ce que l'enseignant verrait** : dans son groupe du mardi, les rattrapages du groupe du jeudi. **Disposition proposée : inscrire et continuer** (le namespacing par trimestre est acquis ; le tri par groupe-cours est un champ à écrire à la création et un filtre à la lecture).

### E-2 · Le transfert des présences d'un rattrapage – fonctionne comme codé, deux effets à nommer – `[exécuté]`
Rattrapage du 9 février (2 périodes), Absent présent : une fiche facultative `{ heures: 2 }` → `calculerAssiduite` lit `heures` comme des périodes (#728, recoupé) → **A 0,40 → 0,50**. Un rattrapage un mardi (hors séance) ne change rien (0,50). Silence, absent du cours ET du rattrapage, reçoit « Absence motivée RàI » à 0 : **sa séance sort du dénominateur** — A 0,90 (18/20) → **1,00 (18/18)**. Assidu, présent au cours ce jour-là : l'entrée est **rejetée par le contrôle de doublon** (`da + date + coursId`, sans regarder `facultatif`) — juste ici (il était en classe), mais un élève présent au cours ET au rattrapage le même jour perd sa présence facultative en silence. L'étiquette du formulaire dit « Durée (périodes) » (`:784`) : l'unité est la bonne à la saisie, c'est le champ `heures` de la fiche qui ment. **Disposition proposée** : l'absence motivée qui retire la séance est une règle (« motivée » = non due) — **à confirmer par Grégoire, inscrire** ; le doublon aveugle à `facultatif` : **inscrire, mineur** ; `heures` : #728.

### E-3 · Retirer l'élève du groupe : l'intervention garde son DA, sa note individuelle disparaît sans un mot – mineur – `[exécuté]`
`genererAffichageNotesIndividuelles` cherche l'élève dans le groupe ; introuvable → la note n'est pas rendue, **mais le compteur dit « 1 »**. La note reste en base. Une évaluation supprimée ne touche pas l'intervention (aucun lien ; `snapshotAvant` est figé) — `[lecture]`. **Disposition proposée : inscrire, mineur** (afficher « élève retiré du groupe » plutôt que rien).

### E-4 · La porte d'écriture : `db.setSync` direct, trois sites, zéro `sauvegarderDonneesSelonMode` – mineur – `[grep]`
Le mode anonymisation n'arrête aucune écriture d'intervention ni le transfert de présences. **Disposition : avec A-5.**

### E-5 · Le bilan avant/après traduit une moyenne en lettre par 0,85 / 0,75 / 0,65 écrits en clair – moyen – `[grep]`
`interventions.js:918-919` : `avant >= 0.85 ? 'E' : avant >= 0.75 ? 'M' : avant >= 0.65 ? 'D' : 'I'`. Ni l'échelle de l'utilisateur, ni `idme.*` (dont l'insuffisant vaut 0,64) : une lettre IDME pour tout le monde, et une borne qui contredit la configuration. C'est la famille de #575 (« le reste du codé en dur »), non listée là. **Disposition proposée : inscrire (rattacher à #575)**, avec C-8.

### E-6 · Les observations de l'intervention sont injectées dans un `<textarea>` sans `echapperHtml` – règle 1 – `[grep]`
`interventions.js:885` : `<textarea id="observationsIntervention" …>${intervention.observations || ''}</textarea>` ; six lignes plus bas, le bilan est échappé (`echapperHtml(bilan.observationsBilan || '')`). Un `</textarea>` dans le texte libre ferme le champ et le reste s'exécute ; le texte vient de l'enseignant (ou d'un import). **Disposition proposée : corriger maintenant** — règle 1 de `CLAUDE.md`, « sans exception », une ligne, sentinelle par mutation évidente. Grégoire arbitre ; si le lot attend, c'est la seule violation de la règle 1 trouvée dans le périmètre (hors les deux attributs de G-4).

---

## F · Suivi du groupe et Liste — les agrégats

### F-1 · Le panneau du Suivi du groupe enrichit chaque élève par les mêmes fonctions que le profil – fonctionne – `[exécuté]`
`calculerEtudiantsPrioritaires` : Assidu A 100 C 100 P 77 M 100 niveau 1 « Stable » IPB 0 ; Absent 40 · 100 · 63 · 70 · niveau 3 IPB 3 ; Silence 100 · 0 · 0 · 50 · niveau 3 « Non-participation ». Filtre « P < 65 % » → Silence, Absent (dans cet ordre d'urgence) ; « A+C < 65 % » → Silence. La barre RàI et la barre des patterns du groupe lisent `determinerNiveauRaiPedagogique` et `determinerCibleIntervention` (`[grep]` `:2825`, `:2682`) ; la Liste aussi (`etudiants.js:697, 708, 899, 1017`). **Les nombres du groupe sont la somme des profils** — donc ils portent les mêmes défauts (B-3, D-2).

### F-2 · Un élève exclu (décrochage) n'a plus d'indices stockés : son profil retombe sur « 3 meilleures notes » – moyen – `[exécuté]`
Absent en décrochage : `calculerEtStockerIndicesCP` et `calculerEtSauvegarderIndicesAssiduite` l'écartent → aucune entrée. Son profil (`calculerTousLesIndices`) lit **A = 0** (il a quatre présences) et **P = 70** par `calculerPerformancePAN` ((85 + 70 + 55) / 3) — la pratique dit **62,5**. Le profil d'un élève retiré des statistiques affiche un P calculé par une règle qui n'est pas la sienne. `#709` a rendu `null` le cache vide côté configurable ; ce repli-ci (`indices.js:447-459`) est un autre chemin. **Disposition proposée : inscrire et continuer** (« un élève exclu se calcule ou s'affiche “exclu”, pas les deux »), avec D-5.

### F-3 · Les élèves suivis vivent sous une clé NUE, réécrite au changement de groupe – moyen – `[exécuté]` `[grep]`
`CLE_SUIVI = 'etudiantsSuivis'` (`tableau-bord-apercu.js:34`), lue et écrite par `db.getSync/setSync` sans `cle()`, absente de `CLES_NAMESPACEES` (`trimestres.js`). `nettoyerEtudiantsSuivis`, appelée à chaque rendu du panneau, **retire les DA absents du groupe actif ET sauve** : une liste `[Assidu (GC1), 3000001 (GC2)]` devient `[Assidu]` dès qu'on regarde GC1. Un enseignant à deux groupes perd ses cinq suivis de l'autre groupe à chaque bascule ; deux trimestres la partagent. C'est la classe de #464 (clés nues par fallthrough). **Disposition proposée : inscrire et continuer.**

### F-4 · Deux « moyenne A » sur deux écrans – moyen – `[exécuté]` (filtres rejoués) `[lecture]`
Silence sans aucune fiche alors que le groupe a saisi dix séances : A = 0. Le Suivi du groupe (`afficherMetriquesGlobales:1489`, `nombreSeances > 0`) l'inclut : moyenne (100 + 40 + 0) / 3 = **46,7**. La Liste (`etudiants.js:951-960`, « a une fiche dans le cours ») l'exclut : (100 + 40) / 2 = **70**. Deux écrans côte à côte, deux moyennes, et l'infobulle de la Liste explique son dénominateur (« actifs avec présences saisies ») — l'autre non. **Disposition proposée : inscrire et continuer** (une règle : l'absent total compte-t-il ? — la même question qu'A-2).

### F-5 · Tri et filtres au rechargement – `[lecture]`
Liste : colonnes visibles en `sessionStorage` (`liste-colonnes-visibles`), tri (`triActuel`) et filtres (selects) en mémoire — perdus au rechargement, ce qui est le comportement d'une vue. Suivi du groupe : `_filtresActifs` en mémoire ; élèves suivis en base (F-3). Un élève de l'autre groupe-cours du même trimestre : filtré par `coursId`/groupe partout où `obtenirEtudiantsCoursActif` est lu (F-1, snapshots `:508`) — sentinelle #330.

---

## G · Ce qui sort — et ce qui ne doit pas sortir

### G-1 · Le rapport du profil – rien du volet confidentiel – `[exécuté]`
Avec un volet confidentiel rempli (services adaptés, « Dyslexie », notes « NOTE-SENSIBLE-BANC », portrait « fragile ») et une note de présence, le rapport (huit lignes) commence par « Alice Assidu (DA: 2000001) » et **ne contient aucun de ces mots**. Il porte le DA (retiré en mode anonymisation, `estModeeLectureSeule`). Ses nombres : B-5.

### G-2 · Le snapshot d'archivage – rien du volet confidentiel ; son P historique n'est pas celui de l'élève – MAJEUR (recoupe #716, l'élargit) – `[exécuté]` `[grep]`
`capturerSnapshotSeance('2026-03-16')` écrit `test_snapshots_GC1` (namespacée par trimestre ET groupe-cours) ; par élève : `{ da, nom, A, A_cumulatif, C, P, pattern: 'Non calculé', rai: 'Non calculé' }` — **rien d'autre** ; « NOTE-SENSIBLE-BANC » absent du JSON. C : deux travaux dus, Assidu 2/2 = 100 ✓. **P : 67 pour l'assidu, 67 pour l'absent.** Le repli (`snapshots.js:226-243`) filtre les évaluations par production, statut, note et échéance — **jamais par `etudiantDA`** (`[grep]` sur le bloc : false) : quand `calculerPerformanceHistorique` rend `null` (la sommative lit `e.da` / `e.note`, champs qui n'existent pas — #716 ; SPE et DEN n'ont pas la méthode), la moyenne IDME en dur porte sur **toutes les évaluations du groupe dues à cette date** : (40 + 65 + 100 + 65 + 65) / 5 = 67. **Ce que l'enseignant verrait** : les courbes P individuelles de « Développement des habiletés » et le spaghetti du groupe **identiques pour tous les élèves d'un cours sommatif**, et la moyenne du groupe égale à chaque courbe. **Disposition proposée : inscrire — élargir #716**, dont c'est la même racine ; le filtre par DA est une ligne, mais le repli entier est ce que #716 doit retirer. **Break-test M2** : ajouter le filtre ne rougit que ce banc.

### G-3 · La consolidation – fonctionne, rien du volet confidentiel – `[exécuté]`
Repère de maîtrise lu sur l'échelle (0,75, `deduite: false`). Assidu : Structure et Nuance consolidées à « Dissertation », Rigueur à « Analyse 2 » ; Absent : trois « non consolidé avec tentatives » ; Silence : `null`. Elle lit `evaluationsSauvegardees`, `productions`, `infoCours` et l'échelle — pas le volet.

### G-4 · Le volet confidentiel : un seul lecteur ; le mode anonymisation ne l'anonymise pas ; deux attributs non échappés – moyen – `[grep]` `[lecture]`
`grep -rn "confidentielEtudiants\|servicesAdaptes\|sousCategorie\|portraitStructure"` sur neuf fichiers de sortie (rapport, snapshots, export CSV, synthèse PDF, export-pdf, consolidation, tableau de bord, liste, graphiques) → **aucun** ; dans `js/` entier, le seul autre lecteur de la clé est `trimestres.js:129` (la liste des clés namespacées). Aucun `console.*` du module ne porte les données. **Ce qui ne tient pas** : `anonymiserDonnees` (`modes.js:865`) ne traite que `groupeEtudiants`, `evaluationsSauvegardees`, `presences` — **ni `confidentielEtudiants`, ni `interventions`** ; `ouvrirModalConfidentiel` lit `db.getSync(cleConfidentiel)` et `db.getSync(clePresences)` bruts, et le bouton « Confidentiel » (`sections-affichage.js:1172`) n'a aucune garde de mode. En mode anonymisation (projection en classe, capture pour un collègue), le nom est « Élève 7 », **les notes libres, les portraits et les notes de présences sont les vrais**. Et `chargerNotesPresencesConfidentiel` interpole `data-date="${p.date}"` et `data-da="${da}"` sans `echapperHtml` (le contenu du `<textarea>`, lui, est échappé par un `escapeHtml` local). **Le codex complet** (`db.keys()` moins `_*`) emporte `<trimestre>_confidentielEtudiants` avec tout l'espace : c'est la sauvegarde personnelle, attendu ; le **codex data** (`codex-data.js`) est construit à partir d'archives de groupe-cours et porte `anonymise: false` en métadonnée — sa liste de clés n'a pas été relue ici (voir « non regardé »). **Disposition proposée : inscrire et continuer, un item « le volet confidentiel et le mode anonymisation »** (masquer le bouton ou anonymiser le contenu ; échapper les deux attributs). Rien ne « sort » sans geste de l'enseignant : moyen, pas critique.

### G-5 · #539 tenu – `[grep]`
Les cinq identifiants `confidentiel-portrait-structure / -rigueur / -plausibilite / -nuance / -francais` sont là (module et `index.html:15037-15077`). Recoupé.

### G-6 · La synthèse PDF et l'export CSV – rien du Suivi – `[grep]`
`synthese-retroaction-data.js` : zéro occurrence de `calculerTousLesIndices`, `determinerNiveauRai`, `assiduite`, `interventions`, `confidentiel` — le bilan de l'élève ne lit pas le Suivi. `export-resultats-finaux.js` : colonnes DA, nom, prénom, groupe, cours, trimestre, pratique, note finale, statut, « Non comptées » — ni A, ni C, ni RàI.

---

## H · Les graphiques — cinq mesures

### H-1 · Les courbes par critère et les habiletés convertissent I/D/M/E en 40 / 65 / 75 / 100 écrits en dur – moyen – `[exécuté]`
`obtenirDonneesCriteres` (`graphiques-progression.js:2447-2460`) et `niveauHabiletesVersDecimal` (`:3782-3800`) : Structure de l'assidu → `[65, 65, 75, 100]` — **juste chez Grégoire par coïncidence** (ses valeurs sont 40/65/75/100) ; pour l'échelle A/B/C → `[null, null]`, `niveauHabiletesVersDecimal('B')` → `null` : **courbe vide**, sans message. Deux tables IDME de plus, hors de l'inventaire de #575 (`grep -n "obtenirDonneesCriteres\|niveauHabiletesVersDecimal" BACKLOG.md` → 0). **Disposition proposée : inscrire (rattacher à #575).**

### H-2 · Les zones colorées viennent de « la première échelle du trimestre » – mineur – `[exécuté]`
`genererZonesDepuisEchelle` lit `echellesTemplates.find(parDefaut) || [0]` : avec deux échelles (60-75-90 puis IDME0), les zones sont celles de la première (D dès 0,60), quelle que soit celle des évaluations. **Disposition proposée : inscrire, mineur (#575).**

### H-3 · Un élève sans donnée : `null`, pas une courbe à zéro – fonctionne – `[exécuté]`
`obtenirDonneesCriteres(Silence)` → `null` ; `obtenirSnapshotsEtudiant` → `[]` ; `creerGraphiqueIndividuel` refuse sans snapshot (`[lecture]`).

### H-4 · Les courbes A-C-P lisent les snapshots – recoupe G-2 / #716 – `[lecture]`
`creerGraphiqueIndividuel` et le spaghetti du groupe tracent `snapshot.etudiants[].A/C/P` : le P historique de G-2 est ce qu'ils montrent.

### H-5 · Ce que les sentinelles protègent – quatre mutations, suite complète relancée – `[exécuté]`
Chaque fichier muté puis restauré par copie, empreinte SHA-256 identique, `git status -- js/` propre. Script hors dépôt (`scratchpad/break-tests-suivi.py`).

| mutation | fichier | ce qui rougit (478 fichiers / 5 374 tests) |
|---|---|---|
| M1 · `!e.remplaceeParId` ajouté à `_filtrerEtTrierEvaluationsIPB` | `profil-etudiant-calculs.js:1085` | **ce banc seul** (B-3) |
| M2 · `if (e.etudiantDA !== da) return false;` dans le repli des snapshots | `snapshots.js:227` | **ce banc seul** (G-2) |
| M3 · `window.obtenirDetailsAssiduite = …` exporté | `profil-etudiant-sections-affichage.js:4770` | **ce banc seul** (B-5) |
| M4 · la branche « Non-participation » désactivée | `profil-etudiant-calculs.js:1790` | **ce banc seul** (D-2, D-3, F-1 : 4 cas) |
**Aucune sentinelle existante ne verrouille ces quatre comportements**, ni le défaut ni sa correction : les sentinelles du dépistage (#541, #542, #550, #552, #555) mordent sur les unités, les échelles et les seuils, pas sur le périmètre des évaluations comptées ni sur le cas « aucune donnée ». Ce banc les fige désormais aux valeurs d'aujourd'hui ; le jour d'un correctif, ses `expect` passent aux valeurs d'après (patron des deux bancs précédents).

---

## Ce qui fonctionne, avec la preuve

- **La chaîne présences → A** : quatre élèves, les nombres à la main (A-1) ; congé, séance sans saisie, date future, autre groupe-cours (A-3) ; les six constats de mai corrigés (A-4).
- **La chaîne évaluations → C et P** pour les données propres, et le même P sur le tableau de bord, la Liste et le profil (B-1, B-5, F-1) ; « non constructible » plutôt que 0 pour l'élève sans évaluation (#709).
- **IPB × direction, patterns, palier, cible, contexte** rendent le palier calculé à la main pour l'assidu et l'absent (C-1, C-2), et le Suivi du groupe les agrège par les mêmes fonctions (F-1).
- **La consolidation lit le repère de maîtrise de l'échelle** et le dit quand il est déduit (G-3, C-3) — #555 tient.
- **L'incohérent est invisible aux écrans du groupe** (D-5) et ses présences d'un autre groupe-cours ne contaminent pas celui-ci (A-1).
- **Le volet confidentiel ne sort dans aucun flux du Suivi** : rapport, snapshots, consolidation, CSV, PDF, graphiques, console (G-1, G-2, G-3, G-4, G-6).
- **Les interventions sont namespacées par trimestre** (E-1) ; le transfert des présences d'un rattrapage augmente l'assiduité de qui y était (E-2).
- **#541, #554, #539, #706 (pour la note du cours) tiennent** ; #555 lot 2 tient (G-3) ; #330 (deux groupes) n'a pas été rejoué mais son filtre est celui que le banc traverse.
- **Un élève sans donnée n'a pas de courbe à zéro** (H-3).

## Ce que je n'ai pas regardé

- **Le navigateur.** Aucune spec Playwright n'a tourné ; les écrans sont des chaînes ou des structures (`calculerEtudiantsPrioritaires`, `genererAffichageNotesIndividuelles`, `genererRapportAPI`), jamais un DOM rendu : les couleurs, les infobulles, le « — » d'un P non constructible, la barre RàI dessinée, le formulaire d'intervention (`ouvrirIntervention` exige une vingtaine d'éléments) et le modal confidentiel ne sont pas éprouvés. E-6 et les attributs de G-4 sont établis sur le source, pas par une injection exécutée.
- **Les données réelles de Grégoire** (interdit par le prompt) : combien de reprises (B-3), d'élèves arrivés en cours de trimestre (A-2), de « non-remis » à 0 (B-4), d'interventions sans groupe (E-1), et si sa liste de suivis a déjà été vidée (F-3) ; A2025 et H2026 ne se rouvrent pas.
- **`etudiants.js` (la Liste) n'est pas chargé dans le banc** : ses lectures de `calculerTousLesIndices` et `determinerNiveauRaiPedagogique` sont établies par `grep`, ses moyennes rejouées à la main (F-4) ; `calculerAssiduitéGlobale` (`:203`, une seconde formule d'assiduité sur les seules fiches de l'élève) **n'a aucun appelant** (`grep -rn "calculerAssiduitéGlobale(" js/` → sa définition) — code mort, non mesuré.
- **`trimestre-v2-etudiants.js`** : le statut « décrochage » est lu (D-6, F-2), pas le geste qui le pose.
- **Le calendrier et l'horaire réels** (`horaire.js`, `trimestre.js`) : miroirs ; la reprise (jour remplacé), les congés collectifs saisis dans le calendrier, `genererSeancesCompletes` — geste 1, éprouvé par Grégoire.
- **La capture hebdomadaire automatique** (`verifierEtCapturerSnapshotHebdomadaire`), la reconstruction rétroactive, `mettreAJourSnapshotIntervention` : seule `capturerSnapshotSeance` a été exécutée.
- **Le codex data** (`codex-data.js`) : quelles clés une archive de groupe-cours porte, et si `confidentielEtudiants` en fait partie — non relu ; `anonymise: false` est écrit en dur dans ses métadonnées (`:336`).
- **Le rapport de bug** (`rapport-bug.js`) : il lit `groupeEtudiants` et `presences` (`:442`, `:516`) pour un état ; ce qu'il emporte exactement n'a pas été relu.
- **Les corrélations** (`correlations-longitudinales.js`, `impact-jetons.js`, les `r` de la Liste) : lues comme lecteurs des snapshots (#729, #716), non rejouées.
- **Le mode « cours » (tous les groupes fusionnés)** de `modes.js` : le banc n'a qu'un groupe par cours.
- **`docs/modules/depistage-et-suivi.md`** (avril) : nomme encore `profil-etudiant.js` et une fenêtre d'analyse de 4 ; l'écart avec le code (fichiers éclatés, fenêtre 3) est celui que le rapport du 31 août (§4.5) a déjà daté.

## Rien d'appliqué — au moment de l'audit

Aucun fichier de `js/` n'est modifié (`git status -- js/` propre après les quatre mutations restaurées ; empreintes SHA-256 identiques). La branche `audit/onglet-suivi-2026-09-05` porte ce rapport, le banc `tests/unit/audit-onglet-suivi-2026-09-05.test.js`, les dispositions écrites dans `Rapports/ultrareview-lot-6-travaux-saisie.md` et `Rapports/AUDIT-decouplage-srpnf-idme-conception-2026-08-27.md`, le prompt passé à `statut : exécuté`, et la section « LE SUIVI » d'`OU-EN-EST-ON.md`. Elle se fusionne vers `main` (documents et banc seulement, comme la consigne le dit) une fois le run GitHub de 1.122.1 lu. **Les dispositions ci-dessus sont des propositions : Grégoire arbitre avant tout lot**, et chaque constat recevra alors, dans ce fichier, *inscrit* (n°), *refusé* (motif) ou *périmé*.

**Récapitulatif des dispositions proposées** : *corriger maintenant* — B-3 (la remplacée comptée par le dépistage), B-5 (le rapport du profil), D-2 (« Non-participation » avant le premier travail), E-6 (le `<textarea>` non échappé) ; *inscrire* — A-2, A-5 + E-4, B-2, B-4 (dans le cadrage « non remis »), C-5, C-6, C-7, C-8 + E-5 (seuils en dur, item 5 du §9 du 27 août), D-3, D-4, D-5 + F-2, E-1, E-2 (deux règles), E-3, F-3, F-4, G-2 (élargir #716), G-4, H-1 + H-2 (#575) ; *recoupés, tenus* — C-3 et C-4 (#551), D-6 (#554), G-5 (#539), E-2 heures (#728) ; *commenter et oublier* — le `parseInt` d'A-4.

**Trouvaille hors périmètre, rapportée par le rituel d'ouverture** : `OU-EN-EST-ON.md` est absent de `paths-ignore` dans `.github/workflows/tests.yml` (l. 106-125 ; `RELAIS.md` et `SESSION.md` y sont) — chaque commit de clôture qui le touche déclenche un run Vitest. Sans conséquence sur un verdict. **Disposition proposée : inscrire, mineur** (ou commenter).
