# Spécification technique — Module Réserve v1

> **Date** : 26 avril 2026
> **Statut** : Conception validée, prête pour implémentation
> **Document parent** : `docs/architecture/ECOSYSTEME-DONNEES.md`
> **Implémentation** : Claude Code (terminal)

---

## Résumé des décisions de conception

| Décision                  | Choix retenu                                    |
|---------------------------|-------------------------------------------------|
| Navigateur cible          | Safari (Mac). Pas de FSAPI disponible.          |
| Mécanisme d'écriture      | ZIP structuré téléchargé, décompressé manuellement dans le Finder |
| Granularité du ZIP        | Un **groupe-cours** à la fois (pas un trimestre entier) |
| Identité                  | UUID v4 par versement (collision-safe pour la Voûte) |
| Emplacement réserve       | `~/Documents/Réserve_LaboCodex/`                |
| Purge post-versement      | Non. Le versement est une copie, pas un déplacement. |
| FSAPI (Chrome/Edge)       | Pas implémenté en v1. Safari uniquement.        |

---

## 1. Fichier à créer : `js/reserve.js`

### 1.1 Responsabilités

Le module `reserve.js` est responsable de :

- Générer un ZIP structuré contenant les données et travaux d'un **groupe-cours**
- Filtrer les données IndexedDB pour isoler un groupe-cours spécifique
- Attribuer un UUID v4 unique à chaque versement
- Structurer le ZIP pour qu'il soit directement décompressable dans la réserve
- Mettre à jour le `manifeste-reserve.json` (inclus dans le ZIP)
- Fournir l'API appelée par l'interface utilisateur

Le module n'est PAS responsable de :

- Écrire directement sur le disque (pas de FSAPI en v1)
- Purger les données dans IndexedDB après versement
- Gérer la voûte (phase ultérieure)
- Gérer les codex data (phase ultérieure)

### 1.2 Dépendances

```
reserve.js dépend de :
  - db.js              (lecture des données IndexedDB)
  - trimestres.js      (cle() pour namespacing, liste des trimestres)
  - travaux-stockage.js (recupererBlob pour les fichiers travaux)
  - JSZip              (libs/jszip.min.js — déjà présent)

reserve.js ne dépend PAS de :
  - codex.js           (pas de couplage entre codex et réserve)
  - import-export.js   (pas de réutilisation du mécanisme d'export existant)
```

### 1.3 Pattern du module

Même pattern IIFE que les autres modules du projet :

```javascript
(function() {
'use strict';

// ... code du module ...

// Export vers window
window.Reserve = {
    verserTrimestre: verserTrimestre,
    estimerVersement: estimerVersement
};

})();
```

---

## 2. API publique

### 2.1 `Reserve.verserGroupeCours(trimestre, groupeCoursId)`

Fonction principale. Génère et télécharge un ZIP structuré contenant
les données et travaux d'un **groupe-cours** spécifique d'un trimestre.

**Paramètres** :
- `trimestre` (string) : identifiant du trimestre, ex. `'a2025'`, `'h2026'`
- `groupeCoursId` (string) : identifiant du groupe-cours (valeur de
  `groupeCoursActif.id` ou `infoCours._groupeCoursId`)

**Retour** : `Promise<{ succes: boolean, stats: Object, uuid: string }>`

**Flux détaillé** :

