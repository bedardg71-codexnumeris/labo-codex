# Écosystème des données — Codex, Archives, Voûte

> **Document fondateur** — 26 avril 2026
> Décrit l'architecture cible pour la gestion des données dans Labo Codex.
> Ce document est la référence pour quiconque touche au système de données.

---

## Contexte et problème

L'application gère des données volumineuses : données structurées (présences,
évaluations, indices, snapshots) et fichiers travaux (photos de productions
manuscrites, PDF). Pour un trimestre typique — 2 groupes de 25 étudiants,
10 productions de 2-3 photos chacune — les travaux seuls pèsent ~1 Go.

Jusqu'ici, deux mécanismes coexistaient sans distinction claire :

- **« Exporter les données »** — sauvegarde sélective par clés (JSON ou ZIP)
- **« Enregistrer le codex »** — espace de travail portable (ZIP compressé)

Les deux tentaient de tout faire : backup, portabilité, archivage. Résultat :
fichiers de 800 Mo à 1.7 Go, iPad saturé, confusion entre les deux, historique
TimeMachine invisible qui doublait la taille du codex.

Ce document pose une architecture à **quatre concepts** séparés, chacun avec
une vocation, un format et un cycle de vie propres.

---

## Les quatre concepts

### 1. Codex

**Vocation** : espace de travail actif du trimestre courant.

Le codex est ce que l'enseignant ouvre le matin et enregistre sur sa clé USB
en fin de semaine. Il contient un seul trimestre avec ses données structurées,
ses fichiers travaux (photos, PDF) et un manifeste.

| Propriété         | Valeur                                      |
|-------------------|---------------------------------------------|
| Portée            | 1 trimestre                                 |
| Contenu           | Données structurées + travaux (blobs)       |
| Format            | `.codex.zip` (DEFLATE niveau 6)             |
| Taille attendue   | 400–800 Mo (selon le volume de travaux)     |
| Fréquence         | 1×/semaine (après saisie des présences ou import des travaux) |
| Destination       | Clé USB, Mac, iPad (à terme)               |
| Historique        | Non (retiré du codex — vit dans les archives) |

**Verbes** : *ouvrir, enregistrer, enregistrer sous*.

