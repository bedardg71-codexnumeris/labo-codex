# Audit — chantier du démo, étape 1 (lecture seule)

**Date** : 2026-10-05, 19 h (heure mesurée par `date`).
**Commanditaire** : consigne de Cowork, relayée par Grégoire.
**Code lu** : `HEAD` = `main` = `12cc8ac5`, par `git show HEAD:…` et `git grep … HEAD`. Le disque n'a pas été lu pour `js/` : une autre session y travaille (branche `claude/enregistrement-partout`, une cinquantaine de fichiers modifiés).
**Rien n'a été exécuté** : aucun Vitest, aucun Playwright, aucune sonde de navigateur. Le rituel d'ouverture n'a pas été délégué, parce qu'il lance Vitest. Aucun fichier de `js/`, `index.html`, `styles.css` ou `tests/` n'a été touché.

**Marques** : **[lu]** = vu dans le code, avec fichier et ligne à `HEAD` ; **[inféré]** = déduit du code lu, sans exécution. Tout ce qui demande le navigateur est regroupé au §6.

---

## Vue d'ensemble

| Question | Réponse courte |
|---|---|
| 1. DA démo | Le pack porte `DEMO` + trois chiffres (majuscules, sans accent). L'import des copies ne cherche que sept chiffres : un nom `…_DEMO004_…` ne donne aucun DA. Seul l'appariement par nom de l'élève peut encore rattacher la copie, sans regroupement des pages. |
| 2. Étanchéité | Les fiches des copies vont dans `demo_fichiersTravaux`, mais **les fichiers vont dans le magasin commun**, celui du vrai trimestre. Rien ne les retire. **Le codex emporte toutes les clés `demo_*` et leurs fichiers.** Les Archives et le Suivi longitudinal excluent la démo. |
| 3. Options grisées | Trois mécanismes lus. Aucun ne se trouve dans l'écran d'importation des copies. L'écran que Grégoire a vu reste à nommer (§6). |
| 4. Incomplet | Le pack ne contient que les élèves, les productions, les évaluations, les présences, les modèles et le cadre. Copies, annotations, interventions, bilan, modélisation, portfolio et séances restent vides. Les dates datent d'A2025. |

---

## 1. Les DA démo

### 1.1 Format exact — [lu]

Les dix élèves ont les DA `DEMO004`, `DEMO006`, `DEMO007`, `DEMO010`, `DEMO011`, `DEMO015`, `DEMO016`, `DEMO017`, `DEMO019` et `DEMO020` (`js/pack-demo-10.js:75` à `:174`). Les évaluations les reprennent dans `etudiantDA` (ex. `:350`).

⚠ **Écart avec la prémisse.** Le format est `DEMO` en majuscules sans accent, et non « démo » suivi de trois chiffres. Un fichier nommé `…_démo004_…` ne correspondrait à aucun élève, même après une correction de la détection, à moins que la correction ne normalise la casse et l'accent.

### 1.2 Où l'import des copies reconnaît un DA — [lu]

- `js/travaux-import.js:80-85` : `PATTERNS_DA` contient quatre motifs, et tous exigent `\d{7}`.
- `js/travaux-import.js:265-273` : `detecterDA(nom)` rend la première capture trouvée, sinon une chaîne vide.
- Deux appelants : `preparerFichier` (`:586`) et `parserNomFichierLea` (`:137`), qui lit le format Léa `NOM_DA_Production_Remis_le_…`.

### 1.3 Pourquoi un DA démo n'est pas reconnu, et ce qui en découle

- **[lu]** Aucun des quatre motifs ne capture `DEMO004`. `\b(\d{7})\b` exige sept chiffres et `DA[_\-\s]?(\d{7})` exige le préfixe `DA`.
- **[lu]** Sans DA, `parserNomFichierLea` laisse `nom` et `nomProduction` vides (`:139-162`). `cleDocumentLea` rend alors `''` (`:178`) et `groupeDocumentId` reste vide (`:589-610`). Il n'y a donc **ni regroupement des pages, ni production déduite du nom**.
- **[lu]** Il reste un repli : `trouverEtudiantParDA(da) || trouverEtudiantParNom(fichier.name)` (`:587`). L'appariement par nom (`_apparierParNom`) accepte la fiche si le nom ET le prénom de l'élève figurent dans le nom du fichier en mots entiers, ou le nom seul s'il est unique. La liste lue est celle du mode actif (`obtenirDonneesSelonMode('groupeEtudiants')`, `:278`), donc celle des élèves démo en mode démo.
- **[inféré]** Avec trente fichiers qui portent le nom et le prénom d'un élève démo, l'élève serait trouvé, mais chaque page formerait son propre document. La production serait à choisir à la main.

