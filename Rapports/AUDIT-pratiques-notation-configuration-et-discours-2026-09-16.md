# AUDIT – Les pratiques de notation : une personne qui suit le labo pas à pas obtient-elle la note que l'application lui a annoncée, et sinon, est-ce la phrase ou le code qui ment ?

**Date** : 16 septembre 2026, 16 h 20 – 17 h 00.
**Cadré par** : `Rapports/prompts-audit/PROMPT-AUDIT-pratiques-notation-configuration-et-discours-2026-09-16.md` (Claude Code, validé par le lancement de Grégoire, 16 h 15). Prérequis lu : `Rapports/AUDIT-pratique-de-notation-2026-09-05.md` (fermé, 1.122.0) — **le calcul n'est pas remesuré**, ses nombres sont repris tels quels ; `Rapports/COMPTE-RENDU-documentation-pratiques-notation-2026-09-16.md` (l'état de la doc).
**Base auditée, mesurée** : worktree `.claude/worktrees/audit-pn-0916`, branche `audit/pratiques-notation-2026-09-16`, `git rev-parse --short HEAD` = `57d0c3f0` (= `main` local, en avance de 2 sur `origin/main` : 1.142.16, commitée par une autre session à 16 h 15, non poussée) ; `cat version.json` = `{"build":"0916-1615","beta":"1.142.16"}`.
**Vitest, depuis `tests/`** : 576 fichiers / 6 448 tests verts avant le banc ; **577 fichiers / 6 456 verts avec lui**, code 0.
**Playwright WebKit** : la spec du parcours, 4 essais / 4 verts (8,7 s). **Chrome de Grégoire** : le parcours STD rejoué sur `http://127.0.0.1:8765` (serveur local sur le worktree, stockage de test effacé ensuite), deux captures dans `Rapports/captures/`.
**Mode** : lecture seule sur `js/`, `docs/`, `.claude/` (**rien d'appliqué**). Trois bancs : (1) `tests/unit/audit-pratiques-notation-config-2026-09-16.test.js`, **8 mesures**, l'ASSISTANT RÉEL (`wizard-pratique-v2.js`) et la bibliothèque chargés dans le bac à sable du 5 septembre, à côté du moteur ; (2) `tests/integration/audit-pratiques-notation-parcours-2026-09-16.spec.js`, le parcours du labo dans la page réelle, quatre familles ; (3) huit break-tests (mutations posées, sous-ensemble de 41 fichiers, restauration vérifiée par empreinte). Deux inventaires de lecture par agents (les trois écrivains et le lecteur ; les phrases de l'application), recoupés ici.
**Verdicts** : `[exécuté]` = fonction réelle appelée, valeur citée = valeur rendue ; `[page]` = mesuré dans le navigateur, page réelle ; `[lecture]` ; `[grep]`.

```
cd tests && npx vitest run unit/audit-pratiques-notation-config-2026-09-16.test.js
cd tests && npx playwright test integration/audit-pratiques-notation-parcours-2026-09-16.spec.js --project=webkit
```

---

## DISPOSITIONS — arrêtées le 17 septembre 2026 (lot 28, `1.142.24`)

> Un audit n'est pas terminé quand il est déposé : chaque constat porte ici *livré*, *inscrit* (n°), *refusé* ou *périmé*. Périmètre du lot choisi par Cowork à la demande de Grégoire : ce qui ne lui demande ni mot ni vérification à l'écran.

| Constat | Disposition |
|---|---|
| A-1 | **LIVRÉ en 1.142.25 (lot 29) pour le VERROU** — « brancher », tranché par Grégoire le 17 sept. ⚠ Constat corrigé à la mesure : « le moteur les applique déjà » était faux (`calculerNoteFinale` n'a aucun appelant) ; le verrou s'applique désormais dans le chemin vivant (87,43 → 50 au profil et à l'export). Plafonnement, remplacement, reprises : l'assistant ne collecte pas de quoi les appliquer — **inscrit #903** |
| A-2 | **LIVRÉ en 1.142.25 (lot 29)** — les six champs sont relus (et les deux du portfolio sommatif, même défaut) ; diff de réédition vide. #854 reste ouverte pour les jetons et A-4 |
| A-3 | le trou du cache : **LIVRÉ en 1.142.24** (`_lireIndiceStocke` rend `null` si `noteConstructible === false` ; « non constructible » aux deux passes, banc A3 et parcours WebKit E-SPE devenus sentinelles). Le reste (ni types ni forfaits, récapitulatif muet) : **LIVRÉ en 1.142.25 (lot 29, #899)** — le récapitulatif dit où les régler (texte choisi par Grégoire) ; chemin remesuré dans la page |
| A-4 | **inscrit sous #854** (élargie au seuil) |
| A-5 | **inscrit sous #715** (tenu), avec l'attribut contradictoire du Comparateur |
| A-6 | **inscrit sous #717** (tenu) |
| A-7 | **inscrit #900** |
| A-8 | **inscrit sous #339** |
| B-1 | **inscrit #898 — VOLET ARRÊTÉ, puis TRANCHÉ par Grégoire le 17 sept. (l'adoption demande l'échelle ; texte choisi, sous la fiche) : lot à part.** Mesuré : la « candidate unique » existe comme notion (`obtenirEchelleResolue()` sans id), mais le pack porte deux échelles ; le parcours visé n'en a donc jamais. La suite demande une phrase (Grégoire) |
| B-2 | **LIVRÉ en 1.142.24** (`recents` et `recents-meilleurs` dans la table de relecture ; `approcheEvaluation` déduite du portfolio). ⚠ **Le constat est corrigé sur un point** : mesuré sous WebKit le 17 sept., le portfolio ne disparaissait PAS dans la page — l'étape « Approche d'évaluation » (carte pré-cochée, #443) repose la valeur avant l'enregistrement ; seul le banc, qui enregistre sans traverser les étapes, le perdait. Le défaut réel à l'écran était l'autre moitié : « N plus récentes » relue et ré-enregistrée « N meilleurs » |
| B-3 | **inscrit sous #713** (élargie aux pratiques configurées) |
| B-4 | **commenté dans le code** (`pratiques-bibliotheque.js`, seuils du « Modèle sommatif ») et oublié |
| C-1, C-2, C-3, C-6 | **LIVRÉS en 1.142.25 (lot 29, #901)** — les quatre textes choisis par Grégoire le 17 sept., posés tels quels ; une sentinelle lit les textes et l'absence des anciens |
| C-4, C-5 | **inscrits sous #810** (C-5 tenu, ⛔ ne rien changer) |
| C-7 | pas un constat (matériau du labo) |
| D-1 | **inscrit sous #710** |
| D-2 | **inscrit sous #339** (dette G2-b) |
| D-3 | **inscrit sous #483** (tenu) |
| E-1 | **inscrit sous #723** (tenu) |
| F | **inscrit sous #804 et #805** ; documentation non touchée |
| G-1 | **LIVRÉ en 1.142.24** — sentinelle du tour complet par famille, dans le banc de l'audit ; G1 à G8 rejouées : **huit rouges sur huit** |

Trouvaille du lot, hors audit : deux lecteurs de l'ancien format double d'`indicesCP` — **inscrit #902**, **livré en 1.142.30** (lot 33 : l'export rend les vrais indices ; le second lecteur était du code mort, retiré).

---

## Vue d'ensemble : la réponse à la question directrice

**Pour STD et DEN, oui** : le parcours complet (créer par l'assistant, appliquer, deux copies évaluées, profil, export) rend le nombre annoncé — 75,7 pour « les 4 derniers », 78 pour un jugement aux deux cibles — dans le bac à sable, sous WebKit et dans le Chrome de Grégoire. **Pour SOM, le nombre est juste mais deux phrases mentent** : les règles spéciales que l'assistant promet (« doit être réussie pour passer », plafonnement, remplacement) ne sont jamais appliquées. **Pour SPE, le parcours du labo produit un « 0, final » à l'export pour chaque élève** : l'assistant ne collecte ni types de travaux ni forfaits, la pratique n'a pas d'instance, et le cache d'indices relu prend un 0 « non constructible » pour une note. **Et « Partir d'un modèle », le premier geste du labo, est le plus fragile** : un modèle STD adopté calcule au profil mais rien à l'export ; rouvert par l'assistant, il ne peut être enregistré qu'en choisissant une échelle, et ce geste efface tout son portfolio.

| # | Flux | Constat | Gravité | Verdict | Disposition proposée |
|---|---|---|---|---|---|
| A-1 | A | **SOM : les règles spéciales de l'assistant ne sont jamais lues** — `configuration.conditions_speciales` / `remplacement` / `reprises` ; le moteur ne lit que `calcul_note.conditions_speciales` (4 sites). Un verrou « Dissertation < 90 → max 50 » laisse la note à 87,43 ; export 88 « final » | **majeur** (l'app promet une règle qu'elle n'applique pas ; pas de note fausse tant que la règle n'est pas attendue) | `[exécuté]` A1 · `[page]` E-SOM | **inscrire** — brancher ou retirer l'étape « règles » ; le labo ne promet pas ces règles |
| A-2 | A | SOM rééditée par l'assistant : nbPaires 3 → 2, verrou (Dissertation/90/50) → (Analyse finale/60/55), plafonnement (« Examen non remis »/50) → (''/55) | moyen | `[exécuté]` A1 | **inscrire** sous #854 (élargi à SOM) |
| A-3 | A · E | **SPE créée par l'assistant : ni `typesTravaux` ni `forfaits`** → pas d'instance ; 1re passe « non constructible » (cache P 0), **2e passe : 0 « final » à l'export** (`_lireIndiceStocke` ignore `noteConstructible:false`) | **majeur** (une note 0 remise à toute une classe) | `[exécuté]` A3 · `[page]` E-SPE | **corriger maintenant** le trou du cache (deux lignes : `_lireIndiceStocke` rend `null` si `noteConstructible === false`) ; **inscrire** l'absence de types/forfaits dans l'assistant (#319) — et le récapitulatif doit dire OÙ les régler |
| A-4 | A | SPE rééditée : seuil 70 → **100**, jetons perdus, modèle de forfaits perdu | moyen | `[exécuté]` A3 | **inscrire** sous #854 (b), élargi au seuil |
| A-5 | A | STD « tous » : le chemin riche coupe à `nombreARetenir` (76,75 = 4 sur 5) ; l'attribut du Comparateur dit « 4 retenu(s) sur 2 minimum » à côté de « tous » | moyen | `[exécuté]` A2b | **recoupé #715, tenu** — ajouter l'attribut contradictoire à la fiche |
| A-6 | A | DEN : retirer la première cible dans la zone de texte décale les ids ; une cible non confirmée disparaît, la note passe de 59 à 78 sans un mot | moyen | `[exécuté]` A4 | **recoupé #717, tenu** |
| A-7 | A | Champs écrits par l'assistant sans aucun lecteur : `varianteCalcul` (hors miroir), `portfolio.hybride`, `portfolio.reprisesPermises` (lu seulement par une phrase), `afficherRang`, `afficherMoyenneGroupe`, `reglesSommatives`, `configuration.portfolio{nbArtefacts,qualitatif}` (SOM), `modeleBundle` ; le formulaire écrit `jetons.delaiActif`/`repriseActif` que rien ne lit | mineur | `[grep]` (inventaire) | **inscrire** regroupé « champs sans lecteur » (zéro-dette) |
| A-8 | A | L'assistant lit `modalitesEvaluation.categories` (global) pour écrire la config d'une pratique | mineur | `[lecture]` `wizard-pratique-v2.js:2760-2769` | **recoupé #339** |
| B-1 | B | **Modèles STD (« N meilleures », « N plus récentes ») adoptés : pas d'instance** (pas d'`echelleId` → « Champ obligatoire manquant : echelle ») → le profil calcule (77,32, chemin riche) mais `simulerIndices` rend `null` : **export « non constructible », Comparateur muet, profil 77,32** | **majeur** (deux écrans se contredisent sur le premier geste du labo) | `[exécuté]` B1 | **inscrire** — les modèles STD portent une échelle, ou l'adoption exige l'échelle |
| B-2 | B | **Modèle STD adopté, rouvert par l'assistant** : sans échelle, l'enregistrement est refusé ; avec une échelle (seul geste qui débloque), **le portfolio entier disparaît** (`approcheEvaluation` absent du gabarit → bloc non écrit) → « configuration de portfolio absente », non constructible. Et la réponse relue de « recents » est « n_meilleurs » (`methodeVersMode` ignore `recents` et `recents-meilleurs`) | **majeur** (le geste « partir d'un modèle puis ajuster » détruit le modèle) | `[exécuté]` B2 | **corriger maintenant** (deux lignes dans `chargerPratiqueExistante` : `approcheEvaluation` par défaut `'par-artefacts'` quand `config.portfolio` existe ; table `methodeVersMode` complète) |
| B-3 | B | « Modèle simple » SPE, adopté : un élève qui n'atteint aucun forfait reçoit **50 « final »** (plancher codé en dur dans `_determinerPalierBundle`, le gabarit n'a pas de palier plancher) | moyen | `[exécuté]` B1 | **recoupé #713, élargi** : le plancher touche les pratiques configurées, pas seulement le registre |
| B-4 | B | « Modèle sommatif » : `seuils {vaBien, difficulte, grandeDifficulte}` (camelCase) non lus par la configurable (`va_bien`…) ; sans effet (mêmes valeurs que les défauts) | sans effet | `[exécuté]` B1 | **commenter et oublier** |
| C-1 | C · E | **Récapitulatif STD** : « Variante : Par artefacts (**N meilleurs**) » et, dix lignes plus bas, « Construction de la note : **N derniers** artefacts » — le même écran, dans WebKit et dans le Chrome de Grégoire (capture) | moyen (mots que les collègues lisent) | `[page]` E-STD, Chrome | **inscrire** → **Grégoire** (la variante est un libellé figé `n-meilleurs` : le retirer ou le dériver de la méthode) |
| C-2 | C | `guides-pedagogiques.js:329` : « La dénotation est **conçue mais pas encore activable** » — l'assistant la crée depuis juin (voie rapide, `config-denotation`), et le parcours E-DEN le prouve | moyen (mots des collègues) | `[grep]` · `[page]` | **inscrire** → **Grégoire** (une phrase) |
| C-3 | C | PAN / PRÉN : le guide (`:306-307`) dit que DEN est une PRÉN et que le badge « PAN » est un raccourci ; le glossaire (`terme.js:418`) dit « PAN regroupe STD, SPE et DEN » ; le badge dit « PAN – Dénotation » | mineur (assumé, skill §2 bis) | `[grep]` | **commenter et oublier** — l'approximation est écrite ; une ligne dans le glossaire suffirait, à Grégoire |
| C-4 | C | « Cibles atteintes » employé pour SPE (`terme.js:400`, `popup.js:237`) alors que `construction-attributs.js:177,190` rend SPE « Non couvert (la note se rapporte à des instruments) » | mineur | `[grep]` | **inscrire** sous #810 (discours « cibles ») |
| C-5 | C | STD rapporté aux cibles dans la carte « Choisir ta pratique » (`index.html:10746`) ; le Comparateur dit « Artefacts (instruments) » + « Non couvert » | — | `[grep]` | **recoupé #810, tenu** — ne rien changer (⛔ dans la fiche) |
| C-6 | C | L'indice P est défini comme « selon la pratique active (PAN – Standards, Sommative, ou une pratique personnalisée) » (`guides-pedagogiques.js:140`) : SPE et DEN absents | mineur | `[grep]` | **inscrire** → Grégoire (une phrase) |
| C-7 | C · E | Profil SOM et SPE : « le calcul … n'est pas encore branché » ; la note ne se lit qu'à l'export et par l'indice P | — (tenu, skill §9) | `[page]` E-SOM, E-SPE | **matériau du labo**, pas un constat |
| D-1 | D | Changer de pratique n'invalide pas `indicesCP` : l'indice de l'ancienne pratique (76) reste affiché sous la nouvelle jusqu'au premier recalcul ; **retirer la pratique laisse un indice 76 « constructible »** pendant que le profil dit « aucune pratique assignée » | moyen | `[exécuté]` D1 | **inscrire** (recoupe #710 pour le repli) |
| D-2 | D | « Appliquer au cours actif » écrit ENCORE le miroir `modalitesEvaluation` (`specifications.*`, `portfolio`, `varianteCalcul`, `configurationSTDAppliquee`) que seul l'assistant relit (A-8) | mineur | `[lecture]` `pratiques-bibliotheque.js:537-575` | **recoupé** dette G2-b (`PLAN-refonte-note-finale-portfolio.md`) |
| D-3 | D | Sous SOM, les six artefacts STD à pondération 0 pèsent 1 chacun (85 au lieu de 87,43) | — (tenu, skill §10) | `[exécuté]` D1 | **recoupé #483, tenu** — matériau du labo (« changer de famille ne change pas seulement la règle, mais ce qui compte ») |
| E-1 | E | L'export arrondit (87,6 → 88, 75,7 → 76) | mineur | `[page]` | **recoupé #723, tenu** |
| F | F | `docs/modules/pratiques.md` faux ; `labo-codex` §5 : 14 → 15, ids legacy, « Seuils critiques » retiré ; skill §5 ne dit pas que SPE s'écrit `forfaits` ; §12 journal ; #805 | — | `[lecture]` | dispositions au § F |
| G-1 | G | **Cinq mutations sur huit ne rougissent rien** : forcer « meilleurs » dans l'assistant (G1) ET dans le formulaire (G6), changer le seuil SPE par défaut (G3), les ids de cibles DEN (G7), le minimum du portfolio (G8) | moyen | `[exécuté]` break-tests | **inscrire** : une sentinelle du tour complet (la méthode de sélection écrite est celle relue et celle calculée) |

**Recoupements avec les fiches ouvertes** (à ne pas redécouvrir) : #715 (A-5), #717 (A-6), #339 (A-8), #713 (B-3), #810 (C-4, C-5), #710 (D-1), #483 (D-3), #723 (E-1), #854 (A-2, A-4 l'élargissent). #804/#805 : § F.

---

## A · Trois écrivains, un lecteur — le tour complet d'une configuration

**Le lecteur** (`construireConfigComplete`, `pratique-registre.js:239-333`, puis `PratiqueConfigurable`) lit `p.config.X` → `p.X` → parfois `p.configuration.X` : `echelleId`, `type`, `calcul_note` (défaut **par famille**, pas plus « conversion_niveaux » pour tous — le skill §10 est en retard d'une version), `seuils`, `portfolio`, `objectifs`, `jetons` (⚠ pas `configuration.jetons` ici — c'est `obtenirConfigJetonsPratique` qui le lit en priorité 1), et `configuration` en passe-plat. `PratiqueConfigurable` lit ensuite `typesTravaux`/`tableBundles`/`forfaits`/`seuilAcceptable`/`seuilAcceptabilite` sous `configuration`, et **`calcul_note.conditions_speciales`** pour les règles spéciales.

### A-1 · SOM : ce que l'assistant promet et n'écrit pas là où le moteur lit – majeur – `[exécuté]` A1, `[page]` E-SOM
À la main : l'assistant écrit `configuration.remplacement.nbPaires = 3`, `configuration.conditions_speciales = [double_verrou {Dissertation < 90 → note_max 50}, plafonnement {50}]`, `configuration.reprises = {permises:true, mode:'limite'}`. `grep -rn conditions_speciales js/pratiques/pratique-configurable.js` → 4 sites, tous sous `this.config.calcul_note`. Obtenu : `inst.config.calcul_note.conditions_speciales` = `undefined` ; note 87,43 (84 < 90 sans effet) ; dans la page, export **88 « final »** avec le verrou coché. L'assistant affiche pourtant « Une évaluation spécifique (ex : la finale) doit être réussie pour passer le cours » (`wizard-pratique-v2.js:487-489`) et le Comparateur « Actif (une évaluation doit être réussie) » (`construction-attributs.js:251`).
**Disposition proposée : inscrire.** Deux issues à trancher (Grégoire, pédagogie) : brancher `configuration.conditions_speciales` → `calcul_note.conditions_speciales` dans `construireConfigComplete` (le moteur les applique déjà), ou retirer l'étape. Le labo, en attendant, ne promet pas ces règles.

### A-2 · SOM rééditée : les valeurs reviennent aux défauts – moyen – `[exécuté]` A1
`chargerPratiqueExistante` restaure `reglesSommatives`, `reprises.mode`, les seuils, `afficherRang`, mais **pas** `nbPairesRemplacement`, `nomEvalVerrouillee`, `seuilVerrou`, `plafondVerrou`, `conditionPlafonnement`, `valeurPlafonnement`. Obtenu, diff avant/après : `remplacement.nbPaires` 3 → 2 ; verrou (Dissertation, 90, 50) → (Analyse finale, 60, 55) ; plafonnement (« Examen non remis », 50) → ('', 55). Sans effet sur la note tant que A-1 tient ; en fera un le jour où A-1 est branché. **Disposition proposée : inscrire sous #854.**

### A-3 · SPE par l'assistant : ni types ni forfaits, puis 0 « final » – majeur – `[exécuté]` A3, `[page]` E-SPE
À la main : `creerPratiqueV2` écrit pour SPE `{seuilAcceptabilite, jetons, modeleBundle}` et rien d'autre (`:2749-2775`) ; `_instanceSpecifications()` exige `Array.isArray(cfg.typesTravaux)` et `tableBundles || forfaits` → `null` → `_lireIndiceStocke(da)`. Obtenu : **1re passe** (cache vide) → `null`, simulé `{P:0, noteConstructible:false}`, export « non constructible » ; le cache écrit `{P:0, noteConstructible:false}` ; **2e passe** (ce que la page fait avant tout profil : `_recalculerIndicesACPSiPossible`) → `_lireIndiceStocke` lit `P = 0`, `typeof 'number'` → **0 constructible** → export **« 0, final »**. Vérifié dans la page : `perfConfigurable 0`, `simulé {P:0, noteConstructible:true}`, CSV `…,SPE,Pratique SPE (labo),0,final,0`. Le récapitulatif de l'assistant dit « Grille : À configurer plus tard » et ne dit pas où (le formulaire de gestion, tables « Types de travaux » et « Forfaits »).
**Disposition proposée : corriger maintenant le trou du cache** (#709 avait fermé « cache vide → 0 », pas « cache non constructible → 0 » ; `_lireIndiceStocke` doit rendre `null` quand `entree.actuel.noteConstructible === false` ; sentinelle : la mesure A3 « après une passe »). **Inscrire** le reste (#319 : l'assistant collecte les types et forfaits, ou son récapitulatif nomme le formulaire).

### A-4 · SPE rééditée : seuil 70 → 100, jetons et modèle perdus – moyen – `[exécuté]` A3
`chargerPratiqueExistante` n'a pas de branche `specifications` ; `creerPratiqueV2` réécrit `parseInt(undefined) || 100`, `{activer:false}`. Obtenu : 7 chemins perdus (diff dans `AUDIT-PNC-MESURES.A3.perdu`). **Inscrire sous #854 (b)**, élargi au seuil.

### A-5 · STD « tous » – moyen – `[exécuté]` A2b — recoupé #715
Attendu à la main (5 valides) 77,32 ; obtenu **76,75** = (85+60+78+70)/4 × 0,6 + 32,8 : le chemin riche coupe à `nombreARetenir`. L'attribut du Comparateur rend « 4 retenu(s) sur 2 minimum » ET « Méthode de sélection : tous ». Tenu.

### A-6 · DEN : ids de cibles décalés – moyen – `[exécuté]` A4 — recoupé #717
Jugement `{cible-1:true, cible-2:false}` → 59. L'enseignant retire « Lire » : `objectifs = [{cible-1, Écrire}]` → **78**, la cible non confirmée a disparu avec son id. Tenu.

### A-7 · Champs sans lecteur – mineur – `[grep]`
Inventaire (agent, recoupé) : écrits par l'assistant et lus par personne hors de lui : `configuration.varianteCalcul` (hors miroir et formulaire), `portfolio.hybride`, `portfolio.reprisesPermises` (une phrase seulement), `afficherRang`, `afficherMoyenneGroupe`, `reglesSommatives`, SOM `portfolio{nbArtefacts, qualitatif}`, `modeleBundle` (une phrase). Écrits par le formulaire et lus par personne : `jetons.delaiActif`, `jetons.repriseActif`, `portfolio.decouplerPN`, `modeDEN`. Le formulaire **lit** les noms de l'assistant (`nbArtefactsRetenus`…) mais **n'écrit** que les noms legacy. **Inscrire**, regroupé.

### A-8 · L'assistant lit le miroir global – mineur – `[lecture]` — recoupé #339
`wizard-pratique-v2.js:2760-2769` : `modalites.utiliserCategories`, `modalites.categories.*` (SSOT global) pour écrire `configuration.categories`.

**Ce qui fonctionne** `[exécuté]` : A2 — STD « les 4 derniers / 6 / minimum 2 / limitées » : écrit `methodeSelection 'derniers'`, `varianteCalcul 'n-recents'` ; lu comme `recents` (alias, `profil-etudiant-actions.js:182`) ; note **75,7** = attendu ; **diff de réédition vide**. A4 — DEN : cibles, suggestion « médiane », échelle et grille écrites, relues, ré-écrites à l'identique ; 78 aux deux cibles.

---

## B · Ce qui est offert au départ

`obtenirToutesLesPratiquesBibliothequeSync(true)` offre les cinq gabarits de `MODELES_PRATIQUES_PREDEFINIS` (`pratiques-bibliotheque.js:26-215`) : DEN-base, SPE-simple, SOM-litterature, STD-n-meilleurs, STD-n-recents. `PRATIQUES_PREDEFINES` (`pratiques-predefines.js`, dont `pan-objectifs-ponderes` au préfixe `pan-`) n'est offert par aucun geste : #690 tenu, l'id préfixé est sans effet. `pratique-test.js` (chargé par `index.html:14408`) enregistre `test` au registre ; la bibliothèque ne liste que gabarits + `pratiquesConfigurables` : atteignable seulement par un `pratiqueId = 'test'` écrit à la main — #469 tenu.

### B-1 · Cinq modèles adoptés tels quels – `[exécuté]`
| Modèle | Instance | Profil (riche) | Export | Constat |
|---|---|---|---|---|
| STD-n-recents | **non** (« echelle » manquante) | 77,32 | **« non constructible »** | B-1 majeur |
| STD-n-meilleurs | **non** | 77,32 | **« non constructible »** | B-1 majeur |
| SOM-litterature | oui | — (SOM) | 87 final | B-4 seuils camelCase, sans effet |
| SPE-simple | oui | — (SPE) | **50 final** (aucun forfait atteint) | B-3, plancher codé en dur |
| DEN-base | oui | — | 78 final (jugement semé) | fonctionne |

### B-2 · « N plus récentes » adoptée puis rouverte – majeur – `[exécuté]`
Réponse relue : `modeSelectionPortfolio = 'n_meilleurs'` (attendu : la table `methodeVersMode` ne connaît que `meilleurs/tous/derniers`). Enregistrer sans échelle : **refusé** (« Choisis une échelle de performance (IDME)… »), config inchangée. Choisir l'échelle E1 et enregistrer sans rien toucher d'autre : `configuration = {echelleId:'E1', grilleId:null, varianteCalcul:'n-meilleurs'}` — **plus de `portfolio`** (`approcheEvaluation` absent du gabarit, donc `r.approcheEvaluation === 'par-artefacts'` faux et le bloc n'est pas écrit) → profil « configuration de portfolio absente ou incomplète », export « non constructible ». Avant : 78,52 au profil. **Disposition proposée : corriger maintenant** — dans `chargerPratiqueExistante`, `approcheEvaluation = config.approcheEvaluation || (config.portfolio ? 'par-artefacts' : undefined)` et `methodeVersMode` complète (`recents`, `recents-meilleurs`). Sentinelle : la mesure B2.

---

## C · Ce que l'application DIT contre ce que le code FAIT

Inventaire complet (agent, 90 phrases, `fichier:ligne`) recoupé ; ne sont rapportés que les écarts, et ce qui est confirmé en page.

- **C-1** `[page]` WebKit + Chrome : le récapitulatif STD affiche « Variante : Par artefacts (N meilleurs) » (badge, `TYPE_BADGES`/`classification.variante` figée `n-meilleurs` depuis #443) et « Construction de la note : N derniers artefacts » (la vraie méthode). Capture `Rapports/captures/AUDIT-2026-09-16-chrome-recap-std.jpg`. **Inscrire → Grégoire** (mots des collègues).
- **C-2** `[grep]` `guides-pedagogiques.js:329` « conçue mais pas encore activable » — faux depuis #318 ; E-DEN crée, applique, exporte 78. **Inscrire → Grégoire** (une phrase).
- **C-3** PAN/PRÉN : guide `:306-307` (PRÉN, badge = raccourci) contre glossaire `terme.js:418` (« PAN regroupe STD, SPE et DEN ») et badge « PAN – Dénotation ». Approximation assumée (skill §2 bis) ; **commenter et oublier**, ou une ligne au glossaire, à Grégoire.
- **C-4** « cibles atteintes » pour SPE (`terme.js:400`, `popup.js:237`) contre « Non couvert (instruments) » (`construction-attributs.js:177,190`). **Inscrire sous #810.**
- **C-5** STD et les cibles (`index.html:10746` vs Comparateur) : **#810, tenu, ⛔ ne rien changer.**
- **C-6** Indice P « PAN – Standards, Sommative, ou une pratique personnalisée » (`guides-pedagogiques.js:140`) : SPE et DEN absents. **Inscrire → Grégoire.**
- **Reprises** : l'assistant dit « seul le meilleur niveau compte » (`:433, :459`) et « une reprise réussie remplace un premier essai » (récap) ; le code STD retient **le dernier essai non remplacé** (récence), et « meilleur » n'est vrai que si la reprise est meilleure (skill §2 bis). Le Comparateur le dit juste (« Récence (dernier essai retenu) » quand « récents »). Pas de constat neuf : la phrase de l'assistant est **plus optimiste** que le code ; à noter dans le labo.
- **Ce qui est juste** `[page]` : les diagnostics « non calculable » (SOM, SPE, DEN, STD sans portfolio) disent la vraie cause ; la phrase du profil STD « Portfolio (4 plus récents artefacts sur 5 évalués) » = le calcul (capture `…chrome-profil-std.jpg`) ; le récapitulatif SPE « Seuil d'acceptabilité : 70 % · Jetons délai : 4 (5 jours) · Jetons reprise : 3 » = ce qui est écrit ; DEN « Cibles d'apprentissage : 2 · Échelle (rétroaction) : IDME banc ».

---

## D · Appliquer, changer, retirer — `[exécuté]` D1, `[lecture]`

`appliquerPratiqueAuCours` (`pratiques-gestion.js:2205`) = `appliquerConfigurationPratique` (écrit le miroir `modalitesEvaluation`) puis `PratiqueManager.changerPratiqueActive` (écrit `groupesCours[].pratiqueId` + `groupeCoursActif.pratiqueId`, invalide le cache de pratique, recharge ; **aucun recalcul d'indices**).

Journal D1 (élève STD portant aussi des productions sommatives) :
| Geste | `pratiqueId` | écrit | indice AVANT recalcul | après | profil |
|---|---|---|---|---|---|
| 1. appliquer STD | STD | `groupesCours`, `groupeCoursActif` | (aucun) | 76 | 75,7 |
| 2. passer à SOM | SOM | idem | **76** (celui de STD) | 85 | — |
| 3. revenir à STD | STD | idem | 85 | 76 | 75,7 |
| 4. retirer | null | rien | 76 | **76, constructible** | « aucune pratique assignée » |

D-1 **inscrire** (l'indice affiché au tableau de bord est celui de la pratique d'avant jusqu'au recalcul ; après retrait, il reste « constructible »). Étape 4 : le résolveur du banc rend `null` ; le repli réel de `modes.js` (« sommative ») est celui du 5 sept. A-1, #710. `portfoliosEleves` reste vide ici (les sélections ne s'écrivent qu'au rendu du panneau, #714) : non mesuré au rendu. D-3 : 85 et non 87,43 — les six artefacts à pondération 0 pèsent 1 chacun sous SOM (skill §10, #483).

---

## E · Le parcours du labo, dans un navigateur — `[page]`

Spec : quatre essais, un par famille, **boutons réels** (« + Nouvelle pratique », « Suivant », « Créer », « Appliquer au cours actif », « Exporter la synthèse CSV » avec lecture du fichier téléchargé), champs de l'assistant posés dans le DOM, copies évaluées semées (l'évaluation elle-même est hors périmètre, 5 sept.), profil par `afficherProfilComplet` (le geste de la liste). Chrome de Grégoire : STD, mêmes gestes, deux captures.

| Famille | Assistant | Créée | Appliquée | Profil | Export |
|---|---|---|---|---|---|
| SOM | 9 étapes, récap juste (moyenne, seuils) | `moyenne_ponderee`, verrou écrit | oui, badge « Active » | « pas encore branché » (attendu) ; P 88 | **88 final** (verrou ignoré, A-1 ; arrondi #723) |
| STD | 10 étapes ; **récap contradictoire** (C-1) | `derniers`, 4/6/2 | oui | **75,7 %**, « 4 plus récents sur 5 évalués » — Chrome : capture | 76 final |
| SPE | 9 étapes ; « Grille : À configurer plus tard » | seuil 70, jetons, **rien d'autre** | oui | « pas encore branché » ; **P 0** | **0 final** (A-3) |
| DEN | voie rapide + `config-denotation`, récap juste | cibles, médiane, E1/G1 | oui | section « Jugement » ; P 78 (jugement semé) | 78 final |

Ce que le labo doit dire (matériau) : l'assistant exige **établissement et discipline** ; la note SOM et SPE ne se lit pas au profil ; l'export arrondit ; DEN se saisit dans le profil (spec `denotation-saisie-DEN2` couvre la saisie).

**Ce que les 9 specs existantes couvrent déjà** : appliquer (`pratiques-762…`, `cadre-763…`), édition sans perte d'enveloppe (`pratique-edition-preserve-enveloppe`, 2 cas — pas la config), création/saisie DEN (`denotation-creation-DEN3`, `denotation-saisie-DEN2`), Comparateur (`comparateur-pratiques-rendu`), import inter-trimestre. **Aucune** ne couvrait : l'assistant de bout en bout par ses champs, « Partir d'un modèle », l'export après application, SOM/SPE/STD jusqu'au profil. La spec de cet audit les couvre en lecture (elle ne rougit que si le parcours s'interrompt) ; elle peut devenir sentinelle en y posant les nombres.

---

## F · La documentation — dispositions proposées (rien d'écrit)

| Document | Disposition |
|---|---|
| `docs/modules/pratiques.md` (#804) | **retirer**, remplacer par 15 lignes : périmètre + renvoi au skill `pratiques-notation` et à `docs/DATA-OWNERSHIP.md`. Motif : faux depuis janvier (3 familles, `pan-maitrise`, wizard Primo, `GUIDE_AJOUT_PRATIQUE.md` absent) ; un doc de module faux vaut moins qu'un renvoi juste. |
| `.claude/skills/labo-codex/SKILL.md` §5 | **corriger** (10 lignes) : « 14 modules » → « compter par `ls` » ; « Identifiant : `pan-standards` » → `standards` (les legacy résolvent au registre avec ses défauts, #711) ; retirer « Seuils critiques » des 4 modes (#435) ; ajouter `pratique-notation-v2.js` = mort (#592). |
| `.claude/skills/pratiques-notation/SKILL.md` | **corriger** : §5 — la forme SPE **écrite** est `forfaits {lettre, note, travaux}` + `seuilAcceptable`, traduite à la lecture (#708) ; l'assistant n'écrit pas les types (A-3) ; §10 — `construireConfigComplete` défaute `calcul_note` **par famille** depuis le 31 mai (le piège « conversion_niveaux pour tous » est périmé), et `_lireIndiceStocke` (A-3) ; §12 — compacter en 10 lignes d'état + renvoi aux archives ; #805 (PAREA). |
| `SPEC_PAN_SPECIFICATIONS_V2.md` (archive) | tenir ; encart « schéma réel : skill §5 ». |
| `docs/Rapport - Flux de configuration (0207).md`, `docs/utilisateur/GUIDE_TESTEURS.md`, `DEMARRAGE_RAPIDE.md`, `docs/aide-contextuelle-contenu-*.md` | **archiver** sous `docs/archive/` (déplacement). |
| `docs/refonte-textes/glossaire-bloc6.md` | tenir ; vocabulaire du labo. |
| Comparateur : aucune aide contextuelle | **inscrire** (mineur) — une entrée `comparateur` dans l'Aide. |

---

## G · Ce que les tests protègent du tour complet — break-tests `[exécuté]`

Sous-ensemble : les 41 fichiers Vitest qui chargent ou lisent `wizard-pratique-v2.js` / `pratiques-gestion.js` (579 tests, tous verts sur la base). Chaque mutation posée par `perl -0pi`, présence vérifiée par empreinte, restaurée par `git checkout`, empreinte finale = base.

| # | Mutation | Rouges |
|---|---|---|
| G1 | assistant : `methodeSelection` toujours `'meilleurs'` | **0** |
| G2 | assistant : `nombreARetenir + 1` | 1 (`golden-creation-319`) |
| G3 | assistant : seuil SPE par défaut 100 → 75 | **0** |
| G4 | assistant : SOM n'écrit plus `configuration.reprises` | 1 (`golden-creation-319`) |
| G5 | assistant : réédition STD ne restaure plus `nombreARetenir` | 1 (`roundtrip-317`) |
| G6 | formulaire : `methodeSelection` toujours `'meilleurs'` | **0** |
| G7 | assistant : ids de cibles DEN `'c-N'` | **0** |
| G8 | assistant : minimum du portfolio par défaut 3 → 1 | **0** |

**Le champ dont la mutation ne rougit rien est le prochain #854** : la **méthode de sélection** (les deux écrivains), le seuil SPE, les ids de cibles (qui indexent `jugementsDenotation`), le minimum. **Inscrire** : une sentinelle « ce qui est écrit est ce qui est relu et ce qui calcule », par famille — le banc A de cet audit en est le brouillon (ses `expect` sont déjà les valeurs obtenues).

---

## Ce qui fonctionne, avec la preuve

- STD par l'assistant, de bout en bout : `[exécuté]` A2 (75,7, diff de réédition vide), `[page]` WebKit et Chrome (profil 75,7 %, export 76).
- DEN par l'assistant : `[exécuté]` A4 (78, diff vide), `[page]` (section Jugement, export 78) ; DEN-base adopté calcule.
- SOM : la moyenne (87,43 / 88) et les seuils personnels survivent à la réédition.
- « Appliquer au cours actif » écrit la source de vérité et le badge « Active » (#762) — `[exécuté]` D1, `[page]` ×4.
- L'export lit `simulerIndices` et dit « non constructible » quand le calcul l'est — tant que le cache n'a pas été relu (A-3).
- Les diagnostics « non calculable » nomment la vraie cause dans les quatre familles `[page]`.
- L'alias `derniers` → `recents` tient dans les deux chemins (skill §5).

## Ce que je n'ai pas regardé — nommément

- **Le formulaire de gestion en exécution** (`pratiques-gestion.js`, 2 973 l.) : inventorié par lecture (agent), non exécuté — ses écritures sous DOM réel (tables Types/Forfaits, carte Portfolio) ne sont pas mesurées ; le chemin « créer une SPE par l'assistant PUIS compléter les forfaits au formulaire » n'est pas joué.
- **Safari et l'iPad** : WebKit headless et le Chrome de Grégoire seulement.
- **Les données réelles de Grégoire** : rien lu.
- **L'import/export de pratiques** (#663, #664), **la bibliothèque partagée** (#634), **le Comparateur en navigateur** (spec `comparateur-pratiques-rendu` existe), **les maquettes** (#326-T1/T3/T4/T5).
- **La saisie DEN par l'UI** (couverte par `denotation-saisie-DEN2`, non rejouée) ; **l'évaluation d'une copie** (5 sept.).
- **`portfoliosEleves` au rendu du panneau** (#714) : D1 le mesure vide parce que le panneau n'a pas été rendu.
- **Le miroir `modalitesEvaluation` après changement de pratique** : lu `[lecture]`, pas mesuré.
- Le harnais du profil en page appelle `afficherProfilComplet` (la fonction du clic), pas le clic sur la liste des élèves.

## Second livrable

`Rapports/TABLEAU-LABO-pratiques-notation-2026-09-16.md` — par famille, une ligne par geste du parcours : geste · écran · ce que l'app écrit · ce que le moteur lit · ce que l'app en dit · test qui le couvre · verdict.