```
1. VALIDATION
   - Vérifier que le trimestre existe (clés préfixées dans IndexedDB)
   - Vérifier que le groupeCoursId correspond à un groupe connu dans
     listeCours (chercher par id dans les entrées de listeCours)
   - Vérifier que JSZip est disponible
   - Générer un UUID v4 pour ce versement (crypto.randomUUID())
   - Si aucune donnée trouvée → erreur explicite

2. RÉSOLUTION DU NOM DE DOSSIER
   - Lire listeCours pour trouver le cours correspondant au groupeCoursId
   - Extraire : trimestre, code du cours (ex. '601-101'), numéro de groupe (ex. '00001')
   - Construire le nom du dossier : {trimestre}-{cours}-gr{groupe}
     Exemple : 'a2025-601-101-gr00001'
   - Le suffixe de discipline (-MQ, -GA, etc.) est omis pour rester court

3. COLLECTE DES DONNÉES (filtrées par groupe)
   - Lister toutes les clés IndexedDB via db.keys()
   - Filtrer les clés préfixées par {trimestre}_
   - Pour les données multi-groupes, filtrer par groupeCoursId :
     a. {trimestre}_groupeEtudiants → filtrer les étudiants dont le
        groupe correspond (champ `groupe` comparé via normaliserGroupe())
     b. {trimestre}_presences → filtrer par les DA des étudiants du groupe
     c. {trimestre}_evaluationsSauvegardees → filtrer par les DA du groupe
     d. {trimestre}_fichiersTravaux → filtrer par groupeCoursId dans les métadonnées
     e. {trimestre}_snapshots → filtrer par groupeCoursId (clé dans l'objet snapshots)
     f. {trimestre}_interventions → filtrer par les DA du groupe
   - Clés qui passent sans filtre (communes à tous les groupes du trimestre) :
     {trimestre}_productions, {trimestre}_seances, {trimestre}_objectifs,
     {trimestre}_objectifsAssignes (filtrés par DA si applicable)
   - Clés globales pertinentes : listeCours, grillesTemplates, echellesTemplates,
     pratiquesConfigurables, modalitesEvaluation, infoCours, cartouches_{grilleId}

4. COLLECTE DES BLOBS TRAVAUX (filtrés par groupe)
   - Depuis les fichiersTravaux déjà filtrés à l'étape 3d
   - Pour chaque fichier, récupérer le blob via travauxStockage.recupererBlob(id)
   - Compter trouvés vs manquants (tolérance : warning, pas erreur)

5. CONSTRUCTION DU ZIP
   Structure pour décompression directe dans Réserve_LaboCodex/ :
   
   trimestres/
   └── {trimestre}-{cours}-gr{groupe}/
       ├── donnees.json
       ├── meta.json
       ├── travaux/
       │   ├── {id}.jpg
       │   ├── {id}.pdf
       │   └── ...
       └── manifeste-reserve-patch.json

6. GÉNÉRATION DU meta.json
   {
     "uuid": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
     "trimestre": "a2025",
     "cours": "601-101-MQ",
     "groupe": "00001",
     "dossier": "a2025-601-101-gr00001",
     "statut": "verse",
     "source": "application (IndexedDB)",
     "date_versement": "2026-04-26T15:30:00.000Z",
     "appareil": "Mac — Safari",
     "application_version": "Beta 99.11",
     "contenu": {
       "donnees": true,
       "travaux": true,
       "nombre_etudiants": 25,
       "nombre_cles": 42,
       "nombre_fichiers_travaux": 187,
       "nombre_fichiers_manquants": 0,
       "taille_donnees_json": 2100000,
       "taille_travaux_totale": 206000000
     },
     "notes": "Versement automatique depuis l'application."
   }

7. GÉNÉRATION DU manifeste-reserve-patch.json
   Ce fichier contient les informations à reporter manuellement (ou par un
   futur outil) dans le manifeste-reserve.json global de la réserve.
   
   {
     "dossier": "a2025-601-101-gr00001",
     "patch": {
       "uuid": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
       "trimestre": "a2025",
       "cours": "601-101-MQ",
       "groupe": "00001",
       "statut": "verse",
       "source": "application (IndexedDB)",
       "date_versement": "2026-04-26T15:30:00.000Z",
       "donnees": true,
       "travaux": true,
       "nombre_etudiants": 25,
       "notes": "Versement du 26 avril 2026."
     }
   }

8. COMPRESSION ET TÉLÉCHARGEMENT
   - Compression DEFLATE niveau 6
   - Nom du fichier : CONFIDENTIEL-versement-{trimestre}-{cours}-gr{groupe}-{AAAA-MM-JJ}.reserve.zip
   - Exemple : CONFIDENTIEL-versement-a2025-601-101-gr00001-2026-04-26.reserve.zip
   - Téléchargement via <a download> (même pattern que codex.js)

9. NOTIFICATION
   - Afficher un résumé : groupe-cours, nombre d'étudiants, nombre de fichiers, taille
   - Rappeler à l'utilisateur : « Décompresse ce fichier dans
     ~/Documents/Réserve_LaboCodex/ pour compléter le versement. »
```

### 2.2 `Reserve.estimerVersement(trimestre, groupeCoursId)`

Fonction utilitaire. Estime la taille du versement avant de le lancer.
Utilisée par l'UI pour afficher une estimation à l'utilisateur.

**Paramètres** :
- `trimestre` (string) : identifiant du trimestre
- `groupeCoursId` (string) : identifiant du groupe-cours

**Retour** : `Promise<{ nombreCles: number, nombreEtudiants: number, nombreFichiers: number, tailleEstimee: number }>`

