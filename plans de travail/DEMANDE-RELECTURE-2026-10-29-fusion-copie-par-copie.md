# Demande de relecture – Fusionner deux codex copie par copie (#1182, 29 octobre 2026)

> Écrite par Claude Code le jeudi 29 octobre 2026, sur `main`, depuis la consigne de Cowork
> `plans de travail/CONSIGNE-LOT-2026-10-29-fusion-copie-par-copie.md` (fiche #1182, commit `baa63c8e`).
> Code : `1d10728e`. Un commit pour le code, un pour les docs. Pas de release, pas de verdict, pas de push : au signal de Grégoire.

## 1. Ce que fait la fusion maintenant

Une seule fonction pure, `_analyserFusion(local, externe, { auxArchives })` (`js/codex.js`), sans ancêtre, décide de chaque clé ; une seconde, `_valeurApresFusion`, rend la valeur à écrire. L'écriture passe par `_ecrireLaFusion`, clé par clé, dans la file de chaque clé (`db.modifier`) : la valeur est recalculée sur ce qui est lu au moment d'écrire, donc une évaluation enregistrée pendant la fusion n'est pas écrasée.

| Ce que la clé porte | Ce que fait la fusion |
|---|---|
| Une liste d'objets à `id` (évaluations, annotations, fiches des copies, bibliothèques…) | Union par `id` : ici d'abord, puis les ajouts de l'autre. Même `id` identique : un seul. Même `id` différent : le conflit **de cet élément**. |
| Une liste à règle d'écrivain (`chronoEvaluations`) | Union par le contenu, puis la règle de `travaux-ui.js` : triée par date, les 200 dernières. |
| Une valeur calculée | Ni d'ici ni de l'autre : recalculée (§ 3). |
| Une vignette `thumbnail_<id>` | Suit sa copie : celle de l'autre seulement si la copie vient de l'autre. |
| Une copie aux archives ici (marque `_copiesAuxArchives` d'ici) | Ni sa fiche, ni son fichier, ni sa vignette ne viennent de l'autre. |
| À la corbeille d'un côté, dans les travaux de l'autre | À la corbeille (la corbeille s'écrit avant les travaux). |
| Tout le reste (objets, valeurs simples, autres listes) | Absent d'un côté : gardé. Différent des deux côtés : **montré**. |

**Rien n'est effacé** (décision de Grégoire, 14 h 36). Faire voyager les suppressions : inscrit à la fiche comme suite possible, non fait.

Les conflits gardent les stratégies d'avant (tout ici, tout de l'autre, un par un, annuler). Un conflit d'élément se nomme à l'écran par sa production et son élève, avec la date de modification de chaque côté ; le rapport de « Comparer », lui, ne dit que des clés et des ids, parce qu'il se copie et s'envoie.

**Les fichiers** : `_fusionnerTravaux` n'importe plus que les fichiers des copies que la fusion prend de l'autre (venues de l'autre, ou leur conflit tranché pour l'autre). Il lit toutes les listes de fichiers (`_clesDesListesDeFichiers`, H5 et #1014). Les fichiers passent **avant** les fiches : une fiche dont le fichier n'a pas pu venir est écrite « manquante », comme à l'ouverture. Les trois `.find` de la consigne sont partis : celui de `_fusionnerTravaux` est remplacé, ceux d'`actionFusionner` et d'`actionComparer` n'ont plus d'objet (on ne compare plus des chemins, on suit les copies prises de l'autre).

**Retiré, parce que plus rien ne le lit** : le snapshot de référence (`_codex_snapshot_avant` : `_indexerSnapshot`, `_ecrireSnapshotAvant`, `_lireSnapshotAvant`, `_migrerSnapshotVersIndexHash`, `_sha256Hex`), `_analyserFusionTravaux` et `_grouperParPrefixe`. **Le stock est assumé** : la clé `_codex_snapshot_avant` déjà écrite chez les gens reste, sans lecteur, quelques dizaines de Ko. La retirer d'office écrirait chez eux ; je ne l'ai pas fait.

## 2. Les deux familles du § 3.4, telles que je les ai tranchées

**Ce que j'ai supposé** : la consigne disait « les réglages d'affichage de l'appareil (clés non rattachées à un trimestre) ». Mesuré sur les trois codex : les clés globales ne sont pas toutes des réglages. Elles portent aussi `cours`, les bibliothèques, les cartouches, `retroactionsObservations` (les textes des observations)… J'ai donc fait une liste nommée, et pas une règle « sans trimestre ».

**L'appareil : la valeur d'ici, sans question, rien n'est importé.**
- Toute clé qui commence par `_` (internes, dont `_copiesAuxArchives` et `_manifesteReserve`).
- `REGLAGES_DE_L_APPAREIL` : `backupProchainRappel`, `bienvenue_vu`, `tutoriel_demo_vu`, `nouveautes-beta-93-vue`, `monitorage-version-vue`, `monitorage-build-vu`, `monitorage-bandeau-vu`, `manifeste-masque`, `profilOngletDeveloppementActif`, `etatsAccordeonsV2`, `biblio_active_tab`, `biblio-masquer-deja-present`, `filtresListeEvaluations`, `preferenceTriEvaluations`, `dernieresSelectionsEvaluation`, `etudiantEnCours`, `exportPDF_derniersReglages`, `rythmeColonnesT1`, `travaux-fond-canvas`, `travaux-palette-eval-droite-pos`, `travaux-palette-eval-gauche-pos`, `planif-fond-canvas`, `planif-liens-contourner`, l'affichage de la palette d'annotation (`elementsMasques`, `categoriesMasquees`, `couleursCategories`, `ordreCategories`, `raccourcisAnnotation`), `modeApplication`, `trimestreActif`, `groupeCoursActif`, `demo-chargees`, `demo-version-installee`, `fsapi_persistance_handles`.
- Les drapeaux de migration : un nom qui contient « migration », qui finit par `_done`, ou `fichierIds_nettoyes_vN`.

**Les données : montrées si elles diffèrent des deux côtés.** Tout le reste, avec ou sans trimestre. Sur les codex de Grégoire, trois clés globales en relèvent et diffèrent : `personnalisationObservations` et `retroactionsObservations` (changées sur l'iPad), `preferencesRythme` (changée sur le Mac). Je les ai laissées dans cette famille parce qu'elles portent des choix de Grégoire, pas un affichage. **À trancher par Cowork** si `preferencesRythme` doit plutôt rester à l'appareil.

**Écart à la consigne (§ 3.2)** : l'union par le contenu ne vaut que pour une liste dont l'écrivain a une règle, soit `chronoEvaluations` seulement. Mesuré sur ses codex : 40 autres listes sans `id` (`groupeEtudiants`, `presences`, `horaireHebdo`, `seancesHoraire`, `datesVerrouillees`…). Une union par le contenu y doublerait un élève dont la fiche a changé d'un côté. Ces listes, si elles diffèrent des deux côtés, sont donc montrées comme une clé. Sur les codex de Grégoire, trois seulement diffèrent (`categoriesMasquees`, `elementsMasques`, `ordreCategories`), et ce sont des réglages de l'appareil, gardés ici.

## 3. Les valeurs calculées

`CLES_CALCULEES` : `indicesCP`, `indicesAssiduite`, `indicesAssiduiteDetailles`, `indicesPatternsRaI`, nues ou préfixées (section « Indices » de `docs/DATA-OWNERSHIP.md`).

**Mesuré : rien ne garantit le recalcul au retour à l'écran.** Le drapeau de démarrage `recalculerIndicesCP` (`main.js:409`) n'a aucun écrivain. La fusion appelle donc `calculerEtSauvegarderIndicesAssiduite()` (`indices.js`) après l'écriture, si au moins une clé a été écrite. Cette fonction recalcule A, puis C et P, pour le **trimestre actif**. Les patterns RàI se recalculent à l'affichage du tableau de bord (`tableau-bord-apercu.js:1288`), comme avant. Les autres trimestres gardent leurs valeurs d'ici : la fusion ne les y recalcule pas.

## 4. Les mots (à relire : ce sont les seuls que Grégoire lira)

Avant la fusion, sur ses codex réels (comptes exacts, mesurés) :

> Viendront de l'autre codex : 14 évaluations, 14 annotations, 14 mesures du chronomètre et 3 autres données.
> Rien n'est effacé : ce qui n'est qu'ici est gardé.
> Les copies aux archives ici ne sont pas reprises de l'autre codex.
> Les indices seront recalculés après la fusion.
>
> Différent des deux côtés (6) :
>   ⚠ Copie — *production* · *élève*  (×3)
>   ⚠ La donnée « personnalisationObservations »  (idem pour `preferencesRythme` et `retroactionsObservations`)

Un conflit, un par un : « Ici : modifiée le *date* / Autre codex : modifiée le *date* », puis « 1. Garder la version d'ici / 2. Prendre celle de l'autre codex / 3. Ignorer ».

La fin (si tout est gardé ici) :

> 14 évaluations, 14 annotations, 14 mesures du chronomètre et 3 autres données venues de l'autre codex.
> 6 différences gardées telles qu'ici.
> Les copies aux archives ici n'ont pas été reprises de l'autre codex.
> Les indices ont été recalculés.
>
> Pense à mettre à jour le codex pour y mettre la fusion.

S'y ajoutent, selon le cas : « *N* … remplacées par la version de l'autre codex. », « *N* … mises à la corbeille, comme dans l'autre codex. », « *N* fichiers de copies reçus. » et « *N* fichier(s) de copie non reçu(s) : leur copie est dite « manquante ». ».

**Deux points de mots à trancher** : « mesures du chronomètre » (les temps d'évaluation), et « La donnée « clé » » pour un conflit de clé, qui montre encore un nom technique. Je n'ai pas trouvé mieux sans table de libellés.

## 5. Le résultat sur les fichiers réels (lecture seule, comptes seulement)

Fonction pure appliquée aux `donnees.json` de `…-2026-10-29-14h08.zip` (ici, le Mac ; clés `_*` retirées, comme l'application les retire) et de `…-2026-10-29-14h11.zip` (l'autre, l'iPad), avec la marque des archives du Mac :

| Mesure | Résultat |
|---|---|
| Évaluations (`a2026_evaluationsSauvegardees`) | **151**, aucun conflit |
| Annotations (`a2026_annotationsTravaux`) | **164**, aucun conflit |
| Chronomètre | 14 venues, 200 gardées (règle de l'écrivain) |
| Copies H2026 aux archives sur le Mac | 394 vignettes de l'iPad **non** reprises, aucun fichier H2026 importé |
| Conflits montrés | 6 : 3 copies d'A2026, plus `personnalisationObservations`, `retroactionsObservations` et `preferencesRythme` |
| Copies prises de l'autre sans choix | 0 |

**Les 3 copies en conflit** : sur chacune, `tailleFichier` et `dateModification` diffèrent. Le fichier lui-même a changé d'un seul côté (1 sur le Mac, 2 sur l'iPad, mesure de Cowork). Sans ancêtre fiable, la fusion ne peut pas savoir lequel est le plus récent : elle les montre. **Pour Grégoire, à l'écran** : choisir « 3. Résoudre un par un », la date de chaque côté dit lequel est le plus récent. « Prendre celle de l'autre codex » importe aussi le fichier de la copie. **Attention** : « 1. Garder la version d'ici pour tous » garderait aussi les deux réglages d'observations du Mac, que l'iPad avait changés.

Rouge avant le correctif, mesuré sur l'ancien `js/codex.js` (scénario fictif +3 / +14, ancêtre = le dernier codex du Mac) : **0 conflit annoncé, `a2031_evaluationsSauvegardees` prise de l'autre en silence, 0 évaluation du Mac sur 3 gardée**.

## 6. Les preuves

- Vitest depuis `tests/`, `npm run test:unit` : **850 fichiers, 10 310 tests, tous verts**. `tests/unit/sentinelle-1182-fusion-copie-par-copie.test.js` (21 tests, noms fictifs) couvre : +3 / +14 donnent 37 sans conflit, l'ordre, le cas silencieux, l'élément en conflit et son choix, l'ordre des propriétés, rien d'effacé, les familles, le chronomètre (200, par date), les archives, la corbeille, « manquante », le second trimestre, l'écriture dans la file (un geste pendant la fusion survit) et le recalcul.
- Playwright WebKit, `tests/integration/codex-1182-fusion-copie-par-copie.spec.js` : par le vrai menu, le résumé n'annonce aucun conflit, la fin dit « 14 évaluations et 14 annotations venues de l'autre codex. », l'espace porte 22 évaluations et 21 annotations. On attend des éléments, jamais `waitForTimeout`. Vert, 5,2 s.
- **Break-tests**, arbre restauré par sha256 (`1101903c…` avant et après) :
  - la décision par clé remise : 11 tests de la sentinelle rougissent, et l'essai WebKit aussi (un conflit est annoncé) ;
  - `.find` remis dans `_fusionnerTravaux` : le cas du second trimestre rougit (fiche lue vide).
- Bancs WebKit du codex relancés sur ce lot : 1011, 1028 et 1182 (12/12), puis les quinze autres bancs du codex (1007 ×3, 1012 ×3, 1014, 991, 995, 1024, lot F ×2, lot G, lot I, lot I bis) : **58/58**. La suite Playwright complète n'a pas tourné ici : le verdict reste au Mac, au signal de Grégoire.
- Tests adaptés ou retirés, avec leur motif : `analyser-fusion-hash.test.js` est retiré (il jugeait l'ancêtre et le diff 3 parties, retirés). La sentinelle T2 (d), la 335A, la 522 (lots 5b et 20) et le banc 1011 suivent les sites qui ont changé. Les cliquets de complexité (446 → 445, `chargerCodex` 83 → 77, l'ancienne `_analyserFusion` 56 sort) et de masquages de `cle()` (8 → 5 dans `codex.js`) descendent.

## 7. Trouvailles en chemin

- **Inscrire et continuer, non inscrit** : sur un codex externe, l'ancienne fusion pouvait importer `_copiesAuxArchives` et `_manifesteReserve` de l'autre appareil, ou les supprimer ici. Les clés `_*` d'ici n'étaient pas lues, mais l'ancêtre les connaissait. C'est corrigé par ce lot (la famille « appareil »), sans conséquence vécue : rien à inscrire.
- Deux installations neuves sèment chacune un cours de démo dans la liste `cours`, avec leurs horodatages, et la fusion les montre « différents ». C'est observé au banc seulement ; entre deux appareils partis du même codex, cela n'arrive pas. **Commenter et oublier** : c'est écrit dans le banc.
