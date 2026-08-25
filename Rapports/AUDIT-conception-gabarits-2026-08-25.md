# AUDIT — Onglet Conception : enregistrements, logique, PDF et design

**Date** : 25 août 2026 · **Base auditée** : `main` 1.99.0 (commit `9566719`, build 0825-1702)
**Périmètre** : chantier #496–#507 (1.98.0 → 1.99.0, « le document de consignes, et des gabarits qui se ressemblent ») + logique d'enregistrement des quatre sous-onglets Production / Grille de critères / Échelle de performance / Cartouche de rétroaction.
**Mode** : audit tiers (mode B du skill `verification-adverse`). Chaque verdict porte son niveau de preuve : **[navigateur]** = reproduit dans un Chromium réel sur l'app réelle ; **[break-test]** = sentinelle faite rougir puis restaurée ; **[lecture]** = chemin de code lu, non exécuté.
**Déclencheur** : Grégoire — « les boutons d'enregistrement des paramètres semblent avoir causé des soucis à quelques moments (on dirait que les données n'étaient pas toujours enregistrées) ».

---

## Baseline factuelle

- Vitest : **3262/3262 verts** (309 fichiers), re-roulés dans cette session — pas repris du journal.
- Playwright WebKit : non exécutable dans ce conteneur (#487). Les reproductions ci-dessous ont été faites dans **Chromium** (harnais jetable, scripts en scratchpad, aucun fichier du dépôt modifié).
- Arbre propre avant et après audit ; les deux mutations de break-test ont été restaurées (diff vide vérifié).
- Un audit Conception antérieur existe (`plans de travail/AUDIT-conception-2026-08-20.md`, base 1.88.4). Le présent rapport est **différentiel** : il porte sur l'état 1.99.0 et sur le symptôme « enregistrement ».

---

## A. Constats majeurs — le symptôme « pas toujours enregistré » a des causes réelles

### A1 · « + Nouvelle production » n'initialise pas les blocs de consignes (#499) — [navigateur]

`creerNouvelleProduction()` (productions-liste.js) remet le formulaire à neuf champ par champ, mais **n'appelle jamais `peuplerBlocsConsignes(null)`**. Deux effets, tous deux reproduits :

1. **Premier geste d'une session** : la fiche neuve n'affiche AUCUN bloc — ni Objectif, ni Description, ni Détail de la tâche (`document.getElementById('productionObjectif')` → absent, 0 `.champ-perso` rendus). L'enseignant ne peut pas saisir ses consignes ; l'enregistrement écrit `''` sans bruit (`valeurChampGabarit` rend `''` pour un champ non rendu).
2. **Après édition d'une production A** : les champs personnalisés, les titres réécrits des blocs ancrés et l'ordre de A **restent affichés** dans la fiche « neuve » — et sont **enregistrés dans la nouvelle production**. Repro : la production neuve a hérité de `champsPersonnalises: [{titre: 'Remise du travail', contenu: 'Sur Léa uniquement'}]` et `titresBlocs: {objectif: 'Objectif custom A'}` de A.

C'est exactement la classe de défaut documentée dans ce même fichier pour #468/CO-17 (échéances par groupe héritées en silence) : le chemin « + Nouvelle production » ne passe pas par `reinitialiserFormulaireProduction()` (productions.js), qui lui fait le bon appel. **Correctif minimal** : ajouter `peuplerChampsPersonnalises(null)` dans `creerNouvelleProduction()` — ou faire déléguer ce chemin au réinitialiseur commun. Sentinelle à prévoir sur la couture (les deux chemins de remise à neuf doivent vider la même liste).

### A2 · Course « lost update » sur l'autosave des grilles et des échelles — [navigateur]

`modifierCritereGrille()` et `modifierNiveauEchelle()` font chacun **lecture → modification → écriture asynchrones de la collection entière**, sans sérialisation (`db.set` n'a pas de file par clé). Deux modifications rapprochées — le `change` d'un champ part au blur, c'est-à-dire au moment où on clique dans le champ suivant — peuvent lire le même instantané et s'entre-écraser.

Repro : deux appels concurrents (`nom` du critère 0 → « NOM-A », `nom` du critère 1 → « NOM-B ») ; à l'arrivée, **critère 0 = `''`** — l'écriture « NOM-A » a été perdue, sans erreur ni message. C'est le mécanisme le plus vraisemblable du symptôme intermittent rapporté (« je l'avais rempli, c'est pas resté »). Antérieur au chantier d'hier — pas une régression de 1.99.0.

**Piste** : sérialiser les écritures RMW (file de promesses par clé dans db.js, ou dans les deux modules), ou ne relire la collection qu'une fois par rafale (débounce + écriture unique).

### A3 · L'astérisque « Nom du critère » promet un refus qui n'existe pas — [navigateur + lecture]

La légende (#506) dit : « Champ obligatoire — l'enregistrement est refusé sans lui. » Repro : une grille dont un critère a un **nom vide** s'enregistre sans aucun refus (autosave et bouton Enregistrer confondus). La « preuve » de la sentinelle #506 pour ce champ (`'Le nom du critère est obligatoire'`) vit dans `sauvegarderCritere()` — une fonction qui lit `#critereNom`, **id absent d'index.html**, sans appelant vivant. La sentinelle passe donc *vacuously* : la garde textuelle est ancrée sur du code mort (motif AP-2/ratchet du skill `verification-adverse`, §4).

**Piste** : soit valider réellement (refuser l'enregistrement d'un critère sans nom — attention à l'autosave), soit retirer l'astérisque de ce champ ; et réancrer la preuve de la sentinelle sur le chemin vivant.

### A4 · Le transport des productions écarte tout le contenu pédagogique — [lecture]

`SCHEMAS_IMPORT.production` (import-export.js) est une **liste blanche** qui ne contient ni `objectif`, ni `tache`, ni `detailTache`, ni `ponderation`, ni `cartoucheId`, ni `echeancesParGroupe`, ni `pratiquesCompatibles` — **ni les nouveaux `champsPersonnalises` / `titresBlocs` / `ordreBlocs` (#499/#500)**. Deux chemins vivants l'appliquent :

- `ajouterALaBibliotheque()` (productions-bibliotheque.js:81) — partager une production vers la bibliothèque la vide de ses consignes ;
- l'import sélectif d'archives (import-export.js:2668) — réimporter des productions les vide pareillement.

Le trou est antérieur pour les champs historiques ; le chantier #499/#500 ne l'a pas comblé pour les siens (couture P4 manquée : de nouvelles clés de données sans mise à jour du transport). Au passage : le schéma **grille** ne transporte ni `categoriesErreurs` ni `sousCriteres` (les 11 rétroactions de français se perdent aussi au transport).

**Piste** : étendre les schémas (avec `maxLen` généreux pour `detailTache` et les contenus de champs libres), et une sentinelle « chaque clé écrite par `construireProductionData` est transportée ou explicitement exclue ».

---

## B. Constats moyens

### B1 · Cartouche : la matrice ne vit qu'en RAM jusqu'au bouton Enregistrer — [lecture]

`sauvegarderCommentaire()` écrit dans `cartoucheActuel` en mémoire seulement (c'est documenté dans son en-tête) ; la persistance n'arrive qu'au bouton **Enregistrer**, en bas d'un écran long. Aucun garde-fou « modifications non enregistrées » : changer de cartouche dans la barre latérale, de sous-onglet ou fermer l'app fait perdre toute la saisie de la matrice, en silence. C'est le **modèle inverse** des grilles/échelles (autosave champ par champ) — cette incohérence entre sous-onglets voisins nourrit à elle seule la perception « des fois ça enregistre, des fois non ». L'écran cartouche est aussi le seul des quatre sans barre d'actions en tête (#503 visait « les trois écrans » — décision à confirmer, mais l'utilisateur, lui, voit quatre écrans).

### B2 · Un champ personnalisé rempli mais sans titre est écarté en silence — [lecture]

`champsPersonnalisesAEnregistrer()` filtre les blocs sans titre. La règle est défendable (pas de bandeau vide dans le document), mais du **contenu tapé** disparaît à l'enregistrement sans un mot. Piste : avertir (« un bloc sans nom ne sera pas conservé ») ou refuser de fermer sans trancher.

### B3 · PDF : les blocs de consignes ne savent pas changer de page — [lecture]

`poserBlocsInfoPDF()` ne consulte jamais la hauteur de page (aucun `addPage`/`getHeight` dans la fonction). Le tableau, lui, pagine via `autoTable`. Un « Détail de la tâche » long (le cas d'usage réel : consignes numérotées) sera **dessiné sous le bas de page, donc perdu à l'impression** — pendant que l'aperçu affiche « le PDF le poursuivra sur une page de plus », promesse tenue pour le tableau seulement.

### B4 · Le modal s'ouvre sur « Consignes » au lieu du document complet — [navigateur]

L'intention documentée dans `cranDocument()` (« sans demande explicite, le cran le plus HAUT ») est court-circuitée : au premier usage, `select.value` vaut la **première option du HTML** (`consignes`), jamais `''`. Capture à l'appui : production avec grille + échelle + cartouche, aperçu ouvert → page consignes seule. Une fois un cran choisi, il est mémorisé — l'écart ne touche que le premier usage, mais il inverse le comportement d'avant-crans.

### B5 · « Consignes seules » exige quand même une grille ET une échelle — [lecture]

`ouvrirApercuPDFPour()` rend `false` sans `grilleId`/`echelleId`, et le repli ramène au formulaire qui exige les deux (alert). Une production sans grille **ne peut pas produire son document de consignes**, alors que le cran « Consignes » existe. Le commentaire du code (« repli assumé, à retirer à l'étape 3 ») est resté après la livraison de l'étape 3 — couture récit↔code.

---

## C. Constats design (mineurs)

- **C1** · `design-system.html` (source de vérité) ne documente aucun composant du chantier : `.btn-icone-nu`, `.bloc-reordonner`, `.champ-recommande`, `.legende-marques`, ni l'usage étendu de `.pipeline-btn-reorder`.
- **C2** · La légende des deux astérisques n'existe que sur l'écran Production ; Grilles, Échelles et Cartouches portent des astérisques **sans légende** — le commentaire CSS de `.champ-recommande` dit lui-même « ne jamais poser l'une sans l'autre ».
- **C3** · Cibles tactiles : chevrons (icône 11 px) et corbeille (`padding: 3px 5px`) sont loin des 44×44 px exigés pour iPad par le skill `design-interface`.
- **C4** · `.apercu-pdf-debordement` : couleur `#f0c674` en dur, hors palette (`--variables`).
- **C5** · Rangée d'actions dense : cinq boutons pleins multicolores côte à côte, « Supprimer » (rouge) entre « Dupliquer » et « Annuler », à un clic d'« Enregistrer ». Cohérent entre Production et Grille/Échelle à l'écran, mais regroupements de balisage divergents entre les trois barres.
- **C6** · Dette pré-existante côté Échelles : un bloc « ANCIEN SYSTÈME » caché garde des **ids dupliqués** (`nomEchelleTemplate` ×3, `selectEchelleTemplate`, `btnDupliquerEchelle`, `typeEchelle`, `seuilReussite`…). Pas de bug actif (le premier id du DOM gagne, et c'est l'éditeur vivant), mais une mine au premier réordonnancement — et une entorse au zéro-dette.

---

## D. Ce qui tient — à dire aussi

- **Le modèle unique écran/PDF (#497) est une vraie correction de fond** : titre, en-tête, blocs, crans et répartition en deux colonnes sont décidés une fois (`construireModeleDocument`, `repartirEnDeuxColonnes`) et traduits par deux rendeurs. Vérifié en rendu réel : deux colonnes équilibrées, bandeaux, ordre de lecture préservé, date de remise présente (#498), badge CC à la bonne taille.
- **Break-tests réalisés (§4 du skill)** : sentinelle-499 faite rougir en retirant la relecture du DOM dans `ajouterChampPersonnalise` → **rouge sur AA.b**, l'assertion qui porte le sens ; sentinelle-497 faite rougir en ignorant `ordreBlocs` → **rouge sur l'assertion d'ordre**. Les deux mordent ; mutations restaurées, arbre propre vérifié. La discipline de test du chantier est réelle (golden master 6 documents, break-tests notés dans les commentaires des tests).
- **#503** : la barre d'actions suit fidèlement son formulaire (MutationObserver) — visible à l'ouverture, cachée à l'annulation, vérifié en navigateur. Les conteneurs observés sont statiques et basculés par `classList` sur l'élément même : le mécanisme est sain.
- **#502** : la description des cartouches est **préservée** au lieu d'être écrasée à `''` quand le champ a quitté l'écran — le bon réflexe données.
- **#505** : le fix de la ReferenceError des niveaux d'échelle est couvert par une sentinelle qui **exécute** le rendu.

---

## E. Limites de cet audit (P6)

- Reproductions en **Chromium**, pas Safari/iPad — la porte terrain 1.94.1 sur les confirmations (18 rangées, 5 décisions en attente) reste à relever telle quelle.
- A4 (transport) et B1 (cartouche en RAM) sont des verdicts **[lecture]** : chemins lus et recoupés, non exécutés.
- A2 reproduit avec deux appels dans la même rafale ; en usage réel la fenêtre est plus étroite (mais réelle : chaque `db.get` IndexedDB rend la main).
- L'audit porte sur `main` 1.99.0. La branche `claude/fusion-24-fonctions-dupliquer-qrop3b` (8 commits non fusionnés, 11 arbitrages en attente) recouvre ce périmètre : certains constats peuvent bouger à sa fusion.

---

## F. Recommandations, par ordre de priorité

1. **A1** — une ligne (`peuplerChampsPersonnalises(null)` dans `creerNouvelleProduction`) + sentinelle de couture. Corrige un vol de données silencieux ET des consignes non saisissables.
2. **A4** — étendre `SCHEMAS_IMPORT.production` (et `grille`) aux champs manquants + sentinelle « toute clé écrite est transportée ou exclue sciemment ».
3. **A2** — sérialiser les écritures lecture-modification-écriture (file par clé) ; c'est le correctif du symptôme intermittent.
4. **B1** — trancher le modèle cartouche : autosave comme les voisins, ou garde-fou « modifications non enregistrées » + barre #503 sur ce quatrième écran.
5. **A3 / B2 / B4 / B5** — petits correctifs de vérité d'interface (l'astérisque, le champ sans titre, le cran par défaut, le repli consignes-seules).
6. **B3** — pagination des blocs de consignes dans le PDF (ou refus explicite d'exporter ce qui déborde).
7. **C1–C5** — passe design courte ; **C6** — candidat zéro-dette (ablation de l'« ANCIEN SYSTÈME » échelles, avec sentinelle ratchet).

---

*Rapport produit sur la branche `claude/audit-conception-tab-lc3ks8`. Preuves : scripts de repro et captures en scratchpad de session ; break-tests restaurés, `git status` propre. Aucune correction appliquée — les décisions restent à Grégoire.*