**Logique** :
- Même collecte et filtrage par groupe qu'aux étapes 2-4 de verserGroupeCours, mais sans lire les blobs
- Pour les blobs, utiliser les tailles des métadonnées (fichiersTravaux[].tailleFichier)
  si disponibles, sinon compter le nombre de fichiers × taille moyenne estimée

### 2.3 `Reserve.listerGroupesVersables(trimestre)`

Fonction utilitaire. Liste les groupes-cours disponibles pour un trimestre donné.
Utilisée par le dialogue de versement pour afficher les choix.

**Paramètre** :
- `trimestre` (string) : identifiant du trimestre (optionnel — si omis, lister pour le trimestre actif)

**Retour** : `Array<{ id: string, coursId: string, cours: string, groupe: string, dossier: string }>`

**Logique** :
- Lire `listeCours` depuis IndexedDB
- Filtrer les cours qui ont des données dans le trimestre spécifié
- Pour chaque cours, extraire les groupes distincts
- Construire le nom de dossier `{trimestre}-{cours}-gr{groupe}` pour chaque

---

## 3. Identification et filtrage des clés par groupe-cours

### 3.1 Principe : filtrage en deux passes

Dans IndexedDB, les données d'un trimestre contiennent **tous les groupes
mélangés** sous le même préfixe (`a2025_groupeEtudiants` contient les étudiants
de tous les groupes du trimestre). Le versement doit isoler un seul groupe.

**Passe 1** — collecter toutes les clés préfixées `{trimestre}_`
**Passe 2** — filtrer le contenu de chaque clé pour ne garder que les
données du `groupeCoursId` ciblé.

### 3.2 Clés namespacées et règles de filtrage

Le namespacing utilise `window.cle('nomCle')` qui retourne `{trimestre}_{nomCle}`.
Ne PAS coder en dur la liste — filtrer `db.keys()` par le préfixe `{trimestre}_`.

Règles de filtrage par groupe pour les clés connues :

```
{trimestre}_groupeEtudiants
  → Filtrer : garder uniquement les étudiants dont le champ `groupe`
    correspond au groupe ciblé (utiliser normaliserGroupe() pour comparer).
  → Stocker la liste des DA résultante pour filtrer les clés suivantes.

{trimestre}_presences
  → Filtrer par DA : ne garder que les entrées dont le DA est dans la liste.

{trimestre}_evaluationsSauvegardees
  → Filtrer par DA.

{trimestre}_fichiersTravaux
  → Filtrer par groupeCoursId dans les métadonnées de chaque fichier.
    Chaque entrée porte un champ `groupeCoursId` depuis Beta 98.
    Les fichiers sans groupeCoursId (pré-Beta 98) sont EXCLUS avec un warning.

{trimestre}_snapshots
  → Filtrer par groupeCoursId (clé de premier niveau dans l'objet snapshots).
    Seul le sous-objet du groupe ciblé est conservé.

{trimestre}_interventions
  → Filtrer par DA.

{trimestre}_productions
  → Pas de filtre (les productions sont partagées entre groupes du même cours).

{trimestre}_seances
  → Pas de filtre (les séances sont partagées).

{trimestre}_objectifs
  → Pas de filtre.

{trimestre}_objectifsAssignes
  → Filtrer par DA si le format le permet, sinon pas de filtre.
```

**Clés inconnues** : toute clé `{trimestre}_xxx` non listée ci-dessus est
incluse sans filtre (sécurité pour les futures clés). Documenter avec un
warning console le nom de la clé non reconnue.

### 3.3 Clés globales (non namespacées)

Certaines clés ne sont pas préfixées mais sont nécessaires au contexte :

```
listeCours                    # Définitions des cours
grillesTemplates              # Bibliothèque de grilles
echellesTemplates             # Bibliothèque d'échelles
pratiquesConfigurables        # Pratiques de notation
modalitesEvaluation           # Paramètres d'évaluation
infoCours                     # Informations du cours (enseignant, etc.)
cartouches_{grilleId}         # Cartouches par grille (pattern dynamique)
```

**Méthode de collecte** : inclure ces clés si elles existent. Pour les
cartouches, scanner `db.keys()` pour les clés commençant par `cartouches_`.
Ces clés ne sont PAS filtrées par groupe (elles sont globales).

### 3.4 Clés exclues

Ne PAS inclure dans le versement :

