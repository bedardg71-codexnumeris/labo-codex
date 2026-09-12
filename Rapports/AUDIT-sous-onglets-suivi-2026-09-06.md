# AUDIT – Les six sous-onglets de Suivi : ce que l'écran montre est-il ce que la base contient, chaque geste fait-il ce que son libellé promet, et ce qu'il écrit se relit-il, entier, au bon endroit, sans se perdre par un geste ordinaire ?

**Date** : 6 septembre 2026, 10 h 12 – 11 h 05 (Toronto).
**Cadré par** : `Rapports/prompts-audit/PROMPT-AUDIT-sous-onglets-suivi-2026-09-06.md` (Cowork, avec Grégoire). Quatrième audit cadré : le complément du troisième (`Rapports/AUDIT-onglet-suivi-2026-09-05.md`, la chaîne des indices, jugée), qui n'est pas remesuré ici.
**Base auditée, mesurée** : branche `audit/sous-onglets-suivi-2026-09-06`, partie de `main` = `origin/main` = `2fb1facf` (1.123.5, build `0906-0902`, `cat version.json` = `{"build":"0906-0902","beta":"1.123.5"}`). Une autre session Claude Code travaillait en parallèle dans l'arbre principal (#765, sélecteur de production coupé, poussé en 1.123.6 = `126b41ce` pendant l'audit) : cet audit a tourné dans un worktree séparé, sur `2fb1facf`, et n'a rien mesuré de 1.123.6. **`js/` intact** : `git status -- js/` propre à la fin, empreintes MD5 des trois fichiers mutés par les break-tests identiques avant et après.
**Vitest, depuis `tests/`** (`npx vitest run`) : **490 fichiers / 5 425 tests verts** avant le banc (10 h 14, worktree, sans la sentinelle #765 non commise de l'autre session) ; **le banc ajoute 34 mesures, 34 vertes** (`tests/unit/audit-sous-onglets-suivi-2026-09-06.test.js`, un `describe` par sous-onglet).
**Navigateur** : Playwright **WebKit local** seulement (rien de poussé qui déclenche Playwright sur la CI), mode démonstration (pack 20 élèves, 11 productions, 202 évaluations, 627 présences, 0 intervention) et espace vide, aux deux viewports 1024 × 768 et 1366 × 1024. **30 captures** dans `_to_delete/captures-audit-suivi-2026-09-06/` (git-ignoré), nommées `<vide|demo>_<viewport>_<sous-onglet>.png`, plus six captures de sondes (`sonde*_*.png`) et les mesures brutes (`mesures.json`, `sonde-1.json` à `sonde-3.json`). Les états, nombres et libellés sont lus au **texte** (`innerText`, `textContent`, géométrie `getBoundingClientRect`), pas à l'œil.
**Périmètre recompté** (`wc -l`, 6 septembre 10 h 42) : identique au prompt pour les six modules cités (`tableau-bord-apercu.js` 3 247, `etudiants.js` 1 602, `trimestre-v2-etudiants.js` 1 019, `saisie-presences.js` 2 187, `profil-etudiant-sections-affichage.js` 4 795, `-actions.js` 803, `-confidentiel.js` 325, `-rapport.js` 395, `graphiques-progression.js` 4 773, `interventions.js` 1 558, `consolidation.js` 769, `boite-outils.js` 1 211) ; s'y ajoutent trois modules que la navigation a rendus nécessaires : `presences-rapport.js` 650 (le PDF des présences n'est **pas** dans `saisie-presences.js`), `profil-etudiant-diagnostics.js` 896 (une écriture de plus dans le profil), `modes.js` 1 306 (frontière, un plantage mesuré). Total : 25 536 lignes.
**Écritures recomptées** : le compte du prompt (`grep -c 'setSync('`) donnait 18 sites ; l'audit en dénombre **37 sites d'écriture atteignables depuis les six sous-onglets** (directes et indirectes, `db.setSync`, `db.set`, `db.modifier`, `sessionStorage`), dont **12 sous clé NUE** non namespacée par trimestre. Le détail est dans chaque section ; la synthèse en §7.

**Ce que le troisième audit avait jugé et qui n'est pas rejugé** : les fiches #735 à #754. Quand une mesure y ramène, la fiche est citée et le constat se limite à ce qu'elle **produit** à l'écran ou en base. Ce que 1.123.2 à 1.123.5 ont corrigé le matin (#761 à #764) n'a pas été remesuré ; aucune régression n'a été rencontrée en chemin.