### 1.4 Les autres validations du DA (règle « sept chiffres, celui du collège »)

| Où | Rôle | Effet sur un DA démo |
|---|---|---|
| `js/trimestre-v2-etudiants.js:697` | Création d'un élève à la main. La règle s'applique à la création seulement : un DA déjà en base (« DEMO015 » est cité en commentaire, `:692`) se garde en édition | **[lu]** Ajouter un élève `DEMO…` est refusé. Les dix du pack restent modifiables |
| `js/trimestre-v2-etudiants.js:262` | Import d'une liste collée (`_jugerLignesImportV2`) | **[lu]** Une ligne `DEMO…` est refusée (« DA invalide ») |
| `js/rencontres.js:200` | `_DA_RE = /^\d{5,}$/`, lecture d'une liste collée dans Rencontres | **[lu]** Un `DEMO…` n'est pas lu comme un DA |
| `js/groupe.js:337` | Repli « AUTO- » + horodatage, signalé comme code sans appelant | **[lu]** Sans effet (pas d'appelant, d'après le commentaire) |
| `js/travaux-resolution.js:149` | Outil de console `diagnostiquer` : un argument non numérique est lu comme un prénom | **[lu]** Sans conséquence à l'écran |

### 1.5 Ce qu'il faudrait toucher sans affaiblir la règle des vrais DA — [inféré]

Seul `PATTERNS_DA` (`js/travaux-import.js:80`) doit bouger. C'est une **détection** dans un nom de fichier, pas une **validation** : il n'invente aucun DA et il n'écrit aucune fiche. Il ne fait que chercher, parmi les DA existants, celui que le nom contient.