```
_codex_*                      # État interne du codex
_codex_hist_*                 # Historique TimeMachine
_codex_snapshot_avant         # Snapshot de comparaison
groupeCoursActif              # État de session (pas de donnée persistante)
theme                         # Préférence d'affichage
tourGuide*                    # État du guide interactif
demo_*                        # Données de démonstration
```

### 3.5 Identification du groupe dans les données

L'application utilise plusieurs chemins pour identifier un groupe-cours :

- `groupeCoursActif` (clé globale, non namespacée) : objet avec `id`, `coursId`,
  `groupe`, `nom`. Le champ `id` est l'identifiant unique du groupe-cours.
- `infoCours._groupeCoursId` : même identifiant, synchronisé. C'est le plus fiable
  (voir `snapshots.js` ligne 74-83).
- `groupeEtudiants[].groupe` : numéro de groupe dans la fiche étudiant (ex. `'00001'`).
  Comparé via `normaliserGroupe()` dans `modes.js`.
- `fichiersTravaux[].groupeCoursId` : tag sur chaque blob depuis Beta 98.

Le paramètre `groupeCoursId` passé à `verserGroupeCours()` correspond à
`groupeCoursActif.id` / `infoCours._groupeCoursId`.

---

## 4. Filtrage des données de démonstration

Avant le versement, les données démo doivent être exclues.
Réutiliser les fonctions existantes de `import-export.js` :

- `estRessourceDemo(ressource, type)` — détecte les ressources démo
- `filtrerRessourcesNonDemo(ressources, type)` — filtre un tableau

**Attention** : ces fonctions sont dans le scope IIFE de `import-export.js`.
Elles ne sont pas exportées vers `window`.

**Solution** : soit les exporter vers window dans `import-export.js`
(préféré — pas de duplication), soit les déplacer vers un module utilitaire
partagé. Décision à prendre par Claude Code, mais NE PAS dupliquer le code.

---

## 5. Barre de progression

Le versement peut prendre du temps (centaines de blobs). Réutiliser le
même système de progression que `codex.js` :

- `_afficherProgression(titre)`
- `_majProgression(pourcentage, message, detail)`
- `_masquerProgression()`

Ces fonctions sont dans le scope IIFE de `codex.js`. Elles affichent
l'overlay modal de progression (id `codex-progression` dans index.html).

**Solution** : extraire ces fonctions vers un module utilitaire partagé
(ex. `js/progression-ui.js`) ou les rendre accessibles via `window`.
La décision revient à Claude Code, mais l'important est de ne pas
dupliquer le code HTML/CSS de l'overlay.

---

## 6. Intégration dans l'interface utilisateur

### 6.1 Menu Codex (entête)

Ajouter un nouveau bouton dans le menu Codex (`#codex-menu` dans index.html) :

```
Position : après « Exporter une sélection... », avant le séparateur final.

Bouton :
  Icône : icon-archive.svg (ou icon similaire existant dans icons/)
  Texte : « Verser dans la réserve... »
  Action : data-action="Reserve.actionVerser"
  Visibilité : toujours visible (pas besoin qu'un codex soit actif)
```

### 6.2 Dialogue de versement

Quand l'utilisateur clique « Verser dans la réserve... » :

```
Étape 1 — Choix du trimestre et du groupe-cours
  - Liste des trimestres détectés dans IndexedDB
  - Pour chaque trimestre : liste des groupes-cours disponibles
    (via Reserve.listerGroupesVersables)
  - Chaque groupe affiche : code du cours, numéro de groupe, nombre d'étudiants,
    estimation de taille
  - Présélectionner le groupe-cours actif
  - L'utilisateur peut verser un groupe à la fois
  - Bouton « Verser ce groupe » pour lancer

Étape 2 — Progression
  - Overlay de progression (réutiliser le système existant)
  - Phases : Filtrage par groupe → Collecte des données → Collecte des travaux
    → Compression → Téléchargement

Étape 3 — Confirmation
  - Notification de succès avec résumé (groupe, étudiants, fichiers, taille, UUID)
  - Message : « Décompresse le fichier téléchargé dans
    ~/Documents/Réserve_LaboCodex/ pour compléter le versement. »
  - Si le trimestre a d'autres groupes non encore versés, proposer
    « Verser le prochain groupe ? »
```

### 6.3 Section Réglages (futur v1.1)

En v1, on ne modifie PAS la section « Sauvegarde et restauration » des
Réglages. Le versement est accessible uniquement via le menu Codex.

Dans une version ultérieure, on pourra ajouter une section « Réserve »
dans les Réglages qui affiche l'état de la réserve (trimestres versés,
dates, tailles) en lisant un manifeste depuis un fichier importé.

