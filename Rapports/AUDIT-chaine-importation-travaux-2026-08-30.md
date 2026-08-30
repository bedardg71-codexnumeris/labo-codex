# Audit — chaîne d'importation des travaux (Labo Codex)

Date : 2026-08-30. Dépôt : `~/Documents/GitHub/Monitorage_v6`, branche `main` au commit `ac1adfcb` (fix #605). Deux fichiers portent des modifications non commitées (`index.html`, `js/liste-evaluations.js`, chantier #606 : en-tête de la vue Corbeille) — elles sont purement présentationnelles et ne touchent ni le comptage ni la résolution des fichiers ; l'audit porte sur la version de travail. Aucun fichier du dépôt n'a été modifié.

Élargissements de périmètre, annoncés : `js/travaux-ui.js` (c'est lui qui orchestre la confirmation d'import, la modale de doublon, l'assemblage et le rattachement des jetons — la chaîne n'existe pas sans lui), `js/codex.js` (fusion de codex et plan de purge #336, parce que ce sont des voies d'entrée de blobs), `js/db.js`, `js/modes.js` et `js/trimestres.js` (lecture seule, pour établir les sémantiques de `getSync`/`setSync`, du filtrage par cours et de `cle()`).

Convention de certitude : **VÉRIFIÉ** = lu dans le code, extrait cité ; **INFÉRÉ** = conséquence déduite du code sans exécution ; **SUPPOSÉ** = demande un test réel.

---

## 1. Synthèse

Trois risques menacent réellement la cohorte de septembre :

1. **L'assemblage automatique fusionne des travaux distincts.** Deux images qui partagent un nom de fichier sans DA, ou deux remises Léa successives d'un même élève, sont soudées en un seul PDF sans avertissement ; le second fichier disparaît de la file. Un travail peut ainsi finir dans le document d'un autre élève, ou une version 2 dans le PDF de la version 1.
2. **L'appariement fichier → élève se trompe en silence dans trois cas** : correspondance par nom en sous-chaîne (`Martin` absorbe `Martineau`), DA détecté mais inconnu du groupe (le fichier est stocké sous ce DA et n'a aucune ligne dans la liste), et rattachement après rechargement par nom de fichier seul (deux `devoir.pdf` peuvent s'échanger).
3. **Jeton de reprise et fichiers ne sont couplés que dans un sens.** Retirer un jeton supprime l'évaluation de reprise mais laisse son fichier actif et « plus récent » : l'originale restaurée résout alors vers le travail de reprise. Et quand le maximum de reprises est atteint, le bouton « Appliquer comme jeton » importe le fichier, ne consomme rien, et l'écran annonce quand même « 1 jeton appliqué ».

À quoi s'ajoute une fragilité de reprise : l'import ne persiste l'état de la file qu'à la fin du lot, et les fichiers sans DA ni production échappent à toute détection de doublon — un import interrompu puis rejoué crée des doublons muets.

Ce qui tient : la détection par clé `(DA, production)` est cohérente entre la pré-vérification, l'import et le bandeau ; le dépôt direct écrit les métadonnées puis le blob avec rollback ; la corbeille est réversible 30 jours et ne détruit que ce qui est annoncé (#556) ; le compteur de la liste relit le stockage à chaque rendu (pas de compteur dénormalisé) ; `echapperHtml` échappe les guillemets et est appliqué sur toute la chaîne d'import ; zéro handler inline ; `validerMagicBytes` couvre le dépôt, le réimport, le ZIP de sauvegarde et l'ouverture d'un codex, y compris après conversion HEIC, préparation canvas et assemblage.

---

## 2. Constats

### 2.1 Comment la chaîne fonctionne réellement (repères)

- **Clé de doublon** = le couple `(etudiantDA, productionId)`, et rien d'autre. Ni nom, ni taille, ni empreinte, ni date. VÉRIFIÉ : `travaux-import.js:676-684` (à l'import), `:1674-1676` (pré-vérification), `travaux-resolution.js:276-281` (bandeau). Un même travail renommé est donc détecté ; deux travaux différents de même nom sont distingués ; deux fichiers d'un même élève pour une même production sont *toujours* signalés, qu'ils soient identiques ou non.
- **« Signature de fichiers »** (`travaux-doublons-ui.js:22-24`) = liste triée des `id` d'un cas ; elle sert uniquement à faire expirer une validation quand un fichier rejoint le cas. **« Pattern »** (`:113-119`) = présence de `_-_Jeton_` dans un nom de fichier, sinon « plusieurs fichiers ». **« Cas valide »** = entrée persistée dans `cas_fichiers_multiples_valides` (`:12, 49-62`). **« Livrable additionnel »** = un drapeau posé sur l'entrée de la file (`travaux-ui.js:4046`) qui n'est *jamais* écrit en base (voir M4) ; ce qui persiste, c'est la validation du cas (`:4052-4056`).
- **Appariement** : DA par regex sur le nom (`travaux-import.js:80-85, 249-257`), puis nom/prénom en sous-chaîne (`:366-382`). Le DA détecté est conservé comme `etudiantDA` même quand aucun élève ne correspond (`:535`).
- **Stockage** : métadonnées dans `fichiersTravaux` (clé namespacée par trimestre, `travaux-stockage.js:284`), blob dans le store IDB `fichiers` (`db.js:1203-1227`) ou sur disque via FSAPI (Chrome/Edge Mac seulement, `travaux-stockage.js:29`). Au-delà de 25 Ki caractères (`db.js:120`, pas 200 Ko comme l'indique `DATA-OWNERSHIP.md`), la clé vit dans `memoryCache` + IDB.
- **Liste des évaluations** : une ligne par (élève inscrit × production), statut recalculé à chaque rendu en relisant `fichiersTravaux` (`liste-evaluations.js:41-82`) ; résolution évaluation → fichier par `evaluationId`, puis chaîne `repriseDeId`, puis « le plus récent » du couple `(DA, production)` (`travaux-resolution.js:64-125`).

### 2.2 BLOQUANT

#### B1 — L'assemblage automatique fusionne des fichiers qui ne sont pas des pages d'un même document

`travaux-import.js:1143` ; `travaux-ui.js:3817, 4248-4275`. **VÉRIFIÉ** (mécanisme), **INFÉRÉ** (fréquence).

```js
// travaux-import.js:1143
const cle = f.groupeDocumentId || ('_solo_' + f.nomFichier);
// travaux-ui.js:3817
const optAssemblage = true;
// travaux-ui.js:4250-4252
const images = fichiers.filter(f => f.estImage);
if (images.length < 2) continue;
```

L'assemblage est forcé (la case a été retirée) et regroupe *toute* paire d'images partageant une clé. Deux clés sont fautives :

- **`_solo_<nomFichier>`** : deux images sans DA qui portent le même nom sont un « document ». Scénario : l'enseignant photographie des copies avec l'iPad, dépose `IMG_0412.jpg` (élève A, associé à la main), puis un second lot venu d'un autre appareil qui contient aussi `IMG_0412.jpg` (élève B, associé à la main). À « Oui, importer », B est retiré de la file (`:4259-4262`), sa page devient la page 2 du PDF de A (`:4267-4275`). B reste « Non reçu » ; rien ne le signale. L'association manuelle ne recalcule pas `groupeDocumentId` (`travaux-import.js:1341-1346`), la clé reste `_solo_`.
- **`DA_nomProduction`** (`travaux-import.js:518`) sans la date de remise : deux remises Léa distinctes d'un même élève (v1 lundi, v2 mercredi, toutes deux en image) ont la même clé → un seul PDF de deux pages, trié par `dateRemise` (`:1147-1162`), jamais présenté comme doublon. Le correctif #603 a rendu ce cas *plus* probable en retirant le suffixe de page mais pas en discriminant par date. La possibilité de remises multiples dans un export Léa est SUPPOSÉE.

Les PDF ne sont pas concernés (filtre `estImage`) ; eux tombent dans la détection de doublon à l'import.

### 2.3 SÉRIEUX

#### S1 — Un fichier sans DA ou sans production n'est jamais détecté comme doublon, et la file n'est persistée qu'en fin de lot

`travaux-import.js:676-684, 765-804`. **VÉRIFIÉ**.

```js
// :676
if (fichierPrepare.etudiantDA && productionId &&
    !fichierPrepare.estReprise && !fichierPrepare.livrableAdditionnel &&
    !fichierPrepare.remplaceExistant) { … doublon … }
```

La confirmation permet explicitement d'importer « sans production associée » (`travaux-ui.js:3659-3661`) et le bandeau « sans DA » est non bloquant (`:3697-3716`). Dans la boucle `importerTous`, `fichier.statut = 'importe'` n'est persisté qu'après le dernier fichier (`:797-804`). Scénario : 40 photos sans DA, l'iPad se met en veille au 25ᵉ fichier ; au retour la file affiche 40 fichiers « à re-déposer » ; l'enseignant re-dépose, confirme : 25 fichiers en double, aucun avertissement, « 40 fichier(s) importé(s) ». Même chose pour qui clique deux fois « Oui, importer » sur des fichiers non identifiés.

#### S2 — Le rattachement des blobs après rechargement se fait par nom de fichier seul

`travaux-import.js:1470-1486`. **VÉRIFIÉ** (mécanisme), **INFÉRÉ** (ordre de la `FileList`).

```js
const index = fichiersEnAttente.findIndex(f => f.nomFichier === fichier.name && !f.fichier);
```

`tailleFichier` est pourtant persistée (`:864`). Scénario : deux entrées `devoir.pdf` associées à la main à A et à B, rechargement, re-dépôt des deux fichiers en une sélection ; le premier `File` rendu par le navigateur prend la première entrée libre, quel que soit son contenu. Le travail de B peut être stocké sous le DA de A sans trace. Note : après conversion HEIC, `tailleFichier` est celle du JPEG produit (`:1068`), donc un correctif par taille doit comparer la taille *d'origine*.

#### S3 — Appariement par nom : sous-chaîne, sans normalisation, premier arrivé gagne

`travaux-import.js:366-382` (et `:299-311`, même logique). **VÉRIFIÉ**.

```js
if (nom && nom.length > 3 && nomLower.includes(nom)) return etudiant;
```

Scénario : le groupe compte `Martin, Léa` et `Martineau, Yann` ; le fichier `Martineau_Yann_devoir.pdf` est associé à Léa Martin si elle précède dans la liste. Le fichier est ensuite stocké sous son DA, sans avertissement (le bandeau « sans DA » se déclenche, mais il dit « l'association devra être faite manuellement », alors qu'une association *fausse* a été faite). Inversement `Roy`, `Côté` (accent dans la fiche, absent du nom de fichier), et tout nom ≤ 3 lettres ne sont jamais reconnus — ce qui est sûr mais silencieux.

#### S4 — Un DA détecté mais inconnu du groupe est stocké tel quel, et le fichier n'a aucune ligne dans la liste

`travaux-import.js:535, 692` ; `liste-evaluations.js:829-898`. **VÉRIFIÉ**.

```js
// travaux-import.js:535
etudiantDA: etudiant ? etudiant.da : daDetecte,
```

Le seul avertissement pré-import vise les fichiers *sans* DA (`travaux-ui.js:3700`) ; un DA faux (faute de frappe, `12345678_devoir.pdf` tronqué en `2345678` par `PATTERNS_DA[2]`, fichier d'un élève d'un autre cours) passe. Après import, la liste ne crée de ligne de rattrapage que pour DA vide (`liste-evaluations.js:833`) ou production orpheline (`:847-849`) ; un fichier « DA inconnu + production valide » n'apparaît nulle part dans la liste. Il reste visible dans la grille de l'onglet Importer sous « Inconnu » (`travaux-ui.js:2809-2812`), ce que l'enseignant ne consulte pas pour évaluer. Le message « Attention : N fichiers correspondent à des étudiants d'un autre groupe-cours… (les fichiers seront non identifiés) » (`travaux-ui.js:3685`) est faux : ils *sont* identifiés par DA, mais dans un groupe où l'élève n'existe pas.

#### S5 — Retirer un jeton de reprise (ou appliquer un jeton en supprimant l'originale) laisse le fichier de reprise actif ; la résolution « plus récent » le donne ensuite à l'originale

`evaluation-jetons.js:516-638, 484-487` ; `travaux-resolution.js:104-125` ; `liste-evaluations.js:59-61`. **VÉRIFIÉ**.

`retirerJetonReprise` supprime l'évaluation de reprise (`:551`, `:595`) et ne touche à aucun fichier (aucune référence à `travauxStockage` dans le module ; aucun appelant ne compense — `evaluation-sauvegarde.js:915, 941`). Le fichier importé comme reprise garde `estReprise: true` et un `evaluationId` qui ne pointe plus sur rien. La liste résout le fichier de chaque ligne *sans* `id` :

```js
// liste-evaluations.js:60
travauxResolution.trouverFichierPourEvaluation({ etudiantDA: ligne.da, productionId: ligne.productionId })
```

donc par le repli `(DA, production)` → « le plus récent par `dateModification` » (`travaux-resolution.js:115-125`), c'est-à-dire le fichier de reprise, dont `dateModification` a été rafraîchie par `mettreAJourFichier` (`travaux-stockage.js:450`). Scénario : jeton appliqué par erreur, retiré aussitôt ; la ligne de l'originale affiche maintenant le statut et ouvre le travail de la *reprise* ; le bandeau « plusieurs fichiers » signale un cas « à décision manuelle ». Symétriquement, `appliquerJetonReprise` avec `archiverOriginale = false` splice l'originale (`:486`) et laisse le fichier original avec un `evaluationId` mort.

#### S6 — « Appliquer comme jeton de reprise » quand le maximum par production est atteint : le fichier est importé, aucun jeton n'est consommé, l'écran dit le contraire

`travaux-ui.js:3933-3940, 3984-4009, 4115-4124, 3907` ; `evaluation-jetons.js:432-438`. **VÉRIFIÉ**.

Le bouton n'est conditionné qu'à `verifierDisponibiliteJeton(da, 'reprise')` (compte global), pas à `maxParProduction`. `appliquerJetonReprise(..., { silencieux: true })` rend `null` sans message (`:433-437`). Le fichier, déjà importé avec `estReprise` et sans `evaluationId`, est ensuite ramassé par `appliquerJetonsReprisePostImport`, rattaché à la reprise *existante* et compté :

```js
// travaux-ui.js:4120-4124
if (repriseExistante) {
    travauxStockage.mettreAJourFichier(fichier.id, { evaluationId: repriseExistante.id });
    compteur++;
```

Notification finale : « 1 jeton(s) de reprise appliqué(s) » (`:3907`). L'enseignant croit avoir accordé une seconde reprise ; la première évaluation de reprise a maintenant deux fichiers.

#### S7 — Import sans groupe-cours actif : les fichiers deviennent invisibles dès qu'un groupe est activé

`travaux-import.js:688, 695` ; `travaux-stockage.js:410-416`. **VÉRIFIÉ** (mécanisme), **SUPPOSÉ** (atteignabilité — `groupeCoursActif` est remis à `null` en quatre endroits de `trimestre-v2-groupes-cours.js:780, 963, 999` et `trimestres.js:504`, après suppression ou réinitialisation d'un groupe).

```js
// travaux-stockage.js:412-415
const gcActif = db.getSync('groupeCoursActif', null);
if (!gcActif || !gcActif.id) return fichiers;
return fichiers.filter(f => f.groupeCoursId === gcActif.id);
```

Sans groupe actif, aucun message : la confirmation affiche « seront importés  et associés… » (`msgGroupe` vide, `travaux-ui.js:3662-3666`), `groupeCoursId` est `''`. Dès qu'un groupe est actif, ces fichiers sortent de toutes les vues filtrées, mais restent atteints par le repli de résolution non filtré (`travaux-resolution.js:107`, via `obtenirFichiersEtudiant`) : état incohérent entre la liste, le carrousel et la visionneuse.

#### S8 — Restauration d'un ZIP de sauvegarde : échecs de blobs avalés, « Import réussi » quand même, métadonnées laissées `present`

`import-export.js:1358-1397, 2640-2644`. **VÉRIFIÉ**.

Chaque blob refusé (magic bytes, quota, transaction) n'est qu'un `console.warn` ; `nbRestores` ne compte que les succès ; l'alerte finale dit « Import réussi ! N clé(s) + K fichier(s) » ; aucune métadonnée n'est marquée `blobStatut: 'manquant'` (contrairement au chemin codex, `codex.js:730-744`). Et `stockerBlob` est appelé avec la notification par défaut : un iPad plein produit une notification « Stockage plein » *par blob* (`travaux-stockage.js:217-218`). Scénario : 200 travaux, quota atteint au 40ᵉ → 160 bandeaux, message de succès, 160 vignettes qui ouvrent une visionneuse vide (`travaux-visionneuse.js:82-85`, `return false` sans message).

#### S9 — Fusion de codex : blobs stockés sans `validerMagicBytes`

`codex.js:2313-2319`. **VÉRIFIÉ**. Hors des neuf fichiers, mais c'est une voie d'entrée de blobs vers le même store. La règle « tout import image/PDF passe par `validerMagicBytes` » y est absente (comparer `codex.js:699-706`, chemin « ouvrir », qui l'applique). Un `travaux/FT_x.pdf` contenant du HTML, reçu d'un collègue, est stocké puis servi par la visionneuse.

#### S10 — Plan de purge #336 : la corbeille et la modélisation sont recensées comme orphelines

`codex.js:1658-1667`. **VÉRIFIÉ** (recensement), **INFÉRÉ** (destruction — l'exécution reste manuelle, `Codex.purgerEspacePrecedent()`).

Seuls les ids présents dans une clé contenant `fichiersTravaux` sont tenus pour référencés ; les blobs de `corbeilleFichiers` (conservés par `deplacerEnCorbeille`, `travaux-stockage.js:974`) et de `fichiersModelisation` sont donc « orphelins ». Un enseignant qui suit la console après ouverture d'un codex détruit sa corbeille restaurable.

### 2.4 MINEUR

- **M1 — « Renommer pour distinguer » ne distingue rien.** `travaux-import.js:1713-1736` ne change que `nomFichier` ; la clé de doublon reste `(DA, production)` (`:676-684`). Le texte de la modale (`travaux-ui.js:3778`) suggère que le renommage évite le doublon ; la modale par fichier apparaît quand même. VÉRIFIÉ.
- **M2 — Le pattern « jeton » du bandeau lit le nom de fichier, pas `estReprise`.** `travaux-doublons-ui.js:113-119`. Une reprise créée par le bouton « Appliquer comme jeton » (qui ne valide pas le cas, `travaux-ui.js:3984-4009`) réapparaît en « Plusieurs fichiers — décision manuelle ». VÉRIFIÉ.
- **M3 — `lancerImport` (chemin legacy, bouton `travaux-ui.js:2467`) ignore les doublons rendus par `importerTous`** : les fichiers restent en statut `doublon` dans la file, l'alerte dit « N importés ». VÉRIFIÉ pour le code ; INFÉRÉ que ce chemin est encore atteignable (rendu à `:5235`).
- **M4 — `livrableAdditionnel` n'est jamais persisté.** `ajouterFichierTravail` (`travaux-stockage.js:304-335`) ne recopie pas le champ. Sans effet visible (la validation du cas est persistée à part), mais champ mort dans les métadonnées d'import (`travaux-import.js:721`). VÉRIFIÉ.
- **M5 — `assemblerGroupesPipeline` splice la file sans la persister** (`travaux-ui.js:4259-4262`) : après une interruption, les entrées fusionnées ressuscitent au rechargement comme « à re-déposer ». VÉRIFIÉ.
- **M6 — Écriture IDB-first non attendue** : `setSync` sur `fichiersTravaux` (> 25 Ki) écrit `memoryCache` puis IDB en arrière-plan (`db.js:1531-1540`). Fermer l'onglet juste après un import peut perdre les métadonnées du dernier fichier alors que son blob est écrit ; le blob devient orphelin, le fichier disparaît, un ré-import ne détecte rien. INFÉRÉ.
- **M7 — `statutRemise` n'est pas la SSOT annoncée.** L'import ne l'écrit jamais ; le sélecteur du formulaire (`index.html:8503-8509`) permet `importe`, que la liste ignore (`liste-evaluations.js:125`). Deux vérités possibles pour une même évaluation. VÉRIFIÉ (sous-audit liste).
- **M8 — La liste ne se rafraîchit que par navigation** : aucun appel ni événement depuis `travaux-*.js` après import (sous-audit liste). Sans conséquence aujourd'hui (l'import et la liste sont deux sous-sections), fragile par construction.
- **M9 — Réversibilité d'un import dans la mauvaise production : fichier par fichier.** `changerProductionFichier` (`travaux-ui.js:4412-4435`) vérifie conflit et évaluation orpheline — solide — mais il n'existe pas d'annulation du lot. 30 fichiers = 30 gestes.
- **M10 — Documentation** : `DATA-OWNERSHIP.md` annonce un seuil IDB-first de 200 Ko, le code dit 25 Ki (`db.js:120`).
- **M11 — Sécurité, cas limites** (sous-audit G) : `import-export.js:1686` (`data-item-id="${itemId}"`) et `:1731→1854,1871,1872` (noms de clés d'un fichier importé dans `<span>`) sans `echapperHtml` ; `travaux-import.js:1325` (`(${e.da})` en texte d'option) ; `travaux-ui.js:6230, 6235, 5653, 6415` (DA de fiche en attribut/texte). 20 `console.log` dans `travaux-resolution.js` (outils console volontaires). Zéro handler inline. Rien de ceci n'est exploitable sans une fiche étudiant ou un fichier de configuration forgé, et la CSP bloque l'exécution inline.

### 2.5 Ce qui est solide

- Détection de doublon cohérente sur toute la chaîne (pré-vérification, import, bandeau) ; le remplacement n'efface plus l'ancien avant que le nouveau soit écrit (#604, `travaux-ui.js:4029-4041`) ; l'ordre métadonnées → blob → rollback du dépôt direct (`travaux-import.js:725-739`).
- Corbeille : mise en corbeille et restauration sont des couples lecture/écriture synchrones (`travaux-stockage.js:959-1004`) ; `viderCorbeille` exige la liste annoncée (#556).
- Résolution évaluation → fichier : refus de la résolution par DA seul (#145, `travaux-resolution.js:104-106`) ; réassociation d'un fichier vérifiée contre conflit et évaluation orpheline avant application.
- Liste : aucun compteur dénormalisé ; corbeille exclue par retrait physique ; `appliquerFiltres()` rappelé après corbeille, restauration et résolution de doublons.
- File d'import : namespacée par trimestre (#464), champs d'intention survivants au rechargement (#314, #558), import bloqué tant qu'un blob manque (`travaux-ui.js:3634-3645`).
- Sécurité : `echapperHtml` échappe `& < > " '` (`config.js:293-305`) ; tous les rendus de la chaîne d'import (file, modales de doublon, liste, corbeille) l'appliquent ; `validerMagicBytes` refuse sur exception, rejette les conteneurs `ftyp` non image, et s'applique au blob *final* (post-HEIC, post-préparation, post-assemblage) ; `validerZipSecurite` est appelé après chaque `JSZip.loadAsync` (`import-export.js:1263`, `codex.js:965, 1040`, `codex-data.js:168`, `reserve-ouvrir.js:88`, `partage-import.js:401`).
- Chemin « ouvrir un codex » : pré-vol quota, bilan honnête, marquage `manquant`, vérification de persistance, `db.flush()` avant rechargement.

---

## 3. Correctifs proposés (BLOQUANT et SÉRIEUX) — NON APPLIQUÉS

Chaque diff dit ce qu'il retire. Ils sont indépendants et peuvent s'appliquer un fichier à la fois.

### B1 — Ne jamais assembler par nom de fichier ; discriminer les remises par date

```diff
--- a/js/travaux-import.js
+++ b/js/travaux-import.js
@@ preparerFichier
-        if (parseLea.da && parseLea.nomProduction) {
-            // Format LEA complet : DA + nom production
-            groupeDocumentId = parseLea.da + '_' + parseLea.nomProduction.replace(/\s+/g, '-');
+        if (parseLea.da && parseLea.nomProduction) {
+            // Format LEA complet : DA + nom production + horodatage de la remise.
+            // Léa horodate la REMISE (#603) : les pages d'une même remise partagent
+            // la date, deux remises successives ne la partagent pas. Sans la date,
+            // v1 et v2 d'un même élève étaient soudées en un seul PDF.
+            const horodatage = parseLea.dateRemise ? '_' + parseLea.dateRemise.getTime() : '';
+            groupeDocumentId = parseLea.da + '_' + parseLea.nomProduction.replace(/\s+/g, '-') + horodatage;
@@ regrouperParDocument
-        fichiersEnAttente.forEach(f => {
-            const cle = f.groupeDocumentId || ('_solo_' + f.nomFichier);
+        fichiersEnAttente.forEach((f, i) => {
+            // Un fichier sans clé de document est SEUL : deux fichiers qui partagent
+            // un nom (IMG_0412.jpg de deux appareils) ne sont pas des pages.
+            const cle = f.groupeDocumentId || ('_solo_' + i);
```

```diff
--- a/js/travaux-ui.js
+++ b/js/travaux-ui.js
@@ assemblerGroupesPipeline
                 for (let i = images.length - 1; i >= 1; i--) {
                     const idx = queue.indexOf(images[i]);
                     if (idx !== -1) queue.splice(idx, 1);
                 }
+                // La file en mémoire et la file persistée bougent ENSEMBLE (cf. #558 B1).
+                if (typeof travauxImport.persisterFileDAttente === 'function') travauxImport.persisterFileDAttente();
```

À retirer : rien. À exposer : `persisterFileDAttente` sur `window.travauxImport` (il est aujourd'hui privé). Test à écrire : deux images sans DA, même nom → deux entrées après `assemblerGroupesPipeline` ; deux images Léa même DA/production, dates de remise différentes → deux entrées ; même date → une.

### S1 — Persister la file à chaque fichier ; détecter le doublon des fichiers non identifiés par (nom, taille)

```diff
--- a/js/travaux-import.js
+++ b/js/travaux-import.js
@@ importerFichier — après le bloc (DA, production)
+        // Fichier sans DA ou sans production : la clé (DA, production) ne peut rien
+        // dire. Un même octet re-déposé (import rejoué après interruption, double
+        // clic) est reconnu par nom d'origine + taille dans le même groupe-cours.
+        if ((!fichierPrepare.etudiantDA || !productionId) &&
+            !fichierPrepare.remplaceExistant && !fichierPrepare.livrableAdditionnel) {
+            const memesOctets = travauxStockage.obtenirFichiersGroupeActif()
+                .filter(f => f.nomFichierLea === fichierPrepare.nomFichier
+                          && f.tailleFichier === blob.size);
+            if (memesOctets.length > 0) {
+                return { doublon: true, fichierExistant: memesOctets[0], fichierPrepare: fichierPrepare, productionId: productionId, critere: 'nom-taille' };
+            }
+        }
@@ importerTous — dans la boucle, après le try/catch
             if (onProgression) {
                 onProgression(i + 1, total);
             }
+            // Le retrait d'un fichier importé doit survivre à une interruption
+            // (iPad en veille, onglet fermé) : persister à chaque pas, pas en fin de lot.
+            persisterFileDAttente();
```

Note : `blob.size` est la taille *après* compression (`compresserImageSiNecessaire`), donc comparable à `tailleFichier` stockée. La modale `traiterDoublonsImport` doit afficher le critère quand `d.critere === 'nom-taille'` (« même nom et même taille qu'un fichier déjà importé ») et masquer le bouton « jeton » (pas d'élève).

### S2 — Rattacher par nom ET taille d'origine

```diff
--- a/js/travaux-import.js
+++ b/js/travaux-import.js
@@ preparerFichier
             tailleFichier: fichier.size,
+            tailleOriginale: fichier.size,   // taille du File déposé, avant HEIC/préparation
@@ persisterFileDAttente
                 tailleFichier: f.tailleFichier,
+                tailleOriginale: f.tailleOriginale || f.tailleFichier || 0,
@@ restaurerFileDAttente
                 tailleFichier: d.tailleFichier || 0,
+                tailleOriginale: d.tailleOriginale || d.tailleFichier || 0,
@@ reattacherBlobs
-            const index = fichiersEnAttente.findIndex(f => f.nomFichier === fichier.name && !f.fichier);
-            if (index === -1) continue;
+            const index = fichiersEnAttente.findIndex(f =>
+                f.nomFichier === fichier.name && f.tailleOriginale === fichier.size && !f.fichier);
+            if (index === -1) { ignores.push(fichier.name); continue; }
```

et rendre `{ rattaches, ignores }` pour que `redeposerFichiers` (`travaux-ui.js:2160-2175`) dise à l'enseignant quels fichiers n'ont pas été reconnus (« nom ou taille différents de ce qui était dans la file »). À retirer : le retour numérique nu de `reattacherBlobs`.

### S3 — Appariement par nom : tokens exacts, normalisés, uniques

```diff
--- a/js/travaux-import.js
+++ b/js/travaux-import.js
+    function _normaliserToken(s) {
+        return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
+    }
+    function _tokensNom(nomFichier) {
+        return new Set(_normaliserToken(nomFichier.replace(/\.[^.]+$/, '')).split(/[^a-z0-9]+/).filter(Boolean));
+    }
     function trouverEtudiantParNom(nomFichier) {
         const etudiants = obtenirDonneesSelonMode('groupeEtudiants');
-        const nomLower = nomFichier.toLowerCase().replace(/[_\-]/g, ' ');
-
-        for (const etudiant of etudiants) {
-            const nom = (etudiant.nom || '').toLowerCase();
-            const prenom = (etudiant.prenom || '').toLowerCase();
-
-            if (nom && prenom && nomLower.includes(nom) && nomLower.includes(prenom)) {
-                return etudiant;
-            }
-            if (nom && nom.length > 3 && nomLower.includes(nom)) {
-                return etudiant;
-            }
-        }
-        return null;
+        const tokens = _tokensNom(nomFichier);
+        const contient = (s) => _normaliserToken(s).split(/[^a-z0-9]+/).filter(Boolean).every(t => tokens.has(t));
+        // 1. Nom ET prénom présents comme mots entiers : unique ou rien.
+        const complets = etudiants.filter(e => e.nom && e.prenom && contient(e.nom) && contient(e.prenom));
+        if (complets.length === 1) return complets[0];
+        if (complets.length > 1) return null;
+        // 2. Nom seul, mot entier, et UN SEUL élève du groupe porte ce nom.
+        const parNom = etudiants.filter(e => e.nom && contient(e.nom));
+        return parNom.length === 1 ? parNom[0] : null;
     }
```

Appliquer la même fonction dans `chercherParNomEtendu` (`:299-311`), qui duplique la logique fautive ; à retirer : cette copie locale. « Roy » et « Côté » deviennent reconnus ; `Martineau` ne tombe plus sur `Martin`.

### S4 — Signaler un DA qui ne correspond à personne, avant et après import

```diff
--- a/js/travaux-import.js
+++ b/js/travaux-import.js
+    /**
+     * Fichiers dont le nom porte un DA qui ne correspond à AUCUN élève du groupe actif.
+     * Distinct de detecterFichiersSansDA : ici l'association est FAUSSE, pas absente.
+     */
+    function detecterFichiersDAInconnu() {
+        return obtenirFileDAttente().filter(f => f && f.daDetecte && !f.etudiantAssocie);
+    }
@@ exports
+        detecterFichiersDAInconnu: detecterFichiersDAInconnu,
```

```diff
--- a/js/travaux-ui.js
+++ b/js/travaux-ui.js
@@ confirmerImportPipeline — après bandeauSansDA
+        const fichiersDAInconnu = travauxImport.detecterFichiersDAInconnu();
+        let bandeauDAInconnu = '';
+        if (fichiersDAInconnu.length > 0) {
+            bandeauDAInconnu = '<div class="travaux-bandeau-sans-da">'
+                + '<p><strong>DA sans élève dans ce groupe :</strong></p><ul>'
+                + fichiersDAInconnu.map(f => '<li>' + echapperHtml(f.nomFichier) + ' — DA ' + echapperHtml(f.daDetecte) + '</li>').join('')
+                + '</ul><p class="texte-muted u-texte-petit">Faute de frappe, élève d’un autre groupe ou non inscrit. Importé tel quel, ce fichier n’aura pas de ligne dans la liste des évaluations.</p></div>';
+        }
@@ afficherModalePipeline
-            bandeauAutreGC + bandeauSansDA + bandeauDoublons + `<p>…
+            bandeauAutreGC + bandeauSansDA + bandeauDAInconnu + bandeauDoublons + `<p>…
@@ message autre GC (ligne 3685)
-                + '<p class="texte-muted u-texte-petit">Tu peux importer quand même (les fichiers seront non identifiés) ou basculer ci-dessous.</p>'
+                + '<p class="texte-muted u-texte-petit">Importés ici, ces fichiers porteront le DA de l’élève mais n’apparaîtront pas dans la liste de ce groupe. Bascule vers le bon groupe ci-dessous.</p>'
```

```diff
--- a/js/liste-evaluations.js
+++ b/js/liste-evaluations.js
@@ construireLignesEvaluations — lignes de rattrapage
-        // Fichiers avec DA valide mais productionId orphelin ou vide
-        const fichiersOrphelins = fichiers.filter(f =>
-            f.etudiantDA && (!f.productionId || !productionIdsConnus.has(f.productionId))
-        );
+        // Fichiers avec DA mais production orpheline/vide, OU DA inconnu du groupe :
+        // les deux cas exigent un geste d'association et méritent une ligne.
+        const dasConnus = new Set(etudiants.map(e => e.da));
+        const fichiersOrphelins = fichiers.filter(f =>
+            f.etudiantDA && (!f.productionId || !productionIdsConnus.has(f.productionId) || !dasConnus.has(f.etudiantDA))
+        );
```

(La ligne créée porte déjà `nom: etudiant ? … : '?'` et `etudiantManquant` n'est posé que pour DA vide : ajouter `etudiantManquant: !etudiant` dans l'objet poussé à `:874-884` pour que l'infobulle « Étudiant·e introuvable » de `:1143` s'affiche.)

### S5 — Coupler le retrait du jeton et le fichier de reprise

```diff
--- a/js/evaluation-jetons.js
+++ b/js/evaluation-jetons.js
+/**
+ * Les fichiers liés à une évaluation qui disparaît vont à la corbeille (reprise
+ * annulée) ou sont déliés (originale supprimée par archiverOriginale:false).
+ * Sans cela, le fichier reste « actif » et « plus récent », et la résolution
+ * (DA, production) le donne à l'évaluation survivante.
+ */
+function _detacherFichiersDeEvaluation(evaluationId, mode) {
+    if (typeof travauxStockage === 'undefined') return 0;
+    var fichiers = travauxStockage.obtenirFichiersTravaux().filter(function(f) { return f.evaluationId === evaluationId; });
+    fichiers.forEach(function(f) {
+        if (mode === 'corbeille') travauxStockage.deplacerEnCorbeille(f.id);
+        else travauxStockage.mettreAJourFichier(f.id, { evaluationId: '', estReprise: false });
+    });
+    return fichiers.length;
+}
@@ appliquerJetonReprise
     } else {
         // Option 2: Supprimer l'originale
         evaluations.splice(indexOriginal, 1);
+        _detacherFichiersDeEvaluation(evaluationOriginaleId, 'delier');
     }
@@ retirerJetonReprise — branche « originale remplacée » (#141)
         if (indexRepriseLiee !== -1) {
             evaluations.splice(indexRepriseLiee, 1);
+            _detacherFichiersDeEvaluation(evaluationReprise.remplaceeParId, 'corbeille');
         }
@@ retirerJetonReprise — branche « reprise »
         // Supprimer la reprise
         evaluations.splice(indexReprise, 1);
+        var nbFichiers = _detacherFichiersDeEvaluation(evaluationId, 'corbeille');
-        notifications.succes('Reprise supprimée, originale restaurée');
+        notifications.succes('Reprise supprimée, originale restaurée' + (nbFichiers ? ' — ' + nbFichiers + ' fichier(s) de reprise mis à la corbeille' : ''));
```

Le texte du `confirm` (`:579-583`) doit annoncer la mise en corbeille du fichier. `_detacherFichiersDeEvaluation` doit être appelée AVANT `_persisterEvaluationsJetons` pour que les deux écritures se suivent sans `await` entre elles (elles sont synchrones). Sentinelle à écrire : après `retirerJetonReprise`, `trouverFichierPourEvaluation(originale)` rend le fichier original.

### S6 — Vérifier le maximum par production avant d'offrir le jeton ; ne pas compter un rattachement comme un jeton

```diff
--- a/js/travaux-ui.js
+++ b/js/travaux-ui.js
@@ traiterDoublonsImport
-                var jetonDispo = verifierDisponibiliteJeton(d.fichierExistant.etudiantDA, 'reprise');
-                if (jetonDispo) {
+                var jetonDispo = verifierDisponibiliteJeton(d.fichierExistant.etudiantDA, 'reprise');
+                var reprisesProd = (obtenirDonneesSelonMode('evaluationsSauvegardees') || []).filter(function(e) {
+                    return e.etudiantDA === d.fichierExistant.etudiantDA && e.productionId === d.productionId && e.jetonRepriseApplique === true;
+                }).length;
+                var maxProd = (configJetons.reprise && configJetons.reprise.maxParProduction) || 1;
+                if (jetonDispo && reprisesProd < maxProd) {
@@ branche 'jeton'
                         if (evalActive) {
                             var nouvelleEval = appliquerJetonReprise(evalActive.id, null, { silencieux: true });
-                            if (nouvelleEval) {
+                            if (!nouvelleEval) {
+                                notifications.erreur('Jeton non appliqué', 'Le fichier est importé comme reprise, mais aucun jeton n’a été consommé (limite atteinte). Voir la liste des évaluations.');
+                            } else {
@@ appliquerJetonsReprisePostImport
             if (repriseExistante) {
-                // Jeton déjà appliqué — lier le fichier à l'évaluation existante
                 travauxStockage.mettreAJourFichier(fichier.id, { evaluationId: repriseExistante.id });
-                compteur++;
+                rattaches.push(nomEtudiant);   // lié à une reprise EXISTANTE : pas un jeton de plus
                 continue;
             }
```

et une notification distincte « N fichier(s) rattaché(s) à une reprise déjà accordée » ; le message « jeton(s) de reprise appliqué(s) » ne compte plus que les jetons réellement créés. À retirer : le `compteur++` de cette branche.

### S7 — Refuser l'import sans groupe-cours actif

```diff
--- a/js/travaux-ui.js
+++ b/js/travaux-ui.js
@@ confirmerImportPipeline — juste après la garde sansBlob
+        const gcActifImport = db.getSync('groupeCoursActif', null);
+        if (!gcActifImport || !gcActifImport.id) {
+            afficherModalePipeline('Aucun groupe-cours actif',
+                '<p>Choisis d’abord le groupe-cours dans l’en-tête. Sans lui, les fichiers importés ne seraient rattachés à aucun groupe et disparaîtraient des listes.</p>',
+                [{ label: 'OK', classe: 'btn-principal', action: () => {} }]);
+            return;
+        }
```

Et retirer le repli « pas de groupe → tous les fichiers » de `obtenirFichiersGroupeActif` (`travaux-stockage.js:413`) n'est *pas* recommandé sans audit des 60 appelants ; le refus à l'entrée suffit à fermer le cas pour les nouveaux imports.

### S8 — Restauration ZIP : compter, marquer, ne notifier qu'une fois

```diff
--- a/js/import-export.js
+++ b/js/import-export.js
@@ _restaurerBlobsDepuisZip
-    let nbRestores = 0;
+    let nbRestores = 0;
+    const idsManquants = [];
     for (const f of metadonnees) {
         try {
             …
                     if (!magicOk) {
                         console.warn(`[Import ZIP] Blob refusé (magic bytes invalides) pour ${f.id}`);
+                        idsManquants.push(f.id);
                         continue;
                     }
                 }
-                await travauxStockage.stockerBlob(f.id, blob, f.etudiantDA, f.productionId);
+                await travauxStockage.stockerBlob(f.id, blob, f.etudiantDA, f.productionId, { notifier: false });
                 nbRestores++;
+            } else {
+                idsManquants.push(f.id);
             }
         } catch (e) {
             console.warn(`[Import ZIP] Erreur restauration blob ${f.id}:`, e);
+            idsManquants.push(f.id);
         }
     }
-
-    if (nbRestores > 0) {
-    }
-    return nbRestores;
+    // Marquer les métadonnées dont le blob n'est pas arrivé (même contrat que codex.js).
+    if (idsManquants.length > 0) {
+        const manquants = new Set(idsManquants);
+        for (const cleFT of Object.keys(donnees).filter(c => c.includes('fichiersTravaux'))) {
+            const liste = await db.get(cleFT, []);
+            if (!Array.isArray(liste)) continue;
+            liste.forEach(f => { if (manquants.has(f.id)) f.blobStatut = 'manquant'; });
+            await db.set(cleFT, liste);
+        }
+    }
+    return { restaures: nbRestores, manquants: idsManquants.length };
@@ appelant (l. 2640-2644)
-        const msgBlobs = nbRestores > 0 ? ` + ${nbRestores} fichier(s) travaux` : '';
-        alert(`Import réussi !\n\n${nbCles} clé(s) de données importée(s)${msgBlobs}.`);
+        const msgBlobs = ` + ${resBlobs.restaures} fichier(s) travaux`
+            + (resBlobs.manquants ? `\n\n⚠ ${resBlobs.manquants} fichier(s) n’ont pas pu être restaurés (espace insuffisant ou contenu refusé). Ils sont marqués « manquant » ; libère de l’espace et refais l’import du même ZIP.` : '');
+        alert(`Import ${resBlobs.manquants ? 'partiel' : 'réussi'}\n\n${nbCles} clé(s) de données importée(s)${msgBlobs}.`);
```

À retirer : le bloc vide `if (nbRestores > 0) {}` et le retour numérique nu. Les autres appelants de `_restaurerBlobsDepuisZip` (`:3071`) reçoivent l'objet.

### S9 — Fusion de codex : valider les octets

```diff
--- a/js/codex.js
+++ b/js/codex.js
@@ _fusionnerTravaux
             var blobData = await entree.async('blob');
+            if (!(await window.travauxImport.validerMagicBytes(blobData))) {
+                erreurs.push(chemin + ' : contenu refusé (pas une image ni un PDF)');
+                ignores++;
+                continue;
+            }
             var meta = indexFT[idFichier];
```

### S10 — Purge #336 : la corbeille et la modélisation référencent aussi des blobs

```diff
--- a/js/codex.js
+++ b/js/codex.js
@@ plan de purge (l. 1658)
-        if (c.indexOf('fichiersTravaux') === -1) return;
+        // Tout ce qui RÉFÉRENCE un blob du store `fichiers` : travaux actifs,
+        // corbeille (blob conservé, restaurable 30 jours) et modélisation.
+        if (c.indexOf('fichiersTravaux') === -1 && c.indexOf('corbeilleFichiers') === -1 && c.indexOf('fichiersModelisation') === -1) return;
```

Vérifier que la structure des entrées de `fichiersModelisation` porte bien `id` (`modelisation.js:25-26, 238`) — INFÉRÉ par le sous-audit, non relu par moi.

---

## 4. Angles morts — à tester en conditions réelles

Ce que le code seul n'établit pas, et où un test sur Mac et sur iPad séparément est nécessaire :

1. **Ordre de la `FileList`** lors d'un re-dépôt multi-fichiers (S2) : Finder et l'app Fichiers d'iPadOS n'ordonnent pas forcément de la même façon. À tester avec deux fichiers homonymes.
2. **Remises multiples dans un export Léa** (B1, seconde clé) : vérifier si Léa livre plusieurs remises d'un même élève et sous quel nom.
3. **Veille iPad pendant `executerImportPipeline`** : le batch traite 10 images en parallèle (`travaux-ui.js:3826-3856`) avec balance des blancs sur canvas plein format ; sur iPad, 10 photos 12 Mpx simultanées peuvent faire tuer l'onglet par WebKit (« Un problème est survenu à répétition »). C'est exactement le scénario qui déclenche S1. Mesurer avec 40 photos d'iPhone. Vérifier aussi si `sessionStorage` survit à cette relance forcée — sinon la file est perdue, pas seulement les blobs.
4. **`groupeCoursActif` nul** (S7) : reproduire le parcours qui y mène (suppression du groupe actif, réinitialisation) puis importer.
5. **Quota IndexedDB Safari/iPadOS** : le pré-vol quota existe sur le chemin codex, pas sur le dépôt direct ni la restauration ZIP ; mesurer le comportement réel à 80 % puis 100 % (`QuotaExceededError` en `onabort` sous WebKit, testé par le code mais non mesuré ici). L'éviction de stockage après 7 jours sans usage (Safari, si `persist()` a été refusé) est SUPPOSÉE : vérifier la valeur rendue par `navigator.storage.persist()` sur iPad en mode « ajouté à l'écran d'accueil » et en onglet Safari.
6. **FSAPI sur Mac Chrome** : les blobs vont sur disque ; le plan de purge #336 et le codex ne les voient pas de la même façon (`listBlobIds` IDB). Vérifier qu'un codex enregistré depuis un poste FSAPI embarque bien les blobs.
7. **`memoryCache` et fermeture immédiate** (M6) : fermer l'onglet dans la seconde qui suit un import et vérifier la présence des métadonnées au retour.
8. **Volume** : 5 groupes × 30 élèves × 3 fichiers ≈ 450 entrées dans `fichiersTravaux` (~300 Ko de métadonnées, IDB-first) ; la liste refait O(lignes × fichiers) par rendu (`calculerStatutWorkflow` + dropdown). Mesurer le temps de rendu de la liste et du carrousel à 450 fichiers, sur iPad.
9. **`mapping_anonymisation`** : le sous-audit n'a pas établi qu'il ne peut jamais provenir d'un fichier importé (`anonymiserNom` non échappé, `travaux-ui.js:2825, 2562`).
10. **Chemin `lancerImport` legacy** (M3) : établir s'il est encore atteignable depuis l'interface ; sinon le retirer (zéro-dette).

Rappel de statut : ce rapport est une lecture de code (~18 000 lignes du périmètre, plus les élargissements nommés) sans exécution dans un navigateur. Les niveaux de certitude sont indiqués constat par constat ; mon avis n'est pas celui d'un pair, et les correctifs doivent être relus avant application.
