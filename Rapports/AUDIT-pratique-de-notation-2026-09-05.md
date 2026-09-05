# AUDIT – Le moteur de la pratique de notation : la note du cours reflète-t-elle exactement les évaluations enregistrées, selon la règle que l'enseignant a configurée, et le dit-elle quand elle ne peut pas ?

**Date** : 5 septembre 2026, 15 h 56 – 16 h 50.
**Cadré par** : `Rapports/prompts-audit/PROMPT-AUDIT-pratique-de-notation-2026-09-05.md` (Cowork, avec Grégoire). Second audit : il repart du flux H du premier (`Rapports/AUDIT-moteur-evaluation-2026-09-05.md`, #706) sans le remesurer.
**Base auditée, mesurée** : branche `audit/pratique-de-notation-2026-09-05`, partie de `origin/main` ; `git rev-parse --short HEAD` = `93b744b4` (= `main` = `origin/main` après `git fetch`) ; `cat version.json` = `{"build":"0905-1530","beta":"1.121.0"}`. L'arbre portait à l'ouverture trois fichiers de Cowork modifiés (`OU-EN-EST-ON.md`, le premier rapport, ce prompt), qui partent avec ce commit ; il porte ensuite ce rapport, le banc, et les deux ultrareviews complétées. ⚠ Pendant l'audit, Cowork a écrit en parallèle `BACKLOG.md`, `plans de travail/00-CADRAGES-OUVERTS.md` et deux fichiers neufs : ils ne sont pas de cet audit et ne sont pas commis ici.
**Vitest, depuis `tests/`** (`npm run test:unit`) : 473 fichiers / 5 263 tests verts avant le banc (rituel d'ouverture, 15 h 56) ; **474 fichiers / 5 309 tests verts avec lui**, code 0.
**Périmètre recompté** (`wc -l`) : `js/pratiques/` 15 fichiers, **8 236 lignes**, identique au prompt ; `indices.js` 616 ; `pratiques-bibliotheque.js` 862 ; `profil-etudiant-actions.js` 772 ; `evaluation-jetons.js` 943 ; `impact-jetons.js` 473 ; `portfolio.js` 1 113.
**Mode** : lecture seule sur `js/` (**rien d'appliqué**), exécution en bac à sable Vitest. Les modules réels sont chargés dans un faux `window` (patron du banc du premier audit) et appelés tels quels : les quinze fichiers de `js/pratiques/` qui calculent, `portfolio.js`, `indices.js`, `profil-etudiant-actions.js`, `profil-etudiant-calculs.js`, `profil-etudiant-helpers.js`, `profil-etudiant-sections-affichage.js` (avec ses dépendances de rendu), `export-resultats-finaux.js`, `evaluation-jetons.js`, et `modes.js` pour la résolution de la pratique active. **Trois miroirs, nommés** : `obtenirDonneesSelonMode` (lecture du store sans le filtre par cours), `sauvegarderDonneesSelonMode`, `resoudreModeleParId` (lookup par id dans le trimestre `test`).

**Le banc** : `tests/unit/audit-pratique-de-notation-2026-09-05.test.js`, **46 mesures**, quatre élèves de banc — SOM `1000001`, STD `1000002`, SPE `1000003`, DEN `1000004`. Chacun porte une évaluation normale verrouillée, une reprise (`remplaceeParId` + `repriseDeId`), un brouillon « 0 » à portée incomplète (`noteFinale 0`, `ponderationCouverte 50`, non verrouillé — la forme que #674 écrit depuis le 2 septembre), une évaluation dont un critère est analytique en points, et une évaluation verrouillée. **Le nombre attendu est calculé à la main dans le commentaire qui précède chaque `it`, avant le code** ; les `expect` sont les valeurs obtenues. Il imprime toutes les valeurs sous `AUDIT-PN-MESURES`.

```
cd tests && npx vitest run unit/audit-pratique-de-notation-2026-09-05.test.js
```

**Ce que le flux H du premier rapport a mesuré et que je ne remesure pas** : SOM lit `noteFinale` sans `ponderationCouverte` ni `verrouillee` (H1 : un brouillon 95 sur 80 % compte 95 → 0,906 ; H2 : un `0` de portée 0 compte 0 → 0,336 ; H3 : `null` est ignoré → 0,84). Ici, je le suis à l'intérieur : dans STD, SPE et DEN (flux C).

**Verdicts** : `[exécuté]` = la fonction réelle a été appelée dans le banc et la valeur citée est celle qu'elle a rendue ; `[lecture]` = chemin de code lu, non exécuté ; `[grep]` = un compte reproductible par la commande citée. Ce que le banc n'est pas : un navigateur (aucun WebKit n'a tourné) ; et les données réelles de Grégoire n'ont pas été lues.


> ## ↻ Dispositions arrêtées par Grégoire — 5 septembre 2026, en soirée, sur la même base, livrées en 1.122.0
>
> Chaque constat porte ci-dessous l'une des dispositions exigées par `CLAUDE.md` (§« Ce qu'un audit doit
> produire ») : ***inscrit*** (n° de fiche au `BACKLOG.md`), ***refusé*** (motif), ***périmé*** — et ***livré***
> quand la fiche est fermée dans le même lot. Les propositions d'origine restent lisibles plus bas.
>
> | Constat | Disposition arrêtée | Fiche | Preuve |
> |---|---|---|---|
> | D-3 · SPE en `forfaits` → 0 pour tous | **inscrit, livré** (traduction `forfaits → tableBundles` à la lecture ; appariement d'un type par id OU par nom) ; le stock se MESURE (`scripts/diagnostic-708-spe-forfaits.js`), ne se réécrit pas | #708 | `tests/unit/sentinelle-708-spe-forfaits-calculent.test.js` (6 cas ; break-testée : traduction retirée → 5 rouges, appariement par nom retiré → 3 rouges) |
> | F-1 · cache `indicesCP` vide → 0 constructible | **inscrit, livré** (le cache ne se lit que pour `conversion_niveaux` ; vide → `null` ; SPE sans évaluation → `null`) | #709 | `tests/unit/sentinelle-709-cache-vide-rend-null.test.js` (5 cas ; break-testée : cache vide → 0 → 1 rouge, délégation → 0 → 2 rouges) |
> | C-1 · le brouillon compte 95 partout | **inscrit, livré — RÈGLE ARRÊTÉE** : une évaluation non verrouillée, ou dont la portée est incomplète, n'entre pas dans la note du cours, dans les quatre familles et les deux systèmes ; le profil et l'export disent combien ont été écartées | #706 | `tests/unit/sentinelle-706-brouillons-hors-de-la-note.test.js` (12 cas : SOM 87,43 · STD 79,45 · SPE 80 · DEN 78, mots du profil, colonne de l'export ; break-testée : règle retirée → 18 rouges, portée nulle → 2 rouges) |
> | A-1 · deux replis pour un groupe sans pratique | **inscrit**, après le 14 | #710 | banc A1 |
> | A-2 · id legacy → défauts du registre | **inscrit**, après le 14 | #711 | banc A2 |
> | A-3 · forme `.config` non lue | **inscrit**, après le 14 (recoupe #465, #663) | #712 | banc A3 |
> | A-4 · registre SPE = 50 % | **inscrit**, après le 14 | #713 | banc A4 |
> | B-4 · panneau du profil (3 vs 4, « Calcul impossible », écrit au rendu) | **inscrit**, après le 14 | #714 | banc B3b |
> | B-5 · mode « tous » divergent | **inscrit**, après le 14 | #715 | banc C3 |
> | B-6 · P historique (SPE → IDME en dur, DEN → STD ; historique SOM mort par sa forme) | **inscrit**, après le 14 — ferme l'item 13 du lot 3 | #716 | `[lecture]` `[grep]` |
> | D-6 · ids de cibles DEN changés → 59 muet | **inscrit**, après le 14 (recoupe #465) | #717 | banc D11 |
> | E-2 · niveau global exige un texte de rétroaction | **inscrit**, après le 14 | #718 | banc E2 |
> | E-5 · DEN lue « M » par la règle STD | **inscrit**, après le 14 | #719 | banc E5 |
> | G-2 · héritage du jeton de délai | **inscrit**, après le 14 (N2 du lot 4a) | #720 | banc G2 |
> | G-7 · `jetonsEtudiants` clé nue | **inscrit**, après le 14 (N6, N7, H3 du lot 4a) | #721 | banc G7 |
> | B-3 · `chargerPortfolioEleveDetail` mort | **inscrit** (mineur ; ferme 3, 6, 9, 10 du lot 3) | #722 | `[grep]` |
> | F-3 · export à l'entier | **inscrit** (mineur) | #723 | banc F3 |
> | G-3 · reprise sur doublon réconcilié | **inscrit** (mineur, N5 du lot 4a) | #724 | banc G3 |
> | G-5 · succès avant l'écriture | **inscrit** (mineur, H2 du lot 4a) | #725 | banc G5 |
> | G-4 · `repriseDeId` vers un id supprimé | **commenté** dans `evaluation-jetons.js`, aucune fiche | – | banc G4 |
> | D-2b · égalité à la coupure | **commenté** dans `profil-etudiant-actions.js`, aucune fiche | – | banc D6 |
> | A-5 · trimestre archivé (#482) | **périmé** — motif au constat A-5 (`cle()`, #622-B3, #358) | #482 | `[lecture]` |
> | D-1 (#483), E-1 (#701), E-6 (#590), G-6 (#617) | **recoupés, tenus** — fiches existantes, rien de neuf | – | bancs D1-D3, E1, E6, G6 |
> | Ultrareview lot 3, items 1-2 · 12 · 17 · 19-20 (indices A et C) | **inscrits** | #726 · #727 · #728 · #729 | `[lecture]`, dans le fichier de l'ultrareview |
>
> ⚠ Le banc `tests/unit/audit-pratique-de-notation-2026-09-05.test.js` a été mis aux valeurs D'APRÈS pour B1, B2b, B6,
> C1 à C5, D2, D4, D9, F1, F2, G1, G8 (l'ancienne valeur reste en commentaire) ; celui du premier audit pour H1 et H2.
> **Sous la règle #706, le nombre principal de la sommative devient 87,43** (8830/101 : le brouillon « 0 sur 50 % » du jeu
> n'est plus au poids 1) ; STD 79,45 et SPE 70 ne bougent pas, DEN 78 non plus.
> Break-tests du lot : chaque fichier de `js/` muté puis restauré par copie, empreinte SHA-256 identique (sortie dans `SESSION.md`).
> ⚠ **Supposition nommée, à confirmer par Grégoire** : « portée incomplète » est jugée SANS relire la grille — portée 0
> (rien couvert) écartée, portée déclarée positive comptée, parce que la porte #674 refuse une portée partielle à
> l'enregistrement ; comparer à la grille COURANTE est #705. Conséquence : une copie enregistrée sans aucun critère ne pèse
> plus 0 dans une moyenne sommative. Et les mots « 1 évaluation sans aucun critère évalué, non comptée » sont les miens.

---

## Vue d'ensemble : la réponse à la question directrice

Sur le nombre principal de chaque famille, **les deux systèmes de calcul concordent** et l'export dit le même nombre que le profil (SOM 86,57 → 87 ; STD 79,45 → 79 ; SPE 70 ; DEN 78 — flux B). La note du cours reflète donc les évaluations **enregistrées** — y compris celles qu'il ne faudrait peut-être pas compter (flux C, #706). Trois choses, en revanche, ne tiennent pas, et deux d'entre elles font sortir de l'application **un chiffre qui a l'air d'un résultat**.

| n° | Flux | Ce qui arrive | Gravité | Verdict | Disposition proposée |
|---|---|---|---|---|---|
| D-3 | D | **Une pratique SPE telle que l'assistant, le gabarit « Modèle simple » et l'éditeur l'écrivent (`configuration.forfaits`) rend 0 pour tout le monde** : le moteur ne lit que `tableBundles`, et rien ne convertit l'un en l'autre ; le 0 est « constructible », l'export écrit `0, final` | **majeur** | `[exécuté]` D9, `[grep]` | **corriger maintenant** (recoupe #465, partie SPE) — ou *inscrire* si aucun collègue n'est en SPE à la mi-septembre : c'est à Grégoire de le savoir |
| F-1 | F, B | **Une pratique configurable SOM ou SPE rend `0` (un nombre) tant que `indicesCP` n'a pas d'entrée pour l'élève** : première passe d'indices d'un trimestre, élève ajouté, export lancé avant un recalcul → `P 0` « constructible », export `0, final` ; la passe suivante rend le bon nombre | **majeur** | `[exécuté]` B2b F1 F2 B6 | **corriger maintenant** (`null` au lieu de `0`, deux sites : `pratique-configurable.js:181-183` et `:414`) |
| C-1 | C | **Le brouillon « 95 sur 50 % » compte 95 dans les trois familles qui calculent** : SOM 86,57 → 87,5 ; STD 79,45 → 83,2 (il entre en tête de sélection) ; SPE fait monter un palier (B 80 → A 100) ; DEN rien | majeur (frontière, #706) | `[exécuté]` C2 C4 C5 | **inscrit — #706** : la règle est pédagogique, elle attend Grégoire ; la mécanique est prête (filtrer `verrouillee`, ou `ponderationCouverte < 100`) |
| A-1 | A | Un groupe-cours **sans** `pratiqueId` : `modes.js` répond « sommative », le registre répond `null` et le profil calcule en « standards » → l'indice P est sommatif (87) pendant que la section « Note finale de session » dit « pratique introuvable dans la bibliothèque » | moyen | `[exécuté]` A1 | inscrire et continuer |
| A-2 | A | Un identifiant legacy `pan-standards` dans le groupe-cours : l'instance registre calcule avec **ses défauts** (3 / meilleurs → 81,0), le profil et l'export disent « non constructible » ; le P historique et le RàI lisent 81 | moyen | `[exécuté]` A2 | inscrire et continuer |
| A-3 | A | Une pratique rangée sous `.config` seul (forme d'import, #663) : l'instance résout (STD), mais `obtenirConfigPratiqueActive` ne lit que `.configuration` → « configuration de portfolio absente », non constructible | moyen | `[exécuté]` A3 | inscrire et continuer (recoupe #465, #663) |
| A-4 | A, D | Un pointeur `specifications` ou `pan-specifications` résout vers **l'instance registre SPE, jamais configurée : 50 % pour tout le monde**, « constructible » | moyen | `[exécuté]` A4 | inscrire et continuer |
| B-4 | B | Le panneau « Développement des habiletés » du profil annonce **« 3 meilleurs » (les `regles` de la production Portfolio) alors que la pratique dit 4** ; sa « Méthodologie de calcul » écrit « Calcul impossible : aucune évaluation disponible » sous un P de 79 % ; et **le rendu écrit `portfoliosEleves` et recalcule les indices** | moyen | `[exécuté]` B3b | inscrire et continuer |
| B-5 | B | Sous `methodeSelection: 'tous'`, **les deux systèmes divergent** : le chemin riche tronque à `nombreARetenir` dans l'ordre de stockage (76,75), l'instance prend tout (69,9) | moyen | `[exécuté]` C3 | inscrire et continuer |
| B-6 | B | **Le P historique** (snapshots, trajectoires, corrélations, impact des jetons) : une configurable n'a pas de `calculerPerformanceHistorique` → SPE tombe sur une conversion IDME **codée en dur** (I 40 / D 65 / M 75 / E 100), DEN sur l'instance STD | moyen | `[lecture]` `[grep]` | inscrire et continuer (ferme l'item 13 de l'ultrareview lot 3) |
| D-6 | D | DEN : des identifiants de cibles **changés dans la configuration** (la saisie garde les anciens) plafonnent la note à 59 sans un mot ; même effet qu'une cible non confirmée | moyen | `[exécuté]` D11 | inscrire et continuer (recoupe #465 « ids de cibles stables ») |
| E-2 | E | Le niveau de la note globale (STD) est lu dans l'échelle des évaluations **qui portent un texte de rétroaction** : sans texte, « aucune évaluation retenue », pas de niveau | moyen | `[exécuté]` E2 | inscrire et continuer |
| E-5 | E | DEN : `obtenirPratiqueActuelle` ne trouve pas « denotation » au registre et **fabrique une PratiquePANStandards** → le jugement 78 se lit « M » par la règle STD, alors que la configurable elle-même répond « note chiffrée, pas de niveau » | moyen | `[exécuté]` E5 | inscrire et continuer |
| G-2 | G | La reprise **hérite** de `jetonDelaiApplique` : un délai accordé compte deux fois après une reprise (N2 de l'ultrareview lot 4a) | moyen | `[exécuté]` G2 | inscrire et continuer |
| G-7 | G | `jetonsEtudiants` est une **clé nue** (hors registre, partagée entre trimestres), **écrite à la lecture** du statut, et « attribuer » un jeton prédéfini y écrit sans que le compte affiché bouge (N6, N7, H3) | moyen | `[exécuté]` G7, `[grep]` | inscrire et continuer |
| B-3 | B | `chargerPortfolioEleveDetail` (`portfolio.js:111-342`) et son bouton n'ont **aucun appelant ni conteneur** : ~290 lignes mortes, avec leur propre règle de note (originale remplacée retenue, terminale ignorée) | mineur | `[grep]` `[exécuté]` B3 | inscrire (retrait zéro-dette ; ferme 4 items de l'ultrareview lot 3) |
| F-3 | F | L'export des résultats écrit `P` **arrondi à l'entier** (79 pour 79,45 ; 87 pour 86,57) ; la section du profil affiche « 79.4 » (flottant) | mineur | `[exécuté]` F3 | inscrire et continuer (dire la décimale de l'export) |
| G-3 | G | Une originale déjà « remplacée » par réconciliation (#360) reçoit un jeton de reprise : la reprise naît avec `remplaceeParId` hérité, invisible au calcul (N5, cas étroit) | mineur | `[exécuté]` G3 | inscrire (mineur) |
| G-5 | G | `retirerJetonReprise` notifie le succès **avant** l'écriture ; refusée, l'enseignant lit « Originale restaurée » puis « Modification non enregistrée » (H2) | mineur | `[exécuté]` G5 | inscrire (mineur) |
| G-4 | G | `archiverOriginale: false` laisse `repriseDeId` désigner un id supprimé (N8) ; l'aval est cohérent | information | `[exécuté]` G4 | commenter et oublier |
| D-2b | D | Égalité à la coupure (N = 2 : 85 \| 78, 78) : l'ordre de stockage départage ; la note est la même, seul le récit « écartée » change de cible | information | `[exécuté]` D6 | commenter et oublier |

Les dispositions sont **proposées** ; Grégoire arbitre avant tout lot. Deux « corriger maintenant » : D-3 parce qu'une note de 0 peut être **remise** (export CSV « final ») à une classe entière sans qu'aucun écran ne le dise, F-1 parce que le même 0 sort de l'export dès que le cache d'indices est en retard sur les élèves. Si Grégoire juge qu'aucun collègue n'est en SPE et que l'export ne se lance jamais avant un recalcul, chacun se rabat sur « inscrire ». Le troisième majeur, C-1, est déjà inscrit (#706) et attend sa règle.

**Recoupements avec les fiches ouvertes** (à ne pas redécouvrir) : #483 mesuré et tenu (D-1) ; #701 vu depuis la note du cours (E-1) ; #590 atteint et muet (E-6) ; #482 refermé au code par #622-B3 et #358 (A-5, proposé *périmé*) ; #617 tenu (G-6) ; #465 : sa partie DEN « note absente ⇒ null » est **livrée** (D-5), ses parties « ids de cibles stables » (D-6), « schéma SPE unifié » (D-3) et « primauté `configuration.*` sur `.config` » (A-3) sont **tenues** ; #663/#664 : la forme `.config` est bien celle que le profil ne lit pas (A-3), le remap d'import lui-même n'est pas remesuré.

---

## A · La résolution de la pratique

**Carte** `[grep]` : `grep -rn "calculerDetailsNoteFinale(" js/` → cinq appelants hors définition (`profil-etudiant-sections-affichage.js:2794`, `synthese-retroaction-data.js:310,1134`, `portfolio.js:631,740`) ; `grep -rn "simulerIndices(" js/` → l'export (`export-resultats-finaux.js`), le comparateur (`comparateur-pratiques.js:335,915`), l'aperçu de l'assistant (`wizard-pratique-v2.js:1940-1941`) ; `grep -rn "\.calculerPerformance(" js/` → `portfolio.js:640,756` seulement (gardés par la famille), plus les délégations internes. La pratique active vient de `obtenirPratiqueActiveGroupeCours` (`modes.js:1245-1278`, défaut `'sommative'`) pour la config et les indices, et de `obtenirTypePratiqueActive` (`pratique-registre.js:641-689`, défaut `null` puis `PRATIQUE_DEFAUT = 'standards'` chez l'appelant) pour le profil et le niveau global.

### A-1 · Deux replis pour un groupe-cours sans pratique – moyen – `[exécuté]`

Mesuré (A1, jeu SOM, `groupesCours[0].pratiqueId` retiré) : `obtenirPratiqueActiveGroupeCours()` → **`sommative`** ; `obtenirTypePratiqueActive()` → **`null`** ; après deux passes, `indicesCP[da].actuel.P` = **87** (la sommative a calculé, 8830/102) ; `calculerDetailsNoteFinale(da).erreur` = *« La pratique assignée à ce groupe-cours est introuvable dans la bibliothèque (supprimée, ou assignation vers un identifiant obsolète)… »*. Ce que l'enseignant verrait : un indice P à 87 % au tableau de bord et dans le profil, et sous la liste des productions, « Note finale non calculable » avec un diagnostic qui parle d'une pratique supprimée — alors qu'aucune n'a jamais été assignée. La première branche de `_diagnostiquerNoteNonCalculable` (« Aucune pratique de notation n'est assignée ») est **inatteignable** : `obtenirPratiqueActiveGroupeCours` ne rend jamais `null`.

**Disposition proposée : inscrire et continuer.** Un seul défaut, ou aucun, et un diagnostic qui dit « aucune pratique assignée » quand c'est le cas.

### A-2 · Un identifiant legacy résout vers le registre, avec ses défauts – moyen – `[exécuté]`

Mesuré (A2, jeu STD dont la configurable dit `nombreARetenir 4`, pointeur `pan-standards`) : `obtenirPratiqueParId('pan-standards')` → l'instance **`standards`** du registre ; `calculerPerformance(da)` → **0,81** (3 / meilleurs, les défauts de `_lireConfiguration` : (85 + 78 + 78)/3 = 80,33 ; 80,33 × 0,6 + 82 × 0,4 = **81,0** — à la main) ; la vraie configuration (N = 4) donnerait 79,45. Le profil : `erreur` « introuvable » (le `find` sur `pratiquesConfigurables` cherche l'id brut) ; `indicesCP` : `P 0, noteConstructible false` ; `simulerIndices` : non constructible. L'export écrit donc « non constructible » pendant que **les snapshots et le RàI** (`obtenirPratiqueActuelle` → cette même instance) voient 81. Qui : les données d'un utilisateur dont le pointeur n'a pas été réécrit (#358 normalise à la lecture, pas en base).

**Disposition proposée : inscrire et continuer.**

### A-3 · La forme `.config` (import) résout mais n'est pas lue – moyen – `[exécuté]`

Mesuré (A3, pratique `{ id, nom, config: { …, type: 'standards', portfolio: {…} } }`) : `obtenirPratiqueParId` → code **STD** ; `obtenirTypePratiqueActive()` → `null` (il lit `configuration.type` puis `p.type`, jamais `config.type`) ; `calculerDetailsNoteFinale` → *« Pratique PAN-Standards, mais sa configuration de portfolio … est absente ou incomplète »* ; `simulerIndices` non constructible ; export `'', 'non constructible'`. `construireConfigComplete` (`pratique-registre.js:239-321`) lit les deux formes ; `obtenirConfigPratiqueActive` (`portfolio.js:1046-1064`) une seule. C'est le « repli `.config` → wizard pour les copies legacy » de #465, et la forme que #663 nomme.

**Disposition proposée : inscrire et continuer** (une source de lecture, `construireConfigComplete`, pour les deux).

### A-4 · Le registre SPE est une coquille : 50 % pour tous – moyen – `[exécuté]`

Mesuré (A4, jeu SPE, pointeur `pan-specifications`) : instance `specifications`, `calculerPerformance` → **0,5** (aucun `typesTravaux` → aucun palier → repli `50`, `pratique-pan-specifications.js:725-726`) ; `indicesCP.P` = **50**, `noteConstructible true` ; la configurable `spe-banc`, elle, rend 0,7. `PratiqueManager.chargerPratiqueActive` (`pratique-manager.js:44-52`) tient `'specifications'` pour une pratique « codée en dur » valide : ce pointeur est donc considéré légitime par l'application. Ce que l'enseignant verrait : 50 % pour toute la classe, sans avertissement.

**Disposition proposée : inscrire et continuer** (l'instance registre SPE devrait rendre `null` sans configuration, comme la sommative sans évaluation).

### A-5 · Un trimestre archivé lit SES pratiques (#482) – fonctionne – `[lecture]`

`cle('pratiquesConfigurables')` sur un trimestre archivé : `trimestres.js:328-338` rend `${trimestreId}_pratiquesConfigurables` si la copie existe, et la clé est de toute façon dans `CLES_NAMESPACEES` (`:106`) ; le snapshot d'archivage lit `${trimestreId}_pratiquesConfigurables` explicitement (`:789`, #622-B3, « on ne peut archiver qu'un trimestre non actif ») ; `obtenirTypePratiqueActive(contexte)` lit `trimestreId + '_pratiquesConfigurables'` du trimestre du groupe-cours (`pratique-registre.js:676`). Non rejoué.

**Disposition proposée : périmé** (#482 « à recouper » : recoupé au code, refermé par #622-B3 et #358) — à confirmer par Grégoire, qui seul a un trimestre archivé sous la main.

---

## B · Les deux systèmes de calcul — le nœud

### B-1 · Sur le nombre principal, les deux chemins concordent – fonctionne – `[exécuté]`

| élève | à la main | riche `calculerDetailsNoteFinale` | instance registre | configurable `obtenirPratiqueParId(id)` | `simulerIndices` P | `indicesCP` P (2ᵉ passe) | export | profil P · niveau |
|---|---|---|---|---|---|---|---|---|
| SOM | (84×40 + 90×60 + 70×1 + 0×1) / 102 = **86,57** | `null` (ne répond pas pour SOM) | 0,8657 | 0,8657 | 87 | 87 | `87, final` | 87 % · aucun (« note chiffrée ») |
| STD (N = 4) | (85+78+78+70)/4 = 77,75 ; 77,75×0,6 + 82×0,4 = **79,45** | 79,45 | 0,7945 | 0,79 (lu dans `indicesCP`) | 79 | 79 | `79, final` | 79 % · **M** |
| SPE | dissertation 1 · examen 1 · dossier 1 → C+ = **70** | `null` | **0,5** (coquille, A-4) | 0,70 | 70 | 70 | `70, final` | 70 % · aucun |
| DEN | jugement saisi, deux cibles confirmées = **78** | `null` | — | 0,78 | 78 | 78 | `78, final` | 78 % · **M** (E-5) |

(B1, B2, B4, B5.) Le brouillon 0 est dans chaque jeu et compte comme le flux C le décrit. Le c2a du 6 juin se retrouve : sans la reprise (90 au lieu de 70), le STD rend 82,45 (D7).

### B-2 · La configurable STD, SOM et SPE lit un cache – voir F-1 – `[exécuté]`

`PratiqueConfigurable.calculerPerformance` (`pratique-configurable.js:178-183`) lit `indicesCP[da]` avant tout, et rend **`0`** — un nombre — s'il n'y a pas d'entrée. Mesuré (B2b) : la configurable STD appelée avant toute passe rend **0** ; pour `conversion_niveaux` elle rend ensuite la valeur **stockée** (`:199`), un cache que le chemin riche a produit. Pour STD c'est sans effet sur les écrans (le chemin riche est autoritatif) ; pour SOM et SPE, c'est F-1.

### B-3 · L'« écran Portfolio » de `portfolio.js` est mort – mineur – `[grep]` `[exécuté]`

`grep -rn "chargerPortfolioEleveDetail(" js/` → sa définition (`portfolio.js:111`) et son propre repli (`:390`) ; `grep -c portfolioEleveDetail index.html` → **0** ; `grep -c toggleArtefactPortfolioFromEl index.html` → **0** ; `typeof window.chargerPortfolioEleveDetail` → `undefined` (B3). Sa règle propre — première évaluation trouvée par production (l'originale remplacée gagne), `note: noteFinale || null` (un 0 devient « non remis »), sélection auto, note = moyenne des retenus sans terminale (82,75 sur le jeu STD, à la main) — ne s'affiche donc nulle part. `selectionnerArtefactsSelonModalite` et `toggleArtefactPortfolio` n'existent que pour elle ; `toggleArtefactPortfolioFromEl` reste exporté.

**Disposition proposée : inscrire** — retrait zéro-dette (~290 lignes), qui ferme les items 3, 6, 9 et 10 de l'ultrareview lot 3.

### B-4 · Le vrai panneau Portfolio du profil dit autre chose que ce qu'il calcule – moyen – `[exécuté]`

`genererSectionPerformance` (`profil-etudiant-sections-affichage.js:4130`) est le panneau « Développement des habiletés ». Mesuré (B3b, jeu STD dont la pratique dit N = 4 et la production Portfolio porte `regles.nombreARetenir 3`) :

| ce qu'il rend | valeur |
|---|---|
| le grand chiffre | **« M 79% »** — juste |
| la ligne de méthode | *« Performance du portfolio actuel (**3 meilleurs**, maîtrise de standards) »* — la pratique dit **4** |
| « Artefacts retenus » | *« Aucun artefact évalué »* |
| « Calcul de l'indice P » | *« Calcul impossible : aucune évaluation disponible »* |
| écritures pendant le rendu | **1** sur `portfoliosEleves` (+ un recalcul complet des indices) |

Trois causes : `nombreARetenir = portfolio.regles.nombreARetenir || 3` (`:4194`) lit la **production**, pas la pratique, et `_lireDetailsRapportPerformance` (`:4064-4127`) y retombe parce que `indicesCP.details.nombreARetenir` n'existe plus ; `indicesCP.details.artefactsRetenus` n'est plus écrit par `calculerEtStockerIndicesCP` (`portfolio.js:658-660`, `details: { calculViaPratique: true }`) depuis Beta 95.5, donc la liste et la formule sont vides ; `_appliquerSelectionAutoArtefacts` (`:4033`) **écrit** `portfoliosEleves` et relance `calculerEtStockerIndicesCP` à chaque affichage du profil. Ce que l'enseignant verrait : un P juste, une explication qui le contredit deux fois.

**Disposition proposée : inscrire et continuer** (le panneau lit `calculerDetailsNoteFinale` — qui a déjà `artefactsRetenus`, `nombreARetenir`, `methodeSelection` — et cesse d'écrire au rendu).

### B-5 · Sous « tous », les deux systèmes divergent – moyen – `[exécuté]`

Mesuré (C3, `methodeSelection: 'tous'`, N = 4) : chemin riche **76,75**, retenus `A1, A2, A3, A4` — `_selectionnerArtefactsLegacy` (`profil-etudiant-actions.js:296-319`) applique `.slice(0, nombreARetenir)` **à tous les modes**, donc « tous » = les quatre premières de l'ordre de stockage ((85+60+78+70)/4 = 73,25 → 43,95 + 32,8) ; instance registre **69,9** — `pratique-pan-standards.js:219-222` prend tout ((85+60+78+70+78+0)/6 = 61,83 → 37,1 + 32,8). À la main, « tous » veut dire 69,9. L'assistant écrit `'tous'` quand l'enseignant le choisit (`wizard-pratique-v2.js:2731`).

**Disposition proposée : inscrire et continuer** (une seule règle, celle qui prend tout ; #394 avait réuni les deux systèmes sur « meilleurs » et « récents », pas sur « tous »).

### B-6 · Le P historique n'est pas la note du cours – moyen – `[lecture]` `[grep]`

`calculerIndicesHistoriques` (`snapshots.js:193`) délègue à `obtenirPratiqueActuelle().calculerPerformanceHistorique` (`:292-295`) — l'instance REGISTRE de la famille, pas la configurable. `[grep]` `grep -c calculerPerformanceHistorique` : `pratique-sommative.js` 1, `pratique-pan-standards.js` 1, **`pratique-pan-specifications.js` 0, `pratique-configurable.js` 0**. Donc : SOM et STD configurables → l'instance registre, qui lit la config de la pratique active (`_lireConfiguration`, #394 L10) — cohérent ; **SPE** → pas de méthode → le repli de `:311-330`, une conversion de `niveauFinal` **codée en dur** (I 40 / D 65 / M 75 / E 100) qui n'est ni un palier ni l'échelle de l'utilisateur ; **DEN** → `obtenirPratiqueActuelle` fabrique une PratiquePANStandards (E-5) → un P « portfolio » calculé sur des travaux, pas le jugement. Les trajectoires, les corrélations longitudinales et l'impact des jetons lisent ce P. Non rejoué (le module exige le calendrier).

**Disposition proposée : inscrire et continuer** (ferme l'item 13 de l'ultrareview lot 3 : le repli en dur est tenu, et atteint).

---

## C · Ce que la pratique fait des champs neufs de l'évaluation

### C-1 · Le brouillon « 95 sur 50 % » compte 95 partout où l'on calcule – majeur, #706 – `[exécuté]`

| famille | sans le brouillon | avec | mécanique |
|---|---|---|---|
| SOM (C2) | 86,57 | **87,5** ((8830 + 95)/102) | poids 1 |
| STD (C4) | 79,45 | **83,2** — retenus `A6, A1, A3, A5` : (95+85+78+78)/4 = 84 → 50,4 + 32,8 | il entre **en tête** de la sélection « meilleurs » |
| SPE (C5, D2 reprise à 75) | B = **80** | A = **100** | 95 ≥ 70 : le second examen devient acceptable |
| DEN (C6) | 78 | 78 | aucun effet |

`[grep]` `verrouillee` dans `js/pratiques/` → **0** ; `ponderationCouverte` → **0** (H-1 du premier audit, inchangé). La règle est pédagogique — **inscrit, #706** ; la mécanique attend la règle.

### C-2 · Le brouillon « 0 » à portée incomplète – `[exécuté]`

SOM (C1) : compte 0 au poids 1 — **86,57** avec, **87,43** sans (8830/101). STD : dans le pool ; sous « meilleurs » N = 4 il est *écarté* et compté dans `nombreEvalues` (6) ; sous « tous » ou N > nombre d'évaluations il **entre** : N = 10 → **69,9** au lieu de 77,32 sans lui (D4, C3). SPE (C5) : `0 < 70`, non acceptable, sans effet. DEN : rien. Depuis #697, ce `0` de portée 0 n'est plus écrit à la création ; le brouillon #674 (0 sur la moitié de la grille, niveau 0) l'est.

### C-3 · Points analytiques, SOLO « Aucun », verrou – sans effet – `[exécuté]` `[grep]`

Les cinq jeux portent un critère analytique en points (`points`, `pointsMax`, `pointsAnalytiques`) : aucune mesure ne bouge (les pratiques ne lisent que `noteFinale`, `niveauFinal`, `remplaceeParId`, `productionId`, `statutRemise`, et `statutIntegrite` dans le seul chemin riche, `profil-etudiant-actions.js:243-244`). `[grep]` `niveauSOLO` dans `js/pratiques/`, `portfolio.js`, `indices.js`, `profil-etudiant-actions.js` → **0**. `verrouillee` → 0 (C-1).

---

## D · Par famille, la règle configurée contre la règle calculée

### D-1 · SOM (#483) – fonctionne comme codé, tenu – `[exécuté]`

Pondérations 40 + 50 = 90 : la moyenne se normalise **sur 90** — (84×40 + 90×50)/90 = **87,33**, pas 78,6 (D1). Production évaluée deux fois, aucune remplacée : les deux comptent, chacune au poids 40 — 11230/142 = **79,08**, le récit compte 5 (D2). Production à pondération 0 ou sans pondération : **poids 1**, récit « comptée une fois · poids 1 % » (D3). Ce que dit #483 est mesuré et tenu ; la confirmation non bloquante à ≠ 100 est celle de l'écran, pas du calcul.

### D-2 · STD – fonctionne – `[exécuté]`

`nombreARetenir 10 > 6` : moyenne de toutes, brouillon compris, **69,9**, `nombreRetenus 6` (D4). Terminale absente des productions : **77,75**, `estProvisoire true`, `terminal.present false` ; présente mais non évaluée : 77,75, provisoire ; l'export dit `78, provisoire` (D5). Égalité à la coupure (N = 2 : 85 | 78, 78) : `A1, A3` retenus, A5 écartée — l'ordre de stockage départage, la note (81,7) ne dépend pas du choix, les deux systèmes concordent (D6, information). Reprise plus faible sur une évaluation déjà retenue (90 → 70) : **82,45 → 79,45** — la récence, décision documentée (skill §2 bis « transversal — reprises ») (D7).

### D-3 · SPE dans la forme que l'application écrit : 0 pour tout le monde – majeur – `[exécuté]` `[grep]`

Le moteur lit `configuration.typesTravaux[].seuilAcceptable` et `configuration.tableBundles[] { noteFixe, requis: { typeId: n } }` (`pratique-configurable.js:397-415` → `pratique-pan-specifications.js:632-727`), et apparie `production.type === typeTravail.id`. Or ce que l'application **écrit** est `configuration.forfaits[] { lettre, note, travaux: { 1: 2 } }` et `typesTravaux[] { id: 1, nom }` : le gabarit « Modèle simple » offert dans « Partir d'un modèle » (`pratiques-bibliotheque.js:60-80`), l'éditeur de gabarit (`pratiques-gestion.js:1855-2035`), l'ancien éditeur (`pratique-notation-v2.js:579-591`), et l'assistant, qui n'écrit **ni** l'un ni l'autre (`wizard-pratique-v2.js:2749-2770` : `seuilAcceptabilite`, `jetons`, `modeleBundle`). `[grep]` `grep -rn tableBundles js/` hors moteur, exploration et attributs → **0 écrivain** ; seul le pack de démonstration en porte (`pack-demo-20.js:14354`). Mesuré (D9, pratique dans la forme du gabarit) : `calculerPerformance` → **0** ; `indicesCP.P` **0, constructible** ; `simulerIndices` **0, constructible** ; export **`0, final`** ; récit `null`. À la main, avec les travaux du jeu : A (100) ou C (60) selon le forfait. Ce que l'enseignant verrait : 0 % pour toute la classe, au tableau de bord, dans chaque profil, dans le CSV — sans un mot.

⚠ **Tarir n'est pas réparer** : le défaut est de *lecture*. Les pratiques SPE déjà écrites chez les gens sont dans la forme `forfaits` ; un moteur qui la lirait les calculerait sans rien réécrire. Le stock n'a pas à être touché.

**Disposition proposée : corriger maintenant** (le moteur lit `forfaits` / `travaux` / `note` comme il lit `tableBundles` / `requis` / `noteFixe`, et un type de travail s'apparie par son `id` numérique OU son nom) — recoupe #465 « schéma SPE unifié ». **Ou inscrire**, si Grégoire sait qu'aucun collègue n'est en SPE à la mi-septembre : un correctif de moteur trois jours avant le 14 se juge à cette aune.

### D-4 · SPE : pièce manquante, palier perdu – fonctionne – `[exécuté]`

Sans dossier : **C = 60** ; avant la reprise (D2 à 75 acceptable) : **B = 80** ; après (65) : **C+ = 70** (D8). La reprise plus faible fait perdre le palier — c'est la récence, comme en STD ; la recherche (Talbert) retiendrait la meilleure tentative : décision pédagogique connue (skill §2 bis), pas un défaut.

### D-5 · DEN sans jugement : `null` partout – fonctionne – `[exécuté]`

Sans saisie (D10) : `calculerPerformance` **`null`** ; `indicesCP` `P 0, noteConstructible false` ; `simulerIndices` non constructible ; export **`'', non constructible`**. La partie « DEN note absente ⇒ null » de #465 est livrée (#318).

### D-6 · DEN : des identifiants de cibles changés plafonnent à 59 sans un mot – moyen – `[exécuté]`

Cible non confirmée → **59** (RREC, voulu). Identifiants de cibles **changés dans la configuration** (`cible-A`, `cible-B`) pendant que la saisie porte `cible-1`, `cible-2` → **59** aussi ; le récit dit « cible non confirmée » deux fois (D11). L'assistant nomme les cibles `cible-<n>` par position (`wizard-pratique-v2.js:2779-2781`) : réordonner ou réécrire la liste change les ids. C'est « ids de cibles stables » de #465, tenu.

**Disposition proposée : inscrire et continuer** (recoupe #465).

---

## E · L'échelle de la note globale

La chaîne est `lireNiveauNoteGlobale(da, P)` (`profil-etudiant-helpers.js:605-634`) → `obtenirPratiqueActuelle().obtenirEchelleNoteGlobale(da)` → `situerPourcentageDansEchelle` (bornes `min`/`max`, `:272-286`). Une seule lecture pour le profil et le tableau de bord ; l'export et le comparateur n'affichent aucun niveau ; la synthèse PDF lit l'échelle de la copie (`synthese-retroaction-data.js:376`), pas celle de la note du cours.

### E-1 · 79,46 → M ; entre deux bornes entières, rien – #701 recoupé – `[exécuté]`

STD, échelle à bornes entières (0-54 / 55-74 / 75-89 / 90-100) : **79,46 → M** ; **89,5 → aucun niveau** (`raison: hors-echelle`) ; **74,5 → aucun** ; 75 → M ; 89 → M (E1). Sur une copie, le même 89,5 monte à E (« le plus proche », banc B1 du premier audit, #701). La note du cours ne ment pas, elle se tait ; la copie, elle, monte. Même trou, deux réponses — à trancher avec #701.

### E-2 · Le niveau exige un texte de rétroaction – moyen – `[exécuté]`

`obtenirEchelleCommuneDesEvaluations` (`profil-etudiant-calculs.js:675-680`) ne retient que les évaluations dont `retroactionFinale` est **vrai**. Mesuré (E2, les mêmes évaluations sans texte) : `niveau null`, `raison aucune-evaluation`, message *« Aucune évaluation retenue pour cet élève : il n'y a pas de note globale à situer »* — sous un P de 79 %. Le filtre est hérité du dépistage (qui lisait la prose) ; pour situer une note, une évaluation sans texte reste une note.

**Disposition proposée : inscrire et continuer.**

### E-3 · Échelle remplacée (#648), échelle disparue – fonctionne – `[exécuté]`

Les évaluations désignent `E1`, le trimestre porte `E2 { idOriginal: 'E1' }` → résolue, **M** ; `E1` disparue sans successeur → `niveau null`, `raison echelle-non-resolue`, message nommé (E3).

### E-4 · SOM et SPE, sans niveau – fonctionne comme tranché – `[exécuté]`

SOM → `note-chiffree` (décision du 27 août) ; SPE → `pratique-sans-methode` (l'instance registre n'a pas `obtenirEchelleNoteGlobale`) : les deux sans code, l'explication au survol (E4).

### E-5 · DEN se lit « M » par la règle STD – moyen – `[exécuté]`

`obtenirPratiqueActuelle` (`profil-etudiant-helpers.js:640-690`) passe le **type** au registre ; `denotation` n'y est pas ; `obtenirPratiqueParId('denotation')` rend `null` ; le repli fabrique **`new PratiquePANStandards()`** (E5 : `obtenirId() === 'standards'`). Son `obtenirEchelleNoteGlobale` lit l'échelle des évaluations → le jugement 78 devient **« M 78 % »**, alors que la configurable DEN elle-même répond `note-chiffree` (« cette pratique n'établit pas sa note globale par niveaux »). Le tableau de bord et le profil montrent donc un niveau que la pratique refuse de donner. (Le même repli sert le P historique : B-6.)

**Disposition proposée : inscrire et continuer** (`obtenirPratiqueActuelle` résout l'id de la pratique active, pas son type — la configurable existe et répond).

### E-6 · #590 : l'IDME codée en dur de `construireConfigComplete` est atteinte, et muette – recoupé – `[exécuté]`

STD dont l'`echelleId` ne se résout pas : `config.echelle.niveaux` = **50 / 65 / 80 / 95** (`pratique-registre.js:263-271`) ; sans `min`/`max`, `situerPourcentageDansEchelle` rend `null` ; la note (79,45) n'y touche pas (E6). Ce qu'elle fabriquerait, c'est un niveau, et elle n'y arrive pas : silencieux, pas faux. Tenu, déjà #590.

---

## F · Non calculable

### F-1 · Le zéro « constructible » du premier calcul – majeur – `[exécuté]`

Mesuré (F1, jeux SOM et SPE, `indicesCP` vide) : première passe de `calculerEtStockerIndicesCP` → **`P 0, noteConstructible true`** pour l'élève ; seconde passe → **87** / **70**. Cause : `pratique.calculerPerformance(da)` (repli légitime pour SOM/SPE/DEN, `portfolio.js:639-641`) → `PratiqueConfigurable.calculerPerformance` lit `indicesCP` **avant** de déléguer et rend `0` s'il n'y a pas d'entrée (`:178-183`) ; et la délégation SPE convertit `null` en `0` (`:414`). DEN court-circuite avant le cache : juste dès la première passe (B5). Mesuré (F2) : **l'export lancé avant toute passe écrit `0, final`** pour l'élève SOM ; après une passe, `87, final`. Quand : premier chargement d'un trimestre, élève ajouté depuis le dernier recalcul, données importées, ou un élève exclu puis réintégré. Le tableau de bord et les prioritaires lisent ce 0 comme un vrai zéro (le badge n'est retenu que si `noteConstructible === false`, `tableau-bord-apercu.js:375`).

**Disposition proposée : corriger maintenant** — `return null` au lieu de `0` aux deux sites (le cache vide n'est pas une note), ce qui rend « non constructible » à l'export et « — » aux écrans jusqu'au premier calcul. Deux lignes, une sentinelle (celle de #395 couvre le cache présent, pas le cache vide).

### F-2 · Par famille, sans évaluation – fonctionne, sauf SPE – `[exécuté]`

(B6.) SOM : instance `null`, configurable `null`, export `'', non constructible`. STD : chemin riche `null` → non constructible, export vide. DEN sans saisie : `null`, export vide. **SPE** : instance registre `null`, **configurable `0`** (`:414`), `indicesCP` `0, constructible`, export **`0, final`**. Un élève sans aucun travail sous une SPE sort à 0 %, quand le palier d'échec configuré (F = 50) serait déjà la réponse honnête, et « non constructible » la réponse juste.

### F-3 · L'export arrondit à l'entier – mineur – `[exécuté]`

`construireLignesSynthese` écrit `r.P` (`export-resultats-finaux.js:99`), c'est-à-dire `Math.round(P_decimal × 100)` : **79** pour 79,45, **87** pour 86,57 (F3). La section « Note finale de session » du profil affiche `toFixed(1)` → **« 79.4 »** (79,45 est 79,4499… en flottant ; le bruit B-3 du premier audit). Trois écritures du même nombre : 79 · 79.4 · 79,45. Ce qu'un collègue remet à Omnivox vient du CSV.

**Disposition proposée : inscrire et continuer** (l'export écrit `noteFinale` à une décimale quand elle existe, et le dit dans l'en-tête).

---

## G · Les jetons décident quelle évaluation compte

`evaluation-jetons.js` a reçu #141, #328 L2-c, #563, #607, #612 depuis l'ultrareview du 1er mai (`git log --since=2026-05-01`). Les onze constats sont **remesurés un à un dans `Rapports/ultrareview-lot-4a-evaluation.md`** (4 périmés, 1 à commenter, 6 tenus) ; ici, ce qui touche la note du cours.

### G-1 · Retirer la reprise restaure l'originale – fonctionne (N3 périmé) – `[exécuté]`

`retirerJetonReprise('EV_S2_NEW')` : `remplaceeParId` et `archivee` disparaissent de l'originale, la reprise est supprimée, la note SOM passe de **86,57 à 63,04** (6430/102 : l'originale à 50 compte de nouveau) (G1). La question du prompt — « une reprise retirée laisse-t-elle l'originale remplacée ? » — non, plus depuis #141 (`:642-648`, la branche « garder la reprise » est retirée).

### G-2 · La reprise hérite du jeton de délai – moyen – `[exécuté]`

Originale avec `jetonDelaiApplique` → `appliquerJetonReprise` → `compterJetonsUtilises(da, 'delai')` passe de **1 à 2** ; la reprise naît avec la note et le niveau de l'originale, non verrouillée (G2 ; `:504-520`, le spread ne remet pas les champs de délai). L'élève « épuise » un délai qu'il n'a pas demandé. **Disposition proposée : inscrire et continuer.**

### G-3 · Une originale déjà remplacée sans jeton (réconciliation #360) – mineur – `[exécuté]`

Le cas général est bloqué par `maxParProduction` ; reste le doublon réconcilié : la reprise naît avec `remplaceeParId` hérité et **n'entre dans aucun calcul** (G3). **Disposition proposée : inscrire (mineur)** — ou refuser, si Grégoire tient le geste pour impossible à l'écran.

### G-4 · `archiverOriginale: false` – information – `[exécuté]`

L'originale est supprimée, `repriseDeId` la désigne encore ; retirer ensuite le jeton nettoie les marques sans restaurer, la note reste 60 (G4). Cohérent en aval. **Commenter et oublier.**

### G-5 · Succès avant l'écriture – mineur – `[exécuté]`

Écriture refusée : notifications **`succes` puis `erreur`** (G5 ; `:624`/`:681` avant `:703`). **Inscrire (mineur).**

### G-6 · #617 tenu – `[exécuté]`

Écriture refusée : le fichier de la reprise est **à la corbeille**, la reprise **subsiste** (G6). Déjà inscrit.

### G-7 · `jetonsEtudiants`, clé nue écrite à la lecture – moyen – `[exécuté]` `[grep]`

Lire le statut des jetons **écrit** `jetonsEtudiants` (`initialiserJetonsEtudiant`, `:784-791`) ; `attribuerJetonPersonnalise(da, 'delai')` écrit `jetonsEtudiants[da].delai = 1` pendant que le compte affiché (lu des évaluations) reste **0** ; `grep -n jetonsEtudiants js/trimestres.js js/reserve.js js/db.js` → **0** : la clé est hors registre, **nue**, partagée entre trimestres, invisible aux archives et à la Réserve (G7). Trois constats du 1er mai (N6, N7, H3) tiennent à cette seule clé. **Disposition proposée : inscrire et continuer.**

### G-8 · `archivee` n'est lu par aucun calcul – information – `[exécuté]` `[grep]`

`grep -rn "\.archivee\b" js/` hors écritures → une recopie (`evaluation.js:1836`). Une originale « archivée » dont on retire `remplaceeParId` **compte** : 73,02 (11830/162, les deux P2 comptent) (G8). La seule décision est `remplaceeParId` — c'est simple, et c'est bien.

---

## H · Ce que les golden masters protègent encore

Sept mutations d'un point, suite complète relancée à chaque fois (`cd tests && npx vitest run`), restauration par `git checkout --` et empreinte SHA-256 vérifiée identique, `git diff` vide après chacune. Script : `scratchpad/break-tests-H.sh` (hors dépôt).

| mutation | fichier · ligne | ce qui rougit (hors les deux bancs d'audit) | verdict |
|---|---|---|---|
| H1 · SOM `indiceP = (moyenne + 1)/100` | `pratique-sommative.js:130` | `golden-master-calcul-sessionC` (2), `sentinelle-recit-calcul-c2b` (parité), `sentinelle-configurable-som-plat-395`, `sentinelle-cache-lecture-pipeline-397` | **protégé** (18 rouges au total, dont 10 du banc de cet audit et 3 du premier) |
| H2 · STD riche `agrégation + 1` | `profil-etudiant-actions.js:377` | `sentinelle-recit-calcul-c2a` (parité 83,4), `sentinelle-reunification-std-394` (4) | **protégé** (14) |
| H3 · STD instance `(moyenne + 1)/100` | `pratique-pan-standards.js:281` | `sentinelle-reunification-std-394` (4) — aucun golden master propre | **protégé par la parité #394** (8) |
| H4 · SPE `palier.noteFixe + 1` | `pratique-pan-specifications.js:720` | `sentinelle-recit-calcul-c2c` (4) | **protégé** (9) |
| H5 · hybride `noteFinale + 1` | `portfolio.js:1006` | `golden-master-hybride-indiceP-339` (1) — **et rien d'autre** | protégé par son seul golden |
| H6 · DEN `Math.min(note, 60)` | `pratique-configurable.js:306` | `denotation-moteur-DEN1`, `decrire-calcul-denotation-333` | **protégé** (3) |
| H7 · `simulerIndices` `P + 1` | `portfolio.js:761` | `sentinelle-recit-calcul-c2d0` (3), `sentinelle-note-non-constructible-326` (5), `sentinelle-simuler-indices-307` (3), `sentinelle-reunification-std-394` (1) | **protégé** (20) |

**Ce qu'ils couvrent** : la moyenne pondérée SOM (fixture 40/60, remplacée et `null` exclues), l'agrégation STD portfolio + terminale et la parité des deux systèmes (#394 : meilleurs, récents), le palier SPE avec `tableBundles`, la note hybride catégories, la garde DEN à 59, l'aiguillage de `simulerIndices`. **Ce qu'ils ne couvrent pas** (et que le banc de cet audit fige désormais) : le cache vide qui rend 0 (F-1), la forme `forfaits` (D-3), le mode « tous » (B-5), la résolution des pointeurs (A-1 à A-4), le niveau global d'une DEN (E-5), l'héritage des jetons (G-2), le panneau du profil (B-4), l'export en entier (F-3). `c2d0` ne protège aucun arithmétique : ses instances sont des stubs.

---

## Ce qui fonctionne, avec la preuve

- **Les deux systèmes concordent** sur le nombre principal des quatre familles, et l'export dit le même nombre que le profil (B1, B2, B4, B5 ; #394 tient sur « meilleurs » et « récents »).
- **La reprise remplace** dans les quatre familles ; retirer le jeton restaure l'originale et la note suit (G1, D7, D8) ; `remplaceeParId` est la seule décision, `archivee` n'en est pas une (G8).
- **DEN sans jugement rend `null`**, l'export écrit « non constructible », jamais 0 ni une moyenne (D10) ; une cible non confirmée plafonne à 59 (D11, RREC).
- **STD** : N plus grand que le nombre d'évaluations, terminale absente ou non évaluée (provisoire, et l'export le dit), égalité à la coupure — tous rendent ce que la règle dit (D4, D5, D6).
- **SPE avec `tableBundles`** : pièce manquante, palier perdu par une reprise plus faible — la règle tout-ou-rien est juste (D8, B4).
- **SOM** : la pondération normalise sur la somme déclarée, le poids 1 et la double évaluation sont ceux de #483, mesurés (D1-D3).
- **L'échelle remplacée est suivie** (`idOriginal`, E3) ; une échelle disparue est nommée, pas devinée ; 79,46 se lit M ; SOM répond « note chiffrée » comme tranché le 27 août (E1, E4).
- **Les points analytiques, le SOLO « Aucun » et le verrou** n'entrent pas dans la note du cours — sans effet, mesuré (C-3) ; ce qui est aussi la moitié du problème (C-1).
- **Sept golden masters et sentinelles** rougissent au bon endroit quand on déplace un calcul d'un point (H).
- **Un trimestre archivé lit ses propres pratiques** (`cle()`, #622-B3, `obtenirTypePratiqueActive(contexte)`) — lu, non rejoué (A-5).

## Ce que je n'ai pas regardé

- **Le navigateur.** Aucune spec Playwright n'a tourné ; le panneau du profil (B-4) est rendu dans un faux DOM, pas affiché ; le comparateur (`comparateur-pratiques.js`) est lu à travers `simulerIndices` (son contrat), pas rendu ; la synthèse PDF au-delà de `construireNoteProvisoire` (qui ne répond que pour STD, `synthese-retroaction-data.js:1131-1136`) n'est pas rejouée.
- **Les données réelles de Grégoire** (interdit par le prompt) : combien de groupes-cours portent un pointeur legacy (A-2), une pratique en `.config` (A-3), une SPE en `forfaits` (D-3) ; A2025 et H2026 ne se rouvrent pas.
- **Le filtre par cours de `obtenirDonneesSelonMode`** (`modes.js:670-700`) : mon miroir lit le store entier ; un élève dont les évaluations portent un `coursId` d'un autre groupe n'a pas été mesuré.
- **Le P historique** (B-6) : lu et compté par `grep`, non rejoué (`calculerIndicesHistoriques` exige le calendrier et les échéances).
- **L'import et le remap** (#663, #664, `reserve-ouvrir.js`) : la forme `.config` est mesurée en aval (A-3), pas le chemin d'import lui-même ; ni le partage d'une pratique entre collègues.
- **Les repères de maîtrise** (#577, #579) : le niveau global se lit par `min`/`max`, les repères n'y entrent pas — non remesurés.
- **`pratiques-predefines.js`** (#690, 821 lignes) et `PratiqueManager.migrerVersBibliotheque` (`:159`, lecteur de `PRATIQUES_PREDEFINES`) : non mesurés.
- **`pratique-notation-v2.js`** (#592) et le vieil éditeur : lus pour la forme `forfaits` (D-3), pas exécutés.
- **Les indices A et C** : hors périmètre ; les cinq constats du lot 3 qui les touchent (1, 2, 12, 17, 19) sont **tenus par lecture** et inscrits dans l'ultrareview, non remesurés au banc.
- **Le mode hybride (catégories)** : couvert par son golden master (H5), pas par un élève de banc.

## Rien d'appliqué — au moment de l'audit

↻ **Le même jour, en soirée, après arbitrage, le lot 1.122.0 a modifié onze fichiers de `js/`** (#706 : `pratique-registre.js`, `pratique-sommative.js`, `pratique-pan-standards.js`, `pratique-pan-specifications.js`, `profil-etudiant-actions.js`, `portfolio.js`, `indices.js`, `export-resultats-finaux.js`, `profil-etudiant-sections-affichage.js` ; #708 : `pratique-pan-specifications.js`, `pratique-configurable.js` ; #709 : `pratique-configurable.js` ; deux commentaires : `evaluation-jetons.js`, `profil-etudiant-actions.js`) ; le paragraphe qui suit décrit l'état au dépôt du rapport, 16 h 50.

Aucun fichier de `js/` n'est modifié (`git status` : seuls des `.md` et le banc). La branche `audit/pratique-de-notation-2026-09-05` porte ce rapport, le banc `tests/unit/audit-pratique-de-notation-2026-09-05.test.js`, les deux ultrareviews complétées, le prompt passé à `statut : exécuté`, la ligne de `OU-EN-EST-ON.md`, et les trois fichiers de Cowork qui attendaient dans l'arbre ; `main` n'a pas été touché et **la branche n'est pas poussée** : Grégoire arbitre. Les dispositions ci-dessus sont des propositions ; chaque constat recevra alors, dans ce fichier, *inscrit* (n°), *refusé* (motif) ou *périmé*.