---

## 7. Gestion des erreurs

### 7.1 Erreurs bloquantes (interrompent le versement)

| Erreur                          | Message utilisateur                                |
|---------------------------------|----------------------------------------------------|
| JSZip non disponible            | « Erreur : bibliothèque de compression non chargée. » |
| Trimestre inexistant            | « Aucune donnée trouvée pour le trimestre {id}. »  |
| Erreur lecture IndexedDB        | « Erreur de lecture des données. Réessaye. »       |
| Erreur génération ZIP           | « Erreur lors de la création du fichier d'archive. » |

### 7.2 Erreurs non bloquantes (warnings, versement continue)

| Situation                       | Comportement                                       |
|---------------------------------|----------------------------------------------------|
| Blob travail manquant           | Warning console + compté dans meta.json (nombre_fichiers_manquants). Le versement continue. |
| Clé globale absente             | Ignorée silencieusement (clé optionnelle).         |

### 7.3 Pattern de gestion d'erreur

```javascript
// Utiliser try/catch avec messages explicites
// Jamais de console.log (CLAUDE.md interdit) — console.warn ou console.error uniquement
try {
    // ...
} catch (err) {
    console.error('[Réserve] Erreur versement:', err);
    if (typeof afficherNotificationErreur === 'function') {
        afficherNotificationErreur('Erreur de versement', err.message);
    }
}
```

---

## 8. Sécurité

### 8.1 Règles du projet (CLAUDE.md)

- **echapperHtml()** sur toute donnée utilisateur injectée dans innerHTML
- **Zéro handler inline** — utiliser data-action
- **console.log interdit** — console.warn / console.error uniquement
- **Filtrage des données démo** avant versement

### 8.2 Données personnelles

Le ZIP de versement contient des données personnelles d'étudiants
(noms, DA, notes, présences, photos de travaux). Il doit porter un
avertissement dans le nom du fichier et dans la notification.

**Nom du fichier** : `CONFIDENTIEL-versement-{trimestre}-{cours}-gr{groupe}-{date}.reserve.zip`

**Notification post-téléchargement** :
« Ce fichier contient des données personnelles d'étudiants.
  Ne le partage pas. Conserve-le dans un emplacement sécurisé. »

---

## 9. Fichiers impactés

### Fichiers à créer

| Fichier             | Rôle                                              |
|---------------------|----------------------------------------------------|
| `js/reserve.js`     | Module de gestion de la réserve                    |

### Fichiers à modifier

| Fichier              | Modification                                       |
|----------------------|----------------------------------------------------|
| `index.html`         | Ajouter le bouton « Verser dans la réserve... » dans #codex-menu |
| `index.html`         | Ajouter le dialogue de choix du trimestre (modal)  |
| `js/import-export.js`| Exporter `estRessourceDemo` et `filtrerRessourcesNonDemo` vers window |
| `js/main.js`         | Enregistrer Reserve.actionVerser dans le dispatcher d'actions |

### Fichiers à NE PAS modifier

| Fichier              | Raison                                             |
|----------------------|----------------------------------------------------|
| `js/codex.js`        | Pas de couplage codex ↔ réserve en v1              |
| `js/config.js`       | Zone protégée (CLAUDE.md)                          |
| `js/navigation.js`   | Zone protégée (CLAUDE.md)                          |
| `js/db.js`           | Aucun changement nécessaire (API existante suffit)  |

---

## 10. Chargement du script

Ajouter `reserve.js` dans `index.html`, après `travaux-stockage.js` et
avant `codex.js` :

```html
<script src="js/reserve.js"></script>
```

Position dans l'ordre de chargement :
```
... (modules existants)
js/travaux-stockage.js
js/reserve.js            ← NOUVEAU
js/codex.js
js/import-export.js
... (modules existants)
```

Justification : `reserve.js` dépend de `db.js` et `travaux-stockage.js`
(chargés avant), mais ne dépend pas de `codex.js` ni `import-export.js`.

---

## 11. Tests de validation

Après implémentation, vérifier :

1. **Versement d'un groupe** : lancer le versement pour un groupe spécifique
   (ex. A2025 gr00001), vérifier que le ZIP contient donnees.json, meta.json,
   et le dossier travaux/ avec les blobs **de ce groupe uniquement**
2. **Isolation des données** : vérifier que `donnees.json` ne contient PAS
   les étudiants, présences ou évaluations d'un autre groupe du même trimestre