**Ce qui change par rapport à l'existant** :
- Le TimeMachine (jusqu'à 10 snapshots complets) est retiré du codex.
  Économie estimée : 400–800 Mo par codex.
- Le codex reste sinon identique dans sa mécanique.

---

### 2. Archives

**Vocation** : archive personnelle locale. Rien n'y est jamais détruit.

Les archives est le coffre-fort de l'enseignant. Elle accumule les données
trimestre après trimestre. C'est la source de vérité absolue, celle qui
permet de reconstruire n'importe quoi dans le futur.

**Double fonction** — dans le vocabulaire bibliothécaire (codex,
bibliothèque, archives, voûte), les archives joue deux rôles distincts :

1. **Dépôt** — geste d'archivage en fin de trimestre. Le groupe-cours
   terminé entre dans les archives une fois pour toutes. C'est ce que fait
   `Reserve.verserGroupeCours()` (v1, livré).
2. **Fonds consultable** — les archives n'est pas un cimetière. C'est un
   fonds que l'enseignant peut interroger : *réimporter* une grille
   d'un trimestre passé pour l'adapter, *ouvrir une archive* en lecture
   seule pour une démo ou une formation, *extraire* un codex data pour
   l'analyse longitudinale au Labo.

La voie de retour archives → application est aussi importante que la voie
d'aller. Sans elle, les archives ne serait qu'un cimetière de ZIP. Les
mécanismes de cette voie de retour sont décrits dans les items #254
(réimport sélectif et ouverture d'une archive) et #251 (extraction
codex data) du backlog.

| Propriété         | Valeur                                      |
|-------------------|---------------------------------------------|
| Portée            | Tous les trimestres, tout l'historique      |
| Contenu           | Données + travaux + bibliothèques + instantanés |
| Format            | Répertoire structuré sur disque (pas un ZIP) |
| Taille attendue   | 2–5 Go au fil des trimestres (croissante)   |
| Fréquence         | Archivage en fin de trimestre + sauvegardes ponctuelles |
| Destination       | Mac, disque externe, iCloud                 |

**Verbes** :
- *archiver* (codex → archives, dépôt en fin de trimestre)
- *réimporter* (archives → bibliothèques actives, copie d'une ressource)
- *ouvrir une archive* (archives → namespace temporaire en lecture seule)
- *extraire* (archives → codex data, pour le Labo)

**Granularité** : les archives sont organisées par **groupe-cours**, pas par trimestre.
Un même trimestre peut contenir plusieurs groupes (ex. gr00002 et gr00008 en H2026),
et un utilisateur pourrait vouloir comparer un groupe PAN et un groupe témoin.
Chaque dossier d’archive isole un seul groupe-cours.

**Identité et UUID** : chaque archive reçoit un UUID v4 unique (champ `uuid`
dans `meta.json`). Cet identifiant prévient les collisions lorsque des données
de plusieurs utilisateurs ou institutions convergent vers la Voûte. Le
nommage `a2025` ou le numéro de groupe `00001` n'est pas unique à l'échelle
du réseau — l'UUID l'est.

**Structure sur disque** :

```
Archives_LaboCodex/
├── manifeste-archives.json          # Index global (archives, dates, tailles)
├── trimestres/
│   ├── a2025-601-101-gr00001/      # {trimestre}-{cours}-gr{groupe}
│   │   ├── donnees.json            # Clés du trimestre filtrées pour CE groupe
│   │   ├── travaux/                # Blobs (photos, PDF) de CE groupe
│   │   │   ├── abc123.jpg
│   │   │   └── def456.pdf
│   │   └── meta.json               # UUID, date d’archivage, appareil, version app
│   ├── h2026-601-101-gr00002/
│   │   ├── donnees.json
│   │   ├── travaux/
│   │   └── meta.json
│   ├── h2026-601-101-gr00008/
│   │   ├── donnees.json
│   │   ├── travaux/
│   │   └── meta.json
│   └── ...
├── bibliotheques/
│   ├── grilles.json                # Grilles d'évaluation
│   ├── echelles.json               # Échelles descriptives
│   ├── productions.json            # Gabarits de productions
│   └── cartouches/                 # Cartouches par grille
│       └── grille-xxx.json
├── instantanes/                    # Ex-TimeMachine (optionnel)
│   ├── 2026-04-20-MacBook.json
│   ├── 2026-04-13-MacBook.json
│   └── index.json                  # Index daté des instantanés
└── README.txt                      # Explication lisible pour un humain
```

**Convention de nommage des dossiers** :
`{trimestre}-{cours}-gr{groupe}` — ex. `a2025-601-101-gr00001`.
Le code du cours omet le suffixe de discipline (`-MQ`) pour rester court.
Si un trimestre n'a pas d'enseignement (H2025 par exemple), aucun dossier
n'est créé.

**Exemple concret** (données de Grégoire) :
```
trimestres/
├── a2024-601-101-gr00001/
├── a2024-601-101-gr00002/
├── h2024-601-101-gr00004/
├── h2024-601-101-gr00005/
├── a2025-601-101-gr00001/
├── h2026-601-101-gr00002/
└── h2026-601-101-gr00008/
```
(H2025 absent : pas d'enseignement ce trimestre.)

**Principes** :
- Les archives sont un répertoire, pas un ZIP. On peut y naviguer, vérifier
  ce qu'elle contient, copier un fichier isolé si besoin.
- Les instantanés (ex-TimeMachine) y vivent s'ils sont activés.
  Ils ne gonflent plus le codex de travail.
- Le manifeste global (`manifeste-archives.json`) permet à l'application
  de lister les archives disponibles, leurs tailles, leurs dates.
- Les archives sert aussi de backup pour le développement — elle contient
  l'intégralité des données.
- Chaque `meta.json` porte un UUID v4 unique. Cet UUID identifie le
  archive de façon non ambiguë, même si le nommage du dossier
  (trimestre + cours + groupe) pourrait être identique chez un autre
  utilisateur. C'est l'UUID qui servira de clé primaire dans la Voûte.

**Ce qui change par rapport à l'existant** :
- Remplace « Exporter les données » (sauvegarde sélective des Réglages).
- Devient un objet explicite dans l'application — pas juste un export ponctuel.
- L'application sait lire les archives, y archiver un trimestre, en extraire
  des données.

---

### 3. Codex data

**Vocation** : format léger pour la recherche et l'analyse longitudinale.

Le codex data est un extrait de les archives, sans blobs, destiné au Labo.
Il peut combiner plusieurs trimestres, être anonymisé, être partagé.

| Propriété         | Valeur                                      |
|-------------------|---------------------------------------------|
| Portée            | 1 ou N trimestres combinés                  |
| Contenu           | Données structurées seules (pas de blobs)   |
| Format            | `.codex-data.json` (JSON compressible)      |
| Taille attendue   | 5–30 Mo                                     |
| Fréquence         | En fin de trimestre, ou sur demande         |
| Destination       | Labo (lecture seule), voûte (si anonymisé)  |

**Verbes** : *extraire* (archives → codex data), *charger* (codex data → Labo),
*anonymiser* (optionnel, avant partage).

**Structure du fichier** :

```json
{
  "format": "codex-data",
  "version": 1,
  "metadata": {
    "auteur": "Grégoire",
    "date_extraction": "2026-04-26",
    "archives": [
      { "uuid": "f47ac10b-...", "dossier": "a2025-601-101-gr00001" },
      { "uuid": "7c9e6679-...", "dossier": "h2026-601-101-gr00002" }
    ],
    "anonymise": false,
    "application_version": "Beta 99.11",
    "description": "Données longitudinales — 601-101 gr00001 (A2025) + gr00002 (H2026)"
  },
  "groupes": {
    "a2025-601-101-gr00001": {
      "uuid": "f47ac10b-...",
      "groupeEtudiants": [...],
      "presences": [...],
      "evaluationsSauvegardees": [...],
      "snapshots": {...}
    },
    "h2026-601-101-gr00002": {
      "uuid": "7c9e6679-...",
      "groupeEtudiants": [...],
      "presences": [...],
      "evaluationsSauvegardees": [...],
      "snapshots": {...}
    }
  },
  "bibliotheques": {
    "grilles": [...],
    "echelles": [...],
    "productions": [...]
  }
}
```

Note : la clé de regroupement est passée de `trimestres` à `groupes` pour
refléter la granularité réelle. Chaque entrée correspond à une archive
de les archives (un groupe-cours d'un trimestre), identifié par son UUID.
```

**Anonymisation** :
- Remplacement des noms/prénoms par des identifiants (Étudiant-001, etc.)
- Retrait des DA (numéros d'admission)
- Conservation des indices, résultats, présences (données de recherche)
- L'anonymisation est irréversible — elle se fait sur la copie, jamais
  sur les archives

**Ce qui change par rapport à l'existant** :
- Concept nouveau. N'existe pas encore dans l'application.
- Le Labo (actuellement dans la section Suivi) deviendrait le consommateur
  principal de ce format.

---

### 4. Voûte

**Vocation** : bibliothèque partagée entre enseignants.

La voûte est un espace collectif où les enseignants déposent et empruntent
des ressources pédagogiques et des données de recherche. Chaque utilisateur
travaille localement — la voûte ne reçoit que des copies préparées pour
le partage.

| Propriété         | Valeur                                      |
|-------------------|---------------------------------------------|
| Portée            | Multi-utilisateurs, multi-institutions      |
| Contenu           | Configurations pédagogiques, codex data anonymisés, matériel |
| Format            | À définir (fichiers JSON + métadonnées)     |
| Hébergement       | À terme : serveur institutionnel. Pour l'instant : échange de fichiers |

**Verbes** : *déposer* (archives → voûte), *emprunter* (voûte → archives ou Labo).

**Ce qu'on peut déposer dans la voûte** :

1. **Configurations pédagogiques** — ce qui s'appelle aujourd'hui
   « configuration complète » : grilles, échelles, productions, cartouches,
   paramètres de cours. Sous licence CC BY-NC-SA 4.0.

2. **Codex data anonymisés** — résultats de recherche, données longitudinales
   sans information personnelle identifiable. Permettent les comparaisons
   inter-enseignants, inter-disciplines, inter-institutions.

3. **Matériel pédagogique** — gabarits, tampons, séquences, objectifs.

**Chaque dépôt porte** :
- Auteur, discipline, niveau
- Licence (CC BY-NC-SA 4.0 par défaut)
- Description, date
- Version de l'application utilisée
- Ces métadonnées existent déjà dans le format « configuration complète »
  (Beta 91).

**Principes de la voûte** :
- Le flux est toujours *de* l'utilisateur *vers* la voûte, jamais automatique
  en sens inverse. L'enseignant décide ce qu'il dépose.
- L'anonymisation se fait *avant* le dépôt, sur la machine de l'utilisateur.
  La voûte ne voit jamais de données personnelles d'étudiants.
- Un emprunt est une copie. Modifier un emprunt ne modifie pas l'original.
- L'institution garante héberge, vérifie la conformité des dépôts
  (anonymisation, licence), et maintient l'accès. Elle ne gère pas
  les données de travail des enseignants.

**Ce qui change par rapport à l'existant** :
- La « configuration pédagogique complète » (Beta 91) est un objet
  de la voûte. Elle garde son rôle mais trouve sa place dans un système
  plus large.
- La voûte elle-même est un concept nouveau. Phase 1 : échange de fichiers.
  Phase 2+ : hébergement centralisé institutionnel.

---

## Flux et cycle de vie

### Travail quotidien (pendant le trimestre)

```
Application (IndexedDB)  ←→  Codex (clé USB)
        ouvrir / enregistrer
```

L'enseignant travaille dans l'application, enregistre son codex sur la clé
USB une fois par semaine.

### Fin de trimestre

```
Codex  →  Archives (archivage)
              │
              ├→  Codex data (extraction)  →  Labo (chargement)
              │
              └→  Voûte (dépôt, si partage souhaité)
```

1. **Archiver** le trimestre terminé dans les archives (données + travaux).
2. **Extraire** un codex data si on veut faire de la recherche.
3. **Déposer** dans la voûte si on veut partager (configuration ou données anonymisées).
4. Le codex peut être purgé des données du trimestre terminé — les originaux
   sont dans les archives.

### Voie de retour : réimport et consultation

```
Archives  →  Application (bibliothèques actives)  [réimport sélectif]
Archives  →  Application (namespace temporaire)   [ouvrir une archive, lecture seule]
```

L'enseignant ouvre un archive archivée pour :

1. **Réimporter une ressource** : récupérer une grille, une échelle, une
   production ou un cartouche d'un trimestre passé pour la réutiliser
   ou l'adapter dans le trimestre actif. Sélection multiple, copie vers
   les bibliothèques actives. L’archive original reste figé.
2. **Consulter en lecture seule** : ouvrir une archive (ex. pour une
   démo, une formation collègue, une séance AQPC, un retour réflexif).
   Les données chargées vivent dans un namespace isolé (ex.
   `__archive_a2025_*`), aucune écriture vers les archives ou le trimestre
   actif n'est possible.

Mécanisme détaillé : item #254 du backlog.

### Recherche (Labo)

```
Archives  →  Codex data  →  Labo (lecture seule)
Voûte    →  Codex data  →  Labo (lecture seule)
```

Le Labo charge un ou plusieurs codex data — issus de les archives personnelle
ou empruntés de la voûte — sans écraser le trimestre courant dans l'application.

### Emprunt depuis la voûte

```
Voûte  →  Archives locales (copie)
       →  Labo (chargement direct)
```

Un collègue emprunte une configuration pédagogique ou un codex data anonymisé.
La copie arrive dans ses archives ou directement dans son Labo.

---

## Vocabulaire de référence

| Concept       | Définition                                                    |
|---------------|---------------------------------------------------------------|
| **Codex**     | Espace de travail actif d'un trimestre. Portable (clé USB).   |
| **Archives**   | Archive personnelle locale, à double fonction : **dépôt** (archivage en fin de trimestre) et **fonds consultable** (réimport de ressources, ouverture d'une archive, extraction codex data). Jamais purgée. |
| **Codex data**| Extrait léger (sans blobs) pour la recherche. Multi-trimestres. |
| **Voûte**     | Bibliothèque partagée entre enseignants.                      |
| **Labo**      | Espace de recherche dans l'application. Charge des codex data. |

| Verbe         | Signification                                                 |
|---------------|---------------------------------------------------------------|
| **Ouvrir**    | Charger un codex dans l'application pour travailler.          |
| **Enregistrer** | Sauvegarder le codex sur la clé USB.                       |
| **Archiver**    | Archiver un groupe-cours dans les archives (fin de trimestre, dépôt). |
| **Clore**     | Figer un trimestre terminé en lecture seule, dans l'application (bibliothèque des trimestres). Ne dépose rien et ne libère aucun espace. |
| **Rouvrir**   | Remettre un trimestre clos en mode édition. |
| **Réimporter**| Recopier une ressource d'une archive (grille, échelle, production, cartouche, tampon) vers les bibliothèques actives de l'application. |
| **Ouvrir une archive** | Charger une archive de les archives en namespace temporaire (lecture seule) pour démo, formation ou consultation, sans toucher au trimestre actif. |
| **Extraire**  | Créer un codex data à partir d'un ou plusieurs archives de les archives. |
| **Charger**   | Importer un codex data dans le Labo (lecture seule).          |
| **Anonymiser**| Retirer les données personnelles d'un codex data avant partage. |
| **Déposer**   | Publier dans la voûte (configuration ou codex data anonymisé). |
| **Emprunter** | Copier depuis la voûte vers ses archives ou son Labo.           |

**« Clos » et « archivé » ne se confondent pas** (Grégoire, 30 sept. 2026 ; lot A5, #1002) :
un trimestre **clos** est gelé en lecture seule dans l'application ; un groupe-cours
**archivé** est déposé hors du navigateur, dans les Archives, et vérifié. Les noms
internes de l'état clos gardent leur ancien mot (`archiverTrimestre`, `trimestre.archive`,
`mode-archive`) ; seuls les textes lus par l'usager ont changé.

**Terme retiré** : « sauvegarde ». Trop ambigu — remplacé par les verbes
spécifiques ci-dessus.

---

## Termes retirés ou renommés

| Ancien terme                       | Nouveau terme / statut              |
|------------------------------------|-------------------------------------|
| « Exporter les données »           | → **Archiver** dans les archives      |
| « Importer des données »           | → **Ouvrir** un codex ou **charger** un codex data |
| « Sauvegarde et restauration »     | → Section **Archives** dans les Réglages |
| « Configuration pédagogique complète » | → **Dépôt** dans la voûte (type : configuration) |
| « TimeMachine / Historique des versions » | → **Instantanés** dans les archives |
| « Labo » (sous-section de Suivi)   | → **Labo** (section dédiée, autonome) |
| « Archiver » / « Désarchiver » un trimestre | → **Clore** / **Rouvrir** (1.182.0, #1002) |

---

## Contraintes techniques

- **iPad (Safari)** : quota IndexedDB ~1 Go par origin. Le codex léger
  (sans TimeMachine) devrait y rentrer. Les codex data (~5-30 Mo) passent
  sans problème.
- **Blobs incompressibles** : les photos (JPEG) et PDF sont déjà compressés.
  DEFLATE n'y gagne rien. Le poids des travaux est incompressible.
- **JSON très compressible** : les données structurées se compressent
  en 5:1 à 10:1 avec DEFLATE. Important pour les archives et les sauvegardes.
- **File System Access API** : disponible sur Mac (Chrome/Edge), pas sur
  Safari/iPad. Les archives comme répertoire sur disque nécessite soit FSAPI,
  soit un mécanisme d'export/import par fichier.
- **Fonctionnement hors-ligne** : tout reste local. La voûte (serveur)
  est le seul composant qui nécessitera éventuellement une connexion.

---

## Priorités d'implémentation

1. **Codex allégé** — retirer le TimeMachine du codex. Gain immédiat.
2. ~~**Compression de l'export données** — ajouter DEFLATE à `executerExport()`.~~
   Sans objet depuis le lot I bis (30 sept. 2026) : cet export (la fenêtre des clés
   de Réglages › Données) est retiré, l'application ne fabrique plus que le codex.
   Un fichier déjà fait s'ouvre toujours.
3. **Archives** — structure de répertoire, archivage, consultation.
4. **Codex data** — extraction depuis les archives, format JSON.
5. **Labo autonome** — sortir le Labo de la section Suivi, lui permettre
   de charger des codex data.
6. **Anonymisation** — dans le flux d'extraction du codex data.
7. **Voûte** — format de dépôt, mécanisme d'emprunt. D'abord par fichiers,
   puis serveur institutionnel.

---

## Historique du document

| Date       | Changement                                      |
|------------|--------------------------------------------------|
| 2026-04-26 | Création. Définition des 4 concepts, vocabulaire, flux, structure archives. |
| 2026-04-26 | Ajout granularité par groupe-cours, UUID par archive, convention de nommage `{trimestre}-{cours}-gr{groupe}`. Codex data : clé `groupes` remplace `trimestres`. |
| 2026-04-26 | Clarification de la double fonction de les Archives (dépôt + fonds consultable). Ajout des verbes *réimporter* et *ouvrir une archive* au tableau de référence. Nouveau sous-flux « Voie de retour » liant ces verbes aux items #254 (mécanisme) et #251 (codex data). |
| 2026-10-04 | Vocabulaire de l'état gelé (#1002, lot A5) : *clore* et *rouvrir* un trimestre, distincts d'*archiver* un groupe-cours. |
