# Audit de conformité — l'Aide contre le code

**Ouvert le 10 septembre 2026.** Mandat de Grégoire : « vérifier si l'Aide qui décrit
l'application est bien conforme au fonctionnement tel qu'il est dans le code », après un
été de retrait du code dur porté sur sa pratique.

⚠ **Cet audit n'est pas terminé quand il est déposé.** Chaque constat porte, ICI, l'une
de trois dispositions : **inscrit** (n°), **refusé** (motif), **périmé**. Sur 51 rapports
d'audit du dépôt, 22 sont restés sans suite : c'est ce que cette règle empêche.

---

## Périmètre arrêté avec Grégoire

**Trois natures d'écart** : aide périmée (factuel), encastrement résiduel (sa pratique
présentée comme la règle), trous de couverture (le code ouvre, l'Aide se tait).

**Trois surfaces** : la section Aide d'`index.html` (73 accordéons), l'aide contextuelle
(62 popups, ~281 infobulles, 48 termes), et la visite guidée. `docs/utilisateur/` est
**hors périmètre** (décision du 10 sept.).

**Livrable** : rapport, plus correction d'office de ce qui est faux et mesurable. Ce qui
touche au sens pédagogique remonte à Grégoire.

## Méthode

Le patron vient de **#421** (livré le 9 août, « conformité du manuel de l'Alignement avec
l'interface réelle ») : plusieurs surfaces, et une **sentinelle avec break-tests** plutôt
qu'un rapport seul. Sans sentinelle, l'Aide se re-périme au prochain assouplissement.

**Deux assertions calculées, jamais recopiées** : quand l'Aide cite une liste ou une
valeur, le banc la recalcule des deux côtés. C'est ainsi qu'a été trouvé #816.

---

## Lot 1 — #803, la définition des PAN (10 sept. 2026)

**État à l'ouverture** : la fiche visait deux entrées du glossaire, **déjà corrigées** par
`ad34f739` (1.126.1). L'affirmation avait survécu ailleurs.

| # | Constat | Preuve | Disposition |
|---|---|---|---|
| 1.1 | Le glossaire (entrées « PAN » et « Performance ») définissait PAN par « les N meilleurs artefacts » | `ad34f739` | **périmé** — corrigé en 1.126.1 |
| 1.2 | L'entrée « Artefact » du **même glossaire** portait encore la même réduction | `index.html:14072` | **corrigé** (ce lot) |
| 1.3 | L'astuce du guide de profil attribuait l'étoile ★ aux artefacts retenus | `index.html:13401` | **corrigé** (ce lot) |
| 1.4 | La liste des colonnes annonçait « Retenu PAN : ★ » | `index.html:13397` | **corrigé** (ce lot) |
| 1.5 | Les actions du tableau renvoyaient à « (★) » | `index.html:13408` | **corrigé** (ce lot) |
| 1.6 | Les modes de sélection de l'écran ne sont pas ceux du moteur | `portfolio.js:60,143` vs `pratiques-gestion.js:1584` | **inscrit — #816** |

**Ce que le lot enseigne, et qui vaut pour la suite** : #803 a été corrigé sur les deux
lignes que la fiche citait, et l'erreur est restée à **quatre** autres endroits, dont un
trois entrées plus haut dans le même glossaire. **Corriger par ligne citée ne suffit
pas** ; c'est pourquoi la sentinelle balaie toute la section par motif.

**Sentinelle** : `tests/unit/sentinelle-803-aide-pan-famille-pas-mecanique.test.js`
(4 essais). **Quatre ablations, quatre rouges**, arbre restauré par sha256.

⛔ **Ce que la sentinelle ne fige PAS, volontairement** : la correspondance écran ↔ moteur
des modalités. Elles divergent réellement (#816) ; la figer graverait le défaut.

### Constats reportés à l'audit large

| # | Constat | Preuve | Disposition |
|---|---|---|---|
| 1.7 | L'Aide décrit un **tableau à colonnes** (« Production / Statut / Score / Niveau IDME ») là où le profil rend des **badges** (`badge-artefact`) | `profil-etudiant-sections-affichage.js:728-745` | **à vérifier à l'écran** — lot 2 |
| 1.8 | Deux caractères d'étoile coexistent pour le même sens : ★ (U+2605) et ⭐ (U+2B50), selon l'écran | `profil-etudiant-sections-affichage.js:740-741` vs `:3773-3774` | **à trancher** — incohérence d'interface, pas de doc |
| 1.9 | La classe `ml-20-mb-10` est employée 39 fois dans `index.html` et définie **nulle part** | `grep styles.css` = 0 | **inscrit dans la famille connue** — même nature que `mt-10`/`mt-5`/`alerte-info` signalés par `252bd29e` ; distincte de #813 (qui porte sur les `var()`, pas les classes) |

---

## Lot A — le balayage mécanique (10 sept. 2026)

**Méthode** : extraire de l'Aide toute affirmation qu'une machine peut trancher
(chemins de navigation, libellés de boutons, noms de fonctionnalités), puis la
confronter au code. 83 chemins et 72 libellés cités ont été relevés.

| # | L'Aide disait | Le code dit | Occ. | Disposition |
|---|---|---|---|---|
| A.1 | « Réglages → Captures de progression » | c'est un `<h4>` DANS Réglages › Données (`index.html:9708`, dans `#reglages-donnees` ouvert l. 9530) | 2 | **corrigé** |
| A.2 | « Évaluations → … » | l'onglet s'appelle **« Évaluation »** au singulier (`nav-label`, l. 4105), comme ses cinq voisins | 8 | **corrigé** |
| A.3 | « Primo : assistant conversationnel » | **retiré le 21 avril 2026** (`cfee0157`, « retrait primo-* ~5700 l. ») | 19 | **corrigé** (texte approuvé par Grégoire) |
| A.4 | bouton « Reconstruire les snapshots historiques » | le bouton EXISTE, il s'appelle **« Recalculer les captures »** (`data-action="lancerReconstructionRetroactive"`, l. 9742) | 1 | **corrigé** |
| A.5 | bouton « Générer le calendrier complet » | **« Régénérer »** | 1 | **corrigé** |
| A.6 | bouton « Exporter mes données » | **« Exporter le Codex »** (`data-action="ouvrirModalExport"`) | 1 | **corrigé** |
| A.7 | case « Activer RàI et détection des patterns » | **« Appliquer une adaptation du modèle de la Réponse à l'intervention »** (`#v2-pref-rai`, l. 9063, dans `#labo-accompagnement`) | 2 | **corrigé** |

**Sentinelle** : `tests/unit/sentinelle-audit-aide-lot-A-chemins-et-libelles.test.js` (9 essais).
**Huit ablations, huit rouges**, arbre restauré par sha256. Vitest 523 / 5741.

⚠ **Une erreur de méthode, et sa leçon.** A.4 a d'abord été rapporté à Grégoire
comme « ce bouton n'existe pas », sur la foi d'un `grep data-action="reconstruire`
qui cherchait le mauvais nom d'action. Le bouton existait (`lancerReconstruction‑
Retroactive`). La décision qu'il a prise sur cette base (retirer la procédure)
aurait supprimé une procédure juste. ⮕ **Une absence de `grep` n'est pas une
preuve d'absence** : chercher par le nom de la FONCTION appelée, pas par le mot
qu'on suppose dans l'attribut.

### A.3 — Primo, cinq mois de fantôme

`primo-tooltips.js` (~5 700 lignes) retiré le **21 avril 2026**. Depuis, l'Aide
décrit un assistant conversationnel qui n'existe plus : **19 mentions**, dont une
carte de **78 lignes** (`accordeon-aide-primo`, l. 10703-10780) détaillant « les
4 modules de Primo » et leurs durées, une entrée de glossaire (l. 14185), et des
recommandations de parcours (« Débute avec Primo pour créer ton premier cours »).

Rien ne subsiste : `guidage-demo.js` ne fait que des encarts statiques en mode
démo, `wizard-pratique-v2.js` est l'assistant de *pratique de notation*. Les seules
traces vivantes de « primo » sont des noms de classes CSS de l'aide contextuelle.

**Remplacement écrit** (approuvé par Grégoire le 10 sept.) : la carte
`accordeon-aide-primo` (78 lignes) devient `accordeon-aide-prise-en-main`, qui
décrit les trois outils réels aux libellés exacts de l'interface : « Données démo »
et « Assistance » (`js/accueil.js:231,242`), et la visite guidée
(`data-param="tour-guide"`). Six mentions périphériques réécrites, l'entrée de
glossaire « Primo » retirée, et l'entrée « Assistance » ne renvoie plus à un
« bouton Primo ». La sentinelle vérifie que les deux libellés d'accueil sont
LUS dans `accueil.js` plutôt que recopiés.

⮕ **Motif à chasser au lot D** : le module 3 de cette carte portait « En
développement » — l'Aide annonçait un chantier inabouti, puis a continué de
l'annoncer cinq mois après la disparition du module entier. Chercher les autres
« en développement », « à venir », « prochainement ».

### Lot A (suite) — les valeurs chiffrées et les formats

| # | L'Aide disait | Le code dit | Disposition |
|---|---|---|---|
| A.8 | pack démo : « 11 productions (1 portfolio + **10 artefacts**) » | 11 productions : 1 portfolio, **9 artefacts**, 1 évaluation terminale | **corrigé** |
| A.9 | pack démo : « **42 dates**, août à décembre » | **32 dates**, du 25 août au 10 décembre | **corrigé** |
| A.10 | « Seuil de défi : **75 %** par défaut » | `defiSpecifique: 0.70` (`interpretation-config.js:48`) | **corrigé** |
| A.11 | « forces ≥70 % / défis <70 % » | **trois** seuils : 0,70 · 0,7125 · 0,75 | **inscrit — #817** |
| A.12 | « Formats acceptés : PDF, JPEG, PNG, WebP » + « HEIC : à convertir » | conforme : `validerMagicBytes` accepte les quatre, et `decodagePossible()` rend `false` sur le protocole `file:`, ce que l'Aide dit exactement | **refusé** (faux positif ; passage soigné en #597) |
| A.13 | AVIF accepté par `validerMagicBytes`, annoncé nulle part | marginal pour le corpus visé | **refusé** (motif : aucun symptôme, aucun usage attendu) |

**Ce qui est vérifié, et pas seulement corrigé** : le décompte du pack de démo est
**calculé** par la sentinelle en parsant `pack-demo-20.js` (productions, grilles,
échelles, dates de présences, DA uniques), et le seuil de défi est **lu** dans
`interpretation-config.js`. Ajouter un artefact au pack ou changer la constante
rougit le banc.

⚠ **Un test tautologique attrapé par son break-test.** La première version vérifiait
`toContain('9 artefacts')` : elle passait même avec un décompte faux, parce que
« 9 artefacts » apparaît aussi dans l'exemple de l'indice C (« Étudiant avec 9
artefacts »). L'assertion est désormais ancrée sur la phrase entière du décompte.
⮕ **Un nombre seul n'est pas une ancre** dans un fichier de 15 000 lignes.

---

## Lot B — la cohérence des quatre surfaces (10 sept. 2026)

**Ce que le lot cherchait** : les lots précédents n'avaient corrigé qu'`index.html`.
Les popups (62 entrées), les infobulles (~281) et le glossaire (48 termes)
portaient-ils encore ce qui venait d'en être retiré ?

**Résultat général** : les catalogues sont plus propres que la section Aide.
Aucune mention de Primo, aucune « règle PAN », aucun libellé de bouton périmé.
Cinq écarts tout de même, tous dans les infobulles et le popup.

| # | Surface | L'écart | Disposition |
|---|---|---|---|
| B.1 | infobulle `cn-prod-type` | « Portfolio (… — **les N meilleurs résultats sont retenus**) » : la réduction que #803 avait retirée d'`index.html`, restée ici | **corrigé** |
| B.2 | popup `depist-*` | « Conception → **Grille** de critères » : le libellé réel est « Grille**s** » | **corrigé** |
| B.3 | section Aide | « Fenêtre d'analyse (**4** par défaut) » : `obtenirNombreProductionsPourPatterns()` rend **3** (`interpretation-config.js:36`, repli `|| 3`, et la doc interne de `profil-etudiant-calculs.js:1411`) | **corrigé** |
| B.4 | infobulle `tdb-zones-couleur` | trois erreurs d'un coup : bornes fausses (0-64/65-74/75-85/≥85 au lieu de **30-49/50-64/65-79/≥80**), zones dites « configurables » alors qu'elles sont **en dur**, et réglage situé dans « Réglages » alors qu'il est dans Labo › Outils | **corrigé** |
| B.5 | infobulle `depist-seuils-restaurer` | « valeurs par défaut (**65 / 70 / 75 %**) » : les trois curseurs ont pour défauts **70 / 80 / 85** (`preferences-v2.js:328-330`) | **corrigé** |
| B.6 | glossaire `terme.js:234` | emploie le vocabulaire des zones du tableau de bord et affirme la configurabilité d'un AUTRE mécanisme | **inscrit — #818** |

**Ce que le lot enseigne.** Le popup et le glossaire nomment les zones **sans les
chiffrer** ; l'infobulle était la seule à chiffrer, et c'est la seule à s'être
trompée. ⮕ **Une surface qui chiffre sans lire sa source finit toujours par
mentir.** La sentinelle lit désormais chaque valeur là où elle vit : les bornes
dans le rendu de `tableau-bord-apercu.js`, les défauts dans `preferences-v2.js`.

**Sentinelle** : `tests/unit/sentinelle-audit-aide-lot-B-surfaces-concordent.test.js`
(5 essais). **Six ablations, six rouges**, dont **deux qui modifient le CODE et non
la doc** — c'est ce qui prouve que le banc suit la source et ne fige pas une copie.

---

## Lot C — la visite guidée (10 sept. 2026)

**Ce que le lot cherchait** : les étapes du tour pointent-elles vers des éléments
qui existent ? Réponse : les cibles existent toutes, mais **le tour lui-même est
désaccordé**, et le défaut n'est pas documentaire.

**La cause, unique** : la visite s'orchestre par **trois tableaux parallèles**
indexés par l'id d'étape — `ETAPES_TOUR` (le contenu), `TOUR_NAV` (où le
« Suivant » emmène) et `TOUR_TITRE_COURT` (ce que le bouton annonce). Une
**septième étape (Labo)** a été ajoutée au premier sans compléter les deux autres.

| # | L'écart | Preuve | Disposition |
|---|---|---|---|
| C.1 | À l'étape 5, le bouton affichait **« Suivant : undefined › »** | `TOUR_TITRE_COURT` a 6 entrées, `accompagnement.js:1246` lit `[etape.id + 1]`, et `dernier = 6` (`:1223`). **Reproduit en Node** avant correction. | **corrigé** |
| C.2 | L'étape 6 (Labo) n'avait **aucune cible** : le panneau changeait de texte sans emmener dans le Labo, seule étape sur sept dans ce cas | `TOUR_NAV` s'arrêtait à 5 ; `tourNaviguerVersEtape` fait `if (nav)` et ne navigue pas sans cible (`:1270-1277`) | **corrigé** |
| C.3 | L'étape 0 disait « y revenir **depuis les Préférences** » | Réglages › Préférences ne mentionne ni tour ni visite (**0 occurrence, mesuré**). Les deux points de relance sont le bouton de l'en-tête (`index.html:3892`) et le menu (`:3940`). Le popup `tour-guide`, lui, dit correctement « depuis ce bouton ». | **corrigé** |
| C.4 | L'étape 3 s'intitulait « **Évaluations** » | l'onglet s'appelle « Évaluation » (`nav-label`) — même écart qu'au lot A, dans une quatrième surface | **corrigé** |
| C.5 | L'étape « Conception » ne reconnaissait pas l'écran des **pratiques de notation**, alors que son texte dit « la pratique assemble le tout » | `structureConception` listait 4 des 6 sous-sections | **corrigé** |

**Ce que le lot enseigne, et qui n'était pas dans le mandat.** Les lots A et B
cherchaient des textes faux. Le lot C a trouvé un **défaut d'exécution** :
« undefined » s'affiche à l'avant-dernière étape de la visite que tout nouvel
utilisateur lance en premier. ⮕ **Auditer la doc d'une fonctionnalité, c'est
souvent auditer la fonctionnalité.**

**Ce que la sentinelle vérifie** : la **cohérence entre les trois tableaux**, pas
des libellés recopiés. Ajouter une huitième étape sans compléter `TOUR_NAV` et
`TOUR_TITRE_COURT` rougit. Elle vérifie aussi que les sections et sous-sections
visées existent, et que Réglages › Préférences ne relance toujours pas la visite.

**Sentinelle** : `tests/unit/sentinelle-audit-aide-lot-C-visite-guidee.test.js`
(6 essais). **Six ablations, six rouges**, arbre restauré par sha256.

⚠ **Changement de comportement assumé** : C.2 et C.5 ne sont pas de la prose. La
visite emmène désormais dans le Labo à sa dernière étape, et reconnaît l'écran des
pratiques. L'intention était lisible (les cinq autres étapes ont une cible ; le
texte de l'étape parle des pratiques), mais c'est à éprouver à l'écran.

---

## Lot E — l'encastrement résiduel (10 sept. 2026)

**Ce que le lot cherchait** : l'Aide présente-t-elle la pratique de Grégoire
(601-101, SRPNF, IDME, ELLAC, la littérature) comme LA règle de l'application ?

⚠ **Le lot ne cherchait pas à la faire disparaître.** C'est cette pratique qui a
servi à concevoir l'application, et **l'échelle IDME est SEEDÉE** — règle de
Grégoire du 26 août : « rien ne doit être codé en dur, mais l'échelle IDME peut
être seedée ». La question était : reste-t-elle présentée comme un EXEMPLE ?

**Verdict : largement propre.** Le travail d'assouplissement de l'été a tenu.

| Terme | Occ. | Verdict |
|---|---|---|
| `601-101` | 2 | ✅ « **Ex.** 601-101-MQ » et « (601-101, **etc.** ) » |
| `Gérald-Godin` | 1 | ✅ référence bibliographique (rapport PAREA), pas l'institution de Grégoire |
| `Bédard` | 3 | ✅ 2 en bibliographie ; 1 comme nom dans un exemple de partage |
| `ELLAC` | 3 | ✅ « inspirée du modèle ELLAC », plus l'entrée de glossaire |
| `SRPNF` | 8 | ✅ « **Grille d'exemple fournie avec l'application, et non une structure du logiciel** […] Toute grille fonctionne de la même façon, quel que soit ton nombre de critères et ta discipline » |
| `IDME` | 22 → 21 | ✅ majoritairement (« Autres échelles possibles », « ❌ Désactiver si : tu utilises une échelle chiffrée », « Personnaliser l'échelle IDME si nécessaire »). **Trois restes**, corrigés ci-dessous |

| # | L'écart | Preuve | Disposition |
|---|---|---|---|
| E.1 | « **Niveau IDME** : Badge coloré (I/D/M/E) » | le badge rend `art.niveau` coloré par `art.echelleId` (`profil-etudiant-sections-affichage.js:724-725,743`) : c'est le code de TON échelle | **corrigé** |
| E.2 | idem dans un second passage, avec les quatre couleurs | même mécanisme | **corrigé** (cadré « Avec l'échelle IDME fournie : ») |
| E.3 | export d'échelle : « Contient : **niveaux IDME**, seuils, descriptions » | l'export porte les niveaux de l'échelle exportée, quelle qu'elle soit | **corrigé** |

**Un faux positif instructif.** Le grep « structure du logiciel » avait mordu sur
*« Grille d'exemple fournie avec l'application, **et non** une structure du
logiciel »* — une **négation**. ⮕ Un motif de recherche ne lit pas la syntaxe :
tout candidat se relit en contexte avant d'être appelé un écart.

**Ce que la sentinelle protège** : non pas l'absence d'IDME, mais la **présence des
cadrages** qui en font un exemple (« et non une structure du logiciel », « Autres
échelles possibles », « adaptable à ton contexte », les « Ex. » collés à 601-101).
C'est la régression à craindre, pas la mention elle-même.

**Sentinelle** : `tests/unit/sentinelle-audit-aide-lot-E-exemples-restent-des-exemples.test.js`
(4 essais). **Sept ablations, sept rouges**, arbre restauré par sha256.

⚠ **Un second test tautologique attrapé par son break-test.** La vérification des
mentions de 601-101 utilisait une fenêtre de 60 caractères : elle restait VERTE
après ablation du « Ex. », parce qu'elle attrapait le « Ex. » de la **ligne
voisine** (« Titre : Ex. Écriture et littérature »). Le marqueur doit être **collé**
à la mention. ⮕ Même leçon qu'au lot A, sous une autre forme : **le contexte large
d'une assertion est une porte ouverte au faux vert.**

---

## Lot D — les trous de couverture (10 sept. 2026)

**Ce que le lot cherchait** : ce que le code a ouvert cet été et dont l'Aide se
tait. `js/changelog-data.js` a servi d'index — c'est ce qui a été ANNONCÉ aux
utilisateurs, donc ce que l'Aide devrait couvrir.

**Le chantier d'assouplissement est lisible dans le changelog** : 1.103 « Le niveau
vient de ta pratique », 1.104 « La structure se lit dans TES niveaux », 1.105 « Ton
échelle dit où commence la maîtrise », 1.108-1.110 « Ton interface ne parle plus
d'une matière ni d'un service qui ne sont pas les tiens ». Sur douze sujets
sondés, dix sont couverts par l'Aide.

### Ce que l'Aide annonce et que le code ne fait pas — corrigé

| # | L'écart | Preuve | Disposition |
|---|---|---|---|
| D.1 | « **Filtres par niveau de risque** (prévu dans une version future) » | présent depuis le **6 déc. 2025** (`a9d016f1`), jamais implémenté | **corrigé** — retiré (décision de Grégoire : abandonné depuis longtemps) |
| D.2 | « Modéliser en projection **(en développement)** » + un encadré « ⚠️ Module en cours de développement » | le module fait 521 lignes et réutilise `travaux-annotation`, `travaux-visionneuse`, `travaux-outils` | **corrigé** — décision de Grégoire : ce n'est pas un chantier, c'est **l'annotation réemployée pour modéliser un exercice projeté en classe**. La description le dit maintenant. |
| D.3 | quatre **noms de fichiers d'export** figés (`grilles-criteres-YYYY-MM-DD.json` et trois autres) | les quatre exports passent par `genererNomFichierExport` (`cc-license.js`), qui compose `<type>-[nom]-[cours]-[discipline]-[CC-BY-SA]-<horodatage>` | **corrigé** — décision de Grégoire : **décrire** la composition plutôt que recopier des noms qui ne peuvent pas rester justes |

### Ce que le code fait et dont l'Aide se tait — EN ATTENTE

| # | Le trou | Preuve | Disposition |
|---|---|---|---|
| D.4 | les **trois types de grille** (holistique, analytique, algorithmique), livrés en 1.115-1.117 | `TYPES_GRILLE` (`grilles.js:3252`), sélecteur `#typeGrille` (`index.html:4993-4996`) | **en attente** — demande de la prose neuve |
| D.5 | la **note différée** (« Masquer les notes par travail »), livrée en 1.20 | `noteDiffereeActive()` (`liste-evaluations.js:1153`), Réglages › Préférences (`index.html:9035`) | **en attente** — demande de la prose neuve |

⚠ Ces deux-là **dépassent le mandat « corrections factuelles »** : combler un trou,
c'est écrire, pas corriger. Soumis à Grégoire, non écrits.

**Sentinelle** : `tests/unit/sentinelle-audit-aide-lot-D-ne-promet-pas-l-inexistant.test.js`
(3 essais). **Cinq ablations, cinq rouges**, arbre restauré par sha256.

⚠ **Une ablation mal conçue, et ce qu'elle apprend.** L'ablation « la Modélisation
cesse de réutiliser l'annotation » est d'abord restée VERTE : l'assertion est une
ALTERNATIVE (`travaux-annotation|travauxUI`) et je n'avais retiré qu'une branche.
Ce n'était pas le test qui était tautologique, c'était l'ablation qui était
incomplète. ⮕ **Une assertion à alternatives exige une ablation par branche**,
sinon le break-test atteste moins qu'il n'en a l'air.

---

## Lots à venir

- ~~**Lot A — balayage mécanique**~~ : **fait le 10 sept.**, valeurs chiffrées et formats compris.
- ~~**Lot B — cohérence des surfaces**~~ : **fait le 10 sept.** (voir plus haut).
- ~~**Lot C — visite guidée**~~ : **fait le 10 sept.** (voir plus haut).
- ~~**Lot D — trous de couverture**~~ : **fait le 10 sept.** (voir plus haut). Deux trous restent à combler (D.4, D.5) : ils demandent de la prose neuve.
- ~~**Lot E — encastrement résiduel**~~ : **fait le 10 sept.** (voir plus haut). Le pilote avait vu juste : largement propre.

## Garde-fous à ne pas « corriger » par mégarde

- `index.html:10268` — l'en-tête du tableau SOLO de Biggs et Collis : **écart volontaire
  assumé** (#810, 1.127.3). « Palier SOLO du niveau » y serait faux.
- ⛔ Ne pas écrire que le code sera rouvert (consigne reconduite, 1.127.2).
- Les notes d'A2025 et d'H2026 ne sont pas rouvertes.