3. **Décompression** : extraire le ZIP dans ~/Documents/Réserve_LaboCodex/,
   vérifier que la structure correspond (trimestres/a2025-601-101-gr00001/donnees.json)
4. **UUID** : vérifier que meta.json contient un UUID v4 valide, et qu'un
   second versement du même groupe produit un UUID différent
5. **Données démo exclues** : vérifier que les étudiants du groupe 9999
   ne sont pas dans le donnees.json
6. **Blobs manquants** : supprimer un blob dans IndexedDB, relancer le
   versement, vérifier que le ZIP est généré avec un warning (pas d'erreur)
7. **Blobs pré-Beta 98** : fichiers sans `groupeCoursId` → exclus avec warning
8. **Fichier confidentiel** : vérifier que le nom du fichier contient
   « CONFIDENTIEL » et le nom du groupe
9. **meta.json** : vérifier que les statistiques sont correctes
   (nombre d'étudiants, nombre de clés, nombre de fichiers, tailles)
10. **Modes sombre et clair** : vérifier le dialogue de versement dans les
    deux modes
11. **Trimestre multi-groupes** : verser les deux groupes de H2026 séparément,
    vérifier que les deux ZIP sont indépendants et corrects

---

## 12. Ce qui N'EST PAS dans la v1

Pour éviter toute dette technique, ces fonctionnalités sont explicitement
reportées et ne doivent PAS être implémentées maintenant :

- Écriture directe sur disque (FSAPI) — phase ultérieure si changement de navigateur
- Purge des blobs après versement — nécessite un mécanisme de rechargement depuis la réserve
- Lecture de la réserve depuis l'application — phase ultérieure (extraction codex data)
- Section « Réserve » dans les Réglages — v1.1
- Versement des bibliothèques séparément — v1.1
- Mise à jour automatique du manifeste-reserve.json global — v1.1
- Anonymisation — phase codex data
- Voûte — phase ultérieure

---

## 13. Ajout du lot A1 (30 septembre 2026) : une archive fabriquée comme le codex

Premier lot du chantier des archives (`plans de travail/PLAN-2026-09-30-chantier-archives.md`).
Les chemins du format ne changent pas ; ce qui suit s'ajoute aux sections 2.1 (étapes 5, 6, 8 et 9).

- **Assemblage (mode fichier, Safari)** : les copies ne passent plus par JSZip. Elles sont
  rangées telles quelles (STORE) et par référence, par `FichierSortant.assemblerZip`
  (`js/fichier-sortant.js`), la pièce du lot J0 du codex. Seuls les textes (`donnees.json`,
  `meta.json`, le patch, le manifeste) sont compressés par JSZip. `reserve.js` ne dépend
  toujours pas de `codex.js` : les deux dépendent de `fichier-sortant.js`.
- **Une empreinte par copie**, dans les deux modes (fichier et dossier) :
  `meta.json` → `integrite.travaux_sha256`, un objet
  `{ "<id>.<ext>" : "<SHA-256 en hexadécimal>" }` dont chaque clé est le nom du fichier
  sous `travaux/`. Il vaut `null` si `crypto.subtle` est indisponible. Un lecteur d'avant
  le lot ignore ce champ. Chaque copie est lue une à la fois pour son empreinte.
- **Écriture (mode fichier)** : l'adresse du fichier n'est libérée qu'après cinq minutes
  (`FichierSortant.telecharger`), et la réussite n'est plus annoncée d'office : l'usager
  confirme que le fichier est là (« Il y est »). L'archive n'entre au registre local
  (`_manifesteReserve`) qu'après cette confirmation.
- **Mode dossier (Chrome, Edge)** : seule l'empreinte par copie s'ajoute.

Sentinelle : `tests/unit/sentinelle-lot-A1-archive-sans-copier.test.js`.

---

## Historique du document

| Date       | Changement                                                    |
|------------|---------------------------------------------------------------|
| 2026-04-26 | Création. Spécification complète v1 validée en session Cowork. |
| 2026-04-26 | Granularité par groupe-cours : API `verserGroupeCours(trimestre, groupeCoursId)` remplace `verserTrimestre(trimestre)`. UUID v4 par versement. Filtrage en deux passes (trimestre puis groupe). Convention de nommage `{trimestre}-{cours}-gr{groupe}`. Ajout `listerGroupesVersables()`. Tests mis à jour. |
| 2026-09-30 | Lot A1 du chantier des archives : section 13 (assemblage sans copier les copies, empreinte par copie, confirmation par l'usager). |