- On ajoute un motif `DEMO\d{3}` (insensible à la casse et à l'accent, normalisé en `DEMO###`), **actif seulement en mode démo** (`estEnModeDemo()`). En mode normal, la détection reste identique, octet pour octet.
- La règle de création (`trimestre-v2-etudiants.js:262` et `:697`) ne change pas : le pack de présentation n'ajoute aucun élève, il réutilise les dix.
- Les deux appelants profitent de la même fonction. `parserNomFichierLea` découpe alors correctement nom, DA et production, et le regroupement des pages revient.
- Le banc à écrire : un nom au format Léa avec `DEMO004`, détecté en mode démo et rejeté en mode normal. Une mutation qui retire la garde de mode doit faire rougir le banc.

---

## 2. Étanchéité du mode démo

### 2.1 Où vont les données et les fichiers d'une copie importée en démo

| Élément | Destination | Marque |
|---|---|---|
| Trimestre actif | `activerModeDemo` pose le trimestre `demo` comme actif dans la liste globale `trimestres` (`js/demo-activation.js:267-282`) | [lu] |
| Fiches des copies | `cle('fichiersTravaux')` (`js/travaux-stockage.js:284`, `:306`) donne `demo_fichiersTravaux` : la clé est au registre des clés par trimestre (`js/trimestres.js:72`), et `cle()` préfixe par l'id du trimestre actif (`:417-419`) | [lu] |
| Annotations, corbeille | `demo_annotationsTravaux`, `demo_corbeilleFichiers` (`travaux-stockage.js:915`, `:968`), même mécanisme | [lu] (`annotationsTravaux` est au registre, `trimestres.js:73`) |
| File d'import | `pipeline_queue` est au registre (`trimestres.js:184`), donc `demo_pipeline_queue` | [lu] |
| **Fichiers eux-mêmes** | `stockerBlob` écrit dans le **magasin de fichiers commun** d'IndexedDB (`db.storeBlob({id, etudiantDA, productionId, blob})`, `travaux-stockage.js:193-210`). Ce magasin n'a pas de préfixe : il est partagé avec les copies réelles | [lu] |
| **Fichiers, avec le dossier sur disque actif** | Si un dossier est branché (FSAPI), le fichier est écrit **dans ce dossier réel** (`travaux-stockage.js:196-198`, `:135-140`) | [lu] |
| Évaluations faites sur les copies | `demo_evaluationsSauvegardees` | [inféré] (même routage par `cle()`) |
| Modélisation | `fichiersModelisation` n'est pas au registre et se lit sans préfixe (mémoire du 2026-10-02) : en démo, elle écrirait dans la clé du vrai espace | [inféré], hors du pack de présentation |

### 2.2 Ce qui reste après la sortie du mode démo — [lu]

`desactiverModeDemo` (`js/demo-activation.js:485-580`) retire les éléments démo des clés globales (cours, enseignants, cartouches), retire le trimestre `demo` et restaure le trimestre précédent. Le commentaire est explicite (`:482-483`, étape 5 `:565`) : **les clés `demo_*` ne sont jamais supprimées**. Les fiches des copies démo restent donc dans `demo_fichiersTravaux`, et leurs fichiers dans le magasin commun (ou dans le dossier réel). Au retour en démo, on les retrouve.

### 2.3 Un nettoyage existe-t-il ? — [lu]

Aucun pour les copies démo. `migrerResidusPhase5` (`demo-activation.js:85-141`) ne traite que d'anciens résidus (trimestre `demo` orphelin, instantané orphelin). La seule purge de fichiers est celle de l'ouverture d'un codex complet (`js/codex.js:2025-2077`). Elle ne s'exécute que sur décision humaine (`:955-985`), et elle tient pour orphelin tout fichier que le codex importé ne référence pas : si ce codex ne contient pas de `demo_*`, les fichiers démo seraient proposés à la suppression, et leurs fiches resteraient sans fichier **[inféré]**.

### 2.4 Ce qui peut passer du démo au réel

| Sortie | Verdict | Marque |
|---|---|---|
| **Codex** | **Passe.** `genererCodex` lit toutes les clés sauf `_codex_*` (`codex.js:390-403`), puis il emporte les fichiers de toute clé qui contient `fichiersTravaux` (`:346-357`, `:419-450`), `demo_fichiersTravaux` compris. Les trente copies et leurs fichiers partiraient dans le codex de Grégoire, et donc sur chaque appareil où il l'ouvre | [lu] pour la collecte ; [inféré] pour le trajet complet |
| Export filtré par trimestre | `_detecterTrimestresDisponibles` reconnaît `demo` comme trimestre (`codex.js:2568-2590`), et `_formaterNomTrimestre` l'affiche « Démo » (`:4468`). Il peut donc être coché ou décoché | [lu] ; [inféré] pour la valeur cochée par défaut |
| Archives (Réserve) | **Exclues** : `_trimestresAvecDonnees` filtre `t.id !== 'demo'` (`js/reserve.js:1618`) | [lu] |
| Suivi longitudinal | **Exclu** : `trimestresRepertories` filtre la démo (`js/registre-longitudinal.js:225`), et `inscrire` cherche l'élève parmi ces trimestres seulement (`:556`) | [lu] |
| Trimestre réel | Les clés réelles restent séparées par leur préfixe. Le seul pont est le magasin de fichiers commun (§2.1) | [lu] |
| Export des productions | Les productions démo sont exclues (`js/productions-import-export.js:26-29`) | [lu] |

### 2.5 Ce que deviennent les copies quand le pack démo est réinstallé ou mis à jour — [lu]

`initialiserDemoNamespace` ne réécrit le pack que si sa version change (`js/demo-namespace.js:292-299`, version actuelle « 21.1 »). `peuplerNamespace` réécrit alors onze collections (`:158-183`), dont `evaluationsSauvegardees`, ainsi que les présences, le trimestre, l'enseignant, l'horaire, le groupe-cours et la carte d'alignement. Il **ne touche pas** `demo_fichiersTravaux`, `demo_annotationsTravaux` ni les fichiers.

**[inféré]** Après une mise à jour du pack, les copies et leurs annotations survivent, mais les évaluations faites dessus pendant une présentation sont écrasées par celles du pack. Les copies restent rattachées par DA et par id de production, ce qui ne tient que si le pack garde les mêmes ids.

---

## 3. Options grisées à l'importation en mode démo

Trois mécanismes grisent ou refusent quelque chose en démo. **Aucun ne se trouve dans l'écran d'importation des copies** : les menus de production de cet écran ne posent aucun `disabled` (`js/travaux-ui.js:1343`, `:1935`, `:2041`, `:2052` [lu]), et aucun module d'import de matériel n'en pose non plus (recherche vide dans `import-export.js`, `partage-import.js`, `productions-import-export.js` et les bibliothèques [lu]).

| Mécanisme | Où | Ce qu'il grise | Pourquoi |
|---|---|---|---|
| A. Lecture seule d'un élément démo | `BibliothequeUI.appliquerModeLectureSeuleDemo` (`js/bibliotheque-ui.js:324-350`) ; appelé pour une production (`productions-liste.js:202`), une échelle (`echelles.js:2403`), une grille (`grilles.js:4848`), une pratique (`pratiques-gestion.js:1134`) et une cartouche (`cartouches.js:1620`) | Tous les champs du formulaire, avec un bandeau « Dupliquer pour créer ma version » | Un élément est démo s'il porte `isDemo: true` ou l'auteur `Demo Labo Codex` (`:72-76`). Depuis le 21 août, `peuplerNamespace` pose `isDemo: true` sur chaque élément du pack (`demo-namespace.js:173-183`) : **toutes** les productions, grilles et échelles démo sont en lecture seule [lu] |
| B. Options « Démo » désactivées | `BibliothequeUI.ajouterOptgroupDemo` (`bibliotheque-ui.js:261-280`), appelé dans Trimestre (cours, enseignant, groupe-cours, horaire, pratique : `trimestre-v2*.js`) | Les options du groupe « Démo (par Labo Codex – à dupliquer pour utiliser) » | Interdire qu'une entité réelle pointe vers un modèle démo [lu] |
| C. Refus à l'enregistrement | `BibliothequeUI.verifierReferencesPasDemo` (`:376-410`), appelé au verrouillage d'une évaluation (`evaluation-sauvegarde.js:412`, `evaluation.js:1678`), au groupe-cours (`trimestre-v2-groupes-cours.js:708`) et à la pratique (`pratiques-gestion.js:1550`) | Rien n'est grisé : un avis « Référence démo non autorisée » s'affiche | Même règle. **La garde ne vérifie pas si le mode démo est actif** [lu] |

**Ce que montre la lecture des trois mécanismes.**

- **[inféré]** Une cartouche du pack n'est sans doute **pas** grisée par A. Les cartouches ne passent pas par l'estampille `isDemo` : elles reçoivent `estDemo` à l'activation (`demo-activation.js:213-224`), et `estItemDemo` ne lit pas `estDemo`. Si Grégoire voit une cartouche grisée, le mécanisme est ailleurs.
- **[inféré]** En mode démo, la garde C trouverait la production démo (`isDemo: true`) et la grille démo, puis **refuserait de verrouiller une évaluation démo**. La clé `demo_productions` repasse par `cle()`, qui la rend telle quelle (`bibliotheque-ui.js:398`). Si la mesure le confirme, évaluer une des trente copies en présentation serait bloqué. Aucun banc de `tests/` ne cite cette garde (recherche vide [lu]).

**Ce qui casserait si on rouvrait les options.** [inféré]
- Si on lève A en démo : on modifie le pack en place. Il est réécrit à la prochaine version (§2.5), donc rien n'est perdu côté réel, mais les modifications faites en présentation disparaîtraient sans avertissement.
- Si on lève B ou C **hors** démo : un groupe-cours ou une évaluation réelle pourrait pointer vers un modèle démo, qui disparaît ou change à la mise à jour du pack. Ce serait une référence brisée dans les vraies données. **À ne pas faire.**
- Si on lève C **seulement en mode démo** (garde `estEnModeDemo()`) : rien ne casse côté réel, parce que l'évaluation est écrite dans `demo_*`.

---

## 4. Ce qui est incomplet dans le démo

Ce relevé a été fait par un agent de lecture, sur le même `HEAD`, et repris ici.

### 4.1 Contenu du pack — [lu]

Le pack contient dix élèves, 11 productions, 101 évaluations (toutes au statut « évalué »), 313 présences sur 32 dates, 3 grilles, 2 échelles, 2 pratiques, 3 jeux de cartouches (4, 4 et 1), le cadre du calendrier et l'horaire hebdomadaire (`js/pack-demo-10.js:15-9943`). `peuplerNamespace` y ajoute le trimestre, l'enseignant, l'horaire, le groupe-cours et la carte d'alignement (`demo-namespace.js:207-266`).

### 4.2 Écrans qui n'ont rien à montrer — [lu] (clé lue, absente du pack)

| Écran ou geste | Clé vide |
|---|---|
| Copies : Annoter et évaluer, carrousel, Rythme | `fichiersTravaux` (aucune copie : constat déjà écrit dans `tests/integration/liste-934-reassigner-la-selection.spec.js:18`) |
| Annotations | `annotationsTravaux` |
| Interventions, dépistage | `interventions` |
| Portfolio par élève | `portfoliosEleves` |
| Séances de l'alignement | `planification_seances` (la carte existe, pas les séances) |
| Bilan réflexif | `questionnaireBilan`, `parcoursBilan`, `autoreflexionBilan` |
| Modélisation | `fichiersModelisation` |
| Journées sans cours | `journeesSansCours` |
| Notes du rapport | `notesRapport` |
| Objectifs, tampons, répertoires, partage | Clés globales, sans contenu démo |

### 4.3 Données périmées ou incohérentes

| Constat | Marque |
|---|---|
| Le cadre court du 2025-08-21 au 2025-12-31 (`pack-demo-10.js:36-45`). Rien ne simule une date pour la démo : « semaine en cours » et « séance du jour » tombent hors trimestre | [lu] pour les dates ; [inféré] pour l'effet |
| L'horaire `HOR_DEMO` n'a que deux séances (lundi et mercredi, `demo-namespace.js:236-237`), alors que `horaireHebdo` du pack en a quatre (lundi, mardi, mercredi, jeudi, `pack:46-70`). Des présences du mardi, du jeudi et du vendredi tombent hors séance | [lu] |
| Les élèves portent `groupe: "demo"` et le groupe-cours `groupeNum: '0demo'` | [lu] ; [inféré] pour les filtres qui ne normalisent pas |
| Aucune migration du schéma ni des dates au chargement du pack | [lu] |

---

## 5. Les trois listes

### 5.1 Questions qui reviennent à Grégoire

| # | Question | Ma recommandation |
|---|---|---|
| G1 | **Le codex doit-il emporter la démo ?** Aujourd'hui, il emporte toutes les clés `demo_*` et leurs fichiers : les trente copies de présentation entreraient dans son codex. (Ce qui se garde ou se retire.) | **Non.** Le codex exclut la démo, qui se réinstalle depuis l'application. D'ici là, **ne pas générer de codex pendant que les trente copies sont présentes.** |
| G2 | **Le nom des fichiers du pack de présentation** : `DEMO004` (ce que porte le pack) ou « démo004 » ? | Nommer les fichiers au format Léa avec `DEMO` + trois chiffres, exactement comme dans le pack, et rendre quand même la détection tolérante à la casse et à l'accent (T1). |
| G3 | **Le geste de retrait** : où le placer, et avec quels mots ? (Mots d'écran.) | Un seul bouton dans le bandeau démo, par exemple « Retirer les copies de présentation (30) ». Le compte s'affiche avant la confirmation. Je propose les mots, il les tranche. |
| G4 | **Les évaluations faites pendant une présentation** disparaissent à la prochaine mise à jour du pack. Est-ce acceptable ? | Oui, pour une présentation. Le retrait (G3) les efface de toute façon. Il faut seulement l'écrire dans le mode d'emploi du pack. |
| G5 | **Quels écrans vides remplir** pour la présentation (§4.2), et faut-il recaler les dates A2025 ? | Ne remplir que ce que le scénario de présentation montre. Les trente copies couvrent déjà Annoter et évaluer. Le recalage des dates n'entre au backlog que si l'écran périmé gêne une présentation réelle. |

### 5.2 Décisions techniques proposées à Cowork

| # | Proposition | Pourquoi |
|---|---|---|
| T1 | Ajouter à `PATTERNS_DA` (`travaux-import.js:80`) un motif `d[ée]mo\d{3}`, insensible à la casse et normalisé en `DEMO###`, **actif seulement en mode démo**. Ne pas toucher `trimestre-v2-etudiants.js`. Banc : un nom au format Léa, détecté en démo, rejeté hors démo, avec mutation sur la garde de mode. | C'est une détection, pas une création de DA : la règle des sept chiffres reste intacte. Le regroupement des pages revient. |
| T2 | `genererCodex` exclut les clés `demo_*` et les fichiers qu'elles référencent (`codex.js:390-450`), avec un banc qui part d'un `demo_fichiersTravaux` non vide. | C'est la seule fuite lue vers les données réelles. Elle conditionne l'exigence « ne jamais entrer ». **Dépend de G1.** |
| T3 | Retrait des copies démo **par identité** : lire les ids de `demo_fichiersTravaux`, `demo_corbeilleFichiers` et `demo_annotationsTravaux`, supprimer ces fichiers seulement, puis vider ces trois clés. Faire d'abord une passe à blanc qui compte, jamais un filtre par drapeau (skill `hygiene-donnees-partagees`). | Le magasin de fichiers est commun : un filtre trop large toucherait de vraies copies. |
| T4 | Refuser l'import de copies en démo quand un dossier sur disque (FSAPI) est branché, ou l'annoncer. | Les fichiers démo s'écriraient dans le dossier réel (`travaux-stockage.js:196`). Le banc de T3 ne les y retrouverait pas par IndexedDB. |
| T5 | Garde C (`verifierReferencesPasDemo`) : ne pas l'appliquer quand le mode démo est actif, **après** la mesure M2. | Sinon, évaluer une copie de présentation serait refusé. Rien ne change côté réel. |
| T6 | Écrire dans le mode d'emploi du pack ce qu'une mise à jour du pack écrase et ce qu'elle garde (§2.5). | Tarir n'est pas réparer : le stock démo survit aux mises à jour du pack. Il faut l'assumer par écrit. |
| — | Horaire à deux séances contre quatre, `groupe`/`groupeNum`, dates A2025 : **inscrire et continuer** seulement si un symptôme est vécu en présentation. | Règle d'entrée au backlog (24 août). |

### 5.3 À mesurer (au navigateur, non mesuré ici)

| # | Mesure |
|---|---|
| M1 | **L'écran exact où Grégoire voit production, échelle et cartouche grisées.** Aucun des trois mécanismes lus ne vit dans l'import des copies (§3). Une capture ou le nom de l'écran suffit. |
| M2 | Verrouiller une évaluation en mode démo : l'avis « Référence démo non autorisée » apparaît-il ? |
| M3 | Une cartouche du pack est-elle en lecture seule en démo ? (Le code lu dit non.) |
| M4 | Importer un fichier `X_Y_DEMO004_Artefact_1_Remis_le_…` en démo : élève trouvé par le nom ? pages regroupées ? |
| M5 | Après l'import de copies en démo puis la sortie de la démo : `demo_fichiersTravaux` non vide, et fichiers présents dans le magasin commun (lecture seule d'IndexedDB). |
| M6 | Générer un codex avec des copies démo présentes : le ZIP contient-il `demo_fichiersTravaux` et leurs fichiers ? (À faire sur un profil jetable, jamais sur l'espace de Grégoire.) |
| M7 | L'export filtré par trimestre : la case « Démo » est-elle cochée par défaut ? |
| M8 | Tableau de bord, calendrier et présences le 2026-10-05, avec le cadre A2025 ; sort des présences hors des deux séances de `HOR_DEMO`. |

---

## 5 bis. Complément après comparaison (2026-10-05, 19 h 20)

Cowork a exécuté la même consigne en parallèle, sur le disque. Sa version n'est pas commitée et sert seulement de comparaison. Sept points n'y figuraient que chez lui. Je les ai revérifiés moi-même à `HEAD` = `42824121` (1.186.2, qui contient la fusion du lot 2 de l'enregistrement), sans me fier à ses numéros de ligne. Le pack a été lu par `node`, sans rien exécuter de l'application.

| # | Point de Cowork | Verdict | Ce que dit le code à `HEAD` |
|---|---|---|---|
| C1 | 98 des 101 évaluations du pack sont verrouillées, et le verrou grise production, grille, cartouche et échelle | **Confirmé** [lu] | Le pack contient 98 évaluations `verrouillee: true`. Trois sont libres : DEMO004 › Artefact 7, DEMO020 › Évaluation terminale, DEMO006 › Évaluation terminale. Il y a deux couples sans évaluation : DEMO015 › Artefact 3 et Artefact 4. Au chargement d'une évaluation verrouillée, `evaluation.js:747-751` appelle `desactiverFormulaireEvaluation(true)`, qui désactive `selectGroupeEval`, `selectProduction1`, `selectGrille1`, `selectCartoucheEval`, `selectEchelle1`, `remiseProduction1` et `statutIntegrite` (`evaluation.js:2748-2769`), ainsi que les critères et la rétroaction. ~~Hypothèse la plus probable pour M1~~ : **attribution retirée** (§5 ter). M1 désigne le mécanisme A, et non ce verrou. Seul le décompte reste, comme fait du §4. |
| C2 | La garde C n'est atteinte que par le verrouillage ; une évaluation déverrouillée ne peut plus être reverrouillée | **Confirmé** [lu] | Le seul bouton est `btnVerrouillerEvaluation` → `basculerVerrouillageEvaluationCourante` (`index.html:8409`), et la copie y mène par le cadenas (`travaux-ui.js:5336`). Le verrouillage appelle `sauvegarderEvaluation` (`evaluation.js:2634`), qui passe par la garde (`evaluation-sauvegarde.js:412`) ou renvoie à `sauvegarderEvaluationModifiee`, gardée elle aussi (`evaluation.js:1678`). Le déverrouillage écrit `verrouillee = false` sans aucune vérification (`evaluation.js:2639-2650`). **Si M2 confirme le refus** [inféré] : une copie évaluée en présentation reste en brouillon, et une évaluation du pack déverrouillée ne se reverrouille plus. **T5 passe alors avant T1.** |
| C3 | Quitter la démo pendant un import écrirait les copies suivantes dans le trimestre restauré | **Confirmé** [lu] pour le mécanisme, [inféré] pour l'effet | `importerTous` attend (`await`) chaque fichier dans sa boucle (`travaux-import.js:878-926`). `ajouterFichierTravail` relit et réécrit `cle('fichiersTravaux')` au moment de l'écriture (`travaux-stockage.js:283-320`). `importEnCours` est exposé (`travaux-import.js:2131`) mais n'est lu nulle part dans `demo-activation.js` (recherche vide). La garde de #340 (`productions-namespace-garde.js`) ne protège que `<trimestre>_productions`. Effet probable : les fiches des copies restantes s'**ajoutent** à la vraie liste du trimestre restauré, avec des DA démo. |
| C4 | Les vignettes vivent sous une clé globale `thumbnail_<id>` | **Confirmé** [lu] | `stockerThumbnail` écrit `db.set('thumbnail_' + fichierId, …)` (`travaux-stockage.js:734`), sans `cle()`. `genererCodex` prend toutes les clés, donc il les emporte aussi. Un export filtré les range parmi les clés globales [inféré, d'après `_filtrerDonneesPourExport`]. La Réserve les traite déjà par id (`reserve-copies.js:355`, `reserve-renvoyer.js:528`) : c'est le modèle à suivre. |
| C5 | T1 : la coupe par `indexOf(resultat.da)` casse si le DA est normalisé | **Confirmé** [lu], comme contrainte de conception | `parserNomFichierLea` coupe à `partieIdentite.indexOf(resultat.da)` (`travaux-import.js:141`). Aujourd'hui, `detecterDA` rend la sous-chaîne telle qu'écrite, donc l'index est juste. Une normalisation en `DEMO###` faite **dans** `detecterDA` rendrait −1 pour un fichier `demo004` [inféré]. Il faut couper à la position du motif trouvé. |
| C6 | L'export de sélection propose le trimestre « Démo » | **Confirmé** [lu] ; **M7 tranché par lecture** | `actionExporterSelection` (`codex.js:4215`) liste les trimestres détectés, `demo` compris (`:4243-4262`). Il n'y a **pas de case à cocher par défaut** : on tape des numéros, et « tous » inclut la démo (`:4276-4277`). |
| C7 | `configPAN.portfolio.methodeSelection` vaut « recents » ; la pratique `demo-std-litt` dit « meilleurs » | **Confirmé pour les données** [lu] ; **risque d'écran réfuté en grande partie** [lu/inféré] | Les deux valeurs sont bien dans le pack. Mais le moteur de la note (`profil-etudiant-actions.js:170-185`), le panneau du portfolio (`portfolio.js:168-181`) et la pratique PAN (`pratique-pan-standards.js:575-588`) lisent tous **la pratique active** (`obtenirConfigPratiqueActive`), et non le `configPAN` (commentaire « Phase G2-a » : plus de repli sur ce `configPAN`). Le `configPAN` n'est lu que par une instance simulée qui l'injecte (#307, `pratique-pan-standards.js:578-580`). Le profil devrait donc dire « meilleurs » [inféré : la pratique active résolue en démo n'a pas été suivie jusqu'au bout]. |

### Ajouts aux listes

**§3, à compléter** : il y a un quatrième mécanisme, D. Le verrou d'une évaluation grise production, grille, cartouche et échelle (C1). 98 des 101 évaluations du pack sont verrouillées, donc presque chaque élève et chaque production ouvre un formulaire grisé. Ce n'est **pas** l'écran de M1 (§5 ter).

**§4, à ajouter** : en démo, il ne reste que trois couples élève-production évaluables sans déverrouiller (DEMO004 › Artefact 7 ; DEMO020 et DEMO006 › Évaluation terminale), plus deux couples vierges (DEMO015 › Artefact 3 et Artefact 4) [lu].

**Décisions techniques proposées à Cowork** :

| # | Proposition | Pourquoi |
|---|---|---|
| T7 | Bloquer « Quitter la démo » (et le décochage de l'accueil) tant que `travauxImport.importEnCours` est vrai, avec un avis. À défaut, figer la clé de destination au début de `importerTous`. | C'est la mécanique de #340, transposée aux copies. Elle n'est couverte par aucune garde. |
| T2/T3, précisés | Inclure `thumbnail_<id>`, sélectionnés par les ids des trois listes `demo_` (fiches, corbeille, annotations), au modèle de `reserve-copies.js`. | C4 |
| T1, précisé | Couper nom et production à la position du motif trouvé, et non par `indexOf` du DA normalisé. Banc : `X_Y_demo004_Artefact_1_Remis_le_…` donne DA `DEMO004`, nom `X Y`, production `Artefact 1`. | C5 |
| Ordre | Si M2 confirme le refus : **T5 avant T1**. | C2 |

**À mesurer, ajouts et mises à jour** :

| # | Mesure |
|---|---|
| M1 | **Mesuré par Grégoire** (§5 ter) : rien à mesurer. |
| M7 | **Tranché par lecture** (C6) : rien à mesurer. |
| M9 | Avec un profil jetable : lancer un import de plusieurs copies en démo, quitter la démo pendant l'import, puis lire `<trimestre>_fichiersTravaux` du trimestre restauré (C3). Vérifier aussi si le bandeau « Quitter la démo » reste cliquable pendant l'import. |
| M10 | Au profil d'un élève démo : la note du portfolio retient-elle « les meilleurs » ? Et le Comparateur, qui simule, lit-il le `configPAN` « recents » ? (C7) |

## 5 ter. M1 mesuré, et le modèle d'échelle et de cartouche (2026-10-05, 20 h 30)

### M1 — l'écran grisé est la fiche de production (mécanisme A)

**Mesuré par Grégoire** (capture, 5 oct., 19 h 22, mode démo). Le menu verrouillé est l'« Échelle de performance » de la fiche de production (Artefact 1, Conception › Productions), sous le bandeau « Exemple fourni par Labo Codex (lecture seule) ». C'est le mécanisme A du §3 : `appliquerModeLectureSeuleDemo`, appelé par `productions-liste.js:202` pour une production qui porte `isDemo: true`, estampille posée par `peuplerNamespace` [lu]. Ce n'est pas le verrou des évaluations (C1), dont l'attribution est retirée. Le décompte de C1 (98 évaluations verrouillées sur 101, trois libres, deux couples sans évaluation) reste un fait du §4.

### L'échelle et la cartouche de la production ne sont qu'un modèle — [lu] à `HEAD` = `6a5f0c7d`

`_modeleProductionPourEval` (`js/evaluation-chargement.js:665-684`) lit les évaluations non remplacées de la production qui ont une grille. Si toutes ont la même grille, la fonction rend cette grille, plus l'échelle et la cartouche **si elles aussi sont uniques, sinon une chaîne vide**. La fonction ne retombe sur les champs de la production (`prod.echelleId`, `prod.cartoucheId`, aujourd'hui absents, donc « Aucune ») que s'il n'y a **aucune** évaluation liée ou si la grille n'est pas unique (`:683`).

J'ai recompté dans le pack, par `node`, sur une copie : l'échelle n'est pas unique pour Artefact 3 et Artefact 5, la cartouche ne l'est pas pour Artefact 4 et Artefact 5. Le compte concorde avec celui de Cowork.

**Conséquence** [inféré]. Les deux couples sans évaluation, DEMO015 › Artefact 3 et Artefact 4, s'ouvrent avec un champ à choisir dans le formulaire d'évaluation : l'échelle pour Artefact 3, la cartouche pour Artefact 4. Ce restera vrai **même après le changement (B)** : ces productions ont des évaluations dont la grille est unique, donc le défaut posé sur la production n'est pas lu pour elles.

### Ce qu'on ne fait pas

- **Ne pas déverrouiller la fiche de production** : la lecture seule protège le pack.
- **« Dupliquer » n'est pas un chemin pour le pack de présentation** [lu pour le principe] : la copie reçoit un nouvel identifiant (fork de `bibliotheque-ui.js`), et les évaluations démo, qui pointent vers l'ancien, ne la suivraient pas.

### Changement (B) — préparé, non appliqué

Le pack démo recevra une échelle et une cartouche par défaut sur ses productions : c'est une exception à « le pack reste tel quel », accordée par Grégoire le 5 oct. au soir. La règle est de Cowork : une valeur n'est posée que si toutes les évaluations non remplacées de la production concordent. Ma copie d'essai donne exactement la liste de Cowork : neuf productions touchées, Artefact 5 et Portfolio laissés vides, la version passe de 21.1 à 21.2.

Le changement, sa sentinelle et le break-test sont prêts hors du dépôt. Ils seront appliqués à la prochaine session de travail, puis livrés à la prochaine release normale.

---

## 6. Dispositions

Ce rapport ne porte encore aucune disposition. Chaque ligne de G, T et M doit recevoir *inscrit* (n°), *refusé* (motif) ou *périmé* avant que l'audit soit clos.