> ↻ **11 sept. 2026 — décision de Grégoire (12 h 31) : les 35 « inscrire » et 7 « commenter » sont versés au cadrage 11
> (`plans de travail/CADRAGE-2026-09-11-onglet-suivi-lecture-du-depistage.md`, § 7), lot par lot, un par sous-onglet.
> Lot 1 (§ 1, Suivi du groupe) : consigne du 11, livré en 1.131.0 — G-1, G-2, G-3, G-4, G-5, G-8 corrigés ; G-6 commenté ;
> G-7 PÉRIMÉ (les deux fonctions de badge n'avaient plus d'appelant depuis #303, retirées) ; le filtre M inscrit (#828).**

**Verdicts** : `[exécuté]` = le banc Vitest (fonction réelle, `db` de banc, rechargement = window neuf sur le même store) ; `[navigateur]` = WebKit local, capture nommée ; `[lecture]` = code lu, `grep` cité, non exécuté.

---

## 0 · Les « corriger maintenant » de tout le rapport — la page à arbitrer

Un seul niveau est proposé « corriger maintenant » : ce qui casse un parcours que la cohorte du 14 va emprunter, ou ce qui viole une règle non négociable de `CLAUDE.md`. Tout le reste est « inscrire » (défaut) ou « commenter ». Grégoire tranche, une ligne à la fois.

| # | Où | Ce que Grégoire lira | Preuve | Correctif attendu |
|---|---|---|---|---|
| **CM-1** | `js/modes.js:310` et `:338` (frontière, hors des six modules mais sous chacun d'eux) | **Le mode anonymisation plante sur tout trimestre qui n'a pas encore de mapping** : `doitRegenerer = true` sans déclaration, sous le `'use strict'` de la ligne 9 → `ReferenceError: Can't find variable: doitRegenerer` à **chaque lecture** de `groupeEtudiants` — les six sous-onglets deviennent vides ou muets (graphiques en erreur, listes vides). Mesuré au **vrai geste** `basculerModeAnonymisation()` en démo (sonde 5). Introduit le 22 février (`8b739ae3`), sous un `'use strict'` posé le 7 février (`238b17c5`). Absent de BACKLOG et de SUIVI-BUGS. H2026 a un mapping ancien, d'où le silence ; **A2026 et la démo n'en ont pas**. | `[navigateur]` sonde 5 : `lecture: "ERREUR Can't find variable: doitRegenerer"`, 3 erreurs de page | `let doitRegenerer = false;` en tête de `genererMappingAnonyme` (`:279`) + sentinelle. Un mot. |
| **CM-2** | `js/saisie-presences.js:2023` (barre du compteur reconstruite) | **Le bouton « Annuler » de la saisie vide l'onglet Suivi** : il vise `suivi-apercu-legacy`, une sous-section qui n'existe pas (`config.js:62-69`) ; `afficherSousSection` retire `.active` de toutes les sous-sections et n'en réactive aucune → **aucune sous-section active**, zone blanche jusqu'au prochain clic d'onglet. Et la même reconstruction (`restaurerCompteurPresences`, `:2007`) **fait disparaître le bouton « Rapport »** (`index.html:8003`) dès qu'une date est choisie : la modale du rapport PDF n'est plus atteignable après le premier rendu. | `[exécuté]` S-5 ; `[navigateur]` sonde 3 : `apres: []`, erreurs `❌ afficherSousSection() : ID inconnu` | `data-param="suivi-liste"` (ou `suivi-groupe`) et rendre le bouton « Rapport » dans la barre reconstruite. Break-test fait : S-5 rougit sur la mutation. |
| **CM-3** | `js/interventions.js:363` (titre), `:793` (description), `:780`, `:824` (attributs) | **Règle 1 non négociable violée** : le titre d'une intervention entre brut dans l'innerHTML de la liste (le formulaire, lui, l'échappe `:735`) ; la description entre brute dans son `<textarea>` — exactement le motif corrigé pour `observations` en #733, six lignes plus bas. Mesuré en navigateur : `Sonde <b>3</b>` s'affiche **en gras** dans la liste. | `[exécuté]` I-4 ; `[navigateur]` sonde 3 `titreRenduGras: true` | `echapperHtml` sur les quatre sites + étendre la sentinelle #733. Break-test fait : I-4 rougit. |
| **CM-4** | `js/boite-outils.js:387` (nom, prénom), `:891` (texte de question), `:829`, `:962` (nom de catégorie) | **Règle 1 violée dans la modale du tirage** : `${e.nom}, ${e.prenom}` bruts, la seule injection nominative non échappée du module (les treize autres le sont). Cette modale est **projetée** si l'enseignant l'ouvre en classe. | `[exécuté]` A-3 `nomBrut: true` | `echapperHtml` sur les quatre sites. |
| **CM-5** | `js/trimestre-v2-etudiants.js:801` (Cadre › Trimestre, l'entrée des élèves) | **Confirmer un import CSV écrit les élèves puis plante** : `etudiants` est le paramètre du mutateur refermé à `:785` ; sous `'use strict'`, `ReferenceError: etudiants is not defined` **après** l'écriture → pas de « N étudiant(s) importé(s) », la fonction sort en rejet. C'est le premier geste des collègues le 14. | `[exécuté]` L-7 : 6 fiches écrites, `ReferenceError`, 0 notification de succès | Utiliser `verification` (`:789`), déjà calculé et inutilisé. |
| **CM-6** (à arbitrer, la règle « inscrire » pourrait l'emporter) | `js/interventions.js:1277-1283` et `:1224` | **Enregistrer une intervention efface ce qu'on n'a pas coché** : `notesIndividuelles` est reconstruit à partir des seuls élèves cochés → décocher un absent **détruit sa note** ; ouvrir une intervention planifiée sous un autre groupe-cours et l'enregistrer sans rien toucher **retire tous ses participants et leurs notes** (le formulaire ne construit des cases que pour le groupe actif). Perte par geste ordinaire, sans avertissement. | `[exécuté]` I-2, I-3 | Fusionner `notesIndividuelles` (conserver les DA non présents dans le formulaire) ; ne pas réécrire `etudiants` avec les seuls cochés du groupe courant. Règle pédagogique en jeu : une intervention est-elle par groupe-cours ? (#746) |

Ce qui **n'est pas** dans cette table mais qu'un collègue verra le 14 en démo : après avoir activé la démo, l'onglet **Saisie des présences affiche « Configuration incomplète — aucune séance rattachée »** alors que l'horaire démo a deux séances (le bandeau n'est évalué qu'au démarrage, `:55` → `:880`), et la date de séance est vide (rien ne pointe la dernière séance) ; un rechargement corrige le bandeau. Inscrit (§3, S-6).

---

## 1 · Suivi du groupe — `#suivi-groupe` (`index.html:7469-7708`), `js/tableau-bord-apercu.js`, `js/graphiques-progression.js`, `js/export-resultats-finaux.js`

### 1.1 Tableau des gestes

Dix-huit gestes : huit `data-*` dans `index.html`, trois dans le HTML généré, et **sept câblés par `addEventListener` sans `data-action`** — invisibles au `grep` du prompt, et ce sont ceux qui écrivent.

| Geste (où) | Fonction | Effet mesuré | Écrit ? |
|---|---|---|---|
| `data-on-change="rafraichirGraphiqueSpaghettiACP"` (`#selecteur-indice-acp`, `:7588`) | `graphiques-progression.js:2077` | reconstruit le graphique sur A, C ou P | non |
| `data-on-change="selectionnerEtudiantACP"` (`:7596`) | `:2086` | verrouille la courbe d'un élève | non |
| `data-action="ouvrirProfilEleveACP"` (`:7599`) | `:2130` → `tbNavigerVersProfil` (`tableau-bord-apercu.js:2976`) | ouvre Suivi › Profil | indirect (§4) |
| `data-on-change="changerMesureTrajectoires"` (`:7633`) | `tableau-bord-apercu.js:3120` | bascule Note ↔ Habiletés, force la médiane à `false` en Habiletés | non |
| `data-on-change="selectionnerEtudiantTrajectoires"` (`:7640`) | `graphiques-progression.js:4664` | idem, trajectoires | non |
| `data-action="ouvrirProfilEleveTrajectoires"` (`:7643`) | `:4638` | ouvre Suivi › Profil | indirect |
| `data-on-change="rafraichirGraphiqueTrajectoires"` (`#trajectoires-toggle-mediane`, `:7646`) | `:4594` | reconstruit | non |
| `data-action="exporterSyntheseResultatsCSV"` (`:7699`) | `export-resultats-finaux.js:174` | CSV lecture seule (BOM, CRLF, anti-formules) | non |
| `data-on-change="togglerCritereTrajectoires"` (généré `tableau-bord-apercu.js:3091`) | `:3153` | filtre les critères | non |
| `data-action="naviguerVers" conception grille-criteres` (généré `:2099`, bouton « Critères ») | `navigation.js:648` | navigation | non |
| `data-action="ouvrirReferenceSoloAccompagnement"` (généré `:2104`) | `:3172` | Labo › Accompagnement, accordéon SOLO | non |
| **clic `#btn-toggle-panneau-prioritaire` « Détails »** (`:947-968`) | — | **seul geste qui ouvre le panneau de suivi** ; calcule et rend la liste | indirect (auto-guérison `seuilsInterpretation`, nue) |
| **clic sur le nom d'une pilule `.etudiant-suivi-item`** (`:923-936`) | `ajouterEtudiantSuivi` / `retirerEtudiantSuivi` (`:61`, `:76`) | ajoute/retire de la liste suivie | **oui — `etudiantsSuivis`, clé NUE (`:45`)** |
| **clic sur les badges A/C/P d'une pilule** (`:909-922`) | `afficherProfilComplet` + `changerSectionProfil('mobilisation')` | ouvre le profil, section Engagement | indirect (§4) |
| **clic `#btn-reinitialiser-suivi`** (`:935-940`) | `sauvegarderEtudiantsSuivis([])` | vide la liste | **oui — clé nue** |
| **clic `.prioritaire-tri-btn`** (`:971-991`) | `appliquerFiltres` (`:166`) | ce sont des **filtres** (libellé « Filtrer : », `:292`), pas des tris | non |
| **clic `.barre-etudiant`** (`:994-1046`) | — | infobulle sur un point de distribution | non |
| `#btn-toggle-panneau-suivi` (`:896-906`) | — | **handler mort** : aucun élément ne porte cet id | — |

### 1.2 Logique propre

**G-1 · La liste suivie : le sixième refus est silencieux, et un DA hors du groupe est accepté** – mineur – `[exécuté]`
Cinq ajouts acceptés, le sixième `return false` (`:63`) sans notification ni `alert` (0 mesuré). Plus inattendu : `ajouterEtudiantSuivi` ne vérifie pas l'appartenance au groupe-cours — le DA d'un élève de GC2 est accepté (`true`), puis retiré par le nettoyage de l'ajout suivant. **Ce que l'enseignant voit** : un sixième clic qui ne fait rien. **Disposition : commenter et oublier** (le message), **inscrire** avec #749 (la porte).

**G-2 · Changer de groupe-cours puis afficher le panneau : la liste suivie du groupe A est PURGÉE en base, pas filtrée** – MAJEUR, produit de #749 – `[exécuté]`
`nettoyerEtudiantsSuivis` (`:49-59`) filtre la liste par les DA du groupe actif **et réécrit le résultat** si la longueur a changé (`:56`). Comme la clé est nue et partagée, ouvrir le panneau sous GC2 écrit `[]`, et le retour sous GC1 lit `[]`. Mesuré : `avant ['2000001','2000002']` → sous GC2 `[]`, écriture `[[]]` → retour GC1 `[]`. Le rapport du 5 (#749) disait « clé nue partagée entre trimestres » ; **ce qui est neuf** : ce n'est pas un affichage croisé, c'est une **perte définitive à la simple consultation** d'un autre groupe-cours — et Grégoire a deux groupes cet automne. **Disposition : inscrire** — ajouter ce paragraphe à #749 ; le correctif est « une liste par groupe-cours » (`cle()` + id de groupe-cours), sans purge en écriture.

**G-3 · Un élève passé en « abandon » garde son siège** – mineur – `[exécuté]`
`nettoyerEtudiantsSuivis` compare contre `obtenirEtudiantsCoursActif()` sans `estEtudiantExclu` ; l'affichage (`:253`) l'applique. L'élève reste dans la liste (mesuré `['2000001','2000002']` avec 2000001 en abandon) et n'est plus affiché : un des cinq sièges est occupé, invisible, et le compteur `(n/5)` le compte. **Disposition : inscrire** avec #749.

**G-4 · Les « boutons de tri » sont des filtres, et le filtre P retient un élève dont le P est affiché « — »** – mineur – `[exécuté]`
Le libellé injecté est « Filtrer : » (`:292`) ; les ids `prioritaire-tri-*` et `trierEtudiantsPrioritaires` (`:219`) sont des vestiges. Le filtre `P < 65 %` teste `e.P` (`:174`) ; un élève dont `noteConstructible === false` a un `e.P` numérique et un badge « — » (`:378`) : il est retenu (mesuré `['2000003']`). Les critères réels : `P` → `e.P < 65` ; `M` → `(A+C)/2 < 65`, une valeur qui n'est affichée nulle part ; `Suivi` → `ipb ≥ 2` ; `RàI 2-3` → `niveau ≥ 2` ; `A→Z` → tout effacer. Ordre : score d'urgence décroissant puis nom (`:194-216`, stable). **Disposition : inscrire** (filtrer sur ce qu'on montre : `noteConstructible`).

**G-5 · Le panneau `#panneau-prioritaire` est mort** – mineur – `[lecture]`
`index.html:7516-7525` (`#panneau-prioritaire`, `#prioritaire-tri-boutons`, `#liste-etudiants-prioritaire`) : `grep -rn "prioritaire-tri-boutons\|liste-etudiants-prioritaire" js/ index.html` → une occurrence chacune, la balise HTML. Aucun code n'ajoute `.ouvert` à `#panneau-prioritaire` (`styles.css:11686`, `display:none`). Seul `#compteur-prioritaire` est mis à jour (`:1189`), dans un conteneur invisible. Le panneau réel est `#panneau-suivi-etudiants` en mode « Détails ». Le microcopy `index.html:7522` « Cliquer → profil » décrit le panneau mort ; le chemin vivant vers le profil (les badges A/C/P, seulement en mode Détails) n'est écrit nulle part. **Disposition : inscrire** (retirer le HTML mort, dire où cliquer).

**G-6 · État conservé** – constat – `[lecture]`
Une seule chose survit : `etudiantsSuivis`. Perdus au rechargement : mode Détails (le panneau est donc **inaccessible** tant qu'on n'a pas recliqué « Détails »), filtres, indice choisi, élève en relief, médiane, critères cochés. Asymétrie : le sélecteur d'élève des trajectoires restaure sa valeur après un re-rendu en session (`graphiques-progression.js:4562`), celui de l'ACP la perd (`:2056`, `innerHTML` réécrit). **Disposition : commenter** (l'asymétrie), le reste est une position.

### 1.3 Affichage — `[navigateur]` captures `demo_*_groupe.png`, `vide_*_groupe.png`

- **État vide** (`vide_1024x768_groupe.png`) : « — | — | 0 personne », les trois cartes A/C/P sans aucune barre ni texte sous leur titre ; les barres SOLO et RàI à `0 (0%)` ; les graphiques vides. Rien de faux ; rien qui dise « saisis des présences pour commencer » à cet endroit (le bandeau d'état vide de `etats-vides.js:126` est ailleurs). Position, pas défaut.
- **Démo** : `92 % · 95 % · 76 %`, distribution `0 · 7 · 9 · 4`, RàI `13 / 5 / 2` — cohérents avec la Liste (13 + 5 + 2 = 20, mêmes badges par ligne, sonde 1). Deux textes tronqués mesurés (`scrollWidth` > `clientWidth` de 5 à 12 px) : les libellés `μ=92% | ±1σ: 17/20 (85%)` des barres A et C, aux deux viewports (`tronques` de `mesures.json`) — coupés d'un caractère ; mineur, **commenter**.
- **Sans pratique de notation** (G-7, `[exécuté]` + `[lecture]`) : `determinerModeAffichageTableauBord(null)` → `{afficherSom:false, afficherPan:true}` et `genererBadgePratique()` → « Alternative - Maîtrise (IDME) », `genererBadgeSourceDonnees` → « Source : PAN » (`:781-852`) : **des badges affirmatifs pour une configuration qui n'existe pas**, aucun « Aucune pratique configurée ». **Disposition : inscrire.**
- **Démo, dépistage muet** : **520 avertissements console** « Pas de grille de référence - calcul moyennes critères récents impossible » (`profil-etudiant-calculs.js:984`) à l'ouverture du Suivi — le pack démo ne pose pas `grilleReferenceDepistage` (`grep` sur `demo-namespace.js`, `demo-activation.js`, `pack-demo-20.js` : 0). Conséquence visible : la famille « Défi spécifique » est à `0 (0 %)` en démo et le suivi des fondations n'a rien à surveiller. Ce n'est pas la chaîne (jugée) : c'est le **pack** qui n'exerce pas ce que la carte montre. **Disposition : inscrire** (poser la grille de référence dans le pack).
- **Cibles tactiles** : 9 contrôles sous 44 px de haut dans cette sous-section (selects 21 px, bouton « Détails » 23 px, case 16 px) — c'est vrai des six sous-onglets (voir §7, un seul constat transversal).

### 1.4 Qualité des sauvegardes

| Site | Clé | Nue / `cle()` | Déclencheur | Relecture après rechargement |
|---|---|---|---|---|
| `tableau-bord-apercu.js:45` | `etudiantsSuivis` | **nue**, absente des deux registres de `trimestres.js` | clic pilule, Réinitialiser, **purge automatique à chaque rendu** (`:57`) | `[{da, couleurIndex}]`, relu tel quel — sauf qu'il a pu être purgé entre-temps (G-2) |
| `horaire.js:668` (nominal), `:550`, `:559` | `seancesCompletes_gc_<id>` (composée nue) / `<trim>_seancesCompletes` | composée | **à chaque ouverture de l'onglet** (`:1062` → `genererSeancesCompletes`) | — |
| `horaire.js:491` | `seancesHoraire` | **nue** alors que `CLES_NAMESPACEES` la liste (`trimestres.js:78`) | migration conditionnelle | — |
| `indices.js:278` → `modes.js:766` | `<trim>_indicesAssiduite` | `cle()` | ouverture (`:1068`) | — |
| `portfolio.js:676` | `<trim>_indicesCP` | `cle()` | ouverture, **deux fois** (`indices.js:281` puis `:1073`) | — |
| `profil-etudiant-actions.js:777` | `<trim>_indicesPatternsRaI` | `cle()` | ouverture (`:1087`, si RàI actif) | — |
| `interpretation-config.js:108` | `seuilsInterpretation` | **nue** | conditionnel (objet incomplet) | — |
| `profil-etudiant-diagnostics.js:787` | `profilOngletDeveloppementActif` | **nue** | navigation vers le profil | — |

**Constat G-8 · Consulter le Suivi du groupe n'est pas une lecture** – mineur – `[lecture]` : chaque ouverture réécrit au moins cinq clés avant tout geste. Rien n'est perdu ; mais `indicesCP` est calculé deux fois pour le même résultat. **Disposition : inscrire** (retirer l'appel `:1073`, la chaîne `indices.js:281` le fait déjà) — même constat en §2 (L-4).

---

## 2 · Liste des étudiant·es — `#suivi-liste` (`index.html:7709-7911`), `js/etudiants.js` ; l'ajout, le retrait et le statut vivent dans **Cadre › Trimestre** (`js/trimestre-v2-etudiants.js`, `index.html:7019-7166`), jamais dans ce sous-onglet

> ↻ **11 sept. 2026 — lot 2 du cadrage 11 LIVRÉ en 1.132.0** : L-1 (tris), L-2 (abandons visibles, grisés — décision de
> Grégoire 14 h 17), L-3 (recherche sans accents), L-4 (une écriture par rendu, saisie différée), L-5 (six patterns), L-6
> (≥ Min. tient ; 0 est sous N), L-8 (DA en double refusé / ignoré), L-9 (groupe padé à l'écriture, normalisé à la lecture),
> L-11 (bouton d'aide conservé) corrigés ; L-7 et L-10 déjà réglés (#771) ; § 2.4 « sort avant #moy-* » et
> `sessionStorage` commentés. Sentinelle `sentinelle-749-lot2-liste-des-etudiants.test.js` ; L-1 à L-6 du banc aux valeurs d'après.

### 2.1 Tableau des gestes (31, tous écrits en dur dans `index.html` ; le module n'en génère aucun — la ligne est cliquable par `tr.onclick`, `etudiants.js:1156`)

| Geste | Fonction | Effet mesuré | Écrit ? |
|---|---|---|---|
| 4 × `data-on-change="afficherListeEtudiantsConsultation"` (filtres groupe, programme, RàI, pattern) et 1 × `data-on-input` (recherche, **à chaque frappe, sans debounce**) | `etudiants.js:774` | re-rendu complet | **oui, indirect : 3 écritures en base par rendu** (L-4) |
| `data-action="reinitialiserFiltresListeEtudiants"` / `resetFiltresListe` (×2) | `:1433` / `:1404` | vide les cinq filtres (pas les colonnes, pas ≥ Min., pas le tri) | indirect |
| 11 × `data-on-change="toggleColonneListe"` | `:1271` | masque `th/td:nth-child` | **`sessionStorage['liste-colonnes-visibles']`** (`:1299`) — perdu à la fermeture de l'onglet du navigateur |
| 2 × `data-on-change="toggleLigneEntete"` (Moy., r↔P) | `:607` | `u-hide` sur `#tr-entete-*` | non |
| `data-on-change="toggleFiltreMinimum"` (≥ Min.) | `:624` | **grise** les insuffisants et remplace `#moy-c`/`#moy-p` — ne filtre personne | non |
| 10 × `<th data-action="trierTableauPar">` | `:1493` | voir L-1 | indirect |
| clic sur une ligne (`tr.onclick`, `:1156`) | `afficherProfilComplet` | ouvre le profil | indirect (§4) |

### 2.2 Logique propre

**L-1 · Tri « # » sans effet ; tri « DA » lexicographique** – mineur – `[exécuté]`
`num` est comparé avant d'être posé (`:1061` vs `:1129-1135`) : `undefined - undefined = 0`, le tableau garde l'ordre de stockage aux deux clics (mesuré `['999999','2000001','1000123']` × 2). `da` passe par `localeCompare` sans `numeric` (`:1120`) : `1000123` avant `999999` (mesuré). **Ce que l'enseignant voit** : la flèche change, l'ordre non ; des DA « dans le désordre ». **Disposition : inscrire.**

**L-2 · Les abandons ne sont pas dans le tableau, contrairement à ce que dit la note de l'écran** – moyen – `[exécuté]` `[grep]`
`filtrerEtudiants` (`:668-671`) retient `statut === 'actif' || !statut` : un élève « abandon » disparaît (mesuré `['2000001','2000003']`). Or `index.html:7808` affirme : « Les abandons et inactifs […] sont toujours affichés dans le tableau pour consultation, mais exclus des statistiques. » **Ce que l'enseignant perd** : il cherche un décrocheur dans la liste, ne le trouve pas, et le texte lui dit qu'il devrait y être. **Disposition : inscrire** — choisir (afficher grisé, comme le texte le dit, ou corriger le texte).

**L-3 · Recherche : insensible à la casse, sensible aux accents** – mineur – `[exécuté]` `[navigateur]`
`toLowerCase()` sans `normalize('NFD')` (`:722-726`) : `césaire` → 1, `CÉSAIRE` → 1, `cesaire` → 0, `aime` (pour Aimé) → 0 ; en démo `Comaneci` → 0 pour Comăneci (sonde 1). Le tri par nom, lui, est accent-aware par `localeCompare`. **Disposition : inscrire** (normaliser des deux côtés, comme le filtre pattern le fait déjà `:710-714`).

**L-4 · Chaque rendu réécrit trois clés et recalcule les indices du groupe — y compris à chaque caractère tapé** – moyen – `[exécuté]`
Un rendu = `calculerEtSauvegarderIndicesAssiduite` ×1 (qui chaîne `calculerEtStockerIndicesCP`, `indices.js:281`) **plus** `calculerEtStockerIndicesCP` ×1 (`:781`) : `indicesAssiduite` ×1, `indicesCP` ×2. Trois frappes dans la recherche = trois rendus (mesuré `{assiduite:3, cp:3}` côté `etudiants.js`, le double pour CP avec la chaîne). Sur 30 élèves, ce sont trente calculs complets par lettre. **Disposition : inscrire** (retirer `:780-782` ; debounce sur `data-on-input`).

**L-5 · Le filtre « En progression » est une option morte** – mineur – `[exécuté]`
`value="progression"` (`index.html:7766`) ; `profil-etudiant-calculs.js` ne produit jamais `'En progression'` (0 occurrence ; `Stable` 3, `Défi spécifique` 4, `Difficulté émergente` 6, `Difficulté persistante` 4, `Non-participation` 4, `Données insuffisantes` 3). En démo, l'option rend une liste vide (sonde 1) ; à l'inverse, `Non-participation` et `Données insuffisantes` sont affichables mais **non filtrables**. **Disposition : inscrire** (aligner les options sur les six patterns du code).

**L-6 · « ≥ Min. » perd son effet au premier re-rendu** – mineur – `[lecture]`
`toggleFiltreMinimum` grise et remplace `#moy-c`/`#moy-p` ; le rendu suivant (tri, lettre tapée) reconstruit le `tbody` et réécrit les moyennes (`:1042`, `:1137`) sans rappeler la fonction : la case reste cochée, l'effet est parti. Et un élève à **0** évaluation n'est pas « insuffisant » (`nbEvals > 0`, `:933`). **Disposition : inscrire.**

**L-7 · Le filtre RàI et le filtre pattern lisent la même source que le badge** – fonctionne – `[navigateur]`
Sonde 1 en démo : Tous 20 · N1 13 · N2 5 · N3 2 = 20 ; chaque ligne retenue porte le badge du filtre ; patterns `Stable` 18 · `Difficulté persistante` 2 · autres 0. Même fonction (`determinerNiveauRaiPedagogique`, appelée trois fois par ligne et par rendu : `:697`, `:899`, `:1017`). Les deux « moyenne A » (#750) : `#moy-a` = actifs ayant ≥ 1 présence (`etudiants.js:955-961`) ; carte du Suivi du groupe = `sommatif.nombreSeances > 0` (`tableau-bord-apercu.js:1500`, moyenne dans `genererBarreDistribution:1729`). Constaté, pas rejugé.

### 2.3 Ajout, retrait, statut — Cadre › Trimestre, ce que la Liste en voit

- **Écriture indirecte** : six des sept écritures de `trimestre-v2-etudiants.js` passent par **`db.modifier`** (`db.js:532-558`, lecture → mutateur → `set`, sérialisé par clé), invisible au `grep 'setSync('` : `soumettreEtudiantV2:437`, `supprimerEtudiantV2:566`, `changerStatutEtudiantV2:628`, `confirmerImportV2:774`, `supprimerGroupeSelectionneV2:905` ; `reinitialiserEtudiantsV2:855` fait un `db.set` direct. Clé : `cle('groupeEtudiants')`, namespacée. `sauvegarderGroupeEtudiantsV2` (`:926-985`) : code mort.
- **L-8 · Un DA déjà présent est accepté à l'ajout** – moyen – `[exécuté]` : deux fiches sous `2000001`, notification « Dede Doublon ajouté ». Aucune vérification d'unicité à l'ajout (`:346`) ni à l'import (`:778-783`, réimporter le même fichier duplique le groupe). Tout le reste du code identifie un élève par son DA (`findIndex(e => e.da === da)` ×5). **Disposition : inscrire.**
- **L-9 · Le groupe n'est pas padé à l'écriture** – mineur – `[exécuté]` : `groupe: '1'` écrit tel quel (`:344`, `:712`) ; la Liste construit ses options sur `e.groupe` brut et compare par `===` (`etudiants.js:150`, `:685`) : « 1 » et « 00001 » sont deux entrées du filtre Groupe, alors que `obtenirEtudiantsCoursActif` les confond (`modes.js:1184`). **Disposition : inscrire.**
- **L-10 · Confirmer un import : écrit, puis `ReferenceError`** – MAJEUR – `[exécuté]` → **CM-5**.
- **Les autres sous-onglets** : aucun événement émis ; le cache de lecture est invalidé par `db.surEcriture` (`modes.js:1085`) ; le rafraîchissement a lieu au changement de sous-section (`navigation.js:260-269`). Après rechargement : cohérent. Fonctionne.
- Normalisation des noms : `trim()` oui, NFD/NFC non, casse non.

### 2.4 Affichage — `[navigateur]` `demo_1024x768_liste.png`, `vide_*_liste.png`

- **À 1024 px, le tableau à 12 colonnes dépasse** (`scrollWidth` 1 105 pour 1 024 ; 11 éléments au-delà du bord droit dont `Interv.` et `RàI`) — **et l'écran le dit** : « Le tableau dépasse l'écran — décoche des colonnes ci-dessus pour ajuster la vue » (`verifierDebordementTableauListe`). Défilement horizontal dans son conteneur, pas de débordement de page. Fonctionne ; à 1366 px tout tient.
- **État vide** : « Aucun·e étudiant·e trouvé·e — Ta liste apparaît ici une fois qu'un groupe-cours est actif » ; les deux messages (`#message-liste-vide` / `#message-filtre-actif`) sont bien arbitrés sur `etudiants.length` (`:838-848`). Mais la fonction **sort avant** de mettre à jour `#moy-*` et `#corr-*` (`:854`) : après un filtre qui ne retient personne, les moyennes de l'affichage précédent restent en en-tête. Mineur, **commenter**.
- **L-11 · Le bouton d'aide contextuelle est détruit au premier rendu** – mineur – `[lecture]` : `data-aide="suivi-liste"` (`index.html:7713`) est dans `#titre-liste-etudiants`, dont `mettreAJourTitreListeEtudiants` (`:500-524`) réécrit l'`innerHTML` sans le remettre. Capture démo : le « i » orange du titre est celui du `primo-aide`, pas le bouton d'aide. **Disposition : inscrire.**
- 20 cibles sous 44 px (cases 12 × 12, selects 23 px) — transversal, §7.

### 2.5 Sauvegardes (depuis ce sous-onglet)

Aucune écriture directe dans `etudiants.js` (0 `setSync`, `set`, `setItem` en base). Indirectes par rendu : `<trim>_indicesAssiduite` (×1), `<trim>_indicesCP` (×2), `seuilsInterpretation` (**nue**, conditionnelle), plus `sessionStorage['liste-colonnes-visibles']` réécrit autant de fois qu'il y a de colonnes masquées à chaque rendu (`:1302-1313`). Rien de ce sous-onglet n'est perdu par un geste : il n'écrit rien qui lui appartienne, sauf les colonnes (perdues à la fermeture de l'onglet, `sessionStorage`). **Disposition : commenter** (colonnes en `sessionStorage` : position).

---

## 3 · Saisie des présences — `#suivi-saisie` (`index.html:7912-8118`), `js/saisie-presences.js`, `js/presences-rapport.js`

> ↻ **11 sept. 2026 — lot 3 du cadrage 11 LIVRÉ en 1.133.0** : S-3 (garde `!coursId` posée, commentée — et la même garde manquait
> dans `sauvegarderPresencesSansValidation`, posée dans le lot) ; S-4 (`datesVerrouillees` par trimestre ET groupe-cours, patron
> `cleEtudiantsSuivis` ; semis de la liste nue entière, lue jamais réécrite ; `donnees-v2.js` montre la clé réelle) ; S-6 (les quatre
> préférences sous `cle()`, sans semis ; le bandeau réévalué à chaque initialisation et sur les séances complètes ; date par défaut =
> dernière séance ≤ aujourd'hui ; « ← Précédent » sans date — remesuré : le bouton rendait sans rien faire — y va aussi ; la saisie se
> réinitialise à l'activation et au retrait de la démo). S-7 cité (`#736`, `#747`), pas touché ; S-1 fonctionne ; S-5 livré (`#768`).
> Sentinelle Vitest 12 essais / 10 break-tests ; essai Playwright « démo → saisie » (aucun bandeau, date posée, 20 élèves).

> ↻ **11 sept. 2026 — lot 4 du cadrage 11 LIVRÉ en 1.134.0 (§ 4, Profils individuels)** : P-1 corrigé (`#754` clos : le
> module profil active la sous-section sous le drapeau `_profilAutoChargement` du crochet de navigation.js — zone protégée,
> non touchée — et n'observe plus la sous-section ; la Liste et le Suivi du groupe n'appellent plus `afficherSousSection`
> avant le profil ; un rendu par six chemins mesurés, texte du rapport conservé) ; P-2 corrigé (`<trim>_preferencesRapport`,
> écrite au geste seulement, nue orpheline connue de diagnostic-353) ; P-5 corrigé (`#752` clos : `scoreCritereEvaluation` +
> `tableConversionPourEvaluation`, la conversion du dépistage, par évaluation ; points → fraction ; non convertible → absent
> et dit ; zones de l'échelle majoritaire) ; tableau 4.1 : `supprimerEvaluationDepuisProfil`, `attribuerJetonPersonnaliseAvecPrompt`,
> `retirerJetonPersonnaliseAvecConfirmation` retirés ; `toggleDetailIndice` REMESURÉ — son seul « appelant » (`portfolio.js:443`)
> lisait un nom privé d'une autre IIFE par `typeof`, toujours `undefined`, et aucun conteneur n'existe : retiré avec
> `fermerDetailIndice` et l'appel ; `toggleServicesAdaptes` enfin appelée (au rendu) ; volet confidentiel : « Services adaptés »
> reflète `etudiant.sa` et le « Portrait de lecteur » est retiré (décisions de Grégoire du 11, 17 h 20-24). P-3 cité
> (position, skill `securite-donnees`, inscrit seulement s'il demande le chiffrement) ; P-4 cité (`#751`, après le 14) ;
> P-6 fonctionne ; `profilOngletDeveloppementActif` nue : lot 7. Sentinelle 11 essais / 4 break-tests ; sonde Playwright #754.

### 3.1 Tableau des gestes (15 dans `index.html`, 6 générés)

| Geste | Fonction | Effet mesuré | Écrit ? |
|---|---|---|---|
| `naviguerVersReglagesTrimestreDepuisPresences` (`:7933`) | `main.js:246` | Cadre › Trimestre | non |
| `allerCoursPrecedent` / `allerCoursSuivant` (`:7956`, `:7963`) | `:1730` / `:1699` | pose `#date-cours`, ré-initialise | indirect (S-6) |
| `_wrapDateCoursChange` (`#date-cours`, `:7962`) | `init-inline.js:61` | ré-initialise | indirect |
| 2 × `initialiserSaisiePresences` (sous-groupe, tri) | `:903` | re-rend la grille | **oui : `presences_date`, `presences_groupe`, `presences_tri`, nues** (`:916-922`) + `seancesCompletes` réécrites (`genererSeancesCompletes`, `:907`) + `indicesAssiduite` (`:1275`, à chaque rendu) |
| `filtrerTableauPresences` (recherche, `:7989`) | `:1889` | masque des lignes | **oui : `recherchePresences`, nue** (`:1896`) |
| `ouvrirModaleRapportPresences` (`:8003`) | `presences-rapport.js:296` | modale du PDF | non — **mais le bouton disparaît au premier rendu de grille** (S-5) |
| `enregistrerPresences` (`:8004`, et généré `:2022`) | `:1439` | voir S-1 à S-3 | **oui : `cle('presences')` via `sauvegarderDonneesSelonMode` (`:1534`)** — la seule porte qui respecte le mode (#736) |
| `afficherSousSection` `suivi-liste` (`:8005`) | `navigation.js:458` | quitte vers la Liste | non |
| `tousPresents` (`:8020`, généré `:1250`) | `:1582` | tout à N périodes **dans le DOM seulement** ; préserve les absences motivées RàI | non |
| `reinitialiserSaisie` (`:8025`, généré `:1256`) | `:1635` | tout à 0 et notes vidées **dans le DOM seulement**, sans confirmation | non |
| 10 × `sauvegarderOptionsRapportPresences` (modale) | `presences-rapport.js:278` | — | **oui : `preferencesUtilisateur` (nue), sous-clé `rapportPresencesOptions`** |
| `genererRapportPresencesPDF` (`:8111`) | `:554` | jsPDF ; **écrit d'abord la préférence** (`:562`) | oui (la même) |
| `fermerModaleRapportPresences` (`:8050`) | `:303` | — | non |
| généré `mettreAJourLignePeriodesHandler` (une par élève, `:1209`) | `:1871` → `:1344` | borne 0..max, recolore, recalcule l'assiduité affichée | non — **aucun auto-save** |
| généré `afficherSousSection` `suivi-apercu-legacy` (`:2023`, « Annuler ») | `navigation.js` | **écran vide** | non → **CM-2** |
| généré `basculerVerrouillageDateActive` (`:2027`) | `:745` → `:725` | verrouille la date | **oui ×2 : `datesVerrouillees` (nue) + `cle('presences')` direct** (S-4) |

Le champ « Notes » (`:1218-1224`) n'a aucun `data-on-*` : lu à l'enregistrement seulement. **Il n'existe aucun geste de suppression d'une séance** (`grep -n "removeSync\|supprimerPresence" js/saisie-presences.js` → 0) : la seule « suppression » est le filtre de remplacement des lignes 824 et 1490 ; « Annuler » ne remet rien.

### 3.2 Sauvegardes — les quatre portes sur `cle('presences')`, mesurées

**S-1 · Forme, dédoublonnage, idempotence, relecture** – fonctionne – `[exécuté]` `[navigateur]`
Un enregistrement par (da, date, coursId), `{date, da, periodesPresentes, notes, coursId}` (+ `facultatif: true` conservé s'il existait ; `heures` n'est plus écrit, #540). Les anciennes fiches de cette date et de ces DA sont retirées puis les nouvelles poussées : répété deux fois → tableau identique (mesuré) ; deux gestes à la suite (2 puis 0 périodes) → une seule fiche, à 0 (S-2). La fiche d'un autre cours le même jour est préservée. En navigateur, sur la démo, avec un rechargement **propre** (sonde 3, sans vider le stockage) : `periodesPresentes: 1, notes: 'retard sonde'` relus identiques, 627 fiches avant et après, `presences_date` restaurée, la grille rouvre sur la bonne séance avec `1` et la note. **Fonctionne.** (La sonde 2, qui vidait `localStorage` à chaque chargement, avait fait ré-amorcer le pack démo et montré un faux « retour à 2 h » : artefact de la sonde, corrigé par la sonde 3 — noté ici pour qu'on ne le redécouvre pas.)

**S-3 · Si le cours actif est introuvable au clic, les fiches des autres cours de cette date pour les mêmes DA sont supprimées** – mineur (cas de bord) – `[exécuté]`
`coursId === null` fait tomber la garde `if (coursId && p.coursId && …)` (`:1490-1494`) : la fiche GC2 d'Alice est remplacée par une fiche `coursId: null`. Le cas suppose `obtenirCoursActifId()` nul avec un groupe-cours actif — atteint seulement par un état incohérent de `infoCours`. **Disposition : commenter** (garde `if (!coursId) return` avec message).

**S-4 · Verrouiller une date : `datesVerrouillees` NUE, partagée entre trimestres et groupes-cours, et une réécriture des présences hors du mode** – moyen – `[exécuté]`
`db.setSync('datesVerrouillees', …)` (`:738`), sans `cle()` ni coursId : une date verrouillée l'est pour tous les cours et tous les trimestres (le 8 septembre 2026 verrouillé dans GC1 l'est dans GC2). Le verrouillage sauvegarde d'abord la grille (`sauvegarderPresencesSansValidation:787` → `db.setSync(clePresences)` `:865`), une des trois portes hors du mode (#736). `donnees-v2.js:831` déclare cette clé `ns: true` : l'écran Données annonce une clé `<trim>_datesVerrouillees` que personne n'écrit. Toggle idempotent (déverrouiller rend `[]`). **Disposition : inscrire** (namespacer + coursId ; corriger `donnees-v2.js`).

**S-5 · Rapport disparu, Annuler vers le vide** → **CM-2** – `[exécuté]` `[navigateur]`.

**S-6 · Trois préférences sous clés nues à chaque initialisation ; le bandeau « Configuration incomplète » ne regarde que l'horaire** – moyen – `[exécuté]` `[navigateur]`
`presences_date`, `presences_groupe`, `presences_tri` (nues, `:916-922`) et `recherchePresences` (`:1896`) fuient entre trimestres (la date n'est restaurée que si ≤ aujourd'hui, `:73`) et sont **absentes de l'inventaire d'export** de `donnees-v2.js` (`grep` = 0). Le bandeau `#alerteFormatHoraire` est évalué **une fois, au démarrage** (`initialiserModuleSaisiePresences:55` → `:880`), sur `obtenirSeancesHoraire().length` seul. **Ce qu'un collègue voit le 14** : il active la démo depuis l'Accueil, ouvre Saisie des présences, et lit « Configuration incomplète — Aucune séance n'est rattachée à l'horaire de ce cours » (`demo_1024x768_saisie.png`) alors que l'horaire démo porte deux séances et 30 séances complètes ; la date est vide, « (0 étudiant·e) », « Sélectionne une date » ; en cliquant « ← Précédent » la date reste vide (sonde 2 : `dateApresPrecedent: ""`) ; il faut choisir une date au calendrier, et le bandeau ne part qu'au rechargement (sonde 3). **Disposition : inscrire** (réévaluer le bandeau à chaque initialisation ; ouvrir sur la dernière séance passée quand aucune date n'est mémorisée ; réparer « Précédent » sans date).

**S-7 · Le transfert de rattrapage écrit `heures` ; les trois portes hors du mode** – #747, #736, recoupés – `[lecture]`
`interventions.js:1409-1416` écrit `heures: dureeIntervention` (libellé « Durée (périodes) »), `facultatif: true` ; `migrations.js:440-446` refuse de convertir ce champ pour `facultatif === true`. La dédup `:2166` ignore `facultatif` (c'est #747). Portes hors du mode : `:865`, `:2143`, `:2178` (+ repli `interventions.js:1430`). Constaté, pas rejugé. Neuf, à ajouter à #736 : `modes.js:164` mappe `'suivi-saisie': 'afficherTableauPresences'`, **fonction qui n'existe nulle part** (`grep -rn afficherTableauPresences js/` → cette ligne seule) : la bascule de mode ne rafraîchit pas la grille. **Disposition : inscrire** (à #736).

### 3.3 Affichage — `[navigateur]` `demo_*_saisie.png`, `sonde_demo_saisie_2025-09-08.png`, `sonde3_saisie_apres_reload.png`

- **La grille est une ligne par élève, 7 colonnes fixes, UNE séance à la fois** (`thead` statique `index.html:8012-8034`, `tbody` par `chargerTableauPresences:1096`). La matrice « 30 élèves × 15 séances » n'existe qu'au **PDF** (`presences-rapport.js`, `LARGEUR_MIN_COL_SEANCE = 6.5 mm`, pagination). À 1024 px : 7 colonnes, `scrollWidth` 888 = `clientWidth`, rien de coupé ; 20 lignes en démo lisibles (`sonde_demo_saisie_2025-09-08.png`). Fonctionne.
- Les classes de largeur des `<th>` (`w-100px`, `w-200`, `w-80px`, `w-100-center`) et `input-periodes`, `input-notes`, `max-periodes`, `grid-auto-180` **n'existent pas dans `styles.css`** (0 occurrence chacune) : sélecteurs JS ou décoratifs. Sans conséquence visible mesurée. **Commenter.**
- Le `<th id="colonneHeuresTitre">` est réécrit par `innerHTML` (`:1243-1262`) et perd le `data-tooltip="presences-presence-col"` de `index.html:8017`. **Commenter.**
- Le PDF lit la même source que la grille (`obtenirDonneesSelonMode('presences')`, `:574`) — filtrée par le cours **actif** : avec `portee: 'tous'`, les feuilles des autres groupes-cours sortent vides (`construireModeleRapportPresences:132` écarte les `coursId` étrangers). Et le PDF exclut les fiches `facultatif` (`:131`) et les élèves exclus (`:239`) que la grille affiche. **Disposition : inscrire** (portée « tous » du PDF).

---

## 4 · Profils individuels — `#suivi-profil` (`index.html:8119-8131`, un conteneur, tout est généré), sept modules

### 4.1 Tableau des gestes (33 attributs générés)

| Geste | Fonction | Effet | Écrit ? |
|---|---|---|---|
| `data-on-change="afficherProfilComplet"` (sélecteur, `sections-affichage.js:2445`) ; `data-action="afficherProfilComplet"` (Préc./Suiv., `:2461`, `:2467`) | `:2386` | rend tout le profil | **oui, indirect** : `seancesCompletes_gc_*`, `<trim>_indicesAssiduite`, `<trim>_indicesCP` à **chaque** rendu (`_recalculerIndicesACPSiPossible:2323`) |
| 8 × `data-action="changerSectionProfil"` (sidebar, `:2493-2538`) | `:1865` | remplace `#profil-contenu-dynamique` ; si `rapport` → `restaurerPreferencesRapport` | **oui** : `preferencesRapport` (P-1) ; si `performance` → `<trim>_portfoliosEleves` (`_appliquerSelectionAutoArtefacts:4041`, **une écriture pendant un rendu**) |
| `toggleSectionCollapsible` (`:1800`) | `:1820` | plie/déplie | non, non persisté |
| `naviguerVersIntervention` (`:356`, `:1460`), `naviguerVersNouvelleIntervention` (`:1402`) | `:4574`, `:4552` | Suivi › Interventions par **sondage** `setInterval` 50 ms, timeout 2 s | indirect (§5) |
| 3 × `naviguerVersPresenceAvecDate` (badges d'absence) | `:4444` | Suivi › Saisie, pose `#date-cours` | non |
| 5 × `evaluerProduction`, 1 × `consulterEvaluation` | `evaluation.js:214` (gagne sur `actions.js:123` et `liste-evaluations.js:1892`, chargée après) ; `actions.js:37` | Évaluations › Annoter | `sessionStorage['travaux-filtre-production']` (`actions.js:74`) |
| 3 × `ouvrirReglagesPratique` | `pratiques-gestion.js:2852` | Conception › Pratiques | non |
| `ouvrirModalConfidentiel` (`:1172`, section Accompagnement) | `confidentiel.js:74` | modale statique | non ; **Enregistrer** (`index.html:15164`) → **oui** (P-2) |
| 3 wrappers de légende (`:3447-3468`, `:3959`) | `graphiques-progression.js:3459-3499` | masque un dataset | non |
| `travauxUI.ouvrirFichier`, `lancerExportEtudiantAnnotes` (`:4717`, `:4735`) | travaux | visionneuse, ZIP | non |
| 6 × `genererEtAfficherRapport` (cases), `copierRapport` (`rapport.js:202-230`) | `:251`, `:290` | régénère / copie | **oui** : `preferencesRapport` (nue) |
| `changerOngletDeveloppement` (`diagnostics.js:742`) | `:771` | onglet Critères / Forces / Gestes | **oui** : `profilOngletDeveloppementActif` (nue, P-4) |
| `denotationSaisie.recalculerGarde`, `.enregistrer` (`denotation-saisie-ui.js:139`, `:181`) | `:189`, `:202` | jugement DEN | **oui** : `cle('jugementsDenotation')` |
| `mettreAJourSousCategories`, `fermerModalConfidentiel` (modale) | `confidentiel.js:279`, `:212` | — | non |

Exportés mais **jamais câblés** (`grep` `data-action` et appels : 0) : `attribuerJetonPersonnaliseAvecPrompt`, `retirerJetonPersonnaliseAvecConfirmation`, `supprimerEvaluationDepuisProfil` (`actions.js:797-800`) ; `toggleServicesAdaptes` (`confidentiel.js:269`, la case `index.html:15124` n'a pas de `data-on-change`) ; `toggleDetailIndice` et le portfolio détaillé (`portfolio.js:111`, conteneurs inexistants). **Disposition : inscrire** (une fiche « gestes du profil sans bouton », à retirer ou à câbler).

### 4.2 Logique propre

**P-1 · Le triple rendu (#754) : ce qu'il coûte** – produit de #754 – `[navigateur]` `[lecture]`
Quatre insertions de nœuds dans `#contenuProfilEtudiant` à l'ouverture d'un profil en démo (sonde 2, `rendusOuverture: 4`) : l'appel direct, le crochet de `navigation.js:593-616` (100 ms), le `MutationObserver` de `sections-affichage.js:4610-4664` (100 ms), et le rebouclage par `afficherProfilComplet:2397` qui rappelle `afficherSousSection('suivi-profil')`. Chaque rendu réécrit `container.innerHTML` : **une retouche tapée dans la zone de texte du rapport est perdue** (sonde 2 : `noteManuelleConservee: false` — le texte est présenté comme éditable, `rapport.js:189`) ; une note DEN et sa justification non enregistrées le sont aussi (`denotation-saisie-ui.js:170-178`) ; et chaque rendu écrit trois clés d'indices (E-5). **Disposition : inscrire** (à #754 : ce qu'il détruit).

**P-2 · Le rapport : six cases sous une clé nue et sans DA ; le texte est régénéré, jamais relu** – mineur – `[exécuté]`
`db.setSync('preferencesRapport', …)` (`rapport.js:362`) : partagée entre trimestres **et entre élèves** ; écrite à chaque rendu de la section (3-4 fois à l'ouverture). Le texte n'est jamais persisté (mesuré : `TEXTE RETOUCHÉ` remplacé). « Recharge-t-il à l'identique ? » — les cases oui, le texte est un **recalcul**. **Disposition : commenter** (position : le rapport est une vue) ; la clé nue rejoint la fiche des clés nues (§7).

**P-3 · Le volet confidentiel : en clair, remplacement du sous-objet, cascade sur les présences** – constat – `[exécuté]`
`cle('confidentielEtudiants')` (namespacée) ; `donnees[da] = infos` (`:250`) : les 21 champs du formulaire, en clair (`TDAH` lisible dans le JSON), les autres DA intacts ; chaque textarea de note de présence réécrit `cle('presences')` via `modifierNotesPresence` (porte hors du mode). Idempotent. Aucun chiffrement (`grep crypt|chiffr|subtle` : 0) alors que le texte de la modale dit « stockées localement et ne sont jamais partagées » (`index.html:14987`) — vrai, mais lisible par quiconque ouvre le navigateur. Position (skill `securite-donnees` §1.1) ; **inscrire** si Grégoire veut que ce volet soit chiffré.

**P-4 · En mode anonymisation, le volet confidentiel montre la vraie note et laisse enregistrer** – produit de #751 – `[exécuté]`
`modeApplication = 'anonymisation'` : `ouvrirModalConfidentiel` remplit `#confidentiel-notes` avec `diagnostic réel` (lecture du store brut, `:87`), et `sauvegarderConfidentiel` écrit (`db.setSync` direct, pas `sauvegarderDonneesSelonMode`). Le rapport du 5 (G4) disait « pas anonymisé » ; **ce qui est neuf** : l'écriture aussi passe. Aucune garde de mode sur le bouton (`:1172`). **Disposition : inscrire** (à #751).

**P-5 · Les graphiques : trou, /4, points** – moyen – `[exécuté]`
`obtenirDonneesCriteres` (`graphiques-progression.js:2450-2466`) : `B` (échelle à trois paliers) → `null` = **trou sans message** (`spanGaps:false`, et `afficherMessageAttente` n'est appelé que pour les graphiques de groupe) ; `3` → **75 %** (tout nombre ≤ 4 est lu comme une note sur 4) ; `21` (un critère en points sur 30, lot 2 du 4 septembre) → **21 %** ; `M` → 75. Élève sans évaluation → `null` (carte « Aucune donnée de progression »), pas de courbe inventée ; une seule évaluation → un point. Les lettres I/D/M/E sont en dur deux fois (`:2456-2460`, `:3787-3791`) et les zones de fond viennent de la **première échelle du trimestre** (`obtenirEchelleUtilisateur:381`), pas de celle de l'évaluation. C'est #752 ; **ce qui est neuf** : le « ≤ 4 → /4 » et « points → % ». **Disposition : inscrire** (à #752).

**P-6 · Navigation** – `[lecture]`
Le DA courant vit dans `profilActuelDA` (variable + `window.profilActuelDA`, `sections-affichage.js:1852-1853`, dual-write `:2303-2304`) ; aucune clé `db` (`grep etudiantSelectionne js/` → 0). Au rechargement : premier élève actif par ordre alphabétique (`navigation.js:602-611`), section `productions`. `tbNavigerVersProfil` (`tableau-bord-apercu.js:2976`) n'est référencé par aucun `data-action` malgré son commentaire `:2973`. Les liens sortants (Évaluer, Consulter, présence datée, intervention, travaux, pratique) mènent où leur libellé dit. Fonctionne.

### 4.3 Affichage — `[navigateur]` `demo_*_profil.png`, `vide_*_profil.png`

- **État vide** : « Sélectionne un·e étudiant·e depuis la liste pour voir son profil. » (137 px). Fonctionne.
- **Démo, DEMO001** : sélecteur, Préc./Suiv., en-tête (nom, DA, groupe, programme), 8 sections ; tableau des productions 6 colonnes, 11 lignes, `scrollWidth` 888 = `clientWidth` à 1024 : rien de coupé ; la note finale (`70.9 % × 60 % + 61.6 % × 40 % = 67.2 %`) et le portfolio (« 5 meilleurs artefacts sur 5 évalués ») cohérents avec la Liste (P 67 %). Les 520 avertissements « pas de grille de référence » (§1) rendent la section Accompagnement muette sur les critères en démo.
- 14 cibles sous 44 px (boutons 28-32 px, sélecteur 23 px) — transversal.

### 4.4 Sauvegardes

| Site | Clé | Nue / `cle()` | Déclencheur | Idempotence / relecture |
|---|---|---|---|---|
| `confidentiel.js:251` | `<trim>_confidentielEtudiants` | `cle()` | Enregistrer | idempotente ; relue par `ouvrirModalConfidentiel` seul (0 autre lecteur) |
| `rapport.js:362` | `preferencesRapport` | **nue, sans DA** | chaque rendu de la section, chaque case | idempotente en valeur |
| `diagnostics.js:787` | `profilOngletDeveloppementActif` | **nue** | clic d'onglet | idempotente |
| `sections-affichage.js:4056` | `<trim>_portfoliosEleves` | `cle()` | **rendu** de « Développement des habiletés » (auto-sélection) | non idempotente (`dateSelection`), une fois tant que la sélection n'est pas vide ; DATA-OWNERSHIP la note déjà « à investiguer » |
| `horaire.js:668`, `indices.js:278`, `portfolio.js:676` | `seancesCompletes_gc_*`, `<trim>_indicesAssiduite`, `<trim>_indicesCP` | composée / `cle()` | **chaque rendu** du profil (3-4 fois à l'ouverture) | non idempotentes (`dateCalcul`) |
| `denotation-jugements.js:125` | `<trim>_jugementsDenotation` | `cle()` | Enregistrer le jugement | idempotente |
| `preferences.js:252` | `preferencesUtilisateur` | nue (globale, attendu) | auto-nettoyage `grilleReferenceDepistage` si la grille a disparu | une fois |
| `actions.js:74` | `sessionStorage` | — | Consulter | — |

Toutes passent par `db.setSync` direct sauf `indicesAssiduite` : **aucune n'est bloquée par le mode anonymisation**. **Disposition : inscrire** (à #736/#751 : la liste des portes hors du mode, profil compris).

---

## 5 · Interventions — `#suivi-interventions` (`index.html:8132-8147`, tout est généré), `js/interventions.js` ; `js/consolidation.js` **n'appartient pas à ce sous-onglet** (il s'affiche dans Labo › Études, `index.html:9270-9298`, et ne lit jamais `interventions`)

↻ **12 sept. 2026 — lot 5 du cadrage 11 livré (`9ceca4ff`, en 1.139.0, poussée ; porte relevée 6/6 à 15 h 03, rangées 2.4 et 2.5 sautées faute de cas)** : I-1 (le brouillon naît en mémoire, « Planifier » n'écrit plus rien ; la double écriture de « Enregistrer » réduite à une), I-5 (lettres du bilan par les seuils `idme.*`), I-7 (`#748`, la note d'un élève parti reste, grisée), code mort retiré (avec `creerIntervention` et `marquerPresences`, sans appelant après le lot), I-6 commenté. Cités, non traités ici : `#736` (portes hors du mode anonymisation), `#746` (fait par le lot D des Rencontres), les 2 cibles tactiles (lot 7), le pack démo sans intervention.

### 5.1 Tableau des gestes (11 attributs générés, aucun filtre, aucun tri réglable — tri décroissant par date codé en dur `:315-319`)

| Geste (ligne du template) | Fonction | Effet mesuré | Écrit ? |
|---|---|---|---|
| `afficherFormulaireIntervention` (`:328`, « Planifier une intervention ») | `:602` | **crée l'intervention en base avant toute saisie** (`jamaisSauvegardee: true`) puis ouvre le formulaire | **oui** (I-1) |
| `ouvrirGuidePedagogique` `rai` (`:331`) | `guides-pedagogiques.js:358` | guide | non |
| `ouvrirIntervention` (`:371`) | `:642` | formulaire, cases pour `obtenirEtudiantsCoursActif()` seulement | non (mute l'objet en mémoire, `:80-82`) |
| `supprimerInterventionEtRafraichir` (`:374`) | `:1523` | `confirm` puis `filter` + écriture | **oui** — la seule suppression confirmée |
| `onChangementSelectionEtudiants` (cases, `:683`) | `:1028` | analyse temps réel | indirect (`seuilsInterpretation` auto-guérison) |
| 2 × `gererVisibiliteContexteIntervention` (`:752`, `:764`) | `:565` | affiche/masque contexte, absences | non |
| `suggererObjectifIntervention` (`:875`) | `:1106` | phrase dans `#objectifVise` (seuils `idme.*` lus, 0,64) | non |
| `annulerNouvelleIntervention` (`:974`) | `:630` | supprime **sans confirmation** | **oui** |
| `afficherListeInterventions` (`:975`) | `:286` | re-rend ; **purge silencieuse** des `jamaisSauvegardee` (`:302-305`) | **oui, conditionnel** |
| `sauvegarderPresencesIntervention` (`:976`, « Enregistrer ») | `:1221` | le seul chemin d'enregistrement | **oui, deux écritures complètes** (`:175` puis `:1327`) + `cle('presences')` si complétée |

Les cinq gestes du prompt : **créer** = `push` + écriture immédiate (`:140-141`) ; **modifier** = mutation en place par index, deux passes (`marquerPresences:151-176`, puis `:1236-1327`) ; **note individuelle** = aucun geste propre, le `textarea` `#note-<da>` (`:688`) est lu à l'enregistrement et `notesIndividuelles` **reconstruit** à partir des seuls cochés (`:1277-1283`) ; **clôturer** = radio `completee` lue à `:1229`, `bilan` posé `:1315-1320`, transfert des présences (`completerIntervention:254` n'est appelée par personne) ; **supprimer** = `filter` (`:275`). Toutes passent par `sauvegarderInterventions` (`:101-103`, `db.setSync(cle('interventions'))`, namespacée). La ligne 1448 n'est pas un effacement : c'est l'initialisation `[]` si la clé est absente. L'id est unique (`genererIdUnique`, `main.js:33-44` : horodatage + compteur + 48 bits d'aléa).

### 5.2 Logique propre et sauvegardes

**I-1 · « Planifier » écrit un brouillon en base ; le simple ré-affichage de la liste le purge sans un mot** – moyen – `[exécuté]` `[navigateur]`
Clic → 1 intervention `statut: 'planifiee', jamaisSauvegardee: true` en base (1 écriture) ; changer d'onglet et revenir → 0 intervention, 0 notification (banc et sonde 2 : `apresClic: 1 → apresRetour: 0`). **Ce que l'enseignant perd** : un formulaire à moitié rempli, s'il est parti sans « Enregistrer » — sans qu'on le lui dise. Cohérent avec « ce qu'on n'a pas enregistré n'existe pas », mais la base a porté l'objet entre-temps (un export pris à ce moment le contient). **Disposition : inscrire** (créer en mémoire, écrire à l'enregistrement ; ou avertir à la sortie).

**I-2 / I-3 · Enregistrer efface les notes des décochés et retire les participants d'un autre groupe** → **CM-6** – `[exécuté]`.

**I-4 · Titre et description bruts** → **CM-3** – `[exécuté]` `[navigateur]`.

**I-5 · Le bilan : « I 65 % » à côté d'une suggestion qui dit « seuil D (64 %) »** – produit de #742 – `[exécuté]`
Moyenne « avant » 0,645 → lettre `I` et « 65 % » dans la même cellule (`:919-929`, seuils 0,65 / 0,75 / 0,85 en clair) ; la suggestion d'objectif du même formulaire lit `idme.insuffisant` = 0,64 (`:1125`) et dirait « D ». Un élève à 64,5 % est D pour toute l'app et I pour le bilan. #742 disait « seuils en clair » ; **neuf** : la contradiction sur un même écran, et l'arrondi indépendant de la lettre. **Disposition : inscrire** (à #742).

**I-6 · Rechargement : identique ; `dateCreation` ISO, `dateModification` timestamp** – fonctionne / commenter – `[exécuté]` `[navigateur]`
Écrit puis relu à l'identique (banc et sonde 3, `Sonde <b>3</b>`, `['DEMO001']`, `{DEMO001: 'note sonde'}`). Types de dates hétérogènes (`:116`, `:136` vs `:162`, `:264`, `:1326`). Le doc d'en-tête `:22-43` annonce `statut: 'en-cours'` et `id: 'intervention-timestamp'`, périmés. **Disposition : commenter.**

**I-7 · Note d'un élève parti (#748) : « Notes individuelles (2) », une seule ligne** – produit de #748 – `[exécuté]`
`genererAffichageNotesIndividuelles:529-559` compte toutes les entrées (`:533`) et ne rend que celles dont l'élève est retrouvé (`:544`) : compteur 2, ligne Alice seule, rien pour Bruno (ni nom, ni DA). **Disposition : inscrire** (à #748 : le compteur).

**Intervention sans groupe-cours (#746)** – `[lecture]` : aucun champ de cours sur l'objet (`:117-138`) ; la liste n'est filtrée par rien (`:299-348`) — toutes les interventions du trimestre dans tous les groupes. **Neuf** : trois périmètres d'élèves coexistent (liste : trimestre ; formulaire : `obtenirEtudiantsCoursActif` ; consolidation : `infoCours.groupe`), d'où I-3. À #746.

**Code mort** – `[grep]` : `completerIntervention` (`:254`, 0 appelant), `afficherNotesIndividuelles` (`:1171`, `#notesIndividuellesContainer` n'existe nulle part, trois interpolations brutes). **Disposition : inscrire** (retrait zéro-dette).

### 5.3 Affichage — `[navigateur]` `demo_*_interventions.png`, `vide_*_interventions.png`
Démo et vide : « Aucune intervention planifiée ou complétée. Clique sur « Planifier une intervention » pour commencer. » + bandeau de l'état vide. Le pack démo n'a **aucune intervention** : le sous-onglet ne montre rien de ses cartes, de son bilan ni de ses notes en démo. **Disposition : inscrire** (pack : deux interventions, dont une complétée avec bilan). Aucun débordement ; 2 cibles sous 44 px (30 px).

---

## 6 · Animation — `#suivi-animation` (`index.html:8148-8235`), `js/boite-outils.js` — jamais audité

### 6.1 Ce que c'est
Deux outils, deux cartes : **Questions flash** (banque saisie à la main, catégories, tirage sans remise) et **Tirage au sort** d'élèves (1 à 5, avec ou sans remise, exclusions). L'en-tête du module annonce un « Ordonnancement (Futur) » qui n'existe pas.

**Ce qui est projeté** (liste exhaustive, `[lecture]` + `[navigateur]` `sonde_demo_animation_apres_tirage.png`) :
- `#tirage-affichage` pendant la roulette (`:256`) et au résultat (`:292`, `:299-303`) : **prénom + nom, et rien d'autre** — pas de DA, pas de groupe, pas d'indice, pas de photo ; noms échappés. Messages : « Aucun étudiant disponible », « Aucun étudiant dans le groupe actif ».
- **La modale « Paramètres du tirage »** (`:334-414`, injectée dans `document.body`, donc projetée si ouverte en classe) : la **liste nominative complète** du groupe « NOM, Prénom » (`:387`, **brute**, CM-4), badge « tiré », cases d'exclusion ; et le **DA réel** dans `data-da` / `data-param` (`:384`, `:386`) — invisible à l'œil, présent dans le DOM (mesuré `daDansDom: true`, A-3), y compris en mode anonymisation (`anonymiserDonnees` conserve `da`, `modes.js:877-886`).
- Questions : texte tronqué à 80 caractères pendant l'animation (`:687`), intégral au résultat (`:717`) ; aucun nom.
- Anonymisation : les noms projetés viennent d'`obtenirEtudiantsCoursActif` → `obtenirDonneesSelonMode` → anonymisés ; le module ne le sait pas et **écrit ses deux clés en mode anonymisation** (`db.setSync` direct, `:40`, `:508`), avec des DA réels.

### 6.2 Tableau des gestes (5 dans `index.html`, 16 générés)

| Geste | Fonction | Effet | Écrit ? |
|---|---|---|---|
| `lancerTirage` (`:8221`) | `:201` | tire N parmi pool − exclus − déjà tirés (sans remise) | **oui** via `afficherResultat:283` → `etatTirage` (nue) |
| `ouvrirModalParamsTirage` (`:8202`) | `:334` | modale | non |
| `toggleExclusionEtudiant` (généré `:386`) | `:427` | exclut un DA | **oui** `:434` |
| `appliquerParamsTirage` (`:399`) | `:440` | nombre, remise | **oui** `:452` |
| `reinitialiserTirageComplet` (`:397`) | `:460` | vide `dejaTires`/`exclus` — **le seul chemin de remise à zéro** | **oui** `:463` |
| `fermerModalParamsTirage` (×2) | `:419` | ferme ; le commentaire `:407` promet Escape, **seul le clic sur l'overlay est câblé** | non |
| `lancerTirageQuestion` (`:8186`) | `:644` | tire une question | **oui** via `:712` → `questionsFlash_<coursId>` |
| `changerFiltreCategorieFromEl` (`:8172`) | `init-inline.js:870` → `:590` | filtre, **jamais persisté** | non |
| `ouvrirModalParamsQuestions` (`:8159`) | `:745` | gestion des questions | non |
| `ajouterCategorie`, `supprimerCategorie` (×2), `ajouterQuestion`, `modifierQuestion` (`prompt`), `supprimerQuestion`, `changerCategorieQuestionHandler`, `toggleRemiseQuestionsHandler`, `reinitialiserQuestionsPositions` | `:1030-1154` | banque | **oui**, tous via `sauvegarderEtatQuestions:508` |
| `fermerModalParamsQuestions` (×2) | `:922` | — | non |
| `appliquerParamsQuestions` (exportée `:1193`) | `:1016` | **aucun `data-action` ne l'appelle** : code mort | — |

### 6.3 Le tirage — `[exécuté]` A-1, A-2 ; `[navigateur]` sonde 1

- **Équitable au sens du code : oui.** Sans remise par défaut (`:23`), `dejaTires` alimenté à chaque résultat (`:277-284`), `Math.random` + `splice` à l'intérieur d'un tirage multiple (`:218-222`). Banc : trois élèves tirés une fois chacun, puis « Aucun étudiant disponible » et bouton désactivé. Démo : 12 tirages effectifs, 12 DA distincts, « 8 restants » relu après rechargement.
- **Pas de réinitialisation automatique** : à 0 disponible, le bouton se désactive (`:192-195`) ; il faut la modale → « Réinitialiser ». **L'infobulle promet le contraire** (`accompagnement-contenu-hover.js:800` : « jusqu'à ce que le groupe soit épuisé, **puis réinitialisé** »). **Disposition : inscrire** (l'un ou l'autre).
- **Élève retiré du groupe** : à l'initialisation suivante (entrée dans le sous-onglet, changement de groupe), il est **purgé de `dejaTires` et l'état purgé est réécrit** (`:143-147`) ; s'il revient, son tirage est perdu (mesuré). Entre deux initialisations, le pool est une copie figée `{da, nom, prenom}` (`:129-133`) : un élève retiré ou renommé ailleurs reste tirable sous son ancien nom. **Disposition : commenter.**
- Un clic pendant l'animation (2,5 s) est ignoré (sonde 1 : un tirage sur deux compté) — attendu.

### 6.4 Sauvegardes — `[exécuté]` A-2, A-4

| Site | Clé | Forme | Ce qui est mesuré |
|---|---|---|---|
| `:40` | **`etatTirage`, NUE**, absente des registres, référencée nulle part ailleurs (aucune purge, aucun export) | `{exclus[DA], dejaTires[DA], avecRemise, nombreATirer, coursId}` — `coursId` = **id du COURS** (`infoCours.id`), pas du groupe-cours ; le pool (noms) n'est pas persisté | survit au rechargement (oui) ; **un autre groupe du même cours ne vide rien** (`:96-101` compare des ids de cours) ; le changement de trimestre non plus (`cours` est une clé globale, même id d'un trimestre à l'autre) : `avecRemise` et `nombreATirer` **traversent les trimestres** ; `exclus`/`dejaTires` survivent jusqu'à la purge par DA |
| `:508` (`const cle` locale, **masque** la fonction `cle()`) | **`questionsFlash_<coursId>`** assemblée, **non namespacée** ; `questionsFlash_global` si `infoCours` est nul (fenêtre réelle : `trimestres.js:523` → restauration) | `{questions[{id,texte,categorieId}], categories[{id,nom}], dejaPositions[], avecRemise, coursId}` | survit ; **deux groupes du même cours partagent la banque et les « déjà posées »** ; deux trimestres aussi. `restaurerEtatQuestions` (`:518`) ne remet pas l'état en mémoire à zéro quand la clé est absente : la première écriture qui suit un changement de contexte **recopie la banque du contexte précédent** dans la nouvelle clé (`[lecture]`) |

**Disposition : inscrire** (une fiche : deux clés à namespacer par trimestre et groupe-cours ; `dejaPositions` — « déjà posées » — à renommer en passant).

### 6.5 Affichage — `[navigateur]` `demo_*_animation.png`, `vide_*_animation.png`, `sonde3_animation_modale_params.png`
- Vide : « Aucun étudiant dans le groupe actif », « 0 étudiant·es disponibles », « 0 questions disponibles ». Démo : « 20 étudiant·es disponibles », **« 0 questions disponibles »** — aucune banque livrée avec le pack ; l'outil Questions flash est vide en démo. **Disposition : inscrire** (pack : cinq questions, deux catégories).
- Rendu projeté à 1366 × 1024 : deux cartes côte à côte, 629 px de haut, aucun débordement ; nom tiré en `2.5rem`. Fonctionne.
- `reinitialiserAffichage` (`:163`) pose `class="tirage-placeholder"`, **classe absente de `styles.css`** (l'HTML statique utilise `outil-placeholder`) : placeholder non stylé après un changement de groupe. `.question-categorie-badge` (`styles.css:14797`) : CSS mort. **Commenter.**
- 5 cibles sous 44 px (boutons 37-42 px, select 22 px) — transversal.

---

## 7 · Ce qui traverse les six sous-onglets

**Les clés nues, recensées** (12 sites) : `etudiantsSuivis` (§1), `seancesHoraire` (§1, en contradiction avec `CLES_NAMESPACEES`), `seuilsInterpretation` (§1, §2, globale voulue mais auto-réécrite), `profilOngletDeveloppementActif` (§4), `preferencesRapport` (§4, sans DA), `datesVerrouillees` (§3, et déclarée `ns: true` dans `donnees-v2.js`), `presences_date`, `presences_groupe`, `presences_tri`, `recherchePresences` (§3, hors inventaire d'export), `etatTirage` (§6), `questionsFlash_<coursId>` (§6). Trois d'entre elles portent des **DA réels** (`etudiantsSuivis`, `etatTirage`, `datesVerrouillees` non) et aucune n'est purgée à la suppression d'un trimestre ni exportée avec lui. **Disposition : inscrire** (une fiche « clés nues du Suivi », à traiter avec #749).

**Les portes hors du mode anonymisation** : toutes les écritures des six sous-onglets passent par `db.setSync` direct, sauf `enregistrerPresences` et `indicesAssiduite`. À #736/#751.

**Écrire pendant un rendu** : le Suivi du groupe (5 clés), la Liste (3 clés par rendu, à chaque caractère), le profil (3-4 fois à l'ouverture, plus `portfoliosEleves`). Aucune perte mesurée ; un coût, et des `dateCalcul` qui changent sans que rien n'ait changé. **Inscrire** (retirer les doubles appels de `calculerEtStockerIndicesCP`).

**Cibles tactiles** (skill `design-interface` §5, minimum 44 × 44 px sur iPad) : 9 + 20 + 8 + 14 + 2 + 5 = **58 contrôles sous 44 px** mesurés à 1024 × 768 (selects 21-23 px, cases 12-16 px, boutons compacts 23-32 px). C'est le système, pas un sous-onglet. **Disposition : inscrire** (une fiche design, à trancher contre la densité voulue).

**Ce qui n'a pas été mesuré** : l'iPad réel (WebKit local sur Mac, pas Safari iOS) ; le PDF des présences rendu (le modèle pur l'est, `presences-rapport-485.test.js`) ; le mode anonymisation dans les six sous-onglets — **impossible tant que CM-1 tient** (chaque lecture lève) ; les graphiques Chart.js au pixel (mesurés par leur code de données) ; le glisser-déposer (aucun ici).

---

## 8 · Le banc, les break-tests, les captures

**Banc** : `tests/unit/audit-sous-onglets-suivi-2026-09-06.test.js` — 34 mesures, un `describe` par sous-onglet (G-1…G-5, L-1…L-7, S-1…S-6, P-1…P-5, I-1…I-7, A-1…A-4), `cd tests && npx vitest run unit/audit-sous-onglets-suivi-2026-09-06.test.js` : 34/34, 284 ms. Modules réels de `js/` (avec `modes.js` réel et `interpretation-config.js` réel), faux `document` qui capture l'`innerHTML` et sert les champs d'un formulaire, `db` de banc avec journal (clé, valeur) et `db.modifier` reproduit de `db.js:532`, minuteries virtuelles pour la roulette. « Recharger » = remonter un window neuf sur le même store.

**Break-tests** (`verification-adverse` §4, mutation d'un point, restauration par copie, empreinte MD5 identique avant/après, `git status -- js/` propre) :
1. `interventions.js:363` : `${intervention.titre}` → `${echapperHtml(intervention.titre)}` → **I-4 rouge** (« expected … to contain 'Rattrapage <b>x</b>' »). Restauré.
2. `tableau-bord-apercu.js:55-57` : retrait de la réécriture dans `nettoyerEtudiantsSuivis` → **G-2 rouge** (« expected [] to deeply equal [[]] »). Une première mutation avec un motif inexact n'avait **pas** été appliquée (le test restait vert : piège §8.4, un témoin par mutation) — refaite sur les lignes exactes. Restauré.
3. `saisie-presences.js:2023` : `suivi-apercu-legacy` → `suivi-liste` → **S-5 rouge**. Restauré.

**Captures** (30 + 6, `_to_delete/captures-audit-suivi-2026-09-06/`) : `vide_1024x768_{groupe,liste,saisie,profil,interventions,animation}.png`, `vide_1366x1024_*.png`, `demo_1024x768_*.png`, `demo_1366x1024_*.png` ; `sonde_demo_saisie_2025-09-08.png` (grille de 20 lignes), `sonde_demo_animation_apres_tirage.png`, `sonde2_saisie_apres_annuler.png`, `sonde2_animation_modale_params.png`, `sonde3_saisie_apres_reload.png`, `sonde3_animation_modale_params.png`. Chaque capture a son `.txt` (le texte de la sous-section) ; `mesures.json` porte, par état, viewport et sous-onglet, les cibles sous 44 px, les éléments hors viewport, les textes tronqués, les tableaux et canvas, et les messages console regroupés.

**Trouvailles hors périmètre, arbitrées selon les trois issues** : CM-1 (`modes.js`) et CM-5 (`trimestre-v2-etudiants.js`) sont hors des six modules mais sur le chemin des six écrans — proposées « corriger maintenant » parce qu'un collègue les rencontrera le 14. `modes.js:164` (mapping mort), `indices.js:214` (`heures` lu comme des périodes sans conversion, alors que `:203` convertit — à recouper avec #747) : **inscrire**. Le reste : commenté dans ce rapport.

**BACKLOG** : rien n'y est inscrit par cet audit. Les fiches se créent à l'arbitrage de Grégoire, ligne par ligne, à partir du §0 puis des « inscrire » de chaque section.
